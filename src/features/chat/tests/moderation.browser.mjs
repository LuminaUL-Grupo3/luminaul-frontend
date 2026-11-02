import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

/** Prueba SPEC04 + SPEC06 + SPEC07 reales: sin reemplazar HTTP, eventos ni decisiones por mocks. */
export async function runModerationBrowser({ web, password, db, request, login, createGroup, addMember, connect, command, output }) {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
  const contexts = [], ids = [], errors = [], dialogs = [], results = [], sockets = [];
  let group, lastPage;

  /** Los únicos fixtures elevados se crean directamente en la base exclusiva de test, nunca en la API. */
  async function account(name, role = "student") {
    const id = randomUUID(), email = `spec04.workflow.${id}@aloe.ulima.edu.pe`;
    const inserted = await db.query(`INSERT INTO users(id,email,password_hash,name,role,status,is_verified,tokens_valid_after)
      SELECT $1,$2,password_hash,$3,$4,'active',true,NOW()-INTERVAL '1 second'
      FROM users WHERE email='spec04.lider@aloe.ulima.edu.pe' RETURNING id`, [id, email, name, role]);
    assert.equal(inserted.rowCount, 1);
    ids.push(id);
    await db.query('INSERT INTO profiles(user_id,name) VALUES($1,$2)', [id, name]);
    return login(email);
  }

  /** Cada persona utiliza un contexto independiente y el formulario de sesión del equipo. */
  async function pageFor(user, path) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    contexts.push(context);
    const page = await context.newPage();
    lastPage = page;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", async (dialog) => { dialogs.push(dialog.type()); await dialog.dismiss(); });
    await page.goto(web + "/login");
    await page.getByLabel("Correo institucional").fill(user.email);
    await page.locator('input[autocomplete="current-password"]').fill(password);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await expect(page).toHaveURL(web + "/");
    await page.goto(web + path);
    if (path.startsWith("/mensajes/")) await expect(page.locator(".chat-status")).toContainText("conectada");
    return page;
  }

  /** Envía desde el compositor y conserva el identificador confirmado por el servidor. */
  async function send(page, text) {
    await page.getByRole("textbox", { name: "Mensaje", exact: true }).fill(text);
    await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
    await expect.poll(async () => {
      const found = await db.query('SELECT id FROM group_messages WHERE group_id=$1 AND content=$2', [group.id, text]);
      return found.rows.length;
    }).toBe(1);
    return (await db.query('SELECT id FROM group_messages WHERE group_id=$1 AND content=$2', [group.id, text])).rows[0].id;
  }
  const row = (page, id) => page.locator(`[data-message-id="${id}"]`);

  try {
    const author = await account("Autor de integración"), reader = await account("Compañero de integración"),
      outsider = await account("Usuario externo"), admin = await account("Administrador de integración", "admin");
    group = await createGroup(author, "Integración de moderación " + randomUUID());
    await addMember(group, author, reader);
    const authorPage = await pageFor(author, `/mensajes/${group.id}`),
      readerPage = await pageFor(reader, `/mensajes/${group.id}`), adminPage = await pageFor(admin, "/admin");

    const text = "En el taller analizamos cómo identificar spam.";
    const messageId = await send(authorPage, text);
    for (const page of [authorPage, readerPage]) {
      await expect(row(page, messageId).locator(".bubble > p")).toHaveText("Mensaje oculto por moderación.");
      await expect(row(page, messageId).getByRole("button", { name: "Reportar contenido" })).toHaveCount(0);
    }
    await expect.poll(async () => (await request("/moderation/my-logs", "GET", undefined, author.token)).data
      .filter((log) => log.contentId === messageId).length).toBe(1);
    const log = (await request("/moderation/my-logs", "GET", undefined, author.token)).data.find((value) => value.contentId === messageId);
    assert.deepEqual(log.detectedWords, ["spam"]);
    assert.equal((await request("/moderation/appeals", "POST", { moderationLogId: log.id, justification: "No soy el autor de este mensaje." }, reader.token)).status, 403);
    results.push("SPEC06 real: el filtro oculta el mensaje por sockets, crea un único registro y protege la apelación por autor");

    await authorPage.goto(web + "/moderacion");
    const logCard = authorPage.locator("article.panel").filter({ hasText: text });
    await logCard.getByRole("button", { name: "Apelar decisión", exact: true }).click();
    const appealDialog = authorPage.getByRole("dialog", { name: "Apelar moderación", exact: true });
    const justification = "El término describe un tema académico de protección de comunicaciones en el taller.";
    await appealDialog.getByLabel("Justificación").fill(justification);
    await appealDialog.getByRole("button", { name: "Enviar apelación", exact: true }).click();
    await expect(appealDialog).toHaveCount(0);
    const appeals = await request("/admin/appeals", "GET", undefined, admin.token);
    assert.equal(appeals.status, 200);
    const appeal = appeals.data.items.find((value) => value.moderationLogId === log.id);
    assert.ok(appeal);
    assert.equal((await request(`/admin/appeals/${appeal.id}`, "PATCH", { status: "approved" }, reader.token)).status, 403);
    await authorPage.goto(web + `/mensajes/${group.id}`);
    await expect(authorPage.locator(".chat-status")).toContainText("conectada");
    await adminPage.getByRole("button", { name: "Apelaciones", exact: true }).click();
    await adminPage.locator("article.panel").filter({ hasText: justification })
      .getByRole("button", { name: "Aprobar apelación", exact: true }).click();
    await adminPage.getByRole("dialog", { name: "Aprobar apelación", exact: true })
      .getByRole("button", { name: "Aprobar apelación", exact: true }).click();
    for (const page of [authorPage, readerPage]) await expect(row(page, messageId).locator(".bubble > p")).toHaveText(text);
    assert.equal((await request(`/admin/appeals/${appeal.id}`, "PATCH", { status: "approved" }, admin.token)).status, 409);
    results.push("SPEC07 real: el administrador aprueba desde su pantalla y ambos chats recuperan el mensaje sin recargar");

    await row(readerPage, messageId).getByRole("button", { name: `Responder a ${author.name}`, exact: true }).click();
    const replyId = await send(readerPage, "Podemos revisar este ejemplo en la próxima reunión.");
    await expect(row(authorPage, replyId).locator(".spec04-quoted")).toContainText(text);
    assert.equal((await request("/moderation/reports", "POST", { targetType: "message", targetId: messageId, reason: "No pertenezco al grupo" }, outsider.token)).status, 404);
    await row(readerPage, messageId).getByRole("button", { name: "Reportar contenido", exact: true }).click();
    const reportDialog = readerPage.getByRole("dialog", { name: "Reportar mensaje", exact: true });
    await reportDialog.getByRole("button", { name: "Enviar reporte", exact: true }).click();
    await expect(reportDialog.getByRole("alert")).toContainText("Selecciona");
    await reportDialog.getByRole("combobox", { name: /Motivo/ }).selectOption("Otro motivo");
    const reason = "Solicito la revisión de este ejemplo del taller de integración.";
    await reportDialog.getByLabel("Describe el problema").fill(reason);
    await reportDialog.getByRole("button", { name: "Enviar reporte", exact: true }).click();
    await expect(reportDialog).toHaveCount(0);
    await readerPage.goto(web + "/moderacion");
    await readerPage.getByRole("button", { name: "Mis reportes", exact: true }).click();
    await expect(readerPage.locator("article.panel").filter({ hasText: reason })).toBeVisible();
    await readerPage.goto(web + `/mensajes/${group.id}`);
    await expect(readerPage.locator(".chat-status")).toContainText("conectada");
    await adminPage.getByRole("button", { name: "Historial de reportes", exact: true }).click();
    await adminPage.locator("article.panel").filter({ hasText: reason }).getByRole("button", { name: "Eliminar mensaje", exact: true }).click();
    await adminPage.getByRole("dialog").getByRole("button", { name: "Confirmar", exact: true }).click();
    for (const page of [authorPage, readerPage]) {
      await expect(row(page, messageId).locator(".bubble > p")).toHaveText("Mensaje eliminado.");
      await expect(row(page, replyId).locator(".spec04-quoted")).toContainText("Mensaje no disponible");
      await expect(page.locator(".chat-stream").getByText(text, { exact: true })).toHaveCount(0);
    }
    const history = await request(`/groups/${group.id}/messages`, "GET", undefined, reader.token);
    assert.ok(!history.data.some((message) => message.id === messageId));
    assert.equal(history.data.find((message) => message.id === replyId).replyTo.content, null);
    await expect.poll(async () => (await request("/notifications/me", "GET", undefined, author.token)).data.length).toBeGreaterThanOrEqual(3);
    const audit = await db.query('SELECT count(*)::int AS total FROM audit_logs WHERE admin_id=$1', [admin.id]);
    assert.ok(audit.rows[0].total >= 2);
    results.push("Denuncia y administración: modal de SPEC06, privacidad del grupo, historial propio, borrado instantáneo de texto/citas, notificaciones y auditoría");

    // Una nueva sanción permite comprobar dos apelaciones concurrentes sobre el mismo registro.
    const socket = await connect(author); sockets.push(socket);
    assert.equal((await command(socket, "chat:join_room", { groupId: group.id })).success, true);
    const second = await command(socket, "chat:send_message", { groupId: group.id, content: "Otro ejemplo de spam en el taller.", clientMessageId: randomUUID() });
    assert.equal(second.success, true);
    let nextLog;
    await expect.poll(async () => {
      nextLog = (await request("/moderation/my-logs", "GET", undefined, author.token)).data.find((value) => value.contentId === second.message.id);
      return Boolean(nextLog);
    }).toBe(true);
    const concurrent = await Promise.all([1, 2].map(() => request("/moderation/appeals", "POST", {
      moderationLogId: nextLog.id, justification: "Solicito una revisión del contexto académico de este ejemplo.",
    }, author.token)));
    assert.deepEqual(concurrent.map((response) => response.status).sort(), [201, 409]);
    await adminPage.screenshot({ path: resolve(output, "moderacion-administrador.png"), fullPage: true });
    await readerPage.screenshot({ path: resolve(output, "moderacion-chat.png"), fullPage: true });
    expect(errors).toEqual([]); expect(dialogs).toEqual([]);
    results.push("Concurrencia: dos apelaciones simultáneas producen una sola solicitud; navegación y decisiones sin alertas nativas");
    return results;
  } catch (error) {
    if (lastPage && !lastPage.isClosed()) await lastPage.screenshot({ path: resolve(output, "moderacion-failure.png"), fullPage: true }).catch(() => {});
    throw error;
  } finally {
    for (const socket of sockets) socket.disconnect();
    for (const context of contexts) await context.close();
    await browser.close();
    // Solo se eliminan datos de los usuarios aleatorios creados por esta prueba.
    if (ids.length) {
      await db.query('DELETE FROM reports WHERE reporter_id=ANY($1::uuid[])', [ids]);
      await db.query('DELETE FROM moderation_logs WHERE author_id=ANY($1::uuid[])', [ids]);
      await db.query('DELETE FROM audit_logs WHERE admin_id=ANY($1::uuid[])', [ids]);
      if (group) await db.query('DELETE FROM groups WHERE id=$1', [group.id]);
      await db.query('DELETE FROM users WHERE id=ANY($1::uuid[])', [ids]);
    }
  }
}

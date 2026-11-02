import { chromium, expect } from "@playwright/test";
import { resolve } from "node:path";

/** Recorre la interfaz con usuarios reales; ninguna respuesta de negocio se sustituye por mocks. */
export async function runBrowser(context) {
  const {
    web,
    password,
    leader,
    student,
    outsider,
    request,
    addMember,
    moderate,
    output,
    trackGroup,
  } = context;
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
  });
  const contexts = [],
    errors = [],
    dialogs = [],
    results = [];
  let lastPage;
  /** Cada contexto conserva sus propias cookies, igual que tres usuarios en equipos distintos. */
  async function session(user) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
    });
    contexts.push(ctx);
    const page = await ctx.newPage();
    lastPage = page;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.type());
      await dialog.dismiss();
    });
    await page.goto(web + "/login");
    await page.getByLabel("Correo institucional").fill(user.email);
    await page.locator('input[autocomplete="current-password"]').fill(password);
    await page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await expect(page).toHaveURL(web + "/");
    return { ctx, page };
  }
  /** Comprueba el estado conectado antes de intentar una interacción de chat. */
  async function openChat(page, groupId) {
    await page.goto(web + `/mensajes/${groupId}`);
    await expect(page.locator(".chat-status")).toContainText("conectada");
  }
  /** Encuentra una burbuja por su texto principal sin confundirla con una respuesta citada. */
  function messageRow(page, text) {
    return page
      .locator("[data-message-id]")
      .filter({ has: page.locator(".bubble > p").filter({ hasText: text }) });
  }
  try {
    const owner = await session(leader),
      applicant = await session(outsider),
      member = await session(student);
    const ownerPage = owner.page,
      otherPage = applicant.page;
    await ownerPage.goto(web + "/grupos");
    await ownerPage
      .getByRole("button", { name: "Crear grupo", exact: true })
      .click();
    const createDialog = ownerPage.getByRole("dialog", {
      name: "Crear grupo de estudio",
    });
    await createDialog
      .getByRole("button", { name: "Crear grupo", exact: true })
      .click();
    await expect(createDialog.getByRole("alert")).toContainText(
      "Completa el nombre",
    );
    await createDialog
      .getByLabel("Nombre del grupo", { exact: true })
      .fill("Patrones y buenas prácticas");
    await createDialog
      .getByLabel("Descripción del grupo", { exact: true })
      .fill(
        "Un espacio para repasar SOLID, compartir ejemplos y preparar las prácticas de Software II.",
      );
    await createDialog
      .getByLabel("Código del curso", { exact: true })
      .fill("ISW2");
    await createDialog
      .getByLabel("Capacidad del grupo", { exact: true })
      .fill("4");
    await createDialog
      .getByRole("button", { name: "Crear grupo", exact: true })
      .click();
    await expect(ownerPage).toHaveURL(/\/grupos\/[a-f0-9-]+$/);
    const groupId = new URL(ownerPage.url()).pathname.split("/").at(-1);
    trackGroup(groupId);
    await expect(
      ownerPage.getByRole("heading", {
        name: "Patrones y buenas prácticas",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      ownerPage.getByText("Líder del grupo", { exact: true }),
    ).toBeVisible();
    await otherPage.goto(web + "/grupos");
    await otherPage
      .getByRole("tab", { name: "Explorar grupos", exact: true })
      .click();
    await otherPage.getByLabel("Filtrar por código de curso").fill("ISW2");
    await expect(
      otherPage
        .locator(".group-card")
        .filter({ hasText: "Patrones y buenas prácticas" }),
    ).toBeVisible();
    await otherPage
      .locator(".group-card")
      .filter({ hasText: "Patrones y buenas prácticas" })
      .getByRole("link", { name: "Conocer el grupo" })
      .click();
    await otherPage
      .getByRole("button", { name: "Solicitar ingreso", exact: true })
      .click();
    await otherPage
      .getByLabel("Mensaje de presentación", { exact: true })
      .fill("Quiero repasar los patrones con el grupo.");
    await otherPage
      .getByRole("dialog")
      .getByRole("button", { name: "Enviar solicitud", exact: true })
      .click();
    await expect(
      otherPage.getByRole("dialog", { name: "Solicitud enviada" }),
    ).toBeVisible();
    await otherPage
      .getByRole("button", { name: "Entendido", exact: true })
      .click();
    await expect(
      otherPage.getByRole("button", {
        name: "Solicitud pendiente",
        exact: true,
      }),
    ).toBeDisabled();
    await ownerPage.goto(web + "/solicitudes");
    await ownerPage
      .locator(".join-request-card")
      .filter({ hasText: "Patrones y buenas prácticas" })
      .getByRole("button", {
        name: `Aceptar solicitud de ${outsider.name}`,
        exact: true,
      })
      .click();
    await expect(
      ownerPage
        .locator(".join-request-card")
        .filter({ hasText: "Patrones y buenas prácticas" }),
    ).toHaveCount(0);
    await otherPage.reload();
    await expect(
      otherPage.getByRole("link", { name: "Abrir conversación", exact: true }),
    ).toBeVisible();
    await addMember({ id: groupId }, leader, student);
    await ownerPage.goto(web + `/grupos/${groupId}`);
    await expect(
      ownerPage.getByText(student.name + " (tú)", { exact: true }),
    ).toHaveCount(0);
    await expect(
      ownerPage.getByRole("button", {
        name: `Expulsar a ${student.name}`,
        exact: true,
      }),
    ).toBeVisible();
    await ownerPage.screenshot({
      path: resolve(output, "grupo-desktop.png"),
      fullPage: true,
      animations: "disabled",
    });
    results.push(
      "Navegador: crear grupo, directorio, solicitud, modal de éxito y aprobación real",
    );

    await Promise.all([
      openChat(ownerPage, groupId),
      openChat(otherPage, groupId),
      openChat(member.page, groupId),
    ]);
    await expect(otherPage.locator(".chat-status")).toHaveText(
      /3 personas conectadas/,
    );
    const secondTab = await owner.ctx.newPage();
    await openChat(secondTab, groupId);
    await expect(otherPage.locator(".chat-status")).toHaveText(
      /3 personas conectadas/,
    );
    await secondTab.close();
    await expect(otherPage.locator(".chat-status")).toHaveText(
      /3 personas conectadas/,
    );
    await ownerPage.bringToFront();
    await ownerPage
      .getByRole("textbox", { name: "Mensaje", exact: true })
      .fill("¿Repasamos Adapter y Observer mañana a las cinco?");
    await expect(
      otherPage.getByText(`${leader.name} está escribiendo…`, { exact: true }),
    ).toBeVisible();
    const firstText = "¿Repasamos Adapter y Observer mañana a las cinco?";
    await ownerPage
      .getByRole("button", { name: "Enviar mensaje", exact: true })
      .click();
    await expect(messageRow(ownerPage, firstText)).toHaveCount(1);
    await expect(messageRow(otherPage, firstText)).toHaveCount(1);
    await otherPage.bringToFront();
    await otherPage.locator(".chat-stream").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(
      messageRow(ownerPage, firstText).locator(".spec04-read"),
    ).toContainText("Leído por");
    const firstId = await messageRow(otherPage, firstText).getAttribute(
      "data-message-id",
    );
    await messageRow(otherPage, firstText)
      .getByRole("button", { name: "Reaccionar 👍", exact: true })
      .click();
    await expect(
      messageRow(ownerPage, firstText).getByRole("button", {
        name: "Reaccionar 👍",
        exact: true,
      }),
    ).toContainText("1");
    await messageRow(otherPage, firstText)
      .getByRole("button", { name: `Responder a ${leader.name}`, exact: true })
      .click();
    await expect(
      otherPage.getByText(`Respondiendo a ${leader.name}`, { exact: true }),
    ).toBeVisible();
    const replyText =
      "¡Sí! Llevo ejemplos de Adapter y armamos una práctica juntos.";
    await otherPage
      .getByRole("textbox", { name: "Mensaje", exact: true })
      .fill(replyText);
    await otherPage
      .getByRole("button", { name: "Enviar mensaje", exact: true })
      .click();
    await expect(
      messageRow(ownerPage, replyText).locator(".spec04-quoted"),
    ).toContainText(firstText);
    await otherPage.reload();
    await expect(otherPage.locator(".chat-status")).toContainText("conectada");
    await expect(
      messageRow(otherPage, firstText).getByRole("button", {
        name: "Reaccionar 👍",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      messageRow(otherPage, replyText).locator(".spec04-quoted"),
    ).toContainText(firstText);
    results.push(
      "Navegador: escritura, presencia por pestañas, mensaje único, reacción persistida, respuesta y lectura",
    );

    await ownerPage.evaluate(async () => {
      const { getChatSocket } = await import(
        "/src/features/chat/services/socketClient.ts"
      );
      const socket = getChatSocket();
      socket.io.reconnection(false);
      socket.io.engine.close();
    });
    await expect(
      ownerPage.getByRole("button", { name: "Enviar mensaje", exact: true }),
    ).toBeDisabled();
    const draft = "Este borrador se conserva al reconectar.";
    await ownerPage
      .getByRole("textbox", { name: "Mensaje", exact: true })
      .fill(draft);
    const offlineText = "Podemos revisar también la inversión de dependencias.";
    await otherPage
      .getByRole("textbox", { name: "Mensaje", exact: true })
      .fill(offlineText);
    await otherPage
      .getByRole("button", { name: "Enviar mensaje", exact: true })
      .click();
    await expect(messageRow(otherPage, offlineText)).toHaveCount(1);
    await ownerPage.evaluate(async () => {
      const { getChatSocket } = await import(
        "/src/features/chat/services/socketClient.ts"
      );
      const socket = getChatSocket();
      socket.io.reconnection(true);
      socket.connect();
    });
    await expect(
      ownerPage.getByRole("textbox", { name: "Mensaje", exact: true }),
    ).toHaveValue(draft);
    await expect(
      ownerPage.getByRole("button", { name: "Enviar mensaje", exact: true }),
    ).toBeEnabled();
    await expect(messageRow(ownerPage, offlineText)).toHaveCount(1);
    await ownerPage
      .getByRole("button", { name: "Enviar mensaje", exact: true })
      .click();
    await expect(messageRow(otherPage, draft)).toHaveCount(1);
    await ownerPage.bringToFront();
    await ownerPage.screenshot({
      path: resolve(output, "chat-desktop.png"),
      fullPage: true,
      animations: "disabled",
    });
    results.push(
      "Navegador: desconexión real, borrador conservado y recuperación de mensajes sin duplicados",
    );

    await moderate(groupId, firstId);
    await expect(
      ownerPage.locator(".chat-stream").getByText(firstText, { exact: true }),
    ).toHaveCount(0);
    await expect(
      otherPage.locator(".chat-stream").getByText(firstText, { exact: true }),
    ).toHaveCount(0);
    await expect(
      messageRow(ownerPage, replyText).locator(".spec04-quoted"),
    ).toContainText("Mensaje no disponible");
    await expect(
      ownerPage.locator('[data-message-id="' + firstId + '"] .bubble > p'),
    ).toHaveText("Mensaje oculto por moderación.");
    await ownerPage.goto(web + `/grupos/${groupId}`);
    await ownerPage
      .getByRole("button", { name: `Expulsar a ${student.name}`, exact: true })
      .click();
    await ownerPage
      .getByRole("dialog")
      .getByRole("button", { name: "Expulsar integrante", exact: true })
      .click();
    await expect(
      member.page.getByRole("textbox", { name: "Mensaje", exact: true }),
    ).toHaveCount(0);
    await expect(
      member.page.getByText(
        "Necesitas pertenecer a este grupo para acceder a su conversación.",
        { exact: true },
      ),
    ).toBeVisible();
    await openChat(ownerPage, groupId);
    await expect(ownerPage.locator(".chat-status")).toHaveText(
      /2 personas conectadas/,
    );
    results.push(
      "Navegador: moderación oculta texto y citas; expulsión retira acceso y conversación",
    );

    await ownerPage.setViewportSize({ width: 390, height: 844 });
    await ownerPage.emulateMedia({ reducedMotion: "reduce" });
    await expect(
      ownerPage.getByRole("textbox", { name: "Mensaje", exact: true }),
    ).toBeVisible();
    expect(
      await ownerPage.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await ownerPage.screenshot({
      path: resolve(output, "chat-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
    await ownerPage
      .getByRole("link", { name: "Volver a conversaciones", exact: true })
      .click();
    await expect(
      ownerPage.getByLabel("Buscar conversación", { exact: true }),
    ).toBeVisible();
    await otherPage.goto(web + `/grupos/${groupId}`);
    await otherPage
      .getByRole("button", { name: "Salir del grupo", exact: true })
      .click();
    await otherPage
      .getByRole("dialog")
      .getByRole("button", { name: "Cancelar", exact: true })
      .click();
    await expect(
      otherPage.getByRole("link", { name: "Abrir conversación", exact: true }),
    ).toBeVisible();
    expect(dialogs).toEqual([]);
    expect(errors).toEqual([]);
    results.push(
      "Navegador: móvil sin desbordamiento, movimiento reducido y confirmaciones sin alertas nativas",
    );
    return results;
  } catch (error) {
    if (lastPage && !lastPage.isClosed())
      await lastPage
        .screenshot({
          path: resolve(output, "browser-failure.png"),
          fullPage: true,
        })
        .catch(() => {});
    throw error;
  } finally {
    for (const ctx of contexts) await ctx.close();
    await browser.close();
  }
}

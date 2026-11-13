import { chromium, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const web = process.env.HU22_WEB_URL || "http://localhost:5190";
if (!["localhost", "127.0.0.1"].includes(new URL(web).hostname))
  throw Error("Esta demostración solo admite una aplicación local.");
const output = resolve(
  process.env.HU22_ARTIFACT_DIR || "analysis/hu22-browser",
);
await mkdir(output, { recursive: true });
const password = process.env.HU22_PASSWORD || "LuminaUL!2026";
const accounts = [
  "lider.prueba@aloe.ulima.edu.pe",
  "usuario.prueba@aloe.ulima.edu.pe",
  "solicitante.prueba@aloe.ulima.edu.pe",
];
const checks = [],
  errors = [];
let browser;
/** Prepara el escenario a través de los endpoints reales; no simula sus respuestas. */
async function api(path, token, method = "GET", body) {
  const r = await fetch(web + "/api" + path, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw Error(`${method} ${path}: HTTP ${r.status}`);
  return data;
}
/** Cada cuenta utiliza cookies y almacenamiento aislados, igual que dos navegadores distintos. */
async function login(page, email) {
  await page.goto(web + "/login");
  await page.getByLabel("Correo institucional").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await page.waitForURL(web + "/");
  page.on("pageerror", (error) => errors.push(error.message));
}
/** Registra solo el resultado y la captura, nunca credenciales ni tokens. */
async function check(name, run) {
  await run();
  checks.push({ name, result: "Aprobado" });
  console.log("OK " + name);
}
try {
  const tokens = [];
  for (const email of accounts)
    tokens.push(
      (await api("/auth/login", null, "POST", { email, password })).accessToken,
    );
  const groupName = "Repaso de patrones " + randomUUID().slice(0, 6);
  const group = await api("/groups", tokens[0], "POST", {
    name: groupName,
    description:
      "Coordinación del repaso y resolución de ejercicios de Software II.",
    courseCode: "ISW2",
    meetingMode: "virtual",
    meetingShift: "tarde",
    maxCapacity: 3,
  });
  const first = await api(
    `/groups/${group.id}/join-requests`,
    tokens[1],
    "POST",
    { message: "Me gustaría repasar los ejercicios con el grupo." },
  );
  const second = await api(
    `/groups/${group.id}/join-requests`,
    tokens[2],
    "POST",
    { message: "Quisiera participar en la próxima sesión de estudio." },
  );
  browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
  });
  const leader = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    }),
    member = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
  const page = await leader.newPage(),
    other = await member.newPage();
  await login(page, accounts[0]);
  await login(other, accounts[1]);
  await check("HU2.2 consulta y filtro de solicitudes", async () => {
    await page.goto(web + "/solicitudes");
    await page
      .getByLabel("Filtrar solicitudes por grupo")
      .selectOption(group.id);
    await expect(page.locator(`[data-request-id="${first.id}"]`)).toBeVisible();
    await expect(
      page.locator(`[data-request-id="${second.id}"]`),
    ).toBeVisible();
    await page
      .getByLabel("Buscar solicitante o grupo")
      .fill("sin-coincidencias");
    await expect(
      page.getByText("No hay solicitudes con estos filtros"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Limpiar filtros" }).click();
    await page
      .getByLabel("Filtrar solicitudes por grupo")
      .selectOption(group.id);
    await page.screenshot({
      path: resolve(output, "01-solicitudes-antes.png"),
      fullPage: true,
    });
  });
  await check(
    "HU2.2 aceptar actualiza lista y notifica al solicitante",
    async () => {
      await page
        .locator(`[data-request-id="${first.id}"]`)
        .getByRole("button", { name: /Aceptar solicitud/ })
        .click();
      await expect(page.locator(`[data-request-id="${first.id}"]`)).toHaveCount(
        0,
      );
      await other.goto(web + "/notificaciones");
      await expect(
        other.getByText(
          `Tu solicitud para unirte a «${groupName}» fue aceptada. Ya puedes conversar con el grupo.`,
        ),
      ).toBeVisible();
      await other.screenshot({
        path: resolve(output, "02-notificacion-aceptacion.png"),
        fullPage: true,
      });
    },
  );
  await check(
    "HU2.2 rechazar elimina la pendiente sin incorporar al alumno",
    async () => {
      await page
        .locator(`[data-request-id="${second.id}"]`)
        .getByRole("button", { name: /Rechazar solicitud/ })
        .click();
      await expect(
        page.locator(`[data-request-id="${second.id}"]`),
      ).toHaveCount(0);
      const members = await api(`/groups/${group.id}/members`, tokens[0]);
      expect(members).toHaveLength(2);
      const notifications = await api("/notifications/me", tokens[2]);
      expect(
        notifications.some(
          (n) =>
            n.message.includes(groupName) && n.title === "Solicitud rechazada",
        ),
      ).toBe(true);
    },
  );
  await check(
    "HU2.2 el alumno sin grupos liderados ve el estado vacío",
    async () => {
      await other.goto(web + "/solicitudes");
      await expect(
        other.getByText("No hay solicitudes pendientes por revisar"),
      ).toBeVisible();
      await other.screenshot({
        path: resolve(output, "03-solicitudes-vacias.png"),
        fullPage: true,
      });
    },
  );
  let delayedText =
    "Mensaje con confirmación diferida " + randomUUID().slice(0, 8);
  let releaseAck;
  let heldResolve;
  let held = new Promise((resolveHeld) => {
    heldResolve = resolveHeld;
  });
  await page.routeWebSocket(/\/socket\.io\//, (route) => {
    const server = route.connectToServer();
    server.onMessage((packet) => {
      // Solo se retiene el ACK del mensaje de esta prueba; el servidor y la otra sesión son reales.
      if (
        typeof packet === "string" &&
        packet.startsWith("43") &&
        packet.includes(delayedText)
      ) {
        releaseAck = () => route.send(packet);
        heldResolve();
      } else route.send(packet);
    });
  });
  await page.goto(web + `/mensajes/${group.id}`);
  await other.goto(web + `/mensajes/${group.id}`);
  await expect(page.locator(".status-dot.online")).toBeVisible();
  await expect(other.locator(".status-dot.online")).toBeVisible();
  await check(
    "Chat entre dos sesiones y conservación del borrador ante ACK tardío",
    async () => {
      await page.getByLabel("Mensaje", { exact: true }).fill(delayedText);
      await page.getByRole("button", { name: "Enviar mensaje" }).click();
      await Promise.race([
        held,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(Error("No se capturó el ACK WebSocket real")),
            7000,
          ),
        ),
      ]);
      await expect(
        other.locator(".chat-stream").getByText(delayedText, { exact: true }),
      ).toBeVisible();
      const nextDraft = "Estoy preparando el siguiente mensaje.";
      await page.getByLabel("Mensaje", { exact: true }).fill(nextDraft);
      releaseAck();
      await expect(page.getByLabel("Mensaje", { exact: true })).toHaveValue(
        nextDraft,
      );
      await expect(
        page.getByRole("button", { name: "Enviar mensaje" }),
      ).toBeEnabled();
      await page.getByLabel("Mensaje", { exact: true }).fill("");
      await page.screenshot({
        path: resolve(output, "04-chat-dos-sesiones.png"),
        fullPage: true,
      });
    },
  );
  await check("Un ACK tardío no mezcla dos conversaciones", async () => {
    delayedText = "Mensaje de la sala anterior " + randomUUID().slice(0, 8);
    held = new Promise((resolveHeld) => {
      heldResolve = resolveHeld;
    });
    await page.getByLabel("Mensaje", { exact: true }).fill(delayedText);
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await Promise.race([
      held,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(Error("No llegó el ACK del cambio de sala")),
          7000,
        ),
      ),
    ]);
    await page
      .locator(".chat-row")
      .filter({ hasText: "Taller de Software II" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Taller de Software II", exact: true }),
    ).toBeVisible();
    releaseAck();
    // Permite procesar el paquete retenido y el render para detectar una mezcla tardía de estado.
    await page.waitForTimeout(250);
    await expect(
      page.locator(".chat-stream").getByText(delayedText, { exact: true }),
    ).toHaveCount(0);
    await page.locator(".chat-row").filter({ hasText: groupName }).click();
    await expect(page.locator(".status-dot.online")).toBeVisible();
  });
  await check("Persistencia del chat después de recargar", async () => {
    await other.reload();
    await expect(
      other.locator(".chat-stream").getByText(delayedText, { exact: true }),
    ).toBeVisible();
  });
  await check("Reacción y respuesta sincronizadas", async () => {
    const bubble = other
      .locator("[data-message-id]")
      .filter({ hasText: delayedText });
    await bubble
      .getByRole("button", { name: "Reaccionar 👍", exact: true })
      .click();
    await expect(
      page
        .locator("[data-message-id]")
        .filter({ hasText: delayedText })
        .getByRole("button", { name: "Reaccionar 👍", exact: true }),
    ).toContainText("1");
    await bubble.getByRole("button", { name: /Responder a/ }).click();
    await other
      .getByLabel("Mensaje", { exact: true })
      .fill("De acuerdo, revisamos ese ejercicio.");
    await other.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(
      page
        .locator(".chat-stream")
        .getByText("De acuerdo, revisamos ese ejercicio.", { exact: true }),
    ).toBeVisible();
  });
  await check(
    "Diseño móvil de solicitudes y chat sin desbordamiento",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: resolve(output, "05-chat-movil.png"),
        fullPage: true,
      });
      await page.goto(web + "/solicitudes");
      await expect(
        page.getByRole("heading", { name: "Solicitudes de ingreso" }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: resolve(output, "06-solicitudes-movil.png"),
        fullPage: true,
      });
    },
  );
  for (const [route, title] of [
    ["/grupos", "Grupos"],
    ["/perfil", "Perfil"],
    ["/horario", "Horario"],
    ["/mis-resenas", "Reseñas"],
    ["/moderacion", "Moderación"],
    ["/publicar", "Publicación"],
  ]) {
    await check("Presentación móvil de " + title, async () => {
      await page.goto(web + route);
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(
        page.locator("#main-content .loading, #main-content .spinner"),
      ).toHaveCount(0, { timeout: 10000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: resolve(output, "movil-" + route.slice(1) + ".png"),
        fullPage: true,
      });
    });
  }
  expect(errors).toEqual([]);
  await writeFile(
    resolve(output, "resultado.json"),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        groupId: group.id,
        checks,
        passed: checks.length,
        errors,
        scope:
          "UI y API reales; solo el ACK del caso indicado se difiere de forma controlada.",
      },
      null,
      2,
    ),
  );
} catch (error) {
  await writeFile(
    resolve(output, "fallo.json"),
    JSON.stringify({ checks, error: String(error.stack), errors }, null, 2),
  );
  throw error;
} finally {
  await browser?.close();
}

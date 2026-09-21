import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// UI contracts use isolated responses. Persistence and permissions are checked
// separately by integration.mjs against a temporary PostgreSQL schema.
const base = "http://localhost:5173",
  results = [],
  writes = [],
  nativeDialogs = [],
  errors = [];
await mkdir("analysis/validation", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const me = {
  id: "user-one",
  name: "Robert Demo",
  email: "robert.demo@aloe.ulima.edu.pe",
  role: "student",
};
let post = {
  id: "post-one",
  user_id: me.id,
  author_name: me.name,
  group_id: "group-one",
  type: "study_group",
  course_id: "course-one",
  course_name: "Ingeniería de Software II",
  description: "Publicación para probar las interacciones",
  benefits: "Aprender en equipo",
  requirements: "Interés en el curso",
  max_capacity: 10,
  status: "published",
  created_at: new Date().toISOString(),
};
const group = {
  id: "group-one",
  name: "Grupo de prueba",
  admin_id: me.id,
  max_capacity: 10,
  members: [
    { user_id: me.id, name: me.name, role: "admin" },
    { user_id: "user-two", name: "Ana Demo", role: "member" },
  ],
};
let joinRequests = [
  {
    id: "req-1",
    group: { group_id: "group-one", group_name: "Grupo de prueba" },
    requester: { user_id: "user-two", name: "Ana Demo", profile_photo_url: null },
    status: "pending",
    message: "Hola, me gustaría unirme para estudiar.",
    created_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    responded_at: null,
  },
  {
    id: "req-2",
    group: { group_id: "group-one", group_name: "Grupo de prueba" },
    requester: { user_id: "user-three", name: "Carlos Demo", profile_photo_url: null },
    status: "pending",
    message: "Tengo disponibilidad los fines de semana.",
    created_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    responded_at: null,
  },
];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", async (dialog) => {
  nativeDialogs.push(dialog.type());
  await dialog.dismiss();
});
await page.route(
  (url) =>
    url.pathname.startsWith("/api/v1") ||
    /^\/(api|posts|courses|groups|profiles|reviews|join-requests|auth|availability|availabilities|notifications|moderation|admin|chats|requests)(\/|$)/.test(
      url.pathname,
    ),
  async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname.replace(/^\/api\/v1/, "");
    let data = [];
    if (request.method() !== "GET") {
      const body = request.postDataJSON ? request.postDataJSON() : null;
      writes.push({ path, method: request.method(), body });
      if (path === "/posts/post-one" && request.method() === "PUT")
        post = { ...post, ...body };
      if (path === "/posts/post-one" && request.method() === "DELETE")
        post = null;
      if (path.startsWith("/join-requests/") && request.method() === "PATCH") {
        const reqId = path.replace("/join-requests/", "");
        const action = body?.action || "accepted";
        const found = joinRequests.find((r) => r.id === reqId);
        joinRequests = joinRequests.filter((r) => r.id !== reqId);
        data = {
          request: { ...(found || { id: reqId }), status: action },
          message:
            action === "accepted"
              ? "Solicitud aceptada exitosamente"
              : "Solicitud rechazada exitosamente",
        };
      } else {
        data = { message: "Cambios guardados con éxito" };
      }
    } else if (path === "/auth/me") data = me;
  else if (path === "/posts/me" || path === "/posts") data = post ? [post] : [];
  else if (path === "/posts/post-one") data = post;
  else if (path === "/courses")
    data = [{ id: "course-one", name: "Ingeniería de Software II", cycle: 7 }];
  else if (path === "/groups/group-one") data = group;
  else if (path === "/join-requests/me")
    data = {
      requests: joinRequests,
      total: joinRequests.length,
      message:
        joinRequests.length === 0
          ? "No hay solicitudes pendientes por revisar"
          : null,
    };
  else if (path === "/profiles/me")
    data = {
      availability: [
        {
          id: "slot-one",
          day_of_week: 1,
          start_time: "10:00:00",
          end_time: "12:00:00",
        },
      ],
    };
  else if (path === "/reviews/me")
    data = [
      {
        id: "review-one",
        reviewed_user_id: "user-two",
        target_name: "Ana Demo",
        rating: 5,
        comment: "Buen trabajo en equipo",
        status: "published",
      },
    ];
  await route.fulfill({ status: 200, json: data });
});
const dialog = () => page.getByRole("dialog");
async function cancelCheck(route, button, title, cancel = "Cancelar") {
  await page.goto(base + route);
  await button().click();
  await expect(page.getByRole("dialog", { name: title })).toBeVisible();
  const count = writes.length;
  await dialog().getByRole("button", { name: cancel, exact: true }).click();
  await expect(dialog()).toHaveCount(0);
  expect(writes.length).toBe(count);
}
try {
  await page.goto(base + "/mis-publicaciones");
  await page.getByRole("button", { name: "Borrar publicación", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "¿Seguro que desea borrar el post?" }),
  ).toBeVisible();
  await expect(
    dialog().getByRole("button", { name: "Regresar", exact: true }),
  ).toBeFocused();
  await page.screenshot({
    animations: "disabled",
    path: "analysis/validation/confirmation-desktop.png",
  });
  await page.keyboard.press("Escape");
  await expect(dialog()).toHaveCount(0);
  expect(writes).toHaveLength(0);
  await expect(
    page.getByRole("button", { name: "Borrar publicación", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByText("No se eliminó el post", { exact: true }),
  ).toBeVisible();
  results.push(
    "Eliminar post: modal accesible, Escape cancela sin HTTP, foco restaurado",
  );

  await page.getByRole("link", { name: "Editar publicación", exact: true }).click();
  await page
    .getByLabel("Descripción")
    .fill("Descripción modificada desde el editor");
  await page.getByRole("button", { name: "Regresar", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "¿Desea guardar los cambios?" }),
  ).toBeVisible();
  await dialog().getByRole("button", { name: "Seguir editando" }).click();
  await expect(page.getByLabel("Descripción")).toHaveValue(
    "Descripción modificada desde el editor",
  );
  await page.getByRole("button", { name: "Regresar", exact: true }).click();
  await dialog().getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page).toHaveURL(base + "/mis-publicaciones");
  expect(writes.filter((w) => w.method === "PUT")).toHaveLength(1);
  await expect(
    page.getByText("Post modificado con éxito", { exact: true }),
  ).toBeVisible();
  results.push("Editar post: continuar editando o guardar antes de regresar");
  await page.getByRole("button", { name: "Borrar publicación", exact: true }).click();
  await dialog().getByRole("button", { name: "Aceptar", exact: true }).click();
  await expect(
    page.getByText("Post eliminado con éxito", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No tienes publicaciones aún" }),
  ).toBeVisible();
  expect(writes.filter((w) => w.method === "DELETE")).toHaveLength(1);
  results.push("Confirmar eliminación emite un DELETE y actualiza el listado");

  await cancelCheck(
    "/horario",
    () => page.getByTitle("Eliminar franja"),
    "¿Eliminar esta franja?",
  );
  await cancelCheck(
    "/mis-resenas",
    () => page.getByRole("button", { name: "Eliminar", exact: true }),
    "¿Eliminar esta reseña?",
  );
  await cancelCheck(
    "/grupos/group-one",
    () => page.getByTitle("Expulsar integrante"),
    "¿Expulsar a Ana Demo?",
  );
  await cancelCheck(
    "/grupos/group-one",
    () => page.getByTitle("Transferir administración"),
    "Transferir administración",
  );
  await cancelCheck(
    "/grupos/group-one",
    () => page.getByRole("button", { name: "Salir del grupo", exact: true }),
    "¿Salir del grupo?",
  );
  await cancelCheck(
    "/configuracion",
    () => page.getByRole("button", { name: "Eliminar cuenta", exact: true }),
    "¿Eliminar tu cuenta?",
    "Conservar mi cuenta",
  );
  results.push(
    "Cancelar horario, reseña, expulsión, transferencia, salida y cuenta no modifica datos",
  );
  await page
    .getByRole("button", { name: "Eliminar cuenta", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    animations: "disabled",
    path: "analysis/validation/confirmation-mobile.png",
  });
  const bounds = await dialog().boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  results.push("Confirmación móvil 390px sin desbordamiento");

  await page.goto(base + "/horario");
  await page.getByRole("button", { name: "Agregar franja" }).click();
  await dialog()
    .getByRole("button", { name: "Guardar horario", exact: true })
    .click();
  await expect(dialog()).toHaveCount(0);
  await expect(page.locator(".toast")).toContainText(
    "Cambios guardados con éxito",
  );
  await page.getByRole("button", { name: "Cerrar notificación" }).click();
  await expect(page.locator(".toast")).toHaveCount(0);
  results.push(
    "Aviso de éxito persiste tras cerrar el formulario y puede descartarse",
  );
  await page.goto(base + "/publicar");
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText(/debe completarse/i)).toBeVisible();
  results.push("Validación de campos obligatorios al crear publicación");

  await page.goto(base + "/buscar");
  await page.getByRole("button", { name: "Grupo de Estudio", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Grupo de Estudio", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Asesoría", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Asesoría", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("No se encontraron resultados para tu búsqueda", {
      exact: true,
    }),
  ).toBeVisible();
  results.push("Filtros por botones y estado vacío de búsqueda");

  // Pruebas específicas HU 2.2: Gestión de solicitudes de unión
  await page.goto(base + "/solicitudes");
  await expect(page.locator("main h1")).toHaveText("Solicitudes de ingreso");
  // Criterio 4: Ver lista con solicitudes del administrador
  await expect(page.locator(".join-request-card")).toHaveCount(2);
  await expect(page.getByText("Ana Demo")).toBeVisible();
  await expect(page.getByText("Carlos Demo")).toBeVisible();

  // Criterio 1: Aceptar la solicitud
  await page.getByRole("button", { name: "Aceptar solicitud de Ana Demo" }).click();
  await expect(page.locator(".toast")).toContainText("Solicitud aceptada exitosamente");
  await expect(page.locator(".join-request-card")).toHaveCount(1);
  expect(
    writes.some(
      (w) =>
        w.path === "/join-requests/req-1" &&
        w.method === "PATCH" &&
        w.body?.action === "accepted",
    ),
  ).toBe(true);

  // Criterio 2: Rechazar la solicitud
  await page.getByRole("button", { name: "Rechazar solicitud de Carlos Demo" }).click();
  await expect(page.locator(".toast")).toContainText("Solicitud rechazada exitosamente");
  await expect(page.locator(".join-request-card")).toHaveCount(0);
  expect(
    writes.some(
      (w) =>
        w.path === "/join-requests/req-2" &&
        w.method === "PATCH" &&
        w.body?.action === "rejected",
    ),
  ).toBe(true);

  // Criterio 3: Ver lista de solicitudes vacía
  await expect(
    page.getByRole("heading", { name: "No hay solicitudes pendientes por revisar" }),
  ).toBeVisible();
  results.push("HU 2.2: Listado, aceptación, rechazo y estado vacío de solicitudes");
  expect(nativeDialogs).toEqual([]);
  expect(errors).toEqual([]);
  results.push(
    "Cero alert, confirm o prompt nativos y cero excepciones JavaScript",
  );
} catch (error) {
  console.error(error);
  results.push("FAIL: " + error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(
    "analysis/validation/feedback.json",
    JSON.stringify(
      {
        finished: new Date().toISOString(),
        status: process.exitCode ? "FAIL" : "PASS",
        results,
        nativeDialogs,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(results.join("\n"));
}

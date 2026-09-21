import { chromium } from "@playwright/test";

const routes = [
  { path: "/", name: "Inicio (Feed)" },
  { path: "/buscar", name: "Explorar (Buscar)" },
  { path: "/grupos", name: "Mis grupos (404 en backend)" },
  { path: "/solicitudes", name: "Solicitudes (HU 2.2)" },
  { path: "/mensajes", name: "Mensajes (404 en backend)" },
  { path: "/mis-publicaciones", name: "Mis publicaciones" },
  { path: "/perfil", name: "Mi perfil (404 en backend)" },
  { path: "/perfil/editar", name: "Editar perfil (404 en backend)" },
  { path: "/horario", name: "Disponibilidad (404 en backend)" },
  { path: "/mis-resenas", name: "Mis reseñas (404 en backend)" },
  { path: "/moderacion", name: "Moderación (404 en backend)" },
  { path: "/notificaciones", name: "Notificaciones (404 en backend)" },
  { path: "/configuracion", name: "Configuración" },
  { path: "/publicar", name: "Crear publicación" },
];

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const pageErrors = [];
page.on("pageerror", (err) => {
  pageErrors.push(err.message);
});

console.log("Iniciando pruebas de carga de páginas contra el backend en vivo...");

// Go to root (will authenticate via session fallback if /auth/me returns 404)
await page.goto("http://localhost:5173/");
await page.waitForTimeout(1000);

let passedCount = 0;

for (const r of routes) {
  const url = `http://localhost:5173${r.path}`;
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);

  // Check if body is empty or blank
  const bodyText = await page.innerText("body");
  const hasContent = bodyText.trim().length > 20;

  // Check if header or main content exists
  const mainExists = await page.locator("main#main-content").count();

  // Check for crash
  const errorCount = pageErrors.length;

  if (hasContent && mainExists > 0 && errorCount === 0) {
    console.log(`✓ [PASS] ${r.name} (${r.path}) cargó normalmente.`);
    passedCount++;
  } else {
    console.error(`✗ [FAIL] ${r.name} (${r.path}) falló. Content: ${hasContent}, Main: ${mainExists}, Errors: ${pageErrors.join("; ")}`);
  }
}

await browser.close();

if (passedCount === routes.length && pageErrors.length === 0) {
  console.log(`\n¡ÉXITO TOTAL! Las ${routes.length} páginas cargaron normalmente sin errores.`);
  process.exit(0);
} else {
  console.error(`\nFALLO: Solo ${passedCount}/${routes.length} páginas pasaron.`);
  process.exit(1);
}

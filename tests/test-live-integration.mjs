import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("analysis/validation", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// ZERO MOCKS! 100% real end-to-end integration between Vite React Frontend and NestJS Backend
try {
  console.log("1. Navegando a /solicitudes en frontend (http://localhost:5173/solicitudes)...");
  await page.goto("http://localhost:5173/solicitudes");

  await page.waitForSelector("main h1", { timeout: 10000 });
  const title = await page.locator("main h1").textContent();
  console.log("Título obtenido:", title);

  // Criterio 4: Verificar que la solicitud real de Valeria Ramos se muestra en pantalla
  await expect(page.locator(".join-request-card")).toHaveCount(1);
  await expect(page.getByText("Valeria Ramos")).toBeVisible();
  await expect(page.getByText("Grupo de Estudio - Modelamiento de Base de Datos")).toBeVisible();
  await expect(page.getByText("Hola Martin, me gustaria unirme")).toBeVisible();
  console.log("✅ Criterio 4 Verificado: La solicitud real se renderiza con sus datos desde PostgreSQL.");

  await page.screenshot({ path: "analysis/validation/live-solicitudes-card.png", fullPage: true });

  // Criterio 1: Aceptar la solicitud real
  console.log("2. Aceptando la solicitud real...");
  await page.getByRole("button", { name: "Aceptar solicitud de Valeria Ramos" }).click();

  // Esperar notificación de éxito
  await expect(page.locator(".toast")).toContainText("Solicitud aceptada exitosamente");
  console.log("✅ Notificación de éxito recibida del backend NestJS.");

  // Criterio 3: Verificar que la solicitud desaparece y pasa al estado vacío
  await expect(page.locator(".join-request-card")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No hay solicitudes pendientes por revisar" })).toBeVisible();
  console.log("✅ Criterios 1 y 3 Verificados: Solicitud removida y estado vacío mostrado en tiempo real.");

  await page.screenshot({ path: "analysis/validation/live-solicitudes-accepted.png", fullPage: true });

  if (errors.length > 0) {
    console.error("Errores en consola de la página:", errors);
    process.exitCode = 1;
  } else {
    console.log("\n🎉 INTEGRACIÓN REAL TOTALMENTE EXITOSA: React Frontend + NestJS Backend + PostgreSQL!");
  }
} catch (err) {
  console.error("Error durante integración real:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}

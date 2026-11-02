import { chromium, expect } from "@playwright/test";
import { resolve } from "node:path";

/** Verifica la presentación y el acceso con SPEC-01 real, sin sustituir respuestas de negocio. */
export async function runWelcomeBrowser({
  web,
  password,
  registrationEmail,
  verificationCode,
  output,
}) {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [],
    dialogs = [],
    failedAssets = [],
    results = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.type());
    await dialog.dismiss();
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && /\/(media|fonts)\//.test(response.url()))
      failedAssets.push(response.url());
  });

  /** Espera fuentes e imagen reales antes de evaluar o capturar la composición. */
  async function settled() {
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator("img")
      .evaluateAll((images) =>
        Promise.all(images.map((image) => image.decode())),
      );
  }

  /** Un ancho móvil no debe esconder controles fuera de la pantalla. */
  async function noOverflow() {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }

  try {
    await page.goto(web + "/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "El conocimiento",
    );
    await expect(page).toHaveURL(web + "/");
    await settled();
    expect(
      await page.evaluate(() =>
        document.fonts.check('700 20px "Space Grotesk"'),
      ),
    ).toBe(true);
    await page.screenshot({
      path: resolve(output, "presentacion-desktop.png"),
      animations: "disabled",
    });

    await page.getByRole("tab", { name: /Arma tu grupo/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText(
      "Mejor cuando cada uno aporta algo.",
    );
    await page.getByRole("tab", { name: /Arma tu grupo/ }).press("ArrowRight");
    await expect(page.getByRole("tabpanel")).toContainText(
      "Un espacio en tu horario.",
    );
    await page.getByRole("tab", { name: /Haz que coincida/ }).press("Home");
    await expect(
      page.getByRole("tab", { name: /Encuentra apoyo/ }),
    ).toHaveAttribute("aria-selected", "true");
    for (const label of [
      "Nuestra misión",
      "Nuestra visión",
      "Nuestro objetivo",
    ])
      await expect(page.getByText(label, { exact: true })).toHaveCount(1);
    const faq = page
      .locator("details")
      .filter({
        has: page.getByText(
          "¿LuminaUL realiza pagos o reservas de cubículos?",
          { exact: true },
        ),
      });
    await faq.locator("summary").click();
    await expect(faq.locator("p")).toBeVisible();
    await expect(faq).toContainText(
      "no procesa pagos ni realiza reservas oficiales",
    );
    await faq.locator("summary").click();
    for (const item of await page.locator("[data-reveal]").all()) {
      await item.scrollIntoViewIfNeeded();
      await expect(item).toHaveCSS("opacity", "1");
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: resolve(output, "presentacion-completa.png"),
      fullPage: true,
      animations: "disabled",
    });
    results.push(
      "Presentación: raíz pública, propósito, pestañas por teclado, FAQ y recursos locales sin errores",
    );

    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(web + "/");
      await expect(page.locator(".landing-page")).toBeVisible();
      await noOverflow();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(web + "/");
    await page
      .getByRole("button", { name: "Abrir menú de presentación" })
      .click();
    await expect(page.locator("#welcome-navigation")).toBeVisible();
    await page
      .locator("#welcome-navigation")
      .getByRole("link", { name: "Nuestro propósito", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Abrir menú de presentación" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".welcome-image-frame img")).toHaveCSS(
      "animation-name",
      "none",
    );
    await page.screenshot({
      path: resolve(output, "presentacion-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
    for (const [route, label] of [
      ["/login", "acceso"],
      ["/registro", "registro"],
    ]) {
      await page.goto(web + route);
      await expect(page.locator(".auth-form h1")).toBeVisible();
      await settled();
      await noOverflow();
      await page.screenshot({
        path: resolve(output, label + "-mobile.png"),
        fullPage: true,
        animations: "disabled",
      });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({
        path: resolve(output, label + "-desktop.png"),
        animations: "disabled",
      });
      await page.setViewportSize({ width: 390, height: 844 });
    }
    results.push(
      "Presentación y acceso: menú móvil, anchos 320/390/768, tipografía y movimiento reducido",
    );

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(web + "/registro");
    await page
      .getByRole("button", { name: "Crear mi cuenta", exact: true })
      .click();
    await expect(page.locator(".auth-form .notice")).toContainText(
      "Debe ingresar todos los datos",
    );
    await page.getByLabel("Nombre completo").fill("Estudiante de integración");
    await page.getByLabel("Correo institucional").fill("correo@example.com");
    await page.locator('input[autocomplete="new-password"]').fill(password);
    await page
      .getByRole("button", { name: "Crear mi cuenta", exact: true })
      .click();
    await expect(page.locator(".auth-form .notice")).toContainText(
      "no pertenece a la organización",
    );
    await page.getByLabel("Correo institucional").fill(registrationEmail);
    await page
      .getByRole("button", { name: "Ver contraseña", exact: true })
      .click();
    await expect(
      page.locator('input[autocomplete="new-password"]'),
    ).toHaveAttribute("type", "text");
    await page
      .getByRole("button", { name: "Ocultar contraseña", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Crear mi cuenta", exact: true })
      .click();
    const verification = page.getByRole("dialog", {
      name: "Verifica tu correo institucional",
      exact: true,
    });
    await expect(verification).toBeVisible();
    // Se lee el código emitido por SPEC-01 exclusivamente en la base local de test, sin alterar el flujo.
    const code = await verificationCode();
    expect(code).toMatch(/^\d{6}$/);
    await verification.getByLabel("Dígito 1 de 6", { exact: true }).fill(code);
    await verification
      .getByRole("button", { name: "Verificar cuenta", exact: true })
      .click();
    await expect(page).toHaveURL(/\/login\?.*verificada=1/);
    await page.locator('input[autocomplete="current-password"]').fill(password);
    await page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await expect(page).toHaveURL(web + "/");
    await expect(page.locator(".app-shell")).toBeVisible();
    await expect(page.locator(".landing-page")).toHaveCount(0);
    results.push(
      "Acceso real: validaciones, registro, OTP de SPEC01 e inicio de sesión conservan el feed autenticado",
    );

    await page.goto(web + "/nosotros#proposito");
    await expect(page.locator("#proposito")).toBeInViewport();
    await page
      .getByRole("link", { name: "Ir a mi comunidad", exact: true })
      .click();
    await expect(page.locator(".app-shell")).toBeVisible();
    await page
      .locator(".sidebar")
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
    const logout = page.getByRole("dialog", {
      name: "¿Cerrar tu sesión?",
      exact: true,
    });
    await expect(logout).toBeVisible();
    await logout
      .getByRole("button", { name: "Seguir en mi comunidad", exact: true })
      .click();
    await expect(logout).toHaveCount(0);
    await expect(page.locator(".app-shell")).toBeVisible();
    await page
      .locator(".sidebar")
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
    await expect(page.locator(".landing-page")).toBeVisible();
    await page.goto(web + "/grupos");
    await expect(page).toHaveURL(web + "/login");
    expect(errors).toEqual([]);
    expect(dialogs).toEqual([]);
    expect(failedAssets).toEqual([]);
    results.push(
      "Sesión: presentación accesible, cierre con modal propio, cancelación y rutas privadas protegidas sin alertas nativas",
    );
    return results;
  } catch (error) {
    await page
      .screenshot({
        path: resolve(output, "presentacion-failure.png"),
        fullPage: true,
      })
      .catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}

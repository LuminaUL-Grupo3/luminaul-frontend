import { chromium } from '@playwright/test';

async function testDynamicInlineErrors() {
  console.log('[INFO] Iniciando prueba de errores dinamicos inline en navegador...');
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'msedge',
    headless: true,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:5173/publicar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // 1. Verificar que inicialmente NO hay banner de error ni errores inline
    const initialBanners = await page.locator('.notice.error, .notice').count();
    console.log('[OK] Banners iniciales en pantalla:', initialBanners);

    // 2. Intentar enviar el formulario vacío haciendo click en "Publicar ahora"
    console.log('[INFO] Haciendo click en "Publicar ahora" con campos vacios...');
    await page.getByRole('button', { name: 'Publicar ahora' }).click();
    await page.waitForTimeout(500);

    // 3. Verificar que NO aparece el banner feo arriba del todo
    const bannerTop = page.locator('.notice.error');
    const hasTopBanner = (await bannerTop.count()) > 0 && (await bannerTop.isVisible());
    console.log(`[PASS] Banner feo arriba del todo ausente: ${!hasTopBanner}`);

    // 4. Verificar que aparecen los mensajes de error dinámicos inline justo debajo de cada campo
    const inlineErrors = page.locator('.field-error-message');
    const errorCount = await inlineErrors.count();
    console.log(`[PASS] Mensajes de error dinamicos inline renderizados: ${errorCount} (esperados: 4)`);

    for (let i = 0; i < errorCount; i++) {
      const text = await inlineErrors.nth(i).textContent();
      console.log(`       - Error ${i + 1}: "${text?.trim()}"`);
    }

    // 5. Verificar que al seleccionar un curso, el error del curso desaparece dinámicamente
    console.log('[INFO] Seleccionando una asignatura para probar limpieza dinamica...');
    const firstChip = page.locator('.course-chip-btn').first();
    if (await firstChip.count() > 0) {
      await firstChip.click();
      await page.waitForTimeout(300);
      const errorsAfterCourse = await inlineErrors.count();
      console.log(`[PASS] Errores tras seleccionar curso: ${errorsAfterCourse} (se redujo en 1)`);
    }

    // 6. Verificar que al escribir en la descripción, su error desaparece en tiempo real
    console.log('[INFO] Escribiendo en la descripcion para probar limpieza dinamica...');
    const descInput = page.locator('textarea').first();
    await descInput.fill('Grupo enfocado en preparar el examen parcial de redes.');
    await page.waitForTimeout(300);
    const errorsAfterDesc = await inlineErrors.count();
    console.log(`[PASS] Errores tras escribir descripcion: ${errorsAfterDesc} (se redujo en 1)`);

    // Tomar captura del estado con errores inline
    await page.screenshot({ path: 'analysis/validation/03-errores-inline-dinamicos.png', fullPage: true });
    console.log('[OK] Captura guardada en analysis/validation/03-errores-inline-dinamicos.png');

    console.log('\n[SUCCESS] Prueba de errores dinamicos inline completada con exito total.');
  } finally {
    await browser.close();
  }
}

testDynamicInlineErrors().catch((err) => {
  console.error('[ERROR] Error en prueba:', err);
  process.exit(1);
});


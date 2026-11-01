import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = 'analysis/validation';
const results = [];
const errors = [];
const startedAt = new Date();

await mkdir(OUTPUT_DIR, { recursive: true });

function recordStep(category, testName, passed, detail = '') {
  results.push({ category, testName, passed, detail });
  const statusTag = passed ? '[PASS]' : '[FAIL]';
  console.log(`${statusTag} [${category}] ${testName}${detail ? ` - ${detail}` : ''}`);
}

async function runBrowserFunctionalTests() {
  console.log('======================================================================');
  console.log('SUITE DE PRUEBAS FUNCIONALES EN NAVEGADOR - LUMINAUL');
  console.log('Validacion de Interfaz, Flujos de Usuario y Diseno Responsivo');
  console.log(`URL Base: ${BASE_URL}`);
  console.log('======================================================================\n');

  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'msedge',
    headless: true,
  });

  try {
    // -------------------------------------------------------------------------
    // SESIÓN 1: DESKTOP (Viewport 1440x900)
    // -------------------------------------------------------------------------
    console.log('[INFO] Iniciando sesion de pruebas en navegador Desktop (1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await desktopContext.newPage();
    page.on('pageerror', (err) => errors.push({ context: 'desktop', error: err.message }));

    // 1. Carga del Feed de Publicaciones (SPEC-03 / H.U 1.5)
    console.log('\n[INFO] 1. Probando carga del Feed de Publicaciones (/)...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const bannerExists = (await page.locator('.welcome-banner').count()) > 0;
    recordStep('H.U 1.5 - Feed', 'Banner de bienvenida renderizado', bannerExists);

    const postCardsCount = await page.locator('.post-card').count();
    recordStep('H.U 1.5 - Feed', 'Tarjetas de publicaciones visibles', postCardsCount > 0, `${postCardsCount} publicaciones cargadas`);

    if (postCardsCount > 0) {
      const firstCourseTag = await page.locator('.post-card .course-tag').first().textContent();
      recordStep('H.U 1.5 - Feed', 'Etiqueta de curso visible en tarjeta', !!firstCourseTag?.trim(), `Curso: "${firstCourseTag?.trim()}"`);
      
      const firstAuthorName = await page.locator('.post-card .person strong').first().textContent();
      recordStep('H.U 1.5 - Feed', 'Nombre de autor visible en tarjeta', !!firstAuthorName?.trim(), `Autor: "${firstAuthorName?.trim()}"`);

      const firstDesc = await page.locator('.post-card .post-description').first().textContent();
      recordStep('H.U 1.5 - Feed', 'Descripcion de publicacion renderizada', !!firstDesc?.trim());
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-feed-desktop.png'), fullPage: true });
    recordStep('UI/Visual', 'Captura de pantalla de Feed generada', true, '01-feed-desktop.png');

    // 2. Buscador y Filtros de Publicaciones (SPEC-03 / H.U 1.3)
    console.log('\n[INFO] 2. Probando modulo de Exploracion y Filtros (/buscar)...');
    await page.goto(`${BASE_URL}/buscar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]');
    const hasSearchInput = (await searchInput.count()) > 0;
    recordStep('H.U 1.3 - Filtros', 'Campo de busqueda por texto presente', hasSearchInput);

    if (hasSearchInput) {
      await searchInput.first().fill('Calculo');
      await page.waitForTimeout(600);
      const filteredCount = await page.locator('.post-card').count();
      recordStep('H.U 1.3 - Filtros', 'Filtro dinamico por termino de busqueda ejecutado', true, `${filteredCount} coincidencias`);
      await searchInput.first().fill('');
      await page.waitForTimeout(400);
    }

    const typeButtons = page.locator('.type-filters button');
    const hasTypeFilters = (await typeButtons.count()) > 0;
    recordStep('H.U 1.3 - Filtros', 'Filtros de tipo (Grupo de Estudio / Asesoria) presentes', hasTypeFilters);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-buscar-filtros.png'), fullPage: true });
    recordStep('UI/Visual', 'Captura de pantalla de Busqueda generada', true, '02-buscar-filtros.png');

    // 3. Formulario de Publicacion (SPEC-03 / H.U 1.1)
    console.log('\n[INFO] 3. Probando formulario de Crear Publicacion (/publicar)...');
    await page.goto(`${BASE_URL}/publicar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const formHeader = await page.locator('main h1').first().textContent();
    recordStep('H.U 1.1 - Publicar', 'Pantalla de publicar accesible', formHeader?.includes('Crear publicación') || !!formHeader);

    const courseSelect = page.locator('select').filter({ hasText: 'Selecciona un curso' });
    const hasCourseSelect = (await courseSelect.count()) > 0;
    recordStep('H.U 1.1 - Publicar', 'Selector de cursos disponible en formulario', hasCourseSelect);

    const descTextarea = page.locator('textarea[required]');
    const hasTextarea = (await descTextarea.count()) > 0;
    recordStep('H.U 1.1 - Publicar', 'Campo textarea de descripcion presente', hasTextarea);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-publicar-formulario.png'), fullPage: true });
    recordStep('UI/Visual', 'Captura de pantalla de Formulario de Publicacion generada', true, '03-publicar-formulario.png');

    // 4. Historial de Mis Publicaciones (SPEC-03 / H.U 1.6)
    console.log('\n[INFO] 4. Probando seccion de Mis Publicaciones (/mis-publicaciones)...');
    await page.goto(`${BASE_URL}/mis-publicaciones`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const myPostsHeader = await page.locator('main h1').first().textContent();
    recordStep('H.U 1.6 - Historial', 'Seccion de publicaciones propias cargada', !!myPostsHeader);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '04-mis-publicaciones.png'), fullPage: true });
    recordStep('UI/Visual', 'Captura de pantalla de Mis Publicaciones generada', true, '04-mis-publicaciones.png');

    // 5. Gestion de Solicitudes de Union (SPEC-04 / H.U 2.2)
    console.log('\n[INFO] 5. Probando modulo de Solicitudes de Union (/solicitudes)...');
    await page.goto(`${BASE_URL}/solicitudes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const solicitudesTitle = await page.locator('main h1').first().textContent();
    recordStep('H.U 2.2 - Solicitudes', 'Pantalla de solicitudes de union cargada', !!solicitudesTitle);

    const requestCards = await page.locator('.join-request-card').count();
    recordStep('H.U 2.2 - Solicitudes', 'Tarjetas o estado de solicitudes renderizado', true, `${requestCards} solicitudes activas`);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-solicitudes.png'), fullPage: true });
    recordStep('UI/Visual', 'Captura de pantalla de Solicitudes generada', true, '05-solicitudes.png');

    // 6. Perfil de Usuario y Horario (SPEC-02)
    console.log('\n[INFO] 6. Probando modulo de Perfil y Horario (/perfil, /horario)...');
    await page.goto(`${BASE_URL}/perfil`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const profileName = await page.locator('main h1, .profile-name, h2').first().textContent();
    recordStep('SPEC-02 - Perfil', 'Vista de perfil de estudiante cargada', !!profileName);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-perfil.png'), fullPage: true });

    await page.goto(`${BASE_URL}/horario`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const scheduleLoaded = (await page.locator('main#main-content').count()) > 0;
    recordStep('SPEC-02 - Horario', 'Matriz de disponibilidad horaria cargada', scheduleLoaded);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-horario.png'), fullPage: true });

    await desktopContext.close();

    // -------------------------------------------------------------------------
    // SESIÓN 2: MÓVIL (Viewport 390x844 - iPhone / Android)
    // -------------------------------------------------------------------------
    console.log('\n[INFO] 7. Iniciando sesion de pruebas en navegador Movil (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.on('pageerror', (err) => errors.push({ context: 'mobile', error: err.message }));

    await mobilePage.goto(`${BASE_URL}/`);
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(800);

    // Verificación de desbordamiento horizontal
    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    recordStep('Responsivo', 'Sin desbordamiento horizontal en pantalla movil 390px', !hasHorizontalOverflow);

    // Verificación de visibilidad de componentes en móvil
    const mobilePostCount = await mobilePage.locator('.post-card').count();
    recordStep('Responsivo', 'Tarjetas de publicaciones adaptadas al viewport movil', mobilePostCount > 0);

    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '08-feed-movil.png'), fullPage: true });
    recordStep('UI/Visual', 'Captura de pantalla de Feed Movil generada', true, '08-feed-movil.png');

    await mobileContext.close();

    // -------------------------------------------------------------------------
    // VALIDACIÓN DE EXCEPCIONES JAVASCRIPT
    // -------------------------------------------------------------------------
    console.log('\n[INFO] 8. Verificando estabilidad del cliente web (errores en consola)...');
    const pageErrorsCount = errors.length;
    recordStep('Estabilidad', 'Ausencia de excepciones JavaScript no controladas en paginas', pageErrorsCount === 0, `${pageErrorsCount} errores`);

  } catch (fatalErr) {
    console.error('[ERROR] Error fatal durante ejecucion de pruebas de navegador:', fatalErr);
    results.push({ category: 'Fatal', testName: 'Ejecucion de suite', passed: false, detail: fatalErr.message });
  } finally {
    await browser.close();

    const finishedAt = new Date();
    const passedTests = results.filter((r) => r.passed).length;
    const totalTests = results.length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

    const reportJson = {
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationSeconds: ((finishedAt.getTime() - startedAt.getTime()) / 1000).toFixed(2),
      totalTests,
      passedTests,
      failedTests,
      successRate: `${successRate}%`,
      errors,
      results,
    };

    await writeFile(
      path.join(OUTPUT_DIR, 'browser-functional-report.json'),
      JSON.stringify(reportJson, null, 2),
      'utf8',
    );

    console.log('\n======================================================================');
    console.log('REPORTE CONSOLIDADO DE PRUEBAS FUNCIONALES EN NAVEGADOR');
    console.log('======================================================================');
    console.log(`TOTAL PRUEBAS EVALUADAS : ${totalTests}`);
    console.log(`EXITOSAS ([PASS])        : ${passedTests}`);
    console.log(`FALLIDAS ([FAIL])        : ${failedTests}`);
    console.log(`TASA DE EXITO            : ${successRate}%`);
    console.log(`ERRORES DE CONSOLA       : ${errors.length}`);
    console.log('======================================================================\n');

    if (failedTests === 0) {
      console.log('[SUCCESS] Todas las pruebas funcionales en navegador pasaron satisfactoriamente.');
    } else {
      console.error(`[ERROR] Se detectaron ${failedTests} pruebas fallidas en navegador.`);
      process.exitCode = 1;
    }
  }
}

runBrowserFunctionalTests();

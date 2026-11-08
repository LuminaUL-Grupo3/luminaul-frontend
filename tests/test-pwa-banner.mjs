import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

// 1. Iniciar servidor vite preview para probar el build de producción
const preview = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
  cwd: process.cwd(),
  stdio: 'pipe',
  shell: true,
});

await new Promise((resolve) => setTimeout(resolve, 2000));

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || 'msedge',
  headless: true,
});

try {
  console.log('--- INICIANDO PRUEBAS DE PWA BANNER ---');

  // PRUEBA 1: ESCRITORIO / PC
  console.log('1. Probando en PC de Escritorio (1440x900, UserAgent Windows Chrome)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://127.0.0.1:4173');
  
  // Simular evento beforeinstallprompt en escritorio
  await desktopPage.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    window.dispatchEvent(event);
  });
  await desktopPage.waitForTimeout(500);

  const desktopBanner = await desktopPage.locator('[aria-label="Instalar LuminaUL"]').count();
  if (desktopBanner === 0) {
    console.log('✅ ÉXITO: El banner NO aparece en PC de Escritorio.');
  } else {
    throw new Error('FALLO: El banner apareció en PC de Escritorio.');
  }
  await desktopContext.close();

  // PRUEBA 2: MÓVIL ANDROID
  console.log('2. Probando en Móvil Android (390x844, UserAgent Android Pixel 8)...');
  const androidContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    hasTouch: true,
  });
  const androidPage = await androidContext.newPage();
  await androidPage.goto('http://127.0.0.1:4173');
  
  // Simular evento beforeinstallprompt que Chrome dispara en Android
  await androidPage.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    window.dispatchEvent(event);
  });
  await androidPage.waitForTimeout(500);

  const androidBanner = await androidPage.locator('[aria-label="Instalar LuminaUL"]');
  const isAndroidBannerVisible = await androidBanner.isVisible();
  if (isAndroidBannerVisible) {
    const installButton = await androidPage.getByRole('button', { name: 'Instalar' });
    const isButtonVisible = await installButton.isVisible();
    console.log(`✅ ÉXITO: El banner APARECE en Android y tiene botón "Instalar": ${isButtonVisible}`);
  } else {
    throw new Error('FALLO: El banner no se mostró en Android.');
  }
  await androidContext.close();

  // PRUEBA 3: MÓVIL iOS (iPhone Safari)
  console.log('3. Probando en iPhone Safari (390x844, UserAgent iOS 17 Safari)...');
  const iosContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
  });
  const iosPage = await iosContext.newPage();
  await iosPage.goto('http://127.0.0.1:4173');
  await iosPage.waitForTimeout(500);

  const iosBanner = await iosPage.locator('[aria-label="Instalar LuminaUL"]');
  const isIosBannerVisible = await iosBanner.isVisible();
  if (isIosBannerVisible) {
    const hasInstruction = await iosPage.getByText('Añadir a inicio').isVisible();
    console.log(`✅ ÉXITO: El banner APARECE en iOS con guía "Añadir a inicio": ${hasInstruction}`);
  } else {
    throw new Error('FALLO: El banner no se mostró en iOS.');
  }
  await iosContext.close();

  console.log('--- TODAS LAS PRUEBAS PASARON EXITOSAMENTE ---');
} catch (err) {
  console.error('Error durante la prueba:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  preview.kill();
  process.exit(process.exitCode || 0);
}

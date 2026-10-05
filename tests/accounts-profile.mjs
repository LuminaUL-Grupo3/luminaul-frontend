import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.E2E_URL || 'http://localhost:5174';
if (new URL(base).port !== '5174') throw new Error('Esta prueba requiere el entorno aislado en 5174.');
const email = `navegador.${Date.now()}@aloe.ulima.edu.pe`, password = 'RegistroLocal2026!';
const results = [], errors = [], dialogs = [], failures = [];
await mkdir('analysis/validation', { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', async d => { dialogs.push(d.type()); await d.dismiss(); });
page.on('response', async r => {
  if (r.status() >= 500) failures.push(`${r.status()} ${r.url()}`);
});
async function code() {
  for (let attempt = 0; attempt < 30; attempt++) {
    const inbox = await (await fetch('http://127.0.0.1:8026/api/v1/messages?limit=100')).json();
    const mail = inbox.messages.find(m => m.To.some(to => to.Address === email) && m.Subject === 'Verifica tu cuenta de LuminaUL');
    if (mail) {
      const detail = await (await fetch(`http://127.0.0.1:8026/api/v1/message/${mail.ID}`)).json();
      return detail.Text.match(/\b\d{6}\b/)[0];
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('No llegó el correo de verificación.');
}
try {
  await page.goto(base + '/registro');
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page.getByText('Ingresa tu nombre completo.', { exact: true })).toBeVisible();
  await page.getByLabel('Nombre completo', { exact: true }).fill('Usuario de prueba');
  await page.getByLabel('Correo institucional', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page).toHaveURL(new RegExp('/verificar\\?email='));
  await expect(page.getByRole('link', { name: 'Abrir buzón local' })).toHaveAttribute('href', 'http://localhost:8026');
  await page.getByLabel('Código de verificación', { exact: true }).fill(await code());
  await page.getByRole('button', { name: 'Verificar cuenta' }).click();
  await expect(page).toHaveURL(base + '/login?verified=1');
  await page.getByLabel('Correo institucional', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(base + '/');
  results.push('Registro, correo SMTP, verificación y login reales');
  await page.goto(base + '/perfil');
  await expect(page.getByRole('heading', { name: 'Mi perfil', exact: true })).toBeVisible();
  await expect(page.getByText('Carrera por completar', { exact: true })).toBeVisible();
  await expect(page.getByText('Aún sin calificaciones', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('link', { name: 'Editar perfil', exact: true }).click();
  await page.getByLabel('Nombre completo', { exact: true }).fill('Usuario actualizado');
  await page.getByLabel('Descripción personal', { exact: true }).fill('Quiero repasar patrones de diseño.');
  await page.getByLabel('Carrera', { exact: true }).fill('Ingeniería de Sistemas');
  await page.getByLabel('Ciclo académico', { exact: true }).fill('4');
  await page.getByLabel('Habilidades', { exact: false }).fill('TypeScript, Trabajo en equipo');
  await page.getByLabel('Intereses', { exact: false }).fill('Software');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText('Perfil actualizado correctamente.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Volver a mi perfil' }).click();
  await expect(page.getByRole('heading', { name: 'Usuario actualizado', exact: true })).toBeVisible();
  await expect(page.getByText('Ingeniería de Sistemas · Ciclo 4', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('TypeScript', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: 'analysis/validation/cuentas-perfil.png', fullPage: true });
  results.push('Perfil sin datos inventados, guardado persistente y reseñas consultadas sin error');
  await page.goto(base + '/horario');
  await page.getByRole('button', { name: 'Agregar franja' }).click();
  let modal = page.getByRole('dialog', { name: 'Agregar horas libres' });
  await modal.getByLabel('Desde').fill('12:00');
  await modal.getByLabel('Hasta').fill('10:00');
  await modal.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(modal.getByRole('alert')).toContainText('posterior');
  await modal.getByLabel('Desde').fill('09:00');
  await modal.getByLabel('Hasta').fill('10:00');
  await modal.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('09:00 – 10:00', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('09:00 – 10:00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Agregar franja' }).click();
  modal = page.getByRole('dialog');
  await modal.getByLabel('Desde').fill('09:30'); await modal.getByLabel('Hasta').fill('10:30');
  await modal.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(modal.getByRole('alert')).toContainText('se cruza');
  await modal.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Editar franja', exact: true }).click();
  modal = page.getByRole('dialog', { name: 'Editar franja' });
  await modal.getByLabel('Día', { exact: true }).selectOption('2');
  await modal.getByRole('button', { name: 'Guardar horario' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.day-card').filter({ hasText: 'Martes' })).toContainText('09:00 – 10:00');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: 'analysis/validation/cuentas-horario.png', fullPage: true });
  await page.getByRole('button', { name: 'Eliminar franja', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar franja', exact: true }).click();
  await expect(page.getByText('09:00 – 10:00', { exact: true })).toHaveCount(0);
  results.push('Horario real: validar rango, crear, persistir, bloquear cruces, editar y eliminar con modal');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/perfil');
  await expect(page.getByRole('heading', { name: 'Usuario actualizado', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'analysis/validation/cuentas-movil.png', fullPage: true });
  expect(await page.locator('body').innerText()).not.toMatch(/Cannot (GET|POST|PUT|DELETE)/);
  expect(dialogs).toEqual([]); expect(errors).toEqual([]); expect(failures).toEqual([]);
  results.push('Móvil sin desbordamiento, errores técnicos ni alertas nativas');
  await writeFile('analysis/validation/cuentas-navegador.json', JSON.stringify({ status: 'PASS', results, errors, dialogs }, null, 2));
  console.log(`PASS navegador cuentas y perfil: ${results.length} grupos de comprobaciones`);
} catch (error) {
  await page.screenshot({ path: 'analysis/validation/cuentas-fallo.png', fullPage: true }).catch(() => {});
  throw error;
} finally { await context.close(); await browser.close(); }

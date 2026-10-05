import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(process.env.LUMINAUL_BACKEND_DIR || resolve(root, '../backend')), frontend = root;
const requireBackend = createRequire(resolve(backend, 'package.json'));
requireBackend('dotenv').config({ path: resolve(backend, '.env') });
const url = new URL(process.env.DATABASE_URL || '');
if (!['localhost','127.0.0.1'].includes(url.hostname) || url.port !== '55434' || url.pathname !== '/luminaul_equipo')
  throw new Error('Se requiere la base local aislada de equipo/backend/compose.yaml.');
const accountsOnly = process.argv.includes('--accounts-only');
if (!accountsOnly) {
  const integration = spawnSync(process.execPath, ['scripts/test-isolated.mjs'], { cwd: backend, stdio: 'inherit' });
  if (integration.status !== 0) process.exit(integration.status || 1);
}
url.pathname = '/luminaul_equipo_test';
const env = { ...process.env, DATABASE_URL: url.href, NODE_ENV: 'test', MAIL_HOST: '127.0.0.1', MAIL_PORT: '11026', MAIL_SECURE: 'false', MAIL_USER: '', MAIL_PASSWORD: '' };
const seeded = spawnSync(process.execPath, ['node_modules/ts-node/dist/bin.js','scripts/seed-local.ts'], { cwd: backend, env, stdio: 'inherit' });
if (seeded.status !== 0) process.exit(seeded.status || 1);
const { Client } = requireBackend('pg'), db = new Client({ connectionString: url.href });
await db.connect();
try {
  const id = 'b1300000-0000-4000-8000-000000000001';
  await db.query('DELETE FROM join_requests WHERE group_id=$1',[id]);
  await db.query("DELETE FROM group_members WHERE group_id=$1 AND role<>'admin'",[id]);
  await db.query("UPDATE groups SET name='Grupo de Ingeniería de Software II',max_capacity=6 WHERE id=$1",[id]);
} finally { await db.end(); }
mkdirSync(resolve(root,'analysis/validation'),{recursive:true});
const children = [];
function start(cwd,args,vars,label) {
  const child = spawn(process.execPath,args,{cwd,env:{...env,...vars},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const log = createWriteStream(resolve(root,`analysis/validation/${label}.log`));
  child.stdout.pipe(log); child.stderr.pipe(log); children.push(child); return child;
}
async function ready(endpoint, child) {
  for (let i=0;i<80;i++) {
    if (child.exitCode !== null) throw new Error(`El servicio terminó con código ${child.exitCode}`);
    try { if ((await fetch(endpoint)).ok) return; } catch {}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error(`El servicio no inició: ${endpoint}`);
}
try {
  const api = start(backend,['dist/main.js'],{PORT:'8001'},'backend-pruebas');
  const web = start(frontend,['node_modules/vite/bin/vite.js','--configLoader','runner','--host','127.0.0.1','--port','5174','--strictPort'],{BACKEND_URL:'http://127.0.0.1:8001'},'frontend-pruebas');
  await Promise.all([ready('http://localhost:8001/health',api),ready('http://localhost:5174/login',web)]);
  for (const test of accountsOnly ? ['accounts-profile'] : ['sprint2', 'accounts-profile']) {
    const ui = spawnSync(process.execPath,[`tests/${test}.mjs`],{cwd:frontend,env:{...env,E2E_URL:'http://localhost:5174'},stdio:'inherit',windowsHide:true});
    if (ui.status !== 0) { process.exitCode = ui.status || 1; break; }
  }
} finally { for (const child of children) child.kill(); }

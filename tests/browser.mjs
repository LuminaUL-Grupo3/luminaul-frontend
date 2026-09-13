import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base='http://localhost:5173',errors=[],results=[],started=new Date();
await mkdir('analysis/validation',{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
const contexts=[];
async function login(email,mobile=false){const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},reducedMotion:'reduce'});contexts.push(ctx);const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/login');await page.getByLabel('Correo institucional').fill(email);await page.getByLabel('Contraseña',{exact:true}).fill('LuminaDemo2026!');await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await expect(page).toHaveURL(base+'/');return {ctx,page};}
try{
 const {ctx,page}=await login('robert.demo@aloe.ulima.edu.pe');
 await expect(page.getByRole('heading',{name:'Hola, Robert.'})).toBeVisible();await expect(page.locator('.post-card').first()).toBeVisible();results.push('Login real desde formulario');
 await page.screenshot({path:'analysis/validation/feed-desktop.png',fullPage:true});
 for(const route of ['/buscar','/mis-publicaciones','/publicar','/grupos','/solicitudes','/perfil','/perfil/editar','/horario','/mis-resenas','/moderacion','/notificaciones','/configuracion']){
  await page.goto(base+route);await expect(page.locator('main h1').first()).toBeVisible();await expect(page.locator('.loading')).toHaveCount(0);results.push(`Navegación ${route}`);
  if(route==='/perfil')await page.screenshot({path:'analysis/validation/profile-desktop.png',fullPage:true});
 }
 const groups=await (await ctx.request.get(base+'/api/v1/groups')).json(),group=groups.find(g=>g.name==='Círculo de Software II').id;
 const ana=await login('ana.demo@aloe.ulima.edu.pe');await page.goto(`${base}/mensajes/${group}`);await ana.page.goto(`${base}/mensajes/${group}`);
 await expect(page.getByText('Conectado en tiempo real',{exact:true})).toBeVisible();await expect(ana.page.getByText('Conectado en tiempo real',{exact:true})).toBeVisible();
 const text=`Prueba de navegador ${Date.now()}: chat conectado.`;await page.getByLabel('Mensaje',{exact:true}).fill(text);await page.getByRole('button',{name:'Enviar mensaje',exact:true}).click();await expect(ana.page.getByText(text,{exact:true}).last()).toBeVisible();await ana.page.reload();await expect(ana.page.getByText(text,{exact:true}).last()).toBeVisible();results.push('Chat real entre dos navegadores, persistente al recargar');
 await page.screenshot({path:'analysis/validation/chat-desktop.png',fullPage:true});
 const mobile=await login('robert.demo@aloe.ulima.edu.pe',true);await expect(mobile.page.locator('.post-card').first()).toBeVisible();
 const overflow=await mobile.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);await mobile.page.screenshot({path:'analysis/validation/feed-mobile.png',fullPage:true});
 await mobile.page.getByRole('button',{name:'Abrir menú'}).click();await expect(mobile.page.locator('.sidebar.open')).toBeVisible();await mobile.page.getByRole('link',{name:'Mis grupos',exact:true}).click();await expect(mobile.page).toHaveURL(base+'/grupos');results.push('Navegación móvil 390px sin desbordamiento horizontal');
 const admin=await login('admin.demo@aloe.ulima.edu.pe');await admin.page.goto(base+'/admin');for(const label of ['Reportes','Apelaciones','Usuarios']){await admin.page.getByRole('button',{name:label,exact:true}).click();await expect(admin.page.locator('main h1')).toBeVisible();}results.push('Panel administrativo: tres pestañas');
 expect(errors).toEqual([]);results.push('Sin excepciones JavaScript de página');console.log(JSON.stringify(results,null,2));
}catch(error){console.error(error);process.exitCode=1;results.push(`FAIL: ${error.message}`);}
finally{await browser.close();await writeFile('analysis/validation/browser.json',JSON.stringify({started:started.toISOString(),finished:new Date().toISOString(),status:process.exitCode?'FAIL':'PASS',results,errors},null,2));}

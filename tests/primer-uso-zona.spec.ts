/**
 * Candado del evento `evt:primer-uso` de <ZonaHerramienta>.
 *
 * DE QUÉ CASO SALE (08/10/2026): el 44,6 % de las visitas dura 2-30 s y el analytics no sabe
 * si en ellas se llegó a usar la herramienta, que es lo que separa un rebote satisfecho de uno
 * frustrado. El piloto envuelve la zona de herramienta de 7 apps y emite el evento al primer
 * uso real; si el evento saltara al desplazarse o al pulsar un enlace, o se repitiera, la
 * medida contaría visitas que no usaron nada y la conclusión saldría al revés.
 *
 * QUÉ EXIGE
 *   1. Desplazarse, pulsar un enlace o abrir el contenido educativo (fuera de la zona) NO emiten.
 *   2. El primer uso de un control emite UNA vez, con `app` y `t` (segundos desde la carga).
 *   3. Un segundo uso en la misma carga no vuelve a emitir.
 *
 * LAS MISMAS TRES GUARDAS que `analytics-duracion-spa.spec.ts` (host de producción mapeado al
 * servidor local, `navigator.webdriver` falso y UA sin «Headless»). Con una diferencia buscada:
 * aquí TODO /api/analytics/ se contesta con `page.route` sin llegar al servidor, porque el
 * servidor local tiene las credenciales de Turso y la visita del test acabaría en producción.
 */
import { test, expect, type Page } from '@playwright/test';
import { PUERTO } from './apps/_puerto';

const ORIGEN = 'http://meskeia.com';
const UA_REAL =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36';

test.use({
  userAgent: UA_REAL,
  launchOptions: { args: [`--host-resolver-rules=MAP meskeia.com 127.0.0.1:${PUERTO}`] },
});

interface Envio {
  aplicacion: string;
  datos_adicionales?: { app?: string; t?: number };
}

/** Abre la app con las guardas sorteadas y devuelve la lista viva de envíos a /track. */
async function abrir(page: Page, slug: string): Promise<Envio[]> {
  const envios: Envio[] = [];
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
  });
  await page.route('**/api/analytics/**', async (ruta) => {
    const cuerpo = ruta.request().postData();
    if (ruta.request().url().includes('/api/analytics/track') && cuerpo) {
      envios.push(JSON.parse(cuerpo) as Envio);
    }
    await ruta.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"success"}' });
  });
  await page.goto(`${ORIGEN}/${slug}/`, { waitUntil: 'domcontentloaded' });
  // La visita la registra AnalyticsTracker en un efecto: que llegue prueba que React ya hidrató
  // y que los manejadores de la zona están puestos.
  await expect.poll(() => envios.some((e) => e.aplicacion === slug), { timeout: 20000 }).toBe(true);
  return envios;
}

const primerosUsos = (envios: Envio[]) => envios.filter((e) => e.aplicacion === 'evt:primer-uso');

test('tabla-valencias: desplazarse y los enlaces no cuentan; escribir en el buscador cuenta una vez', async ({ page }) => {
  const envios = await abrir(page, 'tabla-valencias');
  const zona = page.locator('[data-zona-herramienta="tabla-valencias"]');
  await expect(zona).toHaveCount(1);

  await page.mouse.wheel(0, 1500);
  // Un enlace con icono es el caso que el filtro de enlaces existe para cubrir: el <svg> por sí
  // solo cuenta como control (en un simulador es el lienzo), y pulsarlo dentro de un enlace es
  // irse, no usar. Se inyecta porque la zona de esta app no trae ninguno: sin él, el caso pasaba
  // también con el filtro quitado (comprobado al escribirlo).
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = '#prueba-enlace';
    a.id = 'prueba-enlace';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    a.appendChild(svg);
    document.querySelector('[data-zona-herramienta="tabla-valencias"]')?.prepend(a);
  });
  await page.locator('#prueba-enlace svg').dispatchEvent('pointerdown');
  await page.waitForTimeout(500);
  expect(primerosUsos(envios), 'emitió sin que se usara ningún control').toHaveLength(0);

  const buscador = page.locator('input[type="search"]').first();
  await buscador.scrollIntoViewIfNeeded();
  await buscador.fill('hierro');
  await expect.poll(() => primerosUsos(envios).length).toBe(1);
  const evento = primerosUsos(envios)[0];
  expect(evento.datos_adicionales?.app).toBe('tabla-valencias');
  expect(typeof evento.datos_adicionales?.t).toBe('number');

  await buscador.fill('cloro');
  await page.waitForTimeout(500);
  expect(primerosUsos(envios), 'se repitió en la misma carga').toHaveLength(1);
});

test('simulador-puertas-logicas: abrir el contenido educativo no cuenta; un botón de la herramienta sí', async ({ page }) => {
  const envios = await abrir(page, 'simulador-puertas-logicas');

  // El botón de la EducationalSection está FUERA de la zona: es leer, no usar la herramienta.
  const educativo = page.locator('[data-zona-herramienta] ~ * button').first();
  await expect(educativo, 'no hay botón tras la zona: el caso no probaría nada').toHaveCount(1);
  await educativo.scrollIntoViewIfNeeded();
  await educativo.click();
  await page.waitForTimeout(500);
  expect(primerosUsos(envios), 'emitió desde fuera de la zona').toHaveLength(0);

  const boton = page.locator('[data-zona-herramienta="simulador-puertas-logicas"] button').first();
  await boton.scrollIntoViewIfNeeded();
  await boton.click();
  await expect.poll(() => primerosUsos(envios).length).toBe(1);
  expect(primerosUsos(envios)[0].datos_adicionales?.app).toBe('simulador-puertas-logicas');
});

/**
 * Candado de la duración en la navegación client-side.
 *
 * DE QUÉ CASO SALE (16/09/2026, hito `analytics-sesion-dedicada`)
 * `AnalyticsTracker` enviaba la duración solo en `beforeunload`/`pagehide`, y un <Link> de
 * Next NO dispara ninguno de los dos: React desmonta el componente y monta el de la app
 * destino sin descargar la página. Resultado medido sobre el dump, aislando estancias reales
 * de 30 s o más para que la comparación no dependiera de la rapidez del salto: 17,9 % de
 * visitas sin duración cuando el salto era carga completa, frente al 46,4 % cuando era un
 * <Link>. Y la misma causa por su otra cara: los listeners nunca se retiraban, así que al
 * cerrar la pestaña cada app visitada recibía el tiempo de casi toda la sesión (duración
 * mayor que el hueco real en el 27,8 % de los saltos por <Link>, frente al 11,6 %).
 *
 * QUÉ EXIGE
 *   1. Que al salir de una app por un enlace interno se registre SU duración.
 *   2. Que no se registre DOS veces (el listener retirado no puede volver a disparar).
 *   3. Que una visita interrumpida (ocultar la pestaña y volver) registre la SUMA de sus
 *      tramos visibles, no el último ni el tiempo de reloj (23/10/2026: el contador se
 *      reiniciaba al volver y el `SET` del endpoint pisaba el tramo anterior; en estancias
 *      reales >= 60 s, el 30,9 % registraba <= 29 s).
 *   4. Que una visita de menos de 2 s también registre su duración (23/10/2026: hasta
 *      entonces el tracker no enviaba nada de 2 s o menos, y «sin dato» mezclaba la salida
 *      instantánea con la pérdida real).
 *
 * POR QUÉ ES UN TEST DE NAVEGADOR Y NO UN CANDADO ESTÁTICO
 * Lo que falla no es una forma del código sino un hecho del runtime —qué eventos dispara una
 * navegación client-side—, y ningún grep lo demuestra. La prueba de que el test mira de
 * verdad: al revertir el cleanup a su versión anterior, el primer `expect` falla.
 *
 * TRES GUARDAS QUE HAY QUE SORTEAR, porque el tracker se apaga solo fuera de producción:
 *   · `hostname` debe estar en HOSTS_PRODUCCION → se mapea meskeia.com al servidor local
 *     con --host-resolver-rules, en vez de interceptar y reescribir cada petición.
 *   · `navigator.webdriver` debe ser false → addInitScript sobre el prototipo.
 *   · el UA no puede contener «Headless» → se fija un UA de Chrome normal.
 */
import { test, expect, type Page } from '@playwright/test';

const PORT = 3050;
const ORIGEN = 'http://meskeia.com';
const UA_REAL =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36';

test.use({
  userAgent: UA_REAL,
  launchOptions: { args: [`--host-resolver-rules=MAP meskeia.com 127.0.0.1:${PORT}`] },
});

interface EnvioDuracion {
  aplicacion: string;
  duracion_segundos: number;
}

/**
 * Prepara la captura de los envíos a /api/analytics/duration/.
 *
 * ⚠️ NO vale `page.on('request')`: la duración sale por `navigator.sendBeacon`, que no se
 * expone como petición interceptable —el POST de entrada sí, porque ese es un `fetch`—. El
 * síntoma es cruel, porque cero beacons capturados es indistinguible de cero beacons
 * enviados, que es justo el defecto que este fichero vigila. Se envuelven las dos salidas
 * que usa el tracker (sendBeacon y su fallback de fetch) delegando siempre en la original,
 * así que lo que se mide es el envío de verdad.
 */
async function prepararCaptura(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __duraciones: string[]; __entradas: number };
    w.__duraciones = [];
    w.__entradas = 0;
    const esDuracion = (url: unknown) => String(url).includes('/api/analytics/duration');
    const esEntrada = (url: unknown) => String(url).includes('/api/analytics/track');
    const anotar = (cuerpo: unknown) => {
      if (cuerpo instanceof Blob) void cuerpo.text().then((t) => w.__duraciones.push(t));
      else if (typeof cuerpo === 'string') w.__duraciones.push(cuerpo);
    };
    const beaconOriginal = navigator.sendBeacon?.bind(navigator);
    if (beaconOriginal) {
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
        if (esDuracion(url)) anotar(data);
        return beaconOriginal(url, data);
      };
    }
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input : input.url;
      if (esDuracion(url)) anotar(init?.body);
      if (esEntrada(url)) w.__entradas++;
      return fetchOriginal(input, init);
    };
  });
}

/**
 * Espera a que el tracker se haya montado, que es cuando empieza a contar: su primer acto
 * es el POST de entrada. Cronometrar desde `domcontentloaded` mediría también la
 * hidratación, que en `next dev` puede llevarse un segundo o más, y los casos de abajo
 * comparan cifras de pocos segundos.
 *
 * ⚠️ Y descarta lo capturado hasta ese momento, a propósito. En `next dev`, React StrictMode
 * monta, desmonta y vuelve a montar cada efecto (2 POST de entrada por carga, medido el
 * 23/10/2026), y ese desmontaje simulado envía una duración de 0 s. En producción no hay
 * doble montaje y ese envío no existe; hasta el 23/10 tampoco se veía en dev, porque el
 * umbral de 2 s se lo tragaba. Sin descartarlo, los casos contarían un envío que solo
 * existe en el servidor de pruebas.
 */
async function esperarMontaje(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __entradas: number }).__entradas > 0, null, {
    timeout: 15000,
  });
  await page.waitForTimeout(300); // el Blob del beacon se lee en asíncrono
  await page.evaluate(() => {
    (window as unknown as { __duraciones: string[] }).__duraciones = [];
  });
}

/** Simula ocultar o mostrar la pestaña: lo que el tracker lee es `document.hidden`. */
async function cambiarVisibilidad(page: Page, oculta: boolean) {
  await page.evaluate((o) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => o });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (o ? 'hidden' : 'visible'),
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, oculta);
}

/** Sale de calculadora-iva por el primer enlace de RelatedApps (salto client-side). */
async function saltarPorRelacionada(page: Page) {
  const relacionada = page.locator('a[href*="#from=related-"]').first();
  await expect(relacionada, 'la app de partida debe tener RelatedApps para poder saltar').toBeVisible();
  await relacionada.click();
  await page.waitForFunction((d) => window.location.pathname !== d, '/calculadora-iva/', { timeout: 10000 });
  await page.waitForTimeout(1000); // margen para que salga el beacon
}

/** Envíos capturados hasta ahora, ya parseados, filtrados por app. */
async function duracionesDe(page: Page, app: string): Promise<EnvioDuracion[]> {
  const crudos = await page.evaluate(() => (window as unknown as { __duraciones: string[] }).__duraciones);
  return crudos
    .map((t) => JSON.parse(t) as EnvioDuracion)
    .filter((e) => e.aplicacion === app);
}

test('la duración se registra al salir de una app por un enlace interno', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
  });
  await prepararCaptura(page);

  await page.goto(`${ORIGEN}/calculadora-iva/`, { waitUntil: 'domcontentloaded' });
  await esperarMontaje(page);
  // Se esperan 4 s para que la cifra se distinga de una salida instantánea.
  await page.waitForTimeout(4000);

  // Salto client-side: el primer enlace de RelatedApps lleva #from=related-<slug>.
  const relacionada = page.locator('a[href*="#from=related-"]').first();
  await expect(relacionada, 'la app de partida debe tener RelatedApps para poder saltar').toBeVisible();
  const destino = await relacionada.getAttribute('href');
  await relacionada.click();
  await page.waitForFunction(
    (d) => window.location.pathname !== d,
    '/calculadora-iva/',
    { timeout: 10000 }
  );
  await page.waitForTimeout(1000); // margen para que salga el beacon

  const deOrigen = await duracionesDe(page, 'calculadora-iva');
  expect(
    deOrigen.length,
    `sin envío de duración al saltar a ${destino}: es el defecto del 16/09/2026 (un <Link> ` +
      `no dispara beforeunload ni pagehide, así que el cleanup del efecto es la única ocasión)`
  ).toBeGreaterThan(0);
  expect(deOrigen[0].duracion_segundos).toBeGreaterThanOrEqual(3);

  // La segunda mitad del defecto: el listener retirado no puede volver a disparar. Sin el
  // removeEventListener, al cerrar la página el beforeunload colgado reenviaría la app de
  // origen con el tiempo acumulado de toda la sesión.
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await page.waitForTimeout(500);
  expect(
    (await duracionesDe(page, 'calculadora-iva')).length,
    'la duración de la app abandonada se envió dos veces: el listener sigue colgado en window'
  ).toBe(deOrigen.length);
});

test('la duración también se registra al abandonar el sitio (carga completa)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
  });
  await prepararCaptura(page);

  await page.goto(`${ORIGEN}/calculadora-iva/`, { waitUntil: 'domcontentloaded' });
  await esperarMontaje(page);
  await page.waitForTimeout(4000);
  // Camino que ya funcionaba antes de la reparación: se comprueba que sigue funcionando y,
  // sobre todo, que sigue enviándose UNA sola vez por salida.
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await page.waitForTimeout(500);

  expect(await duracionesDe(page, 'calculadora-iva')).toHaveLength(1);
});

test('una visita interrumpida registra la SUMA de sus tramos visibles', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
  });
  await prepararCaptura(page);

  await page.goto(`${ORIGEN}/calculadora-iva/`, { waitUntil: 'domcontentloaded' });
  await esperarMontaje(page);
  // 4 s visible · 4 s oculta · 4 s visible · salida por <Link>. Lo correcto son ~8 s.
  // El defecto anterior guardaba 4 (el último tramo: el contador se reiniciaba al volver
  // y el SET pisaba); contar el reloj daría 12 (la pestaña oculta no es estancia).
  await page.waitForTimeout(4000);
  await cambiarVisibilidad(page, true);
  await page.waitForTimeout(4000);
  await cambiarVisibilidad(page, false);
  await page.waitForTimeout(4000);
  await saltarPorRelacionada(page);

  const envios = await duracionesDe(page, 'calculadora-iva');
  expect(envios.length, 'debe haber un envío al ocultar y otro al salir').toBeGreaterThanOrEqual(2);
  // El endpoint guarda el MAYOR de los envíos (MAX en el UPDATE), así que lo que queda en la
  // base es el máximo, no el último que llegue.
  const guardado = Math.max(...envios.map((e) => e.duracion_segundos));
  expect(
    guardado,
    `se guardaría ${guardado} s de ~8 visibles: solo el último tramo (envíos: ` +
      `${envios.map((e) => e.duracion_segundos).join(', ')})`
  ).toBeGreaterThanOrEqual(7);
  expect(guardado, `${guardado} s cuenta el tiempo con la pestaña oculta`).toBeLessThanOrEqual(10);
});

test('una pestaña abierta en segundo plano no cuenta el tiempo antes de mostrarse', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
    // Se monta OCULTA y sin evento, como una pestaña abierta con clic central.
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
  });
  await prepararCaptura(page);

  await page.goto(`${ORIGEN}/calculadora-iva/`, { waitUntil: 'domcontentloaded' });
  await esperarMontaje(page);
  // 4 s oculta antes de verla · 3 s visible · salida. Lo correcto son ~3 s, no ~7.
  await page.waitForTimeout(4000);
  await cambiarVisibilidad(page, false);
  await page.waitForTimeout(3000);
  await saltarPorRelacionada(page);

  const envios = await duracionesDe(page, 'calculadora-iva');
  expect(envios.length).toBeGreaterThan(0);
  const guardado = Math.max(...envios.map((e) => e.duracion_segundos));
  expect(guardado, `${guardado} s incluye el tiempo en que nadie había visto la pestaña`).toBeLessThanOrEqual(4);
  expect(guardado).toBeGreaterThanOrEqual(2);
});

test('una visita de menos de 2 s también registra su duración', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
  });
  await prepararCaptura(page);

  await page.goto(`${ORIGEN}/calculadora-iva/`, { waitUntil: 'domcontentloaded' });
  await esperarMontaje(page);
  await saltarPorRelacionada(page); // sin esperar: salida casi instantánea

  const envios = await duracionesDe(page, 'calculadora-iva');
  expect(
    envios.length,
    'sin envío en una visita corta: el umbral de 2 s sigue puesto, y «sin dato» vuelve a ' +
      'mezclar la salida instantánea con la pérdida real'
  ).toBe(1);
  expect(envios[0].duracion_segundos).toBeLessThanOrEqual(2);
});

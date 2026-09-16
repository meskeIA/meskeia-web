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
    const w = window as unknown as { __duraciones: string[] };
    w.__duraciones = [];
    const esDuracion = (url: unknown) => String(url).includes('/api/analytics/duration');
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
      return fetchOriginal(input, init);
    };
  });
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
  // El tracker solo envía duraciones de más de 2 s (salida instantánea = sin dato, por
  // diseño). Se esperan 4 para quedar del lado seguro del umbral.
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
  await page.waitForTimeout(4000);
  // Camino que ya funcionaba antes de la reparación: se comprueba que sigue funcionando y,
  // sobre todo, que sigue enviándose UNA sola vez por salida.
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await page.waitForTimeout(500);

  expect(await duracionesDe(page, 'calculadora-iva')).toHaveLength(1);
});

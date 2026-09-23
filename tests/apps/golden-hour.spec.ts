import { test, expect, type Page, type Browser } from '@playwright/test';
import { esperarHidratacion, leerValorEnReact, sembrarValor } from './_hidratacion';

/**
 * Golden Hour — test de regresión (Inspector, 23/09/2026, primera inspección)
 *
 * La app promete las horas de luz de un lugar y una fecha: crepúsculos astronómico, náutico y
 * civil, amanecer, fin de la hora dorada de la mañana, mediodía solar, inicio de la hora dorada
 * de la tarde, atardecer y fin de la hora azul, más la duración del día y la altura del sol
 * «ahora». La ubicación se fija con la geolocalización del navegador o buscando una ciudad
 * (Nominatim); no se pueden escribir coordenadas.
 *
 * DEFINICIONES QUE USA (el texto educativo y el cálculo COINCIDEN):
 *   hora azul   = sol entre 0° y −6°  → [crepúsculo civil (−6°), orto (−0,833°)] y simétrica
 *   hora dorada = sol entre 0° y +6°  → [orto (−0,833°), +6°] y simétrica por la tarde
 *   orto y ocaso con la refracción estándar de −0,833°.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO
 *   De una implementación propia del algoritmo de la NOAA Solar Calculator (Meeus: longitud
 *   media, anomalía, ecuación del centro, oblicuidad corregida, declinación y ecuación del
 *   tiempo, iterado en el instante del evento), escrita ANTES de abrir la app y sin copiar
 *   nada de ella. Las horas van en el huso civil del LUGAR en esa fecha:
 *     Madrid 21/06/2026 (UTC+2)            orto 06:44:45 · +6° 07:25:51 · mediodía 14:16:38
 *                                          +6° 21:07:25 · ocaso 21:48:31 · −6° 22:21:43
 *                                          día 903,8 min = 15h 4min
 *                                          altura geométrica a las 12:00Z: 72,66°
 *     Ciudad de México 15/03/2026 (UTC−6) orto 06:44:42 · mediodía 12:45:20 · ocaso 18:46:14
 *                                          día 721,5 min = 12h 2min
 *     Buenos Aires 21/06/2026 (UTC−3)      orto 08:00:20 · ocaso 17:50:25
 *     Tromsø 21/06/2026 (69,65 N)          el sol no baja de +3,09°: no hay orto, ocaso ni hora
 *                                          azul; el día dura 24 h
 *     Oslo 21/06/2026 (59,91 N)            el sol baja a −6,65°: hay crepúsculo civil, pero no
 *                                          náutico (−12°) ni astronómico (−18°)
 *     Ushuaia 19/03/2026 → día 735,5 min (12h 16min) · 20/03/2026 → 731,0 min (12h 11min)
 *
 * TOLERANCIAS, por el tamaño del defecto que vigila cada caso:
 *   ±2 min en orto, ocaso, mediodía y duración; ±3 min en los límites de las horas dorada y
 *   azul. El defecto de la hora mueve 60 min y el del huso, 5 h; el del día desplazado en
 *   Ushuaia, 4,5 min — por eso ese caso usa ±2 y no más.
 *
 * ⚠️ La fecha de la app es la de HOY por defecto: cada caso la siembra con un valor distinto
 *   del de hoy, y los que dependen de «ahora» fijan el reloj con `page.clock`.
 * ⚠️ Nominatim (geocodificación) se sirve simulado con `page.route`: el test no depende de la
 *   red ni del nombre que devuelva, solo de las coordenadas.
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER: la altura del sol «ahora» (72,7° frente a 72,66°), la
 * duración del día en latitudes medias, y que en el sol de medianoche y en la noche blanca la
 * app NO inventa horas de orto, ocaso ni crepúsculos que no existen (sale «--:--»).
 *
 * LOS HALLAZGOS (1233-1248) se repararon el 23/09/2026 reescribiendo el cálculo en
 * `app/golden-hour/motor.ts`; sus casos quedan como regresión, sin `test.fail()`.
 */

test.use({ locale: 'es-ES', serviceWorkers: 'block' });

const FECHA = 'input[type="date"]';

interface CiudadNominatim {
  display_name: string;
  lat: string;
  lon: string;
  /** addressdetails: de aquí saca la app el huso del lugar (hallazgo 1235). */
  address?: { country_code: string };
}

/** Nominatim simulado: inversa (coordenadas → nombre) y búsqueda (nombre → coordenadas). */
async function simularNominatim(page: Page, ciudades: CiudadNominatim[] = []): Promise<void> {
  await page.route('https://nominatim.openstreetmap.org/**', async (ruta) => {
    const esBusqueda = ruta.request().url().includes('/search');
    await ruta.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(
        esBusqueda ? ciudades : { address: { city: 'Lugar de prueba', country: 'País' } },
      ),
    });
  });
}

/**
 * Abre la app, fija la fecha y la ubicación con la geolocalización del contexto.
 * Con `yaEsLaDeHoy` (casos con `page.clock` fijado ESE día) la fecha ya es la de por defecto:
 * sembrarla sería un no-op que no prueba nada, así que solo se comprueba que el estado la tiene.
 */
async function abrirConGeolocalizacion(
  page: Page,
  fecha: string,
  { yaEsLaDeHoy = false }: { yaEsLaDeHoy?: boolean } = {},
): Promise<void> {
  await simularNominatim(page);
  await page.goto('/golden-hour/');
  await esperarHidratacion(page, [FECHA]);
  if (yaEsLaDeHoy) {
    expect(await leerValorEnReact(page, FECHA), 'fecha por defecto con el reloj fijado').toBe(fecha);
  } else {
    await sembrarValor(page, FECHA, fecha);
  }
  await page.getByRole('button', { name: /Usar mi ubicación/ }).click();
  await expect(page.getByRole('heading', { name: /Detalle completo/ })).toBeVisible();
}

/** Abre la app, siembra la fecha y fija la ubicación eligiendo una ciudad del buscador. */
async function abrirConBusqueda(page: Page, fecha: string, ciudad: CiudadNominatim): Promise<void> {
  const nombre = ciudad.display_name.split(',')[0];
  await simularNominatim(page, [ciudad]);
  await page.goto('/golden-hour/');
  await esperarHidratacion(page, [FECHA]);
  await sembrarValor(page, FECHA, fecha);
  await page.getByPlaceholder(/Buscar ciudad/).fill(nombre);
  await page.getByRole('button', { name: new RegExp(nombre) }).click();
  await expect(page.getByRole('heading', { name: /Detalle completo/ })).toBeVisible();
}

/** Texto de una fila de la tabla «Detalle completo» (sección Mañana o Tarde). */
async function hora(page: Page, seccion: 'Mañana' | 'Tarde', etiqueta: string): Promise<string> {
  const fila = page
    .locator('[class*="tableSection"]')
    .filter({ has: page.getByRole('heading', { name: new RegExp(seccion) }) })
    .locator('[class*="tableRow"]')
    .filter({ hasText: etiqueta });
  return (await fila.locator('span').last().innerText()).trim();
}

/** «HH:MM» → minutos del día. Lanza si no es una hora, para no comparar basura con números. */
function minutos(hhmm: string): number {
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) throw new Error(`«${hhmm}» no es una hora HH:MM`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Diferencia en minutos entre dos horas del día, por el camino corto (cruza medianoche). */
function desfase(obtenida: string, esperada: string): number {
  let d = minutos(obtenida) - minutos(esperada);
  if (d > 720) d -= 1440;
  if (d < -720) d += 1440;
  return Math.abs(d);
}

/** «🌞 Duración del día: 15h 3min» → 903. Devuelve NaN si no tiene esa forma. */
async function duracionDia(page: Page): Promise<{ texto: string; min: number }> {
  const texto = (await page.locator('[class*="dayLength"]').innerText()).trim();
  const m = texto.match(/(-?\d+)h (-?\d+)min/);
  return { texto, min: m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN };
}

async function esperarHora(
  page: Page,
  seccion: 'Mañana' | 'Tarde',
  etiqueta: string,
  esperada: string,
  tolerancia: number,
): Promise<void> {
  const obtenida = await hora(page, seccion, etiqueta);
  expect(
    desfase(obtenida, esperada),
    `${etiqueta} (${seccion}): esperado ${esperada} ±${tolerancia} min, obtenido ${obtenida}`,
  ).toBeLessThanOrEqual(tolerancia);
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// CASO 1 (normal) — Madrid, 21/06/2026, navegador en Madrid
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Madrid 21/06/2026 con el navegador en Madrid', () => {
  test.use({
    timezoneId: 'Europe/Madrid',
    geolocation: { latitude: 40.4168, longitude: -3.7038 },
    permissions: ['geolocation'],
  });

  test('la duración del día y la altura del sol «ahora» son correctas', async ({ page }) => {
    // 21/06/2026 12:00Z = 14:00 CEST, junto al mediodía solar: altura geométrica NOAA 72,66°.
    await page.clock.setFixedTime(new Date('2026-06-21T12:00:00Z'));
    await abrirConGeolocalizacion(page, '2026-06-21', { yaEsLaDeHoy: true });

    // NOAA: 903,8 min = 15h 4min. La duración es una DIFERENCIA, así que no la mueve el
    // hallazgo de la hora (todas las horas se desplazan lo mismo).
    const dia = await duracionDia(page);
    expect(Math.abs(dia.min - 903.8), `duración: ${dia.texto}`).toBeLessThanOrEqual(2);

    const panel = await page.locator('[class*="sunPosition"]').innerText();
    const m = panel.match(/Sol a (-?\d+)[.,](\d)°/);
    expect(m, `panel de posición: «${panel}»`).not.toBeNull();
    const altura = Number(`${m![1]}.${m![2]}`);
    expect(Math.abs(altura - 72.66), `altura: ${panel}`).toBeLessThanOrEqual(0.3);
  });

  // HALLAZGO 1233 (crítico, REPARADO) — TODAS las horas salían 60 min antes: la hora UTC se
  // obtenía como `((…)/15 + 24) % 24`, que en JavaScript queda NEGATIVA, y `Math.floor` restaba
  // una hora. El cálculo vive ahora en `app/golden-hour/motor.ts` (NOAA, cruces de altura).
  test('las horas publicadas son las del lugar (hallazgo 1233)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-06-21');
    await esperarHora(page, 'Mañana', 'Amanecer', '06:45', 2);
    await esperarHora(page, 'Mañana', 'Hora dorada (fin)', '07:26', 3);
    await esperarHora(page, 'Tarde', 'Mediodía solar', '14:17', 2);
    await esperarHora(page, 'Tarde', 'Hora dorada (inicio)', '21:07', 3);
    await esperarHora(page, 'Tarde', 'Atardecer', '21:48', 2);
    await esperarHora(page, 'Tarde', 'Hora azul (fin)', '22:22', 3);
  });

  // HALLAZGO 1237 (medio, REPARADO) — a las 07:00 CEST, con el sol a +1,65° recién salido, el
  // panel decía «Hora Dorada (tarde)» y no mostraba «Próximo»: los instantes caían en la víspera.
  // Ahora «mañana/tarde» sale de si el sol sube, y el próximo evento se busca en víspera, hoy y
  // mañana del huso del lugar. NOAA: fin de la dorada a las 07:25:51.
  test('a las 07:00 el panel dice «mañana» y anuncia el próximo evento (hallazgo 1237)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-06-21T05:00:00Z'));
    await abrirConGeolocalizacion(page, '2026-06-21', { yaEsLaDeHoy: true });
    const panel = page.locator('[class*="currentPanel"]');
    await expect(panel).toContainText(/Sol a 1[.,]\d° de altitud/); // preparación: ya hay posición
    await expect(panel).toContainText('Hora Dorada (mañana)');
    await expect(panel).toContainText(/Próximo: Fin hora dorada a las 07:2[5-7]/);
    // Hallazgo 1246: el azimut que prometía el JSON-LD ahora se publica (NOAA 60,1°, NE).
    await expect(panel).toContainText(/azimut 60° \(NE\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// CASO 1 bis (normal, Latam) — Ciudad de México, 15/03/2026, navegador en CDMX (UTC−6 fijo)
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Ciudad de México 15/03/2026 con el navegador en CDMX', () => {
  test.use({
    timezoneId: 'America/Mexico_City',
    geolocation: { latitude: 19.4326, longitude: -99.1332 },
    permissions: ['geolocation'],
  });

  // HALLAZGO 1234 (alto, REPARADO) — el ocaso (00:46 UTC del día siguiente) caía en la víspera,
  // antes que el orto: «Duración del día: −12h −59min» y «Mediodía solar 23:45».
  // NOAA: día 12h 2min (721,5 min), orto 06:44:42, mediodía 12:45:20 y ocaso 18:46:14.
  test('la duración del día es positiva y el mediodía cae entre orto y ocaso (hallazgo 1234)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-03-15');
    const dia = await duracionDia(page);
    expect(Math.abs(dia.min - 721.5), `duración: ${dia.texto}`).toBeLessThanOrEqual(2);
    const orto = minutos(await hora(page, 'Mañana', 'Amanecer'));
    const mediodia = minutos(await hora(page, 'Tarde', 'Mediodía solar'));
    const ocaso = minutos(await hora(page, 'Tarde', 'Atardecer'));
    expect(orto < mediodia && mediodia < ocaso, `orto ${orto} · mediodía ${mediodia} · ocaso ${ocaso}`).toBe(true);
    await esperarHora(page, 'Mañana', 'Amanecer', '06:45', 2);
    await esperarHora(page, 'Tarde', 'Mediodía solar', '12:45', 2);
    await esperarHora(page, 'Tarde', 'Atardecer', '18:46', 2);
  });

  // HALLAZGO 1238 (medio, REPARADO) — la fecha por defecto se tomaba en UTC (`toISOString`): a
  // las 20:00 del 15/03 en CDMX (02:00Z del 16) la app abría con el 16/03.
  test('a las 20:00 la fecha por defecto es la de hoy (hallazgo 1238)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-03-16T02:00:00Z'));
    await page.goto('/golden-hour/');
    await esperarHidratacion(page, [FECHA]);
    expect(await leerValorEnReact(page, FECHA)).toBe('2026-03-15');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO 1235 (alto, REPARADO) — las horas salían en el huso del NAVEGADOR y la app no lo
// decía: un fotógrafo en Madrid que planificaba Buenos Aires el 21/06/2026 leía «Amanecer
// 12:00». La reparación CONVIERTE al huso del lugar: al elegir una ciudad, Nominatim da su país
// (addressdetails) y el navegador, los husos de ese país (`Intl.Locale#getTimeZones`). Si el país
// tiene uno solo, se usa; si tiene varios, se elige el más cercano y se pide comprobarlo; y el
// huso se rotula SIEMPRE, con un selector para cambiarlo. NOAA, hora de Buenos Aires (UTC−3):
// orto 08:00:20.
// ─────────────────────────────────────────────────────────────────────────────────────────
const BUENOS_AIRES: CiudadNominatim = {
  display_name: 'Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina',
  lat: '-34.6037',
  lon: '-58.3816',
  address: { country_code: 'ar' },
};

async function amanecerConNavegadorEn(browser: Browser, timezoneId: string): Promise<string> {
  const contexto = await browser.newContext({ timezoneId, locale: 'es-ES', serviceWorkers: 'block' });
  try {
    const page = await contexto.newPage();
    await abrirConBusqueda(page, '2026-06-21', BUENOS_AIRES);
    // Hallazgo 1247: la latitud sur, sin signo menos y con coma decimal.
    await expect(page.locator('[class*="currentLocation"]')).toContainText('34,6037°S, 58,3816°O');
    await expect(page.getByLabel('Horas en el huso:')).toHaveValue(/Buenos_Aires/);
    return await hora(page, 'Mañana', 'Amanecer');
  } finally {
    await contexto.close();
  }
}

test('Buenos Aires: la hora no depende del huso del navegador (hallazgo 1235)', async ({ browser }) => {
  const desdeBuenosAires = await amanecerConNavegadorEn(browser, 'America/Argentina/Buenos_Aires');
  const desdeMadrid = await amanecerConNavegadorEn(browser, 'Europe/Madrid');
  expect(desfase(desdeMadrid, '08:00'), `amanecer de Buenos Aires con el navegador en Madrid: ${desdeMadrid}`).toBeLessThanOrEqual(2);
  expect(desfase(desdeBuenosAires, '08:00'), `con el navegador en Buenos Aires: ${desdeBuenosAires}`).toBeLessThanOrEqual(2);
});

test.describe('Lugar sin país conocido, navegador en Madrid', () => {
  test.use({ timezoneId: 'Europe/Madrid' });

  test('avisa de que usa el huso del dispositivo y se puede cambiar a mano (hallazgo 1235)', async ({ page }) => {
    const sinPais: CiudadNominatim = { ...BUENOS_AIRES, address: undefined };
    await abrirConBusqueda(page, '2026-06-21', sinPais);
    await expect(page.getByText(/No sabemos el huso de este lugar/)).toBeVisible();
    // En el huso de Madrid, el orto de Buenos Aires (11:00:20Z) son las 13:00.
    await esperarHora(page, 'Mañana', 'Amanecer', '13:00', 2);
    // El navegador lista el nombre canónico (America/Buenos_Aires): se elige por lo que contiene.
    const selector = page.getByLabel('Horas en el huso:');
    const valor = await selector.locator('option', { hasText: 'Buenos_Aires' }).first().getAttribute('value');
    await selector.selectOption(valor!);
    await esperarHora(page, 'Mañana', 'Amanecer', '08:00', 2);
    await expect(page.getByText(/No sabemos el huso de este lugar/)).toHaveCount(0);
  });
});

test.describe('Las Palmas (España, dos husos), navegador en Madrid', () => {
  test.use({ timezoneId: 'Europe/Madrid' });

  test('elige el huso canario y pide comprobarlo (hallazgo 1235)', async ({ page }) => {
    const lasPalmas: CiudadNominatim = {
      display_name: 'Las Palmas de Gran Canaria, Canarias, España',
      lat: '28.1235',
      lon: '-15.4363',
      address: { country_code: 'es' },
    };
    await abrirConBusqueda(page, '2026-06-21', lasPalmas);
    await expect(page.getByLabel('Horas en el huso:')).toHaveValue('Atlantic/Canary');
    await expect(page.getByText(/tiene varios husos horarios/)).toBeVisible();
    // NOAA, hora canaria (UTC+1): orto 07:05.
    await esperarHora(page, 'Mañana', 'Amanecer', '07:05', 2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// CASO 2 (límite) — sol de medianoche y noche blanca, 21/06/2026
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Tromsø 21/06/2026: sol de medianoche', () => {
  test.use({
    timezoneId: 'Europe/Oslo',
    geolocation: { latitude: 69.6492, longitude: 18.9553 },
    permissions: ['geolocation'],
  });

  test('no inventa orto, ocaso ni hora azul', async ({ page }) => {
    // NOAA: el sol no baja de +3,09° → ninguno de estos eventos existe.
    await abrirConGeolocalizacion(page, '2026-06-21');
    expect(await hora(page, 'Mañana', 'Amanecer')).toBe('--:--');
    expect(await hora(page, 'Mañana', 'Hora azul (inicio)')).toBe('--:--');
    expect(await hora(page, 'Tarde', 'Atardecer')).toBe('--:--');
    expect(await hora(page, 'Tarde', 'Hora azul (fin)')).toBe('--:--');
  });

  // HALLAZGO 1236 (medio, REPARADO) — con el sol siempre por encima del horizonte salía
  // «Duración del día: 0h 0min», mediodía «--:--» y ningún bloque de hora dorada. NOAA: el sol
  // pasa la noche entre +3,09° y +6°, hora dorada continua de 22:35 a 02:57, mediodía 12:46.
  test('con sol de medianoche: 24 h, mediodía y hora dorada nocturna (hallazgo 1236)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-06-21');
    const dia = await duracionDia(page);
    expect(dia.min, `duración: ${dia.texto}`).toBe(1440);
    expect(dia.texto).toContain('sol de medianoche');
    await esperarHora(page, 'Tarde', 'Mediodía solar', '12:46', 2);
    await esperarHora(page, 'Mañana', 'Hora dorada (fin)', '02:57', 3);
    await esperarHora(page, 'Tarde', 'Hora dorada (inicio)', '22:35', 3);
    const bloques = page.locator('[class*="timeBlock"]');
    await expect(bloques.filter({ hasText: 'Hora Dorada (mañana)' })).toContainText(/Desde la noche - 02:5\d/);
    await expect(bloques.filter({ hasText: 'Hora Dorada (tarde)' })).toContainText(/22:3\d - toda la noche/);
  });
});

test.describe('Oslo 21/06/2026: noche blanca', () => {
  test.use({
    timezoneId: 'Europe/Oslo',
    geolocation: { latitude: 59.9139, longitude: 10.7522 },
    permissions: ['geolocation'],
  });

  test('sin crepúsculo náutico ni astronómico, pero con civil', async ({ page }) => {
    // El fin de la hora azul (NOAA 00:28 del 22/06) pertenece a la TARDE del 21 y se marca como
    // del día siguiente, en la etiqueta y no en la hora.
    // NOAA: el sol baja a −6,65° → cruza −6° (civil) pero nunca −12° ni −18°.
    await abrirConGeolocalizacion(page, '2026-06-21');
    expect(await hora(page, 'Mañana', 'Crepúsculo náutico')).toBe('--:--');
    expect(await hora(page, 'Mañana', 'Crepúsculo astronómico')).toBe('--:--');
    expect(await hora(page, 'Tarde', 'Crepúsculo náutico')).toBe('--:--');
    expect(await hora(page, 'Tarde', 'Crepúsculo astronómico')).toBe('--:--');
    expect(await hora(page, 'Mañana', 'Hora azul (inicio)')).toMatch(/^\d{2}:\d{2}$/);
    expect(await hora(page, 'Tarde', 'Hora azul (fin)')).toMatch(/^\d{2}:\d{2}$/);
    await esperarHora(page, 'Tarde', 'Hora azul (fin)', '00:28', 3);
    await expect(
      page.locator('[class*="tableRow"]').filter({ hasText: 'Hora azul (fin)' }),
    ).toContainText('(día siguiente)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO 1239 (bajo, REPARADO) — con el navegador al oeste de Greenwich, la fecha elegida se
// leía en UTC (`new Date('2026-03-20')` = 19/03 a las 21:00 en UTC−3) y se calculaba la víspera.
// Ushuaia 20/03/2026: NOAA 12h 11min (731,0 min); daba 12h 16min, que es el 19/03.
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Ushuaia 20/03/2026 con el navegador en Ushuaia', () => {
  test.use({
    timezoneId: 'America/Argentina/Ushuaia',
    geolocation: { latitude: -54.8019, longitude: -68.303 },
    permissions: ['geolocation'],
  });

  test('se calcula la fecha elegida y no la víspera (hallazgo 1239)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-03-20');
    const dia = await duracionDia(page);
    expect(Math.abs(dia.min - 731.0), `duración: ${dia.texto}`).toBeLessThanOrEqual(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// CASO 3 (rechazo) — fecha vacía
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Fecha vacía', () => {
  test.use({
    timezoneId: 'Europe/Madrid',
    geolocation: { latitude: 40.4168, longitude: -3.7038 },
    permissions: ['geolocation'],
  });

  // HALLAZGO 1240 (bajo, REPARADO) — al borrar la fecha, las 11 filas decían «Invalid Date» y
  // la duración «NaNh NaNmin». Ahora no hay cifras y se pide la fecha.
  test('sin fecha no publica «Invalid Date» ni «NaN» (hallazgo 1240)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-06-21');
    await sembrarValor(page, FECHA, '');
    await expect(page.getByText('Elige una fecha para ver los horarios de luz.')).toBeVisible();
    await expect(page.getByText('Invalid Date')).toHaveCount(0);
    await expect(page.getByText(/NaN/)).toHaveCount(0);
  });

  // HALLAZGO 1248 (bajo, REPARADO) — el campo de fecha no tenía nombre accesible.
  test('el campo de fecha tiene nombre accesible (hallazgo 1248)', async ({ page }) => {
    await page.goto('/golden-hour/');
    await esperarHidratacion(page, [FECHA]);
    await expect(page.getByLabel('Fecha')).toHaveAttribute('type', 'date');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// Contenido — hallazgos 1241, 1243, 1244, 1245 (página) y 1242, 1246 (JSON-LD)
// Cada texto se compara con la astronomía que calcula el motor NOAA: Madrid 21/12, hora dorada
// de 43,5 min; 21/06, 41,1 min; Quito 20/03, 27,3 min.
// ─────────────────────────────────────────────────────────────────────────────────────────
test('el contenido educativo y el JSON-LD dicen la astronomía correcta', async ({ page }) => {
  await page.goto('/golden-hour/');
  const html = await page.content();
  // 1241: ni «15–20 minutos» en Madrid en invierno ni «el doble» de junio a diciembre.
  expect(html).not.toContain('apenas 15–20 minutos');
  expect(html).not.toContain('el doble de duración');
  expect(html).toContain('dura unos 43 minutos');
  // 1243: el ejemplo de paisaje con la hora real de Madrid el 21/06.
  expect(html).not.toContain('20:15–21:00');
  expect(html).toContain('21:07–21:48');
  // 1244: los 4 minutos por grado son de LONGITUD.
  expect(html).not.toContain('1° de latitud cambia la hora de amanecer');
  expect(html).toContain('1° de longitud');
  // 1245: Canarias no está en la península ni amanece la primera en junio.
  expect(html).not.toContain('6:30 (junio, Canarias)');
  // 1242: la hora azul del JSON-LD es la misma que calcula la página (0° a −6°).
  const todo = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(todo).toContain('FAQPage');
  expect(todo).not.toContain('entre 4° y 6° por debajo del horizonte, antes');
  expect(todo).not.toContain('60-90 minutos');
  expect(todo).not.toContain('10-15 minutos');
  expect(todo).not.toContain('meskeIA calculan');
  // 1246: lo que promete el JSON-LD se publica (altura y azimut).
  expect(todo).toContain('altura y azimut');
});

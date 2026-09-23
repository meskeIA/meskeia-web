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
 * LOS HALLAZGOS van con `test.fail()`: pasan mientras el defecto siga y se voltean al repararlo.
 * Cada uno afirma SOLO lo que depende de su defecto, para que se voltee con su reparación y no
 * con la de otro.
 */

test.use({ locale: 'es-ES', serviceWorkers: 'block' });

const FECHA = 'input[type="date"]';

interface CiudadNominatim {
  display_name: string;
  lat: string;
  lon: string;
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

  // HALLAZGO 1 (crítico) — TODAS las horas salen 60 min antes, en cualquier lugar y huso.
  // `getTimeForSunAngle` obtiene la hora UTC como `((…)/15 + 24) % 24`, que en JavaScript
  // queda NEGATIVA (el `%` conserva el signo), y luego separa horas y minutos con
  // `Math.floor`: floor(−19,25) = −20 y los minutos, −15 → −20:15 en vez de −19:15.
  // Medido: amanecer 05:45 (NOAA 06:44:45), atardecer 20:48 (NOAA 21:48:31).
  test.fail('las horas publicadas son las del lugar (hallazgo: salen 1 h antes)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-06-21');
    await esperarHora(page, 'Mañana', 'Amanecer', '06:45', 2);
    await esperarHora(page, 'Mañana', 'Hora dorada (fin)', '07:26', 3);
    await esperarHora(page, 'Tarde', 'Mediodía solar', '14:17', 2);
    await esperarHora(page, 'Tarde', 'Hora dorada (inicio)', '21:07', 3);
    await esperarHora(page, 'Tarde', 'Atardecer', '21:48', 2);
    await esperarHora(page, 'Tarde', 'Hora azul (fin)', '22:22', 3);
  });

  // HALLAZGO 5 (medio) — a las 07:00 CEST, con el sol a +1,65° recién salido, el panel dice
  // «Hora Dorada (tarde)» y no muestra «Próximo». Los instantes calculados caen en el día
  // ANTERIOR (`setUTCHours` sobre la fecha UTC de la medianoche local, que en UTC+1/+2 es la
  // víspera), así que `now < solarNoon` es siempre falso y ningún evento es futuro.
  // Esperado: «Hora Dorada (mañana)» y «Próximo: Fin hora dorada a las 07:26».
  test.fail('a las 07:00 el panel dice «mañana» y anuncia el próximo evento (hallazgo)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-06-21T05:00:00Z'));
    await abrirConGeolocalizacion(page, '2026-06-21', { yaEsLaDeHoy: true });
    const panel = page.locator('[class*="currentPanel"]');
    await expect(panel).toContainText(/Sol a 1[.,]\d° de altitud/); // preparación: ya hay posición
    await expect(panel).toContainText('Hora Dorada (mañana)');
    await expect(panel).toContainText('Próximo');
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

  // HALLAZGO 2 (alto) — el ocaso (00:46 UTC del día siguiente) se coloca en la víspera, antes
  // que el orto: «Duración del día: −12h −59min» y «Mediodía solar 23:45».
  // NOAA: día 12h 2min (721,5 min) y mediodía 12:45, entre el orto y el ocaso.
  // Afirma solo lo que NO depende del hallazgo 1 (una diferencia y un orden).
  test.fail('la duración del día es positiva y el mediodía cae entre orto y ocaso (hallazgo)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-03-15');
    const dia = await duracionDia(page);
    expect(Math.abs(dia.min - 721.5), `duración: ${dia.texto}`).toBeLessThanOrEqual(2);
    const orto = minutos(await hora(page, 'Mañana', 'Amanecer'));
    const mediodia = minutos(await hora(page, 'Tarde', 'Mediodía solar'));
    const ocaso = minutos(await hora(page, 'Tarde', 'Atardecer'));
    expect(orto < mediodia && mediodia < ocaso, `orto ${orto} · mediodía ${mediodia} · ocaso ${ocaso}`).toBe(true);
  });

  // HALLAZGO 6 (medio) — la fecha por defecto se toma en UTC (`toISOString`): a las 20:00 del
  // 15/03 en CDMX (02:00Z del 16) la app abre con el 16/03, el día de MAÑANA, sin avisar.
  test.fail('a las 20:00 la fecha por defecto es la de hoy (hallazgo: sale mañana)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-03-16T02:00:00Z'));
    await page.goto('/golden-hour/');
    await esperarHidratacion(page, [FECHA]);
    expect(await leerValorEnReact(page, FECHA)).toBe('2026-03-15');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO 3 (alto) — las horas salen en el huso del NAVEGADOR, no en el del lugar, y la app
// no lo dice. Un fotógrafo en Madrid que planifica Buenos Aires el 21/06/2026 lee
// «Amanecer 12:00» (hora de Madrid, y además con el −1 h del hallazgo 1); el mismo lugar con el
// navegador en Buenos Aires da «07:00». NOAA, en hora de Buenos Aires (UTC−3): orto 08:00:20.
// Se afirma la INDEPENDENCIA del huso del navegador (no depende del hallazgo 1). Si la
// reparación elige rotular el huso en vez de convertir, este caso hay que reescribirlo.
// ─────────────────────────────────────────────────────────────────────────────────────────
const BUENOS_AIRES: CiudadNominatim = {
  display_name: 'Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina',
  lat: '-34.6037',
  lon: '-58.3816',
};

async function amanecerConNavegadorEn(browser: Browser, timezoneId: string): Promise<string> {
  const contexto = await browser.newContext({ timezoneId, locale: 'es-ES', serviceWorkers: 'block' });
  try {
    const page = await contexto.newPage();
    await abrirConBusqueda(page, '2026-06-21', BUENOS_AIRES);
    await expect(page.locator('[class*="currentLocation"]')).toContainText('34.6037');
    return await hora(page, 'Mañana', 'Amanecer');
  } finally {
    await contexto.close();
  }
}

test.fail('Buenos Aires: la hora no depende del huso del navegador (hallazgo)', async ({ browser }) => {
  const desdeBuenosAires = await amanecerConNavegadorEn(browser, 'America/Argentina/Buenos_Aires');
  const desdeMadrid = await amanecerConNavegadorEn(browser, 'Europe/Madrid');
  expect(
    desfase(desdeMadrid, desdeBuenosAires),
    `amanecer de Buenos Aires: ${desdeMadrid} con el navegador en Madrid, ${desdeBuenosAires} en Buenos Aires`,
  ).toBeLessThanOrEqual(2);
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

  // HALLAZGO 4 (medio) — con el sol siempre por encima del horizonte, «Duración del día:
  // 0h 0min». Esperado: 24 h (o «sol de medianoche»), nunca 0.
  test.fail('la duración del día no es 0 con sol de medianoche (hallazgo)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-06-21');
    const dia = await duracionDia(page);
    expect(dia.texto, 'la duración no puede ser 0 si el sol no se pone').not.toMatch(/:\s*0h 0min/);
  });
});

test.describe('Oslo 21/06/2026: noche blanca', () => {
  test.use({
    timezoneId: 'Europe/Oslo',
    geolocation: { latitude: 59.9139, longitude: 10.7522 },
    permissions: ['geolocation'],
  });

  test('sin crepúsculo náutico ni astronómico, pero con civil', async ({ page }) => {
    // NOAA: el sol baja a −6,65° → cruza −6° (civil) pero nunca −12° ni −18°.
    await abrirConGeolocalizacion(page, '2026-06-21');
    expect(await hora(page, 'Mañana', 'Crepúsculo náutico')).toBe('--:--');
    expect(await hora(page, 'Mañana', 'Crepúsculo astronómico')).toBe('--:--');
    expect(await hora(page, 'Tarde', 'Crepúsculo náutico')).toBe('--:--');
    expect(await hora(page, 'Tarde', 'Crepúsculo astronómico')).toBe('--:--');
    expect(await hora(page, 'Mañana', 'Hora azul (inicio)')).toMatch(/^\d{2}:\d{2}$/);
    expect(await hora(page, 'Tarde', 'Hora azul (fin)')).toMatch(/^\d{2}:\d{2}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO 8 (bajo) — con el navegador al oeste de Greenwich, la fecha elegida se lee en UTC
// (`new Date('2026-03-20')` = 19/03 a las 21:00 en UTC−3) y se calcula el día ANTERIOR.
// Ushuaia 20/03/2026: NOAA 12h 11min (731,0 min); la app da 12h 16min, que es el 19/03.
// ─────────────────────────────────────────────────────────────────────────────────────────
test.describe('Ushuaia 20/03/2026 con el navegador en Ushuaia', () => {
  test.use({
    timezoneId: 'America/Argentina/Ushuaia',
    geolocation: { latitude: -54.8019, longitude: -68.303 },
    permissions: ['geolocation'],
  });

  test.fail('se calcula la fecha elegida y no la víspera (hallazgo)', async ({ page }) => {
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

  // HALLAZGO 7 (bajo) — al borrar la fecha, las 11 filas dicen «Invalid Date» y la duración
  // «NaNh NaNmin». Esperado: ninguna cifra (o un aviso de que falta la fecha).
  test.fail('sin fecha no publica «Invalid Date» ni «NaN» (hallazgo)', async ({ page }) => {
    await abrirConGeolocalizacion(page, '2026-06-21');
    await sembrarValor(page, FECHA, '');
    await expect(page.getByText('Invalid Date')).toHaveCount(0);
    await expect(page.getByText(/NaN/)).toHaveCount(0);
  });
});

import { test, expect, type Page } from '@playwright/test';

/**
 * informacion-tiempo: tiempo actual con lo que queda de hoy por franjas, y los días siguientes en
 * lista desplegable (rediseño del 19/11/2026).
 *
 * OpenWeatherMap se sirve simulado con `page.route`: el test no depende de la clave ni de la red.
 * El reparto en franjas, la hora local y el reparto hoy / días siguientes los prueban los goldens
 * del motor (tests/franjas-tiempo-motor.spec.ts); aquí se mide lo que el usuario ve.
 *
 * ── Casos resueltos a mano ──
 *   Madrid (+1 h), 40 tramos desde UTC 18/11/2026 09:00 → local 10:00 del miércoles 18; la
 *   observación actual es de ese instante, con 15 °C (temp_max / temp_min de /weather: 18 / 12)
 *     hoy (18): Mañana [10] · Tarde [13, 16] · Noche [19, 22, 01, 04] — sin Madrugada
 *       temperaturas 10 + (i % 8): mañana 10 · tarde 11, 12 · noche 13, 14, 15, 16
 *       → máx. 16° (la noche) · mín. 10° — NO los 18 / 12 de /weather
 *     la tarde: pop 0,2 y 0,7 → «70 %» · lluvia 0,5 + 1,25 = 1,75 → «1,8 mm» · 5 m/s → «18 km/h»
 *     días siguientes: 19, 20, 21 y 22 (8 tramos cada uno); el 23 trae 3 → fuera
 *     humedad 70 → «70 %» · visibilidad 10000 m → «10 km» · presión «1010 hPa»
 *     viento 3 m/s a 90° → 10,8 → «11 km/h E»
 *   Nueva York (−5 h), mismos tramos → local 04:00 del miércoles 18
 *     hoy: Madrugada [04] · Mañana [07, 10] · Tarde [13, 16] · Noche [19, 22, 01 del 19]
 *     primer día siguiente: jueves 19
 */

const INICIO = Date.UTC(2026, 10, 18, 9) / 1000;

function respuestaForecast(desfase: number) {
  const list = Array.from({ length: 40 }, (_, i) => {
    const tramo: Record<string, unknown> = {
      dt: INICIO + i * 3 * 3600,
      main: { temp: 10 + (i % 8), temp_min: 10, temp_max: 18, humidity: 70 },
      weather: [{ id: 803, main: 'Clouds', description: 'nubes rotas', icon: '04d' }],
      wind: { speed: 2 },
      pop: 0,
    };
    if (i === 1) Object.assign(tramo, { pop: 0.2, rain: { '3h': 0.5 }, wind: { speed: 3 } });
    if (i === 2)
      Object.assign(tramo, {
        pop: 0.7,
        rain: { '3h': 1.25 },
        wind: { speed: 5 },
        weather: [{ id: 500, main: 'Rain', description: 'lluvia ligera', icon: '10d' }],
      });
    return tramo;
  });
  return { list, city: { name: 'Ciudad de prueba', country: 'ES', timezone: desfase } };
}

function respuestaWeather(desfase: number) {
  return {
    name: 'Ciudad de prueba',
    sys: { country: 'ES', sunrise: INICIO - 3 * 3600, sunset: INICIO + 6 * 3600 },
    main: { temp: 15, feels_like: 14, humidity: 70, pressure: 1010, temp_min: 12, temp_max: 18 },
    weather: [{ id: 803, main: 'Clouds', description: 'nubes rotas', icon: '04d' }],
    wind: { speed: 3, deg: 90 },
    clouds: { all: 75 },
    visibility: 10000,
    dt: INICIO,
    timezone: desfase,
  };
}

async function abrirCon(page: Page, desfase: number): Promise<void> {
  await page.route('https://api.openweathermap.org/**', async (ruta) => {
    const esPronostico = ruta.request().url().includes('/forecast');
    await ruta.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(esPronostico ? respuestaForecast(desfase) : respuestaWeather(desfase)),
    });
  });
  await page.goto('/informacion-tiempo/');
  // Los botones de día solo existen tras la respuesta simulada, que pide un efecto: si están,
  // React ya hidrató y los clics no se pierden
  await expect(diasDelPronostico(page)).toHaveCount(4, { timeout: 20000 });
}

const diasDelPronostico = (page: Page) =>
  page.getByRole('list', { name: 'Próximos días' }).getByRole('button');

const tarjetaActual = (page: Page) => page.getByRole('region', { name: 'Ciudad de prueba, ES' });
const franjasDeHoy = (page: Page) => page.getByRole('region', { name: 'Lo que queda de hoy' });
const panelFranjas = (page: Page) => page.getByRole('region', { name: /^Franjas del / });

test.use({ geolocation: { latitude: 40.4168, longitude: -3.7038 }, permissions: ['geolocation'] });

test.describe('informacion-tiempo — tiempo actual, hoy por franjas y próximos días', () => {
  test('Madrid: máxima y mínima de lo que queda de hoy, no las de /weather', async ({ page }) => {
    await abrirCon(page, 3600);
    const tarjeta = tarjetaActual(page);
    await expect(tarjeta).toContainText('15°');
    await expect(tarjeta).toContainText('máx. 16° · mín. 10°');
    await expect(tarjeta).not.toContainText('18°');
  });

  test('el fondo de la tarjeta sigue al cielo: nubes de día', async ({ page }) => {
    await abrirCon(page, 3600);
    await expect(tarjetaActual(page)).toHaveAttribute('data-cielo', 'nubes');
  });

  test('Madrid: lo que queda de hoy va por franjas dentro de la tarjeta', async ({ page }) => {
    await abrirCon(page, 3600);
    const hoy = franjasDeHoy(page);
    await expect(hoy.getByText('Madrugada', { exact: true })).toHaveCount(0);
    for (const franja of ['Mañana', 'Tarde', 'Noche']) {
      await expect(hoy.getByText(franja, { exact: true })).toBeVisible();
    }
    await expect(hoy).toContainText(/70\s%/);
    await expect(hoy).toContainText('1,8 mm');
    await expect(hoy).toContainText('18 km/h');
    await expect(hoy).toContainText('lluvia ligera');
  });

  test('Madrid: hoy no se repite en la lista, que trae solo los 4 días completos', async ({ page }) => {
    await abrirCon(page, 3600);
    const lista = page.getByRole('list', { name: 'Próximos días' });
    const dias = diasDelPronostico(page);
    await expect(dias.first()).toContainText('jue, 19 nov');
    await expect(dias.last()).toContainText('dom, 22 nov');
    await expect(lista).not.toContainText('mié, 18 nov');
    await expect(lista).not.toContainText('lun, 23 nov');
  });

  test('los datos del momento salen en formato español', async ({ page }) => {
    await abrirCon(page, 3600);
    const cuerpo = page.locator('body');
    await expect(cuerpo).toContainText(/Humedad\s*70\s%/);
    await expect(cuerpo).toContainText(/Visibilidad\s*10 km/);
    await expect(cuerpo).not.toContainText('10.0 km');
    await expect(cuerpo).toContainText(/Presión\s*1010 hPa/);
    await expect(cuerpo).toContainText(/Viento\s*11 km\/h E/);
  });

  test('solo un día abierto a la vez, y se cierra al volver a tocarlo', async ({ page }) => {
    await abrirCon(page, 3600);
    const dias = diasDelPronostico(page);

    await dias.nth(0).click();
    await expect(dias.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await expect(panelFranjas(page)).toHaveAttribute('aria-label', 'Franjas del jueves, 19 de noviembre');
    await expect(panelFranjas(page).getByText('Noche', { exact: true })).toBeVisible();

    await dias.nth(1).click();
    await expect(dias.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(dias.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(panelFranjas(page)).toHaveAttribute('aria-label', 'Franjas del viernes, 20 de noviembre');

    await dias.nth(1).click();
    await expect(dias.nth(1)).toHaveAttribute('aria-expanded', 'false');
    await expect(panelFranjas(page)).toHaveCount(0);
  });

  test('Nueva York: las franjas van en la hora de la ciudad, no en la del navegador', async ({ page }) => {
    await abrirCon(page, -18000);
    await expect(page.getByText(/Horas locales de Ciudad de prueba/)).toBeVisible();
    const hoy = franjasDeHoy(page);
    for (const franja of ['Madrugada', 'Mañana', 'Tarde', 'Noche']) {
      await expect(hoy.getByText(franja, { exact: true })).toBeVisible();
    }
    await expect(diasDelPronostico(page).first()).toContainText('jue, 19 nov');
  });

  test('C0815 · en móvil se ven los 4 días completos de la lista, ninguno oculto', async ({ page }) => {
    // El CSS anterior al rediseño (b06d2d8ce) ocultaba el último día bajo 480 px para no dejarlo
    // huérfano en la rejilla de dos columnas; la lista de ahora no oculta ninguno.
    await page.setViewportSize({ width: 375, height: 800 });
    await abrirCon(page, 3600);
    const dias = diasDelPronostico(page);
    await expect(dias).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(dias.nth(i)).toBeVisible();
  });
});

test.describe('informacion-tiempo — la FAQPage dice lo que la app hace', () => {
  test('C0814 · no promete sugerencias entre ciudades homónimas ni la humedad de cada día', async ({ page }) => {
    // La app busca q=<nombre> y toma la primera ciudad que devuelve el servicio; la humedad solo
    // sale para el momento actual (los días llevan lluvia y viento por franjas, 622b6d28c).
    await page.goto('/informacion-tiempo/');
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('"FAQPage"')) ?? '';
    expect(faq).toContain('FAQPage');
    expect(faq).not.toContain('sugerencias');
    expect(faq).not.toContain('la humedad relativa y la velocidad del viento');
    expect(faq).toContain('se muestra la primera que devuelve el servicio meteorológico');
  });
});

import { test, expect, type Page } from '@playwright/test';

/**
 * informacion-tiempo: el pronóstico de 5 días se despliega por franjas (mañana, tarde, noche).
 *
 * OpenWeatherMap se sirve simulado con `page.route`: el test no depende de la clave ni de la red.
 * El reparto en franjas y la hora local los prueban los goldens del motor
 * (tests/franjas-tiempo-motor.spec.ts); aquí se mide lo que el usuario ve:
 *   · cada día es un botón con aria-expanded y solo hay un día abierto a la vez
 *   · las fechas y las franjas van en la hora de la CIUDAD, no en la del navegador
 *
 * ── Casos resueltos a mano ──
 *   Madrid (+1 h), 40 tramos desde UTC 18/11/2026 09:00 → local 10:00 del miércoles 18
 *     día 18: Mañana [10] · Tarde [13, 16] · Noche [19, 22, 01, 04] — sin Madrugada
 *     la tarde: pop 0,2 y 0,7 → «70 %» · lluvia 0,5 + 1,25 = 1,75 → «1,8 mm» · 5 m/s → «18 km/h»
 *   Nueva York (−5 h), mismos tramos → local 04:00 del miércoles 18
 *     día 18: Madrugada [04] · Mañana [07, 10] · Tarde [13, 16] · Noche [19, 22, 01 del 19]
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
  await expect(diasDelPronostico(page)).toHaveCount(5, { timeout: 20000 });
}

// Los botones de día se reconocen por su «máx° / mín°»: hay otros botones con aria-expanded
// en la página (la sección educativa)
const diasDelPronostico = (page: Page) => page.getByRole('button', { name: /-?\d+° \/ -?\d+°/ });

const panelFranjas = (page: Page) => page.getByRole('region', { name: /^Franjas del / });

test.use({ geolocation: { latitude: 40.4168, longitude: -3.7038 }, permissions: ['geolocation'] });

test.describe('informacion-tiempo — franjas desplegables', () => {
  test('Madrid: el día se despliega en mañana, tarde y noche con los datos de cada franja', async ({ page }) => {
    await abrirCon(page, 3600);
    const dias = diasDelPronostico(page);
    await expect(dias.first()).toContainText('mié, 18 nov');
    await expect(panelFranjas(page)).toHaveCount(0);

    await dias.first().click();
    await expect(dias.first()).toHaveAttribute('aria-expanded', 'true');
    const panel = panelFranjas(page);
    await expect(panel.getByRole('heading')).toHaveText('miércoles, 18 de noviembre');
    await expect(panel.getByText('Madrugada', { exact: true })).toHaveCount(0);
    for (const franja of ['Mañana', 'Tarde', 'Noche']) {
      await expect(panel.getByText(franja, { exact: true })).toBeVisible();
    }
    await expect(panel).toContainText(/70\s%/);
    await expect(panel).toContainText('1,8 mm');
    await expect(panel).toContainText('18 km/h');
    await expect(panel).toContainText('lluvia ligera');
  });

  test('solo un día abierto a la vez, y se cierra al volver a tocarlo', async ({ page }) => {
    await abrirCon(page, 3600);
    const dias = diasDelPronostico(page);

    await dias.nth(0).click();
    await dias.nth(1).click();
    await expect(dias.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(dias.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(panelFranjas(page).getByRole('heading')).toHaveText('jueves, 19 de noviembre');

    await dias.nth(1).click();
    await expect(dias.nth(1)).toHaveAttribute('aria-expanded', 'false');
    await expect(panelFranjas(page)).toHaveCount(0);
  });

  test('Nueva York: las franjas van en la hora de la ciudad, no en la del navegador', async ({ page }) => {
    await abrirCon(page, -18000);
    const dias = diasDelPronostico(page);
    await expect(dias.first()).toContainText('mié, 18 nov');

    await dias.first().click();
    const panel = panelFranjas(page);
    await expect(panel).toContainText('Horas locales de Ciudad de prueba');
    for (const franja of ['Madrugada', 'Mañana', 'Tarde', 'Noche']) {
      await expect(panel.getByText(franja, { exact: true })).toBeVisible();
    }
  });
});

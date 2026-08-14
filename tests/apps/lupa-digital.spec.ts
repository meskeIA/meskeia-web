import { test, expect, devices } from '@playwright/test';

/**
 * Lupa Digital — test de regresión (Inspector, 14/08/2026)
 *
 * App más usada del catálogo (1.249 usos) y una de las pocas cuyo "resultado" no es un
 * número: lo que entrega es OPERATIVA — que la cámara arranque y se vea. Por eso los tres
 * casos verifican comportamiento, no cifras.
 *
 * REGRESIÓN QUE VIGILA ESTE FICHERO: hubo un periodo en que la app no llegaba a abrir la
 * cámara en el navegador móvil; las visitas eran entradas y salidas inmediatas y nadie supo
 * por qué. Comprobar que el <video> EXISTE no habría detectado nada, porque el elemento
 * estaba ahí. Por eso el CASO 1 exige que el vídeo REPRODUZCA de verdad (readyState >= 2,
 * videoWidth > 0, paused === false y currentTime avanzando), y los tres casos corren en
 * viewport móvil (Pixel 7), que es donde ocurrió el fallo.
 *
 * Cámara simulada por Chromium:
 *   --use-fake-device-for-media-stream  → existe una cámara que emite un patrón de vídeo real
 *   --use-fake-ui-for-media-stream      → el permiso se concede solo
 * El segundo flag es imprescindible: sin él, en headless no hay captura ni aunque se conceda
 * `permissions: ['camera']` (getUserMedia devuelve NotSupportedError). Como a cambio atropella
 * el modelo de permisos de Playwright, `clearPermissions()` no sirve para el caso de rechazo:
 * el CASO 3 lo provoca en el propio API, haciendo que getUserMedia rechace con NotAllowedError,
 * que es exactamente lo que lanza Chrome cuando el usuario pulsa "Bloquear".
 */

const RUTA = '/lupa-digital/';

test.use({
  ...devices['Pixel 7'], // 412×915, touch, DPR 2,625, UA de Android
  permissions: ['camera'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

/** Estado real de reproducción del <video>, leído del elemento vivo. */
async function estadoVideo(page: import('@playwright/test').Page) {
  return page.locator('video').evaluate((v: HTMLVideoElement) => ({
    readyState: v.readyState,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight,
    paused: v.paused,
    currentTime: v.currentTime,
    display: getComputedStyle(v).display,
    transform: v.style.transform,
    filter: v.style.filter,
    pistas: v.srcObject
      ? (v.srcObject as MediaStream).getVideoTracks().map((t) => t.readyState)
      : [],
  }));
}

/** Espera a que el vídeo esté reproduciendo de verdad, no solo presente en el DOM. */
async function esperarReproduccion(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => {
      const v = document.querySelector('video') as HTMLVideoElement | null;
      return !!v && v.readyState >= 2 && v.videoWidth > 0 && !v.paused && v.currentTime > 0;
    },
    null,
    { timeout: 15000 },
  );
}

// ═══════════════════════════════════════════════════════════════
// CASO 1 — El stream arranca y el vídeo reproduce (viewport móvil)
// ═══════════════════════════════════════════════════════════════
test('CASO 1 (móvil): el stream arranca y el <video> reproduce de verdad', async ({ page }) => {
  const erroresConsola: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') erroresConsola.push(m.text());
  });

  await page.goto(RUTA);

  // Lo que promete el <h1> y el <title>.
  await expect(page.locator('h1')).toHaveText('Lupa Digital Online');
  await expect(page).toHaveTitle(/Lupa Digital Online/);

  // Antes de activar: placeholder visible y vídeo oculto, sin stream todavía.
  await expect(page.getByText('Pulsa para activar la lupa')).toBeVisible();
  const previo = await estadoVideo(page);
  expect(previo.display).toBe('none');
  expect(previo.videoWidth).toBe(0);

  await page.getByRole('button', { name: /Activar lupa/i }).click();

  // ── El corazón del test: reproducción REAL, no presencia del elemento ──
  await esperarReproduccion(page);

  const activo = await estadoVideo(page);
  expect(activo.readyState).toBeGreaterThanOrEqual(2); // HAVE_CURRENT_DATA o mejor
  expect(activo.videoWidth).toBeGreaterThan(0);
  expect(activo.videoHeight).toBeGreaterThan(0);
  expect(activo.paused).toBe(false);
  expect(activo.currentTime).toBeGreaterThan(0);
  expect(activo.display).toBe('block'); // deja de estar oculto
  expect(activo.pistas).toEqual(['live']); // la pista de vídeo está viva, no 'ended'

  // El vídeo ocupa sitio en pantalla: no es un elemento de 0×0 invisible.
  const caja = await page.locator('video').boundingBox();
  expect(caja!.width).toBeGreaterThan(100);
  expect(caja!.height).toBeGreaterThan(100);

  // Zoom por defecto 2x: transform e indicador del visor coinciden.
  expect(activo.transform).toBe('scale(2)');
  await expect(page.locator('span').filter({ hasText: /^2x$/ })).toHaveText('2x');

  // La UI refleja el estado activo y el placeholder desaparece.
  const botonPrincipal = page.getByRole('button', { name: /Detener/i });
  await expect(botonPrincipal).toBeVisible();
  await expect(botonPrincipal).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Pulsa para activar la lupa')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Cambiar cámara/i })).toBeVisible();

  // Con cámara concedida no debe registrarse ningún error de acceso.
  expect(erroresConsola.filter((e) => /cámara|camera|getUserMedia/i.test(e))).toEqual([]);
});

// ═══════════════════════════════════════════════════════════════
// CASO 2 — Los controles que promete hacen algo observable
// ═══════════════════════════════════════════════════════════════
test('CASO 2 (móvil): zoom, filtros y ajustes producen un efecto observable', async ({ page }) => {
  await page.goto(RUTA);
  await page.getByRole('button', { name: /Activar lupa/i }).click();
  await esperarReproduccion(page);

  const video = page.locator('video');
  const tituloZoom = page.getByRole('heading', { name: /^Zoom:/ });
  const indicador = page.locator('span').filter({ hasText: /^\d+(\.\d+)?x$/ });

  // ── ZOOM: presets, botones ± y topes del rango 1x–5x ──
  await expect(tituloZoom).toHaveText('Zoom: 2x');
  await expect(video).toHaveAttribute('style', /scale\(2\)/);

  const preset4x = page.getByRole('button', { name: '4x', exact: true });
  await preset4x.click();
  await expect(tituloZoom).toHaveText('Zoom: 4x');
  await expect(preset4x).toHaveAttribute('aria-pressed', 'true');
  expect((await estadoVideo(page)).transform).toBe('scale(4)'); // 4x → scale(4)
  await expect(indicador).toHaveText('4x'); // el visor muestra el mismo valor

  await page.getByRole('button', { name: '+', exact: true }).click(); // paso de 0,5
  await expect(tituloZoom).toHaveText('Zoom: 4.5x');
  expect((await estadoVideo(page)).transform).toBe('scale(4.5)');

  // Topes: en 5x no se puede subir, en 1x no se puede bajar.
  await page.getByRole('button', { name: '5x', exact: true }).click();
  await expect(page.getByRole('button', { name: '+', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '1x', exact: true }).click();
  await expect(page.getByRole('button', { name: '−', exact: true })).toBeDisabled();
  expect((await estadoVideo(page)).transform).toBe('scale(1)');

  // ── FILTROS de accesibilidad: cada uno añade su función CSS al <video> ──
  const filtrosEsperados: Array<[string, string]> = [
    ['Invertir', 'brightness(100%) contrast(100%) invert(100%)'],
    ['Grises', 'brightness(100%) contrast(100%) grayscale(100%)'],
    ['Sepia', 'brightness(100%) contrast(100%) sepia(100%)'],
    ['Alto contraste', 'brightness(100%) contrast(100%) contrast(200%)'],
    ['Normal', 'brightness(100%) contrast(100%)'],
  ];
  for (const [nombre, filtroCss] of filtrosEsperados) {
    const boton = page.getByRole('button', { name: nombre });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    expect((await estadoVideo(page)).filter).toBe(filtroCss);
  }

  // ── BRILLO y CONTRASTE: el deslizador mueve la etiqueta y el filtro CSS ──
  const deslizadores = page.locator('input[type=range]');
  await deslizadores.nth(1).fill('160'); // brillo
  await expect(page.locator('label').filter({ hasText: 'Brillo' })).toContainText('Brillo: 160%');
  expect((await estadoVideo(page)).filter).toBe('brightness(160%) contrast(100%)');

  await deslizadores.nth(2).fill('50'); // contraste
  await expect(page.locator('label').filter({ hasText: 'Contraste' })).toContainText(
    'Contraste: 50%',
  );
  expect((await estadoVideo(page)).filter).toBe('brightness(160%) contrast(50%)');

  // ── RESTABLECER: vuelve a 100 % / 100 % y filtro Normal ──
  await page.getByRole('button', { name: /Restablecer ajustes/ }).click();
  expect((await estadoVideo(page)).filter).toBe('brightness(100%) contrast(100%)');
  await expect(page.getByRole('button', { name: 'Normal' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // ── DETENER: apaga la pista de vídeo (si no, la cámara se queda encendida) ──
  await page.getByRole('button', { name: /Detener/i }).click();
  await expect(page.getByText('Pulsa para activar la lupa')).toBeVisible();
  const detenido = await estadoVideo(page);
  expect(detenido.display).toBe('none');
  expect(detenido.pistas).toEqual(['ended']);

  // NOTA (hallazgo del 14/08/2026): la metadata, el FAQPage y la guía prometen un
  // "modo congelado" / botón de pausa que NO existe en la interfaz. Si algún día se
  // implementa, su caso va aquí: congelar → paused === true con la imagen aún visible.
});

// ═══════════════════════════════════════════════════════════════
// CASO 3 — Permiso denegado: mensaje claro, no pantalla muerta
// ═══════════════════════════════════════════════════════════════
test('CASO 3 (móvil): si se deniega la cámara sale un aviso claro y la página sigue viva', async ({
  page,
}) => {
  // Rechazo idéntico al de Chrome cuando el usuario pulsa "Bloquear".
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
  });

  await page.goto(RUTA);

  const resultadoGum = await page.evaluate(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      return 'concedido';
    } catch (e) {
      return (e as Error).name;
    }
  });
  expect(resultadoGum).toBe('NotAllowedError'); // el rechazo está realmente en su sitio

  await page.getByRole('button', { name: /Activar lupa/i }).click();

  // 1) Mensaje explícito y anunciado por lector de pantalla (role="alert").
  const aviso = page.locator('div[role="alert"]').filter({ hasText: 'Permiso de cámara' });
  await expect(aviso).toBeVisible({ timeout: 10000 });
  await expect(aviso).toContainText('Permiso de cámara denegado');
  await expect(aviso).toContainText('Activa la cámara en la configuración del navegador');
  await expect(page.locator('[role=status]').first()).toHaveAttribute('aria-live', 'polite');

  // 2) No queda un vídeo negro colgado ni un estado "activo" falso.
  expect((await estadoVideo(page)).display).toBe('none');

  // 3) La página NO queda muerta: se puede reintentar y los controles siguen operativos.
  const botonPrincipal = page.getByRole('button', { name: /Activar lupa/i });
  await expect(botonPrincipal).toBeEnabled();
  await expect(botonPrincipal).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: '3x', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Zoom:/ })).toHaveText('Zoom: 3x');

  // 4) Un segundo intento fallido mantiene el aviso (no lo borra dejando la pantalla en blanco).
  await botonPrincipal.click();
  await expect(aviso).toBeVisible();
});

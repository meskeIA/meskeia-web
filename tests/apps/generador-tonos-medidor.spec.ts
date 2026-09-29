import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Generador de Tonos — medidor de la frecuencia de un sonido (S0170, 29/09/2026).
 *
 * Fichero aparte de los otros dos specs de la app porque sustituye `getUserMedia` por una
 * señal fabricada con Web Audio, y `test.use()` es por fichero.
 *
 * El micrófono simulado de Chromium (`--use-fake-device-for-media-stream`) emite un pitido
 * cuya frecuencia no está documentada, así que no sirve para comprobar una cifra. Aquí la
 * señal la genera el propio test —un oscilador de frecuencia conocida o ruido blanco— y
 * entra en la app como si viniera del micrófono. El valor esperado está resuelto a mano:
 *
 *   1.000 Hz → 12·log2(1000/440) = 14,21 semitonos sobre La4 → 14 → Si5 (987,77 Hz),
 *              y 1200·log2(1000/987,77) = +21,3 → «Si5 (+21 cents)»
 *
 * Y los dos fallos que importan en un medidor, más que un hercio de error:
 *   · dar una cifra sobre RUIDO (el pico más alto de un ruido existe siempre),
 *   · seguir escuchando mientras suena el propio generador y leer su salida.
 */

const RUTA = '/generador-tonos/';
const CAMPO_FRECUENCIA = 'input[aria-label="Frecuencia en Hz"]';

type Fuente = { tipo: 'tono'; hz: number } | { tipo: 'ruido' } | { tipo: 'denegado' };

/** Sustituye el micrófono por la fuente indicada, antes de que cargue la página. */
async function conMicrofono(page: Page, fuente: Fuente) {
  await page.addInitScript((f: Fuente) => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async () => {
        if (f.tipo === 'denegado') throw new DOMException('Denegado', 'NotAllowedError');
        const ctx = new AudioContext();
        await ctx.resume();
        const destino = ctx.createMediaStreamDestination();
        if (f.tipo === 'tono') {
          const osc = ctx.createOscillator();
          osc.frequency.value = f.hz;
          const g = ctx.createGain();
          g.gain.value = 0.3;
          osc.connect(g).connect(destino);
          osc.start();
        } else {
          const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          const datos = buffer.getChannelData(0);
          for (let i = 0; i < datos.length; i++) datos[i] = (Math.random() * 2 - 1) * 0.3;
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.loop = true;
          src.connect(destino);
          src.start();
        }
        const stream = destino.stream;
        // Un micrófono que ha obedecido: los tres procesados apagados.
        const pista = stream.getAudioTracks()[0];
        pista.getSettings = () => ({ echoCancellation: false, noiseSuppression: false, autoGainControl: false });
        return stream;
      },
    });
  }, fuente);
}

const avisoDeLaApp = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)');
const botonMedidor = (page: Page) => page.getByRole('button', { name: /Medir la frecuencia|Dejar de medir/ });
const seccion = (page: Page) => page.locator('#medir-frecuencia');

test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
  permissions: ['microphone'],
});

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, [CAMPO_FRECUENCIA]);
}

test.describe('Medidor de frecuencia — la puerta', () => {
  test('el hero lleva al medidor y la sección explica sus límites antes de medir', async ({ page }) => {
    await conMicrofono(page, { tipo: 'tono', hz: 1000 });
    await abrir(page);
    await expect(page.getByRole('link', { name: 'Mídelo con el micrófono' })).toHaveAttribute('href', '#medir-frecuencia');
    await expect(page.getByRole('heading', { name: 'Medir la frecuencia de un sonido' })).toBeVisible();
    await expect(seccion(page).getByText(/puede salir un\s+armónico/)).toBeVisible();
  });
});

test.describe('Medidor de frecuencia — mide lo que suena', () => {
  test('un tono de 1.000 Hz: «1000 Hz», Si5 (+21 cents), lectura estable', async ({ page }) => {
    await conMicrofono(page, { tipo: 'tono', hz: 1000 });
    await abrir(page);

    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');

    const s = seccion(page);
    await expect(s.getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 5000 });
    // A menos de un hercio: la cifra se escribe sin decimales por encima de 100 Hz, y con
    // cuatro cifras sin punto de millar (Ortografía de la RAE, 2010; lo mismo hace Intl es-ES).
    // Sale dos veces (en vivo y en la retenida): se mira la lectura en vivo, que va primero.
    await expect(s.getByText(/^(999|1000|1001)\u00A0Hz$/).first()).toBeVisible();
    await expect(s.getByText(/^Si5 \(\+2[01]\u00A0cents\)$/)).toBeVisible();
    await expect(s.getByText(/Última lectura estable:/)).toBeVisible();
  });

  test('«Llevar la lectura al generador» pone la frecuencia medida en el campo', async ({ page }) => {
    await conMicrofono(page, { tipo: 'tono', hz: 1000 });
    await abrir(page);

    await botonMedidor(page).click();
    await expect(seccion(page).getByText('Lectura estable', { exact: true })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Llevar la lectura al generador' }).click();

    // El medidor se para (ya no escucha) y el campo del generador tiene la cifra medida.
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'false');
    const valor = await page.locator(CAMPO_FRECUENCIA).inputValue();
    const hz = Number(valor.replace(',', '.'));
    expect(hz).toBeGreaterThan(999);
    expect(hz).toBeLessThan(1001);
    await expect(seccion(page).getByText(/Frecuencia puesta en el generador/)).toBeVisible();
  });
});

test.describe('Medidor de frecuencia — se calla cuando no hay nada que medir', () => {
  test('ruido blanco: no inventa una cifra', async ({ page }) => {
    await conMicrofono(page, { tipo: 'ruido' });
    await abrir(page);

    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');
    // Tiempo de sobra para cinco lecturas seguidas: si el ruido fuera a pasar por tono, ya lo habría hecho.
    await page.waitForTimeout(2500);

    const s = seccion(page);
    await expect(s.getByText('Esperando un sonido que destaque del ruido de fondo…')).toBeVisible();
    await expect(s.getByText('Lectura estable', { exact: true })).toHaveCount(0);
    await expect(s.getByText(/Última lectura estable:/)).toHaveCount(0);
  });

  test('micrófono denegado: lo dice y no hay lectura', async ({ page }) => {
    await conMicrofono(page, { tipo: 'denegado' });
    await abrir(page);

    await botonMedidor(page).click();
    await expect(avisoDeLaApp(page)).toContainText(/permiso al navegador/i);
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('Medidor de frecuencia — no se escucha a sí mismo', () => {
  test('pulsar Reproducir para el medidor, y medir la respuesta queda bloqueado mientras mide', async ({ page }) => {
    await conMicrofono(page, { tipo: 'tono', hz: 1000 });
    await abrir(page);

    await botonMedidor(page).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Medir A/ })).toBeDisabled();

    await page.getByRole('button', { name: /Reproducir/ }).click();
    await expect(botonMedidor(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /Medir A/ })).toBeEnabled();
  });
});

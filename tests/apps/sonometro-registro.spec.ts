import { test, expect, type Page } from '@playwright/test';

/**
 * Sonómetro — REGISTRO DE MEDICIONES y parte imprimible · 26/08/2026
 *
 * La app calculaba correctamente el LAeq de una sesión y lo tiraba al cerrar la pestaña: lo
 * único que persistía era la calibración. Mientras tanto, su propia FAQ («¿Cómo medir el ruido
 * de un vecino para reclamar?») mandaba «registrar el nivel durante varias sesiones en
 * distintos días y horarios» y documentarlo «con capturas de pantalla»: le pedía al usuario
 * algo que la herramienta no le dejaba hacer y le ofrecía como salida una captura de pantalla.
 *
 * QUÉ SE COMPRUEBA AQUÍ — que el dato SOBREVIVE, que es el mismo que se midió, y que lo que
 * no debe guardarse no se guarda. El cálculo del nivel ya lo cubre sonometro.spec.ts; esto es
 * lo que ocurre DESPUÉS de pulsar Detener.
 *
 * CÓMO SE MIDE UN NIVEL CONOCIDO (mismo montaje que sonometro.spec.ts): en vez del micrófono
 * se le entrega a la app un oscilador de amplitud y frecuencia conocidas. Con una senoide de
 * amplitud A a 1 kHz —donde la ponderación A vale 0 dB por definición— la app debe mostrar
 * 20·log₁₀(A/√2) + 90. Con A = 0,05: 20·log₁₀(0,035355) + 90 = 61,0 dB(A).
 *
 * EL SUELO DE 3 SEGUNDOS es deliberado: sin él cada pulsación accidental de Iniciar/Detener
 * dejaría una fila, y un parte lleno de sesiones de dos segundos no documenta nada.
 */

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
  permissions: ['microphone'],
});

// Mismo motivo que en sonometro.spec.ts: el micrófono sintético corre en el reloj de audio
// del sistema y con la máquina cargada llega con microcortes. Lo que falle dos veces, cuenta.
test.describe.configure({ retries: 2 });

const RUTA = '/sonometro/';
const CLAVE_SESIONES = 'sonometro-sesiones';

/** Nivel que la app debe mostrar para una senoide de amplitud A a 1 kHz, calibración 90 dB. */
const nivelEsperado = (amplitud: number): number => 20 * Math.log10(amplitud / Math.SQRT2) + 90;

/**
 * Sustituye el micrófono por una senoide de 1 kHz y amplitud dada.
 *
 * ⚠️ Devuelve un stream NUEVO en cada llamada, como hace un micrófono de verdad. Cachearlo
 * —que es lo que basta cuando solo se mide una vez— rompe la segunda medición y de forma
 * engañosa: la app detiene las pistas al terminar la primera, una pista en `ended` no vuelve
 * a la vida, y el analizador pasa a leer ceros. La app se comporta entonces exactamente como
 * debe (salta los fotogramas sin señal y no registra una sesión vacía), pero el fallo parece
 * suyo. Lo destapó este mismo fichero al encadenar dos mediciones.
 */
async function micrófonoSintético(page: Page, amplitud: number): Promise<void> {
  await page.addInitScript(
    ([amp]) => {
      const OriginalAudioContext = window.AudioContext;
      let ctx: AudioContext | null = null;
      navigator.mediaDevices.getUserMedia = async () => {
        if (!ctx) ctx = new OriginalAudioContext();
        await ctx.resume();
        const oscilador = ctx.createOscillator();
        oscilador.type = 'sine';
        oscilador.frequency.value = 1000;
        const ganancia = ctx.createGain();
        ganancia.gain.value = amp;
        const destino = ctx.createMediaStreamDestination();
        oscilador.connect(ganancia).connect(destino);
        oscilador.start();
        return destino.stream;
      };
    },
    [amplitud],
  );
}

const botonIniciar = (page: Page) => page.getByRole('button', { name: /Iniciar medición/ });
const botonDetener = (page: Page) => page.getByRole('button', { name: /Detener y guardar/ });
/** Solo la tabla del registro: el bloque educativo tiene tablas propias de seis filas. */
const tablaRegistro = (page: Page) => page.locator('[class*="tablaRegistro"]');
const filas = (page: Page) => tablaRegistro(page).locator('tbody tr');

/** Mide durante `segundos` y detiene guardando. */
async function medirYGuardar(page: Page, segundos: number): Promise<void> {
  await botonIniciar(page).click();
  await expect(page.locator('[class*="dbValue"]')).not.toHaveText('--', { timeout: 15000 });
  await page.waitForTimeout(segundos * 1000);
  await botonDetener(page).click();
}

/** Número en formato español («61,0») como number. */
const aNumero = (texto: string): number => Number(texto.trim().replace(/\./g, '').replace(',', '.'));

test.describe('sonómetro · registro de mediciones', () => {
  test('antes de medir no hay registro que enseñar', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { name: /Registro de mediciones/ })).toHaveCount(0);
    await expect(tablaRegistro(page)).toHaveCount(0);
  });

  test('una medición real deja una fila con el LAeq que se midió, y sobrevive a recargar', async ({
    page,
  }) => {
    await micrófonoSintético(page, 0.05); // 61,0 dB(A) a 1 kHz
    await page.goto(RUTA);
    await medirYGuardar(page, 4);

    await expect(page.getByText('Medición guardada en el registro')).toBeVisible();
    await expect(filas(page)).toHaveCount(1);

    // El LAeq de la fila es el que enseñaban las estadísticas, y el que corresponde a la señal
    const celdas = await filas(page).first().locator('td').allInnerTexts();
    const laeqFila = aNumero(celdas[3]);
    expect(laeqFila).toBeCloseTo(nivelEsperado(0.05), 0);

    // Fecha de hoy en formato español y hora en 24 h
    expect(celdas[0]).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(celdas[1]).toMatch(/^\d{2}:\d{2}$/);
    // Duración: al menos los 4 s medidos
    expect(celdas[2]).toMatch(/\d+ s/);
    // La calibración con la que se midió queda anotada
    expect(celdas[6]).toContain('90 dB');

    // Y sigue ahí tras recargar: es el punto de todo esto
    await page.reload();
    await expect(filas(page)).toHaveCount(1);
    const trasRecargar = await filas(page).first().locator('td').allInnerTexts();
    expect(aNumero(trasRecargar[3])).toBeCloseTo(laeqFila, 1);
  });

  test('una medición de menos de 3 segundos se descarta, y se dice por qué', async ({ page }) => {
    await micrófonoSintético(page, 0.05);
    await page.goto(RUTA);
    await medirYGuardar(page, 0.3);

    await expect(page.getByText(/Medición demasiado corta/)).toBeVisible();
    await expect(filas(page)).toHaveCount(0);
    // Y no ha ensuciado el almacenamiento
    const guardado = await page.evaluate((k) => window.localStorage.getItem(k), CLAVE_SESIONES);
    expect(guardado === null || guardado === '[]').toBeTruthy();
  });

  test('la anotación de una fila se escribe y persiste', async ({ page }) => {
    await micrófonoSintético(page, 0.05);
    await page.goto(RUTA);
    await medirYGuardar(page, 4);

    const nota = filas(page).first().locator('input[type="text"]');
    await nota.fill('dormitorio, ventana cerrada');
    await page.reload();
    await expect(filas(page).first().locator('input[type="text"]')).toHaveValue(
      'dormitorio, ventana cerrada',
    );
  });

  test('las mediciones se apilan con la más reciente arriba, y se pueden borrar', async ({
    page,
  }) => {
    await micrófonoSintético(page, 0.05);
    await page.goto(RUTA);
    await medirYGuardar(page, 3.5);
    await medirYGuardar(page, 3.5);
    await expect(filas(page)).toHaveCount(2);

    // La primera fila es la más reciente: su hora es igual o posterior a la de la segunda
    const horas = await filas(page).locator('td:nth-child(2)').allInnerTexts();
    expect(horas[0] >= horas[1]).toBeTruthy();

    // Borrar una deja la otra
    await filas(page).first().getByRole('button', { name: /^Borrar la medición/ }).click();
    await expect(filas(page)).toHaveCount(1);

    // Borrar el registro entero lo vacía (el diálogo se acepta)
    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Borrar el registro/ }).click();
    await expect(tablaRegistro(page)).toHaveCount(0);
  });

  test('el CSV sale en formato español: punto y coma, coma decimal y BOM para Excel', async ({
    page,
  }) => {
    await micrófonoSintético(page, 0.05);
    await page.goto(RUTA);
    await medirYGuardar(page, 4);
    await filas(page).first().locator('input[type="text"]').fill('salón; con la tele');

    const descarga = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Descargar CSV/ }).click(),
    ]).then(([d]) => d);

    expect(descarga.suggestedFilename()).toMatch(/^sonometro-registro-\d{4}-\d{2}-\d{2}\.csv$/);

    const ruta = await descarga.path();
    const contenido = await (await import('node:fs/promises')).readFile(ruta, 'utf8');

    expect(contenido.charCodeAt(0)).toBe(0xfeff); // BOM: sin él Excel destroza las tildes
    const [cabecera, primera] = contenido.replace(/^﻿/, '').split('\r\n');
    expect(cabecera).toBe(
      'Fecha;Hora;Duración (s);LAeq dB(A);Mínimo dB(A);Máximo dB(A);Calibración (dB);Nota',
    );

    const campos = primera.split(';');
    expect(campos).toHaveLength(8);
    expect(campos[0]).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(campos[3]).toMatch(/^\d+,\d$/); // coma decimal, no punto
    // El punto y coma que el usuario escribió en la nota no puede partir la fila
    expect(campos[7]).toBe('salón con la tele');
  });

  test('lo que sale por impresora es el parte, no la página web', async ({ page }) => {
    await micrófonoSintético(page, 0.05);
    await page.goto(RUTA);
    await medirYGuardar(page, 4);

    await page.emulateMedia({ media: 'print' });

    // La cabecera del parte aparece solo en papel
    await expect(page.getByRole('heading', { name: 'Parte de mediciones de ruido' })).toBeVisible();
    // Y la tabla con el dato
    await expect(filas(page)).toHaveCount(1);
    // El aviso de que esto no tiene validez legal viaja CON el parte: es su parte más importante
    await expect(page.getByText(/No tienen validez legal ni metrológica/)).toBeVisible();

    // Nada de la web alrededor: ni el medidor, ni la calibración, ni los botones, ni el pie
    await expect(page.getByRole('button', { name: /Imprimir el parte/ })).toBeHidden();
    await expect(page.getByRole('heading', { name: /Calibración del micrófono/ })).toBeHidden();
    await expect(page.getByRole('heading', { name: /Niveles de referencia/ })).toBeHidden();
    await expect(page.getByRole('contentinfo')).toBeHidden();
  });
});

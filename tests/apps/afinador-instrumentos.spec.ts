import { test, expect, devices, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { asentarAntesDeTraducir } from './_hidratacion';
import { simularEntradasAudio, pedidas, enchufar, OPCIONES_ESPERADAS, SIN_PROCESADO } from './_entradaAudio';

/**
 * Afinador de Instrumentos — test de regresión de la ampliación del 21/09/2026 (S0156)
 *
 * QUÉ SE AMPLIÓ Y POR QUÉ: en 90 días la página recibía 169 impresiones de búsquedas por
 * instrumentos que NO tenía (trompeta 96, flauta 20, clarinete 16, bandurria 11, piano 10,
 * vihuela 9) frente a 17 de los cuatro que sí traía, todos de cuerda. Se añadieron las
 * familias de viento y tecla y, con ellas, lo que un afinador cromático no resuelve solo:
 * la TRANSPOSICIÓN. Una trompeta en si bemol que toca su Do escrito hace sonar un Si bemol,
 * y hasta ahora el afinador le contestaba con una nota que no era la de su partitura.
 *
 * Los valores esperados están resueltos a mano (La4 = 440 Hz, escala temperada):
 *   Mi2 = 82,41 Hz con La4 = 440  ·  82,78 Hz con La4 = 442
 *   La5 de la bandurria = 880,0 Hz  ·  Sol#3, su 6ª orden = 207,7 Hz
 *   Si bemol 3 = 233,08 Hz → lo lee Do4 una trompeta, Sol4 un saxo alto, Do5 un saxo tenor
 *
 * El micrófono NO se simula aquí: la detección de tono ya la cubren los tests del sonómetro
 * y del analizador de espectro, y lo que esta ampliación introduce —las afinaciones y la
 * traducción de la nota— es determinista y se ve sin tocar un instrumento. La aritmética
 * pura está además en tests/afinacion-instrumentos-motor.spec.ts (npm run test:calc).
 *
 * Inspector 07/11/2026: la detección de tono del afinador NO la comparte el sonómetro ni el
 * analizador (autoCorrelate vive en su page.tsx); desde ese día la miden los bloques «Detección de
 * tono» y «Hallazgos de la detección» del final, con tonos conocidos.
 */

const RUTA = '/afinador-instrumentos/';

/**
 * Micrófono falso de Chromium leyendo un WAV que escribe este mismo fichero (Inspector,
 * 07/11/2026): PCM 16 bits, mono, 48 kHz, senoide pura de 440 Hz, 2 s = 880 ciclos exactos, así
 * que el bucle del dispositivo no mete ningún salto. Los launchOptions son POR FICHERO; los demás
 * tests sustituyen getUserMedia y no los notan. Lo usa el caso móvil del final («camino de verdad»).
 */
function escribirWav(ruta: string, hz: number, segundos = 2, amplitud = 0.5): void {
  const tasa = 48000;
  const muestras = tasa * segundos;
  const b = Buffer.alloc(44 + muestras * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + muestras * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); // PCM
  b.writeUInt16LE(1, 22); // mono
  b.writeUInt32LE(tasa, 24);
  b.writeUInt32LE(tasa * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(muestras * 2, 40);
  for (let i = 0; i < muestras; i++) {
    b.writeInt16LE(Math.round(amplitud * 32767 * Math.sin((2 * Math.PI * hz * i) / tasa)), 44 + i * 2);
  }
  writeFileSync(ruta, b);
}

const WAV_440 = join(tmpdir(), `meskeia-afinador-440hz-${process.pid}.wav`);
escribirWav(WAV_440, 440);

test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${WAV_440}`,
    ],
  },
  permissions: ['microphone'],
});

/**
 * La app es un client component: el HTML llega con los botones pintados pero sin manejador,
 * así que un clic anterior a la hidratación se pierde sin dejar rastro. Se usa el propio
 * selector de instrumento como testigo — cuando el botón queda marcado, React ya escucha.
 */
async function seleccionarInstrumento(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('button', { name: nombre, exact: true });
  await expect(async () => {
    await boton.click({ force: true });
    await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
  }).toPass({ timeout: 20000 });
}

/** Frecuencia que muestra la cuerda n-ésima (1 = primera) del instrumento seleccionado. */
function cuerda(page: Page, numero: number) {
  return page.locator('[class*="cuerdaItem"]').nth(numero - 1);
}

test.describe('Afinaciones de cuerda', () => {
  test('la guitarra mantiene sus seis cuerdas y el Mi2 en 82,4 Hz', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');

    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(6);
    await expect(cuerda(page, 1)).toContainText('Mi4');
    await expect(cuerda(page, 6)).toContainText('Mi2');
    await expect(cuerda(page, 6)).toContainText('82,4 Hz'); // formato español, no 82.4
  });

  test('la bandurria trae sus seis órdenes de Sol#3 a La5', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Bandurria');

    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(6);
    await expect(cuerda(page, 1)).toContainText('La5');
    await expect(cuerda(page, 1)).toContainText('880,0 Hz');
    await expect(cuerda(page, 6)).toContainText('Sol#3');
    await expect(cuerda(page, 6)).toContainText('207,7 Hz');
    await expect(page.getByText(/afinadas por cuartas/i)).toBeVisible();
  });

  test('el laúd español suena una octava por debajo de la bandurria', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Laúd español');

    await expect(cuerda(page, 1)).toContainText('La4');
    await expect(cuerda(page, 6)).toContainText('Sol#2');
    await expect(cuerda(page, 6)).toContainText('103,8 Hz');
  });

  test('la vihuela mexicana avisa de que es reentrante', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Vihuela mexicana');

    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(5);
    await expect(cuerda(page, 3)).toContainText('Sol4');
    await expect(page.getByText(/la 3ª cuerda \(Sol4\) es la nota más aguda/i)).toBeVisible();
  });

  test('cambiar el La de referencia mueve las frecuencias de las cuerdas', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await expect(cuerda(page, 6)).toContainText('82,4 Hz');

    // Antes del 21/09/2026 las frecuencias estaban escritas a mano para 440 Hz y elegir
    // «442 Hz (Orquesta)» no cambiaba ni un decimal de esta tabla.
    await page.getByRole('button', { name: /442 Hz/ }).click();
    await expect(cuerda(page, 6)).toContainText('82,8 Hz');
  });
});

test.describe('Instrumentos transpositores', () => {
  test('la trompeta explica que suena dos semitonos por debajo de lo que se lee', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Trompeta (si bemol)');

    await expect(page.getByText(/lo que suena va 2 semitonos por debajo de lo que lees/i)).toBeVisible();
    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(0);
  });

  test('cada transpositor traduce el si bemol de concierto a SU nota escrita', async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.locator('[class*="referenciasTable"]');

    await seleccionarInstrumento(page, 'Trompeta (si bemol)');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('Do4');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('233,1 Hz');

    await seleccionarInstrumento(page, 'Saxo alto (mi bemol)');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('Sol4');

    await seleccionarInstrumento(page, 'Saxo tenor (si bemol)');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('Do5');
  });

  test('la flauta no transpone: no aparece la columna de la nota leída', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Flauta travesera');

    await expect(page.getByText(/lo que lees es lo que suena/i)).toBeVisible();
    await expect(page.locator('[class*="referenciasTable"]').getByRole('columnheader', { name: 'Tú lees' })).toHaveCount(0);
  });

  test('el piano dice para qué NO sirve', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Piano');

    await expect(page.getByText(/no para afinar el piano/i)).toBeVisible();
    await expect(page.locator('[class*="referenciasTable"]').getByRole('row').filter({ hasText: 'La4' })).toContainText('440,0 Hz');
  });
});

test.describe('Lo que la página promete', () => {
  test('el subtítulo anuncia las tres familias y la traducción', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Afinador de Instrumentos');
    await expect(page.getByText(/cuerda, viento y tecla/i)).toBeVisible();
  });

  test('los tres grupos de instrumentos están en pantalla', async ({ page }) => {
    await page.goto(RUTA);
    for (const familia of ['Cuerda', 'Viento', 'Tecla']) {
      await expect(page.getByRole('heading', { name: new RegExp(familia, 'i'), level: 4 })).toBeVisible();
    }
  });

  test('el botón del micrófono sigue ahí y no arranca solo', async ({ page }) => {
    await page.goto(RUTA);
    const boton = page.getByRole('button', { name: /Iniciar afinador/i });
    await expect(boton).toBeVisible();
    await expect(boton).toHaveAttribute('aria-pressed', 'false');
  });
});

/**
 * Entrada de audio (S0245, 02/11/2026): la primera app de meskeIA que deja conectar un
 * instrumento externo. Con el permiso concedido aparece un selector con las entradas del
 * equipo; elegir una interfaz reabre el afinador con ese dispositivo sin pararlo, y enchufar
 * una con la página abierta la añade a la lista.
 *
 * Y el procesado de voz del navegador, apagado (cabo C0581): con `audio: true` la supresión
 * de ruido apagaba la nota sostenida —medido con el micrófono simulado de Chromium, un La3
 * constante caía de 0,12 a 0,025 de amplitud en dos segundos—. Aquí se comprueba lo que la
 * app PIDE al navegador, que es lo que puede volver atrás sin que nada lo vea.
 *
 * Los dispositivos son falsos: dos entradas, más los alias «default» y «communications» que
 * Chrome añade en Windows y que el selector no debe repetir.
 */
test.describe('Entrada de audio', () => {
  test.beforeEach(async ({ page }) => {
    await simularEntradasAudio(page);
  });

  test('no hay selector hasta conceder el micrófono', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await expect(page.getByLabel('Entrada de audio')).toHaveCount(0);
  });

  test('abre el micrófono sin el procesado de voz del navegador', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();
    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();

    const [primera] = await pedidas(page);
    expect(primera).toMatchObject(SIN_PROCESADO);
    expect(primera.deviceId).toBeUndefined(); // la predeterminada del sistema
    await expect(page.locator('[class*="notaNombre"]')).toHaveText('La');
  });

  test('lista las entradas sin repetir los alias de Windows ni las salidas', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();

    const selector = page.getByLabel('Entrada de audio');
    await expect(selector.locator('option')).toHaveText(OPCIONES_ESPERADAS);
    await expect(selector).toHaveValue('');
  });

  test('elegir la interfaz reabre el afinador con ella, sin pararlo', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();

    await page.getByLabel('Entrada de audio').selectOption('interfaz-usb');
    await expect.poll(async () => (await pedidas(page)).length).toBe(2);
    const segunda = (await pedidas(page))[1];
    expect(segunda).toMatchObject({ deviceId: { exact: 'interfaz-usb' }, noiseSuppression: false });

    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();
    await expect(page.locator('[class*="notaNombre"]')).toHaveText('La');
  });

  test('enchufar una entrada con la página abierta la añade a la lista', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();
    const selector = page.getByLabel('Entrada de audio');
    await expect(selector.locator('option')).toHaveCount(3);

    await enchufar(page);
    await expect(selector.locator('option')).toHaveCount(4);
    await expect(selector.locator('option').last()).toHaveText('Grabadora USB');
  });
});

/**
 * Página traducida por el navegador (cabo C0233, 13/10/2026). El dump de errores reunía en
 * esta app 4 NotFoundError: el aviso «Subir / Bajar tensión / Afinado» eran tres textos
 * condicionales sueltos, hermanos en el mismo <div>. Un traductor sustituye cada nodo de
 * texto por <font><font>…</font></font>, y React, al quitar el texto del estado anterior,
 * buscaba un nodo que ya no estaba (removeChild) y la app caía a la pantalla de error.
 * REPARADO (13/10/2026): cada texto en su <span>. El micrófono es un oscilador cuyo tono
 * mueve el test: 430 Hz queda 40 cents bajo el La4 y 450 Hz, 39 por encima.
 */
test.describe('Página traducida por el navegador', () => {
  test('pasar de «Subir tensión» a «Bajar tensión» y volver no tumba la app', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __tono: (f: number) => void };
      let osc: OscillatorNode | null = null;
      let ctx: AudioContext | null = null;
      w.__tono = (f) => {
        if (osc && ctx) osc.frequency.setValueAtTime(f, ctx.currentTime);
      };
      navigator.mediaDevices.getUserMedia = async () => {
        ctx = new AudioContext();
        osc = ctx.createOscillator();
        osc.frequency.value = 430;
        const destino = ctx.createMediaStreamDestination();
        osc.connect(destino);
        osc.start();
        return destino.stream;
      };
    });
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });

    /** Imita al traductor: cada nodo de texto visible pasa a <font><font>texto</font></font>. */
    // Antes del primer <font>, la página entera asentada (cabo C0493: ver asentarAntesDeTraducir)
    const traducir = async () => {
      await asentarAntesDeTraducir(page);
      return traducirYa();
    };
    const traducirYa = () =>
      page.evaluate(() => {
        const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => {
            const padre = n.parentElement;
            if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
            if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        const nodos: Text[] = [];
        while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
        for (const nodo of nodos) {
          const exterior = document.createElement('font');
          const interior = document.createElement('font');
          interior.textContent = nodo.nodeValue;
          exterior.appendChild(interior);
          nodo.parentNode?.replaceChild(exterior, nodo);
        }
      });

    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();
    const aviso = page.locator('[class*="estadoAfinacion"]');
    await expect(aviso).toContainText('Subir tensión');

    await traducir();
    await page.evaluate(() => (window as unknown as { __tono: (f: number) => void }).__tono(450));
    await expect(aviso).toContainText('Bajar tensión');
    await traducir();
    await page.evaluate(() => (window as unknown as { __tono: (f: number) => void }).__tono(430));
    await expect(aviso).toContainText('Subir tensión');

    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();
    expect(errores).toEqual([]);
  });
});

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 07/11/2026 — primera inspección: la DETECCIÓN DE TONO, que nadie había medido
 *
 * Hasta aquí el fichero no metía ni un tono conocido para leer la nota y los cents: el
 * comentario de arriba lo daba por cubierto por el sonómetro y el analizador, pero la detección
 * del afinador es SUYA (autoCorrelate, en page.tsx) y no la comparte nadie. El micrófono se
 * sustituye por una fuente de Web Audio conocida (seno, silencio o ruido) que entra por el camino
 * real de la app: MediaStreamSource → AnalyserNode (fftSize 2048) → autoCorrelate → notaMasCercana.
 * El AudioContext se fija a 48 kHz: la app lo crea sin sampleRate y Chromium arranca a 44,1 o a
 * 48 kHz según el equipo, y el error del detector depende de esa tasa (medido el 07/11/2026: los
 * dos caminos, WAV por el micrófono falso y oscilador, dieron la misma cifra a 48 kHz).
 *
 * Esperados resueltos a mano ANTES de ejecutar (La4 = 440 Hz salvo que se diga; nota = la de
 * round(12·log2(f/La4)); cents = 1200·log2(f/f_nota), y la app los redondea a entero). La
 * tolerancia es la que la propia FAQ visible promete «en condiciones ideales»: ±1-2 cents.
 *   NORMAL   440 Hz → La4, 0 cents, «✓ Afinado» (umbral de la app: |cents| ≤ 5)
 *            445 Hz → La4, 1200·log2(445/440) = +19,56 cents, «↑ Bajar tensión»
 *            82,41 Hz → Mi2 (6ª de la guitarra), 0 cents
 *            233,08 Hz con la trompeta → suena La#3 (si bemol 3), «tú lees Do4» (transposición −2)
 *   LÍMITE   452,63 Hz = 440·2^(49/1200) → La4 +49 · 453,16 Hz = 440·2^(51/1200) → La#4 −49
 *            440 Hz con La4 = 442 → La4, 1200·log2(440/442) = −7,85 cents, «↓ Subir tensión»
 *            55 Hz (3ª del bajo) → La1, 0 cents
 *   RECHAZO  silencio y ruido blanco → ninguna nota («--» y «-- Hz»)
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

interface FuenteSimulada {
  /** seno: oscilador · silencio: nada conectado · blanco/grave: ruido en bucle (grave = filtrado) */
  tipo: 'seno' | 'silencio' | 'blanco' | 'grave';
  hz?: number;
  /** Amplitud de pico que llega al analizador */
  ganancia?: number;
}

/** Sustituye el micrófono por `fuente` y fija el AudioContext de la página a 48 kHz. */
async function microfonoSimulado(page: Page, fuente: FuenteSimulada): Promise<void> {
  await page.addInitScript((f: FuenteSimulada) => {
    const Original = window.AudioContext;
    class Contexto48k extends Original {
      constructor(opciones?: AudioContextOptions) {
        super({ sampleRate: 48000, ...(opciones ?? {}) });
      }
    }
    window.AudioContext = Contexto48k;
    navigator.mediaDevices.getUserMedia = async () => {
      const ctx = new AudioContext();
      await Promise.race([ctx.resume(), new Promise((listo) => setTimeout(listo, 1000))]);
      const destino = ctx.createMediaStreamDestination();
      const ganancia = ctx.createGain();
      ganancia.gain.value = f.ganancia ?? 0.5;
      ganancia.connect(destino);
      if (f.tipo === 'seno') {
        const oscilador = ctx.createOscillator();
        oscilador.frequency.value = f.hz ?? 440;
        oscilador.connect(ganancia);
        oscilador.start();
      } else if (f.tipo === 'blanco' || f.tipo === 'grave') {
        // 4 s de ruido con semilla fija, normalizado a pico 1; «grave» pasa por un paso bajo de
        // un polo (ruido marrón: el retumbar de una sala, un ventilador, el tráfico)
        const n = ctx.sampleRate * 4;
        const bufer = ctx.createBuffer(1, n, ctx.sampleRate);
        const d = bufer.getChannelData(0);
        let semilla = 12345;
        const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647) * 2 - 1;
        let v = 0;
        for (let i = 0; i < n; i++) {
          if (f.tipo === 'blanco') d[i] = azar();
          else {
            v = 0.98 * v + 0.2 * azar();
            d[i] = v;
          }
        }
        let pico = 0;
        for (let i = 0; i < n; i++) pico = Math.max(pico, Math.abs(d[i]));
        for (let i = 0; i < n; i++) d[i] /= pico;
        const fuenteRuido = ctx.createBufferSource();
        fuenteRuido.buffer = bufer;
        fuenteRuido.loop = true;
        fuenteRuido.connect(ganancia);
        fuenteRuido.start();
      }
      return destino.stream;
    };
  }, fuente);
}

/** Abre la app con el micrófono simulado, elige instrumento (y La4) y arranca el afinador. */
async function afinarCon(
  page: Page,
  fuente: FuenteSimulada,
  opciones: { instrumento?: string; preset?: RegExp; bajarReferencia?: number } = {},
): Promise<void> {
  await microfonoSimulado(page, fuente);
  await page.goto(RUTA);
  await seleccionarInstrumento(page, opciones.instrumento ?? 'Guitarra estándar');
  if (opciones.preset) await page.getByRole('button', { name: opciones.preset }).click();
  for (let i = 0; i < (opciones.bajarReferencia ?? 0); i++) {
    await page.locator('[class*="referenciaControl"] button').first().click();
  }
  await page.getByRole('button', { name: /Iniciar afinador/i }).click();
  await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();
}

const pantalla = (page: Page) => ({
  cents: page.locator('[class*="centsValor"]'),
  frecuencia: page.locator('[class*="frecuenciaValor"]'),
  estado: page.locator('[class*="estadoAfinacion"]'),
});

/** Nota leída en pantalla, p. ej. «La4», o «--» si no pinta ninguna. Lee sin esperar al nodo. */
function notaLeida(page: Page): Promise<string> {
  return page.evaluate(() => {
    const nombre = document.querySelector('[class*="notaNombre"]')?.textContent;
    const octava = document.querySelector('[class*="notaOctava"]')?.textContent ?? '';
    return nombre ? `${nombre}${octava}` : '--';
  });
}

/** Distancia en cents entre lo que pinta la app y el esperado; Infinity si no pinta ninguno. */
async function desvioCents(page: Page, esperado: number): Promise<number> {
  const texto = (await pantalla(page).cents.textContent()) ?? '';
  const m = texto.match(/^([+-]?\d+) cents$/);
  return m ? Math.abs(Number(m[1]) - esperado) : Infinity;
}

/** Hz que pinta la app («440,3 Hz» → 440,3); NaN si no pinta ninguna. */
async function hzLeidos(page: Page): Promise<number> {
  const texto = (await pantalla(page).frecuencia.textContent()) ?? '';
  return Number(texto.replace(' Hz', '').replace(/\./g, '').replace(',', '.'));
}

test.describe('Detección de tono — INSPECTOR 07/11/2026', () => {
  test('NORMAL · 440 Hz es La4 a 0 cents y «✓ Afinado»', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 440 });
    await expect.poll(() => notaLeida(page)).toBe('La4');
    await expect.poll(() => desvioCents(page, 0)).toBeLessThanOrEqual(2);
    await expect(pantalla(page).estado).toHaveText('✓ Afinado');
    expect(await hzLeidos(page)).toBeCloseTo(440, 0); // medido 440,3 Hz
  });

  test('NORMAL · 445 Hz es La4 +19,56 cents y «↑ Bajar tensión»', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 445 });
    await expect.poll(() => notaLeida(page)).toBe('La4');
    await expect.poll(() => desvioCents(page, 19.56)).toBeLessThanOrEqual(2); // medido +18
    await expect(pantalla(page).estado).toHaveText('↑ Bajar tensión');
  });

  test('NORMAL · la 6ª de la guitarra, Mi2 = 82,41 Hz, se lee Mi2 afinado', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 82.4069 });
    await expect.poll(() => notaLeida(page)).toBe('Mi2');
    await expect.poll(() => desvioCents(page, 0)).toBeLessThanOrEqual(2);
    await expect(pantalla(page).estado).toHaveText('✓ Afinado');
  });

  test('NORMAL · trompeta: el si bemol de concierto (233,08 Hz) suena La#3 y se lee Do4', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 233.0819 }, { instrumento: 'Trompeta (si bemol)' });
    await expect.poll(() => notaLeida(page)).toBe('La#3');
    const traduccion = page.locator('[class*="transposicionAviso"]');
    await expect(traduccion).toContainText('Suena La#3 real');
    await expect(traduccion).toContainText('tú lees Do4');
  });

  test('LÍMITE · a un cent de la frontera por abajo: 452,63 Hz es La4 +49', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 452.6313 });
    await expect.poll(() => notaLeida(page)).toBe('La4');
    await expect.poll(() => desvioCents(page, 49)).toBeLessThanOrEqual(2); // medido +50
  });

  test('LÍMITE · a un cent de la frontera por arriba: 453,16 Hz es La#4 −49', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 453.1555 });
    await expect.poll(() => notaLeida(page)).toBe('La#4');
    await expect.poll(() => desvioCents(page, -49)).toBeLessThanOrEqual(2); // medido −50
  });

  test('LÍMITE · con La4 = 442 elegido ANTES de arrancar, 440 Hz es La4 −7,85 cents', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 440 }, { preset: /442 Hz/ });
    await expect.poll(() => notaLeida(page)).toBe('La4');
    await expect.poll(() => desvioCents(page, -7.85)).toBeLessThanOrEqual(2); // medido −7
    await expect(pantalla(page).estado).toHaveText('↓ Subir tensión');
  });

  test('LÍMITE · la 3ª del bajo, La1 = 55 Hz, se lee La1 afinado', async ({ page }) => {
    await afinarCon(page, { tipo: 'seno', hz: 55 }, { instrumento: 'Bajo 4 cuerdas' });
    await expect.poll(() => notaLeida(page)).toBe('La1');
    await expect.poll(() => desvioCents(page, 0)).toBeLessThanOrEqual(2);
  });

  for (const tipo of ['silencio', 'blanco'] as const) {
    test(`RECHAZO · ${tipo === 'silencio' ? 'silencio' : 'ruido blanco'}: el afinador no inventa una nota`, async ({ page }) => {
      await afinarCon(page, { tipo, ganancia: 0.1 });
      const lecturas: string[] = [];
      for (let i = 0; i < 15; i++) {
        lecturas.push(`${await notaLeida(page)} · ${await pantalla(page).frecuencia.textContent()}`);
        await page.waitForTimeout(100);
      }
      expect(new Set(lecturas)).toEqual(new Set(['-- · -- Hz']));
    });
  }
});

/**
 * HALLAZGOS ABIERTOS del Inspector (07/11/2026). Cada test afirma lo CORRECTO y lleva
 * test.fail(): cuando se repare, «pasará» y Playwright lo marcará en rojo para quitar la marca.
 */
test.describe('Hallazgos de la detección — INSPECTOR 07/11/2026', () => {
  test('ABIERTO · el La5 de la bandurria (880 Hz) bien afinado se lee afinado', async ({ page }) => {
    // ABIERTO (calculo, alto). 880 Hz → esperado La5, 0 cents, «✓ Afinado» · obtenido La5 −6 cents,
    // «↓ Subir tensión», «877,0 Hz» (con 0,05 de amplitud, −14 cents; en diente de sierra, −10).
    // La interpolación de autoCorrelate (`bestOffset + 8 * shift`, page.tsx:70) corrige el periodo
    // con un factor que depende de la amplitud: el error llega a ±866/P cents (P = muestras por
    // periodo), y la FAQ visible promete «±1-2 cents» en condiciones ideales.
    test.fail();
    await afinarCon(page, { tipo: 'seno', hz: 880 });
    await expect.poll(() => notaLeida(page)).toBe('La5');
    await expect.poll(() => desvioCents(page, 0)).toBeLessThanOrEqual(2);
    await expect(pantalla(page).estado).toHaveText('✓ Afinado');
  });

  test('ABIERTO · la 4ª del bajo, Mi1 = 41,20 Hz, se lee Mi1', async ({ page }) => {
    // ABIERTO (calculo, alto). 41,20 Hz con «Bajo 4 cuerdas» → esperado Mi1, 0 cents · obtenido
    // «Fa#1 +25 cents», «46,9 Hz», «↑ Bajar tensión» (con amplitud 0,5, «--»). El detector busca
    // el periodo hasta fftSize/2 − 1 = 1.023 muestras: por debajo de 48.000/1.023 = 46,9 Hz no hay
    // periodo que encontrar, y devuelve ese tope. Mi1, Fa1 y Fa#1 no se pueden afinar, ni por cable.
    test.fail();
    await afinarCon(page, { tipo: 'seno', hz: 41.2034, ganancia: 0.05 }, { instrumento: 'Bajo 4 cuerdas' });
    await expect.poll(() => notaLeida(page)).toBe('Mi1');
    await expect.poll(() => desvioCents(page, 0)).toBeLessThanOrEqual(2);
  });

  test('ABIERTO · cambiar el La de referencia con el afinador EN MARCHA cambia la lectura', async ({ page }) => {
    // ABIERTO (calculo, alto). 440 Hz, arranca con La4 = 440 (La4 +1) y se pulsa «442 Hz
    // (Orquesta)» → esperado La4 −7,85 cents, «↓ Subir tensión» · obtenido La4 +1, «✓ Afinado»,
    // con «442 Hz» marcado y la tabla de cuerdas ya en 442 (Mi2 = 82,8 Hz). El bucle de
    // requestAnimationFrame se queda con el detectarPitch del arranque, y con él con su La4.
    test.fail();
    await afinarCon(page, { tipo: 'seno', hz: 440 });
    await expect.poll(() => desvioCents(page, 0)).toBeLessThanOrEqual(2);
    await page.getByRole('button', { name: /442 Hz/ }).click();
    await expect(page.locator('[class*="cuerdaItem"]').nth(5)).toContainText('82,8 Hz');
    await expect.poll(() => desvioCents(page, -7.85)).toBeLessThanOrEqual(2);
    await expect(pantalla(page).estado).toHaveText('↓ Subir tensión');
  });

  test('ABIERTO · el ruido grave de una sala no inventa notas', async ({ page }) => {
    // ABIERTO (operativa, medio). Ruido marrón (paso bajo) de 0,05 de pico, sin ningún tono →
    // esperado «--» todo el rato · obtenido una nota distinta casi en cada lectura (Mi5 −28, Fa#4
    // +37, La5 +17…, 17 de 20), alguna con «✓ Afinado». El listón de 0,9 de autoCorrelate se mide
    // sobre la diferencia media absoluta, que escala con la amplitud: una señal floja lo pasa
    // siempre, sea periódica o no.
    test.fail();
    await afinarCon(page, { tipo: 'grave', ganancia: 0.05 });
    const lecturas: string[] = [];
    for (let i = 0; i < 15; i++) {
      lecturas.push(await notaLeida(page));
      await page.waitForTimeout(100);
    }
    expect(new Set(lecturas)).toEqual(new Set(['--']));
  });

  test('ABIERTO · el umbral de «✓ Afinado» y la FAQPage dicen lo mismo', async ({ page }) => {
    // ABIERTO (contenido, bajo). La FAQPage dice «por debajo de 5 cents se considera afinado»; la
    // app da por afinado |cents redondeados| ≤ 5 (page.tsx:191), que llega a 5,49. Tono de
    // 48.000/109 = 440,367 Hz (periodo entero a 48 kHz: el detector lo clava) con La4 = 439 →
    // 1200·log2(440,367/439) = +5,38 cents → la app pinta «+5 cents ✓ Afinado». Se repara
    // cambiando el texto o el umbral: el test pasa con cualquiera de los dos.
    test.fail();
    await afinarCon(page, { tipo: 'seno', hz: 48000 / 109 }, { bajarReferencia: 1 });
    await expect(page.locator('[class*="referenciaValor"]')).toHaveText('439 Hz');
    await expect(pantalla(page).cents).toHaveText('+5 cents');
    const afinadoEnPantalla = await page.evaluate(() =>
      (document.querySelector('[class*="estadoAfinacion"]')?.textContent ?? '').includes('Afinado'),
    );
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    const faqDiceDebajoDe5 = /por debajo de 5 cents se considera afinado/.test(faq);
    expect(afinadoEnPantalla && faqDiceDebajoDe5, '+5,38 cents en «Afinado» y la FAQ dice «por debajo de 5»').toBe(false);
  });

  test('ABIERTO · la tabla educativa da el rango del banjo desde su Re3 (146,8 Hz)', async ({ page }) => {
    // ABIERTO (contenido, bajo). Banjo 5 cuerdas Sol4-Re3-Sol3-Si3-Re4: la nota más grave es
    // Re3 = 440·2^((50−69)/12) = 146,83 Hz → esperado «147 – 392 Hz» · obtenido «196 – 392 Hz»
    // (196 Hz es el Sol3, la 4ª cuerda).
    test.fail();
    await page.goto(RUTA);
    // La guía educativa nace plegada (oculta por clase, pero en el DOM): se lee la fila por CSS
    const fila = page.locator('tr', { hasText: 'Banjo 5 cuerdas' });
    await expect(fila).toContainText('392 Hz'); // la fila es la que se cree: su techo, Sol4, está bien
    await expect(fila).toContainText('147');
  });

  test('ABIERTO · los botones − y + de la referencia dicen qué cambian', async ({ page }) => {
    // ABIERTO (accesibilidad, bajo). Su nombre accesible es solo «−» y «+» (sin aria-label): un
    // lector de pantalla oye «menos, botón» sin saber que baja el La de referencia 1 Hz.
    test.fail();
    await page.goto(RUTA);
    const botones = page.locator('[class*="referenciaControl"] button');
    await expect(botones).toHaveCount(2);
    await expect(botones.first()).toHaveAccessibleName(/[a-záéíóúñ]{3,}/i);
    await expect(botones.last()).toHaveAccessibleName(/[a-záéíóúñ]{3,}/i);
  });
});

/**
 * Camino de verdad en un Pixel 7 (Inspector, 07/11/2026): sin sustituir nada, el micrófono falso
 * de Chromium lee el WAV de 440 Hz del principio del fichero. Se comprueba que el medio ARRANCA
 * (AudioContext «running», pista «live» del dispositivo falso) y que la lectura llega a la
 * pantalla. Aquí no se fija la tasa: la nota y el «✓ Afinado» (|cents| ≤ 5) valen a 44,1 y a
 * 48 kHz; la precisión de ±2 cents ya la miden los casos de arriba.
 */
test.describe('Micrófono falso de Chromium en un Pixel 7 — INSPECTOR 07/11/2026', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('el AudioContext corre, la pista está viva y el La4 del WAV se lee afinado', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __contextos: AudioContext[]; __flujos: MediaStream[] };
      w.__contextos = [];
      w.__flujos = [];
      const crearFuente = AudioContext.prototype.createMediaStreamSource;
      AudioContext.prototype.createMediaStreamSource = function (this: AudioContext, flujo: MediaStream) {
        w.__contextos.push(this);
        w.__flujos.push(flujo);
        return crearFuente.call(this, flujo);
      };
    });
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).tap();
    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();

    const medio = () =>
      page.evaluate(() => {
        const w = window as unknown as { __contextos: AudioContext[]; __flujos: MediaStream[] };
        const pista = w.__flujos[w.__flujos.length - 1]?.getAudioTracks()[0];
        const contexto = w.__contextos[w.__contextos.length - 1];
        return { contexto: contexto?.state ?? null, pista: pista?.readyState ?? null, etiqueta: pista?.label ?? '' };
      });
    await expect.poll(async () => (await medio()).contexto).toBe('running');
    expect(await medio()).toMatchObject({ pista: 'live', etiqueta: expect.stringMatching(/Fake/i) });

    await expect.poll(() => notaLeida(page)).toBe('La4');
    await expect(pantalla(page).estado).toHaveText('✓ Afinado');
    // El aviso de la app, no el anunciador de rutas de Next (que también es role="alert")
    await expect(page.locator('[class*="avisoAudio"]')).toHaveText('');
    // Sin desbordar en 412 px
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(412);
  });
});

import { test, expect, Page } from '@playwright/test';

/**
 * visualizador-escalas-musicales — el diapasón de guitarra, bajo y ukelele (semilla S0116)
 *
 * La app llevaba desde su creación dibujando SOLO un teclado de piano, mientras su propio
 * texto describía la pentatónica menor como «la más usada en rock, blues y solos de guitarra».
 * El 04/09/2026 se le añadió el mástil, con cuatro afinaciones.
 *
 * DÓNDE VIVE EL CÁLCULO — app/visualizador-escalas-musicales/page.tsx, componente
 * `MastilVisual`. La nota que suena en la cuerda `c` pisando el traste `t` es
 * `(afinacion.cuerdas[c] + t) % 12`, y se pinta un círculo cuando esa clase de nota está en
 * la escala seleccionada. Geometría: cejuela en x=26, traste de 44 px de ancho, cuerdas
 * separadas 30 px con la primera en y=22, de modo que
 *     xDeTraste(0) = 13 · xDeTraste(t>0) = 48 + (t−1)·44 · yDeCuerda(c) = 22 + c·30
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (guitarra en Mi estándar, cuerdas de
 * arriba abajo E-B-G-D-A-E = 4, 11, 7, 2, 9, 4):
 *
 *   · Do mayor {C,D,E,F,G,A,B} = {0,2,4,5,7,9,11}. En 13 posiciones (traste 0 al 12) cada
 *     clase de nota sale una vez, y la del traste 0 vuelve a salir en el 12 — así que cada
 *     cuerda da 7 puntos + 1 si su nota al aire pertenece a la escala. Las seis cuerdas de la
 *     afinación estándar están en Do mayor, luego 6 × 8 = 48 puntos. Ninguna cuerda al aire es
 *     Do, así que hay exactamente 6 tónicas (una por cuerda) y 42 puntos normales.
 *   · La tónica de la 5ª cuerda (A, índice 4) cae en el traste 3, que es el Do de toda la
 *     vida: cx = 48 + 2·44 = 136 y cy = 22 + 4·30 = 142.
 *   · Ukelele (A-E-C-G = 9, 4, 0, 7) en Do mayor: 4 × 8 = 32 puntos, pero la cuerda de Do al
 *     aire hace que la tónica salga DOS veces en ella (trastes 0 y 12), así que son 5 tónicas
 *     y 27 puntos normales. Es el caso que demuestra que el dibujo depende de la afinación.
 *   · Pentatónica menor de La {A,C,D,E,G} = {9,0,2,4,7} en guitarra estándar: 5 puntos por
 *     cuerda más el bis del traste 12 en las cinco cuerdas cuyo aire pertenece a la escala
 *     (todas menos el Si) = 6+5+6+6+6+6 = 35 puntos, de los cuales 7 son tónicas (la cuerda
 *     de La aporta dos: al aire y en el traste 12). En la 6ª cuerda los puntos caen en los
 *     trastes 5 y 8, que es la primera posición que aprende cualquier guitarrista.
 */

const RUTA = '/visualizador-escalas-musicales/';

/** Geometría del componente, replicada aquí para poder afirmar posiciones concretas. */
const ANCHO_NUT = 26;
const ANCHO_TRASTE = 44;
const ALTO_CUERDA = 30;
const MARGEN_SUP = 22;
const xDeTraste = (t: number) => (t === 0 ? ANCHO_NUT / 2 : ANCHO_NUT + (t - 1) * ANCHO_TRASTE + ANCHO_TRASTE / 2);
const yDeCuerda = (c: number) => MARGEN_SUP + c * ALTO_CUERDA;

/** Cuenta los círculos de nota del mástil separando tónicas del resto (las marcas de
 *  posición de la madera también son <circle>, por eso se filtra por clase). */
async function contarNotas(page: Page): Promise<{ tonicas: number; normales: number }> {
  return page.evaluate(() => {
    const circulos = Array.from(document.querySelectorAll('svg[class*="mastilSvg"] circle'));
    const clase = (c: Element) => c.getAttribute('class') ?? '';
    return {
      tonicas: circulos.filter((c) => clase(c).includes('mastilNotaTonica')).length,
      normales: circulos.filter((c) => clase(c).includes('mastilNota') && !clase(c).includes('Tonica')).length,
    };
  });
}

/** ¿Hay una nota (tónica o no) exactamente en esa cuerda y ese traste? */
async function hayNotaEn(page: Page, cuerda: number, traste: number): Promise<'tonica' | 'normal' | null> {
  return page.evaluate(({ cx, cy }) => {
    // Solo círculos de nota: las marcas de posición de la madera también son <circle> y
    // comparten coordenadas con alguna cuerda, así que buscar "el primero que coincida"
    // devolvería la marca y haría creer que no hay nota donde sí la hay.
    const notas = Array.from(document.querySelectorAll('svg[class*="mastilSvg"] circle'))
      .filter((c) => (c.getAttribute('class') ?? '').includes('mastilNota'));
    const encontrado = notas.find(
      (c) => Number(c.getAttribute('cx')) === cx && Number(c.getAttribute('cy')) === cy
    );
    if (!encontrado) return null;
    return (encontrado.getAttribute('class') ?? '').includes('Tonica') ? 'tonica' : 'normal';
  }, { cx: xDeTraste(traste), cy: yDeCuerda(cuerda) });
}

async function elegirRaiz(page: Page, titulo: string) {
  await page.getByTitle(titulo).click();
}

async function elegirEscala(page: Page, nombre: string) {
  await page.getByRole('button', { name: nombre, exact: true }).click();
}

async function elegirAfinacion(page: Page, nombre: string) {
  await page.getByRole('button', { name: nombre, exact: true }).click();
}

/**
 * React ha enganchado los botones de la app. El <h1> viaja en el HTML servido, así que verlo no
 * dice que la página responda: un clic anterior a la hidratación se pierde (cabecera de
 * tests/apps/_hidratacion.ts). Añadido por el Inspector el 15/11/2026: los casos del diapasón
 * pulsaban la raíz nada más ver el título.
 */
async function esperarBotonesHidratados(page: Page) {
  await page.waitForFunction(() => {
    const boton = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Escuchar la escala'));
    return !!boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$'));
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Escalas Musicales');
  await esperarBotonesHidratados(page);
});

test.describe('El diapasón dibuja la escala en la posición correcta', () => {
  test('Do mayor en guitarra estándar: 48 puntos, 6 de ellos tónicas', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    const { tonicas, normales } = await contarNotas(page);
    expect(tonicas).toBe(6);
    expect(normales).toBe(42);
  });

  test('el Do de la 5ª cuerda cae en el traste 3 y sale marcado como tónica', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    expect(await hayNotaEn(page, 4, 3)).toBe('tonica');
    // Y el traste 2 de esa cuerda es un Si: pertenece a Do mayor, pero no es la tónica
    expect(await hayNotaEn(page, 4, 2)).toBe('normal');
    // El traste 1 es un La sostenido: fuera de la escala, sin punto
    expect(await hayNotaEn(page, 4, 1)).toBeNull();
  });

  test('la primera posición de la pentatónica menor de La cae en los trastes 5 y 8 de la 6ª cuerda', async ({ page }) => {
    await elegirRaiz(page, 'A (La)');
    await elegirEscala(page, 'Pentatónica menor');
    expect(await hayNotaEn(page, 5, 5)).toBe('tonica'); // el La de la 6ª cuerda
    expect(await hayNotaEn(page, 5, 8)).toBe('normal'); // el Do
    expect(await hayNotaEn(page, 5, 6)).toBeNull();     // entre medias no hay nada que pisar
    const { tonicas, normales } = await contarNotas(page);
    expect(tonicas).toBe(7);
    expect(normales).toBe(28);
  });
});

test.describe('Cambiar de instrumento cambia el patrón, que es para lo que sirve', () => {
  test('el ukelele en Do mayor tiene 5 tónicas porque su cuerda de Do al aire la repite en el traste 12', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    await elegirAfinacion(page, 'Ukelele · Sol Do Mi La');

    const { tonicas, normales } = await contarNotas(page);
    expect(tonicas).toBe(5);
    expect(normales).toBe(27);
    // La tercera cuerda del ukelele es el Do: tónica al aire y de nuevo una octava después
    expect(await hayNotaEn(page, 2, 0)).toBe('tonica');
    expect(await hayNotaEn(page, 2, 12)).toBe('tonica');
  });

  test('el bajo de 4 cuerdas dibuja 32 puntos y una sola tónica por cuerda', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    await elegirAfinacion(page, 'Bajo · 4 cuerdas');

    const { tonicas, normales } = await contarNotas(page);
    expect(tonicas).toBe(4);
    expect(normales).toBe(28);
  });

  test('el selector de afinación se comporta como un grupo de conmutadores', async ({ page }) => {
    const estandar = page.getByRole('button', { name: 'Guitarra · Mi estándar', exact: true });
    const dropD = page.getByRole('button', { name: 'Guitarra · Drop D', exact: true });

    await expect(estandar).toHaveAttribute('aria-pressed', 'true');
    await expect(dropD).toHaveAttribute('aria-pressed', 'false');

    await dropD.click();
    await expect(dropD).toHaveAttribute('aria-pressed', 'true');
    await expect(estandar).toHaveAttribute('aria-pressed', 'false');

    // En Drop D la 6ª cuerda baja de Mi a Re: en Do mayor su tónica pasa del traste 8 al 10
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    expect(await hayNotaEn(page, 5, 10)).toBe('tonica');
    expect(await hayNotaEn(page, 5, 8)).toBeNull();
  });
});

test('el piano sigue estando: el mástil se añade, no sustituye', async ({ page }) => {
  await expect(page.getByRole('img', { name: /Teclado de piano/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Diapasón de Guitarra/ })).toBeVisible();
});

/**
 * S0177 (03/10/2026) — la escala SUENA.
 *
 * Un test no oye, pero puede leer qué frecuencias se le piden a Web Audio: un espía envuelve
 * `createOscillator` y apunta cada `frequency.setValueAtTime`. Si se programan las notas
 * correctas en el orden correcto, lo que sale por el altavoz es la escala. El cálculo está
 * probado aparte en tests/escalas-sonido-motor.spec.ts.
 *
 * CASOS RESUELTOS A MANO (temperamento igual, La 4 = 440 Hz, f = 440 · 2^((midi − 69)/12)):
 *   · Do mayor subiendo, desde el Do central: Do4 261,63 · Re4 293,66 · Mi4 329,63 · Fa4 349,23
 *     · Sol4 392,00 · La4 440,00 · Si4 493,88 · Do5 523,25 (8 notas, la última es la octava).
 *   · Pentatónica menor de La: su I grado es el La 440 y su III grado el Do5, 523,25.
 */
test.describe('S0177 · escuchar la escala', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as typeof window & { __frecuencias: number[] };
      w.__frecuencias = [];
      const original = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (this: AudioContext) {
        const osc = original.call(this);
        const fijar = osc.frequency.setValueAtTime.bind(osc.frequency);
        osc.frequency.setValueAtTime = (valor: number, cuando: number) => {
          w.__frecuencias.push(Math.round(valor * 100) / 100);
          return fijar(valor, cuando);
        };
        return osc;
      };
    });
    await page.reload();
    // React debe haber enganchado el botón: un clic anterior a la hidratación se pierde
    await page.waitForFunction(() => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Escuchar la escala'));
      return !!boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$'));
    });
  });

  const frecuencias = (page: Page) =>
    page.evaluate(() => (window as typeof window & { __frecuencias: number[] }).__frecuencias);
  const botonEscuchar = (page: Page) => page.getByRole('button', { name: /Escuchar la escala|Detener/ });
  const fichas = (page: Page) => page.getByRole('list', { name: 'Notas de la escala' }).getByRole('button');

  test('Do mayor subiendo suena con las 8 frecuencias de la escala, en orden', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    await page.getByRole('button', { name: 'Subir', exact: true }).click();
    await page.getByRole('button', { name: 'Rápido', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Subir', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await botonEscuchar(page).click();
    await expect(botonEscuchar(page)).toHaveText(/Detener/);
    expect(await frecuencias(page)).toEqual([261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25]);

    // Mientras suena se resalta una ficha, y su tecla en las dos octavas del piano
    await expect(page.locator('[data-sonando="true"]')).toHaveCount(1);
    await expect(page.locator('svg [class*="teclaSonando"]')).toHaveCount(2);

    // 8 notas a 160 por minuto son 3 s: al acabar, el botón vuelve y no queda nada resaltado
    await expect(botonEscuchar(page)).toHaveText(/Escuchar la escala/, { timeout: 6_000 });
    await expect(page.locator('[data-sonando="true"]')).toHaveCount(0);
  });

  test('subir y bajar: 15 notas y la de arriba una sola vez', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    // «Subir y bajar» es el recorrido por defecto
    await expect(page.getByRole('button', { name: 'Subir y bajar', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await botonEscuchar(page).click();
    const f = await frecuencias(page);
    expect(f).toHaveLength(15);
    expect(f.filter((x) => x === 523.25)).toHaveLength(1);
    expect(f[0]).toBe(261.63);
    expect(f[14]).toBe(261.63);
    await botonEscuchar(page).click(); // Detener
    await expect(botonEscuchar(page)).toHaveText(/Escuchar la escala/);
  });

  test('cada ficha suena sola a su altura: La pentatónica menor, I = 440 y III = Do5', async ({ page }) => {
    await elegirRaiz(page, 'A (La)');
    await elegirEscala(page, 'Pentatónica menor');
    await expect(fichas(page)).toHaveCount(5);

    await fichas(page).nth(0).click();
    await expect(fichas(page).nth(0)).toHaveAttribute('data-sonando', 'true');
    await fichas(page).nth(1).click();
    await expect(fichas(page).nth(1)).toHaveAttribute('data-sonando', 'true');
    expect(await frecuencias(page)).toEqual([440, 523.25]);
    // La ficha se anuncia como botón que suena, con lo que se ve escrito
    await expect(fichas(page).nth(0)).toHaveAccessibleName(/Escuchar I A La/);
  });

  test('cambiar de escala mientras suena la calla', async ({ page }) => {
    await page.getByRole('button', { name: 'Lento', exact: true }).click();
    await botonEscuchar(page).click();
    await expect(botonEscuchar(page)).toHaveText(/Detener/);
    await elegirEscala(page, 'Menor natural');
    await expect(botonEscuchar(page)).toHaveText(/Escuchar la escala/);
    await expect(page.locator('[data-sonando="true"]')).toHaveCount(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR · 15/11/2026 (primera inspección entera, cabos C0496 y C0497)
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR LA APP (.inspector-trabajo/esperados-escalas.mjs):
 * fórmula de semitonos de cada escala, deletreo con cada letra UNA sola vez en las escalas de
 * siete notas y temperamento igual con La4 = 440 Hz, f = 440 · 2^((midi − 69)/12). La app
 * arranca la escala en la octava del Do central (MIDI 60 + raíz) y la cierra en la octava.
 *
 *   1 · normal — La menor natural (raíz 9, 0 2 3 5 7 8 10): A B C D E F G, acordes Am B° C Dm
 *       Em F G; MIDI 69 71 72 74 76 77 79 + 81 → 440 · 493,88 · 523,25 · 587,33 · 659,26 ·
 *       698,46 · 783,99 · 880 Hz.
 *   2 · límite — Fa# mayor (raíz 6): F# G# A# B C# D# **E#** (no F: la letra F ya está en F#);
 *       MIDI 66 68 70 71 73 75 77 + 78 → 369,99 · 415,30 · 466,16 · 493,88 · 554,37 · 622,25 ·
 *       698,46 · 739,99 Hz. Fa mayor: F G A **B♭** C D E (no A#). Do# menor armónica: C# D# E
 *       F# G# A **B#** (MIDI 72, 523,25 Hz). Blues de La: A C D **E♭** E G (lo dice la tabla de
 *       la propia app, «La-Do-Re-Mib-Mi-Sol», y su FAQ llama b5 a la blue note). La frigio:
 *       A **B♭** C D E F G («la 2ª bemol es su sello distintivo», dice la app). Mástil: Mi frigio
 *       en guitarra estándar tiene las mismas clases de nota que Do mayor (48 puntos) y la tónica
 *       sale en las dos cuerdas de Mi al aire y en su traste 12: 6 + 2 = 8 tónicas, 40 normales.
 *   3 · a tratar — pulsar «Escuchar» dos veces seguidas no puede dejar dos escalas superpuestas;
 *       «Detener» y cambiar la raíz mientras suena dejan todos los osciladores terminados.
 *
 * Las frecuencias, el mástil y el sonido cuadran. Lo que NO cuadra es el NOMBRE de las notas:
 * la app solo conoce sostenidos (NOTAS_CROMATICAS), así que toda escala con bemoles o con E#/B#
 * sale mal deletreada. Esos casos van en test.fail() con «ABIERTO»: cuando se reparen, el test
 * «pasará», Playwright lo marcará como fallo inesperado y habrá que quitar el test.fail().
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

type VentanaEspia = typeof window & { __hz: number[]; __creados: number; __escalasTerminados: number };

/** Letra de una nota escrita en inglés (A#, B♭, Bb) o en español (Si♭, Fa#). */
function letraDe(nombre: string): string {
  const limpio = nombre.trim();
  const silabas: Record<string, string> = { Do: 'C', Re: 'D', Mi: 'E', Fa: 'F', Sol: 'G', La: 'A', Si: 'B' };
  for (const [silaba, letra] of Object.entries(silabas)) if (limpio.startsWith(silaba)) return letra;
  return limpio.charAt(0).toUpperCase();
}

const listaNotas = (page: Page) => page.getByRole('list', { name: 'Notas de la escala' });
const nombresFichas = (page: Page) => listaNotas(page).locator('[class$="_chipNombre"]').allTextContents();
const gradosFichas = (page: Page) => listaNotas(page).locator('[class$="_chipGrado"]').allTextContents();
const nombresAcordes = (page: Page) =>
  page.getByRole('list', { name: 'Acordes diatónicos' }).locator('[class$="_acordeNombre"]').allTextContents();

test.describe('Inspector 15/11/2026 · caso 1 (normal): La menor natural y Do mayor', () => {
  test('La menor natural: A B C D E F G y sus acordes Am B° C Dm Em F G', async ({ page }) => {
    await elegirRaiz(page, 'A (La)');
    await elegirEscala(page, 'Menor natural');
    expect(await nombresFichas(page)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(await nombresAcordes(page)).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G']);
  });

  test('Do mayor: C D E F G A B y sus acordes C Dm Em F G Am B°', async ({ page }) => {
    await elegirRaiz(page, 'C (Do)');
    await elegirEscala(page, 'Mayor');
    expect(await nombresFichas(page)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(await nombresAcordes(page)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
  });
});

test.describe('Inspector 15/11/2026 · el sonido: frecuencias y silencio', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as VentanaEspia;
      w.__hz = [];
      w.__creados = 0;
      w.__escalasTerminados = 0;
      const original = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (this: AudioContext) {
        const osc = original.call(this);
        w.__creados++;
        osc.addEventListener('ended', () => {
          w.__escalasTerminados++;
        });
        const fijar = osc.frequency.setValueAtTime.bind(osc.frequency);
        osc.frequency.setValueAtTime = (valor: number, cuando: number) => {
          w.__hz.push(valor);
          return fijar(valor, cuando);
        };
        return osc;
      };
    });
    await page.reload();
    await esperarBotonesHidratados(page);
  });

  const hz = (page: Page) => page.evaluate(() => (window as VentanaEspia).__hz);
  const vivos = (page: Page) =>
    page.evaluate(() => (window as VentanaEspia).__creados - (window as VentanaEspia).__escalasTerminados);
  const creados = (page: Page) => page.evaluate(() => (window as VentanaEspia).__creados);
  const botonEscuchar = (page: Page) => page.getByRole('button', { name: /Escuchar la escala|Detener/ });

  async function escucharSubiendo(page: Page, raiz: string, escala: string): Promise<number[]> {
    await elegirRaiz(page, raiz);
    await elegirEscala(page, escala);
    await page.getByRole('button', { name: 'Subir', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Subir', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await botonEscuchar(page).click();
    await expect(botonEscuchar(page)).toHaveText(/Detener/);
    return hz(page);
  }

  function cuadra(obtenidas: number[], esperadas: number[]) {
    expect(obtenidas).toHaveLength(esperadas.length);
    esperadas.forEach((f, i) => expect(obtenidas[i]).toBeCloseTo(f, 2));
  }

  test('caso 1 · La menor natural subiendo: 440 … 880 Hz', async ({ page }) => {
    cuadra(await escucharSubiendo(page, 'A (La)', 'Menor natural'),
      [440, 493.88, 523.25, 587.33, 659.26, 698.46, 783.99, 880]);
  });

  test('caso 2 · Fa# mayor subiendo: 369,99 … 739,99 Hz (el VII, Mi#, es MIDI 77 = 698,46)', async ({ page }) => {
    cuadra(await escucharSubiendo(page, 'F# (Fa#)', 'Mayor'),
      [369.99, 415.3, 466.16, 493.88, 554.37, 622.25, 698.46, 739.99]);
  });

  test('caso 2 · Do# menor armónica subiendo: el VII (Si#) suena en 523,25 Hz', async ({ page }) => {
    cuadra(await escucharSubiendo(page, 'C# (Do#)', 'Menor armónica'),
      [277.18, 311.13, 329.63, 369.99, 415.3, 440, 523.25, 554.37]);
  });

  test('caso 3 · «Detener» deja todos los osciladores terminados', async ({ page }) => {
    await page.getByRole('button', { name: 'Lento', exact: true }).click();
    await botonEscuchar(page).click();
    await expect(botonEscuchar(page)).toHaveText(/Detener/);
    expect(await creados(page)).toBe(15); // subir y bajar: 15 notas programadas
    await botonEscuchar(page).click();
    await expect(botonEscuchar(page)).toHaveText(/Escuchar la escala/);
    await expect.poll(() => vivos(page)).toBe(0);
  });

  test('caso 3 · dos pulsaciones seguidas nunca dejan dos escalas superpuestas', async ({ page }) => {
    await page.getByRole('button', { name: 'Lento', exact: true }).click();
    await botonEscuchar(page).dblclick();
    await page.waitForTimeout(400); // a 60 notas/min ninguna nota acaba sola antes de 0,94 s
    const enMarcha = await vivos(page);
    // Una escala de ida y vuelta son 15 osciladores: 30 serían dos sonando a la vez
    expect(enMarcha).toBeLessThanOrEqual(15);
    const texto = await botonEscuchar(page).textContent();
    expect(enMarcha > 0).toBe(/Detener/.test(texto ?? ''));
  });

  test('caso 3 · cambiar la nota raíz mientras suena la calla del todo', async ({ page }) => {
    await page.getByRole('button', { name: 'Lento', exact: true }).click();
    await botonEscuchar(page).click();
    await expect(botonEscuchar(page)).toHaveText(/Detener/);
    await elegirRaiz(page, 'D (Re)');
    await expect(botonEscuchar(page)).toHaveText(/Escuchar la escala/);
    await expect.poll(() => vivos(page)).toBe(0);
    await expect(page.locator('[data-sonando="true"]')).toHaveCount(0);
  });
});

test.describe('Inspector 15/11/2026 · caso 2 (límite) en el mástil', () => {
  test('Mi frigio en guitarra estándar: 8 tónicas (las dos cuerdas de Mi, al aire y en el traste 12) y 40 normales', async ({ page }) => {
    await elegirRaiz(page, 'E (Mi)');
    await elegirEscala(page, 'Frigio');
    const { tonicas, normales } = await contarNotas(page);
    expect(tonicas).toBe(8);
    expect(normales).toBe(40);
    expect(await hayNotaEn(page, 0, 12)).toBe('tonica'); // 1ª cuerda, posición más alta
    expect(await hayNotaEn(page, 5, 12)).toBe('tonica');
    expect(await hayNotaEn(page, 0, 1)).toBe('normal'); // Fa, la 2ª menor del frigio
  });
});

/**
 * HALLAZGO (15/11/2026, ABIERTO) · el deletreo. Las alturas son correctas (lo prueban las
 * frecuencias de arriba), pero la app nombra todas las notas con sostenidos y rompe la regla de
 * una letra por nota: Fa mayor sale con La# en vez de Si♭, Fa# mayor con Fa en vez de Mi#, y
 * la tabla y el texto de la propia app (Blues «Mib», frigio «2ª bemol») la contradicen.
 */
test.describe('Inspector 15/11/2026 · HALLAZGO ABIERTO: deletreo enarmónico', () => {
  async function letrasDe(page: Page, raiz: string, escala: string) {
    await elegirRaiz(page, raiz);
    await elegirEscala(page, escala);
    return (await nombresFichas(page)).map(letraDe);
  }

  test('ABIERTO · Fa mayor lleva Si♭ (IV) y no La#; su acorde IV es Si♭', async ({ page }) => {
    test.fail();
    const letras = await letrasDe(page, 'F (Fa)', 'Mayor');
    expect(new Set(letras).size).toBe(7); // hoy: F G A A C D E — la A dos veces
    expect(letras[3]).toBe('B');
    expect(letraDe((await nombresAcordes(page))[3])).toBe('B'); // hoy: «A#»
  });

  test('ABIERTO · Fa# mayor lleva Mi# (VII) y no Fa', async ({ page }) => {
    test.fail();
    const letras = await letrasDe(page, 'F# (Fa#)', 'Mayor');
    expect(new Set(letras).size).toBe(7); // hoy: F# … F — la F dos veces
    expect(letras[6]).toBe('E');
  });

  test('ABIERTO · Do# menor armónica lleva Si# (VII) y no Do', async ({ page }) => {
    test.fail();
    const letras = await letrasDe(page, 'C# (Do#)', 'Menor armónica');
    expect(new Set(letras).size).toBe(7); // hoy: C# … C
    expect(letras[6]).toBe('B');
  });

  test('ABIERTO · el blues de La lleva Mi♭, como dice la tabla de la propia app, y no Re#', async ({ page }) => {
    test.fail();
    const letras = await letrasDe(page, 'A (La)', 'Blues');
    expect(letras[3]).toBe('E'); // hoy: D# (Re#)
  });

  test('ABIERTO · La frigio lleva Si♭ («la 2ª bemol») y no La#', async ({ page }) => {
    test.fail();
    const letras = await letrasDe(page, 'A (La)', 'Frigio');
    expect(new Set(letras).size).toBe(7);
    expect(letras[1]).toBe('B'); // hoy: A# (La#)
  });
});

/**
 * HALLAZGO (15/11/2026, ABIERTO) · los grados de la pentatónica. La FAQ de la app dice que la
 * pentatónica menor es «1, b3, 4, 5, b7»; las fichas la numeran por posición (I II III IV V), de
 * modo que el Sol de La pentatónica menor sale como «V» y el Mi, la quinta, como «IV».
 */
test('Inspector 15/11/2026 · ABIERTO · La pentatónica menor: el Do es una tercera y el Sol una séptima', async ({ page }) => {
  test.fail();
  await elegirRaiz(page, 'A (La)');
  await elegirEscala(page, 'Pentatónica menor');
  const grados = await gradosFichas(page);
  expect(grados[1]).toMatch(/(3|III)$/); // hoy: «II»
  expect(grados[3]).toMatch(/^(5|V)$/); // hoy: «IV»
  expect(grados[4]).toMatch(/(7|VII)$/); // hoy: «V»
});

/**
 * HALLAZGO (15/11/2026, ABIERTO) · la tabla «Comparativa de escalas principales». Su columna
 * «Patrón» (1 = semitono, 2 = tono, según la nota al pie) no da el patrón de NINGUNA de las seis
 * filas: la mayor sale 1-2-2-1-2-2-2 (S-T-T-S-T-T-T, que es el locrio) mientras la FAQ de la
 * misma sección dice tono-tono-semitono-tono-tono-tono-semitono. Y la columna «Ejemplo en Do»
 * pone cuatro ejemplos en La o en Re.
 * Esperados, de la fórmula en semitonos de cada escala (diferencias sucesivas, cerrando en 12).
 */
test('Inspector 15/11/2026 · REPARADO · la tabla comparativa da el patrón de tonos y semitonos de cada escala', async ({ page }) => {
  // Reparado el 15/11/2026 (hallazgo 4807): el patrón sale de los intervalos de la propia escala
  // y los ejemplos empiezan en Do.
  const esperados: Record<string, string> = {
    Mayor: '2-2-1-2-2-2-1',
    'Menor natural': '2-1-2-2-1-2-2',
    'Menor armónica': '2-1-2-2-1-3-1',
    'Pentatónica mayor': '2-2-3-2-3',
    Blues: '3-2-1-1-3-2',
    Dórico: '2-1-2-2-2-1-2',
  };
  const filas = await page.locator('table tbody tr').evaluateAll((trs) =>
    trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').trim())),
  );
  const cabecera = (await page.locator('table thead th').allTextContents()).map((t) => t.trim());
  expect(filas.length).toBe(6);
  for (const [escala, patron, , ejemplo] of filas) {
    const normalizado = patron.replace(/\s/g, '').replace(/T/g, '2').replace(/S/g, '1');
    expect(normalizado, `patrón de ${escala}`).toBe(esperados[escala]);
    if (cabecera[3] === 'Ejemplo en Do') expect(ejemplo, `ejemplo de ${escala}`).toMatch(/^Do-/);
  }
});

/**
 * HALLAZGO (15/11/2026, ABIERTO) · el consejo dice que el dórico «tiene los mismos acordes base»
 * que la menor; la propia app muestra que La dórico y La menor natural difieren en tres de siete.
 */
test('Inspector 15/11/2026 · La dórico y La menor natural difieren en tres acordes (ii, IV y vi)', async ({ page }) => {
  await elegirRaiz(page, 'A (La)');
  await elegirEscala(page, 'Dórico');
  const dorico = await nombresAcordes(page);
  await elegirEscala(page, 'Menor natural');
  const menor = await nombresAcordes(page);
  // Lo que pinta la app es correcto: Bm/B°, D/Dm y F#°/F
  expect(dorico).toEqual(['Am', 'Bm', 'C', 'D', 'Em', 'F#°', 'G']);
  expect(dorico.filter((a, i) => a !== menor[i])).toHaveLength(3);
});

test('Inspector 15/11/2026 · REPARADO · el consejo del dórico no dice que tiene «los mismos acordes base» que la menor', async ({ page }) => {
  // Reparado el 15/11/2026 (hallazgo 4811): el consejo dice ahora que cambian ii, IV y vi.
  await expect(page.locator('[data-guia-educativa] li', { hasText: 'mismos acordes base' })).toHaveCount(0);
  await expect(page.locator('[data-guia-educativa] li', { hasText: 'cambian tres de siete' })).toHaveCount(1);
});

test.describe('Inspector 15/11/2026 · accesibilidad de los selectores (cabos C0496 y C0497)', () => {
  test('C0496 (ya reparado en eba00f2da) · el grupo de tipos de escala se llama «Tipo de escala»', async ({ page }) => {
    const grupo = page.getByRole('group', { name: 'Tipo de escala', exact: true });
    await expect(grupo).toBeVisible();
    await expect(grupo.getByRole('button')).toHaveCount(12);
  });

  test('C0497 · ABIERTO · la etiqueta «Nota raíz» rotula algo (hoy apunta a un id que no existe)', async ({ page }) => {
    test.fail();
    const huerfanas = await page.locator('main label').evaluateAll((labels) =>
      (labels as HTMLLabelElement[])
        .filter((l) => !l.control && !(l.id && document.querySelector(`[aria-labelledby~="${l.id}"]`)))
        .map((l) => `${(l.textContent ?? '').trim()} → for="${l.htmlFor}"`),
    );
    expect(huerfanas).toEqual([]); // hoy: ['Nota raíz → for="nota-raiz"']
  });

  test('ABIERTO · la lista estática «Errores frecuentes» no es una región de alerta', async ({ page }) => {
    test.fail();
    await expect(page.locator('[role="alert"]', { hasText: 'Errores frecuentes al estudiar escalas' })).toHaveCount(0);
  });
});

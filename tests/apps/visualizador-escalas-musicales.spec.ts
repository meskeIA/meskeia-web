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

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Escalas Musicales');
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

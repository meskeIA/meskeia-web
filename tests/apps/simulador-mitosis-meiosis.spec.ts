import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-mitosis-meiosis (segmento interactiva, riesgo 3, 189 usos reales)
 *
 * Primera inspección: 26/08/2026. La app promete en su <h1> «Simulador de Mitosis y Meiosis»
 * y en su metadata «simulador visual animado de mitosis (6 fases) y meiosis (8 fases) […] con
 * cromosomas, huso acromático y crossing-over». Su propia guía educativa remata la promesa:
 * «Contar el número y agrupación de cromosomas es la clave» para distinguir una fase de otra.
 * O sea: SÍ tiene verdad comprobable, y es doble — la biología (cuántos cromosomas hay en cada
 * fase y de qué par) y el motor (que avanzar/retroceder no salte etapas).
 *
 * DÓNDE VIVE LA VERDAD
 *   app/simulador-mitosis-meiosis/page.tsx
 *     FASES_MITOSIS / FASES_MEIOSIS  ← nombre, descripción, nº de células y `estadoCromosomasId`
 *     dibujarCelula()                ← CUÁNTOS cromosomas pinta en cada estado (0..4)
 *     COLORES_CROMOSOMAS             ← «Colores de los 2 pares de cromosomas»: naranja #E07A1F
 *                                       = par 1, teal #48A9A6 = par 2. El color ES la identidad
 *                                       del par de homólogos, y por eso se puede auditar.
 *
 * EL MODELO QUE LA PROPIA APP DECLARA (interfase de meiosis):
 *   «La célula es diploide (2n=4 en nuestro modelo con 2 pares de homólogos)»
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (biología canónica para 2n=4: 2 pares de homólogos, 4 cromosomas, 8 cromátidas tras la fase S)
 *
 *   CASO 1 (mitosis, la cuenta fase a fase)
 *       Interfase   4 cromosomas / 8 cromátidas (replicados, aún cromatina difusa)
 *       Profase     4 cromosomas visibles, 8 cromátidas → 2 naranjas + 2 teal
 *       Metafase    4 cromosomas en la placa, 8 cromátidas → 2 naranjas + 2 teal
 *       Anafase     se separan CROMÁTIDAS HERMANAS → 8 cromosomas, **4 por polo** (2+2 colores)
 *       Telofase    **4 cromosomas por polo** (2n=4 en cada núcleo hijo)
 *       Citocinesis 2 células 2n=4 idénticas
 *     El punto crítico: en mitosis el número por polo en anafase/telofase es EL MISMO que en
 *     metafase (4), no la mitad. Si cae a 2, la app está pintando la mitosis como reduccional.
 *
 *   CASO 2 (meiosis, reduccional I + ecuacional II)
 *       Profase I    2 bivalentes (tétradas) = 4 cromosomas / 8 cromátidas + crossing-over.
 *                    El bivalente aparea HOMÓLOGOS: naranja con naranja, teal con teal.
 *       Metafase I   2 bivalentes en la placa → la imagen NO puede ser igual a la metafase
 *                    mitótica (la propia app: «en metafase I ves bivalentes, en metafase de
 *                    mitosis cada cromosoma está aislado en la placa»)
 *       Anafase I    se separan HOMÓLOGOS → **2 cromosomas por polo**, con 2 cromátidas cada uno
 *       Telofase I   2 células, **n=2 cada una en UN solo núcleo** (4 cromosomas en total)
 *       Profase II   existe: la envoltura formada en telofase I vuelve a desaparecer
 *       Metafase II  2 cromosomas por célula y **uno de cada par**: 1 naranja + 1 teal
 *       Anafase II   se separan cromátidas hermanas → **2 cromosomas por polo** en cada célula
 *       Telofase II  4 células n=2 genéticamente distintas
 *
 *   CASO 3 (límite y operativa) — primera y última fase, secuencia sin saltos, cambio de modo
 *       a mitad de simulación y rebobinado del reproductor automático.
 *
 * CÓMO SE MIDE UN CANVAS
 *   `contarCromosomas()` lee los píxeles del canvas y cuenta los CUERPOS cromosómicos de una
 *   región agrupando columnas contiguas. Discriminar el teal del cromosoma (#48A9A6) del azul
 *   de la membrana (#2E86AB) exige mirar g-b: el teal lo tiene entre -3 y +3 sea cual sea su
 *   alfa, y el azul siempre <= -3-34·alfa. Con |g-b| <= 8 la membrana punteada no cuela.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y
 * hoy fallan a propósito. El día que se reparen se ponen en verde: quitar entonces la línea
 * `test.fail()` y quedan como regresión.
 */

const RUTA = '/simulador-mitosis-meiosis/';

interface MedidaCanvas {
  /** cuerpos cromosómicos distintos encontrados en la región */
  n: number;
  /** color dominante de cada cuerpo, de izquierda a derecha */
  colores: string[];
  /** píxeles rosa #D63384 (marcas de crossing-over) de la región */
  rosa: number;
}

/**
 * Cuenta cromosomas dibujados en una región del canvas, expresada en fracciones (0..1)
 * del ancho y del alto, para que la medida no dependa de devicePixelRatio.
 */
async function contarCromosomas(
  page: Page,
  region: { x0: number; x1: number; y0: number; y1: number }
): Promise<MedidaCanvas> {
  return page.evaluate((r) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const W = canvas.width;
    const H = canvas.height;
    const px0 = Math.floor(r.x0 * W);
    const px1 = Math.ceil(r.x1 * W);
    const py0 = Math.floor(r.y0 * H);
    const py1 = Math.ceil(r.y1 * H);
    const ancho = px1 - px0;
    const alto = py1 - py0;
    const datos = ctx.getImageData(px0, py0, ancho, alto).data;
    const columnas: (string | null)[] = new Array(ancho).fill(null);
    let rosa = 0;

    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        const i = (y * ancho + x) * 4;
        const rojo = datos[i];
        const verde = datos[i + 1];
        const azul = datos[i + 2];
        // naranja #E07A1F (par 1), incluida su cromátida al 75 % de alfa
        const esNaranja = rojo > 150 && rojo - verde > 50 && verde - azul > 30 && azul < 120;
        // teal #48A9A6 (par 2); |g-b| <= 8 excluye el azul de membrana #2E86AB a cualquier alfa
        const esTeal = verde > 120 && verde - rojo > 50 && Math.abs(verde - azul) <= 8;
        // rosa #D63384 (crossing-over)
        if (rojo > 150 && rojo - verde > 90 && azul - verde > 40) rosa++;
        if (esNaranja) columnas[x] = 'naranja';
        else if (esTeal && !columnas[x]) columnas[x] = 'teal';
      }
    }

    // Un cuerpo cromosómico mide ~10 px de ancho y el más cercano queda a >= 25 px:
    // un hueco de 8 px (a 480 px de canvas) separa cuerpos sin partir ninguno.
    const hueco = Math.max(6, Math.round(W * 0.017));
    const cuerpos: string[] = [];
    let ultima = -999;
    for (let x = 0; x < ancho; x++) {
      const c = columnas[x];
      if (!c) continue;
      if (x - ultima > hueco) cuerpos.push(c);
      ultima = x;
    }
    return { n: cuerpos.length, colores: cuerpos, rosa };
  }, region);
}

/** Nombre de la fase que la app declara en su bloque de descripción (aria-live). */
const faseDeclarada = (page: Page) =>
  page.locator('[role="region"][aria-live="polite"] strong').first();

/** Rótulo de resultado (2n / n y número de células). */
const badgeResultado = (page: Page) =>
  page.locator('[aria-live="polite"][aria-atomic="true"]').last();

async function irAFase(page: Page, nombre: string): Promise<void> {
  await page.getByRole('tab', { name: nombre, exact: true }).click();
  await expect(faseDeclarada(page)).toHaveText(nombre);
}

async function elegirModo(page: Page, modo: 'Mitosis' | 'Meiosis'): Promise<void> {
  await page.getByRole('button', { name: modo, exact: true }).click();
  await expect(page.getByRole('button', { name: modo, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator('canvas')).toBeVisible();
  await expect(faseDeclarada(page)).toHaveText('Interfase');
});

// ============================================================================
// CASO 1 — MITOSIS: la cuenta de cromosomas fase a fase (modelo 2n=4)
// ============================================================================
test('CASO 1 · mitosis: 6 fases en orden y 4 cromosomas (2 de cada par) en la placa ecuatorial', async ({
  page,
}) => {
  // Las 6 fases que la metadata promete («mitosis (6 fases)»), en el orden canónico IPMAT + C
  await expect(page.getByRole('tab')).toHaveText([
    'Interfase',
    'Profase',
    'Metafase',
    'Anafase',
    'Telofase',
    'Citocinesis',
  ]);

  // METAFASE: 4 cromosomas alineados, dos de cada par de homólogos.
  // Sale del modelo 2n=4 que declara la propia app: 2 pares × 2 homólogos = 4 cromosomas,
  // cada uno con 2 cromátidas hermanas (8 cromátidas en total).
  await irAFase(page, 'Metafase');
  const metafase = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0, y1: 1 });
  expect(metafase.n).toBe(4);
  expect(metafase.colores).toEqual(['naranja', 'naranja', 'teal', 'teal']);

  // En mitosis no hay crossing-over en ninguna fase (lo dice el propio recuadro de errores
  // frecuentes: «no ocurre en la mitosis»). 0 píxeles rosa.
  expect(metafase.rosa).toBe(0);

  // CITOCINESIS: el resultado de la mitosis es 2 células diploides idénticas.
  await irAFase(page, 'Citocinesis');
  await expect(badgeResultado(page)).toContainText('Resultado: 2 células (2n=4)');
});

// ============================================================================
// CASO 2 — MEIOSIS: reduccional (I) y ecuacional (II)
// ============================================================================
test('CASO 2 · meiosis: crossing-over solo en Profase I, 2 cromosomas por polo en Anafase I y 4 células al final', async ({
  page,
}) => {
  await elegirModo(page, 'Meiosis');

  // Las 8 fases que la metadata promete («meiosis (8 fases)»)
  await expect(page.getByRole('tab')).toHaveText([
    'Interfase',
    'Profase I',
    'Metafase I',
    'Anafase I',
    'Telofase I / Citocinesis I',
    'Metafase II',
    'Anafase II',
    'Telofase II / Citocinesis II',
  ]);

  // CROSSING-OVER: es EXCLUSIVO de la profase I (lo afirma la propia app: «no ocurre en la
  // mitosis ni en ninguna otra fase de la meiosis»). Se mide por los píxeles rosa #D63384.
  await irAFase(page, 'Profase I');
  const profaseI = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0, y1: 1 });
  expect(profaseI.rosa).toBeGreaterThan(0);

  for (const fase of ['Interfase', 'Metafase I', 'Anafase I', 'Metafase II']) {
    await irAFase(page, fase);
    const medida = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0, y1: 1 });
    expect(medida.rosa, `no debe haber crossing-over en ${fase}`).toBe(0);
  }

  // ANAFASE I es REDUCCIONAL: se separan los homólogos, no las cromátidas hermanas.
  // Con 2n=4 cada polo recibe n=2 cromosomas, y uno es de cada par → 1 naranja + 1 teal.
  await irAFase(page, 'Anafase I');
  const anafaseISuperior = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0, y1: 0.5 });
  expect(anafaseISuperior.n).toBe(2);
  expect(anafaseISuperior.colores).toEqual(['naranja', 'teal']);
  const anafaseIInferior = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0.5, y1: 1 });
  expect(anafaseIInferior.n).toBe(2);

  // Rótulos de ploidía: tras la citocinesis I hay 2 células haploides; al final, 4.
  await irAFase(page, 'Telofase I / Citocinesis I');
  await expect(badgeResultado(page)).toContainText('2 células (n=2)');
  await irAFase(page, 'Telofase II / Citocinesis II');
  await expect(badgeResultado(page)).toContainText('Resultado: 4 células (n=2)');
});

// ============================================================================
// CASO 3 — LÍMITE Y OPERATIVA del motor de fases
// ============================================================================
test('CASO 3 · operativa: extremos deshabilitados, secuencia sin saltos, cambio de modo y rebobinado', async ({
  page,
}) => {
  const anterior = page.getByRole('button', { name: 'Fase anterior' });
  const siguiente = page.getByRole('button', { name: 'Fase siguiente' });

  // PRIMERA FASE: no se puede retroceder más allá de la interfase
  await expect(anterior).toBeDisabled();
  await expect(siguiente).toBeEnabled();

  // La secuencia avanza de una en una y NO se salta ninguna etapa
  const esperadas = ['Profase', 'Metafase', 'Anafase', 'Telofase', 'Citocinesis'];
  for (const nombre of esperadas) {
    await siguiente.click();
    await expect(faseDeclarada(page)).toHaveText(nombre);
  }

  // ÚLTIMA FASE: no se puede avanzar más
  await expect(siguiente).toBeDisabled();
  await expect(anterior).toBeEnabled();

  // Retroceder devuelve exactamente una fase
  await anterior.click();
  await expect(faseDeclarada(page)).toHaveText('Telofase');

  // CAMBIO DE MODO A MITAD DE SIMULACIÓN: meiosis en su fase 7 → mitosis debe reiniciar en
  // Interfase y quedarse con 6 fases (si conservara el índice, apuntaría fuera del array).
  await elegirModo(page, 'Meiosis');
  await irAFase(page, 'Anafase II');
  await elegirModo(page, 'Mitosis');
  await expect(faseDeclarada(page)).toHaveText('Interfase');
  await expect(page.getByRole('tab')).toHaveCount(6);
  await expect(anterior).toBeDisabled();

  // REPRODUCCIÓN AUTOMÁTICA desde la última fase: rebobina a la interfase, recorre las 6
  // fases y se detiene sola al final (aria-pressed vuelve a false).
  await irAFase(page, 'Citocinesis');
  await page.getByRole('button', { name: 'Rápida' }).click();
  const auto = page.getByRole('button', { name: /reproducción automática/ });
  await auto.click();
  await expect(faseDeclarada(page)).toHaveText('Interfase');
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  // 5 saltos × 800 ms = 4 s hasta el final; se espera por el texto, no por un reloj fijo
  await expect(faseDeclarada(page)).toHaveText('Citocinesis', { timeout: 20000 });
  await expect(auto).toHaveAttribute('aria-pressed', 'false');
});

// ============================================================================
// HALLAZGOS ABIERTOS (26/08/2026) — afirman la biología correcta y hoy fallan
// ============================================================================

test.describe('hallazgos abiertos', () => {
  test('HALLAZGO 1 · mitosis, Anafase: cada polo debe recibir 4 cromosomas, no 2', async ({
    page,
  }) => {
    test.fail();
    // En la anafase mitótica se separan las CROMÁTIDAS HERMANAS: los 4 cromosomas replicados
    // dan 8 cromosomas, 4 por polo (2 naranjas + 2 teal). La propia descripción de la fase lo
    // dice: «Cada polo recibe un conjunto completo de cromosomas (2n)».
    // Hoy dibuja 2 por polo (1 naranja + 1 teal), que es el reparto de la ANAFASE I meiótica.
    await irAFase(page, 'Anafase');
    const superior = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0, y1: 0.5 });
    expect(superior.n).toBe(4);
  });

  test('HALLAZGO 1b · mitosis, Telofase: cada núcleo hijo debe tener 4 cromosomas (2n=4)', async ({
    page,
  }) => {
    test.fail();
    // Las células hijas de una mitosis son 2n=4, como confirma el propio rótulo final
    // «Resultado: 2 células (2n=4)». Hoy cada polo muestra 2 cromosomas, o sea n=2: la app
    // pinta la mitosis como si redujera la ploidía.
    await irAFase(page, 'Telofase');
    const superior = await contarCromosomas(page, { x0: 0, x1: 1, y0: 0, y1: 0.5 });
    expect(superior.n).toBe(4);
  });

  test('HALLAZGO 2 · Anafase de mitosis y Anafase I de meiosis no pueden ser la misma imagen', async ({
    page,
  }) => {
    test.fail();
    // Es la diferencia que la propia app declara clave en «Errores frecuentes en exámenes»:
    // «anafase de mitosis = cromátidas hermanas; anafase I = cromosomas homólogos completos».
    // Hoy los dos canvas son idénticos byte a byte.
    await irAFase(page, 'Anafase');
    const anafaseMitosis = await page.evaluate(() =>
      (document.querySelector('canvas') as HTMLCanvasElement).toDataURL()
    );
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Anafase I');
    const anafaseI = await page.evaluate(() =>
      (document.querySelector('canvas') as HTMLCanvasElement).toDataURL()
    );
    expect(anafaseI).not.toBe(anafaseMitosis);
  });

  test('HALLAZGO 2b · Metafase I debe mostrar bivalentes, no la misma placa que la mitosis', async ({
    page,
  }) => {
    test.fail();
    // La guía «Cómo identificar una fase en el microscopio» de la propia app dice: «En metafase I
    // de meiosis ves bivalentes (pares de cromosomas homólogos), mientras que en metafase de
    // mitosis cada cromosoma está aislado en la placa». Hoy las dos imágenes son idénticas.
    await irAFase(page, 'Metafase');
    const metafaseMitosis = await page.evaluate(() =>
      (document.querySelector('canvas') as HTMLCanvasElement).toDataURL()
    );
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Metafase I');
    const metafaseI = await page.evaluate(() =>
      (document.querySelector('canvas') as HTMLCanvasElement).toDataURL()
    );
    expect(metafaseI).not.toBe(metafaseMitosis);
  });

  test('HALLAZGO 3 · Telofase I: cada célula hija debe tener n=2 cromosomas en un solo núcleo', async ({
    page,
  }) => {
    test.fail();
    // Tras la citocinesis I hay 2 células haploides con n=2 cada una: 2 cromosomas por célula,
    // agrupados en UN núcleo. Lo dice la descripción de la fase («Se forman dos células
    // haploides (n=2)») y el rótulo «Intermedio: 2 células (n=2)».
    // Hoy cada célula muestra 2 cromosomas en el polo superior y otros 2 en el inferior (4 en
    // total, con dos envolturas nucleares punteadas): el doble de material genético.
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Telofase I / Citocinesis I');
    const celulaIzquierdaArriba = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0, y1: 0.5 });
    const celulaIzquierdaAbajo = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0.5, y1: 1 });
    expect(celulaIzquierdaArriba.n + celulaIzquierdaAbajo.n).toBe(2);
  });

  test('HALLAZGO 4 · la meiosis debe incluir la Profase II entre la Telofase I y la Metafase II', async ({
    page,
  }) => {
    test.fail();
    // La secuencia canónica de la meiosis II es Profase II → Metafase II → Anafase II →
    // Telofase II. La app salta de «Telofase I / Citocinesis I» a «Metafase II»: la envoltura
    // nuclear que acaba de formarse desaparece sin fase que lo explique. La palabra «Profase II»
    // no aparece en ninguna parte de la app, ni en el simulador ni en el bloque educativo.
    await elegirModo(page, 'Meiosis');
    await expect(page.getByRole('tab', { name: 'Profase II', exact: true })).toHaveCount(1);
  });

  test('HALLAZGO 5 · Metafase II: los 2 cromosomas de cada célula deben ser uno de cada par', async ({
    page,
  }) => {
    test.fail();
    // Una célula haploide de este modelo (n=2) lleva UN cromosoma de cada par de homólogos:
    // 1 naranja (par 1) + 1 teal (par 2). Que los dos sean del mismo par sería una no
    // disyunción. Hoy la app pinta los dos naranjas y el par teal desaparece de la meiosis II.
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Metafase II');
    const celulaIzquierda = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0, y1: 1 });
    expect(celulaIzquierda.n).toBe(2);
    expect(celulaIzquierda.colores).toEqual(['naranja', 'teal']);
  });

  test('HALLAZGO 6 · Anafase II: cada polo debe recibir 2 cromosomas, no 1', async ({ page }) => {
    test.fail();
    // Cada célula llega a la meiosis II con n=2 cromosomas de 2 cromátidas. Al separarse las
    // cromátidas hermanas, cada polo recibe 2 cromosomas, y así las 4 células finales son n=2
    // como anuncia el rótulo «Resultado: 4 células (n=2)». Hoy dibuja 1 por polo, o sea n=1.
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Anafase II');
    const arribaIzquierda = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0, y1: 0.5 });
    expect(arribaIzquierda.n).toBe(2);
  });

  test('HALLAZGO 7 · los botones de velocidad deben llevar aria-pressed', async ({ page }) => {
    test.fail();
    // Regla 2 del CLAUDE.md global §5: todo botón que cambie un estado visual lleva
    // aria-pressed. Los tres botones de velocidad marcan el activo solo por clase CSS
    // (velocidadBtnActiva), así que un lector de pantalla no sabe cuál está seleccionado.
    // Es también lo que avisa `npm run check:a11y-jsx` en la línea 792 de page.tsx.
    await page.getByRole('button', { name: 'Lenta' }).click();
    await expect(page.getByRole('button', { name: 'Lenta' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

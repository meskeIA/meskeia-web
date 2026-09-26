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
 * HALLAZGOS del 26/08/2026, REPARADOS ese mismo día: al final. Afirmaban lo que debía pasar y
 * hoy fallan a propósito. El día que se reparen se ponen en verde: quitar entonces la línea
 * la reparación los puso en verde, así que se les retiró el `test.fail()` y quedan como
 * regresión: son el contrato de que ninguno de los siete vuelve.
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

  // Nueve fases desde la reparación del hallazgo 4: faltaba la Profase II, y sin ella la
  // envoltura nuclear que la telofase I acaba de formar desaparecía sin etapa que lo
  // explicara y el huso se rehacía sin fase propia.
  await expect(page.getByRole('tab')).toHaveText([
    'Interfase',
    'Profase I',
    'Metafase I',
    'Anafase I',
    'Telofase I / Citocinesis I',
    'Profase II',
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

test.describe('regresión — hallazgos reparados el 26/08/2026', () => {
  test('HALLAZGO 1 · mitosis, Anafase: cada polo debe recibir 4 cromosomas, no 2', async ({
    page,
  }) => {
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
    // Tras la citocinesis I hay 2 células haploides con n=2 cada una: 2 cromosomas por célula,
    // agrupados en UN núcleo. Lo dice la descripción de la fase («Se forman dos células
    // haploides (n=2)») y el rótulo «Intermedio: 2 células (n=2)».
    // Antes cada célula mostraba 2 cromosomas en el polo superior y otros 2 en el inferior
    // (4 en total, con dos envolturas nucleares punteadas): el doble de material genético,
    // justo en la fase que explica la reducción.
    //
    // La región se mide sobre la célula ENTERA, no sumando su mitad de arriba y su mitad de
    // abajo: ahora los cromosomas están agrupados en UN núcleo centrado, así que cruzan la
    // línea media y sumar los dos cuadrantes los contaría dos veces. Ese reparto en dos
    // grupos polares era precisamente el defecto.
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Telofase I / Citocinesis I');
    const celulaIzquierda = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0, y1: 1 });
    expect(celulaIzquierda.n).toBe(2);
    // Y son uno de cada par, no dos copias del mismo: eso es ser haploide.
    expect(new Set(celulaIzquierda.colores).size).toBe(2);
  });

  test('HALLAZGO 4 · la meiosis debe incluir la Profase II entre la Telofase I y la Metafase II', async ({
    page,
  }) => {
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
    // Cada célula llega a la meiosis II con n=2 cromosomas de 2 cromátidas. Al separarse las
    // cromátidas hermanas, cada polo recibe 2 cromosomas, y así las 4 células finales son n=2
    // como anuncia el rótulo «Resultado: 4 células (n=2)». Hoy dibuja 1 por polo, o sea n=1.
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Anafase II');
    const arribaIzquierda = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0, y1: 0.5 });
    expect(arribaIzquierda.n).toBe(2);
  });

  test('HALLAZGO 7 · los botones de velocidad deben llevar aria-pressed', async ({ page }) => {
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

// ═══════════════════════════════════════════════════════════════════════════════
// CASOS DE AULA · 21/09/2026
// ═══════════════════════════════════════════════════════════════════════════════

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  generarEjercicioAleatorio,
} from '../../app/simulador-mitosis-meiosis/casos';
import {
  DOS_N_MODELO,
  FASES_MITOSIS,
  FASES_MEIOSIS,
  escalarFase,
  cromatidasPorCromosoma,
  cromosomasEnLaCelula,
  cromosomasPorPolo,
  cromosomasPorPoloConNoDisyuncion,
  gametosDistintosPorReparto,
  recuentoTotal,
} from '../../app/simulador-mitosis-meiosis/motor';

/**
 * Casos de aula — las siete invariantes de la sistemática `/casos-aula-meskeia`.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO DE ESTE BLOQUE
 * Todos están calculados a mano desde la definición de la división celular, NUNCA copiados
 * de lo que devuelve la app. El razonamiento, para que cualquiera pueda rehacerlo:
 *
 *   · Un cromosoma con dos cromátidas hermanas sigue siendo UN cromosoma: lo que se cuenta
 *     son centrómeros. De ahí que la placa de una mitosis con 2n=8 tenga 8 cromosomas y 16
 *     cromátidas, y que las dos cifras sean igual de correctas para el mismo dibujo.
 *   · Al separarse HOMÓLOGOS (anafase I) cada polo recibe la MITAD: es la división
 *     reduccional, la única que baja de 2n a n. Con 2n=8 → 4 por polo.
 *   · Al separarse CROMÁTIDAS HERMANAS (anafase de mitosis y anafase II) cada cromosoma se
 *     parte en dos, así que cada polo recibe TANTOS COMO HABÍA y el recuento NO baja. Con
 *     2n=8 → 8 por polo, que es justo lo que distingue la mitosis de la meiosis I.
 *   · Gametos distintos solo por reparto al azar de n pares = 2^n, sin crossing-over.
 *
 * La pareja de casos 1/2 y la pareja 3/4 son las que fijan el convenio de la app: mismo 2n y
 * mismo dibujo, dos números legítimos distintos. Si alguien las cambia sin querer, el test
 * cae aquí y no en producción.
 */

/** Los enunciados sirven a un público mayoritariamente mexicano y colombiano: nada de anclar
 *  un caso a un país concreto. No se listan ciudades cuyo nombre sea además un término de
 *  biología, porque aquí no las hay y un falso positivo obligaría a relajar la regla. */
const PAISES_Y_CIUDADES =
  /\b(España|Espa(ñ|n)ol|M(é|e)xico|Mexicano|Colombia|Argentina|Chile|Per(ú|u)|Venezuela|Uruguay|Ecuador|Bolivia|Paraguay|Guatemala|Cuba|Madrid|Barcelona|Sevilla|Bogot(á|a)|Buenos Aires|Santiago|Lima|Caracas|Montevideo|Quito|La Habana|Par(í|i)s|Londres|Nueva York|Estados Unidos|Francia|Italia|Roma|Alemania|Berl(í|i)n|Portugal|Lisboa)\b/i;

test.describe('Simulador de Mitosis y Meiosis · casos para clase', () => {
  test('1 · hay exactamente 12 casos, con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS).toHaveLength(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    // Es lo único que hace que «resuelve los casos 3, 7 y 11» funcione como consigna.
    const primera = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(primera);

    for (const caso of CASOS) {
      expect(resolverCaso(caso.datos).valor).toBe(resolverCaso(caso.datos).valor);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', () => {
    // Caza a quien edita un enunciado y se olvida de la solución.
    for (const caso of CASOS) {
      const recalculada = resolverCaso(caso.datos);
      expect(recalculada.ok, `caso ${caso.id} no resuelve`).toBe(true);
      expect(recalculada.valor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso trae enunciado, etiqueta, respuesta finita y desarrollo', () => {
    for (const caso of CASOS) {
      expect(caso.titulo.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.enunciado.trim().length, `caso ${caso.id}`).toBeGreaterThan(20);
      expect(caso.etiquetaRespuesta.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pista.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      // Todo recuento celular es un entero positivo: no hay medios cromosomas.
      expect(Number.isInteger(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.respuesta, `caso ${caso.id}`).toBeGreaterThan(0);
    }
  });

  test('5 · ningún enunciado nombra un país ni una ciudad', () => {
    for (const caso of CASOS) {
      expect(PAISES_Y_CIUDADES.test(caso.titulo), `título del caso ${caso.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES.test(caso.enunciado), `enunciado del caso ${caso.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES.test(caso.pista), `pista del caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', () => {
    // REPRODUCIBLE NO ES VARIADO, y la prueba obvia solo mira lo primero: en
    // simulador-genetica un xorshift32 sembrado con enteros pequeños devolvía el MISMO
    // ejercicio con todas las semillas y aun así pasaba la comprobación de reproducibilidad.
    for (const semilla of [1, 7, 42, 12345, 999999]) {
      const a = generarEjercicioAleatorio(semilla);
      const b = generarEjercicioAleatorio(semilla);
      expect(b.enunciado, `semilla ${semilla}`).toBe(a.enunciado);
      expect(b.respuesta, `semilla ${semilla}`).toBe(a.respuesta);
    }

    const respuestas = new Set<number>();
    const enunciados = new Set<string>();
    for (let semilla = 1; semilla <= 40; semilla++) {
      const ejercicio = generarEjercicioAleatorio(semilla);
      respuestas.add(ejercicio.respuesta);
      enunciados.add(ejercicio.enunciado);
      // La misma aritmética que los fijos: si divergieran, el alumno entrenaría con una
      // regla y sería corregido con otra.
      expect(resolverCaso(ejercicio.datos).valor, `semilla ${semilla}`).toBe(ejercicio.respuesta);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(enunciados.size).toBeGreaterThanOrEqual(10);
  });

  test('7 · el convenio cromosoma/cromátida queda fijado con casos a mano', () => {
    // ── La pareja 1/2: mismo dibujo, dos cifras legítimas distintas ──────────────────
    // Metafase de mitosis con 2n=8. En la placa hay 8 cromosomas (8 centrómeros), y como
    // cada uno está duplicado, 16 cromátidas.
    const enPlaca = { division: 'mitosis' as const, faseId: 'metafase', dosN: 8 };
    expect(resolverCaso({ ...enPlaca, magnitud: 'cromosomas-en-celula' }).valor).toBe(8);
    expect(resolverCaso({ ...enPlaca, magnitud: 'cromatidas-en-celula' }).valor).toBe(16);

    // ── La pareja 3/4: lo que distingue la mitosis de la meiosis I ──────────────────
    // Se separan HERMANAS → el recuento NO baja: 8 por polo.
    expect(
      resolverCaso({
        division: 'mitosis',
        faseId: 'anafase',
        dosN: 8,
        magnitud: 'cromosomas-por-polo',
      }).valor
    ).toBe(8);
    // Se separan HOMÓLOGOS → división reduccional, la MITAD: 4 por polo.
    expect(
      resolverCaso({
        division: 'meiosis',
        faseId: 'anafase-i',
        dosN: 8,
        magnitud: 'cromosomas-por-polo',
      }).valor
    ).toBe(4);
    // Y en esa misma anafase I los cromosomas SIGUEN duplicados: 4 × 2 = 8 cromátidas.
    expect(
      resolverCaso({
        division: 'meiosis',
        faseId: 'anafase-i',
        dosN: 8,
        magnitud: 'cromatidas-por-polo',
      }).valor
    ).toBe(8);
  });

  test('7.bis · el motor sostiene el convenio, no solo los doce casos', () => {
    // «Por polo» ≠ «en la célula»: durante la anafase la célula aún no se ha partido, así
    // que contiene los dos polos. La identidad debe cumplirse en TODAS las fases.
    for (const fases of [FASES_MITOSIS, FASES_MEIOSIS]) {
      for (const fase of fases) {
        expect(recuentoTotal(fase), `fase ${fase.id}`).toBe(
          fase.celulas * cromosomasEnLaCelula(fase)
        );
      }
    }

    // Escalar el organismo modelo (2n=4) es proporcional y rechaza lo que daría un recuento
    // fraccionario: media cromátida no existe.
    expect(DOS_N_MODELO).toBe(4);
    const metafaseII = FASES_MEIOSIS.find((f) => f.id === 'metafase-ii')!;
    expect(escalarFase(metafaseII, 12)?.cromosomasPorCelula).toBe(6); // n = 2n/2
    expect(escalarFase(metafaseII, 46)?.cromosomasPorCelula).toBe(23);
    expect(escalarFase(metafaseII, 7)).toBeNull(); // impar: no hay 2n impar
    expect(escalarFase(metafaseII, 0)).toBeNull();
    expect(escalarFase(metafaseII, -4)).toBeNull();

    // La interfase abarca la duplicación, así que NO tiene un número único de cromátidas
    // por cromosoma. Devolver 1 o 2 ahí sería inventarse un dato.
    const idxInterfaseMitosis = FASES_MITOSIS.findIndex((f) => f.id === 'interfase');
    expect(Number.isNaN(cromatidasPorCromosoma(FASES_MITOSIS, idxInterfaseMitosis))).toBe(true);

    // Gametos distintos solo por reparto al azar: 2^n. Con 2n=8 son n=4 pares → 16.
    expect(gametosDistintosPorReparto(8)).toBe(16);
    expect(gametosDistintosPorReparto(46)).toBe(2 ** 23); // 8.388.608
  });

  test('7.ter · la no disyunción reparte de más a un polo y de menos al otro', () => {
    // 2n=46 → un gameto normal lleva 23. Si un par no se separa en la anafase I, el polo que
    // lo recibe entero se queda con 24 y el otro con 22: los dos lados de la misma anomalía.
    const anafaseI = escalarFase(FASES_MEIOSIS.find((f) => f.id === 'anafase-i')!, 46)!;
    expect(cromosomasPorPolo(anafaseI)).toBe(23);
    expect(cromosomasPorPoloConNoDisyuncion(anafaseI, 1, true)).toBe(24);
    expect(cromosomasPorPoloConNoDisyuncion(anafaseI, 1, false)).toBe(22);
  });

  test('la corrección exige el entero exacto y diagnostica según lo que pide el enunciado', () => {
    // 26/09/2026 (hallazgo 2149): antes había una tolerancia del 1 % del valor. Todo lo que se
    // pregunta es un RECUENTO, así que solo vale el entero exacto; «8,0» es 8 escrito de otra
    // forma y sí vale.
    const placa = { division: 'mitosis' as const, faseId: 'metafase', dosN: 8 };
    const cromosomas = { ...placa, magnitud: 'cromosomas-en-celula' as const };
    expect(comprobarRespuesta(8, 8, cromosomas).correcto).toBe(true);
    expect(comprobarRespuesta(8.0, 8, cromosomas).correcto).toBe(true);
    expect(comprobarRespuesta(8.04, 8, cromosomas).correcto).toBe(false);
    expect(comprobarRespuesta(7, 8, cromosomas).correcto).toBe(false);

    // Contar cromátidas donde se pedían cromosomas da 16 en esta placa: suspende y lo dice.
    const cromatidas = comprobarRespuesta(16, 8, cromosomas);
    expect(cromatidas.correcto).toBe(false);
    expect(cromatidas.motivo).toContain('CROMÁTIDAS');
    // Aplicar la reducción de la meiosis I a la anafase de una mitosis da la mitad por polo.
    const porPolo = { ...placa, faseId: 'anafase', magnitud: 'cromosomas-por-polo' as const };
    expect(comprobarRespuesta(4, 8, porPolo).motivo).toContain('MITAD');
    // Sin el enunciado no se inventa un diagnóstico: solo se dice que no es correcto.
    expect(comprobarRespuesta(16, 8).motivo).toContain('No es correcto');

    // 2^8 = 256 gametos: 255 (2^n − 1) y 257 ya no pasan (hallazgo 2149).
    const gametos = {
      division: 'meiosis' as const,
      faseId: 'telofase-ii',
      dosN: 16,
      magnitud: 'gametos-distintos' as const,
    };
    for (const v of [254, 255, 257, 258]) {
      expect(comprobarRespuesta(v, 256, gametos).correcto, `${v}`).toBe(false);
    }
    // 16 = n × 2: el mensaje habla de multiplicar/elevar, no de polos (hallazgo 2152).
    const multiplica = comprobarRespuesta(16, 256, gametos).motivo;
    expect(multiplica).toContain('2^8');
    expect(multiplica).not.toContain('polo');
  });

  test('un dato imposible no lanza: devuelve un error que la vista puede pintar', () => {
    // Un `throw` dentro de un render de React tumba la app entera; un error devuelto se pinta.
    const impares = resolverCaso({
      division: 'meiosis',
      faseId: 'metafase-ii',
      dosN: 7,
      magnitud: 'cromosomas-en-celula',
    });
    expect(impares.ok).toBe(false);
    expect(impares.error).toBeTruthy();

    const inventada = resolverCaso({
      division: 'mitosis',
      faseId: 'fase-que-no-existe',
      dosN: 8,
      magnitud: 'cromosomas-en-celula',
    });
    expect(inventada.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REINSPECCIÓN · 25/09/2026 — los 12 casos EN EL NAVEGADOR y lo que la tanda dejó abierto
// ═══════════════════════════════════════════════════════════════════════════════

import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Qué cambió desde el 26/08: 4da98ff9 (12 casos de aula, 21/09), 12829fc3 (margen de ruido
 * binario en la tolerancia, 22/09) y f30606f6 (cabeceras de tabla a --primary-boton, 25/09).
 *
 * LOS 12 CASOS, RESUELTOS A MANO ANTES DE ABRIR LA APP, con el convenio que la propia app
 * declara (cromosoma = centrómero; una cromátida hermana cuenta como cromosoma solo tras
 * separarse; la anafase I separa homólogos y es la única que reduce):
 *    1  mitosis, metafase, 2n=8, cromosomas en la placa ........ 8
 *    2  ídem, cromátidas ....................................... 8 × 2 = 16
 *    3  mitosis, anafase, 2n=8, cromosomas por polo ............ 8 (el recuento no baja)
 *    4  meiosis, anafase I, 2n=8, cromosomas por polo .......... 8 ÷ 2 = 4
 *    5  ídem, cromátidas por polo .............................. 4 × 2 = 8
 *    6  meiosis, metafase II, 2n=12, cromátidas por célula ..... n = 6, × 2 = 12
 *    7  meiosis, anafase II, 2n=12, cromosomas por polo ........ 6
 *    8  meiosis completa desde un espermatocito ................ 4 células
 *    9  mitosis humana (2n=46), cada célula hija ............... 46
 *   10  meiosis humana, cada célula de la telofase II .......... 23
 *   11  no disyunción en anafase I, gameto del par de más ...... 22 + 2 = 24
 *   12  Drosophila (2n=8, n=4), gametos por reparto al azar .... 2^4 = 16
 * 2n = 46: NHGRI, «Chromosomes Fact Sheet» («23 pairs of chromosomes, for a total of 46»).
 * Drosophila 2n = 8: su genoma tiene «four pairs of chromosomes—an X/Y pair, and three
 * autosomes» (FlyBase, citado en Wikipedia, «Drosophila melanogaster», sección Genome).
 */
const RESPUESTAS_A_MANO: Record<number, { valor: string; respuesta: string }> = {
  1: { valor: '8', respuesta: 'Respuesta: 8 cromosomas en la placa' },
  2: { valor: '16', respuesta: 'Respuesta: 16 cromátidas en la célula' },
  3: { valor: '8', respuesta: 'Respuesta: 8 cromosomas por polo' },
  4: { valor: '4', respuesta: 'Respuesta: 4 cromosomas por polo' },
  5: { valor: '8', respuesta: 'Respuesta: 8 cromátidas por polo' },
  6: { valor: '12', respuesta: 'Respuesta: 12 cromátidas por célula' },
  7: { valor: '6', respuesta: 'Respuesta: 6 cromosomas por polo' },
  8: { valor: '4', respuesta: 'Respuesta: 4 células hijas' },
  9: { valor: '46', respuesta: 'Respuesta: 46 cromosomas por célula hija' },
  10: { valor: '23', respuesta: 'Respuesta: 23 cromosomas por gameto' },
  11: { valor: '24', respuesta: 'Respuesta: 24 cromosomas del gameto' },
  12: { valor: '16', respuesta: 'Respuesta: 16 gametos distintos' },
};

const ENTRADA_CASOS = '#casos-aula-respuesta';
const SECCION_CASOS = 'section[aria-labelledby="casos-aula-titulo"]';
const seccionCasos = (page: Page) => page.locator(SECCION_CASOS);

async function irACasoAula(page: Page, id: number): Promise<void> {
  const boton = seccionCasos(page).getByRole('button', { name: new RegExp(`^Caso ${id}:`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Escribe, comprueba y devuelve el veredicto (acotado a la sección: no al route announcer). */
async function responder(page: Page, valor: string): Promise<string> {
  const sec = seccionCasos(page);
  await page.locator(ENTRADA_CASOS).fill(valor);
  await esperarValorEnReact(page, ENTRADA_CASOS, valor);
  await sec.getByRole('button', { name: 'Comprobar', exact: true }).click();
  const veredicto = sec.locator('[role="alert"]');
  await expect(veredicto).toBeVisible();
  return ((await veredicto.textContent()) ?? '').trim();
}

/** Contraste WCAG de un elemento sobre su fondo real (capas de fondo compuestas). */
async function contrasteDe(page: Page, selector: string): Promise<number> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      type Rgba = { r: number; g: number; b: number; a: number };
      const leer = (c: string): Rgba | null => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const mezcla = (fg: Rgba, bg: Rgba): Rgba => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
      });
      const lum = ({ r, g, b }: Rgba) => {
        const f = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const capas: Rgba[] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = leer(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) capas.push(c);
        if (c && c.a === 1) break;
      }
      let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo);
      const texto = mezcla(leer(getComputedStyle(el).color) as Rgba, fondo);
      const [a, b] = [lum(texto), lum(fondo)];
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
}

/** Sin transiciones: si no, se mide el color a mitad de camino entre dos estados. */
async function congelarTransiciones(page: Page): Promise<void> {
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none!important;animation:none!important}',
  });
}

async function abrirBloqueEducativo(page: Page): Promise<void> {
  // EducationalSection cambia su aria-label al abrirse («Ver…» → «Ocultar guía educativa»).
  await page.getByRole('button', { name: 'Ver guía educativa', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Ocultar guía educativa', exact: true })
  ).toHaveAttribute('aria-expanded', 'true');
}

test.describe('reinspección 25/09/2026 — casos de aula en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, [ENTRADA_CASOS]);
  });

  test('los 12 casos: la respuesta calculada a mano se da por buena y la solución dice lo mismo', async ({
    page,
  }) => {
    const sec = seccionCasos(page);
    for (let id = 1; id <= 12; id++) {
      const { valor, respuesta } = RESPUESTAS_A_MANO[id];
      await irACasoAula(page, id);
      expect(await responder(page, valor), `caso ${id} con ${valor}`).toContain('¡Correcto!');
      await sec.getByRole('button', { name: /Ver solución/ }).click();
      await expect(sec.locator('ol + p'), `caso ${id}`).toHaveText(respuesta);
    }
  });

  test('tolerancia en los casos fijos: acepta 46 y «23,0», rechaza el vecino y el doble', async ({
    page,
  }) => {
    // Caso 9 (46 cromosomas por célula hija): un recuento solo admite el entero exacto
    // (hallazgo 2149), así que 45, 47 y «46,4» quedan fuera; 92 es sumar las dos células
    // hijas, y es el DOBLE.
    await irACasoAula(page, 9);
    expect(await responder(page, '46')).toContain('¡Correcto!');
    expect(await responder(page, '46,4')).toContain('No es correcto');
    expect(await responder(page, '45')).toContain('No es correcto');
    expect(await responder(page, '47')).toContain('No es correcto');
    const doble = await responder(page, '92');
    expect(doble).not.toContain('¡Correcto!');
    expect(doble).toContain('DOBLE');

    // Caso 10 (23): el número escrito de otras formas legítimas se acepta; 22/24 y 46 no.
    await irACasoAula(page, 10);
    expect(await responder(page, '23,0')).toContain('¡Correcto!');
    expect(await responder(page, ' 23 ')).toContain('¡Correcto!');
    expect(await responder(page, '23,2')).toContain('No es correcto');
    expect(await responder(page, '22')).toContain('No es correcto');
    expect(await responder(page, '24')).toContain('No es correcto');
    expect(await responder(page, '46')).not.toContain('¡Correcto!');

    // Caso 11 (24): olvidar el cromosoma de más (23) o tomar el otro polo (22) suspende.
    await irACasoAula(page, 11);
    expect(await responder(page, '23')).toContain('No es correcto');
    expect(await responder(page, '22')).toContain('No es correcto');
  });

  test('#383 verificado: la FAQ habla de homólogos, no de «pares de hermanas»', async ({ page }) => {
    await abrirBloqueEducativo(page);
    const faq = page.getByText('¿Por qué la meiosis produce 4 células y no 2?').locator('..');
    await expect(faq).toContainText('se separan los');
    await expect(faq).toContainText('cromosomas homólogos');
    await expect(faq).not.toContainText('pares de hermanas');
  });

  test('#381 verificado: en Profase I el bivalente y el crossing-over unen homólogos del MISMO color', async ({
    page,
  }) => {
    // El motor coloca el par 0 (naranja) en la columna izquierda y el par 1 (teal) en la
    // derecha, y page.tsx une (0,1) y (2,3). Si cada mitad del canvas tiene un solo color y
    // su propia marca rosa, cada bivalente es de homólogos; antes unía naranja con teal.
    await elegirModo(page, 'Meiosis');
    await irAFase(page, 'Profase I');
    const izquierda = await contarCromosomas(page, { x0: 0, x1: 0.5, y0: 0, y1: 1 });
    const derecha = await contarCromosomas(page, { x0: 0.5, x1: 1, y0: 0, y1: 1 });
    expect(new Set(izquierda.colores)).toEqual(new Set(['naranja']));
    expect(new Set(derecha.colores)).toEqual(new Set(['teal']));
    expect(izquierda.rosa).toBeGreaterThan(0);
    expect(derecha.rosa).toBeGreaterThan(0);
  });

  test('f30606f6: las cabeceras de la tabla comparativa pasan 4,5:1 en claro y en oscuro', async ({
    page,
  }) => {
    await congelarTransiciones(page);
    await abrirBloqueEducativo(page);
    // --primary-boton: 5,47:1 medido en claro y 10,73:1 en oscuro el 25/09/2026.
    expect(await contrasteDe(page, 'th')).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    expect(await contrasteDe(page, 'th')).toBeGreaterThanOrEqual(4.5);
  });

  test('modo práctica: con Date.now() = 1790337600010 sale el ejercicio de gametos con 2n = 16', async ({
    page,
  }) => {
    // Precondición del caso HALLAZGO 2149 (tolerancia en práctica): si el generador cambia y esta
    // semilla deja de dar este ejercicio, lo avisa ESTE test y no un «expected to fail» mudo.
    await page.clock.setFixedTime(new Date(1790337600010));
    await page.reload();
    await esperarHidratacion(page, [ENTRADA_CASOS]);
    const sec = seccionCasos(page);
    await sec.getByRole('button', { name: /Practicar/ }).click();
    await expect(sec.locator('h3 + p')).toContainText('2n = 16');
    await expect(sec.locator('h3 + p')).toContainText('GENÉTICAMENTE DISTINTOS');
    // n = 8 pares → 2^8 = 256
    expect(await responder(page, '256')).toContain('¡Correcto!');
  });
});

test.describe('reinspección 25/09/2026 — hallazgos reparados el 26/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, [ENTRADA_CASOS]);
  });

  test('HALLAZGO 2149 · en práctica, 255 no puede valer por 256 gametos distintos', async ({
    page,
  }) => {
    // Era toleranciaDe = máx(0,01; 1 % del valor) aplicada a RECUENTOS ENTEROS: con 256 daba
    // 2,56 y aceptaba 254, 255, 257 y 258. 255 = 2^8 − 1 es el error clásico. Un recuento
    // entero solo admite el entero exacto.
    await page.clock.setFixedTime(new Date(1790337600010));
    await page.reload();
    await esperarHidratacion(page, [ENTRADA_CASOS]);
    await seccionCasos(page).getByRole('button', { name: /Practicar/ }).click();
    for (const v of ['255', '254', '257', '258']) {
      expect(await responder(page, v), v).not.toContain('¡Correcto!');
    }
    expect(await responder(page, '256')).toContain('¡Correcto!');
  });

  test('HALLAZGO mensajes · caso 12 con «8» no debe recibir la explicación de los polos', async ({
    page,
  }) => {
    // 8 = 2 × 4 (multiplicar n por 2 en vez de elevar 2 a n): el error que la propia pista
    // anticipa. El corrector lo trataba como «la MITAD» y le hablaba de homólogos y polos;
    // ahora le explica que las posibilidades de cada par se multiplican (2^4).
    await irACasoAula(page, 12);
    const motivo = await responder(page, '8');
    expect(motivo).not.toContain('¡Correcto!');
    expect(motivo).not.toContain('polo');
    expect(motivo).toContain('2^4');
  });

  test('HALLAZGO mensajes · caso 10 con «46» no es un error de cromátidas', async ({ page }) => {
    // Dar 46 a un gameto humano es no haber reducido (creerlo diploide); el corrector le dice
    // que repasara si se piden cromosomas o cromátidas; ahora le dice que 46 es el 2n.
    await irACasoAula(page, 10);
    const motivo = await responder(page, '46');
    expect(motivo).not.toContain('¡Correcto!');
    expect(motivo).not.toContain('cromátidas');
    expect(motivo).toContain('diploide');
  });

  test('HALLAZGO región viva · volver a pulsar «Practicar» debe anunciar el enunciado nuevo', async ({
    page,
  }) => {
    // Es el 1212 de simulador-movimiento-circular: 12829fc3 lo reparó en las ocho copias de
    // CasosAula.tsx, pero aquí la sección vive dentro de page.tsx y se quedó sin tocar.
    const sec = seccionCasos(page);
    await sec.getByRole('button', { name: /Practicar/ }).click();
    const vivo = await sec.locator('h3 + p').evaluate((el) => {
      for (let n: Element | null = el; n && n.tagName !== 'SECTION'; n = n.parentElement) {
        if (n.getAttribute('aria-live') || n.getAttribute('role') === 'status') return true;
      }
      return false;
    });
    expect(vivo).toBe(true);
  });

  test('HALLAZGO contraste · el título del caso (teal sobre #FAFAFA) en claro', async ({ page }) => {
    // Medido el 25/09/2026: 2,68:1 a 16,8 px en negrita (no es texto grande: exige 4,5:1).
    // Reparado con --secondary-texto (hallazgo 2151).
    await congelarTransiciones(page);
    expect(await contrasteDe(page, `${SECCION_CASOS} h3`)).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO contraste · «Comprobar» (blanco sobre --primary) en oscuro', async ({ page }) => {
    // Medido el 25/09/2026: 2,79:1 en oscuro (4,11:1 en claro). Ahora --primary-boton.
    await congelarTransiciones(page);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    expect(await contrasteDe(page, `${SECCION_CASOS} button:text-is("Comprobar")`)).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO contraste · el botón «Auto» del simulador en claro', async ({ page }) => {
    // Medido el 25/09/2026: 2,68:1 (teal #48A9A6 sobre #FAFAFA a 14,4 px en negrita).
    // Ahora --secondary-texto.
    await congelarTransiciones(page);
    expect(await contrasteDe(page, 'button[aria-label="Iniciar reproducción automática"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO 2151 · el resto de textos en color de marca pasan 4,5:1 en claro y en oscuro', async ({
    page,
  }) => {
    // Los que el acta midió por debajo, además de los tres de arriba. Las clases de los CSS
    // Modules llevan sufijo, por eso se localizan por [class*=…].
    await congelarTransiciones(page);
    const selectores = [
      '[class*="btnNav"]',
      '[class*="resultadoCell"]',
      '[class*="velocidadBtnActiva"]',
      '[class*="tipoBtnActive"]',
      '[class*="fasPuntoActivo"] [class*="faseNombre"]',
      `${SECCION_CASOS} [class*="casoBotonActivo"]`,
      `${SECCION_CASOS} [class*="casoAyudaBoton"]`,
      `${SECCION_CASOS} h3`,
      `${SECCION_CASOS} button:text-is("Comprobar")`,
      'button[aria-label="Iniciar reproducción automática"]',
    ];
    for (const tema of ['light', 'dark']) {
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, tema);
      for (const sel of selectores) {
        expect(await contrasteDe(page, sel), `${tema} · ${sel}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('HALLAZGO fases · la meiosis tiene 9 fases y la app sigue anunciando 8', async ({ page }) => {
    // Reparación incompleta del #378: se añadió la Profase II (9 pestañas) pero la tabla
    // comparativa y la metadata seguían diciendo «8 fases». La tabla lo lee ahora del motor.
    await elegirModo(page, 'Meiosis');
    await expect(page.getByRole('tab')).toHaveCount(9);
    await abrirBloqueEducativo(page);
    await expect(page.locator('td', { hasText: 'meiosis I + meiosis II' })).toContainText('9 fases');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /meiosis \(9 fases\)/
    );
  });

  test('HALLAZGO bacterias · las bacterias no se reproducen por mitosis', async ({ page }) => {
    // OpenStax Biology 2e, §10.5: «Prokaryotes, such as bacteria, produce daughter cells by
    // binary fission» y no tienen huso mitótico. La propia FAQ de la app dice que una célula
    // sin núcleo no puede hacer mitosis.
    await abrirBloqueEducativo(page);
    // Se compara el fragmento que casa, no el <body> entero, para que el fallo sea legible.
    const frase = await page.evaluate(
      () => document.body.innerText.match(/bacterias[^.]*únicamente por\s+mitosis/)?.[0] ?? null
    );
    expect(frase).toBeNull();
  });
});

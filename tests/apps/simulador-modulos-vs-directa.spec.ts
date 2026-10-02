/**
 * Inspector — simulador-modulos-vs-directa (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * ⚠️ REDISEÑO del 01/10/2026 (hallazgo 2545, decisión del usuario). La app ya NO estima el
 * rendimiento de módulos ni recomienda régimen. Hasta ese día tenía un selector de cinco
 * actividades con deslizadores (mesas, m², kWh, vehículos, personal) que alimentaban fórmulas
 * «didácticas» inventadas —bar = 1.500 × mesas + 800 × asalariados + 6 × m² + 0,05 × kWh…— y
 * un «incentivo al empleo» de 100 € por asalariado, y con esa cifra decía «te conviene más X».
 * La Orden real (HAC/1425/2025) usa otros signos y cuantías: el hallazgo 2545 era el
 * «personal no asalariado» del bar, que la fórmula no usaba y el epígrafe 673.2 valora en
 * 11.413,08 €/persona. Hoy el usuario TECLEA su rendimiento neto de módulos (de su gestoría o
 * de aplicar la Orden a su epígrafe) y la app da las dos columnas y la diferencia como dato.
 *
 * Qué pasó con los casos anteriores
 * ──────────────────────────────────
 *  · Los goldens de la columna de ESTIMACIÓN DIRECTA no dependían de la actividad y se
 *    conservan tal cual, movidos a los deslizadores (antes algunos llegaban por un preset).
 *  · Los de la columna de MÓDULOS se recalculan sobre un rendimiento tecleado; los de las
 *    fórmulas por actividad desaparecen con ellas.
 *  · Los de «recomendación» (hallazgos 552, 554, 808, 809) pasan a exigir que NO haya
 *    veredicto: ni «te conviene», ni «recomend…», ni «gana». Ver el caso «2545 REPARADO».
 *  · Las tarjetas «Casos típicos» del bloque educativo (hallazgo 2548) se retiraron con los
 *    presets de los que tomaban las cifras: decían «Módulos suele ganar» y «ED gana en años
 *    malos». Su lugar lo ocupa «Qué mueve la diferencia», sin cifras ni ganador.
 *
 * Re-inspección del 02/10/2026 (la primera ENTERA tras el rediseño) — qué cambió en este fichero
 * ──────────────────────────────────────────────────────────────────────────────────────────────
 *  · Hallazgos abiertos por la mañana (2607-2614, reparados ese mismo día: ver el bloque siguiente):
 *      – el aviso de la cuota RETA calcula el rendimiento con «ingresos − gastos − cuota», y el
 *        art. 308.1.c LGSS manda «rendimiento neto + cuotas, − 7 % de gastos genéricos»;
 *      – el aviso numera los tramos del 1 al 15 seguidos, y la Orden PJC/297/2026 (art. 18) los
 *        numera por tabla (reducida 1-3, general 1-12);
 *      – el IRPF de las dos columnas no aplica la reducción del art. 32.2.3.º LIRPF (rentas
 *        < 12.000 €), que vale en directa y en módulos;
 *      – el bloque educativo dice que en directa el IVA va por el régimen general, también para
 *        el comercio minorista, que sigue en recargo de equivalencia (arts. 148-149 LIVA);
 *      – el sello de los límites de exclusión los atribuye a la Orden HAC/1425/2025, que no fija
 *        importes (art. 3.1 remite al art. 31.1.3.ª LIRPF);
 *      – la FAQ de la exclusión dice «al año siguiente» y la ley dice tres años (art. 31.1.5.ª);
 *      – el rótulo de la cuota RETA pide «tu cuota exacta» y el deslizador va de euro en euro;
 *      – el aviso de la cuota RETA nace con su propia región viva (no la hay antes).
 *  · Cuatro goldens de antes caían bajo el art. 32.2.3.º (rendimientos de 7.752, 9.500, 9.975 y
 *    11.400 €): sus ENTRADAS se subieron por encima de 12.000 € de rentas para que sigan
 *    vigilando lo suyo (el parseo, los límites, la cuota deducible) sin fijar una cifra que la
 *    ley no da. Cada uno dice el porqué en su comentario.
 *  · En los casos del aviso RETA se retiraron las aserciones del rendimiento mensual y del
 *    número de tramo (dos de los hallazgos de hoy) y se conservan la cuota mínima y el déficit,
 *    que salen iguales con la fórmula de la app y con la del art. 308 en esos casos.
 *  · El caso «1.850 €/mes es tramo 7 / 1.851 es tramo 8» se RETIRA: fijaba la frontera con el
 *    rendimiento de la app, que no es el del art. 308.1.c; con el rendimiento legal esa entrada
 *    cae en el tramo de 1.850-2.030 € y su caso pasa al `test.fail()` del aviso. La frontera de
 *    `tramoRETA()` la vigila `tests/apps/asistente-alta-autonomo.spec.ts`.
 *
 * Recálculo del 02/10/2026, tras REPARAR los hallazgos 2607-2614 (mismo día)
 * ──────────────────────────────────────────────────────────────────────────
 *  · Los ocho `test.fail()` pasan a ser casos normales, «REPARADO (02/10/2026)», tras comprobar
 *    que lo que afirman es lo correcto. El del 2613 se reescribe: la reparación no da céntimos al
 *    deslizador, añade una casilla `#retaExacta` (ver su comentario).
 *  · El aviso de la cuota RETA ya no dice «tabla del RETA», y el localizador que lo filtraba por
 *    ese texto se quedó ciego: sus `toHaveCount(0)` pasaban en falso. Ahora se localiza la región
 *    viva PERSISTENTE del grupo de la cuota (hallazgo 2614) y «sin aviso» es «región vacía», que
 *    no puede pasar si la región desaparece.
 *  · Vuelven las aserciones del rendimiento computable mensual y del tramo (retiradas por la
 *    mañana mientras eran hallazgos abiertos), ya con la fórmula del art. 308.1.c LGSS y la
 *    numeración de la Orden.
 *  · La línea «= Rendimiento neto reducido» solo se pinta si hay reducción del art. 32.2.3.º; sin
 *    ella, la línea es «= Rendimiento neto de la actividad» (caso del 45 %).
 *  · `main input` pasa de 4 a 5 controles (la casilla de la cuota exacta), y los cinco mueven el
 *    resultado.
 *  · Caso nuevo del art. 32.2.3.º en su tramo INTERMEDIO (rentas entre 8.000 y 12.000 €), que el
 *    del hallazgo 2608 (≤ 8.000 €, 1.620 € enteros) no ejercitaba, con aviso en la tabla REDUCIDA.
 *
 * De dónde sale cada cifra esperada (todas resueltas a mano ANTES de ejecutar)
 * ─────────────────────────────────
 *  · Escala — `TRAMOS_IRPF_2025` (data/fiscal/irpf.ts): 19 % hasta 12.450 · 24 % hasta 20.200 ·
 *    30 % hasta 35.200 · 37 % hasta 60.000 · 45 % hasta 300.000 · 47 % desde ahí. Acumulados:
 *    escala(12.450) = 2.365,50 · escala(20.200) = 4.225,50 · escala(35.200) = 8.725,50 ·
 *    escala(60.000) = 17.901,50 · escala(300.000) = 125.901,50.
 *  · Mínimo personal — `MINIMOS_IRPF_2025.personal` = 5.550 €; escala(5.550) = 1.054,50. Se grava
 *    a tipo cero (art. 63.1.2.º LIRPF, `calcularCuotaIntegraGeneral`), nunca se resta de la base.
 *  · Directa — previo = max(0, ingresos − gastos − RETA × 12) (la cuota del titular es gasto
 *    deducible, hallazgo 2444) · − 5 % con tope de 2.000 € (`GASTOS_DIFICIL_JUSTIFICACION_EDS`,
 *    art. 30.2.ª RIRPF) · = base · + RETA × 12 al coste.
 *  · Módulos — rendimiento tecleado · − 5 % SIN tope (`REDUCCION_GENERAL_MODULOS`, DA 1.ª Orden
 *    HAC/1425/2025, hallazgo 2445) · = base · + RETA × 12 al coste (aquí no se deduce).
 *  · Límites — `LIMITES_EXCLUSION_MODULOS_2025`: 250.000 € de ingresos y 250.000 € de compras
 *    (los gastos hacen de aproximación); «supera», así que 250.000 clavados siguen dentro.
 *  · Tramos RETA — `TRAMOS_RETA_2025` + `tramoRETA()` (data/fiscal/autonomos.ts), que copian el
 *    art. 18 de la Orden PJC/297/2026 (BOE-A-2026-7296).
 *  · Rendimiento computable del RETA (casos de 02/10/2026) — art. 308.1.c LGSS, texto consolidado
 *    del BOE (BOE-A-2015-11724), regla 1.ª: en estimación directa, «el rendimiento neto,
 *    incrementado en el importe de las cuotas de la Seguridad Social»; regla 2.ª: «una deducción
 *    por gastos genéricos del 7 por ciento». El rendimiento neto de la directa simplificada lleva
 *    ya el 5 % de difícil justificación (art. 30 RIRPF, BOE-A-2007-6820).
 *    Fórmula: (rendimiento neto de la actividad + cuota × 12) × 0,93 / 12, donde el rendimiento
 *    neto es el de ANTES de la reducción del art. 32.2.3.º (`rendimientoComputableMensualRETA`).
 *    Tramos por tabla, como la Orden: reducida 1 (≤ 670) · 2 (≤ 900) · 3 (< 1.166,70); general
 *    1 (≤ 1.300) · 2 (≤ 1.500) · 3 (≤ 1.700) · 4 (≤ 1.850) · 5 (≤ 2.030) · 6 (≤ 2.330) ·
 *    7 (≤ 2.760) · 8 (≤ 3.190) · 9 (≤ 3.620) · 10 (≤ 4.050) · 11 (≤ 6.000) · 12 (> 6.000).
 *  · Art. 32.2.3.º LIRPF (BOE-A-2006-20764, consolidado a 30/09/2026): con rentas no exentas
 *    ≤ 8.000 €, incluidas las de la actividad, el rendimiento neto se reduce en 1.620 €; entre
 *    8.000 y 12.000 €, en 1.620 − 0,405 × (rentas − 8.000). Vale cuando no se cumplen los
 *    requisitos del 2.º (que exige estimación directa y cliente único): directa y módulos.
 *    Desde el 02/10/2026 la app la aplica con la actividad como ÚNICA renta: rentas = rendimiento
 *    neto de la actividad (directa: previo − 5 % con tope; módulos: dato − 5 % sin tope), y el
 *    IRPF se calcula sobre el rendimiento neto REDUCIDO, que nunca queda negativo.
 *
 * Formato: `formatCurrency` (es-ES) no agrupa millares con 4 cifras enteras (6723,00 €) y sí
 * desde 5 (20.376,20 €), como manda la RAE. El signo de resta de la plantilla es «−» (U+2212).
 */
import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

const RUTA = '/simulador-modulos-vs-directa/';

/**
 * Los tres deslizadores, la casilla de la cuota RETA exacta (hallazgo 2613, 02/10/2026) y el
 * campo del rendimiento de módulos: los cinco controles de la app.
 */
const CAMPO_MODULOS = '#rendimientoModulos';
const CAMPO_RETA_EXACTA = '#retaExacta';
const ENTRADAS = ['#ingresos', '#gastos', '#reta', CAMPO_RETA_EXACTA, CAMPO_MODULOS];

const ED = 'Estimación Directa Simplificada';
const MOD = 'Estimación Objetiva (Módulos)';

/** Texto completo de una de las dos columnas de resultado (ED o Módulos). */
async function panel(page: Page, tituloH3: string): Promise<string> {
  const contenedor = page.locator('h3', { hasText: tituloH3 }).first().locator('xpath=..');
  return (await contenedor.innerText()).replace(/\s+/g, ' ').trim();
}

/** Igual que `linea`, pero localizando por el PRINCIPIO de la etiqueta. */
async function lineaQueEmpiezaPor(page: Page, tituloH3: string, prefijo: string): Promise<string> {
  const contenedor = page.locator('h3', { hasText: tituloH3 }).first().locator('xpath=..');
  const fila = contenedor
    .locator('div', { has: page.locator(`span:text-matches("^${prefijo}")`) })
    .last();
  return (await fila.locator('strong').innerText()).replace(/\s+/g, ' ').trim();
}

/** Valor (el <strong>) de una línea concreta dentro de una columna. */
async function linea(page: Page, tituloH3: string, etiqueta: string): Promise<string> {
  const contenedor = page.locator('h3', { hasText: tituloH3 }).first().locator('xpath=..');
  const fila = contenedor
    .locator('div', { has: page.locator(`span:text-is("${etiqueta}")`) })
    .last();
  return (await fila.locator('strong').innerText()).replace(/\s+/g, ' ').trim();
}

/** Los deslizadores capan y ajustan al paso: se siembra con el helper acotado. */
const deslizar = (page: Page, id: string, valor: number | string) => sembrarValorAcotado(page, `#${id}`, valor);

/** Teclea el rendimiento neto de módulos y comprueba que el estado de React lo recogió. */
const escribirModulos = (page: Page, texto: string) => sembrarValor(page, CAMPO_MODULOS, texto);

/** La caja de la diferencia (role="status"): un dato, nunca un veredicto. */
const estado = (page: Page) => page.locator('[role="status"]');

/**
 * La región viva del aviso de la cuota RETA: el `[aria-live="polite"]` PERSISTENTE del grupo del
 * deslizador (hallazgo 2614), no el anunciador de rutas. Hasta el 02/10/2026 se filtraba por el
 * texto «tabla del RETA»; la reparación cambió la redacción y los `toHaveCount(0)` pasaban en
 * falso. Ahora «sin aviso» se escribe `sinAvisoReta`: la región EXISTE y está vacía.
 */
const avisoReta = (page: Page) =>
  page.locator('label[for="reta"]').locator('xpath=..').locator('[aria-live="polite"]');
const sinAvisoReta = async (page: Page) => {
  await expect(avisoReta(page)).toHaveCount(1);
  await expect(avisoReta(page)).toHaveText('');
};

/** Escribe la cuota RETA exacta, con céntimos, en su casilla de texto (hallazgo 2613). */
const escribirRetaExacta = (page: Page, texto: string) => sembrarValor(page, CAMPO_RETA_EXACTA, texto);

/** Palabras de veredicto que la app ya no puede decir (hallazgo 2545). */
const VEREDICTO = /te conviene|conviene más|recomend|\bgana(?:s|n|r|dora|dor)?\b|sale más barat/i;

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // Ni un movimiento de deslizador ni una tecla llegan a React antes de que haya hidratado.
  await esperarHidratacion(page, ENTRADAS);
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Rediseño del 01/10/2026 — el rendimiento de módulos lo teclea el usuario
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — rendimiento de módulos tecleado (01/10/2026)', () => {
  /**
   * NORMAL — ingresos 90.000 €, gastos 25.000 € y RETA 320 €/mes (los dos últimos, de partida),
   * con 20.000 € de rendimiento neto de módulos tecleado como «20.000».
   *
   * Directa: previo 90.000 − 25.000 − 3.840 = 61.160 · 5 % = 3.058 > tope → −2.000 → base 59.160
   *   escala(59.160) = 8.725,50 + 23.960 × 37 % = 8.725,50 + 8.865,20 = 17.590,70
   *   IRPF 17.590,70 − 1.054,50 = 16.536,20 · coste 16.536,20 + 3.840 = 20.376,20 €
   * Módulos: 20.000 − 5 % sin tope (1.000,00) = 19.000 = base
   *   escala(19.000) = 2.365,50 + 6.550 × 24 % = 2.365,50 + 1.572,00 = 3.937,50
   *   IRPF 3.937,50 − 1.054,50 = 2.883,00 · coste 2.883,00 + 3.840 = 6.723,00 €
   * Diferencia 20.376,20 − 6.723,00 = 13.653,20 € → «… en Estimación Directa es 13.653,20 €
   *   mayor que en módulos», sin ningún veredicto.
   */
  test('NORMAL — 90.000/25.000/320 con 20.000 € de módulos: directa 20.376,20 €, módulos 6723,00 €, diferencia 13.653,20 €', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 90000);
    await escribirModulos(page, '20.000');

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3840,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('61.160,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('59.160,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('17.590,70 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('16.536,20 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('20.376,20 €');

    expect(await linea(page, MOD, 'Rendimiento neto de módulos (tu dato)')).toBe('20.000,00 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−1000,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('19.000,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('3937,50 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('2883,00 €');
    expect(await linea(page, MOD, '+ Cuota RETA × 12 (en módulos no se deduce)')).toBe('+3840,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('6723,00 €');

    const caja = estado(page);
    await expect(caja).toContainText('13.653,20 €');
    await expect(caja).toContainText('en Estimación Directa es');
    await expect(caja).toContainText('mayor que en módulos');
    expect(await caja.innerText()).not.toMatch(VEREDICTO);
  });

  /**
   * SIN DATO — el estado de partida no trae rendimiento de módulos: la directa se calcula igual
   * (70.000 − 25.000 − 3.840 = 41.160 · −2.000 → 39.160 · escala 8.725,50 + 3.960 × 37 % =
   * 10.190,70 · IRPF 9.136,20 · coste 12.976,20 €) y la columna de módulos dice qué falta, sin
   * ninguna cifra.
   */
  test('SIN DATO — la directa sale igual y la columna de módulos explica qué falta, sin cifras', async ({ page }) => {
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('39.160,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('9136,20 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('12.976,20 €');

    const mod = await panel(page, MOD);
    expect(mod).toContain('Falta tu rendimiento neto de módulos');
    expect(mod).toContain('Orden HAC/1425/2025');
    expect(mod).not.toContain('Coste fiscal anual total');
    expect(mod).not.toMatch(/\d,\d{2}\s€/);
    await expect(estado(page)).toContainText('solo se calcula la Estimación Directa');
  });

  /**
   * RENDIMIENTO 0 — «0» es un dato, no la falta de él. Estado de partida (directa 12.976,20 €).
   * Módulos: 0 − 5 % (0,00) = 0 = base · escala(0) − escala(0) = 0 → IRPF 0,00 · coste = RETA
   * 3.840,00 € · diferencia 12.976,20 − 3.840,00 = 9.136,20 € (mayor en directa).
   * (Con base 0 el art. 32.2.3.º no cambia nada: el IRPF ya es 0.)
   */
  test('RENDIMIENTO 0 — es un dato: IRPF 0,00 € y coste igual a la cuota RETA (3840,00 €)', async ({ page }) => {
    await escribirModulos(page, '0');
    expect(await linea(page, MOD, 'Rendimiento neto de módulos (tu dato)')).toBe('0,00 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−0,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('0,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3840,00 €');
    await expect(estado(page)).toContainText('9136,20 €');
    await expect(estado(page)).toContainText('mayor que en módulos');
  });

  /**
   * RECHAZO — lo que no es un importe válido no se convierte en cifra, y el aviso es role="alert".
   *   «abc», «1e3», «1.2.3» y «12abc» → no son un importe (parseSpanishNumber devuelve NaN) ·
   *   «-5.000» y «−300» (con el signo menos tipográfico U+2212) → negativos.
   *   En todos, la columna de módulos queda sin cifras.
   * Y lo válido se lee en formato español: «24.000» son veinticuatro mil (no 24). Estado de partida:
   *   24.000 − 5 % (1.200,00) = 22.800 · escala(22.800) = 4.225,50 + 2.600 × 30 % = 5.005,50
   *   IRPF 5.005,50 − 1.054,50 = 3.951,00 · coste 3.951,00 + 3.840 = 7.791,00 €
   *   diferencia 12.976,20 − 7.791,00 = 5.185,20 €.
   *   (02/10/2026: antes se tecleaba «12.000»; sus 11.400 € de rentas caen bajo la reducción del
   *   art. 32.2.3.º LIRPF —hallazgo 2608, reparado ese mismo día—, y el caso vigila el PARSEO, no esa reducción.)
   * Vaciar el campo devuelve al estado sin dato, sin aviso.
   */
  test('RECHAZO — «abc», «1e3», «1.2.3», «12abc», «-5.000» y «−300» avisan y no dan cifra; «24.000» son veinticuatro mil', async ({
    page,
  }) => {
    const campo = page.locator(CAMPO_MODULOS);
    // El aviso del campo (role="alert"), no la DisclaimerCard ni el anunciador de rutas.
    const alerta = page.locator('[role="alert"]').filter({ hasText: /no es un importe|no puede ser negativo/ });

    for (const [texto, motivo] of [
      ['abc', 'no es un importe'],
      ['1e3', 'no es un importe'],
      ['1.2.3', 'no es un importe'],
      ['12abc', 'no es un importe'],
      ['-5.000', 'no puede ser negativo'],
      ['−300', 'no puede ser negativo'],
    ] as const) {
      await escribirModulos(page, texto);
      await expect(alerta.first()).toContainText(motivo);
      await expect(campo).toHaveAttribute('aria-invalid', 'true');
      const mod = await panel(page, MOD);
      expect(mod).not.toContain('Coste fiscal anual total');
      expect(mod).not.toMatch(/\d,\d{2}\s€/);
      await expect(estado(page)).not.toContainText('mayor que en módulos');
      await expect(estado(page)).not.toContainText('menor que en módulos');
    }

    await escribirModulos(page, '24.000');
    await expect(alerta).toHaveCount(0);
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
    expect(await linea(page, MOD, 'Rendimiento neto de módulos (tu dato)')).toBe('24.000,00 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−1200,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('22.800,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('5005,50 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('3951,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('7791,00 €');
    await expect(estado(page)).toContainText('5185,20 €');

    await escribirModulos(page, '');
    await expect(alerta).toHaveCount(0);
    expect(await panel(page, MOD)).toContain('Falta tu rendimiento neto de módulos');
  });

  /**
   * LÍMITE (ingresos) — 250.000 € clavados siguen dentro; 251.000 € excluyen aunque haya dato.
   * Ingresos 250.000, gastos 0, RETA 206 (suelo del deslizador), módulos «30.000».
   *   Directa: 250.000 − 0 − 2.472 = 247.528 · −2.000 → 245.528
   *     escala = 17.901,50 + 185.528 × 45 % = 17.901,50 + 83.487,60 = 101.389,10
   *     IRPF 100.334,60 · coste 100.334,60 + 2.472 = 102.806,60 €
   *     (el mínimo cae entero en el 45 %: restarlo de la base daría 1.443,00 € menos)
   *   Módulos: 30.000 − 1.500,00 = 28.500 · escala 4.225,50 + 8.300 × 30 % = 6.715,50
   *     IRPF 5.661,00 · coste 5.661,00 + 2.472 = 8.133,00 € · diferencia 102.806,60 − 8.133,00
   *     = 94.673,60 €
   *   (02/10/2026: antes «10.000»; sus 9.500 € de rentas caen bajo el art. 32.2.3.º LIRPF.)
   */
  test('LÍMITE — 250.000 € de ingresos aún calcula módulos (8133,00 €); 251.000 € excluye aunque haya dato', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 206);
    await escribirModulos(page, '30.000');

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('245.528,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('101.389,10 €');
    expect(await linea(page, ED, '= IRPF')).toBe('100.334,60 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('102.806,60 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−1500,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('6715,50 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('5661,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('8133,00 €');
    expect(await panel(page, MOD)).not.toContain('superan los límites de exclusión');
    await expect(estado(page)).toContainText('94.673,60 €');

    await deslizar(page, 'ingresos', 251000);
    const mod = await panel(page, MOD);
    expect(mod).toContain('Ingresos o gastos superan los límites de exclusión');
    expect(mod).not.toContain('Coste fiscal anual total');
    await expect(estado(page)).toContainText('no hay comparación de importes');
  });

  /**
   * LÍMITE (compras) — gastos de 250.000 € dentro, 250.500 € fuera. Ingresos 250.000, RETA 206,
   * módulos «30.000».
   *   Directa: max(0, 250.000 − 250.000 − 2.472) = 0 → IRPF 0 → coste 2.472,00 €
   *   Módulos: 8.133,00 € (caso anterior) → diferencia 2.472,00 − 8.133,00 = −5.661,00: «… es
   *   5661,00 € menor que en módulos». Un paso más del deslizador y quedan excluidos.
   *   (02/10/2026: antes «10.000», por el mismo motivo que el caso anterior.)
   */
  test('LÍMITE — compras de 250.000 € aún calculan (directa 5661,00 € menor); 250.500 € excluyen', async ({ page }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 250000);
    await deslizar(page, 'reta', 206);
    await escribirModulos(page, '30.000');

    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('2472,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('8133,00 €');
    await expect(estado(page)).toContainText('5661,00 €');
    await expect(estado(page)).toContainText('menor que en módulos');

    await deslizar(page, 'gastos', 250500);
    const mod = await panel(page, MOD);
    expect(mod).toContain('Ingresos o gastos superan los límites de exclusión');
    expect(mod).toContain('250.000,00 € / 250.000,00 €');
    await expect(estado(page)).toContainText('no hay comparación de importes');
  });

  /**
   * Hallazgo 2545 — REPARADO (01/10/2026). Con la actividad Bar / Cafetería la app pintaba el
   * deslizador «Personal no asalariado (incluido titular)», que la fórmula del bar no usaba:
   * moverlo no cambiaba ninguna cifra. Y toda la columna de módulos salía de fórmulas
   * inventadas con las que la app recomendaba régimen.
   *
   * Reparado de raíz: fuera el selector de actividad, los deslizadores de parámetros y los
   * presets. Se exige (1) que no quede ninguno de aquellos controles, (2) que CADA control que
   * queda mueva alguna cifra del resultado, y (3) que ni la página ni su metadata digan un
   * veredicto («te conviene», «recomend…», «gana», «sale más barato»).
   */
  test('2545 REPARADO — ningún control sin efecto y ninguna palabra de veredicto', async ({ page }) => {
    for (const viejo of ['#pAsal', '#pNoAsal', '#sup', '#kwh', '#mesas', '#veh']) {
      await expect(page.locator(viejo)).toHaveCount(0);
    }
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Aplicar caso/ })).toHaveCount(0);

    // Los controles que quedan son exactamente cinco (desde el 02/10/2026: la casilla de la cuota
    // exacta del hallazgo 2613 se suma a los cuatro de antes), y los cinco mueven el resultado.
    await expect(page.locator('main input')).toHaveCount(5);
    const resultado = page.locator('h2', { hasText: 'Coste anual en cada régimen' }).locator('xpath=..');
    const mover: Array<[string, () => Promise<unknown>]> = [
      [CAMPO_MODULOS, () => escribirModulos(page, '15.000')],
      ['#ingresos', () => deslizar(page, 'ingresos', 80000)],
      ['#gastos', () => deslizar(page, 'gastos', 30000)],
      ['#reta', () => deslizar(page, 'reta', 400)],
      [CAMPO_RETA_EXACTA, () => escribirRetaExacta(page, '350,25')],
    ];
    for (const [control, accion] of mover) {
      const antes = await resultado.innerText();
      await accion();
      expect(await resultado.innerText(), `${control} no movió ninguna cifra`).not.toBe(antes);
    }

    // Sin veredicto en lo visible (fuera la DisclaimerCard común, que dice «te recomendamos
    // contrastar…» en todas las apps) ni en el bloque educativo, que nace plegado.
    const texto = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script, [role="alert"][class*="severity-critical"]').forEach((n) => n.remove());
      return copia.textContent ?? '';
    });
    expect(texto).toContain('Rendimiento neto de módulos (tu dato)');
    expect(texto).not.toMatch(VEREDICTO);

    // Ni en lo que leen buscadores y asistentes: title, description, Open Graph y FAQPage.
    expect(await page.title()).not.toMatch(VEREDICTO);
    for (const sel of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      expect((await page.locator(sel).getAttribute('content')) ?? '').not.toMatch(VEREDICTO);
    }
    const jsonLd = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join('\n')
    );
    expect(jsonLd).toContain('"FAQPage"');
    expect(jsonLd).not.toMatch(VEREDICTO);
    expect(jsonLd).not.toContain('fórmula didáctica');
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * La columna de ESTIMACIÓN DIRECTA — goldens de las re-inspecciones del 31/08, 12/09, 29/09
 * y 01/10/2026, que no dependían de la actividad de módulos y siguen valiendo
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — columna de estimación directa', () => {
  /**
   * Tramo del 45 % — ingresos 200.000 €, gastos 0, RETA 600 €/mes.
   *   previo 200.000 − 7.200 = 192.800 · −2.000 → 190.800 = base
   *   escala(190.800) = 17.901,50 + 130.800 × 45 % = 76.761,50 · IRPF 75.707,00
   *   + 7.200 → coste 82.907,00 € (el mínimo, entero en el 45 %: techo del error de restarlo)
   * (02/10/2026: la cifra 190.800,00 € se rotula ahora «= Rendimiento neto de la actividad»; la
   * línea «= Rendimiento neto reducido» solo aparece si hay reducción del art. 32.2.3.º, y con
   * 190.800 € de rentas no la hay.)
   */
  test('tramo del 45 % — 200.000/0/600: IRPF 75.707,00 € y coste 82.907,00 €', async ({ page }) => {
    await deslizar(page, 'ingresos', 200000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 600);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('192.800,00 €');
    expect(await linea(page, ED, '= Rendimiento neto de la actividad')).toBe('190.800,00 €');
    expect(await panel(page, ED)).not.toContain('Reducción por rentas bajas');
    expect(await panel(page, ED)).not.toContain('= Rendimiento neto reducido');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('190.800,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('76.761,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('75.707,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('82.907,00 €');
  });

  /**
   * El mínimo se grava a tipo cero — ingresos 50.000 €, gastos 12.000 €, RETA 300 €/mes.
   *   previo 50.000 − 12.000 − 3.600 = 34.400 · 5 % = 1.720 → 32.680 = base
   *   escala(32.680) = 4.225,50 + 12.480 × 30 % = 7.969,50 · IRPF 7.969,50 − 1.054,50 = 6.915,00
   *   + 3.600 → 10.515,00 €. Restando el mínimo de la base saldría 6.304,50 (610,50 € menos).
   */
  test('mínimo a tipo cero — 50.000/12.000/300: IRPF 6915,00 € y no 6304,50 €', async ({ page }) => {
    await deslizar(page, 'ingresos', 50000);
    await deslizar(page, 'gastos', 12000);
    await deslizar(page, 'reta', 300);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('34.400,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('32.680,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('7969,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('6915,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('10.515,00 €');
  });

  /**
   * HALLAZGO R (2444) — REPARADO el 29/09/2026: la cuota RETA es gasto deducible en directa.
   * Ingresos 40.000 €, gastos 18.000 €, RETA 320 €/mes, módulos «20.500».
   *   Directa: 40.000 − 18.000 − 3.840 = 18.160 · 5 % = 908 → 17.252
   *     escala 2.365,50 + 4.802 × 24 % = 3.517,98 · IRPF 2.463,48 · coste 6.303,48 €
   *     (sin deducir la cuota: previo 22.000 → 20.900 → IRPF 3.381,00 y coste 7.221,00 €)
   *   Módulos: 20.500 − 1.025,00 = 19.475 · escala 2.365,50 + 7.025 × 24 % = 4.051,50
   *     IRPF 2.997,00 · coste 6.837,00 €
   *   Diferencia 6.303,48 − 6.837,00 = −533,52 → «… es 533,52 € menor que en módulos».
   * (02/10/2026: antes 30.000/18.000/320 con «10.500»; sus 7.752 y 9.975 € de rentas caen bajo
   * el art. 32.2.3.º LIRPF (hallazgo 2608, reparado ese mismo día). El caso vigila la cuota deducible.)
   */
  test('HALLAZGO R (REPARADO el 29/09/2026) — la cuota RETA es gasto deducible en ED: 40.000/18.000/320', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 40000);
    await deslizar(page, 'gastos', 18000);
    await escribirModulos(page, '20.500');

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3840,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('18.160,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−908,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('17.252,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('2463,48 €');
    expect(await linea(page, ED, '+ Cuota RETA × 12 (la pagas igual)')).toBe('+3840,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('6303,48 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('2997,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('6837,00 €');

    await expect(estado(page)).toContainText('533,52 €');
    await expect(estado(page)).toContainText('menor que en módulos');
  });

  /**
   * La cuota RETA lleva el rendimiento de ED justo a cero y luego por debajo. Ingresos 40.000 €,
   * gastos 37.000 €: ingresos − gastos = 3.000 €.
   *   RETA 250 €/mes → 3.000 − 3.000 = 0: reducción 0,00, base 0, IRPF 0, coste 3.000,00 €.
   *   RETA 300 €/mes → −600, acotado a 0: IRPF 0, coste 3.600,00 €.
   * Aviso RETA (art. 308.1.c LGSS): con 250 €, (0 + 3.000) × 0,93 / 12 = 232,50 €/mes; con 300 €,
   * la pérdida REAL entra en la cuenta, (−600 + 3.600) × 0,93 / 12 = 232,50 €/mes (hasta el
   * 02/10 la app partía del rendimiento acotado a 0 y daba 279,00; lo corrigió el mismo día la
   * sesión de reparación). Las dos cifras caen en la tabla reducida, tramo 1, mínima 205,88 € →
   * en ningún caso hay aviso.
   */
  test('la cuota RETA deja el rendimiento de ED en 0 (250 €) y por debajo (300 €): base 0, IRPF 0, sin aviso RETA', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 40000);
    await deslizar(page, 'gastos', 37000);
    await deslizar(page, 'reta', 250);

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3000,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−0,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('0,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−0,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3000,00 €');
    await sinAvisoReta(page);

    await deslizar(page, 'reta', 300);
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3600,00 €');
    await sinAvisoReta(page);
  });

  /**
   * Ingresos negativos: los importes son deslizadores (`min=0`). Sembrar −5.000 deja el control
   * en 0 y, con los gastos de partida (25.000 €), el rendimiento se acota a 0: el coste de ED es
   * solo la cuota RETA, 320 × 12 = 3.840,00 €.
   */
  test('ingresos negativos: el deslizador los deja en 0 y el rendimiento no baja de 0', async ({ page }) => {
    expect(await deslizar(page, 'ingresos', -5000)).toBe('0');
    expect(await linea(page, ED, 'Ingresos brutos')).toBe('0,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3840,00 €');
  });

  /**
   * Una cuota RETA imposible y unos ingresos fuera de rango no entran. Ingresos 30.000 €, gastos
   * 10.000 €, cuota de 150 €/mes, por debajo de la mínima de TRAMOS_RETA_2025 (205,88 €): el
   * deslizador la deja en ceil(205,88) = 206.
   *   ED: 30.000 − 10.000 − 2.472 = 17.528 · 5 % = 876,40 → 16.651,60 · escala 2.365,50 +
   *     4.201,60 × 24 % = 3.373,88 → IRPF 2.319,38 · + 2.472 → 4.791,38 €
   *   (16.651,60 € de rentas: por encima de 12.000, sin reducción del art. 32.2.3.º.)
   *   Aviso (art. 308.1.c LGSS): (16.651,60 + 2.472) × 0,93 / 12 = 19.123,60 × 0,93 / 12 =
   *     17.784,948 / 12 = 1.482,079 → 1.482,08 €/mes, en «> 1.300 y ≤ 1.500» (tabla general,
   *     tramo 2 de la Orden), cuota mínima 302,65 € → déficit (302,65 − 206) × 12 = 1.159,80 €.
   *     (Antes del 02/10 la app buscaba con 17.528 / 12 = 1.460,67 €/mes y lo llamaba «tramo 5»:
   *     mismo tramo por casualidad. Las aserciones del rendimiento y del tramo, retiradas por la
   *     mañana mientras eran hallazgos abiertos, vuelven tras la reparación.)
   * 350.000 € de ingresos se quedan en 300.000 €, que excluyen de módulos.
   */
  test('rechazo de deslizadores — una cuota de 150 € se queda en 206 € y 350.000 € de ingresos en 300.000 €, que excluyen de módulos', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 30000);
    await deslizar(page, 'gastos', 10000);
    expect(await deslizar(page, 'reta', 150)).toBe('206');

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−2472,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('17.528,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−876,40 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('16.651,60 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('3373,88 €');
    expect(await linea(page, ED, '= IRPF')).toBe('2319,38 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('4791,38 €');
    await expect(avisoReta(page)).toContainText('1482,08 €/mes');
    await expect(avisoReta(page)).toContainText('tabla general, tramo 2,');
    await expect(avisoReta(page)).toContainText('302,65 €/mes');
    await expect(avisoReta(page)).toContainText('1159,80 €');

    expect(await deslizar(page, 'ingresos', 350000)).toBe('300000');
    expect(await linea(page, ED, 'Ingresos brutos')).toBe('300.000,00 €');
    expect(await panel(page, MOD)).toContain('Ingresos o gastos superan los límites de exclusión');
    await expect(estado(page)).toContainText('no hay comparación de importes');
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Lo que la página PUBLICA junto a la cifra — reparaciones del 13/09, 29/09 y 01/10/2026
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — fuentes, avisos y metadata', () => {
  /**
   * Cuatro sellos DataReference: IRPF, límites de módulos, directa simplificada y RETA. Desde el
   * 01/10/2026 la nota del primero dice que el rendimiento de módulos lo introduce el usuario
   * (antes: «fórmula didáctica simplificada»).
   */
  test('DataReference cita la fuente de lo que realmente se calcula', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias).toHaveCount(4);
    await expect(referencias.first()).toContainText(/IRPF \d{4}/);
    await expect(referencias.first()).toContainText('el rendimiento neto de módulos también');
    await expect(referencias.first()).toContainText('la app no lo calcula a partir de la Orden HAC/1425/2025');
    await expect(referencias.first()).not.toContainText('fórmula didáctica');
    await expect(referencias.nth(1)).toContainText('Límites de exclusión de módulos');
    await expect(referencias.nth(1)).toContainText('125.000,00 €');
    await expect(referencias.nth(2)).toContainText('Estimación directa simplificada');
    await expect(referencias.nth(2)).toContainText('cuota RETA como gasto deducible');
    await expect(referencias.nth(3)).toContainText('Cotización de autónomos (RETA)');
  });

  test('DisclaimerCard crítico y DataReference con el META re-sellado y fecha en formato español', async ({
    page,
  }) => {
    const disclaimer = page.locator('[role="alert"][class*="severity-critical"]');
    await expect(disclaimer).toHaveCount(1);

    // 02/10/2026 — la fuente del IRPF suma el art. 32.2.3.º (hallazgo 2608; antes «arts. 19, 20,
    // 56 a 66, 84.2 y 96») sin cambiar su sello, y el de los límites se re-sella ese día (2610;
    // antes «02/09/2026»). La Orden HAC/1425/2025 sigue en ese sello, pero solo como norma de la
    // reducción general del 5 % (su DA 1.ª), no como fuente de los importes.
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).toContainText('27/09/2026');
    await expect(referencias.first()).toContainText('arts. 19, 20, 32.2.3.º, 56 a 66, 84.2 y 96');
    await expect(referencias.nth(1)).toContainText('02/10/2026');
    await expect(referencias.nth(1)).toContainText('DA 1.ª de la Orden HAC/1425/2025');
  });

  test('[810] la Orden de módulos se cita con su referencia real, y en ningún sitio queda el comodín', async ({
    page,
  }) => {
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('HFP/X/2024');
    expect(cuerpo).toContain('Orden HAC/1425/2025');
    expect(cuerpo).toContain('BOE-A-2025-25272');
    expect((cuerpo.match(/Orden HAC\/1425\/2025/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  /** HALLAZGO H (2448) — REPARADO el 29/09/2026: ningún texto llama «Orden HFP» a la Orden HAC. */
  test('HALLAZGO H (REPARADO el 29/09/2026) — ningún texto visible llama «Orden HFP» a la Orden HAC de módulos', async ({
    page,
  }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).not.toContainText('Orden HFP');
    expect(await page.locator('body').innerText()).not.toContain('Orden HFP');
    expect(await page.locator('body').textContent()).not.toContain('Orden HFP');
  });

  /**
   * HALLAZGO P (2447) — REPARADO el 29/09/2026: «5 %» con espacio duro U+00A0 en las dos
   * columnas. La de módulos solo pinta su desglose con dato, así que se teclea uno.
   */
  test('HALLAZGO P (REPARADO el 29/09/2026) — «Reducción 5 %» con espacio duro en las dos columnas', async ({
    page,
  }) => {
    await escribirModulos(page, '10.000');
    for (const columna of [ED, MOD]) {
      const contenedor = page.locator('h3', { hasText: columna }).first().locator('xpath=..');
      const rotulo = await contenedor
        .locator('span', { hasText: /^− Reducción (general )?5/ })
        .first()
        .textContent();
      expect(rotulo).not.toContain('5%');
      // textContent conserva el U+00A0: se exige el espacio duro.
      expect(rotulo).toContain('5 %');
    }
  });

  /**
   * HALLAZGO T (2445) — REPARADO el 29/09/2026: el 5 % de módulos no lleva el tope de 2.000 € de
   * la directa simplificada. Con «52.200» tecleados: 5 % = 2.610,00 (no 2.000,00) → base 49.590
   *   escala(49.590) = 8.725,50 + 14.390 × 37 % = 8.725,50 + 5.324,30 = 14.049,80 · IRPF 12.995,30
   */
  test('HALLAZGO T (REPARADO el 29/09/2026) — el 5 % de módulos no tiene el tope de 2.000 € de la EDS', async ({
    page,
  }) => {
    await escribirModulos(page, '52.200');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−2610,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('49.590,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('14.049,80 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('12.995,30 €');
    expect(await panel(page, MOD)).toContain('(sin tope)');
    expect(await panel(page, MOD)).not.toContain('máx.');
  });

  test('[814] el deslizador de la cuota RETA no baja del suelo de la tabla de tramos', async ({ page }) => {
    const reta = page.locator('#reta');
    // TRAMOS_RETA_2025: cuota mínima más baja 205,88 € · más alta 1.606,88 €, hacia DENTRO.
    expect(Number(await reta.getAttribute('min'))).toBe(206);
    expect(Number(await reta.getAttribute('max'))).toBe(1606);
    expect(Number(await reta.getAttribute('min'))).toBeGreaterThanOrEqual(205.88);
    expect(Number(await reta.getAttribute('max'))).toBeLessThanOrEqual(1606.88);

    const hint = await page.locator('label[for="reta"]').locator('xpath=..').innerText();
    const hintNorm = hint.replace(/\s+/g, ' ');
    expect(hintNorm).toContain('206,00 €');
    expect(hintNorm).toContain('1606,00 €');
    expect(hintNorm).toContain('205,88 €');
  });

  test('[812] una cuota RETA imposible con ese rendimiento se avisa, y una posible no', async ({ page }) => {
    // Estado de partida (70.000/25.000/320): rendimiento neto 39.160; art. 308.1.c LGSS,
    // (39.160 + 3.840) × 0,93 / 12 = 39.990 / 12 = 3.332,50 €/mes, en «> 3.190 y ≤ 3.620»
    // (tabla general, tramo 9 de la Orden), cuota mínima 478,68 €/mes. Faltan
    // (478,68 − 320) × 12 = 1.904,16 €/año. (Hasta el 02/10 la app buscaba con
    // (45.000 − 3.840)/12 = 3.430,00 €/mes y lo llamaba «tramo 12»: misma cuota mínima.)
    const aviso = avisoReta(page);
    await expect(aviso).toContainText('3332,50 €/mes');
    await expect(aviso).toContainText('478,68');
    await expect(aviso).toContainText('1904,16');

    // Con 479 €/mes: previo 45.000 − 5.748 = 39.252 · −1.962,60 → 37.289,40; art. 308,
    // (37.289,40 + 5.748) × 0,93 / 12 = 3.335,40 €/mes, mismo tramo, y 479 ≥ 478,68: sin aviso.
    await sembrarValor(page, '#reta', 479);
    await sinAvisoReta(page);
  });

  /**
   * Comercio 60.000/30.000/402 (re-inspección del 29/09): ED previo 25.176 · 5 % 1.258,80 →
   * 23.917,20 · escala 4.225,50 + 3.717,20 × 30 % = 5.340,66 · IRPF 4.286,16 · coste 9.110,16 €.
   * Aviso (art. 308.1.c LGSS): (23.917,20 + 4.824) × 0,93 / 12 = 26.729,316 / 12 = 2.227,44 €/mes,
   * en «> 2.030 y ≤ 2.330» (tabla general, tramo 6), mínima 401,47 € → sin aviso.
   * Con 401 €: previo 30.000 − 4.812 = 25.188 · −1.259,40 → 23.928,60; (23.928,60 + 4.812) × 0,93
   * / 12 = 26.728,758 / 12 = 2.227,40 €/mes, mismo tramo → faltan (401,47 − 401) × 12 = 5,64 €/año.
   * (Hasta el 02/10 la app buscaba con 2.098,00 €/mes y decía «tramo 9»: misma cuota mínima.)
   */
  test('RETA 402 € coherente con su tramo y 401 € no — ED 9110,16 €', async ({ page }) => {
    await deslizar(page, 'ingresos', 60000);
    await deslizar(page, 'gastos', 30000);
    await deslizar(page, 'reta', 402);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('25.176,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−1258,80 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('23.917,20 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('5340,66 €');
    expect(await linea(page, ED, '= IRPF')).toBe('4286,16 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('9110,16 €');
    await sinAvisoReta(page);

    await deslizar(page, 'reta', 401);
    await expect(avisoReta(page)).toContainText('2227,40 €/mes');
    await expect(avisoReta(page)).toContainText('tabla general, tramo 6,');
    await expect(avisoReta(page)).toContainText('401,47 €/mes');
    await expect(avisoReta(page)).toContainText('5,64 €');
  });

  // RETIRADO el 02/10/2026 — «1.850 €/mes es tramo 7 (360,29 €) y 1.851 €/mes es tramo 8»: fijaba
  // la frontera con el rendimiento de la app (ingresos − gastos − cuota), que no es el del
  // art. 308.1.c LGSS. Con el legal, 30.000/4.500/275 da 1.890,23 €/mes (tramo de 1.850-2.030 €)
  // y su caso está en «2607 REPARADO»; la frontera de `tramoRETA()` la vigila
  // tests/apps/asistente-alta-autonomo.spec.ts.

  /**
   * Re-inspección del 01/10/2026, CASO 1 — ingresos 120.000 €, gastos 50.000 €, RETA 500 €/mes.
   *   ED: 120.000 − 50.000 − 6.000 = 64.000 · −2.000 → 62.000 · escala 17.901,50 + 2.000 × 45 %
   *     = 18.801,50 · IRPF 17.747,00 · coste 23.747,00 €
   *   Aviso RETA (art. 308.1.c LGSS): (62.000 + 6.000) × 0,93 / 12 = 63.240 / 12 = 5.270,00 €/mes,
   *     en «> 4.050 y ≤ 6.000» (tabla general, tramo 11), mínima 545,59 € → (545,59 − 500) × 12 =
   *     547,08 €/año. (Hasta el 02/10 la app buscaba con 5.333,33 €/mes y decía «tramo 14».)
   */
  test('120.000/50.000/500: ED 23.747,00 € y aviso RETA de 545,59 €', async ({ page }) => {
    await deslizar(page, 'ingresos', 120000);
    await deslizar(page, 'gastos', 50000);
    await deslizar(page, 'reta', 500);

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−6000,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('64.000,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−2000,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('62.000,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('18.801,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('17.747,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('23.747,00 €');

    await expect(avisoReta(page)).toContainText('5270,00 €/mes');
    await expect(avisoReta(page)).toContainText('tabla general, tramo 11,');
    await expect(avisoReta(page)).toContainText('545,59 €/mes');
    await expect(avisoReta(page)).toContainText('547,08 €');
  });

  test('[año] el title anuncia 2026, de FISCAL_IRPF_META.vigencia, y og/twitter no llevan año', async ({ page }) => {
    await expect(page).toHaveTitle('Simulador Módulos vs Estimación Directa Autónomos 2026 | meskeIA');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Simulador Módulos vs Estimación Directa | meskeIA'
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'Módulos vs Estimación Directa | meskeIA'
    );
  });

  /** Hallazgo 2546 — REPARADO (01/10/2026): el sello del IRPF anuncia el mismo año que el title. */
  test('[año] el DataReference del IRPF anuncia el mismo año que el title', async ({ page }) => {
    const anio = (await page.title()).match(/Autónomos (\d{4})/)?.[1];
    expect(anio).toBe('2026');
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).toContainText(`IRPF ${anio}`, { timeout: 1000 });
  });

  /**
   * Sospecha del 01/10/2026, DESCARTADA el 02/10/2026 sin caso: el año del title sale de
   * FISCAL_IRPF_META.vigencia y no de ORDEN_MODULOS_VIGENTE.ejercicio. Hoy los dos valen 2026 y
   * todo lo visible cuadra. Este caso es el testigo de la deriva que la sospecha temía: si en
   * enero se re-sella el IRPF a 2027 antes de cargar la Orden de módulos de 2027, el title dirá un
   * año y el aviso de elegibilidad («desarrolla el método para …») y el FAQPage, otro.
   */
  test('[año] title, sello del IRPF, Orden de módulos y FAQPage anuncian el mismo ejercicio', async ({ page }) => {
    const anioTitle = (await page.title()).match(/Autónomos (\d{4})/)?.[1];
    const aviso = await page.locator('p', { hasText: 'Solo determinadas actividades pueden acogerse' }).innerText();
    const ejercicioOrden = aviso.match(/método para (\d{4})/)?.[1];
    expect(anioTitle).toBe('2026');
    expect(ejercicioOrden).toBe(anioTitle);
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).toContainText(`IRPF ${anioTitle}`, { timeout: 1000 });
    await expect(referencias.nth(3)).toContainText(`cotización ${anioTitle}`, { timeout: 1000 });
    const faq = await page.evaluate(
      () =>
        [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((s) => s.textContent ?? '')
          .find((t) => t.includes('"FAQPage"')) ?? ''
    );
    expect(faq).toContain(`módulos en ${anioTitle}?`);
  });

  /** Hallazgo 2547 — REPARADO (01/10/2026): ninguna nota visible enseña un identificador de código. */
  test('[RETA] ninguna nota visible enseña un identificador de código', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).not.toContainText(/[A-Z]+_[A-Z_]+\d{4}/, { timeout: 1000 });
    // La Orden se extrae del texto de FISCAL_AUTONOMOS_META.fuente con una regex (sospecha del
    // 01/10/2026, DESCARTADA el 02/10/2026): extrae «Orden PJC/297/2026», que es la de cotización
    // de 2026 (BOE-A-2026-7296, art. 18), la misma del cuarto sello.
    await expect(referencias.first()).toContainText('tabla de tramos del RETA de la Orden PJC/297/2026');
    await expect(referencias.nth(3)).toContainText('Orden PJC/297/2026');
    expect(await page.locator('body').innerText()).not.toMatch(/\b[A-Z]+_[A-Z_]+_\d{4}\b/);
  });

  /**
   * Hallazgo 2548 (01/10/2026) — las tarjetas «Casos típicos» salieron con los presets de los que
   * tomaban las cifras (rediseño del 2545): anunciaban un ganador. Su sitio lo ocupa «Qué mueve la
   * diferencia», que explica el mecanismo sin cifras ni veredicto.
   */
  test('[educativo] las tarjetas del bloque educativo explican la diferencia sin anunciar ganador', async ({ page }) => {
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).toContain('Qué mueve la diferencia');
    expect(cuerpo).not.toContain('Casos típicos');
    expect(cuerpo).not.toContain('Módulos suele ganar');
    expect(cuerpo).not.toContain('ED gana en años malos');
  });

  /**
   * Hallazgo 2549 — REPARADO (01/10/2026): el FAQPage cita la misma Orden y los mismos límites
   * que la página deriva de data/fiscal. Vigila la DERIVA al re-sellar la Orden.
   */
  test('[FAQPage] cita la misma Orden y los mismos límites que la página deriva de data/fiscal', async ({ page }) => {
    const faq = await page.evaluate(
      () =>
        [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((s) => s.textContent ?? '')
          .find((t) => t.includes('"FAQPage"')) ?? ''
    );
    expect(faq).not.toBe('');

    const aviso = await page.locator('p', { hasText: 'Solo determinadas actividades pueden acogerse' }).innerText();
    const orden = aviso.match(/Orden HAC\/\d+\/\d{4}/)?.[0];
    const boe = aviso.match(/BOE-A-\d{4}-\d+/)?.[0];
    expect(orden).toBe('Orden HAC/1425/2025');
    expect(boe).toBe('BOE-A-2025-25272');
    expect(faq).toContain(orden);
    expect(faq).toContain(boe);
    const ejercicio = aviso.match(/método para (\d{4})/)?.[1];
    expect(ejercicio).toBe('2026');
    expect(faq).toContain(`módulos en ${ejercicio}?`);

    const limites = (
      await page.locator('strong', { hasText: '¿Qué pasa si supero los límites de módulos?' }).locator('xpath=..').textContent()
    )?.replace(/\s+/g, ' ');
    const cifras = [...(limites ?? '').matchAll(/(\d{1,3}(?:\.\d{3})+),00\s€/g)].map((m) => m[1]);
    expect(cifras).toEqual(['250.000', '125.000', '250.000']);
    for (const c of new Set(cifras)) expect(faq).toContain(`${c} €`);
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Re-inspección del 02/10/2026 — la primera ENTERA tras el rediseño
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — re-inspección del 02/10/2026', () => {
  /**
   * NORMAL con céntimos — ingresos 48.000 €, gastos 15.000 €, RETA 350 €/mes, módulos «14.250,40».
   *   Directa: 48.000 − 15.000 − 4.200 = 28.800 · 5 % = 1.440,00 (bajo el tope) → 27.360 = base
   *     escala(27.360) = 4.225,50 + 7.160 × 30 % = 4.225,50 + 2.148,00 = 6.373,50
   *     IRPF 6.373,50 − 1.054,50 = 5.319,00 · coste 5.319,00 + 4.200 = 9.519,00 €
   *   Módulos: 14.250,40 × 5 % = 712,52 → 13.537,88 = base
   *     escala(13.537,88) = 2.365,50 + 1.087,88 × 24 % = 2.365,50 + 261,0912 = 2.626,5912 → 2.626,59
   *     IRPF 2.626,5912 − 1.054,50 = 1.572,0912 → 1.572,09 · coste 5.772,0912 → 5.772,09 €
   *   Diferencia 9.519,00 − 5.772,0912 = 3.746,9088 → «3746,91 € mayor que en módulos».
   *   Rentas de 27.360 y 13.537,88 €: por encima de 12.000, el art. 32.2.3.º no juega.
   *   Aviso RETA (art. 308.1.c LGSS): (27.360 + 4.200) × 0,93 / 12 = 29.350,80 / 12 = 2.445,90 €/mes,
   *     en «> 2.330 y ≤ 2.760» (tabla general, tramo 7), mínima 427,21 € → faltan
   *     (427,21 − 350) × 12 = 926,52 €/año. (Hasta el 02/10 la app buscaba con 2.400,00 €/mes y
   *     decía «tramo 10»: misma cuota mínima.)
   */
  test('NORMAL — 48.000/15.000/350 con «14.250,40»: directa 9519,00 €, módulos 5772,09 €, diferencia 3746,91 €', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 48000);
    await deslizar(page, 'gastos', 15000);
    await deslizar(page, 'reta', 350);
    await escribirModulos(page, '14.250,40');

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('28.800,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−1440,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('27.360,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('6373,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('5319,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('9519,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto de módulos (tu dato)')).toBe('14.250,40 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−712,52 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('13.537,88 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('2626,59 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('1572,09 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('5772,09 €');

    await expect(estado(page)).toContainText('3746,91 €');
    await expect(estado(page)).toContainText('mayor que en módulos');
    await expect(avisoReta(page)).toContainText('2445,90 €/mes');
    await expect(avisoReta(page)).toContainText('tabla general, tramo 7,');
    await expect(avisoReta(page)).toContainText('427,21 €/mes');
    await expect(avisoReta(page)).toContainText('926,52 €');
  });

  /**
   * LÍMITE (el techo de los tres deslizadores) — ingresos 300.000, gastos 0, RETA 1.606 €/mes
   * (máximo del deslizador), módulos «10.000».
   *   Directa: 300.000 − 19.272 = 280.728 · −2.000 → 278.728
   *     escala = 17.901,50 + 218.728 × 45 % = 17.901,50 + 98.427,60 = 116.329,10
   *     IRPF 115.274,60 · coste 115.274,60 + 19.272 = 134.546,60 €
   *   Módulos: 300.000 > 250.000 → excluido aunque haya dato; sin cifras.
   *   Aviso (art. 308.1.c LGSS): (278.728 + 19.272) × 0,93 / 12 = 23.095,00 €/mes → tabla general,
   *     tramo 12, mínima 607,35 ≤ 1.606 → sin aviso. (Hasta el 02/10: 280.728 / 12 = 23.394.)
   */
  test('LÍMITE — 300.000/0/1606: directa 134.546,60 € y módulos excluido aunque haya dato', async ({ page }) => {
    await deslizar(page, 'ingresos', 300000);
    await deslizar(page, 'gastos', 0);
    expect(await deslizar(page, 'reta', 1606)).toBe('1606');
    await escribirModulos(page, '10.000');

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−19.272,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('278.728,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('116.329,10 €');
    expect(await linea(page, ED, '= IRPF')).toBe('115.274,60 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('134.546,60 €');
    const mod = await panel(page, MOD);
    expect(mod).toContain('Ingresos o gastos superan los límites de exclusión');
    expect(mod).not.toContain('Coste fiscal anual total');
    expect(mod).not.toContain('10.000,00 €');
    await expect(estado(page)).toContainText('no hay comparación de importes');
    await sinAvisoReta(page);
  });

  /**
   * TRAMO MÁS ALTO (47 %) — solo se alcanza por la columna de módulos: ingresos 250.000, gastos 0,
   * RETA 608 €/mes, módulos «400.000».
   *   Módulos: 400.000 − 20.000,00 = 380.000
   *     escala = 17.901,50 + 240.000 × 45 % + 80.000 × 47 % = 17.901,50 + 108.000 + 37.600
   *     = 163.501,50 · IRPF 162.447,00 · coste 162.447,00 + 7.296 = 169.743,00 €
   *   Directa: 250.000 − 7.296 = 242.704 · −2.000 → 240.704
   *     escala = 17.901,50 + 180.704 × 45 % = 17.901,50 + 81.316,80 = 99.218,30
   *     IRPF 98.163,80 · coste 105.459,80 €
   *   Diferencia 105.459,80 − 169.743,00 = −64.283,20 → «64.283,20 € menor que en módulos».
   *   Aviso: 608 ≥ 607,35 (último tramo) → sin aviso, con la fórmula de la app y con la legal.
   */
  test('TRAMO 47 % — «400.000» de módulos: IRPF 162.447,00 € y directa 64.283,20 € menor', async ({ page }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 608);
    await escribirModulos(page, '400.000');

    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−20.000,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('380.000,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('163.501,50 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('162.447,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('169.743,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('98.163,80 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('105.459,80 €');
    await expect(estado(page)).toContainText('64.283,20 €');
    await expect(estado(page)).toContainText('menor que en módulos');
    await sinAvisoReta(page);
  });

  /**
   * El campo acepta el euro que escribe la propia app: «18.500 €» son 18.500,00 €.
   *   18.500 − 925,00 = 17.575 · escala 2.365,50 + 5.125 × 24 % = 3.595,50 · IRPF 2.541,00
   */
  test('«18.500 €» con el símbolo se lee como 18.500,00 € (IRPF 2541,00 €)', async ({ page }) => {
    await escribirModulos(page, '18.500 €');
    await expect(page.locator(CAMPO_MODULOS)).toHaveAttribute('aria-invalid', 'false');
    expect(await linea(page, MOD, 'Rendimiento neto de módulos (tu dato)')).toBe('18.500,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('2541,00 €');
  });

  /**
   * Hallazgo 2607 — REPARADO (02/10/2026). El rendimiento con el que el aviso busca el tramo del
   * RETA es ya el del art. 308.1.c LGSS (BOE-A-2015-11724): en directa, «el rendimiento neto,
   * incrementado en el importe de las cuotas» (regla 1.ª), con «una deducción por gastos
   * genéricos del 7 por ciento» (regla 2.ª). Hasta ese día la app usaba ingresos − gastos − cuota,
   * sin el 7 %. Los tres casos van en los dos sentidos: un aviso falso que desaparece y uno real
   * que aparece (el «2607 al revés» de la ficha es el (2)).
   *   (1) 100.000/21.000/560 — previo 79.000 − 6.720 = 72.280 · −2.000 → 70.280 · (70.280 +
   *       6.720) × 0,93 = 71.610 → 5.967,50 €/mes → tabla general, tramo 11, mínima 545,59 € ≤ 560:
   *       SIN aviso. (La app, hasta el 02/10: 72.280 / 12 = 6.023,33 → «tramo 15», 607,35 → avisaba
   *       de 568,20 €.)
   *   (2) 30.000/4.500/370 — previo 25.500 − 4.440 = 21.060 · −1.053 → 20.007 · (20.007 + 4.440) ×
   *       0,93 = 22.735,71 → 1.894,6425 → 1.894,64 €/mes → tabla general, tramo 5 («> 1.850 y
   *       ≤ 2.030»), mínima 380,88 € > 370: aviso de (380,88 − 370) × 12 = 130,56 €. (La app, hasta
   *       el 02/10: 21.060 / 12 = 1.755 → mínima 360,29: callaba.)
   *   (3) misma entrada con 275 €/mes — previo 22.200 · −1.110 → 21.090 · (21.090 + 3.300) × 0,93 =
   *       22.682,70 → 1.890,225 €/mes, MEDIO CÉNTIMO exacto: redondeado como manda la aritmética
   *       sería 1.890,23 (lo que dice la ficha), y la pantalla da 1890,22 porque 22.682,70 / 12 en
   *       coma flotante es 1.890,22499…; no se fija ese céntimo (el tramo no cambia por él, y se
   *       reporta aparte como detalle de presentación) → mismo tramo, mínima 380,88 → déficit
   *       (380,88 − 275) × 12 = 1.270,56 €. (La app, hasta el 02/10: 1.850,00 €/mes → 360,29 →
   *       1.023,48 €.)
   */
  test('2607 REPARADO (02/10/2026) — el aviso RETA usa el rendimiento del art. 308.1.c LGSS (cuotas sumadas y 7 % genérico)', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 100000);
    await deslizar(page, 'gastos', 21000);
    await deslizar(page, 'reta', 560);
    await sinAvisoReta(page);

    await deslizar(page, 'ingresos', 30000);
    await deslizar(page, 'gastos', 4500);
    await deslizar(page, 'reta', 370);
    await expect(avisoReta(page)).toContainText('1894,64 €/mes');
    await expect(avisoReta(page)).toContainText('tabla general, tramo 5,');
    await expect(avisoReta(page)).toContainText('380,88 €/mes');
    await expect(avisoReta(page)).toContainText('130,56 €');

    await deslizar(page, 'reta', 275);
    await expect(avisoReta(page)).toContainText(/1890,2[23]\s€\/mes/);
    await expect(avisoReta(page)).toContainText('380,88 €/mes');
    await expect(avisoReta(page)).toContainText('1270,56 €');
  });

  /**
   * Hallazgo 2611 — REPARADO (02/10/2026). El aviso nombra el tramo como la Orden PJC/297/2026
   * (art. 18, BOE-A-2026-7296), por tabla: reducida 1-3 y general 1-12. Hasta ese día usaba el
   * `id` correlativo de TRAMOS_RETA_2025 (1-15). En el estado de partida el rendimiento computable,
   * 3.332,50 €/mes, cae en «> 3.190 y ≤ 3.620», que la Orden llama «Tabla general · Tramo 9»; su
   * «Tramo 12» es «> 6.000 €», base mínima 1.928,10 €, y la app decía «tramo 12». La tabla
   * reducida la ejercita el caso del art. 32.2.3.º intermedio, más abajo («tabla reducida,
   * tramo 3»).
   */
  test('2611 REPARADO (02/10/2026) — el aviso RETA nombra el tramo como la Orden PJC/297/2026 (tabla general, tramo 9)', async ({
    page,
  }) => {
    await expect(avisoReta(page)).toContainText('478,68 €/mes');
    const texto = (await avisoReta(page).innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/tramo 12\b/);
    expect(texto).toContain('tabla general, tramo 9,');
  });

  /**
   * Hallazgo 2608 — REPARADO (02/10/2026). El IRPF de las dos columnas aplica la reducción del
   * art. 32.2.3.º LIRPF: con rentas no exentas ≤ 8.000 € (la actividad como única renta, que es lo
   * que la app modela) el rendimiento neto se reduce en 1.620 €. Vale en directa y en módulos.
   * Ingresos 20.000, gastos 10.000, RETA 230 €/mes, módulos «6.000».
   *   Directa: 10.000 − 2.760 = 7.240 · 5 % = 362 → 6.878 (≤ 8.000) · − 1.620 → 5.258 = base
   *     escala(5.258) = 5.258 × 19 % = 999,02 · mínimo: escala(min(5.550; 5.258)) = 999,02
   *     → IRPF 0,00 · coste 2.760,00 €. (La app, hasta el 02/10: escala(6.878) = 1.306,82 →
   *     IRPF 252,32 €.)
   *   Módulos: 6.000 − 300 = 5.700 (≤ 8.000) · − 1.620 → 4.080 → IRPF 0,00 · coste 2.760,00 €.
   *     (La app, hasta el 02/10: escala(5.700) = 1.083,00 → IRPF 28,50 €.)
   *   Diferencia 0 → «el coste anual es el mismo en los dos regímenes». (Antes: «223,82 € mayor».)
   *   Aviso RETA: (6.878 + 2.760) × 0,93 / 12 = 746,945 €/mes → tabla reducida, tramo 2, mínima
   *     226,47 € ≤ 230 → sin aviso.
   */
  test('2608 REPARADO (02/10/2026) — rentas ≤ 8.000 €: la reducción del art. 32.2.3.º LIRPF (1.620 €) deja el IRPF en 0 en los dos regímenes', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 20000);
    await deslizar(page, 'gastos', 10000);
    await deslizar(page, 'reta', 230);
    await escribirModulos(page, '6.000');

    const RENTAS_BAJAS = '− Reducción por rentas bajas (art. 32.2.3.º LIRPF)';
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('7240,00 €');
    expect(await linea(page, ED, '= Rendimiento neto de la actividad')).toBe('6878,00 €');
    expect(await linea(page, ED, RENTAS_BAJAS)).toBe('−1620,00 €');
    expect(await linea(page, ED, '= Rendimiento neto reducido')).toBe('5258,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('5258,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('999,02 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−999,02 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('2760,00 €');

    expect(await linea(page, MOD, '= Rendimiento neto de la actividad')).toBe('5700,00 €');
    expect(await linea(page, MOD, RENTAS_BAJAS)).toBe('−1620,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto reducido')).toBe('4080,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('4080,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('2760,00 €');
    await expect(estado(page)).toContainText('el coste anual es el mismo');
    await sinAvisoReta(page);
  });

  /**
   * Art. 32.2.3.º en su tramo INTERMEDIO (rentas entre 8.000 y 12.000 €: 1.620 − 0,405 × exceso),
   * que el caso del 2608 no ejercita, y aviso RETA en la tabla REDUCIDA (hallazgo 2611).
   * Ingresos 20.000, gastos 7.000 (el deslizador va de 500 en 500), RETA 262 €/mes, módulos
   * «10.400». Entradas elegidas para que ninguna cifra caiga en medio céntimo. Resuelto a mano el
   * 02/10/2026:
   *   Directa: 20.000 − 7.000 − 3.144 = 9.856 · 5 % = 492,80 → 9.363,20
   *     reducción 1.620 − 0,405 × (9.363,20 − 8.000) = 1.620 − 552,096 = 1.067,904 → 1.067,90
   *     reducido 9.363,20 − 1.067,904 = 8.295,296 → 8.295,30 = base
   *     escala(8.295,296) = 8.295,296 × 19 % = 1.576,10624 → 1.576,11
   *     IRPF 1.576,10624 − 1.054,50 = 521,60624 → 521,61 · coste 521,60624 + 3.144 = 3.665,61 €
   *   Módulos: 10.400 − 520 = 9.880
   *     reducción 1.620 − 0,405 × 1.880 = 1.620 − 761,40 = 858,60 → 9.021,40 = base
   *     escala = 9.021,40 × 19 % = 1.714,066 → 1.714,07 · IRPF 659,566 → 659,57
   *     coste 659,566 + 3.144 = 3.803,566 → 3.803,57 €
   *   Diferencia 3.665,60624 − 3.803,566 = −137,95976 → «137,96 € menor que en módulos».
   *   (Sin la reducción, como hasta el 02/10: directa base 9.363,20 → IRPF 724,51; módulos base
   *   9.880 → IRPF 822,70.)
   *   Aviso RETA: (9.363,20 + 3.144) × 0,93 / 12 = 11.631,696 / 12 = 969,308 → 969,31 €/mes →
   *     «> 900 y < 1.166,70», tabla reducida, tramo 3, mínima 849,67 × 31,5 % = 267,65 € > 262 →
   *     faltan (267,65 − 262) × 12 = 67,80 €/año.
   */
  test('art. 32.2.3.º intermedio — 20.000/7.000/262 con «10.400»: reducciones 1067,90 € y 858,60 €, aviso en la tabla reducida', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 20000);
    await deslizar(page, 'gastos', 7000);
    await deslizar(page, 'reta', 262);
    await escribirModulos(page, '10.400');

    const RENTAS_BAJAS = '− Reducción por rentas bajas (art. 32.2.3.º LIRPF)';
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('9856,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−492,80 €');
    expect(await linea(page, ED, '= Rendimiento neto de la actividad')).toBe('9363,20 €');
    expect(await linea(page, ED, RENTAS_BAJAS)).toBe('−1067,90 €');
    expect(await linea(page, ED, '= Rendimiento neto reducido')).toBe('8295,30 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('8295,30 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('1576,11 €');
    expect(await linea(page, ED, '= IRPF')).toBe('521,61 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3665,61 €');

    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−520,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto de la actividad')).toBe('9880,00 €');
    expect(await linea(page, MOD, RENTAS_BAJAS)).toBe('−858,60 €');
    expect(await linea(page, MOD, '= Rendimiento neto reducido')).toBe('9021,40 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1714,07 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('659,57 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3803,57 €');

    await expect(estado(page)).toContainText('137,96 €');
    await expect(estado(page)).toContainText('menor que en módulos');
    await expect(avisoReta(page)).toContainText('969,31 €/mes');
    await expect(avisoReta(page)).toContainText('tabla reducida, tramo 3,');
    await expect(avisoReta(page)).toContainText('267,65 €/mes');
    await expect(avisoReta(page)).toContainText('67,80 €');
  });

  /**
   * Hallazgo 2609 — REPARADO (02/10/2026). El bloque educativo ya no manda al minorista en directa
   * al régimen general del IVA: el recargo de equivalencia se aplica a los comerciantes minoristas
   * personas físicas sin condición de método de IRPF (art. 148.Uno LIVA); el método solo exime del
   * requisito del 80 % de ventas a consumidores a quien está en módulos (art. 149.Uno.2.º b). Un
   * minorista que renuncia a módulos sigue en recargo (si vende más del 80 % a consumidores) y no
   * liquida IVA (art. 154.Dos). Se vigilan los tres sitios de la ficha: la fila «IVA» de la tabla,
   * la FAQ y «errores frecuentes» («van atados, no son independientes»).
   */
  test('2609 REPARADO (02/10/2026) — el bloque educativo no manda al minorista en directa al régimen general del IVA', async ({
    page,
  }) => {
    const fila = page.locator('table tr', { has: page.locator('td', { hasText: /^IVA$/ }) });
    const celdaDirecta = ((await fila.locator('td').nth(1).textContent()) ?? '').replace(/\s+/g, ' ');
    const faq = ((await page.locator('strong', { hasText: '¿Tributo el IVA igual en ambos regímenes?' }).locator('xpath=..').textContent()) ?? '').replace(/\s+/g, ' ');
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(celdaDirecta).toContain('recargo de equivalencia');
    expect(faq).not.toContain('En directa estás en el régimen general de IVA');
    expect(faq).toContain('recargo de equivalencia');
    expect(cuerpo).not.toContain('van atados, no son independientes');
  });

  /**
   * Hallazgo 2610 — REPARADO (02/10/2026). El sello de los límites ya no atribuye su importe a la
   * Orden de módulos («límites prorrogados por Orden HAC/1425/2025»): la Orden no fija importes,
   * su art. 3.1 a) y c) remite al art. 31.1.3.ª LIRPF (BOE-A-2025-25272). Cita la base real —el
   * art. 31.1.3.ª y la DT 32.ª LIRPF— y la salvedad: la DT 32.ª consolidada (a 30/09/2026) solo
   * cubre 2016-2024 y la AEAT los aplica «desde 2016 hasta 2026 inclusive».
   */
  test('2610 REPARADO (02/10/2026) — el sello de los límites no atribuye los importes a la Orden HAC/1425/2025', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.nth(1)).toContainText('Límites de exclusión de módulos');
    await expect(referencias.nth(1)).not.toContainText('prorrogados por Orden HAC/1425/2025', { timeout: 1000 });
    await expect(referencias.nth(1)).toContainText('art. 31.1.3.ª');
    await expect(referencias.nth(1)).toContainText('DT 32.ª');
    await expect(referencias.nth(1)).toContainText('La AEAT los aplica para 2026');
  });

  /**
   * Hallazgo 2612 — REPARADO (02/10/2026). La FAQ «¿Qué pasa si supero los límites de módulos?»
   * dice ya que la exclusión, como la renuncia, obliga a la directa «durante los tres años
   * siguientes» (art. 31.1.5.ª LIRPF); hasta ese día decía «al año siguiente». La ficha señalaba
   * también el FAQPage, que solo daba los tres años a la renuncia: se vigila igual.
   */
  test('2612 REPARADO (02/10/2026) — la FAQ y el FAQPage dicen que la exclusión obliga a tres años en directa', async ({ page }) => {
    const faq = (
      (await page.locator('strong', { hasText: '¿Qué pasa si supero los límites de módulos?' }).locator('xpath=..').textContent()) ?? ''
    ).replace(/\s+/g, ' ');
    expect(faq).toContain('excluido');
    expect(faq).toMatch(/tres años|3 años/);

    const faqJson = await page.evaluate(
      () =>
        [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((s) => s.textContent ?? '')
          .find((t) => t.includes('"FAQPage"')) ?? ''
    );
    expect(faqJson).toMatch(/exclusión obliga[^"]*tres años/);
  });

  /**
   * Hallazgo 2613 — REPARADO (02/10/2026), de OTRA FORMA que la que suponía el caso. El rótulo
   * prometía «tu cuota exacta» y el deslizador va de euro en euro: 302,65 € (la mínima de
   * «> 1.300 y ≤ 1.500») se quedaba en 303, y con 302 la app avisaba de que faltaban 7,80 €. El
   * test de la mañana esperaba que el PROPIO deslizador aceptara 302,65; la reparación lo deja de
   * paso 1 € y añade una casilla de texto `#retaExacta` con céntimos, que es lo que el rótulo
   * promete ahora. Se prueba la intención —poder introducir la cuota exacta y que la app la use—
   * con el caso de la ficha (ingresos 25.000, gastos 5.000):
   *   «302,65» → cuota × 12 = 3.631,80 · previo 20.000 − 3.631,80 = 16.368,20 · 5 % = 818,41 →
   *     15.549,79 = base (> 12.000, sin art. 32.2.3.º) · escala 2.365,50 + 3.099,79 × 24 % =
   *     2.365,50 + 743,9496 = 3.109,4496 → 3.109,45 · IRPF 2.054,9496 → 2.054,95 · coste
   *     2.054,9496 + 3.631,80 = 5.686,7496 → 5.686,75 €
   *     Aviso: (15.549,79 + 3.631,80) × 0,93 / 12 = 1.486,57 €/mes → tabla general, tramo 2,
   *     mínima 302,65 € = la cuota → SIN aviso.
   *   Deslizador a 302 → previo 16.376 · −818,80 → 15.557,20 · (15.557,20 + 3.624) × 0,93 / 12 =
   *     1.486,543 → 1.486,54 €/mes, mismo tramo → faltan (302,65 − 302) × 12 = 7,80 €.
   *   «150» (fuera de la tabla, mínima 205,88 €) → la casilla queda inválida y la cuota se mantiene
   *     en 302 € (cuota × 12 = 3.624,00 €).
   */
  test('2613 REPARADO (02/10/2026) — la casilla de la cuota exacta admite 302,65 € y la app la usa', async ({ page }) => {
    const rotulo = await page.locator(`label[for="${CAMPO_RETA_EXACTA.slice(1)}"]`).innerText();
    expect(rotulo).toContain('exacta');
    expect(rotulo).toContain('céntimos');

    await deslizar(page, 'ingresos', 25000);
    await deslizar(page, 'gastos', 5000);
    await escribirRetaExacta(page, '302,65');
    await expect(page.locator(CAMPO_RETA_EXACTA)).toHaveAttribute('aria-invalid', 'false');
    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3631,80 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('16.368,20 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−818,41 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('15.549,79 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('3109,45 €');
    expect(await linea(page, ED, '= IRPF')).toBe('2054,95 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('5686,75 €');
    await sinAvisoReta(page);

    await deslizar(page, 'reta', 302);
    await expect(page.locator(CAMPO_RETA_EXACTA)).toHaveValue('302,00');
    await expect(avisoReta(page)).toContainText('1486,54 €/mes');
    await expect(avisoReta(page)).toContainText('tabla general, tramo 2,');
    await expect(avisoReta(page)).toContainText('302,65 €/mes');
    await expect(avisoReta(page)).toContainText('7,80 €');

    await escribirRetaExacta(page, '150');
    await expect(page.locator(CAMPO_RETA_EXACTA)).toHaveAttribute('aria-invalid', 'true');
    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3624,00 €');
  });

  /**
   * Hallazgo 2614 — REPARADO (02/10/2026). La región viva del aviso de la cuota RETA existe desde
   * la carga dentro del grupo del deslizador, vacía mientras la cuota cuadra, y es ESA MISMA la
   * que recibe el texto al dejar de cuadrar (WCAG 4.1.3). Hasta ese día el `<p aria-live>` se
   * montaba ya con su texto.
   *   Con 500 €/mes: previo 45.000 − 6.000 = 39.000 · 5 % = 1.950 → 37.050 · (37.050 + 6.000) ×
   *     0,93 / 12 = 3.336,375 → 3.336,38 €/mes → tabla general, tramo 9, mínima 478,68 ≤ 500 →
   *     región vacía.
   *   Con 320 €/mes (estado de partida): 3.332,50 €/mes, mismo tramo → aviso de 478,68 €.
   */
  test('2614 REPARADO (02/10/2026) — el grupo de la cuota RETA tiene una región viva antes de que aparezca el aviso, y es la que lo recibe', async ({
    page,
  }) => {
    await deslizar(page, 'reta', 500);
    await sinAvisoReta(page);
    const grupo = page.locator('label[for="reta"]').locator('xpath=..');
    expect(await grupo.locator('[aria-live], [role="status"], [role="alert"]').count()).toBeGreaterThan(0);

    const region = await avisoReta(page).elementHandle();
    await deslizar(page, 'reta', 320);
    await expect(avisoReta(page)).toContainText('478,68 €/mes');
    const misma = await region.evaluate((el) => el.isConnected && (el.textContent ?? '').includes('478,68'));
    expect(misma, 'el aviso llegó a otro nodo, no a la región viva que ya existía').toBe(true);
  });
});

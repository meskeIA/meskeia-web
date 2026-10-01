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
 * De dónde sale cada cifra esperada (todas resueltas a mano ANTES de ejecutar)
 * ─────────────────────────────────
 *  · Escala — `TRAMOS_IRPF_2025` (data/fiscal/irpf.ts): 19 % hasta 12.450 · 24 % hasta 20.200 ·
 *    30 % hasta 35.200 · 37 % hasta 60.000 · 45 % hasta 300.000. Acumulados: escala(12.450) =
 *    2.365,50 · escala(20.200) = 4.225,50 · escala(35.200) = 8.725,50 · escala(60.000) = 17.901,50.
 *  · Mínimo personal — `MINIMOS_IRPF_2025.personal` = 5.550 €; escala(5.550) = 1.054,50. Se grava
 *    a tipo cero (art. 63.1.2.º LIRPF, `calcularCuotaIntegraGeneral`), nunca se resta de la base.
 *  · Directa — previo = max(0, ingresos − gastos − RETA × 12) (la cuota del titular es gasto
 *    deducible, hallazgo 2444) · − 5 % con tope de 2.000 € (`GASTOS_DIFICIL_JUSTIFICACION_EDS`,
 *    art. 30.2.ª RIRPF) · = base · + RETA × 12 al coste.
 *  · Módulos — rendimiento tecleado · − 5 % SIN tope (`REDUCCION_GENERAL_MODULOS`, DA 1.ª Orden
 *    HAC/1425/2025, hallazgo 2445) · = base · + RETA × 12 al coste (aquí no se deduce).
 *  · Límites — `LIMITES_EXCLUSION_MODULOS_2025`: 250.000 € de ingresos y 250.000 € de compras
 *    (los gastos hacen de aproximación); «supera», así que 250.000 clavados siguen dentro.
 *  · Tramos RETA — `TRAMOS_RETA_2025` + `tramoRETA()` (data/fiscal/autonomos.ts).
 *
 * Formato: `formatCurrency` (es-ES) no agrupa millares con 4 cifras enteras (6723,00 €) y sí
 * desde 5 (20.376,20 €), como manda la RAE. El signo de resta de la plantilla es «−» (U+2212).
 */
import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

const RUTA = '/simulador-modulos-vs-directa/';

/** Los tres deslizadores y el campo del rendimiento de módulos: los cuatro controles de la app. */
const CAMPO_MODULOS = '#rendimientoModulos';
const ENTRADAS = ['#ingresos', '#gastos', '#reta', CAMPO_MODULOS];

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
const deslizar = (page: Page, id: string, valor: number) => sembrarValorAcotado(page, `#${id}`, valor);

/** Teclea el rendimiento neto de módulos y comprueba que el estado de React lo recogió. */
const escribirModulos = (page: Page, texto: string) => sembrarValor(page, CAMPO_MODULOS, texto);

/** La caja de la diferencia (role="status"): un dato, nunca un veredicto. */
const estado = (page: Page) => page.locator('[role="status"]');

/** El aviso de coherencia de la cuota RETA (el de la app, no el anunciador de rutas). */
const avisoReta = (page: Page) => page.locator('[aria-live="polite"]').filter({ hasText: 'tabla del RETA' });

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
   *   «abc» y «1e3» → no son un importe (parseSpanishNumber devuelve NaN) · «-5.000» → negativo.
   *   En los tres, la columna de módulos queda sin cifras.
   * Y lo válido se lee en formato español: «12.000» son doce mil (no 12). Estado de partida:
   *   12.000 − 5 % (600,00) = 11.400 · escala(11.400) = 11.400 × 19 % = 2.166,00 (primer tramo)
   *   IRPF 2.166,00 − 1.054,50 = 1.111,50 · coste 1.111,50 + 3.840 = 4.951,50 €
   *   diferencia 12.976,20 − 4.951,50 = 8.024,70 €.
   * Vaciar el campo devuelve al estado sin dato, sin aviso.
   */
  test('RECHAZO — «abc», «1e3» y «-5.000» avisan y no dan cifra; «12.000» son doce mil', async ({ page }) => {
    const campo = page.locator(CAMPO_MODULOS);
    // El aviso del campo (role="alert"), no la DisclaimerCard ni el anunciador de rutas.
    const alerta = page.locator('[role="alert"]').filter({ hasText: /no es un importe|no puede ser negativo/ });

    for (const [texto, motivo] of [
      ['abc', 'no es un importe'],
      ['1e3', 'no es un importe'],
      ['-5.000', 'no puede ser negativo'],
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

    await escribirModulos(page, '12.000');
    await expect(alerta).toHaveCount(0);
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
    expect(await linea(page, MOD, 'Rendimiento neto de módulos (tu dato)')).toBe('12.000,00 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−600,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('11.400,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('2166,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('1111,50 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('4951,50 €');
    await expect(estado(page)).toContainText('8024,70 €');

    await escribirModulos(page, '');
    await expect(alerta).toHaveCount(0);
    expect(await panel(page, MOD)).toContain('Falta tu rendimiento neto de módulos');
  });

  /**
   * LÍMITE (ingresos) — 250.000 € clavados siguen dentro; 251.000 € excluyen aunque haya dato.
   * Ingresos 250.000, gastos 0, RETA 206 (suelo del deslizador), módulos «10.000».
   *   Directa: 250.000 − 0 − 2.472 = 247.528 · −2.000 → 245.528
   *     escala = 17.901,50 + 185.528 × 45 % = 17.901,50 + 83.487,60 = 101.389,10
   *     IRPF 100.334,60 · coste 100.334,60 + 2.472 = 102.806,60 €
   *     (el mínimo cae entero en el 45 %: restarlo de la base daría 1.443,00 € menos)
   *   Módulos: 10.000 − 500,00 = 9.500 · escala 9.500 × 19 % = 1.805,00 · IRPF 750,50
   *     coste 750,50 + 2.472 = 3.222,50 € · diferencia 102.806,60 − 3.222,50 = 99.584,10 €
   */
  test('LÍMITE — 250.000 € de ingresos aún calcula módulos (3222,50 €); 251.000 € excluye aunque haya dato', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 206);
    await escribirModulos(page, '10.000');

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('245.528,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('101.389,10 €');
    expect(await linea(page, ED, '= IRPF')).toBe('100.334,60 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('102.806,60 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−500,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1805,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('750,50 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3222,50 €');
    expect(await panel(page, MOD)).not.toContain('superan los límites de exclusión');
    await expect(estado(page)).toContainText('99.584,10 €');

    await deslizar(page, 'ingresos', 251000);
    const mod = await panel(page, MOD);
    expect(mod).toContain('Ingresos o gastos superan los límites de exclusión');
    expect(mod).not.toContain('Coste fiscal anual total');
    await expect(estado(page)).toContainText('no hay comparación de importes');
  });

  /**
   * LÍMITE (compras) — gastos de 250.000 € dentro, 250.500 € fuera. Ingresos 250.000, RETA 206,
   * módulos «10.000».
   *   Directa: max(0, 250.000 − 250.000 − 2.472) = 0 → IRPF 0 → coste 2.472,00 €
   *   Módulos: 3.222,50 € (caso anterior) → diferencia 2.472,00 − 3.222,50 = −750,50: «… es
   *   750,50 € menor que en módulos». Un paso más del deslizador y quedan excluidos.
   */
  test('LÍMITE — compras de 250.000 € aún calculan (directa 750,50 € menor); 250.500 € excluyen', async ({ page }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 250000);
    await deslizar(page, 'reta', 206);
    await escribirModulos(page, '10.000');

    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('2472,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3222,50 €');
    await expect(estado(page)).toContainText('750,50 €');
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

    // Los controles que quedan son exactamente cuatro, y los cuatro mueven el resultado.
    await expect(page.locator('main input')).toHaveCount(4);
    const resultado = page.locator('h2', { hasText: 'Coste anual en cada régimen' }).locator('xpath=..');
    const mover: Array<[string, () => Promise<unknown>]> = [
      [CAMPO_MODULOS, () => escribirModulos(page, '15.000')],
      ['#ingresos', () => deslizar(page, 'ingresos', 80000)],
      ['#gastos', () => deslizar(page, 'gastos', 30000)],
      ['#reta', () => deslizar(page, 'reta', 400)],
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
   */
  test('tramo del 45 % — 200.000/0/600: IRPF 75.707,00 € y coste 82.907,00 €', async ({ page }) => {
    await deslizar(page, 'ingresos', 200000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 600);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('192.800,00 €');
    expect(await linea(page, ED, '= Rendimiento neto reducido')).toBe('190.800,00 €');
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
   * Ingresos 30.000 €, gastos 18.000 €, RETA 320 €/mes, módulos «10.500».
   *   Directa: 30.000 − 18.000 − 3.840 = 8.160 · 5 % = 408 → 7.752 · IRPF 1.472,88 − 1.054,50
   *     = 418,38 · coste 4.258,38 € (sin deducir la cuota salía 1.111,50 de IRPF y 4.951,50 €)
   *   Módulos: 10.500 − 525,00 = 9.975 · IRPF 1.895,25 − 1.054,50 = 840,75 · coste 4.680,75 €
   *   Diferencia 4.258,38 − 4.680,75 = −422,37 → «… es 422,37 € menor que en módulos».
   */
  test('HALLAZGO R (REPARADO el 29/09/2026) — la cuota RETA es gasto deducible en ED: 30.000/18.000/320', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 30000);
    await deslizar(page, 'gastos', 18000);
    await escribirModulos(page, '10.500');

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3840,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('8160,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−408,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('7752,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('418,38 €');
    expect(await linea(page, ED, '+ Cuota RETA × 12 (la pagas igual)')).toBe('+3840,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('4258,38 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('840,75 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('4680,75 €');

    await expect(estado(page)).toContainText('422,37 €');
    await expect(estado(page)).toContainText('menor que en módulos');
  });

  /**
   * La cuota RETA lleva el rendimiento de ED justo a cero y luego por debajo. Ingresos 40.000 €,
   * gastos 37.000 €: ingresos − gastos = 3.000 €.
   *   RETA 250 €/mes → 3.000 − 3.000 = 0: reducción 0,00, base 0, IRPF 0, coste 3.000,00 €.
   *   RETA 300 €/mes → −600, acotado a 0: IRPF 0, coste 3.600,00 €.
   * Aviso RETA: rendimiento mensual 0 y −50, los dos ≤ 0 → no hay aviso.
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
    await expect(avisoReta(page)).toHaveCount(0);

    await deslizar(page, 'reta', 300);
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3600,00 €');
    await expect(avisoReta(page)).toHaveCount(0);
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
   *   Aviso: (20.000 − 2.472)/12 = 1.460,67 €/mes → tramo 5, cuota mínima 302,65 € →
   *     déficit (302,65 − 206) × 12 = 1.159,80 €.
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
    await expect(avisoReta(page)).toContainText('1460,67 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 5');
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

    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).toContainText('27/09/2026');
    await expect(referencias.first()).toContainText('arts. 19, 20, 56 a 66, 84.2 y 96');
    await expect(referencias.nth(1)).toContainText('02/09/2026');
    await expect(referencias.nth(1)).toContainText('Orden HAC/1425/2025');
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
      expect(rotulo).toContain('5\u00A0%');
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
    // Estado de partida: (45.000 − 3.840)/12 = 3.430,00 €/mes → tramo 12, cuota mínima
    // 478,68 €/mes. Faltan (478,68 − 320) × 12 = 1.904,16 €/año.
    const aviso = page.locator('[aria-live="polite"]').filter({ hasText: 'tramo' });
    await expect(aviso).toContainText('478,68');
    await expect(aviso).toContainText('tramo 12');
    await expect(aviso).toContainText('1904,16');

    // Con 479 €/mes el rendimiento baja a 3.271,00 €/mes, sigue en el tramo 12: sin aviso.
    await sembrarValor(page, '#reta', 479);
    await expect(aviso).toHaveCount(0);
  });

  /**
   * Comercio 60.000/30.000/402 (re-inspección del 29/09): (30.000 − 4.824)/12 = 2.098 €/mes →
   * tramo 9, cuota mínima 401,47 € → sin aviso. ED: previo 25.176 · 5 % 1.258,80 → 23.917,20 ·
   * escala 4.225,50 + 3.717,20 × 30 % = 5.340,66 · IRPF 4.286,16 · coste 9.110,16 €.
   * Con 401 €: 2.099 €/mes, tramo 9, faltan (401,47 − 401) × 12 = 5,64 €/año.
   */
  test('RETA 402 € coherente con el tramo 9 y 401 € no — ED 9110,16 €', async ({ page }) => {
    await deslizar(page, 'ingresos', 60000);
    await deslizar(page, 'gastos', 30000);
    await deslizar(page, 'reta', 402);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('25.176,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−1258,80 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('23.917,20 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('5340,66 €');
    expect(await linea(page, ED, '= IRPF')).toBe('4286,16 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('9110,16 €');
    await expect(avisoReta(page)).toHaveCount(0);

    await deslizar(page, 'reta', 401);
    await expect(avisoReta(page)).toContainText('2099,00 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 9');
    await expect(avisoReta(page)).toContainText('401,47 €/mes');
    await expect(avisoReta(page)).toContainText('5,64 €');
  });

  /**
   * Frontera de 1.850 €/mes entre los tramos 7 y 8 del RETA (cerrada por ARRIBA desde c7af89ec):
   *   30.000/4.500/275 → (25.500 − 3.300)/12 = 1.850,00 €/mes → tramo 7, 360,29 € → déficit 1.023,48 €
   *   274 € → 1.851,00 €/mes → tramo 8, 380,88 € → déficit (380,88 − 274) × 12 = 1.282,56 €
   */
  test('1.850 €/mes es tramo 7 (360,29 €) y 1.851 €/mes es tramo 8 (380,88 €)', async ({ page }) => {
    await deslizar(page, 'ingresos', 30000);
    await deslizar(page, 'gastos', 4500);
    await deslizar(page, 'reta', 275);

    await expect(avisoReta(page)).toContainText('1850,00 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 7');
    await expect(avisoReta(page)).toContainText('360,29 €/mes');
    await expect(avisoReta(page)).toContainText('1023,48 €');

    await deslizar(page, 'reta', 274);
    await expect(avisoReta(page)).toContainText('1851,00 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 8');
    await expect(avisoReta(page)).toContainText('380,88 €/mes');
    await expect(avisoReta(page)).toContainText('1282,56 €');
  });

  /**
   * Re-inspección del 01/10/2026, CASO 1 — ingresos 120.000 €, gastos 50.000 €, RETA 500 €/mes.
   *   ED: 120.000 − 50.000 − 6.000 = 64.000 · −2.000 → 62.000 · escala 17.901,50 + 2.000 × 45 %
   *     = 18.801,50 · IRPF 17.747,00 · coste 23.747,00 €
   *   Aviso RETA: (70.000 − 6.000)/12 = 5.333,33 €/mes → tramo 14, mínima 545,59 € → 547,08 €/año.
   */
  test('120.000/50.000/500: ED 23.747,00 € y aviso RETA del tramo 14', async ({ page }) => {
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

    await expect(avisoReta(page)).toContainText('5333,33 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 14');
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

  /** Hallazgo 2547 — REPARADO (01/10/2026): ninguna nota visible enseña un identificador de código. */
  test('[RETA] ninguna nota visible enseña un identificador de código', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).not.toContainText(/[A-Z]+_[A-Z_]+\d{4}/, { timeout: 1000 });
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

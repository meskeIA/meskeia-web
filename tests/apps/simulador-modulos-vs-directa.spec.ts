/**
 * Inspector — simulador-modulos-vs-directa (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * RE-INSPECCIÓN del 31/08/2026 (independiente de la tanda anterior, commit 16713728,
 * que ya reparó 5 hallazgos de esta app). Compara Estimación Directa Simplificada (ED)
 * vs Estimación Objetiva (Módulos) para autónomos: IRPF por tramos + cuota RETA anual,
 * con 4 casos preconfigurados y un selector de 5 actividades para módulos.
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *  IRPF (la escala que decide la ED y la parte final de módulos) — `data/fiscal/irpf.ts`,
 *  `TRAMOS_IRPF_2025` (FISCAL_IRPF_META: Ley 35/2006 IRPF texto consolidado arts. 57-66,
 *  verificado 2026-08-12): 19% hasta 12.450 · 24% hasta 20.200 · 30% hasta 35.200 ·
 *  37% hasta 60.000 · 45% hasta 300.000 · 47% en adelante.
 *  Mínimo personal — `MINIMOS_IRPF_2025.personal` = 5.550 € (mismo módulo), que la app SÍ
 *  importa desde 16713728 (antes lo tenía hardcodeado con el mismo valor).
 *
 *  ⚠️ El lado de MÓDULOS sigue sin ancla en `data/fiscal`: no existe ningún módulo con
 *  coeficientes reales de Estimación Objetiva por actividad. El propio código lo admite
 *  ("Fórmulas didácticas orientativas por actividad — NO son los módulos reales") y el
 *  <DataReference> de la página lo repite igual, así que las cifras de módulos de estos
 *  tests verifican que la app aplica CORRECTAMENTE su propia fórmula documentada — no que
 *  esa fórmula sea la Orden HFP real, que no existe en el repositorio.
 *
 * Fórmulas de módulos usadas por la app (page.tsx, `calcularRendimientoModulos`):
 *   bar:  1.500 €/mesa + 800 €/asalariado + 6 €/m² + 0,05 €/kWh
 *   taxi: 6.800 €/vehículo afecto
 * Reducciones de módulos: 5% (tope 2.000 €) + 100 €/asalariado (incentivo empleo).
 *
 * Formato: `formatCurrency` (es-ES) NO agrupa millares en importes de 4 dígitos enteros
 * (5250,18 €) pero SÍ desde 5 dígitos (20.798,00 €) — mismo comportamiento ya documentado
 * en el spec de estimador-sueldo-neto. Las cifras esperadas están tomadas literales del
 * DOM tras verificarlas por aritmética independiente (ver comentario de cada caso).
 *
 * Hallazgos de esta re-inspección (ver acta — no se reparan aquí, solo se anclan casos):
 *  · "contenido" — `metadata.ts` (jsonLd.features) promete "Cálculo IRPF + RETA + IVA
 *    orientativo", pero la app NUNCA calcula IVA: no hay estado, fórmula ni cifra de IVA
 *    en ningún sitio de page.tsx, solo texto descriptivo sobre el régimen de IVA.
 *  · "dato" — los umbrales de exclusión de módulos (250.000 €/150.000 € de ingresos/gastos,
 *    50% clientes empresa) están escritos a mano en tres sitios (tabla comparativa, FAQ del
 *    bloque educativo, FAQ de metadata.ts) sin módulo propio en `data/fiscal/` (no existe
 *    ninguno con "modulos" ni "Orden HFP" en su contenido) y el código nunca los aplica:
 *    `esApta` no comprueba ingresos/gastos, solo si hay parámetros físicos > 0.
 */
import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

const RUTA = '/simulador-modulos-vs-directa/';

/** Los tres deslizadores que existen con cualquier actividad (#veh solo lo pinta taxi). */
const DESLIZADORES = ['#ingresos', '#gastos', '#reta'];

const ED = 'Estimación Directa Simplificada';
const MOD = 'Estimación Objetiva (Módulos)';

/** Texto completo de una de las dos columnas de resultado (ED o Módulos). */
async function panel(page: Page, tituloH3: string): Promise<string> {
  const contenedor = page.locator('h3', { hasText: tituloH3 }).first().locator('xpath=..');
  return (await contenedor.innerText()).replace(/\s+/g, ' ').trim();
}

/**
 * Igual que `linea`, pero localizando por el PRINCIPIO de la etiqueta. Hace falta para la
 * línea de la escala aplicada al mínimo, cuyo rótulo lleva el importe del mínimo interpolado.
 */
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

/**
 * Mueve un input[type=range] controlado por React (fill() no dispara su onChange) y comprueba
 * que el estado de React lo recogió. #veh solo existe con la actividad Taxi, pero nace
 * hidratado porque React lo monta después: `sembrarValor` lo espera por su cuenta.
 */
async function mover(page: Page, id: string, valor: number): Promise<void> {
  await sembrarValor(page, `#${id}`, valor);
}

test.describe('Simulador Módulos vs Estimación Directa — re-inspección 31/08/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    // Ni un clic en un preset ni un movimiento de deslizador llegan a React antes de que
    // haya hidratado: el botón está pintado pero sin manejador (ver _hidratacion.ts).
    await esperarHidratacion(page, DESLIZADORES);
  });

  /**
   * CASO 1 (NORMAL) — preset "Bar pequeño rentable": ingresos 90.000 €, gastos 25.000 €,
   * RETA 320 €/mes; bar con 1 asalariado, 1 no asalariado, 60 m², 12.000 kWh, 8 mesas.
   *
   * ED (ancla: TRAMOS_IRPF_2025 + MINIMOS_IRPF_2025.personal):
   *   Rendimiento neto previo = 90.000 − 25.000 = 65.000
   *   − Reducción 5% (tope 2.000)                 = −2.000  → reducido 63.000
   *   Base liquidable = 63.000, CON el mínimo dentro (art. 63.1.2º: el mínimo NO se resta)
   *   escala(63.000) = 2.365,50+1.860,00+4.500,00+9.176,00 + 3.000×45%
   *                  = 17.901,50 + 1.350,00 = 19.251,50
   *   escala(5.550)  = 1.054,50   →   IRPF = 18.197,00
   *   + RETA 320×12 = 3.840,00  →  Coste ED = 22.037,00 €
   *
   * Módulos (fórmula propia de la app, NO oficial — ver cabecera):
   *   Rendimiento previo = 1.500×8 + 800×1 + 6×60 + 0,05×12.000 = 12.000+800+360+600 = 13.760
   *   − Reducción 5% (tope 2.000) = −688,00  · − incentivo empleo (1×100) = −100,00
   *   Reducido = 12.972 = base liquidable, con el mínimo dentro
   *   escala(12.972) = 12.450×19% + 522×24% = 2.365,50 + 125,28 = 2.490,78
   *   escala(5.550)  = 1.054,50   →   IRPF = 1.436,28
   *   + RETA 3.840,00  →  Coste Módulos = 5.276,28 €
   *
   * Diferencia = 22.037,00 − 5.276,28 = 16.760,72 → módulos gana ("MENOS con módulos").
   *
   * ⚠️ GOLDENS RECALCULADOS EL 12/09/2026. Los anteriores estaban derivados del método
   * DEFECTUOSO (restar el mínimo de la base antes de la escala) y por eso cuadraban con la
   * app: los dos estaban mal a la vez. Se han vuelto a resolver a mano desde el art. 63.1.2º
   * LIRPF, verificado en sesión contra la AEAT (manual de ayuda de Renta 2025, «8.4.3.1
   * Cuota íntegra estatal»). En la columna de ED el IRPF sube 1.239,00 € y en la de módulos
   * 26,10 €; en el CASO 2 la de módulos no se mueve, y el porqué se explica allí.
   */
  test('CASO 1 (normal) — bar rentable: ED 22.037,00 € vs Módulos 5.276,28 €, gana módulos', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Aplicar caso Bar pequeño rentable/ }).click();

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('65.000,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('63.000,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('19.251,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('18.197,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('22.037,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('13.760,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('12.972,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('2490,78 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('1436,28 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('5276,28 €');
    // Con mesas > 0, la app declara la actividad apta para módulos (sin aviso de exclusión)
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('16.760,72 € MENOS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Objetiva \(Módulos\)/
    );
  });

  /**
   * CASO 2 (LÍMITE) — tramo superior de IRPF (45%) con ingresos 200.000 € (por debajo del
   * límite de exclusión de módulos, 250.000 €), gastos 0 €, RETA 600 €/mes, actividad Taxi
   * con vehículo afecto = 1 (el único parámetro que taxi expone). Con 200.000 € de base
   * imponible no se alcanza el tramo del 47% (desde 300.000 €), así que el tramo más alto
   * ejercitado aquí es el 45%.
   *
   * ED (ancla: TRAMOS_IRPF_2025):
   *   Rendimiento neto previo = 200.000 − 0 = 200.000
   *   − Reducción 5% (tope 2.000, porque 200.000×5%=10.000 > tope) → reducido 198.000
   *   Base liquidable = 198.000, CON el mínimo dentro
   *   escala(198.000) = 17.901,50 (acumulado hasta 60.000) + 138.000×45%
   *                   = 17.901,50 + 62.100,00 = 80.001,50
   *   escala(5.550)   = 1.054,50   →   IRPF = 78.947,00
   *   + RETA 600×12 = 7.200,00 → Coste ED = 86.147,00 €
   *
   *   El mínimo cae aquí ENTERO en el tramo del 45 %, así que este es el caso donde el
   *   método viejo más subestimaba: 5.550 × (45 − 19) % = 1.443,00 €/año, su techo.
   *
   * Módulos (taxi, fórmula propia — ver cabecera): 6.800 × vehículo(1) = 6.800
   *   − Reducción 5% (min(340,2000)) = −340,00 · − incentivo empleo (taxi no expone
   *   personal asalariado → 0) = −0,00 → reducido 6.460 = base liquidable
   *   escala(6.460) = 6.460 × 19% = 1.227,40 · escala(5.550) = 1.054,50 → IRPF = 172,90
   *   + RETA 7.200,00 → Coste Módulos = 7.372,90 €
   *
   *   Esta columna NO cambia con la reparación, y eso se comprueba a propósito: base y
   *   mínimo caen los dos dentro del primer tramo, donde escala(B) − escala(m) y
   *   escala(B − m) valen exactamente lo mismo. Los dos métodos solo divergen cuando la
   *   base cruza de tramo — que es justo lo que ocurre en la columna de al lado.
   *
   * Diferencia = 86.147,00 − 7.372,90 = 78.774,10 → módulos gana con muchísimo margen,
   * porque el rendimiento estimado de un taxi (6.800 €) es minúsculo frente al beneficio
   * real de 200.000 € que tributa por tramos hasta el 45%.
   */
  test('CASO 2 (límite, tramo 45% IRPF) — sliders al máximo + Taxi: ED 86.147,00 € vs Módulos 7.372,90 €', async ({
    page,
  }) => {
    await mover(page, 'ingresos', 200000);
    await mover(page, 'gastos', 0);
    await mover(page, 'reta', 600);
    await page.getByRole('radio', { name: /Taxi \(autotaxi\)/ }).click();
    await mover(page, 'veh', 1);

    expect(await linea(page, ED, '= Rendimiento neto reducido')).toBe('198.000,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('198.000,00 €');
    // Tramo 45% ejercitado: sin él (parando en 37%) la escala daría 17.901,50 €, no 80.001,50 €
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('80.001,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('78.947,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('86.147,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('6800,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('6460,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1227,40 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('172,90 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('7372,90 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('78.774,10 € MENOS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Objetiva \(Módulos\)/
    );
  });

  /**
   * CASO 3 (RECHAZO) — preset "Profesional puro" (0 asalariados, 0 m², 0 mesas, 0 vehículo,
   * comercio_menor). El propio preset lo etiqueta en la UI como "NO puede acogerse a
   * módulos — solo ED", y la app marca `esApta = false` (heurística `tieneParametros`:
   * ningún parámetro físico > 0) y pinta el aviso "NO es elegible para módulos".
   *
   * Verifica que sigue en pie la reparación del hallazgo 552 (crítico, tanda 16713728):
   * la caja de recomendación y la de diferencia comprueban `resModulos.esApta` antes de
   * comparar importes — con esApta=false, la única recomendación es Estimación Directa y
   * la caja de diferencia NO anuncia un ahorro con un régimen que el propio cálculo excluye.
   *
   * ED (ancla: TRAMOS_IRPF_2025): ingresos 50.000, gastos 8.000 → rendimiento 42.000
   *   − Reducción 5% (tope 2.000) = −2.000 → reducido 40.000 = base liquidable
   *   escala(40.000) = 8.725,50 (acumulado hasta 35.200) + 4.800×37% = 8.725,50 + 1.776,00
   *                  = 10.501,50 · escala(5.550) = 1.054,50 → IRPF = 9.447,00
   *   + RETA 300×12 = 3.600,00 → Coste ED = 13.047,00 €
   *
   * Módulos (comercio_menor, personalAsalariado=0, personalNoAsalariado=1, superficie=0):
   *   Rendimiento previo = 4.500×1 + 1.000×0 + 8×0 = 4.500
   *   − Reducción 5% (min(225,2000)) = −225,00 · − incentivo empleo (0×100) = 0,00
   *   Reducido = 4.275 = base liquidable, que es MENOR que el mínimo de 5.550 €
   *   Art. 56.2: el mínimo se aplica «hasta el importe de esta última», así que se acota a
   *   la base y la cuota es cero, nunca negativa: escala(4.275) − escala(4.275) = 0,00 €
   *   IRPF = 0,00 · + RETA 3.600,00 → Coste Módulos = 3.600,00 € (cifra que la app YA NO
   *   anuncia como ahorro, porque `esApta` es false)
   */
  test('CASO 3 (rechazo) — "profesional puro" no apto para módulos: recomienda ED sin comparar importes', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Aplicar caso Profesional puro/ }).click();

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('40.000,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('10.501,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('9447,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('13.047,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('4500,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('4275,00 €');
    // La base no llega al mínimo: la escala aplicada al mínimo se acota a ella y la cuota es 0.
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('812,25 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Escala sobre el mínimo personal')).toBe('−812,25 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3600,00 €');

    // La app avisa de que la actividad no es elegible para módulos...
    expect(await panel(page, MOD)).toContain('NO es elegible para módulos');

    // ...y la caja de diferencia y la recomendación respetan ese aviso: no comparan
    // importes ni aconsejan un régimen que el propio cálculo acaba de excluir.
    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('no parece elegible para módulos');
    expect(estado).not.toMatch(/Pagas/);

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
    expect(cuerpo).not.toMatch(/te conviene más: Estimación Objetiva \(Módulos\)/);
  });

  /**
   * Guarda de regresión (hallazgo 554, alto, tanda 16713728) — estado inicial de la
   * página: bar con mesas=6, personalAsalariado=1. Clic directo en el radio "Taxi
   * (autotaxi)" SIN tocar ningún slider. Antes de la reparación, `cambiarActividad` solo
   * sustituía el campo `actividad` y dejaba mesas/personalAsalariado heredados del bar,
   * así que taxi salía "apta" (por las mesas del bar) con una reducción de empleo que taxi
   * ni siquiera expone. Sigue reparado: los campos que la actividad nueva no muestra se
   * reinician a 0.
   */
  test('Guarda 554 — bar→taxi sin tocar sliders: taxi no hereda mesas/personal del bar', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Taxi \(autotaxi\)/ }).click();

    expect(await panel(page, MOD)).toContain('NO es elegible para módulos');
    expect(await linea(page, MOD, '− Reducción incentivos al empleo')).toBe('−0,00 €');

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
  });

  /**
   * Guarda de regresión (hallazgo 555, tanda 16713728) — el <DataReference> cita ahora
   * IRPF 2025 (lo único que el motor realmente calcula) y su nota aclara qué SÍ y qué NO
   * está anclado a normativa (módulos = fórmula didáctica, RETA = entrada libre).
   */
  test('DataReference cita la fuente de lo que realmente se calcula (IRPF)', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias).toHaveCount(2);
    await expect(referencias.first()).toContainText('IRPF 2025');
    await expect(referencias.first()).toContainText('fórmula didáctica simplificada');
  });

  /**
   * Hallazgo 567 (reparado 02/09/2026) — los umbrales de exclusión de módulos ahora viven
   * en data/fiscal/modulos-irpf.ts (LIMITES_EXCLUSION_MODULOS_2025: 250.000 € ingresos,
   * 125.000 € facturación a empresas, 250.000 € compras) y `esApta` los aplica de verdad:
   * con parámetros físicos válidos pero ingresos por encima de 250.000 €, la actividad deja
   * de ser apta aunque antes de la reparación SÍ lo fuera (bastaba con mesas > 0).
   */
  test('Hallazgo 567 (reparado) — superar el límite de ingresos excluye de módulos aunque haya parámetros físicos', async ({ page }) => {
    // Segundo DataReference: cita los límites de exclusión, no el de IRPF.
    const referenciaLimites = page.locator('[aria-label="Datos de referencia normativos"]').nth(1);
    await expect(referenciaLimites).toContainText('Límites de exclusión de módulos');
    await expect(referenciaLimites).toContainText('125.000');

    await page.getByRole('button', { name: /Aplicar caso Bar pequeño rentable/ }).click();
    // Preset original: mesas=8, ingresos=90.000 → apto.
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    // Subir ingresos por encima de 250.000 € sin tocar el resto de parámetros.
    await mover(page, 'ingresos', 260000);
    expect(await panel(page, MOD)).toContain('Ingresos o gastos superan los límites de exclusión');
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RE-INSPECCIÓN del 12/09/2026 — la cola invalidó la del 31/08 porque el commit
 * 6dda61c2 reescribió `lib/calculadoras/modulosVsDirecta.ts`, `data/fiscal/irpf.ts` y
 * el bloque de cálculo de esta app: el mínimo personal dejó de restarse de la base.
 *
 * Estos tres casos son NUEVOS (no tocan ni repiten los de arriba) y están resueltos a
 * mano ANTES de ejecutar la app. Los tres atacan la cuota por la vía del art. 63.1.2º
 * LIRPF: escala sobre la base liquidable completa (con el mínimo dentro), escala sobre
 * el mínimo, y resta de la segunda a la primera.
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *  · Escala — `TRAMOS_IRPF_2025` de `data/fiscal/irpf.ts` (FISCAL_IRPF_META: Ley 35/2006
 *    del IRPF, texto consolidado arts. 57 a 66; verificado 2026-09-09):
 *    19 % hasta 12.450 · 24 % hasta 20.200 · 30 % hasta 35.200 · 37 % hasta 60.000 ·
 *    45 % hasta 300.000 · 47 % en adelante. Acumulados que se reutilizan abajo:
 *    escala(12.450) = 2.365,50 · escala(20.200) = 4.225,50 · escala(35.200) = 8.725,50 ·
 *    escala(60.000) = 17.901,50.
 *  · Mínimo personal — `MINIMOS_IRPF_2025.personal` = 5.550 €, del mismo módulo.
 *    escala(5.550) = 5.550 × 19 % = 1.054,50 € en los tres casos.
 *  · Umbral de exclusión de módulos — `LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades`
 *    = 250.000 € de `data/fiscal/modulos-irpf.ts` (FISCAL_MODULOS_IRPF_META: art. 31 Ley
 *    35/2006 + art. 32 RD 439/2007, prorrogados por la Orden HAC/1425/2025; verificado
 *    2026-09-02). La comparación del código es `<=`, así que 250.000 € clavados SÍ es apto.
 *  · El lado de MÓDULOS (1.500 €/mesa, 5.500 €/asalariado en peluquería…) sigue sin ancla
 *    normativa: son las fórmulas didácticas que la propia app declara como tales. Estos
 *    tests verifican que la app aplica correctamente SU fórmula documentada, no que esa
 *    fórmula sea la Orden HFP (ver cabecera del fichero).
 *
 * Formato: `formatCurrency` (es-ES) no agrupa millares con 4 dígitos enteros (9058,50 €)
 * y sí desde 5 (36.100,00 €). El signo de resta de la plantilla es «−» (U+2212).
 */
test.describe('Simulador Módulos vs Estimación Directa — re-inspección 12/09/2026', () => {
  /** Los deslizadores capan y ajustan al paso: se siembra con el helper acotado. */
  const deslizar = (page: Page, id: string, valor: number) =>
    sembrarValorAcotado(page, `#${id}`, valor);

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  /**
   * CASO A (NORMAL, ataca el mínimo personal) — peluquería con ingresos 50.000 €, gastos
   * 12.000 €, RETA 300 €/mes, 1 asalariado, 1 no asalariado y 40 m².
   *
   * ED:
   *   Rendimiento neto previo = 50.000 − 12.000 = 38.000
   *   − Reducción 5 % (1.900, por debajo del tope de 2.000) → reducido 36.100
   *   Base liquidable general = 36.100, CON el mínimo dentro (art. 63.1.2º)
   *   escala(36.100) = 8.725,50 + (36.100 − 35.200) × 37 % = 8.725,50 + 333,00 = 9.058,50
   *   escala(5.550)  = 1.054,50   →   IRPF = 9.058,50 − 1.054,50 = 8.004,00
   *   + RETA 300 × 12 = 3.600,00  →  Coste ED = 11.604,00 €
   *
   *   ⚠️ Este es el caso que DISCRIMINA el método: restando el mínimo de la base
   *   —escala(36.100 − 5.550) = escala(30.550) = 4.225,50 + (30.550 − 20.200) × 30 %
   *   = 7.330,50— la cuota saldría 673,50 € más baja, porque valora el mínimo al tipo
   *   marginal (4.650 al 30 % + 900 al 37 % = 1.728) en vez de al 19 % de la escala.
   *
   * Módulos (fórmula didáctica de la app: 5.500 €/asalariado + 2.000 €/no asalariado + 7 €/m²):
   *   Rendimiento previo = 5.500 + 2.000 + 7 × 40 = 7.780
   *   − 5 % (389,00) − incentivo empleo (1 × 100) → reducido 7.291 = base liquidable
   *   escala(7.291) = 7.291 × 19 % = 1.385,29 · escala(5.550) = 1.054,50 → IRPF = 330,79
   *   + RETA 3.600,00 → Coste Módulos = 3.930,79 €
   *
   * Diferencia = 11.604,00 − 3.930,79 = 7.673,21 € a favor de módulos.
   */
  test('CASO A (normal) — peluquería 50.000/12.000: el mínimo se grava a tipo cero, IRPF 8004,00 € y no 7330,50 €', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Peluquería/ }).click();
    await deslizar(page, 'ingresos', 50000);
    await deslizar(page, 'gastos', 12000);
    await deslizar(page, 'reta', 300);
    await deslizar(page, 'sup', 40);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('38.000,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('36.100,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('9058,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    // 8.004,00 y NO 7.330,50: la diferencia de 673,50 € es el mínimo valorado al marginal.
    expect(await linea(page, ED, '= IRPF')).toBe('8004,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('11.604,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('7780,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('7291,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1385,29 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('330,79 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3930,79 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('7673,21 € MENOS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Objetiva \(Módulos\)/
    );
  });

  /**
   * CASO B (LÍMITE) — el umbral de exclusión de módulos clavado: ingresos EXACTAMENTE
   * 250.000 € (= LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades), gastos 0 €,
   * RETA 200 €/mes, bar con los parámetros de partida (6 mesas, 1 asalariado, 50 m²,
   * 10.000 kWh). El código compara con `<=`, así que en el umbral la actividad SIGUE
   * siendo apta; un solo paso más del deslizador (251.000 €) la excluye.
   *
   * ED:
   *   Rendimiento neto previo = 250.000 − 0 = 250.000
   *   − Reducción 5 % topada en 2.000 (250.000 × 5 % = 12.500 > tope) → reducido 248.000
   *   Base liquidable = 248.000, CON el mínimo dentro
   *   escala(248.000) = 17.901,50 + (248.000 − 60.000) × 45 % = 17.901,50 + 84.600,00
   *                   = 102.501,50
   *   escala(5.550)   = 1.054,50   →   IRPF = 101.447,00
   *   + RETA 200 × 12 = 2.400,00 → Coste ED = 103.847,00 €
   *
   *   Aquí el mínimo cae ENTERO en el tramo del 45 %, así que es el techo del error del
   *   método viejo: escala(248.000 − 5.550) = 17.901,50 + 182.450 × 45 % = 100.004,00,
   *   exactamente 1.443,00 € = 5.550 × (45 − 19) % por debajo de la cuota correcta.
   *
   * Módulos (bar, fórmula didáctica: 1.500 €/mesa + 800 €/asalariado + 6 €/m² + 0,05 €/kWh):
   *   Rendimiento previo = 1.500 × 6 + 800 + 6 × 50 + 0,05 × 10.000 = 9.000 + 800 + 300 + 500
   *                      = 10.600
   *   − 5 % (530,00) − incentivo empleo (100) → reducido 9.970 = base liquidable
   *   escala(9.970) = 9.970 × 19 % = 1.894,30 · escala(5.550) = 1.054,50 → IRPF = 839,80
   *   + RETA 2.400,00 → Coste Módulos = 3.239,80 €
   *
   * Diferencia = 103.847,00 − 3.239,80 = 100.607,20 €.
   */
  test('CASO B (límite) — ingresos EXACTAMENTE en el umbral de 250.000 €: sigue apto, y a 251.000 € queda excluido', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 200);

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('248.000,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('102.501,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    // 101.447,00 y NO 100.004,00: 1.443,00 € es el techo del error de restar el mínimo.
    expect(await linea(page, ED, '= IRPF')).toBe('101.447,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('103.847,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('10.600,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('9970,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('839,80 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3239,80 €');

    // En el umbral clavado NO hay exclusión: el límite es «supera», no «alcanza».
    expect(await panel(page, MOD)).not.toContain('superan los límites de exclusión');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');
    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('100.607,20 € MENOS con módulos');

    // Un paso de deslizador por encima (1.000 €) y la actividad queda fuera de módulos.
    await deslizar(page, 'ingresos', 251000);
    expect(await panel(page, MOD)).toContain('Ingresos o gastos superan los límites de exclusión');
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
    expect(cuerpo).not.toMatch(/te conviene más: Estimación Objetiva \(Módulos\)/);
  });

  /**
   * CASO C (RECHAZO) — transporte de mercancías SIN vehículo afecto, con los datos comunes
   * de partida (ingresos 70.000 €, gastos 25.000 €, RETA 320 €/mes). Se llega por una vía
   * distinta a la del preset «Profesional puro» del CASO 3: pulsando el radio de actividad,
   * que reinicia a 0 los campos que la actividad nueva no muestra (el bar de partida no
   * tiene vehículo). Sin ningún parámetro físico, `esApta` es false por «sin_parametros».
   *
   * ED: 70.000 − 25.000 = 45.000 · − 5 % topado en 2.000 → 43.000 = base liquidable
   *   escala(43.000) = 8.725,50 + (43.000 − 35.200) × 37 % = 8.725,50 + 2.886,00 = 11.611,50
   *   escala(5.550)  = 1.054,50 → IRPF = 10.557,00 · + RETA 3.840,00 → 14.397,00 €
   *
   * Módulos: 12.000 €/vehículo × 0 = 0 → base 0. El mínimo se acota a la base (art. 56.2),
   *   así que escala(0) − escala(0) = 0,00 € de IRPF y el coste es solo la cuota RETA,
   *   3.840,00 € — una cifra que la app NO debe anunciar como ahorro, porque el régimen
   *   no está disponible. Es la guarda del hallazgo crítico reparado en la tanda 16713728.
   */
  test('CASO C (rechazo) — transporte sin vehículo: no es elegible y la app no anuncia ahorro', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Transporte de mercancías/ }).click();

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('43.000,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('11.611,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('10.557,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('14.397,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('0,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3840,00 €');
    expect(await panel(page, MOD)).toContain('Sin parámetros suficientes');
    expect(await panel(page, MOD)).toContain('NO es elegible para módulos');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('no parece elegible para módulos');
    expect(estado).not.toMatch(/Pagas/);

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
    expect(cuerpo).not.toMatch(/te conviene más: Estimación Objetiva \(Módulos\)/);
  });
});

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
 *  esa fórmula sea la de la Orden de módulos real (hoy la Orden HAC/1425/2025), cuyos
 *  coeficientes no están en el repositorio.
 *
 * Fórmulas de módulos usadas por la app (hoy en lib/calculadoras/modulosVsDirecta.ts,
 * `calcularRendimientoModulos`):
 *   bar:  1.500 €/mesa + 800 €/asalariado + 6 €/m² + 0,05 €/kWh
 *   taxi: 6.800 €/vehículo afecto
 *
 * Método de cada columna desde la reparación del 29/09/2026 (hallazgos 2444 y 2445):
 *   ED:      previo = max(0, ingresos − gastos − RETA × 12) — la cuota del titular es gasto
 *            deducible (Manual práctico Renta 2025 de la AEAT, cap. 7) — · − 5 % con tope de
 *            2.000 € (art. 30.2.ª RIRPF) · = base · + RETA × 12 al coste (se paga igual).
 *   Módulos: previo · − minoración por incentivos al empleo (100 €/asalariado, sin pasar del
 *            previo) · = rendimiento neto de módulos · − 5 % SIN tope (DA 1.ª Orden
 *            HAC/1425/2025) · = base · + RETA × 12 al coste (aquí NO se deduce).
 *   Antes del 29/09 la ED no restaba la cuota RETA y módulos aplicaba el 5 % con el tope de
 *   la EDS y ANTES del incentivo al empleo: todos los goldens de abajo se recalcularon a mano
 *   ese día con el método nuevo.
 *
 * Formato: `formatCurrency` (es-ES) NO agrupa millares en importes de 4 dígitos enteros
 * (5250,18 €) pero SÍ desde 5 dígitos (20.798,00 €) — mismo comportamiento ya documentado
 * en el spec de estimador-sueldo-neto. Las cifras esperadas se resuelven a mano ANTES de
 * mirar la app (la cuenta va en el comentario de cada caso) y luego se contrastan con el DOM.
 *
 * Hallazgos de esta re-inspección (los dos REPARADOS el 02/09/2026; se deja el rastro):
 *  · 566 "contenido" — `metadata.ts` (jsonLd.features) prometía "Cálculo IRPF + RETA + IVA
 *    orientativo", pero la app no calculaba IVA en ningún sitio. REPARADO: la promesa de
 *    IVA salió de las features.
 *  · 567 "dato" — los umbrales de exclusión de módulos estaban escritos a mano en tres
 *    sitios sin módulo propio en `data/fiscal/`, y `esApta` no los aplicaba. REPARADO: hoy
 *    viven en `data/fiscal/modulos-irpf.ts` (LIMITES_EXCLUSION_MODULOS_2025) y el motor
 *    `lib/calculadoras/modulosVsDirecta.ts` los aplica (ver el test «Hallazgo 567»).
 *
 * Nota (29/09/2026): la fórmula de módulos ya no vive en page.tsx sino en el motor
 * compartido `lib/calculadoras/modulosVsDirecta.ts` (`calcularRendimientoModulos`), el mismo
 * que sirve la tool comparar_modulos_vs_directa del MCP de Delegum.
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
   *   − Cuota RETA 320×12 = 3.840 (gasto deducible del titular, hallazgo 2444)
   *   Rendimiento neto previo = 90.000 − 25.000 − 3.840 = 61.160
   *   − Reducción 5 % (61.160×5 % = 3.058 > tope) = −2.000  → reducido 59.160
   *   Base liquidable = 59.160, CON el mínimo dentro (art. 63.1.2º: el mínimo NO se resta)
   *   escala(59.160) = 8.725,50 (acumulado hasta 35.200) + 23.960×37 %
   *                  = 8.725,50 + 8.865,20 = 17.590,70
   *   escala(5.550)  = 1.054,50   →   IRPF = 16.536,20
   *   + RETA 3.840,00 (se paga igual)  →  Coste ED = 20.376,20 €
   *
   * Módulos (fórmula propia de la app, NO oficial — ver cabecera):
   *   Rendimiento previo = 1.500×8 + 800×1 + 6×60 + 0,05×12.000 = 12.000+800+360+600 = 13.760
   *   − incentivo empleo (1×100) = −100 → rendimiento neto de módulos 13.660
   *   − Reducción general 5 % sin tope (13.660×5 %) = −683,00 → reducido 12.977 = base
   *   escala(12.977) = 12.450×19 % + 527×24 % = 2.365,50 + 126,48 = 2.491,98
   *   escala(5.550)  = 1.054,50   →   IRPF = 1.437,48
   *   + RETA 3.840,00  →  Coste Módulos = 5.277,48 €
   *
   * Diferencia = 20.376,20 − 5.277,48 = 15.098,72 → módulos gana ("MENOS con módulos").
   *
   * ⚠️ GOLDENS RECALCULADOS EL 12/09/2026. Los anteriores estaban derivados del método
   * DEFECTUOSO (restar el mínimo de la base antes de la escala) y por eso cuadraban con la
   * app: los dos estaban mal a la vez. Se han vuelto a resolver a mano desde el art. 63.1.2º
   * LIRPF, verificado en sesión contra la AEAT (manual de ayuda de Renta 2025, «8.4.3.1
   * Cuota íntegra estatal»).
   * ⚠️ Y OTRA VEZ EL 29/09/2026 (hallazgos 2444 y 2445): antes ED 22.037,00 € (previo 65.000
   * sin restar la cuota RETA) y módulos 5.276,28 € (5 % = 688,00 antes del empleo); la
   * diferencia baja de 16.760,72 € a 15.098,72 €.
   */
  test('CASO 1 (normal) — bar rentable: ED 20.376,20 € vs Módulos 5277,48 €, gana módulos', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Aplicar caso Bar pequeño rentable/ }).click();

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3840,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('61.160,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('59.160,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('17.590,70 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('16.536,20 €');
    expect(await linea(page, ED, '+ Cuota RETA × 12 (la pagas igual)')).toBe('+3840,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('20.376,20 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('13.760,00 €');
    expect(await linea(page, MOD, '− Minoración por incentivos al empleo')).toBe('−100,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto de módulos')).toBe('13.660,00 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−683,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('12.977,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('2491,98 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('1437,48 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('5277,48 €');
    // Con mesas > 0, la app declara la actividad apta para módulos (sin aviso de exclusión)
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('15.098,72 € MENOS con módulos');
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
   *   Rendimiento neto previo = 200.000 − 0 − 600×12 (cuota RETA deducible) = 192.800
   *   − Reducción 5 % (tope 2.000, porque 192.800×5 % = 9.640 > tope) → reducido 190.800
   *   Base liquidable = 190.800, CON el mínimo dentro
   *   escala(190.800) = 17.901,50 (acumulado hasta 60.000) + 130.800×45 %
   *                   = 17.901,50 + 58.860,00 = 76.761,50
   *   escala(5.550)   = 1.054,50   →   IRPF = 75.707,00
   *   + RETA 600×12 = 7.200,00 → Coste ED = 82.907,00 €
   *   (Antes del 29/09/2026, sin deducir la cuota: base 198.000, IRPF 78.947,00, coste
   *   86.147,00 €. La cuota deducida ahorra 7.200 × 45 % = 3.240,00 €, justo la diferencia.)
   *
   *   El mínimo cae aquí ENTERO en el tramo del 45 %, así que este es el caso donde el
   *   método viejo más subestimaba: 5.550 × (45 − 19) % = 1.443,00 €/año, su techo.
   *
   * Módulos (taxi, fórmula propia — ver cabecera): 6.800 × vehículo(1) = 6.800
   *   − incentivo empleo (taxi no expone personal asalariado → 0) = −0,00 → 6.800
   *   − Reducción general 5 % sin tope (340,00) → reducido 6.460 = base liquidable
   *   escala(6.460) = 6.460 × 19 % = 1.227,40 · escala(5.550) = 1.054,50 → IRPF = 172,90
   *   + RETA 7.200,00 → Coste Módulos = 7.372,90 €
   *
   *   Esta columna NO cambió con la reparación del 12/09, y eso se comprueba a propósito:
   *   base y mínimo caen los dos dentro del primer tramo, donde escala(B) − escala(m) y
   *   escala(B − m) valen exactamente lo mismo. Tampoco con la del 29/09: sin asalariados,
   *   el orden empleo/5 % da igual y 340 € queda lejos de cualquier tope.
   *
   * Diferencia = 82.907,00 − 7.372,90 = 75.534,10 → módulos gana con muchísimo margen,
   * porque el rendimiento estimado de un taxi (6.800 €) es minúsculo frente al beneficio
   * real de 192.800 € que tributa por tramos hasta el 45 %.
   */
  test('CASO 2 (límite, tramo 45% IRPF) — sliders al máximo + Taxi: ED 82.907,00 € vs Módulos 7372,90 €', async ({
    page,
  }) => {
    await mover(page, 'ingresos', 200000);
    await mover(page, 'gastos', 0);
    await mover(page, 'reta', 600);
    await page.getByRole('radio', { name: /Taxi \(autotaxi\)/ }).click();
    await mover(page, 'veh', 1);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('192.800,00 €');
    expect(await linea(page, ED, '= Rendimiento neto reducido')).toBe('190.800,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('190.800,00 €');
    // Tramo 45% ejercitado: sin él (parando en 37%) la escala daría 17.901,50 €, no 76.761,50 €
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('76.761,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('75.707,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('82.907,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('6800,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('6460,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1227,40 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('172,90 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('7372,90 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('75.534,10 € MENOS con módulos');
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
   * ED (ancla: TRAMOS_IRPF_2025): ingresos 50.000, gastos 8.000, cuota RETA 300×12 = 3.600
   *   (deducible) → rendimiento previo 50.000 − 8.000 − 3.600 = 38.400
   *   − Reducción 5 % (1.920, bajo el tope de 2.000) → reducido 36.480 = base liquidable
   *   escala(36.480) = 8.725,50 (acumulado hasta 35.200) + 1.280×37 % = 8.725,50 + 473,60
   *                  = 9.199,10 · escala(5.550) = 1.054,50 → IRPF = 8.144,60
   *   + RETA 3.600,00 → Coste ED = 11.744,60 €
   *   (Antes del 29/09/2026, sin deducir la cuota: base 40.000, IRPF 9.447,00, coste 13.047,00 €.)
   *
   * Módulos (comercio_menor, personalAsalariado=0, personalNoAsalariado=1, superficie=0):
   *   Rendimiento previo = 4.500×1 + 1.000×0 + 8×0 = 4.500
   *   − incentivo empleo (0×100) = 0,00 · − Reducción general 5 % sin tope = −225,00
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

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('38.400,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('36.480,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('9199,10 €');
    expect(await linea(page, ED, '= IRPF')).toBe('8144,60 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('11.744,60 €');

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
    // Rótulo renombrado el 29/09/2026 (hallazgo 2445): era «− Reducción incentivos al empleo».
    expect(await linea(page, MOD, '− Minoración por incentivos al empleo')).toBe('−0,00 €');

    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
  });

  /**
   * Guarda de regresión (hallazgo 555, tanda 16713728) — el <DataReference> cita ahora
   * IRPF 2025 (lo único que el motor realmente calcula) y su nota aclara qué SÍ y qué NO
   * está anclado a normativa (módulos = fórmula didáctica, RETA = entrada libre).
   *
   * 29/09/2026 — pasan de 2 a 4. La reparación de los hallazgos 2444 y 2445 hizo que la
   * página calcule con dos datos normativos más, y cada dato con fecha de caducidad lleva su
   * sello (CLAUDE.md, «Componente DataReference»): la reducción del 5 % con tope de 2.000 €
   * de la ED y la deducción de la cuota RETA (FISCAL_ESTIMACION_DIRECTA_META), y los tramos
   * RETA con los que se contrasta la cuota tecleada (FISCAL_AUTONOMOS_META). Los dos nuevos
   * van DETRÁS de los que había, así que `.first()` (IRPF) y `.nth(1)` (límites de módulos)
   * siguen señalando lo mismo en el resto del fichero.
   */
  test('DataReference cita la fuente de lo que realmente se calcula (IRPF)', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias).toHaveCount(4);
    // 01/10/2026 — antes se exigía el literal «IRPF 2025», que es justo lo que contradice al
    // <title> (2026, de FISCAL_IRPF_META.vigencia). El AÑO lo vigila ahora el test
    // «[año] el DataReference del IRPF anuncia el mismo año que el title» de la re-inspección
    // del 01/10/2026; aquí solo se exige que el sello sea el del IRPF.
    await expect(referencias.first()).toContainText(/IRPF \d{4}/);
    await expect(referencias.first()).toContainText('fórmula didáctica simplificada');
    await expect(referencias.nth(2)).toContainText('Estimación directa simplificada');
    await expect(referencias.nth(2)).toContainText('cuota RETA como gasto deducible');
    await expect(referencias.nth(3)).toContainText('Cotización de autónomos (RETA)');
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
    // Desde el 29/09/2026 (hallazgo 2446) la cifra sale de
    // LIMITES_EXCLUSION_MODULOS_2025.facturacionAEmpresas vía formatCurrency: «125.000,00 €».
    await expect(referenciaLimites).toContainText('125.000,00 €');

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
 *    fórmula sea la de la Orden de módulos (ver cabecera del fichero).
 *  · Método de las dos columnas: el de la cabecera del fichero (cuota RETA deducible en ED;
 *    en módulos, incentivo al empleo antes del 5 % sin tope). Los goldens de estos tres
 *    casos se recalcularon a mano el 29/09/2026 con él; el valor anterior queda anotado.
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
   *   Rendimiento neto previo = 50.000 − 12.000 − 300 × 12 (cuota RETA deducible) = 34.400
   *   − Reducción 5 % (1.720, por debajo del tope de 2.000) → reducido 32.680
   *   Base liquidable general = 32.680, CON el mínimo dentro (art. 63.1.2º)
   *   escala(32.680) = 4.225,50 + (32.680 − 20.200) × 30 % = 4.225,50 + 3.744,00 = 7.969,50
   *   escala(5.550)  = 1.054,50   →   IRPF = 7.969,50 − 1.054,50 = 6.915,00
   *   + RETA 300 × 12 = 3.600,00  →  Coste ED = 10.515,00 €
   *   (Antes del 29/09/2026, sin deducir la cuota: base 36.100, IRPF 8.004,00, coste 11.604,00 €.)
   *
   *   ⚠️ Este es el caso que DISCRIMINA el método: restando el mínimo de la base
   *   —escala(32.680 − 5.550) = escala(27.130) = 4.225,50 + (27.130 − 20.200) × 30 %
   *   = 6.304,50— la cuota saldría 610,50 € más baja, porque valora el mínimo al tipo
   *   marginal (5.550 al 30 % = 1.665,00) en vez de al 19 % de la escala (1.054,50).
   *
   * Módulos (fórmula didáctica de la app: 5.500 €/asalariado + 2.000 €/no asalariado + 7 €/m²):
   *   Rendimiento previo = 5.500 + 2.000 + 7 × 40 = 7.780
   *   − incentivo empleo (1 × 100) → 7.680 · − 5 % sin tope (384,00) → reducido 7.296 = base
   *   escala(7.296) = 7.296 × 19 % = 1.386,24 · escala(5.550) = 1.054,50 → IRPF = 331,74
   *   + RETA 3.600,00 → Coste Módulos = 3.931,74 €
   *   (Antes: 5 % de 7.780 = 389,00 y luego el empleo → base 7.291, IRPF 330,79, 3.930,79 €.)
   *
   * Diferencia = 10.515,00 − 3.931,74 = 6.583,26 € a favor de módulos.
   */
  test('CASO A (normal) — peluquería 50.000/12.000: el mínimo se grava a tipo cero, IRPF 6915,00 € y no 6304,50 €', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Peluquería/ }).click();
    await deslizar(page, 'ingresos', 50000);
    await deslizar(page, 'gastos', 12000);
    await deslizar(page, 'reta', 300);
    await deslizar(page, 'sup', 40);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('34.400,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('32.680,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('7969,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    // 6.915,00 y NO 6.304,50: la diferencia de 610,50 € es el mínimo valorado al marginal.
    expect(await linea(page, ED, '= IRPF')).toBe('6915,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('10.515,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('7780,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto de módulos')).toBe('7680,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('7296,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1386,24 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('331,74 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3931,74 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('6583,26 € MENOS con módulos');
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
   *   Rendimiento neto previo = 250.000 − 0 − 206 × 12 (cuota RETA deducible) = 247.528
   *   − Reducción 5 % topada en 2.000 (247.528 × 5 % = 12.376,40 > tope) → reducido 245.528
   *   Base liquidable = 245.528, CON el mínimo dentro
   *   escala(245.528) = 17.901,50 + (245.528 − 60.000) × 45 % = 17.901,50 + 83.487,60
   *                   = 101.389,10
   *   escala(5.550)   = 1.054,50   →   IRPF = 100.334,60
   *   + RETA 206 × 12 = 2.472,00 → Coste ED = 102.806,60 €
   *   (Antes del 29/09/2026, sin deducir la cuota: base 248.000, IRPF 101.447,00, coste
   *   103.919,00 €; la cuota deducida ahorra 2.472 × 45 % = 1.112,40 €.)
   *
   *   ⚠  13/09/2026: el deslizador venía de 200 €, que era un suelo IMPOSIBLE — por debajo
   *   de la cuota mínima más baja de TRAMOS_RETA_2025 (205,88 €). Reparado el hallazgo 814,
   *   el suelo es 206 € y los dos costes suben los mismos 72 €/año; la DIFERENCIA entre
   *   regímenes no se movía, porque la cuota RETA se sumaba igual en las dos columnas.
   *   Desde el 29/09/2026 ya no es así: en ED la cuota además rebaja la base, de modo que
   *   la diferencia entre regímenes SÍ depende de ella.
   *
   *   Aquí el mínimo cae ENTERO en el tramo del 45 %, así que es el techo del error del
   *   método viejo: escala(245.528 − 5.550) = 17.901,50 + 179.978 × 45 % = 98.891,60,
   *   exactamente 1.443,00 € = 5.550 × (45 − 19) % por debajo de la cuota correcta.
   *
   * Módulos (bar, fórmula didáctica: 1.500 €/mesa + 800 €/asalariado + 6 €/m² + 0,05 €/kWh):
   *   Rendimiento previo = 1.500 × 6 + 800 + 6 × 50 + 0,05 × 10.000 = 9.000 + 800 + 300 + 500
   *                      = 10.600
   *   − incentivo empleo (100) → 10.500 · − 5 % sin tope (525,00) → reducido 9.975 = base
   *   escala(9.975) = 9.975 × 19 % = 1.895,25 · escala(5.550) = 1.054,50 → IRPF = 840,75
   *   + RETA 2.472,00 → Coste Módulos = 3.312,75 €
   *   (Antes: 5 % de 10.600 = 530 y luego el empleo → base 9.970, IRPF 839,80, 3.311,80 €.)
   *
   * Diferencia = 102.806,60 − 3.312,75 = 99.493,85 €.
   */
  test('CASO B (límite) — ingresos EXACTAMENTE en el umbral de 250.000 €: sigue apto, y a 251.000 € queda excluido', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 0);
    await deslizar(page, 'reta', 206);

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('245.528,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('101.389,10 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    // 100.334,60 y NO 98.891,60: 1.443,00 € es el techo del error de restar el mínimo.
    expect(await linea(page, ED, '= IRPF')).toBe('100.334,60 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('102.806,60 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('10.600,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('9975,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('840,75 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3312,75 €');

    // En el umbral clavado NO hay exclusión: el límite es «supera», no «alcanza».
    expect(await panel(page, MOD)).not.toContain('superan los límites de exclusión');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');
    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('99.493,85 € MENOS con módulos');

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
   * ED: 70.000 − 25.000 − 320 × 12 (cuota RETA deducible) = 41.160
   *   − 5 % topado en 2.000 (41.160 × 5 % = 2.058 > tope) → 39.160 = base liquidable
   *   escala(39.160) = 8.725,50 + (39.160 − 35.200) × 37 % = 8.725,50 + 1.465,20 = 10.190,70
   *   escala(5.550)  = 1.054,50 → IRPF = 9.136,20 · + RETA 3.840,00 → 12.976,20 €
   *   (Antes del 29/09/2026, sin deducir la cuota: base 43.000, IRPF 10.557,00, 14.397,00 €.
   *   Los 1.420,80 € de IRPF de diferencia son la cuota 3.840 × 37 %: la cifra del hallazgo 2444.)
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

    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('39.160,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('10.190,70 €');
    expect(await linea(page, ED, '= IRPF')).toBe('9136,20 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('12.976,20 €');

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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REPARACIÓN del 13/09/2026 — hallazgos 810, 812 y 814 de la tanda del 12/09.
 *
 * Los tres son de lo que la página PUBLICA junto a la cifra, no de la cifra:
 *  · 810 — la Orden que decide quién puede acogerse a módulos se citaba con un comodín
 *    sin sustituir («Orden HFP/X/2024») en tres sitios, mientras el DataReference de dos
 *    centímetros más arriba citaba otra cosa. Ahora sale de ORDEN_MODULOS_VIGENTE.
 *  · 812 — la cuota RETA es entrada libre y nadie la contrastaba con el tramo que le toca
 *    por rendimiento, así que el coste anual publicado podía quedar por debajo del mínimo
 *    legalmente posible sin decirlo.
 *  · 814 — el rótulo del deslizador prometía un recorrido (205,88 € a 1.606,88 €) que no
 *    era el suyo: los extremos se redondeaban a la decena HACIA FUERA (200 y 1.610).
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — reparación 13/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('[810] la Orden de módulos se cita con su referencia real, y en ningún sitio queda el comodín', async ({
    page,
  }) => {
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).not.toContain('HFP/X/2024');
    // La misma referencia que el sello DataReference de la propia página.
    expect(cuerpo).toContain('Orden HAC/1425/2025');
    expect(cuerpo).toContain('BOE-A-2025-25272');
    // Los dos avisos visibles (panel de módulos y caja de recomendación) la llevan.
    const avisos = await page.locator('body').innerText();
    expect((avisos.match(/Orden HAC\/1425\/2025/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  test('[814] el deslizador de la cuota RETA no baja del suelo de la tabla de tramos', async ({
    page,
  }) => {
    const reta = page.locator('#reta');
    // TRAMOS_RETA_2025: cuota mínima más baja 205,88 € · más alta 1.606,88 €.
    // Los extremos se redondean HACIA DENTRO, así que ningún valor alcanzable queda fuera.
    expect(Number(await reta.getAttribute('min'))).toBe(206);
    expect(Number(await reta.getAttribute('max'))).toBe(1606);
    expect(Number(await reta.getAttribute('min'))).toBeGreaterThanOrEqual(205.88);
    expect(Number(await reta.getAttribute('max'))).toBeLessThanOrEqual(1606.88);

    // Y el rótulo ya no promete el rango de la tabla como si fuera el del control.
    const hint = await page
      .locator('label[for="reta"]')
      .locator('xpath=..')
      .innerText();
    const hintNorm = hint.replace(/\s+/g, ' ');
    expect(hintNorm).toContain('206,00 €');
    expect(hintNorm).toContain('1606,00 €');
    expect(hintNorm).toContain('205,88 €');
  });

  test('[812] una cuota RETA imposible con ese rendimiento se avisa, y una posible no', async ({
    page,
  }) => {
    // Estado de fábrica: 70.000 − 25.000 = 45.000 de rendimiento previo. Con 320 €/mes de
    // cuota, el rendimiento neto del art. 308.1 LGSS es (45.000 − 3.840)/12 = 3.430,00 €/mes,
    // que cae en el tramo 12 (3.190-3.620 €), cuya cuota mínima es 478,68 €/mes. Faltan
    // (478,68 − 320) × 12 = 1.904,16 €/año.
    const aviso = page.locator('[aria-live="polite"]').filter({ hasText: 'tramo' });
    await expect(aviso).toContainText('478,68');
    await expect(aviso).toContainText('tramo 12');
    await expect(aviso).toContainText('1904,16');

    // Con 479 €/mes el punto es consistente: el rendimiento baja a 3.271,00 €/mes, sigue en
    // el tramo 12 y su cuota mínima es la misma. El aviso desaparece.
    await mover(page, 'reta', 479);
    await expect(aviso).toHaveCount(0);
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RE-INSPECCIÓN del 29/09/2026 — la cola la invalidó porque cambiaron sus DEPENDENCIAS:
 * `lib/calculadoras/cuotaAutonomo.ts` y `data/fiscal` (irpf, autónomos).
 *
 * Qué movió cifras desde la reparación del 13/09 (b84fa421), y en qué dirección:
 *  · c7af89ec (26/09) — `tramoRETA()` cierra cada frontera por ARRIBA salvo la del SMI. El
 *    aviso de coherencia de la cuota RETA (`contrastarCuotaReta` → `calcularCuotaAutonomo`)
 *    manda ahora 670, 900, 1.300 … 6.000 €/mes al tramo INFERIOR, con su cuota mínima más
 *    baja: en 1.850 €/mes, tramo 7 (360,29 €) y no 8 (380,88 €). El déficit anual que
 *    publica el aviso BAJA (con 275 €/mes: 1.270,56 € → 1.023,48 €). Los costes no se mueven:
 *    la cuota RETA es una entrada del usuario.
 *  · 9bbc5c19 y a1acfc3f (27/09) — re-sellado de FISCAL_IRPF_META: el DataReference pasa a
 *    «Última verificación: 27/09/2026» y cita los arts. 19, 20, 56 a 66, 84.2, 96 y DA 61.ª.
 *    La escala (TRAMOS_IRPF_2025), el mínimo (MINIMOS_IRPF_2025.personal) y las funciones
 *    `cuotaEscalaGeneral` / `calcularCuotaIntegraGeneral` NO han cambiado desde el 13/09.
 *  · 8a6fb75b y dc8a2ec3 (25/09) — no tocan el motor de esta app. La reducción del art. 20
 *    LIRPF (rendimientos del TRABAJO) NO se aplica a ninguna de las dos columnas, como debe.
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *  · Escala — `TRAMOS_IRPF_2025` (data/fiscal/irpf.ts, FISCAL_IRPF_META verificado
 *    2026-09-27): 19 % hasta 12.450 · 24 % hasta 20.200 · 30 % hasta 35.200 · 37 % hasta
 *    60.000 · 45 % hasta 300.000. Acumulados: escala(12.450) = 2.365,50 · escala(20.200) =
 *    4.225,50 · escala(35.200) = 8.725,50.
 *  · Mínimo — `MINIMOS_IRPF_2025.personal` = 5.550 €; escala(5.550) = 1.054,50 €. Cuota con
 *    `calcularCuotaIntegraGeneral` (art. 63.1.2.º: el mínimo se grava a tipo cero).
 *  · 5 % con tope de 2.000 € (SOLO en ED) — `GASTOS_DIFICIL_JUSTIFICACION_EDS` (data/fiscal/
 *    estimacion-directa.ts, art. 30.2.ª RIRPF), sobre ingresos − gastos − cuota RETA × 12
 *    (la cuota del titular es gasto deducible en ED desde la reparación del hallazgo 2444).
 *  · 5 % SIN tope en módulos — `REDUCCION_GENERAL_MODULOS` (data/fiscal/modulos-irpf.ts, DA
 *    1.ª Orden HAC/1425/2025), sobre el rendimiento neto de módulos, es decir, DESPUÉS de la
 *    minoración por incentivos al empleo (hallazgo 2445).
 *  · Tramos RETA — `TRAMOS_RETA_2025` + `tramoRETA()` (data/fiscal/autonomos.ts, Orden
 *    PJC/297/2026 art. 18). Rendimiento neto = ingresos − gastos − cuota SS (su comentario).
 *  · Límites de exclusión — `LIMITES_EXCLUSION_MODULOS_2025` (data/fiscal/modulos-irpf.ts):
 *    250.000 € de ingresos y 250.000 € de compras de bienes y servicios.
 *  · Módulos — fórmula DIDÁCTICA del motor (comercio: 4.500 €/no asalariado + 1.000 €/
 *    asalariado + 8 €/m²; bar: 1.500 €/mesa + 800 €/asalariado + 6 €/m² + 0,05 €/kWh), y
 *    100 € por asalariado de incentivo al empleo. Sin ancla normativa (ver cabecera).
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — re-inspección 29/09/2026', () => {
  const deslizar = (page: Page, id: string, valor: number) =>
    sembrarValorAcotado(page, `#${id}`, valor);

  /** El aviso de coherencia de la cuota RETA (el de la app, no el anunciador de rutas). */
  const avisoReta = (page: Page) =>
    page.locator('[aria-live="polite"]').filter({ hasText: 'tabla del RETA' });

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  /**
   * CASO N (NORMAL) — comercio menor: ingresos 60.000 €, gastos 30.000 €, RETA 402 €/mes,
   * 1 asalariado, 1 no asalariado (heredados del bar de partida) y 80 m².
   *
   * ED (cuota RETA deducible desde la reparación del HALLAZGO R, 29/09/2026):
   *   previo 60.000 − 30.000 − 402 × 12 = 60.000 − 30.000 − 4.824 = 25.176
   *   5 % = 1.258,80 (bajo el tope) → base 23.917,20
   *   escala(23.917,20) = 4.225,50 + 3.717,20 × 30 % = 4.225,50 + 1.115,16 = 5.340,66
   *   → IRPF 5.340,66 − 1.054,50 = 4.286,16 · + RETA 4.824,00 → 9.110,16 €
   *   (Hasta el 29/09 el motor no restaba la cuota: previo 30.000, IRPF 5.661,00, 10.485,00 €.
   *   Por eso este caso solo afirmaba entonces ingresos y gastos de la columna ED.)
   *
   * Módulos: 4.500 + 1.000 + 8 × 80 = 6.140 · empleo 100 → 6.040 · 5 % sin tope = 302,00
   *   → base 5.738 · escala(5.738) = 5.738 × 19 % = 1.090,22 → IRPF 1.090,22 − 1.054,50 = 35,72
   *   + 4.824,00 → 4.859,72 €
   *   (Antes: 5 % de 6.140 = 307 y luego el empleo → base 5.733, IRPF 34,77, 4.858,77 €.)
   *
   * Diferencia = 9.110,16 − 4.859,72 = 4.250,44 € a favor de módulos.
   *
   * RETA según tramos: (30.000 − 4.824)/12 = 2.098 €/mes → tramo 9 (> 2.030 y ≤ 2.330),
   *   cuota mínima 401,47 € → con 402 € no hay aviso. Con 401 €: (30.000 − 4.812)/12 =
   *   2.099 €/mes, sigue en el tramo 9, y faltan (401,47 − 401) × 12 = 5,64 €/año.
   */
  test('CASO N (normal) — comercio 60.000/30.000: ED 9110,16 €, módulos 35,72 € de IRPF, RETA 402 € coherente con el tramo 9', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Comercio menor/ }).click();
    await deslizar(page, 'ingresos', 60000);
    await deslizar(page, 'gastos', 30000);
    await deslizar(page, 'reta', 402);
    await deslizar(page, 'sup', 80);

    expect(await linea(page, ED, 'Ingresos brutos')).toBe('60.000,00 €');
    expect(await linea(page, ED, '− Gastos deducibles')).toBe('−30.000,00 €');
    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−4824,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('25.176,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−1258,80 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('23.917,20 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('5340,66 €');
    expect(await linea(page, ED, '= IRPF')).toBe('4286,16 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('9110,16 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('6140,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto de módulos')).toBe('6040,00 €');
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−302,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('5738,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('1090,22 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('35,72 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('4859,72 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');
    await expect(page.locator('[role="status"]')).toContainText('4250,44 €');
    await expect(page.locator('[role="status"]')).toContainText('MENOS con módulos');

    await expect(avisoReta(page)).toHaveCount(0);
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Objetiva \(Módulos\)/
    );

    // Un euro por debajo de la cuota mínima del tramo 9, y el aviso salta con su déficit.
    await deslizar(page, 'reta', 401);
    await expect(avisoReta(page)).toContainText('2099,00 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 9');
    await expect(avisoReta(page)).toContainText('401,47 €/mes');
    await expect(avisoReta(page)).toContainText('5,64 €');
  });

  /**
   * CASO L1 (LÍMITE) — la frontera de 1.850 €/mes entre los tramos 7 y 8 del RETA, que
   * `tramoRETA()` cierra por ARRIBA desde c7af89ec (26/09/2026). Bar de partida con
   * ingresos 30.000 €, gastos 4.500 € y RETA 275 €/mes:
   *   (25.500 − 275 × 12)/12 = 22.200/12 = 1.850,00 €/mes → tramo 7 (> 1.700 y ≤ 1.850),
   *   cuota mínima 1.143,79 × 31,50 % = 360,29 € → déficit (360,29 − 275) × 12 = 1.023,48 €.
   *   Antes del 26/09 la app lo mandaba al tramo 8 (380,88 €) y publicaba 1.270,56 €.
   * Un euro menos de cuota (274 €) sube el rendimiento a 22.212/12 = 1.851,00 €/mes → tramo 8,
   *   cuota mínima 1.209,15 × 31,50 % = 380,88 € → déficit (380,88 − 274) × 12 = 1.282,56 €.
   */
  test('CASO L1 (límite) — 1.850 €/mes es tramo 7 (360,29 €) y 1.851 €/mes es tramo 8 (380,88 €)', async ({
    page,
  }) => {
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
   * CASO L2 (LÍMITE, compras) — el otro umbral de exclusión, que ningún test cubría:
   * `LIMITES_EXCLUSION_MODULOS_2025.comprasBienesYServicios` = 250.000 € (el motor usa los
   * gastos como aproximación). Bar de partida, ingresos 250.000 € (en su propio límite, que
   * aún es apto), RETA 206 €/mes (suelo del deslizador).
   *   Gastos 250.000 € → apto (el límite es «supera», `<=`). ED: rendimiento max(0, 250.000 −
   *   250.000 − 2.472) = 0 → IRPF 0 → coste 206 × 12 = 2.472,00 €. Módulos (29/09/2026:
   *   empleo antes del 5 % sin tope): 10.600 − 100 = 10.500 − 525 = 9.975 → 1.895,25 −
   *   1.054,50 = 840,75 → 3.312,75 €. Diferencia 2.472,00 − 3.312,75 = −840,75: «Pagas
   *   840,75 € MÁS con módulos», recomienda ED. (Antes: 9.970 de base, 839,80 € y 3.311,80 €.)
   *   Gastos 250.500 € (un paso más) → excluido por compras: aviso y sin comparativa.
   */
  test('CASO L2 (límite) — compras de 250.000 € aún apto; 250.500 € excluye de módulos', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 250000);
    await deslizar(page, 'gastos', 250000);
    await deslizar(page, 'reta', 206);

    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('2472,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3312,75 €');
    expect(await panel(page, MOD)).not.toContain('superan los límites de exclusión');
    const estado = page.locator('[role="status"]');
    await expect(estado).toContainText('840,75 €');
    await expect(estado).toContainText('MÁS con módulos');

    await deslizar(page, 'gastos', 250500);
    expect(await panel(page, MOD)).toContain('Ingresos o gastos superan los límites de exclusión');
    expect(await panel(page, MOD)).toContain('250.000,00 € / 250.000,00 €');
    await expect(estado).toContainText('no parece elegible para módulos');
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
  });

  /**
   * CASO R (RECHAZO) — unos ingresos negativos no pueden entrar: los importes son
   * deslizadores (`min=0`), no campos de texto, así que ni «−5.000» ni «2.000.50» son
   * tecleables. Sembrar −5.000 deja el control en 0 y la columna de ED en 0,00 €, sin
   * rendimientos negativos. Con los gastos de partida (25.000 €) el rendimiento se acota a 0
   * (0 − 25.000 − 3.840 < 0) y el coste de ED es solo la cuota RETA: 320 × 12 = 3.840,00 €.
   * Módulos (bar de partida, 29/09/2026): 10.600 − 100 = 10.500 − 525 = 9.975 → IRPF
   * 1.895,25 − 1.054,50 = 840,75 + 3.840,00 = 4.680,75 € (antes 4.679,80 €) → recomienda ED.
   */
  test('CASO R (rechazo) — ingresos negativos: el deslizador los deja en 0 y el rendimiento no baja de 0', async ({
    page,
  }) => {
    expect(await deslizar(page, 'ingresos', -5000)).toBe('0');
    expect(await linea(page, ED, 'Ingresos brutos')).toBe('0,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3840,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('4680,75 €');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Directa Simplificada/
    );
  });

  test('DisclaimerCard crítico y DataReference con el META re-sellado y fecha en formato español', async ({
    page,
  }) => {
    // severity="critical" → role="alert" y clase severity-critical (components/DisclaimerCard.tsx).
    const disclaimer = page.locator('[role="alert"][class*="severity-critical"]');
    await expect(disclaimer).toHaveCount(1);

    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    // FISCAL_IRPF_META.verificado = '2026-09-27' (re-sellado de 9bbc5c19).
    await expect(referencias.first()).toContainText('27/09/2026');
    await expect(referencias.first()).toContainText('arts. 19, 20, 56 a 66, 84.2 y 96');
    // FISCAL_MODULOS_IRPF_META.verificado = '2026-09-02'.
    await expect(referencias.nth(1)).toContainText('02/09/2026');
    await expect(referencias.nth(1)).toContainText('Orden HAC/1425/2025');
  });

  /**
   * HALLAZGO R (2444) — REPARADO el 29/09/2026. La cuota RETA no se deducía en la
   * Estimación Directa.
   *
   * La AEAT (Manual práctico Renta 2025, cap. 7 «Estimación directa», fase 1, «Gastos del
   * titular de la actividad» — el manual que cita FISCAL_ESTIMACION_DIRECTA_META) incluye
   * entre los gastos deducibles «las cotizaciones del titular de la actividad al Régimen
   * Especial de Trabajadores Autónomos (RETA)». data/fiscal/autonomos.ts define el
   * rendimiento neto como «Ingresos − Gastos deducibles − Cuota SS», y la propia página lo
   * usa así en el aviso del tramo RETA. Pero `calcularED` del motor calculaba el rendimiento
   * como ingresos − gastos y la cuota solo se SUMABA al coste: el IRPF de ED salía inflado en
   * ~cuota × 12 × tipo marginal, y la comparativa se inclinaba hacia módulos. Reparado: el
   * motor resta la cuota antes del 5 % y la sigue sumando al coste (se paga igual).
   *
   * Bar de partida (6 mesas, 1 asalariado, 50 m², 10.000 kWh), ingresos 30.000 €, gastos
   * 18.000 €, RETA 320 €/mes:
   *   ED: previo 30.000 − 18.000 − 3.840 = 8.160 · 5 % = 408 → base 7.752
   *     escala(7.752) = 7.752 × 19 % = 1.472,88 → IRPF 1.472,88 − 1.054,50 = 418,38
   *     coste ED 418,38 + 3.840 = 4.258,38 €
   *   Módulos (con el orden nuevo del hallazgo 2445): 10.600 − 100 = 10.500 − 525 = 9.975 →
   *     IRPF 1.895,25 − 1.054,50 = 840,75 → coste 4.680,75 € (el acta decía 4.679,80 €, que
   *     era el método viejo de módulos: 5 % antes del empleo).
   *   Diferencia 4.258,38 − 4.680,75 = −422,37 → «Pagas 422,37 € MÁS con módulos», gana ED.
   *   Obtenido antes de la reparación: previo 12.000 → base 11.400 → IRPF 2.166,00 − 1.054,50
   *     = 1.111,50 → coste 4.951,50 € y «Pagas 271,70 € MENOS con módulos»: recomendaba MÓDULOS.
   */
  test('HALLAZGO R (REPARADO el 29/09/2026) — la cuota RETA es gasto deducible en ED: 30.000/18.000/320 recomienda ED', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 30000);
    await deslizar(page, 'gastos', 18000);
    await deslizar(page, 'reta', 320);

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−3840,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('8160,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−408,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('7752,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('418,38 €');
    expect(await linea(page, ED, '+ Cuota RETA × 12 (la pagas igual)')).toBe('+3840,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('4258,38 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('840,75 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('4680,75 €');

    const estado = page.locator('[role="status"]');
    await expect(estado).toContainText('422,37 €');
    await expect(estado).toContainText('MÁS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Directa Simplificada/
    );
  });

  /**
   * HALLAZGO T (2445) — REPARADO el 29/09/2026. La reducción del 5 % de MÓDULOS llevaba el
   * tope de 2.000 € de la estimación directa simplificada.
   *
   * La Orden HAC/1425/2025 (ORDEN_MODULOS_VIGENTE, BOE-A-2025-25272), disposición adicional
   * primera: «podrán reducir el rendimiento neto de módulos obtenido en 2026 en un 5 por
   * ciento», sin tope en euros. data/fiscal/estimacion-directa.ts dice de
   * GASTOS_DIFICIL_JUSTIFICACION_EDS «Solo aplica en estimación directa simplificada: ni en la
   * normal ni en módulos». El motor, sin embargo, usaba `reduccionGastosDificilJustificacion`
   * (5 % topado en 2.000 €) también para la columna de módulos, y la etiqueta de esa columna
   * anunciaba «(máx. 2000,00 €)». Solo muerde con un rendimiento de módulos > 40.000 €.
   *
   * ⚠️ El «esperado» del acta se REESCRIBE. El acta (base 49.565, IRPF 12.986,05 €) quitaba
   * el tope pero conservaba el orden del motor de entonces: el 5 % sobre el previo y DESPUÉS
   * el incentivo al empleo. La DA 1.ª aplica el 5 % sobre el «rendimiento neto de módulos»,
   * que es lo que queda tras las minoraciones (el incentivo al empleo entre ellas), así que
   * el orden correcto es el inverso y el 5 % se calcula sobre 500 € menos.
   *
   * Bar con 30 mesas, 5 asalariados, 200 m² y 50.000 kWh (el resto, de partida):
   *   previo = 1.500 × 30 + 800 × 5 + 6 × 200 + 0,05 × 50.000 = 45.000 + 4.000 + 1.200 + 2.500
   *          = 52.700
   *   − minoración por incentivos al empleo 5 × 100 = 500 → rendimiento neto de módulos 52.200
   *   − 5 % sin tope = 2.610,00 → base 49.590
   *   escala(49.590) = 8.725,50 + (49.590 − 35.200) × 37 % = 8.725,50 + 5.324,30 = 14.049,80
   *   IRPF = 14.049,80 − 1.054,50 = 12.995,30 €
   *   Obtenido antes de la reparación: −2.000,00 → base 50.200 → IRPF 14.275,50 − 1.054,50 =
   *   13.221,00 € (225,70 € de más frente al correcto).
   */
  test('HALLAZGO T (REPARADO el 29/09/2026) — el 5 % de módulos no tiene el tope de 2.000 € de la EDS y va tras el incentivo al empleo', async ({
    page,
  }) => {
    await deslizar(page, 'mesas', 30);
    await deslizar(page, 'pAsal', 5);
    await deslizar(page, 'sup', 200);
    await deslizar(page, 'kwh', 50000);

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('52.700,00 €');
    expect(await linea(page, MOD, '− Minoración por incentivos al empleo')).toBe('−500,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto de módulos')).toBe('52.200,00 €');
    // 2.610,00 y NO 2.000,00 (tope de la EDS) ni 2.635,00 (5 % antes del empleo, el del acta).
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−2610,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('49.590,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('14.049,80 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('12.995,30 €');
    // La etiqueta ya no anuncia un tope que no existe.
    expect(await panel(page, MOD)).toContain('(sin tope)');
    expect(await panel(page, MOD)).not.toContain('máx.');
  });

  /**
   * HALLAZGO P (2447) — REPARADO el 29/09/2026. El porcentaje de la reducción iba pegado a
   * la cifra («5%») en las dos columnas; la norma del proyecto (CLAUDE.md global §2,
   * 25/09/2026) es «5 %» con espacio duro U+00A0. Desde la reparación del 2445 el rótulo de
   * módulos es «− Reducción general 5 % (sin tope)», por eso el patrón admite «general».
   */
  test('HALLAZGO P (REPARADO el 29/09/2026) — «Reducción 5 %» con espacio duro en las dos columnas', async ({
    page,
  }) => {
    for (const columna of [ED, MOD]) {
      const contenedor = page.locator('h3', { hasText: columna }).first().locator('xpath=..');
      const rotulo = await contenedor
        .locator('span', { hasText: /^− Reducción (general )?5/ })
        .first()
        .textContent();
      // textContent conserva el U+00A0: se exige el espacio duro, y ningún «5%» pegado.
      expect(rotulo).not.toContain('5%');
      expect(rotulo).toContain('5 %');
    }
  });

  /**
   * HALLAZGO H (2448) — REPARADO el 29/09/2026. La página nombraba la norma de módulos como
   * «Orden HFP» en textos visibles (nota del DataReference, nota didáctica del panel), cuando
   * las dos últimas son Orden HAC (ORDEN_MODULOS_VIGENTE.referencia = 'Orden HAC/1425/2025';
   * anterior = 'Orden HAC/1347/2024'), y la propia página cita la vigente como HAC dos
   * centímetros más arriba. Hoy la nota del primer DataReference interpola la referencia de
   * ORDEN_MODULOS_VIGENTE.
   */
  test('HALLAZGO H (REPARADO el 29/09/2026) — ningún texto visible llama «Orden HFP» a la Orden HAC de módulos', async ({
    page,
  }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).not.toContainText('Orden HFP');
    await expect(referencias.first()).toContainText('no los coeficientes reales de la Orden HAC/1425/2025');
    // body y no solo main: los DataReference y el bloque educativo viven fuera de <main>.
    expect(await page.locator('body').innerText()).not.toContain('Orden HFP');
    expect(await page.locator('body').textContent()).not.toContain('Orden HFP');
  });
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RE-INSPECCIÓN del 01/10/2026 — la cola la invalidó por e02a9981 (29/09: la cuota RETA
 * desgrava en directa y el 5 % de módulos va sin tope y tras el empleo, hallazgos 2444-2448)
 * y b7ec248c (01/10: el año del <title> sale de FISCAL_IRPF_META.vigencia; candado
 * check:anio-titulo).
 *
 * La sospecha que traía (SOSPECHAS.md, 29/09): «el title dice "Autónomos 2025" y la app modela
 * la Orden de módulos de 2026 con la escala IRPF de 2025». SE DESCARTA para el title: desde
 * b7ec248c dice 2026, y es coherente con todo lo que aplica el motor —
 *  · escala: TRAMOS_IRPF_2025, cuyo sufijo es histórico; FISCAL_IRPF_META.vigencia = '2026' y
 *    su cabecera registra que el art. 63 no se toca desde la Ley 11/2020 (misma escala en 2026);
 *  · Orden de módulos: ORDEN_MODULOS_VIGENTE.ejercicio = 2026 (Orden HAC/1425/2025) y
 *    REDUCCION_GENERAL_MODULOS.ejercicio = 2026;
 *  · tabla RETA del aviso: TRAMOS_RETA_2025, también sufijo histórico, con los datos de la
 *    Orden PJC/297/2026 (FISCAL_AUTONOMOS_META.vigencia = '2026').
 * Lo que queda incoherente es el CUERPO: el sello del primer DataReference dice «IRPF 2025»
 * (escrito a mano) y su nota enseñaba el identificador «TRAMOS_RETA_2025» (los dos, REPARADOS el 01/10/2026).
 *
 * De dónde sale cada cifra esperada: las mismas anclas de la re-inspección del 29/09 (escala
 * TRAMOS_IRPF_2025 · mínimo MINIMOS_IRPF_2025.personal = 5.550 → escala(5.550) = 1.054,50 ·
 * GASTOS_DIFICIL_JUSTIFICACION_EDS 5 % con tope de 2.000 € solo en ED · REDUCCION_GENERAL_
 * MODULOS 5 % sin tope tras el incentivo al empleo · TRAMOS_RETA_2025 + tramoRETA() con
 * TIPO_COTIZACION_RETA 31,50 % · LIMITES_EXCLUSION_MODULOS_2025 250.000 / 250.000). Acumulados
 * de la escala: escala(12.450) = 2.365,50 · escala(35.200) = 8.725,50 · escala(60.000) =
 * 17.901,50. Todas resueltas a mano ANTES de ejecutar la app.
 * ─────────────────────────────────────────────────────────────────────────────
 */
test.describe('Simulador Módulos vs Estimación Directa — re-inspección 01/10/2026', () => {
  const deslizar = (page: Page, id: string, valor: number) =>
    sembrarValorAcotado(page, `#${id}`, valor);

  /** El aviso de coherencia de la cuota RETA (el de la app, no el anunciador de rutas). */
  const avisoReta = (page: Page) =>
    page.locator('[aria-live="polite"]').filter({ hasText: 'tabla del RETA' });

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  /**
   * CASO 1 (NORMAL) — revalida A LA VEZ las dos reparaciones del 29/09 en el único régimen
   * cuya fórmula didáctica pasa de 40.000 € (el bar), que es donde el tope de 2.000 € de la
   * EDS mordería si volviera a colarse en módulos.
   * Bar, ingresos 120.000 €, gastos 50.000 €, RETA 500 €/mes, 28 mesas, 4 asalariados,
   * 1 no asalariado (de partida), 100 m², 20.000 kWh.
   *
   * ED: cuota RETA 500 × 12 = 6.000 (gasto deducible, hallazgo 2444)
   *   previo 120.000 − 50.000 − 6.000 = 64.000 · 5 % = 3.200 > tope → −2.000 → base 62.000
   *   escala(62.000) = 17.901,50 + 2.000 × 45 % = 18.801,50 → IRPF 18.801,50 − 1.054,50 = 17.747,00
   *   + 6.000 → coste ED 23.747,00 €
   *   (Sin deducir la cuota —el defecto 2444— la base sería 68.000, el IRPF 20.447,00 y el coste
   *   26.447,00 €: 2.700 € más = 6.000 × 45 %.)
   * Módulos: 1.500 × 28 + 800 × 4 + 6 × 100 + 0,05 × 20.000 = 42.000 + 3.200 + 600 + 1.000 = 46.800
   *   − incentivo al empleo 4 × 100 = 400 → rendimiento neto de módulos 46.400
   *   − 5 % SIN tope = 2.320,00 (con el tope de la EDS serían 2.000) → base 44.080
   *   escala(44.080) = 8.725,50 + 8.880 × 37 % = 8.725,50 + 3.285,60 = 12.011,10
   *   → IRPF 10.956,60 · + 6.000 → coste módulos 16.956,60 €
   *   (Con el defecto 2445 —5 % topado y antes del empleo— base 44.400 e IRPF 11.075,00.)
   * Diferencia 23.747,00 − 16.956,60 = 6.790,40 € a favor de módulos.
   * Aviso RETA: (70.000 − 6.000)/12 = 5.333,33 €/mes → tramo 14 (> 4.050 y ≤ 6.000), cuota
   *   mínima r(1.732,03 × 31,50 %) = 545,59 € → déficit (545,59 − 500) × 12 = 547,08 €.
   */
  test('CASO 1 (normal) — bar 120.000/50.000/500 con 28 mesas: la cuota RETA desgrava en ED y el 5 % de módulos (2320,00 €) va sin tope y tras el empleo', async ({
    page,
  }) => {
    await deslizar(page, 'ingresos', 120000);
    await deslizar(page, 'gastos', 50000);
    await deslizar(page, 'reta', 500);
    await deslizar(page, 'mesas', 28);
    await deslizar(page, 'pAsal', 4);
    await deslizar(page, 'sup', 100);
    await deslizar(page, 'kwh', 20000);

    expect(await linea(page, ED, '− Cuota RETA × 12 (gasto deducible del titular)')).toBe('−6000,00 €');
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('64.000,00 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Reducción 5')).toBe('−2000,00 €');
    expect(await linea(page, ED, '= Base liquidable (el mínimo va dentro)')).toBe('62.000,00 €');
    expect(await linea(page, ED, 'Escala general sobre la base completa')).toBe('18.801,50 €');
    expect(await lineaQueEmpiezaPor(page, ED, '− Escala sobre el mínimo personal')).toBe('−1054,50 €');
    expect(await linea(page, ED, '= IRPF')).toBe('17.747,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('23.747,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('46.800,00 €');
    expect(await linea(page, MOD, '− Minoración por incentivos al empleo')).toBe('−400,00 €');
    expect(await linea(page, MOD, '= Rendimiento neto de módulos')).toBe('46.400,00 €');
    // 2.320,00 y NO 2.000,00 (tope de la EDS) ni 2.340,00 (5 % antes del empleo).
    expect(await lineaQueEmpiezaPor(page, MOD, '− Reducción general')).toBe('−2320,00 €');
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('44.080,00 €');
    expect(await linea(page, MOD, 'Escala general sobre la base completa')).toBe('12.011,10 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('10.956,60 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('16.956,60 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = page.locator('[role="status"]');
    await expect(estado).toContainText('6790,40 €');
    await expect(estado).toContainText('MENOS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Objetiva \(Módulos\)/
    );

    await expect(avisoReta(page)).toContainText('5333,33 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 14');
    await expect(avisoReta(page)).toContainText('545,59 €/mes');
    await expect(avisoReta(page)).toContainText('547,08 €');
  });

  /**
   * CASO 2 (LÍMITE) — la cuota RETA lleva el rendimiento de ED justo a cero y luego por
   * debajo. Bar de partida (6 mesas, 1 asalariado, 50 m², 10.000 kWh), ingresos 40.000 €,
   * gastos 37.000 €: ingresos − gastos = 3.000 €.
   *   RETA 250 €/mes → 3.000 − 3.000 = 0 exacto: reducción 0,00, base 0, IRPF 0 (el mínimo se
   *     acota a la base: escala(0) − escala(0)), coste ED = 3.000,00 €.
   *   RETA 300 €/mes → 3.000 − 3.600 = −600, que el motor acota a 0 (no publica rendimientos
   *     negativos): IRPF 0, coste ED = 3.600,00 €.
   * Módulos (no depende de la cuota): 10.600 − 100 = 10.500 − 525,00 = 9.975 → escala 1.895,25
   *   − 1.054,50 = 840,75 de IRPF → coste 840,75 + 3.000 = 3.840,75 € y 840,75 + 3.600 = 4.440,75 €.
   * Diferencia en los dos puntos: −840,75 € → «Pagas 840,75 € MÁS con módulos», recomienda ED.
   * Aviso RETA: rendimiento mensual (3.000 − 3.000)/12 = 0 y (3.000 − 3.600)/12 = −50, los dos
   *   ≤ 0 → `contrastarCuotaReta` devuelve null y no hay aviso.
   */
  test('CASO 2 (límite) — la cuota RETA deja el rendimiento de ED en 0 (250 €) y por debajo (300 €): base 0, IRPF 0, sin aviso RETA', async ({
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
    expect(await linea(page, MOD, '= IRPF')).toBe('840,75 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3840,75 €');
    const estado = page.locator('[role="status"]');
    await expect(estado).toContainText('840,75 €');
    await expect(estado).toContainText('MÁS con módulos');
    await expect(avisoReta(page)).toHaveCount(0);

    await deslizar(page, 'reta', 300);
    // −600 € acotados a 0: ni rendimiento negativo en pantalla ni cuota negativa.
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await linea(page, ED, '= IRPF')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3600,00 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('4440,75 €');
    await expect(estado).toContainText('840,75 €');
    await expect(estado).toContainText('MÁS con módulos');
    await expect(avisoReta(page)).toHaveCount(0);
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Directa Simplificada/
    );
  });

  /**
   * CASO 3 (RECHAZO) — una cuota RETA imposible y unos ingresos fuera de rango no entran.
   * Taxi con vehículo afecto, ingresos 30.000 €, gastos 10.000 €, y se intenta sembrar una cuota
   * de 150 €/mes, por debajo de la mínima de TRAMOS_RETA_2025 (205,88 €): el deslizador la deja
   * en su suelo, ceil(205,88) = 206.
   *   ED: 30.000 − 10.000 − 206 × 12 = 30.000 − 10.000 − 2.472 = 17.528 · 5 % = 876,40 →
   *     base 16.651,60 · escala = 2.365,50 + 4.201,60 × 24 % = 2.365,50 + 1.008,38 = 3.373,88
   *     → IRPF 2.319,38 · + 2.472 → 4.791,38 €
   *   Módulos (taxi): 6.800 − 0 = 6.800 − 340,00 = 6.460 → escala 1.227,40 → IRPF 172,90
   *     → 2.644,90 € · diferencia 2.146,48 € a favor de módulos.
   *   Aviso: (20.000 − 2.472)/12 = 1.460,67 €/mes → tramo 5 (> 1.300 y ≤ 1.500), cuota mínima
   *     r(960,78 × 31,50 %) = 302,65 € → déficit (302,65 − 206) × 12 = 1.159,80 €.
   * Después se intenta sembrar 350.000 € de ingresos: el deslizador los deja en 300.000 €, que
   *   supera LIMITES_EXCLUSION_MODULOS_2025.ingresosConjuntoActividades (250.000 €) → aviso de
   *   exclusión, sin comparativa de importes, y la única recomendación es ED.
   */
  test('CASO 3 (rechazo) — taxi: una cuota RETA de 150 € se queda en 206 € y 350.000 € de ingresos en 300.000 €, que excluyen de módulos', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Taxi \(autotaxi\)/ }).click();
    await deslizar(page, 'veh', 1);
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
    expect(await linea(page, MOD, '= Base liquidable (el mínimo va dentro)')).toBe('6460,00 €');
    expect(await linea(page, MOD, '= IRPF')).toBe('172,90 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('2644,90 €');
    const estado = page.locator('[role="status"]');
    await expect(estado).toContainText('2146,48 €');
    await expect(estado).toContainText('MENOS con módulos');
    await expect(avisoReta(page)).toContainText('1460,67 €/mes');
    await expect(avisoReta(page)).toContainText('tramo 5');
    await expect(avisoReta(page)).toContainText('302,65 €/mes');
    await expect(avisoReta(page)).toContainText('1159,80 €');

    expect(await deslizar(page, 'ingresos', 350000)).toBe('300000');
    expect(await linea(page, ED, 'Ingresos brutos')).toBe('300.000,00 €');
    expect(await panel(page, MOD)).toContain('Ingresos o gastos superan los límites de exclusión');
    await expect(estado).toContainText('no parece elegible para módulos');
    await expect(estado).not.toContainText('Pagas');
    const cuerpo = await page.locator('body').innerText();
    expect(cuerpo).toMatch(/te conviene más: Estimación Directa Simplificada/);
    expect(cuerpo).not.toMatch(/te conviene más: Estimación Objetiva \(Módulos\)/);
  });

  /**
   * [año] El <title> sale de FISCAL_IRPF_META.vigencia = '2026' (b7ec248c), y og:title y
   * twitter:title no llevan año. Es coherente con lo que aplica el motor (ver cabecera de este
   * bloque). Al re-sellar el módulo en enero, este literal se actualiza con él.
   */
  test('[año] el title anuncia 2026, de FISCAL_IRPF_META.vigencia, y og/twitter no llevan año', async ({
    page,
  }) => {
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

  /**
   * Hallazgo 2546 — REPARADO (01/10/2026). El sello del primer DataReference anunciaba
   * «IRPF 2025», escrito a mano en page.tsx (`normativa="IRPF 2025"`), mientras el <title> de la
   * misma página dice 2026, sacado de FISCAL_IRPF_META.vigencia — el mismo META que ese
   * DataReference cita como fuente y fecha. Hoy el sello interpola esa misma vigencia, así que
   * title y sello se mueven juntos al re-sellar el módulo.
   */
  test('[año] el DataReference del IRPF anuncia el mismo año que el title', async ({ page }) => {
    const anio = (await page.title()).match(/Autónomos (\d{4})/)?.[1];
    expect(anio).toBe('2026');
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).toContainText(`IRPF ${anio}`, { timeout: 1000 });
  });

  /**
   * Hallazgo 2547 — REPARADO (01/10/2026). La nota del primer DataReference enseñaba al usuario
   * un identificador de código, «(TRAMOS_RETA_2025)», cuyo sufijo además contradecía al dato: esa
   * tabla es la de la Orden PJC/297/2026 (FISCAL_AUTONOMOS_META.vigencia = '2026'), como dice el
   * cuarto DataReference de la misma página. Hoy la nombra en lenguaje llano, «tabla de tramos
   * del RETA de la Orden PJC/297/2026», con la Orden sacada de FISCAL_AUTONOMOS_META.fuente.
   * Se mira además el body entero: ningún texto visible debe enseñar un identificador.
   */
  test('[RETA] ninguna nota visible enseña un identificador de código', async ({ page }) => {
    const referencias = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencias.first()).not.toContainText(/[A-Z]+_[A-Z_]+\d{4}/, { timeout: 1000 });
    await expect(referencias.first()).toContainText('tabla de tramos del RETA de la Orden PJC/297/2026');
    // La misma Orden que el cuarto sello, el de la cotización de autónomos.
    await expect(referencias.nth(3)).toContainText('Orden PJC/297/2026');
    expect(await page.locator('body').innerText()).not.toMatch(/\b[A-Z]+_[A-Z_]+_\d{4}\b/);
  });

  /**
   * ABIERTO, hallazgo 2545 (01/10/2026): con la actividad Bar / Cafetería la app pinta el deslizador
   * «Personal no asalariado (incluido titular)» en el panel de módulos, pero la fórmula del bar
   * del motor (`1.500 × mesas + 800 × asalariados + 6 × m² + 0,05 × kWh`) no lo usa, y tampoco
   * cambia la elegibilidad (con m² > 0 ya es apta). Moverlo de 1 a 3 no mueve ninguna cifra.
   * Bar de partida: 1.500 × 6 + 800 + 6 × 50 + 0,05 × 10.000 = 10.600 € con 1 o con 3.
   * Pasa si se repara de cualquiera de las dos formas: retirando el control del bar o haciendo
   * que cuente.
   *
   * ⚠️ 01/10/2026 — NO se repara en la vista, a propósito. El término SÍ existe en la norma:
   * Orden HAC/1425/2025 (BOE núm. 297, 11/12/2025, Anexo II, pág. 162779), «Actividad: Otros
   * cafés y bares · Epígrafe I.A.E.: 673.2», módulo 2 «Personal no asalariado · Persona ·
   * 11.413,08» € de rendimiento anual por unidad (los demás módulos del epígrafe son personal
   * asalariado, potencia eléctrica en kW, mesas, longitud de barra y máquinas tipo «A» y «B»:
   * ni m² ni kWh). Retirar el control enseñaría que el personal no asalariado no cuenta en un
   * bar, que es falso; lo que falta es el término en la fórmula del motor compartido con el MCP
   * de Delegum (lib/calculadoras/modulosVsDirecta.ts), fuera del ámbito de esta reparación.
   */
  test('[bar] el deslizador de personal no asalariado mueve el rendimiento de módulos (o no se muestra)', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO, hallazgo 2545: en Bar el «Personal no asalariado» se muestra y no mueve ninguna cifra (falta el término en el motor)');
    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('10.600,00 €');
    if ((await page.locator('#pNoAsal').count()) === 0) return; // reparado retirándolo
    await deslizar(page, 'pNoAsal', 3);
    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).not.toBe('10.600,00 €');
  });

  /**
   * Hallazgo 2548 — REPARADO (01/10/2026). Las tarjetas «Casos típicos» del bloque educativo no
   * llegaron a la reparación del 2444. Dicen «ED tributa sobre 65.000 € de rendimiento» (bar,
   * 90.000/25.000) y «ED tributa sobre solo 5.000 € de beneficio real» (bar, 60.000/55.000),
   * es decir, ingresos − gastos sin la cuota RETA. Los presets de la app con esas mismas cifras
   * (RETA 320 €/mes) calculan un rendimiento neto previo de 61.160,00 € y 1160,00 €
   * (90.000 − 25.000 − 3.840 y 60.000 − 55.000 − 3.840).
   *
   * Reparado: las tarjetas toman ingresos, gastos y cuota de los propios presets y el
   * rendimiento del mismo motor, así que dicen «Ingresos 90.000 €, gastos 25.000 € y cuota RETA
   * de 320 €/mes. ED parte de un rendimiento neto de 61.160 €» y «… ED parte de solo 1160 €»
   * (resueltas a mano arriba; 4 cifras enteras sin agrupar, como manda la RAE). Se exigen las
   * cifras correctas, no solo la ausencia de las viejas.
   */
  test('[educativo] las tarjetas de casos típicos no contradicen la deducción de la cuota RETA', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Aplicar caso Bar pequeño rentable/ }).click();
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('61.160,00 €');
    await page.getByRole('button', { name: /Aplicar caso Bar con pérdidas/ }).click();
    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('1160,00 €');

    const tarjeta = (titulo: string) => page.locator('h4', { hasText: titulo }).locator('xpath=..');
    await expect(tarjeta('Bar pequeño con margen alto')).not.toContainText('tributa sobre 65.000 €', {
      timeout: 1000,
    });
    await expect(tarjeta('Bar con pérdidas o margen bajo')).not.toContainText('tributa sobre solo 5.000 €', {
      timeout: 1000,
    });
    await expect(tarjeta('Bar pequeño con margen alto')).toContainText(/rendimiento neto de 61\.160\s€/);
    await expect(tarjeta('Bar pequeño con margen alto')).toContainText(/cuota RETA de 320\s€\/mes/);
    await expect(tarjeta('Bar con pérdidas o margen bajo')).toContainText(/solo 1160\s€ de rendimiento neto/);
  });

  /**
   * Hallazgo 2549 — REPARADO (01/10/2026): el faqJsonLd de metadata.ts escribía a mano los tres límites
   * de exclusión («250.000 €», «125.000 €», «250.000 €») y la Orden de módulos («Orden
   * HAC/1425/2025, de 9 de diciembre (BOE-A-2025-25272)», «Orden HAC/1347/2024»), que la página
   * deriva de LIMITES_EXCLUSION_MODULOS_2025 y ORDEN_MODULOS_VIGENTE. Hoy coinciden, así que
   * este testigo PASA: no detecta el literal, vigila la DERIVA. Compara el FAQPage —lo que leen
   * los buscadores con IA— con lo que la página pinta desde data/fiscal; cuando se re-selle la
   * Orden de 2027, si el FAQPage no se mueve con ella, este test se pone en rojo.
   *
   * Reparado: metadata.ts interpola ORDEN_MODULOS_VIGENTE (referencia, fecha, BOE, ejercicio y
   * anterior) y LIMITES_EXCLUSION_MODULOS_2025, y el año de la pregunta sale de
   * ORDEN_MODULOS_VIGENTE.ejercicio, el mismo que el aviso de elegibilidad («para 2026»).
   */
  test('[FAQPage] cita la misma Orden y los mismos límites que la página deriva de data/fiscal', async ({
    page,
  }) => {
    const faq = await page.evaluate(
      () =>
        [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((s) => s.textContent ?? '')
          .find((t) => t.includes('"FAQPage"')) ?? ''
    );
    expect(faq).not.toBe('');

    // Aviso de elegibilidad del panel de módulos: ORDEN_MODULOS_VIGENTE.referencia y .boe.
    const aviso = await page.locator('p', { hasText: 'Solo determinadas actividades pueden acogerse' }).innerText();
    const orden = aviso.match(/Orden HAC\/\d+\/\d{4}/)?.[0];
    const boe = aviso.match(/BOE-A-\d{4}-\d+/)?.[0];
    expect(orden).toBe('Orden HAC/1425/2025');
    expect(boe).toBe('BOE-A-2025-25272');
    expect(faq).toContain(orden);
    expect(faq).toContain(boe);
    // El año de la pregunta es el ejercicio de la Orden que pinta el aviso, no un literal.
    const ejercicio = aviso.match(/método para (\d{4})/)?.[1];
    expect(ejercicio).toBe('2026');
    expect(faq).toContain(`módulos en ${ejercicio}?`);

    // FAQ del bloque educativo «¿Qué pasa si supero los límites…?», de LIMITES_EXCLUSION_MODULOS_2025.
    const limites = (
      await page.locator('strong', { hasText: '¿Qué pasa si supero los límites de módulos?' }).locator('xpath=..').textContent()
    )?.replace(/\s+/g, ' ');
    const cifras = [...(limites ?? '').matchAll(/(\d{1,3}(?:\.\d{3})+),00\s€/g)].map((m) => m[1]);
    expect(cifras).toEqual(['250.000', '125.000', '250.000']);
    for (const c of new Set(cifras)) expect(faq).toContain(`${c} €`);
  });
});

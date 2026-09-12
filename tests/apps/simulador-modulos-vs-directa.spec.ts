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

const RUTA = '/simulador-modulos-vs-directa/';

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

/** Mueve un input[type=range] controlado por React (fill() no dispara su onChange). */
async function mover(page: Page, id: string, valor: number): Promise<void> {
  await page.evaluate(
    ([id, valor]) => {
      const el = document.getElementById(id as string) as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )!.set!;
      setter.call(el, String(valor));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    [id, valor] as [string, number]
  );
}

test.describe('Simulador Módulos vs Estimación Directa — re-inspección 31/08/2026', () => {
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
    await page.goto(RUTA);
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
    await page.goto(RUTA, { waitUntil: 'networkidle' });
    // Sin esperar a que React hidrate, el primer `mover()` justo tras `goto()` puede
    // llegar antes de que el listener de React esté enganchado y el evento se pierde
    // (el DOM cambia, el estado no) — visto al ejecutar este test la primera vez.
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
    await page.goto(RUTA);
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
    await page.goto(RUTA);
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
    await page.goto(RUTA);
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
    await page.goto(RUTA);
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

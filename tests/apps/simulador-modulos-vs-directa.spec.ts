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
   *   − Mínimo personal 5.550                      → base liquidable 57.450
   *   IRPF: 12.450×19% + 7.750×24% + 15.000×30% + 22.250×37%
   *       = 2.365,50 + 1.860,00 + 4.500,00 + 8.232,50 = 16.958,00
   *   + RETA 320×12 = 3.840,00  →  Coste ED = 20.798,00 €
   *
   * Módulos (fórmula propia de la app, NO oficial — ver cabecera):
   *   Rendimiento previo = 1.500×8 + 800×1 + 6×60 + 0,05×12.000 = 12.000+800+360+600 = 13.760
   *   − Reducción 5% (tope 2.000) = −688,00  · − incentivo empleo (1×100) = −100,00
   *   Reducido = 12.972  · − Mínimo personal 5.550 → base liquidable 7.422
   *   IRPF (solo primer tramo, 7.422 < 12.450) = 7.422 × 19% = 1.410,18
   *   + RETA 3.840,00  →  Coste Módulos = 5.250,18 €
   *
   * Diferencia = 20.798,00 − 5.250,18 = 15.547,82 → módulos gana ("MENOS con módulos").
   */
  test('CASO 1 (normal) — bar rentable: ED 20.798,00 € vs Módulos 5.250,18 €, gana módulos', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Aplicar caso Bar pequeño rentable/ }).click();

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('65.000,00 €');
    expect(await linea(page, ED, '= Base liquidable')).toBe('57.450,00 €');
    expect(await linea(page, ED, 'IRPF por tramos')).toBe('16.958,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('20.798,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('13.760,00 €');
    expect(await linea(page, MOD, '= Base liquidable')).toBe('7422,00 €');
    expect(await linea(page, MOD, 'IRPF por tramos')).toBe('1410,18 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('5250,18 €');
    // Con mesas > 0, la app declara la actividad apta para módulos (sin aviso de exclusión)
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('15.547,82 € MENOS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Objetiva \(Módulos\)/
    );
  });

  /**
   * CASO 2 (LÍMITE) — tramo superior de IRPF (45%) alcanzable con los deslizadores al
   * máximo: ingresos 200.000 € (tope del slider), gastos 0 €, RETA 600 €/mes (tope del
   * slider), actividad Taxi con vehículo afecto = 1 (el único parámetro que taxi expone).
   * El slider de ingresos tope en 200.000 € nunca deja alcanzar el tramo del 47% (desde
   * 300.000 €), así que el tramo más alto que la UI puede ejercitar es el 45%.
   *
   * ED (ancla: TRAMOS_IRPF_2025):
   *   Rendimiento neto previo = 200.000 − 0 = 200.000
   *   − Reducción 5% (tope 2.000, porque 200.000×5%=10.000 > tope) → reducido 198.000
   *   − Mínimo personal 5.550 → base liquidable 192.450
   *   IRPF: 12.450×19% + 7.750×24% + 15.000×30% + 24.800×37% + 132.450×45%
   *       = 2.365,50+1.860,00+4.500,00+9.176,00+59.602,50 = 77.504,00
   *   + RETA 600×12 = 7.200,00 → Coste ED = 84.704,00 €
   *
   * Módulos (taxi, fórmula propia — ver cabecera): 6.800 × vehículo(1) = 6.800
   *   − Reducción 5% (min(340,2000)) = −340,00 · − incentivo empleo (taxi no expone
   *   personal asalariado → 0) = −0,00 → reducido 6.460 → − mínimo 5.550 → base 910
   *   IRPF (910 < 12.450, tramo 19%) = 910 × 19% = 172,90
   *   + RETA 7.200,00 → Coste Módulos = 7.372,90 €
   *
   * Diferencia = 84.704,00 − 7.372,90 = 77.331,10 → módulos gana con muchísimo margen,
   * porque el rendimiento estimado de un taxi (6.800 €) es minúsculo frente al beneficio
   * real de 200.000 € que tributa por tramos hasta el 45%.
   */
  test('CASO 2 (límite, tramo 45% IRPF) — sliders al máximo + Taxi: ED 84.704,00 € vs Módulos 7.372,90 €', async ({
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
    expect(await linea(page, ED, '= Base liquidable')).toBe('192.450,00 €');
    // Tramo 45% ejercitado: sin él (parando en 37%) el IRPF sería 17.901,50 €, no 77.504,00 €
    expect(await linea(page, ED, 'IRPF por tramos')).toBe('77.504,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('84.704,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('6800,00 €');
    expect(await linea(page, MOD, '= Base liquidable')).toBe('910,00 €');
    expect(await linea(page, MOD, 'IRPF por tramos')).toBe('172,90 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('7372,90 €');
    expect(await panel(page, MOD)).not.toContain('NO es elegible');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('77.331,10 € MENOS con módulos');
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
   *   − Reducción 5% (tope 2.000) = −2.000 → reducido 40.000 → − mínimo 5.550 → base 34.450
   *   IRPF: 12.450×19% + 7.750×24% + 14.250×30% = 2.365,50+1.860,00+4.275,00 = 8.500,50
   *   + RETA 300×12 = 3.600,00 → Coste ED = 12.100,50 €
   *
   * Módulos (comercio_menor, personalAsalariado=0, personalNoAsalariado=1, superficie=0):
   *   Rendimiento previo = 4.500×1 + 1.000×0 + 8×0 = 4.500
   *   − Reducción 5% (min(225,2000)) = −225,00 · − incentivo empleo (0×100) = 0,00
   *   Reducido = 4.275 · − Mínimo personal 5.550 → base liquidable max(0, −1.275) = 0,00
   *   IRPF = 0,00 · + RETA 3.600,00 → Coste Módulos = 3.600,00 € (cifra que la app YA NO
   *   anuncia como ahorro, porque `esApta` es false)
   */
  test('CASO 3 (rechazo) — "profesional puro" no apto para módulos: recomienda ED sin comparar importes', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Aplicar caso Profesional puro/ }).click();

    expect(await linea(page, ED, '= Base liquidable')).toBe('34.450,00 €');
    expect(await linea(page, ED, 'IRPF por tramos')).toBe('8500,50 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('12.100,50 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('4500,00 €');
    expect(await linea(page, MOD, '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, MOD, 'IRPF por tramos')).toBe('0,00 €');
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
    const referencia = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(referencia).toContainText('IRPF 2025');
    await expect(referencia).toContainText('fórmula didáctica simplificada');
  });
});

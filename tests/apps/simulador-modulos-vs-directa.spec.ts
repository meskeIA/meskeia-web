/**
 * Inspector — simulador-modulos-vs-directa (segmento FISCAL, riesgo 1 CRÍTICO)
 *
 * Inspección del 31/08/2026. Compara Estimación Directa Simplificada (ED) vs Estimación
 * Objetiva (Módulos) para autónomos: IRPF por tramos + cuota RETA anual, con 4 casos
 * preconfigurados y un selector de 5 actividades para módulos.
 *
 * De dónde sale cada cifra:
 *
 *  IRPF (la escala que decide la ED y la parte final de módulos) — `data/fiscal/irpf.ts`,
 *  `TRAMOS_IRPF_2025` (FISCAL_IRPF_META: Ley 35/2006 IRPF texto consolidado arts. 57-66,
 *  verificado 2026-08-12): 19% hasta 12.450 · 24% hasta 20.200 · 30% hasta 35.200 ·
 *  37% hasta 60.000 · 45% hasta 300.000 · 47% en adelante. El mínimo personal que la app
 *  hardcodea (`MINIMO_PERSONAL_ORIENTATIVO = 5550`) SÍ coincide con
 *  `MINIMOS_IRPF_2025.personal` del mismo módulo, aunque la app no lo importa (ver hallazgo
 *  de tipo "dato" en el acta).
 *
 *  ⚠️ El lado de MÓDULOS no tiene ancla en `data/fiscal`: no existe ningún módulo con
 *  coeficientes reales de Estimación Objetiva por actividad. El propio código lo admite en
 *  su comentario ("Fórmulas didácticas orientativas por actividad — NO son los módulos
 *  reales"), así que las cifras de módulos de estos tests verifican que la app aplica
 *  CORRECTAMENTE su propia fórmula documentada — no que esa fórmula sea la Orden HFP real,
 *  que no existe en el repositorio. Es precisamente el hallazgo de tipo "dato" más grave del
 *  acta: `metadata.ts` (jsonLd y FAQ) afirma que la comparativa está "basada en LPGE 2025 y
 *  Orden HFP de módulos 2024", una afirmación que el propio código contradice.
 *
 * Fórmulas de módulos usadas por la app (page.tsx, `calcularRendimientoModulos`):
 *   bar:            1.500 €/mesa + 800 €/asalariado + 6 €/m² + 0,05 €/kWh
 *   comercio_menor: 4.500 €/no-asalariado + 1.000 €/asalariado + 8 €/m²
 * Reducciones de módulos: 5% (tope 2.000 €) + 100 €/asalariado (incentivo empleo).
 *
 * Formato: `formatCurrency` (es-ES, agrupación "min2") pinta los importes de 4 dígitos
 * enteros SIN punto de millares (5250,18 €) y los de 5 o más, CON él (20.798,00 €). Las
 * cifras esperadas se escriben literales, tal cual las pinta la app.
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

test.describe('Simulador Módulos vs Estimación Directa — inspección 31/08/2026', () => {
  /**
   * CASO 1 (NORMAL) — preset "Bar pequeño rentable": ingresos 90.000 €, gastos 25.000 €,
   * RETA 320 €/mes; bar con 1 asalariado, 1 no asalariado, 60 m², 12.000 kWh, 8 mesas.
   *
   * ED (ancla: TRAMOS_IRPF_2025):
   *   Rendimiento neto previo = 90.000 − 25.000 = 65.000
   *   − Reducción 5% (tope 2.000)                 = −2.000  → reducido 63.000
   *   − Mínimo personal                            = −5.550  → base liquidable 57.450
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
   * CASO 2 (LÍMITE — cero ingresos) — preset "Comercio mediano" con ingresos y gastos
   * llevados a 0 (deslizadores al mínimo). Aísla el efecto que el propio bloque educativo de
   * la app describe: "en módulos tributas igual aunque tengas pérdidas reales" — aquí ni
   * siquiera hay ingresos y módulos sigue generando una cuota positiva, mientras ED cae a
   * solo la cuota RETA.
   *
   * Datos del preset que NO se tocan: RETA 300 €/mes; comercio_menor, 1 asalariado,
   * 1 no asalariado, 80 m² (mesas/kWh/vehículo del preset son 0 y no los usa la fórmula de
   * comercio_menor).
   *
   * ED (ancla: TRAMOS_IRPF_2025): ingresos 0 − gastos 0 = 0 de rendimiento → todas las
   * reducciones son 0 → base liquidable 0 → IRPF 0. Coste ED = solo RETA 300×12 = 3.600,00 €.
   *
   * Módulos (fórmula propia, NO oficial):
   *   Rendimiento previo = 4.500×1(no asalariado) + 1.000×1(asalariado) + 8×80(m²)
   *                      = 4.500 + 1.000 + 640 = 6.140
   *   − Reducción 5% (min(307,2000)) = −307,00 · − incentivo empleo (1×100) = −100,00
   *   Reducido = 5.733 · − Mínimo personal 5.550 → base liquidable 183,00
   *   IRPF = 183 × 19% = 34,77  ·  + RETA 3.600,00  →  Coste Módulos = 3.634,77 €
   *
   * Diferencia = 3.634,77 − 3.600,00 = 34,77 → ED gana por un margen mínimo ("MÁS con
   * módulos"), justo lo contrario del Caso 1: con ingresos altos ganaba módulos, con
   * ingresos a cero gana ED, coherente con lo que la propia app enseña.
   */
  test('CASO 2 (límite, cero ingresos) — comercio sin ingresos: ED 3.600,00 € vs Módulos 3.634,77 €, gana ED', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /Aplicar caso Comercio mediano/ }).click();
    await mover(page, 'ingresos', 0);
    await mover(page, 'gastos', 0);

    expect(await linea(page, ED, '= Rendimiento neto previo')).toBe('0,00 €');
    expect(await linea(page, ED, '= Base liquidable')).toBe('0,00 €');
    expect(await linea(page, ED, 'IRPF por tramos')).toBe('0,00 €');
    expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('3600,00 €');

    expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('6140,00 €');
    expect(await linea(page, MOD, '= Base liquidable')).toBe('183,00 €');
    expect(await linea(page, MOD, 'IRPF por tramos')).toBe('34,77 €');
    expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3634,77 €');

    const estado = await page.locator('[role="status"]').innerText();
    expect(estado.replace(/\s+/g, ' ')).toContain('34,77 € MÁS con módulos');
    expect(await page.locator('body').innerText()).toMatch(
      /te conviene más: Estimación Directa Simplificada/
    );
  });

  /**
   * CASO 3 (RECHAZO) — preset "Profesional puro" (0 asalariados, 0 m², 0 mesas, 0 vehículo,
   * comercio_menor). El propio preset lo etiqueta en la UI como "NO puede acogerse a
   * módulos — solo ED", y la app efectivamente marca `esApta = false` y pinta el aviso "NO
   * es elegible para módulos" en la columna de módulos.
   *
   * ⚠️ HALLAZGO (queda documentado con `test.fail()`, no se repara aquí): la caja de
   * recomendación final NO comprueba esa bandera y compara solo importes, así que para este
   * mismo perfil —que la propia app acaba de decir que NO puede tributar por módulos—
   * termina recomendando "Estimación Objetiva (Módulos)" y anunciando un ahorro de
   * 8.500,50 €, contradiciendo el aviso que aparece unas líneas más arriba en la misma
   * pantalla. Es el hallazgo de mayor severidad del acta (tipo "calculo", crítico): un
   * simulador fiscal crítico no puede recomendar un régimen que el mismo cálculo acaba de
   * excluir.
   *
   * ED (ancla: TRAMOS_IRPF_2025): ingresos 50.000, gastos 8.000 → rendimiento 42.000
   *   − Reducción 5% (tope 2.000) = −2.000 → reducido 40.000 → − mínimo 5.550 → base 34.450
   *   IRPF: 12.450×19% + 7.750×24% + 14.250×30% = 2.365,50+1.860,00+4.275,00 = 8.500,50
   *   + RETA 300×12 = 3.600,00 → Coste ED = 12.100,50 €
   *
   * Módulos (fórmula propia, NO oficial; comercio_menor con personalAsalariado=0,
   * personalNoAsalariado=1, superficie=0):
   *   Rendimiento previo = 4.500×1 + 1.000×0 + 8×0 = 4.500
   *   − Reducción 5% (min(225,2000)) = −225,00 · − incentivo empleo (0×100) = 0,00
   *   Reducido = 4.275 · − Mínimo personal 5.550 → base liquidable max(0, −1.275) = 0,00
   *   IRPF = 0,00 · + RETA 3.600,00 → Coste Módulos = 3.600,00 €
   */
  test.fail(
    'CASO 3 (rechazo) — "profesional puro" no apto para módulos, pero la recomendación igualmente lo aconseja',
    async ({ page }) => {
      await page.goto(RUTA);
      await page.getByRole('button', { name: /Aplicar caso Profesional puro/ }).click();

      expect(await linea(page, ED, '= Base liquidable')).toBe('34.450,00 €');
      expect(await linea(page, ED, 'IRPF por tramos')).toBe('8500,50 €');
      expect(await linea(page, ED, 'Coste fiscal anual total')).toBe('12.100,50 €');

      expect(await linea(page, MOD, 'Rendimiento neto previo (módulos)')).toBe('4500,00 €');
      expect(await linea(page, MOD, '= Base liquidable')).toBe('0,00 €');
      expect(await linea(page, MOD, 'IRPF por tramos')).toBe('0,00 €');
      expect(await linea(page, MOD, 'Coste fiscal anual total')).toBe('3600,00 €');

      // La app SÍ avisa de que la actividad no es elegible para módulos...
      expect(await panel(page, MOD)).toContain('NO es elegible para módulos');

      // ...pero la recomendación final la ignora y aconseja módulos igualmente. Esta
      // aserción es la que hace fallar el test a propósito (hallazgo abierto):
      // lo correcto sería que, con esApta=false, NO se recomendara Estimación Objetiva.
      const cuerpo = await page.locator('body').innerText();
      expect(cuerpo).not.toMatch(/te conviene más: Estimación Objetiva \(Módulos\)/);
    }
  );
});

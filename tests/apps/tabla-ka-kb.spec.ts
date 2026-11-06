import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — tabla-ka-kb (segmento cálculo, modo primera, con el cabo C0086)
 *
 * Primera inspección: 05/11/2026. La app promete en su <h1> «Tabla de Constantes de Acidez y
 * Basicidad» y en el subtítulo «64 entradas a 25 °C con su equilibrio escrito, Ka, pKa, la
 * especie conjugada y su Kb. Incluye calculadora de pH con control de la aproximación del 5 % y
 * calculadora de disolución reguladora con Henderson-Hasselbalch». Todo vive en page.tsx: el
 * array ESPECIES (64 filas), `constantesDe` (Ka·Kb = Kw) y `calcularPh` (raíz positiva de
 * x² + K·x − K·C = 0, SIN Kw), más Henderson-Hasselbalch en `resultadoTampon`.
 *
 * Las constantes de la tabla NO se cotejaron con una fuente externa: el único dominio de
 * referencia permitido (iupac.org) devolvió 504. Por eso los esperados de abajo toman la Ka/Kb
 * que DECLARA la propia app como dato de entrada y comprueban el CÁLCULO, no el dato. Kw es
 * 1,0×10⁻¹⁴ (25 °C), el mismo que declara la app.
 *
 * ESPERADOS, RESUELTOS APARTE ANTES DE ABRIR LA APP (.inspector-trabajo/tabla-ka-kb-esperados.mjs)
 *
 *   CASO 1 · normal
 *     Amoníaco 0,1 M, Kb 1,8×10⁻⁵: x = (−Kb + √(Kb² + 4·Kb·C))/2 = 1,332671×10⁻³ M
 *       → pOH 2,8753 → «2,88» · pH 11,1247 → «11,12» · grado 1,3327 % → «1,33 %»
 *       · aproximación √(Kb·C) = 1,341641×10⁻³ → «1,34×10⁻³ M», 1,34 % ≤ 5 % → válida.
 *     Acético 0,1 M, Ka 1,8×10⁻⁵: la misma x → pH «2,88», pOH «11,12», [H₃O⁺] «1,33×10⁻³ M».
 *       Con Kw el pH es el mismo a la cuarta cifra (2,8753): aquí la falta de Kw no se nota.
 *     Tampón acético 0,1 / 0,02: pKa = −log 1,8×10⁻⁵ = 4,7447 → pH = 4,7447 + log 0,2 = 4,0458
 *       → «4,05», proporción «0,20», rango «de 3,74 a 5,74», dentro del rango.
 *     Fila del acético: Kb = 10⁻¹⁴/1,8×10⁻⁵ = 5,556×10⁻¹⁰ → «5,6×10⁻¹⁰»; pKa + pKb = 4,74 + 9,26.
 *
 *   CASO 2 · límite
 *     Tricloroacético 0,1 M, Ka 0,22 (la mayor de la tabla): x = 7,466185×10⁻² → pH 1,1269 «1,13»,
 *       grado 74,66 %, aproximación 1,48×10⁻¹ M (148 % de C) → «Aproximación no válida».
 *     Ca(OH)₂ 0,01 M: [OH⁻] = 2·C = 0,02 → pOH 1,6990 «1,70» → pH 12,3010 «12,30».
 *     Tampón acético 1 / 0,01 (proporción 0,01): pH 2,7447 «2,74», fuera del rango.
 *     Tampón acético 0,01 / 0,1 (proporción 10, el borde de arriba): pH 5,7447 «5,74», dentro.
 *
 *   CASO 3 · rechazo
 *     «0», «-0,1», «abc», «0,1abc» y vacío no son una concentración: sin pH y con el mensaje
 *     «Introduce una concentración mayor que cero para ver el pH.». Tampón con [base] 0: su
 *     mensaje equivalente.
 *
 *   CABO C0086 · el pH sin Kw (balance de cargas [H⁺] = Ka·C/([H⁺]+Ka) + Kw/[H⁺])
 *     HCl 10⁻⁸ M: [H⁺] = (C + √(C² + 4Kw))/2 = 1,0512×10⁻⁷ → pH 6,9783 «6,98» · la app: 8,00
 *     HCl 10⁻⁷ M: → 6,7910 «6,79» · la app: 7,00
 *     Fenol 10⁻⁵ M, Ka 1,0×10⁻¹⁰: → 6,9793 «6,98» · la app (√(Ka·C) = 3,16×10⁻⁸): 7,50
 *     Fenol 10⁻⁶ M: → 6,9978 «7,00» · la app: 8,00
 *     Urea 0,1 M, Kb 1,5×10⁻¹⁴: [OH⁻]² ≈ Kb·C + Kw → pH 7,0303 «7,03» · la app: 6,59
 *     NaOH 10⁻⁸ M: → 7,0217 «7,02» · la app: 6,00
 *     CONFIRMADO: ácidos con pH > 7 y bases con pH < 7 en pantalla, con el aviso de dilución
 *     debajo (que dice «el pH real se acerca a 7» pero no que la cifra esté mal) y, en el fenol,
 *     con el «✅ Aproximación válida… es correcto» a la vez.
 *
 * Los casos 1, 2 y 3 coinciden con lo resuelto a mano. Lo que la inspección encontró mal va al
 * final, en tests HALLAZGO con test.fail() mientras sigan abiertos: el C0086, los aniones
 * anfóteros, la 2.ª disociación del H₂SO₄, el tampón en el borde 1/10, Henderson-Hasselbalch con
 * ácidos de Ka grande, la nota «coincide con el exacto», tres notas comparativas y el «%».
 */

const RUTA = '/tabla-ka-kb/';
const ENTRADAS = ['#concentracion-ph', '#conc-acido', '#conc-base', '#buscador-kakb'];

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ENTRADAS);
}

const panelPh = (page: Page): Locator =>
  page.locator('section[aria-labelledby="titulo-calculadora-ph"] [role="status"]');
const panelTampon = (page: Page): Locator =>
  page.locator('section[aria-labelledby="titulo-calculadora-tampon"] [role="status"]');

/** Elige especie y concentración en la calculadora de pH, comprobando que React las recogió. */
async function calcularPh(page: Page, id: string, concentracion: string): Promise<void> {
  await page.selectOption('#especie-ph', id);
  await esperarValorEnReact(page, '#especie-ph', id);
  await page.fill('#concentracion-ph', concentracion);
  await esperarValorEnReact(page, '#concentracion-ph', concentracion);
}

async function calcularTampon(page: Page, id: string, acido: string, base: string): Promise<void> {
  await page.selectOption('#especie-tampon', id);
  await esperarValorEnReact(page, '#especie-tampon', id);
  await page.fill('#conc-acido', acido);
  await esperarValorEnReact(page, '#conc-acido', acido);
  await page.fill('#conc-base', base);
  await esperarValorEnReact(page, '#conc-base', base);
}

/** La cifra grande del panel («pH de la disolución» o «pH del tampón»). */
const cifra = (panel: Locator): Locator => panel.locator('[class*="resultadoValor"]');
const subtitulo = (panel: Locator): Locator => panel.locator('[class*="resultadoSub"]');
/** El <dd> de una fila del desglose, por su rótulo. */
const dato = (panel: Locator, rotulo: string): Locator =>
  panel.locator('dl > div', { has: panel.page().locator('dt', { hasText: rotulo }) }).locator('dd');

/** «1.234,56» o «-5,00» → número */
const leerNumero = (texto: string): number =>
  Number(texto.trim().replace(/\./g, '').replace(',', '.').replace('−', '-'));

async function phEnPantalla(page: Page): Promise<number> {
  return leerNumero((await cifra(panelPh(page)).textContent()) ?? '');
}

async function idsVisibles(page: Page): Promise<string[]> {
  return page
    .locator('li button[aria-controls^="detalle-"]')
    .evaluateAll((bs) => bs.map((b) => (b.getAttribute('aria-controls') ?? '').replace('detalle-', '')));
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.fill('#buscador-kakb', termino);
  await esperarValorEnReact(page, '#buscador-kakb', termino);
}

test.describe('Inspección del 05/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 · normal: amoníaco y acético 0,1 M, tampón acético 0,1/0,02 y la fila del acético', async ({ page }) => {
    const panel = panelPh(page);

    // Se parte del estado por defecto (acético 0,1): primero OTRA especie, para que el caso mueva algo.
    await calcularPh(page, 'amoniaco', '0,1');
    await expect(cifra(panel)).toHaveText('11,12');
    await expect(subtitulo(panel)).toHaveText('pOH = 2,88 · [OH⁻] = 1,33×10⁻³ M');
    await expect(dato(panel, 'Grado de disociación')).toHaveText(/^1,33\s%$/);
    await expect(dato(panel, 'Valor con la aproximación')).toHaveText('1,34×10⁻³ M');
    await expect(panel).toContainText('Aproximación válida.');

    await calcularPh(page, 'acetico', '0,1');
    await expect(cifra(panel)).toHaveText('2,88');
    await expect(subtitulo(panel)).toHaveText('pOH = 11,12 · [H₃O⁺] = 1,33×10⁻³ M');
    await expect(panel).not.toContainText('autoionización');

    // Henderson-Hasselbalch
    const tampon = panelTampon(page);
    await calcularTampon(page, 'acetico', '0,1', '0,02');
    await expect(cifra(tampon)).toHaveText('4,05');
    await expect(subtitulo(tampon)).toHaveText('pKa = 4,74 · proporción base/ácido = 0,20');
    await expect(dato(tampon, 'Sustitución')).toHaveText('pH = 4,74 + log(0,20) = 4,05');
    await expect(dato(tampon, 'Rango útil')).toHaveText('de 3,74 a 5,74');
    await expect(tampon).toContainText('Dentro del rango útil.');

    // La fila del acético: Kb del acetato y la comprobación Ka·Kb = Kw
    await page.locator('li button[aria-controls="detalle-acetico"]').click();
    const fila = page.locator('#detalle-acetico');
    await expect(fila).toContainText('Ka · Kb = 1,8×10⁻⁵ · 5,6×10⁻¹⁰ = 1,0×10⁻¹⁴ = Kw');
    await expect(fila).toContainText('pKa + pKb = 4,74 + 9,26 = 14,00');
  });

  test('CASO 1.bis · buscador y filtros: coloquial y sin tilde, por fórmula y por categoría', async ({ page }) => {
    const contador = page.locator('[class*="contador"]');
    await expect(contador).toHaveText('64 de 64 especies');

    await buscar(page, 'vinagre');
    expect(await idsVisibles(page)).toEqual(['acetico']);
    await expect(contador).toHaveText('1 de 64 especies');
    await buscar(page, 'lejia'); // sin tilde: «lejía» está en el campo de búsqueda del hipocloroso
    expect(await idsVisibles(page)).toEqual(['hclo']);
    // Desde el 06/11/2026 (cabo C0607) la fórmula sin subíndices es la misma que con ellos: antes
    // «CH3COOH» solo casaba con el texto de búsqueda del acético y «CH₃COOH» traía además el
    // acetato, cuyo ácido conjugado es CH₃COOH. Ahora las dos dan las dos filas, el ácido primero.
    for (const formula of ['CH3COOH', 'CH₃COOH']) {
      await buscar(page, formula);
      expect(await idsVisibles(page), formula).toEqual(['acetico', 'acetato']);
    }
    // Y dos palabras en cualquier orden: antes «acetico acido» daba 0 y «acido acetico» 2.
    await buscar(page, 'acetico acido');
    expect(await idsVisibles(page)).toContain('acetico');
    await buscar(page, 'NH3');
    const conNH3 = await idsVisibles(page);
    await buscar(page, 'NH₃');
    expect(await idsVisibles(page)).toEqual(conNH3);
    await buscar(page, 'zzzz');
    await expect(contador).toHaveText('0 de 64 especies');
    await expect(page.getByText('No hay ninguna especie que coincida con «zzzz')).toBeVisible();

    await buscar(page, '');
    const filtro = page.getByRole('button', { name: 'Bases débiles', exact: true });
    await filtro.click();
    await expect(filtro).toHaveAttribute('aria-pressed', 'true');
    await expect(contador).toHaveText('10 de 64 especies');
  });

  test('CASO 1.ter · en las 64 filas, pKa + pKb suma 14,00 con las cifras que se pintan', async ({ page }) => {
    const botones = page.locator('li button[aria-controls^="detalle-"]');
    const total = await botones.count();
    expect(total).toBe(64);
    for (let i = 0; i < total; i++) await botones.nth(i).click();
    const sumas = await page.locator('[id^="detalle-"]').evaluateAll((detalles) =>
      detalles.map((d) => {
        const m = (d.textContent ?? '').match(/pKa \+ pKb = ([−-]?[\d.,]+) \+ ([−-]?[\d.,]+) = 14,00/);
        return { id: d.id, pka: m?.[1] ?? null, pkb: m?.[2] ?? null };
      }),
    );
    const conCaja = sumas.filter((s) => s.pka !== null);
    expect(conCaja).toHaveLength(54); // 64 − 7 ácidos fuertes − 3 bases fuertes
    for (const s of conCaja) {
      expect(leerNumero(s.pka as string) + leerNumero(s.pkb as string), s.id).toBeCloseTo(14, 6);
    }
  });

  test('CASO 2 · límite: tricloroacético 0,1 M, Ca(OH)₂ 0,01 M y tampones en los extremos', async ({ page }) => {
    const panel = panelPh(page);
    await calcularPh(page, 'tricloroacetico', '0,1');
    await expect(cifra(panel)).toHaveText('1,13');
    await expect(subtitulo(panel)).toHaveText('pOH = 12,87 · [H₃O⁺] = 7,47×10⁻² M');
    await expect(dato(panel, 'Grado de disociación')).toHaveText(/^74,66\s%$/);
    await expect(dato(panel, 'Valor con la aproximación')).toHaveText('1,48×10⁻¹ M');
    await expect(panel).toContainText('Aproximación no válida.');

    await calcularPh(page, 'caoh2', '0,01');
    await expect(cifra(panel)).toHaveText('12,30');
    await expect(subtitulo(panel)).toHaveText('pOH = 1,70 · [OH⁻] = 2,00×10⁻² M');

    // Desde el 05/11/2026 (hallazgo 4119) la cifra del tampón es la del balance de cargas de la
    // mezcla y Henderson-Hasselbalch queda en «Sustitución». Con 1/0,01, h² + (Cb + Ka)·h − Ka·Ca = 0
    // → h = 1,5554×10⁻³ → pH 2,8082 «2,81»; HH da 2,74 y se aparta más de 0,05, así que avisa.
    const tampon = panelTampon(page);
    await calcularTampon(page, 'acetico', '1', '0,01');
    await expect(cifra(tampon)).toHaveText('2,81');
    await expect(dato(tampon, 'Sustitución')).toHaveText('pH = 4,74 + log(0,01) = 2,74');
    await expect(subtitulo(tampon)).toHaveText('pKa = 4,74 · proporción base/ácido = 0,01');
    await expect(tampon).toContainText('Fuera del rango útil.');
    await expect(tampon).toContainText('Henderson-Hasselbalch no sirve aquí.');

    await calcularTampon(page, 'acetico', '0,01', '0,1');
    await expect(cifra(tampon)).toHaveText('5,74');
    await expect(subtitulo(tampon)).toHaveText('pKa = 4,74 · proporción base/ácido = 10,00');
    await expect(tampon).toContainText('Dentro del rango útil.');
  });

  test('CASO 3 · rechazo: cero, negativo, texto y vacío no dan pH', async ({ page }) => {
    const panel = panelPh(page);
    for (const valor of ['0', '-0,1', 'abc', '0,1abc', '']) {
      await calcularPh(page, 'acetico', valor);
      await expect(panel, `«${valor}»`).toHaveText('Introduce una concentración mayor que cero para ver el pH.');
      await expect(cifra(panel), `«${valor}»`).toHaveCount(0);
    }
    const tampon = panelTampon(page);
    await calcularTampon(page, 'acetico', '0,1', '0');
    await expect(tampon).toHaveText('Introduce dos concentraciones mayores que cero para ver el pH del tampón.');
  });

  /* ═══════════════════════════════════════════════════════════════════════════════════════
   * HALLAZGOS DEL 05/11/2026 (4116-4123), REPARADOS el mismo día en /reparar. calcularPh y el
   * tampón resuelven ahora el balance de cargas con Kw y con todas las constantes de la familia
   * (app/tabla-ka-kb/motor.ts); los esperados de cada test son los del Inspector, resueltos aparte.
   * ═══════════════════════════════════════════════════════════════════════════════════════ */

  test('HALLAZGO 4116 (REPARADO) · cabo C0086: con Kw, ningún ácido da pH > 7 ni ninguna base pH < 7', async ({ page }) => {
    // Antes calcularPh resolvía x² + K·x − K·C = 0 (y en los fuertes [H₃O⁺] = C) sin el agua.
    // Lo que pintaba / lo correcto con Kw (balance de cargas, ver cabecera):
    //   HCl 10⁻⁸ M → 8,00 / 6,98 · HCl 10⁻⁷ M → 7,00 / 6,79 · fenol 10⁻⁵ M → 7,50 / 6,98
    //   fenol 10⁻⁶ M → 8,00 / 7,00 · urea 0,1 M → 6,59 / 7,03 · NaOH 10⁻⁸ M → 6,00 / 7,02
    // Tolerancia 0,05: el defecto era de 0,2 a 1 unidad de pH y la pantalla redondea a 0,005.
    const casos: [string, string, number, 'acido' | 'base'][] = [
      ['hcl', '0,00000001', 6.9783, 'acido'],
      ['hcl', '0,0000001', 6.791, 'acido'],
      ['fenol', '0,00001', 6.9793, 'acido'],
      ['fenol', '0,000001', 6.9978, 'acido'],
      ['urea', '0,1', 7.0303, 'base'],
      ['naoh', '0,00000001', 7.0217, 'base'],
    ];
    for (const [id, conc, esperado, tipo] of casos) {
      await calcularPh(page, id, conc);
      await expect(cifra(panelPh(page))).toBeVisible();
      const ph = await phEnPantalla(page);
      if (tipo === 'acido') expect.soft(ph, `${id} ${conc}: un ácido`).toBeLessThanOrEqual(7);
      else expect.soft(ph, `${id} ${conc}: una base`).toBeGreaterThanOrEqual(7);
      expect.soft(ph, `${id} ${conc}`).toBeCloseTo(esperado, 1);
    }
    // Y el aviso ya no dice que el modelo no incluye el agua: dice que la incluye.
    await calcularPh(page, 'hcl', '0,00000001');
    await expect(panelPh(page)).toContainText('El cálculo los incluye');
    await expect(panelPh(page)).not.toContainText('no los incluye');
    // El fenol 10⁻⁵ M ya no se da por «Aproximación válida»: √(Ka·C) = 3,16×10⁻⁸ frente a 1,05×10⁻⁷.
    await calcularPh(page, 'fenol', '0,00001');
    await expect(panelPh(page)).not.toContainText('Aproximación válida.');
    await expect(panelPh(page)).toContainText('los del agua pesan tanto como ella');
  });

  test('HALLAZGO 4117 (REPARADO) · un anión anfótero se calcula con sus dos constantes', async ({ page }) => {
    // Antes, el pH de HCO₃⁻, H₂PO₄⁻ o HPO₄²⁻ salía de su Ka sola, sin su comportamiento básico.
    // Con las constantes de la propia tabla y el balance de cargas de la sal sódica
    // (Na⁺ + H⁺ = Σ aniones + OH⁻): NaHCO₃ 0,1 M → 8,35 (½(pKa₁+pKa₂) = 8,347; la app daba 5,66
    // y 9,68 en la fila «HCO₃⁻ como base», que ahora da lo mismo: es la misma disolución).
    // NaH₂PO₄ 0,1 M → 4,68 (daba 4,10); Na₂HPO₄ 0,1 M → 9,72 (daba 6,66).
    const casos: [string, number][] = [
      ['h2co3-2', 8.347],
      ['bicarbonato-base', 8.347],
      ['h3po4-2', 4.682],
      ['h3po4-3', 9.722],
    ];
    for (const [id, esperado] of casos) {
      await calcularPh(page, id, '0,1');
      await expect(cifra(panelPh(page))).toBeVisible();
      expect.soft(await phEnPantalla(page), id).toBeCloseTo(esperado, 1);
    }
    await calcularPh(page, 'h2co3-2', '0,1');
    await expect(dato(panelPh(page), 'pH con la aproximación ½(pKa₁ + pKa₂)')).toHaveText('8,35');
    // HS⁻: Ka₂ = 10⁻¹⁹ y ½(pKa₁ + pKa₂) = 13,03 no sirve; el balance de cargas da 10,03
    // ([OH⁻] ≈ √(Kw/Ka₁ · C) = 1,06×10⁻⁴), y la app lo dice.
    await calcularPh(page, 'h2s-2', '0,1');
    await expect(cifra(panelPh(page))).toHaveText('10,03');
    await expect(panelPh(page)).toContainText('no sirve aquí');
  });

  test('HALLAZGO 4118 (REPARADO) · el H₂SO₄ cuenta la segunda disociación que su fila dice que «sí hay que tener en cuenta»', async ({ page }) => {
    // [H⁺] = C + [SO₄²⁻] con Ka₂ = 1,2×10⁻² (la de la fila HSO₄⁻): x² + (C + Ka₂)·x − Ka₂·C = 0.
    // 0,01 M → x = 4,524×10⁻³, [H⁺] = 1,4524×10⁻² → pH 1,8379 «1,84» (la app daba 2,00).
    // 0,1 M → 0,9592 «0,96» (daba 1,00) · 0,001 M → 2,7292 «2,73» (daba 3,00).
    for (const [conc, esperado] of [
      ['0,01', 1.8379],
      ['0,001', 2.7292],
    ] as const) {
      await calcularPh(page, 'h2so4-fuerte', conc);
      await expect(cifra(panelPh(page))).toBeVisible();
      expect.soft(await phEnPantalla(page), conc).toBeCloseTo(esperado, 1);
    }
  });

  test('HALLAZGO 4120 (REPARADO) · el tampón en proporción 1/10 exacta sale «dentro del rango útil»', async ({ page }) => {
    // 0,01/0,1 da 0,09999999999999999 en coma flotante y no pasaba el `proporcion >= 0.1`, así que
    // [ácido] 0,1 y [base] 0,01 salían «Fuera del rango útil», mientras que el extremo de arriba
    // (0,01/0,1, proporción 10) salía «Dentro». Ahora se compara |log₁₀(proporción)| ≤ 1 con
    // tolerancia. Desde el hallazgo 4119 la cifra grande es la del balance de cargas (3,7531
    // «3,75»); la de Henderson-Hasselbalch, el extremo del rango (3,74), queda en «Sustitución».
    const tampon = panelTampon(page);
    await calcularTampon(page, 'acetico', '0,1', '0,01');
    await expect(cifra(tampon)).toHaveText('3,75');
    await expect(dato(tampon, 'Sustitución')).toHaveText('pH = 4,74 + log(0,10) = 3,74');
    await expect(dato(tampon, 'Rango útil')).toHaveText('de 3,74 a 5,74');
    await expect(tampon).toContainText('Dentro del rango útil.', { timeout: 2000 });
    await calcularTampon(page, 'acetico', '0,2', '0,02');
    await expect(tampon).toContainText('Dentro del rango útil.', { timeout: 2000 });
  });

  test('HALLAZGO 4119 (REPARADO) · el tampón ya no aplica Henderson-Hasselbalch a ácidos de Ka grande: da el pH real y avisa', async ({ page }) => {
    // Mezcla HA (Ca) + NaA (Cb), balance de cargas Cb + [H⁺] = (Ca + Cb)·Ka/([H⁺] + Ka) + Kw/[H⁺]
    // (.inspector-trabajo/tabla-ka-kb-tampon.mjs), con la Ka de la tabla:
    //   tricloroacético 0,1/0,1 → 1,2353 «1,24» (la app daba 0,66, «Dentro del rango útil»)
    //   HSO₄⁻ 0,01/0,01 → 2,3445 «2,34» (daba 1,92) · oxálico Ka₁ 0,1/0,1 → 1,5080 (daba 1,23)
    // La nota de debajo ya no da Henderson-Hasselbalch por «razonable» por encima de 0,01 M.
    const tampon = panelTampon(page);
    for (const [id, c, esperado] of [
      ['tricloroacetico', '0,1', 1.2353],
      ['hso4', '0,01', 2.3445],
      ['oxalico-1', '0,1', 1.508],
    ] as const) {
      await calcularTampon(page, id, c, c);
      await expect(cifra(tampon)).toBeVisible();
      expect.soft(leerNumero((await cifra(tampon).textContent()) ?? ''), `${id} ${c}`).toBeCloseTo(esperado, 1);
      await expect.soft(tampon, id).toContainText('Henderson-Hasselbalch no sirve aquí.');
    }
    await expect(tampon).not.toContainText('razonable en tampones por encima de 0,01 M');
    // Y en un tampón normal (acético 0,1/0,1) Henderson-Hasselbalch vale y no se avisa.
    await calcularTampon(page, 'acetico', '0,1', '0,1');
    await expect(cifra(tampon)).toHaveText('4,74');
    await expect(tampon).not.toContainText('Henderson-Hasselbalch no sirve aquí.');
  });

  test('HALLAZGO 4121 (REPARADO) · «Aproximación válida» ya no dice que coincide con el exacto en las cifras que se muestran', async ({ page }) => {
    // Acético 0,1 M: exacto 1,332671×10⁻³ «1,33×10⁻³ M» y √(Ka·C) = 1,341641×10⁻³ «1,34×10⁻³ M»,
    // los dos en el mismo panel (y en pH, 2,88 frente a 2,87). La nota dice ahora que la
    // diferencia es menor que el 5 % de la regla y puede tocar la última cifra.
    const panel = panelPh(page);
    await calcularPh(page, 'amoniaco', '0,1');
    await calcularPh(page, 'acetico', '0,1');
    await expect(cifra(panel)).toHaveText('2,88');
    const plano = (t: string | null): string => (t ?? '').replace(/\s+/g, ' ').trim();
    const exacto = plano(await subtitulo(panel).textContent()).match(/= ([\d,]+×10\S+) M$/)?.[1];
    const aproximado = plano(await dato(panel, 'Valor con la aproximación').textContent()).replace(/ M$/, '');
    expect(exacto).toBe('1,33×10⁻³');
    expect(aproximado).toBe('1,34×10⁻³');
    await expect(panel).toContainText('Aproximación válida.');
    await expect(panel).not.toContainText('coincide con el exacto en las cifras que se muestran');
    await expect(panel).toContainText('puede diferir en la última cifra que se muestra');
  });

  test('HALLAZGO 4122 (REPARADO) · las tres notas comparativas cuadran con las constantes de la propia tabla', async ({ page }) => {
    // Con las Ka/Kb de la tabla: metilamina/anilina = 4,4×10⁻⁴ / 3,8×10⁻¹⁰ = 1,16×10⁶ (no «casi
    // cien mil»; frente al amoníaco, 4,7×10⁴) · láctico/propanoico = 1,4×10⁻⁴ / 1,3×10⁻⁵ = 10,8
    // (no «unas ocho veces») · fórmico pKa 3,74 frente a acético 4,74, propanoico 4,89 y
    // butanoico 4,82: diez veces más ácido, no «pKa muy parecidos» (lo dice la nota del fórmico).
    for (const [id, frase] of [
      ['anilina', 'alrededor de un millón de veces menos básica que la metilamina'],
      ['lactico', 'unas diez veces más ácido que el propanoico'],
      ['butanoico', 'El fórmico, sin grupo alquilo, se separa de ellos: es unas diez veces más ácido.'],
    ] as const) {
      await page.locator(`li button[aria-controls="detalle-${id}"]`).click();
      await expect.soft(page.locator(`#detalle-${id}`), id).toContainText(frase);
      await page.locator(`li button[aria-controls="detalle-${id}"]`).click();
    }
    for (const [id, frase] of [
      ['anilina', 'casi cien mil veces menos básica que la metilamina'],
      ['lactico', 'unas ocho veces más ácido que el propanoico'],
      ['butanoico', 'Fórmico, acético, propanoico y butanoico tienen pKa muy parecidos'],
    ] as const) {
      await page.locator(`li button[aria-controls="detalle-${id}"]`).click();
      await expect(page.locator(`#detalle-${id}`)).toBeVisible();
      await expect.soft(page.locator(`#detalle-${id}`), id).not.toContainText(frase);
    }
  });

  test('HALLAZGO 4123 (REPARADO) · el «%» va con espacio duro, no con espacio normal', async ({ page }) => {
    // CLAUDE.md §2: «15 %» con U+00A0. Hoy U+0020 en el «Grado de disociación» («1,33 %»), en
    // las features del JSON-LD («del 5 %», «Funciona 100 %») y en la FAQPage («el 5 %», «al 100 %»).
    // REPARADO el 05/11/2026 (/reparar): U+00A0 en page.tsx y metadata.ts. Las dos regex llevan
    // el espacio duro literal en «1,33 %» y el espacio normal en «\d %»; abajo, además, el cuerpo
    // entero de la página sin «cifra + espacio normal + %».
    await calcularPh(page, 'amoniaco', '0,1');
    expect.soft((await page.locator('body').textContent()) ?? '').not.toMatch(/\d\x20%/);
    expect.soft((await dato(panelPh(page), 'Grado de disociación').textContent()) ?? '').toMatch(/1,33 %/);
    const jsonLd = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .join('\n'),
    );
    expect.soft(jsonLd).toContain('Funciona 100');
    expect.soft(jsonLd).not.toMatch(/\d %/);
  });
});

import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * ajustar-ecuaciones-quimicas — Inspector, primera inspección (21/11/2026).
 *
 * Tres pestañas: «Ajustar ecuación» (espacio nulo de la matriz de conservación, una fila por
 * elemento y otra por la carga, con fracciones exactas y paso a enteros mínimos), «Números de
 * oxidación» (reglas fijas + iones poliatómicos + despeje por la carga) y «Redox ion-electrón»
 * (semirreacciones en medio ácido o básico). Todos los esperados están resueltos a mano ANTES de
 * ejecutar la app, conservando cada elemento y la carga; ninguno depende de un dato normativo ni
 * de masas atómicas (la app no las usa).
 *
 * CASOS (verde, red de regresión):
 *   1 · normal   · C3H8 + O2 → 1:5:3:4 (C 3 = c · H 8 = 2d · O 2b = 2c + d) · FeS2 + O2 → 4:11:2:8 ·
 *                  KMnO4 + HCl → 2:16:2:2:5:8 · K4Fe(CN)6 + KMnO4 + H2SO4 → 10:122:299:162:5:122:60:60:188
 *                  (O 1684 = 1684, H 598, S 299; mcd 1) · KMnO4 Mn +7, Cr2O7^2- Cr +6, CuSO4 Cu +2 S +6 ·
 *                  permanganato + hierro(II) por ion-electrón.
 *   2 · límite   · paréntesis Ca(OH)2 + H3PO4 → 3:2:1:6 · iónica MnO4^- + Fe^2+ + H^+ → 1:5:8:1:5:4 con
 *                  carga +17 = +17 · ya ajustada con sus coeficientes escritos (2H2 + O2 → 2H2O) · hidrato
 *                  CuSO4·5H2O → CuSO4 + 5 H2O · valor medio Fe3O4 +8/3 · hidruro NaH H −1 · medio básico
 *                  (permanganato + sulfito) y dismutación del cloro.
 *   3 · rechazo  · H2 + O2 → H2O + H2O2 (dos reacciones independientes) · «Xx» · paréntesis sin cerrar ·
 *                  Zn + HCl → ZnCl2 (sin solución) · dos semirreacciones de reducción.
 *
 * HALLAZGOS ABIERTOS (test.fail(), cada uno falla en la aserción que lo mide):
 *   H1 (alto)  · La carga se lee mal sin «^»: normalizarTexto convierte los superíndices en cifras
 *                normales y parseEspecie se come la última cifra del cuerpo como carga. «NH₄⁺» y «NH4+»
 *                se analizan como NH⁴⁺ (N +3, esperado −3); «SO₄²⁻» como SO⁴²⁻ (S −40, esperado +6). La
 *                propia ecuación que pinta la app («MnO₄⁻ + Fe²⁺ + H⁺ → Mn²⁺ + Fe³⁺ + H₂O») se rechaza
 *                al pegarla, y «MnO₄⁻ → Mn²⁺» sale como oxidación.
 *   H2 (medio) · NH4NO3: N +1 sin aviso de valor medio (el amonio tiene −3 y el nitrato +5); el aviso
 *                solo sale si el promedio no es entero.
 *   H3 (bajo)  · O2F2: O +2 fijo con flúor → suma +2 con carga 0, sin aviso (esperado O +1).
 *   H4 (bajo)  · Fórmula vacía en «Números de oxidación»: «Cannot read properties of undefined
 *                (reading 'split')».
 *   H5 (bajo)  · CuSO4.5H2O (con punto) en «Números de oxidación»: Cu y S sin determinar y suma −8,
 *                cuando con «·» da Cu +2 y S +6 y «Ajustar» sí acepta el punto.
 *   H6 (bajo)  · El hidrato se pinta CuSO₄·₅H₂O: el 5 del agua sale como subíndice.
 *   H7 (bajo)  · Concordancia con 1: «supera en 1 unidades», «se añaden 1 electrones», «Se añaden 1
 *                moléculas de agua» (en el ejemplo por defecto).
 *   H8 (bajo)  · Guía: «Los tres métodos de ajuste» encabeza una tabla de cuatro métodos.
 *   H9 (bajo)  · Un elemento en un solo lado (H2 + O2 → H2O + NaCl) da «comprueba que las especies
 *                estén en el lado correcto de la flecha»: cambiar NaCl de lado no lo arregla.
 *   H10 (bajo) · El resultado no está en una región viva: tras «Ajustar» el lector no anuncia nada
 *                (los errores sí, con role="alert").
 */

const RUTA = '/ajustar-ecuaciones-quimicas/';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#ecuacion']);
}

// ─── Pestaña «Ajustar ecuación» ─────────────────────────────────────────────

const panelAjustar = (page: Page): Locator => page.locator('#panel-ajustar');

async function ajustar(page: Page, ecuacion: string): Promise<void> {
  await page.fill('#ecuacion', ecuacion);
  await esperarValorEnReact(page, '#ecuacion', ecuacion);
  await panelAjustar(page).getByRole('button', { name: 'Ajustar', exact: true }).click();
}

const ecuacionAjustada = (page: Page): Locator =>
  panelAjustar(page).getByText('Ecuación ajustada', { exact: true }).locator('xpath=following-sibling::p[1]');

const coeficientes = (page: Page): Locator =>
  panelAjustar(page).locator('p', { hasText: 'Coeficientes:' });

/** Fila de la tabla de un panel cuyo primer dato es el símbolo (o «Carga total»). */
function fila(panel: Locator, page: Page, primera: string): Locator {
  return panel
    .locator('tbody tr')
    .filter({ has: page.locator('td:first-child', { hasText: new RegExp(`^${primera}$`) }) });
}

test.describe('Ajustar ecuación: coeficientes enteros mínimos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('combustión del propano: C3H8 + O2 → 1:5:3:4, con C 3, H 8 y O 10 a cada lado', async ({ page }) => {
    // C: 3a = c → 3 · H: 8a = 2d → 4 · O: 2b = 2·3 + 4 = 10 → b = 5
    await ajustar(page, 'C3H8 + O2 -> CO2 + H2O');
    await expect(ecuacionAjustada(page)).toHaveText('C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 5 : 3 : 4');
    const p = panelAjustar(page);
    await expect(fila(p, page, 'C').locator('td')).toHaveText(['C', '3', '3', /conservado/]);
    await expect(fila(p, page, 'H').locator('td')).toHaveText(['H', '8', '8', /conservado/]);
    await expect(fila(p, page, 'O').locator('td')).toHaveText(['O', '10', '10', /conservado/]);
  });

  test('tostación de la pirita: FeS2 + O2 → 4:11:2:8 (O 22 = 22)', async ({ page }) => {
    // Fe: a = 2c · S: 2a = d · O: 2b = 3c + 2d → con c = 2: a = 4, d = 8, b = 11
    await ajustar(page, 'FeS2 + O2 -> Fe2O3 + SO2');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 4 : 11 : 2 : 8');
    await expect(fila(panelAjustar(page), page, 'O').locator('td')).toHaveText(['O', '22', '22', /conservado/]);
  });

  test('redox molecular: KMnO4 + HCl → 2:16:2:2:5:8 (Cl 16 = 2 + 4 + 10)', async ({ page }) => {
    // K = Mn = 2 · O: 8 = H2O · H: 16 = HCl · Cl: 16 = 2 + 2·2 + 2e → e = 5
    await ajustar(page, 'KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 2 : 16 : 2 : 2 : 5 : 8');
    await expect(fila(panelAjustar(page), page, 'Cl').locator('td')).toHaveText(['Cl', '16', '16', /conservado/]);
  });

  test('ferrocianuro + permanganato: 10:122:299:162:5:122:60:60:188 con fracciones exactas', async ({ page }) => {
    // Comprobado a mano: K 4·10 + 122 = 162 · Fe 10 = 2·5 · C = N = 60 · Mn 122 · S 299 = 162 + 15 + 122 ·
    // H 2·299 = 162 + 60 + 2·188 = 598 · O 4·122 + 4·299 = 1684 = 648 + 60 + 488 + 180 + 120 + 188 · mcd 1
    await ajustar(page, 'K4Fe(CN)6 + KMnO4 + H2SO4 -> KHSO4 + Fe2(SO4)3 + MnSO4 + HNO3 + CO2 + H2O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 10 : 122 : 299 : 162 : 5 : 122 : 60 : 60 : 188');
    await expect(fila(panelAjustar(page), page, 'O').locator('td')).toHaveText(['O', '1684', '1684', /conservado/]);
    await expect(fila(panelAjustar(page), page, 'H').locator('td')).toHaveText(['H', '598', '598', /conservado/]);
  });

  test('paréntesis: Ca(OH)2 + H3PO4 → 3:2:1:6', async ({ page }) => {
    // Ca: a = 3c · P: b = 2c · H: 2a + 3b = 2d → 12 = 2d → d = 6 · O: 6 + 8 = 8 + 6
    await ajustar(page, 'Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O');
    await expect(ecuacionAjustada(page)).toHaveText('3 Ca(OH)₂ + 2 H₃PO₄ → Ca₃(PO₄)₂ + 6 H₂O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 3 : 2 : 1 : 6');
  });

  test('iónica con «^»: MnO4^- + Fe^2+ + H^+ → 1:5:8:1:5:4 y la carga +17 a cada lado', async ({ page }) => {
    // Mn: a = d · O: 4a = f · Fe: b = e · H: c = 2f · carga: −a + 2b + c = 2d + 3e → a = 1: b = 5, c = 8
    await ajustar(page, 'MnO4^- + Fe^2+ + H^+ -> Mn^2+ + Fe^3+ + H2O');
    await expect(ecuacionAjustada(page)).toHaveText('MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 5 : 8 : 1 : 5 : 4');
    await expect(fila(panelAjustar(page), page, 'Carga total').locator('td')).toHaveText(['Carga total', '+17', '+17', /conservada/]);
  });

  test('iones sin «^» pero sin cifra final: Na+ + Cl- → NaCl, 1:1:1', async ({ page }) => {
    await ajustar(page, 'Na+ + Cl- -> NaCl');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 1 : 1');
  });

  test('ya ajustada y con coeficientes escritos: 2H2 + O2 → 2H2O sigue en 2:1:2', async ({ page }) => {
    await ajustar(page, '2H2 + O2 -> 2H2O');
    await expect(ecuacionAjustada(page)).toHaveText('2 H₂ + O₂ → 2 H₂O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 2 : 1 : 2');
  });

  test('hidrato: CuSO4·5H2O → CuSO4 + H2O da 1:1:5 (O 9 = 4 + 5, H 10 = 10)', async ({ page }) => {
    await ajustar(page, 'CuSO4·5H2O -> CuSO4 + H2O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 1 : 5');
    await expect(fila(panelAjustar(page), page, 'O').locator('td')).toHaveText(['O', '9', '9', /conservado/]);
  });

  test('Enter en el campo ajusta igual que el botón', async ({ page }) => {
    await page.fill('#ecuacion', 'N2 + H2 -> NH3');
    await esperarValorEnReact(page, '#ecuacion', 'N2 + H2 -> NH3');
    await page.press('#ecuacion', 'Enter');
    // N: 2a = c · H: 2b = 3c → c = 2, b = 3
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 3 : 2');
  });

  test('rechazos: dos reacciones independientes, símbolo inexistente, paréntesis sin cerrar y sin solución', async ({ page }) => {
    const aviso = panelAjustar(page).getByRole('alert');
    // H: 2a = 2c + 2d · O: 2b = c + 2d → 4 incógnitas y rango 2: dos grados de libertad
    await ajustar(page, 'H2 + O2 -> H2O + H2O2');
    await expect(aviso).toContainText('infinitas soluciones');
    await expect(coeficientes(page)).toHaveCount(0);

    await ajustar(page, 'Na + Cl2 -> NaCl + Xx');
    await expect(aviso).toContainText('«Xx» no es un símbolo químico válido');

    await ajustar(page, 'Ca(OH2 + HCl -> CaCl2 + H2O');
    await expect(aviso).toContainText('Falta cerrar algún paréntesis');

    // Zn: a = c · H: b = 0 · Cl: b = 2c → solo la solución nula
    await ajustar(page, 'Zn + HCl -> ZnCl2');
    await expect(aviso).toContainText('no se puede ajustar');
    await expect(coeficientes(page)).toHaveCount(0);
  });

  test('H6 · el hidrato se escribe CuSO₄·5H₂O, con el 5 a tamaño normal', async ({ page }) => {
    test.fail(); // ABIERTO: bonita() pasa a subíndice todas las cifras y pinta «CuSO₄·₅H₂O»
    await ajustar(page, 'CuSO4·5H2O -> CuSO4 + H2O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 1 : 5');
    await expect(ecuacionAjustada(page)).toHaveText('CuSO₄·5H₂O → CuSO₄ + 5 H₂O');
  });

  test('H1 · la ecuación que pinta la propia app, pegada tal cual, da 1:5:8:1:5:4', async ({ page }) => {
    test.fail(); // ABIERTO: «MnO₄⁻» se lee como MnO con carga −4 y el sistema solo tiene solución negativa
    await ajustar(page, 'MnO₄⁻ + Fe²⁺ + H⁺ → Mn²⁺ + Fe³⁺ + H₂O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 5 : 8 : 1 : 5 : 4');
  });

  test('H9 · un elemento que solo está en un lado se nombra en el aviso', async ({ page }) => {
    test.fail(); // ABIERTO: dice «comprueba que las especies estén en el lado correcto de la flecha»
    // Na y Cl solo aparecen a la derecha: el coeficiente de NaCl sale 0, y pasarlo a la izquierda tampoco ajusta
    await ajustar(page, 'H2 + O2 -> H2O + NaCl');
    const aviso = panelAjustar(page).getByRole('alert');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(/\bNa\b|\bCl\b/);
  });

  test('H10 · el resultado del ajuste se anuncia (región viva)', async ({ page }) => {
    test.fail(); // ABIERTO: ningún ancestro del resultado lleva aria-live ni role="status"
    await ajustar(page, 'C3H8 + O2 -> CO2 + H2O');
    await expect(coeficientes(page)).toHaveText('Coeficientes: 1 : 5 : 3 : 4');
    const region = await ecuacionAjustada(page).evaluate((el) => {
      for (let n: HTMLElement | null = el as HTMLElement; n; n = n.parentElement) {
        const rol = n.getAttribute('role') ?? '';
        if (/^(status|alert|log)$/.test(rol) || n.hasAttribute('aria-live')) return `${n.tagName} ${rol}`;
      }
      return 'ninguna';
    });
    expect(region, 'región viva que contenga el resultado').not.toBe('ninguna');
  });
});

// ─── Pestaña «Números de oxidación» ─────────────────────────────────────────

const panelEO = (page: Page): Locator => page.locator('#panel-oxidacion');

async function irAOxidacion(page: Page): Promise<void> {
  await page.getByRole('tab', { name: /Números de oxidación/ }).click();
  await esperarHidratacion(page, ['#formulaEO']);
}

async function calcularEO(page: Page, formula: string): Promise<void> {
  await page.fill('#formulaEO', formula);
  await esperarValorEnReact(page, '#formulaEO', formula);
  await panelEO(page).getByRole('button', { name: 'Calcular', exact: true }).click();
}

/** Número de oxidación pintado para un elemento (tercera columna). */
const eoDe = (page: Page, el: string): Locator => fila(panelEO(page), page, el).locator('td').nth(2);

test.describe('Números de oxidación', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await irAOxidacion(page);
  });

  test('KMnO4: K +1, Mn +7, O −2 (1 + Mn − 8 = 0)', async ({ page }) => {
    await calcularEO(page, 'KMnO4');
    await expect(eoDe(page, 'K')).toHaveText('+1');
    await expect(eoDe(page, 'Mn')).toHaveText('+7');
    await expect(eoDe(page, 'O')).toHaveText('−2');
  });

  test('Cr2O7^2-: Cr +6 (2·Cr − 14 = −2)', async ({ page }) => {
    await calcularEO(page, 'Cr2O7^2-');
    await expect(eoDe(page, 'Cr')).toHaveText('+6');
    await expect(panelEO(page)).toContainText('Carga total: −2 · Suma de los números de oxidación: −2');
  });

  test('sales con ion poliatómico: CuSO4·5H2O Cu +2 S +6 (con aviso de hidrato) y Fe2(SO4)3 Fe +3', async ({ page }) => {
    await calcularEO(page, 'CuSO4·5H2O');
    await expect(eoDe(page, 'Cu')).toHaveText('+2');
    await expect(eoDe(page, 'S')).toHaveText('+6');
    await expect(panelEO(page)).toContainText('sal anhidra');

    // 2·Fe + 3·(−2) = 0 → Fe +3
    await calcularEO(page, 'Fe2(SO4)3');
    await expect(eoDe(page, 'Fe')).toHaveText('+3');
    await expect(eoDe(page, 'S')).toHaveText('+6');
  });

  test('valor medio e hidruros: Fe3O4 +8/3 con aviso, NaH H −1, LiAlH4 Al +3 H −1', async ({ page }) => {
    await calcularEO(page, 'Fe3O4');
    await expect(eoDe(page, 'Fe')).toHaveText('+8/3');
    await expect(panelEO(page)).toContainText('número de oxidación medio');

    await calcularEO(page, 'NaH');
    await expect(eoDe(page, 'H')).toHaveText('−1');

    await calcularEO(page, 'LiAlH4');
    await expect(eoDe(page, 'Al')).toHaveText('+3');
    await expect(eoDe(page, 'H')).toHaveText('−1');
  });

  test('NH4^+ con «^» (y su botón de ejemplo): N −3', async ({ page }) => {
    await calcularEO(page, 'NH4^+');
    await expect(eoDe(page, 'N')).toHaveText('−3');
    await calcularEO(page, 'KMnO4');
    await panelEO(page).getByRole('button', { name: 'NH₄⁺', exact: true }).click();
    await expect(eoDe(page, 'N')).toHaveText('−3');
  });

  test('rechazo: «Xx2O» no es una fórmula', async ({ page }) => {
    await calcularEO(page, 'Xx2O');
    await expect(panelEO(page).getByRole('alert')).toContainText('«Xx» no es un símbolo químico válido');
  });

  test('H1 · «NH₄⁺» con superíndice: N −3', async ({ page }) => {
    test.fail(); // ABIERTO: se analiza NH⁴⁺ (1 N, 1 H, carga +4) y da N +3
    await calcularEO(page, 'NH₄⁺');
    await expect(eoDe(page, 'N')).toHaveText('−3');
  });

  test('H1 · «NH4+» sin «^»: N −3', async ({ page }) => {
    test.fail(); // ABIERTO: el 4 se toma como carga → NH⁴⁺, N +3
    await calcularEO(page, 'NH4+');
    await expect(eoDe(page, 'N')).toHaveText('−3');
  });

  test('H1 · «SO₄²⁻» con superíndices: S +6', async ({ page }) => {
    test.fail(); // ABIERTO: «SO42-» → SO con carga −42 → S −40
    await calcularEO(page, 'SO₄²⁻');
    await expect(eoDe(page, 'S')).toHaveText('+6');
  });

  test('H2 · NH4NO3: el N no es +1 sin más (−3 en el amonio, +5 en el nitrato)', async ({ page }) => {
    test.fail(); // ABIERTO: N +1 con «Se despeja…» y sin el aviso de valor medio
    await calcularEO(page, 'NH4NO3');
    await expect(eoDe(page, 'O')).toHaveText('−2');
    const valoresN = await fila(panelEO(page), page, 'N').locator('td:nth-child(3)').allInnerTexts();
    const texto = await panelEO(page).innerText();
    const avisaMedio = /oxidación medio|valor medio|promedio/i.test(texto);
    expect(valoresN.includes('−3') || avisaMedio, `N = ${valoresN.join(', ')} y sin aviso de valor medio`).toBe(true);
  });

  test('H3 · O2F2: O +1 (2·O + 2·(−1) = 0)', async ({ page }) => {
    test.fail(); // ABIERTO: O +2 fijo «unido al flúor» → suma +2 con carga 0
    await calcularEO(page, 'O2F2');
    await expect(eoDe(page, 'F')).toHaveText('−1');
    await expect(eoDe(page, 'O')).toHaveText('+1');
  });

  test('H4 · fórmula vacía: aviso en español', async ({ page }) => {
    test.fail(); // ABIERTO: «Cannot read properties of undefined (reading 'split')»
    await calcularEO(page, '');
    const aviso = panelEO(page).getByRole('alert');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(/fórmula/i);
  });

  test('H5 · CuSO4.5H2O (hidrato con punto): Cu +2 y S +6 como con «·»', async ({ page }) => {
    test.fail(); // ABIERTO: Cu y S «—» y suma −8 con carga 0
    await calcularEO(page, 'CuSO4.5H2O');
    await expect(eoDe(page, 'Cu')).toHaveText('+2');
    await expect(eoDe(page, 'S')).toHaveText('+6');
  });
});

// ─── Pestaña «Redox ion-electrón» ───────────────────────────────────────────

const panelRedox = (page: Page): Locator => page.locator('#panel-redox');

const ecuacionGlobal = (page: Page): Locator =>
  panelRedox(page).getByText('Ecuación iónica global ajustada', { exact: true }).locator('xpath=following-sibling::p[1]');

async function irARedox(page: Page): Promise<void> {
  await page.getByRole('tab', { name: /Redox ion-electrón/ }).click();
  await esperarHidratacion(page, ['#semiA', '#semiB']);
}

async function desarrollar(page: Page, a: string, b: string, medio: 'ácido' | 'básico'): Promise<void> {
  await page.fill('#semiA', a);
  await esperarValorEnReact(page, '#semiA', a);
  await page.fill('#semiB', b);
  await esperarValorEnReact(page, '#semiB', b);
  await panelRedox(page).getByRole('button', { name: new RegExp(`Medio ${medio}`) }).click();
  await panelRedox(page).getByRole('button', { name: 'Desarrollar por ion-electrón' }).click();
}

test.describe('Redox por ion-electrón', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await irARedox(page);
  });

  test('permanganato + hierro(II) en ácido: 5 e⁻ y 1 e⁻, ×1 y ×5', async ({ page }) => {
    // MnO4⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H2O (carga +7 → +2) · Fe²⁺ → Fe³⁺ + e⁻
    await desarrollar(page, 'MnO4^- -> Mn^2+', 'Fe^2+ -> Fe^3+', 'ácido');
    const p = panelRedox(page);
    await expect(p).toContainText('MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O');
    await expect(ecuacionGlobal(page)).toHaveText('MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ → Mn²⁺ + 4 H₂O + 5 Fe³⁺');
    await expect(p).toContainText('Agente oxidante: MnO₄⁻ (se reduce) · Agente reductor: Fe²⁺ (se oxida)');
    await expect(fila(p, page, 'Carga total').locator('td')).toHaveText(['Carga total', '+17', '+17', /conservada/]);
  });

  test('medio básico: permanganato + sulfito → 2 MnO₄⁻ + H₂O + 3 SO₃²⁻ → 2 MnO₂ + 2 OH⁻ + 3 SO₄²⁻', async ({ page }) => {
    // Reducción: MnO4⁻ + 2 H2O + 3 e⁻ → MnO2 + 4 OH⁻ · Oxidación: SO3²⁻ + 2 OH⁻ → SO4²⁻ + H2O + 2 e⁻ · ×2 y ×3
    await desarrollar(page, 'MnO4^- -> MnO2', 'SO3^2- -> SO4^2-', 'básico');
    await expect(panelRedox(page)).toContainText('MnO₄⁻ + 3 e⁻ + 2 H₂O → MnO₂ + 4 OH⁻');
    await expect(ecuacionGlobal(page)).toHaveText('2 MnO₄⁻ + H₂O + 3 SO₃²⁻ → 2 MnO₂ + 2 OH⁻ + 3 SO₄²⁻');
    await expect(ecuacionGlobal(page)).not.toContainText('H⁺');
  });

  test('dismutación del cloro en básico: Cl₂ + 2 OH⁻ → Cl⁻ + ClO⁻ + H₂O', async ({ page }) => {
    await desarrollar(page, 'Cl2 -> Cl^-', 'Cl2 -> ClO^-', 'básico');
    await expect(ecuacionGlobal(page)).toHaveText('Cl₂ + 2 OH⁻ → Cl⁻ + ClO⁻ + H₂O');
  });

  test('agua oxigenada, dicromato y cobre con nítrico en ácido', async ({ page }) => {
    // ×2 y ×5: 16 H⁺ − 10 H⁺ = 6 H⁺
    await desarrollar(page, 'MnO4^- -> Mn^2+', 'H2O2 -> O2', 'ácido');
    await expect(ecuacionGlobal(page)).toHaveText('2 MnO₄⁻ + 6 H⁺ + 5 H₂O₂ → 2 Mn²⁺ + 8 H₂O + 5 O₂');
    // Cr2O7²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H2O · 2 I⁻ → I2 + 2 e⁻ (×3)
    await desarrollar(page, 'Cr2O7^2- -> Cr^3+', 'I^- -> I2', 'ácido');
    await expect(ecuacionGlobal(page)).toHaveText('Cr₂O₇²⁻ + 14 H⁺ + 6 I⁻ → 2 Cr³⁺ + 7 H₂O + 3 I₂');
    // NO3⁻ + 4 H⁺ + 3 e⁻ → NO + 2 H2O (×2) · Cu → Cu²⁺ + 2 e⁻ (×3)
    await desarrollar(page, 'NO3^- -> NO', 'Cu -> Cu^2+', 'ácido');
    await expect(ecuacionGlobal(page)).toHaveText('2 NO₃⁻ + 8 H⁺ + 3 Cu → 2 NO + 4 H₂O + 3 Cu²⁺');
  });

  test('rechazo: dos semirreacciones de reducción', async ({ page }) => {
    await desarrollar(page, 'MnO4^- -> Mn^2+', 'Cr2O7^2- -> Cr^3+', 'ácido');
    await expect(panelRedox(page).getByRole('alert')).toContainText('Las dos semirreacciones son de reducción');
  });

  test('H1 · las semirreacciones con superíndices dan lo mismo que con «^»', async ({ page }) => {
    test.fail(); // ABIERTO: «MnO₄⁻ → Mn²⁺» sale como oxidación de 4 e⁻ y avisa de «dos oxidaciones»
    await desarrollar(page, 'MnO₄⁻ → Mn²⁺', 'Fe²⁺ → Fe³⁺', 'ácido');
    await expect(ecuacionGlobal(page)).toHaveText('MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ → Mn²⁺ + 4 H₂O + 5 Fe³⁺');
  });

  test('H7 · con un electrón, en singular', async ({ page }) => {
    test.fail(); // ABIERTO: «supera en 1 unidades… se añaden 1 electrones»
    await desarrollar(page, 'MnO4^- -> Mn^2+', 'Fe^2+ -> Fe^3+', 'ácido');
    await expect(ecuacionGlobal(page)).toHaveText('MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ → Mn²⁺ + 4 H₂O + 5 Fe³⁺');
    await expect(panelRedox(page)).not.toContainText(/\s1 (electrones|unidades|moléculas)/);
  });
});

// ─── Guía educativa ─────────────────────────────────────────────────────────

test('H8 · el número de métodos del título coincide con las filas de su tabla', async ({ page }) => {
  test.fail(); // ABIERTO: «Los tres métodos de ajuste» sobre cuatro filas (tanteo, algebraico, ion-electrón, número de oxidación)
  await abrir(page);
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  const titulo = page.getByRole('heading', { name: /métodos de ajuste/ });
  await expect(titulo).toBeVisible();
  const seccion = page.locator('section', { has: titulo });
  const filas = await seccion.locator('tbody tr').count();
  const palabra = ((await titulo.innerText()).match(/\b(dos|tres|cuatro|cinco)\b/i)?.[1] ?? '').toLowerCase();
  const numero: Record<string, number> = { dos: 2, tres: 3, cuatro: 4, cinco: 5 };
  expect(numero[palabra] ?? filas, `título «${await titulo.innerText()}» y ${filas} filas`).toBe(filas);
});

import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-reacciones-quimicas (segmento cálculo, riesgo 3, 53 usos reales)
 *
 * Primera inspección: 21/08/2026. El <h1> promete «Simulador de Reacciones Químicas» y el
 * subtítulo «Estequiometría y reactivo limitante — 20 reacciones reales con cálculos
 * numéricos»; la metadata promete «Dado X gramos o moles de una sustancia, calcula todos los
 * demás. Encuentra el reactivo que agota primero y el rendimiento teórico». Hay, por tanto,
 * verdad comprobable: se trata como app verificable.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-reacciones-quimicas/page.tsx
 *     · const REACCIONES  → tabla de 20 reacciones con coeficiente y masa molar por sustancia
 *     · calcStoic()       → moles_base = g / M (o los moles dados); moles_i = moles_base · (coef_i / coef_base)
 *     · calcLimite()      → cociente_i = moles_i / coef_i; limita el menor; exceso_i = (cociente_i − mín) · coef_i
 *   lib/formatters.ts → formatNumber(n, d) con toLocaleString('es-ES')
 *
 * NOTA DE FORMATO: es-ES (CLDR minimumGroupingDigits = 2) NO agrupa los números de cuatro
 * cifras, así que 2048 se escribe «2048,000» y no «2.048,000». Es la convención española
 * correcta, no un fallo del formateador.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * MASAS MOLARES CALCULADAS A MANO (tabla periódica IUPAC 2021), que son las que mandan aquí:
 *   H 1,008 · C 12,011 · O 15,999 · Na 22,990 · Cl 35,453 · Zn 65,38
 *   CH₄   = 12,011 + 4·1,008         = 16,043 g/mol
 *   O₂    = 2·15,999                 = 31,998 ≈ 32,0 g/mol   (la app tabula 32,0)
 *   CO₂   = 12,011 + 2·15,999        = 44,009 ≈ 44,010 g/mol (la app tabula 44,010)
 *   H₂O   = 2·1,008 + 15,999         = 18,015 g/mol
 *   HCl   = 1,008 + 35,453           = 36,461 g/mol
 *   NaOH  = 22,990 + 15,999 + 1,008  = 39,997 g/mol
 *   NaCl  = 22,990 + 35,453          = 58,443 g/mol
 *   ZnCl₂ = 65,38 + 2·35,453         = 136,286 g/mol
 *   H₂    = 2·1,008                  = 2,016 g/mol
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Estequiometría · CH₄ + 2O₂ → CO₂ + 2H₂O · parto de 32 g de CH₄
 *       n(CH₄) = 32 / 16,043 = 1,99464 mol            → «1,9946 mol» · «32,000 g»
 *       n(O₂)  = 1,99464 · (2/1) = 3,98928 mol        → «3,9893 mol»
 *       m(O₂)  = 3,98928 · 32,0   = 127,657 g         → «127,657 g»
 *       n(CO₂) = 1,99464 · (1/1) = 1,99464 mol        → «1,9946 mol»
 *       m(CO₂) = 1,99464 · 44,010 = 87,784 g          → «87,784 g»
 *       n(H₂O) = 1,99464 · (2/1) = 3,98928 mol        → «3,9893 mol»
 *       m(H₂O) = 3,98928 · 18,015 = 71,867 g          → «71,867 g»
 *       (control de masa: 32 + 127,657 = 159,657 g de reactivos frente a
 *        87,784 + 71,867 = 159,651 g de productos; los 0,006 g de desajuste son el redondeo
 *        de tabular O₂ como 32,0 en vez de 31,998, no un fallo de la relación estequiométrica)
 *
 *   CASO 2 (límite) — Reactivo limitante · HCl + NaOH → NaCl + H₂O · 2 mol y 2 mol
 *       Estequiometría 1:1 EXACTA, el caso frontera: cociente HCl = 2/1 = 2 y
 *       cociente NaOH = 2/1 = 2. EMPATE — a mano, ninguno de los dos limita: ambos se
 *       consumen íntegros y no sobra nada de ninguno.
 *       n(NaCl) = 2 · (1/1) = 2 mol  → m = 2 · 58,443 = 116,886 g   → «116,886 g» / «116,89 g»
 *       n(H₂O)  = 2 · (1/1) = 2 mol  → m = 2 · 18,015 =  36,030 g   → «36,030 g»  / «36,03 g»
 *       sobrantes: 0 mol de HCl y 0 mol de NaOH → NO debe aparecer ninguna fila «sobrante».
 *
 *   CASO 3 (rechazo) — cantidad negativa, cero y campo vacío
 *       −5, 0 y «» no son cantidades de materia posibles: la app debe negarse a calcular y
 *       decirlo, sin emitir tabla. Esperado: aviso en un role="alert" y CERO filas de resultado.
 *
 *   CASO 4 (extra, limitante de verdad) — Zn + 2HCl → ZnCl₂ + H₂ · 10 g de Zn y 10 g de HCl
 *       n(Zn)  = 10 / 65,38  = 0,152952 mol → cociente = 0,152952 / 1 = 0,152952
 *       n(HCl) = 10 / 36,461 = 0,274266 mol → cociente = 0,274266 / 2 = 0,137133
 *       0,137133 < 0,152952 ⇒ LIMITA EL HCl (los 10 g de Zn exigirían 0,30590 mol de HCl,
 *       o sea 11,153 g, y solo hay 10 g).
 *       consumo Zn  = 0,137133 · 1 = 0,137133 mol → 8,966 g   → «0,1371 mol» · «8,966 g»
 *       consumo HCl = 0,137133 · 2 = 0,274266 mol → 10,000 g  → «0,2743 mol» · «10,000 g»
 *       n(ZnCl₂) = 0,137133 mol → m = ·136,286 = 18,689 g     → «0,1371 mol» · «18,689 g»
 *       n(H₂)    = 0,137133 mol → m = ·2,016   =  0,276 g     → «0,1371 mol» · «0,276 g»
 *       Zn sobrante = (0,152952 − 0,137133) · 1 = 0,015819 mol → ·65,38 = 1,034 g
 *       Y la misma reacción en MOLES, 10 mol y 10 mol: cociente Zn = 10, cociente HCl = 5
 *       ⇒ limita HCl ⇒ 5 mol de ZnCl₂ = 5 · 136,286 = 681,430 g.
 *
 * HALLAZGOS ABIERTOS QUE ESTE FICHERO **NO** BLOQUEA (el Inspector no repara)
 *   · El toggle Gramos↔Moles no limpia ni recalcula el resultado ya pintado: cambiar la
 *     reacción o la sustancia SÍ lo limpia, la unidad no. Queda en pantalla una tabla con las
 *     cifras de la unidad anterior mientras la etiqueta del campo ya anuncia la nueva.
 *   · Tras pulsar Calcular no hay desplazamiento ni señal hacia el resultado, que se inserta
 *     debajo del botón; en móvil, con el botón al borde inferior, se ven ~7 px de la tabla.
 *   · En el empate 1:1 del CASO 2 la app rotula «⚠️ LÍMITE» al primer reactivo de la lista
 *     (desempate de Math.min/indexOf), cuando a mano no limita ninguno. Ver expect.soft abajo.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-reacciones-quimicas/';

/** Bloque role="status" donde la app pinta tabla y resumen. */
const resultado = (page: Page) => page.locator('[role="status"]');

/**
 * El aviso de la app. Se acota a <p> para no colisionar con el route-announcer de Next,
 * que también es un role="alert" y está siempre en el DOM (vacío).
 */
const aviso = (page: Page) => page.locator('p[role="alert"]');

/** Fila n-ésima del cuerpo de la tabla de resultados. */
const fila = (page: Page, n: number) => resultado(page).locator('table tbody tr').nth(n);

async function abrirPestana(page: Page, nombre: RegExp): Promise<void> {
  await page.getByRole('tab', { name: nombre }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador de Reacciones Químicas');
});

test('la app promete lo que este fichero verifica', async ({ page }) => {
  // La promesa del subtítulo: estequiometría + reactivo limitante sobre 20 reacciones.
  await expect(page.getByText(/Estequiometría y reactivo limitante — 20 reacciones reales/)).toBeVisible();
  // Y el catálogo tiene efectivamente las 20 tarjetas que anuncia el filtro «Todas».
  await expect(page.getByRole('button', { name: /^Todas \(20\)$/ })).toBeVisible();
  await expect(page.locator('[role="button"][aria-expanded]')).toHaveCount(20);
});

test('CASO 1 (normal) — 32 g de CH₄ reparten bien toda la ecuación de combustión', async ({ page }) => {
  await abrirPestana(page, /Estequiometr/);
  await page.locator('#stoicReaccion').selectOption({ label: 'Combustión del metano (gas natural)' });

  // La ecuación balanceada sobre la que descansa el cálculo hecho a mano.
  await expect(page.getByText('CH₄ + 2O₂ → CO₂ + 2H₂O').first()).toBeVisible();

  await page.locator('#stoicSustancia').selectOption('0'); // CH₄, la sustancia conocida
  await page.getByRole('button', { name: 'Gramos' }).click();
  await page.locator('input[type="number"]').first().fill('32');
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();

  // CH₄ — la base: 32 / 16,043 = 1,99464 mol (masa molar a mano: 12,011 + 4·1,008)
  await expect(fila(page, 0)).toContainText('1,9946 mol');
  await expect(fila(page, 0)).toContainText('32,000 g');
  // O₂ — coef 2/1: 1,99464 · 2 = 3,98928 mol; · 32,0 g/mol = 127,657 g
  await expect(fila(page, 1)).toContainText('3,9893 mol');
  await expect(fila(page, 1)).toContainText('127,657 g');
  // CO₂ — coef 1/1: 1,99464 mol; · 44,010 g/mol = 87,784 g
  await expect(fila(page, 2)).toContainText('1,9946 mol');
  await expect(fila(page, 2)).toContainText('87,784 g');
  // H₂O — coef 2/1: 3,98928 mol; · 18,015 g/mol = 71,867 g
  await expect(fila(page, 3)).toContainText('3,9893 mol');
  await expect(fila(page, 3)).toContainText('71,867 g');

  // La vía de MOLES sobre la misma reacción: 32 mol de CH₄ → 64 mol de O₂ = 64 · 32,0 = 2048 g.
  // (es-ES no agrupa cuatro cifras: «2048,000», no «2.048,000»)
  await page.getByRole('button', { name: 'Moles' }).click();
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  await expect(fila(page, 0)).toContainText('32,0000 mol');
  await expect(fila(page, 1)).toContainText('64,0000 mol');
  await expect(fila(page, 1)).toContainText('2048,000 g');
});

test('CASO 2 (límite) — estequiometría 1:1 exacta: 2 mol de HCl con 2 mol de NaOH', async ({ page }) => {
  await abrirPestana(page, /Reactivo Límite/);
  await page.locator('#limReaccion').selectOption({ label: 'Neutralización: HCl + NaOH' });
  await expect(page.getByText('HCl + NaOH → NaCl + H₂O').first()).toBeVisible();
  await page.getByRole('button', { name: 'Moles' }).click();

  const campos = page.locator('input[type="number"]');
  await expect(campos).toHaveCount(2); // dos reactivos, dos campos
  await campos.nth(0).fill('2'); // HCl
  await campos.nth(1).fill('2'); // NaOH
  await page.getByRole('button', { name: /Calcular reactivo limitante/ }).click();

  // Ambos reactivos se consumen enteros: 2 mol cada uno, ni más ni menos.
  await expect(fila(page, 0)).toContainText('2,0000 mol'); // HCl
  await expect(fila(page, 1)).toContainText('2,0000 mol'); // NaOH
  // NaCl: 2 mol · 58,443 g/mol (22,990 + 35,453) = 116,886 g
  await expect(fila(page, 2)).toContainText('2,0000 mol');
  await expect(fila(page, 2)).toContainText('116,886 g');
  // H₂O: 2 mol · 18,015 g/mol (2·1,008 + 15,999) = 36,030 g
  await expect(fila(page, 3)).toContainText('2,0000 mol');
  await expect(fila(page, 3)).toContainText('36,030 g');
  // Y el resumen de productos con 2 decimales: 116,89 g NaCl + 36,03 g H₂O
  await expect(resultado(page)).toContainText('116,89 g NaCl + 36,03 g H₂O');

  // Lo importante del caso frontera: al ser exacto NO sobra nada de ningún reactivo.
  await expect(resultado(page)).not.toContainText('sobrante');

  // HALLAZGO documentado: aun sin sobrante, la app rotula como limitante al primero de la
  // lista por desempate de Math.min/indexOf. A mano, en 1:1 exacto no limita ninguno.
  // Si algún día se corrige el desempate, es este expect.soft el que avisa.
  await expect
    .soft(resultado(page), 'empate 1:1: la app rotula HCl como limitante aunque a mano no limita ninguno')
    .toContainText('Reactivo limitante: HCl');
});

test('CASO 3 (rechazo) — cantidades negativas, cero o vacías no producen tabla', async ({ page }) => {
  // --- pestaña Estequiometría ---
  await abrirPestana(page, /Estequiometr/);
  const campo = page.locator('input[type="number"]').first();

  for (const entrada of ['-5', '0', '']) {
    await campo.fill(entrada);
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    // No hay cantidad de materia negativa ni nula: se rechaza y se dice.
    await expect(aviso(page)).toHaveText('Introduce una cantidad positiva.');
    await expect(resultado(page).locator('table tbody tr')).toHaveCount(0);
  }

  // Y en cuanto la entrada es válida, el aviso desaparece y sí hay resultado.
  await campo.fill('32');
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  await expect(aviso(page)).toHaveCount(0);
  await expect(resultado(page).locator('table tbody tr').first()).toBeVisible();

  // --- pestaña Reactivo Límite: basta con que UN reactivo sea inválido ---
  await abrirPestana(page, /Reactivo Límite/);
  await page.locator('#limReaccion').selectOption({ label: 'Zinc en ácido clorhídrico' });
  const campos = page.locator('input[type="number"]');
  for (const entrada of ['-3', '0', '']) {
    await campos.nth(0).fill('10');
    await campos.nth(1).fill(entrada);
    await page.getByRole('button', { name: /Calcular reactivo limitante/ }).click();
    await expect(aviso(page)).toHaveText('Introduce cantidades positivas para todos los reactivos.');
    await expect(resultado(page).locator('table tbody tr')).toHaveCount(0);
  }
});

test('CASO 4 (extra) — Zn + 2HCl: limita el HCl y sobra zinc', async ({ page }) => {
  await abrirPestana(page, /Reactivo Límite/);
  await page.locator('#limReaccion').selectOption({ label: 'Zinc en ácido clorhídrico' });
  await expect(page.getByText('Zn + 2HCl → ZnCl₂ + H₂').first()).toBeVisible();
  await page.getByRole('button', { name: 'Gramos' }).click();

  const campos = page.locator('input[type="number"]');
  await campos.nth(0).fill('10'); // Zn  → 10/65,38  = 0,152952 mol → cociente 0,152952
  await campos.nth(1).fill('10'); // HCl → 10/36,461 = 0,274266 mol → cociente 0,137133
  await page.getByRole('button', { name: /Calcular reactivo limitante/ }).click();

  // 0,137133 < 0,152952 ⇒ el HCl es el que se agota primero.
  await expect(resultado(page)).toContainText('Reactivo limitante: HCl');

  // Zn consumido: 0,137133 · 1 = 0,137133 mol → · 65,38 g/mol = 8,966 g
  await expect(fila(page, 0)).toContainText('0,1371 mol');
  await expect(fila(page, 0)).toContainText('8,966 g');
  // HCl consumido: 0,137133 · 2 = 0,274266 mol → · 36,461 g/mol = 10,000 g (se gasta entero)
  await expect(fila(page, 1)).toContainText('0,2743 mol');
  await expect(fila(page, 1)).toContainText('10,000 g');
  // ZnCl₂: 0,137133 mol → · 136,286 g/mol (65,38 + 2·35,453) = 18,689 g
  await expect(fila(page, 2)).toContainText('0,1371 mol');
  await expect(fila(page, 2)).toContainText('18,689 g');
  // H₂: 0,137133 mol → · 2,016 g/mol (2·1,008) = 0,276 g
  await expect(fila(page, 3)).toContainText('0,1371 mol');
  await expect(fila(page, 3)).toContainText('0,276 g');

  // Zn sobrante = (0,152952 − 0,137133) · 1 = 0,015819 mol → · 65,38 = 1,034 g
  await expect(resultado(page)).toContainText('Zn sobrante (exceso)');
  await expect(resultado(page)).toContainText('0,0158 mol — 1,034 g');
  // Resumen de productos a 2 decimales: 18,69 g ZnCl₂ + 0,28 g H₂
  await expect(resultado(page)).toContainText('18,69 g ZnCl₂ + 0,28 g H₂');

  // La misma reacción en MOLES, 10 y 10: cociente Zn = 10/1 = 10, cociente HCl = 10/2 = 5
  // ⇒ vuelve a limitar el HCl ⇒ 5 mol de ZnCl₂ = 5 · 136,286 = 681,430 g
  await page.getByRole('button', { name: 'Moles' }).click();
  await campos.nth(0).fill('10');
  await campos.nth(1).fill('10');
  await page.getByRole('button', { name: /Calcular reactivo limitante/ }).click();
  await expect(resultado(page)).toContainText('Reactivo limitante: HCl');
  await expect(fila(page, 2)).toContainText('5,0000 mol');
  await expect(fila(page, 2)).toContainText('681,430 g');
});

import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { REACCIONES, type Reaccion } from '../../app/simulador-reacciones-quimicas/motor';
import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS,
  coincideConLibro,
  comprobarRespuesta,
  decimalesDe,
  generarEjercicioAleatorio,
  resolverCaso,
  type DatosCaso,
} from '../../app/simulador-reacciones-quimicas/casos';

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
  // Desde el 23/08/2026 la app se abre en la CALCULADORA, que es lo que promete su title
  // (hallazgo 114), así que hay que ir al catálogo para verlo.
  await abrirPestana(page, /Catálogo/);
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

  // REPARADO el 23/08/2026 (hallazgo 118). Con los cocientes empatados no limita ninguno:
  // ambos reactivos se consumen íntegros y no sobra nada — que es justo lo que la propia app
  // confirmaba al no mostrar fila de sobrante. Antes rotulaba al primero de la lista, por el
  // desempate implícito de Math.min + indexOf. Es el caso frontera que más se pregunta.
  await expect(resultado(page)).toContainText('ninguno limita');
  await expect(resultado(page)).not.toContainText('Reactivo limitante:');
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

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASOS PARA CLASE (20/10/2026) — skill /casos-aula-meskeia, tipo A.
//
// Salió del aula presencial de Colombia del 20/10/2026 (48 visitas, 35 de una IP en 34 min).
// Las respuestas se calculan a mano con las masas molares que TABULA la app (las del catálogo:
// O₂ 32,0 · CaCO₃ 100,087 · C₃H₈ 44,096 · N₂ 28,014 · NH₃ 17,031 · CaO 56,077 · C₆H₁₂O₆ 180,156 ·
// CO₂ 44,010 · H₂O 18,015 · H₂ 2,016 · Na 22,990 · Cl₂ 70,906 · NaCl 58,443 · AgNO₃ 169,872 ·
// AgCl 143,321 · Fe 55,845 · Fe₂O₃ 159,69 · H₂SO₄ 98,079 · NaOH 39,997 · Al 26,982), que son el
// convenio de esta app: n = m ÷ M, razón n ÷ coeficiente, producto con la razón menor.
// Resueltas a mano (calculadora, 20/10/2026):
//   1  50 ÷ 100,087 = 0,499565 mol                                        → 0,500 mol
//   2  22 ÷ 44,096 = 0,498912 × 5 = 2,49456 mol de O₂                     → 2,495 mol
//   3  56 ÷ 28,014 = 1,998998 × 2 = 3,997997 mol × 17,031                → 68,09 g
//   4  250 ÷ 100,087 = 2,497827 × 1 × 56,077                              → 140,07 g
//   5  90 ÷ 180,156 = 0,499567 × 6 = 2,997402 × 44,010                    → 131,92 g
//   6  64 ÷ 32 = 2 mol de O₂ × 2 = 4 mol de H₂O × 18,015                  → 72,06 g
//   7  H₂ 3,968254 ÷ 2 = 1,984127 · O₂ 1 ÷ 1 = 1 → O₂; × 2 × 18,015       → 36,03 g
//   8  Na 1,000435 ÷ 2 = 0,500217 · Cl₂ 1,001326 → Na; × 2 × 58,443       → 58,47 g
//   9  NaCl 0,171107 · AgNO₃ 0,100075 → AgNO₃; × 143,321                  → 14,34 g
//  10  Fe 2,005551 ÷ 4 = 0,501388 · O₂ 2 ÷ 3 = 0,666667 → Fe; × 2 × 159,69 → 160,13 g
//  11  H₂SO₄ 0,499597 · NaOH 1,500113 ÷ 2 = 0,750056 → H₂SO₄; NaOH gastado 0,999194;
//      sobran 0,500919 × 39,997                                          → 20,04 g
//  12  Fe₂O₃ 1,001941 · Al 3,002001 ÷ 2 = 1,501 → Fe₂O₃; Al gastado 2,003882;
//      sobran 0,998119 × 26,982                                          → 26,93 g
//
// EL CONVENIO que se fija: las masas molares. Los libros de secundaria usan pesos atómicos
// redondeados; la app, masas con tres decimales. Los datos se eligieron para que las dos tablas
// den el mismo limitante y una respuesta dentro de la tolerancia: la invariante 7 lo comprueba
// con masas de libro calculadas AQUÍ desde la fórmula, no con la tabla de `casos.ts`.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const RESUELTAS_A_MANO = [0.5, 2.495, 68.09, 140.07, 131.92, 72.06, 36.03, 58.47, 14.34, 160.13, 20.04, 26.93];

/** Pesos atómicos de libro de secundaria. Zn y Cu no se usan: el modo práctica los excluye. */
const ATOMICO_LIBRO: Record<string, number> = {
  H: 1, C: 12, N: 14, O: 16, Na: 23, Al: 27, S: 32, Cl: 35.5, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65.4, Ag: 108, Ba: 137.3,
};
const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉';

/** Masa molar de libro desde la fórmula escrita con subíndices («C₂H₅OH» → 46). */
function masaDeLibro(formula: string): number {
  let total = 0;
  const re = /([A-Z][a-z]?)([₀-₉]*)/g;
  for (const [, el, sub] of formula.matchAll(re)) {
    const n = sub ? Number([...sub].map((c) => SUBINDICES.indexOf(c)).join('')) : 1;
    const a = ATOMICO_LIBRO[el];
    if (a === undefined) return NaN;
    total += a * n;
  }
  return total;
}

/**
 * Estequiometría propia del test, escrita sin mirar `motor.ts`: toma de la reacción solo sus
 * DATOS (coeficientes y masas) y hace la cuenta de libro. `masa` decide qué tabla de masas usar.
 */
function estequiometriaPropia(d: DatosCaso, masa: (formula: string, app: number) => number): { valor: number; limitante: number } {
  const r = REACCIONES.find((x) => x.id === d.reaccionId) as Reaccion;
  const M = (i: number) => masa(r.sustancias[i].formula, r.sustancias[i].masa);
  const k = (i: number) => r.sustancias[i].coef;
  if (d.pregunta === 'moles' || d.pregunta === 'masa') {
    const b = d.base ?? 0;
    const n = ((d.gramos ?? NaN) / M(b)) * (k(d.objetivo) / k(b));
    return { valor: d.pregunta === 'moles' ? n : n * M(d.objetivo), limitante: -1 };
  }
  const idx = r.sustancias.map((s, i) => (s.esReactivo ? i : -1)).filter((i) => i >= 0);
  const g = d.gramosReactivos ?? [];
  const razones = idx.map((i, j) => g[j] / M(i) / k(i));
  const lim = razones[0] <= razones[1] ? 0 : 1;
  const razon = razones[lim];
  if (d.pregunta === 'masa-limitante') return { valor: razon * k(d.objetivo) * M(d.objetivo), limitante: lim };
  const otro = idx[1 - lim];
  return { valor: (g[1 - lim] / M(otro) - razon * k(otro)) * M(otro), limitante: lim };
}
const masasDeLaApp = (_f: string, app: number) => app;
const masasDeLibro = (f: string) => masaDeLibro(f);

const redondearTest = (v: number, d: number): number => Math.round(v * 10 ** d) / 10 ** d;

test.describe('casos para clase · lógica (sin navegador)', () => {
  test('1 · doce casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS_AULA.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos resoluciones dan lo mismo', () => {
    for (const caso of CASOS_AULA) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta coincide con la resuelta a mano y con una estequiometría propia', () => {
    CASOS_AULA.forEach((caso, i) => {
      expect(caso.respuesta, `caso ${caso.id} frente a la cuenta a mano`).toBe(RESUELTAS_A_MANO[i]);
      const propia = estequiometriaPropia(caso.datos, masasDeLaApp).valor;
      expect(caso.respuesta, `caso ${caso.id} frente a la estequiometría del test`).toBe(
        redondearTest(propia, decimalesDe(caso.datos.pregunta)),
      );
    });
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, desarrollo y pista', () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta) && caso.respuesta > 0, `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(caso.unidad);
      // «\bNaN\b» y no «NaN»: el nitrato de sodio es NaNO₃.
      expect(caso.pasos.join(' '), `caso ${caso.id}`).not.toMatch(/\b[Dd]e el\b|\bNaN\b|undefined/);
      // Concordancia, vista al leer las soluciones impresas: «1 mol … va», no «van».
      expect(caso.pasos.join(' '), `caso ${caso.id}`).not.toMatch(/\b1 mol de \S+ van\b/);
      // La cifra exacta no puede acabar en un cero de relleno («68,0900 g → 68,09 g»).
      expect(caso.pasos.join(' '), `caso ${caso.id}`).not.toMatch(/,\d*0 (g|mol) →/);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos))\b/i;
    for (const caso of CASOS_AULA) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA, y el % va con espacio duro', () => {
    for (const caso of CASOS_AULA) {
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      if (caso.requiereRedondeo) {
        const pedidos = decimalesDe(caso.datos.pregunta) === 3 ? /tres decimales/ : /dos decimales/;
        expect(caso.enunciado, `caso ${caso.id}: exige redondeo y no lo pide`).toMatch(pedidos);
      }
      for (const texto of [caso.enunciado, caso.pista, caso.respuestaTexto, ...caso.pasos]) {
        expect(texto, `caso ${caso.id}`).not.toMatch(/\d ?%/);
      }
    }
  });

  test('5.ter · títulos que no chocan con el acta, ecuación de la app y casos montables en sus calculadoras', () => {
    for (const caso of CASOS_AULA) {
      // El título entra en el nombre accesible del botón del caso, y el acta busca por subcadena
      // los botones Gramos, Moles, Calcular y Todas (20).
      expect(caso.titulo, `caso ${caso.id}`).not.toMatch(/gramos|moles|calcular|todas/i);
      const r = REACCIONES.find((x) => x.id === caso.datos.reaccionId) as Reaccion;
      // El caso 1 solo pide una masa molar: no cita la ecuación.
      if (caso.id !== 1) expect(caso.enunciado, `caso ${caso.id}: la ecuación como la escribe la app`).toContain(r.ecuacion);
      const d = caso.datos;
      const gramos = d.gramosReactivos ?? [d.gramos ?? NaN];
      expect(gramos.every((g) => Number.isInteger(g) && g > 0), `caso ${caso.id}: gramos enteros`).toBe(true);
      if (d.gramosReactivos) {
        const idx = r.sustancias.map((s, i) => (s.esReactivo ? i : -1)).filter((i) => i >= 0);
        const razones = idx.map((i, j) => d.gramosReactivos![j] / r.sustancias[i].masa / r.sustancias[i].coef);
        expect(Math.abs(razones[0] - razones[1]) / Math.max(...razones), `caso ${caso.id}: lejos de la proporción exacta`).toBeGreaterThan(0.2);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', () => {
    const a = generarEjercicioAleatorio(12345);
    expect(generarEjercicioAleatorio(12345)).toEqual(a);
    const ejercicios = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(ejercicios.map((e) => e.respuesta)).size, 'respuestas distintas').toBeGreaterThanOrEqual(10);
    expect(new Set(ejercicios.map((e) => e.datos.pregunta)).size, 'tipos de pregunta').toBe(4);
    expect(new Set(ejercicios.map((e) => e.datos.reaccionId)).size, 'reacciones').toBeGreaterThanOrEqual(8);
    for (const e of ejercicios) {
      const propia = estequiometriaPropia(e.datos, masasDeLaApp).valor;
      expect(e.respuesta, `semilla ${e.semilla}`).toBe(redondearTest(propia, decimalesDe(e.datos.pregunta)));
      expect(comprobarRespuesta(e.respuesta, e.respuesta, e.datos).correcto, `semilla ${e.semilla}`).toBe(true);
      expect(e.enunciado, `semilla ${e.semilla}`).not.toMatch(/\d ?%|\bNaN\b|undefined|\b[Dd]e el\b/);
      expect(e.respuesta, `semilla ${e.semilla}`).toBeGreaterThanOrEqual(1);
    }
  });

  test('7 · convenio: con las masas de LIBRO sale el mismo limitante y una respuesta que se da por buena', () => {
    const ejercicios = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    for (const { datos, respuesta, origen } of [
      ...CASOS_AULA.map((c) => ({ datos: c.datos, respuesta: c.respuesta, origen: `caso ${c.id}` })),
      ...ejercicios.map((e) => ({ datos: e.datos, respuesta: e.respuesta, origen: `semilla ${e.semilla}` })),
    ]) {
      const app = estequiometriaPropia(datos, masasDeLaApp);
      const libro = estequiometriaPropia(datos, masasDeLibro);
      expect(Number.isFinite(libro.valor), `${origen}: falta una masa de libro`).toBe(true);
      expect(libro.limitante, `${origen}: el limitante cambia con las masas de libro`).toBe(app.limitante);
      const delLibro = redondearTest(libro.valor, decimalesDe(datos.pregunta));
      expect(comprobarRespuesta(delLibro, respuesta, datos).correcto, `${origen}: suspende ${delLibro}, la cuenta con masas de libro`).toBe(true);
      expect(coincideConLibro(datos), origen).toBe(true);
    }
  });

  test('7.bis · el corrector: errores típicos con nombre y lo que no es número', () => {
    const caso = (id: number) => CASOS_AULA[id - 1];
    // caso 1 multiplicando: 50 × 100,087 = 5004,35
    expect(comprobarRespuesta(5004.35, caso(1).respuesta, caso(1).datos).motivo).toMatch(/m ÷ M/);
    // caso 2 sin el coeficiente 5: 0,499 mol
    expect(comprobarRespuesta(0.499, caso(2).respuesta, caso(2).datos).motivo).toMatch(/coeficientes/);
    // caso 3 con los coeficientes como proporción de gramos: 56 × 2 = 112
    expect(comprobarRespuesta(112, caso(3).respuesta, caso(3).datos).motivo).toMatch(/proporciones de MOLES/);
    // caso 5 en moles: 2,9974
    expect(comprobarRespuesta(2.997, caso(5).respuesta, caso(5).datos).motivo).toMatch(/Eso son los moles/);
    // caso 7 con el reactivo en exceso (H₂): 1,984127 × 2 × 18,015 = 71,49
    expect(comprobarRespuesta(71.49, caso(7).respuesta, caso(7).datos).motivo).toMatch(/reactivo en exceso/);
    // caso 11 en moles: 0,5009
    expect(comprobarRespuesta(0.501, caso(11).respuesta, caso(11).datos).motivo).toMatch(/moles que sobran/);
    // caso 11 con la masa que reacciona: 0,999194 × 39,997 = 39,96
    expect(comprobarRespuesta(39.96, caso(11).respuesta, caso(11).datos).motivo).toMatch(/REACCIONA/);
    // lo que no es número, y un fallo cualquiera dice cuánto se ha desviado
    expect(comprobarRespuesta(NaN, caso(7).respuesta, caso(7).datos).motivo).not.toContain('NaN');
    const v = comprobarRespuesta(30, caso(7).respuesta, caso(7).datos);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toMatch(/desviado 6,03 g/);
  });
});

test.describe('casos para clase · en la página', () => {
  test('se corrige un caso, avisa del reactivo en exceso y «Cargar en la calculadora» lleva sus datos a la pestaña', async ({ page }) => {
    await esperarHidratacion(page, ['#casos-respuesta']);
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 7:/ }).click();
    await expect(seccion.getByRole('button', { name: /^Caso 7:/ })).toHaveAttribute('aria-pressed', 'true');

    const casilla = seccion.locator('#casos-respuesta');
    await casilla.fill('71,49');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('reactivo en exceso');

    await casilla.fill('36,03');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');

    await seccion.getByRole('button', { name: 'Cargar en la calculadora' }).click();
    await expect(page.getByRole('tab', { name: /Reactivo Límite/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#limReaccion')).toHaveValue('sintesis-agua');
    const campos = page.locator('input[type="number"]');
    await expect(campos.nth(0)).toHaveValue('8');
    await expect(campos.nth(1)).toHaveValue('32');
    // y la calculadora da lo mismo que el caso: 1 mol de O₂ → 2 mol de H₂O × 18,015 = 36,030 g
    await page.getByRole('button', { name: /Calcular reactivo limitante/ }).click();
    await expect(resultado(page)).toContainText('Reactivo limitante: O₂');
    await expect(fila(page, 2)).toContainText('36,030 g');
  });

  test('un caso de la pestaña Estequiometría conocido por su PRODUCTO se carga en la sustancia correcta', async ({ page }) => {
    await esperarHidratacion(page, ['#casos-respuesta']);
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 6:/ }).click();
    await seccion.getByRole('button', { name: 'Cargar en la calculadora' }).click();
    await expect(page.getByRole('tab', { name: /Estequiometría/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#stoicReaccion')).toHaveValue('electrolisis');
    await expect(page.locator('#stoicSustancia')).toHaveValue('2'); // el O₂, producto
    await expect(page.locator('input[type="number"]').first()).toHaveValue('64');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    // 64 g de O₂ = 2 mol → 4 mol de H₂O × 18,015 = 72,060 g
    await expect(fila(page, 0)).toContainText('72,060 g');
  });
});

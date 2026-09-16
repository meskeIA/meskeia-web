import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-circuitos-electricos (segmento cálculo, riesgo 3, 223 usos reales · Stemum)
 *
 * Primera inspección: 16/09/2026. La app promete en su <h1> «Simulador de Circuitos Eléctricos»
 * y en su subtítulo «Serie, paralelo, Ley de Ohm y potencia — hasta 6 resistencias». La metadata
 * añade «Calcula resistencia equivalente, caídas de tensión, corrientes de rama y potencia
 * disipada». Todo eso es verdad comprobable con lápiz: la física es elemental y no hay ninguna
 * constante empírica de por medio.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-circuitos-electricos/page.tsx — NO hay motor separado: las cuatro funciones
 *   (calcOhm, calcSerie, calcParalelo, calcPotencia) están dentro del componente, así que este
 *   fichero es el único candado que ve la física.
 *     · calcOhm      V = I·R  ·  I = V/R  ·  R = V/I
 *     · calcSerie    Req = ΣR · I = V/Req · V_i = I·R_i · P_i = I²·R_i
 *     · calcParalelo 1/Req = Σ(1/R) · I_i = V/R_i · P_i = V²/R_i
 *     · calcPotencia P = V·I  ·  kWh = (P/1000)·horas·días  ·  coste = kWh·tarifa
 *   El parseo de TODA entrada es `parseFloat(s.replace(',', '.'))` — 14 usos, los que señala
 *   `npm run check:parser`. De ahí sale el hallazgo del CASO 1.
 *
 * ⚠️ OJO AL FORMATEADOR, no es un fallo: `formatNumber(4700, 3)` devuelve «4700,000», SIN punto
 * de millar. Es correcto en es-ES — el separador de grupo no se usa con cuatro dígitos (ICU
 * minimumGroupingDigits = 2). Con cinco sí: 12.345,000. Por eso los esperados de abajo llevan
 * «4700,000» y no «4.700,000».
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Serie de 1 kΩ + 2,2 kΩ + 1,5 kΩ a 12 V, la tríada canónica E24
 *       Req = 1000 + 2200 + 1500                    = 4700 Ω
 *       I   = 12 / 4700 = 0,00255319148936 A        → 0,0026 A = 2,55 mA
 *       V1  = I·1000 = 2,55319148936 V              → 2,5532 V
 *       V2  = I·2200 = 5,61702127660 V              → 5,6170 V
 *       V3  = I·1500 = 3,82978723404 V              → 3,8298 V
 *       suma de caídas = 2,5532 + 5,6170 + 3,8298   = 12,0000 V = la fuente ✔ (2ª ley de Kirchhoff)
 *       P   = V²/Req = 144/4700 = 0,03063829787 W   → 0,0306 W
 *       P1 = I²·1000 = 0,00651878678 → 0,0065 · P2 = 0,01434133092 → 0,0143
 *       P3 = I²·1500 = 0,00977818017 → 0,0098   (0,0065+0,0143+0,0098 = 0,0306 ✔)
 *     Y EL MISMO CIRCUITO escrito en formato español —«1.000», «2.200», «1.500»—, que es como
 *     se escriben mil, dos mil doscientos y mil quinientos ohmios en el idioma de la app, tiene
 *     que dar EXACTAMENTE lo mismo. Ahí es donde falla (ver HALLAZGO 1).
 *
 *   CASO 2 (límite) — Paralelo con el MÁXIMO de resistencias: 6 × 60 Ω a 12 V
 *       El contador arranca en 3 y MAX_R = 6, así que se pulsa «+» cuatro veces y debe quedarse
 *       en 6: la cuarta pulsación no puede añadir un séptimo campo.
 *       1/Req = 6 × (1/60) = 6/60 = 0,1  →  Req = 10 Ω exactos → 10,0000 Ω
 *       (coherencia: 10 < 60, la equivalente en paralelo es menor que la rama más pequeña)
 *       I de cada rama = 12/60 = 0,2 A           → 0,2000 A
 *       I total = 6 × 0,2 = 1,2 A                → 1,2000 A   (y también 12/10 = 1,2 ✔)
 *       P total = V²/Req = 144/10 = 14,4 W       → 14,4000 W
 *       P de cada rama = V²/R = 144/60 = 2,4 W   → 2,4000 W   (6 × 2,4 = 14,4 ✔)
 *
 *   CASO 3 (rechazo) — Ley de Ohm, «Calcular Resistencia» con V = 12 V e I = 0 A
 *       R = V/I = 12/0 = ∞. No hay respuesta física: la app tiene que rechazarlo con un mensaje
 *       VISIBLE y no enseñar ningún resultado. Ni «∞ Ω», ni «No definido», ni un bloque vacío.
 *
 * ── HALLAZGO 1 (alto, cálculo) — EL CASO 1 ESTÁ EN ROJO A PROPÓSITO ──────────
 * Escribir «1.000» en un campo de resistencia hace que la app calcule con 1 Ω, no con 1000, y
 * no avisa de nada: el campo sigue mostrando «1.000». Medido el 16/09/2026 con el navegador en
 * es-ES, tecleando como un usuario:
 *     R1 = 1.000, R2 = 2.200, R3 = 1.500, V = 12
 *     esperado  Req = 4700,000 Ω · I = 0,0026 A · P total = 0,0306 W
 *     obtenido  Req =    4,700 Ω · I = 2,5532 A · P total = 30,6383 W   (factor 1000)
 * La cadena: `<input type="number">` acepta «1.000» como flotante válido y deja el value en
 * «1.000»; `parseFloat('1.000')` es 1. El parser canónico del proyecto, `parseSpanishNumber`,
 * devuelve 1000 para esa misma cadena. Lo que lo vuelve traicionero es que «4,700 Ω» se parece
 * a la respuesta buena: hay que fijarse en la coma para ver que no lo es. La tabla por
 * componente sí lo delata —el campo dice «1.000» y su celda R dice «1,00»—, pero hay que
 * mirarla. Variante peor: «1.234,56» llega al estado como «1.23456».
 * Este test se deja apuntando al comportamiento CORRECTO para que sirva de red a la reparación:
 * cuando los 14 `parseFloat(...replace(',', '.'))` pasen a `parseSpanishNumber`, se pondrá verde.
 *
 * Lo que NO es un hallazgo, medido y descartado: «12abc» en un campo de resistencia. El
 * `type="number"` del navegador se come las letras y el estado queda en «12», así que la app
 * nunca llega a ver basura por esa vía. El agujero es el separador de millar, no el texto.
 */

const RUTA = '/simulador-circuitos-electricos/';

/** Los campos de resistencia de la pestaña activa, en orden R1…Rn. */
const resistencia = (page: Page, i: number): Locator =>
  page.locator('input[placeholder="Ω"]').nth(i);

/** El valor que acompaña a una etiqueta del bloque de resultados (span hermano). */
const valorDe = (page: Page, etiqueta: string): Locator =>
  page
    .locator('div[role="status"]')
    .getByText(etiqueta, { exact: true })
    .locator('xpath=following-sibling::span[1]');

/** Las filas de la tabla por componente (dentro del bloque de resultados, no la del bloque educativo). */
const filas = (page: Page): Locator => page.locator('div[role="status"] table tbody tr');

test.describe('simulador-circuitos-electricos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    // La pestaña inicial es «Ley de Ohm»: sus dos campos sirven de testigo de hidratación
    // también para los clics en la barra de pestañas, que se perderían igual que una escritura.
    await esperarHidratacion(page, ['input[placeholder="0"]']);
  });

  test('CASO 1 · serie 1 kΩ + 2,2 kΩ + 1,5 kΩ a 12 V, en dígitos y en formato español', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).click();

    // ── Parte A: el circuito escrito sin separadores ──────────────────────────
    await sembrarValor(page, resistencia(page, 0), '1000');
    await sembrarValor(page, resistencia(page, 1), '2200');
    await sembrarValor(page, resistencia(page, 2), '1500');
    await sembrarValor(page, page.locator('input[placeholder="voltios"]'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // Req = R1 + R2 + R3 = 1000 + 2200 + 1500 = 4700 Ω
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('4700,000 Ω');
    // I = V / Req = 12 / 4700 = 0,00255319148936 A = 2,5531914894 mA
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,0026 A (2,55 mA)');
    // P = V² / Req = 144 / 4700 = 0,0306382979 W
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('0,0306 W');

    // Caídas de tensión V_i = I · R_i — y su suma tiene que devolver la tensión de la fuente:
    // 2,5532 + 5,6170 + 3,8298 = 12,0000 V (2ª ley de Kirchhoff)
    await expect(filas(page)).toHaveCount(3);
    await expect(filas(page).nth(0)).toContainText('2,5532 V'); // I · 1000
    await expect(filas(page).nth(1)).toContainText('5,6170 V'); // I · 2200
    await expect(filas(page).nth(2)).toContainText('3,8298 V'); // I · 1500
    // Potencias por componente P_i = I² · R_i; suman 0,0065 + 0,0143 + 0,0098 = 0,0306 W
    await expect(filas(page).nth(0)).toContainText('0,0065');
    await expect(filas(page).nth(1)).toContainText('0,0143');
    await expect(filas(page).nth(2)).toContainText('0,0098');

    // ── Parte B: EL MISMO circuito en formato español (HALLAZGO 1, hoy en rojo) ─
    // Mil, dos mil doscientos y mil quinientos ohmios se escriben así en español, y el proyecto
    // declara ese formato canónico (CLAUDE.md global §2). El resultado debe ser IDÉNTICO.
    await sembrarValor(page, resistencia(page, 0), '1.000');
    await sembrarValor(page, resistencia(page, 1), '2.200');
    await sembrarValor(page, resistencia(page, 2), '1.500');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // Mismo Req que en la parte A: 1000 + 2200 + 1500 = 4700 Ω.
    // Obtenido hoy: «4,700 Ω» — parseFloat('1.000') = 1, así que suma 1 + 2,2 + 1,5.
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('4700,000 Ω');
    // Y la corriente: 12 / 4700 = 0,0026 A. Obtenido hoy: «2,5532 A (2553,19 mA)».
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,0026 A (2,55 mA)');
    // La tabla enseña el desajuste en crudo: el campo muestra «1.000» y la celda R, «1,00».
    await expect(filas(page).nth(0)).toContainText('1000,00');
  });

  test('CASO 2 · límite: paralelo con el máximo de resistencias (6 × 60 Ω a 12 V)', async ({ page }) => {
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);

    // El contador arranca en 3 y MAX_R = 6: cuatro pulsaciones, seis campos. La cuarta tiene
    // que ser inocua — si el tope no se respetase, aparecería un séptimo campo.
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Aumentar' }).click();
    await expect(page.locator('input[placeholder="Ω"]')).toHaveCount(6);

    for (let i = 0; i < 6; i++) await sembrarValor(page, resistencia(page, i), '60');
    await sembrarValor(page, page.locator('input[placeholder="voltios"]'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // 1/Req = 6 × (1/60) = 0,1 → Req = 10 Ω exactos (y 10 < 60: menor que la rama más pequeña)
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('10,0000 Ω');
    // I total = Σ (V/R_i) = 6 × (12/60) = 1,2 A — que es también V/Req = 12/10 = 1,2 A
    await expect(valorDe(page, 'Corriente total (fuente)')).toHaveText('1,2000 A');
    // P total = V²/Req = 144/10 = 14,4 W
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('14,4000 W');

    // Las seis ramas son idénticas: I = 12/60 = 0,2 A y P = 144/60 = 2,4 W (6 × 2,4 = 14,4 ✔)
    await expect(filas(page)).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(filas(page).nth(i)).toContainText('0,2000');
      await expect(filas(page).nth(i)).toContainText('2,4000');
    }
  });

  test('CASO 3 · rechazo: R = V/I con I = 0 no puede devolver un número', async ({ page }) => {
    await page.getByRole('button', { name: 'Calcular Resistencia (R)' }).click();

    // R = V / I = 12 / 0 = ∞ — no hay resistencia que produzca 0 A con 12 V aplicados.
    await sembrarValor(page, page.locator('input[placeholder="0"]').nth(0), '12'); // Tensión V
    await sembrarValor(page, page.locator('input[placeholder="0"]').nth(1), '0');  // Corriente I
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();

    // El aviso tiene que VERSE (y va en un role="alert", así que un lector de pantalla lo canta).
    // Se acota a <main> porque Next cuelga del <body> su propio role="alert" vacío, el
    // #__next-route-announcer__, y sin acotar el localizador resuelve a dos elementos.
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveText('Introduce dos valores positivos.');

    // Y no puede haber resultado detrás: ni «∞», ni «No definido», ni un bloque a medias.
    await expect(page.locator('div[role="status"]')).toBeEmpty();
    await expect(page.getByText('Resultado', { exact: true })).toHaveCount(0);
  });
});

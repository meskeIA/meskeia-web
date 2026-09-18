import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

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
 *   El parseo de TODA entrada era casero —el que persigue `npm run check:parser`, 14 usos— y
 *   de ahí salió el hallazgo del CASO 1. Desde la reparación del 16/09/2026 es
 *   `parseSpanishNumber` de `@/lib` en los 14 sitios.
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
 * ── LOS CINCO HALLAZGOS, REPARADOS EL 16/09/2026 ─────────────────────────────
 * Los CASOS 1 a 3 son los de la inspección; los CASOS 4 a 7 se añadieron con la reparación,
 * uno por hallazgo, para que ninguno pueda volver sin que este fichero se ponga en rojo:
 *   868 alto   · separador de millar leído como decimal      → CASO 1 parte B
 *   869 medio  · terna V·I·R incompatible presentada como real → CASO 4
 *   871 medio  · conmutadores sin aria-pressed, botones sin type → CASO 6
 *   870 bajo   · campos de consumo sin validar                 → CASO 5
 *   872 bajo   · tensión del nodo impresa en crudo             → CASO 7
 *
 * ── HALLAZGO 1 (alto, cálculo) — EL CASO 1 PARTE B NACIÓ EN ROJO ─────────────
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
 * El test se escribió apuntando al comportamiento CORRECTO para servir de red a la reparación,
 * y en verde desde que los 14 parseos caseros pasaron al parser canónico del proyecto.
 *
 * Lo que NO es un hallazgo, medido y descartado: «12abc» en un campo de resistencia. El
 * `type="number"` del navegador se come las letras y el estado queda en «12», así que la app
 * nunca llega a ver basura por esa vía. El agujero es el separador de millar, no el texto.
 *
 * ── RE-INSPECCIÓN 18/09/2026 — los cinco cerrados, y el 868 destapó otro ─────
 * Comprobados uno a uno en producción con el navegador en es-ES y TECLEANDO con el teclado,
 * no sembrando el valor, que es como entra el dato de verdad:
 *   868 ✔ «1.000 + 2.200 + 1.500» a 12 V da Req = 4700,000 Ω (antes, 4,700 Ω)
 *   869 ✔ 230 V / 10 A / 5 Ω se rechaza nombrando los 50 V que sí cumplirían la ley de Ohm
 *   870 ✔ horas, días y tarifa vacíos se rechazan uno a uno y con su nombre
 *   871 ✔ los 7 conmutadores llevan aria-pressed, y type="button" los 10 botones
 *   872 ✔ la columna «V (V)» del paralelo imprime «12,5000», como sus cuatro vecinas
 * Y no aparece «NaN» ni «No definido» en ningún escenario probado (campos vacíos, ceros,
 * negativos): las cuatro funciones validan el NaN que `parseSpanishNumber` devuelve donde
 * `parseFloat` daba un número, que era el riesgo de la sustitución.
 *
 * ── HALLAZGO NUEVO (alto, cálculo) — el mismo factor 1000, ahora al revés ────
 * El parser canónico está pensado para TEXTO LIBRE, y estos 14 campos son `type="number"`:
 * el navegador NORMALIZA lo tecleado al formato flotante de HTML antes de que la app lo vea.
 * Medido en Chromium es-ES tecleando con el teclado:
 *     «1.000» → value «1.000»  ·  «1,000» → value «1.000»
 *     «0,145» → value «0.145»  ·  «12,5»  → value «12.5»
 * O sea: aquí el punto es SIEMPRE el decimal —la coma ni llega a la app—, y
 * `parseSpanishNumber` lee «0.145» como millar español (su AGRUPA_CON_PUNTO exige grupos de
 * exactamente tres cifras) y devuelve 145. Toda cifra con TRES decimales sale ×1000:
 *     Ley de Ohm · I = 0,020 A (los 20 mA del LED que propone su propia FAQ) y R = 150 Ω
 *         esperado  V = 3,0000 V · P = 0,0600 W
 *         obtenido  V = 3000,0000 V · I = 20,0000 A · P = 60.000,0000 W      → CASO 8
 *     Potencia · 2300 W durante 4 h × 30 días con tarifa 0,145 €/kWh
 *         esperado  40,0200 €      obtenido  40.020,0000 €                   → CASO 9
 *     Ley de Ohm · un shunt de 0,100 Ω con 2 A → esperado 0,2000 V, obtenido 200,0000 V
 * La app discrepa hasta de su propio control: con «1,000» tecleado, `valueAsNumber` vale 1 y
 * la flecha de subir del campo lo deja en «2», mientras el cálculo usa 1000.
 *
 * ⚠️ Con `type="number"`, el CASO 1 parte B y el CASO 8 no pueden estar verdes a la vez: el
 * navegador entrega «1.000» y «0.020», dos cadenas de la misma forma, y ninguna heurística
 * distingue lo que el usuario quiso porque la coma que lo decía se perdió antes. La salida es
 * que el campo deje de normalizar —`type="text"` con `inputMode="decimal"`—: entonces el
 * parser recibe «1.000» y «0,020» tal como se escribieron y no tiene nada que adivinar.
 *
 * ── HALLAZGO NUEVO (medio, cálculo) — el 869, con un cero por medio ──────────
 * La comprobación de coherencia solo corre cuando los TRES valores son > 0 (`validos.length
 * === 3`), así que la terna 230 V / 0 A / 5 Ω —igual de imposible: 230 ≠ 0 × 5— no se
 * rechaza. El 0 tecleado se descarta en silencio y el panel presenta I = 46,0000 A y
 * P = 10.580,00 W mientras el campo de la pantalla sigue diciendo 0. La pestaña Ley de Ohm sí
 * rechaza I = 0 («Introduce dos valores positivos»), de modo que la misma entrada recibe dos
 * respuestas distintas según la pestaña.                                      → CASO 10
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

/**
 * Escribe en un campo con el TECLADO, como el usuario. No es lo mismo que sembrar el valor:
 * un `<input type="number">` normaliza lo que se teclea antes de que la app lo vea (en es-ES
 * «0,020» queda como «0.020»), y esa normalización es justo el objeto de los CASOS 8 y 9.
 *
 * El testigo de hidratación es que el estado de React haya recogido lo que el DOM muestra —la
 * divergencia que vigila `esperarValorEnReact`—, y no una cadena fija: así el caso sigue
 * valiendo el día que el campo deje de normalizar, que es la reparación que pide el CASO 8.
 */
async function teclearComoUsuario(page: Page, campo: Locator, texto: string): Promise<void> {
  await campo.click();
  await campo.press('Control+a');
  await campo.press('Delete');
  if (texto !== '') await campo.pressSequentially(texto, { delay: 20 });
  await esperarValorEnReact(page, campo, await campo.inputValue());
}

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
    // Desde la reparación del 874 el aviso NOMBRA el campo y la razón, en vez de soltar un
    // «Introduce dos valores positivos» que valía igual para los dos campos y para tres causas
    // distintas (vacío, no numérico y no positivo).
    await expect(aviso).toHaveText('Corriente I (A): tiene que ser mayor que cero.');

    // Y no puede haber resultado detrás: ni «∞», ni «No definido», ni un bloque a medias.
    await expect(page.locator('div[role="status"]')).toBeEmpty();
    await expect(page.getByText('Resultado', { exact: true })).toHaveCount(0);
  });

  /**
   * CASO 3.bis (hallazgo 875, bajo) — el mensaje tiene que nombrar la causa REAL.
   *
   * `parseSpanishNumber` rechaza la notación científica a propósito (está documentado en
   * lib/formatters.ts: «1e3» valía 1000 con parseFloat y colaba importes plausibles pero
   * equivocados). La app, en cambio, lo comunicaba como «Todas las resistencias deben ser
   * valores positivos», así que el usuario veía rechazado un valor que su propio campo daba
   * por bueno —el navegador considera «1e3» un número válido y cumplía el min=0— y con una
   * explicación que no le decía qué corregir.
   */
  test('CASO 3.bis · rechazo: la notación científica se rechaza diciendo que es eso', async ({ page }) => {
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    // En esta pestaña los campos de resistencia llevan «Ω» de placeholder, no «0».
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);

    const resistencias = page.locator('input[placeholder="Ω"]');
    await sembrarValor(page, page.locator('input[placeholder="voltios"]'), '12');
    await sembrarValor(page, resistencias.nth(0), '1e3');
    await sembrarValor(page, resistencias.nth(1), '100');
    // En serie y paralelo el botón se llama «Calcular circuito», no «Calcular».
    await page.getByRole('button', { name: 'Calcular circuito', exact: true }).click();

    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('notación científica');
    await expect(aviso).toContainText('1000 en vez de 1e3');
  });

  /**
   * CASO 4 (hallazgo 869) — la pestaña Potencia deduce el valor que FALTA, así que con los tres
   * rellenos no se ejecutaba ninguna rama del despeje: P salía de V×I y la R se reimprimía tal
   * como se tecleó, sin comprobar que cumpliera la ley de Ohm. La ficha quedaba contradiciendo
   * su propio encabezado, «P = V × I = V²/R = I²×R», que con esa terna da tres potencias:
   *     V×I   = 230 × 10   = 2300 W   ← la única que se enseñaba
   *     V²/R  = 52900 / 5  = 10580 W
   *     I²×R  = 100 × 5    = 500 W
   * No hay circuito que produzca 230 V con 10 A a través de 5 Ω: la ley de Ohm exige 50 V.
   */
  test('CASO 4 · rechazo: V, I y R juntos que no cumplen la ley de Ohm', async ({ page }) => {
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    // Los seis campos de la pestaña, en el orden en que se presentan: V, I, R, horas, días, tarifa.
    // Desde la reparación del 873 los campos son type="text" + inputMode="decimal": en un
    // campo numérico el navegador normaliza «0,145» a «0.145» antes de que la app lo vea.
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);
    await esperarHidratacion(page, ['input[placeholder="opcional si tienes I y R"]']);

    await sembrarValor(page, campo(0), '230');
    await sembrarValor(page, campo(1), '10');
    await sembrarValor(page, campo(2), '5');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();

    // El aviso nombra la cifra que sí cumpliría la ley: I × R = 10 × 5 = 50 V.
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('50,0000 V');
    await expect(aviso).toContainText('230,0000 V');
    // Y no se enseña nada detrás: una terna imposible no puede producir una ficha de resultados.
    await expect(page.locator('div[role="status"]')).toBeEmpty();

    // La MISMA terna, ya coherente (230 = 10 × 23), sí tiene que calcular: el aviso es para lo
    // que no puede existir, no para todo lo que traiga los tres campos. P = 230 × 10 = 2300 W.
    await sembrarValor(page, campo(2), '23');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);
    await expect(valorDe(page, 'Potencia (P)')).toHaveText('2300,00 W');
    await expect(valorDe(page, 'Resistencia (R)')).toHaveText('23,0000 Ω');
  });

  /**
   * CASO 5 (hallazgo 870) — V, I y R se validaban con rigor, pero los tres campos que producen
   * la cifra DESTACADA del panel (horas, días y tarifa) no se miraban: vacíos llegaban como NaN
   * hasta imprimirse «No definido», sin mensaje y sin decir cuál faltaba, al lado de una P y una
   * R correctas. Fallaba de forma visible, pero dejaba al usuario sin saber qué corregir.
   */
  test('CASO 5 · rechazo: sin horas de uso no se puede dar consumo ni coste', async ({ page }) => {
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    // Desde la reparación del 873 los campos son type="text" + inputMode="decimal": en un
    // campo numérico el navegador normaliza «0,145» a «0.145» antes de que la app lo vea.
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);
    await esperarHidratacion(page, ['input[placeholder="opcional si tienes I y R"]']);

    // V e I bastan para la parte eléctrica (R se deduce: 230/10 = 23 Ω), así que el único
    // impedimento para el bloque energético es el campo de horas, que arranca en «1».
    await sembrarValor(page, campo(0), '230');
    await sembrarValor(page, campo(1), '10');
    await sembrarValor(page, campo(3), ''); // Horas de uso diario, vaciado
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();

    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('horas de uso diario');
    // Nada de una ficha a medias con «No definido» en las dos líneas que el usuario venía a ver.
    await expect(page.locator('div[role="status"]')).toBeEmpty();

    // Con las horas puestas, el bloque completo: P = 230 × 10 = 2300 W → 2,3 kW.
    // kWh = 2,3 × 4 h × 30 días = 276 kWh · coste = 276 × 0,18 €/kWh = 49,68 €.
    await sembrarValor(page, campo(3), '4');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('276,0000 kWh');
    await expect(valorDe(page, 'Coste estimado')).toHaveText('49,6800 €');
  });

  /**
   * CASO 6 (hallazgo 871) — cuál de las cuatro calculadoras estaba en pantalla, y qué magnitud
   * se iba a despejar, lo transmitía SOLO una clase CSS: los 7 conmutadores salían con
   * aria-pressed nulo y sin la alternativa exenta (role="tab" + aria-selected), de modo que un
   * lector de pantalla no podía saber dónde estaba. Y 10 botones no declaraban type.
   */
  test('CASO 6 · los conmutadores declaran su estado y ningún botón puede enviar un formulario', async ({ page }) => {
    const PESTANAS = ['Ley de Ohm', 'Serie', 'Paralelo', 'Potencia'];
    const boton = (nombre: string) => page.getByRole('button', { name: nombre, exact: true });

    // Al cargar, la pestaña activa es «Ley de Ohm» y es la única pulsada.
    for (const n of PESTANAS) {
      await expect(boton(n)).toHaveAttribute('aria-pressed', n === 'Ley de Ohm' ? 'true' : 'false');
    }

    // Los tres selectores de incógnita, igual: arranca en Tensión (V).
    const INCOGNITAS = ['Calcular Tensión (V)', 'Calcular Corriente (I)', 'Calcular Resistencia (R)'];
    for (const n of INCOGNITAS) {
      await expect(boton(n)).toHaveAttribute('aria-pressed', n === 'Calcular Tensión (V)' ? 'true' : 'false');
    }
    await boton('Calcular Resistencia (R)').click();
    for (const n of INCOGNITAS) {
      await expect(boton(n)).toHaveAttribute('aria-pressed', n === 'Calcular Resistencia (R)' ? 'true' : 'false');
    }

    // Y el estado viaja al cambiar de pestaña, que es lo que el lector de pantalla necesita oír.
    await boton('Serie').click();
    for (const n of PESTANAS) {
      await expect(boton(n)).toHaveAttribute('aria-pressed', n === 'Serie' ? 'true' : 'false');
    }

    // type="button" en todos los botones de la herramienta (CLAUDE.md global §5): sin él, un
    // botón dentro de un <form> envía el formulario al pulsarlo.
    for (const n of [...PESTANAS, 'Reducir', 'Aumentar', 'Calcular circuito']) {
      await expect(boton(n).first()).toHaveAttribute('type', 'button');
    }
    await boton('Ley de Ohm').click();
    for (const n of [...INCOGNITAS, 'Calcular']) {
      await expect(boton(n)).toHaveAttribute('type', 'button');
    }

    // Y el que NO debe llevarlo: «Calcular» es una acción, no un conmutador. Un aria-pressed
    // ahí anuncia un estado que no existe, y es una regresión, no una mejora (CLAUDE.md §5).
    await expect(boton('Calcular')).not.toHaveAttribute('aria-pressed', /.*/);
  });

  /**
   * CASO 7 (hallazgo 872) — la columna «V (V)» de la tabla por componente imprimía el estado
   * crudo del input en vez de pasarlo por el formateador, como sí hacen sus cuatro vecinas. Y
   * como el input normaliza el decimal a punto, una tensión con decimales salía en formato US
   * dentro de una tabla española (CLAUDE.md global §2).
   *
   * Los números, resueltos a mano — 3 × 100 Ω a 12,5 V:
   *   1/Req = 3/100 = 0,03      → Req = 100/3 = 33,333… Ω  → 33,3333
   *   I rama = 12,5/100 = 0,125 A                          → 0,1250
   *   I total = 3 × 0,125 = 0,375 A                        → 0,3750
   *   P rama = V²/R = 156,25/100 = 1,5625 W                → 1,5625
   *   P total = V²/Req = 156,25 / 33,333… = 4,6875 W       → 4,6875  (3 × 1,5625 ✔)
   */
  test('CASO 7 · la tensión del nodo se imprime en formato español, como sus celdas vecinas', async ({ page }) => {
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);

    for (let i = 0; i < 3; i++) await sembrarValor(page, resistencia(page, i), '100');
    // Lo que el campo contiene tras teclear «12,5» con el navegador en es-ES: el input
    // normaliza el decimal a punto, y es justo esa cadena la que se imprimía en crudo.
    await sembrarValor(page, page.locator('input[placeholder="voltios"]'), '12.5');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('33,3333 Ω');
    await expect(valorDe(page, 'Corriente total (fuente)')).toHaveText('0,3750 A');
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('4,6875 W');

    await expect(filas(page)).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      // La celda de tensión, con coma decimal y los mismos 4 decimales que sus vecinas.
      await expect(filas(page).nth(i)).toContainText('12,5000');
      await expect(filas(page).nth(i)).toContainText('100,00');  // R
      await expect(filas(page).nth(i)).toContainText('0,1250');  // I de rama
      await expect(filas(page).nth(i)).toContainText('1,5625');  // P de rama
    }
    // Y no puede quedar rastro del punto decimal en ninguna fila de la tabla.
    await expect(filas(page).nth(0)).not.toContainText('12.5');
  });

  /**
   * CASO 8 (hallazgo nuevo del 18/09/2026, alto) — 0,020 A y 0,02 A son la MISMA corriente, y
   * la app tiene que devolver lo mismo con las dos. El cero final no es un capricho: es como se
   * copia «20 mA» de una hoja de características, y son los 20 mA del LED que propone la propia
   * FAQ de la app («V_LED ≈ 2 V, I_LED ≈ 20 mA. Con 5 V: R = (5−2)/0,02 = 150 Ω»).
   *
   * Resuelto a mano — I = 0,02 A a través de R = 150 Ω:
   *     V = I · R = 0,02 × 150 = 3 V exactos              → 3,0000 V
   *     I en miliamperios = 0,02 × 1000 = 20 mA           → 0,0200 A — 20,00 mA
   *     P = V · I = 3 × 0,02 = 0,06 W                     → 0,0600 W
   * Obtenido hoy con «0,020»: V = 3000,0000 V, I = 20,0000 A, P = 60.000,0000 W. El campo es
   * `type="number"` y deja «0.020», que `parseSpanishNumber` lee como millar español → 20 A.
   */
  test('CASO 8 · 0,020 A es la misma corriente que 0,02 A', async ({ page }) => {
    // La pestaña arranca en «Calcular Tensión (V)», que es lo que hace falta: se dan I y R.
    const corriente = page.locator('input[placeholder="0"]').nth(0);
    const resistencia150 = page.locator('input[placeholder="0"]').nth(1);
    const calcular = page.getByRole('button', { name: 'Calcular', exact: true });

    await teclearComoUsuario(page, corriente, '0,02');
    await teclearComoUsuario(page, resistencia150, '150');
    await calcular.click();
    await expect(valorDe(page, 'Tensión (V)')).toHaveText('3,0000 V');
    await expect(valorDe(page, 'Corriente (I)')).toHaveText('0,0200 A — 20,00 mA');
    await expect(valorDe(page, 'Potencia disipada (P)')).toHaveText('0,0600 W');

    // Cambiar de incógnita y volver BORRA el resultado (setResOhm(null)) sin tocar los campos:
    // sin esto, la segunda mitad esperaría los mismos números y daría verde leyendo la ficha
    // anterior aunque el botón no hubiera calculado nada.
    await page.getByRole('button', { name: 'Calcular Corriente (I)', exact: true }).click();
    await page.getByRole('button', { name: 'Calcular Tensión (V)', exact: true }).click();
    await expect(page.locator('div[role="status"]')).toBeEmpty();

    // La misma corriente, escrita con el cero final. Tiene que dar EXACTAMENTE lo mismo.
    await teclearComoUsuario(page, corriente, '0,020');
    await calcular.click();
    await expect(valorDe(page, 'Tensión (V)')).toHaveText('3,0000 V');
    await expect(valorDe(page, 'Corriente (I)')).toHaveText('0,0200 A — 20,00 mA');
    await expect(valorDe(page, 'Potencia disipada (P)')).toHaveText('0,0600 W');
  });

  /**
   * CASO 9 (hallazgo nuevo del 18/09/2026, alto) — la misma trampa sobre la cifra DESTACADA del
   * panel de consumo. Las tarifas eléctricas se publican con tres decimales muy a menudo
   * (0,145 €/kWh), y ahí el factor 1000 no se nota mirando: «40.020,0000 €» se parece a
   * «40,0200 €» igual que «4,700 Ω» se parecía a 4700 Ω en el hallazgo 868.
   *
   * Resuelto a mano — 230 V × 10 A durante 4 h/día y 30 días:
   *     P    = 230 × 10 = 2300 W = 2,3 kW
   *     kWh  = 2,3 × 4 × 30 = 276 kWh                     → 276,0000 kWh
   *     con tarifa 0,15  €/kWh → 276 × 0,15  = 41,40 €    → 41,4000 €   (control, en verde)
   *     con tarifa 0,145 €/kWh → 276 × 0,145 = 40,02 €    → 40,0200 €
   * Obtenido hoy con 0,145: «40.020,0000 €» — el campo deja «0.145» y el parser lee 145 €/kWh.
   */
  test('CASO 9 · una tarifa de tres decimales no puede multiplicar el coste por mil', async ({ page }) => {
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="opcional si tienes I y R"]']);
    // Los seis campos de la pestaña, en orden: V, I, R, horas, días, tarifa.
    // Desde la reparación del 873 los campos son type="text" + inputMode="decimal": en un
    // campo numérico el navegador normaliza «0,145» a «0.145» antes de que la app lo vea.
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);
    const calcular = page.getByRole('button', { name: 'Calcular', exact: true });

    await teclearComoUsuario(page, campo(0), '230');
    await teclearComoUsuario(page, campo(1), '10');
    await teclearComoUsuario(page, campo(3), '4');    // horas de uso diario (arranca en 1)
    await teclearComoUsuario(page, campo(5), '0,15'); // tarifa de control: dos decimales
    await calcular.click();
    await expect(valorDe(page, 'Potencia (P)')).toHaveText('2300,00 W');
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('276,0000 kWh');
    await expect(valorDe(page, 'Coste estimado')).toHaveText('41,4000 €');

    // Y la misma factura con la tarifa escrita con tres decimales: 276 × 0,145 = 40,02 €.
    // Los dos esperados son distintos a propósito, así que una ficha que no se refrescara
    // dejaría el caso en rojo en vez de colarse.
    await teclearComoUsuario(page, campo(5), '0,145');
    await calcular.click();
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('276,0000 kWh');
    await expect(valorDe(page, 'Coste estimado')).toHaveText('40,0200 €');
  });

  /**
   * CASO 10 (hallazgo nuevo del 18/09/2026, medio) — lo que quedó del hallazgo 869. La terna se
   * comprueba solo cuando los tres valores son > 0, así que 230 V con 0 A a través de 5 Ω pasa
   * sin decir nada: es tan imposible como la del CASO 4 (230 ≠ 0 × 5), pero el 0 se descarta en
   * silencio y la ficha enseña I = 46,0000 A —la que sale de despejar 230/5— junto a un campo
   * que en pantalla sigue diciendo 0, y P = 10.580,00 W.
   *
   * La misma entrada recibe hoy dos respuestas distintas según la pestaña: la Ley de Ohm con
   * I = 0 la rechaza («Introduce dos valores positivos», CASO 3) y esta la calcula.
   */
  test('CASO 10 · rechazo: V, I y R juntos siguen siendo imposibles cuando la I tecleada es 0', async ({ page }) => {
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="opcional si tienes I y R"]']);
    // Desde la reparación del 873 los campos son type="text" + inputMode="decimal": en un
    // campo numérico el navegador normaliza «0,145» a «0.145» antes de que la app lo vea.
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);

    await teclearComoUsuario(page, campo(0), '230');
    await teclearComoUsuario(page, campo(1), '0');
    await teclearComoUsuario(page, campo(2), '5');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();

    // Un aviso VISIBLE, como en el CASO 4 y como en el CASO 3: lo que no puede existir no
    // produce ficha. Obtenido hoy: ninguna alerta y un panel completo.
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toBeVisible();
    await expect(page.locator('div[role="status"]')).toBeEmpty();
    // Y en particular, no puede enseñarse una corriente que el usuario no ha escrito.
    await expect(page.getByText('46,0000 A')).toHaveCount(0);
  });
});

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
    const campo = (i: number) => page.locator('input[type="number"]').nth(i);
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
    const campo = (i: number) => page.locator('input[type="number"]').nth(i);
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
});

import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-titulacion (segmento cálculo/química, riesgo 3, 224 usos reales)
 *
 * Primera inspección: 25/08/2026. El <h1> promete «Simulador de Titulación Ácido-Base» y el
 * subtítulo «Titula gota a gota y observa la curva de pH en tiempo real». La metadata promete
 * «4 tipos de titulación: AF+BF, AD+BF, AF+BD, AD+BD», «Curva de pH en tiempo real»,
 * «4 indicadores con su rango de viraje» y «Cálculo automático del punto de equivalencia».
 * La verdad es la química de equilibrios ácido-base: cerrada, exacta y calculable a mano, así
 * que la app se trata como verificable y cada número se contrasta con el que sale del papel.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-titulacion/page.tsx
 *   · calcularPH(tipo, V_tit, V_ana, C_ana, C_tit, pKa, pKb) → una rama por tipo de titulación
 *       af-bf : exceso de ácido −log[H⁺] · equivalencia forzada a 7 · exceso de base 14 − pOH
 *       ad-bf : inicial ½(pKa − log C) · tampón Henderson-Hasselbalch pKa + log(n_A⁻/n_HA)
 *               equivalencia 7 + ½(pKa + log C_sal) · exceso de base 14 − pOH
 *       af-bd : ácido fuerte hasta la equivalencia · equivalencia 7 − ½(pKb + log C_sal)
 *               después, tampón inverso pOH = pKb + log(n_BH⁺/n_B)
 *       ad-bd : equivalencia ½(pKa + 14 − pKb)
 *     La rama de equivalencia solo entra si |V − V_eq| < 0,001 mL.
 *   · V_eq = C_analito · V_analito / C_titulante   · V_max del ensayo = 2 · V_eq
 *   · INDICADORES → rangos de viraje y colores · getColorMatraz() interpola dentro del rango
 *   · getFase(V, V_eq) → rótulo de la etapa que se muestra en «Estado actual»
 *   · curva → 201 puntos equiespaciados en [0, 2·V_eq], recortados a pH ∈ [0, 14]
 *   lib/formatters.ts → formatNumber(n, d) con toLocaleString('es-ES')
 *
 *   Los CINCO parámetros son <input type="range">: V_analito ∈ [10, 100] mL paso 1,
 *   [Analito] y [Titulante] ∈ [0,01, 1] M paso 0,01, pKa y pKb ∈ [1, 12] paso 0,1.
 *   El volumen de titulante NO tiene campo: solo los botones «+ Gota (0,1 mL)», «+ 1 mL»,
 *   «Ir a equivalencia» y «↺ Reiniciar». No hay ni un solo input de texto en la herramienta.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — ÁCIDO FUERTE + BASE FUERTE, el caso de solución cerrada y sin excusa.
 *   25,00 mL de HCl 0,1 M valorados con NaOH 0,1 M (estado de fábrica de la app).
 *     V_eq = C_a·V_a/C_t = 0,1 · 25 / 0,1 = 25,00 mL
 *     V = 0,00 mL   [H⁺] = 0,1 M                                    → pH = −log 0,1 = 1,00
 *     V = 12,50 mL  n(H⁺) = 2,50 − 1,25 = 1,25 mmol en 37,50 mL
 *                   [H⁺] = 1,25/37,50 = 0,0333333 M                 → pH = 1,4771 → 1,48
 *     V = 25,00 mL  equivalencia. El NaCl no se hidroliza (Na⁺ y Cl⁻ son iones espectadores),
 *                   así que solo queda la autoprotólisis del agua                 → pH = 7,00
 *     V = 50,00 mL  n(OH⁻) = 5,00 − 2,50 = 2,50 mmol en 75,00 mL
 *                   [OH⁻] = 0,0333333 M → pOH = 1,4771              → pH = 14 − 1,4771 = 12,52
 *
 *   CASO 2 (límite) — ÁCIDO DÉBIL + BASE FUERTE, donde está el error clásico.
 *   25 mL de CH₃COOH 0,1 M con NaOH 0,1 M. La app arranca con pKa = 4,76 (Ka = 1,738·10⁻⁵),
 *   que es el valor tabulado clásico del acético; con el pKa = 4,74 de Ka = 1,8·10⁻⁵ los tres
 *   números de abajo salen 2,87 / 4,74 / 8,72, dentro de la tolerancia de ±0,05.
 *     V = 0,00 mL   [H⁺] = √(Ka·C) = √(1,738·10⁻⁵ · 0,1) = 1,3183·10⁻³ → pH = 2,88
 *     V = 12,50 mL  SEMIEQUIVALENCIA: se ha neutralizado la mitad, [A⁻] = [HA],
 *                   log([A⁻]/[HA]) = 0                              → pH = pKa = 4,76 EXACTO
 *     V = 25,00 mL  EQUIVALENCIA: NO es 7. Todo el ácido es ya acetato, y el acetato hidroliza.
 *                   C_sal = 2,50 mmol / 50,00 mL = 0,05 M
 *                   Kb = Kw/Ka = 10⁻¹⁴ / 1,738·10⁻⁵ = 5,754·10⁻¹⁰
 *                   [OH⁻] = √(Kb·C_sal) = √(2,877·10⁻¹¹) = 5,364·10⁻⁶ → pOH = 5,27 → pH = 8,73
 *     V = 50,00 mL  el NaOH en exceso manda: [OH⁻] = 2,50/75,00 = 0,0333 M     → pH = 12,52
 *
 *   CASO 3 (rechazo y límites)
 *     No hay forma de teclear 0, un negativo ni texto: los cinco parámetros son deslizadores
 *     con mínimo estrictamente positivo, y el navegador recorta cualquier valor que se les
 *     asigne por debajo del mínimo. La app se defiende POR CONSTRUCCIÓN, no por validación.
 *     Exceso de titulante muy allá del punto final: el tope es V_max = 2·V_eq, y ahí
 *       [OH⁻] = C_a·C_t/(C_t + 2·C_a), máximo con C_a = C_t = 1 M ⇒ [OH⁻] = 1/3 = 0,3333 M
 *       → pOH = 0,4771 → pH = 13,52. Es la cota superior alcanzable: NUNCA pH > 14 ni pH < 0,
 *       y converge al pH de la base pura (13,52 es ya casi el 14,00 del NaOH 1 M).
 *     Indicadores contra el dato estándar: fenolftaleína 8,2–10,0 incoloro→rosa ·
 *       naranja de metilo 3,1–4,4 rojo→amarillo · azul de bromotimol 6,0–7,6 amarillo→azul ·
 *       tornasol 5,0–8,0 rojo→azul. Los cuatro rangos de la app son correctos.
 *
 *   COMPROBACIÓN DE ESPALDAS (los otros dos tipos, para descartar que acierte por casualidad)
 *     AF+BD · HCl 0,1 M + NH₃ 0,1 M, pKb = 4,74: equivalencia = NH₄⁺ 0,05 M,
 *       Ka(NH₄⁺) = 10⁻¹⁴/1,82·10⁻⁵ = 5,50·10⁻¹⁰, [H⁺] = √(5,50·10⁻¹⁰·0,05) = 5,24·10⁻⁶ → pH 5,28 ✔
 *       A V = 50 mL, NH₄⁺ y NH₃ equimolares ⇒ pOH = pKb = 4,74 → pH 9,26 ✔
 *     AD+BD · equivalencia = ½(pKa + 14 − pKb) = ½(4,76 + 14 − 4,74) = 7,01 ✔
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * VEREDICTO — el motor de pH es correcto. Los cuatro tipos de titulación dan el número exacto
 * en el punto inicial, en la semiequivalencia, en la equivalencia y en el exceso de titulante.
 * En particular NO comete el error clásico: la equivalencia del ácido débil sale 8,73, no 7,00.
 * Los hallazgos están en los bordes de ese motor y en el acompañamiento.
 *
 * HALLAZGOS del 25/08/2026, REPARADOS el mismo día. Al final, ya sin `test.fail()`: son
 * tests de regresión normales.
 *
 * Lo que la reparación descubrió y no estaba en ningún acta: el helper que movía los
 * deslizadores usaba el truco del setter nativo + `dispatchEvent`, que escribe el DOM pero
 * NO llega a React. El CASO 3 creía valorar a 1 M mientras la app seguía a 0,1 M, así que la
 * bureta se agotaba a las 5 pulsaciones de las 50 que daba — un rojo permanente que no tenía
 * nada que ver con lo que el test dice comprobar. Y el hallazgo [4] fallaba por ese mismo
 * motivo, no por el cero negativo que documenta. Ahora se usa `locator.fill` (ver `deslizar`).
 * Un test que no llega a la app no verifica la app, aunque su color parezca informar.
 *
 *   [1] calculo/medio — En ácido débil + base fuerte, la PRIMERA GOTA BAJA EL pH. A V = 0 la
 *       app usa ½(pKa − log C) y da 2,88; a V = 0,10 mL salta a Henderson-Hasselbalch puro y
 *       da 2,36. Añadir NaOH no puede acidificar nada. A mano, con el balance de cargas
 *       ([A⁻] = C_A + [H⁺], [HA] = C_HA − [H⁺]) sale x² + 4,1578·10⁻⁴x − 1,7239·10⁻⁶ = 0,
 *       x = 1,1215·10⁻³ → pH = 2,95: SUBE 0,07. La app se equivoca en 0,59 unidades y, peor,
 *       en el SENTIDO. No es redondeo: es que H-H no vale cuando n(A⁻) ≪ n(HA) y ahí hay que
 *       resolver la cuadrática. La curva dibujada enseña el defecto: pH(0) = 2,882 →
 *       pH(0,25) = 2,766 → pH(0,50) = 3,070, un valle al inicio de una curva que solo sube.
 *
 *   [2] contenido/medio — La app NO recomienda indicador ni avisa del inadecuado, y con el
 *       inadecuado el propio simulador induce el error. Con AD+BF y naranja de metilo
 *       (viraje 3,1–4,4) el matraz ya marca «amarillo» —color básico, punto final alcanzado—
 *       a V = 8,00 mL, con la valoración al 32 %. La equivalencia real está en 25,00 mL, así
 *       que quien lea el punto final ahí subestima la concentración en un 68 %. La tabla del
 *       bloque educativo SÍ dice que el naranja de metilo es para AF+BD y la fenolftaleína
 *       para AD+BF, y la FAQ de la metadata lo repite («El naranja de metilo, que vira entre
 *       3 y 4, daría un error importante en estas titulaciones»), pero nada de eso está
 *       conectado con el selector: se puede elegir sin que la herramienta diga una palabra.
 *
 *   [3] contenido/medio — Los rótulos de «Fase» están corridos: en V = V_eq EXACTO la app
 *       rotula «Salto de equivalencia», y llama «Punto de equivalencia» a V = 27,00 mL, que
 *       son 2 mL PASADOS de la equivalencia (108 %). getFase() reparte los tramos así:
 *       |V − V_eq| < 5 % ⇒ «Salto de equivalencia» · V < 110 % ⇒ «Punto de equivalencia».
 *       El punto de equivalencia es UNO y es V_eq. La app dedica una FAQ entera a distinguir
 *       punto de equivalencia de punto final, y luego el rótulo enseña lo contrario.
 *
 *   [4] calculo/bajo — Con [Analito] = 1 M en AF+BF, el pH inicial se muestra «-0,00».
 *       −Math.log10(1) da −0 en JavaScript y toLocaleString('es-ES') conserva el signo. El pH
 *       de un HCl 1 M es 0,00, sin signo. Cosmético, pero es un pH negativo en pantalla.
 *
 *   [5] operativa/bajo — «% completado» está topado en 100 (Math.min(100, …)), así que en
 *       V = 27,00 mL (108 %) y en V = 50,00 mL (200 %) marca «100,0 %» igual que en la
 *       equivalencia. En la mitad derecha de la curva el porcentaje deja de informar.
 *
 *   [6] accesibilidad/bajo — Los 12 botones propios de la app (4 tipos de titulación,
 *       4 indicadores, 4 controles) van sin type="button", y los 7 emojis decorativos que
 *       acompañan texto (🎯 💧 📏 🔁 📊 🧪 de «Mejores Prácticas» y ⚠️ de «Errores
 *       Frecuentes») van sin aria-hidden="true". Lo confirma el candado del proyecto:
 *       `node scripts/check-a11y-jsx.mjs app/simulador-titulacion/page.tsx` → 6 líneas JSX
 *       con button sin type + 7 casos que piden criterio. El aria-pressed de las pestañas y
 *       de los indicadores sí está bien puesto: son conmutadores, no botones de acción.
 *
 *   [7] accesibilidad/bajo — El SVG de la curva lleva los colores cableados en el marcado, sin
 *       variante para modo oscuro. Las etiquetas de los ejes usan fill="#64748b" sobre el
 *       rgb(31,41,55) del contenedor oscuro: contraste 3,07:1, por debajo del 4,5:1 de AA
 *       para texto normal (y son rótulos de 9-10 px). El rótulo «Viraje» (#92400e) sobre su
 *       banda queda en 2,13:1.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-titulacion/';

/** Valor de una fila del panel «Estado actual», buscado por su etiqueta exacta. */
const valorDe = (page: Page, etiqueta: string) =>
  page.locator(`xpath=//span[normalize-space(.)='${etiqueta}']/following-sibling::span[1]`);

/** El texto del color que declara ver en el matraz («incoloro», «transición», «amarillo»…). */
const colorMatraz = (page: Page) =>
  page.locator("xpath=//strong[normalize-space(.)='Color visible:']/following-sibling::span[1]");

const gota = (page: Page) => page.getByRole('button', { name: '+ Gota (0,1 mL)', exact: true });
const mililitro = (page: Page) => page.getByRole('button', { name: '+ 1 mL', exact: true });
const irAEquivalencia = (page: Page) => page.getByRole('button', { name: 'Ir a equivalencia' });
const reiniciar = (page: Page) => page.getByRole('button', { name: /Reiniciar/ });

async function pulsar(boton: ReturnType<typeof gota>, veces: number) {
  for (let i = 0; i < veces; i++) await boton.click();
}

/**
 * Mueve un deslizador de la app hasta un valor y ESPERA a que el estado lo refleje.
 *
 * Dos cosas, las dos aprendidas el 25/08/2026 depurando un rojo permanente:
 *
 * 1. Con `locator.fill`, NO con el truco del setter nativo + `dispatchEvent`. Ese truco
 *    escribe el DOM pero **no llega a React**: tras usarlo el input decía «1» y el rótulo de
 *    al lado —que pinta el ESTADO, `formatNumber(C_analito, 2)`— seguía diciendo «0,10 M».
 *
 * 2. Y hay que esperar al rótulo antes de tocar el deslizador siguiente. Dos `fill`
 *    encadenados sin esperar dejan el segundo actuando sobre un DOM que React todavía no ha
 *    reconciliado, y al re-renderizar pisa el primero: `cAnalito` volvía a 0,10 M después de
 *    haberlo puesto a 1. Con la espera de por medio, los dos se aplican.
 *
 * Lo que costaba: el CASO 3 creía valorar a 1 M mientras la app seguía a 0,1 M, así que V_eq
 * era 2,5 mL en vez de 25 y la bureta se agotaba a las 5 pulsaciones de las 50 que el test
 * daba. Y el hallazgo [4] fallaba por ese mismo motivo, no por el cero negativo que
 * documenta. Un test que no llega a la app no verifica la app, aunque su color parezca decir
 * algo.
 */
async function deslizar(page: Page, id: string, valor: string, rotuloEsperado: string) {
  const rotulo = page.locator(`#${id} ~ [class*="sliderValue"]`).first();
  // Con TECLADO, que es como lo movería una persona: `focus` + `End` lleva un `input[range]`
  // a su máximo con eventos nativos que React procesa siempre. `locator.fill` no vale aquí —
  // escribe el valor y dispara el evento, pero si llega antes de que React haya hidratado el
  // input, el evento se pierde en silencio y el deslizador se queda donde estaba, sin que
  // nada falle: es lo que dejaba el CASO 3 valorando a 0,1 M mientras creía estar a 1 M.
  // El reintento se DECLARA y se comprueba contra el rótulo, que pinta el ESTADO de React.
  await expect(async () => {
    const input = page.locator(`#${id}`);
    await input.focus();
    if (valor === (await input.getAttribute('max'))) await page.keyboard.press('End');
    else if (valor === (await input.getAttribute('min'))) await page.keyboard.press('Home');
    else await input.fill(valor);
    await expect(rotulo).toHaveText(rotuloEsperado, { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

/** Lleva la bureta a un volumen exacto desde 0: enteros con «+1 mL» y décimas con «+ Gota». */
async function verter(page: Page, mL: number) {
  await reiniciar(page).click();
  const enteros = Math.floor(mL + 1e-9);
  const decimas = Math.round((mL - enteros) * 10);
  await pulsar(mililitro(page), enteros);
  await pulsar(gota(page), decimas);
}

/** Los pH que realmente dibuja una polilínea del SVG, deshaciendo la transformación del componente. */
async function phsDeLaCurva(page: Page, indice: number): Promise<number[]> {
  return await page.locator('svg[aria-label="Curva de titulación"] polyline').nth(indice).evaluate(
    (poli) =>
      poli
        .getAttribute('points')!
        .trim()
        .split(' ')
        // y = 320 − (pH/14)·290  ⇒  pH = (320 − y)·14/290
        .map((p) => ((320 - Number(p.split(',')[1])) / 290) * 14),
  );
}

/** La curva completa va en gris (índice 0) y la ya recorrida en azul encima (índice 1). */
const CURVA_COMPLETA = 0;
const CURVA_RECORRIDA = 1;

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Simulador de Titulación Ácido-Base',
  );
});

test('la app promete lo que este fichero verifica', async ({ page }) => {
  await expect(page.locator('header p').first()).toHaveText(
    'Titula gota a gota y observa la curva de pH en tiempo real',
  );

  // Los 4 tipos de titulación que anuncia la metadata, con su ecuación.
  for (const ecuacion of [
    'HCl \\+ NaOH → NaCl \\+ H₂O',
    'CH₃COOH \\+ NaOH → CH₃COONa \\+ H₂O',
    'HCl \\+ NH₃ → NH₄Cl',
    'CH₃COOH \\+ NH₃ → CH₃COONH₄',
  ]) {
    await expect(page.getByRole('button', { name: new RegExp(ecuacion) })).toBeVisible();
  }

  // Los 4 indicadores, con su rango de viraje contrastado contra el dato estándar de laboratorio.
  const virajes = await page.locator('button small').evaluateAll((ss) =>
    ss.map((s) => s.textContent!.trim()),
  );
  expect(virajes).toEqual([
    'Vira pH 8,2–10,0 (incoloro → rosa fucsia)', // fenolftaleína: 8,2–10,0 incoloro → rosa ✔
    'Vira pH 3,1–4,4 (rojo → amarillo)', //          naranja de metilo: 3,1–4,4 rojo → amarillo ✔
    'Vira pH 6,0–7,6 (amarillo → azul)', //          azul de bromotimol: 6,0–7,6 amarillo → azul ✔
    'Vira pH 5,0–8,0 (rojo → azul)', //              tornasol: ~5–8 rojo → azul ✔
  ]);
});

// ───────────────────────── CASO 1 · normal · ácido fuerte + base fuerte ─────────────────────

test('CASO 1 · HCl 0,1 M 25 mL con NaOH 0,1 M: 1,00 → 1,48 → 7,00 exacto → 12,52', async ({
  page,
}) => {
  // El estado de fábrica ya es el caso: AF+BF, 25 mL, 0,1 M y 0,1 M.
  await expect(valorDe(page, 'Volumen de equivalencia (V_eq)')).toHaveText('25,00 mL');

  // V = 0: [H⁺] = 0,1 M ⇒ pH = −log 0,1 = 1,00
  await expect(valorDe(page, 'pH actual')).toHaveText('1,00');

  // V = 12,50 mL: quedan 1,25 mmol de HCl en 37,50 mL ⇒ [H⁺] = 0,033333 M ⇒ pH = 1,4771
  await verter(page, 12.5);
  await expect(valorDe(page, 'Volumen añadido')).toHaveText('12,50 mL');
  await expect(valorDe(page, 'pH actual')).toHaveText('1,48');

  // V = 25,00 mL: equivalencia. NaCl no hidroliza ⇒ pH = 7,00 EXACTO.
  await irAEquivalencia(page).click();
  await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,00 mL');
  await expect(valorDe(page, 'pH actual')).toHaveText('7,00');

  // V = 50,00 mL: 2,50 mmol de OH⁻ en 75,00 mL ⇒ pOH = 1,4771 ⇒ pH = 12,52
  await pulsar(mililitro(page), 25);
  await expect(valorDe(page, 'Volumen añadido')).toHaveText('50,00 mL');
  await expect(valorDe(page, 'pH actual')).toHaveText('12,52');
});

test('CASO 1 · la curva dibujada dice lo mismo que el número (AF+BF)', async ({ page }) => {
  // El punto final de la polilínea azul tiene que caer en el pH que se lee en «Estado actual».
  await verter(page, 12.5);
  const enMitad = await phsDeLaCurva(page, CURVA_RECORRIDA);
  expect(enMitad[enMitad.length - 1]).toBeCloseTo(1.477, 2);

  await irAEquivalencia(page).click();
  const enEquivalencia = await phsDeLaCurva(page, CURVA_RECORRIDA);
  expect(enEquivalencia[enEquivalencia.length - 1]).toBeCloseTo(7.0, 2);
});

// ───────────────────── CASO 2 · límite · ácido débil + base fuerte ──────────────────────────

test('CASO 2 · CH₃COOH 0,1 M con NaOH: semiequivalencia = pKa y equivalencia BÁSICA, no 7', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
  await expect(
    page.locator('xpath=//label[@for="pKa"]/following-sibling::span[1]'),
  ).toHaveText('pKa = 4,76');

  // V = 0: [H⁺] = √(Ka·C) = √(1,738·10⁻⁵ · 0,1) = 1,3183·10⁻³ ⇒ pH = 2,88
  await expect(valorDe(page, 'pH actual')).toHaveText('2,88');

  // V = 12,50 mL: SEMIEQUIVALENCIA. [A⁻] = [HA] ⇒ log([A⁻]/[HA]) = 0 ⇒ pH = pKa EXACTO.
  await verter(page, 12.5);
  await expect(valorDe(page, 'pH actual')).toHaveText('4,76');

  // V = 25,00 mL: EQUIVALENCIA. Queda acetato 0,05 M hidrolizando:
  // Kb = 10⁻¹⁴/1,738·10⁻⁵ = 5,754·10⁻¹⁰ · [OH⁻] = √(Kb·0,05) = 5,364·10⁻⁶ · pOH = 5,27 ⇒ pH 8,73.
  // Si aquí saliera 7,00 el motor estaría tratando el ácido débil como fuerte.
  await irAEquivalencia(page).click();
  await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,00 mL');
  await expect(valorDe(page, 'pH actual')).toHaveText('8,73');
  await expect(valorDe(page, 'pH actual')).not.toHaveText('7,00');

  // V = 50,00 mL: manda el NaOH sobrante, 2,50 mmol en 75,00 mL ⇒ pH = 12,52
  await pulsar(mililitro(page), 25);
  await expect(valorDe(page, 'pH actual')).toHaveText('12,52');
});

test('CASO 2 · la fenolftaleína vira dentro del salto y el número de la curva cuadra', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
  await irAEquivalencia(page).click();

  // pH 8,73 cae dentro del viraje 8,2–10,0: el matraz está virando, ni incoloro ni rosa del todo.
  await expect(colorMatraz(page)).toHaveText('transición');
  const recorrida = await phsDeLaCurva(page, CURVA_RECORRIDA);
  expect(recorrida[recorrida.length - 1]).toBeCloseTo(8.73, 1);
});

// ───────────────────────── CASO 3 · rechazo y límites ───────────────────────────────────────

test('CASO 3 · no hay manera de meter 0, un negativo ni texto', async ({ page }) => {
  await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();

  // Ni un solo campo de texto ni numérico: los 5 parámetros son deslizadores acotados.
  const campos = await page.locator('input').evaluateAll((is) =>
    is.map((i) => {
      const e = i as HTMLInputElement;
      return { id: e.id, tipo: e.type, min: e.min, max: e.max };
    }),
  );
  expect(campos).toEqual([
    { id: 'vAnalito', tipo: 'range', min: '10', max: '100' },
    { id: 'cAnalito', tipo: 'range', min: '0.01', max: '1' },
    { id: 'cTitulante', tipo: 'range', min: '0.01', max: '1' },
    { id: 'pKa', tipo: 'range', min: '1', max: '12' },
  ]);

  // El navegador recorta cualquier asignación por debajo del mínimo: la defensa es estructural.
  const recorte = await page.evaluate(() => {
    const salida: Record<string, Record<string, string>> = {};
    for (const id of ['cAnalito', 'cTitulante', 'vAnalito']) {
      const el = document.getElementById(id) as HTMLInputElement;
      const original = el.value;
      salida[id] = {};
      for (const v of ['0', '-5', 'texto']) {
        el.value = v;
        salida[id][v] = el.value;
      }
      el.value = original;
    }
    return salida;
  });
  for (const id of ['cAnalito', 'cTitulante', 'vAnalito']) {
    for (const intento of ['0', '-5', 'texto']) {
      expect(Number(recorte[id][intento])).toBeGreaterThan(0);
    }
  }
});

test('CASO 3 · el exceso de titulante converge al pH de la base pura y nunca sale de [0, 14]', async ({
  page,
}) => {
  // El peor caso posible: analito y titulante a 1 M, el par que maximiza el pH final.
  await deslizar(page, 'cAnalito', '1', '1,00 M');
  await deslizar(page, 'cTitulante', '1', '1,00 M');

  // Tope de la bureta: V_max = 2·V_eq = 50 mL. Sobran 25 mmol de OH⁻ en 75 mL ⇒ [OH⁻] = 0,3333 M
  // ⇒ pOH = 0,4771 ⇒ pH = 13,52, ya casi el 14,00 del NaOH 1 M. No se dispara.
  await pulsar(mililitro(page), 50);
  await expect(valorDe(page, 'pH actual')).toHaveText('13,52');
  await expect(mililitro(page)).toBeDisabled();
  await expect(gota(page)).toBeDisabled();

  // Y toda la curva dibujada se mantiene dentro de la escala física.
  const phs = await phsDeLaCurva(page, CURVA_COMPLETA);
  expect(Math.min(...phs)).toBeGreaterThanOrEqual(0);
  expect(Math.max(...phs)).toBeLessThanOrEqual(14);

  // Y ninguna casilla emite basura numérica.
  const panel = await page.locator('div[role="status"]').innerText();
  expect(panel).not.toMatch(/NaN|Infinity|∞|No definido/);
});

// ────────── HALLAZGOS del 25/08/2026 · REPARADOS ese mismo día (regresión) ──────────

test(
  '[1] calculo/medio — la primera gota de NaOH no puede BAJAR el pH de un ácido débil',
  async ({ page }) => {
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
    await expect(valorDe(page, 'pH actual')).toHaveText('2,88'); // ½(pKa − log C), correcto

    // Añadir 0,10 mL de NaOH 0,1 M a 25 mL de acético 0,1 M. Con el balance de cargas exacto:
    // C_HA = 2,49/25,1 = 0,09920 M · C_A = 0,01/25,1 = 3,984·10⁻⁴ M
    // x² + 4,1578·10⁻⁴x − 1,7239·10⁻⁶ = 0 ⇒ x = 1,1215·10⁻³ ⇒ pH = 2,95.
    // La app pasa a Henderson-Hasselbalch puro y devuelve 2,36: baja donde debe subir.
    await gota(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('0,10 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('2,95');
  },
);

test(
  '[1 bis] calculo/medio — la curva de AD+BF no puede tener un valle al principio',
  async ({ page }) => {
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
    // La curva de una valoración de ácido con base es monótona creciente de principio a fin,
    // así que su mínimo tiene que ser el primer punto.
    // Hoy: pH(v=0) = 2,882 → pH(v=0,25) = 2,766 → pH(v=0,50) = 3,070. El mínimo NO es el origen.
    const phs = await phsDeLaCurva(page, CURVA_COMPLETA);
    expect(Math.min(...phs)).toBeCloseTo(phs[0], 2);
  },
);

test(
  '[2] REGRESIÓN 344 — con AD+BF el naranja de metilo da el punto final al 32 %, y la app avisa',
  async ({ page }) => {
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
    await page.getByRole('button', { name: /Naranja de metilo/ }).click();

    // A V = 8,00 mL (32 % de la valoración) el pH es 4,43, ya por encima del viraje 3,1–4,4:
    // el simulador declara el matraz «amarillo», o sea punto final alcanzado, con la
    // equivalencia real todavía a 25,00 mL. Quien pare ahí subestima la concentración un 68 %.
    //
    // La reparación NO falsea el matraz —el naranja de metilo vira ahí de verdad, y ocultarlo
    // sería enseñar química falsa—: lo que hace es DECIR que ese indicador no sirve para esta
    // valoración, que es lo que un profesor diría al verte elegirlo. El acta admitía
    // cualquiera de las dos vías; esta conserva el fenómeno y añade la advertencia.
    await verter(page, 8);
    await expect(valorDe(page, 'pH actual')).toHaveText('4,43');
    await expect(colorMatraz(page)).toHaveText('amarillo');
    await expect(page.locator('[class*="indicatorAviso"]')).toBeVisible();
  },
);

test(
  '[2 bis] REGRESIÓN 344 — elegir un indicador inadecuado produce una advertencia',
  async ({ page }) => {
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
    await page.getByRole('button', { name: /Naranja de metilo/ }).click();

    // La herramienta tiene que decir que ese indicador no sirve para esta valoración: su
    // tabla educativa y la FAQ de la metadata ya lo sabían, pero el selector no lo conectaba.
    const aviso = page.locator('[class*="indicatorAviso"]');
    await expect(aviso).toContainText('no sirve para esta valoración');
    // Y tiene que razonarlo con los dos números que lo deciden.
    await expect(aviso).toContainText('8,73');      // pH de la equivalencia
    await expect(aviso).toContainText('3,1');       // inicio del viraje del naranja de metilo

    // Con la fenolftaleína (vira 8,2–10,0, y la equivalencia está en 8,73) el aviso desaparece
    // y el indicador se marca como apto: el criterio discrimina, no avisa siempre.
    await page.getByRole('button', { name: /Fenolftaleína/ }).click();
    await expect(aviso).toHaveCount(0);
    await expect(page.locator('[class*="indicatorApto"]')).toHaveCount(1);
  },
);

test(
  '[3] contenido/medio — el punto de equivalencia es V_eq, no 2 mL más allá',
  async ({ page }) => {
    // En V = V_eq exacto la fase debería llamarse «Punto de equivalencia»; la app dice «Salto».
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,00 mL');
    await expect(valorDe(page, 'Fase')).toHaveText('Punto de equivalencia');
  },
);

test(
  '[3 bis] contenido/medio — a 27,00 mL (108 % de V_eq) ya no se está en el punto de equivalencia',
  async ({ page }) => {
    await verter(page, 27);
    await expect(valorDe(page, 'Fase')).not.toHaveText('Punto de equivalencia');
  },
);

test('[4] REGRESIÓN 346 — el pH de un HCl 1 M es 0,00, no «-0,00»', async ({ page }) => {
  await deslizar(page, 'cAnalito', '1', '1,00 M');
  // −Math.log10(1) es −0 en JavaScript y toLocaleString('es-ES') conservaba el signo. Se
  // normaliza en `formatNumber` (lib/formatters.ts), que es de donde venía: no era de la app.
  await expect(valorDe(page, 'pH actual')).toHaveText('0,00');
});

test('[5] REGRESIÓN 347 — «% completado» no se queda clavado en 100 %', async ({ page }) => {
  // A 50,00 mL con V_eq = 25,00 mL se ha vertido el 200 % del titulante, no el 100 %.
  await pulsar(mililitro(page), 50);
  await expect(valorDe(page, 'Volumen añadido')).toHaveText('50,00 mL');
  await expect(valorDe(page, '% completado')).toHaveText('200,0 %');
});

test(
  '[6] REGRESIÓN 348 — los 12 botones propios de la app llevan type="button"',
  async ({ page }) => {
    // Los botones de MeskeiaLogo, EducationalSection y ShareCard sí lo llevaban; los de la app no.
    //
    // Se excluye el overlay de `next dev` (`nextjs-portal`), que monta botones sin `type` y no
    // es de la app: aparece de forma intermitente según lo que el servidor esté compilando, y
    // por eso este test pasaba en solitario y fallaba dentro de la suite. Es el mismo falso
    // rojo que el proyecto ya se encontró en el sonómetro.
    // `getRootNode() !== document` es lo que de verdad descarta el overlay: vive en un shadow
    // DOM, y `closest('nextjs-portal')` no cruza esa frontera —lo intenté y seguía colándose—.
    // Playwright sí atraviesa el shadow root al buscar, así que el filtro tiene que ser este.
    const sinType = await page.locator('button').evaluateAll((bs) =>
      bs
        .filter((b) => b.getRootNode() === document && !b.getAttribute('type'))
        .map((b) => b.textContent!.trim().slice(0, 30)),
    );
    expect(sinType).toEqual([]);
  },
);

test(
  '[6 bis] REGRESIÓN 348 — los 7 emojis decorativos junto a texto llevan aria-hidden',
  async ({ page }) => {
    // 🎯 💧 📏 🔁 📊 🧪 de «Mejores Prácticas» y ⚠️ de «Errores Frecuentes».
    // EducationalSection monta su contenido siempre en el DOM, así que no hace falta abrirlo.
    //
    // Se miran SOLO los spans de esta app, por su CSS Module. Los de MeskeiaLogo, RelatedApps
    // y Footer también arrastran emojis sin aria-hidden (🌙, 🔗, los iconos de tarjeta y el 💡
    // del pie), pero eso NO es de esta app: es de tres componentes que monta el catálogo
    // entero, así que se repara ahí y con su propio alcance, no dentro de una tanda.
    const sueltos = await page.locator('span').evaluateAll((spans) => {
      const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
      // Solo los de ESTA app: se reconocen por su CSS Module. Los de MeskeiaLogo, RelatedApps
      // y Footer se descartan aquí y se anotan aparte, con su propio alcance.
      const esDeLaApp = (s: Element) => /SimuladorTitulacion-module/.test(s.className || '');
      return spans
        .filter(
          (s) =>
            esDeLaApp(s) &&
            emoji.test(s.textContent || '') &&
            s.children.length === 0 &&
            s.getAttribute('aria-hidden') !== 'true' &&
            s.getAttribute('aria-label') === null,
        )
        .map((s) => s.textContent);
    });
    expect(sueltos).toEqual([]);
  },
);

test(
  '[7] REGRESIÓN 349 — las etiquetas de la curva cumplen AA en modo oscuro',
  async ({ page }) => {
    // El atributo se REAPLICA en cada intento: ponerlo una vez no basta porque el script de
    // tema de la app lo reescribe al hidratar leyendo la preferencia guardada, y entonces se
    // mediría el fondo claro y el resultado saldría al revés — o el poll agotaría el tiempo,
    // que es lo que pasaba de forma intermitente dentro de la suite.
    await expect
      .poll(async () =>
        page.evaluate(() => {
          document.documentElement.setAttribute('data-theme', 'dark');
          return getComputedStyle(
            document.querySelector('svg[aria-label="Curva de titulación"]')!.parentElement!,
          ).backgroundColor;
        }),
      )
      .toBe('rgb(31, 41, 55)');

    const contraste = await page.evaluate(() => {
      // Del color COMPUTADO, no del atributo `fill`: desde el 25/08/2026 el JSX escribe
      // `var(--svg-eje)`, que es justo lo que permite tener un valor distinto en cada tema
      // (hallazgo 349). Leer el atributo devolvía la cadena «var(--svg-eje)» y el cálculo
      // salía NaN — un test que no mide nada, pero que sin este comentario parecería medir.
      const luminancia = (color: string) => {
        const canales = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map((n) => {
            const v = Number(n) / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
        return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
      };
      const svg = document.querySelector('svg[aria-label="Curva de titulación"]')!;
      const texto = getComputedStyle(svg.querySelector('text')!).fill;
      const fondo = getComputedStyle(svg.parentElement!).backgroundColor;
      const [claro, oscuro] = [luminancia(texto), luminancia(fondo)].sort((x, y) => y - x);
      return (claro + 0.05) / (oscuro + 0.05);
    });
    // Antes del 25/08/2026 salía 3,07:1 sobre el rgb(31,41,55) del contenedor en oscuro.
    expect(contraste).toBeGreaterThanOrEqual(4.5);
  },
);

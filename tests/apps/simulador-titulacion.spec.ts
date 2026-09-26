import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

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
  // Se excluye la casilla de respuesta de los casos para clase (26/09/2026), que no es un
  // parámetro del simulador: es la misma acotación que se hizo en simulador-fluidos-bernoulli.
  const campos = await page.locator('input:not(#casos-respuesta)').evaluateAll((is) =>
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (26/09/2026) — la tarea asignable de esta app (tipo A, casos numerados).
 *
 * Salió de la semilla S0165: 492 visitas en 90 días con solo un 4 % de tráfico de aula, así que
 * es demanda difusa, y la app no tenía tarea dentro. La química vive ahora en dos módulos sin
 * React:
 *   app/simulador-titulacion/motor.ts   ← calcularPH (MOVIDA de page.tsx, no replicada) y V_eq
 *   app/simulador-titulacion/casos.ts   ← los 12 casos, el corrector y el aleatorio
 * Las cifras del acta de arriba (1,48 · 2,88 · 4,76 · 8,73 · 12,52) siguen pasando con el motor
 * movido: el traslado no cambió un número.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO — a mano, en mmol y mL (mmol = M·mL):
 *   1 · HCl 0,15 M 20 mL, NaOH 0,10 M     → V_eq = 0,15·20/0,10                     = 30,00 mL
 *   2 · acético 0,80 M 10 mL, NaOH 0,50 M → V_eq = 0,80·10/0,50 (el pKa no entra)   = 16,00 mL
 *   3 · 25 mL, NaOH 0,10 M, V_eq 20,00 mL → C = 0,10·20/25                          = 0,08 M
 *   4 · 10 mL, NaOH 0,20 M, V_eq 42,50 mL → C = 0,20·42,5/10                        = 0,85 M
 *   5 · HCl 2,5 mmol − NaOH 1,5 mmol = 1,0 mmol en 40 mL → [H⁺] 0,025 → pH 1,602  → 1,60
 *   6 · NaOH 1,5 − HCl 1,0 = 0,5 mmol en 25 mL → [OH⁻] 0,02 → pOH 1,699          → 12,30
 *   7 · acético 0,10 M, pKa 4,76, V = 0 → ½(pKa − log C) = ½(4,76 + 1) = 2,88
 *   8 · pKa 4,2, V = 12,5 de V_eq 25 → semiequivalencia, pH = pKa                  → 4,20
 *   9 · pKa 4,8: HA 2,0 − 1,5 = 0,5 mmol, A⁻ 1,5 mmol → 4,8 + log 3 = 5,277         → 5,28
 *  10 · acético 0,20 M 20 mL, NaOH 0,20 M, V = 20: sal 4 mmol en 40 mL = 0,1 M
 *                                        → 7 + ½(4,8 + log 0,1) = 7 + ½·3,8         = 8,90
 *  11 · HCl 0,20 M 20 mL, NH₃ 0,20 M, pKb 4,7, V = 20: sal 0,1 M
 *                                        → 7 − ½(4,7 + log 0,1) = 7 − ½·3,7         = 5,15
 *  12 · HCl 0,10 M 20 mL, NH₃ 0,10 M, V = 40: NH₄⁺ 2 mmol, NH₃ 4 − 2 = 2 mmol
 *                                        → pOH = pKb + log 1 = 4,7 → pH             = 9,30
 *
 * El CONVENIO de esta app: la zona tampón de ácido débil no es Henderson-Hasselbalch sino la
 * cuadrática exacta (hallazgo 343). Los casos 7, 8 y 9 se eligieron donde las dos coinciden a
 * dos decimales, para que el alumno que use la fórmula de su libro no suspenda; el aleatorio
 * descarta todo lo que no cumpla eso, y la invariante 6 lo vigila.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS as TOTAL_CASOS_AULA,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
} from '../../app/simulador-titulacion/casos';
import { calcularPH, volumenEquivalencia } from '../../app/simulador-titulacion/motor';

const A_MANO_AULA: Readonly<Record<number, number>> = {
  1: 30,
  2: 16,
  3: 0.08,
  4: 0.85,
  5: 1.6,
  6: 12.3,
  7: 2.88,
  8: 4.2,
  9: 5.28,
  10: 8.9,
  11: 5.15,
  12: 9.3,
};

/** Redondeo a los decimales que pide el caso (2 salvo que declare otros). */
const redondear = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («8,90» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/-?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

/** Múltiplo exacto de un paso, con la holgura del binario. */
const multiploDe = (v: number, paso: number) => Math.abs(v / paso - Math.round(v / paso)) < 1e-6;

test.describe('simulador-titulacion · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS_AULA).toBe(12);
    expect(CASOS_AULA.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS_AULA) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS_AULA) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondear(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, desarrollo y pista', async () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(caso.unidad);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS_AULA) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS_AULA) {
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(2);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(
        caso.respuestaTexto,
      );
      if (caso.requiereRedondeo) {
        expect(caso.enunciado, `caso ${caso.id}: exige redondeo y no lo pide`).toMatch(/redonde/i);
      } else {
        expect(Math.abs(resolverCaso(caso.datos).valor - caso.respuesta), `caso ${caso.id}`).toBeLessThan(1e-9);
      }
    }
  });

  test('5.ter · cada caso se puede montar con los controles de la app', async () => {
    // Deslizadores: V_analito entero 10-100, concentraciones de 0,01 en 0,01, pK de 0,1 en 0,1;
    // la bureta solo avanza con «+ 1 mL» y «+ Gota (0,1 mL)». Un caso que la app no puede
    // reproducir no se puede comprobar en ella. El pKa 4,76 del caso 7 es la excepción
    // declarada: no está en la rejilla del deslizador, pero es el valor con el que ARRANCA la app.
    for (const caso of CASOS_AULA) {
      const d = caso.datos;
      expect(Number.isInteger(d.V_analito) && d.V_analito >= 10 && d.V_analito <= 100, `caso ${caso.id}`).toBe(true);
      expect(multiploDe(d.C_titulante, 0.01), `caso ${caso.id}`).toBe(true);
      if (d.C_analito !== undefined) expect(multiploDe(d.C_analito, 0.01), `caso ${caso.id}`).toBe(true);
      if (d.V_titulante !== undefined) expect(multiploDe(d.V_titulante, 0.1), `caso ${caso.id}`).toBe(true);
      for (const pk of [d.pKa, d.pKb]) {
        if (pk === undefined || pk === 4.76) continue;
        expect(multiploDe(pk, 0.1) && pk >= 1 && pk <= 12, `caso ${caso.id}: pK ${pk}`).toBe(true);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado, alcanzable y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 200 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.slice(0, 40).map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.slice(0, 40).map((m) => m.datos.pregunta)).size).toBeGreaterThanOrEqual(2);
    for (const m of muestras) {
      const d = m.datos;
      expect(Number.isFinite(m.respuesta), `semilla ${m.semilla}`).toBe(true);
      expect(redondear(resolverCaso(d).valor, d.decimales ?? 2), `semilla ${m.semilla}`).toBe(m.respuesta);
      if (d.V_titulante !== undefined) expect(multiploDe(d.V_titulante, 0.1), `semilla ${m.semilla}`).toBe(true);

      // En la zona tampón de ácido débil, la cuadrática de la app y Henderson-Hasselbalch deben
      // dar la MISMA cifra: el aleatorio no puede suspender a quien usa la fórmula del libro.
      if (d.pregunta === 'pH' && d.tipo === 'ad-bf' && d.C_analito !== undefined && d.pKa !== undefined) {
        const V = d.V_titulante ?? 0;
        const Veq = volumenEquivalencia(d.C_analito, d.V_analito, d.C_titulante);
        if (V > 0 && V < Veq - 1e-9) {
          const nA = d.C_titulante * V;
          const nHA = d.C_analito * d.V_analito - nA;
          expect(redondear(d.pKa + Math.log10(nA / nHA)), `semilla ${m.semilla}: H-H`).toBe(m.respuesta);
        }
      }
    }
  });

  test('7 · el convenio queda fijado a mano', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS_AULA) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }
    // (b) Fuerte con fuerte: la equivalencia es 7 exacto…
    expect(calcularPH('af-bf', 25, 25, 0.1, 0.1, 4.76, 4.74)).toBe(7);
    // …débil con fuerte NO: 8,90 en el caso 10. Tratar el ácido débil como fuerte daría 7.
    expect(calcularPH('ad-bf', 20, 20, 0.2, 0.2, 4.8, 4.7)).toBeCloseTo(8.9, 10);
    // (c) Semiequivalencia = pKa (a 2 decimales, que es lo que se pide).
    expect(redondear(calcularPH('ad-bf', 12.5, 25, 0.1, 0.1, 4.2, 4.7))).toBe(4.2);
    // (d) El motor movido da las cifras del acta: 1,4771 a media valoración y 2,8829 inicial.
    expect(calcularPH('af-bf', 12.5, 25, 0.1, 0.1, 4.76, 4.74)).toBeCloseTo(1.4771, 4);
    expect(calcularPH('ad-bf', 0, 25, 0.1, 0.1, 4.76, 4.74)).toBeCloseTo(2.8829, 4);
    expect(volumenEquivalencia(0.15, 20, 0.1)).toBeCloseTo(30, 10);
    // (e) La tolerancia del pH es ABSOLUTA: el 1 % relativo aceptaría 12,40 por 12,52, que es
    // un 32 % de error en [OH⁻].
    expect(toleranciaDe(12.52, 'pH')).toBe(0.02);
    expect(comprobarRespuesta(12.4, 12.52, 'pH').correcto).toBe(false);
    expect(comprobarRespuesta(12.53, 12.52, 'pH').correcto).toBe(true);
  });

  test('8 · corregir no lanza nunca y nombra los dos errores típicos', async () => {
    expect(comprobarRespuesta(NaN, 8.9, 'pH').correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 8.9, 'pH').motivo).toContain('número');
    // Contestar 7 en una equivalencia que no es neutra.
    const siete = comprobarRespuesta(7, 8.9, 'pH');
    expect(siete.correcto).toBe(false);
    expect(siete.motivo).toContain('ácido fuerte con una base fuerte');
    // El volumen en litros en vez de mililitros.
    const litros = comprobarRespuesta(0.03, 30, 'volumen');
    expect(litros.correcto).toBe(false);
    expect(litros.motivo).toContain('mililitros');
    // Datos imposibles: sin excepción, con error legible.
    const malo = resolverCaso({
      pregunta: 'volumen-equivalencia',
      tipo: 'af-bf',
      V_analito: 20,
      C_analito: 0.1,
      C_titulante: 0,
    });
    expect(malo.ok).toBe(false);
    expect(Number.isNaN(malo.valor)).toBe(true);
  });
});

test.describe('simulador-titulacion · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  // El beforeEach global solo espera al <h1>, que es HTML servido: un clic en la botonera de
  // casos antes de que React hidrate se pierde en silencio.
  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#vAnalito', '#casos-respuesta']);
  });

  test('el caso 10 se monta en el simulador y el panel da el pH que corrige la casilla', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 10:/ }).click();
    await seccion(page).getByRole('button', { name: 'Cargar en el simulador' }).click();
    // Acético 0,20 M 20 mL con NaOH 0,20 M: V_eq = 20 mL y pH en la equivalencia 8,90.
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('20,00 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('8,90');

    await seccion(page).locator('#casos-respuesta').fill('8,90');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
  });

  test('contestar 7 en una equivalencia básica se nombra como tal', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 10:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('7');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('ácido fuerte con una base fuerte');
  });
});

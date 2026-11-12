import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';

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
    // Hasta el 30/09/2026 esto exigía 8,9 con 10 decimales, que es la fórmula 7 + ½(pKa + log C)
    // al pie de la letra. Desde que el motor resuelve el balance de cargas con Kw (hallazgos
    // 2512-2515), el acetato 0,1 M da [OH⁻]² = Kb·(C − [OH⁻]) + Kw = 6,3101·10⁻¹¹ ⇒ 8,900017: la
    // fórmula queda a 2·10⁻⁵, y lo que el fondo del test protege —que NO sea 7— sigue igual.
    expect(calcularPH('ad-bf', 20, 20, 0.2, 0.2, 4.8, 4.7)).toBeCloseTo(8.9, 4);
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

  test('C0267 · con los datos, un volumen o una concentración exactos no tienen margen; el pH conserva sus 0,02', async () => {
    // Cabo C0267 (reparar 03/11/2026), la forma del hallazgo 3342. A mano:
    //   caso 1 · V_eq = 0,15·20/0,1 = 30 mL exactos    → 29,7 (dentro del 1 %) no es redondeo de nada
    //   caso 2 · V_eq = 0,80·10/0,5 = 16 mL exactos    → 15,85 tampoco
    //   caso 4 · C = 0,20·42,50/10 = 0,85 mol/L exacta → 0,851 tampoco
    //   caso 5 · pH = −log(1/40) = 1,6021               → 1,61 sigue valiendo (0,02 absoluto)
    const caso = (id: number) => CASOS_AULA.find((c) => c.id === id)!;
    const corrige = (usuario: number, id: number) =>
      comprobarRespuesta(usuario, caso(id).respuesta, caso(id).magnitud, caso(id).datos).correcto;
    expect(corrige(30, 1)).toBe(true);
    expect(corrige(29.7, 1)).toBe(false);
    expect(corrige(16, 2)).toBe(true);
    expect(corrige(15.85, 2)).toBe(false);
    expect(corrige(0.85, 4)).toBe(true);
    expect(corrige(0.851, 4)).toBe(false);
    expect(corrige(1.61, 5)).toBe(true);
    // Los dos avisos típicos siguen con margen 0.
    expect(comprobarRespuesta(0.03, 30, 'volumen', caso(1).datos).motivo).toContain('mililitros');
    expect(comprobarRespuesta(30.004, 30, 'volumen', caso(1).datos).motivo).not.toMatch(/desviado 0 /);
    // La clave aprueba en los 12 casos y en 500 prácticas.
    for (const c of CASOS_AULA) {
      expect(comprobarRespuesta(c.respuesta, c.respuesta, c.magnitud, c.datos).correcto, `caso ${c.id}`).toBe(true);
    }
    for (let s = 1; s <= 500; s += 1) {
      const e = generarEjercicioAleatorio(s);
      expect(comprobarRespuesta(e.respuesta, e.respuesta, e.magnitud, e.datos).correcto, `semilla ${s}`).toBe(true);
    }
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 30/09/2026 — RE-INSPECCIÓN COMPLETA (la app volvió a la cola INVALIDADA)
 *
 * Qué cambió desde el 25/08: a05247af movió `calcularPH` a `motor.ts` (la cabecera de arriba
 * que dice «page.tsx» es de antes del traslado) y añadió los 12 casos para clase, que nunca se
 * habían inspeccionado; b7733c6d, 586a4d61, 3de36a1f y a1d72a9c tocaron cabeceras de tabla y
 * el logo fijo que tapaba el <h1>. La base no tiene hallazgos abiertos de esta app.
 *
 * CÓMO SALEN LOS ESPERADOS — resueltos ANTES de abrir la app, con un balance de cargas completo
 * y Kw = 1,0·10⁻¹⁴ ([H⁺] + [Na⁺ o BH⁺] = [A⁻ o Cl⁻] + [OH⁻], resuelto en pH), escrito aparte y
 * sin importar nada de app/. Donde coincide con las fórmulas de libro se dice.
 *
 *   A · AF+BF de fábrica (HCl 0,1 M 25 mL, NaOH 0,1 M, V_eq = 25,00 mL, 2,5 mmol de ácido)
 *     24,90 mL  quedan 0,01 mmol de H⁺ en 49,9 mL → [H⁺] 2,004·10⁻⁴        → pH 3,6981 → 3,70
 *     25,10 mL  sobran 0,01 mmol de OH⁻ en 50,1 mL → pOH 3,6998            → pH 10,3002 → 10,30
 *     40,00 mL  sobran 1,5 mmol de OH⁻ en 65 mL → [OH⁻] 0,023077 → pOH 1,6368 → pH 12,3632 → 12,36
 *     % completado: 24,9/25 = 99,6 % · 25,1/25 = 100,4 % · 40/25 = 160,0 %
 *   B · AD+BF en los extremos de concentración que admiten los deslizadores (pKa 4,76)
 *     0,01 M / 0,01 M  V = 0: x² + Ka·x − Ka·C = 0 → 4,0827·10⁻⁴ → pH 3,3891 → 3,39 (la ½(pKa − log C)
 *                      daría 3,38: con C tan baja ya no es exacta, y la app usa la cuadrática)
 *                      semiequivalencia 12,5 mL → 4,7645 → 4,76 · equivalencia C_sal 0,005 M →
 *                      7 + ½(4,76 + log 0,005) = 8,2295 (con Kw: 8,2302) → 8,23
 *     1 M / 1 M        V = 0 → 2,3809 → 2,38 · equivalencia C_sal 0,5 M → 7 + ½(4,76 − 0,30103) = 9,2295 → 9,23
 *   C · Casos para clase, uno de cada tipo (resueltos antes de mirar la solución de la app)
 *     caso 1 (V_eq)            20 mL · 0,15 M = 3 mmol → 3/0,10 = 30,00 mL · tolerancia máx(0,01; 1 %) = 0,3 mL
 *                              «0,03» es la misma cifra en LITROS → el aviso de unidades
 *     caso 3 (concentración)   0,10 M · 20 mL = 2 mmol → 2/25 = 0,08 mol/L · tolerancia 0,0008
 *                              «0,125» es el error típico de invertir el cociente (0,10·25/20)
 *     caso 10 (pH, AD+BF eq.)  4 mmol de acetato en 40 mL = 0,1 M, Kb = 10⁻⁹·² → [OH⁻] 7,943·10⁻⁶
 *                              → pH 8,90 · la pregunta dice ±0,02: 8,88 y 8,92 valen, 8,87 y 8,93 no;
 *                              contestar 7 es el error típico y se nombra
 *     caso 11 (AF+BD eq.)      NH₄Cl 0,1 M, Ka = 10⁻⁹·³ → [H⁺] 7,079·10⁻⁶ → 5,15
 *     caso 12 (AF+BD 2·V_eq)   2 mmol NH₄⁺ y 2 mmol NH₃ → pOH = pKb = 4,7 → 9,30 (balance: 9,2995)
 *     caso 8 (semiequivalencia) pKa 4,2 → cuadrática 4,2016 → 4,20
 *
 * HALLAZGOS del 30/09/2026, REPARADOS ese mismo día (sin `test.fail()`: regresión), con su
 * esperado a mano. H1-H4 (2512-2515) se cerraron cambiando el motor entero por el balance de
 * cargas exacto (cabecera de `motor.ts`); H5 (2516), con el criterio de la FAQ; H6 (2517), U+00A0:
 *   H1 calculo/medio  AD+BD de fábrica: una gota pasada la equivalencia BAJABA el pH, 7,01 → 6,86.
 *                     A mano 7,01 → 7,16. El motor aplicaba pOH = pKb + log(n(BH⁺)/n(B)) con
 *                     n(B) = 0,01 mmol frente a 2,5 de NH₄⁺, e ignoraba el acetato, que amortigua.
 *   H2 calculo/medio  AF+BD con pKb alto: la Henderson-Hasselbalch del lado de la base era el
 *                     espejo exacto del hallazgo 343. pKb 9,4 (anilina): 3,70 → 2,95 → 2,20 en
 *                     24,90 / 25,00 / 25,10 mL, a mano 2,92 → 2,96 → 2,99. Con pKb 12, a
 *                     25,10 mL el panel daba pH −0,40 (a mano 1,75): por debajo del HCl de partida.
 *   H3 calculo/bajo   AD+BF con pKa alto: tras la equivalencia se despreciaba el OH⁻ del anión.
 *                     pKa 9,2 (HCN): 10,95 → 10,30 al añadir una gota; a mano 10,95 → 10,99.
 *   H4 calculo/bajo   La fórmula de hidrólisis sin Kw cruzaba el 7 con pK bajos: AD+BF pKa 1 daba
 *                     6,85 en la equivalencia (a mano 7,09) y AF+BD pKb 1 daba 7,15 (a mano 6,91).
 *   H5 contenido/medio En el estado de fábrica (HCl + NaOH con fenolftaleína) la app decía que la
 *                     fenolftaleína «no sirve para esta valoración». Una gota a cada lado de
 *                     V_eq lleva el pH de 4,00 a 10,00, y la fenolftaleína empieza a virar a
 *                     25,0008 mL (0,003 % de error). Su propia FAQ dice que en AF+BF «casi
 *                     cualquier indicador funciona», y su propio matraz vira a 25,10 mL.
 *   H6 contenido/bajo «% completado» separaba el % con un espacio normal, no con U+00A0.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import { sembrarValor } from './_hidratacion';
import { parseSpanishNumber } from '../../lib/formatters';

const casosAula = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

/** El pH del panel como número (para las comparaciones de orden y de cercanía). */
async function phEnPanel(page: Page): Promise<number> {
  return parseSpanishNumber(await valorDe(page, 'pH actual').innerText());
}

/**
 * Escribe la respuesta TECLA A TECLA, comprueba que el campo conserva lo tecleado (en otra app
 * de la tanda un «14.» intermedio se borraba y `fill()` no lo veía) y pulsa «Comprobar».
 */
async function responder(page: Page, texto: string, tocar = false): Promise<string> {
  const campo = casosAula(page).locator('#casos-respuesta');
  await campo.fill('');
  await expect(casosAula(page).getByRole('alert')).toHaveCount(0);
  if (texto) await campo.pressSequentially(texto);
  await expect(campo).toHaveValue(texto);
  const boton = casosAula(page).getByRole('button', { name: 'Comprobar' });
  if (tocar) await boton.tap();
  else await boton.click();
  const alerta = casosAula(page).getByRole('alert');
  await expect(alerta).toHaveCount(1);
  return alerta.innerText();
}

test.describe('Inspector 30/09/2026 · escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#vAnalito', '#casos-respuesta']);
  });

  test('A · AF+BF alrededor de la equivalencia: 3,70 → 7,00 → 10,30, y 12,36 a 40 mL', async ({ page }) => {
    // 24,90 mL: 0,01 mmol de H⁺ en 49,9 mL ⇒ pH 3,6981
    await verter(page, 24.9);
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('24,90 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('3,70');
    await expect(valorDe(page, '% completado')).toHaveText('99,6 %');
    await expect(valorDe(page, 'Fase')).toHaveText('Salto de equivalencia (antes del punto)');

    // Una gota pasada la equivalencia: 0,01 mmol de OH⁻ en 50,1 mL ⇒ pH 10,3002
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'pH actual')).toHaveText('7,00');
    await gota(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,10 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('10,30');
    await expect(valorDe(page, '% completado')).toHaveText('100,4 %');
    await expect(valorDe(page, 'Fase')).toHaveText('Salto de equivalencia (pasado el punto)');
    // 10,30 > 10,0: la fenolftaleína ya está rosa del todo una gota después de V_eq.
    await expect(colorMatraz(page)).toHaveText('rosa fucsia');

    // 40,00 mL: 1,5 mmol de OH⁻ en 65 mL ⇒ pOH 1,6368 ⇒ pH 12,3632
    await verter(page, 40);
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('40,00 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('12,36');
    await expect(valorDe(page, '% completado')).toHaveText('160,0 %');
    await expect(valorDe(page, 'Fase')).toHaveText('Exceso de titulante');
  });

  test('B · AD+BF en los extremos de concentración: 0,01 M (3,39 · 4,76 · 8,23) y 1 M (2,38 · 9,23)', async ({ page }) => {
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();

    await sembrarValor(page, '#cAnalito', 0.01);
    await sembrarValor(page, '#cTitulante', 0.01);
    await expect(valorDe(page, 'Volumen de equivalencia (V_eq)')).toHaveText('25,00 mL');
    // Cuadrática x² + Ka·x − Ka·C = 0 con C = 0,01 ⇒ pH 3,3891 (la ½(pKa − log C) daría 3,38)
    await expect(valorDe(page, 'pH actual')).toHaveText('3,39');
    // Semiequivalencia ⇒ 4,7645
    await verter(page, 12.5);
    await expect(valorDe(page, 'pH actual')).toHaveText('4,76');
    // Acetato 0,005 M ⇒ 7 + ½(4,76 + log 0,005) = 8,2295
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'pH actual')).toHaveText('8,23');

    await sembrarValor(page, '#cAnalito', 1);
    await sembrarValor(page, '#cTitulante', 1);
    // Cambiar un deslizador vacía la bureta: V = 0, ácido 1 M ⇒ pH 2,3809
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('0,00 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('2,38');
    // Acetato 0,5 M ⇒ 7 + ½(4,76 − 0,30103) = 9,2295
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'pH actual')).toHaveText('9,23');
  });

  test('C · el corrector acepta lo correcto, nombra los errores típicos y rechaza lo que no es número', async ({ page }) => {
    // Caso 1, V_eq = 30,00 mL (20 mL · 0,15 M / 0,10 M), tolerancia 0,3 mL.
    await casosAula(page).getByRole('button', { name: /^Caso 1:/ }).click();
    expect(await responder(page, '30')).toContain('Correcto');
    expect(await responder(page, '0,03')).toContain('en litros');
    // «1.500» con punto de millar es 1500: 1470 mL de desvío, no se da por bueno.
    expect(await responder(page, '1.500')).toContain('No es correcto');
    expect(await responder(page, '')).toContain('Escribe un número');

    // Caso 3, C = 0,10 · 20 / 25 = 0,08 mol/L; «0,125» es invertir el cociente.
    await casosAula(page).getByRole('button', { name: /^Caso 3:/ }).click();
    expect(await responder(page, '0,08')).toContain('Correcto');
    expect(await responder(page, '0,125')).toContain('No es correcto');

    // Caso 10, pH 8,90 con ±0,02 (lo dice la introducción de la sección).
    await casosAula(page).getByRole('button', { name: /^Caso 10:/ }).click();
    expect(await responder(page, '8,92')).toContain('Correcto');
    expect(await responder(page, '8,88')).toContain('Correcto');
    expect(await responder(page, '8,93')).toContain('No es correcto');
    expect(await responder(page, '8,87')).toContain('No es correcto');
    expect(await responder(page, '7')).toContain('ácido fuerte con una base fuerte');
  });

  test('C bis · «Cargar en el simulador» deja en el panel el pH que pide cada caso', async ({ page }) => {
    const cargar = async (n: number) => {
      await casosAula(page).getByRole('button', { name: new RegExp(`^Caso ${n}:`) }).click();
      await casosAula(page).getByRole('button', { name: 'Cargar en el simulador' }).click();
    };
    // Caso 11: NH₄Cl 0,1 M con pKb 4,7 ⇒ 7 − ½(4,7 − 1) = 5,15
    await cargar(11);
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('20,00 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('5,15');
    // Caso 12: 40 mL, el tope de la bureta; NH₄⁺ = NH₃ = 2 mmol ⇒ pH 14 − 4,7 = 9,30
    await cargar(12);
    await verter(page, 40);
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('40,00 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('9,30');
    // Caso 8: 12 × «+ 1 mL» y 5 × «+ Gota», como dice el enunciado ⇒ pKa 4,2 (cuadrática 4,2016)
    await cargar(8);
    await verter(page, 12.5);
    await expect(valorDe(page, 'pH actual')).toHaveText('4,20');
  });

  // ─────────── HALLAZGOS del 30/09/2026 · REPARADOS ese mismo día (regresión) ───────────

  test('H1 · calculo/medio — AD+BD de fábrica: una gota pasada la equivalencia no puede bajar el pH', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2512): la app daba 6,86 tras 7,01; el motor resuelve ahora el balance de cargas.
    await page.getByRole('button', { name: /Ácido débil \+ Base débil/ }).click();
    // Acetato de amonio 0,05 M: ½(pKa + 14 − pKb) = ½(4,76 + 14 − 4,74) = 7,01.
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'pH actual')).toHaveText('7,01');
    // 25,10 mL: 0,01 mmol de NH₃ libre. Balance de cargas con el acetato ⇒ pH 7,1619.
    // El motor aplica pKb + log(2,5/0,01) y da 6,86. Precisión 1 (±0,05): el defecto es de 0,30.
    await gota(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,10 mL');
    const ph = await phEnPanel(page);
    expect(ph).toBeGreaterThan(7.01);
    expect(ph).toBeCloseTo(7.16, 1);
  });

  test('H2 · calculo/medio — AF+BD con anilina (pKb 9,4): el pH no puede caer al cruzar la equivalencia', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2513): la app daba 3,70 → 2,95 → 2,20.
    await page.getByRole('button', { name: /Ácido fuerte \+ Base débil/ }).click();
    await sembrarValor(page, '#pKb', 9.4);
    // Balance de cargas con Ka(BH⁺) = 10⁻⁴·⁶: 24,90 mL → 2,9162 · 25,00 → 2,9554 · 25,10 → 2,9945.
    // Precisión 1 (±0,05): los defectos son de 0,78 y 0,79 unidades.
    await verter(page, 24.9);
    const antes = await phEnPanel(page);
    await irAEquivalencia(page).click();
    const en = await phEnPanel(page);
    await gota(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,10 mL');
    const despues = await phEnPanel(page);
    expect(en).toBeCloseTo(2.96, 1);
    expect(antes).toBeCloseTo(2.92, 1);
    expect(despues).toBeCloseTo(2.99, 1);
    expect(despues).toBeGreaterThanOrEqual(en);
  });

  test('H2 bis · calculo/medio — AF+BD con pKb 12: añadir base no puede dar un pH negativo', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2513): la app daba pH −0,40 a 25,10 mL; ahora 1,75.
    await page.getByRole('button', { name: /Ácido fuerte \+ Base débil/ }).click();
    await sembrarValor(page, '#pKb', 12);
    await expect(valorDe(page, 'pH actual')).toHaveText('1,00'); // HCl 0,1 M de partida
    await irAEquivalencia(page).click();
    await gota(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,10 mL');
    // Ka(BH⁺) = 10⁻², la base apenas neutraliza: balance de cargas ⇒ pH 1,7493. Lo mínimo que
    // no admite discusión: por encima del HCl de partida. La app, pKb + log(2,5/0,01) ⇒ −0,40.
    expect(await phEnPanel(page)).toBeGreaterThanOrEqual(1.0);
  });

  test('H3 · calculo/bajo — AD+BF con pKa 9,2 (HCN): una gota pasada la equivalencia no baja el pH', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2514): la app daba 10,95 → 10,30.
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
    await sembrarValor(page, '#pKa', 9.2);
    // Cianuro 0,05 M, Kb = 10⁻⁴·⁸ ⇒ 10,9456 (7 + ½(9,2 − 1,301) = 10,9495, la fórmula vale aquí)
    await irAEquivalencia(page).click();
    await expect(valorDe(page, 'pH actual')).toHaveText('10,95');
    // 25,10 mL: 1,996·10⁻⁴ M de OH⁻ sobrante MÁS la hidrólisis del CN⁻ (7,95·10⁻⁴ M) ⇒ 10,9946.
    // El motor desprecia el anión y da 10,30. Precisión 1 (±0,05): el defecto es de 0,69.
    await gota(page).click();
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('25,10 mL');
    expect(await phEnPanel(page)).toBeCloseTo(10.99, 1);
  });

  test('H4 · calculo/bajo — AD+BF con pKa 1: la sal de un ácido débil no da una equivalencia ácida', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2515): la app daba 6,85, sin Kw.
    await page.getByRole('button', { name: /Ácido débil \+ Base fuerte/ }).click();
    await sembrarValor(page, '#pKa', 1);
    await irAEquivalencia(page).click();
    // [OH⁻]² = Kb·C + Kw = 10⁻¹³·0,05 + 10⁻¹⁴ ⇒ pH 7,0880. Sin Kw, 7 + ½(1 − 1,301) = 6,85.
    // Precisión 1 (±0,05): el defecto es de 0,24.
    expect(await phEnPanel(page)).toBeCloseTo(7.09, 1);
  });

  test('H4 bis · calculo/bajo — AF+BD con pKb 1: la sal de una base débil no da una equivalencia básica', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2515): la app daba 7,15, sin Kw.
    await page.getByRole('button', { name: /Ácido fuerte \+ Base débil/ }).click();
    await sembrarValor(page, '#pKb', 1);
    await irAEquivalencia(page).click();
    // [H⁺]² = Ka(BH⁺)·C + Kw ⇒ pH 6,9120. Sin Kw, 7 − ½(1 − 1,301) = 7,15.
    expect(await phEnPanel(page)).toBeCloseTo(6.91, 1);
  });

  test('H5 · contenido/medio — la fenolftaleína sirve para HCl + NaOH 0,1 M, que es el estado de fábrica', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2516): la app decía «Este indicador no sirve». El criterio es
    // ahora el de su FAQ, todo el viraje dentro del salto (98-102 % de V_eq), y aquí vira entre
    // 25,0008 y 25,05 mL.
    // Salto de una gota a cada lado de V_eq: 24,95 mL → pH 4,00 · 25,05 mL → pH 10,00. El pH 8,2
    // se alcanza a 25,0008 mL (0,003 % de V_eq). La FAQ: «Si la curva tiene salto entre pH 4 y
    // 10 (AF+BF), casi cualquier indicador funciona». El propio matraz vira a 25,10 mL (test A).
    await expect(page.getByRole('button', { name: /Fenolftaleína/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[class*="indicatorAviso"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Fenolftaleína/ })).toContainText('apto aquí');
  });

  test('H6 · contenido/bajo — «% completado» separa el % con espacio duro (U+00A0)', async ({ page }) => {
    // REPARADO el 30/09/2026 (hallazgo 2517): decía «0,0 %» con U+0020.
    // Regla de formato del proyecto desde el 25/09/2026 (RAE 2010): «15 %», con U+00A0.
    const texto = await valorDe(page, '% completado').evaluate((e) => e.textContent ?? '');
    expect(texto).toMatch(/\d %$/);
  });
});

test.describe('Inspector 30/09/2026 · móvil 390×844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#vAnalito', '#casos-respuesta']);
  });

  test('el logo fijo no tapa el <h1> y la página no desborda en horizontal', async ({ page }) => {
    const geo = await page.evaluate(() => {
      const caja = (e: Element) => e.getBoundingClientRect();
      const h1 = caja(document.querySelector('h1')!);
      const piezas = Array.from(document.querySelectorAll('[class*="headerBar"] a, [class*="headerBar"] button')).map(caja);
      const solapa = piezas.some((p) => !(p.right <= h1.left || p.left >= h1.right || p.bottom <= h1.top || p.top >= h1.bottom));
      return { solapa, piezas: piezas.length, ancho: document.documentElement.scrollWidth };
    });
    expect(geo.piezas).toBeGreaterThan(0);
    expect(geo.solapa).toBe(false);
    expect(geo.ancho).toBeLessThanOrEqual(390);
  });

  test('caso 10 con el dedo: se carga, se lleva a la equivalencia y 8,92 tecleado se da por bueno', async ({ page }) => {
    await casosAula(page).getByRole('button', { name: /^Caso 10:/ }).tap();
    await casosAula(page).getByRole('button', { name: 'Cargar en el simulador' }).tap();
    await irAEquivalencia(page).tap();
    // Acetato 0,1 M con pKa 4,8 ⇒ 7 + ½(4,8 − 1) = 8,90
    await expect(valorDe(page, 'Volumen añadido')).toHaveText('20,00 mL');
    await expect(valorDe(page, 'pH actual')).toHaveText('8,90');
    expect(await responder(page, '8,92', true)).toContain('Correcto');
    expect(await responder(page, '8,93', true)).toContain('No es correcto');

    // Caso 1 en litros: el aviso de unidades también llega en móvil.
    await casosAula(page).getByRole('button', { name: /^Caso 1:/ }).tap();
    expect(await responder(page, '0,03', true)).toContain('en litros');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * TESTIGOS DEL MOTOR (30/09/2026) — tras la reparación de 2512-2515, que cambió las fórmulas por
 * tramos por UN balance de cargas con Kw.
 *
 * Los cuatro hallazgos tenían la misma forma: una costura entre dos fórmulas donde la curva
 * BAJABA al añadir base. Buscarlos caso a caso es lo que dejó pasar tres de ellos después del
 * 343, así que el testigo es la propiedad, no los casos: la curva de un ácido valorado con una
 * base es MONÓTONA CRECIENTE, en los cuatro tipos y en todo el rango de los deslizadores.
 *
 * Y los puntos fijos, resueltos a mano ANTES de ejecutar (acético 0,1 M 25 mL, NaOH 0,1 M):
 *   V = 0     [H⁺]² + Ka[H⁺] − Ka·C = 0, Ka = 1,7378·10⁻⁵ ⇒ [H⁺] = 1,3096·10⁻³  ⇒ 2,8829
 *   V = 12,5  semiequivalencia: el balance da [H⁺] ≈ Ka·(C_HA − [H⁺])/(C_A + [H⁺]) ⇒ 4,7605
 *   V = 25    acetato 0,05 M: [OH⁻]² ≈ Kb·C + Kw = 5,7544·10⁻¹⁰·0,05 + 10⁻¹⁴ ⇒ pOH 5,2705 ⇒ 8,7295
 *   HCl + NaOH en la equivalencia: [H⁺] = [OH⁻] = 10⁻⁷ ⇒ 7 exacto
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('simulador-titulacion · testigos del motor', () => {
  test('puntos resueltos a mano: acético 2,88 · 4,76 · 8,73, y 7 exacto en fuerte con fuerte', async () => {
    expect(calcularPH('ad-bf', 0, 25, 0.1, 0.1, 4.76, NaN)).toBeCloseTo(2.8829, 3);
    expect(calcularPH('ad-bf', 12.5, 25, 0.1, 0.1, 4.76, NaN)).toBeCloseTo(4.7605, 3);
    expect(calcularPH('ad-bf', 25, 25, 0.1, 0.1, 4.76, NaN)).toBeCloseTo(8.7295, 3);
    expect(calcularPH('af-bf', 25, 25, 0.1, 0.1, NaN, NaN)).toBe(7);
    // Los esperados del acta, cada uno en el MOTOR (los mismos que H1-H4 miran en pantalla).
    expect(calcularPH('ad-bd', 25.1, 25, 0.1, 0.1, 4.76, 4.74)).toBeCloseTo(7.1619, 3);
    expect(calcularPH('af-bd', 25.1, 25, 0.1, 0.1, NaN, 12)).toBeCloseTo(1.7493, 3);
    expect(calcularPH('ad-bf', 25.1, 25, 0.1, 0.1, 9.2, NaN)).toBeCloseTo(10.9946, 3);
    expect(calcularPH('ad-bf', 25, 25, 0.1, 0.1, 1, NaN)).toBeCloseTo(7.088, 3);
    expect(calcularPH('af-bd', 25, 25, 0.1, 0.1, NaN, 1)).toBeCloseTo(6.912, 3);
  });

  test('la curva es monótona creciente en los cuatro tipos, con cualquier pK y concentración', async () => {
    const tipos = ['af-bf', 'ad-bf', 'af-bd', 'ad-bd'] as const;
    const pks = [1, 2.5, 4.76, 7, 9.4, 12];
    // Los extremos de los deslizadores (0,01 y 1 M) cruzados, y el caso de fábrica.
    const concentraciones: ReadonlyArray<readonly [number, number]> = [
      [0.1, 0.1],
      [0.01, 1],
      [1, 0.01],
      [0.01, 0.01],
      [1, 1],
    ];
    const bajadas: string[] = [];
    for (const tipo of tipos) {
      for (const pKa of pks) {
        for (const pKb of pks) {
          for (const [Ca, Ct] of concentraciones) {
            const Veq = volumenEquivalencia(Ca, 25, Ct);
            let anterior = -Infinity;
            // 401 puntos de 0 a 2·V_eq (la curva de la app usa 201) y la gota a cada lado de V_eq.
            const volumenes = Array.from({ length: 401 }, (_, i) => (i / 400) * 2 * Veq);
            volumenes.push(Veq - 0.1, Veq, Veq + 0.1);
            volumenes.sort((a, b) => a - b);
            for (const v of volumenes.filter((x) => x >= 0)) {
              const ph = calcularPH(tipo, v, 25, Ca, Ct, pKa, pKb);
              if (!Number.isFinite(ph)) bajadas.push(`${tipo} pKa ${pKa} pKb ${pKb} ${Ca}/${Ct} M: pH no finito a ${v} mL`);
              else if (ph < anterior - 1e-9) {
                bajadas.push(`${tipo} pKa ${pKa} pKb ${pKb} ${Ca}/${Ct} M: baja de ${anterior} a ${ph} en ${v} mL`);
              }
              anterior = ph;
            }
          }
        }
      }
    }
    expect(bajadas).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 02/11/2026 — CABO C0527: ¿la página traducida tumba la app?
 *
 * EL CABO: 3 caídas a «Algo salió mal» con `NotFoundError: Failed to execute 'removeChild' on
 * 'Node'` en /simulador-titulacion/ el 29/10/2026 (13:19:03, :08 y :17 UTC), las tres de UNA
 * sesión de Edge 156 a 1366×768 en un aula presencial de Colombia. La traducción del navegador
 * es HIPÓTESIS: el registro no guarda el idioma. Candidatas, de leer el código:
 *   (a) CasosAula.tsx:231 `{magnitud === 'pH' ? 'pH = ' : ''}` junto a otra expresión en el
 *       <strong> de la solución. Desde cdb074d0 (31/10, lote 5 de C0312) va dentro de un <span>
 *       siempre montado. Y ANTES de ese commit tampoco podía caer: `magnitud` solo cambia en
 *       `irA` y `nuevaPractica`, que ponen `verSolucion` a false en el MISMO render, así que React
 *       retira el <div> de la solución entero (un elemento, que el traductor no toca) y nunca
 *       llega a retirar el nodo de texto suelto.
 *   (b) page.tsx:498 'antes' / 'después' en mitad del aviso del indicador: es texto ↔ texto, y
 *       React lo cambia con `nodeValue` sobre el nodo que el traductor retiró. No lanza: deja el
 *       texto viejo en pantalla (la forma del hallazgo 3297, bajo), no una caída.
 *
 * CENSO de las formas que SÍ caen (retirar un nodo de texto, o insertar delante de uno), en
 * page.tsx y CasosAula.tsx: ninguna. Todo lo condicional es un ELEMENTO (`{sirve && <span>}`
 * delante de un <small>, el aviso <p>, el bloque de pKa/pKb, la polilínea, el círculo, el
 * veredicto, la pista, la solución, el botón Cargar ↔ la nota), y ninguno tiene un texto como
 * hermano siguiente; los rótulos que cambian solos (pH, fase, color del matraz, título y
 * enunciado del caso, Ver/Ocultar) son hijo ÚNICO de su elemento y React los cambia con
 * textContent. El componente de la app no tiene ErrorBoundary ni recarga sola: la «recarga a
 * los 3 s» del registro es la persona (app/error.tsx solo ofrece «Intentar de nuevo»).
 *
 * MEDIDO el 02/11/2026 (.inspector-trabajo/tit-traducida.mjs, 196 pasos en 1366×768: las cuatro
 * pestañas, los 16 pares tipo × indicador, los cinco deslizadores con flechas, Inicio, Fin,
 * RePág y arrastre de ratón, la bureta hasta el tope en los cuatro tipos, ráfagas sin espera,
 * los 12 casos con pista, solución, tres respuestas y «Cargar», cuatro prácticas, el aviso de
 * transparencia, el tema, la guía y la tarjeta de compartir), con cuatro traductores: ninguno,
 * uno que traduce una vez, uno CONTINUO que traduce también lo que React añade después (lo que
 * hace el de verdad) y uno que traduce ANTES de hidratar (Edge con traducción automática en un PC
 * lento): 0 caídas y 0 NotFoundError en los cuatro. El temprano da el React #418 de hidratación,
 * que React recupera regenerando el árbol (C0493) y que no pasa por app/error.tsx.
 * VEREDICTO: el cabo NO se confirma con el traductor simulado del proyecto. Lo que no se ha
 * podido probar es el traductor REAL de Edge (Microsoft Translator), que no se puede lanzar aquí.
 *
 * Lo que SÍ hace el traductor, y no es una caída (forma del cabo C0243; registrado como HALLAZGO
 * ABIERTO, con su test al final de este fichero): los textos con variable que no son hijo único de su
 * elemento se quedan con el valor viejo. Medido (.inspector-trabajo/tit-texto-viejo.mjs y
 * tit-antes-despues.mjs): tras 5 × «+ 1 mL», «Volumen añadido» sigue en «0,00 mL» (sin traducir,
 * «5,00 mL») y «% completado» en «0,0 %» (20,0 %); con el volumen del analito a 35 mL, V_eq sigue
 * en «25,00 mL» (35,00) y el rótulo del deslizador en «25 mL»; y en AD+BD, al pasar de Tornasol a
 * Fenolftaleína, el aviso sigue diciendo «Tornasol … empieza a virar a 15,87 mL … cambiaría antes»
 * (sin traducir, «Fenolftaleína … 27,17 mL … después»). El pH, la fase y el color sí se actualizan.
 *
 * Estos tests son la comprobación, en verde: si alguien escribe en la app una de las formas que
 * caen, el de la batería se pone en rojo.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Traductor simulado (receta de texto-condicional-traducido-familia.spec.ts): cada nodo de texto
 * con contenido pasa a <font><font>texto</font></font>. Con `continuo`, además, un
 * MutationObserver traduce el texto que React añada después, como el traductor del navegador.
 */
async function traducirPagina(page: Page, continuo: boolean): Promise<void> {
  await asentarAntesDeTraducir(page);
  await page.evaluate((seguir) => {
    const envolver = (raiz: Node) => {
      const nodos: Text[] = [];
      if (raiz.nodeType === Node.TEXT_NODE) nodos.push(raiz as Text);
      else if (raiz.nodeType === Node.ELEMENT_NODE) {
        const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
        while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
      }
      for (const nodo of nodos) {
        const padre = nodo.parentElement;
        if (!padre || !(nodo.nodeValue ?? '').trim()) continue;
        if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) continue;
        const exterior = document.createElement('font');
        const interior = document.createElement('font');
        interior.textContent = nodo.nodeValue;
        exterior.appendChild(interior);
        padre.replaceChild(exterior, nodo);
      }
    };
    envolver(document.body);
    if (seguir) {
      new MutationObserver((cambios) => {
        for (const c of cambios) c.addedNodes.forEach((n) => n.isConnected && envolver(n));
      }).observe(document.body, { childList: true, subtree: true });
    }
  }, continuo);
}

/** Las caídas que busca el cabo: la excepción de React y la pantalla de app/error.tsx. */
function vigilarCaidas(page: Page): string[] {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /NotFoundError|removeChild|insertBefore/.test(m.text())) errores.push(m.text());
  });
  return errores;
}

async function sigueViva(page: Page, errores: string[]): Promise<void> {
  await page.waitForTimeout(300);
  await expect(page.getByText('Algo salió mal')).toHaveCount(0);
  expect(errores).toEqual([]);
}

test.describe('Cabo C0527 · la página traducida no tumba la app (Inspector 02/11/2026)', () => {
  test.use({ viewport: { width: 1366, height: 768 } }); // la de la sesión del registro

  test('(b) page.tsx:498 — el aviso pasa de «antes» a «después» sin desmontarse: sin traducir lo dice', async ({
    page,
  }) => {
    // CONTROL. AD+BD de fábrica, equivalencia 7,01 a 25,00 mL; ningún indicador es apto.
    // Tornasol (5,0–8,0): pH 5,0 ≈ pKa + log(n_A/n_HA) ⇒ n_A/n_HA = 10^0,24 = 1,74 ⇒ V ≈ 15,9 mL,
    //   muy antes del 98 % de V_eq (24,50 mL) ⇒ «antes».
    // Fenolftaleína (8,2–10,0): tras V_eq manda NH₃/NH₄⁺, pH = 9,26 − log(2,5/n_B) = 8,2 ⇒
    //   n_B = 0,218 mmol ⇒ V ≈ 27,18 mL, pasado el 102 % (25,50 mL) ⇒ «después».
    const errores = vigilarCaidas(page);
    await esperarHidratacion(page, ['#vAnalito']);
    await page.getByRole('button', { name: /Ácido débil \+ Base débil/ }).click();
    const aviso = page.locator('[class*="indicatorAviso"]');
    await page.getByRole('button', { name: /Tornasol/ }).click();
    await expect(aviso).toContainText('cambiaría antes de');
    await page.getByRole('button', { name: /Fenolftaleína/ }).click();
    await expect(aviso).toContainText('cambiaría después de');
    await sigueViva(page, errores);
  });

  test('(b) page.tsx:498 — con la página traducida, el mismo cambio de «antes» a «después» no tumba la app', async ({
    page,
  }) => {
    const errores = vigilarCaidas(page);
    await esperarHidratacion(page, ['#vAnalito']);
    await page.getByRole('button', { name: /Ácido débil \+ Base débil/ }).click();
    await page.getByRole('button', { name: /Tornasol/ }).click();
    const aviso = page.locator('[class*="indicatorAviso"]');
    await expect(aviso).toContainText('cambiaría antes de');
    await traducirPagina(page, false);
    // El aviso ya está traducido (cada nodo de texto es un <font>) cuando cambia de rama.
    expect(await aviso.locator('font').count()).toBeGreaterThan(5);
    await page.getByRole('button', { name: /Fenolftaleína/ }).click();
    await expect(page.getByRole('button', { name: /Fenolftaleína/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(aviso).toHaveCount(1);
    await sigueViva(page, errores);
  });

  test('(a) CasosAula.tsx:231 — abrir la solución de un caso de pH y pasar a uno de volumen y a «Practicar», traducida', async ({
    page,
  }) => {
    const errores = vigilarCaidas(page);
    const casos = casosAula(page);
    await traducirPagina(page, true);
    // Caso 7: pH inicial del acético 0,10 M ⇒ «pH = 2,88» en la solución.
    await casos.getByRole('button', { name: /^Caso 7:/ }).click();
    await casos.getByRole('button', { name: /solución/ }).click();
    await expect(casos.locator('[class*="casoResultado"]')).toContainText('pH = 2,88');
    // A un caso de volumen (sin «pH = ») y a la práctica, cada vez con la solución abierta.
    await casos.getByRole('button', { name: /^Caso 1:/ }).click();
    await casos.getByRole('button', { name: /solución/ }).click();
    await expect(casos.locator('[class*="casoResultado"]')).toContainText('30,00');
    await casos.getByRole('button', { name: /Practicar/ }).click();
    await casos.getByRole('button', { name: /solución/ }).click();
    await casos.getByRole('button', { name: /^Caso 10:/ }).click();
    await sigueViva(page, errores);
  });

  for (const traducida of [false, true]) {
    test(`batería del aula ${traducida ? 'con la página traducida (traductor continuo)' : 'sin traducir (control)'}: ni una caída`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      const errores = vigilarCaidas(page);
      await esperarHidratacion(page, ['#vAnalito', '#casos-respuesta']);
      if (traducida) await traducirPagina(page, true);

      // Pestañas e indicadores: los 16 pares tipo × indicador ponen y quitan «· apto aquí» y el aviso.
      for (const tipo of [/Ácido débil \+ Base fuerte/, /Ácido fuerte \+ Base débil/, /Ácido débil \+ Base débil/, /Ácido fuerte \+ Base fuerte/]) {
        await page.getByRole('button', { name: tipo }).click();
        for (const ind of [/Naranja de metilo/, /Azul de bromotimol/, /Tornasol/, /Fenolftaleína/]) {
          await page.getByRole('button', { name: ind }).click();
        }
      }
      // Los cinco deslizadores, en AD+BD (los cinco a la vista) con el aviso montado.
      await page.getByRole('button', { name: /Ácido débil \+ Base débil/ }).click();
      await page.getByRole('button', { name: /Naranja de metilo/ }).click();
      for (const id of ['vAnalito', 'cAnalito', 'cTitulante', 'pKa', 'pKb']) {
        await page.locator(`#${id}`).focus();
        for (const tecla of ['End', 'Home', 'ArrowRight', 'ArrowRight', 'PageUp']) await page.keyboard.press(tecla);
      }
      // La bureta en fuerte con fuerte, con los deslizadores en un estado conocido (Inicio y Fin):
      // 10 mL de HCl 1 M con NaOH 1 M, V_eq = 10 mL.
      await page.getByRole('button', { name: /Ácido fuerte \+ Base fuerte/ }).click();
      for (const [id, tecla] of [['vAnalito', 'Home'], ['cAnalito', 'End'], ['cTitulante', 'End']] as const) {
        await page.locator(`#${id}`).focus();
        await page.keyboard.press(tecla);
      }
      // Testigo de que los clics llegan a React con la página traducida (el pH es hijo único de
      // su <span>, así que sale bien también traducido):
      //   5 × «+ 1 mL»: quedan 10 − 5 = 5 mmol de H⁺ en 15 mL ⇒ [H⁺] 0,3333 ⇒ pH 0,4771 ⇒ «0,48»
      //   3 gotas más: 4,7 mmol en 15,3 mL ⇒ [H⁺] 0,30719 ⇒ pH 0,5126 ⇒ «0,51»
      await pulsar(mililitro(page), 5);
      await expect(valorDe(page, 'pH actual')).toHaveText('0,48');
      await pulsar(gota(page), 3);
      await expect(valorDe(page, 'pH actual')).toHaveText('0,51');
      await irAEquivalencia(page).click();
      await expect(valorDe(page, 'pH actual')).toHaveText('7,00');
      await reiniciar(page).click();

      // Los casos para clase: cada caso, con pista y solución, una respuesta y «Cargar».
      const casos = casosAula(page);
      for (let n = 1; n <= 12; n++) {
        await casos.getByRole('button', { name: new RegExp(`^Caso ${n}:`) }).click();
        const pista = casos.getByRole('button', { name: /pista/ });
        if (await pista.count()) await pista.click();
        await casos.getByRole('button', { name: /solución/ }).click();
        await casos.locator('#casos-respuesta').fill('7');
        await casos.getByRole('button', { name: 'Comprobar' }).click();
        await expect(casos.getByRole('alert')).toHaveCount(1);
        const cargar = casos.getByRole('button', { name: 'Cargar en el simulador' });
        if (await cargar.count()) await cargar.click();
      }
      for (let k = 0; k < 2; k++) {
        await casos.getByRole('button', { name: /Practicar/ }).click();
        await casos.getByRole('button', { name: /solución/ }).click();
        await casos.locator('#casos-respuesta').fill('5');
        await casos.getByRole('button', { name: 'Comprobar' }).click();
      }

      if (traducida) {
        // Que se ha medido una página TRADUCIDA y no una que React regeneró (cabo C0493).
        expect(await page.locator('h1 font').count()).toBeGreaterThan(0);
      }
      await sigueViva(page, errores);
    });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 02/11/2026 — HALLAZGO ABIERTO [operativa/medio], visto al responder el cabo C0527
 * (forma del cabo C0243: no tumba, miente en silencio).
 *
 * Con la página traducida, las cifras del panel «Estado actual» que van como nodo de texto junto
 * a su unidad —page.tsx:697 `{formatNumber(V_titulante, 2)} mL`, :701 `{formatNumber(V_eq, 2)} mL`,
 * :705 `{formatNumber(porcentaje, 1)}{' '}%`— y el rótulo de los deslizadores (:384, :403, :422,
 * :440, :459) se quedan con el valor del momento de traducir: React escribe en el nodo de texto
 * que el traductor retiró. El pH, la fase y el color, hijos ÚNICOS de su elemento, sí cambian, así
 * que la pantalla queda incoherente (pH 1,18 con «0,00 mL» añadidos). Receta de C0243: cada cifra,
 * hijo único de su propio elemento.
 *
 * ESPERADO, a mano: estado de fábrica, 25 mL de HCl 0,1 M con NaOH 0,1 M ⇒ V_eq = 0,1·25/0,1 =
 * 25,00 mL. 5 × «+ 1 mL» ⇒ «Volumen añadido» 5,00 mL y 5/25 = «20,0 %». Luego V_analito de 25 a
 * 35 mL (10 × flecha derecha, paso 1) ⇒ V_eq = 0,1·35/0,1 = 35,00 mL y el rótulo «35 mL».
 * OBTENIDO traducida (.inspector-trabajo/tit-texto-viejo.mjs): «0,00 mL», «0,0 %», «25,00 mL»
 * y «25 mL». El control sin traducir da lo esperado.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */
test.describe('Inspector 02/11/2026 · las cifras del panel siguen al estado con la página traducida', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  for (const traducida of [false, true]) {
    test(`${traducida ? 'HALLAZGO 3958 (REPARADO el 02/11/2026) — traducida' : 'control sin traducir'}: volumen, % completado, V_eq y rótulo del deslizador`, async ({
      page,
    }) => {
      // Reparado: cada cifra con su unidad es ahora UN texto, hijo único de su <span>.
      await esperarHidratacion(page, ['#vAnalito']);
      if (traducida) {
        await traducirPagina(page, false);
        expect(await page.locator('h1 font').count()).toBeGreaterThan(0);
      }
      await pulsar(mililitro(page), 5);
      // Testigo de que los clics llegan a React: 2,5 − 0,5 = 2,0 mmol de H⁺ en 30 mL ⇒
      // [H⁺] = 0,06667 ⇒ pH 1,176 ⇒ «1,18». Es hijo único de su <span>: cambia también traducido.
      await expect(valorDe(page, 'pH actual')).toHaveText('1,18');
      await expect(valorDe(page, 'Volumen añadido')).toHaveText('5,00 mL');
      await expect(valorDe(page, '% completado')).toHaveText(/^20,0\s%$/);
      await page.locator('#vAnalito').focus();
      for (let k = 0; k < 10; k++) await page.keyboard.press('ArrowRight');
      await expect(valorDe(page, 'Volumen de equivalencia (V_eq)')).toHaveText('35,00 mL');
      await expect(page.locator('#vAnalito ~ [class*="sliderValue"]').first()).toHaveText('35 mL');
    });

    test(`${traducida ? 'HALLAZGO 3958 (REPARADO el 02/11/2026) — traducida' : 'control sin traducir'}: el aviso del indicador sigue al indicador elegido`, async ({
      page,
    }) => {
      // AD+BD de fábrica: Tornasol vira «antes» (≈ 15,87 mL) y Fenolftaleína «después» (≈ 27,17 mL),
      // los dos lejos de V_eq = 25,00 mL (cuentas en el test «(b) page.tsx:498» de arriba).
      await esperarHidratacion(page, ['#vAnalito']);
      await page.getByRole('button', { name: /Ácido débil \+ Base débil/ }).click();
      await page.getByRole('button', { name: /Tornasol/ }).click();
      const aviso = page.locator('[class*="indicatorAviso"]');
      await expect(aviso).toContainText('cambiaría antes de');
      if (traducida) await traducirPagina(page, false);
      await page.getByRole('button', { name: /Fenolftaleína/ }).click();
      await expect(aviso).toContainText('Fenolftaleína vira entre');
      await expect(aviso).toContainText('cambiaría después de');
      await expect(aviso).not.toContainText('Tornasol');
    });
  }
});

test.describe('JSON-LD', () => {
  test('C0593 · un solo FAQPage, con las preguntas de la FAQ visible', async ({ page }) => {
    await page.goto(RUTA);
    await comprobarFaqPageUnico(page);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 04/11/2026 — MODO CAMBIO (desde la validación del 02/11, 911b7cee). Sin hallazgos.
 *
 * Qué cambió: bcf84241 (cabo C0267) quita el margen del 1 % a un volumen o una concentración
 * EXACTOS cuando `comprobarRespuesta` recibe los datos del caso, que `CasosAula` ahora le pasa;
 * el pH sigue con ±0,02 y el motivo de fallo usa `textoDesviacion` (3369). ff344392 (cabo C0593)
 * deja un único FAQPage que sale de PREGUNTAS_FRECUENTES, la misma lista que pinta la FAQ visible.
 * `correctorCasosAula.ts` no cambió.
 *
 * ESPERADOS, resueltos a mano ANTES de abrir la app (C·V = C·V, en mmol):
 *   caso 1 · 0,15·20 = 3 mmol / 0,10 = 30 mL exactos ⇒ margen 0
 *            «30,00», «30.00» y «30» aprueban; «30.000» (punto decimal con tres cifras) es 30 y
 *            aprueba; «29,7» desviado 0,3 (el 1 % lo aprobaba); «30,01» desviado 0,01;
 *            «30,004» desviado 0,004; «0,03» es la misma cifra en litros ⇒ el aviso de litros
 *   caso 2 · 0,80·10 = 8 mmol / 0,50 = 16 mL ⇒ «16» aprueba; «15,85» desviado 0,15; «16,1» 0,1
 *   caso 3 · 0,10·20,00 = 2 mmol / 25 = 0,08 mol/L ⇒ «0,08», «0.08» y «0,080» aprueban;
 *            «0,0805» desviado 0,0005 (antes dentro de 0,0008); «0,079» desviado 0,001;
 *            «8.000» se lee 8000: la lectura decimal (8) no queda a media unidad de 0,08, así que
 *            manda la española (C0724, 12/11/2026; antes se leía 8) ⇒ desviado 7999,92
 *   caso 4 · 0,20·42,50 = 8,5 mmol / 10 = 0,85 mol/L ⇒ «0,85» y «0.850» aprueban; «0,851» y
 *            «0,849» desviados 0,001; «8.500» se lee 8500 (por lo mismo) ⇒ desviado 8499,15
 *   caso 5 · pH (sin cambio) −log(1/40) = 1,6021 → 1,60 ⇒ 1,58 y 1,62 aprueban (borde exacto
 *            de ±0,02), 1,63 desviado 0,03
 *   práctica · el V_eq o la C se recalculan desde el enunciado que pinta la app; exacto aprueba
 *            y una centésima más da «desviado 0,01». Un V_eq con dos decimales (0,15·25/0,20 =
 *            18,75 mL) se pide exacto: 18,8 da «desviado 0,05», la política de redondeo del
 *            catálogo para una respuesta exacta (hallazgo 751).
 * OBTENIDO (.inspector-trabajo/titul-cambio.mjs): todo lo esperado. La FAQ visible y el FAQPage
 * dicen lo mismo, pregunta a pregunta y respuesta a respuesta (el «Tip» va tras la primera).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */
test.describe('Inspector 04/11/2026 · modo cambio: margen 0 en lo exacto (C0267) y FAQ única (C0593)', () => {
  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['#vAnalito', '#casos-respuesta']);
  });

  const irACaso = (page: Page, n: number) =>
    casosAula(page).getByRole('button', { name: new RegExp(`^Caso ${n}:`) }).click();

  test('casos 1 a 5 en el navegador: lo exacto sin margen, el pH con ±0,02', async ({ page }) => {
    await irACaso(page, 1);
    for (const ok of ['30,00', '30.00', '30', '30.000']) expect(await responder(page, ok), ok).toContain('Correcto');
    expect(await responder(page, '29,7')).toContain('Te has desviado 0,3 de');
    expect(await responder(page, '30,01')).toContain('Te has desviado 0,01 de');
    expect(await responder(page, '30,004')).toContain('Te has desviado 0,004 de');
    expect(await responder(page, '0,03')).toContain('en litros');

    await irACaso(page, 2);
    expect(await responder(page, '16')).toContain('Correcto');
    expect(await responder(page, '15,85')).toContain('Te has desviado 0,15 de');
    expect(await responder(page, '16,1')).toContain('Te has desviado 0,1 de');

    await irACaso(page, 3);
    for (const ok of ['0,08', '0.08', '0,080']) expect(await responder(page, ok), ok).toContain('Correcto');
    expect(await responder(page, '0,0805')).toContain('Te has desviado 0,0005 de');
    expect(await responder(page, '0,079')).toContain('Te has desviado 0,001 de');
    expect(await responder(page, '8.000')).toContain('Te has desviado 7999,92 de');

    await irACaso(page, 4);
    for (const ok of ['0,85', '0.850']) expect(await responder(page, ok), ok).toContain('Correcto');
    expect(await responder(page, '0,851')).toContain('Te has desviado 0,001 de');
    expect(await responder(page, '0,849')).toContain('Te has desviado 0,001 de');
    expect(await responder(page, '8.500')).toContain('Te has desviado 8499,15 de');

    await irACaso(page, 5);
    for (const ok of ['1,60', '1,58', '1,62']) expect(await responder(page, ok), ok).toContain('Correcto');
    expect(await responder(page, '1,63')).toContain('Te has desviado 0,03 de');
  });

  test('práctica en el navegador: volumen y concentración, recalculados desde el enunciado, sin margen', async ({ page }) => {
    const num = (s: string) => Number(s.replace(',', '.'));
    let vistos = 0;
    for (let i = 0; i < 60 && vistos < 3; i++) {
      await casosAula(page).getByRole('button', { name: /Practicar/ }).click();
      const enunciado = (await casosAula(page).locator('p[aria-live="polite"]').innerText()).replace(/\s+/g, ' ');
      const etiqueta = await casosAula(page).locator('label[for="casos-respuesta"]').innerText();
      const m = enunciado.match(/Se titulan (\d+) mL de .*? (?:(\d+,\d+) M )?(?:\(pKa = [\d,]+\) )?con \S+ (\d+,\d+) M/);
      if (!m) continue;
      const Va = num(m[1]);
      const Ct = num(m[3]);
      const mv = enunciado.match(/se han añadido ([\d,]+) mL de base/);
      let exacto: number | null = null;
      if (/Volumen de base/.test(etiqueta) && m[2]) exacto = (num(m[2]) * Va) / Ct; // V_eq = C_a·V_a/C_t
      else if (/Concentración/.test(etiqueta) && mv) exacto = (Ct * num(mv[1])) / Va; // C_a = C_t·V_eq/V_a
      if (exacto === null) continue;
      const centesimas = Math.round(exacto * 100);
      expect(Math.abs(exacto * 100 - centesimas), `${enunciado}: es exacto a dos decimales`).toBeLessThan(1e-6);
      const texto = (n: number) => (n / 100).toFixed(2).replace('.', ',');
      expect(await responder(page, texto(centesimas)), enunciado).toContain('Correcto');
      expect(await responder(page, texto(centesimas + 1)), enunciado).toContain('Te has desviado 0,01 de');
      vistos += 1;
    }
    expect(vistos, 'al menos tres ejercicios de volumen o concentración en 60 intentos').toBe(3);
  });

  test('práctica (motor): en 3000 semillas, volumen y concentración tienen margen 0 y la clave aprueba', async () => {
    let conDosDecimales = 0;
    for (let s = 1; s <= 3000; s += 1) {
      const e = generarEjercicioAleatorio(s);
      if (e.magnitud === 'pH') continue;
      const r = comprobarRespuesta(e.respuesta, e.respuesta, e.magnitud, e.datos);
      expect(r.correcto, `semilla ${s}`).toBe(true);
      expect(r.tolerancia, `semilla ${s}: lo exacto no tiene margen`).toBe(0);
      expect(comprobarRespuesta(e.respuesta + 0.01, e.respuesta, e.magnitud, e.datos).correcto, `semilla ${s}`).toBe(false);
      // Un V_eq de la forma x,y5 (18,75 = 0,15·25/0,20): redondeado a décimas ya no aprueba.
      if (e.magnitud === 'volumen' && Math.abs(e.respuesta * 10 - Math.round(e.respuesta * 10)) > 1e-6) {
        conDosDecimales += 1;
        const decimas = Math.round(e.respuesta * 10) / 10;
        const v = comprobarRespuesta(decimas, e.respuesta, e.magnitud, e.datos);
        expect(v.correcto, `semilla ${s}: ${decimas} para ${e.respuesta}`).toBe(false);
        expect(v.motivo, `semilla ${s}`).toContain('Te has desviado 0,05 de');
      }
    }
    expect(conDosDecimales, 'el generador produce V_eq con dos decimales').toBeGreaterThan(0);
  });

  test('C0593 · cada respuesta del FAQPage es la de la FAQ visible (con su «Tip» detrás)', async ({ page }) => {
    const { ld, visibles } = await page.evaluate(() => {
      const ld: { q: string; a: string }[] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
        const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
        for (const n of nodos) {
          if (n['@type'] !== 'FAQPage') continue;
          for (const q of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
            ld.push({ q: q.name, a: q.acceptedAnswer.text });
          }
        }
      }
      const visibles = Array.from(document.querySelectorAll('[class*="faqItem"]')).map((d) => ({
        q: (d.querySelector('strong')?.textContent ?? '').trim(),
        // Sin normalizar espacios: `\s` también casa con el U+00A0 de «98 %», que el FAQPage conserva.
        a: Array.from(d.querySelectorAll('p'))
          .map((p) => (p.textContent ?? '').trim())
          .join(' '),
      }));
      return { ld, visibles };
    });
    expect(visibles.length).toBe(6);
    expect(ld).toEqual(visibles);
  });
});

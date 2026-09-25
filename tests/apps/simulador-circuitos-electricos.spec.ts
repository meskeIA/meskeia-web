import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, esperarValorEnReact, sembrarValor } from './_hidratacion';

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
 *
 * ── RE-INSPECCIÓN 25/09/2026 — tras 272b0ee7 (logo) y b7733c6d (cabeceras) ───
 * El fichero, tal cual estaba: 11 de 11 en verde. Los ocho arreglos 868-875 siguen en pie,
 * comprobados TECLEANDO en escritorio y en Pixel 7: «1.000 + 2.200 + 1.500» a 12 V da
 * 4700,000 Ω · la terna 230 V / 10 A / 5 Ω se rechaza nombrando los 50 V · horas, días y tarifa
 * vacíos se nombran uno a uno · los 7 conmutadores llevan aria-pressed y ningún botón va sin
 * type · la tensión del nodo sale «12,5000» · «0,020» A con 150 Ω da 3,0000 V y la tarifa
 * «0,145» da 40,0200 € · 230 V / 0 A / 5 Ω se rechaza · «1e3» dice «notación científica».
 *
 *   272b0ee7 ✔ en 360, 412, 600 y 768 px el logo no toca el <h1> ni ningún control, en los
 *            dos temas y también bajo stemum.com, con su píldora más ancha      → CASO 14
 *            ✘ pero el hueco de 80 px solo vale hasta 768 px, y justo por encima vuelve a tapar
 *            el principio del título: de 772 a 992 px en meskeia.com y de 772 a 1048 px en
 *            stemum.com (820 px = iPad Air en vertical; 844-932 px = móvil en horizontal).
 *            ⚠️ elementFromPoint en el CENTRO del título da verde en todos esos anchos: lo
 *            tapado es el principio («Simu»), por eso se muestrea el texto entero. → CASO 20
 *   b7733c6d ✔ las 8 cabeceras (5 de la ficha + 3 de la comparativa) dan 5,47:1 en claro y en
 *            oscuro sobre el fondo COMPUTADO, y 8,72:1 bajo stemum.com             → CASO 15
 *
 * CASOS NUEVOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 11 (normal) — Paralelo tecleado «1.500», «3.000», «12.000» Ω a «7,2» V
 *       1/Req = 8/12000 + 4/12000 + 1/12000 = 13/12000 → Req = 923,076923… → 923,0769 Ω
 *       I = 7,2/1500 = 0,0048 · 7,2/3000 = 0,0024 · 7,2/12000 = 0,0006 → total 0,0078 A
 *       P = 51,84/1500 = 0,03456 · 51,84/3000 = 0,01728 · 51,84/12000 = 0,00432
 *       P total = 51,84 × 13/12000 = 0,05616 W → 0,0562 W   (suma de ramas ✔)
 *
 *   CASO 12 (límite) — Serie «0,047» Ω + «4.700.000» Ω a 9 V: diez órdenes de magnitud
 *       Req = 4.700.000,047 Ω (los tres decimales tienen que sobrevivir a los siete enteros)
 *       I = 9 / 4.700.000,047 = 1,9149 µA · V2 = I × 4.700.000 = 8,99999991 V → 9,0000 V
 *       Y una R de 0 Ω en serie: físicamente es un cable. La app la rechaza nombrando el campo,
 *       que es una elección conservadora y legítima; si un día se admite, el esperado es el
 *       mismo Req, porque sumar 0 no cambia nada.
 *
 *   CASO 13 (rechazo) — Paralelo 100 Ω ∥ 0 Ω a 12 V: una rama de 0 Ω es un cortocircuito,
 *       1/Req = 1/100 + 1/0 = ∞ → I = ∞. Se rechaza nombrando R2, sin ficha, sin ∞ ni NaN.
 *       Y el control positivo: 100 ∥ 50 → Req = 5000/150 = 33,3333 Ω,
 *       I = 0,12 + 0,24 = 0,36 A, P = 144/33,333… = 4,32 W.
 *
 * HALLAZGOS 1661-1667 (25/09/2026), REPARADOS el mismo día: sus casos, al final, quedan como
 * regresión (ya sin test.fail). Lo que se hizo, en una línea por caso:
 *   CASO 16 · la app lee «0.xxx» con el punto como decimal (un millar no empieza por 0); el
 *             resto sigue yendo a parseSpanishNumber. Regla local en page.tsx (leerNumero).
 *   CASO 17 · Reducir/Aumentar retiran la ficha; el diagrama se dibuja con el circuito calculado.
 *   CASO 18 · cada <label> lleva htmlFor y su campo, id.
 *   CASO 19 · el aviso pasa a una clase con variante oscura (#fca5a5).
 *   CASO 20 · el hero deja 96 px arriba en todos los anchos (80 px hasta 768).
 *   CASO 21 · la cifra que se redondearía a cero pasa a prefijo SI (µA, mW); la R, con sus decimales.
 *   CASO 22 · horas, días y tarifa admiten el 0 (y rechazan el negativo).
 * Lo que decía el acta al abrirlos:
 *   CASO 16 alto   · «0.020» A y la tarifa «0.793» escritos con punto (México) salen ×1000.
 *                    La causa está en `lib/formatters.ts`: AGRUPA_CON_PUNTO casa un primer
 *                    grupo «0», y ningún número se escribe «0.793» para decir 793. No es
 *                    parseo casero: `check:parser` no tiene nada que ver aquí.
 *   CASO 17 medio  · cambiar el número de resistencias deja una ficha que ya no describe lo que
 *                    hay en pantalla: el diagrama se redibuja y la tabla y el Req no.
 *   CASO 18 medio  · los campos no tienen etiqueta asociada: se anuncian por su placeholder
 *                    («0», «Ω», «voltios») y horas, días y tarifa no tienen nombre ninguno.
 *   CASO 19 medio  · el aviso de error, #dc2626 en línea, da 2,85:1 sobre el panel oscuro.
 *   CASO 20 medio  · el logo tapa el título entre 772 y 992 px (arriba, 272b0ee7).
 *   CASO 21 bajo   · decimales fijos: 1,91 µA sale «≈0 A (0,00 mA)», 2,5 mW sale «0,00 W», y
 *                    la R de 0,047 Ω se reimprime «0,05» en la tabla.
 *   CASO 22 bajo   · la tarifa 0 €/kWh (autoconsumo), que el código declara admitida, se rechaza.
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

/**
 * Lee una medida hasta que deja de moverse. Leer un color o una caja justo después de cambiar
 * de tema o de ancho devuelve un fotograma INTERMEDIO de la transición (el logo lleva
 * `transition: all 0.3s`, y el tema, las suyas): un número que no existe en ningún estado.
 */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}

/**
 * Contraste WCAG del texto de un elemento contra su fondo EFECTIVO: los fondos translúcidos de
 * los ancestros se componen sobre el primero opaco. Se mide el color COMPUTADO, no el CSS
 * leído con una regex, que no ve ni los tokens redefinidos por tema ni por marca.
 */
async function contrasteEfectivo(el: Locator): Promise<number> {
  return el.evaluate((nodo) => {
    const rgba = (c: string): number[] => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const capas: number[][] = [];
    for (let e: Element | null = nodo; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const c of capas.reverse()) fondo = fondo.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    const lum = ([r, g, b]: number[]): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const a = lum(rgba(getComputedStyle(nodo).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

interface Caja { izq: number; der: number; arr: number; aba: number }

interface SolapeLogo {
  /** Puntos del TEXTO del <h1> (muestreados cada 3 px) que caen dentro del logo fijo o del toggle */
  tapados: number;
  muestras: number;
  /** Lo que miraría un elementFromPoint en el centro del título: no basta, ver CASO 20 */
  centroEsTitulo: boolean;
  /** Controles de la herramienta cuyo centro cae bajo la barra fija, a scroll 0 */
  controlesTapados: string[];
  logo: Caja | null;
  toggle: Caja | null;
  titulo: Caja;
}

/** Cuánto del título y de los controles tapa la barra fija de MeskeiaLogo, a scroll 0. */
async function solapeDelLogo(page: Page): Promise<SolapeLogo> {
  return page.evaluate(() => {
    const BARRA = '[class*="headerBar"]';
    const h1 = document.querySelector('h1') as HTMLElement;
    // La caja del BLOQUE h1 ocupa todo el ancho del hero; la que importa es la del texto.
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const lineas = Array.from(rango.getClientRects());
    let tapados = 0;
    let muestras = 0;
    for (const b of lineas) {
      for (let x = b.left + 1; x < b.right - 1; x += 3) {
        for (let y = b.top + 2; y < b.bottom - 2; y += 3) {
          muestras++;
          if (document.elementFromPoint(x, y)?.closest(BARRA)) tapados++;
        }
      }
    }
    const titulo = {
      izq: Math.min(...lineas.map((r) => r.left)),
      der: Math.max(...lineas.map((r) => r.right)),
      arr: Math.min(...lineas.map((r) => r.top)),
      aba: Math.max(...lineas.map((r) => r.bottom)),
    };
    const centro = document.elementFromPoint((titulo.izq + titulo.der) / 2, (titulo.arr + titulo.aba) / 2);
    const controlesTapados = Array.from(document.querySelectorAll<HTMLElement>('main button, main input'))
      .filter((c) => c.offsetParent !== null)
      .filter((c) => {
        const b = c.getBoundingClientRect();
        return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest(BARRA);
      })
      .map((c) => c.textContent?.trim() || c.getAttribute('placeholder') || c.tagName);
    const caja = (sel: string): Caja | null => {
      const b = document.querySelector(sel)?.getBoundingClientRect();
      return b ? { izq: b.left, der: b.right, arr: b.top, aba: b.bottom } : null;
    };
    return {
      tapados,
      muestras,
      centroEsTitulo: centro !== null && h1.contains(centro),
      controlesTapados,
      logo: caja('[class*="logoContainer"]'),
      toggle: caja('[class*="themeToggle"]'),
      titulo,
    };
  });
}

const seCruzan = (a: Caja | null, b: Caja): boolean =>
  a !== null && a.izq < b.der && b.izq < a.der && a.arr < b.aba && b.arr < a.aba;

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

  // ── RE-INSPECCIÓN 25/09/2026 ──────────────────────────────────────────────────────────────

  test('CASO 11 · paralelo tecleado con punto de millar: 1.500 ∥ 3.000 ∥ 12.000 Ω a 7,2 V', async ({ page }) => {
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);
    // TECLEADO, no sembrado: así entra el dato de verdad, y el punto de millar es justo lo que
    // el hallazgo 868 leía como decimal. El CASO 1 lo cubre en serie; este, en paralelo.
    await teclearComoUsuario(page, resistencia(page, 0), '1.500');
    await teclearComoUsuario(page, resistencia(page, 1), '3.000');
    await teclearComoUsuario(page, resistencia(page, 2), '12.000');
    await teclearComoUsuario(page, page.locator('input[placeholder="voltios"]'), '7,2');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // 1/Req = 8/12000 + 4/12000 + 1/12000 = 13/12000 → Req = 923,076923… Ω
    // (y menor que la rama más pequeña, 1500 Ω, como exige el paralelo)
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('923,0769 Ω');
    // I total = 0,0048 + 0,0024 + 0,0006 = 0,0078 A — que es también V/Req = 7,2 × 13/12000
    await expect(valorDe(page, 'Corriente total (fuente)')).toHaveText('0,0078 A');
    // P total = V²/Req = 51,84 × 13/12000 = 0,05616 W
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('0,0562 W');

    await expect(filas(page)).toHaveCount(3);
    // Columnas: R (lo tecleado, ya como número) · V del nodo · I = V/R · P = V²/R
    const esperado = [
      ['1500,00', '0,0048', '0,0346'], // 7,2/1500 · 51,84/1500 = 0,03456
      ['3000,00', '0,0024', '0,0173'], // 7,2/3000 · 51,84/3000 = 0,01728
      ['12.000,00', '0,0006', '0,0043'], // 7,2/12000 · 51,84/12000 = 0,00432 — el millar, con punto
    ];
    for (let i = 0; i < 3; i++) {
      const celdas = filas(page).nth(i).locator('td');
      await expect(celdas.nth(1)).toHaveText(esperado[i][0]);
      await expect(celdas.nth(2)).toHaveText('7,2000');
      await expect(celdas.nth(3)).toHaveText(esperado[i][1]);
      await expect(celdas.nth(4)).toHaveText(esperado[i][2]);
    }
  });

  test('CASO 12 · límite: serie 0,047 Ω + 4.700.000 Ω a 9 V, y una R de 0 Ω', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);
    await page.getByRole('button', { name: 'Reducir' }).click();
    await expect(page.locator('input[placeholder="Ω"]')).toHaveCount(2);

    await teclearComoUsuario(page, resistencia(page, 0), '0,047');
    await teclearComoUsuario(page, resistencia(page, 1), '4.700.000');
    await teclearComoUsuario(page, page.locator('input[placeholder="voltios"]'), '9');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // Req = 0,047 + 4.700.000 = 4.700.000,047 Ω: los tres decimales sobreviven a los siete
    // enteros. Con el parseo del 868 habría salido 4.700,047; con el del 873, 4.700.047.
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('4.700.000,047 Ω');
    // Casi toda la tensión cae en la grande: V2 = 9 × 4.700.000 / 4.700.000,047 = 8,99999991 V
    await expect(filas(page)).toHaveCount(2);
    await expect(filas(page).nth(1).locator('td').nth(1)).toHaveText('4.700.000,00');
    await expect(filas(page).nth(1).locator('td').nth(2)).toHaveText('9,0000 V');

    // Una R de 0 Ω en serie es un cable. La app la rechaza nombrando el campo y sin ficha: es una
    // elección conservadora que esta inspección da por buena. Si un día se admite, el esperado
    // pasa a ser el mismo Req de arriba, porque sumar 0 no cambia nada.
    await page.getByRole('button', { name: 'Aumentar' }).click();
    await teclearComoUsuario(page, resistencia(page, 2), '0');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(page.locator('main [role="alert"]')).toHaveText('R3: tiene que ser mayor que cero.');
    await expect(page.locator('div[role="status"]')).toBeEmpty();
  });

  test('CASO 13 · rechazo: una rama de 0 Ω en paralelo es un cortocircuito', async ({ page }) => {
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);
    await page.getByRole('button', { name: 'Reducir' }).click();

    await teclearComoUsuario(page, resistencia(page, 0), '100');
    await teclearComoUsuario(page, resistencia(page, 1), '0');
    await teclearComoUsuario(page, page.locator('input[placeholder="voltios"]'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // 1/Req = 1/100 + 1/0 = ∞ → Req = 0 e I = 12/0 = ∞: no hay circuito que calcular. Aviso que
    // nombra la rama, y ninguna ficha detrás (ni «∞», ni «No definido»).
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toHaveText('R2: tiene que ser mayor que cero.');
    await expect(page.locator('div[role="status"]')).toBeEmpty();

    // Control: la misma rama con 50 Ω sí calcula. Un aviso que saliera siempre pasaría la mitad
    // de arriba sin demostrar nada. 100 ∥ 50 = 5000/150 = 33,333… Ω;
    // I = 12/100 + 12/50 = 0,12 + 0,24 = 0,36 A; P = V²/Req = 144 × 0,03 = 4,32 W.
    await teclearComoUsuario(page, resistencia(page, 1), '50');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(aviso).toHaveCount(0);
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('33,3333 Ω');
    await expect(valorDe(page, 'Corriente total (fuente)')).toHaveText('0,3600 A');
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('4,3200 W');
  });

  /**
   * CASO 15 — verifica b7733c6d (22/09/2026): las cabeceras de tabla dejaron de poner blanco
   * sobre el azul de marca (4,11:1) y pasaron a --primary-boton (#26718F, 5,47:1), igual en los
   * dos temas. Se mide el color COMPUTADO de cada <th> contra su fondo efectivo.
   */
  test('CASO 15 · las cabeceras de tabla dan 4,5:1 o más en claro y en oscuro', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);
    for (let i = 0; i < 3; i++) await sembrarValor(page, resistencia(page, i), String((i + 1) * 100));
    await sembrarValor(page, page.locator('input[placeholder="voltios"]'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // Las 5 de la tabla por componente y las 3 de la comparativa del bloque educativo
    await expect(page.locator('div[role="status"] th')).toHaveCount(5);
    const cabeceras = page.locator('table th');
    await expect(cabeceras).toHaveCount(8);
    const medir = async (): Promise<number[]> => {
      const ratios: number[] = [];
      for (const th of await cabeceras.all()) ratios.push(Math.round((await contrasteEfectivo(th)) * 100) / 100);
      return ratios;
    };

    await esperarPaginaAsentada(page);
    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        // El botón REAL del tema: fijar data-theme a mano lo pisa la app al hidratar, y el test
        // mediría dos veces el claro creyendo comparar los dos.
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      const ratios = await esperarEstable(medir);
      expect(ratios).toHaveLength(8);
      for (const r of ratios) expect(r, `cabecera de tabla, tema ${tema}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test.describe('en móvil y tableta (táctil)', () => {
    // Enumerado en vez de `...devices['Pixel 7']`: un `devices` dentro de un describe forzaría
    // un worker nuevo, y estas cinco opciones no.
    test.use({
      viewport: { width: 360, height: 800 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });

    /**
     * CASO 14 — verifica 272b0ee7 (24/09/2026): el hero va a sangre y el logo fijo llega hasta
     * ~52 px en estos anchos; con los 32-40 px de margen de antes tapaba el principio del <h1>.
     * Ahora el hero deja 80 px arriba. Se muestrea TODO el texto del título, no solo su centro.
     */
    test('CASO 14 · hasta 768 px el logo fijo no tapa el título ni ningún control', async ({ page }) => {
      await esperarPaginaAsentada(page);
      for (const ancho of [360, 412, 600, 768]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        const s = await esperarEstable(() => solapeDelLogo(page));
        expect(s.muestras, `${ancho} px: el muestreo tiene que haber mirado el título`).toBeGreaterThan(100);
        expect(s.tapados, `${ancho} px: puntos del título bajo la barra fija`).toBe(0);
        expect(s.centroEsTitulo, `${ancho} px: elementFromPoint en el centro del título`).toBe(true);
        expect(seCruzan(s.logo, s.titulo), `${ancho} px: caja del logo contra la del título`).toBe(false);
        expect(seCruzan(s.toggle, s.titulo), `${ancho} px: caja del toggle contra la del título`).toBe(false);
        expect(s.controlesTapados, `${ancho} px: controles bajo la barra fija`).toEqual([]);
      }
      // El hueco que lo consigue (medido el 25/09: logo hasta 52 px, título desde 79 px)
      await expect(page.locator('header:has(h1)')).toHaveCSS('padding-top', '80px');
    });

    /**
     * CASO 20 (hallazgo nuevo del 25/09/2026, medio) — el arreglo de 272b0ee7 vale hasta 768 px,
     * y justo por encima el logo recupera su tamaño de escritorio (hasta 77 px de alto y 203 de
     * ancho) mientras el hero vuelve a sus 40 px de margen: el título empieza a 39 px y el logo
     * se come «Simu». Medido barriendo el ancho de 4 en 4 px: de 772 a 992 px en meskeia.com y
     * de 772 a 1048 px en stemum.com, cuya píldora «Stemum › Física» es más ancha. Ahí caen el
     * iPad Air (820) y el iPad Pro 11" (834) en vertical, y los móviles en horizontal (844-932).
     * El commit se midió en 360, 390, 768, 1024, 1280 y 1920: ninguno cae dentro del hueco.
     */
    test('CASO 20 · a 820 px (iPad Air en vertical) el logo fijo tampoco puede tapar el título', async ({ page }) => {
      await esperarPaginaAsentada(page);
      // 820 es el caso del acta; el resto, los bordes y los dispositivos del tramo medido
      // (772-992 px en meskeia.com, hasta 1048 px bajo stemum.com).
      for (const ancho of [772, 820, 834, 844, 932, 992, 1048]) {
        await page.setViewportSize({ width: ancho, height: 1180 });
        const s = await esperarEstable(() => solapeDelLogo(page));
        expect(s.muestras, `${ancho} px: el muestreo tiene que haber mirado el título`).toBeGreaterThan(100);
        // El centro del título queda libre: un elementFromPoint en el centro daría verde aquí.
        expect(s.centroEsTitulo, `${ancho} px: centro del título`).toBe(true);
        // Obtenido el 25/09/2026 a 820 px: el principio del título, tapado (179 puntos).
        expect(s.tapados, `puntos del título bajo la barra fija a ${ancho} px`).toBe(0);
        expect(seCruzan(s.logo, s.titulo), `${ancho} px: caja del logo contra la del título`).toBe(false);
      }
    });
  });

  // ── HALLAZGOS 1661-1667 (25/09/2026): nacieron con test.fail(); reparados el mismo día,
  // quedan como regresión.

  /**
   * CASO 16 (alto, cálculo) — el factor 1000 del 873, ahora por el punto decimal que escribe
   * México (y media Latinoamérica). `parseSpanishNumber` resuelve un separador único a favor del
   * español, y su AGRUPA_CON_PUNTO (/^\d{1,3}(\.\d{3})+$/) casa también un PRIMER grupo «0»:
   * «0.020» → 20 y «0.793» → 793. Pero ningún número se escribe «0.793» para decir 793, así que
   * aquí no hay ambigüedad que resolver a favor de nadie. El defecto vive en lib/formatters.ts
   * (lo comparten 93 ficheros), no en un parseo casero: check:parser no tenía nada que ver.
   */
  test('CASO 16 · «0.020» A y la tarifa «0.793» escritos con punto no se multiplican por mil', async ({ page }) => {
    const rapido = { timeout: 1500 };
    // Ley de Ohm, incógnita V (la de arranque): los 20 mA del LED de la FAQ, escritos con punto.
    // DEBERÍA: V = 0,02 × 150 = 3 V y P = 3 × 0,02 = 0,06 W, lo mismo que el CASO 8 con coma.
    // Obtenido: V = 3000,0000 V · I = 20,0000 A — 20.000,00 mA · P = 60.000,0000 W.
    await teclearComoUsuario(page, page.locator('input[placeholder="0"]').nth(0), '0.020');
    await teclearComoUsuario(page, page.locator('input[placeholder="0"]').nth(1), '150');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(valorDe(page, 'Tensión (V)')).toHaveText('3,0000 V', rapido);
    await expect(valorDe(page, 'Corriente (I)')).toHaveText('0,0200 A — 20,00 mA', rapido);
    await expect(valorDe(page, 'Potencia disipada (P)')).toHaveText('0,0600 W', rapido);

    // Potencia: una tarifa como las de la CFE mexicana, con tres decimales y punto.
    // DEBERÍA: 127 V × 10 A = 1270 W → 1,27 kW × 1 h × 30 días = 38,1 kWh × 0,793 = 30,2133.
    // Obtenido: 30.213,3000.
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);
    await teclearComoUsuario(page, campo(0), '127');
    await teclearComoUsuario(page, campo(1), '10');
    await teclearComoUsuario(page, campo(5), '0.793');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('38,1000 kWh', rapido);
    await expect(valorDe(page, 'Coste estimado')).toHaveText('30,2133 €', rapido);
  });

  /**
   * CASO 17 (medio, operativa) — «Reducir» y «Aumentar» cambian los campos y redibujan el
   * diagrama de la ficha al instante, pero la tabla y el Req siguen siendo los del cálculo
   * anterior: la ficha queda describiendo un circuito que ya no está en pantalla, y el diagrama
   * vivo le da apariencia de recién calculada. Pasa igual en Paralelo (3 × 60 Ω → «Aumentar»:
   * 4 campos, 4 ramas dibujadas, 3 filas y Req = 20,0000 Ω).
   */
  test('CASO 17 · al cambiar el número de resistencias, la ficha no sigue describiendo el circuito anterior', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);
    await sembrarValor(page, resistencia(page, 0), '100');
    await sembrarValor(page, resistencia(page, 1), '200');
    await sembrarValor(page, resistencia(page, 2), '300');
    await sembrarValor(page, page.locator('input[placeholder="voltios"]'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    // Req = 100 + 200 + 300 = 600 Ω
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('600,000 Ω');

    await page.getByRole('button', { name: 'Reducir' }).click();
    await expect(page.locator('input[placeholder="Ω"]')).toHaveCount(2);
    // DEBERÍA: o retirarse la ficha, o describir el circuito de dos que hay en pantalla
    // (100 + 200 = 300 Ω). Obtenido: Req = 600,000 Ω, tres filas —con una R3 que ya no tiene
    // campo— y el diagrama, que sí se redibuja, con dos resistencias.
    const nFilas = await filas(page).count();
    expect([0, 2], 'filas de la tabla con dos campos en pantalla').toContain(nFilas);
    if (nFilas > 0) await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('300,000 Ω');
  });

  /**
   * CASO 18 (medio, accesibilidad) — ningún <label> está asociado a su campo (ni htmlFor/id ni
   * envolviéndolo), así que el nombre accesible sale del placeholder: la Ley de Ohm se anuncia
   * como «0» y «0» —y cuál es I y cuál R cambia con la incógnita—, las resistencias como «Ω» y la
   * tensión como «voltios». Horas, días y tarifa no tienen placeholder: no tienen nombre ninguno.
   */
  test('CASO 18 · cada campo se anuncia con su etiqueta, no con su placeholder', async ({ page }) => {
    const rapido = { timeout: 1500 };
    // DEBERÍA: cada etiqueta visible nombrar su campo. Obtenido: 0 campos con esas etiquetas.
    await expect(page.getByLabel('Corriente I (A)')).toHaveCount(1, rapido);
    await expect(page.getByLabel('Resistencia R (Ω)')).toHaveCount(1, rapido);
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await expect(page.getByLabel('Tensión de fuente (V)')).toHaveCount(1, rapido);
    await expect(page.getByRole('textbox', { name: /R1/ })).toHaveCount(1, rapido);
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    for (const etiqueta of [
      'Tensión V (voltios)',
      'Corriente I (amperios)',
      'Resistencia R (ohmios)',
      'Horas de uso diario',
      'Días del periodo',
      'Tarifa eléctrica (€/kWh)',
    ]) {
      await expect(page.getByLabel(etiqueta), etiqueta).toHaveCount(1, rapido);
    }
  });

  /**
   * CASO 19 (medio, accesibilidad) — el aviso de error es lo único que dice qué corregir, y lleva
   * su color en línea (`style={{ color: '#dc2626' }}`, los cuatro de la app). En claro cumple
   * (4,83:1 sobre #FFFFFF); en oscuro queda sobre el panel --bg-card #2D2D2D a 2,85:1, y es texto
   * de 14 px: exige 4,5:1. Ningún candado lo ve: check:token-oscuro mira tokens declarados en los
   * .module.css, no colores literales en un style de JSX.
   */
  test('CASO 19 · el aviso de error se lee también en tema oscuro (4,5:1 o más)', async ({ page }) => {
    await page.getByRole('button', { name: 'Calcular', exact: true }).click(); // los dos campos vacíos
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toHaveText('Introduce dos valores positivos.');
    await esperarPaginaAsentada(page);
    // En claro: #dc2626 sobre #FFFFFF = 4,83:1
    expect(await esperarEstable(() => contrasteEfectivo(aviso)), 'aviso en claro').toBeGreaterThanOrEqual(4.5);

    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // DEBERÍA: 4,5:1 también en oscuro. Obtenido: 2,85:1.
    expect(await esperarEstable(() => contrasteEfectivo(aviso)), 'aviso en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 21 (bajo, cálculo) — los decimales son fijos, y por debajo de lo que caben la cifra se
   * pierde: `formatNumber` pone «≈0» por debajo de 0,0001, pero entre 0,0001 y lo que redondea a
   * cero con 2 decimales imprime un cero SIN «≈». Tres síntomas del mismo origen:
   *   · Serie 0,047 Ω + 4.700.000 Ω a 9 V: I = 1,9149 µA sale «≈0 A (0,00 mA)»
   *   · la R de 0,047 Ω se reimprime «0,05» en la tabla (formatNumber(r, 2)): otra que la tecleada
   *   · Potencia 5 V sobre 10 kΩ: P = 2,5 mW sale «0,00 W» al lado de «I = 0,0005 A»; y es justo
   *     el rango al que manda el consejo «Respeta la potencia máxima… usa el tab de Potencia».
   */
  test('CASO 21 · microamperios y milivatios no se imprimen como cero, ni la R tecleada cambia', async ({ page }) => {
    const rapido = { timeout: 1500 };
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="Ω"]']);
    await page.getByRole('button', { name: 'Reducir' }).click();
    await teclearComoUsuario(page, resistencia(page, 0), '0,047');
    await teclearComoUsuario(page, resistencia(page, 1), '4.700.000');
    await teclearComoUsuario(page, page.locator('input[placeholder="voltios"]'), '9');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('4.700.000,047 Ω');
    // DEBERÍA: la fila R1 repite la R tecleada, 0,047. Obtenido: «0,05».
    await expect(filas(page).nth(0).locator('td').nth(1)).toContainText('0,047', rapido);
    // DEBERÍA: I = 9 / 4.700.000,047 = 1,9149 µA, legible. Obtenido: «≈0 A (0,00 mA)».
    await expect(valorDe(page, 'Corriente total')).not.toContainText('0,00 mA', rapido);
    // Reparado: la cifra que se perdería en A pasa a µA, con los mismos 4 decimales.
    await expect(valorDe(page, 'Corriente total')).toHaveText('1,9149 µA');
    await expect(filas(page).nth(0).locator('td').nth(3)).toHaveText('1,9149 µA');

    // Potencia: 5 V sobre 10 kΩ → I = 5/10.000 = 0,0005 A · P = 25/10.000 = 0,0025 W
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);
    await teclearComoUsuario(page, campo(0), '5');
    await teclearComoUsuario(page, campo(2), '10.000');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(valorDe(page, 'Corriente (I)')).toHaveText('0,0005 A');
    // DEBERÍA: una potencia distinta de cero. Obtenido: «0,00 W».
    await expect(valorDe(page, 'Potencia (P)')).not.toHaveText('0,00 W', rapido);
    // Reparado: 2,5 mW, con los 2 decimales de la potencia de esta pestaña.
    await expect(valorDe(page, 'Potencia (P)')).toHaveText('2,50 mW');
  });

  /**
   * CASO 22 (bajo, operativa) — calcPotencia dice, en el comentario de la reparación del 870:
   * «El cero sí se admite —una tarifa de 0 €/kWh es autoconsumo, y 0 horas da 0 kWh, que no es
   * una cifra falsa». Pero el motivoDeRechazo que trajo el 874 corre ANTES sobre los seis campos
   * y rechaza cualquier 0, así que aquella validación quedó muerta: la tarifa 0 y las 0 horas se
   * rechazan con «tiene que ser mayor que cero».
   */
  test('CASO 22 · una tarifa de 0 €/kWh (autoconsumo) da coste cero, no un rechazo', async ({ page }) => {
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    await esperarHidratacion(page, ['input[placeholder="opcional si tienes I y R"]']);
    const campo = (i: number) => page.locator('input[inputMode="decimal"]').nth(i);
    await teclearComoUsuario(page, campo(0), '230');
    await teclearComoUsuario(page, campo(1), '10');
    await teclearComoUsuario(page, campo(5), '0');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    // DEBERÍA: P = 230 × 10 = 2300 W → 2,3 kW × 1 h × 30 días = 69 kWh, y 69 × 0 = 0 €.
    // Obtenido: «Tarifa: tiene que ser mayor que cero.» y ninguna ficha.
    await expect(page.locator('main [role="alert"]')).toHaveCount(0, { timeout: 1500 });
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('69,0000 kWh');
    await expect(valorDe(page, 'Coste estimado')).toHaveText('0,0000 €');

    // 0 horas al día: 0 kWh, que no es una cifra falsa. Y un negativo sí se rechaza.
    await teclearComoUsuario(page, campo(5), '0,18');
    await teclearComoUsuario(page, campo(3), '0');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toHaveCount(0, { timeout: 1500 });
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('0,0000 kWh');
    await teclearComoUsuario(page, campo(3), '-1');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toHaveText('Horas al día: no puede ser negativo.');
    await expect(page.locator('div[role="status"]')).toBeEmpty();
  });
});

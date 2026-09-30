import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, esperarValorEnReact, sembrarValor } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
} from '../../app/simulador-circuitos-electricos/casos';
import { resolverParalelo, resolverSerie, resolverPotencia } from '../../app/simulador-circuitos-electricos/motor';

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
 *   app/simulador-circuitos-electricos/page.tsx — NO había motor separado: las cuatro funciones
 *   (calcOhm, calcSerie, calcParalelo, calcPotencia) estaban dentro del componente, así que este
 *   fichero era el único candado que veía la física. Desde el 28/09/2026 su aritmética vive en
 *   `motor.ts` (la validación sigue en la página), que comparten con los casos para clase del
 *   final de este fichero.
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
 *   CASO 16 · «0.xxx» se lee con el punto como decimal (un millar no empieza por 0). La regla
 *             no quedó en page.tsx sino en lib/formatters.ts (71003f60): AGRUPA_CON_PUNTO exige
 *             un primer grupo de 1 a 9, así que la app sigue llamando a parseSpanishNumber.
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

    // ── Parte B: EL MISMO circuito en formato español (hallazgo 868, REPARADO el 16/09/2026) ─
    // Mil, dos mil doscientos y mil quinientos ohmios se escriben así en español, y el proyecto
    // declara ese formato canónico (CLAUDE.md global §2). El resultado debe ser IDÉNTICO.
    await sembrarValor(page, resistencia(page, 0), '1.000');
    await sembrarValor(page, resistencia(page, 1), '2.200');
    await sembrarValor(page, resistencia(page, 2), '1.500');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // Mismo Req que en la parte A: 1000 + 2200 + 1500 = 4700 Ω.
    // Obtenido antes de la reparación: «4,700 Ω» — parseFloat('1.000') = 1, así que sumaba 1 + 2,2 + 1,5.
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('4700,000 Ω');
    // Y la corriente: 12 / 4700 = 0,0026 A. Obtenido antes de la reparación: «2,5532 A (2553,19 mA)».
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,0026 A (2,55 mA)');
    // La tabla enseñaba el desajuste en crudo: el campo mostraba «1.000» y la celda R, «1,00».
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
   * Obtenido el 18/09/2026 con «0,020»: V = 3000,0000 V, I = 20,0000 A, P = 60.000,0000 W. El
   * campo era `type="number"` y dejaba «0.020», que `parseSpanishNumber` leía como millar
   * español → 20 A. REPARADO (hallazgo 873): hoy los campos son type="text".
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
   * Obtenido el 18/09/2026 con 0,145: «40.020,0000 €» — el campo dejaba «0.145» y el parser
   * leía 145 €/kWh. REPARADO con el hallazgo 873.
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
    // produce ficha. Obtenido el 18/09/2026: ninguna alerta y un panel completo (hallazgo 874,
    // REPARADO).
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * simulador-circuitos-electricos · casos para clase (tarea de tipo A, 28/09/2026)
 *
 * Doce problemas de ley de Ohm, serie, paralelo, potencia y consumo. Los casos calculan SOLO con
 * `motor.ts`, que se EXTRAJO de los cuatro handlers de page.tsx sin tocar una operación (0
 * diferencias en 1.065.488 combinaciones contra el código original): lo que corrige la sección
 * y lo que pintan las pestañas sale de la misma función. La validación de campos y sus mensajes
 * siguen en la página, y los cubre el acta de arriba.
 *
 * CONVENIO DE ESTA APP: Req serie = ΣR · Req paralelo = 1/Σ(1/R) · P = V·I · kWh =
 * (P/1000)·horas·días · coste = kWh·tarifa, en «unidades monetarias» (la pestaña rotula €).
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, sin mirar la app):
 *   1 · V = 0,020·470                                                         = 9,4 V
 *   2 · I = 4,5/15                                                            = 0,3 A
 *   3 · R = 220/4                                                             = 55 Ω
 *   4 · Req = 10 + 22 + 47                                                    = 79 Ω
 *   5 · I = 12/4700 = 2,5532 mA; V₂ = 2,5532 mA·2,2 kΩ = 5,6170                → 5,62 V
 *   6 · I = 12/(6·4)                                                          = 0,5 A
 *   7 · Req = 1/(1/6 + 1/3) = 1/0,5                                           = 2 Ω
 *   8 · Req = 1/(1/12 + 1/12 + 1/6) = 3 Ω; I = 12/3                           = 4 A
 *   9 · I_lámpara = 220/440 = 0,5 A                                           = 500 mA
 *       (con I en A daría 0,5, que en la casilla de mA es otro número)
 *  10 · P = I²·R = 0,04·100                                                   = 4 W
 *  11 · P = 220·10 = 2.200 W; E = 2,2 kW·2 h·30                               = 132 kWh
 *  12 · P = 220²/484 = 100 W; E = 0,1·5·30 = 15 kWh; coste = 15·0,20          = 3,00
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_CASOS: Readonly<Record<number, number>> = {
  1: 9.4,
  2: 0.3,
  3: 55,
  4: 79,
  5: 5.62,
  6: 0.5,
  7: 2,
  8: 4,
  9: 500,
  10: 4,
  11: 132,
  12: 3,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («5,62 V» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

const redondeoCasos = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

test.describe('simulador-circuitos-electricos · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeoCasos(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // La moneda por su gentilicio: «peso» suelto es una palabra de física (plano inclinado).
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos|uruguayos)|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado} ${caso.etiquetaRespuesta}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto) || texto.includes('€'), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades|décima/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.pregunta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(redondeoCasos(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
    }
  });

  test('7 · el convenio queda fijado: ΣR, 1/Σ(1/R), P = V·I, kWh = P/1000·h·días', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_CASOS[caso.id]);
    }

    // (b) El motor extraído, con cifras de lápiz.
    expect(resolverSerie(9, [10, 22, 47]).Req).toBe(79);
    expect(resolverParalelo(12, [6, 3]).Req).toBeCloseTo(2, 12);
    const pot = resolverPotencia(220, NaN, 484, 5, 30, 0.2);
    expect(pot.ok).toBe(true);
    if (pot.ok) {
      expect(pot.resultado.P).toBeCloseTo(100, 10);
      expect(pot.resultado.energiaKwh).toBeCloseTo(15, 10);
      expect(pot.resultado.costeEuros).toBeCloseTo(3, 10);
    }
    // La terna que no cumple V = I·R se rechaza en el motor, como la rechazaba la página.
    expect(resolverPotencia(10, 2, 100, 1, 30, 0.18).ok).toBe(false);

    // (c) Los errores del tema NO entran: sumar resistencias en paralelo (caso 7 → 9 Ω) y
    //     dar la corriente en A en una casilla de mA (caso 9 → 0,5).
    const c = (id: number) => CASOS.find((x) => x.id === id)!;
    expect(comprobarRespuesta(9, 2, c(7).datos).correcto).toBe(false);
    expect(comprobarRespuesta(0.5, 500, c(9).datos).correcto).toBe(false);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    const c = (id: number) => CASOS.find((x) => x.id === id)!;
    expect(comprobarRespuesta(132, 132, c(11).datos).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, 5.62, c(5).datos).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 5.62, c(5).datos).motivo).not.toMatch(/NaN/);
    // Reescrito al reparar el hallazgo 2518 (30/09/2026). Antes fijaba la tolerancia vieja
    // (toleranciaDe(0) = 0,01 y toleranciaDe(500) = 5, el 1 % de la cifra), que es el defecto.
    // Ahora la da la pregunta: media unidad del redondeo pedido si la cifra exacta lo necesita
    // (caso 5: 12·2200/4700 = 5,617 → dos decimales → 0,005) y nada si es exacta (caso 9:
    // 220/440 A = 500 mA justos → 0).
    expect(toleranciaDe(c(5).datos)).toBeCloseTo(0.005, 12);
    expect(toleranciaDe(c(9).datos)).toBe(0);
    // Un caso sin datos que resolver no lanza: tolerancia 0 y la respuesta se corrige igual.
    expect(toleranciaDe({ pregunta: 'serieTension' })).toBe(0);
    // El fondo del test se conserva: el borde EXACTO de la tolerancia, por los dos lados
    // (hallazgo 1211 del 22/09/2026). Antes era 0,29/0,31 frente a 0,3 con el suelo de 0,01;
    // hoy 0,3 A es exacta y ese par queda fuera, así que el borde se mide donde sí hay margen:
    // 5,615 y 5,625 frente a 5,62, que redondean a 5,62 los dos (o a 5,63 el segundo, según el
    // desempate: los dos están a media centésima justa).
    expect(comprobarRespuesta(5.615, 5.62, c(5).datos).correcto).toBe(true);
    expect(comprobarRespuesta(5.625, 5.62, c(5).datos).correcto).toBe(true);
    expect(comprobarRespuesta(5.6149, 5.62, c(5).datos).correcto).toBe(false);
    expect(comprobarRespuesta(5.6251, 5.62, c(5).datos).correcto).toBe(false);
    expect(comprobarRespuesta(0.31, 0.3, c(2).datos).correcto).toBe(false);
    expect(comprobarRespuesta(0.29, 0.3, c(2).datos).correcto).toBe(false);
    expect(comprobarRespuesta(0.3, 0.3, c(2).datos).correcto).toBe(true);
  });
});

test.describe('simulador-circuitos-electricos · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 5 se corrige con 5,62 V', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('5,62');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');
  });

  test('dar amperios en la casilla de mA del caso 9 se rechaza y la solución enseña 500 mA', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 9:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('0,5');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('No es correcto');
    const solucion = seccion(page).getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(seccion(page).locator('#casos-solucion')).toContainText('500 mA');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 30/09/2026 — re-inspección tras 59198142 (casos para clase + motor.ts extraído)
 *
 * La app volvió a la cola INVALIDADA: la aritmética de las cuatro pestañas se trasladó a
 * motor.ts y se añadieron doce casos de aula que nunca se habían inspeccionado. Todo lo de
 * abajo se resolvió a lápiz ANTES de abrir el navegador, en escritorio y en 390×844 táctil.
 *
 *   CASO 23 (normal) — 100, 220 y 330 Ω a 12 V
 *     Serie:    Req = 650 Ω · I = 12/650 = 0,0184615 A = 18,4615 mA · P = 144/650 = 0,221538 W
 *               V₁ = 1,846154 · V₂ = 4,061538 · V₃ = 6,092308 V (suman 12)
 *               P₁ = I²·100 = 0,034083 · P₂ = 0,074982 · P₃ = 0,112473 W (suman 0,2215)
 *     Paralelo: 1/Req = 66/6600 + 30/6600 + 20/6600 = 116/6600 → Req = 56,896552 Ω
 *               I = 0,12 + 0,054545 + 0,036364 = 1392/6600 = 0,210909 A
 *               P = 1,44 + 0,654545 + 0,436364 = 16704/6600 = 2,530909 W
 *   CASO 24 (límite) — 5 V sobre 0,001 Ω: I = 5000 A = 5.000.000 mA, P = 25.000 W · el
 *     paralelo no baja de 2 resistencias · un aparato de 230 V y 8,7 A (P = 2001 W) 3,5 h al
 *     día durante 30 días: E = 2,001·3,5·30 = 210,105 kWh; a 0,1547 /kWh, 32,5032435.
 *   CASO 25 (rechazo) — R = 0 donde divide (I = V/R) · R negativa, vacía o «abc» en serie · y
 *     «1.500» NO se rechaza: es mil quinientos. 1500 + 220 + 330 = 2050 Ω, I = 12/2050 =
 *     0,0058537 A = 5,8537 mA, P = 144/2050 = 0,0702439 W.
 *
 *   Casos de aula resueltos a mano: 1 (Ohm, 0,020·470 = 9,4 V) · 5 (serie, 12·2200/4700 =
 *     5,617 → 5,62 V) · 7 (paralelo, 1/(1/6 + 1/3) = 2 Ω) · 9 (paralelo, 220/440 = 0,5 A =
 *     500 mA) · 11 (220·10·2·30/1000 = 132 kWh) · 12 (coste, 220²/484 = 100 W → 15 kWh ·
 *     0,20 = 3,00). Los doce «Verlo en el simulador», seguidos al pie de la letra, imprimen
 *     en el panel la cifra que prometen (CASO 30).
 *
 * HALLAZGOS 2518-2521, REPARADOS el 30/09/2026 (nacieron con cinco test.fail —el 28 tenía dos,
 * 28.b y 28.d—; hoy son regresión sin marca). Lo que se hizo, en una línea por caso:
 *   CASO 26 · «Horas de uso diario» por encima de 24 da aviso y ninguna ficha; 24 sigue valiendo.
 *   CASO 27 · la tensión de fuente de Serie y Paralelo pasa por motivoDeRechazo (motivoTension).
 *   CASO 28 · toleranciaDe(datos): media unidad del redondeo pedido si la cifra exacta lo
 *             necesita, 0 si es exacta. comprobarRespuesta recibe los datos del caso.
 *   CASO 29 · la frase del «1 %» desapareció con la tolerancia: la intro dice ahora que no hay
 *             margen porque los datos son exactos, y que se redondea solo al final.
 * Lo que decía el acta al abrirlos:
 *   CASO 26 · bajo  · «Horas de uso diario» admite 25 h: consumo de 1500,7500 kWh sin aviso.
 *   CASO 27 · bajo  · la tensión de fuente de Serie y Paralelo rechaza «1e3», «0», «abc» y el
 *                     vacío con el mismo «Tensión de fuente inválida.», cuando las R de al lado
 *                     nombran la causa (el patrón que cerró el hallazgo 875).
 *   CASO 28 · medio · la tolerancia del corrector es el 1 % de la respuesta, y con datos
 *                     exactos eso da por buenas cifras que ningún cálculo produce: 505 mA por
 *                     500, 133 kWh por 132, 5,57 V por 5,617. La que da la PREGUNTA es media
 *                     unidad del redondeo pedido (no hay error de lectura: los datos son exactos).
 *   CASO 29 · bajo  · «se acepta un margen del 1 %» lleva un espacio normal, no el duro (§2).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** El aviso de error de la app (no el anunciador de rutas de Next, que también es role=alert). */
const avisoApp = (page: Page): Locator => page.locator('main [role="alert"]').filter({ hasNotText: /Correcto|No es correcto|Escribe un número/ });

/** La ficha de resultados de la pestaña activa. */
const fichaApp = (page: Page): Locator => page.locator('div[role="status"]');

test.describe('Inspector 30/09/2026 · las cuatro pestañas tras extraer motor.ts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#ohm-a', '#ohm-b']);
  });

  test('CASO 23 · normal: 100, 220 y 330 Ω a 12 V, en serie y en paralelo', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['#serie-r1']);
    // TECLEADO tecla a tecla: así entra el dato de verdad
    await teclearComoUsuario(page, page.locator('#serie-r1'), '100');
    await teclearComoUsuario(page, page.locator('#serie-r2'), '220');
    await teclearComoUsuario(page, page.locator('#serie-r3'), '330');
    await teclearComoUsuario(page, page.locator('#serie-v'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // Req = 100 + 220 + 330 = 650 Ω (la serie imprime 3 decimales)
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('650,000 Ω');
    // I = 12/650 = 0,0184615 A → 0,0185 A · 18,4615 mA → 18,46 mA
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,0185 A (18,46 mA)');
    // P = V²/Req = 144/650 = 0,221538 W
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('0,2215 W');
    await expect(filas(page)).toHaveCount(3);
    // [R, V caída = I·R, I, P = I²·R] — las caídas suman 1,8462 + 4,0615 + 6,0923 = 12,0000 V
    const serie = [
      ['100,00', '1,8462 V', '0,0185', '0,0341'], // 12·100/650 = 1,846154 · 144·100/650² = 0,034083
      ['220,00', '4,0615 V', '0,0185', '0,0750'], // 12·220/650 = 4,061538 · 0,074982
      ['330,00', '6,0923 V', '0,0185', '0,1125'], // 12·330/650 = 6,092308 · 0,112473
    ];
    for (let i = 0; i < 3; i++) {
      const celdas = filas(page).nth(i).locator('td');
      for (let c = 0; c < 4; c++) await expect(celdas.nth(c + 1)).toHaveText(serie[i][c]);
    }

    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['#par-r1']);
    await teclearComoUsuario(page, page.locator('#par-r1'), '100');
    await teclearComoUsuario(page, page.locator('#par-r2'), '220');
    await teclearComoUsuario(page, page.locator('#par-r3'), '330');
    await teclearComoUsuario(page, page.locator('#par-v'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();

    // 1/Req = (66 + 30 + 20)/6600 = 116/6600 → Req = 56,896552 Ω (menor que la rama de 100 Ω)
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('56,8966 Ω');
    // I = 12·116/6600 = 0,210909 A
    await expect(valorDe(page, 'Corriente total (fuente)')).toHaveText('0,2109 A');
    // P = 144·116/6600 = 2,530909 W
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('2,5309 W');
    const paralelo = [
      ['100,00', '12,0000', '0,1200', '1,4400'], // 12/100 · 144/100
      ['220,00', '12,0000', '0,0545', '0,6545'], // 12/220 = 0,054545 · 144/220 = 0,654545
      ['330,00', '12,0000', '0,0364', '0,4364'], // 12/330 = 0,036364 · 144/330 = 0,436364
    ];
    for (let i = 0; i < 3; i++) {
      const celdas = filas(page).nth(i).locator('td');
      for (let c = 0; c < 4; c++) await expect(celdas.nth(c + 1)).toHaveText(paralelo[i][c]);
    }
  });

  test('CASO 24 · límite: 0,001 Ω, el paralelo mínimo y un consumo con tarifa de cuatro decimales', async ({ page }) => {
    // Ley de Ohm, I = V/R con una R diminuta: 5/0,001 = 5000 A = 5.000.000 mA · P = 5·5000 W
    await page.getByRole('button', { name: 'Calcular Corriente (I)', exact: true }).click();
    await teclearComoUsuario(page, page.locator('#ohm-a'), '5');
    await teclearComoUsuario(page, page.locator('#ohm-b'), '0,001');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(valorDe(page, 'Corriente (I)')).toHaveText('5000,0000 A — 5.000.000,00 mA');
    await expect(valorDe(page, 'Resistencia (R)')).toHaveText('0,0010 Ω');
    await expect(valorDe(page, 'Potencia disipada (P)')).toHaveText('25.000,0000 W');

    // Paralelo: el contador arranca en 3 y su mínimo es 2 — «Reducir» dos veces deja 2 campos
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['#par-r1']);
    await page.getByRole('button', { name: 'Reducir' }).click();
    await page.getByRole('button', { name: 'Reducir' }).click();
    await expect(page.locator('input[placeholder="Ω"]')).toHaveCount(2);

    // Potencia: 230 V · 8,7 A = 2001 W; 2,001 kW · 3,5 h · 30 días = 210,105 kWh;
    // 210,105 · 0,1547 = 32,5032435 → 32,5032
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    await esperarHidratacion(page, ['#pot-v']);
    await teclearComoUsuario(page, page.locator('#pot-v'), '230');
    await teclearComoUsuario(page, page.locator('#pot-i'), '8,7');
    await teclearComoUsuario(page, page.locator('#pot-horas'), '3,5');
    await teclearComoUsuario(page, page.locator('#pot-dias'), '30');
    await teclearComoUsuario(page, page.locator('#pot-tarifa'), '0,1547');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(valorDe(page, 'Potencia (P)')).toHaveText('2001,00 W');
    // R = 230/8,7 = 26,436782 Ω
    await expect(valorDe(page, 'Resistencia (R)')).toHaveText('26,4368 Ω');
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('210,1050 kWh');
    await expect(valorDe(page, 'Coste estimado')).toHaveText('32,5032 €');
    // La misma tarifa con el punto decimal de Latinoamérica: «0.1547» no agrupa millares
    await teclearComoUsuario(page, page.locator('#pot-tarifa'), '0.1547');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(valorDe(page, 'Coste estimado')).toHaveText('32,5032 €');
  });

  test('CASO 25 · rechazo: R = 0 donde divide, negativa, vacía o texto; y «1.500» es mil quinientos', async ({ page }) => {
    // I = V/R con R = 0: no hay corriente finita que enseñar
    await page.getByRole('button', { name: 'Calcular Corriente (I)', exact: true }).click();
    await teclearComoUsuario(page, page.locator('#ohm-a'), '12');
    await teclearComoUsuario(page, page.locator('#ohm-b'), '0');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(avisoApp(page)).toHaveText('Resistencia R (Ω): tiene que ser mayor que cero.');
    await expect(fichaApp(page)).toBeEmpty();

    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['#serie-r1']);
    await teclearComoUsuario(page, page.locator('#serie-r2'), '220');
    await teclearComoUsuario(page, page.locator('#serie-r3'), '330');
    await teclearComoUsuario(page, page.locator('#serie-v'), '12');
    for (const [r1, mensaje] of [
      ['-5', 'R1: tiene que ser mayor que cero.'],
      ['', 'R1: falta el valor.'],
      ['abc', 'R1: «abc» no es un número.'],
    ]) {
      await teclearComoUsuario(page, page.locator('#serie-r1'), r1);
      await page.getByRole('button', { name: 'Calcular circuito' }).click();
      await expect(avisoApp(page), `R1 = «${r1}»`).toHaveText(mensaje);
      await expect(fichaApp(page), `R1 = «${r1}»`).toBeEmpty();
    }

    // «1.500» con punto de millar NO se rechaza: 1500 + 220 + 330 = 2050 Ω
    await teclearComoUsuario(page, page.locator('#serie-r1'), '1.500');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(avisoApp(page)).toHaveCount(0);
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('2050,000 Ω');
    // I = 12/2050 = 0,0058537 A = 5,8537 mA · P = 144/2050 = 0,0702439 W
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,0059 A (5,85 mA)');
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('0,0702 W');
    await expect(filas(page).nth(0).locator('td').nth(1)).toHaveText('1500,00');
  });

  /**
   * CASO 26 (bajo, operativa) — REPARADO el 30/09/2026 (hallazgo 2519): por encima de 24 horas
   * la pestaña avisa y no publica ficha, como el resto de sus rechazos. Lo que decía el acta: «Horas de uso diario» acepta cualquier número de 0 o
   * más, así que un día de 25 horas da un consumo que ningún aparato puede tener. Es la cifra
   * DESTACADA del panel (el coste), la que el usuario se lleva.
   *   Esperado: 25 h al día se rechaza (un día tiene 24), sin ficha detrás.
   *   Obtenido: 2,001 kW · 25 h · 30 días = 1500,7500 kWh y 232,1660 €, sin aviso.
   */
  test('CASO 26 · un día de 25 horas de uso no puede dar un consumo', async ({ page }) => {
    await page.getByRole('button', { name: 'Potencia', exact: true }).click();
    await esperarHidratacion(page, ['#pot-v']);
    await teclearComoUsuario(page, page.locator('#pot-v'), '230');
    await teclearComoUsuario(page, page.locator('#pot-i'), '8,7');
    await teclearComoUsuario(page, page.locator('#pot-horas'), '24');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    // Control: 24 h sí existen (una nevera, un router), y la reparación tiene que seguir
    // admitiéndolas. 2,001 kW · 24 h · 30 días = 1440,72 kWh
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('1440,7200 kWh');

    await teclearComoUsuario(page, page.locator('#pot-horas'), '25');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(avisoApp(page)).toBeVisible({ timeout: 1500 });
    await expect(avisoApp(page)).toContainText('24 horas');
    await expect(fichaApp(page)).toBeEmpty();
  });

  /**
   * CASO 27 (bajo, operativa) — REPARADO el 30/09/2026 (hallazgo 2520): la tensión de fuente
   * pasa por el mismo motivoDeRechazo que las R. Lo que decía el acta: Los campos de resistencia de Serie y Paralelo pasan por
   * motivoDeRechazo y NOMBRAN la causa («notación científica… escribe 1000 en vez de 1e3»,
   * «tiene que ser mayor que cero»). La tensión de fuente de esas dos pestañas no: vacía, «0»,
   * «abc» y «1e3» reciben el mismo «Tensión de fuente inválida.». Es la forma del hallazgo 875
   * en el campo vecino.
   */
  test('CASO 27 · la tensión de fuente dice por qué la rechaza, como las R de al lado', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).click();
    await esperarHidratacion(page, ['#serie-r1']);
    await teclearComoUsuario(page, page.locator('#serie-r1'), '100');
    await teclearComoUsuario(page, page.locator('#serie-r2'), '220');
    await teclearComoUsuario(page, page.locator('#serie-r3'), '1e3');
    await teclearComoUsuario(page, page.locator('#serie-v'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    // Contraste, en verde: en una R, «1e3» se explica
    await expect(avisoApp(page)).toContainText('notación científica');

    await teclearComoUsuario(page, page.locator('#serie-r3'), '330');
    await teclearComoUsuario(page, page.locator('#serie-v'), '1e3');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(avisoApp(page)).toBeVisible();
    // Esperado: la misma explicación. Obtenía: «Tensión de fuente inválida.»
    await expect(avisoApp(page)).toContainText('notación científica', { timeout: 1500 });
    await expect(fichaApp(page)).toBeEmpty();
    // Los otros tres del acta, cada uno con su causa
    for (const [texto, causa] of [
      ['0', 'tiene que ser mayor que cero'],
      ['abc', 'no es un número'],
      ['', 'falta el valor'],
    ] as const) {
      await teclearComoUsuario(page, page.locator('#serie-v'), texto);
      await page.getByRole('button', { name: 'Calcular circuito' }).click();
      await expect(avisoApp(page), `tensión «${texto}»`).toContainText(`Tensión de fuente: `);
      await expect(avisoApp(page), `tensión «${texto}»`).toContainText(causa);
    }
    // Paralelo usa la misma función: el 0 también se explica allí
    await page.getByRole('button', { name: 'Paralelo', exact: true }).click();
    await esperarHidratacion(page, ['#par-r1']);
    await teclearComoUsuario(page, page.locator('#par-r1'), '100');
    await teclearComoUsuario(page, page.locator('#par-r2'), '220');
    await teclearComoUsuario(page, page.locator('#par-r3'), '330');
    await teclearComoUsuario(page, page.locator('#par-v'), '0');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(avisoApp(page)).toContainText('Tensión de fuente: tiene que ser mayor que cero');
    // Y el control: 12 V sí calcula (Req = 6600/116 = 56,896552 Ω, CASO 23)
    await teclearComoUsuario(page, page.locator('#par-v'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).click();
    await expect(avisoApp(page)).toHaveCount(0);
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('56,8966 Ω');
  });
});

/** Seis de los doce casos, resueltos a mano (cabecera del bloque). */
const A_MANO_30_09: Readonly<Record<number, number>> = { 1: 9.4, 5: 5.62, 7: 2, 9: 500, 11: 132, 12: 3 };

test.describe('Inspector 30/09/2026 · el corrector de los casos para clase', () => {
  test('CASO 28.a · acepta la respuesta redondeada como pide el enunciado y rechaza los errores del tema', async () => {
    const caso = (id: number) => CASOS.find((c) => c.id === id)!;
    for (const [id, valor] of Object.entries(A_MANO_30_09)) {
      expect(caso(Number(id)).respuesta, `caso ${id}`).toBe(valor);
    }
    // [caso, respuesta del alumno, ¿correcta?, de dónde sale]
    const PRUEBAS: [number, number, boolean, string][] = [
      [1, 9.4, true, '0,020 A · 470 Ω'],
      [1, 9400, false, 'los 20 mA sin pasar a amperios'],
      [5, 5.62, true, '12·2200/4700 = 5,617, a dos decimales'],
      [5, 5.617, true, 'la cifra que imprime el panel (5,6170 V)'],
      [5, 5.72, false, 'I redondeada a 0,0026 A antes de multiplicar'],
      [5, 8.25, false, 'divisor con R₁ + R₂ en vez de la suma de las tres'],
      [7, 2, true, '1/(1/6 + 1/3)'],
      [7, 9, false, 'sumar las resistencias en paralelo'],
      [7, 0.5, false, 'olvidar dar la vuelta a 1/Req'],
      [9, 500, true, '220/440 = 0,5 A = 500 mA'],
      [9, 0.5, false, 'amperios en la casilla de mA'],
      [9, 5500, false, 'la corriente total de la regleta'],
      [11, 132, true, '2,2 kW · 2 h · 30 días'],
      [11, 132000, false, 'Wh en vez de kWh'],
      [11, 4.4, false, 'sin multiplicar por los días'],
      [12, 3, true, '15 kWh · 0,20'],
      [12, 3000, false, 'W en vez de kW'],
      [12, 0.1, false, 'sin multiplicar por los días'],
      // Añadidos al reparar el 2518 (30/09/2026): redondear un paso INTERMEDIO saca la respuesta
      // del margen. La pista del caso 5 y la intro de la sección lo avisan («redondea solo al final»).
      [5, 5.61, false, 'I = 12/4700 redondeada a 2,55 mA: 0,00255·2200 = 5,61'],
      [5, 5.617, true, 'I con todos sus decimales: 0,0025532·2200 = 5,617'],
      [12, 2.97, false, 'I = 220/484 redondeada a 0,45 A: 99 W → 14,85 kWh → 2,97'],
    ];
    for (const [id, respuesta, correcta, porque] of PRUEBAS) {
      expect(comprobarRespuesta(respuesta, caso(id).respuesta, caso(id).datos).correcto, `caso ${id}: ${respuesta} (${porque})`).toBe(correcta);
    }
  });

  /**
   * CASO 28.b (medio, cálculo) — REPARADO el 30/09/2026 (hallazgo 2518): la tolerancia sale de
   * la pregunta (`toleranciaDe(datos)`), no del 1 % de la cifra. Lo que decía el acta: `toleranciaDe` es el mayor entre 0,01 y el 1 % de la
   * respuesta. Los datos de estos casos son EXACTOS (no hay tabla ni gráfica que leer), así que
   * la tolerancia que da la pregunta es media unidad del redondeo pedido; el 1 % de 500 mA son
   * 5 mA y el de 132 kWh, 1,32 kWh, y pasan enteros que ninguna cuenta produce. Ningún error
   * de concepto cae dentro (28.a), pero sí cifras que no existen. Mismo mecanismo que los
   * hallazgos 2149 y 2420 de otras apps de la familia.
   *   Esperado: rechazadas. Obtenido: «¡Correcto!» en las siete.
   * Práctica («Redondea a dos decimales» en todas): con la semilla 1 sale 6/(22 + 12) A =
   * 176,47 mA y pasa 177,47 (tolerancia 1,76 mA); con la 16, 6/20 A = 300 mA y pasa 301. Una
   * UNIDAD entera de desvío cuando se piden centésimas no sale de ningún redondeo intermedio;
   * medido el 30/09 en 20.000 semillas, pasa en el 66 % de las de corriente en serie.
   * ⚠️ Nada de este test fija cifras del generador: con test.fail, un fallo por otra causa lo
   * dejaría en verde aunque la tolerancia ya estuviera reparada.
   */
  test('CASO 28.b · con datos exactos no pasan cifras que ninguna cuenta produce', async () => {
    const caso = (id: number) => CASOS.find((c) => c.id === id)!;
    const NO_EXISTEN: [number, number, string][] = [
      [5, 5.57, '5,617 V: 5,57 no sale de ningún redondeo'],
      [5, 5.67, '5,617 V: 5,67 tampoco'],
      [9, 495, '500 mA exactos'],
      [9, 505, '500 mA exactos'],
      [11, 131, '132 kWh exactos'],
      [11, 133, '132 kWh exactos'],
      [12, 3.03, '3 exactos; redondeando I a 0,46 A saldría 3,04'],
    ];
    const aceptadas = NO_EXISTEN.filter(([id, r]) => comprobarRespuesta(r, caso(id).respuesta, caso(id).datos).correcto).map(
      ([id, r, p]) => `caso ${id}: ${r} (${p})`,
    );
    for (let semilla = 1; semilla <= 200; semilla++) {
      const e = generarEjercicioAleatorio(semilla);
      if ((e.datos.decimales ?? 2) === 2 && comprobarRespuesta(e.respuesta + 1, e.respuesta, e.datos).correcto) {
        aceptadas.push(`práctica semilla ${semilla}: ${e.respuesta + 1} por ${e.respuestaTexto}`);
      }
    }
    expect(aceptadas).toEqual([]);
  });

  /**
   * CASO 28.e — la otra mitad de la reparación del 2518: estrechar la tolerancia no puede
   * suspender una respuesta buena. En Practicar («Redondea a dos decimales») pasan la cifra
   * redondeada, la exacta del motor y la exacta con tres decimales (lo que se lee en un panel
   * que imprime cuatro y se redondea de más), en todas las semillas 1..500.
   */
  test('CASO 28.e · en Practicar pasa toda respuesta bien redondeada, y la exacta', async () => {
    const suspendidas: string[] = [];
    for (let semilla = 1; semilla <= 500; semilla++) {
      const e = generarEjercicioAleatorio(semilla);
      const exacta = resolverCaso(e.datos).valor;
      const tres = Math.round(exacta * 1000) / 1000;
      for (const [r, que] of [[e.respuesta, 'redondeada'], [exacta, 'exacta'], [tres, 'con tres decimales']] as const) {
        if (!comprobarRespuesta(r, e.respuesta, e.datos).correcto) suspendidas.push(`semilla ${semilla}: ${r} (${que}) por ${e.respuestaTexto}`);
      }
    }
    expect(suspendidas).toEqual([]);
  });
});

test.describe('Inspector 30/09/2026 · los casos para clase en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');
  const veredicto = (page: Page) => seccion(page).getByRole('alert');

  async function responder(page: Page, id: number, texto: string): Promise<void> {
    await seccion(page).getByRole('button', { name: new RegExp(`^Caso ${id}:`) }).click();
    await teclearComoUsuario(page, seccion(page).locator('#casos-respuesta'), texto);
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', '#ohm-a']);
  });

  test('CASO 28.c · tecleado: la respuesta buena pasa y el error de unidades no', async ({ page }) => {
    await responder(page, 1, '9,4'); // 0,020 A · 470 Ω
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await responder(page, 1, '9400'); // sin pasar mA a A
    await expect(veredicto(page)).toContainText('No es correcto');
    await responder(page, 7, '9'); // 6 + 3: sumar en paralelo
    await expect(veredicto(page)).toContainText('No es correcto');
    await responder(page, 12, '3,00'); // 15 kWh · 0,20
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await responder(page, 12, '3000'); // W en vez de kW
    await expect(veredicto(page)).toContainText('No es correcto');
  });

  /** CASO 28.b en pantalla: el entero vecino de 132 kWh exactos. REPARADO el 30/09/2026 (2518). */
  test('CASO 28.d · 133 kWh no es la energía del calentador del caso 11', async ({ page }) => {
    await responder(page, 11, '132'); // 220 V · 10 A · 2 h · 30 días / 1000
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await responder(page, 11, '133');
    // Esperado: rechazo. Obtenía: «✅ ¡Correcto!» (tolerancia 1,32 kWh)
    await expect(veredicto(page)).toContainText('No es correcto', { timeout: 1500 });
  });

  /**
   * CASO 29 (bajo, contenido) — REPARADO el 30/09/2026 (hallazgo 2521): la frase del margen se
   * reescribió con la tolerancia nueva y ya no lleva porcentaje. Lo que decía el acta: La intro dice «se acepta un margen del 1 %» con un
   * espacio normal (U+0020) entre la cifra y el %: el § 2 del CLAUDE.md global pide el duro
   * (U+00A0) desde el 25/09/2026, y la sección nació el 28/09. Si la frase desaparece al
   * reparar la tolerancia, este caso pasa a verde por sí solo y hay que quitarle la marca.
   */
  test('CASO 29 · el «1 %» de la intro va con espacio duro', async ({ page }) => {
    // Toda la sección, no un <p> concreto: un localizador que se desplazara pasaría a verde y
    // la marca se delataría sola, que es el lado seguro.
    const texto = (await seccion(page).textContent()) ?? '';
    expect(texto).not.toMatch(/\d %/);
  });

  /**
   * CASO 30 — cada caso trae «Verlo en el simulador»: qué teclear y en qué pestaña, y la cifra
   * que sale. Se sigue AL PIE DE LA LETRA en una página recién cargada (el estado de las
   * pestañas se conserva, y la instrucción parte del de arranque) y se lee esa cifra. Si el
   * motor o el formato cambian, el texto del caso quedaría mintiendo sin que nada lo dijera.
   */
  test('CASO 30 · los doce «Verlo en el simulador» dicen la verdad', async ({ page }) => {
    test.setTimeout(180_000);
    const boton = (n: string) => page.getByRole('button', { name: n, exact: true });
    const celda = (fila: number, col: number) => filas(page).nth(fila).locator('td').nth(col);
    const t = (sel: string, texto: string) => teclearComoUsuario(page, page.locator(sel), texto);
    const nueva = async (pestana?: string, testigo?: string) => {
      await page.goto(RUTA);
      await esperarHidratacion(page, ['#ohm-a']);
      if (pestana && testigo) {
        await boton(pestana).click();
        await esperarHidratacion(page, [testigo]);
      }
    };

    // 1 · 0,02 A · 470 Ω = 9,4 V
    await nueva(); await boton('Calcular Tensión (V)').click(); await t('#ohm-a', '0,02'); await t('#ohm-b', '470'); await boton('Calcular').click();
    await expect(valorDe(page, 'Tensión (V)')).toHaveText('9,4000 V');
    // 2 · 4,5/15 = 0,3 A
    await nueva(); await boton('Calcular Corriente (I)').click(); await t('#ohm-a', '4,5'); await t('#ohm-b', '15'); await boton('Calcular').click();
    await expect(valorDe(page, 'Corriente (I)')).toHaveText('0,3000 A — 300,00 mA');
    // 3 · 220/4 = 55 Ω
    await nueva(); await boton('Calcular Resistencia (R)').click(); await t('#ohm-a', '220'); await t('#ohm-b', '4'); await boton('Calcular').click();
    await expect(valorDe(page, 'Resistencia (R)')).toHaveText('55,0000 Ω');
    // 4 · 10 + 22 + 47 = 79 Ω
    await nueva('Serie', '#serie-r1'); await t('#serie-r1', '10'); await t('#serie-r2', '22'); await t('#serie-r3', '47'); await t('#serie-v', '9'); await boton('Calcular circuito').click();
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('79,000 Ω');
    // 5 · 12·2200/4700 = 5,617021 V en la fila R2
    await nueva('Serie', '#serie-r1'); await t('#serie-r1', '1000'); await t('#serie-r2', '2200'); await t('#serie-r3', '1500'); await t('#serie-v', '12'); await boton('Calcular circuito').click();
    await expect(celda(1, 2)).toHaveText('5,6170 V');
    // 6 · «+» tres veces: 6 × 4 Ω = 24 Ω → 12/24 = 0,5 A
    await nueva('Serie', '#serie-r1');
    for (let i = 0; i < 3; i++) await boton('Aumentar').click();
    for (let i = 1; i <= 6; i++) await t(`#serie-r${i}`, '4');
    await t('#serie-v', '12'); await boton('Calcular circuito').click();
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,5000 A (500,00 mA)');
    // 7 · «−» una vez: 6 ∥ 3 = 2 Ω
    await nueva('Paralelo', '#par-r1'); await boton('Reducir').click(); await t('#par-r1', '6'); await t('#par-r2', '3'); await t('#par-v', '12'); await boton('Calcular circuito').click();
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('2,0000 Ω');
    // 8 · 12 ∥ 12 ∥ 6 = 3 Ω → 12/3 = 4 A
    await nueva('Paralelo', '#par-r1'); await t('#par-r1', '12'); await t('#par-r2', '12'); await t('#par-r3', '6'); await t('#par-v', '12'); await boton('Calcular circuito').click();
    await expect(valorDe(page, 'Corriente total (fuente)')).toHaveText('4,0000 A');
    // 9 · «−» una vez: por la lámpara, 220/440 = 0,5 A (columna «I rama (A)», fila R2)
    await nueva('Paralelo', '#par-r1'); await boton('Reducir').click(); await t('#par-r1', '44'); await t('#par-r2', '440'); await t('#par-v', '220'); await boton('Calcular circuito').click();
    await expect(celda(1, 3)).toHaveText('0,5000');
    // 10 · tensión vacía: 0,2² · 100 = 4 W
    await nueva('Potencia', '#pot-v'); await t('#pot-i', '0,2'); await t('#pot-r', '100'); await boton('Calcular').click();
    await expect(valorDe(page, 'Potencia (P)')).toHaveText('4,00 W');
    // 11 · 2,2 kW · 2 h · 30 días = 132 kWh
    await nueva('Potencia', '#pot-v'); await t('#pot-v', '220'); await t('#pot-i', '10'); await t('#pot-horas', '2'); await t('#pot-dias', '30'); await boton('Calcular').click();
    await expect(valorDe(page, 'Consumo del periodo')).toHaveText('132,0000 kWh');
    // 12 · 220²/484 = 100 W → 0,1 · 5 · 30 = 15 kWh → 15 · 0,20 = 3
    await nueva('Potencia', '#pot-v'); await t('#pot-v', '220'); await t('#pot-r', '484'); await t('#pot-horas', '5'); await t('#pot-dias', '30'); await t('#pot-tarifa', '0,20'); await boton('Calcular').click();
    await expect(valorDe(page, 'Coste estimado')).toHaveText('3,0000 €');
  });
});

test.describe('Inspector 30/09/2026 · en móvil (390×844, táctil)', () => {
  // Enumerado, no `devices[…]`: dentro de un describe no debe forzar un worker nuevo.
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#ohm-a', '#casos-respuesta']);
  });

  test('CASO 31 · la serie del CASO 23 y el caso 9 de aula, con el dedo', async ({ page }) => {
    await page.getByRole('button', { name: 'Serie', exact: true }).tap();
    await esperarHidratacion(page, ['#serie-r1']);
    await teclearComoUsuario(page, page.locator('#serie-r1'), '100');
    await teclearComoUsuario(page, page.locator('#serie-r2'), '220');
    await teclearComoUsuario(page, page.locator('#serie-r3'), '330');
    await teclearComoUsuario(page, page.locator('#serie-v'), '12');
    await page.getByRole('button', { name: 'Calcular circuito' }).tap();
    // Req = 650 Ω · I = 12/650 = 18,4615 mA · P = 144/650 = 0,221538 W
    await expect(valorDe(page, 'Resistencia equivalente')).toHaveText('650,000 Ω');
    await expect(valorDe(page, 'Corriente total')).toHaveText('0,0185 A (18,46 mA)');
    await expect(valorDe(page, 'Potencia total disipada')).toHaveText('0,2215 W');

    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 9:/ }).tap();
    await teclearComoUsuario(page, seccion.locator('#casos-respuesta'), '0,5'); // A en la casilla de mA
    await seccion.getByRole('button', { name: 'Comprobar' }).tap();
    await expect(seccion.getByRole('alert')).toContainText('No es correcto');
    await teclearComoUsuario(page, seccion.locator('#casos-respuesta'), '500'); // 220/440 A = 500 mA
    await seccion.getByRole('button', { name: 'Comprobar' }).tap();
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');
  });
});

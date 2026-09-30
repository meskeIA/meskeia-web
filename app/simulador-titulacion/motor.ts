/**
 * Motor químico de `simulador-titulacion` — el pH de una valoración ácido-base, sin React ni
 * DOM.
 *
 * Vive aquí, y no en `page.tsx`, porque lo usan DOS consumidores que no pueden divergir: el
 * simulador (panel «Estado actual», curva y aviso del indicador) y la corrección de los
 * «Casos para clase» (`casos.ts`). Si cada uno calculase con su propia copia, la app podría
 * suspender un pH que ella misma acaba de mostrar, que es el peor fallo posible en algo que
 * corrige a un alumno.
 *
 * Convenio (el de la app): siempre se valora un ÁCIDO (analito) con una BASE (titulante).
 * Volúmenes en mL, concentraciones en mol/L.
 *
 * ── UN SOLO BALANCE DE CARGAS, NO UNA FÓRMULA POR TRAMO (30/09/2026) ──────────────────────
 *
 * Hasta el 30/09/2026 `calcularPH` encadenaba las aproximaciones de libro, una por tramo
 * (−log del ácido sobrante, cuadrática del tampón con un «techo», 7 ± ½(pK + log C) en la
 * equivalencia, Henderson-Hasselbalch sobre el pOH después) y cada una fallaba donde dejaba
 * de valer su supuesto. En las costuras entre tramos la curva BAJABA al añadir base:
 *   · AD+BD de fábrica: 7,01 en V_eq y 6,86 una gota después (hallazgo 2512).
 *   · AF+BD con pKb 9,4: 3,70 → 2,95 → 2,20 al cruzar V_eq, y con pKb 12 un pH de −0,40, por
 *     debajo del HCl de partida (2513).
 *   · AD+BF con pKa 9,2: 10,95 → 10,30 una gota pasada la equivalencia, por despreciar el OH⁻
 *     de la hidrólisis del anión frente a una base sobrante que aún es menor que él (2514).
 *   · Las fórmulas 7 ± ½(pK + log C) no llevan Kw, y con pK bajo cruzaban el 7 hacia el lado
 *     equivocado: la sal de un ácido débil salía ÁCIDA (6,85 con pKa 1) (2515).
 * Era la misma clase de defecto que el valle del hallazgo 343, remendado entonces con un tope.
 *
 * Ahora hay UNA ecuación para todo el ensayo, la electroneutralidad de la disolución:
 *
 *     [H⁺] + [catión de la base] = [anión del ácido] + [OH⁻]
 *
 *   · ácido fuerte → [Cl⁻] = C_a            · ácido débil → [A⁻]  = C_a · Ka / ([H⁺] + Ka)
 *   · base fuerte  → [Na⁺] = C_b            · base débil  → [BH⁺] = C_b · [H⁺] / ([H⁺] + Ka')
 *   · [OH⁻] = Kw/[H⁺], con Kw = 10⁻¹⁴ y Ka' = Kw/Kb, el Ka del ácido conjugado BH⁺
 *   · C_a = n_ácido / V_total y C_b = n_base / V_total: las concentraciones ya diluidas
 *
 * El lado izquierdo menos el derecho CRECE con [H⁺] (cada término lo hace), así que tiene una
 * sola raíz, y se busca por bisección en pH. Y la raíz se mueve siempre en el mismo sentido al
 * añadir base: a [H⁺] fija, derivar C_a·α − C_b·β respecto de V da −(C_t·β·V_a + n_a·α)/V_tot²,
 * negativo, así que [H⁺] baja y el pH SUBE. La curva es continua y monótona POR CONSTRUCCIÓN,
 * en los cuatro tipos y con cualquier pK de los deslizadores.
 *
 * Casos resueltos a mano antes de escribir esto (acético 0,1 M · 25 mL, pKa 4,76, NaOH 0,1 M):
 *   V = 0       [H⁺]² + Ka·[H⁺] − Ka·C = 0 → 1,3096·10⁻³ M          → pH 2,8829 → 2,88
 *   V = 12,5    semiequivalencia: C_A⁻ = C_HA = 0,0333 M → [H⁺] ≈ Ka   → pH 4,7605 → 4,76
 *   V = 25      acetato 0,05 M: [OH⁻]² = Kb·C + Kw = 2,877·10⁻¹¹       → pH 8,7295 → 8,73
 * y fuerte con fuerte en la equivalencia: [H⁺] = [OH⁻] = 10⁻⁷ → 7 EXACTO (forma cerrada abajo).
 */

export type TipoTitulacion = 'af-bf' | 'ad-bf' | 'af-bd' | 'ad-bd';

/** Producto iónico del agua a 25 °C. */
const KW = 1e-14;

/**
 * Volumen de titulante (mL) que neutraliza exactamente el analito: n(ácido) = n(base), así
 * que V_eq = C_analito · V_analito / C_titulante. Con C_titulante = 0 devuelve Infinity.
 */
export function volumenEquivalencia(C_analito: number, V_analito: number, C_titulante: number): number {
  return (C_analito * V_analito) / C_titulante;
}

/**
 * pH que cumple el balance de cargas para unas concentraciones YA diluidas.
 *
 * Con ácido y base fuertes el balance es [H⁺] − Kw/[H⁺] = C_a − C_b, una cuadrática con forma
 * cerrada: se resuelve así para que la equivalencia dé 7 EXACTO y no 7 ± el ruido de la
 * bisección. La raíz se escribe de la forma que no resta dos números casi iguales.
 */
function phPorBalance(
  acidoDebil: boolean,
  baseDebil: boolean,
  Ca: number,
  Cb: number,
  pKa: number,
  pKb: number
): number {
  if (!acidoDebil && !baseDebil) {
    const delta = Ca - Cb;
    if (delta === 0) return 7;
    const raiz = Math.sqrt(delta * delta + 4 * KW);
    const H = delta > 0 ? (delta + raiz) / 2 : (2 * KW) / (raiz - delta);
    return -Math.log10(H);
  }

  const Ka = Math.pow(10, -pKa);
  const KaConjugado = KW / Math.pow(10, -pKb);

  /** Cargas positivas menos negativas: crece con [H⁺], así que tiene una sola raíz. */
  const exceso = (H: number): number => {
    const cation = baseDebil ? (Cb * H) / (H + KaConjugado) : Cb;
    const anion = acidoDebil ? (Ca * Ka) / (H + Ka) : Ca;
    return H + cation - anion - KW / H;
  };

  // pH entre −2 y 16 abarca de sobra lo que permiten los deslizadores (concentraciones de
  // 0,01 a 1 M, pK de 1 a 12). 80 mitades dejan el intervalo por debajo de 10⁻²³: el límite
  // lo pone ya la precisión del doble, no el número de pasos.
  let pHbajo = -2; // [H⁺] alta → exceso > 0
  let pHalto = 16; // [H⁺] baja → exceso < 0
  for (let i = 0; i < 80; i++) {
    const medio = (pHbajo + pHalto) / 2;
    if (exceso(Math.pow(10, -medio)) > 0) pHbajo = medio;
    else pHalto = medio;
  }
  return (pHbajo + pHalto) / 2;
}

/**
 * Calcula el pH a un volumen V (mL) de titulante añadido para un escenario dado.
 *
 * `pKa` solo interviene con ácido débil y `pKb` solo con base débil: en los otros tipos se
 * ignoran (los casos para clase pasan NaN en el que no aplica).
 */
export function calcularPH(
  tipo: TipoTitulacion,
  V_titulante: number,
  V_analito: number,
  C_analito: number,
  C_titulante: number,
  pKa: number,
  pKb: number
): number {
  const V_total = V_analito + Math.max(0, V_titulante);
  // mmol / mL = mol/L: las concentraciones de todo lo que hay en el matraz, ya diluidas.
  const Ca = (C_analito * V_analito) / V_total;
  const Cb = (C_titulante * Math.max(0, V_titulante)) / V_total;
  const acidoDebil = tipo === 'ad-bf' || tipo === 'ad-bd';
  const baseDebil = tipo === 'af-bd' || tipo === 'ad-bd';
  return phPorBalance(acidoDebil, baseDebil, Ca, Cb, pKa, pKb);
}

/**
 * Volumen de titulante (mL) al que la valoración llega a un pH dado, o `null` si no lo alcanza
 * entre 0 y `V_max`. Invierte `calcularPH` por bisección, que vale porque la curva es monótona
 * creciente (ver la cabecera). Si el pH ya se ha superado antes de añadir nada, devuelve 0.
 *
 * Lo usa el aviso del indicador: dónde EMPIEZA y dónde TERMINA de virar, en mL.
 */
export function volumenParaPH(
  pHObjetivo: number,
  V_max: number,
  tipo: TipoTitulacion,
  V_analito: number,
  C_analito: number,
  C_titulante: number,
  pKa: number,
  pKb: number
): number | null {
  const ph = (v: number) => calcularPH(tipo, v, V_analito, C_analito, C_titulante, pKa, pKb);
  if (ph(0) >= pHObjetivo) return 0;
  if (ph(V_max) < pHObjetivo) return null;
  let bajo = 0;
  let alto = V_max;
  for (let i = 0; i < 60; i++) {
    const medio = (bajo + alto) / 2;
    if (ph(medio) < pHObjetivo) bajo = medio;
    else alto = medio;
  }
  return (bajo + alto) / 2;
}

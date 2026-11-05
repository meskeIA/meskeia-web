/**
 * Motor de pH de tabla-ka-kb: balance de cargas (condición protónica) con Kw, sin dependencias.
 *
 * ⚠️ 05/11/2026 — hallazgos 4116-4119 del Inspector. Hasta hoy la página resolvía
 * x² + K·x − K·C = 0 sin el agua (y en los fuertes [H₃O⁺] = C), así que:
 *   · un ácido muy diluido salía con pH > 7 y una base con pH < 7 (HCl 10⁻⁸ M → 8,00; cabo C0086);
 *   · los aniones anfóteros (HCO₃⁻, H₂PO₄⁻, HPO₄²⁻…) se calculaban como si solo fueran ácidos
 *     (NaHCO₃ 0,1 M → 5,66 en vez de 8,35);
 *   · el H₂SO₄ ignoraba su segunda disociación (0,01 M → 2,00 en vez de 1,84);
 *   · el tampón aplicaba Henderson-Hasselbalch a ácidos de Ka grande (TCA 0,1/0,1 → 0,66 en vez
 *     de 1,24).
 * Las cuatro cosas son el mismo cálculo: la condición protónica de un sistema ácido-base con
 * todas sus constantes, que es una función CRECIENTE de [H₃O⁺] y se resuelve por bisección.
 *
 * Un sistema es una «familia» de constantes Ka₁ > Ka₂ > … (H_nA, H_{n−1}A⁻, …, Aⁿ⁻) y un nivel
 * de referencia q: la especie que se disuelve es la que ha perdido q protones. Con esa
 * referencia la condición protónica es
 *     [H₃O⁺] − Kw/[H₃O⁺] + C·(q − n̄) = 0,
 * donde n̄ = Σ j·α_j es el número medio de protones cedidos por la familia a ese pH. Casos:
 *   · ácido débil HA: familia [Ka], q = 0 → [H⁺] = C·Ka/([H⁺]+Ka) + Kw/[H⁺]
 *   · base débil B: familia [Kw/Kb] (la de BH⁺), q = 1
 *   · anfótero NaHA: familia [Ka₁, Ka₂], q = 1
 *   · ácido fuerte: familia vacía, q = −1 → [H⁺] = (C + √(C² + 4Kw))/2
 *   · base fuerte con n OH⁻: familia vacía, q = n
 *   · H₂SO₄: familia [Ka₂], q = −1 (la 1.ª disociación es completa)
 * Una mezcla (tampón) suma una condición por componente con su propio q.
 */

export const KW = 1.0e-14;

export interface Componente {
  /** Concentración analítica, mol/L. */
  concentracion: number;
  /** Protones cedidos por la especie disuelta respecto a la más protonada de la familia. */
  q: number;
}

/**
 * Número medio de protones cedidos por una familia de constantes a una [H₃O⁺] dada.
 * Con la familia vacía (ácido o base fuerte) es 0.
 */
export function protonesCedidos(h: number, kas: readonly number[]): number {
  const n = kas.length;
  if (n === 0) return 0;
  // t_j = Π_{i≤j} Ka_i / h^j, normalizado para no desbordar: se trabaja con logaritmos.
  const logs: number[] = [0];
  let acumulado = 0;
  for (let j = 1; j <= n; j++) {
    acumulado += Math.log(kas[j - 1]) - Math.log(h);
    logs.push(acumulado);
  }
  const maximo = Math.max(...logs);
  let suma = 0;
  let ponderada = 0;
  logs.forEach((l, j) => {
    const t = Math.exp(l - maximo);
    suma += t;
    ponderada += j * t;
  });
  return ponderada / suma;
}

/** Condición protónica: crece con h; su raíz es la [H₃O⁺] del sistema. */
function condicion(h: number, kas: readonly number[], componentes: readonly Componente[]): number {
  const nMedio = protonesCedidos(h, kas);
  let total = h - KW / h;
  for (const c of componentes) total += c.concentracion * (c.q - nMedio);
  return total;
}

/**
 * [H₃O⁺] del sistema, por bisección en escala logarítmica entre 10⁻²⁰ y 10³ M. La condición es
 * monótona, así que la raíz es única; 200 pasos dejan el error muy por debajo de lo que se pinta.
 */
export function resolverH(kas: readonly number[], componentes: readonly Componente[]): number {
  let bajo = -20;
  let alto = 3;
  for (let i = 0; i < 200; i++) {
    const medio = (bajo + alto) / 2;
    if (condicion(Math.pow(10, medio), kas, componentes) > 0) alto = medio;
    else bajo = medio;
  }
  return Math.pow(10, (bajo + alto) / 2);
}

/** pH de una sola especie de la familia, disuelta a concentración C. */
export function phDeEspecie(kas: readonly number[], q: number, concentracion: number): number {
  return -Math.log10(resolverH(kas, [{ concentracion, q }]));
}

/**
 * pH de un tampón: el ácido (nivel q) a Ca y su base conjugada (nivel q + 1) a Cb, sin
 * aproximar: Cb + [H⁺] = (Ca + Cb)·Ka/([H⁺] + Ka) + Kw/[H⁺] en el caso monoprótico.
 */
export function phDeTampon(kas: readonly number[], q: number, ca: number, cb: number): number {
  return -Math.log10(
    resolverH(kas, [
      { concentracion: ca, q },
      { concentracion: cb, q: q + 1 },
    ]),
  );
}

/**
 * ¿Proporción base/ácido dentro del rango útil 1/10 – 10? Sobre |log₁₀| con tolerancia: 0,01/0,1
 * vale 0,09999999999999999 en coma flotante y el borde de abajo quedaba fuera (hallazgo 4120).
 */
export function proporcionEnRangoUtil(proporcion: number): boolean {
  return Math.abs(Math.log10(proporcion)) <= 1 + 1e-9;
}

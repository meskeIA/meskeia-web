/**
 * Motor físico de `simulador-campo-electrico` — la ley de Coulomb y el principio de
 * superposición, sin React ni DOM.
 *
 * Vive aquí, y no en `page.tsx`, porque lo usan DOS consumidores que no pueden divergir: el
 * panel de la sonda del simulador y la corrección de los «Casos para clase» (`casos.ts`). Si
 * cada uno calculara con su propia copia, la app podría suspender una respuesta que ella misma
 * acaba de mostrar, que es el peor fallo posible en algo que corrige a un alumno.
 *
 * Todo se trasladó de `page.tsx` el 23/09/2026 SIN cambiar comportamiento ni firma: mismas
 * constantes, mismo orden de operaciones, misma guardia de singularidad. Las únicas funciones
 * nuevas —`fuerzaSobreCarga`, `energiaPotencial` y `modulo`— son las expresiones que el panel
 * escribía en línea (F = q₀·E, U = q₀·V, |E| = √(Eₓ² + Eᵧ²)), sacadas tal cual para que los
 * casos las usen también.
 *
 * Convenio de unidades (el de la app): cargas en nC, distancias en metros, E en N/C, V en
 * voltios, F en newtons y U en julios.
 */

/* ─────────────────────────── Constantes físicas ─────────────────────────── */

/** Constante de Coulomb en N·m²/C². Es el valor que declara la guía de la app. */
export const K_COULOMB = 8.99e9; // N·m²/C²

/** 1 nC = 10⁻⁹ C: las cargas se introducen en nanoculombios. */
export const NC_TO_C = 1e-9;

/**
 * Radio alrededor de cada carga donde E y V divergen y no hay cifra que dar.
 *
 * La guardia estaba —hay que saltarse el término, o sale Infinity— pero no se decía: se
 * presentaba el campo de LAS DEMÁS cargas como si fuese el del punto, con el mismo formato y
 * sin ningún aviso. Sobre una carga de +5 nC de un dipolo, el panel daba «44,95 N/C» y un
 * potencial NEGATIVO, que son los de la otra carga. Y soltar la sonda encima es un gesto
 * natural: mide 10 px de radio y la carga 17.
 */
export const RADIO_SINGULARIDAD = 0.05; // m

/* ─────────────────────────── Tipos ─────────────────────────── */

/** Una carga puntual: posición en metros y carga en nC (con signo). */
export interface CargaPuntual {
  x: number;
  y: number;
  q: number;
}

export interface CampoEnPunto {
  Ex: number;
  Ey: number;
  V: number;
  singular: boolean;
}

/* ─────────────────────────── Campo y potencial ─────────────────────────── */

/**
 * Campo (Ex, Ey) en N/C y potencial V en voltios en el punto (x, y), por superposición de
 * todas las cargas.
 *
 * El vector de cada término es (punto − carga), así que con q > 0 el campo se ALEJA de la
 * carga y con q < 0 apunta HACIA ella. Las cargas a menos de `radioCorte` del punto se
 * saltan y se marca `singular`: ahí no hay cifra que dar.
 *
 * `radioCorte` vale RADIO_SINGULARIDAD salvo para el DIBUJO de las equipotenciales, que corta
 * a 0,08 m para no amontonar trazos junto a cada carga. Se pasa aquí en vez de repetir la
 * fórmula del potencial en la vista, que es lo que se hacía hasta el 23/09/2026.
 */
export function calcularCampoEnPunto(
  x: number,
  y: number,
  cargas: readonly CargaPuntual[],
  radioCorte: number = RADIO_SINGULARIDAD,
): CampoEnPunto {
  let Ex = 0;
  let Ey = 0;
  let V = 0;
  let singular = false;
  for (const c of cargas) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    if (r < radioCorte) {
      singular = true;
      continue;
    }
    const qC = c.q * NC_TO_C;
    const factor = (K_COULOMB * qC) / (r2 * r); // E = kq/r² · r̂
    Ex += factor * dx;
    Ey += factor * dy;
    V += (K_COULOMB * qC) / r;
  }
  return { Ex, Ey, V, singular };
}

/** Módulo de un vector plano: √(ax² + ay²), con la misma expresión que usaba el panel. */
export function modulo(ax: number, ay: number): number {
  return Math.sqrt(ax * ax + ay * ay);
}

/* ─────────────────────────── Sobre una carga de prueba ─────────────────────────── */

/**
 * Fuerza sobre una carga de prueba `qPruebaNc` (en nC, con signo) colocada donde el campo vale
 * (Ex, Ey): F = q₀·E. Devuelve newtons. Con q₀ negativa la fuerza va en sentido CONTRARIO al
 * campo, y eso lo lleva el signo, no un caso aparte.
 */
export function fuerzaSobreCarga(
  qPruebaNc: number,
  Ex: number,
  Ey: number,
): { Fx: number; Fy: number; F: number } {
  const q0 = qPruebaNc * NC_TO_C;
  const Fx = q0 * Ex;
  const Fy = q0 * Ey;
  return { Fx, Fy, F: modulo(Fx, Fy) };
}

/** Energía potencial de una carga de prueba `qPruebaNc` (nC) donde el potencial vale V: U = q₀·V, en julios. */
export function energiaPotencial(qPruebaNc: number, V: number): number {
  return qPruebaNc * NC_TO_C * V;
}

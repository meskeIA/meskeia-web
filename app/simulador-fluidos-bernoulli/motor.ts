/**
 * Motor físico del simulador de fluidos (Bernoulli + continuidad).
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]): una tabla con cifras plausibles pasa
 * cualquier compilación. Aquí no hay React ni DOM, solo funciones puras.
 *
 * ── Por qué existe este fichero (23/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha el cálculo vivía dentro de un `useMemo` de `page.tsx`. Se TRASLADÓ aquí, sin
 * tocar una sola operación, para que la sección «Casos para clase» (`./casos.ts`) corrija con
 * la MISMA aritmética que pinta la tabla de secciones. Si la tabla calculara de una manera y los
 * casos de otra, la app podría suspender una respuesta que ella misma acaba de imprimir, que es
 * el peor fallo posible en algo que corrige a un alumno.
 *
 * Las expresiones conservan el orden exacto de las operaciones del `useMemo` original
 * (`Math.PI * (d / 2) * (d / 2)`, `P0 + 0.5 * rho * (v0 * v0 - v * v) + rho * G * (h0 - h)`),
 * para que ni una cifra de la pantalla cambie por redondeo binario.
 *
 * ── El convenio de la app ────────────────────────────────────────────────────
 *
 *   · La presión es ABSOLUTA: la de entrada arranca en 1 atm (101.325 Pa), y por eso el aviso de
 *     cavitación habla de «presión absoluta negativa». La manométrica sería P − 101.325 Pa.
 *   · g = 9,81 m/s².
 *   · El caudal se introduce en L/s y se calcula en m³/s (1 L/s = 0,001 m³/s).
 *   · El diámetro nominal de la tubería es 10 cm; el estrechamiento es una FRACCIÓN de él.
 *   · Las alturas se miden desde el eje de la sección de entrada (h₁ = 0).
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Gravedad que usa la app (m/s²). Los casos que dependen de ella la declaran siempre. */
export const G = 9.81;

/** Presión atmosférica normal (Pa). Es el valor de referencia que cita el bloque educativo. */
export const P_ATMOSFERICA = 101325;

/** Diámetro nominal de la tubería (m): 10 cm en la entrada y la salida de las tres geometrías. */
export const DIAMETRO_NOMINAL = 0.1;

// ─── Fluidos ──────────────────────────────────────────────────────────────────

export type GeomId = 'venturi' | 'desnivel' | 'estenosis';
export type FluidoId = 'agua' | 'aceite' | 'sangre' | 'aire';

export interface Fluido {
  id: FluidoId;
  nombre: string;
  rho: number; // kg/m³
}

export const FLUIDOS: Fluido[] = [
  { id: 'agua', nombre: 'Agua', rho: 1000 },
  { id: 'aceite', nombre: 'Aceite', rho: 920 },
  { id: 'sangre', nombre: 'Sangre', rho: 1060 },
  { id: 'aire', nombre: 'Aire', rho: 1.225 },
];

/** El fluido de un id. Nunca devuelve `undefined`: si el id no existe, cae al agua. */
export function fluidoPorId(id: FluidoId): Fluido {
  return FLUIDOS.find(f => f.id === id) ?? FLUIDOS[0];
}

// ─── Secciones ────────────────────────────────────────────────────────────────

export interface SeccionData {
  id: string;
  nombre: string;
  x: number; // px en la tubería
  ancho: number; // ancho de la tubería en este punto (m)
  altura: number; // altura del tubo en m respecto a referencia
}

/** Una sección con su área (m²), su velocidad media (m/s) y su presión absoluta (Pa). */
export interface SeccionCalculada extends SeccionData {
  A: number;
  v: number;
  P: number;
}

export function getSecciones(geom: GeomId, ratioEstrechamiento: number, alturaDesnivel: number): SeccionData[] {
  // ratioEstrechamiento: factor por el que se reduce el ancho en la zona estrecha (0,25-1,
  // el recorrido del deslizador)
  const D0 = DIAMETRO_NOMINAL; // diámetro nominal en m (10 cm)
  const D_estrecho = D0 * ratioEstrechamiento;

  if (geom === 'venturi') {
    return [
      { id: '1', nombre: 'Entrada', x: 0.05, ancho: D0, altura: 0 },
      { id: '2', nombre: 'Garganta', x: 0.50, ancho: D_estrecho, altura: 0 },
      { id: '3', nombre: 'Salida', x: 0.95, ancho: D0, altura: 0 },
    ];
  }
  if (geom === 'desnivel') {
    return [
      { id: '1', nombre: 'Inferior', x: 0.10, ancho: D0, altura: 0 },
      { id: '2', nombre: 'Subida', x: 0.50, ancho: D0, altura: alturaDesnivel * 0.5 },
      { id: '3', nombre: 'Superior', x: 0.90, ancho: D0, altura: alturaDesnivel },
    ];
  }
  // estenosis (vena con estrechamiento brusco)
  return [
    { id: '1', nombre: 'Pre-estenosis', x: 0.15, ancho: D0, altura: 0 },
    { id: '2', nombre: 'Estenosis', x: 0.50, ancho: D_estrecho, altura: 0 },
    { id: '3', nombre: 'Post-estenosis', x: 0.85, ancho: D0, altura: 0 },
  ];
}

// ─── Primitivas ───────────────────────────────────────────────────────────────

/** Paso de L/s a m³/s: 1 L/s = 0,001 m³/s. */
export function litrosPorSegundoAM3s(caudalLs: number): number {
  return caudalLs / 1000;
}

/** Área de una sección circular a partir de su diámetro: A = π·(D/2)², en m². */
export function areaCircular(diametro: number): number {
  return Math.PI * (diametro / 2) * (diametro / 2);
}

/** Continuidad: la velocidad media en una sección es v = Q/A (m/s). */
export function velocidadMedia(caudalM3s: number, area: number): number {
  return caudalM3s / area;
}

/**
 * Bernoulli entre la sección de referencia (1) y otra (i), despejando la presión de la i:
 *
 *     P_i = P₁ + ½·ρ·(v₁² − v_i²) + ρ·g·(h₁ − h_i)
 */
export function presionBernoulli(
  P1: number,
  rho: number,
  v1: number,
  h1: number,
  v: number,
  h: number,
  g: number = G,
): number {
  return P1 + 0.5 * rho * (v1 * v1 - v * v) + rho * g * (h1 - h);
}

/**
 * Área, velocidad y presión de cada sección. Es el `useMemo` que la página tenía dentro,
 * trasladado tal cual: la primera sección es la de referencia y su presión es la de entrada.
 */
export function calcularSecciones(
  secciones: readonly SeccionData[],
  caudalM3s: number,
  rho: number,
  P0: number,
  g: number = G,
): SeccionCalculada[] {
  return secciones.map((s, idx) => {
    const A = areaCircular(s.ancho); // m²
    const v = velocidadMedia(caudalM3s, A); // m/s
    // Bernoulli desde sección 0:
    // P1 + ½ρv1² + ρgh1 = P_i + ½ρv_i² + ρgh_i
    let P: number;
    if (idx === 0) {
      P = P0;
    } else {
      const A0 = areaCircular(secciones[0].ancho);
      const v0 = velocidadMedia(caudalM3s, A0);
      const h0 = secciones[0].altura;
      P = presionBernoulli(P0, rho, v0, h0, v, s.altura, g);
    }
    return { ...s, A, v, P };
  });
}

/** Caudal másico: ṁ = ρ·Q, en kg/s. */
export function caudalMasico(caudalM3s: number, rho: number): number {
  return caudalM3s * rho;
}

/** La presión más baja de las secciones: la que decide si el modelo sigue siendo válido. */
export function presionMinima(datos: readonly SeccionCalculada[]): number {
  return Math.min(...datos.map(d => d.P));
}

/** P₂ − P₁: la diferencia que destaca la tarjeta grande del panel (de la 1.ª a la 2.ª sección). */
export function diferenciaPresion(datos: readonly SeccionCalculada[]): number {
  if (datos.length < 2) return 0;
  return datos[1].P - datos[0].P;
}

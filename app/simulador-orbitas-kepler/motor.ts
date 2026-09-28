/**
 * Motor de mecánica orbital del simulador de órbitas y leyes de Kepler.
 *
 * Vive aparte de la vista porque el build compila la página sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]): un periodo con cifras plausibles pasa
 * cualquier compilación. Aquí no hay React ni DOM, solo constantes, datos y funciones puras.
 *
 * ── Por qué existe este fichero (28/09/2026) ─────────────────────────────────
 *
 * Hasta esa fecha todo esto vivía en `page.tsx`, y el cálculo de la órbita dentro de un
 * `useMemo`. Se TRASLADÓ aquí, sin tocar una sola operación, para que la sección «Casos para
 * clase» (`./casos.ts`) corrija con la MISMA aritmética que pinta el panel de resultados. Si el
 * panel calculara de una manera y los casos de otra, la app podría suspender una respuesta que
 * ella misma acaba de imprimir, que es el peor fallo posible en algo que corrige a un alumno.
 *
 * `calcularOrbita` es el cuerpo de aquel `useMemo` tal cual: el mismo clamp del semieje
 * (≥ 1 km) y de la excentricidad (0-0,99), y las expresiones en el mismo orden
 * (`2 * Math.PI * Math.sqrt((a * a * a) / mu)`…), para que ni una cifra de la pantalla cambie
 * por redondeo binario.
 *
 * ── La «Media orbital» (hallazgo 2333, 28/09/2026) ────────────────────────────
 *
 * Con el traslado llegó también `vMedia = 2πa/T`, que es √(μ/a): el perímetro de una
 * CIRCUNFERENCIA de radio a entre el periodo. Repetía siempre la fila «Circular a r = a» y, en
 * cuanto la órbita se alarga, sobrestimaba la velocidad media: +1,1 % en Mercurio, +18,4 % en
 * Molniya y +46,2 % en Halley. La velocidad media de verdad es el camino recorrido entre el
 * tiempo, L/T, con L el perímetro de la ELIPSE (`perimetroElipse`), que es también lo que la
 * NASA publica como «mean orbital velocity» (Mercurio: 47,36 km/s; aquí 47,368). En e = 0
 * L = 2πa y la fila vuelve a coincidir con la circular, como debe.
 */

// ============================================================
// Constantes físicas
// ============================================================
export const G = 6.674e-11; // m³/(kg·s²) — constante de gravitación universal (CODATA 2018)
export const UA = 1.495978707e11; // m — unidad astronómica (definición IAU 2012)
export const DIA = 86400; // s
export const ANIO = 365.25 * DIA; // s — año juliano

/**
 * Excentricidad máxima que admite el simulador: el motor la capa aquí, el deslizador de
 * `page.tsx` llega hasta aquí y `configuracionSimulador` (casos.ts) la usa como tope de su
 * rejilla. Hasta el 28/09/2026 el deslizador se quedaba en 0,95 y el Cometa Halley (e = 0,967)
 * no cabía en él: el control anunciaba 0,95 y «←» saltaba a 0,949 (hallazgo 2339).
 */
export const EXCENTRICIDAD_MAX = 0.99;

// ============================================================
// Tipos
// ============================================================
export interface CuerpoCentral {
  id: string;
  nombre: string;
  icono: string;
  masa: number; // kg
  radio: number; // m
  /** Nombre del punto más cercano al cuerpo central */
  peri: string;
  /** Nombre del punto más lejano */
  apo: string;
  /** Semieje por defecto al cambiar de cuerpo, en km */
  semiejeDefecto: number;
}

export interface OrbitaPreset {
  id: string;
  nombre: string;
  /** Semieje mayor en km */
  semiejeKm: number;
  excentricidad: number;
  nota: string;
}

export interface Orbita {
  /** Semieje mayor en metros */
  a: number;
  /** Semieje menor en metros */
  b: number;
  periodo: number; // s
  rPeri: number; // m
  rApo: number; // m
  vPeri: number; // m/s
  vApo: number; // m/s
  vCircular: number; // m/s — velocidad de una órbita circular de radio a
  vEscapePeri: number; // m/s — velocidad de escape desde el periastro
  /** m/s — velocidad media en el tiempo: perímetro de la elipse entre el periodo (L/T) */
  vMedia: number;
  energiaEspecifica: number; // J/kg
  energiaTotal: number; // J
  constanteKepler: number; // s²/m³ — T²/a³
  chocaSuperficie: boolean;
}

// ============================================================
// Cuerpos centrales
// Masas y radios medios: NASA Planetary Fact Sheet
// ============================================================
export const CUERPOS: CuerpoCentral[] = [
  {
    id: 'sol',
    nombre: 'Sol',
    icono: '☀️',
    masa: 1.989e30,
    radio: 6.957e8,
    peri: 'Perihelio',
    apo: 'Afelio',
    semiejeDefecto: 149_598_000,
  },
  {
    id: 'tierra',
    nombre: 'Tierra',
    icono: '🌍',
    masa: 5.972e24,
    radio: 6.371e6,
    peri: 'Perigeo',
    apo: 'Apogeo',
    semiejeDefecto: 42_164,
  },
  {
    id: 'marte',
    nombre: 'Marte',
    icono: '🔴',
    masa: 6.417e23,
    radio: 3.3895e6,
    peri: 'Periastro',
    apo: 'Apoastro',
    semiejeDefecto: 9_376,
  },
  {
    id: 'jupiter',
    nombre: 'Júpiter',
    icono: '🪐',
    masa: 1.898e27,
    radio: 6.9911e7,
    peri: 'Periastro',
    apo: 'Apoastro',
    semiejeDefecto: 421_800,
  },
];

// ============================================================
// Órbitas reales predefinidas (elementos orbitales medios)
// ============================================================
export const PRESETS: Record<string, OrbitaPreset[]> = {
  sol: [
    { id: 'mercurio', nombre: 'Mercurio', semiejeKm: 57_909_000, excentricidad: 0.2056, nota: 'La órbita planetaria más excéntrica del sistema solar' },
    { id: 'venus', nombre: 'Venus', semiejeKm: 108_208_000, excentricidad: 0.0068, nota: 'La órbita más circular de los ocho planetas' },
    { id: 'tierra', nombre: 'Tierra', semiejeKm: 149_598_000, excentricidad: 0.0167, nota: 'Por definición, 1 UA y un año de periodo' },
    { id: 'marte', nombre: 'Marte', semiejeKm: 227_956_000, excentricidad: 0.0935, nota: 'Su excentricidad permitió a Kepler descubrir la elipse' },
    { id: 'jupiter', nombre: 'Júpiter', semiejeKm: 778_479_000, excentricidad: 0.0489, nota: 'Casi 12 años terrestres por vuelta' },
    { id: 'neptuno', nombre: 'Neptuno', semiejeKm: 4_495_060_000, excentricidad: 0.0086, nota: 'Descubierto en 1846; aún no ha dado dos vueltas desde entonces' },
    { id: 'halley', nombre: 'Cometa Halley', semiejeKm: 2_667_950_000, excentricidad: 0.967, nota: 'Excentricidad extrema: cruza desde dentro de Venus hasta más allá de Neptuno' },
  ],
  tierra: [
    { id: 'iss', nombre: 'ISS', semiejeKm: 6_798, excentricidad: 0.0003, nota: 'Órbita baja a unos 420 km de altitud' },
    { id: 'gps', nombre: 'GPS', semiejeKm: 26_560, excentricidad: 0, nota: 'Órbita media: media vuelta al día sidéreo' },
    { id: 'geo', nombre: 'Geoestacionaria', semiejeKm: 42_164, excentricidad: 0, nota: 'El periodo coincide con el día sidéreo y el satélite parece quieto' },
    { id: 'molniya', nombre: 'Molniya', semiejeKm: 26_600, excentricidad: 0.74, nota: 'Muy excéntrica: pasa la mayor parte del tiempo sobre latitudes altas' },
    // Hallazgo 2335 (28/09/2026): la nota daba «27,3 días» bajo un veredicto de 27,45 sin decir
    // por qué. El motor usa μ = G·M, como las leyes de Kepler de clase, y la Luna tiene el 1,23 %
    // de la masa terrestre (NASA Moon Fact Sheet: 7,346·10²² kg). Con μ = G·(M + m) sale
    // T = 27,2856 días. No se cambia el motor: «la masa del satélite no influye en el periodo»
    // es lo que enseña la app (FAQ y casos), y la Luna es justo el ejemplo de dónde deja de valer.
    {
      id: 'luna',
      nombre: 'Luna',
      semiejeKm: 384_400,
      excentricidad: 0.0549,
      nota: 'El satélite natural. Su periodo sidéreo real es de 27,32 días, algo menos de lo que marca el simulador: T = 2π·√(a³/GM) trata al satélite como si no tuviera masa, y la Luna tiene el 1,2\u00A0% de la masa de la Tierra. Con G·(M + m) en lugar de G·M salen 27,29 días.',
    },
  ],
  marte: [
    { id: 'phobos', nombre: 'Fobos', semiejeKm: 9_376, excentricidad: 0.0151, nota: 'Da tres vueltas al día marciano; se acerca lentamente al planeta' },
    { id: 'deimos', nombre: 'Deimos', semiejeKm: 23_463, excentricidad: 0.0002, nota: 'El satélite más pequeño y exterior de Marte' },
  ],
  jupiter: [
    { id: 'io', nombre: 'Ío', semiejeKm: 421_800, excentricidad: 0.0041, nota: 'El cuerpo con más actividad volcánica del sistema solar' },
    { id: 'europa', nombre: 'Europa', semiejeKm: 671_100, excentricidad: 0.009, nota: 'Océano de agua líquida bajo la corteza de hielo' },
    // Hallazgo 2334 (28/09/2026): la resonancia de Laplace 1:2:4 es de Ío, Europa y GANIMEDES
    // (1,77 · 3,55 · 7,16 días en este simulador); Calisto (16,69 días) no forma parte de ella.
    { id: 'ganimedes', nombre: 'Ganimedes', semiejeKm: 1_070_400, excentricidad: 0.0013, nota: 'El satélite más grande del sistema solar. Tarda el doble que Europa y el cuádruple que Ío: los tres forman la resonancia 1:2:4' },
    { id: 'calisto', nombre: 'Calisto', semiejeKm: 1_882_700, excentricidad: 0.0074, nota: 'El más exterior de los cuatro satélites galileanos y uno de los cuerpos con más cráteres del sistema solar' },
  ],
};

/** El cuerpo central de un id, o `undefined` si no es uno de los cuatro de la app. */
export function cuerpoPorId(id: string): CuerpoCentral | undefined {
  return CUERPOS.find((c) => c.id === id);
}

// ============================================================
// Ecuación de Kepler: M = E − e·sen E, resuelta por Newton-Raphson
// Da la posición real en el tiempo, no un giro a velocidad constante:
// de ahí sale la segunda ley (áreas iguales en tiempos iguales).
// ============================================================
export function resolverKepler(anomaliaMedia: number, e: number): number {
  let E = e < 0.8 ? anomaliaMedia : Math.PI;
  for (let i = 0; i < 80; i++) {
    const f = E - e * Math.sin(E) - anomaliaMedia;
    const derivada = 1 - e * Math.cos(E);
    const paso = f / derivada;
    E -= paso;
    if (Math.abs(paso) < 1e-12) break;
  }
  return E;
}

// ============================================================
// Perímetro de la elipse: L = 4a·E(e)
// ============================================================
/**
 * Perímetro de una elipse de semieje mayor `a` y excentricidad `e`, en las unidades de `a`.
 *
 * L = 4a·E(e), con E la integral elíptica completa de segunda especie, que no tiene expresión
 * cerrada. Se calcula por la media aritmético-geométrica de Gauss:
 *   a₀ = 1, g₀ = √(1 − e²), c₀ = e;  aₙ₊₁ = (aₙ + gₙ)/2, gₙ₊₁ = √(aₙ·gₙ), cₙ₊₁ = (aₙ − gₙ)/2
 *   K(e) = π / (2·a∞)      E(e) = K(e)·(1 − Σₙ 2ⁿ⁻¹·cₙ²)
 * La convergencia es cuadrática (cada vuelta duplica las cifras correctas): con e = 0,99 bastan
 * cinco vueltas para la precisión de un double. Casos resueltos a mano por integración numérica
 * (Simpson, 200.000 intervalos) antes de escribirla: L/a = 4,298062 (e = 0,967, Halley),
 * 5,305102 (e = 0,74, Molniya), 6,216250 (e = 0,2056, Mercurio) y 2π (e = 0).
 */
export function perimetroElipse(a: number, e: number): number {
  let media = 1;
  let geometrica = Math.sqrt(1 - e * e);
  let suma = (e * e) / 2; // n = 0: 2⁻¹·c₀²
  let peso = 1; // 2ⁿ⁻¹ para n = 1
  for (let i = 0; i < 40; i++) {
    const c = (media - geometrica) / 2;
    const siguiente = (media + geometrica) / 2;
    geometrica = Math.sqrt(media * geometrica);
    media = siguiente;
    suma += peso * c * c;
    peso *= 2;
    if (Math.abs(c) < 1e-17) break;
  }
  const K = Math.PI / (2 * media);
  return 4 * a * K * (1 - suma);
}

// ============================================================
// Mecánica orbital: el `useMemo` de `orbita` de page.tsx, trasladado tal cual
// (salvo `vMedia`, corregida el 28/09/2026: ver la cabecera)
// ============================================================
export function calcularOrbita(
  semiejeKm: number,
  excentricidad: number,
  cuerpo: CuerpoCentral,
  masaSatelite: number,
): Orbita {
  const a = Math.max(semiejeKm, 1) * 1000; // m
  const e = Math.min(Math.max(excentricidad, 0), EXCENTRICIDAD_MAX);
  const mu = G * cuerpo.masa; // parámetro gravitacional estándar

  const b = a * Math.sqrt(1 - e * e);
  const periodo = 2 * Math.PI * Math.sqrt((a * a * a) / mu);
  const rPeri = a * (1 - e);
  const rApo = a * (1 + e);

  // Ecuación vis-viva: v = √(μ·(2/r − 1/a))
  const vPeri = Math.sqrt(mu * (2 / rPeri - 1 / a));
  const vApo = Math.sqrt(mu * (2 / rApo - 1 / a));
  const vCircular = Math.sqrt(mu / a);
  const vEscapePeri = Math.sqrt((2 * mu) / rPeri);

  return {
    a,
    b,
    periodo,
    rPeri,
    rApo,
    vPeri,
    vApo,
    vCircular,
    vEscapePeri,
    // Camino recorrido entre tiempo empleado (hallazgo 2333): no 2πa/T, que es la circular.
    vMedia: perimetroElipse(a, e) / periodo,
    energiaEspecifica: -mu / (2 * a),
    energiaTotal: (-mu * Math.max(masaSatelite, 0)) / (2 * a),
    constanteKepler: (periodo * periodo) / (a * a * a),
    chocaSuperficie: rPeri < cuerpo.radio,
  };
}

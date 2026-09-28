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
 */

// ============================================================
// Constantes físicas
// ============================================================
export const G = 6.674e-11; // m³/(kg·s²) — constante de gravitación universal (CODATA 2018)
export const UA = 1.495978707e11; // m — unidad astronómica (definición IAU 2012)
export const DIA = 86400; // s
export const ANIO = 365.25 * DIA; // s — año juliano

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
  vMedia: number; // m/s
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
    { id: 'luna', nombre: 'Luna', semiejeKm: 384_400, excentricidad: 0.0549, nota: 'El satélite natural: 27,3 días de periodo sidéreo' },
  ],
  marte: [
    { id: 'phobos', nombre: 'Fobos', semiejeKm: 9_376, excentricidad: 0.0151, nota: 'Da tres vueltas al día marciano; se acerca lentamente al planeta' },
    { id: 'deimos', nombre: 'Deimos', semiejeKm: 23_463, excentricidad: 0.0002, nota: 'El satélite más pequeño y exterior de Marte' },
  ],
  jupiter: [
    { id: 'io', nombre: 'Ío', semiejeKm: 421_800, excentricidad: 0.0041, nota: 'El cuerpo con más actividad volcánica del sistema solar' },
    { id: 'europa', nombre: 'Europa', semiejeKm: 671_100, excentricidad: 0.009, nota: 'Océano de agua líquida bajo la corteza de hielo' },
    { id: 'ganimedes', nombre: 'Ganimedes', semiejeKm: 1_070_400, excentricidad: 0.0013, nota: 'El satélite más grande del sistema solar' },
    { id: 'calisto', nombre: 'Calisto', semiejeKm: 1_882_700, excentricidad: 0.0074, nota: 'Completa la resonancia 1:2:4 con Ío y Europa' },
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
// Mecánica orbital: el `useMemo` de `orbita` de page.tsx, trasladado tal cual
// ============================================================
export function calcularOrbita(
  semiejeKm: number,
  excentricidad: number,
  cuerpo: CuerpoCentral,
  masaSatelite: number,
): Orbita {
  const a = Math.max(semiejeKm, 1) * 1000; // m
  const e = Math.min(Math.max(excentricidad, 0), 0.99);
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
    vMedia: (2 * Math.PI * a) / periodo,
    energiaEspecifica: -mu / (2 * a),
    energiaTotal: (-mu * Math.max(masaSatelite, 0)) / (2 * a),
    constanteKepler: (periodo * periodo) / (a * a * a),
    chocaSuperficie: rPeri < cuerpo.radio,
  };
}

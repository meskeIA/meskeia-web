/**
 * Conversor de Unidades — lógica pura sin React ni DOM
 * Usada por: MCP server (convertir_unidades)
 *
 * Soporta 13 categorías: longitud, masa, temperatura, área, volumen,
 * tiempo, velocidad, datos, química, presión, energía, fuerza, potencia.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type CategoriaUnidad =
  | 'longitud' | 'masa' | 'temperatura' | 'area' | 'volumen'
  | 'tiempo' | 'velocidad' | 'datos' | 'presion' | 'energia' | 'fuerza' | 'potencia';

export interface ParametrosConversorUnidades {
  /** Valor a convertir */
  valor: number;
  /** Categoría de la conversión */
  categoria: CategoriaUnidad;
  /** Unidad de origen */
  unidadOrigen: string;
  /** Unidad destino */
  unidadDestino: string;
}

export interface ResultadoConversorUnidades {
  /** Valor original */
  valorOrigen: number;
  /** Unidad de origen */
  unidadOrigen: string;
  /** Valor convertido */
  valorDestino: number;
  /** Unidad destino */
  unidadDestino: string;
  /** Categoría */
  categoria: CategoriaUnidad;
  /** Factor de conversión (origen → SI → destino) */
  factorConversion: number;
  /** Fórmula de conversión */
  formula: string;
}

// ─── Tablas de conversión (factor a unidad SI) ─────────────────────────────────

// Longitud → metro (m)
const LONGITUD: Record<string, number> = {
  m: 1, km: 1000, cm: 0.01, mm: 0.001, um: 1e-6, nm: 1e-9,
  mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852,
  au: 1.495978707e11, ly: 9.4607304725808e15,
};

// Masa → kilogramo (kg)
const MASA: Record<string, number> = {
  kg: 1, g: 0.001, mg: 1e-6, ug: 1e-9, t: 1000,
  lb: 0.45359237, oz: 0.028349523125, st: 6.35029318,
  gr: 0.00006479891, ct: 0.0002,
};

// Área → metro cuadrado (m²)
const AREA: Record<string, number> = {
  m2: 1, km2: 1e6, cm2: 0.0001, mm2: 1e-6,
  ha: 10000, a: 100,
  mi2: 2589988.110336, yd2: 0.83612736, ft2: 0.09290304, in2: 0.00064516,
  acre: 4046.8564224,
};

// Volumen → metro cúbico (m³)
const VOLUMEN: Record<string, number> = {
  m3: 1, l: 0.001, ml: 1e-6, cl: 1e-5, dl: 0.0001,
  cm3: 1e-6, mm3: 1e-9, km3: 1e9,
  gal: 0.003785411784, qt: 0.000946352946, pt: 0.000473176473, cup: 0.000236588236,
  floz: 2.95735296e-5, tbsp: 1.47867648e-5, tsp: 4.92892159e-6,
  ft3: 0.028316846592, in3: 1.6387064e-5,
};

// Tiempo → segundo (s)
const TIEMPO: Record<string, number> = {
  s: 1, ms: 0.001, us: 1e-6, ns: 1e-9,
  min: 60, h: 3600, d: 86400, semana: 604800,
  mes: 2592000, ano: 31557600,
};

// Velocidad → metro por segundo (m/s)
const VELOCIDAD: Record<string, number> = {
  ms: 1, kms: 1000, kmh: 1 / 3.6, mph: 0.44704, fps: 0.3048, kn: 0.514444,
  mach: 343,
};

// Datos → byte (B)
const DATOS: Record<string, number> = {
  b: 0.125, B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4,
  PB: 1024 ** 5, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4,
  Kb: 125, Mb: 125000, Gb: 125000000,
};

// Presión → pascal (Pa)
const PRESION: Record<string, number> = {
  Pa: 1, kPa: 1000, MPa: 1e6, bar: 1e5, mbar: 100,
  atm: 101325, torr: 133.322, mmHg: 133.322, psi: 6894.757, inHg: 3386.389,
};

// Energía → julio (J)
const ENERGIA: Record<string, number> = {
  J: 1, kJ: 1000, MJ: 1e6, GJ: 1e9,
  cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3600000,
  BTU: 1055.06, eV: 1.60218e-19, erg: 1e-7,
};

// Fuerza → newton (N)
const FUERZA: Record<string, number> = {
  N: 1, kN: 1000, MN: 1e6, mN: 0.001, uN: 1e-6,
  lbf: 4.44822, kgf: 9.80665, dyn: 1e-5,
};

// Potencia → vatio (W)
const POTENCIA: Record<string, number> = {
  W: 1, kW: 1000, MW: 1e6, GW: 1e9, mW: 0.001,
  hp: 745.69987, cv: 735.49875, BTUh: 0.293071, kcalh: 1.16279,
};

const TABLAS: Record<CategoriaUnidad, Record<string, number>> = {
  longitud: LONGITUD, masa: MASA, area: AREA, volumen: VOLUMEN,
  tiempo: TIEMPO, velocidad: VELOCIDAD, datos: DATOS,
  presion: PRESION, energia: ENERGIA, fuerza: FUERZA, potencia: POTENCIA,
  temperatura: {}, // caso especial
};

// ─── Temperatura (caso especial, no lineal) ────────────────────────────────────

function convertirTemperatura(valor: number, origen: string, destino: string): number {
  // Convertir a Celsius primero
  let celsius: number;
  switch (origen) {
    case 'C':  celsius = valor; break;
    case 'F':  celsius = (valor - 32) * 5 / 9; break;
    case 'K':  celsius = valor - 273.15; break;
    case 'R':  celsius = (valor - 491.67) * 5 / 9; break; // Rankine
    default: throw new Error(`Unidad de temperatura desconocida: ${origen}`);
  }
  // Convertir de Celsius al destino
  switch (destino) {
    case 'C':  return celsius;
    case 'F':  return celsius * 9 / 5 + 32;
    case 'K':  return celsius + 273.15;
    case 'R':  return (celsius + 273.15) * 9 / 5;
    default: throw new Error(`Unidad de temperatura desconocida: ${destino}`);
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function convertirUnidades(p: ParametrosConversorUnidades): ResultadoConversorUnidades {
  if (isNaN(p.valor)) throw new Error('El valor a convertir no es un número válido.');

  const redP = (n: number) => {
    if (Math.abs(n) >= 1e-3 && Math.abs(n) < 1e9) return Math.round(n * 1e10) / 1e10;
    return n;
  };

  if (p.categoria === 'temperatura') {
    const valorDestino = convertirTemperatura(p.valor, p.unidadOrigen, p.unidadDestino);
    const formula = `${p.valor} ${p.unidadOrigen} → ${redP(valorDestino)} ${p.unidadDestino}`;
    return {
      valorOrigen: p.valor,
      unidadOrigen: p.unidadOrigen,
      valorDestino: redP(valorDestino),
      unidadDestino: p.unidadDestino,
      categoria: p.categoria,
      factorConversion: 0, // no aplica para temperatura
      formula,
    };
  }

  const tabla = TABLAS[p.categoria];
  if (!tabla) throw new Error(`Categoría desconocida: ${p.categoria}`);

  const factorOrigen = tabla[p.unidadOrigen];
  const factorDestino = tabla[p.unidadDestino];

  if (factorOrigen === undefined) throw new Error(`Unidad "${p.unidadOrigen}" no reconocida en ${p.categoria}.`);
  if (factorDestino === undefined) throw new Error(`Unidad "${p.unidadDestino}" no reconocida en ${p.categoria}.`);

  const factorConversion = factorOrigen / factorDestino;
  const valorDestino = redP(p.valor * factorConversion);

  const formula = `${p.valor} ${p.unidadOrigen} × ${factorConversion} = ${valorDestino} ${p.unidadDestino}`;

  return {
    valorOrigen: p.valor,
    unidadOrigen: p.unidadOrigen,
    valorDestino,
    unidadDestino: p.unidadDestino,
    categoria: p.categoria,
    factorConversion: redP(factorConversion),
    formula,
  };
}

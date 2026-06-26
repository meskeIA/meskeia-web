// Conversión de temperatura de horno — lógica pura
//
// Las recetas en inglés dan la temperatura en °F (EE. UU.) o en "gas mark" (Reino
// Unido e Irlanda), y muchas tablas no incluyen el equivalente para horno de
// ventilador (aire forzado), que va más caliente y necesita ~20 °C menos. Aquí se
// reúne todo: °C ↔ °F ↔ gas mark, ajuste para ventilador y nivel descriptivo.
//
// Tabla de gas mark: referencia estándar británica. Regla del ventilador: el aire
// forzado equivale a una convencional unos 20 °C por encima (recomendación común
// de fabricantes; redondeada). Verificado: 2026-06.

export interface MarcaGas {
  gas: string; // '1/4', '1', '4', '9'…
  c: number; // °C convencional
  f: number; // °F
}

// Escala de gas mark con sus equivalencias estándar.
export const MARCAS_GAS: MarcaGas[] = [
  { gas: '¼', c: 110, f: 225 },
  { gas: '½', c: 130, f: 250 },
  { gas: '1', c: 140, f: 275 },
  { gas: '2', c: 150, f: 300 },
  { gas: '3', c: 170, f: 325 },
  { gas: '4', c: 180, f: 350 },
  { gas: '5', c: 190, f: 375 },
  { gas: '6', c: 200, f: 400 },
  { gas: '7', c: 220, f: 425 },
  { gas: '8', c: 230, f: 450 },
  { gas: '9', c: 240, f: 475 },
];

export function celsiusAFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fahrenheitACelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

// Gas mark más cercano a una temperatura en °C.
export function gasMarkCercano(c: number): MarcaGas {
  return MARCAS_GAS.reduce((mejor, m) =>
    Math.abs(m.c - c) < Math.abs(mejor.c - c) ? m : mejor,
  );
}

// Horno de ventilador (aire forzado): ~20 °C menos que la convencional.
export function celsiusVentilador(c: number): number {
  return Math.round((c - 20) / 5) * 5;
}

// ─── Nivel descriptivo del horno ──────────────────────────────────────────────

export interface NivelHorno {
  nombre: string;
  usos: string;
}

const NIVELES: { hasta: number; nivel: NivelHorno }[] = [
  { hasta: 135, nivel: { nombre: 'Muy suave', usos: 'Merengues, secar frutas, mantener caliente, deshidratar.' } },
  { hasta: 155, nivel: { nombre: 'Suave', usos: 'Cocción lenta, flanes al baño maría, guisos largos.' } },
  { hasta: 175, nivel: { nombre: 'Moderado', usos: 'Bizcochos, magdalenas, galletas, bizcochuelos.' } },
  { hasta: 195, nivel: { nombre: 'Medio', usos: 'Tartas, pan de molde, asados suaves, brownies.' } },
  { hasta: 215, nivel: { nombre: 'Medio-alto', usos: 'Pan, hojaldre, asados de carne, verduras al horno.' } },
  { hasta: 235, nivel: { nombre: 'Fuerte', usos: 'Pizza, pan de corteza, gratinados rápidos.' } },
  { hasta: Infinity, nivel: { nombre: 'Muy fuerte', usos: 'Pizza napolitana, dorar al final, pan rústico de alta temperatura.' } },
];

export function nivelHorno(c: number): NivelHorno {
  return (NIVELES.find((n) => c < n.hasta) ?? NIVELES[NIVELES.length - 1]).nivel;
}

// ─── Conversión completa desde cualquier unidad ───────────────────────────────

export type UnidadEntrada = 'celsius' | 'fahrenheit' | 'gas';

export interface ResultadoTemperatura {
  celsius: number;
  fahrenheit: number;
  gas: MarcaGas;
  ventilador: number;
  nivel: NivelHorno;
}

/**
 * Convierte una temperatura introducida en cualquier unidad a todas las demás.
 * Para gas mark, `valor` es el índice (0-based) dentro de MARCAS_GAS.
 */
export function convertirTemperatura(
  unidad: UnidadEntrada,
  valor: number,
): ResultadoTemperatura | null {
  let celsius: number;

  if (unidad === 'celsius') {
    celsius = valor;
  } else if (unidad === 'fahrenheit') {
    celsius = fahrenheitACelsius(valor);
  } else {
    const marca = MARCAS_GAS[valor];
    if (!marca) return null;
    celsius = marca.c;
  }

  if (!(celsius > 0) || celsius > 320) return null;

  return {
    celsius: Math.round(celsius),
    fahrenheit: celsiusAFahrenheit(celsius),
    gas: gasMarkCercano(celsius),
    ventilador: celsiusVentilador(celsius),
    nivel: nivelHorno(celsius),
  };
}

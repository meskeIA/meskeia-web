// Conversor de moldes — lógica pura
//
// Cuando una receta es para un molde y tú tienes otro, hay que reajustar las
// cantidades para mantener la misma altura de masa. La clave es el ÁREA de la
// base: el factor de conversión es área_destino / área_origen. Los ingredientes
// se multiplican por ese factor; el tiempo de horno cambia poco (depende más de
// la altura que del diámetro), así que solo se da una orientación.
// Verificado: 2026-06.

export type FormaMolde = 'redondo' | 'cuadrado' | 'rectangular';

export const FORMAS_MOLDE: Record<FormaMolde, string> = {
  redondo: 'Redondo',
  cuadrado: 'Cuadrado',
  rectangular: 'Rectangular',
};

export interface Molde {
  forma: FormaMolde;
  // Redondo: dim1 = diámetro. Cuadrado: dim1 = lado. Rectangular: dim1×dim2.
  dim1: number;
  dim2?: number;
}

// Área de la base en cm².
export function areaMolde(m: Molde): number {
  if (!(m.dim1 > 0)) return 0;
  if (m.forma === 'redondo') return Math.PI * (m.dim1 / 2) ** 2;
  if (m.forma === 'cuadrado') return m.dim1 ** 2;
  return m.dim1 * (m.dim2 && m.dim2 > 0 ? m.dim2 : 0);
}

export interface ResultadoMolde {
  areaOrigen: number;
  areaDestino: number;
  factor: number;
  notaTiempo: string;
}

export function convertirMolde(origen: Molde, destino: Molde): ResultadoMolde | null {
  const areaOrigen = areaMolde(origen);
  const areaDestino = areaMolde(destino);
  if (!(areaOrigen > 0) || !(areaDestino > 0)) return null;

  const factor = areaDestino / areaOrigen;
  let notaTiempo: string;
  if (factor > 1.15) {
    notaTiempo = 'El molde es más grande: la masa quedará más fina y se hará algo antes. Vigila unos minutos menos.';
  } else if (factor < 0.85) {
    notaTiempo = 'El molde es más pequeño: la masa quedará más alta y necesitará algo más de tiempo y, quizá, bajar 10 °C el horno.';
  } else {
    notaTiempo = 'Los moldes son parecidos: el tiempo de horno apenas cambia.';
  }

  return {
    areaOrigen: Math.round(areaOrigen),
    areaDestino: Math.round(areaDestino),
    factor: Math.round(factor * 100) / 100,
    notaTiempo,
  };
}

// Moldes habituales para los desplegables.
export interface PresetMolde extends Molde {
  etiqueta: string;
}

export const PRESETS_MOLDE: PresetMolde[] = [
  { etiqueta: 'Redondo 18 cm', forma: 'redondo', dim1: 18 },
  { etiqueta: 'Redondo 20 cm', forma: 'redondo', dim1: 20 },
  { etiqueta: 'Redondo 22 cm', forma: 'redondo', dim1: 22 },
  { etiqueta: 'Redondo 24 cm', forma: 'redondo', dim1: 24 },
  { etiqueta: 'Redondo 26 cm', forma: 'redondo', dim1: 26 },
  { etiqueta: 'Cuadrado 18 cm', forma: 'cuadrado', dim1: 18 },
  { etiqueta: 'Cuadrado 20 cm', forma: 'cuadrado', dim1: 20 },
  { etiqueta: 'Cuadrado 23 cm', forma: 'cuadrado', dim1: 23 },
  { etiqueta: 'Rectangular 20 × 30 cm', forma: 'rectangular', dim1: 20, dim2: 30 },
  { etiqueta: 'Plumcake 25 × 11 cm', forma: 'rectangular', dim1: 25, dim2: 11 },
];

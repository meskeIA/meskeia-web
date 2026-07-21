/**
 * Conversión de onzas — peso (avoirdupois) y volumen (onza líquida).
 *
 * La onza es una fuente clásica de confusión en cocina porque el mismo nombre
 * designa dos magnitudes distintas:
 *  - Onza de PESO (avoirdupois): 1 oz = 28,349523125 g (definición NIST).
 *  - Onza LÍQUIDA (fluid ounce): de VOLUMEN, y además distinta en EE. UU. y
 *    Reino Unido (1 fl oz US = 29,5735 ml; 1 fl oz UK = 28,4131 ml).
 *
 * Factores = unidad base por cada 1 de la unidad (gramos para peso, ml para
 * volumen). Convertir = pasar a base y de base a cada destino.
 */

export const ONZAS_META = {
  fuente: 'Definiciones NIST — onza avoirdupois (peso) y onza líquida (volumen)',
  verificado: '2026-07',
};

export interface UnidadConv {
  id: string;
  nombre: string;
  abrev: string;
  factor: number; // unidades base (g o ml) por 1 de esta unidad
}

// ── Peso: gramos por unidad ──────────────────────────────────────────────────
export const PESO_UNIDADES: UnidadConv[] = [
  { id: 'oz', nombre: 'Onzas', abrev: 'oz', factor: 28.349523125 },
  { id: 'g', nombre: 'Gramos', abrev: 'g', factor: 1 },
  { id: 'lb', nombre: 'Libras', abrev: 'lb', factor: 453.59237 },
  { id: 'kg', nombre: 'Kilogramos', abrev: 'kg', factor: 1000 },
];

// ── Volumen: mililitros por unidad; la onza líquida depende del sistema ───────
export const FL_OZ_ML = { us: 29.5735295625, uk: 28.4130625 };
export const TAZA_US_ML = 236.5882365; // 1 taza EE. UU. = 8 fl oz US

export type SistemaLiquido = 'us' | 'uk';

export function volUnidades(sistema: SistemaLiquido): UnidadConv[] {
  return [
    { id: 'floz', nombre: 'Onzas líquidas', abrev: 'fl oz', factor: FL_OZ_ML[sistema] },
    { id: 'ml', nombre: 'Mililitros', abrev: 'ml', factor: 1 },
    { id: 'l', nombre: 'Litros', abrev: 'l', factor: 1000 },
    { id: 'taza', nombre: 'Tazas (EE. UU.)', abrev: 'taza', factor: TAZA_US_ML },
  ];
}

export interface ResultadoUnidad {
  id: string;
  nombre: string;
  abrev: string;
  valor: number;
}

// Convierte `valor` (en la unidad `fromId`) al resto de unidades de la lista.
export function convertir(valor: number, fromId: string, unidades: UnidadConv[]): ResultadoUnidad[] {
  const from = unidades.find((u) => u.id === fromId);
  if (!from || !Number.isFinite(valor)) return [];
  const base = valor * from.factor;
  return unidades
    .filter((u) => u.id !== fromId)
    .map((u) => ({ id: u.id, nombre: u.nombre, abrev: u.abrev, valor: base / u.factor }));
}

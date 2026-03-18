/**
 * Lógica pura para la calculadora de combustible.
 * Sin dependencias de React ni del DOM — apta para uso en servidor MCP.
 */

// ---------------------------------------------------------------------------
// Modo consumo: dados km recorridos y litros gastados
// ---------------------------------------------------------------------------
export interface ParametrosConsumo {
  kilometros: number;
  litros: number;
  precioCombustible: number; // €/litro
}

export interface ResultadoConsumo {
  consumoL100km: number;   // litros cada 100 km
  costePorKm: number;      // € por km
  autonomiaCon50Euros: number; // km que se hacen con 50 €
  eficiencia: string;      // Excelente / Muy bueno / Normal / Alto / Muy alto
}

export function calcularConsumo(p: ParametrosConsumo): ResultadoConsumo {
  if (p.kilometros <= 0) throw new Error('Los kilómetros deben ser mayores que 0');
  if (p.litros <= 0)     throw new Error('Los litros deben ser mayores que 0');
  if (p.precioCombustible < 0) throw new Error('El precio no puede ser negativo');

  const r = (n: number, dec = 2) => Math.round(n * 10 ** dec) / 10 ** dec;

  const consumoL100km = r((p.litros / p.kilometros) * 100);
  const costePorKm    = r((p.litros * p.precioCombustible) / p.kilometros, 4);
  const autonomiaCon50Euros = p.precioCombustible > 0
    ? r((50 / p.precioCombustible) / (consumoL100km / 100))
    : 0;

  const eficiencia =
    consumoL100km < 5  ? 'Excelente' :
    consumoL100km < 7  ? 'Muy bueno' :
    consumoL100km < 9  ? 'Normal'    :
    consumoL100km < 12 ? 'Alto'      : 'Muy alto';

  return { consumoL100km, costePorKm, autonomiaCon50Euros, eficiencia };
}

// ---------------------------------------------------------------------------
// Modo viaje: dado consumo medio y distancia, calcula coste del trayecto
// ---------------------------------------------------------------------------
export interface ParametrosViaje {
  distanciaKm: number;
  consumoL100km: number;   // consumo medio del vehículo
  precioCombustible: number; // €/litro
}

export interface ResultadoViaje {
  litrosNecesarios: number;
  costeTotal: number;
  costePorKm: number;
}

export function calcularViaje(p: ParametrosViaje): ResultadoViaje {
  if (p.distanciaKm <= 0)   throw new Error('La distancia debe ser mayor que 0');
  if (p.consumoL100km <= 0) throw new Error('El consumo debe ser mayor que 0');
  if (p.precioCombustible < 0) throw new Error('El precio no puede ser negativo');

  const r = (n: number, dec = 2) => Math.round(n * 10 ** dec) / 10 ** dec;

  const litrosNecesarios = r((p.consumoL100km / 100) * p.distanciaKm);
  const costeTotal       = r(litrosNecesarios * p.precioCombustible);
  const costePorKm       = r(costeTotal / p.distanciaKm, 4);

  return { litrosNecesarios, costeTotal, costePorKm };
}

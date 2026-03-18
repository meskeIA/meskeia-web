/**
 * Lógica pura para la calculadora de propinas.
 * Sin dependencias de React ni del DOM — apta para uso en servidor MCP.
 */

// Porcentajes de propina habituales por país
export const PROPINAS_POR_PAIS: Record<string, { porcentaje: number; descripcion: string }> = {
  espana:      { porcentaje: 10, descripcion: 'España — propina discrecional, 10% habitual' },
  usa:         { porcentaje: 18, descripcion: 'EE. UU. — propina obligatoria, 18–20% estándar' },
  reino_unido: { porcentaje: 12, descripcion: 'Reino Unido — service charge, 10–12% habitual' },
  alemania:    { porcentaje: 10, descripcion: 'Alemania — trinkgeld, ~10% habitual' },
  francia:     { porcentaje: 10, descripcion: 'Francia — service compris, propina extra discrecional' },
  italia:      { porcentaje: 10, descripcion: 'Italia — coperto incluido, propina opcional ~10%' },
  japon:       { porcentaje: 0,  descripcion: 'Japón — la propina no es costumbre' },
};

export interface ParametrosPropina {
  /** Importe total de la cuenta en euros */
  monto: number;
  /** Porcentaje de propina a aplicar (ej: 15 para 15%) */
  porcentaje: number;
  /** Número de personas entre las que dividir la cuenta */
  personas?: number;
}

export interface ResultadoPropina {
  propina: number;
  totalConPropina: number;
  totalPorPersona: number;
  montoPorPersonaSinPropina: number;
  propinaPorPersona: number;
  personas: number;
  porcentajeAplicado: number;
}

/**
 * Calcula la propina y divide la cuenta entre varias personas.
 */
export function calcularPropina(params: ParametrosPropina): ResultadoPropina {
  const { monto, porcentaje, personas = 1 } = params;

  if (monto < 0) throw new Error('El monto no puede ser negativo');
  if (porcentaje < 0 || porcentaje > 100) throw new Error('El porcentaje debe estar entre 0 y 100');
  if (personas < 1) throw new Error('El número de personas debe ser al menos 1');

  const propina = monto * (porcentaje / 100);
  const totalConPropina = monto + propina;
  const totalPorPersona = totalConPropina / personas;
  const montoPorPersonaSinPropina = monto / personas;
  const propinaPorPersona = propina / personas;

  return {
    propina:                   Math.round(propina * 100) / 100,
    totalConPropina:           Math.round(totalConPropina * 100) / 100,
    totalPorPersona:           Math.round(totalPorPersona * 100) / 100,
    montoPorPersonaSinPropina: Math.round(montoPorPersonaSinPropina * 100) / 100,
    propinaPorPersona:         Math.round(propinaPorPersona * 100) / 100,
    personas,
    porcentajeAplicado: porcentaje,
  };
}

/**
 * Devuelve el porcentaje habitual para un país dado.
 * Si el país no existe devuelve undefined.
 */
export function obtenerPorcentajePais(pais: string): number | undefined {
  return PROPINAS_POR_PAIS[pais.toLowerCase()]?.porcentaje;
}

/**
 * Datos fiscales: IRPF + Seguridad Social cuenta ajena
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 35/2006 del IRPF + LPGE 2025 + LGSS
 * Verificado: 2025-01-15
 * URL oficial IRPF: https://sede.agenciatributaria.gob.es
 * URL oficial SS: https://www.seg-social.es
 */

export const FISCAL_IRPF_META = {
  fuente: 'Ley 35/2006 del IRPF + Ley de Presupuestos Generales del Estado 2025',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml',
  nota: 'Tramos estatales + tipo autonómico medio. Cada CCAA puede tener variaciones. Verificar en la Agencia Tributaria para cálculo exacto.',
};

// Tramos IRPF 2025 (estatal + autonómico medio ponderado)
export interface TramoIRPF {
  hasta: number;
  tipo: number; // porcentaje
}

export const TRAMOS_IRPF_2025: TramoIRPF[] = [
  { hasta: 12450,    tipo: 19 },
  { hasta: 20200,    tipo: 24 },
  { hasta: 35200,    tipo: 30 },
  { hasta: 60000,    tipo: 37 },
  { hasta: 300000,   tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

// Mínimos personales y familiares IRPF 2025
export const MINIMOS_IRPF_2025 = {
  personal:          5550,
  personal_65:       6700,
  personal_75:       8100,
  hijo_1:            2400,
  hijo_2:            2700,
  hijo_3:            4000,
  hijo_4_mas:        4500,
  hijo_menor_3:      2800,  // adicional por hijo < 3 años
  ascendiente_65:    1150,
  ascendiente_75:    2550,
  discapacidad_33_65: 3000,
  discapacidad_65_mas: 9000,
};

// ─── Seguridad Social cuenta ajena ──────────────────────────────────────────

export const FISCAL_SS_CUENTA_AJENA_META = {
  fuente: 'Orden PJC/51/2025 de cotización a la Seguridad Social',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores',
  nota: 'Tipos trabajador (cuota a cargo del empleado). El empleador paga tipos adicionales no incluidos aquí.',
};

// Tipos de cotización 2025 (porción trabajador)
export const COTIZACIONES_SS_2025 = {
  contingenciasComunes:    4.70,
  desempleo:               1.55,
  formacionProfesional:    0.10,
  mef:                     0.12, // Mecanismo Equidad Intergeneracional
};

// Bases de cotización 2025 (mensuales)
export const BASES_SS_2025 = {
  minima: 1184.40,
  maxima: 4720.50,
};

// ─── Rendimientos del trabajo: gastos deducibles y reducción 2025 ─────────────

/**
 * Gastos deducibles generales de los rendimientos del trabajo.
 * Ley 35/2006 IRPF art. 19.2.f
 */
export const GASTOS_DEDUCIBLES_TRABAJO_2025 = {
  importeGeneral: 2000,  // €/año (todos los contribuyentes con rendimientos del trabajo)
};

/**
 * Reducción por rendimientos netos del trabajo (RNT) 2025
 * Se aplica sobre el Rendimiento Neto del Trabajo (ingresos - gastos deducibles).
 * Ley 35/2006 IRPF art. 20 (según LPGE 2025)
 *
 * - RNT ≤ 13.115 €: reducción de 6.498 €
 * - 13.115 < RNT < 16.825 €: 6.498 - 1,14 × (RNT - 13.115)
 * - RNT ≥ 16.825 €: reducción de 2.364 €
 */
export const REDUCCION_RENDIMIENTOS_TRABAJO_2025 = {
  limite1:               13115,   // RNT hasta aquí: reducción máxima
  reduccion1:             6498,   // €/año de reducción
  limite2:               16825,   // RNT a partir de aquí: reducción mínima
  reduccion2:             2364,   // €/año de reducción
  factorInterpolacion:    1.14,   // Factor interpolación entre límite1 y límite2
};

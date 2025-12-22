/**
 * Datos del Impuesto de Transmisiones Patrimoniales (ITP) por Comunidad Autónoma
 * Actualizado: Diciembre 2024
 *
 * Fuentes:
 * - OCU: https://www.ocu.org/fincas-y-casas/compraventa/fiscalidad/analisis/2024/06/tipos-itp-2024-por-ccaa
 * - Idealista: https://www.idealista.com/news/inmobiliario/vivienda/2024/09/18/819047-itp-por-comunidades-2024
 */

// ===== TIPOS =====

export type ComunidadAutonoma =
  | 'andalucia'
  | 'aragon'
  | 'asturias'
  | 'baleares'
  | 'canarias'
  | 'cantabria'
  | 'castilla-leon'
  | 'castilla-mancha'
  | 'cataluna'
  | 'valencia'
  | 'extremadura'
  | 'galicia'
  | 'madrid'
  | 'murcia'
  | 'navarra'
  | 'pais-vasco'
  | 'rioja'
  | 'ceuta'
  | 'melilla';

export interface TramoITP {
  hasta: number;      // Valor máximo del tramo (Infinity para el último)
  tipo: number;       // Porcentaje (ej: 8 = 8%)
}

export interface TipoReducido {
  nombre: string;
  tipo: number;       // Porcentaje
  condiciones: string[];
  valorMaximo?: number;
  rentaMaxima?: number;
}

export interface DatosCCAA {
  nombre: string;
  tipoGeneral: number;          // Tipo fijo general
  tramosProgresivos?: TramoITP[]; // Si hay escala progresiva
  tiposReducidos: TipoReducido[];
  ajd: number;                  // Actos Jurídicos Documentados (para hipoteca)
  notas: string;
}

// ===== DATOS POR CCAA =====

export const ITP_CCAA: Record<ComunidadAutonoma, DatosCCAA> = {
  'andalucia': {
    nombre: 'Andalucía',
    tipoGeneral: 7,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual (valor ≤150.000€)',
        tipo: 6,
        condiciones: ['Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Jóvenes < 35 años',
        tipo: 3.5,
        condiciones: ['Menor de 35 años', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 3.5,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Valor ≤ 250.000 €'],
        valorMaximo: 250000,
      },
      {
        nombre: 'Discapacidad ≥33%',
        tipo: 3.5,
        condiciones: ['Discapacidad ≥ 33%', 'Vivienda habitual', 'Valor ≤ 250.000 €'],
        valorMaximo: 250000,
      },
      {
        nombre: 'Municipios despoblados',
        tipo: 3.5,
        condiciones: ['Municipio con problemas de despoblación', 'Vivienda habitual'],
      },
    ],
    ajd: 1.2,
    notas: 'Bonificación del 3,5% para colectivos vulnerables y zonas despobladas.',
  },

  'aragon': {
    nombre: 'Aragón',
    tipoGeneral: 8,
    tramosProgresivos: [
      { hasta: 400000, tipo: 8 },
      { hasta: Infinity, tipo: 10 },
    ],
    tiposReducidos: [
      {
        nombre: 'Jóvenes < 35 años',
        tipo: 6,
        condiciones: ['Menor de 35 años', 'Vivienda habitual', 'Valor ≤ 100.000 €'],
        valorMaximo: 100000,
      },
      {
        nombre: 'Familia numerosa (zona rural)',
        tipo: 4,
        condiciones: ['Familia numerosa', 'Municipio rural', 'Bonificación 50-60%'],
      },
      {
        nombre: 'Discapacidad ≥65%',
        tipo: 6,
        condiciones: ['Discapacidad ≥ 65%', 'Vivienda habitual', 'Valor ≤ 100.000 €'],
        valorMaximo: 100000,
      },
    ],
    ajd: 1.5,
    notas: 'Escala progresiva desde 2024. Bonificaciones en zonas rurales.',
  },

  'asturias': {
    nombre: 'Asturias',
    tipoGeneral: 8,
    tramosProgresivos: [
      { hasta: 300000, tipo: 8 },
      { hasta: 500000, tipo: 9 },
      { hasta: Infinity, tipo: 10 },
    ],
    tiposReducidos: [
      {
        nombre: 'Jóvenes ≤35 años',
        tipo: 4,
        condiciones: ['Menor o igual de 35 años', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 4,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Familia monoparental',
        tipo: 4,
        condiciones: ['Familia monoparental', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
    ],
    ajd: 1.2,
    notas: 'Escala progresiva. Tipo reducido 4% ampliado a familias monoparentales desde 2025.',
  },

  'baleares': {
    nombre: 'Islas Baleares',
    tipoGeneral: 8,
    tramosProgresivos: [
      { hasta: 400000, tipo: 8 },
      { hasta: 600000, tipo: 9 },
      { hasta: 1000000, tipo: 10 },
      { hasta: 2000000, tipo: 12 },
      { hasta: Infinity, tipo: 13 },
    ],
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual',
        tipo: 4,
        condiciones: ['Vivienda habitual', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
      {
        nombre: 'Jóvenes < 36 años',
        tipo: 2,
        condiciones: ['Menor de 36 años', 'Vivienda habitual', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 2,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
      {
        nombre: 'Discapacidad',
        tipo: 2,
        condiciones: ['Persona con discapacidad conviviente', 'Vivienda habitual'],
        valorMaximo: 270151,
      },
    ],
    ajd: 1.5,
    notas: 'Una de las escalas más altas de España (hasta 13%). Bonificación 100% para menores de 30 años con condiciones.',
  },

  'canarias': {
    nombre: 'Canarias',
    tipoGeneral: 6.5,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual',
        tipo: 5,
        condiciones: ['Vivienda habitual', 'Valor ≤ 150.000 €', 'No ser propietario de otra vivienda'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Familia numerosa/monoparental',
        tipo: 1,
        condiciones: ['Familia numerosa o monoparental', 'Vivienda habitual'],
      },
      {
        nombre: 'Discapacidad',
        tipo: 1,
        condiciones: ['Persona con discapacidad', 'Vivienda habitual'],
      },
      {
        nombre: 'VPO',
        tipo: 0,
        condiciones: ['Vivienda de Protección Oficial'],
      },
    ],
    ajd: 0.75,
    notas: 'ITP más bajo de España junto con País Vasco y Madrid. Exención total para VPO.',
  },

  'cantabria': {
    nombre: 'Cantabria',
    tipoGeneral: 9,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual < 200.000€',
        tipo: 7,
        condiciones: ['Vivienda habitual', 'Valor < 200.000 €'],
        valorMaximo: 200000,
      },
      {
        nombre: 'Jóvenes < 36 años',
        tipo: 4,
        condiciones: ['Menor de 36 años', 'Vivienda habitual', 'Valor ≤ 300.000 €'],
        valorMaximo: 300000,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 4,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Valor ≤ 300.000 €'],
        valorMaximo: 300000,
      },
      {
        nombre: 'Familia monoparental',
        tipo: 4,
        condiciones: ['Familia monoparental', 'Vivienda habitual', 'Valor ≤ 300.000 €'],
        valorMaximo: 300000,
      },
      {
        nombre: 'Discapacidad ≥65%',
        tipo: 3,
        condiciones: ['Discapacidad ≥ 65%', 'Vivienda habitual', 'Valor ≤ 300.000 €'],
        valorMaximo: 300000,
      },
      {
        nombre: 'VPO',
        tipo: 4,
        condiciones: ['Vivienda de Protección Oficial'],
      },
      {
        nombre: 'Municipios despoblados',
        tipo: 4,
        condiciones: ['Municipio con riesgo de despoblamiento'],
      },
    ],
    ajd: 1.5,
    notas: 'Múltiples tipos reducidos para vivienda habitual.',
  },

  'castilla-leon': {
    nombre: 'Castilla y León',
    tipoGeneral: 8,
    tramosProgresivos: [
      { hasta: 250000, tipo: 8 },
      { hasta: Infinity, tipo: 10 },
    ],
    tiposReducidos: [
      {
        nombre: 'Jóvenes < 36 años',
        tipo: 4,
        condiciones: ['Menor de 36 años', 'Vivienda habitual'],
      },
      {
        nombre: 'Familia numerosa',
        tipo: 4,
        condiciones: ['Familia numerosa', 'Vivienda habitual'],
      },
      {
        nombre: 'Discapacidad ≥65%',
        tipo: 4,
        condiciones: ['Discapacidad ≥ 65%', 'Vivienda habitual'],
      },
      {
        nombre: 'VPO',
        tipo: 4,
        condiciones: ['Vivienda de Protección Oficial'],
      },
      {
        nombre: 'Municipios poco poblados (< 36 años)',
        tipo: 0.01,
        condiciones: ['Menor de 36 años', 'Municipio < 10.000 hab.', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
    ],
    ajd: 1.5,
    notas: 'Tipo casi 0% para jóvenes en municipios rurales. Gran incentivo contra despoblación.',
  },

  'castilla-mancha': {
    nombre: 'Castilla-La Mancha',
    tipoGeneral: 9,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual (primera compra)',
        tipo: 6,
        condiciones: ['Primera vivienda', 'Valor ≤ 180.000 €', 'Hipoteca > 50% del valor'],
        valorMaximo: 180000,
      },
      {
        nombre: 'Zona despoblación nivel 1',
        tipo: 5,
        condiciones: ['Municipio en zona de despoblación nivel 1'],
      },
      {
        nombre: 'Zona despoblación nivel 2',
        tipo: 4,
        condiciones: ['Municipio en zona de despoblación nivel 2'],
      },
      {
        nombre: 'Zona despoblación nivel 3',
        tipo: 3,
        condiciones: ['Municipio en zona de despoblación nivel 3'],
      },
    ],
    ajd: 1.5,
    notas: 'Sistema de zonas de despoblación con tipos decrecientes.',
  },

  'cataluna': {
    nombre: 'Cataluña',
    tipoGeneral: 10,
    tramosProgresivos: [
      { hasta: 1000000, tipo: 10 },
      { hasta: Infinity, tipo: 11 },
    ],
    tiposReducidos: [
      {
        nombre: 'Jóvenes ≤32 años',
        tipo: 5,
        condiciones: ['Menor o igual de 32 años', 'Vivienda habitual', 'Renta ≤ 36.000 €'],
        rentaMaxima: 36000,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 5,
        condiciones: ['Familia numerosa', 'Vivienda habitual'],
      },
      {
        nombre: 'Familia monoparental',
        tipo: 5,
        condiciones: ['Familia monoparental', 'Vivienda habitual'],
      },
      {
        nombre: 'Discapacidad ≥65%',
        tipo: 5,
        condiciones: ['Discapacidad ≥ 65%', 'Vivienda habitual'],
      },
      {
        nombre: 'VPO',
        tipo: 7,
        condiciones: ['Vivienda de Protección Oficial'],
      },
    ],
    ajd: 1.5,
    notas: 'ITP elevado (10-11%). Tipo reducido 5% para colectivos específicos.',
  },

  'valencia': {
    nombre: 'Comunidad Valenciana',
    tipoGeneral: 10,
    tramosProgresivos: [
      { hasta: 1000000, tipo: 10 },
      { hasta: Infinity, tipo: 11 },
    ],
    tiposReducidos: [
      {
        nombre: 'VPO primera vivienda',
        tipo: 8,
        condiciones: ['VPO', 'Primera vivienda'],
      },
      {
        nombre: 'Jóvenes < 35 años',
        tipo: 8,
        condiciones: ['Menor de 35 años', 'Vivienda habitual'],
      },
      {
        nombre: 'Jóvenes < 35 años (valor ≤180.000€)',
        tipo: 6,
        condiciones: ['Menor de 35 años', 'Vivienda habitual', 'Valor ≤ 180.000 €'],
        valorMaximo: 180000,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 4,
        condiciones: ['Familia numerosa', 'Vivienda habitual'],
      },
      {
        nombre: 'Familia monoparental',
        tipo: 4,
        condiciones: ['Familia monoparental', 'Vivienda habitual'],
      },
      {
        nombre: 'Discapacidad',
        tipo: 4,
        condiciones: ['Persona con discapacidad', 'Vivienda habitual'],
      },
      {
        nombre: 'Víctimas violencia de género',
        tipo: 3,
        condiciones: ['Víctima de violencia de género', 'Vivienda habitual'],
      },
    ],
    ajd: 1.5,
    notas: 'ITP elevado pero con múltiples tipos reducidos para colectivos.',
  },

  'extremadura': {
    nombre: 'Extremadura',
    tipoGeneral: 8,
    tramosProgresivos: [
      { hasta: 360000, tipo: 8 },
      { hasta: 600000, tipo: 10 },
      { hasta: Infinity, tipo: 11 },
    ],
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual (desde oct/2024)',
        tipo: 7,
        condiciones: ['Vivienda habitual', 'Valor ≤ 180.000 €', 'Límites de renta'],
        valorMaximo: 180000,
      },
      {
        nombre: 'Jóvenes < 35 años (bonif. 20%)',
        tipo: 6.4,
        condiciones: ['Menor de 35 años', 'Vivienda habitual', 'Bonificación 20% sobre tipo'],
      },
      {
        nombre: 'Familia numerosa (bonif. 20%)',
        tipo: 6.4,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Bonificación 20% sobre tipo'],
      },
      {
        nombre: 'Discapacidad (bonif. 20%)',
        tipo: 6.4,
        condiciones: ['Persona con discapacidad', 'Vivienda habitual', 'Bonificación 20% sobre tipo'],
      },
    ],
    ajd: 1.5,
    notas: 'Nuevas bonificaciones desde octubre 2024. Escala progresiva hasta 11%.',
  },

  'galicia': {
    nombre: 'Galicia',
    tipoGeneral: 8,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual (patrimonio ≤200.000€)',
        tipo: 7,
        condiciones: ['Vivienda habitual', 'Patrimonio preexistente ≤ 200.000 €'],
      },
      {
        nombre: 'Jóvenes < 36 años',
        tipo: 3,
        condiciones: ['Menor de 36 años', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 3,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Discapacidad ≥65%',
        tipo: 3,
        condiciones: ['Discapacidad ≥ 65%', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
      {
        nombre: 'Víctimas violencia de género',
        tipo: 3,
        condiciones: ['Víctima de violencia de género', 'Vivienda habitual', 'Valor ≤ 150.000 €'],
        valorMaximo: 150000,
      },
    ],
    ajd: 1.5,
    notas: 'Tipo reducido 3% muy favorable para jóvenes y colectivos vulnerables.',
  },

  'madrid': {
    nombre: 'Comunidad de Madrid',
    tipoGeneral: 6,
    tiposReducidos: [
      {
        nombre: 'Familia numerosa',
        tipo: 4,
        condiciones: ['Familia numerosa', 'Vivienda habitual'],
      },
      {
        nombre: 'Vivienda habitual (bonif. 10%)',
        tipo: 5.4,
        condiciones: ['Vivienda habitual', 'Valor ≤ 250.000 €'],
        valorMaximo: 250000,
      },
      {
        nombre: 'Jóvenes < 35 años (municipios pequeños)',
        tipo: 0,
        condiciones: ['Menor de 35 años', 'Municipio < 2.500 hab.', 'Valor ≤ 250.000 €', 'Desde nov/2024'],
        valorMaximo: 250000,
      },
    ],
    ajd: 0.75,
    notas: 'ITP más bajo de España peninsular (6%). Bonificación 100% para jóvenes en pueblos pequeños desde nov/2024.',
  },

  'murcia': {
    nombre: 'Región de Murcia',
    tipoGeneral: 8,
    tiposReducidos: [
      {
        nombre: 'VPO régimen especial',
        tipo: 4,
        condiciones: ['VPO en régimen especial'],
      },
      {
        nombre: 'Jóvenes ≤40 años',
        tipo: 3,
        condiciones: ['Menor o igual de 40 años', 'Vivienda habitual'],
      },
      {
        nombre: 'Familia numerosa',
        tipo: 3,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Renta < 44.000 €'],
        rentaMaxima: 44000,
      },
      {
        nombre: 'Discapacidad ≥65%',
        tipo: 3,
        condiciones: ['Discapacidad ≥ 65%', 'Vivienda habitual', 'Renta < 40.000 €'],
        rentaMaxima: 40000,
      },
    ],
    ajd: 1.5,
    notas: 'Límite de edad generoso para jóvenes (40 años).',
  },

  'navarra': {
    nombre: 'Comunidad Foral de Navarra',
    tipoGeneral: 6,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual',
        tipo: 5,
        condiciones: ['Vivienda habitual', 'Base ≤ 180.304 €'],
        valorMaximo: 180304,
      },
      {
        nombre: 'Municipios despoblados',
        tipo: 4,
        condiciones: ['Municipio con problemas de despoblación', 'Vivienda habitual'],
      },
    ],
    ajd: 0.5,
    notas: 'Régimen foral propio. ITP bajo (6%). AJD muy reducido (0,5%).',
  },

  'pais-vasco': {
    nombre: 'País Vasco',
    tipoGeneral: 4,
    tiposReducidos: [
      {
        nombre: 'Vivienda habitual (hasta 120 m²)',
        tipo: 2.5,
        condiciones: ['Vivienda habitual', 'Superficie ≤ 120 m²'],
      },
      {
        nombre: 'Familia numerosa',
        tipo: 2.5,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Sin límite de superficie'],
      },
      {
        nombre: 'Zonas despobladas (Álava)',
        tipo: 1.5,
        condiciones: ['Álava', 'Municipio con problemas de despoblación'],
      },
    ],
    ajd: 0,
    notas: 'ITP más bajo de España (4%). Sin AJD. Régimen foral propio.',
  },

  'rioja': {
    nombre: 'La Rioja',
    tipoGeneral: 7,
    tiposReducidos: [
      {
        nombre: 'VPO primera vivienda',
        tipo: 5,
        condiciones: ['VPO', 'Primera vivienda'],
      },
      {
        nombre: 'Jóvenes < 36 años',
        tipo: 5,
        condiciones: ['Menor de 36 años', 'Primera vivienda'],
      },
      {
        nombre: 'Jóvenes < 36 años (municipios especiales)',
        tipo: 3,
        condiciones: ['Menor de 36 años', 'Municipios determinados'],
      },
      {
        nombre: 'Familia numerosa',
        tipo: 5,
        condiciones: ['Familia numerosa', 'Vivienda habitual'],
      },
      {
        nombre: 'Discapacidad ≥33%',
        tipo: 5,
        condiciones: ['Discapacidad ≥ 33%', 'Vivienda habitual'],
      },
    ],
    ajd: 1,
    notas: 'ITP moderado (7%). Buenos tipos reducidos para jóvenes y familias.',
  },

  'ceuta': {
    nombre: 'Ciudad Autónoma de Ceuta',
    tipoGeneral: 6,
    tiposReducidos: [
      {
        nombre: 'Bonificación general 50%',
        tipo: 3,
        condiciones: ['Inmueble situado en Ceuta', 'Bonificación automática 50%'],
      },
    ],
    ajd: 0.5,
    notas: 'Bonificación automática del 50% para inmuebles en Ceuta.',
  },

  'melilla': {
    nombre: 'Ciudad Autónoma de Melilla',
    tipoGeneral: 6,
    tiposReducidos: [
      {
        nombre: 'Bonificación general 50%',
        tipo: 3,
        condiciones: ['Inmueble situado en Melilla', 'Bonificación automática 50%'],
      },
    ],
    ajd: 0.5,
    notas: 'Bonificación automática del 50% para inmuebles en Melilla.',
  },
};

// ===== ARANCELES NOTARIALES Y REGISTRALES =====
// Basados en Real Decreto 1426/1989 y Real Decreto 1427/1989

export interface TramoArancel {
  hasta: number;
  base: number;      // Cuota fija base
  exceso: number;    // Porcentaje sobre exceso del tramo anterior
}

// Aranceles notariales para escritura de compraventa
export const ARANCELES_NOTARIO: TramoArancel[] = [
  { hasta: 6010.12, base: 90.15, exceso: 0 },
  { hasta: 30050.61, base: 90.15, exceso: 0.45 },
  { hasta: 60101.21, base: 198.33, exceso: 0.15 },
  { hasta: 150253.03, base: 243.40, exceso: 0.10 },
  { hasta: 601012.10, base: 333.56, exceso: 0.05 },
  { hasta: 6010121.04, base: 558.94, exceso: 0.03 },
  { hasta: Infinity, base: 2181.67, exceso: 0.02 },
];

// Aranceles del Registro de la Propiedad
export const ARANCELES_REGISTRO: TramoArancel[] = [
  { hasta: 6010.12, base: 24.04, exceso: 0 },
  { hasta: 30050.61, base: 24.04, exceso: 0.175 },
  { hasta: 60101.21, base: 66.11, exceso: 0.125 },
  { hasta: 150253.03, base: 103.68, exceso: 0.075 },
  { hasta: 601012.10, base: 171.29, exceso: 0.030 },
  { hasta: Infinity, base: 306.58, exceso: 0.020 },
];

// Límite máximo de arancel por inscripción
export const REGISTRO_MAXIMO = 2181.67;

// ===== FUNCIONES DE CÁLCULO =====

/**
 * Calcula el ITP según la comunidad autónoma y tipo aplicable
 */
export function calcularITP(
  valor: number,
  ccaa: ComunidadAutonoma,
  tipoAplicable?: number // Si se quiere forzar un tipo reducido
): number {
  const datos = ITP_CCAA[ccaa];

  if (tipoAplicable !== undefined) {
    return valor * (tipoAplicable / 100);
  }

  // Si hay tramos progresivos, calcular por tramos
  if (datos.tramosProgresivos && datos.tramosProgresivos.length > 0) {
    return calcularITPProgresivo(valor, datos.tramosProgresivos);
  }

  // Tipo fijo
  return valor * (datos.tipoGeneral / 100);
}

/**
 * Calcula ITP con escala progresiva
 */
function calcularITPProgresivo(valor: number, tramos: TramoITP[]): number {
  let total = 0;
  let valorRestante = valor;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    const baseTramo = Math.min(valorRestante, tramo.hasta - limiteAnterior);
    if (baseTramo <= 0) break;

    total += baseTramo * (tramo.tipo / 100);
    valorRestante -= baseTramo;
    limiteAnterior = tramo.hasta;
  }

  return total;
}

/**
 * Calcula el IVA para vivienda nueva (primera transmisión)
 */
export function calcularIVA(valor: number, tipoInmueble: 'vivienda' | 'garaje' | 'trastero' | 'local' | 'nave'): number {
  // Vivienda: 10%, resto: 21%
  const tipo = tipoInmueble === 'vivienda' || tipoInmueble === 'garaje' || tipoInmueble === 'trastero' ? 10 : 21;
  return valor * (tipo / 100);
}

/**
 * Calcula AJD (Actos Jurídicos Documentados)
 */
export function calcularAJD(valor: number, ccaa: ComunidadAutonoma): number {
  const datos = ITP_CCAA[ccaa];
  return valor * (datos.ajd / 100);
}

/**
 * Calcula gastos de notaría
 */
export function calcularNotario(valor: number): number {
  let total = 0;
  let limiteAnterior = 0;

  for (const tramo of ARANCELES_NOTARIO) {
    if (valor <= limiteAnterior) break;

    const base = Math.min(valor, tramo.hasta);
    if (limiteAnterior === 0) {
      total = tramo.base;
    } else {
      total += (base - limiteAnterior) * (tramo.exceso / 100);
    }
    limiteAnterior = tramo.hasta;
  }

  // Añadir IVA (21%) a los honorarios notariales
  return total * 1.21;
}

/**
 * Calcula gastos de registro de la propiedad
 */
export function calcularRegistro(valor: number): number {
  let total = 0;
  let limiteAnterior = 0;

  for (const tramo of ARANCELES_REGISTRO) {
    if (valor <= limiteAnterior) break;

    const base = Math.min(valor, tramo.hasta);
    if (limiteAnterior === 0) {
      total = tramo.base;
    } else {
      total += (base - limiteAnterior) * (tramo.exceso / 100);
    }
    limiteAnterior = tramo.hasta;
  }

  // Aplicar límite máximo
  total = Math.min(total, REGISTRO_MAXIMO);

  // Añadir IVA (21%)
  return total * 1.21;
}

/**
 * Calcula la plusvalía municipal aproximada
 * NOTA: Cálculo orientativo. Cada municipio tiene sus propios coeficientes.
 */
export interface DatosPlusvalia {
  valorCatastralSuelo: number;
  aniosPropiedad: number;
  precioCompra: number;
  precioVenta: number;
  tipoMaximo?: number; // Por defecto 30%
}

export function calcularPlusvaliaMunicipal(datos: DatosPlusvalia): {
  metodoObjetivo: number;
  metodoReal: number;
  recomendado: number;
  exento: boolean;
} {
  const { valorCatastralSuelo, aniosPropiedad, precioCompra, precioVenta, tipoMaximo = 30 } = datos;

  // Coeficientes orientativos (varían por municipio)
  // Según Ley de Haciendas Locales reformada en 2021
  const coeficientes: Record<number, number> = {
    1: 0.14,
    2: 0.13,
    3: 0.15,
    4: 0.17,
    5: 0.17,
    6: 0.16,
    7: 0.12,
    8: 0.10,
    9: 0.09,
    10: 0.08,
    11: 0.08,
    12: 0.08,
    13: 0.08,
    14: 0.10,
    15: 0.12,
    16: 0.16,
    17: 0.20,
    18: 0.26,
    19: 0.36,
    20: 0.45,
  };

  const aniosCapped = Math.min(Math.max(aniosPropiedad, 1), 20);
  const coeficiente = coeficientes[aniosCapped] || 0.45;

  // Método objetivo (tradicional)
  const baseObjetivo = valorCatastralSuelo * coeficiente;
  const metodoObjetivo = baseObjetivo * (tipoMaximo / 100);

  // Método real (plusvalía efectiva)
  const incrementoReal = precioVenta - precioCompra;
  const porcentajeIncremento = incrementoReal / precioCompra;
  const baseReal = valorCatastralSuelo * porcentajeIncremento;
  const metodoReal = Math.max(0, baseReal * (tipoMaximo / 100));

  // Exención si no hay ganancia
  const exento = incrementoReal <= 0;

  // El contribuyente puede elegir el método más favorable
  const recomendado = exento ? 0 : Math.min(metodoObjetivo, metodoReal);

  return {
    metodoObjetivo,
    metodoReal,
    recomendado,
    exento,
  };
}

// Enlace para consultar valor de referencia catastral
export const ENLACE_CATASTRO = 'https://www1.sedecatastro.gob.es/Accesos/SECAccvrc.aspx';

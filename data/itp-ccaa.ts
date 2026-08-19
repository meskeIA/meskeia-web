/**
 * Datos del Impuesto de Transmisiones Patrimoniales (ITP) por Comunidad Autónoma
 * Actualizado: Junio 2026 (reconciliación 6 CCAA: Andalucía, Baleares, Castilla y León,
 * Extremadura, Murcia, Valencia)
 *
 * Cambios verificados jun-2026:
 * - Murcia: tipo general 8% → 7,75% (Ley 3/2025, efectos 25/07/2025) — ATRM oficial
 * - Valencia: tipo general 10% → 9% (≤1M €; 11% por encima) desde 01/06/2026
 * - Baleares: reducidos corregidos (jóvenes <30/discapacidad ≥33%: 0%; familia numerosa/VPO: 5%)
 *
 * Fuentes:
 * - ATRM Murcia: https://agenciatributaria.carm.es
 * - Garrigues (Valencia 2026): https://www.garrigues.com
 * - OCU / Idealista (referencia general por CCAA)
 */

// ===== TIPOS =====

import { COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META, TIPOS_ITP_CCAA_2025 } from '@/data/fiscal';

/**
 * El tipo general de cada comunidad se LEE de `data/fiscal`; aquí no se escribe.
 *
 * ── Por qué (19/08/2026) ──────────────────────────────────────────────────────
 * El mismo dato vivía en dos sitios: `tipoGeneral` aquí y `TIPOS_ITP_CCAA_2025` en
 * `data/fiscal/inmuebles.ts`. El inventario del 19/08/2026 comprobó que los 17
 * coincidían, así que derivarlos no cambió ningún importe — pero nada impedía que
 * mañana dejaran de coincidir, y esa clase de divergencia no la detecta el build:
 * los tipos REDUCIDOS, que no se pueden derivar porque aquí son una lista con
 * condiciones y allí un solo número, ya habían divergido en tres comunidades sin
 * que nadie lo notara (Murcia, Cataluña y La Rioja).
 *
 * El reparto que queda: `data/fiscal` es la autoridad del VALOR del tipo general;
 * este fichero, la del CÁLCULO — escalas progresivas, tipos reducidos y sus
 * condiciones, aranceles y plusvalía, que la ficha no modela.
 *
 * El `throw` es deliberado: si una comunidad desaparece de la ficha, el módulo no
 * carga y el build se para. Vale más eso que un `undefined` propagándose a un
 * cálculo de impuestos. `npm run check:itp` lo dice antes y con mejor mensaje.
 */
const tipoGeneralDe = (nombreEnDataFiscal: string): number => {
  const ficha = TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === nombreEnDataFiscal);
  if (!ficha) {
    throw new Error(
      `ITP: «${nombreEnDataFiscal}» no está en TIPOS_ITP_CCAA_2025 (data/fiscal/inmuebles.ts). ` +
        'El tipo general se lee de ahí: añádela allí o corrige el nombre.',
    );
  }
  return ficha.tipo;
};

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
    tipoGeneral: tipoGeneralDe('Andalucía'),
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
    tipoGeneral: tipoGeneralDe('Aragón'),
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
    notas: 'Escala progresiva desde 2024. Bonificaciones en zonas rurales. ⚠️ Dato orientativo: existen bonificaciones adicionales sobre la cuota (jóvenes, discapacidad, familia numerosa) que varían según colectivo y municipio — verifica la tarifa vigente en aragon.es',
  },

  'asturias': {
    nombre: 'Asturias',
    tipoGeneral: tipoGeneralDe('Asturias'),
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
    tipoGeneral: tipoGeneralDe('Baleares'),
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
        condiciones: ['Vivienda habitual', 'No ser titular de otra vivienda', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
      {
        nombre: 'Jóvenes < 30 años o discapacidad ≥33% (1ª vivienda)',
        tipo: 0,
        condiciones: ['Menor de 30 años o discapacidad ≥ 33%', 'Primera vivienda habitual', 'Residente en Baleares 3 años', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
      {
        nombre: 'Familia numerosa',
        tipo: 5,
        condiciones: ['Familia numerosa', 'Vivienda habitual', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
      {
        nombre: 'VPO',
        tipo: 5,
        condiciones: ['Vivienda de Protección Oficial', 'Valor ≤ 270.151 €'],
        valorMaximo: 270151,
      },
    ],
    ajd: 1.5,
    notas: 'Una de las escalas más altas de España (hasta 13%). Bonificación 100% (tipo 0%) para menores de 30 años o discapacidad ≥33% en primera vivienda habitual (valor ≤270.151 €).',
  },

  'canarias': {
    nombre: 'Canarias',
    tipoGeneral: tipoGeneralDe('Canarias'),
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
    tipoGeneral: tipoGeneralDe('Cantabria'),
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
    tipoGeneral: tipoGeneralDe('Castilla y León'),
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
    tipoGeneral: tipoGeneralDe('Castilla-La Mancha'),
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
    tipoGeneral: tipoGeneralDe('Cataluña'),
    tramosProgresivos: [
      { hasta: 600000, tipo: 10 },
      { hasta: 900000, tipo: 11 },
      { hasta: 1500000, tipo: 12 },
      { hasta: Infinity, tipo: 13 },
    ],
    tiposReducidos: [
      {
        nombre: 'Jóvenes ≤35 años',
        tipo: 5,
        condiciones: ['Menor o igual de 35 años', 'Vivienda habitual', 'Renta ≤ 36.000 €'],
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
    notas: 'ITP elevado (10-13% en escala progresiva desde el 27/06/2025, Decreto-ley 5/2025). Tipo reducido 5% para colectivos específicos, con el límite de edad de los jóvenes en 35 años desde esa misma fecha (antes 32). ⚠️ La ATC reconoce además un 5% para víctimas de violencia machista, un 4% en municipios rurales (3% en los de especial atención) y un 20% para grandes tenedores, que esta app no distingue.',
  },

  'valencia': {
    nombre: 'Comunidad Valenciana',
    tipoGeneral: tipoGeneralDe('Valencia'),
    tramosProgresivos: [
      { hasta: 1000000, tipo: 9 },
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
    notas: 'Tipo general 9% desde el 01/06/2026 (antes 10%) para vivienda usada ≤1.000.000 €; 11% por encima. Múltiples tipos reducidos para colectivos.',
  },

  'extremadura': {
    nombre: 'Extremadura',
    tipoGeneral: tipoGeneralDe('Extremadura'),
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
    notas: 'Escala progresiva 8/10/11%. ⚠️ Dato orientativo: los tipos reducidos para jóvenes/familia numerosa varían entre fuentes (7%, 6,4% por bonificación 20% o 3%) según valor y límites de renta — verifica la tarifa vigente en gobiernodeextremadura.es',
  },

  'galicia': {
    nombre: 'Galicia',
    tipoGeneral: tipoGeneralDe('Galicia'),
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
    tipoGeneral: tipoGeneralDe('Madrid'),
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
    tipoGeneral: tipoGeneralDe('Murcia'),
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
    notas: 'Tipo general 7,75% desde el 25/07/2025 (Ley 3/2025, antes 8%). Límite de edad generoso para jóvenes (40 años). Fuente: ATRM (agenciatributaria.carm.es).',
  },

  'navarra': {
    nombre: 'Comunidad Foral de Navarra',
    tipoGeneral: tipoGeneralDe('Navarra'),
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
    tipoGeneral: tipoGeneralDe('País Vasco'),
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
    tipoGeneral: tipoGeneralDe('La Rioja'),
    tiposReducidos: [
      {
        nombre: 'VPO primera vivienda',
        tipo: 5,
        condiciones: ['VPO', 'Primera vivienda'],
      },
      {
        nombre: 'Jóvenes < 40 años',
        tipo: 4,
        condiciones: ['Menor de 40 años', 'Primera vivienda habitual'],
      },
      {
        nombre: 'Jóvenes < 40 años (municipios del anexo I)',
        tipo: 3,
        condiciones: ['Menor de 40 años', 'Primera vivienda habitual', 'Municipio del anexo I de la Ley 10/2017'],
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
    notas: 'ITP moderado (7%). Jóvenes menores de 40 años en primera vivienda habitual: 4% (3% en los municipios del anexo I de la Ley 10/2017), por la Ley 1/2025 de medidas urgentes para el acceso a la vivienda, con efectos desde el 03/03/2025. ⚠️ Dato orientativo: la familia numerosa baja del 5% al 3% con requisitos adicionales de renta (≤30.600 €) que esta app no pregunta — verifica la tarifa vigente en larioja.org',
  },

  'ceuta': {
    nombre: 'Ciudad Autónoma de Ceuta',
    // Excepción declarada: Ceuta no es una CCAA y no figura en TIPOS_ITP_CCAA_2025.
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
    // Excepción declarada: Melilla no es una CCAA y no figura en TIPOS_ITP_CCAA_2025.
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

// ===== ELECCIÓN DEL TIPO REDUCIDO =====

/** Perfiles por los que preguntan los simuladores de compraventa */
export type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad' | 'vpo';

export interface TipoElegido {
  /** Porcentaje que hay que aplicar */
  tipo: number;
  /** true si es un tipo reducido; false si es el tipo general */
  esReducido: boolean;
  nombre?: string;
  /** Condiciones del tipo aplicado, para mostrarlas junto al resultado */
  condiciones?: string[];
  /**
   * Reducidos que encajaban con el perfil pero exigen algo que la herramienta no
   * pregunta (municipio, renta, superficie, primera vivienda…). No se aplican, pero
   * SE AVISA de que existen: el usuario puede cumplirlos y no debe perdérselos.
   */
  noComprobables: TipoReducido[];
}

/**
 * Condiciones que la herramienta SÍ puede dar por cumplidas a partir del perfil elegido.
 * Todo lo que no encaje aquí exige un dato que no se pregunta y, por tanto, NO permite
 * aplicar el tipo reducido automáticamente.
 */
const CUBIERTAS_POR_PERFIL: Record<Exclude<PerfilComprador, 'general'>, RegExp> = {
  joven: /^menor (de|o igual)/i,
  'familia-numerosa': /^familia numerosa/i,
  discapacidad: /discapacidad/i,
  vpo: /vpo|protecci[oó]n oficial/i,
};

/** Textos del array `condiciones` que no son requisitos del comprador, sino notas. */
const NO_SON_REQUISITOS = [
  /^desde \w+\/\d{4}$/i,      // vigencia de la norma, no algo que el comprador cumpla
  /^sin l[ií]mite/i,          // aclaración, no restricción
];

/**
 * Condiciones que se cumplen por el SITIO, no por quien compra: al elegir la comunidad
 * el usuario ya las ha declarado. Un tipo reducido cuyas condiciones sean todas de esta
 * clase se aplica solo, sin preguntar el perfil.
 *
 * ── De dónde sale (16/08/2026) ────────────────────────────────────────────────
 * Ceuta y Melilla bonifican el ITP al 50 % por estar el inmueble allí, y eso no lo
 * captura ningún perfil de comprador. `elegirTipoITP` solo miraba candidatos cuyo NOMBRE
 * casara con joven/familia/discapacidad/VPO, así que la bonificación no llegaba nunca a
 * evaluarse: ni se aplicaba ni entraba en `noComprobables`, de modo que tampoco salía el
 * aviso «Podrías pagar menos». Resultado: se cobraba el 6 % en vez del 3 %, el doble, en
 * una página que en el mismo recuadro imprimía «Bonificación automática del 50 % para
 * inmuebles en Ceuta». Lo encontró el Inspector en simulador-gastos-compraventa-garaje.
 */
const CONDICIONES_DE_UBICACION = [
  /^inmueble situado en /i,
  /^bonificaci[oó]n autom[aá]tica/i,
];

/**
 * Elige el tipo de ITP aplicable — y, sobre todo, el que NO se puede aplicar.
 *
 * ── De dónde sale (14/08/2026) ────────────────────────────────────────────────
 * Las tres apps residenciales del clúster llevaban la misma lógica copiada: buscar el
 * PRIMER tipo reducido cuyo nombre contuviera «joven», «familia» o «discapacidad» y
 * aplicarlo comprobando solo su `valorMaximo`, nunca su array `condiciones`.
 *
 * En Madrid —la comunidad que viene seleccionada por defecto— el primero que casa con
 * «joven» es «Jóvenes < 35 años (municipios pequeños)», del 0 %, reservado a municipios
 * de menos de 2.500 habitantes que ninguna de las apps pregunta. Un joven que comprara
 * en la capital leía «ITP (0,0%) — 0,00 €». Mismo patrón en Baleares. Lo encontró el
 * Inspector el 14/08/2026 en dos apps hermanas a la vez.
 *
 * ── El criterio ───────────────────────────────────────────────────────────────
 * En una herramienta fiscal, equivocarse por exceso es recuperable y por defecto no:
 * quien presupuesta 12.000 € y paga 6.000 se alegra; quien presupuesta 0 y paga 12.000
 * tiene un problema. Así que un tipo reducido solo se aplica cuando TODAS sus
 * condiciones están cubiertas por lo que la herramienta pregunta. El resto se devuelve
 * en `noComprobables` para enseñarlo como oportunidad, nunca como cifra.
 *
 * @param viviendaHabitual  Si la operación puede ser vivienda habitual. `true` en la
 *   compra de vivienda; **`false` en garaje, trastero, local, nave y terreno**, donde
 *   la condición «Vivienda habitual» —que aparece en 53 de los tipos reducidos— no se
 *   cumple nunca por definición.
 */
export function elegirTipoITP(
  ccaa: ComunidadAutonoma,
  perfil: PerfilComprador,
  precio: number,
  { viviendaHabitual }: { viviendaHabitual: boolean }
): TipoElegido {
  const datos = ITP_CCAA[ccaa];
  const general: TipoElegido = { tipo: datos.tipoGeneral, esReducido: false, noComprobables: [] };
  if (!datos.tiposReducidos.length) return general;

  const normaliza = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // Bonificaciones que dependen del SITIO y no del comprador: se aplican con cualquier
  // perfil, incluido «general», así que se resuelven ANTES de salir por ese atajo.
  const automaticos = datos.tiposReducidos.filter(
    r =>
      (!r.valorMaximo || precio <= r.valorMaximo) &&
      r.condiciones.length > 0 &&
      r.condiciones.every(
        c => CONDICIONES_DE_UBICACION.some(p => p.test(c)) || NO_SON_REQUISITOS.some(p => p.test(c))
      )
  );
  const mejorAutomatico = automaticos.length
    ? automaticos.reduce((a, b) => (b.tipo < a.tipo ? b : a))
    : null;
  const porUbicacion: TipoElegido | null = mejorAutomatico
    ? {
        tipo: mejorAutomatico.tipo,
        esReducido: true,
        nombre: mejorAutomatico.nombre,
        noComprobables: [],
      }
    : null;

  if (perfil === 'general') return porUbicacion ?? general;

  const patronPerfil = CUBIERTAS_POR_PERFIL[perfil];

  /** ¿Esta condición concreta se puede dar por cumplida sin preguntar nada más? */
  const cubierta = (c: string): boolean => {
    if (NO_SON_REQUISITOS.some(r => r.test(c))) return true;
    if (/^vivienda habitual$|^primera vivienda habitual$/i.test(c)) return viviendaHabitual;
    if (patronPerfil.test(c)) return true;
    // Un límite de VALOR del inmueble sí es comprobable: se contrasta con el precio
    // introducido. Un límite de RENTA no —la app no pregunta ingresos— así que queda
    // fuera de este regex a propósito: si no, «Renta ≤ 36.000 €» se leía como un
    // límite de precio y comparaba 36.000 contra lo que el usuario tecleaba en
    // "Precio de la vivienda". Verificado el 19/08/2026: un joven con un inmueble de
    // 200.000 € en Cataluña perdía el reducido aunque su renta real fuera baja, y uno
    // con un inmueble de 30.000 € lo obtenía sin que nadie le preguntara la renta.
    // Con la renta fuera, esa condición no se puede dar por cumplida y el tipo
    // reducido cae en `noComprobables` —se enseña como oportunidad, nunca como
    // cifra—, que es el mismo criterio que ya rige el resto de esta función.
    if (/renta/i.test(c)) return false;
    const limite = c.match(/[≤<]\s*([\d.]+)\s*€/);
    if (limite) return precio <= Number(limite[1].replace(/\./g, ''));
    return false;
  };

  // Candidatos: los que encajan con el perfil por nombre (mismo criterio de antes)
  const candidatos = datos.tiposReducidos.filter(r => {
    const n = normaliza(r.nombre);
    if (perfil === 'joven') return n.includes('joven');
    if (perfil === 'familia-numerosa') return n.includes('familia');
    if (perfil === 'discapacidad') return n.includes('discapacidad');
    return n.includes('vpo') || n.includes('proteccion oficial');
  });
  if (!candidatos.length) return porUbicacion ?? general;

  const aplicables = candidatos.filter(
    r => (!r.valorMaximo || precio <= r.valorMaximo) && r.condiciones.every(cubierta)
  );
  const noComprobables = candidatos.filter(r => !aplicables.includes(r));

  if (!aplicables.length) {
    return porUbicacion ? { ...porUbicacion, noComprobables } : { ...general, noComprobables };
  }

  // Entre los que sí se pueden aplicar, el más favorable al comprador
  const mejor = aplicables.reduce((a, b) => (b.tipo < a.tipo ? b : a));

  // Y si la bonificación por ubicación es aún mejor, manda esa: son acumulables en el
  // sentido de que el comprador puede acogerse a la que más le convenga, no a las dos.
  if (porUbicacion && porUbicacion.tipo < mejor.tipo) {
    return { ...porUbicacion, noComprobables };
  }

  return {
    tipo: mejor.tipo,
    esReducido: true,
    nombre: mejor.nombre,
    condiciones: mejor.condiciones,
    noComprobables,
  };
}

/**
 * Importe del ITP a partir de un tipo ya elegido con `elegirTipoITP`.
 *
 * Es la forma correcta de calcularlo, y existe porque la otra tenía una trampa: las 7 apps
 * del clúster llamaban a `calcularITP(precio, ccaa, tipoAplicable)` pasando SIEMPRE el
 * tercer argumento —inicializado al tipo general—, y ese argumento cortocircuita la rama de
 * `tramosProgresivos`. Resultado: las 7 CCAA con escala progresiva tributaban al tipo plano
 * del primer tramo mientras la interfaz imprimía, justo encima del resultado, «⚠️ Esta
 * comunidad aplica escala progresiva (10 % → 11 % → 12 % → 13 %)». Anunciaba la escala y no
 * la aplicaba. En Cataluña, un millón de euros salía 5.000 € por debajo.
 *
 * Aquí la distinción es explícita: un tipo REDUCIDO es siempre plano (así están definidos en
 * la normativa autonómica), y el tipo GENERAL se somete a la escala cuando la comunidad la
 * tiene. Al recibir el `TipoElegido` entero, quien llama no puede olvidarse de la diferencia.
 *
 * ⚠️ Los tramos salen de `ITP_CCAA` (este fichero), que vive fuera de `data/fiscal/` y
 * duplica `TIPOS_ITP_CCAA_2025`. Que esos tramos estén al día es trabajo del triaje fiscal
 * mensual; lo que esta función garantiza es que se apliquen los que se anuncian.
 */
export function importeITP(valor: number, ccaa: ComunidadAutonoma, elegido: TipoElegido): number {
  if (elegido.esReducido) return valor * (elegido.tipo / 100);
  return calcularITP(valor, ccaa); // sin tercer argumento: usa la escala si existe
}

/**
 * Rango real del ITP entre comunidades, CALCULADO de la tabla — nunca escrito a mano.
 *
 * ── De dónde sale (19/08/2026) ────────────────────────────────────────────────
 * La misma página del estimador daba TRES rangos incompatibles, y uno se contradecía
 * dentro de su propia frase: el JSON-LD decía «entre el 6 % y el 11 %» y acto seguido
 * citaba «el País Vasco el 4 %»; el bloque educativo, «del 4 % al 11 %»; y la nota de
 * `data/fiscal`, «6-13 %». Ninguno acertaba. Un rango es un dato DERIVADO de la tabla:
 * escribirlo a mano garantiza que se quede atrás en cuanto una comunidad se mueva.
 *
 * `min` es el tipo general más bajo y `max` el tramo más alto de las escalas
 * progresivas. Deliberadamente NO entran los tipos reducidos, que bajan mucho más
 * (Madrid llega a 0 % y Castilla y León a 0,01 %): el rango describe lo que paga quien
 * no encaja en ningún colectivo, que es la lectura útil de «el ITP va del X al Y».
 */
export const RANGO_ITP: { min: number; max: number } = (() => {
  const comunidades = Object.values(ITP_CCAA);
  const generales = comunidades.map((c) => c.tipoGeneral);
  const deEscalas = comunidades.flatMap((c) => (c.tramosProgresivos ?? []).map((t) => t.tipo));
  return {
    min: Math.min(...generales),
    max: Math.max(...generales, ...deEscalas),
  };
})();

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
  /**
   * Valor catastral TOTAL del inmueble (suelo + construcción), tal como figura en el
   * recibo del IBI. Necesario para el método de estimación directa: la ley reparte el
   * incremento real entre suelo y construcción en la misma proporción que el catastro
   * (art. 107.5 TRLHL). Sin este dato el método real NO se calcula, en lugar de
   * calcularse con una proporción inventada.
   *
   * Para suelo sin construcción (solar, finca rústica) coincide con el valor del suelo.
   */
  valorCatastralTotal?: number;
  tipoMaximo?: number; // Por defecto el tipo orientativo (25%); el máximo legal es 30%
}

/**
 * Calcula la plusvalía municipal (IIVTNU) por los dos métodos que permite el RDL 26/2021
 * y devuelve el más favorable, que es el que el contribuyente puede elegir (art. 107.5 TRLHL).
 *
 * - Método objetivo: valor catastral del SUELO × coeficiente según años de tenencia.
 * - Método real (estimación directa): incremento efectivo (venta − compra) multiplicado por
 *   la PROPORCIÓN que el suelo representa sobre el valor catastral total. Sin el valor
 *   catastral total no puede calcularse, y `metodoRealDisponible` lo indica: en ese caso
 *   `recomendado` se queda en el método objetivo, que es el resultado conservador.
 */
export function calcularPlusvaliaMunicipal(datos: DatosPlusvalia): {
  metodoObjetivo: number;
  metodoReal: number;
  metodoRealDisponible: boolean;
  recomendado: number;
  exento: boolean;
} {
  const {
    valorCatastralSuelo,
    aniosPropiedad,
    precioCompra,
    precioVenta,
    valorCatastralTotal,
    tipoMaximo = PLUSVALIA_MUNICIPAL_META.tipoOrientativo,
  } = datos;

  // Coeficientes oficiales (RDL 26/2021 + actualización anual), centralizados en data/fiscal/inmuebles.ts
  const aniosCapped = Math.min(Math.max(aniosPropiedad, 1), 20);
  const coeficiente = COEFICIENTES_IIVTNU_2025.find(c => c.anios === aniosCapped)?.coeficiente ?? 0.45;

  // Método objetivo (art. 107.4 TRLHL)
  const baseObjetivo = valorCatastralSuelo * coeficiente;
  const metodoObjetivo = baseObjetivo * (tipoMaximo / 100);

  // No sujeción cuando no hay incremento de valor (art. 104.5 TRLHL)
  const incrementoReal = precioVenta - precioCompra;
  const exento = incrementoReal <= 0;

  // Método real (art. 107.5 TRLHL): el incremento se reparte en la proporción catastral
  // suelo/total. Solo es calculable si conocemos el valor catastral total.
  const metodoRealDisponible = !!valorCatastralTotal && valorCatastralTotal > 0 && valorCatastralSuelo > 0;
  const proporcionSuelo = metodoRealDisponible
    ? Math.min(1, valorCatastralSuelo / (valorCatastralTotal as number))
    : 0;
  const metodoReal = metodoRealDisponible ? Math.max(0, incrementoReal * proporcionSuelo * (tipoMaximo / 100)) : 0;

  // El contribuyente puede elegir el método más favorable
  const recomendado = exento
    ? 0
    : metodoRealDisponible
      ? Math.min(metodoObjetivo, metodoReal)
      : metodoObjetivo;

  return {
    metodoObjetivo,
    metodoReal,
    metodoRealDisponible,
    recomendado,
    exento,
  };
}

// Enlace para consultar valor de referencia catastral
export const ENLACE_CATASTRO = 'https://www1.sedecatastro.gob.es/Accesos/SECAccvrc.aspx';

/**
 * Calculadora del ITP por CCAA (Inmuebles de Segunda Mano) — lógica pura
 * Usada por: MCP server (calcular_itp_ccaa)
 *
 * Calcula el Impuesto sobre Transmisiones Patrimoniales Onerosas (ITP) en la
 * compraventa de inmuebles de segunda mano, aplicando el tipo vigente de la
 * Comunidad Autónoma de ubicación del inmueble.
 *
 * Marco normativo:
 *   - TRLITP arts. 7-13 (RDL 1/1993): regulación estatal
 *   - Tipo estatal supletorio: 6% (art. 11.1.b TRLITP)
 *   - Competencia autonómica: las CCAA pueden regular el tipo (Ley 22/2009)
 *   - Base imponible: valor de referencia catastral (desde 01/01/2022, Ley 11/2021)
 *     o, si es mayor, el valor declarado / precio
 *
 * Tipos 2025 por CCAA (generales y reducidos principales):
 *   Fuentes: Normativas autonómicas, AEAT, web tributos de cada CCAA.
 *   Verificado a enero 2025. Las CCAA pueden modificar tipos mediante ley.
 *
 * Valor de referencia catastral (LIRPF + TRLITP reforma 2021):
 *   Desde 2022, la base imponible es el mayor entre:
 *   1. Valor de referencia del inmueble (publicado en la Sede del Catastro)
 *   2. Precio acordado o valor declarado
 *   Si el inmueble no tiene valor de referencia, la base es el valor de mercado.
 *
 * Fuente: TRLITP arts. 7-13 + Leyes autonómicas vigentes — verificado 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_compraventa_inmueble, calcular_iivtnu_plusvalia_municipal, calcular_hipoteca
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type ComunidadAutonomaITP =
  | 'andalucia'
  | 'aragon'
  | 'asturias'
  | 'baleares'
  | 'canarias'
  | 'cantabria'
  | 'castilla_la_mancha'
  | 'castilla_leon'
  | 'cataluna'
  | 'extremadura'
  | 'galicia'
  | 'la_rioja'
  | 'madrid'
  | 'murcia'
  | 'navarra'
  | 'pais_vasco'
  | 'valencia';

export type TipoReduccionITP =
  | 'ninguna'
  | 'joven'           // Comprador ≤ 35 años (varía por CCAA)
  | 'vivienda_habitual_bajo_valor' // Precio bajo (varía por CCAA)
  | 'familia_numerosa'
  | 'discapacidad'
  | 'vpo';            // Vivienda de Protección Oficial

export interface ParametrosITPCCAA {
  /** Comunidad Autónoma de ubicación del inmueble */
  comunidadAutonoma: ComunidadAutonomaITP;
  /** Base imponible (valor de referencia catastral o precio si mayor) (€) */
  baseImponible: number;
  /** Tipo de reducción a aplicar (si corresponde) */
  tipoReduccion?: TipoReduccionITP;
  /** Edad del comprador (para reducción jóvenes) */
  edadComprador?: number;
}

interface TarifaITP {
  tipoGeneral: number;         // %
  tipoJoven?: number;          // % para jóvenes (≤35 años, salvo indicación)
  tipoFamiliaNumerosa?: number;
  tipoDiscapacidad?: number;
  tipoVPO?: number;
  limiteEdadJoven?: number;    // edad máxima para tipo joven (default 35)
  notasReduccion?: string;
}

// ─── Tabla de tipos por CCAA 2025 ─────────────────────────────────────────
const TIPOS_ITP_CCAA: Record<ComunidadAutonomaITP, TarifaITP> = {
  andalucia: {
    tipoGeneral: 7,
    tipoJoven: 3.5,
    tipoFamiliaNumerosa: 3.5,
    tipoDiscapacidad: 3.5,
    tipoVPO: 3.5,
    limiteEdadJoven: 35,
    notasReduccion: 'Tipo reducido 3,5% para: jóvenes ≤35 años, VPO, familia numerosa, discapacidad ≥33%, municipios en riesgo de despoblación.',
  },
  aragon: {
    tipoGeneral: 8,
    tipoJoven: 5,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 4,
    tipoVPO: 3,
    limiteEdadJoven: 35,
    notasReduccion: 'Tipo reducido 5% jóvenes ≤35 años vivienda habitual ≤150.000€. VPO: 3%. Discapacidad: 4%.',
  },
  asturias: {
    tipoGeneral: 8,
    tipoJoven: 3,
    tipoFamiliaNumerosa: 3,
    tipoDiscapacidad: 3,
    tipoVPO: 3,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido 3% para jóvenes ≤35 años y familia numerosa/monoparental (vivienda habitual ≤150.000€ y renta ≤30.000€).',
  },
  baleares: {
    tipoGeneral: 8, // progressive: 8% hasta 400k, 9% 400k-600k, 10% 600k-1M, 11% >1M
    tipoJoven: 5,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 5,
    tipoVPO: 4,
    limiteEdadJoven: 36,
    notasReduccion: 'Tarifa progresiva: 8% (≤400k€), 9% (400k-600k€), 10% (600k-1M€), 11% (>1M€). Tipos reducidos para jóvenes, VPO y familia numerosa.',
  },
  canarias: {
    tipoGeneral: 6.5,
    tipoJoven: 4,
    tipoFamiliaNumerosa: 4,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido 4% para VPO, jóvenes ≤35 años con renta limitada, familia numerosa y discapacidad.',
  },
  cantabria: {
    tipoGeneral: 10,
    tipoJoven: 5,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 5,
    tipoVPO: 5,
    limiteEdadJoven: 35,
    notasReduccion: 'Tipo reducido 5% para jóvenes ≤35 años (vivienda habitual ≤150.000€), familia numerosa y discapacidad ≥33%.',
  },
  castilla_la_mancha: {
    tipoGeneral: 9,
    tipoJoven: 6,
    tipoFamiliaNumerosa: 4,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido: jóvenes ≤35 años 6%, familia numerosa 4%, discapacidad ≥33% 4%, VPO 4%.',
  },
  castilla_leon: {
    tipoGeneral: 8,
    tipoJoven: 4,
    tipoFamiliaNumerosa: 4,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido 4% para jóvenes ≤35 años (vivienda habitual), familia numerosa, discapacidad ≥65%. Municipios ≤2.500 hab.: tipo reducido 6%.',
  },
  cataluna: {
    tipoGeneral: 10,
    tipoJoven: 7,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 5,
    tipoVPO: 7,
    limiteEdadJoven: 33,
    notasReduccion: 'Tipo reducido 5% familia numerosa y discapacidad ≥65%. Jóvenes ≤32 años (vivienda habitual ≤190k€): 7%.',
  },
  extremadura: {
    tipoGeneral: 8,
    tipoJoven: 5,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo general 8% (≤122.606€: 7%). Reducidos para jóvenes ≤35 años, VPO y discapacidad.',
  },
  galicia: {
    tipoGeneral: 10,
    tipoJoven: 6,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 5,
    tipoVPO: 5,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido: jóvenes ≤35 años 6% (valor ≤150k€), familia numerosa 5%, discapacidad ≥65% 5%.',
  },
  la_rioja: {
    tipoGeneral: 7,
    tipoJoven: 5,
    tipoFamiliaNumerosa: 5,
    tipoDiscapacidad: 5,
    tipoVPO: 5,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido 5% para jóvenes ≤35 años, VPO, familia numerosa y discapacidad ≥65%.',
  },
  madrid: {
    tipoGeneral: 6,
    tipoJoven: 6, // Sin reducción específica para jóvenes en 2025
    tipoFamiliaNumerosa: 4,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    notasReduccion: 'Tipo general 6% (uno de los más bajos). Sin reducción específica por edad. Familia numerosa y discapacidad ≥65%: 4%.',
  },
  murcia: {
    tipoGeneral: 8,
    tipoJoven: 3,
    tipoFamiliaNumerosa: 3,
    tipoDiscapacidad: 3,
    tipoVPO: 3,
    limiteEdadJoven: 36,
    notasReduccion: 'Tipo reducido 3% para jóvenes ≤35 años (vivienda habitual), familia numerosa y discapacidad ≥33%.',
  },
  navarra: {
    tipoGeneral: 6,
    tipoJoven: 4,
    tipoFamiliaNumerosa: 4,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    limiteEdadJoven: 35,
    notasReduccion: 'Régimen foral navarro. Tipo general 6%. Reducción para VPO, familia numerosa y discapacidad.',
  },
  pais_vasco: {
    tipoGeneral: 4, // Álava, Gipuzkoa y Bizkaia aplican aprox. 4% (varía por territorio)
    tipoJoven: 2.5,
    tipoFamiliaNumerosa: 2.5,
    tipoDiscapacidad: 2.5,
    tipoVPO: 2.5,
    limiteEdadJoven: 36,
    notasReduccion: 'Régimen foral. Tipo general ≈4% (verificar en cada territorio histórico: Álava, Gipuzkoa, Bizkaia). Reducción para VPO, jóvenes y familia numerosa.',
  },
  valencia: {
    tipoGeneral: 10,
    tipoJoven: 6,
    tipoFamiliaNumerosa: 4,
    tipoDiscapacidad: 4,
    tipoVPO: 4,
    limiteEdadJoven: 35,
    notasReduccion: 'Tipo reducido 6% jóvenes ≤35 años (vivienda habitual ≤180k€ y renta ≤30k€). Familia numerosa/discapacidad: 4%.',
  },
};

// ─── Función principal ─────────────────────────────────────────────────────

export interface ResultadoITPCCAA {
  /** Comunidad Autónoma */
  comunidadAutonoma: ComunidadAutonomaITP;
  /** Base imponible aplicada (€) */
  baseImponible: number;
  /** Tipo de reducción aplicado */
  tipoReduccion: TipoReduccionITP;
  /** Tipo impositivo ITP aplicado (%) */
  tipoImpositivo: number;
  /** **Cuota ITP a pagar (€)** */
  cuotaITP: number;
  /** Notas sobre las reducciones disponibles en esa CCAA */
  notasReduccion: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

export function calcularITPCCAA(p: ParametrosITPCCAA): ResultadoITPCCAA {
  if (p.baseImponible <= 0) throw new Error('La base imponible debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tarifa = TIPOS_ITP_CCAA[p.comunidadAutonoma];
  const reduccion = p.tipoReduccion ?? 'ninguna';

  // Determinar tipo aplicable
  let tipoImpositivo: number;
  switch (reduccion) {
    case 'joven': {
      const limiteEdad = tarifa.limiteEdadJoven ?? 35;
      const edadOk = p.edadComprador !== undefined && p.edadComprador <= limiteEdad;
      tipoImpositivo = (tarifa.tipoJoven !== undefined && edadOk) ? tarifa.tipoJoven : tarifa.tipoGeneral;
      if (!edadOk) {
        advertencias.push(`La reducción para jóvenes en ${p.comunidadAutonoma} requiere edad ≤${limiteEdad} años. Se aplica el tipo general.`);
      }
      break;
    }
    case 'familia_numerosa':
      tipoImpositivo = tarifa.tipoFamiliaNumerosa ?? tarifa.tipoGeneral;
      break;
    case 'discapacidad':
      tipoImpositivo = tarifa.tipoDiscapacidad ?? tarifa.tipoGeneral;
      break;
    case 'vpo':
      tipoImpositivo = tarifa.tipoVPO ?? tarifa.tipoGeneral;
      break;
    default:
      tipoImpositivo = tarifa.tipoGeneral;
  }

  const cuotaITP = r(p.baseImponible * tipoImpositivo / 100);

  // Advertencias generales
  advertencias.push('Base imponible (Ley 11/2021, vigor desde 01/01/2022): la base imponible es el MAYOR entre el valor de referencia catastral del inmueble (publicado en la Sede Electrónica del Catastro) y el precio pactado. Si el inmueble no tiene valor de referencia, la base es el valor de mercado.');
  advertencias.push('El ITP lo paga el COMPRADOR en el plazo de 1 mes desde la firma de la escritura de compraventa. Se declara en el modelo 600 en la CCAA de ubicación del inmueble.');
  if (p.comunidadAutonoma === 'baleares') {
    advertencias.push('Baleares aplica tarifa progresiva: 8% (≤400k€), 9% (400k-600k€), 10% (600k-1M€), 11% (>1M€). Se ha aplicado el tipo base del tramo del 8%.');
  }
  if (p.comunidadAutonoma === 'pais_vasco') {
    advertencias.push('País Vasco: verificar el tipo exacto con el territorio histórico concreto (Álava, Gipuzkoa o Bizkaia), ya que cada uno puede tener variaciones.');
  }
  if (p.comunidadAutonoma === 'navarra') {
    advertencias.push('Navarra tiene régimen foral propio. Los tipos indicados son orientativos — verificar con la Hacienda Foral de Navarra.');
  }

  return {
    comunidadAutonoma: p.comunidadAutonoma,
    baseImponible: r(p.baseImponible),
    tipoReduccion: reduccion,
    tipoImpositivo,
    cuotaITP,
    notasReduccion: tarifa.notasReduccion ?? 'Sin notas específicas.',
    advertencias,
    fuenteDatos: 'TRLITP arts. 7-13 (RDL 1/1993) + Normativas autonómicas — vigente 2025',
  };
}

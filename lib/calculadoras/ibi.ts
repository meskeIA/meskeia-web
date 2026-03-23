/**
 * Calculadora del Impuesto sobre Bienes Inmuebles (IBI)
 * Usada por: MCP server (calcular_ibi)
 *
 * Calcula la cuota del IBI a partir del valor catastral del inmueble y
 * el tipo impositivo municipal, incluyendo recargos y bonificaciones
 * habituales.
 *
 * Marco normativo:
 *   - TRLRHL arts. 60-77: Impuesto sobre Bienes Inmuebles
 *   - TRLRHL art. 72: tipos impositivos (limites minimo y maximo)
 *   - TRLRHL art. 73: tipos impositivos incrementados (municipios especiales)
 *   - TRLRHL art. 74: bonificaciones potestativas
 *   - Ley 51/2002: Reforma de la LHL
 *
 * TIPOS IMPOSITIVOS (art. 72 TRLRHL — limites):
 *   a) Bienes inmuebles URBANOS:
 *      Minimo: 0,4% | Maximo: 1,10%
 *      (Municipios con ponencia de valores reciente: minimo 0,3% durante 6 anos)
 *   b) Bienes inmuebles RUSTICOS:
 *      Minimo: 0,3% | Maximo: 0,90%
 *   c) Bienes inmuebles de CARACTERISTICAS ESPECIALES:
 *      Minimo: 0,4% | Maximo: 1,30%
 *
 * TIPOS INCREMENTADOS (art. 73):
 *   Los municipios de > 100.000 habitantes, capitales de provincia o
 *   municipios turisticos pueden incrementar hasta 0,07 puntos los tipos.
 *
 * RECARGOS:
 *   - INMUEBLE DESOCUPADO: hasta el 50% de la cuota liquida para inmuebles
 *     de uso residencial declarados desocupados con caracter permanente
 *     (Ley 12/2023 — Ley de Vivienda — desde 2024 para municipios declarados tensionados)
 *
 * BONIFICACIONES HABITUALES (art. 74):
 *   - Vivienda habitual con valor catastral < umbral: hasta 90% (potestativa)
 *   - VPO (Viviendas de Proteccion Oficial): hasta 50% (3 anos)
 *   - Actividad economica en municipios de escasa actividad: 95%
 *   - Inmuebles en que se desarrollen actividades economicas de especial interes: 95%
 *   - Familia numerosa: hasta 90% (potestativa del municipio)
 *
 * VALOR CATASTRAL:
 *   - Fijado por el Catastro Inmobiliario (DGCE)
 *   - Revisado periodicamente via ponencias de valores
 *   - No puede superar el valor de mercado
 *   - Figurado en el recibo del IBI y en la sede electronica del Catastro
 *
 * Fuente: TRLRHL arts. 60-77 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_rendimiento_capital_inmobiliario, calcular_venta_inmueble, calcular_iivtnu
 */

// --- Constantes ---

// Tipos impositivos minimos y maximos por clase de inmueble
const TIPOS_URBANO = { min: 0.4, max: 1.10 };
const TIPOS_RUSTICO = { min: 0.3, max: 0.90 };
const TIPOS_CARACTERISTICAS_ESPECIALES = { min: 0.4, max: 1.30 };

// --- Tipos publicos ---

export type ClaseInmuebleIBI = 'urbano' | 'rustico' | 'caracteristicas_especiales';

export interface BonificacionIBI {
  descripcion: string;
  /** Porcentaje de bonificacion sobre la cuota integra (%) */
  porcentaje: number;
}

export interface ParametrosIBI {
  claseInmueble: ClaseInmuebleIBI;
  /** Valor catastral del inmueble (EUR) — figura en el recibo IBI */
  valorCatastral: number;
  /**
   * Tipo impositivo municipal aplicado (%)
   * Para urbano: generalmente entre 0,4% y 1,10%
   * Para rustico: entre 0,3% y 0,90%
   */
  tipoImpositivo: number;
  /** El inmueble esta declarado desocupado permanente (recargo Ley 12/2023)? */
  inmuebleDesocupado?: boolean;
  /** Porcentaje de recargo por desocupacion (%), si el municipio lo ha establecido */
  pctRecargoBonificado?: number;
  /** Lista de bonificaciones aplicables al inmueble */
  bonificaciones?: BonificacionIBI[];
}

export interface ResultadoIBI {
  claseInmueble: ClaseInmuebleIBI;
  valorCatastral: number;
  tipoImpositivo: number;
  /** Cuota integra (valor catastral × tipo) */
  cuotaIntegra: number;
  /** Total bonificaciones aplicadas (EUR) */
  totalBonificaciones: number;
  /** Cuota liquida (tras bonificaciones) */
  cuotaLiquida: number;
  /** Recargo por desocupacion (EUR) */
  recargoBonificado: number;
  /** Cuota final a pagar (EUR) */
  cuotaFinalAPagar: number;
  /** El tipo aplicado esta dentro de los limites legales? */
  tipoEnLimites: boolean;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularIBI(p: ParametrosIBI): ResultadoIBI {
  if (p.valorCatastral <= 0) throw new Error('El valor catastral debe ser mayor que cero.');
  if (p.tipoImpositivo <= 0 || p.tipoImpositivo > 5) {
    throw new Error('El tipo impositivo debe estar entre 0,01% y 5%.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const limites = p.claseInmueble === 'urbano' ? TIPOS_URBANO
    : p.claseInmueble === 'rustico' ? TIPOS_RUSTICO
    : TIPOS_CARACTERISTICAS_ESPECIALES;

  const tipoEnLimites = p.tipoImpositivo >= limites.min && p.tipoImpositivo <= limites.max;
  if (!tipoEnLimites) {
    advertencias.push(
      'AVISO: el tipo impositivo indicado (' + p.tipoImpositivo + '%) esta fuera del rango legal ' +
      'para inmuebles ' + p.claseInmueble + ' (' + limites.min + '% - ' + limites.max + '%). ' +
      'Verifique el tipo exacto en el recibo del IBI o en la ordenanza fiscal municipal.'
    );
  }

  const cuotaIntegra = r(p.valorCatastral * p.tipoImpositivo / 100);

  // Aplicar bonificaciones
  let totalBonificaciones = 0;
  let cuotaRestante = cuotaIntegra;
  for (const bon of (p.bonificaciones ?? [])) {
    const importeBon = r(cuotaRestante * bon.porcentaje / 100);
    totalBonificaciones += importeBon;
    cuotaRestante -= importeBon;
  }
  totalBonificaciones = r(totalBonificaciones);
  const cuotaLiquida = r(cuotaIntegra - totalBonificaciones);

  // Recargo por desocupacion
  let recargoBonificado = 0;
  if (p.inmuebleDesocupado && p.pctRecargoBonificado) {
    recargoBonificado = r(cuotaLiquida * p.pctRecargoBonificado / 100);
    advertencias.push(
      'RECARGO POR DESOCUPACION (Ley 12/2023 — Ley de Vivienda): el municipio ha establecido ' +
      'un recargo del ' + p.pctRecargoBonificado + '% sobre la cuota liquida para inmuebles ' +
      'residenciales declarados desocupados con caracter permanente. ' +
      'Este recargo puede llegar hasta el 50% de la cuota liquida.'
    );
  }

  const cuotaFinalAPagar = r(cuotaLiquida + recargoBonificado);

  advertencias.push(
    'El valor catastral figura en el recibo del IBI, en la sede del Catastro ' +
    '(sedecatastro.gob.es) o solicitando nota simple catastral. ' +
    'El tipo impositivo concreto lo fija cada ayuntamiento en su ordenanza fiscal anual.'
  );
  if ((p.bonificaciones ?? []).length === 0) {
    advertencias.push(
      'Posibles bonificaciones aplicables (verificar en el ayuntamiento): ' +
      'familia numerosa (hasta 90%), VPO (hasta 50%), vivienda habitual con bajo valor catastral, ' +
      'actividades economicas de especial interes social.'
    );
  }

  return {
    claseInmueble: p.claseInmueble,
    valorCatastral: r(p.valorCatastral),
    tipoImpositivo: p.tipoImpositivo,
    cuotaIntegra,
    totalBonificaciones,
    cuotaLiquida,
    recargoBonificado,
    cuotaFinalAPagar,
    tipoEnLimites,
    advertencias,
    fuenteDatos: 'TRLRHL arts. 60-77 — vigente 2025',
  };
}

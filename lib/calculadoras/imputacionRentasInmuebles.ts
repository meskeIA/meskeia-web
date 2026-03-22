/**
 * Calculadora de Imputación de Rentas Inmobiliarias — lógica pura
 * Usada por: MCP server (calcular_imputacion_rentas_inmuebles)
 *
 * Calcula la imputación de rentas inmobiliarias que deben declararse en el
 * IRPF por el mero hecho de ser propietario o usufructuario de inmuebles
 * urbanos que no son vivienda habitual y no están arrendados ni afectos
 * a actividades económicas.
 *
 * Marco normativo:
 *   - LIRPF art. 85 (imputación de rentas inmobiliarias)
 *
 * Porcentajes de imputación:
 *   A) 2% del valor catastral:
 *      - Inmuebles sin valor catastral revisado en los últimos 10 períodos
 *        impositivos (es decir, sin revisión a partir de 2015 para el año 2025).
 *      - En la práctica: valores catastrales fijados antes de 2015.
 *
 *   B) 1,1% del valor catastral:
 *      - Inmuebles con valor catastral revisado a partir de 2015 (en los 10
 *        últimos períodos impositivos antes del año en que se imputa).
 *      - Inmuebles que a la fecha de devengo (31/12) carecen de valor catastral:
 *        se aplica el 1,1% sobre el 50% del mayor valor (precio de adquisición
 *        o comprobado por la Administración).
 *
 * Tributación:
 *   - La renta imputada se integra en la BASE IMPONIBLE GENERAL del IRPF.
 *   - Tributa al tipo marginal del contribuyente (escala progresiva general).
 *   - NO es deducible ningún gasto (al contrario que el arrendamiento real).
 *   - Solo por los días del año en que el inmueble estuvo en estas condiciones.
 *
 * Inmuebles excluidos de imputación:
 *   - Vivienda habitual del contribuyente
 *   - Inmuebles en construcción
 *   - Inmuebles afectos a actividades económicas
 *   - Inmuebles arrendados (tributan como rendimientos del capital inmobiliario)
 *   - Inmuebles que no pueden ser usados por causas ajenas al titular
 *     (obras, litigio, etc.)
 *   - Suelo no edificado
 *
 * Fuente: LIRPF art. 85 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_reduccion_arrendamiento_irpf, calcular_rentabilidad_alquiler
 */

// ─── Constantes ────────────────────────────────────────────────────────────

const PCT_IMPUTACION_CATASTRAL_REVISADO = 1.1;   // % si valor catastral revisado en últimos 10 años
const PCT_IMPUTACION_CATASTRAL_NO_REVISADO = 2.0; // % si no revisado en últimos 10 años
const PCT_IMPUTACION_SIN_CATASTRAL = 1.1;         // % sobre 50% del valor adquisición
const PCT_BASE_SIN_CATASTRAL = 50;                // % del valor de adquisición como base proxy
const DIAS_ANIO = 365;

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type SituacionCatastralIRI =
  | 'revisado_reciente'      // Valor catastral revisado en los últimos 10 años → 1,1%
  | 'no_revisado'            // No revisado en los últimos 10 años → 2%
  | 'sin_valor_catastral';   // Sin valor catastral (aplica 1,1% sobre 50% del valor adquisición)

export interface InmuebleImputacion {
  /** Descripción del inmueble (referencia para el informe) */
  descripcion?: string;
  /** Situación del valor catastral del inmueble */
  situacionCatastral: SituacionCatastralIRI;
  /**
   * Valor catastral del inmueble (€).
   * No necesario si situacionCatastral = 'sin_valor_catastral'.
   */
  valorCatastral?: number;
  /**
   * Valor de adquisición / precio de compra (€).
   * Necesario si situacionCatastral = 'sin_valor_catastral'.
   */
  valorAdquisicion?: number;
  /**
   * Porcentaje de titularidad del contribuyente (%).
   * Default: 100% (propietario único). Si hay copropiedad, indica la parte.
   */
  pctTitularidad?: number;
  /**
   * Número de días del año en que el inmueble está en situación de imputación.
   * Si está arrendado parte del año, solo se imputan los días NO arrendados.
   * Default: 365 días.
   */
  diasImputacion?: number;
}

export interface ParametrosImputacionRentasInmuebles {
  /** Lista de inmuebles sujetos a imputación */
  inmuebles: InmuebleImputacion[];
  /** Tipo marginal IRPF del contribuyente (%) — para calcular cuota estimada */
  tipoMarginalIRPF?: number;
}

export interface DetalleInmuebleIRI {
  descripcion: string;
  situacionCatastral: SituacionCatastralIRI;
  pctImputacion: number;
  baseCalculo: number;
  pctTitularidad: number;
  diasImputacion: number;
  rentaImputadaAnual: number;
  rentaImputadaProporcional: number;
}

export interface ResultadoImputacionRentasInmuebles {
  /** Desglose por inmueble */
  detalleInmuebles: DetalleInmuebleIRI[];
  /** **Total renta imputada que se integra en la base imponible general (€)** */
  totalRentaImputada: number;
  /** Tipo marginal aplicado para la estimación (%) */
  tipoMarginalIRPF: number;
  /** **Cuota IRPF estimada por imputación (€)** */
  cuotaIRPFEstimada: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularImputacionRentasInmuebles(
  p: ParametrosImputacionRentasInmuebles
): ResultadoImputacionRentasInmuebles {
  if (p.inmuebles.length === 0) throw new Error('Debe indicar al menos un inmueble.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoMarginal = p.tipoMarginalIRPF ?? 30;

  const detalleInmuebles: DetalleInmuebleIRI[] = [];

  for (const inmueble of p.inmuebles) {
    const descripcion = inmueble.descripcion ?? 'Inmueble sin descripción';
    const pctTitularidad = (inmueble.pctTitularidad ?? 100) / 100;
    const diasImputacion = inmueble.diasImputacion ?? DIAS_ANIO;

    let pctImputacion: number;
    let baseCalculo: number;

    switch (inmueble.situacionCatastral) {
      case 'revisado_reciente':
        if (!inmueble.valorCatastral || inmueble.valorCatastral <= 0) {
          throw new Error(`Inmueble "${descripcion}": debe indicar el valor catastral.`);
        }
        pctImputacion = PCT_IMPUTACION_CATASTRAL_REVISADO;
        baseCalculo = inmueble.valorCatastral;
        break;
      case 'no_revisado':
        if (!inmueble.valorCatastral || inmueble.valorCatastral <= 0) {
          throw new Error(`Inmueble "${descripcion}": debe indicar el valor catastral.`);
        }
        pctImputacion = PCT_IMPUTACION_CATASTRAL_NO_REVISADO;
        baseCalculo = inmueble.valorCatastral;
        break;
      case 'sin_valor_catastral':
        if (!inmueble.valorAdquisicion || inmueble.valorAdquisicion <= 0) {
          throw new Error(`Inmueble "${descripcion}": sin valor catastral, debe indicar el valor de adquisición.`);
        }
        pctImputacion = PCT_IMPUTACION_SIN_CATASTRAL;
        baseCalculo = inmueble.valorAdquisicion * PCT_BASE_SIN_CATASTRAL / 100;
        advertencias.push(`Inmueble "${descripcion}": sin valor catastral asignado. Se aplica el 1,1% sobre el 50% del valor de adquisición (${r(baseCalculo).toLocaleString('es-ES')} €) según LIRPF art. 85.1.c.`);
        break;
    }

    const rentaImputadaAnual = r(baseCalculo * pctImputacion / 100 * pctTitularidad);
    const rentaImputadaProporcional = r(rentaImputadaAnual * diasImputacion / DIAS_ANIO);

    detalleInmuebles.push({
      descripcion,
      situacionCatastral: inmueble.situacionCatastral,
      pctImputacion,
      baseCalculo: r(baseCalculo),
      pctTitularidad: pctTitularidad * 100,
      diasImputacion,
      rentaImputadaAnual,
      rentaImputadaProporcional,
    });
  }

  const totalRentaImputada = r(detalleInmuebles.reduce((s, d) => s + d.rentaImputadaProporcional, 0));
  const cuotaIRPFEstimada = r(totalRentaImputada * tipoMarginal / 100);

  advertencias.push('La renta imputada se integra en la BASE IMPONIBLE GENERAL y tributa al tipo marginal del contribuyente (no al tipo fijo del ahorro). Para calcular la cuota exacta, debe sumarse al resto de rendimientos generales e integrarse en la escala progresiva del IRPF.');
  advertencias.push('NO son deducibles gastos de ningún tipo (IBI, comunidad, hipoteca) en la imputación de rentas (a diferencia del arrendamiento real). Si el inmueble está arrendado parte del año, solo se imputa proporcionalmente por los días no arrendados.');
  advertencias.push('Inmuebles excluidos: vivienda habitual, inmuebles en construcción, afectos a actividad económica, arrendados, y los que no puedan usarse por causas ajenas al titular (litigio, ocupación, obras obligadas por la Administración).');
  if (detalleInmuebles.some(d => d.situacionCatastral === 'no_revisado')) {
    advertencias.push('Para los inmuebles con valor catastral NO revisado en los últimos 10 años se aplica el 2%. Puede comprobar la fecha de revisión catastral en la Sede Electrónica del Catastro (sec.catastro.gob.es) → consulta de valor de referencia o recibo IBI.');
  }

  return {
    detalleInmuebles,
    totalRentaImputada,
    tipoMarginalIRPF: tipoMarginal,
    cuotaIRPFEstimada,
    advertencias,
    fuenteDatos: 'LIRPF art. 85 — vigente 2025',
  };
}

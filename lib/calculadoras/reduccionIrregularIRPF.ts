/**
 * Calculadora de Reduccion por Rendimientos Irregulares en IRPF
 * Usada por: MCP server (calcular_reduccion_irregular_irpf)
 *
 * Calcula la reduccion del 30% aplicable sobre rendimientos del trabajo y
 * actividades economicas que se hayan generado en un periodo superior a
 * dos anos o que se califiquen reglamentariamente como irregulares.
 *
 * Marco normativo:
 *   - LIRPF art. 18.2: reduccion rendimientos del trabajo irregulares
 *   - LIRPF art. 32.1: reduccion rendimientos actividades economicas irregulares
 *   - RIRPF art. 11: rendimientos de trabajo calificados como irregulares
 *   - RIRPF art. 25: rendimientos actividades economicas irregulares
 *   - Consultas DGT: criterios sobre periodo de generacion
 *
 * REQUISITOS PARA LA REDUCCION DEL 30%:
 *   A) Rendimientos del TRABAJO (LIRPF art. 18.2):
 *      - Generados en un periodo > 2 anos Y no obtenidos periodica/recurrentemente
 *      - Casos tipicos: indemnizaciones por despido (no exentas), premios literarios/artisticos,
 *        derechos de imagen, atrasos de convenio con periodo > 2 anos
 *      - LIMITE: la base de la reduccion NO puede superar 300.000 EUR anuales
 *      - LIMITE adicional: si el rendimiento > 700.000 EUR, el limite se reduce
 *
 *   B) Rendimientos de ACTIVIDADES ECONOMICAS (LIRPF art. 32.1):
 *      - Mismos requisitos: > 2 anos de generacion, no periodicos/recurrentes
 *      - Casos tipicos: trabajos artisticos puntuales, honorarios de un proyecto
 *        de varios anos de duracion
 *      - Mismo limite de 300.000 EUR
 *
 * CASOS ESPECIALES (RIRPF arts. 11 y 25):
 *   Son "irregulares" por calificacion reglamentaria (aunque no duren >2 anos):
 *   - Cantidades percibidas por derechos de imagen cedidos >2 anos
 *   - Rendimientos por traslado de residencia a municipio diferente (trabajo)
 *
 * CALCULO:
 *   Base reduccion = importe bruto del rendimiento irregular (hasta limite 300.000 EUR)
 *   Reduccion = base reduccion x 30%
 *   Rendimiento neto reducido = rendimiento bruto - reduccion
 *
 * Fuente: LIRPF arts. 18.2 y 32.1 + RIRPF arts. 11 y 25 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_sueldo_neto, calcular_derechos_autor_irpf
 */

// --- Constantes ---

const PCT_REDUCCION = 30;                // % de reduccion
const LIMITE_BASE_REDUCCION = 300_000;   // EUR - base maxima sobre la que aplica la reduccion

// Si el rendimiento supera este umbral, el limite de la base se reduce proporcionalmente
const UMBRAL_REDUCCION_LIMITE = 700_000; // EUR

// --- Tipos publicos ---

export type TipoRendimientoIrregular =
  | 'indemnizacion_despido'       // Parte no exenta de la indemnizacion por despido
  | 'atrasos_convenio'            // Atrasos de convenio generados en >2 anos
  | 'derechos_imagen'             // Cesion derechos imagen >2 anos
  | 'premios_literarios'          // Premio literario, artistico, cientifico
  | 'honorarios_proyecto_largo'   // Honorarios profesionales de proyecto >2 anos
  | 'otro';                       // Otro rendimiento irregular >2 anos de generacion

export type OrigenRendimiento = 'trabajo' | 'actividad_economica';

export interface ParametrosReduccionIrregularIRPF {
  tipoRendimiento: TipoRendimientoIrregular;
  origenRendimiento: OrigenRendimiento;
  /** Importe bruto del rendimiento irregular (EUR) */
  importeBruto: number;
  /** Periodo de generacion del rendimiento (anos) — debe ser > 2 */
  periodosGeneracionAnos: number;
  /** Gastos deducibles asociados al rendimiento (EUR) */
  gastosDeducibles?: number;
  /** Tipo marginal IRPF del contribuyente (%) — para calcular el ahorro fiscal */
  tipoMarginal?: number;
}

export interface ResultadoReduccionIrregularIRPF {
  tipoRendimiento: TipoRendimientoIrregular;
  origenRendimiento: OrigenRendimiento;
  /** Importe bruto (EUR) */
  importeBruto: number;
  /** Gastos deducibles (EUR) */
  gastosDeducibles: number;
  /** Rendimiento neto previo (EUR) */
  rendimientoNetoPrevio: number;
  /** Base sobre la que se aplica la reduccion (limitada a 300.000 EUR) (EUR) */
  baseReduccion: number;
  /** Importe de la reduccion del 30% (EUR) */
  importeReduccion: number;
  /** Rendimiento neto reducido (EUR) */
  rendimientoNetoReducido: number;
  /** Ahorro fiscal estimado por la reduccion (EUR) */
  ahorroFiscalEstimado: number;
  /** Tipo efectivo sobre el rendimiento bruto tras reduccion (%) */
  tipoEfectivoTraReduccion: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularReduccionIrregularIRPF(p: ParametrosReduccionIrregularIRPF): ResultadoReduccionIrregularIRPF {
  if (p.importeBruto <= 0) throw new Error('El importe bruto debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const gastosDeducibles = r(p.gastosDeducibles ?? 0);
  const rendimientoNetoPrevio = r(Math.max(0, p.importeBruto - gastosDeducibles));

  // Verificar periodo de generacion
  if (p.periodosGeneracionAnos <= 2) {
    advertencias.push(
      'ATENCION: el periodo de generacion indicado (' + p.periodosGeneracionAnos.toFixed(1) + ' anos) ' +
      'no supera los 2 anos requeridos para aplicar la reduccion. ' +
      'La reduccion del 30% solo aplica a rendimientos generados en >2 anos (LIRPF arts. 18.2 y 32.1), ' +
      'salvo los casos de calificacion reglamentaria como irregulares.'
    );
  }

  // Limite de la base de reduccion
  // Si el rendimiento neto supera 700.000 EUR, el limite de la base se reduce
  let limiteBase = LIMITE_BASE_REDUCCION;
  if (rendimientoNetoPrevio > UMBRAL_REDUCCION_LIMITE) {
    limiteBase = r(Math.max(0, LIMITE_BASE_REDUCCION - (rendimientoNetoPrevio - UMBRAL_REDUCCION_LIMITE)));
    advertencias.push(
      'Rendimiento superior a ' + UMBRAL_REDUCCION_LIMITE.toLocaleString('es-ES') + ' EUR: ' +
      'el limite de la base de reduccion se reduce en la misma cuantia que supere ese umbral. ' +
      'Base de reduccion aplicable: ' + limiteBase.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR.'
    );
  }

  const baseReduccion = r(Math.min(rendimientoNetoPrevio, limiteBase));
  const importeReduccion = r(baseReduccion * PCT_REDUCCION / 100);
  const rendimientoNetoReducido = r(rendimientoNetoPrevio - importeReduccion);

  const tipoMarginal = p.tipoMarginal ?? 37; // tipo estimado por defecto
  const ahorroFiscalEstimado = r(importeReduccion * tipoMarginal / 100);
  const tipoEfectivoTraReduccion = p.importeBruto > 0 ? r(rendimientoNetoReducido / p.importeBruto * 100) : 0;

  // Advertencias especificas por tipo
  if (p.tipoRendimiento === 'indemnizacion_despido') {
    advertencias.push(
      'Indemnizacion por despido: solo tributa la parte que excede la cuantia exenta. ' +
      'La parte exenta es: 33 dias/ano trabajado (improcedente, max. 24 meses salario) o ' +
      '20 dias/ano (procedente, max. 12 meses). ' +
      'El exceso sobre la exencion puede aplicar la reduccion del 30% si la indemnizacion ' +
      'corresponde a un periodo de prestacion de servicios > 2 anos.'
    );
  }
  if (p.tipoRendimiento === 'atrasos_convenio') {
    advertencias.push(
      'Atrasos de convenio: los atrasos imputados en ano distinto al que corresponden tributan ' +
      'en el ejercicio en que se perciben, pero pueden aplicar la reduccion del 30% si el periodo ' +
      'que cubren supera los 2 anos. Deben imputarse mediante declaracion complementaria o, ' +
      'si los paga la empresa en el ano siguiente, directamente en la declaracion.'
    );
  }
  advertencias.push(
    'NO PERIODICOS: la reduccion solo aplica si el rendimiento no se obtiene de forma periodica ' +
    'o recurrente. Si el contribuyente recibe cada ano rendimientos de este tipo, la AEAT puede ' +
    'denegar la reduccion por considerarlos rentas regulares.'
  );

  return {
    tipoRendimiento: p.tipoRendimiento,
    origenRendimiento: p.origenRendimiento,
    importeBruto: r(p.importeBruto),
    gastosDeducibles,
    rendimientoNetoPrevio,
    baseReduccion,
    importeReduccion,
    rendimientoNetoReducido,
    ahorroFiscalEstimado,
    tipoEfectivoTraReduccion,
    advertencias,
    fuenteDatos: 'LIRPF arts. 18.2 y 32.1 + RIRPF arts. 11 y 25 - vigente 2025',
  };
}

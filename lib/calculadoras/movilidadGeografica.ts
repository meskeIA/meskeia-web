/**
 * Calculadora de Indemnizacion por Movilidad Geografica
 * Usada por: MCP server (calcular_movilidad_geografica)
 *
 * Calcula la indemnizacion y los derechos del trabajador ante un traslado
 * o desplazamiento geografico decidido por la empresa (ET art. 40).
 *
 * Marco normativo:
 *   - ET art. 40: traslados y desplazamientos
 *   - RD 1438/1985 y ET: reglas especificas
 *   - LIRPF art. 9 y RIRPF art. 9: exencion de las dietas de desplazamiento
 *
 * TRASLADO (ET art. 40.1) — cambio definitivo de centro de trabajo:
 *   Requiere que cambie la residencia habitual del trabajador.
 *   - La empresa debe pagar los GASTOS del traslado del trabajador y su familia.
 *   - Procedimiento: preaviso minimo 30 dias.
 *   - Compensacion economica pactada (minimo legal no fijado expresamente, pero
 *     el trabajador puede optar por rescision con 20 dias/ano, max. 12 meses).
 *   - OPCION DEL TRABAJADOR ANTE EL TRASLADO (ET art. 40.1):
 *     a) Aceptar el traslado (con compensacion de gastos)
 *     b) Rescindir el contrato: 20 dias de salario por ano trabajado (max. 12 meses)
 *     c) Impugnar el traslado ante el juzgado de lo social
 *
 * DESPLAZAMIENTO TEMPORAL (ET art. 40.4) — cambio temporal:
 *   Duracion <= 12 meses en 3 anos (si supera, puede considerarse traslado).
 *   - La empresa debe abonar los GASTOS DE VIAJE + DIETAS de manutencion y estancia.
 *   - Si dura > 3 meses: el trabajador tiene derecho a visitar la familia cada
 *     3 meses a cargo de la empresa.
 *
 * INDEMNIZACION POR RESCISION:
 *   20 dias de salario por ano de servicio, con el maximo de 12 mensualidades.
 *   El calculo es identico al del despido procedente por causas objetivas.
 *
 * Fuente: ET art. 40 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_indemnizacion_despido, calcular_finiquito, calcular_dietas_irpf
 */

// --- Constantes ---

const DIAS_INDEMNIZACION_RESCISION = 20;    // dias por ano (ET art. 40.1)
const MAX_MESES_INDEMNIZACION = 12;          // meses maximos de indemnizacion
const DIAS_LABORABLES_MES = 30;              // dias mes para calculo
const PREAVISO_MINIMO_DIAS = 30;             // dias de preaviso minimo para traslado
const DIAS_DESPLAZAMIENTO_MAX_SIN_TRASLADO = 12 * 30; // 12 meses en 3 anos

// --- Tipos publicos ---

export type TipoMovilidadGeografica = 'traslado' | 'desplazamiento_temporal';
export type DecisionTrabajador = 'aceptar' | 'rescindir' | 'pendiente';

export interface GastosTraslado {
  /** Mudanza y transporte de enseres (EUR) */
  mudanza?: number;
  /** Gastos de viaje del trabajador y familia (EUR) */
  viajesFamilia?: number;
  /** Gastos de alojamiento provisional en destino (EUR) */
  alojamientoProvisional?: number;
  /** Otros gastos acordados (EUR) */
  otros?: number;
}

export interface ParametrosMovilidadGeografica {
  tipoMovilidad: TipoMovilidadGeografica;
  /** Salario bruto mensual del trabajador (EUR) */
  salarioBrutoMensual: number;
  /** Anos de servicio en la empresa */
  anosServicio: number;
  /** Decision del trabajador ante el traslado */
  decisionTrabajador: DecisionTrabajador;
  /** Duracion del desplazamiento temporal (dias) — solo si tipoMovilidad = desplazamiento_temporal */
  diasDesplazamiento?: number;
  /** Gastos del traslado a cargo de la empresa (si decision = aceptar) */
  gastosTraslado?: GastosTraslado;
  /** Zona de destino para las dietas (espana o extranjero) */
  zonaDestino?: 'espana' | 'extranjero';
}

export interface ResultadoMovilidadGeografica {
  tipoMovilidad: TipoMovilidadGeografica;
  decisionTrabajador: DecisionTrabajador;
  /** Salario diario bruto (EUR) */
  salarioDiario: number;
  /** Indemnizacion por rescision (20 dias/ano, max 12 meses) (EUR) */
  indemnizacionRescision: number;
  /** Total gastos de traslado a cargo de la empresa (EUR) */
  totalGastosTraslado: number;
  /** Dietas estimadas por desplazamiento temporal (EUR) */
  dietasEstimadasDesplazamiento: number;
  /** Coste total estimado para la empresa (EUR) */
  costeTotalEmpresa: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularMovilidadGeografica(p: ParametrosMovilidadGeografica): ResultadoMovilidadGeografica {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.anosServicio < 0) throw new Error('Los anos de servicio no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const salarioDiario = r(p.salarioBrutoMensual / DIAS_LABORABLES_MES);

  // --- Indemnizacion por rescision (ET art. 40.1) ---
  const diasIndemnizacion = Math.min(
    p.anosServicio * DIAS_INDEMNIZACION_RESCISION,
    MAX_MESES_INDEMNIZACION * DIAS_LABORABLES_MES
  );
  const indemnizacionRescision = p.decisionTrabajador === 'rescindir'
    ? r(salarioDiario * diasIndemnizacion)
    : 0;

  // --- Gastos de traslado ---
  let totalGastosTraslado = 0;
  if (p.gastosTraslado) {
    totalGastosTraslado = r(
      (p.gastosTraslado.mudanza ?? 0) +
      (p.gastosTraslado.viajesFamilia ?? 0) +
      (p.gastosTraslado.alojamientoProvisional ?? 0) +
      (p.gastosTraslado.otros ?? 0)
    );
  }

  // --- Dietas por desplazamiento temporal ---
  let dietasEstimadasDesplazamiento = 0;
  if (p.tipoMovilidad === 'desplazamiento_temporal' && p.diasDesplazamiento) {
    const limiteDieta = (p.zonaDestino ?? 'espana') === 'espana' ? 53.34 : 91.35; // con pernocta
    dietasEstimadasDesplazamiento = r(p.diasDesplazamiento * limiteDieta);
    if (p.diasDesplazamiento > DIAS_DESPLAZAMIENTO_MAX_SIN_TRASLADO) {
      advertencias.push(
        'Desplazamiento de ' + p.diasDesplazamiento + ' dias: si supera los 12 meses en un periodo ' +
        'de 3 anos, la empresa puede estar obligada a comunicarlo como traslado (ET art. 40.4) ' +
        'con todos los derechos del traslado para el trabajador.'
      );
    }
  }

  const costeTotalEmpresa = r(indemnizacionRescision + totalGastosTraslado + dietasEstimadasDesplazamiento);

  // --- Advertencias ---
  if (p.tipoMovilidad === 'traslado') {
    advertencias.push(
      'Traslado (ET art. 40.1): preaviso minimo de ' + PREAVISO_MINIMO_DIAS + ' dias. ' +
      'El trabajador tiene tres opciones: (1) aceptar con gastos de traslado a cargo de la empresa, ' +
      '(2) rescindir con indemnizacion de ' + DIAS_INDEMNIZACION_RESCISION + ' dias/ano (max. ' + MAX_MESES_INDEMNIZACION + ' meses), ' +
      'o (3) impugnar judicialmente. La indemnizacion por rescision es EXENTA de IRPF.'
    );
  }
  advertencias.push(
    'Gastos de traslado: los gastos de mudanza, viajes y alojamiento provisional pagados por la empresa ' +
    'son EXENTOS de IRPF en la parte que corresponda a un traslado real de residencia (LIRPF art. 42.2). ' +
    'Conserve todas las facturas justificativas.'
  );
  if (p.tipoMovilidad === 'desplazamiento_temporal') {
    advertencias.push(
      'Desplazamiento temporal > 3 meses: el trabajador tiene derecho a visitar su domicilio familiar ' +
      'cada 3 meses a cargo de la empresa. Los viajes y dietas abonados estan exentos de IRPF ' +
      'hasta los limites del RIRPF art. 9 (dietas de desplazamiento).'
    );
  }
  advertencias.push(
    'Representacion legal: en empresas con mas de 5 trabajadores, el traslado colectivo ' +
    '(5+ trabajadores en 3 meses, o 10% de la plantilla) requiere periodo de consultas con los ' +
    'representantes de los trabajadores antes de la decision empresarial (ET art. 40.2).'
  );

  return {
    tipoMovilidad: p.tipoMovilidad,
    decisionTrabajador: p.decisionTrabajador,
    salarioDiario,
    indemnizacionRescision,
    totalGastosTraslado,
    dietasEstimadasDesplazamiento,
    costeTotalEmpresa,
    advertencias,
    fuenteDatos: 'ET art. 40 - vigente 2025',
  };
}

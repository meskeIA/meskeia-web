/**
 * Calculadora de Modificacion Sustancial de Condiciones de Trabajo (MSCT)
 * Usada por: MCP server (calcular_modificacion_sustancial_condiciones)
 *
 * Calcula los derechos economicos del trabajador ante una Modificacion
 * Sustancial de Condiciones de Trabajo (MSCT) decretada por el empresario,
 * incluyendo la indemnizacion por rescision voluntaria del contrato.
 *
 * Marco normativo:
 *   - ET art. 41: modificacion sustancial de condiciones de trabajo
 *   - ET art. 41.3: derecho del trabajador a rescindir el contrato
 *   - ET art. 41.4: impugnacion judicial de la MSCT
 *   - ET art. 82.3: inaplicacion de condiciones de convenio colectivo
 *
 * CONDICIONES QUE PUEDEN MODIFICARSE SUSTANCIALMENTE (ET art. 41.1):
 *   a) Jornada de trabajo
 *   b) Horario y distribucion del tiempo de trabajo
 *   c) Regimen de trabajo a turnos
 *   d) Sistema de remuneracion y cuantia salarial
 *   e) Sistema de trabajo y rendimiento
 *   f) Funciones (cuando excedan los limites del art. 39)
 *
 * TIPOS DE MSCT:
 *   - Individual: afecta a trabajadores concretos que superen umbrales colectivos
 *   - Colectiva: en un periodo de 90 dias supera:
 *     * >= 10 trabajadores (plantilla < 100)
 *     * >= 10% trabajadores (plantilla 100-300)
 *     * >= 30 trabajadores (plantilla > 300)
 *
 * DERECHOS DEL TRABAJADOR (ET art. 41.3):
 *   Si la modificacion es en jornada, horario, turno, salario, sistema trabajo o funciones:
 *   - Opcion A: Aceptar la modificacion
 *   - Opcion B: RESCINDIR el contrato con indemnizacion de 20 dias/ano,
 *     con un maximo de 9 mensualidades
 *   - Opcion C: Impugnar judicialmente en 20 dias habiles
 *
 * IMPUGNACION JUDICIAL (ET art. 41.4 + LJS):
 *   Si el juez declara la MSCT injustificada:
 *   - Nulidad: reposicion en condiciones anteriores + diferencias salariales
 *   - No procede indemnizacion automatica por declaracion de injustificada
 *   - Si el trabajador rescindes tras declaracion de injustificada: indemnizacion igual
 *
 * CALCULO INDEMNIZACION RESCISION (ET art. 41.3):
 *   20 dias de salario por ano de servicio, prorrateandose por meses los periodos
 *   inferiores a un ano, con un maximo de 9 mensualidades.
 *
 * Fuente: ET arts. 41, 82.3 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_despido_improcedente, calcular_movilidad_geografica, calcular_erte_reduccion
 */

// --- Constantes ---

const DIAS_INDEMNIZACION_POR_ANO = 20;
const MAX_MENSUALIDADES = 9;

// --- Tipos publicos ---

export type TipoMSCT =
  | 'jornada'                // Reduccion/ampliacion de jornada
  | 'horario'                // Cambio de horario o turno
  | 'turno'                  // Cambio a trabajo por turnos
  | 'salario'                // Reduccion de retribucion
  | 'sistema_trabajo'        // Cambio en sistema de trabajo y rendimiento
  | 'funciones';             // Modificacion de funciones (art. 39 ET)

export type DecisionTrabajadorMSCT =
  | 'aceptar'               // Acepta la modificacion
  | 'rescindir'             // Rescision voluntaria + indemnizacion 20 d/ano
  | 'impugnar';             // Impugnacion judicial (20 dias habiles)

export interface ParametrosModificacionSustancialCondiciones {
  tiposMSCT: TipoMSCT[];
  decisionTrabajador: DecisionTrabajadorMSCT;
  /** Salario bruto mensual actual (EUR) — incluido todos los conceptos */
  salarioBrutoMensual: number;
  /** Antiguedad: anos completos de servicio */
  anosServicioCompletos: number;
  /** Antiguedad: meses adicionales (fraccion del ultimo ano) */
  mesesServicioAdicionales?: number;
  /** Es una MSCT colectiva? */
  esColectiva?: boolean;
  /** Plantilla de la empresa (para determinar umbrales colectivos) */
  plantillaEmpresa?: number;
  /** Numero de trabajadores afectados por la misma MSCT */
  trabajadoresAfectados?: number;
}

export interface ResultadoModificacionSustancialCondiciones {
  tiposMSCT: TipoMSCT[];
  decisionTrabajador: DecisionTrabajadorMSCT;
  salarioDiario: number;
  salarioBrutoMensual: number;
  /** Total anos de servicio (incluyendo fraccion en meses) */
  totalAnosServicio: number;
  /** Si rescinde: dias de indemnizacion totales (antes del cap) */
  diasIndemnizacion: number;
  /** Si rescinde: indemnizacion sin cap (EUR) */
  indemnizacionSinCap: number;
  /** Si rescinde: cap maximo (9 mensualidades) */
  capMaximoMensualidades: number;
  /** Si rescinde: indemnizacion final (EUR) */
  indemnizacionFinal: number;
  /** Plazo para impugnar: 20 dias habiles desde notificacion */
  plazoImpugnacionDiasHabiles: number;
  /** La MSCT cumple umbrales para ser considerada colectiva? */
  esColectivaPorUmbrales: boolean;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularModificacionSustancialCondiciones(
  p: ParametrosModificacionSustancialCondiciones
): ResultadoModificacionSustancialCondiciones {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.anosServicioCompletos < 0) throw new Error('Los anos de servicio no pueden ser negativos.');
  if (!p.tiposMSCT || p.tiposMSCT.length === 0) throw new Error('Debe indicar al menos un tipo de MSCT.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const mesesAdicionales = p.mesesServicioAdicionales ?? 0;
  const totalAnosServicio = r(p.anosServicioCompletos + mesesAdicionales / 12);
  const salarioDiario = r(p.salarioBrutoMensual * 12 / 365);

  // Indemnizacion por rescision (ET art. 41.3)
  const diasIndemnizacion = r(totalAnosServicio * DIAS_INDEMNIZACION_POR_ANO);
  const indemnizacionSinCap = r(salarioDiario * diasIndemnizacion);
  const capMaximoMensualidades = r(p.salarioBrutoMensual * MAX_MENSUALIDADES);
  const indemnizacionFinal = r(Math.min(indemnizacionSinCap, capMaximoMensualidades));

  // Verificar si es colectiva por umbrales
  let esColectivaPorUmbrales = p.esColectiva ?? false;
  if (!esColectivaPorUmbrales && p.plantillaEmpresa && p.trabajadoresAfectados) {
    if (p.plantillaEmpresa < 100 && p.trabajadoresAfectados >= 10) {
      esColectivaPorUmbrales = true;
    } else if (p.plantillaEmpresa >= 100 && p.plantillaEmpresa <= 300 &&
      p.trabajadoresAfectados >= p.plantillaEmpresa * 0.1) {
      esColectivaPorUmbrales = true;
    } else if (p.plantillaEmpresa > 300 && p.trabajadoresAfectados >= 30) {
      esColectivaPorUmbrales = true;
    }
  }

  // Advertencias
  if (esColectivaPorUmbrales) {
    advertencias.push(
      'MSCT COLECTIVA (ET art. 41.4): al superar los umbrales, la empresa debe seguir ' +
      'el procedimiento de consultas con los representantes de los trabajadores ' +
      '(duracion minima 15 dias). Sin este tramite, la MSCT puede ser declarada nula.'
    );
  }

  if (p.decisionTrabajador === 'rescindir') {
    advertencias.push(
      'RESCISION VOLUNTARIA (ET art. 41.3): el trabajador puede rescindir el contrato ' +
      'dentro de los 15 dias habiles siguientes a la notificacion de la MSCT, ' +
      'con derecho a indemnizacion de ' + DIAS_INDEMNIZACION_POR_ANO + ' dias por ano ' +
      'de servicio (maximo ' + MAX_MENSUALIDADES + ' mensualidades).'
    );
    if (indemnizacionSinCap > capMaximoMensualidades) {
      advertencias.push(
        'TOPE APLICADO: la indemnizacion calculada (' + indemnizacionSinCap.toLocaleString('es-ES') + ' EUR) ' +
        'supera el tope de ' + MAX_MENSUALIDADES + ' mensualidades (' +
        capMaximoMensualidades.toLocaleString('es-ES') + ' EUR). ' +
        'Se aplica el maximo legal.'
      );
    }
    advertencias.push(
      'La indemnizacion por MSCT NO tiene exencion en IRPF ' +
      '(a diferencia del despido improcedente). Tributa integramente como renta del trabajo.'
    );
  }

  if (p.decisionTrabajador === 'impugnar') {
    advertencias.push(
      'IMPUGNACION JUDICIAL: el trabajador tiene 20 dias habiles desde la notificacion ' +
      'para impugnar la MSCT ante el Juzgado de lo Social. Si el juez la declara injustificada, ' +
      'ordena la reposicion en las condiciones anteriores y el abono de diferencias salariales. ' +
      'Es compatible con la rescision posterior si se ejercita antes de la efectividad de la modificacion.'
    );
  }

  advertencias.push(
    'Si la MSCT supone un perjuicio economico relevante para el trabajador, la Inspeccion de Trabajo ' +
    'puede actuar de oficio. Se recomienda asesoria juridico-laboral antes de tomar cualquier decision.'
  );

  return {
    tiposMSCT: p.tiposMSCT,
    decisionTrabajador: p.decisionTrabajador,
    salarioDiario,
    salarioBrutoMensual: r(p.salarioBrutoMensual),
    totalAnosServicio,
    diasIndemnizacion,
    indemnizacionSinCap,
    capMaximoMensualidades,
    indemnizacionFinal,
    plazoImpugnacionDiasHabiles: 20,
    esColectivaPorUmbrales,
    advertencias,
    fuenteDatos: 'ET arts. 41, 82.3 — vigente 2025',
  };
}

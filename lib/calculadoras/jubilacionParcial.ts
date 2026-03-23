/**
 * Calculadora de Jubilacion Parcial
 * Usada por: MCP server (calcular_jubilacion_parcial)
 *
 * Calcula los efectos economicos de la jubilacion parcial: pension del SEPE,
 * salario por las horas trabajadas y coste para la empresa (cotizaciones).
 *
 * Marco normativo:
 *   - LGSS arts. 215-219: jubilacion parcial
 *   - ET art. 12.6: contrato a tiempo parcial vinculado a jubilacion parcial
 *   - RD 1131/2002: regulacion de jubilacion parcial y contrato de relevo
 *   - Ley 27/2011 (reforma sistema SS): endurecimiento requisitos
 *   - RDL 5/2013: requisitos acceso jubilacion anticipada y parcial
 *
 * MODALIDADES DE JUBILACION PARCIAL:
 *
 *   A) CON contrato de relevo (trabajador NO ha llegado a edad ordinaria):
 *      - Edad minima: 63 anos (en 2027 sera 65 para todos; en 2025 depende cotizacion)
 *      - Cotizados: minimo 33 anos (36 si el contrato de relevo es a tiempo parcial)
 *      - Reduccion de jornada: minimo 25%, maximo 75% (67% si el relevo es a tiempo parcial)
 *      - La empresa debe contratar un relevista por las horas liberadas
 *      - La empresa cotiza a la SS como si el jubilado parcial trabajara a JORNADA COMPLETA
 *        (cotizacion ficta — regla especial para evitar fraude)
 *      - Pension SEPE proporcional a la reduccion de jornada
 *
 *   B) SIN contrato de relevo (trabajador ha llegado a edad ordinaria 65/67 anos):
 *      - Reduccion de jornada: 25% a 50%
 *      - Sin obligacion de contratar relevista
 *      - La empresa cotiza solo por las horas efectivas
 *
 * CUANTIA DE LA PENSION PARCIAL:
 *   Pension parcial = Pension de jubilacion ordinaria x % reduccion de jornada
 *   (La pension ordinaria se calcula segun los anos cotizados y la base reguladora)
 *
 * COTIZACION SS EMPRESA (modalidad CON relevo — regla especial):
 *   La empresa cotiza como si el trabajador trabajara a jornada completa durante
 *   los anos que resten hasta la jubilacion ordinaria. Esto supone un sobrecoste
 *   significativo respecto al salario efectivamente pagado.
 *
 * Fuente: LGSS arts. 215-219 + ET art. 12.6 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_pension_publica, calcular_coste_empleado, calcular_pension_desempleo
 */

// --- Constantes ---

const PCT_MIN_REDUCCION_CON_RELEVO = 25;    // % reduccion minima de jornada
const PCT_MAX_REDUCCION_CON_RELEVO = 75;    // % reduccion maxima de jornada
const PCT_MAX_REDUCCION_RELEVO_PARCIAL = 67; // % si el contrato de relevo es a tiempo parcial
const PCT_MIN_REDUCCION_SIN_RELEVO = 25;    // % reduccion minima sin relevo
const PCT_MAX_REDUCCION_SIN_RELEVO = 50;    // % reduccion maxima sin relevo

const TIPO_SS_EMPRESA_CC = 23.6;            // % contingencias comunes empresa
const TIPO_SS_TRABAJADOR_CC = 4.7;          // % contingencias comunes trabajador

// --- Tipos publicos ---

export type ModalidadJubilacionParcial = 'con_relevo' | 'sin_relevo';

export interface ParametrosJubilacionParcial {
  modalidad: ModalidadJubilacionParcial;
  /** Salario bruto mensual actual del trabajador (EUR) */
  salarioBrutoMensual: number;
  /** Porcentaje de reduccion de jornada acordado (%) */
  pctReduccionJornada: number;
  /**
   * Pension de jubilacion ordinaria que le corresponderia al 100% de jornada (EUR/mes)
   * Si no se conoce, se puede estimar a partir de la base reguladora.
   */
  pensionOrdinariaMensual: number;
  /**
   * Base de cotizacion mensual actual (EUR) — puede ser igual al salario bruto
   * o ligeramente diferente segun complementos y devengos.
   */
  baseCotizacionMensual?: number;
  /** Edad del trabajador (anos) — para advertencias sobre requisitos */
  edadTrabajador?: number;
  /** Anos cotizados (para advertencias sobre requisitos) */
  anosCotizados?: number;
}

export interface ResultadoJubilacionParcial {
  modalidad: ModalidadJubilacionParcial;
  /** Porcentaje de reduccion de jornada (%) */
  pctReduccionJornada: number;
  /** Porcentaje de jornada restante (%) */
  pctJornadaRestante: number;
  /** Salario por horas trabajadas (EUR/mes) */
  salarioHorasTrabajadasMensual: number;
  /** Pension parcial del SEPE (EUR/mes) */
  pensionParcialMensual: number;
  /** Ingreso total del trabajador (salario + pension) (EUR/mes) */
  ingresoTotalMensual: number;
  /** Diferencia con el salario a jornada completa (EUR/mes) */
  diferenciaSalarioCompleto: number;
  /** Cuota SS empresa por horas trabajadas (EUR/mes) */
  cuotaSSEmpresaHorasEfectivas: number;
  /**
   * Cuota SS empresa ficta si modalidad con relevo
   * (cotiza como si trabajara a jornada completa) (EUR/mes)
   */
  cuotaSSEmpresaFicta: number;
  /** Coste total empresa (salario + SS empresa) (EUR/mes) */
  costeTotalEmpresaMensual: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularJubilacionParcial(p: ParametrosJubilacionParcial): ResultadoJubilacionParcial {
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.pctReduccionJornada <= 0 || p.pctReduccionJornada >= 100) {
    throw new Error('El porcentaje de reduccion de jornada debe estar entre 1% y 99%.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // Validar limites segun modalidad
  const minRed = p.modalidad === 'con_relevo' ? PCT_MIN_REDUCCION_CON_RELEVO : PCT_MIN_REDUCCION_SIN_RELEVO;
  const maxRed = p.modalidad === 'con_relevo' ? PCT_MAX_REDUCCION_CON_RELEVO : PCT_MAX_REDUCCION_SIN_RELEVO;

  if (p.pctReduccionJornada < minRed || p.pctReduccionJornada > maxRed) {
    advertencias.push(
      'ATENCION: el porcentaje de reduccion de jornada (' + p.pctReduccionJornada + '%) ' +
      'esta fuera del rango permitido para la modalidad ' + p.modalidad + ' (' + minRed + '%-' + maxRed + '%). ' +
      'El calculo se realiza con el porcentaje indicado, pero puede no ser admisible por la SS.'
    );
  }

  const pctJornadaRestante = 100 - p.pctReduccionJornada;
  const salarioHorasTrabajadasMensual = r(p.salarioBrutoMensual * pctJornadaRestante / 100);
  const pensionParcialMensual = r(p.pensionOrdinariaMensual * p.pctReduccionJornada / 100);
  const ingresoTotalMensual = r(salarioHorasTrabajadasMensual + pensionParcialMensual);
  const diferenciaSalarioCompleto = r(p.salarioBrutoMensual - ingresoTotalMensual);

  // SS empresa
  const baseCotizacion = r(p.baseCotizacionMensual ?? p.salarioBrutoMensual);
  const cuotaSSEmpresaHorasEfectivas = r(salarioHorasTrabajadasMensual * TIPO_SS_EMPRESA_CC / 100);

  // Cotizacion ficta (modalidad con relevo): cotiza por la base completa
  const cuotaSSEmpresaFicta = p.modalidad === 'con_relevo'
    ? r(baseCotizacion * TIPO_SS_EMPRESA_CC / 100)
    : cuotaSSEmpresaHorasEfectivas;

  const costeTotalEmpresaMensual = r(salarioHorasTrabajadasMensual + cuotaSSEmpresaFicta);

  // Advertencias
  if (p.modalidad === 'con_relevo') {
    advertencias.push(
      'Jubilacion parcial CON contrato de relevo: la empresa debe contratar a un relevista ' +
      'por las horas liberadas. La SS exige cotizacion FICTA a jornada completa durante el periodo ' +
      'de jubilacion parcial (LGSS art. 218), lo que supone un sobrecoste de cotizacion significativo ' +
      'respecto al salario efectivamente pagado.'
    );
    advertencias.push(
      'Requisitos 2025: edad minima 63 anos (en proceso de equipararse a 65 en 2027), ' +
      'minimo 33 anos cotizados (36 si el relevo es a tiempo parcial). ' +
      'Reduccion de jornada entre 25% y 75% (o 67% si el relevista trabaja a tiempo parcial).'
    );
  } else {
    advertencias.push(
      'Jubilacion parcial SIN contrato de relevo: solo posible cuando el trabajador ha alcanzado ' +
      'la edad ordinaria de jubilacion (65 o 67 anos segun los anos cotizados). ' +
      'La reduccion de jornada debe estar entre el 25% y el 50%.'
    );
  }
  advertencias.push(
    'Pension parcial: la cuantia de la pension parcial es proporcional a la reduccion de jornada ' +
    'sobre la pension que le corresponderia a jornada completa. ' +
    'Esta pension es compatible con el trabajo y tributa en IRPF como rendimiento del trabajo.'
  );

  return {
    modalidad: p.modalidad,
    pctReduccionJornada: p.pctReduccionJornada,
    pctJornadaRestante,
    salarioHorasTrabajadasMensual,
    pensionParcialMensual,
    ingresoTotalMensual,
    diferenciaSalarioCompleto,
    cuotaSSEmpresaHorasEfectivas,
    cuotaSSEmpresaFicta,
    costeTotalEmpresaMensual,
    advertencias,
    fuenteDatos: 'LGSS arts. 215-219 + ET art. 12.6 + RD 1131/2002 - vigente 2025',
  };
}

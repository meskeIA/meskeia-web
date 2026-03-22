/**
 * Calculadora de Indemnización por Despido — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_indemnizacion_despido)
 *
 * Calcula la indemnización según el tipo de despido conforme al ET:
 *
 * A) DESPIDO IMPROCEDENTE (art. 56 ET):
 *    - 33 días de salario por año trabajado, máx 24 mensualidades
 *    - Antigüedad pre-reforma 2012 (antes 12/02/2012): 45 días/año hasta esa fecha, máx 42 mensualidades
 *      ("indemnización dual" o "mochila ibérica")
 *    - El empresario elige: readmisión o pago de indemnización
 *    - Si se elige pago: también los salarios de tramitación (si hay acto de conciliación)
 *
 * B) DESPIDO OBJETIVO (art. 52 ET — causas económicas, técnicas, organizativas o de producción):
 *    - 20 días de salario por año trabajado, máx 12 mensualidades
 *    - Preaviso: 15 días (o SMEI sustitutorio)
 *    - Puede ser declarado improcedente si no se cumplen las causas
 *
 * C) DESPIDO DISCIPLINARIO PROCEDENTE:
 *    - Sin indemnización
 *
 * D) EXTINCIÓN POR CAUSAS OBJETIVAS (ERE / despido colectivo art. 51 ET):
 *    - Misma indemnización que despido objetivo: 20 días/año, máx 12 mensualidades
 *    - Puede mejorar en el acuerdo de ERE
 *
 * Fuente: ET arts. 51, 52, 53, 56 — vigente 2025 (reforma laboral RDL 32/2021)
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_finiquito, calcular_irpf, calcular_pension_desempleo
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoDespido =
  | 'improcedente'
  | 'objetivo'
  | 'colectivo_ere'
  | 'disciplinario_procedente';

export interface ParametrosIndemnizacionDespido {
  /** Tipo de despido */
  tipoDespido: TipoDespido;
  /** Salario bruto anual total (€) — incluye pagas extras prorrateadas */
  salarioBrutoAnual: number;
  /**
   * Fecha de inicio de la relación laboral (YYYY-MM-DD).
   * Para calcular la antigüedad exacta.
   */
  fechaInicio: string;
  /**
   * Fecha de extinción del contrato (YYYY-MM-DD). Por defecto: hoy.
   */
  fechaExtincion?: string;
  /**
   * ¿El trabajador tenía antigüedad previa al 12/02/2012?
   * Solo relevante para despido improcedente (indemnización dual).
   * Por defecto false.
   */
  tieneAntiguedadPreReforma2012?: boolean;
}

export interface ResultadoIndemnizacionDespido {
  /** Tipo de despido */
  tipoDespido: TipoDespido;
  /** Salario diario (€) */
  salarioDiario: number;
  /** Antigüedad total en años (decimal) */
  antiguedadAnios: number;
  /** Antigüedad total en días (para el cálculo exacto) */
  antiguedadDias: number;

  // Para improcedente con período dual
  /** Días de antigüedad pre-reforma 12/02/2012 */
  diasPreReforma?: number;
  /** Días de antigüedad post-reforma 12/02/2012 */
  diasPostReforma?: number;
  /** Indemnización tramo pre-reforma (€) — 45 días/año, máx 42 mensualidades */
  indemnizacionPreReforma?: number;
  /** Indemnización tramo post-reforma (€) — 33 días/año */
  indemnizacionPostReforma?: number;

  /** Días por año de la indemnización principal */
  diasPorAnio: number;
  /** Máximo de mensualidades aplicable */
  maxMensualidades: number;
  /** Indemnización calculada antes de aplicar el tope (€) */
  indemnizacionSinTope: number;
  /** Tope máximo en euros (mensualidades × salario mensual) */
  topeMáximoEuros: number;
  /** **Indemnización final a percibir (€)** */
  indemnizacionFinal: number;
  /** ¿Se ha aplicado el tope máximo? */
  topeAplicado: boolean;
  /** Preaviso legal (días) */
  pravisoDias: number;
  /** Fiscalidad: ¿está exenta de IRPF? */
  exentaIRPF: boolean;
  /** Descripción de la exención de IRPF */
  detalleFiscal: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const FECHA_REFORMA_2012 = new Date('2012-02-12');
const DIAS_IMPROCEDENTE_POST = 33;
const DIAS_IMPROCEDENTE_PRE = 45;
const DIAS_OBJETIVO = 20;
const MAX_MENSUALIDADES_IMPROCEDENTE = 24;
const MAX_MENSUALIDADES_IMPROCEDENTE_PRE = 42;
const MAX_MENSUALIDADES_OBJETIVO = 12;

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIndemnizacionDespido(p: ParametrosIndemnizacionDespido): ResultadoIndemnizacionDespido {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const fechaInicio = new Date(p.fechaInicio);
  const fechaFin = p.fechaExtincion ? new Date(p.fechaExtincion) : new Date();

  if (fechaFin <= fechaInicio) throw new Error('La fecha de extinción debe ser posterior a la fecha de inicio.');

  // Cálculo de días de antigüedad total
  const msTotal = fechaFin.getTime() - fechaInicio.getTime();
  const antiguedadDias = Math.floor(msTotal / (1000 * 60 * 60 * 24));
  const antiguedadAnios = antiguedadDias / 365.25;

  const salarioDiario = r(p.salarioBrutoAnual / 365);
  const salarioMensual = r(p.salarioBrutoAnual / 12);

  let indemnizacionFinal: number;
  let diasPorAnio: number;
  let maxMensualidades: number;
  let indemnizacionSinTope: number;
  let topeMáximoEuros: number;
  let topeAplicado: boolean;
  let pravisoDias: number;
  let exentaIRPF: boolean;
  let detalleFiscal: string;
  let diasPreReforma: number | undefined;
  let diasPostReforma: number | undefined;
  let indemnizacionPreReforma: number | undefined;
  let indemnizacionPostReforma: number | undefined;

  const advertencias: string[] = [];

  switch (p.tipoDespido) {
    case 'disciplinario_procedente':
      return {
        tipoDespido: p.tipoDespido,
        salarioDiario,
        antiguedadAnios: r(antiguedadAnios),
        antiguedadDias,
        diasPorAnio: 0,
        maxMensualidades: 0,
        indemnizacionSinTope: 0,
        topeMáximoEuros: 0,
        indemnizacionFinal: 0,
        topeAplicado: false,
        pravisoDias: 0,
        exentaIRPF: true,
        detalleFiscal: 'Sin indemnización — el despido disciplinario procedente no genera derecho a indemnización.',
        advertencias: [
          'El trabajador puede impugnar la procedencia del despido ante el SMAC y, en su caso, ante el Juzgado de lo Social en el plazo de 20 días hábiles desde la notificación.',
          'Si el despido se declara improcedente, la empresa deberá optar entre readmisión o pago de 33 días/año con máx. 24 mensualidades.',
        ],
        fuenteDatos: 'ET art. 54-55 — Real Decreto Legislativo 2/2015, vigente 2025',
      };

    case 'improcedente':
      diasPorAnio = DIAS_IMPROCEDENTE_POST;
      maxMensualidades = MAX_MENSUALIDADES_IMPROCEDENTE;
      pravisoDias = 0;
      exentaIRPF = true;
      detalleFiscal = 'La indemnización por despido improcedente está exenta de IRPF hasta el importe legal máximo (33 días/año, máx 24 mensualidades). El exceso pactado en convenio o acuerdo tributa en IRPF.';

      if (p.tieneAntiguedadPreReforma2012 && fechaInicio < FECHA_REFORMA_2012) {
        // Cálculo dual
        const msPreReforma = FECHA_REFORMA_2012.getTime() - fechaInicio.getTime();
        diasPreReforma = Math.floor(msPreReforma / (1000 * 60 * 60 * 24));
        const aniosPreReforma = diasPreReforma / 365.25;

        const msPostReforma = fechaFin.getTime() - FECHA_REFORMA_2012.getTime();
        diasPostReforma = Math.floor(msPostReforma / (1000 * 60 * 60 * 24));
        const aniosPostReforma = diasPostReforma / 365.25;

        // Tramo pre-reforma: 45 días/año, tope 42 mensualidades
        const topePreEuros = r(salarioMensual * MAX_MENSUALIDADES_IMPROCEDENTE_PRE);
        indemnizacionPreReforma = Math.min(
          r(salarioDiario * DIAS_IMPROCEDENTE_PRE * aniosPreReforma),
          topePreEuros
        );

        // Tramo post-reforma: 33 días/año (sin tope propio, pero el global es 24 mensualidades)
        indemnizacionPostReforma = r(salarioDiario * DIAS_IMPROCEDENTE_POST * aniosPostReforma);

        // El tope global de 24 mensualidades aplica al TOTAL de la indemnización
        topeMáximoEuros = r(salarioMensual * MAX_MENSUALIDADES_IMPROCEDENTE);
        indemnizacionSinTope = r(indemnizacionPreReforma + indemnizacionPostReforma);
        indemnizacionFinal = Math.min(indemnizacionSinTope, topeMáximoEuros);
        topeAplicado = indemnizacionSinTope > topeMáximoEuros;

        advertencias.push('Se aplica indemnización dual (mochila ibérica): tramo pre-12/02/2012 a 45 días/año y tramo post a 33 días/año. El tope total es 24 mensualidades del salario actual.');
      } else {
        // Cálculo simple post-reforma
        topeMáximoEuros = r(salarioMensual * MAX_MENSUALIDADES_IMPROCEDENTE);
        indemnizacionSinTope = r(salarioDiario * DIAS_IMPROCEDENTE_POST * antiguedadAnios);
        indemnizacionFinal = Math.min(indemnizacionSinTope, topeMáximoEuros);
        topeAplicado = indemnizacionSinTope > topeMáximoEuros;
      }
      advertencias.push('La empresa puede optar por la readmisión en lugar del pago de la indemnización. Si el trabajador es representante sindical, la opción corresponde al propio trabajador.');
      advertencias.push('Los salarios de tramitación (desde el despido hasta la sentencia) solo son exigibles si hay acto de conciliación o resolución judicial y la empresa opta por la readmisión.');
      break;

    case 'objetivo':
    case 'colectivo_ere':
      diasPorAnio = DIAS_OBJETIVO;
      maxMensualidades = MAX_MENSUALIDADES_OBJETIVO;
      pravisoDias = p.tipoDespido === 'objetivo' ? 15 : 15;
      exentaIRPF = true;
      detalleFiscal = 'La indemnización por despido objetivo/colectivo está exenta de IRPF hasta el importe legal mínimo (20 días/año, máx 12 mensualidades).';

      topeMáximoEuros = r(salarioMensual * MAX_MENSUALIDADES_OBJETIVO);
      indemnizacionSinTope = r(salarioDiario * DIAS_OBJETIVO * antiguedadAnios);
      indemnizacionFinal = Math.min(indemnizacionSinTope, topeMáximoEuros);
      topeAplicado = indemnizacionSinTope > topeMáximoEuros;

      if (p.tipoDespido === 'objetivo') {
        advertencias.push('La empresa debe entregar la carta de despido y la liquidación en el momento del cese. Tiene 15 días de preaviso (puede abonarse en metálico en lugar de trabajarse).');
        advertencias.push('Si el despido objetivo es declarado improcedente, la indemnización sube a 33 días/año (máx. 24 mensualidades).');
      }
      if (p.tipoDespido === 'colectivo_ere') {
        advertencias.push('En los EREs, el acuerdo colectivo puede mejorar la indemnización mínima de 20 días/año. Consultar el acuerdo de ERE suscrito.');
        advertencias.push('Los trabajadores afectados por ERE pueden acceder al desempleo con la correspondiente exención de IRPF en la indemnización.');
      }
      break;
  }

  return {
    tipoDespido: p.tipoDespido,
    salarioDiario,
    antiguedadAnios: r(antiguedadAnios),
    antiguedadDias,
    diasPreReforma,
    diasPostReforma,
    indemnizacionPreReforma: indemnizacionPreReforma !== undefined ? r(indemnizacionPreReforma) : undefined,
    indemnizacionPostReforma: indemnizacionPostReforma !== undefined ? r(indemnizacionPostReforma) : undefined,
    diasPorAnio,
    maxMensualidades,
    indemnizacionSinTope: r(indemnizacionSinTope!),
    topeMáximoEuros: r(topeMáximoEuros!),
    indemnizacionFinal: r(indemnizacionFinal!),
    topeAplicado: topeAplicado!,
    pravisoDias,
    exentaIRPF,
    detalleFiscal,
    advertencias,
    fuenteDatos: 'ET arts. 51, 52, 53, 56 — Real Decreto Legislativo 2/2015, vigente 2025',
  };
}

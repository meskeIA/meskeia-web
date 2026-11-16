/**
 * Calculadora de Indemnización por Despido — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_indemnizacion_despido)
 *
 * Calcula la indemnización según el tipo de despido conforme al ET:
 *
 * A) DESPIDO IMPROCEDENTE (art. 56 ET):
 *    - 33 días de salario por año trabajado, máx 24 mensualidades
 *    - Contratos anteriores al 12/02/2012 (DT 11.ª.2 ET): 45 días/año por el tiempo anterior a esa
 *      fecha y 33 por el posterior; tope de 720 días de salario, salvo que el tramo anterior ya dé
 *      más días, en cuyo caso ese es el tope, sin pasar de 42 mensualidades. Se aplica por la FECHA
 *      DE INICIO: no depende de que quien llama lo marque.
 *    - El empresario elige: readmisión o pago de indemnización
 *    - Salarios de tramitación: solo con la readmisión (art. 56.2), o siempre si es representante
 *
 * B) DESPIDO OBJETIVO (art. 52 ET — causas económicas, técnicas, organizativas o de producción):
 *    - 20 días de salario por año trabajado, máx 12 mensualidades
 *    - Preaviso: 15 días (art. 53.1.c)
 *    - Puede ser declarado improcedente si no se cumplen las causas
 *
 * C) DESPIDO DISCIPLINARIO PROCEDENTE:
 *    - Sin indemnización
 *
 * D) DESPIDO COLECTIVO (ERE, art. 51 ET):
 *    - Misma indemnización que despido objetivo: 20 días/año, máx 12 mensualidades
 *    - Puede mejorar en el acuerdo de ERE
 *
 * Datos normativos: `INDEMNIZACION_DESPIDO` y `EXENCION_INDEMNIZACION_DESPIDO_IRPF` de
 * `data/fiscal/laboral.ts`, con la cita literal de cada artículo (auditoría del 16/11/2026).
 * Hasta entonces las cifras vivían aquí, con sello de 15/01/2025, y el tope del improcedente con
 * antigüedad anterior a 2012 era SIEMPRE 24 mensualidades: 30.000 €/año desde el 01/03/1990 daba
 * 60.000 € donde la DT 11.ª da 81.191 €. Además el tramo de 45 días solo se aplicaba si quien
 * llamaba marcaba `tieneAntiguedadPreReforma2012`, y el texto fiscal del objetivo y del colectivo
 * eximía solo hasta 20 días por año (el art. 7.e LIRPF llega a los límites del improcedente).
 *
 * La antigüedad se cuenta en días (días / 365,25), no por meses como dice el «prorrateándose por
 * meses» de la ley: la diferencia es de días de salario y no se cambió en esa auditoría.
 *
 * Encadenable con: calcular_finiquito, calcular_irpf, calcular_pension_desempleo
 */

import { INDEMNIZACION_DESPIDO, EXENCION_INDEMNIZACION_DESPIDO_IRPF } from '@/data/fiscal';

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
   * Para calcular la antigüedad exacta y decidir si aplica el régimen dual de la DT 11.ª ET.
   */
  fechaInicio: string;
  /**
   * Fecha de extinción del contrato (YYYY-MM-DD). Por defecto: hoy.
   */
  fechaExtincion?: string;
  /**
   * @deprecated Se ignora desde el 16/11/2026: el régimen dual lo decide la fecha de inicio
   * (DT 11.ª ET). Se conserva para no romper a quien aún lo pase.
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
  /** Indemnización tramo pre-reforma (€) — 45 días/año */
  indemnizacionPreReforma?: number;
  /** Indemnización tramo post-reforma (€) — 33 días/año */
  indemnizacionPostReforma?: number;

  /** Días por año de la indemnización principal */
  diasPorAnio: number;
  /** Máximo de mensualidades aplicable */
  maxMensualidades: number;
  /** Indemnización calculada antes de aplicar el tope (€) */
  indemnizacionSinTope: number;
  /** Tope máximo en euros */
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

// ─── Constantes (de data/fiscal/laboral.ts) ─────────────────────────────────────

const { improcedente: IMPROCEDENTE, dualPreReforma: DUAL, objetivo: OBJETIVO } = INDEMNIZACION_DESPIDO;
const FECHA_REFORMA_2012 = new Date(DUAL.fechaReforma);
const LIMITE_EXENCION = EXENCION_INDEMNIZACION_DESPIDO_IRPF.limite.toLocaleString('es-ES');
const MS_DIA = 1000 * 60 * 60 * 24;

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIndemnizacionDespido(p: ParametrosIndemnizacionDespido): ResultadoIndemnizacionDespido {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const fechaInicio = new Date(p.fechaInicio);
  const fechaFin = p.fechaExtincion ? new Date(p.fechaExtincion) : new Date();

  if (fechaFin <= fechaInicio) throw new Error('La fecha de extinción debe ser posterior a la fecha de inicio.');

  // Cálculo de días de antigüedad total
  const antiguedadDias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / MS_DIA);
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
          'Si el despido se declara improcedente, la empresa deberá optar entre readmisión o pago de 33 días/año con máx. 24 mensualidades (45 días/año por el tiempo anterior al 12/02/2012 en los contratos de antes de esa fecha).',
        ],
        fuenteDatos: 'ET arts. 54-55 — Real Decreto Legislativo 2/2015',
      };

    case 'improcedente':
      diasPorAnio = IMPROCEDENTE.diasPorAnio;
      maxMensualidades = IMPROCEDENTE.maxMensualidades;
      pravisoDias = 0;
      exentaIRPF = true;
      detalleFiscal = `La indemnización por despido improcedente está exenta de IRPF en la cuantía obligatoria del Estatuto de los Trabajadores, con un límite absoluto de ${LIMITE_EXENCION} € (art. 7.e LIRPF). Lo que se pacte por encima en convenio, pacto o contrato tributa; lo acordado en la conciliación ante el servicio administrativo no cuenta como pactado.`;

      if (fechaInicio < FECHA_REFORMA_2012) {
        // DT 11.ª.2 ET: 45 días/año antes del 12/02/2012 y 33 después. El tope es de 720 días de
        // salario, salvo que el tramo anterior ya dé más días: entonces ese es el tope, sin pasar
        // de 42 mensualidades.
        const finTramoPre = Math.min(fechaFin.getTime(), FECHA_REFORMA_2012.getTime());
        diasPreReforma = Math.floor((finTramoPre - fechaInicio.getTime()) / MS_DIA);
        const aniosPreReforma = diasPreReforma / 365.25;
        diasPostReforma = Math.max(0, Math.floor((fechaFin.getTime() - FECHA_REFORMA_2012.getTime()) / MS_DIA));
        const aniosPostReforma = diasPostReforma / 365.25;

        const diasIndemnizacionPre = DUAL.diasPorAnioAntes * aniosPreReforma;
        indemnizacionPreReforma = r(salarioDiario * diasIndemnizacionPre);
        indemnizacionPostReforma = r(salarioDiario * DUAL.diasPorAnioDespues * aniosPostReforma);

        const preSuperaTope = diasIndemnizacionPre > DUAL.topeDias;
        topeMáximoEuros = preSuperaTope
          ? Math.min(indemnizacionPreReforma, r(salarioMensual * DUAL.maxMensualidadesExcepcion))
          : r(salarioDiario * DUAL.topeDias);
        if (preSuperaTope) maxMensualidades = DUAL.maxMensualidadesExcepcion;
        indemnizacionSinTope = r(indemnizacionPreReforma + indemnizacionPostReforma);
        indemnizacionFinal = Math.min(indemnizacionSinTope, topeMáximoEuros);
        topeAplicado = indemnizacionSinTope > topeMáximoEuros;

        advertencias.push(preSuperaTope
          ? 'Contrato anterior al 12/02/2012 (DT 11.ª ET): el tramo anterior a esa fecha, a 45 días/año, ya supera los 720 días de salario, así que ese importe es el máximo, con un tope absoluto de 42 mensualidades. El tiempo posterior no suma más.'
          : 'Contrato anterior al 12/02/2012 (DT 11.ª ET): 45 días/año por el tiempo anterior a esa fecha y 33 días/año por el posterior, con un tope de 720 días de salario.');
      } else {
        // Cálculo simple post-reforma
        topeMáximoEuros = r(salarioMensual * IMPROCEDENTE.maxMensualidades);
        indemnizacionSinTope = r(salarioDiario * IMPROCEDENTE.diasPorAnio * antiguedadAnios);
        indemnizacionFinal = Math.min(indemnizacionSinTope, topeMáximoEuros);
        topeAplicado = indemnizacionSinTope > topeMáximoEuros;
      }
      advertencias.push('La empresa puede optar por la readmisión en lugar del pago de la indemnización. Si el trabajador es representante sindical, la opción corresponde al propio trabajador.');
      advertencias.push('Los salarios de tramitación (desde el despido hasta la sentencia) solo son exigibles si hay acto de conciliación o resolución judicial y la empresa opta por la readmisión.');
      break;

    case 'objetivo':
    case 'colectivo_ere':
      diasPorAnio = OBJETIVO.diasPorAnio;
      maxMensualidades = OBJETIVO.maxMensualidades;
      pravisoDias = OBJETIVO.preavisoDias;
      exentaIRPF = true;
      detalleFiscal = `Por causas económicas, técnicas, organizativas, de producción o fuerza mayor, la indemnización del despido objetivo (art. 52.c ET) o colectivo está exenta de IRPF hasta los límites del despido IMPROCEDENTE (33 días/año, máx. 24 mensualidades), no solo hasta los 20 días legales, con un límite absoluto de ${LIMITE_EXENCION} € (art. 7.e LIRPF). Una mejora pactada que no pase de ese límite también está exenta.`;

      topeMáximoEuros = r(salarioMensual * OBJETIVO.maxMensualidades);
      indemnizacionSinTope = r(salarioDiario * OBJETIVO.diasPorAnio * antiguedadAnios);
      indemnizacionFinal = Math.min(indemnizacionSinTope, topeMáximoEuros);
      topeAplicado = indemnizacionSinTope > topeMáximoEuros;

      if (p.tipoDespido === 'objetivo') {
        advertencias.push('La empresa debe entregar la carta de despido y la liquidación en el momento del cese. Tiene 15 días de preaviso (puede abonarse en metálico en lugar de trabajarse).');
        advertencias.push('Si el despido objetivo es declarado improcedente, la indemnización sube a 33 días/año (máx. 24 mensualidades).');
      }
      if (p.tipoDespido === 'colectivo_ere') {
        advertencias.push('En los EREs, el acuerdo colectivo puede mejorar la indemnización mínima de 20 días/año. Consultar el acuerdo de ERE suscrito.');
        advertencias.push('Los trabajadores afectados por un despido colectivo pueden acceder a la prestación por desempleo.');
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
    fuenteDatos: 'ET arts. 51, 52, 53, 56 y DT 11.ª + art. 7.e LIRPF — verificado el 16/11/2026',
  };
}

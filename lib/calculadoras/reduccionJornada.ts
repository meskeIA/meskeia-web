/**
 * Calculadora de Reducción de Jornada por Guarda Legal — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_reduccion_jornada)
 *
 * Calcula el impacto económico de la reducción de jornada por guarda legal
 * (art. 37.6 ET), cuidado de menor con discapacidad (art. 37.7 ET) y
 * otros supuestos de reducción de jornada.
 *
 * Derechos reconocidos (art. 37.6 ET):
 * - Cuidado de hijo menor de 12 años
 * - Cuidado de persona con discapacidad que no desempeñe actividad retribuida
 * - Cuidado de familiar hasta 2.º grado con dependencia
 * - Reducción: entre 1/8 y 1/2 de la jornada habitual
 * - Salario: proporcional a la jornada reducida
 *
 * Impacto en prestaciones SS (art. 237 LGSS):
 * - IT (baja médica): base reguladora calculada sobre la jornada reducida
 * - Prestación por nacimiento: se calcula sobre la base de cotización actual (reducida)
 * - PERO: los primeros 24 meses de reducción por cuidado de menor se cotizan
 *   con la base de la jornada completa (protección social reforzada)
 *
 * Derecho adicional: jornada intensiva o adaptación horaria (art. 34.8 ET)
 * si hay menores de 12 años (desde Ley 17/2022 de familias).
 *
 * Fuente: ET arts. 37.6, 37.7, 34.8 + LGSS art. 237 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_baja_medica, calcular_permiso_parental, calcular_sueldo_neto
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type MotivoReduccionJornada =
  | 'hijo_menor_12'
  | 'discapacidad_familiar'
  | 'familiar_dependiente'
  | 'hijo_discapacidad_grave'  // art. 37.7 — reducción hasta 50% sin límite inferior
  | 'otro';

export interface ParametrosReduccionJornada {
  /** Motivo de la reducción de jornada */
  motivo: MotivoReduccionJornada;
  /** Salario bruto mensual a jornada completa (€) */
  salarioBrutoMensualCompleto: number;
  /** Horas semanales a jornada completa */
  horasSemanalesCompletas: number;
  /** Fracción de reducción solicitada (entre 1/8 y 1/2 para guarda legal ordinaria). Ej: 0.5 para media jornada */
  fraccionReduccion: number;
  /** Cotización mensual SS trabajador a jornada completa (€) — para calcular impacto en prestaciones */
  cotizacionSSMensualCompleta?: number;
  /** ¿Lleva menos de 24 meses en reducción? (para saber si la base de cotización es la completa) */
  menosDe24MesesEnReduccion?: boolean;
}

export interface ResultadoReduccionJornada {
  /** Motivo de la reducción */
  motivo: MotivoReduccionJornada;
  /** Fracción de reducción aplicada */
  fraccionReduccion: number;
  /** Porcentaje de jornada que trabaja (%) */
  pctJornadaTrabajada: number;
  /** Porcentaje de jornada reducida (%) */
  pctJornadaReducida: number;
  /** Horas semanales tras la reducción */
  horasSemanalesTrasReduccion: number;
  /** Salario bruto mensual reducido (€) */
  salarioBrutoMensualReducido: number;
  /** Merma mensual en salario bruto (€) */
  mermaMensualBruta: number;
  /** Merma anual en salario bruto (€) */
  mermaAnualBruta: number;
  /** ¿La cotización SS mantiene la base completa? */
  baseSSCompleta: boolean;
  /** Explicación sobre la cotización SS durante la reducción */
  detalleCotizacionSS: string;
  /** Base reguladora estimada para IT/prestaciones (mensual €) */
  baseReguladoraEstimada: number;
  /** Porcentaje de reducción mínimo permitido (%) */
  reduccionMinimaPermitida: number;
  /** Porcentaje de reducción máximo permitido (%) */
  reduccionMaximaPermitida: number;
  /** ¿La reducción solicitada está dentro del rango legal? */
  dentroRangoLegal: boolean;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularReduccionJornada(p: ParametrosReduccionJornada): ResultadoReduccionJornada {
  if (p.salarioBrutoMensualCompleto <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.horasSemanalesCompletas <= 0) throw new Error('Las horas semanales completas deben ser mayores que cero.');
  if (p.fraccionReduccion <= 0 || p.fraccionReduccion >= 1) throw new Error('La fracción de reducción debe estar entre 0 (exclusivo) y 1 (exclusivo).');

  const r = (n: number) => Math.round(n * 100) / 100;

  // Límites legales según motivo
  let reduccionMinimaPct: number;
  let reduccionMaximaPct: number;

  switch (p.motivo) {
    case 'hijo_discapacidad_grave':
      // Art. 37.7 ET: reducción de jornada de al menos el 50%, sin límite máximo mínimo fijado
      reduccionMinimaPct = 50;
      reduccionMaximaPct = 100; // Puede llegar hasta jornada completa de reducción
      break;
    default:
      // Art. 37.6 ET: entre 1/8 (12,5%) y 1/2 (50%)
      reduccionMinimaPct = 12.5; // 1/8
      reduccionMaximaPct = 50;   // 1/2
      break;
  }

  const fraccionReduccionPct = p.fraccionReduccion * 100;
  const dentroRangoLegal = fraccionReduccionPct >= reduccionMinimaPct && fraccionReduccionPct <= reduccionMaximaPct;

  const pctJornadaReducida = r(p.fraccionReduccion * 100);
  const pctJornadaTrabajada = r(100 - pctJornadaReducida);
  const horasSemanalesTrasReduccion = r(p.horasSemanalesCompletas * (1 - p.fraccionReduccion));

  const salarioBrutoMensualReducido = r(p.salarioBrutoMensualCompleto * (1 - p.fraccionReduccion));
  const mermaMensualBruta = r(p.salarioBrutoMensualCompleto - salarioBrutoMensualReducido);
  const mermaAnualBruta = r(mermaMensualBruta * 12);

  // Cotización SS durante la reducción
  // Los primeros 24 meses de reducción por cuidado de menor, la base cotización es la jornada completa (art. 237 LGSS)
  const menosDe24Meses = p.menosDe24MesesEnReduccion ?? true;
  const motivoConProteccionSS = ['hijo_menor_12', 'discapacidad_familiar', 'hijo_discapacidad_grave'].includes(p.motivo);
  const baseSSCompleta = motivoConProteccionSS && menosDe24Meses;

  let detalleCotizacionSS: string;
  let baseReguladoraEstimada: number;

  if (baseSSCompleta) {
    detalleCotizacionSS = 'Durante los primeros 24 meses de reducción por cuidado de menor o discapacidad, la cotización SS se realiza sobre la base de jornada COMPLETA (art. 237.1 LGSS). Esto protege las futuras prestaciones (IT, maternidad/paternidad, jubilación).';
    baseReguladoraEstimada = r(p.cotizacionSSMensualCompleta ?? p.salarioBrutoMensualCompleto);
  } else {
    detalleCotizacionSS = 'Tras los primeros 24 meses o para otros motivos de reducción, la cotización SS se realiza sobre la base de jornada REDUCIDA. Las prestaciones futuras (IT, jubilación) se calcularán sobre la base reducida.';
    baseReguladoraEstimada = salarioBrutoMensualReducido;
  }

  const advertencias: string[] = [
    'El derecho a la reducción de jornada es individual e intransferible. Ambos progenitores pueden disfrutarlo simultáneamente.',
    'La concreción horaria (qué horas se reducen) corresponde al trabajador, dentro de su jornada ordinaria y el horario de la empresa.',
    'El empresario puede optar por concentrar la reducción o distribuirla de otra forma si acredita causa productiva justificada. En caso de desacuerdo, resolverá el Juzgado de lo Social.',
    'Tras los 24 primeros meses, si se mantiene la reducción, la base de cotización SS pasará a ser la jornada reducida, con impacto en IT y futuras prestaciones.',
    'La prestación por IT durante la reducción de jornada se calcula sobre la base de cotización de los últimos 6 meses (que puede ser la reducida si han pasado más de 6 meses desde el inicio de la reducción).',
  ];

  if (!dentroRangoLegal) {
    advertencias.unshift(`⚠️ La reducción solicitada (${fraccionReduccionPct.toFixed(1)}%) está fuera del rango legal permitido (${reduccionMinimaPct}%–${reduccionMaximaPct}%) para el motivo indicado.`);
  }

  if (p.motivo === 'hijo_discapacidad_grave') {
    advertencias.push('El art. 37.7 ET permite reducción de jornada de al menos el 50% para cuidado de menor con enfermedad grave. Puede acumularse en jornadas completas si así lo permite el convenio colectivo.');
  }

  return {
    motivo: p.motivo,
    fraccionReduccion: p.fraccionReduccion,
    pctJornadaTrabajada,
    pctJornadaReducida,
    horasSemanalesTrasReduccion,
    salarioBrutoMensualReducido,
    mermaMensualBruta,
    mermaAnualBruta,
    baseSSCompleta,
    detalleCotizacionSS,
    baseReguladoraEstimada,
    reduccionMinimaPermitida: reduccionMinimaPct,
    reduccionMaximaPermitida: reduccionMaximaPct,
    dentroRangoLegal,
    advertencias,
    fuenteDatos: 'ET arts. 37.6, 37.7, 34.8 + LGSS art. 237 + Ley 17/2022 de familias — vigente 2025',
  };
}

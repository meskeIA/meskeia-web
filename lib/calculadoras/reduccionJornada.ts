/**
 * Calculadora de Reducción de Jornada por Guarda Legal — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_reduccion_jornada)
 *
 * Calcula el impacto económico de la reducción de jornada del art. 37.6 ET:
 * - Párrafo 1.º: cuidado directo de un menor de 12 años o de una persona con discapacidad que no
 *   desempeñe actividad retribuida. Entre 1/8 y 1/2 de la jornada.
 * - Párrafo 2.º: cuidado del cónyuge, pareja de hecho o familiar hasta 2.º grado que no pueda
 *   valerse por sí mismo. Mismo rango.
 * - Párrafo 3.º: menor con cáncer u otra enfermedad grave. Al menos la mitad de la jornada.
 * El salario baja en proporción.
 *
 * Seguridad Social (art. 237.3 LGSS, redacción del RDL 2/2023):
 * - Se cotiza por la jornada REDUCIDA, pero durante los TRES primeros años (párrafos 1.º y 2.º) la
 *   Seguridad Social computa esas cotizaciones incrementadas hasta el 100 % a efectos de
 *   jubilación, incapacidad permanente, muerte y supervivencia, y maternidad y paternidad. La
 *   incapacidad temporal NO está entre ellas: la baja se calcula sobre la base reducida.
 * - En el párrafo 3.º (enfermedad grave) el cómputo al 100 % dura todo el periodo e incluye la IT.
 *
 * Datos normativos: `REDUCCION_JORNADA_GUARDA` y `COMPUTO_COTIZACION_REDUCCION_JORNADA` de
 * `data/fiscal/laboral.ts`, con la cita literal de cada artículo (auditoría del 16/11/2026).
 * Hasta entonces el motor decía «24 meses» (son tres años desde el 18/03/2023), dejaba sin
 * protección al familiar del párrafo 2.º, presentaba el cómputo como una cotización a base
 * completa que protegía también la IT, y citaba como art. 37.7 lo que es el párrafo 3.º del 37.6.
 *
 * Encadenable con: calcular_baja_medica, calcular_permiso_parental, calcular_sueldo_neto
 */

import { REDUCCION_JORNADA_GUARDA, COMPUTO_COTIZACION_REDUCCION_JORNADA } from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type MotivoReduccionJornada =
  | 'hijo_menor_12'            // art. 37.6, párrafo 1.º
  | 'discapacidad_familiar'    // art. 37.6, párrafo 1.º (persona con discapacidad sin actividad retribuida)
  | 'familiar_dependiente'     // art. 37.6, párrafo 2.º
  | 'hijo_discapacidad_grave'  // art. 37.6, párrafo 3.º: menor con cáncer u otra enfermedad grave
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
  /**
   * ¿Está dentro de los tres primeros años de reducción? Solo cuenta en los párrafos 1.º y 2.º del
   * art. 37.6 (en el 3.º el cómputo al 100 % dura todo el periodo). Por defecto true.
   */
  enPrimeros3Anios?: boolean;
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
  /** ¿La Seguridad Social computa las cotizaciones al 100 % (art. 237.3 LGSS)? */
  cotizacionComputadaAl100: boolean;
  /** Prestaciones a las que alcanza ese cómputo (vacío si no hay cómputo al 100 %) */
  prestacionesProtegidas: string[];
  /** Explicación sobre la cotización SS durante la reducción */
  detalleCotizacionSS: string;
  /** Salario mensual con el que computan jubilación, IP, muerte y supervivencia y nacimiento (€) */
  baseComputadaPrestaciones: number;
  /** Salario mensual sobre el que se calcularía una baja por IT (€) */
  baseParaIT: number;
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

const MOTIVOS_GUARDA_ORDINARIA: MotivoReduccionJornada[] = ['hijo_menor_12', 'discapacidad_familiar', 'familiar_dependiente'];

export function calcularReduccionJornada(p: ParametrosReduccionJornada): ResultadoReduccionJornada {
  if (p.salarioBrutoMensualCompleto <= 0) throw new Error('El salario bruto mensual debe ser mayor que cero.');
  if (p.horasSemanalesCompletas <= 0) throw new Error('Las horas semanales completas deben ser mayores que cero.');
  if (p.fraccionReduccion <= 0 || p.fraccionReduccion >= 1) throw new Error('La fracción de reducción debe estar entre 0 (exclusivo) y 1 (exclusivo).');

  const r = (n: number) => Math.round(n * 100) / 100;
  const enfermedadGrave = p.motivo === 'hijo_discapacidad_grave';

  // Límites legales según motivo (art. 37.6 ET)
  const reduccionMinimaPct = enfermedadGrave
    ? REDUCCION_JORNADA_GUARDA.enfermedadGrave.fraccionMinima * 100
    : REDUCCION_JORNADA_GUARDA.ordinaria.fraccionMinima * 100;
  // El párrafo 3.º fija solo un mínimo («al menos la mitad»): no hay máximo legal.
  const reduccionMaximaPct = enfermedadGrave ? 100 : REDUCCION_JORNADA_GUARDA.ordinaria.fraccionMaxima * 100;

  const fraccionReduccionPct = p.fraccionReduccion * 100;
  const dentroRangoLegal = fraccionReduccionPct >= reduccionMinimaPct && fraccionReduccionPct <= reduccionMaximaPct;

  const pctJornadaReducida = r(p.fraccionReduccion * 100);
  const pctJornadaTrabajada = r(100 - pctJornadaReducida);
  const horasSemanalesTrasReduccion = r(p.horasSemanalesCompletas * (1 - p.fraccionReduccion));

  const salarioBrutoMensualReducido = r(p.salarioBrutoMensualCompleto * (1 - p.fraccionReduccion));
  const mermaMensualBruta = r(p.salarioBrutoMensualCompleto - salarioBrutoMensualReducido);
  const mermaAnualBruta = r(mermaMensualBruta * 12);

  // Cómputo al 100 % de las cotizaciones (art. 237.3 LGSS)
  const C = COMPUTO_COTIZACION_REDUCCION_JORNADA;
  const enPrimeros3Anios = p.enPrimeros3Anios ?? true;
  const guardaOrdinariaProtegida = MOTIVOS_GUARDA_ORDINARIA.includes(p.motivo) && enPrimeros3Anios;
  const cotizacionComputadaAl100 = enfermedadGrave || guardaOrdinariaProtegida;
  const prestacionesProtegidas: string[] = enfermedadGrave
    ? [...C.prestacionesEnfermedadGrave]
    : guardaOrdinariaProtegida ? [...C.prestacionesGuardaOrdinaria] : [];

  let detalleCotizacionSS: string;
  if (enfermedadGrave) {
    detalleCotizacionSS = `Se cotiza por la jornada reducida, pero durante TODO el periodo de reducción por cáncer u otra enfermedad grave del menor la Seguridad Social computa esas cotizaciones al 100 % de la jornada completa para ${prestacionesProtegidas.join(', ')} (art. 237.3 LGSS).`;
  } else if (guardaOrdinariaProtegida) {
    detalleCotizacionSS = `Se cotiza por la jornada reducida, pero durante los ${C.aniosGuardaOrdinaria} primeros años la Seguridad Social computa esas cotizaciones al 100 % de la jornada completa para ${prestacionesProtegidas.join(', ')} (art. 237.3 LGSS). La incapacidad temporal no está incluida: una baja se calcula sobre la base reducida.`;
  } else if (MOTIVOS_GUARDA_ORDINARIA.includes(p.motivo)) {
    detalleCotizacionSS = `Pasados los ${C.aniosGuardaOrdinaria} primeros años de reducción, las cotizaciones cuentan por la jornada reducida para todas las prestaciones (art. 237.3 LGSS).`;
  } else {
    detalleCotizacionSS = 'Fuera de los supuestos del art. 37.6 ET no hay cómputo al 100 %: las cotizaciones cuentan por la jornada reducida para todas las prestaciones.';
  }

  const baseComputadaPrestaciones = cotizacionComputadaAl100 ? r(p.salarioBrutoMensualCompleto) : salarioBrutoMensualReducido;
  const baseParaIT = enfermedadGrave ? r(p.salarioBrutoMensualCompleto) : salarioBrutoMensualReducido;

  const advertencias: string[] = [
    'El derecho a la reducción de jornada es de cada persona trabajadora: cada progenitor o familiar que cumpla los requisitos puede pedirla.',
    'La concreción horaria (qué horas se reducen) corresponde a la persona trabajadora dentro de su jornada ordinaria, con preaviso de 15 días o el que fije el convenio, que puede establecer criterios. Las discrepancias las resuelve el Juzgado de lo Social (art. 37.7 ET).',
  ];

  if (!dentroRangoLegal) {
    advertencias.unshift(`⚠️ La reducción solicitada (${fraccionReduccionPct.toFixed(1).replace('.', ',')} %) está fuera del rango legal permitido (${String(reduccionMinimaPct).replace('.', ',')} %–${reduccionMaximaPct} %) para el motivo indicado.`);
  }

  if (enfermedadGrave) {
    advertencias.push('La reducción por cáncer u otra enfermedad grave del menor exige el informe del servicio público de salud y puede acumularse en jornadas completas si lo permite el convenio colectivo (art. 37.6, párrafo 3.º ET).');
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
    cotizacionComputadaAl100,
    prestacionesProtegidas,
    detalleCotizacionSS,
    baseComputadaPrestaciones,
    baseParaIT,
    reduccionMinimaPermitida: reduccionMinimaPct,
    reduccionMaximaPermitida: reduccionMaximaPct,
    dentroRangoLegal,
    advertencias,
    fuenteDatos: 'ET arts. 37.6 y 37.7 + LGSS art. 237.3 (redacción del RDL 2/2023) — verificado el 16/11/2026',
  };
}

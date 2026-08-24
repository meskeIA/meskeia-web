/**
 * Datos Seguridad Social: Pensión pública de jubilación
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento previsional.
 * Datos verificados a la fecha indicada. El sistema de pensiones puede
 * cambiar con cada reforma legislativa. Verifica siempre en la SS.
 *
 * Fuente: LGSS (RDL 8/2015) + Ley 21/2021 (reforma pensiones) + RDL 16/2025
 * Verificado: 2026-03-16 (la fecha de cada bloque manda: ver los _META del fichero)
 * URL oficial SS: https://www.seg-social.es/wps/portal/wss/internet/Pensionistas
 * Simulador oficial: https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/vidaLaboral-y-pensiones/simuladorPensionJubilacion
 */

import { SMI_2026 } from './smi';

export const FISCAL_PENSIONES_META = {
  fuente: 'LGSS (RDL 8/2015) + Ley 21/2021 de Reforma de Pensiones + RD 241/2026 (revalorización y cuantías mínimas 2026)',
  verificado: '2026-08-12',
  vigencia: '2026',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Pensionistas',
  nota: 'Las cifras son orientativas. La SS calcula la pensión real a partir de tu historial completo de cotización. Consulta tu vida laboral en la Sede Electrónica de la SS.',
};

// ─── Edad de jubilación ordinaria (tabla progresiva 2024-2027+) ──────────────

/**
 * Tabla de edad de jubilación por año en que se produce la jubilación.
 * Con cotización suficiente: jubilación a los 65 años.
 * Sin cotización suficiente: edad progresiva hasta 67 años (definitivo en 2027).
 *
 * Fuente: Ley 27/2011 + Ley 21/2021 (calendario transitorio)
 */
export interface EdadJubilacionAnio {
  anio: number;
  edadSinCotizacion: { anios: number; meses: number };
  cotizacionPara65: { anios: number; meses: number };
}

export const TABLA_EDAD_JUBILACION: EdadJubilacionAnio[] = [
  { anio: 2024, edadSinCotizacion: { anios: 66, meses: 6 },  cotizacionPara65: { anios: 38, meses: 0 } },
  { anio: 2025, edadSinCotizacion: { anios: 66, meses: 8 },  cotizacionPara65: { anios: 38, meses: 3 } },
  { anio: 2026, edadSinCotizacion: { anios: 66, meses: 10 }, cotizacionPara65: { anios: 38, meses: 3 } },
  { anio: 2027, edadSinCotizacion: { anios: 67, meses: 0 },  cotizacionPara65: { anios: 38, meses: 6 } },
];

/** Obtiene la edad de jubilación para un año dado */
export function getEdadJubilacion(anio: number): EdadJubilacionAnio {
  if (anio >= 2027) return TABLA_EDAD_JUBILACION[3]; // 67 años definitivo
  const entry = TABLA_EDAD_JUBILACION.find(e => e.anio === anio);
  return entry ?? TABLA_EDAD_JUBILACION[3];
}

// Mantener compatibilidad con apps existentes
export const EDAD_JUBILACION_2025 = {
  edadOrdinariaMesesShort: 66 * 12 + 8, // 66 años y 8 meses (2025)
  edadOrdinariaMesesLong: 65 * 12,       // 65 años
  mesesCotizadosParaJubilacion65: 38 * 12 + 3, // 459 meses (corregido: 38a 3m)
};

// ─── Años mínimos de cotización ───────────────────────────────────────────────

export const COTIZACION_MINIMA = {
  anosMinimosAcceso: 15,       // Años mínimos para tener pensión
  mesesMinimosAcceso: 180,
  anosParaCien: 36.75,         // Años para alcanzar el 100% en 2025 (transitorio)
  mesesParaCien: 441,          // 36 años y 9 meses (transitorio 2025)
};

// ─── Porcentaje de pensión según años cotizados ────────────────────────────

/**
 * Sistema de tramos para calcular el % de pensión (Ley 21/2021, transitorio 2025)
 * - Primeros 15 años (180 meses): 50%
 * - Meses 181 a 276 (hasta ~23 años): +0.21% por mes adicional
 * - Meses 277 en adelante (hasta cap): +0.19% por mes adicional
 * - Máximo: 100%
 */
export interface TramosPorcentajePension {
  mesesDesde: number;
  mesesHasta: number;
  porcentajeBase: number;       // % acumulado al inicio del tramo
  incrementoPorMes: number;     // % adicional por cada mes extra
}

export const TRAMOS_PORCENTAJE_PENSION_2025: TramosPorcentajePension[] = [
  { mesesDesde: 180, mesesHasta: 180,  porcentajeBase: 50,    incrementoPorMes: 0 },
  { mesesDesde: 181, mesesHasta: 276,  porcentajeBase: 50,    incrementoPorMes: 0.21 },
  { mesesDesde: 277, mesesHasta: 9999, porcentajeBase: 70.16, incrementoPorMes: 0.19 },
];

// ─── Límites de pensión 2026 (euros/mes, 14 pagas) ───────────────────────────
// Actualizado 2026-03-16. Revalorización ~2,8% IPC.

export const LIMITES_PENSION_2025 = {
  maximaMensual:   3359.60,  // Pensión máxima mensual 2026 (era 3.267,60 en 2025)
  maximaAnual:     47034.40, // Pensión máxima anual (× 14 pagas)
  minimaConConyuge: 1256.60, // Mínima ≥65 con cónyuge a cargo (17.592,40 € / 14)
  minimaSinConyuge:  888.70, // Mínima ≥65 con cónyuge no a cargo (12.441,80 € / 14)
  minimaSolo:        936.20, // Mínima ≥65 unidad unipersonal (13.106,80 € / 14)
};

// ─── Base Reguladora ──────────────────────────────────────────────────────────

/**
 * La base reguladora (BR) es el promedio de las 300 últimas bases de cotización
 * dividido entre 350 (para compensar lagunas de cotización).
 * BR = Σ(últimas 300 bases mensuales) / 350
 *
 * Simplificación orientativa: BR ≈ base_media_mensual × (300 / 350)
 * Factor: 300/350 ≈ 0.8571
 */
export const BASE_REGULADORA = {
  mesesConsiderados: 300,  // Últimos 25 años
  divisor: 350,            // Incluye compensación de lagunas
  factor: 300 / 350,       // ≈ 0.8571
};

// ─── Sistema Dual: base reguladora ampliada (DT 40.a LGSS, RDL 2/2023) ──────

/**
 * Sistema dual de cálculo de pensión (vigente desde 1 enero 2026).
 * La SS aplica DE OFICIO la fórmula más favorable al trabajador.
 *
 * Opción 1 (clásica): BASE_REGULADORA (300 meses / 350)
 * Opción 2 (ampliada): Selecciona las N mejores bases de un período más amplio,
 *   descartando las peores. Transición gradual 2026→2037 (29 años en 2037).
 *
 * Fuente: DT 40.a LGSS (RDL 2/2023, de 16 de marzo)
 */
export interface SistemaDualParams {
  anio: number;
  ventanaMeses: number;       // Período de bases consideradas
  basesSeleccionadas: number; // Mejores bases que se suman
  divisor: number;            // Divisor para calcular la BR
}

export const SISTEMA_DUAL_TRANSICION: SistemaDualParams[] = [
  { anio: 2026, ventanaMeses: 304, basesSeleccionadas: 302, divisor: 352.33 },
  { anio: 2027, ventanaMeses: 308, basesSeleccionadas: 304, divisor: 354.67 },
  { anio: 2028, ventanaMeses: 312, basesSeleccionadas: 306, divisor: 357.00 },
  { anio: 2029, ventanaMeses: 316, basesSeleccionadas: 308, divisor: 359.33 },
  { anio: 2030, ventanaMeses: 320, basesSeleccionadas: 310, divisor: 361.67 },
  { anio: 2031, ventanaMeses: 324, basesSeleccionadas: 312, divisor: 364.00 },
  { anio: 2032, ventanaMeses: 328, basesSeleccionadas: 314, divisor: 366.33 },
  { anio: 2033, ventanaMeses: 332, basesSeleccionadas: 316, divisor: 368.67 },
  { anio: 2034, ventanaMeses: 336, basesSeleccionadas: 318, divisor: 371.00 },
  { anio: 2035, ventanaMeses: 340, basesSeleccionadas: 320, divisor: 373.33 },
  { anio: 2036, ventanaMeses: 344, basesSeleccionadas: 322, divisor: 375.67 },
  { anio: 2037, ventanaMeses: 348, basesSeleccionadas: 324, divisor: 378.00 },
];

/** Obtiene los parámetros del sistema dual para un año dado */
export function getSistemaDualParams(anio: number): SistemaDualParams {
  if (anio < 2026) return SISTEMA_DUAL_TRANSICION[0];
  if (anio >= 2037) return SISTEMA_DUAL_TRANSICION[11];
  return SISTEMA_DUAL_TRANSICION.find(s => s.anio === anio) ?? SISTEMA_DUAL_TRANSICION[0];
}

// ─── Jubilación anticipada: coeficientes reductores 2025 ─────────────────────

/**
 * Coeficientes reductores por trimestre de anticipación respecto a edad ordinaria.
 * El coeficiente aplicable depende de los AÑOS COTIZADOS (no del trimestre de
 * anticipación): a más años cotizados, menor penalización por trimestre.
 * El mismo coeficiente (plano) se aplica a todos los trimestres anticipados.
 * Distintos según sea voluntaria (a iniciativa del trabajador) o involuntaria
 * (despido colectivo, ERTE, cierre empresa u otras causas ajenas).
 *
 * Fuente: RDL 2/2023 (DT 33ª y 34ª LGSS) + LGSS art. 207 y 208
 */

export interface CoeficienteAnticipadaPorAnios {
  /** Límite superior (exclusivo) de años cotizados para este tramo. Infinity = sin límite. */
  aniosCotizadosHasta: number;
  /** % de reducción fijo por cada trimestre (o fracción) de anticipación */
  reduccionPorTrimestre: number;
}

// Jubilación INVOLUNTARIA (causa no imputable al trabajador)
// Requisito: ≥ 33 años cotizados, hasta 4 años antes de la edad ordinaria
export const COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025: CoeficienteAnticipadaPorAnios[] = [
  { aniosCotizadosHasta: 38.5, reduccionPorTrimestre: 1.875 }, // < 38a 6m
  { aniosCotizadosHasta: 41.5, reduccionPorTrimestre: 1.750 }, // 38a6m - 41a6m
  { aniosCotizadosHasta: 44.5, reduccionPorTrimestre: 1.625 }, // 41a6m - 44a6m
  { aniosCotizadosHasta: Infinity, reduccionPorTrimestre: 1.500 }, // ≥ 44a6m
];

export const REQUISITOS_ANTICIPADA_INVOLUNTARIA = {
  anosMinimoCotizados: 33,
  maxMesesAnticipacion: 48, // hasta 4 años antes
  anosCotizadosEnUltimos15: 2, // Al menos 2 años cotizados en los últimos 15 (LGSS art. 207.1.d)
};

// Jubilación VOLUNTARIA (a iniciativa del propio trabajador)
// Requisito: ≥ 35 años cotizados, hasta 2 años antes de la edad ordinaria
export const COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025: CoeficienteAnticipadaPorAnios[] = [
  { aniosCotizadosHasta: 38.5, reduccionPorTrimestre: 2.00 }, // < 38a 6m
  { aniosCotizadosHasta: 41.5, reduccionPorTrimestre: 1.87 }, // 38a6m - 41a6m
  { aniosCotizadosHasta: 44.5, reduccionPorTrimestre: 1.75 }, // 41a6m - 44a6m
  { aniosCotizadosHasta: Infinity, reduccionPorTrimestre: 1.63 }, // ≥ 44a6m
];

export const REQUISITOS_ANTICIPADA_VOLUNTARIA = {
  anosMinimoCotizados: 35,
  maxMesesAnticipacion: 24, // hasta 2 años antes
};

/** Devuelve el coeficiente de reducción por trimestre aplicable según los años cotizados. */
export function getCoeficienteAnticipada(anosCotizados: number, tabla: CoeficienteAnticipadaPorAnios[]): number {
  const tramo = tabla.find(t => anosCotizados < t.aniosCotizadosHasta) ?? tabla[tabla.length - 1];
  return tramo.reduccionPorTrimestre;
}

// ─── Plan de Pensiones: límites fiscales 2025 ────────────────────────────────

export const FISCAL_PLAN_PENSIONES_META = {
  fuente: 'Ley 35/2006 IRPF art. 51 + LPGE 2025 (prórroga 2026)',
  verificado: '2026-06-14',
  vigencia: '2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es',
  nota: 'Límites orientativos 2026. Consulta con tu entidad gestora o asesor fiscal.',
};

export const LIMITES_PLAN_PENSIONES_2025 = {
  limiteIndividualAnual:    1500,  // €/año (solo aportación del trabajador)
  limiteEmpresaAnual:       8500,  // €/año adicional si incluye contribución empresarial
  limiteTotalAnual:        10000,  // €/año suma individual + empresa
  limiteDiscapacidadAnual: 24250,  // Para personas con discapacidad ≥ 33%
};

// ─── Jubilación Parcial: requisitos vigentes (RDL 11/2024) ───────────────────
//
// ⚠️ 2026-08-12: el art. 215 LGSS fue reescrito por el RDL 11/2024, de 23 de
//    diciembre, CON EFECTOS DESDE EL 1 DE ABRIL DE 2025 — dos meses y medio
//    después del sello anterior de este bloque (2025-01-15), así que sus datos
//    eran previos a la reforma. Además arrastraba una `edadMinima: 60` que no
//    procedía ni de la redacción anterior (que exigía 65, o 63 con 36 años y 6
//    meses cotizados): era un residuo del régimen anterior a 2013.
//
//    La ley NO fija una edad mínima absoluta. Exige estar como máximo a TRES
//    años de la edad ordinaria de jubilación, que depende del año y de los años
//    cotizados (ver TABLA_EDAD_JUBILACION y edadMinimaJubilacionParcial()).

export const JUBILACION_PARCIAL_META = {
  fuente: 'LGSS (RDL 8/2015) arts. 215 y 216, en la redacción dada por el RDL 11/2024 (efectos desde 01/04/2025)',
  verificado: '2026-08-12',
  vigencia: '2026',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Jubilacion',
  nota: 'Requisitos orientativos del régimen general. Existen supuestos especiales por convenio colectivo o sector (por ejemplo, la industria manufacturera). Verifica siempre en la SS.',
};

export const REQUISITOS_JUBILACION_PARCIAL = {
  /** Años que como máximo puede anticiparse sobre la edad ordinaria (art. 215.2.a) */
  anticipacionMaximaAnios:  3,
  anosCotizadosMinimos:     33,    // Años cotizados mínimos (con contrato de relevo)
  anosCotizadosDiscapacidad: 25,   // Si discapacidad ≥ 33 % (art. 215.2.a)
  antiguedadEmpresaAnios:   6,     // Antigüedad en la empresa inmediatamente anterior
  reduccionJornadaMin:      25,    // % mínimo de reducción de jornada
  reduccionJornadaMax:      75,    // % máximo de reducción de jornada
  /** Si se anticipa MÁS de 2 años, el primer año la reducción va entre estos límites */
  anticipacionQueLimitaPrimerAno: 2,
  reduccionPrimerAnoMin:    20,
  reduccionPrimerAnoMax:    33,
  exigeContratoRelevo:      true,  // El empleador debe contratar un relevista simultáneamente
};

/**
 * Edad mínima real de acceso a la jubilación parcial con contrato de relevo,
 * en años decimales: la edad ordinaria que corresponda menos 3 años.
 *
 * La edad ordinaria depende de si se acredita la cotización suficiente del año
 * (38 años y 3 meses en 2026), de ahí que haga falta pasar los años cotizados.
 */
export function edadMinimaJubilacionParcial(anio: number, anosCotizados: number): number {
  const edades = getEdadJubilacion(anio);
  const cotizacionSuficiente =
    anosCotizados >= edades.cotizacionPara65.anios + edades.cotizacionPara65.meses / 12;
  const ordinaria = cotizacionSuficiente
    ? 65
    : edades.edadSinCotizacion.anios + edades.edadSinCotizacion.meses / 12;
  return ordinaria - REQUISITOS_JUBILACION_PARCIAL.anticipacionMaximaAnios;
}

// ─── Cuantías mínimas de VIUDEDAD 2026 (fuente única) ────────────────────────
//
// Anexo I del Real Decreto 241/2026, de 25 de marzo (BOE-A-2026-6977), tomado
// literalmente en euros/AÑO; el importe mensual sale de dividir entre 14 pagas.
//
// ⚠️ 2026-08-12: estas cifras estaban MAL en los dos sitios donde vivían, y con
//    desviaciones grandes —la de menores de 60 con cargas iba 471,60 €/mes por
//    debajo del mínimo legal—. Se detectó al contrastar el módulo contra el
//    texto del Anexo I en la auditoría de arranque. Por eso ahora hay una sola
//    fuente: los importes vivían duplicados en PENSION_VIUDEDAD_2026 y en
//    PENSIONES_MINIMAS_2026, y esa duplicación es lo que les permitió divergir.
//
// OJO al leer el Anexo: «titular con cargas familiares» es una fila propia que
// aplica a CUALQUIER edad y prevalece sobre el tramo de edad; y «65 años o
// discapacidad ≥65 %» comparten una única cuantía, no son dos.

const VIUDEDAD_ANUAL_2026 = {
  conCargasFamiliares:     17592.40,
  desde65oDiscapacidad65:  13106.80,
  entre60y64:              12262.60,
  menor60:                  9931.60,
} as const;

const mensual14 = (anual: number): number => Math.round((anual / 14) * 100) / 100;

export const MINIMOS_VIUDEDAD_2026 = {
  conCargasFamiliares:    mensual14(VIUDEDAD_ANUAL_2026.conCargasFamiliares),    // 1.256,60 €/mes
  desde65oDiscapacidad65: mensual14(VIUDEDAD_ANUAL_2026.desde65oDiscapacidad65), //   936,20 €/mes
  entre60y64:             mensual14(VIUDEDAD_ANUAL_2026.entre60y64),             //   875,90 €/mes
  menor60:                mensual14(VIUDEDAD_ANUAL_2026.menor60),                //   709,40 €/mes
};

/**
 * Cuantía mínima de viudedad que corresponde a un caso concreto.
 * Las cargas familiares mandan sobre la edad (Anexo I del RD 241/2026).
 */
export function minimoViudedad2026(edad: number, tieneCargasFamiliares: boolean, discapacidad65 = false): number {
  if (tieneCargasFamiliares) return MINIMOS_VIUDEDAD_2026.conCargasFamiliares;
  if (edad >= 65 || discapacidad65) return MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65;
  if (edad >= 60) return MINIMOS_VIUDEDAD_2026.entre60y64;
  return MINIMOS_VIUDEDAD_2026.menor60;
}

// ─── Pensión de Viudedad: datos normativos 2026 ───────────────────────────────
// Fuente: LGSS arts. 219-231 (RDL 8/2015) + RD 241/2026 (cuantías mínimas)
// Revalorización 2026: +2,7 % (art. 6 del RD 241/2026)
// Verificado: 2026-08-12
// SMI 2026: 1.221 €/mes (RD 126/2026) — ver data/fiscal/smi.ts

export const PENSION_VIUDEDAD_2026 = {
  // Porcentajes aplicables sobre la base reguladora (LGSS art. 231)
  porcentajeGeneral:       52,   // % — Caso general
  porcentaje60:            60,   // % — ≥65 años sin otra pensión pública y rentas < SMI
  porcentaje70:            70,   // % — Cargas familiares + rentas del trabajo < 75% SMI

  // SMI 2026 mensual (14 pagas, RD 126/2026 — ver data/fiscal/smi.ts)
  smiMensual:            SMI_2026.mensual14, // 1.221 €
  limiteIngresos70:      Math.round(SMI_2026.mensual14 * 0.75), // 916 € = 75% del SMI 2026

  // Mínimos 2026: derivados de MINIMOS_VIUDEDAD_2026, nunca escritos a mano.
  // «Con cargas» no depende de la edad, pese al nombre heredado del campo.
  minimoMenor60SinCargas: MINIMOS_VIUDEDAD_2026.menor60,
  minimoMenor60ConCargas: MINIMOS_VIUDEDAD_2026.conCargasFamiliares,
  minimo60a64:            MINIMOS_VIUDEDAD_2026.entre60y64,
  minimo65SinDiscap:      MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65,
  minimo65ConDiscap65:    MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65,

  // Pensión máxima SS 2026 (igual que LIMITES_PENSION_2025.maximaMensual)
  pensionMaxima:          3359.60,

  // Base reguladora para causante en activo: BR = (24 bases × media) / 28
  divisorBaseReguladora:    28,
};

// ─── Pensiones mínimas completas 2026 (complemento a mínimos) ───────────────
// Fuente: Anexo I del Real Decreto 241/2026, de 25 de marzo (BOE-A-2026-6977)
// Revalorización general 2026: +2,7 % (art. 6 del mismo RD)
// Importes mensuales en €, 14 pagas/año — el Anexo los da en €/año
// Verificado: 2026-08-12
//
// ⚠️ 2026-08-12: siete de las once filas no coincidían con el Anexo I. El sello
//    anterior era del 16/03/2026 y el RD se publicó el 25/03/2026, nueve días
//    después: ninguna pasada del Vigía Normativo podía verlo, porque su
//    vigilancia del BOE empieza en julio de 2026. Este es exactamente el caso
//    para el que existe la auditoría de arranque.

export interface PensionMinimaEntry {
  tipo: 'jubilacion' | 'incapacidad' | 'viudedad';
  subtipo: string;
  label: string;
  /** Con cónyuge a cargo (€/mes). 0 si no aplica (viudedad) */
  conConyuge: number;
  /** Con cónyuge NO a cargo (€/mes). 0 si no aplica */
  sinConyuge: number;
  /** Unipersonal — sin cónyuge (€/mes) */
  unipersonal: number;
}

export const PENSIONES_MINIMAS_2026: PensionMinimaEntry[] = [
  // ── Jubilación ──
  { tipo: 'jubilacion', subtipo: '65_o_mas',  label: 'Jubilación ≥ 65 años',  conConyuge: 1256.60, sinConyuge: 888.70, unipersonal: 936.20 },
  { tipo: 'jubilacion', subtipo: 'menos_65',  label: 'Jubilación < 65 años',   conConyuge: 1256.60, sinConyuge: 827.90, unipersonal: 875.90 },

  // ── Incapacidad permanente ──
  { tipo: 'incapacidad', subtipo: 'gran_invalidez',   label: 'Gran Invalidez',                     conConyuge: 1884.70, sinConyuge: 1333.00, unipersonal: 1404.30 },
  { tipo: 'incapacidad', subtipo: 'absoluta',          label: 'Incapacidad Permanente Absoluta',    conConyuge: 1256.60, sinConyuge: 888.70,  unipersonal: 936.20 },
  { tipo: 'incapacidad', subtipo: 'total_65_o_mas',    label: 'Total ≥ 65 años',                   conConyuge: 1256.60, sinConyuge: 888.70,  unipersonal: 936.20 },
  { tipo: 'incapacidad', subtipo: 'total_60_64',       label: 'Total 60-64 años',                  conConyuge: 1256.60, sinConyuge: 827.90,  unipersonal: 875.90 },
  { tipo: 'incapacidad', subtipo: 'total_menos_60',    label: 'Total < 60 años (enf. común)',       conConyuge: 690.20,  sinConyuge: 684.30,  unipersonal: 690.20 },

  // ── Viudedad ──
  // El Anexo I da una sola columna para viudedad: se rellena `unipersonal` y se
  // derivan de MINIMOS_VIUDEDAD_2026 para que no puedan volver a divergir.
  // «Con cargas familiares» es fila propia del Anexo y NO depende de la edad.
  { tipo: 'viudedad', subtipo: '65_o_mas',             label: 'Viudedad ≥ 65 años o discapacidad ≥ 65 %', conConyuge: 0, sinConyuge: 0, unipersonal: MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65 },
  { tipo: 'viudedad', subtipo: '60_a_64',              label: 'Viudedad 60-64 años',                      conConyuge: 0, sinConyuge: 0, unipersonal: MINIMOS_VIUDEDAD_2026.entre60y64 },
  { tipo: 'viudedad', subtipo: 'con_cargas',           label: 'Viudedad con cargas familiares (cualquier edad)', conConyuge: 0, sinConyuge: 0, unipersonal: MINIMOS_VIUDEDAD_2026.conCargasFamiliares },
  { tipo: 'viudedad', subtipo: 'menos_60_sin_cargas',  label: 'Viudedad < 60 sin cargas familiares',      conConyuge: 0, sinConyuge: 0, unipersonal: MINIMOS_VIUDEDAD_2026.menor60 },
];

// ── Límites de ingresos para acceder al complemento a mínimos 2026 ──
// Rentas anuales NO derivadas del trabajo (excluida la propia pensión)
// Fuente: arts. 9.2 y 10.1.b) del RD 241/2026 (BOE-A-2026-6977)
//
// ⚠️ 2026-08-12: estaban en 8.614 € y 10.047 €, entre 828 y 966 € POR DEBAJO de
//    los límites reales, así que el estimador denegaba el complemento a quien sí
//    tenía derecho. La cita anterior era «LPGE 2026», una ley que no existe: los
//    Presupuestos siguen prorrogados desde los de 2023 —por eso el IPREM lleva
//    congelado desde 2022— y quien fija estos límites es el RD de revalorización.

export const COMPLEMENTO_MINIMOS_LIMITES_2026 = {
  /** Sin cónyuge a cargo: ingresos anuales máximos (art. 9.2) */
  sinConyuge: 9442,
  /** Con cónyuge a cargo: ingresos anuales máximos, pensionista + cónyuge (art. 10.1.b) */
  conConyuge: 11013,
};

// ─── Complemento por Brecha de Género 2026 (art. 60 LGSS) ─────────────────────
// Fuente: RD-Ley 3/2021 + RD-Ley 3/2026 (cuantía 2026)
// Doctrina: TJUE 15-may-2025 + TS 9-jul-2025 (igualdad de trato H/M)
// Verificado: 2026-05-13
// URL oficial SS: https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Jubilacion/10963
//
// Sustituyó al antiguo complemento de maternidad (vigente desde 4-feb-2021).
// Se abona junto con la pensión en 14 pagas. NO computa para el límite máximo
// de pensiones públicas (LIMITES_PENSION_2025.maximaMensual).

export const COMPLEMENTO_BRECHA_GENERO_META = {
  fuente: 'Art. 60 LGSS (RDL 8/2015, modificado por RDL 3/2021) + RDL 3/2026',
  verificado: '2026-05-13',
  vigencia: '2026',
  urlOficial: 'https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Jubilacion/10963',
  doctrina: 'STJUE C-623/23 (15-may-2025) y STS 9-jul-2025: igualdad de trato hombre/mujer',
  nota: 'El complemento es incompatible con que lo perciba el otro progenitor por los mismos hijos. En caso de concurrencia, se reconoce al progenitor con pensión pública de menor cuantía.',
};

export const COMPLEMENTO_BRECHA_GENERO_2026 = {
  /** Importe mensual por hijo/a (€/mes, 14 pagas) — fijado por RDL 3/2026 */
  cuantiaPorHijoMensual: 36.90,
  /** Número máximo de hijos computables */
  maxHijos: 4,
  /** Importe mensual máximo (4 hijos × 36,90 €) */
  maxMensual: 147.60,
  /** Importe anual máximo (147,60 × 14 pagas) */
  maxAnual: 2066.40,
  /** Fecha mínima del hecho causante para tener derecho (4-feb-2021) */
  fechaMinimaHechoCausante: '2021-02-04',
  /** Nº de pagas anuales en que se abona */
  pagasAnuales: 14,
  /** Pensiones contributivas a las que se puede añadir el complemento */
  pensionesElegibles: ['jubilacion', 'incapacidad_permanente', 'viudedad'] as const,
  /**
   * Modalidades EXCLUIDAS expresamente por la ley, aunque la pensión sea contributiva y
   * de una de las clases elegibles. Hasta el 24/08/2026 este dato no estaba en ningún
   * módulo fiscal —solo en el FAQPage de una app—, así que el ciclo /triaje-fiscal no
   * podía revisarlo y la herramienta no lo aplicaba (hallazgo 280 del Inspector).
   */
  exclusiones: [
    {
      supuesto: 'jubilacion_parcial',
      norma: 'Art. 60.4 LGSS',
      detalle:
        'El complemento no se reconoce en la jubilación parcial del art. 215 LGSS. Sí se reconoce ' +
        'cuando desde ella se accede a la jubilación plena, una vez cumplida la edad que corresponda.',
    },
  ] as const,
};

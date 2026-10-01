/**
 * Motor de la nómina de ejemplo de «Anatomía de una Nómina».
 *
 * La nómina es FICTICIA y fija, pero sus cifras se CALCULAN: hasta el 01/10/2026 estaban
 * tecleadas, y así la base de cotización era el total devengado sin la prorrata de pagas
 * extra, la cuota de contingencias comunes no cuadraba con su propia base y el MEI se quedó
 * en el tipo de 2024 (hallazgos 2522, 2524, 2525 y 2530 del Inspector).
 *
 * Por qué la nómina es de enero de 2026 (antes, enero de 2025): es el año vigente, y
 * data/fiscal tiene para 2026 TODOS los tipos que la página enseña —los del trabajador
 * (COTIZACIONES_SS_2026), los de la empresa (COTIZACION_EMPRESA_2026) y los topes de la base
 * (BASES_SS_2026)—; para 2025 no hay tipos de empresa, y la Guía los necesita. Enero, y no un
 * mes posterior, porque la trabajadora entró el 15/03/2020: en enero de 2026 lleva un trienio
 * cumplido, como dicen sus devengos; el segundo llega en marzo.
 *
 * Normas (BOE):
 *  · Base de cotización — art. 147.1 LGSS: remuneración mensual + «las percepciones de
 *    vencimiento superior al mensual se prorratearán a lo largo de los doce meses del año».
 *    El art. 147.2 enumera lo ÚNICO que no computa; el plus de transporte al centro de trabajo
 *    no está entre ello (solo la locomoción fuera del centro habitual), así que cotiza entero.
 *  · Desempleo, FOGASA y formación profesional se calculan sobre la base de contingencias
 *    profesionales; contingencias comunes y MEI, sobre la de comunes. Sin horas extra, las
 *    dos bases coinciden.
 *  · Retención — art. 82.5.º RIRPF: tipo × «cuantía total de las retribuciones que se
 *    satisfagan o abonen».
 */
import { BASES_SS_2026, CALENDARIO_MEI, COTIZACIONES_SS_2026, COTIZACION_EMPRESA_2026 } from '@/data/fiscal';

export const ANIO_NOMINA = 2026;
export const TIPOS_TRABAJADOR = COTIZACIONES_SS_2026;
export const TIPOS_EMPRESA = COTIZACION_EMPRESA_2026;
export const TOPES_BASE = BASES_SS_2026;

/** Último escalón del MEI (DT 43.ª LGSS): el calendario entero vive en data/fiscal. */
export const MEI_2029 = CALENDARIO_MEI[2029];

/**
 * Tipo de retención de la trabajadora ficticia. NO es un dato normativo: lo determina la
 * empresa para cada persona con el procedimiento del RIRPF (arts. 82-86), según su sueldo
 * anual y su situación personal y familiar.
 */
export const TIPO_RETENCION_EJEMPLO = 15.27;

/** Pagas extraordinarias al año, cada una igual al salario base (no prorrateadas en nómina). */
export const PAGAS_EXTRA = 2;

export const DEVENGOS_IMPORTES = {
  salarioBase: 2142.86,
  antiguedad: 85,
  transporte: 72,
  convenio: 120,
};

/** Redondeo al céntimo sin el error binario de la coma flotante (416,55 céntimos → 417). */
export function aCentimos(valor: number): number {
  return Math.round(Number((valor * 100).toPrecision(12))) / 100;
}

/** Cuota = base × tipo (tipo en %), al céntimo. */
export function cuota(base: number, tipoPct: number): number {
  return aCentimos((base * tipoPct) / 100);
}

export interface NominaCalculada {
  totalDevengos: number;
  prorrataExtras: number;
  baseCC: number;
  baseCP: number;
  baseIRPF: number;
  cuotaCC: number;
  cuotaDesempleo: number;
  cuotaFP: number;
  cuotaMEI: number;
  retencionIRPF: number;
  totalDeducciones: number;
  liquido: number;
  empresa: {
    cc: number;
    desempleo: number;
    fogasa: number;
    fp: number;
    mei: number;
    total: number;
    tipoTotal: number;
  };
}

export function calcularNomina(): NominaCalculada {
  const d = DEVENGOS_IMPORTES;
  const totalDevengos = aCentimos(d.salarioBase + d.antiguedad + d.transporte + d.convenio);
  const prorrataExtras = aCentimos((d.salarioBase * PAGAS_EXTRA) / 12);
  const sinTopes = aCentimos(totalDevengos + prorrataExtras);
  const baseCC = Math.min(Math.max(sinTopes, TOPES_BASE.minima), TOPES_BASE.maxima);
  const baseCP = baseCC; // sin horas extra que sumar
  const baseIRPF = totalDevengos;

  const t = TIPOS_TRABAJADOR;
  const cuotaCC = cuota(baseCC, t.contingenciasComunes);
  const cuotaDesempleo = cuota(baseCP, t.desempleo);
  const cuotaFP = cuota(baseCP, t.formacionProfesional);
  const cuotaMEI = cuota(baseCC, t.mef);
  const retencionIRPF = cuota(baseIRPF, TIPO_RETENCION_EJEMPLO);
  const totalDeducciones = aCentimos(cuotaCC + cuotaDesempleo + cuotaFP + cuotaMEI + retencionIRPF);

  const e = TIPOS_EMPRESA;
  const empresa = {
    cc: cuota(baseCC, e.contingenciasComunes),
    desempleo: cuota(baseCP, e.desempleoIndefinido),
    fogasa: cuota(baseCP, e.fogasa),
    fp: cuota(baseCP, e.formacionProfesional),
    mei: cuota(baseCC, e.mei),
    total: 0,
    tipoTotal: aCentimos(
      e.contingenciasComunes + e.desempleoIndefinido + e.fogasa + e.formacionProfesional + e.mei,
    ),
  };
  empresa.total = aCentimos(empresa.cc + empresa.desempleo + empresa.fogasa + empresa.fp + empresa.mei);

  return {
    totalDevengos,
    prorrataExtras,
    baseCC,
    baseCP,
    baseIRPF,
    cuotaCC,
    cuotaDesempleo,
    cuotaFP,
    cuotaMEI,
    retencionIRPF,
    totalDeducciones,
    liquido: aCentimos(totalDevengos - totalDeducciones),
    empresa,
  };
}

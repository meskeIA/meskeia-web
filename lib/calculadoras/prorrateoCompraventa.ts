/**
 * Reparto entre vendedor y comprador del IBI y de la cuota de comunidad del periodo en que se
 * firma la escritura — sin dependencias de presentación.
 *
 * IBI: se devenga el 1 de enero y el periodo impositivo es el año natural (art. 75 TRLRHL), así
 * que el recibo entero corresponde a quien era titular ese día, normalmente el vendedor. Salvo
 * pacto en contrario, el vendedor que lo abona puede repercutirlo al comprador «en proporción
 * al tiempo en que cada una de las partes haya ostentado la titularidad dominical» (STS 409/2016,
 * de 15 de junio, Sala Primera, con base en el art. 63.2 TRLRHL). La práctica reparte por días
 * naturales del año (365 o 366).
 *
 * Comunidad: no hay norma de reparto; la práctica habitual es la misma, por días del periodo de
 * la cuota (mes, trimestre, semestre o año natural). Es pactable.
 *
 * Convención de días: el vendedor cuenta desde el inicio del periodo hasta el DÍA ANTERIOR a la
 * escritura; el comprador, desde el día de la escritura (incluido) hasta el fin del periodo.
 */

export type Periodicidad = 'mensual' | 'trimestral' | 'semestral' | 'anual';

export interface Fecha {
  anio: number;
  /** 1-12 */
  mes: number;
  dia: number;
}

export interface Reparto {
  diasTotal: number;
  diasVendedor: number;
  diasComprador: number;
  importeVendedor: number;
  importeComprador: number;
  /** Primer y último día del periodo repartido */
  inicio: Fecha;
  fin: Fecha;
}

const MS_DIA = 86_400_000;
const utc = (f: Fecha) => Date.UTC(f.anio, f.mes - 1, f.dia);
const desdeUtc = (ms: number): Fecha => {
  const d = new Date(ms);
  return { anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
};

/** ¿Existe esa fecha en el calendario? (descarta el 30 de febrero o el mes 13) */
export function fechaValida(f: Fecha): boolean {
  if (![f.anio, f.mes, f.dia].every(Number.isInteger)) return false;
  if (f.anio < 1900 || f.anio > 2200 || f.mes < 1 || f.mes > 12 || f.dia < 1) return false;
  const d = new Date(utc(f));
  return d.getUTCMonth() === f.mes - 1 && d.getUTCDate() === f.dia;
}

/** Lee una fecha «AAAA-MM-DD» (la de un input type="date"). null si no es válida. */
export function leerFechaISO(texto: string): Fecha | null {
  const m = texto.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const f = { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
  return fechaValida(f) ? f : null;
}

const MESES_PERIODO: Record<Periodicidad, number> = { mensual: 1, trimestral: 3, semestral: 6, anual: 12 };

/** Periodo natural de la cuota que contiene la fecha. */
export function periodoDe(f: Fecha, periodicidad: Periodicidad): { inicio: Fecha; fin: Fecha } {
  const n = MESES_PERIODO[periodicidad];
  const mesInicio = Math.floor((f.mes - 1) / n) * n + 1;
  const inicio = { anio: f.anio, mes: mesInicio, dia: 1 };
  // Último día del periodo = día anterior al primero del periodo siguiente
  const fin = desdeUtc(Date.UTC(f.anio, mesInicio - 1 + n, 1) - MS_DIA);
  return { inicio, fin };
}

function repartir(cuota: number, escritura: Fecha, periodicidad: Periodicidad): Reparto {
  const { inicio, fin } = periodoDe(escritura, periodicidad);
  const diasTotal = Math.round((utc(fin) - utc(inicio)) / MS_DIA) + 1;
  const diasVendedor = Math.round((utc(escritura) - utc(inicio)) / MS_DIA);
  const diasComprador = diasTotal - diasVendedor;
  const importeVendedor = (cuota * diasVendedor) / diasTotal;
  return {
    diasTotal,
    diasVendedor,
    diasComprador,
    importeVendedor,
    importeComprador: cuota - importeVendedor,
    inicio,
    fin,
  };
}

/** IBI: el periodo es siempre el año natural de la escritura. */
export function repartoIbi(cuotaAnual: number, escritura: Fecha): Reparto {
  return repartir(cuotaAnual, escritura, 'anual');
}

/** Comunidad: el periodo es el de la cuota que incluye el día de la escritura. */
export function repartoComunidad(cuota: number, periodicidad: Periodicidad, escritura: Fecha): Reparto {
  return repartir(cuota, escritura, periodicidad);
}

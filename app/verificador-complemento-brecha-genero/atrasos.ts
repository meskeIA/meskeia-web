/**
 * Atrasos del complemento por brecha de género en una reclamación retroactiva (semilla S0211,
 * 18/10/2026).
 *
 * A un hombre con pensión causada desde el 04/02/2021, el INSS le reconoce el complemento con
 * efectos desde la fecha de efectos de su pensión (Criterio interpretativo 11/2025, cita en
 * `EFECTOS_COMPLEMENTO_BRECHA_VARONES`). Lo que se le debe es la suma, mes a mes, de la cuantía
 * de CADA año: con la vigente se inflaría todo lo anterior a 2026 (27 € en 2021 frente a 36,90).
 *
 * Cómo se reparte el año: las dos pagas extraordinarias se prorratean entre los doce meses
 * (cuantía × 14 ÷ 12 por mes). En un año completo da exactamente las 14 pagas; en un tramo
 * suelto, la cifra puede diferir de la nómina en la parte de una paga extra, porque las pagas
 * de junio y noviembre no se devengan mes a mes. El primer y el último mes cuentan por días.
 *
 * Motor puro, sin React: los casos resueltos a mano están en tests/atrasos-brecha-motor.spec.ts.
 */
import { COMPLEMENTO_BRECHA_GENERO_2026, COMPLEMENTO_BRECHA_GENERO_SERIE } from '@/data/fiscal/pensiones';

export interface TramoAnual {
  anio: number;
  /** Meses devengados en ese año, con fracción por días en el primero y el último */
  meses: number;
  cuantiaPorHijoMensual: number;
  /** Importe bruto del año, redondeado al céntimo */
  importe: number;
}

export type ResultadoAtrasos =
  | {
      ok: true;
      tramos: TramoAnual[];
      /** Suma de los tramos ya redondeados: la tabla cuadra con el total */
      total: number;
      /** Lo que se suma por cada mes completo más que tarde el reconocimiento */
      porMesMas: number;
    }
  | { ok: false; error: 'fecha-invalida' | 'anterior-al-complemento' | 'futura' }
  | { ok: false; error: 'sin-cuantia'; anio: number };

interface Fecha { anio: number; mes: number; dia: number }

function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

function leerISO(iso: string): Fecha | null {
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const f = { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
  if (f.mes < 1 || f.mes > 12 || f.dia < 1 || f.dia > diasDelMes(f.anio, f.mes)) return null;
  return f;
}

const comoNumero = (f: Fecha) => f.anio * 10_000 + f.mes * 100 + f.dia;
const centimos = (n: number) => Math.round(n * 100) / 100;

/**
 * @param fechaEfectosISO fecha de efectos económicos de la pensión (AAAA-MM-DD)
 * @param hoyISO hasta qué día se cuentan los atrasos, incluido (AAAA-MM-DD)
 * @param hijosComputables ya topados en el máximo legal
 * @param factorProrrata 1 sin prorrata temporis; 0,5 con una prorrata del 50 %
 */
export function calcularAtrasos(
  fechaEfectosISO: string,
  hoyISO: string,
  hijosComputables: number,
  factorProrrata = 1,
  serie: readonly { anio: number; cuantiaPorHijoMensual: number }[] = COMPLEMENTO_BRECHA_GENERO_SERIE,
): ResultadoAtrasos {
  const desde = leerISO(fechaEfectosISO);
  const hasta = leerISO(hoyISO);
  if (!desde || !hasta) return { ok: false, error: 'fecha-invalida' };
  const minima = leerISO(COMPLEMENTO_BRECHA_GENERO_2026.fechaMinimaHechoCausante)!;
  if (comoNumero(desde) < comoNumero(minima)) return { ok: false, error: 'anterior-al-complemento' };
  if (comoNumero(desde) > comoNumero(hasta)) return { ok: false, error: 'futura' };

  const pagas = COMPLEMENTO_BRECHA_GENERO_2026.pagasAnuales;
  const cuantiaDe = (anio: number) => serie.find((s) => s.anio === anio)?.cuantiaPorHijoMensual;

  const porAnio = new Map<number, { meses: number; bruto: number; cuantia: number }>();
  let anio = desde.anio;
  let mes = desde.mes;
  while (anio * 100 + mes <= hasta.anio * 100 + hasta.mes) {
    const cuantia = cuantiaDe(anio);
    if (cuantia === undefined) return { ok: false, error: 'sin-cuantia', anio };
    const dias = diasDelMes(anio, mes);
    const primerDia = anio === desde.anio && mes === desde.mes ? desde.dia : 1;
    const ultimoDia = anio === hasta.anio && mes === hasta.mes ? hasta.dia : dias;
    const fraccion = (ultimoDia - primerDia + 1) / dias;
    const acumulado = porAnio.get(anio) ?? { meses: 0, bruto: 0, cuantia };
    acumulado.meses += fraccion;
    acumulado.bruto += cuantia * hijosComputables * factorProrrata * (pagas / 12) * fraccion;
    porAnio.set(anio, acumulado);
    mes += 1;
    if (mes > 12) { mes = 1; anio += 1; }
  }

  const tramos: TramoAnual[] = [...porAnio.entries()].map(([a, v]) => ({
    anio: a,
    meses: v.meses,
    cuantiaPorHijoMensual: v.cuantia,
    importe: centimos(v.bruto),
  }));
  const total = centimos(tramos.reduce((s, t) => s + t.importe, 0));
  const cuantiaActual = cuantiaDe(hasta.anio)!;
  const porMesMas = centimos(cuantiaActual * hijosComputables * factorProrrata * (pagas / 12));
  return { ok: true, tramos, total, porMesMas };
}

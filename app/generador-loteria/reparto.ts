/**
 * Reparto del premio de una peña (S0180): varias personas ponen dinero, juegan juntas uno o
 * varios décimos o apuestas, y alguno sale premiado. Calcula lo que retiene el banco y lo que
 * le corresponde a cada participante según lo que puso.
 *
 * El gravamen sale de data/fiscal/premios-loterias.ts (DA 33.ª de la Ley del IRPF), que es
 * donde está la norma cotejada. Aquí solo vive el reparto.
 *
 * Modelo: TODOS los décimos o apuestas son de TODOS, en proporción a lo que aportó cada uno.
 * Es la peña de toda la vida. Si cada persona tiene sus propios décimos, el premio no es de
 * titularidad compartida y cada décimo tributa entero con su dueño: no es este cálculo.
 *
 * Céntimos: el gravamen se calcula por décimo (ap. 1 de la DA 33.ª) y se redondea al céntimo
 * por décimo, como lo practica quien paga. Después, el bruto, lo exento y la retención se
 * reparten por el MÉTODO DEL MAYOR RESTO: cada parte se trunca al céntimo y los céntimos
 * sobrantes van a quien tenía el mayor decimal (en empate, al primero de la lista). Así las
 * partes suman exactamente el total del banco; con un redondeo suelto, tres partes de
 * 100.000 € sumarían 99.999,99 €.
 *
 * Casos resueltos a mano en tests/reparto-pena-motor.spec.ts.
 */

import { gravamenPremio } from '@/data/fiscal/premios-loterias';

export interface ParticipantePena {
  nombre: string;
  /** Lo que puso, en euros */
  aportacion: number;
}

export interface EntradaReparto {
  participantes: ParticipantePena[];
  /** Importe íntegro de cada décimo o apuesta premiados, en euros */
  premios: number[];
  /** Lo que costó cada décimo o apuesta (solo cuenta si es menor de 0,50 €) */
  importeJugado: number;
}

export interface TotalesPremio {
  premio: number;
  exento: number;
  base: number;
  retencion: number;
  neto: number;
}

export interface PartePena {
  nombre: string;
  aportacion: number;
  /** Fracción de la peña, de 0 a 1 */
  cuota: number;
  bruto: number;
  exento: number;
  retencion: number;
  neto: number;
}

export type ResultadoReparto =
  | { ok: true; porPremio: TotalesPremio[]; total: TotalesPremio; partes: PartePena[] }
  | { ok: false; error: string };

const aCentimos = (euros: number) => Math.round(euros * 100);

/**
 * Reparte `totalCentimos` en proporción a `pesos` por el método del mayor resto.
 * Devuelve céntimos enteros que suman exactamente el total.
 */
export function repartirCentimos(totalCentimos: number, pesos: number[]): number[] {
  const suma = pesos.reduce((s, p) => s + p, 0);
  if (suma <= 0) return pesos.map(() => 0);
  const exactos = pesos.map(p => (totalCentimos * p) / suma);
  const partes = exactos.map(x => Math.floor(x + 1e-9));
  let sobrante = totalCentimos - partes.reduce((s, p) => s + p, 0);
  const orden = exactos
    .map((x, i) => ({ i, resto: x - Math.floor(x + 1e-9) }))
    .sort((a, b) => b.resto - a.resto || a.i - b.i);
  for (let k = 0; sobrante > 0 && k < orden.length; k++, sobrante--) partes[orden[k].i] += 1;
  return partes;
}

export function repartirPremio({ participantes, premios, importeJugado }: EntradaReparto): ResultadoReparto {
  if (participantes.length === 0) return { ok: false, error: 'Añade al menos una persona a la peña.' };
  if (participantes.some(p => !Number.isFinite(p.aportacion) || p.aportacion < 0)) {
    return { ok: false, error: 'Revisa las aportaciones: tienen que ser cantidades de 0 € o más.' };
  }
  const aportado = participantes.reduce((s, p) => s + p.aportacion, 0);
  if (aportado <= 0) return { ok: false, error: 'Indica lo que puso cada persona: ahora la peña suma 0 €.' };
  if (premios.length === 0 || premios.some(p => !Number.isFinite(p) || p <= 0)) {
    return { ok: false, error: 'Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.' };
  }
  if (!(importeJugado > 0)) {
    return { ok: false, error: 'Indica lo que costó cada décimo o apuesta, mayor que 0 €.' };
  }

  // Gravamen por décimo, en céntimos, como lo retiene quien paga
  const porPremio: TotalesPremio[] = premios.map(p => {
    const g = gravamenPremio(p, importeJugado);
    const premio = aCentimos(p);
    const exento = aCentimos(g.exento);
    const retencion = aCentimos(g.retencion);
    return {
      premio: premio / 100,
      exento: exento / 100,
      base: (premio - exento) / 100,
      retencion: retencion / 100,
      neto: (premio - retencion) / 100,
    };
  });

  const sumar = (campo: keyof TotalesPremio) => porPremio.reduce((s, p) => s + aCentimos(p[campo]), 0);
  const brutoC = sumar('premio');
  const exentoC = sumar('exento');
  const retencionC = sumar('retencion');
  const total: TotalesPremio = {
    premio: brutoC / 100,
    exento: exentoC / 100,
    base: (brutoC - exentoC) / 100,
    retencion: retencionC / 100,
    neto: (brutoC - retencionC) / 100,
  };

  const pesos = participantes.map(p => aCentimos(p.aportacion));
  const brutos = repartirCentimos(brutoC, pesos);
  const exentos = repartirCentimos(exentoC, pesos);
  const retenciones = repartirCentimos(retencionC, pesos);

  const partes: PartePena[] = participantes.map((p, i) => ({
    nombre: p.nombre,
    aportacion: p.aportacion,
    cuota: p.aportacion / aportado,
    bruto: brutos[i] / 100,
    exento: exentos[i] / 100,
    retencion: retenciones[i] / 100,
    neto: (brutos[i] - retenciones[i]) / 100,
  }));

  return { ok: true, porPremio, total, partes };
}

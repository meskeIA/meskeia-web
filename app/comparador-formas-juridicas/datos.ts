/**
 * Tipos normativos del comparador, DERIVADOS de data/fiscal: hasta el 07/10/2026 estaban
 * tecleados en page.tsx (hallazgo 3043) y la escala de las micropymes cambia cada año (2027:
 * 17/20 %, art. 29.1 LIS). Página y metadata (FAQPage) leen de aquí, así cambian a la vez.
 */
import {
  TRAMOS_IRPF_2025,
  TIPOS_IS_2025,
  TRAMOS_IS_MICROPYMES_2026,
  TARIFA_PLANA_2025,
  MINIMOS_IRPF_2025,
  calcularCuotaIntegraGeneral,
} from '@/data/fiscal';

/** Espacio duro entre cifra y símbolo (Ortografía de la RAE, 2010). */
export const NB = ' ';

const pct = (n: number): string => `${n.toLocaleString('es-ES')}${NB}%`;
const eur = (n: number): string => `${n.toLocaleString('es-ES', { maximumFractionDigits: 2 })}${NB}€`;

export const IRPF_MIN = pct(TRAMOS_IRPF_2025[0].tipo);
export const IRPF_MAX = pct(TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1].tipo);
export const IRPF_RANGO = `${IRPF_MIN} - ${IRPF_MAX}`;

/** Tipo marginal de la escala general para una base dada. */
export function marginalIRPF(base: number): number {
  for (const t of TRAMOS_IRPF_2025) if (base <= t.hasta) return t.tipo;
  return TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1].tipo;
}

/** Límite inferior del tramo que contiene `base` (para decir «del 37 % hasta 60.000 €»). */
export function tramoIRPF(tipo: number): { desde: number; hasta: number } {
  let desde = 0;
  for (const t of TRAMOS_IRPF_2025) {
    if (t.tipo === tipo) return { desde, hasta: t.hasta };
    desde = t.hasta;
  }
  return { desde, hasta: Infinity };
}

export const IS_GENERAL = pct(TIPOS_IS_2025.general);
export const IS_NUEVA_CREACION = pct(TIPOS_IS_2025.nuevaCreacion);
export const IS_MICRO_TRAMO1 = pct(TRAMOS_IS_MICROPYMES_2026[0].tipo);
export const IS_MICRO_TRAMO2 = pct(TRAMOS_IS_MICROPYMES_2026[1].tipo);
export const IS_MICRO_LIMITE = eur(TRAMOS_IS_MICROPYMES_2026[0].hasta);
export const IS_COOPERATIVAS = pct(TIPOS_IS_2025.cooperativas);

/** Resumen corto del IS de la SL, sin paréntesis anidados (hallazgos 3044 y 3056). */
export const IS_SL_RESUMEN =
  `${IS_GENERAL} general; ${IS_MICRO_TRAMO1}/${IS_MICRO_TRAMO2} si la cifra de negocios es menor de 1${NB}M${NB}€; ` +
  `${IS_NUEVA_CREACION} los dos primeros periodos con base positiva si es de nueva creación`;

export const TARIFA_PLANA = `${eur(TARIFA_PLANA_2025.cuota)}/mes durante ${TARIFA_PLANA_2025.duracion} meses`;

/**
 * Escenario de la diseñadora (hallazgo 3046): 25.000 € de base liquidable general con solo el
 * mínimo personal. El mínimo se grava a tipo cero (art. 63.1.2.º LIRPF), no se resta de la base.
 */
export const DISENADORA_BASE = 25_000;
export const DISENADORA_CUOTA = calcularCuotaIntegraGeneral(DISENADORA_BASE, MINIMOS_IRPF_2025.personal);
export const DISENADORA_MARGINAL = marginalIRPF(DISENADORA_BASE);

export { pct, eur };

/**
 * Cómo se escriben las cifras de `simulador-ley-coulomb`: formato español y notación científica
 * con superíndices reales. Lo comparten la página y los casos, para que la solución de un caso y
 * el panel escriban la misma cifra igual.
 *
 * Las fuerzas de esta app van de 10⁻⁸ N (un átomo de hidrógeno) a 10⁹ N (dos cargas de 1 C a un
 * metro): con decimales fijos, la mitad saldría «0,00 N». Por eso se dan con tres cifras
 * significativas y, fuera de [0,001; 100.000), en notación científica.
 */

import { formatNumber } from '@/lib';
import { redondearA } from '@/lib/calculadoras/correctorCasosAula';

const SUPERINDICES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

/** Exponente en superíndices, con el menos tipográfico: −8 → ⁻⁸. */
export function superindice(exp: number): string {
  const signo = exp < 0 ? '⁻' : '';
  return (
    signo +
    String(Math.abs(exp))
      .split('')
      .map((d) => SUPERINDICES[Number(d)])
      .join('')
  );
}

/** Decimales que dan `cifras` significativas a `valor` (nunca negativos). */
function decimalesPara(valor: number, cifras: number): number {
  if (valor === 0) return 0;
  const orden = Math.floor(Math.log10(Math.abs(valor)));
  return Math.max(0, cifras - 1 - orden);
}

/**
 * Mantisa y exponente con `cifras` significativas, ya corregido el caso en que la mantisa
 * redondeada llega a 10 (9,996 × 10⁻³ con tres cifras es 1,00 × 10⁻²).
 */
export function mantisaYExponente(valor: number, cifras = 3): { mantisa: number; exponente: number } {
  if (!Number.isFinite(valor) || valor === 0) return { mantisa: valor, exponente: 0 };
  let exponente = Math.floor(Math.log10(Math.abs(valor)));
  let mantisa = redondearA(valor / 10 ** exponente, cifras - 1);
  if (Math.abs(mantisa) >= 10) {
    exponente += 1;
    mantisa = redondearA(valor / 10 ** exponente, cifras - 1);
  }
  return { mantisa, exponente };
}

/** Notación científica: «8,99 × 10⁻³». Con el menos tipográfico en la mantisa. */
export function cientifica(valor: number, cifras = 3): string {
  if (!Number.isFinite(valor)) return '—';
  if (valor === 0) return '0';
  const { mantisa, exponente } = mantisaYExponente(valor, cifras);
  const texto = formatNumber(Math.abs(mantisa), cifras - 1);
  return `${mantisa < 0 ? '−' : ''}${texto} × 10${superindice(exponente)}`;
}

/**
 * Una cifra legible con `cifras` significativas: decimal corriente entre 0,001 y 100.000 y
 * notación científica fuera. Con el menos tipográfico.
 */
export function cifraLegible(valor: number, cifras = 3): string {
  if (!Number.isFinite(valor)) return '—';
  if (valor === 0) return '0';
  const abs = Math.abs(valor);
  if (abs < 1e-3 || abs >= 1e5) return cientifica(valor, cifras);
  const decimales = decimalesPara(abs, cifras);
  const texto = formatNumber(redondearA(abs, decimales), decimales);
  return `${valor < 0 ? '−' : ''}${texto}`;
}

/**
 * Una cifra con los decimales que de verdad tiene, hasta `maxDecimales`, sin ceros de relleno:
 * εr = 1, 1,0006, 2,2 o 80, y no «1,0000» ni «80,00».
 */
export function cifraCorta(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return '—';
  let d = 0;
  while (d < maxDecimales && Math.abs(redondearA(valor, d) - valor) > 1e-9 * Math.max(1, Math.abs(valor))) d += 1;
  const texto = formatNumber(Math.abs(redondearA(valor, d)), d);
  return `${valor < 0 ? '−' : ''}${texto}`;
}

/**
 * Cifra para volver a escribir en un campo de texto (la que deja el deslizador): tres cifras
 * significativas, sin notación científica (`parseSpanishNumber` no la lee) y con el guion
 * corriente como signo, que es el que el campo admite al teclear.
 */
export function cifraParaCampo(valor: number, cifras = 3): string {
  if (!Number.isFinite(valor)) return '';
  const decimales = decimalesPara(valor, cifras);
  return formatNumber(redondearA(valor, decimales), decimales);
}

/** Una masa en kg, pasada a la unidad que la deja legible: «916 mg», «3,67 g», «1,20 t». */
export function textoMasa(kg: number): string {
  if (!Number.isFinite(kg)) return '—';
  const g = kg * 1000;
  if (kg >= 1000) return `${cifraLegible(kg / 1000)} t`;
  if (kg >= 1) return `${cifraLegible(kg)} kg`;
  if (g >= 1) return `${cifraLegible(g)} g`;
  if (g >= 1e-3) return `${cifraLegible(g * 1000)} mg`;
  return `${cientifica(g)} g`;
}

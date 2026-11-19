import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  cuotaEscalaGeneral,
  calcularCuotaIntegraGeneral,
} from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

/**
 * Preguntas que salen a la vez en la FAQ visible (page.tsx) y en el FAQPage (metadata.ts): una
 * sola fuente, porque escritas dos veces se contradecían (hallazgos 5158, 5159 y 5161,
 * 18/11/2026). Las cifras de los ejemplos salen de la escala de data/fiscal, no se teclean.
 */
export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

const euros = (n: number, decimales = 0): string => `${formatNumber(n, decimales)} €`;
const pct = (n: number, decimales = 0): string => `${formatNumber(n, decimales)} %`;

const PRIMER_TRAMO = TRAMOS_IRPF_2025[0];

// Ejemplo del tipo medio: 40.000 € de base (hallazgo 5159: el FAQPage decía que «puede rondar el 20%»)
const BASE_EJEMPLO = 40000;
const TRAMO_EJEMPLO = TRAMOS_IRPF_2025.find((t) => BASE_EJEMPLO <= t.hasta) ?? TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1];
const CUOTA_EJEMPLO = cuotaEscalaGeneral(BASE_EJEMPLO);
const CUOTA_EJEMPLO_CON_MINIMO = calcularCuotaIntegraGeneral(BASE_EJEMPLO, MINIMOS_IRPF_2025.personal);

export const FAQ_BASE_LIQUIDABLE: PreguntaFrecuente = {
  pregunta: '¿Qué es la base liquidable y sobre qué se calculan los tramos del IRPF?',
  respuesta: `La base liquidable es la cantidad sobre la que se aplican los tramos del IRPF: la base imponible (rendimientos netos y demás rentas) menos las reducciones previstas en la ley, como las aportaciones a planes de pensiones o la de tributación conjunta. El mínimo personal y familiar (${euros(MINIMOS_IRPF_2025.personal)} el del contribuyente, más lo que corresponda por hijos, mayores o discapacidad) no se resta de la base: se grava a tipo cero, aplicando la escala también a su importe y restando esa cuota (art. 63.1 LIRPF). No es lo mismo que el salario bruto: la base liquidable suele ser bastante inferior.`,
};

export const FAQ_TIPO_MEDIO: PreguntaFrecuente = {
  pregunta: '¿Qué diferencia hay entre el tipo marginal y el tipo medio del IRPF?',
  respuesta: `El tipo marginal es el porcentaje que se aplica al último euro ganado, es decir, el tipo del tramo más alto en que cae tu base. El tipo medio es la cuota total dividida entre la base. Con una base de hasta ${euros(PRIMER_TRAMO.hasta)} los dos coinciden (${pct(PRIMER_TRAMO.tipo)}); por encima, el medio es menor que el marginal porque los primeros euros tributan a tipos más bajos. Por ejemplo, con ${euros(BASE_EJEMPLO)} de base el marginal es el ${pct(TRAMO_EJEMPLO.tipo)} y la escala da ${euros(CUOTA_EJEMPLO, 2)} de cuota, un tipo medio del ${pct((CUOTA_EJEMPLO / BASE_EJEMPLO) * 100, 2)} (${pct((CUOTA_EJEMPLO_CON_MINIMO / BASE_EJEMPLO) * 100, 2)} restando la cuota del mínimo personal de ${euros(MINIMOS_IRPF_2025.personal)}).`,
};

// Ejemplo de «subir de tramo»: de 35.000 a 36.000 €, cruzando el límite del tercer tramo
const LIMITE_EJEMPLO = TRAMOS_IRPF_2025[2];
const TRAMO_SIGUIENTE = TRAMOS_IRPF_2025[3];
const DESDE_EJEMPLO = 35000;
const HASTA_EJEMPLO = 36000;

export const FAQ_SUBIR_TRAMO: PreguntaFrecuente = {
  pregunta: '¿Qué pasa con mi cuota si subo de tramo IRPF?',
  respuesta: `No pasa a tributar todo al tipo nuevo: es un malentendido muy extendido. Al cruzar un tramo, el tipo más alto solo se aplica a la parte de la base que supera el límite del tramo anterior. Por ejemplo, si tu base pasa de ${euros(DESDE_EJEMPLO)} a ${euros(HASTA_EJEMPLO)}, los primeros ${euros(LIMITE_EJEMPLO.hasta)} tributan igual que antes y solo los ${euros(HASTA_EJEMPLO - LIMITE_EJEMPLO.hasta)} que entran en el tramo siguiente pagan el ${pct(TRAMO_SIGUIENTE.tipo)}. Por eso ganar más siempre deja más neto en el bolsillo.`,
};

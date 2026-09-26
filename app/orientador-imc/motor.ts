/**
 * Motor del Orientador IMC — sin dependencias de React, para poder probarlo aparte.
 *
 * ── Qué decide este fichero (hallazgos 2024-2026 del Inspector, 25/09/2026) ──
 *
 * 1 · VALIDAR ANTES DE CLASIFICAR (2024, 2025). Una entrada vacía, no numérica o fuera de rango
 *     NO recibe etiqueta clínica: se devuelve un aviso. Antes, el campo acotaba al salir (1,75 cm
 *     pasaba a 50 cm → IMC 280 «Obesidad grado III») y un campo vacío daba NaN, que no cumplía
 *     ningún `<` y caía en obesidad III.
 *
 * 2 · CLASIFICAR LA CIFRA QUE SE MUESTRA (2026). La OMS publica los cortes con un decimal
 *     (18,5–24,9 · 25,0–29,9…), así que el IMC se redondea a un decimal UNA vez y con ese valor se
 *     pinta Y se clasifica. Así no puede salir «25,0 · Peso normal» (24,95 ≤ IMC < 25) ni
 *     «Peso normal» junto a «0,0 kg por encima del rango». La diferencia de peso solo existe si la
 *     categoría está fuera del rango normal, y se mide contra 18,5·h² o 24,9·h² (el rango que se
 *     muestra, el mismo de la tabla y de la FAQ).
 */

import { parseSpanishNumber } from '@/lib';

export type ClaveCategoria = 'bajo' | 'normal' | 'sobrepeso' | 'obesidad1' | 'obesidad2' | 'obesidad3';

/** Límites de los campos. Fuera de ellos no hay adulto al que describan: se avisa, no se acota. */
export const LIMITES = {
  pesoMinKg: 10,
  pesoMaxKg: 500,
  alturaMinCm: 50,
  alturaMaxCm: 250,
} as const;

/** Por debajo de 3 en el campo de altura, casi seguro que se ha escrito en metros */
const ALTURA_EN_METROS_MAX = 3;

export type Validacion = { ok: true; valor: number } | { ok: false; error: string };

export function validarPeso(texto: string): Validacion {
  if (texto.trim() === '') return { ok: false, error: 'Escribe el peso en kilogramos.' };
  const valor = parseSpanishNumber(texto);
  if (Number.isNaN(valor)) return { ok: false, error: 'El peso no es un número válido.' };
  if (valor < LIMITES.pesoMinKg || valor > LIMITES.pesoMaxKg) {
    return {
      ok: false,
      error: `El peso debe estar entre ${LIMITES.pesoMinKg} y ${LIMITES.pesoMaxKg} kg.`,
    };
  }
  return { ok: true, valor };
}

export function validarAltura(texto: string): Validacion {
  if (texto.trim() === '') return { ok: false, error: 'Escribe la altura en centímetros.' };
  const valor = parseSpanishNumber(texto);
  if (Number.isNaN(valor)) return { ok: false, error: 'La altura no es un número válido.' };
  if (valor > 0 && valor < ALTURA_EN_METROS_MAX) {
    return {
      ok: false,
      error: 'La altura va en centímetros: parece escrita en metros (por ejemplo, 1,75 m son 175 cm).',
    };
  }
  if (valor < LIMITES.alturaMinCm || valor > LIMITES.alturaMaxCm) {
    return {
      ok: false,
      error: `La altura debe estar entre ${LIMITES.alturaMinCm} y ${LIMITES.alturaMaxCm} cm.`,
    };
  }
  return { ok: true, valor };
}

/** Redondeo a un decimal protegido del ruido binario (72,25 / 2,89 = 24,9999…) */
export function redondearUnDecimal(x: number): number {
  return Math.round((x + Number.EPSILON) * 10) / 10;
}

/** Categoría OMS de un IMC YA redondeado a un decimal */
export function categoriaIMC(imcRedondeado: number): ClaveCategoria {
  if (imcRedondeado < 18.5) return 'bajo';
  if (imcRedondeado < 25) return 'normal';
  if (imcRedondeado < 30) return 'sobrepeso';
  if (imcRedondeado < 35) return 'obesidad1';
  if (imcRedondeado < 40) return 'obesidad2';
  return 'obesidad3';
}

export function rangoPesoEstandar(alturaCm: number): { min: number; max: number } {
  const h = alturaCm / 100;
  return { min: 18.5 * h * h, max: 24.9 * h * h };
}

export interface EvaluacionIMC {
  /** IMC redondeado a un decimal: el que se muestra y el que se clasifica */
  imc: number;
  categoria: ClaveCategoria;
  rango: { min: number; max: number };
  /** kg por encima (+) o por debajo (−) del rango; 0 si la categoría es «normal» */
  diferencia: number;
}

export function evaluarIMC(pesoKg: number, alturaCm: number): EvaluacionIMC {
  const h = alturaCm / 100;
  const imc = redondearUnDecimal(pesoKg / (h * h));
  const categoria = categoriaIMC(imc);
  const rango = rangoPesoEstandar(alturaCm);
  let diferencia = 0;
  if (categoria === 'bajo') diferencia = pesoKg - rango.min;
  else if (categoria !== 'normal') diferencia = pesoKg - rango.max;
  return { imc, categoria, rango, diferencia };
}

/**
 * Un IMC fuera de este intervalo no describe a una persona viva con datos bien escritos: casi
 * siempre son peso y altura intercambiados (175 kg y 70 cm dan 357) o una unidad equivocada.
 * Los extremos documentados en adultos quedan dentro (desnutrición grave ~10-12; obesidad
 * extrema por encima de 100 en casos excepcionales).
 */
export const IMC_PLAUSIBLE = { min: 10, max: 150 } as const;

export interface ErroresEntrada {
  peso?: string;
  altura?: string;
  /** Datos válidos por separado pero que juntos no son plausibles */
  conjunto?: string;
}

export type ResultadoEntrada =
  | { ok: true; peso: number; altura: number; evaluacion: EvaluacionIMC }
  | { ok: false; errores: ErroresEntrada };

export function evaluarEntrada(pesoTexto: string, alturaTexto: string): ResultadoEntrada {
  const peso = validarPeso(pesoTexto);
  const altura = validarAltura(alturaTexto);
  if (!peso.ok || !altura.ok) {
    return {
      ok: false,
      errores: {
        peso: peso.ok ? undefined : peso.error,
        altura: altura.ok ? undefined : altura.error,
      },
    };
  }
  const evaluacion = evaluarIMC(peso.valor, altura.valor);
  if (evaluacion.imc < IMC_PLAUSIBLE.min || evaluacion.imc > IMC_PLAUSIBLE.max) {
    return {
      ok: false,
      errores: {
        conjunto:
          'Con estos datos el IMC no describe a una persona adulta. Revisa si el peso (kg) y la altura (cm) están intercambiados o en otra unidad.',
      },
    };
  }
  return { ok: true, peso: peso.valor, altura: altura.valor, evaluacion };
}

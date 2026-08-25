/**
 * Caso de prueba de `check-parser-numerico.mjs` — NO es una app.
 *
 * Lo mismo que `scripts/pruebas/a11y-regla5.tsx` hace con la regla 5 de accesibilidad: un
 * candado nuevo no vale hasta que se le reinyecta el defecto y se comprueba que lo caza, y
 * que deja pasar lo que debe pasar. Sin las dos mitades, un candado puede estar siempre en
 * verde porque no mira nada — que es exactamente el hallazgo 355 de esta misma ronda.
 *
 * Se ejecuta con:  node scripts/check-parser-numerico.mjs scripts/pruebas/parser-numerico.tsx
 * Debe encontrar los CUATRO primeros y ninguno de los tres últimos.
 *
 * Este fichero queda fuera del análisis normal del candado, que solo mira `app/`,
 * `components/` y `lib/`.
 */

import { parseSpanishNumber } from '@/lib';

// ─── DEBE CAZAR ───────────────────────────────────────────────────────────────

/** 1. La forma del hallazgo 290, en `calculadora-masa-madre`. */
export function debeCazar1(entrada: string): number {
  return parseFloat(entrada.replace(',', '.'));
}

/** 2. La forma MÁS habitual del catálogo: dos replaces, quitando antes el millar. */
export function debeCazar2(entrada: string): number {
  return parseFloat(entrada.replace(/\./g, '').replace(',', '.')) || 0;
}

/** 3. Con `Number` en vez de `parseFloat`. */
export function debeCazar3(entrada: string): number {
  return Number(entrada.replace(',', '.'));
}

/** 4. Con la coma como expresión regular. */
export function debeCazar4(entrada: string): number {
  return parseFloat(entrada.replace(/,/g, '.'));
}

// ─── DEBE DEJAR PASAR ─────────────────────────────────────────────────────────

/** 5. Lo correcto: el parser canónico del proyecto. */
export function debePasar1(entrada: string): number {
  return parseSpanishNumber(entrada);
}

/**
 * 6. Un `Number` a secas sobre un valor que genera la propia app —el `value` de un
 * `<input type="range">` siempre es un número en formato máquina— no es entrada de usuario
 * y no tiene coma que convertir.
 */
export function debePasar2(valorDelSlider: string): number {
  return Number(valorDelSlider);
}

/**
 * 7. Un `replace` de coma que no alimenta ningún parseo: aquí solo se está formateando texto
 * para mostrarlo, y convertirlo a número no viene al caso.
 */
export function debePasar3(texto: string): string {
  return texto.replace(',', '.');
}

/**
 * 8. Y el escape declarado, para el falso positivo de verdad: un dato que la propia app ha
 * escrito antes en el DOM, no algo que haya tecleado nadie.
 */
export function debePasar4(elemento: HTMLElement): number {
  // parser-ok: el dataset lo escribe la propia app en formato español, no es entrada de usuario
  return parseFloat((elemento.dataset.importe ?? '0').replace(',', '.'));
}

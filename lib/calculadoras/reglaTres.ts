/**
 * Calculadora de Regla de Tres — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_regla_tres)
 *
 * Soporta:
 * - Regla de tres simple directa: A/B = C/X → X = (B × C) / A
 * - Regla de tres simple inversa: A × B = C × X → X = (A × B) / C
 * - Regla de tres compuesta (dos variables, cualquier combinación directa/inversa)
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoRegla = 'simple-directa' | 'simple-inversa' | 'compuesta';
export type TipoRelacion = 'directa' | 'inversa';

export interface ParametrosReglaTres {
  /** Tipo de regla de tres */
  tipo: TipoRegla;
  /** Valor A (referencia 1 en variable principal) */
  a: number;
  /** Valor B (resultado 1 en variable principal) */
  b: number;
  /** Valor C (referencia 2 en variable principal) */
  c: number;
  // Solo para regla compuesta (segunda variable):
  /** Valor D (referencia 1 en segunda variable) — solo compuesta */
  d?: number;
  /** Valor E (referencia 2 en segunda variable) — solo compuesta */
  e?: number;
  /** Relación de la segunda variable con el resultado — solo compuesta */
  relacionSegundaVariable?: TipoRelacion;
  /** Descripción del contexto (ej: 'Si 3 obreros hacen X en 5 días, ¿cuánto en 8?') */
  contexto?: string;
}

export interface ResultadoReglaTres {
  /** Valor incógnita X */
  valorX: number;
  /** Fórmula aplicada */
  formula: string;
  /** Explicación paso a paso */
  pasos: string[];
  /** Tipo de regla aplicada */
  tipo: TipoRegla;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularReglaTres(p: ParametrosReglaTres): ResultadoReglaTres {
  if (isNaN(p.a) || isNaN(p.b) || isNaN(p.c)) throw new Error('Los valores A, B y C deben ser números válidos.');
  if (p.a === 0) throw new Error('El valor A no puede ser cero.');

  const r = (n: number) => Math.round(n * 1000000) / 1000000; // precisión 6 decimales

  let valorX: number;
  let formula: string;
  const pasos: string[] = [];

  if (p.tipo === 'simple-directa') {
    // A/B = C/X  →  X = (B × C) / A
    valorX = r((p.b * p.c) / p.a);
    formula = 'X = (B × C) / A';
    pasos.push(`Proporción directa: si ${p.a} corresponde a ${p.b}, entonces ${p.c} corresponde a X`);
    pasos.push(`Planteamos: ${p.a} / ${p.b} = ${p.c} / X`);
    pasos.push(`Despejamos: X = (${p.b} × ${p.c}) / ${p.a} = ${p.b * p.c} / ${p.a}`);
    pasos.push(`Resultado: X = ${valorX}`);

  } else if (p.tipo === 'simple-inversa') {
    // A × B = C × X  →  X = (A × B) / C
    if (p.c === 0) throw new Error('El valor C no puede ser cero en la regla inversa.');
    valorX = r((p.a * p.b) / p.c);
    formula = 'X = (A × B) / C';
    pasos.push(`Proporción inversa: si ${p.a} corresponde a ${p.b}, entonces ${p.c} corresponde a X (inversamente)`);
    pasos.push(`Planteamos: ${p.a} × ${p.b} = ${p.c} × X`);
    pasos.push(`Despejamos: X = (${p.a} × ${p.b}) / ${p.c} = ${p.a * p.b} / ${p.c}`);
    pasos.push(`Resultado: X = ${valorX}`);

  } else {
    // Compuesta
    if (p.d === undefined || p.e === undefined || p.relacionSegundaVariable === undefined) {
      throw new Error('Para regla compuesta se necesitan los valores D, E y la relación de la segunda variable.');
    }
    if (isNaN(p.d) || isNaN(p.e)) throw new Error('Los valores D y E deben ser números válidos.');
    if (p.d === 0) throw new Error('El valor D no puede ser cero.');
    if (p.e === 0 && p.relacionSegundaVariable === 'directa') throw new Error('El valor E no puede ser cero cuando la relación es directa.');

    if (p.relacionSegundaVariable === 'directa') {
      // Primera relación directa + Segunda directa: X = (B × C × E) / (A × D)
      valorX = r((p.b * p.c * p.e) / (p.a * p.d));
      formula = 'X = (B × C × E) / (A × D)';
      pasos.push(`Dos proporciones directas:`);
      pasos.push(`  Variable 1 (directa): ${p.a} → ${p.b}, buscamos ${p.c} → ?`);
      pasos.push(`  Variable 2 (directa): ${p.d} → ?, buscamos ${p.e} → ?`);
      pasos.push(`Aplicamos: X = (${p.b} × ${p.c} × ${p.e}) / (${p.a} × ${p.d})`);
    } else {
      // Primera directa + Segunda inversa: X = (B × C × D) / (A × E)
      if (p.e === 0) throw new Error('El valor E no puede ser cero.');
      valorX = r((p.b * p.c * p.d) / (p.a * p.e));
      formula = 'X = (B × C × D) / (A × E)';
      pasos.push(`Proporciones mixtas:`);
      pasos.push(`  Variable 1 (directa): ${p.a} → ${p.b}, buscamos ${p.c} → ?`);
      pasos.push(`  Variable 2 (inversa): ${p.d} → ?, buscamos ${p.e} → ? (se invierte)`);
      pasos.push(`Aplicamos: X = (${p.b} × ${p.c} × ${p.d}) / (${p.a} × ${p.e})`);
    }
    pasos.push(`Resultado: X = ${valorX}`);
  }

  return { valorX, formula, pasos, tipo: p.tipo };
}

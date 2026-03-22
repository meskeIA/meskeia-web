/**
 * Calculadora de la Regla del 72 — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_regla_72)
 *
 * La Regla del 72 es una heurística financiera que estima:
 *   A) Los años que tarda una inversión en doblarse dado un tipo de interés.
 *   B) El tipo de interés necesario para doblar una inversión en X años.
 *
 * Fórmula: años ≈ 72 / tipo%  o  tipo% ≈ 72 / años
 *
 * También incluye la regla exacta (logarítmica) para comparar la aproximación.
 * Encadenable con: calcular_interes_compuesto, calcular_fire
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosRegla72 {
  /**
   * Tipo de interés anual (%). Proporciona este campo para calcular los años
   * necesarios para doblar el capital. Omite si proporcionas aniosParaDoblar.
   */
  tipoInteres?: number;
  /**
   * Años para doblar el capital. Proporciona este campo para calcular el tipo
   * de interés necesario. Omite si proporcionas tipoInteres.
   */
  aniosParaDoblar?: number;
  /** Capital inicial (€). Opcional, solo para enriquecer el resultado. */
  capitalInicial?: number;
}

export interface PuntoDoble {
  /** Años para doblar */
  anios: number;
  /** Capital resultante (€), si se aportó capitalInicial */
  capitalFinal?: number;
}

export interface ResultadoRegla72 {
  /** Modo de cálculo: 'anios' o 'tipo' */
  modo: 'anios' | 'tipo';
  /** Tipo de interés anual (%) */
  tipoInteres: number;
  /** Años para doblar el capital según la Regla del 72 (aproximación) */
  aniosRegla72: number;
  /** Años para doblar el capital según el cálculo exacto (logarítmico) */
  aniosExacto: number;
  /** Error de la aproximación (%) */
  errorAproximacion: number;
  /** Capital inicial (€), si se aportó */
  capitalInicial?: number;
  /** Capital al doblar (€), si se aportó capitalInicial */
  capitalDoblado?: number;
  /** Tabla de dobles: 1x, 2x, 3x... hasta 8x el capital */
  tablaDobles: PuntoDoble[];
  /** Comparativa con otros tipos de interés habituales */
  comparativa: { tipo: number; anios: number; descripcion: string }[];
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularRegla72(p: ParametrosRegla72): ResultadoRegla72 {
  if (p.tipoInteres === undefined && p.aniosParaDoblar === undefined) {
    throw new Error('Debes indicar el tipo de interés o los años para doblar.');
  }
  if (p.tipoInteres !== undefined && p.aniosParaDoblar !== undefined) {
    throw new Error('Indica solo uno: tipo de interés o años para doblar, no ambos.');
  }

  const r2 = (n: number) => Math.round(n * 100) / 100;

  const modo: 'anios' | 'tipo' = p.tipoInteres !== undefined ? 'anios' : 'tipo';

  let tipoInteres: number;
  let aniosRegla72: number;
  let aniosExacto: number;

  if (modo === 'anios') {
    tipoInteres = p.tipoInteres!;
    if (tipoInteres <= 0) throw new Error('El tipo de interés debe ser mayor que cero.');
    aniosRegla72 = r2(72 / tipoInteres);
    aniosExacto = r2(Math.log(2) / Math.log(1 + tipoInteres / 100));
  } else {
    const anios = p.aniosParaDoblar!;
    if (anios <= 0) throw new Error('Los años para doblar deben ser mayores que cero.');
    tipoInteres = r2(72 / anios);
    aniosRegla72 = anios;
    aniosExacto = anios; // en este modo calculamos el tipo, el plazo es el dado
    // Recalcular tipo exacto: (2)^(1/n) - 1 = r
    tipoInteres = r2((Math.pow(2, 1 / anios) - 1) * 100);
    aniosRegla72 = r2(72 / tipoInteres);
    aniosExacto = anios;
  }

  const errorAproximacion = aniosExacto > 0
    ? r2(Math.abs(aniosRegla72 - aniosExacto) / aniosExacto * 100)
    : 0;

  // Tabla de dobles (1x, 2x, 4x, 8x... 256x del capital)
  const tablaDobles: PuntoDoble[] = [];
  for (let doble = 1; doble <= 8; doble++) {
    const aniosDoblamiento = r2(doble * aniosExacto);
    const punto: PuntoDoble = { anios: aniosDoblamiento };
    if (p.capitalInicial) {
      punto.capitalFinal = Math.round(p.capitalInicial * Math.pow(2, doble));
    }
    tablaDobles.push(punto);
  }

  // Comparativa con tipos habituales
  const tiposComparativos = [
    { tipo: 1, descripcion: 'Cuenta corriente / muy conservador' },
    { tipo: 2, descripcion: 'Cuenta remunerada / depósito' },
    { tipo: 4, descripcion: 'Fondo conservador / bonos' },
    { tipo: 7, descripcion: 'Fondo mixto / cartera moderada' },
    { tipo: 10, descripcion: 'Bolsa históricamente (S&P 500 largo plazo)' },
    { tipo: 15, descripcion: 'Inversión de alto riesgo / venture capital' },
  ];

  const comparativa = tiposComparativos.map(t => ({
    tipo: t.tipo,
    anios: r2(Math.log(2) / Math.log(1 + t.tipo / 100)),
    descripcion: t.descripcion,
  }));

  const resultado: ResultadoRegla72 = {
    modo,
    tipoInteres,
    aniosRegla72,
    aniosExacto,
    errorAproximacion,
    tablaDobles,
    comparativa,
  };

  if (p.capitalInicial) {
    resultado.capitalInicial = p.capitalInicial;
    resultado.capitalDoblado = Math.round(p.capitalInicial * 2);
  }

  return resultado;
}

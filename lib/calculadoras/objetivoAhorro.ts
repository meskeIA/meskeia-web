/**
 * Calculadora de Objetivo de Ahorro — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_objetivo_ahorro)
 *
 * Responde dos preguntas complementarias:
 * A) ¿Cuántos meses necesito para ahorrar un objetivo dado un ahorro mensual?
 * B) ¿Cuánto debo ahorrar mensualmente para alcanzar el objetivo en X meses?
 *
 * Considera rentabilidad del ahorro (cuenta remunerada, fondo, etc.)
 * usando la fórmula de valor futuro de una renta.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosObjetivoAhorro {
  /** Objetivo de ahorro a alcanzar (€) */
  objetivoEuros: number;
  /** Ahorro mensual que puedes dedicar (€). Omite para calcular la cuota necesaria. */
  ahorroMensual?: number;
  /** Meses objetivo para alcanzar el ahorro. Omite para calcular el plazo. */
  mesesObjetivo?: number;
  /** Rentabilidad anual del ahorro (%). Por defecto 0% (cuenta sin rentabilidad) */
  rentabilidadAnual?: number;
  /** Capital inicial ya disponible (€). Por defecto 0 */
  capitalInicial?: number;
}

export interface ResultadoObjetivoAhorro {
  /** Objetivo final (€) */
  objetivoEuros: number;
  /** Capital inicial de partida (€) */
  capitalInicial: number;
  /** Capital adicional que hay que acumular (€) */
  capitalAcumular: number;
  /** Rentabilidad anual aplicada (%) */
  rentabilidadAnual: number;
  /** Ahorro mensual necesario/usado (€) */
  ahorroMensual: number;
  /** Meses necesarios/usados para alcanzar el objetivo */
  meses: number;
  /** Años y meses desglosados */
  anios: number;
  mesesRestantes: number;
  /** Intereses/rentabilidad generada durante el período (€) */
  rentabilidadGenerada: number;
  /** Total aportado (sin contar capital inicial) (€) */
  totalAportado: number;
  /** Modo de cálculo */
  modo: 'plazo' | 'cuota';
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularObjetivoAhorro(p: ParametrosObjetivoAhorro): ResultadoObjetivoAhorro {
  if (p.objetivoEuros <= 0) throw new Error('El objetivo debe ser mayor que cero.');
  if (p.ahorroMensual === undefined && p.mesesObjetivo === undefined) {
    throw new Error('Debes indicar el ahorro mensual o los meses objetivo (no ambos vacíos).');
  }
  if (p.ahorroMensual !== undefined && p.mesesObjetivo !== undefined) {
    throw new Error('Indica solo uno: ahorro mensual (para calcular plazo) o meses objetivo (para calcular cuota).');
  }

  const r = (n: number) => Math.round(n * 100) / 100;

  const capitalInicial = p.capitalInicial ?? 0;
  const rentabilidadAnual = p.rentabilidadAnual ?? 0;
  const rMensual = rentabilidadAnual / 100 / 12;
  const capitalAcumular = Math.max(0, p.objetivoEuros - capitalInicial);

  if (capitalAcumular <= 0) {
    // El capital inicial ya cubre el objetivo
    return {
      objetivoEuros: r(p.objetivoEuros),
      capitalInicial: r(capitalInicial),
      capitalAcumular: 0,
      rentabilidadAnual,
      ahorroMensual: 0,
      meses: 0,
      anios: 0,
      mesesRestantes: 0,
      rentabilidadGenerada: 0,
      totalAportado: 0,
      modo: p.ahorroMensual !== undefined ? 'plazo' : 'cuota',
    };
  }

  let meses: number;
  let ahorroMensual: number;
  const modo: 'plazo' | 'cuota' = p.ahorroMensual !== undefined ? 'plazo' : 'cuota';

  if (modo === 'plazo') {
    // Calcular cuántos meses se tarda
    ahorroMensual = p.ahorroMensual!;
    if (ahorroMensual <= 0) throw new Error('El ahorro mensual debe ser mayor que cero.');

    if (rMensual === 0) {
      // Sin rentabilidad: simple
      meses = Math.ceil(capitalAcumular / ahorroMensual);
    } else {
      // VF = C × ((1+r)^n - 1) / r  → despejar n
      // (1+r)^n = 1 + capitalAcumular × r / ahorroMensual
      const factor = 1 + (capitalAcumular * rMensual) / ahorroMensual;
      if (factor <= 0) {
        throw new Error('La rentabilidad es insuficiente: el objetivo no es alcanzable con ese ahorro mensual.');
      }
      meses = Math.ceil(Math.log(factor) / Math.log(1 + rMensual));
    }
  } else {
    // Calcular cuota mensual necesaria para alcanzar en mesesObjetivo
    meses = p.mesesObjetivo!;
    if (meses <= 0) throw new Error('Los meses objetivo deben ser mayores que cero.');

    if (rMensual === 0) {
      ahorroMensual = r(capitalAcumular / meses);
    } else {
      // C = VF × r / ((1+r)^n - 1)
      ahorroMensual = r(capitalAcumular * rMensual / (Math.pow(1 + rMensual, meses) - 1));
    }
  }

  const totalAportado = r(ahorroMensual * meses);
  const rentabilidadGenerada = r(capitalAcumular - totalAportado);
  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  return {
    objetivoEuros: r(p.objetivoEuros),
    capitalInicial: r(capitalInicial),
    capitalAcumular: r(capitalAcumular),
    rentabilidadAnual,
    ahorroMensual: r(ahorroMensual),
    meses,
    anios,
    mesesRestantes,
    rentabilidadGenerada: Math.max(0, rentabilidadGenerada),
    totalAportado,
    modo,
  };
}

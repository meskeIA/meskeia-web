/**
 * Calculadora de Penalización / Comisión por Amortización Anticipada — lógica pura
 * Usada por: MCP server (calcular_penalizacion_hipoteca)
 *
 * Calcula la comisión máxima por amortización anticipada total o parcial
 * de una hipoteca según la Ley 5/2019 reguladora del crédito inmobiliario (LCCI).
 *
 * La LCCI distingue entre hipotecas a tipo variable y a tipo fijo:
 *
 * TIPO VARIABLE (art. 23.4 LCCI):
 *   - Primeros 3 años: máx 0,25% capital amortizado
 *   - Años 4 y 5: máx 0,15% capital amortizado
 *   - A partir del año 6: 0% (sin comisión)
 *   Si el contrato fija solo un plazo para la comisión, se aplica el 0,25% o 0,15%
 *
 * TIPO FIJO (art. 23.5 LCCI):
 *   - Primeros 10 años: máx 2% capital amortizado
 *   - A partir del año 11: máx 1,5%
 *
 * Hipotecas mixtas: fijo durante el período mixto, luego variable.
 *
 * Hipotecas pre-LCCI (firmadas antes del 16/06/2019):
 *   Se rigen por la Ley 41/2007 y el contrato:
 *   - Variable: 0,5% los primeros 5 años; 0,25% resto
 *   - Fija: lo que diga el contrato (sin límite legal)
 *
 * Encadenable con: calcular_hipoteca, calcular_amortizacion_anticipada
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoHipotecaAmortizacion = 'variable' | 'fija' | 'mixta';
export type RegulacionHipoteca = 'lcci_2019' | 'pre_lcci';

export interface ParametrosPenalizacionHipoteca {
  /** Capital pendiente o importe a amortizar anticipadamente (€) */
  capitalAmortizar: number;
  /** Tipo de hipoteca */
  tipoHipoteca: TipoHipotecaAmortizacion;
  /** Año de vida de la hipoteca en el momento de la amortización (1 = primer año) */
  anioVidaHipoteca: number;
  /** Regulación aplicable. Por defecto 'lcci_2019'. */
  regulacion?: RegulacionHipoteca;
  /**
   * Para hipotecas mixtas: duración del período inicial a tipo fijo (años).
   * Si ya ha terminado el período fijo, se aplican los tramos variables.
   */
  aniosPeriodoFijo?: number;
  /**
   * Comisión pactada en escritura (%). Si se indica, se usa en lugar del máximo legal.
   * Debe ser ≤ máximo legal; si supera, se aplica el máximo.
   */
  comisionPactadaPct?: number;
}

export interface ResultadoPenalizacionHipoteca {
  /** Capital amortizado (€) */
  capitalAmortizar: number;
  /** Tipo de hipoteca */
  tipoHipoteca: TipoHipotecaAmortizacion;
  /** Año de vida en el momento de la amortización */
  anioVidaHipoteca: number;
  /** Regulación aplicada */
  regulacion: RegulacionHipoteca;
  /** Porcentaje máximo legal aplicable (%) */
  porcentajeMaximoLegal: number;
  /** Porcentaje efectivo aplicado (menor o igual al máximo legal) (%) */
  porcentajeEfectivo: number;
  /** Comisión a pagar (€) */
  comisionAPagar: number;
  /** ¿Hipoteca libre de comisión? */
  sinComision: boolean;
  /** Explicación del tramo aplicado */
  tramoAplicado: string;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPenalizacionHipoteca(p: ParametrosPenalizacionHipoteca): ResultadoPenalizacionHipoteca {
  if (p.capitalAmortizar <= 0) throw new Error('El capital a amortizar debe ser mayor que cero.');
  if (p.anioVidaHipoteca < 1) throw new Error('El año de vida debe ser 1 o mayor.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const regulacion = p.regulacion ?? 'lcci_2019';
  const anio = p.anioVidaHipoteca;

  let porcentajeMaximo: number;
  let tramoAplicado: string;

  if (regulacion === 'pre_lcci') {
    // Ley 41/2007 / Ley Hipotecaria anterior
    if (p.tipoHipoteca === 'variable') {
      porcentajeMaximo = anio <= 5 ? 0.5 : 0.25;
      tramoAplicado = anio <= 5
        ? 'Hipoteca pre-LCCI variable: 0,50% (primeros 5 años)'
        : 'Hipoteca pre-LCCI variable: 0,25% (a partir del año 6)';
    } else {
      // Para fija pre-LCCI, lo que diga el contrato (usamos comisiónPactada o 1% como ejemplo)
      porcentajeMaximo = p.comisionPactadaPct ?? 1;
      tramoAplicado = 'Hipoteca pre-LCCI fija: se aplica lo pactado en escritura (sin límite legal)';
    }
  } else {
    // LCCI 2019
    switch (p.tipoHipoteca) {
      case 'variable':
        if (anio <= 3) {
          porcentajeMaximo = 0.25;
          tramoAplicado = 'LCCI 2019 variable: 0,25% (años 1-3)';
        } else if (anio <= 5) {
          porcentajeMaximo = 0.15;
          tramoAplicado = 'LCCI 2019 variable: 0,15% (años 4-5)';
        } else {
          porcentajeMaximo = 0;
          tramoAplicado = 'LCCI 2019 variable: 0% (a partir del año 6) — sin comisión';
        }
        break;

      case 'fija':
        if (anio <= 10) {
          porcentajeMaximo = 2;
          tramoAplicado = 'LCCI 2019 fija: 2,00% (primeros 10 años)';
        } else {
          porcentajeMaximo = 1.5;
          tramoAplicado = 'LCCI 2019 fija: 1,50% (a partir del año 11)';
        }
        break;

      case 'mixta': {
        const aniosPeriodoFijo = p.aniosPeriodoFijo ?? 10;
        if (anio <= aniosPeriodoFijo) {
          // Período fijo
          porcentajeMaximo = anio <= 10 ? 2 : 1.5;
          tramoAplicado = `LCCI 2019 mixta en período fijo: ${anio <= 10 ? '2,00%' : '1,50%'}`;
        } else {
          // Período variable
          const anioVar = anio - aniosPeriodoFijo;
          if (anioVar <= 3) {
            porcentajeMaximo = 0.25;
            tramoAplicado = 'LCCI 2019 mixta en período variable: 0,25% (años 1-3)';
          } else if (anioVar <= 5) {
            porcentajeMaximo = 0.15;
            tramoAplicado = 'LCCI 2019 mixta en período variable: 0,15% (años 4-5)';
          } else {
            porcentajeMaximo = 0;
            tramoAplicado = 'LCCI 2019 mixta en período variable: 0% (a partir del año 6) — sin comisión';
          }
        }
        break;
      }

      default:
        throw new Error('Tipo de hipoteca no reconocido.');
    }
  }

  // Porcentaje efectivo: pactado vs máximo legal
  let porcentajeEfectivo: number;
  if (p.comisionPactadaPct !== undefined) {
    porcentajeEfectivo = Math.min(p.comisionPactadaPct, porcentajeMaximo);
  } else {
    porcentajeEfectivo = porcentajeMaximo;
  }

  const comisionAPagar = r(p.capitalAmortizar * (porcentajeEfectivo / 100));
  const sinComision = porcentajeEfectivo === 0;

  return {
    capitalAmortizar: r(p.capitalAmortizar),
    tipoHipoteca: p.tipoHipoteca,
    anioVidaHipoteca: anio,
    regulacion,
    porcentajeMaximoLegal: porcentajeMaximo,
    porcentajeEfectivo,
    comisionAPagar,
    sinComision,
    tramoAplicado,
    fuenteDatos: regulacion === 'lcci_2019'
      ? 'Ley 5/2019 de crédito inmobiliario (LCCI) art. 23 — vigente desde 16/06/2019'
      : 'Ley 41/2007 (pre-LCCI) — aplica a hipotecas firmadas antes del 16/06/2019',
  };
}

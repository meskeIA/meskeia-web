/**
 * Calculadora FIRE (Financial Independence, Retire Early) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_fire)
 *
 * Calcula el "número FIRE" (patrimonio objetivo) y los años necesarios para alcanzarlo,
 * usando la regla del 4% (tasa de retiro segura) y el interés compuesto.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoFIRE = 'lean' | 'normal' | 'fat';

export interface ParametrosFIRE {
  /** Gastos anuales (€) — base del número FIRE */
  gastosAnuales: number;
  /** Ingresos anuales netos (€) — para calcular ahorro */
  ingresosAnuales: number;
  /** Patrimonio invertido actual (€, puede ser 0) */
  patrimonioActual?: number;
  /** Rentabilidad anual esperada de la cartera (%, por defecto 7) */
  rentabilidadAnual?: number;
  /** Tasa de retiro segura (%, por defecto 4 — regla del 4%) */
  tasaRetiro?: number;
}

export interface PuntoProyeccion {
  ano: number;
  patrimonio: number;
}

export interface ResultadoFIRE {
  /** Patrimonio necesario para FIRE = gastos / tasaRetiro */
  numeroFIRE: number;
  /** Años necesarios para alcanzar FIRE (Infinity si ahorro <= 0) */
  anosParaFIRE: number;
  /** Tasa de ahorro anual (%) */
  tasaAhorro: number;
  /** Ahorro anual (ingresos - gastos) */
  ahorroAnual: number;
  /** Tipo FIRE según nivel de gastos */
  tipoFIRE: TipoFIRE;
  /** Descripción del tipo FIRE */
  descripcionTipoFIRE: string;
  /** Tasa de retiro usada (%) */
  tasaRetiro: number;
  /** Rentabilidad usada (%) */
  rentabilidadAnual: number;
  /** Proyección patrimonial año a año (máx 51 puntos) */
  proyeccion: PuntoProyeccion[];
  /** Si el ahorro actual es positivo */
  tieneAhorroPositivo: boolean;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularFIRE(p: ParametrosFIRE): ResultadoFIRE {
  if (p.gastosAnuales <= 0) throw new Error('Los gastos anuales deben ser mayores que cero.');
  if (p.ingresosAnuales <= 0) throw new Error('Los ingresos anuales deben ser mayores que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const patrimonioActual = p.patrimonioActual ?? 0;
  const rentabilidad = (p.rentabilidadAnual ?? 7) / 100;
  const tasaRetiro = (p.tasaRetiro ?? 4) / 100;

  const numeroFIRE = r(p.gastosAnuales / tasaRetiro);
  const ahorroAnual = r(p.ingresosAnuales - p.gastosAnuales);
  const tasaAhorro = r((ahorroAnual / p.ingresosAnuales) * 100);

  let tipoFIRE: TipoFIRE;
  let descripcionTipoFIRE: string;
  if (p.gastosAnuales < 20000) {
    tipoFIRE = 'lean';
    descripcionTipoFIRE = 'Lean FIRE: vida frugal, máxima austeridad. Gastos < 20.000 €/año.';
  } else if (p.gastosAnuales > 50000) {
    tipoFIRE = 'fat';
    descripcionTipoFIRE = 'Fat FIRE: independencia financiera con holgura. Gastos > 50.000 €/año.';
  } else {
    tipoFIRE = 'normal';
    descripcionTipoFIRE = 'FIRE estándar: equilibrio entre frugalidad y comodidad. Gastos 20.000-50.000 €/año.';
  }

  const proyeccion: PuntoProyeccion[] = [{ ano: 0, patrimonio: r(patrimonioActual) }];
  let anosParaFIRE: number;

  if (ahorroAnual <= 0) {
    anosParaFIRE = Infinity;
  } else {
    let acumulado = patrimonioActual;
    let anos = 0;
    while (acumulado < numeroFIRE && anos < 100) {
      acumulado = acumulado * (1 + rentabilidad) + ahorroAnual;
      anos++;
      if (proyeccion.length < 51) {
        proyeccion.push({ ano: anos, patrimonio: r(acumulado) });
      }
    }
    anosParaFIRE = acumulado >= numeroFIRE ? anos : Infinity;
  }

  return {
    numeroFIRE,
    anosParaFIRE,
    tasaAhorro,
    ahorroAnual,
    tipoFIRE,
    descripcionTipoFIRE,
    tasaRetiro: (tasaRetiro * 100),
    rentabilidadAnual: ((p.rentabilidadAnual ?? 7)),
    proyeccion,
    tieneAhorroPositivo: ahorroAnual > 0,
  };
}

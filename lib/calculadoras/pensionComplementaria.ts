/**
 * Calculadora de Pensión Complementaria — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_pension_complementaria)
 *
 * Calcula cuánto capital privado necesitas acumular y cuánto debes ahorrar
 * mensualmente para complementar la pensión pública hasta el nivel de renta
 * deseado en la jubilación.
 *
 * Usa la Regla del 4% (Estudio Trinity, 1998) para estimar el capital necesario
 * y la fórmula de valor futuro de renta para el ahorro mensual.
 *
 * Encadenable con: calcular_pension_publica, calcular_brecha_jubilacion,
 *                   calcular_interes_compuesto, calcular_fire
 *
 * La esperanza de vida por defecto sale de `data/fiscal/esperanza-vida` (INE),
 * el mismo supuesto que usa `brechaJubilacion`.
 */

import { aniosCobroEstimados } from '@/data/fiscal/esperanza-vida';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosPensionComplementaria {
  /** Renta mensual neta deseada en jubilación (€) */
  rentaDeseadaMensual: number;
  /** Pensión pública estimada (neta mensual) (€). Usa calcular_pension_publica si no la conoces */
  pensionPublicaEstimada: number;
  /** Edad actual (años) */
  edadActual: number;
  /** Edad de jubilación objetivo (años). Por defecto 67 */
  edadJubilacion?: number;
  /** Edad final estimada (años). Por defecto, 65 + esperanza de vida a los 65 según el INE */
  esperanzaVida?: number;
  /** Rentabilidad anual esperada del ahorro durante la acumulación (%). Por defecto 5% */
  rentabilidadAcumulacion?: number;
  /** Rentabilidad anual esperada durante la fase de retiro (%). Por defecto 3% */
  rentabilidadRetiro?: number;
  /** Capital privado ya acumulado para jubilación (planes de pensiones, fondos, etc.) (€). Por defecto 0 */
  capitalYaAcumulado?: number;
  /**
   * Método de estimación del capital necesario:
   * - 'regla4': Capital = brecha anual / 0.04 (Regla del 4%, perpetuidad aproximada)
   * - 'anualidad': Valor presente de la anualidad durante la esperanza de vida
   * Por defecto 'anualidad'
   */
  metodo?: 'regla4' | 'anualidad';
}

export interface ResultadoPensionComplementaria {
  /** Renta mensual deseada (€) */
  rentaDeseadaMensual: number;
  /** Pensión pública estimada (€) */
  pensionPublicaEstimada: number;
  /** Brecha mensual (renta deseada - pensión pública) (€) */
  brechaMensual: number;
  /** Brecha anual (€) */
  brechaAnual: number;
  /** Años de ahorro hasta la jubilación */
  anosAhorro: number;
  /** Años de jubilación a cubrir (esperanza de vida - edad jubilación) */
  anosJubilacion: number;
  /** Capital privado necesario en la jubilación (€) */
  capitalNecesario: number;
  /** Capital ya acumulado (€) */
  capitalYaAcumulado: number;
  /** Capital adicional que hay que acumular (€) */
  capitalPorAcumular: number;
  /** Ahorro mensual necesario para alcanzar el capital en los años de ahorro (€) */
  ahorroMensualNecesario: number;
  /** % de los ingresos actuales que representa el ahorro mensual */
  porcentajeIngresosAhorro?: number;
  /** Método usado para estimar el capital */
  metodo: 'regla4' | 'anualidad';
  /** ¿La pensión pública ya cubre la renta deseada? */
  pensionSuficiente: boolean;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPensionComplementaria(p: ParametrosPensionComplementaria): ResultadoPensionComplementaria {
  if (p.rentaDeseadaMensual <= 0) throw new Error('La renta deseada mensual debe ser mayor que cero.');
  if (p.pensionPublicaEstimada < 0) throw new Error('La pensión pública estimada no puede ser negativa.');
  if (p.edadActual < 18 || p.edadActual > 70) throw new Error('La edad actual debe estar entre 18 y 70 años.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const edadJubilacion = p.edadJubilacion ?? 67;
  const rentabilidadAcumulacion = p.rentabilidadAcumulacion ?? 5;
  const rentabilidadRetiro = p.rentabilidadRetiro ?? 3;
  const capitalYaAcumulado = p.capitalYaAcumulado ?? 0;
  const metodo = p.metodo ?? 'anualidad';

  if (edadJubilacion <= p.edadActual) throw new Error('La edad de jubilación debe ser mayor que la edad actual.');

  const brechaMensual = Math.max(0, p.rentaDeseadaMensual - p.pensionPublicaEstimada);
  const brechaAnual = r(brechaMensual * 12);
  const anosAhorro = edadJubilacion - p.edadActual;
  // Sin edad final explícita, los años a cubrir salen de la misma función que usa
  // calcularBrechaJubilacion, para que los dos motores no puedan volver a divergir.
  const anosJubilacion =
    p.esperanzaVida != null
      ? Math.max(1, p.esperanzaVida - edadJubilacion)
      : aniosCobroEstimados(edadJubilacion);

  const pensionSuficiente = brechaMensual <= 0;

  if (pensionSuficiente) {
    return {
      rentaDeseadaMensual: r(p.rentaDeseadaMensual),
      pensionPublicaEstimada: r(p.pensionPublicaEstimada),
      brechaMensual: 0,
      brechaAnual: 0,
      anosAhorro,
      anosJubilacion,
      capitalNecesario: 0,
      capitalYaAcumulado: r(capitalYaAcumulado),
      capitalPorAcumular: 0,
      ahorroMensualNecesario: 0,
      metodo,
      pensionSuficiente: true,
    };
  }

  // Capital necesario en la jubilación
  let capitalNecesario: number;
  const rRetiroMensual = rentabilidadRetiro / 100 / 12;
  const nRetiro = anosJubilacion * 12;

  if (metodo === 'regla4') {
    // Regla del 4%: capital = gasto_anual / 0.04
    capitalNecesario = r(brechaAnual / 0.04);
  } else {
    // Valor presente de anualidad: PV = C × (1 - (1+r)^-n) / r
    if (rRetiroMensual === 0) {
      capitalNecesario = r(brechaMensual * nRetiro);
    } else {
      capitalNecesario = r(brechaMensual * (1 - Math.pow(1 + rRetiroMensual, -nRetiro)) / rRetiroMensual);
    }
  }

  // Capital adicional a acumular
  const capitalPorAcumular = r(Math.max(0, capitalNecesario - capitalYaAcumulado));

  // Ahorro mensual necesario para acumular capitalPorAcumular en anosAhorro
  let ahorroMensualNecesario: number;
  const rAcumMensual = rentabilidadAcumulacion / 100 / 12;
  const nAcum = anosAhorro * 12;

  if (capitalPorAcumular <= 0) {
    ahorroMensualNecesario = 0;
  } else if (rAcumMensual === 0) {
    ahorroMensualNecesario = r(capitalPorAcumular / nAcum);
  } else {
    // C = VF × r / ((1+r)^n - 1)
    ahorroMensualNecesario = r(capitalPorAcumular * rAcumMensual / (Math.pow(1 + rAcumMensual, nAcum) - 1));
  }

  return {
    rentaDeseadaMensual: r(p.rentaDeseadaMensual),
    pensionPublicaEstimada: r(p.pensionPublicaEstimada),
    brechaMensual: r(brechaMensual),
    brechaAnual,
    anosAhorro,
    anosJubilacion,
    capitalNecesario,
    capitalYaAcumulado: r(capitalYaAcumulado),
    capitalPorAcumular,
    ahorroMensualNecesario,
    metodo,
    pensionSuficiente: false,
  };
}

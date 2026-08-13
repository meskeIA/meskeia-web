/**
 * Calculadora de Brecha de Jubilación — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_brecha_jubilacion)
 *
 * Calcula cuánto dinero perderás al jubilarte (diferencia sueldo - pensión)
 * y cuánto debes ahorrar mensualmente para cubrirlo.
 *
 * Los años de jubilación por defecto salen de `data/fiscal/esperanza-vida`
 * (INE), que es el supuesto único de longevidad del catálogo.
 */

import { aniosCobroEstimados } from '@/data/fiscal/esperanza-vida';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosBrechaJubilacion {
  /** Sueldo neto mensual actual (€) */
  sueldoNetoMensual: number;
  /** Pensión mensual estimada al jubilarse (€) */
  pensionEstimadaMensual: number;
  /** Edad actual (años) */
  edadActual: number;
  /** Edad de jubilación prevista (años, por defecto 67) */
  edadJubilacion?: number;
  /** Años previstos de jubilación (por defecto, los que restan según la esperanza de vida del INE) */
  anosJubilado?: number;
  /** Rentabilidad anual esperada del ahorro (%, por defecto 4) */
  rentabilidadAnual?: number;
}

export interface ResultadoBrechaJubilacion {
  /** Brecha mensual (sueldo - pensión) en euros */
  brechaMensual: number;
  /** Brecha anual */
  brechaAnual: number;
  /** Capital total necesario para cubrir la brecha durante los años de jubilación */
  capitalNecesario: number;
  /** Porcentaje de la pensión respecto al sueldo actual */
  porcentajePensionSobreSueldo: number;
  /** Años que quedan hasta jubilarse */
  anosHastaJubilacion: number;
  /** Ahorro mensual necesario desde hoy para cubrir la brecha */
  ahorroMensualNecesario: number;
  /** Si existe brecha real (pensión < sueldo) */
  tieneBrecha: boolean;
  /** Edad de jubilación usada */
  edadJubilacion: number;
  /** Años de jubilación usados */
  anosJubilado: number;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularBrechaJubilacion(p: ParametrosBrechaJubilacion): ResultadoBrechaJubilacion {
  if (p.sueldoNetoMensual <= 0) throw new Error('El sueldo neto mensual debe ser mayor que cero.');
  if (p.pensionEstimadaMensual < 0) throw new Error('La pensión estimada no puede ser negativa.');
  if (p.edadActual < 18 || p.edadActual > 70) throw new Error('La edad actual debe estar entre 18 y 70 años.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const edadJubilacion = p.edadJubilacion ?? 67;
  const anosJubilado = p.anosJubilado ?? aniosCobroEstimados(edadJubilacion);
  const rentabilidad = p.rentabilidadAnual ?? 4;

  if (edadJubilacion <= p.edadActual) throw new Error('La edad de jubilación debe ser mayor que la edad actual.');

  const brechaMensual = r(Math.max(0, p.sueldoNetoMensual - p.pensionEstimadaMensual));
  const brechaAnual = r(brechaMensual * 12);
  const capitalNecesario = r(brechaAnual * anosJubilado);
  const porcentajePensionSobreSueldo = r((p.pensionEstimadaMensual / p.sueldoNetoMensual) * 100);
  const anosHastaJubilacion = edadJubilacion - p.edadActual;

  // PMT = FV × r_mes / ((1 + r_mes)^n - 1)
  let ahorroMensualNecesario = 0;
  if (capitalNecesario > 0 && anosHastaJubilacion > 0) {
    const rMes = rentabilidad / 100 / 12;
    const n = anosHastaJubilacion * 12;
    if (rMes === 0) {
      ahorroMensualNecesario = capitalNecesario / n;
    } else {
      ahorroMensualNecesario = (capitalNecesario * rMes) / (Math.pow(1 + rMes, n) - 1);
    }
  }

  return {
    brechaMensual,
    brechaAnual,
    capitalNecesario,
    porcentajePensionSobreSueldo,
    anosHastaJubilacion,
    ahorroMensualNecesario: r(Math.max(0, ahorroMensualNecesario)),
    tieneBrecha: brechaMensual > 0,
    edadJubilacion,
    anosJubilado,
  };
}

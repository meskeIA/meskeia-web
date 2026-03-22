/**
 * Calculadora de Macronutrientes — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_macros)
 *
 * Calcula TMB (Tasa Metabólica Basal) con fórmula Mifflin-St Jeor,
 * TDEE según nivel de actividad y distribución de macros por objetivo.
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SexoBiologico = 'hombre' | 'mujer';
export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
export type ObjetivoNutricional = 'definicion' | 'mantenimiento' | 'volumen';

export interface ParametrosMacros {
  /** Peso corporal (kg) */
  peso: number;
  /** Altura (cm) */
  altura: number;
  /** Edad (años) */
  edad: number;
  /** Sexo biológico */
  sexo: SexoBiologico;
  /** Nivel de actividad física */
  nivelActividad: NivelActividad;
  /** Objetivo nutricional */
  objetivo: ObjetivoNutricional;
}

export interface MacrosDetalle {
  proteinas: number;  // g/día
  carbohidratos: number; // g/día
  grasas: number;     // g/día
  caloriasProteinas: number;
  caloriasCarbohidratos: number;
  caloriasGrasas: number;
}

export interface ResultadoMacros {
  /** Tasa Metabólica Basal (kcal/día) */
  tmb: number;
  /** Total Daily Energy Expenditure (kcal/día) */
  tdee: number;
  /** Calorías objetivo (ajustadas por objetivo) */
  caloriasObjetivo: number;
  /** Ajuste calórico respecto al TDEE */
  ajusteKcal: number;
  /** Nivel de actividad */
  nivelActividad: NivelActividad;
  /** Factor de actividad aplicado */
  factorActividad: number;
  /** Objetivo nutricional */
  objetivo: ObjetivoNutricional;
  /** Distribución de macros */
  macros: MacrosDetalle;
  /** Ratios de macros (%) */
  ratios: { proteinas: number; carbohidratos: number; grasas: number };
  /** IMC aproximado */
  imc: number;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const FACTORES_ACTIVIDAD: Record<NivelActividad, number> = {
  sedentario:   1.2,    // Sin ejercicio, trabajo de oficina
  ligero:       1.375,  // Ejercicio 1-3 días/semana
  moderado:     1.55,   // Ejercicio 3-5 días/semana
  activo:       1.725,  // Ejercicio 6-7 días/semana
  muy_activo:   1.9,    // Ejercicio intenso diario o 2x/día
};

const CONFIG_OBJETIVOS: Record<ObjetivoNutricional, {
  ajusteKcal: number;
  ratios: { proteinas: number; carbohidratos: number; grasas: number };
}> = {
  definicion:    { ajusteKcal: -500, ratios: { proteinas: 30, carbohidratos: 40, grasas: 30 } },
  mantenimiento: { ajusteKcal: 0,    ratios: { proteinas: 25, carbohidratos: 50, grasas: 25 } },
  volumen:       { ajusteKcal: 400,  ratios: { proteinas: 25, carbohidratos: 50, grasas: 25 } },
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularMacros(p: ParametrosMacros): ResultadoMacros {
  if (p.peso <= 0 || p.peso > 300) throw new Error('El peso debe estar entre 1 y 300 kg.');
  if (p.altura <= 0 || p.altura > 250) throw new Error('La altura debe estar entre 1 y 250 cm.');
  if (p.edad <= 0 || p.edad > 120) throw new Error('La edad debe estar entre 1 y 120 años.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const ri = (n: number) => Math.round(n);

  // Mifflin-St Jeor
  let tmb: number;
  if (p.sexo === 'hombre') {
    tmb = 10 * p.peso + 6.25 * p.altura - 5 * p.edad + 5;
  } else {
    tmb = 10 * p.peso + 6.25 * p.altura - 5 * p.edad - 161;
  }
  tmb = r(tmb);

  const factorActividad = FACTORES_ACTIVIDAD[p.nivelActividad];
  const tdee = r(tmb * factorActividad);

  const config = CONFIG_OBJETIVOS[p.objetivo];
  const caloriasObjetivo = ri(tdee + config.ajusteKcal);

  // Macros
  const kcalProteinas = r(caloriasObjetivo * config.ratios.proteinas / 100);
  const kcalCarbohidratos = r(caloriasObjetivo * config.ratios.carbohidratos / 100);
  const kcalGrasas = r(caloriasObjetivo * config.ratios.grasas / 100);

  const macros: MacrosDetalle = {
    proteinas: ri(kcalProteinas / 4),
    carbohidratos: ri(kcalCarbohidratos / 4),
    grasas: ri(kcalGrasas / 9),
    caloriasProteinas: kcalProteinas,
    caloriasCarbohidratos: kcalCarbohidratos,
    caloriasGrasas: kcalGrasas,
  };

  const imc = r(p.peso / ((p.altura / 100) ** 2));

  return {
    tmb,
    tdee,
    caloriasObjetivo,
    ajusteKcal: config.ajusteKcal,
    nivelActividad: p.nivelActividad,
    factorActividad,
    objetivo: p.objetivo,
    macros,
    ratios: config.ratios,
    imc,
  };
}

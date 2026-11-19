/**
 * Calculadora de Macronutrientes — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_macros)
 *
 * Usada también por: app/calculadora-macros (desde el 18/11/2026)
 *
 * Calcula TMB (Tasa Metabólica Basal) con fórmula Mifflin-St Jeor, TDEE según nivel de actividad
 * y el reparto de macros por objetivo: proteína por kg, grasa mínima y el resto en carbohidratos.
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
  /**
   * El objetivo queda por debajo de la TMB estimada: la energía que el cuerpo gasta en reposo.
   * Pasa en definición con un TDEE bajo, porque el déficit es fijo (−500 kcal) y no proporcional:
   * mujer 45 kg, 150 cm, 30 años, sedentaria → TMB 1077, TDEE 1292, objetivo 792 (hallazgo 5032).
   */
  bajoTmb: boolean;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const FACTORES_ACTIVIDAD: Record<NivelActividad, number> = {
  sedentario:   1.2,    // Sin ejercicio, trabajo de oficina
  ligero:       1.375,  // Ejercicio 1-3 días/semana
  moderado:     1.55,   // Ejercicio 3-5 días/semana
  activo:       1.725,  // Ejercicio 6-7 días/semana
  muy_activo:   1.9,    // Ejercicio intenso diario o 2x/día
};

/**
 * Reparto «proteína primero» (hallazgo 5034, decidido por el usuario el 18/11/2026, cabo C0819).
 * Hasta entonces era un % fijo de las kcal (30/40/30 en definición, 25/50/25 en el resto) y la
 * proteína crecía con las kcal: 3,2 g/kg en volumen muy activo y 1,3 g/kg en definición sedentaria,
 * fuera de los rangos que la propia app enseña. Ahora, como su guía paso a paso (pasos 4-6):
 *   · proteína en g/kg según objetivo: el punto medio del rango de la tabla «Comparativa de macros
 *     por objetivo» de la app (definición 2,0-2,2 → 2,1; mantenimiento 1,6-1,8 → 1,7; volumen
 *     1,6-2,0 → 1,8);
 *   · grasa: al menos el 20 % de las kcal (paso 5 de la guía) y no menos de los g/kg mínimos de la
 *     misma tabla (definición «Mínimo 0,6 g/kg»; mantenimiento y volumen «0,8-1,0 g/kg» → 0,8);
 *   · carbohidratos: el resto de las kcal.
 */
const CONFIG_OBJETIVOS: Record<ObjetivoNutricional, {
  ajusteKcal: number;
  proteinaGKg: number;
  grasaMinGKg: number;
}> = {
  definicion:    { ajusteKcal: -500, proteinaGKg: 2.1, grasaMinGKg: 0.6 },
  mantenimiento: { ajusteKcal: 0,    proteinaGKg: 1.7, grasaMinGKg: 0.8 },
  volumen:       { ajusteKcal: 400,  proteinaGKg: 1.8, grasaMinGKg: 0.8 },
};

/** Grasa mínima como fracción de las kcal objetivo (paso 5 de la guía de la app). */
const GRASA_MIN_FRACCION_KCAL = 0.2;

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

  // Una ingesta no puede ser cero ni negativa. Con datos que la app acepta pasa en definición
  // (mujer 30 kg, 100 cm, 100 años, sedentaria: TDEE 317 − 500 = −183 kcal, hallazgo 5032); hasta
  // el 18/11/2026 salía «−183 kcal» y gramos negativos como objetivo diario.
  if (caloriasObjetivo <= 0) {
    throw new Error(
      `Con estos datos el metabolismo basal estimado es de ${ri(tmb)} kcal y el gasto diario de ` +
      `${ri(tdee)} kcal: no alcanza para restar ${Math.abs(config.ajusteKcal)} kcal, así que no se ` +
      `puede proponer un objetivo de definición.`
    );
  }

  // Macros: proteína primero (g/kg), grasa mínima y el resto a carbohidratos
  const kcalProteinas = r(p.peso * config.proteinaGKg * 4);
  const kcalGrasas = r(Math.max(caloriasObjetivo * GRASA_MIN_FRACCION_KCAL, p.peso * config.grasaMinGKg * 9));
  const kcalCarbohidratos = r(caloriasObjetivo - kcalProteinas - kcalGrasas);

  // Con mucho peso y pocas kcal (300 kg en definición, por ejemplo) la proteína por kilo y la grasa
  // mínima no caben en el objetivo: los g/kg de la tabla están pensados para personas que entrenan,
  // y no hay cifra honesta que dar.
  if (kcalCarbohidratos < 0) {
    throw new Error(
      `Con estos datos el metabolismo basal estimado es de ${ri(tmb)} kcal y el gasto diario de ` +
      `${ri(tdee)} kcal, y la proteína (${ri(kcalProteinas / 4)} g) y la grasa mínima ` +
      `(${ri(kcalGrasas / 9)} g) suman ${ri(kcalProteinas + kcalGrasas)} kcal, más que el objetivo de ` +
      `${caloriasObjetivo} kcal: el reparto por kilo de peso no sirve para este caso. Un ` +
      `dietista-nutricionista puede calcularlo con tu masa magra.`
    );
  }

  const ratios = {
    proteinas: ri(kcalProteinas / caloriasObjetivo * 100),
    carbohidratos: ri(kcalCarbohidratos / caloriasObjetivo * 100),
    grasas: ri(kcalGrasas / caloriasObjetivo * 100),
  };

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
    ratios,
    imc,
    bajoTmb: caloriasObjetivo < tmb,
  };
}

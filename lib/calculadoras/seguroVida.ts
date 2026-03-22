/**
 * Calculadora de Capital de Seguro de Vida — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_seguro_vida)
 *
 * Estima el capital que debería tener un seguro de vida para cubrir
 * adecuadamente las necesidades de la familia del asegurado.
 *
 * Metodología DINK ajustada (Dual Income, No Kids + ajuste familiar):
 * Capital = sustitución de ingresos + deudas + educación hijos + funerario + colchón
 * - recursos disponibles (ahorros + seguros actuales)
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosSeguroVida {
  /** Edad del asegurado (años) */
  edad: number;
  /** Edad de jubilación objetivo (años, por defecto 67) */
  edadJubilacion?: number;
  /** Ingreso anual bruto del asegurado (€) */
  ingresoAnual: number;
  /** Ingreso anual del cónyuge/pareja (€, 0 si no aplica) */
  ingresoConyuge?: number;
  /** Capital hipotecario pendiente (€) */
  hipotecaPendiente?: number;
  /** Otras deudas (préstamos personales, coches, etc.) (€) */
  otrasDeudas?: number;
  /** Número de hijos a cargo */
  numHijos?: number;
  /** Edad del hijo más joven (para calcular años de educación) */
  edadHijoMenor?: number;
  /** Ahorros e inversiones actuales del hogar (€) */
  ahorrosActuales?: number;
  /** Capital de seguros de vida existentes (€) */
  seguroVidaActual?: number;
}

export interface ResultadoSeguroVida {
  /** Capital mínimo necesario (solo cubre deudas y emergencias) */
  capitalMinimo: number;
  /** Capital recomendado (cubre todas las necesidades) */
  capitalRecomendado: number;
  /** Capital óptimo (con +20% de colchón por inflación) */
  capitalOptimo: number;
  /** Años de cobertura necesarios */
  anosCobertura: number;
  /** Desglose de necesidades */
  desglose: {
    sustitucionIngresos: number;
    deudas: number;
    hipoteca: number;
    otrasDeudas: number;
    educacionHijos: number;
    gastosFunerarios: number;
    colchonEmergencia: number;
    totalNecesidades: number;
    recursosDisponibles: number;
  };
  /** Cobertura actual del seguro existente (%) */
  coberturaActualPct: number;
  /** ¿El seguro actual es suficiente? */
  seguroActualSuficiente: boolean;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSeguroVida(p: ParametrosSeguroVida): ResultadoSeguroVida {
  if (p.edad < 18 || p.edad > 80) throw new Error('La edad debe estar entre 18 y 80 años.');
  if (p.ingresoAnual <= 0) throw new Error('El ingreso anual debe ser mayor que cero.');

  const edadJubilacion = p.edadJubilacion ?? 67;
  const ingresoConyuge = p.ingresoConyuge ?? 0;
  const hipotecaPendiente = p.hipotecaPendiente ?? 0;
  const otrasDeudas = p.otrasDeudas ?? 0;
  const numHijos = p.numHijos ?? 0;
  const edadHijoMenor = p.edadHijoMenor ?? 0;
  const ahorrosActuales = p.ahorrosActuales ?? 0;
  const seguroVidaActual = p.seguroVidaActual ?? 0;

  const r = (n: number) => Math.round(n);

  // Años hasta jubilación
  const anosHastaJubilacion = Math.max(0, edadJubilacion - p.edad);

  // 1. Sustitución de ingresos (método DINK ajustado)
  // El cónyuge aporta el 30% de su ingreso como ayuda al hogar tras el fallecimiento
  const ingresoNetoASustituir = p.ingresoAnual - ingresoConyuge * 0.3;
  const factorSustitucion = Math.min(anosHastaJubilacion, 15); // máx 15 años de cobertura
  const sustitucionIngresos = r(Math.max(0, ingresoNetoASustituir * factorSustitucion * 0.7)); // 70% ingreso

  // 2. Deudas
  const deudas = hipotecaPendiente + otrasDeudas;

  // 3. Educación de hijos
  let educacionHijos = 0;
  if (numHijos > 0 && edadHijoMenor > 0 && edadHijoMenor < 23) {
    const anosHastaIndependencia = Math.max(0, 23 - edadHijoMenor);
    const costeBasico = anosHastaIndependencia * 8000;         // 8.000€/año (colegio, actividades)
    const costeUniversidad = Math.min(anosHastaIndependencia, 5) * 15000; // 15.000€ últimos 5 años
    educacionHijos = r((costeBasico + costeUniversidad) * numHijos);
  }

  // 4. Gastos funerarios y últimos gastos
  const gastosFunerarios = 10000;

  // 5. Colchón de emergencia (6 meses de ingresos)
  const colchonEmergencia = r((p.ingresoAnual / 12) * 6);

  // Capital bruto total necesario
  const totalNecesidades = sustitucionIngresos + deudas + educacionHijos + gastosFunerarios + colchonEmergencia;

  // Recursos ya disponibles
  const recursosDisponibles = ahorrosActuales + seguroVidaActual;

  // Tres niveles de cobertura (redondeados a miles)
  const roundMiles = (n: number) => Math.round(Math.max(0, n) / 1000) * 1000;

  const capitalMinimo = roundMiles(deudas + gastosFunerarios + colchonEmergencia - recursosDisponibles);
  const capitalRecomendado = roundMiles(totalNecesidades - recursosDisponibles);
  const capitalOptimo = roundMiles(totalNecesidades * 1.2 - recursosDisponibles); // +20% inflación

  const coberturaActualPct = capitalRecomendado > 0
    ? Math.round((seguroVidaActual / capitalRecomendado) * 100)
    : 100;

  return {
    capitalMinimo,
    capitalRecomendado,
    capitalOptimo,
    anosCobertura: anosHastaJubilacion,
    desglose: {
      sustitucionIngresos,
      deudas,
      hipoteca: hipotecaPendiente,
      otrasDeudas,
      educacionHijos,
      gastosFunerarios,
      colchonEmergencia,
      totalNecesidades: r(totalNecesidades),
      recursosDisponibles: r(recursosDisponibles),
    },
    coberturaActualPct,
    seguroActualSuficiente: seguroVidaActual >= capitalRecomendado,
  };
}

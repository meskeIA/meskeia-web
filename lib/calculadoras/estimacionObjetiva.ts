/**
 * Calculadora de Rendimiento en Estimación Objetiva (Módulos) — lógica pura
 * Usada por: MCP server (calcular_estimacion_objetiva)
 *
 * Calcula el rendimiento neto de actividades económicas en el régimen de
 * Estimación Objetiva (módulos), regulado en el RIRPF arts. 32-37 y
 * desarrollado anualmente por Orden Ministerial.
 *
 * Marco normativo:
 *   - LIRPF arts. 28-31 (actividades económicas)
 *   - RIRPF arts. 32-37 (estimación objetiva)
 *   - Orden anual de módulos: Orden HAC/[número]/[año] (publicada en BOE)
 *     La Orden vigente en 2025 fija los módulos y sus importes por unidad.
 *
 * Fórmula de cálculo:
 *   1. Rendimiento neto previo = Σ (unidades_módulo_i × rendimiento_anual_i)
 *   2. Rendimiento neto minorado = rendimiento neto previo × (1 - pct_minoración_personal)
 *   3. Índices correctores aplicables (según actividad y circunstancias)
 *   4. Rendimiento neto de módulos = rendimiento neto minorado × Π(índices correctores)
 *   5. Reducciones adicionales (inicio actividad, reducción general 2025)
 *
 * Módulos típicos:
 *   - Personal no asalariado (titular y cónyuge): rendimiento/persona/año
 *   - Personal asalariado: rendimiento/persona/año (proporcionado)
 *   - Superficie del local: rendimiento/m²/año
 *   - Potencia eléctrica instalada: rendimiento/kW/año
 *   - Mesas (restauración): rendimiento/mesa/año
 *   - Máquinas recreativas: rendimiento/máquina/año
 *
 * Minoración por personal (RIRPF art. 34):
 *   Sobre el rendimiento neto previo se aplica una minoración de:
 *   - Por personal no asalariado: 0,10 × rendimiento de dicho módulo
 *   - Por personal asalariado: 0,125 × rendimiento de dicho módulo
 *   En la práctica, el rendimiento calculado YA incluye esta minoración en la
 *   mayoría de las Órdenes ministeriales. Esta calculadora asume que los
 *   valores de módulo aportados son los brutos (antes de minoración).
 *
 * Índices correctores habituales (RIRPF art. 35):
 *   - Actividad en municipio ≤2.000 hab.: 0,80
 *   - Actividad en municipio 2.001-5.000 hab.: 0,90
 *   - Actividad temporal (temporada): según duración
 *   - Inicio de actividad (nuevas actividades): ver reducción de inicio
 *
 * Reducciones (RIRPF arts. 36-37 + Ley PGE anual):
 *   - Inicio de actividad (primer año): 20% de reducción sobre rendimiento neto
 *   - Inicio de actividad (segundo año): 10% de reducción
 *   - Reducción general 2025: 10% (prorrogada por Ley 22/2024)
 *   - Reducción por irregularidad (>2 años generación): 30%, máx. 300.000 €
 *
 * NOTA IMPORTANTE: Esta calculadora es un motor de cálculo general.
 *   Los valores de rendimiento por unidad de módulo están fijados en la Orden
 *   Ministerial anual y varían por actividad (IAE). El usuario debe aportar los
 *   valores correctos para su actividad según la Orden vigente.
 *
 * Fuente: RIRPF arts. 32-37 + Orden HAC anual de módulos — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_cuota_autonomo, calcular_modelo_130
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────

const PCT_REDUCCION_INICIO_ANIO1 = 20;  // % reducción primer año actividad
const PCT_REDUCCION_INICIO_ANIO2 = 10;  // % reducción segundo año actividad
const PCT_REDUCCION_GENERAL_2025 = 10;  // % reducción general (prorrogada 2025)
const PCT_REDUCCION_IRREGULARIDAD = 30; // % reducción por irregularidad (>2 años)
const LIMITE_REDUCCION_IRREGULARIDAD = 300000; // € máximo

// Índices correctores por tamaño de municipio
const INDICE_MUNICIPIO_HASTA_2000 = 0.80;
const INDICE_MUNICIPIO_2001_5000 = 0.90;

// ─── Tipos públicos ────────────────────────────────────────────────────────

export interface ModuloEO {
  /** Nombre del módulo (ej: "Personal no asalariado", "Superficie del local") */
  nombre: string;
  /** Número de unidades del módulo (personas, m², kW, mesas, etc.) */
  unidades: number;
  /**
   * Rendimiento anual por unidad de módulo (€/unidad/año).
   * Este valor está publicado en la Orden Ministerial anual para cada actividad.
   */
  rendimientoAnualPorUnidad: number;
}

export type TamanioMunicipioEO =
  | 'hasta_2000_hab'
  | '2001_5000_hab'
  | 'mas_5000_hab';

export type SituacionInicioActividadEO =
  | 'actividad_consolidada'  // Más de 2 años de actividad
  | 'primer_anio'            // Primer año completo de actividad
  | 'segundo_anio';          // Segundo año de actividad

export interface ParametrosEstimacionObjetiva {
  /** Descripción de la actividad (ej: "Bar - categoría 2 tenedores") */
  descripcionActividad?: string;
  /** Código IAE de la actividad (referencia, no afecta al cálculo) */
  codigoIAE?: string;
  /**
   * Lista de módulos con sus unidades y rendimiento por unidad.
   * Los valores de rendimiento/unidad se obtienen de la Orden Ministerial anual.
   */
  modulos: ModuloEO[];
  /** Tamaño del municipio donde se ejerce la actividad (aplica índice corrector) */
  tamanioMunicipio?: TamanioMunicipioEO;
  /** ¿Actividad de temporada? Si es así, indicar meses de actividad al año */
  mesesActividad?: number; // 1-12; si omitido, se asume actividad todo el año
  /** Situación de inicio de actividad (para reducciones) */
  situacionInicio?: SituacionInicioActividadEO;
  /** ¿Aplicar reducción general 2025 del 10%? (prorrogada por Ley 22/2024) */
  aplicarReduccionGeneral2025?: boolean;
  /**
   * ¿Aplicar reducción por irregularidad del 30%?
   * Solo si los rendimientos se han generado en un período >2 años.
   */
  aplicarReduccionIrregularidad?: boolean;
  /** Tipo marginal IRPF (%) — para estimar la cuota */
  tipoMarginalIRPF?: number;
}

export interface ResultadoEstimacionObjetiva {
  /** Descripción de la actividad */
  descripcionActividad: string;
  /** Desglose de módulos */
  detalleModulos: { nombre: string; unidades: number; rendimientoPorUnidad: number; totalModulo: number }[];
  /** Rendimiento neto previo (suma de todos los módulos) (€) */
  rendimientoNetoPrevio: number;
  /** Índice corrector por municipio aplicado */
  indiceCorrectorMunicipio: number;
  /** Proporción de actividad por temporada aplicada */
  proporcionTemporada: number;
  /** Rendimiento neto tras índices correctores (€) */
  rendimientoNetoTrasCorrectores: number;
  /** Reducción por inicio de actividad (€) */
  reduccionInicio: number;
  /** Reducción general 2025 (€) */
  reduccionGeneral2025: number;
  /** Reducción por irregularidad (€) */
  reduccionIrregularidad: number;
  /** **Rendimiento neto de módulos (base de tributación en IRPF) (€)** */
  rendimientoNetoModulos: number;
  /** Cuota IRPF estimada (€) */
  cuotaIRPFEstimada: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularEstimacionObjetiva(
  p: ParametrosEstimacionObjetiva
): ResultadoEstimacionObjetiva {
  if (!p.modulos || p.modulos.length === 0) throw new Error('Debe indicar al menos un módulo.');
  if (p.modulos.some(m => m.unidades < 0)) throw new Error('Las unidades de módulo no pueden ser negativas.');
  if (p.modulos.some(m => m.rendimientoAnualPorUnidad < 0)) throw new Error('El rendimiento por unidad no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoMarginal = p.tipoMarginalIRPF ?? 30;

  // ── Calcular rendimiento de cada módulo ──────────────────────────────────
  const detalleModulos = p.modulos.map(m => ({
    nombre: m.nombre,
    unidades: m.unidades,
    rendimientoPorUnidad: m.rendimientoAnualPorUnidad,
    totalModulo: r(m.unidades * m.rendimientoAnualPorUnidad),
  }));
  const rendimientoNetoPrevio = r(detalleModulos.reduce((s, m) => s + m.totalModulo, 0));

  // ── Índices correctores ───────────────────────────────────────────────────
  let indiceCorrectorMunicipio = 1;
  if (p.tamanioMunicipio === 'hasta_2000_hab') {
    indiceCorrectorMunicipio = INDICE_MUNICIPIO_HASTA_2000;
  } else if (p.tamanioMunicipio === '2001_5000_hab') {
    indiceCorrectorMunicipio = INDICE_MUNICIPIO_2001_5000;
  }

  const meses = p.mesesActividad ?? 12;
  const proporcionTemporada = meses / 12;

  const rendimientoNetoTrasCorrectores = r(
    rendimientoNetoPrevio * indiceCorrectorMunicipio * proporcionTemporada
  );

  // ── Reducciones ───────────────────────────────────────────────────────────
  const situacionInicio = p.situacionInicio ?? 'actividad_consolidada';
  let reduccionInicio = 0;
  if (situacionInicio === 'primer_anio') {
    reduccionInicio = r(rendimientoNetoTrasCorrectores * PCT_REDUCCION_INICIO_ANIO1 / 100);
  } else if (situacionInicio === 'segundo_anio') {
    reduccionInicio = r(rendimientoNetoTrasCorrectores * PCT_REDUCCION_INICIO_ANIO2 / 100);
  }

  const baseTrasinicio = r(rendimientoNetoTrasCorrectores - reduccionInicio);

  const aplicarGeneral = p.aplicarReduccionGeneral2025 ?? true;
  const reduccionGeneral2025 = aplicarGeneral ? r(baseTrasinicio * PCT_REDUCCION_GENERAL_2025 / 100) : 0;

  const baseTraslGeneral = r(baseTrasinicio - reduccionGeneral2025);

  const aplicarIrregularidad = p.aplicarReduccionIrregularidad ?? false;
  const reduccionIrregularidad = aplicarIrregularidad
    ? r(Math.min(baseTraslGeneral * PCT_REDUCCION_IRREGULARIDAD / 100, LIMITE_REDUCCION_IRREGULARIDAD))
    : 0;

  const rendimientoNetoModulos = r(baseTraslGeneral - reduccionIrregularidad);
  const cuotaIRPFEstimada = r(rendimientoNetoModulos * tipoMarginal / 100);

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push('Los valores de rendimiento por unidad de módulo DEBEN obtenerse de la Orden Ministerial de Módulos vigente para el ejercicio (publicada en el BOE). Esta calculadora es un motor de cálculo; los valores de módulo no están precargados por actividad IAE.');
  advertencias.push('El rendimiento neto de módulos tributa en el IRPF como rendimiento de actividades económicas. Se integra en la base general, sujeto a la escala progresiva. No tributa en el ahorro (a diferencia de las plusvalías).');
  advertencias.push(`Reducción general 2025: el 10% ha sido prorrogado por la Ley 22/2024. Si hay cambio legislativo posterior, verificar si sigue vigente.`);
  if (p.tamanioMunicipio === 'hasta_2000_hab' || p.tamanioMunicipio === '2001_5000_hab') {
    advertencias.push(`Índice corrector por municipio pequeño (${indiceCorrectorMunicipio}): solo aplica a las actividades que lo prevén expresamente en la Orden de Módulos. Verificar si su actividad IAE concreta lo contempla.`);
  }
  advertencias.push('El régimen de estimación objetiva (módulos) exige no superar los límites de exclusión: ingresos ≤250.000 €/año (operaciones anotables), compras ≤250.000 €/año. Si se superan, obligatorio pasar a estimación directa.');
  if (p.mesesActividad && p.mesesActividad < 12) {
    advertencias.push(`Actividad de temporada (${p.mesesActividad} meses): se ha aplicado la proporción ${p.mesesActividad}/12. Las bases de los módulos que sean "anuales" deben anualizarse y luego aplicar la proporción. Los módulos "por unidad y día" requieren cómputo diferente.`);
  }

  return {
    descripcionActividad: p.descripcionActividad ?? (p.codigoIAE ? `Actividad IAE ${p.codigoIAE}` : 'Actividad en estimación objetiva'),
    detalleModulos,
    rendimientoNetoPrevio,
    indiceCorrectorMunicipio,
    proporcionTemporada,
    rendimientoNetoTrasCorrectores,
    reduccionInicio,
    reduccionGeneral2025,
    reduccionIrregularidad,
    rendimientoNetoModulos,
    cuotaIRPFEstimada,
    advertencias,
    fuenteDatos: 'RIRPF arts. 32-37 + Orden HAC módulos 2025 — vigente 2025',
  };
}

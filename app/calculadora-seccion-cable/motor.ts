// Motor de la calculadora de sección de cable — sin dependencias de presentación.
//
// La sección de una línea es la MAYOR de las que piden dos criterios:
//   · Caída de tensión: S = 2·L·I·cos φ/(γ·ΔV) en monofásico, √3·L·I·cos φ/(γ·ΔV) en trifásico.
//   · Intensidad admisible (calentamiento): la primera sección cuya Iz de la ITC-BT-19, Tabla 1,
//     cubre la corriente, según método de instalación, aislamiento y conductores cargados.
//
// Hasta el 16/10/2026 solo existía el primero, y un tramo corto con mucha corriente salía con
// 1,5 mm² para 40 A. Cuando el segundo no se puede comprobar (aluminio, combinación que la tabla
// no recoge, corriente por encima de la tabla) NO hay sección recomendada: solo la de caída,
// con su nombre.

import {
  SECCIONES_TABLA_ITC_BT_19,
  intensidadAdmisible,
  METODOS_ITC_BT_19,
  type Aislamiento,
  type ConductoresCargados,
  type MetodoInstalacion,
} from '@/data/rebt-intensidades-admisibles';

export type Modo = 'seccion' | 'caida';
export type Sistema = 'monofasico' | 'trifasico';
export type EntradaCarga = 'potencia' | 'corriente';
export type MaterialId = 'cobre' | 'aluminio';

/** Conductividad en m/(Ω·mm²) a la temperatura de servicio de cada aislamiento */
export const CONDUCTIVIDAD: Record<MaterialId, Record<Aislamiento, number>> = {
  cobre: { PVC: 48, XLPE: 44 },
  aluminio: { PVC: 30, XLPE: 28 },
};

/** Temperatura máxima de servicio del aislamiento, en °C */
export const TEMPERATURA_SERVICIO: Record<Aislamiento, number> = { PVC: 70, XLPE: 90 };

/** Secciones comerciales normalizadas para conductores de baja tensión */
export const SECCIONES_NORMALIZADAS = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400,
];

export interface Entrada {
  modo: Modo;
  sistema: Sistema;
  tension: number;
  entradaCarga: EntradaCarga;
  potencia: number;
  corrienteManual: number;
  cosPhi: number;
  longitud: number;
  material: MaterialId;
  aislamiento: Aislamiento;
  metodo: MetodoInstalacion;
  limitePorcentaje: number;
  seccionElegida: number;
}

/** Por qué no se puede aplicar el criterio de intensidad admisible */
export type MotivoSinTabla = 'aluminio' | 'metodo' | 'excede';

export type CriterioIntensidad =
  | { estado: 'ok'; seccion: number; iz: number }
  | { estado: 'sin-tabla'; motivo: MotivoSinTabla; izMaxima: number | null };

export interface Resultado {
  corriente: number; // A
  conductoresCargados: ConductoresCargados;
  gamma: number; // m/(Ω·mm²)
  porcentajeLimite: number; // %
  caidaAdmisibleV: number; // V
  seccionTeorica: number; // mm² — la que pide la caída, sin redondear
  seccionPorCaida: number | null; // mm² normalizada; null si supera la mayor comercial
  intensidad: CriterioIntensidad;
  /** Mayor de los dos criterios; null si alguno no se ha podido resolver */
  seccionRecomendada: number | null;
  criterioDominante: 'caida' | 'intensidad' | 'ambos' | null;
  seccionUsada: number; // mm² — la que se emplea para el resto de resultados
  izSeccionUsada: number | null; // A, según la tabla
  caidaV: number; // V
  caidaPorcentaje: number; // %
  tensionReceptor: number; // V
  densidadCorriente: number; // A/mm²
  resistenciaLinea: number; // Ω (un conductor)
  perdidas: number; // W
  cumpleCaida: boolean;
  /** null cuando la tabla no permite decirlo */
  cumpleIntensidad: boolean | null;
}

export function conductoresDeSistema(sistema: Sistema): ConductoresCargados {
  return sistema === 'monofasico' ? 2 : 3;
}

/** Métodos de la tabla que tienen columna para este aislamiento y número de conductores */
export function metodosDisponibles(
  aislamiento: Aislamiento,
  conductores: ConductoresCargados,
): MetodoInstalacion[] {
  return METODOS_ITC_BT_19.filter((m) => m.columnas[aislamiento][conductores] !== undefined).map(
    (m) => m.id,
  );
}

function criterioIntensidad(
  corriente: number,
  material: MaterialId,
  metodo: MetodoInstalacion,
  aislamiento: Aislamiento,
  conductores: ConductoresCargados,
): CriterioIntensidad {
  if (material !== 'cobre') return { estado: 'sin-tabla', motivo: 'aluminio', izMaxima: null };
  const valores = SECCIONES_TABLA_ITC_BT_19.map((s) => ({
    seccion: s as number,
    iz: intensidadAdmisible(metodo, aislamiento, conductores, s),
  })).filter((v): v is { seccion: number; iz: number } => v.iz !== null);
  if (valores.length === 0) return { estado: 'sin-tabla', motivo: 'metodo', izMaxima: null };
  const primera = valores.find((v) => v.iz >= corriente);
  if (!primera) {
    return { estado: 'sin-tabla', motivo: 'excede', izMaxima: valores[valores.length - 1].iz };
  }
  return { estado: 'ok', seccion: primera.seccion, iz: primera.iz };
}

export function calcularLinea(e: Entrada): Resultado {
  const conductoresCargados = conductoresDeSistema(e.sistema);
  const gamma = CONDUCTIVIDAD[e.material][e.aislamiento];
  const V = Math.max(e.tension, 1);
  const L = Math.max(e.longitud, 0.1);
  const fp = Math.min(Math.max(e.cosPhi, 0.1), 1);
  const esMono = e.sistema === 'monofasico';

  // Corriente de cálculo
  const corriente =
    e.entradaCarga === 'corriente'
      ? Math.max(e.corrienteManual, 0.01)
      : esMono
        ? Math.max(e.potencia, 1) / (V * fp)
        : Math.max(e.potencia, 1) / (Math.sqrt(3) * V * fp);

  // Caída admisible en voltios a partir del porcentaje
  const porcentajeLimite = Math.min(Math.max(e.limitePorcentaje, 0.1), 20);
  const caidaAdmisibleV = (porcentajeLimite / 100) * V;

  // Sección mínima por caída de tensión
  // Monofásico: la corriente recorre ida y vuelta → factor 2
  // Trifásico equilibrado: factor √3
  const factor = esMono ? 2 : Math.sqrt(3);
  const seccionTeorica = (factor * L * corriente * fp) / (gamma * caidaAdmisibleV);
  const seccionPorCaida = SECCIONES_NORMALIZADAS.find((s) => s >= seccionTeorica) ?? null;

  // Sección mínima por intensidad admisible
  const intensidad = criterioIntensidad(
    corriente,
    e.material,
    e.metodo,
    e.aislamiento,
    conductoresCargados,
  );

  let seccionRecomendada: number | null = null;
  let criterioDominante: Resultado['criterioDominante'] = null;
  if (seccionPorCaida !== null && intensidad.estado === 'ok') {
    seccionRecomendada = Math.max(seccionPorCaida, intensidad.seccion);
    criterioDominante =
      seccionPorCaida === intensidad.seccion
        ? 'ambos'
        : seccionPorCaida > intensidad.seccion
          ? 'caida'
          : 'intensidad';
  }

  // En modo "caída" manda la sección que elige el usuario
  const seccionUsada =
    e.modo === 'caida' ? e.seccionElegida : (seccionRecomendada ?? seccionPorCaida ?? seccionTeorica);

  const caidaV = (factor * L * corriente * fp) / (gamma * seccionUsada);
  const caidaPorcentaje = (caidaV / V) * 100;

  // Resistencia de UN conductor y pérdidas por efecto Joule
  const resistenciaLinea = L / (gamma * seccionUsada);
  const perdidas = (esMono ? 2 : 3) * corriente * corriente * resistenciaLinea;

  const izSeccionUsada =
    e.material === 'cobre'
      ? intensidadAdmisible(e.metodo, e.aislamiento, conductoresCargados, seccionUsada)
      : null;

  // La Iz crece con la sección en todas las columnas: basta comparar con la primera que cumple
  const cumpleIntensidad =
    intensidad.estado === 'ok'
      ? seccionUsada >= intensidad.seccion
      : intensidad.motivo === 'excede'
        ? false
        : null;

  return {
    corriente,
    conductoresCargados,
    gamma,
    porcentajeLimite,
    caidaAdmisibleV,
    seccionTeorica,
    seccionPorCaida,
    intensidad,
    seccionRecomendada,
    criterioDominante,
    seccionUsada,
    izSeccionUsada,
    caidaV,
    caidaPorcentaje,
    tensionReceptor: V - caidaV,
    densidadCorriente: corriente / seccionUsada,
    resistenciaLinea,
    perdidas,
    cumpleCaida: caidaPorcentaje <= porcentajeLimite,
    cumpleIntensidad,
  };
}

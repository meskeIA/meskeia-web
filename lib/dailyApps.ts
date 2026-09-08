/**
 * Selección de apps del día
 *
 * Genera una selección determinística de apps basada en la fecha actual.
 * Cada día se muestran 4 apps diferentes, rotando dentro del pool de apps con
 * demanda demostrada. La selección es consistente: todos los usuarios ven las
 * mismas apps el mismo día.
 *
 * ⚠️ La rotación NO va sobre el catálogo entero desde el 08/09/2026. Sorteando 4
 * apps al azar entre las +1.100 del catálogo, el módulo rendía 36 clics en 30 días
 * (3,8 % de las sesiones que entran por la portada) frente al 40,0 % del buscador
 * que tiene justo encima, y esos 36 clics se repartían entre 25 apps sin que
 * ninguna pasara de 3: la firma de un módulo que no se elige, se acepta. El pool
 * lo genera `scripts/generate-apps-demandadas.mjs` con las visitas reales de los
 * últimos 90 días, y con ~100 apps el ciclo sigue siendo de ~26 días, así que
 * «cambian cada día» se mantiene cierto.
 */

import { Application, applicationsDatabase } from '@/data/applications';
import { APPS_DEMANDADAS } from '@/data/apps-demandadas';

/**
 * Genera un hash numérico simple a partir de un string
 * Usado para crear una "semilla" determinística basada en la fecha
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash);
}

/**
 * Generador de números pseudoaleatorios determinístico (LCG)
 * Permite generar la misma secuencia de números dada una semilla
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    // Parámetros del Linear Congruential Generator
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Mezcla un array de forma determinística usando Fisher-Yates con semilla
 */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Número mínimo de apps para que el pool tenga sentido: por debajo de esto la
 * rotación repetiría lo mismo cada pocos días y sale más a cuenta el catálogo.
 */
const MINIMO_POOL = 20;

/**
 * Pool de candidatas: las apps con demanda demostrada que siguen en el catálogo.
 *
 * El cruce con `applicationsDatabase` no es decorativo — el pool se genera desde
 * los slugs que emite el tracker, así que una app renombrada o retirada dejaría
 * un slug sin ficha. Si el pool se queda corto (fichero recién vaciado, catálogo
 * reordenado), se cae al catálogo entero: es peor rotación, pero nunca una
 * portada sin tarjetas.
 */
function getPoolDemandadas(apps: Application[]): Application[] {
  const porSlug = new Map(apps.map((app) => [app.url.replace(/\//g, ''), app]));
  const pool = APPS_DEMANDADAS
    .map((slug) => porSlug.get(slug))
    .filter((app): app is Application => app !== undefined);

  return pool.length >= MINIMO_POOL ? pool : apps;
}

/**
 * Obtiene las apps del día actual
 *
 * @param count Número de apps a devolver (default: 4)
 * @param apps Array de apps sobre el que construir el pool (default: applicationsDatabase)
 * @returns Array de apps seleccionadas para hoy
 */
export function getDailyApps(
  count: number = 4,
  apps: Application[] = applicationsDatabase
): Application[] {
  // Usar la fecha como semilla (formato YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const seed = hashString(today);

  // Mezclar el pool de forma determinística
  const shuffled = shuffleWithSeed(getPoolDemandadas(apps), seed);

  // Devolver las primeras 'count' apps
  return shuffled.slice(0, count);
}

/**
 * Obtiene las apps de un día específico (útil para testing)
 *
 * @param date Fecha en formato YYYY-MM-DD
 * @param count Número de apps
 * @param apps Array de apps
 */
export function getDailyAppsForDate(
  date: string,
  count: number = 4,
  apps: Application[] = applicationsDatabase
): Application[] {
  const seed = hashString(date);
  const shuffled = shuffleWithSeed(getPoolDemandadas(apps), seed);
  return shuffled.slice(0, count);
}

/**
 * Calcula cuántos días de rotación hay antes de repetir el ciclo completo.
 *
 * Cuenta sobre el POOL, no sobre el catálogo: es el pool lo que se rota. Con las
 * ~102 apps demandadas y 4 por día salen ~26 días.
 */
export function getRotationCycleDays(
  appsPerDay: number = 4,
  totalApps: number = getPoolDemandadas(applicationsDatabase).length
): number {
  return Math.ceil(totalApps / appsPerDay);
}

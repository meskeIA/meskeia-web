/**
 * Selección de apps del día
 *
 * Genera una selección determinística de apps basada en la fecha actual.
 * Cada día se muestran 4 apps diferentes, rotando entre todas las disponibles.
 * La selección es consistente: todos los usuarios ven las mismas apps el mismo día.
 */

import { Application, applicationsDatabase } from '@/data/applications';

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
 * Obtiene las apps del día actual
 *
 * @param count Número de apps a devolver (default: 4)
 * @param apps Array de apps (default: applicationsDatabase)
 * @returns Array de apps seleccionadas para hoy
 */
export function getDailyApps(
  count: number = 4,
  apps: Application[] = applicationsDatabase
): Application[] {
  // Usar la fecha como semilla (formato YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const seed = hashString(today);

  // Mezclar apps de forma determinística
  const shuffled = shuffleWithSeed(apps, seed);

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
  const shuffled = shuffleWithSeed(apps, seed);
  return shuffled.slice(0, count);
}

/**
 * Calcula cuántos días de rotación hay antes de repetir el ciclo completo
 * Con 168 apps y 4 por día = 42 días
 */
export function getRotationCycleDays(
  appsPerDay: number = 4,
  totalApps: number = applicationsDatabase.length
): number {
  return Math.ceil(totalApps / appsPerDay);
}

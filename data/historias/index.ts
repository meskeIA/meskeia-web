import { HistoriaData } from './types';
import { grecia } from './grecia';

const registry: Record<string, HistoriaData> = {
  grecia,
};

export function getHistoria(slug: string): HistoriaData | null {
  return registry[slug] ?? null;
}

export function getAllHistoriaSlugs(): string[] {
  return Object.keys(registry);
}

import { HistoriaData } from './types';
import { grecia } from './grecia';
import { roma } from './roma';

const registry: Record<string, HistoriaData> = {
  grecia,
  roma,
};

export function getHistoria(slug: string): HistoriaData | null {
  return registry[slug] ?? null;
}

export function getAllHistoriaSlugs(): string[] {
  return Object.keys(registry);
}

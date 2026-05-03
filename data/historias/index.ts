import { HistoriaData } from './types';
import { grecia } from './grecia';
import { roma } from './roma';
import { egipto } from './egipto';
import { mesopotamia } from './mesopotamia';
import { otomano } from './otomano';
import { mongol } from './mongol';
import { revolucionFrancesa } from './revolucion-francesa';
import { imperioPersa } from './imperio-persa';
import { japon } from './japon';
import { chinaDinastias } from './china-dinastias';
import { primeraGuerraMundial } from './primera-guerra-mundial';
import { segundaGuerraMundial } from './segunda-guerra-mundial';
import { civilizacionesPrecolombinas } from './civilizaciones-precolombinas';
import { espanaMedieval } from './espana-medieval';

const registry: Record<string, HistoriaData> = {
  grecia,
  roma,
  egipto,
  mesopotamia,
  otomano,
  mongol,
  'revolucion-francesa': revolucionFrancesa,
  'imperio-persa': imperioPersa,
  japon,
  'china-dinastias': chinaDinastias,
  'primera-guerra-mundial': primeraGuerraMundial,
  'segunda-guerra-mundial': segundaGuerraMundial,
  'civilizaciones-precolombinas': civilizacionesPrecolombinas,
  'espana-medieval': espanaMedieval,
};

export function getHistoria(slug: string): HistoriaData | null {
  return registry[slug] ?? null;
}

export function getAllHistoriaSlugs(): string[] {
  return Object.keys(registry);
}

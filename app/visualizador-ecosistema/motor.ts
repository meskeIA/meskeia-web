/**
 * Motor del visualizador de ecosistemas — la aritmética de la «regla del 10 %».
 *
 * Sin dependencias de React: lo usa page.tsx para que todas las cifras de la pirámide, del flujo
 * de energía, de la dieta y del atún salgan de UNA sola regla y no puedan contradecirse entre sí.
 * Hasta el 25/09/2026 estaban escritas a mano y el atún quedaba a la vez en el nivel del 1 % y a
 * «10.000 kg de fitoplancton por kg» (0,01 %, un quinto nivel que la pirámide no tiene; hallazgo
 * 1735 del Inspector).
 *
 * La regla es una MEDIA, no una ley (hallazgo 1734): se suele atribuir a Lindeman (1942), que no
 * la llamó ley y citó eficiencias desde el 0,1 % hasta el 37,5 %. Aquí se aplica al pie de la
 * letra solo para enseñar el orden de magnitud, y la vista lo dice.
 *
 * Casos resueltos a mano (base 10.000 kcal, factor 10 por transferencia):
 *   energía       10.000 → 1.000 → 100 → 10 kcal
 *   pérdidas      10.000 − 1.000 = 9.000 · 1.000 − 100 = 900 · 100 − 10 = 90
 *   % de la base  100 · 10 · 1 · 0,1
 *   kg de productor por kg de consumidor: 1 transferencia → 10 · 2 → 100 · 3 → 1.000
 */

/** Eficiencia media de transferencia entre niveles tróficos (≈ 10 %). */
export const EFICIENCIA_MEDIA = 0.1;

/** Cuántas veces menos energía llega al subir un nivel (1 / 0,1 = 10). Entero, para no
 *  arrastrar el error binario de 0,1 al elevarlo a una potencia. */
const FACTOR = Math.round(1 / EFICIENCIA_MEDIA);

/** Energía que queda tras `transferencias` pasos, partiendo de `base`. */
export function energiaTrasTransferencias(base: number, transferencias: number): number {
  return base / Math.pow(FACTOR, transferencias);
}

/** Porcentaje de la energía de los productores que llega a un nivel con `transferencias` pasos. */
export function porcentajeDeLosProductores(transferencias: number): number {
  return energiaTrasTransferencias(100, transferencias);
}

/** Kilos de productor necesarios por kilo del consumidor que está `transferencias` pasos arriba. */
export function kgProductorPorKg(transferencias: number): number {
  return Math.pow(FACTOR, transferencias);
}

export interface PasoFlujo {
  kcal: number;
  /** Energía que no pasa del nivel anterior a este (0 en el primero). */
  perdida: number;
}

/** Flujo de energía por `niveles` niveles tróficos desde `base` kcal en los productores. */
export function flujoEnergia(base: number, niveles: number): PasoFlujo[] {
  const pasos: PasoFlujo[] = [];
  for (let i = 0; i < niveles; i++) {
    const kcal = energiaTrasTransferencias(base, i);
    const anterior = i === 0 ? kcal : energiaTrasTransferencias(base, i - 1);
    pasos.push({ kcal, perdida: anterior - kcal });
  }
  return pasos;
}

// ─── Formato español ─────────────────────────────────────────────────────────
// `formatNumber` de @/lib usa toLocaleString('es-ES'), que NO agrupa las cifras de cuatro
// dígitos (minimumGroupingDigits = 2 en es-ES): «1000 kcal» junto a «10.000» y «9.000»
// (hallazgo 1739). Aquí se fuerza la agrupación siempre.
const ENTERO = new Intl.NumberFormat('es-ES', { useGrouping: 'always', maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('es-ES', { useGrouping: 'always', maximumFractionDigits: 1 });

/** 1000 → «1.000» · 10000 → «10.000». */
export function formatEntero(n: number): string {
  return ENTERO.format(n);
}

/** 0.1 → «0,1 %» · 10 → «10 %» (con espacio duro, como pide el formato español). */
export function formatPorcentaje(n: number): string {
  return `${DECIMAL.format(n)} %`;
}

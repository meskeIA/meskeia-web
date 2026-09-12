/**
 * Casos de prueba de `check-minimo-irpf.mjs` — NO es una app.
 *
 * Un candado nuevo no vale hasta que se le reinyecta el defecto del que nació y se comprueba
 * que lo caza, y que deja pasar lo que debe pasar. Sin las dos mitades puede estar siempre en
 * verde porque no mira nada.
 *
 * Los seis primeros son código REAL, copiado de las apps y motores tal y como estaban antes
 * de la reparación del 12/09/2026. Los siete últimos son las formas correctas y los falsos
 * positivos que ya se han encontrado: la reducción del art. 84.2, el slug de Delegum y la
 * resta entre cuotas, que es justamente el método bueno.
 *
 * Se ejecuta con:  npm run minimo:probar-candado
 * Debe encontrar los SEIS primeros y ninguno de los siete últimos.
 *
 * Este fichero queda fuera del análisis normal, que solo mira `app/`, `components/`, `lib/`
 * y `data/`.
 */

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  cuotaEscalaGeneral,
  calcularCuotaIntegraGeneral,
} from '@/data/fiscal';

const MINIMO_PERSONAL = MINIMOS_IRPF_2025.personal;

// ─── DEBE CAZAR ───────────────────────────────────────────────────────────────

/** 1. `app/estimador-smi/page.tsx` — la constante canónica, directa. */
export function debeCazar1(baseImponible: number): number {
  const baseLiquidable = Math.max(0, baseImponible - MINIMOS_IRPF_2025.personal);
  return cuotaEscalaGeneral(baseLiquidable);
}

/** 2. `app/visualizador-sueldo-neto/page.tsx` — vía variable local en camelCase. */
export function debeCazar2(baseImponible: number): number {
  const minimoPersonal = MINIMOS_IRPF_2025.personal;
  const baseGravable = Math.max(0, baseImponible - minimoPersonal);
  return cuotaEscalaGeneral(baseGravable);
}

/** 3. `lib/calculadoras/modulosVsDirecta.ts` — constante local en MAYÚSCULAS. */
export function debeCazar3(rendimientoNetoReducido: number): number {
  const baseLiquidable = Math.max(0, rendimientoNetoReducido - MINIMO_PERSONAL);
  return cuotaEscalaGeneral(baseLiquidable);
}

/** 4. `app/estimador-irpf/page.tsx` — el plural, con mínimos familiares. */
export function debeCazar4(baseImponibleGeneral: number, minimosPersonalesFamiliares: number): number {
  const baseLiquidable = Math.max(0, baseImponibleGeneral - minimosPersonalesFamiliares);
  return cuotaEscalaGeneral(baseLiquidable);
}

/** 5. `app/optimizador-rentas-60/page.tsx` — sin el `Math.max` alrededor. */
export function debeCazar5(baseGeneralBruta: number, minimoPorEdad: number): number {
  const baseGeneralLiquidable = baseGeneralBruta - minimoPorEdad;
  return cuotaEscalaGeneral(baseGeneralLiquidable);
}

/** 6. `app/comparador-autonomo-vs-sl/page.tsx` — dentro de la llamada, sin variable. */
export function debeCazar6(rendimientoNeto: number): number {
  return cuotaEscalaGeneral(Math.max(0, rendimientoNeto - MINIMOS_IRPF_2025.personal));
}

// ─── DEBE DEJAR PASAR ─────────────────────────────────────────────────────────

/** 7. El método correcto del art. 63.1.2.º, vía la función canónica. */
export function debePasar1(baseLiquidableGeneral: number, minimo: number): number {
  return calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimo);
}

/** 8. El método correcto escrito a mano: la resta es entre CUOTAS, no contra la base. */
export function debePasar2(base: number, minimo: number): number {
  const cuotaEscala = cuotaEscalaGeneral(base);
  const cuotaMinimo = cuotaEscalaGeneral(Math.min(minimo, base));
  return Math.max(0, cuotaEscala - cuotaMinimo);
}

/** 9. La reducción del art. 84.2: esa SÍ se resta de la base, y el candado no debe tocarla. */
export function debePasar3(baseImponible: number): number {
  const baseLiquidable = Math.max(0, baseImponible - REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental);
  return cuotaEscalaGeneral(baseLiquidable);
}

/** 10. Acotar el mínimo a la base con `Math.min` no es restarlo. */
export function debePasar4(base: number, minimoPersonalFamiliar: number): number {
  const minimoAplicable = Math.min(minimoPersonalFamiliar, base);
  return calcularCuotaIntegraGeneral(base, minimoAplicable);
}

/** 11. El slug de la ficha de Delegum: un guion dentro de una cadena no es un operador. */
export const FICHA_DELEGUM = 'https://delegum.com/datos-fiscales/irpf-tramos-minimos/';

/** 12. El mismo slug en JSX, con comillas dobles. */
export function debePasar5() {
  return <span data-slug="irpf-tramos-minimos">{TRAMOS_IRPF_2025.length}</span>;
}

/** 13. El escape explícito, para el falso positivo que no se puede reescribir. */
export function debePasar6(baseImponible: number, minimoRaro: number): number {
  // minimo-ok: aquí «minimoRaro» es un suelo de facturación, no un mínimo del art. 57 LIRPF
  const base = Math.max(0, baseImponible - minimoRaro);
  return cuotaEscalaGeneral(base);
}

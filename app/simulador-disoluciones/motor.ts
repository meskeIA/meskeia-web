/**
 * Motor de `simulador-disoluciones` — la aritmética de la app, sin React ni DOM.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]), y porque los «Casos para clase»
 * (`./casos.ts`) corrigen con ESTAS funciones: si la corrección y el panel calcularan distinto,
 * la app suspendería una respuesta que ella misma imprime.
 *
 * DE DÓNDE SALE (02/11/2026, skill /casos-aula-meskeia, camino «MOVER a motor.ts»):
 * `calcularPreparacion` y `calcularDilucion` son los cuerpos de los dos `useMemo` de `page.tsx`
 * (`prep` y `dilucion`) trasladados tal cual, con las mismas fórmulas, las mismas guardas y la
 * misma forma de retorno; los `useMemo` ahora las llaman. La lista de solutos se trasladó aquí
 * por la misma razón: un caso que dice «sal común» debe leer la misma masa molar que su botón.
 *
 * Las inversas (masa a pesar, C₂ a partir de V₁…) son nuevas, para los casos: puras y sin
 * `throw`; con un dato imposible devuelven NaN, que se pinta en vez de tumbar el render.
 */

/* ─────────────────────────── Solutos ─────────────────────────── */

export interface Soluto {
  id: string;
  nombre: string;
  formula: string;
  masaMolar: number; // g/mol
  color: [number, number, number]; // RGB base del soluto disuelto
  incoloro: boolean;
}

export const SOLUTOS: Soluto[] = [
  { id: 'kmno4', nombre: 'Permanganato de potasio', formula: 'KMnO₄', masaMolar: 158.03, color: [123, 45, 142], incoloro: false },
  { id: 'cuso4', nombre: 'Sulfato de cobre(II)', formula: 'CuSO₄', masaMolar: 159.61, color: [30, 111, 191], incoloro: false },
  { id: 'k2cr2o7', nombre: 'Dicromato de potasio', formula: 'K₂Cr₂O₇', masaMolar: 294.18, color: [232, 115, 42], incoloro: false },
  { id: 'nicl2', nombre: 'Cloruro de níquel(II)', formula: 'NiCl₂', masaMolar: 129.60, color: [63, 163, 77], incoloro: false },
  { id: 'nacl', nombre: 'Sal común', formula: 'NaCl', masaMolar: 58.44, color: [200, 210, 220], incoloro: true },
  { id: 'glucosa', nombre: 'Glucosa', formula: 'C₆H₁₂O₆', masaMolar: 180.16, color: [205, 200, 190], incoloro: true },
];

export const SOLUTO_PERSONALIZADO: Soluto = {
  id: 'custom',
  nombre: 'Personalizado',
  formula: '—',
  masaMolar: 100,
  color: [46, 134, 171],
  incoloro: false,
};

/** El soluto de la lista con ese id, o undefined. */
export function solutoPorId(id: string): Soluto | undefined {
  return SOLUTOS.find((s) => s.id === id);
}

/* ─────────────────────────── Modo «Preparar» ─────────────────────────── */

export interface ResultadoPreparacion {
  litros: number;
  moles: number;
  molaridad: number;
  gPorLitro: number;
  porcentajeMV: number;
  ppm: number;
}

/**
 * El `useMemo` `prep` de `page.tsx`, tal cual. El volumen es el de DISOLUCIÓN (enrasada), en mL;
 * el % es masa/volumen (g por 100 mL) y las ppm son mg/L.
 */
export function calcularPreparacion(masaG: number, volumenML: number, masaMolar: number): ResultadoPreparacion {
  const litros = volumenML / 1000;
  const moles = masaMolar > 0 ? masaG / masaMolar : 0;
  const molaridad = litros > 0 ? moles / litros : 0;
  const gPorLitro = litros > 0 ? masaG / litros : 0;
  const porcentajeMV = volumenML > 0 ? (masaG / volumenML) * 100 : 0; // % m/v = g por 100 mL
  const ppm = litros > 0 ? (masaG * 1000) / litros : 0; // mg/L
  return { litros, moles, molaridad, gPorLitro, porcentajeMV, ppm };
}

/* ─────────────────────────── Modo «Diluir» ─────────────────────────── */

export interface ResultadoDilucion {
  valido: boolean;
  v1: number;
  disolvente: number;
  factor: number;
}

/**
 * El `useMemo` `dilucion` de `page.tsx`, tal cual: C₁·V₁ = C₂·V₂ con V en mL, y el disolvente
 * a añadir es V₂ − V₁ (volúmenes aditivos).
 */
export function calcularDilucion(c1: number, c2: number, v2ML: number): ResultadoDilucion {
  const valido = c1 > 0 && c2 > 0 && v2ML > 0 && c2 <= c1;
  const v1 = valido ? (c2 * v2ML) / c1 : 0; // mL de madre
  const disolvente = valido ? v2ML - v1 : 0; // mL a añadir
  const factor = c2 > 0 ? c1 / c2 : 0;
  return { valido, v1, disolvente, factor };
}

/* ─────────────────────────── Inversas (para los casos) ─────────────────────────── */

function positivo(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/** Masa a pesar (g) para una molaridad y un volumen de disolución: M · V(L) · masa molar. */
export function masaParaMolaridad(molaridad: number, volumenML: number, masaMolar: number): number {
  if (!positivo(molaridad) || !positivo(volumenML) || !positivo(masaMolar)) return NaN;
  return molaridad * (volumenML / 1000) * masaMolar;
}

/** Molaridad (mol/L) de una disolución de concentración másica conocida: (g/L) / masa molar. */
export function molaridadDesdeGPorLitro(gPorLitro: number, masaMolar: number): number {
  if (!positivo(gPorLitro) || !positivo(masaMolar)) return NaN;
  return gPorLitro / masaMolar;
}

/** Masa de soluto (g) para un % m/v y un volumen de disolución: % · V(mL) / 100. */
export function masaParaPorcentaje(porcentajeMV: number, volumenML: number): number {
  if (!positivo(porcentajeMV) || !positivo(volumenML)) return NaN;
  return (porcentajeMV * volumenML) / 100;
}

/**
 * Concentración final (mol/L) al llevar V₁ mL de una disolución C₁ hasta un volumen final V₂:
 * C₂ = C₁·V₁/V₂. NaN si V₁ > V₂ (diluyendo no se pierde volumen).
 */
export function concentracionDiluida(c1: number, v1ML: number, v2ML: number): number {
  if (!positivo(c1) || !positivo(v1ML) || !positivo(v2ML) || v1ML > v2ML) return NaN;
  return (c1 * v1ML) / v2ML;
}

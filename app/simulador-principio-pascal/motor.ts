/**
 * Motor del simulador del principio de Pascal y la presión hidrostática.
 *
 * Funciones puras, sin React ni dependencias, para probarlas contra casos resueltos a mano
 * (tests/principio-pascal-motor.spec.ts) antes de pintar nada. Tres problemas de la unidad de
 * fluidos en reposo, los mismos que plantea un examen:
 *
 * 1 · PRESIÓN A UNA PROFUNDIDAD (ecuación fundamental de la hidrostática)
 *
 *   P_h   = ρ·g·h                presión que ejerce la columna de líquido (manométrica)
 *   P_abs = P₀ + ρ·g·h           la que soporta de verdad un cuerpo sumergido
 *
 *   Solo depende de la densidad y de la profundidad: ni de la forma del recipiente ni de la
 *   cantidad de líquido (la «paradoja hidrostática»).
 *
 * 2 · PRENSA HIDRÁULICA (principio de Pascal)
 *
 *   La presión aplicada en un punto de un líquido encerrado se transmite íntegra a todo él:
 *   F₁/A₁ = F₂/A₂  →  F₂ = F₁·A₂/A₁
 *   El líquido no se comprime, así que el volumen que baja un émbolo es el que sube el otro:
 *   A₁·x₁ = A₂·x₂  →  x₂ = x₁·A₁/A₂
 *   y el trabajo se conserva: F₁·x₁ = F₂·x₂. La prensa multiplica la fuerza, no la energía.
 *
 * 3 · TUBO EN U CON DOS LÍQUIDOS QUE NO SE MEZCLAN (vasos comunicantes)
 *
 *   A la altura de la superficie de separación las presiones de las dos ramas son iguales:
 *   ρ_A·h_A = ρ_B·h_B  →  h_A = ρ_B·h_B/ρ_A
 *   con B el líquido añadido (menos denso, queda encima) y A el del fondo del tubo, ambas
 *   alturas medidas desde la superficie de separación.
 *
 * Validación: un dato que no sea un número válido devuelve null. La vista dice entonces qué
 * falta, en vez de publicar una cifra inventada.
 */

/** Gravedad estándar en la superficie terrestre (m/s²), la habitual en los problemas de clase. */
export const G = 9.81;

/**
 * Atmósfera estándar (Pa). Valor EXACTO por definición: 1 atm = 101.325 Pa (Conferencia General
 * de Pesas y Medidas, 1954). Es la presión que se toma en la superficie si el enunciado no da otra.
 */
export const P_ATM = 101_325;

/** cm² → m²: 1 m² = 100 cm × 100 cm = 10.000 cm². */
export const CM2_POR_M2 = 10_000;

/** Un número finito y estrictamente positivo (densidad, área, fuerza). */
export function esPositivo(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

/** Un número finito y no negativo (profundidad, desplazamiento: el 0 tiene sentido). */
export function esNoNegativo(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0;
}

// ─── 1 · Presión a una profundidad ───────────────────────────────────────────

export interface ResultadoPresion {
  /** Presión de la columna de líquido, ρ·g·h (Pa). También llamada manométrica. */
  presionHidrostatica: number;
  /** Presión absoluta, P₀ + ρ·g·h (Pa). */
  presionAbsoluta: number;
  /** La absoluta en atmósferas: P_abs / 101.325. */
  presionAbsolutaAtm: number;
  /** Cuántas atmósferas añade el líquido: ρ·g·h / 101.325. */
  presionHidrostaticaAtm: number;
}

/**
 * @param densidad    ρ del líquido en kg/m³
 * @param profundidad h en m, medida desde la superficie libre (0 = en la superficie)
 * @param p0          presión sobre la superficie en Pa (por defecto, 1 atm)
 * @param g           gravedad en m/s²
 */
export function calcularPresion(
  densidad: number,
  profundidad: number,
  p0: number = P_ATM,
  g: number = G,
): ResultadoPresion | null {
  if (!esPositivo(densidad) || !esNoNegativo(profundidad) || !esNoNegativo(p0) || !esPositivo(g)) {
    return null;
  }
  const presionHidrostatica = densidad * g * profundidad;
  const presionAbsoluta = p0 + presionHidrostatica;
  return {
    presionHidrostatica,
    presionAbsoluta,
    presionAbsolutaAtm: presionAbsoluta / P_ATM,
    presionHidrostaticaAtm: presionHidrostatica / P_ATM,
  };
}

/**
 * Profundidad a la que el líquido añade una atmósfera entera: h = P_ATM / (ρ·g).
 * En agua dulce sale 10,33 m, la regla de «una atmósfera más cada diez metros» de los buceadores.
 */
export function profundidadUnaAtmosfera(densidad: number, g: number = G): number | null {
  if (!esPositivo(densidad) || !esPositivo(g)) return null;
  return P_ATM / (densidad * g);
}

// ─── 2 · Prensa hidráulica ───────────────────────────────────────────────────

/** Área de un círculo a partir de su diámetro: A = π·d²/4 (en las unidades del diámetro al cuadrado). */
export function areaCirculo(diametro: number): number | null {
  if (!esPositivo(diametro)) return null;
  return (Math.PI * diametro * diametro) / 4;
}

export interface ResultadoPrensa {
  /** Presión que transmite el líquido, F₁/A₁ (Pa). La misma en los dos émbolos. */
  presion: number;
  /** Fuerza en el émbolo grande, F₂ = F₁·A₂/A₁ (N). */
  fuerzaSalida: number;
  /** Factor de multiplicación de la fuerza, A₂/A₁. Menor que 1 si el émbolo «grande» es el pequeño. */
  ventaja: number;
  /** Masa que sostiene el émbolo 2: F₂/g (kg). */
  masaSostenida: number;
  /** Lo que sube el émbolo 2 cuando el 1 baja x₁: x₂ = x₁·A₁/A₂ (m). */
  desplazamientoSalida: number;
  /** Trabajo de entrada F₁·x₁ (J). */
  trabajoEntrada: number;
  /** Trabajo de salida F₂·x₂ (J). Igual al de entrada: la prensa no crea energía. */
  trabajoSalida: number;
}

/**
 * @param fuerzaEntrada  F₁ en N
 * @param area1          A₁ en m²
 * @param area2          A₂ en m²
 * @param desplazamiento x₁ en m (cuánto baja el émbolo 1; 0 es válido)
 * @param g              gravedad en m/s²
 */
export function calcularPrensa(
  fuerzaEntrada: number,
  area1: number,
  area2: number,
  desplazamiento: number,
  g: number = G,
): ResultadoPrensa | null {
  if (
    !esPositivo(fuerzaEntrada) ||
    !esPositivo(area1) ||
    !esPositivo(area2) ||
    !esNoNegativo(desplazamiento) ||
    !esPositivo(g)
  ) {
    return null;
  }
  const ventaja = area2 / area1;
  const fuerzaSalida = fuerzaEntrada * ventaja;
  const desplazamientoSalida = desplazamiento / ventaja;
  return {
    presion: fuerzaEntrada / area1,
    fuerzaSalida,
    ventaja,
    masaSostenida: fuerzaSalida / g,
    desplazamientoSalida,
    trabajoEntrada: fuerzaEntrada * desplazamiento,
    trabajoSalida: fuerzaSalida * desplazamientoSalida,
  };
}

// ─── 3 · Tubo en U con dos líquidos ──────────────────────────────────────────

/**
 * Dos densidades se consideran iguales dentro de esta banda relativa: con el mismo líquido en
 * las dos ramas no hay superficie de separación y el desnivel es nulo.
 */
const TOLERANCIA_IGUALES = 1e-9;

export type CasoTuboU = 'equilibrio' | 'mismo-liquido' | 'anadido-mas-denso';

/**
 * ¿Se puede plantear el tubo en U como «B encima de A en una rama»?
 *  - 'equilibrio':        B es menos denso que A, queda encima y se aplica ρ_A·h_A = ρ_B·h_B.
 *  - 'mismo-liquido':     no hay dos líquidos: las superficies quedan a la misma altura.
 *  - 'anadido-mas-denso': B bajaría al fondo del tubo y desplazaría a A; el problema es el
 *                         mismo con los papeles cambiados, pero no el que se ha planteado.
 */
export function casoTuboU(densidadFondo: number, densidadAnadido: number): CasoTuboU {
  const diferencia = densidadAnadido - densidadFondo;
  if (Math.abs(diferencia) <= TOLERANCIA_IGUALES * Math.max(densidadFondo, densidadAnadido)) {
    return 'mismo-liquido';
  }
  return diferencia < 0 ? 'equilibrio' : 'anadido-mas-denso';
}

export interface ResultadoTuboU {
  /**
   * Altura del líquido del fondo (A) en la otra rama, medida desde la superficie de
   * separación: h_A = ρ_B·h_B/ρ_A (en las mismas unidades que h_B).
   */
  alturaFondo: number;
  /** Desnivel entre las dos superficies libres: h_B − h_A. Siempre positivo en equilibrio. */
  desnivel: number;
  /** Presión de cada columna a la altura de la separación, ρ·g·h (Pa), con h en m. Iguales. */
  presionSeparacion: number;
}

/**
 * Solo resuelve el caso 'equilibrio' (B menos denso que A); en los otros dos devuelve null y
 * la vista explica por qué con `casoTuboU`.
 *
 * @param densidadFondo   ρ_A en kg/m³ (el líquido que llena el fondo del tubo)
 * @param densidadAnadido ρ_B en kg/m³ (el que se vierte en una rama)
 * @param alturaAnadido   h_B en m, desde la superficie de separación hasta su superficie libre
 * @param g               gravedad en m/s²
 */
export function calcularTuboU(
  densidadFondo: number,
  densidadAnadido: number,
  alturaAnadido: number,
  g: number = G,
): ResultadoTuboU | null {
  if (!esPositivo(densidadFondo) || !esPositivo(densidadAnadido) || !esPositivo(alturaAnadido) || !esPositivo(g)) {
    return null;
  }
  if (casoTuboU(densidadFondo, densidadAnadido) !== 'equilibrio') return null;
  const alturaFondo = (densidadAnadido * alturaAnadido) / densidadFondo;
  return {
    alturaFondo,
    desnivel: alturaAnadido - alturaFondo,
    presionSeparacion: densidadAnadido * g * alturaAnadido,
  };
}

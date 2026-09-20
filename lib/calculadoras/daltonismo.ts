// Simulación de deficiencias de visión del color — lógica pura
//
// Modelo: Machado, G. M., Oliveira, M. M. & Fernandes, L. A. F. (2009),
// «A Physiologically-based Model for Simulation of Color Vision Deficiency»,
// IEEE Transactions on Visualization and Computer Graphics 15(6), 1291-1298.
// Matrices tomadas de la Tabla 1 publicada por los autores en
// https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
// Verificado: 2026-09-20.
//
// ── Por qué este módulo existe (Inspector, 20/09/2026) ──────────────────────────
// `simulador-daltonismo` y `simulador-baja-vision` llevaban las MISMAS matrices
// duplicadas literalmente —una en canvas, la otra en <feColorMatrix>— y las aplicaban en
// espacios de color distintos, así que pintaban colores distintos para la misma condición:
// #DC2626 en protanopia daba rgb(141,140,38) en una y rgb(172,171,38) en la otra. Y ninguna
// de las dos usaba las matrices que `simulador-daltonismo` decía usar en nueve sitios.
//
// Aquellas matrices eran el juego HCIRN/Wickline que circula copiado en los filtros SVG de
// accesibilidad web. Su defecto no es de precisión sino de MODELO: son invertibles
// (determinante 0,0068 en protanopia y −0,0525 en deuteranopia), y una transformación
// invertible no funde nunca dos colores en uno, de modo que una app que las use no puede
// enseñar JAMÁS una confusión cromática — que es literalmente para lo que sirve.
//
// ⚠️ La tritanopia de Machado NO es singular (determinante 0,236), y no es un error de
// transcripción: el modelo se ajusta peor a la tritanopia, que es la deficiencia más rara y
// con menos datos experimentales. Los propios autores la presentan como la menos fiable de
// las tres. Por eso `puedeFundirColores` la declara `false`: quien la use no debe prometer
// que dos colores confundibles saldrán idénticos.

/** Las ocho vistas que ofrecen las apps. `normal` es la identidad: devuelve el original. */
export type TipoCVD =
  | 'normal'
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia';

export type Matriz3x3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/**
 * Coeficientes de luminancia relativa Rec.709 / sRGB.
 *
 * Son los que corresponden a luz LINEAL, que es donde opera este módulo. Los 0,299 / 0,587 /
 * 0,114 que suelen verse son luma Rec.601, definida sobre señal CON GAMMA: aplicarlos a luz
 * lineal no da ninguno de los dos grises, y aclara sistemáticamente los colores saturados
 * (el rojo puro salía casi al doble de claro).
 */
export const LUMINANCIA_REC709 = [0.2126, 0.7152, 0.0722] as const;

/**
 * Severidad con la que se simulan las formas ANÓMALAS (tricromacias anómalas).
 *
 * Machado tabula de 0,0 a 1,0 en pasos de 0,1; 1,0 es la dicromacia. 0,6 es una anomalía
 * moderada, que es lo que estas apps quieren enseñar: si se usara 1,0 la «protanomalía»
 * sería indistinguible de la protanopia y la distinción que ofrece la interfaz sería falsa.
 */
export const SEVERIDAD_ANOMALIA = 0.6;

/**
 * Tabla 1 de Machado et al. (2009). Severidad 1,0 para las dicromacias y 0,6 para las
 * anomalías. Cada fila suma 1, que es lo que conserva el blanco.
 */
export const MATRICES_CVD: Record<TipoCVD, Matriz3x3> = {
  normal: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  // Severidad 1,0 — dicromacias
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
  // Severidad 0,6 — tricromacias anómalas
  protanomaly: [
    [0.38545, 0.769005, -0.154455],
    [0.100526, 0.829802, 0.069673],
    [-0.007442, -0.02219, 1.029632],
  ],
  deuteranomaly: [
    [0.498864, 0.674741, -0.173604],
    [0.205199, 0.754872, 0.039929],
    [-0.011131, 0.030969, 0.980162],
  ],
  tritanomaly: [
    [1.104996, -0.046633, -0.058363],
    [-0.032137, 0.971635, 0.060503],
    [0.001336, 0.317922, 0.680742],
  ],
  // La acromatopsia no es de Machado: es luminancia relativa, igual en los tres canales.
  achromatopsia: [
    [...LUMINANCIA_REC709],
    [...LUMINANCIA_REC709],
    [...LUMINANCIA_REC709],
  ] as unknown as Matriz3x3,
};

/**
 * ¿Puede esta simulación fundir dos colores distintos en el mismo? Solo si la matriz colapsa
 * el espacio, es decir, si es singular. Vale para las dos dicromacias bien ajustadas y para
 * la acromatopsia (que lo lleva al extremo, de 3 dimensiones a 1).
 */
export const puedeFundirColores = (tipo: TipoCVD): boolean =>
  tipo === 'protanopia' || tipo === 'deuteranopia' || tipo === 'achromatopsia';

/** Un canal sRGB de 0-255 a luz lineal de 0-1. */
export function srgbALineal(canal255: number): number {
  const s = canal255 / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luz lineal de 0-1 de vuelta a un canal sRGB de 0-255, acotado y redondeado. */
export function linealASrgb(lineal: number): number {
  const s = lineal <= 0.0031308 ? lineal * 12.92 : 1.055 * Math.pow(lineal, 1 / 2.4) - 0.055;
  const v = Math.round(s * 255);
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/**
 * Simula cómo percibe un color quien tiene esa deficiencia.
 *
 * ⚠️ La matriz se multiplica contra RGB **LINEAL**, no contra los 0-255 de sRGB: el modelo de
 * Machado está definido sobre luz, no sobre señal con gamma. Multiplicar directamente los
 * valores de 8 bits da colores plausibles y equivocados.
 *
 * @param rgb canal a canal, 0-255
 * @returns el color percibido, 0-255
 */
export function simularColor(
  rgb: readonly [number, number, number],
  tipo: TipoCVD,
): [number, number, number] {
  if (tipo === 'normal') return [rgb[0], rgb[1], rgb[2]];

  const m = MATRICES_CVD[tipo];
  const [r, g, b] = [srgbALineal(rgb[0]), srgbALineal(rgb[1]), srgbALineal(rgb[2])];

  return [
    linealASrgb(m[0][0] * r + m[0][1] * g + m[0][2] * b),
    linealASrgb(m[1][0] * r + m[1][1] * g + m[1][2] * b),
    linealASrgb(m[2][0] * r + m[2][1] * g + m[2][2] * b),
  ];
}

/**
 * La misma matriz, escrita para el atributo `values` de un `<feColorMatrix type="matrix">`
 * (4 filas de 5: las columnas de alfa y el desplazamiento van a cero, salvo el alfa, que pasa).
 *
 * ⚠️ El filtro que la use **no debe declarar `color-interpolation-filters="sRGB"`**: la
 * especificación SVG usa linearRGB por defecto, y eso es justo lo que Machado necesita.
 */
export function matrizParaFeColorMatrix(tipo: TipoCVD): string {
  const m = MATRICES_CVD[tipo];
  return m.map((fila) => `${fila.join(' ')} 0 0`).join('  ') + '  0 0 0 1 0';
}

/** Metadatos de la fuente, para que las apps citen lo mismo y no cada una lo suyo. */
export const CVD_META = {
  modelo: 'Machado, Oliveira & Fernandes (2009)',
  publicacion: 'IEEE Transactions on Visualization and Computer Graphics 15(6), 1291-1298',
  urlOficial: 'https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html',
  verificado: '2026-09-20',
  severidadAnomalia: SEVERIDAD_ANOMALIA,
} as const;

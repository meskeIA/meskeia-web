/**
 * Color de una longitud de onda: el que se pinta y el nombre que se le da.
 *
 * Vive aparte de `page.tsx` porque lo leen DOS apps: este simulador y `simulador-modelo-bohr`,
 * que colorea las líneas del espectro del hidrógeno. Una sola tabla de nombres evita que la
 * misma línea de 486 nm se llame «azul» en una app y «verde» en la otra.
 */

import { VISIBLE_MIN_NM, VISIBLE_MAX_NM, regionEspectro } from './motor';

/** Fuera del visible no hay color: se pinta un tono apagado y se rotula la región. */
export const COLOR_UV = '#a99bd1';
export const COLOR_IR = '#8c3b3b';

/**
 * Color aproximado de una longitud de onda visible (algoritmo de Dan Bruton, 1996), con la
 * caída de brillo en los extremos donde el ojo apenas ve. Es una aproximación para pintar:
 * una pantalla RGB no reproduce los colores espectrales puros.
 */
export function colorDeLambda(lambdaNm: number): string {
  if (lambdaNm < VISIBLE_MIN_NM) return COLOR_UV;
  if (lambdaNm > VISIBLE_MAX_NM) return COLOR_IR;
  let r = 0;
  let g = 0;
  let b = 0;
  const w = lambdaNm;
  if (w < 440) {
    r = -(w - 440) / (440 - 380);
    b = 1;
  } else if (w < 490) {
    g = (w - 440) / (490 - 440);
    b = 1;
  } else if (w < 510) {
    g = 1;
    b = -(w - 510) / (510 - 490);
  } else if (w < 580) {
    r = (w - 510) / (580 - 510);
    g = 1;
  } else if (w < 645) {
    r = 1;
    g = -(w - 645) / (645 - 580);
  } else {
    r = 1;
  }
  let brillo = 1;
  if (w < 420) brillo = 0.3 + (0.7 * (w - 380)) / (420 - 380);
  else if (w > 700) brillo = 0.3 + (0.7 * (750 - w)) / (750 - 700);
  const canal = (x: number) => Math.round(255 * Math.pow(x * brillo, 0.8));
  return `rgb(${canal(r)}, ${canal(g)}, ${canal(b)})`;
}

/** Nombre del color para el visible; fuera, el de la región. */
export function nombreDeLambda(lambdaNm: number): string {
  const region = regionEspectro(lambdaNm);
  if (region === 'ultravioleta') return 'ultravioleta (invisible)';
  if (region === 'infrarrojo') return 'infrarrojo (invisible)';
  if (lambdaNm < 450) return 'violeta';
  if (lambdaNm < 495) return 'azul';
  if (lambdaNm < 570) return 'verde';
  if (lambdaNm < 590) return 'amarillo';
  if (lambdaNm < 620) return 'naranja';
  return 'rojo';
}

import type { Locator } from '@playwright/test';

/**
 * Contraste WCAG del texto de un elemento contra el fondo que se VE.
 *
 * Compone las capas semitransparentes de los ancestros sobre la primera opaca (y, si no hay
 * ninguna, sobre blanco), y el color del texto con su alfa sobre ese fondo. Es lo que hace falta
 * para medir un texto sobre un tinte: los tintes de marca en oscuro son casi siempre rgba.
 *
 * Origen: cabo C0120. El helper `contraste()` de tests/apps/calculadora-potencia-ciclismo.spec.ts
 * buscaba el primer fondo OPACO y se saltaba las capas semitransparentes: no veía los tintes de
 * `.vamGrid` ni de `.warningBox` en oscuro, y el test del hallazgo 2496 aprobó «Errores
 * frecuentes» con un 4,42:1 real (hallazgo 2742, 03/10/2026). La versión compuesta se contrastó
 * por píxel ese día: rgb(45, 54, 57) y rgb(69, 57, 49), los mismos fondos que da esta suma.
 * Subida aquí el 16/10/2026 para que los specs nuevos no copien una de las 93 versiones caseras;
 * las copias se migran cuando su app pase por el Inspector, no en bloque (un helper que compone
 * puede poner en rojo specs que hoy aprueban de más, y eso es justo lo que se quiere ver).
 *
 * Lo que NO ve: imágenes y degradados de fondo (`background-image`), filtros, ni un texto que
 * desborda su caja sobre otra cosa. Para eso, medir por píxel.
 */
export async function contrasteSobreFondoReal(elemento: Locator): Promise<number> {
  return elemento.evaluate((el) => {
    const rgba = (s: string): number[] => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const t = rgba(getComputedStyle(el).color);
    const texto = [0, 1, 2].map((i) => t[i] * t[3] + fondo[i] * (1 - t[3]));
    const a = lum(texto);
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

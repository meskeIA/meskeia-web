import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from './_contraste';

/**
 * Texto pintado en un <canvas>, medido por píxel en los dos temas — cabo C0297 (06/11/2026).
 *
 * Los candados de contraste (check:contraste-marca, check:semanticos-claro, check:token-oscuro)
 * leen CSS: un lienzo pinta con `ctx.fillStyle = '#48A9A6'` y ninguno lo ve. C0297 contó 30
 * ficheros con texto en canvas y la marca en el TSX; aquí se mide lo que se VE.
 *
 * Cómo mide: intercepta `fillText` y, ANTES de pintar, lee con getImageData los píxeles del
 * recuadro del texto en el lienzo. El fondo es el color más frecuente de ese recuadro (una línea
 * de la cuadrícula que lo cruce no lo cambia); si el lienzo es transparente ahí, se compone sobre
 * el primer fondo opaco de sus ancestros. El color del texto se compone con su alfa y el
 * globalAlpha. Umbral WCAG: 4,5:1, o 3:1 si el texto se ve de 24 px o de 18,66 px en negrita
 * (tamaño en CSS: la fuente por la escala del lienzo).
 *
 * Lo que NO mide: el texto que solo aparece al interactuar (se lee al cargar), un fillStyle que
 * es un degradado o un patrón, y el fondo semitransparente de un ancestro (toma el primero opaco).
 */

interface Lectura {
  t: string;
  color: string;
  fondo: string;
  ratio: number;
  umbral: number;
}

interface AppLienzo {
  slug: string;
  /** Qué estado se mide, si no es el de la carga */
  estado?: string;
  /** Lo que hay que hacer para que el lienzo pinte ese estado */
  preparar?: (page: Page) => Promise<void>;
}

/**
 * Las apps REPARADAS, con su caso de origen. El censo del 06/11/2026 (36 apps con fillText, al
 * cargar) dio además 17 sin defecto y otras con él aún sin reparar: lista en el cabo C0297.
 */
const APPS: readonly AppLienzo[] = [
  // NAIRU, CP₀/CP₁ y la curva LP en la marca (2,68-3,93:1 en claro), títulos de ejes en '#999'
  // y '#555' (2,73 y 2,33:1), «Objetivo 2%» 4,29 y los rótulos de zona con alfa (2,7-3,7)
  { slug: 'simulador-curva-phillips' },
  // Blanco sobre las celdas TN azul claro (2,26:1), FP naranja y TP teal; en el árbol, las
  // etiquetas de las ramas en el color de la rama y la leyenda en '#999'
  { slug: 'simulador-teorema-bayes' },
  {
    slug: 'simulador-teorema-bayes',
    estado: 'diagrama de árbol',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Diagrama de árbol/ }).click();
    },
  },
  // «D» en la marca (3,93:1 en claro, 3,50 en oscuro), «O» y Qo en naranja (2,89) y
  // P_max/P_min en rojo (3,9 y 3,5)
  { slug: 'simulador-oferta-demanda' },
  {
    slug: 'simulador-oferta-demanda',
    estado: 'precio máximo',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Precio máximo/ }).click();
    },
  },
  // La «m» en blanco sobre el bloque en la marca (4,11:1) y «x=…m» en naranja (2,88 en claro;
  // el primer arreglo, un naranja oscuro fijo, daba 2,93 sobre el lienzo oscuro)
  { slug: 'simulador-mas-resorte' },
  // T₁ en la marca (3,93:1 en claro, 4,24 en oscuro), T₂ en naranja (2,89) y la Ea en
  // granate en oscuro (2,70), en los dos lienzos
  { slug: 'simulador-cinetica-arrhenius' },
  // μ₀ y H₀ en la marca (3,93:1 en claro, 4,24 en oscuro), μ₁ y H₁ en naranja (2,89) y X̄ en
  // violeta en oscuro (3,05)
  { slug: 'simulador-test-hipotesis' },
  // Cabeceras CLIENTE y SERVIDOR en blanco sobre la marca (4,11 y 2,80:1); etiquetas de las
  // flechas FIN y ACK y de las bandas de estado en su color (2,4-3,9:1)
  {
    slug: 'simulador-tcp-handshake',
    estado: 'los 7 pasos de apertura y cierre',
    preparar: async (page) => {
      await page.getByRole('button', { name: 'Apertura + Cierre' }).click();
      const siguiente = page.getByRole('button', { name: 'Siguiente paso' });
      for (let i = 0; i < 7; i++) {
        await siguiente.click();
        await page.waitForTimeout(1500);
      }
      await expect(siguiente).toBeDisabled();
    },
  },
];

async function espiarLienzos(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __lienzoTextos: Lectura[] };
    w.__lienzoTextos = [];
    const lin = (c: number): number => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: number[]): number => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const leer = (s: string): number[] | null => {
      if (/^#[0-9a-f]{6}$/i.test(s)) {
        return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1];
      }
      const m = s.match(/^rgba?\(([^)]+)\)$/);
      if (!m) return null;
      const p = m[1].split(',').map((v) => Number(v.trim()));
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    const sobre = (arriba: number[], alfa: number, abajo: number[]): number[] =>
      [0, 1, 2].map((i) => Math.round(arriba[i] * alfa + abajo[i] * (1 - alfa)));
    const fondoDe = (el: Element | null): number[] => {
      for (let e = el; e; e = e.parentElement) {
        const c = leer(getComputedStyle(e).backgroundColor.replace(/\s+/g, ' '));
        if (c && c[3] === 1) return c.slice(0, 3);
      }
      return [255, 255, 255];
    };
    const P = CanvasRenderingContext2D.prototype;
    const original = P.fillText;
    P.fillText = function (this: CanvasRenderingContext2D, t: string, x: number, y: number, max?: number) {
      try {
        const texto = String(t).trim();
        const color = leer(String(this.fillStyle));
        if (texto && color) {
          const met = this.measureText(String(t));
          const m = this.getTransform();
          const esquinas = [
            [x - met.actualBoundingBoxLeft, y - met.actualBoundingBoxAscent],
            [x + met.actualBoundingBoxRight, y - met.actualBoundingBoxAscent],
            [x - met.actualBoundingBoxLeft, y + met.actualBoundingBoxDescent],
            [x + met.actualBoundingBoxRight, y + met.actualBoundingBoxDescent],
          ].map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
          const lienzo = this.canvas;
          const x0 = Math.max(0, Math.floor(Math.min(...esquinas.map((p) => p[0]))));
          const x1 = Math.min(lienzo.width, Math.ceil(Math.max(...esquinas.map((p) => p[0]))));
          const y0 = Math.max(0, Math.floor(Math.min(...esquinas.map((p) => p[1]))));
          const y1 = Math.min(lienzo.height, Math.ceil(Math.max(...esquinas.map((p) => p[1]))));
          if (x1 > x0 && y1 > y0) {
            const datos = this.getImageData(x0, y0, x1 - x0, y1 - y0).data;
            const cuenta = new Map<string, number>();
            for (let i = 0; i < datos.length; i += 4) {
              const k = `${datos[i]},${datos[i + 1]},${datos[i + 2]},${datos[i + 3]}`;
              cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
            }
            const moda = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
            const fondo = sobre(moda, moda[3] / 255, fondoDe(lienzo));
            const tinta = sobre(color, color[3] * this.globalAlpha, fondo);
            const [l1, l2] = [lum(tinta), lum(fondo)].sort((a, b) => b - a);
            const ratio = (l1 + 0.05) / (l2 + 0.05);
            const tam = Number((this.font.match(/([\d.]+)px/) ?? [])[1] ?? 10);
            const escala = Math.hypot(m.a, m.b) * (lienzo.clientWidth / lienzo.width || 1);
            const visto = tam * escala;
            const negrita = /bold|[6-9]00/.test(this.font);
            const grande = visto >= 24 || (negrita && visto >= 18.66);
            w.__lienzoTextos.push({
              t: texto,
              color: `rgb(${tinta.join(',')})`,
              fondo: `rgb(${fondo.join(',')})`,
              ratio: Math.round(ratio * 100) / 100,
              umbral: grande ? 3 : 4.5,
            });
          }
        }
      } catch {
        // un lienzo contaminado (imagen de otro origen) no se puede leer: no se mide
      }
      return max === undefined ? original.call(this, t, x, y) : original.call(this, t, x, y, max);
    };
  });
}

/** Lo que no llega a su umbral, una vez por texto y color (el peor de sus dibujos). */
async function suspensos(page: Page): Promise<Lectura[]> {
  const lecturas = await page.evaluate(() => (window as unknown as { __lienzoTextos: Lectura[] }).__lienzoTextos);
  const peor = new Map<string, Lectura>();
  for (const l of lecturas) {
    const k = `${l.t}|${l.color}`;
    const previa = peor.get(k);
    if (!previa || l.ratio < previa.ratio) peor.set(k, l);
  }
  return [...peor.values()].filter((l) => l.ratio < l.umbral);
}

async function vaciar(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __lienzoTextos: Lectura[] }).__lienzoTextos = [];
  });
}

async function medidos(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __lienzoTextos: Lectura[] }).__lienzoTextos.length);
}

for (const { slug, estado, preparar } of APPS) {
  test(`${slug}${estado ? ` (${estado})` : ''}: el texto de sus lienzos se lee en claro y en oscuro (C0297)`, async ({ page }) => {
    test.setTimeout(60_000);
    await espiarLienzos(page);
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await page.waitForTimeout(1000);
    // Lo pintado mientras se prepara cuenta también: cada fotograma de la animación es texto
    // que se ve (y lo de la carga ya lo mide la entrada sin `preparar`, que es más corta)
    if (preparar) await preparar(page);
    await page.waitForTimeout(1500);
    // Sin lecturas no hay medida: el control de que el espía ve el lienzo
    expect(await medidos(page), 'textos pintados en claro').toBeGreaterThan(0);
    const claro = await suspensos(page);
    await vaciar(page);
    await activarTemaOscuro(page);
    await page.waitForTimeout(1500);
    expect(await medidos(page), 'textos pintados en oscuro (¿redibuja al cambiar de tema?)').toBeGreaterThan(0);
    const oscuro = await suspensos(page);
    const describir = (l: Lectura): string => `«${l.t}» ${l.color} sobre ${l.fondo}: ${l.ratio}:1 (pide ${l.umbral})`;
    expect.soft(claro.map(describir), 'claro').toEqual([]);
    expect.soft(oscuro.map(describir), 'oscuro').toEqual([]);
  });
}

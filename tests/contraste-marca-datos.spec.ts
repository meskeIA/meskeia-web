import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, MARCA, prepararParaMedir } from './_contraste';

/**
 * El color que llega por DATOS — cabo C0645 (06/11/2026).
 *
 * `style={{ color: x.color }}` o `style={{ background: item.color }}` con el color en un array
 * del mismo fichero: check:contraste-marca no lo ve (el literal no está en el style) y su
 * ampliación encendía 251 literales en 92 apps sin distinguir cuál llega a un texto. Aquí se mide
 * lo que se VE, por píxel y en los dos temas, recorriendo las secciones de la app: cada texto
 * pintado en un color de la marca (acento incluido) y cada texto BLANCO, contra su fondo compuesto.
 *
 * Lo que NO mide: texto de otros colores de datos (el amarillo de una base nitrogenada), salvo en
 * las filas con `todo`, el texto de un SVG o de un lienzo (tests/contraste-lienzo.spec.ts) ni un
 * fondo con degradado.
 */

interface App {
  slug: string;
  /** Botones que cambian de sección; sin él, solo la carga */
  secciones?: string;
  /**
   * Mide TODO el texto, de cualquier color, contra su fondo compuesto (y se salta el que tiene un
   * degradado o una imagen detrás, que no se compone). Para las apps que pintan como texto
   * colores de datos que no son la marca (/reparar 07/11/2026).
   */
  todo?: boolean;
}

const APPS: App[] = [
  // Estado del reactor en la marca que elige el factor k (4,11:1 en claro, 3,35 en oscuro),
  // blanco sobre la marca y sobre la paleta INES (2,03-3,91), «Baja actividad» en el teal (2,67)
  // y «U-235» sobre el tinte del núcleo en oscuro (4,32)
  { slug: 'visualizador-energia-nuclear', secciones: 'nav[aria-label*="ecciones"] button' },
  // El nombre de la vía ganadora del veredicto en el color de su barra: «Préstamo bancario» en la
  // marca (4,11:1 en claro, 3,50 en oscuro) y «Ampliación de capital» en #C0392B (2,64 en oscuro)
  { slug: 'simulador-financiacion-empresarial', todo: true },
  // El nombre, la fórmula y la «sorpresa» de cada fuerza en su color de datos: 2,54-4,11:1 en
  // claro (tensión superficial, gravedad, fricción, presión) y 3,07-4,40 en oscuro (inercia,
  // gravedad, tensión). Las cinco fuerzas del acordeón, abiertas una a una
  { slug: 'visualizador-fuerzas-invisibles', todo: true, secciones: "button[class*='fuerzaCabecera']" },
  // Reservorios, balance, destinos y potencial de cada solución en su color de datos (2,19-4,20:1
  // en claro, 2,39-3,96 en oscuro), el «Punto crítico» en #C0392B (2,88 en oscuro) y las
  // «Limitaciones» en --text-muted sobre su velo oscuro (4,40). Las cuatro pestañas
  { slug: 'visualizador-ciclo-carbono-completo', todo: true, secciones: "[role='tab']" },
  // Blanco sobre el color del estado activo (2,0-4,0:1), cabeceras de la tabla, nombres de las
  // transiciones, estado del agua y cifras de la escala en su color de datos (1,08-4,35:1 en los
  // dos temas). Las cuatro secciones
  { slug: 'visualizador-estados-materia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
];

async function suspensos(page: Page, todo = false): Promise<string[]> {
  return page.evaluate(({ marca, todo }) => {
    const lz = document.createElement('canvas');
    lz.width = lz.height = 1;
    const ctx = lz.getContext('2d', { willReadFrequently: true })!;
    const norm = (css: string): number[] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const can = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const M = marca.map(norm);
    const deMarca = (p: number[]) => M.some((m) => Math.abs(m[0] - p[0]) + Math.abs(m[1] - p[1]) + Math.abs(m[2] - p[2]) < 24);
    const fondo = (el: Element): number[] | null => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        if (todo && getComputedStyle(e).backgroundImage !== 'none') return null;
        const c = norm(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      let b = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => capas[i][k] * capas[i][3] + b[k] * (1 - capas[i][3]));
      return b;
    };
    const fuera: string[] = [];
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (el.closest('nextjs-portal, canvas, svg')) continue;
      if (!Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const fg = norm(cs.color);
      const blanco = fg[0] > 249 && fg[1] > 249 && fg[2] > 249;
      if (fg[3] < 1 || !(todo || deMarca(fg) || blanco)) continue;
      if (todo && el.closest('[aria-hidden="true"], input, textarea, select, [disabled]')) continue;
      const px = parseFloat(cs.fontSize);
      const umbral = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
      const f = fondo(el);
      if (!f) continue;
      const v = ratio(fg, f);
      if (v < umbral) fuera.push(`«${(el.textContent ?? '').trim().slice(0, 40)}» rgb(${fg.slice(0, 3)}) sobre rgb(${f.map(Math.round)}): ${v.toFixed(2)}:1`);
    }
    return Array.from(new Set(fuera));
  }, { marca: MARCA, todo });
}

async function recorrer(page: Page, secciones?: string, todoElTexto = false): Promise<string[]> {
  const todo: string[] = [];
  const botones = secciones ? page.locator(secciones) : null;
  const n = botones ? await botones.count() : 0;
  if (!n) {
    await desplegarTodo(page);
    return suspensos(page, todoElTexto);
  }
  await desplegarTodo(page);
  for (let i = 0; i < n; i++) {
    const boton = botones!.nth(i);
    // Un acordeón (aria-expanded) se abre sección a sección sin volver a desplegarlo todo, que
    // cerraría la que se mide; un botón de sección sin aria-expanded, como antes
    if ((await boton.getAttribute('aria-expanded')) !== 'true') await boton.click();
    if ((await boton.getAttribute('aria-expanded')) === null) await desplegarTodo(page);
    else await expect(boton).toHaveAttribute('aria-expanded', 'true');
    todo.push(...(await suspensos(page, todoElTexto)).map((s) => `sección ${i + 1}: ${s}`));
  }
  return todo;
}

for (const { slug, secciones, todo } of APPS) {
  test(`${slug}: el texto de marca y el blanco sobre colores de datos se leen en claro y en oscuro (C0645)`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    if (secciones) await expect(page.locator(secciones).first()).toBeVisible();
    expect.soft(await recorrer(page, secciones, todo), 'claro').toEqual([]);
    await activarTemaOscuro(page);
    expect.soft(await recorrer(page, secciones, todo), 'oscuro').toEqual([]);
  });
}

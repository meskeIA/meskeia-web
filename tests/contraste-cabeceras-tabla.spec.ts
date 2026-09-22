/**
 * Contraste de las CABECERAS DE TABLA sobre fondo de marca, medido en navegador.
 *
 * Acompaña al drenaje del 22/09/2026, que cambió `var(--primary)` / `var(--secondary)`
 * por `var(--primary-boton)` / `var(--secondary-boton)` en los 683 bloques de `<th>` del
 * catálogo que ponían texto blanco sobre un fondo de marca. El candado
 * `npm run check:contraste-cabeceras` lo comprueba por la FORMA del código; esto lo
 * comprueba por el PÍXEL, que es lo que ve quien usa la app.
 *
 * Mide las cuatro formas distintas que tenía el pasivo, una app por forma:
 *   · fondo sólido                          → calculadora-profundidad-campo
 *   · gradiente de marca                    → estimador-deuda
 *   · fondo en `thead tr`, color en el `th`  → visualizador-topologia
 *   · override dark que reponía --primary   → adaptacion-hogar
 *
 * Las dos trampas de medir esto con navegador (21/08/2026) están cubiertas:
 *   1. `<nextjs-portal>` (Dev Tools) existe en `next dev` y no en producción; se oculta.
 *   2. Las transiciones CSS hacen leer colores intermedios que nadie ve; se desactivan,
 *      y además se espera a que la medida deje de moverse.
 */
import { test, expect, type Page } from '@playwright/test';

/** Apps tocadas por el drenaje, una por cada forma que tenía el pasivo. */
const APPS = [
  { slug: 'calculadora-profundidad-campo', forma: 'fondo sólido var(--primary)' },
  { slug: 'estimador-deuda', forma: 'gradiente de marca' },
  { slug: 'visualizador-topologia', forma: 'fondo en `thead tr`, color en el `th`' },
  { slug: 'adaptacion-hogar', forma: 'override dark que reponía var(--primary)' },
] as const;

/** Umbral AA para texto pequeño. Un `<th>` es negrita a ~14-16px: no llega a "texto grande". */
const UMBRAL = 4.5;

/**
 * Deja la página lista para medir color: sin overlay de Next y sin transiciones.
 * Ver trampas 1 y 2 de la cabecera.
 */
async function prepararParaMedir(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal { display: none !important; }
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  });
}

/** Abre todo lo colapsado: las tablas comparativas viven dentro de <EducationalSection>. */
async function desplegarTodo(page: Page): Promise<void> {
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    const cerrados = page.locator('[aria-expanded="false"]');
    const n = await cerrados.count();
    if (n === 0) break;
    for (let i = 0; i < n; i++) {
      const b = cerrados.nth(i);
      if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
    }
  }
  for (const d of await page.locator('details:not([open])').all()) {
    await d.evaluate((el) => el.setAttribute('open', '')).catch(() => {});
  }
}

/**
 * Pone la página en oscuro DE VERDAD pulsando el botón real, y lo AFIRMA.
 *
 * Poner `data-theme` a mano no sirve: el gestor de tema lo pisa con la preferencia
 * guardada y el atributo vuelve a `light` sin decir nada, con lo que el test mide el
 * tema claro dos veces y pasa en falso. Es el fallo que se documentó el 09/09/2026 en
 * el spec de simulador-gastos-compraventa-nave-industrial.
 */
async function activarTemaOscuro(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

/** Repite la lectura hasta que dos consecutivas coinciden: no depende de la animación. */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let intento = 0; intento < 30; intento++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}

type Medida = { ratio: number; texto: string; fondo: string; color: string };

/**
 * Peor contraste entre todos los `<th>` VISIBLES con texto propio.
 *
 * Resuelve el fondo componiendo las capas translúcidas sobre el primer fondo opaco
 * (un `rgba(...)` leído como si fuese opaco da falsos positivos gravísimos), y cuando
 * el fondo es un degradado mide contra CADA parada de color: el `<th>` reparado va de
 * #26718F a #327874 y el peor de los dos es el que manda.
 */
async function peorContrasteDeCabeceras(page: Page): Promise<Medida> {
  return page.evaluate(() => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const l1 = lum(a), l2 = lum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const rgba = (s: string) => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return n.length < 3 ? null : { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
    };

    /** Fondos candidatos de un elemento: cada parada del degradado, o el color compuesto. */
    const fondosDe = (el: Element): { rgb: number[]; desc: string }[] => {
      // 1. degradado, propio o del ancestro más cercano que lo tenga
      let n: Element | null = el;
      while (n) {
        const img = getComputedStyle(n).backgroundImage;
        if (img && img !== 'none' && /gradient/i.test(img)) {
          const paradas = img.match(/rgba?\([^)]+\)/g) ?? [];
          if (paradas.length) {
            return paradas.map((p) => {
              const c = rgba(p)!;
              return { rgb: [c.r, c.g, c.b], desc: p };
            });
          }
        }
        const propio = rgba(getComputedStyle(n).backgroundColor);
        if (propio && propio.a >= 1) break;
        n = n.parentElement;
      }
      // 2. color sólido, componiendo capas translúcidas
      const capas: { r: number; g: number; b: number; a: number }[] = [];
      let m: Element | null = el;
      while (m) {
        const c = rgba(getComputedStyle(m).backgroundColor);
        if (c && c.a > 0) {
          capas.push(c);
          if (c.a >= 1) break;
        }
        m = m.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) {
        const c = capas[i];
        base = [
          c.r * c.a + base[0] * (1 - c.a),
          c.g * c.a + base[1] * (1 - c.a),
          c.b * c.a + base[2] * (1 - c.a),
        ];
      }
      return [{ rgb: base, desc: `rgb(${base.map((v) => Math.round(v)).join(', ')})` }];
    };

    let peor: Medida | null = null;
    let vistos = 0;
    for (const el of Array.from(document.querySelectorAll('th, [class*="tablaHeader"], [class*="_th_"]'))) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const texto = (el.textContent ?? '').trim();
      if (texto.length < 2) continue;
      const fg = rgba(cs.color);
      if (!fg) continue;
      vistos++;
      for (const f of fondosDe(el)) {
        const v = ratio([fg.r, fg.g, fg.b], f.rgb);
        if (!peor || v < peor.ratio) {
          peor = { ratio: +v.toFixed(2), texto: texto.slice(0, 40), fondo: f.desc, color: cs.color };
        }
      }
    }
    if (!peor) return { ratio: -1, texto: `SIN CABECERAS VISIBLES (${vistos} candidatas)`, fondo: '', color: '' };
    return peor;
  });
}

/**
 * El botón de <EducationalSection>, que sirve a las 1.001 apps desde un solo fichero.
 *
 * Su hover usaba `--secondary-texto`, un token de COLOR: en :root vale lo mismo que
 * `--secondary-boton` —así que no oscurecía nada— pero en el tema oscuro de meskeIA se
 * invierte a #5ABDB9 y el blanco encima caía a 2,23:1. Se mide el hover DE VERDAD, porque
 * en reposo el botón siempre estuvo bien y el defecto solo aparecía al pasar por encima.
 */
test('EducationalSection: el botón cumple 4,5:1 también en HOVER y en oscuro', async ({ page }) => {
  await page.goto('/calculadora-profundidad-campo/');
  await prepararParaMedir(page);

  const boton = page.getByRole('button', { name: /Guía Educativa/i }).first();
  await expect(boton).toBeVisible();

  const medirHover = async () => {
    await boton.hover();
    return esperarEstable(async () =>
      boton.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, fondo: cs.backgroundColor };
      }),
    );
  };

  const ratio = (fg: string, bg: string) => {
    const n = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const canal = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const l1 = lum(n(fg)), l2 = lum(n(bg));
    return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2);
  };

  const claro = await medirHover();
  expect(ratio(claro.color, claro.fondo), `hover claro · ${claro.color} sobre ${claro.fondo}`).toBeGreaterThanOrEqual(UMBRAL);

  await activarTemaOscuro(page);
  await prepararParaMedir(page);
  const oscuro = await medirHover();
  expect(ratio(oscuro.color, oscuro.fondo), `hover oscuro · ${oscuro.color} sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(UMBRAL);

  console.log(`   EducationalSection hover: claro ${ratio(claro.color, claro.fondo)}:1 · oscuro ${ratio(oscuro.color, oscuro.fondo)}:1`);
});

for (const { slug, forma } of APPS) {
  test(`${slug}: las cabeceras de tabla cumplen 4,5:1 en ambos temas (${forma})`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);

    // ── TEMA CLARO ──
    const claro = await esperarEstable(() => peorContrasteDeCabeceras(page));
    expect(claro.ratio, `no se ha medido ninguna cabecera visible en ${slug}`).toBeGreaterThan(0);
    expect(
      claro.ratio,
      `claro · «${claro.texto}» ${claro.color} sobre ${claro.fondo}`,
    ).toBeGreaterThanOrEqual(UMBRAL);

    // ── TEMA OSCURO ──
    await activarTemaOscuro(page);
    await prepararParaMedir(page);
    const oscuro = await esperarEstable(() => peorContrasteDeCabeceras(page));
    expect(oscuro.ratio, `no se ha medido ninguna cabecera visible en oscuro`).toBeGreaterThan(0);
    expect(
      oscuro.ratio,
      `oscuro · «${oscuro.texto}» ${oscuro.color} sobre ${oscuro.fondo}`,
    ).toBeGreaterThanOrEqual(UMBRAL);

    console.log(`   ${slug}: claro ${claro.ratio}:1 · oscuro ${oscuro.ratio}:1`);
  });
}

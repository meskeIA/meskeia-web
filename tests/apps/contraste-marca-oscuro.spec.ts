import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { PUERTO, ORIGEN } from './_puerto';
import { prepararParaMedir } from '../_contraste';

/**
 * Testigo — el color de marca como texto se lee en tema oscuro (cabo C0112, 17/10/2026).
 *
 * C0112 nació en simulador-pendulo: su cifra de resultado iba en var(--primary) sobre el degradado
 * oscuro #1e3a5f → #14532d de `.resultBlock`, y daba 3,26:1 con el #3FA5D1 de meskeia.com (4,12:1
 * con el #C99BF5 de stemum.com). El censo del 17/10 sobre las 164 apps de Stemum y las 74 con ese
 * degradado encontró la misma forma en diez más, y una segunda en el propio componente: la píldora
 * «Stemum › disciplina» es BLANCA en los dos temas y su texto pasaba al violeta claro del oscuro
 * (2,00:1; en Coquinum, 1,9:1).
 *
 * Lo que mide: cada elemento con texto propio cuyo color calculado es el de marca del tema oscuro,
 * contra TODAS las paradas de los degradados y fondos que tiene detrás hasta el primero opaco
 * (mezclando los semitransparentes). Umbral 4,5:1 (3:1 en texto grande). Fuera, a propósito, el
 * «IA» del logotipo de meskeIA: es parte del logotipo (WCAG 1.4.3 lo exime).
 * Mide la carga, no los estados que aparecen al interactuar.
 */
test.use({
  colorScheme: 'dark',
  launchOptions: {
    args: [`--host-resolver-rules=MAP stemum.com 127.0.0.1:${PUERTO}, MAP coquinum.com 127.0.0.1:${PUERTO}`],
  },
});

const MESKEIA_OSCURO = [63, 165, 209]; // --primary-texto / --primary en [data-theme='dark']
const STEMUM_OSCURO = [201, 155, 245];

async function textosBajoUmbral(page: Page, objetivo: number[]): Promise<string[]> {
  return page.evaluate((OBJ) => {
    const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const contraste = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    const colores = (s: string) =>
      [...s.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1].split(/[ ,/]+/).filter(Boolean).map(Number));
    const mezclar = (c: number[], base: number[]) => {
      const a = c.length > 3 ? c[3] : 1;
      return [0, 1, 2].map((i) => c[i] * a + base[i] * (1 - a));
    };
    const buscado = `rgb(${OBJ.join(', ')})`;
    const fuera: string[] = [];
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const cs = getComputedStyle(el);
      // El «IA» del logo. Un guion bajo, no dos: «…module__hash__ia» en next dev y «hash_ia» en el
      // build; con /__ia/ bajo `next start` no se saltaba (cabo C0487)
      if (cs.color !== buscado || /_ia(\s|$)/.test(String(el.className))) continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
      if (el.getBoundingClientRect().width === 0 || cs.visibility === 'hidden') continue;
      const capas: { grad: number[][]; bg?: number[] }[] = [];
      for (let a: Element | null = el; a; a = a.parentElement) {
        const s = getComputedStyle(a);
        const grad = s.backgroundImage.includes('gradient') ? colores(s.backgroundImage) : [];
        const bg = colores(s.backgroundColor)[0];
        if (grad.length || (bg && (bg[3] ?? 1) > 0)) capas.push({ grad, bg });
        if ((grad.length && grad.every((c) => (c[3] ?? 1) >= 1)) || (!grad.length && bg && (bg[3] ?? 1) >= 1)) break;
      }
      let candidatos = [[26, 26, 26]];
      for (const capa of capas.reverse()) {
        const base = capa.bg && (capa.bg[3] ?? 1) > 0 ? candidatos.map((c) => mezclar(capa.bg!, c)) : candidatos;
        candidatos = capa.grad.length ? capa.grad.flatMap((g) => base.map((c) => mezclar(g, c))) : base;
      }
      const peor = Math.min(...candidatos.map((c) => contraste(OBJ, c)));
      const tam = parseFloat(cs.fontSize);
      const umbral = tam >= 24 || (tam >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5;
      if (peor < umbral) fuera.push(`${peor.toFixed(2)}:1 «${el.textContent!.trim().slice(0, 40)}»`);
    }
    return fuera;
  }, objetivo);
}

async function abrirOscuro(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await esperarPaginaAsentada(page);
  // Sin transiciones, como el instrumento compartido. Antes había una espera fija de 300 ms tras
  // el clic, y bajo carga las transiciones del cambio de tema duran más: con la CPU frenada ×6 se
  // midió un fondo a medio camino (rgb(115,115,115) a los 100 ms) y transiciones vivas hasta los
  // 600 ms. Era el rojo de la suite que aislado no salía (cabo C0337, simulador-gas-ideal y
  // simulador-orbitas-kepler, 20/10/2026).
  await prepararParaMedir(page);
  // Con el botón del logo, como lo haría la persona: sembrar data-theme o localStorage pasa en falso
  if ((await page.locator('html').getAttribute('data-theme')) !== 'dark') {
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

const DEGRADADO = [
  'calculadora-seccion-cable',
  'simulador-campo-magnetico',
  'simulador-campo-electrico',
  'simulador-equilibrio-quimico',
  'simulador-gas-ideal',
  'simulador-ondas-interferencia',
  'simulador-orbitas-kepler',
  'simulador-titulacion',
  'simulador-renta-plan-pensiones',
  'simulador-vsepr',
  'simulador-pendulo',
];
const DE_STEMUM = new Set(DEGRADADO.filter((s) => !['calculadora-seccion-cable', 'simulador-renta-plan-pensiones'].includes(s)));

for (const slug of DEGRADADO) {
  test(`${slug}: en oscuro el texto de marca se lee sobre su fondo (meskeia.com${DE_STEMUM.has(slug) ? ' y stemum.com' : ''})`, async ({
    page,
  }) => {
    await abrirOscuro(page, `${ORIGEN}/${slug}/`);
    expect(await textosBajoUmbral(page, MESKEIA_OSCURO), 'meskeia.com').toEqual([]);
    if (DE_STEMUM.has(slug)) {
      await abrirOscuro(page, `http://stemum.com/${slug}/`);
      await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
      expect(await textosBajoUmbral(page, STEMUM_OSCURO), 'stemum.com').toEqual([]);
    }
  });
}

/**
 * Cabo C0278 (19/10/2026): la misma medida sobre FONDOS PLANOS semitransparentes de marca, lo que
 * el censo de C0112 dejó fuera del degradado. Medido el 17/10: algebra-booleana bajo stemum.com
 * 3,91:1 (A', AB, SOP…), tabla-valencias bajo stemum.com 4,25:1 (chips +1), comparador-transporte-
 * viaje 3,94:1 (Madrid – Barcelona 621 km), guia-quesos y guia-cafe 4,42:1 (las píldoras).
 */
const FONDOS_PLANOS: { slug: string; dominio: 'meskeia' | 'stemum' }[] = [
  { slug: 'calculadora-algebra-booleana', dominio: 'stemum' },
  { slug: 'tabla-valencias', dominio: 'stemum' },
  { slug: 'comparador-transporte-viaje', dominio: 'meskeia' },
  { slug: 'guia-quesos', dominio: 'meskeia' },
  { slug: 'guia-cafe', dominio: 'meskeia' },
];

for (const { slug, dominio } of FONDOS_PLANOS) {
  test(`${slug}: en oscuro el texto de marca se lee sobre su fondo plano (${dominio}.com, C0278)`, async ({ page }) => {
    // El fondo se cambia para las dos marcas: se mide siempre meskeia.com, y Stemum donde se vio
    await abrirOscuro(page, `${ORIGEN}/${slug}/`);
    expect(await textosBajoUmbral(page, MESKEIA_OSCURO), 'meskeia.com').toEqual([]);
    if (dominio === 'stemum') {
      await abrirOscuro(page, `http://stemum.com/${slug}/`);
      await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
      expect(await textosBajoUmbral(page, STEMUM_OSCURO), 'stemum.com').toEqual([]);
    }
  });
}

test('la píldora de Stemum y la de Coquinum se leen en oscuro (son blancas en los dos temas)', async ({ page }) => {
  for (const [url, pildora] of [
    ['http://stemum.com/simulador-pendulo/', 'stemumPill'],
    ['http://coquinum.com/calculadora-porcentaje-panadero/', 'coquinumPill'],
  ]) {
    await abrirOscuro(page, url);
    const filas = await page.evaluate((clase) => {
      const num = (s: string) => (s.match(/[\d.]+/g) || []).map(Number);
      const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
      const pagina = num(getComputedStyle(document.body).backgroundColor);
      const caja = document.querySelector(`[class*="${clase}"]`)!;
      const [r, g, b, a = 1] = num(getComputedStyle(caja).backgroundColor);
      const fondo = [r, g, b].map((c, i) => c * a + (pagina[i] ?? 26) * (1 - a));
      return [...caja.querySelectorAll('span, a')]
        .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
        .map((e) => {
          const [x, y] = [lum(num(getComputedStyle(e).color)), lum(fondo)].sort((p, q) => q - p);
          return { texto: e.textContent!.trim(), ratio: (x + 0.05) / (y + 0.05) };
        });
    }, pildora);
    expect(filas.length, `${pildora}: textos medidos`).toBeGreaterThanOrEqual(3);
    for (const f of filas) expect(f.ratio, `${pildora} «${f.texto}»`).toBeGreaterThanOrEqual(4.5);
  }
});

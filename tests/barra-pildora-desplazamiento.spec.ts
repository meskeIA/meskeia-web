/**
 * Testigo de la campaña de globals.css del 13/10/2026 (cabos C0125, C0090 y C0116): mide el
 * COMPORTAMIENTO, no la forma del CSS.
 *
 *   · C0125 — `overflow-x: hidden` en html Y body hacía del body un contenedor de desplazamiento
 *     que nunca se desplaza, y ningún `position: sticky` del catálogo pegaba (41 módulos). Ahora
 *     el body lleva `overflow-x: clip`. Se comprueba que un sticky pega, y que pega DEBAJO de la
 *     barra fija de MeskeiaLogo, en tres apps reales que la campaña corrigió.
 *   · C0090 — la barra fija de MeskeiaLogo tapaba lo que una app alinea arriba con
 *     scrollIntoView o un salto a ancla. Ahora `html { scroll-padding-top }`.
 *   · C0116 — en escritorio (> 768 px) la píldora fija del Footer tapaba lo que una app deja
 *     pegado abajo con scrollIntoView block 'nearest'/'end'. Ahora `scroll-padding-bottom`.
 *
 * El destino del desplazamiento se siembra en una página real (no en una de pega), porque lo
 * que se mide es el CSS global y el cromo que monta cualquier app. Y la barra se mide en cada
 * caso, no se supone: bajo coquinum.com, por debajo de 414 px, la píldora parte la categoría
 * en dos líneas y la caja de la barra pasa de 62 a 88 px; MeskeiaLogo publica su alto real en
 * `--alto-barra-logo`, y el caso de coquinum es el que lo vigila.
 *
 * Con el globals.css de antes de la campaña fallan todos los casos (comprobado el 13/10/2026).
 */
import { test, expect, type Page } from '@playwright/test';
import { PUERTO } from './apps/_puerto';

// coquinum.com y stemum.com resueltos contra el servidor local: el proxy sirve la marca por Host.
test.use({
  launchOptions: {
    args: [`--host-resolver-rules=MAP coquinum.com 127.0.0.1:${PUERTO}, MAP stemum.com 127.0.0.1:${PUERTO}`],
  },
});

interface Caja {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Bordes de las piezas visibles del cromo fijo: barra del logo (arriba) y píldora del pie. */
async function medirCromo(page: Page): Promise<{ barra: Caja[]; barraAbajo: number; pildoraArriba: number | null }> {
  return page.evaluate(() => {
    const barra = document.querySelector('[data-barra-logo]') ?? document.querySelector('[class*="headerBar"]');
    const piezas = barra
      ? [...barra.children].map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0)
      : [];
    const pie = [...document.querySelectorAll('footer')].find((f) => getComputedStyle(f).position === 'fixed');
    return {
      barra: piezas.map((r) => ({ top: r.top, bottom: r.bottom, left: r.left, right: r.right })),
      // La caja entera de la barra (con su relleno transparente), que es lo que publica MeskeiaLogo
      barraAbajo: barra ? barra.getBoundingClientRect().bottom : 0,
      pildoraArriba: pie ? pie.getBoundingClientRect().top : null,
    };
  });
}

/** Siembra al final de la página un destino entre dos rellenos altos, con id para la ancla. */
async function sembrarDestino(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const caja = (alto: number, id?: string) => {
      const d = document.createElement('div');
      d.style.height = `${alto}px`;
      if (id) d.id = id;
      return d;
    };
    const bloque = document.createElement('div');
    bloque.append(caja(1600), caja(40, 'testigo-destino'), caja(1600));
    document.body.appendChild(bloque);
  });
}

async function cajaDestino(page: Page): Promise<Caja> {
  return page.evaluate(
    () =>
      new Promise<Caja>((resolver) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const r = document.getElementById('testigo-destino')!.getBoundingClientRect();
            resolver({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
          }),
        ),
      ),
  );
}

async function cargar(page: Page, url: string, ancho: number): Promise<void> {
  await page.setViewportSize({ width: ancho, height: ancho > 768 ? 800 : 844 });
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  // El ResizeObserver de MeskeiaLogo publica el alto tras montar
  await page.waitForTimeout(300);
}

// ─── C0090 · la barra del logo no tapa el destino ──────────────────────────────────────────
const ARRIBA = [
  { url: '/calculadora-notas/', ancho: 390, nombre: 'meskeia · móvil' },
  { url: '/calculadora-notas/', ancho: 1280, nombre: 'meskeia · escritorio' },
  { url: 'http://stemum.com/simulador-punnett/', ancho: 1024, nombre: 'stemum · 1024 (píldora con miga)' },
  { url: 'http://coquinum.com/calculadora-masa-madre/', ancho: 390, nombre: 'coquinum · 390 (píldora en dos líneas)' },
];

for (const c of ARRIBA) {
  test(`C0090 · ${c.nombre}: scrollIntoView 'start' y el salto a ancla dejan el destino bajo la barra`, async ({ page }) => {
    await cargar(page, c.url, c.ancho);
    await sembrarDestino(page);
    const cromo = await medirCromo(page);
    expect(cromo.barraAbajo, 'la barra del logo existe').toBeGreaterThan(40);

    await page.evaluate(() => document.getElementById('testigo-destino')!.scrollIntoView({ block: 'start' }));
    const porScroll = await cajaDestino(page);
    expect(porScroll.top, `scrollIntoView: destino a ${porScroll.top} px, barra hasta ${cromo.barraAbajo}`).toBeGreaterThanOrEqual(cromo.barraAbajo);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => {
      location.hash = 'testigo-destino';
    });
    const porAncla = await cajaDestino(page);
    expect(porAncla.top, `ancla: destino a ${porAncla.top} px, barra hasta ${cromo.barraAbajo}`).toBeGreaterThanOrEqual(cromo.barraAbajo);
    // Y sin pasarse: el hueco no es media pantalla
    expect(porAncla.top).toBeLessThan(cromo.barraAbajo + 24);
  });
}

// ─── C0116 · la píldora del pie no tapa el destino (solo escritorio, donde es fija) ────────
for (const c of [
  { url: '/generador-loteria/', ancho: 1280, nombre: 'meskeia · 1280' },
  { url: 'http://stemum.com/simulador-punnett/', ancho: 1024, nombre: 'stemum · 1024' },
]) {
  test(`C0116 · ${c.nombre}: scrollIntoView 'nearest' y 'end' dejan el destino sobre la píldora`, async ({ page }) => {
    await cargar(page, c.url, c.ancho);
    await sembrarDestino(page);
    const cromo = await medirCromo(page);
    expect(cromo.pildoraArriba, 'la píldora del pie es fija en escritorio').not.toBeNull();

    for (const block of ['nearest', 'end'] as const) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate((b) => document.getElementById('testigo-destino')!.scrollIntoView({ block: b }), block);
      const caja = await cajaDestino(page);
      expect(caja.bottom, `${block}: destino acaba en ${caja.bottom} px, píldora desde ${cromo.pildoraArriba}`).toBeLessThanOrEqual(
        cromo.pildoraArriba!,
      );
    }
  });
}

test('C0116 · en móvil la píldora no es fija: abajo solo queda el respiro de 0,5rem', async ({ page }) => {
  await cargar(page, '/generador-loteria/', 390);
  await sembrarDestino(page);
  await page.evaluate(() => document.getElementById('testigo-destino')!.scrollIntoView({ block: 'end' }));
  const caja = await cajaDestino(page);
  expect(Math.round(844 - caja.bottom)).toBe(8);
});

// ─── C0125 · los sticky pegan, y pegan bajo la barra ───────────────────────────────────────
test('C0125 · un sticky sembrado en el documento pega (el body ya no es contenedor de desplazamiento)', async ({ page }) => {
  await cargar(page, '/calculadora-notas/', 1280);
  const r = await page.evaluate(
    () =>
      new Promise<{ top: number; overflowYBody: string }>((resolver) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const s = document.createElement('div');
        s.style.cssText = 'position:sticky;top:120px;height:30px';
        const relleno = document.createElement('div');
        relleno.style.height = '2400px';
        const bloque = document.createElement('div');
        bloque.append(s, relleno);
        document.body.appendChild(bloque);
        window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 120 + 400);
        requestAnimationFrame(() =>
          resolver({ top: s.getBoundingClientRect().top, overflowYBody: getComputedStyle(document.body).overflowY }),
        );
      }),
  );
  expect(r.overflowYBody, 'el body no debe computar overflow-y auto').toBe('visible');
  expect(Math.round(r.top)).toBe(120);
});

/** Las tres formas que corrigió la campaña: panel a la izquierda, a la derecha y sobre la píldora del pie. */
const STICKY_REALES = [
  { slug: 'adaptador-dislexia', selector: '[class*="controlesPanel"]', forma: 'panel lateral a la izquierda (bajo la píldora del logo)' },
  { slug: 'estimador-impuesto-sucesiones', selector: '[class*="resultsPanel"]', forma: 'panel lateral a la derecha (bajo el botón de tema)' },
  { slug: 'generador-gitignore', selector: '[class*="previewPanel"]', forma: 'panel lateral bajo el botón de tema y sobre la píldora del pie' },
];

for (const c of STICKY_REALES) {
  test(`C0125 · ${c.slug} a 1280 px: ${c.forma} pega bajo la barra y no la cruza`, async ({ page }) => {
    await cargar(page, `/${c.slug}/`, 1280);
    const cromo = await medirCromo(page);
    const r = await page.evaluate((sel) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const el = document.querySelector(sel) as HTMLElement;
      const top = parseFloat(getComputedStyle(el).top);
      const natural = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, natural - top + 120);
      return new Promise<{ caja: Caja; top: number; posicion: string }>((resolver) =>
        requestAnimationFrame(() => {
          const b = el.getBoundingClientRect();
          resolver({ caja: { top: b.top, bottom: b.bottom, left: b.left, right: b.right }, top, posicion: getComputedStyle(el).position });
        }),
      );
    }, c.selector);
    expect(r.posicion).toBe('sticky');
    expect(Math.round(r.caja.top), 'pega en su top').toBe(Math.round(r.top));
    expect(r.caja.top, `pega a ${r.caja.top} px y la barra acaba en ${cromo.barraAbajo}`).toBeGreaterThanOrEqual(cromo.barraAbajo);
    if (cromo.pildoraArriba !== null) {
      const pie = await page.evaluate(() => {
        const f = [...document.querySelectorAll('footer')].find((x) => getComputedStyle(x).position === 'fixed')!;
        const b = f.getBoundingClientRect();
        return { left: b.left, right: b.right };
      });
      const cruzaEnX = r.caja.right > pie.left && r.caja.left < pie.right;
      if (cruzaEnX) expect(r.caja.bottom, 'no acaba bajo la píldora del pie').toBeLessThanOrEqual(cromo.pildoraArriba);
    }
  });
}

test('C0125 · a 390 px ningún sticky de las tres apps queda bajo la barra del logo', async ({ page }) => {
  for (const c of STICKY_REALES) {
    await cargar(page, `/${c.slug}/`, 390);
    const cromo = await medirCromo(page);
    const choques = await page.evaluate((barra) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const fuera: string[] = [];
      for (const el of [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'sticky')) {
        // Sin sticky quedaría 200 px por encima de la pantalla; si pega, en su top
        window.scrollTo(0, 0);
        const natural = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, natural + 200);
        const b = el.getBoundingClientRect();
        if (b.height === 0) continue;
        if (barra.some((p) => b.left < p.right && b.right > p.left && b.top < p.bottom && b.bottom > p.top))
          fuera.push(`${el.tagName.toLowerCase()} a ${Math.round(b.top)} px`);
      }
      return fuera;
    }, cromo.barra);
    expect(choques, `${c.slug}: ${choques.join(' · ')}`).toEqual([]);
  }
});

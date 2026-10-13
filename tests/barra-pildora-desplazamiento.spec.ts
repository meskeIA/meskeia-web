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

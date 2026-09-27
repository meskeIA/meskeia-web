import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Ciclos del Carbono y del Nitrógeno (visualizador-ecosistema) — generado por /inspector el 25/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Ciclos del Carbono y del Nitrógeno» y el subtítulo «el flujo de energía que
 *   sostiene la vida: pirámide trófica, ciclos biogeoquímicos y datos fascinantes». Es un
 *   explicador sin entradas de usuario: cuatro secciones (nav con aria-pressed) que abren fichas
 *   con aria-expanded. La metadata y el FAQPage prometen la «regla del 10 %» del flujo de energía.
 *
 * LO QUE TIENE VERDAD COMPROBABLE: LA ARITMÉTICA DE LA REGLA DEL 10 %, RESUELTA A MANO
 *   FLUJO_ENERGIA (page.tsx): 10.000 → 1.000 → 100 → 10 kcal, cada nivel × 0,10.
 *   Pérdidas: 10.000 − 1.000 = 9.000 · 1.000 − 100 = 900 · 100 − 10 = 90 kcal. Cuadran.
 *   Barras: ancho = kcal / 10.000 del carril (852 px a 1280): 852 · 85,2 · 8,52 · 8 (mín. CSS 8 px).
 *   DESTINO_ENERGIA: 60 + 20 + 10 + 10 = 100 %, y «Pasa al siguiente nivel» = 10 % = 1.000 / 10.000.
 *   Pirámide: 100 % → 10 % → 1 % → 0,1 %, cada nivel ÷ 10. Cuadra con el flujo.
 *   => La aritmética es coherente con lo que dice. El defecto de la sospecha es de CONTENIDO.
 *
 * REPARADOS el 25/09/2026 (hallazgos 1734-1743): los test.fail de abajo ya son test normales.
 *   Las cifras de la regla del 10 % salen ahora de app/visualizador-ecosistema/motor.ts, y el atún
 *   pasó al nivel superior de la pirámide (nivel trófico ~4,4 en FishBase): 0,1 % → 1.000 kg de
 *   fitoplancton por kg, tres transferencias (1.000 → 100 → 10 → 1).
 *
 * RE-INSPECCIÓN del 27/09/2026: los diez REPARADOS se verificaron en el navegador (escritorio
 *   1280, móvil 393 × 851 y tema oscuro aplicado tras la hidratación) y aguantan. Dos defectos
 *   nuevos quedan con test.fail al final del fichero: la sospecha S1 (complejidad-estabilidad) y
 *   el aria-label de la pirámide que oculta al lector la energía de cada nivel.
 *
 * LOS DEFECTOS QUE DEJÓ DOCUMENTADOS la inspección del 25/09/2026 (hoy REPARADOS, f03c1260)
 *   · Sospecha confirmada: la regla del 10 % se enuncia como ley exacta («solo el 10% de la
 *     energía pasa al siguiente», «▼ solo 10% pasa», «pierdes el 90%») y el FAQPage dice que el
 *     90 % «se disipa como calor metabólico», contra el 60/20/10 de la propia app. Es la forma del
 *     hallazgo 1610 de simulador-ecosistema-trofico, reparado allí como media (Lindeman, 1942).
 *   · El atún: consumidor secundario (1 % de la energía original) y a la vez «10.000 kg de
 *     fitoplancton por 1 kg de atún», que con la regla de la app exige 4 transferencias (0,01 %).
 *   · Biomasa y n.º de especies por nivel, sacados de aplicar el 10 % donde no aplica.
 *   · «Tu agua es antigua»: «miles de millones de veces» por el ciclo; son ~1,5 millones.
 *   · Yellowstone: «los ríos literalmente cambiaron de curso», un marco discutido, como hecho.
 *   · Formato: «N%» pegados, «1000 kcal» junto a «10.000» y «9.000», «10x».
 *   · Contraste de los colores fijos de nivel y de --primary (sin variante oscura) como texto.
 *   · Pirámide: en escritorio el nivel superior no contiene su texto; en móvil deja de ser pirámide.
 *   · 13 emojis sin aria-hidden en la comparación cadena/red trófica.
 *   · FAQPage: los descomponedores como nivel de la pirámide (la app dice que no lo son).
 */

const RUTA = '/visualizador-ecosistema/';

const nav = (page: Page) => page.locator('nav[aria-label="Secciones del explicador"] button');
const irA = async (page: Page, seccion: string): Promise<void> => {
  await nav(page).filter({ hasText: seccion }).click();
  await expect(nav(page).filter({ hasText: seccion })).toHaveAttribute('aria-pressed', 'true');
};
const niveles = (page: Page) => page.locator('div[class$="__piramide"] > button');
const contenido = (page: Page) => page.locator('div[class*="seccionContent"]');

/** «10.000 kcal», «1000 kcal» o «1.000 kcal» → número. */
const entero = (s: string): number => Number((s.match(/[\d.]+/)?.[0] ?? 'NaN').replace(/\./g, ''));
/** Primer porcentaje del texto: «0,1% de…», «10 %», «100% — …» → número. */
const porcentaje = (s: string): number => Number((s.match(/([\d,]+)\s?%/)?.[1] ?? 'NaN').replace(',', '.'));

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
});

// CASO 1 — normal. Lo que promete el <h1> abre por defecto (Ciclos) y la regla del 10 % cuadra
// con la aritmética resuelta en la cabecera.
test('caso normal — arranca en Ciclos y el flujo de energía cuadra: 10.000 → 1.000 → 100 → 10 kcal, pérdidas y barras', async ({
  page,
}) => {
  await expect(page.locator('h1')).toHaveText('Ciclos del Carbono y del Nitrógeno');
  await expect(nav(page)).toHaveCount(4);
  expect(await nav(page).evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-pressed')))).toEqual([
    'true',
    'false',
    'false',
    'false',
  ]);

  await irA(page, 'Regla del 10');
  const kcal = (await page.locator('span[class*="flujoKcal"]').allTextContents()).map(entero);
  expect(kcal).toEqual([10000, 1000, 100, 10]); // FLUJO_ENERGIA, cada nivel × 0,10
  const perdidas = (await page.locator('span[class*="flujoPerdidaTexto"]').allTextContents()).map(entero);
  expect(perdidas).toEqual([9000, 900, 90]); // 10.000 − 1.000, 1.000 − 100, 100 − 10
  for (let i = 0; i < perdidas.length; i++) expect(perdidas[i]).toBe(kcal[i] - kcal[i + 1]);

  // Barras proporcionales a kcal / 10.000. La precisión (±0,005 y ±0,0005) caza una escala
  // equivocada (÷1.000 daría 1,0), no el medio píxel del redondeo.
  const anchos = await page
    .locator('div[class*="flujoRelleno"]')
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
  expect(anchos[1] / anchos[0]).toBeCloseTo(0.1, 2);
  expect(anchos[2] / anchos[0]).toBeCloseTo(0.01, 3);

  // ¿Dónde va el 90 %? 60 + 20 + 10 + 10 = 100, y lo que pasa es 1.000 / 10.000 = 10 %.
  const destinos = (await page.locator('span[class*="destinoPct"]').allTextContents()).map(porcentaje);
  expect(destinos).toEqual([60, 20, 10, 10]);
  expect(destinos.reduce((a, b) => a + b, 0)).toBe(100);
  expect(destinos[3] / 100).toBeCloseTo(kcal[1] / kcal[0], 6);

  // La pirámide dice lo mismo: 0,1 % · 1 % · 10 % · 100 % de arriba abajo, cada nivel ÷ 10.
  await irA(page, 'Pirámide trófica');
  const energia = (await page.locator('span[class*="piramideEnergia"]').allTextContents()).map(porcentaje);
  expect(energia).toEqual([0.1, 1, 10, 100]);
});

// CASO 2 — normal, con teclado. Tab llega a la nav, Enter cambia de sección, Espacio abre un
// nivel de la pirámide (aria-expanded y su ficha) y Enter lo cierra.
test('teclado — Enter cambia de sección y Espacio/Enter abren y cierran un nivel de la pirámide', async ({ page }) => {
  let foco = '';
  for (let i = 0; i < 30 && !foco.includes('Pirámide trófica'); i++) {
    await page.keyboard.press('Tab');
    foco = await page.evaluate(() => document.activeElement?.textContent ?? '');
  }
  expect(foco).toContain('Pirámide trófica');
  await page.keyboard.press('Enter');
  await expect(page.locator('h2[class*="seccionTitulo"]')).toContainText('Pirámide trófica');

  const superior = niveles(page).first();
  await superior.focus();
  await page.keyboard.press(' ');
  await expect(superior).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('heading', { level: 3, name: 'Consumidores terciarios' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(superior).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('div[class$="__nivelDetalle"]')).toHaveCount(0);
  await expect(page.getByText('Pulsa en cualquier nivel de la pirámide para ver los detalles')).toBeVisible();
});

// CASO 3 — lo que debe impedirse. Sin entradas que rechazar, lo que la app no puede permitir es un
// estado incoherente: dos secciones pulsadas, dos fichas abiertas, o la ficha de una etapa del
// carbono pegada al ciclo del nitrógeno (el índice 3 es «Combustibles fósiles» en uno y «Consumo
// y descomposición» en el otro: si la etapa no se cerrase al cambiar, se leería la del otro ciclo).
test('caso límite — una sola sección, una sola ficha, y cambiar de ciclo cierra la etapa abierta', async ({ page }) => {
  await irA(page, 'Datos fascinantes');
  expect(await nav(page).evaluateAll((bs) => bs.filter((b) => b.getAttribute('aria-pressed') === 'true').length)).toBe(1);

  await irA(page, 'Pirámide trófica');
  await niveles(page).nth(0).click();
  await niveles(page).nth(2).click();
  expect(await niveles(page).evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-expanded')))).toEqual([
    'false',
    'false',
    'true',
    'false',
  ]);
  await expect(page.locator('div[class$="__nivelDetalle"]')).toHaveCount(1);
  await expect(page.locator('div[class$="__nivelDetalle"] h3')).toHaveText('Consumidores primarios');

  await irA(page, 'Ciclos biogeoquímicos');
  const carbono = page.getByRole('button', { name: 'Ciclo del Carbono' });
  const nitrogeno = page.getByRole('button', { name: 'Ciclo del Nitrógeno' });
  await expect(carbono).toHaveAttribute('aria-pressed', 'true');
  const etapas = page.locator('div[class*="cicloDiagrama"] > button');
  await etapas.nth(3).click();
  await expect(page.locator('div[class$="__cicloDetalle"] h3')).toHaveText('Combustibles fósiles');
  await expect(page.locator('div[class$="__cicloDetalle"]')).toContainText('~36.000 millones de toneladas');

  await nitrogeno.click();
  await expect(nitrogeno).toHaveAttribute('aria-pressed', 'true');
  await expect(carbono).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('div[class$="__cicloDetalle"]')).toHaveCount(0);
  await expect(etapas.nth(3)).toHaveAttribute('aria-expanded', 'false');
  await expect(etapas.nth(3)).toContainText('Consumo y descomposición');
  await expect(page.locator('span[class*="cicloCentroNombre"]')).toHaveText('Ciclo del Nitrógeno');
});

// ─── Defectos documentados el 25/09/2026, REPARADOS en f03c1260 y verificados el 27/09/2026 ───
// Cada test expresa lo CORRECTO; el «Obtenía» de los comentarios es lo que la app hacía ANTES.

// REPARADO (hallazgo 1734) — regla del 10 % como ley exacta (forma del hallazgo 1610).
// Entrada: abrir «Regla del 10 %» y leer el FAQPage.
// Esperado: el 10 % como media o aproximación (como quedó simulador-ecosistema-trofico: «en
// promedio solo en torno al 10 %», Lindeman 1942, eficiencias reales muy dispersas), y un FAQ que
// no contradiga el reparto de la propia app. Obtenía: «En cada nivel trófico, solo el 10% de la
// energía pasa al siguiente» sin matiz, y el FAQ «el 90% restante se disipa como calor
// metabólico» frente al 60 % respiración + 20 % desechos + 10 % no consumido de DESTINO_ENERGIA.
test('sospecha — la regla del 10 % se presenta como media, y el FAQ no contradice el reparto de la app', async ({
  page,
}) => {
  await irA(page, 'Regla del 10');
  const contexto = (await contenido(page).locator('div[class*="contexto"]').textContent()) ?? '';
  expect(contexto).toMatch(/de media|en promedio|en torno al|aproximad/i);

  const faq = await page.evaluate(() => {
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      const j = JSON.parse(s.textContent ?? '{}');
      if (j['@type'] === 'FAQPage') return j.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text);
    }
    return [] as string[];
  });
  expect(faq[1]).toMatch(/aproximaci|de media|en promedio/i);
  expect(faq[1]).not.toMatch(/el 90\s?% restante se disipa como calor/);
});

// REPARADO (hallazgo 1735) — el atún. Entrada: Pirámide → el nivel cuyos ejemplos incluyen «Atún».
// Esperado, con la regla de la propia app: kg de fitoplancton por kg de atún = 100 / (% de energía
// de su nivel). Atún en «Consumidores secundarios» (1 %) → 100 kg. Obtenía: la tarjeta del mismo
// nivel dice 1 % y el recuadro de debajo «10.000 kg de fitoplancton para 1 kg de atún» (0,01 %,
// un quinto nivel que la pirámide no tiene). El atún real: nivel trófico 4,4 ± 0,4 (FishBase).
test('atún — los kg de fitoplancton por kg de atún cuadran con el nivel donde la pirámide lo pone', async ({ page }) => {
  await irA(page, 'Pirámide trófica');
  let pctAtun = NaN;
  for (let i = 0; i < 4; i++) {
    await niveles(page).nth(i).click();
    const ejemplos = (await page.locator('span[class*="nivelDatoValor"]').first().textContent()) ?? '';
    if (ejemplos.includes('Atún')) pctAtun = porcentaje((await niveles(page).nth(i).locator('span[class*="piramideEnergia"]').textContent()) ?? '');
  }
  // Antes: «Consumidores secundarios · 1 %» con «10.000 kg» debajo. Reparado: el atún está en el
  // nivel superior (≈ 0,1 %), que con la media del 10 % da 100 / 0,1 = 1.000 kg por kg.
  expect(pctAtun).toBe(0.1);
  const insight = (await contenido(page).locator('div[class*="insight"]').textContent()) ?? '';
  const kgFito = entero(insight.match(/([\d.]+)\s*kg de fitoplancton/)?.[1] ?? 'NaN');
  expect(kgFito).toBe(100 / pctAtun);
});

// REPARADO (hallazgo 1736) — biomasa y especies por nivel. Entrada: Pirámide → Productores y Consumidores primarios.
// Esperado: cifras que no sean el 10 % aplicado a la biomasa y a las especies. Productores
// «~1.000 kg por hectárea» queda por debajo de casi todo ecosistema terrestre (Whittaker y Likens,
// 1975: ~7 t/ha matorral desértico, ~16 t/ha pradera templada, ~450 t/ha selva tropical), y en el
// mar la pirámide de biomasa se invierte (fitoplancton < zooplancton), así que «cada nivel tiene
// menos biomasa» no vale para los ejemplos que la propia app pone. Consumidores primarios «Miles»
// de especies frente a «Cientos de miles» de productores: solo los insectos fitófagos son del orden
// de las ~390.000 plantas vasculares (Kew, 2016).
test('biomasa y especies — no son el 10 % aplicado donde no aplica', async ({ page }) => {
  await irA(page, 'Pirámide trófica');
  const dato = (etiqueta: string) =>
    page.locator('div[class$="__nivelDato"]').filter({ hasText: etiqueta }).locator('span[class*="nivelDatoValor"]');
  await niveles(page).nth(3).click();
  await expect(dato('Biomasa')).not.toHaveText('~1.000 kg por hectárea');
  await expect(dato('Biomasa')).toContainText('t por hectárea'); // del orden de toneladas, con su fuente
  await expect(dato('Biomasa')).toContainText('Whittaker y Likens');
  await niveles(page).nth(2).click();
  await expect(dato('N.º de especies')).not.toHaveText('Miles');
  await expect(dato('N.º de especies')).toContainText('Cientos de miles');
  // Y la frase general ya no dice que cada nivel tenga menos biomasa: la del mar se invierte.
  await expect(contenido(page).locator('div[class*="contexto"]')).not.toContainText('Cada nivel tiene menos biomasa');
  await expect(contenido(page).locator('div[class*="contexto"]')).toContainText('pueden invertirse');
});

// REPARADO (hallazgo 1740) — «Tu agua es antigua». Entrada: Datos fascinantes → «Tu agua es antigua».
// Esperado, a mano: agua total ~1.386 millones de km³ / evaporación global ~500.000 km³ al año
// ≈ 2.800 años por vuelta; en ~4.000 millones de años ≈ 1,4 millones de vueltas, no «miles de
// millones de veces» (tres órdenes de magnitud por encima).
test('dato — el agua no ha dado «miles de millones» de vueltas al ciclo hidrológico', async ({ page }) => {
  await irA(page, 'Datos fascinantes');
  const tarjeta = page.locator('div[class*="datosGrid"] > button').filter({ hasText: 'Tu agua es antigua' });
  await tarjeta.click();
  await expect(tarjeta).toHaveAttribute('aria-expanded', 'true');
  await expect(tarjeta).not.toContainText('miles de millones de veces');
  // USGS: 1.386 millones de km³ / 577.000 km³ al año ≈ 2.400 años por vuelta → ~1,5 millones en 4.000 Ma.
  await expect(tarjeta).toContainText('2.400 años');
  await expect(tarjeta).toContainText('un millón y medio de vueltas');
});

// REPARADO (hallazgo 1741) — Yellowstone. Entrada: Datos → «Lobos de Yellowstone» y la guía educativa.
// Esperado: el efecto sobre los ríos como hipótesis discutida (Marshall, Hobbs y Cooper, 2013,
// Proc. R. Soc. B; Hobbs et al., 2024, Ecological Monographs), no como hecho. Obtenía: «los ríos
// cambiaron de curso» y «los ríos literalmente cambiaron de curso».
test('contenido — los ríos de Yellowstone no se afirman como hecho', async ({ page }) => {
  await irA(page, 'Datos fascinantes');
  await page.locator('div[class*="datosGrid"] > button').filter({ hasText: 'Lobos de Yellowstone' }).click();
  // Texto de la página sin <script> ni <style> (la guía educativa está en el DOM aunque nazca plegada).
  const texto = await page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  expect(texto).toContain('Yellowstone');
  expect(texto).not.toMatch(/ríos (literalmente )?cambiaron de curso/);
  expect(texto).toMatch(/debatid/);
});

// REPARADO (hallazgo 1739) — formato español. Entrada: abrir las cuatro secciones y cada una de sus fichas.
// Esperado: «10 %» con espacio (como quedó simulador-ecosistema-trofico, 0d54c8f9), «1.000 kcal»
// como sus vecinas «10.000» y «9.000», y «10 veces» en vez de «10x». Obtenía: «10%», «1000 kcal»
// (formatNumber con es-ES no agrupa cuatro cifras) y «~2 ha (10x más)».
test('formato — ningún «N%» pegado, «1.000 kcal» y nada de «10x»', async ({ page }) => {
  let texto = (await page.locator('nav[aria-label="Secciones del explicador"]').textContent()) ?? '';
  for (const seccion of ['Ciclos biogeoquímicos', 'Pirámide trófica', 'Regla del 10', 'Datos fascinantes']) {
    await irA(page, seccion);
    texto += (await page.locator('div[class*="seccionHeader"]').textContent()) ?? '';
    const ciclos = seccion === 'Ciclos biogeoquímicos' ? ['Ciclo del Carbono', 'Ciclo del Nitrógeno'] : [''];
    for (const ciclo of ciclos) {
      if (ciclo) await page.getByRole('button', { name: ciclo }).click();
      const fichas = contenido(page).locator('button[aria-expanded]');
      for (let i = 0; i < (await fichas.count()); i++) {
        await fichas.nth(i).click();
        texto += (await contenido(page).textContent()) ?? '';
      }
    }
  }
  await irA(page, 'Regla del 10');
  await expect(page.locator('span[class*="flujoKcal"]')).toHaveText(['10.000 kcal', '1.000 kcal', '100 kcal', '10 kcal']);
  expect([...new Set(texto.match(/[\d,]+%/g) ?? [])], 'porcentajes pegados a la cifra').toEqual([]);
  expect(texto).not.toMatch(/\d+x más/);
});

/** Contraste mínimo de todos los elementos del selector contra su fondo compuesto real. */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [l1, l2] = [lum(a), lum(b)];
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const nums = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
    const colores = (s: string): number[][] => [...s.matchAll(/rgba?\([^)]*\)/g)].map((m) => nums(m[0]));
    const sobre = (base: number[], [r, g, b, a = 1]: number[]) => [
      r * a + base[0] * (1 - a),
      g * a + base[1] * (1 - a),
      b * a + base[2] * (1 - a),
    ];
    const els = [...document.querySelectorAll(sel)];
    if (!els.length) throw new Error(`no existe ${sel}`);
    let peor = Infinity;
    for (const el of els) {
      type Capa = { grad: number[][] } | { color: number[] };
      const capas: Capa[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const grad = cs.backgroundImage !== 'none' ? colores(cs.backgroundImage) : [];
        const c = nums(cs.backgroundColor);
        const a = c.length === 4 ? c[3] : 1;
        if (grad.length) {
          capas.push({ grad });
          if (grad.every((g) => (g.length === 4 ? g[3] : 1) === 1)) break;
        } else if (c.length && a > 0) {
          capas.push({ color: [c[0], c[1], c[2], a] });
          if (a === 1) break;
        }
      }
      let bases: number[][] = [[255, 255, 255]];
      for (const capa of capas.reverse()) {
        bases = 'grad' in capa ? capa.grad.flatMap((g) => bases.map((b) => sobre(b, g))) : bases.map((b) => sobre(b, capa.color));
      }
      const texto = nums(getComputedStyle(el).color).slice(0, 3);
      peor = Math.min(peor, ...bases.map((b) => ratio(texto, b)));
    }
    return Math.round(peor * 100) / 100;
  }, selector);
}

// REPARADO (hallazgo 1738) — contraste en los dos temas. Todos son texto pequeño (12-17,6 px, < 18,66 px en
// negrita): exigen 4,5:1. Lo que se midió ANTES de f03c1260, con getComputedStyle sobre el fondo real:
//   claro  → «1000 kcal» #CA8A04 2,81 · «Energía solar» 2,81 · «10% de la energía» 2,94 ·
//            «10%» de la dieta 3,02 · «Ciclo del Carbono» del centro 3,16 · datoCifra 3,67
//   oscuro → «1%» de la dieta #DC2626 2,62 · «0,1% de la energía» 2,97 · datoCifra #2E86AB 3,50
//            (el módulo redeclara --primary sin variante oscura) · «Ciclo del Nitrógeno» 3,37
test('contraste — cifras de nivel, flujo, dieta, datos y centro del ciclo a 4,5:1 en claro y en oscuro', async ({
  page,
}) => {
  const grupos: Array<[string, string]> = [
    ['Pirámide trófica', 'span[class*="piramideEnergia"]'],
    ['Regla del 10', 'span[class*="flujoKcal"]'],
    ['Regla del 10', 'div[class*="flujoSol"] span:not([aria-hidden])'],
    ['Regla del 10', 'div[class*="flujoConector"] span'],
    ['Regla del 10', 'span[class*="implicacionValor"]'],
    ['Datos fascinantes', 'span[class*="datoCifra"]'],
    ['Ciclos biogeoquímicos', 'span[class*="cicloCentroNombre"]'],
  ];
  const medir = async (): Promise<string[]> => {
    const fallos: string[] = [];
    for (const [seccion, selector] of grupos) {
      await irA(page, seccion);
      const ciclos = seccion === 'Ciclos biogeoquímicos' ? ['Ciclo del Carbono', 'Ciclo del Nitrógeno'] : [''];
      for (const ciclo of ciclos) {
        if (ciclo) await page.getByRole('button', { name: ciclo }).click();
        await page.waitForTimeout(300); // transiciones de 0,2 s
        const r = await contrasteMinimo(page, selector);
        if (r < 4.5) fallos.push(`${selector}${ciclo ? ` (${ciclo})` : ''}: ${r}:1`);
      }
    }
    return fallos;
  };
  const claro = await medir();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const oscuro = await medir();
  expect({ claro, oscuro }).toEqual({ claro: [], oscuro: [] });
});

// REPARADO (hallazgo 1737) — la pirámide en escritorio. Entrada: 1280 px, sección Pirámide.
// Esperado: el icono, el nombre y la energía de cada nivel dentro de su botón. Obtenía: el nivel
// superior mide 77 px (10 % del ancho) y su contenido ocupa ~188 px: el águila y «0,1% de la
// energía original» se pintan fuera del borde.
test('pirámide — en escritorio cada nivel contiene su texto', async ({ page }) => {
  await irA(page, 'Pirámide trófica');
  const fuera = await niveles(page).evaluateAll((bs) =>
    bs.flatMap((b) => {
      const r = b.getBoundingClientRect();
      return [...b.querySelectorAll('span')]
        .filter((s) => {
          const q = s.getBoundingClientRect();
          return q.left < r.left - 1 || q.right > r.right + 1;
        })
        .map((s) => s.textContent ?? '');
    }),
  );
  expect(fuera).toEqual([]);
});

test.describe('móvil 375 × 667 con toque', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // CASO LÍMITE (móvil). Medido: scrollWidth 375 en las cuatro secciones; el diagrama del ciclo
  // (320 px) deja «Océanos (sumidero)» a 2 px del borde, dentro de la pantalla.
  test('móvil — ninguna sección desborda y tocar una etapa abre su ficha', async ({ page }) => {
    for (const seccion of ['Ciclos biogeoquímicos', 'Pirámide trófica', 'Regla del 10', 'Datos fascinantes']) {
      await nav(page).filter({ hasText: seccion }).tap();
      await expect(nav(page).filter({ hasText: seccion })).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth), seccion).toBeLessThanOrEqual(375);
    }
    await nav(page).filter({ hasText: 'Ciclos biogeoquímicos' }).tap();
    const oceanos = page.locator('div[class*="cicloDiagrama"] > button').filter({ hasText: 'Océanos (sumidero)' });
    const caja = await oceanos.boundingBox();
    expect(caja?.x ?? -1).toBeGreaterThanOrEqual(0);
    await oceanos.tap();
    await expect(page.locator('div[class$="__cicloDetalle"]')).toContainText('~25');
  });

  // REPARADO (hallazgo 1737) — en móvil la pirámide dejaba de serlo. `.piramideNivel { min-width: 80% }` iguala los
  // tres niveles de consumidores: medía 262 · 262 · 262 · 327 px. Esperado: anchos crecientes de
  // arriba abajo, que es lo que la sección enseña.
  test('móvil — los niveles de la pirámide se ensanchan de arriba abajo', async ({ page }) => {
    await nav(page).filter({ hasText: 'Pirámide trófica' }).tap();
    const anchos = await niveles(page).evaluateAll((bs) => bs.map((b) => Math.round(b.getBoundingClientRect().width)));
    for (let i = 1; i < anchos.length; i++) expect(anchos[i], `anchos ${anchos.join(' · ')}`).toBeGreaterThan(anchos[i - 1]);
    // Y, más estrechos, cada nivel sigue conteniendo su texto (el mismo criterio que en escritorio).
    const fuera = await niveles(page).evaluateAll((bs) =>
      bs.flatMap((b) => {
        const r = b.getBoundingClientRect();
        return [...b.querySelectorAll('span')]
          .filter((s) => {
            const q = s.getBoundingClientRect();
            return q.left < r.left - 1 || q.right > r.right + 1;
          })
          .map((s) => s.textContent ?? '');
      }),
    );
    expect(fuera).toEqual([]);
  });
});

// REPARADO (hallazgo 1742) — 13 emojis sin aria-hidden en «Cadena trófica vs Red trófica» (L603-631 de page.tsx,
// `node scripts/check-a11y-jsx.mjs`). Esperado: el lector no los anuncia. Obtenía: el árbol de
// accesibilidad lee «🌿 Planta 🐇 Conejo 🦊 Zorro…».
test('accesibilidad — los emojis de la cadena y la red trófica no llegan al lector', async ({ page }) => {
  await irA(page, 'Datos fascinantes');
  const arbol = await page.locator('div[class*="redCard"]').ariaSnapshot();
  expect(arbol).not.toMatch(/\p{Extended_Pictographic}/u);
});

// REPARADO (hallazgo 1743) — FAQPage de la pirámide. Esperado: coherente con la app, que dice «Descomponedores — No
// forman parte de la pirámide», y sin «siempre» para una pirámide de números que puede invertirse.
// Obtenía: «productores…, consumidores secundarios (carnívoros) y descomponedores» y «las
// poblaciones de depredadores son siempre mucho menores que las de sus presas».
test('FAQ — la pirámide no incluye a los descomponedores como nivel', async ({ page }) => {
  const respuesta = await page.evaluate(() => {
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      const j = JSON.parse(s.textContent ?? '{}');
      if (j['@type'] === 'FAQPage') return j.mainEntity[0].acceptedAnswer.text as string;
    }
    return '';
  });
  expect(respuesta).toContain('pirámide trófica');
  expect(respuesta).not.toMatch(/\(carnívoros\) y descomponedores/);
  expect(respuesta).not.toMatch(/siempre mucho menores/);
});

// ─── Re-inspección del 27/09/2026 ─────────────────────────────────────────────────────────────

// CASO LÍMITE / ESTADO VACÍO en Datos fascinantes. Resuelto a mano: abrir «Tu agua es antigua»
// (7.ª tarjeta) y luego «El atún y el fitoplancton» (8.ª) deja expandida SOLO la 8.ª, con su
// cifra derivada de motor.ts: 10³ = 1.000 y 10^3,4 = 2.511,9 → redondeado a centenas, 2.500.
// Volver a pulsarla la cierra (ninguna ficha abierta) y salir de la sección y volver la
// desmonta: vuelve sin fichas abiertas.
test('datos — una sola ficha abierta, pulsarla otra vez la cierra y cambiar de sección las pliega', async ({ page }) => {
  await irA(page, 'Datos fascinantes');
  const tarjetas = page.locator('div[class*="datosGrid"] > button');
  await expect(tarjetas).toHaveCount(8);
  const expandidas = () => tarjetas.evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-expanded')));
  await tarjetas.filter({ hasText: 'Tu agua es antigua' }).click();
  const atun = tarjetas.filter({ hasText: 'El atún y el fitoplancton' });
  await atun.click();
  expect(await expandidas()).toEqual(['false', 'false', 'false', 'false', 'false', 'false', 'false', 'true']);
  await expect(page.locator('span[class*="datoDetalle"]')).toHaveCount(1);
  await expect(atun).toContainText('del orden de 1.000 a 2.500 kg de fitoplancton');
  await expect(atun).toContainText('10 elevado a 3,4 ≈ 2.500');
  await atun.click();
  expect(await expandidas()).toEqual(Array(8).fill('false'));
  await expect(page.locator('span[class*="datoDetalle"]')).toHaveCount(0);
  await atun.click();
  await irA(page, 'Pirámide trófica');
  await irA(page, 'Datos fascinantes');
  expect(await expandidas()).toEqual(Array(8).fill('false'));
});

// Barrido de contraste de TODO el texto propio de la app (clases de Ecosistema.module.css) en
// tema oscuro, con una ficha abierta en cada sección. El test de 1738 mira siete selectores; este
// caza cualquier otro. El tema se aplica DESPUÉS de hidratar y se comprueba que el estilo cambió
// (fondo del contenedor #FAFAFA → #1A1A1A): sembrarlo antes pasaría en falso. Medido el
// 27/09/2026: 0 elementos por debajo de 4,5:1 (3:1 si es texto grande) en claro y en oscuro.
test('contraste — barrido de todo el texto propio de la app en oscuro, con fichas abiertas', async ({ page }) => {
  const contenedor = page.locator('div[class$="__container"]').first();
  await expect(contenedor).toHaveCSS('background-color', 'rgb(250, 250, 250)');
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(contenedor).toHaveCSS('background-color', 'rgb(26, 26, 26)');

  const barrer = (): Promise<string[]> =>
    page.evaluate(() => {
      const canal = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
      const ratio = (a: number[], b: number[]) => {
        const [l1, l2] = [lum(a), lum(b)];
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const nums = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
      const colores = (s: string): number[][] => [...s.matchAll(/rgba?\([^)]*\)/g)].map((m) => nums(m[0]));
      const sobre = (base: number[], [r, g, b, a = 1]: number[]) => [
        r * a + base[0] * (1 - a),
        g * a + base[1] * (1 - a),
        b * a + base[2] * (1 - a),
      ];
      const fallos: string[] = [];
      for (const el of document.querySelectorAll('div[class$="__container"] *')) {
        // Solo lo que pinta este módulo: el primer antepasado con clase es de Ecosistema.module.css
        let conClase: Element | null = el;
        while (conClase && !conClase.getAttribute('class')) conClase = conClase.parentElement;
        if (!conClase?.getAttribute('class')?.includes('Ecosistema-module__')) continue;
        const propio = [...el.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent ?? '')
          .join('')
          .trim();
        if (!/[\p{L}\p{N}]/u.test(propio)) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        type Capa = { grad: number[][] } | { color: number[] };
        const capas: Capa[] = [];
        for (let e: Element | null = el; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          const grad = cs.backgroundImage !== 'none' ? colores(cs.backgroundImage) : [];
          const c = nums(cs.backgroundColor);
          const a = c.length === 4 ? c[3] : 1;
          if (grad.length) {
            capas.push({ grad });
            if (grad.every((g) => (g.length === 4 ? g[3] : 1) === 1)) break;
          } else if (c.length && a > 0) {
            capas.push({ color: [c[0], c[1], c[2], a] });
            if (a === 1) break;
          }
        }
        let bases: number[][] = [[255, 255, 255]];
        for (const capa of capas.reverse()) {
          bases = 'grad' in capa ? capa.grad.flatMap((g) => bases.map((b) => sobre(b, g))) : bases.map((b) => sobre(b, capa.color));
        }
        const cs = getComputedStyle(el);
        const texto = nums(cs.color).slice(0, 3);
        const px = parseFloat(cs.fontSize);
        const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
        const peor = Math.min(...bases.map((b) => ratio(texto, b)));
        if (peor < (grande ? 3 : 4.5)) fallos.push(`«${propio.slice(0, 40)}» ${Math.round(peor * 100) / 100}:1`);
      }
      return fallos;
    });

  const pasos: Array<[string, (() => Promise<void>) | null]> = [
    ['Ciclos biogeoquímicos', () => page.locator('div[class*="cicloDiagrama"] > button').nth(0).click()],
    ['Pirámide trófica', null],
    ['Pirámide trófica', () => niveles(page).nth(0).click()],
    ['Regla del 10', () => page.locator('div[class*="destinoGrid"] > button').nth(0).click()],
    ['Datos fascinantes', () => page.locator('div[class*="datosGrid"] > button').nth(7).click()],
  ];
  const fallos: string[] = [];
  for (const [seccion, accion] of pasos) {
    await irA(page, seccion);
    if (accion) await accion();
    await page.waitForTimeout(400); // transiciones de 0,2 s y fadeIn de la ficha
    fallos.push(...(await barrer()).map((f) => `${seccion}: ${f}`));
  }
  expect(fallos).toEqual([]);
});

// ─── Defectos NUEVOS de la re-inspección del 27/09/2026 (test.fail: expresan lo CORRECTO) ─────

// ABIERTO: S1 confirmada — «más conexiones = más estable / más resiliente» se afirma como hecho
// en cinco sitios: la tarjeta de la red trófica («Más estable.»), el recuadro de Datos
// fascinantes, dos párrafos de la guía y la 3.ª respuesta del FAQPage. Es el debate
// complejidad-estabilidad, no una ley: May (1972, Nature 238: 413-414) mostró que un sistema
// ensamblado al azar es estable hasta un nivel crítico de conectancia y, al subirla, «se vuelve
// inestable de repente»; McCann (2000, Nature 405: 228-233) lo titula «The diversity–stability
// debate»; Landi et al. (2018, Population Ecology 60: 319-345) concluyen con «the theoretical
// debate and the lack of consensual agreement». Lo que sí está medido es más estrecho: Dunne,
// Williams y Martinez (2002, Ecology Letters 5: 558-567) hallan que la ROBUSTEZ ante extinciones
// secundarias crece con la conectancia pero «parece independiente de la riqueza de especies».
// Esperado: la relación presentada como hipótesis discutida. Obtenido: las frases de abajo.
test.fail('S1 — la relación conexiones-estabilidad no se afirma como hecho sin matiz', async ({ page }) => {
  await irA(page, 'Datos fascinantes');
  const tarjetaRed = (await page.locator('div[class*="redColReal"] p').textContent()) ?? '';
  const recuadro = (await contenido(page).locator('div[class*="insight"]').textContent()) ?? '';
  const texto = await page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return copia.textContent ?? '';
  });
  const faq = await page.evaluate(() => {
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      const j = JSON.parse(s.textContent ?? '{}');
      if (j['@type'] === 'FAQPage') return j.mainEntity[2].acceptedAnswer.text as string;
    }
    return '';
  });
  const sinMatiz = [
    /Más estable\.\s*$/.test(tarjetaRed) && 'tarjeta de la red: «Más estable.»',
    /más conexiones tiene un ecosistema,\s*más resiliente es/.test(recuadro) &&
      !/May|debat|hipótesis|discut/i.test(recuadro) &&
      'recuadro de Datos: «Cuantas más conexiones tiene un ecosistema, más resiliente es»',
    /Las redes son más estables porque/.test(texto) && 'guía: «Las redes son más estables porque…»',
    /más conexiones tiene la red trófica y más\s+resistente es/.test(texto) &&
      'guía: «Cuantas más especies… más resistente es ante perturbaciones»',
    /más estables ecológicamente porque/.test(faq) && 'FAQPage: «Las redes tróficas son más estables ecológicamente porque…»',
  ].filter(Boolean);
  expect(sinMatiz).toEqual([]);
});

// ABIERTO: el aria-label de cada nivel de la pirámide SUSTITUYE su contenido visible. El lector
// oye «Consumidores terciarios: Águilas, Lobos, Atún, Tiburones, Orcas» y nunca «≈ 0,1 % de la
// energía de los productores», que es el dato que la pirámide enseña (y la ficha que abre
// tampoco lo repite). Esperado, de lo que se ve en el botón: el nombre accesible contiene la
// energía del nivel — 0,1 %, 1 %, 10 % y 100 % de arriba abajo.
test.fail('accesibilidad — el nombre accesible de cada nivel de la pirámide incluye su energía', async ({ page }) => {
  await irA(page, 'Pirámide trófica');
  const esperado = [/0,1\s%/, /≈\s1\s%/, /≈\s10\s%/, /100\s%/];
  for (let i = 0; i < 4; i++) await expect(niveles(page).nth(i)).toHaveAccessibleName(esperado[i], { timeout: 1000 });
});

test.describe('móvil 393 × 851 con toque', () => {
  test.use({
    viewport: { width: 393, height: 851 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  });

  // REPARADO (hallazgo 1737), medido a mano: carril = 393 − 2 × 24 px de relleno del contenedor
  // = 345 px (en ≤ 768 px la pirámide pierde su padding-right). Con --ancho-movil 55 · 70 · 85 ·
  // 100 %: 189,75 · 241,5 · 293,25 · 345 px, centrados, y ningún texto fuera de su escalón.
  test('móvil — la pirámide mide 55 · 70 · 85 · 100 % del carril y tocar el vértice abre su ficha', async ({ page }) => {
    await nav(page).filter({ hasText: 'Pirámide trófica' }).tap();
    await expect(nav(page).filter({ hasText: 'Pirámide trófica' })).toHaveAttribute('aria-pressed', 'true');
    const cajas = await niveles(page).evaluateAll((bs) =>
      bs.map((b) => {
        const r = b.getBoundingClientRect();
        const fuera = [...b.querySelectorAll('span')].some((s) => {
          const q = s.getBoundingClientRect();
          return q.left < r.left - 1 || q.right > r.right + 1;
        });
        return { ancho: r.width, centro: r.left + r.width / 2, fuera };
      }),
    );
    const esperados = [189.75, 241.5, 293.25, 345];
    cajas.forEach((c, i) => {
      expect(c.ancho).toBeCloseTo(esperados[i], 0);
      expect(c.centro).toBeCloseTo(24 + 345 / 2, 0);
      expect(c.fuera).toBe(false);
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(393);
    await niveles(page).first().tap();
    await expect(niveles(page).first()).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('div[class$="__nivelDetalle"] h3')).toHaveText('Consumidores terciarios');
  });
});

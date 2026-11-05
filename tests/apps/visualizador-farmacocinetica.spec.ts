import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Visualizador de farmacocinética — test de regresión (inspector 05/11/2026, primera inspección)
 *
 * Qué calcula la app (page.tsx, sin motor aparte):
 *   · Calculadora de eliminación (pestaña «Vida media»): t = t½ · log₂(100 / (100 − %)),
 *     con t½ de 0,5 a 200 h (paso 0,5) y % de 50 a 99. < 1 h → minutos; < 24 h → horas; si no, días.
 *   · Curva C-T (pestaña «Curva C-T»): c(t) = F · (1 − e^(−1,5·t)) · e^(−k·t), k = ln 2 / t½,
 *     muestreada cada t½/4 de 0 a 6·t½ (25 puntos) y dibujada con el eje Y escalado a su propio
 *     máximo y el eje X a 6·t½, sin marcas numéricas en ninguno de los dos.
 *
 * DE DÓNDE SALE CADA ESPERADO (calculado a mano ANTES de abrir el navegador)
 *   CASO 1 — t½ 4 h, 97 %: log₂(100/3) = 5,0589 → 4 · 5,0589 = 20,24 h → «20,2 horas»
 *            estado inicial t½ 2,5 h, 95 %: log₂ 20 = 4,3219 → 10,80 h → «10,8 horas»
 *            paracetamol de la tabla (2,5 h) al 97 %: 12,65 h → «12,6 horas» (la FAQ dice «~12 horas»)
 *   CASO 2 (límite) — t½ 200 h, 99 %: log₂ 100 = 6,6439 → 1.328,77 h = 55,37 días → «55,4 días»
 *            t½ 0,5 h, 50 %: 0,5 h → «30 minutos» · t½ 0,5 h, 70 %: 0,5 · 1,7370 = 0,8685 h → «52 minutos»
 *   CASO 3 (rechazo) — los deslizadores no admiten valores fuera de rango: % 100 → 99 (2,5 · 6,6439
 *            = 16,61 h), % 0 → 50 (2,5 h), t½ −5 → 0,5 (0,5 h = 30 min), t½ 300 → 200 (200 h =
 *            8,33 días); nunca «Infinity» ni «NaN» (100 % daría log₂(100/0)).
 *   CASO 4 — la curva con t½ 4 h y F 70 %: c(1) = 0,7·0,7769·0,8409 = 0,457; c(2) = 0,7·0,9502·0,7071
 *            = 0,470; c(3) = 0,7·0,9889·0,5946 = 0,412 → el máximo MUESTREADO está en t = 2 h, a 2/24
 *            del ancho. En la fase de eliminación cada t½ divide C por 2: c(12)/c(8) = 0,125/0,25 = 0,5
 *            (con el redondeo a 3 decimales de la app, 0,088/0,175 = 0,503). Al final (24 h = 6 t½)
 *            queda 0,7·2⁻⁶ = 0,0109 → 0,011/0,470 = 2,3 % del máximo.
 *            Con t½ 24 h la rejilla es de 6 h y el máximo muestreado cae en t = 6 h: c(6) = 0,7·0,9999
 *            ·0,8409 = 0,589; al final, 0,011/0,589 = 1,9 %.
 *
 * HALLAZGOS ABIERTOS (inspector 05/11/2026): los test.fail() de abajo. Cada uno afirma lo que la
 * app DEBERÍA hacer, así que hoy falla «como se espera»; al repararse, se quita el test.fail().
 *
 * Fuentes: ninguna de las semividas, Vd ni biodisponibilidades de la app trae fuente, y las fichas
 * técnicas (CIMA-AEMPS) y la EMA no están en la lista de dominios del Inspector: no se han podido
 * cotejar; ver el hallazgo «sin fuente».
 */

const URL_APP = '/visualizador-farmacocinetica/';

async function irAVidaMedia(page: Page) {
  await page.getByRole('tab', { name: /Vida media/ }).click();
  await expect(page.locator('#calc-t12')).toBeVisible();
}

function panelResultado(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: 'Tiempo estimado' });
}

/** «~20.2 horas» o «~20,2 horas» → { valor: 20.2, unidad: 'horas' }; el separador se tolera aquí
 *  porque el formato tiene su propio caso (hallazgo de formato, abajo). */
async function leerResultado(page: Page): Promise<{ valor: number; unidad: string; texto: string }> {
  const texto = (await panelResultado(page).innerText()).replace(/\s+/g, ' ').trim();
  const m = texto.match(/~?\s*(\d+(?:[.,]\d+)?)\s*(minutos?|horas?|días?)/);
  if (!m) throw new Error(`No se lee el tiempo de eliminación: «${texto}»`);
  return { valor: Number(m[1].replace(',', '.')), unidad: m[2], texto };
}

interface Curva {
  xs: number[];
  ys: number[];
  textos: string[];
  cx: number;
  cy: number;
}

async function leerCurva(page: Page): Promise<Curva> {
  return page.getByRole('img', { name: /Curva concentración/ }).evaluate((el) => {
    const linea = Array.from(el.querySelectorAll('path')).find((p) => p.getAttribute('fill') === 'none');
    const d = linea?.getAttribute('d') ?? '';
    const pares = [...d.matchAll(/[ML]\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/g)];
    const c = el.querySelector('circle');
    return {
      xs: pares.map((p) => Number(p[1])),
      ys: pares.map((p) => Number(p[2])),
      textos: Array.from(el.querySelectorAll('text')).map((t) => t.textContent ?? ''),
      cx: Number(c?.getAttribute('cx')),
      cy: Number(c?.getAttribute('cy')),
    };
  });
}

/** Altura de cada punto sobre la base (el primero, t = 0, donde C = 0). */
const alturas = (c: Curva) => c.ys.map((y) => c.ys[0] - y);

/** Contraste WCAG del texto de un elemento contra su fondo efectivo (capas con alfa y opacidad). */
async function contrasteDe(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    const parse = (s: string | null): number[] | null => {
      const m = s?.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => Number(x.trim()));
      if (p.length === 3) p.push(1);
      return p;
    };
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.slice(0, 3).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const esSvg = el instanceof SVGElement;
    const cs = getComputedStyle(el);
    const col = parse(esSvg ? cs.fill : cs.color) ?? [0, 0, 0, 1];
    const capas: number[][] = [];
    let opacidad = 1;
    for (let e: Element | null = el; e; e = e.parentElement) {
      opacidad *= Number(getComputedStyle(e).opacity);
    }
    for (let e: Element | null = esSvg ? el.closest('svg') : el; e; e = e.parentElement) {
      const p = parse(getComputedStyle(e).backgroundColor);
      if (p && p[3] > 0) capas.push(p);
    }
    let base = [255, 255, 255];
    for (const c of capas.reverse()) base = base.map((v, k) => c[k] * c[3] + v * (1 - c[3]));
    const a = col[3] * opacidad;
    const texto = col.slice(0, 3).map((v, k) => v * a + base[k] * (1 - a));
    const la = lum(texto);
    const lb = lum(base);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  });
}

async function jsonLdDe(page: Page, tipo: string): Promise<Record<string, unknown>[]> {
  return page.evaluate((t) => {
    const nodos: Record<string, unknown>[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const lista = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of lista) if (n['@type'] === t) nodos.push(n);
    }
    return nodos;
  }, tipo);
}

test.describe('visualizador-farmacocinetica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-bio', '#slider-t12']);
  });

  test('estructura: h1, aviso médico no plegable y aviso legal', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Visualizador de Farmacocinética');
    await expect(page.getByText('NO constituyen consejo médico ni farmacéutico')).toBeVisible();
    await expect(page.getByText(/No utilices esta información para modificar/)).toBeVisible();
  });

  // ------------------------------------------------------------------ calculadora de eliminación

  test('CASO 1: t½ 4 h al 97 % → 20,2 horas; estado inicial 2,5 h al 95 % → 10,8 horas', async ({ page }) => {
    await irAVidaMedia(page);
    let r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(10.8, 5);
    expect(r.unidad).toBe('horas');

    await sembrarValor(page, '#calc-t12', 4);
    await sembrarValor(page, '#calc-pct', 97);
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(20.2, 5);
    expect(r.unidad).toBe('horas');
    await expect(panelResultado(page)).toContainText('97');

    // Paracetamol de la tabla (2,5 h) al 97 %: 12,65 h, coherente con «~12 horas» de la FAQ visible
    await sembrarValor(page, '#calc-t12', 2.5);
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(12.6, 5);
  });

  test('CASO 2 (límite): 200 h al 99 % → 55,4 días; 0,5 h al 50 % → 30 minutos; al 70 % → 52 minutos', async ({ page }) => {
    await irAVidaMedia(page);
    await sembrarValor(page, '#calc-t12', 200);
    await sembrarValor(page, '#calc-pct', 99);
    let r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(55.4, 5);
    expect(r.unidad).toBe('días');

    await sembrarValor(page, '#calc-t12', 0.5);
    await sembrarValor(page, '#calc-pct', 50);
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBe(30);
    expect(r.unidad).toBe('minutos');

    await sembrarValor(page, '#calc-pct', 70);
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBe(52);
    expect(r.unidad).toBe('minutos');
  });

  test('CASO 3 (rechazo): los deslizadores no aceptan 100 %, 0 %, t½ negativa ni por encima de 200 h', async ({ page }) => {
    await irAVidaMedia(page);
    // 100 % daría log₂(100/0) = ∞: el control lo deja en 99 → 2,5 · 6,6439 = 16,61 h
    expect(await sembrarValorAcotado(page, '#calc-pct', 100)).toBe('99');
    let r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(16.6, 5);
    // 0 % → 50 % → una vida media: 2,5 h
    expect(await sembrarValorAcotado(page, '#calc-pct', 0)).toBe('50');
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(2.5, 5);
    expect(r.unidad).toBe('horas');
    // t½ −5 → 0,5 h → 30 minutos
    expect(await sembrarValorAcotado(page, '#calc-t12', -5)).toBe('0.5');
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBe(30);
    expect(r.unidad).toBe('minutos');
    // t½ 300 → 200 h al 50 % → 200 h = 8,33 días
    expect(await sembrarValorAcotado(page, '#calc-t12', 300)).toBe('200');
    r = await leerResultado(page);
    expect(r.valor, r.texto).toBeCloseTo(8.3, 5);
    expect(r.unidad).toBe('días');
    await expect(panelResultado(page)).not.toContainText(/Infinity|NaN/);
  });

  // ------------------------------------------------------------------ curva concentración-tiempo

  /*
   * CASO 4, rehecho el 05/11/2026 con la reparación del hallazgo 4124: la rejilla pasa de t½/4 a
   * t½/20 (121 puntos) más el punto analítico de Tmax, t = ln((ka + ke)/ke)/ka con ka = 1,5.
   *   t½ 4 h, F 70 %: ke = 0,17329 → Tmax = ln(1,67329/0,17329)/1,5 = 1,5117 h ·
   *     Cmax = 0,7 · (1 − e^−2,2676) · e^−0,26197 = 0,7 · 0,89644 · 0,76953 = 0,48288 ·
   *     c(24) = 0,7 · 2⁻⁶ = 0,0109375 → 2,27 % del máximo · c(12)/c(8) = 0,5000.
   *   t½ 24 h: ke = 0,028881 → Tmax = ln(1,528881/0,028881)/1,5 = 2,6457 h (antes, 6 h por la
   *     rejilla) · Cmax = 0,7 · 0,98111 · 0,92646 = 0,63627 · c(144)/Cmax = 0,0109375/0,63627 = 1,72 %.
   */
  test('CASO 4: con t½ 4 h el máximo cae en Tmax = 1,51 h y cada t½ divide C por 2; con 24 h, en 2,65 h', async ({ page }) => {
    const c = await leerCurva(page);
    expect(c.xs).toHaveLength(122);
    const h = alturas(c);
    const x0 = c.xs[0];
    const ancho = c.xs[c.xs.length - 1] - x0;
    const alturaEn = (curva: Curva, alt: number[], t: number, total: number): number => {
      const x = curva.xs[0] + (t / total) * (curva.xs[curva.xs.length - 1] - curva.xs[0]);
      const i = curva.xs.reduce((mejor, xx, k) => (Math.abs(xx - x) < Math.abs(curva.xs[mejor] - x) ? k : mejor), 0);
      return alt[i];
    };
    const iMax = h.indexOf(Math.max(...h));
    expect((c.xs[iMax] - x0) / ancho).toBeCloseTo(1.5117 / 24, 3);
    expect(c.cx).toBeCloseTo(c.xs[iMax], 1);
    expect(alturaEn(c, h, 12, 24) / alturaEn(c, h, 8, 24)).toBeCloseTo(0.5, 2);
    expect(h[h.length - 1] / h[iMax]).toBeCloseTo(0.0227, 2);
    await expect(page.getByRole('img', { name: /Curva concentración/ })).toContainText('Tmax ≈ 1,5 h');

    await sembrarValor(page, '#slider-t12', 24);
    const c24 = await leerCurva(page);
    const h24 = alturas(c24);
    const iMax24 = h24.indexOf(Math.max(...h24));
    const ancho24 = c24.xs[c24.xs.length - 1] - c24.xs[0];
    expect((c24.xs[iMax24] - c24.xs[0]) / ancho24).toBeCloseTo(2.6457 / 144, 3);
    expect(h24[h24.length - 1] / h24[iMax24]).toBeCloseTo(0.0172, 2);
    await expect(page.getByRole('img', { name: /Curva concentración/ })).toContainText('Tmax ≈ 2,6 h');
  });

  // HALLAZGO 4124 — REPARADO el 05/11/2026 (/reparar): eje Y fijo (100 % = Cmax con F = 100 %)
  // y marcas en los dos ejes. Los dos tests de abajo afirmaban lo correcto; ahora pasan.
  test('HALLAZGO 4124 (REPARADO) [operativa/medio]: mover la biodisponibilidad cambia la curva', async ({ page }) => {
    // ENTRADA  t½ 4 h; F 100 % y luego F 10 % («10 % (efecto 1er paso alto)»)
    // ESPERADO C(t) = (D·F/Vd)·…: con F 10 % la concentración es la décima parte en todo punto,
    //          así que Cmax baja al 10 % (≈ 115 px más abajo en un eje fijo de 128 px) o, si el eje
    //          se reescala, sus marcas cambian
    // OBTENIDO el mismo trazo (diferencia máxima 1 px, del redondeo) y el marcador Cmax en y = 16
    //          con los dos valores: el eje Y se escala al máximo de cada curva y no tiene marcas
    await sembrarValor(page, '#slider-bio', 100);
    const f100 = await leerCurva(page);
    await sembrarValor(page, '#slider-bio', 10);
    const f10 = await leerCurva(page);
    const difMax = Math.max(...f100.ys.map((y, i) => Math.abs(y - f10.ys[i])));
    const textosCambian = f100.textos.join('|') !== f10.textos.join('|');
    expect(difMax > 30 || textosCambian, `Δy máx ${difMax} px; textos ${f10.textos.join(' | ')}`).toBe(true);
    // Con el eje fijo de 128 px: F 100 % pone Cmax arriba (y = 16) y F 10 %, al 10 % (y = 131,2).
    expect(f100.cy).toBeCloseTo(16, 0);
    expect(f10.cy).toBeCloseTo(16 + 128 * 0.9, 0);
  });

  test('HALLAZGO 4124 (REPARADO) [operativa/medio]: los ejes de la curva tienen marcas numéricas', async ({ page }) => {
    // ENTRADA  pestaña «Curva C-T», t½ 2 h y luego 24 h
    // ESPERADO poder leer en el eje «Tiempo (h)» cuánto dura el fármaco: con t½ 2 h a las 12 h
    //          queda el 2,8 % de Cmax y con t½ 24 h, el 78 %
    // OBTENIDO solo «Concentración», «Tiempo (h)», «Cmax» y «Tmax»: el eje X va siempre de 0 a 6 t½,
    //          así que las dos curvas acaban en el mismo sitio y con la misma altura relativa
    await sembrarValor(page, '#slider-t12', 2);
    const c = await leerCurva(page);
    expect(c.textos.some((t) => /\d/.test(t)), c.textos.join(' | ')).toBe(true);
    // Una marca por vida media en horas (0 a 12 con t½ 2 h) y el eje Y de 0 a 100.
    for (const marca of ['0', '2', '4', '6', '8', '10', '12', '25', '50', '75', '100']) {
      expect(c.textos, marca).toContain(marca);
    }
  });

  // ------------------------------------------------------------------ formato y textos

  test('HALLAZGO ABIERTO [contenido/bajo]: los tiempos y las t½ salen con punto decimal', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [contenido/bajo]
    // ENTRADA  estado inicial de la calculadora (t½ 2,5 h, 95 %)
    // ESPERADO «~10,8 horas» y «t½ = 2,5 h» (CLAUDE.md global §2: coma decimal, nunca toFixed)
    // OBTENIDO «~10.8 horas», «Vida media (t½ en horas): 2.5 h», «(95% del fármaco · t½ = 2.5 h)»;
    //          también «~55.4 días», «~1.0 horas» (t½ 0,5 h al 75 %) y el aria-label «Vida media: 4.5 horas»
    await irAVidaMedia(page);
    await expect(panelResultado(page)).toContainText('10,8 horas', { timeout: 2000 });
    await expect(page.locator('label[for="calc-t12"]')).toContainText('2,5 h', { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: el «%» va pegado a la cifra', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [contenido/bajo]
    // ENTRADA  etiqueta «Porcentaje a eliminar» y «Biodisponibilidad (F)»
    // ESPERADO «95 %» y «70 %» con espacio duro U+00A0 (CLAUDE.md global §2, desde el 25/09/2026)
    // OBTENIDO «95%», «70%»; igual en las tablas («100%», «30–80% (variable)») y los textos
    await expect(page.locator('label[for="slider-bio"]')).toContainText('70 %', { timeout: 2000 });
  });

  // HALLAZGO 4125 — REPARADO el 05/11/2026 (/reparar): la respuesta del FAQPage y la frase de la
  // pestaña «Vida media» dicen ya lo mismo que «Errores comunes».
  test('HALLAZGO 4125 (REPARADO) [contenido/medio]: el FAQPage ya no da una regla de dosificación que la página desmiente', async ({ page }) => {
    // ENTRADA  FAQPage, «¿Qué es la vida media de un fármaco?»
    // ESPERADO lo que dice la página en «Errores comunes»: «La dosificación depende de la curva
    //          terapéutica completa y del índice terapéutico, no solo de la t½»
    // OBTENIDO «Determina con qué frecuencia hay que tomar la medicación: un fármaco con vida media
    //          de 24 horas se puede tomar una vez al día»
    const [faq] = await jsonLdDe(page, 'FAQPage');
    expect(JSON.stringify(faq)).not.toContain('se puede tomar una vez al día');
    expect(JSON.stringify(faq)).toContain('no decide por sí sola cada cuánto se toma');
    await irAVidaMedia(page);
    await expect(page.locator('[class*="tabContenido"]')).not.toContainText('Determina la frecuencia de dosificación');
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: la guía del paracetamol llama «completa» a la eliminación de 5 t½ y da 12-15 h', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [contenido/bajo]
    // ENTRADA  guía «Viaje de una pastilla de paracetamol oral», paso 6 (t½ 2-3 h)
    // ESPERADO 5 × t½ = 10-15 h, y a las 5 t½ queda el 3 % (la FAQ visible: «5 vidas medias para
    //          eliminar el 97%»; la calculadora: 2 h al 97 % → 10,1 h, 3 h al 97 % → 15,2 h)
    // OBTENIDO «Eliminación completa en aproximadamente 12-15 horas (5 × t½)»
    const guia = page.locator('[data-guia-educativa]');
    await expect(guia).not.toContainText('Eliminación completa en aproximadamente 12-15 horas');
  });

  test('HALLAZGO ABIERTO [contenido/medio]: las semividas, Vd y biodisponibilidades no citan fuente', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [contenido/medio]
    // ENTRADA  pestaña «Vida media» (ocho semividas) y sección D (seis Vd)
    // ESPERADO cada dato con su fuente (ficha técnica de CIMA-AEMPS, manual y año) o retirado
    // OBTENIDO ninguna fuente en la tabla, en las tarjetas de Vd ni en los ejemplos de CYP450
    await irAVidaMedia(page);
    const contenido = page.locator('[class*="tabContenido"]');
    await expect(contenido).toContainText(/fuente|ficha técnica|CIMA/i, { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: el JSON-LD no declara ninguna característica', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [contenido/bajo]
    // ENTRADA  WebApplication.featureList
    // ESPERADO 4-8 características que la app hace (CLAUDE.md §1.ter)
    // OBTENIDO «featureList»: []
    const [app] = await jsonLdDe(page, 'WebApplication');
    expect((app.featureList as unknown[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  // ------------------------------------------------------------------ accesibilidad

  test('HALLAZGO ABIERTO [accesibilidad/medio]: los valores de Vd no llegan a 4,5:1 en claro', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [accesibilidad/medio]
    // ENTRADA  sección «D — Distribución», tema claro
    // ESPERADO texto de 14,4 px en negrita ≥ 4,5:1 (WCAG 1.4.3)
    // OBTENIDO #2E86AB 4,11:1 (heparina, warfarina), #48A9A6 2,80:1 (paracetamol, diazepam) y
    //          #7FB3D3 2,26:1 (amiodarona, cloroquina) sobre blanco; en oscuro, los dos azules 4,24:1.
    //          El color llega por `style={{ color: v.color }}` desde VD_EJEMPLOS: check:contraste-marca no lo ve
    await page.getByRole('button', { name: 'D Distribución' }).click();
    const valores = page.locator('[class*="vdValor"]');
    await expect(valores).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const r = await contrasteDe(valores.nth(i));
      expect(r, `${await valores.nth(i).innerText()}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('HALLAZGO ABIERTO [accesibilidad/medio]: «Cmax», «Tmax» y el pie del resultado no llegan a 4,5:1', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [accesibilidad/medio], el mismo que el anterior
    // ENTRADA  curva C-T y resultado de la calculadora, tema claro
    // ESPERADO ≥ 4,5:1
    // OBTENIDO «Cmax»/«Tmax» con fill #48A9A6 sobre #FAFAFA: 2,68:1; «(95% del fármaco · …)» blanco
    //          al 75 % de opacidad sobre --primary-boton: 3,85:1; «Tiempo estimado…» al 85 %: 4,45:1
    const cmax = page.getByRole('img', { name: /Curva concentración/ }).locator('text', { hasText: 'Cmax' });
    expect(await contrasteDe(cmax)).toBeGreaterThanOrEqual(4.5);
    await irAVidaMedia(page);
    const pie = panelResultado(page).locator('span').last();
    expect(await contrasteDe(pie)).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO ABIERTO [accesibilidad/bajo]: las pestañas declaran role="tab" sin el patrón de pestañas', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 05/11/2026) [accesibilidad/bajo]
    // ENTRADA  foco en la pestaña «Curva C-T» y flecha derecha
    // ESPERADO patrón WAI-ARIA de pestañas: la flecha pasa a «Vida media» y el contenido es un
    //          role="tabpanel" enlazado con aria-controls
    // OBTENIDO la selección no se mueve, no hay ningún tabpanel ni aria-controls
    await page.getByRole('tab', { name: /Curva C-T/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Vida media/ })).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
  });
});

import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-gelatina (segmento motor · Coquinum, riesgo 3)
 *
 * Primera inspección: 21/11/2026. La app promete en su <h1> «Calculadora de Sustitución de
 * Gelatina» y en el subtítulo «equivalencias precisas por bloom strength» entre hojas (bronce,
 * plata, oro, platino), polvo 200/250 y agar-agar. Hay verdad comprobable: la aritmética que la
 * propia página declara en su bloque educativo.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/cocina.ts → calcularSustitucionGelatina(tipo, cantidad, unidad):
 *     g_eq200 = g_origen × bloom_origen / 200 (agar: × 5) · g_destino = r1(g_eq200 × 200 / bloom)
 *     (agar: r1(g_eq200 / 5)) · hojas = r1(g_destino / pesoHoja), con r1 = redondeo a 0,1
 *   Lo comparte el MCP (app/api/mcp/route.ts, herramienta calcular_sustitucion_gelatina).
 *   app/calculadora-gelatina/page.tsx lee la cantidad con parseFloat(cantidad.replace(',', '.'))
 *   y, si no es > 0, sale sin decir nada.
 *
 * DATOS QUE DECLARA LA PÁGINA (bloque educativo y motor, iguales)
 *   bloom: bronce 120 · plata 160 · oro 200 · platino 250 · polvo 200 / 250
 *   peso de hoja: bronce ~1,7 g · plata ~2,3 g · oro ~2,5 g · platino ~1,7 g
 *   agar: «1 g de agar-agar ≈ 5 g de gelatina en polvo 200 bloom»
 *   ⚠️ El FAQPage del JSON-LD da otros pesos (3,3 / 2,5 / 2 / 1,7) y otro factor de agar
 *   («aproximadamente 1/3 o menos»): hallazgos A y B. Si al repararlos cambian los pesos o el
 *   factor del motor, cambian con ellos los esperados de los casos que dependen de ellos
 *   (marcados abajo).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/gelatina-esperados.mjs)
 *   CASO 1 (normal)
 *     Estado inicial, hoja de oro 5 g → bronce 5×200/120 = 8,33 → 8,3 g (8,3/1,7 = 4,9 hojas) ·
 *     plata 6,25 → 6,3 g (2,7 hojas) · platino 4 g (2,4 hojas) · polvo 200 5 g · polvo 250 4 g ·
 *     agar 5/5 = 1 g · «Tienes 5 g ≈ 2 hojas» (5/2,5)
 *     Hoja de oro, 4 hojas = 4 × 2,5 = 10 g → bronce 16,7 g (9,8 hojas) · plata 12,5 g (5,4) ·
 *     platino 8 g (4,7) · polvo 200 10 g · polvo 250 8 g · agar 2 g      [depende de los pesos]
 *   CASO 2 (límite)
 *     Agar-agar 2 g (el gelificante extremo) → eq200 = 10 → bronce 16,7 · plata 12,5 · oro 10 g
 *     (4 hojas) · platino 8 · polvo 200 10 · polvo 250 8; «Hojas» deshabilitado      [factor 5]
 *     Hoja de oro 1000 g → bronce 1666,7 g (980,4 hojas) · plata 1250 · platino 800 ·
 *     polvo 200 1000 · polvo 250 800 · agar 200 · «1000 g ≈ 400 hojas»
 *   CASO 3 (rechazo / lectura en español)
 *     «1,5» tecleado = 1,5 g de oro → bronce 2,5 · plata 1,875 → 1,9 · platino 1,2 · polvo 200 1,5 ·
 *     polvo 250 1,2 · agar 0,3
 *     «-5», «0» y vacío → ninguna equivalencia y un aviso
 *     «1.500» = mil quinientos (parseSpanishNumber) → bronce 2500 g; nunca 1,5 g
 *
 * HALLAZGOS del 21/11/2026 (los abiertos llevan test.fail())
 *   A. El FAQPage contradice al motor y a la página en el peso de cada hoja (oro 2 g frente a 2,5 g;
 *      bronce 3,3 g frente a 1,7 g): «1 hoja de oro = 2 g de polvo 200» en el FAQ, 2,5 g en la app.
 *   B. La «fórmula estándar» (proporción inversa al bloom), el factor 1:5 del agar y la tabla de
 *      bloom y pesos no citan fuente; el FAQ da otro factor de agar («aproximadamente 1/3»).
 *   C. Formato: todas las cifras con punto decimal («8.3 g», «≈ 4.9 hojas», «16666.7 g»).
 *   D. Cantidad negativa, cero o vacía: el botón no hace nada y no avisa; el parseo casero lee
 *      «1.500» como 1,5 g y acepta «1e3» = 1000 g.
 *   E. Cambiar de unidad no borra el resultado: con «5» en el campo y «Hojas» pulsado, sigue
 *      «Tienes 2 hojas» y las equivalencias de 5 g.
 *   F. La región aria-live del resultado nace con el resultado dentro, y el aviso fijo del agar
 *      va en role="alert".
 *   G. El JSON-LD promete una «guía sobre cuándo usar cada tipo según el postre: bavarois, panna
 *      cotta, mousses» que la página no tiene (bavarois no aparece).
 *   H. Redacción: «6,67%» sin espacio duro, «impiden que … gelificase», «≈ 1 hojas».
 */

test.use({ locale: 'es-ES' });

const RUTA = '/calculadora-gelatina/';
const INPUT = '#cantidad-input';

type Clave = 'bronce' | 'plata' | 'oro' | 'platino' | 'polvo200' | 'polvo250' | 'agar';

const CLAVES: [RegExp, Clave][] = [
  [/bronce/i, 'bronce'],
  [/platino/i, 'platino'],
  [/plata/i, 'plata'],
  [/oro/i, 'oro'],
  [/polvo 200/i, 'polvo200'],
  [/polvo 250/i, 'polvo250'],
  [/agar/i, 'agar'],
];

interface Tarjeta {
  nombre: string;
  gramos: string;
  hojas: string | null;
}

interface Resultado {
  tienes: string;
  tarjetas: Partial<Record<Clave, Tarjeta>>;
  aviso: string | null;
}

/** La zona de resultado de la app (no el anunciador de rutas de Next). */
function zonaResultado(page: Page): Locator {
  return page.locator('main [role="status"]');
}

/** Cifra de un texto de la app, con coma o punto decimal (el formato es el hallazgo C, no este). */
function cifra(texto: string | null | undefined): number {
  const m = (texto ?? '').match(/\d[\d.,]*/);
  if (!m) return NaN;
  let s = m[0].replace(/[.,]$/, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return Number(s);
}

/** Lee el resultado por su estructura (sin clases del módulo CSS). */
async function leerResultado(page: Page): Promise<Resultado> {
  const zona = zonaResultado(page);
  await expect(zona).toBeVisible();
  const bruto = await zona.evaluate((r) => {
    const limpio = (t: string | null | undefined): string => (t ?? '').replace(/\s+/g, ' ').trim();
    const h3s = Array.from(r.querySelectorAll('h3'));
    const tienes = h3s.find((h) => /tienes/i.test(h.textContent ?? ''))?.nextElementSibling;
    const eq = h3s.find((h) => limpio(h.textContent) === 'Equivalencias');
    const grid = eq?.nextElementSibling;
    const tarjetas = grid
      ? Array.from(grid.children).map((c) => ({
          nombre: limpio(c.children[0]?.children[0]?.textContent),
          gramos: limpio(c.children[1]?.children[0]?.textContent),
          hojas: c.children[1]?.children[1] ? limpio(c.children[1].children[1].textContent) : null,
        }))
      : [];
    const aviso = r.querySelector('[role="alert"]');
    return { tienes: limpio(tienes?.textContent), tarjetas, aviso: aviso ? limpio(aviso.textContent) : null };
  });
  const tarjetas: Partial<Record<Clave, Tarjeta>> = {};
  for (const t of bruto.tarjetas) {
    const clave = CLAVES.find(([re]) => re.test(t.nombre))?.[1];
    if (clave) tarjetas[clave] = t;
  }
  return { tienes: bruto.tienes, tarjetas, aviso: bruto.aviso };
}

async function elegirTipo(page: Page, nombre: RegExp): Promise<void> {
  const radio = page.getByRole('radio', { name: nombre });
  await radio.click();
  await expect(radio).toHaveAttribute('aria-checked', 'true');
}

async function elegirUnidad(page: Page, unidad: 'Gramos' | 'Hojas'): Promise<void> {
  const boton = page.getByRole('button', { name: unidad, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Una cantidad válida para el campo numérico, comprobando que llegó al estado de React. */
async function escribir(page: Page, valor: string): Promise<void> {
  await page.locator(INPUT).fill(valor);
  await esperarValorEnReact(page, INPUT, valor);
}

/** Teclea como un usuario (fill() no admite «1,5» en un input numérico). */
async function teclear(page: Page, texto: string): Promise<void> {
  const input = page.locator(INPUT);
  await input.click();
  await input.press('Control+a');
  await input.press('Backspace');
  await esperarValorEnReact(page, INPUT, '');
  await input.pressSequentially(texto);
}

async function pulsarCalcular(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Calcular equivalencias de gelatina' }).click();
}

/** Comprueba los gramos (y, si se dan, las hojas) de cada tarjeta. */
function comprobarTarjetas(
  r: Resultado,
  esperado: Partial<Record<Clave, [number, number?]>>,
): void {
  for (const [clave, [gramos, hojas]] of Object.entries(esperado) as [Clave, [number, number?]][]) {
    const t = r.tarjetas[clave];
    expect(t, `tarjeta ${clave}`).toBeDefined();
    expect(cifra(t?.gramos), `${clave}: gramos («${t?.gramos}»)`).toBeCloseTo(gramos, 1);
    if (hojas !== undefined) expect(cifra(t?.hojas), `${clave}: hojas («${t?.hojas}»)`).toBeCloseTo(hojas, 1);
  }
}

async function textoDelCuerpo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
}

async function ldDeTipo(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return hallado;
}

async function respuestaFaq(page: Page, pregunta: RegExp): Promise<string> {
  const faq = await ldDeTipo(page, 'FAQPage');
  const entradas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  const hallada = entradas.find((q) => pregunta.test(q.name));
  if (!hallada) throw new Error(`El FAQPage no trae ninguna pregunta que case con ${pregunta}`);
  return hallada.acceptedAnswer.text;
}

const leerDecimal = (s: string): number => Number(s.replace(',', '.'));

test.describe('calculadora-gelatina — Inspector 21/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [INPUT]);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · estado inicial (hoja de oro, 5 g): equivalencias en proporción inversa al bloom', async ({ page }) => {
    // g_destino = 5 × 200 / bloom_destino; agar = 5 / 5
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    expect(cifra(r.tienes)).toBeCloseTo(5, 1);
    comprobarTarjetas(r, {
      bronce: [8.3], // 1000 / 120 = 8,33
      plata: [6.3], // 1000 / 160 = 6,25 → 6,3
      platino: [4], // 1000 / 250
      polvo200: [5],
      polvo250: [4],
      agar: [1],
    });
    expect(r.tarjetas.oro, 'el origen no se repite entre las equivalencias').toBeUndefined();
    expect(r.aviso).toContain('El agar-agar gelifica a temperatura ambiente');
  });

  test('CASO 1 · hoja de oro, 4 hojas: las hojas salen de los pesos que declara la página', async ({ page }) => {
    // [depende de los pesos, hallazgo A] 4 × 2,5 = 10 g de oro → bronce 16,7 g / 1,7 = 9,8 hojas ·
    // plata 12,5 g / 2,3 = 5,4 · platino 8 g / 1,7 = 4,7 · polvo 200 10 g · polvo 250 8 g · agar 2 g
    await elegirUnidad(page, 'Hojas');
    await escribir(page, '4');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    expect(r.tienes).toBe('4 hojas');
    comprobarTarjetas(r, {
      bronce: [16.7, 9.8],
      plata: [12.5, 5.4],
      platino: [8, 4.7],
      polvo200: [10],
      polvo250: [8],
      agar: [2],
    });
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  test('CASO 2 · agar-agar 2 g (factor 1:5): 10 g de oro y la unidad «Hojas» deshabilitada', async ({ page }) => {
    // [factor 5, hallazgo B] eq200 = 2 × 5 = 10 → bronce 16,7 · plata 12,5 · oro 10 g (10 / 2,5 = 4 hojas) ·
    // platino 8 · polvo 200 10 · polvo 250 8
    await elegirTipo(page, /^Agar-Agar/);
    const hojas = page.getByRole('button', { name: 'Hojas', exact: true });
    await expect(hojas).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Gramos', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await escribir(page, '2');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    expect(cifra(r.tienes)).toBeCloseTo(2, 1);
    comprobarTarjetas(r, {
      bronce: [16.7],
      plata: [12.5],
      oro: [10, 4],
      platino: [8],
      polvo200: [10],
      polvo250: [8],
    });
    expect(r.tarjetas.agar).toBeUndefined();
    expect(r.aviso).toContain('No es un sustituto 1:1');
  });

  test('CASO 2 · hoja de oro 1000 g: la conversión escala sin perder decimales', async ({ page }) => {
    // 1000 × 200 / 120 = 1666,67 → 1666,7 g (/1,7 = 980,4 hojas) · 1250 · 800 · 1000 · 800 · agar 200
    await escribir(page, '1000');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    expect(cifra(r.tienes)).toBeCloseTo(1000, 1);
    expect(r.tienes).toMatch(/≈ 400 hojas$/);
    comprobarTarjetas(r, {
      bronce: [1666.7, 980.4],
      plata: [1250],
      platino: [800],
      polvo200: [1000],
      polvo250: [800],
      agar: [200],
    });
  });

  // ── CASO 3 · rechazo y lectura en español ─────────────────────────────────
  test('CASO 3 · «1,5» tecleado se lee 1,5 g', async ({ page }) => {
    // 1,5 × 200 / 120 = 2,5 · /160 = 1,875 → 1,9 · /250 = 1,2 · polvo 200 1,5 · polvo 250 1,2 · agar 0,3
    await teclear(page, '1,5');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    expect(cifra(r.tienes)).toBeCloseTo(1.5, 1);
    comprobarTarjetas(r, {
      bronce: [2.5],
      plata: [1.9],
      platino: [1.2],
      polvo200: [1.5],
      polvo250: [1.2],
      agar: [0.3],
    });
  });

  test('CASO 3 · «-5», «0» y vacío no producen equivalencias', async ({ page }) => {
    for (const valor of ['-5', '0', '']) {
      await escribir(page, valor);
      await pulsarCalcular(page);
      await expect(page.getByRole('heading', { name: 'Equivalencias', exact: true }), `«${valor}»`).toHaveCount(0);
      await expect(page.getByText('Tienes', { exact: true }), `«${valor}»`).toHaveCount(0);
    }
  });

  // HALLAZGO D (21/11/2026, ABIERTO): if (isNaN(num) || num <= 0) return; — sale sin avisar.
  test('CASO 3 · «-5», «0» y vacío avisan de que la cantidad no es válida', async ({ page }) => {
    test.fail(true, 'HALLAZGO D (ABIERTO): el botón no hace nada y no dice por qué');
    for (const valor of ['-5', '0', '']) {
      await escribir(page, valor);
      await pulsarCalcular(page);
      const aviso = page
        .locator('main')
        .locator('[role="alert"], [aria-live]')
        .filter({ hasText: /\S/ })
        .filter({ hasNotText: /agar/i });
      await expect(aviso.first(), `«${valor}»: aviso`).toBeVisible();
    }
  });

  // HALLAZGO D (21/11/2026, ABIERTO): parseFloat(cantidad.replace(',', '.')) lee «1.500» como 1,5
  // (check:parser: el canónico es parseSpanishNumber, que da 1500).
  test('CASO 3 · «1.500» se lee mil quinientos gramos, no 1,5 g', async ({ page }) => {
    test.fail(true, 'HALLAZGO D (ABIERTO): parseo casero, «1.500» → 1,5 g');
    await teclear(page, '1.500');
    await esperarValorEnReact(page, INPUT, '1.500');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    // 1500 × 200 / 120 = 2500 g de bronce. Obtenido: «Tienes 1.5 g ≈ 0.6 hojas», bronce 2.5 g
    expect(cifra(r.tienes)).toBeCloseTo(1500, 1);
    comprobarTarjetas(r, { bronce: [2500] });
  });

  // ── Formato español ────────────────────────────────────────────────────────
  // HALLAZGO C (21/11/2026, ABIERTO): formatCantidad interpola el número de JS y las hojas van crudas.
  test('Formato · las cifras llevan coma decimal y separador de millares español', async ({ page }) => {
    test.fail(true, 'HALLAZGO C (ABIERTO): «8.3 g», «≈ 4.9 hojas», «16666.7 g»');
    await pulsarCalcular(page);
    let r = await leerResultado(page);
    // Obtenido: «8.3 g» y «≈ 4.9 hojas»
    expect.soft(r.tarjetas.bronce?.gramos).toBe('8,3 g');
    expect.soft(r.tarjetas.bronce?.hojas).toBe('≈ 4,9 hojas');
    expect.soft(r.tarjetas.plata?.gramos).toBe('6,3 g');
    await escribir(page, '10000');
    await pulsarCalcular(page);
    r = await leerResultado(page);
    // 10000 × 200 / 120 = 16.666,7 g. Obtenido: «16666.7 g» y «≈ 9803.9 hojas»
    expect.soft(r.tarjetas.bronce?.gramos).toBe('16.666,7 g');
    expect.soft(r.tarjetas.bronce?.hojas).toBe('≈ 9803,9 hojas');
  });

  // ── Contenido: FAQPage frente al motor y la página ──────────────────────────
  // HALLAZGO A (21/11/2026, ABIERTO): el FAQPage dice que una hoja de oro pesa 2 g y equivale a 2 g
  // de polvo 200; el motor usa 2,5 g.
  test('FAQPage · «una hoja de oro equivale a N g de polvo 200» cuadra con lo que calcula la app', async ({ page }) => {
    test.fail(true, 'HALLAZGO A (ABIERTO): FAQ 2 g, app 2,5 g');
    const faq = await respuestaFaq(page, /hoja por gelatina en polvo/i);
    const m = faq.match(/una hoja de oro \((\d+(?:,\d+)?) g/i);
    expect(m, 'el FAQ da el peso de la hoja de oro').not.toBeNull();
    await elegirUnidad(page, 'Hojas');
    await escribir(page, '1');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    // Obtenido: polvo 200 = 2,5 g (1 × 2,5 × 200 / 200); el FAQ dice 2 g
    expect(cifra(r.tarjetas.polvo200?.gramos)).toBeCloseTo(leerDecimal(m?.[1] ?? 'NaN'), 1);
  });

  // HALLAZGO A (21/11/2026, ABIERTO): pesos de hoja del FAQPage (3,3 / 2,5 / 2 / 1,7) frente a los
  // del bloque educativo y el motor (1,7 / 2,3 / 2,5 / 1,7).
  test('FAQPage · los pesos de hoja son los mismos que en el bloque educativo', async ({ page }) => {
    test.fail(true, 'HALLAZGO A (ABIERTO): bronce 3,3 frente a 1,7; plata 2,5 frente a 2,3; oro 2 frente a 2,5');
    const faq = await respuestaFaq(page, /Cuántos gramos equivale una hoja/i);
    const delFaq: Record<string, number> = {};
    for (const m of faq.matchAll(/(bronce|plata|oro|platino)\D*?(\d+(?:,\d+)?)\s*g/gi)) {
      delFaq[m[1].toLowerCase()] = leerDecimal(m[2]);
    }
    const cuerpo = await textoDelCuerpo(page);
    const deLaPagina: Record<string, number> = {};
    for (const m of cuerpo.matchAll(/(Bronce|Plata|Oro|Platino) \(\d+ bloom\): hoja de ~(\d+(?:,\d+)?) g/g)) {
      deLaPagina[m[1].toLowerCase()] = leerDecimal(m[2]);
    }
    // Control: las dos fuentes traen los cuatro pesos
    expect(Object.keys(delFaq).sort()).toEqual(['bronce', 'oro', 'plata', 'platino']);
    expect(Object.keys(deLaPagina).sort()).toEqual(['bronce', 'oro', 'plata', 'platino']);
    expect(delFaq).toEqual(deLaPagina);
  });

  // HALLAZGO B (21/11/2026, ABIERTO): el FAQ dice que el agar es «aproximadamente 1/3 o menos» de la
  // gelatina; la página y el motor, 1 g de agar por 5 g de polvo 200.
  test('FAQPage · el factor del agar-agar es el mismo que usa la app', async ({ page }) => {
    test.fail(true, 'HALLAZGO B (ABIERTO): FAQ «1/3», app 1/5');
    await elegirTipo(page, /^Polvo 200 bloom/);
    await escribir(page, '10');
    await pulsarCalcular(page);
    const r = await leerResultado(page);
    // Control: 10 g de polvo 200 → 10 / 5 = 2 g de agar
    expect(cifra(r.tarjetas.agar?.gramos)).toBeCloseTo(2, 1);
    const factorApp = 10 / cifra(r.tarjetas.agar?.gramos);
    const faq = await respuestaFaq(page, /agar-agar puede sustituir/i);
    const m = faq.match(/1\s*\/\s*(\d+)/);
    const factorFaq = m ? Number(m[1]) : null;
    expect(factorFaq === null || factorFaq === factorApp, `FAQ 1/${factorFaq}, app 1/${factorApp}`).toBe(true);
  });

  // ── Operativa ──────────────────────────────────────────────────────────────
  // HALLAZGO E (21/11/2026, ABIERTO): setUnidad no borra el resultado (el tipo y la cantidad sí).
  test('Operativa · cambiar a «Hojas» no deja a la vista el resultado de los gramos', async ({ page }) => {
    test.fail(true, 'HALLAZGO E (ABIERTO): sigue «Tienes 2 hojas» con «5» en el campo de hojas');
    await pulsarCalcular(page);
    expect((await leerResultado(page)).tienes).toBe('5 g ≈ 2 hojas');
    await elegirUnidad(page, 'Hojas');
    await expect(page.locator(INPUT)).toHaveValue('5');
    // Esperado: resultado borrado o recalculado para 5 hojas (12,5 g). Obtenido: «Tienes 2 hojas»
    // y las equivalencias de 5 g (bronce 8.3 g)
    await expect(zonaResultado(page).getByText('2 hojas', { exact: true })).toHaveCount(0);
  });

  // ── Accesibilidad ──────────────────────────────────────────────────────────
  // HALLAZGO F (21/11/2026, ABIERTO): {resultado && <div role="status" aria-live>}: la región nace llena.
  test('A11y · la región aria-live existe antes de que llegue el resultado', async ({ page }) => {
    test.fail(true, 'HALLAZGO F (ABIERTO): 0 regiones aria-live en <main> antes de calcular');
    await expect(page.locator('main [aria-live]').first()).toBeAttached();
  });

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  test('JSON-LD · featureList con al menos 4 características', async ({ page }) => {
    const app = await ldDeTipo(page, 'WebApplication');
    const lista = app.featureList as string[];
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });

  // HALLAZGO G (21/11/2026, ABIERTO): «Guía sobre cuándo usar cada tipo según el postre: bavarois,
  // panna cotta, mousses» — la página no la tiene.
  test('JSON-LD · featureList no promete postres que la página no trata', async ({ page }) => {
    test.fail(true, 'HALLAZGO G (ABIERTO): «bavarois» solo está en el JSON-LD');
    const app = await ldDeTipo(page, 'WebApplication');
    const lista = (app.featureList as string[]).join(' ').toLowerCase();
    const cuerpo = (await textoDelCuerpo(page)).toLowerCase();
    for (const postre of ['bavarois', 'panna cotta', 'mousse']) {
      if (lista.includes(postre)) expect(cuerpo, postre).toContain(postre);
    }
  });

  // ── Redacción ──────────────────────────────────────────────────────────────
  // HALLAZGO H (21/11/2026, ABIERTO): «6,67%» (CLAUDE.md global §2, 25/09/2026), «gelificase» y
  // «≈ 1 hojas».
  test('Redacción · porcentaje con espacio, subjuntivo y singular de «hoja»', async ({ page }) => {
    test.fail(true, 'HALLAZGO H (ABIERTO): «6,67%», «gelificase», «≈ 1 hojas»');
    const cuerpo = await textoDelCuerpo(page);
    // textoDelCuerpo normaliza el espacio duro a espacio
    expect.soft(cuerpo).toContain('al 6,67 %');
    expect.soft(cuerpo).not.toContain('gelificase');
    // 2,5 g de hoja de oro = 2,5 / 2,5 = 1 hoja. Obtenido: «2.5 g ≈ 1 hojas»
    await escribir(page, '2.5');
    await pulsarCalcular(page);
    expect.soft((await leerResultado(page)).tienes).toMatch(/≈ 1 hoja$/);
  });
});

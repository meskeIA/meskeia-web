/**
 * Tabla de derivadas — buscador y fracciones (cabo C0591)
 *
 * Hermana de tabla-integrales, con el mismo buscador y el mismo componente Frac. Medido el
 * 03/11/2026 sobre el código: la consulta entera se buscaba como UNA subcadena seguida, así que
 *   · «sen x», «e^x», «x²» o «x sen» daban 0 fórmulas y el aviso de que no existe (forma 3937);
 *   · «tan» traía Constante (cons-TAN-te) y «sin» traía el coseno hiperbólico por la
 *     preposición de «derivada sin signo negativo» (forma 3938);
 *   · Frac apilaba numerador y denominador sin nada en medio: el lector leía «1 x²» (forma 3939).
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

const RUTA = '/tabla-derivadas/';
const BUSCADOR = '#buscador-derivadas';

async function buscar(page: Page, texto: string): Promise<string[]> {
  await page.locator(BUSCADOR).fill(texto);
  // El contador es la señal de que el filtro ya corrió.
  await expect(page.locator('[role="status"]').filter({ hasText: 'fórmulas' })).toBeVisible();
  return page.locator('li button[aria-expanded]').evaluateAll((botones) =>
    botones.map((b) => (b.querySelector('[class*="filaNombre"]')?.firstChild?.textContent ?? '').trim()),
  );
}

test.describe('tabla-derivadas — C0591', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [BUSCADOR]);
  });

  test('una fórmula escrita como en la tabla encuentra su fila, y la primera es la suya', async ({ page }) => {
    expect((await buscar(page, 'sen x'))[0]).toBe('Seno');
    expect(await buscar(page, 'x sen')).toContain('Seno');
    expect((await buscar(page, 'e^x'))[0]).toBe('Exponencial de base e');
    expect((await buscar(page, 'x^n'))[0]).toBe('Potencia');
    expect((await buscar(page, 'xⁿ'))[0]).toBe('Potencia');
    expect((await buscar(page, '1/x'))[0]).toBe('Inverso de x');
    expect((await buscar(page, '√x'))[0]).toBe('Raíz cuadrada');
    expect((await buscar(page, 'ln x'))[0]).toBe('Logaritmo neperiano');
    expect((await buscar(page, 'tan x'))[0]).toBe('Tangente');
    expect(await buscar(page, 'hiperbolico coseno')).toContain('Coseno hiperbólico');
  });

  test('«tan» y «sin» no casan dentro de otras palabras', async ({ page }) => {
    const tan = await buscar(page, 'tan');
    expect(tan).toContain('Tangente');
    expect(tan).not.toContain('Constante');
    expect(tan).not.toContain('Constante por función');
    const sin = await buscar(page, 'sin');
    expect(sin).toContain('Seno');
    expect(sin).not.toContain('Coseno hiperbólico');
  });

  test('lo que antes se encontraba se sigue encontrando', async ({ page }) => {
    expect(await buscar(page, 'raíz')).toContain('Raíz cuadrada');
    expect(await buscar(page, 'logaritmo')).toContain('Logaritmo neperiano');
    expect(await buscar(page, 'cociente')).toContain('Regla del cociente');
    expect(await buscar(page, 'arctan')).toContain('Arcotangente');
    expect(await buscar(page, 'zzz')).toEqual([]);
    await expect(page.getByText('No hay ninguna fórmula que coincida')).toBeVisible();
  });

  test('una fracción se anuncia con «entre» entre numerador y denominador', async ({ page }) => {
    await buscar(page, 'inverso de x');
    const fila = page.locator('li button[aria-expanded]').first();
    // La derivada de 1/x es −1/x²: el nombre accesible lleva «1 entre x²».
    const texto = (await fila.textContent())?.replace(/\s+/g, ' ') ?? '';
    expect(texto).toMatch(/1 entre x/);
    expect(texto).toMatch(/1 entre x²/);
  });
});

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 12/11/2026 — primera inspección (segmento interactiva)
 *
 * La verdad comprobable de una tabla de consulta son sus fórmulas y sus ejemplos. Cada esperado
 * de abajo se resolvió a mano ANTES de abrir la app:
 *   · arcsec′(x) = 1/(|x|·√(x² − 1)) → en x = 2: 1/(2·√3) = 1/3,4641 = 0,28868 ≈ 0,289
 *   · (2ˣ)′ = 2ˣ·ln 2 → en x = 0: ln 2 = 0,69315 ≈ 0,693
 *   · (log₁₀ x)′ = 1/(x·ln 10); ln 10 = 2,302585 y 1/ln 10 = 0,43429 ≈ 0,434
 *   · cotgh′(x) = −1/senh²x; senh 1 = (e − 1/e)/2 = 1,175201, senh²1 = 1,381098 → −0,72406
 *   · argcosh′(x) = 1/√(x² − 1) → en x = 2: 1/√3 = 0,57735 ≈ 0,577
 *   · ((x + 1)/(x − 1))′ = [1·(x − 1) − (x + 1)·1]/(x − 1)² = −2/(x − 1)²
 *   · (sen²(3x))′ = 2·sen(3x)·cos(3x)·3 = 3·sen(6x), porque sen 2θ = 2·sen θ·cos θ
 *   · arcsen(2x)′ = 2/√(1 − 4x²), con |2x| < 1, o sea |x| < 1/2
 *   · arccotg(x/2)′ = −(1/2)/(1 + x²/4) = −2/(4 + x²)
 *   · argtgh(x/2)′ = (1/2)/(1 − x²/4) = 2/(4 − x²), con |x/2| < 1, o sea |x| < 2
 * Las búsquedas, contra lib/buscadorTablas.ts: cada palabra de la consulta tiene que EMPEZAR una
 * palabra del índice (nombre + texto de la fórmula + sinónimos de `busqueda`); una letra sola,
 * SERLO. La derivada (f′) y el ejemplo NO están en el índice.
 *
 * Las fórmulas se leen en «texto plano» (sin el texto oculto para el lector, el superíndice
 * como ^(…) y la fracción como (n)/(d)), para que reparar la lectura de los superíndices no
 * mueva estos casos.
 *
 * HALLAZGOS 4560-4566, REPARADOS el 12/11/2026 (al final): «derivada de …» y los exponentes concretos en el
 * buscador; la versión con u que se promete «en cada fórmula elemental»; dos frases del texto
 * que la propia tabla contradice; la FAQ de memorizar escrita dos veces; los superíndices sin
 * «elevado a» para el lector de pantalla.
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const contador = (page: Page) => page.locator('[role="status"]').filter({ hasText: 'fórmulas' });

async function filasVisibles(page: Page): Promise<string[]> {
  return page.locator('li button[aria-expanded]').evaluateAll((botones) =>
    botones.map((b) => (b.querySelector('[class*="_filaNombre"]')?.firstChild?.textContent ?? '').trim()),
  );
}

/** Escribe en el buscador y espera a que el ESTADO de React lo tenga: el filtro ya corrió. */
async function consultar(page: Page, texto: string): Promise<string[]> {
  await page.locator(BUSCADOR).fill(texto);
  await esperarValorEnReact(page, BUSCADOR, texto);
  return filasVisibles(page);
}

/** Abre la fila `id` (el de DERIVADAS), si no lo está, y devuelve su panel de detalle. */
async function abrir(page: Page, id: string) {
  const boton = page.locator(`button[aria-controls="detalle-${id}"]`);
  if ((await boton.getAttribute('aria-expanded')) !== 'true') await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  return page.locator(`#detalle-${id}`);
}

/** La f′(x) de la fila, en texto plano: «n·x^(n−1)», «(1)/(√(1 − x²))». */
async function derivadaPlana(page: Page, id: string): Promise<string> {
  return page
    .locator(`button[aria-controls="detalle-${id}"] [class*="_exprDerivada"]`)
    .evaluate((raiz) => {
      const plano = (n: Node | null): string => {
        if (!n) return '';
        if (n.nodeType === Node.TEXT_NODE) return n.textContent ?? '';
        if (n.nodeType !== Node.ELEMENT_NODE) return '';
        const el = n as Element;
        if (el.classList.contains('sr-only')) return '';
        if (Array.from(el.classList).some((c) => /_frac$/.test(c))) {
          const num = el.querySelector(':scope > [class*="_fracNum"]');
          const den = el.querySelector(':scope > [class*="_fracDen"]');
          return `(${plano(num)})/(${plano(den)})`;
        }
        const dentro = Array.from(el.childNodes).map(plano).join('');
        return el.tagName === 'SUP' ? `^(${dentro})` : dentro;
      };
      return Array.from(raiz.childNodes).map(plano).join('').replace(/\s+/g, ' ').trim();
    });
}

/** Todas las aproximaciones «≈ n,nnn» de un texto, como números (menos tipográfico incluido). */
function aproximaciones(texto: string): number[] {
  return [...texto.matchAll(/≈\s*(−?\d+(?:,\d+)?)/g)].map((m) => Number(m[1].replace('−', '-').replace(',', '.')));
}

/** Las aproximaciones de los PASOS del ejemplo de la fila `id` (la justificación también tiene alguna). */
async function aproximacionesDelEjemplo(page: Page, id: string): Promise<number[]> {
  const detalle = await abrir(page, id);
  return aproximaciones((await detalle.locator('ol').textContent()) ?? '');
}

test.describe('tabla-derivadas — INSPECTOR 12/11/2026 (primera)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [BUSCADOR]);
  });

  test('CASO 1 (normal) · trigonométricas inversas: el filtro deja 6 y sus derivadas y ejemplos cuadran', async ({ page }) => {
    const filtro = page.getByRole('button', { name: 'Trigonométricas inversas', exact: true });
    await filtro.click();
    await expect(contador(page)).toHaveText('6 de 38 fórmulas');
    await expect(filtro).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Todas', exact: true })).toHaveAttribute('aria-pressed', 'false');
    expect(await filasVisibles(page)).toEqual([
      'Arcoseno', 'Arcocoseno', 'Arcotangente', 'Arcocotangente', 'Arcosecante', 'Arcocosecante',
    ]);

    expect(await derivadaPlana(page, 'arcsen')).toBe('(1)/(√(1 − x²))');
    expect(await derivadaPlana(page, 'arccos')).toBe('−(1)/(√(1 − x²))');
    expect(await derivadaPlana(page, 'arctan')).toBe('(1)/(1 + x²)');
    expect(await derivadaPlana(page, 'arcsec')).toBe('(1)/(|x|·√(x² − 1))');
    expect(await derivadaPlana(page, 'arccosec')).toBe('−(1)/(|x|·√(x² − 1))');

    // arcsen(2x): 2/√(1 − 4x²), solo si |x| < 1/2
    await expect(await abrir(page, 'arcsen')).toContainText('f′(x) = 2 / √(1 − 4x²), válido si |x| < 1/2');
    // arccotg(x/2): −2/(4 + x²)
    await expect(await abrir(page, 'arccotg')).toContainText('= −2 / (4 + x²)');
    // arcsec en x = 2: 1/(2√3) = 0,28868 → «≈ 0,289»
    await expect(await abrir(page, 'arcsec')).toContainText('f′(2) = 1 / (2√3) ≈ 0,289');
    expect(await aproximacionesDelEjemplo(page, 'arcsec')).toHaveLength(1);
    expect((await aproximacionesDelEjemplo(page, 'arcsec'))[0]).toBeCloseTo(1 / (2 * Math.sqrt(3)), 3);
    // arccosec en x = −2: la opuesta, −0,28868 → «≈ −0,289»
    const [aCosec] = await aproximacionesDelEjemplo(page, 'arccosec');
    expect(aCosec).toBeCloseTo(-1 / (2 * Math.sqrt(3)), 3);
  });

  test('CASO 1b (normal) · filas delicadas de otras familias: aˣ, logₐ, cotgh, argcosh, cociente y cadena', async ({ page }) => {
    expect(await derivadaPlana(page, 'potencia')).toBe('n·x^(n−1)');
    expect(await derivadaPlana(page, 'exp-a')).toBe('a^(x)·ln a');
    expect(await derivadaPlana(page, 'log-a')).toBe('(1)/(x·ln a)');
    expect(await derivadaPlana(page, 'tg')).toBe('(1)/(cos²x) = 1 + tg²x');
    expect(await derivadaPlana(page, 'coth')).toBe('−(1)/(senh²x)');
    expect(await derivadaPlana(page, 'argcosh')).toBe('(1)/(√(x² − 1))');
    expect(await derivadaPlana(page, 'argtanh')).toBe('(1)/(1 − x²)');
    expect(await derivadaPlana(page, 'regla-cociente')).toBe('(f′(x)·g(x) − f(x)·g′(x))/([g(x)]²)');

    // 2ˣ en x = 0: ln 2 = 0,69315 (las dos aproximaciones del ejemplo valen ln 2)
    const expA = await aproximacionesDelEjemplo(page, 'exp-a');
    expect(expA).toHaveLength(2);
    for (const v of expA) expect(v).toBeCloseTo(Math.LN2, 3);
    // log₁₀: ln 10 = 2,302585 y 1/ln 10 = 0,43429
    const logA = await aproximacionesDelEjemplo(page, 'log-a');
    expect(logA).toHaveLength(2);
    expect(logA[0]).toBeCloseTo(Math.LN10, 3);
    expect(logA[1]).toBeCloseTo(1 / Math.LN10, 3);
    // cotgh en x = 1: senh 1, senh²1 y −1/senh²1
    const coth = await aproximacionesDelEjemplo(page, 'coth');
    expect(coth).toHaveLength(3);
    expect(coth[0]).toBeCloseTo(Math.sinh(1), 3);
    expect(coth[1]).toBeCloseTo(Math.sinh(1) ** 2, 3);
    expect(coth[2]).toBeCloseTo(-1 / Math.sinh(1) ** 2, 3);
    // argcosh en x = 2: 1/√3
    const argcosh = await aproximacionesDelEjemplo(page, 'argcosh');
    expect(argcosh).toHaveLength(1);
    expect(argcosh[0]).toBeCloseTo(1 / Math.sqrt(3), 3);
    // Cociente y cadena: los resultados resueltos a mano
    await expect(await abrir(page, 'regla-cociente')).toContainText('f′(x) = −2 / (x − 1)², válido si x ≠ 1');
    await expect(await abrir(page, 'regla-cadena')).toContainText('= 3·sen(6x)');
  });

  test('CASO 2 (límite) · Hiperbólicas + «arg» deja 3 filas con dominio restringido; «arctan» casa por arctanh; Limpiar lo devuelve todo', async ({ page }) => {
    await page.getByRole('button', { name: 'Hiperbólicas', exact: true }).click();
    await expect(contador(page)).toHaveText('7 de 38 fórmulas');
    expect(await consultar(page, 'arg')).toEqual([
      'Argumento del seno hiperbólico',
      'Argumento del coseno hiperbólico',
      'Argumento de la tangente hiperbólica',
    ]);
    await expect(contador(page)).toHaveText('3 de 38 fórmulas');
    const condiciones = await page
      .locator('li button[aria-expanded] [class*="_condicionesBadge"]')
      .allTextContents();
    expect(condiciones).toEqual(['válida para todo x real', 'x > 1', '|x| < 1']);
    // argtgh(x/2) = 2/(4 − x²), con |x| < 2
    await expect(await abrir(page, 'argtanh')).toContainText('= 2 / (4 − x²), válido si |x| < 2');

    // Con el filtro puesto, «arctan» ya no trae el Arcotangente (otra categoría), solo el
    // sinónimo «arctanh» de la tangente hiperbólica inversa.
    expect(await consultar(page, 'arctan')).toEqual(['Argumento de la tangente hiperbólica']);

    await page.getByRole('button', { name: /Limpiar/ }).click();
    await expect(contador(page)).toHaveText('38 de 38 fórmulas');
    await expect(page.locator(BUSCADOR)).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Todas', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(BUSCADOR)).toBeFocused();
  });

  test('CASO 3 (rechazo) · «integral» no está en la tabla, y «senh» con el filtro de inversas tampoco', async ({ page }) => {
    // «integral» no es palabra de ningún índice (nombre, fórmula ni sinónimos): 0 y el aviso.
    expect(await consultar(page, 'integral')).toEqual([]);
    await expect(contador(page)).toHaveText('0 de 38 fórmulas');
    await expect(page.getByText('No hay ninguna fórmula que coincida con «integral»')).toBeVisible();

    // «senh» solo empieza una palabra del Seno hiperbólico, que no es trigonométrica inversa.
    await page.getByRole('button', { name: 'Trigonométricas inversas', exact: true }).click();
    expect(await consultar(page, 'senh')).toEqual([]);
    await expect(page.getByText('No hay ninguna fórmula que coincida con «senh»')).toBeVisible();
    await expect(page.getByText('quita el filtro de categoría')).toBeVisible();
    // Quitado el filtro, aparece: el vacío era el filtro, no la consulta.
    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    await expect(contador(page)).toHaveText('1 de 38 fórmulas');
    expect(await filasVisibles(page)).toEqual(['Seno hiperbólico']);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · «derivada de …» no encuentra 12 de las 38 filas', async ({ page }) => {
    // operativa, medio. La palabra «derivada» está en el índice de 26 filas y falta en 12
    // (Potencia, Constante por función, Inverso de x, Raíz n-ésima, las dos exponenciales,
    // ln|x|, los tres argumentos hiperbólicos, Derivación implícita y Derivación logarítmica:
    // «derivación» no empieza por «derivada»). Como TODAS las palabras tienen que casar, la
    // consulta más natural en una tabla de derivadas da 0 y el aviso de que no existe, u otra fila.
    // Hoy: 0 · solo «Logaritmo neperiano» · solo «Función identidad» · 0 · 0.
    expect(await consultar(page, 'derivada de la exponencial')).toContain('Exponencial de base e');
    expect((await consultar(page, 'derivada de e^x'))[0]).toBe('Exponencial de base e');
    expect(await consultar(page, 'derivada de 1/x')).toContain('Inverso de x');
    expect(await consultar(page, 'derivada de la potencia')).toContain('Potencia');
    expect(await consultar(page, 'derivada de la tangente hiperbolica')).toContain('Tangente hiperbólica');
  });

  test('HALLAZGO (12/11/2026, REPARADO) · un exponente concreto (x², 2^x) no encuentra su fila', async ({ page }) => {
    // operativa, bajo. El índice solo tiene la fórmula genérica (x^n, a^x): «x²» exige la
    // palabra «2», que no está en ninguna fila, y «x al cuadrado» casa con los sinónimos
    // «secante al cuadrado», «sech al cuadrado», «denominador al cuadrado»…
    // Hoy: 0 · Tangente, Cotangente, Tangente hiperbólica, Cotangente hiperbólica y Regla del
    // cociente, sin Potencia · 0 (y el ejemplo de la fila es justo 2ˣ).
    expect(await consultar(page, 'x²')).toContain('Potencia');
    expect(await consultar(page, 'x al cuadrado')).toContain('Potencia');
    expect(await consultar(page, '2^x')).toContain('Exponencial de base a');
  });

  test('HALLAZGO (12/11/2026, REPARADO) · la versión con u no está «en cada fórmula elemental», como prometen', async ({ page }) => {
    // contenido, medio. features del JSON-LD: «Versión con regla de la cadena (u′) en cada
    // fórmula elemental»; su description: «Cada fórmula incluye su versión con la regla de la
    // cadena»; la justificación de la Regla de la cadena: «En cada fila de esta tabla tienes la
    // versión con u ya preparada». Ocho fórmulas elementales no tienen el bloque, y dos de ellas
    // (argsenh, argtgh) lo usan en su propio ejemplo. Pasa con el bloque en las ocho o con la
    // promesa rebajada en los tres sitios.
    const sinCadena: string[] = [];
    for (const id of ['raiz-n', 'ln-abs', 'arcsec', 'arccosec', 'coth', 'argsenh', 'argcosh', 'argtanh']) {
      const detalle = await abrir(page, id);
      if ((await detalle.getByText('Con la regla de la cadena').count()) === 0) sinCadena.push(id);
    }
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    const justificacion = (await (await abrir(page, 'regla-cadena')).textContent()) ?? '';
    const promete =
      /en cada fórmula elemental|Cada fórmula incluye su versión con la regla de la cadena/.test(ld) ||
      /En cada fila de esta tabla tienes la versión con u/.test(justificacion);
    expect(
      sinCadena.length === 0 || !promete,
      `sin versión con u: ${sinCadena.join(', ')}; y se promete en cada fila`,
    ).toBe(true);
  });

  test('HALLAZGO (12/11/2026, REPARADO) · «Hiperbólicas: como las trigonométricas, pero sin el signo menos» lo contradice la tabla', async ({ page }) => {
    // contenido, bajo. La propia tabla da tgh′ = 1 − tgh²x (frente a tg′ = 1 + tg²x),
    // cotgh′ = −1/senh²x (el mismo menos que cotg′ = −1/sen²x) y argtgh′ = 1/(1 − x²) (frente a
    // arctg′ = 1/(1 + x²)): quien aplique el patrón a cotgh sacará +1/senh²x.
    await expect(page.locator('table tr').filter({ hasText: 'Hiperbólicas' })).not.toContainText('sin el signo menos', {
      timeout: 2000,
    });
  });

  test('HALLAZGO (12/11/2026, REPARADO) · la cotangente no es «decreciente en todo su dominio»', async ({ page }) => {
    // contenido, bajo. Decrece en cada intervalo (kπ, (k+1)π), no en ℝ \ {kπ}:
    // cotg(3π/4) = −1 < cotg(5π/4) = 1 con 3π/4 < 5π/4. La tabla lo dice bien de 1/x («tanto para
    // x > 0 como para x < 0») y de cotgh («en cada rama»).
    await expect(await abrir(page, 'cotg')).not.toContainText('decreciente en todo su dominio', { timeout: 2000 });
  });

  test('HALLAZGO (12/11/2026, REPARADO) · la FAQ de qué memorizar está escrita dos veces', async ({ page }) => {
    // contenido, bajo. FAQ visible «¿Hay que memorizar toda la tabla?» y FAQPage «¿Qué derivadas
    // hay que memorizar y cuáles se pueden consultar?»: la misma pregunta con dos redacciones de
    // la misma respuesta. check:faq-unica no la ve porque compara el texto de la pregunta.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((o) => o['@type'] === 'FAQPage') as
      | { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
      | undefined;
    const enLd = faq?.mainEntity.find((q) => /memorizar/.test(q.name));
    const visible = page.locator('[class*="_faqItem"]').filter({ has: page.locator('h4', { hasText: 'memorizar' }) });
    if (!enLd || (await visible.count()) === 0) return; // una sola: ya no está duplicada
    const respuesta = ((await visible.locator('p').first().textContent()) ?? '').replace(/\s+/g, ' ').trim();
    expect(respuesta).toBe(enLd.acceptedAnswer.text.replace(/\s+/g, ' ').trim());
  });

  test('HALLAZGO (12/11/2026, REPARADO) · el lector de pantalla lee «x n» y «n·x n−1»: el superíndice no dice «elevado a»', async ({ page }) => {
    // accesibilidad, bajo. La forma del hallazgo 3939 (la fracción leída «1 x²», reparada con
    // «entre» en C0591), ahora en <sup>: el nombre de la fila Potencia es «… f(x) xn f′(x) n·xn−1»,
    // que se oye como otra fórmula (n·x·n − 1). Igual en aˣ, eˣ, uⁿ…
    await expect(page.locator('button[aria-controls="detalle-potencia"]')).toHaveAccessibleName(
      /f\(x\) x\s*(elevado a|elevada a|a la)\s*n\b/,
      { timeout: 2000 },
    );
    await expect(page.locator('button[aria-controls="detalle-exp-a"]')).toHaveAccessibleName(
      /f\(x\) a\s*(elevado a|elevada a|a la)\s*x\b/,
      { timeout: 2000 },
    );
  });
});

import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * tabla-integrales — formulario para imprimir (semilla S0234, 28/10/2026)
 *
 * Quien teclea «tabla de integrales» (6.331 impresiones en 90 días, posición 5,4, CTR 0,93 %)
 * quiere la hoja: la búsqueda devuelve casi solo PDF. La app la imprime ahora en dos modos:
 *
 *   · completo → las 40 fórmulas y la regla de Barrow en UNA cara.
 *   · en blanco → la misma hoja con la primitiva vacía, y el solucionario en una SEGUNDA página.
 *
 * La promesa que se mide es la del texto de la sección: «en una sola cara, en tamaño Carta o
 * A4». Carta es más baja que A4 (279 frente a 297 mm) y es el formato de buena parte de
 * Latinoamérica, así que es la que decide. El margen es el del diálogo de Chrome por defecto
 * (~10 mm), y la hoja añade sus 8 mm propios (styles/impresion.module.css).
 *
 * Lo que NO mide: cómo se ve el papel. Eso lo valida el usuario en el navegador
 * (styles/CLAUDE.md); aquí solo se cuenta que no se desborde.
 */

const URL = '/tabla-integrales/';

/** Páginas de un PDF: cada página es un objeto /Type /Page (el árbol es /Pages). */
function contarPaginas(pdf: Buffer): number {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

async function imprimir(page: Page, formato: 'Letter' | 'A4'): Promise<number> {
  const pdf = await page.pdf({
    format: formato,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    printBackground: false,
  });
  return contarPaginas(pdf);
}

async function abrir(page: Page) {
  await page.goto(URL);
  await expect(page.getByRole('button', { name: 'Formulario completo' })).toBeVisible();
}

test.describe('Formulario para imprimir', () => {
  for (const formato of ['Letter', 'A4'] as const) {
    test(`completo: cabe en UNA cara en ${formato}`, async ({ page }) => {
      await abrir(page);
      expect(await imprimir(page, formato)).toBe(1);
    });

    test(`en blanco: hoja + solucionario son DOS páginas en ${formato}`, async ({ page }) => {
      await abrir(page);
      await page.getByRole('button', { name: 'En blanco, para practicar' }).click();
      await expect(page.getByRole('button', { name: /Imprimir hoja y solucionario/ })).toBeVisible();
      expect(await imprimir(page, formato)).toBe(2);
    });
  }

  test('la hoja lleva las 40 fórmulas más Barrow, y en blanco vacía todas menos las dos descriptivas', async ({ page }) => {
    await abrir(page);
    await page.emulateMedia({ media: 'print' });
    const hoja = page.locator('[data-hoja-formulario]');
    await expect(hoja).toBeVisible();
    // 40 de la tabla + la regla de Barrow
    await expect(hoja.locator('[class*="hojaFila"]')).toHaveCount(41);
    await expect(hoja.locator('[class*="hojaHueco"]')).toHaveCount(0);

    await page.emulateMedia({ media: 'screen' });
    await page.getByRole('button', { name: 'En blanco, para practicar' }).click();
    await page.emulateMedia({ media: 'print' });
    // Hoja (41 filas) + solucionario (41): 82, de las que 38 tienen hueco (40 − fracciones − cambios trig.)
    await expect(hoja.locator('[class*="hojaFila"]')).toHaveCount(82);
    await expect(hoja.locator('[class*="hojaHueco"]')).toHaveCount(38);
    await expect(hoja).toContainText('solucionario');
  });

  test('en pantalla la hoja no se ve y el resto de la app no sale por la impresora', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[data-hoja-formulario]')).toBeHidden();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#buscador-integrales')).toBeHidden();
    await expect(page.getByRole('heading', { name: /Formulario para imprimir/ })).toBeHidden();
  });

  test('los dos modos son un conmutador con aria-pressed', async ({ page }) => {
    await abrir(page);
    const completo = page.getByRole('button', { name: 'Formulario completo' });
    const blanco = page.getByRole('button', { name: 'En blanco, para practicar' });
    await expect(completo).toHaveAttribute('aria-pressed', 'true');
    await expect(blanco).toHaveAttribute('aria-pressed', 'false');
    await blanco.click();
    await expect(completo).toHaveAttribute('aria-pressed', 'false');
    await expect(blanco).toHaveAttribute('aria-pressed', 'true');
  });
});

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * INSPECCIÓN DEL 02/11/2026 (modo primera)
 *
 * La verdad comprobable de una tabla de integrales es que cada primitiva sea correcta. Las 40 se
 * comprobaron DERIVÁNDOLAS a mano antes de mirar la app (d/dx de la primitiva = integrando), con
 * sus condiciones (a ≠ 0, n ≠ −1, |·| en el logaritmo, |x| < 1 en arcsen…), y cada ejemplo resuelto
 * se rehízo hasta su resultado: las 40 y los 40 ejemplos están bien. El test «las 40 primitivas»
 * fija lo que se pinta, para que una edición que cambie un signo o un factor no pase en silencio.
 *
 * Lo que la inspección encontró mal (tests HALLAZGO, con test.fail() mientras sigan abiertos):
 *   · el buscador promete «fórmula» y no encuentra ninguna escrita como fórmula («sen x», «e^x»…);
 *   · «sin» y «tan» traen filas ajenas por casar dentro de otras palabras;
 *   · las fracciones no tienen lectura accesible: «2/3·x√x» se anuncia «2 3 ·x√x + C»;
 *   · el naranja #B45309 sobre su propio tinte se queda en 4,27-4,36:1;
 *   · cuatro preguntas de la FAQ están escritas dos veces (visible y JSON-LD);
 *   · la primitiva de «Fracciones simples», la unicidad de eˣ y la «tensión eficaz» como valor medio.
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const BUSCADOR = '#buscador-integrales';

async function cargar(page: Page): Promise<void> {
  await page.goto(URL);
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Escribe en el buscador y espera a que el estado de React lo tenga: la lista sale del mismo render. */
async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

const contador = (page: Page) => page.locator('p[role="status"]');
const filas = (page: Page) => page.locator('ul li button[aria-expanded]');
const filtro = (page: Page, nombre: string) => page.getByRole('button', { name: nombre, exact: true });
const filaDe = (page: Page, id: string) => page.locator(`button[aria-controls="detalle-${id}"]`);

/** El nombre de cada fila visible (el primer nodo de texto de su columna de nombre). */
async function nombresDeFilas(page: Page): Promise<string[]> {
  return filas(page).evaluateAll((els) =>
    els.map((b) => b.querySelector('span')?.childNodes[0]?.textContent?.trim() ?? ''),
  );
}

/**
 * Integral y primitiva de una fila como texto lineal: cada fracción pasa a «(num)/(den)», cada
 * superíndice a «^(…)» y cada subíndice a «_(…)». Es la forma de escribir aquí el esperado sin
 * depender de cómo pega textContent el numerador y el denominador (ver HALLAZGO de accesibilidad).
 */
async function formulasDeFila(page: Page, id: string): Promise<{ integral: string; primitiva: string }> {
  return filaDe(page, id).evaluate((boton) => {
    const linealizar = (el: Element): string => {
      const clon = el.cloneNode(true) as Element;
      // Fuera el texto solo para el lector («elevado a» dentro de cada <sup>, alcance del
      // hallazgo 4566 de tabla-derivadas): no es fórmula.
      for (const s of [...clon.querySelectorAll('.sr-only')]) s.remove();
      for (const s of [...clon.querySelectorAll('sup')]) s.replaceWith(`^(${s.textContent ?? ''})`);
      for (const s of [...clon.querySelectorAll('sub')]) s.replaceWith(`_(${s.textContent ?? ''})`);
      const esClase = (e: Element, nombre: string) =>
        [...e.classList].some((c) => new RegExp(`(^|_)${nombre}$`).test(c));
      const fracciones = [...clon.querySelectorAll('span')].filter((e) => esClase(e, 'frac')).reverse();
      for (const f of fracciones) {
        const num = [...f.children].find((e) => esClase(e, 'fracNum'))?.textContent ?? '';
        const den = [...f.children].find((e) => esClase(e, 'fracDen'))?.textContent ?? '';
        f.replaceWith(`(${num})/(${den})`);
      }
      return (clon.textContent ?? '').replace(/\s+/g, ' ').trim();
    };
    const expr = boton.querySelectorAll('[class*="expr"]');
    return { integral: linealizar(expr[0]), primitiva: linealizar(expr[1]) };
  });
}

/**
 * Las 40 filas, con su primitiva DERIVADA A MANO y la línea del ejemplo que lleva al resultado.
 * Entre paréntesis, la comprobación: derivar la primitiva devuelve el integrando.
 */
const TABLA: { id: string; integral: string; primitiva: string; ejemplo: string[] }[] = [
  // (kx)′ = k · 5x′ = 5
  { id: 'constante', integral: '∫ k dx', primitiva: 'k·x + C', ejemplo: ['∫ 5 dx = 5x + C'] },
  // (x + 3x²/2)′ = 1 + 3x
  { id: 'diferencial', integral: '∫ dx', primitiva: 'x + C', ejemplo: ['Total: x + 3x²/2 + C'] },
  // (x^(n+1)/(n+1))′ = xⁿ, n ≠ −1 · (x⁵/5 − x²)′ = x⁴ − 2x
  { id: 'potencia', integral: '∫ x^(n) dx', primitiva: '(x^(n+1))/(n + 1) + C', ejemplo: ['Resultado: x⁵/5 − x² + C'] },
  // (ln|x|)′ = 1/x en los dos semiejes · (ln|3x² + 4|)′ = 6x/(3x² + 4)
  { id: 'potencia-menos-uno', integral: '∫ x^(−1) dx = ∫ (dx)/(x)', primitiva: 'ln|x| + C', ejemplo: ['Resultado: ln|3x² + 4| + C'] },
  // ((2/3)x^(3/2))′ = x^(1/2)
  { id: 'raiz-cuadrada', integral: '∫ √x dx', primitiva: '(2)/(3)·x√x + C', ejemplo: ['= (2/3)·x^(3/2) + C'] },
  // (2√x)′ = 1/√x · (√(2x + 1))′ = 2/(2√(2x + 1)) = 1/√(2x + 1)
  { id: 'inversa-raiz', integral: '∫ (dx)/(√x)', primitiva: '2√x + C', ejemplo: ['Resultado: √(2x + 1) + C'] },
  // (−1/x)′ = 1/x² · (−3/x)′ = 3/x²
  { id: 'inversa-cuadrado', integral: '∫ (dx)/(x²)', primitiva: '−(1)/(x) + C', ejemplo: ['= −3/x + C'] },
  // ((ax + b)^(n+1)/(a(n+1)))′ = (ax + b)ⁿ · ((3x − 2)⁵/15)′ = 5·3(3x − 2)⁴/15 = (3x − 2)⁴
  { id: 'binomio-lineal', integral: '∫ (ax + b)^(n) dx', primitiva: '((ax + b)^(n+1))/(a(n + 1)) + C', ejemplo: ['Resultado: (3x − 2)⁵ / 15 + C'] },
  // (e^(5x)/5)′ = e^(5x)
  { id: 'exp-e', integral: '∫ e^(x) dx', primitiva: 'e^(x) + C', ejemplo: ['Resultado: e^(5x)/5 + C'] },
  // (aˣ/ln a)′ = aˣ, a > 0, a ≠ 1 · ln 3 = 1,098612…
  { id: 'exp-a', integral: '∫ a^(x) dx', primitiva: '(a^(x))/(ln a) + C', ejemplo: ['∫ 3ˣ dx = 3ˣ / ln 3 + C', `ln 3 ≈ ${(Math.log(3)).toLocaleString('es-ES', { maximumFractionDigits: 4 })}`] },
  // (x ln x − x)′ = ln x + 1 − 1 = ln x
  { id: 'ln', integral: '∫ ln x dx', primitiva: 'x·ln x − x + C', ejemplo: ['= x·ln x − x + C'] },
  // log_a x = ln x/ln a · ln 10 = 2,302585…
  { id: 'log-a', integral: '∫ log_(a) x dx', primitiva: '(x·ln x − x)/(ln a) + C', ejemplo: ['∫ log₁₀ x dx = (x·ln x − x) / ln 10 + C', `ln 10 ≈ ${(Math.log(10)).toLocaleString('es-ES', { maximumFractionDigits: 4 })}`] },
  // (eˣ(x − 1))′ = eˣ(x − 1) + eˣ = x·eˣ
  { id: 'x-por-exp', integral: '∫ x·e^(x) dx', primitiva: 'e^(x)(x − 1) + C', ejemplo: ['= eˣ·x ✓ coincide con el integrando'] },
  // (−cos x)′ = sen x · (−cos(4x)/4)′ = sen(4x)
  { id: 'sen', integral: '∫ sen x dx', primitiva: '−cos x + C', ejemplo: ['Resultado: −cos(4x)/4 + C'] },
  // (sen(πx)/π)′ = cos(πx)
  { id: 'cos', integral: '∫ cos x dx', primitiva: 'sen x + C', ejemplo: ['Resultado: sen(πx)/π + C'] },
  // (tg x)′ = 1/cos²x · (tg(3x)/3)′ = 1/cos²(3x)
  { id: 'sec-cuadrado', integral: '∫ (dx)/(cos²x)', primitiva: 'tg x + C', ejemplo: ['Resultado: tg(3x)/3 + C'] },
  // (−cotg x)′ = 1/sen²x · (−2cotg(x/2))′ = −2·(−1/sen²(x/2))·(1/2) = 1/sen²(x/2)
  { id: 'cosec-cuadrado', integral: '∫ (dx)/(sen²x)', primitiva: '−cotg x + C', ejemplo: ['Resultado: −2·cotg(x/2) + C'] },
  // (−ln|cos x|)′ = sen x/cos x
  { id: 'tg', integral: '∫ tg x dx', primitiva: '−ln|cos x| + C', ejemplo: ['Resultado: −ln|cos x| + C (equivale a ln|sec x| + C)'] },
  // (ln|sen x|)′ = cotg x · ((1/2)ln|sen 2x|)′ = (1/2)·2cos 2x/sen 2x = cotg 2x
  { id: 'cotg', integral: '∫ cotg x dx', primitiva: 'ln|sen x| + C', ejemplo: ['Resultado: (1/2)·ln|sen(2x)| + C'] },
  // (1/cos x)′ = sen x/cos²x = sec x·tg x
  { id: 'sec-tg', integral: '∫ sec x · tg x dx', primitiva: 'sec x + C', ejemplo: ['= (1/cos x)·(sen x/cos x) = sec x·tg x ✓'] },
  // (−1/sen x)′ = cos x/sen²x = cosec x·cotg x
  { id: 'cosec-cotg', integral: '∫ cosec x · cotg x dx', primitiva: '−cosec x + C', ejemplo: ['= (1/sen x)·(cos x/sen x) = cosec x·cotg x ✓'] },
  // (x/2 − sen 2x/4)′ = (1 − cos 2x)/2 = sen²x · entre 0 y π: π/2 = 1,570796…
  { id: 'sen-cuadrado', integral: '∫ sen²x dx', primitiva: '(x)/(2) − (sen(2x))/(4) + C', ejemplo: [`Resultado: π/2 ≈ ${(Math.PI / 2).toLocaleString('es-ES', { maximumFractionDigits: 4 })}`] },
  // (x/2 + sen 2x/4)′ = (1 + cos 2x)/2 = cos²x
  { id: 'cos-cuadrado', integral: '∫ cos²x dx', primitiva: '(x)/(2) + (sen(2x))/(4) + C', ejemplo: ['= x + C', 'Coincide con ∫ 1 dx ✓'] },
  // (ln|sec x + tg x|)′ = (sec x tg x + sec²x)/(sec x + tg x) = sec x
  { id: 'sec', integral: '∫ sec x dx', primitiva: 'ln|sec x + tg x| + C', ejemplo: ['(ln|u|)′ = u′/u = sec x ✓'] },
  // (arcsen x)′ = 1/√(1 − x²), |x| < 1 · ((1/3)arcsen 3x)′ = 1/√(1 − 9x²)
  { id: 'arcsen-basica', integral: '∫ (dx)/(√(1 − x²))', primitiva: 'arcsen x + C', ejemplo: ['Resultado: (1/3)·arcsen(3x) + C, válido si |x| < 1/3'] },
  // (arctg x)′ = 1/(1 + x²) · entre 0 y 1: π/4 = 0,785398…
  { id: 'arctan-basica', integral: '∫ (dx)/(1 + x²)', primitiva: 'arctg x + C', ejemplo: [`Resultado: π/4 ≈ ${(Math.PI / 4).toLocaleString('es-ES', { maximumFractionDigits: 4 })}`] },
  // (arcsen(x/a))′ = (1/a)/√(1 − x²/a²) = 1/√(a² − x²), a > 0
  { id: 'arcsen-a', integral: '∫ (dx)/(√(a² − x²))', primitiva: 'arcsen (x)/(a) + C', ejemplo: ['∫ dx/√(9 − x²) = arcsen(x/3) + C', 'Válido si |x| < 3'] },
  // ((1/a)arctg(x/a))′ = (1/a²)/(1 + x²/a²) = 1/(a² + x²)
  { id: 'arctan-a', integral: '∫ (dx)/(a² + x²)', primitiva: '(1)/(a)·arctg (x)/(a) + C', ejemplo: ['∫ dx/(4 + x²) = (1/2)·arctg(x/2) + C'] },
  // (ln(x + √(x² + a²)))′ = (1 + x/√)/(x + √) = 1/√(x² + a²)
  { id: 'log-raiz-suma', integral: '∫ (dx)/(√(x² + a²))', primitiva: 'ln|x + √(x² + a²)| + C', ejemplo: ['Resultado: ln|x + √(x² + 4)| + C'] },
  // la misma cuenta con −a², válida en x > a y en x < −a gracias al |·|
  { id: 'log-raiz-resta', integral: '∫ (dx)/(√(x² − a²))', primitiva: 'ln|x + √(x² − a²)| + C', ejemplo: ['Resultado: ln|x + √(x² − 9)| + C', 'Válido si |x| > 3'] },
  // 1/(x² − a²) = (1/2a)[1/(x − a) − 1/(x + a)]
  { id: 'fraccion-diferencia-cuadrados', integral: '∫ (dx)/(x² − a²)', primitiva: '(1)/(2a)·ln|(x − a)/(x + a)| + C', ejemplo: ['Resultado: (1/4)·ln|(x − 2)/(x + 2)| + C'] },
  // (cosh x)′ = senh x · (cosh 3x/3)′ = senh 3x
  { id: 'senh', integral: '∫ senh x dx', primitiva: 'cosh x + C', ejemplo: ['Resultado: cosh(3x)/3 + C'] },
  // (senh x)′ = cosh x · entre 0 y 1: senh 1 = 1,175201…
  { id: 'cosh', integral: '∫ cosh x dx', primitiva: 'senh x + C', ejemplo: [`Resultado ≈ ${Math.sinh(1).toLocaleString('es-ES', { maximumFractionDigits: 4 })}`] },
  // (tgh x)′ = 1/cosh²x · (tgh 2x/2)′ = 1/cosh² 2x
  { id: 'sech-cuadrado', integral: '∫ (dx)/(cosh²x)', primitiva: 'tgh x + C', ejemplo: ['Resultado: tgh(2x)/2 + C'] },
  // (−cotgh x)′ = 1/senh²x, x ≠ 0
  { id: 'cosech-cuadrado', integral: '∫ (dx)/(senh²x)', primitiva: '−cotgh x + C', ejemplo: ['= 1/senh²x ✓'] },
  // (ln cosh x)′ = senh x/cosh x, sin |·| porque cosh x ≥ 1
  { id: 'tgh', integral: '∫ tgh x dx', primitiva: 'ln(cosh x) + C', ejemplo: ['= tgh x ✓'] },
  // (sen x²)′ = 2x·cos x²
  { id: 'metodo-sustitucion', integral: '∫ f(u(x))·u′(x) dx', primitiva: '∫ f(u) du = F(u(x)) + C', ejemplo: ['Deshacemos el cambio: sen(x²) + C'] },
  // (−x cos x + sen x)′ = −cos x + x sen x + cos x = x sen x
  { id: 'metodo-por-partes', integral: '∫ u dv', primitiva: 'u·v − ∫ v du', ejemplo: ['Resultado: −x·cos x + sen x + C'] },
  // 1/(x(x − 1)) = −1/x + 1/(x − 1)
  { id: 'metodo-fracciones', integral: '∫ (P(x))/(Q(x)) dx', primitiva: 'suma de logaritmos y arcotangentes + C', ejemplo: ['Resultado: −ln|x| + ln|x − 1| + C = ln|(x − 1)/x| + C'] },
  // (arcsen x/2 + x√(1 − x²)/2)′ = 1/(2√) + (1 − 2x²)/(2√) = √(1 − x²)
  { id: 'metodo-trigonometricas', integral: '∫ R(x, √(a² ± x²)) dx', primitiva: 'integral trigonométrica tras el cambio', ejemplo: ['Deshaciendo: (arcsen x)/2 + (x·√(1 − x²))/2 + C'] },
];

test.describe('Las 40 primitivas y sus ejemplos', () => {
  test('cada fila pinta la integral y la primitiva derivadas a mano, y su ejemplo llega al resultado', async ({ page }) => {
    await cargar(page);
    await expect(contador(page)).toHaveText('40 de 40 fórmulas');
    await expect(filas(page)).toHaveCount(TABLA.length);
    for (const fila of TABLA) {
      expect.soft(await formulasDeFila(page, fila.id), fila.id).toEqual({
        integral: fila.integral,
        primitiva: fila.primitiva,
      });
      await filaDe(page, fila.id).click();
      await expect(filaDe(page, fila.id)).toHaveAttribute('aria-expanded', 'true');
      const pasos = page.locator(`#detalle-${fila.id} ol`);
      for (const linea of fila.ejemplo) await expect.soft(pasos, fila.id).toContainText(linea);
    }
  });
});

test.describe('Buscador', () => {
  test('CASO 1 (normal) · «arcotangente» da sus dos filas y el ejemplo llega a (1/2)·arctg(x/2) + C', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'arcotangente');
    // «arcotangente» solo está en el texto de búsqueda de las dos filas del tipo arcotangente
    await expect(contador(page)).toHaveText('2 de 40 fórmulas');
    expect(await nombresDeFilas(page)).toEqual(['Tipo arcotangente básico', 'Tipo arcotangente con parámetro a']);
    const fila = filaDe(page, 'arctan-a');
    await expect(fila).toHaveAttribute('aria-expanded', 'false');
    await fila.click();
    await expect(fila).toHaveAttribute('aria-expanded', 'true');
    // a² = 4 → a = 2; (1/a)·arctg(x/a) = (1/2)·arctg(x/2); al derivar, (1/2)(1/2)/(1 + x²/4) = 1/(4 + x²)
    const detalle = page.locator('#detalle-arctan-a');
    await expect(detalle).toContainText('∫ dx/(4 + x²) = (1/2)·arctg(x/2) + C');
    await expect(detalle).toContainText('(1/2)·(1/2)/(1 + x²/4) = 1/(4 + x²)');

    // «1/x»: desde el buscador por palabras (hallazgo 3937) casan las filas que tienen «1» y «x»
    // como palabras (4), pero la PRIMERA es la que lleva «1/x» seguido en su fórmula: el caso
    // n = −1, ln|x| + C. Antes, por subcadena, era la única.
    await buscar(page, '1/x');
    expect((await nombresDeFilas(page))[0]).toBe('Caso especial n = −1');
    expect((await formulasDeFila(page, 'potencia-menos-uno')).primitiva).toBe('ln|x| + C');
  });

  test('CASO 2 (límite) · tildes y mayúsculas dan lo mismo, «sin» encuentra el seno y el filtro se combina con la búsqueda', async ({ page }) => {
    await cargar(page);
    // «raíz» está en el nombre de 4 filas y en el texto de búsqueda de 3 (arcsen ×2 y sustituciones trig.)
    const conRaiz = [
      'Raíz cuadrada',
      'Inverso de la raíz',
      'Tipo arcoseno básico',
      'Tipo arcoseno con parámetro a',
      'Raíz de x² + a² (tipo logarítmico)',
      'Raíz de x² − a² (tipo logarítmico)',
      'Sustituciones trigonométricas',
    ];
    for (const termino of ['RAÍZ', 'raiz', 'Raiz']) {
      await buscar(page, termino);
      await expect(contador(page)).toHaveText('7 de 40 fórmulas');
      expect(await nombresDeFilas(page), termino).toEqual(conRaiz);
    }

    // «sin» es sinónimo declarado del seno
    await buscar(page, 'sin');
    expect(await nombresDeFilas(page)).toContain('Seno');

    // «seno» en las 40: 8. Desde el hallazgo 3937 casa con las palabras que EMPIEZAN por «seno»,
    // no con «coseno» por dentro (por subcadena eran 16: traía la tangente por «ln coseno» y la
    // secante por «uno partido coseno»). Coseno sigue, porque su texto dice que «da seno». Con
    // Trigonométricas, 5.
    await buscar(page, 'seno');
    await expect(contador(page)).toHaveText('8 de 40 fórmulas');
    // El emoji del filtro va con aria-hidden: el nombre accesible es solo el texto
    await filtro(page, 'Trigonométricas').click();
    await expect(filtro(page, 'Trigonométricas')).toHaveAttribute('aria-pressed', 'true');
    await expect(filtro(page, 'Todas')).toHaveAttribute('aria-pressed', 'false');
    await expect(contador(page)).toHaveText('5 de 40 fórmulas');
    expect(await nombresDeFilas(page)).toEqual([
      'Seno',
      'Coseno',
      'Cuadrado de la cosecante',
      'Cotangente',
      'Seno al cuadrado',
    ]);
  });

  test('CASO 3 (rechazo) · lo que no casa con nada dice «sin resultados», y Limpiar lo devuelve todo', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'zzz');
    await expect(contador(page)).toHaveText('0 de 40 fórmulas');
    await expect(filas(page)).toHaveCount(0);
    await expect(page.locator('[class*="sinResultados"]')).toContainText('No hay ninguna fórmula que coincida con «zzz»');

    // senh es hiperbólica: con el filtro de Trigonométricas no hay ninguna, y el aviso dice cómo salir
    await buscar(page, 'senh');
    await filtro(page, 'Trigonométricas').click();
    await expect(contador(page)).toHaveText('0 de 40 fórmulas');
    await expect(page.locator('[class*="sinResultados"]')).toContainText('quita el filtro de categoría');

    await page.getByRole('button', { name: /Limpiar/ }).click();
    await expect(page.locator(BUSCADOR)).toHaveValue('');
    await expect(contador(page)).toHaveText('40 de 40 fórmulas');
    await expect(filtro(page, 'Todas')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(BUSCADOR)).toBeFocused();
  });

  test('teclado · foco en el buscador al cargar, Tab a Limpiar y a los filtros, Enter y Espacio abren y cierran la fila', async ({ page }) => {
    await cargar(page);
    await expect(page.locator(BUSCADOR)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Limpiar/ })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(filtro(page, 'Todas')).toBeFocused();
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    await expect(filtro(page, 'Métodos de integración')).toBeFocused();
    await page.keyboard.press('Tab');
    const primera = filaDe(page, 'constante');
    await expect(primera).toBeFocused();
    await expect(primera).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(primera).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#detalle-constante')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(primera).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#detalle-constante')).toHaveCount(0);
  });
});

for (const ancho of [390, 360]) {
  test.describe(`Móvil a ${ancho} px`, () => {
    test.use({
      viewport: { width: ancho, height: 800 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });

    test('con las 40 filas abiertas ninguna fórmula ni ejemplo desborda en horizontal', async ({ page }) => {
      await cargar(page);
      for (const fila of TABLA) await filaDe(page, fila.id).click();
      await expect(page.locator('ul li button[aria-expanded="true"]')).toHaveCount(40);
      const medida = await page.evaluate(() => {
        const ancho = document.documentElement.clientWidth;
        const fuera = [...document.querySelectorAll('ul li *')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && (r.right > ancho + 0.5 || r.left < -0.5);
          })
          .map((e) => (e.textContent ?? '').trim().slice(0, 40));
        return { ancho, scroll: document.documentElement.scrollWidth, fuera };
      });
      expect(medida.fuera).toEqual([]);
      expect(medida.scroll).toBeLessThanOrEqual(medida.ancho);
    });
  });
}

test.describe('Contraste de la tabla en los dos temas', () => {
  for (const tema of ['claro', 'oscuro'] as const) {
    test(`fórmulas, categoría, etiquetas y condiciones llegan a 4,5:1 en ${tema}`, async ({ page }) => {
      await cargar(page);
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
      // Medido el 02/11/2026: claro 5,15 · 4,95 · 5,10 · 4,89 — oscuro 4,93 · 5,30 · 4,96 · 6,26
      for (const selector of ['[class*="expr"]', '[class*="condicionesBadge"]', '[class*="filaCategoria"]', '[class*="etq"]']) {
        const elementos = page.locator(selector);
        const n = await elementos.count();
        let peor = Infinity;
        for (let i = 0; i < n; i++) peor = Math.min(peor, await contrasteSobreFondoReal(elementos.nth(i)));
        expect(peor, selector).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('Hallazgos de la inspección del 02/11/2026', () => {
  test('REPARADO 3937 · el buscador encuentra una integral escrita como fórmula', async ({ page }) => {
    // La etiqueta dice «Busca una integral por nombre, fórmula o palabra suelta» y la feature del
    // JSON-LD «por nombre, expresión y sinónimos». Cada fila casaba la consulta ENTERA como
    // subcadena de su nombre + texto de búsqueda, y ese texto no llevaba notación: «sen x»,
    // «e^x», «√x», «∫ sen x dx» (copiado de la propia tabla) y «arcotangente parametro» (palabras
    // en otro orden) daban «0 de 40» y el aviso «No hay ninguna fórmula que coincida». Ahora casa
    // palabra a palabra con el texto de la integral (la receta de tabla-derivadas, C0591).
    await cargar(page);
    const casos: [string, string][] = [
      ['sen x', 'Seno'],
      ['e^x', 'Exponencial de base e'],
      ['√x', 'Raíz cuadrada'],
      ['∫ sen x dx', 'Seno'],
      ['arcotangente parametro', 'Tipo arcotangente con parámetro a'],
    ];
    for (const [termino, fila] of casos) {
      await buscar(page, termino);
      expect.soft(await nombresDeFilas(page), termino).toContain(fila);
    }
  });

  test('REPARADO 3938 · «sin» y «tan» ya no traen filas que no tienen seno ni tangente', async ({ page }) => {
    // «sin» casaba con «sin signo negativo» (Coseno, Coseno hiperbólico) y «sin valor absoluto»
    // (Tangente hiperbólica); «tan» casaba dentro de «constante». Eran «sin» → 6 filas, «tan» → 13.
    await cargar(page);
    await buscar(page, 'sin');
    const conSin = await nombresDeFilas(page);
    for (const ajena of ['Coseno', 'Coseno hiperbólico', 'Tangente hiperbólica']) expect.soft(conSin, 'sin').not.toContain(ajena);
    await buscar(page, 'tan');
    expect.soft(await nombresDeFilas(page), 'tan').not.toContain('Constante');
  });

  test('REPARADO 3939 · las fracciones se leen con «entre»: 2/3·x√x ya no se anuncia «2 3 ·x√x»', async ({ page }) => {
    // Frac pintaba numerador y denominador en dos <span> apilados sin nada que dijera «entre»: el
    // nombre accesible de la fila era «… Primitiva 2 3 ·x√x + C», «− 1 x + C» para −1/x y
    // «1 2a ·ln| x − a x + a | + C». Ahora lleva un «entre» oculto a la vista.
    await cargar(page);
    await expect.soft(filaDe(page, 'raiz-cuadrada')).toHaveAccessibleName(/2\s*(\/|entre|partido|sobre)\s*3|dos tercios/i);
    await expect.soft(filaDe(page, 'inversa-cuadrado')).toHaveAccessibleName(/1\s*(\/|entre|partido|sobre)\s*x/i);
    await expect.soft(filaDe(page, 'fraccion-diferencia-cuadrados')).toHaveAccessibleName(/1\s*(\/|entre|partido|sobre)\s*\(?\s*2\s*a/i);
  });

  test('REPARADO 3940 (C0592) · el naranja sobre su propio tinte llega a 4,5:1 en claro', async ({ page }) => {
    // .avisoConstante strong («Toda primitiva lleva + C.», 16 px negrita) sobre rgba(224,122,31,.1):
    // 4,36:1 · .warningHeader («Errores comunes que cuestan puntos», 17,6 px a 600) y .warningList
    // strong sobre rgba(224,122,31,.08): 4,27:1. Ninguno es texto grande: piden 4,5:1. Los tres
    // pasan a var(--naranja-texto, #B45309); el primero lo ve ya check:semanticos-claro (C0592),
    // los otros dos dependen de un antecesor que solo existe en el DOM y los mide este test.
    await cargar(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    for (const selector of ['[class*="avisoConstante"] strong', '[class*="warningHeader"] h3', '[class*="warningList"] li strong']) {
      const elementos = page.locator(selector);
      const n = await elementos.count();
      let peor = Infinity;
      for (let i = 0; i < n; i++) peor = Math.min(peor, await contrasteSobreFondoReal(elementos.nth(i)));
      expect.soft(peor, selector).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · cuatro preguntas de la FAQ están escritas dos veces, con redacciones distintas', async ({ page }) => {
    // «+ C», «1/x», «primitiva elemental» y «por partes» están en la FAQ visible y en el faqJsonLd
    // con pregunta y respuesta redactadas por separado. Va en UNA constante (check:faq-unica).
    test.fail();
    await cargar(page);
    const jsonLd = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const datos = JSON.parse(s.textContent ?? '{}');
        if (datos['@type'] === 'FAQPage') {
          return (datos.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => ({
            pregunta: q.name,
            respuesta: q.acceptedAnswer.text,
          }));
        }
      }
      return [];
    });
    const visible = await page.locator('[class*="faqItem"]').evaluateAll((els) =>
      els.map((e) => ({
        pregunta: (e.querySelector('h4')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        respuesta: (e.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      })),
    );
    for (const tema of ['+ C', '1/x', 'primitiva elemental', 'por partes']) {
      const enJson = jsonLd.find((q) => q.pregunta.includes(tema));
      const enPagina = visible.find((q) => q.pregunta.includes(tema));
      if (enJson && enPagina) expect.soft(enPagina, tema).toEqual(enJson);
    }
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · la primitiva de «Fracciones simples» calla los términos racionales de las raíces múltiples', async ({ page }) => {
    // «suma de logaritmos y arcotangentes + C» no vale con raíces múltiples: ∫ dx/(x − 1)² = −1/(x − 1) + C
    // (ni logaritmo ni arcotangente) y ∫ dx/(x² + 1)² = x/(2(x² + 1)) + (1/2)·arctg x + C. La propia
    // justificación lo dice («las raíces múltiples aportan potencias»); la fila y la hoja impresa, no.
    test.fail();
    await cargar(page);
    expect((await formulasDeFila(page, 'metodo-fracciones')).primitiva).toMatch(/racional|fracci|potencia/i);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · «eˣ es la única función elemental» que es su propia derivada: también lo es k·eˣ', async ({ page }) => {
    // f′ = f tiene por soluciones f(x) = k·eˣ para cualquier constante k (2eˣ es elemental y su propia
    // derivada). La unicidad vale «salvo un factor constante», que la frase no dice.
    test.fail();
    await cargar(page);
    await filaDe(page, 'exp-e').click();
    const texto = (await page.locator('#detalle-exp-e p').first().textContent()) ?? '';
    if (/única/.test(texto)) {
      expect(texto).toMatch(/salvo (un|una) (factor|constante multiplicativa)|múltiplo|proporcional|k·eˣ|k·e\^x|c·eˣ/i);
    }
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · la tensión eficaz no es el valor medio de la tensión', async ({ page }) => {
    // La tarjeta «Valores medios» dice que el valor medio (integral entre la longitud del intervalo)
    // «es como se calcula la tensión eficaz». Para v = V₀·sen(ωt), el valor medio en un periodo es 0
    // y el eficaz es V₀/√2 (230 V eficaces son 325 V de pico): es la RAÍZ del valor medio del CUADRADO.
    test.fail();
    await cargar(page);
    const tarjeta = page.locator('[class*="scenarioCard"]').filter({ hasText: 'Valores medios' });
    const texto = (await tarjeta.textContent()) ?? '';
    if (/eficaz/.test(texto)) expect(texto).toMatch(/cuadrado|cuadrática|raíz/i);
  });
});

// Alcance del hallazgo 4566 de tabla-derivadas (12/11/2026): sin texto oculto, el lector de
// pantalla pegaba el exponente a su base («∫ xn dx», «xn+1»). Y el límite superior de la integral
// definida no es un exponente: «desde a hasta b».
test('4566 (alcance) · el superíndice se anuncia «elevado a» y los límites de ∫ «desde … hasta»', async ({ page }) => {
  await page.goto('/tabla-integrales/');
  await expect(page.locator('button[aria-controls="detalle-potencia"]')).toHaveAccessibleName(/∫ x elevado a n dx/);
  await expect(page.locator('button[aria-controls="detalle-exp-e"]')).toHaveAccessibleName(/e elevado a x/);
  await expect(page.getByText(/f\(x\) dx = F\(b\) − F\(a\)/)).toHaveText(/∫\s*desde\s*a\s*hasta\s*b f\(x\) dx/);
});

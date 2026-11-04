import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * tabla-areas-volumenes — material de apoyo de Stemum (buscador + 48 filas desplegables)
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════
 * INSPECCIÓN DEL 03/11/2026 (modo primera)
 *
 * La verdad comprobable de la tabla son sus fórmulas y sus ejemplos resueltos. Las 48 figuras se
 * repasaron a mano ANTES de abrir la app: cada fórmula contra su deducción (Pitágoras, apotema,
 * escala de sólidos platónicos, integrales de revolución) y cada ejemplo rehecho hasta el último
 * decimal. 45 de los 48 ejemplos están bien y todas las fórmulas son correctas (la del área lateral
 * de la pirámide, solo con base regular); el test «las 48 figuras» fija lo que se pinta para que un
 * cambio de signo o de factor no pase en silencio.
 *
 * El 04/11/2026 (/reparar) se repararon la zona esférica (3996), la pirámide (3997 y 3998), el
 * buscador (4000) y las fracciones (4001): sus tests ya no llevan test.fail().
 *
 * Lo que la inspección encontró mal (tests HALLAZGO, con test.fail() mientras sigan abiertos):
 *   · tronco de cono: A_lat = π·8·√40 = 158,95 cm² y el ejemplo dice 158,90;
 *   · zona esférica: con r = 10, a = 8 y b = 6 los planos distan 2 o 14 cm, nunca los 5 del ejemplo;
 *   · pirámide: A_b = 43 cm² es el pentágono regular de lado 5 y P_b = 30 cm el de lado 6; con
 *     h = 9 la apotema no puede valer 10. Y la fila dice «base cualquiera» con fórmulas de base regular;
 *   · pirámide cuadrangular: llama «arista» a la apotema de la cara (5 m frente a 5,83 m);
 *   · el buscador no encuentra «volumen del cono», «área de la esfera» ni «volumen del cilindro»,
 *     que son palabras clave de su propia metadata;
 *   · las fracciones no tienen lectura accesible: el volumen del cono se anuncia «π·r²·h 3»;
 *   · el aviso «Promediar las bases» dice que el volumen sale corto: promediar lo da LARGO;
 *   · «resultado clásico que ya demostró Arquímedes»: lo demostró Eudoxo (lo cuenta el propio Arquímedes);
 *   · dos preguntas de la FAQ escritas dos veces; y el % separado con espacio normal, no duro.
 * ════════════════════════════════════════════════════════════════════════════════════════════
 */

const URL = '/tabla-areas-volumenes/';
const BUSCADOR = '#buscador-figuras';
const TOTAL = 48;

/** Número en formato español con dos decimales, sin agrupar (lo que pinta Intl con 4 cifras). */
const fmt2 = (x: number): string =>
  x.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** «10», «6,5» → número. Sin el parseo casero de reemplazar la coma por punto. */
function numeroEs(texto: string): number {
  const [entero, decimales = ''] = texto.split(',');
  return Number(entero) + (decimales ? Number(decimales) / 10 ** decimales.length : 0);
}

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
const pasosDe = (page: Page, id: string) => page.locator(`#detalle-${id} ol`);

/** El nombre de cada fila visible (el primer nodo de texto de su columna de nombre). */
async function nombresDeFilas(page: Page): Promise<string[]> {
  return filas(page).evaluateAll((els) =>
    els.map((b) => b.querySelector('span')?.childNodes[0]?.textContent?.trim() ?? ''),
  );
}

/**
 * Fórmula principal y secundaria de una fila como texto lineal: cada fracción pasa a «(num)/(den)».
 * Es la forma de escribir aquí el esperado sin depender de cómo pega textContent el numerador y el
 * denominador (ver HALLAZGO de accesibilidad).
 */
async function formulasDeFila(page: Page, id: string): Promise<string[]> {
  return filaDe(page, id).evaluate((boton) => {
    const esClase = (e: Element, nombre: string) =>
      [...e.classList].some((c) => new RegExp(`(^|_)${nombre}$`).test(c));
    const linealizar = (el: Element): string => {
      const clon = el.cloneNode(true) as Element;
      const fracciones = [...clon.querySelectorAll('span')].filter((e) => esClase(e, 'frac')).reverse();
      for (const f of fracciones) {
        const num = [...f.children].find((e) => esClase(e, 'fracNum'))?.textContent ?? '';
        const den = [...f.children].find((e) => esClase(e, 'fracDen'))?.textContent ?? '';
        f.replaceWith(`(${num})/(${den})`);
      }
      return (clon.textContent ?? '').replace(/\s+/g, ' ').trim();
    };
    return [...boton.querySelectorAll('span')].filter((e) => esClase(e, 'expr')).map(linealizar);
  });
}

/**
 * Las 48 filas: fórmula principal y secundaria (lineales) y la línea del ejemplo que lleva al
 * resultado. En el comentario, la comprobación hecha a mano. Las filas con un HALLAZGO en su
 * ejemplo (zona esférica y pirámide) no fijan el ejemplo aquí: lo miden sus tests de abajo.
 */
const TABLA: { id: string; formulas: string[]; ejemplo: string[] }[] = [
  // a = 3,5: a² = 12,25 · d = 3,5·√2 = 4,9497
  { id: 'cuadrado', formulas: ['a²', '4·a'], ejemplo: ['A = 3,5² = 12,25 m²', 'd = 3,5 · 1,4142 = 4,95 m'] },
  // 6 × 4: √52 = 7,2111
  { id: 'rectangulo', formulas: ['b·h', '2·(b + h)'], ejemplo: ['P = 2 · (6 + 4) = 20 m', 'd = √(36 + 16) = √52 ≈ 7,21 m'] },
  // b = 8, h = 4 → 32; P = 2·13 = 26 (h = 4 ≤ c = 5: existe)
  { id: 'paralelogramo', formulas: ['b·h', '2·(b + c)'], ejemplo: ['P = 2 · (8 + 5) = 26 cm', 'A = 8 · 4 = 32 cm²'] },
  // D·d/2 = 30 · a = √(5² + 3²) = √34 = √136/2 = 5,8310
  { id: 'rombo', formulas: ['(D·d)/(2)', '4·a'], ejemplo: ['A = (10 · 6) / 2 = 30 cm²', 'a = √(100 + 36) / 2 = √136 / 2 ≈ 5,83 cm'] },
  // (8 + 5)/2 · 4 = 26
  { id: 'trapecio', formulas: ['(B + b)/(2)·h', 'B + b + c + d'], ejemplo: ['A = 6,5 · 4 = 26 cm²'] },
  // 10·4/2 + 10·3/2 = 35
  { id: 'trapezoide', formulas: ['(e·(h₁ + h₂))/(2)', 'suma de los 4 lados'], ejemplo: ['A = 20 + 15 = 35 m²'] },
  // 12·5/2 = 30
  { id: 'triangulo', formulas: ['(b·h)/(2)', 'a + b + c'], ejemplo: ['A = 30 cm²'] },
  // h = 6·√3/2 = 5,196 · A = 36·√3/4 = 15,588
  { id: 'triangulo-equilatero', formulas: ['(a²·√3)/(4)', '3·a'], ejemplo: ['h = 6 · 0,8660 = 5,20 cm', 'A = 36 · 1,7321 / 4 = 15,59 cm²'] },
  // 3-4-5
  { id: 'triangulo-rectangulo', formulas: ['(a·b)/(2)', '√(a² + b²)'], ejemplo: ['c = √(9 + 16) = √25 = 5 m', 'A = (3 · 4) / 2 = 6 m²'] },
  // s = 21; 21·8·7·6 = 7.056 = 84² · h = 2·84/14 = 12
  { id: 'heron', formulas: ['√(s(s−a)(s−b)(s−c))', 's = (a + b + c)/(2)'], ejemplo: ['A = √7.056 = 84 m²', 'h = 2 · 84 / 14 = 12 m'] },
  // ap = 4/(2·tg 22,5°) = 4,8284 · A = 32·4,8284/2 = 77,2548
  { id: 'poligono-regular', formulas: ['(P·ap)/(2)', 'n·ℓ'], ejemplo: ['ap = 4 / (2 · tg 22,5°) = 4 / (2 · 0,4142) = 4,83 cm', 'A = (32 · 4,83) / 2 = 77,25 cm²'] },
  // 3√3/2 · 25 = 64,9519
  { id: 'hexagono', formulas: ['(3·√3)/(2)·a²', '6·a'], ejemplo: ['A = 2,5981 · 25 = 64,95 cm²'] },
  // 5·36/(4·tg 36°) = 61,9372
  { id: 'pentagono', formulas: ['≈ 1,7205·a²', '5·a'], ejemplo: ['ap = 6 · 0,6882 = 4,13 cm', 'A = (30 · 4,13) / 2 = 61,94 cm²'] },
  // 6π = 18,8496 · 9π = 28,2743
  { id: 'circulo', formulas: ['π·r²', '2·π·r'], ejemplo: ['L = 2 · π · 3 = 18,85 m', 'A = π · 3² = π · 9 = 28,27 m²'] },
  // 8π = 25,1327 · 4π + 8 = 20,5664
  { id: 'semicirculo', formulas: ['(π·r²)/(2)', 'π·r + 2·r'], ejemplo: ['A = π · 16 / 2 = 25,13 m²', 'P = 12,57 + 8 = 20,57 m'] },
  // s = 2π = 6,2832 · A = 6π = 18,8496 · P = 18,2832
  { id: 'sector-circular', formulas: ['π·r²·(α)/(360)', '2·π·r·(α)/(360)'], ejemplo: ['A = π · 36 · (60/360) = 18,85 cm²', 'P = 6,28 + 12 = 18,28 cm'] },
  // 12,5·(π/2 − 1) = 7,1350
  { id: 'segmento-circular', formulas: ['(r²)/(2)·(θ − sen θ)', '2·r·sen(θ/2)'], ejemplo: ['A = 7,13 cm²'] },
  // 39π = 122,5221
  { id: 'corona-circular', formulas: ['π·(R² − r²)', '2·π·(R + r)'], ejemplo: ['A = 122,52 cm²'] },
  // 24π = 75,3982 · π·(30 − √396) = 31,7309
  { id: 'elipse', formulas: ['π·a·b', 'aproximación de Ramanujan'], ejemplo: ['A = π · 6 · 4 = 75,40 cm²', 'P ≈ π · 10,10 = 31,73 cm'] },
  // 4³ = 64 · 4√3 = 6,9282
  { id: 'cubo', formulas: ['a³', '6·a²'], ejemplo: ['V = 4³ = 64 cm³', 'D = 4 · 1,7321 = 6,93 cm'] },
  // 5·4·3 = 60 · 2·(20 + 15 + 12) = 94 · √50 = 7,0711
  { id: 'ortoedro', formulas: ['a·b·c', '2·(a·b + a·c + b·c)'], ejemplo: ['A_tot = 2 · (20 + 15 + 12) = 94 m²', 'D = √(25 + 16 + 9) = √50 ≈ 7,07 m'] },
  // base 3-4-5: A_b = 6, P_b = 12 → 120, 132, 60
  { id: 'prisma-recto', formulas: ['A_b·h', 'P_b·h'], ejemplo: ['A_tot = 120 + 2 · 6 = 132 cm²', 'V = 6 · 10 = 60 cm³'] },
  // lados √(1,5² + 2²) = 2,5 → coherente · (2,5 + 3 + 2,5)·6 = 48
  { id: 'prisma-triangular', formulas: ['(b·h_t)/(2)·L', '(a + b + c)·L'], ejemplo: ['V = 3 · 6 = 18 m³', 'A_lat = (2,5 + 3 + 2,5) · 6 = 48 m²'] },
  // 3√3/2 · 4 · 9 = 93,5307
  { id: 'prisma-hexagonal', formulas: ['(3·√3)/(2)·a²·h', '6·a·h'], ejemplo: ['V = 10,39 · 9 = 93,53 cm³'] },
  // fórmulas bien; el ejemplo es un HALLAZGO (abajo)
  { id: 'piramide', formulas: ['(A_b·h)/(3)', '(P_b·ap)/(2)'], ejemplo: [] },
  // ap = √(16 + 9) = 5 · 36·4/3 = 48
  { id: 'piramide-cuadrangular', formulas: ['(a²·h)/(3)', '2·a·ap'], ejemplo: ['A_lat = 2 · 6 · 5 = 60 m²; A_tot = 60 + 36 = 96 m²', 'V = (36 · 4) / 3 = 48 m³'] },
  // 3/3·(36 + 16 + √576) = 76
  { id: 'tronco-piramide', formulas: ['(h)/(3)·(A_B + A_b + √(A_B·A_b))', '((P_B + P_b)·ap)/(2)'], ejemplo: ['V = 76 m³'] },
  // √3·36 = 62,3538 · 216·√2/12 = 18√2 = 25,4558
  { id: 'tetraedro', formulas: ['(a³·√2)/(12)', '√3·a²'], ejemplo: ['A = 1,7321 · 36 = 62,35 cm²', 'V = 25,46 cm³'] },
  // 2√3·25 = 86,6025 · √2/3·125 = 58,9256
  { id: 'octaedro', formulas: ['(√2)/(3)·a³', '2·√3·a²'], ejemplo: ['A = 3,4641 · 25 = 86,60 cm²', 'V = 58,93 cm³'] },
  // 3√(25 + 10√5)·9 = 185,8116 · (15 + 7√5)/4·27 = 206,9042
  { id: 'dodecaedro', formulas: ['≈ 7,6631·a³', '≈ 20,6457·a²'], ejemplo: ['A = 20,6457 · 9 = 185,81 cm²', 'V = 206,90 cm³'] },
  // 5√3·16 = 138,5641 · 5/12·(3 + √5)·64 = 139,6285
  { id: 'icosaedro', formulas: ['≈ 2,1817·a³', '5·√3·a²'], ejemplo: ['A = 8,6603 · 16 = 138,56 cm²', 'V = 139,63 cm³'] },
  // π·0,25·1,2 = 0,94248 m³ · 2π·0,5·1,2 = 3,7699
  { id: 'cilindro', formulas: ['π·r²·h', '2·π·r·h'], ejemplo: ['V = π · 0,25 · 1,2 = 0,9425 m³', '0,9425 m³ · 1.000 = 942,5 litros', 'A_lat = 2 · π · 0,5 · 1,2 = 3,77 m²'] },
  // 1.100π = 3.455,7519 · 2.500π = 7.853,9816
  { id: 'cilindro-hueco', formulas: ['π·(R² − r²)·h', 'π·r²·h'], ejemplo: ['V_material = 3.455,75 cm³', 'Capacidad interior = π · 25 · 100 = 7.853,98 cm³ ≈ 7,85 litros'] },
  // g = 5 · 15π = 47,1239 · 24π = 75,3982 · 12π = 37,6991
  { id: 'cono', formulas: ['(π·r²·h)/(3)', 'π·r·g'], ejemplo: ['g = √(9 + 16) = √25 = 5 m', 'A_lat = π · 3 · 5 = 47,12 m²; A_tot = π · 3 · 8 = 75,40 m²', 'V = π · 9 · 4 / 3 = 37,70 m³'] },
  // 2π·49 = 307,8761 (el A_lat es un HALLAZGO, abajo)
  { id: 'tronco-cono', formulas: ['(π·h)/(3)·(R² + r² + R·r)', 'π·(R + r)·g'], ejemplo: ['V = 307,88 cm³'] },
  // 144π = 452,3893 · 288π = 904,7787
  { id: 'esfera', formulas: ['(4)/(3)·π·r³', '4·π·r²'], ejemplo: ['A = 4 · π · 36 = 452,39 cm²', 'V = 904,78 cm³'] },
  // 80π = 251,3274 · π·16·26/3 = 435,6342
  { id: 'casquete-esferico', formulas: ['π·h²·(r − (h)/(3))', '2·π·r·h'], ejemplo: ['A_curva = 2 · π · 10 · 4 = 251,33 cm²', 'V = 435,63 cm³'] },
  // fórmulas bien; el ejemplo es un HALLAZGO (abajo)
  { id: 'zona-esferica', formulas: ['(π·h)/(6)·(3a² + 3b² + h²)', '2·π·r·h'], ejemplo: [] },
  // 162π = 508,9380 · a = √45 = 6,7082 · 9π·12,7082 = 359,316
  { id: 'sector-esferico', formulas: ['(2)/(3)·π·r²·h', 'π·r·(2·h + a)'], ejemplo: ['V = 508,94 cm³', 'A = π · 9 · (6 + 6,71) = 359,3 cm²'] },
  // 4π²·80 = 3.158,2734 · 2π²·320 = 6.316,5468
  { id: 'toro', formulas: ['2·π²·R·r²', '4·π²·R·r'], ejemplo: ['A = 39,478 · 20 · 4 = 3.158,27 cm²', 'V = 6.316,55 cm³'] },
  // 80π = 251,3274
  { id: 'elipsoide', formulas: ['(4)/(3)·π·a·b·c', 'si a = b = c queda la esfera'], ejemplo: ['V = 251,33 cm³'] },
  // π·0,5 + π/6 = 2,0944 m³
  { id: 'capsula', formulas: ['π·r²·h + (4)/(3)·π·r³', '2·π·r·h + 4·π·r²'], ejemplo: ['V = 1,5708 + 0,5236 = 2,094 m³ ≈ 2.094 litros'] },
  // 24π + 4π = 28π = 87,9646
  { id: 'silo', formulas: ['π·r²·h₁ + (π·r²·h₂)/(3)', '2·π·r·h₁ + π·r·g'], ejemplo: ['Cono: π · 4 · 3 / 3 = 12,57 m³', 'V = 87,96 m³'] },
  // 13 − (1,64 + 1,32) = 10,04 · 10,04·2/10 = 2,008
  { id: 'pared-huecos', formulas: ['A_pared − Σ A_huecos', 'A_neta / rendimiento'], ejemplo: ['A_neta = 13 − 2,96 = 10,04 m²'] },
  // 288 + 96 = 384 · 2·√20·12 = 107,33
  { id: 'casa-dos-aguas', formulas: ['a·L·h + (a·h_c)/(2)·L', '2·L·√((a/2)² + h_c²)'], ejemplo: ['V = 384 m³', 'Faldón: √(16 + 4) = 4,47 m → cubierta = 2 · 4,47 · 12 = 107,3 m² de teja'] },
  // 1,6·10·5 = 80
  { id: 'piscina-variable', formulas: ['(p₁ + p₂)/(2)·L·A', 'L·A'], ejemplo: ['V = 80 m³', '80 m³ = 80.000 litros'] },
  // 240 − 40 = 200 · 2·(20 + 12) = 64
  { id: 'parcela-l', formulas: ['A_grande − A_esquina', 'igual al del rectángulo envolvente'], ejemplo: ['A = 240 − 40 = 200 m²', 'P = 2 · (20 + 12) = 64 m'] },
  // 2.000 + 400π = 3.256,6371 · 100 + 40π = 225,6637
  { id: 'pista-estadio', formulas: ['b·h + π·r²', '2·b + 2·π·r'], ejemplo: ['A = 3.256,64 m²', 'P = 2 · 50 + 2 · π · 20 = 100 + 125,66 = 225,66 m'] },
];

test.describe('Las 48 figuras', () => {
  test('cada fila pinta su fórmula principal y secundaria comprobadas a mano, y su ejemplo llega al resultado', async ({ page }) => {
    await cargar(page);
    await expect(contador(page)).toHaveText(`${TOTAL} de ${TOTAL} figuras`);
    await expect(filas(page)).toHaveCount(TABLA.length);
    for (const fila of TABLA) {
      expect.soft(await formulasDeFila(page, fila.id), fila.id).toEqual(fila.formulas);
      await filaDe(page, fila.id).click();
      await expect(filaDe(page, fila.id)).toHaveAttribute('aria-expanded', 'true');
      for (const linea of fila.ejemplo) await expect.soft(pasosDe(page, fila.id), fila.id).toContainText(linea);
    }
  });
});

test.describe('Buscador', () => {
  test('CASO 1 (normal) · «cono» da sus 4 filas y el ejemplo del cono r = 3, h = 4 llega a 47,12 · 75,40 · 37,70', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'cono');
    // «cono» está en el nombre de Cono, Tronco de cono y Silo, y en el texto de búsqueda del sector
    // esférico («cono más casquete»). No casa con hexágono ni pentágono («-gono»).
    await expect(contador(page)).toHaveText(`4 de ${TOTAL} figuras`);
    expect(await nombresDeFilas(page)).toEqual(['Cono', 'Tronco de cono', 'Sector esférico', 'Silo (cilindro + cono)']);
    const fila = filaDe(page, 'cono');
    await expect(fila).toHaveAttribute('aria-expanded', 'false');
    await fila.click();
    await expect(fila).toHaveAttribute('aria-expanded', 'true');
    // A mano: g = √(3² + 4²) = 5 · A_lat = π·r·g = 15π · A_tot = π·r·(g + r) = 24π · V = π·r²·h/3 = 12π
    const r = 3;
    const h = 4;
    const g = Math.hypot(r, h);
    const pasos = pasosDe(page, 'cono');
    await expect(pasos).toContainText(`= ${g} m`);
    await expect(pasos).toContainText(`A_lat = π · 3 · 5 = ${fmt2(Math.PI * r * g)} m²`);
    await expect(pasos).toContainText(`A_tot = π · 3 · 8 = ${fmt2(Math.PI * r * (g + r))} m²`);
    await expect(pasos).toContainText(`= ${fmt2((Math.PI * r * r * h) / 3)} m³`);
    // y las fórmulas del detalle: la generatriz, no la altura, en el área lateral
    const detalle = page.locator('#detalle-cono');
    await expect(detalle).toContainText('g = √(r² + h²)');
    await expect(detalle).toContainText('A_tot = π·r·g + π·r² = π·r·(g + r)');
  });

  test('CASO 2 (límite) · «alberca» deja UNA fila; tildes y mayúsculas dan lo mismo; filtro + búsqueda', async ({ page }) => {
    await cargar(page);
    // Sinónimo regional que solo está en el texto de búsqueda de la piscina
    for (const termino of ['alberca', 'pileta']) {
      await buscar(page, termino);
      await expect(contador(page)).toHaveText(`1 de ${TOTAL} figuras`);
      expect(await nombresDeFilas(page), termino).toEqual(['Piscina de profundidad variable']);
    }
    await filaDe(page, 'piscina-variable').click();
    // A mano: (1,2 + 2,0)/2 · 10 · 5 = 1,6 · 50 = 80 m³ = 80.000 L
    const volumen = ((1.2 + 2.0) / 2) * 10 * 5;
    await expect(pasosDe(page, 'piscina-variable')).toContainText(`V = ${volumen} m³`);

    // «triangulo» y «TRIÁNGULO» casan igual: 4 triángulos + trapezoide (por «triángulos» en sus
    // dimensiones) + prisma triangular
    const conTriangulo = [
      'Trapezoide (cuadrilátero irregular)',
      'Triángulo (fórmula general)',
      'Triángulo equilátero',
      'Triángulo rectángulo (Pitágoras)',
      'Triángulo con los tres lados (fórmula de Herón)',
      'Prisma triangular',
    ];
    for (const termino of ['triangulo', 'TRIÁNGULO']) {
      await buscar(page, termino);
      expect(await nombresDeFilas(page), termino).toEqual(conTriangulo);
    }

    // «esfer»: 6 filas; con el filtro de compuestas, solo el depósito de fondos semiesféricos
    await buscar(page, 'esfer');
    await expect(contador(page)).toHaveText(`6 de ${TOTAL} figuras`);
    await filtro(page, 'Figuras compuestas').click();
    await expect(filtro(page, 'Figuras compuestas')).toHaveAttribute('aria-pressed', 'true');
    await expect(filtro(page, 'Todas')).toHaveAttribute('aria-pressed', 'false');
    await expect(contador(page)).toHaveText(`1 de ${TOTAL} figuras`);
    expect(await nombresDeFilas(page)).toEqual(['Depósito cilíndrico con fondos semiesféricos']);
  });

  test('CASO 3 (rechazo) · lo que no está en la tabla dice «sin resultados», y Limpiar lo devuelve todo', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'hiperboloide');
    await expect(contador(page)).toHaveText(`0 de ${TOTAL} figuras`);
    await expect(filas(page)).toHaveCount(0);
    await expect(page.locator('[class*="sinResultados"]')).toContainText('No hay ninguna figura que coincida con «hiperboloide»');

    // el cubo es un poliedro: con el filtro de curvas no hay ninguno, y el aviso dice cómo salir
    await buscar(page, 'cubo');
    await filtro(page, 'Círculo y figuras curvas').click();
    await expect(contador(page)).toHaveText(`0 de ${TOTAL} figuras`);
    await expect(page.locator('[class*="sinResultados"]')).toContainText('quita el filtro de categoría');

    await page.getByRole('button', { name: /Limpiar/ }).click();
    await expect(page.locator(BUSCADOR)).toHaveValue('');
    await expect(contador(page)).toHaveText(`${TOTAL} de ${TOTAL} figuras`);
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
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    await expect(filtro(page, 'Figuras compuestas')).toBeFocused();
    await page.keyboard.press('Tab');
    const primera = filaDe(page, 'cuadrado');
    await expect(primera).toBeFocused();
    await expect(primera).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(primera).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#detalle-cuadrado')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(primera).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#detalle-cuadrado')).toHaveCount(0);
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

    test('con las 48 filas abiertas ninguna fórmula, diagrama ni ejemplo desborda en horizontal', async ({ page }) => {
      await cargar(page);
      for (const fila of TABLA) await filaDe(page, fila.id).click();
      await expect(page.locator('ul li button[aria-expanded="true"]')).toHaveCount(TOTAL);
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
    test(`fórmulas, etiquetas, categoría y dimensiones llegan a 4,5:1 en ${tema}`, async ({ page }) => {
      await cargar(page);
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
      for (const selector of ['[class*="expr"]', '[class*="etq"]', '[class*="filaCategoria"]', '[class*="dimensionesBadge"]']) {
        const elementos = page.locator(selector);
        const n = await elementos.count();
        let peor = Infinity;
        for (let i = 0; i < n; i++) peor = Math.min(peor, await contrasteSobreFondoReal(elementos.nth(i)));
        expect(peor, selector).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('Hallazgos de la inspección del 03/11/2026', () => {
  test('HALLAZGO (03/11/2026, ABIERTO) · tronco de cono: A_lat = π·(5 + 3)·√40 = 158,95 cm², y el ejemplo dice 158,90', async ({ page }) => {
    // g = √(6² + 2²) = √40 = 6,3246 · π·8·6,3246 = 158,953. Ni con g redondeado a 6,32 sale 158,90
    // (π·8·6,32 = 158,84): es una cuenta mal hecha, no un redondeo.
    test.fail();
    await cargar(page);
    await filaDe(page, 'tronco-cono').click();
    const esperado = fmt2(Math.PI * (5 + 3) * Math.sqrt(6 ** 2 + (5 - 3) ** 2));
    expect(await pasosDe(page, 'tronco-cono').innerText()).toContain(`= ${esperado} cm²`);
  });

  test('HALLAZGO 3996 (REPARADO) · zona esférica: con r = 10, a = 8 y b = 6 la franja mide 2 o 14 cm, no 5', async ({ page }) => {
    // Un círculo de radio a en una esfera de radio r está a √(r² − a²) del centro: 6 cm el de 8 y
    // 8 cm el de 6. Los planos distan 8 − 6 = 2 (mismo lado) u 8 + 6 = 14 (lados opuestos). Con
    // h = 2 la franja da A = 40π = 125,66 cm² y V = (2π/6)·304 = 318,35 cm³ (= π∫₆⁸(100 − z²)dz).
    await cargar(page);
    await filaDe(page, 'zona-esferica').click();
    const pasos = await pasosDe(page, 'zona-esferica').innerText();
    expect(pasos).toContain(`= ${fmt2(2 * Math.PI * 10 * 2)} cm²`);
    expect(pasos).toContain(`V = ${fmt2((Math.PI * 2 / 6) * (3 * 64 + 3 * 36 + 4))} cm³`);
    const linea = await page.locator('#detalle-zona-esferica ol li').first().innerText();
    const dato = (letra: string): number => numeroEs(linea.match(new RegExp(`\\b${letra} = ([\\d,]+)`))?.[1] ?? 'NaN');
    const [r, h, a, b] = ['r', 'h', 'a', 'b'].map(dato);
    const da = Math.sqrt(r * r - a * a);
    const db = Math.sqrt(r * r - b * b);
    const posibles = [Math.abs(da - db), da + db];
    expect(posibles.some((p) => Math.abs(p - h) < 0.01), `h = ${h}; posibles: ${posibles.join(' o ')}`).toBe(true);
  });

  test('HALLAZGO 3997 (REPARADO) · pirámide: A_b, P_b, h y ap son de la misma base regular', async ({ page }) => {
    // A_lat = P_b·ap/2 con UNA apotema exige base regular (o con incírculo centrado en el pie de la
    // altura): ap_base = 2·A_b/P_b y ap = √(h² + ap_base²). Antes: A_b = 43 (pentágono de lado 5)
    // con P_b = 30 (el de lado 6) y ap = 10, que no cuadra. Ahora, pentágono regular de lado 6:
    // A = 61,94 cm², ap = √(81 + 4,129²) = 9,90, A_lat = 148,53 cm², V = 185,81 cm³.
    await cargar(page);
    await filaDe(page, 'piramide').click();
    const titulo = await page.locator('#detalle-piramide h3').filter({ hasText: 'Ejemplo resuelto' }).innerText();
    const dato = (nombre: string): number =>
      numeroEs(titulo.match(new RegExp(`\\b${nombre} = ([\\d,]+)`))?.[1] ?? 'NaN');
    const Ab = dato('A_b');
    const Pb = dato('P_b');
    const h = dato('h');
    const ap = dato('ap');
    const apBase = (2 * Ab) / Pb;
    expect.soft(Math.abs(Math.hypot(h, apBase) - ap), `ap = √(h² + ap_base²) = ${Math.hypot(h, apBase)}`).toBeLessThan(0.05);
    if (/pentagonal/.test(titulo)) {
      const lado = Pb / 5;
      const areaRegular = (5 * lado * lado) / (4 * Math.tan(Math.PI / 5));
      expect.soft(Math.abs(areaRegular - Ab), `pentágono regular de P = ${Pb}: A = ${areaRegular}`).toBeLessThan(0.5);
    }
    expect(Number.isFinite(Ab) && Number.isFinite(ap)).toBe(true);
    const pasos = await pasosDe(page, 'piramide').innerText();
    expect(pasos).toContain('A_lat = (30 · 9,902) / 2 = 148,53 cm²');
    expect(pasos).toContain('V = (61,94 · 9) / 3 = 185,81 cm³');
  });

  test('HALLAZGO 3998 (REPARADO) · la fila es «Pirámide regular»: su área lateral solo vale para base regular', async ({ page }) => {
    // Base rectangular 6 × 4, h = 4: las caras sobre los lados de 6 tienen apotema √(16 + 4) = 4,47
    // y las de 4, √(16 + 9) = 5. A_lat = 6·4,47 + 4·5 = 46,83 m²; P_b·ap/2 no tiene una «ap» que
    // poner (con 5 daría 50; con 4,47, 44,72). El volumen A_b·h/3 sí vale para cualquier base.
    await cargar(page);
    await filaDe(page, 'piramide').click();
    const nombres = await nombresDeFilas(page);
    expect(nombres).not.toContain('Pirámide recta (base cualquiera)');
    expect(nombres).toContain('Pirámide regular');
    const detalle = await page.locator('#detalle-piramide').innerText();
    expect(detalle).toMatch(/ap_base = apotema de la base/);
    expect(detalle).toMatch(/volumen vale con cualquier base/);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · pirámide cuadrangular: la apotema de la cara no es una «arista»', async ({ page }) => {
    // En el ejemplo (a = 6, h = 4) la apotema es √(4² + 3²) = 5 m y la arista lateral √(4² + 3² + 3²)
    // = 5,83 m. Quien mida la arista y la use como ap obtiene A_lat = 2·6·5,83 = 69,97 m², no 60.
    test.fail();
    await cargar(page);
    await filaDe(page, 'piramide-cuadrangular').click();
    expect(await page.locator('#detalle-piramide-cuadrangular [class*="piePlano"]').innerText()).not.toMatch(/arista/i);
  });

  test('HALLAZGO 4000 (REPARADO) · el buscador encuentra «volumen del cono» y «área de la esfera», palabras clave de su metadata', async ({ page }) => {
    // Antes la fila casaba la consulta ENTERA como subcadena: «cono volumen» daba 2 filas y
    // «volumen cono», 0; «volumen del cilindro», «area de la esfera» y «volumen del cono» (de
    // metadata.keywords) daban «0 de 48». Ahora palabra a palabra, sin orden y sin «del»/«de la».
    await cargar(page);
    const casos: [string, string][] = [
      ['volumen del cono', 'Cono'],
      ['área de la esfera', 'Esfera'],
      ['volumen del cilindro', 'Cilindro'],
      ['volumen cono', 'Cono'],
      ['area triangulo', 'Triángulo (fórmula general)'],
    ];
    for (const [termino, fila] of casos) {
      await buscar(page, termino);
      expect.soft(await nombresDeFilas(page), termino).toContain(fila);
    }
  });

  test('HALLAZGO 4001 (REPARADO) · las fracciones se leen con «entre»: V del cono es «π·r²·h entre 3»', async ({ page }) => {
    // Frac pintaba numerador y denominador en dos <span> apilados sin nada que dijera «entre», y el
    // nombre accesible de la fila era «… Volumen π·r²·h 3 …». Ahora lleva un «entre» oculto a la
    // vista, la receta del hallazgo 3939 de tabla-integrales.
    await cargar(page);
    const lee = /\s*(\/|entre|partido|sobre)\s*/.source;
    await expect.soft(filaDe(page, 'cono')).toHaveAccessibleName(new RegExp(`h${lee}3`), { timeout: 1000 });
    await expect.soft(filaDe(page, 'rombo')).toHaveAccessibleName(new RegExp(`d${lee}2`), { timeout: 1000 });
    await expect.soft(filaDe(page, 'esfera')).toHaveAccessibleName(new RegExp(`4${lee}3|cuatro tercios`, 'i'), { timeout: 1000 });
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · «Promediar las bases» del tronco da un volumen LARGO, no corto', async ({ page }) => {
    // R = 5, r = 3, h = 6: correcto (π·6/3)·(25 + 9 + 15) = 307,88 cm³. Promediando las bases,
    // 6·π·(25 + 9)/2 = 320,44 (+4,1 %): sale de más. Lo que sale corto es QUITAR R·r: 213,63.
    // En general h·(A_B + A_b)/2 − V = h·(√A_B − √A_b)²/6 ≥ 0.
    test.fail();
    await cargar(page);
    const aviso = page.locator('[class*="warningList"] li').filter({ hasText: 'Promediar las bases' });
    const texto = (await aviso.innerText()).replace(/\s+/g, ' ');
    expect(texto).toMatch(/sale (largo|de más|mayor)|sobre(estima|valora)|exceso|por encima/i);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · que la pirámide es un tercio del prisma no lo demostró Arquímedes, sino Eudoxo', async ({ page }) => {
    // El propio Arquímedes, en el prefacio de «El Método», atribuye la demostración a Eudoxo y el
    // enunciado a Demócrito; es la proposición XII.7 de los Elementos de Euclides.
    test.fail();
    await cargar(page);
    const faq = page.locator('[class*="faqItem"]').filter({ hasText: 'se divide entre 3' });
    const texto = (await faq.innerText()).replace(/\s+/g, ' ');
    if (/Arquímedes/.test(texto)) expect(texto).toMatch(/Eudoxo/);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · dos preguntas de la FAQ están escritas dos veces, con respuestas distintas', async ({ page }) => {
    // «terreno irregular» y «la h del trapecio» están en la FAQ visible y en el faqJsonLd con
    // pregunta y respuesta redactadas por separado. Va en UNA constante (check:faq-unica).
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
    for (const tema of [/terreno/, /«h»/]) {
      const enJson = jsonLd.find((q) => tema.test(q.pregunta));
      const enPagina = visible.find((q) => tema.test(q.pregunta));
      if (enJson && enPagina) expect.soft(enPagina, String(tema)).toEqual(enJson);
    }
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · el % va separado con espacio normal, no con espacio duro (U+00A0)', async ({ page }) => {
    // «un 25 % de error», «entre un 5 % y un 10 %» y «un 10 % de merma» (CLAUDE.md §2, 25/09/2026).
    test.fail();
    await cargar(page);
    await filaDe(page, 'pared-huecos').click();
    // Solo el texto propio de la app: la ficha de la pared y la guía educativa
    const texto = (
      await page.locator('#detalle-pared-huecos, [data-guia-educativa]').evaluateAll((els) => els.map((e) => e.textContent ?? ''))
    ).join(' ');
    expect(texto).toMatch(/\d %/);
    expect(texto.match(/\d %/g) ?? []).toEqual([]);
  });
});

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Generador de Fichas de Cálculo — las fichas de FRACCIONES (S0216, 20/10/2026).
 *
 * QUÉ SE COMPRUEBA EN EL NAVEGADOR (la aritmética la cubre tests/fichas-fracciones-motor.spec.ts)
 *   1) Al marcar «Fracciones» aparece el selector de tipo; al desmarcarla, desaparece.
 *   2) Una ficha solo de «Simplificar» con el nº de ficha 123456: 24 ejercicios, todos con
 *      «Simplifica», y con las soluciones visibles cada solución vale lo mismo que la fracción
 *      propuesta y es irreducible. Se lee de los aria-label «N entre D» de las fracciones
 *      apiladas, que es lo que oye un lector de pantalla.
 *   3) El mismo nº de ficha reproduce la misma hoja.
 *   4) Las fichas de enteros siguen igual: sin «Fracciones», la ficha por defecto no lleva ninguna
 *      fracción apilada.
 *
 * INSPECCIÓN COMPLETA DEL 09/11/2026 (Inspector, primera) — casos CASO 1-3 y HALLAZGO, abajo.
 *   El oráculo es aritmética escrita aquí (suma, resta, producto, dividendo = divisor × cociente
 *   + resto, y producto cruzado para las fracciones), nunca el generador. Antes de escribir este
 *   fichero se leyeron del DOM 225 fichas de enteros de 60 operaciones (13.500 cuentas: 5 niveles
 *   × {con llevadas, sin llevadas, con resto} × 15 números de ficha) y 200 de fracciones
 *   (12.000 ejercicios: 5 niveles × 5 tipos × 8 números): 0 soluciones mal, 0 restas negativas,
 *   0 llevadas con «sin llevadas», 0 fracciones reducibles o no positivas, mixtos bien escritos,
 *   alternancia de operaciones correcta y millares en formato español (cuatro cifras sin punto).
 *   Lo que NO cumple son límites y rótulos que la página promete: los HALLAZGO, en test.fail().
 *
 *   Los límites de cada nivel salen de la propia página (botón del nivel y tabla «Qué cambia en
 *   cada nivel» del bloque educativo):
 *     Iniciación  hasta 10 · tablas del 1 al 5 · divisor hasta 5
 *     Básico      hasta 20 · tablas completas · divisor hasta 10
 *     Intermedio  hasta 100 · dos cifras por una · dividendo de dos cifras
 *     Avanzado    hasta 1.000 · tres cifras por dos · divisor de dos cifras
 *     Experto     hasta 10.000 · cuatro cifras por dos · divisor de dos cifras y cociente largo
 */

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function leer(etiqueta: string): [number, number] {
  const m = etiqueta.match(/^(\d+) entre (\d+)$/);
  if (!m) throw new Error(`aria-label inesperado: ${etiqueta}`);
  return [Number(m[1]), Number(m[2])];
}

test.beforeEach(async ({ page }) => {
  await page.goto('/generador-fichas-calculo/');
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
});

async function fichaSoloFracciones(page: import('@playwright/test').Page, tipo: string, semilla: string) {
  // Por defecto vienen marcadas Sumas y Restas: se desmarcan y se marca Fracciones
  await page.getByRole('button', { name: /Sumas$/ }).click();
  await page.getByRole('button', { name: /Restas$/ }).click();
  await page.getByRole('button', { name: /Fracciones$/ }).click();
  await page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' }).getByRole('button', { name: new RegExp(`^${tipo}`) }).click();
  const caja = page.getByPlaceholder('Al azar');
  await caja.fill(semilla);
  await esperarValorEnReact(page, caja, semilla);
  await page.getByRole('button', { name: /Generar ficha/ }).click();
}

test('1 · el selector de tipo de fracciones aparece y desaparece con «Fracciones»', async ({ page }) => {
  const grupo = page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' });
  await expect(grupo).toHaveCount(0);
  await page.getByRole('button', { name: /Fracciones$/ }).click();
  await expect(grupo).toBeVisible();
  await page.getByRole('button', { name: /Fracciones$/ }).click();
  await expect(grupo).toHaveCount(0);
});

test('2 · ficha de «Simplificar»: cada solución es la irreducible de su fracción', async ({ page }) => {
  await fichaSoloFracciones(page, 'Simplificar', '123456');
  const items = page.locator('ol > li');
  await expect(items).toHaveCount(24);
  await expect(items.filter({ hasText: 'Simplifica' })).toHaveCount(24);

  await page.getByRole('button', { name: /Ver soluciones/ }).click();
  for (let i = 0; i < 24; i++) {
    const fracciones = items.nth(i).locator('[role="img"]');
    // La propuesta y la solución (toda solución de «simplificar» es propia: nunca entera)
    await expect(fracciones).toHaveCount(2);
    const [n, d] = leer((await fracciones.nth(0).getAttribute('aria-label')) ?? '');
    const [sn, sd] = leer((await fracciones.nth(1).getAttribute('aria-label')) ?? '');
    expect(gcd(n, d), `ejercicio ${i + 1}: ${n}/${d}`).toBeGreaterThan(1);
    expect(n * sd, `ejercicio ${i + 1}`).toBe(sn * d);
    expect(gcd(sn, sd), `ejercicio ${i + 1}: solución ${sn}/${sd}`).toBe(1);
  }
});

test('3 · el mismo nº de ficha reproduce la misma hoja', async ({ page }) => {
  await fichaSoloFracciones(page, 'Mezcla', '777777');
  const primera = await page.locator('ol').innerText();
  await page.reload();
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
  await fichaSoloFracciones(page, 'Mezcla', '777777');
  expect(await page.locator('ol').innerText()).toBe(primera);
});

test('4 · la ficha de enteros por defecto no lleva fracciones', async ({ page }) => {
  await page.getByRole('button', { name: /Generar ficha/ }).click();
  await expect(page.locator('ol > li')).toHaveCount(24);
  await expect(page.locator('ol [role="img"]')).toHaveCount(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Inspección del 09/11/2026: ayudantes
// ─────────────────────────────────────────────────────────────────────────────

const CHIPS: Record<string, RegExp> = {
  suma: /Sumas$/,
  resta: /Restas$/,
  multiplicacion: /Multiplicaciones$/,
  division: /Divisiones$/,
  fraccion: /Fracciones$/,
};

/** Deja marcadas exactamente esas operaciones, pulsándolas en el orden dado. */
async function marcarSolo(page: Page, operaciones: string[]) {
  for (const [op, nombre] of Object.entries(CHIPS)) {
    const boton = page.getByRole('button', { name: nombre });
    if ((await boton.getAttribute('aria-pressed')) === 'true' && !operaciones.includes(op)) await boton.click();
  }
  for (const op of operaciones) {
    const boton = page.getByRole('button', { name: CHIPS[op] });
    if ((await boton.getAttribute('aria-pressed')) !== 'true') await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
}

async function ponerAjuste(page: Page, nombre: RegExp, valor: boolean) {
  const boton = page.getByRole('button', { name: nombre });
  if (((await boton.getAttribute('aria-pressed')) === 'true') !== valor) await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', String(valor));
}

async function elegirNivel(page: Page, nivel: string) {
  const boton = page.getByRole('button', { name: new RegExp(`^${nivel}`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function numeroDeFicha(page: Page, valor: string) {
  const caja = page.getByPlaceholder('Al azar');
  await caja.fill(valor);
  await esperarValorEnReact(page, caja, valor);
}

async function generar(page: Page) {
  await page.getByRole('button', { name: /Generar ficha/ }).click();
  await expect(page.locator('ol > li').first()).toBeVisible();
}

async function enHorizontal(page: Page) {
  const columna = page.getByRole('button', { name: /^En columna$/ });
  if (await columna.count()) await columna.click();
  await expect(page.getByRole('button', { name: /^Horizontal$/ })).toBeVisible();
}

async function verSoluciones(page: Page) {
  await page.getByRole('button', { name: /Ver soluciones/ }).click();
  await expect(page.getByRole('button', { name: /Ocultar soluciones/ })).toBeVisible();
}

interface CuentaLeida {
  linea: string;
  a: number;
  simbolo: string;
  b: number;
  resultado: number;
  resto: number | null;
}

/** «12.345» → 12345, comprobando el formato español: punto de millar a partir de cinco cifras. */
function numeroEspanol(texto: string, donde: string): number {
  const n = Number(texto.replace(/\./g, ''));
  if (n >= 10000) expect(texto, `${donde}: ${texto} sin punto de millar`).toMatch(/^\d{1,3}(\.\d{3})+$/);
  else expect(texto, `${donde}: ${texto} (con cuatro cifras no se agrupa)`).toMatch(/^\d{1,4}$/);
  return n;
}

/** Las cuentas de enteros en horizontal y con soluciones: «7. 618 × 11 = 6798 (resto 3)». */
async function leerCuentas(page: Page): Promise<CuentaLeida[]> {
  const textos = await page.locator('ol > li').allInnerTexts();
  return textos.map((t, i) => {
    const linea = t.replace(/\s+/g, ' ').trim();
    const m = linea.match(/^(\d+)\. ([\d.]+) ([+−×:]) ([\d.]+) = ([\d.]+)(?: \(resto (\d+)\))?$/);
    expect(m, `cuenta ${i + 1} ilegible: «${linea}»`).not.toBeNull();
    const g = m as RegExpMatchArray;
    expect(Number(g[1])).toBe(i + 1);
    return {
      linea,
      a: numeroEspanol(g[2], linea),
      simbolo: g[3],
      b: numeroEspanol(g[4], linea),
      resultado: numeroEspanol(g[5], linea),
      resto: g[6] === undefined ? null : Number(g[6]),
    };
  });
}

/** ¿Alguna columna suma diez o más? (llevada en la suma) */
function llevadaEnSuma(a: number, b: number): boolean {
  for (let x = a, y = b; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10)) {
    if ((x % 10) + (y % 10) >= 10) return true;
  }
  return false;
}

/** ¿Alguna cifra del sustraendo es mayor que la del minuendo? (llevada en la resta) */
function llevadaEnResta(a: number, b: number): boolean {
  for (let x = a, y = b; y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10)) {
    if (y % 10 > x % 10) return true;
  }
  return false;
}

/** Hoja de soluciones de una cuenta, con aritmética del test. */
function comprobarSolucion(c: CuentaLeida) {
  switch (c.simbolo) {
    case '+':
      expect(c.resultado, c.linea).toBe(c.a + c.b);
      break;
    case '−':
      expect(c.resultado, c.linea).toBe(c.a - c.b);
      expect(c.resultado, `${c.linea}: resta negativa`).toBeGreaterThanOrEqual(0);
      break;
    case '×':
      expect(c.resultado, c.linea).toBe(c.a * c.b);
      break;
    default: {
      const resto = c.resto ?? 0;
      expect(c.b * c.resultado + resto, `${c.linea}: divisor × cociente + resto`).toBe(c.a);
      expect(resto, `${c.linea}: resto menor que el divisor`).toBeLessThan(c.b);
      expect(resto).toBeGreaterThanOrEqual(0);
    }
  }
}

const ficha = (page: Page) => page.locator('ol').innerText();
const pieDeHoja = (page: Page) => page.locator('p', { hasText: 'meskeia.com' }).filter({ hasText: 'Ficha n.º' });

// ─────────────────────────────────────────────────────────────────────────────
// CASOS (inspección del 09/11/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 1 (normal) · Básico, sumas y restas con llevadas, n.º 123456: 24 cuentas bien resueltas', async ({ page }) => {
  // Ajustes de fábrica: Sumas + Restas, Básico (hasta 20), con llevadas, 24 operaciones.
  await numeroDeFicha(page, '123456');
  await generar(page);
  await enHorizontal(page);
  await verSoluciones(page);

  const cuentas = await leerCuentas(page);
  expect(cuentas).toHaveLength(24);
  // Los operandos son los que da el n.º 123456 (fijarlos vigila que el número siga dando la
  // misma hoja de una versión a otra); las soluciones, a mano: 9 + 17 = 26 · 20 − 4 = 16 ·
  // 5 + 6 = 11 · 11 − 7 = 4.
  expect(cuentas.slice(0, 4).map((c) => c.linea)).toEqual([
    '1. 9 + 17 = 26',
    '2. 20 − 4 = 16',
    '3. 5 + 6 = 11',
    '4. 11 − 7 = 4',
  ]);
  cuentas.forEach((c, i) => {
    // Se alternan por orden: suma, resta, suma, resta…
    expect(c.simbolo, c.linea).toBe(i % 2 === 0 ? '+' : '−');
    // «Hasta 20»: ningún operando pasa de 20 ni es menor que 1
    for (const n of [c.a, c.b]) {
      expect(n, c.linea).toBeGreaterThanOrEqual(1);
      expect(n, c.linea).toBeLessThanOrEqual(20);
    }
    comprobarSolucion(c);
  });
  await expect(pieDeHoja(page)).toHaveText(
    'Ficha n.º 123456 · nivel Básico · 24 operaciones · PLANTILLA DE CORRECCIÓN · meskeia.com',
  );
});

test('CASO 2 (límite) · Experto, las cuatro operaciones, sin llevadas, con resto y 60 cuentas', async ({ page }) => {
  // El deslizador va de 10 a 60 de 2 en 2: 70 se queda en 60 y 5 en 10.
  const rango = page.locator('input[type="range"]');
  expect(await sembrarValorAcotado(page, rango, 70)).toBe('60');
  expect(await sembrarValorAcotado(page, rango, 5)).toBe('10');
  await sembrarValor(page, rango, 60);
  await expect(page.getByText('Número de operaciones: 60')).toBeVisible();

  await marcarSolo(page, ['suma', 'resta', 'multiplicacion', 'division']);
  await elegirNivel(page, 'Experto');
  await ponerAjuste(page, /^Con llevadas$/, false);
  await ponerAjuste(page, /^División con resto$/, true);
  await numeroDeFicha(page, '654321');
  await generar(page);
  await enHorizontal(page);
  await verSoluciones(page);

  const cuentas = await leerCuentas(page);
  expect(cuentas).toHaveLength(60);
  const orden = ['+', '−', '×', ':'];
  cuentas.forEach((c, i) => {
    expect(c.simbolo, c.linea).toBe(orden[i % 4]);
    comprobarSolucion(c);
    if (c.simbolo === '+') {
      // Sin llevadas: ninguna columna pasa de 9, y por tanto la suma no pasa de 9999
      expect(llevadaEnSuma(c.a, c.b), `${c.linea}: llevada con «sin llevadas»`).toBe(false);
      expect(c.resultado).toBeLessThanOrEqual(9999);
    }
    if (c.simbolo === '−') expect(llevadaEnResta(c.a, c.b), `${c.linea}: llevada con «sin llevadas»`).toBe(false);
    if (c.simbolo === '×') {
      expect(c.a, c.linea).toBeLessThanOrEqual(9999);
      expect(c.b, c.linea).toBeLessThanOrEqual(99);
    }
    if (c.simbolo === ':') {
      expect(c.b, c.linea).toBeLessThanOrEqual(99);
      // «Con resto»: la solución lo muestra aparte, también cuando sale 0
      expect(c.resto, c.linea).not.toBeNull();
    }
  });
  await expect(pieDeHoja(page)).toContainText('Ficha n.º 654321 · nivel Experto · 60 operaciones');
});

test('CASO 2 bis (límite) · fracciones de distinto denominador en Experto: m.c.m. ≤ 60 y solución exacta', async ({ page }) => {
  await sembrarValor(page, 'input[type="range"]', 60);
  await marcarSolo(page, ['fraccion']);
  await page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' }).getByRole('button', { name: /^Distinto denominador/ }).click();
  await elegirNivel(page, 'Experto');
  await expect(page.getByText('El nivel fija el denominador máximo: 15 en el nivel Experto.')).toBeVisible();
  await numeroDeFicha(page, '200003');
  await generar(page);
  await verSoluciones(page);

  const filas = await page.locator('ol > li').evaluateAll((lis) =>
    lis.map((li) => {
      const contenedor = li.querySelector('div');
      const hijos = contenedor ? Array.from(contenedor.children) : [];
      const sol = hijos[hijos.length - 1];
      const primera = sol?.children[0];
      return {
        a: hijos[0]?.getAttribute('aria-label') ?? '',
        op: (hijos[1]?.textContent ?? '').trim(),
        b: hijos[2]?.getAttribute('aria-label') ?? '',
        igual: (hijos[3]?.textContent ?? '').trim(),
        sol: primera?.getAttribute('aria-label') ?? (primera?.textContent ?? '').trim(),
        mixto: (sol?.children[1]?.textContent ?? '').trim(),
      };
    }),
  );
  expect(filas).toHaveLength(60);
  filas.forEach((f, i) => {
    const donde = `ejercicio ${i + 1}: ${f.a} ${f.op} ${f.b} = ${f.sol} ${f.mixto}`;
    const [an, ad] = leer(f.a);
    const [bn, bd] = leer(f.b);
    expect(['+', '−'], donde).toContain(f.op);
    expect(f.igual).toBe('=');
    // Distinto denominador, ninguno por encima de 15, y m.c.m. de cuaderno (≤ 60)
    expect(ad, donde).not.toBe(bd);
    expect(Math.max(ad, bd), donde).toBeLessThanOrEqual(15);
    expect((ad / gcd(ad, bd)) * bd, donde).toBeLessThanOrEqual(60);
    // Producto cruzado: a/b ± c/d = (ad ± cb) / bd
    const n = f.op === '+' ? an * bd + bn * ad : an * bd - bn * ad;
    const d = ad * bd;
    const [sn, sd] = /^\d+$/.test(f.sol) ? [Number(f.sol), 1] : leer(f.sol);
    expect(sn * d, donde).toBe(n * sd);
    expect(sn, `${donde}: nunca negativa ni nula`).toBeGreaterThan(0);
    expect(gcd(sn, sd), `${donde}: irreducible`).toBe(1);
    // Si pasa de la unidad, también en mixto: 7/4 = 1 3/4
    if (sn > sd && sd !== 1) expect(f.mixto, donde).toBe(`= ${Math.floor(sn / sd)} ${sn % sd}/${sd}`);
    else expect(f.mixto, donde).toBe('');
  });
});

test('CASO 3 (rechazo) · sin ninguna operación marcada no hay ficha, y un n.º de ficha sin cifras se sortea', async ({ page }) => {
  await numeroDeFicha(page, '123456');
  await generar(page);
  await marcarSolo(page, []);
  await page.getByRole('button', { name: /Generar ficha/ }).click();
  // El aviso de la app (no el anunciador de rutas de Next, que también es role="alert")
  const aviso = page.locator('p[role="alert"]');
  await expect(aviso).toHaveText('Selecciona al menos un tipo de operación.');
  await expect(page.locator('ol')).toHaveCount(0);
  await expect(page.getByText('Elige las operaciones y el nivel y pulsa')).toBeVisible();

  // Volver a marcar una operación y generar retira el aviso
  await marcarSolo(page, ['resta']);
  await generar(page);
  await expect(aviso).toHaveCount(0);
  await expect(page.locator('ol > li')).toHaveCount(24);

  // «abc» no tiene cifras: la ficha sale con un número al azar de seis cifras, y es ESE el que
  // se muestra (nunca «abc» ni 0)
  await numeroDeFicha(page, 'abc');
  await page.getByRole('button', { name: /Generar ficha/ }).click();
  const resumen = page.locator('p', { hasText: 'operaciones de nivel' }).first();
  await expect(resumen).not.toContainText('123456');
  await expect(resumen).toHaveText(
    /^24 operaciones de nivel Básico\. Ficha n\.º [1-9]\d{5}\.$/,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS ABIERTOS (inspección del 09/11/2026). Cada uno afirma lo que la página promete;
// hoy no se cumple, de ahí el test.fail().
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO (09/11/2026, ABIERTO) · el mismo n.º con los mismos ajustes da otra hoja si las operaciones se marcaron en otro orden', async ({ page }) => {
  // La FAQ promete «introduciéndolo de nuevo con los mismos ajustes se obtienen exactamente las
  // mismas operaciones». generarFicha alterna `operaciones[i % n]` en el orden en que se
  // pulsaron los botones, y ese orden no se ve: desmarcar y volver a marcar «Sumas» deja los
  // mismos botones pulsados y la hoja empieza por una resta. Hoy: «1. 9 + 17» frente a «1. 9 − 8».
  test.fail();
  await numeroDeFicha(page, '123456');
  await generar(page);
  const primera = await ficha(page);

  await page.reload();
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
  await page.getByRole('button', { name: /Sumas$/ }).click();
  await page.getByRole('button', { name: /Sumas$/ }).click();
  for (const nombre of [/Sumas$/, /Restas$/]) {
    await expect(page.getByRole('button', { name: nombre })).toHaveAttribute('aria-pressed', 'true');
  }
  await numeroDeFicha(page, '123456');
  await generar(page);
  expect(await ficha(page)).toBe(primera);
});

test('HALLAZGO (09/11/2026, ABIERTO) · tras cambiar de nivel sin regenerar, la hoja impresa dice el nivel nuevo', async ({ page }) => {
  // El resumen y el pie leen el nivel SELECCIONADO, no el de la ficha: una hoja de Básico sale
  // con «nivel Experto» en el pie, y con ese dato (Experto + 123456) se obtiene otra ficha.
  test.fail();
  await numeroDeFicha(page, '123456');
  await generar(page);
  const hoja = await ficha(page);
  await elegirNivel(page, 'Experto');
  expect(await ficha(page)).toBe(hoja);
  await expect(pieDeHoja(page)).toContainText('nivel Básico');
});

test('HALLAZGO (09/11/2026, ABIERTO) · «Otra distinta» repite la misma hoja si hay un n.º de ficha escrito', async ({ page }) => {
  // generar() toma la semilla del campo si tiene cifras; «Otra distinta» llama a la misma
  // función, así que con 123456 escrito vuelve a salir la ficha 123456.
  test.fail();
  await numeroDeFicha(page, '123456');
  await generar(page);
  const primera = await ficha(page);
  await page.getByRole('button', { name: /Otra distinta/ }).click();
  await expect.poll(() => ficha(page), { timeout: 2000 }).not.toBe(primera);
});

test('HALLAZGO (09/11/2026, ABIERTO) · Intermedio promete «dividendo de dos cifras» y saca dividendos de tres', async ({ page }) => {
  // Divisor 2-9 y cociente 2-99 dan dividendos de hasta 891 (+ resto). En el barrido, 537 de
  // 675 divisiones de Intermedio (79,6 %) no tenían dos cifras: 276 : 6, 4 : 2…
  test.fail();
  await marcarSolo(page, ['division']);
  await elegirNivel(page, 'Intermedio');
  await numeroDeFicha(page, '123456');
  await generar(page);
  await enHorizontal(page);
  await verSoluciones(page);
  for (const c of await leerCuentas(page)) {
    comprobarSolucion(c);
    expect(String(c.a).length, `${c.linea}: el dividendo no tiene dos cifras`).toBe(2);
  }
});

test('HALLAZGO (09/11/2026, ABIERTO) · «tres cifras por dos» y «divisor de dos cifras» no se cumplen en Avanzado', async ({ page }) => {
  // Los factores van de 2 a 999 y de 2 a 99, y el divisor de 2 a 99: en el barrido, 1 de cada
  // 5 multiplicaciones de Avanzado no era de tres cifras por dos (63 × 11, 7 × 97) y 1 de cada
  // 11 divisiones tenía divisor de una cifra (6 : 3). Lo mismo en Intermedio y Experto.
  test.fail();
  await sembrarValor(page, 'input[type="range"]', 60);
  await marcarSolo(page, ['multiplicacion', 'division']);
  await elegirNivel(page, 'Avanzado');
  await numeroDeFicha(page, '123456');
  await generar(page);
  await enHorizontal(page);
  await verSoluciones(page);
  for (const c of await leerCuentas(page)) {
    comprobarSolucion(c);
    if (c.simbolo === '×') expect([String(c.a).length, String(c.b).length], c.linea).toEqual([3, 2]);
    else expect(String(c.b).length, c.linea).toBe(2);
  }
});

test('HALLAZGO (09/11/2026, ABIERTO) · una ficha «de restas con llevadas» lleva sobre todo restas sin llevada', async ({ page }) => {
  // El bloque educativo («Refuerzo puntual») propone: «si el fallo está en las llevadas, se
  // genera una ficha de restas con llevadas y nada más» para no diluir el error entre
  // operaciones que ya se dominan. «Con llevadas» solo las PERMITE: en Básico, 55 de 225 restas
  // (24 %) tenían llevada; en Iniciación, 28 de 225 (12 %). Si la reparación cambia el texto en
  // vez del generador, este caso se reescribe.
  test.fail();
  await marcarSolo(page, ['resta']);
  await ponerAjuste(page, /^Con llevadas$/, true);
  await numeroDeFicha(page, '123456');
  await generar(page);
  await enHorizontal(page);
  await verSoluciones(page);
  for (const c of await leerCuentas(page)) {
    comprobarSolucion(c);
    expect(llevadaEnResta(c.a, c.b), `${c.linea}: sin llevada`).toBe(true);
  }
});

test('HALLAZGO (09/11/2026, ABIERTO) · Básico «hasta 20» sin llevadas no saca ningún número de dos cifras', async ({ page }) => {
  // sumaSinLlevadas y restaSinLlevadas calculan las cifras como String(20).length − 1 = 1: en
  // Básico sin llevadas todo es de una cifra, igual que en Iniciación (en el barrido, la mayor
  // suma fue 9). 13 + 4 = 17 o 18 − 6 = 12 no llevan llevada y caben en «hasta 20».
  test.fail();
  await sembrarValor(page, 'input[type="range"]', 60);
  await ponerAjuste(page, /^Con llevadas$/, false);
  await numeroDeFicha(page, '123456');
  await generar(page);
  await enHorizontal(page);
  await verSoluciones(page);
  const cuentas = await leerCuentas(page);
  for (const c of cuentas) {
    comprobarSolucion(c);
    expect(c.simbolo === '+' ? llevadaEnSuma(c.a, c.b) : llevadaEnResta(c.a, c.b), c.linea).toBe(false);
  }
  expect(Math.max(...cuentas.flatMap((c) => [c.a, c.b])), 'ningún operando entre 10 y 20').toBeGreaterThanOrEqual(10);
});

test('HALLAZGO (09/11/2026, ABIERTO) · «Simplificar» propone denominadores por encima del máximo que anuncia el nivel', async ({ page }) => {
  // La nota dice «El nivel fija el denominador máximo: 6 en el nivel Iniciación» (y la FAQ, «de
  // 6 en Iniciación a 15 en Experto»), pero la fracción a simplificar es la irreducible × k:
  // en Iniciación llega a 15/18; en Experto, a 70/91 (máximo visto, 105).
  test.fail();
  await marcarSolo(page, ['fraccion']);
  await page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' }).getByRole('button', { name: /^Simplificar/ }).click();
  await elegirNivel(page, 'Iniciación');
  await expect(page.getByText('El nivel fija el denominador máximo: 6 en el nivel Iniciación.')).toBeVisible();
  await numeroDeFicha(page, '123456');
  await generar(page);
  const etiquetas = await page.locator('ol > li [role="img"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
  expect(etiquetas.length).toBe(24);
  for (const e of etiquetas) expect(leer(e)[1], e).toBeLessThanOrEqual(6);
});

test('HALLAZGO (09/11/2026, ABIERTO) · la «mezcla de todos» de fracciones nunca incluye «Simplificar»', async ({ page }) => {
  // La FAQ (FAQPage y visible) dice «Cinco tipos: … y una mezcla de todos»; generarFraccion
  // sortea solo entre mismo, distinto y producto. En el barrido, 0 de 2.400 ejercicios de Mezcla.
  test.fail();
  await sembrarValor(page, 'input[type="range"]', 60);
  await marcarSolo(page, ['fraccion']);
  await page.getByRole('group', { name: 'Tipo de ejercicios de fracciones' }).getByRole('button', { name: /^Mezcla/ }).click();
  await numeroDeFicha(page, '123456');
  await generar(page);
  await expect(page.locator('ol > li')).toHaveCount(60);
  expect(await page.locator('ol > li').filter({ hasText: 'Simplifica' }).count()).toBeGreaterThan(0);
});

test('HALLAZGO (09/11/2026, ABIERTO) · la FAQ pone «1.234» de ejemplo y la hoja escribe las cuatro cifras sin punto', async ({ page }) => {
  // «Los números se muestran con el formato del español, con punto para los millares: 1.234.»
  // La hoja usa Intl es-ES, que con cuatro cifras no agrupa (RAE 2010): «2720 : 4 = 680».
  // El ejemplo de la FAQ tiene que escribirse como lo escribe la hoja.
  test.fail();
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  const respuesta = await page.getByText(/con punto para los millares/).innerText();
  const ejemplo = respuesta.match(/millares: (\d{1,3}(?:\.\d{3})*|\d+)/)?.[1] ?? '';
  expect(ejemplo, 'la FAQ ya no trae un ejemplo de millares').not.toBe('');
  const valor = Number(ejemplo.replace(/\./g, ''));
  expect(ejemplo).toBe(new Intl.NumberFormat('es-ES').format(valor));
});

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Generador de Laberintos — inspección completa del 17/11/2026 (Inspector, modo primera).
 *
 * QUÉ PROMETE LA APP (hero, metadata, FAQPage y guía)
 *   · «Laberintos con salida única garantizada»: el laberinto es un ÁRBOL (todas las casillas
 *     conectadas, ningún bucle), así que entre la entrada y la salida hay un camino y solo uno.
 *   · Entrada arriba a la izquierda (pared de arriba abierta) y salida abajo a la derecha
 *     (pared de abajo abierta); el resto del borde, cerrado.
 *   · «Ver solución» superpone ese camino; las métricas dan su longitud en casillas y los
 *     callejones sin salida (casillas con tres paredes).
 *   · El n.º de laberinto reproduce el mismo dibujo con el mismo tamaño y trazado.
 *   · «Listos para imprimir»: «Cada generación produce una hoja» (FAQ visible).
 *
 * EL ORÁCULO: todo se lee del SVG que pinta la app y se recalcula aquí, sin reutilizar nada de
 * su código. Cada casilla mide 10 unidades; una <line> horizontal en y = 10·f, de x = 10·c a
 * 10·c + 10, es la pared entre las casillas (f−1, c) y (f, c); una vertical en x = 10·c, la que
 * hay entre (f, c−1) y (f, c). Cada casilla pinta sus cuatro paredes, de modo que una pared
 * interior sale DOS veces y una del borde, una.
 *
 * Cuentas hechas a mano antes de mirar la app, para filas × columnas = F × C (N = F·C casillas):
 *   pasos interiores posibles   F·(C−1) + (F−1)·C
 *   abiertos en un árbol        N − 1
 *   paredes interiores          F·(C−1) + (F−1)·C − (N − 1)
 *   tramos del borde            2·F + 2·C − 2 (menos la entrada y la salida)
 *   <line> en el SVG            tramos del borde + 2 · paredes interiores
 *   15 × 15 → 420 posibles, 224 abiertos, 196 paredes, 58 de borde → 450 líneas
 *   32 × 32 → 1.984, 1.023, 961, 126 → 2.048 líneas ·  8 × 8 → 112, 63, 49, 30 → 128 líneas
 *   32 col × 8 filas → 472, 255, 217, 78 → 512 líneas, viewBox «-1 -1 322 82»
 *   El camino de (0,0) a (F−1, C−1) tiene al menos F + C − 1 casillas y, en una cuadrícula,
 *   siempre un número IMPAR de ellas cuando F + C es par (cada paso cambia la paridad de f + c).
 *
 * Lo aleatorio no se fija: con o sin n.º, se comprueban invariantes sobre el laberinto que salga.
 * Barrido previo (17/11/2026): 60 laberintos de 15 × 15 (n.º 1001-1030, los dos trazados) y los
 * límites 8 × 8, 32 × 32, 32 × 8 y 8 × 32: todos árboles, solución válida e igual al camino
 * único, callejones iguales a la métrica, también en un Pixel 7.
 */

interface Linea {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Lectura {
  viewBox: string;
  aria: string;
  lineas: Linea[];
  puntos: string | null;
}

interface Analisis {
  filas: number;
  columnas: number;
  totalLineas: number;
  raras: number;
  bordeMal: string[];
  asimetricas: number;
  abiertas: number;
  alcanzadas: number;
  caminoUnico: number[];
  callejones: number;
  adyacencia: number[][];
}

const huella = (l: Lectura): string => JSON.stringify(l.lineas);

async function leerLaberinto(page: Page): Promise<Lectura> {
  const svg = page.getByRole('img', { name: /^Laberinto de/ });
  await expect(svg).toBeVisible();
  return svg.evaluate((el) => {
    const lineas = Array.from(el.querySelectorAll('line')).map((l) => ({
      x1: Number(l.getAttribute('x1')),
      y1: Number(l.getAttribute('y1')),
      x2: Number(l.getAttribute('x2')),
      y2: Number(l.getAttribute('y2')),
    }));
    const poly = el.querySelector('polyline');
    return {
      viewBox: el.getAttribute('viewBox') ?? '',
      aria: el.getAttribute('aria-label') ?? '',
      lineas,
      puntos: poly ? poly.getAttribute('points') : null,
    };
  });
}

/** Reconstruye el laberinto desde sus paredes y calcula lo que la app debería mostrar. */
function analizar(l: Lectura): Analisis {
  const [, , ancho, alto] = l.viewBox.split(/\s+/).map(Number);
  const columnas = Math.round((ancho - 2) / 10);
  const filas = Math.round((alto - 2) / 10);
  const cuenta = new Map<string, number>();
  let raras = 0;
  for (const { x1, y1, x2, y2 } of l.lineas) {
    let clave: string | null = null;
    if (y1 === y2 && Math.abs(x2 - x1) === 10 && x1 % 10 === 0 && y1 % 10 === 0) {
      clave = `h:${y1 / 10}:${Math.min(x1, x2) / 10}`;
    } else if (x1 === x2 && Math.abs(y2 - y1) === 10 && x1 % 10 === 0 && y1 % 10 === 0) {
      clave = `v:${Math.min(y1, y2) / 10}:${x1 / 10}`;
    }
    if (clave) cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
    else raras++;
  }
  const veces = (k: string): number => cuenta.get(k) ?? 0;

  const bordeMal: string[] = [];
  for (let c = 0; c < columnas; c++) {
    const arriba = veces(`h:0:${c}`);
    const abajo = veces(`h:${filas}:${c}`);
    if (c === 0 ? arriba !== 0 : arriba !== 1) bordeMal.push(`arriba de (0,${c})`);
    if (c === columnas - 1 ? abajo !== 0 : abajo !== 1) bordeMal.push(`abajo de (${filas - 1},${c})`);
  }
  for (let f = 0; f < filas; f++) {
    if (veces(`v:${f}:0`) !== 1) bordeMal.push(`izquierda de (${f},0)`);
    if (veces(`v:${f}:${columnas}`) !== 1) bordeMal.push(`derecha de (${f},${columnas - 1})`);
  }

  const id = (f: number, c: number): number => f * columnas + c;
  const N = filas * columnas;
  const adyacencia: number[][] = Array.from({ length: N }, () => []);
  let abiertas = 0;
  let asimetricas = 0;
  const unir = (a: number, b: number, k: string): void => {
    const n = veces(k);
    if (n === 0) {
      adyacencia[a].push(b);
      adyacencia[b].push(a);
      abiertas++;
    } else if (n !== 2) {
      asimetricas++;
    }
  };
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (c + 1 < columnas) unir(id(f, c), id(f, c + 1), `v:${f}:${c + 1}`);
      if (f + 1 < filas) unir(id(f, c), id(f + 1, c), `h:${f + 1}:${c}`);
    }
  }

  const previo: number[] = new Array(N).fill(-2);
  previo[0] = -1;
  const cola = [0];
  while (cola.length > 0) {
    const u = cola.shift() as number;
    for (const v of adyacencia[u]) {
      if (previo[v] === -2) {
        previo[v] = u;
        cola.push(v);
      }
    }
  }
  const alcanzadas = previo.filter((p) => p !== -2).length;
  const caminoUnico: number[] = [];
  for (let u = N - 1; u >= 0; u = previo[u]) caminoUnico.unshift(u);

  // Tres paredes: grado 1 contando las aberturas de la entrada y de la salida
  let callejones = 0;
  for (let u = 0; u < N; u++) {
    const grado = adyacencia[u].length + (u === 0 || u === N - 1 ? 1 : 0);
    if (grado === 1) callejones++;
  }

  return {
    filas,
    columnas,
    totalLineas: l.lineas.length,
    raras,
    bordeMal,
    asimetricas,
    abiertas,
    alcanzadas,
    caminoUnico,
    callejones,
    adyacencia,
  };
}

/** Casillas de la polilínea de la solución, como índices f·C + c. */
function casillasDeLaSolucion(puntos: string, columnas: number): number[] {
  return puntos
    .trim()
    .split(/\s+/)
    .map((p) => {
      const [x, y] = p.split(',').map(Number);
      const c = (x - 5) / 10;
      const f = (y - 5) / 10;
      return Number.isInteger(c) && Number.isInteger(f) ? f * columnas + c : NaN;
    });
}

/** Lo que tiene que cumplir CUALQUIER laberinto de la app, con la solución visible. */
function comprobarInvariantes(l: Lectura, filas: number, columnas: number): Analisis {
  const a = analizar(l);
  const N = filas * columnas;
  const posibles = filas * (columnas - 1) + (filas - 1) * columnas;
  const paredes = posibles - (N - 1);
  const borde = 2 * filas + 2 * columnas - 2;
  expect(l.viewBox, 'dimensiones pedidas').toBe(`-1 -1 ${columnas * 10 + 2} ${filas * 10 + 2}`);
  expect(a.raras, 'toda línea es un tramo de pared de una casilla').toBe(0);
  expect(a.bordeMal, 'borde cerrado salvo la entrada (arriba-izquierda) y la salida (abajo-derecha)').toEqual([]);
  expect(a.asimetricas, 'cada pared interior la pintan sus dos casillas').toBe(0);
  expect(a.abiertas, `un árbol de ${N} casillas tiene ${N - 1} pasos abiertos`).toBe(N - 1);
  expect(a.alcanzadas, 'todas las casillas se alcanzan desde la entrada').toBe(N);
  expect(a.totalLineas, 'líneas = borde + 2 · paredes interiores').toBe(borde + 2 * paredes);

  // La solución pintada es EL camino: de la entrada a la salida, por pasos abiertos, sin repetir
  expect(l.puntos, 'la solución está visible').not.toBeNull();
  const sol = casillasDeLaSolucion(l.puntos as string, columnas);
  expect(sol[0], 'la solución empieza en la entrada').toBe(0);
  expect(sol[sol.length - 1], 'la solución acaba en la salida').toBe(N - 1);
  for (let i = 1; i < sol.length; i++) {
    expect(a.adyacencia[sol[i - 1]] ?? [], `paso ${i} de la solución atraviesa una pared`).toContain(sol[i]);
  }
  expect(new Set(sol).size, 'la solución no repite casillas').toBe(sol.length);
  expect(sol, 'la solución es el único camino del árbol').toEqual(a.caminoUnico);
  expect(sol.length, 'al menos F + C − 1 casillas').toBeGreaterThanOrEqual(filas + columnas - 1);
  if ((filas + columnas) % 2 === 0) expect(sol.length % 2, 'paridad de la cuadrícula').toBe(1);
  return a;
}

const metrica = (page: Page, etiqueta: string) =>
  page.getByText(etiqueta, { exact: true }).locator('xpath=preceding-sibling::span[1]');

const pieDeHoja = (page: Page) => page.locator('p', { hasText: 'Laberinto n.º' });

async function generar(
  page: Page,
  { columnas, filas, trazado, semilla }: { columnas?: number; filas?: number; trazado?: string; semilla?: string },
): Promise<void> {
  if (columnas) await page.getByLabel('Ancho (columnas)').selectOption(String(columnas));
  if (filas) await page.getByLabel('Alto (filas)').selectOption(String(filas));
  if (trazado) await page.getByRole('button', { name: new RegExp(`^${trazado}`) }).click();
  if (semilla !== undefined) {
    const caja = page.getByPlaceholder('Al azar');
    await caja.fill(semilla);
    await esperarValorEnReact(page, caja, semilla);
  }
  await page.getByRole('button', { name: /Generar laberinto/ }).click();
  if (columnas && filas) {
    await expect(page.getByRole('img', { name: new RegExp(`^Laberinto de ${columnas} por ${filas} casillas`) })).toBeVisible();
  }
}

async function verSolucion(page: Page): Promise<void> {
  const boton = page.getByRole('button', { name: /solución/ });
  if ((await boton.getAttribute('aria-pressed')) !== 'true') await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/generador-laberintos/');
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
});

test('CASO 1 (normal) · 15 × 15, pasillos largos, n.º 12345: árbol, solución válida, métricas y n.º reproducible', async ({ page }) => {
  await generar(page, { columnas: 15, filas: 15, trazado: 'Pasillos largos', semilla: '12345' });
  await expect(metrica(page, 'nº de laberinto')).toHaveText('12345');
  await verSolucion(page);
  const lectura = await leerLaberinto(page);
  const a = comprobarInvariantes(lectura, 15, 15);
  // Cuentas a mano: 450 líneas (58 de borde + 2 × 196 interiores) y 224 pasos abiertos
  expect(a.totalLineas).toBe(450);
  expect(a.abiertas).toBe(224);
  // Las métricas son las del laberinto dibujado
  await expect(metrica(page, 'casillas del camino correcto')).toHaveText(String(a.caminoUnico.length));
  await expect(metrica(page, 'callejones sin salida')).toHaveText(String(a.callejones));
  expect(lectura.aria).toBe(
    `Laberinto de 15 por 15 casillas. Entrada arriba a la izquierda, salida abajo a la derecha. El camino correcto mide ${a.caminoUnico.length} casillas.`,
  );
  await expect(pieDeHoja(page)).toHaveText('Laberinto n.º 12345 · 15×15 · Pasillos largos · meskeia.com');

  // El mismo n.º con el mismo tamaño y trazado da el mismo dibujo (FAQPage: «laberinto idéntico»).
  // Antes, otro n.º, para que la comparación no pase sin haber regenerado nada.
  await generar(page, { semilla: '54321' });
  await expect(metrica(page, 'nº de laberinto')).toHaveText('54321');
  expect(huella(await leerLaberinto(page)), 'el n.º 54321 da otro laberinto').not.toBe(huella(lectura));
  await generar(page, { semilla: '12345' });
  await expect(metrica(page, 'nº de laberinto')).toHaveText('12345');
  expect(huella(await leerLaberinto(page)), 'el n.º 12345 vuelve a dar el mismo').toBe(huella(lectura));
});

test('CASO 2 (límites) · 32 × 32 con el n.º más alto, 8 × 8, 32 × 8 y uno al azar: siguen siendo árboles con su solución', async ({ page }) => {
  const casos = [
    { columnas: 32, filas: 32, trazado: 'Muy ramificado', semilla: '9999999', lineas: 2048 },
    { columnas: 8, filas: 8, trazado: 'Pasillos largos', semilla: '1', lineas: 128 },
    { columnas: 32, filas: 8, trazado: 'Pasillos largos', semilla: '777', lineas: 512 },
  ];
  for (const caso of casos) {
    await generar(page, caso);
    await expect(metrica(page, 'nº de laberinto')).toHaveText(caso.semilla);
    await verSolucion(page);
    const a = comprobarInvariantes(await leerLaberinto(page), caso.filas, caso.columnas);
    expect(a.totalLineas, `${caso.columnas}×${caso.filas}`).toBe(caso.lineas);
    await expect(metrica(page, 'casillas del camino correcto')).toHaveText(String(a.caminoUnico.length));
    await expect(metrica(page, 'callejones sin salida')).toHaveText(String(a.callejones));
  }
  // Al azar (campo vacío): la app sortea un n.º de seis cifras y el laberinto cumple lo mismo
  await generar(page, { columnas: 12, filas: 20, trazado: 'Muy ramificado', semilla: '' });
  await expect(metrica(page, 'nº de laberinto')).toHaveText(/^[1-9]\d{5}$/);
  await verSolucion(page);
  comprobarInvariantes(await leerLaberinto(page), 20, 12);
});

test('CASO 3 (rechazo) · un n.º que no es un número («abc», «0») no se usa: sale uno al azar, visible y reproducible', async ({ page }) => {
  for (const malo of ['abc', '0']) {
    await generar(page, { columnas: 15, filas: 15, trazado: 'Pasillos largos', semilla: malo });
    const numero = metrica(page, 'nº de laberinto');
    // Esperado: el n.º de la hoja es el que se usó de verdad, uno al azar entre 100000 y 999999
    await expect(numero).toHaveText(/^[1-9]\d{5}$/);
    await verSolucion(page);
    const lectura = await leerLaberinto(page);
    comprobarInvariantes(lectura, 15, 15);
    // …y con ese n.º se reconstruye el mismo laberinto (pasando antes por otro, el 1)
    const n = (await numero.innerText()).trim();
    await generar(page, { semilla: '1' });
    await expect(numero).toHaveText('1');
    await generar(page, { semilla: n });
    await expect(numero).toHaveText(n);
    expect(huella(await leerLaberinto(page)), `«${malo}» → n.º ${n}`).toBe(huella(lectura));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS ABIERTOS (inspección del 17/11/2026). Cada uno afirma lo que la página promete;
// hoy no se cumple, de ahí el test.fail().
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO (17/11/2026, ABIERTO) · un laberinto con más filas que columnas se imprime en una sola hoja', async ({ page, browserName }) => {
  // FAQ visible: «Cada generación produce una hoja». La hoja ocupa el ancho útil del papel y el
  // alto sale de la proporción: con más filas que columnas el dibujo pasa de una página. Medido
  // en A4 (Chromium, @page 10 mm): 10 × 20 → 3 páginas, 8 × 32 → 4, con el laberinto partido;
  // 15 de las 49 combinaciones de tamaño lo cortan en A4, y en Carta todas las de más filas que
  // columnas salen en dos hojas o más.
  test.skip(browserName !== 'chromium', 'page.pdf solo existe en Chromium');
  test.fail();
  const paginas = (pdf: Buffer): number => (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  for (const [columnas, filas] of [
    [10, 20],
    [8, 32],
  ]) {
    await generar(page, { columnas, filas, semilla: '4242' });
    expect(paginas(await page.pdf({ format: 'A4' })), `${columnas}×${filas} en A4`).toBe(1);
  }
});

test('HALLAZGO (17/11/2026, ABIERTO) · «Otro distinto» da otro laberinto aunque haya un n.º escrito', async ({ page }) => {
  // generar() toma la semilla del campo si tiene cifras, y «Otro distinto» llama a la misma
  // función: con 12345 escrito vuelve a salir el laberinto 12345, idéntico.
  test.fail();
  await generar(page, { columnas: 15, filas: 15, trazado: 'Pasillos largos', semilla: '12345' });
  await expect(metrica(page, 'nº de laberinto')).toHaveText('12345');
  const antes = huella(await leerLaberinto(page));
  await page.getByRole('button', { name: /Otro distinto/ }).click();
  await expect(metrica(page, 'nº de laberinto')).not.toHaveText('12345');
  expect(huella(await leerLaberinto(page))).not.toBe(antes);
});

test('HALLAZGO (17/11/2026, ABIERTO) · tras cambiar de trazado sin regenerar, la hoja sigue diciendo con qué trazado se generó', async ({ page }) => {
  // El pie lee el trazado SELECCIONADO (estado `trazado`), no el del laberinto. Generado con
  // «Pasillos largos» y pulsado «Muy ramificado» sin regenerar, el pie dice «Muy ramificado», y
  // con esos datos (n.º 12345, 15×15, Muy ramificado) sale otro laberinto distinto del impreso.
  test.fail();
  await generar(page, { columnas: 15, filas: 15, trazado: 'Pasillos largos', semilla: '12345' });
  await expect(pieDeHoja(page)).toHaveText('Laberinto n.º 12345 · 15×15 · Pasillos largos · meskeia.com');
  await page.getByRole('button', { name: /^Muy ramificado/ }).click();
  await expect(page.getByRole('button', { name: /^Muy ramificado/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(pieDeHoja(page)).toContainText('Pasillos largos');
});

test('HALLAZGO (17/11/2026, ABIERTO) · «Desde la salida hacia atrás»: cerca de la meta NO hay menos bifurcaciones en los de pasillos largos', async ({ page }) => {
  // La guía dice: «cerca de la meta hay menos bifurcaciones que cerca de la entrada, porque el
  // camino correcto ya ha descartado casi todas las ramas». En un árbol, las bifurcaciones que se
  // cruzan por el camino correcto y las ramas falsas de cada una son las mismas en los dos
  // sentidos. Medido aquí: 10 laberintos de 15 × 15 de pasillos largos (n.º 1001-1010), casillas
  // del camino con tres o más pasos abiertos en la mitad de la salida frente a la de la entrada:
  // 59 frente a 28 el 17/11/2026 (en el barrido de 30, n.º 1001-1030: 161 frente a 80, más en la
  // mitad de la salida en 26 de 30). Si la frase se retira, el test pasa: quitar el test.fail.
  test.fail();
  const texto = await page.evaluate(() => document.body.textContent ?? '');
  const afirma = texto.includes('cerca de la meta hay menos');
  let entrada = 0;
  let salida = 0;
  for (let n = 1001; n <= 1010; n++) {
    await generar(page, { columnas: 15, filas: 15, trazado: 'Pasillos largos', semilla: String(n) });
    await expect(metrica(page, 'nº de laberinto')).toHaveText(String(n));
    const a = analizar(await leerLaberinto(page));
    const camino = a.caminoUnico;
    const mitad = Math.floor(camino.length / 2);
    camino.forEach((u, i) => {
      if (a.adyacencia[u].length < 3) return;
      if (i < mitad) entrada++;
      else if (i >= camino.length - mitad) salida++;
    });
  }
  if (afirma) expect(salida, `bifurcaciones: mitad de la salida ${salida}, mitad de la entrada ${entrada}`).toBeLessThan(entrada);
});

test('HALLAZGO (17/11/2026, ABIERTO) · «La mano en la pared» no «recorre todos los callejones»', async ({ page }) => {
  // En un laberinto perfecto con entrada y salida en el borde, seguir una pared recorre solo las
  // ramas de un lado del camino. Laberinto 12345 (15 × 15, pasillos largos): 20 callejones; con
  // la mano derecha se pasa por 13 y con la izquierda por 7. Si la frase se retira, pasa.
  test.fail();
  const texto = await page.evaluate(() => document.body.textContent ?? '');
  const afirma = texto.includes('recorre todos los callejones');
  await generar(page, { columnas: 15, filas: 15, trazado: 'Pasillos largos', semilla: '12345' });
  await expect(metrica(page, 'nº de laberinto')).toHaveText('12345');
  const a = analizar(await leerLaberinto(page));
  const N = a.filas * a.columnas;
  const DIR: [number, number][] = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
  const esCallejon = (u: number): boolean => a.adyacencia[u].length + (u === 0 || u === N - 1 ? 1 : 0) === 1;
  // Mano derecha: se entra por arriba mirando hacia abajo (d = 2) y en cada casilla se prueba
  // girar a la derecha, seguir recto, girar a la izquierda y volver, en ese orden. Se sale por
  // la abertura de abajo de la última casilla.
  let f = 0;
  let c = 0;
  let d = 2;
  let llegado = false;
  const visitadas = new Set<number>([0]);
  for (let pasos = 0; pasos < 20 * N && !llegado; pasos++) {
    for (const nd of [(d + 1) % 4, d, (d + 3) % 4, (d + 2) % 4]) {
      if (f === a.filas - 1 && c === a.columnas - 1 && nd === 2) {
        llegado = true;
        break;
      }
      const nf = f + DIR[nd][0];
      const nc = c + DIR[nd][1];
      if (nf < 0 || nf >= a.filas || nc < 0 || nc >= a.columnas) continue;
      if (!a.adyacencia[f * a.columnas + c].includes(nf * a.columnas + nc)) continue;
      f = nf;
      c = nc;
      d = nd;
      visitadas.add(f * a.columnas + c);
      break;
    }
  }
  expect(llegado, 'la mano derecha llega a la salida').toBe(true);
  const recorridos = [...visitadas].filter(esCallejon).length;
  if (afirma) expect(recorridos, `la mano derecha pasa por ${recorridos} de ${a.callejones} callejones`).toBe(a.callejones);
});

test('HALLAZGO (17/11/2026, ABIERTO) · el FAQPage no contradice a la página ni cita tamaños que no se pueden elegir', async ({ page }) => {
  // FAQPage, «¿Qué tamaño de laberinto es adecuado para cada edad?»: «de 12×12 a 16×16…» y «Más
  // que la edad, la señal fiable es la longitud del camino». La página dice «Los callejones sin
  // salida son el mejor indicador de dificultad», y el selector ofrece 8, 10, 12, 15, 20, 25 y
  // 32 (ni 16 ni el «30×30» de la pregunta de la impresión).
  test.fail();
  const faq = await page.evaluate(() => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { acceptedAnswer: { text: string } }[] };
      if (j['@type'] === 'FAQPage') return (j.mainEntity ?? []).map((q) => q.acceptedAnswer.text).join(' ');
    }
    return '';
  });
  expect(faq.length).toBeGreaterThan(0);
  const opciones = await page.getByLabel('Ancho (columnas)').locator('option').evaluateAll((os) => os.map((o) => Number((o as HTMLOptionElement).value)));
  const tamanos = [...faq.matchAll(/(\d+)×(\d+)/g)].flatMap((m) => [Number(m[1]), Number(m[2])]);
  for (const t of tamanos) expect(opciones, `«${t}» del FAQPage es un tamaño que se puede elegir`).toContain(t);
  const pagina = await page.evaluate(() => document.body.textContent ?? '');
  if (pagina.includes('callejones sin salida son el mejor indicador')) {
    expect(faq).not.toContain('la señal fiable es la longitud del camino');
  }
});

test('HALLAZGO (17/11/2026, ABIERTO) · la description no promete elegir un «nivel» que la app no tiene', async ({ page }) => {
  // «Elige tamaño, tipo de trazado y nivel»: los controles son ancho, alto, trazado y n.º.
  test.fail();
  const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
  if (/\bnivel\b/i.test(descripcion)) {
    const controles =
      (await page.getByRole('combobox', { name: /nivel/i }).count()) +
      (await page.getByRole('group', { name: /nivel/i }).count()) +
      (await page.getByRole('button', { name: /nivel/i }).count());
    expect(controles, 'algún control para elegir el nivel').toBeGreaterThan(0);
  }
});

test('HALLAZGO (17/11/2026, ABIERTO) · las características del JSON-LD escriben el porcentaje con espacio duro', async ({ page }) => {
  // «Funciona 100% en el navegador»: el % va separado con U+00A0 (CLAUDE.md, formato español).
  test.fail();
  const caracteristicas = await page.evaluate(() => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: string[] };
      if (j['@type'] === 'WebApplication') return j.featureList ?? [];
    }
    return [];
  });
  expect(caracteristicas.length).toBeGreaterThanOrEqual(4);
  for (const c of caracteristicas) expect(c, c).not.toMatch(/\d( )?%/);
});

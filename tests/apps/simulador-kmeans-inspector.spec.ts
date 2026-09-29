import { test, expect, type Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * simulador-kmeans — PRIMERA inspección del Inspector (29/09/2026).
 *
 * No repite lo que ya cubren simulador-kmeans.spec.ts (importación que llega al lienzo, escala
 * por eje, error visible, filas descartadas, botón de ejemplo), simulador-kmeans-k-desalineada
 * (mover K tras agrupar) ni tests/kmeans-parseo-motor.spec.ts (el parseo puro).
 *
 * ── Cómo se vuelve determinista un algoritmo aleatorio ─────────────────────────
 * La semilla de k-means++ sale de Math.random. Los casos de cálculo lo FIJAN a una constante
 * justo antes de pulsar «Inicializar centroides» (después de cargar los datos), y con eso cada
 * elección de semilla se resuelve a mano: el primer centroide es el punto floor(c·n) y cada uno
 * de los siguientes, el primer punto cuya suma acumulada de d² alcanza c·Σd².
 *
 * ── El lienzo ──────────────────────────────────────────────────────────────────
 * Los datos importados se escalan a un lienzo de 600 × 400 con margen 30: x → 30 + (x − xmin)/Δx·540
 * e y → 370 − (y − ymin)/Δy·340 (el eje Y se invierte). La inercia se calcula en esas unidades.
 *
 * Casos resueltos a mano ANTES de ejecutar:
 *   1. NORMAL: (1;1) (1;2) (2;1) (8;8) (8;9) (9;8), K = 2, Math.random = 0,1 → en el lienzo
 *      (30;370) (30;327,5) (97,5;370) (502,5;72,5) (502,5;30) (570;72,5). Semillas: el punto 0 y,
 *      con 0,1·1.037.087,5 = 103.708,75 de umbral, el punto 3. Inercia al inicializar
 *      2·(1.806,25 + 4.556,25) = 12.725; tras recalcular, centroides (52,5; 355,83) y
 *      (525; 58,33) e inercia 2·(⅔·67,5² + ⅔·42,5²) = 8.483,33 → «8483»; la iteración 2 ya no
 *      mueve nada → «Convergido» en la 2. En unidades de los datos: (4/3; 4/3), (25/3; 25/3) y
 *      WCSS = 8/3 ≈ 2,67 (HALLAZGO de las unidades, abajo).
 *   2. LÍMITES: K = n = 6 → inercia 0 y convergencia en la iteración 1 · (1;1) (1;1) (2;2) con
 *      K = 3 → el tercer centroide nace en (30 + 0,1·540; 30 + 0,1·340) = (84; 64) con 0 puntos ·
 *      K = 3 con dos puntos → no deja inicializar · el codo de tres grupos de cuatro puntos
 *      repetidos → K = 3, con inercia 891.466,67 en K = 1 y 377.000 en K = 2 (la cuenta, en el
 *      test) · K = 0 no se puede pedir (el deslizador empieza en 2).
 *   3. RECHAZO: solo líneas vacías, una sola fila, una coordenada no numérica, coma decimal con
 *      punto y coma y coma decimal con la coma como separador.
 * Y las dos SOSPECHAS de SOSPECHAS.md:
 *   (a) 27/09, escalar el clic con rect.width sobre un SVG «meet»: NO se da. La caja del contenido
 *       guarda el 3:2 del viewBox; el único desfase es el borde de 1 px que cuenta
 *       getBoundingClientRect, ≈ 1,1 px en las esquinas a 1280, 768 y 390.
 *   (b) 28/09, touch-action: none: deslizar dentro del lienzo NO desplaza la página, pero a
 *       390 × 844 el lienzo mide 246 × 165 px (63 % del ancho, 12 % de la pantalla) y deja 72 px
 *       de margen a cada lado donde el gesto sí desplaza.
 */

const RUTA = '/simulador-kmeans/';
const LIENZO = 'svg[aria-label="Lienzo de puntos para clustering"]';

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#k', '#datosPropios']);
}

async function importar(page: Page, texto: string): Promise<void> {
  await page.locator('#datosPropios').fill(texto);
  await esperarValorEnReact(page, '#datosPropios', texto);
  await page.getByRole('button', { name: 'Agrupar mis datos' }).click();
}

/** Fija la semilla de k-means++: a partir de aquí Math.random devuelve siempre `c`. */
async function fijarAzar(page: Page, c: number): Promise<void> {
  await page.evaluate((v) => {
    Math.random = () => v;
  }, c);
}

const boton = (page: Page, nombre: string) => page.getByRole('button', { name: nombre, exact: true });
const tarjeta = (page: Page, rotulo: string) =>
  page.locator('[class*="metricCard"]').filter({ hasText: rotulo });
/** La cifra de una tarjeta de métricas, sin su rótulo («0/ 20», «12.725»…). */
const valor = (page: Page, rotulo: string) => tarjeta(page, rotulo).locator('[class*="metricValue"]');
const filasCluster = (page: Page) => page.locator('[class*="clusterRow"]');
const resumen = (page: Page) => page.getByRole('status').filter({ hasText: 'puntos importados' });
const puntos = (page: Page) => page.locator(`${LIENZO} circle[class*="puntoCircle"]`);

/** Centros de los centroides DIBUJADOS (el cuadrado mide 18 y se coloca en c − 9). */
async function centroidesDibujados(page: Page): Promise<{ x: number; y: number }[]> {
  return page.locator(`${LIENZO} rect[class*="centroideMarker"]`).evaluateAll((els) =>
    els.map((el) => ({
      x: Number(el.getAttribute('x')) + 9,
      y: Number(el.getAttribute('y')) + 9,
    })),
  );
}

/**
 * Cuántos puntos DIBUJADOS llevan un color distinto del de su centroide dibujado más cercano.
 * Justo tras inicializar (o tras cualquier paso), la asignación de k-means es por definición
 * la del centroide más cercano: la cifra correcta es siempre 0.
 */
async function puntosConColorAjeno(page: Page): Promise<number> {
  return page.locator(LIENZO).evaluate((svg) => {
    const cent = [...svg.querySelectorAll('rect[class*="centroideMarker"]')].map((e) => ({
      x: Number(e.getAttribute('x')) + 9,
      y: Number(e.getAttribute('y')) + 9,
      fill: e.getAttribute('fill'),
    }));
    let ajenos = 0;
    for (const c of svg.querySelectorAll('circle[class*="puntoCircle"]')) {
      const px = Number(c.getAttribute('cx'));
      const py = Number(c.getAttribute('cy'));
      let mejor = { d: Infinity, fill: '' as string | null };
      for (const k of cent) {
        const d = (k.x - px) ** 2 + (k.y - py) ** 2;
        if (d < mejor.d) mejor = { d, fill: k.fill };
      }
      if (mejor.fill !== c.getAttribute('fill')) ajenos += 1;
    }
    return ajenos;
  });
}

const SEIS_PUNTOS = '1;1\n1;2\n2;1\n8;8\n8;9\n9;8';

test.describe('cálculo con datos propios (semilla fijada)', () => {
  test('normal: dos grupos de tres con K=2 → 12.725 al inicializar, 8483 y convergencia en la iteración 2', async ({ page }) => {
    await cargar(page);
    await importar(page, SEIS_PUNTOS);
    await expect(puntos(page)).toHaveCount(6);
    await sembrarValor(page, '#k', 2);
    await fijarAzar(page, 0.1);

    await boton(page, 'Inicializar centroides').click();
    // Semillas en los puntos 0 y 3: cada grupo con 1.806,25 + 4.556,25 de d² → 12.725
    await expect(valor(page, 'Inertia')).toHaveText('12.725');
    await expect(valor(page, 'Iteración')).toHaveText('0/ 20');

    await boton(page, 'Iterar 1 paso').click();
    // Centroides a la media: (52,5; 355,83) y (525; 58,33). Inercia 8.483,33, y con cuatro
    // cifras enteras Intl es-ES no agrupa (RAE): «8483»
    await expect(valor(page, 'Inertia')).toHaveText('8483');
    await expect(tarjeta(page, 'Estado')).toContainText('En progreso');

    await boton(page, 'Iterar 1 paso').click();
    // Recalcular otra vez no mueve nada (desplazamiento 0 < 0,5) → converge en la iteración 2
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    await expect(valor(page, 'Iteración')).toHaveText('2/ 20');
    await expect(valor(page, 'Inertia')).toHaveText('8483');
    await expect(filasCluster(page).nth(0)).toContainText('3 puntos');
    await expect(filasCluster(page).nth(1)).toContainText('3 puntos');

    // Los centroides dibujados son la media de su grupo en el lienzo. Precisión 0,01: un
    // recálculo equivocado (el punto de otro grupo, una media sin dividir) se va a decenas
    const [c1, c2] = await centroidesDibujados(page);
    expect(c1.x).toBeCloseTo(52.5, 2);          // (30 + 30 + 97,5) / 3
    expect(c1.y).toBeCloseTo(1067.5 / 3, 2);    // (370 + 327,5 + 370) / 3 = 355,83
    expect(c2.x).toBeCloseTo(525, 2);           // (502,5 + 502,5 + 570) / 3
    expect(c2.y).toBeCloseTo(175 / 3, 2);       // (72,5 + 30 + 72,5) / 3 = 58,33
  });

  test('HALLAZGO (ABIERTO): tras importar, el centroide se da en píxeles del lienzo y no en las unidades de los datos', async ({ page }) => {
    test.fail(true, 'ABIERTO: el panel dice «centroide (525,0, 58,3)» para un grupo cuya media es (8,33; 8,33)');
    await cargar(page);
    await importar(page, SEIS_PUNTOS);
    await sembrarValor(page, '#k', 2);
    await fijarAzar(page, 0.1);
    await boton(page, 'Inicializar centroides').click();
    await boton(page, 'Iterar 1 paso').click();
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    // Media de (8;8) (8;9) (9;8) = (25/3; 25/3) = (8,33; 8,33): con uno o dos decimales empieza
    // por «(8,3». Lo que sale hoy son las coordenadas del lienzo, (525,0, 58,3), con Y invertida
    // (ojo: «58,3» contiene «8,3», de ahí el paréntesis)
    await expect(filasCluster(page).nth(1)).toContainText(/centroide \(8,3/);
    await expect(filasCluster(page).nth(1)).not.toContainText('525');
  });

  test('límite K = n: seis puntos con K=6 → inercia 0 y convergencia en la iteración 1', async ({ page }) => {
    await cargar(page);
    await importar(page, SEIS_PUNTOS);
    await sembrarValor(page, '#k', 6);
    await fijarAzar(page, 0.1);
    await boton(page, 'Inicializar centroides').click();
    // k-means++ nunca repite un punto ya elegido (su d² es 0): seis semillas, una por punto
    await expect(valor(page, 'Inertia')).toHaveText('0');
    await expect(filasCluster(page)).toHaveCount(6);
    for (let j = 0; j < 6; j++) await expect(filasCluster(page).nth(j)).toContainText('1 punto');
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    await expect(valor(page, 'Iteración')).toHaveText('1/ 20');
    await expect(valor(page, 'Inertia')).toHaveText('0');
  });

  test('límite puntos repetidos: (1;1) dos veces y (2;2) con K=3 → un cluster vacío que la app declara con «0 puntos»', async ({ page }) => {
    await cargar(page);
    await importar(page, '1;1\n1;1\n2;2');
    await expect(boton(page, 'Inicializar centroides')).toBeEnabled();
    await fijarAzar(page, 0.1);
    await boton(page, 'Inicializar centroides').click();
    // Tras (30;370) y (570;30) todas las d² son 0: el tercer centroide va a un sitio al azar del
    // lienzo, (30 + 0,1·540; 30 + 0,1·340) = (84; 64), y nadie lo tiene como el más cercano
    await expect(filasCluster(page).nth(0)).toContainText('2 puntos');
    await expect(filasCluster(page).nth(1)).toContainText('1 punto');
    await expect(filasCluster(page).nth(2)).toContainText('0 puntos');
    await expect(filasCluster(page).nth(2)).toContainText('(84,0, 64,0)');
    await expect(valor(page, 'Inertia')).toHaveText('0');
    // El vacío conserva su posición: nada se mueve y converge en la 1
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    await expect(filasCluster(page).nth(2)).toContainText('0 puntos');
  });

  test('límite K mayor que el número de puntos: dos puntos con K=3 → no deja inicializar ni ejecutar', async ({ page }) => {
    await cargar(page);
    await importar(page, '1;1\n2;2');
    await expect(puntos(page)).toHaveCount(2);
    await expect(boton(page, 'Inicializar centroides')).toBeDisabled();
    await expect(boton(page, 'Ejecutar hasta convergencia')).toBeDisabled();
    // Y el codo pide 10 puntos
    await expect(boton(page, 'Calcular curva del codo')).toBeDisabled();
  });

  test('HALLAZGO (ABIERTO): con K mayor que el número de puntos los botones se apagan sin decir por qué', async ({ page }) => {
    test.fail(true, 'ABIERTO: ningún texto explica que K=3 pide al menos 3 puntos');
    await cargar(page);
    await importar(page, '1;1\n2;2');
    await expect(boton(page, 'Inicializar centroides')).toBeDisabled();
    // El panel de parámetros hoy no nombra los puntos en ningún sitio
    const panel = page.locator('div[class*="panel"]').filter({
      has: page.getByRole('heading', { name: 'Parámetros del algoritmo' }),
    });
    await expect(panel).toContainText(/punto/);
  });

  test('codo: tres grupos de cuatro puntos repetidos → codo en K = 3', async ({ page }) => {
    await cargar(page);
    await importar(
      page,
      ['0;0', '0;0', '0;0', '0;0', '10;0', '10;0', '10;0', '10;0', '5;10', '5;10', '5;10', '5;10'].join('\n'),
    );
    await boton(page, 'Calcular curva del codo').click();
    // Lienzo: a = (30;370), b = (570;370), c = (300;30), cuatro de cada. Media global (300; 256,67)
    //   K=1: 4·(270² + 113,33²)·2 + 4·226,67² = 891.466,67 → «891467» (Math.round en el <title>)
    //   K=2: la semilla que no está en c atrae a c (d² = 188.500 frente a 291.600 entre a y b),
    //        así que se funde c con a o con b: 4·188.500/2 = 377.000
    //   K≥3: cada grupo su centroide → 0
    // Codo: la distancia vertical a la cuerda (1; 891.466,67)–(10; 0) vale 415.414,8 en K=2 y
    // 693.363 en K=3 (y baja después) → K = 3
    const titulos = page.locator('svg[aria-label="Curva del método del codo"] title');
    await expect(titulos).toHaveCount(10);
    await expect(titulos.nth(0)).toHaveText('K=1, inertia=891467');
    await expect(titulos.nth(1)).toHaveText('K=2, inertia=377000');
    await expect(titulos.nth(2)).toHaveText('K=3, inertia=0');
    await expect(page.getByText('Codo detectado en K = 3')).toBeVisible();
  });

  test('HALLAZGO (ABIERTO): el eje X pesa 540 y el Y 340, así que el orden de las columnas cambia los grupos', async ({ page }) => {
    test.fail(true, 'ABIERTO: con las columnas intercambiadas la app agrupa A con B; sin intercambiar, A con C');
    // A(0;0), B(1;0), C(0,15;1). Con los dos ejes normalizados igual, A–B = 1 < A–C = 1,011 y
    // el grupo de menor inercia es {A,B}{C}; intercambiar las columnas es una simetría y no
    // puede cambiar la respuesta. En el lienzo, A–B = 540 y A–C = √(81² + 340²) = 349,5, y la
    // app agrupa {A,C}{B} (inercia 61.081); con las columnas al revés, A–B = 340 y A–C = 542,4,
    // y agrupa {A,B}{C} (inercia 57.800). Math.random = 0,5 lleva a las dos a su óptimo.
    const grupoDeA = async (texto: string): Promise<string> => {
      await cargar(page);
      await importar(page, texto);
      await sembrarValor(page, '#k', 2);
      await fijarAzar(page, 0.5);
      await boton(page, 'Inicializar centroides').click();
      await boton(page, 'Iterar 1 paso').click();
      await boton(page, 'Iterar 1 paso').click();
      await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
      const colores = await puntos(page).evaluateAll((els) => els.map((e) => e.getAttribute('fill')));
      return colores[0] === colores[1] ? 'A con B' : colores[0] === colores[2] ? 'A con C' : 'A sola';
    };
    const directo = await grupoDeA('0;0\n1;0\n0,15;1');
    const intercambiado = await grupoDeA('0;0\n0;1\n1;0,15');
    expect(directo).toBe(intercambiado);
  });
});

test.describe('importación: rechazos y formato', () => {
  test('coma decimal con punto y coma: «1,5;2 / 3;4,5» → rangos de 1,50 a 3 y de 2 a 4,50', async ({ page }) => {
    await cargar(page);
    await importar(page, '1,5;2\n3;4,5');
    await expect(puntos(page)).toHaveCount(2);
    // formatoValor: entero sin decimales, no entero con dos
    await expect(resumen(page)).toContainText('de 1,50 a 3');
    await expect(resumen(page)).toContainText('de 2 a 4,50');
  });

  test('solo líneas vacías → error «No hay datos» y los 90 puntos de partida siguen', async ({ page }) => {
    await cargar(page);
    await expect(puntos(page)).toHaveCount(90);
    await importar(page, '\n\n  \n');
    await expect(page.locator('p[class*="datosError"]')).toContainText('No hay datos');
    await expect(puntos(page)).toHaveCount(90);
  });

  test('una sola fila → error «al menos dos puntos»', async ({ page }) => {
    await cargar(page);
    await importar(page, '1 2');
    await expect(page.locator('p[class*="datosError"]')).toContainText('al menos dos puntos');
    await expect(puntos(page)).toHaveCount(90);
  });

  test('una coordenada no numérica en mitad de la tabla → se descarta y se cuenta', async ({ page }) => {
    await cargar(page);
    await importar(page, '2;3\n1;abc\n4;5');
    await expect(puntos(page)).toHaveCount(2);
    await expect(resumen(page)).toContainText('de 2 a 4');
    await expect(resumen(page)).toContainText('descartado 1');
  });

  test('HALLAZGO (ABIERTO): si la fila mala es la primera, se toma por cabecera y no se cuenta como descartada', async ({ page }) => {
    test.fail(true, 'ABIERTO: «1;abc» pasa a ser la cabecera: «Eje X: 1 · Eje Y: abc», sin aviso de fila descartada');
    await cargar(page);
    await importar(page, '1;abc\n2;3\n4;5');
    await expect(puntos(page)).toHaveCount(2);
    await expect(resumen(page)).toContainText('descartado 1');
  });

  test('HALLAZGO (ABIERTO): coma decimal con la coma como separador se lee sin aviso como otras columnas', async ({ page }) => {
    test.fail(true, 'ABIERTO: «1,5,2,5 / 3,2,4,8» se lee como (1;5) y (3;2): X de 1 a 3 e Y de 2 a 5');
    await cargar(page);
    await importar(page, '1,5,2,5\n3,2,4,8');
    // Leído como decimales serían X de 1,50 a 3,20 e Y de 2,50 a 4,80; la app parte por comas y
    // se queda con los dos primeros trozos. Lo que no puede pasar es que la lectura errónea
    // salga como buena sin decir nada
    await expect(resumen(page)).not.toContainText('de 1 a 3');
  });

  test('K = 0 no se puede pedir: el deslizador se queda en 2', async ({ page }) => {
    await cargar(page);
    const aceptado = await sembrarValorAcotado(page, '#k', 0);
    expect(aceptado).toBe('2');
    await expect(page.locator('#k + span')).toHaveText('2');
  });
});

test.describe('preset de partida', () => {
  test('HALLAZGO (ABIERTO): los puntos dibujados al cargar no son los que se agrupan', async ({ page }) => {
    test.fail(true, 'ABIERTO: el preset se sortea en el servidor y otra vez en el cliente; React no corrige cx/cy');
    await cargar(page);
    // K=5 sobre tres nubes: al menos una nube tiene dos semillas y queda partida en dos.
    // Justo tras inicializar, cada punto debe llevar el color del centroide más cercano
    await sembrarValor(page, '#k', 5);
    await boton(page, 'Inicializar centroides').click();
    await expect(filasCluster(page)).toHaveCount(5);
    // Medido: entre 21 y 32 de los 90 puntos dibujados, con colores mezclados dentro de la nube
    expect(await puntosConColorAjeno(page)).toBe(0);
  });

  test('control: con el preset generado en el navegador cada punto lleva el color de su centroide', async ({ page }) => {
    await cargar(page);
    await page.getByRole('button', { name: /3 gaussianas separadas/ }).click();
    await sembrarValor(page, '#k', 5);
    await boton(page, 'Inicializar centroides').click();
    await expect(filasCluster(page)).toHaveCount(5);
    expect(await puntosConColorAjeno(page)).toBe(0);
  });
});

test.describe('contenido', () => {
  test('HALLAZGO (ABIERTO): la métrica se rotula en inglés («Inertia»)', async ({ page }) => {
    test.fail(true, 'ABIERTO: «Inertia (SSE)», el eje «Inertia» del codo y su <title> «inertia=891467»');
    await cargar(page);
    await expect(page.locator('[class*="metricLabel"]').nth(1)).toContainText('Inercia');
  });

  test('HALLAZGO (ABIERTO): la guía da n_init = 10 como valor por defecto de scikit-learn', async ({ page }) => {
    test.fail(true, 'ABIERTO: desde scikit-learn 1.4 el valor por defecto es n_init="auto" (1 ejecución con k-means++)');
    await cargar(page);
    await expect(page.getByText('por defecto 10')).toHaveCount(0);
  });
});

/** Clic o toque en una fracción del lienzo; devuelve la distancia en px entre el punto creado y el evento. */
async function desfaseDelClic(page: Page, fx: number, fy: number, tocar: boolean): Promise<number> {
  const lienzo = page.locator(LIENZO);
  await page.evaluate(() => {
    const w = window as unknown as { __clic?: [number, number] };
    document.addEventListener('click', (e) => { w.__clic = [e.clientX, e.clientY]; }, { capture: true, once: true });
  });
  const caja = await lienzo.boundingBox();
  if (!caja) throw new Error('El lienzo no tiene caja');
  const x = caja.x + fx * caja.width;
  const y = caja.y + fy * caja.height;
  const antes = await puntos(page).count();
  if (tocar) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect(puntos(page)).toHaveCount(antes + 1);
  return lienzo.evaluate((svg) => {
    const el = svg as SVGSVGElement;
    const cs = el.querySelectorAll('circle[class*="puntoCircle"]');
    const c = cs[cs.length - 1];
    const p = el.createSVGPoint();
    p.x = Number(c.getAttribute('cx'));
    p.y = Number(c.getAttribute('cy'));
    const s = p.matrixTransform(el.getScreenCTM()!);
    const [ex, ey] = (window as unknown as { __clic: [number, number] }).__clic;
    return Math.hypot(s.x - ex, s.y - ey);
  });
}

test.describe('lienzo en escritorio: sospecha (a)', () => {
  test('el punto nace donde se hace clic (≤ 3 px) en el centro y en las cuatro esquinas', async ({ page }) => {
    await cargar(page);
    await boton(page, 'Limpiar todo').click();
    await expect(puntos(page)).toHaveCount(0);
    await page.locator(LIENZO).scrollIntoViewIfNeeded();
    // Una banda vacía por «meet» desplazaría decenas de px; el borde de 1 px da ≈ 1,1 px
    for (const [fx, fy] of [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]) {
      expect(await desfaseDelClic(page, fx, fy, false)).toBeLessThanOrEqual(3);
    }
  });
});

test.describe('lienzo en móvil 390 × 844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('sospecha (a): el punto nace donde se toca (≤ 3 px)', async ({ page }) => {
    await cargar(page);
    await boton(page, 'Limpiar todo').click();
    await expect(puntos(page)).toHaveCount(0);
    await page.locator(LIENZO).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    for (const [fx, fy] of [[0.5, 0.5], [0.1, 0.1], [0.9, 0.9]]) {
      expect(await desfaseDelClic(page, fx, fy, true)).toBeLessThanOrEqual(3);
    }
  });

  test('sospecha (b): el lienzo deja margen, y deslizar en el margen desplaza la página', async ({ page }) => {
    await cargar(page);
    const lienzo = page.locator(LIENZO);
    await lienzo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const caja = await lienzo.boundingBox();
    if (!caja) throw new Error('El lienzo no tiene caja');
    // Medido: 246 × 165 px, 72 px de margen a cada lado
    expect(caja.width / 390).toBeLessThan(0.7);
    expect(caja.x).toBeGreaterThanOrEqual(48);

    const cdp = await page.context().newCDPSession(page);
    const deslizar = async (x: number, y0: number, y1: number) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
      for (let i = 1; i <= 10; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / 10 }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const yMedio = caja.y + caja.height / 2;
    const antes = await page.evaluate(() => window.scrollY);
    await deslizar(caja.x / 2, yMedio + 60, yMedio - 60);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(antes + 50);
  });

  test('HALLAZGO (ABIERTO): en «Arrastrar», un dedo a 6 px del centro no coge el punto (mide 4 px)', async ({ page }) => {
    test.fail(true, 'ABIERTO: a 390 px el punto mide 4,1 px de diámetro y solo lo coge un toque a ≤ 3 px de su centro');
    await cargar(page);
    await importar(page, '0;0\n10;10');
    await boton(page, 'Arrastrar').click();
    const lienzo = page.locator(LIENZO);
    await lienzo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const centro = await lienzo.evaluate((svg) => {
      const el = svg as SVGSVGElement;
      const c = el.querySelector('circle[class*="puntoCircle"]')!;
      const p = el.createSVGPoint();
      p.x = Number(c.getAttribute('cx'));
      p.y = Number(c.getAttribute('cy'));
      const s = p.matrixTransform(el.getScreenCTM()!);
      return { x: s.x, y: s.y };
    });
    const cdp = await page.context().newCDPSession(page);
    const x = centro.x + 6;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: centro.y }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: centro.y - 5 * i }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    // (0;0) está en (30;370) del lienzo: arrastrado 40 px de pantalla hacia arriba, su cy baja
    await expect.poll(() => puntos(page).first().getAttribute('cy')).not.toBe('370');
  });
});

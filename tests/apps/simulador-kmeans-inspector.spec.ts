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
 * REPARADO el 29/09/2026 (hallazgos 2450 y 2451). Hasta entonces los datos importados se
 * estiraban a 540 px en X y 340 en Y, y la inercia y los centroides salían en esos píxeles.
 * Ahora cada columna se normaliza min-max a [0, 1] y se dibuja en un cuadrado de 340 px
 * centrado (x de 130 a 470, y de 30 a 370, Y invertida): x → 130 + u·340, y → 370 − v·340.
 * La inercia se da en unidades normalizadas (px² / 340²) y los centroides, en las unidades de
 * las columnas.
 *
 * Casos resueltos a mano ANTES de ejecutar:
 *   1. NORMAL: (1;1) (1;2) (2;1) (8;8) (8;9) (9;8), K = 2, Math.random = 0,1 → normalizados
 *      (0;0) (0;⅛) (⅛;0) (⅞;⅞) (⅞;1) (1;⅞). Semillas: el punto 0 y, con umbral 0,1·326/64 y
 *      d² acumuladas 0, 1, 2, 100 (/64), el punto 3. Inercia al inicializar 4/64 = 0,0625; tras
 *      recalcular, centroides (1/24; 1/24) y (11/12; 11/12) e inercia 2·12/576 = 1/24 ≈ 0,0417;
 *      la iteración 2 ya no mueve nada → «Convergido» en la 2. En unidades de las columnas:
 *      (4/3; 4/3) = (1,33; 1,33) y (25/3; 25/3) = (8,33; 8,33). La WCSS en las unidades de las
 *      columnas sería 8/3 = 64 · 1/24, pero no es lo que minimiza el algoritmo (ver el test).
 *   2. LÍMITES: K = n = 6 → inercia 0 y convergencia en la iteración 1 · (1;1) (1;1) (2;2) con
 *      K = 3 → el tercer centroide nace en el cuadrado de los datos, (130 + 0,1·340;
 *      30 + 0,1·340) = (164; 64), que en las columnas es (1,10; 1,90), con 0 puntos · K = 3 con
 *      dos puntos → no deja inicializar · el codo de tres grupos de cuatro puntos repetidos →
 *      K = 3, con inercia 14/3 ≈ 4,6667 en K = 1 y 2 en K = 2 (la cuenta, en el test) · K = 0
 *      no se puede pedir (el deslizador empieza en 2).
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

/**
 * Centros de los centroides DIBUJADOS. El cuadrado se coloca en c − lado/2; el lado es 18 en
 * escritorio y crece en un móvil (hallazgo 2452), así que se lee de su propio `width`.
 */
async function centroidesDibujados(page: Page): Promise<{ x: number; y: number }[]> {
  return page.locator(`${LIENZO} rect[class*="centroideMarker"]`).evaluateAll((els) =>
    els.map((el) => ({
      x: Number(el.getAttribute('x')) + Number(el.getAttribute('width')) / 2,
      y: Number(el.getAttribute('y')) + Number(el.getAttribute('height')) / 2,
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
      x: Number(e.getAttribute('x')) + Number(e.getAttribute('width')) / 2,
      y: Number(e.getAttribute('y')) + Number(e.getAttribute('height')) / 2,
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
  test('normal: dos grupos de tres con K=2 → 0,0625 al inicializar, 0,0417 y convergencia en la iteración 2', async ({ page }) => {
    await cargar(page);
    await importar(page, SEIS_PUNTOS);
    await expect(puntos(page)).toHaveCount(6);
    await sembrarValor(page, '#k', 2);
    await fijarAzar(page, 0.1);

    await boton(page, 'Inicializar centroides').click();
    // Semillas en los puntos 0 y 3: cada grupo con 1/64 + 1/64 de d² → 4/64 = 0,0625
    await expect(valor(page, 'Inercia')).toHaveText('0,0625');
    await expect(valor(page, 'Iteración')).toHaveText('0/ 20');

    await boton(page, 'Iterar 1 paso').click();
    // Centroides a la media: (1/24; 1/24) y (11/12; 11/12). Inercia 2 · 12/576 = 1/24
    await expect(valor(page, 'Inercia')).toHaveText('0,0417');
    await expect(tarjeta(page, 'Estado')).toContainText('En progreso');

    await boton(page, 'Iterar 1 paso').click();
    // Recalcular otra vez no mueve nada (desplazamiento 0 < 0,5) → converge en la iteración 2
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    await expect(valor(page, 'Iteración')).toHaveText('2/ 20');
    await expect(valor(page, 'Inercia')).toHaveText('0,0417');
    await expect(filasCluster(page).nth(0)).toContainText('3 puntos');
    await expect(filasCluster(page).nth(1)).toContainText('3 puntos');

    // Los centroides dibujados son la media de su grupo en el lienzo (cuadrado de 340 px desde
    // (130; 30)). Precisión 0,01: un recálculo equivocado se va a decenas
    const [c1, c2] = await centroidesDibujados(page);
    expect(c1.x).toBeCloseTo(130 + 340 / 24, 2);   // 144,17
    expect(c1.y).toBeCloseTo(370 - 340 / 24, 2);   // 355,83
    // (⅞ + ⅞ + 1) / 3 = 11/12 = ((25/3) − 1) / 8
    expect(c2.x).toBeCloseTo(130 + (340 * 11) / 12, 2);   // 441,67
    expect(c2.y).toBeCloseTo(370 - (340 * 11) / 12, 2);   // 58,33
  });

  test('HALLAZGO 2450 (REPARADO el 29/09/2026): tras importar, el centroide se da en las unidades de las columnas', async ({ page }) => {
    await cargar(page);
    await importar(page, SEIS_PUNTOS);
    await sembrarValor(page, '#k', 2);
    await fijarAzar(page, 0.1);
    await boton(page, 'Inicializar centroides').click();
    await boton(page, 'Iterar 1 paso').click();
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    // Medias (4/3; 4/3) y (25/3; 25/3). Antes: «centroide (52,5, 355,8)» y «(525,0, 58,3)»
    await expect(filasCluster(page).nth(0)).toContainText('centroide (1,33; 1,33)');
    await expect(filasCluster(page).nth(1)).toContainText('centroide (8,33; 8,33)');
    /*
     * El «esperado» del acta pedía además la WCSS en las unidades de las columnas, 8/3 ≈ 2,67.
     * Se REESCRIBE: la inercia se da en el espacio donde agrupa el algoritmo, el normalizado,
     * que es lo que hace scikit-learn con `inertia_` tras escalar; en las columnas habría que
     * sumar años² y euros², y esa suma no es la que baja en cada paso. Aquí vale 8/3 / 8² = 1/24
     * (las dos columnas tienen amplitud 8), y la app dice en qué unidades va.
     */
    await expect(valor(page, 'Inercia')).toHaveText('0,0417');
    const panel = page.locator('div[class*="panel"]').filter({
      has: page.getByRole('heading', { name: 'Tamaños de cada cluster' }),
    });
    await expect(panel).toContainText('unidades de tus columnas');
    await expect(panel).toContainText('unidades normalizadas');
  });

  test('límite K = n: seis puntos con K=6 → inercia 0 y convergencia en la iteración 1', async ({ page }) => {
    await cargar(page);
    await importar(page, SEIS_PUNTOS);
    await sembrarValor(page, '#k', 6);
    await fijarAzar(page, 0.1);
    await boton(page, 'Inicializar centroides').click();
    // k-means++ nunca repite un punto ya elegido (su d² es 0): seis semillas, una por punto
    await expect(valor(page, 'Inercia')).toHaveText('0');
    await expect(filasCluster(page)).toHaveCount(6);
    for (let j = 0; j < 6; j++) await expect(filasCluster(page).nth(j)).toContainText('1 punto');
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    await expect(valor(page, 'Iteración')).toHaveText('1/ 20');
    await expect(valor(page, 'Inercia')).toHaveText('0');
  });

  test('límite puntos repetidos: (1;1) dos veces y (2;2) con K=3 → un cluster vacío que la app declara con «0 puntos»', async ({ page }) => {
    await cargar(page);
    await importar(page, '1;1\n1;1\n2;2');
    await expect(boton(page, 'Inicializar centroides')).toBeEnabled();
    await fijarAzar(page, 0.1);
    await boton(page, 'Inicializar centroides').click();
    // Tras (130;370) y (470;30) todas las d² son 0: el tercer centroide va a un sitio al azar del
    // cuadrado de los datos, (130 + 0,1·340; 30 + 0,1·340) = (164; 64), y nadie lo tiene como el
    // más cercano. En las columnas (amplitud 1): x = 1 + 34/340 = 1,10 e y = 1 + 306/340 = 1,90.
    // (Antes del 29/09/2026 salía «(84,0, 64,0)», en píxeles de todo el lienzo.)
    await expect(filasCluster(page).nth(0)).toContainText('2 puntos');
    await expect(filasCluster(page).nth(1)).toContainText('1 punto');
    await expect(filasCluster(page).nth(2)).toContainText('0 puntos');
    await expect(filasCluster(page).nth(2)).toContainText('(1,10; 1,90)');
    await expect(valor(page, 'Inercia')).toHaveText('0');
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

  test('HALLAZGO 2453 (REPARADO el 29/09/2026): con K mayor que el número de puntos, la app dice por qué no deja agrupar', async ({ page }) => {
    await cargar(page);
    await importar(page, '1;1\n2;2');
    await expect(boton(page, 'Inicializar centroides')).toBeDisabled();
    /*
     * El acta pedía el aviso en el panel «Parámetros del algoritmo». Se pone en la nota de
     * DEBAJO del lienzo («2 puntos en el lienzo · Con K = 3 hacen falta…»), junto a donde se
     * añaden puntos, y en el `title` de los botones apagados: en el panel de parámetros el
     * aviso aparecía y desaparecía mientras se tocaba el lienzo y lo movía 23 px bajo el dedo
     * (lo cazó el test de la sospecha (a) en móvil).
     */
    const nota = page.locator('p[class*="lienzoNota"]');
    await expect(nota).toContainText('2 puntos en el lienzo');
    await expect(nota).toContainText('Con K = 3 hacen falta al menos 3 puntos');
    await expect(boton(page, 'Inicializar centroides')).toHaveAttribute('title', /al menos 3 puntos/);
    // Y el codo, por debajo de 10 puntos
    await expect(page.getByText('necesita al menos 10 puntos; ahora hay 2')).toBeVisible();
    // Al bajar K a 2 el aviso se va y el botón se enciende
    await sembrarValor(page, '#k', 2);
    await expect(nota).not.toContainText('hacen falta al menos');
    await expect(boton(page, 'Inicializar centroides')).toBeEnabled();
  });

  test('codo: tres grupos de cuatro puntos repetidos → codo en K = 3', async ({ page }) => {
    await cargar(page);
    await importar(
      page,
      ['0;0', '0;0', '0;0', '0;0', '10;0', '10;0', '10;0', '10;0', '5;10', '5;10', '5;10', '5;10'].join('\n'),
    );
    /*
     * Reescrito el 29/09/2026 con la normalización simétrica (hallazgo 2451). Normalizados,
     * a = (0;0), b = (1;0), c = (0,5;1), cuatro de cada; ahora a y b están MÁS cerca entre sí
     * (d² = 1) que cada uno de c (d² = 1,25), y con K=2 el resultado depende de las semillas:
     * {a,b}{c} da 2 y {a,c}{b} da 2,5. Por eso se fija el azar a 0,5 (antes no hacía falta):
     * primera semilla floor(0,5·12) = 6, un b; segunda, umbral 0,5·9 = 4,5 sobre las d²
     * acumuladas 1, 2, 3, 4 (las a), 5,25 (primera c) → c. Semillas b y c: las a van con b.
     *   K=1: media (0,5; ⅓) → 4·[2·(0,25 + 1/9) + 4/9] = 14/3 ≈ 4,6667
     *   K=2: {a,b} con centroide (0,5; 0) → 8·0,25 = 2
     *   K≥3: cada grupo su centroide → 0
     * Codo: la distancia vertical a la cuerda (1; 4,67)–(10; 0) vale 2,15 en K=2 y 3,63 en K=3
     * (y baja después) → K = 3
     */
    await fijarAzar(page, 0.5);
    await boton(page, 'Calcular curva del codo').click();
    const titulos = page.locator('svg[aria-label="Curva del método del codo"] title');
    await expect(titulos).toHaveCount(10);
    await expect(titulos.nth(0)).toHaveText('K=1, inercia=4,6667');
    await expect(titulos.nth(1)).toHaveText('K=2, inercia=2,0000');
    await expect(titulos.nth(2)).toHaveText('K=3, inercia=0');
    await expect(page.getByText('Codo detectado en K = 3')).toBeVisible();
  });

  test('HALLAZGO 2451 (REPARADO el 29/09/2026): el orden de las columnas no cambia los grupos', async ({ page }) => {
    // A(0;0), B(1;0), C(0,15;1). Con los dos ejes normalizados igual, A–B = 1 < A–C = 1,011 y
    // el grupo de menor inercia es {A,B}{C}; intercambiar las columnas es una simetría y no
    // puede cambiar la respuesta. Antes, en el lienzo estirado, A–B = 540 y A–C = 349,5, y la
    // app agrupaba {A,C}{B}; con las columnas al revés agrupaba {A,B}{C}. Math.random = 0,5:
    // semillas B (floor(1,5)) y C (umbral 0,5·2,7225 tras A = 1), y A va con B (1 < 1,0225).
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
    expect(directo).toBe('A con B');
    expect(intercambiado).toBe('A con B');
  });

  test('SOSPECHA confirmada y REPARADA (29/09/2026): parada en el tope de iteraciones sin converger no es «En progreso»', async ({ page }) => {
    await cargar(page);
    // 40 puntos en una recta (0..39; Y constante, que se centra), K = 2, azar 0,00001: semillas
    // en los puntos 0 (floor(0,0004)) y 1 (umbral 0,00001·Σi² = 0,2 ≤ 1). Lloyd avanza la
    // frontera poco a poco: el primer grupo pasa de 11 a 16, 18, 19 y 20 puntos, y los
    // centroides se mueven 165,6 · 43,6 · 21,8 · 8,7 · 4,4 · 4,4 · 0 px en las iteraciones
    // 1 a 7 (simulado con la misma aritmética; separaciones irregulares, sin empates
    // exactos). Con 5 iteraciones máximas se para SIN converger. Hasta el 29/09/2026 la
    // tarjeta decía «En progreso», como si siguiera trabajando.
    await importar(page, Array.from({ length: 40 }, (_, i) => `${i};0`).join('\n'));
    await sembrarValor(page, '#k', 2);
    await sembrarValorAcotado(page, '#iter', 5);
    await fijarAzar(page, 0.00001);
    await boton(page, 'Ejecutar hasta convergencia').click();
    await expect(valor(page, 'Iteración')).toHaveText('5/ 5', { timeout: 10_000 });
    await expect(tarjeta(page, 'Estado')).toContainText('Tope sin converger');
    // Dos pasos más a mano: la 6.ª aún mueve 4,4 px y la 7.ª converge, 20 y 20
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Tope sin converger');
    await boton(page, 'Iterar 1 paso').click();
    await expect(tarjeta(page, 'Estado')).toContainText('Convergido');
    await expect(filasCluster(page).nth(0)).toContainText('20 puntos');
    await expect(filasCluster(page).nth(1)).toContainText('20 puntos');
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

  test('HALLAZGO 2454 (REPARADO el 29/09/2026): si la fila mala es la primera, se cuenta como descartada y no como cabecera', async ({ page }) => {
    await cargar(page);
    await importar(page, '1;abc\n2;3\n4;5');
    await expect(puntos(page)).toHaveCount(2);
    await expect(resumen(page)).toContainText('Se ha descartado 1 fila que no contenía dos números');
    await expect(resumen(page)).toContainText('Eje X: Columna 1');
    await expect(resumen(page)).toContainText('Eje Y: Columna 2');
  });

  test('HALLAZGO 2455 (REPARADO el 29/09/2026): coma decimal con la coma como separador → se avisa de la lectura', async ({ page }) => {
    await cargar(page);
    await importar(page, '1,5,2,5\n3,2,4,8');
    /*
     * El acta aceptaba dos salidas: leer (1,5; 2,5) o avisar de la ambigüedad. Se elige el
     * aviso, y la aserción se reescribe: «1,5,2,5» es TAMBIÉN un CSV válido de cuatro columnas
     * enteras (y «1,2,99», uno de tres), así que adivinar decimales rompería esos casos. La
     * lectura por columnas se mantiene, pero ya no sale como buena sin decir nada: el resumen
     * cita los números leídos y cómo pegarlos para que se lean con coma decimal.
     */
    await expect(resumen(page)).toContainText('Revisa la lectura');
    await expect(resumen(page)).toContainText('4 campos separados por comas');
    await expect(resumen(page)).toContainText('X = 1 e Y = 5');
    // Y separados con punto y coma, como pide el aviso, se leen con su coma decimal
    await importar(page, '1,5;2,5\n3,2;4,8');
    await expect(resumen(page)).toContainText('de 1,50 a 3,20');
    await expect(resumen(page)).not.toContainText('Revisa la lectura');
  });

  test('K = 0 no se puede pedir: el deslizador se queda en 2', async ({ page }) => {
    await cargar(page);
    const aceptado = await sembrarValorAcotado(page, '#k', 0);
    expect(aceptado).toBe('2');
    await expect(page.locator('#k + span')).toHaveText('2');
  });
});

test.describe('preset de partida', () => {
  test('HALLAZGO 2449 (REPARADO el 29/09/2026): los puntos dibujados al cargar son los que se agrupan', async ({ page }) => {
    // Antes el preset se sorteaba con Math.random en el servidor y otra vez en el cliente, y
    // React no corrige cx/cy. Ahora sale de un generador con semilla, igual en los dos lados.
    await cargar(page);
    // K=5 sobre tres nubes: al menos una nube tiene dos semillas y queda partida en dos.
    // Justo tras inicializar, y tras cada paso, cada punto debe llevar el color del centroide
    // dibujado más cercano. Medido antes de reparar: entre 20 y 32 de los 90, mezclados
    await sembrarValor(page, '#k', 5);
    await boton(page, 'Inicializar centroides').click();
    await expect(filasCluster(page)).toHaveCount(5);
    expect(await puntosConColorAjeno(page)).toBe(0);
    for (let i = 0; i < 3; i++) {
      await boton(page, 'Iterar 1 paso').click();
      await expect(valor(page, 'Iteración')).toHaveText(`${i + 1}/ 20`);
      expect(await puntosConColorAjeno(page)).toBe(0);
    }
  });

  test('HALLAZGO 2449: los cx/cy del DOM son los del estado de React, y no hay aviso de desajuste', async ({ page }) => {
    const avisos: string[] = [];
    page.on('console', (m) => {
      if (/hydrat|didn.t match|did not match/i.test(m.text())) avisos.push(m.text().slice(0, 300));
    });
    // Lo que sirve el prerender, sin ejecutar nada: 90 puntos
    const html = await (await page.request.get(RUTA)).text();
    expect(html.match(/<circle[^>]*puntoCircle/g) ?? []).toHaveLength(90);

    await page.goto(RUTA, { waitUntil: 'networkidle' });
    await esperarHidratacion(page, ['#k', '#datosPropios']);
    // El aviso de React llega DESPUÉS del testigo de hidratación (receta de 92c9490c)
    await page.waitForTimeout(1500);
    expect(avisos, 'avisos de hidratación en la consola').toEqual([]);
    // React no reescribe un atributo cuyo valor no cambia, así que un DOM del servidor con
    // otro estado debajo solo se delata comparando con las props que React guarda en el nodo.
    // Antes de reparar: los 90 distintos
    const distintos = await puntos(page).evaluateAll((els) =>
      els.filter((e) => {
        const clave = Object.keys(e).find((k) => k.startsWith('__reactProps'));
        if (!clave) return true;
        const props = (e as unknown as Record<string, { cx: number; cy: number }>)[clave];
        return String(props.cx) !== e.getAttribute('cx') || String(props.cy) !== e.getAttribute('cy');
      }).length,
    );
    expect(distintos).toBe(0);
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
  test('HALLAZGO 2456 (REPARADO el 29/09/2026): la métrica se rotula en español y la cifra con formato español', async ({ page }) => {
    await cargar(page);
    await expect(page.locator('[class*="metricLabel"]').nth(1)).toHaveText('Inercia (SSE)');
    await expect(page.getByText(/inertia/i)).toHaveCount(0);
    // Con los datos sintéticos la inercia va en px² y con millares: el <title> del codo
    // ya no es «inertia=891467» sino «inercia=…» con punto de millar
    await boton(page, 'Calcular curva del codo').click();
    const primero = page.locator('svg[aria-label="Curva del método del codo"] title').first();
    await expect(primero).toHaveText(/^K=1, inercia=\d{1,3}(\.\d{3})+$/);
    await expect(page.locator('svg[aria-label="Curva del método del codo"]')).toContainText('Inercia');
  });

  test('HALLAZGO 2456: una fila descartada concuerda en singular', async ({ page }) => {
    await cargar(page);
    await importar(page, '1;2\nfila rota\n3;4');
    await expect(resumen(page)).toContainText('Se ha descartado 1 fila que no contenía dos números.');
    await importar(page, '1;2\nrota\notra rota\n3;4');
    await expect(resumen(page)).toContainText('Se han descartado 2 filas que no contenían dos números.');
  });

  test('HALLAZGO 2457 (REPARADO el 29/09/2026): la guía da n_init=\'auto\' como valor por defecto de scikit-learn', async ({ page }) => {
    // Documentación de KMeans: «Changed in version 1.4: Default value for n_init changed to
    // 'auto'» — 1 ejecución con init='k-means++' (el valor por defecto) y 10 con 'random'
    await cargar(page);
    await expect(page.getByText('por defecto 10')).toHaveCount(0);
    await expect(page.getByText(/Desde la versión 1\.4 vale/)).toHaveCount(1);
  });

  test('SOSPECHA confirmada y REPARADA (29/09/2026): k-means no es «la base de los formatos GIF»', async ({ page }) => {
    // GIF89a solo define una tabla de hasta 256 colores; cómo se construye la paleta lo decide
    // el programa que codifica (median cut, octree, k-means…)
    await cargar(page);
    await expect(page.getByText('base de los formatos GIF')).toHaveCount(0);
    await expect(page.getByText(/el formato no fija el método/)).toHaveCount(1);
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

  /*
   * Sospecha (b), REESCRITA el 29/09/2026 al reparar el hallazgo 2452. Antes el lienzo medía
   * 246 × 165 px y dejaba 72 px de margen a cada lado, que eran el único sitio donde deslizar
   * desplazaba la página (touch-action: none en el lienzo). Al agrandarlo, ese margen se queda
   * en ~25 px; por eso el lienzo pasa a touch-action: manipulation (receta de simulador-grafos)
   * y lo que se comprueba ahora es que deslizar DENTRO del lienzo baja la página sin crear un
   * punto, y que el lienzo ocupa casi todo el ancho.
   */
  const deslizarCon = async (page: Page, x: number, y0: number, y1: number) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / 10 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };

  test('sospecha (b): el lienzo ocupa casi todo el ancho, y deslizar sobre él desplaza la página sin crear puntos', async ({ page }) => {
    await cargar(page);
    const lienzo = page.locator(LIENZO);
    await lienzo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const caja = await lienzo.boundingBox();
    if (!caja) throw new Error('El lienzo no tiene caja');
    // 390 − 2·(16 del contenedor + 8 de .main + 1 de borde) = 340 px (antes 246)
    expect(caja.width).toBeGreaterThanOrEqual(330);

    const yMedio = caja.y + caja.height / 2;
    const antes = await page.evaluate(() => window.scrollY);
    await deslizarCon(page, caja.x + caja.width / 2, yMedio + 60, yMedio - 60);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(antes + 50);
    await expect(puntos(page)).toHaveCount(90);
  });

  test('HALLAZGO 2452 (REPARADO el 29/09/2026): puntos y centroides con tamaño mínimo en pantalla', async ({ page }) => {
    await cargar(page);
    await boton(page, 'Inicializar centroides').click();
    const lienzo = page.locator(LIENZO);
    await lienzo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    // Antes: puntos de 4,1 px de diámetro y centroides de 7,3 px
    const punto = await puntos(page).first().boundingBox();
    const centroide = await page.locator(`${LIENZO} rect[class*="centroideMarker"]`).first().boundingBox();
    if (!punto || !centroide) throw new Error('Sin cajas');
    // Mínimos de 8 y 16 px; la caja se ajusta a píxeles de dispositivo (⅓ de px a DPR 3), medido 7,88
    expect(punto.width).toBeGreaterThanOrEqual(7.6);
    expect(centroide.width).toBeGreaterThanOrEqual(15.6);
  });

  test('HALLAZGO 2452 (REPARADO el 29/09/2026): en «Arrastrar», un dedo a 6 px del centro coge el punto', async ({ page }) => {
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
    // (0;0) está en (130;370) del lienzo: arrastrado 40 px de pantalla hacia arriba (≈ 70
    // unidades a escala 0,57), su cy baja. Y la página no se ha movido con el gesto
    await expect.poll(async () => Number(await puntos(page).first().getAttribute('cy'))).toBeLessThan(330);
    const cy = Number(await puntos(page).first().getAttribute('cy'));
    expect(cy).toBeGreaterThan(280);
  });

  test('HALLAZGO 2452: con dos puntos cerca, el toque coge el más cercano al dedo', async ({ page }) => {
    await cargar(page);
    // (0;0), (1;0) y (10;10): los dos primeros quedan a 34 unidades (≈ 19 px) uno del otro
    await importar(page, '0;0\n1;0\n10;10');
    await boton(page, 'Arrastrar').click();
    const lienzo = page.locator(LIENZO);
    await lienzo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const centros = await lienzo.evaluate((svg) => {
      const el = svg as SVGSVGElement;
      return [...el.querySelectorAll('circle[class*="puntoCircle"]')].map((c) => {
        const p = el.createSVGPoint();
        p.x = Number(c.getAttribute('cx'));
        p.y = Number(c.getAttribute('cy'));
        const s = p.matrixTransform(el.getScreenCTM()!);
        return { x: s.x, y: s.y };
      });
    });
    const antes = await puntos(page).evaluateAll((els) => els.map((e) => e.getAttribute('cx')));
    // Toque a 4 px a la izquierda del SEGUNDO punto (y a 15 px del primero), arrastre de 30 px abajo
    const cdp = await page.context().newCDPSession(page);
    const x = centros[1].x - 4;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: centros[1].y }] });
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: centros[1].y - 5 * i }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => puntos(page).nth(1).getAttribute('cy')).not.toBe('370');
    // El primero no se ha movido
    await expect(puntos(page).first()).toHaveAttribute('cy', '370');
    await expect(puntos(page).first()).toHaveAttribute('cx', antes[0] ?? '');
  });
});

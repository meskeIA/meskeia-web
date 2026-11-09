import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { parseSpanishNumber } from '@/lib/formatters';

/**
 * calculadora-receta-pan — verificación de INTERACCIÓN (PASO 4.bis de /nueva-app-meskeia)
 *
 * El cálculo ya tiene sus propios casos resueltos a mano contra la lógica pura, en
 * `tests/panaderia-motores.spec.ts` («Receta de pan — el camino de la harina a la fórmula»).
 * Aquí NO se vuelve a verificar aritmética: se verifican las transiciones de estado, que es
 * lo que un motor probado no puede garantizar por su cuenta.
 *
 * QUÉ ESTADO TIENE ESTA APP
 *   Cinco decisiones encadenadas (harina en gramos · tipo de pan · tipo y proporción de harina ·
 *   fermento y ritmo · extras opcionales), y entre ellas una dependencia que NO es simétrica:
 *   con masa madre, el ritmo «lo antes posible» deja de estar disponible, porque el pan de masa
 *   madre en dos horas no existe por mucho que se suba la dosis.
 *
 * EL FALLO QUE ESTE FICHERO CAZÓ (13/09/2026, antes del primer despliegue)
 *   Elegir «lo antes posible» con levadura y cambiar después a masa madre dejaba el botón
 *   deshabilitado PERO seguía siendo el ritmo del estado. Como su `aria-pressed` depende de que
 *   el ritmo esté permitido, el resultado era una pantalla con los cuatro ritmos sin ninguno
 *   marcado, mientras abajo se mostraba una receta calculada con un ritmo que nada señalaba. El
 *   motor se defendía solo (recalculaba al ritmo siguiente y lo avisaba), así que el cálculo
 *   nunca estuvo mal: lo que estaba mal era lo que la pantalla decía. Ningún test de lógica pura
 *   podía verlo. Arreglado moviendo el ritmo a «esta tarde» al cambiar de fermento.
 */

/** El resultado es reactivo: no hay botón de calcular, así que se espera al texto. */
async function irALaApp(page: Page) {
  await page.goto('/calculadora-receta-pan/');
  await esperarHidratacion(page, ['#harina-g']);
}

/**
 * La tabla de la receta, NO la comparativa del bloque educativo: en esta página hay dos, y un
 * `locator('table')` a secas las coge las dos. Se distingue por su `caption`.
 */
const tablaReceta = (page: Page) => page.getByRole('table', { name: /Ingredientes de la receta/ });

/**
 * Una fila de la receta, buscada por el NOMBRE del ingrediente, no por el texto de la fila:
 * cada fila lleva una nota explicativa y varias mencionan el agua, así que un `hasText` ancho
 * devolvía la fila equivocada — la de la espelta al pedir la del agua.
 */
const filaDe = (page: Page, nombre: RegExp) =>
  tablaReceta(page)
    .locator('tbody tr')
    .filter({ has: page.locator('td strong').filter({ hasText: nombre }) })
    .first();

test.describe('Calculadora de pan casero — interacción', () => {
  test('ESTADO INICIAL: arranca con una receta ya calculada y coherente', async ({ page }) => {
    await irALaApp(page);

    // Hogaza rústica al 72 %, 500 g de harina, levadura seca, ritmo de tarde.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadora de pan casero');
    await expect(tablaReceta(page)).toBeVisible();
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g');
    await expect(filaDe(page, /^Sal$/)).toContainText('10 g');
    await expect(filaDe(page, /^Levadura seca/)).toBeVisible();
  });

  test('CAMBIAR EL PAN recalcula el agua sin tocar nada más', async ({ page }) => {
    await irALaApp(page);
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g'); // hogaza, 72 %

    await page.getByRole('button', { name: /Chapata/ }).click();
    // 78 % sobre 500 g = 390 g de agua. Y la sal sube a 11 g, porque la chapata va al 2,2 %
    // y no al 2 % de la hogaza: el tipo de pan cambia la fórmula entera, no solo el agua.
    await expect(filaDe(page, /^Agua$/)).toContainText('390 g');
    await expect(filaDe(page, /^Sal$/)).toContainText('11 g');
  });

  test('LA PROPORCIÓN DE HARINA solo aparece cuando hay algo que mezclar', async ({ page }) => {
    await irALaApp(page);

    // Con trigo panificable (la harina base) no hay nada que mezclar: el deslizador no existe.
    await expect(page.locator('#proporcion')).toHaveCount(0);

    await page.locator('#tipo-harina').selectOption('espelta');
    await expect(page.locator('#proporcion')).toBeVisible();
    // Al 100 % de espelta la hidratación baja 4 puntos: 500 × 68 % = 340 g.
    await expect(filaDe(page, /^Agua$/)).toContainText('340 g');
    // Y se avisa de que se ha pasado del máximo recomendado, que es lo útil aquí.
    await expect(page.getByText(/Por encima del 70 % de espelta/)).toBeVisible();
  });

  test('BAJAR LA PROPORCIÓN rehace la mezcla y retira el aviso', async ({ page }) => {
    await irALaApp(page);
    await page.locator('#tipo-harina').selectOption('espelta');
    await expect(page.getByText(/Por encima del 70 % de espelta/)).toBeVisible();

    // Se parte del 100 %, así que 50 % es un valor DISTINTO del que ya tiene: si el evento se
    // perdiera, el testigo de React lo diría en vez de dar un verde falso.
    await sembrarValor(page, '#proporcion', '50');

    // Media espelta: 72 − 2 = 70 % → 350 g. Y ahora la lista tiene DOS harinas.
    await expect(filaDe(page, /^Agua$/)).toContainText('350 g');
    await expect(filaDe(page, /^Espelta blanca$/)).toBeVisible();
    await expect(filaDe(page, /^Trigo panificable$/)).toBeVisible();
    await expect(page.getByText(/Por encima del 70 % de espelta/)).toHaveCount(0);
  });

  test('EL RITMO VETADO NO SE QUEDA PUESTO al cambiar a masa madre', async ({ page }) => {
    // El fallo de la cabecera. Es la única transición de la app que no es reversible sin más.
    await irALaApp(page);

    const rapido = page.getByRole('button', { name: /Lo antes posible/ });
    await rapido.click();
    await expect(rapido).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /Masa madre/ }).click();

    // El ritmo rápido queda deshabilitado…
    await expect(rapido).toBeDisabled();
    await expect(rapido).toHaveAttribute('aria-pressed', 'false');
    // …y ALGÚN ritmo tiene que quedar señalado: una receta sin ritmo visible es una receta
    // calculada con un parámetro que el usuario no puede ver.
    await expect(page.getByRole('button', { name: /Esta tarde/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('LA MASA MADRE aparece en la lista y trae su harina dentro', async ({ page }) => {
    await irALaApp(page);
    await page.getByRole('button', { name: /Masa madre/ }).click();

    await expect(filaDe(page, /Masa madre activa/)).toBeVisible();
    await expect(tablaReceta(page)).not.toContainText('Levadura seca');
    // La explicación de por qué la fórmula se calcula sobre más harina de la que se pesa.
    await expect(page.getByText(/de harina total/)).toBeVisible();

    // Y la hidratación del fermento solo se pregunta cuando hay fermento que hidratar.
    await expect(page.getByRole('button', { name: '50 %' })).toBeVisible();
    await page.getByRole('button', { name: /Levadura seca/ }).click();
    await expect(page.getByRole('button', { name: '50 %' })).toHaveCount(0);
  });

  test('LOS EXTRAS se despliegan, se activan y se ajustan', async ({ page }) => {
    await irALaApp(page);

    const desplegar = page.locator('#toggle-extras');
    await expect(desplegar).toHaveAttribute('aria-expanded', 'false');
    await desplegar.click();
    await expect(desplegar).toHaveAttribute('aria-expanded', 'true');

    const nueces = page.getByRole('button', { name: /Nueces, almendras o avellanas/ });
    await expect(nueces).toHaveAttribute('aria-pressed', 'false');
    await nueces.click();
    await expect(nueces).toHaveAttribute('aria-pressed', 'true');

    // 15 % sugerido sobre 500 g = 75 g, y no tocan el agua (siguen siendo 360 g).
    await expect(filaDe(page, /^Nueces/)).toContainText('75 g');
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g');

    // El deslizador del extra solo existe cuando el extra está activo.
    await sembrarValor(page, '#pct-nueces', '30');
    await expect(filaDe(page, /^Nueces/)).toContainText('150 g');

    await nueces.click();
    await expect(nueces).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#pct-nueces')).toHaveCount(0);
  });

  test('LAS SEMILLAS separan su agua de remojo de la de la masa', async ({ page }) => {
    // Es la regla que la app aporta y que ninguna otra calculadora aplica: si esa agua se
    // contase como hidratación, el pan saldría seco y la cifra de arriba sería falsa.
    await irALaApp(page);
    await page.getByRole('button', { name: /Añadir miel, frutos secos/ }).click();
    await page.getByRole('button', { name: /Semillas/ }).click();

    // 10 % de 500 g = 50 g de semillas → 50 g de agua de remojo, aparte.
    await expect(page.getByText('50 g de agua', { exact: true })).toBeVisible();
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g'); // la de la masa, intacta
  });

  test('SIN HARINA NO HAY RECETA, y se dice en vez de enseñar ceros', async ({ page }) => {
    await irALaApp(page);
    await expect(tablaReceta(page)).toBeVisible();

    await page.locator('#harina-g').fill('');
    await expect(page.getByText(/Escribe cuántos gramos de harina/)).toBeVisible();
    await expect(tablaReceta(page)).toHaveCount(0);

    // Y se recupera al volver a escribir un valor distinto del inicial.
    await sembrarValor(page, '#harina-g', '1000');
    await expect(filaDe(page, /^Agua$/)).toContainText('720 g');
  });
});

/**
 * MIS RECETAS (S0190, 08/10/2026)
 *
 * La app es de las que más se repiten (59 % de retorno a la misma app en septiembre de 2026) y
 * no guardaba nada: quien volvía tecleaba otra vez su pan entero. Ahora la última receta vuelve
 * sola y las demás se guardan con nombre, todo en `localStorage`.
 *
 * El almacén se siembra con `addInitScript`, que corre ANTES que los scripts de la página: sembrar
 * con `page.evaluate` tras el `goto` es una carrera que la app gana al hidratar y el caso pasaría
 * en falso. Y cada caso que espera «no aparece nada» va con otro que exige ver algo concreto.
 */
const CLAVE_ULTIMA = 'meskeia-receta-pan-ultima';
const CLAVE_LISTA = 'meskeia-receta-pan-lista';

const RECETA_CHAPATA = {
  harina: '1000', tipoPan: 'chapata', harinaPrincipal: 'panificable', proporcion: 100,
  fermento: 'seca', ritmo: 'normal', hidratacionMM: 100, extras: [],
};

async function sembrarAlmacen(page: Page, datos: Record<string, string>) {
  await page.addInitScript((d) => {
    // Solo la primera carga: en un `reload` la app ya ha escrito lo suyo y no se pisa.
    if (window.sessionStorage.getItem('sembrado')) return;
    window.sessionStorage.setItem('sembrado', '1');
    for (const [k, v] of Object.entries(d)) window.localStorage.setItem(k, v);
  }, datos);
}

test.describe('Calculadora de pan casero — mis recetas', () => {
  test('LA ÚLTIMA RECETA VUELVE SOLA al recargar, con aviso y salida', async ({ page }) => {
    await irALaApp(page);
    await page.getByRole('button', { name: /^.*Chapata/ }).first().click();
    await sembrarValor(page, '#harina-g', '1000');
    await expect(filaDe(page, /^Agua$/)).toContainText('780 g'); // 78 % de 1.000 g

    await page.reload();
    await esperarHidratacion(page, ['#harina-g']);

    await expect(page.locator('#harina-g')).toHaveValue('1000');
    await expect(page.getByRole('button', { name: /Chapata/ }).first()).toHaveAttribute('aria-pressed', 'true');
    await expect(filaDe(page, /^Agua$/)).toContainText('780 g');
    await expect(page.getByText(/Hemos recuperado la receta/)).toBeVisible();

    // «Empezar de cero» devuelve la receta de ejemplo y retira el aviso.
    await page.getByRole('button', { name: 'Empezar de cero' }).click();
    await expect(page.locator('#harina-g')).toHaveValue('500');
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g');
    await expect(page.getByText(/Hemos recuperado la receta/)).toHaveCount(0);
  });

  test('LA PRIMERA VISITA no avisa de nada: no hay receta que recuperar', async ({ page }) => {
    await irALaApp(page);
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g');
    await expect(page.getByText(/Hemos recuperado la receta/)).toHaveCount(0);
    // Y la receta de ejemplo ya queda escrita en el almacén, prueba de que el guardado corre.
    await page.waitForFunction((k) => window.localStorage.getItem(k) !== null, CLAVE_ULTIMA);
  });

  test('GUARDAR CON NOMBRE, cambiar, CARGAR y BORRAR', async ({ page }) => {
    await irALaApp(page);
    await page.getByRole('button', { name: /Focaccia/ }).first().click();
    await expect(filaDe(page, /^Agua$/)).toContainText('400 g'); // 80 % de 500 g

    await page.locator('#nombre-receta').fill('Focaccia del domingo');
    await page.getByRole('button', { name: 'Guardar receta' }).click();
    await expect(page.getByText('«Focaccia del domingo» guardada', { exact: false })).toBeVisible();
    const lista = page.getByRole('list', { name: /recetas guardadas/ });
    await expect(lista.getByRole('listitem')).toHaveCount(1);
    await expect(lista).toContainText('Focaccia · 500 g de harina · levadura seca');

    // Se cambia a otro pan y se vuelve a la guardada.
    await page.getByRole('button', { name: /Pan de molde/ }).first().click();
    await expect(filaDe(page, /^Agua$/)).not.toContainText('400 g');
    await page.getByRole('button', { name: 'Cargar Focaccia del domingo' }).click();
    await expect(filaDe(page, /^Agua$/)).toContainText('400 g');

    // Sigue ahí tras recargar.
    await page.reload();
    await esperarHidratacion(page, ['#harina-g']);
    await expect(page.getByRole('list', { name: /recetas guardadas/ }).getByRole('listitem')).toHaveCount(1);

    // Borrar pide confirmación: un clic suelto no tira una receta.
    await page.getByRole('button', { name: 'Borrar Focaccia del domingo' }).click();
    await expect(page.getByRole('list', { name: /recetas guardadas/ }).getByRole('listitem')).toHaveCount(1);
    await page.getByRole('button', { name: 'Confirmar: borrar Focaccia del domingo' }).click();
    await expect(page.getByRole('list', { name: /recetas guardadas/ })).toHaveCount(0);
  });

  test('EL MISMO NOMBRE actualiza la receta en vez de duplicarla', async ({ page }) => {
    await irALaApp(page);
    await page.locator('#nombre-receta').fill('Mi pan');
    await page.getByRole('button', { name: 'Guardar receta' }).click();
    await sembrarValor(page, '#harina-g', '1000');
    await page.locator('#nombre-receta').fill('  mi   PAN ');
    await page.getByRole('button', { name: 'Guardar receta' }).click();

    await expect(page.getByText(/actualizada con lo que ves ahora/)).toBeVisible();
    const lista = page.getByRole('list', { name: /recetas guardadas/ });
    await expect(lista.getByRole('listitem')).toHaveCount(1);
    await expect(lista).toContainText('1000 g de harina'); // cuatro cifras no se agrupan (RAE)
  });

  test('LO SEMBRADO EN EL ALMACÉN se recupera: la clave es la que lee la app', async ({ page }) => {
    // Pareja positiva del caso del almacén corrupto: sin él, aquel pasaría aunque nada se leyera.
    await sembrarAlmacen(page, { [CLAVE_ULTIMA]: JSON.stringify(RECETA_CHAPATA) });
    await irALaApp(page);
    await expect(page.locator('#harina-g')).toHaveValue('1000');
    await expect(filaDe(page, /^Agua$/)).toContainText('780 g');
  });

  test('UN ALMACÉN CORRUPTO no tumba la página: se descarta lo que no encaja', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await sembrarAlmacen(page, {
      // Un tipo de pan que no existe dejaría `panSeleccionado` en undefined.
      [CLAVE_ULTIMA]: JSON.stringify({ ...RECETA_CHAPATA, tipoPan: 'baguette-voladora' }),
      [CLAVE_LISTA]: JSON.stringify([
        { id: 'a', nombre: 'Rota', fecha: 'ayer', datos: { tipoPan: 'x' } },
        { id: 'b', nombre: 'Buena', fecha: '2026-10-01T10:00:00.000Z', datos: RECETA_CHAPATA },
        'basura',
      ]),
    });
    await irALaApp(page);

    await expect(page.locator('#harina-g')).toHaveValue('500'); // la de ejemplo
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g');
    const lista = page.getByRole('list', { name: /recetas guardadas/ });
    await expect(lista.getByRole('listitem')).toHaveCount(1);
    await expect(lista).toContainText('Buena');
    expect(errores).toEqual([]);
  });
});

/**
 * INSPECTOR 09/11/2026 (primera inspección, segmento motor)
 *
 * A diferencia del bloque de interacción de arriba, aquí SÍ se verifica aritmética, y en la
 * pantalla: cada esperado está resuelto a mano con las reglas de `lib/calculadoras/recetaPan.ts`
 * ANTES de mirar la app, y se comprueba lo que ve el usuario, no lo que devuelve el motor.
 * Los casos «HALLAZGO (…, ABIERTO)» llevan `test.fail()`: describen lo que DEBERÍA pasar y
 * hoy no pasa. Cuando se repare, Playwright los marcará en rojo por pasar: se quita el
 * `test.fail()` y «ABIERTO» pasa a «REPARADO».
 */

/** La sección del resultado, por su título: resumen, tabla, tiempo, avisos y nota. */
const seccionResultado = (page: Page) => page.locator('section[aria-labelledby="titulo-resultado"]');

/** Gramos de harina que la lista manda PESAR: la suma de sus filas de harina. */
async function harinaAPesar(page: Page): Promise<number> {
  const filas = await tablaReceta(page)
    .locator('tbody tr')
    .evaluateAll((trs) =>
      trs.map((tr) => [
        tr.querySelector('td strong')?.textContent ?? '',
        tr.querySelectorAll('td')[1]?.textContent ?? '',
      ]),
    );
  return filas
    .filter(([nombre]) => /^(Espelta blanca|Trigo panificable)$/.test(nombre))
    .reduce((suma, [, gramos]) => suma + parseSpanishNumber(gramos.replace(/\s*g$/, '')), 0);
}

interface EntradaFaq {
  pregunta: string;
  respuesta: string;
}

/** La FAQPage del JSON-LD, que es la que leen buscadores y asistentes. */
async function faqDelJsonLd(page: Page): Promise<EntradaFaq[]> {
  return page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => {
    type Nodo = { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    const nodos: Nodo[] = scripts.flatMap((s) => {
      const j = JSON.parse(s.textContent ?? '{}') as Nodo & { '@graph'?: Nodo[] };
      return j['@graph'] ?? [j];
    });
    const faq = nodos.find((n) => n['@type'] === 'FAQPage');
    return (faq?.mainEntity ?? []).map((q) => ({ pregunta: q.name, respuesta: q.acceptedAnswer.text }));
  });
}

/** Las `features` del WebApplication (en el JSON-LD salen como `featureList`). */
async function featuresDelJsonLd(page: Page): Promise<string[]> {
  return page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => {
    type Nodo = { '@type'?: string; featureList?: string[] };
    const nodos: Nodo[] = scripts.flatMap((s) => {
      const j = JSON.parse(s.textContent ?? '{}') as Nodo & { '@graph'?: Nodo[] };
      return j['@graph'] ?? [j];
    });
    return nodos.find((n) => n['@type'] === 'WebApplication')?.featureList ?? [];
  });
}

/**
 * Una pregunta de la FAQ visible con su respuesta. Vive en la guía educativa, que nace
 * plegada por CSS: se busca por selector, no por rol, porque el rol no ve lo oculto.
 */
const itemFaqVisible = (page: Page, pregunta: string) =>
  page.locator('[data-guia-educativa] h3').filter({ hasText: pregunta }).locator('xpath=..');

const normalizar = (s: string) => s.replace(/\s+/g, ' ').trim();

test.describe('Inspector 09/11/2026 — el motor, la FAQ y los avisos', () => {
  test('CASO 1 (normal) · 800 g, hogaza, 30 % de integral, masa madre al 50 % y «esta tarde»', async ({ page }) => {
    // A mano, con las reglas del motor:
    //   «esta tarde» = 7 % de harina prefermentada → harina total = 800 / 0,93 = 860,22 g;
    //   dentro de la masa madre van 60,22 g de harina y, al 50 %, 30,11 g de agua → 90,32 g
    //   integral = 860,22 × 30 % = 258,06 g · panificable = 860,22 × 70 % − 60,22 = 541,94 g
    //   (258 + 542 = 800: se pesa lo que se pidió)
    //   hidratación = 72 + 6 × 0,30 = 73,8 % → agua = 860,22 × 73,8 % − 30,11 = 604,73 g (70,3 %)
    //   sal = 2 % → 17,20 g · masa = 860,22 + 604,73 + 30,11 + 17,20 = 1.512,26 g → 2 × 756 g
    await irALaApp(page);
    await sembrarValor(page, '#harina-g', '800');
    await page.locator('#tipo-harina').selectOption('integral');
    await sembrarValor(page, '#proporcion', '30');
    await page.getByRole('button', { name: /Masa madre/ }).click();
    await page.getByRole('button', { name: '50 %', exact: true }).click();
    await expect(page.getByRole('button', { name: /Esta tarde/ })).toHaveAttribute('aria-pressed', 'true');

    await expect(filaDe(page, /^Integral de trigo$/)).toContainText(/258 g\s*30,0\s%/);
    await expect(filaDe(page, /^Trigo panificable$/)).toContainText(/542 g\s*63,0\s%/);
    await expect(filaDe(page, /^Agua$/)).toContainText(/605 g\s*70,3\s%/);
    await expect(filaDe(page, /^Masa madre activa/)).toContainText(/90 g\s*10,5\s%/);
    await expect(filaDe(page, /^Masa madre activa/)).toContainText('60 g de harina y 30 g de agua');
    await expect(filaDe(page, /^Sal$/)).toContainText(/17 g\s*2,0\s%/);

    const resultado = seccionResultado(page);
    await expect(resultado).toContainText(/1512 g\s*de masa en total/);
    await expect(resultado).toContainText('2 × 756 g');
    await expect(resultado).toContainText(/74\s%\s*de hidratación/); // 73,8 sin decimales
    await expect(resultado).toContainText(/860 g de harina total[\s\S]*los 60 g[\s\S]*800 g que pediste/);
    await expect(resultado).toContainText('5-7 h de primera fermentación + 1-2 h de formado');
    // 30 % ≤ 80 % de integral y 73,8 % < 75 %: no hay avisos.
    await expect(resultado.getByText('Antes de amasar')).toHaveCount(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · con masa madre, «esta tarde» y el 95 % de espelta se pesan 511 g de harina, no los 500 pedidos', async ({ page }) => {
    // harina total = 500 / 0,93 = 537,63 g, de los que 37,63 g van dentro de la masa madre. El
    // motor los descuenta del trigo panificable, pero al 95 % el panificable es el 5 % (26,88 g)
    // y no llega: su fila desaparece y la espelta sale entera, 537,63 × 95 % = 510,75 g.
    // Esperado: 500 g a pesar, como promete la nota («Tú solo pesas los 500 g que pediste») y
    // como hace la rama del 100 %, que da 500 g de espelta (caso siguiente).
    // Hoy: 511 g de espelta y ninguna otra harina; la hidratación real cae al 66,9 % (366,67 g de
    // agua sobre 548,39 g de harina) mientras la pantalla dice 68 %.
    test.fail();
    await irALaApp(page);
    await page.locator('#tipo-harina').selectOption('espelta');
    await page.getByRole('button', { name: /Masa madre/ }).click();
    await sembrarValor(page, '#proporcion', '95');
    await expect(seccionResultado(page)).toContainText('Tú solo pesas los 500 g que pediste');
    await expect.poll(async () => Math.abs((await harinaAPesar(page)) - 500)).toBeLessThanOrEqual(1);
  });

  test('CASO 2 (límite, pareja del anterior) · con masa madre, al 100 % y al 90 % de espelta sí se pesan 500 g', async ({ page }) => {
    // 100 %: espelta = 537,63 − 37,63 = 500 g, sin panificable.
    // 90 %: espelta = 537,63 × 90 % = 483,87 → 484 g · panificable = 53,76 − 37,63 = 16,13 → 16 g.
    await irALaApp(page);
    await page.locator('#tipo-harina').selectOption('espelta');
    await page.getByRole('button', { name: /Masa madre/ }).click();
    await expect(filaDe(page, /^Espelta blanca$/)).toContainText('500 g');
    await expect(filaDe(page, /^Trigo panificable$/)).toHaveCount(0);

    await sembrarValor(page, '#proporcion', '90');
    await expect(filaDe(page, /^Espelta blanca$/)).toContainText('484 g');
    await expect(filaDe(page, /^Trigo panificable$/)).toContainText(/\D16 g/);
    expect(await harinaAPesar(page)).toBe(500);
  });

  test('CASO 3 (rechazo) · harina negativa, con letras o a cero: no hay receta y se pide la cantidad', async ({ page }) => {
    await irALaApp(page);
    await expect(tablaReceta(page)).toBeVisible();
    for (const valor of ['-500', '12abc', '0']) {
      await page.locator('#harina-g').fill(valor);
      await expect(page.getByText(/Escribe cuántos gramos de harina/)).toBeVisible();
      await expect(tablaReceta(page)).toHaveCount(0);
    }
    // Y vuelve con una cantidad válida: 750 g × 72 % = 540 g de agua; sal 2 % = 15 g.
    await sembrarValor(page, '#harina-g', '750');
    await expect(filaDe(page, /^Agua$/)).toContainText('540 g');
    await expect(filaDe(page, /^Sal$/)).toContainText('15 g');
  });

  test('LA LEVADURA SECA sobre 500 g según el ritmo: 6,0 g, 3,5 g y 1,0 g', async ({ page }) => {
    // Harina prefermentada del 12 %, 7 % y 2 % de 500 g = 60, 35 y 10 g; la seca es su décima parte.
    await irALaApp(page);
    const levadura = () => filaDe(page, /^Levadura seca/);
    await expect(levadura()).toContainText('3,5 g');
    await page.getByRole('button', { name: /Lo antes posible/ }).click();
    await expect(levadura()).toContainText('6,0 g');
    await page.getByRole('button', { name: /De un día para otro/ }).click();
    await expect(levadura()).toContainText('1,0 g');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la FAQ visible dice «el doble» (7 g) para el pan rápido; la app y la FAQPage, 6 g', async ({ page }) => {
    // «Para un pan de tarde son unos 3,5 g de levadura seca […]; si lo quieres en dos horas, el
    // doble» = 7 g. El motor da 500 × 12 % / 10 = 6,0 g (caso anterior) y la FAQPage, «sube a 6 g».
    test.fail();
    await irALaApp(page);
    const item = itemFaqVisible(page, '¿Cuánta levadura hace falta para 500 gramos de harina?');
    await expect(item).toHaveCount(1);
    await expect(item).toContainText(/(^|[^\d,])6 g/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · las preguntas que repiten la FAQ visible y la FAQPage tienen respuestas distintas', async ({ page }) => {
    // check:faq-unica: una pregunta que está en las dos va en UNA constante. Hoy lo están
    // «¿Cuánta levadura hace falta para 500 gramos de harina?» y «¿Cuántos gramos de masa madre
    // por kilo de harina?», escritas dos veces, y la primera con otra cifra (caso anterior).
    test.fail();
    await irALaApp(page);
    const faq = await faqDelJsonLd(page);
    expect(faq.length).toBeGreaterThan(0);
    for (const { pregunta, respuesta } of faq) {
      const item = itemFaqVisible(page, pregunta);
      if ((await item.count()) === 0) continue;
      const visible = normalizar((await item.first().textContent()) ?? '');
      expect(visible, pregunta).toContain(normalizar(respuesta));
    }
  });

  test('LA MASA MADRE POR KILO va de 31 g (nevera, al 50 %) a 169 g (esta tarde, al 125 %)', async ({ page }) => {
    // nevera: 1.000 / 0,98 × 2 % = 20,41 g de harina × 1,5 = 30,6 g → 31 g
    // esta tarde al 125 %: 1.000 / 0,93 × 7 % = 75,27 g × 2,25 = 169,4 g → 169 g
    // («esta tarde» es el ritmo más rápido que la app admite con masa madre).
    await irALaApp(page);
    await sembrarValor(page, '#harina-g', '1000');
    await page.getByRole('button', { name: /Masa madre/ }).click();
    const masaMadre = () => filaDe(page, /^Masa madre activa/);
    await page.getByRole('button', { name: '125 %', exact: true }).click();
    await expect(masaMadre()).toContainText(/\D169 g/);
    await page.getByRole('button', { name: /De un día para otro/ }).click();
    await page.getByRole('button', { name: '50 %', exact: true }).click();
    await expect(masaMadre()).toContainText(/\D31 g/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · las dos FAQ dicen «entre 20 y 250 g» de masa madre por kilo; la app da de 31 a 169 g', async ({ page }) => {
    test.fail();
    await irALaApp(page);
    const pregunta = '¿Cuántos gramos de masa madre por kilo de harina?';
    const visible = itemFaqVisible(page, pregunta);
    await expect(visible).toHaveCount(1);
    const enJsonLd = (await faqDelJsonLd(page)).find((f) => f.pregunta === pregunta)?.respuesta ?? '';
    expect(enJsonLd).not.toContain('20 y 250');
    await expect(visible).not.toContainText('20 y 250');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · con masa madre, el 10 % de centeno ya avisa «con tanto centeno»', async ({ page }) => {
    // La condición `esMasaMadre && (harinaPrincipal === 'centeno' || proporcion >= 60) &&
    // harina.id === 'centeno'` se reduce a «masa madre y centeno»: el 60 % no filtra nada. Al
    // 10 % —la cuarta parte del 40 % que la app da como máximo— no hay «tanto centeno».
    // Mezcla: 537,63 × 10 % = 53,76 → 54 g de centeno.
    test.fail();
    await irALaApp(page);
    await page.locator('#tipo-harina').selectOption('centeno');
    await sembrarValor(page, '#proporcion', '10');
    await page.getByRole('button', { name: /Masa madre/ }).click();
    await expect(filaDe(page, /^Centeno$/)).toContainText('54 g');
    await expect(seccionResultado(page).getByText(/Con tanto centeno/)).toHaveCount(0);
  });

  test('EL CENTENO POR ENCIMA DEL 40 % avisa (pareja del anterior)', async ({ page }) => {
    // Con levadura seca y 100 % de centeno: el aviso de la harina (máximo 40 %) y el de la
    // hidratación, 72 + 8 = 80 % ≥ 75 %.
    await irALaApp(page);
    await page.locator('#tipo-harina').selectOption('centeno');
    await expect(seccionResultado(page)).toContainText(/Por encima del 40\s%\sde centeno/);
    await expect(seccionResultado(page)).toContainText(/Al 80\s%\sde hidratación/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · bollos: «Tu bollos y panecillos» y «Unos 1 huevos M»', async ({ page }) => {
    // 500 g × 10 % de huevo = 50 g → Math.round(50 / 50) = 1 huevo, pero la nota va en plural; y
    // el título concuerda «Tu» con un plural.
    test.fail();
    await irALaApp(page);
    await page.getByRole('button', { name: /Bollos y panecillos/ }).click();
    await expect(filaDe(page, /^Huevo$/)).toContainText('50 g');
    await expect(filaDe(page, /^Huevo$/)).not.toContainText('Unos 1 huevos');
    await expect(page.locator('#titulo-resultado')).not.toContainText(/Tu bollos/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · los deslizadores de los extras no dicen de qué ingrediente son', async ({ page }) => {
    // Su <label> es solo «15 % de la harina»: con nueces y semillas activas, un lector de
    // pantalla oye dos deslizadores «N % de la harina» sin saber cuál es cuál.
    test.fail();
    await irALaApp(page);
    await page.locator('#toggle-extras').click();
    await page.getByRole('button', { name: /Nueces, almendras/ }).click();
    await page.getByRole('button', { name: /Semillas/ }).click();
    await expect(page.locator('#pct-nueces')).toBeVisible();
    await expect(page.getByRole('slider', { name: /Nueces/ })).toHaveCount(1);
    await expect(page.getByRole('slider', { name: /Semillas/ })).toHaveCount(1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · focaccia con aceite de extra: dos filas «Aceite de oliva» en la lista de pesar', async ({ page }) => {
    // La focaccia lleva 6 % de aceite (30 g) y el extra suma un 4 % (20 g): la lista dice
    // «Aceite de oliva 30 g» y, más abajo, «Aceite de oliva 20 g». El mismo camino del motor
    // repite «Leche», «Azúcar» o «Mantequilla o manteca» en los panes que ya los llevan.
    test.fail();
    await irALaApp(page);
    await page.getByRole('button', { name: /Focaccia/ }).click();
    await page.locator('#toggle-extras').click();
    await page.getByRole('button', { name: /Aceite de oliva$/ }).click();
    await expect(page.locator('#pct-aceite')).toBeVisible();
    await expect(
      tablaReceta(page).locator('tbody tr td strong').filter({ hasText: /^Aceite de oliva$/ }),
    ).toHaveCount(1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la FAQPage manda plegar «por encima del 75 %»; la página, ya a la hogaza del 72 %', async ({ page }) => {
    // La hogaza (72 %) sale con el consejo «A esta hidratación la masa se pega: se trabaja con
    // plegados…», y el paso 3 de la guía dice «Hasta el 68 % se amasa sobre la mesa. Por encima,
    // se trabaja con plegados».
    test.fail();
    await irALaApp(page);
    await expect(seccionResultado(page)).toContainText('se trabaja con plegados');
    const agua = (await faqDelJsonLd(page)).find((f) => /Cuánta agua lleva el pan/.test(f.pregunta))?.respuesta ?? '';
    expect(agua).not.toMatch(/Por encima del 75\s%/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · features dice que semillas y frutos secos «sí corrigen la fórmula»', async ({ page }) => {
    // La propia página: los frutos secos «No tocan nada → solo se suman al peso», y el agua del
    // remojo de las semillas «no forma parte de la masa».
    test.fail();
    await irALaApp(page);
    const corrigen = (await featuresDelJsonLd(page)).find((f) => /corrigen la fórmula/.test(f)) ?? '';
    expect(corrigen).not.toMatch(/semillas|frutos secos/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el «%» va con espacio normal, no con espacio duro (U+00A0)', async ({ page }) => {
    // CLAUDE.md global §2: «15 %» con U+00A0 para que el signo no salte solo de línea.
    test.fail();
    await irALaApp(page);
    await expect(filaDe(page, /^Agua$/)).toContainText('360 g');
    const celda = (await filaDe(page, /^Agua$/).locator('td').nth(2).textContent()) ?? '';
    expect(celda).toMatch(/ %/);
  });
});

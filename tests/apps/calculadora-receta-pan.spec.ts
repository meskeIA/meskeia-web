import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

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

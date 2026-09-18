import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Tabla de Valencias y Números de Oxidación — regresión del DATO, no de la carga.
 *
 * QUÉ PROMETE
 *   · <h1>: «Tabla de Valencias y Números de Oxidación».
 *   · Subtítulo: «Busca cualquier elemento y consulta al instante con qué números de
 *     oxidación actúa, con ejemplos de compuestos reales, iones poliatómicos, las tres
 *     nomenclaturas y un formulador de compuestos binarios».
 *   · metadata.ts / JSON-LD: 51 elementos, buscador por símbolo/nombre/nombre tradicional,
 *     un compuesto real por estado, iones poliatómicos, las tres nomenclaturas y
 *     «Formulador de compuestos binarios con intercambio y simplificación de subíndices».
 *   · FAQPage: hierro +2/+3, regla de deducción dentro de un compuesto, sufijos -oso/-ico,
 *     y por qué los metales de transición tienen varios estados.
 *
 * DÓNDE VIVE EL DATO — no hay módulo de datos: las 51 fichas (`ELEMENTOS`), los iones
 * (`IONES`) y el formulador (`formularBinario`) están EMBEBIDOS en app/tabla-valencias/
 * page.tsx, que son 1.760 líneas de las que 433 son el dataset químico.
 *
 * LA FUENTE — la app no cita ninguna en pantalla (ni IUPAC, ni un texto de referencia, ni
 * fecha de revisión), así que el contraste de esta inspección se ancla a las recomendaciones
 * de la IUPAC (Red Book, 2005) y al CRC Handbook of Chemistry and Physics.
 *
 * ⚠️ El signo menos que imprime la app es el MENOS TIPOGRÁFICO U+2212 («−»), no el guion del
 * teclado: `formatearEstado` lo escribe así a propósito. Si estas cadenas se recopian a
 * mano, el test falla por el carácter y no por la química.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (el dato inequívoco) — elementos cuyos estados no admiten discusión
 *       F  −1 y solo −1: es el elemento más electronegativo de la tabla.
 *       Na +1 y solo +1 (grupo 1) · Al +3 y solo +3 (grupo 13) · Ar 0 (sin compuestos).
 *       Fe +3 (Fe₂O₃, la herrumbre) y +2 (FeCl₂), con el +3 como más frecuente.
 *       O  −2 casi siempre (H₂O), −1 en los peróxidos (H₂O₂) y +2 SOLO frente al flúor (OF₂).
 *       S  +6 (H₂SO₄), +4 (SO₂) y −2 (H₂S).
 *
 *   CASO 2 (el límite) — donde una tabla escolar simplifica de más
 *       H  no es solo +1: vale −1 en los hidruros metálicos (NaH, CaH₂).
 *       Mn los cinco: +2 (MnCl₂), +4 (MnO₂), +7 (KMnO₄) habituales, +3 y +6 poco frecuentes.
 *       Cr +3 (el más estable), +6 (cromatos y dicromatos) y +2.
 *       Xe 0, +2 (XeF₂), +4 (XeF₄), +6 (XeO₃) y +8 (XeO₄) — un gas noble que SÍ tiene química.
 *
 *   CASO 3 (la operativa) — el buscador, que es el criterio de admisión en Stemum
 *       «Fe», «fe», «HIERRO», «ferroso» y «FOSFORO» (sin tilde) deben llegar a su elemento;
 *       «zzzz» debe DECIR que no hay nada, no dejar la tabla vacía en silencio.
 *
 *   FORMULADOR — Fe(+3) + O(−2): se cruzan los valores absolutos (mcd 1) → Fe₂O₃, trióxido
 *       de dihierro / óxido de hierro(III) / óxido férrico. Fe(+2) + O(−2): mcd 2 → FeO.
 *       Hg(+1) + Cl(−1) NO es HgCl: el mercurio(I) es el ion diatómico Hg₂²⁺ → Hg₂Cl₂.
 *       Dos veces el mismo elemento debe rechazarse.
 *
 * LO QUE ESTÁ SANO (verificado en producción el 18/09/2026): los 51 elementos comprobados
 * uno a uno dan los estados correctos y los ejemplos de compuesto son reales; el buscador
 * acierta por símbolo, nombre, nombre tradicional y fórmula del ejemplo, ignora acentos y
 * mayúsculas, y avisa cuando no encuentra; el formulador cruza y simplifica bien, excluye
 * el −1 del oxígeno para no inventar peróxidos, y avisa del Hg₂²⁺ y de los hidruros BH₃/NH₃.
 *
 * HALLAZGOS ABIERTOS — al final, con `test.fail()`. Afirman lo que DEBERÍA pasar, así que hoy
 * fallan a propósito; cuando se reparen se les quita el `test.fail()` y quedan como candado
 * de regresión. Están en el acta del Inspector.
 */

const BUSCADOR = '#buscador-elemento';
const LISTA = 'section[aria-label="Elementos y sus números de oxidación"]';
const FORMULADOR = 'section[aria-label="Formulador de compuestos binarios"]';

test.beforeEach(async ({ page }) => {
  await page.goto('/tabla-valencias/');
  // El buscador es el testigo de hidratación de toda la página: sin él, un fill() o un
  // selectOption() posterior cambiaría el DOM sin llegar nunca al estado de React.
  await esperarHidratacion(page, [BUSCADOR]);
});

/** Escribe en el buscador y espera a que React haya recogido el término. */
async function buscar(page: Page, termino: string): Promise<void> {
  await page.fill(BUSCADOR, termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

/** Las fichas de elemento visibles ahora mismo en la tabla. */
function fichas(page: Page): Locator {
  return page.locator(`${LISTA} article`);
}

/** Los números de oxidación que la cabecera de la ficha muestra, en su orden. */
function estadosVisibles(page: Page): Locator {
  return page.locator(`${LISTA} article button[aria-expanded] span[title]`);
}

/** El valor de una de las nomenclaturas del formulador, localizado por el rótulo de su <dt>. */
function nomenclatura(page: Page, rotulo: string): Locator {
  return page.locator(`${FORMULADOR} dl > div`).filter({ hasText: rotulo }).locator('dd');
}

/** La fórmula grande del formulador («Fe2O3»: los subíndices van en <sub>). */
function formula(page: Page): Locator {
  return page.locator(`${FORMULADOR} [role="status"] > p`).first();
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — El dato inequívoco
// ═══════════════════════════════════════════════════════════════════════════

test('los elementos de estado único muestran ese estado y ningún otro', async ({ page }) => {
  // Flúor: el más electronegativo de la tabla, así que nunca es positivo. Solo −1 (HF).
  await buscar(page, 'flúor');
  await expect(fichas(page)).toHaveCount(1);
  await expect(estadosVisibles(page)).toHaveText(['−1']);

  // Sodio: alcalino del grupo 1, solo +1 (NaCl).
  await buscar(page, 'sodio');
  await expect(fichas(page)).toHaveCount(1);
  await expect(estadosVisibles(page)).toHaveText(['+1']);

  // Aluminio: grupo 13, solo +3 (Al₂O₃).
  await buscar(page, 'aluminio');
  await expect(fichas(page)).toHaveCount(1);
  await expect(estadosVisibles(page)).toHaveText(['+3']);

  // Argón: gas noble sin compuestos estables, solo 0.
  await buscar(page, 'argón');
  await expect(fichas(page)).toHaveCount(1);
  await expect(estadosVisibles(page)).toHaveText(['0']);
});

test('hierro, oxígeno y azufre traen todos sus estados, el más frecuente delante', async ({
  page,
}) => {
  // Hierro: +3 (Fe₂O₃, la herrumbre, el más estable) y +2 (FeCl₂). No ofrece Fe(VI), que
  // existe en los ferratos pero no en un ejercicio escolar, y eso es una decisión declarada.
  await buscar(page, 'hierro');
  await expect(estadosVisibles(page)).toHaveText(['+3', '+2']);

  // Oxígeno: −2 casi siempre (H₂O), −1 en los peróxidos (H₂O₂) y +2 solo frente al flúor (OF₂).
  await buscar(page, 'oxígeno');
  await expect(estadosVisibles(page)).toHaveText(['−2', '−1', '+2']);

  // Azufre: +6 (H₂SO₄), +4 (SO₂) y −2 (H₂S).
  await buscar(page, 'azufre');
  await expect(estadosVisibles(page)).toHaveText(['+6', '+4', '−2']);
});

test('la ficha del hierro da Fe₂O₃ en el +3 y FeCl₂ en el +2 como compuestos reales', async ({
  page,
}) => {
  await buscar(page, 'hierro');
  await page.locator(`${LISTA} article button[aria-expanded]`).first().click();
  const ficha = fichas(page).first();

  // El ejemplo real de cada estado es la capa que un PDF de valencias no puede dar, y es lo
  // que sostiene la admisión de esta tabla en el material de apoyo de Stemum.
  await expect(ficha).toContainText('Fe₂O₃');
  await expect(ficha).toContainText('óxido de hierro(III)');
  await expect(ficha).toContainText('FeCl₂');
  await expect(ficha).toContainText('cloruro de hierro(II)');
  // Nomenclatura tradicional del hierro: ferroso el +2, férrico el +3.
  await expect(ficha).toContainText('ferroso');
  await expect(ficha).toContainText('férrico');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — Los límites
// ═══════════════════════════════════════════════════════════════════════════

test('el hidrógeno conserva el −1 de los hidruros metálicos, no solo el +1', async ({ page }) => {
  // H vale +1 frente a los no metales (H₂O, HCl) y −1 en los hidruros metálicos (NaH, CaH₂),
  // donde el metal es menos electronegativo que él. Una tabla que solo dé +1 simplifica de más.
  await buscar(page, 'hidrógeno');
  await expect(estadosVisibles(page)).toHaveText(['+1', '−1']);
  await page.locator(`${LISTA} article button[aria-expanded]`).first().click();
  await expect(fichas(page).first()).toContainText('NaH');
});

test('el manganeso y el cromo traen sus cinco y sus tres estados completos', async ({ page }) => {
  // Manganeso: +2 (MnCl₂), +4 (MnO₂ de las pilas) y +7 (KMnO₄, permanganato) como habituales,
  // más +3 (Mn₂O₃) y +6 (K₂MnO₄, manganato). Es el elemento con más estados de uso escolar y
  // donde más fácil es que una tabla se deje alguno por el camino.
  await buscar(page, 'manganeso');
  await expect(estadosVisibles(page)).toHaveText(['+2', '+4', '+7', '+3', '+6']);

  // Cromo: +3 el más estable (Cr₂O₃), +6 en cromatos y dicromatos (K₂Cr₂O₇) y +2 (CrO).
  await buscar(page, 'cromo');
  await expect(estadosVisibles(page)).toHaveText(['+3', '+6', '+2']);
});

test('el xenón trae los cuatro estados positivos de su química con flúor y oxígeno', async ({
  page,
}) => {
  // Xe: 0 como elemento libre, +2 (XeF₂), +4 (XeF₄), +6 (XeO₃) y +8 (XeO₄). Es el gas noble
  // con más química conocida, y solo frente a los dos elementos más electronegativos.
  await buscar(page, 'xenón');
  await expect(estadosVisibles(page)).toHaveText(['0', '+2', '+4', '+6', '+8']);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — La operativa del buscador
// ═══════════════════════════════════════════════════════════════════════════

test('el buscador encuentra por símbolo, por nombre, sin acento y en mayúsculas', async ({
  page,
}) => {
  const cabecera = page.locator(`${LISTA} article button[aria-expanded]`).first();

  // Por símbolo.
  await buscar(page, 'Fe');
  await expect(fichas(page)).toHaveCount(1);
  await expect(cabecera).toContainText('Hierro');

  // Por símbolo en minúsculas: normaliza antes de comparar.
  await buscar(page, 'fe');
  await expect(fichas(page)).toHaveCount(1);
  await expect(cabecera).toContainText('Hierro');

  // Por nombre en mayúsculas.
  await buscar(page, 'HIERRO');
  await expect(fichas(page)).toHaveCount(1);
  await expect(cabecera).toContainText('Hierro');

  // Por nombre tradicional: «ferroso» es el Fe(+2), y es justo con lo que llega un estudiante
  // que se ha topado con «sulfato ferroso» en un enunciado.
  await buscar(page, 'ferroso');
  await expect(fichas(page)).toHaveCount(1);
  await expect(cabecera).toContainText('Hierro');

  // Sin tilde y en mayúsculas: «FOSFORO» debe llegar a «Fósforo», que actúa con +5, +3 y −3.
  await buscar(page, 'FOSFORO');
  await expect(fichas(page)).toHaveCount(1);
  await expect(cabecera).toContainText('Fósforo');
  await expect(estadosVisibles(page)).toHaveText(['+5', '+3', '−3']);
});

test('una búsqueda sin coincidencias lo dice, en vez de dejar la tabla vacía en silencio', async ({
  page,
}) => {
  await buscar(page, 'zzzz');
  await expect(fichas(page)).toHaveCount(0);
  await expect(page.locator(`${LISTA} > p`)).toContainText(
    'No hay ningún elemento que coincida con «zzzz»',
  );
  // Y el contador tiene que reflejar el cero, no quedarse en las 51 de partida.
  await expect(
    page.locator('section[aria-label="Buscador de elementos"] [role="status"]'),
  ).toHaveText('0 de 51 elementos');
});

// ═══════════════════════════════════════════════════════════════════════════
// FORMULADOR — la otra capa que un PDF no puede dar
// ═══════════════════════════════════════════════════════════════════════════

test('de partida cruza Fe(+3) con O(−2) y da Fe₂O₃ con sus tres nombres', async ({ page }) => {
  // Fe(+3) + O(−2): se cruzan los valores absolutos y el mcd es 1 → Fe₂O₃.
  await expect(formula(page)).toHaveText('Fe2O3');
  await expect(nomenclatura(page, 'Nomenclatura sistemática')).toHaveText('trióxido de dihierro');
  await expect(nomenclatura(page, 'Nomenclatura de Stock')).toHaveText('óxido de hierro(III)');
  await expect(nomenclatura(page, 'Nomenclatura tradicional')).toHaveText('óxido férrico');
  await expect(nomenclatura(page, 'Nombre común')).toHaveText('herrumbre');
});

test('bajar el hierro de +3 a +2 da FeO y cambia los tres nombres con él', async ({ page }) => {
  // El select arranca en +3, así que mover a +2 es un cambio real y no repetir lo que ya había.
  await page.selectOption('#estado-positivo', '2');

  // Fe(+2) + O(−2): mcd 2, los subíndices se simplifican → FeO. El «mono-» se conserva en la
  // sistemática porque FeO y Fe₂O₃ conviven y hay que distinguirlos.
  await expect(formula(page)).toHaveText('FeO');
  await expect(nomenclatura(page, 'Nomenclatura sistemática')).toHaveText('monóxido de hierro');
  await expect(nomenclatura(page, 'Nomenclatura de Stock')).toHaveText('óxido de hierro(II)');
  await expect(nomenclatura(page, 'Nomenclatura tradicional')).toHaveText('óxido ferroso');
});

test('el mercurio(I) se formula Hg₂Cl₂, no HgCl, y el formulador explica por qué', async ({
  page,
}) => {
  // El cruce simple daría HgCl, pero el mercurio(I) existe como ion diatómico Hg₂²⁺: el
  // calomelanos es Hg₂Cl₂. Es la excepción del intercambio que más se falla en el examen.
  await page.selectOption('#elemento-positivo', 'Hg');
  await page.selectOption('#elemento-negativo', 'Cl');
  await page.selectOption('#estado-positivo', '1');

  await expect(formula(page)).toHaveText('Hg2Cl2');
  await expect(nomenclatura(page, 'Nomenclatura de Stock')).toHaveText('cloruro de mercurio(I)');
  await expect(nomenclatura(page, 'Nomenclatura tradicional')).toHaveText('cloruro mercurioso');
  await expect(page.locator(`${FORMULADOR} [role="status"]`)).toContainText('ion diatómico Hg₂²⁺');
});

test('el peróxido no se ofrece: el oxígeno negativo solo admite el −2', async ({ page }) => {
  // El oxígeno tiene −1 en la tabla (H₂O₂), pero el grupo O₂²⁻ es una unidad y sus subíndices
  // no se simplifican: cruzar H(+1) con O(−1) daría «HO», que no existe. Por eso el select del
  // estado negativo del oxígeno —el que sale por defecto— ofrece únicamente el −2.
  await expect(page.locator('#estado-negativo option')).toHaveText(['−2 (el más frecuente)']);
});

test('elegir el mismo elemento en los dos lados se rechaza con un mensaje', async ({ page }) => {
  // Parte de Fe/O, así que los dos selects cambian de verdad. El azufre está en ambas listas
  // (+6 y −2) y un compuesto binario de azufre consigo mismo no existe: hay que rechazarlo.
  await page.selectOption('#elemento-positivo', 'S');
  await page.selectOption('#elemento-negativo', 'S');

  await expect(page.locator(`${FORMULADOR} [role="status"]`)).toHaveCount(0);
  await expect(page.locator(FORMULADOR)).toContainText(
    'Elige dos elementos distintos, uno con estado positivo y otro con estado negativo.',
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (18/09/2026)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('HALLAZGOS ABIERTOS (18/09/2026)', () => {
  // Los tres usan test.fail(): afirman lo que DEBERÍA pasar y hoy no pasa. El día que se
  // reparen saldrán en rojo («expected to fail, but passed») y habrá que quitarles la marca,
  // no reescribir el valor esperado.

  test.fail(
    'HALLAZGO 1 · el N₂O₅ debe nombrarse «anhídrido nítrico», no «óxido nítrico»',
    async ({ page }) => {
      await page.selectOption('#elemento-positivo', 'N');

      // N(+5) + O(−2) → N₂O₅, y su nombre tradicional es ANHÍDRIDO nítrico: en español los
      // óxidos de no metal son anhídridos, y la palabra no aparece ni una vez en la página.
      // Aquí no es solo una forma en desuso: «óxido nítrico» es el nombre consolidado del
      // monóxido de nitrógeno (NO), así que la app le pega a N₂O₅ la etiqueta de otra
      // molécula. Y un escalón más abajo repite la jugada: con +3 saca N₂O₃ como «óxido
      // nitroso», que es como se llama al N₂O, el gas de la risa.
      await expect(formula(page)).toHaveText('N2O5');
      await expect(nomenclatura(page, 'Nomenclatura tradicional')).toHaveText('anhídrido nítrico');
    },
  );

  test.fail(
    'HALLAZGO 2 · Kr(+2) + N(−3) debe avisar de que ese compuesto no existe',
    async ({ page }) => {
      await page.selectOption('#elemento-positivo', 'Kr');
      await page.selectOption('#elemento-negativo', 'N');

      // El kriptón solo forma compuestos con flúor (KrF₂) — lo dice la propia FAQ de esta
      // página y lo dice su propio dataset, que no le conoce otro ejemplo. El formulador
      // comprueba los signos y el máximo común divisor, no si los dos elementos llegan a
      // combinarse, así que devuelve «Kr₃N₂ · dinitruro de trikriptón» con la misma cara que
      // el Fe₂O₃. Ya sabe avisar cuando hace falta (lo hace con el Hg₂²⁺ y con los hidruros
      // BH₃/NH₃): aquí debería hacer lo mismo.
      await expect(page.locator(`${FORMULADOR} [role="status"]`)).toContainText('⚠️');
    },
  );

  test.fail(
    'HALLAZGO 3 · la ficha del cloro no debe proponer «cloruro hipocloroso»',
    async ({ page }) => {
      await buscar(page, 'cloro');
      const cabecera = page.locator(`${LISTA} article button[aria-expanded]`).first();
      await expect(cabecera).toContainText('Cloro');
      await cabecera.click();

      // El bloque «Nombre tradicional según el estado» arma sus ejemplos con una plantilla
      // fija —«por ejemplo, óxido X y cloruro X»— que funciona con los metales (óxido férrico,
      // cloruro férrico) y produce disparates con los no metales: el cloro no forma un cloruro
      // de sí mismo. Salen los cuatro: cloruro hipocloroso, cloroso, clórico y perclórico, y
      // lo mismo en azufre («cloruro sulfúrico»), nitrógeno, fósforo, yodo y bromo.
      await expect(fichas(page).first()).not.toContainText('cloruro hipocloroso');
    },
  );
});

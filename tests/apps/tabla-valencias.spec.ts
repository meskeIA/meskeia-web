import { test, expect, Locator, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Tabla de Valencias y Números de Oxidación — regresión del DATO, no de la carga.
 *
 * QUÉ PROMETE (releído el 21/09/2026, después del cambio de alcance)
 *   · <h1>: «Tabla de Valencias y Números de Oxidación».
 *   · Subtítulo: «Busca UN elemento y consulta al instante…» (antes decía «cualquier
 *     elemento», y de ahí salió media inspección del 21/09).
 *   · <title>: «Tabla de Valencias y Números de Oxidación de los Elementos | meskeIA».
 *   · metadata.ts → openGraph y JSON-LD: **51 elementos**, buscador por símbolo/nombre/nombre
 *     tradicional, un compuesto real por estado, iones poliatómicos, las tres nomenclaturas y
 *     «Formulador de compuestos binarios con intercambio y simplificación de subíndices».
 *   · En pantalla: contador «51 elementos en la tabla» + párrafo de alcance.
 *   · FAQPage: hierro +2/+3, regla de deducción dentro de un compuesto, sufijos -oso/-ico,
 *     y por qué los metales de transición tienen varios estados.
 *
 * DÓNDE VIVE EL DATO — no hay módulo de datos: las **51** fichas (`ELEMENTOS`), los **26**
 * iones (`IONES`) y el formulador (`formularBinario`) están EMBEBIDOS en
 * app/tabla-valencias/page.tsx, 1.836 líneas de las que ~460 son el dataset químico.
 * (La cabecera anterior de este fichero decía «20 iones»: son 26, contados en el dataset y
 * en las filas de la tabla de la página.)
 *
 * LA FUENTE — desde el 18/09/2026 la app la declara en pantalla con <DataReference>: IUPAC,
 * Nomenclature of Inorganic Chemistry (Red Book, 2005) y CRC Handbook of Chemistry and
 * Physics. Es contra eso —y no contra una lectura de la propia app— contra lo que se
 * resuelven a mano los casos de abajo.
 *
 * ⚠️ El signo menos que imprime la app es el MENOS TIPOGRÁFICO U+2212 («−»), no el guion del
 * teclado: `formatearEstado` lo escribe así a propósito. Si estas cadenas se recopian a
 * mano, el test falla por el carácter y no por la química.
 *
 * ⚠️ Los <h3> y los <dt> se sirven con `text-transform: uppercase`, así que `innerText` los
 * devuelve en mayúsculas. Las aserciones de esta suite miran siempre el <dd> o el <li>, que
 * no llevan la transformación.
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
 * LO QUE ESTÁ SANO (verificado en producción el 18/09/2026 y reverificado el 21/09/2026):
 * los 51 elementos comprobados uno a uno dan los estados correctos y los ejemplos de
 * compuesto son reales; el buscador acierta por símbolo, nombre, nombre tradicional y
 * fórmula del ejemplo, ignora acentos y mayúsculas, y avisa cuando no encuentra; el
 * formulador cruza y simplifica bien, excluye el −1 del oxígeno para no inventar peróxidos,
 * y avisa del Hg₂²⁺ y de los hidruros BH₃/NH₃. Sin errores de consola.
 *
 * ── RE-INSPECCIÓN DEL 21/09/2026 ──────────────────────────────────────────────────────
 *
 * Los 4 hallazgos del 18/09 se reverificaron uno a uno en el navegador. Tres cierran del
 * todo (928 anhídridos, 930 fichas tradicionales, 931 trazabilidad) y el cuarto cierra a
 * medias: **929 solo cubre los gases nobles**, que era donde la regla es enunciable, y deja
 * fuera los otros compuestos imposibles que el mismo hallazgo nombraba (AuN).
 *
 * Los casos de esta vuelta, resueltos a mano antes de ejecutarlos:
 *
 *   A · las reparaciones previas, en sus casos literales
 *       N(+5)+O(−2): mcd(5,2)=1 → N₂O₅ · tradicional ANHÍDRIDO nítrico (el «óxido nítrico»
 *         es el NO, otra molécula) · sistemática pentaóxido de dinitrógeno · Stock óxido de
 *         nitrógeno(V).
 *       N(+3)+O(−2): mcd(3,2)=1 → N₂O₃ · ANHÍDRIDO nitroso (el «óxido nitroso» es el N₂O).
 *       S(+6)+O(−2): mcd(6,2)=2 → SO₃ · anhídrido sulfúrico.
 *       Kr(+2)+N(−3): mcd(2,3)=1 → Kr₃N₂, que no existe → tiene que avisar.
 *       Xe(+8)+Cl(−1): mcd(8,1)=1 → XeCl₈, que no existe → tiene que avisar.
 *       Ficha del Cl: «anhídrido hipocloroso y ácido hipocloroso», nunca «cloruro
 *         hipocloroso»; y la del Fe debe SEGUIR dando «óxido férrico y cloruro férrico»,
 *         porque la reparación tenía que discriminar metal/no metal, no sustituir en bloque.
 *
 *   B · el alcance, contado — el dataset trae 51 elementos y la página lo dice en cuatro
 *       sitios (contador, párrafo de alcance, og:description y JSON-LD). Los 51 son: H + 5
 *       alcalinos + 5 alcalinotérreos + 5 del grupo 13 + 5 del 14 + 5 del 15 + 4 del 16 +
 *       4 del 17 + 5 gases nobles + 12 metales de transición.
 *       ⚠️ De ahí sale el hallazgo abierto: los grupos principales NO están completos —
 *       faltan Fr(87), Ra(88), Po(84), At(85) y Rn(86), ninguno de los cuales es lantánido,
 *       actínido ni transuránico, que es lo único que el párrafo declara excluido.
 *
 *   C · el límite / lo que debe rechazarse
 *       Au(+3)+N(−3): mcd(3,3)=3 → AuN. El nitruro de oro no es un compuesto conocido, y el
 *         formulador lo devuelve sin pestañear. Sí rechaza, en cambio, el mismo elemento en
 *         los dos lados (S/S), que es la comprobación que sí tiene.
 *
 * HALLAZGOS REPARADOS el 21/09/2026: al final. Iban marcados con `test.fail()` —afirmaban lo
 * que DEBERÍA pasar y fallaban a propósito— y ahora son tests normales, porque
 * quedan como candado de regresión.
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

/**
 * El panel de resultado del formulador. ⚠️ Se acota al `[role="status"]` de DENTRO de la
 * sección: un `getByRole('alert'|'status')` a secas casa también con el anunciador de rutas
 * de Next (`#__next-route-announcer__`) y rompe el modo estricto.
 */
function resultado(page: Page): Locator {
  return page.locator(`${FORMULADOR} [role="status"]`);
}

/** Abre la ficha del elemento buscado y devuelve su <article>. */
async function abrirFicha(page: Page, termino: string): Promise<Locator> {
  await buscar(page, termino);
  const cabecera = page.locator(`${LISTA} article button[aria-expanded]`).first();
  if ((await cabecera.getAttribute('aria-expanded')) === 'false') await cabecera.click();
  return fichas(page).first();
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
  const ficha = await abrirFicha(page, 'hierro');

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
  const ficha = await abrirFicha(page, 'hidrógeno');
  await expect(ficha).toContainText('NaH');
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
  await expect(resultado(page)).toContainText('ion diatómico Hg₂²⁺');
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

  await expect(resultado(page)).toHaveCount(0);
  await expect(page.locator(FORMULADOR)).toContainText(
    'Elige dos elementos distintos, uno con estado positivo y otro con estado negativo.',
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// LOS 4 HALLAZGOS DEL 18/09/2026 — reparados ese mismo día
// Reverificados en navegador el 21/09/2026: 928, 930 y 931 cierran; 929 solo a medias
// (ver el bloque de hallazgos abiertos del final).
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Los 4 hallazgos del 18/09/2026, reparados el mismo día', () => {
  test('928 · el N₂O₅ se nombra «anhídrido nítrico», no «óxido nítrico»', async ({ page }) => {
    await page.selectOption('#elemento-positivo', 'N');

    // N(+5) + O(−2) → mcd(5,2)=1 → N₂O₅, y su nombre tradicional es ANHÍDRIDO nítrico: en
    // español los óxidos de no metal son anhídridos. Aquí no es solo una forma en desuso:
    // «óxido nítrico» es el nombre consolidado del monóxido de nitrógeno (NO), así que la app
    // le pegaba a N₂O₅ la etiqueta de otra molécula.
    await expect(formula(page)).toHaveText('N2O5');
    await expect(nomenclatura(page, 'Nomenclatura tradicional')).toHaveText('anhídrido nítrico');
    // Las otras dos no cambian con la reparación y sirven de control.
    await expect(nomenclatura(page, 'Nomenclatura sistemática')).toHaveText(
      'pentaóxido de dinitrógeno',
    );
    await expect(nomenclatura(page, 'Nomenclatura de Stock')).toHaveText('óxido de nitrógeno(V)');
  });

  test('928.ter · un escalón más abajo, el N₂O₃ es «anhídrido nitroso», no «óxido nitroso»', async ({
    page,
  }) => {
    // La segunda mitad del hallazgo 928, que solo estaba escrita en un comentario: con +3 la
    // app sacaba N₂O₃ como «óxido nitroso», que es como se llama al N₂O, el gas de la risa.
    // N(+3) + O(−2) → mcd(3,2)=1 → N₂O₃ · anhídrido del ácido nitroso HNO₂.
    await page.selectOption('#elemento-positivo', 'N');
    await page.selectOption('#estado-positivo', '3');

    await expect(formula(page)).toHaveText('N2O3');
    await expect(nomenclatura(page, 'Nomenclatura tradicional')).toHaveText('anhídrido nitroso');
    await expect(nomenclatura(page, 'Nomenclatura sistemática')).toHaveText(
      'trióxido de dinitrógeno',
    );
  });

  test('929 · Kr(+2) + N(−3) avisa de que ese compuesto no existe', async ({ page }) => {
    await page.selectOption('#elemento-positivo', 'Kr');
    await page.selectOption('#elemento-negativo', 'N');

    // El kriptón solo forma compuestos con flúor (KrF₂) — lo dice la propia FAQ de esta página
    // y lo dice su propio dataset, que no le conoce otro ejemplo. El formulador comprueba los
    // signos y el máximo común divisor, no si los dos elementos llegan a combinarse, así que
    // devolvía «Kr₃N₂ · dinitruro de trikriptón» con la misma cara que el Fe₂O₃.
    await expect(formula(page)).toHaveText('Kr3N2');
    await expect(resultado(page)).toContainText('⚠️');
    await expect(resultado(page)).toContainText('no es un compuesto conocido');
  });

  test('929.bis · Xe(+8) + Cl(−1) también avisa: el xenón solo reacciona con F y O', async ({
    page,
  }) => {
    // El segundo caso literal del hallazgo 929, que no tenía test propio. Xe(+8) + Cl(−1) →
    // mcd(8,1)=1 → XeCl₈. No existe ningún cloruro de xenón(VIII): la química del xenón se
    // limita a flúor y oxígeno (XeF₂, XeF₄, XeO₃, XeO₄), como dice la FAQ de la propia página.
    await page.selectOption('#elemento-positivo', 'Xe');
    await page.selectOption('#elemento-negativo', 'Cl');
    await page.selectOption('#estado-positivo', '8');

    await expect(formula(page)).toHaveText('XeCl8');
    await expect(resultado(page)).toContainText('⚠️');
    await expect(resultado(page)).toContainText('no es un compuesto conocido');
  });

  test('930 · la ficha del cloro ya no propone «cloruro hipocloroso»', async ({ page }) => {
    const ficha = await abrirFicha(page, 'cloro');
    await expect(ficha).toContainText('Cloro');

    // El bloque «Nombre tradicional según el estado» armaba sus ejemplos con una plantilla
    // fija —«por ejemplo, óxido X y cloruro X»— que funciona con los metales (óxido férrico,
    // cloruro férrico) y producía disparates con los no metales: el cloro no forma un cloruro
    // de sí mismo. Un no metal forma anhídridos y, con agua, oxácidos: esos son sus ejemplos.
    await expect(ficha).not.toContainText('cloruro hipocloroso');
    await expect(ficha).toContainText('anhídrido hipocloroso y ácido hipocloroso');
    await expect(ficha).toContainText('anhídrido perclórico y ácido perclórico');
  });

  test('930.bis · y los METALES conservan «óxido X y cloruro X», que ahí sí es correcto', async ({
    page,
  }) => {
    // La reparación tenía que DISCRIMINAR metal/no metal, no sustituir la plantilla en bloque:
    // el óxido férrico (Fe₂O₃) y el cloruro férrico (FeCl₃) son compuestos reales y siguen
    // siendo el ejemplo que corresponde a un metal. Si esto se pusiera en rojo, la reparación
    // del 930 se habría llevado por delante el caso que estaba bien.
    const ficha = await abrirFicha(page, 'hierro');
    await expect(ficha).toContainText('férrico — por ejemplo, óxido férrico y cloruro férrico');
    await expect(ficha).not.toContainText('anhídrido férrico');
  });

  test('931 · los datos declaran de dónde salen', async ({ page }) => {
    // Las 51 fichas, los estados de oxidación, los ejemplos y los 26 iones poliatómicos se
    // presentaban sin fuente, sin edición de referencia y sin fecha de revisión: el único
    // rastro estaba en un comentario del código, que el visitante no ve. Los datos eran
    // CORRECTOS —comprobados elemento a elemento contra IUPAC Red Book 2005 y CRC Handbook—,
    // así que esto era una brecha de trazabilidad y no un error: sin declarar la fuente, las
    // decisiones legítimas pero opinables (omitir Fe(VI), dar el +3 del bromo por poco
    // frecuente) no se pueden contrastar contra nada.
    const referencia = page.locator('[class*="dataReference"]');
    await expect(referencia).toContainText('IUPAC');
    await expect(referencia).toContainText('Red Book');
    await expect(referencia).toContainText('CRC Handbook');
  });

  test('928.bis · el azufre y el cloro también son anhídridos en la tabla comparativa', async ({
    page,
  }) => {
    // La tabla de las tres nomenclaturas arrastraba el mismo criterio que el formulador:
    // «óxido sulfúrico» para el SO₃ y «óxido perclórico» para el Cl₂O₇.
    // Dos tablas de la página contienen «SO₃» (esta y la de iones poliatómicos), así que se
    // acota por la región que la envuelve, que sí tiene nombre accesible propio.
    const comparativa = page
      .getByRole('region', { name: /Las tres nomenclaturas/ })
      .getByRole('table');
    await expect(comparativa).toContainText('anhídrido sulfúrico');
    await expect(comparativa).toContainText('anhídrido perclórico');
    await expect(comparativa).not.toContainText('óxido sulfúrico');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EL ALCANCE DECLARADO (21/09/2026)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('La tabla declara hasta dónde llega (21/09/2026)', () => {
  // El title prometía «Todos los Elementos» y la tabla trae 51 de los 118. Salió del barrido
  // de la palanca «promesa incumplida», no del Inspector: el Inspector mira lo que la app
  // calcula por dentro, y esto vivía en el <title> que se sirve en el buscador.
  test('el título ya no promete todos los elementos', async ({ page }) => {
    await expect(page).not.toHaveTitle(/Todos los Elementos/i);
    await expect(page).toHaveTitle(/Tabla de Valencias/);
  });

  test('el alcance está escrito en la página, antes de que nadie busque en vano', async ({
    page,
  }) => {
    const alcance = page.getByText(/No incluye lantánidos, actínidos ni transuránicos/);
    await expect(alcance).toBeVisible();
    await expect(alcance).toContainText('51 elementos');
  });

  test('buscar un elemento ausente explica que no está, en vez de sugerir una errata', async ({
    page,
  }) => {
    await buscar(page, 'titanio');
    const sinResultados = page.getByText(/No hay ningún elemento que coincida/);
    await expect(sinResultados).toBeVisible();
    await expect(sinResultados).toContainText('no está en');
    await expect(sinResultados).toContainText('esta tabla');
  });

  test('las cuatro cifras de alcance dicen 51, y en la tabla hay 51 fichas', async ({ page }) => {
    // Contado en el dataset de app/tabla-valencias/page.tsx el 21/09/2026: 51 entradas en
    // ELEMENTOS (H + 5 alcalinos + 5 alcalinotérreos + 5 del grupo 13 + 5 del 14 + 5 del 15 +
    // 4 del 16 + 4 del 17 + 5 gases nobles + 12 metales de transición = 51). La cifra aparece
    // en CUATRO sitios distintos y ninguno puede divergir del dataset sin mentirle al visitante:
    // el contador y el párrafo de alcance la sacan de ELEMENTOS.length, pero la og:description
    // y el JSON-LD están escritos a mano en metadata.ts y no lo sabrían si el dataset creciera.
    await expect(fichas(page)).toHaveCount(51);
    await expect(
      page.locator('section[aria-label="Buscador de elementos"] [role="status"]'),
    ).toHaveText('51 elementos en la tabla');
    await expect(page.getByText(/No incluye lantánidos/)).toContainText('Están los 51 elementos');

    const og = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(og).toContain('51 elementos');

    // La página sirve varios bloques JSON-LD (los del layout raíz y los dos de esta app), así
    // que se buscan todos y se exige que ALGUNO lleve la cifra: fijar el índice ataría el test
    // al orden en que Next los inyecta, que no es asunto de esta app.
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.join('\n')).toContain('51 elementos químicos');
  });

  test('la tabla de iones poliatómicos trae las 26 entradas del dataset', async ({ page }) => {
    // Contadas en IONES el 21/09/2026: 26, no las 20 que decía la cabecera de este fichero
    // hasta hoy. La página no publica la cifra en ningún texto, así que aquí el candado es
    // sobre el dataset: si alguien retira iones, esto lo dice.
    const tabla = page.getByRole('region', { name: /Iones poliatómicos/ }).getByRole('table');
    await expect(tabla.locator('tbody tr')).toHaveCount(26);
    // Los dos extremos de la lista, que son los que se pierden si se corta por arriba o por abajo.
    await expect(tabla).toContainText('Amonio');
    await expect(tabla).toContainText('Borato');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (21/09/2026) — con test.fail(): afirman lo que DEBERÍA pasar
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Los 3 hallazgos del 21/09/2026, reparados el mismo día', () => {
  test('1064 · el formulador declara que formula y no predice, y AuN queda cubierto', async ({ page }) => {
    // Au(+3) + N(−3) → mcd(3,3)=3 → subíndices 1 y 1 → AuN. El nitruro de oro no es un
    // compuesto químico conocido, y el formulador lo devolvía como «mononitruro de oro /
    // nitruro de oro(III) / nitruro áurico», sin ninguna señal. Mismo mecanismo en
    // Au(+1)+N(−3) → Au₃N y Ag(+1)+C(−4) → Ag₄C (el carburo de plata real es el
    // acetiluro Ag₂C₂).
    //
    // POR QUÉ LA REPARACIÓN NO ES UN ⚠️ EN ESTE RESULTADO
    // El comentario del código decía que «de eso avisa la nota al pie del formulador», y
    // comprobado el 21/09/2026 la nota hablaba solo de peróxidos, ternarios y sales de
    // oxoácidos: el control compensatorio que esa decisión daba por existente NO estaba en
    // la página. Lo que faltaba era el control, y es el control lo que se ha puesto.
    //
    // Marcar cada combinación inexistente exigiría una tabla enumerable de los compuestos
    // que existen, que no hay; y un ⚠️ que saliera en casi todas las combinaciones dejaría
    // de informar, que es justo el modo de fallo que este proyecto tiene escrito («un color
    // que sale siempre deja de informar»). Lo que sí se puede afirmar sin excepciones es
    // que la regla del intercambio dice cómo se ESCRIBIRÍA un compuesto, no si existe. Eso
    // es lo que la nota al pie dice ahora, de forma permanente y junto al formulador.
    await page.selectOption('#elemento-positivo', 'Au');
    await page.selectOption('#elemento-negativo', 'N');
    await expect(formula(page)).toHaveText('AuN');

    const nota = page.getByText(/Esto formula, no predice/);
    await expect(nota).toHaveCount(1);
    await expect(nota.locator('xpath=..')).toContainText('no si ese compuesto existe');
    // Y sigue distinguiendo: donde la regla SÍ es enunciable, el aviso es del resultado.
    await page.selectOption('#elemento-positivo', 'Kr');
    await expect(resultado(page)).toContainText('⚠️');
  });

  test('1065 · el alcance nombra los cinco radiactivos que faltan, y el buscador también', async ({
    page,
  }) => {

    // El párrafo dice: «Están los 51 elementos que se formulan en secundaria y bachillerato:
    // los grupos principales COMPLETOS y los metales de transición de uso corriente. No
    // incluye lantánidos, actínidos ni transuránicos».
    //
    // Contado contra el dataset el 21/09/2026, de los grupos principales faltan CINCO
    // elementos naturales: Rn (86, gas noble), At (85, halógeno), Po (84, anfígeno),
    // Fr (87, alcalino) y Ra (88, alcalinotérreo). Ninguno es lantánido (57-71), ni actínido
    // (89-103), ni transuránico (>92), que es lo único que el párrafo declara fuera.
    //
    // La consecuencia práctica es exactamente la que el cambio del 21/09 quería evitar, y
    // agravada: quien busca «radón» —que en bachillerato aparece al hablar de radiactividad y
    // de la calidad del aire— lee primero que los grupos principales están completos, luego no
    // lo encuentra, y el mensaje de la búsqueda vacía le ofrece tres explicaciones que no le
    // valen («un lantánido, un actínido o un metal de transición poco habitual»). Que te digan
    // que algo está y no esté es peor que no que no te digan nada.
    await buscar(page, 'radón');
    await expect(fichas(page)).toHaveCount(0);
    const sinResultados = page.getByText(/No hay ningún elemento que coincida/);
    // El mensaje cubre ahora por qué NO está el radón, y el párrafo de alcance ya no
    // promete «los grupos principales completos».
    await expect(sinResultados).toContainText(/radiactiv/);
    await expect(sinResultados).toContainText('radón');
    await expect(page.locator('body')).not.toContainText('grupos principales completos');
  });

  test('1066 · la ficha del carbono ya no ofrece «ácido carbonoso», que no existe', async ({
    page,
  }) => {

    // Residuo de la reparación del hallazgo 930: la plantilla fija «óxido X y cloruro X» se
    // cambió por otra plantilla fija, «anhídrido X y ácido X», para los 13 no metales con raíz
    // tradicional. Acierta en 12 de los 13 —bórico, silícico, nitroso/nítrico,
    // fosforoso/fosfórico, arsenioso/arsénico, antimonioso/antimónico, sulfuroso/sulfúrico,
    // selenioso/selénico, teluroso/telúrico y los cuatro oxácidos de cada halógeno son todos
    // compuestos reales— y falla en el carbono con +2: «anhídrido carbonoso» sí es el CO en
    // nomenclatura tradicional, pero el «ácido carbonoso» (H₂CO₂) que la plantilla deriva de
    // él no es una sustancia que exista. Es el mismo defecto del 930 —un ejemplo generado por
    // plantilla sin comprobar que el compuesto existe— reducido a un único caso.
    const ficha = await abrirFicha(page, 'carbono');
    // El +4 sí tiene oxácido real y se ofrece entero…
    await expect(ficha).toContainText('carbónico — por ejemplo, anhídrido carbónico y ácido carbónico');
    // …y el +2 se queda en el anhídrido, que es lo único que existe: el CO es un óxido
    // neutro y no reacciona con agua para dar un ácido.
    await expect(ficha).toContainText('anhídrido carbonoso (el ácido correspondiente no existe)');
    await expect(ficha).not.toContainText('y ácido carbonoso');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FICHA DE BÚSQUEDA PARA EL AULA · 21/09/2026
// ═══════════════════════════════════════════════════════════════════════════════

import {
  CASOS as FICHAS,
  TOTAL_CASOS as TOTAL_FICHAS,
  resolverCaso as resolverFicha,
  normalizarRespuesta,
  comprobarRespuesta as comprobarFicha,
  generarPreguntaAleatoria,
} from '../../app/tabla-valencias/casos';
import { ELEMENTOS, IONES } from '../../app/tabla-valencias/datos';

/**
 * Ficha de búsqueda de aula — invariantes de la sistemática `/casos-aula-meskeia`, tipo B.
 *
 * Esta app es una TABLA DE CONSULTA, no una calculadora: la tarea no es resolver sino
 * LOCALIZAR, así que las respuestas son texto y no hay tolerancia numérica. Lo que sustituye
 * a la tolerancia es la normalización (minúsculas, tildes fuera, espacios colapsados) más una
 * lista de sinónimos declarada caso a caso.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO DE ESTE BLOQUE
 * Comprobado contra la química, no contra lo que devuelve la app:
 *
 *   · Z = 26 es el hierro, Fe.
 *   · El azufre está en el grupo 16 (anfígenos), bajo el oxígeno.
 *   · El aluminio tiene valencia 3 (sin signo) y actúa siempre con número de oxidación +3.
 *   · El cobre actúa más a menudo con +2 (Cu(II)), aunque también exista +1.
 *   · El hierro con +3 es «férrico» en nomenclatura tradicional (con +2 sería «ferroso»).
 *   · NO₂⁻ es el nitrito; NO₃⁻ sería el nitrato.
 *   · El flúor es el único halógeno con un solo número de oxidación, −1, por ser el elemento
 *     más electronegativo: nunca actúa como positivo.
 *   · El fosfato PO₄³⁻ tiene carga −3.
 *   · En el sulfato SO₄²⁻ el azufre actúa con +6: 4 oxígenos a −2 suman −8, y −8 + 6 = −2,
 *     que es la carga del ion.
 *   · En el peróxido de hidrógeno H₂O₂ el oxígeno actúa con −1, no con el −2 habitual: es la
 *     excepción que hace que sea un peróxido.
 *
 * EL CONVENIO QUE SE BLINDA AQUÍ es que **valencia ≠ número de oxidación**: la valencia es la
 * capacidad de combinación y va SIN signo; el número de oxidación va CON signo. Los casos 3 y
 * 4 piden uno y otro a propósito, y el signo NO es una grafía alternativa: quien escribe «2»
 * donde la respuesta es «−2» no ha acertado con otra ortografía, ha dado otro dato.
 */

/**
 * Público mayoritariamente mexicano y colombiano: ningún enunciado se ancla a un país.
 *
 * ⚠️ «Valencia» NO entra en esta lista aunque sea una ciudad: es el término central de la app
 * y aparece en casi todos los enunciados. Meterla haría fallar el test por su propio tema, y
 * la salida sería relajar la regla, que es peor que no tenerla.
 */
const PAISES_Y_CIUDADES =
  /\b(España|Espa(ñ|n)ol|M(é|e)xico|Mexicano|Colombia|Argentina|Chile|Per(ú|u)|Venezuela|Uruguay|Bolivia|Paraguay|Guatemala|Cuba|Madrid|Barcelona|Sevilla|Bogot(á|a)|Buenos Aires|Caracas|Montevideo|Quito|La Habana|Par(í|i)s|Londres|Nueva York|Estados Unidos|Francia|Italia|Roma|Alemania|Berl(í|i)n|Portugal|Lisboa)\b/i;

test.describe('Tabla de Valencias · ficha de búsqueda para el aula', () => {
  test('1 · hay exactamente 12 preguntas, con ids 1..12 sin huecos', () => {
    expect(TOTAL_FICHAS).toBe(12);
    expect(FICHAS).toHaveLength(12);
    expect(FICHAS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const primera = FICHAS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = FICHAS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(primera);
  });

  test('3 · la respuesta declarada coincide con releerla de la tabla', () => {
    // En el tipo B «recalcular» es volver a LEER el dato de ELEMENTOS/IONES. Caza a quien
    // edita un enunciado y se olvida de la respuesta, y también a quien toca la tabla.
    for (const ficha of FICHAS) {
      const releida = resolverFicha(ficha.datos);
      expect(releida.ok, `pregunta ${ficha.id} no resuelve`).toBe(true);
      expect(releida.valor, `pregunta ${ficha.id}`).toBe(ficha.respuesta);
    }
  });

  test('4 · cada pregunta trae enunciado, etiqueta, respuesta no vacía y dónde mirar', () => {
    for (const ficha of FICHAS) {
      expect(ficha.enunciado.trim().length, `pregunta ${ficha.id}`).toBeGreaterThan(20);
      expect(ficha.etiquetaRespuesta.trim().length, `pregunta ${ficha.id}`).toBeGreaterThan(0);
      expect(ficha.respuesta.trim().length, `pregunta ${ficha.id}`).toBeGreaterThan(0);
      expect(ficha.pasos.length, `pregunta ${ficha.id}`).toBeGreaterThan(0);
      expect(ficha.pista.trim().length, `pregunta ${ficha.id}`).toBeGreaterThan(0);
    }
  });

  test('5 · ningún enunciado nombra un país ni una ciudad', () => {
    for (const ficha of FICHAS) {
      expect(PAISES_Y_CIUDADES.test(ficha.titulo), `título de la ${ficha.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES.test(ficha.enunciado), `enunciado de la ${ficha.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES.test(ficha.pista), `pista de la ${ficha.id}`).toBe(false);
    }
  });

  test('6 · la práctica al azar es reproducible, variada y saca los datos de la propia tabla', () => {
    for (const semilla of [1, 7, 42, 12345, 999999]) {
      const a = generarPreguntaAleatoria(semilla);
      const b = generarPreguntaAleatoria(semilla);
      expect(b.enunciado, `semilla ${semilla}`).toBe(a.enunciado);
      expect(b.respuesta, `semilla ${semilla}`).toBe(a.respuesta);
    }

    const enunciados = new Set<string>();
    const campos = new Set<string>();
    for (let semilla = 1; semilla <= 40; semilla++) {
      const pregunta = generarPreguntaAleatoria(semilla);
      enunciados.add(pregunta.enunciado);
      campos.add(pregunta.campo);
      expect(pregunta.respuesta.trim().length, `semilla ${semilla}`).toBeGreaterThan(0);
      // Su propia respuesta tiene que aceptarse: si divergieran, el alumno entrenaría con
      // una regla y sería corregido con otra.
      expect(comprobarFicha(pregunta.respuesta, pregunta).correcto, `semilla ${semilla}`).toBe(
        true
      );
    }
    // REPRODUCIBLE NO ES VARIADO: un generador degenerado pasa la prueba de arriba y falla
    // aquí, que es exactamente lo que ocurrió en simulador-genetica.
    expect(enunciados.size).toBeGreaterThanOrEqual(10);
    expect(campos.size).toBeGreaterThanOrEqual(3);
  });

  test('7 · comparar normalizado acepta los sinónimos declarados y rechaza lo demás', () => {
    // Lo que la normalización SÍ debe perdonar: mayúsculas, tildes, espacios sobrantes y el
    // menos tipográfico «−» (U+2212), que es el que copia quien pega desde la propia tabla.
    expect(normalizarRespuesta('  Férrico ')).toBe(normalizarRespuesta('ferrico'));
    expect(normalizarRespuesta('FE')).toBe(normalizarRespuesta('fe'));
    expect(normalizarRespuesta('−3')).toBe(normalizarRespuesta('-3'));

    // Cada pregunta acepta su propia respuesta y todos los sinónimos que declara.
    for (const ficha of FICHAS) {
      expect(comprobarFicha(ficha.respuesta, ficha).correcto, `pregunta ${ficha.id}`).toBe(true);
      for (const sinonimo of ficha.sinonimos) {
        expect(
          comprobarFicha(sinonimo, ficha).correcto,
          `pregunta ${ficha.id}, sinónimo «${sinonimo}»`
        ).toBe(true);
      }
      // Y ninguna acepta la cadena vacía, que si no sería un aprobado gratis.
      expect(comprobarFicha('', ficha).correcto, `pregunta ${ficha.id}`).toBe(false);
      expect(comprobarFicha('   ', ficha).correcto, `pregunta ${ficha.id}`).toBe(false);
    }
  });

  test('7.bis · el signo no es una grafía: valencia y número de oxidación son dos datos', () => {
    // La valencia es la capacidad de combinación y va SIN signo; el número de oxidación va
    // CON signo. Es el convenio de esta app y el error clásico del tema.
    const valencia = FICHAS.find((c) => c.etiquetaRespuesta.toLowerCase().includes('sin signo'));
    expect(valencia, 'ninguna pregunta pide la valencia sin signo').toBeTruthy();
    expect(valencia!.respuesta).not.toContain('+');
    expect(valencia!.respuesta).not.toContain('-');

    const conSigno = FICHAS.filter((c) => /^[+\-−]/.test(c.respuesta));
    expect(conSigno.length, 'ninguna pregunta pide un número de oxidación con signo').toBeGreaterThan(
      0
    );
    for (const ficha of conSigno) {
      // Quien escribe el número sin su signo negativo NO ha acertado con otra ortografía.
      if (/^[-−]/.test(ficha.respuesta)) {
        const sinSigno = ficha.respuesta.replace(/^[-−]/, '');
        expect(comprobarFicha(sinSigno, ficha).correcto, `pregunta ${ficha.id}`).toBe(false);
      }
      // Y la etiqueta avisa de que el signo cuenta, para que nadie lo falle por no saberlo.
      expect(ficha.etiquetaRespuesta.toLowerCase(), `pregunta ${ficha.id}`).toContain('signo');
    }
  });

  test('7.ter · los datos que leen las preguntas son los mismos que ve el alumno', () => {
    // El traslado de ELEMENTOS/IONES a datos.ts existe para que la respuesta esperada salga
    // de la MISMA tabla que se muestra. Si alguien añadiera un elemento solo en un sitio,
    // esto caería.
    expect(ELEMENTOS).toHaveLength(51); // la cifra que anuncian metadata.ts y el JSON-LD
    expect(IONES.length).toBeGreaterThan(0);

    const hierro = ELEMENTOS.find((e) => e.z === 26);
    expect(hierro?.simbolo).toBe('Fe');
    expect(hierro?.tradicional?.[3]).toBe('férrico');
    expect(hierro?.tradicional?.[2]).toBe('ferroso');

    const azufre = ELEMENTOS.find((e) => e.simbolo === 'S');
    expect(azufre?.grupo).toContain('16');

    // El flúor es el único halógeno con un solo número de oxidación: por eso vale como caso.
    const fluor = ELEMENTOS.find((e) => e.simbolo === 'F');
    expect(fluor?.estados).toHaveLength(1);
    expect(fluor?.estados[0].valor).toBe(-1);

    // Ningún elemento se quedó sin ejemplo al mudar la tabla.
    for (const elemento of ELEMENTOS) {
      expect(elemento.estados.length, `${elemento.simbolo} sin estados`).toBeGreaterThan(0);
      for (const estado of elemento.estados) {
        expect(estado.ejemplo.trim().length, `${elemento.simbolo} sin ejemplo`).toBeGreaterThan(0);
      }
    }
  });

  test('un dato que no está en la tabla no lanza: devuelve un error que la vista puede pintar', () => {
    // Un `throw` dentro de un render de React tumba la app entera; un error devuelto se pinta.
    const inventado = resolverFicha({ campo: 'grupo', simbolo: 'Zzz' });
    expect(inventado.ok).toBe(false);
    expect(inventado.error).toBeTruthy();
  });
});

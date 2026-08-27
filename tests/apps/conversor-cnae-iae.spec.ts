import { test, expect, type Page } from '@playwright/test';
import { SECCIONES_IAE } from '../../data/fiscal/cnae-iae';

/**
 * Buscador de códigos CNAE-2025 y epígrafes del IAE
 * Segmento FISCAL, riesgo 1 CRÍTICO.
 *   · Inspección     20/08/2026 → 5 hallazgos, reparados en a716b338 el 21/08/2026.
 *   · RE-inspección  27/08/2026 → los 5 siguen cerrados (bloque «REGRESIONES»), y
 *     aparecen 2 abiertos nuevos (bloque «HALLAZGOS ABIERTOS», con `test.fail()`).
 *
 * POR QUÉ ESTA APP ES DELICADA
 *   No existe ninguna tabla oficial de correspondencia CNAE ⇄ IAE: el INE publica la
 *   CNAE y el RD Legislativo 1175/1990 las Tarifas del IAE, pero el puente entre ambas
 *   es una construcción de quien la publica, no un dato. Lo dice el propio módulo de
 *   datos (`FISCAL_CNAE_IAE_META.sinEquivalenciaOficial = true`). La pregunta central
 *   de la inspección era si la app promete una conversión que no puede dar. NO lo hace:
 *   se llama «conversor» solo en el slug (captura SEO documentada en metadata.ts) y en
 *   la página es un buscador dual que niega la conversión en un <h2> no colapsable, en
 *   el DisclaimerCard crítico, en la FAQ visible y en el FAQPage del JSON-LD. Eso queda
 *   fijado por el bloque «REGRESIÓN — lo que la app promete» y no debe romperse.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (nunca de lo que devuelve la app)
 *   · Estructura y literales del IAE — RD Legislativo 1175/1990, Tarifas e Instrucción
 *     (texto consolidado, https://www.boe.es/buscar/act.php?id=BOE-A-1990-23930), que es
 *     la fuente que la propia app declara en `public/datos/cnae-iae-catalogo.json`
 *     (meta.iae.fuente) y en `data/fiscal/cnae-iae.ts` (FISCAL_CNAE_IAE_META.iae).
 *   · Clases de la CNAE-2025 y correspondencia CNAE-2009 → CNAE-2025 — RD 10/2025 (INE),
 *     misma fuente declarada (meta.cnae.fuente). El catálogo servido lleva 1.060 entradas
 *     de CNAE, 1.431 de IAE, 629 correspondencias directas y 664 inversas, generado el
 *     20/07/2026.
 *   · Textos y porcentajes de retención por sección — SECCIONES_IAE de
 *     `data/fiscal/cnae-iae.ts`, importado arriba para que el valor esperado no se
 *     transcriba a mano en este fichero (15 % general y 7 % el año de inicio y los dos
 *     siguientes, para las secciones 2ª y 3ª).
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER
 *   El literal de los catálogos, la jerarquía División → Agrupación → Grupo → Epígrafe,
 *   la sección de cada epígrafe (1ª empresarial / 2ª profesional / 3ª artística) con su
 *   consecuencia sobre la retención de IRPF, la detección de códigos de la CNAE-2009 y el
 *   rechazo limpio de lo que no existe.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()`. Afirman lo que DEBERÍA pasar y
 * hoy fallan a propósito. El día que se reparen pasarán a ROJO («expected to fail, but
 * passed»): entonces se les quita la marca y se quedan como regresión. No se reescribe el
 * valor esperado.
 */

const RUTA = '/conversor-cnae-iae/';

/** Cada resultado es un <li> de la lista; el resto de clases con «ficha» son hijos suyos. */
const fichas = (page: Page) => page.locator('li[class*="ficha"]');

/** «N resultados · se muestran los 10 primeros…» del panel activo. */
const contador = (page: Page) => page.locator('[class*="contador"]').first();

/** Aviso «X es un código de la CNAE-2009…». */
const avisoAntiguo = (page: Page) => page.locator('[class*="avisoAntiguo"]');

/** Textos de retención tal y como los publica data/fiscal — no se copian a mano. */
const SECCION_1 = SECCIONES_IAE.find((s) => s.seccion === '1ª')!;
const SECCION_2 = SECCIONES_IAE.find((s) => s.seccion === '2ª')!;
const SECCION_3 = SECCIONES_IAE.find((s) => s.seccion === '3ª')!;

/** Abre la página y espera a que el catálogo (fetch de ~315 KB) esté cargado. */
async function abrir(page: Page) {
  await page.goto(RUTA);
  await expect(page.locator('#buscador-cnae')).toBeVisible();
}

async function buscarCnae(page: Page, consulta: string) {
  await page.getByRole('tab', { name: 'CNAE-2025' }).click();
  await page.locator('#buscador-cnae').fill(consulta);
}

async function buscarIae(page: Page, consulta: string) {
  await page.getByRole('tab', { name: 'Epígrafes del IAE' }).click();
  await page.locator('#buscador-iae').fill(consulta);
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — hostelería y peluquería: código y texto, con su sección
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 (normal) — 673.2 y «peluquería» devuelven el literal, la jerarquía y la Sección 1ª', async ({
  page,
}) => {
  await abrir(page);

  // ── Por código. RD Leg. 1175/1990, Sección 1ª:
  //      División 6     COMERCIO, RESTAURANTES Y HOSPEDAJE, REPARACIONES
  //      Agrupación 67  Servicio de alimentación
  //      Grupo 673      En cafés y bares, con y sin comida
  //      Epígrafe 673.2 Otros cafés y bares   ← lo que se declara en el modelo 036/037
  await buscarIae(page, '673.2');
  await expect(contador(page)).toHaveText(/^1 resultado/);
  await expect(fichas(page)).toHaveCount(1);

  const cafe = fichas(page).first();
  await expect(cafe).toContainText('673.2');
  await expect(cafe).toContainText('cafés y bares');
  await expect(cafe).toContainText('Sección 1ª');
  await expect(cafe).toContainText('Epígrafe');
  await expect(cafe).toContainText('División 6: COMERCIO, RESTAURANTES Y HOSPEDAJE, REPARACIONES');
  await expect(cafe).toContainText('Agrupación 67: Servicio de alimentación');
  await expect(cafe).toContainText('Grupo 673: En cafés y bares, con y sin comida');
  // SECCIONES_IAE de data/fiscal/cnae-iae.ts: la 1ª, empresarial, no lleva retención
  await expect(cafe).toContainText(SECCION_1.retencion);
  expect(SECCION_1.retencionIrpf).toBe(false);

  // ── Por texto (el buscador tiene que encontrar sin que se sepa el código).
  //    RD Leg. 1175/1990, Sección 1ª, División 9 «OTROS SERVICIOS», Agrupación 97
  //    «Servicios personales», Grupo 972 «Salones de peluquería e institutos de belleza»,
  //    Epígrafe 972.1 «Servicios de peluquería de señora y caballero».
  await buscarIae(page, 'peluquería');
  // Son TRES desde el 21/08/2026: además del epígrafe 972.1 y su grupo 972, sale el
  // epígrafe hermano 972.2, cuyo título propio («Salones e institutos de belleza…») no
  // lleva la palabra pero cuelga del grupo «Salones de peluquería e institutos de
  // belleza». Es justo lo que se reparó: los títulos que dependen del padre.
  await expect(contador(page)).toHaveText(/^3 resultados/);
  await expect(fichas(page).first()).toContainText('972.1');
  await expect(fichas(page).first()).toContainText('Servicios de peluquería de señora y caballero');
  await expect(fichas(page).first()).toContainText('Agrupación 97: Servicios personales');
  await expect(fichas(page).nth(1)).toContainText('972.2');
  await expect(fichas(page).nth(2)).toContainText('Salones de peluquería e institutos de belleza');

  // ── El buscador tolera acentos: «peluqueria» sin tilde da lo mismo.
  await buscarIae(page, 'peluqueria');
  await expect(contador(page)).toHaveText(/^3 resultados/);

  // ── Y en la CNAE, la búsqueda en lenguaje corriente. El catálogo declara el sinónimo
  //    «hago páginas web» en la clase 62.10 «Actividades de programación informática».
  await buscarCnae(page, 'hago páginas web');
  await expect(contador(page)).toHaveText(/^1 resultado/);
  await expect(fichas(page).first()).toContainText('62.10');
  await expect(fichas(page).first()).toContainText('Actividades de programación informática');
  await expect(fichas(page).first()).toContainText('División 62');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — un código antiguo que se reparte, y el salto a la Sección 2ª
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 2 (límite) — 4711 se reparte en DOS clases y el profesional cae en la Sección 2ª', async ({
  page,
}) => {
  await abrir(page);

  // ── 4711 es un código de la CNAE-2009. La tabla oficial de correspondencia del INE
  //    incorporada al catálogo lo reparte entre DOS clases de la CNAE-2025:
  //      47.11 Comercio al por menor no especializado con predominio de productos
  //            alimenticios, bebidas y tabaco
  //      47.91 Actividades de servicios de intermediación para el comercio al por menor
  //            no especializado
  //    Las dos tienen que verse: quedarse con una sería elegir por el usuario.
  await buscarCnae(page, '4711');
  await expect(avisoAntiguo(page)).toContainText('4711');
  await expect(avisoAntiguo(page)).toContainText('existe en la CNAE-2009');
  await expect(contador(page)).toHaveText(/^2 resultados/);
  await expect(fichas(page)).toHaveCount(2);
  await expect(fichas(page).first()).toContainText('47.11');
  await expect(fichas(page).first()).toContainText(
    'Comercio al por menor no especializado con predominio de productos alimenticios, bebidas y tabaco',
  );
  await expect(fichas(page).nth(1)).toContainText('47.91');
  await expect(fichas(page).nth(1)).toContainText(
    'Actividades de servicios de intermediación para el comercio al por menor no especializado',
  );

  // ── El límite que más cuesta dinero: la sección del IAE. Un abogado NO está en la
  //    Sección 1ª. RD Leg. 1175/1990, Sección 2ª (actividades profesionales),
  //    División 7, Agrupación 73 «Profesionales del Derecho», Grupo 731 «Abogados».
  //    La Sección 2ª no tiene epígrafes: el grupo ES el código que se declara.
  await buscarIae(page, 'abogado');
  await expect(contador(page)).toHaveText(/^1 resultado/);
  const abogado = fichas(page).first();
  await expect(abogado).toContainText('731');
  await expect(abogado).toContainText('Abogados');
  await expect(abogado).toContainText('Sección 2ª');
  await expect(abogado).toContainText('Grupo');
  await expect(abogado).toContainText('Agrupación 73: Profesionales del Derecho');
  // SECCIONES_IAE de data/fiscal/cnae-iae.ts: 15 % general, 7 % los tres primeros años
  await expect(abogado).toContainText(SECCION_2.retencion);
  expect(SECCION_2.tipoRetencion).toBe(15);
  expect(SECCION_2.tipoRetencionInicio).toBe(7);

  // ── Y la tercera sección, la artística, existe y se etiqueta como tal.
  //    RD Leg. 1175/1990, Sección 3ª, Agrupación 01 «Actividades relacionadas con el
  //    cine, el teatro y el circo», Grupo 013 «Actores de cine y teatro». La Sección 3ª
  //    no tiene divisiones: su jerarquía empieza en la agrupación.
  await buscarIae(page, 'Actores de cine');
  await expect(contador(page)).toHaveText(/^1 resultado/);
  const actor = fichas(page).first();
  await expect(actor).toContainText('013');
  await expect(actor).toContainText('Actores de cine y teatro');
  await expect(actor).toContainText('Sección 3ª');
  await expect(actor).toContainText(
    'Agrupación 01: Actividades relacionadas con el cine, el teatro y el circo',
  );
  await expect(actor).toContainText(SECCION_3.retencion);

  // ── Formato raro del código: en las Tarifas el epígrafe 505.6 «Pintura de cualquier
  //    tipo y clase…» lleva punto, y quien lo copia de un 036 escaneado suele teclear
  //    coma. El buscador se queda con los dígitos, así que «505,6» tiene que dar lo
  //    mismo que «505.6» y un único resultado: ningún otro código del IAE empieza por
  //    los dígitos 5056 (RD Leg. 1175/1990, Sección 1ª, Agrupación 50 «Construcción»).
  await buscarIae(page, '505,6');
  await expect(contador(page)).toHaveText(/^1 resultado/);
  await expect(fichas(page).first()).toContainText('505.6');
  await expect(fichas(page).first()).toContainText(
    'Pintura de cualquier tipo y clase y revestimientos con papel, tejidos o plásticos',
  );

  // ── Y el límite de las Tarifas que más confunde: el MISMO código 013 existe en las
  //    tres secciones y designa tres actividades sin relación entre sí (RD Leg.
  //    1175/1990). No puede colapsarse en un resultado: la sección decide la retención.
  await buscarIae(page, '013');
  await expect(contador(page)).toHaveText(/^3 resultados/);
  await expect(fichas(page).nth(0)).toContainText('Explotación intensiva de ganado bovino de cebo');
  await expect(fichas(page).nth(0)).toContainText('Sección 1ª');
  await expect(fichas(page).nth(1)).toContainText('Veterinarios');
  await expect(fichas(page).nth(1)).toContainText('Sección 2ª');
  await expect(fichas(page).nth(2)).toContainText('Actores de cine y teatro');
  await expect(fichas(page).nth(2)).toContainText('Sección 3ª');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (debe rechazarse) — lo que no existe no puede devolver un código
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 3 (debe rechazarse) — código mal formado, inexistente y campo vacío', async ({
  page,
}) => {
  await abrir(page);

  // ── Mal formado: letras y dígitos que no son ningún código. Ninguna clase de la
  //    CNAE-2025 empieza por los dígitos 123 (la división 12 solo tiene la clase 12.00),
  //    así que la respuesta correcta es cero resultados, no un código aproximado.
  await buscarCnae(page, 'abc123');
  await expect(contador(page)).toHaveText(/^0 resultados/);
  await expect(fichas(page)).toHaveCount(0);
  await expect(avisoAntiguo(page)).toHaveCount(0); // no puede decir que sea un código de 2009
  await expect(page.locator('[class*="sinResultados"]').first()).toContainText(
    'No hay ninguna entrada que encaje con lo que has escrito.',
  );

  // ── Inexistente en la CNAE-2025: no hay clase 99.99 ni correspondencia 9999.
  await buscarCnae(page, '99.99');
  await expect(contador(page)).toHaveText(/^0 resultados/);
  await expect(avisoAntiguo(page)).toHaveCount(0);

  // ── Solo espacios: no es «cero resultados», es «no has buscado nada». El contador no
  //    debe aparecer, porque «0 resultados» ante un campo en blanco es un falso negativo.
  await buscarCnae(page, '   ');
  await expect(contador(page)).toHaveCount(0);
  await expect(fichas(page)).toHaveCount(0);
  await expect(page.locator('[class*="sinResultados"]').first()).toContainText(
    'Escribe arriba a qué te dedicas para localizar tu código',
  );

  // ── Solo letras en las Tarifas del IAE.
  await buscarIae(page, 'zzzz');
  await expect(contador(page)).toHaveText(/^0 resultados/);
  await expect(fichas(page)).toHaveCount(0);
  await expect(page.locator('[class*="sinResultados"]').first()).toContainText(
    'Ningún epígrafe coincide con esa búsqueda.',
  );

  // ── Vacío: no vuelca las 1.431 entradas del catálogo, pide un criterio.
  await buscarIae(page, '');
  await expect(contador(page)).toHaveCount(0);
  await expect(fichas(page)).toHaveCount(0);
  await expect(page.locator('[class*="sinResultados"]').first()).toContainText(
    'Escribe arriba la actividad o el epígrafe que buscas',
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// REGRESIÓN — lo que la app promete: NO hay conversión CNAE → IAE
// ═══════════════════════════════════════════════════════════════════════════
test('REGRESIÓN — la app niega la conversión CNAE→IAE en la página, en el disclaimer y en el JSON-LD', async ({
  page,
}) => {
  await abrir(page);

  // El aviso principal va FUERA de EducationalSection y no es colapsable (CLAUDE.md:
  // un aviso de responsabilidad nunca se esconde dentro del contenido educativo).
  const aviso = page.locator('section[aria-labelledby="aviso-sin-tabla"]');
  await expect(aviso).toBeVisible();
  await expect(aviso.locator('h2')).toHaveText(
    'Aquí no hay conversión automática de CNAE a IAE, y es a propósito',
  );
  await expect(aviso).toContainText(
    'No existe una tabla oficial que traduzca un código CNAE en un epígrafe del IAE.',
  );

  // DisclaimerCard de nivel 1 CRÍTICO, visible sin desplegar nada.
  await expect(
    page.getByText('Información Importante sobre Herramientas Financieras').first(),
  ).toBeVisible();
  await expect(
    page.getByText('no decide qué código corresponde a tu actividad').first(),
  ).toBeVisible();

  // DataReference con las dos fuentes normativas y su fecha de verificación (20/07/2026).
  // El día 24/08/2026 esta línea esperaba «20/7/2026», sin el cero: era el formato que daba
  // `formatDate` con `toLocaleDateString('es-ES')` a secas, y el test lo fijaba como contrato
  // pese a incumplir el DD/MM/YYYY obligatorio del CLAUDE.md §2 (hallazgo 282 del Inspector).
  await expect(page.getByText('RD 10/2025', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('RD Legislativo 1175/1990', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('20/07/2026', { exact: false }).first()).toBeVisible();

  // El FAQPage del JSON-LD dice lo mismo que la página: sin él, las IAs citarían la
  // app como si fuese un conversor.
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const tipos = bloques.map((bloque) => JSON.parse(bloque)['@type']);
  expect(tipos).toContain('WebApplication');
  expect(tipos).toContain('FAQPage');
  const faq = JSON.parse(bloques[tipos.indexOf('FAQPage')]);
  const respuestas: string[] = faq.mainEntity.map(
    (pregunta: { acceptedAnswer: { text: string } }) => pregunta.acceptedAnswer.text,
  );
  expect(respuestas.join(' ')).toContain('no existe una tabla oficial de equivalencia entre ellos');
});

// ═══════════════════════════════════════════════════════════════════════════
// REGRESIONES — los cinco hallazgos del 20/08/2026, reparados el 21/08/2026 (a716b338).
// Verificados de nuevo el 27/08/2026: los cinco siguen cerrados. Los títulos describen
// AHORA la invariante que protegen, no el defecto original; el defecto queda en el
// comentario para que no se pierda de dónde salió la regla.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — regresiones de los hallazgos reparados', () => {
  test('hallazgo 63 — un código de 4 dígitos que TAMBIÉN es clase vigente muestra las dos, y la vigente primero', async ({
    page,
  }) => {
    await abrir(page);

    // 25.30 es una clase VIGENTE de la CNAE-2025 en el propio catálogo de la app:
    // «Fabricación de armas y municiones». Pero 2530 es también un código de la
    // CNAE-2009, y hasta el 21/08/2026 la app lo interpretaba siempre como antiguo y
    // mostraba solo 25.21 «Fabricación de radiadores, generadores de vapor y calderas
    // para calefacción central», bajo un aviso que afirmaba que 2530 era de la
    // CNAE-2009. Quien tuviera hoy el 25.30 se llevaba la clase de otra actividad. Son
    // 26 códigos de cuatro dígitos en esta situación (2530, 2540, 3512, 3513, 1629…):
    // los 26 en los que la clase homónima NO está en su propia correspondencia.
    await buscarCnae(page, '2530');
    await expect(contador(page)).toHaveText(/^2 resultados/);
    // La vigente va primero: es coincidencia exacta de código.
    await expect(fichas(page).first()).toContainText('25.30');
    await expect(fichas(page).first()).toContainText('Fabricación de armas y municiones');
    // Y la clase de la correspondencia oficial sigue estando: se SUMAN, no se sustituyen.
    await expect(fichas(page).nth(1)).toContainText('25.21');
    await expect(fichas(page).nth(1)).toContainText(
      'Fabricación de radiadores, generadores de vapor y calderas para calefacción central',
    );
    // El aviso deja de afirmar en seco que el código es de la clasificación anterior.
    await expect(avisoAntiguo(page)).toContainText('también es una clase');
  });

  test('hallazgo 64 — una correspondencia oficial de 32 clases es alcanzable entera, sin pedir «afinar»', async ({
    page,
  }) => {
    await abrir(page);

    // 4791 (CNAE-2009, «comercio al por menor por correspondencia o Internet») es el
    // código del comercio electrónico, de los más frecuentes en altas recientes. La
    // tabla del INE lo reparte entre 32 clases de la CNAE-2025; la app anunciaba las 32
    // y enseñaba 10, con el consejo «afina la búsqueda para ver el resto». Con un código
    // no hay nada que afinar: tocar los cuatro dígitos rompe la detección, y el filtro
    // por sección deja 31 de las 32 en la sección G. Las 22 restantes —entre ellas
    // 47.92 y 60.39— eran inalcanzables. Le pasaba igual a 4789 (17), 4799 (30) y 8299 (24).
    await buscarCnae(page, '4791');
    await expect(contador(page)).toContainText('32 resultados');
    // Ya no se aconseja «afinar» una consulta por código, que no se puede afinar:
    await expect(contador(page)).not.toContainText('afina la búsqueda');
    await expect(fichas(page)).toHaveCount(10);
    await page.getByRole('button', { name: 'Ver los 32' }).click();
    await expect(fichas(page)).toHaveCount(32);
    // Las que eran inalcanzables, entre ellas 47.92 y 60.39:
    await expect(fichas(page).filter({ hasText: '47.92' })).toHaveCount(1);
    await expect(fichas(page).filter({ hasText: '60.39' })).toHaveCount(1);
  });

  test('hallazgo 65 — la búsqueda por texto llega a los epígrafes de título dependiente', async ({
    page,
  }) => {
    await abrir(page);

    // El texto indexado era solo el del propio código, no el de sus padres. Los epígrafes
    // del Grupo 671 se llaman «De cinco tenedores»… «De un tenedor» (RD Leg. 1175/1990),
    // así que buscar «restaurante» devolvía tres resultados —grupos 671 y 674 y la
    // división 6— y ningún epígrafe, que es justamente lo que se declara en el modelo
    // 036/037. Solo aparecían tecleando «671», y nada lo indicaba. Hay 40 epígrafes con
    // título dependiente de su padre en la misma situación.
    await buscarIae(page, 'restaurante');
    // Los cinco epígrafes del Grupo 671, que son los que se declaran en el 036/037, y
    // en los cinco primeros puestos: no basta con que existan si quedan fuera del corte.
    for (const [posicion, epigrafe] of ['671.1', '671.2', '671.3', '671.4', '671.5'].entries()) {
      await expect(fichas(page).nth(posicion)).toContainText(epigrafe);
    }
    await expect(fichas(page).nth(3)).toContainText('De dos tenedores');
    // Y sin arrastrar los 216 epígrafes que cuelgan de la División 6 «COMERCIO,
    // RESTAURANTES Y HOSPEDAJE»: se hereda el título del GRUPO, no el de la división.
    await expect(contador(page)).toContainText('15 resultados');
  });

  test('hallazgo 66 — la relevancia manda sobre el tipo: «actores» pone delante la Sección 3ª', async ({
    page,
  }) => {
    await abrir(page);

    // «actores» está contenido en «tr-actores». Como el orden ponía primero los epígrafes
    // (peso de tipo) y solo después la relevancia, el primer resultado de buscar
    // «actores» era 321.2 «Construcción de tractores agrícolas», Sección 1ª y sin
    // retención, por delante del 013 «Actores de cine y teatro», Sección 3ª y con
    // retención. En una app donde la sección decide la retención de IRPF, el orden no
    // es cosmético. Los otros tres resultados son las coincidencias accidentales de
    // «tractores» (321.1, 321.2 y el grupo 321), que siguen saliendo pero detrás.
    await buscarIae(page, 'actores');
    await expect(contador(page)).toHaveText(/^4 resultados/);
    await expect(fichas(page).first()).toContainText('Actores de cine y teatro');
    await expect(fichas(page).first()).toContainText('Sección 3ª');
  });

  test('hallazgo 66 bis — «médico» pone delante los dos grupos de la Sección 2ª', async ({
    page,
  }) => {
    await abrir(page);

    // Mismo mecanismo que el anterior. Buscar «médico» devuelve 10 resultados; antes,
    // los primeros eran de la Sección 1ª (fabricación y comercio de material médico) y
    // los grupos 831 «Médicos de Medicina General» y 832 «Médicos Especialistas»,
    // Sección 2ª —los que llevan retención de IRPF—, quedaban al final.
    await buscarIae(page, 'médico');
    await expect(fichas(page).nth(0)).toContainText('Médicos de Medicina General');
    await expect(fichas(page).nth(0)).toContainText('Sección 2ª');
    await expect(fichas(page).nth(1)).toContainText('Médicos Especialistas');
    await expect(fichas(page).nth(1)).toContainText('Sección 2ª');
  });

  test('hallazgo 67 — «oficial» califica a los catálogos, nunca a la herramienta', async ({
    page,
  }) => {
    await abrir(page);

    // La app es escrupulosa con lo que importa —niega la conversión CNAE→IAE cuatro
    // veces— pero se presentaba como «buscador oficial» en el <h1>, en el <title>, en el
    // OpenGraph y en el de Twitter. Oficiales son los catálogos que reproduce (INE y
    // BOE); el buscador es de meskeIA. En una página cuya tesis es «desconfía de las
    // equivalencias no oficiales», llamarse oficial es la ambigüedad que el usuario no
    // puede resolver. El JSON-LD, en cambio, ya la nombraba bien.
    await expect(page.locator('h1')).not.toContainText('buscador oficial');
    await expect(page.locator('h1')).toHaveText(
      'Buscador de códigos CNAE-2025 y epígrafes del IAE',
    );
    expect(await page.title()).not.toContain('buscador oficial');
    expect(await page.title()).toBe('Buscador de códigos CNAE-2025 y epígrafes del IAE | meskeIA');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS — re-inspección del 27/08/2026
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — hallazgos abiertos (27/08/2026)', () => {
  test.fail();

  test('el aviso llama «clase VIGENTE distinta» a la clase que ES la equivalencia del código antiguo', async ({
    page,
  }) => {
    await abrir(page);

    // La reparación del hallazgo 63 añadió un aviso de refuerzo: cuando el código de
    // cuatro dígitos existe además como clase vigente, se advierte de que «ese mismo
    // número también es una clase VIGENTE distinta». Es cierto en los 26 códigos del
    // hallazgo 63 (2530, 2540, 1629…), donde la homónima NO figura en su propia
    // correspondencia. Pero el aviso se emite SIEMPRE que hay homónima, y de los 512
    // códigos con homónima hay 486 en los que la homónima SÍ figura en su propia
    // correspondencia: para esos, la frase contradice a la línea anterior del mismo
    // párrafo.
    //
    // 4711 es uno de ellos, y es además uno de los seis botones de ejemplo de la app.
    // La tabla del INE incorporada al catálogo dice: correspondencia['4711'] = ['47.11',
    // '47.91']. O sea que 47.11 es la equivalencia directa de 4711, no «otra clase».
    await buscarCnae(page, '4711');
    const aviso = avisoAntiguo(page);
    await expect(aviso).toContainText('47.11');
    // Lo que DEBERÍA decir: que 47.11 sigue siendo el equivalente del 4711 antiguo.
    // Lo que dice hoy: «Ojo: ese mismo número también es una clase VIGENTE distinta
    // —47.11 Comercio al por menor no especializado…—, que aparece igualmente en la
    // lista», justo después de anunciar 47.11 como una de las «clases actuales que
    // recogen esa actividad».
    await expect(aviso).not.toContainText('clase VIGENTE distinta');
  });

  test('un código VIGENTE de la CNAE-2025 tecleado con punto se anuncia como código de la clasificación anterior', async ({
    page,
  }) => {
    await abrir(page);

    // Segunda cara del mismo defecto. Quien tiene hoy la clase 47.11 de la CNAE-2025 y
    // la teclea tal cual —con el punto— recibe el aviso «4711 existe en la CNAE-2009, la
    // clasificación anterior», porque la detección solo mira los cuatro dígitos. El
    // catálogo servido contiene 47.11 como clase VIGENTE de la CNAE-2025 (RD 10/2025):
    // el aviso tendría que reconocerlo en vez de mandarlo a la clasificación derogada.
    await buscarCnae(page, '47.11');
    await expect(fichas(page).first()).toContainText('47.11');
    await expect(avisoAntiguo(page)).not.toContainText('la clasificación anterior');
  });

  test('«fotógrafo» devuelve artes gráficas y esconde la clase 74.20 «Actividades de fotografía»', async ({
    page,
  }) => {
    await abrir(page);

    // La promesa del panel es «Escribe cómo describirías tu trabajo», y «fotógrafo» es
    // uno de los seis botones de ejemplo que la propia app ofrece. El catálogo servido
    // contiene la clase 74.20 «Actividades de fotografía» (CNAE-2025, RD 10/2025), que
    // es la que el literal oficial describe. Pero el diccionario de sinónimos coloca
    // «fotógrafo», «fotógrafa», «estudio fotográfico», «reportaje», «book de fotos» y
    // «retrato» en la clase 18.12 «Otras actividades de impresión y artes gráficas».
    //
    // Causa medida en el propio catálogo: los sinónimos se asignaron al PRIMER destino
    // de la correspondencia CNAE-2009 → CNAE-2025. correspondencia['7420'] = ['18.12',
    // '74.20'], así que los términos de fotografía cayeron en 18.12. Son 51 de las 134
    // clases con sinónimos las que los recibieron de un código de 2009 con más de un
    // destino, o sea con el destino elegido de forma arbitraria.
    await buscarCnae(page, 'fotógrafo');
    await expect(fichas(page).filter({ hasText: '74.20' })).toHaveCount(1);
  });

  test('«gestión administrativa» devuelve una clase de construcción por el mismo desajuste', async ({
    page,
  }) => {
    await abrir(page);

    // Mismo mecanismo, otra clase: correspondencia['8299'] («Otras actividades de apoyo
    // a las empresas», CNAE-2009) reparte en 24 clases de la CNAE-2025 y la primera de
    // la lista es 43.60 «Actividades de intermediación para servicios de construcción
    // especializada», así que ahí fueron a parar «gestión administrativa», «back
    // office», «externalización», «servicios auxiliares» y «trámites». Hoy es el ÚNICO
    // resultado de teclear «gestión administrativa», con la 82.10 y sus hermanas fuera.
    await buscarCnae(page, 'gestión administrativa');
    await expect(fichas(page).first()).not.toContainText('43.60');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CANDADO DE DATO — los porcentajes de retención de la página salen de data/fiscal
// ═══════════════════════════════════════════════════════════════════════════
test('CANDADO — los porcentajes de retención de la FAQ siguen a SECCIONES_IAE', async ({
  page,
}) => {
  await abrir(page);

  // `data/fiscal/cnae-iae.ts` publica los tipos de retención como dato normativo con
  // contrato de vigilancia (SECCIONES_IAE[].tipoRetencion / tipoRetencionInicio), y su
  // propio comentario dice que las apps NO deben redactar sus textos. El bloque
  // educativo de la página los escribe a mano («15 % con carácter general y 7 % el año
  // de inicio…»), así que hoy coinciden por casualidad, no por construcción.
  //
  // Este test NO comprueba de dónde viene el número —eso no se ve desde el navegador—,
  // sino que salte el día en que diverjan: si alguien actualiza data/fiscal y la página
  // se queda con el literal antiguo, aquí se rompe. Es la red mínima mientras el
  // hallazgo `dato` del 27/08/2026 siga abierto.

  // El bloque educativo está siempre en el DOM pero oculto por CSS (EducationalSection
  // lo hace así para que Googlebot lo rastree), de modo que hay que desplegarlo.
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const respuestaFaq = page
    .locator('div[class*="faqItem"]')
    .filter({ hasText: '¿Qué cambia según la sección del IAE' })
    .first();
  await expect(respuestaFaq).toContainText(`${SECCION_2.tipoRetencion} %`);
  await expect(respuestaFaq).toContainText(`${SECCION_2.tipoRetencionInicio} %`);

  // Y el mismo par de cifras, en el texto que la página SÍ toma de data/fiscal
  // (las tarjetas de sección del panel del IAE renderizan SECCIONES_IAE[].retencion).
  await page.getByRole('tab', { name: 'Epígrafes del IAE' }).click();
  await expect(page.locator('[class*="seccionCard"]').filter({ hasText: 'Sección 2ª' }).first())
    .toContainText(SECCION_2.retencion);
});

import { test, expect, type Page } from '@playwright/test';
import { SECCIONES_IAE, CNAE_VIGENCIA, FISCAL_CNAE_IAE_META } from '../../data/fiscal/cnae-iae';

/**
 * Buscador de códigos CNAE-2025 y epígrafes del IAE
 * Segmento FISCAL, riesgo 1 CRÍTICO.
 *   · Inspección     20/08/2026 → 5 hallazgos, reparados en a716b338 el 21/08/2026.
 *   · RE-inspección  27/08/2026 → los 5 siguen cerrados (bloque «REGRESIONES»), y
 *     aparecen 2 abiertos nuevos (bloque «HALLAZGOS ABIERTOS», con `test.fail()`).
 *   · RE-inspección  28/08/2026 → cierre verificado de los 5 del 27/08 (bloque «cierre
 *     verificado el 28/08/2026») y 4 hallazgos nuevos (CASOS 4 a 6 y el bloque de zona
 *     horaria, todos con `test.fail()` hasta que se reparen).
 *   · RE-inspección  30/08/2026 → los 4 del 28/08 (479-482) se reparan en 1e3837e5 y se
 *     RE-VERIFICAN de cero en el bloque «re-verificación del 30/08/2026», resolviendo los
 *     tres casos a mano sobre el catálogo antes de abrir el navegador. Los cuatro siguen
 *     cerrados. Aparecen 4 hallazgos nuevos —dos de ellos efecto colateral de esa misma
 *     reparación— en el bloque «hallazgos abiertos del 30/08/2026», con `test.fail()`.
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
 *     de CNAE, 1.431 de IAE, 629 correspondencias directas y 664 inversas, regenerado el
 *     30/08/2026 al reordenar los sinónimos (hallazgos 524-525).
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
 * REGRESIÓN de la re-inspección: al final. Estaban con `test.fail()` y hoy están reparados;
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

  // DataReference con las dos fuentes normativas y su fecha de verificación, que es
  // meta.generado del catálogo: se regeneró el 30/08/2026 al reordenar los sinónimos
  // (hallazgos 524-525), así que la fecha visible avanzó con él.
  await expect(page.getByText('RD 10/2025', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('RD Legislativo 1175/1990', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('30/08/2026', { exact: false }).first()).toBeVisible();

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
// REGRESIÓN — los hallazgos de la re-inspección del 27/08/2026, REPARADOS ese mismo día.
// Estaban marcados con `test.fail()`; ahora sujetan la reparación.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — hallazgos del 27/08/2026, reparados', () => {
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
    // `toHaveCount(0)` y no `not.toContainText`: reparado, el aviso NO SE PINTA, y una
    // aserción de texto sobre un elemento que no existe falla igual que si existiera con
    // el texto malo. El localizador dejó de encontrar nada porque eso era el defecto.
    await expect(avisoAntiguo(page)).toHaveCount(0);
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

/**
 * CANDADO del hallazgo 423 — el reparto de los sinónimos dentro de la correspondencia.
 *
 * El defecto no era «un sinónimo mal puesto»: era el MECANISMO. Los términos coloquiales se
 * asignaron al PRIMER destino de la tabla CNAE-2009 → CNAE-2025, sin mirar cuál de los
 * destinos describe la actividad, y `correspondencia['8299']` reparte en 24 clases mientras
 * `correspondencia['8690']` reparte en 7. Así, los diez términos sanitarios cayeron en el
 * laboratorio de análisis y los cinco administrativos en una clase de construcción.
 *
 * Este test reejecuta el oráculo que encontró el defecto: para cada término, si alguna clase
 * HERMANA de su propia correspondencia lo lleva ENTERO en su título oficial, el término está
 * en la clase equivocada. Se compara por raíces de seis caracteres (para que «fotógrafo» case
 * con «fotografía») y descartando las palabras genéricas de los títulos de la CNAE, sin las
 * cuales casaría cualquier cosa con cualquier cosa («comercio», «actividades», «servicios»).
 *
 * No hace falta navegador: es un contrato sobre el dato.
 */
test('CANDADO — ningún sinónimo está en una clase que un hermano de su correspondencia nombra mejor', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const catalogo = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'datos', 'cnae-iae-catalogo.json'), 'utf8'),
  ) as {
    cnae: { codigo: string; titulo: string; nivel: string }[];
    correspondencia: Record<string, string[]>;
    sinonimos: Record<string, string[]>;
  };

  const GENERICAS = new Set([
    'comercio', 'menor', 'mayor', 'actividades', 'actividad', 'servicios', 'servicio',
    'otros', 'otras', 'otro', 'productos', 'articulos', 'fabricacion', 'venta',
    'especializado', 'especializada', 'similares', 'general', 'generales', 'demas',
    'establecimientos', 'diversos', 'tipos', 'clase', 'para', 'con', 'sin', 'los', 'las',
    'del', 'una', 'uno', 'por', 'cuenta', 'propia', 'ajena', 'auxiliares', 'apoyo',
    'relacionados', 'relacionadas', 'siguientes', 'principalmente', 'excepto', 'incluidas',
  ]);
  const raices = (texto: string): Set<string> => {
    const limpio = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const fuera = new Set<string>();
    for (const w of limpio.match(/[a-z0-9]{3,}/g) ?? []) {
      if (!GENERICAS.has(w)) fuera.add(w.slice(0, 6));
    }
    return fuera;
  };

  const clases = new Map(
    catalogo.cnae.filter((e) => e.nivel === 'clase').map((e) => [e.codigo, e.titulo]),
  );

  /*
   * Excepciones declaradas, con su motivo — el mismo patrón que los `parser-ok:` del
   * proyecto. Un término de UNA sola palabra casa con cualquier hermano que la lleve junto a
   * un calificativo, aunque el hermano sea MÁS específico y por tanto peor destino.
   */
  const ADMITIDOS = new Set([
    // «ropa» a secas pertenece a la confección general (14.10), no a «Confección de ropa
    // INTERIOR» (14.22), que es un subconjunto: mover el término allí sería empeorarlo.
    '«ropa» está en 14.10 y 14.22 lo nombra: Confección de ropa interior',
  ]);

  const malAsignados: string[] = [];
  for (const [codigo, terminos] of Object.entries(catalogo.sinonimos)) {
    const hermanos = new Set<string>();
    for (const destinos of Object.values(catalogo.correspondencia)) {
      if (destinos.length > 1 && destinos.includes(codigo)) {
        destinos.filter((d) => d !== codigo).forEach((d) => hermanos.add(d));
      }
    }
    if (hermanos.size === 0) continue;

    const propias = raices(clases.get(codigo) ?? '');
    for (const termino of terminos) {
      const rt = raices(termino);
      if (rt.size === 0 || [...rt].some((r) => propias.has(r))) continue;
      for (const hermano of hermanos) {
        const suyas = raices(clases.get(hermano) ?? '');
        if ([...rt].every((r) => suyas.has(r))) {
          const linea = `«${termino}» está en ${codigo} y ${hermano} lo nombra: ${clases.get(hermano)}`;
          if (!ADMITIDOS.has(linea)) malAsignados.push(linea);
          break;
        }
      }
    }
  }

  expect(malAsignados, malAsignados.join('\n')).toEqual([]);
});

/**
 * CANDADO del hallazgo 426 — la ruta del catálogo se importa del módulo de datos.
 *
 * `data/fiscal/cnae-iae.ts` la exporta con ese fin explícito y la app la redeclaraba: si el
 * generador la cambiase y se actualizase el módulo, esta app seguiría pidiendo la antigua y
 * caería en «No se han podido cargar los catálogos» sin que nada avisara.
 */
test('CANDADO — la app pide el catálogo por CNAE_IAE_RUTA_CATALOGO, no por una ruta suya', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const fuente = readFileSync(
    join(process.cwd(), 'app', 'conversor-cnae-iae', 'page.tsx'),
    'utf8',
  );
  expect(fuente).toContain('CNAE_IAE_RUTA_CATALOGO');
  expect(fuente).not.toMatch(/RUTA_CATALOGO = '\/datos\//);
});

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
  // se queda con el literal antiguo, aquí se rompe. El hallazgo `dato` del 27/08/2026
  // (nº 425) quedó reparado ese mismo día —page.tsx lee ya SECCION_PROFESIONAL de
  // data/fiscal—, así que esto pasa de red mínima a candado de la reparación.

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

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 28/08/2026 · MITAD A — cierre de los cinco hallazgos del 27/08
// (commit 0b1630d9). Se fija el RESULTADO, no el mecanismo: qué clase devuelve cada
// término coloquial y qué dice el aviso en cada una de sus ramas.
//
// Nota: la otra mitad del título de ese commit —«el CSV deja de perder filas»— es del
// sonómetro, no de esta app: aquí no hay exportación de ningún tipo.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — cierre verificado el 28/08/2026', () => {
  test('CIERRE 423 — cada término coloquial devuelve la clase cuyo título oficial lo nombra', async ({
    page,
  }) => {
    await abrir(page);

    // Cada terna sale del catálogo servido: el término figura en `sinonimos[<clase>]` de
    // public/datos/cnae-iae-catalogo.json y el título es el literal de esa clase en la
    // CNAE-2025 (RD 10/2025). Se cubren los tres grupos que el hallazgo 423 midió mal
    // asignados —sanitarios, administrativos y fotografía— más cuatro de los sueltos.
    const esperado: [string, string, string][] = [
      ['fotógrafo', '74.20', 'Actividades de fotografía'],
      ['reportaje', '74.20', 'Actividades de fotografía'],
      ['enfermera', '86.94', 'Actividades de enfermería y enfermería obstétrica'],
      ['matrona', '86.94', 'Actividades de enfermería y enfermería obstétrica'],
      ['psicólogo', '86.93', 'Actividades de psicólogos y psicoterapeutas, excepto médicos'],
      ['fisioterapeuta', '86.95', 'Actividades de fisioterapia'],
      ['osteópata', '86.96', 'Actividades de medicina tradicional, complementaria y alternativa'],
      ['logopeda', '86.99', 'Otras actividades sanitarias n.c.o.p.'],
      ['gestión administrativa', '82.10', 'Actividades administrativas y auxiliares de oficina'],
      ['secretaria virtual', '82.10', 'Actividades administrativas y auxiliares de oficina'],
      ['trámites', '82.99', 'Otras actividades de apoyo a las empresas n.c.o.p.'],
      ['back office', '82.99', 'Otras actividades de apoyo a las empresas n.c.o.p.'],
      ['albañil', '43.91', 'Actividades de mampostería y albañilería'],
      ['buscador', '63.91', 'Actividades de portales de búsqueda en la web'],
      ['mueblería', '47.55', 'Comercio al por menor de muebles, aparatos de iluminación, vajilla y otros artículos de uso doméstico'],
    ];

    for (const [termino, codigo, titulo] of esperado) {
      await buscarCnae(page, termino);
      await expect(contador(page), `«${termino}» debe devolver una sola clase`).toHaveText(
        /^1 resultado/,
      );
      await expect(fichas(page).first()).toContainText(codigo);
      await expect(fichas(page).first()).toContainText(titulo);
    }
  });

  test('CIERRE 422 y 424 — el aviso de código antiguo dice lo contrario en cada una de sus dos ramas', async ({
    page,
  }) => {
    await abrir(page);

    // Rama 1 — la homónima SÍ figura en la correspondencia: son 486 de los 512 códigos
    // con homónima. En el catálogo servido, correspondencia['4711'] = ['47.11','47.91'],
    // o sea que 47.11 es la equivalencia directa de 4711 y no «otra clase».
    await buscarCnae(page, '4711');
    await expect(avisoAntiguo(page)).toContainText('entre ellas 47.11');
    await expect(avisoAntiguo(page)).toContainText(
      'que conserva el mismo número en la clasificación nueva',
    );
    await expect(avisoAntiguo(page)).not.toContainText('clase VIGENTE distinta');

    // Rama 2 — la homónima NO figura en su correspondencia: los 26 códigos del hallazgo
    // 63. correspondencia['2530'] = ['25.21'], y la clase vigente 25.30 es «Fabricación
    // de armas y municiones», otra actividad. Ahí la advertencia enfática SÍ es cierta.
    await buscarCnae(page, '2530');
    await expect(avisoAntiguo(page)).toContainText('clase VIGENTE distinta');
    await expect(avisoAntiguo(page)).toContainText('25.30 Fabricación de armas y municiones');
    await expect(avisoAntiguo(page)).toContainText('no recoge la actividad que buscas');

    // Rama 3 (hallazgo 424) — con el punto, «47.11» es un código VIGENTE de la CNAE-2025:
    // no se pinta ningún aviso de clasificación derogada.
    await buscarCnae(page, '47.11');
    await expect(avisoAntiguo(page)).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 28/08/2026 · MITAD B — hallazgos 479-482, reparados.
// ═══════════════════════════════════════════════════════════════════════════

test('CASO 4 (normal) — «bar» tiene que llegar a la clase 56.30 «Servicios de bebidas»', async ({
  page,
}) => {
  await abrir(page);

  // Hallazgo 479 — reparado. `coincidePalabraCompleta` da a «bar» como sinónimo EXACTO de
  // 56.30 un nivel de relevancia mejor que a «barnices» (20.30), donde «bar» es solo un
  // fragmento dentro de otra palabra. 56.30 entra ahora en los 10 primeros.
  await buscarCnae(page, 'bar');
  await expect(contador(page)).toContainText('13 resultados');
  await expect(fichas(page)).toHaveCount(10);
  await expect(fichas(page).filter({ hasText: '56.30' })).toHaveCount(1);
});

test('CASO 4 bis — al desplegar los 13, «Servicios de bebidas» sí está: el defecto es el corte, no el filtro', async ({
  page,
}) => {
  await abrir(page);

  // Contrapartida del caso anterior, y lo que acota el hallazgo: la clase correcta no se
  // pierde, queda debajo del corte. Este test SÍ pasa hoy y protege que siga estando.
  await buscarCnae(page, 'bar');
  await page.getByRole('button', { name: 'Ver los 13' }).click();
  await expect(fichas(page)).toHaveCount(13);
  await expect(fichas(page).filter({ hasText: '56.30' })).toHaveCount(1);
  await expect(fichas(page).filter({ hasText: '56.30' })).toContainText('Servicios de bebidas');
});

test('CASO 5 (límite) — «enseñanza» deja ver algún epígrafe de la Sección 2ª, que es la que retiene', async ({
  page,
}) => {
  await abrir(page);

  // Hallazgo 480 — reparado. `conRepresentacionDeSeccion` garantiza que el corte visible
  // de 10 incluya al menos una entrada de cada sección presente en los 19 resultados: la
  // Sección es «la distinción con más efecto práctico sobre tus facturas» (retención de
  // IRPF), así que no puede depender de que su título gane por relevancia textual.
  await buscarIae(page, 'enseñanza');
  await expect(contador(page)).toContainText('19 resultados');
  const visibles = fichas(page);
  await expect(visibles).toHaveCount(10);
  await expect(visibles.filter({ hasText: 'Sección 2ª' }).first()).toBeVisible();
});

test('CASO 5 bis — los cinco de la Sección 2ª existen y el filtro de sección los aísla', async ({
  page,
}) => {
  await abrir(page);

  // La vía de escape que sí funciona hoy, y que acota el hallazgo anterior: el filtro por
  // sección. Los cinco códigos son los de las Tarifas: Agrupación 82 y grupos 821, 822,
  // 823 y 826 (RD Leg. 1175/1990, Sección 2ª, División 8).
  await buscarIae(page, 'enseñanza');
  await page.getByRole('button', { name: 'Sección 2ª · Actividades profesionales' }).click();
  await expect(contador(page)).toHaveText(/^5 resultados/);
  await expect(fichas(page).nth(0)).toContainText('821');
  await expect(fichas(page).nth(0)).toContainText('Personal docente de Enseñanza Superior');
  await expect(fichas(page).nth(0)).toContainText(SECCION_2.retencion);

  // Y el despliegue completo en el panel del IAE —nunca probado hasta hoy— trae las 19.
  await page.getByRole('button', { name: 'Todas las secciones' }).click();
  await page.getByRole('button', { name: 'Ver los 19' }).click();
  await expect(fichas(page)).toHaveCount(19);
  await expect(fichas(page).filter({ hasText: 'Personal docente de Enseñanza Media' })).toHaveCount(1);
});

test('CASO 6 (debe rechazarse) — lo que no existe en ninguno de los dos catálogos', async ({
  page,
}) => {
  await abrir(page);

  // 6666 no es código de la CNAE-2009 (no está en `correspondencia`) ni prefijo de
  // ninguna clase de la CNAE-2025: cero resultados y, sobre todo, ningún aviso que lo
  // presente como código de la clasificación anterior.
  await buscarCnae(page, '6666');
  await expect(contador(page)).toHaveText(/^0 resultados/);
  await expect(avisoAntiguo(page)).toHaveCount(0);

  // 888.8 no existe en las Tarifas: ningún epígrafe empieza por esos dígitos.
  await buscarIae(page, '888.8');
  await expect(contador(page)).toHaveText(/^0 resultados/);
  await expect(fichas(page)).toHaveCount(0);
  await expect(page.locator('[class*="sinResultados"]').first()).toContainText(
    'Ningún epígrafe coincide con esa búsqueda.',
  );
});

test('CASO 6 bis (límite) — un código de la CNAE-2009 escrito con punto se reconoce igual', async ({
  page,
}) => {
  await abrir(page);

  // Hallazgo 481 — reparado. `consultaConFormatoVigente` ahora exige también que exista
  // una clase vigente con esos dígitos (`vigenteHomonima !== null`): el formato «dd.dd» por
  // sí solo no basta, porque 117 de los 629 códigos de la CNAE-2009 del catálogo no tienen
  // clase homónima en la CNAE-2025. «14.11» ya no cae en ese vacío.
  await buscarCnae(page, '14.11');
  await expect(fichas(page).first()).toContainText('14.24');
  await expect(fichas(page).first()).toContainText(
    'Confección de prendas de vestir de cuero y peletería',
  );
});

test('CASO 6 ter — el mismo código sin punto sí devuelve su equivalencia', async ({ page }) => {
  await abrir(page);

  // La otra mitad del caso anterior, que hoy pasa y hay que conservar.
  await buscarCnae(page, '1411');
  await expect(contador(page)).toHaveText(/^1 resultado/);
  await expect(avisoAntiguo(page)).toContainText('1411');
  await expect(avisoAntiguo(page)).toContainText('existe en la CNAE-2009');
  await expect(fichas(page).first()).toContainText('14.24');
});

// ═══════════════════════════════════════════════════════════════════════════
// Hallazgo 482 — reparado. `parseISODateLocal` construye el Date en LOCAL en vez de
// `new Date(fechaISO)` (medianoche UTC), que se deslizaba un día al oeste de Greenwich.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — la fecha de vigencia vista desde América', () => {
  test.use({ timezoneId: 'America/Mexico_City', locale: 'es-ES' });

  test('la CNAE-2025 rige desde el 01/01/2026 se lea desde donde se lea', async ({ page }) => {
    await abrir(page);
    await buscarCnae(page, '4711');
    await expect(avisoAntiguo(page)).toContainText('Desde el 01/01/2026');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 30/08/2026 — los tres casos con los que se RE-VERIFICÓ de cero la
// reparación de la tanda 3 (commit 1e3837e5), sin dar el commit por bueno.
//
// Los valores esperados NO salen de lo que devuelve la app: salen del catálogo servido
// (`public/datos/cnae-iae-catalogo.json`, generado desde el RD 10/2025 del INE y el RD
// Legislativo 1175/1990 de las Tarifas) resuelto A MANO con la lógica de
// orden que documenta `app/conversor-cnae-iae/page.tsx`: primero el peso de nivel/tipo o
// la relevancia según el catálogo, y `localeCompare` del código para deshacer empates.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — re-verificación del 30/08/2026', () => {
  test('CASO A (subcadena accidental) — «bar» ordena el sinónimo exacto por delante de «barnices»', async ({
    page,
  }) => {
    await abrir(page);

    // Resuelto a mano sobre el catálogo servido. «bar» aparece en 13 entradas; el orden
    // lo fija primero PESO_NIVEL_CNAE (clase antes que grupo) y después la relevancia:
    //   rel 3 (palabra completa en título o sinónimo) → 56.11 (sinónimo «bar restaurante»)
    //          y 56.30 (sinónimo «bar»), empatados y desempatados por código;
    //   rel 4 (subcadena accidental dentro del título) → 15.12 «talabartería», 20.30
    //          «barnices», 30.12/30.13/33.15/33.18/46.14 «embarcaciones», 96.21 «barberías»;
    //   rel 5 → 47.11 (solo el sinónimo «tienda de barrio»);
    //   y ya en nivel «grupo», 15.1 y 20.3.
    // Lo que fijaba el hallazgo 479: 56.30 «Servicios de bebidas» tiene que ir DELANTE de
    // 20.30 «…barnices…», que es donde «bar» es un fragmento de otra palabra.
    await buscarCnae(page, 'bar');
    await expect(contador(page)).toContainText('13 resultados');
    await expect(fichas(page)).toHaveCount(10);
    await expect(fichas(page).nth(0)).toContainText('56.11');
    await expect(fichas(page).nth(0)).toContainText('Restaurantes');
    await expect(fichas(page).nth(1)).toContainText('56.30');
    await expect(fichas(page).nth(1)).toContainText('Servicios de bebidas');
    // Y «barnices» detrás, no delante: 20.30, en cuarta posición.
    await expect(fichas(page).nth(3)).toContainText('20.30');
    await expect(fichas(page).nth(3)).toContainText(
      'Fabricación de pinturas, barnices y revestimientos similares, tintas de imprenta y masillas',
    );
  });

  test('CASO B (sección que decide la retención) — «enseñanza» mete el grupo 821 de la Sección 2ª dentro del corte', async ({
    page,
  }) => {
    await abrir(page);

    // Resuelto a mano sobre el catálogo servido: «enseñanza» devuelve 19 entradas y las
    // 14 primeras por relevancia son todas de la Sección 1ª (epígrafes 931.2 a 933.1 y
    // sus grupos). El primer código de la Sección 2ª —la única con retención de IRPF—
    // es el grupo 821 «Personal docente de Enseñanza Superior» (RD Leg. 1175/1990,
    // Sección 2ª, División 8, Agrupación 82), y cae en la POSICIÓN 15 del orden natural.
    // `conRepresentacionDeSeccion` lo sube al último hueco del corte de 10: si volviera a
    // quedar fuera, quien da clases por cuenta propia no vería nunca que su sección retiene.
    await buscarIae(page, 'enseñanza');
    await expect(contador(page)).toContainText('19 resultados');
    await expect(fichas(page)).toHaveCount(10);
    const ultima = fichas(page).nth(9);
    await expect(ultima).toContainText('821');
    await expect(ultima).toContainText('Personal docente de Enseñanza Superior');
    await expect(ultima).toContainText('Sección 2ª');
    // El texto de la retención sale de SECCIONES_IAE, no se transcribe aquí.
    await expect(ultima).toContainText(SECCION_2.retencion);
    // Las nueve anteriores son las nueve primeras del orden natural, todas Sección 1ª.
    await expect(fichas(page).nth(0)).toContainText('931.2');
    await expect(fichas(page).nth(8)).toContainText('932');
  });

  test('CASO C (código de la CNAE-2009 sin homónima) — «14.11» resuelve su equivalencia en vez de vaciar la pantalla', async ({
    page,
  }) => {
    await abrir(page);

    // Resuelto a mano sobre el catálogo servido: 1411 es uno de los 117 códigos de la
    // CNAE-2009 (de 629) que NO tienen clase homónima en la CNAE-2025 — no existe ninguna
    // clase 14.11 vigente. Su correspondencia oficial del INE es correspondencia['1411']
    // = ['14.24'], y la inversa correspondenciaInversa['1424'] = ['1411','1420'], de donde
    // sale la nota «En la CNAE-2009 esto correspondía a 1411, 1420».
    // Escrito con punto —como figura en escrituras y en la publicación del INE— el código
    // no puede tratarse como vigente: no hay nada vigente con ese número.
    await buscarCnae(page, '14.11');
    await expect(contador(page)).toHaveText(/^1 resultado/);
    await expect(avisoAntiguo(page)).toContainText('1411');
    await expect(avisoAntiguo(page)).toContainText('existe en la CNAE-2009');
    await expect(avisoAntiguo(page)).toContainText('Desde el 01/01/2026');
    // Sin homónima vigente, el aviso NO puede insinuar que el número siga significando algo.
    await expect(avisoAntiguo(page)).not.toContainText('conserva el mismo número');
    await expect(avisoAntiguo(page)).not.toContainText('clase VIGENTE distinta');
    await expect(fichas(page)).toHaveCount(1);
    await expect(fichas(page).first()).toContainText('14.24');
    await expect(fichas(page).first()).toContainText(
      'Confección de prendas de vestir de cuero y peletería',
    );
    await expect(fichas(page).first()).toContainText('En la CNAE-2009 esto correspondía a 1411, 1420.');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Reparados el 30/08/2026 (Inspector, ronda 8, hallazgos 522-525). Estaban con
// `test.fail()`; ahora sujetan la reparación como regresión.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — hallazgos reparados del 30/08/2026', () => {
  test('522 — «deporte» conserva la Sección 3ª, que ya se veía antes de la reparación del 480', async ({ page }) => {
    await abrir(page);

    // Efecto colateral de `conRepresentacionDeSeccion` (la reparación del hallazgo 480).
    // Orden natural de «deporte» (19 resultados, resuelto a mano sobre el catálogo):
    // nueve epígrafes y grupos de la Sección 1ª y, en la POSICIÓN 10, la agrupación
    // 3ª/04 «Actividades relacionadas con el deporte» —la sección artística, que SÍ
    // practica retención de IRPF (SECCIONES_IAE, retencionIrpf = true)—. La Sección 2ª
    // aparece por primera vez en la posición 18 (grupo 826).
    //
    // La función mira qué secciones faltan en el prefijo de 10, encuentra que falta la
    // 2ª, y para hacerle sitio recorta el prefijo a `limite - faltantes` = 9 entradas…
    // que es justo donde estaba la ÚNICA representante de la 3ª. Resultado: la app
    // expulsa una sección que ya estaba visible para meter otra, y el usuario que busca
    // «deporte» ve hoy MENOS secciones que antes de la reparación. Es el único caso en
    // un barrido de las 1.905 palabras de los títulos del IAE, pero es la palabra natural
    // con la que un deportista profesional buscaría su epígrafe.
    await buscarIae(page, 'deporte');
    await expect(contador(page)).toContainText('19 resultados');
    await expect(fichas(page).filter({ hasText: 'Actividades relacionadas con el deporte' })).toHaveCount(1);
    await expect(fichas(page).filter({ hasText: 'Sección 3ª' }).first()).toBeVisible();
  });

  test('523 — el contador ya no dice «los 10 primeros» cuando el reajuste de sección cambia el corte', async ({
    page,
  }) => {
    await abrir(page);

    // Segunda cara de la misma reparación. Con «enseñanza», lo visible son las nueve
    // primeras del orden natural MÁS la nº 15; con «deporte», nueve más la nº 18. El
    // contador sigue afirmando que son «los 10 primeros», que es literalmente falso, y
    // encima esconde lo único que el usuario necesitaría saber para fiarse del orden:
    // que la última tarjeta está ahí por su sección, no por su relevancia.
    await buscarIae(page, 'enseñanza');
    await expect(contador(page)).toContainText('19 resultados');
    await expect(contador(page)).not.toContainText('los 10 primeros');
  });

  test('524 — «food truck» ya devuelve la clase «Puestos de comidas»', async ({
    page,
  }) => {
    await abrir(page);

    // El catálogo servido coloca el sinónimo «food truck» en 47.11 «Comercio al por menor
    // no especializado con predominio de productos alimenticios, bebidas y tabaco», que es
    // la clase del supermercado y el colmado (División 47, Comercio al por menor).
    // La CNAE-2025 tiene una clase que describe exactamente esa actividad: 56.12 «Puestos
    // de comidas», dentro del Grupo 56.1 «Restaurantes y puestos de comidas» (División 56,
    // Servicios de comidas y bebidas) — el sitio donde el propio INE encuadra la venta de
    // comida preparada para consumo inmediato. Hoy 56.12 solo tiene el sinónimo «comidas»,
    // así que un food truck no la alcanza escribiendo cómo describe su trabajo, que es la
    // promesa del panel.
    await buscarCnae(page, 'food truck');
    await expect(fichas(page).first()).toContainText('56.12');
    await expect(fichas(page).first()).toContainText('Puestos de comidas');
  });

  test('525 — «chapuzas», «manitas» y «reformista» ya no aterrizan en Ingeniería civil', async ({ page }) => {
    await abrir(page);

    // Mismo mecanismo, otro bloque de términos. El catálogo pone «chapuzas», «maestro de
    // obra», «manitas», «obrero», «pequeñas obras», «reformas» y «reformista» en 42.99
    // «Construcción de otros proyectos de ingeniería civil n.c.o.p.», que cuelga de la
    // División 42 «Ingeniería civil» — carreteras, vías férreas, puentes, túneles, redes y
    // obras hidráulicas. Una reforma de vivienda no es ingeniería civil: la CNAE-2025 la
    // encuadra en la División 43 «Actividades de construcción especializada», donde están
    // 43.91 «Actividades de mampostería y albañilería» y la residual 43.99 «Otras
    // actividades de construcción especializada n.c.o.p.», que hoy no tiene ni un sinónimo.
    // La CNAE no cambia la factura, pero es el código del alta en la Seguridad Social.
    await buscarCnae(page, 'chapuzas');
    await expect(fichas(page).first()).not.toContainText('42.99');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/09/2026 — los tres casos con los que se volvió a verificar la app
// (uno normal, uno en el límite y uno que debe rechazarse), resueltos A MANO sobre el
// catálogo servido ANTES de abrir el navegador.
//
// De dónde sale cada valor esperado (nunca de lo que devolvió la app):
//   · `public/datos/cnae-iae-catalogo.json`, generado desde el RD 10/2025 del INE
//     (clases de la CNAE-2025, correspondencia oficial CNAE-2009 → CNAE-2025 y su
//     inversa) y desde el RD Legislativo 1175/1990 (Tarifas del IAE, texto consolidado
//     del BOE). Son las dos fuentes que la propia app declara en `meta.cnae.fuente` y
//     `meta.iae.fuente`, y que `data/fiscal/cnae-iae.ts` sella con su contrato de
//     vigilancia (FISCAL_CNAE_IAE_META).
//   · El ORDEN se dedujo de la lógica documentada en `app/conversor-cnae-iae/page.tsx`
//     (PESO_NIVEL_CNAE / PESO_TIPO_IAE, luego relevancia, luego localeCompare del
//     código), no de lo que se veía en pantalla.
//   · Los textos de retención por sección salen de SECCIONES_IAE, importado arriba.
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — re-verificación del 02/09/2026', () => {
  test('CASO 1 (normal) — «peluquería» localiza la misma actividad en los DOS catálogos, cada uno por su lado', async ({
    page,
  }) => {
    await abrir(page);

    // ── CNAE-2025. Resuelto a mano sobre el catálogo: «peluqueria» aparece en tres
    //    entradas. Primero las clases (PESO_NIVEL_CNAE) y, entre ellas, manda la
    //    relevancia: 96.21 lleva el término en el TÍTULO (relevancia 2, «peluquerias y
    //    barberias» empieza por la consulta) y 96.99 solo en un sinónimo, «peluquería
    //    canina» (relevancia 3, palabra completa). El grupo 96.2 cierra la lista.
    //    Jerarquía del catálogo: sección T «OTROS SERVICIOS» → división 96 «Servicios
    //    personales» → grupo 96.2. Y correspondenciaInversa['9621'] = ['96.02'], de donde
    //    sale la nota de equivalencia con la clasificación anterior.
    await buscarCnae(page, 'peluquería');
    await expect(contador(page)).toHaveText(/^3 resultados/);
    await expect(fichas(page)).toHaveCount(3);

    const clase = fichas(page).first();
    await expect(clase).toContainText('96.21');
    await expect(clase).toContainText('Peluquerías y barberías');
    await expect(clase).toContainText('Clase');
    await expect(clase).toContainText('Sección T: OTROS SERVICIOS');
    await expect(clase).toContainText('División 96: Servicios personales');
    await expect(clase).toContainText(
      'Grupo 96.2: Peluquería, tratamientos de belleza, spas y actividades similares',
    );
    await expect(clase).toContainText('En la CNAE-2009 esto correspondía a 9602.');
    await expect(fichas(page).nth(1)).toContainText('96.99');
    await expect(fichas(page).nth(2)).toContainText('96.2');
    await expect(fichas(page).nth(2)).toContainText('Grupo');

    // ── Tarifas del IAE, búsqueda INDEPENDIENTE: la app no traslada el CNAE al IAE, y esa
    //    es su tesis. RD Leg. 1175/1990, Sección 1ª, División 9 «OTROS SERVICIOS»,
    //    Agrupación 97 «Servicios personales», Grupo 972 «Salones de peluquería e
    //    institutos de belleza», Epígrafe 972.1 «Servicios de peluquería de señora y
    //    caballero» — el código que se declara en el modelo 036/037.
    await buscarIae(page, 'peluquería');
    await expect(contador(page)).toHaveText(/^3 resultados/);
    const epigrafe = fichas(page).first();
    await expect(epigrafe).toContainText('972.1');
    await expect(epigrafe).toContainText('Servicios de peluquería de señora y caballero');
    await expect(epigrafe).toContainText('Sección 1ª');
    await expect(epigrafe).toContainText('Grupo 972: Salones de peluquería e institutos de belleza');
    // Peluquería con local es actividad EMPRESARIAL: sin retención de IRPF en factura.
    await expect(epigrafe).toContainText(SECCION_1.retencion);
    expect(SECCION_1.retencionIrpf).toBe(false);
  });

  test('CASO 2 (límite) — «4711», código antiguo que se reparte en dos clases y además conserva su número', async ({
    page,
  }) => {
    await abrir(page);

    // El caso más ambiguo que admite el dato: 4711 es a la vez (a) código de la CNAE-2009
    // con correspondencia MÚLTIPLE —correspondencia['4711'] = ['47.11','47.91']— y (b) un
    // número que sigue existiendo como clase VIGENTE de la CNAE-2025. Como 47.11 figura en
    // su propia correspondencia, el aviso debe decir que conserva el número, no que sea
    // «otra clase» (esa rama es la de los 26 códigos tipo 2530, probada más arriba).
    await buscarCnae(page, '4711');
    await expect(avisoAntiguo(page)).toContainText('4711');
    await expect(avisoAntiguo(page)).toContainText('existe en la CNAE-2009');
    await expect(avisoAntiguo(page)).toContainText('Desde el 01/01/2026');
    await expect(avisoAntiguo(page)).toContainText('entre ellas 47.11');
    await expect(avisoAntiguo(page)).toContainText(
      'que conserva el mismo número en la clasificación nueva',
    );
    await expect(avisoAntiguo(page)).not.toContainText('clase VIGENTE distinta');

    // Las DOS clases de la correspondencia oficial, y solo esas dos: quedarse con una
    // sería elegir por quien se da de alta.
    await expect(contador(page)).toHaveText(/^2 resultados/);
    await expect(fichas(page)).toHaveCount(2);
    await expect(fichas(page).nth(0)).toContainText('47.11');
    await expect(fichas(page).nth(0)).toContainText(
      'Comercio al por menor no especializado con predominio de productos alimenticios, bebidas y tabaco',
    );
    await expect(fichas(page).nth(1)).toContainText('47.91');
    await expect(fichas(page).nth(1)).toContainText(
      'Actividades de servicios de intermediación para el comercio al por menor no especializado',
    );

    // La equivalencia INVERSA de cada una, tal cual la trae el catálogo:
    //   correspondenciaInversa['4711'] = 47.11, 47.81, 47.91, 47.99
    //   correspondenciaInversa['4791'] = 47.11, 47.19, 47.79, 47.91, 47.99, 82.99
    await expect(fichas(page).nth(0)).toContainText(
      'En la CNAE-2009 esto correspondía a 4711, 4781, 4791, 4799.',
    );
    await expect(fichas(page).nth(1)).toContainText(
      'En la CNAE-2009 esto correspondía a 4711, 4719, 4779, 4791, 4799, 8299.',
    );
  });

  test('CASO 3 (debe rechazarse) — «9999» no existe en ninguna de las dos clasificaciones', async ({
    page,
  }) => {
    await abrir(page);

    // 9999 no es clave de `correspondencia` (los 629 códigos de la CNAE-2009 del catálogo)
    // ni prefijo de ninguna clase de la CNAE-2025: la única división que empieza por 99 es
    // la 99 «Organismos extraterritoriales», sección V. Lo correcto es cero resultados y,
    // sobre todo, NINGÚN aviso que lo presente como código de la clasificación anterior:
    // en una app de nivel 1 crítico, inventar una equivalencia es peor que no dar ninguna.
    await buscarCnae(page, '9999');
    await expect(contador(page)).toHaveText(/^0 resultados/);
    await expect(fichas(page)).toHaveCount(0);
    await expect(avisoAntiguo(page)).toHaveCount(0);
    await expect(page.locator('[class*="sinResultados"]').first()).toContainText(
      'No hay ninguna entrada que encaje con lo que has escrito.',
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cinco hallazgos de la re-inspección del 02/09/2026 (585-589),
// REPARADOS ese mismo día.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 02/09/2026, reparados', () => {
  // 585 — el faqJsonLd escribía a mano los tipos de retención y el umbral de exención,
  // teniéndolos en data/fiscal. Es el texto que citan los asistentes de IA.
  test('585 — el FAQPage deriva la retención y el umbral de data/fiscal', async ({ page }) => {
    await abrir(page);
    const textos: string[] = await page.evaluate(() => {
      const salida: string[] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}');
        const grafo = datos['@graph'] ?? [datos];
        for (const nodo of grafo) {
          if (nodo['@type'] !== 'FAQPage') continue;
          for (const q of nodo.mainEntity ?? []) salida.push(q.acceptedAnswer.text);
        }
      }
      return salida;
    });
    expect(textos.length).toBeGreaterThan(0);
    const todo = textos.join(' · ');

    // Los valores publicados son EXACTAMENTE los del módulo, no una copia que pueda divergir.
    expect(todo).toContain(`${SECCION_2.tipoRetencion} %`);
    expect(todo).toContain(`${SECCION_2.tipoRetencionInicio} %`);
    // Y el umbral se publica con su cifra, en formato español, no como «un millón de euros».
    expect(todo).toContain('1.000.000 €');
    expect(todo).not.toContain('un millón de euros');
  });

  // 586 — la tabla y la FAQ transcribían las normas pudiendo leerlas de CNAE_VIGENCIA.
  test('586 — las normas de referencia salen de CNAE_VIGENCIA', async ({ page }) => {
    await abrir(page);
    const tabla = page.getByText('Norma de referencia').locator('xpath=../..');
    const texto = (await tabla.innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain(CNAE_VIGENCIA.normaVigente);
    expect(texto).toContain(CNAE_VIGENCIA.normaAnterior);
  });

  // 587 — el prop `normativa` repetía el prefijo que ya traía `fuente`: en pantalla se leía
  // «CNAE-2025 — CNAE-2025 — RD 10/2025 (INE)».
  test('587 — el sello de datos no repite el nombre del catálogo', async ({ page }) => {
    await abrir(page);
    const sellos = page.locator('[class*="dataReference"], [class*="DataReference"]');
    const primero = (await sellos.first().innerText()).replace(/\s+/g, ' ');
    expect(primero).not.toContain('CNAE-2025 — CNAE-2025');
    expect(primero).toContain('CNAE-2025');
  });

  // 588 — el mismo catálogo publicaba dos fechas distintas según la página: la app leía el
  // `generado` del JSON servido y la ficha de Delegum el `verificado` del módulo. Ahora las
  // dos leen del módulo, así que no pueden volver a divergir.
  test('588 — la fecha de verificación sale del módulo, la misma que ve Delegum', async ({ page }) => {
    await abrir(page);
    const sellos = await page.locator('[class*="dataReference"], [class*="DataReference"]').allInnerTexts();
    const [anio, mes, dia] = FISCAL_CNAE_IAE_META.verificado.split('-');
    const esperada = `${dia}/${mes}/${anio}`;
    expect(sellos.join(' ')).toContain(esperada);
  });

  // 589 — los 22 filtros de sección CNAE tenían como nombre accesible una sola letra: el
  // título completo iba en `title=`, que no forma el nombre accesible ni existe en táctil.
  test('589 — los filtros de sección CNAE tienen nombre accesible completo', async ({ page }) => {
    await abrir(page);
    const filtroA = page.getByRole('button', { name: /^Sección A · / });
    await expect(filtroA).toHaveCount(1);
    // Y el nombre ya no es la letra suelta.
    await expect(page.getByRole('button', { name: 'A', exact: true })).toHaveCount(0);
  });
});

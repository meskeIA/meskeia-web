import { test, expect, type Page } from '@playwright/test';

/**
 * Buscador de códigos CNAE-2025 y epígrafes del IAE — Inspector, 20/08/2026
 * Segmento FISCAL, riesgo 1 CRÍTICO. Primera inspección de esta app.
 *
 * POR QUÉ ESTA APP ES DELICADA
 *   No existe ninguna tabla oficial de correspondencia CNAE ⇄ IAE: el INE publica la
 *   CNAE y el RD Legislativo 1175/1990 las Tarifas del IAE, pero el puente entre ambas
 *   es una construcción de quien la publica, no un dato. La pregunta central de la
 *   inspección era si la app promete una conversión que no puede dar. NO lo hace: se
 *   llama «conversor» solo en el slug (captura SEO documentada en metadata.ts) y en la
 *   página es un buscador dual que niega la conversión en un <h2> no colapsable, en el
 *   DisclaimerCard crítico, en la FAQ visible y en el FAQPage del JSON-LD. Eso queda
 *   fijado por el bloque «REGRESIÓN — lo que la app promete» y no debe romperse.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (nunca de lo que devuelve la app)
 *   · Estructura y literales del IAE — RD Legislativo 1175/1990, Tarifas e Instrucción
 *     (texto consolidado, https://www.boe.es/buscar/act.php?id=BOE-A-1990-23930), que es
 *     la fuente que la propia app declara en `public/datos/cnae-iae-catalogo.json`
 *     (meta.iae.fuente) y en `data/fiscal/cnae-iae.ts` (FISCAL_CNAE_IAE_META.iae).
 *   · Clases de la CNAE-2025 y correspondencia CNAE-2009 → CNAE-2025 — RD 10/2025 (INE),
 *     misma fuente declarada (meta.cnae.fuente). El catálogo servido lleva 1.060 entradas
 *     de CNAE, 1.431 de IAE y 629 correspondencias, generado el 20/07/2026.
 *   · Textos de retención por sección — SECCIONES_IAE de `data/fiscal/cnae-iae.ts`
 *     (15 % general y 7 % el año de inicio y los dos siguientes, para 2ª y 3ª).
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
  await expect(cafe).toContainText(
    'Las facturas de una actividad empresarial, con carácter general, no llevan retención de IRPF.',
  );

  // ── Por texto (el buscador tiene que encontrar sin que se sepa el código).
  //    RD Leg. 1175/1990, Sección 1ª, División 9 «OTROS SERVICIOS», Agrupación 97
  //    «Servicios personales», Grupo 972 «Salones de peluquería e institutos de belleza»,
  //    Epígrafe 972.1 «Servicios de peluquería de señora y caballero».
  await buscarIae(page, 'peluquería');
  await expect(contador(page)).toHaveText(/^2 resultados/);
  await expect(fichas(page).first()).toContainText('972.1');
  await expect(fichas(page).first()).toContainText('Servicios de peluquería de señora y caballero');
  await expect(fichas(page).first()).toContainText('Agrupación 97: Servicios personales');
  await expect(fichas(page).nth(1)).toContainText('972');
  await expect(fichas(page).nth(1)).toContainText('Salones de peluquería e institutos de belleza');

  // ── El buscador tolera acentos: «peluqueria» sin tilde da lo mismo.
  await buscarIae(page, 'peluqueria');
  await expect(contador(page)).toHaveText(/^2 resultados/);

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
  await expect(avisoAntiguo(page)).toContainText('es un código de la CNAE-2009');
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
  await expect(abogado).toContainText(
    'Las facturas a empresas y a otros profesionales llevan retención de IRPF: 15 % con carácter general y 7 % durante el año de inicio de la actividad y los dos siguientes.',
  );

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
  await expect(actor).toContainText(
    'Tratamiento análogo al profesional: las facturas a empresas y a otros profesionales llevan retención de IRPF.',
  );
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
  await expect(page.getByText('RD 10/2025', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('RD Legislativo 1175/1990', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('20/7/2026', { exact: false }).first()).toBeVisible();

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
// HALLAZGOS ABIERTOS (20/08/2026) — quitar el test.fail() al repararlos
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Buscador CNAE-IAE — hallazgos abiertos', () => {
  test('un código de 4 dígitos que TAMBIÉN es una clase vigente se lee solo como CNAE-2009', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await abrir(page);

    // 25.30 es una clase VIGENTE de la CNAE-2025 en el propio catálogo de la app:
    // «Fabricación de armas y municiones». Pero 2530 es también un código de la
    // CNAE-2009, así que la app lo interpreta siempre como antiguo y muestra solo
    // 25.21 «Fabricación de radiadores, generadores de vapor y calderas para
    // calefacción central», bajo un aviso que afirma que 2530 es de la CNAE-2009.
    // Quien tenga hoy el 25.30 se lleva la clase de otra actividad. Son 26 códigos
    // de cuatro dígitos en esta situación (2530, 2540, 3512, 3513, 3514, 1629…).
    await buscarCnae(page, '2530');
    await expect(fichas(page).filter({ hasText: '25.30' })).toHaveCount(1);
    await expect(page.getByText('Fabricación de armas y municiones')).toBeVisible();
  });

  test('una correspondencia oficial de 32 clases se corta en 10 y pide «afinar» lo que no se puede afinar', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await abrir(page);

    // 4791 (CNAE-2009, «comercio al por menor por correspondencia o Internet») es el
    // código del comercio electrónico, de los más frecuentes en altas recientes. La
    // tabla del INE lo reparte entre 32 clases de la CNAE-2025; la app anuncia las 32
    // y enseña 10, con el consejo «afina la búsqueda para ver el resto». Con un código
    // no hay nada que afinar: tocar los cuatro dígitos rompe la detección, y el filtro
    // por sección deja 31 de las 32 en la sección G. Las 22 restantes —entre ellas
    // 47.92 y 60.39— son inalcanzables. Le pasa igual a 4789 (17), 4799 (30) y 8299 (24).
    await buscarCnae(page, '4791');
    await expect(contador(page)).toContainText('32 resultados');
    await expect(fichas(page)).toHaveCount(32);
  });

  test('la búsqueda por texto no baja a los epígrafes: «restaurante» no devuelve ninguno', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await abrir(page);

    // El texto indexado es solo el del propio código, no el de sus padres. Los epígrafes
    // del Grupo 671 se llaman «De cinco tenedores»… «De un tenedor» (RD Leg. 1175/1990),
    // así que buscar «restaurante» devuelve tres resultados —grupos 671 y 674 y la
    // división 6— y ningún epígrafe, que es justamente lo que se declara en el modelo
    // 036/037. Solo aparecen tecleando «671», y nada lo indica. Hay 40 epígrafes con
    // título dependiente de su padre en la misma situación.
    await buscarIae(page, 'restaurante');
    await expect(fichas(page).filter({ hasText: 'De dos tenedores' })).toHaveCount(1);
  });

  test('la coincidencia por subcadena manda un epígrafe ajeno por delante del correcto', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await abrir(page);

    // «actores» está contenido en «tr-actores». Como el orden pone primero los epígrafes
    // (peso de tipo) y solo después la relevancia, el primer resultado de buscar
    // «actores» es 321.2 «Construcción de tractores agrícolas», Sección 1ª y sin
    // retención, por delante del 013 «Actores de cine y teatro», Sección 3ª y con
    // retención. En una app donde la sección decide la retención de IRPF, el orden no
    // es cosmético.
    await buscarIae(page, 'actores');
    await expect(fichas(page).first()).toContainText('Actores de cine y teatro');
  });

  test('«médico» deja al médico por detrás de siete resultados empresariales', async ({ page }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await abrir(page);

    // Mismo mecanismo que el anterior. Buscar «médico» devuelve 9 resultados: los siete
    // primeros son de la Sección 1ª (fabricación y comercio de material médico), y los
    // grupos 831 «Médicos de Medicina General» y 832 «Médicos Especialistas», Sección 2ª,
    // quedan octavo y noveno.
    await buscarIae(page, 'médico');
    await expect(fichas(page).first()).toContainText('Médicos de Medicina General');
  });

  test('el <h1> y el <title> llaman «oficial» a la herramienta, no a los catálogos', async ({
    page,
  }) => {
    test.fail(); // hallazgo abierto: quitar esta línea el día que se repare
    await abrir(page);

    // La app es escrupulosa con lo que importa —niega la conversión CNAE→IAE cuatro
    // veces— pero se presenta como «buscador oficial» en el <h1>, en el <title>, en el
    // OpenGraph y en el de Twitter. Oficiales son los catálogos que reproduce (INE y
    // BOE); el buscador es de meskeIA. En una página cuya tesis es «desconfía de las
    // equivalencias no oficiales», llamarse oficial es la ambigüedad que el usuario no
    // puede resolver. El JSON-LD, en cambio, ya la nombra bien: «Buscador de códigos
    // CNAE-2025 y epígrafes del IAE», sin «oficial».
    await expect(page.locator('h1')).not.toContainText('buscador oficial');
    expect(await page.title()).not.toContain('buscador oficial');
  });
});

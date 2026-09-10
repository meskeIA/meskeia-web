import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — contador-silabas (segmento interactiva con motor lingüístico)
 *
 * QUINTA INSPECCIÓN: 10/09/2026, RE-INSPECCIÓN tras el refactor de motores del 10/09. Sus
 * tres casos y sus SEIS hallazgos, al final del fichero, en su propio bloque. El silabeador
 * y la escansión salieron intactos; cinco de los seis hallazgos son material DIDÁCTICO que
 * contradice al motor, y el sexto es el extractor de palabras ante la diéresis poética.
 * CUARTA INSPECCIÓN: 07/09/2026, RE-INSPECCIÓN tras las reparaciones del 02/09. Sus casos y
 * sus CINCO hallazgos (659-663), al final del fichero, en su propio bloque. Los cinco se
 * REPARARON el 09/09/2026 y quedan ahí como regresión, sin test.fail().
 * TERCERA INSPECCIÓN: 02/09/2026 (segmento cálculo, riesgo 3). Sus tres casos, resueltos a
 * mano antes de abrir el navegador, están al final del fichero, en su propio bloque.
 * SEGUNDA INSPECCIÓN: 24/08/2026, sobre el silabeador REESCRITO ese mismo día.
 * (Primera inspección: 24/08/2026, ocho hallazgos, los ocho reparados.)
 *
 * La app promete en su <h1> «Contador de Sílabas», en su subtítulo «Separa y cuenta las
 * sílabas de cualquier texto en español» y en su metadata «métrica de versos», sinalefas,
 * acentuación final, rima y estrofa. Todo eso tiene verdad comprobable: diptongo, hiato,
 * triptongo, grupos consonánticos y escansión son deterministas (RAE, Ortografía de la
 * lengua española, 2010, cap. I; y la métrica clásica para el verso).
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/contador-silabas/silabeo.ts  → separarSilabas() y encuentrosVocalicos()
 *                                      (núcleos vocálicos primero, reparto de consonantes
 *                                      después). Tests unitarios en tests/silabeo.spec.ts
 *   app/contador-silabas/metrica.ts  → analizarVerso(): fonéticas − sinalefas + ajuste final
 *   app/contador-silabas/rima.ts     → esquema de rima y reconocimiento de estrofa
 *   app/contador-silabas/page.tsx    → solo pinta; no calcula nada por su cuenta
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — «murciélago comunicación aeropuerto» → 14 sílabas, 3 palabras, 4,7
 *       mur-cié-la-go (4): r+c no forman grupo inseparable, así que se reparten una a cada
 *           lado; «ié» es diptongo porque la tilde va sobre la vocal FUERTE, y la tilde solo
 *           rompe el diptongo cuando cae sobre i/u.
 *       co-mu-ni-ca-ción (5): consonante simple entre vocales → siempre a la derecha; «ió»
 *           diptongo (débil átona + fuerte tónica).
 *       a-e-ro-puer-to (5): «ae» son dos abiertas → hiato; «ue» es diptongo.
 *       Media 14/3 = 4,66… → 4,7, con COMA decimal (formato español).
 *
 *   CASO 2 (límite) — dígrafos, h intercalada, grupos de 3+ consonantes y un verso entero
 *       a-quí        la «u» de «qu» es un signo ortográfico, no una vocal
 *       lin-güís-ti-ca  la diéresis dice que la ü SÍ suena; ü+í son dos cerradas → diptongo
 *       ahu-mar / de-sahu-cio  la h entre vocales NO impide el diptongo (OLE 2010)
 *       bú-ho        pero la tilde sobre la débil sí crea hiato de verdad, h o no h
 *       abs-trac-to / cons-truir / pers-pec-ti-va  de un grupo de tres o más consonantes,
 *                    a la sílaba siguiente solo pasa lo que puede ABRIR sílaba en español
 *       «Ya no quiero estar aquí» → 8 fonéticas − 1 sinalefa («quiero_estar») + 1 (aguda
 *                    final) = 8, octosílabo.
 *
 *   CASO 3 (rechazo) — «12345 €€€ --- 3,14» y la entrada en blanco
 *       El extractor es /[a-záéíóúüñ]+/gi: cifras y símbolos no aportan NINGUNA palabra.
 *       Esperado: aviso explícito de que no hay nada que analizar, sin ceros ni medias NaN.
 *       Con el campo vacío o solo con espacios, analizar() sale por `if (!texto.trim())` y
 *       la app se queda en el marcador de posición, sin inventarse un resultado.
 *
 * HALLAZGOS: al final del fichero, los de las cuatro inspecciones, todos REPARADOS y como
 * regresión. Los seis de la segunda tanda (257-262) se cerraron el 24/08/2026 quitándoles
 * el test.fail() con el que se documentaron, tras comprobar uno a uno que lo que afirmaban
 * seguía siendo correcto — que es la regla que dejó la ronda 1: un test.fail() que pasa a
 * verde no prueba nada hasta verificar su contenido.
 *
 * Cuatro de ellos son del motor de escansión, que además tiene sus propios tests unitarios
 * sobre poemas enteros de métrica conocida en `tests/metrica-verso.spec.ts`.
 */

const RUTA = '/contador-silabas/';

/**
 * La app es un client component: el HTML llega con los botones pintados pero SIN manejador,
 * así que un clic anterior a la hidratación se pierde sin dejar rastro. Se usa el botón de
 * ejemplo como testigo: cuando consigue rellenar el textarea, React ya está escuchando.
 */
async function esperarHidratacion(page: Page): Promise<void> {
  const ejemplo = page.getByRole('button', { name: 'Cargar ejemplo: murciélago' });
  await expect(async () => {
    await ejemplo.click({ force: true });
    await expect(page.locator('textarea')).toHaveValue('murciélago', { timeout: 500 });
  }).toPass({ timeout: 20000 });
}

async function analizar(page: Page, texto: string): Promise<void> {
  await page.fill('textarea', '');
  await page.fill('textarea', texto);
  await page.getByRole('button', { name: 'Analizar Sílabas' }).click();
}

/** Las sílabas pintadas de la palabra n-ésima del bloque «Análisis detallado» */
const silabasDe = (page: Page, indice = 0) =>
  page.locator('[class*="palabraCard"]').nth(indice).locator('[class*="palabraSilabas"] > span');

/** El «N sílabas» de la palabra n-ésima */
const totalDe = (page: Page, indice = 0) =>
  page.locator('[class*="palabraCard"]').nth(indice).locator('[class*="palabraTotal"]');

/** Sílabas métricas del verso n-ésimo (el número grande del bloque «Métrica del verso») */
const metricasDe = (page: Page, indice = 0) =>
  page.locator('[class*="versoCard"]').nth(indice).locator('[class*="versoSilabas"]');

const nombreDe = (page: Page, indice = 0) =>
  page.locator('[class*="versoCard"]').nth(indice).locator('[class*="versoNombre"]');

const desgloseDe = (page: Page, indice = 0) =>
  page.locator('[class*="versoCard"]').nth(indice).locator('[class*="versoDesglose"]');

/** Los lazos de sinalefa pintados en el verso n-esimo (anadido en la inspeccion del 07/09/2026) */
const sinalefasDe = (page: Page, indice = 0) =>
  page.locator('[class*="versoCard"]').nth(indice).locator('[class*="sinalefaTag"]');

/**
 * Las preguntas y respuestas del FAQPage que la app inyecta como JSON-LD (layout.tsx). Es lo
 * que leen los buscadores y los asistentes de IA, y puede divergir del texto visible de la
 * pagina: por eso se lee del <script>, no del DOM. Anadido en la inspeccion del 07/09/2026.
 */
async function leerFaqJsonLd(page: Page): Promise<{ pregunta: string; respuesta: string }[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const bruto of bloques) {
    const datos = JSON.parse(bruto) as {
      '@type': string;
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    };
    if (datos['@type'] === 'FAQPage' && datos.mainEntity) {
      return datos.mainEntity.map((q) => ({ pregunta: q.name, respuesta: q.acceptedAnswer.text }));
    }
  }
  return [];
}

test.describe('contador-silabas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page);
  });

  test('CASO 1 (normal) · tres palabras corrientes y la media en formato español', async ({
    page,
  }) => {
    await analizar(page, 'murciélago comunicación aeropuerto');

    // mur|c: dos consonantes que NO forman grupo inseparable se reparten una a cada lado.
    // «ié»: diptongo — la tilde sobre vocal FUERTE no rompe nada.
    await expect(silabasDe(page, 0)).toHaveText(['mur', 'cié', 'la', 'go']);
    // Consonante simple entre vocales → siempre con la sílaba siguiente. «ió», diptongo.
    await expect(silabasDe(page, 1)).toHaveText(['co', 'mu', 'ni', 'ca', 'ción']);
    // «ae» son dos vocales abiertas → hiato; «ue» es diptongo.
    await expect(silabasDe(page, 2)).toHaveText(['a', 'e', 'ro', 'puer', 'to']);
    await expect(totalDe(page, 0)).toHaveText('4 sílabas');

    // 4 + 5 + 5 = 14 sílabas en 3 palabras; media 4,66… → 4,7 con COMA decimal.
    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('14');
    await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('3');
    await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('4,7');
  });

  test('CASO 2 (límite) · dígrafos, h intercalada, grupos de 3+ consonantes y un verso', async ({
    page,
  }) => {
    await analizar(
      page,
      'aquí lingüística ahumar desahucio búho abstracto construir perspectiva'
    );

    // La «u» de «qu» es un signo ortográfico y no suena: no puede ser el núcleo de nada,
    // ni disparar la regla del hiato contra la «í» tildada.
    await expect(silabasDe(page, 0)).toHaveText(['a', 'quí']);
    // Con diéresis la ü SÍ suena. ü+í son dos vocales CERRADAS y forman diptongo a efectos
    // ortográficos aunque una lleve tilde (RAE).
    await expect(silabasDe(page, 1)).toHaveText(['lin', 'güís', 'ti', 'ca']);
    // OLE 2010: «las vocales separadas gráficamente por una h forman diptongo o triptongo si
    // su pronunciación así lo determina» → ahu-mar, de-sahu-cio.
    await expect(silabasDe(page, 2)).toHaveText(['ahu', 'mar']);
    await expect(silabasDe(page, 3)).toHaveText(['de', 'sahu', 'cio']);
    // Y el caso simétrico: con tilde sobre la débil hay hiato de verdad, con h o sin ella.
    await expect(silabasDe(page, 4)).toHaveText(['bú', 'ho']);
    // De un grupo de tres o más consonantes, a la derecha solo pasa lo que puede ABRIR
    // sílaba en español: «tr» sí (oclusiva + líquida), «bs», «ns» y «rsp» no.
    await expect(silabasDe(page, 5)).toHaveText(['abs', 'trac', 'to']);
    await expect(silabasDe(page, 6)).toHaveText(['cons', 'truir']);
    await expect(silabasDe(page, 7)).toHaveText(['pers', 'pec', 'ti', 'va']);

    // Verso completo: Ya(1) no(1) quie-ro(2) es-tar(2) a-quí(2) = 8 fonéticas ·
    // sinalefa «quiero_estar» → −1 · «aquí» aguda → +1 · total 8, octosílabo de manual.
    await analizar(page, 'Ya no quiero estar aquí');
    await expect(metricasDe(page)).toHaveText('8');
    await expect(nombreDe(page)).toContainText('octosílabo');
    await expect(desgloseDe(page)).toContainText('8 fonéticas');
    await expect(desgloseDe(page)).toContainText('1 sinalefa');
    await expect(desgloseDe(page)).toContainText('aguda');
  });

  test('CASO 3 (rechazo) · cifras y símbolos no son palabras; el vacío no calcula nada', async ({
    page,
  }) => {
    await analizar(page, '12345 €€€ --- 3,14');

    // /[a-záéíóúüñ]+/gi no encuentra ninguna palabra. Antes se pintaba el panel con ceros y
    // un «Análisis detallado» vacío, indistinguible de un análisis real (hallazgo 214).
    await expect(page.getByText('No hay ninguna palabra que analizar')).toBeVisible();
    await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);

    // Con el campo solo con espacios no llega a haber resultado: sigue el marcador inicial.
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await analizar(page, '   ');
    await expect(page.getByText('Introduce un texto para analizar sus sílabas')).toBeVisible();
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);
  });

  // ---------------------------------------------------------------------------------------
  // TESTIGOS — lo que la app SÍ hace bien y no debe romperse
  // ---------------------------------------------------------------------------------------

  test('TESTIGO · la tilde sobre i/u rompe el diptongo (hiato acentual)', async ({ page }) => {
    await analizar(page, 'maría país baúl poesía creíais');

    // RAE: la vocal débil TÓNICA con tilde forma siempre hiato con la vocal contigua.
    await expect(silabasDe(page, 0)).toHaveText(['ma', 'rí', 'a']); // ía → hiato
    await expect(silabasDe(page, 1)).toHaveText(['pa', 'ís']); // aí → hiato
    await expect(silabasDe(page, 2)).toHaveText(['ba', 'úl']); // aú → hiato
    // poesía: «oe» son dos abiertas (hiato) e «ía» es hiato acentual → 4 sílabas.
    await expect(silabasDe(page, 3)).toHaveText(['po', 'e', 'sí', 'a']);
    // creíais: la «í» tónica rompe por los dos lados, y «ai» átono sigue siendo diptongo.
    await expect(silabasDe(page, 4)).toHaveText(['cre', 'í', 'ais']);
  });

  test('TESTIGO · diptongos, triptongos, «y» final y dígrafos indivisibles', async ({ page }) => {
    await analizar(page, 'cielo causa viernes Uruguay averiguáis buey carro calle coche muy');

    await expect(silabasDe(page, 0)).toHaveText(['cie', 'lo']); // débil átona + fuerte
    await expect(silabasDe(page, 1)).toHaveText(['cau', 'sa']); // fuerte + débil átona
    await expect(silabasDe(page, 2)).toHaveText(['vier', 'nes']); // ie diptongo · rn se separa
    await expect(silabasDe(page, 3)).toHaveText(['U', 'ru', 'guay']); // uay: triptongo (la y suena /i/)
    await expect(silabasDe(page, 4)).toHaveText(['a', 've', 'ri', 'guáis']); // uái: triptongo
    await expect(silabasDe(page, 5)).toHaveText(['buey']); // monosílabo: triptongo uey
    await expect(silabasDe(page, 6)).toHaveText(['ca', 'rro']); // rr es dígrafo: no se parte
    await expect(silabasDe(page, 7)).toHaveText(['ca', 'lle']); // ll es dígrafo
    await expect(silabasDe(page, 8)).toHaveText(['co', 'che']); // ch es dígrafo
    await expect(silabasDe(page, 9)).toHaveText(['muy']); // u + y = diptongo, monosílabo
  });

  test('TESTIGO · la app separa como enseña su propio bloque educativo', async ({ page }) => {
    // El bloque «Consejos» escribe literalmente: «los grupos bl, br, cl, cr, dr, fl, fr… van
    // juntos: a-brir, o-tros, a-gra-dar, a-fli-gir. En cambio, los que no pueden abrir sílaba
    // se reparten entre las dos: cons-tar, ins-ti-tu-to, obs-tá-cu-lo, pers-pec-ti-va».
    // Hasta la reparación el motor devolvía con-star e in-sti-tu-to: la app se desmentía a sí
    // misma en la misma página (hallazgo 213).
    await analizar(page, 'abrir otros agradar afligir constar instituto obstáculo transporte');

    await expect(silabasDe(page, 0)).toHaveText(['a', 'brir']);
    await expect(silabasDe(page, 1)).toHaveText(['o', 'tros']);
    await expect(silabasDe(page, 2)).toHaveText(['a', 'gra', 'dar']);
    await expect(silabasDe(page, 3)).toHaveText(['a', 'fli', 'gir']);
    await expect(silabasDe(page, 4)).toHaveText(['cons', 'tar']);
    await expect(silabasDe(page, 5)).toHaveText(['ins', 'ti', 'tu', 'to']);
    await expect(silabasDe(page, 6)).toHaveText(['obs', 'tá', 'cu', 'lo']);
    await expect(silabasDe(page, 7)).toHaveText(['trans', 'por', 'te']); // «sp» no abre sílaba
  });

  test('TESTIGO · la h se comporta según lo que separe', async ({ page }) => {
    await analizar(page, 'prohibir cohibir ahuyentar ahora azahar deshacer ahínco huevo');

    await expect(silabasDe(page, 0)).toHaveText(['prohi', 'bir']); // oi diptongo pese a la h
    await expect(silabasDe(page, 1)).toHaveText(['cohi', 'bir']);
    await expect(silabasDe(page, 2)).toHaveText(['ahu', 'yen', 'tar']); // au diptongo
    await expect(silabasDe(page, 3)).toHaveText(['a', 'ho', 'ra']); // a-o: dos abiertas, hiato
    await expect(silabasDe(page, 4)).toHaveText(['a', 'za', 'har']); // a-a: hiato
    await expect(silabasDe(page, 5)).toHaveText(['des', 'ha', 'cer']); // h tras consonante
    await expect(silabasDe(page, 6)).toHaveText(['a', 'hín', 'co']); // í tónica → hiato
    await expect(silabasDe(page, 7)).toHaveText(['hue', 'vo']); // h inicial, ue diptongo
  });

  test('TESTIGO · escansión del endecasílabo, del octosílabo agudo y del alejandrino', async ({
    page,
  }) => {
    // Bécquer. Vol-ve-rán(3) las(1) os-cu-ras(3) go-lon-dri-nas(4) = 11 fonéticas.
    // Ningún contacto vocal-vocal entre palabras → 0 sinalefas. Última palabra llana → ±0.
    await analizar(page, 'Volverán las oscuras golondrinas');
    await expect(metricasDe(page)).toHaveText('11');
    await expect(nombreDe(page)).toContainText('endecasílabo');
    await expect(desgloseDe(page)).toContainText('llana');

    // Calderón. Qué(1) es(1) la(1) vi-da(2) Un(1) fre-ne-sí(3) = 9 fonéticas.
    // Sinalefas «Qué_es» y «vida_Un» (esta última, con pausa) → −2. Aguda final → +1. 9−2+1 = 8.
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await analizar(page, '¿Qué es la vida? Un frenesí');
    await expect(metricasDe(page)).toHaveText('8');
    await expect(desgloseDe(page)).toContainText('2 sinalefas');
    await expect(desgloseDe(page)).toContainText('aguda');

    // Darío. 15 fonéticas − 1 sinalefa («princesa_está») + 0 (llana) = 14.
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await analizar(page, 'La princesa está triste, ¿qué tendrá la princesa?');
    await expect(metricasDe(page)).toHaveText('14');
    await expect(nombreDe(page)).toContainText('alejandrino');
  });

  test('TESTIGO · el ajuste por acento final resta 1 con última palabra esdrújula', async ({
    page,
  }) => {
    // vue-la(2) so-bre(2) el(1) pá-li-do(3) mur-cié-la-go(4) = 12 fonéticas.
    // Sinalefa «sobre_el» → −1. «murciélago» es esdrújula → −1. 12−1−1 = 10.
    await analizar(page, 'vuela sobre el pálido murciélago');
    await expect(metricasDe(page)).toHaveText('10');
    await expect(desgloseDe(page)).toContainText('esdrújula');
  });

  test('TESTIGO · el modo composición mide contra el metro elegido mientras se escribe', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'octosílabo', exact: true }).click();
    await expect(page.getByRole('button', { name: 'octosílabo', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    // El mismo octosílabo del CASO 2, ahora sin pulsar «Analizar»: 8/8, justo.
    await page.fill('textarea', 'Ya no quiero estar aquí');
    await expect(page.locator('[class*="medidorFila"]')).toContainText('8/8');
    await expect(page.locator('[class*="medidorFila"]')).toContainText('justo');
  });

  test('TESTIGO · el metro personalizado mide contra cualquier número de sílabas, no solo los cuatro clásicos', async ({
    page,
  }) => {
    // Añadido el 01/09/2026 (S0108): el modo composición solo ofrecía los cuatro versos
    // clásicos (7/8/11/14), pero la propia app promociona "letras de canciones" como uso, y
    // una frase musical puede necesitar cualquier número de sílabas. Verificado con Playwright
    // antes de comprometer el cambio (PASO 4.bis de /nueva-app-meskeia).
    await page.getByPlaceholder('ej. 6').fill('6');
    await page.getByRole('button', { name: 'Fijar' }).click();

    // El(1) cam-po(2) ver-de(2) = 5 fonéticas, última palabra llana → ±0. Objetivo 6: falta 1.
    await page.fill('textarea', 'El campo verde');
    await expect(page.locator('[class*="medidorFila"]')).toContainText('5/6');
    await expect(page.locator('[class*="medidorFila"]')).toContainText('faltan 1');

    // Puede refijarse a otro valor cualquiera, no solo la primera vez que se pulsa Fijar.
    await page.getByPlaceholder('ej. 6').fill('9');
    await page.getByRole('button', { name: 'Fijar' }).click();
    await expect(page.locator('[class*="medidorFila"]')).toContainText('/9');
  });

  // ---------------------------------------------------------------------------------------
  // REGRESIÓN — los ocho hallazgos de la primera inspección, reparados el 24/08/2026
  //
  // El silabeador se reescribió entero y salió del componente: vive en
  // `app/contador-silabas/silabeo.ts` con tests unitarios que resuelven cada regla a mano
  // (`tests/silabeo.spec.ts`). Lo que sigue comprueba que esas reglas llegan a la PANTALLA.
  // ---------------------------------------------------------------------------------------

  test.describe('regresión de la primera inspección', () => {
    test('207 · «aquí» son 2 sílabas: la u de «qu» no es una vocal', async ({ page }) => {
      // Devolvía a-qu-í (3), con una «sílaba» sin NINGUNA vocal — justo lo que la FAQ de la
      // propia app declara imposible. Igual en química, esquí y lingüística.
      await analizar(page, 'aquí química esquí lingüística');
      await expect(silabasDe(page, 0)).toHaveText(['a', 'quí']);
      await expect(silabasDe(page, 1)).toHaveText(['quí', 'mi', 'ca']);
      await expect(silabasDe(page, 2)).toHaveText(['es', 'quí']);
      await expect(silabasDe(page, 3)).toHaveText(['lin', 'güís', 'ti', 'ca']);
      await expect(totalDe(page, 0)).toHaveText('2 sílabas');
    });

    test('208 · la métrica ya no hereda el error del silabeo', async ({ page }) => {
      // «Ya no quiero estar aquí» salía ENEASÍLABO (9) por culpa de a-qu-í, y «La carne
      // ahumada del invierno», DECASÍLABO (10) por culpa de a-hu-ma-da.
      await analizar(page, 'Ya no quiero estar aquí\nLa carne ahumada del invierno');
      await expect(metricasDe(page, 0)).toHaveText('8');
      await expect(nombreDe(page, 0)).toContainText('octosílabo');
      // 10 fonéticas − 1 sinalefa («carne_ahumada») + 0 (llana) = 9.
      await expect(metricasDe(page, 1)).toHaveText('9');
      await expect(nombreDe(page, 1)).toContainText('eneasílabo');
    });

    test('209 · la h intercalada no rompe el diptongo: «ahumar» son 2 sílabas', async ({
      page,
    }) => {
      // OLE 2010: ahu-mar, sahu-me-rio, prohi-bir, de-sahu-cio. El motor metía la h en su
      // lista de consonantes y cortaba contra ella: una sílaba de más en cada una.
      await analizar(page, 'ahumar desahucio prohibir búho');
      await expect(silabasDe(page, 0)).toHaveText(['ahu', 'mar']);
      await expect(silabasDe(page, 1)).toHaveText(['de', 'sahu', 'cio']);
      await expect(silabasDe(page, 2)).toHaveText(['prohi', 'bir']);
      await expect(silabasDe(page, 3)).toHaveText(['bú', 'ho']); // el hiato de verdad, intacto
    });

    test('210 · los grupos de 3+ consonantes dejan entero el grupo inseparable', async ({
      page,
    }) => {
      // Solo miraba DOS consonantes seguidas: cerraba tras la primera y arrastraba el resto,
      // dejando ataques imposibles en español (ab-strac-to, con-struir, tran-spor-te,
      // in-sti-tu-to, ob-stá-cu-lo, per-spec-ti-va).
      await analizar(page, 'abstracto construir transporte instituto obstáculo perspectiva');
      await expect(silabasDe(page, 0)).toHaveText(['abs', 'trac', 'to']);
      await expect(silabasDe(page, 1)).toHaveText(['cons', 'truir']);
      await expect(silabasDe(page, 2)).toHaveText(['trans', 'por', 'te']);
      await expect(silabasDe(page, 3)).toHaveText(['ins', 'ti', 'tu', 'to']);
      await expect(silabasDe(page, 4)).toHaveText(['obs', 'tá', 'cu', 'lo']);
      await expect(silabasDe(page, 5)).toHaveText(['pers', 'pec', 'ti', 'va']);
    });

    test('212 · las tarjetas nombran diptongos, triptongos e hiatos', async ({ page }) => {
      // El JSON-LD anunciaba «Identificación de diptongos, hiatos y triptongos» y la tarjeta
      // de Twitter prometía «diptongos e hiatos», pero la interfaz no marcaba ninguno.
      await analizar(page, 'cielo país buey aquí');
      const tarjeta = (i: number) => page.locator('[class*="palabraCard"]').nth(i);
      await expect(tarjeta(0)).toContainText('Diptongo: ie');
      await expect(tarjeta(1)).toContainText('Hiato: a-í');
      await expect(tarjeta(2)).toContainText('Triptongo: uey');
      // En «aquí» la u de «qu» no suena: no hay ningún encuentro vocálico que marcar.
      await expect(tarjeta(3)).not.toContainText('Diptongo');
      await expect(tarjeta(3)).not.toContainText('Hiato');
    });

    test('215 · los botones Analizar y Limpiar llevan type="button"', async ({ page }) => {
      // CLAUDE.md global §5 y el candado `npm run check:a11y-jsx`. Sin `type`, un <button>
      // es submit por defecto.
      await expect(page.getByRole('button', { name: 'Analizar Sílabas' })).toHaveAttribute(
        'type',
        'button'
      );
      await expect(page.getByRole('button', { name: 'Limpiar' })).toHaveAttribute(
        'type',
        'button'
      );
    });

    test('215 · los emojis pegados a un título llevan aria-hidden', async ({ page }) => {
      // Un lector de pantalla leía «libros Reglas de División Silábica en Español».
      const titulo = page.locator('h3', { hasText: 'Reglas de División Silábica' });
      await expect(titulo.locator('[aria-hidden="true"]')).toHaveCount(1);
    });
  });

  // ---------------------------------------------------------------------------------------
  // HALLAZGOS 257-262 — segunda inspección, 24/08/2026 · REPARADOS el 24/08/2026
  // Estaban escritos con test.fail(), afirmando lo que DEBERÍA ocurrir. Se les ha quitado la
  // marca al repararlos, comprobando antes que lo que afirmaban sigue siendo lo correcto.
  // ---------------------------------------------------------------------------------------

  test.describe('hallazgos 257-262, ya reparados', () => {
    test('«tungsteno» se separa tungs-te-no', async ({ page }) => {
      // Residuo de la reparación del hallazgo 210. Cuando entre dos vocales hay CUATRO o más
      // consonantes, separarSilabas() manda dos a la derecha sin mirar cuáles: vale para
      // abs-trac-to, cons-truir o subs-tra-er, donde las dos últimas SÍ forman grupo
      // inseparable, pero no para «ngst», donde no lo forman. «st» no puede abrir sílaba en
      // español (la propia app lo enseña: «si el grupo puede iniciar una sílaba en español,
      // viaja entero a la siguiente; si no, se parte»), así que solo la «t» pasa a la derecha
      // y «ngs» cierra la sílaba anterior: tungs-te-no.
      await analizar(page, 'tungsteno');
      await expect(silabasDe(page)).toHaveText(['tungs', 'te', 'no']); // obtenido: tung-ste-no
    });

    test('«la del que huye del mundanal ruido» es un endecasílabo', async ({ page }) => {
      // empiezaPorVocal() bloquea la sinalefa ante «hue-», «hui-» y «hie-» porque esa h + u/i
      // suena consonántica ([w], [j]) — y hace bien: «la del que hierve…» da 11. Pero deja
      // fuera «huy-», que es el mismo sonido: «huye», «huyó», «huyeron», «huyendo».
      // la(1) del(1) que(1) hu-ye(2) del(1) mun-da-nal(3) rui-do(2) = 11 fonéticas, ninguna
      // sinalefa, última palabra llana → 11. Es el segundo verso de la LIRA de Fray Luis que
      // la propia app ofrece como ejemplo, y la lira exige ahí un 11B.
      await analizar(page, 'la del que huye del mundanal ruido');
      await expect(metricasDe(page)).toHaveText('11'); // obtenido: 10, decasílabo
    });

    test('dos sinalefas seguidas e independientes cuentan las dos', async ({ page }) => {
      // Para no encadenar sinalefas, analizarVerso() salta la palabra siguiente entera
      // (`i++`). Eso es correcto cuando la vocal es la MISMA («hombre a una»: la única vocal
      // de «a» ya se fundió), pero no cuando la palabra de en medio tiene más de una sílaba:
      // en «érase una alquitara», la «u» de «u-na» se funde hacia atrás y su «a» final es
      // otra vocal distinta, que se funde hacia delante. Son dos fusiones independientes.
      // é-ra-se(3) u-na(2) al-qui-ta-ra(4) pen-sa-ti-va(4) = 13 − 2 = 11, endecasílabo:
      // es el sexto verso del SONETO de Quevedo que la propia app ofrece como ejemplo.
      await analizar(page, 'érase una alquitara pensativa');
      await expect(metricasDe(page)).toHaveText('11'); // obtenido: 12, dodecasílabo
    });

    test('el primer verso del soneto de Quevedo es un endecasílabo', async ({ page }) => {
      // Aquí sí hay tres vocales en contacto («hom-bre a u-na»): la escansión clásica las
      // funde en UNA sola sílaba métrica, que es lo que hace de este verso un endecasílabo
      // de manual. El bloque educativo declara que no encadenar «es el criterio de la
      // escansión tradicional» y no lo es: la sinalefa puede unir tres o más vocales
      // (Quilis, Métrica española), y el propio ejemplo de la app lo demuestra.
      // 14 fonéticas − 3 (se_un, y la triple bre_a_u, que quita dos) = 11.
      await analizar(page, 'Érase un hombre a una nariz pegado');
      await expect(metricasDe(page)).toHaveText('11'); // obtenido: 12, dodecasílabo
    });

    test('el icono del marcador de posición lleva aria-hidden', async ({ page }) => {
      // La reparación del hallazgo 214 añadió `aria-hidden` al icono del aviso nuevo (🔤) y
      // dejó sin él al gemelo de al lado (📝, page.tsx L538), que es además el que ve TODO
      // el mundo al entrar: un lector de pantalla lee «memo Introduce un texto para analizar
      // sus sílabas». Es de los casos que `check:a11y-jsx` marca como «piden criterio» y por
      // eso no rompe el build, pero aquí el criterio ya está decidido en su gemelo.
      const icono = page.locator('[class*="placeholderIcon"]');
      await expect(icono).toHaveAttribute('aria-hidden', 'true'); // obtenido: sin atributo
    });

    test('el «Romance viejo» de ejemplo mide ocho en todos sus versos', async ({
      page,
    }) => {
      // El motor acierta: «cuando hace la calor» son cuan-do(2) ha-ce(2) la(1) ca-lor(2) = 7
      // fonéticas − 1 sinalefa («cuando_hace») + 1 (aguda) = 7. Lo que falla es el TEXTO
      // elegido: el romance del prisionero dice «cuando faze la calor», y es la grafía
      // antigua la que evita la sinalefa y sostiene el octosílabo. Con la forma modernizada,
      // la app enseña un heptasílabo dentro de un bloque cuya ficha dice «serie indefinida
      // de OCTOSÍLABOS con rima asonante en los pares».
      await page.getByRole('button', { name: 'Cargar estrofa de ejemplo: Romance viejo (grafía antigua)' }).click();
      await page.getByRole('button', { name: 'Analizar Sílabas' }).click();
      await expect(metricasDe(page, 1)).toHaveText('8'); // obtenido: 7, heptasílabo
    });
  });

  // ---------------------------------------------------------------------------------------
  // TERCERA INSPECCIÓN — 02/09/2026 · segmento «cálculo», riesgo 3
  //
  // LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
  // (RAE, Ortografía de la lengua española 2010, cap. I «Diptongos, triptongos e hiatos
  //  ortográficos»; y el DPD para «aun/aún» y «chií»)
  //
  //   CASO 1 (normal) — «El carpintero pinta la ventana»
  //       el(1) · car-pin-te-ro(4): «rp» y «nt» no son grupos inseparables, se reparten una a
  //       cada lado; «r» sola entre vocales va con la siguiente · pin-ta(2) · la(1) ·
  //       ven-ta-na(3). Total 11 sílabas en 5 palabras, media 11/5 = 2,2 (coma decimal).
  //       Como verso: 11 fonéticas, ningún contacto vocal-vocal entre palabras (0 sinalefas),
  //       «ventana» llana → ±0 = 11, endecasílabo.
  //
  //   CASO 2 (límite) — tilde diacrítica y vocales iguales: «aun aún antiinflamatorio chiita»
  //       aun(1): «au» es diptongo (abierta + cerrada átona); es la «aun» de «incluso».
  //       aún(2): a-ún. La tilde sobre la cerrada la hace tónica y rompe el diptongo. Mismo
  //           par de letras, un cómputo distinto: es el caso de tilde diacrítica que SÍ cambia
  //           el número de sílabas (a diferencia de «solo/sólo» o «mas/más»).
  //       antiinflamatorio(7): an-ti-in-fla-ma-to-rio. La OLE 2010 solo llama diptongo a «dos
  //           vocales cerradas DISTINTAS»; dos vocales IGUALES son siempre hiato (chi-i-ta,
  //           du-un-vi-ro), igual que a-a en a-za-har o e-e en le-er.
  //       chiita(3): chi-i-ta.
  //       Total esperado 1+2+7+3 = 13 sílabas en 4 palabras, media 3,3.
  //
  //   CASO 3 (especial) — siglas, mayúsculas y nombre propio: «María MURCIÉLAGO ONU DNI»
  //       ma-rí-a(3): la í tónica rompe el diptongo · MURCIÉLAGO(4): mur-cié-la-go, la tilde
  //       sobre vocal abierta no rompe nada · ONU(2): o-nu, sigla que se lee como palabra ·
  //       DNI: sigla DELETREADA (de-e-ne-i), fuera del modelo de un silabeador ortográfico:
  //       «dni» no es una sílaba posible en español, ninguna empieza por «dn».
  // ---------------------------------------------------------------------------------------

  test.describe('tercera inspección (02/09/2026)', () => {
    test('CASO 1 (normal) · frase corriente: sílabas, palabras, media española y medida del verso', async ({
      page,
    }) => {
      await analizar(page, 'El carpintero pinta la ventana');

      // Dos consonantes que no forman grupo inseparable se reparten una a cada lado (car|pin,
      // pin|te); una consonante sola entre vocales va siempre con la sílaba siguiente (te|ro).
      // Desde el hallazgo 616 las sílabas conservan las mayúsculas del original: «El», no «el».
      await expect(silabasDe(page, 0)).toHaveText(['El']);
      await expect(silabasDe(page, 1)).toHaveText(['car', 'pin', 'te', 'ro']);
      await expect(silabasDe(page, 2)).toHaveText(['pin', 'ta']);
      await expect(silabasDe(page, 3)).toHaveText(['la']);
      await expect(silabasDe(page, 4)).toHaveText(['ven', 'ta', 'na']);

      // 1+4+2+1+3 = 11 sílabas · 5 palabras · 11/5 = 2,2 con COMA decimal (formato español).
      await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('11');
      await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('5');
      await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('2,2');

      // Ninguna palabra termina en vocal ante palabra que empiece por vocal → 0 sinalefas.
      // «ventana» es llana → ±0. 11 fonéticas = 11 métricas.
      await expect(metricasDe(page)).toHaveText('11');
      await expect(nombreDe(page)).toContainText('endecasílabo');
      await expect(desgloseDe(page)).toContainText('llana');
      await expect(desgloseDe(page)).not.toContainText('sinalefa');
    });

    test('CASO 2 (límite) · la tilde diacrítica de «aún» parte el diptongo de «aun»', async ({
      page,
    }) => {
      await analizar(page, 'aun aún');

      // DPD: «aun» (= incluso) es monosílabo, diptongo «au»; «aún» (= todavía) es bisílabo,
      // porque la tilde marca tónica la vocal cerrada y crea hiato. Es la única pareja de
      // tilde diacrítica del español en la que cambia el NÚMERO DE SÍLABAS.
      await expect(silabasDe(page, 0)).toHaveText(['aun']);
      await expect(totalDe(page, 0)).toHaveText('1 sílaba');
      await expect(silabasDe(page, 1)).toHaveText(['a', 'ún']);
      await expect(totalDe(page, 1)).toHaveText('2 sílabas');

      // Y la tarjeta nombra bien cada encuentro vocálico.
      await expect(page.locator('[class*="palabraCard"]').nth(0)).toContainText('Diptongo: au');
      await expect(page.locator('[class*="palabraCard"]').nth(1)).toContainText('Hiato: a-ú');
    });

    // ✅ REPARADO el 02/09/2026 (hallazgo 614). Queda como regresión.
    test(
      'CASO 2 (límite) · REGRESIÓN · dos vocales cerradas IGUALES son hiato, no diptongo',
      async ({ page }) => {
        // OLE 2010, cap. I: son diptongo «dos vocales cerradas DISTINTAS» (ciu-dad, cui-da-do);
        // dos vocales IGUALES forman siempre hiato (chi-i-ta, du-un-vi-ro), exactamente igual
        // que las abiertas iguales. El motor lo acierta con las abiertas —a-za-har es «Hiato:
        // a-a», le-er es «Hiato: e-e»— y lo falla con las cerradas, porque `formanDiptongo()`
        // resuelve `esDebil(a) && esDebil(b) → diptongo` sin comprobar que sean distintas.
        // Se desmiente a sí mismo dentro de la misma pantalla.
        await analizar(page, 'antiinflamatorio chiita');

        await expect(silabasDe(page, 0)).toHaveText([
          'an', 'ti', 'in', 'fla', 'ma', 'to', 'rio',
        ]); // obtenido: an-tiin-fla-ma-to-rio (6 sílabas)
        await expect(totalDe(page, 0)).toHaveText('7 sílabas');
        await expect(silabasDe(page, 1)).toHaveText(['chi', 'i', 'ta']); // obtenido: chii-ta (2)
        // Y encima lo ROTULA: la tarjeta dice «Diptongo: ii» donde debería decir «Hiato: i-i».
        await expect(page.locator('[class*="palabraCard"]').nth(1)).toContainText('Hiato: i-i');
      }
    );

    test('CASO 3 (especial) · nombre propio, mayúsculas y sigla que se lee como palabra', async ({
      page,
    }) => {
      await analizar(page, 'María MURCIÉLAGO ONU DNI');

      // El cómputo es correcto en las tres primeras: la í tónica rompe el diptongo (ma-rí-a),
      // la tilde sobre vocal abierta no lo rompe (mur-cié-la-go) y una sigla legible como
      // palabra se silabea como cualquier palabra (o-nu).
      await expect(totalDe(page, 0)).toHaveText('3 sílabas');
      await expect(totalDe(page, 1)).toHaveText('4 sílabas');
      await expect(totalDe(page, 2)).toHaveText('2 sílabas');
      await expect(silabasDe(page, 2)).toHaveText(['O', 'NU']);
    });

    // ✅ REPARADO el 02/09/2026 (hallazgo 616). `separarSilabas()` hacía `toLowerCase()` y
    // devolvía el texto ya convertido, así que la app no separaba el texto del usuario: lo
    // REESCRIBÍA. Ahora las reglas se resuelven en minúsculas y las sílabas se recortan del
    // original. Queda como regresión.
    test(
      'CASO 3 (especial) · REGRESIÓN · las sílabas conservan las mayúsculas del original',
      async ({ page }) => {
        await analizar(page, 'María MURCIÉLAGO');
        await expect(silabasDe(page, 0)).toHaveText(['Ma', 'rí', 'a']);
        await expect(silabasDe(page, 1)).toHaveText(['MUR', 'CIÉ', 'LA', 'GO']);
      }
    );

    // ✅ CERRADO el 02/09/2026 (hallazgo 617) POR LA SEGUNDA SALIDA que el acta admitía —
    // «4 sílabas o aviso de que las siglas quedan fuera»— y no por la primera. El motivo:
    // deletrear exige distinguir la sigla que se lee de corrido (ONU → o-nu) de la que se
    // deletrea (DNI → de-e-ne-i), y esa distinción no está en la forma de la palabra sino en
    // el uso; una heurística sobre las mayúsculas convertiría «PSST» en «pe-ese-ese-te» y
    // metería ese criterio también en `diccionario-rimas`, que comparte el motor. Se prefiere
    // decirlo: el recuadro de limitaciones ya enumera el caso, con «DNI» como ejemplo y con
    // las dos siglas que sí salen bien, para que quien escanda un verso sepa qué contar aparte.
    test(
      'CASO 3 (especial) · las siglas deletreadas quedan fuera, y la app lo dice',
      async ({ page }) => {
        await analizar(page, 'DNI');
        // Sigue contando una sílaba: es lo que hace el motor con una palabra sin vocales
        // suficientes, igual que con «psst».
        await expect(totalDe(page, 0)).toHaveText('1 sílaba');

        // Y el bloque de limitaciones lo advierte, con el mismo ejemplo.
        const limitaciones = await page.getByText(/Siglas deletreadas/).locator('xpath=..').innerText();
        expect(limitaciones.replace(/\s+/g, ' ')).toContain('de-e-ne-i');
        expect(limitaciones.replace(/\s+/g, ' ')).toContain('o-nu');
      }
    );
  });

  // =====================================================================================
  // CUARTA INSPECCIÓN — 07/09/2026 · RE-INSPECCIÓN de lo reparado el 02/09/2026
  //
  // Los altos que se cerraron entonces eran todos del mismo eslabón: la «u» ortográfica de
  // «qu»/«gü» contada como una vocal más (hallazgos 207-208), ese error de silabeo entrando
  // en las sílabas fonéticas del verso y falseando el TIPO DE VERSO —que es la promesa
  // central de la app—, y el `i++` de `analizarVerso()` que saltaba la palabra siguiente
  // ENTERA para no encadenar sinalefas, correcto solo cuando la vocal en juego es la misma
  // (hallazgos 257 y 260). Aquí se vuelven a comprobar los tres, pero con entradas NUEVAS:
  // repetir la entrada con la que se reparó no distingue «la regla es correcta» de «esa
  // entrada está memorizada».
  //
  // LOS TRES CASOS DE ESTA RONDA, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
  //
  //   CASO 1 (normal) — Machado, «Proverbios y cantares XXIX». Dos octosílabos de métrica
  //       indiscutible, con la ley del acento final decidiendo el segundo:
  //       «Caminante, no hay camino,»  Ca-mi-nan-te(4) no(1) hay(1) ca-mi-no(3) = 9 fonéticas.
  //           «hay» empieza por h muda ante «a», así que «no hay» SÍ hace sinalefa: −1.
  //           «camino» es llana: ±0. 9 − 1 = 8 → octosílabo.
  //       «se hace camino al andar.»   se(1) ha-ce(2) ca-mi-no(3) al(1) an-dar(2) = 9 fonéticas.
  //           Sinalefas «se_hace» (h muda otra vez) y «camino_al»: −2. «andar» es AGUDA: +1.
  //           9 − 2 + 1 = 8 → octosílabo. Sin el ajuste por acento final saldría heptasílabo,
  //           y el poema dejaría de ser lo que es.
  //       Del texto entero: 18 sílabas en 9 palabras → media 2,0, con COMA decimal.
  //
  //   CASO 2 (límite) — «gü» ante vocal TILDADA, triptongo con diéresis, h intercalada que no
  //       rompe el diptongo, y dos vocales IGUALES en contacto entre dos palabras:
  //       ci-güe-ña(3)      la diéresis dice que la ü suena: la g va sola y la ü es vocal
  //       a-ve-ri-güéis(4)  «üéi» es triptongo (cerrada + abierta tónica + cerrada)
  //       des-hue-sar(3)    la h entre la s y el diptongo no parte nada (OLE 2010)
  //       an-ti-güe-dad(4)
  //       Y el tercer verso de la Rima LIII de Bécquer, endecasílabo de manual:
  //       «y otra vez con el ala a sus cristales» → y(1) o-tra(2) vez(1) con(1) el(1)
  //           a-la(2) a(1) sus(1) cris-ta-les(3) = 13 fonéticas. Sinalefas «y_otra» —la
  //           conjunción funde por UN lado— y «ala_a», que son la MISMA vocal y aun así
  //           funden. −2. «cristales» es llana: ±0. 13 − 2 = 11 → endecasílabo.
  //
  //   CASO 3 (rechazo) — dos líneas que no son un verso, distintas de la del 24/08:
  //       ««¿...!?» — ;; ::»          solo signos, ni una cifra
  //       «3,14 % 2026 · 1.234,56 €»  solo cifras, en formato español
  //       En ambas, /[a-záéíóúüñ]+/gi no encuentra ninguna palabra: se espera el aviso
  //       explícito, sin resumen con ceros, sin tarjetas de palabra y sin bloque de métrica.
  //
  // HALLAZGOS de esta ronda (659-663): los cinco del final, REPARADOS el 09/09/2026 y ya sin
  // test.fail(). Ninguno es del silabeador, que aguantó todo lo que se le echó; son el material
  // DIDÁCTICO contradiciendo al motor (659, 661, 662, 663) y una cifra dentro del verso (660),
  // que era el único con código detrás.
  // =====================================================================================

  test.describe('cuarta inspección (07/09/2026)', () => {
    test('CASO 1 (normal) · dos octosílabos de Machado: la h muda funde y la aguda suma 1', async ({
      page,
    }) => {
      await analizar(page, 'Caminante, no hay camino,\nse hace camino al andar.');

      // Silabeo de las dos palabras que deciden el verso.
      await expect(silabasDe(page, 0)).toHaveText(['Ca', 'mi', 'nan', 'te']);
      await expect(silabasDe(page, 2)).toHaveText(['hay']); // «ay» diptongo: monosílabo

      // 4+1+1+3 + 1+2+3+1+2 = 18 sílabas en 9 palabras → 2,0 con COMA decimal.
      await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('18');
      await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('9');
      await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('2,0');

      // Verso 1: la h de «hay» es muda, así que «no hay» funde. 9 − 1 ± 0 = 8.
      await expect(metricasDe(page, 0)).toHaveText('8');
      await expect(nombreDe(page, 0)).toContainText('octosílabo');
      await expect(desgloseDe(page, 0)).toContainText('9 fonéticas');
      await expect(desgloseDe(page, 0)).toContainText('1 sinalefa');
      await expect(desgloseDe(page, 0)).toContainText('llana');
      await expect(sinalefasDe(page, 0)).toHaveCount(1);
      await expect(sinalefasDe(page, 0).first()).toContainText('hay');

      // Verso 2: dos sinalefas y final AGUDO. 9 − 2 + 1 = 8; sin el +1 sería heptasílabo.
      await expect(metricasDe(page, 1)).toHaveText('8');
      await expect(nombreDe(page, 1)).toContainText('octosílabo');
      await expect(desgloseDe(page, 1)).toContainText('9 fonéticas');
      await expect(desgloseDe(page, 1)).toContainText('2 sinalefas');
      await expect(desgloseDe(page, 1)).toContainText('+ 1');
      await expect(desgloseDe(page, 1)).toContainText('aguda');
      await expect(sinalefasDe(page, 1)).toHaveCount(2);
    });

    test('CASO 2 (límite) · «gü» ante vocal tildada, triptongo üéi, h intercalada y dos vocales iguales entre palabras', async ({
      page,
    }) => {
      await analizar(page, 'cigüeña averigüéis deshuesar antigüedad');

      // Con diéresis la ü SUENA: la g queda sola y la ü es el núcleo, aunque la vocal
      // siguiente lleve tilde. Es el caso simétrico del «qu» de «aquí», donde la u NO suena.
      await expect(silabasDe(page, 0)).toHaveText(['ci', 'güe', 'ña']);
      await expect(silabasDe(page, 1)).toHaveText(['a', 've', 'ri', 'güéis']);
      await expect(page.locator('[class*="palabraCard"]').nth(1)).toContainText('Triptongo: üéi');
      // La h entre la s y el diptongo no separa nada: des-hue-sar, no des-hu-e-sar.
      await expect(silabasDe(page, 2)).toHaveText(['des', 'hue', 'sar']);
      await expect(silabasDe(page, 3)).toHaveText(['an', 'ti', 'güe', 'dad']);

      // Bécquer, Rima LIII, verso 3.º. La conjunción «y» funde por un solo lado (con «otra»)
      // y «ala a» funde dos veces la MISMA vocal, que es justo el caso en el que el antiguo
      // salto de palabra parecía inofensivo. 13 − 2 ± 0 = 11.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'y otra vez con el ala a sus cristales');
      await expect(metricasDe(page)).toHaveText('11');
      await expect(nombreDe(page)).toContainText('endecasílabo');
      await expect(desgloseDe(page)).toContainText('13 fonéticas');
      await expect(desgloseDe(page)).toContainText('2 sinalefas');
      await expect(sinalefasDe(page)).toHaveCount(2);
      await expect(sinalefasDe(page).nth(0)).toContainText('otra');
      await expect(sinalefasDe(page).nth(1)).toContainText('ala');
    });

    test('CASO 3 (rechazo) · una línea de solo signos y otra de solo cifras no son un verso', async ({
      page,
    }) => {
      await analizar(page, '«¿...!?» — ;; ::');
      await expect(page.getByText('No hay ninguna palabra que analizar')).toBeVisible();
      await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
      await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);
      await expect(page.locator('[class*="versoCard"]')).toHaveCount(0);

      // Y con cifras en formato español, que es lo que teclea un hispanohablante.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, '3,14 % 2026 · 1.234,56 €');
      await expect(page.getByText('No hay ninguna palabra que analizar')).toBeVisible();
      await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
      await expect(page.locator('[class*="versoCard"]')).toHaveCount(0);
    });

    test('RE-INSPECCIÓN · los tres altos del 02/09 siguen cerrados, con entradas nuevas', async ({
      page,
    }) => {
      // (1) La «u» ortográfica no es una vocal en «qu», y SÍ lo es cuando lleva diéresis.
      //     Ninguna de estas tres palabras se usó para reparar el motor.
      await analizar(page, 'maniquí averigüé pingüino');
      await expect(silabasDe(page, 0)).toHaveText(['ma', 'ni', 'quí']);
      await expect(silabasDe(page, 1)).toHaveText(['a', 've', 'ri', 'güé']);
      await expect(silabasDe(page, 2)).toHaveText(['pin', 'güi', 'no']);

      // (2) Y ese silabeo llega al TIPO DE VERSO. Verso construido, pero sin escansión
      //     discutible: «nada aquí» funde dos «a», y «aquí» es aguda.
      //     el(1) pin-güi-no(3) na-da(2) a-quí(2) = 8 fonéticas − 1 sinalefa + 1 = 8.
      //     Con la u de «qu» contada como vocal serían 9 fonéticas y saldría eneasílabo.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'el pingüino nada aquí');
      await expect(desgloseDe(page)).toContainText('8 fonéticas');
      await expect(metricasDe(page)).toHaveText('8');
      await expect(nombreDe(page)).toContainText('octosílabo');

      // (3) Las sinalefas se ENCADENAN: tres vocales en contacto son dos contactos, no uno.
      //     la(1) ca-sa(2) a(1) os-cu-ras(3) = 7 fonéticas; «casa_a» y «a_oscuras» → −2;
      //     «oscuras» es llana. 7 − 2 = 5. Con el antiguo salto de palabra saldrían 6.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'la casa a oscuras');
      await expect(desgloseDe(page)).toContainText('2 sinalefas');
      await expect(metricasDe(page)).toHaveText('5');
    });

    test('TESTIGO · una redondilla ajena a los ejemplos de la app se mide y se nombra', async ({
      page,
    }) => {
      // Calderón, «La vida es sueño». Cuatro octosílabos abba, ninguno de ellos entre los
      // ejemplos que la app trae de serie — que es lo que le da valor como testigo.
      //   Sue-ña(2) el(1) ri-co(2) en(1) su(1) ri-que-za(3) = 10 − 2 (sueña_el, rico_en) = 8
      //   que(1) más(1) cui-da-dos(3) le(1) o-fre-ce(3) = 9 − 1 (le_ofrece) = 8
      //   sue-ña(2) el(1) po-bre(2) que(1) pa-de-ce(3) = 9 − 1 (sueña_el) = 8
      //   su(1) mi-se-ria(3) y(1) su(1) po-bre-za(3) = 9 − 1 (miseria_y) = 8
      await analizar(
        page,
        'Sueña el rico en su riqueza,\nque más cuidados le ofrece;\nsueña el pobre que padece\nsu miseria y su pobreza.'
      );

      for (let i = 0; i < 4; i++) {
        await expect(metricasDe(page, i)).toHaveText('8');
      }
      await expect(page.locator('[class*="rimaValor"]').first()).toHaveText('abba');
      await expect(page.locator('[class*="rimaBloque"]')).toContainText('Consonante');
      await expect(page.locator('[class*="rimaBloque"]')).toContainText('Redondilla');
    });

    // -----------------------------------------------------------------------------------
    // HALLAZGOS 659-663 — cuarta inspección, 07/09/2026 · REPARADOS el 09/09/2026
    // Estaban escritos con test.fail(), afirmando lo que DEBERÍA ocurrir. Se les ha quitado
    // la marca al repararlos, tras rehacer a mano la cuenta de cada verso y comprobar que lo
    // que afirmaban sigue siendo lo correcto — la regla que dejó la ronda 1: un test.fail()
    // que pasa a verde no prueba nada hasta verificar su contenido.
    // -----------------------------------------------------------------------------------

    // ✅ 659 · El ejemplo resuelto de la FAQ educativa se saltaba las sinalefas que la propia
    //    app detecta dos pantallas más arriba, y era el ejemplo de la lección misma sobre el
    //    ajuste por acento final: quien lo copiara en un examen contaría 11 donde la app dice
    //    9. Ahora la respuesta aísla la regla con un verso SIN sinalefas («que van a dar en la
    //    mar», 7 fonéticas + 1 aguda = 8) y cuenta bien el que ya estaba, restando las dos.
    test(
      '659 · el ejemplo resuelto de la FAQ educativa cuenta lo mismo que el motor',
      async ({ page }) => {
        // En(1) el(1) prin-ci-pio(3) e-ra(2) el(1) a-mor(2) = 10 fonéticas.
        // Sinalefas «principio_era» y «era_el» → −2. «amor» aguda → +1. 10 − 2 + 1 = 9.
        await analizar(page, 'En el principio era el amor');
        await expect(metricasDe(page)).toHaveText('9');
        await expect(nombreDe(page)).toContainText('eneasílabo');
        const metricas = (await metricasDe(page).innerText()).trim();

        await page.getByRole('button', { name: 'Ver guía educativa' }).click();
        const pregunta = page.getByText('¿Cómo se cuenta una sílaba tónica para la métrica?');
        await pregunta.click();
        const respuesta = (await pregunta.locator('xpath=..').innerText()).replace(/\s+/g, ' ');

        // Antes decía «tiene 11 sílabas métricas aunque tenga 10 fonéticas»: acertaba las
        // fonéticas y luego sumaba el +1 sin restar las dos sinalefas.
        expect(respuesta).toContain(`${metricas} sílabas métricas`);
        expect(respuesta).not.toContain('11 sílabas métricas');
        // Y el verso que aísla la regla: 7 fonéticas, ninguna fusión, aguda +1 → 8.
        expect(respuesta).toContain('8 sílabas métricas');
      }
    );

    // ✅ 661 · La reparación del hallazgo 614 (02/09) llegó al motor y al bloque educativo
    //    visible —que ya dice «dos débiles DISTINTAS» y «dos débiles IGUALES forman hiato»—
    //    pero NO al `faqJsonLd` de metadata.ts, que se quedó con la regla anterior. Y ese es
    //    justo el bloque que leen Bing Copilot, ChatGPT y Perplexity para responder.
    test(
      '661 · el FAQPage del JSON-LD enseña la regla de diptongo que aplica el motor',
      async ({ page }) => {
        // Lo que la app hace, y hace bien:
        await analizar(page, 'chiita');
        await expect(silabasDe(page, 0)).toHaveText(['chi', 'i', 'ta']);
        await expect(page.locator('[class*="palabraCard"]').nth(0)).toContainText('Hiato: i-i');

        // El FAQPage declaraba «una vocal fuerte se combina con una vocal débil átona (i, u),
        // o dos débiles juntas» — sin el «distintas» que la propia app enseña.
        const faq = await leerFaqJsonLd(page);
        const diptongo = faq.find((q) => q.pregunta.includes('¿Qué es un diptongo'));
        expect(diptongo?.respuesta).toContain('distinta');
        expect(diptongo?.respuesta).toContain('hiato');
      }
    );

    // ✅ 662 · El FAQPage declaraba «tl» grupo inseparable. El motor lo excluye a propósito
    //    (silabeo.ts documenta por qué: at-le-ta es la partición peninsular, la única que
    //    produce un ataque válido en todas las variedades) y la ficha visible «Consonantes
    //    Dobles» de la propia página lo enumera SIN tl. Eran dos textos de la misma app con
    //    dos reglas distintas, y la servida a los buscadores era la que la app no aplica.
    test(
      '662 · el FAQPage ya no declara «tl» inseparable, como el motor y la ficha visible',
      async ({ page }) => {
        await analizar(page, 'atleta atlántico');
        await expect(silabasDe(page, 0)).toHaveText(['at', 'le', 'ta']);
        await expect(silabasDe(page, 1)).toHaveText(['at', 'lán', 'ti', 'co']);

        const faq = await leerFaqJsonLd(page);
        const separacion = faq.find((q) => q.pregunta.includes('¿Cómo se separan las sílabas'));
        expect(separacion?.respuesta).not.toContain('tr y tl');
        // Y lo dice en positivo, que es lo que el motor hace: at-le-ta, no a-tle-ta.
        expect(separacion?.respuesta).toContain('at-le-ta');
      }
    );

    // ✅ 660 · Una cifra dentro del verso desaparecía del cómputo Y dejaba unidas dos palabras
    //    que no se tocan. El extractor /[a-záéíóúüñ]+/gi descarta «20», y `analizarVerso()`
    //    miraba entonces «Tengo» y «años» como si fueran contiguas: la app pintaba la fusión
    //    «Tengo ⌣ años» con el lazo de sinalefa, o sea que no ignoraba la cifra, AFIRMABA una
    //    fusión que en el texto no existe. Y «letras de canciones» es un uso que la propia app
    //    promociona (tiene un metro personalizado añadido para eso).
    //    Reparado en metrica.ts (`hayTokenDescartado`): un token descartado rompe la
    //    contigüidad, así que entre dos palabras separadas por una cifra no hay sinalefa.
    test(
      '660 · una cifra dentro del verso rompe la contigüidad y no genera sinalefa',
      async ({ page }) => {
        // Ten-go(2) a-ños(2) y(1) hi-jos(2) = 7 fonéticas. El «20» y el «3» no son palabras y
        // no aportan sílabas, pero SÍ separan: ni «Tengo»+«años» ni «y»+«hijos» se tocan, así
        // que 0 sinalefas. «hijos» es llana: ±0. 7 − 0 + 0 = 7, heptasílabo.
        await analizar(page, 'Tengo 20 años y 3 hijos');

        const etiquetas = await page.locator('[class*="sinalefaTag"]').allTextContents();
        const aTraves = etiquetas.some((t) => /Tengo[\s\S]*años/.test(t));
        expect(aTraves).toBe(false); // obtenido antes de la reparación: «Tengo ⌣ años»
        await expect(sinalefasDe(page)).toHaveCount(0);
        await expect(metricasDe(page)).toHaveText('7'); // obtenido antes: 5
        await expect(desgloseDe(page)).not.toContainText('sinalefa');

        // Y la limitación queda dicha donde el usuario la busca, junto a siglas y compuestos.
        await page.getByRole('button', { name: 'Ver guía educativa' }).click();
        await expect(page.getByText('Las cifras no se cuentan')).toBeVisible();
      }
    );

    // ✅ 663 · El FAQPage atribuía a una sinalefa un 11 que sale sin ninguna. El verso que
    //    pone de ejemplo del endecasílabo no tiene ni un contacto vocal-vocal entre palabras:
    //    sus 11 sílabas métricas son sus 11 fonéticas, y la propia app lo enseña así en
    //    pantalla. El número era correcto; la razón que se daba, no — y es la razón lo que se
    //    está explicando. Ahora la respuesta cuenta los dos caminos al 11: sin fusión (este
    //    verso) y con tres sinalefas encadenadas (el de Quevedo, 14 − 3).
    test(
      '663 · el FAQPage explica el endecasílabo con la razón que el motor aplica',
      async ({ page }) => {
        // En(1) el(1) prin-ci-pio(3) de(1) tus(1) a-ños(2) tier-nos(2) = 11 fonéticas.
        // Ninguna palabra acaba en vocal ante palabra que empiece por vocal: 0 sinalefas.
        // «tiernos» es llana: ±0. 11 = 11, endecasílabo.
        await analizar(page, 'En el principio de tus años tiernos');
        await expect(metricasDe(page)).toHaveText('11');
        await expect(desgloseDe(page)).toContainText('11 fonéticas');
        await expect(sinalefasDe(page)).toHaveCount(0);

        const faq = await leerFaqJsonLd(page);
        const endeca = faq.find((q) => q.pregunta.includes('verso endecasílabo'));
        expect(endeca?.respuesta).not.toContain('contando la sinalefa');
        expect(endeca?.respuesta).toContain('ninguna sinalefa');
      }
    );
  });

  // =====================================================================================
  // QUINTA INSPECCIÓN — 10/09/2026 · RE-INSPECCIÓN tras el refactor de motores del 10/09
  //
  // El silabeador y la escansión volvieron a aguantar todo lo que se les echó: los tres
  // casos de esta ronda salieron EXACTOS a la cuenta hecha a mano. Lo que falla otra vez es
  // el material DIDÁCTICO, y en la misma forma que en la cuarta ronda: la reparación llegó
  // al motor y al JSON-LD y se quedó sin llegar al texto visible (o al revés).
  //
  // LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
  // (RAE, Ortografía de la lengua española 2010, cap. I; y la métrica clásica para el verso)
  //
  //   CASO 1 (normal) — Bécquer, Rima XXI. Dos endecasílabos ajenos a los ejemplos de la app
  //       y a las cuatro inspecciones anteriores:
  //       «¿Qué es poesía?, dices mientras clavas»
  //           Qué(1) es(1) po-e-sí-a(4) di-ces(2) mien-tras(2) cla-vas(2) = 12 fonéticas.
  //           «poesía» lleva los dos hiatos del manual: «oe» son dos abiertas, e «ía» es
  //           hiato acentual (la í tónica rompe el diptongo). «mientras»: «ie» es diptongo y
  //           «ntr» reparte n a la izquierda porque solo «tr» puede abrir sílaba.
  //           Una sola sinalefa, «Qué_es»; «clavas» es llana → 12 − 1 = 11, endecasílabo.
  //       «en mi pupila tu pupila azul;»
  //           en(1) mi(1) pu-pi-la(3) tu(1) pu-pi-la(3) a-zul(2) = 11 fonéticas.
  //           Sinalefa «pupila_azul» → −1; «azul» es AGUDA → +1. 11 − 1 + 1 = 11.
  //       Del texto entero: 23 sílabas en 12 palabras → media 1,9 con COMA decimal.
  //
  //   CASO 2 (límite) — el diptongo ORTOGRÁFICO de dos cerradas distintas con tilde, las dos
  //       cerradas iguales, un triptongo y un grupo de CINCO consonantes:
  //       ca-suís-ti-co(4)   OLE 2010: dos vocales cerradas DISTINTAS forman siempre diptongo
  //                          a efectos ortográficos, AUNQUE una lleve tilde. Por eso no es
  //                          ca-su-ís-ti-co. Igual «cuí-da-te» y «lin-güís-ti-ca».
  //       fri-í-si-mo(4)     y dos cerradas IGUALES forman siempre hiato, aunque una lleve
  //                          tilde: es el caso simétrico del anterior, y el que separa la
  //                          regla de verdad de «la tilde sobre i/u siempre rompe el diptongo».
  //       des-pre-ciáis(3)   triptongo «iái» (cerrada + abierta tónica + cerrada); «spr»
  //                          reparte s a la izquierda porque solo «pr» abre sílaba.
  //       angs-trom(2)       cinco consonantes seguidas: a la derecha pasa «tr» y nada más.
  //       Y un verso con final ESDRÚJULO, donde el ajuste RESTA:
  //       «La niña ya no oye la música» → La(1) ni-ña(2) ya(1) no(1) o-ye(2) la(1)
  //           mú-si-ca(3) = 11 fonéticas. Una sinalefa, «no_oye» (dos «o» en contacto: la
  //           misma vocal también funde). «música» es esdrújula → −1. 11 − 1 − 1 = 9,
  //           eneasílabo. Sin el ajuste sería decasílabo.
  //
  //   CASO 3 (aparte) — entradas que no son texto analizable, distintas de las de las cuatro
  //       rondas anteriores:
  //       «psst»                    palabra sin ninguna vocal: el motor la devuelve entera y
  //                                 cuenta 1 sílaba (documentado en silabeo.ts), y no marca
  //                                 ningún encuentro vocálico ni abre el bloque de métrica.
  //       «maiz»                    sin tilde, «ai» es diptongo → UNA sílaba, «maiz».
  //       «~~~ ¿¿?? ¡¡!! «» ///»    ni una letra: aviso explícito, sin resumen ni tarjetas.
  //       «la vïuda del rey»        la diéresis poética sobre la i → HALLAZGO, al final.
  //
  // HALLAZGOS de esta ronda: los seis del final, con test.fail(), afirmando lo que DEBERÍA
  // ocurrir. Cinco son del material didáctico y uno del extractor de palabras.
  //
  // AUDITORÍA DE LOS CASOS PREVIOS (obligatoria en esta tanda): se rehízo a mano la cuenta de
  // los versos afirmados por las cuatro inspecciones anteriores —Quevedo, Fray Luis, Machado,
  // Bécquer LIII, Calderón, Darío, el romance viejo— y la partición de sus palabras. Todos
  // siguen siendo lo que la app DEBE hacer: no hay ningún caso que fije como contrato un
  // comportamiento hoy defectuoso. En particular se verificó que «lin-güís-ti-ca» (CASO 2 de
  // la segunda ronda) es correcto y NO un despiste: es la misma regla que sostiene
  // «ca-suís-ti-co», y es el texto educativo el que se ha quedado atrás.
  // =====================================================================================

  test.describe('quinta inspección (10/09/2026)', () => {
    test('CASO 1 (normal) · dos endecasílabos de Bécquer: hiato doble, un contacto vocálico y una aguda', async ({
      page,
    }) => {
      await analizar(page, '¿Qué es poesía?, dices mientras clavas\nen mi pupila tu pupila azul;');

      // «oe» dos abiertas → hiato; «ía» hiato acentual. Los dos, rotulados en la tarjeta.
      await expect(silabasDe(page, 2)).toHaveText(['po', 'e', 'sí', 'a']);
      await expect(page.locator('[class*="palabraCard"]').nth(2)).toContainText('Hiato: o-e');
      await expect(page.locator('[class*="palabraCard"]').nth(2)).toContainText('Hiato: í-a');
      // «ie» diptongo · de «ntr» solo «tr» pasa a la derecha.
      await expect(silabasDe(page, 4)).toHaveText(['mien', 'tras']);
      await expect(silabasDe(page, 11)).toHaveText(['a', 'zul']);

      // 12 + 11 = 23 sílabas en 12 palabras → 23/12 = 1,91… → 1,9 con COMA decimal.
      await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('23');
      await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('12');
      await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('1,9');

      // Verso 1: 12 fonéticas − 1 sinalefa («Qué_es») ± 0 (llana) = 11.
      await expect(metricasDe(page, 0)).toHaveText('11');
      await expect(nombreDe(page, 0)).toContainText('endecasílabo');
      await expect(desgloseDe(page, 0)).toContainText('12 fonéticas');
      await expect(desgloseDe(page, 0)).toContainText('1 sinalefa');
      await expect(desgloseDe(page, 0)).toContainText('llana');
      await expect(sinalefasDe(page, 0)).toHaveCount(1);
      await expect(sinalefasDe(page, 0).first()).toContainText('Qué');

      // Verso 2: 11 fonéticas − 1 sinalefa («pupila_azul») + 1 (aguda) = 11.
      await expect(metricasDe(page, 1)).toHaveText('11');
      await expect(nombreDe(page, 1)).toContainText('endecasílabo');
      await expect(desgloseDe(page, 1)).toContainText('11 fonéticas');
      await expect(desgloseDe(page, 1)).toContainText('+ 1');
      await expect(desgloseDe(page, 1)).toContainText('aguda');
      await expect(sinalefasDe(page, 1)).toHaveCount(1);
      await expect(sinalefasDe(page, 1).first()).toContainText('azul');
    });

    test('CASO 2 (límite) · diptongo ortográfico con tilde, cerradas iguales, triptongo, cinco consonantes y final esdrújulo', async ({
      page,
    }) => {
      await analizar(page, 'casuístico friísimo despreciáis angstrom');

      // OLE 2010: dos cerradas DISTINTAS son diptongo aunque una lleve tilde → ca-suís-ti-co.
      await expect(silabasDe(page, 0)).toHaveText(['ca', 'suís', 'ti', 'co']);
      await expect(page.locator('[class*="palabraCard"]').nth(0)).toContainText('Diptongo: uí');
      // Y dos cerradas IGUALES son hiato aunque una lleve tilde → fri-í-si-mo.
      await expect(silabasDe(page, 1)).toHaveText(['fri', 'í', 'si', 'mo']);
      await expect(page.locator('[class*="palabraCard"]').nth(1)).toContainText('Hiato: i-í');
      // Triptongo «iái»; de «spr» solo «pr» puede abrir sílaba.
      await expect(silabasDe(page, 2)).toHaveText(['des', 'pre', 'ciáis']);
      await expect(page.locator('[class*="palabraCard"]').nth(2)).toContainText('Triptongo: iái');
      // Cinco consonantes seguidas: a la derecha pasa «tr» y nada más.
      await expect(silabasDe(page, 3)).toHaveText(['angs', 'trom']);
      await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('13');

      // Final ESDRÚJULO: el ajuste resta. 11 fonéticas − 1 sinalefa − 1 = 9.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'La niña ya no oye la música');
      await expect(silabasDe(page, 4)).toHaveText(['o', 'ye']); // la «y» ante vocal es consonante
      await expect(silabasDe(page, 6)).toHaveText(['mú', 'si', 'ca']);
      await expect(metricasDe(page)).toHaveText('9');
      await expect(nombreDe(page)).toContainText('eneasílabo');
      await expect(desgloseDe(page)).toContainText('11 fonéticas');
      await expect(desgloseDe(page)).toContainText('1 sinalefa');
      await expect(desgloseDe(page)).toContainText('esdrújula');
      await expect(sinalefasDe(page)).toHaveCount(1);
      await expect(sinalefasDe(page).first()).toContainText('oye');
    });

    test('CASO 3 (aparte) · una palabra sin vocales, un diptongo sin tilde y una línea sin letras', async ({
      page,
    }) => {
      // Sin ninguna vocal no hay sílaba que partir: el motor devuelve la palabra entera y no
      // inventa encuentros vocálicos. Con una sola palabra tampoco abre el bloque de métrica.
      await analizar(page, 'psst');
      await expect(silabasDe(page, 0)).toHaveText(['psst']);
      await expect(totalDe(page, 0)).toHaveText('1 sílaba');
      await expect(page.locator('[class*="palabraEncuentros"]')).toHaveCount(0);
      await expect(page.locator('[class*="versoCard"]')).toHaveCount(0);

      // «maiz» sin tilde: «ai» es diptongo, así que es UNA sílaba. Ninguna sílaba del español
      // puede quedarse sin vocal, que es lo que declara el propio FAQPage de la app.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'maiz');
      await expect(silabasDe(page, 0)).toHaveText(['maiz']);
      await expect(totalDe(page, 0)).toHaveText('1 sílaba');
      await expect(page.locator('[class*="palabraCard"]').nth(0)).toContainText('Diptongo: ai');

      // Ni una letra: aviso explícito, sin resumen y sin tarjetas.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, '~~~ ¿¿?? ¡¡!! «» ///');
      await expect(page.getByText('No hay ninguna palabra que analizar')).toBeVisible();
      await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
      await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);
    });

    // -----------------------------------------------------------------------------------
    // HALLAZGOS 10/09/2026 — con test.fail(), afirmando lo que DEBERÍA ocurrir.
    // Al repararlos, quitar la marca DESPUÉS de comprobar que lo que afirman sigue siendo
    // lo correcto: un test.fail() que pasa a verde no prueba nada hasta verificar su
    // contenido (regla de la ronda 1).
    // -----------------------------------------------------------------------------------

    test('HALLAZGO · la tarjeta «la tilde sobre i/u» declara sin excepciones una regla que el motor no aplica', async ({
      page,
    }) => {
      // Lo que la app hace, y hace bien (OLE 2010): dos vocales cerradas DISTINTAS forman
      // diptongo a efectos ortográficos aunque una lleve tilde.
      await analizar(page, 'casuístico cuídate lingüística');
      await expect(silabasDe(page, 0)).toHaveText(['ca', 'suís', 'ti', 'co']);
      await expect(page.locator('[class*="palabraCard"]').nth(0)).toContainText('Diptongo: uí');
      await expect(silabasDe(page, 1)).toHaveText(['cuí', 'da', 'te']);
      await expect(silabasDe(page, 2)).toHaveText(['lin', 'güís', 'ti', 'ca']);

      // Y lo que enseña dos pantallas más abajo: «Regla sin excepciones: si la i o la u
      // llevan tilde (í, ú), siempre forman hiato con la vocal adyacente». La excepción está
      // rotulada por la propia app en la misma sesión, tres veces.
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const tarjeta = (
        await page.getByText(/La tilde sobre i\/u .*rompe el diptongo/).locator('xpath=..').innerText()
      ).replace(/\s+/g, ' ');
      expect(tarjeta).not.toContain('Regla sin excepciones');
      expect(tarjeta).toContain('distinta'); // la excepción de las dos cerradas distintas
    });

    test('HALLAZGO · esa misma tarjeta escribe «mai-z», una sílaba sin ninguna vocal', async ({
      page,
    }) => {
      // El motor acierta: «ai» es diptongo, «maiz» es UNA sílaba.
      await analizar(page, 'maiz');
      await expect(silabasDe(page, 0)).toHaveText(['maiz']);

      // La tarjeta enseña «"Maiz" hipotéticamente sería mai-z (diptongo)»: una partición en la
      // que la segunda parte, «z», no tiene vocal. Es exactamente lo que el FAQPage de la app
      // declara imposible («cada sílaba debe contener al menos una vocal») y lo que se reparó
      // en el hallazgo 207, cuando «aquí» salía a-qu-í.
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const tarjeta = (
        await page.getByText(/La tilde sobre i\/u .*rompe el diptongo/).locator('xpath=..').innerText()
      ).replace(/\s+/g, ' ');
      expect(tarjeta).not.toContain('mai-z');

      const faq = await leerFaqJsonLd(page);
      const separacion = faq.find((q) => q.pregunta.includes('¿Cómo se separan las sílabas'));
      expect(separacion?.respuesta).toContain('al menos una vocal'); // esto sí lo dice
    });

    test('HALLAZGO · la FAQ visible deja al octosílabo fuera del arte menor y del arte mayor', async ({
      page,
    }) => {
      // La app rotula el octosílabo como arte MENOR, igual que su código (`>= 9 → mayor`),
      // igual que la nota «Cómo se lee» del bloque de rima («arte mayor: nueve sílabas o
      // más») e igual que el FAQPage del JSON-LD («arte menor: ocho o menos»).
      await analizar(page, 'Ya no quiero estar aquí');
      await expect(metricasDe(page)).toHaveText('8');
      await expect(nombreDe(page)).toContainText('octosílabo');
      await expect(nombreDe(page)).toContainText('arte menor');

      // La FAQ visible dice «Los versos de menos de 8 sílabas se llaman de arte menor; los de
      // 9 o más, de arte mayor», y deja sin clasificar justo el verso que ese mismo párrafo
      // llama «el más tradicional, base del romance y la copla».
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const pregunta = page.getByText('¿Cuáles son los tipos de verso más comunes en español?');
      await pregunta.click();
      const respuesta = (await pregunta.locator('xpath=..').innerText()).replace(/\s+/g, ' ');
      expect(respuesta).not.toContain('menos de 8');
      expect(respuesta).toContain('ocho o menos'); // lo que ya dice bien el JSON-LD
    });

    test('HALLAZGO · el mnemotécnico de vocales fuertes y débiles coloca la O entre las débiles', async ({
      page,
    }) => {
      // El motor trata la «o» como abierta: «poeta» es po-e-ta y la tarjeta lo rotula
      // «Hiato: o-e», que solo se produce entre dos abiertas.
      await analizar(page, 'poeta');
      await expect(silabasDe(page, 0)).toHaveText(['po', 'e', 'ta']);
      await expect(page.locator('[class*="palabraCard"]').nth(0)).toContainText('Hiato: o-e');

      // El consejo enseña lo contrario dentro de la misma frase: «"A-E-IO-U: las Aplicadas Es
      // los fuertes, IO-U los débiles" (a, e, o = fuertes; i, u = débiles)». El propio
      // mnemotécnico —que es lo que un estudiante memoriza— mete la O en el grupo de las
      // débiles, y encima la frase que lo desarrolla no significa nada.
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const tarjeta = (
        await page.getByText('Recuerda las vocales fuertes y débiles').locator('xpath=..').innerText()
      ).replace(/\s+/g, ' ');
      expect(tarjeta).not.toContain('IO-U los débiles');
    });

    test('HALLAZGO · la h final no se trata como muda: «oh alma» no funde y «la hoja» sí', async ({
      page,
    }) => {
      // Testigo de que la app SÍ aplica la regla por el lado de la h inicial:
      // la(1) ho-ja(2) al-ta(2) = 5 − 2 sinalefas = 3.
      await analizar(page, 'la hoja alta');
      await expect(sinalefasDe(page)).toHaveCount(2);
      await expect(metricasDe(page)).toHaveText('3');

      // Por el otro lado no. La h no representa ningún sonido en español (OLE 2010), así que
      // «oh» suena [o] y su vocal final está en contacto con la «a» de «alma»: hay sinalefa.
      // oh(1) al-ma(2) mí-a(2) = 5 fonéticas − 1 sinalefa ± 0 (llana) = 4, tetrasílabo.
      // `terminaEnVocal()` mira el último CARÁCTER y ve una «h», mientras su hermana
      // `empiezaPorVocal()` sí salta la h inicial: la misma regla, aplicada por un solo lado.
      // El universo práctico son las interjecciones («oh», «ah», «eh»), donde el poeta deshace
      // a menudo la fusión — pero la app declara detectar «toda sinalefa posible» y marcar
      // «con pausa» las deshacibles, y aquí ni siquiera llega a verla.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'oh alma mía');
      await expect(sinalefasDe(page)).toHaveCount(1); // obtenido: 0
      await expect(metricasDe(page)).toHaveText('4'); // obtenido: 5, pentasílabo
    });

    test('HALLAZGO · la diéresis poética sobre la i parte la palabra en dos palabras inventadas', async ({
      page,
    }) => {
      // El extractor de palabras es /[a-záéíóúüñ]+/gi, y la «ï» no está en esa clase. La app
      // promociona la diéresis en su bloque educativo («"suave" en verso puede leerse
      // su-a-ve»), y la diéresis sobre la i se escribe exactamente así: vïuda, crïado,
      // sïempre. Al no reconocer el carácter, «vïuda» se parte en «v» + «uda»: dos palabras
      // que no existen, una de ellas con una «sílaba» sin ninguna vocal — lo mismo que el
      // FAQPage de la app declara imposible.
      // Esperado: 4 palabras (la · vïuda · del · rey), con «vïuda» entera.
      await analizar(page, 'la vïuda del rey');
      await expect(page.locator('[class*="palabraCard"]')).toHaveCount(4); // obtenido: 5
      await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('4'); // obtenido: 5
      await expect(page.locator('[class*="palabraCard"]').nth(1)).toContainText('vïuda');
      // Y ninguna tarjeta puede ser una consonante suelta contada como una sílaba.
      const palabras = await page.locator('[class*="palabraOriginal"]').allTextContents();
      expect(palabras).not.toContain('v'); // obtenido: ['la', 'v', 'uda', 'del', 'rey']
    });
  });
});

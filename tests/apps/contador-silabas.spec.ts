import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — contador-silabas (segmento interactiva con motor lingüístico)
 *
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
 * HALLAZGOS: al final del fichero, los de las dos inspecciones, todos REPARADOS y como
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
    await expect(silabasDe(page, 3)).toHaveText(['u', 'ru', 'guay']); // uay: triptongo (la y suena /i/)
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
      await expect(silabasDe(page, 0)).toHaveText(['el']);
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

    test.fail(
      'CASO 2 (límite) · HALLAZGO · dos vocales cerradas IGUALES son hiato, no diptongo',
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
      await expect(silabasDe(page, 2)).toHaveText(['o', 'nu']);
    });

    test.fail(
      'CASO 3 (especial) · HALLAZGO · las sílabas deberían conservar las mayúsculas del original',
      async ({ page }) => {
        // `separarSilabas()` hace `palabra.toLowerCase()` y devuelve el texto ya en minúscula,
        // así que la app no separa el texto del usuario: lo reescribe. Quien pega un verso o
        // un nombre propio ve «ma-rí-a» y «mur-cié-la-go» debajo de «María» y «MURCIÉLAGO».
        await analizar(page, 'María MURCIÉLAGO');
        await expect(silabasDe(page, 0)).toHaveText(['Ma', 'rí', 'a']); // obtenido: ma-rí-a
        await expect(silabasDe(page, 1)).toHaveText(['MUR', 'CIÉ', 'LA', 'GO']); // obtenido: minúsculas
      }
    );

    test.fail(
      'CASO 3 (especial) · HALLAZGO · «DNI» se cuenta como 1 sílaba y ninguna sílaba puede empezar por «dn»',
      async ({ page }) => {
        // `separarSilabas()` corta por el atajo `nuc.length === 1 → return [palabra]`, que está
        // pensado para lo que no tiene ninguna vocal (psst) pero también atrapa a las siglas
        // deletreadas: «dni» sale como una única sílaba, con un ataque imposible en español.
        // Leída como se lee (de-e-ne-i) son cuatro. El bloque «Limitaciones del algoritmo»
        // enumera prefijos, nombres extranjeros y «ui/iu», pero no menciona las siglas.
        await analizar(page, 'DNI');
        await expect(totalDe(page, 0)).toHaveText('4 sílabas'); // obtenido: «dni», 1 sílaba
      }
    );
  });
});

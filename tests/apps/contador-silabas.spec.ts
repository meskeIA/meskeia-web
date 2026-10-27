import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion as esperarHidratacionReact, esperarValorEnReact } from './_hidratacion';
import { acentuacionDe, analizarVerso, separarSilabas } from '../../app/contador-silabas/metrica';

/**
 * Inspector — contador-silabas (segmento interactiva con motor lingüístico)
 *
 * SÉPTIMA INSPECCIÓN: 27/10/2026, RE-INSPECCIÓN por los cinco cabos de la medición del
 * 18/10/2026 (C0287-C0291, semilla S0212). Sus casos y sus hallazgos, ABIERTOS con
 * test.fail(), en el último bloque del fichero.
 * SEXTA INSPECCIÓN: 30/09/2026, por la SOSPECHA del 29/09 sobre `acentuacionDe` y los
 * anglicismos en consonante + «y». Sus casos y sus TRES hallazgos, en su propio bloque al
 * final del fichero (el único que espera la hidratación con tests/apps/_hidratacion.ts).
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
  // HALLAZGOS de esta ronda (698-703): los seis del final. Se escribieron con test.fail(),
  // afirmando lo que DEBERÍA ocurrir; se REPARARON el 10/09/2026 (43473556) y quedan como
  // regresión, sin la marca. Cinco eran del material didáctico y uno del extractor de palabras.
  // La sexta inspección (30/09/2026) los re-verificó en verde y con entradas nuevas.
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
    // HALLAZGOS 698-703 (10/09/2026) — REPARADOS el 10/09/2026 (43473556). Se escribieron con
    // test.fail(), afirmando lo que DEBERÍA ocurrir, y se les quitó la marca tras comprobar
    // que lo que afirman sigue siendo lo correcto. Los «antes:» de los comentarios son lo que
    // la app daba ANTES de la reparación, no lo que da hoy.
    // -----------------------------------------------------------------------------------

    test('REPARADO 698 · la tarjeta «la tilde sobre i/u» declaraba sin excepciones una regla que el motor no aplica', async ({
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

    test('REPARADO 699 · esa misma tarjeta escribía «mai-z», una sílaba sin ninguna vocal', async ({
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

    test('REPARADO 700 · la FAQ visible dejaba al octosílabo fuera del arte menor y del arte mayor', async ({
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

    test('REPARADO 701 · el mnemotécnico de vocales fuertes y débiles colocaba la O entre las débiles', async ({
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

    test('REPARADO 702 · la h final no se trataba como muda: «oh alma» no fundía y «la hoja» sí', async ({
      page,
    }) => {
      // Testigo de que la app SÍ aplica la regla por el lado de la h inicial:
      // la(1) ho-ja(2) al-ta(2) del(1) ár-bol(2) = 8 − 2 sinalefas (la_hoja, hoja_alta) = 6, llana.
      // Era «la hoja alta» a secas; desde el hallazgo 3566, «alta» al FINAL del verso lleva el
      // acento rítmico y va en dialefa, así que la frase sigue para que «alta» quede dentro.
      await analizar(page, 'la hoja alta del árbol');
      await expect(sinalefasDe(page)).toHaveCount(2);
      await expect(metricasDe(page)).toHaveText('6');

      // Por el otro lado no lo hacía. La h no representa ningún sonido en español (OLE 2010), así que
      // «oh» suena [o] y su vocal final está en contacto con la «a» de «alma»: hay sinalefa.
      // oh(1) al-ma(2) mí-a(2) = 5 fonéticas − 1 sinalefa ± 0 (llana) = 4, tetrasílabo.
      // `terminaEnVocal()` miraba el último CARÁCTER y veía una «h», mientras su hermana
      // `empiezaPorVocal()` sí saltaba la h inicial: la misma regla, aplicada por un solo lado.
      // El universo práctico son las interjecciones («oh», «ah», «eh»), donde el poeta deshace
      // a menudo la fusión — pero la app declara detectar «toda sinalefa posible» y marcar
      // «con pausa» las deshacibles, y aquí ni siquiera llega a verla.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await analizar(page, 'oh alma mía');
      await expect(sinalefasDe(page)).toHaveCount(1); // antes de 43473556: 0
      await expect(metricasDe(page)).toHaveText('4'); // antes de 43473556: 5, pentasílabo
    });

    test('REPARADO 703 · la diéresis poética sobre la i partía la palabra en dos palabras inventadas', async ({
      page,
    }) => {
      // El extractor de palabras ERA /[a-záéíóúüñ]+/gi (hoy «\p{L}+», toda letra), sin la «ï». La app
      // promociona la diéresis en su bloque educativo («"suave" en verso puede leerse
      // su-a-ve»), y la diéresis sobre la i se escribe exactamente así: vïuda, crïado,
      // sïempre. Al no reconocer el carácter, «vïuda» se partía en «v» + «uda»: dos palabras
      // que no existen, una de ellas con una «sílaba» sin ninguna vocal — lo mismo que el
      // FAQPage de la app declara imposible.
      // Esperado: 4 palabras (la · vïuda · del · rey), con «vïuda» entera.
      await analizar(page, 'la vïuda del rey');
      await expect(page.locator('[class*="palabraCard"]')).toHaveCount(4); // antes de 43473556: 5
      await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('4'); // antes de 43473556: 5
      await expect(page.locator('[class*="palabraCard"]').nth(1)).toContainText('vïuda');
      // Y ninguna tarjeta puede ser una consonante suelta contada como una sílaba.
      const palabras = await page.locator('[class*="palabraOriginal"]').allTextContents();
      expect(palabras).not.toContain('v'); // antes de 43473556: ['la', 'v', 'uda', 'del', 'rey']
    });
  });
});

// =====================================================================================
// SEXTA INSPECCIÓN — Inspector 30/09/2026 (segmento cálculo, riesgo 3)
//
// Entra por una SOSPECHA del 29/09: `acentuacionDe` (metrica.ts, compartida con
// diccionario-rimas) aplica la regla ortográfica de la «y» final —cuenta como consonante,
// así que sin tilde la palabra sería AGUDA: rey, virrey, jersey, Uruguay— también a los
// anglicismos en CONSONANTE + «y» (ferry, whisky, rugby, party). Esa regla está hecha para
// la «y» tras vocal; tras consonante no existe ninguna palabra española, y esos préstamos se
// pronuncian LLANOS con /i/ final. diccionario-rimas lo corrigió solo en su lado
// (`esAnglicismoEnY`, aed01c6b); aquí seguía sin medir.
//
// De dónde sale el acento esperado (no de la memoria del modelo):
//   · Las formas adaptadas que propone la RAE se escriben SIN tilde y acaban en vocal —ferri,
//     güisqui, rugbi—, y por la regla general de la OLE 2010 eso las hace LLANAS: si fueran
//     agudas se escribirían «ferrí», «güisquí». La misma app lo confirma: «ferri» le da llana.
//   · «rugby»: Wikcionario, [ˈraɣ.βi], «acentuación: llana», variante «rugbi».
// Y de la métrica: verso llano ±0, agudo +1, esdrújulo −1; una sinalefa por contacto vocálico.
//
// LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
//
//   CASO 1 (normal) — Garcilaso, soneto XXIII, versos 3 y 4:
//       «y que vuestro mirar ardiente, honesto,» → y(1) que(1) vues-tro(2) mi-rar(2)
//           ar-dien-te(3) ho-nes-to(3) = 12 fonéticas. Un solo contacto vocálico, «ardiente,
//           honesto» (la h es muda y no encabeza hue-/hui-/hie-/huy-), y con coma en medio:
//           sinalefa CON PAUSA. «mirar ardiente» no funde: «mirar» acaba en r. «honesto» es
//           llana (acaba en vocal, sin tilde) → ±0. 12 − 1 = 11, endecasílabo.
//       «con clara luz la tempestad serena;» → con(1) cla-ra(2) luz(1) la(1) tem-pes-tad(3)
//           se-re-na(3) = 11 fonéticas, ningún contacto vocal-vocal, llana → 11.
//       Texto entero: 12 + 11 = 23 sílabas en 12 palabras → 1,916… → «1,9».
//
//   CASO 2 (límite) — la regla de la «y» final donde SÍ vale, y la forma adaptada:
//       «cruzamos el mar en ferri» → cru-za-mos(3) el(1) mar(1) en(1) fe-rri(2) = 8, sin
//           sinalefas (s, l, r y n finales), «ferri» llana → 8, octosílabo.
//       «y cruzó el mar el virrey» → y(1) cru-zó(2) el(1) mar(1) el(1) vi-rrey(2) = 8; una
//           sinalefa, «cruzó_el»; «virrey» es aguda —la «y» tras vocal cuenta como consonante
//           y por eso no lleva tilde— → +1. 8 − 1 + 1 = 8, octosílabo.
//
//   CASO 3 (rechazo) — el campo vacío, solo espacios y saltos, y una línea sin letras
//       («2026 — 3,14 % ¿¡!?»): los dos primeros no calculan nada (se queda el marcador
//       «Introduce un texto…»); el tercero da el aviso explícito de que no hay palabras.
//
//   RE-INSPECCIÓN de 43473556 (hallazgos 702 y 703) con entradas nuevas:
//       «eh amigo mío» → eh(1) a-mi-go(3) mí-o(2) = 6; la h final es muda: «eh_amigo» funde;
//           «mío» llana por la tilde en la penúltima → 6 − 1 = 5, pentasílabo.
//       «el fiel crïado» → la diéresis poética rompe el diptongo: crï-a-do(3); el(1) fiel(1)
//           → 5 fonéticas, sin contactos, llana → 5; TRES palabras, «crïado» entera.
//
//   HALLAZGO (sospecha convertida) — los mismos versos con el anglicismo:
//       «cruzamos el mar en ferry»    8 fonéticas, 0 sinalefas, llana → 8 · la app: 9
//       «y un vaso lleno de whisky»   9 fonéticas − 1 («y_un»; «de whisky» no funde: [ˈgwis-])
//                                     ± 0 → 8 · la app: 9
//       «los chicos juegan al rugby»  8 fonéticas, 0 sinalefas, llana → 8 · la app: 9
//
// DESCARTADO como hallazgo aparte, con la medida: «los chicos juegan al hockey» da 9 (aguda),
// y pronunciado [ˈxo.kei] serían 8. Pero ahí la «y» va tras VOCAL, que es justo donde la
// regla de la OLE sí vale (rey, virrey, jersey son agudas; póney y yóquey llevan tilde por ser
// llanas): «hockey» crudo se escribe igual que «jersey» y ninguna regla los separa sin un
// léxico. Cae en la limitación declarada de «nombres propios y extranjerismos».
// =====================================================================================

test.describe('contador-silabas · Inspector 30/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    // El textarea es controlado: cuando React le ha montado su rastreador, ya escucha.
    await esperarHidratacionReact(page, ['textarea']);
  });

  /** Escribe el texto, comprueba que llegó al ESTADO de React y pulsa «Analizar Sílabas». */
  async function analizarConEstado(page: Page, texto: string): Promise<void> {
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await esperarValorEnReact(page, 'textarea', '');
    await page.fill('textarea', texto);
    await esperarValorEnReact(page, 'textarea', texto);
    await page.getByRole('button', { name: 'Analizar Sílabas' }).click();
  }

  test('CASO 1 (normal) · dos endecasílabos de Garcilaso: sinalefa con pausa y la h muda', async ({
    page,
  }) => {
    await analizarConEstado(
      page,
      'y que vuestro mirar ardiente, honesto,\ncon clara luz la tempestad serena;',
    );

    await expect(silabasDe(page, 2)).toHaveText(['vues', 'tro']);
    await expect(silabasDe(page, 4)).toHaveText(['ar', 'dien', 'te']);
    await expect(silabasDe(page, 5)).toHaveText(['ho', 'nes', 'to']);
    await expect(silabasDe(page, 10)).toHaveText(['tem', 'pes', 'tad']);

    // 23 sílabas en 12 palabras → 1,9 con coma decimal.
    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('23');
    await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('12');
    await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('1,9');

    // Verso 3: 12 − 1 («ardiente, honesto», con pausa) ± 0 = 11.
    await expect(metricasDe(page, 0)).toHaveText('11');
    await expect(nombreDe(page, 0)).toContainText('endecasílabo');
    await expect(nombreDe(page, 0)).toContainText('arte mayor');
    await expect(desgloseDe(page, 0)).toContainText('12 fonéticas');
    await expect(desgloseDe(page, 0)).toContainText('1 sinalefa');
    await expect(desgloseDe(page, 0)).toContainText('llana');
    await expect(sinalefasDe(page, 0)).toHaveCount(1);
    await expect(sinalefasDe(page, 0).first()).toContainText('ardiente');
    await expect(sinalefasDe(page, 0).first()).toContainText('honesto');
    await expect(sinalefasDe(page, 0).first()).toContainText('con pausa');

    // Verso 4: 11 fonéticas, ningún contacto, llana = 11.
    await expect(metricasDe(page, 1)).toHaveText('11');
    await expect(nombreDe(page, 1)).toContainText('endecasílabo');
    await expect(desgloseDe(page, 1)).toContainText('11 fonéticas');
    await expect(desgloseDe(page, 1)).toContainText('llana');
    await expect(sinalefasDe(page, 1)).toHaveCount(0);
  });

  test('CASO 2 (límite) · la «y» final tras vocal hace aguda; la forma adaptada «ferri» es llana', async ({
    page,
  }) => {
    await analizarConEstado(page, 'cruzamos el mar en ferri\ny cruzó el mar el virrey');

    await expect(silabasDe(page, 4)).toHaveText(['fe', 'rri']);
    await expect(silabasDe(page, 10)).toHaveText(['vi', 'rrey']);

    // «ferri»: 8 fonéticas, sin sinalefas, llana ±0 = 8.
    await expect(metricasDe(page, 0)).toHaveText('8');
    await expect(nombreDe(page, 0)).toContainText('octosílabo');
    await expect(desgloseDe(page, 0)).toContainText('8 fonéticas');
    await expect(desgloseDe(page, 0)).toContainText('± 0');
    await expect(desgloseDe(page, 0)).toContainText('llana');
    await expect(sinalefasDe(page, 0)).toHaveCount(0);

    // «virrey»: 8 fonéticas − 1 («cruzó_el») + 1 (aguda) = 8.
    await expect(metricasDe(page, 1)).toHaveText('8');
    await expect(nombreDe(page, 1)).toContainText('octosílabo');
    await expect(desgloseDe(page, 1)).toContainText('1 sinalefa');
    await expect(desgloseDe(page, 1)).toContainText('+ 1');
    await expect(desgloseDe(page, 1)).toContainText('aguda');
    await expect(sinalefasDe(page, 1)).toHaveCount(1);
    await expect(sinalefasDe(page, 1).first()).toContainText('cruzó');
  });

  test('CASO 3 (rechazo) · vacío y espacios no calculan; sin letras, aviso explícito', async ({
    page,
  }) => {
    for (const vacio of ['', '   \n   ']) {
      await analizarConEstado(page, vacio);
      await expect(page.getByText('Introduce un texto para analizar sus sílabas')).toBeVisible();
      await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
      await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);
    }

    await analizarConEstado(page, '2026 — 3,14 % ¿¡!?');
    await expect(page.getByText('No hay ninguna palabra que analizar')).toBeVisible();
    await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);
    await expect(page.locator('[class*="versoCard"]')).toHaveCount(0);
  });

  test('RE-INSPECCIÓN · 702 y 703 (43473556) siguen reparados, con entradas nuevas', async ({
    page,
  }) => {
    // 702 · la h final es muda: «eh_amigo» funde. 6 − 1 ± 0 = 5.
    await analizarConEstado(page, 'eh amigo mío');
    await expect(metricasDe(page)).toHaveText('5');
    await expect(nombreDe(page)).toContainText('pentasílabo');
    await expect(desgloseDe(page)).toContainText('6 fonéticas');
    await expect(sinalefasDe(page)).toHaveCount(1);
    await expect(sinalefasDe(page).first()).toContainText('eh');
    await expect(sinalefasDe(page).first()).toContainText('amigo');

    // 703 · «crïado» es UNA palabra, y la diéresis parte el diptongo: crï-a-do.
    await analizarConEstado(page, 'el fiel crïado');
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(3);
    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('5');
    await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('3');
    await expect(silabasDe(page, 2)).toHaveText(['crï', 'a', 'do']);
    await expect(metricasDe(page)).toHaveText('5');
  });

  // -----------------------------------------------------------------------------------
  // HALLAZGOS 30/09/2026 (2463-2465) — REPARADOS el mismo 30/09/2026. Se escribieron con
  // test.fail(), afirmando lo que DEBERÍA ocurrir; se les quitó la marca tras comprobar que
  // lo que afirman sigue siendo lo correcto, y quedan como regresión.
  // -----------------------------------------------------------------------------------

  test('HALLAZGO 2463 (reparado) · un anglicismo en consonante + «y» al final del verso es llano (±0)', async ({
    page,
  }) => {
    // REPARADO el 30/09/2026. La partición era correcta; fallaba el acento: `acentuacionDe` veía
    // la «y» final como consonante y, sin tilde, declaraba aguda la palabra, así que el mismo
    // verso medía 8 con «ferri» (CASO 2) y 9 con «ferry», que se pronuncian igual. Ahora la «y»
    // tras consonante se trata como la vocal [i] que suena; tras vocal (rey, jersey) sigue la
    // regla escrita — lo fija el test de motor que va detrás de este bloque.
    await analizarConEstado(
      page,
      'cruzamos el mar en ferry\ny un vaso lleno de whisky\nlos chicos juegan al rugby',
    );
    await expect(silabasDe(page, 4)).toHaveText(['fe', 'rry']);
    await expect(silabasDe(page, 10)).toHaveText(['whis', 'ky']);
    await expect(silabasDe(page, 15)).toHaveText(['rug', 'by']);

    // Los tres versos ya pintados; se leen de una vez para que el fallo enseñe las tres cifras
    // (y no espere tres veces el tiempo de reintento de un toHaveText).
    await expect(page.locator('[class*="versoCard"]')).toHaveCount(3);
    await expect(desgloseDe(page, 1)).toContainText('1 sinalefa'); // «y_un», esto sí lo hace
    const medidas = await page
      .locator('[class*="versoCard"]')
      .evaluateAll((versos) =>
        versos.map((v) => ({
          metricas: v.querySelector('[class*="versoSilabas"]')?.textContent ?? '',
          llana: (v.querySelector('[class*="versoDesglose"]')?.textContent ?? '').includes('llana'),
        })),
      );
    // ferry: 8 fonéticas ± 0 = 8 · whisky: 9 − 1 ± 0 = 8 · rugby: 8 ± 0 = 8, las tres llanas.
    // Antes de la reparación: 9, 9 y 9, las tres con «+ 1 (última palabra aguda)».
    expect(medidas).toEqual([
      { metricas: '8', llana: true },
      { metricas: '8', llana: true },
      { metricas: '8', llana: true },
    ]);
  });

  test('HALLAZGO 2464 (reparado) · los 11 iconos del bloque educativo ya no se leen antes de cada titular', async ({
    page,
  }) => {
    // REPARADO el 30/09/2026: los 11 llevan ahora aria-hidden="true". Lo que se vio: 🎭 📚 🎵 🌍 (usos), 🗣️ 🔤 📌 ✍️ 🎯 📖 (consejos) y ⚠️ (limitaciones) van en su
    // propio <span> sin aria-hidden: el árbol de accesibilidad los exponía como texto
    // («text: 🎭») justo antes del <h4>. Son decorativos —el titular ya lo dice todo—, así que
    // un lector de pantalla anunciaba «máscaras de teatro» antes de «Poesía y Métrica Española».
    // Es el hallazgo 709 de generador-anagramas, reparado allí en 43473556.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByRole('heading', { name: 'Poesía y Métrica Española' })).toBeVisible();
    const sinOcultar = await page
      .locator('[class*="eduEscenarioIcon"], [class*="eduTipIcono"], [class*="warningIcono"]')
      .evaluateAll((iconos) =>
        iconos.filter((el) => el.getAttribute('aria-hidden') !== 'true').map((el) => el.textContent),
      );
    expect(sinOcultar).toEqual([]); // antes de la reparación: los 11 iconos
  });

  test('HALLAZGO 2465 (reparado) · el chip de diptongo tiene relleno también en claro', async ({
    page,
  }) => {
    // REPARADO el 30/09/2026: `.encuentro` declaraba `background: var(--bg-secondary)` y
    // globals.css no define ese token (tiene --bg-primary y --bg-card): una var() sin definir y
    // sin reserva anula la declaración, y en claro el chip se quedaba TRANSPARENTE, solo con el
    // borde, mientras el oscuro sí tenía relleno (rgba literal). Ahora usa --bg-card, blanco
    // sobre el --bg-primary de la tarjeta de palabra. Era uno de los nombres sueltos de la
    // sospecha transversal del 28/09 (var() sin definir).
    await analizarConEstado(page, 'murciélago');
    const chip = page.locator('[class*="palabraEncuentros"] > span').first();
    await expect(chip).toContainText('Diptongo');
    const tema = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(tema).not.toBe('dark');
    const fondo = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fondo).not.toBe('rgba(0, 0, 0, 0)'); // antes de la reparación: rgba(0, 0, 0, 0)
    expect(fondo).toBe('rgb(255, 255, 255)'); // --bg-card en claro
  });
});

/**
 * Motor · la «y» final tras VOCAL sigue siendo aguda; tras CONSONANTE, llana (hallazgo 2463).
 *
 * La reparación de 2463 no podía romper lo que ya estaba bien. A mano, por la OLE 2010:
 *   · «y» tras vocal cierra diptongo o triptongo y cuenta como consonante para la tilde, así
 *     que sin tilde son AGUDAS: rey y ley (monosílabos), jer-sey, vi-rrey, es-toy, U-ru-guay,
 *     Pa-ra-guay. «hockey» (hoc-key) cae aquí por escritura: limitación declarada, igual que
 *     en la sexta inspección.
 *   · «y» tras consonante suena [i] y la palabra acaba en vocal: LLANAS ferry, whisky, rugby,
 *     party, como sus formas adaptadas ferri, güisqui, rugbi (sin tilde).
 *   · la tilde escrita manda: pó-ney, yó-quey son llanas.
 * Y el verso del acta: «esta noche vamos a la party» → es-ta(2) no-che(2) va-mos(2) a(1) la(1)
 * par-ty(2) = 10 fonéticas; ningún contacto vocal-vocal («vamos a» acaba en s, «a la» empieza
 * por l); llana ±0 → 10, decasílabo (la app daba 11).
 */
test('motor 2463 · la «y» final: aguda tras vocal, llana tras consonante', () => {
  const acento = (palabra: string) => acentuacionDe(palabra, separarSilabas(palabra));
  for (const aguda of ['rey', 'ley', 'jersey', 'virrey', 'estoy', 'Uruguay', 'Paraguay', 'hockey']) {
    expect(acento(aguda), aguda).toBe('aguda');
  }
  for (const llana of ['ferry', 'whisky', 'rugby', 'party', 'ferri', 'güisqui', 'rugbi', 'póney', 'yóquey']) {
    expect(acento(llana), llana).toBe('llana');
  }
  const verso = analizarVerso('esta noche vamos a la party');
  expect(verso?.silabasFoneticas).toBe(10);
  expect(verso?.sinalefas).toHaveLength(0);
  expect(verso?.acentuacion).toBe('llana');
  expect(verso?.silabasMetricas).toBe(10);
  expect(verso?.nombre).toBe('decasílabo');
});

// =====================================================================================
// SÉPTIMA INSPECCIÓN — Inspector 27/10/2026 (segmento cálculo, riesgo 3)
//
// RE-INSPECCIÓN por los cinco cabos de la medición del 18/10/2026 (semilla S0212): C0287
// («y» final de diptongo ante vocal), C0288 (estrofa reconocida solo en primera posición),
// C0289 (rótulo «Cuaderna vía»), C0290 (versos compuestos sin cesura) y C0291 (prefijo sub-).
// Desde la sexta solo pasaron los commits de contraste de todo el catálogo (dfaf84a2,
// 4488bd1d), que no tocan ningún motor.
//
// DE DÓNDE SALEN LAS REGLAS (no de lo que pinta la app):
//   · Silabeo, h muda y diptongos: RAE, Ortografía de la lengua española (2010), cap. I.
//   · La «y» final de «hoy», «voy», «estoy», «soy» ANTE VOCAL pasa a consonante y abre la
//     sílaba siguiente (ho-yes, vo-yen-tran-do, so-yun): no queda ningún contacto vocálico,
//     así que no hay sinalefa ni se ahorra sílaba (Navarro Tomás, Manual de pronunciación
//     española; Quilis, Métrica española). La prueba de cargo es el soneto de Lope: catorce
//     endecasílabos que solo cuadran así.
//   · El alejandrino (7+7) y el dodecasílabo (6+6) son versos COMPUESTOS: cada hemistiquio se
//     mide como un verso, con su ajuste por acento final, y en la cesura no hay sinalefa
//     (Quilis, Métrica española).
//   · No hay sinalefa sobre la vocal que lleva el ACENTO FINAL del verso: «está | hecho» y
//     «de | oro» se leen en dialefa (Quilis; Navarro Tomás).
//   · La h de «hermosa» (< formosa) y de «hacer» (< facere) se aspiraba en tiempos de
//     Garcilaso e impedía la sinalefa: por eso su soneto XXIII es endecasílabo entero.
//
// LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (la cuenta, en cada test)
//   CASO 1 (normal)  Lope, v. 2: 15 fonéticas − 4 sinalefas = 11.
//   CASO 2 (límite)  la «y» final donde la regla SÍ vale: ante consonante y en final de verso.
//   CASO 3 (rechazo) el metro personalizado fuera de 2..20 (21, 1, 0) no arranca el medidor.
//   Y los cinco cabos, más tres hallazgos que salieron al medirlos (dialefa ante el acento
//   final, la h aspirada del banco de pruebas que propone la propia app y la FAQ del hiato).
// =====================================================================================

const SONETO_LOPE = `Un soneto me manda hacer Violante,
que en mi vida me he visto en tanto aprieto;
catorce versos dicen que es soneto,
burla burlando van los tres delante.

Yo pensé que no hallara consonante
y estoy a la mitad de otro cuarteto;
mas si me veo en el primer terceto,
no hay cosa en los cuartetos que me espante.

Por el primer terceto voy entrando,
y parece que entré con pie derecho,
pues fin con este verso le voy dando.

Ya estoy en el segundo, y aun sospecho
que voy los trece versos acabando;
contad si son catorce, y está hecho.`;

const REDONDILLAS_SOR_JUANA = `Hombres necios que acusáis
a la mujer sin razón,
sin ver que sois la ocasión
de lo mismo que culpáis:

si con ansia sin igual
solicitáis su desdén,
¿por qué queréis que obren bien
si las incitáis al mal?

Combatís su resistencia
y luego, con gravedad,
decís que fue liviandad
lo que hizo la diligencia.`;

const REDONDILLAS_MARTI = `Cultivo una rosa blanca,
en julio como en enero,
para el amigo sincero
que me da su mano franca.

Y para el cruel que me arranca
el corazón con que vivo,
cardo ni ortiga cultivo;
cultivo la rosa blanca.`;

const SERVENTESIOS_DARIO = `Yo soy aquel que ayer no más decía
el verso azul y la canción profana,
en cuya noche un ruiseñor había
que era alondra de luz por la mañana.

El dueño fui de mi jardín de sueño,
lleno de rosas y de cisnes vagos;
el dueño de las tórtolas, el dueño
de góndolas y liras en los lagos;`;

const SONATINA_ESTROFA_1 = `La princesa está triste... ¿qué tendrá la princesa?
Los suspiros se escapan de su boca de fresa,
que ha perdido la risa, que ha perdido el color.
La princesa está pálida en su silla de oro,
está mudo el teclado de su clave sonoro,
y en un vaso, olvidada, se desmaya una flor.`;

const RETRATO_MACHADO = `Mi infancia son recuerdos de un patio de Sevilla,
y un huerto claro donde madura el limonero;
mi juventud, veinte años en tierra de Castilla;
mi historia, algunos casos que recordar no quiero.

Ni un seductor Mañara, ni un Bradomín he sido
—ya conocéis mi torpe aliño indumentario—,
mas recibí la flecha que me asignó Cupido,
y amé cuanto ellas puedan tener de hospitalario.`;

const LIRAS_FRAY_LUIS = `Qué descansada vida
la del que huye del mundanal ruido,
y sigue la escondida
senda por donde han ido
los pocos sabios que en el mundo han sido;

que no le enturbia el pecho
de los soberbios grandes el estado,
ni del dorado techo
se admira, fabricado
del sabio moro, en jaspes sustentado.`;

const CUADERNA_DE_PRUEBA = `Por la vereda verde caminaba despacio
mirando los tejados del antiguo palacio,
y las nubes pasaban por el cielo de espacio
como barcos de lana sobre un mar de topacio.

Los niños en la plaza jugaban con las flores,
los viejos en los bancos contaban sus amores,
las madres desde lejos llamaban sin rencores
y el sol iba tiñendo la torre de colores.`;

const SONETO_GARCILASO_XXIII = `En tanto que de rosa y azucena
se muestra la color en vuestro gesto,
y que vuestro mirar ardiente, honesto,
con clara luz la tempestad serena;

y en tanto que el cabello, que en la vena
del oro se escogió, con vuelo presto
por el hermoso cuello blanco, enhiesto,
el viento mueve, esparce y desordena:

coged de vuestra alegre primavera
el dulce fruto antes que el tiempo airado
cubra de nieve la hermosa cumbre.

Marchitará la rosa el viento helado,
todo lo mudará la edad ligera
por no hacer mudanza en su costumbre.`;

test.describe('contador-silabas · Inspector 27/10/2026 (séptima inspección)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacionReact(page, ['textarea']);
  });

  /** Limpia, escribe el texto comprobando que llega al ESTADO de React y pulsa «Analizar». */
  async function analizarTexto(page: Page, texto: string): Promise<void> {
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await esperarValorEnReact(page, 'textarea', '');
    await page.fill('textarea', texto);
    await esperarValorEnReact(page, 'textarea', texto);
    await page.getByRole('button', { name: 'Analizar Sílabas' }).click();
  }

  /** Las sílabas métricas de cada verso pintado, en orden, una vez pintados los `n`. */
  async function medidas(page: Page, n: number): Promise<string[]> {
    await expect(page.locator('[class*="versoCard"]')).toHaveCount(n);
    return page
      .locator('[class*="versoCard"] [class*="versoSilabas"]')
      .evaluateAll((els) => els.map((el) => (el.textContent ?? '').trim()));
  }

  /** El nombre de la composición destacada («Soneto», «Silva»…), o '' si no hay ninguna. */
  async function composicion(page: Page): Promise<string> {
    await expect(page.locator('[class*="rimaBloque"]')).toBeVisible();
    const nombre = page.locator('[class*="estrofaDestacada"] [class*="estrofaNombre"]');
    return (await nombre.count()) === 0 ? '' : ((await nombre.textContent()) ?? '').trim();
  }

  /** Los nombres de la lista de estrofas firmes («Redondilla», «Serventesio»…), en orden. */
  async function estrofasNombradas(page: Page): Promise<string[]> {
    await expect(page.locator('[class*="rimaBloque"]')).toBeVisible();
    return page
      .locator('[class*="estrofasLista"] li strong')
      .evaluateAll((els) => els.map((el) => (el.textContent ?? '').trim()));
  }

  test('CASO 1 (normal) · Lope, v. 2: cuatro sinalefas, una con h muda, dan el endecasílabo', async ({
    page,
  }) => {
    // que(1) en(1) mi(1) vi-da(2) me(1) he(1) vis-to(2) en(1) tan-to(2) a-prie-to(3) = 15
    // fonéticas, 10 palabras → media 1,5. «pr» es grupo inseparable (a-prie-to) e «ie», diptongo.
    // Sinalefas: que_en, me_he (la h es muda y «he» no empieza por hue-/hui-/hie-/huy-),
    // visto_en y tanto_aprieto → −4. «aprieto» llana → ±0. 15 − 4 = 11, endecasílabo.
    await analizarTexto(page, 'que en mi vida me he visto en tanto aprieto;');

    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('15');
    await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('10');
    await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('1,5');
    await expect(silabasDe(page, 5)).toHaveText(['he']);
    await expect(silabasDe(page, 9)).toHaveText(['a', 'prie', 'to']);

    await expect(metricasDe(page)).toHaveText('11');
    await expect(nombreDe(page)).toContainText('endecasílabo');
    await expect(nombreDe(page)).toContainText('arte mayor');
    await expect(desgloseDe(page)).toContainText('15 fonéticas');
    await expect(desgloseDe(page)).toContainText('4 sinalefas');
    await expect(desgloseDe(page)).toContainText('llana');
    await expect(sinalefasDe(page)).toHaveCount(4);
    await expect(sinalefasDe(page).nth(1)).toContainText('me');
    await expect(sinalefasDe(page).nth(1)).toContainText('he');
  });

  test('CASO 2 (límite) · la «y» final donde la regla SÍ vale: ante consonante y al final del verso', async ({
    page,
  }) => {
    // Martí, «Yo soy un hombre sincero», y Lope, v. 11. Son la frontera del hallazgo C0287:
    // aquí la «y» final no toca ninguna vocal, y la app debe acertar.
    //   «Yo vengo de todas partes,»  Yo(1) ven-go(2) de(1) to-das(2) par-tes(2) = 8, sin
    //       contactos, llana → 8.
    //   «y hacia todas partes voy:»  y(1) ha-cia(2) to-das(2) par-tes(2) voy(1) = 8; la
    //       conjunción funde con «hacia» (h muda) → −1; «voy», monosílabo, cuenta aguda → +1 = 8.
    //   «pues fin con este verso le voy dando.» pues(1) fin(1) con(1) es-te(2) ver-so(2) le(1)
    //       voy(1) dan-do(2) = 11; «voy» ante «d»: ningún contacto; llana → 11.
    //   Texto entero: 8 + 8 + 11 = 27 sílabas en 5 + 5 + 8 = 18 palabras → 1,5.
    await analizarTexto(
      page,
      'Yo vengo de todas partes,\ny hacia todas partes voy:\npues fin con este verso le voy dando.',
    );

    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('27');
    await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('18');
    await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('1,5');
    await expect(silabasDe(page, 9)).toHaveText(['voy']);

    await expect(metricasDe(page, 0)).toHaveText('8');
    await expect(sinalefasDe(page, 0)).toHaveCount(0);
    await expect(desgloseDe(page, 0)).toContainText('llana');

    await expect(metricasDe(page, 1)).toHaveText('8');
    await expect(nombreDe(page, 1)).toContainText('octosílabo');
    await expect(sinalefasDe(page, 1)).toHaveCount(1);
    await expect(sinalefasDe(page, 1).first()).toContainText('hacia');
    await expect(desgloseDe(page, 1)).toContainText('+ 1');
    await expect(desgloseDe(page, 1)).toContainText('aguda');

    await expect(metricasDe(page, 2)).toHaveText('11');
    await expect(nombreDe(page, 2)).toContainText('endecasílabo');
    await expect(sinalefasDe(page, 2)).toHaveCount(0);
  });

  test('CASO 3 (rechazo) · el metro personalizado fuera de 2..20 no arranca el medidor; 20 sí', async ({
    page,
  }) => {
    // El formulario solo acepta enteros de 2 a 20 (`n >= 2 && n <= 20`, y min/max en el input).
    // 21, 1 y 0 no deben fijar nada: ni medidor ni botón «Desactivar».
    const metro = page.getByPlaceholder('ej. 6');
    for (const fuera of ['21', '1', '0']) {
      await metro.fill(fuera);
      await esperarValorEnReact(page, '#metro-personalizado', fuera);
      await page.getByRole('button', { name: 'Fijar' }).click();
      await expect(page.locator('[class*="medidorVivo"]'), fuera).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Desactivar' }), fuera).toHaveCount(0);
    }

    // El extremo de arriba es válido. El(1) cam-po(2) ver-de(2) = 5, llana → 5; faltan 20 − 5 = 15.
    await metro.fill('20');
    await esperarValorEnReact(page, '#metro-personalizado', '20');
    await page.getByRole('button', { name: 'Fijar' }).click();
    await expect(page.locator('[class*="medidorVivo"]')).toHaveCount(1);
    await page.fill('textarea', 'El campo verde');
    await expect(page.locator('[class*="medidorFila"]')).toContainText('5/20');
    await expect(page.locator('[class*="medidorFila"]')).toContainText('faltan 15');
  });

  test('TESTIGO · Lope: los diez versos sin «y» final ante vocal ni sinalefa sobre la tónica final miden 11', async ({
    page,
  }) => {
    // Vv. 1-5, 7, 8, 10, 11 y 13 del soneto, a mano:
    //   1  Un(1) so-ne-to(3) me(1) man-da(2) ha-cer(2) Vio-lan-te(3) = 12 − manda_hacer = 11
    //   2  15 − 4 (que_en, me_he, visto_en, tanto_aprieto) = 11
    //   3  ca-tor-ce(3) ver-sos(2) di-cen(2) que(1) es(1) so-ne-to(3) = 12 − que_es = 11
    //   4  bur-la(2) bur-lan-do(3) van(1) los(1) tres(1) de-lan-te(3) = 11, sin contactos
    //   5  Yo(1) pen-sé(2) que(1) no(1) ha-lla-ra(3) con-so-nan-te(4) = 12 − no_hallara = 11
    //   7  mas(1) si(1) me(1) ve-o(2) en(1) el(1) pri-mer(2) ter-ce-to(3) = 12 − veo_en = 11
    //   8  no(1) hay(1) co-sa(2) en(1) los(1) cuar-te-tos(3) que(1) me(1) es-pan-te(3) = 14 − 3
    //      (no_hay, cosa_en, me_espante) = 11
    //   10 y(1) pa-re-ce(3) que(1) en-tré(2) con(1) pie(1) de-re-cho(3) = 12 − que_entré = 11
    //   11 pues(1) fin(1) con(1) es-te(2) ver-so(2) le(1) voy(1) dan-do(2) = 11, sin contactos
    //   13 que(1) voy(1) los(1) tre-ce(2) ver-sos(2) a-ca-ban-do(4) = 11, sin contactos
    // Rima: -ante -eto -eto -ante ×2, -ando -echo ×3 → ABBA ABBA CDC DCD, soneto.
    await analizarTexto(page, SONETO_LOPE);
    const m = await medidas(page, 14);
    expect([0, 1, 2, 3, 4, 6, 7, 9, 10, 12].map((i) => m[i])).toEqual(Array<string>(10).fill('11'));
    expect(await composicion(page)).toBe('Soneto');
    await expect(page.locator('[class*="rimaValor"]').first()).toHaveText('ABBA ABBA CDC DCD');

    // La conjunción «y» ENTRE vocales (vv. 12 y 14) funde por UN solo lado, que es lo correcto
    // (ce-yes-tá, do-yaun): el cómputo de la «y» copulativa no es el defecto (parte de C0287 no
    // reproducida). Se mira que haya exactamente un lazo con la «y», sin fijar a qué lado cae.
    const conLaY = async (verso: number) =>
      (await sinalefasDe(page, verso).allTextContents()).filter((t) => /(^|\s)y(\s|$)/.test(t))
        .length;
    expect(await conLaY(11)).toBe(1);
    expect(await conLaY(13)).toBe(1);
  });

  test('HALLAZGO 3565 (C0287) · la «y» final de «estoy», «voy» o «soy» ante vocal no hace sinalefa', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: terminaEnVocal() ya no da por vocal la «y» que cierra diptongo.
    // Lope, vv. 6, 9 y 12. La «y» ante vocal es consonante de la sílaba siguiente:
    //   6  y(1) es-toy(2) a(1) la(1) mi-tad(2) de(1) o-tro(2) cuar-te-to(3) = 13; sinalefas
    //      y_estoy y de_otro (es-to-ya: «estoy a» no ahorra nada) → 11. La app: 10.
    //   9  Por(1) el(1) pri-mer(2) ter-ce-to(3) voy(1) en-tran-do(3) = 11; vo-yen-tran-do, sin
    //      sinalefa → 11. La app: 10, con el lazo «voy ⌣ entrando».
    //   12 Ya(1) es-toy(2) en(1) el(1) se-gun-do(3) y(1) aun(1) sos-pe-cho(3) = 13; Ya_estoy y
    //      la «y» copulativa entre vocales → −2 (es-to-yen, sin sinalefa) → 11. La app: 10.
    // Y tres versos sueltos de la misma forma:
    //   «hoy es lunes»  hoy(1) es(1) lu-nes(2) = 4, ho-yes sin sinalefa → 4. La app: 3.
    //   «Yo soy un hombre sincero» (Martí)  Yo(1) soy(1) un(1) hom-bre(2) sin-ce-ro(3) = 8,
    //       so-yun sin sinalefa → 8. La app: 7.
    //   «Yo soy aquel que ayer no más decía» (Darío)  12 fonéticas − que_ayer = 11. La app: 10.
    await analizarTexto(page, SONETO_LOPE);
    const m = await medidas(page, 14);
    const lope = [m[5], m[8], m[11]];

    await analizarTexto(
      page,
      'hoy es lunes\nYo soy un hombre sincero\nYo soy aquel que ayer no más decía',
    );
    const sueltos = await medidas(page, 3);

    expect({ lope, sueltos }).toEqual({ lope: ['11', '11', '11'], sueltos: ['4', '8', '11'] });
  });

  test('HALLAZGO 3566 · no hay sinalefa sobre la vocal que lleva el acento final del verso', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: escandirTramo() deja en dialefa el contacto con la última palabra
    // cuando esta empieza por su vocal tónica, y la tarjeta lo dice.
    //   Lope, v. 14: con-tad(2) si(1) son(1) ca-tor-ce(3) y(1) es-tá(2) he-cho(2) = 12. La «y»
    //       ahorra una (ce-yes-tá); «está | hecho» va en dialefa porque «he-» es la décima, el
    //       acento final del endecasílabo → 11. La app: 10, y señala «con pausa» la fusión de la
    //       «y», que es la buena, mientras «está ⌣ hecho» sale sin aviso.
    //   Darío, «Sonatina», v. 4: La(1) prin-ce-sa(3) es-tá(2) pá-li-da(3) | en(1) su(1) si-lla(2)
    //       de(1) o-ro(2). Primer hemistiquio 9 − princesa_está − 1 (esdrújulo) = 7; segundo,
    //       7 con «de | oro» en dialefa (la «o» lleva el acento final) → 14. La app: 13.
    await analizarTexto(
      page,
      'contad si son catorce, y está hecho.\nLa princesa está pálida en su silla de oro,',
    );
    expect(await medidas(page, 2)).toEqual(['11', '14']);
    await expect(page.locator('[class*="versoCard"]').nth(0)).toContainText('Sin sinalefa en «está | hecho»');
  });

  test('TESTIGO · tres redondillas de Sor Juana: doce octosílabos y la rima abba cddc effe', async ({
    page,
  }) => {
    //   1  Hom-bres(2) ne-cios(2) que(1) a-cu-sáis(3) = 8 − que_acusáis + 1 (aguda) = 8
    //   2  a(1) la(1) mu-jer(2) sin(1) ra-zón(2) = 7 + 1 = 8
    //   3  sin(1) ver(1) que(1) sois(1) la(1) o-ca-sión(3) = 8 − la_ocasión + 1 = 8
    //   4  de(1) lo(1) mis-mo(2) que(1) cul-páis(2) = 7 + 1 = 8
    //   5  si(1) con(1) an-sia(2) sin(1) i-gual(2) = 7 + 1 = 8
    //   6  so-li-ci-táis(4) su(1) des-dén(2) = 7 + 1 = 8
    //   7  por(1) qué(1) que-réis(2) que(1) o-bren(2) bien(1) = 8 − que_obren + 1 = 8
    //   8  si(1) las(1) in-ci-táis(3) al(1) mal(1) = 7 + 1 = 8
    //   9  Com-ba-tís(3) su(1) re-sis-ten-cia(4) = 8, llana
    //   10 y(1) lue-go(2) con(1) gra-ve-dad(3) = 7 + 1 = 8
    //   11 de-cís(2) que(1) fue(1) li-vian-dad(3) = 7 + 1 = 8
    //   12 lo(1) que(1) hi-zo(2) la(1) di-li-gen-cia(4) = 9 − que_hizo = 8
    // Rimas -áis -ón -ón -áis · -al -én -én -al · -encia -ad -ad -encia: ninguna se repite de
    // una estrofa a otra, así que las letras siguen el orden de aparición, abba cddc effe.
    await analizarTexto(page, REDONDILLAS_SOR_JUANA);
    expect(await medidas(page, 12)).toEqual(Array<string>(12).fill('8'));
    await expect(page.locator('[class*="rimaValor"]').first()).toHaveText('abba cddc effe');
    expect((await estrofasNombradas(page))[0]).toBe('Redondilla');
  });

  test('HALLAZGO 3567 (C0288) · la redondilla y el serventesio se reconocen también en segunda y tercera posición', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: patron() renombra las letras de cada bloque desde la A.
    // Sor Juana: abba cddc effe, doce octosílabos (testigo de arriba) → tres redondillas.
    // Martí, «Cultivo una rosa blanca»: -anca -ero -ero -anca · -anca -ivo -ivo -anca → abba
    //   acca; los ocho miden 8 (Cul-ti-vo_u-na: 9 − 1; en ju-lio co-mo_en e-ne-ro: 9 − 1;
    //   pa-ra_el a-mi-go sin-ce-ro: 9 − 1; que me da su ma-no fran-ca: 8; Y pa-ra_el cruel
    //   que me_a-rran-ca: 10 − 2; el co-ra-zón con que vi-vo: 8; car-do ni_or-ti-ga cul-ti-vo:
    //   9 − 1; cul-ti-vo la ro-sa blan-ca: 8) → dos redondillas.
    // Darío, «Yo soy aquel…»: -ía -ana -ía -ana · -eño -agos -eño -agos → ABAB CDCD, ocho
    //   endecasílabos (el primero lo deja en 10 el hallazgo C0287, dentro de la tolerancia de
    //   metroPredominante) → dos serventesios.
    // La app nombra solo la PRIMERA de cada poema: la segunda llega como «CDDC», «ACCA» o «CDCD».
    await analizarTexto(page, REDONDILLAS_SOR_JUANA);
    const sorJuana = await estrofasNombradas(page);
    await analizarTexto(page, REDONDILLAS_MARTI);
    const marti = await estrofasNombradas(page);
    await analizarTexto(page, SERVENTESIOS_DARIO);
    const dario = await estrofasNombradas(page);

    expect({ sorJuana, marti, dario }).toEqual({
      sorJuana: ['Redondilla', 'Redondilla', 'Redondilla'],
      marti: ['Redondilla', 'Redondilla'],
      dario: ['Serventesio', 'Serventesio'],
    });
  });

  test('HALLAZGO 3568 (C0289) · ni la sextina de Darío ni los serventesios de Machado son cuaderna vía, ni dos liras una silva', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: la cuaderna vía exige tetrásticos AAAA y la silva, que ningún
    // bloque sea una estrofa fija; las dos liras vuelven a la lista de estrofas.
    // La cuaderna vía son tetrásticos MONORRIMOS de alejandrinos (AAAA); la silva, una serie
    // LIBRE de 7 y 11 sin estrofas fijas.
    //   «Sonatina», estrofa 1: seis alejandrinos -esa -esa -or -oro -oro -or → AABCCB.
    //   «Retrato», estrofas 1-2: ocho alejandrinos -illa -ero -illa -ero · -ido -ario -ido
    //       -ario → ABAB CDCD, serventesios de alejandrinos.
    //   «Vida retirada», liras 1-2: 7 11 7 7 11 · 7 11 7 7 11 con aBabB cDcdD → dos liras.
    // La app destaca «Cuaderna vía» en las dos primeras y «Silva» en la tercera (y al haber
    // composición oculta la lista de estrofas, donde la primera lira sí salía).
    const rotulos: string[] = [];
    for (const poema of [SONATINA_ESTROFA_1, RETRATO_MACHADO, LIRAS_FRAY_LUIS]) {
      await analizarTexto(page, poema);
      rotulos.push(await composicion(page));
    }
    expect(rotulos.map((r) => ['Cuaderna vía', 'Silva'].includes(r))).toEqual([false, false, false]);
    // Las liras: sin composición que la tape, la lista nombra las dos
    expect(await estrofasNombradas(page)).toEqual(['Lira', 'Lira']);

    // Y la cuaderna vía de verdad se sigue reconociendo: dos tetrásticos AAAA de alejandrinos,
    // escritos para la prueba (el Berceo original pide dialefas sistemáticas que la app no
    // aplica). A mano, todos 7 + 7: «Por la vereda verde | caminaba despacio» = 7 + 7 sin
    // contactos; «y las nubes pasaban | por el cielo de espacio» = 7 + (8 − de_espacio);
    // «como barcos de lana | sobre un mar de topacio» = 7 + (8 − sobre_un); «y el sol iba
    // tiñendo | la torre de colores» = (8 − y_el) + 7. Rimas -acio ×4, -ores ×4 → AAAA BBBB.
    await analizarTexto(page, CUADERNA_DE_PRUEBA);
    expect(await composicion(page)).toBe('Cuaderna vía');
  });

  test('TESTIGO · los alejandrinos y dodecasílabos sin cesura conflictiva miden bien', async ({
    page,
  }) => {
    // Versos compuestos donde el corte cae entre consonante y consonante y ningún hemistiquio
    // acaba en aguda ni en esdrújula: ahí contar el verso entero da lo mismo que por mitades.
    //   Darío, «Era un aire suave»: E-ra_un ai-re sua-ve | de pau-sa-dos gi-ros = 6 + 6 = 12;
    //       So-bre la te-rra-za | jun-to_a los ra-ma-jes = 6 + 6 = 12.
    //   «Sonatina» vv. 1, 2, 3, 5 y 6 = 14 (15 − 1; 15 − 1; 16 − 3 + 1; 15 − 1; 16 − 3 + 1).
    //   «Retrato» vv. 1-5, 7 y 8 = 14.
    await analizarTexto(
      page,
      'Era un aire suave, de pausados giros;\nSobre la terraza, junto a los ramajes,',
    );
    expect(await medidas(page, 2)).toEqual(['12', '12']);
    await expect(nombreDe(page, 0)).toContainText('dodecasílabo');

    await analizarTexto(page, SONATINA_ESTROFA_1);
    const s = await medidas(page, 6);
    expect([s[0], s[1], s[2], s[4], s[5]]).toEqual(Array<string>(5).fill('14'));

    await analizarTexto(page, RETRATO_MACHADO);
    const r = await medidas(page, 8);
    expect([r[0], r[1], r[2], r[3], r[4], r[6], r[7]]).toEqual(Array<string>(7).fill('14'));
  });

  test('HALLAZGO 3569 (C0290) · el alejandrino y el dodecasílabo se miden por hemistiquios', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: buscarCesura() mide por mitades los versos que caen en la franja
    // de un compuesto, y la tarjeta dice dónde va el corte.
    //   Machado, «Retrato», v. 6: ya(1) co-no-céis(3) mi(1) tor-pe(2) | a-li-ño(3)
    //       in-du-men-ta-rio(5). Primer hemistiquio 7, llano; segundo 8 − aliño_indumentario
    //       = 7. En la cesura no hay sinalefa: «torpe | aliño» → 14. La app: 15 − 2 = 13.
    //   Darío, «Era un aire suave»: di-rí-a-se(4) un(1) tré-mo-lo(3) | de(1) li-ras(2)
    //       e-o-lias(3). Primer hemistiquio 8 − diríase_un − 1 (esdrújulo) = 6; segundo 6 → 12,
    //       dodecasílabo. La app: 14 − 1 = 13, sin el −1 del hemistiquio esdrújulo.
    // (El caso del cabo, «La princesa está pálida en su silla de oro», también sale 13, pero la
    // cesura sola no lo arregla: el −1 del esdrújulo y la sinalefa «pálida_en» que se deshace
    // se compensan. Lo que le falta es la dialefa «de | oro», hallazgo aparte, más arriba.)
    await analizarTexto(
      page,
      '—ya conocéis mi torpe aliño indumentario—,\ndiríase un trémolo de liras eolias',
    );
    expect(await medidas(page, 2)).toEqual(['14', '12']);
    await expect(page.locator('[class*="versoCard"]').nth(0)).toContainText(
      'Verso compuesto: 7 + 7, con la cesura tras «torpe»',
    );
    // 14 fonéticas − 1 sinalefa − 1 (primer hemistiquio esdrújulo) ± 0 = 12: la cuenta se sigue
    await expect(desgloseDe(page, 1)).toContainText('− 1 (primer hemistiquio esdrújulo)');
    await expect(nombreDe(page, 1)).toContainText('dodecasílabo');
  });

  test('TESTIGO · Garcilaso XXIII: doce de catorce miden 11 y el soneto se reconoce', async ({
    page,
  }) => {
    //   1  En(1) tan-to(2) que(1) de(1) ro-sa(2) y(1) a-zu-ce-na(4) = 12 − rosa_y = 11
    //   2  se(1) mues-tra(2) la(1) co-lor(2) en(1) vues-tro(2) ges-to(2) = 11
    //   3  12 − ardiente_honesto (con pausa) = 11 · 4  11, sin contactos
    //   5  y(1) en(1) tan-to(2) que(1) el(1) ca-be-llo(3) que(1) en(1) la(1) ve-na(2) = 14 − 3 = 11
    //   6  del(1) o-ro(2) se(1) es-co-gió(3) con(1) vue-lo(2) pres-to(2) = 12 − se_escogió = 11
    //   7  por(1) el(1) her-mo-so(3) cue-llo(2) blan-co(2) en-hies-to(3) = 12 − blanco_enhiesto = 11
    //   8  el(1) vien-to(2) mue-ve(2) es-par-ce(3) y(1) de-sor-de-na(4) = 13 − 2 = 11
    //   9  co-ged(2) de(1) vues-tra(2) a-le-gre(3) pri-ma-ve-ra(4) = 12 − 1 = 11
    //   10 el(1) dul-ce(2) fru-to(2) an-tes(2) que(1) el(1) tiem-po(2) ai-ra-do(3) = 14 − 3 = 11
    //   12 Mar-chi-ta-rá(4) la(1) ro-sa(2) el(1) vien-to(2) he-la-do(3) = 13 − 2 = 11
    //   13 to-do(2) lo(1) mu-da-rá(3) la(1) e-dad(2) li-ge-ra(3) = 12 − la_edad = 11
    // Rima -ena -esto -esto -ena ×2, -era -ado -umbre · -ado -era -umbre → ABBA ABBA CDE DCE.
    await analizarTexto(page, SONETO_GARCILASO_XXIII);
    const m = await medidas(page, 14);
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12].map((i) => m[i])).toEqual(Array<string>(12).fill('11'));
    expect(await composicion(page)).toBe('Soneto');
    await expect(page.locator('[class*="rimaValor"]').first()).toHaveText('ABBA ABBA CDE DCE');
  });

  test('HALLAZGO 3570 · el banco de pruebas que propone la app (Garcilaso XXIII) sale con dos decasílabos sin aviso', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026 por la segunda salida: el consejo lleva el matiz de los dos versos y
    // el recuadro de limitaciones explica la h aspirada. Aplicarla exigiría un léxico de
    // etimologías (h < f latina), que el motor no tiene.
    // El consejo «Practica con poemas que ya conoces» dice: «El Soneto XXIII de Garcilaso (…)
    // tiene 11 sílabas por verso: es un banco de pruebas inmejorable». Dos versos solo son
    // endecasílabos con la h aspirada del siglo XVI (h < f latina), que impide la sinalefa:
    //   11 cu-bra(2) de(1) nie-ve(2) la(1) her-mo-sa(3) cum-bre(2) = 11, «la | hermosa» sin
    //      fundir → 11. La app: 10, con «la ⌣ hermosa».
    //   14 por(1) no(1) ha-cer(2) mu-dan-za(3) en(1) su(1) cos-tum-bre(3) = 12 − mudanza_en, con
    //      «no | hacer» sin fundir → 11. La app: 10.
    // Vale cualquiera de las dos salidas: que los 14 midan 11, o que la app avise de la h
    // aspirada (el recuadro de limitaciones no la menciona) y no prometa el 11 sin matiz.
    await analizarTexto(page, SONETO_GARCILASO_XXIII);
    const m = await medidas(page, 14);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('Practica con poemas que ya conoces')).toBeVisible();
    const educativo = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script, style').forEach((s) => s.remove());
      return copia.textContent ?? '';
    });
    const cuadra = m.every((v) => v === '11') || /h aspirada/i.test(educativo);
    expect(cuadra).toBe(true);
    // Y el consejo ya no promete el 11 sin matiz: nombra los dos versos
    expect(educativo).toContain('cubra de nieve la hermosa cumbre');
  });

  test('HALLAZGO 3571 · la FAQ visible y el FAQPage del hiato enseñan que la tilde «siempre» rompe el diptongo', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: las dos bocas leen FAQ_HIATO de metadata.ts, con la excepción
    // de las cerradas distintas y el hiato de las iguales. La visible toma la pregunta del
    // FAQPage, así que se busca por ella.
    // OLE 2010: dos vocales cerradas DISTINTAS forman diptongo aunque una lleve tilde
    // (cuí-da-te, ca-suís-ti-co), y dos cerradas IGUALES forman hiato (chi-i-ta). La app lo
    // aplica (test 698, más arriba: «cuídate» → cuí-da-te, «Diptongo: uí») y la tarjeta de
    // consejos ya enseña la excepción. Pero:
    //   · la FAQ visible «¿Cuándo se produce hiato y cuándo diptongo?» dice «o débil TÓNICA (con
    //     tilde) + cualquier vocal» y «La tilde sobre la vocal débil siempre rompe el diptongo»;
    //   · el FAQPage «¿Qué es un hiato y en qué se diferencia del diptongo?» dice «o cuando una
    //     vocal débil lleva tilde» y calla el hiato de dos cerradas iguales.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const pregunta = page.getByText('¿Qué es un hiato y en qué se diferencia del diptongo?');
    await pregunta.click();
    const visible = (await pregunta.locator('xpath=..').innerText()).replace(/\s+/g, ' ');
    const faq = await leerFaqJsonLd(page);
    const faqHiato = faq.find((q) => q.pregunta.includes('¿Qué es un hiato'))?.respuesta ?? '';
    expect(faqHiato).not.toBe('');

    expect({
      visibleDiceSiempre: visible.includes('siempre rompe el diptongo'),
      faqPageNombraLasIguales: /iguales/.test(faqHiato),
      faqPageNombraLaExcepcion: faqHiato.includes('cuí-da-te'),
      mismaRespuesta: visible.includes(faqHiato),
    }).toEqual({
      visibleDiceSiempre: false,
      faqPageNombraLasIguales: true,
      faqPageNombraLaExcepcion: true,
      mismaRespuesta: true,
    });
  });

  test('HALLAZGO 3572 · «diéresis» y «sinéresis» se escriben con tilde, y «poeta» no se parte po-eta', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: las siete formas llevan tilde y la fila dice «po-e-ta → poe-ta».
    // Son esdrújulas: llevan tilde SIEMPRE, como explica la FAQ de al lado («¿Por qué las
    // palabras esdrújulas llevan tilde siempre?»), y el recuadro de limitaciones ya las escribe
    // bien. Sin tilde salen en la fila «Sineresis» de la tabla, en la tarjeta de Lengua y
    // Literatura y en la pregunta y la respuesta de la FAQ de licencias. La misma fila escribe
    // «po-eta → poe-ta»: po-e-ta son tres sílabas, como dice la FAQ.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('Fenómenos Fonéticos: Diptongos, Hiatos y Sinalefa')).toBeVisible();
    const educativo = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script, style').forEach((s) => s.remove());
      return copia.textContent ?? '';
    });
    expect(educativo.match(/sineresis|dieresis|po-eta/gi) ?? []).toEqual([]);
  });

  test('TESTIGO · «abrogar» se silabea a-bro-gar y «subrayar» cuenta 3 sílabas', async ({ page }) => {
    // «abrogar» no tiene prefijo separable en español: «br» es grupo inseparable → a-bro-gar.
    // En «subrayar» el número de sílabas es 3 se parta como se parta: el hallazgo C0291 es de
    // la PARTICIÓN, no del recuento ni de la métrica.
    await analizarTexto(page, 'abrogar subrayar');
    await expect(silabasDe(page, 0)).toHaveText(['a', 'bro', 'gar']);
    await expect(totalDe(page, 1)).toHaveText('3 sílabas');
  });

  test('HALLAZGO 3573 (C0291) · tras el prefijo sub- la r es vibrante múltiple: sub-ra-yar, sub-ro-gar', async ({
    page,
  }) => {
    // REPARADO el 27/10/2026: separarSilabas() corta entre b y r tras sub- inicial, y el bloque
    // educativo ya no presenta «su-bra-yar» como variante defendible.
    // OLE 2010 y DPD: en «subrayar» y «subrogar» la r tras sub- se pronuncia múltiple, así que
    // «b» y «r» van en sílabas distintas: sub-ra-yar, sub-ro-gar. La app da su-bra-yar y
    // su-bro-gar, una partición que no sostiene ni la fonética ni la morfología, y su recuadro
    // de limitaciones la presenta como una variante defendible («la RAE y las distintas
    // tradiciones gramaticales no siempre coinciden»).
    await analizarTexto(page, 'subrayar subrogar');
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(2);
    await expect(totalDe(page, 0)).toHaveText('3 sílabas');
    const partes = [
      await silabasDe(page, 0).allTextContents(),
      await silabasDe(page, 1).allTextContents(),
    ];
    expect(partes).toEqual([
      ['sub', 'ra', 'yar'],
      ['sub', 'ro', 'gar'],
    ]);
  });
});

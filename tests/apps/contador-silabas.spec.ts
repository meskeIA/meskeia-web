import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — contador-silabas (segmento interactiva, riesgo 3, 429 usos reales)
 *
 * Primera inspección: 24/08/2026. La app promete en su <h1> «Contador de Sílabas» y en su
 * subtítulo «Separa y cuenta las sílabas de cualquier texto en español». La metadata añade
 * métrica del verso, sinalefas, acentuación final y rima. Contar sílabas en español SÍ tiene
 * verdad comprobable: las reglas de diptongo, hiato, triptongo y división de grupos
 * consonánticos son deterministas (RAE, Ortografía de la lengua española, 2010, cap. I).
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/contador-silabas/metrica.ts  → separarSilabas() (silabeo), acentuacionDe(),
 *                                      analizarVerso() (fonéticas − sinalefas + ajuste)
 *   app/contador-silabas/rima.ts     → esquema de rima y reconocimiento de estrofa
 *   app/contador-silabas/page.tsx    → solo pinta; no calcula nada por su cuenta
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — «murciélago» → mur-cié-la-go, 4 sílabas
 *       mur|c   dos consonantes seguidas entre vocales (r+c) que NO forman grupo
 *               inseparable: la primera cierra la sílaba anterior y la segunda abre la
 *               siguiente.
 *       cié     «i» débil ÁTONA + «é» fuerte tónica = diptongo. La tilde sobre vocal FUERTE
 *               no rompe el diptongo (solo lo rompe sobre i/u).
 *       la-go   una sola consonante entre vocales va siempre con la sílaba siguiente.
 *       Acentuación: tónica en la 2.ª de 4 (antepenúltima) → esdrújula.
 *
 *   CASO 2 (límite) — «abstracto» → abs-trac-to, 3 sílabas
 *       Grupo de CUATRO consonantes entre vocales (b-s-t-r). Regla RAE: si las dos últimas
 *       forman grupo inseparable —«tr», oclusiva + líquida, capaz de abrir sílaba en
 *       español— ese grupo se va entero con la vocal siguiente y TODO lo anterior cierra la
 *       sílaba previa: abs-trac-to. El propio bloque educativo de la app escribe
 *       «cons-truir, 2 sílabas» y «cons-tar», así que ese es su criterio declarado.
 *       El RECUENTO (3) sí lo acierta; la SEPARACIÓN no → hallazgo abierto al final.
 *
 *   CASO 3 (rechazo) — «12345 €€€ --- 3,14» y la entrada vacía
 *       El extractor es /[a-záéíóúüñ]+/gi: cifras, símbolos y signos no aportan NINGUNA
 *       palabra. Esperado: 0 palabras, 0 sílabas y ninguna tarjeta, sin NaN en la media.
 *       Con el campo vacío o solo con espacios, `analizar()` sale por `if (!texto.trim())`
 *       y la app se queda en el marcador de posición, sin inventarse un resultado.
 *
 * HALLAZGOS DEL INSPECTOR: al final. Se escribieron con `test.fail()` afirmando lo que
 * DEBERÍA pasar, y el 24/08/2026 se repararon los ocho: hoy son tests de regresión
 * normales.
 */

const RUTA = '/contador-silabas/';

/**
 * La app es un client component: el HTML llega con los botones pintados pero SIN manejador,
 * así que un clic anterior a la hidratación se pierde sin dejar rastro (el botón queda con el
 * foco y no pasa nada más). Se usa el botón de ejemplo como testigo: cuando consigue rellenar
 * el textarea, React ya está escuchando y el resto de clics del test cuentan.
 */
async function esperarHidratacion(page: Page): Promise<void> {
  const ejemplo = page.getByRole('button', { name: 'Cargar ejemplo: murciélago' });
  await expect(async () => {
    await ejemplo.click();
    await expect(page.locator('textarea')).toHaveValue('murciélago', { timeout: 500 });
  }).toPass({ timeout: 15000 });
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

const desgloseDe = (page: Page, indice = 0) =>
  page.locator('[class*="versoCard"]').nth(indice).locator('[class*="versoDesglose"]');

test.describe('contador-silabas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page);
  });

  test('CASO 1 (normal) · «murciélago» = mur-cié-la-go, 4 sílabas', async ({ page }) => {
    await analizar(page, 'murciélago');

    // Separación resuelta a mano arriba: r+c se separan, «ié» es diptongo (la tilde sobre
    // vocal fuerte no lo rompe) y las consonantes simples abren sílaba.
    await expect(silabasDe(page)).toHaveText(['mur', 'cié', 'la', 'go']);
    await expect(totalDe(page)).toHaveText('4 sílabas');

    // Resumen: sílabas totales, palabras y media — la media, en formato español (coma).
    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('4');
    await expect(page.locator('[class*="resumenValor"]').nth(1)).toHaveText('1');
    await expect(page.locator('[class*="resumenValor"]').nth(2)).toHaveText('4,0');
  });

  test('CASO 2 (límite) · «abstracto» son 3 sílabas', async ({ page }) => {
    await analizar(page, 'abstracto');

    // El recuento sí cuadra con abs-trac-to. La división que pinta (ab-strac-to) es el
    // hallazgo abierto de más abajo; aquí se fija al menos que el número no se mueva.
    await expect(totalDe(page)).toHaveText('3 sílabas');
    await expect(page.locator('[class*="resumenValor"]').nth(0)).toHaveText('3');
  });

  test('CASO 3 (rechazo) · cifras y símbolos no son palabras; el vacío no calcula nada', async ({
    page,
  }) => {
    await analizar(page, '12345 €€€ --- 3,14');

    // /[a-záéíóúüñ]+/gi no encuentra ninguna palabra. HALLAZGO 214, reparado el 24/08/2026:
    // antes se pintaba el panel con ceros y un «Análisis detallado» vacío, indistinguible de
    // un análisis real; ahora se dice que no había nada que analizar.
    await expect(page.getByText('No hay ninguna palabra que analizar')).toBeVisible();
    await expect(page.locator('[class*="resumenValor"]')).toHaveCount(0);
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);

    // Con el campo solo con espacios no llega a haber resultado: sigue el marcador inicial.
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await analizar(page, '   ');
    await expect(
      page.getByText('Introduce un texto para analizar sus sílabas')
    ).toBeVisible();
    await expect(page.locator('[class*="palabraCard"]')).toHaveCount(0);
  });

  // ---------------------------------------------------------------------------------------
  // TESTIGOS — lo que la app SÍ hace bien y no debe romperse
  // ---------------------------------------------------------------------------------------

  test('TESTIGO · la tilde sobre i/u rompe el diptongo (hiato acentual)', async ({ page }) => {
    await analizar(page, 'maría país baúl poesía');

    // RAE: la vocal débil tónica con tilde forma SIEMPRE hiato con la vocal contigua.
    await expect(silabasDe(page, 0)).toHaveText(['ma', 'rí', 'a']); // ía → hiato
    await expect(silabasDe(page, 1)).toHaveText(['pa', 'ís']); // aí → hiato
    await expect(silabasDe(page, 2)).toHaveText(['ba', 'úl']); // aú → hiato
    // poesía: «oe» son dos fuertes (hiato) e «ía» es hiato acentual → 4 sílabas.
    await expect(silabasDe(page, 3)).toHaveText(['po', 'e', 'sí', 'a']);
  });

  test('TESTIGO · diptongos, triptongos, «y» final y dígrafos indivisibles', async ({ page }) => {
    await analizar(page, 'cielo causa viernes Uruguay averiguáis buey carro calle coche');

    await expect(silabasDe(page, 0)).toHaveText(['cie', 'lo']); // débil átona + fuerte
    await expect(silabasDe(page, 1)).toHaveText(['cau', 'sa']); // fuerte + débil átona
    await expect(silabasDe(page, 2)).toHaveText(['vier', 'nes']); // ie diptongo · rn se separa
    await expect(silabasDe(page, 3)).toHaveText(['u', 'ru', 'guay']); // uay: triptongo (la y suena /i/)
    await expect(silabasDe(page, 4)).toHaveText(['a', 've', 'ri', 'guáis']); // uái: triptongo
    await expect(silabasDe(page, 5)).toHaveText(['buey']); // monosílabo: triptongo uey
    await expect(silabasDe(page, 6)).toHaveText(['ca', 'rro']); // rr es dígrafo: no se parte
    await expect(silabasDe(page, 7)).toHaveText(['ca', 'lle']); // ll es dígrafo
    await expect(silabasDe(page, 8)).toHaveText(['co', 'che']); // ch es dígrafo
  });

  test('TESTIGO · escansión del endecasílabo y del octosílabo agudo', async ({ page }) => {
    // Bécquer. Vol-ve-rán(3) las(1) os-cu-ras(3) go-lon-dri-nas(4) = 11 fonéticas.
    // Ningún contacto vocal-vocal entre palabras → 0 sinalefas. Última palabra llana → ±0.
    await analizar(page, 'Volverán las oscuras golondrinas');
    await expect(metricasDe(page)).toHaveText('11');
    await expect(desgloseDe(page)).toContainText('11 fonéticas');
    await expect(desgloseDe(page)).toContainText('llana');

    // Calderón. Qué(1) es(1) la(1) vi-da(2) Un(1) fre-ne-sí(3) = 9 fonéticas.
    // Sinalefas «Qué_es» y «vida_Un» (esta última, con pausa) → −2. Aguda final → +1. 9−2+1 = 8.
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await analizar(page, '¿Qué es la vida? Un frenesí');
    await expect(metricasDe(page)).toHaveText('8');
    await expect(desgloseDe(page)).toContainText('2 sinalefas');
    await expect(desgloseDe(page)).toContainText('aguda');
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

  // ---------------------------------------------------------------------------------------
  // HALLAZGOS DEL INSPECTOR — reparados el 24/08/2026, ya son regresión
  //
  // El silabeador se reescribió entero y salió del componente: vive en
  // `app/contador-silabas/silabeo.ts` con 24 tests unitarios que resuelven cada regla a mano
  // (`tests/silabeo.spec.ts`). Lo que sigue comprueba que esas reglas llegan a la pantalla.
  // ---------------------------------------------------------------------------------------

  test.describe('hallazgos del Inspector', () => {

    test('los grupos de 3+ consonantes deberían dejar entero el grupo inseparable', async ({
      page,
    }) => {
      // separarSilabas() solo mira DOS consonantes seguidas: al no ser «bs» un grupo
      // inseparable, cierra la sílaba tras la primera y arrastra el resto a la siguiente.
      // Sale ab-strac-to, y «str» no puede abrir sílaba en español. Lo mismo con
      // con-struir, tran-spor-te, con-star, in-sti-tu-to, ob-stá-cu-lo y per-spec-ti-va.
      // El recuento no cambia; la separación que se enseña, sí. Y contradice al propio
      // bloque educativo de la app, que escribe «cons-truir» y «cons-tar».
      await analizar(page, 'abstracto');
      await expect(silabasDe(page)).toHaveText(['abs', 'trac', 'to']);
    });

    test('«aquí» son 2 sílabas: la u de «qu» no es una vocal', async ({ page }) => {
      // La «u» del dígrafo «qu» es un mero signo ortográfico y no suena. separarSilabas()
      // la trata como vocal débil, así que la «í» tildada dispara contra ella la regla del
      // hiato acentual y parte la palabra: a-qu-í, 3 sílabas, con una «sílaba» («qu») que no
      // contiene NINGUNA vocal — justo lo que la FAQ de la propia app declara imposible.
      // Igual en quí-mi-ca (da qu-í-mi-ca, 4), es-quí (es-qu-í, 3) y lin-güís-ti-ca
      // (lin-gü-ís-ti-ca, 5).
      await analizar(page, 'aquí');
      await expect(silabasDe(page)).toHaveText(['a', 'quí']);
      await expect(totalDe(page)).toHaveText('2 sílabas');
    });

    test('la h intercalada no rompe el diptongo: «ahumar» son 2 sílabas', async ({ page }) => {
      // RAE, Ortografía 2010: «las vocales separadas gráficamente por una h forman diptongo
      // o triptongo si su pronunciación así lo determina: ahu-mar, sahu-me-rio, prohi-bir,
      // de-sahu-cio». El motor mete la h en la lista de consonantes y la usa para cortar,
      // así que devuelve a-hu-mar (3), de-sa-hu-cio (4) y pro-hi-bir (3): una sílaba de más
      // en cada una. (Con tilde sí hay hiato de verdad: bú-ho, y eso lo acierta.)
      await analizar(page, 'ahumar');
      await expect(silabasDe(page)).toHaveText(['ahu', 'mar']);
      await expect(totalDe(page)).toHaveText('2 sílabas');
    });

    test('la métrica hereda el error: «Ya no quiero estar aquí» es un octosílabo', async ({
      page,
    }) => {
      // Ya(1) no(1) quie-ro(2) es-tar(2) a-quí(2) = 8 fonéticas · sinalefa «quiero_estar»
      // → −1 · «aquí» aguda → +1 · total 8, octosílabo de manual.
      // La app cuenta 9 fonéticas por a-qu-í y lo declara ENEASÍLABO. El fallo de silabeo no
      // se queda en la tarjeta de la palabra: falsea el tipo de verso, que es la promesa
      // principal de la metadata («métrica de versos»).
      await analizar(page, 'Ya no quiero estar aquí');
      await expect(metricasDe(page)).toHaveText('8');
    });

    test('los botones Analizar y Limpiar deberían llevar type="button"', async ({ page }) => {
      // CLAUDE.md global §5 y el candado `npm run check:a11y-jsx`, que señala L281 y L284.
      // Sin `type`, un <button> es submit por defecto.
      await expect(page.getByRole('button', { name: 'Analizar Sílabas' })).toHaveAttribute(
        'type',
        'button'
      );
      await expect(page.getByRole('button', { name: 'Limpiar' })).toHaveAttribute('type', 'button');
    });

    test('los emojis pegados a un título deberían llevar aria-hidden', async ({ page }) => {
      // check:a11y-jsx señala 6 títulos (L515, L558, L619, L645, L683 y L731). Un lector de
      // pantalla lee «libros Reglas de División Silábica en Español».
      const titulo = page.locator('h3', { hasText: 'Reglas de División Silábica' });
      await expect(titulo.locator('[aria-hidden="true"]')).toHaveCount(1);
    });
    test('las tarjetas nombran los diptongos, triptongos e hiatos que prometía el JSON-LD', async ({
      page,
    }) => {
      // HALLAZGO 212: el JSON-LD anunciaba «Identificación de diptongos, hiatos y triptongos»
      // y la tarjeta de Twitter prometía «diptongos e hiatos», pero la interfaz no marcaba
      // ninguno: solo se explicaban en el texto educativo, que es lo que da cualquier apunte.
      await analizar(page, 'cielo país buey aquí');

      const tarjeta = (i: number) => page.locator('[class*="palabraCard"]').nth(i);
      await expect(tarjeta(0)).toContainText('Diptongo: ie');
      await expect(tarjeta(1)).toContainText('Hiato: a-í');
      await expect(tarjeta(2)).toContainText('Triptongo: uey');
      // En «aquí» la u de «qu» no suena: no hay ningún encuentro vocálico que marcar
      await expect(tarjeta(3)).not.toContainText('Diptongo');
      await expect(tarjeta(3)).not.toContainText('Hiato');
    });

  });
});

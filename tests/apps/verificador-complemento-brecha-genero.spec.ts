import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — verificador-complemento-brecha-genero (segmento FISCAL / Seguridad Social,
 * riesgo 1 CRÍTICO). Escrito el 24/08/2026.
 *
 * DE DÓNDE SALE CADA CIFRA
 * ────────────────────────
 * Toda cifra esperada viene de `COMPLEMENTO_BRECHA_GENERO_2026` en
 * `data/fiscal/pensiones.ts` (líneas 440-455), sellado el 13/05/2026 contra
 * «Art. 60 LGSS (RDL 8/2015, modificado por RDL 3/2021) + RDL 3/2026»
 * (COMPLEMENTO_BRECHA_GENERO_META.fuente / .verificado / .urlOficial):
 *
 *   · cuantiaPorHijoMensual = 36.90   → importe mensual por hijo/a computable
 *   · maxHijos              = 4       → tope de hijos computables
 *   · maxMensual            = 147.60  → 4 × 36,90 (comprobación cruzada del tope)
 *   · maxAnual              = 2066.40 → 147,60 × 14 (comprobación cruzada del tope)
 *   · pagasAnuales          = 14      → el complemento se abona en 14 pagas
 *   · pensionesElegibles    = ['jubilacion', 'incapacidad_permanente', 'viudedad']
 *                                     → SOLO pensiones contributivas
 *
 * NINGUNA cifra de este fichero sale de la memoria sobre pensiones españolas: si el módulo
 * fiscal se revaloriza (RDL de pensiones de cada año), estos tests deben fallar y hay que
 * volver a derivarlos del módulo, no «ajustarlos» a lo que muestre la app.
 *
 * Los tres casos se resolvieron a mano ANTES de ejecutar la app; el cálculo va junto a la
 * aserción.
 *
 * Nota de formato: es-ES NO agrupa los millares de un número de cuatro cifras
 * (1549,80 €/año, 2066,40 €/año) y sí los de cinco o más. No es un fallo de formato: es lo
 * que hace `formatCurrency` (Intl es-ES). Además separa la cifra del € con espacio duro
 * (U+00A0), que aquí se normaliza a espacio normal antes de comparar.
 */

const RUTA = '/verificador-complemento-brecha-genero/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/** Normaliza espacios duros y saltos para poder comparar texto literal. */
function normalizar(texto: string): string {
  return texto.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

interface Situacion {
  pension: string;
  fecha: string;
  hijos: number;
  sexo: string;
  otroProgenitor: string;
  /** P6 — denegación PROPIA del solicitante. Por defecto, no la hay. */
  denegacionPropia?: boolean;
}

/** Responde las 6 preguntas y pulsa «Verificar mi derecho». */
async function responderYVerificar(page: Page, s: Situacion): Promise<void> {
  await page.getByRole('button', { name: s.pension, exact: true }).click();
  await page.getByRole('button', { name: s.fecha, exact: true }).click();
  await page.locator('#hijos').fill(String(s.hijos));
  await page.getByRole('button', { name: s.sexo, exact: true }).click();
  await page.getByRole('button', { name: s.otroProgenitor, exact: true }).click();
  await page
    .getByRole('button', {
      name: s.denegacionPropia ? 'Sí, tengo una resolución denegatoria' : 'No',
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
}

/** Despliega la EducationalSection, que arranca colapsada y guarda dentro la guía. */
async function abrirGuia(page: Page): Promise<void> {
  // El nombre accesible del botón es su aria-label ('Ver guía educativa'), no su texto
  const boton = page.getByRole('button', { name: 'Ver guía educativa' });
  if (await boton.isVisible()) await boton.click();
  await expect(page.getByText('Comparativa: antiguo complemento')).toBeVisible();
}

/** Texto completo del panel «Resultado orientativo», ya normalizado. */
async function textoResultado(page: Page): Promise<string> {
  const panel = page.locator('h2', { hasText: 'Resultado orientativo' }).locator('..');
  return normalizar(await panel.innerText());
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // La página es un client component: sin hidratación los botones no responden y todo
  // lo demás sería un falso verde. Se comprueba que el estado reacciona al clic.
  await page.getByRole('button', { name: 'Viudedad', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Viudedad', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test.describe('Verificador del complemento por brecha de género', () => {
  test('el marco legal obligatorio está presente y no es colapsable', async ({ page }) => {
    // Nivel 1 CRÍTICO: DisclaimerCard severity="critical" → role="alert" y siempre expandido.
    const aviso = page.locator('[role="alert"]').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveClass(/severity-critical/);

    // España estructural (art. 60 LGSS) → RegionBadge variant="es-only".
    await expect(page.getByText('Solo España', { exact: false })).toBeVisible();

    // DataReference con la normativa y la fuente de COMPLEMENTO_BRECHA_GENERO_META.
    await expect(
      page.getByText('Complemento por Brecha de Género 2026', { exact: false }).first(),
    ).toBeVisible();
    await expect(page.getByText('Art. 60 LGSS', { exact: false }).first()).toBeVisible();
  });

  /**
   * CASO 1 — NORMAL: perfil que cumple con claridad.
   * Mujer · jubilación (contributiva, en `pensionesElegibles`) · hecho causante posterior al
   * 4-feb-2021 (`fechaMinimaHechoCausante`) · 3 hijos · el otro progenitor no lo percibe.
   *
   * Cálculo a mano:
   *   hijos computables = mín(3, maxHijos 4)            = 3
   *   mensual           = 3 × cuantiaPorHijoMensual 36,90 = 110,70 €
   *   anual             = 110,70 × pagasAnuales 14        = 1549,80 €
   */
  test('caso normal: mujer con 3 hijos y jubilación desde 2021 → 110,70 €/mes', async ({ page }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    const resultado = await textoResultado(page);

    expect(resultado).toContain('+110,70 €/mes'); // 3 × 36,90 (cuantiaPorHijoMensual)
    expect(resultado).toContain('Cumples los requisitos básicos');

    // Desglose económico
    expect(resultado).toContain('Hijos computables 3 (máx. 4)'); // maxHijos = 4
    expect(resultado).toContain('Cuantía por hijo 36,90 €/mes'); // cuantiaPorHijoMensual
    expect(resultado).toContain('Mensual estimado 110,70 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1549,80 €/año'); // 110,70 × pagasAnuales 14

    // El veredicto positivo se apoya en el art. 60 LGSS, no en un juicio genérico.
    expect(resultado).toContain('art. 60 LGSS');
  });

  /**
   * CASO 2 — LÍMITE: los dos umbrales del eje «número de hijos», donde un `>` en vez de un
   * `>=` (o un `<` en vez de un `<=`) cambiaría el veredicto o el importe.
   *
   * 2a) 1 hijo — el complemento actual se genera DESDE 1 hijo/a. Si la app arrastrase la
   *     regla del antiguo complemento de maternidad (2 o más hijos), aquí diría «no procede».
   *       mensual = 1 × 36,90 = 36,90 €   ·   anual = 36,90 × 14 = 516,60 €
   *
   * 2b) 5 hijos — por encima de `maxHijos` = 4 el importe NO puede seguir creciendo:
   *       mensual = mín(5, 4) × 36,90 = 147,60 € = maxMensual
   *       anual   = 147,60 × 14      = 2066,40 € = maxAnual
   *
   * 2c) 0 hijos — al otro lado del umbral: sin hijos computables no procede.
   */
  test('caso límite: 1 hijo procede, 5 hijos topan en 4 y 0 hijos no procede', async ({ page }) => {
    // 2a — un solo hijo: 36,90 €/mes (cuantiaPorHijoMensual × 1)
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 1,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('+36,90 €/mes');
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Hijos computables 1 (máx. 4)');
    expect(resultado).toContain('Anual (14 pagas) 516,60 €/año'); // 36,90 × 14

    // 2b — cinco hijos: se topa en maxHijos = 4 → maxMensual 147,60 € y maxAnual 2066,40 €
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 5,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+147,60 €/mes'); // maxMensual
    expect(resultado).toContain('Hijos computables 4 (máx. 4)'); // maxHijos
    expect(resultado).toContain('Mensual estimado 147,60 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año'); // maxAnual

    // 2c — cero hijos: al otro lado del umbral, no procede
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 0,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('al menos un hijo');
    // Sin derecho reconocido no debe aparecer desglose económico alguno.
    expect(resultado).not.toContain('Desglose económico');
  });

  /**
   * CASO 3 — RECHAZO: pensión NO contributiva.
   * `pensionesElegibles` solo admite jubilación, incapacidad permanente y viudedad
   * contributivas, así que aquí el verificador debe decir que no procede, sin importe.
   *
   * Se comprueba además que el «no» no es categórico sobre la persona: la app explica el
   * motivo, indica un paso siguiente y mantiene el aviso de que quien reconoce el derecho
   * es el INSS.
   */
  test('caso de rechazo: pensión no contributiva → no procede y sin importe', async ({ page }) => {
    await responderYVerificar(page, {
      pension: 'No contributiva',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    const resultado = await textoResultado(page);

    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('solo se aplica a pensiones contributivas'); // pensionesElegibles
    expect(resultado).not.toContain('Desglose económico');
    expect(resultado).not.toContain('€/mes'); // ningún importe cuando no procede

    // El veredicto negativo se enmarca como orientación revisable, no como una sentencia.
    expect(resultado).toContain('Revisa el motivo abajo');
    expect(resultado).toContain('revisa entonces tu derecho');
    expect(resultado).toContain('El reconocimiento definitivo lo realiza el INSS');
  });

  /**
   * CASO 4 — QUIÉN TUVO LA DENEGACIÓN (hallazgo 225, alto).
   *
   * La P5 pregunta por el OTRO progenitor, y su opción «Lo solicitó y se lo denegaron» se
   * refiere por tanto a esa otra persona. El motor la leía como si al PROPIO usuario le
   * hubieran denegado el complemento y le devolvía «Posible reclamación retroactiva» con la
   * instrucción de impugnar una resolución denegatoria que él no tenía; mientras, el hombre
   * al que sí se lo habían denegado a él no tenía ninguna casilla donde decirlo. El importe
   * no cambiaba: el fallo era de encuadre legal, que en una app de riesgo 1 ES el producto.
   *
   * 2 hijos → 2 × 36,90 = 73,80 €/mes en los dos escenarios; lo que cambia es el veredicto.
   */
  test('caso 225: la denegación del OTRO progenitor no dispara reclamación; la propia sí', async ({
    page,
  }) => {
    // 4a — al otro progenitor se lo denegaron: eso no me da a mí nada que reclamar
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'Lo solicitó y se lo denegaron',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('+73,80 €/mes'); // 2 × cuantiaPorHijoMensual
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).not.toContain('Posible reclamación retroactiva');
    expect(resultado).not.toContain('resolución denegatoria');

    // 4b — la denegación es MÍA (P6): ahí sí procede valorar reclamación
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+73,80 €/mes'); // el importe es el mismo
    expect(resultado).toContain('Posible reclamación retroactiva');
    expect(resultado).toContain('C-623/23'); // STJUE de 15-may-2025

    // 4c — la asimetría anterior también desaparece: una mujer con denegación propia
    // recibe orientación sobre su resolución, no el silencio del caso general.
    await responderYVerificar(page, {
      pension: 'Jubilación',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Posible reclamación retroactiva');
    expect(resultado).toContain('revisar por qué se te denegó');
  });

  /**
   * CASO 5 — LAS CIFRAS DE LA PÁGINA SALEN DEL MÓDULO (hallazgo 226).
   *
   * Las once apariciones de «36,90 €» estaban tecleadas a mano mientras solo el desglose
   * leía `data/fiscal`. El día de la revalorización, el veredicto habría dicho una cifra y
   * el hero, la tabla, la FAQ y los tips la anterior, sin que nada fallara. Este test lo
   * detectaría: compara el texto renderizado contra el módulo, no contra una constante
   * escrita aquí.
   */
  test('caso 226: hero, tabla y tips muestran la cuantía del módulo fiscal, no una copia', async ({
    page,
  }) => {
    const cuantia = normalizar(
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(36.9),
    );
    const maximo = normalizar(
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(147.6),
    );

    // El subtítulo del hero
    const hero = normalizar(await page.locator('header').innerText());
    expect(hero).toContain(`${cuantia}/mes por hijo`);
    expect(hero).toContain('6 preguntas');

    // La tabla comparativa vive dentro de EducationalSection, que arranca colapsada
    await abrirGuia(page);
    const educativo = normalizar(await page.locator('body').innerText());
    expect(educativo).toContain(`Importe fijo por hijo/a (${cuantia}/mes)`);
    expect(educativo).toContain(`4 hijos × ${cuantia} = ${maximo}/mes`);

    // Y ninguna cifra caducada suelta: la serie histórica sin fuente ya no está
    expect(educativo).not.toContain('30,40 € en 2023');
    expect(educativo).not.toContain('35,90 € en 2025');
  });

  /**
   * CASO 6 — LA CONTRADICCIÓN ENTRE LO QUE VE EL USUARIO Y LO QUE LEEN LAS IAS
   * (hallazgo 228).
   *
   * La FAQ visible decía que el complemento es compatible con el complemento a mínimos y el
   * FAQPage del JSON-LD decía lo contrario. Una de las dos tenía que ser falsa, y la que
   * citan Bing Copilot, ChatGPT o Perplexity para hacer grounding es justo la que el usuario
   * nunca ve. Resuelto contra la fuente: art. 60.3.e) LGSS (redacción del RDL 3/2021), que
   * dispone que el importe del complemento NO cuenta como ingreso para determinar el derecho
   * al complemento por mínimos y que, cuando procede, se suma a la cuantía mínima.
   * En la misma revisión: el art. 60.4 excluye la jubilación parcial, que el JSON-LD daba
   * por compatible.
   */
  test('caso 228: la página y el JSON-LD dicen lo mismo sobre el complemento a mínimos', async ({
    page,
  }) => {
    await abrirGuia(page);
    const visible = normalizar(await page.locator('body').innerText());
    expect(visible).toContain('no cuenta como ingreso');
    expect(visible).toContain('art. 60.3.e) LGSS');

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map(b => JSON.parse(b)).find(j => j['@type'] === 'FAQPage');
    expect(faq).toBeTruthy();
    const textos: string[] = faq.mainEntity.map(
      (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
    );
    const compatibilidad = textos.find(t => t.includes('complemento a mínimos'));
    expect(compatibilidad).toBeTruthy();
    expect(compatibilidad).toContain('compatible con el complemento a mínimos');
    expect(compatibilidad).toContain('60.3.e)');
    // La jubilación parcial queda EXCLUIDA (art. 60.4), no listada como compatible
    expect(compatibilidad).toContain('No procede en la jubilación parcial');
    // Y la revalorización no es «con el IPC», sino la que fije la norma de cada año
    expect(textos.join(' ')).not.toContain('anualmente con el IPC');
  });

  /**
   * CASO 7 — ACCESIBILIDAD DEL CUESTIONARIO Y DEL VEREDICTO (hallazgos 229 y 230).
   *
   * Cuatro de las preguntas usaban un `<label>` suelto, sin `htmlFor` y sin control dentro,
   * así que los grupos de botones no tenían nombre accesible: un lector de pantalla anunciaba
   * «Mujer, botón» sin decir a qué pregunta respondía, y «No lo percibe ni lo ha solicitado»
   * es incomprensible fuera de su enunciado. Y el panel del veredicto —que es el producto
   * entero de la app— no tenía región anunciable: pulsar «Verificar mi derecho» con lector
   * de pantalla no producía ningún aviso.
   */
  test('casos 229 y 230: cada pregunta nombra su grupo y el veredicto se anuncia', async ({
    page,
  }) => {
    const grupos = page.locator('[role="group"]');
    await expect(grupos).toHaveCount(5); // P1, P2, P4, P5 y P6 (P3 es un input con label)

    for (const nombre of [
      '1. ¿Qué pensión percibes (o vas a percibir)?',
      '2. ¿Cuándo se causó (o se causará) tu pensión?',
      '4. Sexo administrativo del solicitante',
      '5. Estado del otro progenitor respecto al complemento',
      '6. ¿Solicitaste tú el complemento y te lo denegaron?',
    ]) {
      await expect(page.getByRole('group', { name: nombre })).toBeVisible();
    }

    // El único label con control asociado sigue siendo el de la P3
    const asociados = await page.locator('label[for]').count();
    expect(asociados).toBe(1);

    // El panel del resultado es una región anunciable, y lo es ANTES de pulsar
    const panel = page.locator('h2', { hasText: 'Resultado orientativo' }).locator('..');
    await expect(panel).toHaveAttribute('aria-live', 'polite');
    await expect(panel).toHaveAttribute('role', 'status');
  });

});

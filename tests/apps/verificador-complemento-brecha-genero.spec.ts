import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — verificador-complemento-brecha-genero (segmento FISCAL / Seguridad Social,
 * riesgo 1 CRÍTICO). Primera versión 24/08/2026; revisada tras la reparación de los siete
 * hallazgos de aquella inspección (misma fecha).
 *
 * RE-INSPECCIÓN 27/08/2026 — los diez hallazgos anteriores (225, 226, 227, 228, 229, 230,
 * 231, 280, 281, 282) se reprodujeron uno a uno en el navegador y CIERRAN todos. Lo que se
 * añade aquí abajo es lo nuevo de esta vuelta:
 *
 *   · PARIDAD web ↔ MCP Delegum — la app tiene un gemelo en
 *     `lib/calculadoras/complementoBrechaGenero.ts`, que alimenta la tool
 *     `calcular_complemento_brecha_genero`. Son DOS implementaciones distintas de la misma
 *     norma, así que una reparación puede aterrizar en una y no en la otra. Se comprueban
 *     los mismos supuestos por las dos vías (test «paridad»).
 *   · Tres hallazgos de la re-inspección del 27/08, REPARADOS ese mismo día. Estaban
 *     escritos con `test.fail()` afirmando lo que debería pasar; al repararlos se les
 *     quitó la marca y ahora sujetan la reparación.
 *
 * DE DÓNDE SALE CADA CIFRA
 * ────────────────────────
 * Toda cifra esperada viene de `COMPLEMENTO_BRECHA_GENERO_2026` en
 * `data/fiscal/pensiones.ts` (líneas 440-455), sellado el 13/05/2026 contra
 * «Art. 60 LGSS (RDL 8/2015, modificado por RDL 3/2021) + RDL 3/2026»
 * (COMPLEMENTO_BRECHA_GENERO_META.fuente / .verificado / .urlOficial):
 *
 *   · cuantiaPorHijoMensual     = 36.90        → importe mensual por hijo/a computable
 *   · maxHijos                  = 4            → tope de hijos computables
 *   · maxMensual                = 147.60       → 4 × 36,90 (comprobación cruzada del tope)
 *   · maxAnual                  = 2066.40      → 147,60 × 14 (comprobación cruzada)
 *   · pagasAnuales              = 14           → el complemento se abona en 14 pagas
 *   · fechaMinimaHechoCausante  = '2021-02-04' → corte del derecho (RDL 3/2021)
 *   · pensionesElegibles        = ['jubilacion', 'incapacidad_permanente', 'viudedad']
 *                                              → SOLO pensiones contributivas
 *
 * NINGUNA cifra de este fichero sale de la memoria sobre pensiones españolas: si el módulo
 * fiscal se revaloriza (RDL de pensiones de cada año), estos tests deben fallar y hay que
 * volver a derivarlos del módulo, no «ajustarlos» a lo que muestre la app.
 *
 * Los tres casos troncales (derecho · límite · denegación) se resolvieron a mano ANTES de
 * ejecutar la app; el cálculo va escrito junto a la aserción. Detrás van las regresiones de
 * los siete hallazgos ya reparados.
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
   * CASO 1 — DA DERECHO, y en el tope exacto del módulo.
   *
   * Hombre · VIUDEDAD (está en `pensionesElegibles`, y es la pensión que menos se asocia a
   * este complemento) · hecho causante posterior a `fechaMinimaHechoCausante` · 4 hijos ·
   * sin otro progenitor · sin denegación propia.
   *
   * Qué decide cada respuesta:
   *   P1 viudedad ∈ pensionesElegibles          → no cae en «no contributiva» ni «ninguna»
   *   P2 desde 4-feb-2021 ≥ fechaMinima         → no cae en el corte temporal
   *   P3 4 hijos > 0                            → hay hijos computables
   *   P5 «sin otro progenitor» ≠ percibe        → no hay incompatibilidad por concurrencia
   *   P6 sin denegación propia                  → caso general, NO reclamación
   *   P4 hombre                                 → motivo apoyado en la doctrina TJUE/TS 2025
   *
   * Cálculo a mano:
   *   hijos computables = mín(4, maxHijos 4)               = 4
   *   mensual           = 4 × cuantiaPorHijoMensual 36,90  = 147,60 € (= maxMensual)
   *   anual             = 147,60 × pagasAnuales 14         = 2066,40 € (= maxAnual)
   */
  test('caso 1 (derecho): hombre, viudedad y 4 hijos → 147,60 €/mes, el tope del módulo', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: 4,
      sexo: 'Hombre',
      otroProgenitor: 'No procede (sin otro progenitor)',
    });

    const resultado = await textoResultado(page);

    expect(resultado).toContain('+147,60 €/mes'); // 4 × 36,90 = maxMensual
    expect(resultado).toContain('Cumples los requisitos básicos');

    // Desglose económico, cifra a cifra contra el módulo fiscal
    expect(resultado).toContain('Hijos computables 4 (máx. 4)'); // maxHijos = 4
    expect(resultado).toContain('Cuantía por hijo 36,90 €/mes'); // cuantiaPorHijoMensual
    expect(resultado).toContain('Mensual estimado 147,60 €/mes'); // maxMensual
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año'); // maxAnual (147,60 × 14)

    // El veredicto positivo a un HOMBRE se apoya en la doctrina de 2025, no en el silencio
    expect(resultado).toContain('art. 60 LGSS');
    expect(resultado).toContain('los hombres tienen derecho al complemento en las mismas');
    // …y sin denegación propia no se le invita a impugnar nada (ver caso 225 más abajo)
    expect(resultado).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * CASO 2 — LÍMITE: el mismo perfil a un lado y a otro del corte del 4-feb-2021.
   *
   * `fechaMinimaHechoCausante` = '2021-02-04' (entrada en vigor del RDL 3/2021). Mujer,
   * jubilación, 3 hijos, otro progenitor que no lo percibe: lo ÚNICO que cambia entre 2a y
   * 2b es la fecha del hecho causante, así que cualquier diferencia en el veredicto es
   * atribuible al corte y a nada más.
   *
   *   2a) antes del 4-feb-2021  → NO procede (regía el antiguo complemento de maternidad)
   *   2b) el 4-feb-2021 o después → mensual = 3 × 36,90 = 110,70 €
   *                                 anual   = 110,70 × 14 = 1549,80 €
   *   2c) pensión aún sin solicitar → NO procede: el complemento se reconoce sobre una
   *       pensión ya causada, no sobre una expectativa.
   */
  test('caso 2 (límite): el corte del 4-feb-2021 decide, y solo él', async ({ page }) => {
    // 2a — hecho causante ANTERIOR al corte
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Antes del 4-feb-2021',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('antes del 4 de febrero de 2021'); // fechaMinimaHechoCausante
    expect(resultado).toContain('antiguo complemento de maternidad');
    expect(resultado).not.toContain('Desglose económico'); // sin derecho, sin importe
    expect(resultado).not.toContain('€/mes');

    // 2b — el MISMO perfil, un día al otro lado del corte
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+110,70 €/mes'); // 3 × cuantiaPorHijoMensual 36,90
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Hijos computables 3 (máx. 4)');
    expect(resultado).toContain('Mensual estimado 110,70 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1549,80 €/año'); // 110,70 × pagasAnuales 14

    // 2c — pensión aún sin causar: tampoco procede todavía
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Aún sin solicitar',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('Aún no tienes una pensión causada');
  });

  /**
   * CASO 2 bis — LÍMITE en el otro eje: el número de hijos.
   *
   *   1 hijo  — el complemento actual se genera DESDE 1 hijo/a. Si la app arrastrase la
   *             regla del antiguo complemento de maternidad (2 o más), aquí diría que no.
   *               mensual = 1 × 36,90 = 36,90 €   ·   anual = 36,90 × 14 = 516,60 €
   *   5 hijos — por encima de `maxHijos` = 4 el importe NO puede seguir creciendo:
   *               mensual = mín(5, 4) × 36,90 = 147,60 € = maxMensual
   *   0 hijos — al otro lado del umbral: sin hijos computables no procede.
   */
  test('caso 2 bis (límite): 1 hijo procede, 5 hijos topan en 4 y 0 hijos no procede', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 1,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('+36,90 €/mes'); // cuantiaPorHijoMensual × 1
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Hijos computables 1 (máx. 4)');
    expect(resultado).toContain('Anual (14 pagas) 516,60 €/año'); // 36,90 × 14

    await responderYVerificar(page, {
      pension: 'Incapacidad permanente', // también en pensionesElegibles
      fecha: 'El 4-feb-2021 o después',
      hijos: 5,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+147,60 €/mes'); // maxMensual: el 5º hijo no suma
    expect(resultado).toContain('Hijos computables 4 (máx. 4)'); // maxHijos
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año'); // maxAnual

    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 0,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('al menos un hijo');
    expect(resultado).not.toContain('Desglose económico');
  });

  /**
   * CASO 3 — DENEGADO por las dos vías que el art. 60 LGSS cierra:
   *
   *   3a) CONCURRENCIA — el otro progenitor ya percibe el complemento por los mismos hijos.
   *       Cada hijo/a genera el complemento para UNO solo de los progenitores
   *       (COMPLEMENTO_BRECHA_GENERO_META.nota), así que no procede, y el paso siguiente
   *       debe explicar la regla de asignación (pensión pública de menor cuantía) en vez de
   *       dejar al usuario sin salida.
   *   3b) PENSIÓN NO CONTRIBUTIVA — `pensionesElegibles` solo admite jubilación,
   *       incapacidad permanente y viudedad contributivas.
   *
   * En ninguno de los dos puede aparecer importe: un «no procede» con una cifra al lado en
   * una app de riesgo 1 es peor que no responder.
   */
  test('caso 3 (denegado): concurrencia y pensión no contributiva → sin derecho y sin importe', async ({
    page,
  }) => {
    // 3a — el otro progenitor ya lo percibe
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('solo genera el complemento para uno de los progenitores');
    expect(resultado).toContain('pensión pública de menor cuantía'); // regla de asignación
    expect(resultado).not.toContain('Desglose económico');
    expect(resultado).not.toContain('€/mes');

    // 3b — pensión no contributiva
    await responderYVerificar(page, {
      pension: 'No contributiva',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('solo se aplica a pensiones contributivas'); // pensionesElegibles
    expect(resultado).not.toContain('Desglose económico');
    expect(resultado).not.toContain('€/mes');

    // El «no» se enmarca como orientación revisable, no como sentencia sobre la persona
    expect(resultado).toContain('Revisa el motivo abajo');
    expect(resultado).toContain('revisa entonces tu derecho');
    expect(resultado).toContain('El reconocimiento definitivo lo realiza el INSS');
  });

  /**
   * CASO 225 — QUIÉN TUVO LA DENEGACIÓN (hallazgo alto, reparado).
   *
   * La P5 pregunta por el OTRO progenitor, y su opción «Lo solicitó y se lo denegaron» se
   * refiere por tanto a esa otra persona. El motor la leía como si al PROPIO usuario le
   * hubieran denegado el complemento y le devolvía «Posible reclamación retroactiva» con la
   * instrucción de impugnar una resolución denegatoria que él no tenía; mientras, el hombre
   * al que sí se lo habían denegado a él no tenía ninguna casilla donde decirlo. El importe
   * no cambiaba: el fallo era de encuadre legal, que en una app de riesgo 1 ES el producto.
   *
   * 2 hijos → 2 × 36,90 = 73,80 €/mes en los cuatro escenarios en que procede; lo que
   * cambia es el veredicto. Se prueban LAS DOS ramas del árbol, no solo la que lo destapó.
   */
  test('caso 225: la denegación del OTRO progenitor no dispara reclamación; la propia sí', async ({
    page,
  }) => {
    // 225a — al otro progenitor se lo denegaron: eso no me da a mí nada que reclamar
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
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

    // 225b — la denegación es MÍA (P6): ahí sí procede valorar reclamación
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
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

    // 225c — la asimetría anterior también desaparece: una mujer con denegación propia
    // recibe orientación sobre su resolución, no el silencio del caso general.
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Posible reclamación retroactiva');
    expect(resultado).toContain('revisar por qué se te denegó');

    // 225d — precedencia: si el otro progenitor YA lo percibe, la denegación propia fue
    // conforme a derecho. La app no puede mandar a reclamar sobre una denegación válida.
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      denegacionPropia: true,
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('solo genera el complemento para uno de los progenitores');
    expect(resultado).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * CASO 226 — LAS CIFRAS DE LA PÁGINA SALEN DEL MÓDULO (hallazgo medio, reparado).
   *
   * Las once apariciones de «36,90 €» estaban tecleadas a mano mientras solo el desglose
   * leía `data/fiscal`. El día de la revalorización, el veredicto habría dicho una cifra y
   * el hero, la tabla, la FAQ y los tips la anterior, sin que nada fallara. Este test lo
   * detectaría: compara el texto renderizado contra el módulo, no contra una constante
   * escrita aquí.
   *
   * Cubre además el hallazgo de la SERIE HISTÓRICA (bajo): la lista «30,40 € en 2023 ·
   * 33,20 € en 2024 · 35,90 € en 2025» del bloque de errores frecuentes no existía en
   * `data/fiscal` ni citaba fuente propia, así que quedaba fuera del alcance de
   * `/triaje-fiscal`. Se retiró: solo el valor vigente, que sí es anclable, sigue en pie.
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
    expect(educativo).not.toContain('33,20 € en 2024');
    expect(educativo).not.toContain('35,90 € en 2025');
  });

  /**
   * CASO 228 — LA CONTRADICCIÓN ENTRE LO QUE VE EL USUARIO Y LO QUE LEEN LAS IAS
   * (hallazgo medio, reparado).
   *
   * La FAQ visible decía que el complemento es compatible con el complemento a mínimos y el
   * FAQPage del JSON-LD decía lo contrario. Una de las dos tenía que ser falsa, y la que
   * citan Bing Copilot, ChatGPT o Perplexity para hacer grounding es justo la que el usuario
   * nunca ve. Resuelto contra la fuente: art. 60.3.e) LGSS (redacción del RDL 3/2021), que
   * dispone que el importe del complemento NO cuenta como ingreso para determinar el derecho
   * al complemento por mínimos y que, cuando procede, se suma a la cuantía mínima.
   *
   * Se comprueba también que sigue sin colarse la revalorización «con el IPC», que no dice
   * ni el módulo ni la FAQ visible (la cuantía la fija la LPGE o el RDL de cada año).
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
    // La revalorización no es «con el IPC», sino la que fije la norma de cada año
    expect(textos.join(' ')).not.toContain('anualmente con el IPC');
    // Y el JSON-LD ya cuenta las 6 preguntas reales del cuestionario, no 5
    expect(textos.join(' ')).toContain('en 6 preguntas');
  });

  /**
   * CASO 280 — LA JUBILACIÓN PARCIAL, QUE EL FAQPage EXCLUÍA Y LA HERRAMIENTA NO.
   *
   * El art. 60.4 LGSS excluye expresamente el complemento en la jubilación parcial del
   * art. 215 LGSS, y solo lo reconoce cuando desde ella se accede a la jubilación plena.
   * Eso lo decía el faqJsonLd desde la reparación del hallazgo 6 —o sea, lo leían Bing
   * Copilot, ChatGPT y Perplexity—, pero el cuestionario ofrecía un único botón
   * «Jubilación» sin distinguir, el motor no contemplaba el caso y la palabra «parcial»
   * no aparecía en toda la página: un jubilado parcial con 2 hijos recibía «+73,80 €/mes ·
   * Cumples los requisitos básicos».
   *
   * Ahora la exclusión vive en `data/fiscal` (COMPLEMENTO_BRECHA_GENERO_2026.exclusiones),
   * la aplican tanto la app como `lib/calculadoras/complementoBrechaGenero.ts` —que alimenta
   * el MCP de Delegum— y la P1 la pregunta.
   */
  test('caso 280: la jubilación parcial se pregunta y se deniega por el art. 60.4 LGSS', async ({
    page,
  }) => {
    // El mismo supuesto que en jubilación plena SÍ da derecho: la única variable es la P1
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    expect(await textoResultado(page)).toContain('73,80 €');

    await page.reload();
    await responderYVerificar(page, {
      pension: 'Jubilación parcial',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('60.4');
    expect(resultado).toContain('jubilación parcial');
    expect(resultado).not.toContain('73,80 €');
    // Y lo que la ley sí permite tiene que decirse, o el veredicto engaña por el otro lado
    expect(resultado).toContain('jubilación plena');
  });

  /**
   * CASO 281/282 — LO QUE LEEN LOS BUSCADORES Y EL SELLO DE LA FECHA.
   *
   * El `featureList` del WebApplication seguía anunciando «5 preguntas» cuando el
   * cuestionario tiene 6 desde la reparación del hallazgo 1: todo lo demás se había
   * actualizado y el único sitio que discrepaba era justo el que consumen buscadores y LLM.
   *
   * Y el sello de <DataReference> imprimía «13/5/2026», sin ceros a la izquierda, contra el
   * DD/MM/YYYY que el CLAUDE.md global §2 declara obligatorio. El origen estaba en
   * `formatDate` (lib/formatters.ts), así que la corrección alcanza a toda app con
   * <DataReference> y a las 25 fichas de datos fiscales de Delegum.
   */
  test('casos 281 y 282: el JSON-LD cuenta 6 preguntas y la fecha lleva sus ceros', async ({
    page,
  }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map(b => JSON.parse(b)).find(j => j['@type'] === 'WebApplication');
    expect(app).toBeTruthy();
    expect(app.featureList[0]).toContain('6 preguntas');
    expect(app.featureList.join(' ')).not.toContain('5 preguntas');

    const visible = normalizar(await page.locator('body').innerText());
    expect(visible).toContain('13/05/2026');
    expect(visible).not.toContain('13/5/2026');
  });

  /**
   * CASO 229/230 — ACCESIBILIDAD DEL CUESTIONARIO Y DEL VEREDICTO (dos hallazgos bajos,
   * reparados).
   *
   * Cuatro de las preguntas usaban un `<label>` suelto, sin `htmlFor` y sin control dentro,
   * así que los grupos de botones no tenían nombre accesible: un lector de pantalla anunciaba
   * «Mujer, botón» sin decir a qué pregunta respondía, y «No lo percibe ni lo ha solicitado»
   * es incomprensible fuera de su enunciado. Y el panel del veredicto —que es el producto
   * entero de la app— no tenía región anunciable: pulsar «Verificar mi derecho» con lector
   * de pantalla no producía ningún aviso.
   *
   * Se añade aquí la tercera regla del CLAUDE.md §5 sobre la que también hubo hallazgo
   * (emojis decorativos junto a texto): todos los `<button>` llevan `type` y ningún emoji
   * de los títulos de escenario queda sin `aria-hidden` (verificable además con
   * `node scripts/check-a11y-jsx.mjs app/verificador-complemento-brecha-genero/page.tsx`).
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

    // Ningún <button> sin type= (candado npm run check:a11y-jsx, CLAUDE.md §5).
    // Se excluye el overlay de `next dev`, cuyo botón «Open Next.js Dev Tools» no lleva
    // type y no es de la app: contra el servidor de desarrollo daba un rojo que en
    // producción no existe, y un test que solo pasa en un entorno no informa de nada.
    expect(
      await page.locator('button:not([type]):not([data-nextjs-dev-tools-button])').count(),
    ).toBe(0);
  });

  /**
   * CASO 231 — EL PANEL NO SE QUEDA CON UN VEREDICTO CADUCO.
   *
   * El veredicto se calcula sobre las 6 respuestas, así que cambiar cualquiera de ellas
   * tiene que invalidar lo que hay en pantalla: un importe de la combinación anterior junto
   * a las respuestas nuevas sería exactamente el error que esta app no se puede permitir.
   */
  test('caso 231: cambiar una respuesta invalida el veredicto anterior', async ({ page }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    expect(await textoResultado(page)).toContain('+73,80 €/mes'); // 2 × 36,90

    // Cambiar el número de hijos sin volver a verificar: el panel vuelve a la espera
    await page.locator('#hijos').fill('4');
    let resultado = await textoResultado(page);
    expect(resultado).toContain('Completa las 6 preguntas');
    expect(resultado).not.toContain('73,80');

    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    resultado = await textoResultado(page);
    expect(resultado).toContain('+147,60 €/mes'); // 4 × 36,90 = maxMensual

    // Cambiar la fecha del hecho causante también lo invalida
    await page.getByRole('button', { name: 'Antes del 4-feb-2021', exact: true }).click();
    expect(await textoResultado(page)).toContain('Completa las 6 preguntas');
  });

  /**
   * PARIDAD — la web y el MCP de Delegum tienen que dar el MISMO número (27/08/2026).
   *
   * `evaluar()` de page.tsx y `calcularComplementoBrechaGenero()` de
   * lib/calculadoras/complementoBrechaGenero.ts son DOS implementaciones separadas de la
   * misma norma: la app no importa la calculadora. Comparten `data/fiscal`, pero no el
   * árbol de decisión, así que una reparación puede aterrizar en una y dejar la otra atrás
   * —es lo que se encontró en `simulador-heredar-vivienda`, donde web y MCP divergían en
   * 19.486,71 € sobre el caso preconfigurado de la propia app—.
   *
   * Se pregunta al MCP por HTTP (la tool real, no la función suelta) y se compara contra
   * lo que muestra el panel de la web para el mismo supuesto. La barra final de la ruta NO
   * es opcional: sin ella Next responde con una redirección y el cuerpo no es JSON-RPC.
   */
  test('paridad: la web y la tool del MCP Delegum dan el mismo importe', async ({
    page,
    request,
  }) => {
    /** Llama a `calcular_complemento_brecha_genero` y devuelve el texto de la respuesta. */
    async function porMcp(argumentos: Record<string, unknown>): Promise<string> {
      const respuesta = await request.post('/api/mcp/delegum/', {
        headers: { Accept: 'application/json, text/event-stream' },
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'calcular_complemento_brecha_genero', arguments: argumentos },
        },
      });
      expect(respuesta.ok()).toBeTruthy();
      const cuerpo = await respuesta.json();
      return normalizar(cuerpo.result.content[0].text);
    }

    // a) 3 hijos, jubilación, mujer → 3 × 36,90 = 110,70 €/mes · × 14 = 1549,80 €/año
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    let web = await textoResultado(page);
    let mcp = await porMcp({
      sexo: 'mujer',
      num_hijos: 3,
      tipo_pension: 'jubilacion',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'no_percibe',
      denegacion_propia: false,
    });
    expect(web).toContain('+110,70 €/mes');
    expect(mcp).toContain('110,70 €/mes');
    expect(web).toContain('Anual (14 pagas) 1549,80 €/año');
    expect(mcp).toContain('1549,80 €/año');

    // b) el tope: 7 hijos topan en maxHijos = 4 → 147,60 €/mes (maxMensual) por las dos vías
    await page.reload();
    await responderYVerificar(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: 7,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    web = await textoResultado(page);
    mcp = await porMcp({
      sexo: 'hombre',
      num_hijos: 7,
      tipo_pension: 'incapacidad_permanente',
      fecha_hecho_causante: 'desde_2021',
    });
    expect(web).toContain('+147,60 €/mes');
    expect(web).toContain('Hijos computables 4 (máx. 4)');
    expect(mcp).toContain('147,60 €/mes');
    expect(mcp).toContain('Hijos computables: 4');
    expect(mcp).toContain('2066,40 €/año'); // maxAnual

    // c) la exclusión del art. 60.4 tiene que denegar por las dos vías, no solo en la web
    await page.reload();
    await responderYVerificar(page, {
      pension: 'Jubilación parcial',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    web = await textoResultado(page);
    mcp = await porMcp({
      sexo: 'mujer',
      num_hijos: 2,
      tipo_pension: 'jubilacion_parcial',
      fecha_hecho_causante: 'desde_2021',
    });
    expect(web).toContain('60.4');
    expect(mcp).toContain('60.4');
    expect(web).not.toContain('73,80 €');
    expect(mcp).not.toContain('73,80 €');

    // d) la denegación del OTRO progenitor tampoco dispara reclamación por el MCP
    mcp = await porMcp({
      sexo: 'hombre',
      num_hijos: 2,
      tipo_pension: 'jubilacion',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'denegado',
      denegacion_propia: false,
    });
    expect(mcp).toContain('73,80 €/mes'); // 2 × 36,90, igual que la web
    expect(mcp).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * HALLAZGO ABIERTO (27/08/2026) — el campo «hijos» se traga lo tecleado antes de un
   * carácter que el navegador rechaza, y los dígitos siguientes forman OTRO número.
   *
   * `onChange` hace `Math.max(0, parseInt(e.target.value) || 0)`. En un `<input
   * type="number">`, mientras el contenido no es un número válido el navegador devuelve
   * cadena vacía en `.value`: al teclear el punto de «2.5», `parseInt('') || 0` da 0, React
   * reescribe el campo a «0» y se pierde el 2 que el usuario ya había escrito. El «5» que
   * viene después aterriza detrás de ese cero y el campo queda en «05».
   *
   * Traza tecla a tecla, medida en el navegador:
   *     «2» → [2]    «.» → [0]    «5» → [05]
   *
   * Consecuencia: quien teclea «2.5» recibe el veredicto de CUATRO hijos —el tope del
   * módulo— en vez del de dos. 4 × 36,90 = 147,60 €/mes frente a 2 × 36,90 = 73,80 €/mes:
   * el importe se DUPLICA, y el panel lo presenta con un «Cumples los requisitos básicos»
   * sin ninguna señal de que la entrada se haya reinterpretado.
   *
   * El mismo mecanismo con «1.500» deja el campo en «0500» (→ tope, 147,60 €/mes) y con
   * «-3» en «03» (→ 3 hijos): un número imposible se convierte en uno posible en silencio.
   *
   * No lo ve `npm run check:parser`, y con razón: no hay `parseFloat(x.replace(',','.'))`
   * por ningún lado. El defecto no es el parser casero sino el campo controlado que
   * sobrescribe con «0» cada pulsación intermedia inválida.
   */
  test(
    'REGRESIÓN: teclear «2.5» en el campo de hijos ya no duplica el importe',
    async ({ page }) => {
      const campo = page.locator('#hijos');
      await campo.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.type('2.5');

      // 1) El campo no puede quedarse en «05» habiendo tecleado «2.5»
      expect(await campo.inputValue()).not.toBe('05');

      await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
      const resultado = await textoResultado(page);

      // 2) ⚠️ El acta admitía dos desenlaces —«2 hijos computables» o «un rechazo explícito
      //    de la entrada»— y la reparación elige el SEGUNDO. Adivinar que «2.5» significa 2
      //    es exactamente la clase de suposición que produjo el defecto: por el mismo camino,
      //    «2.5» podría ser un 25 mal tecleado. En una app de riesgo 1 sobre pensiones, lo
      //    que no es un número se dice, no se interpreta.
      expect(resultado).not.toContain('+147,60 €/mes'); // maxMensual: el defecto original
      expect(resultado).not.toContain('+73,80 €/mes');  // tampoco se adivina la intención
      expect(resultado).toContain('no es un número entero de hijos');
      // Y el motivo nombra el CAMPO, no el fondo: «no tienes hijos» sería otra cosa
      expect(resultado).not.toContain('exige al menos un hijo');

      // 3) Corregido el campo, el veredicto sale: 2 × cuantiaPorHijoMensual 36,90 = 73,80
      await campo.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.type('2');
      await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
      const corregido = await textoResultado(page);
      expect(corregido).toContain('Hijos computables 2 (máx. 4)');
      expect(corregido).toContain('+73,80 €/mes');

      // 4) Las otras dos entradas del acta, por el mismo mecanismo: «1.500» acababa en
      //    «0500» (→ tope, 147,60 €/mes) y «-3» en «03» (→ 3 hijos).
      for (const basura of ['1.500', '-3']) {
        await campo.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.type(basura);
        await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
        const veredicto = await textoResultado(page);
        expect(veredicto).not.toContain('+147,60 €/mes');
        expect(veredicto).not.toContain('+110,70 €/mes'); // 3 hijos, que es en lo que caía «-3»
      }
    },
  );

  /**
   * HALLAZGO ABIERTO (27/08/2026) — la guía educativa no se enteró de la exclusión del
   * art. 60.4 LGSS.
   *
   * La reparación del hallazgo 280 llevó la exclusión de la jubilación parcial a
   * `data/fiscal` (COMPLEMENTO_BRECHA_GENERO_2026.exclusiones), al motor de la app, a la
   * calculadora del MCP y al `faqJsonLd` de metadata.ts. Todo menos el bloque educativo:
   * ahí «parcial» y «60.4» no aparecen ni una vez, la fila «Pensiones cubiertas» de la
   * tabla comparativa sigue diciendo «Jubilación, IP, viudedad (contributivas)» y la FAQ
   * «¿Sirve para pensiones no contributivas o PCI?» enumera las mismas tres sin matiz.
   *
   * Es el patrón del hallazgo 280 con el signo cambiado: entonces la IA leía la exclusión
   * y el usuario no la recibía; ahora el usuario que se limita a LEER la guía —sin pasar
   * por el cuestionario— concluye que su jubilación parcial está cubierta, mientras la
   * herramienta, el MCP y los datos estructurados dicen lo contrario.
   */
  test(
    'REGRESIÓN: la guía educativa menciona la exclusión de la jubilación parcial (art. 60.4)',
    async ({ page }) => {
      await abrirGuia(page);
      const guia = normalizar(
        await page
          .locator('section')
          .filter({ hasText: 'Comparativa: antiguo complemento' })
          .first()
          .innerText(),
      );

      // La exclusión que el motor SÍ aplica tiene que estar también en lo que se lee
      expect(guia.toLowerCase()).toContain('parcial');
      expect(guia).toContain('60.4');
    },
  );

  /**
   * HALLAZGO ABIERTO (27/08/2026) — plazos y subapartados normativos tecleados en el JSX.
   *
   * CLAUDE.md prohíbe hardcodear datos normativos —incluidos los PLAZOS LEGALES— pudiendo
   * vivir en `data/fiscal`, y el precedente es de esta misma app: al reparar el hallazgo
   * 280 la exclusión del art. 60.4 se movió al módulo fiscal precisamente para que el ciclo
   * `/triaje-fiscal` pudiera revisarla. Con estos otros datos no se hizo:
   *
   *   · el plazo de 30 días de la reclamación previa, tres veces en page.tsx, y calificado
   *     de «naturales» en solo una de las tres (las otras dos lo dejan sin adjetivo, así
   *     que la propia página no dice lo mismo tres veces);
   *   · el «≈ 90 días» de resolución del INSS;
   *   · los subapartados art. 60.3.d) —no computa al límite máximo de pensiones— y
   *     art. 60.3.e) —compatibilidad con el complemento a mínimos—, este último también en
   *     el `faqJsonLd`, que es lo que citan Bing Copilot, ChatGPT y Perplexity.
   *
   * Ninguno está en `COMPLEMENTO_BRECHA_GENERO_2026` ni en su `_META`, de modo que quedan
   * fuera del alcance de cualquier revisión de vigencia. Hoy no hay error numérico; el
   * riesgo es el de siempre, envejecer sin que nada falle.
   */
  test('REGRESIÓN: los plazos legales viven en data/fiscal, no tecleados en page.tsx', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');

    const pagina = readFileSync(
      join(process.cwd(), 'app', 'verificador-complemento-brecha-genero', 'page.tsx'),
      'utf8',
    );
    const fiscal = readFileSync(join(process.cwd(), 'data', 'fiscal', 'pensiones.ts'), 'utf8');

    // El plazo de la reclamación previa no puede estar escrito en el componente…
    expect(pagina).not.toMatch(/30 días/);
    // …ni el de resolución del INSS…
    expect(pagina).not.toMatch(/90 días/);
    // …y los subapartados del art. 60 que la página cita tienen que existir en el módulo
    // fiscal, como ya existe la exclusión del 60.4 (`exclusiones`).
    expect(fiscal).toContain('60.3.d');
    expect(fiscal).toContain('60.3.e');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // RE-INSPECCIÓN DE CIERRE — 28/08/2026
  //
  // Mitad A (cierre de la reparación e1a42c65): la deduplicación de los plazos, los
  // subapartados del art. 60.3 y la exclusión del art. 60.4 CIERRA en `page.tsx` y en la
  // guía visible —lo comprueban los tests de arriba y se reprodujo en navegador—, pero
  // quedan copias supervivientes FUERA de `page.tsx`, que es donde mira el candado que
  // dejó aquella reparación. Van marcadas con `test.fail()` abajo.
  //
  // Mitad B: tres casos nuevos resueltos a mano contra `COMPLEMENTO_BRECHA_GENERO_2026`
  // ANTES de abrir el navegador.
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * CASO 4 (LÍMITE) — el tope del módulo DENTRO de la rama que manda a un abogado.
   *
   * Resuelto a mano con `COMPLEMENTO_BRECHA_GENERO_2026` antes de ejecutar la app:
   *
   *   P1 incapacidad permanente ∈ pensionesElegibles → no cae en «no contributiva»
   *   P2 desde el 4-feb-2021 ≥ fechaMinimaHechoCausante → no cae en el corte temporal
   *   P3 4 hijos = maxHijos → hijosComputables = mín(4, 4) = 4
   *   P5 «lo solicitó y se lo denegaron» es una respuesta sobre el OTRO progenitor, así
   *      que no dispara nada (es lo que fijó el hallazgo 225)
   *   P6 denegación PROPIA = sí → esReclamacion = true
   *
   *   mensual = 4 × cuantiaPorHijoMensual 36,90 = 147,60 € (= maxMensual)
   *   anual   = 147,60 × pagasAnuales 14        = 2066,40 € (= maxAnual)
   *
   * Y el BORDE exacto: con 5 hijos y todo lo demás igual el importe NO cambia, porque el
   * quinto cae fuera de maxHijos. Ningún caso anterior cruzaba estas dos cosas: el tope se
   * probaba en la rama «cumples los requisitos» y la reclamación, con 2 hijos.
   */
  test('caso 4 (límite): 4 hijos y denegación propia → 147,60 €/mes con reclamación, y el 5.º no suma', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: 4,
      sexo: 'Hombre',
      otroProgenitor: 'Lo solicitó y se lo denegaron',
      denegacionPropia: true,
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+147,60 €/mes'); // 4 × 36,90 = maxMensual
    expect(resultado).toContain('Hijos computables 4 (máx. 4)');
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año'); // maxAnual
    expect(resultado).toContain('Posible reclamación retroactiva'); // P6, no P5
    expect(resultado).toContain('C-623/23');

    // El borde: el quinto hijo no existe para el módulo
    await page.locator('#hijos').fill('5');
    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    const conCinco = await textoResultado(page);
    expect(conCinco).toContain('+147,60 €/mes'); // idéntico: maxHijos = 4
    expect(conCinco).toContain('Hijos computables 4 (máx. 4)');
  });

  /**
   * CASO 5 (RECHAZO) — la exclusión del art. 60.4 manda sobre la doctrina TJUE.
   *
   * Hombre con jubilación PARCIAL, 3 hijos y una resolución denegatoria propia. Las dos
   * ramas se pisan: la del art. 60.4 (no hay derecho) y la de la reclamación retroactiva
   * (denegación propia + hombre). Resuelto a mano: si la ley excluye la modalidad, no hay
   * derecho que reclamar, luego la exclusión es previa y el veredicto tiene que ser un
   * rechazo limpio, sin el 3 × 36,90 = 110,70 €/mes y sin mandar a nadie a impugnar una
   * denegación que fue correcta.
   *
   * Es el orden de evaluación lo que se prueba, no el importe: invertirlo produciría el
   * peor desenlace posible en una app de riesgo 1 —«posible reclamación retroactiva» a
   * quien no tiene nada que reclamar—.
   */
  test('caso 5 (rechazo): jubilación parcial con denegación propia → art. 60.4, y NADA de reclamación', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación parcial',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('60.4'); // exclusiones[0].norma
    expect(resultado).not.toContain('Posible reclamación retroactiva');
    expect(resultado).not.toContain('110,70 €'); // 3 × 36,90: no debe aparecer
    expect(resultado).not.toContain('C-623/23');
  });

  /**
   * Hallazgo 503 — reparado. El FAQPage de `metadata.ts` ya deriva los subapartados del
   * art. 60.3/60.4 (`COMPLEMENTO_BRECHA_GENERO_2026.exclusiones` /
   * `.concurrencia.compatibleConComplementoAMinimos.norma`) y la fecha del corte
   * (`formatFechaLarga(fechaMinimaHechoCausante)`), en vez de tenerlos tecleados a mano.
   */
  test(
    'REGRESIÓN: el faqJsonLd de metadata.ts deriva el art. 60.3/60.4 de data/fiscal',
    async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const meta = readFileSync(
        join(process.cwd(), 'app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
        'utf8',
      );
      // Igual que ya deriva CUANTIA / MAX_HIJOS / MAX_MES, el FAQPage tiene que derivar los
      // subapartados normativos del módulo en vez de repetirlos.
      expect(meta).toMatch(/COMPLEMENTO_BRECHA_GENERO_2026\.(exclusiones|concurrencia)/);
    },
  );

  /**
   * Hallazgo 504 — reparado. `fechaMinimaHechoCausante` ahora tiene consumidores reales en
   * `page.tsx`, `metadata.ts` y `complementoBrechaGenero.ts` (vía `formatFechaLarga`, y
   * reexportada como `FECHA_MINIMA_HECHO_CAUSANTE` para el MCP de Delegum). `pensionesElegibles`
   * pasó a ser la red de seguridad de `evaluar()`: si algún tipo de pensión nuevo se cuela sin
   * su propia rama de exclusión, esta lista deniega en vez de conceder por defecto.
   */
  test(
    'REGRESIÓN: fechaMinimaHechoCausante tiene consumidores reales en app y motor',
    async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const consumidores = [
        join('app', 'verificador-complemento-brecha-genero', 'page.tsx'),
        join('app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
        join('lib', 'calculadoras', 'complementoBrechaGenero.ts'),
      ]
        .map(rel => readFileSync(join(process.cwd(), rel), 'utf8'))
        .join('\n');
      expect(consumidores).toContain('fechaMinimaHechoCausante');
    },
  );

  /**
   * Hallazgo 506 — reparado. `hijosEsEntero` y `hijosSuperaLimite` se separaron: ahora un
   * texto que SÍ es un entero pero excede `LIMITE_HIJOS_CAMPO` (20, límite de interfaz, no de
   * la norma) recibe su propio motivo («supera el tope de 20 hijos de este campo»), en vez de
   * la afirmación falsa «no es un número entero».
   */
  test(
    'REGRESIÓN: con 21 hijos el motivo no dice «no es un número entero», porque 21 lo es',
    async ({ page }) => {
      const campo = page.locator('#hijos');
      await campo.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.type('21');
      await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
      expect(await textoResultado(page)).not.toContain('«21» no es un número entero de hijos');
    },
  );

  /**
   * Hallazgo 505 — reparado. La regla («el hijo nacido con vida que fallece después SÍ
   * computa») subió a `data/fiscal/pensiones.ts` como `computoHijoFallecido`, con su fuente:
   * STS 748/2023 (ECLI:ES:TS:2023:748), Pleno Sala IV, 10-mar-2023, que distingue este caso
   * del hijo nacido SIN vida (art. 60.1 LGSS, no computa). La FAQ ya cita norma y sentencia.
   */
  test(
    'REGRESIÓN: la FAQ de los hijos fallecidos cita norma y sentencia',
    async ({ page }) => {
      await abrirGuia(page);
      const respuesta = normalizar(
        await page
          .locator('h3', { hasText: '¿Y los hijos fallecidos antes de los 16 años?' })
          .locator('..')
          .innerText(),
      );
      expect(respuesta).toMatch(/art\.|LGSS|RDL|Criterio de Gestión|Resolución/);
    },
  );

  /**
   * Hallazgo 507 — reparado. El bloque de errores frecuentes ya no dice «Acordadlo
   * previamente»: ahora coincide con el hint de la P5 y la tarjeta «Documenta la
   * concurrencia familiar» en que la SS asigna de oficio al progenitor de pensión menor,
   * sin margen de pacto entre ellos.
   */
  test(
    'REGRESIÓN: los errores frecuentes no presentan como pactable una atribución reglada',
    async ({ page }) => {
      await abrirGuia(page);
      const guia = normalizar(await page.locator('body').innerText());
      expect(guia).not.toContain('Acordadlo previamente');
    },
  );

  /**
   * Hallazgo 508 — reparado. La tarjeta «Consulta antes de actuar» ya nombra la condición de
   * cada canal: el turno de oficio exige el reconocimiento del derecho a asistencia jurídica
   * gratuita (Ley 1/1996, por umbrales de renta) y la asesoría sindical, estar afiliado.
   */
  test(
    'REGRESIÓN: el turno de oficio nombra su requisito de asistencia jurídica gratuita',
    async ({ page }) => {
      await abrirGuia(page);
      const tarjeta = normalizar(
        await page.locator('h3', { hasText: 'Consulta antes de actuar' }).locator('..').innerText(),
      );
      expect(tarjeta).toMatch(/asistencia jurídica gratuita|afiliad|umbral|requisitos de renta/i);
    },
  );

  // ──────────────────────────────────────────────────────────────────────────
  // RE-INSPECCIÓN 02/09/2026 — segmento fiscal, riesgo 1 CRÍTICO
  //
  // Los 24 tests anteriores se ejecutaron ANTES de tocar nada y pasaron los 24: el cálculo,
  // el corte temporal, la exclusión del art. 60.4 y la paridad con el MCP siguen cerrados.
  // Lo de aquí abajo son tres casos troncales resueltos a mano contra
  // `COMPLEMENTO_BRECHA_GENERO_2026` (data/fiscal/pensiones.ts, líneas 440-513) ANTES de
  // abrir el navegador, y dos hallazgos nuevos marcados con `test.fail()`.
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * CASO 1 (NORMAL) — el perfil mayoritario: mujer con jubilación y tres hijos.
   *
   * Resuelto a mano con el módulo fiscal antes de ejecutar la app:
   *   P1 jubilación ordinaria ∈ pensionesElegibles      → no cae en ninguna exclusión
   *   P2 «El 4-feb-2021 o después» ≥ fechaMinimaHechoCausante ('2021-02-04')
   *   P3 3 hijos → hijosComputables = mín(3, maxHijos 4) = 3
   *   P5 el otro progenitor no lo percibe                → sin incompatibilidad
   *   P6 sin denegación propia                           → NO es reclamación
   *
   *   mensual = 3 × cuantiaPorHijoMensual 36,90 = 110,70 €   ← valor esperado literal
   *   anual   = 110,70 × pagasAnuales 14        = 1549,80 €   ← valor esperado literal
   *
   * Las dos cifras salen de `COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual` (36.90)
   * y `.pagasAnuales` (14), sellados el 13/05/2026 contra el art. 60 LGSS + RDL 3/2026.
   * es-ES no agrupa los millares de un número de cuatro cifras: 1549,80, no 1.549,80.
   */
  test('caso 1 (02/09): mujer, jubilación y 3 hijos → 110,70 €/mes y 1549,80 €/año', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    const resultado = await textoResultado(page);

    expect(resultado).toContain('+110,70 €/mes'); // 3 × cuantiaPorHijoMensual 36,90
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Hijos computables 3 (máx. 4)'); // maxHijos = 4
    expect(resultado).toContain('Cuantía por hijo 36,90 €/mes'); // cuantiaPorHijoMensual
    expect(resultado).toContain('Mensual estimado 110,70 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1549,80 €/año'); // 110,70 × pagasAnuales 14
    expect(resultado).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * CASO 2 (LÍMITE) — SEIS hijos, o sea dos por encima del tope, con todo lo demás igual.
   *
   * El borde de `maxHijos` estaba probado con 5 (caso 2 bis y caso 4). Con 6 se comprueba
   * que el tope es un `Math.min` y no un «suma uno menos»:
   *   hijosComputables = mín(6, maxHijos 4)               = 4
   *   mensual          = 4 × cuantiaPorHijoMensual 36,90  = 147,60 € (= maxMensual)
   *   anual            = 147,60 × pagasAnuales 14         = 2066,40 € (= maxAnual)
   *
   * Los tres valores están escritos literalmente en data/fiscal: `maxHijos: 4`,
   * `maxMensual: 147.60`, `maxAnual: 2066.40`, así que el test los cruza contra el módulo
   * y no contra la aritmética de la propia app.
   */
  test('caso 2 (02/09, límite): 6 hijos topan en maxHijos → 147,60 €/mes, ni un céntimo más', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 6,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    const resultado = await textoResultado(page);

    expect(resultado).toContain('+147,60 €/mes'); // maxMensual, NO 6 × 36,90 = 221,40 €
    expect(resultado).toContain('Hijos computables 4 (máx. 4)'); // maxHijos
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año'); // maxAnual
    expect(resultado).not.toContain('221,40'); // 6 × 36,90 sin tope
  });

  /**
   * CASO 3 (RECHAZO) — hecho causante ANTERIOR al corte, que es el requisito que más gente
   * deja fuera: el complemento nació con el RDL 3/2021 y no alcanza a las pensiones ya
   * causadas.
   *
   *   P2 «Antes del 4-feb-2021» < fechaMinimaHechoCausante ('2021-02-04')
   *   → procede = false, importe = 0, y el motivo tiene que NOMBRAR la fecha del corte,
   *     formateada como `formatFechaLarga('2021-02-04')` = «4 de febrero de 2021».
   *
   * Con 2 hijos, que SÍ darían derecho (2 × 36,90 = 73,80 €/mes) si la fecha no lo impidiera:
   * así el test distingue «no procede por la fecha» de «no procede por falta de hijos».
   */
  test('caso 3 (02/09, rechazo): pensión anterior al 4 de febrero de 2021 → no procede y 0 €', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Antes del 4-feb-2021',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    const resultado = await textoResultado(page);

    expect(resultado).toContain('No procede ahora');
    // La fecha del corte, tal y como la escribe formatFechaLarga(fechaMinimaHechoCausante)
    expect(resultado).toContain('antes del 4 de febrero de 2021');
    expect(resultado).toContain('complemento de maternidad'); // el régimen anterior, nombrado
    // Ni el importe que habría correspondido ni desglose alguno
    expect(resultado).not.toContain('73,80'); // 2 × cuantiaPorHijoMensual 36,90
    expect(resultado).not.toContain('Desglose económico');
    expect(resultado).not.toContain('Cumples los requisitos básicos');
  });

  /**
   * HALLAZGO 02/09/2026 (a) — el plazo de la reclamación previa se publica como «30 días
   * NATURALES», y el precepto que la propia página cita no dice eso.
   *
   * `COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaTipoDias` vale 'naturales', y de
   * ahí sale tres veces en la guía visible (paso 5, tarjeta «Respeta los plazos» y errores
   * frecuentes). El art. 71.2 LRJS —la norma citada— dice literalmente «en el plazo de
   * treinta días desde la notificación de la misma», SIN calificarlos, y el criterio pacífico
   * en prestaciones de Seguridad Social es que son HÁBILES (Ley 39/2015 art. 30.2: los plazos
   * señalados por días son hábiles salvo que se diga otra cosa).
   *
   * Por qué importa aquí y no es una pedantería: 30 días naturales ≈ 21 hábiles. La página
   * remata con «Pasado ese plazo, la resolución gana firmeza y la reclamación se complica»,
   * así que a quien va por el día 35 natural —todavía en plazo— se le está diciendo que ha
   * perdido el tren. En una app de riesgo 1 el encuadre es el producto.
   *
   * ⚠️ El dato vive en data/fiscal, así que su corrección va por /triaje-fiscal con fuente
   * consultada en sesión y OK del usuario, no por una edición suelta desde aquí.
   */
  test.fail(
    'HALLAZGO: la guía publica «30 días naturales» para la reclamación previa (art. 71.2 LRJS)',
    async ({ page }) => {
      await abrirGuia(page);
      const guia = normalizar(await page.locator('body').innerText());
      // Lo que debería leerse cuando el módulo fiscal se corrija
      expect(guia).not.toContain('30 días naturales');
    },
  );

  /**
   * HALLAZGO 02/09/2026 (b) — `COMPLEMENTO_BRECHA_GENERO_META.doctrina` no tiene ni un solo
   * consumidor, mientras la doctrina que describe está tecleada a mano nueve veces.
   *
   * El campo vale 'STJUE C-623/23 (15-may-2025) y STS 9-jul-2025: igualdad de trato
   * hombre/mujer'. En `page.tsx` aparecen a mano «STJUE de 15-may-2025 (C-623/23)»,
   * «9-jul-2025», «STJUE 15-may-2025», «STJUE C-623/23» y «doctrina TS de 9-jul-2025» (7
   * sitios: dos motivos de `evaluar`, el hint de la P4, el de la P6, la tabla comparativa,
   * una FAQ y la tarjeta «Aporta jurisprudencia»), y en `metadata.ts` otras dos, una de
   * ellas dentro del `faqJsonLd` que leen Bing Copilot y ChatGPT.
   *
   * Es exactamente el patrón que cerraron los hallazgos 503, 504 y 505 para la fecha del
   * corte, la exclusión del art. 60.4 y el cómputo del hijo fallecido: el dato subió a
   * data/fiscal y el consumidor se quedó sin conectar. Hoy las nueve copias coinciden con el
   * módulo, así que no hay error visible; el riesgo es la próxima sentencia que matice la
   * doctrina, con el módulo diciendo una cosa y nueve trozos de página la anterior.
   */
  test.fail(
    'HALLAZGO: META.doctrina no tiene consumidores y la jurisprudencia va tecleada a mano',
    async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const consumidores = [
        join('app', 'verificador-complemento-brecha-genero', 'page.tsx'),
        join('app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
        join('lib', 'calculadoras', 'complementoBrechaGenero.ts'),
      ]
        .map(rel => readFileSync(join(process.cwd(), rel), 'utf8'))
        .join('\n');
      expect(consumidores).toContain('COMPLEMENTO_BRECHA_GENERO_META.doctrina');
    },
  );
});

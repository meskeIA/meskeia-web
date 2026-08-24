import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — verificador-complemento-brecha-genero (segmento FISCAL / Seguridad Social,
 * riesgo 1 CRÍTICO). Primera versión 24/08/2026; revisada tras la reparación de los siete
 * hallazgos de aquella inspección (misma fecha).
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
});

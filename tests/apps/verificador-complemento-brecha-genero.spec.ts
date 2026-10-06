import { test, expect, Page, APIRequestContext } from '@playwright/test';
import {
  COMPLEMENTO_MATERNIDAD_DEROGADO,
  COMPLEMENTO_BRECHA_GENERO_2026,
  COMPLEMENTO_BRECHA_GENERO_META,
  // Sello de las cuantías de pensión: ampara el límite máximo (3.359,60 €/mes) que la guía
  // publica. Lo usa la regresión del hallazgo 652.
  FISCAL_PENSIONES_META,
  // Sello propio de los plazos de la reclamación previa, nacido el 05/09/2026 al separar
  // el trámite del complemento. Lo usa la regresión del hallazgo 652.
  RECLAMACION_PREVIA_SS_META,
} from '../../data/fiscal/pensiones';
// El recuento de requisitos del art. 60 que evalúa el verificador vive en el motor del MCP,
// que es de donde lo leen la página y su faqJsonLd desde la reparación del hallazgo 654.
import { NUM_REQUISITOS_ART60 } from '../../lib/calculadoras/complementoBrechaGenero';
// Re-inspección 26/09/2026: el campo de hijos se siembra con los helpers de hidratación
// (nunca con el setter nativo, que lo prohíbe `check:hidratacion`), y el contraste se mide
// con la página asentada.
import { sembrarValor, leerValorEnReact, esperarPaginaAsentada } from './_hidratacion';

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
 * REPARACIÓN 09/09/2026 — los CUATRO hallazgos de la inspección del 07/09 (652, 653, 654 y
 * 655) están reparados; sus testigos, al final del fichero, ya no llevan `test.fail()` y
 * quedan como REGRESIÓN. Qué sujeta cada uno:
 *   · 652 — la página declara TRES sellos `DataReference`, uno por módulo, en vez de uno
 *     solo que no cubría ni los plazos del art. 71 LRJS ni el límite máximo de pensiones
 *     públicas. `RECLAMACION_PREVIA_SS_META` estrena así su primer consumidor.
 *   · 653 — el motor del MCP lee `COMPLEMENTO_BRECHA_GENERO_META.doctrina` en vez de
 *     teclear la jurisprudencia, y la regresión que debía sujetarlo comprueba ahora
 *     FICHERO A FICHERO en vez de concatenarlos, que era lo que la dejaba ciega.
 *   · 654 — el recuento de requisitos sale de `REQUISITOS_ART60` (motor del MCP), que
 *     consumen la página y su `faqJsonLd`: ya no hay ningún «5» tecleado.
 *   · 655 — la FAQ de los hijos fallecidos enuncia la regla real (haber nacido con vida) y
 *     no un umbral de 16 años que no está ni en el art. 60.1 LGSS ni en la STS que cita.
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
  /**
   * P5 bis — solo aparece si el otro progenitor «Ya lo percibe»: qué suma de pensiones
   * públicas es menor (hallazgo 2239). Si se omite, se queda en su valor por defecto,
   * «No lo sé», que da el veredicto condicionado.
   */
  sumaMenor?: string;
  /** P6 — denegación PROPIA del solicitante. Por defecto, no la hay. */
  denegacionPropia?: boolean;
}

/**
 * Elige una opción de una pregunta de elección única. Desde el hallazgo 2243 (26/09/2026)
 * son `role="radio"` con `aria-checked`, no botones con `aria-pressed`.
 */
async function elegir(page: Page, nombre: string): Promise<void> {
  await page.getByRole('radio', { name: nombre, exact: true }).click();
}

/** Responde las 6 preguntas y pulsa «Verificar mi derecho». */
async function responderYVerificar(page: Page, s: Situacion): Promise<void> {
  await elegir(page, s.pension);
  await elegir(page, s.fecha);
  await page.locator('#hijos').fill(String(s.hijos));
  await elegir(page, s.sexo);
  await elegir(page, s.otroProgenitor);
  if (s.sumaMenor) await elegir(page, s.sumaMenor);
  await elegir(page, s.denegacionPropia ? 'Sí, tengo una resolución denegatoria' : 'No');
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
  await page.getByRole('radio', { name: 'Viudedad', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Viudedad', exact: true })).toHaveAttribute(
    'aria-checked',
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
    // 3a — el otro progenitor ya lo percibe Y su suma de pensiones públicas es la menor.
    // Hasta el 26/09/2026 bastaba «ya lo percibe» para el «no», y este caso lo consagraba
    // con «pensión pública de menor cuantía». El art. 60.1 LGSS compara la SUMA y el 60.2
    // permite que pase al segundo progenitor (hallazgos 2239 y 2240): el «no» solo es
    // correcto cuando la suma menor es la del otro.
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La del otro progenitor es menor',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('Cada hijo o hija da derecho a un solo complemento');
    expect(resultado).toContain('pensiones públicas cuya suma sea de menor cuantía'); // art. 60.1
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

    // 225d — precedencia: si el otro progenitor YA lo percibe y su suma de pensiones
    // públicas es la menor, la denegación propia fue conforme a derecho (art. 60.1 LGSS). La
    // app no puede mandar a reclamar sobre una denegación válida.
    // Actualizado el 26/09/2026 (hallazgo 2239): antes bastaba «ya lo percibe» para el «no»,
    // y el caso lo consagraba; ahora el rechazo exige que la suma menor sea la del otro.
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La del otro progenitor es menor',
      denegacionPropia: true,
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('Cada hijo o hija da derecho a un solo complemento');
    expect(resultado).not.toContain('Posible reclamación retroactiva');

    // 225e — sin saber qué suma es menor: condicionado, y tampoco manda a reclamar
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'No lo sé',
      denegacionPropia: true,
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Depende de la suma de pensiones');
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
    // Desde el hallazgo 2243 son grupos de RADIO: la semántica de elección única. La P5 bis
    // solo aparece si el otro progenitor ya lo percibe. Desde el 01/10/2026 hay dos
    // sub-preguntas más (hallazgos 2540 y 2541): la 1 bis (prorrata del art. 60.3.f), que
    // aparece con las pensiones que dan derecho —el `beforeEach` marca Viudedad—, y la 3 bis
    // (exclusiones del art. 60.3.b). Antes eran cinco; el «5» describía el cuestionario de
    // entonces, no una regla, así que sigue a las preguntas reales: siete.
    const grupos = page.locator('[role="radiogroup"]');
    await expect(grupos).toHaveCount(7); // P1, P1 bis, P2, P3 bis, P4, P5 y P6 (P3 es un input con label)

    for (const nombre of [
      '1. ¿Qué pensión percibes (o vas a percibir)?',
      '1 bis. ¿Tu pensión se calcula a prorrata por haber cotizado también en otro país?',
      '2. ¿Cuándo se causó (o se causará) tu pensión?',
      '3 bis. ¿Te alcanza alguna de las exclusiones del art. 60.3.b) LGSS?',
      '4. Sexo administrativo del solicitante',
      '5. Estado del otro progenitor respecto al complemento',
      '6. ¿Solicitaste tú el complemento y te lo denegaron?',
    ]) {
      await expect(page.getByRole('radiogroup', { name: nombre })).toBeVisible();
    }

    // El único label con control asociado sigue siendo el de la P3 (el de la prorrata solo
    // aparece al contestar «Sí» en la 1 bis)
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
    await page.getByRole('radio', { name: 'Antes del 4-feb-2021', exact: true }).click();
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
   * HALLAZGO 470 (27/08/2026), REPARADO el 27/08 — el campo «hijos» se tragaba lo tecleado
   * antes de un carácter que el navegador rechaza, y los dígitos siguientes formaban OTRO
   * número. Lo que sigue describe el defecto que hubo, para reconocerlo si vuelve.
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
   * HALLAZGO 471 (27/08/2026), REPARADO — la guía educativa no se había enterado de la
   * exclusión del art. 60.4 LGSS. Hoy la cita en la tabla comparativa y en la FAQ.
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
   * HALLAZGO 472 (27/08/2026), REPARADO — plazos y subapartados normativos que iban
   * tecleados en el JSX y hoy se leen de `data/fiscal`.
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
  // dejó aquella reparación. Se marcaron con `test.fail()` (hallazgos 503-508) y están
  // REPARADAS: abajo quedan como REGRESIÓN, sin la marca.
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
          // El titular cambió el 09/09/2026 al reparar el hallazgo 655 («antes de los 16
          // años» era un umbral inventado); lo que este test sujeta es la respuesta.
          .locator('h3', { hasText: 'nació con vida y falleció después' })
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
  // abrir el navegador, y dos hallazgos nuevos que se marcaron con `test.fail()`: el 605,
  // REPARADO el 05/09, y el 606, REPARADO el 02/09. Los dos quedan como regresión.
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
   *
   * REPARADO el 05/09/2026 con fuente oficial consultada en sesión (texto consolidado del
   * BOE, API de datos abiertos): el art. 71.2 LRJS no califica los días y el art. 30.2 de la
   * Ley 39/2015 los hace hábiles salvo que una ley diga lo contrario y lo haga constar. Por
   * la vía procesal (LRJS + art. 182 LOPJ) el resultado es el mismo, así que los dos
   * regímenes convergen. El sello está en RECLAMACION_PREVIA_SS_META, aparte del
   * general: se verificaron los plazos, no las cuantías.
   */
  test('regresión hallazgo 605: el plazo de la reclamación previa se publica en días HÁBILES', async ({
    page,
  }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());
    const { reclamacionPreviaDias: dias, reclamacionPreviaTipoDias: tipo } =
      COMPLEMENTO_BRECHA_GENERO_2026.plazos;

    // El módulo es la fuente: si alguien lo devuelve a 'naturales', esto cae aquí primero.
    expect(tipo).toBe('hábiles');
    expect(guia).toContain(`${dias} días ${tipo}`);
    // La afirmación falsa concreta no puede volver. Ojo: NO se prohíbe la frase «días
    // naturales» a secas — la página la usa para nombrar el error que hay que evitar, y
    // explicar el contraste es justo lo que se le pide a un contenido de riesgo 1.
    expect(guia).not.toContain(`${dias} días naturales`);
  });

  /**
   * HALLAZGO 605 (b) — encontrado el 05/09/2026 al traer el art. 71 ENTERO del BOE en vez de
   * solo el apartado 2 que citaba la página.
   *
   * La guía remataba el plazo con «Pasado ese plazo, la resolución gana firmeza y la
   * reclamación se complica» y, en errores frecuentes, «hay que recurrir a vías más
   * complejas». Las dos son falsas por sí solas, sin necesidad de discutir hábiles o
   * naturales: el art. 71.4 LRJS dice literalmente que «podrá reiterarse la reclamación
   * previa de haber caducado la anterior, en tanto no haya prescrito el derecho». Perder el
   * plazo produce caducidad en la instancia, no pérdida del derecho ni firmeza del acto.
   *
   * Los dos defectos se sumaban en la misma dirección —plazo más corto del real + «lo has
   * perdido»—, que es lo que convierte un matiz jurídico en que alguien deje de reclamar.
   */
  test('regresión hallazgo 605 (b): perder el plazo NO da firmeza a la resolución', async ({
    page,
  }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    // Las dos afirmaciones retiradas
    expect(guia).not.toContain('gana firmeza');
    expect(guia).not.toContain('vías más complejas');
    // Y la que las sustituye, derivada del módulo (no tecleada aquí)
    const reiterable = COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaReiterable;
    expect(reiterable.puede).toBe(true);
    expect(guia).toContain(reiterable.detalle);
    expect(guia).toContain(reiterable.norma);
  });

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
  // ✅ REPARADO el 02/09/2026 (hallazgo 606). `doctrina` pasó de ser una cadena suelta sin
  // consumidores a un objeto con las dos resoluciones desglosadas, y las nueve copias de
  // `page.tsx` y `metadata.ts` lo interpolan. Queda como regresión.
  //
  // ⚠️ Corregido el 09/09/2026 (hallazgo 653): este test CONCATENABA los tres ficheros y
  // exigía la cadena en el conjunto, así que pasaba con que la consumiera solo `page.tsx` —
  // y eso es justo lo que ocurría: el motor del MCP siguió tecleando la jurisprudencia seis
  // días sin que nada lo viera. Ahora se comprueba fichero A fichero: un consumidor que se
  // quede atrás nombra el fichero que falta.
  test(
    'REGRESIÓN: META.doctrina tiene consumidores y la jurisprudencia no va tecleada',
    async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const consumidores = [
        join('app', 'verificador-complemento-brecha-genero', 'page.tsx'),
        join('app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
        join('lib', 'calculadoras', 'complementoBrechaGenero.ts'),
      ];
      for (const rel of consumidores) {
        const fuente = readFileSync(join(process.cwd(), rel), 'utf8');
        expect(fuente, `${rel} no lee COMPLEMENTO_BRECHA_GENERO_META.doctrina`).toContain(
          'COMPLEMENTO_BRECHA_GENERO_META.doctrina',
        );
      }
    },
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — hallazgos 607 y 608 del 02/09/2026, REPARADOS ese mismo día.
// El 605 (los «30 días naturales» del art. 71.2 LRJS) se dejó abierto ese día porque es
// un dato normativo YMYL y su corrección iba por /triaje-fiscal, con fuente oficial y OK
// del usuario; se REPARÓ el 05/09/2026 (días hábiles, ver su regresión más arriba).
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos 607 y 608, reparados', () => {
  // 607 — la tabla comparativa tenía tecleada la escala del complemento de maternidad
  // derogado (5 %, 10 %, 15 %), correcta pero sin módulo, mientras la misma página ya había
  // retirado por esta razón las cifras del complemento vigente.
  test('607 — la escala del complemento derogado sale de data/fiscal', async ({ page }) => {
    await abrirGuia(page);
    const fila = page.getByRole('row', { name: /Naturaleza del cálculo/ });
    const texto = normalizar(await fila.innerText());
    // Desde el hallazgo 2244 el % va separado con U+00A0, que normalizar() deja en espacio
    for (const tramo of COMPLEMENTO_MATERNIDAD_DEROGADO.escala) {
      expect(texto).toContain(`${tramo.porcentaje} %`);
    }
    // Y el máximo se construye con el último tramo del módulo, no a mano.
    const maximo = COMPLEMENTO_MATERNIDAD_DEROGADO.escala[COMPLEMENTO_MATERNIDAD_DEROGADO.escala.length - 1];
    const filaMax = normalizar(await page.getByRole('row', { name: /^Máximo/ }).innerText());
    expect(filaMax).toContain(`${maximo.porcentaje} % (${maximo.hijos} o más hijos)`);
  });

  // 608 — con el campo de hijos vacío, el error citaba la cadena vacía entre comillas:
  // «Escribe un número entero de hijos, de 0 a 20: «» no se interpreta».
  test('608 — el campo de hijos vacío tiene su propia frase, sin comillas vacías', async ({ page }) => {
    await page.goto(RUTA, { waitUntil: 'domcontentloaded' });
    const campo = page.locator('#hijos');
    await campo.fill('');

    const aviso = normalizar(await page.locator('p[role="alert"]').first().innerText());
    expect(aviso).not.toContain('«»');
    expect(aviso).toContain('Escribe un número entero de hijos');

    // Y cuando SÍ hay algo escrito, la comilla informa: es la diferencia que el hallazgo pedía.
    await campo.fill('99');
    const conTexto = normalizar(await page.locator('p[role="alert"]').first().innerText());
    expect(conTexto).toContain('«99»');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 07/09/2026 — segmento FISCAL, riesgo 1 CRÍTICO
//
// RE-inspección de la del 02/09, cuyos dos ALTOS se repararon el 05/09:
//
//   · 605 — «30 días NATURALES» por el art. 71.2 LRJS, un precepto que no califica los
//     días. CIERRA: `RECLAMACION_PREVIA_SS.tipoDias` vale 'hábiles', la página lo lee en
//     los tres sitios y las dos regresiones de la tanda anterior (líneas 1253 y 1284)
//     pasan sin tocarlas. El dato salió además de dentro del complemento a un módulo
//     propio, `RECLAMACION_PREVIA_SS`, que ya comparte con `estimador-pension-viudedad`.
//   · La P5/P6 — «lo solicitó y se lo denegaron» era una respuesta sobre el OTRO
//     progenitor y disparaba la rama de reclamación del usuario. CIERRA: abajo se
//     recorren los CUATRO valores de la P5 y ninguno mueve el veredicto hacia la
//     reclamación; solo la P6 lo hace.
//
// La batería entera (32 tests) se ejecutó ANTES de escribir nada y pasó los 32. No
// quedaba ningún `test.fail()` vivo: la reparación del 05/09 ya les quitó la marca.
//
// Lo de aquí abajo son tres casos NUEVOS resueltos a mano contra
// `COMPLEMENTO_BRECHA_GENERO_2026` antes de abrir el navegador, el cierre de la P5, y los
// cuatro hallazgos de aquella vuelta (652, 653, 654 y 655).
//
// ✅ REPARADOS los cuatro el 09/09/2026. Se les quitó el `test.fail()` y quedan como
// REGRESIÓN: cada uno describe primero el defecto que hubo —para que se reconozca si
// vuelve— y después la reparación que ahora sujeta.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 07/09/2026', () => {
  /**
   * CASO A (NORMAL) — la rama `no_aplica` de la P5, que NINGÚN test del fichero había
   * ejercitado: los 20 supuestos anteriores usan 'no_percibe', 'percibe' o 'denegado'.
   * Es el caso de quien no tiene otro progenitor con quien concurrir, y hasta hoy nadie
   * había comprobado que esa opción no bloquea el derecho.
   *
   * Resuelto a mano con el módulo fiscal ANTES de ejecutar la app:
   *   P1 viudedad ∈ pensionesElegibles          → no cae en ninguna exclusión
   *   P2 «El 4-feb-2021 o después» ≥ fechaMinimaHechoCausante ('2021-02-04')
   *   P3 2 hijos → hijosComputables = mín(2, maxHijos 4) = 2
   *   P5 «No procede (sin otro progenitor)»      → no hay concurrencia que bloquear
   *   P6 sin denegación propia                   → NO es reclamación
   *
   *   mensual = 2 × cuantiaPorHijoMensual 36,90 = 73,80 €     ← esperado literal
   *   anual   = 73,80 × pagasAnuales 14         = 1033,20 €   ← esperado literal
   *
   * (es-ES no agrupa los millares de cuatro cifras: 1033,20, no 1.033,20.)
   * OBTENIDO en navegador el 07/09/2026: exactamente eso.
   */
  test('caso A (07/09): viudedad, 2 hijos y sin otro progenitor → 73,80 €/mes y 1033,20 €/año', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No procede (sin otro progenitor)',
    });

    const resultado = await textoResultado(page);
    const { cuantiaPorHijoMensual, maxHijos, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
    // Las cifras se recalculan desde el módulo: si se revaloriza, el test cae aquí.
    expect(cuantiaPorHijoMensual).toBe(36.9);
    expect(2 * cuantiaPorHijoMensual).toBeCloseTo(73.8, 2);
    expect(2 * cuantiaPorHijoMensual * pagasAnuales).toBeCloseTo(1033.2, 2);

    expect(resultado).toContain('+73,80 €/mes');
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain(`Hijos computables 2 (máx. ${maxHijos})`);
    expect(resultado).toContain('Anual (14 pagas) 1033,20 €/año');
    // «Sin otro progenitor» no es una respuesta que deba mover el veredicto a reclamar
    expect(resultado).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * CASO B (LÍMITE EXACTO) — 20 hijos, el tope EXACTO de `LIMITE_HIJOS_CAMPO`.
   *
   * El borde del campo estaba probado por ARRIBA (21 → «supera el tope», hallazgo 506) y
   * nunca por el valor que todavía es válido. La condición es `Number(texto) > 20`, así
   * que 20 tiene que entrar y calcular; un `>=` mal escrito rechazaría una entrada legal
   * sin que ningún test lo notara.
   *
   * Resuelto a mano:
   *   20 no supera el tope del CAMPO (20) → entrada válida, aria-invalid = false
   *   hijosComputables = mín(20, maxHijos 4) = 4        ← el tope de la NORMA sí actúa
   *   mensual = 4 × 36,90 = 147,60 € (= maxMensual)
   *   anual   = 147,60 × 14 = 2066,40 € (= maxAnual)
   * y el vecino inmediato, 21, se rechaza por el tope del campo, no por la norma.
   *
   * OBTENIDO el 07/09/2026: 20 → válido y 147,60 €/mes · 21 → «supera el tope de 20».
   */
  test('caso B (07/09, límite): 20 hijos es el último valor admitido y topa en maxHijos', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 20,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    // El campo NO marca error: 20 es entrada legal
    await expect(page.locator('#hijos')).toHaveAttribute('aria-invalid', 'false');

    const resultado = await textoResultado(page);
    const { maxHijos, maxMensual, maxAnual } = COMPLEMENTO_BRECHA_GENERO_2026;
    expect(maxMensual).toBe(147.6);
    expect(maxAnual).toBe(2066.4);
    expect(resultado).toContain('+147,60 €/mes'); // maxMensual, no 20 × 36,90 = 738 €
    expect(resultado).toContain(`Hijos computables ${maxHijos} (máx. ${maxHijos})`);
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año');
    expect(resultado).not.toContain('738,00'); // 20 × 36,90 sin el tope de la norma
    expect(resultado).not.toContain('supera el tope');

    // Vecino inmediato: 21 ya no cabe en el campo, y se dice por lo que es
    await page.locator('#hijos').fill('21');
    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    const conVeintiuno = await textoResultado(page);
    expect(conVeintiuno).toContain('supera el tope de 20 hijos');
    expect(conVeintiuno).not.toContain('+147,60 €/mes');
  });

  /**
   * CASO C (RECHAZO) — la P5 «Ya lo percibe por los mismos hijos» CRUZADA con la P6
   * «Sí, tengo una resolución denegatoria». Es la precedencia que nadie había probado, y
   * cae justo en el terreno del hallazgo alto reparado: si la rama de reclamación se
   * evaluara antes que la de concurrencia, a quien tiene el complemento correctamente
   * asignado al otro progenitor se le diría «posible reclamación retroactiva».
   *
   * Resuelto a mano: en `evaluar()` el bloqueo por `otroProgenitor === 'percibe'` va ANTES
   * que `denegacionPropia`, luego el veredicto tiene que ser un rechazo limpio:
   *   → «No procede ahora», motivo de incompatibilidad entre progenitores,
   *     SIN «Posible reclamación retroactiva», sin desglose y sin 3 × 36,90 = 110,70 €.
   *
   * OBTENIDO el 07/09/2026: exactamente eso, y el paso siguiente remite a la asignación
   * al progenitor de pensión menor (COMPLEMENTO_BRECHA_GENERO_META.nota), no a impugnar.
   */
  test('caso C (07/09, rechazo): el otro progenitor ya lo percibe y además hay denegación propia', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      // Desde el 26/09/2026 (hallazgo 2239) «ya lo percibe» ya no deniega por sí solo: el
      // rechazo limpio exige que la suma de pensiones menor sea la del otro progenitor.
      sumaMenor: 'La del otro progenitor es menor',
      denegacionPropia: true,
    });

    const resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('Cada hijo o hija da derecho a un solo complemento');
    // Lo que NO puede salir: la denegación propia no resucita un derecho ya asignado
    expect(resultado).not.toContain('Posible reclamación retroactiva');
    expect(resultado).not.toContain('110,70'); // 3 × cuantiaPorHijoMensual 36,90
    expect(resultado).not.toContain('Desglose económico');
    expect(resultado).not.toContain('C-623/23');
    // Y el motivo es la regla de asignación (la SUMA, art. 60.1), no una impugnación
    expect(resultado).toContain('pensiones públicas cuya suma sea de menor cuantía');
    expect(resultado).not.toContain('pensión pública de menor cuantía');
  });

  /**
   * CIERRE DEL ALTO DE LA P5 (02/09) — recorrido EXHAUSTIVO de sus cuatro valores.
   *
   * El hallazgo era que una respuesta sobre el OTRO progenitor («lo solicitó y se lo
   * denegaron») decidía si al USUARIO le tocaba reclamar. La reparación separó las dos
   * cosas en P5 y P6. El caso 225 lo comprueba con un valor; aquí se comprueba que
   * NINGUNO de los cuatro mueve el veredicto, que es la afirmación que cierra el hallazgo.
   */
  test('cierre P5 (07/09): ninguno de los cuatro estados del otro progenitor dispara reclamación', async ({
    page,
  }) => {
    const estados = [
      'No lo percibe ni lo ha solicitado',
      'Ya lo percibe por los mismos hijos',
      'Lo solicitó y se lo denegaron',
      'No procede (sin otro progenitor)',
    ];

    for (const estado of estados) {
      await responderYVerificar(page, {
        pension: 'Jubilación (ordinaria o anticipada)',
        fecha: 'El 4-feb-2021 o después',
        hijos: 2,
        sexo: 'Hombre',
        otroProgenitor: estado,
        denegacionPropia: false,
      });
      const resultado = await textoResultado(page);
      expect(resultado, `P5 = «${estado}» sin denegación propia`).not.toContain(
        'Posible reclamación retroactiva',
      );
      // «Ya lo percibe» es el único de los cuatro que no concede sin más: sin saber qué
      // suma de pensiones es menor, el veredicto es CONDICIONADO, no un «no» (hallazgo 2239)
      if (estado === 'Ya lo percibe por los mismos hijos') {
        expect(resultado).toContain('Depende de la suma de pensiones');
        expect(resultado).not.toContain('No procede ahora');
      } else {
        expect(resultado).toContain('+73,80 €/mes'); // 2 × 36,90
      }
    }

    // Y con la P6 en «sí», el mismo supuesto SÍ pasa a reclamación: es la P6 quien decide
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });
    expect(await textoResultado(page)).toContain('Posible reclamación retroactiva');
  });

  /**
   * HALLAZGO 07/09/2026 (a) — MEDIO. La página publica datos normativos de TRES módulos
   * sellados por separado y declara UN solo sello, el que menos los cubre.
   *
   * El `<DataReference>` de la página dice, literalmente:
   *   «Normativa aplicada: Complemento por Brecha de Género 2026 — Art. 60 LGSS
   *    (RDL 8/2015, modificado por RDL 3/2021) + RDL 3/2026 · Última verificación: 13/05/2026»
   *
   * Y bajo ese sello se publican:
   *   · «30 días hábiles (Art. 71.2 LRJS)», el art. 71.4 (reiteración) y el art. 71.5
   *     (silencio a los 45 días) → salen de `RECLAMACION_PREVIA_SS`, cuyo sello propio es
   *     `RECLAMACION_PREVIA_SS_META`: fuente «Art. 71 LRJS (Ley 36/2011) + art. 30.2
   *     Ley 39/2015», verificado el 05/09/2026;
   *   · el límite máximo de pensiones públicas (3.359,60 €/mes) → `LIMITES_PENSION_2025`,
   *     bajo `FISCAL_PENSIONES_META`, verificado el 12/08/2026.
   *
   * O sea: la fuente que el lector ve NO dice nada de la LRJS ni de la Ley 39/2015, y la
   * fecha que ve es CUATRO meses anterior a la verificación real de los plazos. Es el
   * hallazgo 610 con otro nombre («el sello declaraba UN módulo para TRES impuestos»), y
   * además la razón declarada al crear `RECLAMACION_PREVIA_SS_META` el 05/09 era
   * exactamente poder fechar los plazos sin afirmar de paso que se han reverificado las
   * cuantías. El sello nació sin ningún consumidor: `grep -rn RECLAMACION_PREVIA_SS_META
   * app/` no devuelve nada en todo el catálogo.
   *
   * ✅ REPARADO el 09/09/2026 (hallazgo 652). La página declara los TRES sellos, uno por
   * módulo, seguidos y antes de la herramienta: `DataReference` admite un solo módulo por
   * tarjeta porque cada uno tiene SU fecha de verificación, y fundirlos obligaría a dar una
   * sola. `RECLAMACION_PREVIA_SS_META` estrena consumidor. Queda como REGRESIÓN.
   */
  test(
    'REGRESIÓN: cada dato normativo publicado tiene su sello, con SU fecha de verificación',
    async ({ page }) => {
      /** DD/MM/AAAA, que es como `DataReference` imprime la fecha de verificación. */
      const enEspanol = (iso: string): string => {
        const [anio, mes, dia] = iso.split('-');
        return `${dia}/${mes}/${anio}`;
      };

      const sellos = normalizar(
        (
          await page.locator('[aria-label="Datos de referencia normativos"]').allInnerTexts()
        ).join(' · '),
      );

      // Lo que se publica bajo esos sellos incluye el plazo del art. 71 LRJS…
      await abrirGuia(page);
      const guia = normalizar(await page.locator('body').innerText());
      expect(guia).toContain(COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaNorma);

      // …luego los sellos nombran esa fuente y su fecha de verificación REAL, que es la de
      // RECLAMACION_PREVIA_SS_META y no la del complemento.
      expect(sellos).toContain('71 LRJS');
      expect(sellos).toContain(enEspanol(RECLAMACION_PREVIA_SS_META.verificado)); // 05/09/2026

      // Y cada uno de los otros dos módulos conserva el suyo, sin contagiarse las fechas:
      // el complemento y las cuantías de pensión, de donde sale el límite máximo de
      // pensiones públicas que la guía publica. Las fechas se leen de cada _META y no se
      // teclean aquí: `FISCAL_PENSIONES_META.verificado` se mueve en cada triaje fiscal
      // (era 12/08/2026 al crearse esta regresión, 21/09/2026 al re-inspeccionar).
      expect(sellos).toContain(enEspanol(COMPLEMENTO_BRECHA_GENERO_META.verificado));
      expect(sellos).toContain(enEspanol(FISCAL_PENSIONES_META.verificado));
      expect(sellos).toContain('Ley 39/2015');
    },
  );

  /**
   * HALLAZGO 07/09/2026 (b) — MEDIO. La reparación del hallazgo 606 no viajó al gemelo del
   * MCP, y la regresión que debía sujetarla no puede verlo.
   *
   * `lib/calculadoras/complementoBrechaGenero.ts` alimenta la tool
   * `calcular_complemento_brecha_genero` de los MCP de meskeIA y Delegum. Importa
   * `COMPLEMENTO_BRECHA_GENERO_META` —usa `.nota`, `.fuente` y `.vigencia`— pero NO usa
   * `.doctrina`: teclea la jurisprudencia en tres cadenas de runtime (líneas 149, 245 y
   * 253) y otras dos veces en su cabecera.
   *
   * Caso reproducible, mismo supuesto por las dos vías (hombre · jubilación · 2 hijos ·
   * hecho causante desde 2021 · el otro progenitor no lo percibe · denegación PROPIA):
   *   · web  → «Tras la STJUE de 15 de mayo de 2025 (C-623/23) y la doctrina del Tribunal
   *             Supremo (9 de julio de 2025)»      ← interpolado de META.doctrina
   *   · MCP  → «Tras la STJUE C-623/23 (15-may-2025) y la doctrina del Tribunal Supremo
   *             (09-jul-2025)»                      ← tecleado en el fichero
   * El importe coincide (73,80 €/mes · 1033,20 €/año), así que la paridad NUMÉRICA cierra;
   * lo que diverge es la cita normativa y, sobre todo, de dónde sale. El día que una nueva
   * resolución matice la doctrina, la web dirá una cosa y las dos tools del MCP la anterior.
   *
   * Por qué no lo veía nada: la regresión «META.doctrina tiene consumidores» concatenaba
   * los TRES ficheros y exigía que la cadena apareciera en el conjunto, así que pasaba con
   * que la consumiera solo `page.tsx`. Este test mira el fichero del motor por separado.
   *
   * ✅ REPARADO el 09/09/2026 (hallazgo 653). El motor declara `const DOCTRINA =
   * COMPLEMENTO_BRECHA_GENERO_META.doctrina` e interpola las tres cadenas de runtime desde
   * ahí; su cabecera dejó también de repetir las dos resoluciones y remite al módulo. Y la
   * regresión ciega se arregló en el mismo commit: ahora comprueba fichero a fichero.
   * Quedan los dos como REGRESIÓN.
   */
  test(
    'REGRESIÓN: el motor del MCP lee META.doctrina y no teclea la jurisprudencia',
    async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const motor = readFileSync(
        join(process.cwd(), 'lib', 'calculadoras', 'complementoBrechaGenero.ts'),
        'utf8',
      );
      // El motor importa el _META: tiene que leer también la doctrina, no repetirla.
      expect(motor).toContain('COMPLEMENTO_BRECHA_GENERO_META.doctrina');
      // Y las cadenas que devuelve al usuario del MCP no pueden llevarla tecleada.
      const cuerpo = motor.slice(motor.indexOf('export function calcularComplementoBrechaGenero'));
      expect(cuerpo).not.toContain('15-may-2025');
      expect(cuerpo).not.toContain('09-jul-2025');
      // Tampoco la CABECERA, que las repetía otras dos veces: un comentario no se interpola,
      // así que la única forma de que no envejezca es que remita al módulo en vez de copiarlo.
      const cabecera = motor.slice(0, motor.indexOf('export function calcularComplementoBrechaGenero'));
      for (const fecha of ['15-may-2025', '09-jul-2025', '15/05/2025', '09/07/2025']) {
        expect(cabecera, `la cabecera del motor sigue tecleando ${fecha}`).not.toContain(fecha);
      }
    },
  );

  /**
   * HALLAZGO 07/09/2026 (c) — BAJO. La página anuncia «5 requisitos clave del art. 60
   * LGSS» y «los 5 puntos clave», y el número no corresponde a nada de lo que hace.
   *
   * El aviso del panel de resultado (visible en TODO veredicto) dice «esta herramienta
   * orienta sobre los 5 requisitos clave del art. 60 LGSS», y el paso 1 de la guía repite
   * «Esta herramienta te orienta sobre los 5 puntos clave». Pero:
   *   · los requisitos que el verificador evalúa son CUATRO —modalidad de pensión
   *     contributiva elegible, hecho causante ≥ 4-feb-2021, al menos un hijo computable y
   *     que el otro progenitor no lo perciba—; la P4 (sexo) dejó de serlo con la doctrina
   *     de 2025, que la propia página explica, y la P6 (denegación propia) no es un
   *     requisito sino la vía de reclamación;
   *   · el `faqJsonLd` de esta misma app —lo que leen Bing Copilot y ChatGPT— enumera
   *     TRES: «pensión contributiva…; al menos un hijo o hija; y que el otro progenitor no
   *     perciba ya el complemento»;
   *   · la cabecera de `lib/calculadoras/complementoBrechaGenero.ts` los lista como CUATRO.
   *
   * O sea, el «5» no coincide ni con el motor, ni con la FAQ estructurada, ni con el
   * cuestionario. Es el pariente del hallazgo 281, donde el JSON-LD decía «5 preguntas»
   * teniendo 6: un recuento que sobrevivió a la reforma que lo dejó obsoleto.
   *
   * ✅ REPARADO el 09/09/2026 (hallazgo 654). Los requisitos se enumeran UNA vez, en
   * `REQUISITOS_ART60` del motor del MCP —una entrada por rama de denegación—, y de ahí
   * salen `NUM_REQUISITOS_ART60` para el aviso del panel y el paso 1 de la guía, y la lista
   * en prosa para las dos preguntas del `faqJsonLd` que la enumeraban a mano. El recuento
   * ya no se teclea en ningún sitio, así que no puede volver a divergir. Queda como
   * REGRESIÓN: comprueba que el número que se lee en pantalla es el de la lista.
   */
  test(
    'REGRESIÓN: el recuento de requisitos sale de REQUISITOS_ART60, no tecleado',
    async ({ page }) => {
      await responderYVerificar(page, {
        pension: 'Jubilación (ordinaria o anticipada)',
        fecha: 'El 4-feb-2021 o después',
        hijos: 2,
        sexo: 'Mujer',
        otroProgenitor: 'No lo percibe ni lo ha solicitado',
      });
      const resultado = await textoResultado(page);
      expect(resultado).not.toMatch(/5 requisitos clave/);
      // Y dice el número REAL, el de la lista del motor (hoy 4)
      expect(resultado).toContain(`${NUM_REQUISITOS_ART60} requisitos clave`);

      await abrirGuia(page);
      const guia = normalizar(await page.locator('body').innerText());
      expect(guia).not.toMatch(/5 puntos clave/);
      expect(guia).toContain(`${NUM_REQUISITOS_ART60} puntos clave`);

      // El faqJsonLd —lo que leen Bing Copilot y ChatGPT— cuenta lo mismo: enumeraba TRES
      // requisitos a mano mientras la página anunciaba cinco.
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const meta = readFileSync(
        join(process.cwd(), 'app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
        'utf8',
      );
      expect(meta).toContain('NUM_REQUISITOS_ART60');
      expect(meta).toContain('REQUISITOS_ART60');
    },
  );

  /**
   * HALLAZGO 07/09/2026 (d) — BAJO. La FAQ pregunta por un umbral que no existe en la
   * norma que ella misma cita, y su respuesta no lo menciona.
   *
   * Titular: «¿Y los hijos fallecidos antes de los 16 años?». Respuesta (derivada de
   * `computoHijoFallecido`): «El hijo o hija que nace con vida y fallece poco después SÍ
   * computa… la ley exige que haya nacido con vida, no que siga viviendo», con cita de la
   * STS 748/2023 y del art. 60.1 LGSS.
   *
   * «16 años» no aparece ni una vez en `data/fiscal/pensiones.ts` —ni en el art. 60.1 que
   * la respuesta cita, ni en la sentencia—, y la respuesta habla de fallecimiento «poco
   * después» del nacimiento. Quien busca por su hijo fallecido a los 14 años entra por una
   * pregunta que parece la suya y sale con un ejemplo que no lo es, cuando la regla que la
   * respuesta enuncia («no que siga viviendo») SÍ le da derecho. En una app de riesgo 1 el
   * coste del malentendido es dejar de pedir un complemento que corresponde.
   *
   * El contenido de la respuesta es correcto: lo que falla es el titular, que introduce un
   * umbral inventado. Es el defecto simétrico del hallazgo 505 (la regla se afirmaba sin
   * norma): aquí la regla ya tiene norma y es el enunciado el que se sale de ella.
   *
   * ✅ REPARADO el 09/09/2026 (hallazgo 655). El titular pasó a enunciar la regla —«¿Cuenta
   * un hijo o hija que nació con vida y falleció después?»— y la respuesta añade que lo que
   * decide es el nacimiento con vida, no cuánto tiempo viviera después, porque la norma no
   * fija ninguna edad. Queda como REGRESIÓN.
   */
  test(
    'REGRESIÓN: la FAQ de los hijos fallecidos enuncia la regla, no un umbral de edad',
    async ({ page }) => {
      await abrirGuia(page);
      const bloque = normalizar(
        await page
          .locator('h3', { hasText: 'nació con vida y falleció después' })
          .locator('..')
          .innerText(),
      );
      // Ninguna edad en el enunciado: ni la de la pregunta ni ninguna otra. El umbral no
      // está en el art. 60.1 LGSS ni en la STS 748/2023 que la propia respuesta cita.
      const enunciado = bloque.slice(0, bloque.indexOf('?') + 1);
      expect(enunciado).not.toMatch(/\d+\s*años/);
      // Y la respuesta dice por qué la edad no interviene, que es lo que el titular prometía
      // y no cumplía.
      expect(bloque).toContain('la ley exige que haya nacido con vida, no que siga viviendo');
      expect(bloque).toMatch(/no fija ninguna edad/);
    },
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 21/09/2026 — segmento FISCAL, riesgo 1 CRÍTICO
//
// Los CUATRO hallazgos del 07/09 se reprodujeron uno a uno en el navegador ANTES de
// escribir nada aquí, y CIERRAN los cuatro:
//
//   · 652 — la página declara los TRES sellos, cada uno con SU fecha: complemento
//     (13/05/2026), reclamación previa «Art. 71 LRJS + art. 30.2 Ley 39/2015»
//     (05/09/2026) y límite máximo de pensiones (la de FISCAL_PENSIONES_META, que
//     el 21/09/2026 se re-verificó). Los tres van arriba, fuera de la guía colapsada.
//   · 653 — el motor del MCP lee `COMPLEMENTO_BRECHA_GENERO_META.doctrina`, y la
//     regresión que lo sujeta mira el fichero por separado en vez de concatenarlos.
//   · 654 — TODO veredicto dice «los 4 requisitos clave del art. 60 LGSS», y ese 4 es
//     `REQUISITOS_ART60.length`: una entrada por familia de rama de denegación
//     (pensión elegible · corte temporal · hijos computables · concurrencia). El
//     número que la app anuncia es el número que comprueba.
//   · 655 — el titular de la FAQ enuncia la regla («nació con vida y falleció
//     después») y no el umbral de 16 años que no está en el art. 60.1 LGSS.
//
// Debajo van TRES casos nuevos resueltos a mano contra el módulo sellado antes de abrir
// el navegador, y DOS hallazgos que se marcaron con `test.fail()` (1171, y 1172-1173 en un
// solo test), REPARADOS el 21/09/2026 y hoy sin la marca.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Re-inspección 21/09/2026', () => {
  /**
   * CASO 1 (NORMAL) — hombre · incapacidad permanente · 1 hijo.
   *
   * Combinación que ningún test del fichero recorre: el mínimo exacto de la norma
   * («al menos un hijo o hija») sobre una pensión de IP y con sexo masculino, que es la
   * rama general de `evaluar` para hombre SIN denegación propia.
   *
   * Resuelto a mano con COMPLEMENTO_BRECHA_GENERO_2026 antes de ejecutar la app:
   *   P1 incapacidad permanente ∈ pensionesElegibles   → no cae en ninguna exclusión
   *   P2 «El 4-feb-2021 o después» ≥ fechaMinimaHechoCausante ('2021-02-04')
   *   P3 1 hijo → hijosComputables = mín(1, maxHijos 4) = 1  ← el «≥ 1» del art. 60
   *   P6 sin denegación propia                          → NO es reclamación
   *
   *   mensual = 1 × cuantiaPorHijoMensual 36,90 = 36,90 €     ← esperado literal
   *   anual   = 36,90 × pagasAnuales 14         = 516,60 €    ← esperado literal
   *
   * OBTENIDO en navegador el 21/09/2026: exactamente eso.
   */
  test('caso 1 (21/09): hombre, incapacidad permanente y 1 hijo → 36,90 €/mes y 516,60 €/año', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: 1,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });

    const { cuantiaPorHijoMensual, maxHijos, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
    // Las cifras se recalculan desde el módulo: si se revaloriza, el test cae aquí y hay
    // que volver a derivarlas, no «ajustarlas» a lo que muestre la app.
    expect(cuantiaPorHijoMensual).toBe(36.9);
    expect(1 * cuantiaPorHijoMensual * pagasAnuales).toBeCloseTo(516.6, 2);

    const resultado = await textoResultado(page);
    expect(resultado).toContain('+36,90 €/mes');
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain(`Hijos computables 1 (máx. ${maxHijos})`);
    expect(resultado).toContain('Cuantía por hijo 36,90 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 516,60 €/año');
    // Un hijo basta: la regla de 2 o más era la del complemento DEROGADO, no esta
    expect(resultado).not.toContain('No procede ahora');
    // Y sin denegación propia no se invita a impugnar nada
    expect(resultado).not.toContain('Posible reclamación retroactiva');
    // El recuento del aviso es el de REQUISITOS_ART60, no un número tecleado (654)
    expect(resultado).toContain(`${NUM_REQUISITOS_ART60} requisitos clave`);
  });

  /**
   * CASO 2 (LÍMITE) — el canto entre «0 hijos» y «no hay nada que calcular».
   *
   * Los umbrales numéricos (1 hijo, 4 hijos, el corte del 4-feb-2021, el tope 20 del
   * campo) ya están probados arriba. El que faltaba es el borde entre dos estados que
   * la app presenta IGUAL y que significan cosas distintas:
   *
   *   · «0» es una entrada VÁLIDA. El verificador la evalúa y la deniega por el
   *     requisito 3 del art. 60 («al menos un hijo o hija nacido con vida»). Es un
   *     veredicto sobre el derecho, y es correcto.
   *   · campo VACÍO (o «2.5») no es una entrada: `hijosEsValido` es falso y el `useMemo`
   *     corta antes de llamar a `evaluar()`. No se ha evaluado NADA sobre el derecho.
   *
   * ✅ HALLAZGO 1171 del 21/09/2026 — MEDIO (operativa), REPARADO el 21/09. El titular del
   * panel era el MISMO en
   * los dos: «No procede ahora», con el mismo icono ℹ️, el mismo estilo negativo y la
   * misma etiqueta «Revisa el motivo abajo». Solo el párrafo «¿Por qué?», en cuerpo
   * menor, distingue «El complemento exige al menos un hijo o hija» de «Falta el número
   * de hijos, así que no hay nada que calcular todavía».
   *
   * En esta app el titular ES el producto: responde «¿te corresponde?». Decir «No
   * procede ahora» sin haber evaluado nada es contestar que no a quien quizá sí, y el
   * coste del malentendido en riesgo 1 es dejar de pedir un complemento que corresponde.
   * La reparación del hallazgo 608 arregló la REDACCIÓN del motivo (las comillas vacías);
   * el titular no se tocó, y es el que se lee primero.
   *
   * Es la forma local del patrón «un resultado que no se puede calcular se presenta como
   * un veredicto en vez de como “sin calcular”». No hay cifra falsa —el importe no sale—,
   * así que no llega a la clase del aviso bajo cifra falsa: lo que falla es el encuadre.
   *
   * Esperado: con el campo ilegible, el titular NO puede ser el del veredicto de fondo.
   * Obtenido el 21/09/2026: «No procede ahora» en los dos.
   */
  test('caso 2 (21/09, límite) REPARADO 1171: «0 hijos» y «campo vacío» ya no dan el mismo titular', async ({
    page,
  }) => {

    // 2a — «0»: entrada válida, denegación DE FONDO por el requisito 3 del art. 60
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 0,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const conCero = await textoResultado(page);
    expect(conCero).toContain('No procede ahora');
    expect(conCero).toContain('al menos un hijo');
    expect(conCero).not.toContain('Desglose económico');

    // 2b — campo VACÍO: no hay nada que evaluar. Se vacía y se comprueba que el vaciado
    // llegó al ESTADO de React (aria-invalid lo deriva), no solo al DOM.
    await page.locator('#hijos').fill('');
    await expect(page.locator('#hijos')).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    const sinDato = await textoResultado(page);

    // Esto la app YA lo dice bien, y es la parte honesta del panel (hallazgo 608)
    expect(sinDato).toContain('no hay nada que calcular todavía');
    expect(sinDato).not.toContain('al menos un hijo'); // no se ha llegado a evaluar
    // …pero el titular es el del veredicto de fondo, y ahí está el hallazgo:
    expect.soft(sinDato, 'el titular no distingue «sin calcular» de «no procede»').not.toContain(
      'No procede ahora',
    );

    // Lo mismo con un texto que el campo admite y el verificador rechaza
    await page.locator('#hijos').fill('2.5');
    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    const ilegible = await textoResultado(page);
    expect(ilegible).toContain('«2.5» no es un número entero de hijos');
    expect.soft(ilegible, 'idem con una entrada ilegible').not.toContain('No procede ahora');
  });

  /**
   * CASO 3 (FUERA DE ÁMBITO) — «Ninguna aún», el único valor de la P1 que ningún test
   * del fichero había ejercitado, CRUZADO con una denegación propia.
   *
   * Resuelto a mano: en `evaluar()` la rama `tipo === 'ninguna'` va la SEGUNDA, muy por
   * delante de `denegacionPropia`. Quien aún no tiene pensión causada no tiene derecho
   * que reclamar —el art. 60 reconoce el complemento SOBRE una pensión ya causada—, así
   * que el veredicto tiene que ser un fuera de ámbito limpio:
   *   → «No procede ahora», sin desglose, sin 3 × 36,90 = 110,70 €/mes y sin mandar a
   *     nadie a impugnar nada.
   *
   * Es el mismo orden de precedencia que ya se probó en la jubilación parcial (caso 5),
   * comprobado ahora sobre la rama que faltaba.
   *
   * OBTENIDO el 21/09/2026: exactamente eso, y el paso siguiente remite a revisar el
   * derecho cuando se solicite la pensión.
   */
  test('caso 3 (21/09, fuera de ámbito): «Ninguna aún» con denegación propia → nada que reclamar', async ({
    page,
  }) => {
    await responderYVerificar(page, {
      pension: 'Ninguna aún',
      fecha: 'El 4-feb-2021 o después',
      hijos: 3,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });

    const resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('únicamente sobre una pensión ya causada');
    // Lo que NO puede salir: ni importe ni invitación a impugnar
    expect(resultado).not.toContain('110,70'); // 3 × cuantiaPorHijoMensual 36,90
    expect(resultado).not.toContain('Desglose económico');
    expect(resultado).not.toContain('Posible reclamación retroactiva');
    expect(resultado).not.toContain('C-623/23');
    // Y el paso siguiente es una cita futura, no una vía de recurso
    expect(resultado).toContain('recuerda revisar este derecho');
  });

  /**
   * ✅ HALLAZGOS 1172 y 1173 del 21/09/2026 — BAJO (dato), REPARADOS el 21/09. Lo que sigue
   * describe el defecto que hubo. La jurisprudencia se LEÍA del módulo en la
   * prosa de la guía y se TECLEA en los veredictos, que son lo que el usuario lee.
   *
   * Es el patrón de los hallazgos 606, 607 y 653 —el dato sube a `data/fiscal`, la página
   * lo consume en unos sitios y se queda una copia en otros—, en dos puntos que la
   * reparación del 09/09 no alcanzó:
   *
   *   (a) Rama `antes_2021` (P2 = «Antes del 4-feb-2021»). El paso siguiente dice «la
   *       doctrina TJUE 2019 (caso WA)», tecleado en `page.tsx`, mientras
   *       `COMPLEMENTO_MATERNIDAD_DEROGADO.doctrinaAcceso` —«STJUE de 12 de diciembre de
   *       2019 (C-450/18, caso WA)»— ya se lee DOS veces en esa misma página (la fila
   *       «Acceso de hombres» de la tabla comparativa y la tarjeta «Pensión anterior a
   *       feb-2021»). La copia del veredicto va además degradada: sin fecha y sin el
   *       número de asunto, que es justo lo que necesita quien acaba de leer «consulta a
   *       un profesional». El mismo literal está tecleado en el motor del MCP
   *       (`lib/calculadoras/complementoBrechaGenero.ts`), que no importa ese módulo.
   *
   *   (b) Rama general de hombre SIN denegación propia — el camino más transitado de los
   *       dos que tiene un hombre. Dice «Tras la doctrina TJUE 2025 y TS 2025», con los
   *       años tecleados, mientras la rama de reclamación inmediatamente siguiente
   *       interpola `META.doctrina` entera: «Tras la STJUE de 15 de mayo de 2025
   *       (C-623/23) y la doctrina del Tribunal Supremo (9 de julio de 2025)». Dos ramas
   *       de la MISMA función, una leyendo el sello y la otra escribiendo el año.
   *
   * Hoy las dos copias coinciden con el módulo, así que no hay error visible: lo que
   * falla es que la próxima resolución que matice la doctrina se corregirá en
   * `data/fiscal` y estos dos veredictos seguirán diciendo lo anterior.
   *
   * Esperado: los veredictos citan la doctrina del módulo, como ya hace la prosa.
   * Obtenido el 21/09/2026: (a) «la doctrina TJUE 2019 (caso WA)» · (b) «TJUE 2025 y TS 2025».
   */
  test('doctrina (21/09) REPARADO 1172 y 1173: los veredictos citan la jurisprudencia del módulo', async ({
    page,
  }) => {

    // (a) Rama anterior al corte del 4-feb-2021
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Antes del 4-feb-2021',
      hijos: 2,
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const anterior = await textoResultado(page);
    // Esto ya lo dice bien: el régimen que se aplicaba entonces, nombrado
    expect(anterior).toContain('antiguo complemento de maternidad');
    // Y la doctrina que abrió aquel régimen a los hombres tiene que salir del módulo,
    // como ya sale en la tabla comparativa y en la tarjeta de la guía.
    expect
      .soft(anterior, 'el veredicto teclea la doctrina del régimen derogado')
      .toContain(COMPLEMENTO_MATERNIDAD_DEROGADO.doctrinaAcceso);

    // (b) Rama general de hombre, sin denegación propia
    const { stjue, ts } = COMPLEMENTO_BRECHA_GENERO_META.doctrina;
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const general = await textoResultado(page);
    expect(general).toContain('+73,80 €/mes'); // 2 × cuantiaPorHijoMensual 36,90
    expect(general).toContain('los hombres tienen derecho al complemento en las mismas');
    expect
      .soft(general, 'la rama general teclea los años en vez de leer META.doctrina')
      .toContain(stjue.fecha);

    // Contraste: la rama de RECLAMACIÓN, del mismo sexo y el mismo supuesto, sí las lee.
    // Es lo que hace visible que el defecto está en la rama, no en el módulo.
    await responderYVerificar(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: 2,
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      denegacionPropia: true,
    });
    const reclamacion = await textoResultado(page);
    expect(reclamacion).toContain(stjue.fecha); // '15 de mayo de 2025'
    expect(reclamacion).toContain(stjue.asunto); // 'C-623/23'
    expect(reclamacion).toContain(ts.fecha); // '9 de julio de 2025'
  });
  /**
   * ✅ HALLAZGO 1174 del 21/09/2026 — BAJO (dato), REPARADO el 21/09. Residuo del 652.
   *
   * La tabla comparativa publicaba las cifras del complemento de maternidad DEROGADO
   * —5 %, 10 %, 15 %; «2 o más hijos»; «15 % (4 o más hijos)»— sin nombrar en ningún sitio
   * la redacción de la que salen. `COMPLEMENTO_MATERNIDAD_DEROGADO.norma` y `.vigenteHasta`
   * existían en el módulo y no tenían NINGÚN consumidor en todo el catálogo, mientras el
   * rótulo de la columna tecleaba «hasta feb-2021». Los tres sellos declarados de la página
   * cubren el art. 60 en su redacción vigente, los plazos de la LRJS y el límite de
   * pensiones: ninguno ampara la redacción anterior.
   *
   * No se pide un cuarto DataReference —el módulo es una norma derogada, sin fecha de
   * caducidad ni vigilancia—, sino que la tabla cite `.norma` como el resto de la página
   * cita el art. 60.4 LGSS o la STS 748/2023.
   */
  test('norma derogada (21/09) REPARADO 1174: la tabla cita la redacción de la que salen sus cifras', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    // Las cifras del régimen derogado siguen ahí, derivadas del módulo (hallazgo 607)
    for (const tramo of COMPLEMENTO_MATERNIDAD_DEROGADO.escala) {
      expect(guia).toContain(`${tramo.porcentaje} %`); // U+00A0 normalizado (2244)
    }
    // …y ahora dicen de dónde salen
    expect(guia, 'la tabla no cita la norma del régimen derogado').toContain(
      COMPLEMENTO_MATERNIDAD_DEROGADO.norma,
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 26/09/2026 — la reparación del 21/09 (d225dd3a) y la del contraste de
// las cabeceras (b7733c6d, 22/09) no se habían re-inspeccionado nunca.
//
// Por qué volvió a la cola: la invalidó el barril `data/fiscal/index.ts` (c7af89ec, 26/09,
// RETA). `git log` comprobado: `data/fiscal/pensiones.ts` no cambia desde 546c3b11
// (21/09, 14:37, anterior a aquella inspección) y el motor
// `lib/calculadoras/complementoBrechaGenero.ts` solo cambia en d225dd3a, que ES la
// reparación. Nada de lo que decide el importe se ha movido.
//
// Estado de las reparaciones, reproducido en navegador:
//   · 1171 CIERRA — vacío, «2.5», «-1» y «21» dan «Sin calcular / Falta un dato: esto NO es
//     una respuesta sobre tu derecho», con su icono y su estilo, y «0» sigue siendo la
//     denegación de fondo («No procede ahora»).
//   · 1172 CIERRA — la rama anterior al corte cita «la STJUE de 12 de diciembre de 2019
//     (C-450/18, caso WA)» leída de COMPLEMENTO_MATERNIDAD_DEROGADO.doctrinaAcceso.
//   · 1173 CIERRA — la rama general de hombre cita META.doctrina entera.
//   · 1174 CIERRA — la tabla cita `.norma` y «vigente hasta el 3 de febrero de 2021».
//   · b7733c6d CIERRA — <th> blanco sobre --primary-boton, 5,47:1 en los dos temas.
//
// Casos RESUELTOS A MANO contra COMPLEMENTO_BRECHA_GENERO_2026 (cuantiaPorHijoMensual
// 36,90 · maxHijos 4 · pagasAnuales 14 · fechaMinimaHechoCausante '2021-02-04') antes de
// abrir el navegador; los doce coincidieron con lo obtenido, en 1280 y en 360 px.
//
// Debajo, los once hallazgos de esta vuelta (2239-2249), REPARADOS el 26/09/2026 y ya sin
// `test.fail()`. El de la concurrencia se ancla en el
// texto consolidado del art. 60 LGSS (BOE-A-2015-11724, versión vigente desde el
// 18/03/2023, consultado por la API de datos abiertos del BOE el 26/09/2026), que es la
// fuente que declara COMPLEMENTO_BRECHA_GENERO_META.fuente.
// ═════════════════════════════════════════════════════════════════════════════

/** Espacio duro (U+00A0): el que manda la RAE entre la cifra y el %. */
const NBSP = String.fromCharCode(160);

/**
 * Siembra el campo de hijos con el helper de hidratación. Si React ya tiene ese valor, antes
 * siembra otro: sembrar el valor que el campo YA tiene no prueba nada (cabecera de
 * `_hidratacion.ts`), y el valor por defecto del campo es «2», que es el del caso normal.
 */
async function sembrarHijos(page: Page, valor: string): Promise<void> {
  const previo = await leerValorEnReact(page, '#hijos');
  if (previo === valor) await sembrarValor(page, '#hijos', valor === '7' ? '8' : '7');
  await sembrarValor(page, '#hijos', valor);
}

interface Respuestas26 {
  pension: string;
  fecha: string;
  hijos: string;
  sexo: string;
  otroProgenitor: string;
  /** P5 bis (hallazgo 2239): solo si el otro progenitor ya lo percibe */
  sumaMenor?: string;
  denegacionPropia?: boolean;
}

/** Como `responderYVerificar`, pero el campo de hijos se escribe con `sembrarValor`. */
async function responderConSiembra(page: Page, r: Respuestas26): Promise<void> {
  await elegir(page, r.pension);
  await elegir(page, r.fecha);
  await sembrarHijos(page, r.hijos);
  await elegir(page, r.sexo);
  await elegir(page, r.otroProgenitor);
  if (r.sumaMenor) await elegir(page, r.sumaMenor);
  await elegir(page, r.denegacionPropia ? 'Sí, tengo una resolución denegatoria' : 'No');
  await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
}

/**
 * Contraste WCAG MÍNIMO del texto del primer elemento visible que case con `selector`,
 * contra su fondo REAL: compone las capas con alfa de los ancestros y, si hay un degradado,
 * devuelve el peor de sus extremos. Se mide con las transiciones congeladas y el ratón fuera
 * (el :hover de las opciones cambia el color).
 */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel: string): number => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const parse = (s: string): Rgba | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const lum = (c: Rgba): number => {
      const f = (v: number): number => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const el = Array.from(document.querySelectorAll(sel)).find((e) => e.getClientRects().length > 0);
    if (!el) throw new Error(`Ningún elemento visible para ${sel}`);
    const capas: Array<{ color?: Rgba; degradado?: Rgba[] }> = [];
    let n: Element | null = el;
    while (n) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage.includes('gradient')) {
        const paradas = Array.from(cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g))
          .map((m) => parse(m[0]))
          .filter((c): c is Rgba => c !== null);
        capas.push({ degradado: paradas });
        break;
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        capas.push({ color: c });
        if (c.a >= 1) break;
      }
      n = n.parentElement;
    }
    let fondos: Rgba[] = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let i = capas.length - 1; i >= 0; i--) {
      const capa = capas[i];
      if (capa.degradado) fondos = capa.degradado.map((s) => sobre(s, fondos[0]));
      else if (capa.color) fondos = fondos.map((f) => sobre(capa.color as Rgba, f));
    }
    const cs = getComputedStyle(el);
    const texto = parse(cs.color) as Rgba;
    return Math.min(
      ...fondos.map((f) => {
        const t = sobre({ ...texto, a: texto.a * Number(cs.opacity) }, f);
        const l1 = lum(t);
        const l2 = lum(f);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }),
    );
  }, selector);
}

/** Congela transiciones y aparta el ratón antes de medir color. */
async function prepararMedicion(page: Page): Promise<void> {
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  await page.mouse.move(0, 0);
  await esperarPaginaAsentada(page);
}

test.describe('Re-inspección 26/09/2026', () => {
  /**
   * CASO N1 (NORMAL) — mujer · jubilación · hecho causante desde el 4-feb-2021 · 2 hijos ·
   * el otro progenitor no lo percibe · sin denegación propia.
   *
   *   hijosComputables = mín(2, maxHijos 4) = 2
   *   mensual = 2 × 36,90 = 73,80 €          ← esperado literal
   *   anual   = 73,80 × pagasAnuales 14 = 1033,20 € (es-ES no agrupa cuatro cifras)
   *
   * OBTENIDO el 26/09/2026: exactamente eso, en escritorio y en 360 × 740.
   */
  test('caso N1 (26/09): mujer, jubilación y 2 hijos → 73,80 €/mes y 1033,20 €/año', async ({ page }) => {
    const { cuantiaPorHijoMensual, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
    expect(2 * cuantiaPorHijoMensual).toBeCloseTo(73.8, 2);
    expect(2 * cuantiaPorHijoMensual * pagasAnuales).toBeCloseTo(1033.2, 2);

    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+73,80 €/mes');
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Hijos computables 2 (máx. 4)');
    expect(resultado).toContain('Mensual estimado 73,80 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1033,20 €/año');
    expect(resultado).not.toContain('Sin calcular');
    expect(resultado).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * CASO L1 (LÍMITE) — el tope de hijos por sus dos lados, con una combinación que ningún
   * test recorría: incapacidad permanente y P5 = «Lo solicitó y se lo denegaron» (la
   * denegación al OTRO progenitor, que no abre ninguna reclamación propia).
   *
   *   4 hijos → mín(4, 4) = 4 → 4 × 36,90 = 147,60 €/mes (= maxMensual) · × 14 = 2066,40 €/año
   *   5 hijos → mín(5, 4) = 4 → lo MISMO; nunca 5 × 36,90 = 184,50 €/mes
   *
   * OBTENIDO el 26/09/2026: exactamente eso, con «Hijos computables 4 (máx. 4)» en los dos.
   */
  test('caso L1 (26/09, límite): 4 y 5 hijos dan 147,60 €/mes, y la denegación del OTRO no abre reclamación', async ({
    page,
  }) => {
    const { maxMensual, maxAnual } = COMPLEMENTO_BRECHA_GENERO_2026;
    expect(maxMensual).toBeCloseTo(147.6, 2);
    expect(maxAnual).toBeCloseTo(2066.4, 2);

    for (const hijos of ['4', '5']) {
      await responderConSiembra(page, {
        pension: 'Incapacidad permanente',
        fecha: 'El 4-feb-2021 o después',
        hijos,
        sexo: 'Mujer',
        otroProgenitor: 'Lo solicitó y se lo denegaron',
      });
      const resultado = await textoResultado(page);
      expect(resultado, `${hijos} hijos`).toContain('+147,60 €/mes');
      expect(resultado, `${hijos} hijos`).toContain('Hijos computables 4 (máx. 4)');
      expect(resultado, `${hijos} hijos`).toContain('Anual (14 pagas) 2066,40 €/año');
      expect(resultado, `${hijos} hijos`).toContain('Cumples los requisitos básicos');
      expect(resultado, `${hijos} hijos`).not.toContain('184,50');
      expect(resultado, `${hijos} hijos`).not.toContain('Posible reclamación retroactiva');
    }
  });

  /**
   * CASO L2 (LÍMITE) — el corte temporal por sus dos lados.
   *
   * El formulario no pide una fecha, sino dos opciones que salen de
   * `fechaMinimaHechoCausante` ('2021-02-04'). Una pensión causada EXACTAMENTE el 04/02/2021
   * cae en «El 4-feb-2021 o después» (la opción es inclusiva, como el «≥» de la norma); una
   * causada el día antes (03/02/2021), en «Antes del 4-feb-2021». Y el régimen derogado dice
   * «vigente hasta el 3 de febrero de 2021» (COMPLEMENTO_MATERNIDAD_DEROGADO.vigenteHasta):
   * los dos lados se tocan sin hueco ni solape.
   *
   *   04/02/2021 · viudedad · 1 hijo → 1 × 36,90 = 36,90 €/mes · × 14 = 516,60 €/año
   *   03/02/2021 · jubilación · 2 hijos → no procede, sin importe, y el paso siguiente cita
   *   la doctrina WA ENTERA del módulo (regresión del 1172)
   *
   * OBTENIDO el 26/09/2026: exactamente eso.
   */
  test('caso L2 (26/09, límite): el 4-feb-2021 entra y el día antes no, con la doctrina WA del módulo', async ({
    page,
  }) => {
    expect(COMPLEMENTO_BRECHA_GENERO_2026.fechaMinimaHechoCausante).toBe('2021-02-04');
    expect(COMPLEMENTO_MATERNIDAD_DEROGADO.vigenteHasta).toBe('2021-02-03');

    await responderConSiembra(page, {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: '1',
      sexo: 'Mujer',
      otroProgenitor: 'No procede (sin otro progenitor)',
    });
    const elDia = await textoResultado(page);
    expect(elDia).toContain('+36,90 €/mes');
    expect(elDia).toContain('Anual (14 pagas) 516,60 €/año');

    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Antes del 4-feb-2021',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const elDiaAntes = await textoResultado(page);
    expect(elDiaAntes).toContain('No procede ahora');
    expect(elDiaAntes).toContain('antes del 4 de febrero de 2021');
    expect(elDiaAntes).not.toContain('73,80');
    expect(elDiaAntes).not.toContain('Desglose económico');
    expect(elDiaAntes).toContain(`la ${COMPLEMENTO_MATERNIDAD_DEROGADO.doctrinaAcceso} también afectó`);
    expect(elDiaAntes).not.toContain('doctrina TJUE 2019');

    // Los dos lados del corte, en la guía: sin hueco ni solape
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());
    expect(guia).toContain('vigente hasta el 3 de febrero de 2021');
  });

  /**
   * CASO L3 (LÍMITE de sexo) — hombre · jubilación · 3 hijos · sin otro progenitor. Con la
   * doctrina de 2025 ya no se le exige la carrera perjudicada: los mismos requisitos que a
   * una mujer (regresión del 1173 en una combinación nueva).
   *
   *   3 × 36,90 = 110,70 €/mes · × 14 = 1549,80 €/año
   *
   * OBTENIDO el 26/09/2026: exactamente eso, con la cita completa de META.doctrina.
   */
  test('caso L3 (26/09): hombre sin otro progenitor y 3 hijos → 110,70 €/mes con la doctrina del módulo', async ({
    page,
  }) => {
    const { stjue, ts } = COMPLEMENTO_BRECHA_GENERO_META.doctrina;
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '3',
      sexo: 'Hombre',
      otroProgenitor: 'No procede (sin otro progenitor)',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+110,70 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1549,80 €/año');
    expect(resultado).toContain(
      `Tras la STJUE de ${stjue.fecha} (${stjue.asunto}) y la doctrina del Tribunal Supremo (${ts.fecha}), los hombres tienen derecho`,
    );
    expect(resultado).not.toContain('TJUE 2025 y TS 2025');
    expect(resultado).not.toContain('Posible reclamación retroactiva');
  });

  /**
   * CASO R (RECHAZO / SIN CALCULAR) — regresión del 1171 con entradas que el 21/09 no se
   * probaron: «-1» (un entero, pero negativo) y «21» (supera el tope del campo), además del
   * vacío y «2.5». Ninguna es una respuesta sobre el derecho; «0» sí lo es.
   *
   * OBTENIDO el 26/09/2026: los cuatro dan «Sin calcular», y «0», «No procede ahora».
   */
  test('caso R (26/09, rechazo): vacío, «2.5», «-1» y «21» → «Sin calcular»; «0» → «No procede ahora»', async ({
    page,
  }) => {
    const base = {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    };
    for (const hijos of ['', '2.5', '-1', '21']) {
      await responderConSiembra(page, { ...base, hijos });
      const resultado = await textoResultado(page);
      expect(resultado, `«${hijos}»`).toContain('Sin calcular');
      expect(resultado, `«${hijos}»`).toContain('Falta un dato: esto NO es una respuesta sobre tu derecho');
      expect(resultado, `«${hijos}»`).not.toContain('No procede ahora');
      expect(resultado, `«${hijos}»`).not.toContain('Desglose económico');
      expect(resultado, `«${hijos}»`).not.toContain('al menos un hijo');
    }
    await responderConSiembra(page, { ...base, hijos: '0' });
    const conCero = await textoResultado(page);
    expect(conCero).toContain('No procede ahora');
    expect(conCero).toContain('al menos un hijo');
    expect(conCero).not.toContain('Sin calcular');
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — MEDIO (cálculo del veredicto). «El otro progenitor ya lo
   * percibe» se contesta con una denegación cerrada, y el art. 60 LGSS prevé justo lo
   * contrario: el complemento puede PASAR al segundo progenitor.
   *
   * Art. 60.2 LGSS (texto consolidado, BOE-A-2015-11724): «El reconocimiento del
   * complemento al segundo progenitor supondrá la extinción del complemento ya reconocido
   * al primer progenitor». Y el 60.1 decide a cuál: al titular de «pensiones públicas cuya
   * suma sea de menor cuantía». La propia página lo dice en el paso siguiente («la SS lo
   * reconoce al progenitor con la pensión pública de menor cuantía. Si tu pensión es
   * inferior, conviene revisar la asignación»), pero no pregunta qué pensión es menor y
   * abre con «No procede ahora» + «no puede reconocerse de nuevo a ti».
   *
   * Esperado (quien tenga la suma de pensiones menor): un veredicto condicionado —depende de
   * qué progenitor tenga la suma menor; si es la tuya, se te reconoce y se extingue el del
   * otro—, no una denegación. Obtenido: «No procede ahora / Revisa el motivo abajo».
   * El motor del MCP (`calcularComplementoBrechaGenero`, caso 4) repite la rama, y
   * REQUISITOS_ART60 la cuenta como requisito en el FAQPage.
   *
   * ✅ REPARADO el 26/09/2026 (hallazgo 2239). Con «Ya lo percibe» aparece la P5 bis
   * («¿Qué progenitor tiene la suma de pensiones públicas menor?») y el veredicto sigue a
   * la norma. Resuelto a mano, 2 hijos → 2 × 36,90 = 73,80 €/mes · × 14 = 1033,20 €/año:
   *   · «La mía es menor» → PROCEDE: +73,80 €/mes, «se extingue el del otro progenitor»
   *     y el paso siguiente cita el art. 60.2 LGSS;
   *   · «No lo sé» (por defecto) → CONDICIONADO: «Depende de la suma de pensiones», con
   *     el importe que correspondería (73,80 €) y sin «No procede ahora»;
   *   · «La del otro progenitor es menor» → NO PROCEDE, por la suma (art. 60.1).
   * Y la tool del MCP da lo mismo por las tres vías (`suma_pensiones_menor`).
   */
  test('REPARADO 2239: «Ya lo percibe» ya no es una denegación cerrada; decide la suma (art. 60.1 y 60.2 LGSS)', async ({
    page,
    request,
  }) => {
    const base = {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
    };

    // El CASO de la ficha: la suma propia es la menor → procede, y se extingue el del otro
    await responderConSiembra(page, { ...base, sumaMenor: 'La mía es menor' });
    let resultado = await textoResultado(page);
    expect(resultado).not.toContain('no puede reconocerse de nuevo a ti');
    expect(resultado).not.toContain('No procede ahora');
    expect(resultado).toContain('+73,80 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1033,20 €/año');
    expect(resultado).toContain('se extingue el del otro progenitor');
    expect(resultado).toContain('art. 60.2 LGSS');

    // Sin saber qué suma es menor → condicionado, no un «no»
    await responderConSiembra(page, { ...base, sumaMenor: 'No lo sé' });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Depende de la suma de pensiones');
    expect(resultado).toContain('73,80 €/mes');
    expect(resultado).toContain('pensiones públicas cuya suma sea de menor cuantía');
    expect(resultado).not.toContain('No procede ahora');
    expect(resultado).not.toContain('Cumples los requisitos básicos');

    // La suma menor es la del otro → ahora sí, no procede (y por la SUMA)
    await responderConSiembra(page, { ...base, sumaMenor: 'La del otro progenitor es menor' });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('su suma de pensiones públicas es menor que la tuya');
    expect(resultado).not.toContain('73,80');

    // Paridad con la tool del MCP de Delegum por las tres vías
    const porMcp = async (suma: string): Promise<string> => {
      const r = await request.post('/api/mcp/delegum/', {
        headers: { Accept: 'application/json, text/event-stream' },
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'calcular_complemento_brecha_genero',
            arguments: {
              sexo: 'mujer',
              num_hijos: 2,
              tipo_pension: 'jubilacion',
              fecha_hecho_causante: 'desde_2021',
              otro_progenitor: 'percibe',
              suma_pensiones_menor: suma,
            },
          },
        },
      });
      expect(r.ok()).toBeTruthy();
      return normalizar((await r.json()).result.content[0].text);
    };
    const mcpPropia = await porMcp('propia');
    expect(mcpPropia).toContain('Tiene derecho al complemento');
    expect(mcpPropia).toContain('73,80 €/mes');
    expect(mcpPropia).toContain('art. 60.2 LGSS');
    const mcpDesconocida = await porMcp('desconocida');
    expect(mcpDesconocida).toContain('Depende de la suma de pensiones');
    expect(mcpDesconocida).not.toContain('No procede ahora');
    const mcpOtro = await porMcp('otro_progenitor');
    expect(mcpOtro).toContain('No procede ahora');
    expect(mcpOtro).not.toContain('incompatible');
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (dato). La regla de concurrencia compara «la pensión
   * pública» y el art. 60.1 LGSS compara la SUMA de pensiones públicas («se reconocerá a
   * aquella que sea titular de pensiones públicas cuya suma sea de menor cuantía»). El
   * módulo la simplifica en COMPLEMENTO_BRECHA_GENERO_META.nota y la página la repite en
   * cinco sitios. Con dos pensiones la respuesta se invierte: A con jubilación 900 € +
   * viudedad 600 € (suma 1.500 €) frente a B con jubilación 1.200 € → por la regla de la
   * página, A (900 < 1.200); por el art. 60.1, B (1.200 < 1.500).
   *
   * ✅ REPARADO el 26/09/2026 (hallazgo 2240): la nota del META y los cinco sitios de la
   * página dicen «suma de pensiones públicas de menor cuantía», y el caso típico usa el
   * ejemplo A/B de la ficha: le corresponde a quien cobra 1.200 €.
   */
  test('REPARADO 2240: el art. 60.1 compara la SUMA de pensiones, no «la pensión»', async ({
    page,
  }) => {
    expect(COMPLEMENTO_BRECHA_GENERO_META.nota).toContain('suma sea de menor cuantía');
    expect(COMPLEMENTO_BRECHA_GENERO_META.nota).not.toContain('incompatible');
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());
    expect(guia).not.toContain('pensión pública de menor cuantía');
    expect(guia).not.toContain('pensión pública menor');
    expect(guia).not.toContain('pensión menor');
    expect(guia).toMatch(/suma sea de menor cuantía|suma de pensiones/);
    // El ejemplo de la ficha, resuelto a mano: 900 + 600 = 1.500 > 1.200 → B
    expect(guia).toContain('le corresponde a quien cobra 1.200 €');
    // Y la ayuda de la P5, fuera de la guía, dice lo mismo
    const p5 = normalizar(await page.locator('#p5-ayuda').innerText());
    expect(p5).toContain('suma de pensiones públicas de menor');
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — MEDIO (accesibilidad). El VEREDICTO positivo —el producto de
   * la app— es texto blanco sobre el degradado verde #27AE60 → #2ECC71
   * (`.resultHeroPositivo`), igual en los dos temas. Medido en el navegador: el importe
   * (32 px, 800, texto grande, exige 3:1) da 2,10–2,87:1, y «Cumples los requisitos
   * básicos» / «Posible reclamación retroactiva» (14,7 px, 400, exige 4,5:1) 2,02–2,73:1.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2241): degradado #1D6B3A → #237B45, 6,5 y 5,3:1 con
  // blanco. Se exige 4,5:1 también al importe (el acta pedía 3:1 por ser texto grande) y en
  // los dos temas, porque el fondo es el mismo en ambos.
  test('REPARADO 2241: el veredicto positivo es blanco sobre verde con contraste suficiente', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    await expect(page.locator('[class*="resultHeroPositivo"]')).toBeVisible();
    await prepararMedicion(page);
    expect(await contrasteMinimo(page, '[class*="resultHeroPositivo"] [class*="resultImporte"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteMinimo(page, '[class*="resultHeroPositivo"] [class*="resultLabel"]')).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    expect(await contrasteMinimo(page, '[class*="resultHeroPositivo"] [class*="resultLabel"]'), 'oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — MEDIO (accesibilidad). El módulo redeclara --primary
   * (#2E86AB) y --secondary en `.container`, sin variante oscura, y los usa como color de
   * TEXTO pequeño y como fondo de texto blanco. Medido en el navegador (claro / oscuro):
   *   · respuesta seleccionada `.optionActivo` (14 px, 700): 3,78 / 2,95:1
   *   · «Paso siguiente» en --secondary (14 px, 700): 2,60:1 en claro
   *   · «Aviso:» en --warning #E67E22 (12,8 px, 700): 2,73:1 en claro
   *   · título de cada consejo `.tipCard h3` (15,7 px, 700): 4,11 / 3,50:1
   *   · número de paso `.stepNumber`, blanco sobre --primary (15,2 px, 700): 4,11:1
   *   · botón «Verificar mi derecho», blanco sobre --primary → --secondary (17,6 px, 700):
   *     2,80–4,11:1
   *   · «Errores frecuentes» #E65100 sobre #FFF8E1 (16,8 px, 700): 3,57:1 en claro
   * Existen --primary-texto, --secondary-texto y --primary-boton para esto.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2242): el módulo ya no redeclara --primary,
  // --secondary ni --warning; texto con --primary-texto / --secondary-texto, fondos con
  // blanco encima con --primary-boton / --secondary-boton. Se añaden el botón y el título
  // de «Errores frecuentes», que el acta midió y el test original no recorría.
  test('REPARADO 2242: color de marca como texto pequeño y blanco sobre marca, con contraste', async ({ page }) => {
    await page.getByRole('button', { name: 'Verificar mi derecho' }).click();
    await abrirGuia(page);
    await prepararMedicion(page);
    const selectores = [
      '[class*="optionActivo"]',
      '[class*="siguienteCard"] strong',
      '[class*="notaFinal"] strong',
      '[class*="tipCard"] h3',
      '[class*="stepNumber"]',
      '[class*="warningHeader"] h3',
      'button[class*="VerificadorComplementoBrechaGenero"][class*="__btn"]',
    ];
    for (const sel of selectores) {
      expect.soft(await contrasteMinimo(page, sel), sel).toBeGreaterThanOrEqual(4.5);
    }
    // En oscuro, la opción seleccionada baja todavía más
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.mouse.move(0, 0);
    expect.soft(await contrasteMinimo(page, '[class*="optionActivo"]'), 'optionActivo oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (accesibilidad). Las cinco preguntas de elección única
   * (P1, P2, P4, P5 y P6) son `<button aria-pressed>` dentro de `role="group"`: un lector
   * anuncia conmutadores independientes («botón de alternancia, presionado») donde la
   * semántica es un grupo de radio, y al elegir otra opción la anterior se despulsa sin
   * anuncio. Es el patrón de los hallazgos 950, 1341 y 2074 de la familia de selectores.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2243): radiogroup + radio + aria-checked, sin
  // aria-pressed, con foco itinerante (solo la marcada en el orden de tabulación) y flechas
  // que mueven selección y foco, como en el patrón WAI-ARIA «Radio Group».
  test('REPARADO 2243: elección única anunciada como grupo de radio, con flechas y foco itinerante', async ({
    page,
  }) => {
    const grupo = page.locator('[aria-labelledby="p1-titulo"]');
    await expect(grupo).toHaveAttribute('role', 'radiogroup');
    const opcion = grupo.getByRole('radio', { name: /Jubilación \(ordinaria/ });
    await expect(opcion).toHaveAttribute('aria-checked', /true|false/);
    // Ninguna opción de las seis preguntas lleva ya aria-pressed
    expect(await page.locator('[role="radio"][aria-pressed]').count()).toBe(0);
    expect(await page.locator('[class*="optionBtn"][aria-pressed]').count()).toBe(0);

    // Foco itinerante: en cada grupo, un solo radio con tabindex 0, y es el marcado
    const p4 = page.getByRole('radiogroup', { name: '4. Sexo administrativo del solicitante' });
    await expect(p4.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(p4.getByRole('radio', { name: 'Mujer' })).toHaveAttribute('tabindex', '0');

    // Flecha abajo: marca «Hombre», le da el foco y desmarca «Mujer»
    await p4.getByRole('radio', { name: 'Mujer' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(p4.getByRole('radio', { name: 'Hombre' })).toHaveAttribute('aria-checked', 'true');
    await expect(p4.getByRole('radio', { name: 'Mujer' })).toHaveAttribute('aria-checked', 'false');
    await expect(p4.getByRole('radio', { name: 'Hombre' })).toBeFocused();
    // Y da la vuelta: desde el último, abajo vuelve al primero
    await page.keyboard.press('ArrowDown');
    await expect(p4.getByRole('radio', { name: 'Mujer' })).toHaveAttribute('aria-checked', 'true');
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (formato). El % va pegado a la cifra en la tabla
   * comparativa («5%, 10%, 15%» y «15% (4 o más hijos)», `ESCALA_MATERNIDAD` y
   * `MAXIMO_MATERNIDAD` en page.tsx) y en el `featureList` del JSON-LD («100% en el
   * navegador»). Desde el 25/09/2026 va separado con espacio duro (U+00A0).
   * Al repararlo, la aserción `${tramo.porcentaje}%` del test de 1174 (arriba) tendrá que
   * seguir a la nueva forma.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2244): la tabla y el featureList del JSON-LD.
  test('REPARADO 2244: el % de la tabla comparativa y del JSON-LD va con espacio duro', async ({ page }) => {
    await abrirGuia(page);
    const bruto = await page.locator('table').first().innerText();
    for (const tramo of COMPLEMENTO_MATERNIDAD_DEROGADO.escala) {
      expect(bruto).toContain(`${tramo.porcentaje}${NBSP}%`);
    }
    const maximo = COMPLEMENTO_MATERNIDAD_DEROGADO.escala[COMPLEMENTO_MATERNIDAD_DEROGADO.escala.length - 1];
    expect(bruto).toContain(`${maximo.porcentaje}${NBSP}% (${maximo.hijos} o más hijos)`);
    expect(bruto).not.toMatch(/\d%/);
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(jsonLd).toContain(`100${NBSP}% en el navegador`);
    expect(jsonLd).not.toMatch(/\d%/);
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (dato). «14 pagas» va tecleado en el desglose del
   * veredicto («Anual (14 pagas)») y en la guía («se abona junto con la pensión en 14
   * pagas»), mientras el importe anual que está al lado se calcula con
   * `COMPLEMENTO_BRECHA_GENERO_2026.pagasAnuales` y la tarjeta de casos típicos ya lo
   * interpola. Residuo del 226.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2245): las dos etiquetas interpolan `pagasAnuales`.
  test('REPARADO 2245: «14 pagas» ya no va tecleado junto a una cifra que se calcula con pagasAnuales', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const pagina = readFileSync(
      join(process.cwd(), 'app', 'verificador-complemento-brecha-genero', 'page.tsx'),
      'utf8',
    );
    expect(pagina).not.toMatch(/\b14\s+pagas/);
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (dato). Residuo de 606/1173 en la guía y en metadata: la
   * cita degradada de la doctrina de igualdad de trato sigue tecleada con el año —«la
   * doctrina TJUE/TS de 2025» (caso típico), «(doctrina TJUE/TS 2025)» (paso 6), «previas
   * a 2025 … tras la doctrina TJUE/TS» (errores frecuentes), «hasta 2025» (tabla),
   * «anteriores a 2025» (P6), y en metadata «sentencia TJUE 2025» (description) y
   * «doctrina TJUE 2025» (featureList)—, mientras el tip «Aporta jurisprudencia», en la
   * MISMA guía, cita META.doctrina entera.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2246): los cinco sitios de la página y los dos de
  // metadata.ts citan META.doctrina.
  test('REPARADO 2246: la guía y el metadata citan META.doctrina, no «doctrina TJUE/TS 2025»', async ({ page }) => {
    const { stjue, ts } = COMPLEMENTO_BRECHA_GENERO_META.doctrina;
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());
    expect(guia).not.toContain('TJUE/TS');
    expect(guia).not.toContain('hasta 2025');
    expect(guia).not.toContain('anteriores a 2025');
    expect(guia).not.toContain('previas a 2025');
    // Caso típico y tabla, con la cita entera del módulo
    expect(guia).toContain(`la ${stjue.corto} (${stjue.fecha}) y la STS de ${ts.fecha} abren la vía`);
    expect(guia).toContain(`hasta la ${stjue.corto} (${stjue.fecha})`);
    expect(guia).toContain(`(${stjue.corto} y ${ts.corto})`);

    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const meta = readFileSync(
      join(process.cwd(), 'app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
      'utf8',
    );
    expect(meta).not.toContain('TJUE 2025');
    expect(meta).not.toContain('antes de 2025');
    const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
    expect(descripcion).toContain(stjue.corto);
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (operativa). En móvil (360 × 740) el veredicto nace fuera
   * de pantalla: con el botón «Verificar mi derecho» abajo, como queda tras contestar la P6,
   * el importe aparece ~230 px por debajo del borde inferior (top 968 px en un visor de
   * 740), y ni el scroll ni el foco lo acompañan (el foco se queda en el botón). A la vista
   * no pasa nada al pulsar. Es el patrón de 1222 y 2105.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2247): al pulsar, el veredicto se lleva a la vista
  // si no lo está y recibe el foco (tabIndex -1), cada vez que se pulsa.
  test('REPARADO 2247: en móvil el veredicto se lleva a la vista y recibe el foco al verificar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const boton = page.getByRole('button', { name: 'Verificar mi derecho' });
    await boton.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(
        (x) => x.getRootNode() === document && (x.textContent ?? '').includes('Verificar mi derecho'),
      );
      if (!b) throw new Error('Sin botón «Verificar mi derecho»');
      window.scrollBy(0, b.getBoundingClientRect().bottom - window.innerHeight + 20);
    });
    await boton.click();
    const importe = page.locator('[class*="resultImporte"]');
    await expect(importe).toHaveText('+73,80 €/mes');
    await page.waitForTimeout(600); // margen para un scroll suave, si lo hubiera
    const caja = await importe.boundingBox();
    expect(caja).not.toBeNull();
    const { y, height } = caja as { y: number; height: number };
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y + height).toBeLessThanOrEqual(740);
    // El foco sigue al veredicto: ya no se queda en el botón
    const enfocado = await page.evaluate(() => (document.activeElement?.className ?? '').toString());
    expect(enfocado).toContain('resultHero');
    expect(normalizar(await page.evaluate(() => (document.activeElement as HTMLElement).innerText))).toContain('+73,80 €/mes');
  });
});

// Re-inspección 26/09/2026 (continuación): dos defectos de redacción de la guía, vistos al
// leer el texto servido de los tests de arriba.
test.describe('Re-inspección 26/09/2026 — redacción de la guía', () => {
  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (contenido). El paso 1 de la guía enuncia el requisito
   * temporal como «hecho causante POSTERIOR al 4-feb-2021», que deja fuera el propio día del
   * corte. El módulo (`fechaMinimaHechoCausante` '2021-02-04'), el formulario («El 4-feb-2021
   * o después»), REQUISITOS_ART60 («sea el 4 de febrero de 2021 o posterior») y el art. 60 en
   * la redacción del RDL 3/2021 (vigente desde el 04/02/2021, según el BOE) lo incluyen.
   * Quien causó la pensión justo el 04/02/2021 lee en la guía que no cumple el requisito.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2248): «el 4-feb-2021 o después», como el formulario.
  test('REPARADO 2248: el paso 1 de la guía incluye el día del corte', async ({
    page,
  }) => {
    await abrirGuia(page);
    const paso1 = normalizar(
      await page.locator('li', { hasText: 'Verifica los requisitos básicos' }).innerText(),
    );
    expect(paso1).toContain('4-feb-2021');
    expect(paso1).not.toContain('posterior al 4-feb-2021');
    expect(paso1).toContain('el 4-feb-2021 o después');
  });

  /**
   * ⚠️ HALLAZGO 26/09/2026 — BAJO (contenido). Tres palabras pegadas en la guía por saltos de
   * línea del JSX (una línea que acaba en `</strong>` o en `{…}` y la siguiente empieza con
   * texto pierde el espacio): «Resultado:no aplica» (caso «Pensión anterior a feb-2021»),
   * «(C-450/18, caso WA)con un profesional» (misma tarjeta) y «STJUE C-623/23(15 de mayo de
   * 2025)» (tip «Aporta jurisprudencia»). Las dos citas pegadas nacieron de la reparación
   * del 02/09 (4dcd32ea), al interpolar la doctrina del módulo.
   */
  // ✅ REPARADO el 26/09/2026 (hallazgo 2249): {' '} explícito en los tres saltos.
  test('REPARADO 2249: sin palabras pegadas en la guía por saltos de línea del JSX', async ({ page }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());
    expect.soft(guia).not.toContain('Resultado:no aplica');
    expect.soft(guia).not.toContain('caso WA)con un profesional');
    expect.soft(guia).not.toContain('C-623/23(15 de mayo');
    expect.soft(guia).toContain('Resultado: no aplica');
    expect.soft(guia).toContain('caso WA) con un profesional');
    expect.soft(guia).toContain('C-623/23 (15 de mayo');
    // Barrido general: ninguna letra pegada a un paréntesis de apertura ni a «:»
    expect.soft(guia).not.toMatch(/[a-záéíóú]\((?!s\))/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 01/10/2026 — segmento FISCAL, riesgo 1 CRÍTICO
//
// Volvió a la cola por a7be5add (26/09, la reparación de 2239-2249) y por b7ec248c (01/10,
// el año del título sale de `COMPLEMENTO_BRECHA_GENERO_META.vigencia`, candado
// `check:anio-titulo`). La batería entera (61 tests) se ejecutó ANTES de tocar nada y pasó
// los 61: las once reparaciones del 26/09 se sostienen.
//
// Lo que se miró esta vez, y no antes, es el art. 60 LGSS entero contra la fuente oficial:
//   · Texto consolidado del art. 60 (BOE-A-2015-11724, versión vigente desde el 18/03/2023,
//     API de datos abiertos del BOE, consultada el 01/10/2026).
//   · RD 241/2026 (BOE-A-2026-6977), art. 12: «Con efectos de 1 de enero de 2026, la cuantía
//     del complemento para la reducción de la brecha de género queda establecida en 36,90
//     euros mensuales, conforme a lo dispuesto en el artículo 2 del Real Decreto-ley 3/2026».
//     Cuadra con `cuantiaPorHijoMensual` y con la fuente que declara el META (RDL 3/2026).
//   · Art. 60.3: «La cuantía a percibir estará limitada a cuatro veces el importe mensual
//     fijado por hijo o hija» (= maxHijos 4) y 60.3.c) «catorce pagas» (= pagasAnuales 14).
//
// Los requisitos adicionales del art. 60.1.b) para el padre (interrupción o afectación de
// la carrera y suma de pensiones inferior a la de la madre) siguen en el texto consolidado;
// que ya no se exijan sale de `COMPLEMENTO_BRECHA_GENERO_META.doctrina` (STJUE C-623/23 y
// STS 9-jul-2025). La sentencia no se pudo cotejar en EUR-Lex desde esta sesión: se toma
// el módulo como ancla, que es lo que manda la regla fiscal del Inspector.
//
// Tres casos nuevos RESUELTOS A MANO antes de abrir el navegador (los tres coincidieron, en
// 1280 px y en 390 px, en claro y en oscuro), y siete hallazgos ABIERTOS con `test.fail()`.
//
// ✅ REPARADOS los siete (2538-2544) el 01/10/2026: sin `test.fail()`, quedan como regresión.
// 2540 y 2541 se repararon PREGUNTANDO (P3 bis y P1 bis), no con un aviso bajo la cifra.
// ═════════════════════════════════════════════════════════════════════════════

/** Llama a la tool `calcular_complemento_brecha_genero` del MCP de Delegum y normaliza el texto. */
async function porMcpDelegum(
  request: APIRequestContext,
  argumentos: Record<string, unknown>,
): Promise<string> {
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
  return normalizar((await respuesta.json()).result.content[0].text);
}

test.describe('Re-inspección 01/10/2026', () => {
  /**
   * DATOS (01/10): el módulo dice lo mismo que el BOE. Fuentes en la cabecera del bloque.
   * Si en enero se revaloriza, este test DEBE fallar: se vuelve a cotejar con el RD de
   * revalorización del año, no se ajusta a lo que diga el módulo.
   */
  test('datos (01/10): 36,90 €/mes por hijo (RD 241/2026, art. 12), tope de 4 y 14 pagas (art. 60.3 LGSS)', async () => {
    const m = COMPLEMENTO_BRECHA_GENERO_2026;
    expect(m.cuantiaPorHijoMensual).toBe(36.9);
    expect(m.maxHijos).toBe(4);
    expect(m.pagasAnuales).toBe(14);
    expect(m.maxMensual).toBeCloseTo(4 * 36.9, 2); // 147,60
    expect(m.maxAnual).toBeCloseTo(4 * 36.9 * 14, 2); // 2066,40
    expect(COMPLEMENTO_BRECHA_GENERO_META.fuente).toContain('RDL 3/2026');
    expect(COMPLEMENTO_BRECHA_GENERO_META.vigencia).toBe('2026');
  });

  /**
   * CASO X1 (NORMAL) — la concurrencia resuelta A FAVOR de un HOMBRE, que ningún test
   * recorría (el del 2239 lo hace con una mujer y 2 hijos).
   *
   *   P1 incapacidad permanente ∈ pensionesElegibles · P2 desde el 4-feb-2021
   *   P3 3 hijos → hijosComputables = mín(3, maxHijos 4) = 3
   *   P4 hombre: sin requisitos adicionales (META.doctrina)
   *   P5 el otro progenitor ya lo percibe · P5 bis «La mía es menor» → art. 60.1: le
   *      corresponde a quien tiene la suma menor, y el 60.2 extingue el del otro
   *   P6 sin denegación propia
   *
   *   mensual = 3 × 36,90 = 110,70 €          ← esperado literal
   *   anual   = 110,70 × 14 = 1549,80 €       ← esperado literal (es-ES no agrupa 4 cifras)
   *
   * OBTENIDO el 01/10/2026: exactamente eso, y la tool del MCP da lo mismo.
   */
  test('caso X1 (01/10): hombre, IP y 3 hijos con la suma menor → 110,70 €/mes y se extingue el del otro', async ({
    page,
    request,
  }) => {
    const { cuantiaPorHijoMensual, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
    expect(3 * cuantiaPorHijoMensual).toBeCloseTo(110.7, 2);
    expect(3 * cuantiaPorHijoMensual * pagasAnuales).toBeCloseTo(1549.8, 2);

    await responderConSiembra(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: '3',
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La mía es menor',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+110,70 €/mes');
    expect(resultado).toContain('Te corresponde a ti: se extingue el del otro progenitor');
    expect(resultado).toContain('Hijos computables 3 (máx. 4)');
    expect(resultado).toContain('Mensual estimado 110,70 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1549,80 €/año');
    expect(resultado).toContain('tu suma de pensiones públicas es la menor');
    expect(resultado).toContain('C-623/23'); // la rama de hombre cita META.doctrina
    expect(resultado).toContain('a quien el INSS da audiencia antes de resolver');
    expect(resultado).toContain('art. 60.2 LGSS');
    expect(resultado).not.toContain('No procede ahora');
    expect(resultado).not.toContain('Posible reclamación retroactiva');

    const mcp = await porMcpDelegum(request, {
      sexo: 'hombre',
      num_hijos: 3,
      tipo_pension: 'incapacidad_permanente',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'percibe',
      suma_pensiones_menor: 'propia',
    });
    expect(mcp).toContain('Tiene derecho al complemento');
    expect(mcp).toContain('110,70 €/mes (1549,80 €/año, 14 pagas)');
    expect(mcp).toContain('art. 60.2 LGSS');
  });

  /**
   * CASO X2 (LÍMITE) — el tope de 4 hijos DENTRO de la rama condicionada, nacida el 26/09
   * (2239) y que solo se había probado con 2 hijos.
   *
   *   mujer · viudedad · desde el 4-feb-2021 · 6 hijos · el otro ya lo percibe · «No lo sé»
   *   hijosComputables = mín(6, 4) = 4 → 4 × 36,90 = 147,60 €/mes (= maxMensual)
   *   anual = 147,60 × 14 = 2066,40 €/año (= maxAnual) · NUNCA 6 × 36,90 = 221,40 €/mes
   *   Veredicto: condicionado («Depende de la suma de pensiones»), no un «no».
   *
   * OBTENIDO el 01/10/2026: exactamente eso, también por la tool del MCP.
   */
  test('caso X2 (01/10, límite): 6 hijos en la rama condicionada topan en 147,60 €/mes', async ({
    page,
    request,
  }) => {
    await responderConSiembra(page, {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: '6',
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'No lo sé',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('Depende de la suma de pensiones');
    expect(resultado).toContain('Si tu suma de pensiones públicas es la menor, te corresponde: +147,60 €/mes');
    expect(resultado).toContain('Desglose, si te corresponde');
    expect(resultado).toContain('Hijos computables 4 (máx. 4)');
    expect(resultado).toContain('Mensual estimado 147,60 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año');
    expect(resultado).not.toContain('221,40');
    expect(resultado).not.toContain('No procede ahora');
    expect(resultado).not.toContain('Cumples los requisitos básicos');

    const mcp = await porMcpDelegum(request, {
      sexo: 'mujer',
      num_hijos: 6,
      tipo_pension: 'viudedad',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'percibe',
      suma_pensiones_menor: 'desconocida',
    });
    expect(mcp).toContain('Depende de la suma de pensiones');
    expect(mcp).toContain('147,60 €/mes (2066,40 €/año)');
    expect(mcp).not.toContain('221,40');
  });

  /**
   * CASO X3 (RECHAZO) — una respuesta de concurrencia FAVORABLE no puede saltarse la
   * exclusión del art. 60.4 LGSS.
   *
   *   mujer · jubilación PARCIAL · desde el 4-feb-2021 · 4 hijos · el otro ya lo percibe ·
   *   «La mía es menor» → art. 60.4: «No se tendrá derecho a este complemento en los casos
   *   de jubilación parcial». Esperado: «No procede ahora», sin importe (ni los 147,60 € del
   *   tope) y sin «Te corresponde a ti».
   *
   * OBTENIDO el 01/10/2026: exactamente eso, y el MCP igual.
   */
  test('caso X3 (01/10, rechazo): jubilación parcial con la suma menor sigue sin derecho (art. 60.4)', async ({
    page,
    request,
  }) => {
    await responderConSiembra(page, {
      pension: 'Jubilación parcial',
      fecha: 'El 4-feb-2021 o después',
      hijos: '4',
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La mía es menor',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('Art. 60.4 LGSS excluye expresamente');
    expect(resultado).not.toContain('147,60');
    expect(resultado).not.toContain('Te corresponde a ti');
    expect(resultado).not.toContain('se extingue el del otro progenitor');
    expect(resultado).not.toContain('Desglose');

    const mcp = await porMcpDelegum(request, {
      sexo: 'mujer',
      num_hijos: 4,
      tipo_pension: 'jubilacion_parcial',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'percibe',
      suma_pensiones_menor: 'propia',
    });
    expect(mcp).toContain('60.4');
    expect(mcp).not.toContain('147,60');
    expect(mcp).not.toContain('Tiene derecho al complemento');
  });

  /**
   * TÍTULO (01/10, b7ec248c): el año del <title>, del og:title y del twitter:title es la
   * vigencia del módulo. Cierra; lo que no alcanzó la reparación va en el test siguiente.
   */
  test('título (01/10): title, og y twitter llevan el año de META.vigencia', async ({ page }) => {
    const anio = COMPLEMENTO_BRECHA_GENERO_META.vigencia;
    expect(await page.title()).toContain(`Brecha de Género ${anio}`);
    const og = await page.locator('meta[property="og:title"]').getAttribute('content');
    const tw = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    expect(og).toContain(`Brecha de Género ${anio}`);
    expect(tw).toContain(`Brecha de Género ${anio}`);
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2539 — BAJO (dato). b7ec248c sacó el año del título de
   * `META.vigencia`, pero en el MISMO metadata.ts el JSON-LD lo seguía tecleando tres veces:
   * `jsonLd.name` («…Brecha de Género 2026»), la feature «Datos normativos 2026 verificados»
   * y la pregunta 1 del FAQPage («¿… a cuánto asciende en 2026?»), cuya respuesta interpola
   * `CUANTIA` del módulo. El candado excluye el FAQPage porque «un texto con IMPORTES escritos
   * a mano tiene que llevar el año escrito a mano», pero aquí el importe NO va a mano: al
   * re-sellar el módulo para 2027, el título diría 2027 y el FAQPage preguntaría por 2026 y
   * contestaría con la cuantía de 2027. Las keywords también lo tecleaban.
   *
   * Reparación: los cuatro sitios interpolan `anio` (= META.vigencia), como el title.
   */
  test('REPARADO 2539 (01/10/2026): el JSON-LD y las keywords leen el año de META.vigencia', async ({ page }) => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(
      join(process.cwd(), 'app', 'verificador-complemento-brecha-genero', 'metadata.ts'),
      'utf8',
    );
    // Desde `jsonLd` hasta el final (las keywords quedan antes y fuera); lo interpolado no cuenta,
    // ni un año pegado a guion o barra («RDL 3/2021»), con el mismo criterio que check:anio-titulo.
    const ld = fuente.slice(fuente.indexOf('export const jsonLd')).replace(/\$\{[^}]*\}/g, '');
    expect(ld.match(/(?<![-\/\d])20\d\d(?![-\/\d])/g) ?? []).toEqual([]);

    // Y lo que se SIRVE lleva el año del módulo: nombre, featureList, pregunta 1 y keywords
    const anio = COMPLEMENTO_BRECHA_GENERO_META.vigencia;
    const bloques = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (b) => JSON.parse(b),
    );
    const app = bloques.find((j) => j['@type'] === 'WebApplication');
    const faq = bloques.find((j) => j['@type'] === 'FAQPage');
    expect(app.name).toBe(`Verificador del Complemento por Brecha de Género ${anio}`);
    expect(app.featureList.join(' ')).toContain(`Datos normativos ${anio} verificados`);
    expect(faq.mainEntity[0].name).toContain(`a cuánto asciende en ${anio}?`);
    const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    expect(keywords).toContain(`complemento brecha género ${anio}`);
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2538 — MEDIO (contenido). La P5 bis decide el veredicto
   * y su ayuda mandaba «Suma TODAS las pensiones públicas de cada uno», sin la regla con la
   * que el art. 60.7 LGSS fija esa comparación: «se computarán dichas pensiones teniendo en
   * cuenta su importe inicial, una vez revalorizadas, sin computar los complementos que
   * pudieran corresponder». El propio complemento «tendrá a todos los efectos naturaleza
   * jurídica de pensión pública contributiva» (art. 60.3), así que «todas» lo incluía.
   *
   * Caso, resuelto con el 60.7: madre con jubilación de 900 € que ya cobra el complemento
   * por 2 hijos (73,80 €) frente a padre con jubilación de 950 €. Sin complementos, 900 <
   * 950 → le corresponde a la madre, y el padre debe contestar «La del otro progenitor es
   * menor» → «No procede ahora». Siguiendo la ayuda antigua, 973,80 > 950 → el padre
   * contestaba «La mía es menor» y la app le daba «+73,80 €/mes · Te corresponde a ti».
   *
   * Reparación: la regla vive en `concurrencia.entreProgenitores.comparacion` (data/fiscal,
   * con el desempate del párrafo 2.º) y de ahí la leen la ayuda de la P5 bis, el paso
   * siguiente de las ramas condicionada y desfavorable, el caso típico y la tool del MCP
   * (descripción y parámetro `suma_pensiones_menor`, que ya no dice «todas» a secas).
   */
  test('REPARADO 2538 (01/10/2026): la suma se compara sin complementos (art. 60.7), en la web, el módulo y el MCP', async ({
    page,
    request,
  }) => {
    const comparacion = COMPLEMENTO_BRECHA_GENERO_2026.concurrencia.entreProgenitores.comparacion;
    expect(comparacion.norma).toBe('art. 60.7 LGSS');
    expect(comparacion.detalle).toContain('importe inicial, una vez revalorizado');
    expect(comparacion.detalle).toContain('sin computar ningún complemento');
    expect(comparacion.desempate.detalle).toContain('mismo sexo');
    expect(COMPLEMENTO_BRECHA_GENERO_META.nota).toContain('art. 60.7 LGSS');

    // La ayuda de la P5 bis: la regla, su norma y el desempate
    await elegir(page, 'Ya lo percibe por los mismos hijos');
    const ayuda = normalizar(await page.locator('#p5bis-ayuda').innerText());
    expect(ayuda).toMatch(/sin (computar|contar|incluir) (los |ningún )?complementos?/i);
    expect(ayuda).toContain('importe inicial');
    expect(ayuda).toContain('art. 60.7 LGSS');
    expect(ayuda).toContain('solicitó en primer lugar la pensión con derecho a complemento');

    // El CASO de la ficha, contestado por el padre con la regla del 60.7 (900 < 950):
    // «La del otro progenitor es menor» → no procede, y el paso siguiente repite la regla
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La del otro progenitor es menor',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).not.toContain('73,80');
    expect(resultado).toContain('sin computar ningún complemento');
    expect(resultado).toContain('art. 60.7 LGSS');

    // El veredicto condicionado («No lo sé»): el paso siguiente dice cómo hacer la cuenta
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'No lo sé',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Depende de la suma de pensiones');
    expect(resultado).toContain('importe inicial, una vez revalorizado, sin computar ningún complemento');
    expect(resultado).toContain('art. 60.7 LGSS');

    // MCP: el veredicto condicionado y la descripción del parámetro que decide
    const mcp = await porMcpDelegum(request, {
      sexo: 'hombre',
      num_hijos: 2,
      tipo_pension: 'jubilacion',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'percibe',
      suma_pensiones_menor: 'desconocida',
    });
    expect(mcp).toContain('sin computar ningún complemento');
    expect(mcp).toContain('art. 60.7 LGSS');

    const lista = await request.post('/api/mcp/delegum/', {
      headers: { Accept: 'application/json, text/event-stream' },
      data: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
    });
    expect(lista.ok()).toBeTruthy();
    const tools: { name: string; description: string; inputSchema: { properties: Record<string, { description?: string }> } }[] =
      (await lista.json()).result.tools;
    const tool = tools.find((t) => t.name === 'calcular_complemento_brecha_genero');
    expect(tool).toBeTruthy();
    const parametro = normalizar(tool!.inputSchema.properties.suma_pensiones_menor.description ?? '');
    expect(parametro).toContain('sin computar ningún complemento');
    expect(parametro).toContain('art. 60.7 LGSS');
    expect(parametro).not.toContain('(todas, p. ej. jubilación + viudedad)');
    expect(normalizar(tool!.description)).toContain('art. 60.7 LGSS');
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2540 — BAJO (contenido). El art. 60.3.b) LGSS niega el
   * complemento a quien haya sido privado de la patria potestad por incumplimiento de sus
   * deberes y a quien haya sido condenado por violencia contra la madre o contra los hijos.
   * La página no lo mencionaba, y el FAQPage afirmaba lo contrario en general: «Son 4
   * requisitos: […] el complemento se reconoce automáticamente si se cumplen estas
   * condiciones». Caso: progenitor privado de la patria potestad por sentencia, con
   * jubilación desde 2021 y 2 hijos → esperado (art. 60.3.b): sin derecho.
   *
   * Reparación: se PREGUNTA (P3 bis), no se advierte. Con «Sí» no hay derecho ni cifra: un
   * aviso bajo «+73,80 €/mes» no protege, quien lee se lleva el número (regla «o se calcula
   * o no hay cifra», del caso ISD de Cataluña, 08/09/2026, donde el aviso iba bajo 23.000 €
   * que debían ser 0). Aquí el caso es el mismo: la cifra pasa de 73,80 € a 0 €. El texto
   * sale de `exclusiones` en data/fiscal; el FAQPage ya no dice «automáticamente» y cita la
   * exclusión. La tool del MCP recibe `excluido_art_60_3_b`.
   */
  test('REPARADO 2540 (01/10/2026): las exclusiones del art. 60.3.b) se preguntan y, si alcanzan, no hay cifra', async ({
    page,
    request,
  }) => {
    const exclusion = COMPLEMENTO_BRECHA_GENERO_2026.exclusiones.find(
      (e) => e.supuesto === 'patria_potestad_o_violencia',
    );
    expect(exclusion?.norma).toBe('art. 60.3.b) LGSS');

    // El caso de la ficha: jubilación desde 2021, 2 hijos, privado de la patria potestad
    await elegir(page, 'Sí, me alcanza alguna');
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('art. 60.3.b) LGSS');
    expect(resultado).toContain('patria potestad');
    expect(resultado).not.toContain('73,80');
    expect(resultado).not.toContain('Cumples los requisitos básicos');
    expect(resultado).not.toContain('Desglose');

    // La pregunta y la guía lo enuncian
    await abrirGuia(page);
    const cuerpo = normalizar(await page.locator('body').innerText());
    expect(cuerpo).toContain('patria potestad');
    expect(cuerpo).toContain('violencia contra la mujer ejercida sobre la madre');

    // El FAQPage ya no promete reconocimiento automático y cita la exclusión
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((b) => JSON.parse(b))
      .find((j) => j['@type'] === 'FAQPage');
    const textosFaq = faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text).join(' ');
    expect(textosFaq).not.toContain('se reconoce automáticamente si se cumplen');
    expect(textosFaq).toContain('patria potestad');

    // Paridad: el MCP tampoco da cifra
    const mcp = await porMcpDelegum(request, {
      sexo: 'hombre',
      num_hijos: 2,
      tipo_pension: 'jubilacion',
      fecha_hecho_causante: 'desde_2021',
      excluido_art_60_3_b: true,
    });
    expect(mcp).toContain('No procede ahora');
    expect(mcp).toContain('60.3.b)');
    expect(mcp).not.toContain('73,80');
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2541 — BAJO (contenido). Art. 60.3.f) LGSS: si la
   * pensión se causa por totalización de períodos a prorrata temporis (normativa
   * internacional), «el importe real del complemento será el resultado de aplicar a la
   * cuantía […] la prorrata aplicada a la pensión».
   *
   * Reparación: se PREGUNTA y se CALCULA (P1 bis + campo de prorrata), por la misma regla
   * que el 2540: con un aviso bajo el importe íntegro, quien lee se lleva el doble. Si dice
   * que es a prorrata y no da un porcentaje válido, «Sin calcular»: no hay cifra.
   *
   * Casos resueltos A MANO antes de abrir el navegador (cuantía 36,90 €, 14 pagas):
   *   · la ficha: jubilación, 2 hijos, prorrata 50 % → 2 × 36,90 × 0,50 = 36,90 €/mes;
   *     anual 36,90 × 14 = 516,60 €/año (es-ES no agrupa 4 cifras ni menos)
   *   · límite: IP, 6 hijos → topan en 4; prorrata 40 % → 4 × 36,90 × 0,40 = 59,04 €/mes;
   *     anual 59,04 × 14 = 826,56 €/año; nunca 6 × 36,90 × 0,40 = 88,56
   *   · rechazo: «Sí» con el campo vacío o con «0» → «Sin calcular», sin 73,80 ni 36,90
   */
  test('REPARADO 2541 (01/10/2026): la prorrata del art. 60.3.f) se pregunta y se aplica al importe', async ({
    page,
    request,
  }) => {
    const { cuantiaPorHijoMensual, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
    expect(2 * cuantiaPorHijoMensual * 0.5).toBeCloseTo(36.9, 2);
    expect(36.9 * pagasAnuales).toBeCloseTo(516.6, 2);
    expect(4 * cuantiaPorHijoMensual * 0.4).toBeCloseTo(59.04, 2);
    expect(59.04 * pagasAnuales).toBeCloseTo(826.56, 2);

    const aProrrata = async (texto: string): Promise<void> => {
      await elegir(page, 'Sí, a prorrata (totalización internacional)');
      await page.locator('#prorrata').fill(texto);
      await expect(page.locator('#prorrata')).toHaveValue(texto);
    };

    // La ficha: 50 % y 2 hijos
    await elegir(page, 'Jubilación (ordinaria o anticipada)');
    await aProrrata('50');
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('+36,90 €/mes');
    expect(resultado).toContain('Mensual estimado 36,90 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 516,60 €/año');
    expect(resultado).toContain('Prorrata de tu pensión (art. 60.3.f) LGSS) 50,00 %');
    expect(resultado).toContain('Cuantía por hijo (importe teórico) 36,90 €/mes');
    expect(resultado).not.toContain('73,80');
    expect(resultado).not.toContain('1033,20');

    // Límite: el tope de hijos se aplica ANTES de la prorrata
    await elegir(page, 'Incapacidad permanente');
    await aProrrata('40');
    await responderConSiembra(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: '6',
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+59,04 €/mes');
    expect(resultado).toContain('Hijos computables 4 (máx. 4)');
    expect(resultado).toContain('Anual (14 pagas) 826,56 €/año');
    expect(resultado).not.toContain('88,56');
    expect(resultado).not.toContain('147,60 €/mes');

    // Rechazo: a prorrata sin una prorrata válida → sin cifra
    for (const texto of ['', '0', '120', 'abc']) {
      await elegir(page, 'Jubilación (ordinaria o anticipada)');
      await elegir(page, 'Sí, a prorrata (totalización internacional)');
      await page.locator('#prorrata').fill(texto);
      await responderConSiembra(page, {
        pension: 'Jubilación (ordinaria o anticipada)',
        fecha: 'El 4-feb-2021 o después',
        hijos: '2',
        sexo: 'Mujer',
        otroProgenitor: 'No lo percibe ni lo ha solicitado',
      });
      resultado = await textoResultado(page);
      expect(resultado, `prorrata «${texto}»`).toContain('Sin calcular');
      expect(resultado, `prorrata «${texto}»`).not.toContain('73,80');
      expect(resultado, `prorrata «${texto}»`).not.toContain('Desglose');
    }

    // Paridad con la tool del MCP
    const mcp = await porMcpDelegum(request, {
      sexo: 'mujer',
      num_hijos: 2,
      tipo_pension: 'jubilacion',
      fecha_hecho_causante: 'desde_2021',
      prorrata_porcentaje: 50,
    });
    expect(mcp).toContain('36,90 €/mes (516,60 €/año, 14 pagas)');
    expect(mcp).toContain('60.3.f)');
    const mcpTope = await porMcpDelegum(request, {
      sexo: 'hombre',
      num_hijos: 6,
      tipo_pension: 'incapacidad_permanente',
      fecha_hecho_causante: 'desde_2021',
      prorrata_porcentaje: 40,
    });
    expect(mcpTope).toContain('59,04 €/mes (826,56 €/año, 14 pagas)');

    // Y la guía lo explica
    await abrirGuia(page);
    expect(normalizar(await page.locator('body').innerText())).toMatch(/prorrata/i);
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2542 — BAJO (dato). La FAQ del hijo que nació con vida
   * decía que al nacido sin vida «el art. 60.1 LGSS sí excluye», y `computoHijoFallecido
   * .norma` valía 'art. 60.1 LGSS'. En el texto vigente la exigencia está en el 60.3.a),
   * párrafo segundo: «únicamente se computarán los hijos o hijas que con anterioridad al
   * hecho causante de la pensión correspondiente hubieran nacido con vida o hubieran sido
   * adoptados». El 60.1 no dice «con vida» (ni lo decía la redacción de 2016).
   */
  test('REPARADO 2542 (01/10/2026): la regla del nacido con vida se cita en el art. 60.3.a)', async ({
    page,
  }) => {
    expect(COMPLEMENTO_BRECHA_GENERO_2026.computoHijoFallecido.norma).toBe('art. 60.3.a) LGSS');
    await abrirGuia(page);
    const respuesta = normalizar(
      await page.locator('h3', { hasText: 'nació con vida y falleció después' }).locator('..').innerText(),
    );
    expect(respuesta).not.toContain('art. 60.1 LGSS sí excluye');
    expect(respuesta).toContain('art. 60.3.a) LGSS sí excluye');
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2543 — BAJO (contenido). Concurrencia a favor de una
   * MUJER (jubilación, 3 hijos, el otro ya lo percibe, «La mía es menor»): el motivo
   * terminaba en «…para reconocimiento automático del complemento», y el paso siguiente
   * decía «Si ya cobras la pensión y no aparece el complemento en tu nómina…». Pero el art.
   * 60.2 exige resolución con audiencia previa al que lo venía cobrando, con efectos del mes
   * siguiente a esa resolución: no es automático y no va a aparecer solo.
   *
   * Reparación: en esa rama el motivo no dice «automático», y el paso siguiente es la
   * solicitud expresa, la extinción con audiencia y los efectos del 60.2 (`extincion
   * .efectos`, data/fiscal). Las frases son las del motor del MCP, así que la tool dice lo mismo.
   */
  test('REPARADO 2543 (01/10/2026): la concurrencia a favor de una mujer pide solicitud expresa, no es automática', async ({
    page,
    request,
  }) => {
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '3',
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La mía es menor',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+110,70 €/mes'); // 3 × 36,90, sin cambios
    expect(resultado).toContain('a quien el INSS da audiencia antes de resolver');
    expect(resultado).not.toContain('reconocimiento automático');
    expect(resultado).not.toContain('no aparece el complemento en tu nómina');
    expect(resultado).toContain('Presenta una solicitud expresa ante el INSS');
    expect(resultado).toContain('no se te reconoce de oficio');
    expect(resultado).toContain('primer día del mes siguiente al de la resolución');

    const mcp = await porMcpDelegum(request, {
      sexo: 'mujer',
      num_hijos: 3,
      tipo_pension: 'jubilacion',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'percibe',
      suma_pensiones_menor: 'propia',
    });
    expect(mcp).toContain('Presenta una solicitud expresa ante el INSS');
    expect(mcp).not.toContain('no aparece en tu nómina');
    expect(mcp).toContain('primer día del mes siguiente al de la resolución');

    // Sin concurrencia, la rama general de una mujer también pide solicitarlo. Hasta el
    // 06/10/2026 decía «Si ya cobras la pensión y no aparece el complemento en tu nómina…», que
    // daba a entender que lo normal era recibirlo sin pedirlo (hallazgo 2927).
    await responderConSiembra(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '3',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    expect(await textoResultado(page)).toContain('El complemento hay que solicitarlo ante el INSS');
    expect(await textoResultado(page)).not.toContain('reconocimiento automático');
  });

  /**
   * REPARADO (01/10/2026), hallazgo 2544 — BAJO (contenido). En el veredicto de concurrencia
   * a favor (web y MCP), la cita quedaba huérfana tras el punto: «…a quien el INSS da
   * audiencia antes de resolver. (art. 60.2 LGSS)», sin punto final. Ahora la pone
   * `conCita` (motor), antes del punto: «…antes de resolver (art. 60.2 LGSS).».
   */
  test('REPARADO 2544 (01/10/2026): «antes de resolver (art. 60.2 LGSS).», en la web y en el MCP', async ({
    page,
    request,
  }) => {
    await responderConSiembra(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: '3',
      sexo: 'Hombre',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'La mía es menor',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('antes de resolver (art. 60.2 LGSS).');
    expect(resultado).not.toContain('resolver. (art. 60.2 LGSS)');

    const mcp = await porMcpDelegum(request, {
      sexo: 'hombre',
      num_hijos: 3,
      tipo_pension: 'incapacidad_permanente',
      fecha_hecho_causante: 'desde_2021',
      otro_progenitor: 'percibe',
      suma_pensiones_menor: 'propia',
    });
    expect(mcp).toContain('antes de resolver (art. 60.2 LGSS).');
    expect(mcp).not.toContain('resolver. (art. 60.2 LGSS)');
  });
});

// Móvil (390 px) y tema oscuro sobre la rama nueva del 26/09: el veredicto condicionado.
test.describe('Re-inspección 01/10/2026 — móvil y oscuro', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /**
   * Caso X2 en 390 × 844: la P5 bis aparece y se puede pulsar, el veredicto condicionado se
   * lleva a la vista con el foco (2247), no hay desborde horizontal y sus textos pasan 4,5:1
   * en los dos temas. Medido el 01/10/2026: 16,67:1 en claro y 13,82:1 en oscuro.
   */
  test('X2 en móvil: el veredicto condicionado se ve, recibe el foco y contrasta en claro y oscuro', async ({
    page,
  }) => {
    await responderConSiembra(page, {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: '6',
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
      sumaMenor: 'No lo sé',
    });
    const importe = page.locator('[class*="resultImporte"]');
    await expect(importe).toHaveText('Depende de la suma de pensiones');
    const caja = await importe.boundingBox();
    expect(caja).not.toBeNull();
    const { y, height } = caja as { y: number; height: number };
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y + height).toBeLessThanOrEqual(844);
    expect(await page.evaluate(() => (document.activeElement?.className ?? '').toString())).toContain(
      'resultHeroCondicionado',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    await prepararMedicion(page);
    const selectores = [
      '[class*="resultHeroCondicionado"] [class*="resultImporte"]',
      '[class*="resultHeroCondicionado"] [class*="resultLabel"]',
      '#p5bis-ayuda',
    ];
    for (const sel of selectores) {
      expect.soft(await contrasteMinimo(page, sel), `${sel} claro`).toBeGreaterThanOrEqual(4.5);
    }
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.mouse.move(0, 0);
    for (const sel of selectores) {
      expect.soft(await contrasteMinimo(page, sel), `${sel} oscuro`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 06/10/2026 (Opus 5.5, xhigh)
//
// Volvió a la cola por 03e40648 (01/10: art. 60.7, exclusiones y prorrata del 60.3,
// hallazgos 2538-2544) y por d6ba391e (03/10: TOPE_COMPLEMENTO_MINIMOS_2026 y la fila de
// gran incapacidad en PENSIONES_MINIMAS_2026). El segundo no toca nada que esta app lea:
// `COMPLEMENTO_BRECHA_GENERO_2026`, `_META`, `COMPLEMENTO_MATERNIDAD_DEROGADO` y
// `LIMITES_PENSION_2025` siguen idénticos, y las cifras del navegador no se movieron.
// Las siete reparaciones del 01/10 se reprodujeron en el navegador, en 1280 y en 390 px.
//
// Fuentes oficiales consultadas en sesión (06/10/2026):
//   · Art. 60 LGSS, consolidado (BOE-A-2015-11724, versión del 18/03/2023), API de datos
//     abiertos del BOE. Ningún apartado dice que el complemento se reconozca de oficio.
//   · DT 33.ª LGSS (versión del 04/02/2021): «La percepción de dicho complemento de
//     maternidad será incompatible con el complemento de pensiones contributivas para la
//     reducción de la brecha de género que pudiera corresponder por el reconocimiento de una
//     nueva pensión pública, pudiendo las personas interesadas optar entre uno u otro.»
//   · Art. 194.1.d) LGSS (versión del 01/05/2025): «Gran incapacidad» («Se sustituyen las
//     referencias a "gran invalidez" por "gran incapacidad"», DA única de la Ley 2/2025).
//   · Trámite oficial «Solicitar un complemento por brecha de género o por maternidad»
//     (prestaciones.seg-social.es/servicio/complemento-brecha.html): «Solicita el complemento
//     económico que se puede añadir a tu pensión…», «Puedes solicitar el complemento en
//     cualquier momento desde que te hayan concedido la pensión», «Realiza este trámite si:
//     … No te han reconocido el complemento por maternidad o para la reducción de la brecha
//     de género con anterioridad», y «Si accediste a tu pensión entre el 1 de enero de 2016 y
//     el 3 de febrero de 2021, te corresponde solicitar el complemento por maternidad».
//   · Revista de la Seguridad Social, «Cómo pedir el complemento para reducir la brecha de
//     género junto a la solicitud de su pensión» (08/04/2025): «En la solicitud
//     correspondiente deberás marcar la casilla específica para la solicitud de este
//     complemento y rellenar los datos relativos a tu hijo o hijos.»
//
// Cinco casos resueltos A MANO antes de abrir el navegador (coinciden los cinco) y seis
// hallazgos ABIERTOS con `test.fail()`, uno de ellos la sospecha del 01/10 sobre el
// «reconocimiento automático», que las fuentes de arriba convierten en hallazgo.
// ═════════════════════════════════════════════════════════════════════════════

interface Respuestas06 extends Respuestas26 {
  /** P1 bis: prorrata española de la pensión, tal como se teclea («37,5»); sin ella, «No» */
  prorrata?: string;
  /** P3 bis: le alcanza una exclusión del art. 60.3.b) LGSS */
  excluido?: boolean;
}

/** Como `responderConSiembra`, pero contestando también la P1 bis y la P3 bis. */
async function responder06(page: Page, r: Respuestas06): Promise<void> {
  await elegir(page, r.pension);
  const hayP1bis = await page
    .getByRole('radio', { name: 'No, solo con cotizaciones en España', exact: true })
    .count();
  if (r.prorrata !== undefined) {
    await elegir(page, 'Sí, a prorrata (totalización internacional)');
    await sembrarValor(page, '#prorrata', r.prorrata);
  } else if (hayP1bis > 0) {
    await elegir(page, 'No, solo con cotizaciones en España');
  }
  await elegir(page, r.excluido ? 'Sí, me alcanza alguna' : 'No me alcanza ninguna');
  await responderConSiembra(page, r);
}

/** Todo el JSON-LD de la página (WebApplication + FAQPage), en una cadena. */
async function jsonLdDeLaPagina(page: Page): Promise<string> {
  return (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
}

test.describe('Re-inspección 06/10/2026', () => {
  /**
   * CASO N (NORMAL) — mujer · jubilación · desde el 4-feb-2021 · 2 hijos · sin prorrata ·
   * sin exclusión del 60.3.b · el otro progenitor no lo percibe · sin denegación propia.
   *
   *   hijosComputables = mín(2, maxHijos 4) = 2
   *   mensual = 2 × 36,90 = 73,80 €/mes          ← esperado literal
   *   anual   = 73,80 × 14 = 1033,20 €/año       ← es-ES no agrupa 4 cifras
   *
   * OBTENIDO el 06/10/2026: exactamente eso (el «reconocimiento automático» del motivo es el
   * hallazgo de más abajo; las cifras están bien).
   */
  test('caso N (06/10): mujer, jubilación y 2 hijos, sin prorrata ni exclusión → 73,80 €/mes y 1033,20 €/año', async ({
    page,
  }) => {
    await responder06(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+73,80 €/mes');
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Hijos computables 2 (máx. 4)');
    expect(resultado).toContain('Mensual estimado 73,80 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1033,20 €/año');
    expect(resultado).not.toContain('Prorrata de tu pensión');
  });

  /**
   * CASO L1 (LÍMITE) — HOMBRE que cumple el art. 60.1.b) (pensión contributiva de
   * jubilación y carrera afectada por los nacimientos). Con el texto literal del 60.1.b y con
   * la doctrina de `META.doctrina` el resultado es el mismo: tiene derecho. 5 hijos y sin
   * otro progenitor.
   *
   *   hijosComputables = mín(5, 4) = 4 (el 5.º no suma)
   *   mensual = 4 × 36,90 = 147,60 €/mes = maxMensual
   *   anual   = 147,60 × 14 = 2066,40 €/año = maxAnual
   */
  test('caso L1 (06/10, límite): hombre, jubilación y 5 hijos sin otro progenitor → 4 computables y 147,60 €/mes', async ({
    page,
  }) => {
    expect(4 * COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual).toBeCloseTo(
      COMPLEMENTO_BRECHA_GENERO_2026.maxMensual,
      2,
    );
    await responder06(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '5',
      sexo: 'Hombre',
      otroProgenitor: 'No procede (sin otro progenitor)',
    });
    const resultado = await textoResultado(page);
    expect(resultado).toContain('+147,60 €/mes');
    expect(resultado).toContain('Hijos computables 4 (máx. 4)');
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año');
    expect(resultado).not.toContain('184,50'); // 5 × 36,90, sin el tope
    expect(resultado).toContain(COMPLEMENTO_BRECHA_GENERO_META.doctrina.stjue.asunto);
  });

  /**
   * CASO L2 (LÍMITE) — la concurrencia de los dos progenitores con una pensión de VIUDEDAD
   * (las regresiones de 2239 y 2543 la recorren con jubilación e IP). Mujer, 3 hijos, el otro
   * progenitor ya lo percibe:
   *   · «La del otro progenitor es menor» → art. 60.1: no procede, 0 €, y el paso siguiente
   *     da la regla del 60.7 (importe inicial revalorizado, sin complementos).
   *   · «La mía es menor» → procede: 3 × 36,90 = 110,70 €/mes; 110,70 × 14 = 1549,80 €/año,
   *     con solicitud expresa y la extinción del 60.2 (cita antes del punto, 2544).
   *   · «No lo sé» → condicionado con los mismos 110,70 €/mes y el desempate del 60.7.
   */
  test('caso L2 (06/10, límite): viudedad y 3 hijos con el otro progenitor cobrándolo — decide la suma (60.1, 60.2 y 60.7)', async ({
    page,
  }) => {
    const base = {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: '3',
      sexo: 'Mujer',
      otroProgenitor: 'Ya lo percibe por los mismos hijos',
    };
    await responder06(page, { ...base, sumaMenor: 'La del otro progenitor es menor' });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).not.toContain('110,70');
    expect(resultado).toContain('sin computar ningún complemento');
    expect(resultado).toContain('(art. 60.7 LGSS)');

    await responder06(page, { ...base, sumaMenor: 'La mía es menor' });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+110,70 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 1549,80 €/año');
    expect(resultado).toContain('Te corresponde a ti: se extingue el del otro progenitor');
    expect(resultado).toContain('no se te reconoce de oficio');
    expect(resultado).toContain('antes de resolver (art. 60.2 LGSS).');

    await responder06(page, { ...base, sumaMenor: 'No lo sé' });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Depende de la suma de pensiones');
    expect(resultado).toContain('te corresponde: +110,70 €/mes');
    expect(resultado).toContain(
      COMPLEMENTO_BRECHA_GENERO_2026.concurrencia.entreProgenitores.comparacion.desempate.detalle,
    );
  });

  /**
   * CASO L3 (LÍMITE) — prorrata del art. 60.3.f) con COMA decimal y en los bordes.
   * Hombre · incapacidad permanente · 4 hijos:
   *   · «37,5»  → 4 × 36,90 × 0,375 = 55,35 €/mes; 55,35 × 14 = 774,90 €/año
   *   · «100»   → el íntegro: 147,60 €/mes (100 entra: «no mayor que 100»)
   *   · «100,5» → fuera de (0, 100]: «Sin calcular», sin ninguna cifra
   * La tool del MCP da lo mismo para 37,5.
   */
  test('caso L3 (06/10, límite): prorrata «37,5» → 55,35 €/mes y 774,90 €/año; «100» da el íntegro y «100,5» no calcula', async ({
    page,
    request,
  }) => {
    expect(4 * COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual * 0.375).toBeCloseTo(55.35, 2);
    expect(55.35 * COMPLEMENTO_BRECHA_GENERO_2026.pagasAnuales).toBeCloseTo(774.9, 2);
    const base = {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: '4',
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    };

    await responder06(page, { ...base, prorrata: '37,5' });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('+55,35 €/mes');
    // `textoResultado` ya normaliza el espacio duro del % a espacio normal
    expect(resultado).toContain('Prorrata de tu pensión (art. 60.3.f) LGSS) 37,50 %');
    expect(resultado).toContain('Anual (14 pagas) 774,90 €/año');
    expect(resultado).not.toContain('147,60');

    await responder06(page, { ...base, prorrata: '100' });
    resultado = await textoResultado(page);
    expect(resultado).toContain('+147,60 €/mes');
    expect(resultado).toContain('Anual (14 pagas) 2066,40 €/año');

    await responder06(page, { ...base, prorrata: '100,5' });
    resultado = await textoResultado(page);
    expect(resultado).toContain('Sin calcular');
    expect(resultado).not.toContain('147,60');
    expect(resultado).not.toContain('Desglose');

    const mcp = await porMcpDelegum(request, {
      sexo: 'hombre',
      num_hijos: 4,
      tipo_pension: 'incapacidad_permanente',
      fecha_hecho_causante: 'desde_2021',
      prorrata_porcentaje: 37.5,
    });
    expect(mcp).toContain('55,35 €/mes (774,90 €/año, 14 pagas)');
  });

  /**
   * CASO R (RECHAZO) — jubilación causada ANTES del 4-feb-2021, 3 hijos: el complemento de
   * brecha no procede (RDL 3/2021), no hay cifra, y el paso siguiente cita la doctrina WA
   * desde `COMPLEMENTO_MATERNIDAD_DEROGADO.doctrinaAcceso`. Y 0 hijos: no procede, sin cifra.
   */
  test('caso R (06/10, rechazo): jubilación anterior al 4-feb-2021 con 3 hijos, y 0 hijos → «No procede ahora» sin cifra', async ({
    page,
  }) => {
    await responder06(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Antes del 4-feb-2021',
      hijos: '3',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    let resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).not.toContain('110,70');
    expect(resultado).not.toContain('Desglose');
    expect(resultado).toContain(COMPLEMENTO_MATERNIDAD_DEROGADO.doctrinaAcceso);

    await responder06(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '0',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    resultado = await textoResultado(page);
    expect(resultado).toContain('No procede ahora');
    expect(resultado).toContain('al menos un hijo o hija');
    expect(resultado).not.toContain('€/mes');
  });

  /**
   * ABIERTO (06/10/2026) — MEDIO (contenido). Cierra la sospecha del 01/10 sobre el
   * «reconocimiento automático». Ni el art. 60 LGSS ni la Seguridad Social dicen que el
   * complemento se reconozca de oficio: el trámite oficial es «Solicitar un complemento por
   * brecha de género o por maternidad» («Puedes solicitar el complemento en cualquier momento
   * desde que te hayan concedido la pensión») y la Revista de la SS (08/04/2025) indica que
   * en la solicitud de la pensión «deberás marcar la casilla específica para la solicitud de
   * este complemento». Aun así, la página dice:
   *   · veredicto de la rama general de una mujer: «…para reconocimiento automático del
   *     complemento»;
   *   · FAQ: «En muchos casos el INSS lo reconoce automáticamente al resolver la pensión»;
   *   · caso típico: «El INSS suele reconocerlo de oficio o con solicitud expresa»;
   *   · FAQPage: «el complemento se añade de oficio en muchos casos».
   * (Y «Errores frecuentes» dice lo contrario: «No siempre es así».)
   */
  // REPARADO el 06/10/2026 (hallazgo 2927): veredicto, caso típico, FAQ, «Errores frecuentes» y
  // FAQPage dicen que se solicita, con el nombre del trámite de la SS.
  test('ni el veredicto ni la guía ni el FAQPage dicen que se reconozca de oficio', async ({
    page,
  }) => {
    await responder06(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    expect(await textoResultado(page)).not.toContain('reconocimiento automático');
    await abrirGuia(page);
    const cuerpo = normalizar(await page.locator('body').innerText());
    expect(cuerpo).not.toContain('lo reconoce automáticamente');
    expect(cuerpo).not.toContain('suele reconocerlo de oficio');
    expect(await jsonLdDeLaPagina(page)).not.toContain('se añade de oficio');
    expect(cuerpo).toContain('Solicitar un complemento por brecha de género o por maternidad');
  });

  /**
   * ABIERTO (06/10/2026) — MEDIO (contenido). DT 33.ª LGSS, párrafo segundo: quien cobra el
   * complemento de MATERNIDAD (pensión causada antes del 4-feb-2021) y causa después una
   * pensión nueva no suma los dos: son incompatibles y se opta por uno. La SS lo pone como
   * condición del trámite («No te han reconocido el complemento por maternidad … con
   * anterioridad»). La app no lo pregunta ni lo avisa en ningún sitio: a una mujer jubilada
   * en 2019 con el complemento de maternidad que enviuda en 2023 (viudedad desde el
   * 4-feb-2021, 2 hijos) le da «+73,80 €/mes · Cumples los requisitos básicos», y la guía solo
   * cita la DT 33.ª para decir que el de maternidad «se conserva». El módulo
   * `COMPLEMENTO_MATERNIDAD_DEROGADO` tampoco recoge la incompatibilidad.
   * El test pide que la página lo diga (incompatibilidad + opción), sin fijar cómo.
   */
  // REPARADO el 06/10/2026 (hallazgo 2928): el paso siguiente de la rama general, la nota de la
  // tabla comparativa y el FAQPage avisan de la incompatibilidad y de la opción.
  test('la DT 33.ª — el complemento de maternidad previo es incompatible y se opta', async ({
    page,
  }) => {
    await responder06(page, {
      pension: 'Viudedad',
      fecha: 'El 4-feb-2021 o después',
      hijos: '2',
      sexo: 'Mujer',
      otroProgenitor: 'No procede (sin otro progenitor)',
    });
    expect(await textoResultado(page)).toContain('+73,80 €/mes');
    // En el propio resultado, que es donde lo lee quien acaba de cumplir los requisitos
    expect(await textoResultado(page)).toMatch(/complemento de maternidad[^.]{0,80}incompatible/);
    await abrirGuia(page);
    const cuerpo = normalizar(await page.locator('body').innerText());
    expect(cuerpo).toMatch(/maternidad[^.]{0,250}incompatib|incompatib[^.]{0,250}maternidad/i);
    expect(cuerpo).toMatch(/optar|elegir entre/i);
    expect(await jsonLdDeLaPagina(page)).toMatch(/incompatibles y hay que optar/);
  });

  /**
   * ABIERTO (06/10/2026) — BAJO (contenido). Pensión causada antes del 4-feb-2021 y sin el
   * complemento de maternidad: el paso siguiente solo habla de quien «percibía» o «se le
   * denegó» el antiguo complemento. La SS (trámite oficial) dice que si la pensión se causó
   * entre el 1 de enero de 2016 y el 3 de febrero de 2021 «te corresponde solicitar el
   * complemento por maternidad» (con al menos 2 hijos y sin haberlo tenido reconocido), y que
   * se puede pedir «en cualquier momento desde que te hayan concedido la pensión».
   */
  test('ABIERTO (06/10): pensión anterior al 4-feb-2021 — el paso siguiente no dice que el de maternidad se puede solicitar', async ({
    page,
  }) => {
    test.fail();
    await responder06(page, {
      pension: 'Jubilación (ordinaria o anticipada)',
      fecha: 'Antes del 4-feb-2021',
      hijos: '3',
      sexo: 'Mujer',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
    });
    expect(await textoResultado(page)).toMatch(/solicit\w*[^.]{0,80}complemento (de|por) maternidad/i);
  });

  /**
   * ABIERTO (06/10/2026) — BAJO (contenido). El FAQPage dice «incapacidad permanente (total,
   * absoluta o gran invalidez)». La LGSS dice «gran incapacidad» desde el 01/05/2025 (art.
   * 194.1.d, DA única de la Ley 2/2025), y data/fiscal ya lo cambió el 03/10 (d6ba391e).
   */
  // REPARADO el 06/10/2026 (hallazgo 2930).
  test('el FAQPage nombra la «gran incapacidad», no la «gran invalidez»', async ({ page }) => {
    const ld = await jsonLdDeLaPagina(page);
    expect(ld).not.toContain('gran invalidez');
    expect(ld).toContain('gran incapacidad');
  });

  /**
   * ABIERTO (06/10/2026) — BAJO (dato). La «fuente oficial» del sello del complemento
   * (`COMPLEMENTO_BRECHA_GENERO_META.urlOficial`) lleva a una página de seg-social.es que
   * responde 200 pero muestra «No se ha encontrado contenido para:
   * poin_contenidos/internet/4986/Jubilacion/10963» (medido con curl y con Chromium el
   * 06/10/2026). El trámite vigente está en prestaciones.seg-social.es. Testigo
   * determinista: que el sello deje de apuntar a la URL muerta (una comprobación por red
   * en el spec sería frágil).
   */
  // REPARADO el 06/10/2026 (hallazgo 2931): el sello apunta al trámite vigente de
  // prestaciones.seg-social.es, leído en Chromium ese día («Requisitos relacionados con el
  // complemento por brecha de género», «Puedes solicitar el complemento en cualquier momento…»).
  test('el sello del complemento no enlaza a una página sin contenido', async ({ page }) => {
    const MUERTA = 'https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Jubilacion/10963';
    await expect(page.locator(`a[href="${COMPLEMENTO_BRECHA_GENERO_META.urlOficial}"]`).first()).toBeAttached();
    expect(COMPLEMENTO_BRECHA_GENERO_META.urlOficial).not.toBe(MUERTA);
  });

  /**
   * ABIERTO (06/10/2026) — BAJO (contenido). El gemelo de la app, la tool
   * `calcular_complemento_brecha_genero` del MCP Delegum, cierra con AVISO_LABORAL: «Cálculo
   * basado en el Estatuto de los Trabajadores y normativa laboral 2025 … ni la consulta al
   * SEPE». El cálculo sale del art. 60 LGSS con la cuantía de 2026 y lo gestiona el INSS.
   */
  test('ABIERTO (06/10): la tool del MCP no se ampara en el Estatuto de los Trabajadores ni en la normativa de 2025', async ({
    request,
  }) => {
    test.fail();
    const mcp = await porMcpDelegum(request, {
      sexo: 'mujer',
      num_hijos: 2,
      tipo_pension: 'viudedad',
      fecha_hecho_causante: 'desde_2021',
    });
    expect(mcp).toContain('73,80 €/mes (1033,20 €/año, 14 pagas)');
    expect(mcp).not.toContain('Estatuto de los Trabajadores');
    expect(mcp).not.toContain('normativa laboral 2025');
  });
});

// Móvil (390 px): la rama de la prorrata con coma decimal, que ningún test recorría en móvil.
test.describe('Re-inspección 06/10/2026 — móvil', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** L3 en 390 × 844: 55,35 €/mes, el veredicto a la vista y con el foco, sin desborde. */
  test('L3 en móvil: la prorrata «37,5» da 55,35 €/mes y el veredicto se ve y recibe el foco', async ({ page }) => {
    await responder06(page, {
      pension: 'Incapacidad permanente',
      fecha: 'El 4-feb-2021 o después',
      hijos: '4',
      sexo: 'Hombre',
      otroProgenitor: 'No lo percibe ni lo ha solicitado',
      prorrata: '37,5',
    });
    const importe = page.locator('[class*="resultImporte"]');
    // formatCurrency separa la cifra del € con espacio duro: \s lo casa
    await expect(importe).toHaveText(/^\+55,35\s€\/mes$/);
    const caja = await importe.boundingBox();
    expect(caja).not.toBeNull();
    const { y, height } = caja as { y: number; height: number };
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y + height).toBeLessThanOrEqual(844);
    expect(await page.evaluate(() => (document.activeElement?.className ?? '').toString())).toContain(
      'resultHeroPositivo',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

import { test, expect, devices, Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Estimador de Complemento a Mínimos — regresión del DATO y de las TRES piezas del cálculo.
 *
 * QUÉ PROMETE (leído el 21/09/2026)
 *   · <h1>: «Estimador de Complemento a Mínimos».
 *   · Subtítulo: «Comprueba si tu pensión puede completarse hasta el mínimo garantizado por
 *     la Seguridad Social (2026)».
 *   · <title> y openGraph: «Estimador de Complemento a Mínimos 2026 — Pensión mínima
 *     garantizada».
 *   · En pantalla: <RegionBadge variant="es-only" />, <LegalNotice />, <DisclaimerCard
 *     variant="financial" severity="critical"> (nivel 1, NO colapsable) y <DataReference>
 *     con el sello de FISCAL_PENSIONES_META.
 *
 * DE DÓNDE SALE EL DATO — de `data/fiscal/pensiones.ts`, no de la app:
 *   · `PENSIONES_MINIMAS_2026` — Anexo I del RD 241/2026, de 25 de marzo (BOE-A-2026-6977),
 *     en €/mes sobre 14 pagas. TRES columnas por fila, que son las que este test separa:
 *     `conConyuge` (cónyuge a cargo), `sinConyuge` (cónyuge NO a cargo) y `unipersonal`.
 *   · `COMPLEMENTO_MINIMOS_LIMITES_2026` — arts. 9.2 y 10.1.b) del mismo RD:
 *     sinConyuge = 9.442 €/año · conConyuge = 11.013 €/año.
 *   · `FISCAL_PENSIONES_META.verificado` = '2026-09-21' → la app debe imprimir 21/09/2026.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 — NORMAL (pensión baja con derecho a complemento)
 *       Jubilación ≥ 65 · «Con cónyuge a cargo» · pensión 750,00 €/mes · otros ingresos 3.000 €/año.
 *       Mínimo = PENSIONES_MINIMAS_2026[jubilacion/65_o_mas].conConyuge = 1.256,60 €/mes.
 *       Límite = COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge = 11.013 €/año; 3.000 ≤ 11.013 → hay derecho.
 *       Complemento = 1.256,60 − 750,00 = 506,60 €/mes · pensión final = 1.256,60 €/mes.
 *       Impacto anual (14 pagas) = 506,60 × 14 = 7.092,40 €/año.
 *       Discrimina la columna: con `unipersonal` (936,20) saldrían 186,20 y con `sinConyuge`
 *       (888,70) saldrían 138,70. Son 320-368 €/mes de diferencia, de ahí que baste
 *       `toBeCloseTo(..., 2)`: la app imprime céntimos y el defecto vigilado son centenas.
 *
 *   CASO 2 — EL LÍMITE DE INGRESOS (el umbral, por sus dos lados)
 *       Viudedad 60-64 · pensión 600,00 €/mes · el límite aplicable es el de sin cónyuge a
 *       cargo, 9.442 €/año, porque en viudedad la app no ofrece siquiera el selector.
 *       Mínimo = MINIMOS_VIUDEDAD_2026.entre60y64 = 12.262,60 / 14 = 875,90 €/mes.
 *       · Ingresos 9.442 € (JUSTO en el límite, no lo supera) → complemento 875,90 − 600,00
 *         = 275,90 €/mes. Negárselo aquí sería negarlo a quien sí le corresponde.
 *       · Ingresos 9.443 € (un euro por encima) → ya no se debe el complemento ÍNTEGRO,
 *         pero tampoco cero: el art. 9.2 del RD 241/2026 reconoce la diferencia entre
 *         (rentas + pensión) y (límite + mínima anual):
 *             (9.442 + 12.262,60) − (9.443 + 8.400) = 3.861,60 €/año = 275,83 €/mes.
 *         Hasta el 21/09/2026 la app cortaba a cero de golpe (hallazgo 1103): un euro de
 *         renta costaba 3.862,60 €/año. El complemento llega a cero de verdad en
 *         13.304,60 € de rentas, que es 9.442 + lo que faltaba para el mínimo.
 *
 *   CASO 3 — SIN COMPLEMENTO (la pensión ya supera el mínimo)
 *       Jubilación ≥ 65 · «Cónyuge NO a cargo» · pensión 900,00 €/mes · otros ingresos 0.
 *       Mínimo = PENSIONES_MINIMAS_2026[jubilacion/65_o_mas].sinConyuge = 888,70 €/mes.
 *       900,00 > 888,70 → complemento 0,00 €/mes, sin negativos, y la app debe decir que la
 *       pensión ya iguala o supera el mínimo.
 *       Es el caso que separa la columna del medio de la de la derecha: si la app leyera
 *       `unipersonal` (936,20) devolvería 36,20 €/mes a quien no le corresponden.
 *
 * ⚠️ `formatCurrency` (es-ES) separa el millar SOLO a partir de cinco dígitos enteros, así
 *    que imprime «1256,60 €» y «9442,00 €» sin punto, pero «17.592,40 €» con él. Y el espacio
 *    antes del € es U+00A0: el texto se normaliza antes de comparar.
 *
 * ── RE-INSPECCIÓN DEL 03/10/2026 ────────────────────────────────────────────────────────
 * Los 8 hallazgos del 21/09 (1101-1108) siguen REPARADOS: los casos 2, 4 y 5 los vigilan, y el
 * 1101 (914e13f5) se ha comprobado además en sentido contrario (CASO 10). Los cambios de
 * `data/fiscal/pensiones.ts` desde entonces (546c3b11, a7be5add, 9bbc5c19, 30cd3e24 y
 * 03e40648) solo movieron el sello `verificado` de FISCAL_PENSIONES_META (12/08 → 21/09):
 * PENSIONES_MINIMAS_2026 y COMPLEMENTO_MINIMOS_LIMITES_2026 casan fila a fila, ÷ 14, con el
 * Anexo I del RD 241/2026 (BOE-A-2026-6977), cotejado contra el texto del BOE ese día.
 *
 * Fuentes nuevas de esta vuelta, todas del mismo RD o de la LGSS que cita el módulo:
 *   · art. 9.3: el requisito se cumple con rentas «igual o inferior» a 9.442 €.
 *   · art. 9.5 (y art. 59.4 LGSS): en pensiones causadas desde el 01/01/2013 el complemento
 *     NO puede superar la pensión no contributiva del año; art. 21.1: 8.803,20 €/año, que en
 *     14 pagas son 628,80 €/mes. Exentos (art. 9.7) los de gran incapacidad con el complemento
 *     de la persona que les atiende.
 *   · art. 10.4 (y 59.4 LGSS): con cónyuge a cargo el tope es la PNC de una unidad con dos
 *     beneficiarios del art. 364.1.a) LGSS: 8.803,20 + 70 % = 14.965,44 €/año = 1.068,96 €/mes.
 *   · art. 9.2: computan los rendimientos del TRABAJO (distintos de la propia pensión), del
 *     capital, de actividades económicas y las ganancias patrimoniales.
 * Lo que la app aún no hace va en `test.fail()` con «ABIERTO, hallazgo (inspector 03/10/2026)».
 */

const RUTA = '/estimador-complemento-minimos/';
const ENTRADAS = ['#pensionActual', '#ingresosAnuales'];

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, ENTRADAS);
}

/** El panel de resultados, acotado a su tarjeta (no vale `getByRole('alert')`: en esta
 *  página ese rol lo tiene el DisclaimerCard, y además casa con el anunciador de Next). */
function panelResultado(page: Page) {
  return page.getByRole('heading', { level: 2, name: 'Resultado', exact: true }).locator('xpath=..');
}

async function textoResultado(page: Page): Promise<string> {
  return (await panelResultado(page).innerText()).replace(/ /g, ' ');
}

/** Euros de una línea del desglose, del tipo «Complemento a mínimos\n+506,60 €/mes». */
function importe(texto: string, etiqueta: string): number {
  const patron = new RegExp(`${etiqueta}\\s*\\+?(-?[\\d.]+),(\\d{2}) €/mes`);
  const encontrado = texto.match(patron);
  if (!encontrado) throw new Error(`No aparece «${etiqueta}» en el resultado:\n${texto}`);
  const entero = Number(encontrado[1].replace(/\./g, ''));
  const centimos = Number(encontrado[2]) / 100;
  return entero < 0 ? entero - centimos : entero + centimos;
}

async function estimar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Estimar complemento' }).click();
  await expect(panelResultado(page)).toContainText('Desglose');
}

test.describe('Estimador de Complemento a Mínimos', () => {
  test('CASO 1 — jubilación ≥ 65 con cónyuge a cargo: complementa hasta 1.256,60 €', async ({ page }) => {
    await abrir(page);

    // La situación por defecto es «Sin cónyuge»: este clic CAMBIA el estado de verdad.
    await page.getByRole('button', { name: 'Con cónyuge a cargo', exact: true }).click();
    await sembrarValor(page, '#pensionActual', '750');
    await sembrarValor(page, '#ingresosAnuales', '3000');
    await estimar(page);

    const texto = await textoResultado(page);

    // PENSIONES_MINIMAS_2026 → jubilacion/65_o_mas.conConyuge (Anexo I RD 241/2026: 17.592,40 €/año ÷ 14)
    expect(importe(texto, 'Pensión mínima garantizada')).toBeCloseTo(1256.6, 2);
    // 1.256,60 − 750,00, nunca negativo
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(506.6, 2);
    expect(importe(texto, 'Pensión final estimada')).toBeCloseTo(1256.6, 2);
    expect(texto).toContain('+506,60 €/mes');
    // 506,60 × 14 pagas
    expect(texto).toContain('7092,40 €/año');
    // COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge (art. 10.1.b RD 241/2026)
    expect(texto).toContain('11.013,00 €/año (con cónyuge a cargo)');
  });

  test('CASO 2 — viudedad 60-64 en el umbral de ingresos: 9.442 € sí, 9.443 € ya no íntegro', async ({ page }) => {
    await abrir(page);

    await page.getByRole('button', { name: /Viudedad/ }).click();
    await page.selectOption('#subtipo', '60_a_64');
    await sembrarValor(page, '#pensionActual', '600');
    // Justo EN el límite: 9.442 no supera 9.442, así que el complemento se debe íntegro.
    await sembrarValor(page, '#ingresosAnuales', '9442');
    await estimar(page);

    const dentro = await textoResultado(page);
    // MINIMOS_VIUDEDAD_2026.entre60y64 = 12.262,60 €/año ÷ 14 pagas
    expect(importe(dentro, 'Pensión mínima garantizada')).toBeCloseTo(875.9, 2);
    // 875,90 − 600,00
    expect(importe(dentro, 'Complemento a mínimos')).toBeCloseTo(275.9, 2);
    // COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge (art. 9.2 RD 241/2026)
    expect(dentro).toContain('9442,00 €/año (sin cónyuge a cargo)');

    // Un euro por encima del límite.
    await sembrarValor(page, '#ingresosAnuales', '9443');
    await estimar(page);

    const fuera = await textoResultado(page);
    expect(fuera).toContain('9442,00 €');
    // El mínimo aplicable no cambia por los ingresos: sigue siendo el de su clase de pensión.
    expect(importe(fuera, 'Pensión mínima garantizada')).toBeCloseTo(875.9, 2);
    // Hallazgo 1103 · regla diferencial del art. 9.2 RD 241/2026, no un acantilado:
    // (9.442 + 12.262,60) − (9.443 + 8.400) = 3.861,60 €/año ÷ 14 = 275,83 €/mes.
    expect(importe(fuera, 'Complemento a mínimos')).toBeCloseTo(275.83, 2);
    expect(fuera).toContain('art. 9.2');

    // Y llega a cero donde tiene que llegar: 9.442 + 3.862,60 = 13.304,60 € de rentas.
    await sembrarValor(page, '#ingresosAnuales', '13305');
    await estimar(page);
    const agotado = await textoResultado(page);
    expect(importe(agotado, 'Complemento a mínimos')).toBeCloseTo(0, 2);
    expect(agotado).toContain('Sin complemento');
  });

  test('CASO 4 — hallazgo 1101: el límite no puede venir de un selector que ya no está en pantalla', async ({ page }) => {
    await abrir(page);

    // Se pulsa «Con cónyuge a cargo» y DESPUÉS se cambia a Viudedad, donde ese selector
    // desaparece. El estado seguía vivo y arrastraba el límite de 11.013 € a una pensión
    // que no admite cónyuge a cargo.
    await page.getByRole('button', { name: 'Con cónyuge a cargo', exact: true }).click();
    await page.getByRole('button', { name: /Viudedad/ }).click();
    await page.selectOption('#subtipo', '60_a_64');
    await sembrarValor(page, '#pensionActual', '600');
    await sembrarValor(page, '#ingresosAnuales', '10500');
    await estimar(page);

    const texto = await textoResultado(page);
    // El límite que se aplica es el de SIN cónyuge a cargo, y el rótulo lo dice.
    expect(texto).toContain('9442,00 €/año (sin cónyuge a cargo)');
    expect(texto).not.toContain('(con cónyuge a cargo)');
    // Con el límite correcto: (9.442 + 12.262,60) − (10.500 + 8.400) = 2.804,60 €/año.
    // Con el de 11.013 € las rentas no lo superaban y salía el íntegro, 275,90 €/mes.
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(200.33, 2);
  });

  test('CASO 5 — hallazgos 1105-1107: sin datos no hay cifra, y la basura no pasa por número', async ({ page }) => {
    await abrir(page);

    // Formulario VACÍO: antes devolvía en verde el mínimo íntegro, porque `parseFloat('')`
    // caía en `|| 0` y una pensión no introducida se trataba como una pensión de 0 €.
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Introduce tu pensión' })).toHaveCount(1);
    await expect(panelResultado(page)).not.toContainText('Desglose');
    await expect(panelResultado(page)).not.toContainText('+936,20');

    // Con pensión pero sin ingresos: el dato que decide la elegibilidad tampoco se supone.
    await sembrarValor(page, '#pensionActual', '750');
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'otros ingresos anuales' })).toHaveCount(1);
    await expect(panelResultado(page)).not.toContainText('Desglose');

    // «1100abc» entraba como 1.100 €: `parseSpanishNumber` devuelve NaN y ya no se tapa.
    await sembrarValor(page, '#pensionActual', '1100abc');
    await sembrarValor(page, '#ingresosAnuales', '0');
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Introduce tu pensión' })).toHaveCount(1);

    // Y una pensión negativa producía un complemento MAYOR que el propio mínimo.
    await sembrarValor(page, '#pensionActual', '-500');
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'no puede ser negativa' })).toHaveCount(1);
    await expect(panelResultado(page)).not.toContainText('+1436,20');
  });

  test('CASO 3 — jubilación ≥ 65 con cónyuge NO a cargo y pensión de 900 €: sin complemento', async ({ page }) => {
    await abrir(page);

    await page.getByRole('button', { name: 'Cónyuge NO a cargo', exact: true }).click();
    await sembrarValor(page, '#pensionActual', '900');
    await sembrarValor(page, '#ingresosAnuales', '0');
    await estimar(page);

    const texto = await textoResultado(page);

    // PENSIONES_MINIMAS_2026 → jubilacion/65_o_mas.sinConyuge = 888,70 €/mes.
    // Si la app leyera la columna `unipersonal` (936,20) saldrían 36,20 €/mes de complemento.
    expect(importe(texto, 'Pensión mínima garantizada')).toBeCloseTo(888.7, 2);
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(0, 2);
    expect(importe(texto, 'Pensión final estimada')).toBeCloseTo(900, 2);
    expect(texto).toContain('Sin complemento');
    expect(texto).toContain('ya iguala o supera el mínimo garantizado');
    expect(texto).not.toContain('+36,20');
  });

  test('las tres piezas obligatorias de una app fiscal de riesgo 1', async ({ page }) => {
    await abrir(page);

    // DisclaimerCard nivel 1 CRÍTICO: role="alert" y NUNCA colapsable.
    const disclaimer = page.locator('[class*="severity-critical"]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toHaveAttribute('role', 'alert');
    await expect(disclaimer).toContainText('no constituye asesoramiento');
    expect(await disclaimer.locator('details, summary, button').count()).toBe(0);

    // LegalNotice.
    await expect(page.getByRole('link', { name: 'Política de Privacidad' }).first()).toBeVisible();

    // DataReference con el sello de FISCAL_PENSIONES_META ('2026-09-21' → 21/09/2026; hasta
    // el 21/09 era '2026-08-12').
    const dataRef = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(dataRef).toContainText('RD 241/2026');
    await expect(dataRef).toContainText('21/09/2026');

    // El año que anuncia la app es el del módulo que usa.
    await expect(page.locator('h1')).toHaveText('Estimador de Complemento a Mínimos');
    await expect(page.locator('body')).toContainText('Seguridad Social (2026)');
    // b7ec248c (01/10/2026): el año del <title> sale de FISCAL_PENSIONES_META.vigencia ('2026').
    await expect(page).toHaveTitle(/^Estimador de Complemento a Mínimos 2026 — /);

    // Hallazgo 1108 · el resultado aparece en una región en vivo: antes el panel se
    // sustituía en silencio y un lector de pantalla no se enteraba de que había resultado.
    await expect(panelResultado(page)).toHaveAttribute('aria-live', 'polite');
    // …y los dos grupos de botones son fieldset/legend, no un <label> huérfano.
    await expect(page.getByRole('group', { name: 'Tipo de pensión' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Situación familiar' })).toBeVisible();

    // Hallazgo 1104 · el umbral de «cónyuge a cargo» es el del art. 10.1.b) del RD
    // 241/2026 (11.013 €), no los 8.614 € que el propio módulo declara erróneos.
    await expect(page.locator('body')).toContainText('11.013,00 €');
    await expect(page.locator('body')).not.toContainText('8.614');
  });

  // ── Re-inspección del 03/10/2026 ─────────────────────────────────────────────────────

  test('CASO 6 — jubilación ≥ 65 sin cónyuge, rentas bajo el límite: complemento íntegro y cifras anuales', async ({ page }) => {
    await abrir(page);

    // «Sin cónyuge» es la opción por defecto: no se pulsa nada. Pensión 700 · rentas 2.000.
    await sembrarValor(page, '#pensionActual', '700');
    await sembrarValor(page, '#ingresosAnuales', '2000');
    await estimar(page);

    const texto = await textoResultado(page);
    // Anexo I RD 241/2026, jubilación con 65 años, unipersonal: 13.106,80 €/año ÷ 14 = 936,20.
    expect(importe(texto, 'Pensión mínima garantizada')).toBeCloseTo(936.2, 2);
    // 2.000 ≤ 9.442 (art. 9.3) → íntegro: 936,20 − 700,00 = 236,20 €/mes. Por debajo del tope
    // de la PNC (628,80 €/mes), así que aquí el art. 9.5 no muerde.
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(236.2, 2);
    expect(importe(texto, 'Pensión final estimada')).toBeCloseTo(936.2, 2);
    // 236,20 × 14 = 3.306,80 €/año · 936,20 × 14 = 13.106,80 €/año (la cifra literal del Anexo).
    expect(texto).toContain('Complemento: 3306,80 €/año');
    expect(texto).toContain('Pensión total: 13.106,80 €/año');
    expect(texto).toContain('9442,00 €/año (sin cónyuge a cargo)');
  });

  test('CASO 7 — con cónyuge a cargo en su umbral: 11.013 € íntegro, 11.014 € por la diferencia del art. 10.1.b', async ({ page }) => {
    await abrir(page);

    await page.selectOption('#subtipo', 'menos_65');
    await page.getByRole('button', { name: 'Con cónyuge a cargo', exact: true }).click();
    await sembrarValor(page, '#pensionActual', '1000');
    await sembrarValor(page, '#ingresosAnuales', '11013');
    await estimar(page);

    const enElLimite = await textoResultado(page);
    // Anexo I, jubilación menor de 65 con cónyuge a cargo: 17.592,40 ÷ 14 = 1.256,60 €/mes.
    expect(importe(enElLimite, 'Pensión mínima garantizada')).toBeCloseTo(1256.6, 2);
    // En 11.013 exactos la diferencia del art. 10.1.b coincide con el íntegro:
    // (11.013 + 17.592,40) − (11.013 + 14.000) = 3.592,40 €/año = 256,60 €/mes.
    expect(importe(enElLimite, 'Complemento a mínimos')).toBeCloseTo(256.6, 2);
    expect(enElLimite).toContain('11.013,00 €/año (con cónyuge a cargo)');

    await sembrarValor(page, '#ingresosAnuales', '11014');
    await estimar(page);
    const unEuroMas = await textoResultado(page);
    // (11.013 + 17.592,40) − (11.014 + 14.000) = 3.591,40 €/año ÷ 14 = 256,5286 → 256,53 €/mes.
    expect(importe(unEuroMas, 'Complemento a mínimos')).toBeCloseTo(256.53, 2);
    expect(unEuroMas).toContain('Complemento: 3591,40 €/año');
  });

  test('CASO 8 — menor de 65 sin cónyuge en el umbral de 9.442 €, y la columna «NO a cargo» de la incapacidad total < 60', async ({ page }) => {
    await abrir(page);

    await page.selectOption('#subtipo', 'menos_65');
    await sembrarValor(page, '#pensionActual', '800');
    await sembrarValor(page, '#ingresosAnuales', '9442');
    await estimar(page);
    const dentro = await textoResultado(page);
    // Anexo I, jubilación menor de 65, unipersonal: 12.262,60 ÷ 14 = 875,90 → 875,90 − 800 = 75,90.
    expect(importe(dentro, 'Pensión mínima garantizada')).toBeCloseTo(875.9, 2);
    expect(importe(dentro, 'Complemento a mínimos')).toBeCloseTo(75.9, 2);

    await sembrarValor(page, '#ingresosAnuales', '9443');
    await estimar(page);
    const fuera = await textoResultado(page);
    // (9.442 + 12.262,60) − (9.443 + 11.200) = 1.061,60 €/año ÷ 14 = 75,8286 → 75,83 €/mes.
    expect(importe(fuera, 'Complemento a mínimos')).toBeCloseTo(75.83, 2);

    // La fila más rara del Anexo: incapacidad total < 60 por enfermedad común, cónyuge NO a
    // cargo = 9.580,20 €/año ÷ 14 = 684,30 (las otras dos columnas valen 690,20).
    await page.getByRole('button', { name: /Incapacidad permanente/ }).click();
    await page.selectOption('#subtipo', 'total_menos_60');
    await page.getByRole('button', { name: 'Cónyuge NO a cargo', exact: true }).click();
    await sembrarValor(page, '#pensionActual', '500');
    await sembrarValor(page, '#ingresosAnuales', '0');
    await estimar(page);
    const incapacidad = await textoResultado(page);
    expect(importe(incapacidad, 'Pensión mínima garantizada')).toBeCloseTo(684.3, 2);
    expect(importe(incapacidad, 'Complemento a mínimos')).toBeCloseTo(184.3, 2);
  });

  test('CASO 9 — más entradas que deben rechazarse: letras, un guion, notación científica, rentas negativas', async ({ page }) => {
    await abrir(page);
    const aviso = (texto: string) => page.locator('[class*="avisoError"]').filter({ hasText: texto });

    await sembrarValor(page, '#ingresosAnuales', '0');
    for (const basura of ['abc', '-', '1e3']) {
      await sembrarValor(page, '#pensionActual', basura);
      await page.getByRole('button', { name: 'Estimar complemento' }).click();
      await expect(aviso('Introduce tu pensión')).toHaveCount(1);
      await expect(panelResultado(page)).not.toContainText('Desglose');
    }

    await sembrarValor(page, '#pensionActual', '700');
    await sembrarValor(page, '#ingresosAnuales', '-1');
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(aviso('no pueden ser negativos')).toHaveCount(1);
    await expect(panelResultado(page)).not.toContainText('Desglose');

    // «1e3» no son 1.000 € de rentas: `parseSpanishNumber` devuelve NaN.
    await sembrarValor(page, '#ingresosAnuales', '1e3');
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(aviso('otros ingresos anuales')).toHaveCount(1);
    await expect(panelResultado(page)).not.toContainText('Desglose');
  });

  test('CASO 10 — 914e13f5 en sentido contrario: al volver a un tipo con selector, el límite es el que se ve pulsado', async ({ page }) => {
    await abrir(page);

    // Con cónyuge → Viudedad (el selector desaparece) → Jubilación (reaparece, y pulsado).
    await page.getByRole('button', { name: 'Con cónyuge a cargo', exact: true }).click();
    await page.getByRole('button', { name: /Viudedad/ }).click();
    await page.getByRole('button', { name: /Jubilación/ }).click();
    await expect(page.getByRole('button', { name: 'Con cónyuge a cargo', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await sembrarValor(page, '#pensionActual', '1000');
    await sembrarValor(page, '#ingresosAnuales', '10000');
    await estimar(page);
    const jubilacion = await textoResultado(page);
    // Lo que se ve pulsado manda: 1.256,60 − 1.000 = 256,60 €/mes y el límite de 11.013 €.
    expect(importe(jubilacion, 'Complemento a mínimos')).toBeCloseTo(256.6, 2);
    expect(jubilacion).toContain('11.013,00 €/año (con cónyuge a cargo)');

    // Y otra vez hacia viudedad, pasando por incapacidad: el estado arrastrado no cuenta.
    await page.getByRole('button', { name: /Incapacidad permanente/ }).click();
    await page.getByRole('button', { name: /Viudedad/ }).click();
    await page.selectOption('#subtipo', '65_o_mas');
    await sembrarValor(page, '#pensionActual', '600');
    await sembrarValor(page, '#ingresosAnuales', '10500');
    await estimar(page);
    const viudedad = await textoResultado(page);
    // 936,20 €/mes (13.106,80 ÷ 14) · (9.442 + 13.106,80) − (10.500 + 8.400) = 3.648,80 €/año
    // ÷ 14 = 260,6286 → 260,63 €/mes. Con el límite de 11.013 € saldría el íntegro, 336,20.
    expect(importe(viudedad, 'Complemento a mínimos')).toBeCloseTo(260.63, 2);
    expect(viudedad).toContain('9442,00 €/año (sin cónyuge a cargo)');
    expect(viudedad).not.toContain('(con cónyuge a cargo)');
  });

  test('CASO 11 — tope de la pensión no contributiva (art. 9.5 RD 241/2026): 628,80 €/mes sin cónyuge a cargo', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): no aplica ni menciona el tope de la PNC del art. 9.5 RD 241/2026',
    );
    await abrir(page);

    // Pensión causada desde 2013 (la app no pregunta la fecha, y es el caso de toda pensión
    // reconocida en los últimos trece años). Jubilación ≥ 65 · sin cónyuge · 200 €/mes · rentas 0.
    await sembrarValor(page, '#pensionActual', '200');
    await sembrarValor(page, '#ingresosAnuales', '0');
    await estimar(page);
    const jubilacion = await textoResultado(page);
    // Íntegro: 936,20 − 200 = 736,20 €/mes. Tope: PNC 2026 = 8.803,20 €/año (art. 21.1) ÷ 14
    // = 628,80 €/mes. La app daba 736,20: 107,40 €/mes (1.503,60 €/año) por encima de la ley.
    expect(importe(jubilacion, 'Complemento a mínimos')).toBeCloseTo(628.8, 2);

    // Viudedad con cargas familiares · 500 €/mes · rentas 0: íntegro 1.256,60 − 500 = 756,60;
    // con el tope, 628,80 €/mes y pensión final 1.128,80. La app daba 756,60.
    await page.getByRole('button', { name: /Viudedad/ }).click();
    await page.selectOption('#subtipo', 'con_cargas');
    // Las rentas siguen en 0 (cambiar de tipo no vacía los campos).
    await sembrarValor(page, '#pensionActual', '500');
    await estimar(page);
    const viudedad = await textoResultado(page);
    expect(importe(viudedad, 'Complemento a mínimos')).toBeCloseTo(628.8, 2);
    expect(importe(viudedad, 'Pensión final estimada')).toBeCloseTo(1128.8, 2);
  });

  test('CASO 12 — tope con cónyuge a cargo (art. 10.4 RD 241/2026 + art. 364.1.a LGSS): 1.068,96 €/mes', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): no aplica ni menciona el tope de la PNC del art. 9.5 RD 241/2026',
    );
    await abrir(page);

    await page.getByRole('button', { name: 'Con cónyuge a cargo', exact: true }).click();
    await sembrarValor(page, '#pensionActual', '100');
    await sembrarValor(page, '#ingresosAnuales', '0');
    await estimar(page);
    const texto = await textoResultado(page);
    // Íntegro: 1.256,60 − 100 = 1.156,60 €/mes. Tope: 8.803,20 × 1,70 = 14.965,44 €/año ÷ 14
    // = 1.068,96 €/mes. La app daba 1.156,60.
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(1068.96, 2);
  });

  test('CASO 13 — sin complemento porque la pensión ya supera el mínimo: el motivo no puede culpar a las rentas', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): con la pensión sobre el mínimo y rentas sobre el límite, el motivo culpa a las rentas',
    );
    await abrir(page);

    // Jubilación ≥ 65 sin cónyuge · pensión 1.000 (> 936,20) · rentas 10.000. Con rentas 0 la
    // app dice, bien, que la pensión ya iguala o supera el mínimo; con 10.000 el resultado es el
    // mismo (0 €) y la causa también, pero el motivo pasa a ser «tus ingresos superan el límite
    // en más de lo que te faltaba para llegar al mínimo», cuando no faltaba nada.
    await sembrarValor(page, '#pensionActual', '1000');
    await sembrarValor(page, '#ingresosAnuales', '10000');
    await estimar(page);
    const texto = await textoResultado(page);
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(0, 2);
    expect(texto).toContain('ya iguala o supera el mínimo garantizado');
    expect(texto).not.toContain('superan el límite');
  });

  test('CASO 14 — una pensión de 0 € no es una pensión contributiva: no hay cifra que dar', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): una pensión de 0 € devuelve en verde el mínimo íntegro',
    );
    await abrir(page);

    // El propio aviso de la app dice «Si aún no cobras pensión, esta herramienta no puede
    // estimar nada», y el art. 59.1 LGSS reserva el complemento a quien ya es beneficiario de
    // una pensión contributiva. La app daba «+936,20 €/mes» (13.106,80 €/año).
    await sembrarValor(page, '#pensionActual', '0');
    await sembrarValor(page, '#ingresosAnuales', '0');
    await page.getByRole('button', { name: 'Estimar complemento' }).click();
    await expect(panelResultado(page)).not.toContainText('Desglose');
    await expect(panelResultado(page)).not.toContainText('+936,20');
  });

  test('CASO 15 — las rentas que computan incluyen las del TRABAJO (art. 9.2 RD 241/2026)', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): la ayuda y la FAQ de ingresos omiten los rendimientos del trabajo',
    );
    await abrir(page);

    // Lo que esto cambia, medido con la propia app: viudedad < 60 sin cargas, 500 €/mes y un
    // sueldo de 12.000 €/año. Quien sigue la FAQ (que no nombra el trabajo) escribe 0 y lee
    // 709,40 − 500 = 209,40 €/mes; con el sueldo, (9.442 + 9.931,60) − (12.000 + 7.000)
    // = 373,60 €/año = 26,69 €/mes.
    const faq = await page.locator('details', { hasText: '¿Qué ingresos se tienen en cuenta?' }).textContent();
    expect(faq ?? '').toMatch(/trabajo/i);
    const ayuda = await page.locator('#ingresosAnuales').locator('xpath=following-sibling::p[1]').textContent();
    expect(ayuda ?? '').toMatch(/trabajo|sueldo|salario|nómina/i);
  });

  test('CASO 16 — quién fija las cuantías: el RD de revalorización, no los Presupuestos', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): la FAQ atribuye las cuantías a los Presupuestos Generales del Estado',
    );
    await abrir(page);
    // data/fiscal/pensiones.ts (líneas de COMPLEMENTO_MINIMOS_LIMITES_2026): los Presupuestos
    // siguen prorrogados y quien fija cuantías y límites es el RD 241/2026. El FAQPage de la
    // propia app ya lo dice así.
    const faq = await page.locator('details', { hasText: '¿Se actualiza cada año?' }).textContent();
    expect(faq ?? '').not.toContain('Presupuestos Generales');
  });

  test('CASO 17 — las filas del Anexo I: «gran incapacidad» y la jubilación que procede de ella', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): falta la jubilación procedente de gran incapacidad y se rotula «Gran Invalidez»',
    );
    await abrir(page);

    // Anexo I RD 241/2026: «Titular con sesenta y cinco años procedente de gran incapacidad»
    // = 26.385,80 / 19.660,20 / 18.662,00 €/año (1.884,70 / 1.404,30 / 1.333,00 €/mes). Con la
    // única opción de 65 años que ofrece la app, una pensión de 1.000 €/mes sin cónyuge sale
    // «Sin complemento» (mínimo 936,20) cuando le corresponden 404,30 €/mes.
    const edades = await page.locator('#subtipo option').allTextContents();
    expect(edades.some((e) => /gran incapacidad|gran invalidez/i.test(e))).toBe(true);

    // Y el grado se llama «gran incapacidad» desde la Ley 2/2025 (DA única), como en el Anexo.
    await page.getByRole('button', { name: /Incapacidad permanente/ }).click();
    const grados = await page.locator('#subtipo option').allTextContents();
    expect(grados.some((g) => /gran incapacidad/i.test(g))).toBe(true);
  });

  test('CASO 18 — el resultado se lee: contraste del bloque verde (blanco sobre degradado de --success)', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): el importe y su rótulo van en blanco sobre verde a 1,94-2,87:1',
    );
    await abrir(page);
    await sembrarValor(page, '#pensionActual', '700');
    await sembrarValor(page, '#ingresosAnuales', '2000');
    await estimar(page);
    await page.mouse.move(0, 0);

    // 32 px en negrita es texto grande: 3:1. El rótulo, 14,4 px normal con opacidad 0,9: 4,5:1.
    // Medido el 03/10/2026: 2,10-2,87 y 1,94-2,60 (de #27AE60 a #2ecc71), igual en oscuro.
    expect(await contrasteMinimo(page.locator('[class*="resultHeroPositivo"] [class*="resultImporte"]'))).toBeGreaterThanOrEqual(3);
    expect(await contrasteMinimo(page.locator('[class*="resultHeroPositivo"] [class*="resultLabel"]'))).toBeGreaterThanOrEqual(4.5);
  });

  test('CASO 19 — textos pequeños en color de marca o de éxito, y blanco sobre el botón de marca', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): textos en --primary/--success y blanco sobre --primary por debajo de 4,5:1',
    );
    await abrir(page);
    await sembrarValor(page, '#pensionActual', '700');
    await sembrarValor(page, '#ingresosAnuales', '2000');
    await estimar(page);
    await page.mouse.move(0, 0);

    // Todos son texto pequeño (13-17,6 px): 4,5:1. Medido en claro el 03/10/2026.
    const medidos: Array<[string, Locator]> = [
      ['opción pulsada (3,78)', page.locator('button[class*="optionActivo"]').first()],
      ['botón Estimar (4,11 → 2,80)', page.getByRole('button', { name: 'Estimar complemento' })],
      ['importe del desglose (2,75)', page.locator('strong[class*="importePositivo"]')],
      ['«Límite de ingresos 2026:» (2,71)', page.locator('[class*="infoCard"] strong')],
      ['«Impacto anual» (3,83)', page.locator('[class*="anualCard"] strong')],
      ['número de paso (4,11)', page.locator('[class*="stepNumber"]').first()],
      ['«Importante sobre esta herramienta» (3,57)', page.locator('[class*="warningHeader"] strong')],
    ];
    const fallan: string[] = [];
    for (const [nombre, loc] of medidos) {
      const r = await contrasteMinimo(loc);
      if (r < 4.5) fallan.push(`${nombre}: ${r.toFixed(2)}`);
    }
    expect(fallan).toEqual([]);
  });
});

/**
 * Contraste mínimo de un texto contra su fondo REAL: compone las capas semitransparentes
 * hasta la primera opaca y, si el fondo es un degradado, devuelve el peor de sus extremos.
 * La opacidad del propio elemento se mezcla con el fondo (el rótulo del resultado la lleva).
 */
async function contrasteMinimo(loc: Locator): Promise<number> {
  await loc.waitFor({ state: 'attached' });
  return loc.evaluate((nodo) => {
    interface Rgba { r: number; g: number; b: number; a: number }
    const leer = (s: string): Rgba | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lineal = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const luminancia = (c: Rgba) => 0.2126 * lineal(c.r) + 0.7152 * lineal(c.g) + 0.0722 * lineal(c.b);
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });

    const capas: Array<Rgba | Rgba[]> = [];
    for (let n: Element | null = nodo; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage.includes('gradient')) {
        const paradas = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)]
          .map((x) => leer(x[0]))
          .filter((c): c is Rgba => c !== null);
        capas.push(paradas);
        break;
      }
      const c = leer(cs.backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
    }
    let fondos: Rgba[] = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let i = capas.length - 1; i >= 0; i--) {
      const capa = capas[i];
      fondos = Array.isArray(capa) ? capa : fondos.map((f) => sobre(capa, f));
    }

    const cs = getComputedStyle(nodo);
    const tinta = leer(cs.color) ?? { r: 0, g: 0, b: 0, a: 1 };
    const opacidad = Number(cs.opacity);
    return Math.min(
      ...fondos.map((f) => {
        const t = sobre({ ...tinta, a: tinta.a * opacidad }, f);
        const [l1, l2] = [luminancia(t), luminancia(f)];
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }),
    );
  });
}

// ── Móvil (390 px) ─────────────────────────────────────────────────────────────────────
// Dentro de un describe no vale `...devices['Pixel 7']` (arrastra `defaultBrowserType` y
// fuerza worker nuevo): se enumeran los cinco campos.
test.describe('Estimador de Complemento a Mínimos — móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 20 — el flujo completo cabe en 390 px y calcula lo mismo que en escritorio', async ({ page }) => {
    await abrir(page);
    const ancho = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));
    expect(ancho.scroll).toBeLessThanOrEqual(ancho.visible);

    await page.getByRole('button', { name: /Incapacidad permanente/ }).tap();
    await page.selectOption('#subtipo', 'absoluta');
    await sembrarValor(page, '#pensionActual', '700');
    await sembrarValor(page, '#ingresosAnuales', '2000');
    await page.getByRole('button', { name: 'Estimar complemento' }).tap();
    await expect(panelResultado(page)).toContainText('Desglose');
    const texto = await textoResultado(page);
    // Anexo I, incapacidad absoluta unipersonal: 13.106,80 ÷ 14 = 936,20 → 236,20 €/mes.
    expect(importe(texto, 'Pensión mínima garantizada')).toBeCloseTo(936.2, 2);
    expect(importe(texto, 'Complemento a mínimos')).toBeCloseTo(236.2, 2);
  });
});

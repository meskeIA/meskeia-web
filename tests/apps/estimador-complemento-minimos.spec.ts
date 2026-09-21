import { test, expect, Page } from '@playwright/test';
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

    // DataReference con el sello de FISCAL_PENSIONES_META ('2026-08-12' → 12/08/2026).
    const dataRef = page.locator('[aria-label="Datos de referencia normativos"]');
    await expect(dataRef).toContainText('RD 241/2026');
    await expect(dataRef).toContainText('21/09/2026');

    // El año que anuncia la app es el del módulo que usa.
    await expect(page.locator('h1')).toHaveText('Estimador de Complemento a Mínimos');
    await expect(page.locator('body')).toContainText('Seguridad Social (2026)');

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
});

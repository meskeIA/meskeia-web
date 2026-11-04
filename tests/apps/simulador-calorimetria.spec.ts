import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Simulador de calorimetría — test de regresión (inspector 04/11/2026, primera inspección)
 *
 * CONSTANTES: las que declara la propia app en motor.ts (CRC Handbook, 97.ª ed., «con los
 * redondeos habituales de los libros de texto»), las mismas que repiten su guía y su FAQ:
 *   agua  c hielo 2.090 · c líquido 4.180 · c vapor 2.010 J/(kg·K) · Lf 334.000 · Lv 2.257.000 J/kg
 *   aluminio c sólido 897 · hierro c sólido 450 · 1 kcal = 4.184 J · 1 kWh = 3.600.000 J
 * Ninguna fuente de la lista de dominios del Inspector publica calores específicos: no se ha
 * podido cotejar con una referencia externa, solo la coherencia interna.
 *
 * DE DÓNDE SALE CADA ESPERADO (calculado a mano ANTES de abrir el navegador)
 *   CASO 1 — agua «1.500» g (punto de millar) de 15 a 100 °C, 2.000 W
 *       Q = 1,5 · 4.180 · 85 = 532.950 J → «532,95 kJ» · 532.950/4.184 = 127,38 kcal
 *       532.950/3.600.000 = 0,1480 kWh · 532.950/2.000 = 266,5 s → «4 min 26 s»
 *       100 °C es el final: sin vaporización (un solo tramo)
 *   CASO 2 — estado inicial: 200 g de hielo de −10 a 120 °C
 *       0,2·2.090·10 = 4.180 · 0,2·334.000 = 66.800 · 0,2·4.180·100 = 83.600
 *       0,2·2.257.000 = 451.400 · 0,2·2.010·20 = 8.040 → 614.020 J = «614,02 kJ», cinco tramos
 *       latente (66.800 + 451.400)/614.020 = 84,4 % · 146,75 kcal · 0,1706 kWh · 307 s = «5 min 7 s»
 *   CASO 3 — mezcla aluminio 250 g a 90 °C + agua 400 g a 15 °C (sin cambio de estado)
 *       Teq = (0,25·897·90 + 0,4·4.180·15)/(0,25·897 + 0,4·4.180) = 45.262,5/1.896,25 = 23,87 °C
 *       Q = 224,25 · (90 − 23,8695) = 14.829,8 J → «14,83 kJ» cede A y absorbe B
 *   CASO 4 — mezcla hielo 100 g a −20 °C + agua 150 g a 30 °C (fusión a medias)
 *       hielo hasta 0 °C: 0,1·2.090·20 = 4.180 · agua hasta 0 °C: 0,15·4.180·30 = 18.810
 *       sobran 14.630 J < 33.400 (fundirlo todo) → Teq = 0,00 °C · f = 14.630/33.400 = 43,8 %
 *       43,8 g pasan a agua, quedan 56,2 g de hielo · Q = 18,81 kJ cada uno
 *   CASO 5 — mezcla hierro 500 g a 500 °C + agua 100 g a 20 °C (vaporización a medias)
 *       hierro hasta 100 °C: 0,5·450·400 = 90.000 · agua hasta 100 °C: 0,1·4.180·80 = 33.440
 *       sobran 56.560 J < 225.700 → Teq = 100,00 °C · f = 56.560/225.700 = 25,1 %
 *       25,1 g pasan a vapor, quedan 74,9 g de agua · Q = 90,00 kJ cada uno
 *   CASO 6 — FAQ «hervidor de 2.000 W»: 1.000 g de 20 a 100 °C = 334.400 J = «334,40 kJ»
 *       334.400/2.000 = 167,2 s → «2 min 47 s», lo que dice la FAQ (167 s)
 *   CASO 7 (límite) — ΔT = 0: agua 100 g y hierro 100 g, los dos a 20 °C → Teq 20,00 °C, Q = 0
 *   CASO 8 (límite) — agua 200 g de −300 °C a 0 °C: se recorta a −273,15 °C con aviso
 *       0,2·2.090·273,15 = 114.176,7 J → «114,18 kJ», «114.177» julios
 *   CASO 9 (rechazo) — masa 0 en un cuerpo de la mezcla → «Indica una masa mayor que cero»;
 *       «-50» g en calentar se acota a 0 (campo marcado inválido mientras se teclea); vaciar
 *       el campo conserva el valor anterior.
 *
 * HALLAZGOS ABIERTOS (inspector 04/11/2026): los test.fail() de abajo. Cada uno afirma lo que
 * la app DEBERÍA hacer, así que hoy falla «como se espera»; al repararse, se quita el test.fail().
 */

const URL_APP = '/simulador-calorimetria/';

/** Escribe en un CampoNumerico como un usuario y comprueba que React lo recogió. */
async function escribir(page: Page, selector: string, texto: string) {
  const campo = page.locator(selector);
  await campo.fill(texto);
  await esperarValorEnReact(page, selector, texto);
  await campo.blur();
}

function panelResultado(page: Page): Locator {
  return page.locator('section', { has: page.getByRole('heading', { name: 'Resultado', exact: true }) });
}

function bloqueCuerpo(page: Page, letra: 'A' | 'B'): Locator {
  return panelResultado(page)
    .locator('[class*="tramosBloque"]')
    .filter({ has: page.getByRole('heading', { name: new RegExp(`^Cuerpo ${letra} ·`) }) });
}

async function aMezcla(page: Page) {
  await page.getByRole('button', { name: /Mezclar dos cuerpos/ }).click();
  await expect(page.locator('#a-masa')).toBeVisible();
}

async function cuerpo(page: Page, letra: 'a' | 'b', sustancia: string, masa: string, temp: string) {
  await page.selectOption(`#${letra}-sustancia`, sustancia);
  await escribir(page, `#${letra}-masa`, masa);
  await escribir(page, `#${letra}-temp`, temp);
}

/** «12,34 kJ los absorbe A» → julios con signo (+ absorbe, − cede). */
async function calorDe(page: Page, letra: 'A' | 'B'): Promise<number> {
  const fila = panelResultado(page)
    .locator('[class*="equivalencias"] > div')
    .filter({ hasText: new RegExp(`los (absorbe|cede) ${letra}$`) });
  const texto = (await fila.innerText()).replace(/\s+/g, ' ').trim();
  const m = texto.match(/^([\d.,]+|≈0) (J|kJ|MJ) los (absorbe|cede)/);
  if (!m) throw new Error(`No se lee el calor de ${letra}: «${texto}»`);
  const valor = m[1] === '≈0' ? 0 : Number(m[1].replace(/\./g, '').replace(',', '.'));
  const escala = m[2] === 'MJ' ? 1e6 : m[2] === 'kJ' ? 1e3 : 1;
  return (m[3] === 'cede' ? -1 : 1) * valor * escala;
}

async function jsonLdDe(page: Page, tipo: string): Promise<Record<string, unknown>[]> {
  return page.evaluate((t) => {
    const nodos: Record<string, unknown>[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const lista = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of lista) if (n['@type'] === t) nodos.push(n);
    }
    return nodos;
  }, tipo);
}

test.describe('simulador-calorimetria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#masa', '#t-inicial', '#t-final', '#potencia']);
  });

  // ------------------------------------------------------------------ modo calentar

  test('CASO 1: agua «1.500» g de 15 a 100 °C → 532,95 kJ y 4 min 26 s a 2.000 W', async ({ page }) => {
    await escribir(page, '#masa', '1.500');
    await escribir(page, '#t-inicial', '15');
    await escribir(page, '#t-final', '100');
    await expect(page.locator('label[for="masa"]')).toContainText('1,500 kg');
    const panel = panelResultado(page);
    await expect(panel).toContainText('Calor total necesario');
    await expect(panel).toContainText('532,95 kJ');
    await expect(panel).toContainText('532.950');
    await expect(panel).toContainText('127,38');
    await expect(panel).toContainText('0,1480');
    await expect(panel).toContainText('4 min 26 s');
    // Termina justo en 100 °C: ni vaporización ni nota de calor latente
    await expect(panel.locator('ol li')).toHaveCount(1);
    await expect(panel).not.toContainText('Evaporar');
    await expect(panel).not.toContainText('Los cambios de estado se llevan');
  });

  test('CASO 2: estado inicial, hielo −10 → vapor 120 °C → 614,02 kJ en cinco tramos, 84,4 % latente', async ({ page }) => {
    const panel = panelResultado(page);
    await expect(panel).toContainText('614,02 kJ');
    await expect(panel).toContainText('614.020');
    await expect(panel).toContainText('146,75');
    await expect(panel).toContainText('0,1706');
    await expect(panel).toContainText('5 min 7 s');
    const tramos = panel.locator('ol li');
    await expect(tramos).toHaveCount(5);
    await expect(tramos.nth(0)).toContainText('4,18 kJ');
    await expect(tramos.nth(1)).toContainText('66,80 kJ');
    await expect(tramos.nth(2)).toContainText('83,60 kJ');
    await expect(tramos.nth(3)).toContainText('451,40 kJ');
    await expect(tramos.nth(4)).toContainText('8,04 kJ');
    await expect(panel).toContainText('84,4');
  });

  test('CASO 6: la FAQ del hervidor cuadra con el motor (1 kg de 20 a 100 °C = 334,40 kJ, 2 min 47 s)', async ({ page }) => {
    await escribir(page, '#masa', '1000');
    await escribir(page, '#t-inicial', '20');
    await escribir(page, '#t-final', '100');
    const panel = panelResultado(page);
    await expect(panel).toContainText('334,40 kJ');
    await expect(panel).toContainText('2 min 47 s');
    const [faq] = await jsonLdDe(page, 'FAQPage');
    expect(JSON.stringify(faq)).toContain('334.400/2.000 = 167 segundos');
  });

  test('CASO 8 (límite): −300 °C se recorta al cero absoluto con aviso → 114,18 kJ', async ({ page }) => {
    await escribir(page, '#t-inicial', '-300');
    await escribir(page, '#t-final', '0');
    const aviso = page.locator('main [role="alert"]');
    await expect(aviso).toContainText('Temperatura ajustada al rango con datos');
    const panel = panelResultado(page);
    await expect(panel).toContainText('114,18 kJ');
    await expect(panel).toContainText('114.177');
  });

  test('CASO 9 (rechazo): «-50» g se acota a 0 y vaciar el campo conserva el valor anterior', async ({ page }) => {
    // Vaciar: la app sigue con 200 g (614,02 kJ) y el campo vuelve a enseñar 200 al salir
    const masa = page.locator('#masa');
    await masa.fill('');
    await esperarValorEnReact(page, '#masa', '');
    await expect(panelResultado(page)).toContainText('614,02 kJ');
    await masa.blur();
    await expect(masa).toHaveValue('200');
    // Negativa: mientras se teclea se marca inválida y el cálculo usa 0 g
    await masa.fill('-50');
    await esperarValorEnReact(page, '#masa', '-50');
    await expect(masa).toHaveAttribute('aria-invalid', 'true');
    await masa.blur();
    await expect(masa).toHaveValue('0');
    await expect(panelResultado(page)).toContainText('0,0 J');
  });

  // ------------------------------------------------------------------ modo mezcla

  test('CASO 3: aluminio 250 g a 90 °C + agua 400 g a 15 °C → 23,87 °C y 14,83 kJ', async ({ page }) => {
    await aMezcla(page);
    await cuerpo(page, 'a', 'aluminio', '250', '90');
    await cuerpo(page, 'b', 'agua', '400', '15');
    const panel = panelResultado(page);
    await expect(panel).toContainText('23,87 °C');
    await expect(panel).toContainText('14,83 kJ los cede A');
    await expect(panel).toContainText('14,83 kJ los absorbe B');
    await expect(panel).not.toContainText('a medias');
  });

  test('CASO 4 (límite): hielo 100 g a −20 °C + agua 150 g a 30 °C → 0 °C con el 43,8 % fundido', async ({ page }) => {
    await aMezcla(page);
    await cuerpo(page, 'a', 'agua', '100', '-20');
    await cuerpo(page, 'b', 'agua', '150', '30');
    const panel = panelResultado(page);
    await expect(panel).toContainText('0,00 °C');
    const aviso = panel.locator('[role="status"]');
    await expect(aviso).toContainText('Solo el 43,8');
    await expect(aviso).toContainText('del cuerpo A completa la fusión');
    await expect(aviso).toContainText('43,8 g pasan a agua y quedan 56,2 g de hielo');
    await expect(panel).toContainText('18,81 kJ los absorbe A');
    await expect(panel).toContainText('18,81 kJ los cede B');
  });

  test('CASO 5 (límite): hierro 500 g a 500 °C + agua 100 g a 20 °C → 100 °C con el 25,1 % evaporado', async ({ page }) => {
    await aMezcla(page);
    await cuerpo(page, 'a', 'hierro', '500', '500');
    await cuerpo(page, 'b', 'agua', '100', '20');
    const panel = panelResultado(page);
    await expect(panel).toContainText('100,00 °C');
    const aviso = panel.locator('[role="status"]');
    await expect(aviso).toContainText('Solo el 25,1');
    await expect(aviso).toContainText('del cuerpo B completa la vaporización');
    await expect(aviso).toContainText('25,1 g pasan a vapor y quedan 74,9 g de agua');
    await expect(panel).toContainText('90,00 kJ los cede A');
    await expect(panel).toContainText('90,00 kJ los absorbe B');
  });

  test('CASO 7 (límite): dos cuerpos a la misma temperatura no intercambian calor', async ({ page }) => {
    await aMezcla(page);
    await cuerpo(page, 'a', 'agua', '100', '20');
    await cuerpo(page, 'b', 'hierro', '100', '20');
    const panel = panelResultado(page);
    await expect(panel).toContainText('20,00 °C');
    await expect(panel.getByText('Este cuerpo ya está a la temperatura de equilibrio')).toHaveCount(2);
  });

  test('CASO 9b (rechazo): masa 0 en un cuerpo de la mezcla pide una masa mayor que cero', async ({ page }) => {
    await aMezcla(page);
    await escribir(page, '#a-masa', '0');
    await expect(panelResultado(page)).toContainText('Indica una masa mayor que cero en los dos cuerpos');
    await expect(panelResultado(page)).not.toContainText('Temperatura de equilibrio');
  });

  // ------------------------------------------------------------------ hallazgos abiertos

  test('HALLAZGO ABIERTO [calculo/alto]: hielo a 0 °C en agua a 50 °C, el balance del desglose no cierra', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [calculo/alto]
    // ENTRADA  A agua 100 g a 0 °C · B agua 1.000 g a 50 °C
    // ESPERADO lo que A absorbe es lo que B cede (Q_A + Q_B = 0). Con el hielo a 0 °C que la
    //          propia app supone al dar 38,19 °C: A = 0,1·334.000 + 0,1·4.180·38,19 = 49,36 kJ,
    //          con su tramo «Fundir a 0,0 °C» de 33,40 kJ; B cede 1·4.180·11,81 = 49,36 kJ
    // OBTENIDO 38,19 °C, pero «15,96 kJ los absorbe A» (solo «Calentar de 0,0 °C a 38,2 °C»),
    //          «49,36 kJ los cede B» y «Aquí suman 33,40 kJ, que es solo el redondeo del cálculo»
    await aMezcla(page);
    await cuerpo(page, 'a', 'agua', '100', '0');
    await cuerpo(page, 'b', 'agua', '1000', '50');
    const qa = await calorDe(page, 'A');
    const qb = await calorDe(page, 'B');
    expect(Math.abs(qa + qb), 'Q_A + Q_B = 0 (tolerancia: el redondeo de la pantalla)').toBeLessThan(20);
    await expect(panelResultado(page)).not.toContainText('suman 33,40 kJ');
  });

  test('HALLAZGO ABIERTO [calculo/alto]: etanol en su punto de fusión, el desglose se salta la fusión', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [calculo/alto], misma raíz que el anterior
    // ENTRADA  A etanol 100 g a −114,1 °C (su fusión, el mínimo del rango) · B agua 1.000 g a 20 °C
    // ESPERADO Teq = 10,16 °C supone el etanol sólido: A = 0,1·108.000 + 0,1·2.440·124,26 = 41,12 kJ
    //          (con «Fundir» de 10,80 kJ) y B cede 1·4.180·9,84 = 41,12 kJ
    // OBTENIDO 10,16 °C, «30,32 kJ los absorbe A», «41,12 kJ los cede B», «suman 10,80 kJ»
    await aMezcla(page);
    await cuerpo(page, 'a', 'etanol', '100', '-114,1');
    await cuerpo(page, 'b', 'agua', '1000', '20');
    const qa = await calorDe(page, 'A');
    const qb = await calorDe(page, 'B');
    expect(Math.abs(qa + qb)).toBeLessThan(20);
  });

  test('HALLAZGO ABIERTO [calculo/medio]: «hielo a 0 °C» no se puede fundir en el modo calentar', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [calculo/medio]
    // ENTRADA  agua 200 g de 0 °C a 20 °C (el problema de libro «fundir 200 g de hielo a 0 °C y
    //          llevarlos a 20 °C»; el modo mezcla lee el agua a 0 °C como hielo, ver CASO D2)
    // ESPERADO 0,2·334.000 + 0,2·4.180·20 = 66.800 + 16.720 = 83.520 J → «83,52 kJ», con
    //          «Fundir a 0,0 °C». Si la reparación añade un selector de fase, este caso elige hielo.
    // OBTENIDO «16,72 kJ», un solo tramo «agua · Calentar de 0,0 °C a 20,0 °C»; y de 0 a −10 °C
    //          sale «hielo · Enfriar» sin solidificar, mientras que de 100 a 120 °C sí evapora
    await escribir(page, '#t-inicial', '0');
    await escribir(page, '#t-final', '20');
    const panel = panelResultado(page);
    await expect(panel).toContainText('83,52 kJ', { timeout: 2000 });
    await expect(panel).toContainText('Fundir a 0,0 °C', { timeout: 2000 });
  });

  test('CASO D2: el modo mezcla lee el agua a 0 °C como hielo (lo contrario que el modo calentar)', async ({ page }) => {
    // Documenta la mitad «mezcla» del hallazgo anterior: hoy pasa. Agua 100 g a 0 °C + agua
    // 100 g a 50 °C → con hielo: 0,1·4.180·50 = 20.900 J < 33.400 → 0 °C con f = 62,6 %;
    // con agua líquida sería (0 + 50)/2 = 25 °C. Si la reparación cambia la convención, este
    // caso cambia con ella.
    await aMezcla(page);
    await cuerpo(page, 'a', 'agua', '100', '0');
    await cuerpo(page, 'b', 'agua', '100', '50');
    const panel = panelResultado(page);
    await expect(panel).toContainText('0,00 °C');
    await expect(panel.locator('[role="status"]')).toContainText('62,6 g pasan a agua y quedan 37,4 g de hielo');
  });

  test('HALLAZGO ABIERTO [dato/medio]: el botón del hierro enseña c = 820, el del hierro FUNDIDO', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [dato/medio]
    // ENTRADA  modo calentar, rejilla de sustancias
    // ESPERADO el calor específico del hierro tal como está a temperatura ambiente: 450 J/(kg·K)
    //          (columna «c sólido» de la tabla, FAQ «hierro (450)», nota «se calienta nueve veces
    //          más deprisa que el agua» = 4.180/450). Igual aluminio 897, cobre 385, plomo 129,
    //          plata 235
    // OBTENIDO «c = 820 J/(kg·K)» (cLiquido ?? cSolido); 1180, 495, 138 y 283 en los otros
    await expect(page.getByRole('button', { name: /Hierro/ })).toContainText('450', { timeout: 2000 });
    await expect(page.getByRole('button', { name: /Aluminio/ })).toContainText('897', { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [calculo/bajo]: el tiempo sale «4 min 60 s»', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [calculo/bajo]
    // ENTRADA  estado inicial (614.020 J) a 2.049 W
    // ESPERADO 614.020/2.049 = 299,67 s → a segundos enteros, 300 s = «5 min 0 s»
    // OBTENIDO «4 min 60 s» (Math.round de los 59,67 s sobrantes, sin acarrear el minuto)
    await escribir(page, '#potencia', '2049');
    const panel = panelResultado(page);
    await expect(panel).toContainText('a 2049 W');
    await expect(panel).not.toContainText('min 60 s', { timeout: 2000 });
    await expect(panel).toContainText('5 min 0 s', { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [operativa/bajo]: con masa 0 dice que las temperaturas son iguales', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [operativa/bajo]
    // ENTRADA  masa 0 g, de −10 a 120 °C
    // ESPERADO un aviso sobre la masa (como el modo mezcla: «Indica una masa mayor que cero»)
    // OBTENIDO «Con la temperatura inicial igual a la final no hay intercambio de calor. Cambia
    //          una de las dos para ver el desglose.»
    await escribir(page, '#masa', '0');
    const panel = panelResultado(page);
    await expect(panel).toContainText('0,0 J');
    await expect(panel).not.toContainText('temperatura inicial igual a la final', { timeout: 2000 });
    await expect(panel).toContainText(/masa/i, { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [operativa/bajo]: la mezcla recorta la temperatura al rango sin avisar', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [operativa/bajo]
    // ENTRADA  mezcla: A mercurio 100 g a 400 °C · B agua 1.000 g a 20 °C
    // ESPERADO el aviso que da el modo calentar («Temperatura ajustada al rango con datos»):
    //          el cálculo parte de 356,7 °C y el campo sigue diciendo 400
    // OBTENIDO ningún aviso; solo el título «Cuerpo A · Mercurio desde 356,7 °C» lo delata
    await aMezcla(page);
    await cuerpo(page, 'a', 'mercurio', '100', '400');
    await cuerpo(page, 'b', 'agua', '1000', '20');
    await expect(bloqueCuerpo(page, 'A')).toContainText('Mercurio desde 356,7 °C');
    await expect(page.locator('main').getByText(/ajustada al rango/)).toHaveCount(1, { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [operativa/bajo]: el rango anunciado redondea el máximo (357 °C) y 357 se recorta', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [operativa/bajo], mismo hallazgo
    // ENTRADA  calentar mercurio de 20 °C a 357 °C, el máximo que anuncia la pista
    // ESPERADO sin aviso de recorte: 357 está dentro de «entre -38,8 °C y 357 °C»; o la pista
    //          anuncia el máximo real, 356,7 °C
    // OBTENIDO aviso «Temperatura ajustada al rango» que repite «entre -38,8 °C y 357 °C»
    await page.getByRole('button', { name: /Mercurio/ }).click();
    await escribir(page, '#t-inicial', '20');
    await escribir(page, '#t-final', '357');
    await expect(page.locator('main [role="alert"]')).toHaveCount(0, { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: la tabla redondea L de fusión y calla el c del vapor', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [contenido/bajo]
    // ENTRADA  tabla «Datos de las sustancias»
    // ESPERADO los valores con que calcula: mercurio 11,4 kJ/kg, plomo 23,2 kJ/kg, y el c del
    //          vapor de agua (2.010) y del etanol (1.430), que usa en cuanto se pasa de la ebullición
    // OBTENIDO «11 kJ/kg», «23 kJ/kg» y ninguna columna de c del gas
    const tabla = page.locator('table').first();
    await expect(tabla.getByRole('row', { name: /Mercurio/ })).toContainText('11,4', { timeout: 2000 });
    await expect(tabla.getByRole('row', { name: /Plomo/ })).toContainText('23,2', { timeout: 2000 });
    await expect(tabla.getByRole('row', { name: /Agua/ })).toContainText('2010', { timeout: 2000 });
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: el JSON-LD promete «cualquier sustancia» y hay nueve fijas', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [contenido/bajo]
    // ENTRADA  WebApplication.description
    // ESPERADO lo que hace: una de las nueve sustancias de la rejilla (no hay campo para c ni L)
    // OBTENIDO «…llevar una masa de cualquier sustancia de una temperatura a otra…»
    const [app] = await jsonLdDe(page, 'WebApplication');
    expect(String(app.description)).not.toContain('cualquier sustancia');
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: la FAQ da el rendimiento del hervidor sin fuente', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [contenido/bajo]
    // ENTRADA  FAQPage, «¿Cuánto tarda un hervidor de 2.000 W en hervir un litro de agua?»
    // ESPERADO la cifra con su fuente (quién y cuándo lo midió) o sin cifra
    // OBTENIDO «el rendimiento real de un hervidor doméstico ronda el 80-90 %», sin fuente
    const [faq] = await jsonLdDe(page, 'FAQPage');
    const texto = JSON.stringify(faq);
    if (texto.includes('80-90')) expect(texto).toMatch(/80-90 %[^"]*(según|\b(19|20)\d{2}\b)/);
  });

  test('HALLAZGO ABIERTO [contenido/bajo]: el «%» va tras un espacio normal y puede saltar solo de línea', async ({ page }) => {
    test.fail(); // HALLAZGO ABIERTO (inspector 04/11/2026) [contenido/bajo]
    // ENTRADA  estado inicial, nota «Los cambios de estado se llevan 84,4 % del total»
    // ESPERADO «84,4 %» con espacio duro U+00A0 (CLAUDE.md global §2; formatPercentage lo pone)
    // OBTENIDO «84,4 %» con U+0020; igual en «Fundir el 43,8 % a…» y en el aviso de la mezcla
    const nota = panelResultado(page).locator('strong', { hasText: '84,4' });
    const texto = (await nota.textContent()) ?? '';
    expect(texto).toContain('84,4');
    expect(texto).toContain('84,4 %');
  });
});

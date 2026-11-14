import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * Inspector — calculadora-mermelada (segmento motor · Coquinum, riesgo 3)
 *
 * Primera inspección: 14/11/2026. La app promete en su <h1> «Calculadora de mermelada» y en el
 * subtítulo «Azúcar y limón para tu mermelada según la fruta y el dulzor que quieras». Hay verdad
 * comprobable: la aritmética de unos ratios que la propia app declara.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/mermelada.ts → calcularMermelada(nivelId, frutaG):
 *     azúcar = round(fruta × ratio) con ratio 1 / 0,7 / 0,5 (tradicional / equilibrada / ligera)
 *     limón  = round(fruta / 500 × 15) ml («el zumo de medio limón por cada 500 g»)
 *     pectina: aviso si ratio < 0,6 (solo la Ligera) · fruta ≤ 0 o ilegible → null (sin cifras)
 *   app/calculadora-mermelada/page.tsx lee el campo con parseFloat(v.replace(',', '.')) || 0.
 *   No calcula peso final, evaporación ni tarros, y no los promete.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   (.inspector-trabajo/mermelada-esperados.mjs: rehace la cuenta sin importar el motor)
 *   CASO 1 (normal) · 1000 g de fruta
 *     Equilibrada (estado inicial) → 700 g de azúcar · 30 ml de limón · sin aviso de pectina
 *     Tradicional → 1000 g · 30 ml        Ligera → 500 g · 30 ml · con aviso de pectina
 *   CASO 2 (límite)
 *     Ligera, 2500 g → 1250 g · 75 ml · aviso (cuatro cifras sin agrupar, RAE 2010)
 *     Equilibrada, 12000 g → «12.000 g» · 8400 g · 360 ml
 *     «750,5» → fruta 751 g (eco a 0 decimales) · 750,5 × 0,7 = 525,35 → 525 g · 22,515 → 23 ml
 *     «1.500» = mil quinientos (CLAUDE.md §2) → 1500 g · 1050 g · 45 ml
 *     «12.000» = doce mil → 12.000 g · 8400 g · 360 ml
 *   CASO 3 (rechazo) · «0», «-500», vacío, «abc», «12abc» y «1e3» → ninguna cifra
 *     (parseSpanishNumber da NaN en «12abc» y «1e3», CLAUDE.md §1.bis)
 *   La física cuadra: la app solo da cantidades a añadir, proporcionales a la fruta.
 *
 * HALLAZGOS del 14/11/2026 (los ABIERTOS llevan test.fail())
 *   A. ABIERTO · El campo se lee con el parseo casero: «1.500» → 2 g de fruta, 1 g de azúcar y
 *      0 ml de limón; «12.000» → 12 g; «12abc» → 12 g y «1e3» → 1000 g, con cifras.
 *   B. ABIERTO · FAQPage: «Por debajo del 50% se necesita pectina añadida», pero el motor y la
 *      página ya avisan al 50 % (Ligera); y ninguna de sus cinco preguntas se ve en la página.
 *   C. ABIERTO · Promete «según la fruta» (subtítulo y features) sin preguntar la fruta, y la
 *      Tradicional «cuaja sola» con cualquiera, aunque la propia página dice que cuaja con la
 *      pectina de la fruta o añadida.
 *   D. ABIERTO · Consejos de conservación fuera de la nevera con `// @disclaimer: exempt`, sin
 *      DisclaimerCard ni el criterio de AESAN de desechar conservas abombadas («Botulismo»,
 *      30/08/2019, §10).
 *   E. ABIERTO · La región aria-live desaparece con una entrada no válida y renace llena.
 *   F. ABIERTO · «100% de la fruta», «70%», «50%» sin espacio duro (CLAUDE.md §2, 25/09/2026).
 */

const RUTA = '/calculadora-mermelada/';
const INPUT = '#fruta';

type Nivel = 'tradicional' | 'equilibrada' | 'ligera';
const BOTON: Record<Nivel, RegExp> = {
  tradicional: /^Tradicional/,
  equilibrada: /^Equilibrada/,
  ligera: /^Ligera/,
};
const AVISO_PECTINA = 'Con tan poca azúcar conviene añadir pectina';

async function elegir(page: Page, nivel: Nivel): Promise<void> {
  const boton = page.getByRole('button', { name: BOTON[nivel] });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Escribe en el campo (es type="text": fill() admite «1.500» y «12abc») y espera al estado de React. */
async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator(INPUT).fill(texto);
  await esperarValorEnReact(page, INPUT, texto);
}

/** Las tres cifras de la zona de resultado (fruta, azúcar, limón); [] si no hay resultado. */
async function cifras(page: Page): Promise<string[]> {
  return (await page.locator('main [role="status"] [class$="_resValor"]').allTextContents()).map((t) => t.trim());
}

async function ldDeTipo(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return hallado;
}

async function respuestasFaq(page: Page): Promise<{ name: string; text: string }[]> {
  const faq = await ldDeTipo(page, 'FAQPage');
  return (faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => ({
    name: q.name,
    text: q.acceptedAnswer.text,
  }));
}

async function textoDelCuerpo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
}

test.describe('calculadora-mermelada — Inspector 14/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [INPUT]);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · estado inicial (Equilibrada, 1000 g): 700 g de azúcar y 30 ml de limón', async ({ page }) => {
    // 1000 × 0,7 = 700 · 1000 / 500 × 15 = 30 · ratio 0,7 ≥ 0,6 → sin aviso de pectina
    await expect(page.getByRole('button', { name: BOTON.equilibrada })).toHaveAttribute('aria-pressed', 'true');
    expect(await cifras(page)).toEqual(['1000 g', '700 g', '30 ml']);
    await expect(page.getByText(AVISO_PECTINA)).toHaveCount(0);
  });

  test('CASO 1 · Tradicional (1:1) y Ligera (1:0,5) con 1000 g', async ({ page }) => {
    // Tradicional: 1000 × 1 = 1000 g · 30 ml · sin aviso
    await elegir(page, 'tradicional');
    await expect.poll(() => cifras(page)).toEqual(['1000 g', '1000 g', '30 ml']);
    await expect(page.getByText(AVISO_PECTINA)).toHaveCount(0);
    // Ligera: 1000 × 0,5 = 500 g · 30 ml · 0,5 < 0,6 → aviso de pectina
    await elegir(page, 'ligera');
    await expect.poll(() => cifras(page)).toEqual(['1000 g', '500 g', '30 ml']);
    await expect(page.getByText(AVISO_PECTINA)).toHaveCount(1);
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  test('CASO 2 · Ligera con 2500 g: 1250 g de azúcar, 75 ml de limón y aviso de pectina', async ({ page }) => {
    // 2500 × 0,5 = 1250 · 2500 / 500 × 15 = 75 · cuatro cifras sin punto (RAE 2010, Intl es-ES)
    await elegir(page, 'ligera');
    await escribir(page, '2500');
    await expect.poll(() => cifras(page)).toEqual(['2500 g', '1250 g', '75 ml']);
    await expect(page.getByText(AVISO_PECTINA)).toHaveCount(1);
  });

  test('CASO 2 · 12000 g se muestran «12.000 g», con 8400 g de azúcar y 360 ml de limón', async ({ page }) => {
    // 12000 × 0,7 = 8400 · 12000 / 500 × 15 = 360 · cinco cifras con punto de millar
    await escribir(page, '12000');
    await expect.poll(() => cifras(page)).toEqual(['12.000 g', '8400 g', '360 ml']);
  });

  test('CASO 2 · «750,5» con coma decimal: 525 g de azúcar y 23 ml de limón', async ({ page }) => {
    // 750,5 × 0,7 = 525,35 → 525 · 750,5 / 500 × 15 = 22,515 → 23 · el eco de la fruta va a 0 decimales
    await escribir(page, '750,5');
    await expect.poll(() => cifras(page)).toEqual(['751 g', '525 g', '23 ml']);
  });

  // HALLAZGO A (14/11/2026, ABIERTO) — parseFloat(v.replace(',', '.')) lee el punto de millar como decimal.
  test('CASO 2 · «1.500» se lee mil quinientos: 1050 g de azúcar y 45 ml de limón', async ({ page }) => {
    // 1500 × 0,7 = 1050 · 1500 / 500 × 15 = 45. Hoy: «2 g» de fruta, «1 g» de azúcar, «0 ml» de limón
    await escribir(page, '1.500');
    test.fail();
    await expect.poll(() => cifras(page)).toEqual(['1500 g', '1050 g', '45 ml']);
  });

  // HALLAZGO A (14/11/2026, ABIERTO)
  test('CASO 2 · «12.000» se lee doce mil, no 12 g', async ({ page }) => {
    // 12000 × 0,7 = 8400 · 360 ml. Hoy: «12 g», «8 g», «0 ml»
    await escribir(page, '12.000');
    test.fail();
    await expect.poll(() => cifras(page)).toEqual(['12.000 g', '8400 g', '360 ml']);
  });

  // ── CASO 3 · rechazo ───────────────────────────────────────────────────────
  test('CASO 3 · 0, negativo, vacío y texto no dan cifras', async ({ page }) => {
    for (const texto of ['0', '-500', '', 'abc']) {
      await escribir(page, texto);
      await expect.poll(() => cifras(page), { message: `«${texto}»` }).toEqual([]);
    }
    // Control: un peso válido vuelve a dar cifras (500 × 0,7 = 350 · 15 ml)
    await escribir(page, '500');
    await expect.poll(() => cifras(page)).toEqual(['500 g', '350 g', '15 ml']);
  });

  // HALLAZGO A (14/11/2026, ABIERTO) — parseFloat acepta la basura del final y la notación científica.
  test('CASO 3 · «12abc» y «1e3» se rechazan en vez de calcularse', async ({ page }) => {
    // parseSpanishNumber da NaN en los dos. Hoy: «12abc» → 12 g / 8 g / 0 ml; «1e3» → 1000 g / 700 g / 30 ml
    await escribir(page, '12abc');
    test.fail();
    await expect.poll(() => cifras(page)).toEqual([]);
    await escribir(page, '1e3');
    await expect.poll(() => cifras(page)).toEqual([]);
  });

  // ── Contenido ──────────────────────────────────────────────────────────────
  // HALLAZGO B (14/11/2026, ABIERTO) — el FAQPage da otro umbral de pectina que el motor.
  test('FAQPage · el umbral de pectina cuadra con el motor (la Ligera, al 50 %, ya avisa)', async ({ page }) => {
    // Motor: necesitaPectina = ratioAzucar < 0,6; nota de la Ligera: «necesita pectina añadida».
    // Hoy el FAQPage: «Por debajo del 50% se necesita pectina añadida» (al 50 % no haría falta).
    await elegir(page, 'ligera');
    await expect(page.getByText(AVISO_PECTINA)).toHaveCount(1);
    const azucar = (await respuestasFaq(page)).find((q) => /Cuánta azúcar/.test(q.name));
    expect(azucar, 'el FAQPage trae la pregunta del azúcar').toBeDefined();
    test.fail();
    expect(azucar!.text).not.toContain('Por debajo del 50% se necesita pectina');
  });

  // HALLAZGO B (14/11/2026, ABIERTO) — ninguna de las cinco preguntas del FAQPage se ve en la página.
  test('FAQPage · un solo bloque y sus preguntas están en la página', async ({ page }) => {
    test.fail();
    await comprobarFaqPageUnico(page);
  });

  // HALLAZGO C (14/11/2026, ABIERTO) — la app no pregunta la fruta, solo su peso.
  test('Promesa · no dice «según la fruta» ni que la Tradicional «cuaja sola» con cualquiera', async ({ page }) => {
    // La propia página: «la acidez (el limón) y la pectina (natural de la fruta o añadida) son las
    // que hacen que el conjunto gelifique». Hoy el subtítulo y la nota de la Tradicional son estos:
    // Control: el subtítulo es el párrafo que sigue al <h1>
    await expect(page.locator('h1 + p')).toHaveCount(1);
    test.fail();
    await expect(page.locator('h1 + p')).not.toHaveText(
      'Azúcar y limón para tu mermelada según la fruta y el dulzor que quieras',
    );
    await expect(page.getByRole('button', { name: BOTON.tradicional })).not.toContainText(
      'Mucho azúcar: cuaja sola y se conserva más.',
    );
  });

  // HALLAZGO D (14/11/2026, ABIERTO) — consejos de conservación con `// @disclaimer: exempt`.
  test('Aviso · los consejos de conservación van con un DisclaimerCard', async ({ page }) => {
    // calculadora-caducidad, del mismo tema, lleva DisclaimerCard (role="note"). Hoy: ninguno.
    test.fail();
    await expect(page.getByRole('note').first()).toBeAttached();
  });

  // HALLAZGO D (14/11/2026, ABIERTO) — AESAN, «Botulismo» (30/08/2019), §10: «se recomienda a los
  // consumidores desechar conservas (caseras e industriales) que presenten abombamiento, óxido,
  // pérdidas de líquido u olores anómalos».
  test('Aviso · la conservación fuera de la nevera dice cuándo desechar un tarro', async ({ page }) => {
    const cuerpo = await textoDelCuerpo(page);
    // Control: el consejo de guardarla fuera de la nevera está en la página
    expect(cuerpo).toContain('Para guardarla fuera de la nevera');
    test.fail();
    expect(cuerpo).toMatch(/abomba/i);
  });

  // ── Accesibilidad ──────────────────────────────────────────────────────────
  // HALLAZGO E (14/11/2026, ABIERTO) — {resultado ? <div role="status" aria-live> : <p>}: la región se desmonta.
  test('A11y · la región aria-live sigue montada con una entrada no válida', async ({ page }) => {
    const region = page.locator('main [aria-live]');
    await expect(region).toHaveCount(1);
    // Hoy: al vaciar el campo hay 0 regiones vivas en <main>; al escribir 500 renace ya con la cifra
    await escribir(page, '');
    test.fail();
    await expect(region).toHaveCount(1);
    await escribir(page, '500');
    await expect(region).toHaveCount(1);
    await expect(region).toContainText('350 g');
  });

  // ── Formato ────────────────────────────────────────────────────────────────
  // HALLAZGO F (14/11/2026, ABIERTO) — el «%» va separado con espacio duro (CLAUDE.md §2, 25/09/2026).
  test('Formato · los porcentajes de la tabla y del FAQPage llevan espacio antes del «%»', async ({ page }) => {
    // La tabla vive en la guía plegada (EducationalSection): por CSS, que getByRole no ve lo oculto
    const tabla = ((await page.locator('table').first().textContent()) ?? '').trim();
    // Control: la tabla de niveles está en el DOM
    expect(tabla).toContain('Equilibrada');
    test.fail();
    // Hoy: «100% de la fruta», «70%», «50%»
    expect(tabla).not.toMatch(/\d%/);
    for (const q of await respuestasFaq(page)) expect(q.text, q.name).not.toMatch(/\d%/);
  });

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  test('JSON-LD · features con al menos 4 características', async ({ page }) => {
    const app = await ldDeTipo(page, 'WebApplication');
    const lista = (app.featureList ?? app.features) as string[];
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });
});

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { TIPOS_IVA, RECARGO_EQUIVALENCIA } from '../../data/fiscal/iva';

/**
 * Inspector — calculadora-iva (segmento cálculo, riesgo 2)
 *
 * Primera inspección: 14/11/2026. La app promete en su <h1> «Calculadora de IVA» y en el
 * subtítulo «Calcula el IVA español al 21%, 10% o 4%. Añade o quita IVA al instante». Hay verdad
 * comprobable: la aritmética de añadir y quitar IVA con los tipos de la Ley 37/1992.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/calculadora-iva/page.tsx → calcular():
 *     añadir: base = valor · cuota = valor × t/100 · total = base + cuota
 *     quitar: total = valor · base = valor / (1 + t/100) · cuota = total − base
 *   Las tres cifras se redondean POR SEPARADO al pintarlas (formatCurrency), sin redondear antes
 *   la base. Los tipos 21/10/4 van escritos a mano en IVA_RATES, no importados de data/fiscal.
 *
 * DATOS NORMATIVOS
 *   data/fiscal/iva.ts (verificado 2026-06-18): TIPOS_IVA 21 / 10 / 4 · RECARGO_EQUIVALENCIA
 *   5,2 / 1,4 / 0,5 (y 1,75 el tabaco). AEAT, «Tipos impositivos en el IVA 2026» (2 de junio de
 *   2026): art. 91.Uno.2.2.º, hostelería y «suministro de comidas y bebidas para consumir en el
 *   acto» al 10 %; asistencia sanitaria no exenta y entrada a zoológicos al 21 %; aceites de oliva
 *   al 4 % (art. 91.Dos.1.1.º). LGT art. 27.2 (ESCALA_RECARGO_EXTEMPORANEO de
 *   data/fiscal/recargos-sanciones.ts): recargo del 1 % más 1 % por mes completo. LIVA art. 3:
 *   Canarias, Ceuta y Melilla fuera del territorio de aplicación del IVA.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal)
 *     Añadir, «1.234,56» al 21 %: cuota = 1234,56 × 0,21 = 259,2576 → 259,26 € ·
 *       total = 1493,8176 → 1493,82 € (es-ES no agrupa las cuatro cifras: no es defecto)
 *     Añadir, «1.500» al 10 % (= mil quinientos): cuota 150,00 € · total 1650,00 €
 *     Quitar, 121 al 21 %: base 121 / 1,21 = 100,00 € · cuota 21,00 €
 *     Quitar, 100 al 21 %: base 82,6446… → 82,64 € · cuota 17,3554… → 17,36 € · suman 100,00 €
 *   CASO 2 (límite: el redondeo del desglose inverso al 4 %)
 *     Quitar, 3,25 al 4 %: base exacta 3,25 / 1,04 = 3,125 (medio céntimo exacto) → 3,13 € ·
 *       cuota = 3,25 − 3,13 = 0,12 € · base + cuota = 3,25 €
 *     Quitar, 10,53 al 4 %: base 10,125 → 10,13 € · cuota 10,53 − 10,13 = 0,40 €
 *     Añadir 100 al 21 %, calcular y pulsar «10 %»: o recalcula (cuota 10,00 €, total 110,00 €)
 *       o retira el resultado; nunca «Cuota IVA (10 %)» con los 21,00 € del 21 %
 *   CASO 3 (rechazo)
 *     «-50», vacío y «0» → ninguna cifra y un aviso que diga por qué
 *
 * HALLAZGOS del 14/11/2026 (los abiertos llevan test.fail())
 *   A. Cambiar el tipo (o la operación) tras calcular deja las cifras viejas bajo el rótulo nuevo:
 *      «Cuota IVA (10%)» = 21,00 €, y el HTML exportable dice «Quitar IVA 10%» con esas cifras.
 *   B. Desglose inverso al 4 %: base y cuota redondeadas por separado no suman el total
 *      (3,25 € → 3,13 € + 0,13 €).
 *   C. Un importe negativo, vacío o cero no da cifras pero tampoco ningún aviso (el −50 se
 *      reescribe a 0 en silencio).
 *   D. Tipos 21/10/4, recargo 0,5/1,4/5,2 y umbral OSS de 10.000 € escritos a mano pudiendo
 *      importarse de data/fiscal (TIPOS_IVA, RECARGO_EQUIVALENCIA, UMBRAL_OSS).
 *   E. «Restaurante o bar»: «Bebidas alcohólicas: 21% IVA»; servidas para consumir en el acto
 *      tributan al 10 % (art. 91.Uno.2.2.º).
 *   F. «recargo mínimo del 5%» por presentar el 303 fuera de plazo; el art. 27.2 LGT parte del 1 %.
 *   G. FAQPage, «¿Qué bienes y servicios tienen IVA al 10%?»: asistencia sanitaria no exenta y
 *      zoológicos van al 21 %, el aceite de oliva al 4 % y los refrescos azucarados al 21 %.
 *   H. Ni en la página ni en el FAQPage consta que en Canarias, Ceuta y Melilla no se aplica el
 *      IVA (art. 3 LIVA); sin RegionBadge «es-only» ni DataReference.
 *   I. Botones de operación y de tipo sin aria-pressed, y el resultado sin región aria-live.
 *   J. «%» pegado a la cifra («Cuota IVA (21%)», «21%» en botones, tablas y title).
 *   K. features del JSON-LD vacía.
 *   L. «¿Tengo que cobrar IVA si soy autónomo?» (visible) y «¿Están los autónomos y empresas
 *      obligados a cobrar IVA?» (FAQPage): la misma pregunta con dos respuestas.
 */

const RUTA = '/calculadora-iva/';
const INPUT = 'input[inputmode="decimal"]';

type Tipo = 21 | 10 | 4;

async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator(INPUT).fill(texto);
  await esperarValorEnReact(page, INPUT, texto);
}

/** \s casa también con el espacio duro: el selector sigue valiendo cuando el «%» se separe. */
async function elegirTipo(page: Page, tipo: Tipo): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${tipo}\\s*%`) }).click();
}

async function quitarIva(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Quitar IVA/ }).click();
  await expect(page.getByLabel('Precio con IVA incluido')).toBeVisible();
}

async function calcular(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Calcular IVA', exact: true }).click();
}

/** La cifra de la tarjeta de resultado cuyo título casa con `titulo`, con el espacio duro a la vista. */
async function cifra(page: Page, titulo: RegExp): Promise<string> {
  const encabezado = page.getByRole('heading', { level: 3, name: titulo });
  await expect(encabezado).toBeVisible();
  const valor = encabezado.locator('xpath=ancestor::div[2]').locator('p > span').first();
  return ((await valor.textContent()) ?? '').trim();
}

async function desglose(page: Page): Promise<[string, string, string]> {
  return [
    await cifra(page, /^Base imponible$/),
    await cifra(page, /^Cuota IVA/),
    await cifra(page, /^Total con IVA$/),
  ];
}

/** «1234,56 €» → 123456 céntimos. */
function centimos(texto: string): number {
  const limpio = texto.replace(/[^\d,]/g, '').replace(',', '.');
  return Math.round(Number(limpio) * 100);
}

const EUR = (s: string): string => `${s} €`;

async function textoDelCuerpo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
}

async function ldDeTipo(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!hallado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return hallado;
}

async function faqPage(page: Page): Promise<{ name: string; text: string }[]> {
  const faq = await ldDeTipo(page, 'FAQPage');
  return (faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => ({
    name: q.name,
    text: q.acceptedAnswer.text,
  }));
}

test.describe('calculadora-iva — Inspector 14/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [INPUT]);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · añadir IVA a 1.234,56 € al 21 %: 259,26 € de cuota y 1493,82 € de total', async ({ page }) => {
    // 1234,56 × 0,21 = 259,2576 → 259,26 · 1234,56 + 259,2576 = 1493,8176 → 1493,82
    await escribir(page, '1.234,56');
    await calcular(page);
    expect(await desglose(page)).toEqual([EUR('1234,56'), EUR('259,26'), EUR('1493,82')]);
  });

  test('CASO 1 · «1.500» al 10 % es mil quinientos: 150,00 € de cuota y 1650,00 € de total', async ({ page }) => {
    await escribir(page, '1.500');
    await elegirTipo(page, 10);
    await calcular(page);
    expect(await desglose(page)).toEqual([EUR('1500,00'), EUR('150,00'), EUR('1650,00')]);
  });

  test('CASO 1 · quitar IVA: 121 € al 21 % son 100 € de base; 100 € al 21 % son 82,64 € + 17,36 €', async ({ page }) => {
    await quitarIva(page);
    await escribir(page, '121');
    await calcular(page);
    expect(await desglose(page)).toEqual([EUR('100,00'), EUR('21,00'), EUR('121,00')]);

    // 100 / 1,21 = 82,6446… → 82,64 · 100 − 82,6446… = 17,3553… → 17,36 · suman 100,00
    await escribir(page, '100');
    await calcular(page);
    expect(await desglose(page)).toEqual([EUR('82,64'), EUR('17,36'), EUR('100,00')]);
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  // HALLAZGO (14/11/2026, ABIERTO) — B: base y cuota se redondean por separado y no suman el total.
  test('CASO 2 · quitar IVA al 4 %: la base y la cuota mostradas suman el total (3,25 € y 10,53 €)', async ({ page }) => {
    test.fail();
    await quitarIva(page);
    await elegirTipo(page, 4);
    for (const [precio, baseEsperada, cuotaEsperada] of [
      ['3,25', '3,13', '0,12'], // 3,25 / 1,04 = 3,125 → 3,13 · cuota 3,25 − 3,13 = 0,12
      ['10,53', '10,13', '0,40'], // 10,53 / 1,04 = 10,125 → 10,13 · cuota 10,53 − 10,13 = 0,40
    ]) {
      await escribir(page, precio);
      await calcular(page);
      const [base, cuota, total] = await desglose(page);
      expect(total).toBe(EUR(precio));
      expect(centimos(base) + centimos(cuota), `${base} + ${cuota} = ${total}`).toBe(centimos(total));
      expect([base, cuota]).toEqual([EUR(baseEsperada), EUR(cuotaEsperada)]);
    }
  });

  // HALLAZGO (14/11/2026, ABIERTO) — A: la cuota del 21 % se queda bajo el rótulo del 10 %.
  test('CASO 2 · cambiar el tipo tras calcular no deja la cuota del 21 % bajo el rótulo del 10 %', async ({ page }) => {
    test.fail();
    await escribir(page, '100');
    await calcular(page);
    expect(await desglose(page)).toEqual([EUR('100,00'), EUR('21,00'), EUR('121,00')]);

    await elegirTipo(page, 10);
    const rotulo = page.getByRole('heading', { level: 3, name: /^Cuota IVA/ });
    // Retirar el resultado también es una respuesta correcta: lo que no vale es la cifra vieja.
    if ((await rotulo.count()) > 0) {
      await expect(rotulo).toHaveText(/10\s*%/);
      expect(await desglose(page)).toEqual([EUR('100,00'), EUR('10,00'), EUR('110,00')]);
    }
  });

  // ── CASO 3 · rechazo ───────────────────────────────────────────────────────
  test('CASO 3 · un importe negativo, vacío o cero no da cifras', async ({ page }) => {
    for (const texto of ['-50', '', '0']) {
      await escribir(page, texto);
      await calcular(page);
      await expect(page.getByRole('heading', { level: 3, name: /^Cuota IVA/ })).toHaveCount(0);
    }
  });

  // HALLAZGO (14/11/2026, ABIERTO) — C: se rechaza en silencio, sin decir por qué.
  test('CASO 3 · un importe negativo, vacío o cero avisa de por qué no hay cifras', async ({ page }) => {
    test.fail();
    for (const texto of ['-50', '', '0']) {
      await escribir(page, texto);
      await calcular(page);
      // El anunciador de rutas de Next también es role="alert", pero vacío: se acota al que tiene texto.
      const aviso = page.locator('[role="alert"]').filter({ hasText: /importe|mayor|válid|cero|positiv/i });
      await expect(aviso.first(), `aviso para «${texto}»`).toBeVisible();
    }
  });

  // ── Datos normativos ───────────────────────────────────────────────────────
  test('Datos · los tipos de los botones y del recargo de equivalencia son los de data/fiscal', async ({ page }) => {
    const botones = (await page.getByRole('group', { name: 'Tipo de IVA' }).getByRole('button').allTextContents())
      .map((t) => Number((t.match(/^(\d+)/) ?? [])[1]));
    expect(botones).toEqual(TIPOS_IVA.map((t) => t.porcentaje));

    const texto = await textoDelCuerpo(page);
    for (const { recargo } of RECARGO_EQUIVALENCIA) {
      expect(texto).toContain(`+${String(recargo).replace('.', ',')}`);
    }
  });

  // HALLAZGO (14/11/2026, ABIERTO) — E: las bebidas alcohólicas servidas en el bar no van al 21 %.
  test('Datos · hostelería: las bebidas servidas para consumir en el acto no se dan al 21 %', async ({ page }) => {
    test.fail();
    // AEAT, Tipos IVA 2026, art. 91.Uno.2.2.º: «el suministro de comidas y bebidas para consumir en
    // el acto» → 10 %. El 21 % de las bebidas alcohólicas es el de su ENTREGA como producto.
    const texto = await textoDelCuerpo(page);
    expect(texto).not.toMatch(/Bebidas alcohólicas:\s*21\s*%/);
    expect(texto).not.toMatch(/21\s*%\s*en alcohol/);
  });

  // HALLAZGO (14/11/2026, ABIERTO) — F: el recargo por presentar tarde parte del 1 %, no del 5 %.
  test('Datos · presentar el 303 fuera de plazo: el recargo no es «mínimo del 5 %»', async ({ page }) => {
    test.fail();
    // ESCALA_RECARGO_EXTEMPORANEO (art. 27.2 LGT): 1 % más 1 % por cada mes completo de retraso.
    expect(await textoDelCuerpo(page)).not.toMatch(/recargo mínimo del 5\s*%/);
  });

  // HALLAZGO (14/11/2026, ABIERTO) — G: el FAQPage pone al 10 % lo que va al 21 %.
  test('FAQPage · «IVA al 10 %» no incluye la asistencia sanitaria ni los zoológicos (21 %)', async ({ page }) => {
    test.fail();
    const pregunta = (await faqPage(page)).find((q) => /IVA al 10/.test(q.name));
    expect(pregunta, 'la pregunta del 10 % sigue en el FAQPage').toBeTruthy();
    // AEAT, Tipos IVA 2026: asistencia sanitaria no exenta 21 %; entrada a zoológicos 21 %.
    expect(pregunta!.text).not.toMatch(/asistencia sanitaria/i);
    expect(pregunta!.text).not.toMatch(/zool[óo]gicos/i);
  });

  // HALLAZGO (14/11/2026, ABIERTO) — H: el IVA no se aplica en Canarias, Ceuta y Melilla.
  test('Datos · la página dice que en Canarias, Ceuta y Melilla no se aplica el IVA', async ({ page }) => {
    test.fail();
    const texto = await textoDelCuerpo(page);
    expect(texto).toMatch(/Canarias/);
    expect(texto).toMatch(/Ceuta/);
  });

  // ── Accesibilidad ──────────────────────────────────────────────────────────
  // HALLAZGO (14/11/2026, ABIERTO) — I: el estado de los botones solo se ve por el color.
  test('A11y · los botones de operación y de tipo dicen cuál está activo (aria-pressed)', async ({ page }) => {
    test.fail();
    await expect(page.getByRole('button', { name: /Añadir IVA/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Quitar IVA/ })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^21\s*%/ })).toHaveAttribute('aria-pressed', 'true');
    await elegirTipo(page, 4);
    await expect(page.getByRole('button', { name: /^4\s*%/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^21\s*%/ })).toHaveAttribute('aria-pressed', 'false');
  });

  // HALLAZGO (14/11/2026, ABIERTO) — I: el resultado aparece sin que el lector de pantalla lo anuncie.
  test('A11y · el resultado se pinta dentro de una región aria-live montada desde el principio', async ({ page }) => {
    test.fail();
    const region = page.locator('[aria-live]').filter({ has: page.getByText(/Introduce un importe/) });
    await expect(region).toHaveCount(1);
    await escribir(page, '100');
    await calcular(page);
    await expect(page.locator('[aria-live]').filter({ hasText: '121,00' })).toHaveCount(1);
  });

  // ── Formato y contenido ────────────────────────────────────────────────────
  // HALLAZGO (14/11/2026, ABIERTO) — J: «21%» pegado; la norma es «21 %» con espacio duro.
  test('Formato · el rótulo de la cuota separa el «%» con espacio duro', async ({ page }) => {
    test.fail();
    await escribir(page, '100');
    await calcular(page);
    await expect(page.getByRole('heading', { level: 3, name: /^Cuota IVA/ })).toHaveText('Cuota IVA (21 %)');
  });

  // HALLAZGO (14/11/2026, ABIERTO) — K: features vacía.
  test('JSON-LD · features con al menos 4 características', async ({ page }) => {
    test.fail();
    const app = await ldDeTipo(page, 'WebApplication');
    expect((app.featureList as string[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  // HALLAZGO (14/11/2026, ABIERTO) — L: la misma pregunta, redactada dos veces y con dos respuestas.
  test('FAQ · la pregunta de si el autónomo cobra IVA tiene UNA respuesta en la página y en el FAQPage', async ({ page }) => {
    test.fail();
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const visible = page.getByRole('heading', { level: 4, name: /cobrar IVA si soy autónomo/ });
    const preguntaVisible = ((await visible.textContent()) ?? '').trim();
    const respuestaVisible = ((await visible.locator('xpath=following-sibling::p[1]').textContent()) ?? '').trim();
    const enFaqPage = (await faqPage(page)).filter((q) => /autónomo/i.test(q.name) && /cobrar IVA/i.test(q.name));
    expect(enFaqPage).toEqual([{ name: preguntaVisible, text: respuestaVisible }]);
  });
});

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { TIPOS_IVA, RECARGO_EQUIVALENCIA, RECARGO_EQUIVALENCIA_TABACO, FISCAL_IVA_META } from '../../data/fiscal/iva';

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
 * HALLAZGOS del 14/11/2026 — TODOS REPARADOS el mismo día por /reparar (4633-4644): el resultado
 * guarda su tipo y operación y se recalcula al cambiarlos; desglose en céntimos enteros con la
 * cuota como diferencia; aviso role="alert" por NumberInput; tipos, recargo y umbral OSS desde
 * data/fiscal/iva.ts; texto de hostelería, recargo y FAQ del 10 % contra el PDF de la AEAT
 * «Tipos impositivos en el IVA 2026» y el art. 27.2 LGT; RegionBadge, DataReference y la nota de
 * Canarias, Ceuta y Melilla; aria-pressed y región viva; «%» con espacio duro; features; y una
 * sola FAQ (PREGUNTAS_FRECUENTES de metadata.ts).
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
 *
 * CABO C0748 (14/11/2026, ABIERTO, con test.fail()): «¿El IVA afecta al IRPF?» dice que el IVA no
 * deducible «(gastos personales) sí es gasto deducible en IRPF». Un gasto personal no es gasto de
 * la actividad (arts. 28.1 y 29.1.b LIRPF); el IVA soportado no deducible entra como coste solo en
 * un gasto afecto (art. 95.Uno LIVA y NRV 12.ª del PGC). Fuentes literales, en el caso del final.
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
  // HALLAZGO 4634 (14/11/2026, REPARADO) — B: base y cuota se redondeaban por separado y no sumaban el total.
  test('CASO 2 · quitar IVA al 4 %: la base y la cuota mostradas suman el total (3,25 € y 10,53 €)', async ({ page }) => {
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

  // HALLAZGO 4633 (14/11/2026, REPARADO) — A: la cuota del 21 % se quedaba bajo el rótulo del 10 %.
  // La app recalcula al cambiar el tipo o la operación.
  test('CASO 2 · cambiar el tipo tras calcular no deja la cuota del 21 % bajo el rótulo del 10 %', async ({ page }) => {
    await escribir(page, '100');
    await calcular(page);
    expect(await desglose(page)).toEqual([EUR('100,00'), EUR('21,00'), EUR('121,00')]);

    await elegirTipo(page, 10);
    const rotulo = page.getByRole('heading', { level: 3, name: /^Cuota IVA/ });
    await expect(rotulo).toHaveText(/10\s*%/);
    expect(await desglose(page)).toEqual([EUR('100,00'), EUR('10,00'), EUR('110,00')]);

    // Pasar a «Quitar IVA»: los 100 son ahora el precio con IVA al 10 %.
    // 100 / 1,10 = 90,909… → 90,91 · cuota 100 − 90,91 = 9,09
    await quitarIva(page);
    expect(await desglose(page)).toEqual([EUR('90,91'), EUR('9,09'), EUR('100,00')]);

    // El HTML exportable dice la operación y el tipo de las cifras que lleva.
    await page.getByRole('button', { name: 'Ver código HTML' }).click();
    const codigo = (await page.locator('pre').textContent()) ?? '';
    expect(codigo).toMatch(/Quitar IVA 10\s%/);
    expect(codigo).toContain('9,09');
    expect(codigo).not.toContain('21,00');
  });

  // ── CASO 3 · rechazo ───────────────────────────────────────────────────────
  test('CASO 3 · un importe negativo, vacío o cero no da cifras', async ({ page }) => {
    for (const texto of ['-50', '', '0']) {
      await escribir(page, texto);
      await calcular(page);
      await expect(page.getByRole('heading', { level: 3, name: /^Cuota IVA/ })).toHaveCount(0);
    }
  });

  // HALLAZGO 4635 (14/11/2026, REPARADO) — C: se rechazaba en silencio, sin decir por qué.
  test('CASO 3 · un importe negativo, vacío o cero avisa de por qué no hay cifras', async ({ page }) => {
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

  // HALLAZGO 4636 (14/11/2026, REPARADO) — D: tipos, recargo y umbral OSS importados de data/fiscal,
  // con el recargo del tabaco (art. 161.4.º LIVA, 1,75 %) que la tabla omitía.
  test('Datos · la tabla del recargo de equivalencia incluye el del tabaco', async ({ page }) => {
    expect(await textoDelCuerpo(page)).toMatch(new RegExp(`tabaco: \\+${String(RECARGO_EQUIVALENCIA_TABACO).replace('.', ',')}\\s%`));
  });

  // HALLAZGO 4637 (14/11/2026, REPARADO) — E: las bebidas alcohólicas servidas en el bar no van al 21 %.
  test('Datos · hostelería: las bebidas servidas para consumir en el acto no se dan al 21 %', async ({ page }) => {
    // AEAT, Tipos IVA 2026, art. 91.Uno.2.2.º: «el suministro de comidas y bebidas para consumir en
    // el acto» → 10 %. El 21 % de las bebidas alcohólicas es el de su ENTREGA como producto.
    const texto = await textoDelCuerpo(page);
    expect(texto).not.toMatch(/Bebidas alcohólicas:\s*21\s*%/);
    expect(texto).not.toMatch(/21\s*%\s*en alcohol/);
  });

  // HALLAZGO 4638 (14/11/2026, REPARADO) — F: el recargo por presentar tarde parte del 1 %, no del 5 %.
  test('Datos · presentar el 303 fuera de plazo: el recargo no es «mínimo del 5 %»', async ({ page }) => {
    // ESCALA_RECARGO_EXTEMPORANEO (art. 27.2 LGT): 1 % más 1 % por cada mes completo de retraso.
    const texto = await textoDelCuerpo(page);
    expect(texto).not.toMatch(/recargo mínimo del 5\s*%/);
    expect(texto).toMatch(/recargo del 1\s% más otro 1\s% por cada mes completo de retraso/);
  });

  // HALLAZGO 4639 (14/11/2026, REPARADO) — G: el FAQPage ponía al 10 % lo que va al 21 % o al 4 %.
  test('FAQPage · «IVA al 10 %» no incluye la asistencia sanitaria ni los zoológicos (21 %)', async ({ page }) => {
    const pregunta = (await faqPage(page)).find((q) => /IVA al 10/.test(q.name));
    expect(pregunta, 'la pregunta del 10 % sigue en el FAQPage').toBeTruthy();
    // AEAT, Tipos IVA 2026: asistencia sanitaria no exenta 21 %; entrada a zoológicos 21 %;
    // aceites de oliva 4 % (art. 91.Dos.1.1.º).
    expect(pregunta!.text).not.toMatch(/asistencia sanitaria/i);
    expect(pregunta!.text).not.toMatch(/zool[óo]gicos/i);
    expect(pregunta!.text).toMatch(/aceite de oliva va al 4\s%/);
  });

  // HALLAZGO 4640 (14/11/2026, REPARADO) — H: el IVA no se aplica en Canarias, Ceuta y Melilla.
  test('Datos · la página dice que en Canarias, Ceuta y Melilla no se aplica el IVA', async ({ page }) => {
    const texto = await textoDelCuerpo(page);
    expect(texto).toMatch(/Canarias/);
    expect(texto).toMatch(/Ceuta/);
    const primera = (await faqPage(page))[0];
    expect(primera.text).toMatch(/Canarias se aplica el IGIC, y en Ceuta y Melilla el IPSI/);
    expect(texto).toContain(FISCAL_IVA_META.fuente);
  });

  // ── Accesibilidad ──────────────────────────────────────────────────────────
  // HALLAZGO 4641 (14/11/2026, REPARADO) — I: el estado de los botones solo se veía por el color.
  test('A11y · los botones de operación y de tipo dicen cuál está activo (aria-pressed)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Añadir IVA/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Quitar IVA/ })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^21\s*%/ })).toHaveAttribute('aria-pressed', 'true');
    await elegirTipo(page, 4);
    await expect(page.getByRole('button', { name: /^4\s*%/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^21\s*%/ })).toHaveAttribute('aria-pressed', 'false');
  });

  // HALLAZGO 4641 (14/11/2026, REPARADO) — I: el resultado aparecía sin que el lector de pantalla lo anunciara.
  test('A11y · el resultado se pinta dentro de una región aria-live montada desde el principio', async ({ page }) => {
    const region = page.locator('[aria-live]').filter({ has: page.getByText(/Introduce un importe/) });
    await expect(region).toHaveCount(1);
    await escribir(page, '100');
    await calcular(page);
    await expect(page.locator('[aria-live]').filter({ hasText: '121,00' })).toHaveCount(1);
  });

  // ── Formato y contenido ────────────────────────────────────────────────────
  // HALLAZGO 4642 (14/11/2026, REPARADO) — J: «21%» pegado; la norma es «21 %» con espacio duro.
  test('Formato · el rótulo de la cuota separa el «%» con espacio duro', async ({ page }) => {
    await escribir(page, '100');
    await calcular(page);
    const rotulo = (await page.getByRole('heading', { level: 3, name: /^Cuota IVA/ }).textContent()) ?? '';
    expect(rotulo).toBe('Cuota IVA (21 %)');
    await expect(page.getByRole('button', { name: /^4\s*%/ })).toContainText('4 %');
    expect(await page.title()).toContain('21 %');
    await expect(page.getByRole('heading', { level: 3, name: /^Cuota IVA/ })).toHaveText('Cuota IVA (21 %)');
  });

  // HALLAZGO 4643 (14/11/2026, REPARADO) — K: features vacía.
  test('JSON-LD · features con al menos 4 características', async ({ page }) => {
    const app = await ldDeTipo(page, 'WebApplication');
    expect((app.featureList as string[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  // HALLAZGO 4644 (14/11/2026, REPARADO) — L: la misma pregunta, redactada dos veces y con dos respuestas.
  test('FAQ · la pregunta de si el autónomo cobra IVA tiene UNA respuesta en la página y en el FAQPage', async ({ page }) => {
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const visible = page.getByRole('heading', { level: 4, name: /cobrar IVA si soy autónomo/ });
    const preguntaVisible = ((await visible.textContent()) ?? '').trim();
    const respuestaVisible = ((await visible.locator('xpath=following-sibling::p[1]').textContent()) ?? '').trim();
    const enFaqPage = (await faqPage(page)).filter((q) => /autónomo/i.test(q.name) && /cobrar IVA/i.test(q.name));
    expect(enFaqPage).toEqual([{ name: preguntaVisible, text: respuestaVisible }]);
  });

  // ABIERTO — hallazgo de C0748 (Inspector, 14/11/2026, modo cabo).
  // Hoy, en la FAQ visible y en el FAQPage (PREGUNTAS_FRECUENTES de metadata.ts): «Sin embargo, el
  // IVA no deducible (gastos personales) sí es gasto deducible en IRPF.»
  // ESPERADO: el IVA de un gasto personal NO es gasto deducible en el IRPF; lo que entra como gasto
  // es el IVA soportado no deducible de un gasto AFECTO a la actividad, como parte de su coste.
  // FUENTES (BOE, leídas el 14/11/2026):
  //   · Ley 35/2006 (IRPF), art. 28.1: «El rendimiento neto de las actividades económicas se
  //     determinará según las normas del Impuesto sobre Sociedades».
  //   · Ley 35/2006, art. 29.1.b): «No se consideran afectos los bienes de esparcimiento y recreo
  //     o, en general, de uso particular del titular de la actividad económica».
  //   · Ley 37/1992 (IVA), art. 95.Uno: no se deducen las cuotas de bienes o servicios «que no se
  //     afecten, directa y exclusivamente, a su actividad empresarial o profesional».
  //   · RD 1514/2007 (PGC), norma de registro y valoración 12.ª: «El IVA soportado no deducible
  //     formará parte del precio de adquisición de los activos corrientes y no corrientes», y de
  //     los servicios, objeto de las operaciones gravadas.
  // El caso afirma lo correcto: ninguna frase de la respuesta da por deducible en el IRPF el IVA de
  // un gasto personal, y la que diga que el IVA no deducible es gasto en el IRPF lo ata a la
  // actividad (afecto). Se mira en la página y en el JSON-LD servido, que comparten constante.
  test('FAQ · «¿El IVA afecta al IRPF?» no da por deducible en el IRPF el IVA de un gasto personal', async ({ page }) => {
    test.fail();
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const visible = page.getByRole('heading', { level: 4, name: /El IVA afecta al IRPF/ });
    const respuestaVisible = ((await visible.locator('xpath=following-sibling::p[1]').textContent()) ?? '').trim();
    const enFaqPage = (await faqPage(page)).find((q) => /El IVA afecta al IRPF/.test(q.name));
    expect(enFaqPage, 'la pregunta sigue en el FAQPage').toBeTruthy();

    for (const [donde, respuesta] of [
      ['FAQ visible', respuestaVisible],
      ['FAQPage', enFaqPage!.text],
    ] as const) {
      expect(respuesta, `${donde}: hay respuesta`).not.toBe('');
      const frasesDeGastoIrpf = respuesta
        .split(/(?<=\.)\s+/)
        .filter((f) => /IRPF/.test(f) && /gasto/i.test(f) && /deducible/i.test(f));
      for (const frase of frasesDeGastoIrpf) {
        expect(frase, `${donde}: el IVA de un gasto personal no es gasto del IRPF (art. 29.1.b LIRPF)`).not.toMatch(/personal/i);
        expect(frase, `${donde}: el IVA no deducible cuenta en el IRPF solo si el gasto es afecto`).toMatch(/afect|actividad/i);
      }
    }
  });
});

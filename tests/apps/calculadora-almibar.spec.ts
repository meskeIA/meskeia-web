import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-almibar (segmento motor, riesgo 3 · vertical Coquinum)
 *
 * Primera inspección: 16/11/2026. La app promete en su <h1> «Calculadora de almíbar» y en su
 * subtítulo «Azúcar y agua para tu almíbar según el uso, con el °Brix resultante». Hay verdad
 * comprobable con lápiz: el reparto de una cantidad en gramos según la proporción azúcar:agua del
 * uso elegido, y el °Brix de la mezcla.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/almibar.ts → calcularAlmibar(partesAzucar, partesAgua, cantidad)
 *     · azúcar_g = cantidad × azúcar / (azúcar + agua) · agua_g = cantidad × agua / (azúcar + agua)
 *     · brix = azúcar_g / (azúcar_g + agua_g) × 100, las tres cifras con Math.round
 *     · usos: ligero 1:2 · medio 1:1 · denso 2:1 (partes EN PESO: la salida son gramos)
 *   app/calculadora-almibar/page.tsx → solo vista; parsea con parseFloat(v.replace(',', '.')) || 0.
 *
 * °Brix = gramos de sacarosa por 100 g de disolución. En un almíbar de solo sacarosa y agua es la
 * fracción en masa × 100, que es lo que calcula el motor: la cuenta es la propia definición.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal)
 *     ligero 1:2 · 450 g → 450 × 1/3 = 150 g azúcar · 450 × 2/3 = 300 g agua · 150/450 = 33,33 → 33 °Bx
 *     medio  1:1 · 300 g → 150 g · 150 g · 150/300 = 50 °Bx
 *     denso  2:1 · 750 g → 500 g · 250 g · 500/750 = 66,67 → 67 °Bx
 *
 *   CASO 2 (límite)
 *     1.000.000 g medio → 500.000 g · 500.000 g · 50 °Bx (formato es-ES: «500.000»)
 *     1500 g denso → 1000 g · 500 g · 67 °Bx (cuatro cifras: es-ES no agrupa, «1000» es correcto)
 *     0 g → sin resultado.
 *     La proporción más alta que ofrece la app es 2:1 = 66,7 % en masa, que es justo la
 *     solubilidad de la sacarosa a 25 °C: «Solubility in water, g/100ml at 25 °C: 200»
 *     (ILO-WHO ICSC, citada en PubChem CID 5988) → 200 / (200 + 100) = 66,7 %; AQUASOL da
 *     2,12 × 10⁶ mg/L a 25 °C → 2120 / 3120 = 67,9 %. El denso cabe disuelto a temperatura
 *     ambiente; no hay en la app ninguna opción por encima de la saturación.
 *
 *   CASO 3 (rechazo)
 *     «-200», «abc», «» y «   » → ningún resultado, solo «Introduce la cantidad de almíbar.»
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/calculadora-almibar/';
const CANTIDAD = '#cantidad';
const PLACEHOLDER = 'Introduce la cantidad de almíbar.';

/** Escribe la cantidad como lo haría el usuario y espera a que llegue al estado de React. */
async function ponerCantidad(page: Page, valor: string): Promise<void> {
  await page.locator(CANTIDAD).fill(valor);
  await esperarValorEnReact(page, CANTIDAD, valor);
}

/** Elige el uso por su botón conmutador. */
async function elegirUso(page: Page, uso: 'Ligero' | 'Medio' | 'Denso'): Promise<void> {
  const boton = page
    .getByRole('group', { name: 'Uso del almíbar' })
    .getByRole('button', { name: new RegExp(`^${uso}`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** El texto de la región de resultado, o null si no hay resultado. */
async function resultado(page: Page): Promise<string | null> {
  const region = page.locator('main [role="status"]');
  if ((await region.count()) === 0) return null;
  return (await region.innerText()).replace(/\s+/g, ' ').trim();
}

/** El texto del FAQPage del JSON-LD. */
async function faqJsonLd(page: Page): Promise<{ name: string; acceptedAnswer: { text: string } }[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const datos = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (datos['@type'] === 'FAQPage' && datos.mainEntity) return datos.mainEntity;
  }
  throw new Error('La página no lleva FAQPage en su JSON-LD');
}

test.describe('Calculadora de almíbar — lo que promete el <h1>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calculadora de almíbar');
    // El <h1> viaja en el HTML servido: está en pantalla antes de que la app responda a nada.
    await esperarHidratacion(page, [CANTIDAD]);
  });

  test('CASO 1 (normal) · ligero 1:2 con 450 g = 150 g de azúcar, 300 g de agua y 33 °Bx', async ({ page }) => {
    // 450 × 1/3 = 150 · 450 × 2/3 = 300 · 150 / 450 = 33,33 % → 33 °Bx
    await elegirUso(page, 'Ligero');
    await ponerCantidad(page, '450');
    expect(await resultado(page)).toBe('150 g azúcar 300 g agua 33 °Bx concentración (ratio 1:2)');
  });

  test('CASO 1 (normal) · medio 1:1 con 300 g = 150 g + 150 g y 50 °Bx', async ({ page }) => {
    // Se parte de OTRO estado (ligero, 450 g): el medio con 300 g es el inicial y sembrarlo a
    // secas no probaría nada.
    await elegirUso(page, 'Ligero');
    await ponerCantidad(page, '450');
    await elegirUso(page, 'Medio');
    await ponerCantidad(page, '300');
    // 300 / 2 = 150 · 150 / 300 = 50 %
    expect(await resultado(page)).toBe('150 g azúcar 150 g agua 50 °Bx concentración (ratio 1:1)');
  });

  test('CASO 1 (normal) · denso 2:1 con 750 g = 500 g de azúcar, 250 g de agua y 67 °Bx', async ({ page }) => {
    // 750 × 2/3 = 500 · 750 × 1/3 = 250 · 500 / 750 = 66,67 % → 67 °Bx
    await elegirUso(page, 'Denso');
    await ponerCantidad(page, '750');
    expect(await resultado(page)).toBe('500 g azúcar 250 g agua 67 °Bx concentración (ratio 2:1)');
  });

  test('CASO 1 (normal) · el °Brix es la fracción EN MASA de azúcar: cuadra con los gramos que enseña', async ({ page }) => {
    // Para cada uso, round(azúcar / (azúcar + agua) × 100) con los gramos de la pantalla tiene que
    // dar el °Brix de la pantalla (con cantidades grandes el redondeo de los gramos no lo mueve).
    for (const [uso, cantidad] of [['Ligero', '900'], ['Medio', '800'], ['Denso', '600']] as const) {
      await elegirUso(page, uso);
      await ponerCantidad(page, cantidad);
      const texto = (await resultado(page)) ?? '';
      const m = texto.match(/^([\d.]+) g azúcar ([\d.]+) g agua (\d+) °Bx/);
      expect(m, `${uso} ${cantidad}: «${texto}»`).not.toBeNull();
      const azucar = Number(m![1].replace(/\./g, ''));
      const agua = Number(m![2].replace(/\./g, ''));
      expect(azucar + agua, `${uso}: los gramos suman la cantidad pedida`).toBe(Number(cantidad));
      expect(Number(m![3]), `${uso}: °Brix`).toBe(Math.round((azucar / (azucar + agua)) * 100));
    }
  });

  test('CASO 2 (límite) · un millón de gramos: 500.000 g + 500.000 g, con separador de millar', async ({ page }) => {
    await ponerCantidad(page, '1000000');
    expect(await resultado(page)).toBe('500.000 g azúcar 500.000 g agua 50 °Bx concentración (ratio 1:1)');
  });

  test('CASO 2 (límite) · denso con 1500 g: «1000 g» sin punto (cuatro cifras, es-ES no agrupa)', async ({ page }) => {
    // 1500 × 2/3 = 1000 · 1500 × 1/3 = 500 · 67 °Bx. El denso (2:1 = 66,7 %) es la proporción
    // más alta que ofrece la app y coincide con la solubilidad de la sacarosa a 25 °C (ICSC:
    // 200 g/100 mL → 66,7 %): no hay opción que pida disolver más azúcar del que admite el agua.
    await elegirUso(page, 'Denso');
    await ponerCantidad(page, '1500');
    expect(await resultado(page)).toBe('1000 g azúcar 500 g agua 67 °Bx concentración (ratio 2:1)');
  });

  test('CASO 2 (límite) · cero gramos no da resultado', async ({ page }) => {
    await ponerCantidad(page, '0');
    expect(await resultado(page)).toBeNull();
    await expect(page.getByText(PLACEHOLDER)).toBeVisible();
  });

  test('CASO 3 (rechazo) · negativo, texto, vacío y espacios no producen resultado', async ({ page }) => {
    for (const entrada of ['-200', 'abc', '', '   ']) {
      await ponerCantidad(page, entrada);
      expect(await resultado(page), `«${entrada}»`).toBeNull();
      await expect(page.getByText(PLACEHOLDER), `«${entrada}»`).toBeVisible();
    }
  });

  test('ACCESIBILIDAD · los tres usos son conmutadores con type="button" y aria-pressed', async ({ page }) => {
    const botones = page.getByRole('group', { name: 'Uso del almíbar' }).getByRole('button');
    await expect(botones).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(botones.nth(i)).toHaveAttribute('type', 'button');
      await expect(botones.nth(i)).toHaveAttribute('aria-pressed', i === 1 ? 'true' : 'false');
    }
  });

  test('REPARADO (hallazgo 4899) · «1.500» es mil quinientos en formato español, no 1,5 g', async ({ page }) => {
    // REPARADO: page.tsx parseaba con parseFloat(v.replace(',', '.')): «1.500» → 1,5 g → 0,75 →
    // round = 1 g de azúcar y 1 g de agua; «1.234,5» → «1.234.5» → 1,234 → 1 g y 1 g. Ahora,
    // parseSpanishNumber de @/lib.
    // Esperado: 1500 / 2 = 750 g + 750 g · 1234,5 / 2 = 617,25 → 617 g + 617 g.
    await ponerCantidad(page, '1.500');
    expect(await resultado(page)).toBe('750 g azúcar 750 g agua 50 °Bx concentración (ratio 1:1)');
    await ponerCantidad(page, '1.234,5');
    expect(await resultado(page)).toBe('617 g azúcar 617 g agua 50 °Bx concentración (ratio 1:1)');
  });

  test('REPARADO (hallazgo 4899) · lo que no es un número se rechaza («12abc», «1e3»)', async ({ page }) => {
    // REPARADO: parseFloat se quedaba con el prefijo: «12abc» → 6 g + 6 g; «1e3» → 500 g + 500 g.
    for (const basura of ['12abc', '1e3']) {
      await ponerCantidad(page, basura);
      expect(await resultado(page), `«${basura}» no debería producir resultado`).toBeNull();
    }
  });

  test('HALLAZGO · una cantidad minúscula no enseña «0 g de azúcar» con 33 °Bx', async ({ page }) => {
    // ABIERTO: ligero con 1 g → 0,33 → round 0 g de azúcar, 1 g de agua y «33 °Bx»; con «0,5» →
    // 0 g y 0 g y «33 °Bx». Cero gramos de azúcar no pueden tener 33 °Bx: o decimales o aviso.
    test.fail();
    await elegirUso(page, 'Ligero');
    for (const minima of ['1', '0,5']) {
      await ponerCantidad(page, minima);
      expect(await resultado(page) ?? '', `«${minima}»`).not.toMatch(/(^|\s)0 g azúcar/);
    }
  });

  test('HALLAZGO · la entrada no válida se anuncia en una región viva', async ({ page }) => {
    // ABIERTO: el role="status" solo existe mientras hay resultado; con «-200» desaparece y el
    // mensaje de espera es un <p> sin rol ni aria-live: el lector de pantalla no dice nada.
    test.fail();
    await ponerCantidad(page, '-200');
    await expect(
      page.locator('main [role="status"], main [role="alert"], main [aria-live]').filter({ hasText: /Introduce|cantidad/ }),
    ).toHaveCount(1);
  });

  test('HALLAZGO · la tabla educativa da para 2:1 el mismo °Brix que la calculadora (67)', async ({ page }) => {
    // ABIERTO: la tabla «Usos y proporciones» dice 66 °Brix para 2:1; la calculadora muestra
    // 67 °Bx para la misma proporción (2/3 = 66,67 %: redondea a 67, la tabla trunca).
    test.fail();
    const celda = page.locator('table tbody tr').filter({ hasText: '2:1' }).locator('td').nth(2);
    expect(((await celda.textContent()) ?? '').trim()).toMatch(/^(67|66,7)$/);
  });

  test('HALLAZGO · la proporción dice que es EN PESO (tabla y FAQ)', async ({ page }) => {
    // ABIERTO: los °Brix de la tabla (33, 50, 66) son m_azúcar / m_total y solo valen si la
    // proporción es en peso (100 g / (100 + 200) g = 33,3 %). Ni la tabla, ni la FAQ del JSON-LD,
    // ni la etiqueta «ratio 1:1» lo dicen; «1:1» en tazas no es 1:1 en gramos.
    test.fail();
    const seccionTabla = await page.locator('table').evaluate((t) => t.parentElement?.textContent ?? '');
    expect(seccionTabla).toMatch(/peso/i);
    const faq = await faqJsonLd(page);
    expect(faq[0].acceptedAnswer.text).toMatch(/peso/i);
  });

  test('HALLAZGO · las preguntas del FAQPage están también en la página', async ({ page }) => {
    // ABIERTO: el JSON-LD declara cinco preguntas que la página no pinta en ninguna parte
    // (CLAUDE.md §1.ter: faqJsonLd y la FAQ visible salen del mismo PREGUNTAS_FRECUENTES).
    test.fail();
    const preguntas = (await faqJsonLd(page)).map((p) => p.name);
    expect(preguntas).toHaveLength(5);
    const textoPagina = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script').forEach((s) => s.remove());
      return copia.textContent ?? '';
    });
    for (const p of preguntas) expect(textoPagina, p).toContain(p);
  });

  test('REPARADO (hallazgo 4935, cabo C0790) · el aviso del almíbar caliente no afirma sin fuente que «reseca» el bizcocho', async ({ page }) => {
    // REPARADO 17/11/2026: retirada la explicación; queda la instrucción, como en la FAQ.
    // Antes: la caja «A tener en cuenta» de la guía dice «Deja enfriar antes de calar. El almíbar
    // caliente reseca el bizcocho en vez de dar jugosidad.» No hay fuente accesible de la red de
    // fuentes oficiales que trate la temperatura del almíbar al calar (AESAN da 403; BOE, EFSA y
    // el resto no tratan técnica de repostería), y la afirmación es incoherente por sí misma: un
    // almíbar es sobre todo agua, y empapar la miga con él le AÑADE humedad, no se la quita. Lo que
    // suele enseñarse es otra cosa (temperaturas opuestas para que se absorba sin deshacer la
    // miga), tampoco anclado aquí. Esperado: el aviso matizado sin «reseca» o retirado (C0203).
    const guia = page.getByRole('button', { name: /guía educativa/ });
    await guia.click();
    await expect(guia).toHaveAttribute('aria-expanded', 'true');
    const avisos = page.locator('main li').filter({ hasText: /almíbar caliente/i });
    for (const texto of await avisos.allInnerTexts()) {
      expect(texto, 'aviso del almíbar caliente').not.toMatch(/resec/i);
    }
    const instruccion = page.locator('main li').filter({ hasText: 'Deja enfriar antes de calar' });
    await expect(instruccion).toHaveCount(1);
    await expect(instruccion).not.toContainText(/resec/i);
  });

  test('HALLAZGO · el porcentaje del FAQPage va separado de la cifra («50 %»)', async ({ page }) => {
    // ABIERTO: «Un almíbar al 50% de azúcar tiene 50 °Brix» pega el % a la cifra (CLAUDE.md §2:
    // separado con espacio duro U+00A0).
    test.fail();
    const textos = (await faqJsonLd(page)).map((p) => p.acceptedAnswer.text).join(' ');
    expect(textos).not.toMatch(/\d%|\d %/);
  });
});

test.describe('Lo que se promete de esta app desde otras', () => {
  test('HALLAZGO · la tarjeta de calculadora-merengue no promete un almíbar a 118 °C que esta app no calcula', async ({ page }) => {
    // ABIERTO: data/app-relations.ts, bloque 'calculadora-merengue': «Almíbar — El almíbar a
    // 118 °C del merengue italiano». Esta app no da ninguna temperatura (solo proporción y °Brix)
    // y su propio texto remite a la calculadora de puntos del azúcar para la temperatura.
    test.fail();
    await page.goto('/calculadora-merengue/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const tarjeta = page.locator('a[href^="/calculadora-almibar/"]');
    await expect(tarjeta).toHaveCount(1);
    const prometeTemperatura = /118\s*°C/.test((await tarjeta.textContent()) ?? '');

    await page.goto(RUTA);
    const daTemperatura = /118\s*°C/.test((await page.locator('main').textContent()) ?? '');
    expect(prometeTemperatura && !daTemperatura).toBe(false);
  });
});

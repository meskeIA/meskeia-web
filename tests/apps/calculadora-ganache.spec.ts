import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * Inspector — calculadora-ganache (segmento motor · Coquinum, riesgo 3)
 *
 * Primera inspección: 14/11/2026. La app promete en su <h1> «Calculadora de Ganache» y en el
 * subtítulo «Proporciones exactas de chocolate y nata según tipo y textura». Hay verdad
 * comprobable: la aritmética de un ratio declarado por la propia app.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   lib/calculadoras/cocina.ts → calcularGanache(tipo, textura, total):
 *     chocolate = Math.round(total × r / (r + 1)) · nata = total − chocolate
 *   Lo comparte el MCP (app/api/mcp/route.ts, herramienta calcular_ganache): un defecto del motor
 *   (el «2.2:1», las marcas, el «0% cacao») llega también a los asistentes de IA.
 *   app/calculadora-ganache/page.tsx lee la cantidad con
 *     value.replace(/[^0-9]/g, '') y parseInt(…) || 200
 *   así que borra comas, puntos, signos y la «e», y un 0 o un vacío pasan a 200 g.
 *
 * RATIOS (chocolate : nata) — de la tabla educativa de la propia app, iguales a RATIOS_GANACHE
 *   Negro Extra 1 / 2 / 3 · Negro 1,2 / 2,2 / 3 · Semi-fondant 1,5 / 2,5 / 3,5
 *   Con Leche 2 / 3 / 4 · Blanco 3 / 4 / 5          (glaseado / trufa / firme)
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   (.inspector-trabajo/calculadora-ganache-esperados.mjs)
 *   CASO 1 (normal)
 *     Estado inicial, Negro + Trufa, 200 g → 200 × 2,2 / 3,2 = 137,5 → 138 g · nata 62 g
 *     Cobertura: Negro + Glaseado, 500 g → 500 × 1,2 / 2,2 = 272,73 → 273 g · nata 227 g
 *     Tabla de 200 g, las 15 celdas (abajo, en el test)
 *   CASO 2 (límite)
 *     Blanco + Firme (el ratio extremo, 5:1), 50 g (mínimo) → 41,67 → 42 g · nata 8 g
 *     Blanco + Firme, 5000 g (máximo del input) → 4166,67 → 4167 g · nata 833 g
 *     Con Leche + Glaseado, 300 g → 200 g · nata 100 g
 *     0 g, 30 g (bajo el mínimo de 50 g que declara) y 12000 g (sobre el máximo) → aviso, no cifras
 *   CASO 3 (rechazo / lectura en español)
 *     «1.500» = mil quinientos → 1500 × 1,2 / 2,2 = 818,18 → 818 g · nata 682 g
 *     «250,5» → 250,5 g (137 g / 113,5 g) o un aviso; nunca 2505 g
 *     «-100» y «1e3» → aviso; nunca 100 g ni 13 g
 *
 * REPARADOS en /reparar el 14/11/2026: A (4597), B (4598), C (4599), D (4600), E (4601), G (4603),
 * H (4604) e I (4605). El campo es de texto y se lee con parseSpanishNumber; fuera de [50, 5000]
 * o ilegible, aviso y ninguna cifra. Los rangos de cacao pasan a 70–99 / 55–69 / 40–54 / 28–39.
 * SIGUE ABIERTO F (4602, marcas): corregir o retirar las marcas lo decide el usuario.
 *
 * HALLAZGOS del 14/11/2026 (los abiertos llevan test.fail())
 *   A. La cantidad se lee borrando todo lo que no es cifra: «250,5» → 2505 g, «-100» → 100 g,
 *      «1e3» → 13 g.
 *   B. Sin validación de rango: 0 g da proporciones para 200 g, 30 g y 12000 g se calculan sin aviso.
 *   C. El FAQPage del JSON-LD contradice al motor (ratios y temperatura de la trufa) y no se ve en
 *      la página.
 *   D. El bloque educativo contradice al motor (trufas «2:1 (negro) — 400 g / 200 g») y los rangos
 *      de cacao se solapan (70 % es Negro Extra y Negro a la vez).
 *   E. Formato: «2.2:1» con punto decimal, «%» pegado y «109g» sin espacio en la tabla.
 *   F. «Marcas de referencia»: Callebaut W2 sale como chocolate con leche y como blanco.
 *      RESUELTO (C0742): el bloque se retiró de la app y del MCP.
 *   G. «0% cacao» para el blanco, que por el RD 1055/2003 lleva al menos un 20 % de manteca de cacao.
 *   H. «Los bombones con relleno de trufa duran 2–3 semanas en nevera», sin fuente.
 *   I. La región aria-live del resultado nace con el resultado dentro.
 */

const RUTA = '/calculadora-ganache/';
const INPUT = '#totalGanache';

type Tipo = 'negro_extra' | 'negro' | 'semi_fondant' | 'con_leche' | 'blanco';
type Textura = 'glaseado' | 'trufa' | 'firme';

const BOTON_TIPO: Record<Tipo, RegExp> = {
  negro_extra: /^Negro Extra/,
  negro: /^Negro 55/,
  semi_fondant: /^Semi-fondant/,
  con_leche: /^Con Leche/,
  blanco: /^Blanco/,
};
const BOTON_TEXTURA: Record<Textura, RegExp> = {
  glaseado: /^Glaseado/,
  trufa: /^Trufa/,
  firme: /^Firme/,
};

/** La zona de resultado de la app (no el anunciador de rutas de Next). */
function zonaResultado(page: Page): Locator {
  return page.getByRole('region', { name: 'Resultado del cálculo' });
}

async function elegir(page: Page, tipo?: Tipo, textura?: Textura): Promise<void> {
  if (tipo) {
    const boton = page.getByRole('button', { name: BOTON_TIPO[tipo] });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
  if (textura) {
    const boton = page.getByRole('button', { name: BOTON_TEXTURA[textura] });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
}

/** Una cantidad válida para el input numérico, comprobando que llegó al estado de React. */
async function escribir(page: Page, gramos: string): Promise<void> {
  await page.locator(INPUT).fill(gramos);
  await esperarValorEnReact(page, INPUT, gramos);
}

/** Teclea como un usuario (fill() no admite «250,5» en un input numérico). */
async function teclear(page: Page, texto: string): Promise<void> {
  const input = page.locator(INPUT);
  await input.click();
  await input.press('Control+a');
  await input.press('Backspace');
  await esperarValorEnReact(page, INPUT, '');
  await input.pressSequentially(texto);
}

async function pulsarCalcular(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Calcular proporciones' }).click();
}

interface Cifras {
  titulo: string;
  chocolate: string;
  nata: string;
  total: string;
  cacao: string;
}

async function leerCifras(page: Page): Promise<Cifras> {
  const zona = zonaResultado(page);
  await expect(zona).toBeVisible();
  const valores = (await zona.locator('[class$="_propValor"]').allTextContents()).map((t) => t.trim());
  const subs = (await zona.locator('[class$="_propSub"]').allTextContents()).map((t) => t.trim());
  return {
    titulo: ((await zona.locator('h2').textContent()) ?? '').trim(),
    chocolate: valores[0],
    nata: valores[1],
    total: valores[2],
    cacao: subs[0],
  };
}

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

async function respuestaFaq(page: Page, pregunta: RegExp): Promise<string> {
  const faq = await ldDeTipo(page, 'FAQPage');
  const entradas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  const hallada = entradas.find((q) => pregunta.test(q.name));
  if (!hallada) throw new Error(`El FAQPage no trae ninguna pregunta que case con ${pregunta}`);
  return hallada.acceptedAnswer.text;
}

test.describe('calculadora-ganache — Inspector 14/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [INPUT]);
  });

  // ── CASO 1 · normal ────────────────────────────────────────────────────────
  test('CASO 1 · estado inicial (Negro, Trufa, 200 g): 138 g de chocolate y 62 g de nata', async ({ page }) => {
    // 200 × 2,2 / 3,2 = 137,5 → Math.round = 138; nata = 200 − 138 = 62
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    expect(c.titulo).toBe('Proporciones para 200 g de ganache');
    expect([c.chocolate, c.nata, c.total]).toEqual(['138 g', '62 g', '200 g']);
  });

  test('CASO 1 · cobertura: Negro + Glaseado, 500 g → 273 g de chocolate y 227 g de nata', async ({ page }) => {
    // 500 × 1,2 / 2,2 = 272,727 → 273; nata = 227
    await elegir(page, 'negro', 'glaseado');
    await escribir(page, '500');
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    expect(c.titulo).toBe('Proporciones para 500 g de ganache');
    expect([c.chocolate, c.nata, c.total]).toEqual(['273 g', '227 g', '500 g']);
    await expect(zonaResultado(page)).toContainText('30–32');
  });

  test('CASO 1 · la tabla de 200 g cuadra con la fórmula en sus 15 celdas', async ({ page }) => {
    // chocolate = round(200 × r / (r + 1)), nata = 200 − chocolate, con los ratios de la cabecera
    const esperado = [
      [[100, 100], [133, 67], [150, 50]], // Negro Extra 1 / 2 / 3
      [[109, 91], [138, 62], [150, 50]], // Negro 1,2 / 2,2 / 3
      [[120, 80], [143, 57], [156, 44]], // Semi-fondant 1,5 / 2,5 / 3,5
      [[133, 67], [150, 50], [160, 40]], // Con Leche 2 / 3 / 4
      [[150, 50], [160, 40], [167, 33]], // Blanco 3 / 4 / 5
    ];
    const filas = await page
      .getByRole('table')
      .first()
      .locator('tbody tr')
      .evaluateAll((trs) => trs.map((tr) => Array.from(tr.querySelectorAll('td')).slice(1).map((td) => td.textContent ?? '')));
    const leidas = filas.map((fila) =>
      fila.map((celda) => {
        const m = celda.match(/(\d+)\s*g\s*\/\s*(\d+)\s*g/);
        return m ? [Number(m[1]), Number(m[2])] : [NaN, NaN];
      }),
    );
    expect(leidas).toEqual(esperado);
  });

  // ── CASO 2 · límite ────────────────────────────────────────────────────────
  test('CASO 2 · Blanco + Firme (5:1) en el mínimo y en el máximo del campo', async ({ page }) => {
    // 50 × 5 / 6 = 41,67 → 42; nata 8 · 5000 × 5 / 6 = 4166,67 → 4167; nata 833
    await elegir(page, 'blanco', 'firme');
    await escribir(page, '50');
    await pulsarCalcular(page);
    let c = await leerCifras(page);
    expect([c.chocolate, c.nata, c.total]).toEqual(['42 g', '8 g', '50 g']);
    await expect(zonaResultado(page)).toContainText('5:1');

    await escribir(page, '5000');
    await pulsarCalcular(page);
    c = await leerCifras(page);
    expect([c.chocolate, c.nata, c.total]).toEqual(['4167 g', '833 g', '5000 g']);
  });

  test('CASO 2 · Con Leche + Glaseado (2:1), 300 g → 200 g de chocolate y 100 g de nata', async ({ page }) => {
    await elegir(page, 'con_leche', 'glaseado');
    await escribir(page, '300');
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    expect([c.chocolate, c.nata, c.total]).toEqual(['200 g', '100 g', '300 g']);
  });

  // HALLAZGO 4598 (14/11/2026, REPARADO) — B: parseInt(…) || 200 convertía el 0 en 200 g sin aviso.
  test('CASO 2 · 0 g no da las proporciones de 200 g: avisa', async ({ page }) => {
    await elegir(page, 'blanco', 'firme');
    await escribir(page, '0');
    await pulsarCalcular(page);
    // Antes: «Proporciones para 200 g de ganache», 167 g / 33 g, con un 0 en el campo
    await expect(zonaResultado(page)).toContainText('Escribe una cantidad válida en gramos');
    await expect(page.getByText('Proporciones para 200 g de ganache')).toHaveCount(0);
    await expect(page.locator(INPUT)).toHaveAttribute('aria-invalid', 'true');
  });

  // HALLAZGO 4598 (14/11/2026, REPARADO) — B: el campo decía «mínimo 50 g» (min=50, max=5000) y nadie lo aplicaba.
  test('CASO 2 · fuera del rango declarado (30 g, 12000 g) avisa y no calcula', async ({ page }) => {
    await elegir(page, 'blanco', 'firme');
    await escribir(page, '30');
    await pulsarCalcular(page);
    // Antes: «Proporciones para 30 g de ganache», 25 g / 5 g
    await expect(zonaResultado(page)).toContainText('La cantidad tiene que estar entre 50 y 5000 g.');
    await expect(page.getByText('Proporciones para 30 g de ganache')).toHaveCount(0);
    await escribir(page, '12000');
    await pulsarCalcular(page);
    // Antes: «Proporciones para 12000 g de ganache», 10000 g / 2000 g
    await expect(zonaResultado(page)).toContainText('La cantidad tiene que estar entre 50 y 5000 g.');
    await expect(page.getByText('Proporciones para 12000 g de ganache')).toHaveCount(0);
  });

  // ── CASO 3 · rechazo y lectura en español ─────────────────────────────────
  test('CASO 3 · «1.500» tecleado se lee mil quinientos: 818 g y 682 g', async ({ page }) => {
    // 1500 × 1,2 / 2,2 = 818,18 → 818; nata 682. Desde el 14/11/2026 el campo conserva lo
    // tecleado («1.500») y lo lee parseSpanishNumber.
    await elegir(page, 'negro', 'glaseado');
    await teclear(page, '1.500');
    await esperarValorEnReact(page, INPUT, '1.500');
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    expect([c.chocolate, c.nata, c.total]).toEqual(['818 g', '682 g', '1500 g']);
  });

  // HALLAZGO 4597 (14/11/2026, REPARADO) — A: replace(/[^0-9]/g, '') borraba la coma decimal.
  test('CASO 3 · «250,5» se lee 250,5 g, no 2505 g', async ({ page }) => {
    await elegir(page, 'negro', 'glaseado');
    await teclear(page, '250,5');
    await pulsarCalcular(page);
    // 250,5 × 1,2 / 2,2 = 136,64 → 137 g; nata 250,5 − 137 = 113,5 g. Antes: el campo pasaba a
    // «2505» y salía «Proporciones para 2505 g de ganache», 1366 g / 1139 g
    const c = await leerCifras(page);
    expect(c.titulo).toBe('Proporciones para 250,5 g de ganache');
    expect([c.chocolate, c.nata, c.total]).toEqual(['137 g', '113,5 g', '250,5 g']);
  });

  // HALLAZGO 4597 (14/11/2026, REPARADO) — A: el signo menos se borraba y «-100» se calculaba como 100 g.
  test('CASO 3 · «-100» se rechaza con aviso en vez de calcularse como 100 g', async ({ page }) => {
    await elegir(page, 'negro', 'glaseado');
    await teclear(page, '-100');
    await pulsarCalcular(page);
    // Antes: «Proporciones para 100 g de ganache», 55 g / 45 g
    await expect(zonaResultado(page)).toContainText('Escribe una cantidad válida en gramos');
    await expect(page.getByText('Proporciones para 100 g de ganache')).toHaveCount(0);
  });

  // HALLAZGO 4597 (14/11/2026, REPARADO) — A: «1e3» perdía la «e» y quedaba en 13.
  test('CASO 3 · «1e3» se rechaza con aviso, no se convierte en 13 g', async ({ page }) => {
    await elegir(page, 'negro', 'glaseado');
    await teclear(page, '1e3');
    await pulsarCalcular(page);
    // Antes: «Proporciones para 13 g de ganache», 7 g / 6 g
    await expect(zonaResultado(page)).toContainText('Escribe una cantidad válida en gramos');
    await expect(page.getByText('Proporciones para 13 g de ganache')).toHaveCount(0);
  });

  // ── Formato español ────────────────────────────────────────────────────────
  // HALLAZGO 4601 (14/11/2026, REPARADO) — E: ratio_texto interpolaba el número de JS («2.2»).
  test('Formato · el ratio del resultado lleva coma decimal («2,2:1»)', async ({ page }) => {
    await pulsarCalcular(page);
    // Antes: «Chocolate:Nata = 2.2:1 (2.2 partes chocolate : 1 parte nata)»
    await expect(zonaResultado(page)).toContainText('Chocolate:Nata = 2,2:1 (2,2 partes chocolate : 1 parte nata)');
    await expect(zonaResultado(page)).not.toContainText('2.2');
  });

  // HALLAZGO 4601 (14/11/2026, REPARADO) — E: «%» pegado a la cifra (CLAUDE.md global §2, 25/09/2026)
  // y «109g» sin espacio en la tabla. El rango del Negro es 55–69 desde el hallazgo 4600.
  test('Formato · el porcentaje de cacao va con espacio duro y la tabla separa la «g»', async ({ page }) => {
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    // Antes: «55–70% cacao»
    expect(c.cacao).toBe('55–69 % cacao');
    await expect(zonaResultado(page)).toContainText('Nata (35 % m.g.)');
    // Antes: «109g / 91g»
    await expect(page.getByRole('table').first().locator('tbody tr').nth(1).locator('td').nth(1))
      .toHaveText('109 g / 91 g');
  });

  // ── Contenido ──────────────────────────────────────────────────────────────
  // HALLAZGO 4599 (14/11/2026, REPARADO) — C: el FAQPage preguntaba cinco cosas que la página no mostraba.
  test('FAQPage · un solo bloque y sus preguntas están en la página', async ({ page }) => {
    await comprobarFaqPageUnico(page);
  });

  // HALLAZGO 4599 (14/11/2026, REPARADO) — C: el FAQPage daba otras cifras que el motor.
  test('FAQPage · los ratios y la temperatura de la trufa cuadran con el motor', async ({ page }) => {
    // Motor: Negro 1,2 / 2,2 / 3, Con Leche 2 / 3 / 4 y Blanco 3 / 4 / 5.
    // Antes: «…ratios de 2,5:1 o incluso 3:1 para lograr la misma textura».
    const proporcion = await respuestaFaq(page, /proporción/i);
    expect(proporcion).not.toContain('2,5:1');
    expect(proporcion).toContain('1,2:1 para glaseado, 2,2:1 para trufa');
    expect(proporcion).toContain('blanco, 3:1, 4:1 y 5:1');
    // Motor (textura trufa): «Refrigerar 2–4 h. Trabajar a 17–20 °C para bolear las trufas».
    // Antes: «…se deja enfriar a temperatura ambiente … (unos 25–28 °C)».
    const temperatura = await respuestaFaq(page, /temperatura/i);
    expect(temperatura).toContain('17–20');
    expect(temperatura).not.toContain('25–28');
  });

  // HALLAZGO 4600 (14/11/2026, REPARADO) — D: el escenario de trufas no usaba el ratio del motor para «Negro».
  test('Educativo · las trufas de chocolate negro llevan el ratio que calcula la app', async ({ page }) => {
    // La app, Negro + Trufa, 600 g: 600 × 2,2 / 3,2 = 412,5 → 413 g y 187 g (ratio 2,2:1)
    await elegir(page, 'negro', 'trufa');
    await escribir(page, '600');
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    expect([c.chocolate, c.nata]).toEqual(['413 g', '187 g']);
    // Antes: «Ratio recomendado: 2:1 (negro) — 400g chocolate / 200g nata»
    const cuerpo = await textoDelCuerpo(page);
    expect(cuerpo).not.toContain('Ratio recomendado: 2:1 (negro)');
    // textoDelCuerpo normaliza los espacios, también el duro
    expect(cuerpo).toContain('con negro, 2,2:1 (413 g de chocolate y 187 g de nata)');
  });

  // HALLAZGO 4600 (14/11/2026, REPARADO) — D: las tarjetas de textura no decían que sus ratios son del negro.
  test('Educativo · las tarjetas de textura dicen que sus ratios son del chocolate negro', async ({ page }) => {
    // Antes: «Ratio 1:1 a 2:1» (glaseado) y «Ratio 3:1 o superior» (firme): el glaseado de blanco
    // que calcula la app (3:1) caía en «Firme».
    const cuerpo = await textoDelCuerpo(page);
    expect(cuerpo).toContain('Con chocolate negro, ratio 1:1 a 1,5:1 según el cacao (con leche 2:1, blanco 3:1)');
    expect(cuerpo).not.toContain('Ratio 3:1 o superior');
  });

  // HALLAZGO 4600 (14/11/2026, REPARADO) — D: 70 % caía en «Negro Extra 70–99%» y en «Negro 55–70%».
  test('Educativo · los rangos de cacao de los tipos no se solapan', async ({ page }) => {
    const rango = async (tipo: Tipo): Promise<[number, number]> => {
      const nombre = (await page.getByRole('button', { name: BOTON_TIPO[tipo] }).textContent()) ?? '';
      const m = nombre.match(/(\d+)–(\d+)/);
      if (!m) throw new Error(`Sin rango de cacao en «${nombre}»`);
      return [Number(m[1]), Number(m[2])];
    };
    const extra = await rango('negro_extra');
    const negro = await rango('negro');
    const semi = await rango('semi_fondant');
    const leche = await rango('con_leche');
    // Antes: 70–99 / 55–70 / 40–55 / 28–40 → 70, 55 y 40 en dos tipos cada uno
    expect(negro[1]).toBeLessThan(extra[0]);
    expect(semi[1]).toBeLessThan(negro[0]);
    expect(leche[1]).toBeLessThan(semi[0]);
  });

  // HALLAZGO F (14/11/2026) — RESUELTO por decisión del usuario (C0742): el bloque se RETIRA, no se
  // corrige. Antes: con leche «Valrhona Jivara, Callebaut W2» · blanco «Callebaut W2, Valrhona Ivoire».
  test('Marcas · el resultado no cita marcas comerciales', async ({ page }) => {
    for (const tipo of ['negro_extra', 'negro', 'semi_fondant', 'con_leche', 'blanco'] as Tipo[]) {
      await elegir(page, tipo, 'trufa');
      await pulsarCalcular(page);
      const texto = ((await zonaResultado(page).textContent()) ?? '').replace(/\s+/g, ' ');
      // Control: el resultado está pintado (el rango de cacao se queda)
      expect(texto, tipo).toMatch(/cacao/);
      expect(texto, tipo).not.toMatch(/Marcas de referencia|Callebaut|Valrhona|Lindt|Nestlé/);
    }
  });

  // HALLAZGO 4603 (14/11/2026, REPARADO) — G: RD 1055/2003 (BOE-A-2003-15599), anexo 1.9: el blanco
  // lleva como mínimo un 20 % de manteca de cacao. Lo que no lleva es pasta de cacao.
  test('Dato · el chocolate blanco no se etiqueta como «0% cacao»', async ({ page }) => {
    await elegir(page, 'blanco', 'trufa');
    await pulsarCalcular(page);
    const c = await leerCifras(page);
    // Antes: «0% cacao (manteca)»
    expect(c.cacao).not.toMatch(/^0\s*%/);
    expect(c.cacao).toBe('sin pasta de cacao · ≥ 20 % de manteca');
  });

  // HALLAZGO 4604 (14/11/2026, REPARADO) — H: vida útil sin fuente (§1.quinquies, cifras sin fuente).
  test('Educativo · la vida útil de los bombones no se da sin fuente', async ({ page }) => {
    // Antes: «Los bombones con relleno de trufa duran 2–3 semanas en nevera bien tapados.»
    const cuerpo = await textoDelCuerpo(page);
    expect(cuerpo).not.toContain('duran 2–3 semanas en nevera bien tapados');
    expect(cuerpo).toContain('no hay una cifra que valga para todas las recetas');
  });

  // ── Accesibilidad ──────────────────────────────────────────────────────────
  // HALLAZGO 4605 (14/11/2026, REPARADO) — I: {calculado && <section aria-live>}: la región nacía llena.
  test('A11y · la región aria-live existe antes de que llegue el resultado', async ({ page }) => {
    // Antes: 0 regiones aria-live en <main> antes de calcular, 1 después
    const region = page.locator('main [aria-live]');
    await expect(region).toHaveCount(1);
    await expect(region).toHaveAttribute('aria-label', 'Resultado del cálculo');
    await pulsarCalcular(page);
    await expect(region).toHaveCount(1);
    await expect(region).toContainText('Proporciones para 200 g de ganache');
  });

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  test('JSON-LD · features con al menos 4 características', async ({ page }) => {
    const app = await ldDeTipo(page, 'WebApplication');
    const lista = (app.featureList ?? app.features) as string[];
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });
});

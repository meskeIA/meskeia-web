/**
 * Estimador del Impuesto de Donaciones — primera inspección (Inspector, 25/09/2026)
 *
 * Qué se inspeccionó: la liquidación completa que hace la app (valor − cargas − reducciones →
 * tarifa del art. 21.2 LISD → coeficiente del art. 22 → bonificación autonómica), el selector
 * de parentesco, los textos del aviso siempre visible y del bloque educativo, el formato
 * español, la accesibilidad del formulario y el modo oscuro.
 *
 * Por qué: era su primera inspección, y se venía además por una sospecha vista por grep en la
 * familia fiscal —la fecha `FISCAL_DONACIONES_META.verificado` impresa en ISO en el hero, la
 * forma del hallazgo 1657 de estimador-sueldo-neto—. Medida en pantalla: «Datos verificados:
 * 2025-01-01», mientras el <DataReference> de la misma página dice «01/01/2025».
 *
 * De dónde salen los valores esperados. La app mezcla la tarifa estatal con las bonificaciones
 * de cada comunidad, así que los casos se anclan en UNA comunidad cuya ley se leyó en sesión
 * (API de legislación consolidada del BOE, 25/09/2026):
 *   · LISD (Ley 29/1987, BOE-A-1987-28141): art. 20.2 —las reducciones por parentesco y por
 *     discapacidad son de las adquisiciones «mortis causa»—; art. 20.5 —en las donaciones, sin
 *     reducción autonómica propia, «la base liquidable coincidirá, en todo caso, con la
 *     imponible»—; art. 21.2 (tarifa); art. 22.2 (coeficientes); art. 30.1 (acumulación de
 *     donaciones «dentro del plazo de tres años»).
 *   · Castilla-La Mancha, Ley 8/2013 (BOE-A-2014-1368): no tiene tarifa ni coeficientes propios
 *     ni reducción por parentesco en donaciones (arts. 14-16 bis: empresa y patrimonio cultural;
 *     el art. 15, discapacidad, solo «mortis causa»). Bonificación inter vivos del art. 17 bis:
 *     Grupos I y II, 95 % si la base liquidable es inferior a 120.000 €, 90 % de 120.000 a
 *     240.000 € y 85 % desde 240.000 €; exige escritura pública (art. 18.3.a).
 *   · Ley 22/2009 (BOE-A-2009-20375), art. 32.2.b: la donación de un INMUEBLE tributa en la
 *     comunidad donde radica; la residencia del donatario manda solo en los demás bienes (32.2.c).
 *   · RISD (RD 1629/1991, BOE-A-1991-27678), art. 67.1.b: plazo de «treinta días hábiles».
 *
 * REPARACIÓN (25/09/2026): los 18 hallazgos se repararon el mismo día. La app dejó de repetir la
 * aritmética y usa `lib/calculadoras/donaciones.ts` (el motor del MCP y del GPT), que compartía
 * el defecto de las reducciones mortis causa. Se retiraron los `test.fail()`; el testigo del
 * art. 67.1 RISD se reescribió porque pasaba en vacío si la cita cambiaba de forma, y el último
 * bloque añade los casos que los testigos no miraban (escalón del 85 %, discapacidad en CLM,
 * afinidad, inmueble, cargas ilegibles, grupos de radios).
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

const RUTA = '/estimador-impuesto-donaciones/';

/** Los tres desplegables, en el orden en que se pintan. */
const SELECT = { ccaa: 0, parentesco: 1, patrimonio: 2 } as const;
/** Los dos importes: valor del bien donado y cargas. */
const CAMPO = { valor: 0, cargas: 1 } as const;
const IMPORTES = 'input[inputmode="decimal"]';

interface Caso {
  ccaa: string;
  grupo: 'I-conyuge' | 'I-descendiente' | 'II' | 'II-ascendiente' | 'III' | 'IV';
  valor: string;
  cargas?: string;
  /** Por defecto la app parte de «Sí». */
  escritura?: boolean;
  patrimonio?: '1' | '2' | '3' | '4';
}

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, [IMPORTES]);
}

async function rellenar(page: Page, caso: Caso) {
  await abrir(page);
  await page.locator('select').nth(SELECT.ccaa).selectOption(caso.ccaa);
  await page.locator('select').nth(SELECT.parentesco).selectOption(caso.grupo);
  if (caso.patrimonio) await page.locator('select').nth(SELECT.patrimonio).selectOption(caso.patrimonio);
  // Hay dos radios «No» (escritura y discapacidad); desde el 25/09/2026 cada grupo lleva su
  // `name` y su <legend>, y el primero sigue siendo el de la escritura pública.
  if (caso.escritura === false) await page.getByRole('radio', { name: 'No', exact: true }).first().check();
  if (caso.cargas !== undefined) await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.cargas), caso.cargas);
  await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), caso.valor);
}

/** El importe destacado del panel: «Impuesto estimado en …», con el espacio duro normalizado. */
async function cuota(page: Page): Promise<string> {
  const texto = await page
    .getByText(/^Impuesto estimado en/)
    .locator('xpath=following-sibling::span[1]')
    .innerText();
  return texto.replace(/ /g, ' ');
}

/** El panel de resultados tal cual (sin normalizar: los tests de formato miran el espacio duro). */
async function panel(page: Page): Promise<string> {
  return page.locator('[class*="resultsPanel"]').innerText();
}

/**
 * Todo el texto del documento, INCLUIDO el que <EducationalSection> mantiene plegado (lo oculta
 * por CSS sin desmontarlo). Se quitan <script> y <style>: el payload de React contiene
 * cualquier cadena que uno busque.
 */
async function textoCompleto(page: Page): Promise<string> {
  const t = await page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return clon.textContent ?? '';
  });
  return t.replace(/ /g, ' ').replace(/\s+/g, ' ');
}

/** «12.644,20 €» → 12644.2 */
function euros(texto: string): number {
  return Number(texto.replace(/[^\d,]/g, '').replace(',', '.'));
}

// ════════════════════════════════════════════════════════════════════════════
// Casos resueltos a mano antes de ejecutar la app
// ════════════════════════════════════════════════════════════════════════════

test.describe('Estimador ISD donaciones — casos resueltos a mano', () => {
  /**
   * CASO NORMAL. Un padre dona 60.000 € en dinero a su hijo de 30 años (Grupo II), residente en
   * Castilla-La Mancha, en escritura pública, sin patrimonio preexistente relevante.
   *
   *   Base liquidable = 60.000,00 (art. 20.5 LISD; CLM no regula reducción por parentesco)
   *   Cuota íntegra   = 5.703,50 + (60.000 − 55.918,17) × 13,60 % = 6.258,62888
   *   × 1,0000 (Grupo II, patrimonio hasta 402.678,11 €)
   *   − 95 % (art. 17 bis.1.a Ley 8/2013: base liquidable < 120.000 €)
   *   = 312,931444                                                         → «312,93 €»
   *
   * HALLAZGO alto (Inspector 25/09/2026) — la app resta 15.956,87 € «Por parentesco», la
   * reducción mortis causa del art. 20.2.a LISD, y da 211,12 €.
   */
  test('60.000 € de padre a hijo en Castilla-La Mancha: 312,93 €', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'II', valor: '60000' });
    await expect(page.getByText(/^Impuesto estimado en Castilla-La Mancha/)).toBeVisible();
    expect(await cuota(page)).toBe('312,93 €');
  });

  /**
   * CASO LÍMITE (arriba). 1.000.000 € a un primo (Grupo IV, sin reducción en ningún régimen),
   * patrimonio preexistente de más de 4.020.770,98 €, sin escritura. Último tramo de la tarifa
   * y coeficiente máximo del art. 22.2.
   *
   *   Cuota íntegra = 199.291,40 + (1.000.000 − 797.555,08) × 34 % = 268.122,6728
   *   × 2,4000 (Grupo IV, patrimonio > 4.020.770,98 €)          = 643.494,41472 → «643.494,41 €»
   *   Sin bonificación: el art. 17 bis CLM solo alcanza a los Grupos I y II.
   *   Tipo efectivo: 643.494,41 / 1.000.000 = 64,35 %
   */
  test('1.000.000 € a un primo con patrimonio máximo: 643.494,41 € (34 % y ×2,4)', async ({ page }) => {
    await rellenar(page, {
      ccaa: 'castilla-mancha', grupo: 'IV', valor: '1000000', patrimonio: '4', escritura: false,
    });
    expect(await cuota(page)).toBe('643.494,41 €');
    expect(await panel(page)).toMatch(/Tipo efectivo sobre donación: 64,35 ?%/);
  });

  /** CASO LÍMITE (abajo). Una donación de 0 € no da cifra; 1 € sí la da (0,15 €: 1 × 7,65 % × 2). */
  test('0 € no produce estimación, y 1 € sí', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'IV', valor: '0' });
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), '1');
    // 1 × 7,65 % = 0,0765 × 2,0000 = 0,153 → «0,15 €»
    expect(await cuota(page)).toBe('0,15 €');
  });

  /**
   * CASO QUE DEBE RECHAZARSE. Un valor negativo no es una donación: no debe salir ninguna cifra.
   * Se empareja con el mismo importe en positivo para que el test no pase por una app muda.
   *   50.000 € a un primo en CLM: 4.685,10 + (50.000 − 47.930,72) × 12,75 % = 4.948,93320
   *   × 2,0000 = 9.897,8664 → «9897,87 €» (cuatro cifras enteras: no se agrupan)
   */
  test('un valor negativo no produce estimación; el mismo en positivo, sí', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'IV', valor: '-50000' });
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);

    await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), '50000');
    expect(await cuota(page)).toBe('9897,87 €');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Hallazgos de la inspección del 25/09/2026 — cada test afirma lo CORRECTO
// ════════════════════════════════════════════════════════════════════════════

test.describe('Estimador ISD donaciones — hallazgos (Inspector 25/09/2026)', () => {
  /**
   * HALLAZGO alto (Inspector 25/09/2026) — aplica a las donaciones las reducciones del art.
   * 20.2.a LISD, que la ley reserva a las adquisiciones mortis causa (art. 20.5: en donaciones,
   * sin reducción autonómica, base liquidable = base imponible).
   *
   * Tío a sobrino (Grupo III), 100.000 € en CLM, con escritura:
   *   Cuota íntegra = 9.166,06 + (100.000 − 79.880,52) × 16,15 % = 12.415,35602
   *   × 1,5882 (Grupo III, patrimonio hasta 402.678,11 €) = 19.718,068 → «19.718,07 €»
   * La app resta 7.993,46 € y da 17.667,79 €.
   */
  test('las reducciones mortis causa no se aplican a una donación: sobrino, 19.718,07 €', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'III', valor: '100000' });
    await expect(page.getByText(/^Impuesto estimado en Castilla-La Mancha/)).toBeVisible();
    expect(await cuota(page)).toBe('19.718,07 €');
    expect(await panel(page)).not.toContain('Por parentesco');
  });

  /**
   * HALLAZGO alto (Inspector 25/09/2026) — `data/fiscal/donaciones.ts` da a Castilla-La Mancha
   * un 95 % plano para los Grupos I y II, y el art. 17 bis de la Ley 8/2013 (vigente desde el
   * 01/06/2016) lo escalona por base liquidable: 95 % / 90 % / 85 %.
   * Hijo de 30 años, 200.000 € con escritura → base liquidable ≥ 120.000 y < 240.000 → 90 %.
   * Se mira el porcentaje y no la cuota, para no mezclarlo con el hallazgo de las reducciones.
   */
  test('Castilla-La Mancha bonifica el 90 % a partir de 120.000 € de base, no el 95 %', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'II', valor: '200000' });
    await expect(page.getByText(/^Impuesto estimado en Castilla-La Mancha/)).toBeVisible();
    expect((await panel(page)).replace(/ /g, ' ')).toMatch(/Bonificación autonómica: 90(,0)? ?%/);
  });

  /**
   * HALLAZGO alto (Inspector 25/09/2026) — la donación de un inmueble tributa donde radica el
   * inmueble (art. 32.2.b Ley 22/2009), y la app dice que la comunidad es «siempre» la de
   * residencia del donatario: en el aviso siempre visible, en la etiqueta del campo y en el
   * paso 2 de la guía. Quien done un piso situado en otra comunidad elige la equivocada.
   */
  test('el aviso sobre la comunidad competente distingue los inmuebles', async ({ page }) => {
    await abrir(page);
    const aviso = await page.locator('li', { hasText: 'CCAA competente' }).first().innerText();
    expect(aviso).toMatch(/inmueble/i);
    expect(await textoCompleto(page)).not.toContain('Siempre es la CCAA de residencia habitual del donatario');
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) — la acumulación de donaciones del art. 30.1 LISD es
   * de TRES años; la app dice 4 en cinco sitios del bloque educativo (FAQ, buenas prácticas y
   * errores frecuentes). Los 4 años son los de la acumulación a la sucesión (art. 30.2).
   */
  test('la acumulación de donaciones es de tres años (art. 30.1 LISD), no de cuatro', async ({ page }) => {
    await abrir(page);
    const texto = await textoCompleto(page);
    expect(texto).not.toMatch(/4 años anteriores|período de 4 años|donaciones en 4 años|últimos 4 años/);
    expect(texto).toMatch(/tres años|3 años/);
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) — el recuadro de errores frecuentes da la escala de
   * recargos DEROGADA en 2021 («del 5 % hasta 3 meses al 20 %») y un interés de demora escrito a
   * mano, mientras la FAQ de la misma sección compone bien la del art. 27.2 LGT desde
   * `ESCALA_RECARGO_EXTEMPORANEO` (1 % más 1 % por mes completo; 15 % pasados 12 meses).
   */
  test('los errores frecuentes no citan la escala de recargos derogada', async ({ page }) => {
    await abrir(page);
    expect(await textoCompleto(page)).not.toMatch(/del 5 ?% \(hasta\s*3 meses/);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — la FAQ atribuye «1 mes natural» al art. 67.1 RISD,
   * que dice «treinta días hábiles» (y así lo dice el faqJsonLd de la propia app).
   */
  test('lo que se atribuye al art. 67.1 RISD es el plazo de treinta días hábiles', async ({ page }) => {
    await abrir(page);
    const texto = await textoCompleto(page);
    // Reescrito al reparar (25/09/2026): el original buscaba la cadena exacta «67.1 RISD» y
    // pasaba EN VACÍO si la cita cambiaba de forma (la reparación la escribe «67.1.b RISD»).
    // Ahora exige que la cita exista y mira cada aparición, y que no quede el «1 mes».
    const citas = [...texto.matchAll(/67\.1(\.b)? RISD/g)];
    expect(citas.length, 'la página ya no cita el art. 67.1 RISD').toBeGreaterThan(0);
    for (const c of citas) {
      const i = c.index ?? 0;
      expect(texto.slice(Math.max(0, i - 160), i + 20)).toMatch(/(treinta|30) días hábiles/);
    }
    expect(texto).not.toMatch(/1 mes (natural|desde)/);
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) — los ejemplos del bloque educativo dan cifras que la
   * calculadora no reproduce. «Tío dona finca rústica de 80.000 € a sobrino (Grupo III)», sin
   * bonificación: el texto dice «Cuota final ≈ 22.108 €» y la app, con esos datos en Castilla-La
   * Mancha (sin bonificación para el Grupo III), 12.644,20 €. Tolerancia 1 €: el texto redondea
   * a euros.
   */
  test('el ejemplo del sobrino con 80.000 € coincide con lo que calcula la app', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'III', valor: '80000' });
    const calculada = euros(await cuota(page));

    const ejemplo = (await textoCompleto(page)).match(/Tío dona finca rústica[\s\S]*?Cuota final: ≈ ([\d.]+) €/);
    expect(ejemplo, 'no se encuentra el ejemplo del sobrino').not.toBeNull();
    const delTexto = Number(ejemplo![1].replace(/\./g, ''));
    expect(Math.abs(delTexto - calculada)).toBeLessThanOrEqual(1);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — Cataluña figura en el grupo «Régimen Foral» del
   * selector. Es de régimen común (Ley 22/2009; cesión por Ley 16/2010): forales solo son el
   * País Vasco y Navarra. El grupo común dice «14 CCAA» y son 15.
   */
  test('Cataluña no aparece como régimen foral', async ({ page }) => {
    await abrir(page);
    const grupo = await page
      .locator('select')
      .nth(SELECT.ccaa)
      .evaluate((s) => (s.querySelector('option[value="cataluna"]')?.parentElement as HTMLOptGroupElement | null)?.label ?? '');
    expect(grupo).not.toMatch(/foral/i);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — el paso 3 mete al cónyuge en el Grupo I (el art.
   * 20.2.a LISD lo pone en el II) y el paso 4 da «1,0000–2,4000 para Grupo I», cuando el art.
   * 22.2 topa el Grupo I en 1,2000 y el III en 1,9059.
   */
  test('la guía describe bien los grupos y los coeficientes', async ({ page }) => {
    await abrir(page);
    const texto = await textoCompleto(page);
    expect(texto).not.toContain('Grupo I: cónyuge');
    expect(texto).not.toContain('1,0000–2,4000 para Grupo I');
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) — el selector no tiene sitio para los parientes por
   * afinidad (yerno, nuera, suegros, hijastros), que son Grupo III (art. 20.2.a LISD); la única
   * opción que los acoge es «otro pariente o sin parentesco», que es el Grupo IV. Una nuera que
   * recibe 100.000 € en CLM: 19.718,07 € (Grupo III) frente a los 24.830,71 € del IV.
   */
  test('el selector de parentesco ofrece a los parientes por afinidad', async ({ page }) => {
    await abrir(page);
    const opciones = await page.locator('select').nth(SELECT.parentesco).locator('option').allInnerTexts();
    expect(opciones.some((o) => /afinidad|yerno|nuera|suegr|hijastr/i.test(o))).toBe(true);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — LA SOSPECHA DE LA FAMILIA FISCAL, CONFIRMADA: el hero
   * imprime `FISCAL_DONACIONES_META.verificado` tal cual, «Datos verificados: 2025-01-01», y el
   * <DataReference> de la misma página lo da como «01/01/2025».
   */
  test('la fecha de verificación del hero va en DD/MM/AAAA', async ({ page }) => {
    await abrir(page);
    const hero = await page.locator('header').filter({ hasText: 'Datos verificados' }).first().innerText();
    expect(hero).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — dos cifras del desglose se pintan con `toFixed()`, con
   * punto decimal: «×1.0000» y «Bonificación 99.0% (Comunidad de Madrid)».
   */
  test('el desglose no usa punto decimal', async ({ page }) => {
    await rellenar(page, { ccaa: 'madrid', grupo: 'II', valor: '100000' });
    const texto = await panel(page);
    expect(texto).not.toMatch(/×\d\.\d{4}/);
    expect(texto).not.toMatch(/Bonificación \d+\.\d/);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — el % va pegado a la cifra (regla del 25/09/2026: con
   * espacio duro). En el formulario y el resultado: «99,0%», «0,10%», «33%–64%», «≥65%»; además
   * en el aviso de Castilla-La Mancha, la tarifa de Cataluña, el bloque educativo y el faqJsonLd.
   */
  test('el porcentaje va separado de la cifra en el formulario y el resultado', async ({ page }) => {
    await rellenar(page, { ccaa: 'madrid', grupo: 'II', valor: '100000' });
    expect(await page.locator('[class*="mainContent"]').innerText()).not.toMatch(/\d%/);
  });

  /**
   * HALLAZGO alto (Inspector 25/09/2026) — los cinco campos del formulario no tienen nombre
   * accesible: los <label> son hermanos del control, sin htmlFor ni id. Los dos importes se
   * anuncian como «edición, 0,00» (el placeholder) y los tres desplegables sin nombre. Los radios
   * no llevan `name` ni fieldset: hay dos «No» sin la pregunta a la que responden.
   * (La hermana de sucesiones tuvo la misma forma: hallazgo 741, alto.)
   */
  test('ningún control del formulario se queda sin nombre accesible', async ({ page }) => {
    await abrir(page);
    const sinNombre = await page.evaluate(() => {
      const fuera: string[] = [];
      // Solo el formulario de la app: lo que monten Footer o ShareCard no es de esta inspección
      document.querySelectorAll('[class*="inputsPanel"] select, [class*="inputsPanel"] input').forEach((el) => {
        const c = el as HTMLInputElement;
        if (c.type === 'hidden' || c.type === 'radio') return;
        if (c.getAttribute('aria-label') || c.getAttribute('aria-labelledby')) return;
        if (c.id && document.querySelector('label[for="' + CSS.escape(c.id) + '"]')) return;
        if (c.closest('label')) return;
        fuera.push(c.tagName.toLowerCase() + (c.placeholder ? '[' + c.placeholder + ']' : ''));
      });
      return fuera;
    });
    expect(sinNombre, 'controles sin nombre accesible: ' + sinNombre.join(', ')).toEqual([]);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — emojis junto a texto sin aria-hidden: el h1 («🎁»),
   * el título del aviso legal («⚠️»), los tres títulos del formulario, «📊 Tarifa», «📝», «📜»,
   * «ℹ️» y los iconos de las tarjetas del bloque educativo. El lector los lee como parte del
   * nombre: «regalo Estimador del Impuesto de Donaciones».
   */
  test('los emojis decorativos no entran en el nombre de los encabezados', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Estimador del Impuesto de Donaciones');
    await expect(page.getByRole('heading', { name: /Aviso Legal Imprescindible/ })).toHaveAccessibleName('Aviso Legal Imprescindible');
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) — dos tokens LOCALES del módulo sin variante oscura:
   * `--danger` (#C0392B) sobre el `--danger-bg` oscuro da 2,84:1 en el título del aviso legal
   * imprescindible y en su frase de responsabilidad; `--bonif` (#1A7A3E) sobre la tarjeta
   * oscura da 2,66:1 en las líneas de reducción y de bonificación. Umbral: 4,5:1.
   */
  test('en modo oscuro el aviso legal y las líneas de bonificación llegan a 4,5:1', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    await page.locator('select').nth(SELECT.ccaa).selectOption('madrid');
    await page.locator('select').nth(SELECT.parentesco).selectOption('II');
    await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), '100000');
    await expect(page.locator('[class*="lineaBonif"]').first()).toBeVisible();

    const medidas = await page.evaluate(() => {
      const rgb = (s: string) => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(',').map((x) => parseFloat(x));
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      };
      const lum = (c: { r: number; g: number; b: number }) => {
        const f = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const fondo = (el: Element) => {
        let n: Element | null = el;
        while (n) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0.5) return c;
          n = n.parentElement;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      };
      const out: { texto: string; ratio: number }[] = [];
      document
        .querySelectorAll('[class*="disclaimerTitulo"], [class*="disclaimerResponsabilidad"], [class*="lineaBonif"]')
        .forEach((el) => {
          const c = rgb(getComputedStyle(el).color)!;
          const l1 = lum(c);
          const l2 = lum(fondo(el));
          out.push({
            texto: (el.textContent ?? '').trim().slice(0, 40),
            ratio: Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100,
          });
        });
      return out;
    });

    expect(medidas.length).toBeGreaterThanOrEqual(3);
    const flojas = medidas.filter((m) => m.ratio < 4.5);
    expect(flojas, 'por debajo de 4,5:1: ' + JSON.stringify(flojas)).toEqual([]);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) — asimetría territorial valorativa (§1.quinquies, 6):
   * «Régimen común más favorables», «una de las CCAA más favorables para donar inmuebles»,
   * «Las más favorables… Las menos favorables…». Las diferencias entre comunidades son hechos.
   */
  test('el bloque educativo no califica a las comunidades de más o menos favorables', async ({ page }) => {
    await abrir(page);
    expect(await textoCompleto(page)).not.toMatch(/(más|menos) favorables/);
  });

  /**
   * HALLAZGO alto (Inspector 25/09/2026) — unas cargas NEGATIVAS no se rechazan: se restan con
   * su signo y AUMENTAN la base. Primo, 100.000 € en CLM, cargas «-10000» → «Base liquidable
   * 110.000,00 €» y 28.060,71 € de cuota, sin aviso. Y unas cargas ilegibles («1.2.3») se
   * descartan en silencio: 24.830,71 €, como si no hubiera cargas. (Hermana: hallazgo 740.)
   */
  test('unas cargas negativas no aumentan la base: se rechazan', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'IV', valor: '100000', cargas: '-10000' });
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
    expect(await panel(page)).not.toContain('110.000,00');
    await expect(page.getByRole('alert').filter({ hasText: 'Las cargas no pueden ser negativas' })).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Reparación del 25/09/2026 — casos que cubren lo que los testigos de arriba no miraban
// ════════════════════════════════════════════════════════════════════════════

test.describe('Estimador ISD donaciones — reparación (25/09/2026)', () => {
  /**
   * 1879, segunda mitad: unas cargas ilegibles no se convierten en 0. Primo, 100.000 € en CLM,
   * cargas «1.2.3» → antes 24.830,71 € sin marca, como si no hubiera cargas.
   */
  test('unas cargas ilegibles no se descartan en silencio', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'IV', valor: '100000', cargas: '1.2.3' });
    await expect(page.getByRole('alert').filter({ hasText: 'Las cargas no son un número válido' })).toBeVisible();
    await expect(page.getByText(/^Impuesto estimado en/)).toHaveCount(0);
  });

  /**
   * 1863, con la cuota. Hijo de 30 años, 200.000 € en CLM con escritura:
   *   23.063,25 + (200.000 − 159.634,83) × 21,25 % = 31.640,848625 × 1,0000
   *   − 90 % (art. 17 bis.1.b Ley 8/2013) = 3.164,0848625 → «3164,08 €» (cuatro cifras enteras: no se agrupan)
   * Y a 240.000 € justos ya es el 85 % (art. 17 bis.1.c: «igual o superior a 240.000»):
   *   40.011,04 + (240.000 − 239.389,13) × 25,50 % = 40.166,81185 × 0,15 = 6.025,0217775 → «6025,02 €»
   */
  test('Castilla-La Mancha escalona la bonificación: 200.000 € → 3.164,08 €; 240.000 € → 85 %', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'II', valor: '200000' });
    expect(await cuota(page)).toBe('3164,08 €');

    await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), '240000');
    expect(await cuota(page)).toBe('6025,02 €');
    expect(await panel(page)).toMatch(/Bonificación autonómica: 85,0\s%/);
  });

  /**
   * 1863, segunda mitad: art. 17 bis.2 Ley 8/2013 — donatarios con discapacidad ≥ 65 %, de
   * CUALQUIER grupo: 95 % de la cuota, después de la de parentesco. Primo, 100.000 € en CLM:
   *   12.415,35602 × 2,0000 = 24.830,71204; − 95 % = 1.241,535602 → «1241,54 €»
   * Con un 33 % no hay bonificación en donaciones (el art. 15 CLM es solo mortis causa):
   * 24.830,71 €.
   */
  test('Castilla-La Mancha bonifica el 95 % a un donatario con discapacidad ≥ 65 %', async ({ page }) => {
    await rellenar(page, { ccaa: 'castilla-mancha', grupo: 'IV', valor: '100000' });
    await page.getByRole('radio', { name: /^65\s?%\s?o más$/ }).check();
    expect(await cuota(page)).toBe('1241,54 €');

    await page.getByRole('radio', { name: /^Del 33\s?%/ }).check();
    expect(await cuota(page)).toBe('24.830,71 €');
  });

  /**
   * 1871: una nuera que recibe 100.000 € de su suegro en CLM es Grupo III (art. 20.2.a LISD:
   * «ascendientes y descendientes por afinidad»): 12.415,35602 × 1,5882 = 19.718,068 → «19.718,07 €».
   */
  test('una nuera tributa como Grupo III: 19.718,07 €', async ({ page }) => {
    await abrir(page);
    await page.locator('select').nth(SELECT.ccaa).selectOption('castilla-mancha');
    await page.locator('select').nth(SELECT.parentesco).selectOption('III-afinidad');
    await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), '100000');
    expect(await cuota(page)).toBe('19.718,07 €');
  });

  /**
   * 1864, el caso del acta: piso situado en Castilla-La Mancha, donado a un hijo que vive en
   * Madrid, 60.000 €. Al marcar «inmueble» el campo pide la comunidad del inmueble, y con CLM
   * sale 312,93 € (6.258,62888 × 5 %).
   */
  test('con un inmueble, la comunidad que se pide es la del inmueble', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('combobox', { name: /residencia habitual de quien recibe/ })).toBeVisible();
    await page.getByRole('radio', { name: /Un inmueble/ }).check();
    const combo = page.getByRole('combobox', { name: /donde está situado el inmueble/ });
    await expect(combo).toBeVisible();
    await combo.selectOption('castilla-mancha');
    await page.getByRole('combobox', { name: /Parentesco/ }).selectOption('II');
    await sembrarValor(page, page.locator(IMPORTES).nth(CAMPO.valor), '60000');
    expect(await cuota(page)).toBe('312,93 €');
  });

  /** 1875: cada grupo de radios responde a su pregunta, y los campos tienen el nombre de su etiqueta. */
  test('los radios van agrupados bajo su pregunta y los campos tienen nombre', async ({ page }) => {
    await abrir(page);
    await expect(
      page.getByRole('group', { name: '¿Se formalizará en escritura pública?' }).getByRole('radio', { name: 'No', exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole('group', { name: /Discapacidad reconocida/ }).getByRole('radio', { name: 'No', exact: true }),
    ).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Valor del bien donado *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Cargas o deudas/ })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /Patrimonio preexistente/ })).toBeVisible();
  });

  /** 1869: el régimen común son 15 comunidades con Cataluña; forales, solo País Vasco y Navarra. */
  test('el grupo foral solo tiene al País Vasco y Navarra', async ({ page }) => {
    await abrir(page);
    const grupos = await page.locator('select').nth(SELECT.ccaa).evaluate((s) =>
      Array.from(s.querySelectorAll('optgroup')).map((g) => ({ label: g.label, n: g.querySelectorAll('option').length })),
    );
    expect(grupos).toEqual([
      { label: 'Régimen común (15 comunidades)', n: 15 },
      { label: 'Régimen foral', n: 2 },
    ]);
  });

  /** 1872, segunda mitad: el <DataReference> repetía la fuente en «normativa» y «fuente». */
  test('el sello de datos no repite la fuente dos veces', async ({ page }) => {
    await abrir(page);
    const texto = await textoCompleto(page);
    expect(texto).not.toMatch(/normativas autonómicas 2025 — Ley 29\/1987/);
    expect(texto).toContain('Datos verificados: 01/01/2025');
  });
});

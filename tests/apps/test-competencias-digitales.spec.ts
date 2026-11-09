import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — test-competencias-digitales (segmento cálculo, riesgo 3)
 *
 * Primera inspección: 09/11/2026 (143 usos reales).
 *
 * Resuelto a mano ANTES de abrir el navegador, con las reglas de `app/test-competencias-digitales/
 * digcomp.ts` y `page.tsx` (no hay motor en `lib/` ni datos de `data/fiscal`):
 *
 *   · Cada competencia vale 0 («Todavía no lo hago por mi cuenta»), 1 Fundamental, 2 Intermedio,
 *     3 Avanzado o 4 Altamente especializado (`TRAMO_VALOR`).
 *   · Media de un área = media de sus competencias respondidas; media global = media de TODAS las
 *     respondidas (pesa por competencia: las áreas tienen 3, 6, 4, 4 y 4).
 *   · Nivel mostrado = `valorATramo(media)`: null si media <= 0; si no, Math.round con suelo 1 y
 *     techo 4 (2,5 → 3, Avanzado; 0,33 → 1, Fundamental).
 *   · «Cumple» (color de la barra) = media >= valor del objetivo del perfil. Barra = media/4.
 *   · Plan = competencias con objetivo − valor > 0, de mayor a menor distancia (orden estable:
 *     el de `COMPETENCIAS` en los empates); la página pinta 8 y el Markdown 6.
 *
 * Los casos «HALLAZGO (…, ABIERTO)» llevan `test.fail()`: describen lo que DEBERÍA pasar y hoy no
 * pasa. Cuando se repare, Playwright los marcará en rojo por pasar: se quita el `test.fail()` y
 * «ABIERTO» pasa a «REPARADO».
 */

const RUTA = '/test-competencias-digitales/';

type Valor = 0 | 1 | 2 | 3 | 4;
type Respuestas = Record<string, Valor>;

const TAMANO_AREA: Record<string, number> = { '1': 3, '2': 6, '3': 4, '4': 4, '5': 4 };

/** Las 21 competencias con el mismo valor (áreas 1-5, o solo las que se pidan). */
function todas(valor: Valor, areas: string[] = ['1', '2', '3', '4', '5']): Respuestas {
  const r: Respuestas = {};
  for (const a of areas) for (let i = 1; i <= TAMANO_AREA[a]; i++) r[`${a}.${i}`] = valor;
  return r;
}

/**
 * CASO 1 (perfil «Buscando empleo»: objetivo A, A, I, I, I → 3, 3, 2, 2, 2).
 *   Área 1: 3+2+2 = 7/3 = 2,333 → Intermedio · barra 58,33 % · objetivo 75 % · no cumple
 *   Área 2: 3+3+3+2+2+2 = 15/6 = 2,5 → round 3 = Avanzado · barra 62,5 % · 2,5 < 3: no cumple
 *   Área 3: 2+1+2+0 = 5/4 = 1,25 → Fundamental · barra 31,25 % · objetivo 50 % · no cumple
 *   Área 4: 3+2+2+1 = 8/4 = 2 → Intermedio · barra 50 % · cumple
 *   Área 5: 4+3+2+2 = 11/4 = 2,75 → Avanzado · barra 68,75 % · cumple
 *   Global: 46/21 = 2,19 → Intermedio
 *   Plan (8): 3.4 (distancia 2) y luego, a distancia 1 y en orden de catálogo, 1.2, 1.3, 2.4,
 *   2.5, 2.6, 3.2 y 4.4.
 */
const CASO_1: Respuestas = {
  '1.1': 3, '1.2': 2, '1.3': 2,
  '2.1': 3, '2.2': 3, '2.3': 3, '2.4': 2, '2.5': 2, '2.6': 2,
  '3.1': 2, '3.2': 1, '3.3': 2, '3.4': 0,
  '4.1': 3, '4.2': 2, '4.3': 2, '4.4': 1,
  '5.1': 4, '5.2': 3, '5.3': 2, '5.4': 2,
};

const PLAN_CASO_1 = [
  ['Programación', 'Todavía no → Intermedio'],
  ['Evaluación de información y datos', 'Intermedio → Avanzado'],
  ['Gestión de información, datos y contenidos', 'Intermedio → Avanzado'],
  ['Colaboración mediante tecnologías digitales', 'Intermedio → Avanzado'],
  ['Comportamiento en la red (netiqueta)', 'Intermedio → Avanzado'],
  ['Gestión de la identidad digital', 'Intermedio → Avanzado'],
  ['Integración y reelaboración de contenidos', 'Fundamental → Intermedio'],
  ['Protección del medioambiente', 'Fundamental → Intermedio'],
];

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

const grupoAreas = (page: Page) => page.getByRole('group', { name: 'Áreas de competencia' });
const botonVerResultados = (page: Page) => page.getByRole('button', { name: 'Ver resultados', exact: true });
const resultados = (page: Page) => page.locator('#resultados');
const aviso = (page: Page, texto: string) => page.getByRole('status').filter({ hasText: texto });

/** Marca el valor de una competencia (0 = «Todavía no», 1-4 = tramos); abre su área si hace falta. */
async function responder(page: Page, id: string, valor: Valor, tocar = false): Promise<void> {
  const radio = page.locator(`input[name="comp-${id}"]`).nth(valor);
  if (!(await radio.isVisible())) {
    const pestana = grupoAreas(page).getByRole('button').nth(Number(id.split('.')[0]) - 1);
    if (tocar) await pestana.tap();
    else await pestana.click();
  }
  if (tocar) await radio.locator('xpath=..').tap();
  else await radio.check();
  await expect(radio).toBeChecked();
}

async function responderTodo(page: Page, r: Respuestas, tocar = false): Promise<void> {
  for (const [id, v] of Object.entries(r)) await responder(page, id, v, tocar);
}

interface Fila {
  nivel: string;
  objetivoTxt: string;
  ancho: number;
  cumple: boolean;
  marcaObjetivo: number;
}

/** Las 5 filas de «Nivel por área (vs objetivo)», en orden de área. */
async function leerFilas(page: Page): Promise<Fila[]> {
  return resultados(page)
    .locator('[class*="_barraFila"]')
    .evaluateAll((filas) =>
      filas.map((f) => {
        const valor = f.querySelector('[class*="_barraValor"]');
        const obj = valor?.querySelector('[class*="_barraObjetivoTxt"]');
        const barra = f.querySelector<HTMLElement>('[class*="_barraNivel"]');
        const marca = f.querySelector<HTMLElement>('[class$="_barraObjetivo"]');
        const textoObj = (obj?.textContent ?? '').trim();
        const textoValor = (valor?.textContent ?? '').trim();
        return {
          nivel: textoValor.slice(0, textoValor.length - textoObj.length).trim(),
          objetivoTxt: textoObj,
          ancho: parseFloat(barra?.style.width ?? 'NaN'),
          cumple: /_barraCumple/.test(barra?.className ?? ''),
          marcaObjetivo: parseFloat(marca?.style.left ?? 'NaN'),
        };
      }),
    );
}

async function leerPlan(page: Page): Promise<string[][]> {
  return resultados(page)
    .locator('[class*="_gapCard"]')
    .evaluateAll((tarjetas) =>
      tarjetas.map((t) => [
        (t.querySelector('[class*="_gapNombre"]')?.textContent ?? '').trim(),
        (t.querySelector('[class*="_gapNivel"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      ]),
    );
}

async function descargarMarkdown(page: Page): Promise<string> {
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar .md' }).click(),
  ]);
  const ruta = await descarga.path();
  return fs.readFileSync(ruta, 'utf8');
}

async function hacerCaso1(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Buscando empleo/ }).click();
  await responderTodo(page, CASO_1);
  await expect(page.getByText('21 / 21 competencias evaluadas')).toBeVisible();
  await botonVerResultados(page).click();
  await expect(resultados(page)).toBeVisible();
}

test.describe('test-competencias-digitales · inspector 09/11/2026', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · perfil «Buscando empleo»: nivel global, por área, barras y plan de 8', async ({ page }) => {
    await hacerCaso1(page);
    await expect(resultados(page).locator('[class*="_nivelGlobalValor"]')).toHaveText('Intermedio');
    await expect(resultados(page).locator('[class*="_nivelGlobalNota"]')).toHaveText(
      'Media de 21 de 21 competencias · perfil Buscando empleo',
    );

    const filas = await leerFilas(page);
    expect(filas).toHaveLength(5);
    // El área 2 (media 2,5) se mira en su HALLAZGO: su rótulo y su color no concuerdan
    const esperado = [
      { i: 0, nivel: 'Intermedio', obj: '· obj: Avanzado', ancho: 58.33, marca: 75, cumple: false },
      { i: 2, nivel: 'Fundamental', obj: '· obj: Intermedio', ancho: 31.25, marca: 50, cumple: false },
      { i: 3, nivel: 'Intermedio', obj: '· obj: Intermedio', ancho: 50, marca: 50, cumple: true },
      { i: 4, nivel: 'Avanzado', obj: '· obj: Intermedio', ancho: 68.75, marca: 50, cumple: true },
    ];
    for (const e of esperado) {
      expect(filas[e.i].nivel, `nivel del área ${e.i + 1}`).toBe(e.nivel);
      expect(filas[e.i].objetivoTxt, `objetivo del área ${e.i + 1}`).toBe(e.obj);
      expect(filas[e.i].ancho, `barra del área ${e.i + 1}`).toBeCloseTo(e.ancho, 1);
      expect(filas[e.i].marcaObjetivo, `marca del objetivo del área ${e.i + 1}`).toBeCloseTo(e.marca, 1);
      expect(filas[e.i].cumple, `cumple el área ${e.i + 1}`).toBe(e.cumple);
    }
    expect(filas[1].ancho, 'barra del área 2: 2,5/4').toBeCloseTo(62.5, 1);

    expect(await leerPlan(page)).toEqual(PLAN_CASO_1);
    // De «Todavía no», el siguiente paso es el tramo Fundamental de la competencia
    await expect(resultados(page).locator('[class*="_gapPaso"]').first()).toHaveText(
      'Siguiente paso (Fundamental): Sé que los programas siguen instrucciones, pero no las escribo yo.',
    );
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el área 2 se rotula «Avanzado · obj: Avanzado» y su barra no se marca como cumplida', async ({
    page,
  }) => {
    // Área 2 del CASO 1: media 15/6 = 2,5. El rótulo redondea (Math.round(2,5) = 3, Avanzado) y el
    // color compara la media sin redondear (2,5 < 3). En la misma fila, el texto dice que llega al
    // objetivo y la barra que no; el plan lista además 2.4, 2.5 y 2.6 como lagunas de esa área.
    test.fail();
    await hacerCaso1(page);
    const RANGO: Record<string, number> = { Fundamental: 1, Intermedio: 2, Avanzado: 3, 'Altamente especializado': 4 };
    const filas = await leerFilas(page);
    for (const [i, f] of filas.entries()) {
      const objetivo = f.objetivoTxt.replace('· obj:', '').trim();
      const llegaSegunRotulo = (RANGO[f.nivel] ?? 0) >= RANGO[objetivo];
      expect(f.cumple, `área ${i + 1}: rótulo «${f.nivel}» frente a objetivo «${objetivo}»`).toBe(llegaSegunRotulo);
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el Markdown recorta el plan a 6 prioridades y la página muestra 8', async ({
    page,
  }) => {
    // CASO 1: 8 lagunas, y la página las pinta todas (slice(0, 8)); el .md hace slice(0, 6) y
    // se calla «Integración y reelaboración de contenidos» y «Protección del medioambiente».
    test.fail();
    await hacerCaso1(page);
    expect(await leerPlan(page)).toHaveLength(8);
    const md = await descargarMarkdown(page);
    const plan = md.split('## Plan de desarrollo (prioridades)')[1] ?? '';
    for (const [nombre] of PLAN_CASO_1) expect(plan, `«${nombre}» en el plan del .md`).toContain(`### ${nombre}`);
  });

  test('CASO 2a (límite) · todo «Todavía no»: 21 lagunas a distancia 2, se pintan 8', async ({ page }) => {
    // Perfil general (objetivo Intermedio = 2 en las 5 áreas): media 0 en todo, barras al 0 %,
    // 21 lagunas «Todavía no → Intermedio» y la página enseña las 8 primeras del catálogo.
    await responderTodo(page, todas(0));
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    await expect(resultados(page).locator('[class*="_nivelGlobalNota"]')).toHaveText(
      'Media de 21 de 21 competencias · perfil Uso general / ciudadanía digital',
    );
    const filas = await leerFilas(page);
    for (const f of filas) {
      expect(f.ancho).toBe(0);
      expect(f.cumple).toBe(false);
    }
    const plan = await leerPlan(page);
    expect(plan).toHaveLength(8);
    expect(plan[0]).toEqual(['Navegación, búsqueda y filtrado de información', 'Todavía no → Intermedio']);
    expect(plan[7]).toEqual(['Comportamiento en la red (netiqueta)', 'Todavía no → Intermedio']);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · un área contestada entera con «Todavía no» sale sin nivel, y el .md dice «sin evaluar»', async ({
    page,
  }) => {
    // valorATramo(0) = null y la fila hace nombreTramo(null as TramoId) = '': el rótulo queda
    // en «· obj: Intermedio» a secas. El Markdown convierte ese null en «sin evaluar», lo mismo
    // que un área sin responder, aunque debajo lista sus competencias «Todavía no».
    test.fail();
    await responderTodo(page, todas(0));
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    const filas = await leerFilas(page);
    for (const [i, f] of filas.entries()) expect(f.nivel, `nivel del área ${i + 1}`).not.toBe('');
    const md = await descargarMarkdown(page);
    expect(md).not.toContain('Nivel: sin evaluar');
  });

  test('CASO 2b (límite) · todo «Altamente especializado»: nivel máximo y sin lagunas', async ({ page }) => {
    // Media 4 en todas las áreas: barras al 100 %, todas cumplen (4 >= 2), plan vacío.
    await responderTodo(page, todas(4));
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    await expect(resultados(page).locator('[class*="_nivelGlobalValor"]')).toHaveText('Altamente especializado');
    const filas = await leerFilas(page);
    for (const f of filas) {
      expect(f.nivel).toBe('Altamente especializado');
      expect(f.ancho).toBe(100);
      expect(f.cumple).toBe(true);
    }
    expect(await leerPlan(page)).toHaveLength(0);
    await expect(resultados(page).getByText('Todas las competencias evaluadas alcanzan tu objetivo')).toBeVisible();
  });

  test('CASO 2c (límite) · «Iniciación digital» con el área 5 sin responder', async ({ page }) => {
    // 17 competencias en Fundamental (1): media 1 → Fundamental; el área 5 queda «sin evaluar»
    // con la barra al 0 %; objetivo Fundamental (25 %) cumplido en las otras cuatro.
    await page.getByRole('button', { name: /Iniciación digital/ }).click();
    await responderTodo(page, todas(1, ['1', '2', '3', '4']));
    await expect(page.getByText('17 / 21 competencias evaluadas')).toBeVisible();
    await grupoAreas(page).getByRole('button').nth(4).click();
    await page.getByRole('button', { name: 'Ver mis resultados' }).click();
    await expect(resultados(page)).toBeVisible();
    await expect(resultados(page).locator('[class*="_nivelGlobalValor"]')).toHaveText('Fundamental');
    await expect(resultados(page).locator('[class*="_nivelGlobalNota"]')).toHaveText(
      'Media de 17 de 21 competencias · perfil Iniciación digital',
    );
    const filas = await leerFilas(page);
    for (const f of filas.slice(0, 4)) {
      expect(f.nivel).toBe('Fundamental');
      expect(f.ancho).toBe(25);
      expect(f.cumple).toBe(true);
    }
    expect(filas[4].nivel).toBe('sin evaluar');
    expect(filas[4].ancho).toBe(0);
    expect(filas[4].cumple).toBe(false);
  });

  test('CASO 2d (límite) · 20 «Todavía no» y un Fundamental: el suelo de valorATramo da Fundamental', async ({ page }) => {
    // Global 1/21 = 0,048 → Math.round = 0 → suelo 1 → Fundamental. Área 1: (1+0+0)/3 = 0,33 →
    // Fundamental, barra 8,33 %. Es la regla escrita en digcomp.ts (tramo «>= 1»); con media
    // exactamente 0 no hay nivel (ver el HALLAZGO del área sin nivel).
    const r = todas(0);
    r['1.1'] = 1;
    await responderTodo(page, r);
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    await expect(resultados(page).locator('[class*="_nivelGlobalValor"]')).toHaveText('Fundamental');
    const filas = await leerFilas(page);
    expect(filas[0].nivel).toBe('Fundamental');
    expect(filas[0].ancho).toBeCloseTo(8.33, 1);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el progreso entre mediciones sale con punto decimal: «+0.2»', async ({ page }) => {
    // Medición 1: 17 × Fundamental → media 1. Medición 2: 1.1 pasa a 4 → (17 − 1 + 4)/17 =
    // 20/17 = 1,176 → delta 0,176 → con una cifra «+0,2». La app usa delta.toFixed(1): «+0.2».
    test.fail();
    await page.getByRole('button', { name: /Iniciación digital/ }).click();
    await responderTodo(page, todas(1, ['1', '2', '3', '4']));
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    await page.getByRole('button', { name: 'Guardar esta medición' }).click();
    await responder(page, '1.1', 4);
    await page.getByRole('button', { name: 'Guardar esta medición' }).click();
    const items = resultados(page).locator('li[class*="_historialItem"]');
    await expect(items).toHaveCount(2);
    await expect(items.first()).toContainText('+0,2');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «Medición guardada» se anuncia fuera de la vista, encima del test', async ({
    page,
  }) => {
    // El aviso de guardar, copiar y descargar es el mismo <p role="status"> del bloque de la
    // autoevaluación; los botones están en el panel de resultados, más abajo. En 1280 px el
    // aviso queda ~700 px por encima del borde superior: quien pulsa no ve la confirmación.
    test.fail();
    await page.getByRole('button', { name: /Iniciación digital/ }).click();
    await responderTodo(page, todas(1, ['1']));
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    await page.getByRole('button', { name: 'Guardar esta medición' }).click();
    await expect(aviso(page, 'Medición guardada')).toBeInViewport();
  });

  test('CASO 3 (rechazo) · sin respuestas no hay resultados, y se avisa', async ({ page }) => {
    // respondidas = 0 → aviso y sin panel de resultados, por los dos botones.
    await botonVerResultados(page).click();
    await expect(aviso(page, 'Responde al menos una competencia para ver tus resultados.')).toBeVisible();
    await expect(resultados(page)).toHaveCount(0);
    await grupoAreas(page).getByRole('button').nth(4).click();
    await page.getByRole('button', { name: 'Ver mis resultados' }).click();
    await expect(resultados(page)).toHaveCount(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · las pestañas de área se llaman «0/3», «0/6» y tres veces «0/4»', async ({
    page,
  }) => {
    // El icono es aria-hidden y lo único con nombre es el contador: un lector de pantalla oye
    // «0/4, botón» en Creación de contenidos, Seguridad y Resolución de problemas.
    test.fail();
    const pestanas = grupoAreas(page).getByRole('button');
    await expect(pestanas).toHaveCount(5);
    for (const area of ['Información', 'Comunicación', 'Creación', 'Seguridad', 'Resolución']) {
      await expect(grupoAreas(page).getByRole('button', { name: new RegExp(area) })).toHaveCount(1);
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · features y la guía prometen un «radar» y la app pinta barras', async ({ page }) => {
    // jsonLd.features: «Nivel por competencia y por área con radar de resultados»; paso 3 de la
    // guía: «Revisa tu radar por áreas». Los resultados son barras horizontales por área.
    test.fail();
    const features = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { featureList?: string[] | string };
        if (j.featureList) return Array.isArray(j.featureList) ? j.featureList.join(' | ') : j.featureList;
      }
      return '';
    });
    expect(features).not.toBe('');
    expect(features).not.toMatch(/radar/i);
    await expect(page.getByText(/radar/i)).toHaveCount(0);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la pregunta de Europass tiene dos respuestas: la visible y la del FAQPage', async ({
    page,
  }) => {
    // FAQPage: «Europass te pide que elijas tu nivel en 5 áreas de forma general…». Visible:
    // «Europass te sitúa de forma general en 5 áreas…». Debe ser UNA constante (check:faq-unica).
    test.fail();
    const respuestaFaqPage = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] !== 'FAQPage') continue;
        const q = j.mainEntity?.find((e) => /Europass/.test(e.name));
        if (q) return q.acceptedAnswer.text;
      }
      return '';
    });
    expect(respuestaFaqPage).not.toBe('');
    // La guía nace plegada (oculta por CSS, pero en el DOM): se lee textContent sin los <script>,
    // que llevan el propio FAQPage y harían pasar la comprobación sin mirar la página.
    const visible = await page.evaluate(() => {
      const clon = document.body.cloneNode(true) as HTMLElement;
      clon.querySelectorAll('script, style').forEach((n) => n.remove());
      return (clon.textContent ?? '').replace(/\s+/g, ' ');
    });
    expect(visible.replace(/[«»"]/g, '')).toContain(respuestaFaqPage.replace(/[«»"]/g, ''));
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el resultado invita a «marcar un objetivo más exigente» y no hay dónde', async ({
    page,
  }) => {
    // Sin lagunas, la app dice «Sube de perfil o marca un objetivo más exigente»; la guía, «Fija
    // los niveles objetivo por área». Solo hay 6 perfiles fijos: ningún control fija el objetivo
    // de un área, y ningún perfil pide «Altamente especializado».
    test.fail();
    await responderTodo(page, todas(4, ['1']));
    await botonVerResultados(page).click();
    await expect(resultados(page)).toBeVisible();
    const promete = await resultados(page).getByText(/marca un objetivo más exigente/).count();
    const controles = await page.locator('select, input[type="range"], input[type="number"]').count();
    expect(promete === 0 || controles > 0).toBe(true);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · afirmaciones sin fuente sobre el método y sobre la seguridad', async ({ page }) => {
    // §1.quinquies (1 y 3): «calibra mucho mejor tu nivel real» e «invita a sobreestimarse» se
    // presentan como hechos sin estudio citado; «basada en evidencia» llama evidencia a una
    // autodeclaración; «Es el área que más se olvida y la que más problemas evita», sin fuente.
    test.fail();
    const texto = await page.evaluate(() => {
      const clon = document.body.cloneNode(true) as HTMLElement;
      clon.querySelectorAll('style').forEach((n) => n.remove());
      return (clon.textContent ?? '').replace(/\s+/g, ' ');
    });
    expect(texto).not.toContain('calibra mucho mejor tu nivel real');
    expect(texto).not.toContain('Es el área que más se olvida y la que más problemas evita');
    expect(texto).not.toContain('basada en evidencia');
  });
});

test.describe('test-competencias-digitales · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el CASO 1 se completa a toques y da el mismo resultado, sin desbordar', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Buscando empleo/ }).tap();
    await responderTodo(page, CASO_1, true);
    await expect(page.getByText('21 / 21 competencias evaluadas')).toBeVisible();
    await grupoAreas(page).getByRole('button').nth(4).tap();
    await page.getByRole('button', { name: 'Ver mis resultados' }).tap();
    await expect(resultados(page)).toBeVisible();
    await expect(resultados(page).locator('[class*="_nivelGlobalValor"]')).toHaveText('Intermedio');
    expect(await leerPlan(page)).toEqual(PLAN_CASO_1);
    const { ancho, visible } = await page.evaluate(() => ({
      ancho: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));
    expect(ancho, 'sin scroll horizontal').toBeLessThanOrEqual(visible);
  });
});

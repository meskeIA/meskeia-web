import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * calculadora-caducidad — «¿Cuánto dura cada alimento?» (Inspector, primera inspección, 07/11/2026)
 *
 * QUÉ ES
 * No calcula: es una TABLA de consulta (26 alimentos, de lib/calculadoras/caducidadAlimentos.ts)
 * con un buscador por nombre y seis filtros por categoría. Lo comprobable es que el buscador y
 * los filtros enseñen lo que deben, que la FAQ del JSON-LD diga lo mismo que la tabla y que los
 * plazos no contradigan a la fuente oficial que se pudo leer.
 *
 * DE DÓNDE SALEN LOS ESPERADOS
 * - Recuento por categoría, contado a mano en ALIMENTOS_CADUCIDAD: carnes y pescados 6, lácteos y
 *   huevos 6, frutas y verduras 6, cocinados y sobras 4, despensa 4 → 26 en total.
 * - La fila del pollo y las de la FAQ, literales del mismo módulo y de faqJsonLd (metadata.ts).
 *   Los plazos por alimento NO se han podido cotejar con su fuente (FoodSafety.gov, Cold Food
 *   Storage Chart): el dominio no está en la red de fuentes oficiales del Inspector.
 * - Huevos: AESAN, «Huevos y ovoproductos» (aesan.gob.es/seguridad-alimentaria/higiene-alimentos/
 *   huevos-ovoproductos, leído el 07/11/2026): «la "fecha de duración mínima" se fijará en un
 *   máximo de 28 días a partir de la puesta».
 * - Frigorífico: AESAN, folleto «Evita la listeriosis» (2026): «temperaturas inferiores a 5 °C».
 *   La app dice «4 °C o menos»: más estricta, no contradice.
 *
 * La app no lee la fecha, pero el reloj va fijado para que el caso sea reproducible.
 */

const SLUG = 'calculadora-caducidad';
const AHORA = new Date('2026-11-07T10:00:00');

function tabla(page: Page): Locator {
  return page.locator('table').filter({ has: page.getByRole('columnheader', { name: /Nevera/ }) });
}

/** Celdas de cada fila del cuerpo; la primera, sin el emoji decorativo de delante */
async function filas(page: Page): Promise<string[][]> {
  const crudas = await tabla(page)
    .locator('tbody tr')
    .evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.trim())),
    );
  return crudas.map((celdas) =>
    celdas.length === 4 ? [celdas[0].replace(/^\S+\s+/, ''), ...celdas.slice(1)] : celdas,
  );
}

async function abrir(page: Page): Promise<void> {
  await page.clock.setFixedTime(AHORA);
  await page.goto(`/${SLUG}/`);
  const input = page.getByRole('searchbox', { name: 'Buscar alimento' });
  await expect(input).toBeVisible();
  // fill() antes de hidratar cambia el DOM y no el estado: esperar a React
  await expect
    .poll(() => input.evaluate((i) => Object.keys(i).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);
}

async function buscar(page: Page, texto: string): Promise<void> {
  const input = page.getByRole('searchbox', { name: 'Buscar alimento' });
  await input.fill(texto);
  await expect(input).toHaveValue(texto);
}

function filtro(page: Page, nombre: string): Locator {
  return page.getByRole('group', { name: 'Filtrar por categoría' }).getByRole('button', { name: nombre, exact: true });
}

const SIN_RESULTADOS = 'Ningún alimento coincide con la búsqueda.';

test.describe('calculadora-caducidad · tabla de conservación de alimentos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · «pollo» da una fila, y cada filtro enseña su categoría entera', async ({ page }) => {
    // Sin filtro ni búsqueda: los 26 alimentos del módulo
    await expect(tabla(page).locator('tbody tr')).toHaveCount(26);
    await expect(filtro(page, 'Todos')).toHaveAttribute('aria-pressed', 'true');

    // «pollo» → la fila «Pollo crudo» de ALIMENTOS_CADUCIDAD: 1–2 días · 9–12 meses · —
    await buscar(page, 'pollo');
    await expect(tabla(page).locator('tbody tr')).toHaveCount(1);
    expect(await filas(page)).toEqual([['Pollo crudo', '1–2 días', '9–12 meses', '—']]);

    // Filtros, con la búsqueda vacía: 6 + 6 + 6 + 4 + 4 = 26
    await buscar(page, '');
    const recuento: [string, number][] = [
      ['Carnes y pescados', 6],
      ['Lácteos y huevos', 6],
      ['Frutas y verduras', 6],
      ['Cocinados y sobras', 4],
      ['Despensa', 4],
      ['Todos', 26],
    ];
    for (const [nombre, n] of recuento) {
      await filtro(page, nombre).click();
      await expect(filtro(page, nombre)).toHaveAttribute('aria-pressed', 'true');
      await expect(tabla(page).locator('tbody tr'), `filtro «${nombre}»`).toHaveCount(n);
    }
    await expect(filtro(page, 'Despensa')).toHaveAttribute('aria-pressed', 'false');
  });

  test('CASO 2 (límite) · solo espacios no filtra, las mayúsculas no importan y filtro + búsqueda se suman', async ({
    page,
  }) => {
    // «   » se recorta: equivale a no buscar → 26
    await buscar(page, '   ');
    await expect(tabla(page).locator('tbody tr')).toHaveCount(26);

    // «POLLO» encuentra lo mismo que «pollo»
    await buscar(page, 'POLLO');
    await expect(tabla(page).locator('tbody tr')).toHaveCount(1);
    expect((await filas(page))[0][0]).toBe('Pollo crudo');

    // «pollo» dentro de Despensa: el pollo es de «Carnes y pescados» → ninguna fila
    await filtro(page, 'Despensa').click();
    await expect(tabla(page).locator('tbody tr')).toHaveCount(1);
    expect(await filas(page)).toEqual([[SIN_RESULTADOS]]);
  });

  test('CASO 3 (se rechaza) · una búsqueda sin coincidencias avisa y no deja filas de alimentos', async ({ page }) => {
    await buscar(page, 'xyz');
    await expect(tabla(page).locator('tbody tr')).toHaveCount(1);
    expect(await filas(page)).toEqual([[SIN_RESULTADOS]]);
  });

  test('FAQ del JSON-LD · los plazos de carne, pollo y sobras son los de la tabla', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((t) => JSON.parse(t)).find((j) => j['@type'] === 'FAQPage');
    expect(faq, 'la app publica su FAQPage').toBeTruthy();
    const respuesta = (pregunta: string): string =>
      faq.mainEntity.find((q: { name: string }) => q.name === pregunta).acceptedAnswer.text;

    const carne = respuesta('¿Cuánto dura la carne cruda en la nevera?');
    expect(carne).toContain('picada cruda aguanta solo 1 o 2 días');
    expect(carne).toContain('chuletas enteras duran de 3 a 5 días');
    expect(carne).toContain('pollo crudo, de 1 a 2 días');
    const sobras = respuesta('¿Cuánto duran las sobras de comida cocinada?');
    expect(sobras).toContain('de 3 a 4 días en la nevera y de 2 a 3 meses en el congelador');

    const todas = await filas(page);
    const fila = (nombre: string) => todas.find((f) => f[0] === nombre);
    expect(fila('Carne picada cruda')?.[1]).toBe('1–2 días');
    expect(fila('Filetes y chuletas crudas')?.[1]).toBe('3–5 días');
    expect(fila('Pollo crudo')?.[1]).toBe('1–2 días');
    expect(fila('Sobras de comida cocinada')?.slice(1, 3)).toEqual(['3–4 días', '2–3 meses']);
  });

  test('HALLAZGO 4189 (07/11/2026, REPARADO) · el buscador no encontraba sin tilde: «platano», «jamon» y «cascara» daban 0 filas', async ({
    page,
  }) => {
    // El filtro comparaba con toLowerCase (page.tsx), así que «platano» no casaba con «Plátano».
    // Es la clase de defecto del cabo C0658 de las guías-directorio (fe67977b2): la receta es
    // normalizarBusqueda de lib/buscadorTablas en las dos partes de la comparación.
    // REPARADO en /reparar el 07/11/2026 con esa receta. Y con tilde sigue encontrando:
    await buscar(page, 'plátano');
    expect((await filas(page)).map((f) => f[0])).toEqual(['Plátano']);
    const casos: [string, string][] = [
      ['platano', 'Plátano'],
      ['jamon', 'Jamón cocido (abierto)'],
      ['cascara', 'Huevos (con cáscara)'],
    ];
    for (const [consulta, nombre] of casos) {
      await buscar(page, consulta);
      expect((await filas(page)).map((f) => f[0]), `«${consulta}»`).toEqual([nombre]);
    }
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · huevos: «3–5 sem.» en nevera pasa del máximo de 28 días desde la puesta (AESAN)', async ({
    page,
  }) => {
    // AESAN, «Huevos y ovoproductos»: la fecha de duración mínima de los huevos de gallina «se
    // fijará en un máximo de 28 días a partir de la puesta». La tabla da hasta 5 semanas
    // (35 días) en la nevera, sin decir desde cuándo: aun contando desde la puesta, una semana
    // más allá de la fecha más larga que puede llevar la etiqueta. El plazo viene de USDA,
    // pensado para huevo lavado y refrigerado desde el origen.
    // Esperado: el tope del plazo no pasa de 28 días (o remite a la fecha de la etiqueta).
    // Hoy: «3–5 sem.» → 35 días.
    test.fail();
    await buscar(page, 'huevo');
    const [fila] = await filas(page);
    expect(fila[0]).toBe('Huevos (con cáscara)');
    const m = fila[1].match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(sem|d[ií]a)/);
    const dias = m ? Number(m[2] ?? m[1]) * (m[3] === 'sem' ? 7 : 1) : 0;
    expect(dias, `nevera «${fila[1]}»`).toBeLessThanOrEqual(28);
  });

  test('HALLAZGO 4191 (07/11/2026, REPARADO) · la nota de la fuente escribía la fecha en ISO: «Verificado 2026-06»', async ({
    page,
  }) => {
    // Formato español de fechas (CLAUDE.md global §2): «06/2026» o «junio de 2026».
    // Antes: «Verificado 2026-06.» (CADUCIDAD_META.verificado pintado tal cual). REPARADO el 07/11/2026.
    const nota = page.locator('p', { hasText: 'Tiempos orientativos' });
    await expect(nota).toContainText('Verificado');
    const texto = await nota.innerText();
    expect(texto).not.toMatch(/\b\d{4}-\d{2}\b/);
    expect(texto).toContain('Verificado 06/2026.');
  });

  test('HALLAZGO 4192 (07/11/2026, REPARADO) · prometía «cada alimento» y no tiene marisco ni salchichas', async ({ page }) => {
    // El h1 («¿Cuánto dura cada alimento?») y la description («cuántos días o meses aguanta cada
    // alimento») prometían todos; la tabla tiene 26 alimentos, y el propio JSON-LD los llama
    // «alimentos habituales». REPARADO el 07/11/2026 (frontera:promesa, nivel 2): la promesa se
    // ajusta a lo que hay («los alimentos habituales»).
    const h1 = await page.locator('h1').first().innerText();
    const descripcion = (await page.locator('meta[name="description"]').first().getAttribute('content')) ?? '';
    const promete = /cada alimento/i.test(h1) || /cada alimento/i.test(descripcion);
    for (const consulta of ['marisco', 'salchichas']) {
      await buscar(page, consulta);
      const vacio = JSON.stringify(await filas(page)) === JSON.stringify([[SIN_RESULTADOS]]);
      expect(promete && vacio, `promete «cada alimento» y «${consulta}» no sale`).toBe(false);
    }
    expect(h1).toBe('¿Cuánto duran los alimentos habituales?');
    expect(descripcion).toContain('los alimentos habituales');
    expect(await page.title()).not.toMatch(/cada alimento/i);
  });
});

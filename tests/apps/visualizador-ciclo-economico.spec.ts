import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — visualizador-ciclo-economico (segmento interactiva · economía)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Ciclo Económico» y en el subtítulo
 * «Expansión, pico, recesión y recuperación — indicadores leading/lagging y la curva de
 * rendimientos como predictor de recesión». Cuatro bloques, todo en page.tsx, sin motor aparte:
 *   1. Una sinusoide y = 110 − 70·sin(2,5πt) (viewBox 700 × 220, x = 40 + 620·t) con un punto que
 *      la recorre y cuatro tramos pulsables (ZONAS_FASE), más cuatro tarjetas de fase.
 *   2. Trece indicadores leading/coincident/lagging con su dato de España y de la Eurozona.
 *   3. La curva de rendimientos (YIELD_CURVE_DATA) normal, plana e invertida.
 *   4. Un simulador de seis preguntas Sí/No que puntúa cada fase (interpretarRespuestas).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/vce-esperados.mjs)
 *   CASO 1 (normal) — simulador con una expansión de manual: PIB creció Sí, paro bajando Sí,
 *     inflación > 3 % No, tipos subiendo No, PMI > 50 Sí, curva invertida No. Con las reglas de
 *     interpretarRespuestas reparadas el 19/11/2026 (hallazgo 5125): Expansión 2+2+1+0+2+1 = 8 ·
 *     Pico 2+1+0+0+1+0 = 4 · Valle 0+0+1+1+1+1 = 4 → «Expansión». Seis Sí: Pico 2+1+2+2+1+2 = 10 ·
 *     Expansión 2+2+0+1+2+0 = 7 · Valle 1 → «Pico». (Con el PIB creciendo, Recesión no se elige;
 *     sin crecer, Expansión y Pico tampoco.)
 *   CASO 2 (límite: los extremos de la curva) — la sinusoide tiene su máximo en t = 0,2
 *     (x 164, y 40) y su mínimo en t = 0,6 (x 412, y 180); el eje los rotula «Pico» (40, 32) y
 *     «Valle» (40, 198), y la página define el Pico como «la economía está en su punto máximo» y el
 *     Valle como «la economía toca fondo». Al pulsar «Pico» el punto debe quedar en lo alto
 *     (cy < 110 − 0,9·70 = 47) y al pulsar «Valle / Recuperación», en lo hondo (cy > 173).
 *     El código pone el punto en el centro de su tramo: Pico t = 0,425 → cy = 123,7 (por DEBAJO
 *     de la tendencia, bajando) y Valle t = 0,875 → cy = 71,1 (por encima, subiendo); el máximo
 *     cae en el tramo «Expansión» y el mínimo en «Recesión».
 *   CASO 3 (rechazo) — PIB creció Sí, paro bajando Sí, inflación Sí, tipos No, PMI No, curva Sí.
 *     La página define la recesión como «dos trimestres consecutivos de PIB negativo» con
 *     «destrucción de empleo, paro en alza»: con el PIB creciendo y el paro bajando, «Recesión»
 *     queda excluida. Las reglas dan Recesión 1+2+3 = 6 · Expansión 2+2+1 = 5 · Pico 1+1+2+1 = 5 →
 *     «Recesión: la economía se contrae». Es una de 5 combinaciones con «PIB creció = Sí» que lo dan.
 *   Curva de rendimientos — tramo 2a y 10a de YIELD_CURVE_DATA: normal 3,2 → 3,9 (positiva),
 *     plana 3,5 → 3,5, invertida 4,0 → 3,5 (2a > 10a): coherente con cada rótulo.
 *   Contraste — blanco sobre #22c55e = 2,28:1 y sobre #ef4444 = 3,76:1 (WCAG, texto normal 4,5:1).
 *
 * FUENTE: tipos oficiales del BCE, tabla «Key ECB interest rates» (www.ecb.europa.eu, consultada
 * el 18/11/2026): operaciones principales de financiación al 4,50 % desde el 20/09/2023, 4,25 %
 * desde el 12/06/2024 (la primera bajada) y 2,65 % desde el 16/09/2026.
 *
 * CABO C0825 (18/11/2026), los datos de los indicadores cotejados con la red de fuentes oficiales:
 *   - Afiliados de abril de 2024, Seguridad Social (www.seg-social.es, Estadísticas > Afiliación >
 *     Afiliación media mensual > Afiliados medios TOTALES, fichero «Serie de afiliación media por
 *     regímenes (Total Sistema)» 2001-2026, publicado el 04/11/2026): Total Sistema abril 2024
 *     21.101.504,9 y abril 2023 20.614.988,6 → 21,1 millones y +2,36 % (+2,4 %). A último día del
 *     mes (EST305 > EST306, «Serie Afiliados Último Día por Regímenes 1985-septiembre 2026»):
 *     21.082.893 y 20.678.484 → 21,1 millones y +1,96 %. Ninguna da «21,2 millones (+3,1 %)».
 *   - PMI (S&P Global/HCOB): encuesta privada, sin fuente oficial que lo publique.
 *   - Diferencial Bund 10a-2a y permisos de vivienda de 2023: su fuente (Bundesbank o el portal de
 *     datos del BCE; Ministerio de Transportes) no está en la red de la tarea, y el INE no publica
 *     permisos ni visados. Medias del NBER: nber.org tampoco está. La app no cita fuente para
 *     ninguna de las tres: se piden retiradas o con su origen (decisión del usuario, C0203).
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES' });

const RUTA = '/visualizador-ciclo-economico/';

type Respuesta = 'Sí' | 'No';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // El punto del ciclo se anima sin parar: el DOM no se aquieta nunca, de ahí el tope corto
  await esperarPaginaAsentada(page, { maximoMs: 1500 });
}

const svgCiclo = (page: Page): Locator => page.getByRole('img', { name: /Curva sinusoidal del ciclo/ });
const punto = (page: Page): Locator => svgCiclo(page).locator('circle');
const preguntas = (page: Page): Locator => page.locator('[class$="_preguntaCard"]');
const resultado = (page: Page): Locator => page.getByRole('region', { name: 'Resultado del simulador' });

async function cyDelPunto(page: Page): Promise<number> {
  return Number(await punto(page).getAttribute('cy'));
}

async function responder(page: Page, respuestas: Respuesta[]): Promise<void> {
  for (const [i, r] of respuestas.entries()) {
    const boton = preguntas(page).nth(i).getByRole('button', { name: r, exact: true });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
}

async function abrirIndicador(page: Page, nombre: string): Promise<Locator> {
  await page.getByRole('button', { name: nombre, exact: true }).click();
  const detalle = page.getByRole('region', { name: `Detalle: ${nombre}` });
  await expect(detalle).toBeVisible();
  return detalle;
}

test.describe('Simulador «¿En qué fase estamos?»', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await expect(preguntas(page)).toHaveCount(6);
  });

  test('CASO 1 (normal): una expansión de manual (Sí, Sí, No, No, Sí, No) da «Expansión» (8 frente a 4)', async ({ page }) => {
    await responder(page, ['Sí', 'Sí', 'No', 'No', 'Sí', 'No']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Expansión');
  });

  test('seis Sí dan «Pico» (10 frente a 7 de Expansión)', async ({ page }) => {
    await responder(page, ['Sí', 'Sí', 'Sí', 'Sí', 'Sí', 'Sí']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Pico');
  });

  test('con 5 de las 6 respuestas no hay resultado, y desmarcar la sexta lo retira', async ({ page }) => {
    await responder(page, ['Sí', 'Sí', 'No', 'No', 'Sí']);
    await expect(resultado(page)).toHaveCount(0);
    const sexta = preguntas(page).nth(5).getByRole('button', { name: 'No', exact: true });
    await sexta.click();
    await expect(resultado(page)).toHaveCount(1);
    await sexta.click();
    await expect(sexta).toHaveAttribute('aria-pressed', 'false');
    await expect(resultado(page)).toHaveCount(0);
  });

  test('CASO 3 (rechazo) — REPARADO 5125: con el PIB creciendo y el paro bajando no puede salir «Recesión»', async ({ page }) => {
    // La propia página: «Técnicamente: dos trimestres consecutivos de PIB negativo» y «Destrucción
    // de empleo, paro en alza». Antes: Recesión 6 · Expansión 5 · Pico 5 → «Recesión». Ahora la
    // inflación alta y la curva invertida son señales de pico (la página: la inversión PRECEDE a la
    // recesión): Pico 2+1+2+0+0+2 = 7 · Expansión 4 · Valle 2 → «Pico».
    await responder(page, ['Sí', 'Sí', 'Sí', 'No', 'No', 'Sí']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Pico');
  });

  test('REPARADO 5125: el perfil de la tarjeta Recesión (seis No) da «Recesión», no «Valle»', async ({ page }) => {
    // Antes: Valle 8 · Recesión 5 → «Valle / Recuperación». Ahora Recesión 2+2+1+1+2+0 = 8 ·
    // Valle 2+1+1+1+1+1 = 7.
    await responder(page, ['No', 'No', 'No', 'No', 'No', 'No']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Recesión');
  });

  test('REPARADO 5125: PIB que no crece con el PMI ya por encima de 50 da «Valle / Recuperación»', async ({ page }) => {
    // No, No, No, No, Sí, No: Valle 2+1+1+1+1+1 = 7 · Recesión 2+2+1+1+0+0 = 6 (Expansión y Pico,
    // fuera: el PIB no creció). Es la tarjeta del valle: «primeros síntomas de rebote».
    await responder(page, ['No', 'No', 'No', 'No', 'Sí', 'No']);
    await expect(resultado(page).locator('h3')).toHaveText('Fase estimada: Valle / Recuperación');
  });
});

test.describe('Las cuatro fases sobre la curva', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('la curva tiene su máximo en y = 40 y su mínimo en y = 180, y el eje los rotula «Pico» y «Valle»', async ({ page }) => {
    const ys = await svgCiclo(page)
      .locator('path:not([role])')
      .first()
      .evaluate((p) => (p.getAttribute('d') ?? '').match(/-?\d+(\.\d+)?/g)!.map(Number).filter((_, i) => i % 2 === 1));
    expect(Math.min(...ys)).toBeCloseTo(40, 0);
    expect(Math.max(...ys)).toBeCloseTo(180, 0);
    const rotulos = await svgCiclo(page).locator('text').evaluateAll((ts) =>
      ts.map((t) => ({ texto: t.textContent, y: Number(t.getAttribute('y')) })),
    );
    expect(rotulos.find((r) => r.texto === 'Pico')!.y).toBeLessThan(40);
    expect(rotulos.find((r) => r.texto === 'Valle')!.y).toBeGreaterThan(180);
  });

  test('pulsar una tarjeta para la animación, marca la tarjeta y cambia el detalle', async ({ page }) => {
    await page.getByRole('button', { name: 'Recesión', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Recesión', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('region', { name: /Detalle de la fase/ }).locator('h3')).toHaveText('Recesión');
    await expect(page.getByRole('button', { name: 'Reanudar animación' })).toBeVisible();
    const cx = await punto(page).getAttribute('cx');
    await page.waitForTimeout(600);
    expect(await punto(page).getAttribute('cx')).toBe(cx);
  });

  test('CASO 2 (límite) — REPARADO 5124: «Pico» pone el punto en lo alto de la curva y «Valle / Recuperación» en lo hondo', async ({ page }) => {
    // Antes: Pico cy = 123,7 (bajo la tendencia, y = 110) y Valle cy = 71,1 (sobre ella); el máximo
    // (y 40) estaba en el tramo «Expansión» y el mínimo (y 180) en el de «Recesión».
    await page.getByRole('button', { name: 'Pico', exact: true }).click();
    await expect(page.getByRole('region', { name: /Detalle de la fase/ }).locator('h3')).toHaveText('Pico');
    expect(await cyDelPunto(page), 'Pico: en lo alto (cy < 47)').toBeLessThan(47);
    await page.getByRole('button', { name: 'Valle / Recuperación', exact: true }).click();
    await expect(page.getByRole('region', { name: /Detalle de la fase/ }).locator('h3')).toHaveText('Valle / Recuperación');
    expect(await cyDelPunto(page), 'Valle: en lo hondo (cy > 173)').toBeGreaterThan(173);
    // Expansión, por encima de la tendencia y subiendo; Recesión, en la bajada (cruza la tendencia)
    await page.getByRole('button', { name: 'Expansión', exact: true }).click();
    const cyExpansion = await cyDelPunto(page);
    expect(cyExpansion, 'Expansión: sobre la tendencia, sin llegar a la cima').toBeGreaterThan(47);
    expect(cyExpansion).toBeLessThan(110);
    await page.getByRole('button', { name: 'Recesión', exact: true }).click();
    const cyRecesion = await cyDelPunto(page);
    expect(cyRecesion, 'Recesión: entre la cima y el fondo').toBeGreaterThan(47);
    expect(cyRecesion).toBeLessThan(173);
  });

  test('REPARADO 5124: el máximo de la curva cae en el tramo «Fase: Pico» y el mínimo en «Fase: Valle / Recuperación»', async ({ page }) => {
    const tramos = await svgCiclo(page).locator('path[role="button"]').evaluateAll((ps) =>
      ps.map((p) => {
        const ys = (p.getAttribute('d') ?? '').match(/-?\d+(\.\d+)?/g)!.map(Number).filter((_, i) => i % 2 === 1);
        return { nombre: p.getAttribute('aria-label'), min: Math.min(...ys), max: Math.max(...ys) };
      }),
    );
    const pico = tramos.find((t) => t.nombre === 'Fase: Pico')!;
    const valle = tramos.find((t) => t.nombre === 'Fase: Valle / Recuperación')!;
    expect(pico.min, 'el máximo (y 40) está en el tramo del pico').toBeCloseTo(40, 0);
    expect(valle.max, 'el mínimo (y 180) está en el tramo del valle').toBeCloseTo(180, 0);
    for (const t of tramos.filter((t) => t.nombre !== 'Fase: Pico')) expect(t.min, `${t.nombre} no contiene la cima`).toBeGreaterThan(41);
    for (const t of tramos.filter((t) => t.nombre !== 'Fase: Valle / Recuperación')) expect(t.max, `${t.nombre} no contiene el fondo`).toBeLessThan(179);
  });
});

test.describe('Curva de rendimientos', () => {
  test('el tramo 2a-10a de cada estado cuadra con su rótulo: normal 3,2 < 3,9 · plana 3,5 = 3,5 · invertida 4,0 > 3,5', async ({ page }) => {
    await abrir(page);
    const esperados: Record<string, [string, string]> = {
      Normal: ['3,2', '3,9'],
      Plana: ['3,5', '3,5'],
      Invertida: ['4,0', '3,5'],
    };
    for (const [estado, [dos, diez]] of Object.entries(esperados)) {
      const boton = page.getByRole('button', { name: estado, exact: true });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      const grafico = page.getByRole('img', { name: `Curva de rendimientos en estado ${estado.toLowerCase()}` });
      // Las etiquetas de los puntos son las únicas con un decimal; orden 3m, 1a, 2a, 5a, 10a, 30a
      const etiquetas = (await grafico.locator('text').allTextContents()).filter((t) => /^\d,\d\s%$/.test(t));
      expect(etiquetas).toHaveLength(6);
      expect(etiquetas[2]).toMatch(new RegExp(`^${dos}\\s%$`));
      expect(etiquetas[4]).toMatch(new RegExp(`^${diez}\\s%$`));
    }
  });
});

test.describe('Indicadores', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('REPARADO 5126: el dato «Eurozona» de los Tipos de Interés Oficiales es el del BCE, no el de la Fed', async ({ page }) => {
    const detalle = await abrirIndicador(page, 'Tipos de Interés Oficiales');
    const eurozona = detalle.locator('div', { hasText: 'Eurozona' }).last().locator('strong');
    await expect(eurozona).toBeVisible();
    // Antes: «Fed Funds rate (abr. 2024): 5,25-5,50% (tipos máximos desde 2001)». BCE, tabla «Key ECB
    // interest rates»: operaciones principales al 4,50 % del 20/09/2023 al 12/06/2024.
    await expect(eurozona).not.toContainText('Fed');
    await expect(eurozona).toContainText('BCE (abr. 2024): 4,50 %');
  });

  test.fail('HALLAZGO ABIERTO: «Ver solo España» deja ver solo el dato de España', async ({ page }) => {
    const boton = page.getByRole('button', { name: 'Ver solo España' });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    const detalle = await abrirIndicador(page, 'PIB Trimestral');
    await expect(detalle).toContainText('PIB España Q1 2024');
    // Hoy los dos datos siguen a la vista; el botón solo cambia qué recuadro lleva el borde
    await expect(detalle.getByText('PIB Eurozona Q1 2024')).toBeHidden();
  });

  test('REPARADO 5127: lo que se anuncia como «los datos actuales» no puede ser el tipo del BCE de abril de 2024', async ({ page }) => {
    // Reparado bajando la promesa: el subtítulo dice ahora «un dato de ejemplo de 2023-2024 (no son
    // los últimos publicados)».
    // BCE: 4,50 % hasta el 12/06/2024 (primera bajada, 4,25 %); 2,65 % desde el 16/09/2026.
    const subtitulo = await page
      .getByRole('heading', { name: 'Indicadores leading, coincident y lagging' })
      .locator('xpath=following-sibling::p')
      .innerText();
    const detalle = await abrirIndicador(page, 'Tipos de Interés Oficiales');
    const espana = (await detalle.locator('div', { hasText: 'España' }).last().locator('strong').innerText()).trim();
    const prometeActuales = /datos actuales/i.test(subtitulo);
    const esDeAbril2024 = /abr\. 2024/.test(espana);
    expect(prometeActuales && esDeAbril2024, `«${subtitulo}» frente a «${espana}»`).toBe(false);
    expect(subtitulo).toContain('no son los últimos publicados');
  });
});

test.describe('Datos de los indicadores frente a su fuente (cabo C0825)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('HALLAZGO ABIERTO (C0825): los afiliados de abril de 2024 son los de la Seguridad Social, 21,1 millones (+2,4 %)', async ({ page }) => {
    // www.seg-social.es, serie de afiliación media (Total Sistema): abril 2024 21.101.504,9 frente a
    // abril 2023 20.614.988,6 → +2,36 %. A último día del mes, 21.082.893 → +1,96 %. Hoy la app
    // pinta «21,2 millones (+3,1% interanual)». Si la reparación del 5127 cambia la fecha del dato,
    // este caso se rehace cotejando el nuevo mes en la misma serie.
    const detalle = await abrirIndicador(page, 'Empleo y Afiliaciones');
    const espana = (await detalle.locator('div', { hasText: 'España' }).last().locator('strong').innerText()).trim();
    expect(espana, 'el caso coteja el dato de abril de 2024').toMatch(/abr\. 2024/);
    expect(espana).toMatch(/21,1\s*millones/);
    expect(espana).toMatch(/\+2,[04]\s?%/);
  });

  test.fail('HALLAZGO ABIERTO (C0825): el PMI, encuesta privada de S&P Global/HCOB, dice su origen o no sale como dato', async ({ page }) => {
    // Hoy: «PMI industria España (abr. 2024): 51,4» y «Eurozona (abr. 2024): 45,7», sin editor, entre
    // datos del INE, Eurostat y el BCE. Solo la pregunta 5 del simulador nombra a S&P Global.
    const detalle = await abrirIndicador(page, 'PMI Manufacturero');
    const texto = await detalle.innerText();
    if (/\d+,\d/.test(texto)) expect(texto).toMatch(/S&P Global|HCOB/);
  });

  test.fail('HALLAZGO ABIERTO (C0825): el diferencial del Bund y los permisos de 2023 dicen su fuente o no salen', async ({ page }) => {
    // Ninguna de las dos fuentes (Bundesbank o el portal de datos del BCE; Ministerio de Transportes)
    // está en la red de la tarea, y la app no cita ninguna: no se pueden cotejar.
    const curva = await (await abrirIndicador(page, 'Curva de Rendimientos')).innerText();
    if (/Bund/.test(curva)) expect(curva, 'Bund 10a-2a').toMatch(/Bundesbank|BCE|fuente/i);
    const permisos = await (await abrirIndicador(page, 'Permisos de Construcción')).innerText();
    if (/Permisos vivienda/.test(permisos)) expect(permisos, 'permisos de vivienda').toMatch(/Ministerio|Transportes|visados|licencias|fuente/i);
  });

  test.fail('HALLAZGO ABIERTO (C0825): las medias del NBER dicen a qué periodo corresponden, o no salen', async ({ page }) => {
    // Hoy: «Según el NBER, que data los ciclos de EEUU desde 1854: Expansión media ~5 años (60 meses)
    // · Recesión media ~11 meses», sin el periodo de la media. nber.org no está en la red de la tarea.
    const lineas = await page.locator('li', { hasText: /^(Expansión|Recesión) media/ }).allTextContents();
    for (const linea of lineas) {
      const primeraFrase = linea.split('.')[0];
      expect(primeraFrase, linea).toMatch(/\b(1[89]\d\d|20\d\d)\b/);
    }
  });
});

test.describe('Accesibilidad', () => {
  test('REPARADO 5129: el texto blanco de «Sí» y «No» marcados llega a 4,5:1', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); // sin la transición de 0,2 s del fondo
    await abrir(page);
    const si = preguntas(page).nth(0).getByRole('button', { name: 'Sí', exact: true });
    const no = preguntas(page).nth(1).getByRole('button', { name: 'No', exact: true });
    await si.click();
    await no.click();
    await expect(si).toHaveAttribute('aria-pressed', 'true');
    await expect(no).toHaveAttribute('aria-pressed', 'true');
    // Antes: blanco sobre #22c55e = 2,28:1 y sobre #ef4444 = 3,76:1; ahora #136E35 y #B91C1C
    expect(await contrasteSobreFondoReal(si), 'Sí marcado').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteSobreFondoReal(no), 'No marcado').toBeGreaterThanOrEqual(4.5);
  });

  test.fail('HALLAZGO ABIERTO: con «reducir movimiento» el punto del ciclo no arranca solo', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrir(page);
    const antes = await punto(page).getAttribute('cx');
    await page.waitForTimeout(1500);
    // Hoy avanza ~0,0008 de ciclo por fotograma (≈ 30 px/s) aunque el sistema pida reducirlo
    expect(await punto(page).getAttribute('cx')).toBe(antes);
  });

  test.fail('HALLAZGO ABIERTO: el aviso fijo «Este es un ejercicio educativo…» no es una alerta', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Este es un ejercicio educativo. No constituye asesoramiento financiero.')).toBeVisible();
    await expect(page.locator('[role="alert"]', { hasText: 'ejercicio educativo' })).toHaveCount(0);
  });
});

test.describe('Textos', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('HALLAZGO ABIERTO: el FAQPage da a la curva invertida el mismo horizonte que la página («6-24 meses»)', async ({ page }) => {
    const respuesta = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
        if (j['@type'] !== 'FAQPage') continue;
        const q = j.mainEntity?.find((e) => /curva de rendimientos invertida/.test(e.name));
        if (q) return q.acceptedAnswer.text;
      }
      return '';
    });
    const subtitulo = await page.getByText(/El predictor más fiable de recesiones/).innerText();
    const rango = (t: string): string | undefined => t.match(/(\d+)-24 meses/)?.[1];
    expect(rango(subtitulo)).toBe('6');
    // Hoy el FAQPage dice «un horizonte de 12-24 meses»
    expect(rango(respuesta)).toBe(rango(subtitulo));
  });

  test.fail('HALLAZGO ABIERTO: sin «Però» (catalán) ni «professional» (inglés) en los textos', async ({ page }) => {
    const bolsa = await abrirIndicador(page, 'Bolsa de Valores');
    await expect(bolsa).not.toContainText('Però');
    await responder(page, ['Sí', 'Sí', 'No', 'No', 'Sí', 'No']);
    await expect(resultado(page)).not.toContainText('professional');
  });

  test.fail('HALLAZGO ABIERTO: el porcentaje va separado de la cifra («3 %», no «3%»)', async ({ page }) => {
    const textos = await page.locator('header, section').allTextContents();
    const pegados = textos.join(' ').match(/\d%/g) ?? [];
    expect(pegados, `pegados: ${pegados.length}`).toHaveLength(0);
  });
});

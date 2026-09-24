import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PESOS, PREGUNTAS, UMBRAL_COMPLEMENTARIO, UMBRAL_PUBLICO, VEREDICTOS } from '../../app/selector-seguro-salud/motor';

/**
 * Asesor de Seguro de Salud (selector-seguro-salud) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · No hay empates: es UNA puntuación contra dos umbrales, más tres respuestas que fuerzan
 *     «sanidad pública» (seguro completo de empresa, MUFACE/ISFAS o «Nada, no quiero gasto»).
 *   · Razones fijas: «sanidad pública» empezaba SIEMPRE por «Tu uso médico actual no justifica
 *     el coste mensual de un seguro privado», también en los 41.408 perfiles en los que lo
 *     había decidido «Nada, no quiero gasto extra» y la puntuación sola habría dado «seguro
 *     completo»; y «seguro completo» salía sin una sola razón en 14.312 perfiles.
 *
 * EL MOTOR (app/selector-seguro-salud/motor.ts): mismos puntos, umbrales y respuestas que
 * fuerzan (veredicto y puntuación idénticos en las 1.048.576 combinaciones). Las razones dicen
 * qué ha decidido el resultado y qué respuestas han sumado y restado.
 *
 * Después, el 24/09/2026, la reparación de los hallazgos 1420-1436 cambió el motor a propósito:
 * filtros (seguro de empresa, mutualidad en la 5 o en la 10, «Hasta 40 €/mes»), la pregunta 3
 * por la espera en tu zona y la 4 con cinco opciones. El test «motor» de abajo se reescribió.
 */

async function esperarHidratacionBotones(page: Page): Promise<void> {
  // Sin <input> no hay rastreador que sondear (`_hidratacion.ts`): el testigo es que React
  // haya colgado sus props del botón de inicio. Mismo criterio que selector-smartphone.
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => /Empezar el test/.test(b.textContent ?? ''));
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-seguro-salud/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu perfil de cobertura sanitaria' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Muy frecuente (+3) · Varios especialistas (+3) · Comunidad con más presión (+2) · 2 o más
// hijos (+3) · Autónomo (+2) · Acceso rápido crítico (+3) · Dental, gasto importante (+3) ·
// Seguro anterior satisfecho (+2) · «NADA, no quiero gasto extra» (−3) · Sin seguro de
// empresa (0) = 18 → la puntuación diría «completo», y la respuesta «Nada» fuerza «pública».
// Antes: «Tu uso médico actual no justifica el coste mensual de un seguro privado».
const NADA_CON_USO_ALTO = [3, 2, 2, 2, 1, 3, 2, 0, 0, 2] as const;

// Muy frecuente (+3) · Varios especialistas (+3) · Comunidad con más presión (+2) · Sin hijos ·
// Por cuenta ajena · Acceso rápido «muy importante» (+2) · Dental, gasto importante (+3) ·
// Seguro anterior satisfecho (+2) · Más de 100 €/mes (+1) · Sin seguro de empresa = 16 →
// completo. Antes, «Por qué esta orientación» salía VACÍO: sus tres razones exigían hijos,
// ser autónomo o acceso «crítico».
const COMPLETO_SIN_HIJOS = [3, 2, 2, 0, 0, 2, 2, 0, 3, 2] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(3).click();
  await expect(grupo.locator('[role="radio"]').nth(3)).toHaveAttribute('aria-checked', 'true');
  await grupo.locator('[role="radio"]').nth(0).click();
  await expect(grupo.locator('[role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
});

test('la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    const pedido = Number(await page.locator('[class*="progresoRelleno"]').getAttribute('data-progreso')) / 100;
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo(pedido, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('si lo decide el presupuesto, se dice: no se atribuye a un uso médico bajo', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, NADA_CON_USO_ALTO);
  await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Sanidad pública es suficiente');
  expect(texto).not.toContain('Tu uso médico actual no justifica');
  expect(texto).toContain('Has dicho que no quieres ningún gasto extra: con ese presupuesto la orientación es la sanidad pública');
  expect(texto).toContain('Sin esa respuesta, tu puntuación (18) apuntaría a «seguro privado completo recomendado».');
  expect(texto).toContain('Visitas al médico: «Muy frecuente (más de 10 veces)» suma 3 puntos.');
  expect(texto).toContain('Especialistas: «Sí, varios especialistas» suma 3 puntos.');
  expect(texto).toContain('Hijos: «Sí, 2 o más hijos» suma 3 puntos.');
});

test('«seguro completo» siempre dice por qué, aunque no haya hijos ni se sea autónomo', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, COMPLETO_SIN_HIJOS);
  await expect(page.locator('[class*="veredictoValor"]')).toHaveText('Seguro privado completo recomendado');
  await expect(page.locator('[class*="razonItem"]')).not.toHaveCount(0);
  expect(texto).toContain('Tu puntuación es 16: desde 8, un seguro privado completo.');
  expect(texto).toContain('Salud dental: «Es un gasto importante para mí cada año» suma 3 puntos.');
});

test('motor: filtros, avisos y la cuenta entera, en las 1.310.720 combinaciones', () => {
  // Reescrito el 24/09/2026 (reparación de 1420-1436). Antes exigía `forzado ? 'publico'` para
  // las tres respuestas que deciden, lo que consagraba el título «Sanidad pública es suficiente»
  // a quien tiene un seguro completo de empresa (1434); y recorría 4^10 perfiles: la pregunta 4
  // separa ahora «embarazada ahora» de «planeo un embarazo» (1424), así que son 4^9 · 5.
  test.setTimeout(240_000);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const cuenta = { total: 0, poco: 0, mutualistas: 0, cronicosQueContratan: 0, embarazoCurso: 0, empresa: 0 };
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      cuenta.total++;
      const res = calcularResultado(r);
      let puntos = 0;
      for (const [id, porRespuesta] of Object.entries(PESOS)) puntos += porRespuesta[r[Number(id)]] ?? 0;
      const porPuntos = puntos <= UMBRAL_PUBLICO ? 'publico' : puntos <= UMBRAL_COMPLEMENTARIO ? 'complementario' : 'completo';
      const mutualista = r[10] === 'muface' || r[5] === 'funcionario';
      const esperado =
        r[10] === 'si_completo' ? 'empresa'
          : mutualista ? 'mutualidad'
            : r[9] === 'nada' ? 'publico'
              : r[9] === 'poco' && porPuntos === 'completo' ? 'complementario'
                : porPuntos;
      if (res.puntuacion !== puntos) mal('puntuación distinta');
      if (res.veredicto !== esperado) mal(`veredicto ${res.veredicto}, esperado ${esperado}`);
      if (res.razones.length === 0) mal('sin razones');
      // 1423: «Hasta 40 €/mes» nunca acaba en el seguro completo.
      if (r[9] === 'poco') { cuenta.poco++; if (res.veredicto === 'completo') mal('completo con «Hasta 40 €/mes»'); }
      // 1421: la mutualidad, declarada en la 5 o en la 10, nunca acaba en «contrata un seguro».
      if (mutualista && r[10] !== 'si_completo') {
        cuenta.mutualistas++;
        if (res.veredicto === 'complementario' || res.veredicto === 'completo') mal('mutualista al que se orienta a contratar');
      }
      // 1422: quien tiene una enfermedad crónica y sale «contratar» recibe SIEMPRE el aviso.
      if (r[2] === 'cronico' && (res.veredicto === 'complementario' || res.veredicto === 'completo')) {
        cuenta.cronicosQueContratan++;
        if (!res.avisos.some((a) => a.includes('cuestionario de salud') && a.includes('suele quedar excluida'))) mal('crónica sin aviso de preexistencias');
      }
      // 1424: el embarazo en curso no suma puntos y, si no hay filtro, se avisa de que ese parto no se cubre.
      if (r[4] === 'embarazo_curso') {
        cuenta.embarazoCurso++;
        if (res.razones.some((x) => x.includes('embarazada') && x.includes('suma'))) mal('el embarazo en curso suma');
        if (!res.forzadoPor && !res.avisos.some((a) => a.includes('no cubra este embarazo ni este parto'))) mal('embarazo en curso sin aviso');
      }
      // 1434: con seguro completo de empresa el título no es «Sanidad pública es suficiente».
      if (r[10] === 'si_completo') { cuenta.empresa++; if (VEREDICTOS[res.veredicto].nombre === 'Sanidad pública es suficiente') mal('empresa titulada pública'); }
      // 1432: sin filtro, la cuenta que se ve da el total (todas las sumas y todas las restas).
      if (!res.forzadoPor) {
        const citados = res.razones
          .map((x) => x.match(/» (suma|resta) (\d+) puntos?\.$/))
          .filter((m): m is RegExpMatchArray => m !== null)
          .reduce((acc, m) => acc + (m[1] === 'suma' ? 1 : -1) * Number(m[2]), 0);
        if (citados !== puntos) mal(`la cuenta visible da ${citados} y la puntuación es ${puntos}`);
      }
      // 1425 y 1433: ni la descripción fija de antes ni la asunción de capacidad de ahorro.
      if (res.descripcion.includes('principalmente para reducir tiempos de espera')) mal('descripción fija del complementario');
      if (res.consejos.some((c) => c.texto.includes('ahorrar el equivalente'))) mal('consejo de ahorrar el equivalente');
      if (res.razones.some((x) => x.includes('Tu uso médico actual no justifica'))) mal('razón fija de antes');
      if (res.forzadoPor && porPuntos !== 'publico' && !res.razones.some((x) => x.startsWith('Sin esa respuesta'))) mal('no dice qué daría la puntuación');
      for (const x of res.razones) {
        const citada = x.match(/«([^»]+)»/)?.[1];
        if (citada && !citada.startsWith('seguro') && !citada.startsWith('sanidad')
          && !PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === citada && r[p.id] === o.valor))) mal(`cita «${citada}», no respondida`);
      }
      return;
    }
    for (const o of PREGUNTAS[i].opciones) {
      r[PREGUNTAS[i].id] = o.valor;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(cuenta.total).toBe(1_310_720);
  // Que las comprobaciones de arriba no pasen en vacío: 1/4 de los perfiles con «Hasta 40 €/mes»,
  // 1/4 con seguro de empresa, 1/5 con embarazo en curso.
  expect(cuenta.poco).toBe(327_680);
  expect(cuenta.empresa).toBe(327_680);
  expect(cuenta.embarazoCurso).toBe(262_144);
  expect(cuenta.mutualistas).toBeGreaterThan(0);
  expect(cuenta.cronicosQueContratan).toBeGreaterThan(0);
});

// Fuera del acta: al medir la reparación de la forma g (el foco va al h1 del resultado) se vio
// que la barra fija de MeskeiaLogo (0-62 px en móvil) tapaba ENTERO ese h1 (32-61 px a 390 px) y
// el principio del de la intro (48-117 px): el foco caía en un título oculto. El hero deja ahora
// 80 px arriba en todos los anchos, el hueco de la plantilla (en hogar, a 1024 px el logo de
// escritorio, hasta 77 px, tapaba también el título de la intro). Se mide la caja real del
// TEXTO del h1 contra la del logo y la del botón de tema, en cinco anchos y en las dos pantallas.
test('móvil y escritorio: el logo fijo y el botón de tema no tapan el título, ni en la intro ni en el resultado', async ({ page }) => {
  const solapes: string[] = [];
  const medir = (momento: string) => page.evaluate((m) => {
    window.scrollTo(0, 0);
    const h1 = document.querySelector('h1');
    if (!h1) return [`${m}: sin h1`];
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const texto = Array.from(rango.getClientRects());
    const fijos = Array.from(document.querySelectorAll('[class*="headerBar"] > *')).map((e) => e.getBoundingClientRect());
    const fuera: string[] = [];
    for (const t of texto) for (const f of fijos) {
      if (t.left < f.right && f.left < t.right && t.top < f.bottom && f.top < t.bottom) fuera.push(`${m}: texto ${Math.round(t.top)}-${Math.round(t.bottom)} bajo ${Math.round(f.top)}-${Math.round(f.bottom)}`);
    }
    return fuera;
  }, momento);
  for (const ancho of [360, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-seguro-salud/');
    await esperarHidratacionBotones(page);
    solapes.push(...(await medir(`${ancho}px intro`)));
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await responder(page, Array(10).fill(0));
    solapes.push(...(await medir(`${ancho}px resultado`)));
  }
  expect(solapes).toEqual([]);
});

/**
 * REPARACIÓN DEL 24/09/2026 de los hallazgos 1420-1436 (primera inspección del Inspector, tras la
 * reparación en lote 99acf1e0). Los tests que eran `test.fail()` pasan a exigir lo reparado;
 * los que ya pasaban siguen, y el que fijaba el precio «35 – 80 €/mes» se reescribe (1427).
 *
 * Los perfiles son el índice de la opción elegida en cada una de las 10 preguntas, en orden. La
 * pregunta 3 ya no es la comunidad autónoma sino la espera en tu zona (corta · entre 2 y 4 meses o
 * no lo sé · más de 4 meses · rural), con los MISMOS índices de puntos: 0 · 0 · +2 · +2. La 4 tiene
 * cinco opciones: sin hijos · 1 hijo · 2 o más · embarazada ahora (0) · planeo un embarazo (+3).
 */
test.describe('Reparación 24/09/2026 — límites declarados, espera en tu zona, datos y contraste', () => {
  const valorVeredicto = (page: Page) => page.locator('[class*="veredictoValor"]').innerText();
  /** El resultado SIN la guía educativa (que nace plegada): veredicto, cobertura, razones y consejos. */
  const resultado = async (page: Page): Promise<string> => {
    const partes = await Promise.all(
      ['veredictoCard', 'coberturaGrid', 'razonesSection', 'consejosSection'].map((c) => page.locator(`[class*="${c}"]`).innerText()),
    );
    return partes.join(' ').replace(/\s+/g, ' ');
  };
  /** Los avisos del resultado (role="note", fuera de la guía plegada). */
  const avisos = async (page: Page): Promise<string> =>
    (await page.locator('p[role="note"][class*="aviso"]').allInnerTexts()).join(' ').replace(/\s+/g, ' ');
  const faqJsonLd = async (page: Page): Promise<string> => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    return bloques.find((b) => b.includes('"FAQPage"')) ?? '';
  };
  const abrirGuia = async (page: Page): Promise<string> => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('MUFACE, ISFAS y MUGEJU: las mutualidades de funcionarios')).toBeVisible();
    return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  };

  // Ocasional (0) · Un especialista (+2) · Espera entre 2 y 4 meses (0) · 1 hijo (+2) · Cuenta ajena (0)
  // · «Lo acepto» (0) · Dental bien (0) · «No, pero me interesa» (0) · 40 – 100 €/mes (0) · Sin
  // seguro de empresa (0) = 4 → de 3 a 7, complementario (motor.ts: UMBRAL_PUBLICO 2, _COMPLEMENTARIO 7).
  // REESCRITO (1427): antes exigía «35 – 80 €/mes», una horquilla sin fuente que el FAQPage
  // contradecía. Ahora la referencia es la prima media del sector: 12.059 M€ / 12,6 M personas /
  // 12 = 79,76 → «≈ 80 €/mes de media» (UNESPA, 2024).
  test('caso normal: 4 puntos → complementario, con la referencia de precio de UNESPA y lo que pesa', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    await expect(page.locator('[class*="precioRango"]')).toHaveText('≈ 80 €/mes de media');
    expect(texto).toContain('Tu puntuación es 4: de 3 a 7, un seguro que complemente a la sanidad pública.');
    expect(texto).toContain('Especialistas: «Sí, un especialista» suma 2 puntos.');
    expect(texto).toContain('Hijos: «Sí, 1 hijo» suma 2 puntos.');
    await expect(page.locator('[class*="veredictoDesc"]')).toContainText('lo que más pesa es el seguimiento de especialistas y la atención a tus hijos');
  });

  // Todo a cero salvo dental «Es un gasto importante» (+3) y «Hasta 40 €/mes» (−1) = 2 → pública
  // (el tope de pública). Con 40 – 100 €/mes (0) en vez de «Hasta 40» = 3 → complementario.
  test('límite: 2 puntos es sanidad pública y 3 ya es complementario', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 2, 3, 1, 2]);
    expect(await valorVeredicto(page)).toBe('Sanidad pública es suficiente');
    expect(await resultado(page)).toContain('Tu puntuación es 2: hasta 2, la sanidad pública cubre tu perfil');
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 2, 3, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    expect(await resultado(page)).toContain('Tu puntuación es 3: de 3 a 7');
  });

  test('caso que se rechaza: sin respuesta no se avanza, y «Anterior» conserva lo elegido', async ({ page }) => {
    await abrirTest(page);
    const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
    await expect(siguiente).toBeDisabled();
    await page.locator('[role="radio"]').nth(2).click();
    await siguiente.click();
    await page.getByText('Pregunta 2 de 10').first().waitFor();
    await expect(siguiente).toBeDisabled();
    await page.getByRole('button', { name: 'Pregunta anterior' }).click();
    await expect(page.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
    await expect(siguiente).toBeEnabled();
  });

  test('riesgo 2: el aviso es «high», está abierto en el resultado y no vive en la guía plegada', async ({ page }) => {
    // _private/DISCLAIMER-POLICY.md: seguros («Calculadoras de ahorro, seguros…») → Nivel 2,
    // severity="high", nunca colapsable. La reparación añade avisos de preexistencias y cita el
    // art. 10 de la Ley de Contrato de Seguro, pero la app sigue sin calcular nada fiscal ni
    // clínico (disparadores del Nivel 1): se revisó y el nivel no cambia.
    await abrirTest(page);
    await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    const aviso = page.locator('[role="note"]').filter({ hasText: 'TÚ ERES RESPONSABLE' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveClass(/severity-high/);
    await expect(aviso.locator('button')).toHaveCount(0);
    expect(await aviso.evaluate((el) => !!el.closest('[class*="ducational"]'))).toBe(false);
  });

  // 1420: la pregunta 3 calificaba tres grupos de comunidades sin fuente y daba +2 al tercero; el
  // SISLE-SNS a 31/12/2025 lo contradecía. Ahora pregunta la espera en TU zona, con la media
  // oficial como referencia: 102 días (LISTAS_PUBLICACION_Dic_2025.pdf, pág. 14, «TOTAL … 102»).
  // El caso de la ficha (Ocasional · un especialista · … · «Preferiría no esperar» · 40 – 100 €)
  // da 2 → pública con «entre 2 y 4 meses» y 4 → complementario con «más de 4 meses»: lo que
  // mueve el veredicto es la espera declarada, no la comunidad.
  test('1420: la pregunta de la espera no califica comunidades, cita la media oficial y es la espera la que decide', async ({ page }) => {
    await abrirTest(page);
    for (const i of [1, 1]) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(i).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByText('Pregunta 3 de 10').first().waitFor();
    const opciones = (await page.locator('[role="radiogroup"]').innerText()).replace(/\s+/g, ' ');
    expect(opciones).not.toMatch(/Andaluc|Madrid|Navarra|Catalu|Castilla|Canarias|Valencia|Murcia|País Vasco|Galicia|Aragón/);
    expect(opciones).not.toMatch(/buen rendimiento|presión asistencial|esperas moderadas/);
    expect(opciones).toContain('Referencia: 102 días de media en el sistema público (SISLE-SNS, 31/12/2025)');
    for (const [espera, veredicto] of [[1, 'Sanidad pública es suficiente'], [2, 'Seguro complementario recomendado']] as const) {
      await abrirTest(page);
      await responder(page, [1, 1, espera, 0, 0, 1, 0, 2, 2, 2]);
      expect(await valorVeredicto(page)).toBe(veredicto);
    }
  });

  // 1423: Muy frecuente (+3) · Varios especialistas (+3) · Espera 2-4 meses (0) · Sin hijos · Cuenta
  // ajena · Acceso «crítico» (+3) · Dental bien · «Me interesa» · HASTA 40 €/MES (−1) · Sin seguro
  // de empresa = 8 → por puntos «completo», acotado a complementario, con el aviso y la media de
  // UNESPA (≈ 80 €/mes, el doble del tope).
  test('1423: «Hasta 40 €/mes» ya no acaba en el seguro completo, y se dice por qué', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [3, 2, 1, 0, 0, 3, 0, 2, 1, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    expect(texto).toContain('Tu puntuación es 8: desde 8 apuntaría a un seguro privado completo, pero con un presupuesto de «Hasta 40 €/mes» la orientación se queda en un seguro complementario.');
    const aviso = await avisos(page);
    expect(aviso).toContain('Por puntos saldría un seguro completo, pero has dicho que puedes pagar «Hasta 40 €/mes»');
    expect(aviso).toContain('la prima media del sector es de unos 80 € al mes por persona asegurada (UNESPA, 2024)');
  });

  // 1421: Con frecuencia (+2) · Un especialista (+2) · Espera 2-4 meses · 2 o más hijos (+3) ·
  // FUNCIONARIO/A CON MUTUALIDAD (−3) · «Muy importante» (+2) · Dental pendiente (+2) · «Me interesa» ·
  // 40 – 100 € · «No, tendría que contratarlo yo» = 8. Antes: «Seguro privado completo recomendado».
  test('1421: quien declara mutualidad en la pregunta 5 no recibe «contrata un seguro»', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [2, 1, 1, 2, 2, 2, 1, 2, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Tu mutualidad ya te da cobertura');
    expect(texto).toContain('Tienes mutualidad de funcionarios (MUFACE, ISFAS, MUGEJU)');
    expect(texto).toContain('Sin esa respuesta, tu puntuación (8) apuntaría a «seguro privado completo recomendado».');
    await expect(page.locator('[class*="precioRango"]')).toHaveText('0 € adicionales');
  });

  // 1422: Muy frecuente (+3) · «Tengo una enfermedad crónica» (+2) · Espera corta (0) · Sin hijos ·
  // Cuenta ajena · Acceso «crítico» (+3) · Dental bien · «No estoy seguro» · 40 – 100 € · Sin seguro
  // = 8 → completo; sin la crónica, 6 → complementario. Ley 50/1980, art. 10 (cuestionario) y OCU
  // («Está excluida de cobertura la asistencia relacionada con enfermedades … preexistentes»).
  test('1422: la enfermedad crónica lleva el aviso de preexistencias y dice qué saldría sin ella', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [3, 3, 0, 0, 0, 3, 0, 3, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro privado completo recomendado');
    const aviso = await avisos(page);
    expect(aviso).toContain('Has declarado una enfermedad crónica.');
    expect(aviso).toContain('art. 10 de la Ley 50/1980 de Contrato de Seguro');
    expect(aviso).toContain('suele quedar excluida de la cobertura o encarecer la prima (OCU)');
    expect(aviso).toContain('Sin esa respuesta, la orientación sería «seguro complementario recomendado».');
  });

  // 1424: Ocasional · Solo cabecera · Espera 2-4 meses · «ESTOY EMBARAZADA AHORA» (0) · Cuenta ajena ·
  // «Lo acepto» · Dental bien · «Me interesa» · 40 – 100 € · Sin seguro = 0 → pública, con el aviso
  // de que una póliza nueva no cubre ese parto. «Planeo un embarazo» (+3) = 3 → complementario,
  // con el aviso de carencias: OCU, «entre 6 y 8 meses, dependiendo del tratamiento».
  test('1424: el embarazo en curso no es razón para contratar y se avisa; planearlo lleva el aviso de carencias', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [1, 0, 1, 3, 0, 1, 0, 2, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Sanidad pública es suficiente');
    expect(texto).not.toMatch(/embarazada[^.]*suma/);
    expect(await avisos(page)).toContain('Si ya estás embarazada, lo normal es que una póliza nueva no cubra este embarazo ni este parto');
    await abrirTest(page);
    const planeando = await responder(page, [1, 0, 1, 4, 0, 1, 0, 2, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    expect(planeando).toContain('Hijos: «Planeo un embarazo» suma 3 puntos.');
    expect(await avisos(page)).toContain('normalmente de 6 a 8 meses');
  });

  // 1425: Casi nunca · Solo cabecera · Espera corta · Sin hijos · Cuenta ajena · «PUEDO ESPERAR SIN
  // PROBLEMA» · Dental «gasto importante» (+3) · «No estoy seguro» · 40 – 100 € · Sin seguro = 3 →
  // complementario: la descripción dice que pesa el dentista, no «reducir tiempos de espera».
  test('1425: la descripción del complementario dice lo que ha pesado en ese perfil', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 2, 3, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    const desc = page.locator('[class*="veredictoDesc"]');
    await expect(desc).not.toContainText('principalmente para reducir tiempos de espera en especialistas');
    await expect(desc).toContainText('En tu caso, lo que más pesa es la salud dental.');
  });

  // 1426: Muy frecuente (+3) · Varios (+3) · Espera 2-4 meses · NO TENGO HIJOS · «Desempleo, estudiante o
  // JUBILADO/A» · Crítico (+3) · Dental gasto (+3) · Satisfecho (+2) · Más de 100 € (+1) · Sin seguro
  // = 15 → completo. La nota ya no habla de una «familia de 3» y dice que la app no pregunta la edad.
  test('1426: la nota de precio no supone una familia de 3 de 30-45 años', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [3, 2, 1, 0, 3, 3, 2, 0, 3, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro privado completo recomendado');
    const nota = page.locator('[class*="precioNota"]');
    await expect(nota).not.toContainText('familia de 3');
    await expect(nota).toContainText('Esta app no pregunta tu edad');
    await expect(nota).toContainText('Es por persona');
  });

  // 1427: una sola verdad. Pantalla y FAQPage salen de motor.ts: UNESPA 12.059 M€ (2024) / 12,6 M
  // personas → ≈ 80 €/mes; copago «normalmente entre 3 y 20 euros por cada servicio médico» (OCU),
  // igual en el FAQPage y en la guía (antes 2-15 € y 3-8 €).
  test('1427: el FAQPage, la pantalla y la guía dan las mismas cifras de precio y copago', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [3, 2, 1, 0, 3, 3, 2, 0, 3, 2]);
    await expect(page.locator('[class*="precioRango"]')).toHaveText('≈ 80 €/mes de media');
    const faq = await faqJsonLd(page);
    expect(faq).toContain('12.059 millones de euros en primas en 2024');
    expect(faq).toContain('unos 80 € al mes por persona asegurada');
    expect(faq).not.toContain('entre 40 y 80 € al mes');
    expect(faq).toContain('normalmente entre 3 y 20 € por cada servicio médico (OCU)');
    expect(await abrirGuia(page)).toContain('normalmente entre 3 y 20 € por cada servicio médico (OCU)');
  });

  // 1428: LGSS art. 315 (IT de cobertura obligatoria en el RETA) y art. 321 (prestación desde el
  // cuarto día de baja, redacción del RDL 28/2018, en vigor desde el 01/01/2019).
  test('1428: la guía no dice que los autónomos no tienen baja por enfermedad', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    const guia = await abrirGuia(page);
    expect(guia).not.toContain('sin baja por enfermedad garantizada');
    expect(guia).toContain('la incapacidad temporal es de cobertura obligatoria en el régimen de autónomos desde el 1 de enero de 2019 (Real Decreto-ley 28/2018');
  });

  test('1429: la guía no se fecha en un año cerrado ni da por vigente el ranking de la OMS del año 2000', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    const guia = await abrirGuia(page);
    expect(guia).not.toContain('El sistema sanitario español en 2025');
    expect(guia).not.toMatch(/ranking de la OMS|mejores del mundo/);
    expect(guia).toContain('102 días de media en el conjunto del Sistema Nacional de Salud');
  });

  // 1430: Ley 50/1980, art. 10 — deber de declarar según el cuestionario; rescisión en un mes;
  // reducción proporcional si el siniestro llega antes; liberación del pago con dolo o culpa grave.
  test('1430: la FAQ describe el art. 10 de la Ley de Contrato de Seguro, no una «nulidad»', async ({ page }) => {
    await page.goto('/selector-seguro-salud/');
    const faq = await faqJsonLd(page);
    expect(faq).toContain('FAQPage'); // precondición
    expect(faq).not.toContain('nulidad del contrato');
    expect(faq).toContain('rescindir el contrato en el plazo de un mes');
    expect(faq).toContain('si hubo dolo o culpa grave queda liberada del pago');
  });

  test('1431: la app lleva el aviso de región (sistema sanitario español)', async ({ page }) => {
    await page.goto('/selector-seguro-salud/');
    await esperarHidratacionBotones(page);
    await expect(page.getByRole('note', { name: 'Aviso: esta herramienta aplica únicamente a España' })).toHaveCount(1);
    await expect(page.locator('text=/Solo España: basado en el sistema sanitario público español/')).toHaveCount(1);
    // Aplica solo a España por una ley que no es fiscal: Delegum no es la fuente de nada de lo
    // que dice la app, así que el aviso no lo enlaza (RegionBadge fuenteDelegum={false}).
    await expect(page.getByText('Fuente de los datos: Delegum')).toHaveCount(0);
  });

  // 1432: dental +3, «Hasta 40 €/mes» −1 = 2 → pública. La cuenta visible da el total: la suma Y la resta.
  test('1432: en «sanidad pública» por puntos se enseñan las sumas y las restas', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [0, 0, 0, 0, 0, 0, 2, 3, 1, 2]);
    expect(texto).toContain('Tu puntuación es 2:');
    expect(texto).toContain('Salud dental: «Es un gasto importante para mí cada año» suma 3 puntos.');
    expect(texto).toContain('Presupuesto: «Hasta 40 €/mes» resta 1 punto.');
  });

  // 1433: Todo a cero · «Desempleo, estudiante o jubilado/a» · «NADA, no quiero gasto extra» →
  // pública forzada. Ya no se aconseja ahorrar «el equivalente» (§1.quinquies, regla 2).
  test('1433: a quien no quiere ningún gasto no se le aconseja ahorrar el equivalente del seguro', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 3, 0, 0, 3, 0, 2]);
    expect(await valorVeredicto(page)).toBe('Sanidad pública es suficiente');
    const texto = await resultado(page);
    expect(texto).not.toContain('ahorrar el equivalente');
    expect(texto).toContain('Si tu situación cambia');
  });

  test('1434: con seguro completo de empresa, el veredicto es aprovecharlo, no «Sanidad pública es suficiente»', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 2, 2, 0]);
    expect(await resultado(page)).toContain('Ya tienes cobertura privada completa pagada por tu empresa');
    expect(await valorVeredicto(page)).toBe('Aprovecha tu seguro de empresa');
    await expect(page.locator('[class*="precioRango"]')).toHaveText('0 € adicionales');
    await expect(page.locator('[class*="precioNota"]')).not.toContainText('impuestos');
  });

  test('sin marcas de aseguradoras en los consejos (política del proyecto; forma del 1519 de hogar)', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [3, 2, 1, 0, 3, 3, 2, 0, 3, 2]);
    expect(await resultado(page)).not.toMatch(/Sanitas|Adeslas|Asisa|AXA|DKV/);
  });

  // ─── Contraste, con los colores COMPUTADOS y el fondo real compuesto (o cada parada del degradado) ───
  async function contraste(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((el) => {
      interface Rgba { r: number; g: number; b: number; a: number }
      const leer = (s: string): Rgba | null => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      };
      const sobre = (f: Rgba, b: Rgba): Rgba => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
      const lum = (c: Rgba) => {
        const k = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * k(c.r) + 0.7152 * k(c.g) + 0.0722 * k(c.b);
      };
      const ratio = (x: Rgba, y: Rgba) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
      const capas: Rgba[] = [];
      let base: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (let n: Element | null = el; n; n = n.parentElement) {
        const estilo = getComputedStyle(n);
        if (estilo.backgroundImage.includes('gradient')) {
          // Sobre un degradado, la peor de sus paradas.
          const paradas = [...estilo.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((m) => leer(m[0]) as Rgba);
          const tinta = leer(getComputedStyle(el).color) as Rgba;
          return Math.min(...paradas.map((p) => ratio(sobre(tinta, p), p)));
        }
        const c = leer(estilo.backgroundColor);
        if (c && c.a > 0) { if (c.a >= 1) { base = c; break; } capas.push(c); }
      }
      let fondo = base;
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      // La opacidad del propio texto (el subtítulo del hero va a 0,88) también cuenta.
      const tinta = leer(getComputedStyle(el).color) as Rgba;
      tinta.a *= Number(getComputedStyle(el).opacity);
      return ratio(sobre(tinta, fondo), fondo);
    });
  }
  const COMPLEMENTARIO = [1, 1, 1, 1, 0, 1, 0, 2, 2, 2] as const;
  const PUBLICO = [1, 1, 1, 0, 0, 1, 0, 2, 2, 2] as const; // un especialista (+2) = 2
  const COMPLETO = [3, 3, 0, 0, 0, 3, 0, 3, 2, 2] as const; // 8

  // Texto pequeño (13,6-15,2 px, 600-700) exige 4,5:1; veredictoValor (24 px, 700) es grande: 3:1.
  async function medirTextosDeMarca(page: Page): Promise<Record<string, [number, number]>> {
    const m: Record<string, [number, number]> = {};
    await abrirTest(page);
    m.progresoPaso = [await contraste(page, '[class*="progresoPaso"]'), 4.5];
    await page.locator('[role="radio"]').first().click(); // habilitado: un botón deshabilitado está exento
    m.btnSiguiente = [await contraste(page, '[class*="btnSiguiente"]'), 4.5];
    await responder(page, COMPLEMENTARIO);
    m.heroSubtitulo = [await contraste(page, '[class*="heroSubtitleSm"]'), 4.5];
    m.razonesTitulo = [await contraste(page, '[class*="razonesTitulo"]'), 4.5];
    m.btnRepetir = [await contraste(page, '[class*="btnRepetir"]'), 4.5];
    m.veredictoComplementario = [await contraste(page, '[class*="veredictoValor"]'), 3];
    await abrirTest(page);
    await responder(page, PUBLICO);
    m.veredictoPublico = [await contraste(page, '[class*="veredictoValor"]'), 3];
    await abrirTest(page);
    await responder(page, COMPLETO);
    m.veredictoCompleto = [await contraste(page, '[class*="veredictoValor"]'), 3];
    m.aviso = [await contraste(page, 'p[role="note"][class*="aviso"]'), 4.5];
    return m;
  }

  // 1435 y 1436. Medido antes de reparar, en claro: progresoPaso 3,93 · razonesTitulo 3,67 ·
  // btnRepetir 3,93 · veredicto «pública» (--secondary) 2,80 · «completo» (#e8a020) 2,22 · hero del
  // resultado y «Siguiente →» sobre el degradado, 2,80. Ahora: --primary-texto (5,47:1 sobre blanco),
  // --secondary-texto (5,15), #b45309 en claro (5,02) y --hero-bg / --primary-boton de fondo.
  test('1435/1436: en tema claro, los textos de marca, el hero del resultado y los botones llegan a su mínimo', async ({ page }) => {
    const m = await medirTextosDeMarca(page);
    expect(Object.entries(m).filter(([, [v, min]]) => v < min).map(([k, [v]]) => `${k} ${v.toFixed(2)}`)).toEqual([]);
  });

  test('en tema oscuro esos mismos textos también llegan', async ({ page }) => {
    // Antes de reparar pasaban en oscuro los textos (6,23 · 5,86 · 6,23 · 6,17 · 6,22) y fallaba el
    // hero del resultado (2,23). Es la guarda de que drenar el claro no ha roto el oscuro.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-seguro-salud/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const m = await medirTextosDeMarca(page); // abrirTest navega de nuevo: el tema se conserva
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(Object.entries(m).filter(([, [v, min]]) => v < min).map(([k, [v]]) => `${k} ${v.toFixed(2)}`)).toEqual([]);
  });

  test('1436: el hero del resultado usa --hero-bg, como el de la intro', async ({ page }) => {
    await abrirTest(page);
    await responder(page, COMPLEMENTARIO);
    const fondo = await page.locator('[class*="heroResultados"]').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { imagen: cs.backgroundImage, color: cs.backgroundColor };
    });
    expect(fondo).toEqual({ imagen: 'none', color: 'rgb(26, 82, 120)' });
  });

  test('al pulsar «Ver resultado» con el teclado el foco va al encabezado del resultado (familia, forma g)', async ({ page }) => {
    await abrirTest(page);
    for (let i = 0; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').first().click();
      if (i < 9) await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByRole('button', { name: 'Ver resultado' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Tu perfil de cobertura sanitaria' }).waitFor();
    await expect(page.getByRole('heading', { name: 'Tu perfil de cobertura sanitaria' })).toBeFocused();
  });
});

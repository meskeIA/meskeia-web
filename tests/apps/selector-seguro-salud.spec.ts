import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PESOS, PREGUNTAS, UMBRAL_COMPLEMENTARIO, UMBRAL_PUBLICO } from '../../app/selector-seguro-salud/motor';

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

test('motor: el veredicto no cambia, y las razones dicen qué lo ha decidido', () => {
  test.setTimeout(180_000);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      let puntos = 0;
      for (const [id, porRespuesta] of Object.entries(PESOS)) puntos += porRespuesta[r[Number(id)]] ?? 0;
      const porPuntos = puntos <= UMBRAL_PUBLICO ? 'publico' : puntos <= UMBRAL_COMPLEMENTARIO ? 'complementario' : 'completo';
      const forzado = r[10] === 'si_completo' || r[10] === 'muface' || r[9] === 'nada';
      if (res.puntuacion !== puntos) mal('puntuación distinta');
      if (res.veredicto !== (forzado ? 'publico' : porPuntos)) mal('veredicto distinto');
      if (res.razones.length === 0) mal('sin razones');
      if (res.razones.some((x) => x.includes('Tu uso médico actual no justifica'))) mal('razón fija de antes');
      if (forzado && porPuntos !== 'publico' && !res.razones.some((x) => x.startsWith('Sin esa respuesta'))) mal('no dice qué daría la puntuación');
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
  expect(total).toBe(1_048_576);
});

/**
 * INSPECCIÓN DEL 24/09/2026 (Inspector, primera inspección, tras la reparación en lote 99acf1e0).
 *
 * Los radios, la barra y las razones que dicen qué decidió el resultado ya los cubren los cinco
 * tests de arriba y el testigo de familia: no se repiten. Lo nuevo es lo que el usuario DECLARA
 * como límite y el motor trata como un punto más (en selector-mascota, hallazgos 1332 y 1333),
 * los datos de la pregunta de comunidad autónoma y el contenido de la guía y de la FAQ.
 *
 * Recuento del motor sobre las 1.048.576 combinaciones (barrido del Inspector en su scratchpad):
 *   · «Hasta 40 €/mes» → «seguro completo» (60 – 180 €/mes) en 70.052 de 262.144.
 *   · «Funcionario/a (con MUFACE, ISFAS…)» → contratar un seguro en 84.716 de 262.144 (31.756
 *     de ellos «completo»): solo fuerza «pública» la MUFACE de la pregunta 10, no la de la 5.
 *   · «Tengo una enfermedad crónica» → seguro privado en 95.288 de 262.144; en 28.280 la crónica
 *     es la que sube el veredicto; en 0 el resultado menciona las preexistencias.
 *   · «Estoy embarazada o planeando estarlo» decide el veredicto en 40.948 perfiles.
 *   · «Andalucía, Valencia, Murcia, Castilla-La Mancha…» (+2) frente a «Cataluña, Galicia,
 *     Aragón, Canarias…» (0) cambia el veredicto en 25.106 de 262.144.
 *   · «Seguro completo» con la nota «familia de 3» a quien dijo «No tengo hijos»: 41.128.
 *   · «Sanidad pública» por puntos que muestra las sumas y oculta las restas: 15.860 de 17.460.
 *
 * Los perfiles son el índice de la opción elegida en cada una de las 10 preguntas, en orden.
 */
test.describe('Inspección 24/09/2026 — límites declarados, comunidades, datos y contraste', () => {
  const valorVeredicto = (page: Page) => page.locator('[class*="veredictoValor"]').innerText();
  /** El resultado SIN la guía educativa (que nace plegada): veredicto, cobertura, razones y consejos. */
  const resultado = async (page: Page): Promise<string> => {
    const partes = await Promise.all(
      ['veredictoCard', 'coberturaGrid', 'razonesSection', 'consejosSection'].map((c) => page.locator(`[class*="${c}"]`).innerText()),
    );
    return partes.join(' ').replace(/\s+/g, ' ');
  };
  const faqJsonLd = async (page: Page): Promise<string> => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    return bloques.find((b) => b.includes('"FAQPage"')) ?? '';
  };
  const abrirGuia = async (page: Page): Promise<string> => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('MUFACE e ISFAS: la opción de los funcionarios')).toBeVisible();
    return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  };

  // Ocasional (0) · Un especialista (+2) · Cataluña, Galicia… (0) · 1 hijo (+2) · Cuenta ajena (0)
  // · «Lo acepto» (0) · Dental bien (0) · «No, pero me interesa» (0) · 40 – 100 €/mes (0) · Sin
  // seguro de empresa (0) = 4 → de 3 a 7, complementario (motor.ts: UMBRAL_PUBLICO 2, _COMPLEMENTARIO 7).
  test('caso normal: 4 puntos → seguro complementario de 35 – 80 €/mes, con sus dos razones', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    await expect(page.locator('[class*="precioRango"]')).toHaveText('35 – 80 €/mes');
    expect(texto).toContain('Tu puntuación es 4: de 3 a 7, un seguro que complemente a la sanidad pública.');
    expect(texto).toContain('Especialistas: «Sí, un especialista» suma 2 puntos.');
    expect(texto).toContain('Hijos: «Sí, 1 hijo» suma 2 puntos.');
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
    // _private/DISCLAIMER-POLICY.md: salud + finanzas sin componente fiscal ni clínico → Nivel 2,
    // severity="high", nunca colapsable.
    await abrirTest(page);
    await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    const aviso = page.locator('[role="note"]').filter({ hasText: 'TÚ ERES RESPONSABLE' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveClass(/severity-high/);
    await expect(aviso.locator('button')).toHaveCount(0);
    expect(await aviso.evaluate((el) => !!el.closest('[class*="ducational"]'))).toBe(false);
  });

  // SISLE-SNS a 31/12/2025 (Ministerio de Sanidad, LISTAS_PUBLICACION_Dic_2025.pdf), tiempo medio
  // de espera para primera consulta (SNS 102 días): Navarra 152 y País Vasco 49 («buen rendimiento
  // relativo»); Canarias 162, Aragón 138, Cataluña 120 y Galicia 63 («esperas moderadas»);
  // Andalucía 136, C. Valenciana 95, Murcia 89 y Castilla-La Mancha 64 («mayor presión
  // asistencial», +2 puntos). Quirúrgica (SNS 121): C. Valenciana 88 y CLM 92 frente a Cataluña 142.
  test('HALLAZGO abierto: la pregunta de comunidad califica sistemas de salud sin fuente, y la cifra oficial lo contradice', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: nota valorativa por territorio (§1.quinquies, regla 6) que además suma puntos.
    await abrirTest(page);
    for (const i of [0, 0]) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(i).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByText('Pregunta 3 de 10').first().waitFor();
    const opciones = (await page.locator('[role="radiogroup"]').innerText()).replace(/\s+/g, ' ');
    expect(opciones).toContain('Castilla-La Mancha'); // precondición: es la pregunta de comunidad
    const valorativo = /buen rendimiento relativo|mayor presión asistencial|esperas moderadas/.test(opciones);
    expect(!valorativo || /SISLE/.test(opciones)).toBe(true);
  });

  // Muy frecuente (+3) · Varios especialistas (+3) · Cataluña… (0) · Sin hijos · Cuenta ajena ·
  // Acceso «crítico» (+3) · Dental bien · «Me interesa» · HASTA 40 €/MES (−1) · Sin seguro de
  // empresa = 8 → completo, cuya ficha empieza en 60 €/mes. Se admite ficha que quepa o aviso.
  test('HALLAZGO abierto: «Hasta 40 €/mes» → seguro completo de «60 – 180 €/mes», sin aviso', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el presupuesto es un peso (−1), no un límite; 70.052 perfiles.
    await abrirTest(page);
    await responder(page, [3, 2, 1, 0, 0, 3, 0, 2, 1, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro privado completo recomendado');
    const minimo = Number((await page.locator('[class*="precioRango"]').innerText()).match(/\d+/)?.[0]);
    const resto = (await resultado(page)).replace('Presupuesto: «Hasta 40 €/mes» resta 1 punto.', '');
    expect(minimo <= 40 || /presupuesto/i.test(resto)).toBe(true);
  });

  // Con frecuencia (+2) · Un especialista (+2) · Cataluña… (0) · 2 o más hijos (+3) ·
  // FUNCIONARIO/A (CON MUFACE, ISFAS…) (−3) · «Muy importante» (+2) · Dental pendiente (+2) ·
  // «Me interesa» · 40 – 100 € · «No, tendría que contratarlo yo» = 8 → completo. Con «Tengo
  // mutualidad» en la pregunta 10 la app fuerza «pública»; con la misma mutualidad en la 5, no.
  test('HALLAZGO abierto: quien declara MUFACE/ISFAS en la pregunta 5 recibe «seguro privado completo»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la mutualidad de la pregunta 5 resta 3; solo la de la 10 filtra.
    await abrirTest(page);
    await responder(page, [2, 1, 1, 2, 2, 2, 1, 2, 2, 2]);
    const veredicto = await valorVeredicto(page);
    const resto = (await resultado(page)).replace(/[^.]*(suma|resta) \d+ puntos?\./g, '');
    expect(veredicto === 'Sanidad pública es suficiente' || /MUFACE|mutualidad/i.test(resto)).toBe(true);
  });

  // Muy frecuente (+3) · «Tengo una enfermedad crónica» (+2) · Madrid… (0) · Sin hijos · Cuenta
  // ajena · Acceso «crítico» (+3) · Dental bien · «No estoy seguro» · 40 – 100 € · Sin seguro de
  // empresa = 8 → completo (sin la crónica, 6 → complementario). La FAQ de la misma página dice
  // que las preexistencias «pueden quedar excluidas de la cobertura o conllevar una sobretasa».
  test('HALLAZGO abierto: la enfermedad crónica suma para contratar y el resultado no avisa de las preexistencias', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: 0 de 262.144 perfiles crónicos lo mencionan fuera de la guía plegada.
    await abrirTest(page);
    await responder(page, [3, 3, 0, 0, 0, 3, 0, 3, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro privado completo recomendado');
    expect(await resultado(page)).toMatch(/preexist/i);
  });

  // Ocasional · Solo cabecera · Cataluña… · «ESTOY EMBARAZADA o planeando estarlo» (+3) · Cuenta
  // ajena · «Lo acepto» · Dental bien · «Me interesa» · 40 – 100 € · Sin seguro = 3 →
  // complementario, con el embarazo como única razón. Un embarazo en curso al contratar es
  // preexistencia y el parto tiene carencia de 8 meses (lo dice el propio consejo): no se cubre.
  test('HALLAZGO abierto: el embarazo en curso es la razón para contratar, y no se dice que ese parto no se cubre', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la opción junta «estoy embarazada» con «planeando»; decide 40.948 perfiles.
    await abrirTest(page);
    await responder(page, [1, 0, 1, 3, 0, 1, 0, 2, 2, 2]);
    const texto = await resultado(page);
    expect(texto).toContain('Hijos: «Estoy embarazada o planeando estarlo» suma 3 puntos.');
    expect(texto).toMatch(/embarazo en curso|ya (estás )?embarazada|preexist/i);
  });

  // Casi nunca · Solo cabecera · Madrid… · Sin hijos · Cuenta ajena · «PUEDO ESPERAR SIN
  // PROBLEMA» · Dental «gasto importante» (+3) · «No estoy seguro» · 40 – 100 € · Sin seguro = 3
  // → complementario: la ficha fija dice que es «principalmente para reducir tiempos de espera».
  test('HALLAZGO abierto: a quien puede esperar y solo suma el dentista, «para reducir tiempos de espera en especialistas»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: descripción fija del veredicto; 13.180 perfiles «puedo esperar» + «solo cabecera».
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 2, 3, 2, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro complementario recomendado');
    await expect(page.locator('[class*="veredictoDesc"]')).not.toContainText('principalmente para reducir tiempos de espera en especialistas');
  });

  // Muy frecuente (+3) · Varios (+3) · Cataluña… · NO TENGO HIJOS · «Desempleo, estudiante o
  // JUBILADO/A» · Crítico (+3) · Dental gasto (+3) · Satisfecho (+2) · Más de 100 € (+1) · Sin
  // seguro = 15 → completo, con el precio de una «familia de 3 (adultos 30-45 años + 1 niño)».
  test('HALLAZGO abierto: sin hijos y jubilado, el precio que se enseña es el de una familia de 3 de 30-45 años', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: nota de precio fija; 41.128 «completo» sin hijos.
    await abrirTest(page);
    await responder(page, [3, 2, 1, 0, 3, 3, 2, 0, 3, 2]);
    expect(await valorVeredicto(page)).toBe('Seguro privado completo recomendado');
    await expect(page.locator('[class*="precioNota"]')).not.toContainText('familia de 3');
  });

  // FAQPage: «básico con copago … entre 40 y 80 € al mes» para UNA persona joven. Pantalla:
  // completo desde 60 €/mes para TRES personas = 20 €/persona, la mitad del básico de la FAQ.
  test('HALLAZGO abierto: la FAQ da 40 €/mes por persona al seguro básico; la pantalla, 20 €/persona al completo', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: las dos cifras de la misma página no caben juntas.
    await abrirTest(page);
    await responder(page, [3, 2, 1, 0, 3, 3, 2, 0, 3, 2]);
    const minimoFaq = Number((await faqJsonLd(page)).match(/entre (\d+) y \d+ € al mes/)?.[1]);
    expect(minimoFaq).toBe(40); // precondición
    const minimo = Number((await page.locator('[class*="precioRango"]').innerText()).match(/\d+/)?.[0]);
    const personas = /familia de 3/.test(await page.locator('[class*="precioNota"]').innerText()) ? 3 : 1;
    expect(minimo / personas).toBeGreaterThanOrEqual(minimoFaq);
  });

  // Real Decreto-ley 28/2018 (BOE-A-2018-17992): desde el 1/1/2019 la incapacidad temporal por
  // contingencias comunes es de cobertura OBLIGATORIA en el RETA.
  test('HALLAZGO abierto: la guía dice que los autónomos no tienen «baja por enfermedad garantizada»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: falso desde 2019.
    await abrirTest(page);
    await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    expect(await abrirGuia(page)).not.toContain('sin baja por enfermedad garantizada');
  });

  test('HALLAZGO abierto: la guía se fecha «en 2025» y da como vigente el ranking de la OMS del año 2000', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el World Health Report 2000 es el único ranking de la OMS; nunca se repitió.
    await abrirTest(page);
    await responder(page, [1, 1, 1, 1, 0, 1, 0, 2, 2, 2]);
    const guia = await abrirGuia(page);
    const rankingSinAnio = /ranking de la OMS/.test(guia) && !/2000/.test(guia);
    expect(guia.includes('El sistema sanitario español en 2025') || rankingSinAnio).toBe(false);
  });

  // Ley 50/1980 de Contrato de Seguro, art. 10: el deber es responder al cuestionario del
  // asegurador; ante reserva o inexactitud, este puede RESCINDIR en un mes, y con dolo o culpa
  // grave queda liberado del pago. No es «nulidad del contrato».
  test('HALLAZGO abierto: la FAQ dice que no declarar una enfermedad da «nulidad del contrato»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: figura jurídica equivocada en el FAQPage (lo leen las IAs).
    await page.goto('/selector-seguro-salud/');
    expect(await faqJsonLd(page)).toContain('FAQPage'); // precondición
    expect(await faqJsonLd(page)).not.toContain('nulidad del contrato');
  });

  test('HALLAZGO abierto: una app del sistema sanitario español sin RegionBadge', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: §1.bis, «¿En qué comunidad autónoma resides?», MUFACE, € (como selector-mascota, 1340).
    await page.goto('/selector-seguro-salud/');
    await esperarHidratacionBotones(page);
    await expect(page.locator('text=/Solo España|Datos de referencia: España/')).toHaveCount(1, { timeout: 1_000 });
  });

  // El mismo perfil del caso de límite: dental +3, «Hasta 40 €/mes» −1 = 2. La pantalla dice
  // «Tu puntuación es 2» y enseña solo el +3: la resta que lleva a pública no aparece.
  test('HALLAZGO abierto: en «sanidad pública» por puntos se enseñan las sumas y se ocultan las restas', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: motor.ts solo lista las restas si el veredicto NO es pública; 15.860 perfiles.
    await abrirTest(page);
    const texto = await responder(page, [0, 0, 0, 0, 0, 0, 2, 3, 1, 2]);
    expect(texto).toContain('Salud dental: «Es un gasto importante para mí cada año» suma 3 puntos.');
    expect(texto).toContain('Presupuesto: «Hasta 40 €/mes» resta 1 punto.');
  });

  // Todo a cero · «Desempleo, estudiante o jubilado/a» · «NADA, no quiero gasto extra» → pública
  // forzada; el consejo le pide ahorrar «el equivalente» (§1.quinquies, regla 2).
  test('HALLAZGO abierto: a quien no quiere ningún gasto se le aconseja ahorrar «el equivalente» del seguro', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: asunción de capacidad de ahorro; sale en los 262.144 perfiles con «Nada».
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 3, 0, 0, 3, 0, 2]);
    expect(await valorVeredicto(page)).toBe('Sanidad pública es suficiente');
    expect(await resultado(page)).not.toContain('ahorrar el equivalente en un fondo de emergencia sanitaria');
  });

  test('HALLAZGO abierto: con seguro privado completo de empresa, el veredicto se titula «Sanidad pública es suficiente»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el título, la cobertura y «0 €/mes · vía impuestos» contradicen su propia razón.
    await abrirTest(page);
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 2, 2, 0]);
    expect(await resultado(page)).toContain('Ya tienes cobertura privada completa pagada por tu empresa');
    expect(await valorVeredicto(page)).not.toBe('Sanidad pública es suficiente');
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
      return ratio(sobre(leer(getComputedStyle(el).color) as Rgba, fondo), fondo);
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
    await responder(page, COMPLEMENTARIO);
    m.razonesTitulo = [await contraste(page, '[class*="razonesTitulo"]'), 4.5];
    m.btnRepetir = [await contraste(page, '[class*="btnRepetir"]'), 4.5];
    await abrirTest(page);
    await responder(page, PUBLICO);
    m.veredictoPublico = [await contraste(page, '[class*="veredictoValor"]'), 3];
    await abrirTest(page);
    await responder(page, COMPLETO);
    m.veredictoCompleto = [await contraste(page, '[class*="veredictoValor"]'), 3];
    return m;
  }

  test('HALLAZGO abierto: en tema claro, cinco textos de marca no llegan a su mínimo', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: --primary/--secondary/#e8a020 como texto; lo que toca es --primary-texto/--secondary-texto.
    // Medido hoy: progresoPaso 3,93 · razonesTitulo 3,67 · btnRepetir 3,93 (mín. 4,5) ·
    // veredicto «pública» (--secondary) 2,80 · veredicto «completo» (#e8a020) 2,22 (mín. 3).
    const m = await medirTextosDeMarca(page);
    expect(Object.entries(m).filter(([, [v, min]]) => v < min).map(([k]) => k)).toEqual([]);
  });

  test('en tema oscuro esos mismos textos sí llegan', async ({ page }) => {
    // Medido hoy: progresoPaso 6,23 · razonesTitulo 5,86 · btnRepetir 6,23 · pública 6,17 ·
    // completo 6,22. Es la guarda para cuando se drene el tema claro.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-seguro-salud/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const m = await medirTextosDeMarca(page); // abrirTest navega de nuevo: el tema se conserva
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(Object.entries(m).filter(([, [v, min]]) => v < min).map(([k]) => k)).toEqual([]);
  });

  test('HALLAZGO abierto (de familia): hero del resultado y botones en blanco sobre el degradado --primary→--secondary', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: el hero va sobre --hero-bg (8,33:1); hoy el subtítulo da 2,80 en claro.
    // Medido hoy, peor parada del degradado: claro 2,80 (hero y botones) · oscuro 2,23.
    await abrirTest(page);
    await page.locator('[role="radio"]').first().click(); // habilitado: un botón deshabilitado está exento
    const siguiente = await contraste(page, '[class*="btnSiguiente"]');
    await responder(page, COMPLEMENTARIO);
    const subtitulo = await contraste(page, '[class*="heroSubtitleSm"]');
    expect({ subtitulo: subtitulo >= 4.5, siguiente: siguiente >= 4.5 }).toEqual({ subtitulo: true, siguiente: true });
  });
});

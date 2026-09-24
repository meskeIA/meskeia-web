import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Inspector — visualizador-ciclo-viral (segmento interactiva, riesgo 2, 35 usos reales)
 *
 * Generado por /inspector el 24/09/2026. Primera inspección.
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Ciclo de Replicación Viral»; subtítulo «6 etapas interactivas, estrategias ADN vs ARN
 *   y mecanismos de evasión inmune». La metadata: «6 etapas de replicación, virus ADN vs ARN,
 *   retrovirus, latencia y mecanismos de evasión inmune. Biología molecular pura».
 *   No hay ninguna cifra que calcular ni ningún input: la verdad comprobable es de dos clases,
 *     a) OPERATIVA — seis etapas que se abren desde el diagrama SVG (<g role="button">, toggle)
 *        o desde la lista del panel (<button>), un botón «Cerrar» y tres pestañas ADN/ARN/
 *        Retrovirus con aria-pressed, cada una con su propio useState (independientes).
 *     b) EXACTITUD DEL CONTENIDO — el orden de las etapas y lo que se dice de cada tipo de
 *        virus lo fija la microbiología, no la app.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/visualizador-ciclo-viral/page.tsx, todo en el propio componente: ETAPAS (6 fichas con
 *   su posición cx/cy en el SVG), COMPARATIVA (7 filas) y MECANISMOS (3). Sin lib/ ni data/.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal — orden canónico y apertura desde la lista)
 *     El orden de las etapas del ciclo de un virus animal es, en cualquier manual (Madigan et
 *     al., «Brock Biology of Microorganisms», cap. de virología; Alberts, «Molecular Biology of
 *     the Cell»): adsorción/adhesión → penetración/entrada → desnudamiento (liberación del
 *     genoma) → replicación y síntesis → ensamblaje → liberación. La lista debe ser exactamente
 *     1 Adhesión · 2 Entrada · 3 Liberación del genoma · 4 Replicación y transcripción ·
 *     5 Ensamblaje · 6 Liberación. Al pulsar la 4 de la lista, el panel titula «Replicación y
 *     transcripción», su número es «4», menciona la transcriptasa inversa de los retrovirus, y
 *     en el diagrama SOLO «Etapa 4» queda aria-pressed="true". «Cerrar» vuelve a la lista de 6 y
 *     deja las 6 etapas a false. Con teclado, Enter sobre «6 Liberación» abre la etapa 6.
 *
 *   CASO 2 (límite — la última etapa, el toggle y el cambio de pestaña a mitad)
 *     Pulsar el círculo 6 abre «Liberación» (lisis y gemación). Pulsarlo OTRA vez es el onClick
 *     `activo ? null : e.numero`: cierra el panel y reaparece la lista de 6. Pasar de la 1 a la 6
 *     directamente (sin cerrar) debe sustituir la ficha entera: ni rastro de «gp120», que solo
 *     sale en la ficha de Adhesión (y en la de Entrada no). Cambiar de pestaña a «Retrovirus»
 *     con la etapa 6 abierta no la toca (estados independientes) y deja Retrovirus pressed.
 *     Verificado. En la primera inspección la etapa era un <g> sin tabindex dentro de un
 *     <svg role="img">, y cinco flechas punteadas pintadas DESPUÉS de los círculos robaban el
 *     clic de su centro (hallazgos 1359-1361). Reparado el 24/09/2026: sus regresiones van en
 *     el bloque «CASO 2 · el diagrama».
 *
 *   CASO 3 (lo que debe rechazarse — afirmaciones que la microbiología desmiente)
 *     a) Gripe: la tabla dice «Virus ARN · Lugar de replicación: Citoplasma» con «Influenza» en
 *        sus ejemplos, y la etapa 4 que «los virus ARN replican en el citoplasma». Los
 *        Orthomyxoviridae son la excepción de manual: transcriben y replican su ARN en el
 *        NÚCLEO (Baron, «Medical Microbiology», 4.ª ed., cap. 58 Orthomyxoviruses, NCBI
 *        Bookshelf NBK8611; te Velthuis y Fodor, Nat Rev Microbiol 2016;14:479). Esperado: que
 *        la fila del ARN recoja la excepción (menciona «núcleo»). Obtenido: «Citoplasma».
 *     b) Retrovirus: «proceso que invierte el "dogma central" habitual de ARN→proteína». El
 *        dogma (Crick, Nature 1970;227:561) es ADN→ARN→proteína y la transcriptasa inversa
 *        (Temin y Baltimore, 1970) invierte el paso ADN→ARN, no el ARN→proteína.
 *     c) Etapa 2: «Los virus envueltos (como VIH o influenza) fusionan su membrana lipídica con
 *        la membrana celular». La gripe entra por endocitosis y fusiona con la membrana del
 *        ENDOSOMA a pH ácido — lo dice la propia app en la etapa 3 («la acidificación del
 *        endosoma activa la proteína M2»).
 *     d) Riesgo 2 (suite salud): la app va `// @disclaimer: exempt` y su único aviso sanitario
 *        («debe consultarse con un profesional sanitario») vive DENTRO de <EducationalSection>,
 *        que nace plegada. El CLAUDE.md lo prohíbe expresamente y sus hermanas de suite
 *        (diabetes, alzheimer-parkinson, cáncer) montan DisclaimerCard médico no colapsable.
 *     Los cuatro se repararon el 24/09/2026 (hallazgos 1355-1358) y quedan como regresión.
 *
 * Los tres casos se ejecutaron antes contra http://localhost:3050/visualizador-ciclo-viral/
 * con Playwright vía node_modules/playwright (no MCP) y coincidieron con la resolución a mano.
 */

const RUTA = '/visualizador-ciclo-viral/';

const ORDEN_ESPERADO = [
  '1 Adhesión',
  '2 Entrada',
  '3 Liberación del genoma',
  '4 Replicación y transcripción',
  '5 Ensamblaje',
  '6 Liberación',
];

/** Botones de la lista del panel vacío (la clase exacta, no «etapaBotonNum»). */
function botonesLista(page: Page): Locator {
  return page.locator('button[class*="etapaBoton"]');
}

/** Círculo clicable del diagrama: <g role="button" aria-label="Etapa N: …">. */
function circulo(page: Page, n: number): Locator {
  return page.locator(`g[role="button"][aria-label^="Etapa ${n}:"]`);
}

/** Clic sobre el NÚMERO del círculo (el centro geométrico se prueba aparte, hallazgo 1359). */
async function pulsarCirculo(page: Page, n: number): Promise<void> {
  await circulo(page, n).locator('text').first().click();
}

function tituloEtapa(page: Page): Locator {
  return page.locator('h3[class*="etapaNombre"]');
}

function fichaEtapa(page: Page): Locator {
  return page.locator('[class*="etapaCard"]');
}

/**
 * La app no tiene ningún input que sirva de testigo a `esperarHidratacion`. Se espera a que
 * React haya colgado sus props del primer botón de la lista: hasta entonces un clic se pierde.
 */
async function irAlVisualizador(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ciclo de Replicación Viral', {
    timeout: 60_000,
  });
  await page.waitForFunction(
    () => {
      const b = document.querySelector('button[class*="etapaBoton"]');
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    undefined,
    { timeout: 15_000 },
  );
}

async function estadoPressed(page: Page): Promise<string[]> {
  return page
    .locator('g[role="button"]')
    .evaluateAll((els) => els.map((e) => `${e.getAttribute('aria-label')}=${e.getAttribute('aria-pressed')}`));
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 — normal: orden canónico y apertura desde la lista
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 1: las 6 etapas en el orden de manual y la 4 se abre desde la lista', async ({ page }) => {
  test.setTimeout(90_000);
  await irAlVisualizador(page);

  // Orden canónico adhesión → entrada → desnudamiento → replicación → ensamblaje → liberación.
  const lista = (await botonesLista(page).allInnerTexts()).map((t) =>
    t.replace(/\s+/g, ' ').replace(/\s*\p{Extended_Pictographic}.*$/u, '').trim(),
  );
  expect(lista).toEqual(ORDEN_ESPERADO);

  await botonesLista(page).filter({ hasText: 'Replicación y transcripción' }).click();
  await expect(tituloEtapa(page)).toHaveText('Replicación y transcripción');
  await expect(page.locator('[class*="etapaNumero"]')).toHaveText('4');
  await expect(fichaEtapa(page)).toContainText('transcriptasa inversa');
  expect(await estadoPressed(page)).toEqual([
    'Etapa 1: Adhesión=false',
    'Etapa 2: Entrada=false',
    'Etapa 3: Liberación del genoma=false',
    'Etapa 4: Replicación y transcripción=true',
    'Etapa 5: Ensamblaje=false',
    'Etapa 6: Liberación=false',
  ]);

  // «Cerrar» devuelve la lista de 6 y ninguna etapa queda pulsada.
  await page.getByRole('button', { name: 'Cerrar detalle de etapa' }).click();
  await expect(tituloEtapa(page)).toHaveCount(0);
  await expect(botonesLista(page)).toHaveCount(6);
  expect((await estadoPressed(page)).every((s) => s.endsWith('=false'))).toBe(true);

  // Teclado: Enter sobre el último botón de la lista abre la etapa 6.
  await botonesLista(page).nth(5).focus();
  await page.keyboard.press('Enter');
  await expect(tituloEtapa(page)).toHaveText('Liberación');
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 — límite: la última etapa, el toggle y el cambio de pestaña a mitad
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 2: la etapa 6 se abre, se cierra con el mismo círculo y sobrevive al cambio de pestaña', async ({ page }) => {
  test.setTimeout(90_000);
  await irAlVisualizador(page);

  await pulsarCirculo(page, 6);
  await expect(tituloEtapa(page)).toHaveText('Liberación');
  await expect(fichaEtapa(page)).toContainText('lisis');
  await expect(fichaEtapa(page)).toContainText('gemación');
  await expect(circulo(page, 6)).toHaveAttribute('aria-pressed', 'true');

  // Toggle: el mismo círculo cierra (onClick → activo ? null : numero).
  await pulsarCirculo(page, 6);
  await expect(tituloEtapa(page)).toHaveCount(0);
  await expect(botonesLista(page)).toHaveCount(6);
  await expect(circulo(page, 6)).toHaveAttribute('aria-pressed', 'false');

  // De la 1 a la 6 sin cerrar: la ficha se sustituye entera. «gp120» solo sale en Adhesión.
  await pulsarCirculo(page, 1);
  await expect(tituloEtapa(page)).toHaveText('Adhesión');
  await expect(fichaEtapa(page)).toContainText('gp120');
  await pulsarCirculo(page, 6);
  await expect(tituloEtapa(page)).toHaveText('Liberación');
  await expect(fichaEtapa(page)).not.toContainText('gp120');
  await expect(circulo(page, 1)).toHaveAttribute('aria-pressed', 'false');

  // Cambiar de pestaña a mitad no toca la etapa abierta: estados independientes.
  const retro = page.getByRole('button', { name: 'Retrovirus', exact: true });
  await retro.click();
  await expect(retro).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Virus ARN', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[class*="tipoCard"] h3')).toHaveText('Retrovirus: el dogma invertido');
  await expect(tituloEtapa(page)).toHaveText('Liberación');
});

test.describe('CASO 2 · el diagrama (reparado el 24/09/2026, hallazgos 1359-1361)', () => {
  test('el centro exacto de cada círculo abre su etapa (1359)', async ({ page }) => {
    // Antes, cinco flechas punteadas se pintaban DESPUÉS de los círculos y terminaban en su
    // centro: el clic en el centro geométrico de los círculos 3, 4, 5 y 6 caía en el <path>.
    // Ahora el fondo decorativo se pinta antes y lleva pointer-events="none".
    // ENTRADA clic en el centro de cada círculo → ESPERADO su ficha y ningún <path> encima.
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    const nombres = ['Adhesión', 'Entrada', 'Liberación del genoma', 'Replicación y transcripción', 'Ensamblaje', 'Liberación'];
    for (let n = 1; n <= 6; n++) {
      const c = circulo(page, n).locator('circle[r="17"]');
      await c.scrollIntoViewIfNeeded();
      const bb = await c.boundingBox();
      if (!bb) throw new Error(`El círculo ${n} no tiene caja.`);
      const x = bb.x + bb.width / 2;
      const y = bb.y + bb.height / 2;
      const tocado = await page.evaluate(
        ([px, py]) => document.elementFromPoint(px, py)?.closest('g[role="button"]')?.getAttribute('aria-label') ?? '',
        [x, y],
      );
      expect(tocado, `centro del círculo ${n}`).toMatch(new RegExp(`^Etapa ${n}:`));
      await page.mouse.click(x, y);
      await expect(tituloEtapa(page)).toHaveText(nombres[n - 1]);
      // Toggle de vuelta para dejar el panel como estaba.
      await page.mouse.click(x, y);
      await expect(tituloEtapa(page)).toHaveCount(0);
    }
  });

  test('las etapas del diagrama se alcanzan con el tabulador y se abren con Enter y Espacio (1360)', async ({ page }) => {
    // Antes: <g role="button"> sin tabindex ni onKeyDown dentro de un <svg role="img">.
    // ENTRADA 40 Tab desde el principio → ESPERADO «Etapa 1: Adhesión» enfocada; Enter la abre,
    // Espacio la vuelve a cerrar (toggle), y aria-pressed lo refleja.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await expect(page.locator('svg[role="img"]').filter({ has: page.locator('g[role="button"]') })).toHaveCount(0);
    let encontrado = false;
    for (let i = 0; i < 40 && !encontrado; i++) {
      await page.keyboard.press('Tab');
      const etiqueta = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
      encontrado = etiqueta === 'Etapa 1: Adhesión';
    }
    expect(encontrado).toBe(true);
    await page.keyboard.press('Enter');
    await expect(tituloEtapa(page)).toHaveText('Adhesión');
    await expect(circulo(page, 1)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(tituloEtapa(page)).toHaveCount(0);
    await expect(circulo(page, 1)).toHaveAttribute('aria-pressed', 'false');
    // Tab siguiente: la etapa 2, que Espacio abre.
    await page.keyboard.press('Tab');
    await expect(circulo(page, 2)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(tituloEtapa(page)).toHaveText('Entrada');
  });

  test('el foco no cae a <body> al abrir desde la lista ni al cerrar la ficha (1360)', async ({ page }) => {
    // La lista se desmonta al abrir una etapa y el botón «Cerrar» al cerrarla.
    // ENTRADA Enter en «6 Liberación» → ESPERADO foco en el título de la ficha; Enter en
    // «Cerrar» → ESPERADO foco de vuelta en el botón 6 de la lista.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await botonesLista(page).nth(5).focus();
    await page.keyboard.press('Enter');
    await expect(tituloEtapa(page)).toHaveText('Liberación');
    await expect(tituloEtapa(page)).toBeFocused();
    await page.getByRole('button', { name: 'Cerrar detalle de etapa' }).focus();
    await page.keyboard.press('Enter');
    await expect(botonesLista(page).nth(5)).toBeFocused();
  });

  test('las seis etiquetas del diagrama son distintas y «Célula huésped» no queda bajo un círculo (1361)', async ({ page }) => {
    // Antes la etiqueta salía de nombre.split(' ')[0]: la 3 («Liberación del genoma») y la 6
    // («Liberación») decían las dos «Liberación». Y «Célula huésped» (y=365) caía dentro del
    // círculo 4 (cy=370, r=17).
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const etiquetas = await page
      .locator('g[role="button"]')
      .evaluateAll((gs) => gs.map((g) => g.querySelectorAll('text')[1]?.textContent ?? ''));
    expect(etiquetas).toEqual(['Adhesión', 'Entrada', 'Genoma', 'Replicación', 'Ensamblaje', 'Liberación']);
    expect(new Set(etiquetas).size).toBe(6);

    const rotulo = await page.locator('svg text', { hasText: 'Célula huésped' }).boundingBox();
    const c4 = await circulo(page, 4).locator('circle[r="17"]').boundingBox();
    if (!rotulo || !c4) throw new Error('Sin caja para el rótulo o el círculo 4.');
    // Sin solape vertical: el rótulo acaba por encima de donde empieza el círculo.
    expect(rotulo.y + rotulo.height).toBeLessThanOrEqual(c4.y);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 — lo que debe rechazarse: contenido que la microbiología desmiente
// (reparado el 24/09/2026, hallazgos 1355-1358)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('CASO 3 · contenido y aviso sanitario', () => {
  test('a) la gripe replica su ARN en el núcleo, no en el citoplasma (1355)', async ({ page }) => {
    // Orthomyxoviridae: síntesis de ARN viral en el NÚCLEO (Baron, Medical Microbiology, cap. 58,
    // NCBI NBK8611). ENTRADA pestaña «Virus ARN», fila «Lugar de replicación» (ejemplos:
    // Influenza…) → ESPERADO mención del núcleo; y la etapa 4 recoge la excepción.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const fila = page.locator('table tbody tr').filter({ hasText: 'Lugar de replicación' });
    await expect(fila.locator('td').nth(2)).toContainText(/gripe.*núcleo/i);
    await botonesLista(page).filter({ hasText: 'Replicación y transcripción' }).click();
    await expect(fichaEtapa(page)).toContainText('La excepción clásica es la gripe');
    await expect(fichaEtapa(page)).not.toContainText('Los virus ARN replican en el citoplasma');
  });

  test('b) la transcriptasa inversa invierte el paso ADN→ARN del dogma central (1356)', async ({ page }) => {
    // Dogma central (Crick, 1970): ADN→ARN→proteína; la TI invierte ADN→ARN.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await page.getByRole('button', { name: 'Retrovirus', exact: true }).click();
    const tarjeta = page.locator('[class*="tipoCard"]');
    await expect(tarjeta).toContainText('Retrovirus: el dogma invertido');
    await expect(tarjeta).toContainText('invierte el paso ADN→ARN');
    await expect(tarjeta).not.toContainText('habitual de ARN→proteína');
  });

  test('c) la gripe fusiona con la membrana del endosoma; el VIH, con la plasmática (1357)', async ({ page }) => {
    // Gripe: endocitosis mediada por receptor y fusión de la envoltura con la membrana del
    // endosoma a pH ácido (HA2); VIH: gp41 fusiona con la membrana plasmática.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await botonesLista(page).filter({ hasText: 'Entrada' }).click();
    await expect(tituloEtapa(page)).toHaveText('Entrada');
    await expect(fichaEtapa(page)).not.toContainText('(como VIH o influenza) fusionan');
    await expect(fichaEtapa(page)).toContainText('como el VIH, se fusionan directamente con la membrana plasmática');
    await expect(fichaEtapa(page)).toContainText('como la gripe, entran primero por endocitosis');
    await expect(fichaEtapa(page)).toContainText('membrana del endosoma');
  });

  test('d) riesgo 2: aviso sanitario visible sin desplegar nada (1358)', async ({ page }) => {
    // Suite salud → nivel 2, DisclaimerCard no colapsable (_private/DISCLAIMER-POLICY.md) y
    // nunca dentro de <EducationalSection>.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await expect(page.getByRole('button', { name: 'Ver guía educativa' })).toHaveAttribute('aria-expanded', 'false');
    const aviso = page.locator('[class*="disclaimerCard"]').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('profesional sanitario');
  });
});

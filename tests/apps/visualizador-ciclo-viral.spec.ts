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

  test('SOSPECHA · con la etapa activa, ningún rótulo desborda su círculo ni el diagrama', async ({ page }) => {
    // Sospecha del Inspector, medida el 24/09/2026 antes de reparar: con el rótulo DENTRO del
    // círculo (r = 17, diámetro 34) a 7 unidades y en blanco, getBBox() daba 35,6 de ancho a
    // «Replicación» y 35,7 a «Ensamblaje»: blanco sobre claro en lo que sobresalía.
    // ENTRADA activar cada etapa → ESPERADO su rótulo entero FUERA del círculo (caja del texto
    // a más de 17 del centro), dentro del viewBox, fuera de la célula y a ≥ 4,5:1 sobre la tarjeta.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    for (let n = 1; n <= 6; n++) {
      await circulo(page, n).click();
      await expect(circulo(page, n)).toHaveAttribute('aria-pressed', 'true');
      const m = await circulo(page, n).evaluate((g) => {
        const canal = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
        const c = g.querySelector('circle[r="17"]') as SVGCircleElement;
        const t = g.querySelectorAll('text')[1] as SVGTextElement;
        const bb = t.getBBox();
        const cx = Number(c.getAttribute('cx'));
        const cy = Number(c.getAttribute('cy'));
        const px = Math.max(bb.x, Math.min(cx, bb.x + bb.width));
        const py = Math.max(bb.y, Math.min(cy, bb.y + bb.height));
        const svg = (g as SVGGraphicsElement).ownerSVGElement as SVGSVGElement;
        const vb = svg.viewBox.baseVal;
        const esquinas = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]];
        // La célula es la elipse (250, 210) con radios 160 × 140.
        const enCelula = esquinas.some(([x, y]) => ((x - 250) / 160) ** 2 + ((y - 210) / 140) ** 2 < 1);
        const l1 = lum(rgb(getComputedStyle(t).fill));
        const l2 = lum(rgb(getComputedStyle(svg.parentElement as Element).backgroundColor));
        return {
          etiqueta: t.textContent ?? '',
          holgura: Math.hypot(px - cx, py - cy) - 17,
          dentro: bb.x >= vb.x && bb.y >= vb.y && bb.x + bb.width <= vb.x + vb.width && bb.y + bb.height <= vb.y + vb.height,
          enCelula,
          contraste: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05),
        };
      });
      expect(m.holgura, `«${m.etiqueta}» toca su círculo`).toBeGreaterThan(0);
      expect(m.dentro, `«${m.etiqueta}» se sale del viewBox`).toBe(true);
      expect(m.enCelula, `«${m.etiqueta}» pisa la célula`).toBe(false);
      expect(m.contraste, `«${m.etiqueta}» activo sobre la tarjeta`).toBeGreaterThanOrEqual(4.5);
    }
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

// ═════════════════════════════════════════════════════════════════════════════
// REINSPECCIÓN del 25/09/2026 (la app cambió en c7f08196 y 0d54c8f9)
//
// Los hallazgos 1355-1361 se re-ejecutaron con su caso y están reparados. Lo que sigue son
// los casos nuevos que pasan por el código tocado, resueltos a mano antes de abrir la app:
//
//   · Móvil 360 px: la sección deja 360 − 2·24 = 312 px, la tarjeta del SVG resta 2·16 de
//     relleno y 2·1 de borde → el SVG mide 278 px para un viewBox de 528 → escala 0,5265.
//     Rótulo de etapa (fontSize 10) → 5,27 px; número (12) → 6,32 px; círculo (r 17) →
//     17,9 px de diámetro. Lighthouse («Document doesn't use legible font sizes»,
//     developer.chrome.com/docs/lighthouse/seo/font-size): por debajo de 12 px no se lee
//     sin ampliar. Los círculos, en cambio, están a más de 24 px unos de otros, así que
//     cumplen WCAG 2.5.8 por la excepción de separación.
//   · «Célula huésped» (#48A9A6, L = 0,325) pasó en la reparación de 1361 de y=365 (sobre
//     la tarjeta: 2,80:1 en claro, 4,93:1 en oscuro) a y=335, DENTRO de la célula: sobre el
//     borde del degradado (~#C9E6F0, L ≈ 0,75) da ≈ 2,1:1, y en oscuro sobre #1E3A4A
//     (L = 0,038) 4,26:1. «(ADN celular)» (#2E86AB, L = 0,206) sobre el núcleo (~#B3D1E6,
//     L ≈ 0,61) ≈ 2,6:1. Texto pequeño: exige 4,5:1.
//   · Rótulo activo (--primary-texto) sobre la tarjeta: 5,47:1 en claro y 4,93:1 en oscuro
//     (#3FA5D1 sobre #2D2D2D); anillo de foco (--primary): 4,11:1 y 4,93:1, ≥ 3:1.
// ═════════════════════════════════════════════════════════════════════════════

function rgbDe(s: string): number[] {
  return (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}

function contrasteWcag(a: number[], b: number[]): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Cambia de tema y espera a que la tarjeta del SVG termine la transición a su --bg-card. */
async function ponerTema(page: Page, tema: 'light' | 'dark'): Promise<void> {
  await page.evaluate((t) => {
    document.documentElement.dataset.theme = t;
  }, tema);
  const destino = await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.cssText = 'background: var(--bg-card); transition: none; position: absolute;';
    document.body.appendChild(d);
    const c = getComputedStyle(d).backgroundColor;
    d.remove();
    return c;
  });
  await expect
    .poll(() => page.locator('[class*="svgContainer"]').first().evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe(destino);
}

/**
 * Fondo REAL bajo un rótulo del SVG (hay degradados): se oculta el texto, se fotografía su
 * caja y se promedian los píxeles en el navegador.
 */
async function fondoMedio(page: Page, texto: Locator): Promise<number[]> {
  await texto.scrollIntoViewIfNeeded();
  const caja = await texto.boundingBox();
  if (!caja) throw new Error('El rótulo no tiene caja.');
  await texto.evaluate((el) => {
    (el as SVGTextElement).style.visibility = 'hidden';
  });
  const png = (await page.screenshot({ clip: caja })).toString('base64');
  await texto.evaluate((el) => {
    (el as SVGTextElement).style.visibility = '';
  });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const lienzo = document.createElement('canvas');
    lienzo.width = img.width;
    lienzo.height = img.height;
    const ctx = lienzo.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
      n++;
    }
    return [r / n, g / n, b / n];
  }, png);
}

test.describe('REINSPECCIÓN 25/09/2026 · lo que tocó la reparación', () => {
  test('el aviso sanitario es médico, severity high, sin pliegue, fuera de la guía y antes del diagrama (1358)', async ({ page }) => {
    // _private/DISCLAIMER-POLICY.md, nivel 2 ALTO: collapsible={false}, severity="high", y
    // nunca dentro de <EducationalSection>. El componente pinta role="note" para high y no
    // monta botón de pliegue (aria-expanded) cuando la severidad no lo permite.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const aviso = page.locator('[class*="disclaimerCard"]');
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toHaveClass(/variant-medical/);
    await expect(aviso).toHaveClass(/severity-high/);
    await expect(aviso).toHaveAttribute('role', 'note');
    await expect(aviso.locator('button[aria-expanded]')).toHaveCount(0);
    expect(await aviso.evaluate((el) => el.closest('[class*="EducationalSection"]') === null)).toBe(true);
    expect(
      await aviso.evaluate((el) => {
        const svg = document.querySelector('svg[role="group"]');
        return Boolean(svg && el.compareDocumentPosition(svg) & Node.DOCUMENT_POSITION_FOLLOWING);
      }),
    ).toBe(true);
  });

  test('teclado: Enter en el círculo 3 abre su ficha, el foco sigue en él y «Cerrar» lo devuelve a la lista (1360)', async ({ page }) => {
    // ENTRADA Tab hasta «Etapa 3», Enter → ESPERADO ficha «Liberación del genoma» y el foco en
    // el mismo círculo (es un conmutador). Cuatro Tab más (4, 5, 6 y «Cerrar»: el título tiene
    // tabIndex −1) y Enter → ESPERADO foco en el botón 3 de la lista, que vuelve a montarse.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await circulo(page, 1).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(circulo(page, 3)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(tituloEtapa(page)).toHaveText('Liberación del genoma');
    await expect(circulo(page, 3)).toBeFocused();
    await expect(circulo(page, 3)).toHaveAttribute('aria-pressed', 'true');
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cerrar detalle de etapa' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(tituloEtapa(page)).toHaveCount(0);
    await expect(botonesLista(page).nth(2)).toBeFocused();
  });

  test('en oscuro, el rótulo activo se lee (≥ 4,5:1) y el anillo de foco se ve (≥ 3:1)', async ({ page }) => {
    // 0d54c8f9 sacó los rótulos del círculo y les dio --primary-texto al activarse; el test de
    // la SOSPECHA lo mide en claro. ESPERADO en oscuro: #3FA5D1 sobre #2D2D2D = 4,93:1 en los
    // seis, y el anillo (--primary, el mismo #3FA5D1) visible con Tab a 4,93:1.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await ponerTema(page, 'dark');
    for (let n = 1; n <= 6; n++) {
      await circulo(page, n).locator('circle[r="17"]').click();
      await expect(circulo(page, n)).toHaveAttribute('aria-pressed', 'true');
      const m = await circulo(page, n).evaluate((g) => ({
        texto: getComputedStyle(g.querySelectorAll('text')[1]).fill,
        fondo: getComputedStyle((g as SVGGElement).ownerSVGElement!.parentElement!).backgroundColor,
      }));
      expect(contrasteWcag(rgbDe(m.texto), rgbDe(m.fondo)), `rótulo activo de la etapa ${n}`).toBeGreaterThanOrEqual(4.5);
      await circulo(page, n).locator('circle[r="17"]').click();
      await expect(circulo(page, n)).toHaveAttribute('aria-pressed', 'false');
    }
    await circulo(page, 2).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(circulo(page, 1)).toBeFocused();
    const anillo = await circulo(page, 1).evaluate((g) => {
      const a = g.querySelector('circle[r="23"]') as SVGCircleElement;
      return {
        opacidad: getComputedStyle(a).opacity,
        trazo: getComputedStyle(a).stroke,
        fondo: getComputedStyle((g as SVGGElement).ownerSVGElement!.parentElement!).backgroundColor,
      };
    });
    expect(anillo.opacidad).toBe('1');
    expect(contrasteWcag(rgbDe(anillo.trazo), rgbDe(anillo.fondo))).toBeGreaterThanOrEqual(3);
  });

  test('2169 · los rótulos fijos del diagrama llegan a 4,5:1 sobre su fondo real («Célula huésped», «(ADN celular)»)', async ({ page }) => {
    // REPARADO el 26/09/2026: el color va en el módulo (.rotuloCelula #1F5F5C / #7ECFCB en
    // oscuro; .rotuloNucleo y .rotuloNucleoSecundario #0F4C66, el núcleo es claro en los dos).
    // Hallazgo de la reinspección del 25/09/2026. Al mover «Célula huésped» dentro de la célula
    // (reparación de 1361) quedó a ~2,2:1 en claro sobre el degradado y a 4,26:1 en oscuro
    // sobre #1E3A4A; «(ADN celular)», #2E86AB sobre el núcleo, ~2,5:1 en los dos temas.
    // ENTRADA cargar la página, medir cada rótulo sobre el fondo real en claro y en oscuro →
    // ESPERADO ≥ 4,5:1 (texto pequeño: 11 y 9 unidades, ~9 y ~7 px en escritorio).
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    const suspensos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await ponerTema(page, tema);
      for (const rotulo of ['Célula huésped', '(ADN celular)']) {
        const texto = page.locator('svg[role="group"] g[aria-hidden="true"] text', { hasText: rotulo }).first();
        const fill = await texto.evaluate((el) => getComputedStyle(el).fill);
        const c = contrasteWcag(rgbDe(fill), await fondoMedio(page, texto));
        if (c < 4.5) suspensos.push(`${tema} · «${rotulo}» ${c.toFixed(2)}:1`);
      }
    }
    expect(suspensos).toEqual([]);
  });
});

test.describe('REINSPECCIÓN 25/09/2026 · móvil de 360 px', () => {
  test.use({
    viewport: { width: 360, height: 800 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('cada círculo se abre y se cierra con un toque en su centro, sin scroll horizontal (1359)', async ({ page }) => {
    // Círculos de 17,9 px, separados más de 24 px: el toque en el centro debe acertar.
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ancho).toBeLessThanOrEqual(0);
    const nombres = ['Adhesión', 'Entrada', 'Liberación del genoma', 'Replicación y transcripción', 'Ensamblaje', 'Liberación'];
    for (let n = 1; n <= 6; n++) {
      const c = circulo(page, n).locator('circle[r="17"]');
      await c.scrollIntoViewIfNeeded();
      const bb = await c.boundingBox();
      if (!bb) throw new Error(`El círculo ${n} no tiene caja.`);
      await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await expect(tituloEtapa(page)).toHaveText(nombres[n - 1]);
      await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await expect(tituloEtapa(page)).toHaveCount(0);
    }
  });

  test('2170 · a 360 px ningún rótulo ni número visible del diagrama baja de 12 px', async ({ page }) => {
    // REPARADO el 26/09/2026: en una columna (≤ 700 px) los rótulos del SVG se ocultan y los
    // sustituye una leyenda HTML debajo; los números suben a 23 unidades (≥ 12 px a 360 px).
    // El caso se conserva y se amplía: los rótulos fijos (célula, núcleo) tampoco pueden
    // quedar visibles por debajo de 12 px, y la leyenda tiene que estar a la vista.
    // Hallazgo de la reinspección del 25/09/2026. El SVG escala a 0,5265 (278 px para un
    // viewBox de 528): el rótulo de 10 unidades sale a 5,27 px y el número de 12 a 6,32 px.
    // ENTRADA 360 × 800 → ESPERADO todo rótulo y número VISIBLE del diagrama ≥ 12 px (umbral de
    // Lighthouse para texto legible en móvil) · OBTENIDO 5,27 y 6,32 px.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const pequenos = await page.locator('svg[role="group"] > g').evaluateAll((gs) =>
      gs.flatMap((g) => {
        const escala = (g as SVGGElement).getScreenCTM()?.a ?? 1;
        return [...g.querySelectorAll('text')]
          .filter((t) => {
            const cs = getComputedStyle(t);
            return cs.display !== 'none' && cs.visibility !== 'hidden' && t.getBoundingClientRect().width > 0;
          })
          .map((t) => ({ texto: t.textContent ?? '', px: parseFloat(getComputedStyle(t).fontSize) * escala }))
          .filter((m) => m.px < 12)
          .map((m) => `«${m.texto}» ${m.px.toFixed(2)} px`);
      }),
    );
    expect(pequenos).toEqual([]);
    // Los seis números siguen visibles, y la leyenda da el nombre de cada uno
    await expect(page.locator('g[role="button"] text:visible')).toHaveCount(6);
    const leyenda = page.locator('[class*="leyendaEtapas"] li');
    await expect(leyenda).toHaveCount(6);
    await expect(leyenda.nth(2)).toHaveText('3 Genoma');
    const pxLeyenda = await leyenda.first().evaluate((li) => parseFloat(getComputedStyle(li).fontSize));
    expect(pxLeyenda).toBeGreaterThanOrEqual(12);
  });
});

test.describe('REINSPECCIÓN 25/09/2026 · contenido cotejado con fuente', () => {
  test('lo verificado sigue en su sitio: lisis/gemación, episoma frente a provirus, lítico/lisogénico acotado a fagos', async ({ page }) => {
    // OpenStax Microbiology (2016), 6.2 «The Viral Life Cycle»: la gripe «is one of the few RNA
    // viruses that replicates in the nucleus», sale por gemación y la célula «is not killed»;
    // el herpes queda latente en ganglios nerviosos; el genoma integrado del retrovirus es el
    // «provirus». Lisis y ciclo lisogénico, en la app, atribuidos a bacteriófagos.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const integracion = page.locator('table tbody tr').filter({ hasText: 'Integración en huésped' });
    await expect(integracion.locator('td').nth(1)).toContainText('los herpesvirus persisten como episoma, sin integrarse');
    await expect(integracion.locator('td').nth(3)).toContainText('provirus');
    await botonesLista(page).filter({ hasText: 'Liberación del genoma' }).click();
    await expect(fichaEtapa(page)).toContainText('viajan al núcleo, donde la gripe replica su genoma');
    await page.getByRole('button', { name: 'Cerrar detalle de etapa' }).click();
    await botonesLista(page).nth(5).click();
    await expect(fichaEtapa(page)).toContainText('Es típica de bacteriófagos y algunos virus animales (poliovirus)');
    await expect(fichaEtapa(page)).toContainText('Es el mecanismo del VIH y de la gripe');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('[class*="eduCard"] h4', { hasText: 'Ciclo lítico' })).toHaveText(
      'Ciclo lítico vs. ciclo lisogénico (bacteriófagos)',
    );
  });

  test('2171 · ADN, «Lugar de replicación»: recoge la excepción de los poxvirus, que replican en el citoplasma', async ({ page }) => {
    // Hallazgo de la reinspección del 25/09/2026. OpenStax Microbiology 6.2: «Most DNA viruses
    // can replicate inside the nucleus, with an exception observed in the large DNA viruses,
    // such as the poxviruses, that can replicate in the cytoplasm». La reparación de 1355 puso
    // la excepción de la gripe en la columna ARN; la ADN sigue diciendo «Núcleo celular».
    // ENTRADA pestaña cualquiera, fila «Lugar de replicación», columna Virus ADN → ESPERADO
    // menciona los poxvirus (o la viruela) · OBTENIDO «Núcleo celular».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const fila = page.locator('table tbody tr').filter({ hasText: 'Lugar de replicación' });
    await expect(fila.locator('td').nth(1)).toContainText(/poxvirus|viruela/i);
  });

  test('2172 · ARN, «Tasa de mutación»: salva a los coronavirus, que corrigen errores con nsp14', async ({ page }) => {
    // Hallazgo de la reinspección del 25/09/2026. Robson et al., «Coronavirus RNA
    // Proofreading: Molecular Basis and Therapeutic Targeting», Mol Cell 2020;79:710-727
    // (PMID 32853546): «the capacity of CoVs to proofread and remove mismatched nucleotides
    // during genome replication and transcription» (exonucleasa nsp14). La fila de ejemplos de
    // la misma columna pone SARS-CoV-2.
    // ENTRADA fila «Tasa de mutación», columna Virus ARN → ESPERADO la excepción de los
    // coronavirus (o que no afirme «sin corrección de errores» para todos) · OBTENIDO «Alta
    // (sin corrección de errores)».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const celda = page.locator('table tbody tr').filter({ hasText: 'Tasa de mutación' }).locator('td').nth(2);
    const texto = (await celda.textContent()) ?? '';
    expect(/coronavirus/i.test(texto) || !/sin corrección de errores/i.test(texto), `celda: «${texto}»`).toBe(true);
    // Y la tarjeta ARN, que agrupaba al SARS-CoV-2 con los virus sin actividad correctora
    await page.getByRole('button', { name: 'Virus ARN', exact: true }).click();
    await expect(page.locator('[class*="tipoCard"]')).toContainText('nsp14');
  });

  test('2173 · el ciclo lítico de los fagos tiene cinco etapas y la cápside se queda fuera', async ({ page }) => {
    // Hallazgo de la reinspección del 25/09/2026. OpenStax Microbiology 6.2: «There are five
    // stages in the bacteriophage lytic cycle» (attachment, penetration, biosynthesis,
    // maturation, release) y en la penetración «The phage head and remaining components remain
    // outside the bacteria»: no hay decapsidación dentro de la célula (la etapa 3 de la app).
    // ENTRADA «Ver guía educativa», tarjeta del ciclo lítico → ESPERADO sin «sigue las 6 etapas
    // del visualizador» · OBTENIDO esa frase.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tarjeta = page.locator('[class*="eduCard"]').filter({ hasText: 'Ciclo lítico' });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta).not.toContainText('sigue las 6 etapas del visualizador');
    await expect(tarjeta).toContainText('cinco etapas');
    await expect(tarjeta).toContainText('la cápside se queda fuera');
  });

  test('2174 · «~8 %» de retrovirus endógenos lleva el espacio duro antes del %', async ({ page }) => {
    // Hallazgo de la reinspección del 25/09/2026. Regla del CLAUDE.md global (25/09/2026):
    // «15 %», separado con espacio duro U+00A0.
    // ENTRADA pestaña Retrovirus → ESPERADO «8 %» con U+00A0 · OBTENIDO «~8%».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await page.getByRole('button', { name: 'Retrovirus', exact: true }).click();
    // toContainText normaliza los espacios: se mira el carácter crudo
    const crudo = (await page.locator('[class*="tipoCard"]').textContent()) ?? '';
    expect(crudo).toContain('~8\u00a0%');
  });
});

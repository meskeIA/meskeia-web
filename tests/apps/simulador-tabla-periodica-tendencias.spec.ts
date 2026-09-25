import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Tendencias de la Tabla Periódica (heatmap) — test de regresión del Inspector (25/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Tendencias de la Tabla Periódica» · metadata «heatmap visual: radio atómico,
 * electronegatividad, energía de ionización, afinidad electrónica y punto de fusión para los
 * 118 elementos» · cinco botones de propiedad (aria-pressed), leyenda con mínimo y máximo,
 * flechas de tendencia, tooltip con el valor exacto y un bloque educativo que enseña las
 * tendencias (el radio crece hacia abajo y a la izquierda; la electronegatividad y la 1.ª
 * energía de ionización al revés, con las excepciones N > O y Be > B).
 *
 * No hay campos de texto: la única entrada es elegir propiedad y señalar un elemento. El
 * valor de cada celda se lee de su aria-label («Flúor, Z=9, 3.98 (Pauling)»), que lleva la
 * cifra completa; la celda pinta la cifra redondeada.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS (consultados el 25/09/2026)
 * ─────────────────────────────────────────────────────────────────
 * · 1.ª energía de ionización: NIST Atomic Spectra Database, «Ground States and Ionization
 *   Energies» (espectros I), en eV × 96,485 33 kJ/mol por eV (CODATA).
 * · Electronegatividad de Pauling: A. L. Allred, J. Inorg. Nucl. Chem. 17, 215 (1961), tal
 *   como la tabulan el CRC Handbook y la tabla periódica de PubChem (F 3,98 · O 3,44 ·
 *   Cl 3,16 · Na 0,93 · Cs 0,79).
 * · Radio atómico «calculado»: Clementi, Raimondi y Reinhardt, J. Chem. Phys. 47, 1300
 *   (1967), que es la serie que usa la app para Z = 1-86. Radio covalente de enlace sencillo:
 *   Pyykkö y Atsumi, Chem. Eur. J. 15, 186 (2009), que es la que usa para Z = 104-118.
 * · Afinidad electrónica: Tm 1,029(22) eV = 99(3) kJ/mol (Davis y Thompson, Phys. Rev. A 65,
 *   010501, 2001); At 2,415 78(7) eV = 233,087 kJ/mol (Leimbach et al., Nat. Commun. 11,
 *   3824, 2020). La app usa el convenio «más negativo = más favorable».
 * · Nombres: acuerdo RAC-RAE-RSEQ-Fundéu, An. Quím. 113 (2017) 65-67 (punto 6: «suprimir
 *   tantalio como variante de tántalo, único nombre»; punto 11: «darmstatio») y DLE 23.8.1
 *   («einstenio», «tántalo», «darmstatio»; «einsteinio», «tantalio» y «darmstadtio» no están).
 *
 * HALLAZGOS ABIERTOS (cada uno vigilado por un test.fail que avisará cuando se repare)
 * ───────────────────────────────────────────────────────────────────────────────────────
 *   A · el radio mezcla tres definiciones y pinta el período 7 más pequeño que el 4
 *   B · cifras con punto decimal y la celda redondeando F 3,98 a «4.0»
 *   C · «Einsteinio» y «Darmstadtio»
 *   D · «Tantalio»
 *   E · etiquetas: «((Pauling))», «1ª», «Metal De Transición», «0 (noble/metal d¹⁰)» en el N
 *   F · punto de fusión: la leyenda da el máximo al C (3550 °C) y el texto «W la más alta»
 *   G · afinidad electrónica de relleno (−50 en los lantánidos) y la del At anterior a 2020
 *   H · blanco sobre rojo en las celdas calientes (F 4,00:1)
 *   I · marcador La/Ac en oscuro a 1,40:1
 *   J · teclado: el tooltip nace en la esquina y se queda con el elemento anterior
 *   K · botones de propiedad por debajo de 4,5:1
 */

const RUTA = '/simulador-tabla-periodica-tendencias/';

const BOTON = {
  radio: /^Radio atómico/,
  electronegatividad: /^Electronegatividad/,
  ionizacion: /Energ[ií]a (de )?ionizaci[oó]n/i,
  afinidad: /^Afinidad electrónica/,
  fusion: /^Punto de fusión/,
};

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // Sin inputs en la página: se espera a la hidratación CONFIRMADA de toda la página antes
  // del primer clic (esperarHidratacion necesita un input de testigo y aquí no hay ninguno).
  await esperarPaginaAsentada(page);
}

async function elegir(page: Page, nombre: RegExp): Promise<void> {
  const boton = page.getByRole('button', { name: nombre });
  await boton.click();
  // Testigo de que el clic llegó al estado de React, no solo al DOM.
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** La celda de un elemento de la tabla, por su nombre tal como lo escribe la app. */
function celda(page: Page, nombre: string): Locator {
  return page.locator(`[role="button"][aria-label^="${nombre},"]`);
}

/** La celda de un elemento por su número atómico (para los casos en que el nombre es el hallazgo). */
function celdaZ(page: Page, z: number): Locator {
  return page.locator(`[role="button"][aria-label*="Z=${z},"]`);
}

/** Cifra del aria-label, admitiendo coma o punto y signo menos o guion. null = «No disponible». */
function numeroDeEtiqueta(etiqueta: string): number | null {
  if (/No disponible/i.test(etiqueta)) return null;
  const m = etiqueta.match(/Z\s*=\s*\d+,\s*([−-]?\d+(?:[.,]\d+)?)/);
  if (!m) throw new Error(`aria-label sin cifra reconocible: «${etiqueta}»`);
  return Number(m[1].replace('−', '-').replace(',', '.'));
}

async function valorDe(page: Page, nombre: string): Promise<number | null> {
  const etiqueta = await celda(page, nombre).getAttribute('aria-label');
  if (etiqueta === null) throw new Error(`No hay celda para «${nombre}»`);
  return numeroDeEtiqueta(etiqueta);
}

async function valorNumerico(page: Page, nombre: string): Promise<number> {
  const v = await valorDe(page, nombre);
  if (v === null) throw new Error(`«${nombre}» sin dato en esta propiedad`);
  return v;
}

/** Los dos extremos de la leyenda de color, leídos como números. */
async function extremosLeyenda(page: Page): Promise<[number, number]> {
  const textos = await page.locator('[class*="leyendaLabels"] span').allInnerTexts();
  const n = textos.map((t) => {
    const m = t.match(/[−-]?\d+(?:[.,]\d+)?/);
    if (!m) throw new Error(`leyenda sin cifra: «${t}»`);
    return Number(m[0].replace('−', '-').replace(',', '.'));
  });
  return [n[0], n[1]];
}

/**
 * Contraste WCAG del texto de un elemento contra el fondo efectivo que tiene detrás,
 * componiendo la opacidad del propio texto y de sus antepasados.
 */
async function contraste(objetivo: Locator): Promise<number> {
  return objetivo.evaluate((el) => {
    type RGBA = { r: number; g: number; b: number; a: number };
    const leer = (s: string): RGBA | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lin = (c: number): number => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const lum = (c: RGBA): number => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const mezcla = (arriba: RGBA, abajo: RGBA, a: number): RGBA => ({
      r: arriba.r * a + abajo.r * (1 - a),
      g: arriba.g * a + abajo.g * (1 - a),
      b: arriba.b * a + abajo.b * (1 - a),
      a: 1,
    });
    const capas: RGBA[] = [];
    let e: Element | null = el;
    while (e) {
      const c = leer(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 0.99) break;
      }
      e = e.parentElement;
    }
    let fondo: RGBA = { r: 255, g: 255, b: 255, a: 1 };
    if (capas.length && capas[capas.length - 1].a >= 0.99) fondo = capas.pop() as RGBA;
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo, capas[i].a);
    const texto = leer(getComputedStyle(el).color) as RGBA;
    let opacidad = 1;
    let p: Element | null = el;
    while (p) {
      opacidad *= parseFloat(getComputedStyle(p).opacity);
      p = p.parentElement;
    }
    const efectivo = mezcla(texto, fondo, texto.a * opacidad);
    const a = lum(efectivo);
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe('Tendencias de la Tabla Periódica — escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // ─── CASO 1 · normal: la 1.ª energía de ionización contra el NIST ─────────────────────
  test('CASO 1 · 1.ª energía de ionización: doce elementos cuadran con el NIST ASD y se ven N > O y Be > B', async ({ page }) => {
    await elegir(page, BOTON.ionizacion);

    // NIST ASD (eV × 96,485 33), redondeado a la unidad: la app da enteros en kJ/mol.
    const NIST: Record<string, number> = {
      'Hidrógeno': 1312, // 13,598 434 6 eV → 1312,05
      'Helio': 2372, // 24,587 389 eV → 2372,32
      'Berilio': 900, // 9,322 699 eV → 899,50
      'Boro': 801, // 8,298 019 eV → 800,64
      'Carbono': 1086, // 11,260 288 eV → 1086,45
      'Nitrógeno': 1402, // 14,534 13 eV → 1402,33
      'Oxígeno': 1314, // 13,618 055 eV → 1313,94
      'Flúor': 1681, // 17,422 82 eV → 1681,05
      'Sodio': 496, // 5,139 077 eV → 495,85
      'Cloro': 1251, // 12,967 633 eV → 1251,19
      'Hierro': 762, // 7,902 468 eV → 762,47
      'Cesio': 376, // 3,893 906 eV → 375,70
    };
    for (const [nombre, esperado] of Object.entries(NIST)) {
      expect(Math.abs((await valorNumerico(page, nombre)) - esperado), nombre).toBeLessThan(1);
    }

    // Las excepciones que la app enseña (tabla educativa y «Errores frecuentes").
    expect(await valorNumerico(page, 'Nitrógeno')).toBeGreaterThan(await valorNumerico(page, 'Oxígeno'));
    expect(await valorNumerico(page, 'Berilio')).toBeGreaterThan(await valorNumerico(page, 'Boro'));

    // Extremos: He el más alto (2372) y Cs el más bajo (376), como dice la tabla educativa.
    expect(await extremosLeyenda(page)).toEqual([376, 2372]);
  });

  test('CASO 1b · electronegatividad (propiedad inicial): los valores de Pauling de Allred 1961', async ({ page }) => {
    // Es la propiedad con la que arranca la app.
    await expect(page.getByRole('button', { name: BOTON.electronegatividad })).toHaveAttribute('aria-pressed', 'true');

    const PAULING: Record<string, number> = {
      'Flúor': 3.98, 'Oxígeno': 3.44, 'Cloro': 3.16, 'Sodio': 0.93, 'Cesio': 0.79,
      'Hidrógeno': 2.2, 'Carbono': 2.55, 'Hierro': 1.83,
    };
    for (const [nombre, esperado] of Object.entries(PAULING)) {
      expect(await valorNumerico(page, nombre), nombre).toBeCloseTo(esperado, 2);
    }
    // Tendencia enseñada: crece hacia la derecha del período y hacia arriba del grupo.
    expect(await valorNumerico(page, 'Flúor')).toBeGreaterThan(await valorNumerico(page, 'Oxígeno'));
    expect(await valorNumerico(page, 'Flúor')).toBeGreaterThan(await valorNumerico(page, 'Cloro'));
    expect(await valorNumerico(page, 'Sodio')).toBeGreaterThan(await valorNumerico(page, 'Cesio'));
  });

  // ─── CASO 2 · límite: el extremo de la escala y los elementos SIN dato ──────────────
  test('CASO 2 · electronegatividad: F es el máximo, y gases nobles y superpesados salen sin dato, en gris y sin color de escala', async ({ page }) => {
    // Máximo F 3,98; mínimo Fr 0,7 (Pauling 1960, el valor que tabulan PubChem y el CRC).
    expect(await extremosLeyenda(page)).toEqual([0.7, 3.98]);

    for (const nombre of ['Helio', 'Neón', 'Argón', 'Rutherfordio', 'Oganesón']) {
      const c = celda(page, nombre);
      await expect(c, nombre).toHaveAttribute('aria-label', /No disponible/);
      await expect(c.locator('span').nth(2), nombre).toHaveText('—');
      // Gris neutro, no el azul del mínimo: un dato ausente no se pinta como un valor.
      await expect(c, nombre).toHaveCSS('background-color', 'rgb(212, 212, 212)');
    }

    await celda(page, 'Helio').hover();
    await expect(page.locator('[role="tooltip"]')).toContainText('Dato no disponible');
  });

  test('CASO 2b · radio atómico (Clementi 1967): crece al bajar en el grupo 1 y a la izquierda en el período 2', async ({ page }) => {
    await elegir(page, BOTON.radio);
    // Clementi, Raimondi y Reinhardt (1967), pm.
    const grupo1 = [['Litio', 167], ['Sodio', 190], ['Potasio', 243], ['Rubidio', 265], ['Cesio', 298]] as const;
    const periodo2 = [['Litio', 167], ['Berilio', 112], ['Boro', 87], ['Carbono', 67], ['Nitrógeno', 56], ['Oxígeno', 48], ['Flúor', 42]] as const;
    for (const [nombre, pm] of [...grupo1, ...periodo2]) {
      expect(await valorNumerico(page, nombre), nombre).toBe(pm);
    }
    // Mínimo He 31 pm (Clementi).
    expect((await extremosLeyenda(page))[0]).toBe(31);
  });

  // ─── Hallazgos abiertos ────────────────────────────────────────────────────────────
  test('HALLAZGO A · radio: el período 7 no puede salir más pequeño que el 4 en el mismo grupo', async ({ page }) => {
    // ABIERTO (25/09/2026): la serie mezcla el radio calculado de Clementi 1967 (Z 1-86) con el
    // de van der Waals (Fr, Ra, actínidos) y el covalente de Pyykkö-Atsumi 2009 (Z 104-118).
    // Grupo 4 en la app: Ti 176 · Zr 206 · Hf 208 · Rf 157 pm, contra la flecha «aumenta al
    // bajar en el grupo». En una sola serie (Pyykkö 2009): Ti 136 < Zr 154 ≈ Hf 152 < Rf 157.
    test.fail();
    await elegir(page, BOTON.radio);
    const rf = await valorNumerico(page, 'Rutherfordio');
    expect(rf).toBeGreaterThan(await valorNumerico(page, 'Titanio'));
    expect(rf).toBeGreaterThan(await valorNumerico(page, 'Hafnio'));
  });

  test('HALLAZGO B · cifras en formato español y la celda con la misma cifra que el tooltip', async ({ page }) => {
    // ABIERTO (25/09/2026): leyenda «0.7 (Pauling)» / «3.98 (Pauling)», tooltip «3.98» y la
    // celda del F con «4.0» (toFixed(1), page.tsx:345), que además contradice los 3,98 del
    // tooltip y del bloque educativo.
    test.fail();
    const leyenda = page.locator('[class*="leyendaLabels"]');
    await expect(leyenda).toContainText('3,98');
    await expect(leyenda).not.toContainText('3.98');

    await celda(page, 'Flúor').hover();
    await expect(page.locator('[role="tooltip"]')).toContainText('3,98');

    await expect(celda(page, 'Flúor').locator('span').nth(2)).toHaveText('3,98');
  });

  test('HALLAZGO C · nombres del 99 y el 110 según el DLE y el acuerdo de 2017', async ({ page }) => {
    // ABIERTO (25/09/2026): page.tsx:151 «Einsteinio» (DLE: einstenio) y page.tsx:163
    // «Darmstadtio» (acuerdo RAC-RAE-RSEQ-Fundéu 2017, punto 11, y DLE: darmstatio).
    test.fail();
    await expect(celdaZ(page, 99)).toHaveAttribute('aria-label', /^Einstenio,/);
    await expect(celdaZ(page, 110)).toHaveAttribute('aria-label', /^Darmstatio,/);
  });

  test('HALLAZGO D · el elemento 73 es «tántalo»', async ({ page }) => {
    // ABIERTO (25/09/2026): page.tsx:123 «Tantalio». El acuerdo de 2017 (punto 6) dice
    // «suprimir tantalio como variante de tántalo, único nombre que debe figurar para el
    // elemento de número atómico 73», y el DLE 23.8.1 no recoge «tantalio»: su «tántalo»
    // (1.ª acepción) es el elemento. Lo introdujo 5c7f919e (24/08/2026) creyendo lo contrario.
    test.fail();
    await expect(celdaZ(page, 73)).toHaveAttribute('aria-label', /^Tántalo,/);
  });

  test('HALLAZGO E · etiquetas: sin doble paréntesis, ordinal con punto, mayúsculas españolas y sin «noble» en el nitrógeno', async ({ page }) => {
    // ABIERTO (25/09/2026): botón «Electronegatividad ((Pauling))» (page.tsx:191 + :539),
    // «1ª» (page.tsx:200), tooltip «Metal De Transición» (text-transform: capitalize en
    // SimuladorTablaPeriodica.module.css:279) y el aria-label «0 (noble/metal d¹⁰)» para
    // N, Be, Mg, Mn y Hf (page.tsx:275).
    test.fail();
    for (const texto of await page.locator('[role="group"] button').allInnerTexts()) {
      expect(texto).not.toContain('((');
    }
    await expect(page.getByRole('button', { name: BOTON.ionizacion })).toContainText('1.ª');

    await celda(page, 'Hierro').hover();
    const categoria = page.locator('[class*="tooltipCategoria"]');
    await expect(categoria).toBeVisible();
    // innerText, no textContent: el «De» mayúsculo lo pone el CSS (text-transform), no el texto.
    expect(await categoria.innerText()).toBe('Metal de transición');

    await elegir(page, BOTON.afinidad);
    await expect(celda(page, 'Nitrógeno')).not.toHaveAttribute('aria-label', /noble/);
  });

  test('HALLAZGO F · punto de fusión: el texto no puede dar por máximo a otro elemento que la leyenda', async ({ page }) => {
    // ABIERTO (25/09/2026): con «Punto de fusión» la leyenda llega a 3550 °C (el carbono,
    // page.tsx:50), y la tabla educativa dice «He y H: Tf más bajas; W la más alta»
    // (page.tsx:663; W = 3422 °C). El truco de page.tsx:780 dice además «hierve» por «funde».
    test.fail();
    await elegir(page, BOTON.fusion);
    const [, maximo] = await extremosLeyenda(page); // hoy 3550 (C)
    const texto = (await page.locator('[class*="tablaComparativa"]').textContent()) ?? '';
    // O el máximo de la leyenda es el del W, o el texto deja de decir que el W es el máximo.
    if (maximo !== 3422) expect(texto).not.toContain('W la más alta');
    await expect(page.locator('[class*="tipsGrid"]')).not.toContainText('hierve');
  });

  test('HALLAZGO G · afinidad electrónica medida, no de relleno: Tm y At', async ({ page }) => {
    // ABIERTO (25/09/2026): los 14 lantánidos Ce-Lu llevan −50 kJ/mol y los actínidos Pu-Lr
    // −10, valores de relleno. Tm medido: 1,029(22) eV = 99(3) kJ/mol (Davis y Thompson 2001).
    // At medido: 2,415 78 eV = 233,09 kJ/mol (Leimbach et al. 2020); la app da −270,1.
    test.fail();
    await elegir(page, BOTON.afinidad);
    expect(Math.abs((await valorNumerico(page, 'Tulio')) - -99)).toBeLessThanOrEqual(5);
    expect(Math.abs((await valorNumerico(page, 'Astato')) - -233.1)).toBeLessThanOrEqual(5);
  });

  test('HALLAZGO H · contraste de las celdas: el símbolo del F sobre rojo llega a 4,5:1', async ({ page }) => {
    // ABIERTO (25/09/2026): colorTexto() (page.tsx:259-270) decide blanco/negro por una
    // luminancia aproximada con umbral 140, y el blanco sobre rgb(255,0,0) da 4,00:1 en un
    // símbolo de 16 px (no es texto grande); la cifra de 7,68 px a opacidad 0,85 da 3,08:1.
    // Con electronegatividad, 122 de 360 textos de celda quedan bajo 4,5:1 (259 con afinidad).
    test.fail();
    const f = celda(page, 'Flúor');
    expect(await contraste(f.locator('span').nth(1))).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(f.locator('span').nth(2))).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO I · en oscuro, el marcador de La/Ac se lee (4,5:1)', async ({ page }) => {
    // ABIERTO (25/09/2026): el marcador lleva color '#555' en línea (page.tsx:333), que gana a
    // la regla oscura (`color: #aaa`, SimuladorTablaPeriodica.module.css:535-538): #555 sobre
    // #3a3a3a = 1,40:1 en el «57» y 1,43:1 en el «La».
    test.fail();
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
    const marcador = page.locator('[aria-label="Lantano (ver fila inferior)"]');
    await expect(marcador).toHaveCSS('background-color', 'rgb(58, 58, 58)');
    expect(await contraste(marcador.locator('span').nth(0))).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(marcador.locator('span').nth(2))).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO J · teclado: el tooltip aparece junto a la celda y no se queda con el elemento anterior', async ({ page }) => {
    // ABIERTO (25/09/2026): Enter llama a onHover(elemento, 0, 0) (page.tsx:356), así que el
    // tooltip nace en (14, 14), en la esquina de la ventana; no hay onBlur ni Escape, y al
    // tabular a Neón sigue diciendo «Flúor». Espacio no hace nada en un role="button".
    test.fail();
    const f = celda(page, 'Flúor');
    await f.focus();
    await page.keyboard.press('Enter');
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toContainText('Flúor');
    const cajaCelda = await f.boundingBox();
    const cajaTooltip = await tooltip.boundingBox();
    if (!cajaCelda || !cajaTooltip) throw new Error('sin caja');
    // A menos de 300 px de la celda (hoy: celda en x≈1100, tooltip en x=14).
    expect(Math.abs(cajaTooltip.x - cajaCelda.x)).toBeLessThan(300);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^Neón,/);
    if (await tooltip.count()) await expect(tooltip).not.toContainText('Flúor');
  });

  test('HALLAZGO K · los botones de propiedad llegan a 4,5:1', async ({ page }) => {
    // ABIERTO (25/09/2026): texto var(--primary) sobre el fondo de la página, 3,93:1 en claro;
    // el activo, blanco sobre var(--primary), 4,11:1 en claro y 2,79:1 en oscuro (13,6 px).
    test.fail();
    expect(await contraste(page.getByRole('button', { name: BOTON.radio }))).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    // Los botones llevan `transition: background 0.18s, color 0.18s`: medir al terminar, o se
    // mide el color del tema claro a medio camino.
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
    expect(await contraste(page.getByRole('button', { name: BOTON.electronegatividad }))).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Tendencias de la Tabla Periódica — móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 2c · 360 px: la página no se desborda, la tabla se desplaza dentro de su caja y un toque muestra el dato', async ({ page }) => {
    await abrir(page);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: document.documentElement.clientWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);

    const caja = page.locator('[class*="tablaWrapper"]');
    await expect(caja).toHaveCSS('overflow-x', 'auto');
    const { ancho, visible } = await caja.evaluate((el) => ({ ancho: el.scrollWidth, visible: el.clientWidth }));
    expect(ancho).toBeGreaterThan(visible);

    // Sodio con electronegatividad (propiedad inicial): Pauling 0,93.
    const na = celda(page, 'Sodio');
    await na.scrollIntoViewIfNeeded();
    await na.tap();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toContainText('Sodio');
    await expect(tooltip).toContainText(/0[.,]93/);
  });
});

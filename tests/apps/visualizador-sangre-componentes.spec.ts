import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Inspector — visualizador-sangre-componentes (segmento interactiva, riesgo 2, 18 usos reales)
 *
 * Generado por /inspector el 25/09/2026. Primera inspección.
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Componentes de la Sangre»; subtítulo «Plasma, eritrocitos, leucocitos y plaquetas — tu
 *   sangre bajo el microscopio». La metadata: «Grupos sanguíneos ABO/Rh, cascada de coagulación y
 *   valores de un análisis», con la función «Tabla de compatibilidad donante-receptor ABO/Rh».
 *   No hay ningún input: la verdad comprobable es la cuadrícula 8 × 8 de compatibilidad y los
 *   datos que cita (proporciones, vidas medias, valores de referencia, fármacos).
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/visualizador-sangre-componentes/page.tsx, todo en el propio componente: COMPONENTES,
 *   GRUPOS (donaA / recibeDE), DISTRIBUCION_ESPANA, PASOS_COAGULACION, ANTICOAGULANTES,
 *   VALORES_ANALISIS y DATOS_FASCINANTES. Sin lib/ ni data/.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   Regla de compatibilidad de HEMATÍES en ABO/RhD: el donante es compatible si todos los
 *   antígenos de sus glóbulos rojos (A, B, D) los tiene también el receptor, porque el receptor
 *   tiene (o puede formar) anticuerpos contra los que no tiene. O = {}, A = {A}, B = {B},
 *   AB = {A, B}; «+» añade D. Con el orden de columnas O-, O+, A-, A+, B-, B+, AB-, AB+:
 *     O-  ✅✅✅✅✅✅✅✅   O+  ❌✅❌✅❌✅❌✅   A-  ❌❌✅✅❌❌✅✅   A+  ❌❌❌✅❌❌❌✅
 *     B-  ❌❌❌❌✅✅✅✅   B+  ❌❌❌❌❌✅❌✅   AB- ❌❌❌❌❌❌✅✅   AB+ ❌❌❌❌❌❌❌✅
 *   (27 compatibles de 64). Donante universal de hematíes O- y receptor universal AB+
 *   (NHS Blood and Transplant, «Universal blood components – the way of the future?»).
 *
 *   CASO 1 (normal — elegir un grupo y leer a quién dona y de quién recibe)
 *     A+ dona hematíes solo a A+ y AB+ (fila), y recibe de O-, O+, A- y A+ (columna). La
 *     cuadrícula entera debe ser la de arriba. Verificado: coincide celda a celda.
 *
 *   CASO 2 (límite — los extremos y el Rh negativo)
 *     O- en la fila: 8 ✅. AB+ en la columna: 8 ✅. O- como RECEPTOR solo recibe de O- (1 ✅), y
 *     un Rh- (A-) no recibe de ningún Rh+: su columna, solo O- y A-. AB+ como donante: solo a
 *     AB+. Verificado. Y en móvil (360 px) la cuadrícula cabe sin scroll horizontal. Verificado.
 *
 *   CASO 3 (lo que no debe ocurrir)
 *     a) Una combinación incompatible dada por buena: A+ → O-, O+ → O-, A+ → B+ deben ser ❌.
 *        Verificado: la cuadrícula no tiene ninguna.
 *     b) SOSPECHA DE PARTIDA (SOSPECHAS.md, 24/09/2026), CONFIRMADA: el destacado dice
 *        «O- → Donante universal · Sin antígenos A, B ni Rh. Compatible con TODOS los grupos» y
 *        «AB+ → Receptor universal · Puede recibir de TODOS», y la cuadrícula se titula
 *        «Compatibilidad donante → receptor» sin decir de qué componente. Vale para hematíes;
 *        para plasma es al revés: el plasma O lleva anti-A y anti-B (lo dice la tabla de la
 *        propia app), así que solo sirve a receptores O, y el donante universal de plasma es AB
 *        («Plasma group AB is therefore considered universal (as opposed to O negative for red
 *        cells)», NHS Blood and Transplant). La FAQ sí dice «donante universal de eritrocitos».
 *     c) Datos del análisis: la Hemoglobina sale como «12-16 g/dL» para «adultos», que es el
 *        rango de la mujer. OMS 2024 («Guideline on haemoglobin cutoffs to define anaemia»,
 *        ISBN 9789240088542): anemia en hombres de 15 años o más por debajo de 13 g/dL. Un hombre
 *        con 12,5 g/dL tiene anemia y la app lo deja dentro del rango normal (su propia FAQ da
 *        13,5-17,5 g/dL en hombres).
 *     d) Glucosa en ayunas: ADA, Standards of Care in Diabetes—2026, sección 2: normal < 100,
 *        prediabetes 100-125, diabetes ≥ 126 mg/dL. La app da «70-100» como normal y en la
 *        tarjeta «prediabetes (100-125) o diabetes (>126…)»: 126 no cae en ningún tramo.
 *     e) «Warfarina (Sintrom)»: Sintrom es ACENOCUMAROL (CIMA-AEMPS, n.º reg. 25670 y 58994);
 *        la warfarina en España es Aldocumar (n.º reg. 63062-63064).
 *     f) La aspirina en «Anticoagulantes: frenando la cascada»: es antiagregante plaquetario,
 *        ATC B01AC06 «Platelet aggregation inhibitors excl. heparin» (WHO ATC/DDD); no actúa
 *        sobre la cascada.
 *     g) «produce … 10.000 millones de leucocitos … cada día»: solo de neutrófilos la médula
 *        produce 5 × 10¹⁰–10 × 10¹⁰ al día (Summers et al., «Neutrophil kinetics in health and
 *        disease», Trends Immunol 2010;31:318).
 *     h) «España necesita unas 9.000 donaciones diarias»: Ministerio de Sanidad (nota del
 *        14/06/2026): 1.662.035 donaciones de sangre y componentes en 2025, ≈ 4.550 al día.
 *
 *   Los hallazgos 1964-1977 se repararon el 26/09/2026 y se les retiró el test.fail(). Donde el
 *   caso comprobaba además «lo que había» (la cifra o el texto defectuosos), esa línea se quitó:
 *   consagraba el defecto.
 */

const RUTA = '/visualizador-sangre-componentes/';
const GRUPOS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const;

// Resuelta a mano (cabecera): fila = donante, columna = receptor, en el orden de GRUPOS.
const MATRIZ_HEMATIES: Record<(typeof GRUPOS)[number], string> = {
  'O-': '✅✅✅✅✅✅✅✅',
  'O+': '❌✅❌✅❌✅❌✅',
  'A-': '❌❌✅✅❌❌✅✅',
  'A+': '❌❌❌✅❌❌❌✅',
  'B-': '❌❌❌❌✅✅✅✅',
  'B+': '❌❌❌❌❌✅❌✅',
  'AB-': '❌❌❌❌❌❌✅✅',
  'AB+': '❌❌❌❌❌❌❌✅',
};

/**
 * La app no tiene ningún input que sirva de testigo a `esperarHidratacion`. Se espera a que
 * React haya colgado sus props del primer botón de la navegación: hasta entonces un clic se pierde.
 */
async function irAlVisualizador(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Componentes de la Sangre', {
    timeout: 60_000,
  });
  await page.waitForFunction(
    () => {
      const b = document.querySelector('nav button');
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    undefined,
    { timeout: 15_000 },
  );
}

async function irASeccion(page: Page, titulo: string): Promise<void> {
  const boton = page.getByRole('button', { name: `Sección: ${titulo}` });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Las 8 filas de la cuadrícula (sin las cabeceras de fila, que también casan con «compatRow»). */
function filasCompat(page: Page): Locator {
  return page.locator('div[class*="compatRow"]:not([class*="compatRowHeader"])');
}

async function leerMatriz(page: Page): Promise<Record<string, string>> {
  const filas = await filasCompat(page).evaluateAll((els) =>
    els.map((f) => {
      const hijos = Array.from(f.children).map((c) => (c.textContent ?? '').trim());
      return [hijos[0], hijos.slice(1).join('')] as [string, string];
    }),
  );
  return Object.fromEntries(filas);
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 — normal: la cuadrícula de hematíes, y A+ leído por fila y por columna
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 1: la cuadrícula 8 × 8 coincide con la regla ABO/RhD de hematíes', async ({ page }) => {
  test.setTimeout(60_000);
  await irAlVisualizador(page);
  await irASeccion(page, 'Grupos sanguíneos');
  await expect(page.locator('[class*="compatColHeader"]')).toHaveText([...GRUPOS]);
  const matriz = await leerMatriz(page);
  expect(matriz).toEqual(MATRIZ_HEMATIES);
  // 27 compatibles de 64 (8 + 4 + 4 + 2 + 4 + 2 + 2 + 1).
  expect(Object.values(matriz).join('').match(/✅/g)?.length).toBe(27);
});

test('CASO 1: A+ dona a A+ y AB+, y recibe de O-, O+, A- y A+', async ({ page }) => {
  test.setTimeout(60_000);
  await irAlVisualizador(page);
  await irASeccion(page, 'Grupos sanguíneos');
  const matriz = await leerMatriz(page);
  const donaA = GRUPOS.filter((_, j) => Array.from(matriz['A+'])[j] === '✅');
  expect(donaA).toEqual(['A+', 'AB+']);
  const indiceAmas = GRUPOS.indexOf('A+');
  const recibeDe = GRUPOS.filter((g) => Array.from(matriz[g])[indiceAmas] === '✅');
  expect(recibeDe).toEqual(['O-', 'O+', 'A-', 'A+']);
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 — límite: O- y AB+, Rh negativo, y móvil de 360 px
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 2: los extremos O- y AB+, y un Rh- no recibe de ningún Rh+', async ({ page }) => {
  test.setTimeout(60_000);
  await irAlVisualizador(page);
  await irASeccion(page, 'Grupos sanguíneos');
  const matriz = await leerMatriz(page);
  const columna = (receptor: (typeof GRUPOS)[number]) =>
    GRUPOS.filter((g) => Array.from(matriz[g])[GRUPOS.indexOf(receptor)] === '✅');
  expect(matriz['O-']).toBe('✅'.repeat(8)); // O- dona a los 8
  expect(columna('AB+')).toEqual([...GRUPOS]); // AB+ recibe de los 8
  expect(columna('O-')).toEqual(['O-']); // O- solo recibe de O-
  expect(columna('A-')).toEqual(['O-', 'A-']); // Rh-: ningún donante Rh+
  expect(matriz['AB+']).toBe('❌'.repeat(7) + '✅'); // AB+ solo dona a AB+
});

test.describe('CASO 2 · móvil de 360 px', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('la cuadrícula cabe entera sin scroll horizontal de la página', async ({ page }) => {
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Grupos sanguíneos');
    const medida = await page.evaluate(() => {
      const rejilla = document.querySelector('[class*="compatGrid"]') as HTMLElement;
      return {
        pagina: document.documentElement.scrollWidth,
        ventana: window.innerWidth,
        derechaRejilla: rejilla.getBoundingClientRect().right,
      };
    });
    expect(medida.pagina).toBeLessThanOrEqual(medida.ventana);
    expect(medida.derechaRejilla).toBeLessThanOrEqual(medida.ventana);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 — lo que no debe ocurrir
// ─────────────────────────────────────────────────────────────────────────────

test('CASO 3a: ninguna combinación incompatible sale como compatible', async ({ page }) => {
  test.setTimeout(60_000);
  await irAlVisualizador(page);
  await irASeccion(page, 'Grupos sanguíneos');
  const celda = (donante: string, receptor: string) =>
    page.locator(`[class*="compatCell"][aria-label^="${donante} dona a ${receptor}:"]`);
  await expect(celda('A+', 'O-')).toHaveText('❌');
  await expect(celda('O+', 'O-')).toHaveText('❌');
  await expect(celda('A+', 'B+')).toHaveText('❌');
  await expect(celda('AB-', 'A-')).toHaveText('❌');
});

test.describe('CASO 3 · hallazgos de contenido (reparados el 26/09/2026)', () => {
  test('b) «donante universal» sin decir que es de hematíes (sospecha confirmada)', async ({ page }) => {
    // HALLAZGO 1964 (reparado): los destacados, el dato «O- es oro líquido» y el título de la
    // cuadrícula no decían que valen para hematíes. Para plasma el donante universal es AB y el
    // plasma O solo sirve a receptores O (NHS Blood and Transplant).
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Grupos sanguíneos');
    const destacadoO = page.locator('[class*="destacadoCard"]').filter({ hasText: 'Donante universal' });
    await expect(destacadoO).toContainText(/hemat|glóbulos rojos|eritrocitos/i);
    await expect(page.getByRole('heading', { name: /Compatibilidad/ })).toContainText(/hemat|glóbulos rojos|eritrocitos/i);
    // Y el plasma, dicho al revés: AB es el donante universal de plasma.
    await expect(page.getByText('Con el plasma es al revés.')).toBeVisible();
    await expect(page.locator('[class*="insight"]').filter({ hasText: 'plasma' }).first()).toContainText('donante universal de plasma es el AB');
  });

  test('c) la hemoglobina de referencia distingue hombres y mujeres', async ({ page }) => {
    // HALLAZGO 1965 (reparado): «12-16 g/dL» era el rango de la mujer; OMS 2024: anemia en
    // hombres por debajo de 13 g/dL. Un hombre con Hb 12,5 g/dL ya no cae dentro de la
    // referencia: la de hombres empieza en 13. Lo mismo para hematocrito y eritrocitos.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Datos y análisis');
    const filas = page.locator('table[class*="tablaValores"] tbody tr');
    const hb = filas.filter({ hasText: 'Hemoglobina' }).locator('td').nth(1);
    await expect(hb).toContainText('Mujeres: 12 g/dL o más');
    await expect(hb).toContainText('Hombres: 13 g/dL o más');
    await expect(hb).toContainText('OMS');
    for (const parametro of ['Hematocrito', 'Eritrocitos']) {
      // Se filtra por la PRIMERA celda: «eritrocitos» sale también en «Qué mide» de otras filas.
      const fila = filas.filter({ has: page.locator('td:first-child', { hasText: parametro }) });
      await expect(fila).toContainText(/Mujeres.*Hombres/);
    }
  });

  test('d) glucosa en ayunas de 126 mg/dL cae en el tramo de diabetes', async ({ page }) => {
    // HALLAZGO 1969 (reparado): ADA 2026, diabetes ≥ 126 mg/dL y prediabetes 100-125. Decía
    // «diabetes (>126 …)», y 126 no caía en ningún tramo; la tabla daba «70-100» como normal.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Datos y análisis');
    const tarjeta = page.locator('[class*="condicionCard"]').filter({ hasText: 'Hiperglucemia' });
    await expect(tarjeta).not.toContainText('>126');
    await expect(tarjeta).toContainText(/≥\s?126|126 o más|126 mg\/dL o más/);
    const fila = page.locator('table[class*="tablaValores"] tbody tr').filter({ hasText: 'Glucosa' });
    await expect(fila.locator('td').nth(1)).toContainText('70-99 mg/dL');
  });

  test('e) Sintrom es acenocumarol, no warfarina', async ({ page }) => {
    // HALLAZGO 1966 (reparado): CIMA-AEMPS, SINTROM 1 mg y 4 mg, principio activo
    // acenocumarol; la warfarina es ALDOCUMAR. Ponía «Warfarina (Sintrom)».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Coagulación');
    const tarjeta = page.locator('[class*="anticoagCard"]').filter({ hasText: 'Sintrom' });
    await expect(tarjeta).toContainText(/acenocumarol \(Sintrom\)/i);
    await expect(tarjeta).toContainText(/warfarina \(Aldocumar\)/i);
    await expect(page.getByText('Warfarina (Sintrom)')).toHaveCount(0);
  });

  test('f) la aspirina no se presenta como anticoagulante de la cascada', async ({ page }) => {
    // HALLAZGO 1970 (reparado): ATC B01AC06 «Platelet aggregation inhibitors excl. heparin».
    // La aspirina estaba bajo «Anticoagulantes: frenando la cascada»; ahora tiene su propio
    // bloque de antiagregantes, y el de anticoagulantes ya no la incluye.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Coagulación');
    const tarjeta = page.locator('[class*="anticoagCard"]').filter({ hasText: /aspirina/i });
    await expect(tarjeta).toContainText(/antiagregante/i);
    const bloqueAnticoag = page
      .getByRole('heading', { name: 'Anticoagulantes: frenando la cascada' })
      .locator('xpath=following-sibling::div[1]');
    await expect(bloqueAnticoag).not.toContainText(/aspirina/i);
    await expect(page.getByRole('heading', { name: /Antiagregantes/ })).toBeVisible();
  });

  test('g) la médula produce más de 50.000 millones de leucocitos al día', async ({ page }) => {
    // HALLAZGO 1971 (reparado): Summers et al. 2010, solo de neutrófilos 5 × 10¹⁰ a 10 × 10¹⁰
    // al día. Decía «10.000 millones de leucocitos»; ahora da el intervalo de neutrófilos.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Datos y análisis');
    const texto = await page.locator('[class*="insight"]').last().innerText();
    const m = texto.match(/entre ([\d.]+) y ([\d.]+) millones de neutrófilos/);
    expect(m, texto).not.toBeNull();
    const desde = Number((m?.[1] ?? '0').replace(/\./g, ''));
    expect(desde).toBeGreaterThanOrEqual(50000);
    expect(texto).not.toContain('10.000 millones de leucocitos');
  });

  test('h) las donaciones diarias en España rondan 4.550, no 9.000', async ({ page }) => {
    // HALLAZGO 1972 (reparado): Ministerio de Sanidad, nota del 14/06/2026: 1.662.035
    // donaciones en 2025 → 1.662.035 / 365 ≈ 4.553 al día. Decía «unas 9.000 diarias».
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const parrafo = page.locator('[class*="guideSection"] p').filter({ hasText: 'donaciones de sangre y componentes' });
    await expect(parrafo).toContainText('1.662.035');
    await expect(parrafo).toContainText('unas 4550 al día'); // 4 cifras: sin punto (RAE, §2)
    await expect(page.locator('[class*="guideSection"]')).not.toContainText('9.000');
  });

  test('i) un recuento de células no lleva decimales', async ({ page }) => {
    // HALLAZGO 1973 (reparado): formatNumber() con su valor por defecto de 2 decimales daba
    // «11.000,00», «150.000,00» y «200.000,00 millones». Ahora se le pasan 0 decimales.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Datos y análisis');
    await expect(page.locator('[class*="condicionCard"]').filter({ hasText: 'Leucocitosis' })).toContainText('por encima de 11.000');
    await expect(page.locator('[class*="condicionesGrid"]')).not.toContainText(',00');
    await expect(page.locator('[class*="insight"]').last()).not.toContainText(',00');
  });

  test('j) el porcentaje va separado con espacio duro', async ({ page }) => {
    // HALLAZGO 1974 (reparado): regla del CLAUDE.md global §2 (25/09/2026): «15 %» con U+00A0.
    // El hematocrito ya no es «36-48 %» (hallazgo 1965: va por sexo), así que se mira su
    // porcentaje nuevo, y además que no quede ningún «%» pegado ni con espacio normal.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const pctPlasma = await page.locator('span[class*="componentePct"]').first().textContent();
    expect(pctPlasma).toBe('55\u00a0%');
    const pegados = async () =>
      // innerText: solo el texto visible (textContent traería también los <script> de Next).
      page.evaluate(() => document.body.innerText.match(/\d[ ]?%/g) ?? []);
    expect(await pegados()).toEqual([]);
    await irASeccion(page, 'Datos y análisis');
    const hto = await page.locator('table[class*="tablaValores"] tbody tr').filter({ hasText: 'Hematocrito' }).locator('td').nth(1).textContent();
    expect(hto).toContain('37\u00a0%');
    expect(await pegados()).toEqual([]);
  });

  test('k) riesgo 2: aviso sanitario visible y no colapsable sin desplegar nada', async ({ page }) => {
    // HALLAZGO 1967 (reparado): la app iba `// @disclaimer: exempt` en la suite salud.
    // _private/DISCLAIMER-POLICY.md: salud → nivel 2, DisclaimerCard severity="high" no
    // colapsable (precedente: hallazgo 1358 de visualizador-ciclo-viral).
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const aviso = page.locator('[class*="disclaimerCard"]').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('profesional sanitario');
    // No colapsable: no hay botón que lo pliegue.
    await expect(aviso.locator('button[aria-expanded]')).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Accesibilidad y presentación
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Accesibilidad y presentación', () => {
  test('l) contraste ≥ 4,5:1 del texto propio de la app, en claro y en oscuro', async ({ page }) => {
    // HALLAZGO 1968 (reparado). Medido con getComputedStyle sobre el fondo real (25/09/2026), claro/oscuro:
    //   «55%» #f0c040 sobre blanco 1,70 · «<1%» #95a5a6 2,56 · «<1%» #e67e22 2,85 · «~45%» #e74c3c
    //   3,82/3,76 (page.tsx:360, color en línea) · «Paso N» blanco sobre el color del paso
    //   2,19-4,11 (:574) · % de leucocitos y de la distribución, y nombres de los fármacos, en
    //   #2E86AB 4,11/3,50 (.barraPct, .distPct, .anticoagNombre) · pestaña activa y grupo
    //   activo blanco sobre #2E86AB 4,11 · títulos de los avisos rojos #e74c3c 3,40/4,31.
    // ESPERADO ninguno por debajo de 4,5. Reparado con --primary-texto / --primary-boton, el
    // porcentaje de las tarjetas en --text-primary y los avisos en --rojo-texto.
    test.setTimeout(90_000);
    await irAlVisualizador(page);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important}' });
    const medir = (loc: Locator) =>
      loc.evaluateAll((els) => {
        const canal = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const rgba = (s: string) => {
          const m = (s.match(/[\d.]+/g) ?? []).map(Number);
          return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
        };
        const lum = (c: { r: number; g: number; b: number }) =>
          0.2126 * canal(c.r) + 0.7152 * canal(c.g) + 0.0722 * canal(c.b);
        const fondo = (el: Element) => {
          const capas: { r: number; g: number; b: number; a: number }[] = [];
          let n: Element | null = el;
          while (n) {
            const c = rgba(getComputedStyle(n).backgroundColor);
            if (c.a > 0) capas.push(c);
            if (c.a >= 1) break;
            n = n.parentElement;
          }
          let base = { r: 255, g: 255, b: 255, a: 1 };
          for (let i = capas.length - 1; i >= 0; i--) {
            const c = capas[i];
            base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a), a: 1 };
          }
          return base;
        };
        return els.map((el) => {
          const l1 = lum(rgba(getComputedStyle(el).color));
          const l2 = lum(fondo(el));
          return { texto: (el.textContent ?? '').trim(), ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) };
        });
      });
    const bajos: string[] = [];
    for (const tema of ['light', 'dark']) {
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, tema);
      await irASeccion(page, 'Composición');
      for (const m of await medir(page.locator('span[class*="componentePct"], span[class*="barraPct"], [class*="navActivo"] [class*="navTexto"]')))
        if (m.ratio < 4.5) bajos.push(`${tema} «${m.texto}» ${m.ratio.toFixed(2)}`);
      await irASeccion(page, 'Grupos sanguíneos');
      await page.getByRole('button', { name: 'O-', exact: true }).click();
      await page.mouse.move(0, 0);
      for (const m of await medir(page.locator('span[class*="distPct"], [class*="grupoBtnActivo"], [class*="warningBox"] strong')))
        if (m.ratio < 4.5) bajos.push(`${tema} «${m.texto}» ${m.ratio.toFixed(2)}`);
      await irASeccion(page, 'Coagulación');
      for (let i = 0; i < 7; i++) {
        for (const m of await medir(page.locator('span[class*="pasoNumero"]')))
          if (m.ratio < 4.5) bajos.push(`${tema} «${m.texto}» ${m.ratio.toFixed(2)}`);
        if (i < 6) await page.getByRole('button', { name: 'Paso siguiente' }).click();
      }
      for (const m of await medir(page.locator('[class*="anticoagNombre"], [class*="warningBox"] strong')))
        if (m.ratio < 4.5) bajos.push(`${tema} «${m.texto}» ${m.ratio.toFixed(2)}`);
    }
    expect(bajos).toEqual([]);
  });

  test('m) las capas del tubo y los pasos de la cascada responden a Enter', async ({ page }) => {
    // HALLAZGO 1975 (reparado): <rect>/<circle> con role="button" y tabIndex={0} pero sin
    // onKeyDown: se enfocaban con Tab y Enter no hacía nada.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const tarjetaPlasma = page.locator('button[class*="componenteCard"]').first();
    await page.locator('rect[role="button"][aria-label^="Plasma"]').focus();
    await page.keyboard.press('Enter');
    await expect(tarjetaPlasma).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(tarjetaPlasma).toHaveAttribute('aria-expanded', 'false');
    // El círculo del paso 4 + Enter lleva a «4 / 7».
    await irASeccion(page, 'Coagulación');
    await page.locator('circle[role="button"][aria-label^="Paso 4"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="pasoIndicador"]')).toHaveText('4 / 7');
  });

  test('n) la cuadrícula de compatibilidad se expone como tabla', async ({ page }) => {
    // HALLAZGO 1976 (reparado): <div>s sin role, que el árbol de accesibilidad daba como UN
    // solo texto. Ahora son una tabla ARIA con cabeceras de fila (donante) y columna (receptor).
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    await irASeccion(page, 'Grupos sanguíneos');
    const snap = await page.locator('[class*="compatGrid"]').ariaSnapshot();
    // La raíz sale entre comillas simples porque su nombre lleva «:» («- 'table "…"':»).
    expect(snap).toMatch(/^- '?(table|grid)\b/);
    const tabla = page.getByRole('table', { name: /Compatibilidad de glóbulos rojos/ });
    await expect(tabla.getByRole('row')).toHaveCount(9);
    await expect(tabla.getByRole('rowheader', { name: 'Donante A+' })).toBeVisible();
    await expect(tabla.getByRole('cell', { name: 'O- dona a A+: sí' })).toBeVisible();
  });

  test('ñ) la etiqueta «Buffy coat <1%» cabe dentro del dibujo del tubo', async ({ page }) => {
    // HALLAZGO 1977 (reparado): el <text> empezaba en x = 168 de un viewBox de 200 de ancho y
    // medía ~54, así que el SVG recortaba «<1 %». Ahora va en dos líneas desde x = 153.
    test.setTimeout(60_000);
    await irAlVisualizador(page);
    const medida = await page
      .locator('svg[class*="tuboSvg"] text', { hasText: 'Buffy' })
      .evaluate((t) => {
        const texto = t as SVGTextElement;
        const caja = texto.getBBox();
        return { fin: caja.x + caja.width, ancho: (texto.ownerSVGElement as SVGSVGElement).viewBox.baseVal.width };
      });
    expect(medida.fin).toBeLessThanOrEqual(medida.ancho);
  });
});

import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Huesos del Cuerpo Humano — regresión del DATO y de la operativa, no de la carga.
 * Primera inspección: 18/11/2026.
 *
 * QUÉ PROMETE
 *   · <h1> «Huesos del Cuerpo Humano»; subtítulo «Explora los {getTotalBones()} huesos del
 *     esqueleto humano adulto».
 *   · metadata, og, FAQPage y features del JSON-LD: «los 206 huesos», «Catálogo de los 206
 *     huesos… con nombre en latín», «Buscador por nombre, función o articulación entre los 206».
 *   · La guía: axial 80 (cráneo 22 = 8 + 14 de la cara, oído 6, hioides 1, columna 26,
 *     tórax 25) + apendicular 126 (cintura escapular 4, extremidades superiores 60 «30 por
 *     lado», cintura pélvica 2, extremidades inferiores 60 «30 por lado») = 206.
 *
 * DÓNDE VIVE EL DATO — data/bones.ts: 47 entradas; `cantidad` suma los huesos de cada una y
 * `getTotalBones()` las suma todas. La app no importa nada de data/fiscal ni de lib/calculadoras.
 *
 * DE DÓNDE SALEN LOS ESPERADOS — no hay fuente anatómica en la lista de dominios que puede leer
 * la tarea, así que cada esperado se ancla en lo que la PROPIA APP declara en otro sitio:
 *   · la tarjeta «Huesos del tarso» (×14) dice «7 por pie: astrágalo, calcáneo, navicular,
 *     cuboides, y 3 cuneiformes»; la de «Huesos del carpo» (×16), «8 huesos por mano: escafoides,
 *     semilunar, piramidal, pisiforme, trapecio, trapezoide, grande y ganchoso»;
 *   · la guía da las cifras por región de arriba, y en su paso 5 «¿Con qué huesos se articula el
 *     fémur? Respuesta: coxal (cadera), tibia y rótula»;
 *   · la FAQ visible: «7+12+5+1+1 = 26 huesos» de la columna.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (sumando `cantidad` en data/bones.ts)
 *   CASO 1 (normal) — filtros por región:
 *       Columna 1+1+5+12+5+1+1 = 26 · Tórax 1+14+6+4 = 25 · Cintura escapular 2+2 = 4 ·
 *       Extremidad superior 2+2+2+16+10+28 = 60 · Cintura pélvica 2. Cuadran con la guía.
 *       Extremidad inferior: la guía dice 60 (30 por lado: fémur, rótula, tibia, peroné, 7 del
 *       tarso, 5 metatarsianos, 14 falanges). El dataset suma 2+2+2+2+14+2+2+10+28 = 64, porque
 *       el astrágalo y el calcáneo van dentro de «Huesos del tarso» ×14 Y en su tarjeta propia ×2.
 *       Total esperado 206 (la propia app: 80 + 126); el dataset da 206 + 4 = 210.
 *   CASO 2 (límite) — los extremos de la ficha:
 *       «Corto» = carpo 16 + tarso 14 → «2 entradas (30 huesos)». «Sesamoideo» = solo la rótula ×2.
 *       Fémur: Extremidad inferior · Largo · par · articula con coxal, tibia y rótula.
 *       Vértebras cervicales C3-C7 (×5): son 5 vértebras de la línea media, como el atlas, que la
 *       app da como «Impar (1)»; la ficha no puede decir «Par (5)», y la regla del código
 *       (`cantidad === 1 ? 'Impar' : 'Par'`) lo dice.
 *   CASO 3 (operativa) — el buscador, el teclado y el móvil:
 *       «Rótula» → Fémur (la articula) y Rótula = 2 entradas, 4 huesos. «rotula», «humero»,
 *       «perone», «esternon» (sin tilde, como se teclea en el móvil) deberían dar su tarjeta.
 *       «pisiforme», «ganchoso», «cuneiforme» (huesos que la propia app enumera) deberían
 *       llevar a «Huesos del carpo» / «Huesos del tarso». «zzzz» → «No se encontraron huesos…» y
 *       «Mostrar todos los huesos» vuelve a las 47 entradas. Tab tras el último filtro debería
 *       llegar a una tarjeta y Enter abrirla. A 390 px, la página no desborda y la fila de
 *       regiones se desplaza en horizontal.
 *
 * LO QUE ESTÁ SANO (18/11/2026): las cinco regiones del caso 1 que cuadran, los filtros de tipo,
 * la búsqueda con tilde, la búsqueda vacía con su botón de restablecer, abrir y cerrar una
 * ficha con el ratón y el móvil a 390 px. Sin errores de consola.
 *
 * Los casos «ABIERTO, hallazgo (inspector 18/11/2026)» llevan test.fail(): afirman lo que
 * DEBERÍA pasar y hoy no pasa. Al reparar cada uno se quita su test.fail() y queda de candado.
 */

const BUSCADOR = 'input[placeholder^="Buscar por nombre"]';

test.beforeEach(async ({ page }) => {
  await page.goto('/huesos-cuerpo-humano/');
  // El buscador es el testigo de hidratación: un clic en un filtro antes de que React monte
  // se perdería igual que un fill().
  await esperarHidratacion(page, [BUSCADOR]);
});

/** El contador de resultados («9 entradas (64 huesos)»), acotado a la app y no al anunciador de Next. */
function contador(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: /entrada/ });
}

async function filtrarRegion(page: Page, region: RegExp): Promise<void> {
  await page.getByRole('group', { name: 'Región:' }).getByRole('button', { name: region }).click();
}

async function filtrarTipo(page: Page, tipo: string): Promise<void> {
  await page.getByRole('group', { name: 'Tipo de hueso:' }).getByRole('button', { name: tipo }).click();
}

async function buscar(page: Page, termino: string): Promise<void> {
  await page.fill(BUSCADOR, termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

/** Los nombres de las tarjetas visibles, en su orden. */
function nombresTarjetas(page: Page): Locator {
  return page.locator('article h3');
}

/** La tarjeta de un hueso, por el texto exacto de su <h3>. */
function tarjeta(page: Page, nombre: string): Locator {
  return page.locator('article').filter({ has: page.getByRole('heading', { level: 3, name: nombre, exact: true }) });
}

/** Abre la ficha de un hueso con un clic en su título y la devuelve. */
async function abrirFicha(page: Page, nombre: string): Promise<Locator> {
  const t = tarjeta(page, nombre);
  await t.getByRole('heading', { level: 3 }).click();
  await expect(t).toContainText('Información completa');
  return t;
}

/** El valor de una propiedad de la ficha abierta («Cantidad» → «Par (2)»). */
function propiedad(ficha: Locator, rotulo: string): Locator {
  return ficha.locator('span', { hasText: new RegExp(`^${rotulo}$`) }).locator('xpath=following-sibling::span[1]');
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 — Recuentos por región
// ═══════════════════════════════════════════════════════════════════════════

test('las regiones que la guía cuenta igual que el dataset dan su cifra', async ({ page }) => {
  // Columna: atlas 1 + axis 1 + C3-C7 5 + T1-T12 12 + L1-L5 5 + sacro 1 + cóccix 1 = 26,
  // el «7+12+5+1+1 = 26» de la FAQ visible.
  await filtrarRegion(page, /Columna vertebral/);
  await expect(contador(page)).toHaveText('7 entradas (26 huesos)');
  // Tórax: esternón 1 + 14 verdaderas + 6 falsas + 4 flotantes = 25 («24 costillas + 1 esternón»).
  await filtrarRegion(page, /Tórax/);
  await expect(contador(page)).toHaveText('4 entradas (25 huesos)');
  // Cintura escapular: 2 clavículas + 2 escápulas = 4.
  await filtrarRegion(page, /Cintura escapular/);
  await expect(contador(page)).toHaveText('2 entradas (4 huesos)');
  // Extremidad superior: húmero 2 + radio 2 + cúbito 2 + carpo 16 + metacarpo 10 + falanges 28
  // = 60, los «30 por lado» de la guía.
  await filtrarRegion(page, /Extremidad superior/);
  await expect(contador(page)).toHaveText('6 entradas (60 huesos)');
  // Cintura pélvica: los dos coxales.
  await filtrarRegion(page, /Cintura pélvica/);
  await expect(contador(page)).toHaveText('1 entrada (2 huesos)');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · el esqueleto adulto suma 206: el astrágalo y el calcáneo no se cuentan dos veces', async ({ page }) => {
  // Daba: subtítulo «Explora los 210 huesos…», contador «Mostrando 47 entradas (210 huesos en
  // total)», guía «tiene 210 huesos» y «Extremidad inferior» → «9 entradas (64 huesos)». La
  // tarjeta del tarso incluía el astrágalo y el calcáneo en sus 14, y además tenían tarjeta propia
  // de 2 cada uno. Ahora el tarso cuenta los otros 5 por pie (×10): 2+2+2+2+10+2+2+10+28 = 60.
  await expect(page.locator('header p').first()).toHaveText('Explora los 206 huesos del esqueleto humano adulto');
  await expect(contador(page)).toContainText('(206 huesos en total)');
  await filtrarRegion(page, /Extremidad inferior/);
  await expect(contador(page)).toContainText('(60 huesos)');
  await abrirGuia(page);
  await expect(page.getByText(/El esqueleto humano adulto tiene/)).toContainText('tiene 206 huesos');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · filtrar «Cráneo» muestra los huesos que dice el escenario de aula', async ({ page }) => {
  // El escenario «Docente de Biología» decía: «Proyectar en clase el atlas filtrado por "Cráneo"
  // → mostrar los 22 huesos». El filtro daba «9 entradas (14 huesos)»: los 8 del neurocráneo más
  // los 6 huesecillos del oído; los 14 de la cara estaban en «Cara», que con el hioides sumaba 15.
  // Ahora las regiones siguen la cuenta de la guía (oído medio y cuello aparte) y el escenario
  // dice 8 en «Cráneo» y los 14 restantes en «Cara».
  await abrirGuia(page);
  const escenario = await page.locator('code', { hasText: 'Cráneo' }).first().innerText();
  const prometidos = /los (\d+) huesos/.exec(escenario)?.[1];
  expect(prometidos).toBe('8');
  await filtrarRegion(page, /^Cráneo/);
  if (prometidos) await expect(contador(page)).toContainText(`(${prometidos} huesos)`);
  // Neurocráneo: frontal 1 + parietales 2 + temporales 2 + occipital 1 + esfenoides 1 + etmoides 1
  await expect(contador(page)).toHaveText('6 entradas (8 huesos)');
  // Cara: maxilares 2 + mandíbula 1 + nasales 2 + lagrimales 2 + cigomáticos 2 + palatinos 2 +
  // vómer 1 + cornetes inferiores 2 = 14 («14 de la cara»)
  await filtrarRegion(page, /^Cara/);
  await expect(contador(page)).toHaveText('8 entradas (14 huesos)');
  // Oído medio: martillo, yunque y estribo, ×2 = 6; cuello: el hioides
  await filtrarRegion(page, /^Oído medio/);
  await expect(contador(page)).toHaveText('3 entradas (6 huesos)');
  await filtrarRegion(page, /^Cuello/);
  // (singular: con la región «Cuello» es la primera vez que el contador cuenta un solo hueso)
  await expect(contador(page)).toHaveText('1 entrada (1 hueso)');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 — Los extremos de la ficha
// ═══════════════════════════════════════════════════════════════════════════

test('el filtro de tipo da los cortos y el único sesamoideo', async ({ page }) => {
  // Cortos: carpo 8 × 2 + tarso 5 × 2 = 26, en dos entradas (las tarjetas los agrupan). Hasta el
  // 18/11/2026 el tarso contaba 7 × 2 y daba 30, con el astrágalo y el calcáneo contados también
  // en sus fichas propias (hallazgo 4999); esas dos van en «Irregular».
  await filtrarTipo(page, 'Corto');
  await expect(contador(page)).toHaveText('2 entradas (26 huesos)');
  await expect(nombresTarjetas(page)).toHaveText(['Huesos del carpo', 'Huesos del tarso']);
  // Sesamoideo: la rótula, «el más grande» según la guía, y ninguno más en el dataset.
  await filtrarTipo(page, 'Sesamoideo');
  await expect(contador(page)).toHaveText('1 entrada (2 huesos)');
  await expect(nombresTarjetas(page)).toHaveText(['Rótula']);
});

test('la ficha del fémur da su región, su tipo y las tres articulaciones de la guía', async ({ page }) => {
  const ficha = await abrirFicha(page, 'Fémur');
  await expect(propiedad(ficha, 'Región')).toHaveText('Extremidad inferior');
  await expect(propiedad(ficha, 'Tipo')).toHaveText('Largo');
  await expect(propiedad(ficha, 'Cantidad')).toHaveText('Par (2)');
  await expect(propiedad(ficha, 'Nombre latino')).toHaveText('Femur');
  // Paso 5 de la guía: «coxal (cadera), tibia y rótula».
  await expect(ficha).toContainText('Coxal (cadera)');
  await expect(ficha).toContainText('Tibia');
  await expect(ficha).toContainText('Rótula');
  // Un segundo clic la cierra.
  await ficha.getByRole('heading', { level: 3 }).click();
  await expect(ficha).not.toContainText('Información completa');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · las vértebras no salen como hueso «Par»', async ({ page }) => {
  // Daba: C3-C7 «Par (5)», T1-T12 «Par (12)», L1-L5 «Par (5)». El atlas, la misma clase de hueso
  // de la línea media, sale «Impar (1)»; y 5 no es un par. El código ponía «Par» a todo lo que
  // tuviera cantidad > 1.
  for (const [nombre, n] of [['Vértebras cervicales (C3-C7)', 5], ['Vértebras torácicas (T1-T12)', 12], ['Vértebras lumbares (L1-L5)', 5]] as const) {
    const ficha = await abrirFicha(page, nombre);
    await expect(propiedad(ficha, 'Cantidad'), nombre).not.toHaveText(/^Par\b/);
    await expect(propiedad(ficha, 'Cantidad'), nombre).toHaveText(`Impar (${n} vértebras)`);
  }
});

test('REPARADO, hallazgo (inspector 18/11/2026) · el esfenoides lista al cigomático, como el cigomático lista al esfenoides', async ({ page }) => {
  // La tarjeta del cigomático: «Frontal, Temporal, Maxilar, Esfenoides». La del esfenoides decía
  // «Todos los huesos del cráneo, Vómer, Palatinos», y el cigomático está en la región «Cara».
  const cigomatico = await abrirFicha(page, 'Cigomático');
  await expect(cigomatico).toContainText('Esfenoides');
  const esfenoides = await abrirFicha(page, 'Esfenoides');
  await expect(esfenoides).toContainText(/Cigomátic/);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 — La operativa: buscador, teclado y móvil
// ═══════════════════════════════════════════════════════════════════════════

test('buscar con tilde «Rótula» da la rótula y el fémur que la articula', async ({ page }) => {
  await buscar(page, 'Rótula');
  await expect(contador(page)).toHaveText('2 entradas (4 huesos)');
  await expect(nombresTarjetas(page)).toHaveText(['Fémur', 'Rótula']);
});

test('una búsqueda sin coincidencias lo dice y «Mostrar todos los huesos» lo restablece', async ({ page }) => {
  await buscar(page, 'zzzz');
  await expect(nombresTarjetas(page)).toHaveCount(0);
  await expect(page.getByText('No se encontraron huesos con esos criterios')).toBeVisible();
  await expect(contador(page)).toHaveText('0 entradas (0 huesos)');
  await page.getByRole('button', { name: 'Mostrar todos los huesos' }).click();
  await expect(page.locator(BUSCADOR)).toHaveValue('');
  await expect(nombresTarjetas(page)).toHaveCount(47);
  await expect(contador(page)).toContainText('Mostrando 47 entradas');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · el buscador encuentra sin tilde', async ({ page }) => {
  // «rotula», «humero», «perone» y «esternon» daban «No se encontraron huesos con esos
  // criterios»: `searchBones` comparaba con includes() sin quitar los acentos.
  for (const [termino, nombre] of [
    ['rotula', 'Rótula'],
    ['humero', 'Húmero'],
    ['perone', 'Peroné'],
    ['esternon', 'Esternón'],
  ]) {
    await buscar(page, termino);
    await expect(tarjeta(page, nombre), termino).toHaveCount(1);
  }
});

test('REPARADO, hallazgo (inspector 18/11/2026) · los huesos que la app enumera en una tarjeta agrupada se encuentran por su nombre', async ({ page }) => {
  // «pisiforme», «ganchoso» y «cuneiforme» daban cero resultados (y «escafoides» solo el radio):
  // el buscador no miraba la curiosidad, que es donde la tarjeta agrupada los nombra. Ahora cada
  // tarjeta agrupada lista sus huesos en `incluye`, que el buscador lee; y las features ya no
  // prometen un buscador «entre los 206 huesos».
  for (const [termino, nombre] of [
    ['pisiforme', 'Huesos del carpo'],
    ['ganchoso', 'Huesos del carpo'],
    ['cuneiforme', 'Huesos del tarso'],
  ]) {
    await buscar(page, termino);
    await expect(tarjeta(page, nombre), termino).toHaveCount(1);
  }
});

test('REPARADO, hallazgo (inspector 18/11/2026) · las tarjetas se abren con el teclado', async ({ page }) => {
  // Cada tarjeta era un <article onClick> sin tabindex, sin rol y sin manejador de teclado: tras
  // el último filtro, Tab saltaba a «Ver guía educativa». Ahora el nombre es un botón con
  // aria-expanded.
  await page.getByRole('button', { name: 'Sesamoideo' }).focus();
  await page.keyboard.press('Tab');
  const enTarjeta = await page.evaluate(() => Boolean(document.activeElement?.closest('article')));
  expect(enTarjeta, 'tras el último filtro, Tab llega a la primera tarjeta').toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.locator('article').first()).toContainText('Información completa');
  await expect(page.locator('article').first().getByRole('button', { expanded: true })).toHaveCount(1);
  // Otro Enter la cierra (el clic no sube al article y la abre y cierra a la vez)
  await page.keyboard.press('Enter');
  await expect(page.locator('article').first()).not.toContainText('Información completa');
});

test.describe('a 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('la página no desborda y la fila de regiones se desplaza hasta el último filtro', async ({ page }) => {
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: document.documentElement.clientWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const grupo = page.getByRole('group', { name: 'Región:' });
    const fila = await grupo.evaluate((g) => ({ scroll: g.scrollWidth, cliente: g.clientWidth }));
    expect(fila.scroll, 'la fila es más ancha que la pantalla: tiene que desplazarse').toBeGreaterThan(fila.cliente);
    await grupo.getByRole('button', { name: /Extremidad inferior/ }).click();
    await expect(contador(page)).toContainText('9 entradas');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Contenido: aviso, guía y FAQPage
// ═══════════════════════════════════════════════════════════════════════════

test('REPARADO, hallazgo (inspector 18/11/2026) · el aviso de una app de la suite salud no se puede plegar', async ({ page }) => {
  // data/applications.ts la pone en las suites «salud» y «cultura»; CLAUDE.md: salud = nivel 2
  // ALTO (severity «high», nunca colapsable) y, en varias suites, manda el nivel más alto. La
  // guía da dosis de calcio y vitamina D, plazos de consolidación y mortalidad de la fractura de
  // cadera. Era: DisclaimerCard severity="medium" collapsible, con botón «Ocultar aviso».
  await expect(page.getByText('Aviso Educativo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ocultar aviso' })).toHaveCount(0);
});

test('REPARADO, hallazgo (inspector 18/11/2026) · el estribo mide lo mismo en la guía, la ficha y el FAQPage, con coma decimal', async ({ page }) => {
  // Era: resumen «Estribo (~2,5 mm)», FAQPage «aproximadamente 3 mm», ficha «2.5-3 mm» (punto
  // decimal anglosajón). Ahora «unos 3 mm» en los tres sitios.
  const respuestaFaq = await page.evaluate(() => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as {
        '@type'?: string;
        mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
      };
      if (j['@type'] !== 'FAQPage') continue;
      const q = j.mainEntity?.find((m) => m.name.includes('más pequeño'));
      if (q) return q.acceptedAnswer.text;
    }
    return '';
  });
  const resumen = await page.getByText('Hueso más pequeño', { exact: true }).locator('xpath=following-sibling::span[1]').textContent();
  const mm = (t: string | null): string | undefined => /(\d+(?:,\d+)?)\s*mm/.exec(t ?? '')?.[1];
  expect(mm(resumen), 'el resumen da una medida en mm').toBeTruthy();
  expect(mm(respuestaFaq), 'FAQPage y resumen dan la misma medida').toBe(mm(resumen));
  const ficha = await abrirFicha(page, 'Estribo');
  await expect(ficha).not.toContainText(/\d\.\d/);
  await expect(ficha).toContainText('mide unos 3 mm');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · la regla mnemotécnica del carpo no repite el hueso grande ni deja fuera tres', async ({ page }) => {
  // La tarjeta del carpo da los 8: escafoides, semilunar, piramidal, pisiforme, trapecio,
  // trapezoide, grande y ganchoso. La regla del paso 3 tenía seis palabras, dos para el hueso
  // grande («Grandes» y «Capitanes», del latín capitatum) y ninguna para el semilunar, el
  // ganchoso ni una de las dos «P». Ahora da las dos filas con los 8.
  const guia = page.locator('[data-guia-educativa]');
  await expect(guia).not.toContainText('Pide Grandes, Trapecios, Trapezoides y Capitanes');
  await expect(guia).toContainText('la fila proximal (escafoides, semilunar, piramidal y pisiforme) y la distal (trapecio, trapezoide, grande y ganchoso)');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · la guía no da cifras de aprendizaje sin fuente', async ({ page }) => {
  // «Este repaso activo retiene 3 veces más que releer apuntes» (paso 6) y «retiene 3 veces más
  // que la relectura pasiva según estudios de aprendizaje» (tarjeta 📱), sin estudio ni año
  // (neutralidad editorial, antipatrón 1 de CLAUDE.md). También «Estrategia probada», «reduce a la
  // mitad el esfuerzo» y la resistencia del fémur, que la ficha daba en «30 veces el peso
  // corporal» y el FAQPage en «hasta 1.700 kg» (2.100 frente a 1.700 kg para 70 kg).
  const guia = page.locator('[data-guia-educativa]');
  await expect(guia).not.toContainText('retiene 3 veces más');
  await expect(guia).not.toContainText(/Estrategia probada|reduce a la mitad/);
  const ficha = await abrirFicha(page, 'Fémur');
  await expect(ficha).not.toContainText('30 veces');
  await expect(ficha).toContainText('varias veces el peso corporal');
});

test('REPARADO, hallazgo (inspector 18/11/2026) · los emojis de las tarjetas de la guía van ocultos al lector', async ({ page }) => {
  // Los 5 `typeIcon` (📏 🔲 📄 🔶 ⚫) y los 6 `factIcon` (👶 💪 🔄 🩸 🤚 🦴) se leían pegados a
  // su título o a su dato. Desde el 18/11/2026 las dos clases están en CLASES_ICONO de
  // `check:iconos-tarjeta` (y se ocultaron también los 4 `factIcon` de minerales-del-mundo).
  const sueltos = await page.evaluate(() => {
    const pictograma = new RegExp('\\p{Extended_Pictographic}', 'u');
    return Array.from(document.querySelectorAll('[data-guia-educativa] span'))
      .filter((s) => s.children.length === 0 && pictograma.test(s.textContent ?? '') && !s.closest('[aria-hidden="true"]'))
      .map((s) => (s.textContent ?? '').trim());
  });
  expect(sueltos).toEqual([]);
});

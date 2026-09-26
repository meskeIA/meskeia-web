import { test, expect, type Page, type Locator } from '@playwright/test';
import { PREGUNTAS, calcularResultado } from '../../app/selector-tipo-vivienda/motor';

/**
 * ¿Piso, casa, ático o estudio? (selector-tipo-vivienda) — Inspector, 25/09/2026.
 *
 * QUÉ PROMETE: «Responde 10 preguntas sobre tu familia, presupuesto y estilo de vida para
 * descubrir qué tipo de vivienda se adapta mejor a ti», «tanto si vas a comprar como a alquilar».
 *
 * EL MOTOR, tal como lo encontró el Inspector (page.tsx:38-145 y 266-289): cada opción SUMABA
 * puntos a uno o varios de los cinco tipos (piso, casa, ático, estudio, compartido) y ganaba el
 * máximo. No había opciones eliminatorias ni penalizaciones, y el empate lo deshacía el orden de
 * declaración (`val > puntos[max]` estricto, empezando por 'piso').
 *
 * REPARADO (26/09/2026, hallazgos 2068-2070): el motor vive en app/selector-tipo-vivienda/motor.ts.
 * Los puntos son los mismos, pero una respuesta que la tarjeta de un tipo contradice lo DESCARTA
 * (familia con hijos → ni estudio ni compartido, etc.), el presupuesto ACOTA (muy ajustado deja
 * fuera ático y casa; moderado, el ático) y avisa si ningún tipo compatible cabe en él, y un empate
 * exacto se dice. Las sumas a mano de los perfiles de abajo siguen valiendo; lo que cambia es qué
 * tipos son elegibles. El barrido de las 4.000.000 combinaciones está en el último caso.
 *
 * Los perfiles se escriben como índices de opción (0 = la primera) de las diez preguntas, y el
 * esperado se ha sumado A MANO con los pesos de page.tsx antes de abrir la app. Recorridas las
 * 4.000.000 combinaciones con esos mismos pesos: 311.571 (7,8 %) acaban en empate exacto; de las
 * 1.600.000 de «familia» (con 1-2 hijos o numerosa), 11.631 dan «Piso Compartido» y 33.817
 * «Estudio»; de las 800.000 con presupuesto «Muy ajustado», 14.668 dan «Ático o Dúplex» y 310.623
 * «Casa Unifamiliar».
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test()`. Afirman lo que DEBERÍA pasar, así que
 * hoy fallan a propósito; cuando se reparen, se les quita la marca y quedan como regresión.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` no tiene
 * testigo que sondear. El equivalente para una app de solo botones (mismo criterio que
 * tests/familias/selectores.spec.ts): que React haya colgado sus props de la primera opción.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => (b.textContent ?? '').includes('Solo yo'));
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrir(page: Page): Promise<void> {
  // Sin animaciones: la barra y las opciones cambian con transiciones, y se mide lo asentado.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-tipo-vivienda/');
  await esperarHidratacionBotones(page);
}

/** Las opciones de la pregunta en pantalla, sean botones de hoy o radios tras la reparación. */
const opciones = (page: Page): Locator => page.locator('[role="group"] button, [role="radiogroup"] [role="radio"]');
const botonAvanzar = (page: Page): Locator => page.getByRole('button', { name: /Siguiente|Ver (mi )?resultado/ });
const tituloResultado = (page: Page): Locator => page.getByRole('heading', { name: /Tu tipo de vivienda ideal/ });
const tarjetaResultado = (page: Page): Locator => tituloResultado(page).locator('xpath=ancestor::section[1]');

async function responder(page: Page, indices: readonly number[]): Promise<void> {
  for (let i = 0; i < indices.length; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de ${indices.length}`, { exact: true })).toBeVisible();
    await opciones(page).nth(indices[i]).click();
    await botonAvanzar(page).click();
  }
  await tituloResultado(page).waitFor();
}

/** Espera a que no quede ninguna transición CSS en curso. */
async function asentar(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

/**
 * Contraste WCAG medido en el navegador: color computado del texto (con la opacidad acumulada)
 * sobre el fondo REAL, compuesto subiendo por los ancestros hasta uno opaco.
 */
async function contraste(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    type C = { r: number; g: number; b: number; a: number };
    const parse = (c: string): C | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (t: C, f: C): C => ({ r: t.r * t.a + f.r * (1 - t.a), g: t.g * t.a + f.g * (1 - t.a), b: t.b * t.a + f.b * (1 - t.a), a: 1 });
    const lum = (c: C): number => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const capas: C[] = [];
    let opacidad = 1;
    for (let n: Element | null = el; n; n = n.parentElement) opacidad *= Number(getComputedStyle(n).opacity);
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) capas.push(c);
      if (c && c.a === 1) break;
    }
    let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const color = parse(getComputedStyle(el).color)!;
    const texto = sobre({ ...color, a: color.a * opacidad }, fondo);
    const [l1, l2] = [lum(texto), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

/** La guía educativa, desplegada: el contenedor de sus apartados. */
async function abrirGuia(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const guia = page.getByRole('heading', { name: /Gastos adicionales al comprar/ }).locator('xpath=..');
  await expect(guia).toBeVisible();
  return guia;
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (índices de opción, sumados a mano con los pesos de page.tsx)
// ─────────────────────────────────────────────────────────────────────────────

// Familia 1-2 hijos (piso 4, casa 3) · Estándar (piso 4) · Jardín propio (casa 4) · Periferia
// (piso 3, casa 2) · Perro mediano (piso 2, casa 3, ático 2) · Normal (piso 3) · Pareja con planes
// (piso 3, casa 2) · Mantenimiento básico (piso 3) · Despacho (piso 3, casa 2) · Espacio y
// comodidad (piso 3, casa 2) → piso 28, casa 18, ático 2 → Piso Estándar.
const NORMAL_PISO = [2, 2, 3, 2, 2, 2, 2, 1, 2, 1] as const;

// Familia numerosa (casa 5, piso 2) · Alto (casa 3, ático 3) · Jardín grande (casa 5) ·
// Extrarradio (casa 4) · Varios animales (casa 4) · Máxima privacidad (casa 4, ático 3) · Familia
// consolidada (casa 4, piso 2) · Total control (casa 4) · Casa a tiempo completo (casa 4, ático 2)
// · Naturaleza (casa 4) → casa 41, ático 8, piso 4 → Casa Unifamiliar.
const NORMAL_CASA = [3, 4, 4, 3, 3, 0, 3, 3, 3, 3] as const;

// Pareja sin hijos (piso 3, estudio 2, ático 2) · MUY AJUSTADO (compartido 4, estudio 3) · Terraza
// amplia (ático 4) · Barrio residencial (piso 4, ático 2) · Perro mediano (piso 2, casa 3, ático 2)
// · Máxima privacidad (casa 4, ático 3) · Nido vacío (piso 3, ático 2, estudio 2) · No me importa
// gestionar (piso 2, ático 2) · Casa a tiempo completo (casa 4, ático 2) · Vistas y luz (ático 4)
// → ático 23, piso 14, casa 11, estudio 7, compartido 4 → Ático o Dúplex.
const MUY_AJUSTADO_ATICO = [1, 0, 2, 1, 2, 0, 4, 2, 3, 2] as const;

// FAMILIA NUMEROSA (casa 5, piso 2) · Muy ajustado (compartido 4, estudio 3) · Pequeña terraza
// (piso 2, ático 2) · Centro (estudio 3, piso 3, compartido 2) · Sin mascotas (estudio 2,
// compartido 2) · Privacidad «no me importa» (estudio 2, compartido 3) · Familia consolidada
// (casa 4, piso 2) · Mínima responsabilidad (compartido 3, estudio 2) · Trabajo fuera (estudio 3,
// compartido 2) · Precio y ubicación (compartido 3, estudio 3)
// → compartido 19, estudio 18, piso 9, casa 9, ático 2 → Piso Compartido.
const FAMILIA_NUMEROSA_COMPARTIDO = [3, 0, 1, 0, 0, 3, 3, 0, 0, 0] as const;
// Lo mismo con FAMILIA DE 1-2 HIJOS (piso 4, casa 3) → compartido 19, estudio 18, piso 11, casa 7.
const FAMILIA_12_COMPARTIDO = [2, 0, 1, 0, 0, 3, 3, 0, 0, 0] as const;

// Familia 1-2 hijos (piso 4, casa 3) · Amplio (ático 3, piso 2, casa 2) · JARDÍN PROPIO (casa 4) ·
// Periferia (piso 3, casa 2) · Perro mediano (piso 2, casa 3, ático 2) · Bastante privacidad
// (ático 3, piso 2) · Pareja con planes (piso 3, casa 2) · No me importa gestionar (piso 2,
// ático 2) · Despacho (piso 3, casa 2) · INDEPENDENCIA Y PRIVACIDAD TOTAL (casa 3, ático 2)
// → piso 21, casa 21, ático 12: EMPATE, y el orden de declaración da «Piso Estándar».
const EMPATE_PISO_CASA = [2, 3, 3, 2, 2, 1, 2, 2, 2, 4] as const;

// Solo yo (estudio 4, compartido 2) · Muy ajustado (compartido 4, estudio 3) · Exterior «no me
// importa» (estudio 2, piso 2) · Centro (estudio 3, piso 3, compartido 2) · Sin mascotas (estudio 2,
// compartido 2) · «No me importa» (estudio 2, compartido 3) · Estudiante (compartido 4, estudio 3) ·
// Mínima (compartido 3, estudio 2) · Fuera (estudio 3, compartido 2) · Precio (compartido 3,
// estudio 3) → estudio 27, compartido 25, piso 5 → Estudio o Apartamento.
const SOLO_ESTUDIO = [0, 0, 0, 0, 0, 3, 0, 0, 0, 0] as const;

// ─────────────────────────────────────────────────────────────────────────────
// El cálculo que hoy sale bien
// ─────────────────────────────────────────────────────────────────────────────

test('perfil normal: familia con 1-2 hijos y presupuesto estándar → Piso Estándar (28 frente a 18)', async ({ page }) => {
  await abrir(page);
  await responder(page, NORMAL_PISO);
  await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Piso Estándar');
});

test('perfil normal: familia numerosa, jardín grande, extrarradio → Casa Unifamiliar (41 frente a 8)', async ({ page }) => {
  await abrir(page);
  await responder(page, NORMAL_CASA);
  await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Casa Unifamiliar');
});

test('persona sola, estudiante y con presupuesto muy ajustado → Estudio o Apartamento (27 frente a 25)', async ({ page }) => {
  await abrir(page);
  await responder(page, SOLO_ESTUDIO);
  await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Estudio o Apartamento');
});

test('«Siguiente» no deja avanzar sin responder, y «Repetir el test» vuelve a la pregunta 1 sin respuestas', async ({ page }) => {
  await abrir(page);
  await expect(botonAvanzar(page)).toBeDisabled();
  await responder(page, NORMAL_PISO);
  await page.getByRole('button', { name: /Repetir/ }).click();
  await expect(page.getByText('Pregunta 1 de 10', { exact: true })).toBeVisible();
  await expect(botonAvanzar(page)).toBeDisabled();
});

test.describe('móvil de 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('el test se completa tocando y la página no desborda en horizontal', async ({ page }) => {
    await abrir(page);
    await responder(page, NORMAL_PISO);
    await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Piso Estándar');
    const [ancho, visible] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(ancho).toBeLessThanOrEqual(visible);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS DEL INSPECTOR (25/09/2026), reparados el 26/09/2026: quedan como regresión
// ─────────────────────────────────────────────────────────────────────────────

// Hallazgo: una familia recibe «Piso Compartido», cuya propia tarjeta dice «No es una solución
// para familias con hijos» (page.tsx:241). El tamaño del hogar solo suma puntos (page.tsx:43-46).
for (const [etiqueta, perfil] of [
  ['familia numerosa', FAMILIA_NUMEROSA_COMPARTIDO],
  ['familia con 1-2 hijos', FAMILIA_12_COMPARTIDO],
] as const) {
  test(`${etiqueta}: el resultado no es «Piso Compartido» ni «Estudio», que la propia app descarta para familias`, async ({ page }) => {
    await abrir(page);
    await responder(page, perfil);
    const titulo = (await tituloResultado(page).innerText()).trim();
    expect(titulo).not.toMatch(/Piso Compartido|Estudio o Apartamento/);
    // Descartados estudio y compartido (familia) y ático y casa (presupuesto muy ajustado),
    // queda el piso: 9 u 11 puntos, pero es el único elegible.
    expect(titulo).toBe('Tu tipo de vivienda ideal: Piso Estándar');
  });
}

// Hallazgo: el presupuesto «Muy ajustado» solo suma puntos a compartido y estudio (page.tsx:54):
// no resta a los tipos caros, y el ático, que la app misma da por «superior al piso equivalente»
// (page.tsx:200), gana sin que el resultado diga nada del presupuesto. Es la forma del 1678 de
// selector-tablet. Reparado vale tanto no recomendar el ático como avisar del choque.
test('con presupuesto «Muy ajustado» no recomienda el ático sin decir nada del presupuesto', async ({ page }) => {
  await abrir(page);
  await responder(page, MUY_AJUSTADO_ATICO);
  const titulo = (await tituloResultado(page).innerText()).trim();
  const texto = await tarjetaResultado(page).innerText();
  expect(titulo !== 'Tu tipo de vivienda ideal: Ático o Dúplex' || /presupuesto/i.test(texto), `obtenido: ${titulo}`).toBe(true);
  // Reparado acotando: el ático (23) queda fuera, gana el piso (14) y se dice por qué.
  expect(titulo).toBe('Tu tipo de vivienda ideal: Piso Estándar');
  expect(texto).toMatch(/Ático o Dúplex sumaba más puntos, pero con un presupuesto «muy ajustado»/);
});

// Si ningún tipo compatible cabe en el presupuesto, se recomienda el compatible y se AVISA:
// Solo yo · Muy ajustado · JARDÍN GRANDE IMPRESCINDIBLE (solo la casa lo tiene) · resto, la primera.
test('jardín grande imprescindible con presupuesto muy ajustado: casa, avisando del choque con el presupuesto', async ({ page }) => {
  await abrir(page);
  await responder(page, [0, 0, 4, 0, 0, 0, 0, 0, 0, 0]);
  await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Casa Unifamiliar');
  await expect(tarjetaResultado(page)).toContainText('Choque con tu presupuesto');
});

// Hallazgo: empate exacto piso 21 = casa 21 que se deshace en silencio por el orden de
// declaración (page.tsx:285-288), hacia el tipo que contradice «Jardín propio es importante» e
// «independencia y privacidad total» («Sin espacio exterior propio», «Menor privacidad que una
// vivienda unifamiliar»). Reparado vale decir el empate o que gane la casa.
test('un empate exacto piso-casa se dice, o no se resuelve contra el jardín y la privacidad pedidos', async ({ page }) => {
  await abrir(page);
  await responder(page, EMPATE_PISO_CASA);
  const texto = await tarjetaResultado(page).innerText();
  expect(/empat/i.test(texto) || texto.includes('Casa Unifamiliar'), texto.slice(0, 120)).toBe(true);
  // Reparado diciendo el empate, con los dos tipos y sus tarjetas.
  await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Piso Estándar o Casa Unifamiliar');
  expect(texto).toContain('Empate a 21 puntos');
});

// Hallazgo (dato): la guía escribe a mano los gastos de compra (page.tsx:501-506). Derivados de
// data/itp-ccaa.ts, como hace ya app/selector-alquiler-vs-compra/cifras.ts (hallazgo 1462): con
// una vivienda de 200.000 €, impuestos, notaría y registro suman del 3,5 % (Ceuta y Melilla) al
// 10,5 % (Cataluña) si es usada, y del 10,5 % al 12 % si es nueva; el ITP de la vivienda va del
// 4 % (País Vasco) al 13 % (RANGO_ITP_VIVIENDA) y el AJD del 0 % al 1,5 % (RANGO_AJD_VIVIENDA).
test('la guía no publica gastos de compra ni tipos de ITP y AJD escritos a mano', async ({ page }) => {
  await abrir(page);
  const guia = await abrirGuia(page);
  const texto = (await guia.innerText()).replace(/ /g, ' ');
  expect.soft(texto, 'gastos de compra: 3,5-10,5 % usada, 10,5-12 % nueva').not.toContain('entre el 10 % y el 15 %');
  expect.soft(texto, 'ITP de la vivienda: 4-13 %').not.toContain('entre el 6 % y el 10 %');
  expect.soft(texto, 'AJD de la vivienda: 0-1,5 %').not.toContain('entre el 0,5 % y el 1,5 %');
});

// Hallazgo: publica tipos de ITP, IVA y AJD sin <DataReference> tras el <DisclaimerCard>
// (CLAUDE.md, «Componente DataReference»; en la hermana selector-alquiler-vs-compra, hallazgo 1469).
test('los tipos normativos de la guía llevan su sello de fuente y fecha (DataReference)', async ({ page }) => {
  await abrir(page);
  await expect(page.getByRole('note', { name: 'Datos de referencia normativos' })).toHaveCount(1);
});

// Hallazgo: el foco cae a <body> al avanzar (el «Siguiente» pulsado se desactiva en la pregunta
// nueva, page.tsx:388; en la 10 se desmonta, page.tsx:383-405) y al ver el resultado, que no
// recibe el foco (page.tsx:308-310, 411).
test('el foco no cae a <body> al avanzar, y al terminar va al resultado', async ({ page }) => {
  await abrir(page);
  await opciones(page).nth(0).click();
  await botonAvanzar(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Pregunta 2 de 10', { exact: true })).toBeVisible();
  const enBody = await page.evaluate(() => document.activeElement === null || document.activeElement === document.body);
  expect.soft(enBody, 'tras «Siguiente», document.activeElement es <body>').toBe(false);

  for (let i = 1; i < 10; i++) {
    await opciones(page).nth(0).click();
    await botonAvanzar(page).focus();
    await page.keyboard.press('Enter');
  }
  await tituloResultado(page).waitFor();
  const enResultado = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h1, h2, h3')).find((x) => /Tu tipo de vivienda ideal/.test(x.textContent ?? ''));
    const a = document.activeElement;
    if (!h || !a || a === document.body) return false;
    return a === h || a.contains(h) || (h.closest('section')?.contains(a) ?? false);
  });
  expect(enResultado, 'al ver el resultado, el foco queda en <body>').toBe(true);
});

// Hallazgo (forma de la familia de selectores, 950/1341): una elección única anunciada como
// conmutadores <button aria-pressed> dentro de role="group" (page.tsx:356-367).
test('las opciones son radios: role="radio" con aria-checked, sin aria-pressed, una sola marcada', async ({ page }) => {
  await abrir(page);
  await expect(opciones(page)).toHaveCount(5);
  await expect.soft(page.locator('[role="radio"]')).toHaveCount(5);
  await expect.soft(opciones(page).and(page.locator('[aria-pressed]'))).toHaveCount(0);
  await opciones(page).nth(1).click();
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
});

// Hallazgo (forma de la familia de selectores, 951/1342): la barra anuncia aria-valuenow =
// pregunta con MÍNIMO 1 (page.tsx:340) y pinta (pregunta − 1) / 10 (page.tsx:263): en la
// pregunta 2 anuncia (2 − 1) / (10 − 1) = 0,111 y pinta 0,100; en la 10, 1,000 y 0,900.
test('la barra de progreso anuncia la misma fracción que pinta', async ({ page }) => {
  await abrir(page);
  await opciones(page).nth(0).click();
  await botonAvanzar(page).click();
  await expect(page.getByText('Pregunta 2 de 10', { exact: true })).toBeVisible();
  await asentar(page);
  const barra = page.getByRole('progressbar');
  const anunciada = await barra.evaluate((el) => {
    const [a, mn, mx] = ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map((n) => Number(el.getAttribute(n)));
    return (a - mn) / (mx - mn);
  });
  const pintada = await barra.evaluate((el) => {
    const interior = el.firstElementChild as HTMLElement;
    const relleno = interior.firstElementChild as HTMLElement;
    return relleno.getBoundingClientRect().width / interior.clientWidth;
  });
  // Precisión 2 (±0,005): el defecto es una diferencia de 0,011 en la pregunta 2.
  expect(pintada).toBeCloseTo(anunciada, 2);
});

// Hallazgo: contraste por debajo de 4,5:1 en texto normal del propio módulo CSS. Medido el
// 25/09/2026 — claro: «Pregunta N de 10» 4,11 (css:81), opción marcada ~3,5 (css:129),
// «Siguiente» 4,11 (css:198), «Ver mi resultado» 2,80 (css:213), «Ventajas» 3,93 (css:330),
// «Próximos pasos» 3,83 (css:364), «Repetir el test» 4,11 (css:228) · oscuro: «Siguiente» 2,79,
// «Ver mi resultado» 2,23, «Próximos pasos» 4,33.
for (const tema of ['light', 'dark'] as const) {
  test(`contraste de 4,5:1 en los textos del test y del resultado (tema ${tema})`, async ({ page }) => {
    await abrir(page);
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, tema);
    const medidas: Array<[string, number]> = [];
    const medir = async (etiqueta: string, loc: Locator) => {
      await asentar(page);
      medidas.push([etiqueta, await contraste(loc)]);
    };
    await medir('Pregunta 1 de 10', page.getByText('Pregunta 1 de 10', { exact: true }));
    await opciones(page).nth(1).click();
    await medir('opción marcada', opciones(page).nth(1));
    await medir('Siguiente', botonAvanzar(page));
    for (let i = 0; i < 9; i++) {
      if (i > 0) await opciones(page).nth(0).click();
      await botonAvanzar(page).click();
    }
    await opciones(page).nth(0).click();
    await medir('Ver mi resultado', botonAvanzar(page));
    await botonAvanzar(page).click();
    await tituloResultado(page).waitFor();
    await medir('Ventajas', page.getByRole('heading', { name: 'Ventajas', exact: true }));
    await medir('Próximos pasos', page.getByRole('heading', { name: /Próximos pasos/ }));
    await medir('Repetir el test', page.getByRole('button', { name: /Repetir/ }));
    // Añadido al reparar: los enlaces de «Próximos pasos», que antes eran texto en negrita.
    await medir('enlace de Próximos pasos', page.getByRole('link', { name: 'Estimador Gastos Compraventa Vivienda' }));
    const bajos = medidas.filter(([, r]) => r < 4.5).map(([e, r]) => `${e} ${r.toFixed(2)}:1`);
    expect(bajos).toEqual([]);
  });
}

// Hallazgo: el JSON-LD WebApplication que inyecta layout.tsx sale con `featureList: []`
// (metadata.ts:50; §1.ter pide 4-8) y la descripción cortada a media palabra (metadata.ts:47).
test('el JSON-LD WebApplication trae 4-8 características y la descripción entera', async ({ page }) => {
  await abrir(page);
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const app = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((o) => o['@type'] === 'WebApplication');
  expect(app, 'hay un WebApplication').toBeTruthy();
  const caracteristicas = (app?.featureList as unknown[] | undefined) ?? [];
  expect.soft(caracteristicas.length).toBeGreaterThanOrEqual(4);
  expect.soft(caracteristicas.length).toBeLessThanOrEqual(8);
  expect(String(app?.description)).not.toMatch(/\bpresu$/);
});

// Hallazgo (formato): el «%» va con espacio normal en la guía (page.tsx:501-506) y pegado en la
// FAQ (metadata.ts:62, «un 20% y un 40%»); la regla del 25/09/2026 pide espacio duro (U+00A0).
test('los porcentajes de la guía y de la FAQ llevan espacio duro antes del %', async ({ page }) => {
  await abrir(page);
  const guia = await abrirGuia(page);
  const textoGuia = await guia.innerText();
  const faq = (await page.locator('script[type="application/ld+json"]').allTextContents()).find((b) => b.includes('FAQPage')) ?? '';
  const mal = [...`${textoGuia}\n${faq}`.matchAll(/\d( ?)%/g)].map((m) => m[0]);
  expect(mal).toEqual([]);
});

// Hallazgo: la superficie del estudio cambia según dónde se lea: «típicamente 25-50 m²» en el
// resultado (page.tsx:211) y «habitualmente entre 20 y 45 m²» en la guía (page.tsx:491).
test('el resultado y la guía dan la misma superficie típica del estudio', async ({ page }) => {
  await abrir(page);
  await responder(page, SOLO_ESTUDIO);
  const enResultado = (await tarjetaResultado(page).innerText()).match(/(\d+)\s*(?:-|–|y)\s*(\d+)\s*m²/);
  const guia = await abrirGuia(page);
  const enGuia = (await guia.innerText()).match(/(\d+)\s*(?:-|–|y)\s*(\d+)\s*m²/);
  // Quitar la cifra de uno de los dos sitios también es una reparación válida.
  if (enResultado && enGuia) expect([enResultado[1], enResultado[2]]).toEqual([enGuia[1], enGuia[2]]);
});

// Hallazgo: la app promete servir «tanto si vas a comprar como a alquilar», no pregunta cuál, y
// la tarjeta de la casa afirma «Total libertad para reformas y personalización» y «Gestión y
// conservación íntegramente a tu cargo» (page.tsx:177 y 184). Para quien alquila, la Ley 29/1994
// de Arrendamientos Urbanos dice lo contrario: art. 23.1 (obras que modifiquen la configuración,
// solo con consentimiento escrito del arrendador) y art. 21.1 (las reparaciones de
// habitabilidad son del arrendador). BOE-A-1994-26003, consultado el 25/09/2026.
test('las ventajas y cautelas de la casa no dan por hecho que se compra', async ({ page }) => {
  await abrir(page);
  await responder(page, NORMAL_CASA);
  await expect(tituloResultado(page)).toHaveText('Tu tipo de vivienda ideal: Casa Unifamiliar');
  const items = await tarjetaResultado(page).locator('li').allInnerTexts();
  const sinMatiz = items.filter((t) => /reformas|a tu cargo/i.test(t) && !/propiet|compra|alquil|arrend/i.test(t));
  expect(sinMatiz).toEqual([]);
});

// Hallazgo: «Calcula los gastos reales de adquisición con el Estimador Coste Vivienda»
// (page.tsx:447), pero esa app calcula lo que cuesta MANTENER la vivienda al mes («Estimador
// Coste Real de Vivienda»); los gastos de compra los calcula el Estimador Gastos Compraventa
// Vivienda (/estimador-compraventa-inmueble/).
test('«Próximos pasos» manda los gastos de adquisición a la app que los calcula', async ({ page }) => {
  await abrir(page);
  await responder(page, NORMAL_PISO);
  const pasos = await tarjetaResultado(page).locator('li').allInnerTexts();
  const mal = pasos.filter((t) => /adquisición/i.test(t) && /Estimador Coste Vivienda/.test(t));
  expect(mal).toEqual([]);
});

// Hallazgo: errata en la pregunta 6, «No me importa, soy poco tiempo en casa» (page.tsx:100).
test('la pregunta 6 no dice «soy poco tiempo en casa»', async ({ page }) => {
  await abrir(page);
  for (let i = 0; i < 5; i++) {
    await opciones(page).nth(0).click();
    await botonAvanzar(page).click();
  }
  await expect(page.getByText('Pregunta 6 de 10', { exact: true })).toBeVisible();
  await expect(opciones(page).filter({ hasText: 'soy poco tiempo en casa' })).toHaveCount(0);
});

// Barrido del motor (sin navegador): en las 4.000.000 combinaciones, ninguna recomendación es un
// tipo que alguna respuesta descarta, siempre hay al menos un recomendado, y un tipo fuera del
// presupuesto solo sale cuando la pantalla avisa del choque. Al reparar (26/09/2026): 181.173
// empates (4,5 %), todos dichos; 160.000 choques, exactamente las de «muy ajustado» + «jardín
// grande imprescindible».
test('barrido del motor: ninguna recomendación contradice una respuesta', () => {
  const tam = PREGUNTAS.map((p) => p.opciones.length);
  const r: number[] = new Array(PREGUNTAS.length).fill(0);
  let combinaciones = 0;
  const fallos: string[] = [];
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      combinaciones++;
      const res = calcularResultado(r);
      if (res.ganadores.length === 0) fallos.push(`sin recomendación: ${r.join(',')}`);
      for (const g of res.ganadores) {
        PREGUNTAS.forEach((p, k) => {
          if (p.opciones[r[k]].descarta?.includes(g)) fallos.push(`${g} descartado por la pregunta ${k + 1}: ${r.join(',')}`);
          if (p.opciones[r[k]].fueraDePresupuesto?.includes(g) && !res.chocaConPresupuesto) {
            fallos.push(`${g} fuera de presupuesto sin aviso: ${r.join(',')}`);
          }
        });
      }
      return;
    }
    for (let o = 0; o < tam[i]; o++) {
      r[i] = o;
      recorrer(i + 1);
      if (fallos.length > 5) return;
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(combinaciones).toBe(4_000_000);
});

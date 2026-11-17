import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { contrasteSobreFondoReal } from './_contraste';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — simulador-sesgos-inversor (segmento interactiva, riesgo 2)
 *
 * Primera inspección: 17/11/2026. No da un número, pero SÍ tiene verdad comprobable: cada opción de
 * los ocho escenarios lleva escrito en `ESCENARIOS` (app/simulador-sesgos-inversor/page.tsx) qué
 * sesgo marca y con qué nivel, y el resultado es un recuento determinista. Sin motor en `lib/` ni
 * módulo en `data/`: todo inline en el componente. Los casos se resolvieron A MANO con esta tabla
 * antes de abrir el navegador.
 *
 * LA TABLA (índice de opción 0 = A, 1 = B, 2 = C · «—» = sin sesgo)
 *   Esc. 1 «La apuesta a cara o cruz»  A aversión a las pérdidas ALTO · B —   (apuesta mixta desde el
 *                                      17/11/2026, hallazgo 4907; antes, dos ganancias sin pérdida)
 *   Esc. 2 «La acción que no sube»     A — · B efecto de disposición ALTO · C disposición MODERADO
 *   Esc. 3 «La investigación sesgada»  A confirmación ALTO · B — · C —
 *   Esc. 4 «La fiebre del Bitcoin»     A manada ALTO · B — · C —
 *   Esc. 5 «Los cuatro años buenos»    A recencia ALTO · B — · C —   (5C marcaba recencia MODERADO
 *                                      hasta el 17/11/2026, hallazgo 4908: esperar una corrección no es
 *                                      extrapolar la racha)
 *   Esc. 6 «El stock picker»           A exceso de confianza ALTO · B — · C exceso MODERADO
 *   Esc. 7 «El precio de compra»       A anclaje ALTO · B — · C —
 *   Esc. 8 «La cartera abandonada»     A statu quo ALTO · B — · C statu quo MODERADO
 *   Cada sesgo sale en UN solo escenario, así que el «ya existe» de `elegir` no llega a actuar.
 *
 * EL RESULTADO
 *   Título: «Sin sesgos detectados» · «1 sesgo detectado» · «N sesgos detectados».
 *   Icono: 🏆 sin sesgos · ⚠️ con 3 o más ALTOS · 📊 en otro caso.
 *   Perfil (`getResumenPerfil`): total 0 → «Inversor muy racional…» · altos ≥ 4 → «Alta
 *   influencia emocional…» · altos ≥ 2 → «Presencia moderada-alta…» · si no → «Sesgos leves o
 *   moderados…». Cifras: altos / moderados / 8 − detectados.
 */

const RUTA = '/simulador-sesgos-inversor/';

/** El botón de arranque ya lleva los manejadores de React (un clic anterior se perdería). */
async function esperarBotonesHidratados(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) =>
        /Empezar simulación/.test(b.textContent ?? ''),
      );
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarBotonesHidratados(page);
}

/** Las opciones del escenario en pantalla: son los únicos botones con `aria-pressed` del <main>. */
const opciones = (page: Page): Locator => page.locator('main button[aria-pressed]');
const botonSiguiente = (page: Page): Locator =>
  page.getByRole('button', { name: /Siguiente escenario|Ver mi perfil/ });
/** «🔴 X detectado», «🟡 X detectado» o «✅ Decisión racional». */
const veredicto = (page: Page): Locator =>
  page.locator('main p').filter({ hasText: /detectado$|Decisión racional$/ });
const contador = (page: Page): Locator => page.locator('main').getByText(/^\d+ sesgos? detectados?$/);
const tituloResultado = (page: Page): Locator => page.locator('main h2');
const perfil = (page: Page): Locator => page.locator('main h2 + p');
/** La cifra que va encima de su rótulo en el bloque de tres del resultado. */
const cifra = (page: Page, rotulo: RegExp): Locator =>
  page.locator('main').getByText(rotulo).locator('xpath=preceding-sibling::span[1]');
const ALTO = /^\S+\s+Alto impacto$/;
const MODERADO = /^\S+\s+Moderado$/;
const NO_DETECTADOS = /^\S+\s+No detectados$/;
const tarjetas = (page: Page): Locator => page.locator('main h4');
const insignias = (page: Page): Locator => page.locator('main h4 + span');
const sinEvidencia = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Sin evidencia de estos sesgos' }).locator('xpath=following-sibling::div[1]');

async function empezar(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Empezar simulación/ }).click();
  await expect(page.getByText('Escenario 1 de 8')).toBeVisible();
}

/** Contesta los ocho escenarios con los índices dados y llega al resultado. */
async function contestar(page: Page, indices: number[]): Promise<void> {
  for (const i of indices) {
    await opciones(page).nth(i).click();
    await botonSiguiente(page).click();
  }
  await expect(tituloResultado(page)).toBeVisible();
}

/** Lleva hasta el escenario `n` (1-8) contestando la opción sin sesgo de cada uno. */
const SIN_SESGO = [1, 0, 1, 1, 1, 1, 1, 1];
async function irAlEscenario(page: Page, n: number): Promise<void> {
  for (let e = 0; e < n - 1; e++) {
    await opciones(page).nth(SIN_SESGO[e]).click();
    await botonSiguiente(page).click();
  }
  await expect(page.getByText(`Escenario ${n} de 8`)).toBeVisible();
}

const dondeEstaElFoco = (page: Page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'BODY';
    return `${a.tagName}${a.getAttribute('aria-pressed') !== null ? '[aria-pressed]' : ''} «${(a.textContent ?? '').trim().slice(0, 40)}»`;
  });

// ============================================================
// CASO 1 — Recorrido normal: dos altos y dos moderados
// ============================================================
test.describe('Caso normal: A, A, B, A, C, B, C, C', () => {
  test('el recuento sigue la tabla escenario a escenario y el perfil sale «moderada-alta»', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    // Resuelto a mano con la tabla de la cabecera, antes de abrir el navegador. Desde el 17/11/2026
    // (hallazgo 4908) 5C no marca sesgo, así que el recorrido da 3 y no 4:
    //   1A aversión ALTO (1) · 2A — (1) · 3B — (1) · 4A manada ALTO (2) · 5C — (2)
    //   6B — (2) · 7C — (2) · 8C statu quo MOD (3)
    const pasos: Array<{ opcion: number; veredicto: string; contador: string }> = [
      { opcion: 0, veredicto: '🔴 Aversión a las pérdidas detectado', contador: '1 sesgo detectado' },
      { opcion: 0, veredicto: '✅ Decisión racional', contador: '1 sesgo detectado' },
      { opcion: 1, veredicto: '✅ Decisión racional', contador: '1 sesgo detectado' },
      { opcion: 0, veredicto: '🔴 Efecto manada detectado', contador: '2 sesgos detectados' },
      { opcion: 2, veredicto: '✅ Decisión racional', contador: '2 sesgos detectados' },
      { opcion: 1, veredicto: '✅ Decisión racional', contador: '2 sesgos detectados' },
      { opcion: 2, veredicto: '✅ Decisión racional', contador: '2 sesgos detectados' },
      { opcion: 2, veredicto: '🟡 Sesgo del statu quo detectado', contador: '3 sesgos detectados' },
    ];
    for (const [n, paso] of pasos.entries()) {
      await expect(page.getByText(`Escenario ${n + 1} de 8`)).toBeVisible();
      await opciones(page).nth(paso.opcion).click();
      await expect(veredicto(page)).toHaveText(paso.veredicto);
      await expect(contador(page)).toHaveText(paso.contador);
      await botonSiguiente(page).click();
    }

    // 3 detectados, 2 altos → ni 0 ni ≥ 4 altos, pero ≥ 2: «Presencia moderada-alta»; icono 📊
    // porque 2 < 3 altos.
    await expect(tituloResultado(page)).toHaveText('3 sesgos detectados');
    await expect(perfil(page)).toHaveText(/^Presencia moderada-alta de sesgos\./);
    await expect(tituloResultado(page).locator('xpath=preceding-sibling::span[1]')).toHaveText('📊');
    await expect(cifra(page, ALTO)).toHaveText('2');
    await expect(cifra(page, MODERADO)).toHaveText('1');
    await expect(cifra(page, NO_DETECTADOS)).toHaveText('5'); // 8 − 3
    // Los altos van delante de los moderados (el `sort` de `sesgosOrdenados`); el orden entre
    // dos altos no lo promete la app, así que se comparan como conjunto.
    await expect(insignias(page)).toHaveText([
      '🔴 Impacto alto', '🔴 Impacto alto', '🟡 Impacto moderado',
    ]);
    const nombres = await tarjetas(page).allInnerTexts();
    expect(nombres.slice(0, 2).sort()).toEqual(['Aversión a las pérdidas', 'Efecto manada']);
    expect(nombres.slice(2)).toEqual(['Sesgo del statu quo']);
    // Los cinco que faltan, en el orden de INFO_SESGOS
    await expect(sinEvidencia(page)).toHaveText(
      // [\s\S] en vez del flag /s, que el target del tsconfig (anterior a es2018) no admite
      /Efecto de disposición[\s\S]*Sesgo de confirmación[\s\S]*Sesgo de recencia[\s\S]*Exceso de confianza[\s\S]*Sesgo de anclaje/,
    );

    // «Repetir simulación» vuelve al escenario 1 con el contador a cero
    await page.getByRole('button', { name: 'Repetir simulación' }).click();
    await expect(page.getByText('Escenario 1 de 8')).toBeVisible();
    await expect(contador(page)).toHaveText('0 sesgos detectados');
  });
});

// ============================================================
// CASO 2 — Los extremos: ninguno, todos altos, uno solo y el umbral de tres altos
// ============================================================
test.describe('Caso límite: 0 sesgos, 8 altos, 1 moderado y 3 altos', () => {
  test('todo sin sesgo (B, A, B, C, B, B, B, B): «Sin sesgos detectados» y 0 / 0 / 8', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    await contestar(page, [1, 0, 1, 2, 1, 1, 1, 1]);
    await expect(tituloResultado(page)).toHaveText('Sin sesgos detectados');
    await expect(tituloResultado(page).locator('xpath=preceding-sibling::span[1]')).toHaveText('🏆');
    await expect(perfil(page)).toHaveText(/^Inversor muy racional\./);
    await expect(cifra(page, ALTO)).toHaveText('0');
    await expect(cifra(page, MODERADO)).toHaveText('0');
    await expect(cifra(page, NO_DETECTADOS)).toHaveText('8');
    await expect(page.getByRole('heading', { name: 'Tus sesgos detectados' })).toHaveCount(0);
    await expect(sinEvidencia(page).locator('> div')).toHaveCount(8);
  });

  test('todos los altos (A, B, A, A, A, A, A, A): 8 / 0 / 0, ⚠️ y «Alta influencia emocional»', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    await contestar(page, [0, 1, 0, 0, 0, 0, 0, 0]);
    await expect(tituloResultado(page)).toHaveText('8 sesgos detectados');
    await expect(tituloResultado(page).locator('xpath=preceding-sibling::span[1]')).toHaveText('⚠️');
    await expect(perfil(page)).toHaveText(/^Alta influencia emocional/); // altos = 8 ≥ 4
    await expect(cifra(page, ALTO)).toHaveText('8');
    await expect(cifra(page, MODERADO)).toHaveText('0');
    await expect(cifra(page, NO_DETECTADOS)).toHaveText('0');
    await expect(insignias(page)).toHaveText(Array(8).fill('🔴 Impacto alto'));
    await expect(page.getByRole('heading', { name: 'Sin evidencia de estos sesgos' })).toHaveCount(0);
  });

  test('un solo moderado (2C y el resto sin sesgo): singular, 0 / 1 / 7 y «Sesgos leves»', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    await contestar(page, [1, 2, 1, 1, 1, 1, 1, 1]);
    await expect(tituloResultado(page)).toHaveText('1 sesgo detectado');
    await expect(tituloResultado(page).locator('xpath=preceding-sibling::span[1]')).toHaveText('📊');
    await expect(perfil(page)).toHaveText(/^Sesgos leves o moderados\./); // 0 altos, total 1
    await expect(cifra(page, ALTO)).toHaveText('0');
    await expect(cifra(page, MODERADO)).toHaveText('1');
    await expect(cifra(page, NO_DETECTADOS)).toHaveText('7');
    await expect(tarjetas(page)).toHaveText(['Efecto de disposición']);
    await expect(insignias(page)).toHaveText(['🟡 Impacto moderado']);
  });

  test('tres altos (1A, 2B, 3A): el icono ya es ⚠️ pero el perfil sigue en «moderada-alta»', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    await contestar(page, [0, 1, 0, 1, 1, 1, 1, 1]);
    // Umbrales distintos a propósito en el código: icono con altos ≥ 3, «Alta influencia» con ≥ 4.
    await expect(tituloResultado(page)).toHaveText('3 sesgos detectados');
    await expect(tituloResultado(page).locator('xpath=preceding-sibling::span[1]')).toHaveText('⚠️');
    await expect(perfil(page)).toHaveText(/^Presencia moderada-alta de sesgos\./);
    await expect(cifra(page, ALTO)).toHaveText('3');
    await expect(cifra(page, NO_DETECTADOS)).toHaveText('5');
  });
});

// ============================================================
// CASO 3 — Lo que debe rechazarse
// ============================================================
test.describe('Caso a rechazar: avanzar sin contestar, cambiar la respuesta o el doble toque', () => {
  test('sin contestar no hay «Siguiente», y una vez contestado no se puede cambiar', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    await expect(botonSiguiente(page)).toHaveCount(0);
    // Contesta B (sin sesgo) y fuerza después un clic sobre A (aversión ALTO): `elegir` corta con
    // `if (haRespondido) return` y los botones están deshabilitados.
    await opciones(page).nth(1).click();
    await expect(opciones(page).nth(0)).toBeDisabled();
    await expect(opciones(page).nth(1)).toBeDisabled();
    await opciones(page).nth(0).click({ force: true }).catch(() => {});
    await expect(contador(page)).toHaveText('0 sesgos detectados');
    await expect(veredicto(page)).toHaveText('✅ Decisión racional');
    await expect(opciones(page).nth(0)).toHaveAttribute('aria-pressed', 'false');
    await expect(opciones(page).nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('doble toque en «Siguiente escenario» a 360 × 740: el 2.º toque no contesta el escenario nuevo', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await abrir(page);
    await empezar(page);
    for (let e = 1; e <= 7; e++) {
      await opciones(page).nth(SIN_SESGO[e - 1]).click();
      const sig = page.getByRole('button', { name: 'Siguiente escenario →' });
      await sig.scrollIntoViewIfNeeded();
      const caja = (await sig.boundingBox())!;
      await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
      await page.mouse.down({ clickCount: 1 });
      await page.mouse.up({ clickCount: 1 });
      await expect(page.getByText(`Escenario ${e + 1} de 8`)).toBeVisible();
      await page.waitForTimeout(80);
      await page.mouse.down({ clickCount: 2 });
      await page.mouse.up({ clickCount: 2 });
      await page.waitForTimeout(300);
      // Medido el 17/11/2026: el 2.º toque cae en la cabecera de la guía o en el contenedor, no en
      // una opción. Si una reforma subiera las opciones bajo el dedo, esto lo diría.
      await expect(page.locator('main button[aria-pressed="true"]'), `escenario ${e + 1}`).toHaveCount(0);
      await expect(veredicto(page)).toHaveCount(0);
    }
  });
});

// ============================================================
// MÓVIL — el recorrido del caso 1 a toques en un Pixel 7
// ============================================================
test.describe('Móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('el caso 1 a toques da el mismo 2 / 1 / 5 y la página no desborda en horizontal', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Empezar simulación/ }).tap();
    for (const i of [0, 0, 1, 0, 2, 1, 2, 2]) {
      await opciones(page).nth(i).tap();
      await botonSiguiente(page).tap();
    }
    await expect(tituloResultado(page)).toHaveText('3 sesgos detectados');
    await expect(cifra(page, ALTO)).toHaveText('2');
    await expect(cifra(page, MODERADO)).toHaveText('1');
    await expect(cifra(page, NO_DETECTADOS)).toHaveText('5');
    const [ancho, ventana] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(ancho).toBeLessThanOrEqual(ventana);
  });
});

// ============================================================
// Regresiones que hoy pasan
// ============================================================
test.describe('Regresiones', () => {
  test('el aviso financiero sale entero, sin plegar y fuera de la guía educativa', async ({ page }) => {
    // Riesgo 2 (nivel ALTO de la política de avisos): no colapsable y siempre visible.
    await abrir(page);
    const aviso = page.getByText(/no\s+constituye asesoramiento financiero/).first();
    await expect(aviso).toBeVisible();
    const boton = page.getByRole('button', { name: /guía educativa/i });
    expect(await aviso.evaluate((el) => Boolean(el.closest('details')))).toBe(false);
    // El aviso va ANTES del botón de la guía en el documento (la guía nace plegada)
    const orden = await page.evaluate(() => {
      const a = [...document.querySelectorAll('p')].find((p) => /constituye asesoramiento financiero/.test(p.textContent ?? ''));
      const g = [...document.querySelectorAll('button')].find((b) => /guía educativa/i.test(b.textContent ?? ''));
      if (!a || !g) return 'falta uno';
      return a.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING ? 'aviso antes' : 'aviso después';
    });
    expect(orden).toBe('aviso antes');
    await expect(boton).toBeVisible();
  });

  test('las cifras que sí llegan a 3:1 (texto grande, 28 px / 800) en los dos temas', async ({ page }) => {
    // Medido el 17/11/2026 contra el fondo compuesto: alto 4,63 en claro, moderado 4,15 en oscuro,
    // no detectados 3,16 en claro y 3,70 en oscuro. Los dos que no llegan, en el hallazgo de abajo.
    await abrir(page);
    await empezar(page);
    await contestar(page, [0, 2, 1, 0, 1, 1, 1, 1]); // 2 altos / 1 moderado / 5
    await esperarPaginaAsentada(page);
    expect(await contrasteSobreFondoReal(cifra(page, ALTO))).toBeGreaterThanOrEqual(3);
    expect(await contrasteSobreFondoReal(cifra(page, NO_DETECTADOS))).toBeGreaterThanOrEqual(3);
    await ponerTema(page, 'dark');
    expect(await contrasteSobreFondoReal(cifra(page, MODERADO))).toBeGreaterThanOrEqual(3);
    expect(await contrasteSobreFondoReal(cifra(page, NO_DETECTADOS))).toBeGreaterThanOrEqual(3);
  });
});

/** Pone el tema, espera a que acaben las transiciones de color y comprueba que se quedó puesto. */
async function ponerTema(page: Page, tema: 'light' | 'dark'): Promise<void> {
  await page.evaluate(async (t) => {
    document.documentElement.setAttribute('data-theme', t);
    await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
  }, tema);
  await page.waitForTimeout(450); // transiciones de 0,2-0,4 s que no siempre salen en getAnimations
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

// ============================================================
// HALLAZGOS de la primera inspección (17/11/2026) — ABIERTOS
// Cada caso afirma lo que DEBERÍA pasar y lleva `test.fail()` mientras el defecto siga. Al
// repararlo se quita esa línea y queda como regresión.
// ============================================================
test.describe('Hallazgos 17/11/2026', () => {
  test('REPARADO (hallazgo 4907) — el escenario 1 diagnosticaba «aversión a las pérdidas» en una elección sin pérdidas', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    // Antes: las dos opciones eran ganancias (2.000 € seguros frente a 50 % de 4.000 € y 50 % de
    // 0 €), así que elegir la segura era preferencia por la certeza, no aversión a las PÉRDIDAS. La
    // ficha admitía dos arreglos: una apuesta mixta o cambiar el sesgo. Se hizo la apuesta mixta:
    // cara gana 150 €, cruz pierde 100 €. Valor esperado 0,5 × 150 − 0,5 × 100 = +25 €, y rechazarla
    // (la opción A) sí es la señal de aversión a las pérdidas; aceptarla, coherente con el valor esperado.
    expect(0.5 * 150 - 0.5 * 100).toBe(25);
    await expect(opciones(page).nth(0)).toContainText('perder 100');
    await expect(page.locator('main')).toContainText('si sale cruz pierdes 100');
    await opciones(page).nth(0).click();
    await expect(veredicto(page)).toContainText('Aversión a las pérdidas');
    await expect(page.locator('main')).toContainText('+25');
    await expect(page.locator('main')).not.toContainText('Elección racional');
  });

  test('REPARADO (hallazgo 4908) — elegir 5C («habrá una corrección») daba una tarjeta que dice «esperas que siga subiendo»', async ({ page }) => {
    await abrir(page);
    await empezar(page);
    // Solo 5C con sesgo. La app marca «Sesgo de recencia» y la tarjeta del resultado le atribuye
    // lo contrario de lo que contestó: «Si el mercado lleva subiendo 3 años, esperas que siga
    // subiendo» y «Aumentas la exposición a riesgo justo antes de una corrección». Además el
    // feedback de 5A dice que «tras períodos prolongados de subidas las valoraciones suelen ser
    // más exigentes», que es el razonamiento de 5C.
    // Ahora 5C no marca sesgo (esperar una corrección no es extrapolar la racha): perfil sin sesgos.
    await contestar(page, [1, 0, 1, 1, 2, 1, 1, 1]);
    await expect(page.locator('main')).not.toContainText('esperas que siga subiendo');
    await expect(tituloResultado(page)).toHaveText('Sin sesgos detectados');
  });

  test('REPARADO (hallazgo 4909) — al contestar, el foco caía a <body> y el veredicto no se anunciaba', async ({ page }) => {
    // REPARADO 17/11/2026: foco a «Siguiente» (enfocarSinCentrar) y el veredicto en aria-live.
    await abrir(page);
    await empezar(page);
    await opciones(page).nth(0).focus();
    await page.keyboard.press('Enter');
    await expect(veredicto(page)).toHaveText('🔴 Aversión a las pérdidas detectado');
    // La opción pulsada se deshabilita y el navegador suelta el foco: medido BODY el 17/11/2026.
    expect(await dondeEstaElFoco(page)).not.toBe('BODY');
    // Y el veredicto no está en ninguna región viva: quien usa lector de pantalla no oye nada.
    const anunciado = await veredicto(page).evaluate((p) => {
      for (let n: Element | null = p; n; n = n.parentElement) {
        if (n.getAttribute('aria-live') || ['status', 'alert'].includes(n.getAttribute('role') ?? '')) return true;
      }
      return document.activeElement === p || (document.activeElement?.contains(p) ?? false);
    });
    expect(anunciado).toBe(true);
  });

  test('REPARADO (hallazgo 4909) — tras «Empezar» y «Siguiente» el foco caía a <body> y el Tab saltaba las opciones', async ({ page }) => {
    // REPARADO 17/11/2026: foco al título del escenario con enfocarALaVista (lib/cromoFijo.ts).
    await abrir(page);
    await page.getByRole('button', { name: /Empezar simulación/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Escenario 1 de 8')).toBeVisible();
    expect(await dondeEstaElFoco(page), 'tras «Empezar simulación»').not.toBe('BODY');

    await opciones(page).nth(1).click();
    await botonSiguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Escenario 2 de 8')).toBeVisible();
    // Medido el 17/11/2026: BODY, y el primer Tab aterriza en «⬇️ Ver guía educativa», por
    // DEBAJO de las tres opciones del escenario 2. La receta ya existe en la familia de quizzes
    // (cabo C0018): foco al enunciado nuevo con `enfocarALaVista` de lib/cromoFijo.ts.
    expect(await dondeEstaElFoco(page), 'tras «Siguiente escenario»').not.toBe('BODY');
    await page.keyboard.press('Tab');
    expect(await dondeEstaElFoco(page)).toMatch(/^BUTTON\[aria-pressed\]/);
  });

  test('REPARADO (hallazgo 4910) — dos cifras del resultado no llegaban a 3:1 (moderado en claro, alto en oscuro)', async ({ page }) => {
    // REPARADO 17/11/2026: --rojo-texto, --ambar-texto y --verde-texto, que cambian con el tema.
    await abrir(page);
    await empezar(page);
    await contestar(page, [0, 2, 1, 0, 1, 1, 1, 1]); // 2 altos / 1 moderado / 5
    await esperarPaginaAsentada(page);
    // `style={{ color: '#ca8a04' }}` sobre rgb(250, 250, 250): 2,81:1 medido. Texto grande → 3:1.
    expect(await contrasteSobreFondoReal(cifra(page, MODERADO))).toBeGreaterThanOrEqual(3);
    await ponerTema(page, 'dark');
    // `style={{ color: '#dc2626' }}` sobre rgb(53, 53, 53): 2,52:1 medido.
    expect(await contrasteSobreFondoReal(cifra(page, ALTO))).toBeGreaterThanOrEqual(3);
  });

  test('REPARADO (hallazgo 4911) — el JSON-LD salía con `featureList` vacío', async ({ page }) => {
    // REPARADO 17/11/2026: seis características vistas en la app.
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const app = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === 'WebApplication');
    expect(app).toBeDefined();
    // `features: []` en metadata.ts → `"featureList": []`. §1.ter pide de 4 a 8.
    expect((app?.featureList as unknown[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  test('REPARADO (hallazgo 4912) — Kahneman y Tversky «demostraron»: marcos conductuales presentados como leyes', async ({ page }) => {
    // REPARADO 17/11/2026: «estudiando», «estimaron», «identificaron» y «popularizó un modelo».
    await abrir(page);
    // §1.quinquies.3 nombra precisamente a Kahneman: «propuso», «identificó», «estimó».
    await expect(page.locator('main')).not.toContainText('llevan décadas demostrando');
    await empezar(page);
    await contestar(page, [0, 1, 0, 0, 0, 0, 0, 0]); // las 8 tarjetas, para leer sus descripciones
    await expect(page.locator('main')).not.toContainText('Kahneman demostró');
    await expect(page.locator('main')).toContainText('Kahneman y Amos Tversky estimaron');
    await page.getByRole('button', { name: /guía educativa/i }).click();
    const parrafo = page.locator('[data-guia-educativa] p', { hasText: /Kahneman y Amos Tversky/ });
    await expect(parrafo).toBeVisible();
    await expect(parrafo).not.toContainText('demostraron');
    await expect(parrafo).not.toContainText('El resultado es predecible');
    await expect(parrafo).toContainText('popularizó un modelo de dos sistemas');
  });

  test('REPARADO (hallazgo 4913) — «el 80 % … por encima de la media, lo que matemáticamente es imposible»', async ({ page }) => {
    // REPARADO 17/11/2026: retirada la cifra sin fuente y la imposibilidad que no lo es.
    await abrir(page);
    await empezar(page);
    await contestar(page, [0, 1, 0, 0, 0, 0, 0, 0]);
    // Que más de la mitad supere la MEDIA es posible: en {0, 10, 10, 10, 10} la media es 8 y el
    // 80 % la supera. Lo imposible es superar la MEDIANA. Y el 80 % va sin fuente ni año.
    await expect(page.locator('main')).not.toContainText('matemáticamente es imposible');
    await expect(page.locator('main')).toContainText('creerse mejor que la mayoría');
  });

  test('REPARADO (hallazgo 4914) — escenario 6: «S&P 500» sin matiz, SPIVA sin año ni región y una frase al revés', async ({ page }) => {
    // REPARADO 17/11/2026: «un índice amplio del mercado en el que inviertes» y sin la cifra de
    // SPIVA, que no se pudo citar con año y región; la FAQ visible tampoco la usa ya de prueba.
    await abrir(page);
    await empezar(page);
    await irAlEscenario(page, 6);
    // Para un inversor de España o Latinoamérica que elige acciones, el S&P 500 no es «su» índice
    // de referencia (§1.quinquies.5 lo nombra).
    await expect(page.locator('main')).not.toContainText('con la del índice S&P 500 en ese período');
    await opciones(page).nth(0).click();
    await expect(veredicto(page)).toBeVisible();
    // Sin esperar a un párrafo con SPIVA que ya no existe (un innerText() sobre él agotaba el test).
    const texto = (await page.locator('main p').allInnerTexts()).find((t) => t.includes('SPIVA')) ?? '';
    // «El 85-90 % de los fondos … no baten al índice. Para los inversores individuales el
    // porcentaje es aún menor» dice que FALLAN MENOS los particulares, lo contrario de lo que quiere.
    expect(texto).not.toContain('el porcentaje es aún menor');
    // Y si cita SPIVA, con su año (los informes cambian cada semestre y por región)
    expect(!texto.includes('SPIVA') || /SPIVA[^.]*\b(19|20)\d{2}\b/.test(texto)).toBe(true);
    await expect(page.locator('main')).toContainText('un índice amplio del mercado en el que inviertes');
    await expect(page.locator('main')).toContainText('incluso para la gestión profesional');
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).not.toContain('SPIVA');
  });

  test('ABIERTO — euros y porcentajes pegados a la cifra («2.000€», «50%»)', async ({ page }) => {
    test.fail();
    await abrir(page);
    await empezar(page);
    // Formato español del CLAUDE.md global §2: «1.234,56 €» y «15 %» (30 apariciones en page.tsx).
    await expect(opciones(page).nth(0)).toHaveText(/2\.000\s€/);
    await expect(opciones(page).nth(1)).toHaveText(/50\s%/);
  });
});

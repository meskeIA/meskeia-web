import { test, expect, type Page, type Locator } from '@playwright/test';
import { contrasteSobreFondoReal } from './_contraste';
import { asentarAntesDeTraducir } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * Inspector — visualizador-reacciones-quimicas (segmento interactiva, riesgo 3). Primera
 * inspección: 08/11/2026.
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Tipos de Reacciones Químicas»; subtítulo «Síntesis, descomposición, desplazamiento y
 *   combustión, con ejemplos del día a día». Title «… Ejemplos con Átomos Animados», description
 *   «explicados con átomos animados», featureList «5 tipos de reacciones con animación de átomos».
 *   Cuatro secciones (botones aria-pressed): ¿Qué es? (2H₂ + O₂ → 2H₂O dibujada en átomos), Tipos
 *   (5 tipos con su ecuación y un diagrama de átomos antes/después), Balanceo (3 ecuaciones con
 *   coeficientes +/− entre 1 y 10, conteo de átomos y veredicto) y Día a día (6 tarjetas
 *   desplegables). Sin inputs, sin masas molares ni entalpías: la verdad comprobable es que cada
 *   ecuación esté AJUSTADA, que lleve su tipo, que el conteo y el veredicto del balanceo cuadren y
 *   que los diagramas conserven los átomos de su ecuación.
 *
 * DÓNDE VIVEN LOS DATOS
 *   Todo en app/visualizador-reacciones-quimicas/page.tsx (TIPOS_REACCION, ECUACIONES_BALANCEO,
 *   REACCIONES_COTIDIANAS, contarAtomos). No importa de data/ ni de lib/calculadoras.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Agua H₂ + O₂ → H₂O. Con [1,1,1]: H 2/2, O 2/1 → no cuadra. Con [2,1,2]:
 *     H 2·2 = 4 / 2·2 = 4 y O 1·2 = 2 / 2·1 = 2 → cuadra. Propano C₃H₈ + O₂ → CO₂ + H₂O con
 *     [1,5,3,4]: C 3/3, H 8 / 4·2 = 8, O 5·2 = 10 / 3·2 + 4 = 10 → cuadra. Ecuaciones mostradas,
 *     contadas a mano lado a lado:
 *       4Fe + 3O₂ → 2Fe₂O₃ ................ Fe 4 · O 6 (síntesis)
 *       2H₂O → 2H₂ + O₂ ................... H 4 · O 2 (descomposición)
 *       Zn + 2HCl → ZnCl₂ + H₂ ............ Zn 1 · H 2 · Cl 2 (sustitución simple)
 *       NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂ ... Na 1 · H 1+4 = 5 · C 1+2 = 3 · O 3+2 = 5
 *       CH₄ + 2O₂ → CO₂ + 2H₂O ............ C 1 · H 4 · O 4 (combustión)
 *       2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O ..... C 16 · H 36 · O 50 (motor; 32 + 18 = 50)
 *     Diagramas de Tipos: síntesis Fe,Fe,O,O → Fe,O,Fe,O; descomposición H,O,H,O → H,H,O,O; doble
 *     Na,H,C,O → Na,O,C,H: conservan cada elemento y solo usan los de su ecuación.
 *
 *   CASO 2 (límite) — Fe + O₂ → Fe₂O₃: 12 pulsaciones de «+» en Fe dejan 10 (tope de la app);
 *     «−» desde 1 deja 1. [4,3,2]: Fe 4 / 2·2 = 4, O 3·2 = 6 / 2·3 = 6 → cuadra. Agua [4,2,4]
 *     (múltiplo de la mínima): H 8/8, O 4/4 → también cuadra, y es correcto: está ajustada,
 *     aunque no con los menores enteros. Teclado: Enter y Espacio sobre «+» suman 1 cada uno.
 *     Móvil 390 px: sin desbordamiento horizontal en las cuatro secciones.
 *
 *   CASO 3 (rechazo) — Agua [2,2,2]: H 4/4 pero O 4/2 → «Aún no cuadra», con la fila del O en rojo.
 *     Propano [1,5,3,3]: H 8/6 y O 10 / 6 + 3 = 9 → «Aún no cuadra». «Reiniciar» vuelve a 1,1,1,1.
 *
 * Los casos se ejecutaron antes con Playwright (node_modules/playwright, sin MCP) contra la copia
 * del Inspector y coincidieron con la resolución a mano. Los test.fail() son hallazgos ABIERTOS de
 * esta inspección: cuando se reparen, Playwright marcará el «fallo esperado» como inesperado;
 * entonces se quita el test.fail() y el comentario pasa a REPARADO.
 */

const RUTA = '/visualizador-reacciones-quimicas/';
const NAV = 'nav[aria-label="Secciones del visualizador"]';

/** La app no tiene inputs: se espera a que React cuelgue sus props del primer botón de sección. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tipos de Reacciones Químicas', { timeout: 60_000 });
  await page.waitForFunction(
    (sel) => {
      const b = document.querySelector(`${sel} button`);
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    NAV,
    { timeout: 30_000 },
  );
}

const seccion = (page: Page, nombre: string): Locator => page.locator(NAV).getByRole('button', { name: nombre, exact: true });
const estado = (page: Page): Locator => page.locator('[class*="estadoBalance"]');
const botonesTipo = (page: Page): Locator => page.locator('button[class*="tipoBtn"]');
const ladosTipo = (page: Page): Locator => page.locator('[class*="tipoDetalle"] [class*="ecuacionLado"]');

async function pulsar(page: Page, accion: 'Aumentar' | 'Reducir', formula: string, veces = 1): Promise<void> {
  const boton = page.getByRole('button', { name: `${accion} coeficiente de ${formula}`, exact: true });
  for (let i = 0; i < veces; i++) await boton.click();
}

async function coeficientes(page: Page): Promise<string> {
  // El número visible; desde el 08/11/2026 (hallazgo 4245) el valor lleva al lado, solo para el
  // lector de pantalla, «Coeficiente de H₂: 2» en un .sr-only
  return page
    .locator('[class*="coefValor"] > [aria-hidden="true"]')
    .evaluateAll((els) => els.map((e) => e.textContent).join(','));
}

/** Filas del conteo como «H 4/4» (elemento, reactivos/productos). */
async function conteo(page: Page): Promise<string[]> {
  return page.locator('[class*="conteoContainer"] [class*="conteoGrid"]').evaluateAll((filas) =>
    filas.slice(1).map((f) => {
      const n = f.querySelectorAll('[class*="conteoNumero"]');
      return `${f.querySelector('span[title]')?.textContent} ${n[0]?.textContent}/${n[1]?.textContent}`;
    }),
  );
}

/** Símbolos del diagrama «Antes» (0) o «Después» (1) del tipo seleccionado. */
async function diagrama(page: Page, lado: 0 | 1): Promise<string[]> {
  return ladosTipo(page).nth(lado).locator('span[title]').evaluateAll((els) => els.map((e) => e.textContent ?? ''));
}

const contar = (simbolos: string[]): Record<string, number> =>
  simbolos.reduce<Record<string, number>>((c, s) => ({ ...c, [s]: (c[s] ?? 0) + 1 }), {});

// ── Contador de átomos de una ecuación escrita con subíndices Unicode (sin paréntesis) ──
type Conteo = Record<string, number>;
const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉';

function contarLado(lado: string): Conteo {
  const c: Conteo = {};
  for (const bruto of lado.split(' + ')) {
    const termino = bruto.replace('↑', '').trim();
    const m = termino.match(/^(\d*)(.+)$/);
    if (!m) throw new Error(`Término ilegible: «${bruto}»`);
    const coef = m[1] ? Number(m[1]) : 1;
    const formula = m[2].replace(/[₀-₉]/g, (d) => String(SUBINDICES.indexOf(d)));
    for (const [, el, n] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
      c[el] = (c[el] ?? 0) + coef * (n ? Number(n) : 1);
    }
  }
  return c;
}

function contarEcuacion(ecuacion: string): { izq: Conteo; der: Conteo } {
  const [izq, der] = ecuacion.split(' → ');
  return { izq: contarLado(izq), der: contarLado(der) };
}

test.describe('CASO 1 · normal', () => {
  test('agua: [1,1,1] da H 2/2 · O 2/1 y no cuadra; [2,1,2] da H 4/4 · O 2/2 y cuadra', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    await expect(page.getByRole('button', { name: /Formación de agua/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await coeficientes(page)).toBe('1,1,1');
    expect(await conteo(page)).toEqual(['H 2/2', 'O 2/1']);
    await expect(estado(page)).toHaveText('❌ Aún no cuadra. Sigue ajustando los coeficientes.');

    await pulsar(page, 'Aumentar', 'H₂');
    await pulsar(page, 'Aumentar', 'H₂O');
    await expect.poll(() => coeficientes(page)).toBe('2,1,2');
    expect(await conteo(page)).toEqual(['H 4/4', 'O 2/2']);
    await expect(estado(page)).toHaveText('✅ ¡Ecuación balanceada! Los átomos cuadran a ambos lados.');
  });

  test('propano: [1,5,3,4] da C 3/3 · H 8/8 · O 10/10 y cuadra', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    await page.getByRole('button', { name: /Combustión del propano/ }).click();
    expect(await conteo(page)).toEqual(['C 3/1', 'H 8/2', 'O 2/3']);
    await pulsar(page, 'Aumentar', 'O₂', 4);
    await pulsar(page, 'Aumentar', 'CO₂', 2);
    await pulsar(page, 'Aumentar', 'H₂O', 3);
    await expect.poll(() => coeficientes(page)).toBe('1,5,3,4');
    expect(await conteo(page)).toEqual(['C 3/3', 'H 8/8', 'O 10/10']);
    await expect(estado(page)).toContainText('¡Ecuación balanceada!');
  });

  test('cada ecuación de Tipos y de Día a día está ajustada y lleva su tipo', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Tipos').click();
    const tipos: { nombre: string; ecuacion: string; atomos: Conteo }[] = [
      { nombre: 'Síntesis: A + B → AB', ecuacion: '4Fe + 3O₂ → 2Fe₂O₃', atomos: { Fe: 4, O: 6 } },
      { nombre: 'Descomposición: AB → A + B', ecuacion: '2H₂O → 2H₂ + O₂', atomos: { H: 4, O: 2 } },
      { nombre: 'Sustitución simple: A + BC → AC + B', ecuacion: 'Zn + 2HCl → ZnCl₂ + H₂', atomos: { Zn: 1, H: 2, Cl: 2 } },
      { nombre: 'Doble sustitución: AB + CD → AD + CB', ecuacion: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂', atomos: { Na: 1, H: 5, C: 3, O: 5 } },
      { nombre: 'Combustión: CₓHᵧ + O₂ → CO₂ + H₂O', ecuacion: 'CH₄ + 2O₂ → CO₂ + 2H₂O', atomos: { C: 1, H: 4, O: 4 } },
    ];
    for (const [i, t] of tipos.entries()) {
      await botonesTipo(page).nth(i).click();
      await expect(botonesTipo(page).nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[class*="tipoDetalleNombre"]')).toHaveText(t.nombre);
      await expect(page.locator('[class*="tipoEcuacion"]')).toHaveText(t.ecuacion);
      const { izq, der } = contarEcuacion(t.ecuacion);
      expect(izq, `${t.ecuacion} · reactivos`).toEqual(t.atomos);
      expect(der, `${t.ecuacion} · productos`).toEqual(t.atomos);
    }

    await seccion(page, 'Día a día').click();
    const cotidianas = [
      { titulo: 'Motor de combustión', tipo: 'Combustión', ecuacion: '2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O', atomos: { C: 16, H: 36, O: 50 } },
      { titulo: 'Vinagre + bicarbonato', tipo: 'Ácido-base', ecuacion: 'NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + CH₃COONa', atomos: { Na: 1, H: 5, C: 3, O: 5 } },
    ];
    for (const c of cotidianas) {
      const tarjeta = page.locator('button[class*="cotidianaCard"]').filter({ hasText: c.titulo });
      await tarjeta.click();
      await expect(tarjeta).toHaveAttribute('aria-expanded', 'true');
      await expect(tarjeta.locator('[class*="cotidianaTipo"]')).toHaveText(c.tipo);
      await expect(tarjeta.locator('[class*="cotidianaReaccion"]')).toHaveText(c.ecuacion);
      const { izq, der } = contarEcuacion(c.ecuacion);
      expect(izq, `${c.ecuacion} · reactivos`).toEqual(c.atomos);
      expect(der, `${c.ecuacion} · productos`).toEqual(c.atomos);
    }
  });

  test('los diagramas de síntesis, descomposición y doble sustitución conservan cada elemento y usan los de su ecuación', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Tipos').click();
    const casos = [
      { i: 0, elementos: ['Fe', 'O'], antes: { Fe: 2, O: 2 } },
      { i: 1, elementos: ['H', 'O'], antes: { H: 2, O: 2 } },
      { i: 3, elementos: ['Na', 'H', 'C', 'O'], antes: { Na: 1, H: 1, C: 1, O: 1 } },
    ];
    for (const c of casos) {
      await botonesTipo(page).nth(c.i).click();
      const antes = contar(await diagrama(page, 0));
      const despues = contar(await diagrama(page, 1));
      expect(antes).toEqual(c.antes);
      expect(despues).toEqual(antes);
      for (const s of Object.keys(antes)) expect(c.elementos).toContain(s);
    }
  });
});

test.describe('CASO 2 · límite', () => {
  test('Fe: 12 «+» dejan 10, «−» desde 1 deja 1, y [4,3,2] da Fe 4/4 · O 6/6 y cuadra', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    await page.getByRole('button', { name: /Óxido de hierro/ }).click();
    await pulsar(page, 'Aumentar', 'Fe', 12);
    await expect.poll(() => coeficientes(page)).toBe('10,1,1');
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await pulsar(page, 'Reducir', 'Fe');
    expect(await coeficientes(page)).toBe('1,1,1');
    expect(await conteo(page)).toEqual(['Fe 1/2', 'O 2/3']);
    await pulsar(page, 'Aumentar', 'Fe', 3);
    await pulsar(page, 'Aumentar', 'O₂', 2);
    await pulsar(page, 'Aumentar', 'Fe₂O₃');
    await expect.poll(() => coeficientes(page)).toBe('4,3,2');
    expect(await conteo(page)).toEqual(['Fe 4/4', 'O 6/6']);
    await expect(estado(page)).toContainText('¡Ecuación balanceada!');
    await page.getByRole('button', { name: 'Pista' }).click();
    await expect(page.locator('[class*="pistaBox"]')).toContainText('múltiplo de 3 en productos');
  });

  test('agua [4,2,4], múltiplo de la mínima, también cuadra (H 8/8 · O 4/4) y cada ecuación guarda sus coeficientes', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    await pulsar(page, 'Aumentar', 'H₂', 3);
    await pulsar(page, 'Aumentar', 'O₂');
    await pulsar(page, 'Aumentar', 'H₂O', 3);
    await expect.poll(() => coeficientes(page)).toBe('4,2,4');
    expect(await conteo(page)).toEqual(['H 8/8', 'O 4/4']);
    await expect(estado(page)).toContainText('¡Ecuación balanceada!');
    await page.getByRole('button', { name: /Combustión del propano/ }).click();
    expect(await coeficientes(page)).toBe('1,1,1,1');
    await page.getByRole('button', { name: /Formación de agua/ }).click();
    expect(await coeficientes(page)).toBe('4,2,4');
  });

  test('teclado: Enter abre la sección y Espacio y Enter sobre «+» suman uno cada uno', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').focus();
    await page.keyboard.press('Enter');
    await expect(seccion(page, 'Balanceo')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Aumentar coeficiente de H₂', exact: true }).focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    await expect.poll(() => coeficientes(page)).toBe('3,1,1');
    expect(await conteo(page)).toEqual(['H 6/2', 'O 2/1']);
  });
});

test.describe('CASO 3 · rechazo', () => {
  test('agua [2,2,2]: H 4/4 pero O 4/2 → «Aún no cuadra», con la fila del O en rojo', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    await pulsar(page, 'Aumentar', 'H₂');
    await pulsar(page, 'Aumentar', 'O₂');
    await pulsar(page, 'Aumentar', 'H₂O');
    await expect.poll(() => coeficientes(page)).toBe('2,2,2');
    expect(await conteo(page)).toEqual(['H 4/4', 'O 4/2']);
    await expect(estado(page)).toHaveText('❌ Aún no cuadra. Sigue ajustando los coeficientes.');
    const filaO = page.locator('[class*="conteoContainer"] [class*="conteoGrid"]').filter({ has: page.locator('span[title="Oxígeno"]') });
    await expect(filaO.locator('[class*="conteoMal"]')).toHaveCount(2);
  });

  test('propano [1,5,3,3]: H 8/6 y O 10/9 → «Aún no cuadra»; «Reiniciar» vuelve a 1,1,1,1', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    await page.getByRole('button', { name: /Combustión del propano/ }).click();
    await pulsar(page, 'Aumentar', 'O₂', 4);
    await pulsar(page, 'Aumentar', 'CO₂', 2);
    await pulsar(page, 'Aumentar', 'H₂O', 2);
    await expect.poll(() => coeficientes(page)).toBe('1,5,3,3');
    expect(await conteo(page)).toEqual(['C 3/3', 'H 8/6', 'O 10/9']);
    await expect(estado(page)).toContainText('Aún no cuadra');
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    expect(await coeficientes(page)).toBe('1,1,1,1');
    await expect(estado(page)).toContainText('Aún no cuadra');
  });
});

test.describe('móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('las cuatro secciones caben sin desbordar y el toque sube el coeficiente', async ({ page }) => {
    await abrir(page);
    for (const s of ['¿Qué es?', 'Tipos', 'Balanceo', 'Día a día']) {
      await seccion(page, s).tap();
      await expect(seccion(page, s)).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth), s).toBeLessThanOrEqual(390);
    }
    await seccion(page, 'Balanceo').tap();
    await page.getByRole('button', { name: /Combustión del propano/ }).tap();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.getByRole('button', { name: 'Aumentar coeficiente de O₂', exact: true }).tap();
    await expect.poll(() => coeficientes(page)).toBe('1,2,1,1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS 4239-4248 (08/11/2026), REPARADOS el mismo día
// ─────────────────────────────────────────────────────────────────────────────

test.describe('hallazgos del 08/11/2026 (reparados)', () => {
  // REPARADO el 08/11/2026 — antes:el diagrama de combustión crea un O y destruye un H: C,H,H,O,O → C,O,O,H,O
  test('combustión: el diagrama de átomos conserva cada elemento y usa los de CH₄ + 2O₂', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Tipos').click();
    await botonesTipo(page).nth(4).click();
    const antes = contar(await diagrama(page, 0));
    const despues = contar(await diagrama(page, 1));
    // A mano: antes C 1 · H 2 · O 2; después C 1 · O 3 · H 1 → no se conserva
    expect(despues).toEqual(antes);
  });

  // REPARADO el 08/11/2026 — antes:el diagrama de sustitución simple dibuja Fe + NaCl → FeCl + Na, no Zn + 2HCl
  test('sustitución simple: el diagrama usa los elementos de Zn + 2HCl → ZnCl₂ + H₂', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Tipos').click();
    await botonesTipo(page).nth(2).click();
    await expect(page.locator('[class*="tipoEcuacion"]')).toHaveText('Zn + 2HCl → ZnCl₂ + H₂');
    const simbolos = [...(await diagrama(page, 0)), ...(await diagrama(page, 1))];
    for (const s of simbolos) expect(['Zn', 'H', 'Cl'], `«${s}» no está en Zn + 2HCl`).toContain(s);
  });

  // REPARADO el 08/11/2026 — antes:title, description, featureList y «Pulsa cada tipo para ver la animación» prometen
  // átomos animados; los átomos no tienen ninguna animación (solo la flecha late)
  test('la promesa de «átomos animados» se cumple o no se hace', async ({ page }) => {
    await abrir(page);
    const promesa = await page.evaluate(() => {
      const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: string[] },
      );
      const app = ld.find((j) => j['@type'] === 'WebApplication');
      return [
        document.title,
        document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
        (app?.featureList ?? []).join(' | '),
      ].join(' || ');
    });
    await seccion(page, 'Tipos').click();
    const subtitulo = (await page.locator('[class*="seccionSubtitulo"]').textContent()) ?? '';
    await botonesTipo(page).nth(4).click();
    await page.waitForTimeout(150);
    const animacionesEnAtomos = await page
      .locator('[class*="tipoDetalle"] span[title]')
      .evaluateAll((els) => els.reduce((n, e) => n + e.getAnimations().filter((a) => !(a instanceof CSSTransition)).length, 0));
    const promete = /animad|animaci/i.test(`${promesa} || ${subtitulo}`);
    expect(!promete || animacionesEnAtomos > 0, `promete: «${promesa} || ${subtitulo}» · animaciones en átomos: ${animacionesEnAtomos}`).toBe(true);
  });

  // REPARADO el 08/11/2026 — antes:texto blanco sobre el color de datos del tipo activo: 4,11 · 4,23 · 2,16 · 2,78 · 3,68
  test('contraste: el nombre del tipo pulsado llega a 4,5:1 (13,12 px)', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    await seccion(page, 'Tipos').click();
    const bajos: string[] = [];
    for (let i = 0; i < 5; i++) {
      await botonesTipo(page).nth(i).click();
      const nombre = botonesTipo(page).nth(i).locator('[class*="tipoBtnNombre"]');
      const r = await contrasteSobreFondoReal(nombre);
      if (r < 4.5) bajos.push(`${await nombre.textContent()} ${r.toFixed(2)}`);
    }
    expect(bajos).toEqual([]);
  });

  // REPARADO el 08/11/2026 — antes:el título de la ficha en el color de datos, en claro: 2,16 (sustitución simple) y
  // 2,78 (doble sustitución) a 19,2 px en negrita, por debajo de 3:1
  test('contraste: el título de la ficha de cada tipo llega a 3:1 en claro (texto grande)', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    await seccion(page, 'Tipos').click();
    const bajos: string[] = [];
    for (let i = 0; i < 5; i++) {
      await botonesTipo(page).nth(i).click();
      const h3 = page.locator('[class*="tipoDetalleNombre"]');
      const r = await contrasteSobreFondoReal(h3);
      if (r < 3) bajos.push(`${await h3.textContent()} ${r.toFixed(2)}`);
    }
    expect(bajos).toEqual([]);
  });

  // REPARADO el 08/11/2026 — antes:símbolo blanco en el átomo de O (4,23), Na (2,16) y Cl (2,78), 13,12 px
  test('contraste: el símbolo de cada átomo llega a 4,5:1', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    const bajos = new Set<string>();
    const medir = async () => {
      for (const a of await page.locator('[class*="ecuacionLado"] span[title]').all()) {
        const r = await contrasteSobreFondoReal(a);
        if (r < 4.5) bajos.add(`${await a.textContent()} ${r.toFixed(2)}`);
      }
    };
    await medir();
    await seccion(page, 'Tipos').click();
    for (const i of [2, 3]) {
      await botonesTipo(page).nth(i).click();
      await medir();
    }
    expect([...bajos]).toEqual([]);
  });

  // REPARADO el 08/11/2026 — antes:en oscuro «Aún no cuadra» cae a #e74c3c (--rojo del módulo, porque --rojo-texto vale
  // initial) sobre su tinte: 4,12:1 a 15,2 px
  test('contraste: «Aún no cuadra» llega a 4,5:1 en oscuro', async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
    await activarTemaOscuro(page);
    await seccion(page, 'Balanceo').click();
    await expect(estado(page)).toContainText('Aún no cuadra');
    expect(await contrasteSobreFondoReal(estado(page))).toBeGreaterThanOrEqual(4.5);
  });

  // REPARADO el 08/11/2026 — antes:con la página traducida, el veredicto se queda en «Aún no cuadra» (con ✅ y fondo
  // verde) y el título de la ficha en «Síntesis» tras pulsar «Combustión»: texto con hermanos
  test('página traducida: el veredicto y el título de la ficha siguen al estado', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await abrir(page);
    const traducir = async () => {
      await asentarAntesDeTraducir(page);
      await page.evaluate(() => {
        const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => {
            const padre = n.parentElement;
            if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
            if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        const nodos: Text[] = [];
        while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
        for (const nodo of nodos) {
          const exterior = document.createElement('font');
          const interior = document.createElement('font');
          interior.textContent = nodo.nodeValue;
          exterior.appendChild(interior);
          nodo.parentNode?.replaceChild(exterior, nodo);
        }
      });
    };
    await seccion(page, 'Balanceo').click();
    await traducir();
    await pulsar(page, 'Aumentar', 'H₂');
    await pulsar(page, 'Aumentar', 'H₂O');
    await expect.poll(() => coeficientes(page)).toBe('2,1,2');
    await expect(estado(page)).toContainText('¡Ecuación balanceada!');
    await expect(estado(page)).not.toContainText('Aún no cuadra');

    await seccion(page, 'Tipos').click();
    await traducir();
    await botonesTipo(page).nth(4).click();
    await expect(page.locator('[class*="tipoEcuacion"]')).toHaveText('CH₄ + 2O₂ → CO₂ + 2H₂O');
    await expect(page.locator('[class*="tipoDetalleNombre"]')).toHaveText('Combustión: CₓHᵧ + O₂ → CO₂ + H₂O');
    expect(errores).toEqual([]);
  });

  // REPARADO el 08/11/2026 — antes:aria-label en un <span> sin rol: el árbol de accesibilidad lee «H H H H O O»
  test('lector de pantalla: cada átomo expone el nombre de su elemento', async ({ page }) => {
    await abrir(page);
    const arbol = await page.locator('[class*="ecuacionVisual"]').first().ariaSnapshot();
    expect(arbol).toContain('Hidrógeno');
    expect(arbol).toContain('Oxígeno');
  });

  // REPARADO el 08/11/2026 — antes:role="alert" (asertivo) con aria-live="polite": dos órdenes contradictorias
  test('lector de pantalla: el veredicto no mezcla role="alert" con aria-live="polite"', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Balanceo').click();
    const role = await estado(page).getAttribute('role');
    const vivo = await estado(page).getAttribute('aria-live');
    expect(role === 'alert' && vivo === 'polite', `role=${role} aria-live=${vivo}`).toBe(false);
  });

  // REPARADO el 08/11/2026 — antes:«unas 37.000.000.000.000 de reacciones por segundo» sin fuente (§1.quinquies.1)
  test('Día a día: la cifra de reacciones por segundo lleva fuente y año, o no está', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Día a día').click();
    const texto = (await page.locator('[class*="insightBox"] p').textContent()) ?? '';
    const tieneCifra = /37\.000\.000\.000\.000|37 billones/.test(texto);
    expect(!tieneCifra || /\b(19|20)\d{2}\b/.test(texto), texto).toBe(true);
  });

  // REPARADO el 08/11/2026 — antes:el FAQPage pregunta cinco cosas que la página no muestra (no hay FAQ visible)
  test('FAQPage: un solo bloque y sus preguntas están en la página', async ({ page }) => {
    await abrir(page);
    await comprobarFaqPageUnico(page);
  });
});

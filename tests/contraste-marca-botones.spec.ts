/**
 * Contraste del TEXTO BLANCO SOBRE LA MARCA (botones, pestañas, números de paso, distintivos),
 * medido en navegador en los DOS temas. Tanda 1 de la campaña del cabo C0070 (18/10/2026).
 *
 * La campaña cambió `var(--primary)` / `var(--secondary)` (y sus hexadecimales escritos a mano)
 * por `var(--primary-boton)` / `var(--secondary-boton)` en 2.844 reglas de 868 ficheros con
 * `scripts/contraste-marca/campana.mjs`, y 18 a mano. El candado
 * `scripts/check-contraste-marca.mjs` lo comprueba por la FORMA del código; esto lo comprueba
 * por el PÍXEL en una muestra de una app por forma:
 *
 *   · fondo sólido var(--primary)          → simulador-genetica
 *   · degradado primary → secondary        → calculadora-fov-video
 *   · hexadecimal #2E86AB escrito a mano   → afinador-instrumentos
 *   · override oscuro que reponía --primary → ajustar-ecuaciones-quimicas
 *   · bloque en una sola línea             → visualizador-vida-estrella
 *   · un botón con texto blanco cualquiera → generador-fichas-calculo, selector-modalidad-trabajo
 *
 * y dos de los 18 resueltos a mano, en el estado donde estaba el defecto:
 *
 *   · visualizador-piramide-poblacion: en OSCURO, `.btnAno:hover` pintaba el año en --primary
 *     sobre fondo --primary (1:1): `[data-theme='dark'] .btnAno` tiene su misma especificidad
 *     y va detrás.
 *   · falsos-amigos-ingles: el chip en HOVER, blanco sobre --accent (~2,2:1).
 *
 * Mide todo elemento VISIBLE con texto propio cuyo color pintado es blanco y cuyo fondo
 * —compuesto capa a capa, o cada parada si es un degradado— es un color de marca. El
 * instrumento, con las trampas de medir en navegador que cubre, está en `tests/_contraste.ts`.
 */
import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, MARCA, medirContraste, prepararParaMedir, type Medida } from './_contraste';

const UMBRAL = 4.5;

const APPS = [
  { slug: 'simulador-genetica', forma: 'fondo sólido var(--primary)' },
  { slug: 'calculadora-fov-video', forma: 'degradado primary → secondary' },
  { slug: 'afinador-instrumentos', forma: 'hexadecimal #2E86AB escrito a mano' },
  { slug: 'ajustar-ecuaciones-quimicas', forma: 'override oscuro que reponía --primary' },
  { slug: 'visualizador-vida-estrella', forma: 'bloque en una sola línea' },
  { slug: 'generador-fichas-calculo', forma: 'botón con texto blanco' },
  { slug: 'selector-modalidad-trabajo', forma: 'botón con texto blanco' },
] as const;

/** Peor contraste del texto BLANCO sobre un fondo de MARCA (`selector` acota, p. ej. un hover). */
async function peorBlancoSobreMarca(page: Page, selector = '*'): Promise<Medida> {
  return medirContraste(page, { selector, texto: 'blanco' });
}

/**
 * Tanda 2: peor contraste del texto pintado con un color de marca (sin el acento, que no tiene
 * token). El texto de marca sobre un TINTE de marca se informa aparte en `tinte`: es de C0278.
 */
async function peorTextoDeMarca(page: Page): Promise<Medida> {
  const sinAcento = MARCA.slice(0, 6);
  return medirContraste(page, { texto: sinAcento, separarTinteDe: sinAcento });
}

for (const { slug, forma } of APPS) {
  test(`${slug} (${forma}): el texto blanco sobre la marca cumple 4,5:1 en claro y en oscuro`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);

    const claro = await peorBlancoSobreMarca(page);
    expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(0);
    expect(claro.ratio, `claro, peor: «${claro.texto}» sobre ${claro.fondo}`).toBeGreaterThanOrEqual(UMBRAL);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await peorBlancoSobreMarca(page);
    expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThan(0);
    expect(oscuro.ratio, `oscuro, peor: «${oscuro.texto}» sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(UMBRAL);
  });
}

test('visualizador-piramide-poblacion: el año en HOVER se lee también en oscuro', async ({ page }) => {
  await page.goto('/visualizador-piramide-poblacion/');
  await prepararParaMedir(page);
  await activarTemaOscuro(page);
  // un año que NO sea el activo: el activo tiene su propia regla
  const botones = page.locator('button[class*="btnAno"]:not([class*="btnAnoActivo"])');
  await expect(botones.first()).toBeVisible();
  await botones.first().hover();
  const m = await peorBlancoSobreMarca(page, 'button[class*="btnAno"]');
  expect(m.ratio, `hover oscuro: ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(UMBRAL);
});

test('falsos-amigos-ingles: el chip en HOVER ya no es blanco sobre el acento', async ({ page }) => {
  await page.goto('/falsos-amigos-ingles/');
  await prepararParaMedir(page);
  const chip = page.locator('button[class*="chip"]:not([class*="chipActivo"])').first();
  await expect(chip).toBeVisible();
  await chip.hover();
  const m = await peorBlancoSobreMarca(page, 'button[class*="chip"]');
  // -1 = no queda texto blanco sobre la marca en los chips: es lo esperado tras la reparación
  expect(m.ratio === -1 || m.ratio >= UMBRAL, `chip en hover: ${JSON.stringify(m)}`).toBe(true);
});

// ─── Tanda 2: la marca como color de texto ────────────────────────────────────

/**
 * Una app por forma de la tanda 2 (6.142 reglas en 1.046 ficheros, 18/10/2026). En claro el
 * texto pasa de #2E86AB a #26718F; en oscuro queda en #3FA5D1, y se aclara donde el módulo
 * fijaba #2E86AB. Se mide en los DOS temas: al cambiar un token en uno, se mide el otro.
 */
const APPS_TEXTO = [
  { slug: 'simulador-movimiento-circular', forma: 'caso de origen: los textos que 8f5eb9b7 dejó en --primary' },
  { slug: 'vitaminas-minerales', forma: 'hexadecimal #2E86AB como texto' },
  { slug: 'visualizador-adaptaciones-plantas', forma: 'var(--primary, #2e86ab) con valor de reserva' },
  { slug: 'selector-tipo-gimnasio', forma: 'color: var(--primary)' },
  { slug: 'estimador-hipoteca', forma: 'color: var(--primary) en muchos bloques' },
  { slug: 'cifrado-playfair', forma: 'color: var(--primary)' },
  { slug: 'calculadora-rentabilidad-alquiler', forma: 'estilo en línea style={{ color }}' },
  { slug: 'curso-negociacion', forma: 'fondo claro FIJO: el CTA blanco pasa a -boton' },
] as const;

for (const { slug, forma } of APPS_TEXTO) {
  test(`${slug} (${forma}): el texto de marca cumple en claro y en oscuro`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);

    const anotarTinte = (tema: string, m: Medida) => {
      if (m.tinte && m.tinte.ratio < m.tinte.umbral) {
        test.info().annotations.push({ type: 'C0278 · texto de marca sobre tinte', description: `${tema}: «${m.tinte.texto}» ${m.tinte.ratio}:1 sobre ${m.tinte.fondo}` });
      }
    };
    const claro = await peorTextoDeMarca(page);
    anotarTinte('claro', claro);
    expect(claro.ratio, `claro: ${JSON.stringify(claro)}`).toBeGreaterThan(0);
    expect(claro.ratio, `claro, peor: ${JSON.stringify(claro)}`).toBeGreaterThanOrEqual(claro.umbral);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await peorTextoDeMarca(page);
    anotarTinte('oscuro', oscuro);
    expect(oscuro.ratio, `oscuro: ${JSON.stringify(oscuro)}`).toBeGreaterThan(0);
    expect(oscuro.ratio, `oscuro, peor: ${JSON.stringify(oscuro)}`).toBeGreaterThanOrEqual(oscuro.umbral);
  });
}

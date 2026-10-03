/**
 * Test de regresión — /simulador-estequiometria/ (origen: /inspector, primera inspección 03/10/2026)
 *
 * Qué promete la app (h1 + subtítulo + metadata): «Introduce la masa de cada reactivo y descubre
 * cuál es el reactivo limitante, cuánto producto se obtiene y cuánto exceso sobra», con «barras de
 * moles visuales (disponibles vs necesarios) para cada reactivo», 6 reacciones ajustadas y un
 * deslizador de rendimiento. Contra eso se mide todo lo de aquí abajo.
 *
 * MASAS MOLARES. Referencia: pesos atómicos estándar IUPAC/CIAAW 2021 (abreviados), los mismos que
 * cita `app/tabla-periodica/elementos-data.ts`: H 1,008 · C 12,011 · N 14,007 · O 15,999 ·
 * Na 22,990 · Cl 35,45 · Fe 55,845. La app usa sus propios redondeos (CH₄ 16,04 · O₂ 32,00 ·
 * CO₂ 44,01 · H₂O 18,02 · H₂ 2,016 · HCl 36,46 · NaOH 40,00 · NaCl 58,44 · N₂ 28,02 ·
 * NH₃ 17,03 · Fe 55,85 · Fe₂O₃ 159,7 · glucosa 180,16 · etanol 46,07). Los casos de cálculo se
 * resuelven con LOS DE LA APP; las discrepancias con la IUPAC van en sus propios bloques de dato.
 *
 * AJUSTE de las 6 ecuaciones, comprobado a mano átomo a átomo (todas cuadran):
 *   CH₄ + 2 O₂ → CO₂ + 2 H₂O        C 1=1 · H 4=4 · O 4=2+2
 *   2 H₂ + O₂ → 2 H₂O               H 4=4 · O 2=2
 *   HCl + NaOH → NaCl + H₂O         H 2=2 · Cl 1 · Na 1 · O 1
 *   N₂ + 3 H₂ → 2 NH₃               N 2=2 · H 6=6
 *   4 Fe + 3 O₂ → 2 Fe₂O₃           Fe 4=4 · O 6=6
 *   C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂      C 6=4+2 · H 12=12 · O 6=2+4
 *
 * Lo que hoy falla va dentro de `test.fail()` con «ABIERTO, hallazgo (inspector 03/10/2026)»:
 * el spec queda en verde y se pone en rojo cuando se repare (entonces se quita el `.fail`).
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * stemum.com → el servidor local, para medir la app como la sirve el portal (data-brand="stemum",
 * que cambia --primary y --secondary). Va al NIVEL DEL FICHERO porque `launchOptions` fuerza un
 * worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

const RUTA = '/simulador-estequiometria/';

const tarjeta = (page: Page, rotulo: string) =>
  page.locator('[class*="resultadoCard"]').filter({ hasText: rotulo });
const barra = (page: Page, reactivo: string) =>
  page.locator('[class*="barGroup"]').filter({ hasText: reactivo });
const aviso = (page: Page) => page.locator('[class*="resultadoPanel"][role="alert"]');

async function abrir(page: Page, url = RUTA): Promise<void> {
  await page.goto(url);
  await esperarHidratacion(page, ['#inputA', '#sliderRendimiento']);
}

/** Elige una reacción por su nombre. Ninguna de las usadas aquí es la inicial (combustión). */
async function elegir(page: Page, nombre: RegExp): Promise<void> {
  const boton = page.getByRole('button', { name: nombre });
  await expect(boton).toHaveAttribute('aria-pressed', 'false');
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function escribir(page: Page, sel: string, valor: string): Promise<void> {
  await page.locator(sel).fill(valor);
  await esperarValorEnReact(page, sel, valor);
}

/** Contraste WCAG del primer elemento que casa, componiendo los fondos semitransparentes. */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    type C = { r: number; g: number; b: number; a: number };
    const parse = (c: string): C | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const mezcla = (s: C, d: C): C => ({
      r: s.r * s.a + d.r * (1 - s.a),
      g: s.g * s.a + d.g * (1 - s.a),
      b: s.b * s.a + d.b * (1 - s.a),
      a: 1,
    });
    const lum = ({ r, g, b }: C) => {
      const f = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const el = document.querySelector(sel);
    if (!el) throw new Error(`No existe ${sel}`);
    const capas: C[] = [];
    let n: Element | null = el;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a === 1) break;
      }
      n = n.parentElement;
    }
    let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo);
    let opacidad = 1;
    for (let m: Element | null = el; m; m = m.parentElement) opacidad *= Number(getComputedStyle(m).opacity);
    const texto = parse(getComputedStyle(el).color)!;
    const color = mezcla({ ...texto, a: texto.a * opacidad }, fondo);
    const [l1, l2] = [lum(color), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, selector);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASO NORMAL — combustión del metano, 10 g de CH₄ + 30 g de O₂, rendimiento 75 %
//   n(CH₄) = 10 / 16,04 = 0,623441 mol → razón 0,623441 / 1 = 0,623441
//   n(O₂)  = 30 / 32,00 = 0,9375 mol   → razón 0,9375 / 2   = 0,46875  → O₂ LIMITANTE
//   n(CO₂) = 0,9375 × 1/2 = 0,46875 mol → 0,46875 × 44,01 = 20,6296875 g → «20,630 g», «0,4688 mol»
//   real   = 20,6296875 × 0,75 = 15,472265625 g → «15,472 g»
//   exceso CH₄: 0,623441 − 0,46875 = 0,154691 mol → 10 − 0,46875 × 16,04 = 2,48125 g → «2,481 g», «0,1547 mol»
// ─────────────────────────────────────────────────────────────────────────────────────────────
async function sembrarCaso1(page: Page): Promise<void> {
  await abrir(page);
  await escribir(page, '#inputA', '10');
  await escribir(page, '#inputB', '30');
  await sembrarValor(page, '#sliderRendimiento', 75);
}

async function comprobarCaso1(page: Page): Promise<void> {
  await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Oxígeno');
  const teorica = tarjeta(page, 'Masa teórica de Dióxido de carbono');
  await expect(teorica).toContainText('20,630 g');
  await expect(teorica).toContainText('0,4688 mol');
  await expect(tarjeta(page, 'Masa real obtenida')).toContainText('15,472 g');
  const exceso = tarjeta(page, 'Reactivo en exceso');
  await expect(exceso).toContainText('Metano');
  await expect(exceso).toContainText('Sobran 2,481 g (0,1547 mol)');
  // la fórmula resaltada en la ecuación es la del limitante
  await expect(page.locator('[class*="limitanteResaltado"]')).toHaveText(/^O₂\s*$/);
}

test.describe('cálculo — escritorio', () => {
  test('caso normal: 10 g CH₄ + 30 g O₂ al 75 % → O₂ limitante, 20,630 g de CO₂, 15,472 g reales, sobran 2,481 g de CH₄', async ({ page }) => {
    await sembrarCaso1(page);
    await comprobarCaso1(page);
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — las barras de moles comparan los moles de UN
  // reactivo con los «necesarios» del OTRO. En el código: barra A = molesA / molesBNecesarios,
  // que es siempre coefA/coefB (50 % fijo en la combustión), y su rótulo «necesarios» es el del O₂.
  // Esperado (mismo caso 1):
  //   CH₄: disponibles 0,6234 · necesarios para gastar todo el O₂ = 0,9375 × 1/2 = 0,46875 → «0,4688»
  //        → 0,6234 / 0,4688 = 133 % → tope 100
  //   O₂:  disponibles 0,9375 · necesarios para gastar todo el CH₄ = 0,623441 × 2 = 1,246883 → «1,2469»
  //        → 0,9375 / 1,246883 = 75,19 % → 75
  test.fail('barras de moles (caso 1): cada fila compara los moles de SU reactivo', async ({ page }) => {
    await sembrarCaso1(page);
    const ch4 = barra(page, 'Metano (CH₄)');
    const o2 = barra(page, 'Oxígeno (O₂)');
    await expect(ch4).toContainText('0,6234 mol disponibles / 0,4688 mol necesarios');
    await expect(ch4.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '100');
    await expect(o2).toContainText('0,9375 mol disponibles / 1,2469 mol necesarios');
    await expect(o2.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '75');
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — mismo defecto, visto en los valores por defecto de
  // la oxidación del hierro (100 g Fe, 50 g O₂): el limitante sale con la barra LLENA y el exceso a
  // medias, justo al revés de lo que la barra pretende enseñar.
  //   n(Fe) = 100 / 55,85 = 1,790510 mol → razón /4 = 0,447628 → Fe LIMITANTE
  //   n(O₂) = 50 / 32 = 1,5625 mol      → razón /3 = 0,520833
  //   Fe necesario para gastar todo el O₂ = 1,5625 × 4/3 = 2,083333 → 1,7905 / 2,0833 = 85,9 % → 86
  //   O₂ necesario para gastar todo el Fe = 1,790510 × 3/4 = 1,342883 → 1,5625 / 1,3429 > 1 → 100
  test.fail('barras de moles (hierro por defecto): el limitante no sale con la barra llena', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Oxidación del hierro/);
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hierro');
    const fe = barra(page, 'Hierro (Fe)');
    await expect(fe).toContainText('1,7905 mol disponibles / 2,0833 mol necesarios');
    await expect(fe.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '86');
    await expect(barra(page, 'Oxígeno (O₂)').locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '100');
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────
  // LÍMITE — neutralización en proporción exacta: 36,46 g HCl + 40 g NaOH
  //   n(HCl) = 36,46 / 36,46 = 1 mol · n(NaOH) = 40 / 40,00 = 1 mol → razones 1 = 1 (estequiométrica)
  //   n(NaCl) = 1 × 1/1 = 1 mol → 1 × 58,44 = «58,440 g», «1,0000 mol»
  //   rendimiento 0 % → masa real «0,000 g»
  // ─────────────────────────────────────────────────────────────────────────────────────────
  test('límite: 36,46 g HCl + 40 g NaOH → 58,440 g de NaCl (1,0000 mol); al 0 % de rendimiento, 0,000 g', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await escribir(page, '#inputA', '36.46'); // el valor por defecto era 36.5
    // testigo de que el estado cambió: con 36,5 g sobraban 36,5 − 36,46 = 0,040 g de HCl
    await expect(tarjeta(page, 'Reactivo en exceso')).not.toContainText('Sobran 0,040 g');
    const teorica = tarjeta(page, 'Masa teórica de Cloruro de sodio');
    await expect(teorica).toContainText('58,440 g');
    await expect(teorica).toContainText('1,0000 mol');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('58,440 g');
    await sembrarValor(page, '#sliderRendimiento', 0);
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('0,000 g');
    await expect(teorica).toContainText('58,440 g');
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — en la mezcla estequiométrica exacta la app declara
  // limitante el reactivo A (por el `<=`) y «Reactivo en exceso: Hidróxido de sodio — Sobran 0,000 g
  // (0,0000 mol)». La rama «Ninguno (estequiométrico)» que promete la FAQ («si el resultado muestra
  // "Ninguno (estequiométrico)" … es que los ratios son iguales») no se alcanza nunca: `exceso` no
  // es null en ninguna reacción con dos reactivos.
  test.fail('límite: con razones iguales no hay reactivo en exceso («Ninguno (estequiométrico)»)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await escribir(page, '#inputA', '36.46');
    await expect(tarjeta(page, 'Masa teórica de Cloruro de sodio')).toContainText('58,440 g');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Ninguno (estequiométrico)');
  });

  // LÍMITE — reacción con catalizador: fermentación, 90 g de glucosa (valor por defecto al elegirla)
  //   n(glucosa) = 90 / 180,16 = 0,499556 mol → etanol 2 × 0,499556 = 0,999112 mol → «0,9991 mol»
  //   masa = 0,999112 × 46,07 = 46,029 g → «46,029 g». Sin campo B ni tarjeta de exceso.
  test('límite: fermentación con 90 g de glucosa → 46,029 g de etanol, sin reactivo en exceso', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Fermentación alcohólica/);
    await expect(page.locator('#inputB')).toHaveCount(0);
    const teorica = tarjeta(page, 'Masa teórica de Etanol');
    await expect(teorica).toContainText('46,029 g');
    await expect(teorica).toContainText('0,9991 mol');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Glucosa');
    await expect(tarjeta(page, 'Reactivo en exceso')).toHaveCount(0);
  });

  // RECHAZO — masa negativa, campo vacío y letras: ningún resultado, aviso de la app
  test('rechazo: −5 g, vacío y «abc» no calculan y muestran el aviso', async ({ page }) => {
    await abrir(page);
    const mensaje = 'Introduce gramos válidos y positivos para ver los resultados.';

    await escribir(page, '#inputA', '-5');
    await expect(aviso(page)).toHaveText(mensaje);
    await expect(page.locator('[class*="resultadoCard"]')).toHaveCount(0);
    await expect(page.locator('[role="progressbar"]')).toHaveCount(0);

    await escribir(page, '#inputA', '12');
    await expect(aviso(page)).toHaveCount(0);

    await escribir(page, '#inputA', '');
    await expect(aviso(page)).toHaveText(mensaje);

    // un input numérico no admite letras: el valor se queda vacío y el aviso sigue
    await page.locator('#inputA').pressSequentially('abc');
    await esperarValorEnReact(page, '#inputA', '');
    await expect(aviso(page)).toHaveText(mensaje);
    await expect(page.locator('body')).not.toContainText('NaN');
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — los botones ± redondean el valor a un decimal:
  // `Math.round((actual + delta) * 10) / 10`. Esperado: 36,46 + 1 = 37,46 · obtenido: 37,5.
  test.fail('operativa: el botón + suma 1 g sin redondear lo escrito (36,46 → 37,46)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await escribir(page, '#inputA', '36.46');
    await page.getByRole('button', { name: 'Aumentar gramos de reactivo A' }).click();
    await expect(page.locator('#inputA')).toHaveValue('37.46');
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — M(N₂) = 2 × 14,007 = 28,014 g/mol (IUPAC/CIAAW 2021);
  // la app usa 28,02, que no es el redondeo de 28,014 ni a dos decimales (28,01). El defecto es de
  // 0,006 g/mol: basta con exigir que lo mostrado sea el redondeo correcto a sus propios decimales.
  test.fail('dato: la masa molar del N₂ es 28,014 g/mol (o su redondeo correcto)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Haber-Bosch/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 28.014);
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — el rótulo «M = … g/mol» se imprime con TRES decimales
  // (`formatNumber(masaMolar, 3)`) de un dato que tiene dos, y el tercero rellenado con 0 es falso:
  // CH₄ «16,040» (IUPAC 12,011 + 4 × 1,008 = 16,043) · O₂ «32,000» (31,998) · HCl «36,460» (36,458)
  // · NaOH «40,000» (39,997) · Fe «55,850» (55,845) · glucosa «180,160» (180,156).
  test.fail('contenido: las masas molares mostradas son el redondeo correcto de la IUPAC', async ({ page }) => {
    await abrir(page);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 16.043); // CH₄
    await expectMasaMolarBienRedondeada(page, 'label[for="inputB"]', 31.998); // O₂
    await elegir(page, /Neutralización ácido-base/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 36.458); // HCl
    await expectMasaMolarBienRedondeada(page, 'label[for="inputB"]', 39.997); // NaOH
    await elegir(page, /Oxidación del hierro/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 55.845); // Fe
    await elegir(page, /Fermentación alcohólica/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 180.156); // glucosa
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — «15 %» con espacio duro (regla del 25/09/2026).
  // Hoy: «Rendimiento de la reacción: 100%» y «Masa real obtenida (rendimiento 100%)».
  test.fail('formato: el % del rendimiento va separado de la cifra con espacio duro', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('label[for="sliderRendimiento"]')).toContainText('100 %');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('rendimiento 100 %');
  });
});

/** Que el número de «M = … g/mol» sea el redondeo de `iupac` a los decimales que muestra. */
async function expectMasaMolarBienRedondeada(page: Page, etiqueta: string, iupac: number): Promise<void> {
  const texto = (await page.locator(etiqueta).textContent()) ?? '';
  const m = texto.match(/M = ([\d.]*\d(?:,(\d+))?) g\/mol/);
  expect(m, `sin «M = … g/mol» en «${texto}»`).not.toBeNull();
  const mostrado = Number(m![1].replace(/\./g, '').replace(',', '.'));
  const decimales = m![2]?.length ?? 0;
  expect(
    Math.abs(mostrado - iupac),
    `«${m![0]}» no es el redondeo de ${iupac} a ${decimales} decimales`,
  ).toBeLessThanOrEqual(0.5 * 10 ** -decimales + 1e-9);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// MÓVIL (390 px) — el mismo caso normal, y la sospecha del turno de noche (03/10/2026): «a 390 px
// la página mide 399 px». Localizado: la columna de `.inputsGrid` (`1fr` = minmax(auto, 1fr)) toma
// el ancho mínimo de su contenido, 350 px, porque el `<input type="number">` aporta su ancho
// intrínseco (246 px) aunque lleve `min-width: 80px`. La columna empieza en x = 49, así que acaba
// SIEMPRE en x = 399, a cualquier ancho; `html, body { overflow-x: hidden }` recorta lo que sobra
// sin dejar desplazarse. Medido: a 360 px los dos «+» (x 363–399) y el «100%» del rendimiento
// (x 360–399) quedan enteros fuera de la pantalla; a 375 px se ven 12 de 36 px del «+»; a 390 px,
// 27 de 36; a 412 px cabe en pantalla pero el «+» sobresale 11 px de la tarjeta.
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('caso normal en móvil: mismos resultados que en escritorio', async ({ page }) => {
    await sembrarCaso1(page);
    await comprobarCaso1(page);
  });

  async function medirDesborde(page: Page) {
    return page.evaluate(() => {
      const ancho = window.innerWidth;
      const tarjetaInputs = document.querySelector('#inputA')!.closest('[class*="inputsGrid"]')!.getBoundingClientRect();
      const mas = Array.from(document.querySelectorAll('button[aria-label^="Aumentar gramos"]')).map((b) => b.getBoundingClientRect().right);
      const valorRendimiento = document.querySelector('label[for="sliderRendimiento"] strong')!.getBoundingClientRect().right;
      return { ancho, bodyScroll: document.body.scrollWidth, borde: tarjetaInputs.right, mas, valorRendimiento };
    });
  }

  // ABIERTO, hallazgo (inspector 03/10/2026) — desbordamiento horizontal de la tarjeta de entradas.
  test.fail('a 390 px los controles caben en la tarjeta y en la pantalla', async ({ page }) => {
    await abrir(page);
    const d = await medirDesborde(page);
    expect(d.bodyScroll, 'ancho del contenido de <body>').toBeLessThanOrEqual(d.ancho);
    for (const derecha of d.mas) expect(derecha, 'borde derecho del «+»').toBeLessThanOrEqual(d.borde);
    expect(d.valorRendimiento, 'borde derecho del «100%» del rendimiento').toBeLessThanOrEqual(d.borde);
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — a 360 px (Android habitual) los «+» y el valor del
  // rendimiento no se ven en absoluto: su borde IZQUIERDO ya queda fuera de la pantalla.
  test.fail('a 360 px los «+» y el valor del rendimiento se ven', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await abrir(page);
    const d = await medirDesborde(page);
    for (const derecha of d.mas) expect(derecha, 'borde derecho del «+»').toBeLessThanOrEqual(d.ancho);
    expect(d.valorRendimiento, 'borde derecho del «100%»').toBeLessThanOrEqual(d.ancho);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// ACCESIBILIDAD
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('accesibilidad', () => {
  // ABIERTO, hallazgo (inspector 03/10/2026) — el rojo #c0392b del limitante no tiene variante
  // oscura. Sobre la tarjeta oscura #2D2D2D da 2,53:1 (texto de 13,6 px: exige 4,5) en la insignia
  // «Limitante» y en el VALOR de «Reactivo limitante»; la fórmula resaltada de la ecuación da
  // 2,21:1 sobre su fondo rojizo (22,4 px negrita: exige 3). En claro cumplen (5,44 y 4,69).
  test.fail('modo oscuro: el limitante se lee (≥ 4,5:1 el texto pequeño, ≥ 3:1 la fórmula grande)', async ({ page }) => {
    await abrir(page);
    await activarTema(page, 'dark');
    expect(await contraste(page, '[class*="resultadoCard"] [class*="limitanteBadge"]'), 'valor «Reactivo limitante»').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="barLabel"] [class*="limitanteBadge"]'), 'insignia «Limitante»').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="limitanteResaltado"]'), 'fórmula resaltada').toBeGreaterThanOrEqual(3);
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — botón de reacción activo: texto blanco sobre
  // var(--primary). En meskeia.com, claro: nombre 4,11:1 y tipo 2,92:1; oscuro: 2,79:1 y 2,14:1.
  // En stemum.com oscuro (--primary #C99BF5): 2,21:1 y 1,80:1. Texto pequeño (14 y 11,5 px): 4,5:1.
  test.fail('botón de reacción activo: el texto blanco sobre la marca llega a 4,5:1 en ambos temas', async ({ page }) => {
    await abrir(page);
    const nombre = '[class*="reaccionBtnActive"] > span:nth-child(2)';
    const tipo = '[class*="reaccionBtnActive"] [class*="tipoBadge"]';
    await activarTema(page, 'light');
    expect(await contraste(page, nombre), 'claro · nombre').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, tipo), 'claro · tipo').toBeGreaterThanOrEqual(4.5);
    await activarTema(page, 'dark');
    expect(await contraste(page, nombre), 'oscuro · nombre').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, tipo), 'oscuro · tipo').toBeGreaterThanOrEqual(4.5);
  });

  // Mismo hallazgo, visto como lo sirve el portal Stemum (data-brand="stemum").
  test.fail('stemum.com, oscuro: el botón de reacción activo llega a 4,5:1', async ({ page }) => {
    await page.goto(`http://stemum.com${RUTA}`);
    await esperarHidratacion(page, ['#inputA']);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await activarTema(page, 'dark');
    expect(await contraste(page, '[class*="reaccionBtnActive"] > span:nth-child(2)'), 'nombre').toBeGreaterThanOrEqual(4.5);
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — color de marca como TEXTO en claro (meskeia.com):
  // el valor de «Reactivo en exceso» en var(--secondary) da 2,80:1 (20,8 px negrita: exige 3), y
  // los títulos del bloque educativo en var(--primary) sobre #FAFAFA 3,93:1 (16 px: exige 4,5).
  test.fail('claro: el exceso y los títulos del bloque educativo alcanzan su umbral', async ({ page }) => {
    await abrir(page);
    await activarTema(page, 'light');
    expect(await contraste(page, '[class*="excesoBadge"]'), 'valor «Reactivo en exceso»').toBeGreaterThanOrEqual(3);
    expect(await contraste(page, '[class*="faqItem"] h4'), 'pregunta de la FAQ').toBeGreaterThanOrEqual(4.5);
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — los dos `role="progressbar"` no tienen nombre: el
  // lector anuncia «barra de progreso, 50» sin decir de qué reactivo es.
  test.fail('las barras de moles tienen nombre accesible con su reactivo', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('progressbar', { name: /Metano/ })).toHaveCount(1);
    await expect(page.getByRole('progressbar', { name: /Oxígeno/ })).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CONTENIDO del bloque educativo (está siempre en el DOM, aunque nazca colapsado)
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('contenido', () => {
  // ABIERTO, hallazgo (inspector 03/10/2026) — la FAQ dice «si tienes 16 g de CH₄ (1 mol) y 64 g de
  // O₂ (2 mol), ambos son exactamente estequiométricos», que son justo los valores por defecto. Con
  // la M = 16,04 de la propia app: 16 / 16,04 = 0,9975 mol < 1 → CH₄ limitante y sobran
  // 2 − 2 × 0,997506 = 0,004988 mol × 32 = 0,160 g de O₂, que es lo que la app muestra
  // («Sobran 0,160 g (0,0050 mol)»). Esa cifra NO se afirma aquí: depende de las masas molares, que
  // tienen su propio hallazgo, y si cambiaran dejaría este `test.fail` en verde para siempre.
  test.fail('la FAQ no llama «exactamente estequiométricos» a 16 g CH₄ + 64 g O₂', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[class*="faqList"]')).not.toContainText(
      /16 g de CH₄[\s\S]{0,80}64 g de O₂[\s\S]{0,40}exactamente estequiométricos/,
    );
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — la tabla comparativa da como limitante habitual de la
  // combustión «Metano (CH₄) — en interiores con poca ventilación», y el escenario «Cocina de gas» de
  // la misma página dice lo contrario y correcto: «El reactivo limitante real en un entorno mal
  // ventilado es el oxígeno».
  test.fail('tabla: con poca ventilación el limitante de la combustión es el O₂, no el CH₄', async ({ page }) => {
    await abrir(page);
    const fila = page.locator('[class*="tabla"] tbody tr').filter({ hasText: 'Combustión del metano' });
    await expect(fila.locator('td').nth(2)).not.toContainText('Metano (CH₄) — en interiores con poca ventilación');
  });

  // ABIERTO, hallazgo (inspector 03/10/2026) — errata en el truco «Verifica con la conservación de
  // masa»: «debe igual a» por «debe ser igual a».
  test.fail('errata: «debe ser igual a» en el truco de la conservación de la masa', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[class*="tipCard"]').filter({ hasText: 'conservación de masa' })).not.toContainText('debe igual a');
  });
});

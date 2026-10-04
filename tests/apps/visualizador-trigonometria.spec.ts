import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * visualizador-trigonometria — Inspector, 25/09/2026 (primera inspección) y 04/10/2026
 * (re-inspección tras los lotes del hero 586a4d61, 3de36a1f y a1d72a9c)
 *
 * Lo que promete: «Identidades y Razones Trigonométricas». Círculo unitario con las razones
 * del ángulo θ en cuatro tarjetas (sen, cos, tan, sen²+cos²), gráficas A·f(ωx + φ), tabla
 * de valores exactos y un panel de identidades (pitagórica, ángulo doble, suma y resta). La
 * FAQ decía en septiembre que en 90° «la tangente muestra ∞»; desde la reparación del
 * 26/09/2026 dice «no definida», como el recuadro de errores comunes.
 *
 * EL RIESGO PROPIO DE ESTA APP: calcula con `Math.sin/cos/tan` sobre θ·π/180, y π/2 no es
 * representable en binario. `Math.cos(π/2)` vale 6,1·10⁻¹⁷ (no 0), así que `Math.tan(π/2)`
 * es FINITO: 16.331.239.353.195.370. Era la forma del hallazgo 1778 de
 * `calculadora-trigonometria`; REPARADO aquí el 26/09/2026 (hallazgo 1906) con `motor.ts`,
 * que reconoce los ángulos cuadrantales en GRADOS.
 *
 * Valores esperados, a mano:
 *     30°  → sen 1/2 = 0,500 · cos √3/2 = 0,866 · tan √3/3 = 0,577 · rad π/6 = 0,5236 → 0,524
 *     60°  → sen √3/2 = 0,866 · cos 1/2 = 0,500 · tan √3 = 1,732
 *     180° → sen 0 · cos −1 · tan 0 · rad π = 3,14159 → 3,142
 *     90°  → sen 1 · cos 0 · tan NO DEFINIDA  ·  270° → sen −1 · cos 0 · tan NO DEFINIDA
 * El deslizador va de 0 a 360 con paso 1: lo que se sale del rango lo capa el propio control.
 * No hay ningún campo de texto: el «rechazo» de esta app es el recorte del deslizador.
 */

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (data-brand="stemum"
 * y la píldora «Stemum › Matemáticas» en la barra fija). Va al NIVEL DEL FICHERO porque
 * `launchOptions` fuerza un worker nuevo; al resto de tests no les afecta: solo resuelve ese
 * host. (Re-inspección del 04/10/2026, bloque «hero» del final.)
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

const URL_APP = '/visualizador-trigonometria/';

/** «1.234,567» o «−0,500» → número. Solo para las tarjetas, que no llevan otra cosa. */
function aNumero(texto: string): number {
  return Number(texto.trim().replace(/−/g, '-').replace(/\./g, '').replace(',', '.'));
}

/** El número grande de la tarjeta cuyo rótulo es exactamente `nombre`. */
function tarjeta(page: Page, nombre: string): Locator {
  return page
    .locator('[class*="valorCard"]')
    .filter({ has: page.getByText(nombre, { exact: true }) })
    .locator('[class*="valorNumero"]');
}

async function abrirCirculo(page: Page): Promise<void> {
  await page.goto(URL_APP);
  // La pestaña inicial es Identidades: su deslizador sirve de testigo antes del primer clic.
  await esperarHidratacion(page, ['#slider-angulo-i']);
  await page.getByRole('button', { name: /Círculo Unitario/ }).click();
  await esperarHidratacion(page, ['#slider-angulo']);
}

test.describe('Círculo unitario — razones en ángulos notables', () => {
  test.beforeEach(async ({ page }) => {
    await abrirCirculo(page);
  });

  test('30°: sen 0,500 · cos 0,866 · tan 0,577 · sen²+cos² 1,000', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 30); // parte de 45
    // sen 30° = 1/2 · cos 30° = √3/2 = 0,86603 · tan 30° = √3/3 = 0,57735 (3 decimales)
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,500');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('0,866');
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('0,577');
    await expect(tarjeta(page, 'sen²+cos²')).toHaveText('1,000');
    await expect(page.locator('[class*="valoresPanel"]')).toContainText('I (sen+, cos+)');
  });

  test('60°: sen 0,866 · cos 0,500 · tan 1,732', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 60);
    // sen 60° = √3/2 = 0,86603 · cos 60° = 1/2 · tan 60° = √3 = 1,73205
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,866');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('0,500');
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('1,732');
  });

  test('180°: sen es 0 exacto, no el ruido 1,2246·10⁻¹⁶ de Math.sin(π)', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 180);
    const sen = (await tarjeta(page, 'sen(θ)').textContent()) ?? '';
    expect(sen).not.toMatch(/e/i);
    expect(aNumero(sen)).toBe(0);
    // cos 180° = −1 · tan 180° = 0/−1 = 0
    expect(aNumero((await tarjeta(page, 'cos(θ)').textContent()) ?? '')).toBe(-1);
    expect(aNumero((await tarjeta(page, 'tan(θ)').textContent()) ?? '')).toBe(0);
    await expect(page.locator('[class*="valoresPanel"]')).toContainText('Eje X−');
  });

  test('90° y 270°: seno y coseno exactos (±1 y 0)', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 90);
    expect(aNumero((await tarjeta(page, 'sen(θ)').textContent()) ?? '')).toBe(1);
    expect(aNumero((await tarjeta(page, 'cos(θ)').textContent()) ?? '')).toBe(0);
    await sembrarValor(page, '#slider-angulo', 270);
    expect(aNumero((await tarjeta(page, 'sen(θ)').textContent()) ?? '')).toBe(-1);
    expect(aNumero((await tarjeta(page, 'cos(θ)').textContent()) ?? '')).toBe(0);
  });

  test('90°: la tangente no está definida', async ({ page }) => {
    // Hallazgo 1906 (REPARADO 26/09/2026): Math.tan(π/2) = 16331239353195370 salía como
    // resultado. motor.ts reconoce los ángulos cuadrantales en GRADOS y devuelve tan = null.
    // Se exige «no definida» y ya NO se admite «∞»: la propia página enseña que tan 90° no
    // es infinito (hallazgo 1911).
    await sembrarValor(page, '#slider-angulo', 90);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('no definida');
  });

  test('270°: la tangente no está definida', async ({ page }) => {
    // Hallazgo 1906: Math.tan(3π/2) = 5443746451065123 salía como resultado.
    await sembrarValor(page, '#slider-angulo', 270);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('no definida');
  });

  test('los notables no arrastran ruido: 45° tan 1,000 · 135° tan −1,000 · 150° sen 0,500', async ({ page }) => {
    // Math.tan(π/4) = 0,9999999999999999 y Math.sin(5π/6) = 0,49999999999999994: el motor
    // los ajusta a 1 y ½. El signo es el menos tipográfico (U+2212).
    await sembrarValor(page, '#slider-angulo', 135);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('−1,000');
    await sembrarValor(page, '#slider-angulo', 45);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('1,000');
    await sembrarValor(page, '#slider-angulo', 150);
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,500');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('−0,866');
  });

  test('89°: tan 57,290, muy grande pero definida', async ({ page }) => {
    // tan 89° = 57,28996 → 57,290. El criterio de «no definida» no se come los ángulos
    // vecinos de la asíntota.
    await sembrarValor(page, '#slider-angulo', 89);
    await expect(tarjeta(page, 'tan(θ)')).toHaveText('57,290');
  });

  test('fuera de rango: el deslizador capa −30 a 0° y 400 a 360°', async ({ page }) => {
    // El control es <input type="range" min=0 max=360 step=1>: no hay campo de texto que
    // pueda recibir basura, así que el «rechazo» es el recorte del propio control.
    expect(await sembrarValorAcotado(page, '#slider-angulo', -30)).toBe('0');
    await expect(page.locator('label[for="slider-angulo"] strong')).toHaveText('0°');
    await expect(tarjeta(page, 'sen(θ)')).toHaveText('0,000');
    await expect(tarjeta(page, 'cos(θ)')).toHaveText('1,000');

    expect(await sembrarValorAcotado(page, '#slider-angulo', 400)).toBe('360');
    await expect(page.locator('label[for="slider-angulo"] strong')).toHaveText('360°');
    await expect(page.locator('[class*="valoresPanel"]')).toContainText('Eje X+');
    expect(aNumero((await tarjeta(page, 'sen(θ)').textContent()) ?? '')).toBe(0);
  });

  test('grados → radianes: 30° = π/6 ≈ 0,524 y 180° = π ≈ 3,142', async ({ page }) => {
    const radianes = async (): Promise<number> => {
      const texto = (await page.locator('label[for="slider-angulo"]').textContent()) ?? '';
      const m = texto.match(/\(([-\d.,]+) rad\)/);
      expect(m, `sin radianes en «${texto}»`).not.toBeNull();
      // Admite los dos separadores: aquí se vigila la CONVERSIÓN, el formato va aparte.
      return Number(m![1].replace(',', '.'));
    };
    await sembrarValor(page, '#slider-angulo', 30);
    // π/6 = 0,523599 → 3 decimales. Un olvido de la conversión daría 30 o 0,009: la precisión
    // 3 (±0,0005) basta y sobra.
    expect(await radianes()).toBeCloseTo(0.524, 3);
    await sembrarValor(page, '#slider-angulo', 180);
    expect(await radianes()).toBeCloseTo(3.142, 3);
  });

  test('los radianes se escriben con coma decimal', async ({ page }) => {
    // Hallazgo 1910 (REPARADO): salía «(0.524 rad)» con punto.
    await sembrarValor(page, '#slider-angulo', 30);
    await expect(page.locator('label[for="slider-angulo"]')).toContainText('0,524 rad');
  });
});

test.describe('Identidades — tan 90° no publica un número', () => {
  test('en 90° las identidades con tangente no dan una cifra de 17 dígitos', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await sembrarValor(page, '#slider-angulo-i', 90); // parte de 45
    const valorDe = (rotulo: string): Locator =>
      page
        .locator('[class*="identidadItem"]')
        .filter({ has: page.getByText(rotulo, { exact: true }) })
        .locator('[class*="identidadValor"]');
    // Hallazgo 1911 (REPARADO): aquí salía «∞», justo lo que el recuadro de errores comunes
    // enseña a no pensar. sec 90° = 1/cos 90° tampoco está definida.
    await expect(valorDe('tan(θ) = sen(θ)/cos(θ)')).toHaveText('no definida');
    await expect(valorDe('1 + tan²(θ) = sec²(θ)')).toHaveText('no definida');
    // sen²(90°) + cos²(90°) = 1 + 0 = 1
    await expect(page.locator('[class*="identidadCalculo"] strong')).toHaveText('1,000');
  });
});

test.describe('Gráficas — marcador del ángulo θ sobre la curva', () => {
  // Geometría del SVG (page.tsx:216-221): W 560, padX 36 → el eje x va de 36 (x = 0) a 524
  // (x = 2π), plotW 488. Alto: padY 20, plotH 160 → y = 180 − (v + A)/(2A)·160.
  // Con A = 1, ω = 0,5 y coseno: f(θ) = cos(θ/2).
  async function prepararCoseno(page: Page): Promise<Locator> {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    await esperarHidratacion(page, ['#slider-frecuencia', '#slider-angulo-g']);
    await page.getByRole('radio', { name: 'cos(x)' }).check();
    await expect(page.getByRole('radio', { name: 'cos(x)' })).toBeChecked();
    await sembrarValor(page, '#slider-frecuencia', 0.5); // parte de 1
    return page.locator('svg[aria-label^="Gráfica"] circle');
  }

  test('θ = 359°: el marcador cae al final de la curva, en cos(179,5°) ≈ −1', async ({ page }) => {
    const marcador = await prepararCoseno(page);
    await sembrarValor(page, '#slider-angulo-g', 359);
    // x = 36 + 359/360 · 488 = 522,64 · y = 180 − (cos 179,5° + 1)/2 · 160 = 179,997
    expect(Number(await marcador.getAttribute('cx'))).toBeCloseTo(522.64, 1);
    expect(Number(await marcador.getAttribute('cy'))).toBeCloseTo(180, 1);
  });

  test('θ = 360°: el marcador va al extremo derecho (x = 2π), no al izquierdo', async ({ page }) => {
    // Hallazgo 1909 (REPARADO): el marcador iba a θ mod 2π, así que 360° caía en x = 0
    // (cx 36) con la altura de cos(π) = −1. Esperado cx 524: el defecto era de 488 px.
    const marcador = await prepararCoseno(page);
    await sembrarValor(page, '#slider-angulo-g', 360);
    expect(Number(await marcador.getAttribute('cy'))).toBeCloseTo(180, 1);
    expect(Number(await marcador.getAttribute('cx'))).toBeCloseTo(524, 0);
  });

  test('los parámetros y la fórmula se escriben con coma decimal', async ({ page }) => {
    // Hallazgo 1910 (REPARADO): se leía «Amplitud (A): 1.0» y «f(x) = 1.0 · sen(1.0x + 0.00)».
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    await esperarHidratacion(page, ['#slider-amplitud']);
    const textos = [
      (await page.locator('label[for="slider-amplitud"]').textContent()) ?? '',
      (await page.locator('label[for="slider-frecuencia"]').textContent()) ?? '',
      (await page.locator('label[for="slider-fase"]').textContent()) ?? '',
      (await page.locator('[class*="formulaText"]').textContent()) ?? '',
    ];
    for (const t of textos) expect(t, `punto decimal en «${t}»`).not.toMatch(/\d\.\d/);
    await expect(page.locator('[class*="formulaText"]')).toHaveText('f(x) = 1,0 · sen(1,0x + 0,00)');
    // Eje Y: «1,0» y «−1,0» con el signo menos tipográfico, no «-1.0».
    const ejeY = await page.locator('svg[aria-label^="Gráfica"] text').allTextContents();
    expect(ejeY).toContain('1,0');
    expect(ejeY).toContain('−1,0');
  });
});

test.describe('Identidades — ángulo doble y suma/resta (hallazgo 1907)', () => {
  // La description prometía «ángulo doble, suma y resta» y la página no tenía ninguna.
  // A mano, con B = 30°:
  //   θ = 30° → sen 60° = 2·½·√3/2 = 0,866 · cos 60° = ¾ − ¼ = 0,500
  //             sen(30° + 30°) = sen 60° = 0,866 · cos(30° − 30°) = cos 0° = 1,000
  //   θ = 90° → sen 180° = 2·1·0 = 0,000 · cos 180° = 0 − 1 = −1,000
  //             sen 120° = 1·√3/2 + 0·½ = 0,866 · cos 60° = 0·√3/2 + 1·½ = 0,500
  const valorDe = (page: Page, rotulo: string): Locator =>
    page
      .locator('[class*="identidadItem"]')
      .filter({ has: page.getByText(rotulo, { exact: true }) })
      .locator('[class*="identidadValor"]');

  test('θ = 30° y θ = 90°: valores resueltos a mano', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await sembrarValor(page, '#slider-angulo-i', 30);
    await expect(valorDe(page, 'sen(2θ) = 2·sen(θ)·cos(θ)')).toHaveText('0,866');
    await expect(valorDe(page, 'cos(2θ) = cos²(θ) − sen²(θ)')).toHaveText('0,500');
    await expect(valorDe(page, 'sen(A+B) = sen A·cos B + cos A·sen B')).toHaveText('0,866');
    await expect(valorDe(page, 'cos(A−B) = cos A·cos B + sen A·sen B')).toHaveText('1,000');
    await sembrarValor(page, '#slider-angulo-i', 90);
    await expect(valorDe(page, 'sen(2θ) = 2·sen(θ)·cos(θ)')).toHaveText('0,000');
    await expect(valorDe(page, 'cos(2θ) = cos²(θ) − sen²(θ)')).toHaveText('−1,000');
    await expect(valorDe(page, 'sen(A+B) = sen A·cos B + cos A·sen B')).toHaveText('0,866');
    await expect(valorDe(page, 'cos(A−B) = cos A·cos B + sen A·sen B')).toHaveText('0,500');
  });
});

test.describe('Coherencia y contenido servido', () => {
  test('la tabla dice «no definida» en tan 90°, como el recuadro de errores (hallazgo 1911)', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Tabla de Valores/ }).click();
    const fila = page.locator('table tr').filter({ has: page.getByRole('cell', { name: '90°', exact: true }) });
    await expect(fila.locator('td').nth(4)).toHaveText('no definida');
  });

  test('el HTML servido ya trae la tabla de valores exactos (hallazgo 1915)', async ({ request }) => {
    // Antes solo la pestaña activa llegaba al DOM; ahora las cuatro se sirven y las
    // inactivas van con `hidden`.
    const html = await (await request.get(URL_APP)).text();
    expect(html).toContain('√3/3');
    expect(html).toContain('π/6');
    expect(html).toContain('Tabla de Valores Exactos');
  });

  test('el dibujo del círculo escribe «sen=», no «sin=» (hallazgo 1914)', async ({ page }) => {
    await abrirCirculo(page);
    await sembrarValor(page, '#slider-angulo', 30);
    const rotulos = await page
      .locator('svg[aria-label="Círculo unitario interactivo"]')
      .first()
      .locator('text')
      .allTextContents();
    expect(rotulos.some((t) => t.startsWith('sin='))).toBe(false);
    expect(rotulos).toContain('sen=0,500');
  });

  test('los emojis de pestañas y botones no forman parte del nombre accesible (hallazgo 1913)', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await expect(page.getByRole('button', { name: 'Identidades', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Animar', exact: true })).toBeVisible();
  });
});

test.describe('Contraste (hallazgos 1908 y 1912)', () => {
  /** Contraste WCAG de `propiedad` (color o fill) sobre el fondo real compuesto. */
  async function contrasteDe(elemento: Locator, propiedad: 'color' | 'fill' = 'color'): Promise<number> {
    return elemento.evaluate((el, prop) => {
      const aRgba = (c: string): number[] => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return [255, 255, 255, 1];
        const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
      };
      const mezclar = (arriba: number[], abajo: number[]): number[] => [
        arriba[0] * arriba[3] + abajo[0] * (1 - arriba[3]),
        arriba[1] * arriba[3] + abajo[1] * (1 - arriba[3]),
        arriba[2] * arriba[3] + abajo[2] * (1 - arriba[3]),
        1,
      ];
      const capas: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = aRgba(getComputedStyle(n).backgroundColor);
        if (c[3] > 0) {
          capas.push(c);
          if (c[3] >= 1) break;
        }
      }
      let fondo = [255, 255, 255, 1];
      for (let i = capas.length - 1; i >= 0; i--) fondo = mezclar(capas[i], fondo);
      const estilo = getComputedStyle(el);
      const texto = mezclar(aRgba(prop === 'fill' ? estilo.fill : estilo.color), fondo);
      const lum = (c: number[]): number => {
        const f = (x: number): number => {
          const s = x / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      };
      const [a, b] = [lum(texto), lum(fondo)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    }, propiedad);
  }

  // Se mide con expect.poll: el cambio de tema lleva una transición de color y la primera
  // lectura puede caer a mitad de ella.
  for (const tema of ['light', 'dark'] as const) {
    test(`tema ${tema}: tarjetas, rótulos del dibujo y botones ≥ 4,5:1`, async ({ page }) => {
      await abrirCirculo(page);
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await sembrarValor(page, '#slider-angulo', 30);
      for (const nombre of ['sen(θ)', 'cos(θ)', 'tan(θ)', 'sen²+cos²']) {
        await expect.poll(() => contrasteDe(tarjeta(page, nombre)), { message: nombre }).toBeGreaterThanOrEqual(4.5);
      }
      const svg = page.locator('svg[aria-label="Círculo unitario interactivo"]').first();
      for (const prefijo of ['sen=', 'cos=', 'tan=', '30°']) {
        const rotulo = svg.locator('text').filter({ hasText: prefijo }).first();
        await expect.poll(() => contrasteDe(rotulo, 'fill'), { message: prefijo }).toBeGreaterThanOrEqual(4.5);
      }
      await expect.poll(() => contrasteDe(page.getByRole('button', { name: 'Animar', exact: true }))).toBeGreaterThanOrEqual(4.5);
      // Hallazgo 1912: el botón recién pulsado, con el puntero encima, sigue en blanco.
      const boton30 = page.getByRole('button', { name: '30°', exact: true });
      await boton30.click();
      await boton30.hover();
      await expect.poll(() => contrasteDe(boton30), { message: 'notable activo con hover' }).toBeGreaterThanOrEqual(4.5);
      const pestana = page.getByRole('button', { name: 'Círculo Unitario', exact: true });
      await pestana.hover();
      await expect.poll(() => contrasteDe(pestana), { message: 'pestaña activa con hover' }).toBeGreaterThanOrEqual(4.5);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 04/10/2026 — casos nuevos, resueltos a mano antes de ejecutar
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Círculo unitario — cuadrantes, asíntotas y extremos (04/10/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await abrirCirculo(page);
  });

  /** Las cuatro tarjetas, la etiqueta del deslizador y el cuadrante, de una vez. */
  async function esperarCirculo(
    page: Page,
    grados: number,
    e: { sen: string; cos: string; tan: string; rad: string; cuadrante: string },
  ): Promise<void> {
    await sembrarValor(page, '#slider-angulo', grados);
    await expect(tarjeta(page, 'sen(θ)'), `sen ${grados}°`).toHaveText(e.sen);
    await expect(tarjeta(page, 'cos(θ)'), `cos ${grados}°`).toHaveText(e.cos);
    await expect(tarjeta(page, 'tan(θ)'), `tan ${grados}°`).toHaveText(e.tan);
    await expect(page.locator('label[for="slider-angulo"]')).toContainText(`(${e.rad} rad)`);
    await expect(page.locator('[class*="cuadranteInfo"] strong')).toHaveText(e.cuadrante);
  }

  test('II, III y IV: signos de la regla CAST y radianes (120°, 210°, 300°)', async ({ page }) => {
    // 120° = 180° − 60°: sen +√3/2, cos −1/2, tan −√3 = −1,73205 · 2π/3 = 2,09440 → 2,094
    await esperarCirculo(page, 120, { sen: '0,866', cos: '−0,500', tan: '−1,732', rad: '2,094', cuadrante: 'II (sen+, cos−)' });
    // 210° = 180° + 30°: sen −1/2, cos −√3/2, tan +√3/3 = 0,57735 · 7π/6 = 3,66519 → 3,665
    await esperarCirculo(page, 210, { sen: '−0,500', cos: '−0,866', tan: '0,577', rad: '3,665', cuadrante: 'III (sen−, cos−)' });
    // 300° = 360° − 60°: sen −√3/2, cos +1/2, tan −√3 · 5π/3 = 5,23599 → 5,236
    await esperarCirculo(page, 300, { sen: '−0,866', cos: '0,500', tan: '−1,732', rad: '5,236', cuadrante: 'IV (sen−, cos+)' });
  });

  test('a 1° de las asíntotas la tangente es grande pero definida, con el signo del cuadrante', async ({ page }) => {
    // tan 91° = −cot 1° = −57,28996 · cos 91° = −sen 1° = −0,01745 · 91π/180 = 1,58825
    await esperarCirculo(page, 91, { sen: '1,000', cos: '−0,017', tan: '−57,290', rad: '1,588', cuadrante: 'II (sen+, cos−)' });
    // tan 269° = tan 89° = +57,28996 (III: sen y cos negativos) · 269π/180 = 4,69494
    await esperarCirculo(page, 269, { sen: '−1,000', cos: '−0,017', tan: '57,290', rad: '4,695', cuadrante: 'III (sen−, cos−)' });
    // tan 271° = −57,28996 · cos 271° = +sen 1° · 271π/180 = 4,72984
    await esperarCirculo(page, 271, { sen: '−1,000', cos: '0,017', tan: '−57,290', rad: '4,730', cuadrante: 'IV (sen−, cos+)' });
  });

  test('359° y 360°: el final del recorrido', async ({ page }) => {
    // sen 359° = −sen 1° = −0,01745 · tan 359° = −0,01746 · 359π/180 = 6,26573 → 6,266
    await esperarCirculo(page, 359, { sen: '−0,017', cos: '1,000', tan: '−0,017', rad: '6,266', cuadrante: 'IV (sen−, cos+)' });
    // 360° = 2π = 6,28319 → 6,283; razones exactas de un eje, sin «−0,000»
    await esperarCirculo(page, 360, { sen: '0,000', cos: '1,000', tan: '0,000', rad: '6,283', cuadrante: 'Eje X+' });
  });

  test('FAQ: «sin importar el ángulo, sen²+cos² siempre muestra 1,000»; tan solo falta en 90° y 270°', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const fallos: string[] = [];
    for (let a = 0; a <= 360; a += 1) {
      if (a === 45) continue; // es el estado inicial: sembrarlo no probaría nada
      await sembrarValor(page, '#slider-angulo', a);
      const suma = (await tarjeta(page, 'sen²+cos²').textContent())?.trim();
      const tan = (await tarjeta(page, 'tan(θ)').textContent())?.trim();
      if (suma !== '1,000') fallos.push(`${a}°: sen²+cos² = ${suma}`);
      const indefinida = a === 90 || a === 270;
      if ((tan === 'no definida') !== indefinida) fallos.push(`${a}°: tan = ${tan}`);
    }
    expect(fallos).toEqual([]);
  });

  test('teclado: ← en 0° y → en 360° no salen del rango; Fin lleva a 360°', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo', 0); // parte de 45
    const deslizador = page.locator('#slider-angulo');
    const etiqueta = page.locator('label[for="slider-angulo"] strong');
    await deslizador.press('ArrowLeft');
    await expect(etiqueta).toHaveText('0°');
    await deslizador.press('End');
    await expect(etiqueta).toHaveText('360°');
    await deslizador.press('ArrowRight');
    await expect(etiqueta).toHaveText('360°');
    await expect(page.locator('[class*="cuadranteInfo"] strong')).toHaveText('Eje X+');
  });
});

test.describe('Identidades — valores resueltos a mano (04/10/2026)', () => {
  const valorDe = (page: Page, rotulo: string): Locator =>
    page
      .locator('section:not([hidden]) [class*="identidadItem"]')
      .filter({ has: page.getByText(rotulo, { exact: true }) })
      .locator('[class*="identidadValor"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
  });

  test('θ = 60° y θ = 240° (B = 30°)', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo-i', 60);
    // tan 60° = √3 = 1,732 · sec² 60° = 1 + 3 = 4 · sen 120° = 0,866 · cos 120° = −0,500
    // sen(60° + 30°) = sen 90° = 1 · cos(60° − 30°) = cos 30° = 0,866
    await expect(valorDe(page, 'tan(θ) = sen(θ)/cos(θ)')).toHaveText('1,732');
    await expect(valorDe(page, '1 + tan²(θ) = sec²(θ)')).toHaveText('4,000');
    await expect(valorDe(page, 'sen(−θ) = −sen(θ)')).toHaveText('−0,866');
    await expect(valorDe(page, 'sen(2θ) = 2·sen(θ)·cos(θ)')).toHaveText('0,866');
    await expect(valorDe(page, 'cos(2θ) = cos²(θ) − sen²(θ)')).toHaveText('−0,500');
    await expect(valorDe(page, 'sen(A+B) = sen A·cos B + cos A·sen B')).toHaveText('1,000');
    await expect(valorDe(page, 'cos(A−B) = cos A·cos B + sen A·sen B')).toHaveText('0,866');
    await expect(page.locator('section:not([hidden]) [class*="identidadLeyenda"]')).toContainText('sen²(θ) = 0,750');

    await sembrarValor(page, '#slider-angulo-i', 240);
    // III: sen −√3/2, cos −1/2, tan +√3 · sen 480° = sen 120° = 0,866 · cos 480° = −0,500
    // sen(240° + 30°) = sen 270° = −1 · cos(240° − 30°) = cos 210° = −0,866
    await expect(valorDe(page, 'tan(θ) = sen(θ)/cos(θ)')).toHaveText('1,732');
    await expect(valorDe(page, 'sen(−θ) = −sen(θ)')).toHaveText('0,866');
    await expect(valorDe(page, 'cos(−θ) = cos(θ)')).toHaveText('−0,500');
    await expect(valorDe(page, 'sen(2θ) = 2·sen(θ)·cos(θ)')).toHaveText('0,866');
    await expect(valorDe(page, 'cos(2θ) = cos²(θ) − sen²(θ)')).toHaveText('−0,500');
    await expect(valorDe(page, 'sen(A+B) = sen A·cos B + cos A·sen B')).toHaveText('−1,000');
    await expect(valorDe(page, 'cos(A−B) = cos A·cos B + sen A·sen B')).toHaveText('−0,866');
  });

  test('θ = 89°: sec² con cuatro cifras enteras, y θ = 0°: sen(−0) sin signo', async ({ page }) => {
    await sembrarValor(page, '#slider-angulo-i', 89);
    // sec² 89° = 1/cos² 89° = 1/sen² 1° = 1/0,01745240644² = 3283,1397 → «3283,140» (con
    // cuatro cifras enteras no se agrupa, Ortografía de la RAE 2010) · sen 178° = 0,0349 →
    // 0,035 · cos 178° = −0,99939 → −0,999 · sen 119° = 0,8746 → 0,875 · cos 59° = 0,5150
    await expect(valorDe(page, '1 + tan²(θ) = sec²(θ)')).toHaveText('3283,140');
    await expect(valorDe(page, 'tan(θ) = sen(θ)/cos(θ)')).toHaveText('57,290');
    await expect(valorDe(page, 'sen(2θ) = 2·sen(θ)·cos(θ)')).toHaveText('0,035');
    await expect(valorDe(page, 'cos(2θ) = cos²(θ) − sen²(θ)')).toHaveText('−0,999');
    await expect(valorDe(page, 'sen(A+B) = sen A·cos B + cos A·sen B')).toHaveText('0,875');
    await expect(valorDe(page, 'cos(A−B) = cos A·cos B + sen A·sen B')).toHaveText('0,515');

    await sembrarValor(page, '#slider-angulo-i', 0);
    // −sen 0° es −0 en coma flotante: tiene que salir «0,000», no «−0,000»
    await expect(valorDe(page, 'sen(−θ) = −sen(θ)')).toHaveText('0,000');
    await expect(valorDe(page, 'sen(θ + π) = −sen(θ)')).toHaveText('0,000');
    await expect(valorDe(page, '1 + tan²(θ) = sec²(θ)')).toHaveText('1,000');
    // sen(0° + 30°) = 0,500 · cos(0° − 30°) = cos 30° = 0,866
    await expect(valorDe(page, 'sen(A+B) = sen A·cos B + cos A·sen B')).toHaveText('0,500');
    await expect(valorDe(page, 'cos(A−B) = cos A·cos B + sen A·sen B')).toHaveText('0,866');
  });
});

test.describe('Gráficas — marcador, tangente y fase (04/10/2026)', () => {
  // Geometría del SVG: x = 36 + θ/360 · 488 · y = 20 + 160 − (v − yMín)/(yMáx − yMín) · 160,
  // con yMáx = A en seno y coseno, y yMáx = 3 fijo en la tangente.
  const marcador = (page: Page): Locator => page.locator('svg[aria-label^="Gráfica"] circle');

  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    await esperarHidratacion(page, ['#slider-amplitud', '#slider-fase', '#slider-angulo-g']);
  });

  test('sen, A = 2, θ = 90°: el marcador está en la cresta (158; 20) y el eje dice ±2,0', async ({ page }) => {
    await sembrarValor(page, '#slider-amplitud', 2); // parte de 1
    await sembrarValor(page, '#slider-angulo-g', 90); // parte de 45
    // x = 36 + 0,25 · 488 = 158 · 2·sen(π/2) = 2 = yMáx → y = 20
    expect(Number(await marcador(page).getAttribute('cx'))).toBeCloseTo(158, 1);
    expect(Number(await marcador(page).getAttribute('cy'))).toBeCloseTo(20, 1);
    await expect(page.locator('[class*="formulaText"]')).toHaveText('f(x) = 2,0 · sen(1,0x + 0,00)');
    const eje = await page.locator('svg[aria-label^="Gráfica"] text').allTextContents();
    expect(eje).toEqual(expect.arrayContaining(['2,0', '0', '−2,0']));
  });

  test('tan: en 45° el marcador está en y = 73,33; en 90° (asíntota) no hay marcador', async ({ page }) => {
    await page.getByRole('radio', { name: 'tan(x)' }).check();
    await expect(page.getByRole('radio', { name: 'tan(x)' })).toBeChecked();
    await sembrarValor(page, '#slider-angulo-g', 30); // parte de 45: pasar por otro valor
    await sembrarValor(page, '#slider-angulo-g', 45);
    // x = 36 + 45/360 · 488 = 97 · tan 45° = 1 con yMáx 3 → y = 180 − (1 + 3)/6 · 160 = 73,333
    expect(Number(await marcador(page).getAttribute('cx'))).toBeCloseTo(97, 1);
    expect(Number(await marcador(page).getAttribute('cy'))).toBeCloseTo(73.33, 1);
    await sembrarValor(page, '#slider-angulo-g', 90);
    await expect(marcador(page)).toHaveCount(0);
  });

  test('la fase se capa a 6,2 rad (el paso 0,1 no alcanza 2π = 6,283)', async ({ page }) => {
    await page.getByRole('radio', { name: 'cos(x)' }).check();
    expect(await sembrarValorAcotado(page, '#slider-fase', 7)).toBe('6.2');
    await expect(page.locator('label[for="slider-fase"]')).toContainText('6,20 rad');
    await expect(page.locator('[class*="formulaText"]')).toHaveText('f(x) = 1,0 · cos(1,0x + 6,20)');
    // θ = 45° (inicial): cos(π/4 + 6,2) = cos(6,98540 − 2π = 0,70221) = 0,76341
    // → y = 180 − (0,76341 + 1)/2 · 160 = 38,93
    expect(Number(await marcador(page).getAttribute('cy'))).toBeCloseTo(38.93, 1);
  });
});

test.describe('Móvil 360 px (04/10/2026)', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el deslizador responde al dedo y la página no desborda en horizontal', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    const deslizador = page.locator('#slider-angulo-i');
    await deslizador.scrollIntoViewIfNeeded();
    const caja = await deslizador.boundingBox();
    expect(caja).not.toBeNull();
    // Un toque a 3/4 del recorrido = 270° (±15° por el ancho del pulgar); parte de 45°.
    await page.touchscreen.tap(caja!.x + caja!.width * 0.75, caja!.y + caja!.height / 2);
    await expect
      .poll(async () => Number((await page.locator('label[for="slider-angulo-i"] strong').textContent())?.replace('°', '')))
      .toBeGreaterThan(255);
    expect(Number((await page.locator('label[for="slider-angulo-i"] strong').textContent())?.replace('°', ''))).toBeLessThan(285);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS de la re-inspección del 04/10/2026 (test.fail con su motivo)
// ═══════════════════════════════════════════════════════════════════════════

/** Rótulos de valor del círculo (sen=, cos=, tan=): glifos fuera del lienzo y solapes. */
async function rotulosDelCirculo(page: Page): Promise<{ recortados: string[]; solapes: string[] }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page
    .locator('section:not([hidden]) svg[aria-label="Círculo unitario interactivo"]')
    .evaluate((svg) => {
      const textos = Array.from(svg.querySelectorAll<SVGTextElement>('text'));
      const recortados: string[] = [];
      for (const t of textos) {
        const txt = t.textContent ?? '';
        if (!/^(sen|cos|tan)=/.test(txt)) continue;
        let fuera = '';
        for (let i = 0; i < t.getNumberOfChars(); i++) {
          const e = t.getExtentOfChar(i);
          // el viewBox es 0 0 300 300 y el <svg> recorta (overflow: hidden)
          if (e.x < 0 || e.x + e.width > 300) fuera += txt[i];
        }
        if (fuera) recortados.push(`«${txt}» pierde «${fuera}»`);
      }
      const solapes: string[] = [];
      for (let i = 0; i < textos.length; i++) {
        for (let j = i + 1; j < textos.length; j++) {
          const a = textos[i].getBBox();
          const b = textos[j].getBBox();
          const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
          const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
          if (ix > 1 && iy > 1) solapes.push(`«${textos[i].textContent}» × «${textos[j].textContent}»`);
        }
      }
      return { recortados, solapes };
    });
}

// HALLAZGO (operativa, medio) — ABIERTO. Los rótulos del dibujo se salen del lienzo de 300×300,
// que los recorta, y se pisan entre sí. El de la tangente va en x = 256 con anclaje «start» y
// mide ~47-53 unidades (recortado en 315 de los 361 ángulos); el del seno va en px ± 8 y se sale
// por la derecha de 0° a 27° y de 328° a 360°, y por la IZQUIERDA de 154° a 211°, donde pierde
// «sen=». De 0° a ~40° y de ~325° a 360°, sen= y tan= caen uno encima del otro.
// Caso: Círculo Unitario, 120° → esperado «tan=−1,732» entero · obtenido «tan=−1,73» (el «2»
//       queda fuera); 190° → «n=−0,174»; 0° → «sen=0,000» y «tan=0,000» superpuestos.
test.describe('Círculo — los rótulos del dibujo caben y no se pisan', () => {
  test('0°, 30°, 120° y 190°: ningún glifo fuera del lienzo y ningún solape', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto 04/10/2026: rótulos sen=/tan= recortados por el viewBox y superpuestos');
    await abrirCirculo(page);
    const problemas: string[] = [];
    for (const a of [0, 30, 120, 190]) {
      await sembrarValor(page, '#slider-angulo', a);
      const r = await rotulosDelCirculo(page);
      problemas.push(...r.recortados.map((x) => `${a}°: ${x}`), ...r.solapes.map((x) => `${a}°: ${x}`));
    }
    expect(problemas).toEqual([]);
  });
});

// HALLAZGO (operativa, bajo) — ABIERTO. En la pestaña inicial (Identidades) el rectángulo azul
// entre el origen y el punto (cos θ, sen θ) se dibuja con width = px − cx y height = cy − py, que
// son NEGATIVOS fuera del primer cuadrante: el navegador descarta el <rect> y lo anota en la
// consola. Solo se ve de 0° a 90°.
// Caso: Identidades, 120° → esperado un rectángulo de 50 × 86,6 (|cos| · 100 × sen · 100), como
//       el de 30° (86,6 × 50) · obtenido <rect width="-50">, sin pintar, y en la consola
//       «Error: <rect> attribute width: A negative value is not valid. ("-50")».
test.describe('Identidades — el rectángulo sen·cos en todos los cuadrantes', () => {
  test('120° y 210°: el rectángulo existe con tamaño positivo y la consola calla', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto 04/10/2026: <rect> con width/height negativos fuera del primer cuadrante');
    const errores: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && m.text().includes('<rect>')) errores.push(m.text());
    });
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    const cajas: string[] = [];
    for (const a of [120, 210]) {
      await sembrarValor(page, '#slider-angulo-i', a);
      const r = await page
        .locator('section:not([hidden]) svg[aria-label="Círculo unitario interactivo"] rect')
        .first()
        .evaluate((el) => {
          const b = (el as SVGRectElement).getBBox();
          return `${b.width.toFixed(1)}×${b.height.toFixed(1)}`;
        });
      cajas.push(`${a}°: ${r}`);
    }
    // 120°: |cos| = 0,5 → 50 · sen = 0,866 → 86,6 · 210°: |cos| = 0,866 → 86,6 · |sen| = 0,5 → 50
    expect({ cajas, errores }).toEqual({ cajas: ['120°: 50.0×86.6', '210°: 86.6×50.0'], errores: [] });
  });
});

// HALLAZGO (accesibilidad, bajo) — ABIERTO. El panel de valores es role="status" con
// aria-atomic="true" y envuelve los 17 botones de ángulos notables. «Animar» cambia el ángulo
// cada 30 ms, así que la región viva cambia ~33 veces por segundo y cada cambio pide anunciar
// el panel entero (título, cuatro valores, cuadrante y «0° 30° 45° … 360°»).
// Caso: Círculo Unitario → Animar 1 s → esperado ningún control dentro de la región viva y como
//       mucho un par de anuncios · obtenido 17 botones dentro y 34 lotes de cambios en 1 s.
test.describe('Círculo — la región viva no se desborda al animar', () => {
  test('sin botones dentro de la región viva y ≤ 2 cambios anunciables en 1 s de animación', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto 04/10/2026: role=status atómico con 17 botones, actualizado cada 30 ms');
    await abrirCirculo(page);
    const botonesEnRegionViva = await page
      .locator('section:not([hidden]) :is([role="status"], [aria-live="polite"], [aria-live="assertive"]) button')
      .count();
    await page.evaluate(() => {
      const w = window as unknown as { __anuncios: number };
      w.__anuncios = 0;
      const enRegionViva = (n: Node): boolean => {
        const el = n instanceof Element ? n : n.parentElement;
        const region = el?.closest('[aria-live], [role="status"], [role="alert"], [role="log"]');
        if (!region) return false;
        const live = region.getAttribute('aria-live');
        return live ? live !== 'off' : true;
      };
      new MutationObserver((ms) => {
        if (ms.some((m) => enRegionViva(m.target))) w.__anuncios += 1;
      }).observe(document.body, { subtree: true, childList: true, characterData: true });
    });
    await page.getByRole('button', { name: 'Animar', exact: true }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    const anuncios = await page.evaluate(() => (window as unknown as { __anuncios: number }).__anuncios);
    expect({ botonesEnRegionViva, anuncios: anuncios <= 2 ? '≤ 2' : anuncios }).toEqual({
      botonesEnRegionViva: 0,
      anuncios: '≤ 2',
    });
  });
});

// HALLAZGO (accesibilidad, bajo) — ABIERTO. La gráfica escala un viewBox de 560 de ancho y sus
// rótulos (0, π/2, π, 3π/2, 2π y ±A) llevan fontSize 9: a 360 px el SVG mide 302 px y los
// rótulos se pintan a 9 · 302/560 = 4,9 px (en escritorio, 10,6 px).
// Caso: 360 px, pestaña Gráficas → esperado rótulos de los ejes de al menos 9 px de alto ·
//       obtenido 5,0 px.
test.describe('Móvil 360 px — rótulos de la gráfica', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('los rótulos de los ejes miden al menos 9 px', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto 04/10/2026: rótulos de la gráfica a 4,9 px en móvil');
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    const alturas = await page
      .locator('svg[aria-label^="Gráfica"] text')
      .evaluateAll((ts) => ts.map((t) => Number(t.getBoundingClientRect().height.toFixed(1))));
    expect(alturas.length).toBe(8); // 5 en x, 3 en y
    expect(Math.min(...alturas)).toBeGreaterThanOrEqual(9);
  });
});

// HALLAZGO (accesibilidad, bajo) — ABIERTO. Resto del 1914: el nombre accesible de la gráfica
// sale del valor interno ('sin') y dice «Gráfica de sin(x)», mientras el selector y la fórmula
// dicen «sen(x)».
// Caso: Gráficas con sen(x) marcado → esperado aria-label «Gráfica de sen(x)» · obtenido
//       «Gráfica de sin(x)».
test.describe('Gráficas — nombre accesible en español', () => {
  test('con sen(x) marcado, la gráfica se llama «Gráfica de sen(x)»', async ({ page }) => {
    test.fail(true, 'HALLAZGO abierto 04/10/2026: aria-label «Gráfica de sin(x)»');
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#slider-angulo-i']);
    await page.getByRole('button', { name: /Gráficas/ }).click();
    await expect(page.getByRole('radio', { name: 'sen(x)' })).toBeChecked();
    await expect(page.locator('svg[aria-label^="Gráfica"]')).toHaveAttribute('aria-label', 'Gráfica de sen(x)');
  });
});

// HALLAZGO (contenido, bajo) — ABIERTO. La tarjeta «Navegante y Piloto» dice que «el GPS usa
// trilateración mediante distancias y ángulos». La trilateración es, por definición, la posición
// a partir de DISTANCIAS (con ángulos es triangulación), y el receptor GPS solo mide distancias
// (pseudodistancias) a los satélites. La propia página lo dice bien unos párrafos antes:
// «GPS y navegación (trilateración mediante distancias)».
// Caso: HTML servido → esperado «trilateración mediante distancias» sin «y ángulos» · obtenido
//       «Tip: el GPS usa trilateración mediante distancias y ángulos.»
test.describe('Contenido — trilateración', () => {
  test('el bloque educativo no atribuye ángulos a la trilateración del GPS', async ({ request }) => {
    test.fail(true, 'HALLAZGO abierto 04/10/2026: «trilateración mediante distancias y ángulos»');
    const html = await (await request.get(URL_APP)).text();
    // Solo las frases que hablan de trilateración, para que el fallo no vuelque el HTML entero
    const frases = html.match(/trilateración mediante distancias[^<.)]*/g) ?? [];
    expect(frases.length).toBeGreaterThan(0);
    expect(frases.filter((f) => f.includes('ángulo'))).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HERO — ni el logo ni la píldora de Stemum tapan el título (re-inspección 04/10/2026)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Por qué se mide: los lotes 586a4d61, 3de36a1f y a1d72a9c dejaron el hueco del hero medido con
 * el logo de meskeia.com (hasta x = 203). Bajo stemum.com la barra fija lleva la píldora
 * «Stemum › Matemáticas», que llega a x = 287 (SOSPECHAS, familia del hero de Stemum).
 *
 * Medido el 04/10/2026 con next start, 0 puntos del h1 tapados en los dos temas:
 *   · de 769 a 1439 px el módulo pone 100 px arriba: el h1 empieza en y = 99 y la barra
 *     acaba en y = 92, así que el título queda por debajo de la píldora a cualquier ancho;
 *   · desde 1440 px el h1 sube a y = 39, pero centrado empieza en x = 362 (> 287);
 *   · a 360 px empieza en y = 79 y la barra acaba en y = 64.
 * El h1 de esta app no lleva emoji: no hay 🔷 que se meta bajo la píldora.
 */
async function tituloBajoLaBarra(page: Page): Promise<{ total: number; tapados: number }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.locator('h1').evaluate((h1) => {
    const barra = document.querySelector('[class*="headerBar"]');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    let total = 0;
    let tapados = 0;
    for (const q of Array.from(rango.getClientRects())) {
      for (let x = q.left + 2; x < q.right - 1; x += 4) {
        for (let y = q.top + 4; y < q.bottom - 3; y += 4) {
          total++;
          const e = document.elementFromPoint(x, y);
          if (e && barra?.contains(e)) tapados++;
        }
      }
    }
    return { total, tapados };
  });
}

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página NO se hidrata: la píldora no llega a montarse. El
 * puente reenvía el socket a localhost:3050. Copiado de `visualizador-volumenes.spec.ts`
 * (02/10/2026). Bajo `next start` no hay HMR y no hace nada.
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:3050${u.pathname}${u.search}`);
    arriba.binaryType = 'arraybuffer';
    abiertos.push(arriba);
    const cola: (string | Buffer)[] = [];
    arriba.onopen = () => {
      for (const m of cola) arriba.send(m);
      cola.length = 0;
    };
    ws.onMessage((m) => {
      if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
      else cola.push(m);
    });
    arriba.onmessage = (e: MessageEvent) =>
      ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
    ws.onClose(() => arriba.close());
  });
}

test.describe('hero en meskeia.com — re-inspección 04/10/2026', () => {
  test('a 360, 390, 800, 1024, 1280 y 1440 px el logo no tapa el título', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarPaginaAsentada(page);
    const tapados: string[] = [];
    for (const ancho of [360, 390, 800, 1024, 1280, 1440]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total, `${ancho} px: puntos medidos`).toBeGreaterThan(100);
      if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
    }
    expect(tapados).toEqual([]);
  });
});

for (const tema of ['light', 'dark'] as const) {
  test.describe(`hero bajo stemum.com, tema ${tema} — re-inspección 04/10/2026`, () => {
    test.beforeEach(async ({ page }) => {
      // La preferencia se guarda ANTES de cargar: sembrar data-theme tras el goto es una
      // carrera que el gestor de tema pisa al hidratar.
      await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
      await puenteHmr(page);
      await page.goto('http://stemum.com/visualizador-trigonometria/');
      await esperarPaginaAsentada(page);
      await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      await expect(page.locator('[class*="stemumPill"]')).toContainText('Matemáticas');
    });

    test('de 1000 a 1130 px (de 2 en 2), y a 360, 800, 1280 y 1440 px: 0 puntos del título bajo la píldora', async ({
      page,
    }) => {
      test.setTimeout(90_000);
      const anchos = [360, 390, 800, 1023, ...Array.from({ length: 66 }, (_, i) => 1000 + 2 * i), 1280, 1440];
      const tapados: string[] = [];
      for (const ancho of anchos) {
        await page.setViewportSize({ width: ancho, height: 900 });
        const m = await tituloBajoLaBarra(page);
        expect(m.total, `${ancho} px: puntos medidos`).toBeGreaterThan(100);
        if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
      }
      expect(tapados).toEqual([]);
    });
  });
}

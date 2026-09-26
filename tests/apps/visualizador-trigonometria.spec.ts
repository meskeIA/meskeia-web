import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * visualizador-trigonometria — Inspector, 25/09/2026 (primera inspección)
 *
 * Lo que promete: «Identidades y Razones Trigonométricas». Círculo unitario con las razones
 * del ángulo θ en cuatro tarjetas (sen, cos, tan, sen²+cos²), gráficas A·f(ωx + φ) y tabla
 * de valores exactos. La FAQ de la propia página dice que en 90° «la tangente muestra ∞».
 *
 * EL RIESGO PROPIO DE ESTA APP: calcula con `Math.sin/cos/tan` sobre θ·π/180, y π/2 no es
 * representable en binario. `Math.cos(π/2)` vale 6,1·10⁻¹⁷ (no 0), así que `Math.tan(π/2)`
 * es FINITO: 16.331.239.353.195.370. Es la forma del hallazgo 1778 de
 * `calculadora-trigonometria`, ya reparado allí con un motor que reconoce los ángulos
 * cuadrantales en GRADOS (`app/calculadora-trigonometria/motor.ts`).
 *
 * Valores esperados, a mano:
 *     30°  → sen 1/2 = 0,500 · cos √3/2 = 0,866 · tan √3/3 = 0,577 · rad π/6 = 0,5236 → 0,524
 *     60°  → sen √3/2 = 0,866 · cos 1/2 = 0,500 · tan √3 = 1,732
 *     180° → sen 0 · cos −1 · tan 0 · rad π = 3,14159 → 3,142
 *     90°  → sen 1 · cos 0 · tan NO DEFINIDA  ·  270° → sen −1 · cos 0 · tan NO DEFINIDA
 * El deslizador va de 0 a 360 con paso 1: lo que se sale del rango lo capa el propio control.
 */

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

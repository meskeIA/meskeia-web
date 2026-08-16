import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-tamano-adulto-perro (segmento cálculo, riesgo 2 ALTO)
 *
 * De dónde sale cada cifra esperada:
 *  Toda la lógica vive en `app/calculadora-tamano-adulto-perro/page.tsx` (no hay
 *  motor en `lib/` ni módulo de datos: las curvas están inline en el componente).
 *
 *    pct          = obtenerPorcentajeCrecimiento(edad, tamaño)   ← interpolación lineal
 *                   sobre `curvasCrecimiento[tamaño]`; por debajo del primer nodo (8
 *                   semanas) devuelve el valor de ese nodo, por encima del último 1,0
 *    pesoEstimado = pesoActual / pct
 *    rango        = pesoEstimado × 0,85  …  pesoEstimado × 1,15   (±15 %)
 *    % mostrado   = pct × 100
 *
 *  Curva mediano: 8:0,25 · 12:0,38 · 16:0,50 · 20:0,60 · 24:0,70 · 28:0,78 · 32:0,85
 *                 40:0,92 · 52:0,98 · 60:1,0
 *  Curva gigante: 8:0,15 · 12:0,22 · 16:0,30 · 20:0,37 · 24:0,43 · 28:0,50 · 32:0,55
 *                 40:0,65 · 52:0,75 · 72:0,85 · 96:0,95 · 144:1,0
 *  Los hitos de la tabla se sitúan en meses × 4,33 semanas.
 *  Rangos de contraste (`rangosTipicos`): mediano 10-25 kg · gigante 45-100 kg.
 *
 *  Ninguna de esas 51 constantes cita fuente veterinaria en el código ni en el bloque
 *  educativo, así que lo que aquí se ancla es la aritmética de la app sobre sus propias
 *  curvas, resuelta a mano ANTES de ejecutarla. El detalle va comentado en cada aserción.
 */

const RUTA = '/calculadora-tamano-adulto-perro/';

/** Los nombres de clase de CSS Modules van con hash: se localiza por subcadena. */
const valorPrincipal = (page: Page) => page.locator('[class*="resultadoValor"]').first();
const rangoProbable = (page: Page) => page.locator('[class*="rangoValor"]').first();
/** 0 = «Crecimiento actual» (%), 1 = «Maduración». */
const detalle = (page: Page, i: number) => page.locator('[class*="detalleValor"]').nth(i);

/** Celdas de una fila de la tabla de hitos: [peso esperado, % del adulto]. */
async function filaHito(page: Page, edad: string): Promise<string[]> {
  const fila = page.locator('tr', { has: page.locator('th', { hasText: new RegExp(`^${edad}$`) }) }).first();
  return (await fila.locator('td').allInnerTexts()).map((t) => t.replace(/ /g, ' ').trim());
}

async function calcular(
  page: Page,
  datos: { peso: string; edad: string; tamano: string },
): Promise<void> {
  const campos = page.locator('input[type="text"]');
  await campos.nth(0).fill(datos.peso);
  await campos.nth(1).fill(datos.edad);
  await page.getByRole('button', { name: datos.tamano, exact: true }).click();
  await page.getByRole('button', { name: 'Calcular Peso Adulto' }).click();
}

test.describe('Calculadora de tamaño adulto del perro', () => {
  test('CASO 1 (normal) — mediano, 5 kg a las 16 semanas', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '5', edad: '16', tamano: 'Mediano 10-25 kg' });

    // 16 semanas es nodo exacto de la curva mediano → pct = 0,50
    // pesoEstimado = 5 / 0,50 = 10 kg
    await expect(valorPrincipal(page)).toHaveText('10,0 kg');

    // Rango ±15 %: 10 × 0,85 = 8,5 · 10 × 1,15 = 11,5
    await expect(rangoProbable(page)).toHaveText('8,5 - 11,5 kg');

    // pct × 100 = 50 · maduración fija de la categoría mediano
    await expect(detalle(page, 0)).toHaveText('50%');
    await expect(detalle(page, 1)).toHaveText('12-15 meses');

    // Hito 2 meses = 8,66 semanas → interpola 8:0,25 y 12:0,38
    //   0,25 + 0,13 × (0,66 / 4) = 0,27145 → 10 × 0,27145 = 2,7145 kg
    expect(await filaHito(page, '2 meses')).toEqual(['2,7 kg', '27 %']);

    // Hito 12 meses = 51,96 semanas → interpola 40:0,92 y 52:0,98
    //   0,92 + 0,06 × (11,96 / 12) = 0,9798 → 10 × 0,9798 = 9,798 kg
    expect(await filaHito(page, '12 meses')).toEqual(['9,8 kg', '98 %']);

    // rangosTipicos.mediano = 10-25 kg y la proyección son 10 kg exactos → «dentro»
    await expect(
      page.getByText('La proyección encaja con la categoría mediano, cuyo peso adulto habitual es 10-25 kg.'),
    ).toBeVisible();
  });

  test('CASO 2 (límite alto) — gigante, 50 kg (peso máximo admitido) a las 96 semanas', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '50', edad: '96', tamano: 'Gigante >45 kg' });

    // 96 semanas es nodo exacto de la curva gigante → pct = 0,95
    // pesoEstimado = 50 / 0,95 = 52,63157… kg
    await expect(valorPrincipal(page)).toHaveText('52,6 kg');

    // Rango ±15 %: 52,63157 × 0,85 = 44,7368 · × 1,15 = 60,5263
    await expect(rangoProbable(page)).toHaveText('44,7 - 60,5 kg');
    await expect(detalle(page, 0)).toHaveText('95%');
    await expect(detalle(page, 1)).toHaveText('24-36 meses');

    // rangosTipicos.gigante = 45-100 kg → 52,6 kg queda dentro
    await expect(page.getByText('La proyección encaja con la categoría gigante')).toBeVisible();

    // ⚠️ HALLAZGO anclado: el techo de peso son 50 kg (`peso > 50` en page.tsx), pero la
    // app admite edades de hasta 150 semanas y su propia tabla de razas da 45-90 kg de
    // adulto al Gran Danés y al San Bernardo. Un gigante real de 22 meses pesa más de
    // 50 kg y la app lo rechaza en vez de estimarlo. Si algún día se sube el techo, este
    // bloque se pondrá en ROJO: entonces hay que sustituirlo por el valor estimado.
    await page.locator('input[type="text"]').nth(0).fill('51');
    await page.getByRole('button', { name: 'Calcular Peso Adulto' }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, entre 0 y 50 kg.',
    );
  });

  test('CASO 3 (debe rechazarse) — peso 0 y peso negativo no se calculan', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '0', edad: '16', tamano: 'Mediano 10-25 kg' });

    // La guarda `peso <= 0` corta antes de dividir: sin ella, 0 / 0,50 daría «0,0 kg»
    // como si fuera una predicción válida.
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, entre 0 y 50 kg.',
    );
    await expect(
      page.getByText('Introduce los datos de tu cachorro para predecir su tamaño adulto'),
    ).toBeVisible();
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);

    // Mismo tratamiento para un peso negativo
    await calcular(page, { peso: '-5', edad: '16', tamano: 'Mediano 10-25 kg' });
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, entre 0 y 50 kg.',
    );
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);
  });
});

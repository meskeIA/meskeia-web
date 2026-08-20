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
    await calcular(page, { peso: '5', edad: '16', tamano: 'Mediano 8-20 kg' });

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

    // rangosTipicos.mediano ahora se DERIVA de las razas que la app clasifica como medianas
    // (Bulldog Francés 8 kg – Border Collie/Schnauzer 20 kg), en vez de estar escrito a mano
    // como 10-25. La proyección son 10 kg exactos → «dentro».
    await expect(
      page.getByText('La proyección encaja con la categoría mediano, cuyo peso adulto habitual es 8-20 kg.'),
    ).toBeVisible();
  });

  test('CASO 2 (límite alto) — gigante, 50 kg (peso máximo admitido) a las 96 semanas', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '50', edad: '96', tamano: 'Gigante 35-90 kg' });

    // 96 semanas es nodo exacto de la curva gigante → pct = 0,95
    // pesoEstimado = 50 / 0,95 = 52,63157… kg
    await expect(valorPrincipal(page)).toHaveText('52,6 kg');

    // Rango ±15 %: 52,63157 × 0,85 = 44,7368 · × 1,15 = 60,5263
    await expect(rangoProbable(page)).toHaveText('44,7 - 60,5 kg');
    await expect(detalle(page, 0)).toHaveText('95%');
    await expect(detalle(page, 1)).toHaveText('24-36 meses');

    // rangosTipicos.gigante se deriva ahora de las razas gigantes de la tabla (Pastor Bernés
    // y Rottweiler desde 35 kg, Gran Danés y San Bernardo hasta 90) → 52,6 kg queda dentro
    await expect(page.getByText('La proyección encaja con la categoría gigante')).toBeVisible();

    // El hallazgo 44 estaba ANCLADO aquí, y este bloque avisaba de que se pondría en rojo el
    // día que se subiera el techo. Ese día fue el 20/08/2026: el tope pasó de 50 a 120 kg
    // porque dejaba inservible la categoría gigante entera —la propia tabla de la app da
    // 45-90 kg de adulto al Gran Danés y al San Bernardo, y un gigante de 22 meses pesa más
    // de 50—. Ahora 51 kg se estima en vez de rechazarse: 51 / 0,95 = 53,68421…
    await page.locator('input[type="text"]').nth(0).fill('51');
    await page.getByRole('button', { name: 'Calcular Peso Adulto' }).click();
    await expect(valorPrincipal(page)).toHaveText('53,7 kg');
    await expect(page.locator('p[role="alert"]')).toHaveCount(0);
  });

  test('CASO 3 (debe rechazarse) — peso 0 y peso negativo no se calculan', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '0', edad: '16', tamano: 'Mediano 8-20 kg' });

    // La guarda `peso <= 0` corta antes de dividir: sin ella, 0 / 0,50 daría «0,0 kg»
    // como si fuera una predicción válida. El mensaje decía «entre 0 y 50 kg» cuando el 0
    // tampoco se aceptaba; desde el 20/08/2026 dice lo que de verdad admite.
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, mayor que 0 y hasta 120 kg.',
    );
    await expect(
      page.getByText('Introduce los datos de tu cachorro para predecir su tamaño adulto'),
    ).toBeVisible();
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);

    // Mismo tratamiento para un peso negativo
    await calcular(page, { peso: '-5', edad: '16', tamano: 'Mediano 8-20 kg' });
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, mayor que 0 y hasta 120 kg.',
    );
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);
  });
});

/**
 * Reparación del lote mecánico del Inspector (18/08/2026) — hallazgos 47, 48 y 50.
 */
test.describe('Calculadora de tamaño adulto del perro — lote mecánico 18/08/2026', () => {
  test('hallazgo 47 — los dos campos tienen nombre accesible', async ({ page }) => {
    await page.goto(RUTA);
    const campos = page.locator('input[type="text"]');
    await expect(campos.nth(0)).toHaveAccessibleName(/Peso actual/);
    await expect(campos.nth(1)).toHaveAccessibleName(/Edad del cachorro/);
  });

  test('hallazgo 50 — ningún botón se queda sin type="button"', async ({ page }) => {
    await page.goto(RUTA);
    // Se cuentan solo los botones DE LA APP. La suite corre contra `next dev` (ver webServer
    // en playwright.config.ts) y el panel de Dev Tools inyecta su propio botón sin type, que
    // en producción no existe: contarlo hacía fallar este test sin que nada de la página
    // estuviera mal. Comprobado el 20/08/2026 sobre el HTML generado por `npm run build`:
    // 0 botones sin type. Si algún día la suite corriera contra el build, el filtro sobra
    // pero no estorba.
    const sinType = await page.locator('button:not([type])').evaluateAll((els) =>
      els.filter(
        (e) =>
          !e.closest('nextjs-portal') &&
          !e.hasAttribute('data-nextjs-dev-tools-button') &&
          !e.hasAttribute('data-next-mark'),
      ).length,
    );
    expect(sinType).toBe(0);
  });

  test('hallazgo 48 — la FAQ estructurada no contradice al motor ni a la tabla visible', async ({ page }) => {
    await page.goto(RUTA);
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).join(' ');
    // (a) La curva grande a las 14 semanas interpola 0,35 (12→0,30 · 16→0,40), o sea
    //     ×2,857; la FAQ publicaba la regla «×2,5», que da otra cifra que la app.
    expect(jsonLd).not.toContain('multiplicado por 2,5');
    expect(jsonLd).toContain('45,7 kg');
    // (b) Maduración: la app da 18-24 meses a las grandes y 24-36 a las gigantes.
    expect(jsonLd).toContain('entre 18 y 24 meses');
    expect(jsonLd).toContain('24-36 meses');
    // (c) Beagle y Cocker son medianos en la tabla de razas de la propia app.
    expect(jsonLd).not.toMatch(/entre 5 y 10 kg \(Beagle/);
    expect(jsonLd).not.toContain('Labrador juvenil');
  });

  test('hallazgo 48 — el caso que publica la FAQ da en la app la cifra que la FAQ dice', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '16', edad: '14', tamano: 'Grande 16-40 kg' });
    // 14 semanas interpola entre 12 (0,30) y 16 (0,40): 0,30 + (2/4)×0,10 = 0,35
    // 16 / 0,35 = 45,714… → 45,7 kg
    await expect(valorPrincipal(page)).toHaveText('45,7 kg');
  });
});

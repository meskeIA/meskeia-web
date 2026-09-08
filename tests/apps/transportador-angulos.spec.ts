import { test, expect, Page } from '@playwright/test';

/**
 * transportador-angulos — verificación de interacción (PASO 4.bis).
 *
 * La app tiene estado que no es «rellenar campo → leer resultado»: tres puntos
 * arrastrables, manejo de teclado con dos velocidades, una imagen que se carga y
 * se quita, y un lienzo cuyo tamaño real entra en el cálculo. Aquí se verifican
 * las TRANSICIONES; el cálculo del ángulo tiene sus casos a mano en
 * tests/angulos-motor.spec.ts.
 *
 * EL ESTADO INICIAL ES UN ÁNGULO RECTO EXACTO, Y NO POR CASUALIDAD
 *   vértice (0,50 · 0,68) · brazo A (0,82 · 0,68) · brazo B (0,50 · 0,20)
 *   A comparte la Y con el vértice → el primer brazo es horizontal.
 *   B comparte la X con el vértice → el segundo brazo es vertical.
 *   Perpendiculares, luego 90°, y da igual el tamaño del lienzo: es el oráculo
 *   más robusto posible para comprobar que la app convierte bien de fracción a
 *   píxeles. Si alguna vez saliera 63° en vez de 90°, sería justo el fallo que
 *   el código evita midiendo en píxeles y no en fracciones.
 */

const URL_APP = '/transportador-angulos/';

async function abrir(page: Page) {
  await page.goto(URL_APP);
  await expect(page.getByRole('heading', { name: /Transportador de Ángulos/ }).first()).toBeVisible();
}

/** La medida grande, tal como se pinta (formato español: coma decimal). */
function medida(page: Page) {
  return page.locator('[class*="medidaValor"]');
}

test.describe('transportador-angulos · estado inicial', () => {
  test('arranca marcando un ángulo recto exacto', async ({ page }) => {
    await abrir(page);
    // 90,0 con coma decimal: es formato español, no toFixed()
    await expect(medida(page)).toHaveText('90,0°');
    await expect(page.locator('[class*="medidaTipo"]')).toHaveText('Ángulo recto');
  });

  test('los tres puntos existen y son alcanzables con el teclado', async ({ page }) => {
    await abrir(page);
    for (const etiqueta of [/Vértice/, /Primer brazo/, /Segundo brazo/]) {
      const punto = page.getByRole('button', { name: etiqueta });
      await expect(punto).toBeVisible();
      await punto.focus();
      await expect(punto).toBeFocused();
    }
  });

  test('el aviso sobre la perspectiva está a la vista, no plegado', async ({ page }) => {
    await abrir(page);
    // Es el límite de validez de toda la app: si estuviera dentro de un
    // colapsable, quien no lo abriera se llevaría un número exacto de un
    // ángulo equivocado.
    const aviso = page.getByRole('heading', { name: /Sobre qué imágenes vale esta medida/ });
    await expect(aviso).toBeVisible();
    await expect(page.getByText(/No vale sobre una foto en perspectiva/)).toBeVisible();
  });
});

test.describe('transportador-angulos · mover los puntos', () => {
  test('las flechas mueven el punto enfocado y el ángulo cambia', async ({ page }) => {
    await abrir(page);
    const brazoA = page.getByRole('button', { name: /Primer brazo/ });
    await brazoA.focus();

    // A está a la derecha del vértice y B arriba: subir A lo acerca a B, así
    // que el ángulo tiene que BAJAR de 90.
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowUp');

    const texto = await medida(page).innerText();
    const grados = Number(texto.replace('°', '').replace(',', '.'));
    expect(grados).toBeLessThan(90);
    expect(grados).toBeGreaterThan(0);
    await expect(page.locator('[class*="medidaTipo"]')).toHaveText('Ángulo agudo');
  });

  test('Mayúsculas mueve más despacio que la flecha sola', async ({ page }) => {
    await abrir(page);
    const brazoA = page.getByRole('button', { name: /Primer brazo/ });

    await brazoA.focus();
    await page.keyboard.press('ArrowUp');
    const normal = Number((await medida(page).innerText()).replace('°', '').replace(',', '.'));

    await page.getByRole('button', { name: 'Recolocar los puntos' }).click();
    await expect(medida(page)).toHaveText('90,0°');

    await brazoA.focus();
    await page.keyboard.press('Shift+ArrowUp');
    const fino = Number((await medida(page).innerText()).replace('°', '').replace(',', '.'));

    // Los dos bajan de 90, pero el fino tiene que quedarse más cerca.
    expect(normal).toBeLessThan(90);
    expect(fino).toBeLessThan(90);
    expect(90 - fino).toBeLessThan(90 - normal);
  });

  test('un punto no se puede sacar del lienzo', async ({ page }) => {
    await abrir(page);
    const brazoB = page.getByRole('button', { name: /Segundo brazo/ });
    await brazoB.focus();

    // B arranca en y = 0,20: cien flechas hacia arriba lo llevarían muy por
    // encima del borde si no se acotara.
    for (let i = 0; i < 100; i++) await page.keyboard.press('ArrowUp');

    const estilo = await brazoB.getAttribute('style');
    expect(estilo).toContain('top: 0%');
    // Y sigue habiendo un ángulo medido: el punto se queda en el borde, no se pierde.
    await expect(medida(page)).toBeVisible();
  });

  test('«Recolocar los puntos» devuelve el ángulo recto de partida', async ({ page }) => {
    await abrir(page);
    const vertice = page.getByRole('button', { name: /Vértice/ });
    await vertice.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');
    await expect(medida(page)).not.toHaveText('90,0°');

    await page.getByRole('button', { name: 'Recolocar los puntos' }).click();
    await expect(medida(page)).toHaveText('90,0°');
  });
});

test.describe('transportador-angulos · valores derivados', () => {
  test('el reflejo, el complementario y el suplementario acompañan a la medida', async ({
    page,
  }) => {
    await abrir(page);
    // Con 90°: reflejo 270, complementario 0, suplementario 90.
    const derivados = page.locator('[class$="derivado"]');
    await expect(derivados.filter({ hasText: 'Ángulo reflejo' })).toContainText('270,0°');
    await expect(derivados.filter({ hasText: 'Complementario' })).toContainText('0,0°');
    await expect(derivados.filter({ hasText: 'Suplementario' })).toContainText('90,0°');
  });

  test('el complementario desaparece cuando el ángulo pasa de 90°', async ({ page }) => {
    await abrir(page);
    const brazoA = page.getByRole('button', { name: /Primer brazo/ });
    await brazoA.focus();
    // Bajar A lo aleja de B (que está arriba): el ángulo pasa de 90.
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowDown');

    const grados = Number((await medida(page).innerText()).replace('°', '').replace(',', '.'));
    expect(grados).toBeGreaterThan(90);
    // No se inventa un número negativo: se dice que no lo hay.
    await expect(
      page.locator('[class$="derivado"]').filter({ hasText: 'Complementario' }),
    ).toContainText('pasa de 90°');
  });

  test('la notación en grados, minutos y segundos es coherente con la decimal', async ({
    page,
  }) => {
    await abrir(page);
    const gms = page.locator('[class$="derivado"]').filter({ hasText: 'Grados, minutos' });
    await expect(gms).toContainText('90°');
    await expect(gms).toContainText('0′');
  });
});

test.describe('transportador-angulos · hoja imprimible', () => {
  test('el transportador se dibuja en milímetros, no en píxeles', async ({ page }) => {
    await abrir(page);
    const svg = page.locator('[class*="hojaSvg"]');
    await expect(svg).toBeVisible();
    // Una plantilla a escala real NO puede declararse en px: es lo que hace que
    // salga del mismo tamaño impresa desde cualquier pantalla.
    await expect(svg).toHaveAttribute('width', /mm$/);
    await expect(svg).toHaveAttribute('height', /mm$/);
  });

  test('lleva su barra de calibración de 100 mm', async ({ page }) => {
    await abrir(page);
    await expect(
      page.getByRole('img', { name: /Barra de calibración que debe medir exactamente 100/ }),
    ).toBeVisible();
    await expect(page.getByText(/debe medir exactamente 100 mm/)).toBeVisible();
  });
});

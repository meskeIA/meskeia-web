import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Simulador de Flotabilidad (principio de Arquímedes) — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Flotabilidad» y el subtítulo «Principio de Arquímedes y densidad:
 *   elige el cuerpo y el líquido y comprueba si flota, cuánto se sumerge y cuánto empuje recibe».
 *   Seis materiales y seis líquidos en botones con aria-pressed, un volumen en cm³, y debajo el
 *   veredicto (Flota / Se hunde / Equilibrio indiferente), las tarjetas de P, E, % sumergido o
 *   peso aparente, y un dibujo SVG cuyo aria-label repite el veredicto.
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR (g = 9,81 m/s²)
 *   P = ρc·V·g · E_max = ρl·V·g · flota si ρc < ρl con f = ρc/ρl · si se hunde, P − E_max.
 *   Las fuerzas salen con 4 cifras significativas (Intl es-ES, sin ceros a la derecha) y los
 *   porcentajes con un decimal y espacio duro antes del %.
 *
 *   1) Estado inicial: pino 500 kg/m³ · 1000 cm³ = 0,001 m³ · agua dulce 1000 kg/m³
 *        P = 500 · 0,001 · 9,81 = 4,905 N        → «4,905 N»
 *        ρc < ρl → FLOTA · f = 500/1000 = 0,5    → «50,0 %» sumergido, «50,0 %» sobresale
 *   2) Hierro 7870 kg/m³ · 100 cm³ = 0,0001 m³ · agua dulce
 *        P = 7870 · 0,0001 · 9,81 = 7,72047 N    → «7,72 N» (4 cifras: 7,720 sin el cero)
 *        E = 1000 · 0,0001 · 9,81 = 0,981 N      → «0,981 N»
 *        ρc > ρl → SE HUNDE · peso aparente = 7,72047 − 0,981 = 6,73947 N → «6,739 N»
 *   3) Hielo 917 kg/m³ en agua de mar 1025 kg/m³ (volumen cualquiera: f no depende de V)
 *        f = 917/1025 = 0,894634 → «89,5 %» sumergido · 1 − f = 0,105366 → «10,5 %» fuera
 *   4) Rechazo: volumen 0 o vacío → el motor devuelve null. Sin veredicto, sin ninguna cifra
 *      en newtons, y el mensaje dice qué falta: «el volumen del cuerpo».
 *   5) Al pulsar Hierro, su botón pasa a aria-pressed="true" y el de Madera de pino a "false";
 *      el aria-label del SVG pasa de «…: flota.» a «…: se hunde.».
 *   6) RelatedApps: data/app-relations.ts declara 4 relaciones para la app → 4 tarjetas.
 */

/** Espacio normal o duro (U+00A0) antes del %: la app usa el duro, el test admite los dos. */
const ESP = '[\\s\\u00A0]';

/** El valor de una tarjeta, localizado por su etiqueta (las clases del módulo van con hash). */
async function leerTarjeta(page: Page, etiqueta: string): Promise<string> {
  return page.evaluate((lab) => {
    for (const d of document.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
        return sp[1].textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

/** La región de resultados (role="status"), tanto con veredicto como con «Faltan datos». */
function resultados(page: Page): Locator {
  return page.locator('[role="status"]', { hasText: /Masa m = ρc·V|Faltan datos para calcular/ });
}

function dibujo(page: Page): Locator {
  return page.locator('svg[role="img"][aria-label^="Recipiente"]');
}

function cajaVolumen(page: Page): Locator {
  return page.getByRole('textbox', { name: 'Volumen', exact: true });
}

async function escribirVolumen(page: Page, valor: string): Promise<void> {
  const caja = cajaVolumen(page);
  await caja.fill(valor);
  // Sin blur: el NumberInput acota al mínimo (1 cm³) al salir, y el caso 4 quiere ver el 0 tal cual
  await esperarValorEnReact(page, caja, valor);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-flotabilidad/');
  // El deslizador del volumen es el testigo: con él montado, botones e inputs ya escuchan
  await esperarHidratacion(page, ['#deslizador-volumen']);
});

test.describe('Simulador de Flotabilidad', () => {
  test('1 · estado inicial: pino, 1000 cm³, agua dulce → flota, 50 %, P = 4,905 N', async ({ page }) => {
    await expect(resultados(page)).toContainText('Flota');
    expect(await leerTarjeta(page, 'Peso P = ρc·V·g')).toBe('4,905 N');
    expect(await leerTarjeta(page, 'Empuje en equilibrio (E = P)')).toBe('4,905 N');
    expect(await leerTarjeta(page, 'Sumergido f = ρc/ρl')).toMatch(new RegExp(`^50,0${ESP}%$`));
    expect(await leerTarjeta(page, 'Sobresale 1 − f')).toMatch(new RegExp(`^50,0${ESP}%$`));
  });

  test('2 · hierro, 100 cm³, agua dulce → se hunde, peso aparente 6,739 N', async ({ page }) => {
    await page.getByRole('button', { name: /^Hierro/ }).click();
    await escribirVolumen(page, '100');

    await expect(resultados(page)).toContainText('Se hunde');
    expect(await leerTarjeta(page, 'Peso P = ρc·V·g')).toBe('7,72 N');
    expect(await leerTarjeta(page, 'Empuje E = ρl·V·g')).toBe('0,981 N');
    expect(await leerTarjeta(page, 'Peso aparente P − E (dinamómetro)')).toBe('6,739 N');
  });

  test('3 · hielo en agua de mar → 89,5 % sumergido y 10,5 % fuera', async ({ page }) => {
    await page.getByRole('button', { name: /^Hielo/ }).click();
    await page.getByRole('button', { name: /^Agua de mar/ }).click();

    await expect(resultados(page)).toContainText('Flota');
    expect(await leerTarjeta(page, 'Sumergido f = ρc/ρl')).toMatch(new RegExp(`^89,5${ESP}%$`));
    expect(await leerTarjeta(page, 'Sobresale 1 − f')).toMatch(new RegExp(`^10,5${ESP}%$`));
  });

  for (const valor of ['0', '']) {
    test(`4 · rechazo: volumen «${valor || 'vacío'}» → sin veredicto ni cifras, y dice qué falta`, async ({ page }) => {
      await escribirVolumen(page, valor);

      const zona = resultados(page);
      await expect(zona).toContainText('Faltan datos para calcular');
      await expect(zona).toContainText('el volumen del cuerpo');
      const texto = (await zona.textContent()) ?? '';
      expect(texto).not.toMatch(/Flota|Se hunde|Equilibrio indiferente/);
      // Ninguna fuerza publicada: ni «4,905 N» ni «NaN N» ni «∞ N»
      expect(texto).not.toMatch(/(\d|NaN|∞)\s*N\b/);
      expect(texto).not.toMatch(/NaN|∞|Infinity/);
      await expect(dibujo(page)).toHaveAttribute('aria-label', /faltan datos/);
    });
  }

  test('5 · los aria-pressed siguen al preset y el aria-label del SVG al veredicto', async ({ page }) => {
    const pino = page.getByRole('button', { name: /^Madera de pino/ });
    const hierro = page.getByRole('button', { name: /^Hierro/ });

    await expect(pino).toHaveAttribute('aria-pressed', 'true');
    await expect(hierro).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Agua dulce/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(dibujo(page)).toHaveAttribute('aria-label', /madera de pino: flota\./);

    await hierro.click();

    await expect(hierro).toHaveAttribute('aria-pressed', 'true');
    await expect(pino).toHaveAttribute('aria-pressed', 'false');
    await expect(dibujo(page)).toHaveAttribute('aria-label', /hierro: se hunde\./);
  });

  test('6 · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
  });
});

import { test, expect, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Simulador del Modelo Atómico de Bohr — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador del Modelo Atómico de Bohr». Dos grupos de botones con aria-pressed
 *   eligen el nivel de partida y el de llegada (1 a 7 y ∞), cinco atajos fijan líneas conocidas,
 *   y una región role="status" da el fotón: emitido o absorbido, serie, λ y su color, más las
 *   tarjetas de energía, frecuencia y radios. Debajo, la tira del espectro visible y la tabla de
 *   la serie del salto.
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO (E_ion = h·c·R_H = 13,598 eV, R_H = 1,096776·10⁷ m⁻¹)
 *   1) Inicial 3 → 2 (Hα): ΔE = 13,598·(1/4 − 1/9) = 13,598·5/36 = 1,8887 → «1,889 eV»
 *      λ = 36/(5·R_H) = 656,47 nm → «λ = 656,47 nm» · «Visible, rojo» · serie de Balmer
 *      E₃ = −13,598/9 = −1,511 → «−1,511 eV» · E₂ = −3,3996 → «−3,400 eV»
 *      r₃ = 9·0,052918 = 0,47626 → «0,4763 nm»
 *      Con R = 1,097·10⁷ del libro: 36/(5·1,097·10⁷) = 656,3 nm
 *   2) Atajo Lyman α (2 → 1): λ = 4/(3·R_H) = 121,57 nm → «λ = 121,57 nm», ultravioleta
 *   3) 1 → ∞ (ionizar): absorbido, límite de Lyman, ΔE = 13,598 → «13,598 eV»
 *   4) Mismo nivel en los dos grupos → «No hay salto», sin λ.
 *   5) Al pulsar Lyman α, su atajo pasa a aria-pressed="true" y el de Hα a "false".
 */

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

function resultados(page: Page): Locator {
  return page.locator('[role="status"]', { hasText: /Fotón emitido|Fotón absorbido|No hay salto/ });
}

function nivel(page: Page, grupo: RegExp, nombre: string): Locator {
  return page.getByRole('group', { name: grupo }).getByRole('button', { name: nombre, exact: true });
}

const PARTIDA = /^Nivel de partida/;
const LLEGADA = /^Nivel de llegada/;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-modelo-bohr/');
  // Sin inputs que sirvan de testigo: se espera a que la raíz de React termine de hidratar
  await esperarPaginaAsentada(page);
});

test.describe('Simulador del Modelo Atómico de Bohr', () => {
  test('1 · inicial 3 → 2: Hα de 656,47 nm, roja, 1,889 eV', async ({ page }) => {
    const zona = resultados(page);
    await expect(zona).toContainText('Fotón emitido');
    await expect(zona).toContainText('serie de Balmer');
    await expect(zona).toContainText('λ = 656,47 nm');
    await expect(zona).toContainText('Visible, rojo');
    expect(await leerTarjeta(page, 'Energía del fotón ΔE')).toBe('1,889 eV');
    expect(await leerTarjeta(page, 'Energía del nivel 3')).toBe('−1,511 eV');
    expect(await leerTarjeta(page, 'Energía del nivel 2')).toBe('−3,400 eV');
    expect(await leerTarjeta(page, 'Radio de la órbita 3 (n²·a₀)')).toBe('0,4763 nm');
    await expect(page.getByText('del libro sale 656,3 nm')).toBeVisible();
  });

  test('2 · atajo Lyman α: 121,57 nm, ultravioleta', async ({ page }) => {
    const hAlfa = page.getByRole('button', { name: /^Hα/ });
    const lyman = page.getByRole('button', { name: /^Lyman α/ });
    await expect(hAlfa).toHaveAttribute('aria-pressed', 'true');

    await lyman.click();

    await expect(lyman).toHaveAttribute('aria-pressed', 'true');
    await expect(hAlfa).toHaveAttribute('aria-pressed', 'false');
    const zona = resultados(page);
    await expect(zona).toContainText('serie de Lyman');
    await expect(zona).toContainText('λ = 121,57 nm');
    await expect(zona).toContainText('Ultravioleta: no lo ve el ojo');
    await expect(nivel(page, PARTIDA, 'Nivel 2')).toHaveAttribute('aria-pressed', 'true');
    await expect(nivel(page, LLEGADA, 'Nivel 1')).toHaveAttribute('aria-pressed', 'true');
  });

  test('3 · de 1 a ∞: se absorbe la energía de ionización, 13,598 eV', async ({ page }) => {
    await nivel(page, PARTIDA, 'Nivel 1').click();
    await nivel(page, LLEGADA, 'Nivel infinito: electrón libre').click();

    const zona = resultados(page);
    await expect(zona).toContainText('Fotón absorbido');
    await expect(zona).toContainText('límite de la serie');
    expect(await leerTarjeta(page, 'Energía del fotón ΔE')).toBe('13,598 eV');
    await expect(zona).toContainText('energía de ionización desde el nivel 1');
    // Absorción: la tira del espectro pasa a ser de absorción
    await expect(page.getByRole('heading', { level: 2, name: /Espectro visible del hidrógeno \(absorción\)/ })).toBeVisible();
  });

  test('4 · mismo nivel de partida y llegada: no hay salto ni longitud de onda', async ({ page }) => {
    await nivel(page, PARTIDA, 'Nivel 2').click();

    const zona = resultados(page);
    await expect(zona).toContainText('No hay salto');
    const texto = (await zona.textContent()) ?? '';
    expect(texto).not.toMatch(/λ =|\d\s*eV|NaN|∞ nm|Infinity/);
  });

  test('5 · la tabla de la serie marca el salto elegido', async ({ page }) => {
    const fila = page.locator('tr', { hasText: 'el elegido' });
    await expect(fila).toHaveCount(1);
    await expect(fila).toContainText('3 ↔ 2');
    await expect(fila).toContainText('656,47');
  });

  test('6 · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
  });
});

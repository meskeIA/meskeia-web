import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Simulador del Principio de Pascal y la Presión Hidrostática — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador del Principio de Pascal y la Presión Hidrostática». Tres secciones
 *   independientes, cada una con su región role="status": 1) presión a una profundidad con seis
 *   líquidos en botones con aria-pressed; 2) prensa hidráulica, con diámetros o áreas; 3) tubo en
 *   U con dos líquidos. Los tres selectores de líquido repiten los mismos botones, así que cada
 *   botón se busca dentro de su grupo (role="group" con el nombre de su h3).
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO (g = 9,81 m/s², P₀ = 101.325 Pa)
 *   1) Inicial: agua dulce a 10 m
 *        ρgh = 1000 · 9,81 · 10 = 98.100 Pa → «98.100 Pa» · 98.100/101.325 = 0,968 → «0,968 atm»
 *        P = 199.425 Pa → «199.425 Pa» · 199.425/101.325 = 1,968 → «1,968 atm»
 *        1 atm de agua: 101.325/9810 = 10,33 m → «10,33 m»
 *   2) Mercurio a 0,76 m: ρgh = 13.534 · 9,81 · 0,76 = 100.904,09 Pa → «100.904 Pa» · «0,996 atm»
 *   3) Prensa inicial: 100 N, diámetros 2 y 20 cm, x₁ = 10 cm
 *        A₁ = π cm² → «3,142 cm²» · A₂ = 100π → «314,2 cm²» · ventaja «×100»
 *        F₂ = 10.000 N → «10.000 N» · m = 10.000/9,81 = 1019,37 kg → «sostiene 1019 kg»
 *        x₂ = 10/100 cm = 1 mm → «1 mm» · W = 100 · 0,1 = 10 J → «10 J»
 *        P = 100/(π·10⁻⁴) = 318.309,9 Pa → «318.310 Pa»
 *   4) Prensa con áreas 10 y 500 cm² y 50 N: ventaja «×50» · F₂ = 2500 N → «2500 N» (cuatro
 *      cifras: sin punto de millar, como hace Intl en es-ES)
 *   5) Tubo inicial: agua en el fondo, aceite 920 añadido, 10 cm
 *        h_A = 920 · 10/1000 = 9,2 cm → «9,2 cm» · desnivel «0,8 cm» · P = 902,52 → «903 Pa»
 *   6) Tubo con el mismo líquido en las dos ramas → «Es el mismo líquido»; con mercurio añadido
 *      sobre agua → «más denso que el del fondo». En ninguno de los dos se publica una altura.
 *   7) Rechazo: profundidad vacía o de 20.000 m (más que la fosa de las Marianas, el tope de la
 *      app) → «Faltan datos» y dice qué falta, sin cifra en Pa.
 */

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

function seccion(page: Page, titulo: RegExp): Locator {
  return page.locator('section', { has: page.getByRole('heading', { level: 2, name: titulo }) });
}

function estado(page: Page, titulo: RegExp): Locator {
  return seccion(page, titulo).locator('[role="status"]');
}

function boton(page: Page, grupo: string, nombre: RegExp): Locator {
  return page.getByRole('group', { name: grupo, exact: true }).getByRole('button', { name: nombre });
}

async function escribir(page: Page, etiqueta: string, valor: string): Promise<void> {
  const caja = page.getByRole('textbox', { name: etiqueta, exact: true });
  await caja.fill(valor);
  await esperarValorEnReact(page, caja, valor);
}

const PROFUNDIDAD = /^1\. Presión a una profundidad/;
const PRENSA = /^2\. Prensa hidráulica/;
const TUBO = /^3\. Tubo en U/;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-principio-pascal/');
  await esperarHidratacion(page, ['#deslizador-profundidad']);
});

test.describe('Simulador del Principio de Pascal', () => {
  test('1 · agua dulce a 10 m: 98.100 Pa del agua y 199.425 Pa absolutos', async ({ page }) => {
    const zona = estado(page, PROFUNDIDAD);
    await expect(zona).toContainText('199.425 Pa');
    await expect(zona).toContainText('1,968 atm');
    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('98.100 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('0,968 atm');
    expect(await leerTarjeta(page, 'Profundidad que añade 1 atm')).toBe('10,33 m');
  });

  test('2 · mercurio a 0,76 m: casi una atmósfera', async ({ page }) => {
    await boton(page, 'Líquido (ρ)', /^Mercurio/).click();
    await escribir(page, 'Profundidad bajo la superficie', '0,76');

    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('100.904 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('0,996 atm');
    await expect(boton(page, 'Líquido (ρ)', /^Mercurio/)).toHaveAttribute('aria-pressed', 'true');
    await expect(boton(page, 'Líquido (ρ)', /^Agua dulce/)).toHaveAttribute('aria-pressed', 'false');
  });

  test('3 · prensa inicial: 100 N con 2 y 20 cm de diámetro dan 10.000 N', async ({ page }) => {
    const zona = estado(page, PRENSA);
    await expect(zona).toContainText('10.000 N');
    await expect(zona).toContainText('sostiene 1019 kg');
    expect(await leerTarjeta(page, 'Multiplica la fuerza (A₂/A₁)')).toBe('×100');
    expect(await leerTarjeta(page, 'Presión transmitida P = F₁/A₁')).toBe('318.310 Pa');
    expect(await leerTarjeta(page, 'Área del émbolo 1')).toBe('3,142 cm²');
    expect(await leerTarjeta(page, 'Área del émbolo 2')).toBe('314,2 cm²');
    expect(await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂')).toBe('1 mm');
    expect(await leerTarjeta(page, 'Trabajo F₁·x₁ = F₂·x₂')).toBe('10 J');
  });

  test('4 · prensa con áreas: 50 N, 10 y 500 cm² → ×50 y 2500 N', async ({ page }) => {
    const modoArea = page.getByRole('button', { name: 'Área (cm²)' });
    await modoArea.click();
    await expect(modoArea).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Diámetro (cm)' })).toHaveAttribute('aria-pressed', 'false');

    await escribir(page, 'Fuerza sobre el émbolo 1 (F₁)', '50');
    await escribir(page, 'Área del émbolo 1', '10');
    await escribir(page, 'Área del émbolo 2', '500');

    await expect(estado(page, PRENSA)).toContainText('2500 N');
    expect(await leerTarjeta(page, 'Multiplica la fuerza (A₂/A₁)')).toBe('×50');
  });

  test('5 · tubo en U: 10 cm de aceite equilibran 9,2 cm de agua', async ({ page }) => {
    const zona = estado(page, TUBO);
    await expect(zona).toContainText('9,2 cm');
    expect(await leerTarjeta(page, 'Desnivel entre superficies h_B − h_A')).toBe('0,8 cm');
    expect(await leerTarjeta(page, 'Presión de cada columna en la separación')).toBe('903 Pa');
  });

  test('6 · tubo en U sin equilibrio que calcular: mismo líquido o añadido más denso', async ({ page }) => {
    const zona = estado(page, TUBO);

    await boton(page, 'Líquido añadido en la rama derecha (B)', /^Agua dulce/).click();
    await expect(zona).toContainText('Es el mismo líquido');
    await expect(zona).not.toContainText(/\d\s*cm/);

    await boton(page, 'Líquido añadido en la rama derecha (B)', /^Mercurio/).click();
    await expect(zona).toContainText('más denso que el del fondo');
    await expect(zona).not.toContainText(/\d\s*cm/);
  });

  for (const valor of ['', '20000']) {
    test(`7 · rechazo: profundidad «${valor || 'vacía'}» → dice qué falta y no publica presión`, async ({ page }) => {
      await escribir(page, 'Profundidad bajo la superficie', valor);
      const zona = estado(page, PROFUNDIDAD);
      await expect(zona).toContainText('Faltan datos para calcular');
      await expect(zona).toContainText('la profundidad');
      const texto = (await zona.textContent()) ?? '';
      expect(texto).not.toMatch(/\d\s*(Pa|atm)\b/);
      expect(texto).not.toMatch(/NaN|∞|Infinity/);
    });
  }

  test('8 · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
  });
});

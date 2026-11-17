import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Guía de Tejidos y Fibras — spec de regresión (reparar 17/11/2026, cabo C0773).
 *
 * C0773 (campaña C0708, 15/11/2026): el filtro de sostenibilidad activo combina .sosFiltroActivo
 * (fondo --primary-boton, texto blanco) con .sosAltaBtn / .sosMediaBtn / .sosBajaBtn, que van
 * detrás en la hoja con la misma especificidad y le ganaban el color: verde, naranja o rojo de
 * texto sobre el azul del botón, ~1,2:1 en claro. Visto al reparar: el :hover de .sosFiltroBtn
 * hacía lo mismo con el azul de texto sobre el botón activo, también en «Todas».
 *
 * Se mide el contraste del texto del botón activo contra su fondo, en los dos temas y con el
 * ratón encima. Fórmula de luminancia relativa de WCAG 2.x; umbral 4,5:1 (texto normal).
 */

type Rgb = [number, number, number];

function aRgb(css: string): Rgb {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`color no reconocido: ${css}`);
  const [r, g, b] = m[1].split(',').map((x) => parseFloat(x));
  return [r, g, b];
}

function luminancia([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contraste(a: Rgb, b: Rgb): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

async function contrasteDe(page: Page, nombre: string): Promise<{ ratio: number; detalle: string }> {
  const boton = page
    .getByRole('group', { name: 'Filtrar por sostenibilidad' })
    .getByRole('button', { name: nombre });
  const { color, fondo } = await boton.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, fondo: cs.backgroundColor };
  });
  return { ratio: contraste(aRgb(color), aRgb(fondo)), detalle: `texto ${color} sobre ${fondo}` };
}

for (const tema of ['light', 'dark'] as const) {
  test(`C0773 — el filtro de sostenibilidad activo se lee sobre su fondo (${tema})`, async ({ page }) => {
    await page.goto('/guia-tejidos-fibras/');
    await esperarPaginaAsentada(page);
    // El tema se pone con la página ya asentada y se comprueba antes de medir: sembrado antes,
    // el script del tema puede devolverlo a claro y la fila oscura mediría el claro en falso.
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
    await expect(page.locator('html')).toHaveAttribute('data-theme', tema);

    const grupo = page.getByRole('group', { name: 'Filtrar por sostenibilidad' });
    for (const nombre of ['Alta', 'Media', 'Baja', 'Todas']) {
      const boton = grupo.getByRole('button', { name: nombre });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      // El clic deja el ratón encima: se aparta para medir el reposo, y se espera a que acabe
      // la transición (el botón anima `all 0.15s`)
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
      const enReposo = await contrasteDe(page, nombre);
      expect(enReposo.ratio, `${nombre} activo, en reposo: ${enReposo.detalle}`).toBeGreaterThanOrEqual(4.5);

      await boton.hover();
      await page.waitForTimeout(300);
      const conRaton = await contrasteDe(page, nombre);
      expect(conRaton.ratio, `${nombre} activo, con el ratón encima: ${conRaton.detalle}`).toBeGreaterThanOrEqual(4.5);
      await page.mouse.move(0, 0);
    }
  });
}

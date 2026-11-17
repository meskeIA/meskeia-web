import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Familia imprimible con n.º reproducible (cabo C0808, 17/11/2026).
 *
 * El botón de «otro distinto» de cada generador llamaba a la MISMA función que «Generar», que toma
 * el n.º del campo si tiene cifras: con un n.º escrito, volvía a salir la misma hoja. Fue el
 * hallazgo 4273 en generador-fichas-calculo y el 4948 en generador-laberintos (fila de control
 * aquí); medido el 17/11/2026 en las hermanas con campo de n.º, caían las tres: sudokus («Otros
 * distintos»), crucigramas («Otra disposición», justo el botón que su aviso de palabras
 * descartadas aconseja) y cartones de bingo («Otra tirada»). generador-sopa-letras se reparó
 * aparte (b46422d38) y tiene su caso en su spec.
 *
 * Esperado resuelto a mano: tras «Generar» con 12345, el botón de otro distinto da un n.º nuevo
 * de seis cifras, distinto de 12345, y vacía el campo para que el siguiente «Generar» no vuelva
 * al 12345 sin que se escriba.
 *
 * Los otros dos defectos del cabo no se repiten en las hermanas: el pie de sudokus, crucigramas y
 * cartones lee lo generado (y en cartones cambiar la modalidad vacía la tirada), y ninguna dibuja
 * la hoja en SVG, que es lo que se partía en varias páginas en laberintos (hallazgo 4947).
 */
const FILAS = [
  { slug: 'generador-laberintos', otro: /Otro distinto/ },
  { slug: 'generador-sudokus', otro: /Otros distintos/ },
  { slug: 'generador-crucigramas', otro: /Otra disposición/ },
  { slug: 'generador-cartones-bingo', otro: /Otra tirada/ },
] as const;

const CAMPO = 'input[placeholder="Al azar"]';

for (const fila of FILAS) {
  test(`REPARADO (cabo C0808) · ${fila.slug}: con el n.º 12345 escrito, el botón de otro distinto da otra hoja y vacía el campo`, async ({
    page,
  }) => {
    test.setTimeout(30_000);
    await page.goto(`/${fila.slug}/`);
    await esperarHidratacion(page, [CAMPO]);
    const campo = page.locator(CAMPO);
    await campo.fill('12345');
    await page.getByRole('button', { name: /Generar/ }).first().click();
    const cuerpo = page.locator('body');
    await expect(cuerpo).toContainText(/n\.º 12345\b/, { timeout: 15_000 });

    await page.getByRole('button', { name: fila.otro }).click();
    await expect(cuerpo).not.toContainText(/n\.º 12345\b/, { timeout: 15_000 });
    await expect(cuerpo).toContainText(/n\.º [1-9]\d{5}\b/);
    await expect(campo).toHaveValue('');
  });
}

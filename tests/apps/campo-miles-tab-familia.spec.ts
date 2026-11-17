import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Familia «handleFocus con rawValues» (cabo C0793, 17/11/2026).
 *
 * Cuatro calculadoras financieras pintan los importes con separador de miles («80.000») y, al
 * enfocar el campo, handleFocus lo cambia por el texto sin formato («80000»). Al cambiar el valor
 * del input, el navegador pierde la selección que hace Tab, y lo que se teclea se AÑADE al final:
 * entrar con Mayús+Tab en «80.000» y teclear 10000 daba 8.000.010.000. Con un importe de cuatro
 * cifras el texto no cambia al enfocar y no pasa nada: por eso el caso usa cinco o más.
 *
 * Hallazgo 4871 en calculadora-amortizacion-inmovilizado (reparado en a59cc416d, fila de control
 * aquí) y el mismo patrón en las tres hermanas. Receta: un useLayoutEffect que vuelve a
 * seleccionar el campo enfocado en cuanto React pinta el texto sin formato.
 *
 * Esperado resuelto a mano: se sustituye el valor → «10.000» al salir del campo.
 */
const FILAS = [
  {
    slug: 'calculadora-amortizacion-inmovilizado',
    campo: '#campo-valorAdquisicion',
    siguiente: '#campo-valorResidual',
    antes: '50.000',
  },
  {
    slug: 'simulador-financiacion-empresarial',
    campo: '#campo-inversion',
    siguiente: '#campo-plazoAnios',
    antes: '80.000',
  },
  {
    slug: 'calculadora-z-score-altman',
    campo: '#campo-activoCorriente',
    siguiente: '#campo-pasivoCorriente',
    antes: '450.000',
  },
  {
    slug: 'calculadora-valoracion-empresa',
    campo: '#campo-ebitda',
    siguiente: '#campo-ventas',
    antes: '290.000',
  },
] as const;

for (const fila of FILAS) {
  test(`REPARADO (cabo C0793) · ${fila.slug}: entrar con Mayús+Tab en «${fila.antes}» y teclear 10000 sustituye el valor`, async ({
    page,
  }) => {
    await page.goto(`/${fila.slug}/`);
    await esperarHidratacion(page, [fila.campo, fila.siguiente]);
    const campo = page.locator(fila.campo);
    await expect(campo).toHaveValue(fila.antes);
    await page.locator(fila.siguiente).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(campo).toBeFocused();
    await page.keyboard.type('10000');
    await page.keyboard.press('Tab');
    await expect(campo).toHaveValue('10.000');
  });
}

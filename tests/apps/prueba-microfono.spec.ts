import { test, expect, type Page } from '@playwright/test';

/**
 * prueba-microfono — el aviso cuando el micrófono no se puede abrir (cabo C0707, 11/11/2026).
 *
 * La app elegía el aviso buscando 'Permission denied', 'NotAllowedError' y 'NotFoundError' en
 * err.message. Ningún navegador pone el NOMBRE del error en el mensaje: la rama «sin micrófono»
 * no se ejecutaba nunca (Chrome dice «Requested device not found») y, fuera de Chrome, el permiso
 * denegado (Safari: «The request is not allowed by the user agent or the platform in the current
 * context…») salía como «Error al acceder al micrófono: <mensaje en inglés>». Mismo defecto que
 * el hallazgo 4429 de prueba-camara.
 *
 * CASOS, con el `name` y el `message` literales de cada navegador:
 *   · NotFoundError «Requested device not found» (Chrome sin micrófono) → «No se encontró ningún
 *     micrófono» · antes: «Error al acceder al micrófono: Requested device not found».
 *   · NotAllowedError con el mensaje de Safari → «Permiso denegado» · antes: el mensaje en inglés.
 *   · NotReadableError «Could not start audio source» (ocupado por otra app) → «ocupado».
 *   · Y en ninguno de los tres sale texto en inglés.
 *
 * El doble clic en «Iniciar Micrófono» (cabo C0715) lo mide el testigo de familia
 * tests/familias/apertura-medio-doble-clic.spec.ts.
 */

async function rechazarCon(page: Page, nombre: string, mensaje: string): Promise<void> {
  await page.addInitScript(
    ([n, m]: [string, string]) => {
      navigator.mediaDevices.getUserMedia = async (): Promise<MediaStream> => {
        throw new DOMException(m, n);
      };
    },
    [nombre, mensaje] as [string, string],
  );
}

async function iniciar(page: Page): Promise<void> {
  await page.goto('/prueba-microfono/');
  const boton = page.getByRole('button', { name: /Iniciar Micrófono/ });
  await expect(boton).toBeVisible();
  await expect
    .poll(() => boton.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);
  await boton.click();
}

const CASOS: { nombre: string; mensaje: string; esperado: RegExp; navegador: string }[] = [
  {
    navegador: 'Chrome sin micrófono',
    nombre: 'NotFoundError',
    mensaje: 'Requested device not found',
    esperado: /No se encontró ningún micrófono/,
  },
  {
    navegador: 'Safari con el permiso denegado',
    nombre: 'NotAllowedError',
    mensaje:
      'The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.',
    esperado: /Permiso denegado/,
  },
  {
    navegador: 'micrófono ocupado por otra app',
    nombre: 'NotReadableError',
    mensaje: 'Could not start audio source',
    esperado: /ocupado/,
  },
];

for (const c of CASOS) {
  test(`C0707 · ${c.navegador} (${c.nombre}): el aviso lo dice en castellano`, async ({ page }) => {
    await rechazarCon(page, c.nombre, c.mensaje);
    await iniciar(page);
    const aviso = page.getByRole('alert').filter({ hasText: /micrófono/ });
    await expect(aviso).toContainText(c.esperado);
    await expect(aviso).not.toContainText(c.mensaje);
    await expect(aviso).not.toContainText('Error al acceder');
  });
}

import { test, expect, type Page } from '@playwright/test';

/**
 * Accesibilidad de los componentes que monta TODO el catálogo.
 *
 * Por qué existe este fichero, y por qué no vive en el spec de ninguna app:
 *
 * `MeskeiaLogo`, `RelatedApps` y `Footer` están en las 1.152 apps. Sus emojis decorativos iban
 * sin `aria-hidden`, así que un lector de pantalla verbalizaba «luna creciente», «eslabón de
 * cadena» y «bombilla» en cada una de ellas — y cuatro veces más por los iconos de las tarjetas
 * de apps relacionadas. Se encontró el 25/08/2026 reparando la tanda 3 de la ronda del
 * Inspector, mirando por qué el test de a11y de `simulador-titulacion` seguía en rojo con la
 * app ya limpia: los emojis que quedaban no eran de la app.
 *
 * NINGÚN CANDADO PUEDE VIGILAR ESTO:
 *   · `check:a11y-jsx` juzga las líneas que cada commit AÑADE, y estos ficheros son viejos.
 *   · Y aunque las juzgara, tres de los seis casos salen de expresiones (`{icon}`, `{app.icon}`,
 *     el ternario del tema) y no de texto JSX, que es lo único que el candado sabe leer.
 * De ahí que la garantía tenga que ser un test, y que se compruebe sobre el DOM servido.
 *
 * Los tests de a11y de cada app se acotan a su propio CSS Module precisamente para no mezclar
 * este pasivo compartido con los defectos propios de la app.
 */

// Una app cualquiera sirve: lo que se mira son los componentes, no la app.
const RUTA = '/simulador-titulacion/';

/** Emojis de los tres componentes compartidos que un lector de pantalla llegaría a leer. */
async function emojisSueltos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    const DE_ESTOS_COMPONENTES = /MeskeiaLogo|RelatedApps|Footer/;

    return [...document.querySelectorAll('span, div, button, a')]
      .filter((e) => DE_ESTOS_COMPONENTES.test(e.className || ''))
      .filter((e) => emoji.test(e.textContent || ''))
      // Solo el nodo que contiene el emoji, no sus ancestros
      .filter((e) => ![...e.children].some((h) => emoji.test(h.textContent || '')))
      // Y solo si de verdad se anuncia: ni oculto, ni con nombre propio
      .filter((e) => e.getAttribute('aria-hidden') !== 'true' && !e.closest('[aria-hidden="true"]'))
      .filter((e) => e.getAttribute('aria-label') === null)
      .map((e) => `${(e.className || '').split('__').pop()} :: ${(e.textContent || '').trim().slice(0, 30)}`);
  });
}

test.describe('Componentes compartidos · accesibilidad', () => {
  test('ningún emoji decorativo de MeskeiaLogo, RelatedApps o Footer se lee en voz alta', async ({ page }) => {
    await page.goto(RUTA);
    const sueltos = await emojisSueltos(page);
    expect(sueltos, `emojis sin aria-hidden: ${sueltos.join(' · ')}`).toEqual([]);
  });

  test('el conmutador de tema se nombra por su etiqueta, no por su emoji', async ({ page }) => {
    await page.goto(RUTA);
    // El botón dice qué hace; el ☀️/🌙 es la pista visual de lo mismo.
    const boton = page.getByRole('button', { name: /Cambiar a modo (oscuro|claro)/ });
    await expect(boton).toHaveCount(1);
    const nombre = await boton.getAttribute('aria-label');
    expect(nombre, 'el nombre accesible no debe contener el emoji').not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  test('cada tarjeta de apps relacionadas se nombra por su app, no por su icono', async ({ page }) => {
    await page.goto(RUTA);
    // `a[...]`: los `span` de dentro (cardIcon, cardName, cardDesc) también casan «card» y no
    // tienen —ni deben tener— nombre accesible propio. La tarjeta es el ENLACE.
    const tarjetas = page.locator('a[class*="RelatedApps"][class*="card"]');
    const total = await tarjetas.count();
    expect(total, 'la app debería mostrar apps relacionadas').toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
      const etiqueta = await tarjetas.nth(i).getAttribute('aria-label');
      expect(etiqueta, `tarjeta ${i} sin nombre accesible`).toMatch(/^Ir a /);
    }
  });

  test('el aviso de «enlace copiado» es una región live, no solo un cartel', async ({ page }) => {
    await page.goto(RUTA);
    // Aparece sin mover el foco: sin `role="status"`, quien no lo ve no se entera de que
    // la acción ha funcionado.
    const fuente = await page.locator('body').innerHTML();
    expect(fuente).toContain('Compártela');

    await page.getByRole('button', { name: /Compártela/ }).click();
    // Acotado al del Footer: `components/ui/Toast.tsx` usa la misma clase y no es este.
    const aviso = page.locator('[class*="Footer"][class*="toast"]');
    // En navegadores con Web Share nativo se abre el diálogo del sistema y no hay toast; se
    // comprueba solo si el camino del portapapeles es el que se ha tomado.
    if (await aviso.count()) {
      await expect(aviso).toHaveAttribute('role', 'status');
      await expect(aviso).toHaveAttribute('aria-live', 'polite');
    }
  });
});

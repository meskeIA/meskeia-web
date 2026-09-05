import { test, expect, Page } from '@playwright/test';
import { RECLAMACION_PREVIA_SS } from '../../data/fiscal/pensiones';

/**
 * ESTIMADOR DE PENSIÓN DE VIUDEDAD — regresión del trámite de reclamación previa.
 *
 * POR QUÉ EXISTE ESTE FICHERO
 * ───────────────────────────
 * No cubre el cálculo de la pensión, que no se ha tocado. Cubre UNA cosa: que el paso 5 de
 * la guía describa la reclamación previa leyéndola de `RECLAMACION_PREVIA_SS`
 * (data/fiscal/pensiones.ts) y no tecleada a mano.
 *
 * El 05/09/2026, al reparar el hallazgo 605 en `verificador-complemento-brecha-genero`, esta
 * página decía «tienes 30 días para presentar reclamación previa» escrito directamente en el
 * JSX y sin calificar los días. No publicaba un dato falso —el defecto del hallazgo era
 * afirmar «naturales», y aquí no se afirmaba nada—, pero era la MISMA norma en un segundo
 * sitio, fuera del alcance de /triaje-fiscal: en cuanto se corrigió una app, las dos dejaron
 * de decir lo mismo. Es el modo de fallo documentado de `data/itp-ccaa.ts`, donde dos tablas
 * del mismo tributo divergieron sin que nada avisara.
 *
 * DE DÓNDE SALE CADA CIFRA
 * ────────────────────────
 * Toda expectativa se deriva de `RECLAMACION_PREVIA_SS`, sellada en
 * `RECLAMACION_PREVIA_SS_META` el 05/09/2026 contra el texto consolidado del BOE (art. 71
 * LRJS + art. 30.2 Ley 39/2015). NINGÚN literal se teclea aquí: si el módulo cambia, este
 * test debe seguir pasando; si la página deja de leerlo, debe caer.
 */

const RUTA = '/estimador-pension-viudedad/';

/** El formato es-ES separa la cifra del € con espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

function normalizar(texto: string): string {
  return texto.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

/** Abre la sección educativa, que es donde vive la guía del trámite. */
async function abrirGuia(page: Page): Promise<void> {
  await page.goto(RUTA);
  const boton = page.getByRole('button', { name: 'Ver guía educativa' });
  if (await boton.isVisible()) await boton.click();
  await expect(page.getByText('Espera la resolución del INSS')).toBeVisible();
}

test.describe('Estimador de pensión de viudedad — reclamación previa', () => {
  test('el plazo se publica en días HÁBILES y sale de data/fiscal', async ({ page }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    // El módulo manda: si alguien lo devuelve a 'naturales', cae aquí antes que en la página.
    expect(RECLAMACION_PREVIA_SS.tipoDias).toBe('hábiles');
    expect(guia).toContain(`${RECLAMACION_PREVIA_SS.dias} días ${RECLAMACION_PREVIA_SS.tipoDias}`);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.norma);
    // La forma que publicaba el defecto hermano no puede aparecer tampoco aquí.
    expect(guia).not.toContain(`${RECLAMACION_PREVIA_SS.dias} días naturales`);
  });

  test('la guía dice que perder el plazo NO extingue el derecho (art. 71.4 LRJS)', async ({
    page,
  }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    expect(RECLAMACION_PREVIA_SS.reiteracion.puede).toBe(true);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.reiteracion.detalle);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.reiteracion.norma);
  });

  test('la guía dice cuándo se abre la vía judicial por silencio (art. 71.5 LRJS)', async ({
    page,
  }) => {
    await abrirGuia(page);
    const guia = normalizar(await page.locator('body').innerText());

    // Sin este dato, quien no recibe respuesta no sabe que ya puede demandar.
    expect(guia).toContain(RECLAMACION_PREVIA_SS.resolucion.detalle);
    expect(guia).toContain(RECLAMACION_PREVIA_SS.resolucion.norma);
  });
});

import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from './_contraste';

/**
 * El botón ACTIVO se distingue también en oscuro — cabo C0868 (21/11/2026).
 *
 * La forma: un módulo CSS con `[data-theme='dark'] .filtroBtn { background: … }` (especificidad
 * 0,2,0) y `.filtroBtnActivo { background: var(--primary-boton); … }` (0,1,0) sin su variante
 * oscura. En oscuro gana la regla de la base y el filtro elegido pierde su relleno: queda como los
 * demás salvo por el borde, y su estado solo lo dice aria-pressed. Caso de origen:
 * visualizador-cicatrizacion (hallazgo 5384), donde el activo salía idéntico a los inactivos.
 *
 * Mide el comportamiento, no el CSS: en cada tema, el fondo del botón con aria-pressed="true" de
 * un grupo frente al de uno con aria-pressed="false". En claro tienen que diferir (control: así
 * marca el diseño el elegido) y en oscuro también.
 *
 * Familia de los filtros de las guías y calculadoras de cocina (censo estático de C0868 del
 * 21/11/2026: 18 apps con la misma pareja de reglas; calculadora-encurtidos, calculadora-mermelada,
 * descongelacion-segura, fermentados-vegetales, guia-chocolate, guia-harinas, guia-maices,
 * guia-tipos-sal y guia-tuberculos-latam la traen en el módulo pero no pintan ningún .filtroBtn, y
 * quedan fuera). Para medir otra app con la misma forma, su fila aquí con el selector del grupo.
 */

interface App {
  slug: string;
  /** Grupo de botones con aria-pressed */
  grupo: string;
}

const GRUPO_FILTROS = "[role='group']";

const APPS: App[] = [
  ...[
    'alergenos-alimentarios',
    'calculadora-caducidad',
    'calculadora-congelacion',
    'glosario-tecnicas-cocina',
    'guia-azucares',
    'guia-chiles',
    'puntos-humo-aceites',
    'tipos-corte-cocina',
  ].map((slug) => ({ slug, grupo: GRUPO_FILTROS })),
  // Su primer grupo es el de ingredientes, que ya tenía variante oscura: se mide el de la dieta
  { slug: 'sustituciones-ingredientes', grupo: "[role='group'][aria-label='Filtro por dieta']" },
];

/** Fondo calculado del primer botón activo y del primer inactivo del mismo grupo */
async function fondos(page: Page, grupo: string): Promise<{ activo: string; inactivo: string }> {
  return page.evaluate((sel) => {
    for (const g of Array.from(document.querySelectorAll(sel))) {
      const activo = g.querySelector('button[aria-pressed="true"]');
      const inactivo = g.querySelector('button[aria-pressed="false"]');
      if (activo && inactivo) {
        return { activo: getComputedStyle(activo).backgroundColor, inactivo: getComputedStyle(inactivo).backgroundColor };
      }
    }
    return { activo: 'sin grupo', inactivo: 'sin grupo' };
  }, grupo);
}

for (const { slug, grupo } of APPS) {
  test(`${slug}: el botón activo conserva su relleno en oscuro (C0868)`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await expect(page.locator(`${grupo} button[aria-pressed="true"]`).first()).toBeVisible();
    const claro = await fondos(page, grupo);
    expect(claro.activo, 'claro: el grupo existe').not.toBe('sin grupo');
    expect(claro.activo, 'claro: el activo tiene otro fondo (control)').not.toBe(claro.inactivo);
    await activarTemaOscuro(page);
    const oscuro = await fondos(page, grupo);
    expect(oscuro.activo, `oscuro: el activo tiene otro fondo que el inactivo (${oscuro.inactivo})`).not.toBe(oscuro.inactivo);
  });
}

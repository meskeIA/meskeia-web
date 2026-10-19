import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, medirContraste, prepararParaMedir } from './_contraste';
import { esperarPaginaAsentada } from './apps/_hidratacion';

/**
 * Texto semántico (verde, rojo, ámbar, naranja) escrito a mano en un módulo, medido por píxel en
 * los DOS temas — cabo C0296 (19/10/2026).
 *
 * DE DÓNDE SALE: al reparar C0226 (solo tema oscuro) se vio que en CLARO tampoco cumplían:
 *   · adaptacion-hogar: «Prioritario» #E74C3C sobre #fdf2f2 (3,6:1), «Recomendado» #E67E22
 *     sobre #fef9e7 (2,8:1) y el badge de ayudas #27AE60 sobre #e8f8e8 (2,6:1);
 *   · mi-ip: 3G #ffc107 sobre la tarjeta (1,6:1), 2G Lento #DC3545 (3,9:1), 4G #28A745 (3,1:1),
 *     2G #fd7e14 (2,4:1) y los avisos en #b38600 (3,1:1).
 * La lista de colores lleva los de ANTES y los de AHORA (el medidor los reconoce con un margen
 * de 24 por canal): con los de antes reinyectados el peor vuelve a quedar por debajo del umbral.
 */

const ADAPTACION = [
  // antes
  '#E74C3C', '#E67E22', '#27AE60',
  // ahora: claro y oscuro
  '#B91C1C', '#9A3412', '#166534', '#FCA5A5', '#FDBA74', '#86EFAC',
];
const MI_IP = [
  '#ffc107', '#DC3545', '#28A745', '#fd7e14', '#b38600',
  '#92400E', '#9A3412', '#B91C1C', '#166534', '#FCA5A5', '#86EFAC',
];

async function abrir(page: Page, ruta: string, oscuro: boolean) {
  await page.goto(ruta);
  await esperarPaginaAsentada(page);
  await prepararParaMedir(page);
  if (oscuro) await activarTemaOscuro(page);
}

for (const oscuro of [false, true]) {
  const tema = oscuro ? 'oscuro' : 'claro';

  test(`adaptacion-hogar (${tema}): los badges de prioridad y de ayudas se leen`, async ({ page }) => {
    await abrir(page, '/adaptacion-hogar/', oscuro);
    const m = await medirContraste(page, { selector: '[class*="badge"]', texto: ADAPTACION });
    expect(m.vistos, 'no ha encontrado ningún badge que medir').toBeGreaterThan(0);
    expect(m.ratio, `«${m.texto}» ${m.color} sobre ${m.fondo}`).toBeGreaterThanOrEqual(m.umbral);
  });

  test(`mi-ip (${tema}): la velocidad de conexión y los avisos se leen`, async ({ page }) => {
    await abrir(page, '/mi-ip/', oscuro);
    const m = await medirContraste(page, { texto: MI_IP });
    // Lo que pinta depende de lo que informe el navegador (tipo de conexión, IP): si no pinta
    // ninguno de estos colores, no hay nada que medir, y eso no es un aprobado.
    test.skip(m.vistos === 0, 'el navegador no ha pintado ningún texto semántico');
    expect(m.ratio, `«${m.texto}» ${m.color} sobre ${m.fondo}`).toBeGreaterThanOrEqual(m.umbral);
  });
}

import { test, expect } from '@playwright/test';

/**
 * El interruptor de modo oscuro cambia el tema de verdad.
 *
 * Antes esto era un script de depuración: no tenía ni una aserción, solo capturas y
 * `console.log`, y buscaba el toggle con `[class*="themeToggle"]` en la portada. Pero la
 * portada renderiza `<MeskeiaLogo showThemeToggle={false} />`, así que ese control no
 * existe ahí: el test agotaba sus 30 segundos y salía en rojo en cada ejecución de la
 * suite desde hacía semanas (21/08/2026).
 *
 * Se convierte en lo que debía ser. El modo oscuro es una regla obligatoria del proyecto
 * —cada elemento con su variante bajo [data-theme='dark']—, así que merece una regresión
 * de verdad: que el control esté donde el usuario puede alcanzarlo, que cambie el
 * atributo que gobierna toda la paleta, y que el fondo cambie con él.
 */
test('el interruptor del Sidebar cambia el tema y el fondo de la página', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // El overlay de Next.js Dev Tools se planta en la esquina inferior, justo encima del
  // interruptor, e intercepta el clic. Solo existe en `next dev`, no en producción.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });

  const interruptor = page.getByRole('button', { name: /Cambiar a modo (oscuro|claro)/ }).first();
  await expect(interruptor).toBeVisible();

  const tema = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const fondo = () =>
    page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

  const temaInicial = await tema();
  const fondoInicial = await fondo();

  await interruptor.click();
  await expect
    .poll(tema, { message: 'el atributo data-theme no cambió al pulsar el interruptor' })
    .not.toBe(temaInicial);

  const temaNuevo = await tema();
  expect(['light', 'dark']).toContain(temaNuevo);
  // El atributo no sirve de nada si la paleta no lo sigue: el fondo tiene que moverse.
  // Con `poll` porque el fondo va con transición: en el instante del cambio de atributo
  // el color computado es todavía el de partida.
  await expect.poll(fondo, { message: 'el fondo no siguió al tema' }).not.toBe(fondoInicial);

  // Y vuelve, que es la mitad que se suele olvidar.
  await page.getByRole('button', { name: /Cambiar a modo (oscuro|claro)/ }).first().click();
  await expect.poll(tema).toBe(temaInicial);
  await expect.poll(fondo).toBe(fondoInicial);
});

/**
 * Cabo C0042 (12/10/2026) — una carga de página registra UNA visita aunque la app cambie de fase.
 *
 * Estas cinco apps tienen un `return` por fase (portada, cuestionario, resultado; lista, editor,
 * seguimiento…), cada uno con su `<Footer appName>` como último hijo del `.container`. Como lo
 * que va delante cambia de una fase a otra, el Footer cae en otra posición del árbol y React no
 * lo reconcilia: lo desmonta y lo vuelve a montar, y con él el `AnalyticsTracker`, cuyo efecto
 * de montaje hace un POST /api/analytics/track/, es decir, una VISITA nueva. Es la forma de los
 * hallazgos 2175 y 2176 de test-perfil-inversor, que fabricaba su firma de rotura.
 *
 * La reparación: `key="pie"` en cada Footer. Entre hermanos con clave, React empareja por la
 * clave y no por la posición, así que con la misma raíz (`div.container`) en todas las fases el
 * Footer es el mismo componente de principio a fin.
 *
 * En localhost el tracker no envía nada, pero cada montaje escribe en consola «[Analytics]
 * Desactivado en entorno de desarrollo»: eso es lo que se cuenta, siempre contra la propia
 * carga, así que vale también bajo `next dev` (el modo estricto duplica los montajes).
 */
import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

function contarMontajesDelTracker(page: Page): () => number {
  let n = 0;
  page.on('console', (m) => {
    if (m.text().includes('[Analytics] Desactivado en entorno de desarrollo')) n++;
  });
  return () => n;
}

async function cargar(page: Page, ruta: string): Promise<() => number> {
  const montajes = contarMontajesDelTracker(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(ruta);
  await esperarPaginaAsentada(page);
  expect(montajes(), 'el testigo existe: la carga sí se cuenta').toBeGreaterThan(0);
  return montajes;
}

async function sinMontajesNuevos(page: Page, montajes: () => number, base: number): Promise<void> {
  await esperarPaginaAsentada(page);
  await page.waitForTimeout(300);
  expect(montajes() - base, 'montajes del tracker al cambiar de fase').toBe(0);
}

test('recordatorio-medicacion: hoy → lista → hoy → añadir no registra visitas nuevas', async ({ page }) => {
  const montajes = await cargar(page, '/recordatorio-medicacion/');
  const base = montajes();
  await page.getByRole('button', { name: /Mis medicamentos/ }).click();
  await expect(page.getByRole('button', { name: /Vista del día/ })).toBeVisible();
  await page.getByRole('button', { name: /Vista del día/ }).click();
  await page.getByRole('button', { name: /^\+ Añadir$/ }).click();
  await expect(page.getByRole('button', { name: /Mis medicamentos/ })).toHaveCount(0);
  await sinMontajesNuevos(page, montajes, base);
});

test('planificador-rutinas: lista → editor → lista no registra visitas nuevas', async ({ page }) => {
  const montajes = await cargar(page, '/planificador-rutinas/');
  const base = montajes();
  await page.getByRole('button', { name: 'Crear nueva rutina' }).click();
  await expect(page.getByRole('button', { name: /← Volver/ })).toBeVisible();
  await page.getByRole('button', { name: /← Volver/ }).click();
  await expect(page.getByRole('button', { name: 'Crear nueva rutina' })).toBeVisible();
  await sinMontajesNuevos(page, montajes, base);
});

test('historias-sociales: lista → crear → lista no registra visitas nuevas', async ({ page }) => {
  const montajes = await cargar(page, '/historias-sociales/');
  const base = montajes();
  await page.getByRole('button', { name: /Crear (historia|mi primera historia)/ }).first().click();
  await expect(page.getByRole('button', { name: /^Cancelar$/ })).toBeVisible();
  await page.getByRole('button', { name: /^Cancelar$/ }).click();
  await expect(page.getByRole('button', { name: /Crear (historia|mi primera historia)/ }).first()).toBeVisible();
  await sinMontajesNuevos(page, montajes, base);
});

test('selector-vehiculo: portada → primera pregunta no registra una visita nueva', async ({ page }) => {
  const montajes = await cargar(page, '/selector-vehiculo/');
  const base = montajes();
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await expect(page.getByRole('button', { name: /Empezar el test/ })).toHaveCount(0);
  await sinMontajesNuevos(page, montajes, base);
});

test('selector-tipo-gimnasio: cuestionario → resultado no registra una visita nueva', async ({ page }) => {
  const montajes = await cargar(page, '/selector-tipo-gimnasio/');
  const base = montajes();
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
    await page.locator('[role="radiogroup"] [role="radio"]').first().click();
    await page.getByRole('button', { name: i === 9 ? 'Ver mi resultado' : 'Siguiente pregunta' }).click();
    await page.waitForTimeout(500); // el guard de doble toque de la familia
  }
  await page.getByRole('heading', { name: 'Tu resultado', level: 1 }).waitFor();
  await sinMontajesNuevos(page, montajes, base);
});

/**
 * Cabo C0224 (12/10/2026): durante el juego quiz-tipos-plantas devuelve otra raíz SIN Footer a
 * propósito («sin header ni footer»), así que la `key` no basta: el pie desaparece y, al ver los
 * resultados, se monta otra vez y cuenta otra visita por partida. La reparación que decidió el
 * usuario no cambia nada en pantalla: el tracker se monta una vez, fuera de las fases, y los
 * Footer de la app no lo llevan.
 */
test('quiz-tipos-plantas: portada → partida entera → resultados no registra una visita nueva', async ({ page }) => {
  const montajes = await cargar(page, '/quiz-tipos-plantas/');
  const base = montajes();
  await page.getByRole('button', { name: /^Modo rápido/ }).click();
  const siguiente = page.getByRole('button', { name: /^(Siguiente|Ver resultados) →$/ });
  for (let i = 0; i < 20; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} / 20`)).toBeVisible();
    await page.locator('[class*="opcionesGrid"] button').first().click();
    await siguiente.click();
  }
  await expect(page.getByText(`Pregunta 20 / 20`)).toHaveCount(0);
  await expect(page.locator('footer').first()).toBeVisible();
  await sinMontajesNuevos(page, montajes, base);
});

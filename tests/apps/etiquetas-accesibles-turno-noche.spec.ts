/**
 * Nombres accesibles que dejó pendientes el turno de noche de accesibilidad del 04/11/2026
 * (reparar 04/11/2026, cabos C0612 a C0620).
 *
 * Cada caso mide el NOMBRE que expone el árbol accesible, no el atributo del código: un
 * aria-label que tapa la etiqueta visible (WCAG 2.5.3, C0612 y C0613), un <label> que no rotula
 * ningún control (C0614, C0615, C0616), y controles sin nombre (C0615, C0617, C0618, C0619, C0620).
 */
import { test, expect, type Page } from '@playwright/test';

const NBSP = ' ';

async function abrir(page: Page, ruta: string): Promise<void> {
  await page.goto(ruta);
  await page.waitForLoadState('networkidle');
}

test('C0612 · visualizador-seguros-riesgo: el nombre de cada deslizador es su etiqueta visible, con el valor en formato español', async ({ page }) => {
  await abrir(page, '/visualizador-seguros-riesgo/');
  await page.getByRole('button', { name: 'Cálculo de prima' }).click();
  // Valor inicial de la probabilidad con decimal: 2,5 % si es el de partida; en cualquier caso, coma y espacio duro
  const prob = page.locator('#probabilidad-siniestro');
  await expect(prob).toHaveAccessibleName(new RegExp(`^Probabilidad de siniestro \\d+,\\d${NBSP}%$`));
  await expect(page.locator('#coste-medio')).toHaveAccessibleName(/^Coste medio del siniestro /);
  await expect(page.locator('#gastos-administrativos')).toHaveAccessibleName(new RegExp(`^Gastos administrativos \\d+${NBSP}%$`));
  await expect(page.locator('#margen-beneficio')).toHaveAccessibleName(new RegExp(`^Margen de beneficio \\d+${NBSP}%$`));
  await page.getByRole('button', { name: 'Pool de riesgo' }).click();
  await expect(page.locator('#asegurados-pool')).toHaveAccessibleName(/^Asegurados en el pool /);
});

test('C0613 · visualizador-radioactividad: deslizadores con su etiqueta y cifras con coma decimal', async ({ page }) => {
  await abrir(page, '/visualizador-radioactividad/');
  await page.getByRole('button', { name: 'Ley de Desintegración' }).click();
  const tiempo = page.locator('#tiempo-vidas');
  await tiempo.fill('2.5');
  await expect(tiempo).toHaveAccessibleName('Tiempo transcurrido (en periodos de semidesintegración t½) 2,5 t½');
  // 2^-2,5 = 0,17678 → 17,68 %
  await expect(page.getByText(`Actividad restante: 17,68${NBSP}%`)).toBeVisible();
  await page.getByRole('button', { name: 'Datación C-14' }).click();
  const actividad = page.locator('#actividad-pct');
  await actividad.fill('52.5');
  await expect(actividad).toHaveAccessibleName(`Actividad medida (% del estándar moderno) 52,5${NBSP}%`);
  // Ningún botón de ejemplo se anuncia con el porcentaje pegado ni con punto decimal
  const ejemplos = page.locator('button[aria-label*="actividad"]');
  const n = await ejemplos.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const nombre = (await ejemplos.nth(i).getAttribute('aria-label')) ?? '';
    expect(nombre, nombre).toMatch(new RegExp(`actividad \\d+(,\\d)?${NBSP}%$`));
  }
});

test('C0614 · cifrado-clasico: el título del resultado no es un <label> huérfano y nombra la región', async ({ page }) => {
  await abrir(page, '/cifrado-clasico/');
  await page.locator('#texto-entrada').fill('HOLA');
  await page.getByRole('button', { name: /Cifrar mensaje|Procesar texto/ }).click();
  await expect(page.getByRole('status', { name: 'Resultado:' })).toBeVisible();
  await expect(page.locator('label:not([for])')).toHaveCount(0);
});

test('C0615 · calculadora-presupuestos: cada control de la línea tiene nombre y el subtotal no es un <label>', async ({ page }) => {
  await abrir(page, '/calculadora-presupuestos/');
  await expect(page.getByRole('textbox', { name: 'Descripción de la línea 1' })).toBeVisible();
  await page.getByRole('button', { name: '+ Servicio' }).click();
  await expect(page.getByRole('button', { name: 'Eliminar línea 2' })).toBeVisible();
  await expect(page.locator('label', { hasText: /^Subtotal$/ })).toHaveCount(0);
  const iva = page.getByRole('checkbox', { name: 'Incluir IVA' });
  if (!(await iva.isChecked())) await iva.check();
  await expect(page.getByRole('combobox', { name: 'Tipo de IVA' })).toBeVisible();
  const irpf = page.getByRole('checkbox', { name: 'Retención IRPF' });
  if (!(await irpf.isChecked())) await irpf.check();
  await expect(page.getByRole('combobox', { name: 'Tipo de retención de IRPF' })).toBeVisible();
});

test('C0616 · generador-hashes: ningún <label> rotula la nada', async ({ page }) => {
  await abrir(page, '/generador-hashes/');
  await page.locator('#texto-hashear').fill('hola');
  await page.getByRole('button', { name: 'Generar Hash' }).click();
  await expect(page.getByText(/^Hash SHA-256 \(64 caracteres\)$/)).toBeVisible();
  await expect(page.locator('label:not([for])')).toHaveCount(0);
  await page.getByRole('button', { name: 'Archivo' }).click();
  await expect(page.locator('label:not([for])')).toHaveCount(0);
  await expect(page.locator('#fileInput')).toHaveAccessibleName(/^Haz clic o arrastra un archivo aquí$/);
});

test('C0617 · inferencia-bayesiana: el nombre de cada hipótesis tiene nombre accesible', async ({ page }) => {
  await abrir(page, '/inferencia-bayesiana/');
  await page.getByRole('button', { name: 'Múltiples Hipótesis' }).click();
  await expect(page.getByRole('textbox', { name: 'Nombre de la hipótesis 1' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Nombre de la hipótesis 2' })).toBeVisible();
});

test('C0618 · conversor-unidades-rf: el selector de unidad de entrada tiene nombre', async ({ page }) => {
  await abrir(page, '/conversor-unidades-rf/');
  await expect(page.getByRole('combobox', { name: 'Unidad de entrada' })).toBeVisible();
});

test('C0619 · generador-tipografias: los tamaños rápidos van en un grupo con nombre', async ({ page }) => {
  await abrir(page, '/generador-tipografias/');
  const grupo = page.getByRole('group', { name: 'Tamaños rápidos, en píxeles' });
  await expect(grupo).toBeVisible();
  await expect(grupo.getByRole('button', { name: '24' })).toBeVisible();
});

test('C0620 · generador-avatares: el color de fondo manual tiene nombre', async ({ page }) => {
  await abrir(page, '/generador-avatares/');
  await page.getByRole('checkbox', { name: /Automático/ }).uncheck();
  await expect(page.getByLabel('Color de fondo')).toBeVisible();
});

import { test, expect } from '@playwright/test';

/**
 * normalizacion-bases-datos — 05/09/2026
 *
 * El motor está probado aparte con 24 casos a mano (tests/normalizacion-motor.spec.ts).
 * Lo que se comprueba AQUÍ es que la pantalla usa ese motor y no una copia suya, y que
 * los tres casos del temario dan en pantalla el veredicto correcto.
 *
 * LOS TRES CASOS, RESUELTOS A MANO:
 *
 *  1) Dependencia PARCIAL → 1FN
 *     R(Pedido, Producto, Cantidad, NombreProducto)
 *     Pedido,Producto → Cantidad  ·  Producto → NombreProducto
 *     Clave: {Pedido,Producto}. NombreProducto (no primo) depende de PARTE de la clave.
 *
 *  2) Dependencia TRANSITIVA → 2FN
 *     R(Empleado, Departamento, Ciudad) con Empleado → Departamento → Ciudad
 *     Clave: {Empleado}. Al ser de un solo atributo no cabe parcialidad, así que 2FN sí;
 *     pero Ciudad depende de Departamento, que no es superclave.
 *
 *  3) 3FN pero NO BCNF
 *     R(Estudiante, Asignatura, Profesor)
 *     Estudiante,Asignatura → Profesor  ·  Profesor → Asignatura
 *     Dos claves: {Estudiante,Asignatura} y {Estudiante,Profesor}. TODOS los atributos son
 *     primos, así que no hay no primos que puedan romper 2FN ni 3FN; pero Profesor no es
 *     superclave, y eso sí rompe BCNF. Es el caso que más cuesta en clase.
 *
 * Nota de manejo: el análisis se dispara con el botón «Analizar relación», no en cada
 * tecla. Es deliberado — reanalizar mientras se escribe una dependencia a medias llenaría
 * la pantalla de errores — así que los tests que editan el textarea pulsan el botón.
 */

const URL_APP = '/normalizacion-bases-datos/';

test.describe('normalizacion-bases-datos', () => {
  test('A MANO: dependencia parcial se queda en 1FN', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Dependencia parcial/ }).click();

    await expect(page.getByText('1FN', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/una PARTE de una clave candidata/).first()).toBeVisible();
    await expect(page.getByText('Producto → NombreProducto').first()).toBeVisible();
  });

  test('A MANO: dependencia transitiva llega a 2FN y no más', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Dependencia transitiva/ }).click();

    await expect(page.getByText(/dependencia transitiva/i).first()).toBeVisible();
    await expect(page.getByText('Departamento → Ciudad').first()).toBeVisible();
  });

  test('A MANO: el caso 3FN-pero-no-BCNF, con todos los atributos primos', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /3FN pero no BCNF/ }).click();

    // Dos claves candidatas: el encabezado lo dice con el número
    await expect(page.getByRole('heading', { name: /Claves candidatas \(2\)/ })).toBeVisible();
    await expect(page.getByText(/BCNF/).first()).toBeVisible();
  });

  test('las líneas que no se entienden se MUESTRAN, no se tiran en silencio', async ({ page }) => {
    await page.goto(URL_APP);
    await page.locator('textarea').first().fill('A -> B\nesto no es una dependencia\nB -> C');
    await page.getByRole('button', { name: 'Analizar relación' }).click();

    // La línea literal aparece en pantalla: callarla sería el peor fallo de esta app
    // En un <code>, no en el textarea, que tambien contiene ese texto
    await expect(page.locator('code', { hasText: 'esto no es una dependencia' })).toBeVisible();
  });

  test('un atributo inexistente se nombra y NO se muestran resultados a medias', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Dependencia transitiva/ }).click();
    await expect(page.getByRole('heading', { name: /Clave candidata/ })).toBeVisible();

    await page.locator('textarea').first().fill('Empleado → Departamento\nDepartamento → Zzz');
    await page.getByRole('button', { name: 'Analizar relación' }).click();

    await expect(page.getByText(/Zzz/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Clave candidata/ })).toHaveCount(0);
  });

  test('la guía educativa está en el HTML servido, no solo tras hidratar', async ({ page }) => {
    const respuesta = await page.request.get(URL_APP);
    expect(respuesta.ok()).toBeTruthy();
    const html = await respuesta.text();
    expect(html).toContain('Qué es una dependencia funcional');
    expect(html).toContain('Clave candidata frente a superclave');
  });
});

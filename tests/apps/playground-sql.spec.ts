import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { PUERTO } from './_puerto';

/**
 * Playground SQL — test de regresión (Inspector, 07/10/2026)
 *
 * La app ejecuta SQLite (sql.js 1.14, WebAssembly servido desde /wasm/) sobre tres datasets
 * fijos de `app/playground-sql/components/datasets.ts`. Todos los valores esperados de este
 * fichero están calculados A MANO, fila a fila, sobre esos datos, antes de ejecutar la app.
 *
 * Formato de la tabla de resultados: `formatearValor` (components/formato.ts) pinta cada número
 * con 15 cifras significativas (como la consola de SQLite, sin el ruido binario), en formato
 * español: 44000 → «44.000», 3796 → «3796» (cuatro cifras no se agrupan), 109,97/3 →
 * «36,6566666666667» (15 cifras significativas, como la consola de SQLite), NULL → «NULL». Hasta el 07/10/2026 cortaba a 2 decimales (hallazgo 2997).
 *
 * Los hallazgos del acta del 07/10/2026 se abrieron con `test.fail()` y se REPARARON ese mismo
 * día: quedan como regresión.
 */

const RUTA = '/playground-sql/';
const EDITOR = 'textarea[aria-label="Editor de consultas SQL"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [EDITOR]);
  // El botón está deshabilitado mientras sql.js carga el wasm y siembra el dataset.
  await expect(page.getByRole('button', { name: /Ejecutar/ })).toBeEnabled({ timeout: 15000 });
}

async function escribir(page: Page, sql: string): Promise<void> {
  await page.locator(EDITOR).fill(sql);
  await esperarValorEnReact(page, EDITOR, sql);
}

async function ejecutar(page: Page, sql: string): Promise<void> {
  await escribir(page, sql);
  const boton = page.getByRole('button', { name: /Ejecutar/ });
  await expect(boton).toBeEnabled({ timeout: 15000 });
  await boton.click();
}

/** La región de resultados (role=status). Acota también el role=alert del error de SQL. */
function resultados(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: 'Resultados' });
}

function filas(page: Page): Locator {
  return resultados(page).locator('tbody tr');
}

async function abrirEjercicio(page: Page, titulo: RegExp): Promise<void> {
  await page.getByRole('button', { name: /^Ejercicios/ }).click();
  await page.getByRole('button', { name: titulo }).click();
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — JOIN + GROUP BY con COUNT, SUM y AVG
// ═══════════════════════════════════════════════════════════════════════════

test('caso 1 · productos por categoría: COUNT, SUM y AVG fila a fila', async ({ page }) => {
  await abrir(page);
  await ejecutar(
    page,
    `SELECT c.nombre AS categoria, COUNT(p.id) AS num, SUM(p.precio) AS suma, AVG(p.precio) AS media
FROM categorias c JOIN productos p ON p.categoria_id = c.id
GROUP BY c.id ORDER BY c.id;`,
  );
  // A mano, desde la tabla `productos` del dataset Tienda:
  //   Electrónica: 1319 + 1299 + 279 + 899 = 3796 → 4 productos, media 949
  //   Ropa: 19,99 + 49,99 + 39,99 = 109,97 → media 36,6566… → 15 cifras significativas, «36,6566666666667»
  //   Hogar: 34,99 + 199,99 = 234,98 → media 117,49
  //   Deportes: 89,99 + 29,99 = 119,98 → media 59,99
  //   Libros: 12,99
  await expect(resultados(page).locator('thead th')).toHaveText(['categoria', 'num', 'suma', 'media']);
  await expect(filas(page)).toHaveCount(5);
  await expect(filas(page).nth(0).locator('td')).toHaveText(['Electrónica', '4', '3796', '949']);
  await expect(filas(page).nth(1).locator('td')).toHaveText(['Ropa', '3', '109,97', '36,6566666666667']);
  await expect(filas(page).nth(2).locator('td')).toHaveText(['Hogar', '2', '234,98', '117,49']);
  await expect(filas(page).nth(3).locator('td')).toHaveText(['Deportes', '2', '119,98', '59,99']);
  await expect(filas(page).nth(4).locator('td')).toHaveText(['Libros', '1', '12,99', '12,99']);
  await expect(resultados(page)).toContainText('5 filas');
});

test('caso 1 · «Total por cliente» (LEFT JOIN + SUM) ordenado por gasto', async ({ page }) => {
  await abrir(page);
  await ejecutar(
    page,
    `SELECT cl.nombre, COUNT(p.id) AS num_pedidos, SUM(p.total) AS total_gastado
FROM clientes cl LEFT JOIN pedidos p ON cl.id = p.cliente_id
GROUP BY cl.id, cl.nombre ORDER BY total_gastado DESC;`,
  );
  // A mano, desde `pedidos`: María 1598 + 1299 = 2897 · Carlos 279 + 79,97 = 358,97 (pedido 9 cuadrado con sus líneas el 07/10/2026, hallazgo 2998) · el resto, un pedido.
  await expect(filas(page)).toHaveCount(8);
  await expect(filas(page).nth(0).locator('td')).toHaveText(['María García', '2', '2897']);
  await expect(filas(page).nth(1).locator('td')).toHaveText(['Carmen Torres', '1', '1319']);
  await expect(filas(page).nth(3).locator('td')).toHaveText(['Carlos López', '2', '358,97']);
  await expect(filas(page).nth(7).locator('td')).toHaveText(['Ana Martínez', '1', '69,97']);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — NULL en agregados, AVG con decimales, LIMIT 0, comilla
// ═══════════════════════════════════════════════════════════════════════════

test('caso 2 · departamento sin empleados: COUNT 0 y AVG NULL; media con decimales', async ({ page }) => {
  await abrir(page);
  await page.getByRole('button', { name: /Empresa/ }).click();
  await ejecutar(
    page,
    `SELECT d.nombre AS departamento, COUNT(e.id) AS empleados, ROUND(AVG(e.salario), 2) AS salario_medio
FROM departamentos d LEFT JOIN empleados e ON d.id = e.departamento_id
GROUP BY d.id, d.nombre ORDER BY empleados DESC, d.id;`,
  );
  // A mano, desde `empleados` del dataset Empresa (Roberto Gómez tiene departamento NULL):
  //   Tecnología: 65000 + 45000 + 28000 + 38000 = 176000 / 4 = 44000
  //   Marketing: 55000 + 32000 + 28000 = 115000 / 3 = 38333,333… → ROUND 2 → 38333,33
  //   RRHH: (52000 + 30000) / 2 = 41000 · Ventas: (58000 + 35000) / 2 = 46500
  //   Finanzas: ningún empleado → COUNT(e.id) = 0 y AVG = NULL
  await expect(filas(page)).toHaveCount(5);
  await expect(filas(page).nth(0).locator('td')).toHaveText(['Tecnología', '4', '44.000']);
  await expect(filas(page).nth(1).locator('td')).toHaveText(['Marketing', '3', '38.333,33']);
  await expect(filas(page).nth(2).locator('td')).toHaveText(['Recursos Humanos', '2', '41.000']);
  await expect(filas(page).nth(3).locator('td')).toHaveText(['Ventas', '2', '46.500']);
  await expect(filas(page).nth(4).locator('td')).toHaveText(['Finanzas', '0', 'NULL']);

  // COUNT(*) cuenta la fila con NULL; COUNT(columna) y AVG la ignoran.
  // departamento_id de los 11 no nulos: 1+2+1+1+1+2+2+3+3+4+4 = 24 → 24 / 11 = 2,1818… → con 15 cifras
  // significativas, «2,18181818181818» (sin ROUND no se recorta: hallazgo 2997)
  await ejecutar(page, 'SELECT COUNT(*) AS todas, COUNT(departamento_id) AS con_dep, AVG(departamento_id) AS media FROM empleados;');
  await expect(filas(page).nth(0).locator('td')).toHaveText(['12', '11', '2,18181818181818']);
});

test('caso 2 · LIMIT 0 y cadena con comilla escapada', async ({ page }) => {
  await abrir(page);
  await ejecutar(page, `SELECT 'D''Artagnan' AS nombre;`);
  await expect(filas(page).nth(0).locator('td')).toHaveText(["D'Artagnan"]);

  // LIMIT 0: sql.js no devuelve conjunto de resultados → la app dice «0 filas» y que fue bien.
  await ejecutar(page, 'SELECT * FROM productos LIMIT 0;');
  await expect(resultados(page)).toContainText('0 filas');
  await expect(resultados(page)).toContainText('Consulta ejecutada correctamente (sin resultados para mostrar).');
  await expect(filas(page)).toHaveCount(0);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (rechazo) — sintaxis errónea y tabla inexistente, sin romper la página
// ═══════════════════════════════════════════════════════════════════════════

test('caso 3 · errores de SQL se muestran en el aviso y la página sigue funcionando', async ({ page }) => {
  await abrir(page);
  const aviso = resultados(page).getByRole('alert');

  await ejecutar(page, 'SELEC * FROM productos;');
  await expect(aviso).toHaveText('❌ Error: near "SELEC": syntax error');

  await ejecutar(page, 'SELECT * FROM ventas;');
  await expect(aviso).toHaveText('❌ Error: no such table: ventas');

  // Tras dos errores, una consulta válida vuelve a funcionar: 1319 y 1299 son los únicos > 1000.
  await ejecutar(page, 'SELECT nombre, precio FROM productos WHERE precio > 1000 ORDER BY precio DESC;');
  await expect(aviso).toHaveCount(0);
  await expect(filas(page)).toHaveCount(2);
  await expect(filas(page).nth(0).locator('td')).toHaveText(['iPhone 15 Pro', '1319']);
  await expect(filas(page).nth(1).locator('td')).toHaveText(['MacBook Air M3', '1299']);
});

test('caso 3 · funciona sin red externa (el wasm es local)', async ({ page }) => {
  await page.route(new RegExp(`^(?!http://localhost:${PUERTO})`), (ruta) => ruta.abort());
  await abrir(page);
  await ejecutar(page, 'SELECT COUNT(*) FROM productos;');
  await expect(filas(page).nth(0).locator('td')).toHaveText(['12']);
});

test('caso 3 · si el wasm no carga, la app lo avisa', async ({ page }) => {
  await page.route('**/*.wasm', (ruta) => ruta.abort());
  await page.goto(RUTA);
  await expect(resultados(page).getByRole('alert')).toContainText(
    'Error al cargar la base de datos. Recarga la página.',
    { timeout: 15000 },
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// EJERCICIOS CON CORRECCIÓN AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════════════════

test('ejercicios · la respuesta correcta de «Filtrar con WHERE» se acepta', async ({ page }) => {
  await abrir(page);
  await abrirEjercicio(page, /Filtrar con WHERE/);
  await ejecutar(page, 'SELECT * FROM productos WHERE precio > 100;');
  // > 100 €: ids 1 (1319), 2 (1299), 3 (279), 8 (199,99), 11 (899) → 5 filas
  await expect(filas(page)).toHaveCount(5);
  await expect(page.getByText('¡Correcto! Has completado el ejercicio.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Ejercicios/ })).toContainText('1/15');
});

test('ejercicios · una respuesta INCORRECTA parecida se rechaza', async ({ page }) => {
  await abrir(page);
  await abrirEjercicio(page, /Filtrar con WHERE/);
  await ejecutar(page, 'SELECT * FROM productos WHERE precio < 100;');
  // < 100 €: ids 4, 5, 6, 7, 9, 10, 12 → 7 filas; ninguna cumple el enunciado
  await expect(filas(page)).toHaveCount(7);
  // La insignia «1/15» no debe aparecer, y el alumno sabe por qué no (antes, silencio: 2994).
  await expect(page.getByRole('button', { name: /^Ejercicios/ })).not.toContainText('1/15', { timeout: 2000 });
  await expect(page.getByText('Todavía no: tu consulta devuelve 7 filas y la solución, 5.')).toBeVisible();
});

test('ejercicios · el resto de respuestas incorrectas del acta también se rechazan', async ({ page }) => {
  await abrir(page);
  const ejercicios = page.getByRole('button', { name: /^Ejercicios/ });
  // [ejercicio, consulta incorrecta]: ORDER BY al revés · COUNT de otra tabla (8 en vez de 12) ·
  // sin HAVING (6 ciudades en vez de 2) · sin JOIN (una sola columna)
  const casos: [RegExp, string][] = [
    [/Ordenar resultados/, 'SELECT * FROM productos ORDER BY precio ASC;'],
    [/Contar registros con COUNT/, 'SELECT COUNT(*) FROM clientes;'],
    [/Filtrar grupos con HAVING/, 'SELECT ciudad, COUNT(*) FROM clientes GROUP BY ciudad;'],
    [/Tu primer JOIN/, 'SELECT nombre FROM productos;'],
  ];
  for (const [titulo, sql] of casos) {
    await abrirEjercicio(page, titulo);
    await ejecutar(page, sql);
    await expect(page.getByText(/Todavía no:/)).toBeVisible();
  }
  await expect(ejercicios).not.toContainText('/15');
});

test('ejercicios · el JOIN con las columnas en otro orden y GROUP BY con COUNT(id) se aceptan', async ({ page }) => {
  await abrir(page);
  await abrirEjercicio(page, /Tu primer JOIN/);
  await ejecutar(page, 'SELECT c.nombre AS categoria, p.nombre AS producto FROM categorias c JOIN productos p ON p.categoria_id = c.id;');
  await expect(page.getByText('¡Correcto! Has completado el ejercicio.')).toBeVisible();
  await abrirEjercicio(page, /Agrupar con GROUP BY/);
  await ejecutar(page, 'SELECT categoria_id, COUNT(id) AS n FROM productos GROUP BY categoria_id;');
  await expect(page.getByText('¡Correcto! Has completado el ejercicio.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Ejercicios/ })).toContainText('2/15');
});

test('ejercicios · una respuesta CORRECTA equivalente (con alias) se acepta', async ({ page }) => {
  await abrir(page);
  await abrirEjercicio(page, /Contar registros con COUNT/);
  await ejecutar(page, 'SELECT COUNT(*) AS total_productos FROM productos;');
  // 12 productos en el dataset Tienda: la respuesta es correcta.
  await expect(filas(page).nth(0).locator('td')).toHaveText(['12']);
  await expect(page.getByText('¡Correcto! Has completado el ejercicio.')).toBeVisible({ timeout: 2000 });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE OPERATIVA
// ═══════════════════════════════════════════════════════════════════════════

test('tabla ancha en escritorio: se desplaza DENTRO de su caja, no ensancha la página', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await abrir(page);
  await ejecutar(
    page,
    'SELECT * FROM detalle_pedidos JOIN productos ON productos.id = detalle_pedidos.producto_id JOIN pedidos ON pedidos.id = detalle_pedidos.pedido_id;',
  );
  await expect(filas(page)).toHaveCount(15);
  const ancho = await page.evaluate(() => document.body.scrollWidth);
  // Medido el 07/10/2026: 1756 px en una ventana de 1280.
  expect(ancho).toBeLessThanOrEqual(1280);
});

test('Formatear no cambia el resultado de una consulta con comentario inicial', async ({ page }) => {
  await abrir(page);
  const sql = '-- Productos de más de 1000 €\nSELECT nombre, precio FROM productos WHERE precio > 1000;';
  await ejecutar(page, sql);
  await expect(filas(page)).toHaveCount(2); // iPhone 15 Pro 1319 y MacBook Air M3 1299
  await page.getByRole('button', { name: /Formatear/ }).click();
  await expect(page.locator(EDITOR)).not.toHaveValue(sql);
  await page.getByRole('button', { name: /Ejecutar/ }).click();
  await expect(resultados(page).getByRole('alert')).toHaveCount(0, { timeout: 2000 });
  await expect(filas(page)).toHaveCount(2);
});

test('Formatear no toca el interior de una cadena', async ({ page }) => {
  await abrir(page);
  await escribir(page, "SELECT 'a,b' AS t;");
  await page.getByRole('button', { name: /Formatear/ }).click();
  await expect(page.locator(EDITOR)).toHaveValue("SELECT 'a,b' AS t;", { timeout: 2000 });
});

test('tras un DELETE hay un control visible para restaurar los datos', async ({ page }) => {
  await abrir(page);
  await ejecutar(page, 'DELETE FROM productos;');
  await ejecutar(page, 'SELECT COUNT(*) FROM productos;');
  await expect(filas(page).nth(0).locator('td')).toHaveText(['0']);
  // El camino oculto que sí funciona: volver a pulsar el dataset activo resiembra las 12 filas.
  await page.getByRole('button', { name: /Tienda Online/ }).click();
  await ejecutar(page, 'SELECT COUNT(*) FROM productos;');
  await expect(filas(page).nth(0).locator('td')).toHaveText(['12']);
  await ejecutar(page, 'DELETE FROM productos;');
  await expect(page.getByRole('button', { name: /restablecer|restaurar|reiniciar/i })).toBeVisible({ timeout: 2000 });
});

test('la pestaña «Esquema» no se recorta cuando aparece la insignia de progreso', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await abrir(page);
  await abrirEjercicio(page, /Filtrar con WHERE/);
  await ejecutar(page, 'SELECT * FROM productos WHERE precio > 100;');
  await expect(page.getByRole('button', { name: /^Ejercicios/ })).toContainText('1/15');
  const { derechaPestana, derechaBarra } = await page.evaluate(() => {
    const esquema = [...document.querySelectorAll('button')].find((b) => /Esquema/.test(b.textContent ?? ''))!;
    const barra = esquema.closest('[class*="sidebar"]')!;
    return {
      derechaPestana: esquema.getBoundingClientRect().right,
      derechaBarra: barra.getBoundingClientRect().right,
    };
  });
  expect(derechaPestana).toBeLessThanOrEqual(derechaBarra);
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE CÁLCULO Y DE DATOS
// ═══════════════════════════════════════════════════════════════════════════

test('la tabla no redondea a 2 decimales lo que devuelve SQLite', async ({ page }) => {
  await abrir(page);
  await ejecutar(page, 'SELECT 0.004 AS milesimas, 1.0/3 AS tercio, ROUND(1.0/3, 2) AS redondeado;');
  const celdas = filas(page).nth(0).locator('td');
  await expect(celdas).toHaveCount(3);
  await expect(celdas.nth(2)).toHaveText('0,33'); // ROUND(…, 2): este sí es 0,33
  await expect(celdas.nth(0)).toHaveText('0,004', { timeout: 2000 });
});

test('dataset Tienda: el total de cada pedido cuadra con sus líneas de detalle', async ({ page }) => {
  await abrir(page);
  await ejecutar(
    page,
    `SELECT p.id, p.total, ROUND(SUM(d.cantidad * d.precio_unitario), 2) AS suma_lineas
FROM pedidos p JOIN detalle_pedidos d ON d.pedido_id = p.id
GROUP BY p.id HAVING ABS(p.total - SUM(d.cantidad * d.precio_unitario)) > 0.005;`,
  );
  // Un dataset coherente no devuelve ninguna fila.
  await expect(resultados(page)).toContainText('0 filas', { timeout: 2000 });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE CONTENIDO (pantalla y JSON-LD)
// ═══════════════════════════════════════════════════════════════════════════

test('FAQ visible: SQLite NO es estricto con columnas fuera del GROUP BY', async ({ page }) => {
  await abrir(page);
  await ejecutar(page, 'SELECT categoria_id, nombre, COUNT(*) FROM productos GROUP BY categoria_id;');
  // SQLite admite la columna «desnuda»: 5 grupos, sin error.
  await expect(filas(page)).toHaveCount(5);
  await expect(resultados(page).getByRole('alert')).toHaveCount(0);
  await expect(page.getByText(/PostgreSQL y SQLite son estrictos/)).toHaveCount(0, { timeout: 2000 });
});

test('FAQPage: no promete «toda la sintaxis SQL estándar» que SQLite no cubre', async ({ page }) => {
  await abrir(page);
  await ejecutar(page, 'SELECT nombre FROM productos ORDER BY precio DESC FETCH FIRST 3 ROWS ONLY;');
  await expect(resultados(page).getByRole('alert')).toHaveText('❌ Error: near "FETCH": syntax error');
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(jsonLd).not.toContain('toda la sintaxis SQL estándar');
});

test('comparativa y consejos: lo que dicen de MySQL cuadra con su manual', async ({ page }) => {
  await page.goto(RUTA);
  // Fila «Concatenar strings», columna MySQL 8 (3.ª celda): el manual 8.0 dice que «||» es OR.
  const celdaMysql = page.locator('tr', { hasText: 'Concatenar strings' }).locator('td').nth(2);
  await expect(celdaMysql).not.toContainText('||', { timeout: 2000 });
  // Manual 8.0, «FOREIGN KEY Constraints»: «Such an index is created on the referencing table automatically».
  await expect(page.getByText(/MySQL no lo hace automático/)).toHaveCount(0, { timeout: 2000 });
});

test('el ejemplo de e-commerce del bloque educativo es SQL válido', async ({ page }) => {
  await abrir(page);
  // REPARADO: el ejemplo usa las tablas y columnas del dataset Tienda, así que corre tal cual.
  const ejemplo = (await page.locator('pre', { hasText: 'detalle_pedido' }).first().textContent()) ?? '';
  expect(ejemplo).toContain('HAVING');
  await ejecutar(page, ejemplo);
  await expect(resultados(page).getByRole('alert')).toHaveCount(0, { timeout: 2000 });
  // Pedidos con líneas que suman más de 100: 1 (1598), 2 (279), 4 (1299), 5 (119,98), 6 (899),
  // 7 (234,98), 8 (1319) y 10 (199,99) → 8 filas
  await expect(filas(page)).toHaveCount(8);
});

test('JSON-LD: no promete resaltado de sintaxis (el editor es un textarea)', async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator(EDITOR)).toHaveJSProperty('tagName', 'TEXTAREA');
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(jsonLd).not.toContain('resaltado de sintaxis');
});

test('la insignia de dificultad dice «básico» con tilde', async ({ page }) => {
  await abrir(page);
  await abrirEjercicio(page, /Tu primera consulta SELECT/);
  await expect(page.locator('[class*="difficultyBadge"]')).toHaveText(/básico/i, { timeout: 2000 });
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS DE ACCESIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════

test('el «¡Correcto!» del ejercicio se anuncia en una región viva', async ({ page }) => {
  await abrir(page);
  await abrirEjercicio(page, /Filtrar con WHERE/);
  await ejecutar(page, 'SELECT * FROM productos WHERE precio > 100;');
  const exito = page.getByText('¡Correcto! Has completado el ejercicio.');
  await expect(exito).toBeVisible();
  const enRegionViva = await exito.evaluate(
    (el) => Boolean(el.closest('[aria-live], [role="status"], [role="alert"]')),
  );
  expect(enRegionViva).toBe(true);
});

test('dataset activo con aria-pressed y botones sin emoji en el nombre accesible', async ({ page }) => {
  await abrir(page);
  await expect(page.getByRole('button', { name: /Tienda Online/ })).toHaveAttribute('aria-pressed', 'true', { timeout: 2000 });
  await expect(page.getByRole('button', { name: 'Ejecutar', exact: true })).toBeVisible({ timeout: 2000 });
});

// ═══════════════════════════════════════════════════════════════════════════
// MÓVIL (390 px)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('se puede escribir, ejecutar con el dedo y leer el resultado', async ({ page }) => {
    await abrir(page);
    await page.locator(EDITOR).tap();
    await escribir(page, 'SELECT nombre, precio FROM productos WHERE precio > 1000;');
    await page.getByRole('button', { name: /Ejecutar/ }).tap();
    await expect(filas(page)).toHaveCount(2);
    await expect(filas(page).nth(0).locator('td')).toHaveText(['iPhone 15 Pro', '1319']);
    await expect(filas(page).nth(1).locator('td')).toHaveText(['MacBook Air M3', '1299']);
  });

  test('la consulta inicial no ensancha la página: la columna categoria_id es alcanzable', async ({ page }) => {
    await abrir(page);
    await expect(page.locator(EDITOR)).toHaveValue('SELECT * FROM productos LIMIT 10;');
    await page.getByRole('button', { name: /Ejecutar/ }).tap();
    await expect(filas(page)).toHaveCount(10);
    // Si la tabla no cabe, debe desplazarse DENTRO de su caja (.resultsTable lleva overflow-x: auto)
    // y el body no pasar de 390. html y body llevan overflow-x: hidden: lo que sobresale no se alcanza.
    const anchoBody = await page.evaluate(() => document.body.scrollWidth);
    expect(anchoBody).toBeLessThanOrEqual(390);
  });
});

import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — limpiador-texto (segmento interactiva, riesgo 3)
 *
 * Re-inspección: 31/08/2026. La app venía de la tanda 3 del Inspector (commit b68f8dcf),
 * que reparó dos hallazgos: «Espacios extra» no colapsaba el NBSP (U+00A0) que Word/PDF
 * dejan en vez del espacio normal, y «Caracteres especiales» borraba las comillas
 * tipográficas en vez de sustituirlas por su equivalente recto, contradiciendo la FAQ. Esta
 * pasada no asume que sigan reparados: los vuelve a comprobar desde cero, junto con dos
 * casos nuevos.
 *
 * QUÉ PROMETE LA APP — toda la lógica vive en app/limpiador-texto/page.tsx (sin motor
 * aparte), en el useMemo `textoLimpio`, que aplica las opciones activas EN EL ORDEN del
 * array `opciones` (no en el orden en que el usuario las activa): espaciosExtra,
 * espaciosInicio, lineasVacias, lineasDuplicadas, saltosLinea, tabulaciones,
 * caracteresEspeciales, numeros, puntuacion, emojis, html, urls, emails. Por defecto solo
 * están activas «Espacios extra» y «Espacios inicio/fin» (el caso «pegado de Word/PDF» que
 * anuncia la FAQ). La barra de estadísticas (role="status") solo se pinta con
 * `textoEntrada` no vacío.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — opciones por defecto, entrada con espacios dobles Y NBSP dobles
 *     Entrada: "  Hola  mundo  \nEsto   es  una prueba.  " (40 caracteres)
 *     Paso «Espacios extra» ([  ]{2,} → un espacio) colapsa TODAS las tandas de 2+
 *     espacios/NBSP, pero deja intacto un NBSP suelto (1 solo) entre «una» y «prueba.»,
 *     porque no es «extra»: " Hola mundo \nEsto es una prueba. "
 *     Paso «Espacios inicio/fin» (trim por línea) quita los bordes de cada línea; el NBSP
 *     interno de la línea 2 no está en un borde, así que sobrevive.
 *     Resultado: "Hola mundo\nEsto es una prueba." (30 caracteres, 10 eliminados, 25,0%)
 *
 *   CASO 2 (límite) — tildes+mayúsculas+ñ, comillas tipográficas y emoji
 *     Solo «Caracteres especiales» + «Emojis» activas (se desactivan las dos por defecto).
 *     Entrada: “CAFÉ” con leche 😀 y azúcar al ÑOÑO!
 *     «Caracteres especiales» primero sustituye las comillas curvas “ ” por " recta (la
 *     reparación de b68f8dcf), y LUEGO aplica la lista blanca
 *     [^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?¿¡'"()-]: el emoji no está en ella y se borra ahí mismo
 *     (antes de que el paso «Emojis» llegue a actuar), dejando un doble espacio donde estaba
 *     — hueco correcto, porque «Espacios extra» está desactivada en este caso.
 *     Resultado: "CAFÉ" con leche  y azúcar al ÑOÑO!  (tildes, Ñ y mayúsculas intactas)
 *
 *   CASO 3 (predecible) — entrada vacía
 *     Sin texto, `textoLimpio` es la cadena vacía por el guard `if (!textoEntrada) return ''`
 *     del propio useMemo: la barra de estadísticas no se pinta (el JSX la condiciona a
 *     `textoEntrada &&`), el botón «Copiar» queda `disabled` (`!textoLimpio`), y pulsar
 *     «Limpiar» sobre un texto ya escrito devuelve al mismo estado vacío sin lanzar nada.
 *
 * VERIFICADO EN NAVEGADOR: los tres casos, carácter a carácter, incluida la barra de
 * estadísticas del caso 1 ("Antes:40Después:30Eliminados:10 (25,0%)"), coinciden
 * exactamente con lo calculado a mano. Cero hallazgos en esta pasada.
 */

const RUTA = '/limpiador-texto/';

const entrada = (page: Page) => page.getByLabel('Texto original a limpiar');
const salida = (page: Page) => page.getByLabel('Texto limpio resultante');

/** Marca/desmarca una opción de limpieza por su nombre visible en la tarjeta. */
async function activarOpcion(page: Page, nombre: string, activo: boolean): Promise<void> {
  const casilla = page.locator('label', { hasText: nombre }).locator('input[type="checkbox"]');
  if ((await casilla.isChecked()) !== activo) await casilla.click();
}

test.describe('limpiador-texto', () => {
  // -------------------------------------------------------------------------------------
  // CASO 1 · NORMAL — opciones por defecto, con espacios dobles Y un NBSP suelto
  // -------------------------------------------------------------------------------------
  test('CASO 1 · con las opciones por defecto, colapsa espacios/NBSP dobles y recorta bordes', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // Las dos opciones activas por defecto son justo las que la FAQ promete para «pegado
    // de Word/PDF»: Espacios extra + Espacios inicio/fin.
    await expect(
      page.locator('label', { hasText: 'Espacios extra' }).locator('input[type="checkbox"]')
    ).toBeChecked();
    await expect(
      page.locator('label', { hasText: 'Espacios inicio/fin' }).locator('input[type="checkbox"]')
    ).toBeChecked();

    const original = '  Hola  mundo  \nEsto   es  una prueba.  ';
    await entrada(page).fill(original);

    // Oráculo propio: dos tandas de 2+ NBSP/espacios se colapsan a uno; un NBSP SUELTO entre
    // «una» y «prueba.» no es una tanda de 2+, así que sobrevive intacto (no está en un
    // borde de línea, luego tampoco lo quita el trim de «Espacios inicio/fin»).
    await expect(salida(page)).toHaveValue('Hola mundo\nEsto es una prueba.');

    // 40 caracteres de entrada → 30 de salida → 10 eliminados → 25,0 % exacto
    const stats = page.locator('[role="status"]');
    await expect(stats).toContainText('Antes:');
    await expect(stats).toContainText('40');
    await expect(stats).toContainText('Después:');
    await expect(stats).toContainText('30');
    await expect(stats).toContainText('Eliminados:');
    await expect(stats).toContainText('10 (25,0%)');
  });

  // -------------------------------------------------------------------------------------
  // CASO 2 · LÍMITE — tildes/Ñ/mayúsculas, comillas tipográficas y un emoji
  // -------------------------------------------------------------------------------------
  test('CASO 2 · «Caracteres especiales» preserva tildes/Ñ, cambia comillas curvas y borra el emoji', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await activarOpcion(page, 'Espacios extra', false);
    await activarOpcion(page, 'Espacios inicio/fin', false);
    await activarOpcion(page, 'Caracteres especiales', true);
    await activarOpcion(page, 'Emojis', true);

    const original = '“CAFÉ” con leche \u{1F600} y azúcar al ÑOÑO!';
    await entrada(page).fill(original);

    // Oráculo propio: comillas curvas “ ” → " recta (reparación de b68f8dcf), tildes/Ñ/
    // mayúsculas intactas (están en la lista blanca explícita), el emoji desaparece en el
    // filtro de «Caracteres especiales» (no está en la lista blanca) dejando un doble
    // espacio en su sitio — correcto, porque «Espacios extra» está desactivada aquí.
    await expect(salida(page)).toHaveValue('"CAFÉ" con leche  y azúcar al ÑOÑO!');
  });

  // -------------------------------------------------------------------------------------
  // CASO 3 · PREDECIBLE — entrada vacía
  // -------------------------------------------------------------------------------------
  test('CASO 3 · con entrada vacía no hay salida, ni barra de estadísticas, ni botón de copiar activo', async ({
    page,
  }) => {
    await page.goto(RUTA);

    await expect(salida(page)).toHaveValue('');
    await expect(page.locator('[role="status"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Copiar texto limpio' })).toBeDisabled();

    // Escribir y luego vaciar con «Limpiar» vuelve al mismo estado predecible, sin residuos
    // del cálculo anterior.
    await entrada(page).fill('  algo   con espacios  ');
    await expect(salida(page)).not.toHaveValue('');
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await expect(entrada(page)).toHaveValue('');
    await expect(salida(page)).toHaveValue('');
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });
});

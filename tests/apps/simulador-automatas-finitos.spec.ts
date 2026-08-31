import { test, expect } from '@playwright/test';

/**
 * Simulador de Autómatas Finitos — Inspector, 31/08/2026
 *
 * Motor bajo prueba: `generarPasosValidacion` / `epsilonClausura` en
 * `app/simulador-automatas-finitos/page.tsx` (no hay módulo aparte en lib/: toda la
 * simulación vive inline en el componente). Se usa el ejemplo preconfigurado
 * «DFA — Pares de 0» (número par de 0s sobre el alfabeto {0, 1}):
 *
 *   Estados: q0 (inicial, FINAL) · q1
 *   Transiciones: q0 -0-> q1 · q1 -0-> q0 · q0 -1-> q0 · q1 -1-> q1
 *
 * Es un DFA total (hay transición definida para los 2 símbolos desde cada estado), así
 * que nunca cae en «sin transición»: solo puede terminar ACEPTADA o RECHAZADA según la
 * paridad de 0s leídos.
 *
 * Los 3 casos de este fichero se trazaron A MANO antes de tocar el navegador, y se
 * verifican por DOS vías independientes que comparten el mismo motor:
 *   1. Modo batch (`resultadosBatch`, síncrono) — sin depender de temporizadores.
 *   2. Validación animada paso a paso, con «Paso siguiente» (no con el play automático,
 *      para no depender de la velocidad del slider).
 */

const RUTA = '/simulador-automatas-finitos/';

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Simulador de Autómatas Finitos',
  );
  // Carga el ejemplo «DFA — Pares de 0» sobre el que están trazados los 3 casos.
  await page.getByRole('button', { name: /Pares de 0/ }).click();
});

/** Filas de la tabla de validación en lote (no la tabla comparativa DFA/NFA de la guía). */
function filasBatch(page: import('@playwright/test').Page) {
  return page.locator('[class*="batchTableWrapper"] table tbody tr');
}

async function resultadoDeFila(fila: ReturnType<typeof filasBatch> extends infer T
  ? T extends import('@playwright/test').Locator
    ? import('@playwright/test').Locator
    : never
  : never) {
  return (await fila.locator('td').nth(1).innerText()).trim();
}

// ============================================================
// CASO 1 — Normal: "1001" tiene DOS 0s (par) → debe ACEPTARSE
// ============================================================
//
// TRAZA A MANO desde q0:
//   leer '1': q0 -1-> q0
//   leer '0': q0 -0-> q1
//   leer '0': q1 -0-> q0
//   leer '1': q0 -1-> q0
// Estado final activo: q0, que ES final ⇒ ACEPTADA.
test.describe('Caso 1 · "1001" (dos 0s, número par) → ACEPTADA', () => {
  test('modo batch', async ({ page }) => {
    const textarea = page.getByLabel('Cadenas a validar (una por línea)');
    await textarea.fill('1001');

    await expect(filasBatch(page)).toHaveCount(1);
    await expect(resultadoDeFila(filasBatch(page).first())).resolves.toContain('Aceptada');
  });

  test('validación animada paso a paso', async ({ page }) => {
    await page.locator('#cadena').fill('1001');
    await page.getByRole('button', { name: '▶ Validar' }).click();
    // Se pausa de inmediato para no depender del temporizador de la animación:
    // el cómputo debe ser el mismo avanzando manualmente.
    await page.getByRole('button', { name: '⏸ Pausar' }).click();

    const pasoSiguiente = page.getByRole('button', { name: 'Paso siguiente ▶' });
    for (let i = 0; i < 4; i++) {
      await pasoSiguiente.click();
    }

    // 4 símbolos leídos + estado inicial = 5 pasos (posiciones 0..4).
    await expect(page.locator('[aria-live="polite"][aria-atomic="true"]')).toContainText(
      'Paso 5 / 5',
    );
    // Traza a mano: el último símbolo leído es '1' y el estado activo queda en q0.
    await expect(page.locator('[aria-live="polite"][aria-atomic="true"]')).toContainText(
      'Lee "1" → q0',
    );
    await expect(page.locator('[role="alert"]', { hasText: 'ACEPTADA' })).toBeVisible();
    // El paso 6 no existe: se llegó al final de la cadena.
    await expect(pasoSiguiente).toBeDisabled();
  });
});

// ============================================================
// CASO 2 — Límite: cadena VACÍA (0 ceros, que también es par) → debe ACEPTARSE
// ============================================================
//
// TRAZA A MANO: sin símbolos que leer, el único estado activo es el inicial, q0.
// q0 es FINAL ⇒ ACEPTADA. Es el caso que demuestra por qué el ejemplo marca q0 como
// final: si no lo fuera, la cadena vacía (paridad 0 = par) se rechazaría mal.
//
// El campo único de validación deshabilita «Validar» con cadena vacía (no hay nada que
// animar paso a paso), así que este caso solo puede verificarse por el modo batch —
// que sí acepta líneas vacías y las etiqueta «(vacía)».
test.describe('Caso 2 · cadena vacía (0 ceros, número par) → ACEPTADA', () => {
  test('el campo de validación única deshabilita "Validar" con cadena vacía', async ({
    page,
  }) => {
    await page.locator('#cadena').fill('');
    await expect(page.getByRole('button', { name: '▶ Validar' })).toBeDisabled();
  });

  test('modo batch acepta la cadena vacía', async ({ page }) => {
    const textarea = page.getByLabel('Cadenas a validar (una por línea)');
    await textarea.fill('');

    await expect(filasBatch(page)).toHaveCount(1);
    await expect(filasBatch(page).first().locator('td').first()).toContainText('(vacía)');
    await expect(resultadoDeFila(filasBatch(page).first())).resolves.toContain('Aceptada');
  });
});

// ============================================================
// CASO 3 — Rechazo: "0" tiene UN 0 (impar) → debe RECHAZARSE
// ============================================================
//
// TRAZA A MANO desde q0:
//   leer '0': q0 -0-> q1
// Estado final activo: q1, que NO es final ⇒ RECHAZADA (no «sin transición»: el DFA
// tiene regla definida para (q1, cualquier símbolo), así que si se sigue leyendo nunca
// cae en el caso «sin-transicion»).
test.describe('Caso 3 · "0" (un 0, número impar) → RECHAZADA', () => {
  test('modo batch', async ({ page }) => {
    const textarea = page.getByLabel('Cadenas a validar (una por línea)');
    await textarea.fill('0');

    await expect(filasBatch(page)).toHaveCount(1);
    await expect(resultadoDeFila(filasBatch(page).first())).resolves.toContain('Rechazada');
  });

  test('validación animada paso a paso', async ({ page }) => {
    await page.locator('#cadena').fill('0');
    await page.getByRole('button', { name: '▶ Validar' }).click();
    await page.getByRole('button', { name: '⏸ Pausar' }).click();
    await page.getByRole('button', { name: 'Paso siguiente ▶' }).click();

    await expect(page.locator('[aria-live="polite"][aria-atomic="true"]')).toContainText(
      'Lee "0" → q1',
    );
    await expect(page.locator('[role="alert"]', { hasText: 'RECHAZADA' })).toBeVisible();
  });
});

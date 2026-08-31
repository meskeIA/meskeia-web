import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — test-tipo-lector (segmento interactiva, riesgo 4, 552 usos reales)
 *
 * Primera inspección: 31/08/2026. Resuelto a mano ANTES de abrir el navegador, leyendo
 * `app/test-tipo-lector/page.tsx` (no hay motor en `lib/`: preguntas, puntuación y los
 * 5 arquetipos están inline en el componente).
 *
 * LA ARITMÉTICA
 *   8 preguntas (`PREGUNTAS`), 5 opciones cada una, SIEMPRE en el mismo orden de arquetipo:
 *     A = detective · B = explorador · C = empatico · D = esteta · E = pensador
 *   Cada respuesta suma 2 puntos a su arquetipo (`handleSiguiente`). Máximo posible en un
 *   arquetipo: 8×2 = 16 (si se elige la misma letra las 8 veces). Total repartido siempre 16.
 *
 *   Ganador (`resultado`, con `Object.entries(puntos).reduce`, comparación estricta `>`):
 *     recorre las categorías en el orden en que se declaran en `puntuacionInicial()` —
 *     detective, explorador, empatico, esteta, pensador— y sustituye el máximo solo si el
 *     candidato es ESTRICTAMENTE mayor. En un empate exacto, gana quien aparece ANTES en
 *     ese orden. No está documentado en pantalla ni en el FAQ, pero es determinista y
 *     siempre da un único arquetipo, que es justo lo que promete el `<h1>`
 *     («¿Qué tipo de lector eres?») y el FAQ («el test detecta el perfil dominante»).
 *
 * LOS 3 CASOS (los 3 ejecutados con Playwright contra localhost:3050 antes de escribir
 * este fichero; los 3 coincidieron con el cálculo a mano, sin discrepancias):
 *   1. Las 8 en A → detective 16, resto 0 → El Detective (perfil A claro).
 *   2. Las 8 en C → empatico 16, resto 0 → El Empático (perfil B claro, letra distinta a
 *      la del caso 1 para no repetir posición de botón).
 *   3. 4×D + 4×E → esteta 8, pensador 8 (empate exacto) → gana El Esteta, porque esteta
 *      se declara antes que pensador en `puntuacionInicial()` y el `reduce` no lo sustituye
 *      en un empate (8 no es > 8).
 */

const RUTA = '/test-tipo-lector/';

/** Los 5 botones de respuesta de la pregunta activa (CSS Modules: clase con hash). */
const opcion = (page: Page, i: number) => page.locator('button[class*="opcion"]').nth(i);
const botonSiguiente = (page: Page) => page.locator('button[class*="btnSiguiente"]');
const enunciado = (page: Page) => page.locator('h2[class*="pregunta"]');
const nombreResultado = (page: Page) => page.locator('[class*="resultadoNombre"]');

/** Contesta el test entero. `indices` son 0=A(detective) 1=B(explorador) 2=C(empatico) 3=D(esteta) 4=E(pensador). */
async function responder(page: Page, indices: number[]): Promise<void> {
  for (const i of indices) {
    await opcion(page, i).click();
    await botonSiguiente(page).click();
  }
}

test.describe('Caso 1: perfil A claro — todo Detective', () => {
  test('las 8 respuestas A dan detective 16-0-0-0-0 → El Detective', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByText('Pregunta 1 de 8')).toBeVisible();
    // Cálculo a mano: 8 × (opción A = detective, +2) = 16 puntos detective, 0 el resto.
    // Object.entries recorre detective primero y 16 > 0 (el máximo inicial), así que gana.
    await responder(page, [0, 0, 0, 0, 0, 0, 0, 0]);

    await expect(nombreResultado(page)).toHaveText('El Detective');
    // Bloques del resultado propios de ARQUETIPOS.detective
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Thriller');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Agatha Christie');
    await expect(page.locator('[class*="lecturaTitulo"]').first()).toHaveText('El nombre de la rosa');
  });
});

test.describe('Caso 2: perfil B claro — todo Empático', () => {
  test('las 8 respuestas C dan empatico 16-0-0-0-0 → El Empático', async ({ page }) => {
    await page.goto(RUTA);
    // Cálculo a mano: 8 × (opción C = empatico, +2) = 16 puntos empatico, 0 el resto.
    await responder(page, [2, 2, 2, 2, 2, 2, 2, 2]);

    await expect(nombreResultado(page)).toHaveText('El Empático');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Novela contemporánea');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Elena Ferrante');
  });
});

test.describe('Caso 3: empate exacto en el límite — Esteta vs Pensador', () => {
  test('4×D + 4×E empata esteta=8 y pensador=8 → gana El Esteta por orden de declaración', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // Cálculo a mano: preguntas 1-4 opción D (esteta, +2 cada una) = 8 puntos esteta.
    // Preguntas 5-8 opción E (pensador, +2 cada una) = 8 puntos pensador. Empate 8-8.
    // El reduce compara con `>` estricto y recorre detective→explorador→empatico→esteta→
    // pensador: cuando llega a esteta (8 > 0 del máximo previo) lo adopta como ganador;
    // cuando llega a pensador, 8 no es > 8, así que NO lo sustituye. Gana esteta.
    await responder(page, [3, 3, 3, 3, 4, 4, 4, 4]);

    await expect(nombreResultado(page)).toHaveText('El Esteta');
    await expect(page.locator('[class*="generoTag"]').first()).toHaveText('Novela literaria');
    await expect(page.locator('[class*="autorItem"]').first()).toHaveText('Vladimir Nabokov');
  });

  test('el orden inverso del mismo empate (4×E + 4×D) también da El Esteta', async ({ page }) => {
    // Confirma que el criterio de desempate depende del ORDEN DE DECLARACIÓN de los
    // arquetipos, no del orden en que se contestan las preguntas: aquí se responde
    // primero pensador y luego esteta, y el resultado es idéntico al caso anterior.
    await page.goto(RUTA);
    await responder(page, [4, 4, 4, 4, 3, 3, 3, 3]);
    await expect(nombreResultado(page)).toHaveText('El Esteta');
  });
});

test.describe('Operativa: navegación, accesibilidad y reinicio', () => {
  test('progreso, aria-pressed y type="button" se comportan como exige el proyecto', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await expect(page.getByText('0%')).toBeVisible();
    await expect(botonSiguiente(page)).toBeDisabled(); // nada seleccionado aún

    await opcion(page, 1).click();
    // Toggle: solo la opción pulsada lleva aria-pressed="true"
    await expect(opcion(page, 1)).toHaveAttribute('aria-pressed', 'true');
    await expect(opcion(page, 0)).toHaveAttribute('aria-pressed', 'false');
    await expect(botonSiguiente(page)).toBeEnabled();

    // Las 5 opciones y el botón "Siguiente" son type="button" (regla obligatoria del proyecto)
    const sinTypeButton = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button[class*="opcion"], button[class*="btnSiguiente"]')).filter(
        (b) => b.getAttribute('type') !== 'button',
      ).length,
    );
    expect(sinTypeButton).toBe(0);

    await botonSiguiente(page).click();
    await expect(page.getByText('Pregunta 2 de 8')).toBeVisible();
    await expect(page.getByText('13%')).toBeVisible(); // Math.round(1/8*100) = 13

    // La última pregunta cambia el texto del botón
    await responder(page, [0, 0, 0, 0, 0, 0, 0]); // preguntas 2-8: ya llevamos contestada la 1
    await expect(nombreResultado(page)).toBeVisible();

    await page.locator('button[class*="btnReiniciar"]').click();
    await expect(page.getByText('Pregunta 1 de 8')).toBeVisible();
    await expect(page.locator('button[class*="opcion"][aria-pressed="true"]')).toHaveCount(0);
  });
});

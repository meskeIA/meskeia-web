import { test, expect, Page } from '@playwright/test';

/**
 * calculadora-jugada-scrabble — inspección de regresión · 31/08/2026
 *
 * App interactiva (65 usos, riesgo 4): monta un atril tocando fichas, fija opcionalmente
 * una letra "gancho" ya colocada en el tablero y los multiplicadores de casilla, y pulsa
 * "Buscar la mejor jugada" para que recorra el lemario de ~87.000 formas y puntúe con los
 * valores oficiales del Scrabble en español (data en motor.ts: VALORES, DISTRIBUCION).
 *
 * LOS TRES CASOS SE RESOLVIERON A MANO ANTES DE ABRIR EL NAVEGADOR:
 *
 *   1) Normal — atril Z,A,P,A,T,O sin gancho ni multiplicadores.
 *      Valores: Z=10 A=1 P=3 A=1 T=1 O=1 → suma 17. El propio bloque educativo de la app
 *      usa «ZAPATO en casillas normales → 17 puntos» como ejemplo. Pero Z,A,P,A,T,O es
 *      también el multiconjunto de letras de TAPAZO (voz coloquial, verificada en
 *      public/data/diccionario-es.txt), que puntúa exactamente igual (mismas letras). El
 *      motor desempata por orden alfabético (buscarJugadas ordena por a.palabra.localeCompare)
 *      y "TAPAZO" precede a "ZAPATO", así que el resultado real es TAPAZO 17 pts, no ZAPATO.
 *      Confirmado contra el motor real con Playwright antes de fijar este test.
 *
 *   2) Límite (ficha Ñ + casilla ×3 letra) — atril Ñ,U, sin gancho, multiplicadorLetra=3,
 *      posición de bonificación "auto" (la ficha más valiosa). Único lema formable con esas
 *      dos fichas es "ÑU" (verificado en el diccionario; "UÑ" no existe). Ñ=8, U=1: con la
 *      bonificación ×3 sobre la Ñ (auto elige la ficha de más valor) → (8×3)+1 = 25 puntos.
 *
 *   3) Rechazo — atril vacío. El botón "Buscar la mejor jugada" está deshabilitado
 *      (page.tsx: disabled={atril.length === 0 || ...}), así que no hay forma de lanzar una
 *      búsqueda sin fichas: comportamiento correcto, no un fallo.
 *
 * HALLAZGO ADICIONAL (no es de cálculo): el desplegable "Posición de la bonificación"
 * siempre ofrece 1..8, sin acotarlo al nº real de casillas de la jugada. Elegir una posición
 * fuera de rango no avisa: la bonificación se pierde en silencio y el resultado queda
 * indistinguible de no haber marcado ningún multiplicador de letra (mismo atril Z,A,P,A,T,O
 * con ×3 letra y posición=8 → TAPAZO 17 pts, igual que sin multiplicador). Se deja constancia
 * aquí como test de regresión porque es observable y estable, aunque el cálculo en sí es
 * correcto (una posición fuera de rango no debe multiplicar nada).
 */

const URL_APP = '/calculadora-jugada-scrabble/';

async function conDiccionario(page: Page) {
  await page.goto(URL_APP);
  await expect(page.getByText(/Diccionario cargado/)).toBeVisible({ timeout: 15000 });
}

async function añadirFicha(page: Page, letra: string) {
  await page.getByRole('button', { name: new RegExp(`^Añadir ficha ${letra} al atril`) }).click();
}

async function buscar(page: Page) {
  await page.getByRole('button', { name: 'Buscar la mejor jugada' }).click();
  await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toBeVisible({ timeout: 10000 });
}

/** Texto de la cabecera de la primera jugada de la lista ("PALABRA N pts"). */
async function primeraJugada(page: Page): Promise<string> {
  const texto = await page.locator('ol li').first().locator('div').first().innerText();
  return texto.replace(/\s+/g, ' ').trim();
}

test.describe('calculadora-jugada-scrabble', () => {
  test('normal · Z,A,P,A,T,O sin bonus da TAPAZO 17 pts (empatada con ZAPATO, desempate alfabético)', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['Z', 'A', 'P', 'A', 'T', 'O']) {
      await añadirFicha(page, letra);
    }
    await buscar(page);
    expect(await primeraJugada(page)).toBe('TAPAZO 17 pts');
  });

  test('límite · Ñ,U con ×3 letra (auto) da ÑU 25 pts = (8×3)+1', async ({ page }) => {
    await conDiccionario(page);
    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await page.getByRole('button', { name: '×3 letra' }).click();
    await buscar(page);
    expect(await primeraJugada(page)).toBe('ÑU 25 pts');
  });

  test('rechazo · atril vacío deja el botón de búsqueda deshabilitado', async ({ page }) => {
    await conDiccionario(page);
    await expect(page.getByRole('button', { name: 'Buscar la mejor jugada' })).toBeDisabled();
    // Ni la cabecera de resultados ni el mensaje de "sin resultados" deben aparecer
    await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toHaveCount(0);
    await expect(page.getByText(/Ninguna palabra encaja/)).toHaveCount(0);
  });

  test('la posición de bonificación fuera de rango pierde el multiplicador sin avisar', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['Z', 'A', 'P', 'A', 'T', 'O']) {
      await añadirFicha(page, letra);
    }
    // 6 fichas sin gancho → como mucho hay 6 casillas en juego, pero el desplegable
    // ofrece hasta 8: elegir la 8 (fuera de rango) debe anular el ×3 en silencio.
    await page.getByRole('button', { name: '×3 letra' }).click();
    await page.selectOption('#posicion-bonus', '8');
    await buscar(page);
    // Mismo resultado que sin multiplicador: la bonificación no se aplicó a nada.
    expect(await primeraJugada(page)).toBe('TAPAZO 17 pts');
  });
});

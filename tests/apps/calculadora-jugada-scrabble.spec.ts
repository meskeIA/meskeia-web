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
 * REPARADO — HALLAZGO 550 (operativa, medio): el desplegable "Posición de la bonificación"
 * ofrecía siempre 1..8, sin acotarlo al nº real de casillas de la jugada (atril + gancho).
 * Elegir una posición fuera de rango no avisaba: la bonificación se perdía en silencio y el
 * resultado quedaba indistinguible de no haber marcado ningún multiplicador de letra. Ahora
 * el <select> solo ofrece hasta `atril.length + (gancho ? 1 : 0)` posiciones, y si el atril
 * se reduce y la posición elegida deja de caber, vuelve sola a "auto".
 *
 * REPARADO — HALLAZGO 551 (contenido, bajo): el motor desempata jugadas con igual puntuación
 * por orden alfabético (Z,A,P,A,T,O da TAPAZO antes que ZAPATO, el ejemplo del propio bloque
 * educativo) sin decirlo en la interfaz. Ahora, cuando las dos primeras jugadas empatan en
 * puntos, aparece una nota explicando el criterio de desempate.
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

  test('REPARADO (550) · con 6 fichas y sin gancho, el desplegable de posición solo ofrece hasta la 6', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['Z', 'A', 'P', 'A', 'T', 'O']) {
      await añadirFicha(page, letra);
    }
    await page.getByRole('button', { name: '×3 letra' }).click();

    const opciones = await page.locator('#posicion-bonus option').allTextContents();
    // "La ficha más valiosa (mejor caso)" + posiciones 1 a 6 — ya no llega a la 7 ni a la 8.
    expect(opciones).toHaveLength(7);
    expect(opciones).toContain('Posición 6 de la palabra');
    expect(opciones).not.toContain('Posición 7 de la palabra');
    expect(opciones).not.toContain('Posición 8 de la palabra');
  });

  test('REPARADO (550) · quitar una ficha con posición 6 elegida vuelve sola a "auto"', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['Z', 'A', 'P', 'A', 'T', 'O']) {
      await añadirFicha(page, letra);
    }
    await page.getByRole('button', { name: '×3 letra' }).click();
    await page.selectOption('#posicion-bonus', '6');
    await expect(page.locator('#posicion-bonus')).toHaveValue('6');

    // Quitar la última ficha del atril (queda en 5): la posición 6 ya no cabe.
    await page.getByRole('button', { name: /Quitar la ficha O del atril/ }).click();
    await expect(page.locator('#posicion-bonus')).toHaveValue('auto');
  });

  test('REPARADO (551) · Z,A,P,A,T,O sin bonus avisa del empate TAPAZO/ZAPATO y su criterio de desempate', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['Z', 'A', 'P', 'A', 'T', 'O']) {
      await añadirFicha(page, letra);
    }
    await buscar(page);
    expect(await primeraJugada(page)).toBe('TAPAZO 17 pts');
    await expect(page.getByText(/Hay más de una jugada con 17 puntos/)).toBeVisible();
    await expect(page.getByText(/en caso de empate se ordenan alfabéticamente/)).toBeVisible();
  });

  test('REPARADO (551) · Ñ,U sin empate (una sola jugada posible) no muestra la nota de desempate', async ({ page }) => {
    await conDiccionario(page);
    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await buscar(page);
    await expect(page.getByText(/Hay más de una jugada con/)).toHaveCount(0);
  });
});

/**
 * Re-inspección independiente · 31/08/2026 — SIN hallazgos.
 *
 * Casos nuevos, resueltos a mano antes de tocar el navegador, para no repetir exactamente
 * los mismos atriles (Z,A,P,A,T,O y Ñ,U) que ya cubre el bloque de arriba:
 *
 *   1) Normal — atril G,A,T,O sin gancho ni multiplicadores.
 *      Valores: G=2 A=1 T=1 O=1 → 5 puntos. Con este multiconjunto también existen
 *      GOTA y TOGA (mismas letras, mismos 5 puntos): desempate alfabético → GATO precede
 *      a GOTA y a TOGA. Confirmado contra el motor real con Playwright.
 *
 *   2) Límite — atril P,A,A,A,L,B,R (7 fichas = PALABRA), ×2 letra y ×2 palabra, posición
 *      de bonificación "auto". Puntos base: P=3 A=1 L=1 A=1 B=3 R=1 A=1 → suma 11.
 *      "auto" da la bonificación a la ficha de más valor sin contar el gancho; P y B empatan
 *      a 3, y el motor se queda con la PRIMERA en superar al mejor hasta el momento (no con
 *      un empate posterior), así que la bonificación cae en la P, no en la B:
 *      suma con ×2 en la P → (3×2)+1+1+1+3+1+1 = 14. Por la casilla de palabra ×2 → 28.
 *      Al colocar las 7 fichas del atril se añaden los 50 puntos de bonificación DESPUÉS de
 *      los multiplicadores → 28+50 = 78 puntos.
 *
 *   3) Rechazo — atril con una sola ficha (X). Ninguna palabra del lemario tiene menos de
 *      2 letras, así que una ficha suelta sin gancho nunca puede casar con nada: el motor
 *      debe devolver cero jugadas y mostrar el aviso de "sin resultados", no quedarse callado
 *      ni lanzar un error.
 */
test.describe('calculadora-jugada-scrabble · re-inspección 31/08/2026', () => {
  test('normal · G,A,T,O sin bonus da GATO 5 pts (empatada con GOTA/TOGA, desempate alfabético)', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['G', 'A', 'T', 'O']) {
      await añadirFicha(page, letra);
    }
    await buscar(page);
    expect(await primeraJugada(page)).toBe('GATO 5 pts');
  });

  test('límite · P,A,A,A,L,B,R con ×2 letra + ×2 palabra + bonus 7 fichas da PALABRA 78 pts', async ({ page }) => {
    await conDiccionario(page);
    for (const letra of ['P', 'A', 'A', 'A', 'L', 'B', 'R']) {
      await añadirFicha(page, letra);
    }
    await page.getByRole('button', { name: '×2 letra' }).click();
    await page.getByRole('button', { name: '×2 palabra' }).click();
    await buscar(page);
    expect(await primeraJugada(page)).toBe('PALABRA 78 pts');
    // El desglose confirma de dónde sale cada parte del cálculo, no solo el total.
    const detalle = await page.locator('ol li').first().locator('p').first().innerText();
    expect(detalle.replace(/\s+/g, ' ')).toContain('×2 en la P');
    expect(detalle.replace(/\s+/g, ' ')).toContain('palabra ×2');
    expect(detalle.replace(/\s+/g, ' ')).toContain('+50 por colocar las siete fichas');
  });

  test('rechazo · una sola ficha (X) sin gancho no puede casar con ninguna palabra', async ({ page }) => {
    await conDiccionario(page);
    await añadirFicha(page, 'X');
    await page.getByRole('button', { name: 'Buscar la mejor jugada' }).click();
    await expect(page.getByText(/Ninguna palabra encaja con esas fichas/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toHaveCount(0);
  });
});

/**
 * Marcador de partida (S0110, 02/09/2026) — historial de turnos + suma acumulada.
 *
 * Reutiliza el atril Ñ,U del bloque de arriba (único lema posible: "ÑU"), sin gancho ni
 * multiplicadores esta vez: Ñ=8 + U=1 = 9 puntos, resuelto a mano antes de tocar el navegador.
 */
async function filaJugador(page: Page, nombreLabel: string) {
  return page.locator('li').filter({ has: page.getByLabel(nombreLabel) });
}

test.describe('calculadora-jugada-scrabble · marcador de partida', () => {
  test('cerrado por defecto; anotar una jugada lo abre, suma los puntos y pasa el turno', async ({ page }) => {
    await conDiccionario(page);
    await expect(page.getByRole('button', { name: /Marcador de partida/ })).toHaveAttribute('aria-expanded', 'false');

    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await buscar(page);
    await page.getByRole('button', { name: 'Anotar esta jugada a Jugador 1' }).click();

    await expect(page.getByRole('button', { name: /Marcador de partida/ })).toHaveAttribute('aria-expanded', 'true');

    const fila1 = await filaJugador(page, 'Nombre del jugador 1');
    await expect(fila1).toContainText('9');
    await expect(fila1).not.toContainText('Le toca');

    const fila2 = await filaJugador(page, 'Nombre del jugador 2');
    await expect(fila2).toContainText('Le toca');

    // El atril se vacía y desaparecen los resultados: toca preparar el siguiente turno.
    await expect(page.getByText('0/7', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toHaveCount(0);

    // Queda registrada en el historial.
    await expect(page.getByText('ÑU')).toBeVisible();
  });

  test('deshacer última anotación revierte los puntos, el turno y el historial', async ({ page }) => {
    await conDiccionario(page);
    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await buscar(page);
    await page.getByRole('button', { name: 'Anotar esta jugada a Jugador 1' }).click();

    await page.getByRole('button', { name: 'Deshacer última anotación' }).click();

    const fila1 = await filaJugador(page, 'Nombre del jugador 1');
    await expect(fila1).toContainText('Le toca');
    await expect(page.getByText('ÑU')).toHaveCount(0);
  });

  test('añadir y quitar jugador; no se puede quitar el último si ya anotó', async ({ page }) => {
    await conDiccionario(page);
    await page.getByRole('button', { name: /Marcador de partida/ }).click();
    await expect(page.getByLabel('Nombre del jugador 3')).toHaveCount(0);

    await page.getByRole('button', { name: '+ Añadir jugador' }).click();
    await expect(page.getByLabel('Nombre del jugador 3')).toBeVisible();
    await page.getByRole('button', { name: '− Quitar último' }).click();
    await expect(page.getByLabel('Nombre del jugador 3')).toHaveCount(0);

    // Jugador 1 y Jugador 2 anotan por turnos; con jugadas ya anotadas, el último no se quita.
    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await buscar(page);
    await page.getByRole('button', { name: 'Anotar esta jugada a Jugador 1' }).click();
    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await buscar(page);
    await page.getByRole('button', { name: 'Anotar esta jugada a Jugador 2' }).click();

    await expect(page.getByRole('button', { name: '− Quitar último' })).toBeDisabled();
  });

  test('el marcador persiste tras recargar la página', async ({ page }) => {
    await conDiccionario(page);
    await añadirFicha(page, 'Ñ');
    await añadirFicha(page, 'U');
    await buscar(page);
    await page.getByRole('button', { name: 'Anotar esta jugada a Jugador 1' }).click();

    await page.reload();
    await expect(page.getByText(/Diccionario cargado/)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Marcador de partida/ }).click();

    const fila1 = await filaJugador(page, 'Nombre del jugador 1');
    await expect(fila1).toContainText('9');
    const fila2 = await filaJugador(page, 'Nombre del jugador 2');
    await expect(fila2).toContainText('Le toca');
  });
});

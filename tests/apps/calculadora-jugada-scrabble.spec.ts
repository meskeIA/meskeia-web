import { test, expect, Page } from '@playwright/test';
import { sembrarValor, esperarValorEnReact } from './_hidratacion';

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

/**
 * Re-inspección · 01/10/2026 (Opus 5.5) — tras deb6805a (marcador de partida, que no se había
 * inspeccionado) y b1f96c8a (la tabla de valores pasa a lib/calculadoras/puntuacionScrabble.ts).
 *
 * FUENTES, consultadas ANTES de ejecutar la app:
 *   · Reglamento de juego de la FISE (Federación Internacional de Scrabble en Español), en la
 *     copia archivada que cita es.wikipedia «Scrabble»:
 *     https://web.archive.org/web/20100227094221/http://www.scrabbel.org.uy/reglas/reglas.htm
 *       art. 10  el comodín vale 0, NO puede ser K ni W, y el +50 cuenta aunque se use
 *       art. 11  «no podrán utilizarse dos eres, ni dos eles, ni la ce y la hache para formar
 *                una doble letra»: CH, LL y RR van con su ficha (o con un comodín), nunca con
 *                dos fichas sueltas
 *       art. 14  primero las casillas de letra, luego las de palabra
 *       art. 15  dos casillas de doble palabra multiplican ×4; dos de triple palabra, ×9
 *       art. 19  los 50 del «scrabble» se suman DESPUÉS de multiplicar
 *   · Valores y distribución: es.wikipedia «Scrabble» (100 fichas). Coinciden con VALORES_FICHA
 *     y DISTRIBUCION: A12 E12 O9 I6 S6 N5 R5 U5 L4 T4 (1) · D5 G2 (2) · C4 B2 M2 P2 (3) ·
 *     H2 F1 V1 Y1 (4) · CH1 Q1 (5) · J1 LL1 Ñ1 RR1 X1 (8) · Z1 (10) · 2 comodines (0).
 *
 * Cada esperado se resolvió a mano. Para saber QUÉ palabra encabeza la lista entre los 86.972
 * lemas se usó además un oráculo propio escrito con esas reglas (no reutiliza el motor de la app).
 */

/** Las jugadas de la lista de resultados (el historial del marcador también es un <ol>).
 *  Hasta el 01/10/2026 se localizaba por `section[aria-live="polite"]`; la sección dejó de ser
 *  una región viva (leía las 40 jugadas al pintarse) y ahora se busca por su id. */
function jugadasLista(page: Page) {
  return page.locator('#resultados-jugada ol > li');
}

/** «PALABRA N pts» de cada fila de resultados, en orden. */
async function cabeceras(page: Page): Promise<string[]> {
  return jugadasLista(page).evaluateAll((lis) =>
    lis.map((li) => (li.querySelector('div') as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
  );
}

/** Texto del desglose de la fila de una palabra («Coloca 7 fichas… · palabra ×2 · +50…»). */
async function desgloseDe(page: Page, cabecera: string): Promise<string> {
  // Se compara con el innerText de la cabecera, como `cabeceras()`: el textContent pega la
  // palabra a los puntos («CHAQUETA98 pts») y un filtro por texto no casaría.
  const textos = await jugadasLista(page).evaluateAll(
    (lis, c) =>
      lis
        .filter((li) => (li.querySelector('div') as HTMLElement).innerText.replace(/\s+/g, ' ').trim() === c)
        .map((li) => (li.querySelector('p') as HTMLElement).innerText.replace(/\s+/g, ' ')),
    cabecera,
  );
  return textos[0] ?? '';
}

/** Añade fichas al atril; «★» es el comodín. */
async function añadirFichas(page: Page, fichas: string[]) {
  for (const f of fichas) {
    if (f === '★') await page.getByRole('button', { name: 'Añadir comodín al atril' }).click();
    else await añadirFicha(page, f);
  }
}

/** Anota ÑU (Ñ8 + U1 = 9) al jugador al que le toca. */
async function anotarÑU(page: Page) {
  await añadirFichas(page, ['Ñ', 'U']);
  await buscar(page);
  await jugadasLista(page).first().getByRole('button', { name: /^Anotar esta jugada a/ }).click();
}

test.describe('calculadora-jugada-scrabble · re-inspección 01/10/2026 · cálculo', () => {
  test('normal · CH,I,S,T,E con ×2 palabra da CHISTE 18 pts: el dígrafo es UNA ficha de 5', async ({ page }) => {
    // A mano: CH5 + I1 + S1 + T1 + E1 = 9; ×2 palabra = 18. No hay otra palabra de 5 fichas
    // con ese atril (oráculo): CHIST y CHITE, 16.
    await conDiccionario(page);
    await añadirFichas(page, ['CH', 'I', 'S', 'T', 'E']);
    await page.getByRole('button', { name: '×2 palabra' }).click();
    await buscar(page);
    expect((await cabeceras(page))[0]).toBe('CHISTE 18 pts');
    expect(await desgloseDe(page, 'CHISTE 18 pts')).toContain('Coloca 5 fichas de tu atril');
  });

  test('límite · CH,A,Q,U,E,T,★ con ×3 letra (auto) y ×2 palabra da CHAQUETA 98 pts', async ({ page }) => {
    // A mano: CH5×3 = 15 · A1 · Q5 · U1 · E1 · T1 · A(★)0 → 24; ×2 palabra = 48; siete fichas
    // del atril → +50 DESPUÉS de multiplicar (art. 19) = 98. «Auto» da el ×3 a la primera
    // ficha de más valor: CH y Q empatan a 5 y gana la CH. CHAQUETE empata a 98 (★ = E) y el
    // desempate alfabético deja CHAQUETA delante.
    await conDiccionario(page);
    await añadirFichas(page, ['CH', 'A', 'Q', 'U', 'E', 'T', '★']);
    await page.getByRole('button', { name: '×3 letra' }).click();
    await page.getByRole('button', { name: '×2 palabra' }).click();
    await buscar(page);
    expect((await cabeceras(page)).slice(0, 2)).toEqual(['CHAQUETA 98 pts', 'CHAQUETE 98 pts']);
    const desglose = await desgloseDe(page, 'CHAQUETA 98 pts');
    expect(desglose).toContain('comodín sobre A');
    expect(desglose).toContain('×3 en la CH');
    expect(desglose).toContain('palabra ×2');
    expect(desglose).toContain('+50 por colocar las siete fichas');
  });

  test('límite · el comodín sobre la casilla de triple letra vale 0 (★,A,Q,U,E,T,A, ×3 en la posición 1, ×2 palabra)', async ({ page }) => {
    // A mano, con el ×3 en la PRIMERA casilla:
    //   ANQUETA = (A1×3 + N(★)0 + Q5 + U1 + E1 + T1 + A1) = 12 → ×2 = 24 → +50 = 74 (la mejor)
    //   BAQUETA = (B(★)0×3 + A1 + Q5 + U1 + E1 + T1 + A1) = 10 → ×2 = 20 → +50 = 70
    // En BAQUETA el comodín ES la B de la casilla triple: triplicar un cero sigue siendo cero.
    await conDiccionario(page);
    await añadirFichas(page, ['★', 'A', 'Q', 'U', 'E', 'T', 'A']);
    await page.getByRole('button', { name: '×3 letra' }).click();
    await page.selectOption('#posicion-bonus', '1');
    await page.getByRole('button', { name: '×2 palabra' }).click();
    await buscar(page);
    const lista = await cabeceras(page);
    expect(lista[0]).toBe('ANQUETA 74 pts');
    expect(lista).toContain('BAQUETA 70 pts');
    const desglose = await desgloseDe(page, 'BAQUETA 70 pts');
    expect(desglose).toContain('comodín sobre B');
    expect(desglose).toContain('×3 en la B');
  });

  test(
    'REPARADO (01/10/2026), hallazgo 2591: el comodín hace de CH, LL o RR aunque el atril no traiga ninguna de sus letras · ★,U,S,Q,U,E,L da CHUSQUEL 60 pts',
    async ({ page }) => {
      // Reparado: `esViable` cuenta ahora FICHAS que faltan, no letras, sobre la palabra ya
      // partida en fichas (CH = una). Las otras cuatro palabras de la ficha, resueltas a mano:
      //   TORRENTE (T,O,★,E,N,T,E; ★ = RR): 1+1+0+1+1+1+1 = 6 +50 = 56
      //   CHAQUETA (★,A,Q,U,E,T,A; ★ = CH): 0+1+5+1+1+1+1 = 10 +50 = 60
      //   MARTILLO y MARCHITO (M,A,R,T,I,★,O; ★ = LL / CH): 3+1+1+1+1+0+1 = 8 +50 = 58
      //   CASTILLO (C,A,S,T,I,★,O; ★ = LL): 3+1+1+1+1+0+1 = 8 +50 = 58
      // Art. 10 FISE: el comodín sustituye a cualquier letra, y CH es una letra con ficha propia.
      // A mano: CH(★)0 + U1 + S1 + Q5 + U1 + E1 + L1 = 10; siete fichas → +50 = 60. Lo siguiente
      // (oráculo) es LUQUES, 10. El filtro previo `esViable` del motor cuenta LETRAS que faltan
      // (la C y la H, dos) en vez de FICHAS (una), y descarta la palabra antes de probarla. Igual
      // con T,O,★,E,N,T,E (TORRENTE 56) o ★,A,Q,U,E,T,A (CHAQUETA 60): no salen en la lista.
      await conDiccionario(page);
      await añadirFichas(page, ['★', 'U', 'S', 'Q', 'U', 'E', 'L']);
      await buscar(page);
      expect((await cabeceras(page))[0]).toBe('CHUSQUEL 60 pts');
      expect(await desgloseDe(page, 'CHUSQUEL 60 pts')).toContain('comodín sobre CH');

      const casos: Array<[string[], string[]]> = [
        [['T', 'O', '★', 'E', 'N', 'T', 'E'], ['TORRENTE 56 pts']],
        [['★', 'A', 'Q', 'U', 'E', 'T', 'A'], ['CHAQUETA 60 pts']],
        [['M', 'A', 'R', 'T', 'I', '★', 'O'], ['MARCHITO 58 pts', 'MARTILLO 58 pts']],
        [['C', 'A', 'S', 'T', 'I', '★', 'O'], ['CASTILLO 58 pts']],
      ];
      for (const [atril, esperadas] of casos) {
        await page.getByRole('button', { name: 'Limpiar' }).click();
        await añadirFichas(page, atril);
        await buscar(page);
        const lista = await cabeceras(page);
        for (const esperada of esperadas) expect(lista, atril.join(',')).toContain(esperada);
      }
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2590: ya no forma CH con una C y una H sueltas (art. 11 FISE) · C,H,A,P,A da HACA 9 pts',
    async ({ page }) => {
      // Modo «Con CH, LL y RR» (el de partida). Sin la ficha CH, CHAPA y PACHA no se pueden
      // formar (art. 11). Lo mejor legal (oráculo): HACA = H4 + A1 + C3 + A1 = 9.
      // Encabezaban CHAPA 12 y PACHA 12 (C3 + H4 sueltas = 7, más de lo que vale la CH, 5).
      // Reparado: con dígrafos, la palabra se parte en fichas y CH/LL/RR son SIEMPRE una sola
      // (`fichasDePalabra` en motor.ts): solo las cubre su ficha o un comodín entero.
      await conDiccionario(page);
      await añadirFichas(page, ['C', 'H', 'A', 'P', 'A']);
      await buscar(page);
      const lista = await cabeceras(page);
      expect(lista[0]).toBe('HACA 9 pts');
      expect(lista.filter((c) => /^(CHAPA|PACHA) /.test(c))).toEqual([]);

      // Y con la ficha CH en el atril, la palabra CH sale con ESA ficha (5), no con C3 + H4 = 7.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await añadirFichas(page, ['X', 'D', 'C', 'S', 'CH', 'M', 'H']);
      await buscar(page);
      const conFicha = await cabeceras(page);
      expect(conFicha).toContain('CH 5 pts');
      expect(conFicha).not.toContain('CH 7 pts');

      // Contraprueba: en «Solo letras sueltas» la C y la H sí se juntan, porque ahí no hay
      // ficha CH. CHAPA = C3 + H4 + A1 + P3 + A1 = 12 (empata con PACHA; desempate alfabético).
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await page.getByRole('button', { name: 'Solo letras sueltas' }).click();
      await añadirFichas(page, ['C', 'H', 'A', 'P', 'A']);
      await buscar(page);
      expect((await cabeceras(page)).slice(0, 2)).toEqual(['CHAPA 12 pts', 'PACHA 12 pts']);
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2590: ya no forma LL y RR con dos fichas sueltas (art. 11 FISE) · C,A,L,L,E no da CALLE y C,A,R,R,O no da CARRO',
    async ({ page }) => {
      // Lo mejor legal (oráculo, mismas reglas): ACLE = A1 + C3 + L1 + E1 = 6 (empata con ALCE,
      // CALE y CELA; desempate alfabético) y CORAR = C3 + O1 + R1 + A1 + R1 = 7 (con CROAR y
      // RACOR). Hoy encabezan CALLE 7 (L+L) y CARRO 7 (R+R), y salen también CELLA y CORRA.
      await conDiccionario(page);
      await añadirFichas(page, ['C', 'A', 'L', 'L', 'E']);
      await buscar(page);
      let lista = await cabeceras(page);
      expect(lista[0]).toBe('ACLE 6 pts');
      expect(lista.filter((c) => /^(CALLE|CELLA) /.test(c))).toEqual([]);

      await page.getByRole('button', { name: 'Limpiar' }).click();
      await añadirFichas(page, ['C', 'A', 'R', 'R', 'O']);
      await buscar(page);
      lista = await cabeceras(page);
      expect(lista[0]).toBe('CORAR 7 pts');
      expect(lista.filter((c) => /^(CARRO|CORRA) /.test(c))).toEqual([]);

      // Con un comodín ENTERO haciendo de RR sí sale: C,A,★,O → CARRO = C3 + A1 + RR(★)0 + O1 = 5,
      // en cuatro casillas.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await añadirFichas(page, ['C', 'A', '★', 'O']);
      await buscar(page);
      expect(await cabeceras(page)).toContain('CARRO 5 pts');
      expect(await desgloseDe(page, 'CARRO 5 pts')).toContain('comodín sobre RR');

      // La ficha lo decía con AHORRO: salía con una R + el comodín como la otra R. Ahora el
      // comodín cubre la RR entera y la R suelta se queda en el atril:
      // A1 + H4 + O1 + RR(★)0 + O1 = 7, colocando 5 fichas de las 6.
      await page.getByRole('button', { name: 'Limpiar' }).click();
      await añadirFichas(page, ['A', 'H', 'O', 'R', '★', 'O']);
      await buscar(page);
      expect(await cabeceras(page)).toContain('AHORRO 7 pts');
      const desglose = await desgloseDe(page, 'AHORRO 7 pts');
      expect(desglose).toContain('Coloca 5 fichas de tu atril');
      expect(desglose).toContain('comodín sobre RR');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2595: la misma palabra ya no sale dos veces (papa y papá del lemario) · P,A,P,A da una sola PAPA 8 pts y sin nota de empate',
    async ({ page }) => {
      // Reparado: el motor descarta una forma normalizada que ya ha puntuado. En fichas, papa y
      // papá son la misma jugada; la key de React (la palabra) vuelve a ser única.
      // A mano: PAPA = P3 + A1 + P3 + A1 = 8, y es la única palabra de 4 fichas. El lemario
      // trae «papa» y «papá», que normalizadas son la misma jugada; la app las lista dos veces
      // (y con la misma `key` de React) y la nota de empate anuncia «más de una jugada con 8».
      await conDiccionario(page);
      await añadirFichas(page, ['P', 'A', 'P', 'A']);
      await buscar(page);
      const lista = await cabeceras(page);
      expect(lista.filter((c) => c === 'PAPA 8 pts')).toHaveLength(1);
      expect(lista.filter((c) => c === 'APA 5 pts')).toHaveLength(1);
      expect(new Set(lista).size).toBe(lista.length);
      await expect(page.getByText(/Hay más de una jugada con/)).toHaveCount(0);
    },
  );

  test('rechazo · con 7 fichas en el atril no entra una octava: las teclas se deshabilitan', async ({ page }) => {
    await conDiccionario(page);
    await añadirFichas(page, ['A', 'E', 'I', 'O', 'U', 'S', 'R']);
    await expect(page.getByText('7/7', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Añadir ficha Z al atril/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Añadir comodín al atril' })).toBeDisabled();
  });

  test('rechazo · ★,★,A,Y,A no propone KAYAK: el comodín no puede ser K ni W (art. 10.2 FISE)', async ({ page }) => {
    // Con dos comodines, KAYAK cabría (K y K en blanco) si el comodín pudiera ser K. El art. 10.2
    // lo prohíbe, y no hay tecla de K ni de W.
    await conDiccionario(page);
    await expect(page.getByRole('button', { name: /^Añadir ficha (K|W) al atril/ })).toHaveCount(0);
    await añadirFichas(page, ['★', '★', 'A', 'Y', 'A']);
    await buscar(page);
    const lista = await cabeceras(page);
    expect(lista.length).toBeGreaterThan(0);
    expect(lista.filter((c) => /[KW]/.test(c.split(' ')[0]))).toEqual([]);
  });

  test(
    'REPARADO (01/10/2026), hallazgo 2600: el FAQPage ya no dice que K y W se forman «cubriéndolas con un comodín» (art. 10.2 FISE)',
    async ({ page }) => {
      // metadata.ts, pregunta «¿Cuánto vale cada ficha…?». El motor hace lo correcto (test de
      // arriba: ninguna palabra con K o W, ni con dos comodines); lo que se equivoca es la
      // respuesta estructurada que leen los buscadores y las IA.
      await page.goto(URL_APP);
      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
      expect(ld).toContain('FAQPage');
      expect(ld).not.toContain('salvo cubriéndolas con un comodín');
      expect(ld).toContain('ni siquiera con un comodín');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2592: una jugada sobre dos casillas de palabra multiplica ×4 o ×9 (art. 15 FISE) y admite varias casillas de letra',
    async ({ page }) => {
      // PALABRA con las 7 fichas: P3 + A1 + L1 + A1 + B3 + R1 + A1 = 11. Sobre dos casillas de
      // doble palabra (en el tablero estándar, fila 5 de la columna 5 a la 11): 11 × 4 = 44,
      // +50 = 94. La app solo admitía UN multiplicador de palabra (Normal / ×2 / ×3) y una
      // casilla de letra: lo más que daba era 11 × 2 + 50 = 72. Reparado con dos opciones más,
      // «×4 · dos dobles» y «×9 · dos triples», y hasta tres casillas de letra por jugada.
      await conDiccionario(page);
      await añadirFichas(page, ['P', 'A', 'L', 'A', 'B', 'R', 'A']);
      await page.getByRole('button', { name: '×2 palabra' }).click();
      await buscar(page);
      expect((await cabeceras(page))[0]).toBe('PALABRA 72 pts');

      await page.getByRole('button', { name: '×4 · dos dobles' }).click();
      await buscar(page);
      expect((await cabeceras(page))[0]).toBe('PALABRA 94 pts');
      expect(await desgloseDe(page, 'PALABRA 94 pts')).toContain('palabra ×4 (dos casillas de doble palabra)');

      // ×9: 11 × 9 = 99, +50 = 149.
      await page.getByRole('button', { name: '×9 · dos triples' }).click();
      await buscar(page);
      expect((await cabeceras(page))[0]).toBe('PALABRA 149 pts');

      // Dos casillas de letra en la misma palabra, las dos en «auto», con ×2 palabra: el ×3 va a
      // la ficha más valiosa (P y B empatan a 3: la primera, la P) y el ×2 a la siguiente (la B).
      //   P3×3 + A1 + L1 + A1 + B3×2 + R1 + A1 = 9 + 1 + 1 + 1 + 6 + 1 + 1 = 20 → ×2 = 40 → +50 = 90
      await page.getByRole('button', { name: '×2 palabra' }).click();
      await page.getByRole('button', { name: '×2 letra' }).click();
      await page.getByRole('button', { name: '+ Otra casilla de letra en la misma palabra' }).click();
      await page.getByRole('group', { name: 'Otra casilla de letra (2.ª)' }).getByRole('button', { name: '×3' }).click();
      await buscar(page);
      expect((await cabeceras(page))[0]).toBe('PALABRA 90 pts');
      const desglose = await desgloseDe(page, 'PALABRA 90 pts');
      expect(desglose).toContain('×3 en la P');
      expect(desglose).toContain('×2 en la B');

      // Una ficha no pisa dos casillas: con la 1.ª en la posición 1, la 2.ª no la ofrece.
      await page.selectOption('#posicion-bonus', '1');
      await expect(
        page.getByRole('combobox', { name: 'Posición de la 2.ª casilla de letra' }).locator('option[value="1"]'),
      ).toBeDisabled();
    },
  );
});

test.describe('calculadora-jugada-scrabble · reparación 01/10/2026 · lector de pantalla', () => {
  test('REPARADO (01/10/2026), sospecha: la sección de resultados ya no es una región viva con 40 jugadas; se anuncia un resumen', async ({ page }) => {
    // Sospecha anotada en la inspección: la sección entera era aria-live="polite", con hasta 40
    // jugadas, 40 desgloses y 40 botones «Anotar…». Al pintarse, un lector de pantalla la leía
    // entera. Confirmado con G,A,T,O: la región viva contenía 8 filas y 8 botones. Ahora no hay
    // región viva alrededor de la lista y un estado oculto anuncia solo el resumen.
    // A mano: G,A,T,O da 8 palabras (oráculo); la mejor, GATO = G2 + A1 + T1 + O1 = 5.
    await conDiccionario(page);
    await añadirFichas(page, ['G', 'A', 'T', 'O']);
    await buscar(page);
    const vivasConLista = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).filter((el) =>
          el.querySelector('ol'),
        ).length,
    );
    expect(vivasConLista).toBe(0);
    await expect(page.locator('#resultados-jugada [role="status"]')).toHaveText(
      '8 jugadas encontradas. La mejor: GATO, 5 puntos.',
    );
  });
});

test.describe('calculadora-jugada-scrabble · re-inspección 01/10/2026 · marcador', () => {
  test('persistencia · un marcador sembrado tras la hidratación se recupera al recargar, con totales y turno', async ({ page }) => {
    // Se siembra DESPUÉS de hidratar («Diccionario cargado» lo pinta un efecto de React), para
    // que el efecto que guarda el marcador al montar no lo pise. A mano: Ana 17 + 9 = 26 ·
    // Luis 5 · turno 1 → le toca a Luis.
    await conDiccionario(page);
    await page.evaluate(() => {
      localStorage.setItem(
        'meskeia_scrabble_marcador_v1',
        JSON.stringify({
          jugadores: ['Ana', 'Luis'],
          turno: 1,
          historial: [
            { jugadorIndice: 0, palabra: 'TAPAZO', puntos: 17 },
            { jugadorIndice: 1, palabra: 'GATO', puntos: 5 },
            { jugadorIndice: 0, palabra: 'ÑU', puntos: 9 },
          ],
        }),
      );
    });
    await page.reload();
    await expect(page.getByText(/Diccionario cargado/)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Marcador de partida/ }).click();

    await expect(page.getByLabel('Nombre del jugador 1')).toHaveValue('Ana');
    const fila1 = await filaJugador(page, 'Nombre del jugador 1');
    await expect(fila1).toContainText('26');
    await expect(fila1).not.toContainText('Le toca');
    const fila2 = await filaJugador(page, 'Nombre del jugador 2');
    await expect(fila2).toContainText('5');
    await expect(fila2).toContainText('Le toca');
    await expect(page.locator('#panel-marcador ol > li')).toHaveCount(3);

    await añadirFichas(page, ['Ñ', 'U']);
    await buscar(page);
    await expect(jugadasLista(page).first().getByRole('button', { name: 'Anotar esta jugada a Luis' })).toBeVisible();
  });

  test(
    'REPARADO (01/10/2026), hallazgo 2597: deshacer tras añadir un jugador devuelve el turno a quien hizo la jugada',
    async ({ page }) => {
      // Reparado: deshacer pone el turno en el `jugadorIndice` de la anotación deshecha.
      // Jugador 1 y Jugador 2 anotan ÑU (9 cada uno); se suma un tercero; se deshace la última
      // anotación, que era de Jugador 2 → le vuelve a tocar a Jugador 2. Hoy le toca a Jugador 3:
      // deshacer resta uno al turno con el número de jugadores NUEVO en vez de devolvérselo a
      // quien hizo la jugada deshecha.
      await conDiccionario(page);
      await anotarÑU(page);
      await anotarÑU(page);
      await page.getByRole('button', { name: '+ Añadir jugador' }).click();
      await page.getByRole('button', { name: 'Deshacer última anotación' }).click();
      await expect(page.locator('#panel-marcador ol > li')).toHaveCount(1);
      await expect(await filaJugador(page, 'Nombre del jugador 2')).toContainText('Le toca');
      await expect(await filaJugador(page, 'Nombre del jugador 3')).not.toContainText('Le toca');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2598: el nombre de un jugador se puede vaciar con la tecla de borrar',
    async ({ page }) => {
      // Reparado: el campo admite quedar vacío mientras se escribe; «Jugador N» vuelve solo al
      // salir del campo si se ha quedado vacío (se comprueba abajo, con el jugador 2).
      // Nueve retrocesos sobre «Jugador 1» → campo vacío; teclear «Ana» → «Ana». Hoy, al borrar
      // la última letra el onChange repone «Jugador 1» y lo tecleado se pega detrás:
      // «Jugador 1Ana».
      await conDiccionario(page);
      await page.getByRole('button', { name: /Marcador de partida/ }).click();
      const nombre = page.getByLabel('Nombre del jugador 1');
      await nombre.click();
      await page.keyboard.press('End');
      for (let i = 0; i < 'Jugador 1'.length; i++) await page.keyboard.press('Backspace');
      await expect(nombre).toHaveValue('', { timeout: 2000 });
      await nombre.pressSequentially('Ana');
      await esperarValorEnReact(page, nombre, 'Ana');

      const nombre2 = page.getByLabel('Nombre del jugador 2');
      await nombre2.fill('');
      await nombre2.blur();
      await expect(nombre2).toHaveValue('Jugador 2');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2599: «Nueva partida» se puede deshacer con «Recuperar la partida anterior»',
    async ({ page }) => {
      // Está junto a «Deshacer última anotación». Esperado: o pide confirmación o se puede
      // recuperar. Se eligió lo segundo: un diálogo en cada partida nueva estorba al uso normal,
      // y lo que había que evitar es perder la partida por un toque de más. La aserción original
      // (historial visible o «Deshacer» habilitado justo después) medía la vía del diálogo; con
      // la vía elegida, el historial se vacía y lo que tiene que existir es el botón que lo trae
      // de vuelta, con totales y turno.
      await conDiccionario(page);
      await anotarÑU(page);
      page.on('dialog', (d) => void d.dismiss());
      await page.getByRole('button', { name: 'Nueva partida' }).click();
      const historial = page.locator('#panel-marcador ol > li');
      await expect(historial).toHaveCount(0);
      await page.getByRole('button', { name: 'Recuperar la partida anterior' }).click();
      await expect(historial).toHaveCount(1);
      await expect(await filaJugador(page, 'Nombre del jugador 1')).toContainText('9');
      await expect(await filaJugador(page, 'Nombre del jugador 2')).toContainText('Le toca');
      await expect(page.getByRole('button', { name: 'Recuperar la partida anterior' })).toHaveCount(0);
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2594: se puede pasar turno o cambiar fichas (0 puntos) y anotar puntos a mano',
    async ({ page }) => {
      // Cambiar fichas o pasar (art. 25-26 FISE) da 0 puntos y pasa el turno; un plural o una
      // forma verbal (que el lemario no trae) no sale en la lista y no se puede anotar. El
      // marcador solo acepta jugadas de la lista: para dar el turno a Jugador 2 hay que
      // anotarle a Jugador 1 una jugada que no ha hecho.
      await conDiccionario(page);
      await page.getByRole('button', { name: /Marcador de partida/ }).click();
      const panel = page.locator('#panel-marcador');
      await expect(panel).toBeVisible();
      const controles =
        (await panel.getByRole('button', { name: /pasa|cambi|a mano|manual/i }).count()) +
        (await panel.locator('input[type="number"], input[inputmode="numeric"]').count());
      expect(controles).toBeGreaterThan(0);

      // Jugador 1 cambia fichas: 0 puntos y le toca a Jugador 2.
      await panel.getByRole('button', { name: 'Pasar turno o cambiar fichas (0 puntos)' }).click();
      await expect(await filaJugador(page, 'Nombre del jugador 1')).toContainText('0');
      await expect(await filaJugador(page, 'Nombre del jugador 2')).toContainText('Le toca');
      await expect(panel.locator('ol > li').first()).toContainText('Pasa o cambia fichas');

      // Jugador 2 juega CANTABAS (forma verbal que el lemario no trae) con cruces: la puntuación
      // la cuenta el jugador, 23, y se anota a mano. Una entrada que no es un número entero
      // («12abc») se rechaza con aviso y no anota nada.
      const puntos = panel.getByRole('textbox', { name: 'Puntos' });
      await puntos.fill('12abc');
      await panel.getByRole('button', { name: 'Anotar a mano' }).click();
      await expect(panel.getByRole('alert')).toContainText('número entero');
      await expect(panel.locator('ol > li')).toHaveCount(1);

      await panel.getByRole('textbox', { name: 'Palabra (opcional)' }).fill('cantabas');
      await puntos.fill('23');
      await panel.getByRole('button', { name: 'Anotar a mano' }).click();
      await expect(panel.locator('ol > li')).toHaveCount(2);
      await expect(panel.locator('ol > li').nth(1)).toContainText('CANTABAS (a mano)');
      await expect(await filaJugador(page, 'Nombre del jugador 2')).toContainText('23');
      await expect(await filaJugador(page, 'Nombre del jugador 1')).toContainText('Le toca');
      await expect(panel.getByRole('status')).toContainText('Anotados 23 puntos a mano a Jugador 2');
    },
  );

  test(
    'REPARADO (01/10/2026), hallazgo 2601: la FAQ «¿Se guarda lo que escribo?» dice que el marcador se guarda en el navegador',
    async ({ page }) => {
      // Lo único que se teclea en la app es el nombre de los jugadores, y queda en localStorage
      // (meskeia_scrabble_marcador_v1) junto a las palabras y los puntos. La FAQ visible dice:
      // «No. … ni quedan registradas en ningún sitio». Esperado: que mencione el marcador.
      await conDiccionario(page);
      await page.getByRole('button', { name: /Marcador de partida/ }).click();
      await sembrarValor(page, page.getByLabel('Nombre del jugador 1'), 'Ana');
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('meskeia_scrabble_marcador_v1') ?? ''))
        .toContain('"Ana"');
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const faq = page.locator('h4', { hasText: '¿Se guarda lo que escribo?' }).locator('xpath=following-sibling::p[1]');
      await expect(faq).toContainText(/marcador/i, { timeout: 2000 });
    },
  );
});

test.describe('calculadora-jugada-scrabble · re-inspección 01/10/2026 · móvil 390×844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** Atril G,A,T,O tocando las teclas (GATO = G2 + A1 + T1 + O1 = 5, empatada con GOTA y TOGA). */
  async function atrilGato(page: Page) {
    for (const f of ['G', 'A', 'T', 'O']) {
      await page.getByRole('button', { name: new RegExp(`^Añadir ficha ${f} al atril`) }).tap();
    }
  }

  test('MÓVIL · G,A,T,O tocando da GATO 5 pts sin desbordar en horizontal', async ({ page }) => {
    await conDiccionario(page);
    await atrilGato(page);
    await page.getByRole('button', { name: 'Buscar la mejor jugada' }).tap();
    await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toBeVisible({ timeout: 10000 });
    expect((await cabeceras(page))[0]).toBe('GATO 5 pts');
    const [ancho, visible] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(ancho).toBeLessThanOrEqual(visible);
  });

  test(
    'MÓVIL · REPARADO (01/10/2026), hallazgo 2593: con el botón al pie de la pantalla, la app lleva la vista a la lista',
    async ({ page }) => {
      // Reparado: tras buscar, la vista se lleva a un ancla al principio de los resultados, con
      // `scroll-margin-top` para que la barra fija del logo no tape la cabecera.
      // Medido el 01/10/2026: el teclado de fichas acaba en y≈1241 del documento y el botón
      // empieza en y≈1669 (428 px más abajo, con el bloque 3 en medio). Con el botón al pie de
      // la pantalla, tras tocarlo la cabecera «Mejores jugadas» queda en y≈944 y la primera
      // jugada en 1065-1284, de 844: no cambia nada visible. No hay campo de texto ni <form>,
      // así que Intro/enterKeyHint no entran aquí; lo que falta es llevar la vista al resultado.
      await conDiccionario(page);
      await atrilGato(page);
      const boton = page.getByRole('button', { name: 'Buscar la mejor jugada' });
      await boton.evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollTo(0, r.bottom + window.scrollY - window.innerHeight + 16);
      });
      await expect(boton).toBeInViewport({ ratio: 1 });
      await boton.tap();
      await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toBeVisible({ timeout: 10000 });
      await expect(jugadasLista(page).first()).toBeInViewport({ timeout: 2000 });
      // La cabecera, entera y por debajo de la barra fija del logo.
      const cabecera = page.getByRole('heading', { name: /Mejores jugadas/ });
      await expect(cabecera).toBeInViewport({ ratio: 1 });
      const tapa = await page.evaluate(() => {
        const h = Array.from(document.querySelectorAll('h2')).find((e) => e.textContent?.includes('Mejores jugadas'));
        if (!h) return 'sin cabecera';
        const r = h.getBoundingClientRect();
        const encima = document.elementFromPoint(r.left + 8, r.top + r.height / 2);
        return encima && h.contains(encima) ? 'visible' : `tapada por ${encima?.className ?? '?'}`;
      });
      expect(tapa).toBe('visible');
    },
  );

  test(
    'MÓVIL · REPARADO (01/10/2026), hallazgo 2596: tras «Anotar», la vista va al marcador y un aviso confirma la anotación',
    async ({ page }) => {
      // Medido el 01/10/2026: tras tocar «Anotar esta jugada a Jugador 1», los resultados se
      // vacían, la vista cae sobre la tabla «Cuánto vale cada ficha» y el panel del marcador,
      // que se abre solo, queda en y≈-1738…-1231. Quien lo repare con otra confirmación
      // visible (un aviso junto al botón, por ejemplo) adapta esta comprobación.
      await conDiccionario(page);
      await atrilGato(page);
      await page.getByRole('button', { name: 'Buscar la mejor jugada' }).tap();
      await expect(page.getByRole('heading', { name: /Mejores jugadas/ })).toBeVisible({ timeout: 10000 });
      await jugadasLista(page).first().getByRole('button', { name: /^Anotar esta jugada a/ }).tap();
      await expect(page.locator('#panel-marcador')).toBeVisible();
      await expect(page.locator('#panel-marcador')).toBeInViewport({ timeout: 2000 });
      // GATO = G2 + A1 + T1 + O1 = 5.
      const aviso = page.locator('#panel-marcador').getByRole('status');
      await expect(aviso).toHaveText('Anotados 5 puntos a Jugador 1. Le toca a Jugador 2.');
      await expect(aviso).toBeInViewport({ ratio: 1 });
    },
  );
});

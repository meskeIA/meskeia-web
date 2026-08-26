import { test, expect, Page } from '@playwright/test';

/**
 * generador-anagramas — FICHAS BLANCAS (comodines) del atril · 26/08/2026
 *
 * La app se presenta como ayuda para el atril de un juego de palabras: su bloque educativo
 * habla del bingo de +50 puntos, de las 7 fichas y de jugadas de alto valor. Pero un atril de
 * Scrabble en español trae DOS fichas blancas entre sus 100, y hasta hoy `normalizarTexto` las
 * descartaba junto a las cifras y los signos: quien tenía una blanca —justo cuando más falta
 * hace la ayuda— no tenía forma de representarla.
 *
 * LAS CIFRAS SE ANOTARON ANTES DE ABRIR EL NAVEGADOR
 * Se resolvieron con un oráculo independiente en Node, escrito contra
 * `public/data/diccionario-es.txt` (86.973 lemas) sin importar nada de la app: quita tildes
 * con NFD y cuenta multiconjuntos por su cuenta. Estas son sus salidas literales.
 *
 *   atril «casa», longitudes 2..10
 *     sin blanca     →     9 palabras   (2 de dos letras, 4 de tres, 3 de cuatro)
 *     con 1 blanca   →   176 palabras   (34 de dos, 50 de tres, 74 de cuatro, 18 de cinco)
 *                        de ellas, las MISMAS 9 sin gastar la blanca y 167 gastándola
 *     con 2 blancas  → 1.244 palabras
 *     con 3 blancas  → 4.976            ← por esto el tope son 2, no «2 y una de margen»
 *
 *   dónde cae la blanca (posición sobre la forma normalizada)
 *     «caspa» → [3]  ·  «basca» → [0]  ·  «casa» → []  (no la necesita)
 *
 *   Ni «casas» ni «cazas» existen en el lemario: es un lemario de formas canónicas, sin
 *   plurales. Conviene tenerlo presente al elegir casos.
 *
 * DÓNDE VIVE EL CÁLCULO — app/generador-anagramas/page.tsx
 *   analizarAtril()        ← separa letras concretas de fichas blancas, acota al tope
 *   posicionesDeComodin()  ← reparto voraz; devuelve QUÉ posiciones cubre una blanca, o null
 *   PalabraConComodines    ← resalta esas posiciones sobre la forma original, con sus tildes
 */

const URL_APP = '/generador-anagramas/';

/** Espera a que el diccionario esté cargado: sin él el botón nunca se habilita. */
async function conDiccionario(page: Page) {
  await page.goto(URL_APP);
  await expect(page.getByText(/Diccionario cargado/)).toBeVisible({ timeout: 15000 });
}

async function buscarCon(page: Page, atril: string) {
  await page.locator('#anagram-letters').fill(atril);
  await page.getByRole('button', { name: 'Buscar palabras' }).click();
  await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeEnabled();
}

/** Número que anuncia la cabecera de resultados. */
async function totalEncontrado(page: Page): Promise<number> {
  const texto = await page.getByRole('heading', { name: /Palabras encontradas/ }).textContent();
  return Number((texto ?? '').replace(/\D/g, ''));
}

test.describe('generador-anagramas · fichas blancas', () => {
  test('CONTROL · sin blanca, «casa» sigue dando exactamente las 9 de siempre', async ({ page }) => {
    await conDiccionario(page);
    await buscarCon(page, 'casa');
    expect(await totalEncontrado(page)).toBe(9);

    // Ninguna gasta blanca, así que la leyenda del comodín no debe aparecer
    await expect(page.getByText(/letra que pone una ficha blanca/)).toHaveCount(0);
  });

  test('«casa?» da las 176 del oráculo, y las 9 sin blanca siguen dentro', async ({ page }) => {
    await conDiccionario(page);
    await buscarCon(page, 'casa?');
    expect(await totalEncontrado(page)).toBe(176);

    // El desglose por longitud, tal y como lo anotó el oráculo
    await expect(page.getByRole('heading', { name: '5 letras (18)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '4 letras (74)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '3 letras (50)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2 letras (34)' })).toBeVisible();

    // 167 de las 176 gastan la blanca; la leyenda lo dice con esas cifras
    await expect(page.getByText(/167 de las 176 necesitan gastarla/)).toBeVisible();
  });

  test('la blanca se resalta en la letra que de verdad pone', async ({ page }) => {
    await conDiccionario(page);
    await buscarCon(page, 'casa?');

    // «caspa»: la blanca cubre la P (posición 3). Las otras cuatro letras son fichas reales.
    const caspa = page.locator('span').filter({ hasText: /^caspa$/ }).first();
    await expect(caspa).toBeVisible();
    await expect(caspa.locator('span')).toHaveText('p');

    // «basca»: la blanca cubre la B (posición 0)
    const basca = page.locator('span').filter({ hasText: /^basca$/ }).first();
    await expect(basca.locator('span')).toHaveText('b');

    // «casa» cabe con las fichas reales: no lleva ninguna letra resaltada
    const casa = page.locator('span').filter({ hasText: /^casa$/ }).first();
    await expect(casa.locator('span')).toHaveCount(0);
  });

  test('dentro de cada longitud, primero las que NO gastan la blanca', async ({ page }) => {
    await conDiccionario(page);
    await buscarCon(page, 'casa?');

    // Las tres de cuatro letras que salen sin blanca (asa+c, casa, saca…) deben ir por
    // delante de las 71 que sí la necesitan: conservar la blanca vale más que la jugada.
    const grupo = page.locator('h4', { hasText: '4 letras (74)' }).locator('..');
    const chips = grupo.locator('span[class*="wordChip"]');
    const primeras = await chips.evaluateAll((nodos) =>
      nodos.slice(0, 3).map((n) => n.querySelectorAll('span').length),
    );
    expect(primeras).toEqual([0, 0, 0]);

    // Y la cuarta ya gasta blanca
    const cuarta = await chips.nth(3).evaluate((n) => n.querySelectorAll('span').length);
    expect(cuarta).toBe(1);
  });

  test('el asterisco y el guion bajo valen lo mismo que el interrogante', async ({ page }) => {
    await conDiccionario(page);
    await buscarCon(page, 'casa*');
    expect(await totalEncontrado(page)).toBe(176);
    await buscarCon(page, 'casa_');
    expect(await totalEncontrado(page)).toBe(176);
  });

  test('el contador del atril separa letras de fichas blancas', async ({ page }) => {
    await conDiccionario(page);
    const campo = page.locator('#anagram-letters');

    await campo.fill('casa');
    await expect(page.locator('#anagram-atril')).toHaveText(/^4 letras$/);

    await campo.fill('casa?');
    await expect(page.locator('#anagram-atril')).toHaveText(/4 letras \+ 1 ficha blanca/);

    await campo.fill('casa??');
    await expect(page.locator('#anagram-atril')).toHaveText(/4 letras \+ 2 fichas blancas/);
  });

  test('por encima del tope de 2 se avisa en vez de ignorarlo en silencio', async ({ page }) => {
    await conDiccionario(page);
    await page.locator('#anagram-letters').fill('casa???');
    await expect(page.locator('#anagram-atril')).toHaveText(/se ignoran 1 comodín/);

    // Y la búsqueda usa 2, no 3: el oráculo da 1.244 con dos blancas
    await page.getByRole('button', { name: 'Buscar palabras' }).click();
    await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeEnabled();
    expect(await totalEncontrado(page)).toBe(1244);
  });

  test('un atril de solo comodines no se busca: saldría medio diccionario', async ({ page }) => {
    await conDiccionario(page);
    await page.locator('#anagram-letters').fill('??');
    await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeDisabled();
    await expect(page.locator('#anagram-atril')).toHaveText(/hace falta al menos una letra concreta/);

    // Con una letra concreta ya sí
    await page.locator('#anagram-letters').fill('a?');
    await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeEnabled();
  });

  test('la blanca funciona también sobre lemas con tilde', async ({ page }) => {
    await conDiccionario(page);
    await buscarCon(page, 'arbo?');

    // El oráculo da 55 palabras de 5 letras, «barón» entre ellas con la blanca en la N
    const baron = page.locator('span').filter({ hasText: /^barón$/ }).first();
    await expect(baron).toBeVisible();
    await expect(baron.locator('span')).toHaveText('n');
  });
});

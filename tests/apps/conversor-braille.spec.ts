import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Conversor de Código Braille — test de regresión (Inspector, 20/08/2026)
 *
 * Una de las apps más usadas del catálogo (1.157 usos) y un caso raro: su resultado SÍ
 * es comprobable contra un estándar externo, y su público objetivo es precisamente el
 * que no puede verificar la salida por sí mismo. Por eso todos los valores esperados de
 * este fichero se derivan del Código Braille Español, NUNCA de lo que la app devuelve.
 *
 * FUENTE ÚNICA DE LOS VALORES ESPERADOS
 *   Comisión Braille Española (ONCE), Documento Técnico B 2, «Signografía básica de las
 *   lenguas cooficiales españolas», V4 (22/01/2026) — la misma que declara la app.
 *   Descargado y leído en la inspección del 20/08/2026:
 *   https://www.once.es/servicios-sociales/braille/comision-braille-espanola/documentos-tecnicos
 *
 * CÓMO SE DERIVA CADA CELDA (para poder auditar este fichero sin ejecutarlo)
 *   Una celda braille son 6 puntos numerados 1-2-3 (columna izquierda, de arriba abajo)
 *   y 4-5-6 (columna derecha). El bloque Unicode Braille Patterns codifica la celda
 *   como U+2800 + suma de bits:
 *       punto 1 = 0x01 · punto 2 = 0x02 · punto 3 = 0x04
 *       punto 4 = 0x08 · punto 5 = 0x10 · punto 6 = 0x20
 *   Así, "l" (puntos 1-2-3) = U+2800 + 0x01+0x02+0x04 = U+2807 = ⠇.
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER (fijado por el CASO 1 y por las regresiones del pie)
 *   Las 27 letras, las seis vocales con diacrítico, la puntuación del § 6.1 —incluidos
 *   los signos que en español abren y cierran igual—, el signo de mayúscula ⠨ (§ 7), el
 *   signo de número ⠼ (§ 8.1) y el signo interruptor de número ⠐ (§ 8.2) coinciden con
 *   el documento. Las siglas letra a letra son el «recurso 1» del § 7.1, también válido.
 *
 * HALLAZGOS: los de las inspecciones del 20/08, del 22/09 y del 13/10/2026 están todos
 * REPARADOS (24-29 el 19/08, 57-62 el 21/08, 1183-1187 el 22/09, 3277-3280 el 19/10) y sus
 * tests pasan en verde. Los marcados con `test.fail()` —hoy, solo en el bloque del
 * 22/10/2026— afirman lo que DEBERÍA pasar y fallan a propósito. El día que se corrija la app
 * pasarán a ROJO («expected to fail, but passed») y habrá que quitarles la marca, no
 * reescribir el valor esperado.
 */

const RUTA = '/conversor-braille/';

/** Caja de resultado: es el único role="status" que además lleva aria-live="polite". */
const cajaResultado = (page: Page) => page.locator('[role="status"][aria-live="polite"]').first();

/** Escribe en el textarea y pulsa Convertir. `modo` elige el sentido de la conversión. */
async function convertir(page: Page, texto: string, modo: 'texto' | 'braille' = 'texto') {
  if (modo === 'braille') {
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
  }
  const textarea = page.locator('textarea').first();
  await textarea.fill('');
  await textarea.fill(texto);
  await page.getByRole('button', { name: 'Convertir' }).click();
}

/**
 * Puntos activos de cada celda de la vista «Vista con celdas Braille», leídos del DOM
 * (los seis <div> van en orden 1,4,2,5,3,6 y el activo lleva la clase `filled`).
 */
async function celdasVisuales(page: Page) {
  return page.evaluate(() => {
    const grid = document.querySelector('[class*="visualGrid"]');
    if (!grid) return [];
    const orden = [1, 4, 2, 5, 3, 6];
    return [...grid.querySelectorAll('[class*="brailleCell"]')].map((celda) => {
      const puntos = [...celda.querySelectorAll('[class*="brailleDot"]')]
        .map((d, i) => (d.className.includes('filled') ? orden[i] : 0))
        .filter(Boolean)
        .sort((a, b) => a - b);
      return puntos.join('-') || 'vacia';
    });
  });
}

/** Puntos en relieve que dibuja la hoja imprimible, agrupados por celda (6 mm de paso). */
async function celdasDeLaHoja(page: Page) {
  return page.evaluate(() => {
    const svg = [...document.querySelectorAll('svg')].find((s) =>
      (s.getAttribute('aria-label') || '').includes('escala real'),
    );
    if (!svg) return [];
    const porCelda = new Map<number, number>();
    [...svg.querySelectorAll('circle')].forEach((c) => {
      if (c.getAttribute('fill') !== '#000000') return; // los grises son la retícula guía
      const celda = Math.floor(parseFloat(c.getAttribute('cx') || '0') / 6);
      porCelda.set(celda, (porCelda.get(celda) || 0) + 1);
    });
    const total = Math.max(0, ...[...porCelda.keys()].map((k) => k + 1));
    return Array.from({ length: total }, (_, i) => porCelda.get(i) || 0);
  });
}

/** Lo que hay dentro del <strong> del aviso de caracteres sin celda, tal cual. */
async function caracteresDelAviso(page: Page) {
  return page.evaluate(() => {
    const aviso = [...document.querySelectorAll('[class*="avisoConversion"]')].find((p) =>
      (p.textContent || '').includes('Esta herramienta no escribe en braille'),
    );
    return aviso ? (aviso.querySelector('strong')?.innerHTML ?? null) : null;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — una frase con mayúscula, tilde, ñ y los signos del § 6.1
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 (normal) — «¡Sí, señor!» se transcribe signo a signo según el B 2', async ({
  page,
}) => {
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Conversor de Código Braille');

  await convertir(page, '¡Sí, señor!');

  // Derivación a mano, carácter por carácter. Entre paréntesis, el apartado del B 2:
  //   '¡' → 2-3-5  (§ 6.1: «abrir y cerrar exclamación», un único signo)
  //          = U+2800 + 0x02+0x04+0x10 = U+2816 = ⠖
  //   'S' → signo de mayúscula 4-6 (§ 7) = U+2828 = ⠨
  //          + s = 2-3-4 = U+2800 + 0x02+0x04+0x08 = U+280E = ⠎
  //   'í' → 3-4       = U+2800 + 0x04+0x08 = U+280C = ⠌
  //   ',' → 2         (§ 6.1: coma) = U+2802 = ⠂
  //   ' ' → celda sin puntos = U+2800 = ⠀
  //   's' → 2-3-4     = ⠎
  //   'e' → 1-5       = U+2811 = ⠑
  //   'ñ' → 1-2-4-5-6 = U+2800 + 0x01+0x02+0x08+0x10+0x20 = U+283B = ⠻
  //   'o' → 1-3-5     = U+2815 = ⠕
  //   'r' → 1-2-3-5   = U+2817 = ⠗
  //   '!' → 2-3-5     = ⠖  (el mismo signo que el de apertura)
  await expect(cajaResultado(page)).toHaveText('⠖⠨⠎⠌⠂⠀⠎⠑⠻⠕⠗⠖');

  // La vista de celdas debe pintar exactamente esos puntos, no otros.
  expect(await celdasVisuales(page)).toEqual([
    '2-3-5',
    '4-6',
    '2-3-4',
    '3-4',
    '2',
    'vacia',
    '2-3-4',
    '1-5',
    '1-2-4-5-6',
    '1-3-5',
    '1-2-3-5',
    '2-3-5',
  ]);

  // Y la hoja imprimible a escala real, el mismo número de puntos en relieve por celda
  // (la sexta es el espacio entre las dos palabras: ninguno).
  expect(await celdasDeLaHoja(page)).toEqual([3, 2, 3, 2, 1, 0, 3, 2, 5, 3, 4, 3]);

  // Ida y vuelta. El '¡' NO se recupera, y es correcto: el § 6.1 da un ÚNICO signo para
  // abrir y cerrar exclamación, así que la vuelta no puede saber cuál era. La app lo
  // advierte en pantalla en vez de disimularlo.
  await expect(page.getByText(/se abren y se cierran con el/)).toBeVisible();
  await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveText('!Sí, señor!');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — dónde empieza y dónde acaba una expresión numérica
// ═══════════════════════════════════════════════════════════════════════════
//
// REPARADO el 21/08/2026 (hallazgos 57 y 58, abiertos el 20/08/2026). El signo de número ⠼ vale para TODO el número,
// incluidos la coma decimal y el punto de millar que van dentro de él. El B 2 § 8.1 lo
// dice y lo demuestra con sus propios ejemplos:
//
//     «Cuando se escriban números formados por más de tres cifras, debe utilizarse el
//      punto 3 como separador de los grupos de tres dígitos.»
//         501.439.678  →  #EJA.DCI.FGH      (un solo # al principio)
//     «Como separador decimal se utiliza el punto 2 […]»
//         73,81        →  #GC,HA            (un solo # al principio)
//
// La app trataba la coma y el punto como fin de la expresión numérica: al escribir volvía
// a emitir ⠼ después de cada uno (celdas de más que no están en el estándar), y al leer
// braille español real devolvía LETRAS donde había cifras. Un número de teléfono o un
// precio —el caso más corriente en español, formato 1.234,56— volvía mal traducido y
// nada avisaba de ello.
test('CASO 2 (límite) — el signo de número ⠼ cubre la coma decimal y el punto de millar', async ({
  page,
}) => {
  await page.goto(RUTA);

  // ── Ejemplo literal del B 2 § 8.1: 73,81 → #GC,HA ──────────────────────────
  //   ⠼ signo de número = 3-4-5-6 = U+2800 + 0x04+0x08+0x10+0x20 = U+283C
  //   7 = g = 1-2-4-5 = U+281B = ⠛   ·   3 = c = 1-4 = U+2809 = ⠉
  //   , coma decimal  = punto 2 = U+2802 = ⠂   (NO cierra el número)
  //   8 = h = 1-2-5   = U+2813 = ⠓   ·   1 = a = punto 1 = U+2801 = ⠁
  // Esperado ⠼⠛⠉⠂⠓⠁ · antes de la reparación salía ⠼⠛⠉⠂⠼⠓⠁ (repetía el signo de número).
  await convertir(page, '73,81');
  await expect.soft(cajaResultado(page)).toHaveText('⠼⠛⠉⠂⠓⠁');

  // ── Ejemplo literal del B 2 § 8.1: 501.439.678 → #EJA.DCI.FGH ──────────────
  //   5=e=⠑ · 0=j=⠚ · 1=a=⠁ · punto de millar = punto 3 = U+2804 = ⠄
  //   4=d=⠙ · 3=c=⠉ · 9=i=⠊ · ⠄ · 6=f=⠋ · 7=g=⠛ · 8=h=⠓
  // Esperado ⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓ · antes de la reparación salía ⠼⠑⠚⠁⠄⠼⠙⠉⠊⠄⠼⠋⠛⠓.
  await page.goto(RUTA);
  await convertir(page, '501.439.678');
  await expect.soft(cajaResultado(page)).toHaveText('⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓');

  // ── Y la lectura, que es la mitad que la app anuncia en su título ──────────
  // Braille español real, escrito como manda el § 8.1, leído por la app:
  // Esperado «73,81» · antes de la reparación salía «73,ha» (la h y la a son las cifras 8 y 1).
  await page.goto(RUTA);
  await convertir(page, '⠼⠛⠉⠂⠓⠁', 'braille');
  await expect.soft(cajaResultado(page)).toHaveText('73,81');

  // Esperado «501.439.678» · antes de la reparación salía «501.dci.fgh».
  await page.goto(RUTA);
  await convertir(page, '⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓', 'braille');
  await expect.soft(cajaResultado(page)).toHaveText('501.439.678');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (sin representación) — qué hace con lo que no puede escribir en braille
// ═══════════════════════════════════════════════════════════════════════════
//
// REPARADO el 21/08/2026 (hallazgos 59, 60 y 61, abiertos el 20/08/2026): dos defectos
// distintos en el mismo mecanismo:
//   a) El apóstrofo SÍ tiene celda en la signografía básica. B 2 § 6.2, tabla de signos
//      auxiliares: punto 3, «apóstrofo (precedido y seguido de una letra)». La app lo
//      descartaba y encima afirmaba en pantalla que «el Código Braille Español no le asigna
//      celda en signografía básica», que es justo lo contrario de lo que dice su fuente.
//   b) El salto de línea se descartaba SIN dejar separación, así que dos palabras que
//      venían en líneas distintas salían pegadas en una sola palabra braille. Y el aviso
//      que lo contaba nombraba un carácter invisible: el <strong> quedaba vacío en pantalla.
//      Duele justo en la hoja imprimible, cuyo propio ejemplo es «Etiquetas de la
//      cocina» —una lista, es decir, varias líneas—.
test('CASO 3 (sin representación) — descarta lo que no tiene celda sin perder el resto', async ({
  page,
}) => {
  await page.goto(RUTA);

  // ── Entrada vacía: no inventa resultado. Esto SÍ degrada con elegancia. ────
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Imprimir la hoja/ })).toBeDisabled();

  // ── Un emoji no tiene celda en ninguna signografía española: bien resuelto ─
  // sol = ⠎(2-3-4) ⠕(1-3-5) ⠇(1-2-3), espacio = ⠀ · el emoji se omite y se dice.
  await convertir(page, 'sol 🙂');
  await expect(cajaResultado(page)).toHaveText('⠎⠕⠇⠀');
  expect(await celdasVisuales(page)).toEqual(['2-3-4', '1-3-5', '1-2-3', 'vacia']);
  await expect(page.getByText(/Esta herramienta no escribe en braille/)).toBeVisible();
  expect(await caracteresDelAviso(page)).toBe('🙂'); // el aviso nombra algo legible

  // ── (a) El apóstrofo, que sí está en el B 2 § 6.2 ─────────────────────────
  //   d = 1-4-5 = U+2819 = ⠙ · apóstrofo = punto 3 = U+2804 = ⠄
  //   o = 1-3-5 = ⠕        · r = 1-2-3-5 = ⠗
  // Esperado ⠙⠄⠕⠗ · antes de la reparación salía ⠙⠕⠗ y un aviso que negaba el estándar.
  await page.goto(RUTA);
  await convertir(page, "d'or");
  await expect.soft(cajaResultado(page)).toHaveText('⠙⠄⠕⠗');
  await expect.soft(page.getByText(/Esta herramienta no escribe en braille/)).toHaveCount(0);

  // ── (b) Dos líneas no pueden acabar siendo una sola palabra ───────────────
  //   sal      = ⠎(2-3-4) ⠁(1) ⠇(1-2-3)
  //   pimienta = ⠏(1-2-3-4) ⠊(2-4) ⠍(1-3-4) ⠊ ⠑(1-5) ⠝(1-3-4-5) ⠞(2-3-4-5) ⠁
  // El braille no tiene signo de salto de línea, así que lo mínimo exigible es la
  // separación de palabra (celda vacía ⠀), igual que hace con un espacio.
  // Esperado ⠎⠁⠇⠀⠏⠊⠍⠊⠑⠝⠞⠁ · antes de la reparación salía ⠎⠁⠇⠏⠊⠍⠊⠑⠝⠞⠁ («salpimienta»).
  await page.goto(RUTA);
  await convertir(page, 'sal\npimienta');
  await expect.soft(cajaResultado(page)).toHaveText('⠎⠁⠇⠀⠏⠊⠍⠊⠑⠝⠞⠁');
  // Y el aviso, si aparece, tiene que nombrar algo que se vea. Antes de la reparación el
  // <strong> llevaba un '\n' y en pantalla se leía «…signografía básica: . El resto del texto…».
  const nombrado = await caracteresDelAviso(page);
  expect.soft(nombrado === null || nombrado.trim().length > 0).toBe(true);
});

// ═══════════════════════════════════════════════════════════════════════════
// REGRESIONES — lo que ya se reparó y no debe volver atrás
// ═══════════════════════════════════════════════════════════════════════════

test('REGRESIÓN — signo de número, signo interruptor (§ 8.2) y siglas (§ 7.1)', async ({
  page,
}) => {
  await page.goto(RUTA);

  // B 2 § 8.2, ejemplo literal: 8b → #H@B. «Se utilizará un cajetín con el punto 5
  // separando los números de las letras, para evitar la confusión entre ellos.»
  //   ⠼ (3-4-5-6) · 2 = b = ⠃ · 4 = d = ⠙ · ⠐ (punto 5) · h = ⠓
  await convertir(page, '24h');
  await expect(cajaResultado(page)).toHaveText('⠼⠃⠙⠐⠓');
  // Y la celda del interruptor dibuja su punto 5, no una celda vacía (que sería espacio).
  expect(await celdasVisuales(page)).toEqual(['3-4-5-6', '1-2', '1-4-5', '5', '1-2-5']);

  // Ida y vuelta: sin el interruptor, «24h» volvería como «248».
  await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveText('24h');

  // B 2 § 7.1, recurso 1: «escribir el signo de mayúscula antes de cada una de las
  // letras que forman la sigla», con el ejemplo ONCE. ⠨ = 4-6.
  await page.goto(RUTA);
  await convertir(page, 'ONCE');
  await expect(cajaResultado(page)).toHaveText('⠨⠕⠨⠝⠨⠉⠨⠑');
  expect(await celdasDeLaHoja(page)).toEqual([2, 3, 2, 4, 2, 2, 2, 2]);
});

test('REGRESIÓN — puntuación del § 6.1 y vocales con diacrítico', async ({ page }) => {
  await page.goto(RUTA);

  // § 6.1: punto ortográfico = punto 3 = ⠄ (NO los 2-5-6 del braille inglés).
  // «Hola.» = ⠨(4-6) ⠓(1-2-5) ⠕(1-3-5) ⠇(1-2-3) ⠁(1) ⠄(3)
  await convertir(page, 'Hola.');
  await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁⠄');
  expect(await celdasVisuales(page)).toEqual(['4-6', '1-2-5', '1-3-5', '1-2-3', '1', '3']);

  // § 6.1: «abrir y cerrar interrogación» = puntos 2-6 = ⠢, un único signo.
  await page.goto(RUTA);
  await convertir(page, '¿Qué?');
  await expect(cajaResultado(page)).toHaveText('⠢⠨⠟⠥⠮⠢');
  // La salida entera vive dentro del bloque Braille Patterns: nada en tinta colado.
  expect(await cajaResultado(page).innerText()).toMatch(/^[⠀-⣿]+$/);

  // Las seis vocales con diacrítico del español, cada una con sus puntos:
  //   á = 1-2-3-5-6 = ⠷ · é = 2-3-4-6 = ⠮ · í = 3-4 = ⠌
  //   ó = 3-4-6     = ⠬ · ú = 2-3-4-5-6 = ⠾ · ü = 1-2-5-6 = ⠳
  await page.goto(RUTA);
  await convertir(page, 'áéíóúü');
  await expect(cajaResultado(page)).toHaveText('⠷⠮⠌⠬⠾⠳');

  // Vuelta desde braille español real: ⠓⠕⠇⠁⠄ es «hola.», no «hola'».
  await page.goto(RUTA);
  await convertir(page, '⠓⠕⠇⠁⠄', 'braille');
  await expect(cajaResultado(page)).toHaveText('hola.');
});

// ═══════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los dos sentidos avisan de lo mismo (hallazgo 62, 21/08/2026)
// ═══════════════════════════════════════════════════════════════════════════
//
// En «Texto → Braille» la app avisaba de lo que no podía escribir, pero en la dirección
// contraria una celda desconocida se colaba tal cual en la salida sin decir nada: el
// resultado dejaba de ser texto en español y nadie lo advertía.
test('REGRESIÓN — la barra inclinada del § 6.2 y el aviso de la vuelta', async ({ page }) => {
  // La barra inclinada es un signo de DOS celdas: punto 6 (⠠) + punto 2 (⠂).
  await page.goto(RUTA);
  await convertir(page, '24/08');
  //   ⠼ signo de número · 2=b=⠃ · 4=d=⠙ · ⠠⠂ barra · ⠼ reabre · 0=j=⠚ · 8=h=⠓
  await expect(cajaResultado(page)).toHaveText('⠼⠃⠙⠠⠂⠼⠚⠓');
  await expect(page.getByText(/Esta herramienta no escribe en braille/)).toHaveCount(0);

  // Y vuelve como barra, no como «punto 6 seguido de coma».
  await page.goto(RUTA);
  await convertir(page, '⠼⠃⠙⠠⠂⠼⠚⠓', 'braille');
  await expect(cajaResultado(page)).toHaveText('24/08');

  // Una celda que la app no sabe leer pasa al resultado, pero ahora lo dice.
  await page.goto(RUTA);
  await convertir(page, '⠓⠕⠇⠁⠫', 'braille');
  await expect(cajaResultado(page)).toHaveText('hola⠫');
  await expect(page.locator('[class*="avisoConversion"]').filter({ hasText: 'sin traducir' })).toContainText(
    '⠫',
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// re-inspección 22/09/2026
// ═══════════════════════════════════════════════════════════════════════════
//
// Los casos de arriba quedaron todos en verde tras la reparación del 21/08/2026
// (commit a716b338). Estos tres miran lo que aquéllos NO llegaron a mirar.
//
// Los valores esperados se derivan igual que los de arriba: del B 2 de la Comisión
// Braille Española y de la aritmética del bloque Unicode (U+2800 + bits de puntos),
// nunca de lo que la app devuelve. Cuando NO se ha podido anclar el valor a la fuente,
// el caso se apoya en una contradicción INTERNA de la app —su propia tabla o su propia
// función inversa dicen otra cosa—, que se puede auditar sin salir del repositorio.
test.describe('re-inspección 22/09/2026', () => {
  /**
   * Como `convertir`, pero esperando a la hidratación y comprobando que el texto llegó
   * al ESTADO de React. `fill()` pasa por el navegador y sí alcanza a React, pero solo
   * si la app ya hidrató: antes de eso escribe en el DOM y la app no se entera.
   */
  async function convertirHidratado(
    page: Page,
    texto: string,
    modo: 'texto' | 'braille' = 'texto',
  ) {
    await esperarHidratacion(page, ['textarea']);
    if (modo === 'braille') {
      await page.getByRole('button', { name: 'Braille → Texto' }).click();
    }
    const textarea = page.locator('textarea').first();
    await textarea.fill(texto);
    await esperarValorEnReact(page, textarea, texto);
    await page.getByRole('button', { name: 'Convertir' }).click();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — una fecha española, que es el texto más corriente que
  // existe con barra inclinada
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Derivación a mano de «12/05/2026», celda a celda:
  //   '1' → signo de número ⠼ (3-4-5-6) + a ⠁ (1)       [B 2 § 8.1]
  //   '2' → b ⠃ (1-2)
  //   '/' → barra inclinada, DOS celdas: ⠠ (punto 6) + ⠂ (punto 2)  [B 2 § 6.2]
  //   '0' → ⠼ reabre + j ⠚ (2-4-5)   ·   '5' → e ⠑ (1-5)
  //   '/' → ⠠ ⠂
  //   '2' → ⠼ + b ⠃ · '0' → j ⠚ · '2' → b ⠃ · '6' → f ⠋ (1-2-4)
  //
  // El test de arriba «la barra inclinada del § 6.2 y el aviso de la vuelta» ya fija la
  // CADENA que sale de «24/08», y sigue bien. Lo que nadie había mirado son las otras
  // dos salidas de la app para esa misma cadena: la vista de celdas y la hoja a escala
  // real. Ahí la primera celda de la barra sale SIN NINGÚN PUNTO.
  test('CASO 1 (normal) — «12/05/2026» sale correcta en Unicode', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, '12/05/2026');
    await expect(cajaResultado(page)).toHaveText('⠼⠁⠃⠠⠂⠼⠚⠑⠠⠂⠼⠃⠚⠃⠋');
    // Y no sobra ni falta nada: la app no avisa de ningún carácter descartado.
    await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);
  });

  // REPARADO el 22/09/2026 (hallazgo 1183) — `brailleDots` no tenía entrada para ⠠ (U+2820,
  // punto 6), que es la PRIMERA celda de la barra inclinada. Tanto `renderBrailleCell`
  // como el constructor de la hoja hacen `brailleDots[c] ?? []`, así que esa celda se
  // dibujaba con los seis puntos apagados. Desde el 23/09 lo vigila `npm run check:braille`.
  //
  // Era exactamente el defecto que el 21/08/2026 se reparó para ⠼, ⠨ y ⠐ —«faltaban, y
  // brailleDots[c] ?? [] devolvía una celda sin ningún punto: en la hoja a escala real
  // eso es un espacio, no un indicador»—, con ⠠ dejado atrás. Y aquí dolía más: el
  // lector táctil encontraba una celda en blanco (= separación de palabra) seguida de un
  // punto 2 (= coma), de modo que la hoja punzada decía «12 ,05 ,2026».
  test('1183 (regresión) — la barra inclinada dibuja su punto 6', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, '12/05/2026');
    await expect(cajaResultado(page)).toHaveText('⠼⠁⠃⠠⠂⠼⠚⠑⠠⠂⠼⠃⠚⠃⠋');

    // Esperado: las celdas 4 y 9 son el punto 6. Antes de la reparación: 'vacia' en ambas.
    expect(await celdasVisuales(page)).toEqual([
      '3-4-5-6', '1', '1-2', '6', '2',
      '3-4-5-6', '2-4-5', '1-5', '6', '2',
      '3-4-5-6', '1-2', '2-4-5', '1-2', '1-2-4',
    ]);

    // Y la hoja a escala real, un punto en relieve en esas dos celdas.
    // Esperado [4,1,2,1,1,4,3,2,1,1,4,2,3,2,3] · antes de la reparación, 0 en la 4.ª y la 9.ª.
    expect(await celdasDeLaHoja(page)).toEqual([4, 1, 2, 1, 1, 4, 3, 2, 1, 1, 4, 2, 3, 2, 3]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — dos fronteras donde la app tiene la respuesta correcta
  // en su propio código y no la usa
  // ─────────────────────────────────────────────────────────────────────────
  //
  // REPARADO el 22/09/2026 (hallazgo 1184) (a) — el apóstrofo TIPOGRÁFICO.
  // La reparación del 20/08/2026 dio de alta el apóstrofo (B 2 § 6.2, punto 3 = ⠄)
  // nombrando el caso que la motivaba: «l'Hospitalet, d'Alacant». Pero dio de alta solo
  // U+0027, el apóstrofo recto que sale del teclado. El que llevan los textos reales es
  // U+2019 (’), porque Word, Google Docs, iOS y Android lo sustituyen al escribir, y ese
  // no estaba en la tabla: se descartaba.
  //
  // No hacía falta salir del fichero para ver que era un descuido y no una decisión: esa
  // misma tabla SÍ normalizaba las comillas tipográficas “ ” y las angulares « » a la
  // celda 2-3-6. Se contempló el problema para la comilla doble y no para la simple.
  // Y el aviso que la app mostraba decía «puede que el Código Braille Español sí les
  // asigne celda fuera de la signografía básica que cubre esta app», cuando la celda
  // estaba en su propia tabla dos líneas más abajo.
  test('1184 (regresión) — el apóstrofo tipográfico ’ (U+2019) tiene celda', async ({ page }) => {
    await page.goto(RUTA);

    // Control: con el apóstrofo recto la app ya hace lo correcto desde el 21/08/2026.
    //   l ⠇(1-2-3) · ' ⠄(3) · H ⠨(4-6)+⠓(1-2-5) · o ⠕ · s ⠎ · p ⠏ · i ⠊ · t ⠞ · a ⠁
    //   · l ⠇ · e ⠑ · t ⠞
    await convertirHidratado(page, "l'Hospitalet");
    await expect(cajaResultado(page)).toHaveText('⠇⠄⠨⠓⠕⠎⠏⠊⠞⠁⠇⠑⠞');

    // El mismo topónimo tal y como lo escribe un procesador de textos.
    // Esperado ⠇⠄⠨⠓⠕⠎⠏⠊⠞⠁⠇⠑⠞ · antes de la reparación salía ⠇⠨⠓⠕⠎⠏⠊⠞⠁⠇⠑⠞ y un aviso de descarte.
    await page.goto(RUTA);
    await convertirHidratado(page, 'l’Hospitalet');
    await expect(cajaResultado(page)).toHaveText('⠇⠄⠨⠓⠕⠎⠏⠊⠞⠁⠇⠑⠞');
    await expect(page.getByText(/Esta herramienta no escribe en braille/)).toHaveCount(0);
  });

  // REPARADO el 22/09/2026 (hallazgo 1186) (b) — dónde acaba la expresión numérica cuando el
  // punto NO es separador de millares.
  //
  // `convertTextToBraille` cerraba la expresión numérica al llegar un punto o una coma
  // que no iba seguido de cifra, y emitía la letra siguiente SIN el prefijo de latina
  // minúscula (⠐, punto 5, B 2 § 8.2). Pero el lector no ve dónde se cerró la
  // expresión: ve ⠼⠉⠄⠃ y, como ⠄ dentro de un número es el separador de millares
  // (§ 8.1), lee ⠃ como la cifra 2.
  //
  // La prueba de que estaba mal no necesitaba fuente externa: la vuelta de la PROPIA app
  // devolvía «3.2» de lo que ella misma escribía para «3.b», y en cambio leía bien
  // ⠼⠉⠄⠐⠃ como «3.b». La app sabía la codificación correcta; solo no la emitía.
  test('1186 (regresión) — «3.b» emite el prefijo de latina del § 8.2', async ({ page }) => {
    await page.goto(RUTA);

    // Esperado ⠼⠉⠄⠐⠃ (⠼ · c=3 · punto 3 · prefijo punto 5 · b) · antes de la reparación, ⠼⠉⠄⠃.
    await convertirHidratado(page, '3.b');
    await expect(cajaResultado(page)).toHaveText('⠼⠉⠄⠐⠃');

    // Y la ida y vuelta, que es lo que lo volvía comprobable: antes devolvía «3.2».
    await page.goto(RUTA);
    await convertirHidratado(page, '⠼⠉⠄⠐⠃', 'braille');
    await expect(cajaResultado(page)).toHaveText('3.b');
    await page.goto(RUTA);
    await convertirHidratado(page, '⠼⠉⠄⠃', 'braille');
    await expect(cajaResultado(page)).toHaveText('3.2');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (debe rechazarse) — texto en tinta pegado en «Braille → Texto»
  // ─────────────────────────────────────────────────────────────────────────
  //
  // REPARADO el 22/09/2026 (hallazgo 1187). En «Braille → Texto», `convertBrailleToText` hace
  // `brailleToText[char] || char`: lo que no reconoce lo copia tal cual. Para una CELDA
  // braille desconocida eso estaba resuelto desde el 21/08/2026 —pasa al resultado y la
  // app lo dice—, pero el aviso solo miraba caracteres del bloque U+2800-U+28FF. Un texto
  // en tinta no tiene ninguno, así que salía entero al cuadro de resultado, sin un solo
  // aviso, con el aspecto de una conversión que había ido bien.
  //
  // Es el error de manejo más probable de esta app —llegar, pegar y pulsar Convertir sin
  // reparar en que el selector está en el otro sentido— y era el único caso en el que la
  // app devolvía algo que parece una traducción y no lo es. Lo mínimo exigible era que
  // dijera algo, igual que dice algo en los otros tres modos de fallo que ya cubre.
  test('1187 (regresión) — texto en tinta en modo Braille → Texto se avisa', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Hola mundo', 'braille');

    // Antes de la reparación el resultado era «Hola mundo», idéntico a la entrada, sin ningún aviso.
    await expect(page.locator('[class*="avisoConversion"]')).not.toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 1185 — la FAQ no puede decir que el UEB es del inglés y del español a la vez
// ═════════════════════════════════════════════════════════════════════════════
//
// Dos respuestas ADYACENTES afirmaban lo contrario la una de la otra: una que el UEB de 2004
// unificó los sistemas DEL INGLÉS, y la siguiente que es «un estándar internacional adaptado al
// español como UEB-Es». Ni «Braille Unificado en Español» ni «UEB-Es» aparecen en la página de
// la Comisión Braille Española (ONCE), consultada el 22/09/2026, así que la afirmación se retira
// en vez de reescribirse por otra versión. Pesa aquí más de lo normal porque la diferencia entre
// el braille español y el inglés ES la promesa de la app, y porque una FAQPage es lo que ChatGPT,
// Perplexity y Bing Copilot usan para fundamentar respuestas.
test('1185 (regresión) — la FAQ no atribuye el UEB al español ni inventa un «UEB-Es»', async ({
  page,
}) => {
  await page.goto(RUTA);
  const cuerpo = (await page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return clon.textContent ?? '';
  })).replace(/\s+/g, ' ');

  expect(cuerpo).not.toContain('UEB-Es');
  expect(cuerpo).not.toContain('Braille Unificado en Español');
  expect(cuerpo).not.toContain('adaptado al español');
  // Y lo que queda dicho del UEB es lo mismo en toda la página: que es del inglés.
  expect(cuerpo).toContain('unificó los distintos sistemas del inglés');
  expect(cuerpo).toContain('no se aplica al español');
  // La fuente que la app cita en su código sale también en pantalla.
  expect(cuerpo).toContain('Comisión Braille Española');
  expect(cuerpo).toContain('Documento Técnico B 2');
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 13/10/2026
// ═════════════════════════════════════════════════════════════════════════════
//
// Todos los hallazgos anteriores (24-29, 57-62, 1183-1187) están REPARADOS y sus tests de
// arriba pasan. Este bloque mira lo que aquéllos no miraban: los PUNTOS de la hoja a escala
// real —también en espejo, que es la que se punza—, signos que la app sí escribe pero en un
// sitio donde el B 2 no los admite, y qué pasa con el resultado cuando la entrada cambia
// después de convertir.
//
// FUENTE de los valores esperados: la de la cabecera (Documento Técnico B 2 de la Comisión
// Braille Española, V4, 22/01/2026), y SOLO por los apartados que este fichero o la propia
// app ya citan literalmente: § 6.1 (puntuación), § 6.2 (apóstrofo = punto 3 «precedido y
// seguido de una letra»; barra = 6 + 2), § 7 y § 7.1 (mayúscula 4-6; siglas letra a letra),
// § 8.1 (signo de número 3-4-5-6; coma decimal = punto 2, sin repetir el signo) y § 8.2
// (prefijo de latina minúscula = punto 5). La web de la ONCE no se pudo consultar en esta
// inspección (dominio no permitido), así que nada de lo que sigue se apoya en una celda que
// no esté ya citada así en el repositorio. Las celdas Unicode salen de la aritmética del
// bloque: U+2800 + bits (punto 1 = 0x01, 2 = 0x02, 3 = 0x04, 4 = 0x08, 5 = 0x10, 6 = 0x20).
test.describe('re-inspección 13/10/2026', () => {
  async function convertirHidratado(
    page: Page,
    texto: string,
    modo: 'texto' | 'braille' = 'texto',
  ) {
    await esperarHidratacion(page, ['textarea']);
    if (modo === 'braille') {
      await page.getByRole('button', { name: 'Braille → Texto' }).click();
    }
    const textarea = page.locator('textarea').first();
    await textarea.fill(texto);
    await esperarValorEnReact(page, textarea, texto);
    await page.getByRole('button', { name: 'Convertir' }).click();
  }

  /**
   * Puntos en relieve de la PRIMERA línea de la hoja, celda a celda ('' si la celda no tiene
   * ninguno). Reconstruye cada punto desde su posición en milímetros con la norma que la app
   * trae por defecto, Marburg Medium: 6 mm entre celdas, 2,5 mm entre puntos, radio 0,75 mm;
   * columna izquierda = puntos 1-2-3, derecha = 4-5-6. `celdasDeLaHoja`, arriba, solo cuenta
   * cuántos puntos hay, y en espejo un recuento no distingue una celda de su reflejo.
   */
  async function puntosDeLaHoja(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find((s) =>
        (s.getAttribute('aria-label') || '').includes('escala real'),
      );
      if (!svg) return [];
      const celdas = new Map<number, number[]>();
      let ultima = -1;
      [...svg.querySelectorAll('circle')].forEach((c) => {
        const cx = parseFloat(c.getAttribute('cx') || '0');
        const cy = parseFloat(c.getAttribute('cy') || '0');
        if (cy >= 10) return; // solo la primera línea (10 mm entre líneas)
        const celda = Math.floor(cx / 6);
        ultima = Math.max(ultima, celda);
        if (c.getAttribute('fill') !== '#000000') return; // los grises son la retícula guía
        const columna = Math.round((cx - celda * 6 - 0.75) / 2.5);
        const fila = Math.round((cy - 0.75) / 2.5);
        const lista = celdas.get(celda) ?? [];
        lista.push(columna * 3 + fila + 1);
        celdas.set(celda, lista);
      });
      return Array.from({ length: ultima + 1 }, (_, i) =>
        (celdas.get(i) ?? []).sort((a, b) => a - b).join('-'),
      );
    });
  }

  /** El aviso de «Braille → Texto» para las celdas que pasan al resultado sin traducir. */
  const avisoSinTraducir = (page: Page) =>
    page.locator('[class*="avisoConversion"]').filter({ hasText: 'sin traducir' });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — mayúscula inicial, ñ, número, dos puntos, ¿? y tilde
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 1 (normal) — «Año 2026: ¿qué tal?» en cadena, en celdas, en la hoja y en espejo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Año 2026: ¿qué tal?');

    // Derivación a mano, carácter a carácter:
    //   'A' → ⠨ (4-6, § 7) + ⠁ (1)   ·  'ñ' → ⠻ (1-2-4-5-6)  ·  'o' → ⠕ (1-3-5)
    //   ' ' → ⠀ (celda sin puntos)
    //   '2026' → ⠼ (3-4-5-6, § 8.1, UNO solo) ⠃ (1-2) ⠚ (2-4-5) ⠃ (1-2) ⠋ (1-2-4)
    //   ':' → ⠒ (2-5, § 6.1)  ·  ' ' → ⠀
    //   '¿' → ⠢ (2-6, § 6.1: el mismo signo abre y cierra)
    //   'q' → ⠟ (1-2-3-4-5)  ·  'u' → ⠥ (1-3-6)  ·  'é' → ⠮ (2-3-4-6)  ·  ' ' → ⠀
    //   't' → ⠞ (2-3-4-5)  ·  'a' → ⠁ (1)  ·  'l' → ⠇ (1-2-3)  ·  '?' → ⠢ (2-6)
    await expect(cajaResultado(page)).toHaveText('⠨⠁⠻⠕⠀⠼⠃⠚⠃⠋⠒⠀⠢⠟⠥⠮⠀⠞⠁⠇⠢');
    await expect(page.getByText(/Esta herramienta no escribe en braille/)).toHaveCount(0);

    const lectura = [
      '4-6', '1', '1-2-4-5-6', '1-3-5', '',
      '3-4-5-6', '1-2', '2-4-5', '1-2', '1-2-4', '2-5', '',
      '2-6', '1-2-3-4-5', '1-3-6', '2-3-4-6', '',
      '2-3-4-5', '1', '1-2-3', '2-6',
    ];
    expect(await celdasVisuales(page)).toEqual(lectura.map((p) => p || 'vacia'));
    // La hoja a escala real, punto a punto y no solo cuántos: 21 celdas en una línea de 29.
    await expect.poll(() => puntosDeLaHoja(page)).toEqual(lectura);

    // En espejo —la orientación que se punza con regleta por el reverso— la línea va de
    // derecha a izquierda, alineada a la derecha (29 − 21 = 8 celdas libres delante), y cada
    // celda se refleja 1↔4, 2↔5, 3↔6. Empezando por la ÚLTIMA celda del texto:
    //   ⠢ 2-6 → 3-5 · ⠇ 1-2-3 → 4-5-6 · ⠁ 1 → 4 · ⠞ 2-3-4-5 → 1-2-5-6 · ⠀
    //   ⠮ 2-3-4-6 → 1-3-5-6 · ⠥ 1-3-6 → 3-4-6 · ⠟ 1-2-3-4-5 → 1-2-4-5-6 · ⠢ → 3-5 · ⠀
    //   ⠒ 2-5 → 2-5 · ⠋ 1-2-4 → 1-4-5 · ⠃ 1-2 → 4-5 · ⠚ 2-4-5 → 1-2-5 · ⠃ → 4-5
    //   ⠼ 3-4-5-6 → 1-2-3-6 · ⠀ · ⠕ 1-3-5 → 2-4-6 · ⠻ 1-2-4-5-6 → 1-2-3-4-5 · ⠁ → 4
    //   ⠨ 4-6 → 1-3
    await page.getByRole('button', { name: 'Espejo (regleta y punzón)' }).click();
    await expect
      .poll(() => puntosDeLaHoja(page))
      .toEqual([
        '', '', '', '', '', '', '', '',
        '3-5', '4-5-6', '4', '1-2-5-6', '',
        '1-3-5-6', '3-4-6', '1-2-4-5-6', '3-5', '',
        '2-5', '1-4-5', '4-5', '1-2-5', '4-5', '1-2-3-6', '',
        '2-4-6', '1-2-3-4-5', '4', '1-3',
      ]);

    // Ida y vuelta: '¿' vuelve como '?' (§ 6.1, un único signo) y nada más cambia.
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir' }).click();
    await expect(cajaResultado(page)).toHaveText('Año 2026: ?qué tal?');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — sigla, coma decimal, cifra + letra a-j, ü, ¡! y comillas
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 2 (límite) — «¡ONU: 3,5 y 2a «pingüino»!» y la mayúscula tras cifra (hallazgo 26)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, '¡ONU: 3,5 y 2a «pingüino»!');

    //   '¡' → ⠖ (2-3-5, § 6.1)
    //   'ONU' → sigla letra a letra (§ 7.1, recurso 1): ⠨⠕ (4-6 | 1-3-5) ⠨⠝ (4-6 | 1-3-4-5)
    //           ⠨⠥ (4-6 | 1-3-6)
    //   ':' → ⠒ (2-5)  ·  ' ' → ⠀
    //   '3,5' → ⠼ (3-4-5-6) ⠉ (1-4) ⠂ (2: coma decimal, § 8.1, NO repite ⠼) ⠑ (1-5)
    //   ' ' → ⠀  ·  'y' → ⠽ (1-3-4-5-6)  ·  ' ' → ⠀
    //   '2a' → ⠼ ⠃ (1-2) ⠐ (5: prefijo de latina minúscula, § 8.2) ⠁ (1)
    //   ' ' → ⠀  ·  '«' → ⠦ (2-3-6, § 6.1)
    //   'pingüino' → ⠏ (1-2-3-4) ⠊ (2-4) ⠝ (1-3-4-5) ⠛ (1-2-4-5) ⠳ (1-2-5-6) ⠊ ⠝ ⠕ (1-3-5)
    //   '»' → ⠦ (el mismo signo que abre)  ·  '!' → ⠖
    await expect(cajaResultado(page)).toHaveText('⠖⠨⠕⠨⠝⠨⠥⠒⠀⠼⠉⠂⠑⠀⠽⠀⠼⠃⠐⠁⠀⠦⠏⠊⠝⠛⠳⠊⠝⠕⠦⠖');
    await expect(page.getByText(/Esta herramienta no escribe en braille/)).toHaveCount(0);
    expect(await celdasVisuales(page)).toEqual([
      '2-3-5', '4-6', '1-3-5', '4-6', '1-3-4-5', '4-6', '1-3-6', '2-5', 'vacia',
      '3-4-5-6', '1-4', '2', '1-5', 'vacia', '1-3-4-5-6', 'vacia',
      '3-4-5-6', '1-2', '5', '1', 'vacia',
      '2-3-6', '1-2-3-4', '2-4', '1-3-4-5', '1-2-4-5', '1-2-5-6', '2-4', '1-3-4-5', '1-3-5',
      '2-3-6', '2-3-5',
    ]);

    // Vuelta: ¡ y « » no se recuperan (§ 6.1, un único signo para abrir y cerrar) y la app
    // los devuelve como «!» y «"»; las cifras, la coma decimal y el «2a» vuelven enteros.
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir' }).click();
    await expect(cajaResultado(page)).toHaveText('!ONU: 3,5 y 2a "pingüino"!');

    // Hallazgo 26 (REPARADO el 19/08/2026): el signo de mayúscula cierra la expresión
    // numérica también al LEER. «España 3D» → ⠨⠑ ⠎ ⠏ ⠁ ⠻ ⠁ ⠀ ⠼⠉ ⠨⠙, y vuelve igual.
    await page.goto(RUTA);
    await convertirHidratado(page, 'España 3D');
    await expect(cajaResultado(page)).toHaveText('⠨⠑⠎⠏⠁⠻⠁⠀⠼⠉⠨⠙');
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir' }).click();
    await expect(cajaResultado(page)).toHaveText('España 3D');

    // Hallazgo 29 (REPARADO el 19/08/2026): la guía describe el signo de mayúscula con sus
    // puntos de verdad, 4-6 (§ 7), no «punto 6».
    await expect(page.locator('[data-guia-educativa]')).toContainText('(⠨, puntos 4-6)');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (rechazo) — caracteres sin celda en la signografía del español
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 3 (rechazo) — cirílico y emoji se omiten y se nombran; el número queda entero', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // 'Д' y 'а' son cirílicas (U+0414 y U+0430: la segunda es idéntica a la vista a la «a»
    // latina) y '🙂' es un emoji: ninguno tiene celda en la signografía del español.
    //   'Да' → nada · ' ' → ⠀ · '3,5' → ⠼ ⠉ ⠂ ⠑ (§ 8.1) · ' ' → ⠀ · '🙂' → nada
    await convertirHidratado(page, 'Да 3,5 🙂');
    await expect(cajaResultado(page)).toHaveText('⠀⠼⠉⠂⠑⠀');
    const aviso = page
      .locator('[class*="avisoConversion"]')
      .filter({ hasText: 'Esta herramienta no escribe en braille' });
    await expect(aviso.locator('strong')).toHaveText('Д · а · 🙂');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ HALLAZGO 3279 REPARADO (19/10/2026) — lo que quedaba del hallazgo 62
  // ─────────────────────────────────────────────────────────────────────────
  //
  // El 62 (REPARADO el 21/08/2026) hizo que una celda sin equivalente pasara al resultado
  // AVISANDO. Pero `celdasSinTexto` descartaba de antemano toda celda que apareciera en
  // `SIGNOS_COMPUESTOS` (⠠ y ⠂), formara o no el signo compuesto. ⠂ suelta es la coma y no
  // importa; ⠠ suelta no tiene ningún equivalente en la tabla de la app —solo existe como
  // primera mitad de la barra ⠠⠂ (§ 6.2)— y pasaba al texto sin una palabra. Ahora solo se
  // exime cuando forma la barra.
  //
  // No es una celda rara: ⠠ (punto 6) es el signo de mayúscula del braille INGLÉS (UEB), así
  // que cualquier texto copiado de un traductor en inglés —los más abundantes en la red— la
  // trae delante de cada mayúscula. El resultado sale con celdas braille mezcladas en el
  // texto y con el aspecto de una conversión que ha ido bien.
  test('3279 — una ⠠ suelta avisa como cualquier otra celda desconocida', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // Control: la celda de 8 puntos ⡀ (U+2840) no tiene equivalente y la app lo dice.
    await convertirHidratado(page, '⠓⠕⠇⠁⡀', 'braille');
    await expect(cajaResultado(page)).toHaveText('hola⡀');
    await expect(avisoSinTraducir(page)).toContainText('⡀');

    // «Hola» tal como lo escribe un traductor de braille inglés: ⠠ (punto 6) + h o l a.
    await page.goto(RUTA);
    await convertirHidratado(page, '⠠⠓⠕⠇⠁', 'braille');
    await expect(cajaResultado(page)).toContainText('hola'); // precondición: hubo conversión
    // El mismo aviso que con ⡀, nombrando la ⠠ (antes salía «⠠hola» y ningún aviso).
    await expect(avisoSinTraducir(page)).toContainText('⠠');

    // Control: formando la barra ⠠⠂ (§ 6.2) la ⠠ no se avisa.
    await page.goto(RUTA);
    await convertirHidratado(page, '⠼⠁⠃⠠⠂⠼⠚⠑', 'braille');
    await expect(cajaResultado(page)).toHaveText('12/05');
    await expect(avisoSinTraducir(page)).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ HALLAZGO 3277 REPARADO (19/10/2026) — comillas simples escritas como punto 3
  // ─────────────────────────────────────────────────────────────────────────
  //
  // REPARADO: ’ y ' son apóstrofo (punto 3) solo entre dos letras; ‘ nunca. Fuera de ese sitio
  // se omiten con un aviso propio. Lo que había:
  // La tabla mandaba ‘ (U+2018) y ’ (U+2019) —y el ' recto— SIEMPRE al punto 3. El B 2 § 6.2
  // define el punto 3 como apóstrofo solo «precedido y seguido de una letra»; en cualquier
  // otro sitio el punto 3 es el punto ortográfico (§ 6.1). Unas comillas simples, que es como
  // la RAE marca los significados (‘encima’), quedan así al principio y al final de la palabra
  // y se leen como PUNTOS. La propia app lo confirma: su vuelta lee ⠄⠑⠝⠉⠊⠍⠁⠄ como «.encima.».
  // Y no avisa de nada, como sí hace con los puntos suspensivos «…».
  //
  // La celda correcta de las comillas simples no está citada en el repositorio, así que el
  // test no la fija: exige solo lo que sí está anclado, que no haya un punto 3 en un sitio
  // donde el B 2 no lo lee como apóstrofo. Valdría también no escribirlas y avisar.
  test('3277 — ‘encima’ no sale con el punto 3 en los bordes de la palabra, que el B 2 lee como punto final', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // Control: entre dos letras, ’ es el apóstrofo y el punto 3 es correcto (§ 6.2).
    //   d ⠙ (1-4-5) · ’ ⠄ (3) · A ⠨⠁ · l ⠇ · a ⠁ · c ⠉ · a ⠁ · n ⠝ · t ⠞
    await convertirHidratado(page, 'd’Alacant');
    await expect(cajaResultado(page)).toHaveText('⠙⠄⠨⠁⠇⠁⠉⠁⠝⠞');

    // Cómo lee la propia app un punto 3 en los bordes de una palabra: como punto (§ 6.1).
    await page.goto(RUTA);
    await convertirHidratado(page, '⠄⠑⠝⠉⠊⠍⠁⠄', 'braille');
    await expect(cajaResultado(page)).toHaveText('.encima.');

    await page.goto(RUTA);
    await convertirHidratado(page, '‘encima’');
    //   e ⠑ (1-5) · n ⠝ (1-3-4-5) · c ⠉ (1-4) · i ⠊ (2-4) · m ⠍ (1-3-4) · a ⠁ (1)
    await expect(cajaResultado(page)).toContainText('⠑⠝⠉⠊⠍⠁'); // precondición
    // Ningún punto 3 al principio ni al final de la palabra (antes salía ⠄⠑⠝⠉⠊⠍⠁⠄,
    // «.encima.», sin aviso), y el aviso de que las comillas no se han escrito.
    expect(await cajaResultado(page).innerText()).not.toMatch(/^⠄|⠄$/);
    await expect(page.getByText('no se han escrito')).toBeVisible();

    // Igual con las rectas del teclado: 'hola' → h ⠓ · o ⠕ · l ⠇ · a ⠁
    await page.goto(RUTA);
    await convertirHidratado(page, "'hola'");
    await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁');
    await expect(page.getByText('no se han escrito')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ HALLAZGO 3278 REPARADO (19/10/2026) — el resultado no se invalidaba al cambiar la entrada
  // ─────────────────────────────────────────────────────────────────────────
  //
  // La conversión solo corre al pulsar «Convertir», pero el aviso de caracteres omitidos se
  // recalcula con el texto ACTUAL de la caja (`sinCelda` depende de `input`). Si se corregía el
  // texto después de convertir y no se volvía a pulsar, el resultado —y la hoja imprimible,
  // que se dibuja con él— seguían siendo los del texto anterior, mientras el aviso hablaba del
  // nuevo y aseguraba que «el resto del texto sí está completo». Ahora cambiar la entrada o el
  // sentido retira el resultado, y el FAQPage ya no promete una conversión «en tiempo real».
  test('3278 — tras corregir el texto sin pulsar Convertir, no queda el resultado del texto anterior', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Hola');
    //   H ⠨⠓ (4-6 | 1-2-5) · o ⠕ (1-3-5) · l ⠇ (1-2-3) · a ⠁ (1)
    await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Adiós 🙂');
    await esperarValorEnReact(page, textarea, 'Adiós 🙂'); // precondición: React tiene el texto nuevo

    // Lo que DEBERÍA pasar: o el resultado es el del texto que hay en la caja
    //   A ⠨⠁ · d ⠙ (1-4-5) · i ⠊ (2-4) · ó ⠬ (3-4-6) · s ⠎ (2-3-4) · ' ' ⠀ · 🙂 se omite
    // o ya no hay un resultado que pueda tomarse por él. Antes de la reparación seguía ⠨⠓⠕⠇⠁
    // («Hola»), la hoja dibujaba «Hola» y el aviso nombraba el 🙂 de «Adiós 🙂».
    await expect
      .poll(async () =>
        (await cajaResultado(page).count()) === 0
          ? '(sin resultado)'
          : await cajaResultado(page).innerText(),
      )
      .toMatch(/^(\(sin resultado\)|⠨⠁⠙⠊⠬⠎⠀)$/);

    // Segunda forma, misma raíz: convertir «Hola» y cambiar el sentido a «Braille → Texto»
    // dejaba el braille de «Hola» como Resultado, con el aviso falso de que lo pegado no
    // contiene ninguna celda braille.
    await page.goto(RUTA);
    await convertirHidratado(page, 'Hola');
    await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁');
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await expect(cajaResultado(page)).toHaveCount(0);
    await expect(page.getByText('no contiene ninguna celda braille')).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ HALLAZGO 3280 REPARADO (19/10/2026) — emojis decorativos de la guía (cabo C0088)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Con la guía desplegada, el árbol accesible exponía 22 emojis decorativos: 5 dentro del
  // nombre de los <h3> (📊 🎯 ❓ 📚 ✅: la lista de encabezados del lector los lee delante
  // de cada título), 6 dentro del <strong> de cada punto de «Limitaciones» (❌) y 11 en nodo
  // propio justo antes de su encabezado (eduEscenarioIcon 🎓 🏙️ 💻 📚, eduTipIcon 🔢 📐 💡
  // 🏛️ 📱 🌍, warningIcon ⚠️). Ahora todos llevan aria-hidden. Plegada no se expone
  // (display: none): esto es lo que oye quien la abre.
  test('3280 — los emojis decorativos de la guía educativa no llegan al lector de pantalla', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = page.locator('[data-guia-educativa]');
    // Precondición: la guía está desplegada y su contenido es visible.
    await expect(guia.getByText('Limitaciones y Errores Comunes al Usar Braille Digital')).toBeVisible();

    // Lo que DEBERÍA pasar: ningún emoji en el árbol accesible de la guía (todos son
    // decorativos: el texto de al lado ya dice lo mismo). Antes de la reparación salían 22.
    const arbol = await guia.ariaSnapshot();
    const emojis = [...arbol.matchAll(/\p{Extended_Pictographic}/gu)].map((m) => m[0]);
    expect(emojis).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// S0219 (21/10/2026) — teclado de seis puntos para el sentido Braille → Texto
// ═════════════════════════════════════════════════════════════════════════════
//
// Ese sentido solo admitía PEGAR celdas Unicode. Ahora se escriben como en una máquina Perkins
// (F D S = puntos 1 2 3, J K L = puntos 4 5 6, a la vez, y la celda sale al soltar) o marcando
// los puntos en pantalla. Celdas esperadas, del B 2 y con la regla de la cabecera (U+2800 + bits):
//   h = 1-2-5 → ⠓ · o = 1-3-5 → ⠕ · l = 1-2-3 → ⠇ · a = 1 → ⠁ · ñ = 1-2-4-5-6 → ⠻
test.describe('S0219 — teclado braille de seis puntos', () => {
  const TECLA: Record<number, string> = { 1: 'KeyF', 2: 'KeyD', 3: 'KeyS', 4: 'KeyJ', 5: 'KeyK', 6: 'KeyL' };

  /** Pulsa a la vez las teclas de esos puntos y las suelta en el mismo orden. */
  async function acorde(page: Page, puntos: number[]) {
    for (const p of puntos) await page.keyboard.down(TECLA[p]);
    for (const p of puntos) await page.keyboard.up(TECLA[p]);
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
  });

  test('solo aparece en el sentido Braille → Texto', async ({ page }) => {
    await expect(page.getByTestId('zona-perkins')).toHaveCount(0);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await expect(page.getByTestId('zona-perkins')).toBeVisible();
  });

  test('CASO 1 (normal) — «hola mañana» a acordes; la celda sale al soltar la ÚLTIMA tecla', async ({ page }) => {
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByTestId('zona-perkins').focus();
    const textarea = page.locator('textarea').first();

    // Acorde a medias: con F y D pulsadas y K sin soltar, todavía no se ha escrito nada
    await page.keyboard.down('KeyF');
    await page.keyboard.down('KeyD');
    await page.keyboard.down('KeyK');
    await page.keyboard.up('KeyF');
    await page.keyboard.up('KeyD');
    await expect(textarea).toHaveValue('');
    await page.keyboard.up('KeyK');
    await expect(textarea).toHaveValue('⠓');

    await acorde(page, [1, 3, 5]);
    await acorde(page, [1, 2, 3]);
    await acorde(page, [1]);
    await page.keyboard.press('Space');
    // m = 1-3-4 → ⠍ · a · ñ · a · n = 1-3-4-5 → ⠝ · a
    for (const c of [[1, 3, 4], [1], [1, 2, 4, 5, 6], [1], [1, 3, 4, 5], [1]]) await acorde(page, c);

    await expect(textarea).toHaveValue('⠓⠕⠇⠁⠀⠍⠁⠻⠁⠝⠁');
    // El resultado se recalcula solo, sin pulsar Convertir
    await expect(cajaResultado(page)).toHaveText('hola mañana');

    // Retroceso borra la última celda y el resultado la sigue
    await page.keyboard.press('Backspace');
    await expect(textarea).toHaveValue('⠓⠕⠇⠁⠀⠍⠁⠻⠁⠝');
    await expect(cajaResultado(page)).toHaveText('hola mañan');
  });

  test('CASO 2 (táctil) — marcar los puntos de la ñ y escribir la celda', async ({ page }) => {
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    const escribir = page.getByRole('button', { name: /^Escribir celda/ });
    await expect(escribir).toBeDisabled();
    for (const p of [1, 2, 4, 5, 6]) {
      await page.getByRole('button', { name: `Punto ${p}`, exact: true }).click();
    }
    await expect(page.getByRole('button', { name: 'Punto 3', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: 'Punto 6', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(escribir).toHaveText('Escribir celda ⠻');
    await escribir.click();

    await expect(page.locator('textarea').first()).toHaveValue('⠻');
    await expect(cajaResultado(page)).toHaveText('ñ');
    // Los puntos se apagan para la celda siguiente
    await expect(page.getByRole('button', { name: 'Punto 1', exact: true })).toHaveAttribute('aria-pressed', 'false');

    await page.getByRole('button', { name: 'Borrar última' }).click();
    await expect(page.locator('textarea').first()).toHaveValue('');
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 22/10/2026 — teclado de seis puntos (e122b8ed), 3277-3280 y cabo C0238
// ═════════════════════════════════════════════════════════════════════════════
//
// Los bloques de arriba siguen en verde con el código de hoy: las reparaciones de 3277 (comillas
// simples), 3278 (resultado retirado al cambiar la entrada), 3279 (⠠ suelta) y 3280 (emojis de la
// guía) se sostienen. Este bloque mira lo que aquéllos no miraban: el teclado de seis puntos a
// fondo —cada punto, acordes, foco, región viva, móvil— y las sospechas del cabo C0238 que se
// pueden juzgar SIN el B 2, por coherencia interna de la app.
//
// FUENTE de los valores esperados: la de la cabecera, y SOLO por los apartados que el repositorio
// ya cita literalmente (§ 6.1, § 6.2, § 7, § 7.1, § 8.1, § 8.2). La web de la ONCE sigue fuera de
// los dominios permitidos. Las celdas Unicode salen de la aritmética del bloque: U+2800 + bits
// (punto 1 = 0x01, 2 = 0x02, 3 = 0x04, 4 = 0x08, 5 = 0x10, 6 = 0x20). Donde la celda correcta NO
// está anclada, el test exige solo lo que la propia app dice o hace en otro sitio.
test.describe('re-inspección 22/10/2026', () => {
  const TECLA: Record<number, string> = { 1: 'KeyF', 2: 'KeyD', 3: 'KeyS', 4: 'KeyJ', 5: 'KeyK', 6: 'KeyL' };

  async function convertirHidratado(
    page: Page,
    texto: string,
    modo: 'texto' | 'braille' = 'texto',
  ) {
    await esperarHidratacion(page, ['textarea']);
    if (modo === 'braille') {
      await page.getByRole('button', { name: 'Braille → Texto' }).click();
    }
    const textarea = page.locator('textarea').first();
    await textarea.fill(texto);
    await esperarValorEnReact(page, textarea, texto);
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
  }

  /** Pulsa a la vez las teclas de esos puntos y las suelta en el mismo orden. */
  async function acorde(page: Page, puntos: number[]) {
    for (const p of puntos) await page.keyboard.down(TECLA[p]);
    for (const p of puntos) await page.keyboard.up(TECLA[p]);
  }

  /** El aviso de «Texto → Braille» para los caracteres que no se escriben. */
  const avisoSinCelda = (page: Page) =>
    page.locator('[class*="avisoConversion"]').filter({ hasText: 'Esta herramienta no escribe en braille' });

  /** Texto plano de la guía educativa (está en el DOM aunque nazca plegada). */
  const textoGuia = async (page: Page) =>
    ((await page.locator('[data-guia-educativa]').textContent()) ?? '').replace(/\s+/g, ' ');

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — mayúscula con tilde, decimal y ñ, ida y vuelta
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 1 (normal) — «Él tiene 12,5 años.» y su vuelta', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Él tiene 12,5 años.');
    // Derivación a mano:
    //   'É' → ⠨ (4-6, § 7) + é ⠮ (2-3-4-6 = 0x02+0x04+0x08+0x20 = U+282E)
    //   'l' → ⠇ (1-2-3) · ' ' → ⠀
    //   'tiene' → ⠞ (2-3-4-5) ⠊ (2-4) ⠑ (1-5) ⠝ (1-3-4-5) ⠑ · ' ' → ⠀
    //   '12,5' → ⠼ (3-4-5-6, § 8.1, uno solo) ⠁ (1) ⠃ (1-2) ⠂ (2: coma decimal) ⠑ (1-5)
    //   ' ' → ⠀ · 'años' → ⠁ ⠻ (1-2-4-5-6) ⠕ (1-3-5) ⠎ (2-3-4) · '.' → ⠄ (3, § 6.1)
    await expect(cajaResultado(page)).toHaveText('⠨⠮⠇⠀⠞⠊⠑⠝⠑⠀⠼⠁⠃⠂⠑⠀⠁⠻⠕⠎⠄');
    await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);

    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('Él tiene 12,5 años.');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — toda la puntuación del § 6.1, millar + decimal, palabra en mayúsculas
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 2 (límite) — toda la puntuación del § 6.1, «1.234,56» y «HOLA», con su vuelta', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // ¿ ? → ⠢ (2-6) · ¡ ! → ⠖ (2-3-5) · ; → ⠆ (2-3) · : → ⠒ (2-5) · , → ⠂ (2) · . → ⠄ (3)
    // - → ⠤ (3-6) · ( → ⠣ (1-2-6) · ) → ⠜ (3-4-5) · « » " → ⠦ (2-3-6)
    await convertirHidratado(page, '¿?¡!;:,.-()«»"');
    await expect(cajaResultado(page)).toHaveText('⠢⠢⠖⠖⠆⠒⠂⠄⠤⠣⠜⠦⠦⠦');
    await expect(avisoSinCelda(page)).toHaveCount(0);
    await expect(page.getByText(/se abren y se cierran con el/)).toBeVisible();

    // § 8.1: un solo ⠼; punto 3 de millar y punto 2 decimal dentro del número.
    //   ⠼ · 1 ⠁ · ⠄ · 2 ⠃ · 3 ⠉ · 4 ⠙ · ⠂ · 5 ⠑ · 6 ⠋
    await page.goto(RUTA);
    await convertirHidratado(page, '1.234,56');
    await expect(cajaResultado(page)).toHaveText('⠼⠁⠄⠃⠉⠙⠂⠑⠋');
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('1.234,56');

    // Una palabra entera en mayúsculas sale letra a letra (⠨ delante de cada una). Es el
    // «recurso 1» del § 7.1 para SIGLAS; para una palabra en mayúsculas no está anclado (cabo
    // C0238 d, sigue sin el B 2), así que aquí solo se fija que la ida y la vuelta cuadran.
    await page.goto(RUTA);
    await convertirHidratado(page, 'HOLA');
    await expect(cajaResultado(page)).toHaveText('⠨⠓⠨⠕⠨⠇⠨⠁');
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('HOLA');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (rechazo) — la celda de los seis puntos no tiene equivalente en la tabla
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 3 (rechazo) — «⠓⠕⠇⠁⠿» pasa la ⠿ sin traducir y lo avisa', async ({ page }) => {
    await page.goto(RUTA);
    // ⠿ = puntos 1-2-3-4-5-6 = U+2800 + 0x3F = U+283F: no está en la tabla de la app.
    await convertirHidratado(page, '⠓⠕⠇⠁⠿', 'braille');
    await expect(cajaResultado(page)).toHaveText('hola⠿');
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'sin traducir' }),
    ).toContainText('⠿');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Teclado de seis puntos (S0219, e122b8ed) — lo que funciona
  // ─────────────────────────────────────────────────────────────────────────
  test('teclado — cada tecla escribe su punto (F ⠁ … L ⠠) y las seis juntas ⠿, que se avisa', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByTestId('zona-perkins').focus();
    const textarea = page.locator('textarea').first();

    // U+2800 + bit del punto: F=1 → 0x01, D=2 → 0x02, S=3 → 0x04, J=4 → 0x08, K=5 → 0x10, L=6 → 0x20
    const esperadas: Record<number, string> = { 1: '⠁', 2: '⠂', 3: '⠄', 4: '⠈', 5: '⠐', 6: '⠠' };
    for (const p of [1, 2, 3, 4, 5, 6]) {
      await acorde(page, [p]);
      await expect(textarea).toHaveValue(esperadas[p]);
      await page.keyboard.press('Backspace');
      await expect(textarea).toHaveValue('');
    }

    // Las seis a la vez: 0x3F → U+283F ⠿, sin equivalente: pasa al resultado y se avisa.
    await acorde(page, [1, 2, 3, 4, 5, 6]);
    await expect(textarea).toHaveValue('⠿');
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'sin traducir' }),
    ).toContainText('⠿');
  });

  test('teclado — «Hola 2026» a acordes, con signo de mayúscula y de número, sin pulsar Convertir', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByTestId('zona-perkins').focus();

    // ⠨ = 4-6 (J+L) · h ⠓ = 1-2-5 · o ⠕ = 1-3-5 · l ⠇ = 1-2-3 · a ⠁ = 1 · Espacio ⠀
    // ⠼ = 3-4-5-6 (S+J+K+L) · 2 = b ⠃ = 1-2 · 0 = j ⠚ = 2-4-5 · 2 = ⠃ · 6 = f ⠋ = 1-2-4
    for (const c of [[4, 6], [1, 2, 5], [1, 3, 5], [1, 2, 3], [1]]) await acorde(page, c);
    await page.keyboard.press('Space');
    for (const c of [[3, 4, 5, 6], [1, 2], [2, 4, 5], [1, 2], [1, 2, 4]]) await acorde(page, c);

    await expect(page.locator('textarea').first()).toHaveValue('⠨⠓⠕⠇⠁⠀⠼⠃⠚⠃⠋');
    await expect(cajaResultado(page)).toHaveText('Hola 2026');
    await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);

    // Corregir la caja a mano retira el resultado (la regla del 3278 vale también aquí).
    const textarea = page.locator('textarea').first();
    await textarea.fill('⠨⠓⠕⠇⠁⠀⠼⠃⠚⠃⠋⠁');
    await esperarValorEnReact(page, textarea, '⠨⠓⠕⠇⠁⠀⠼⠃⠚⠃⠋⠁');
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
  });

  test('teclado — perder el foco a mitad de acorde o pulsar Ctrl+F no escribe nada; volver a Texto → Braille lo retira', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    const zona = page.getByTestId('zona-perkins');
    const textarea = page.locator('textarea').first();

    await zona.focus();
    await page.keyboard.down('KeyF');
    await textarea.focus(); // el acorde se descarta al perder el foco
    await page.keyboard.up('KeyF');
    await expect(textarea).toHaveValue('');

    await zona.focus();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyF');
    await page.keyboard.up('Control');
    await expect(textarea).toHaveValue('');

    await acorde(page, [1]);
    await expect(textarea).toHaveValue('⠁');
    await page.getByRole('button', { name: 'Texto → Braille' }).click();
    await expect(zona).toHaveCount(0);
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3417) — texto en tinta + teclado
  // ─────────────────────────────────────────────────────────────────────────
  //
  // La reparación avisa de los caracteres en tinta que hay en la caja de «Braille → Texto»: han
  // pasado tal cual y no salen en la hoja.
  //
  // Era:
  // Al cambiar de sentido, la caja conserva lo que había. Si era TINTA (el «Hola» que se acaba de
  // pasar a braille) y se escribe con el teclado, la celda se añade detrás y la vuelta copia la
  // tinta tal cual: «Hola⠁» → «Holaa», sin ningún aviso. Es la forma del hallazgo 1187 (lo que no
  // es braille sale con aspecto de traducción), que la reparación de entonces cubrió solo cuando la
  // entrada no traía NI UNA celda. Y la hoja imprimible, que en este sentido se dibuja con la
  // entrada filtrada, punza solo «⠁»: resultado y hoja dicen cosas distintas.
  test('teclado — tras pasar «Hola» a braille y cambiar de sentido, la F no da «Holaa» sin aviso', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Hola');
    await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁'); // precondición
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByTestId('zona-perkins').focus();
    await acorde(page, [1]);
    await expect(page.locator('textarea').first()).toHaveValue(/⠁$/); // precondición: el teclado escribió

    // Sin esperas implícitas: si una reparación retira el resultado, la caja no existe y eso vale.
    const caja = page.locator('[class*="resultBox"]');
    const estado = {
      resultado: (await caja.count()) > 0 ? await caja.textContent() : null,
      avisos: await page.locator('[class*="avisoConversion"]').count(),
    };
    // Lo que DEBERÍA pasar: o la tinta se avisa, o el teclado no la mezcla con sus celdas.
    expect(estado).not.toEqual({ resultado: 'Holaa', avisos: 0 });
    // Y el aviso nombra la tinta que ha pasado sin traducir
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'mezcla celdas braille con texto en tinta' }),
    ).toContainText('H · o · l · a');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3420) — región viva del teclado
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Cada anuncio lleva su número y su paridad añade o quita un espacio duro al final, así que el
  // contenido cambia siempre; el retroceso dice qué celda borró y si la caja queda vacía, y con la
  // caja ya vacía, que no hay nada que borrar.
  //
  // Era:
  // El teclado confirma cada pulsación en un <p aria-live="polite">. Con el mismo texto dos veces
  // seguidas React no toca el DOM, y una región viva solo habla cuando su contenido CAMBIA: la
  // segunda «l» de «llave» y el segundo retroceso no se anuncian. El caso peor es el retroceso que
  // VACÍA la caja: la caja de resultado desaparece (eso no se anuncia) y el anuncio repite
  // «Última celda borrada», así que quien escribe sin ver no oye nada.
  test('teclado — la segunda celda igual y el retroceso que vacía la caja se anuncian', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.evaluate(() => {
      const anuncio = document.querySelector('[class*="tecladoAnuncio"]');
      if (!anuncio) throw new Error('El teclado no tiene región de anuncio');
      const w = window as unknown as { __cambiosAnuncio: number };
      w.__cambiosAnuncio = 0;
      new MutationObserver((m) => {
        w.__cambiosAnuncio += m.length;
      }).observe(anuncio, { childList: true, subtree: true, characterData: true });
    });
    const cambios = () => page.evaluate(() => (window as unknown as { __cambiosAnuncio: number }).__cambiosAnuncio);
    const textarea = page.locator('textarea').first();
    await page.getByTestId('zona-perkins').focus();

    // «ab»: a ⠁ (1), b ⠃ (1-2). Dos retrocesos: el segundo deja la caja vacía.
    await acorde(page, [1]);
    await acorde(page, [1, 2]);
    await page.keyboard.press('Backspace');
    await expect(textarea).toHaveValue('⠁');
    const antes = await cambios();
    await page.keyboard.press('Backspace');
    await expect(textarea).toHaveValue(''); // precondición
    expect.soft(await cambios(), 'el retroceso que vacía la caja no se anuncia').toBeGreaterThan(antes);
    const anuncio = page.locator('[class*="tecladoAnuncio"]');
    await expect(anuncio).toContainText('Celda ⠁, punto 1, borrada. La caja está vacía');

    // Con la caja ya vacía, el retroceso no dice que ha borrado nada
    await page.keyboard.press('Backspace');
    await expect(anuncio).toContainText('No hay ninguna celda que borrar');
    await expect(anuncio).not.toContainText('borrada');

    // «ll»: l ⠇ (1-2-3) dos veces.
    await acorde(page, [1, 2, 3]);
    await expect(textarea).toHaveValue('⠇');
    const antesL = await cambios();
    await acorde(page, [1, 2, 3]);
    await expect(textarea).toHaveValue('⠇⠇'); // precondición
    expect.soft(await cambios(), 'la segunda ⠇ seguida no se anuncia').toBeGreaterThan(antesL);
    await expect(anuncio).toContainText('Celda ⠇, puntos 1-2-3, añadida');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3421) — foco tras «Escribir celda»: vuelve al punto 1
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era:
  // «Escribir celda» se deshabilita en cuanto escribe (los puntos se apagan), y un botón con el
  // foco que pasa a `disabled` lo suelta al <body>: con teclado o lector de pantalla se pierde el
  // sitio en cada celda que se escribe por este camino.
  test('teclado — tras «Escribir celda» con Intro el foco no cae al <body>', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    const puntoUno = page.getByRole('button', { name: 'Punto 1', exact: true });
    await puntoUno.focus();
    await page.keyboard.press('Space');
    const escribir = page.getByRole('button', { name: /^Escribir celda/ });
    await expect(escribir).toHaveText('Escribir celda ⠁');
    await escribir.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('textarea').first()).toHaveValue('⠁'); // precondición
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    // Vuelve al punto 1, donde empieza la celda siguiente: «b» (1-2) sin salir del teclado
    await expect(puntoUno).toBeFocused();
    await page.keyboard.press('Space');
    // El orden de tabulación es el visual (1 4 2 5 3 6): el punto 2 está a dos paradas
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Punto 2', exact: true })).toBeFocused();
    await page.keyboard.press('Space');
    await escribir.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('textarea').first()).toHaveValue('⠁⠃');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3415) — C0238 (a), catalán
  // ─────────────────────────────────────────────────────────────────────────
  //
  // La reparación no inventa celdas (salen del B 2, no de memoria): à, è, ò, ï, ç y · llevan su
  // propio aviso —el B 2 recoge las lenguas cooficiales y esta app solo escribe por ahora las
  // letras del castellano— y la FAQ lo dice igual.
  //
  // Era:
  // La FAQ visible dice que la app sigue el B 2, «que cubre castellano, catalán, gallego, euskera y
  // valenciano», y el título del documento es «Signografía básica de las lenguas cooficiales». Pero
  // «València», «Plaça» y «col·legi» pierden è, ç y ·, y el aviso lo justifica con que «puede que el
  // Código Braille Español sí les asigne celda fuera de la signografía básica que cubre esta app»:
  // la letra de una lengua cooficial está, por definición, en la signografía básica de las lenguas
  // cooficiales. No hace falta el B 2 para ver que las dos frases no pueden ser ciertas a la vez.
  test('C0238 (a) — la FAQ promete catalán y valenciano y el aviso de «València» lo contradice', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const guia = await textoGuia(page);
    const prometeCatalan = /Esta app sigue[^.]*catalán[^.]*valenciano/.test(guia);
    // La FAQ dice también lo que aún no escribe
    expect(guia).toContain('las propias del catalán y el valenciano (à, è, ò, ï, ç y el punto volado de «l·l») todavía no');
    // V ⠨⠧ (4-6 | 1-2-3-6) · a ⠁ · l ⠇ · (è) · n ⠝ · c ⠉ · i ⠊ · a ⠁
    await convertirHidratado(page, 'València');
    await expect(cajaResultado(page)).toContainText('⠨⠧⠁⠇'); // precondición: hubo conversión
    const aviso = avisoSinCelda(page);
    const avisoDiceFuera =
      (await aviso.count()) > 0 && ((await aviso.textContent()) ?? '').includes('fuera de la signografía básica');
    expect({ prometeCatalan, avisoDiceFuera }).not.toEqual({ prometeCatalan: true, avisoDiceFuera: true });
    // Su aviso propio nombra la letra y no la da por «fuera de la signografía básica»
    const avisoCooficial = page.locator('[class*="avisoConversion"]').filter({ hasText: 'del catalán y el valenciano' });
    await expect(avisoCooficial).toContainText('è');
    await expect(avisoCooficial).not.toContainText('fuera de la signografía');

    // «Plaça» y «col·legi» igual; y si se mezcla con un emoji, cada uno a su aviso
    await page.goto(RUTA);
    await convertirHidratado(page, 'Plaça col·legi 🙂');
    await expect(avisoCooficial).toContainText('ç · ·');
    await expect(avisoSinCelda(page)).toContainText('🙂');
    await expect(avisoSinCelda(page)).not.toContainText('ç');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3416) — espacio duro, fino y tabulador
  // ─────────────────────────────────────────────────────────────────────────
  //
  // La reparación escribe cualquier blanco que no sea salto de línea como el espacio normal:
  // separación de palabra ⠀. «10 000» queda como con el espacio normal (⠼⠁⠚⠀⠼⠚⠚⠚).
  //
  // Era:
  // Un espacio duro (U+00A0: el que trae casi cualquier texto copiado de una web, Opción+Espacio en
  // Mac, o el «15 %» del propio formato de meskeIA), un espacio fino (U+202F) o un tabulador se
  // DESCARTAN, y con ellos la separación de palabra: «hola mundo» sale ⠓⠕⠇⠁⠍⠥⠝⠙⠕, una sola palabra
  // de nueve celdas, y la hoja la punza así. Es el defecto del salto de línea («salpimienta»),
  // reparado el 21/08/2026, con otro carácter; y el aviso dice que «el resto del texto sí está
  // completo» y que puede que el Código asigne celda al espacio fuera de la signografía básica,
  // cuando la celda del espacio, ⠀, está en la tabla de la propia app.
  // En un número es peor: «10 000» con espacio duro sale ⠼⠁⠚⠼⠚⠚⠚, el ⠼ de más delante del grupo
  // que la reparación de los hallazgos 57-58 quitó. Valen las dos lecturas que la app sabe
  // escribir: separador de millar (⠄, § 8.1 citado) o separación de palabra (⠀, como el espacio
  // normal); la pegada no es ninguna de las dos.
  test('espacio duro — tabulador y espacio fino tampoco pierden la separación', async ({ page }) => {
    // h ⠓ (1-2-5) · o ⠕ · l ⠇ · a ⠁ · separación ⠀ · m ⠍ (1-3-4) · u ⠥ (1-3-6) · n ⠝ · d ⠙ (1-4-5) · o ⠕
    for (const blanco of [' ', ' ', '\t']) {
      await page.goto(RUTA);
      await convertirHidratado(page, `hola${blanco}mundo`);
      await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁⠀⠍⠥⠝⠙⠕');
      // Y sin el aviso de carácter sin celda, que decía «el resto del texto sí está completo»
      await expect(avisoSinCelda(page)).toHaveCount(0);
    }
    // ⠼ · 1 ⠁ · 0 ⠚ · ⠀ + ⠼ · 0 ⠚ · 0 ⠚ · 0 ⠚ — lo mismo que con el espacio normal
    for (const blanco of [' ', ' ', ' ']) {
      await page.goto(RUTA);
      await convertirHidratado(page, `10${blanco}000`);
      await expect(cajaResultado(page)).toHaveText('⠼⠁⠚⠀⠼⠚⠚⠚');
    }
  });

  test('espacio duro — «hola mundo» y «10 000» con U+00A0 no pierden la separación', async ({ page }) => {
    await page.goto(RUTA);
    // h ⠓ (1-2-5) · o ⠕ · l ⠇ · a ⠁ · separación ⠀ · m ⠍ (1-3-4) · u ⠥ (1-3-6) · n ⠝ · d ⠙ (1-4-5) · o ⠕
    await convertirHidratado(page, 'hola mundo');
    await expect.soft(cajaResultado(page)).toHaveText('⠓⠕⠇⠁⠀⠍⠥⠝⠙⠕');

    // ⠼ · 1 ⠁ · 0 ⠚ · (⠄ millar | ⠀ + ⠼) · 0 ⠚ · 0 ⠚ · 0 ⠚
    await page.goto(RUTA);
    await convertirHidratado(page, '10 000');
    await expect.soft(cajaResultado(page)).toHaveText(/^(⠼⠁⠚⠄⠚⠚⠚|⠼⠁⠚⠀⠼⠚⠚⠚)$/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3418) — C0238 (c), puntos suspensivos: «…» se escribe como «...»
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era:
  // «...» (tres puntos del teclado) sale ⠄⠄⠄, y «…» (U+2026, el que ponen Word, Google Docs e iOS al
  // escribir tres puntos) se descarta con el aviso de que el Código puede asignarle celda «fuera de
  // la signografía básica». Es el mismo signo en tinta. La forma es la del hallazgo 1184 (’ frente a
  // '): la tabla normaliza las comillas tipográficas y el apóstrofo tipográfico, y no los puntos
  // suspensivos. Qué celdas da el B 2 § 6.1 a los puntos suspensivos sigue sin anclar: el test no
  // fija ninguna, exige que las dos grafías den lo mismo.
  test('C0238 (c) — «Espera…» (U+2026) sale igual que «Espera...»', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Espera...');
    // E ⠨⠑ · s ⠎ · p ⠏ · e ⠑ · r ⠗ · a ⠁ · y los puntos suspensivos
    await expect(cajaResultado(page)).toContainText('⠨⠑⠎⠏⠑⠗⠁'); // precondición
    const conTresPuntos = await cajaResultado(page).innerText();
    expect(conTresPuntos.length).toBeGreaterThan('⠨⠑⠎⠏⠑⠗⠁'.length); // los puntos se escriben

    await page.goto(RUTA);
    await convertirHidratado(page, 'Espera…');
    await expect(cajaResultado(page)).toHaveText(conTresPuntos);
    await expect(avisoSinCelda(page)).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ABIERTO: hallazgo del Inspector del 22/10/2026 (n.º al registrar) — C0238 (e), «ONCE, 2009»
  // ─────────────────────────────────────────────────────────────────────────
  //
  // La reparación del 1185 retiró de la FAQ el «aprobado por la ONCE en 2009» por no poder
  // anclarlo y porque convivía sin explicación con el documento que la app sigue. La FAQ cita hoy
  // el B 2 (V4, 22/01/2026), pero la caja de Limitaciones conserva «El Código Braille Español
  // (ONCE, 2009)»: la misma página da dos referencias distintas, una de ellas ya retirada.
  test('C0238 (e) — la caja de Limitaciones no conserva la fecha de 2009 que la FAQ retiró', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    const guia = await textoGuia(page);
    expect(guia).toContain('V4, 22/01/2026'); // precondición: la FAQ cita la fuente de hoy
    expect(guia).not.toContain('(ONCE, 2009)');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ABIERTO: hallazgo del Inspector del 22/10/2026 (n.º al registrar) — FAQPage y teclado
  // ─────────────────────────────────────────────────────────────────────────
  //
  // El FAQPage responde a «¿Puedo convertir Braille a texto…?» que se pegan caracteres Unicode y que
  // «La conversión se hace al pulsar «Convertir»». Con el teclado de seis puntos la vuelta se
  // recalcula sola en cada celda (lo fija el test «Hola 2026» de este bloque), y es la forma de
  // entrar braille para quien tiene un cartel delante, que es justo quien se lo pregunta a un
  // asistente de IA.
  test('FAQPage — la respuesta sobre Braille → Texto no contradice al teclado de seis puntos', async ({
    page,
  }) => {
    test.fail();
    await page.goto(RUTA);
    const respuesta = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const datos = JSON.parse(s.textContent || '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (datos['@type'] !== 'FAQPage') continue;
        const q = datos.mainEntity?.find((e) => e.name.startsWith('¿Puedo convertir Braille'));
        if (q) return q.acceptedAnswer.text;
      }
      return null;
    });
    expect(respuesta).not.toBeNull(); // precondición
    const soloAlPulsar = (respuesta ?? '').includes('La conversión se hace al pulsar «Convertir»');
    const nombraTeclado = /teclado/i.test(respuesta ?? '');
    expect({ soloAlPulsar, nombraTeclado }).not.toEqual({ soloAlPulsar: true, nombraTeclado: false });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ABIERTO: hallazgo del Inspector del 22/10/2026 (n.º al registrar) — el % y el € pegados
  // ─────────────────────────────────────────────────────────────────────────
  //
  // CLAUDE.md §2 (decidido el 25/09/2026, se corrige app a app al pasar el Inspector): «15 %» con
  // espacio duro U+00A0, y «2 €» con espacio. La guía trae «25-40%», «10%», «25-30%» (dos veces),
  // «90%» y «44%» pegados; la nota de la hoja, «90 %» y «100 %» con espacio normal (U+0020), que
  // deja saltar el % solo de línea; y «el 2€».
  test('formato — el % y el € de la hoja y de la guía van con espacio duro', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    const texto = await page.evaluate(() =>
      ['[class*="hojaSection"]', '[data-guia-educativa]']
        .map((s) => document.querySelector(s)?.textContent ?? '')
        .join(' '),
    );
    expect(texto.length).toBeGreaterThan(1000); // precondición: se leyó la hoja y la guía
    const malos = [...texto.matchAll(/\S{0,8}\d( ?)(%|€)/g)].map((m) => m[0]);
    expect(malos).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 22/10/2026 — el teclado de seis puntos en un móvil
// ═════════════════════════════════════════════════════════════════════════════
test.describe('re-inspección 22/10/2026 — teclado en móvil', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('móvil — marcar puntos y «Escribir celda»: ⠨⠍ ⠀ ⠼⠁ se lee «M 1», sin desbordar', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).tap();
    const punto = (n: number) => page.getByRole('button', { name: `Punto ${n}`, exact: true });
    const escribir = page.getByRole('button', { name: /^Escribir celda/ });

    // ⠨ = 4-6 (0x08+0x20 = U+2828) · m ⠍ = 1-3-4 (0x01+0x04+0x08 = U+280D) · Espacio ⠀
    // ⠼ = 3-4-5-6 (U+283C) · 1 = a ⠁ = 1 (U+2801)
    for (const celda of [[4, 6], [1, 3, 4], null, [3, 4, 5, 6], [1]]) {
      if (celda === null) {
        await page.getByRole('button', { name: 'Espacio', exact: true }).tap();
        continue;
      }
      for (const p of celda) await punto(p).tap();
      await escribir.tap();
    }
    await expect(page.locator('textarea').first()).toHaveValue('⠨⠍⠀⠼⠁');
    await expect(cajaResultado(page)).toHaveText('M 1');

    // Los seis puntos son dianas de 48 px y la página no desborda en horizontal.
    const caja = await punto(1).boundingBox();
    expect(caja?.width).toBeGreaterThanOrEqual(44);
    expect(caja?.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);
  });
});

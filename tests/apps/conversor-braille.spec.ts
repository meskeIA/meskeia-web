import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, esperarValorEnReact } from './_hidratacion';

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
 * HALLAZGOS: los de las inspecciones del 20/08, del 22/09, del 13/10 y del 22/10/2026 están
 * todos REPARADOS (24-29 el 19/08, 57-62 el 21/08, 1183-1187 el 22/09, 3277-3280 el 19/10,
 * 3415-3423 el 22/10) y sus tests pasan en verde. Los de la re-inspección del 23/10/2026 (bloque
 * «re-inspección 23/10/2026», 3434-3444) se repararon el mismo 23/10 y van como tests normales con
 * «REPARADO (nº)»; la re-inspección del 24/10/2026 los vio sostenerse. Los de esa re-inspección
 * (3456-3460 y el cabo C0401) se repararon en 1965bb4c y 390a4a69 y van como tests normales con
 * «REPARADO»; la inspección del 26/10/2026 los vio sostenerse. Los de esa inspección (bloque
 * «inspector 26/10/2026», 3524-3531) se REPARARON el 27/10/2026 en e6bcbe53 y aa75156d y van como
 * tests normales con «REPARADO»; la re-inspección del 27/10/2026 (bloque del final) los vio
 * sostenerse. Los hallazgos de ESA re-inspección están ABIERTOS y van con `test.fail()`: cada uno
 * afirma lo que DEBERÍA pasar y falla a propósito; el día que se corrija la app pasará a ROJO
 * («expected to fail, but passed») y habrá que quitarle la marca, no reescribir el valor esperado.
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
  // separación de palabra ⠀. «10 000» queda como con el espacio normal (desde el hallazgo 3526,
  // 27/10/2026, ⠼⠁⠚⠄⠚⠚⠚: el punto 3 de millar del B 2 § 8.1).
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
    // ⠼ · 1 ⠁ · 0 ⠚ · ⠄ (punto 3 de millar) · 0 ⠚ · 0 ⠚ · 0 ⠚ — lo mismo que con el espacio normal.
    // 27/10/2026 (hallazgo 3526): el B 2 § 8.1 da ⠼⠁⠚⠄⠚⠚⠚ («501 439 678 → #eja.dci.fgh»); hasta
    // entonces salía ⠼⠁⠚⠀⠼⠚⠚⠚. Lo que protege este test sigue siendo que el blanco no PEGUE los grupos.
    for (const blanco of [' ', ' ', ' ']) {
      await page.goto(RUTA);
      await convertirHidratado(page, `10${blanco}000`);
      await expect(cajaResultado(page)).toHaveText('⠼⠁⠚⠄⠚⠚⠚');
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
  // REPARADO (22/10/2026, hallazgo 3419) — C0238 (e), «ONCE, 2009»: la caja cita el B 2 de la FAQ
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era:
  // La reparación del 1185 retiró de la FAQ el «aprobado por la ONCE en 2009» por no poder
  // anclarlo y porque convivía sin explicación con el documento que la app sigue. La FAQ cita hoy
  // el B 2 (V4, 22/01/2026), pero la caja de Limitaciones conserva «El Código Braille Español
  // (ONCE, 2009)»: la misma página da dos referencias distintas, una de ellas ya retirada.
  test('C0238 (e) — la caja de Limitaciones no conserva la fecha de 2009 que la FAQ retiró', async ({ page }) => {
    await page.goto(RUTA);
    const guia = await textoGuia(page);
    expect(guia).toContain('V4, 22/01/2026'); // precondición: la FAQ cita la fuente de hoy
    expect(guia).not.toContain('(ONCE, 2009)');
    // Ningún 2009 atribuido a la ONCE. El de la FAQ de lectores en EE. UU. es otra fuente (informe
    // de la Federación Nacional de Ciegos, 2009; hallazgo 3441) y no cuenta.
    expect(guia).not.toMatch(/ONCE[^.]{0,60}2009/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3422) — FAQPage y teclado: la respuesta nombra el teclado
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era:
  // El FAQPage responde a «¿Puedo convertir Braille a texto…?» que se pegan caracteres Unicode y que
  // «La conversión se hace al pulsar «Convertir»». Con el teclado de seis puntos la vuelta se
  // recalcula sola en cada celda (lo fija el test «Hola 2026» de este bloque), y es la forma de
  // entrar braille para quien tiene un cartel delante, que es justo quien se lo pregunta a un
  // asistente de IA.
  test('FAQPage — la respuesta sobre Braille → Texto no contradice al teclado de seis puntos', async ({
    page,
  }) => {
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
    // Y dice lo que hace el teclado: traducir sin pulsar «Convertir»
    expect(respuesta).toContain('teclado de seis puntos');
    expect(respuesta).toContain('traduce cada celda en cuanto la escribes');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (22/10/2026, hallazgo 3423) — el % y el € con espacio duro (también los «3.000-8.000 €»
  // de la guía, con espacio normal, que la ficha no listaba y el test sí mide)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era:
  // CLAUDE.md §2 (decidido el 25/09/2026, se corrige app a app al pasar el Inspector): «15 %» con
  // espacio duro U+00A0, y «2 €» con espacio. La guía trae «25-40%», «10%», «25-30%» (dos veces),
  // «90%» y «44%» pegados; la nota de la hoja, «90 %» y «100 %» con espacio normal (U+0020), que
  // deja saltar el % solo de línea; y «el 2€».
  test('formato — el % y el € de la hoja y de la guía van con espacio duro', async ({ page }) => {
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

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 23/10/2026 — las reparaciones del 22/10 se sostienen; lo que queda fuera de ellas
// ═════════════════════════════════════════════════════════════════════════════
//
// Los 39 tests de arriba pasaban con el código del 23/10: 3415-3423 (avisos del catalán, espacio
// duro, tinta mezclada, «…», región viva y foco del teclado, Limitaciones, FAQPage y formato) se
// sostenían. Este bloque fijó tres casos más resueltos a mano y los hallazgos que ese día quedaron
// abiertos (3434-3444), todos REPARADOS el mismo 23/10 y vistos sostenerse el 24/10/2026.
//
// FUENTE de los valores esperados: la de la cabecera y SOLO por los apartados que el repositorio
// cita literalmente (§ 6.1, § 6.2, § 7, § 7.1, § 8.1, § 8.2); la web de la ONCE sigue fuera de los
// dominios permitidos. Donde el B 2 no está citado, el ancla es la propia app y se dice así. Las
// celdas Unicode salen de la aritmética del bloque: U+2800 + bits (punto 1 = 0x01, 2 = 0x02,
// 3 = 0x04, 4 = 0x08, 5 = 0x10, 6 = 0x20).
test.describe('re-inspección 23/10/2026', () => {
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

  /** Texto plano de la guía educativa (está en el DOM aunque nazca plegada). */
  const textoGuia = async (page: Page) =>
    ((await page.locator('[data-guia-educativa]').textContent()) ?? '').replace(/\s+/g, ' ');

  /** El aviso de «Texto → Braille» para los caracteres que no se escriben. */
  const avisoSinCelda = (page: Page) =>
    page.locator('[class*="avisoConversion"]').filter({ hasText: 'Esta herramienta no escribe en braille' });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — mayúscula, tildes, ñ, millar + decimal, paréntesis y punto; y con el teclado
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 1 (normal) — «Núñez pagó 1.250,5 euros (año 2026).» ida y vuelta exactas', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Núñez pagó 1.250,5 euros (año 2026).');
    // Derivación a mano, carácter a carácter:
    //   'N' → ⠨ (4-6, § 7) + n ⠝ (1-3-4-5 = 0x1D → U+281D)
    //   'ú' → ⠾ (2-3-4-5-6 = 0x3E) · 'ñ' → ⠻ (1-2-4-5-6 = 0x3B) · 'e' → ⠑ (1-5) · 'z' → ⠵ (1-3-5-6 = 0x35)
    //   ' ' → ⠀ · 'pagó' → ⠏ (1-2-3-4) ⠁ (1) ⠛ (1-2-4-5) ⠬ (ó = 3-4-6 = 0x2C) · ' ' → ⠀
    //   '1.250,5' → ⠼ (3-4-5-6, § 8.1, UNO solo) ⠁ (1) ⠄ (punto 3: millar) ⠃ (2) ⠑ (5) ⠚ (0)
    //               ⠂ (punto 2: coma decimal) ⠑ (5)
    //   ' ' → ⠀ · 'euros' → ⠑ ⠥ (1-3-6) ⠗ (1-2-3-5) ⠕ (1-3-5) ⠎ (2-3-4) · ' ' → ⠀
    //   '(' → ⠣ (1-2-6, § 6.1) · 'año' → ⠁ ⠻ ⠕ · ' ' → ⠀
    //   '2026' → ⠼ ⠃ ⠚ ⠃ ⠋ (6 = f = 1-2-4) · ')' → ⠜ (3-4-5, § 6.1) · '.' → ⠄ (3, § 6.1)
    await expect(cajaResultado(page)).toHaveText('⠨⠝⠾⠻⠑⠵⠀⠏⠁⠛⠬⠀⠼⠁⠄⠃⠑⠚⠂⠑⠀⠑⠥⠗⠕⠎⠀⠣⠁⠻⠕⠀⠼⠃⠚⠃⠋⠜⠄');
    await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);

    // Sin signos que abran y cierren igual, la vuelta devuelve el texto EXACTO.
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('Núñez pagó 1.250,5 euros (año 2026).');
  });

  test('CASO 1 (teclado) — «Núñez» a acordes: cada celda se anuncia y la vuelta da ⠨⠝⠾⠻⠑⠵', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByTestId('zona-perkins').focus();
    const anuncio = page.locator('[class*="tecladoAnuncio"]');

    // ⠨ = 4-6 (J+L): solo, aún no hay letra, pero la pulsación se anuncia
    await acorde(page, [4, 6]);
    await expect(anuncio).toContainText('Celda ⠨, puntos 4-6, añadida');
    // n ⠝ (1-3-4-5) · ú ⠾ (2-3-4-5-6) · ñ ⠻ (1-2-4-5-6) · e ⠑ (1-5) · z ⠵ (1-3-5-6)
    for (const c of [[1, 3, 4, 5], [2, 3, 4, 5, 6], [1, 2, 4, 5, 6], [1, 5], [1, 3, 5, 6]]) await acorde(page, c);
    await expect(page.locator('textarea').first()).toHaveValue('⠨⠝⠾⠻⠑⠵');
    await expect(cajaResultado(page)).toHaveText('Núñez');
    await expect(anuncio).toContainText('Celda ⠵, puntos 1-3-5-6, añadida');

    // Intercambiar lleva «Núñez» al otro sentido, y convertirlo devuelve las mismas celdas
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await expect(page.locator('textarea').first()).toHaveValue('Núñez');
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('⠨⠝⠾⠻⠑⠵');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — sigla, decimal con cero, espacio duro entre cifras, «…», vacío, teclado
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 2 (límite) — «¡OK! Son 0,75 y 10 000…» con U+00A0 y U+2026, y la entrada vacía', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, '¡OK! Son 0,75 y 10 000…');
    //   '¡' → ⠖ (2-3-5, § 6.1) · 'OK' → ⠨⠕ ⠨⠅ (sigla letra a letra, § 7.1; k = 1-3 = U+2805)
    //   '!' → ⠖ · ' ' → ⠀ · 'Son' → ⠨⠎ ⠕ ⠝ · ' ' → ⠀
    //   '0,75' → ⠼ ⠚ (0) ⠂ (coma decimal, § 8.1) ⠛ (7 = g = 1-2-4-5) ⠑ (5)
    //   ' ' → ⠀ · 'y' → ⠽ (1-3-4-5-6 = U+283D) · ' ' → ⠀
    //   '10' → ⠼ ⠁ ⠚ · U+00A0 entre grupos de tres cifras → ⠄, el punto 3 de millar (B 2 § 8.1:
    //   «501 439 678 → #eja.dci.fgh»; hallazgo 3526, 27/10/2026, antes ⠀ y otro ⠼) · '000' → ⠚ ⠚ ⠚
    //   '…' → como «...» (ancla: la app, hallazgo 3418): ⠄ ⠄ ⠄ (punto 3, § 6.1)
    await expect(cajaResultado(page)).toHaveText('⠖⠨⠕⠨⠅⠖⠀⠨⠎⠕⠝⠀⠼⠚⠂⠛⠑⠀⠽⠀⠼⠁⠚⠄⠚⠚⠚⠄⠄⠄');
    await expect(avisoSinCelda(page)).toHaveCount(0);

    // Vuelta: ¡ → ! (§ 6.1, un solo signo), el millar vuelve como punto y «…» como «...»
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('!OK! Son 0,75 y 10.000...');

    // Entrada vacía: no hay resultado que inventar
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);
  });

  test('CASO 2 (teclado) — el botón Espacio escribe ⠀ y un punto marcado dos veces no deja celda que escribir', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    const anuncio = page.locator('[class*="tecladoAnuncio"]');

    // La celda sin puntos es el espacio (U+2800)
    await page.getByRole('button', { name: 'Espacio', exact: true }).click();
    await expect(page.locator('textarea').first()).toHaveValue('⠀');
    await expect(anuncio).toContainText('Espacio añadido');

    // Marcar y desmarcar el punto 1: aria-pressed vuelve a false y no hay celda que escribir
    const p1 = page.getByRole('button', { name: 'Punto 1', exact: true });
    await p1.click();
    await expect(p1).toHaveAttribute('aria-pressed', 'true');
    await p1.click();
    await expect(p1).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Escribir celda/ })).toBeDisabled();
    await expect(page.locator('textarea').first()).toHaveValue('⠀');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (rechazo) — tinta mezclada en Braille → Texto (control que pasa)
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 3 (rechazo) — «⠓⠕⠇⠁ mundo» en Braille → Texto: la tinta pasa tal cual y se nombra', async ({ page }) => {
    await page.goto(RUTA);
    // ⠓ h (1-2-5) · ⠕ o (1-3-5) · ⠇ l (1-2-3) · ⠁ a (1) · ' ' y «mundo» son tinta
    await convertirHidratado(page, '⠓⠕⠇⠁ mundo', 'braille');
    await expect(cajaResultado(page)).toHaveText('hola mundo');
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'mezcla celdas braille con texto en tinta' }),
    ).toContainText('m · u · n · d · o');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3434) — braille en «Texto → Braille»: Convertir no hacía nada y no avisaba
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: el simétrico del hallazgo 1187. «Texto → Braille» es el sentido POR DEFECTO, y con el
  // teclado de seis puntos hay un camino nuevo: escribir celdas, pulsar «Texto → Braille» (la caja
  // conserva las celdas) y Convertir. `convertTextToBraille` descarta cada celda porque no está en
  // la tabla de tinta, el resultado sale vacío y, como los avisos viven dentro de `{result && …}`,
  // no se ve nada: ni resultado ni aviso. Si la caja trae además tinta, el aviso dice que la app
  // «no escribe en braille» las celdas ⠓ · ⠕ · ⠇ · ⠁ y que «puede que el Código Braille Español sí
  // les asigne celda»: son celdas braille.
  //
  // REPARADO (hallazgo 3434): una celda braille pasa tal cual al resultado, no cuenta como «sin
  // celda» y un aviso informativo dice que la caja ya traía braille. Y si la conversión no da nada
  // con algo en la caja (solo emojis, por ejemplo), un aviso lo dice fuera de la caja de resultado.
  test('REPARADO (3434) — celdas braille en «Texto → Braille»: hay resultado o aviso, no silencio', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByTestId('zona-perkins').focus();
    // h ⠓ (1-2-5) · o ⠕ (1-3-5) · l ⠇ (1-2-3) · a ⠁ (1)
    for (const c of [[1, 2, 5], [1, 3, 5], [1, 2, 3], [1]]) await acorde(page, c);
    await expect(cajaResultado(page)).toHaveText('hola'); // precondición: el teclado escribió
    await page.getByRole('button', { name: 'Texto → Braille' }).click();
    await expect(page.locator('textarea').first()).toHaveValue('⠓⠕⠇⠁'); // precondición
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();

    // Lo que DEBERÍA pasar: o las celdas pasan tal cual, o un aviso dice que ya son braille.
    // Antes de la reparación no aparecía ni la caja de resultado ni ningún aviso.
    await expect(
      page.locator('[class*="resultBox"], [class*="avisoConversion"]').first(),
    ).toBeVisible({ timeout: 2000 });

    // Y con tinta detrás, el aviso no puede dar por «sin celda en braille» a una celda braille
    await page.goto(RUTA);
    await convertirHidratado(page, '⠓⠕⠇⠁ hola');
    await expect(cajaResultado(page)).toContainText('⠓⠕⠇⠁'); // precondición: «hola» sí se escribió
    // Las celdas pasan tal cual, el espacio es separación de palabra y «hola» se escribe:
    // ⠓⠕⠇⠁ · ⠀ · h ⠓ (1-2-5) o ⠕ (1-3-5) l ⠇ (1-2-3) a ⠁ (1)
    await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁⠀⠓⠕⠇⠁');
    await expect(avisoSinCelda(page)).toHaveCount(0);
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'La caja ya traía celdas braille' }),
    ).toBeVisible();

    // Solo emojis: no hay resultado, pero sí un aviso que lo dice y los nombra
    await page.goto(RUTA);
    await convertirHidratado(page, '😀😀');
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'La conversión no ha dado ningún resultado' }),
    ).toContainText('😀');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3435) — los ejemplos metían tinta en «Braille → Texto»
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: «Saludo», «Con ñ», «Con acento» y «Números» ponían «Hola», «España», «Música» y «2024» en la caja
  // en los DOS sentidos. En «Braille → Texto» eso es tinta: Convertir devuelve «Hola» con el aviso
  // «Lo que has pegado no contiene ninguna celda braille… esto no es una traducción», y si luego se
  // escribe con el teclado, la caja queda mezclada (el aviso del 3417).
  // REPARADO (hallazgo 3435): en ese sentido el ejemplo llega ya escrito en braille.
  test('REPARADO (3435) — en «Braille → Texto» el ejemplo «Saludo» pone celdas braille (o no se ofrece)', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await expect(page.getByTestId('zona-perkins')).toBeVisible(); // precondición: estamos en ese sentido
    const saludo = page.getByRole('button', { name: 'Saludo', exact: true });
    if ((await saludo.count()) > 0) {
      await saludo.click();
      // «Hola» en braille sería ⠨⠓⠕⠇⠁: solo celdas del bloque U+2800-U+28FF. Antes ponía «Hola».
      await expect(page.locator('textarea').first()).toHaveValue(/^[⠀-⣿]+$/, { timeout: 2000 });
      // H = signo de mayúscula ⠨ (4-6) + ⠓ (1-2-5) · o ⠕ (1-3-5) · l ⠇ (1-2-3) · a ⠁ (1)
      await expect(page.locator('textarea').first()).toHaveValue('⠨⠓⠕⠇⠁');
      await page.getByRole('button', { name: 'Convertir', exact: true }).click();
      await expect(cajaResultado(page)).toHaveText('Hola');
      await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);
    }
    // En «Texto → Braille» el ejemplo sigue poniendo tinta
    await page.getByRole('button', { name: 'Texto → Braille' }).click();
    await page.getByRole('button', { name: 'Números', exact: true }).click();
    await expect(page.locator('textarea').first()).toHaveValue('2024');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3436) — «Intercambiar» sin haber convertido vaciaba la caja
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: `handleSwap` ponía en la caja el RESULTADO, y desde la reparación del 3278 cualquier cambio de
  // la entrada lo retira. Así que escribir (o corregir) un texto y pulsar ⇄ sin Convertir cambia
  // de sentido y deja la caja vacía: lo escrito se pierde sin aviso ni forma de recuperarlo.
  // REPARADO (hallazgo 3436): sin resultado, ⇄ convierte en el acto lo que hay en la caja.
  test('REPARADO (3436) — ⇄ con «Hola mundo» sin convertir no deja la caja vacía', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    const textarea = page.locator('textarea').first();
    await textarea.fill('Hola mundo');
    await esperarValorEnReact(page, textarea, 'Hola mundo');
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await expect(page.getByRole('button', { name: 'Braille → Texto' })).toHaveAttribute('aria-pressed', 'true'); // precondición

    // Lo que DEBERÍA pasar: o se conserva el texto, o se convierte y se lleva su braille:
    //   H ⠨⠓ · o ⠕ · l ⠇ · a ⠁ · ⠀ · m ⠍ (1-3-4) · u ⠥ (1-3-6) · n ⠝ · d ⠙ (1-4-5) · o ⠕
    // Antes de la reparación la caja quedaba vacía.
    await expect(textarea).toHaveValue(/^(Hola mundo|⠨⠓⠕⠇⠁⠀⠍⠥⠝⠙⠕)$/, { timeout: 2000 });
    await expect(textarea).toHaveValue('⠨⠓⠕⠇⠁⠀⠍⠥⠝⠙⠕');
    // Y de vuelta, también sin convertir, recupera el texto (la mayúscula vuelve por ⠨)
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await expect(textarea).toHaveValue('Hola mundo');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3437) — el retroceso del teclado describía la tinta como una celda con puntos
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: `puntosDeCelda` restaba U+2800 a cualquier carácter y lee los bits del resultado negativo, así que
  // al borrar una letra en tinta la región viva inventa puntos: «a» → «Celda a, puntos 1-6, borrada»
  // (0x61 − 0x2800 = −10143, cuyos seis bits bajos son 100001), «l» → «puntos 3-4-6». Una celda de
  // ocho puntos (⡀) se anuncia «Espacio borrado» y un espacio normal «Celda  , punto 6». La tinta en
  // la caja la pone el propio ejemplo «Saludo» (hallazgo de arriba).
  // REPARADO (hallazgo 3437): `puntosDeCelda` solo lee celdas del bloque braille (y cuenta los
  // puntos 7 y 8), y el retroceso dice de la tinta que no es una celda.
  test('REPARADO (3437) — borrar la «a» de «Hola» con Retroceso no anuncia puntos braille', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    const textarea = page.locator('textarea').first();
    await textarea.fill('Hola');
    await esperarValorEnReact(page, textarea, 'Hola');
    await page.getByTestId('zona-perkins').focus();
    await page.keyboard.press('Backspace');
    await expect(textarea).toHaveValue('Hol'); // precondición: borró la «a»
    const anuncio = page.locator('[class*="tecladoAnuncio"]');
    await expect(anuncio).toContainText('borrad'); // precondición: el retroceso se anunció
    // Lo que DEBERÍA pasar: la «a» no es una celda y no tiene puntos. Antes: «Celda a, puntos 1-6, borrada».
    await expect(anuncio).not.toContainText('punto', { timeout: 2000 });
    await expect(anuncio).toContainText('Carácter a borrado, no es una celda braille');
    // Una celda de ocho puntos: ⡀ es U+2840, el bit 6 → punto 7 (no «Espacio»)
    await textarea.fill('⠁⡀');
    await esperarValorEnReact(page, textarea, '⠁⡀');
    await page.getByRole('button', { name: 'Borrar última' }).click();
    await expect(anuncio).toContainText('Celda ⡀, punto 7, borrada');
    // Un espacio normal en tinta: «Espacio borrado», sin puntos
    await textarea.fill('⠁ ');
    await esperarValorEnReact(page, textarea, '⠁ ');
    await page.getByRole('button', { name: 'Borrar última' }).click();
    await expect(anuncio).toContainText('Espacio borrado');
    await expect(anuncio).not.toContainText('punto');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3438) — el rótulo de la caja no era su nombre accesible
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: «Texto a convertir:» / «Braille a convertir:» (y «Resultado:») son <label> sin `htmlFor` ni
  // control dentro: el árbol accesible da a la caja el nombre de su placeholder («Escribe el texto
  // aquí...»), que desaparece al escribir. WCAG 1.3.1 y 4.1.2.
  // REPARADO (hallazgo 3438): el <label> lleva `htmlFor` y «Resultado:» es el rótulo de la región.
  test('REPARADO (3438) — la caja se llama «Texto a convertir» / «Braille a convertir»', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await expect(page.getByText('Texto a convertir:')).toBeVisible(); // precondición: el rótulo está
    await expect(page.getByRole('textbox', { name: /Texto a convertir/ })).toHaveCount(1, { timeout: 2000 });
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await expect(page.getByRole('textbox', { name: /Braille a convertir/ })).toHaveCount(1, { timeout: 2000 });
    // Y el resultado es una región con nombre, no un <label> suelto
    await page.getByRole('button', { name: 'Texto → Braille' }).click();
    const textarea = page.getByRole('textbox', { name: 'Texto a convertir:' });
    await textarea.fill('Hola');
    await esperarValorEnReact(page, textarea, 'Hola');
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Resultado:' })).toHaveText('⠨⠓⠕⠇⠁');
    expect(await page.locator('label:not([for])').count()).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3439) — la hoja con la norma ADA escribía «6.2 mm» (formato EE. UU.)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: `{norma.entreCeldas} mm` pintaba el número de JavaScript tal cual: con Marburg (6 y 10) no se nota,
  // con ADA (6,2 y 10,2) sale el punto decimal. CLAUDE.md §2. Y el nombre accesible de la hoja dice
  // «Hoja de 1 líneas» (el texto visible sí distingue «1 línea»).
  // REPARADO (hallazgo 3439): las medidas pasan por formatNumber y el nombre distingue el singular.
  test('REPARADO (3439) — con ADA la hoja dice «6,2 mm · 10,2 mm» y su nombre no dice «1 líneas»', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Hola');
    await page.getByRole('button', { name: 'ADA 703.3 (EE. UU.)' }).click();
    const aviso = page.locator('[class*="hojaAviso"]');
    // Precondición: la norma ADA está aplicada. Celdas por línea = ⌊(172 − 2,4 − 1,5) / 6,2⌋ + 1
    // = ⌊27,11⌋ + 1 = 28 (ancho útil y medidas de NORMAS en page.tsx).
    await expect(aviso).toContainText('1 línea de 28 celdas');
    await expect(aviso).toContainText('celda de 6,2 mm · 10,2 mm entre líneas', { timeout: 2000 });
    const nombre = await page.locator('svg[aria-label*="escala real"]').getAttribute('aria-label');
    expect(nombre).not.toContain('1 líneas');
    expect(nombre).toContain('Hoja de 1 línea en Braille');
    // Marburg, con medidas enteras, sigue sin decimales: ⌊(172 − 2,5 − 1,5) / 6⌋ + 1 = 29 celdas
    await page.getByRole('button', { name: 'Marburg Medium' }).click();
    await expect(aviso).toContainText('1 línea de 29 celdas · celda de 6 mm · 10 mm entre líneas');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3440) — REGRESIÓN del 22/10 (ac7344a3): U+FEFF partía las palabras
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: la reparación del 3416 escribía como espacio todo lo que casa con `\s`, y en JavaScript `\s`
  // incluye U+FEFF, el espacio de ancho cero NO SEPARABLE (y la marca de orden de bytes que encabeza
  // algunos textos). No se ve ni separa: «hola﻿mundo» es una sola palabra. Antes se omitía con
  // aviso; ahora sale con una separación de palabra (⠀) en medio, y «﻿Hola» con ⠀ delante.
  // REPARADO (hallazgo 3440): U+FEFF se retira antes de convertir, sin aviso.
  test('REPARADO (3440) — «hola» + U+FEFF + «mundo» no lleva separación de palabra', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'hola﻿mundo');
    // h ⠓ · o ⠕ · l ⠇ · a ⠁ · (U+FEFF no se escribe) · m ⠍ · u ⠥ · n ⠝ · d ⠙ · o ⠕
    await expect(cajaResultado(page)).toContainText('⠓⠕⠇⠁'); // precondición: hubo conversión
    await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁⠍⠥⠝⠙⠕', { timeout: 2000 });
    // Al principio del texto (la marca de orden de bytes): ⠨⠓⠕⠇⠁, sin ⠀ delante
    await page.goto(RUTA);
    await convertirHidratado(page, '﻿Hola');
    await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁');
    // Y el espacio duro de 3416 sigue separando palabras
    await page.goto(RUTA);
    await convertirHidratado(page, 'hola mundo');
    await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁⠀⠍⠥⠝⠙⠕');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3441) — cabo C0363: cifras de la guía sin fuente ni año (neutralidad, regla 1)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Era: FAQ visible: «La OMS estima que 285 millones de personas tienen discapacidad visual en el
  // mundo, de las cuales 39 millones son ciegas» (sin año: es la estimación de 2010), «en EE.UU. se
  // estima que solo el 10 % de las personas ciegas son lectoras activas de Braille» (sin fuente ni
  // año); consejo: «Los estudios muestran que las personas ciegas alfabetizadas en Braille tienen un
  // 44 % más de probabilidad de estar empleadas» (sin fuente ni año). No están en el FAQPage.
  // REPARADO (hallazgo 3441): la OMS con su año (2010, publicado en 2012), el 10 % con su fuente
  // (informe de la Federación Nacional de Ciegos de EE. UU., 2009) y el 44 % retirado.
  test('REPARADO (3441) — las cifras de la OMS, del 10 % y del 44 % llevan año', async ({ page }) => {
    await page.goto(RUTA);
    const guia = await textoGuia(page);
    expect(guia).toContain('Preguntas Frecuentes'); // precondición: se leyó la guía
    const frases = guia.split(/(?<=[.;])\s+/);
    const sinAnio = frases.filter((f) => /285 millones|\b10\s%|\b44\s%/.test(f) && !/\b(19|20)\d{2}\b/.test(f));
    expect(sinAnio).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3442) — Grado 2 «25-30 % menos» y Grado 1 «25-30 % más» no podían ser ciertas a la vez
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Si el Grado 2 ocupa un 25-30 % menos, G2 = 0,70-0,75 · G1, y el Grado 1 ocupa 1/0,75 − 1 = 33,3 %
  // a 1/0,70 − 1 = 42,9 % más, no un 25-30 %. La FAQ dice lo primero y la caja de Limitaciones lo
  // segundo. REPARADO (hallazgo 3442): Limitaciones ya no da cifra propia («ocupa bastante más
  // espacio que el Grado 2 abreviado»), así que solo queda la de la FAQ.
  test('REPARADO (3442) — los porcentajes de espacio del Grado 1 y el Grado 2 cuadran entre sí', async ({ page }) => {
    await page.goto(RUTA);
    const guia = await textoGuia(page);
    const menos = guia.match(/Grado 2 ocupa un (\d+)-(\d+)\s%\s+menos/);
    const mas = guia.match(/Grado 1 ocupa un (\d+)-(\d+)\s%\s+más/);
    // Desde el hallazgo 3458 (24/10/2026) la FAQ tampoco da cifra («El Grado 2 ocupa menos espacio»,
    // la del 25-30 % no tenía fuente ni año), así que lo normal es que no quede ninguna: la
    // precondición pasa a ser que se leyó la guía, y si algún día vuelven las dos, que cuadren.
    expect(guia).toContain('El Grado 2 ocupa menos espacio');
    if (menos && mas) {
      const esperadoMas = (pct: number) => (100 / (100 - pct) - 1) * 100;
      expect(Math.abs(Number(mas[1]) - esperadoMas(Number(menos[1])))).toBeLessThanOrEqual(2);
      expect(Math.abs(Number(mas[2]) - esperadoMas(Number(menos[2])))).toBeLessThanOrEqual(2);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (23/10/2026, hallazgo 3443) — «basado en silabas» iba sin tilde
  // ─────────────────────────────────────────────────────────────────────────
  test('REPARADO (3443) — la FAQ escribe «sílabas» con tilde', async ({ page }) => {
    await page.goto(RUTA);
    const guia = await textoGuia(page);
    expect(guia).toContain('japonés tiene un Braille basado en'); // precondición
    expect(guia).not.toContain('silabas');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 23/10/2026 — el teclado en un móvil sin teclado físico
// ═════════════════════════════════════════════════════════════════════════════
//
// REPARADO (23/10/2026, hallazgo 3444). Era: en un móvil, la zona de las teclas F D S · J K L
// ocupaba 242 × 229 px por encima de los puntos táctiles y decía «Haz clic aquí y pulsa las teclas a
// la vez, como en una máquina Perkins»; tocarla solo le daba el foco (no abre el teclado virtual, no
// es un campo) y no escribía nada. El propio componente dice que en el móvil el camino es marcar los
// puntos.
test.describe('re-inspección 23/10/2026 — zona Perkins en móvil', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  // REPARADO (hallazgo 3444): la zona dice que es para un teclado físico y, en una pantalla táctil
  // sin ratón, va detrás de los puntos táctiles.
  test('REPARADO (3444) — en el móvil la zona de teclas no pide pulsar teclas que no hay', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).tap();
    await expect(page.getByRole('button', { name: 'Punto 1', exact: true })).toBeVisible(); // precondición
    const zona = page.getByTestId('zona-perkins');
    if (await zona.isVisible()) {
      await zona.tap();
      await expect(page.locator('textarea').first()).toHaveValue(''); // tocarla no escribe nada
      // Lo que DEBERÍA pasar: si se muestra, dice que es para un teclado físico.
      await expect(zona).toContainText(/teclado (físico|externo)/i, { timeout: 2000 });
    }
    // Los puntos táctiles van primero: el punto 1 queda por encima de la zona
    const yPunto = (await page.getByRole('button', { name: 'Punto 1', exact: true }).boundingBox())?.y ?? Infinity;
    const yZona = (await zona.boundingBox())?.y ?? -Infinity;
    expect(yPunto).toBeLessThan(yZona);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 24/10/2026 — 3434-3444 se sostienen; lo que dibujan la vista y la hoja
// ═════════════════════════════════════════════════════════════════════════════
//
// Los 55 tests de arriba pasan con el código de hoy: las reparaciones del 23/10 (3434-3444) se
// sostienen. Este bloque mira lo que aquéllos no miraban: que CADA celda que la vista y la hoja
// dibujan tenga los puntos de su código Unicode —también las que la app no escribe, sino que deja
// pasar tal cual desde la reparación del 3434 (8b08f5e1) o que llegan del teclado de seis puntos—,
// la hoja de VARIAS líneas punto a punto y el texto de la guía (cabo C0389).
//
// FUENTE de los valores esperados: la de la cabecera y SOLO por los apartados que el repositorio cita
// literalmente (§ 6.1, § 6.2, § 7, § 7.1, § 8.1, § 8.2); la web de la ONCE sigue fuera de los dominios
// permitidos. Los puntos de una celda salen de la aritmética del bloque Unicode, que no depende de
// ninguna norma: U+2800 + bits (punto 1 = 0x01, 2 = 0x02, 3 = 0x04, 4 = 0x08, 5 = 0x10, 6 = 0x20).
test.describe('re-inspección 24/10/2026', () => {
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

  /** El aviso de «Texto → Braille» para los caracteres que no se escriben. */
  const avisoSinCelda = (page: Page) =>
    page.locator('[class*="avisoConversion"]').filter({ hasText: 'Esta herramienta no escribe en braille' });

  /**
   * Celdas de la «Vista con celdas Braille» cuyos puntos pintados NO son los de su código Unicode
   * (solo celdas de seis puntos, U+2800-U+283F). Lista vacía = todas bien dibujadas.
   */
  async function celdasMalDibujadas(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const grid = document.querySelector('[class*="visualGrid"]');
      if (!grid) return ['(no hay vista de celdas)'];
      const orden = [1, 4, 2, 5, 3, 6];
      return [...grid.querySelectorAll('[class*="brailleCell"]')].flatMap((celda) => {
        const ch = celda.querySelector('[class*="brailleChar"]')?.textContent ?? '';
        const cp = ch.codePointAt(0) ?? 0;
        if (cp < 0x2800 || cp > 0x283f) return [];
        const esperado = [1, 2, 3, 4, 5, 6].filter((p) => (cp - 0x2800) & (1 << (p - 1))).join('-');
        const pintado = [...celda.querySelectorAll('[class*="brailleDot"]')]
          .map((d, i) => (d.className.includes('filled') ? orden[i] : 0))
          .filter(Boolean)
          .sort((a, b) => a - b)
          .join('-');
        return esperado === pintado ? [] : [`${ch}: esperado ${esperado || 'vacía'} · pintado ${pintado || 'vacía'}`];
      });
    });
  }

  /**
   * Puntos en relieve de la hoja, línea a línea y celda a celda ('' si la celda no tiene ninguno).
   * Norma por defecto, Marburg Medium: 6 mm entre celdas, 10 mm entre líneas, 2,5 mm entre puntos,
   * radio 0,75 mm; columna izquierda = puntos 1-2-3, derecha = 4-5-6.
   */
  async function hojaPorLineas(page: Page): Promise<string[][]> {
    return page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find((s) =>
        (s.getAttribute('aria-label') || '').includes('escala real'),
      );
      if (!svg) return [];
      const lineas = new Map<number, Map<number, number[]>>();
      [...svg.querySelectorAll('circle')].forEach((c) => {
        const cx = parseFloat(c.getAttribute('cx') || '0');
        const cy = parseFloat(c.getAttribute('cy') || '0');
        const linea = Math.floor(cy / 10);
        const celda = Math.floor(cx / 6);
        if (!lineas.has(linea)) lineas.set(linea, new Map());
        const l = lineas.get(linea)!;
        if (!l.has(celda)) l.set(celda, []);
        if (c.getAttribute('fill') !== '#000000') return; // los grises son la retícula guía
        const columna = Math.round((cx - celda * 6 - 0.75) / 2.5);
        const fila = Math.round((cy - linea * 10 - 0.75) / 2.5);
        l.get(celda)!.push(columna * 3 + fila + 1);
      });
      return [...lineas.keys()]
        .sort((a, b) => a - b)
        .map((k) => {
          const l = lineas.get(k)!;
          const max = Math.max(...l.keys());
          return Array.from({ length: max + 1 }, (_, i) =>
            (l.get(i) ?? []).sort((a, b) => a - b).join('-'),
          );
        });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — ü, mayúsculas, dos puntos, comillas, ¡!, paréntesis y fecha con barra;
  // en cadena, en celdas y en una hoja de DOS líneas
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 1 (normal) — «Güera dijo: «¡Ven ya!» (15/03)» en cadena, en celdas y en la hoja de dos líneas', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Güera dijo: «¡Ven ya!» (15/03)');
    // Derivación a mano, carácter a carácter:
    //   'G' → ⠨ (4-6, § 7) + g ⠛ (1-2-4-5 = 0x1B) · 'ü' → ⠳ (1-2-5-6 = 0x33) · 'e' → ⠑ (1-5)
    //   'r' → ⠗ (1-2-3-5) · 'a' → ⠁ (1) · ' ' → ⠀
    //   'dijo' → ⠙ (1-4-5) ⠊ (2-4) ⠚ (2-4-5) ⠕ (1-3-5) · ':' → ⠒ (2-5, § 6.1) · ' ' → ⠀
    //   '«' → ⠦ (2-3-6, § 6.1) · '¡' → ⠖ (2-3-5, § 6.1) · 'V' → ⠨ + v ⠧ (1-2-3-6 = 0x27)
    //   'en' → ⠑ ⠝ (1-3-4-5) · ' ' → ⠀ · 'ya' → ⠽ (1-3-4-5-6 = 0x3D) ⠁ · '!' → ⠖ · '»' → ⠦ · ' ' → ⠀
    //   '(' → ⠣ (1-2-6, § 6.1) · '15' → ⠼ (3-4-5-6, § 8.1) ⠁ ⠑ · '/' → ⠠ ⠂ (6 | 2, § 6.2)
    //   '03' → ⠼ (el número que sigue a la barra lleva su signo) ⠚ (2-4-5) ⠉ (1-4) · ')' → ⠜ (3-4-5)
    await expect(cajaResultado(page)).toHaveText('⠨⠛⠳⠑⠗⠁⠀⠙⠊⠚⠕⠒⠀⠦⠖⠨⠧⠑⠝⠀⠽⠁⠖⠦⠀⠣⠼⠁⠑⠠⠂⠼⠚⠉⠜');
    await expect(avisoSinCelda(page)).toHaveCount(0);
    // ¡ » y « abren y cierran con el mismo signo (§ 6.1): la app lo advierte
    await expect(page.getByText(/se abren y se cierran con el/)).toBeVisible();
    expect(await celdasMalDibujadas(page)).toEqual([]);

    // La hoja: 29 celdas por línea con Marburg (⌊(172 − 2,5 − 1,5) / 6⌋ + 1). Las palabras miden
    // 6 · 5 · 6 · 4 · 10 celdas: 6 + 1 + 5 + 1 + 6 + 1 + 4 = 24, y la quinta (10) ya no cabe en
    // las 4 que quedan (29 − 24 − 1), así que baja entera a la segunda línea.
    expect(await hojaPorLineas(page)).toEqual([
      [
        '4-6', '1-2-4-5', '1-2-5-6', '1-5', '1-2-3-5', '1', '',
        '1-4-5', '2-4', '2-4-5', '1-3-5', '2-5', '',
        '2-3-6', '2-3-5', '4-6', '1-2-3-6', '1-5', '1-3-4-5', '',
        '1-3-4-5-6', '1', '2-3-5', '2-3-6',
      ],
      ['1-2-6', '3-4-5-6', '1', '1-5', '6', '2', '3-4-5-6', '2-4-5', '1-4', '3-4-5'],
    ]);
    await expect(page.locator('[class*="hojaAviso"]')).toHaveText(
      '2 líneas de 29 celdas · celda de 6 mm · 10 mm entre líneas',
    );
    await expect(page.locator('svg[aria-label*="escala real"]')).toHaveAttribute(
      'aria-label',
      'Hoja de 2 líneas en Braille a escala real, orientación de lectura',
    );

    // Vuelta: « » → " y ¡ → ! (un único signo, § 6.1); lo demás vuelve igual
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('Güera dijo: "!Ven ya!" (15/03)');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — solo espacios, mayúsculas y cifras pegadas, y el sentido inverso
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 2 (límite) — «   », «ABC123», «A1b» y «⠨⠁⠨⠃⠨⠉⠼⠁⠃⠉» en Braille → Texto', async ({ page }) => {
    // Solo espacios: tres separaciones ⠀ y ninguna hoja que imprimir (no hay palabras)
    await page.goto(RUTA);
    await convertirHidratado(page, '   ');
    await expect(cajaResultado(page)).toHaveText('⠀⠀⠀');
    await expect(page.getByRole('button', { name: /Imprimir la hoja/ })).toBeDisabled();
    await expect(page.locator('[class*="hojaAviso"]')).toHaveText(
      'Convierte primero un texto: la hoja se genera con el resultado de arriba.',
    );

    // «ABC123»: cada mayúscula con su ⠨ (§ 7.1, recurso 1) y un solo ⠼ (§ 8.1)
    //   ⠨⠁ (A) ⠨⠃ (B) ⠨⠉ (C) · ⠼ ⠁ (1) ⠃ (2) ⠉ (3)
    await page.goto(RUTA);
    await convertirHidratado(page, 'ABC123');
    await expect(cajaResultado(page)).toHaveText('⠨⠁⠨⠃⠨⠉⠼⠁⠃⠉');
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('ABC123');

    // «A1b»: la b (primera serie) pegada a la cifra lleva el prefijo de latina ⠐ (punto 5, § 8.2)
    //   ⠨⠁ (A) · ⠼ ⠁ (1) · ⠐ ⠃ (b)
    await page.goto(RUTA);
    await convertirHidratado(page, 'A1b');
    await expect(cajaResultado(page)).toHaveText('⠨⠁⠼⠁⠐⠃');
    expect(await celdasMalDibujadas(page)).toEqual([]);
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('A1b');

    // Sentido inverso escrito directamente; la hoja de ese sentido punza la entrada
    await page.goto(RUTA);
    await convertirHidratado(page, '⠨⠁⠨⠃⠨⠉⠼⠁⠃⠉', 'braille');
    await expect(cajaResultado(page)).toHaveText('ABC123');
    await expect(page.locator('[class*="avisoConversion"]')).toHaveCount(0);
    expect(await hojaPorLineas(page)).toEqual([
      ['4-6', '1', '4-6', '1-2', '4-6', '1-4', '3-4-5-6', '1', '1-2', '1-4'],
    ]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (rechazo) — un carácter sin celda en la app: el € se omite y se nombra
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 3 (rechazo) — «Precio: 5 €» omite el € y lo nombra; lo demás, entero', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Precio: 5 €');
    //   'P' → ⠨ + p ⠏ (1-2-3-4) · r ⠗ · e ⠑ · c ⠉ · i ⠊ · o ⠕ · ':' → ⠒ · ' ' → ⠀
    //   '5' → ⠼ ⠑ · ' ' → ⠀ · '€' → nada (no está en la tabla de la app)
    //   27/10/2026 (hallazgo 3525): el B 2 § 13 SÍ da celda al euro, 456-15 (⠸⠑). La app aún no lo
    //   escribe (ampliar la tabla es decisión del usuario), y su aviso propio lo dice: ya no el
    //   genérico, que lo sacaba «fuera de la signografía básica».
    await expect(cajaResultado(page)).toHaveText('⠨⠏⠗⠑⠉⠊⠕⠒⠀⠼⠑⠀');
    const avisoB2 = page.locator('[class*="avisoConversion"]').filter({ hasText: 'Documento Técnico B 2) sí le da celda' });
    await expect(avisoB2.locator('strong')).toHaveText('€');
    await expect(avisoSinCelda(page)).toHaveCount(0);
    expect(await celdasMalDibujadas(page)).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (24/10/2026, hallazgo 3456) — 14 de las 64 celdas de seis puntos se dibujaban EN BLANCO.
  // La vista y la hoja sacan ahora los puntos de los bits del código (`puntosDeCelda`, celdas.ts), la
  // tabla `brailleDots` se retiró y `check:braille` exige que el dibujo siga saliendo de ahí.
  // Lo de debajo es la descripción del defecto tal como lo encontró el Inspector.
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Desde la reparación del 3434 (8b08f5e1, 23/10) una celda braille en «Texto → Braille» pasa tal
  // cual al resultado, y en «Braille → Texto» la hoja punza la ENTRADA, que puede traer cualquier
  // celda (pegada, o escrita con el teclado de seis puntos de e122b8ed). Pero la vista de celdas y la
  // hoja buscan los puntos en `brailleDots`, que solo tiene las 50 celdas que la app escribe, y
  // `brailleDots[c] ?? []` dibuja las demás sin ningún punto: en la hoja a escala real eso es una
  // SEPARACIÓN DE PALABRA. Faltan ⠈ ⠔ ⠘ ⠡ ⠩ ⠪ ⠫ ⠯ ⠰ ⠱ ⠴ ⠸ ⠹ ⠿. Es la forma del hallazgo 1183 (la ⠠
  // de la barra), y `npm run check:braille` no la ve: solo cuenta como «emitibles» las celdas de
  // `textToBraille`, `SIGNOS_COMPUESTOS` y los indicadores, no las que pasan tal cual ni las de la
  // entrada que punza la hoja.
  test('REPARADO 3456 — una celda que pasa tal cual se dibuja con sus puntos en la vista y en la hoja', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // ⠫ = U+282B = 0x01 + 0x02 + 0x08 + 0x20 → puntos 1-2-4-6
    await convertirHidratado(page, 'hola ⠫');
    await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁⠀⠫'); // precondición: la celda pasó tal cual
    // Lo que DEBERÍA pasar: la ⠫ con sus cuatro puntos. Era: «vacía» en la vista y 0 puntos en la hoja.
    expect(await celdasMalDibujadas(page)).toEqual([]);
    expect(await hojaPorLineas(page)).toEqual([['1-2-5', '1-3-5', '1-2-3', '1', '', '1-2-4-6']]);

    // Las 64 celdas de seis puntos pegadas a la vez: ninguna puede salir con otros puntos
    const todas = Array.from({ length: 64 }, (_, i) => String.fromCodePoint(0x2800 + i)).join('');
    await page.goto(RUTA);
    await convertirHidratado(page, todas);
    await expect(cajaResultado(page)).toHaveText(todas); // precondición
    expect(await celdasMalDibujadas(page)).toEqual([]);
  });

  test('REPARADO 3456 — en Braille → Texto la hoja punza la ⠿ que escribe el teclado, no un espacio', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // ⠿ = U+283F = las seis teclas a la vez (F D S J K L) → puntos 1-2-3-4-5-6
    await convertirHidratado(page, '⠓⠕⠇⠁⠿', 'braille');
    await expect(cajaResultado(page)).toHaveText('hola⠿'); // precondición: la vuelta no la traduce y lo avisa
    // Lo que DEBERÍA pasar: la quinta celda de la hoja con sus seis puntos. Era: ninguno.
    expect(await hojaPorLineas(page)).toEqual([['1-2-5', '1-3-5', '1-2-3', '1', '1-2-3-4-5-6']]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (24/10/2026, hallazgo 3457) — cabo C0389: «70.000 afiliados» y «Los expertos señalan», retirados
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Regla 1 de neutralidad (CLAUDE.md §1.quinquies). La reparación del 3441 puso año y fuente a la
  // OMS y al 10 % de la misma respuesta, y dejó dos frases sin ninguno: «En España, la ONCE atiende
  // a unos 70.000 afiliados con discapacidad visual severa.» y «Los expertos señalan que quienes
  // aprenden Braille tienen mayor tasa de empleo y autonomía que quienes solo usan tecnología de
  // voz.» No está en el FAQPage (sus preguntas son otras).
  test('REPARADO 3457 (C0389) — la cifra de afiliados de la ONCE lleva año y fuente, y nadie «señala» sin nombre', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const respuesta = await page.evaluate(() => {
      const item = [...document.querySelectorAll('[class*="eduFaqItem"]')].find((d) =>
        (d.querySelector('h4')?.textContent ?? '').includes('¿Cuántas personas en el mundo usan Braille?'),
      );
      return (item?.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ');
    });
    expect(respuesta).toContain('La OMS estimó que en 2010'); // precondición: se leyó la respuesta
    const frases = respuesta.split(/(?<=\.)\s+/);
    const afiliados = frases.find((f) => /70\.000/.test(f));
    // Lo que DEBERÍA pasar: la cifra con su año (o sin cifra). Era: «unos 70.000 afiliados», sin año.
    expect(afiliados === undefined || /\b(19|20)\d{2}\b/.test(afiliados)).toBe(true);
    expect(respuesta).not.toContain('Los expertos señalan');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (24/10/2026, hallazgo 3458) — más cifras de la guía sin fuente ni año: retiradas
  // ─────────────────────────────────────────────────────────────────────────
  test('REPARADO 3458 — las cifras de velocidad, espacio, aprendizaje, catálogo y precio llevan año', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // Frase a frase de cada párrafo, celda de tabla y punto de lista de la guía (está en el DOM
    // aunque nazca plegada). Cada frase con una de estas cifras debe llevar un año, o haberse
    // retirado la cifra. Era (literal): «más de 50.000 títulos», «25-40 % más rápida» (tabla),
    // «El Grado 2 ocupa un 25-30 % menos espacio», «6-12 meses de práctica diaria… (80-100 palabras
    // por minuto)», «Un lector experto llega a 200 WPM», «cuestan 3.000-8.000 €».
    const frases = await page.evaluate(() =>
      [...document.querySelectorAll('[data-guia-educativa] p, [data-guia-educativa] td, [data-guia-educativa] li')]
        .flatMap((el) => (el.textContent ?? '').replace(/\s+/g, ' ').split(/(?<=[.;])\s+/)),
    );
    expect(frases.length).toBeGreaterThan(40); // precondición: se leyó la guía
    const cifras = [/50\.000 títulos/, /25-40\s%/, /25-30\s%\s+menos/, /6-12 meses/, /200 WPM/, /3\.000-8\.000\s€/];
    const sinAnio = frases.filter((f) => cifras.some((c) => c.test(f)) && !/\b(19|20)\d{2}\b/.test(f));
    expect(sinAnio).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO (24/10/2026, hallazgo 3459) — el aviso de un solo carácter decía «les asigne»
  // ─────────────────────────────────────────────────────────────────────────
  test('REPARADO 3459 — con un solo carácter omitido, el aviso concuerda en singular', async ({ page }) => {
    // 27/10/2026: el € tiene ya su aviso propio (hallazgo 3525, celda en el B 2 § 13); el genérico
    // se medía con el ¥ y la £, y desde el hallazgo 3556 (27/10/2026) también llevan el del B 2 § 13:
    // se mide con un emoji y con el cirílico, de los que la signografía básica no da celda.
    await page.goto(RUTA);
    await convertirHidratado(page, 'Precio: 5 🙂');
    const aviso = avisoSinCelda(page);
    await expect(aviso).toContainText('este carácter'); // precondición: es el aviso de UN carácter
    // Lo que DEBERÍA pasar: «le asigne». Era: «este carácter: €. … sí les asigne celda».
    await expect(aviso).not.toContainText('les asigne', { timeout: 2000 });
    await expect(aviso).toContainText('le asigne celda');
    // Con dos, el plural sigue (el ternario va en las dos ramas).
    await page.goto(RUTA);
    await convertirHidratado(page, 'Precio: 5 Да');
    await expect(avisoSinCelda(page)).toContainText('les asigne celda');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 24/10/2026 — móvil de 360 px
// ═════════════════════════════════════════════════════════════════════════════
test.describe('re-inspección 24/10/2026 — móvil de 360 px', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('móvil — «Güera dijo: «¡Ven ya!» (15/03)» se convierte y el resultado cabe en la pantalla', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    const textarea = page.locator('textarea').first();
    await textarea.fill('Güera dijo: «¡Ven ya!» (15/03)');
    await esperarValorEnReact(page, textarea, 'Güera dijo: «¡Ven ya!» (15/03)');
    await page.getByRole('button', { name: 'Convertir', exact: true }).tap();
    // La misma cadena que en escritorio (derivación en el CASO 1 del bloque anterior)
    await expect(cajaResultado(page)).toHaveText('⠨⠛⠳⠑⠗⠁⠀⠙⠊⠚⠕⠒⠀⠦⠖⠨⠧⠑⠝⠀⠽⠁⠖⠦⠀⠣⠼⠁⠑⠠⠂⠼⠚⠉⠜');
    const fuera = await page.evaluate(() => {
      const ancho = document.documentElement.clientWidth;
      return ['[class*="resultBox"]', '[class*="visualGrid"]', '[class*="hojaPapel"]']
        .filter((s) => (document.querySelector(s)?.getBoundingClientRect().right ?? 0) > ancho + 0.5);
    });
    expect(fuera).toEqual([]);
  });

  // REPARADO (24/10/2026, hallazgo 3460): la rejilla pasa a `repeat(auto-fill, minmax(62px, 1fr))`.
  // Lo que había: por debajo de 768 px la rejilla del alfabeto pasaba a `repeat(5, 1fr)`, pero
  // cada ficha mide 62 px de ancho mínimo (la celda dibujada): 5 × 62 + 4 huecos de 8 = 342 px en una
  // tarjeta de 276 (390 px) o 246 (360 px). La quinta columna —E, J, Ñ, S y X— se sale de la tarjeta
  // y el `overflow-x: clip` del <body> la corta: a 360 px queda fuera de la pantalla casi entera, sin
  // desplazamiento horizontal que la alcance. A 360 px se sale también la quinta columna de las
  // cifras (5 y 0).
  test('REPARADO 3460 — el alfabeto de referencia no deja la E, la J, la Ñ, la S ni la X fuera de la pantalla', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    const medida = await page.evaluate(() => {
      const ancho = document.documentElement.clientWidth;
      const seccion = document.querySelector('[class*="alphabetSection"]');
      const bordeTarjeta = seccion?.getBoundingClientRect().right ?? 0;
      const fichas = [...(seccion?.querySelectorAll('[class*="alphabetItem"]') ?? [])];
      return {
        fichas: fichas.length,
        cortadas: fichas
          .filter((f) => f.getBoundingClientRect().right > Math.min(ancho, bordeTarjeta) + 0.5)
          .map((f) => f.querySelector('[class*="alphabetLetter"]')?.textContent ?? '?'),
      };
    });
    // precondición: 27 letras + 6 vocales con diacrítico + 10 cifras
    expect(medida.fichas).toBe(43);
    // Lo que DEBERÍA pasar: ninguna ficha fuera. Era: E, J, Ñ, S, X (x 337 → 399 px), 5 y 0.
    expect(medida.cortadas).toEqual([]);
  });

  // REPARADO (cabo C0401, 24/10/2026): la página no desborda en horizontal. Además del alfabeto,
  // .hojaControles tenía pistas de 280 px como mínimo en una tarjeta de 246-276.
  // Reinyectado el 24/10/2026 con minmax(280px, 1fr): 4 controles fuera de la tarjeta.
  test('REPARADO C0401 — ni los controles de la hoja se salen de su tarjeta ni la página desborda', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    const textarea = page.locator('textarea').first();
    await textarea.fill('hola');
    await esperarValorEnReact(page, textarea, 'hola');
    await page.getByRole('button', { name: 'Convertir', exact: true }).tap();
    await expect(cajaResultado(page)).toHaveText('⠓⠕⠇⠁');
    const medida = await page.evaluate(() => {
      const ancho = document.documentElement.clientWidth;
      const controles = document.querySelector('[class*="hojaControles"]');
      // El borde útil de la tarjeta: a 360 px una pista de 280 no llega al borde de la pantalla,
      // pero sí se sale de la tarjeta de 246 px (C0401).
      const tarjeta = controles?.closest('[class*="hojaSection"]');
      const borde = tarjeta
        ? tarjeta.getBoundingClientRect().right - parseFloat(getComputedStyle(tarjeta).paddingRight)
        : ancho;
      return {
        hayControles: controles !== null,
        sobra: document.body.scrollWidth - ancho,
        fuera: [...(controles?.children ?? [])].filter((c) => c.getBoundingClientRect().right > Math.min(ancho, borde) + 0.5).length,
      };
    });
    expect(medida.hayControles).toBe(true); // precondición: la hoja está montada
    expect(medida.fuera).toBe(0);
    expect(medida.sobra).toBeLessThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// inspector 26/10/2026 — el B 2 leído entero, celdas de ocho puntos y la página traducida
// ═════════════════════════════════════════════════════════════════════════════
//
// Las reparaciones del 24/10 (1965bb4c: 3456-3459; 390a4a69: 3460 y C0401) se sostienen: sus tests,
// arriba, pasan. Desde el 24/10 once.es está permitido y el B 2 (V4, 22/01/2026) se ha leído ENTERO:
// https://www.once.es/servicios-sociales/braille/comision-braille-espanola/documentos-tecnicos/documentos-tecnicos-relacionados-con-el-braille/documentos/b2-signografia-basica-de-las-lenguas-cooficiales-espanolas-v4-2026-01-22.pdf
// Los valores esperados de este bloque salen de ahí, con su apartado; los puntos de cada celda, de la
// aritmética del bloque Unicode (U+2800 + bit (n − 1) de cada punto n: 1 = 0x01 … 6 = 0x20,
// 7 = 0x40, 8 = 0x80).
//
// Cabo C0238 con el documento delante:
//   (b) § 8.1: «Cuando se escriban números formados por más de tres cifras con algún tipo de
//       separación, debe utilizarse el punto 3 como separador de los grupos de tres dígitos.» Ejemplo
//       literal: «501.439.678 · 501 439 678 → #eja.dci.fgh». Los teléfonos «se transcriben sin
//       espacios en blanco» (999 999 999 → #iiiiiiiii). → hallazgo 3526, REPARADO el 27/10/2026.
//   (c) § 6.1: puntos suspensivos «…» = 3-3-3, lo que la app ya escribe (CASO 1). Cerrado.
//   (d) § 7: no hay signo de «palabra en mayúsculas». Siglas, § 7.1: recurso 1 (⠨ delante de cada
//       letra, lo que hace la app) o 2 (⠨⠨ delante de la primera). Texto en mayúsculas como cambio
//       tipográfico, § 7.2: signos del § 9.1 (35 al abrir y al cerrar) y el texto en minúscula.
//       → hallazgo 3529, REPARADO el 27/10/2026 con un aviso (no se distingue sigla de énfasis).
//   (f) moneda de 2 € y (g) árabe de derecha a izquierda: sin anclar (lo cuenta el acta). Se
//       cerraron en la re-inspección del 27/10/2026: ver el bloque del final.
test.describe('inspector 26/10/2026', () => {
  const ADA = 'ADA 703.3 (EE. UU.)';

  async function convertirHidratado(page: Page, texto: string, modo: 'texto' | 'braille' = 'texto') {
    await esperarHidratacion(page, ['textarea']);
    if (modo === 'braille') {
      await page.getByRole('button', { name: 'Braille → Texto' }).click();
    }
    const textarea = page.locator('textarea').first();
    await textarea.fill(texto);
    await esperarValorEnReact(page, textarea, texto);
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
  }

  /** El aviso de «Texto → Braille» para los caracteres que no se escriben. */
  const avisoSinCelda = (page: Page) =>
    page.locator('[class*="avisoConversion"]').filter({ hasText: 'Esta herramienta no escribe en braille' });

  const hojaAviso = (page: Page) => page.locator('[class*="hojaAviso"]').first();

  /** Puntos pintados en cada celda de la «Vista con celdas Braille» ('' si ninguno). */
  async function celdasVista(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const grid = document.querySelector('[class*="visualGrid"]');
      if (!grid) return [];
      const orden = [1, 4, 2, 5, 3, 6];
      return [...grid.querySelectorAll('[class*="brailleCell"]')].map((celda) =>
        [...celda.querySelectorAll('[class*="brailleDot"]')]
          .map((d, i) => (d.className.includes('filled') ? orden[i] : 0))
          .filter(Boolean)
          .sort((a, b) => a - b)
          .join('-'),
      );
    });
  }

  /**
   * Puntos en relieve de la hoja, línea a línea y celda a celda ('' si la celda no tiene ninguno).
   * Marburg Medium: 6 mm entre celdas, 10 mm entre líneas, 2,5 mm entre puntos, radio 0,75 mm.
   */
  async function hojaPorLineas(page: Page): Promise<string[][]> {
    return page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find((s) =>
        (s.getAttribute('aria-label') || '').includes('escala real'),
      );
      if (!svg) return [];
      const lineas = new Map<number, Map<number, number[]>>();
      [...svg.querySelectorAll('circle')].forEach((c) => {
        const cx = parseFloat(c.getAttribute('cx') || '0');
        const cy = parseFloat(c.getAttribute('cy') || '0');
        const linea = Math.floor(cy / 10);
        const celda = Math.floor(cx / 6);
        if (!lineas.has(linea)) lineas.set(linea, new Map());
        const l = lineas.get(linea)!;
        if (!l.has(celda)) l.set(celda, []);
        if (c.getAttribute('fill') !== '#000000') return; // los grises son la retícula guía
        const columna = Math.round((cx - celda * 6 - 0.75) / 2.5);
        const fila = Math.round((cy - linea * 10 - 0.75) / 2.5);
        l.get(celda)!.push(columna * 3 + fila + 1);
      });
      return [...lineas.keys()]
        .sort((a, b) => a - b)
        .map((k) => {
          const l = lineas.get(k)!;
          const max = Math.max(...l.keys());
          return Array.from({ length: max + 1 }, (_, i) => (l.get(i) ?? []).sort((a, b) => a - b).join('-'));
        });
    });
  }

  /** El traductor del navegador (receta de ternario-traducido-familia.spec.ts): cada texto → <font><font>. */
  const traducir = (page: Page) =>
    page.evaluate(() => {
      const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const padre = n.parentElement;
          if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
          if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodos: Text[] = [];
      while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
      for (const nodo of nodos) {
        const exterior = document.createElement('font');
        const interior = document.createElement('font');
        interior.textContent = nodo.nodeValue;
        exterior.appendChild(interior);
        nodo.parentNode?.replaceChild(exterior, nodo);
      }
    });

  /** Errores de React al tocar nodos que el traductor ya cambió. */
  function vigilarErrores(page: Page): string[] {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });
    return errores;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — mayúscula con tilde, dos puntos, comillas, ¡!, y los puntos suspensivos del § 6.1
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 1 (normal) — «Él dijo: “¡Basta ya…!”»: cadena, celdas, hoja de una línea y vuelta', async ({ page }) => {
    await page.goto(RUTA);
    await convertirHidratado(page, 'Él dijo: “¡Basta ya…!”');
    // Derivación a mano con el B 2:
    //   'É' → ⠨ (46, § 7) + é ⠮ (2346, § 4) · 'l' → ⠇ (123) · ' ' → ⠀
    //   'dijo' → ⠙ (145) ⠊ (24) ⠚ (245) ⠕ (135) · ':' → ⠒ (25, § 6.1) · ' ' → ⠀
    //   '“' → ⠦ (236, § 6.1: abrir y cerrar comillas) · '¡' → ⠖ (235, § 6.1)
    //   'B' → ⠨ + b ⠃ (12) · 'asta' → ⠁ (1) ⠎ (234) ⠞ (2345) ⠁ · ' ' → ⠀ · 'ya' → ⠽ (13456) ⠁
    //   '…' → ⠄⠄⠄ (§ 6.1: puntos suspensivos = 3-3-3; cierra el cabo C0238 c) · '!' → ⠖ · '”' → ⠦
    await expect(cajaResultado(page)).toHaveText('⠨⠮⠇⠀⠙⠊⠚⠕⠒⠀⠦⠖⠨⠃⠁⠎⠞⠁⠀⠽⠁⠄⠄⠄⠖⠦');
    await expect(avisoSinCelda(page)).toHaveCount(0);
    await expect(page.getByText(/se abren y se cierran con el/)).toBeVisible();
    expect(await celdasVista(page)).toEqual([
      '4-6', '2-3-4-6', '1-2-3', '',
      '1-4-5', '2-4', '2-4-5', '1-3-5', '2-5', '',
      '2-3-6', '2-3-5', '4-6', '1-2', '1', '2-3-4', '2-3-4-5', '1', '',
      '1-3-4-5-6', '1', '3', '3', '3', '2-3-5', '2-3-6',
    ]);
    // Palabras de 3 · 5 · 8 · 7 celdas: 3 + 1 + 5 + 1 + 8 + 1 + 7 = 26 ≤ 29 celdas de la línea Marburg
    // (⌊(172 − 2,5 − 1,5) / 6⌋ + 1 = 29): una sola línea.
    expect(await hojaPorLineas(page)).toEqual([
      [
        '4-6', '2-3-4-6', '1-2-3', '',
        '1-4-5', '2-4', '2-4-5', '1-3-5', '2-5', '',
        '2-3-6', '2-3-5', '4-6', '1-2', '1', '2-3-4', '2-3-4-5', '1', '',
        '1-3-4-5-6', '1', '3', '3', '3', '2-3-5', '2-3-6',
      ],
    ]);
    await expect(hojaAviso(page)).toHaveText('1 línea de 29 celdas · celda de 6 mm · 10 mm entre líneas');

    // Vuelta: “ ” → " y ¡ → ! (un único signo, § 6.1) y «…» como «...»; lo demás, igual
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('Él dijo: "!Basta ya...!"');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — REPARADO, hallazgo 3528 (inspector 26/10/2026) — cabo C0446: celdas de ocho puntos
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Una celda pegada del bloque braille pasa tal cual (hallazgo 3434), y el bloque llega a U+28FF:
  // celdas de OCHO puntos. La vista y la hoja son rejillas de seis y no dibujan los puntos 7 y 8:
  // ⡀ (U+2840, solo el punto 7) sale como una celda en blanco —en la hoja, lo mismo que la separación
  // de palabra— y ⡁ (U+2841, puntos 1 y 7) se dibuja y se punza como ⠁, la «a». Ningún aviso lo
  // decía. La reparación (27/10/2026) avisa en los dos sentidos: la hoja sigue siendo de seis puntos
  // (Marburg y ADA son celdas de seis), y lo que el test exige es que la celda no se dibuje como OTRA
  // sin decirlo.
  test('REPARADO (3528) — una celda de ocho puntos no se dibuja como un espacio ni como la «a» sin avisar', async ({ page }) => {
    // REPARADO, hallazgo 3528 (inspector 26/10/2026)
    const avisaOchoPuntos = async () =>
      (await page.locator('[class*="avisoConversion"]').allInnerTexts()).some((t) =>
        /(ocho|8) puntos|puntos? 7/i.test(t),
      );
    await page.goto(RUTA);
    await convertirHidratado(page, 'a⡀b');
    await expect(cajaResultado(page)).toHaveText('⠁⡀⠃'); // precondición: la celda pasa tal cual
    const vista = await celdasVista(page); // ['1', '', '1-2'] (seis puntos; desde aa75156d, con aviso)
    const hoja = await hojaPorLineas(page); // [['1', '', '1-2']] (ídem)
    expect((vista[1] !== '' && hoja[0]?.[1] !== '') || (await avisaOchoPuntos())).toBe(true);

    await page.goto(RUTA);
    await convertirHidratado(page, '⡁', 'braille');
    await expect(cajaResultado(page)).toHaveText('⡁'); // precondición
    const hojaBraille = await hojaPorLineas(page); // [['1']]: la hoja punza una «a» (desde aa75156d, con aviso)
    expect(hojaBraille[0]?.[0] !== '1' || (await avisaOchoPuntos())).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (rechazo) — lo que no tiene celda en el B 2: ni resultado, ni hoja, y se nombra
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 3 (rechazo) — «你好» no tiene celda en la signografía básica: ni resultado ni hoja, y el aviso los nombra', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // El B 2 cubre las lenguas cooficiales y el B 12 de la CBE solo el griego, el cirílico, el árabe
    // y el hebreo: un ideograma chino no tiene celda en ninguno de los dos.
    await convertirHidratado(page, '你好');
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
    const aviso = page
      .locator('[class*="avisoConversion"]')
      .filter({ hasText: 'La conversión no ha dado ningún resultado' });
    await expect(aviso).toContainText('esta herramienta no escribe en braille nada de lo que hay en la caja');
    await expect(aviso.locator('strong')).toHaveText('你 · 好');
    await expect(page.getByRole('button', { name: /Imprimir la hoja/ })).toBeDisabled();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3526 (inspector 26/10/2026) — § 8.1: un blanco entre grupos de tres cifras partía el número en dos
  // ─────────────────────────────────────────────────────────────────────────
  test('REPARADO (3526) — § 8.1: «10 000» y «1 250 000» llevan el punto 3 de millar, no dos números', async ({ page }) => {
    // REPARADO, hallazgo 3526 (inspector 26/10/2026). Era: ⠼⠁⠚⠀⠼⠚⠚⠚ y ⠼⠁⠀⠼⠃⠑⠚⠀⠼⠚⠚⠚.
    await page.goto(RUTA);
    // ⠼ (3456) · 1 ⠁ · 0 ⠚ · ⠄ (punto 3, separador de millar del § 8.1) · 0 ⠚ · 0 ⠚ · 0 ⠚
    await convertirHidratado(page, '10 000');
    await expect(cajaResultado(page)).toHaveText('⠼⠁⠚⠄⠚⠚⠚', { timeout: 3000 });
    // ⠼ · 1 ⠁ · ⠄ · 2 ⠃ · 5 ⠑ · 0 ⠚ · ⠄ · 0 ⠚ · 0 ⠚ · 0 ⠚ (siete cifras: no es un teléfono)
    await page.goto(RUTA);
    await convertirHidratado(page, '1 250 000');
    await expect(cajaResultado(page)).toHaveText('⠼⠁⠄⠃⠑⠚⠄⠚⠚⠚', { timeout: 3000 });
    // El ejemplo literal del § 8.1: «501 439 678 → #eja.dci.fgh»
    await page.goto(RUTA);
    await convertirHidratado(page, '501 439 678');
    await expect(cajaResultado(page)).toHaveText('⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓');
    // La excepción del mismo apartado: los teléfonos «se transcriben sin espacios en blanco»
    // (999 999 999 → #iiiiiiiii). Nueve cifras en grupos de tres que empiezan por 6-9 se toman por
    // teléfono, y el aviso lo dice con la forma de escribir una cantidad.
    await page.goto(RUTA);
    await convertirHidratado(page, 'Llama al 999 999 999');
    await expect(cajaResultado(page)).toHaveText('⠨⠇⠇⠁⠍⠁⠀⠁⠇⠀⠼⠊⠊⠊⠊⠊⠊⠊⠊⠊');
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'como un número de teléfono' }).locator('strong'),
    ).toHaveText('999 999 999');
    // Un número de más de tres cifras sin separar no se toca, ni un grupo que no es de tres
    await page.goto(RUTA);
    await convertirHidratado(page, '2026 100 y 12 34');
    await expect(cajaResultado(page)).toHaveText('⠼⠃⠚⠃⠋⠀⠼⠁⠚⠚⠀⠽⠀⠼⠁⠃⠀⠼⠉⠙');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3525 (inspector 26/10/2026) — €, %, raya y corchetes: el aviso los sacaba de la signografía básica
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Los omitía y avisaba: «Puede que el Código Braille Español sí le asigne celda fuera de la
  // signografía básica que cubre esta app». Pero la signografía básica ES el B 2, y les da celda: § 13
  // euro 456-15, § 12 tanto por ciento 456-356, § 6.2 raya de diálogo 36-36 y corchetes 12356 / 23456
  // (también asterisco 35, llaves, barra inversa y vertical, § 12 + = °, § 13 $ ¥ £…). Es la forma
  // del 3415. Valía escribirlos o que el aviso dejara de decir lo que la fuente desmiente. La
  // reparación (27/10/2026) hace lo segundo: escribirlos es ampliar la tabla, decisión del usuario.
  // Los citados literalmente (€ % — [ ] *) tienen un aviso que dice que el B 2 sí les da celda; el
  // genérico ya no dice dónde estaría la celda de los demás.
  test('REPARADO (3525) — § 6.2, § 12 y § 13: €, %, la raya y los corchetes tienen celda en la signografía básica', async ({
    page,
  }) => {
    // REPARADO, hallazgo 3525 (inspector 26/10/2026)
    const casos = [
      { texto: 'Precio: 5 €', celdas: '⠸⠑', apartado: '§ 13: € = 456-15' },
      { texto: 'Sube un 15 %', celdas: '⠸⠴', apartado: '§ 12: % = 456-356' },
      { texto: '—Hola —dijo.', celdas: '⠤⠤', apartado: '§ 6.2: raya de diálogo = 36-36' },
      { texto: 'Ver [nota]', celdas: '⠷⠝⠕⠞⠁⠾', apartado: '§ 6.2: [ = 12356, ] = 23456' },
    ];
    for (const c of casos) {
      await page.goto(RUTA);
      await convertirHidratado(page, c.texto);
      await expect(cajaResultado(page)).toBeVisible(); // precondición: hay resultado
      const escrito = (await cajaResultado(page).innerText()).includes(c.celdas);
      const fueraDeLaBasica = await avisoSinCelda(page).filter({ hasText: 'fuera de la signografía básica' }).count();
      expect(escrito || fueraDeLaBasica === 0, `${c.texto} (${c.apartado})`).toBe(true);
      // Y si no lo escribe, lo dice: el aviso del B 2 lo nombra
      if (!escrito) {
        await expect(
          page.locator('[class*="avisoConversion"]').filter({ hasText: 'Documento Técnico B 2) sí' }),
          `${c.texto} (${c.apartado})`,
        ).toBeVisible();
      }
    }
    // Ningún aviso, de ningún carácter, saca ya una celda «fuera de la signografía básica»
    await page.goto(RUTA);
    await convertirHidratado(page, 'Ver 🙂 y ¥');
    await expect(avisoSinCelda(page)).toBeVisible();
    await expect(avisoSinCelda(page)).not.toContainText('fuera de la signografía');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3529 (inspector 26/10/2026) — § 7.2: una palabra en mayúsculas no es una sigla
  // ─────────────────────────────────────────────────────────────────────────
  //
  // NORMAS salía ⠨⠝⠨⠕⠨⠗⠨⠍⠨⠁⠨⠎, el recurso 1 de las SIGLAS (§ 7.1), sin decir nada. El B 2, literal:
  // «{el incumplimiento de estas }normas} es...»: ⠔ (35, § 9.1) abre y cierra, y la palabra va en
  // minúscula. Desde la tinta no se distingue una sigla («UNESCO») de un énfasis («NORMAS»), y el
  // § 9.1 desaconseja los signos cuando las mayúsculas son puramente estéticas: escribir ⠔…⠔ a
  // ciegas convertiría cada sigla larga en un énfasis. La reparación (27/10/2026) mantiene la sigla
  // y lo dice: el esperado del Inspector (la cadena del § 7.2) era una de las dos salidas que él
  // mismo dejó a la reparación. Lo que el test exige es que la palabra no salga como sigla SIN AVISO.
  test('REPARADO (3529) — § 7.2: «El incumplimiento de estas NORMAS es...» avisa de que se ha escrito como sigla', async ({ page }) => {
    // REPARADO, hallazgo 3529 (inspector 26/10/2026)
    await page.goto(RUTA);
    await convertirHidratado(page, 'El incumplimiento de estas NORMAS es...');
    await expect(cajaResultado(page)).toHaveText(
      '⠨⠑⠇⠀⠊⠝⠉⠥⠍⠏⠇⠊⠍⠊⠑⠝⠞⠕⠀⠙⠑⠀⠑⠎⠞⠁⠎⠀⠨⠝⠨⠕⠨⠗⠨⠍⠨⠁⠨⠎⠀⠑⠎⠄⠄⠄',
    );
    const aviso = page.locator('[class*="avisoConversion"]').filter({ hasText: 'como una sigla' });
    await expect(aviso.locator('strong')).toHaveText('NORMAS');
    await expect(aviso).toContainText('§ 7.2');
    // Una sigla corta («ONU») no lleva el aviso: ahí no hay duda razonable
    await page.goto(RUTA);
    await convertirHidratado(page, 'La ONU');
    await expect(page.locator('[class*="avisoConversion"]').filter({ hasText: 'como una sigla' })).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3530 (inspector 26/10/2026) — § 5.1: la é catalana tiene otra celda
  // ─────────────────────────────────────────────────────────────────────────
  //
  // En catalán y valenciano é = 123456 (⠿) y ó = 246 (⠪), mientras la ⠮ (2346) que escribe la app es la
  // è y la ⠬ (346) la ò. Con «València» la app sabe que el texto es catalán (avisa de la è) y escribía
  // «és» con la é del castellano, que un lector catalán lee «ès», sin decirlo. La reparación
  // (27/10/2026) la nombra en un aviso propio: la app no sabe en qué lengua está cada palabra.
  test('REPARADO (3530) — § 5.1: en «València és bonica» la é no sale con la celda de la è sin avisar', async ({ page }) => {
    // REPARADO, hallazgo 3530 (inspector 26/10/2026). Era: ⠨⠧⠁⠇⠝⠉⠊⠁⠀⠮⠎⠀⠃⠕⠝⠊⠉⠁ y el aviso solo nombraba la è.
    await page.goto(RUTA);
    await convertirHidratado(page, 'València és bonica');
    await expect(
      page.locator('[class*="avisoConversion"]').filter({ hasText: 'del catalán y el valenciano' }),
    ).toBeVisible(); // precondición: la app reconoce el catalán
    const resultado = await cajaResultado(page).innerText();
    const nombradas = (await page.locator('[class*="avisoConversion"] strong').allInnerTexts()).flatMap((t) =>
      t.split(' · '),
    );
    expect(resultado.includes('⠀⠿⠎⠀') || nombradas.includes('é')).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3524 (inspector 26/10/2026) — página traducida (cabo C0243): la app caía
  // ─────────────────────────────────────────────────────────────────────────
  //
  // El rótulo de la hoja era `{lineas === 0 ? <span>Convierte primero…</span> : <span>{n} línea… mm</span>}`:
  // dos <span> sin key, y el segundo con trece textos sueltos. React reutilizaba el <span> y, al volver a
  // la primera rama, retiraba esos textos con removeChild; el traductor ya los había cambiado por
  // <font>: NotFoundError y «Algo salió mal». Pasaba en cuanto la hoja se vaciaba: corregir el texto,
  // Limpiar, cambiar de sentido, un ejemplo o borrar la última celda del teclado.
  // `check:ternario-traducido` no lo ve: sus dos ramas son JSX. Ahora cada rama lleva su key y el
  // rótulo es un texto único.
  test('REPARADO (3524) — página traducida: corregir, Limpiar o cambiar de sentido tras convertir no tumba la app', async ({
    page,
  }) => {
    // REPARADO, hallazgo 3524 (inspector 26/10/2026)
    const errores = vigilarErrores(page);
    for (const accion of ['corregir', 'Limpiar', 'Braille → Texto', 'Saludo']) {
      await page.goto(RUTA);
      await convertirHidratado(page, 'hola');
      await expect(hojaAviso(page)).toHaveText('1 línea de 29 celdas · celda de 6 mm · 10 mm entre líneas'); // precondición
      await traducir(page);
      if (accion === 'corregir') await page.locator('textarea').first().fill('hola mundo');
      else await page.getByRole('button', { name: accion, exact: true }).click();
      await expect(hojaAviso(page)).toHaveText(
        'Convierte primero un texto: la hoja se genera con el resultado de arriba.',
        { timeout: 3000 },
      );
      await expect(page.getByText('Algo salió mal')).toHaveCount(0);
      expect(errores, accion).toEqual([]);
    }
  });

  // La misma forma en el teclado de seis puntos: «Escribir celda{marcados ? ` ⠁` : ''}». Al escribir
  // la celda, los puntos marcados se vaciaban y React retiraba el texto « ⠁» que el traductor ya
  // había cambiado. Ahora el rótulo del botón es un texto único.
  test('REPARADO (3524) — página traducida: «Escribir celda» con un punto marcado no tumba la app', async ({ page }) => {
    // REPARADO, hallazgo 3524 (inspector 26/10/2026)
    const errores = vigilarErrores(page);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByRole('button', { name: 'Punto 1', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Escribir celda/ })).toHaveText('Escribir celda ⠁'); // precondición
    await traducir(page);
    await page.getByRole('button', { name: /^Escribir celda/ }).click();
    // ⠁ (punto 1) es la «a»
    await expect(page.locator('textarea').first()).toHaveValue('⠁', { timeout: 3000 });
    await expect(cajaResultado(page)).toHaveText('a');
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3527 (inspector 26/10/2026) — página traducida: textos que se quedaban con el valor anterior
  // ─────────────────────────────────────────────────────────────────────────
  //
  // No caía: React escribía el texto nuevo en el nodo que el traductor retiró. Las medidas del rótulo
  // de la hoja, el número de los avisos de celdas sin texto y de tinta mezclada, y la celda del botón
  // «Escribir celda»: cada uno era un texto suelto junto a otros. Ahora cada parte variable es el
  // único hijo de su elemento.
  test('REPARADO (3527) — página traducida: la hoja con ADA, los avisos y «Escribir celda» dicen el valor nuevo', async ({
    page,
  }) => {
    // REPARADO, hallazgo 3527 (inspector 26/10/2026)
    // (a) ADA: ⌊(172 − 2,4 − 1,5) / 6,2⌋ + 1 = ⌊27,11⌋ + 1 = 28 celdas; 6,2 mm y 10,2 mm (lo fija el 3439).
    //     Era (26/10): seguía «1 línea de 29 celdas · celda de 6 mm · 10 mm entre líneas».
    await page.goto(RUTA);
    await convertirHidratado(page, 'hola');
    await traducir(page);
    await page.getByRole('button', { name: ADA }).click();
    await expect(page.getByRole('button', { name: ADA })).toHaveAttribute('aria-pressed', 'true'); // precondición
    await expect(hojaAviso(page)).toHaveText('1 línea de 28 celdas · celda de 6,2 mm · 10,2 mm entre líneas', {
      timeout: 3000,
    });

    // (b) Teclado: ⠿ (123456) y, con la página ya traducida, ⠫ (1246): dos celdas sin equivalente.
    //     Era (26/10): «Esta celda no tiene … ha pasado … ⠿ ⠫».
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    for (const p of [1, 2, 3, 4, 5, 6]) await page.getByRole('button', { name: `Punto ${p}`, exact: true }).click();
    await page.getByRole('button', { name: /^Escribir celda/ }).click();
    const avisoCeldas = page.locator('[class*="avisoConversion"]').filter({ hasText: 'equivalente' });
    await expect(avisoCeldas).toContainText('Esta celda no tiene'); // precondición
    await traducir(page);
    for (const p of [1, 2, 4, 6]) await page.getByRole('button', { name: `Punto ${p}`, exact: true }).click();
    await page.getByRole('button', { name: /^Escribir celda/ }).click();
    await expect(avisoCeldas.locator('strong')).toHaveText('⠿ ⠫'); // precondición: el <strong> sí cambia
    await expect(avisoCeldas).toContainText('Estas celdas no tienen', { timeout: 3000 });
    await expect(avisoCeldas).toContainText('han pasado al resultado sin traducir');

    // (c) «a⠁b» en Braille → Texto y «Borrar última»: queda una sola letra en tinta, la «a».
    //     Era (26/10): «a han pasado … y no salen en la hoja».
    await page.goto(RUTA);
    await convertirHidratado(page, 'a⠁b', 'braille');
    const avisoTinta = page.locator('[class*="avisoConversion"]').filter({ hasText: 'mezcla celdas braille' });
    await expect(avisoTinta).toContainText('han pasado'); // precondición: a · b
    await traducir(page);
    await page.getByRole('button', { name: 'Borrar última', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('aa'); // precondición: «a» en tinta + ⠁
    await expect(avisoTinta).toContainText('ha pasado al resultado tal cual', { timeout: 3000 });
    await expect(avisoTinta).toContainText('no sale en la hoja');

    // (d) El botón dice la celda que se va a escribir: punto 1, traducir, punto 2 → ⠃ (1-2). Era (26/10): «⠁».
    await page.goto(RUTA);
    await esperarHidratacion(page, ['textarea']);
    await page.getByRole('button', { name: 'Braille → Texto' }).click();
    await page.getByRole('button', { name: 'Punto 1', exact: true }).click();
    await traducir(page);
    await page.getByRole('button', { name: 'Punto 2', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Escribir celda/ })).toHaveText('Escribir celda ⠃', {
      timeout: 3000,
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO, hallazgo 3531 (inspector 26/10/2026) — la guía: la primera década y el punto 3 no dan el 90 %
  // ─────────────────────────────────────────────────────────────────────────
  test('REPARADO (3531) — guía: «10 celdas + añadir el punto 3» dan 20 de las 27 letras, no el 90 %', async ({ page }) => {
    // REPARADO, hallazgo 3531 (inspector 26/10/2026). El B 2 § 4 tiene 27 letras (a-z con la w, y la ñ);
    // la primera década (a-j) y la segunda (k-t, «añadir punto 3») son 20: 20 / 27 = 74 %. Con las
    // seis vocales con diacrítico, 20 / 33 = 61 %. Era: «te da el 90 % del alfabeto casi gratis».
    await page.goto(RUTA);
    const consejo = await page.evaluate(
      () =>
        [...document.querySelectorAll('[class*="eduTipCard"]')]
          .find((c) => (c.querySelector('h4')?.textContent ?? '').includes('primera década'))
          ?.querySelector('p')?.textContent ?? '',
    );
    expect(consejo).toContain('añadir punto 3'); // precondición: se leyó el consejo
    const porcentaje = /(\d+)\s%/.exec(consejo.replace(/ /g, ' '));
    expect(porcentaje === null || Number(porcentaje[1]) === 74).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// re-inspección 27/10/2026 — tras e6bcbe53 (página traducida: 3524, 3527) y aa75156d (3525-3531)
// ═════════════════════════════════════════════════════════════════════════════
//
// FUENTE: el B 2 (V4, mayo de 2025, última actualización 22/01/2026), descargado de once.es y leído
// con un extractor de texto del PDF (FlateDecode + ToUnicode). Su fuente braille escribe las celdas
// con caracteres ASCII: el orden de las series del § 3 da la tabla (p. ej. «#» = 3456, «{» = 46,
// «_» = 6, «@» = 5, «%» = 456, «}» = 35, «+» = 235). Citas que usa este bloque, literales:
//   § 8.1  «Cuando se representan números de teléfono, se transcriben sin espacios en blanco, sin
//          puntos de abreviatura ni guiones, salvo que aparezcan prefijos específicos.» Ejemplos:
//          «999 999 999 → #iiiiiiiii» · «+49 900 000 000 → +#di#ijjjjjjjj» ·
//          «49-900 000 000 → #di#ijjjjjjjj» · «647.234.345 → #fdgbcdcde».
//   § 8.1  «Como separador decimal se utiliza el punto 2 […] independientemente de que en el
//          original aparezca un punto o un apóstrofo.» Ejemplo: «73,81 73.81 73’81 → #gc,ha».
//   § 8.1  «Si en el original no aparece ningún tipo de separación, se escribirán todas las cifras
//          juntas: 501439678 → #ejadcifgh».
//   § 8.2  «8b → #h@b» · «234ae → #bcd@a@e» · «234a5 → #bcd@ae».
//   § 7.1  «Al transcribir estos textos al braille no debe escribirse este signo de punto después de
//          cada una de las letras que forman la sigla, aunque aparezca así en el original.»
//          Ejemplo: «O.N.U. → {o{n{u».
//   § 8.5  «para su transcripción en braille bastará con utilizar el prefijo de mayúscula 46
//          solamente al comienzo del número.» Ejemplos: «M VIII → {m {viii».
//   § 9.1  «el signo 35 para la apertura y cierre» (lo que dice el aviso del 3529: ⠔ = 35).
//   § 14.3 «Son las 18:56 → {son las #ah:#ef».
//   § 6.2, § 12, § 12.1, § 13 y § 14.1: celdas de { 5-123, } 456-2, \ 5-3, | 456-0d, + 235,
//          = 2356, @ 5, & 6-12346, § 346, $ 456-234, £ 5-2346, ¥ 456-13456, ° 356.
//
// LO QUE SE SOSTIENE: 3526 («10 000» y «501 439 678» con el punto 3; «999 999 999» sin blancos y con
// aviso), 3525 (aviso del B 2 para € % — [ ] *), 3528 (ocho puntos, en los dos sentidos), 3529
// (aviso de sigla), 3530 (é catalana en «València és bonica») y 3531. Con la página TRADUCIDA (el
// traductor simulado y el detector de texto viejo de generador-loteria.spec.ts) la app entera —los
// dos sentidos, los avisos nuevos de aa75156d en singular y en plural, ejemplos, teclado de seis
// puntos, hoja con sus cuatro controles, ⇄, guía y aviso legal— no cae ni deja texto viejo, a 1280
// y a 390 px, y la página no desborda.
//
// ABIERTOS (test.fail): teléfonos con prefijo, guion o puntos (la regla de millar de aa75156d hace
// de «+49 900 000 000» la cantidad 49.900.000.000), decimal con punto o apóstrofo, siglas con
// puntos, números romanos llamados «sigla» por el aviso nuevo, signos del B 2 con el aviso «puede
// que», y del cabo C0238 la (f) (moneda de 2 €, sin fuente) y la (g) (árabe de derecha a izquierda,
// que la propia guía contradice).
test.describe('re-inspección 27/10/2026', () => {
  async function convertir27(page: Page, texto: string, modo: 'texto' | 'braille' = 'texto') {
    await esperarHidratacion(page, ['textarea']);
    if (modo === 'braille') await page.getByRole('button', { name: 'Braille → Texto' }).click();
    const textarea = page.locator('textarea').first();
    await textarea.fill(texto);
    await esperarValorEnReact(page, textarea, texto);
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
  }

  /** Texto de la caja de resultado ('' si no hay caja), cuando ya hay resultado o aviso en pantalla. */
  const resultado27 = async (page: Page) => {
    await page.locator('[class*="resultBox"], [class*="avisoConversion"]').first().waitFor();
    const caja = page.locator('[class*="resultBox"]');
    return (await caja.count()) > 0 ? ((await caja.textContent()) ?? '') : '';
  };

  const aviso27 = (page: Page, texto: string) =>
    page.locator('[class*="avisoConversion"]').filter({ hasText: texto });

  /** Puntos en relieve de la hoja, línea a línea y celda a celda (Marburg: 6 mm · 10 mm · 2,5 mm). */
  async function hoja27(page: Page): Promise<string[][]> {
    return page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find((s) =>
        (s.getAttribute('aria-label') || '').includes('escala real'),
      );
      if (!svg) return [];
      const lineas = new Map<number, Map<number, number[]>>();
      [...svg.querySelectorAll('circle')].forEach((c) => {
        const cx = parseFloat(c.getAttribute('cx') || '0');
        const cy = parseFloat(c.getAttribute('cy') || '0');
        const linea = Math.floor(cy / 10);
        const celda = Math.floor(cx / 6);
        if (!lineas.has(linea)) lineas.set(linea, new Map());
        const l = lineas.get(linea)!;
        if (!l.has(celda)) l.set(celda, []);
        if (c.getAttribute('fill') !== '#000000') return; // los grises son la retícula guía
        const columna = Math.round((cx - celda * 6 - 0.75) / 2.5);
        const fila = Math.round((cy - linea * 10 - 0.75) / 2.5);
        l.get(celda)!.push(columna * 3 + fila + 1);
      });
      return [...lineas.keys()]
        .sort((a, b) => a - b)
        .map((k) => {
          const l = lineas.get(k)!;
          const max = Math.max(...l.keys());
          return Array.from({ length: max + 1 }, (_, i) => (l.get(i) ?? []).sort((a, b) => a - b).join('-'));
        });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 1 (normal) — sigla, millar con blanco (normal y U+00A0), punto final; hoja de dos líneas
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 1 (normal) — «La ONCE reparte 1 250 000 cupones.»: cadena, aviso de sigla, hoja y vuelta', async ({ page }) => {
    // Derivación a mano con el B 2:
    //   'L' → ⠨ (46, § 7) ⠇ (123) · 'a' ⠁ · ⠀
    //   'ONCE' → ⠨⠕ ⠨⠝ ⠨⠉ ⠨⠑ (§ 7.1, recurso 1, «ONCE → {o{n{c{e») · ⠀
    //   'reparte' → ⠗ (1235) ⠑ (15) ⠏ (1234) ⠁ ⠗ ⠞ (2345) ⠑ · ⠀
    //   '1 250 000' → ⠼ (3456) ⠁ · ⠄ (punto 3 de millar, § 8.1) ⠃ ⠑ ⠚ · ⠄ ⠚ ⠚ ⠚ · ⠀
    //   'cupones' → ⠉ (14) ⠥ (136) ⠏ ⠕ (135) ⠝ (1345) ⠑ ⠎ (234) · '.' → ⠄ (3, § 6.1)
    const esperado = '⠨⠇⠁⠀⠨⠕⠨⠝⠨⠉⠨⠑⠀⠗⠑⠏⠁⠗⠞⠑⠀⠼⠁⠄⠃⠑⠚⠄⠚⠚⠚⠀⠉⠥⠏⠕⠝⠑⠎⠄';
    for (const texto of ['La ONCE reparte 1 250 000 cupones.', 'La ONCE reparte 1 250 000 cupones.']) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      await expect(cajaResultado(page)).toHaveText(esperado);
      // Cuatro mayúsculas: el aviso del 3529 la nombra y da el signo 35 del § 9.1
      await expect(aviso27(page, 'como una sigla').locator('strong')).toHaveText('ONCE');
      await expect(aviso27(page, 'como una sigla')).toContainText('(⠔ al abrir y al cerrar)');
      await expect(aviso27(page, 'Esta herramienta no escribe')).toHaveCount(0);
      await expect(aviso27(page, 'teléfono')).toHaveCount(0);
    }
    // Hoja (29 celdas por línea con Marburg): 3 + 1 + 8 + 1 + 7 = 20, y la palabra de 10 celdas del
    // número no cabe en las 8 que quedan (29 − 20 − 1): baja a la segunda línea con «cupones.» (19).
    expect(await hoja27(page)).toEqual([
      [
        '4-6', '1-2-3', '1', '',
        '4-6', '1-3-5', '4-6', '1-3-4-5', '4-6', '1-4', '4-6', '1-5', '',
        '1-2-3-5', '1-5', '1-2-3-4', '1', '1-2-3-5', '2-3-4-5', '1-5',
      ],
      [
        '3-4-5-6', '1', '3', '1-2', '1-5', '2-4-5', '3', '2-4-5', '2-4-5', '2-4-5', '',
        '1-4', '1-3-6', '1-2-3-4', '1-3-5', '1-3-4-5', '1-5', '2-3-4', '3',
      ],
    ]);
    await expect(page.locator('[class*="hojaAviso"]')).toHaveText('2 líneas de 29 celdas · celda de 6 mm · 10 mm entre líneas');
    // Vuelta: el punto 3 entre cifras es el separador de millar (§ 8.1), así que vuelve como punto
    await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
    await page.getByRole('button', { name: 'Convertir', exact: true }).click();
    await expect(cajaResultado(page)).toHaveText('La ONCE reparte 1.250.000 cupones.');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 2 (límite) — los ejemplos literales del § 8.1, § 8.2 y § 14.3 que la app ya cumple
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 2 (límite) — ejemplos literales del B 2: «999 999 999», «501439678», «8b», «234ae», «234a5», «18:56»', async ({ page }) => {
    const casos: Array<[string, string, string]> = [
      ['999 999 999', '⠼⠊⠊⠊⠊⠊⠊⠊⠊⠊', '§ 8.1 «#iiiiiiiii»'],
      ['501 439 678', '⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓', '§ 8.1 «#eja.dci.fgh»'],
      ['501439678', '⠼⠑⠚⠁⠙⠉⠊⠋⠛⠓', '§ 8.1 «#ejadcifgh»'],
      ['10 000,5', '⠼⠁⠚⠄⠚⠚⠚⠂⠑', '§ 8.1: punto 3 de millar y punto 2 decimal, un solo ⠼'],
      ['8b', '⠼⠓⠐⠃', '§ 8.2 «#h@b»'],
      ['234ae', '⠼⠃⠉⠙⠐⠁⠐⠑', '§ 8.2 «#bcd@a@e»'],
      ['234a5', '⠼⠃⠉⠙⠐⠁⠑', '§ 8.2 «#bcd@ae»'],
      ['Son las 18:56', '⠨⠎⠕⠝⠀⠇⠁⠎⠀⠼⠁⠓⠒⠼⠑⠋', '§ 14.3 «{son las #ah:#ef»'],
    ];
    for (const [texto, celdas, fuente] of casos) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      await expect(cajaResultado(page), `${texto} (${fuente})`).toHaveText(celdas);
    }
    // El teléfono del § 8.1 se nombra en su aviso (hallazgo 3526)
    await page.goto(RUTA);
    await convertir27(page, '999 999 999');
    await expect(aviso27(page, 'como un número de teléfono').locator('strong')).toHaveText('999 999 999');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CASO 3 (rechazo) — solo signos que la app no escribe, y una caja de solo indicadores
  // ─────────────────────────────────────────────────────────────────────────
  test('CASO 3 (rechazo) — «€ % — [ ] *» no da celdas ni hoja y los nombra el aviso del B 2; «⠼» solo no da texto', async ({ page }) => {
    await page.goto(RUTA);
    await convertir27(page, '€ % — [ ] *');
    // Los seis signos se omiten (3525): quedan las cinco separaciones de palabra
    await expect(cajaResultado(page)).toHaveText('⠀⠀⠀⠀⠀');
    await expect(aviso27(page, 'Documento Técnico B 2) sí les da celda').locator('strong')).toHaveText('€ · % · — · [ · ] · *');
    await expect(aviso27(page, 'Esta herramienta no escribe en braille')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Imprimir la hoja/ })).toBeDisabled();
    await expect(page.locator('[class*="hojaAviso"]')).toHaveText(
      'Convierte primero un texto: la hoja se genera con el resultado de arriba.',
    );
    // Braille → Texto con solo el signo de número: no hay cifra detrás, no hay texto que dar
    await page.goto(RUTA);
    await convertir27(page, '⠼', 'braille');
    await expect(page.locator('[class*="resultBox"]')).toHaveCount(0);
    await expect(aviso27(page, 'La conversión no ha dado ningún resultado')).toContainText(
      'en la caja no hay nada que se pueda escribir con esta herramienta',
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO 3552 — teléfonos del § 8.1 con prefijo, guion o puntos, y el fijo en grupos 2-3-2-2
  // ─────────────────────────────────────────────────────────────────────────
  //
  // aa75156d (3526) solo reconoce como teléfono nueve cifras en tres grupos de tres con blancos que
  // empiezan por 6-9. Cualquier otro teléfono cae en la regla de millar nueva: el ejemplo LITERAL del
  // § 8.1 «+49 900 000 000» sale ⠼⠙⠊⠄⠊⠚⠚⠄⠚⠚⠚⠄⠚⠚⠚, la cantidad 49.900.000.000, sin aviso de teléfono
  // (antes de aa75156d salían cuatro números separados, tampoco el B 2, pero no una cantidad); igual
  // «+34 600 123 456» → 34.600.123.456 y «91 123 45 67» → ⠼⠊⠁⠄⠁⠃⠉⠀⠼⠙⠑⠀⠼⠋⠛ («91.123 45 67»). El
  // guion de «49-900 000 000» se queda (⠤) y «647.234.345» sale con sus puntos sin decir nada. El +
  // (235, § 12) no lo escribe la app (ampliar la tabla es decisión del usuario): se admite sin él.
  // REPARADO el 27/10/2026 (hallazgo 3552): blancosEntreCifras() reconoce el prefijo con + o con
  // guion (el resto lleva su propio ⠼) y los grupos 2-3-2-2 y 3-2-2-2; «647.234.345» se queda como
  // cantidad, que es como se escribe una en español, con un aviso de que podría ser un teléfono.
  test('REPARADO 3552 — teléfonos del § 8.1: «+49 900 000 000» no es la cantidad 49.900.000.000', async ({ page }) => {
    const casos: Array<[string, string[]]> = [
      // «+49 900 000 000 → +#di#ijjjjjjjj»: ⠖ (+) · ⠼ 4 9 · ⠼ 9 0 0 0 0 0 0 0 0
      ['+49 900 000 000', ['⠖⠼⠙⠊⠼⠊⠚⠚⠚⠚⠚⠚⠚⠚', '⠼⠙⠊⠼⠊⠚⠚⠚⠚⠚⠚⠚⠚']],
      // «49-900 000 000 → #di#ijjjjjjjj»: sin el guion
      ['49-900 000 000', ['⠼⠙⠊⠼⠊⠚⠚⠚⠚⠚⠚⠚⠚']],
      // El de España, por la misma regla: ⠖ · ⠼ 3 4 · ⠼ 6 0 0 1 2 3 4 5 6
      ['+34 600 123 456', ['⠖⠼⠉⠙⠼⠋⠚⠚⠁⠃⠉⠙⠑⠋', '⠼⠉⠙⠼⠋⠚⠚⠁⠃⠉⠙⠑⠋']],
      // Fijo en grupos 2-3-2-2 (no es cantidad: los grupos de millar son de tres): todas juntas
      ['91 123 45 67', ['⠼⠊⠁⠁⠃⠉⠙⠑⠋⠛']],
    ];
    const fallos: string[] = [];
    for (const [texto, validos] of casos) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      const r = await resultado27(page);
      if (!validos.includes(r)) fallos.push(`${texto} → ${r}`);
    }
    // «647.234.345 → #fdgbcdcde»: desde la tinta no se distingue de una cantidad, así que vale
    // también la cantidad si un aviso dice que podría ser un teléfono
    await page.goto(RUTA);
    await convertir27(page, '647.234.345');
    const r647 = await resultado27(page);
    if (r647 !== '⠼⠋⠙⠛⠃⠉⠙⠉⠙⠑' && (await aviso27(page, '647').count()) === 0) fallos.push(`647.234.345 → ${r647}`);
    // Era: +49 → ⠼⠙⠊⠄⠊⠚⠚⠄⠚⠚⠚⠄⠚⠚⠚ · 49- → ⠼⠙⠊⠤⠼⠊⠚⠚⠚⠚⠚⠚⠚⠚ · +34 → ⠼⠉⠙⠄⠋⠚⠚⠄⠁⠃⠉⠄⠙⠑⠋ ·
    //      91 → ⠼⠊⠁⠄⠁⠃⠉⠀⠼⠙⠑⠀⠼⠋⠛ · 647 → ⠼⠋⠙⠛⠄⠃⠉⠙⠄⠉⠙⠑ sin aviso
    expect(fallos).toEqual([]);
    // El teléfono con prefijo se nombra en su aviso, con el + de la tinta
    await page.goto(RUTA);
    await convertir27(page, '+49 900 000 000');
    await expect(aviso27(page, 'como un número de teléfono').locator('strong')).toHaveText('+49 900 000 000');
    // Lo que no es teléfono no cambia: un intervalo con guion, una fecha y una cantidad con + de seis cifras
    const noTelefonos: Array<[string, string]> = [
      ['10-20', '⠼⠁⠚⠤⠼⠃⠚'],
      ['5-1 000', '⠼⠑⠤⠼⠁⠄⠚⠚⠚'],
      ['12-10-2026', '⠼⠁⠃⠤⠼⠁⠚⠤⠼⠃⠚⠃⠋'],
      ['+1 000 000', '⠼⠁⠄⠚⠚⠚⠄⠚⠚⠚'],
    ];
    for (const [texto, celdas] of noTelefonos) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      await expect(cajaResultado(page), texto).toHaveText(celdas);
      await expect(aviso27(page, 'teléfono'), texto).toHaveCount(0);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ABIERTO — § 8.1: el separador decimal es el punto 2 aunque la tinta traiga punto o apóstrofo
  // ─────────────────────────────────────────────────────────────────────────
  //
  // «73.81» sale ⠼⠛⠉⠄⠓⠁: el punto 3 dentro de un número es el separador de MILLAR (§ 6.1 y § 8.1), y
  // un grupo de millar tiene tres cifras, así que el lector no tiene forma de leer 73,81. «73’81» (el
  // apóstrofo decimal de los rótulos a mano) sale ⠼⠛⠉⠼⠓⠁, dos números, con el aviso de comillas
  // simples. El ejemplo literal da la misma celda para las tres grafías. Ojo: «Son las 18.56» es otro
  // caso del B 2 (§ 14.3: «{son las #ah.#ef», punto 3 y signo de número otra vez), y la app tampoco
  // lo da (⠼⠁⠓⠄⠑⠋): desde la tinta no se distingue de un decimal, así que no se exige aquí.
  // REPARADO el 27/10/2026 (hallazgo 3553): esSeparadorDecimal() da el punto 2 al punto entre
  // cifras que no abre un grupo de tres y al apóstrofo entre cifras. El millar sigue con punto 3.
  test('REPARADO 3553 — § 8.1: «73.81» y «73’81» dan la coma decimal del ejemplo literal (#gc,ha)', async ({ page }) => {
    const fallos: string[] = [];
    for (const texto of ['73.81', '73’81', "73'81"]) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      // ⠼ (3456) · 7 ⠛ · 3 ⠉ · ⠂ (punto 2, decimal) · 8 ⠓ · 1 ⠁
      const r = await resultado27(page);
      if (r !== '⠼⠛⠉⠂⠓⠁') fallos.push(`${texto} → ${r}`);
    }
    // El millar del mismo apartado («501.439.678 → #eja.dci.fgh») no cambia
    await page.goto(RUTA);
    await convertir27(page, '501.439.678');
    const millar = await resultado27(page);
    if (millar !== '⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓') fallos.push(`501.439.678 → ${millar}`);
    expect(fallos).toEqual([]);
    // Y el apóstrofo decimal no saca el aviso de comillas simples
    await page.goto(RUTA);
    await convertir27(page, '73’81');
    await expect(page.getByText(/comillas simples/i)).toHaveCount(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO 3554 — § 7.1: las siglas con puntos se escriben sin ellos
  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO el 27/10/2026: puntosDeSigla() retira el punto que sigue a cada mayúscula de una serie
  // de dos o más. Una abreviatura («EE. UU.») o una inicial suelta («J. Pérez») conservan el suyo.
  test('REPARADO 3554 — § 7.1: «O.N.U.» se escribe ⠨⠕⠨⠝⠨⠥, sin los puntos de la tinta', async ({ page }) => {
    await page.goto(RUTA);
    await convertir27(page, 'O.N.U.');
    // «O.N.U. → {o{n{u»: ⠨ (46) ⠕ (135) · ⠨ ⠝ (1345) · ⠨ ⠥ (136). Era: ⠨⠕⠄⠨⠝⠄⠨⠥⠄
    await expect(cajaResultado(page)).toHaveText('⠨⠕⠨⠝⠨⠥', { timeout: 3000 });
    const casos: Array<[string, string]> = [
      // l ⠇ · a ⠁ · ⠀ · O.N.U. sin puntos · ⠀ · a ⠁ p ⠏ r ⠗ o ⠕ b ⠃ ó ⠬
      ['La O.N.U. aprobó', '⠨⠇⠁⠀⠨⠕⠨⠝⠨⠥⠀⠁⠏⠗⠕⠃⠬'],
      // Inicial suelta: su punto se queda (punto 3, § 6.1)
      ['J. Pérez', '⠨⠚⠄⠀⠨⠏⠮⠗⠑⠵'],
    ];
    for (const [texto, celdas] of casos) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      await expect(cajaResultado(page), texto).toHaveText(celdas);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO 3555 — § 8.5: un número romano no es una sigla, y el aviso del 3529 lo llamaba así
  // ─────────────────────────────────────────────────────────────────────────
  //
  // El § 8.5 escribe el signo de mayúscula solo al comienzo del número («VIII → {viii»). La app ponía
  // uno delante de cada letra y, desde aa75156d, el aviso de cuatro o más mayúsculas decía que «XVIII
  // se ha escrito como una sigla» y ofrecía la lectura de énfasis del § 7.2. Vale la celda del § 8.5,
  // o que el aviso no lo llame sigla y cite el § 8.5.
  // REPARADO el 27/10/2026: numerosRomanos() da un solo ⠨ al romano bien formado de dos o más letras
  // (salvo siglas corrientes que también lo son, como «CV»), con su propio aviso del § 8.5.
  test('REPARADO 3555 — § 8.5: «VIII» y «siglo XVIII» llevan la mayúscula solo al principio, o el aviso no los llama sigla', async ({ page }) => {
    const casos: Array<[string, string, string]> = [
      // ⠨ (46) · v ⠧ (1236) · i ⠊ (24) ×3. Hoy: ⠨⠧⠨⠊⠨⠊⠨⠊
      ['VIII', '⠨⠧⠊⠊⠊', 'VIII'],
      // s ⠎ i ⠊ g ⠛ l ⠇ o ⠕ · ⠀ · ⠨ · x ⠭ (1346) · v ⠧ · i ⠊ ×3. Hoy: ⠎⠊⠛⠇⠕⠀⠨⠭⠨⠧⠨⠊⠨⠊⠨⠊
      ['siglo XVIII', '⠎⠊⠛⠇⠕⠀⠨⠭⠧⠊⠊⠊', 'XVIII'],
    ];
    const fallos: string[] = [];
    for (const [texto, celdas, numeral] of casos) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      await expect(cajaResultado(page)).toBeVisible(); // precondición: hay resultado
      const r = await resultado27(page);
      const sigla = aviso27(page, 'como una sigla');
      const llamadaSigla =
        (await sigla.count()) > 0 && ((await sigla.locator('strong').textContent()) ?? '').split(' · ').includes(numeral);
      const citaRomanos = (await aviso27(page, '§ 8.5').count()) > 0;
      if (r !== celdas && (llamadaSigla || !citaRomanos)) fallos.push(`${texto} → ${r}${llamadaSigla ? ' y «sigla»' : ''}`);
    }
    expect(fallos).toEqual([]);
    // «MCMXC» (1990): ⠨ m ⠍ (134) · c ⠉ (14) · m ⠍ · x ⠭ (1346) · c ⠉, un solo signo y el aviso del § 8.5
    await page.goto(RUTA);
    await convertir27(page, 'MCMXC');
    await expect(cajaResultado(page)).toHaveText('⠨⠍⠉⠍⠭⠉');
    await expect(aviso27(page, '§ 8.5').locator('strong')).toHaveText('MCMXC');
    await expect(aviso27(page, 'como una sigla')).toHaveCount(0);
    // Lo que no es romano, o es una sigla corriente que lo parece, sigue letra a letra (§ 7.1)
    const siglas: Array<[string, string]> = [
      ['ONCE', '⠨⠕⠨⠝⠨⠉⠨⠑'],
      ['CV', '⠨⠉⠨⠧'],
      // «IIII» no es un romano bien formado (es IV)
      ['IIII', '⠨⠊⠨⠊⠨⠊⠨⠊'],
    ];
    for (const [texto, celdas] of siglas) {
      await page.goto(RUTA);
      await convertir27(page, texto);
      await expect(cajaResultado(page), texto).toHaveText(celdas);
      await expect(aviso27(page, '§ 8.5'), texto).toHaveCount(0);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPARADO 3556 — signos con celda en el B 2 que seguían con el aviso «puede que» (lo que 3525 no cubrió)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // aa75156d dio aviso propio a los seis signos citados en el 3525 (€ % — [ ] *). Los demás que el
  // B 2 recoge en las mismas tablas siguen con el genérico: «Puede que el Código Braille Español sí
  // les asigne celda», cuando la fuente que la app dice seguir se la asigna. Celdas (§ 6.2, § 12,
  // § 12.1, § 13, § 14.1): { 5-123 · } 456-2 · \ 5-3 · | 456-0d · + 235 · = 2356 · @ 5 · & 6-12346 ·
  // § 346 · $ 456-234 · £ 5-2346 · ¥ 456-13456 · ° 356.
  // REPARADO el 27/10/2026: los trece están en SIGNOS_DEL_B2_SIN_ESCRIBIR y llevan el aviso del €.
  test('REPARADO 3556 — $ £ ¥ + = @ & ° { } \\ | §: el B 2 les da celda y el aviso no lo pone en duda', async ({ page }) => {
    await page.goto(RUTA);
    await convertir27(page, '$ £ ¥ + = @ & ° { } \\ | §');
    await expect(cajaResultado(page)).toBeVisible(); // precondición: hay resultado (las separaciones)
    // Era: «Esta herramienta no escribe en braille estos caracteres: $ · £ · … Puede que el Código
    // Braille Español sí les asigne celda: esta app no la escribe.»
    await expect(aviso27(page, 'Puede que el Código Braille Español')).toHaveCount(0, { timeout: 3000 });
    await expect(aviso27(page, 'Documento Técnico B 2) sí les da celda').locator('strong')).toHaveText(
      '$ · £ · ¥ · + · = · @ · & · ° · { · } · \\ · | · §',
    );
    // Un carácter del que la signografía básica no da celda sigue con el aviso genérico
    await page.goto(RUTA);
    await convertir27(page, 'sol 🙂');
    await expect(aviso27(page, 'Puede que el Código Braille Español')).toHaveCount(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ABIERTO — cabo C0238 (f): la moneda de 2 € «desde 2022», sin fuente
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Regla 1 de neutralidad (CLAUDE.md §1.quinquies), la forma de 3441, 3457 y 3458: una afirmación
  // fechada sin fuente. El 27/10/2026 el buscador de boe.es siguió rechazando la consulta por URL
  // («Los valores de búsqueda enviados son incorrectos») y EUR-Lex devolvió la página vacía.
  test.fail('ABIERTO — C0238 (f): «el 2 € tiene el valor en Braille desde 2022» lleva fuente o no se afirma', async ({ page }) => {
    await page.goto(RUTA);
    const parrafo = await page.evaluate(
      () =>
        [...document.querySelectorAll('[class*="eduEscenarioCard"]')]
          .find((c) => (c.querySelector('h4')?.textContent ?? '').includes('Señalización'))
          ?.querySelector('p')?.textContent ?? '',
    );
    expect(parrafo).toContain('ascensores'); // precondición: se leyó la tarjeta
    const afirma = /desde 2022/.test(parrafo);
    const conFuente = /BOE|Reglamento|Orden|Diario Oficial|DOUE/.test(parrafo);
    expect(!afirma || conFuente).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ABIERTO — cabo C0238 (g): el árabe de derecha a izquierda, contra la propia guía
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Sin fuente en once.es (la página del B 12 no lo dice; el B 12-3 trata la transliteración). Pero
  // la propia app, en el paso 5 de la guía, dice del braille sin distinguir lengua que «la mano
  // derecha lee el final de la línea mientras la izquierda ya busca el inicio de la siguiente» y que
  // «los lectores expertos mueven los dedos de izquierda a derecha»: con la FAQ, no pueden ser
  // ciertas a la vez.
  test.fail('ABIERTO — C0238 (g): la FAQ del árabe «de derecha a izquierda» y el paso 5 «de izquierda a derecha» no se contradicen', async ({ page }) => {
    await page.goto(RUTA);
    const textos = await page.evaluate(() => {
      const de = (sel: string, titulo: string) =>
        [...document.querySelectorAll(sel)]
          .find((c) => (c.querySelector('h4')?.textContent ?? '').includes(titulo))
          ?.querySelector('p')?.textContent ?? '';
      return {
        faq: de('[class*="eduFaqItem"]', '¿Es el Braille igual en todos los idiomas?'),
        paso5: de('[class*="eduStepItem"]', 'La lectura táctil'),
      };
    });
    expect(textos.faq).toContain('japonés'); // precondición: se leyó la FAQ
    expect(textos.paso5).toContain('yemas'); // precondición: se leyó el paso 5
    const arabeDerechaIzquierda = /árabe[^.]*derecha a izquierda/i.test(textos.faq);
    const pasoUniversal = /de izquierda a derecha/.test(textos.paso5) && !/español|latin|árabe/i.test(textos.paso5);
    expect(arabeDerechaIzquierda && pasoUniversal).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Página traducida — la app ENTERA, a escritorio (e6bcbe53 y los avisos nuevos de aa75156d)
  // ─────────────────────────────────────────────────────────────────────────
  test('página traducida — la app entera no cae ni deja texto viejo (escritorio)', async ({ page }) => {
    test.setTimeout(180_000);
    const r = await recorridoTraducido27(page, true);
    expect(r.control, 'control positivo del detector').toHaveLength(1);
    expect(r.viejos).toEqual([]);
    expect(r.caidas).toEqual([]);
    expect(r.errores).toEqual([]);
    expect(r.desbordes).toEqual([]);
  });
});

test.describe('re-inspección 27/10/2026 — página traducida a 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('página traducida — la app entera no cae, no deja texto viejo ni desborda a 390 px', async ({ page }) => {
    test.setTimeout(180_000);
    const r = await recorridoTraducido27(page, false);
    expect(r.control, 'control positivo del detector').toHaveLength(1);
    expect(r.viejos).toEqual([]);
    expect(r.caidas).toEqual([]);
    expect(r.errores).toEqual([]);
    expect(r.desbordes).toEqual([]);
  });
});

interface NodoTraducido27 {
  nodo: Text;
  valor: string | null;
  avisado: boolean;
}
type VentanaTraducida27 = Window & { __nodosTraducidos27?: NodoTraducido27[] };

/**
 * Recorre la app entera con la página traducida (receta de generador-loteria.spec.ts, bloque del
 * 15/10/2026): antes de cada paso el traductor simulado cambia cada nodo de texto por
 * <font><font>…</font></font> y APUNTA el nodo con su valor; después, un nodo apuntado cuyo valor ha
 * cambiado es un texto que React escribió donde ya no se ve (texto viejo). Devuelve también los
 * errores de React, las caídas a «Algo salió mal», los desbordes horizontales y un control
 * positivo sintético del detector.
 */
async function recorridoTraducido27(page: Page, conTecladoFisico: boolean) {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
  });
  const traducir = () =>
    page.evaluate(() => {
      const w = window as VentanaTraducida27;
      const apuntados = (w.__nodosTraducidos27 = w.__nodosTraducidos27 ?? []);
      const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const padre = n.parentElement;
          if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
          if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT|TEXTAREA)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodos: Text[] = [];
      while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
      for (const nodo of nodos) {
        const exterior = document.createElement('font');
        const interior = document.createElement('font');
        interior.textContent = nodo.nodeValue;
        exterior.appendChild(interior);
        apuntados.push({ nodo, valor: nodo.nodeValue, avisado: false });
        nodo.parentNode?.replaceChild(exterior, nodo);
      }
    });
  const textoViejo = () =>
    page.evaluate(() => {
      const r: string[] = [];
      for (const t of (window as VentanaTraducida27).__nodosTraducidos27 ?? []) {
        if (!t.avisado && t.nodo.nodeValue !== t.valor) {
          t.avisado = true;
          r.push(`«${t.valor}» → «${t.nodo.nodeValue}»`);
        }
      }
      return r;
    });

  const viejos: string[] = [];
  const caidas: string[] = [];
  const desbordes: string[] = [];
  const paso = async (nombre: string, accion: () => Promise<void>) => {
    await traducir();
    await accion();
    await page.waitForTimeout(150); // el commit de React tras la acción
    for (const v of await textoViejo()) viejos.push(`${nombre}: ${v}`);
    if ((await page.getByRole('heading', { name: 'Algo salió mal' }).count()) > 0) caidas.push(nombre);
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (sobra > 0) desbordes.push(`${nombre}: +${sobra} px`);
  };
  const boton = (nombre: string | RegExp) =>
    page.getByRole('button', typeof nombre === 'string' ? { name: nombre, exact: true } : { name: nombre }).first();
  const caja = page.locator('textarea').first();

  await page.goto(RUTA);
  await esperarHidratacion(page, ['textarea']);
  // Y la página ENTERA hidratada: el traductor simulado envolvía el texto del pie
  // (CoquinumMasDeCategoria) antes de que React lo hidratara, y salía un «Hydration failed» que
  // no es de la app (3 de 7 pasadas en rojo, cabo C0491)
  await esperarPaginaAsentada(page);

  // Texto → Braille: los avisos de aa75156d, en singular y en plural
  for (const t of [
    'La ONCE reparte 1 250 000 cupones.',
    'Llama al 600 123 456 o al 699 000 111',
    'NORMAS y LEYES',
    'Precio: 5 € y 3 %',
    'València és bonica',
    'a⡀b⡁',
    '‘encima’ ¥',
    '¿Qué? «Sí»',
  ]) {
    await paso(`escribir «${t}»`, () => caja.fill(t));
    await paso(`convertir «${t}»`, () => boton('Convertir').click());
  }
  await paso('Ocultar vista', () => page.locator('[class*="visualHeader"] button').click());
  await paso('Mostrar vista', () => page.locator('[class*="visualHeader"] button').click());
  await paso('título de la hoja', () => page.getByLabel('Título de la hoja (opcional)').fill('Etiquetas'));
  await paso('otro título', () => page.getByLabel('Título de la hoja (opcional)').fill('Cocina'));
  await paso('ADA', () => boton('ADA 703.3 (EE. UU.)').click());
  await paso('Marburg', () => boton('Marburg Medium').click());
  await paso('Espejo', () => boton('Espejo (regleta y punzón)').click());
  await paso('Lectura', () => boton('Lectura').click());
  await paso('Solo puntos activos', () => boton('Solo puntos activos').click());
  await paso('Mostrar retícula', () => boton('Mostrar retícula').click());
  // ⇄ con resultado y sin él
  await paso('⇄ con resultado', () => boton('Intercambiar dirección de conversión').click());
  await paso('convertir tras ⇄', () => boton('Convertir').click());
  await paso('⇄ de vuelta', () => boton('Intercambiar dirección de conversión').click());
  await paso('escribir sin convertir', () => caja.fill('Hola 2026'));
  await paso('⇄ sin resultado', () => boton('Intercambiar dirección de conversión').click());
  // Braille → Texto: ejemplos, teclado de seis puntos y los avisos de ese sentido
  for (const ej of ['Saludo', 'Números']) {
    await paso(`ejemplo ${ej}`, () => boton(ej).click());
    await paso(`convertir ${ej}`, () => boton('Convertir').click());
  }
  await paso('Limpiar', () => boton('Limpiar').click());
  const celdasTeclado: Array<[string, number[]]> = [
    ['⠇', [1, 2, 3]],
    ['⠿', [1, 2, 3, 4, 5, 6]],
    ['⠫', [1, 2, 4, 6]],
  ];
  for (const [celda, puntos] of celdasTeclado) {
    for (const p of puntos) await paso(`punto ${p} de ${celda}`, () => boton(`Punto ${p}`).click());
    await paso(`Escribir celda ${celda}`, () => boton(/^Escribir celda/).click());
    if (celda === '⠇') await paso('Espacio', () => boton('Espacio').click());
  }
  for (let i = 1; i <= 5; i++) await paso(`Borrar última ${i}`, () => boton('Borrar última').click());
  if (conTecladoFisico) {
    await paso('Perkins F+D', async () => {
      await page.getByTestId('zona-perkins').focus();
      await page.keyboard.down('KeyF');
      await page.keyboard.down('KeyD');
      await page.keyboard.up('KeyF');
      await page.keyboard.up('KeyD');
    });
    await paso('Perkins espacio', () => page.keyboard.press('Space'));
    await paso('Perkins retroceso', () => page.keyboard.press('Backspace'));
  }
  for (const t of ['a⠁b', '⠿⠫', 'hola', '⠼', '⡁']) {
    await paso(`braille «${t}»`, () => caja.fill(t));
    await paso(`convertir braille «${t}»`, () => boton('Convertir').click());
  }
  await paso('Texto → Braille', () => boton('Texto → Braille').click());
  await paso('escribir 🙂', () => caja.fill('🙂'));
  await paso('convertir 🙂', () => boton('Convertir').click());
  // Guía y aviso legal
  await paso('abrir guía', () => boton('Ver guía educativa').click());
  await paso('cerrar guía', () => boton('Ocultar guía educativa').click());
  await paso('ocultar aviso', () => boton('Ocultar aviso').click());
  await paso('mostrar aviso', () => boton('Mostrar aviso').click());

  // Control positivo SINTÉTICO del detector: un nodo apuntado al que se le cambia el valor
  await traducir();
  await page.evaluate(() => {
    const t = ((window as VentanaTraducida27).__nodosTraducidos27 ?? []).find((x) => !x.avisado);
    if (t) t.nodo.nodeValue = 'CONTROL';
  });
  const control = await textoViejo();
  return { viejos, caidas, errores, desbordes, control };
}

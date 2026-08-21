import { test, expect, type Page } from '@playwright/test';

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
 * HALLAZGOS ABIERTOS: los tests marcados con `test.fail()` afirman lo que dice el B 2 y
 * hoy fallan a propósito. El día que se corrija la app pasarán a ROJO («expected to
 * fail, but passed») y habrá que quitarles la marca, no reescribir el valor esperado.
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
// ⚠️ HALLAZGO ABIERTO (20/08/2026). El signo de número ⠼ vale para TODO el número,
// incluidos la coma decimal y el punto de millar que van dentro de él. El B 2 § 8.1 lo
// dice y lo demuestra con sus propios ejemplos:
//
//     «Cuando se escriban números formados por más de tres cifras, debe utilizarse el
//      punto 3 como separador de los grupos de tres dígitos.»
//         501.439.678  →  #EJA.DCI.FGH      (un solo # al principio)
//     «Como separador decimal se utiliza el punto 2 […]»
//         73,81        →  #GC,HA            (un solo # al principio)
//
// La app trata la coma y el punto como fin de la expresión numérica: al escribir vuelve
// a emitir ⠼ después de cada uno (celdas de más que no están en el estándar), y al leer
// braille español real devuelve LETRAS donde hay cifras. Un número de teléfono o un
// precio —el caso más corriente en español, formato 1.234,56— vuelve mal traducido y
// nada avisa de ello.
test('CASO 2 (límite) — el signo de número ⠼ cubre la coma decimal y el punto de millar', async ({
  page,
}) => {
  await page.goto(RUTA);

  // ── Ejemplo literal del B 2 § 8.1: 73,81 → #GC,HA ──────────────────────────
  //   ⠼ signo de número = 3-4-5-6 = U+2800 + 0x04+0x08+0x10+0x20 = U+283C
  //   7 = g = 1-2-4-5 = U+281B = ⠛   ·   3 = c = 1-4 = U+2809 = ⠉
  //   , coma decimal  = punto 2 = U+2802 = ⠂   (NO cierra el número)
  //   8 = h = 1-2-5   = U+2813 = ⠓   ·   1 = a = punto 1 = U+2801 = ⠁
  // Esperado ⠼⠛⠉⠂⠓⠁ · obtenido hoy ⠼⠛⠉⠂⠼⠓⠁ (repite el signo de número).
  await convertir(page, '73,81');
  await expect.soft(cajaResultado(page)).toHaveText('⠼⠛⠉⠂⠓⠁');

  // ── Ejemplo literal del B 2 § 8.1: 501.439.678 → #EJA.DCI.FGH ──────────────
  //   5=e=⠑ · 0=j=⠚ · 1=a=⠁ · punto de millar = punto 3 = U+2804 = ⠄
  //   4=d=⠙ · 3=c=⠉ · 9=i=⠊ · ⠄ · 6=f=⠋ · 7=g=⠛ · 8=h=⠓
  // Esperado ⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓ · obtenido hoy ⠼⠑⠚⠁⠄⠼⠙⠉⠊⠄⠼⠋⠛⠓.
  await page.goto(RUTA);
  await convertir(page, '501.439.678');
  await expect.soft(cajaResultado(page)).toHaveText('⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓');

  // ── Y la lectura, que es la mitad que la app anuncia en su título ──────────
  // Braille español real, escrito como manda el § 8.1, leído por la app:
  // Esperado «73,81» · obtenido hoy «73,ha» (la h y la a son las cifras 8 y 1).
  await page.goto(RUTA);
  await convertir(page, '⠼⠛⠉⠂⠓⠁', 'braille');
  await expect.soft(cajaResultado(page)).toHaveText('73,81');

  // Esperado «501.439.678» · obtenido hoy «501.dci.fgh».
  await page.goto(RUTA);
  await convertir(page, '⠼⠑⠚⠁⠄⠙⠉⠊⠄⠋⠛⠓', 'braille');
  await expect.soft(cajaResultado(page)).toHaveText('501.439.678');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (sin representación) — qué hace con lo que no puede escribir en braille
// ═══════════════════════════════════════════════════════════════════════════
//
// ⚠️ HALLAZGO ABIERTO (20/08/2026), dos defectos distintos en el mismo mecanismo:
//   a) El apóstrofo SÍ tiene celda en la signografía básica. B 2 § 6.2, tabla de signos
//      auxiliares: punto 3, «apóstrofo (precedido y seguido de una letra)». La app lo
//      descarta y encima afirma en pantalla que «el Código Braille Español no le asigna
//      celda en signografía básica», que es justo lo contrario de lo que dice su fuente.
//   b) El salto de línea se descarta SIN dejar separación, así que dos palabras que
//      venían en líneas distintas salen pegadas en una sola palabra braille. Y el aviso
//      que lo cuenta nombra un carácter invisible: el <strong> queda vacío en pantalla.
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
  // Esperado ⠙⠄⠕⠗ · obtenido hoy ⠙⠕⠗ y un aviso que niega el estándar.
  await page.goto(RUTA);
  await convertir(page, "d'or");
  await expect.soft(cajaResultado(page)).toHaveText('⠙⠄⠕⠗');
  await expect.soft(page.getByText(/Esta herramienta no escribe en braille/)).toHaveCount(0);

  // ── (b) Dos líneas no pueden acabar siendo una sola palabra ───────────────
  //   sal      = ⠎(2-3-4) ⠁(1) ⠇(1-2-3)
  //   pimienta = ⠏(1-2-3-4) ⠊(2-4) ⠍(1-3-4) ⠊ ⠑(1-5) ⠝(1-3-4-5) ⠞(2-3-4-5) ⠁
  // El braille no tiene signo de salto de línea, así que lo mínimo exigible es la
  // separación de palabra (celda vacía ⠀), igual que hace con un espacio.
  // Esperado ⠎⠁⠇⠀⠏⠊⠍⠊⠑⠝⠞⠁ · obtenido hoy ⠎⠁⠇⠏⠊⠍⠊⠑⠝⠞⠁ («salpimienta»).
  await page.goto(RUTA);
  await convertir(page, 'sal\npimienta');
  await expect.soft(cajaResultado(page)).toHaveText('⠎⠁⠇⠀⠏⠊⠍⠊⠑⠝⠞⠁');
  // Y el aviso, si aparece, tiene que nombrar algo que se vea. Hoy el <strong> lleva
  // un '\n' y en pantalla se lee «…signografía básica: . El resto del texto…».
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

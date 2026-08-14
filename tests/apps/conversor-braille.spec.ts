import { test, expect, type Page } from '@playwright/test';

/**
 * Conversor de Código Braille — test de regresión (Inspector, 14/08/2026)
 *
 * 3ª app más usada del catálogo (1.042 usos) y un caso raro: su resultado SÍ es
 * comprobable contra un estándar externo, y su público objetivo es precisamente el
 * que no puede verificar la salida por sí mismo. Por eso todos los valores esperados
 * de este fichero se derivan del Código Braille Español, NUNCA de lo que la app
 * devuelve.
 *
 * CÓMO SE DERIVA CADA VALOR (para poder auditar este fichero sin ejecutarlo):
 *   Una celda braille son 6 puntos numerados 1-2-3 (columna izquierda, de arriba
 *   abajo) y 4-5-6 (columna derecha). El bloque Unicode Braille Patterns codifica la
 *   celda como U+2800 + suma de bits:
 *       punto 1 = 0x01 · punto 2 = 0x02 · punto 3 = 0x04
 *       punto 4 = 0x08 · punto 5 = 0x10 · punto 6 = 0x20
 *   Así, "l" (puntos 1-2-3) = U+2800 + 0x01+0x02+0x04 = U+2807 = ⠇.
 *
 * FUENTES DEL ESTÁNDAR (consultadas el 14/08/2026):
 *   - ONCE, «Braille en español»: signo de mayúscula = puntos 4-6; signo de número =
 *     puntos 3-4-5-6.  https://www.once.es/servicios-sociales/braille
 *   - Comisión Braille Española / Andrés Ramos Vázquez, Anuario del Instituto
 *     Cervantes 2023: «para diferenciar letras minúsculas de letras mayúsculas, el
 *     sistema braille utiliza […] la combinación hecha con los puntos 4 y 6».
 *   - Signos de puntuación del braille español: punto (.) = punto 3 · coma = punto 2 ·
 *     punto y coma = 2-3 · dos puntos = 2-5 · interrogación (¿ y ?) = 2-6 ·
 *     admiración (¡ y !) = 2-3-5 · comillas = 2-3-6 · guion = 3-6 ·
 *     paréntesis = 1-2-6 / 3-4-5.
 *
 * QUÉ ESTÁ BIEN Y NO HAY QUE ROMPER: las 27 letras (incluida la ñ = 1-2-4-5-6), las
 * seis vocales con diacrítico, los diez dígitos con su indicador ⠼ y el indicador de
 * mayúscula ⠨ coinciden exactamente con el estándar. Eso es lo que fijan los CASOS 1 y 2.
 *
 * Los tests marcados con `test.fail()` son HALLAZGOS ABIERTOS: afirman lo que dice el
 * estándar y hoy fallan a propósito. El día que se corrija la app se pondrán en ROJO
 * («expected to fail, but passed») y habrá que quitarles la marca.
 */

const RUTA = '/conversor-braille/';

/** Caja de resultado: es el único role="status" que además lleva aria-live="polite". */
const cajaResultado = (page: Page) => page.locator('[role="status"][aria-live="polite"]').first();

async function convertir(page: Page, texto: string) {
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

// ═══════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — una palabra corta derivada signo a signo desde el estándar
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 1 (normal) — "luz" se transcribe letra a letra y las celdas dibujan sus puntos', async ({
  page,
}) => {
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Conversor de Código Braille');

  await convertir(page, 'luz');

  // Derivación a mano, letra por letra (las tres son de décadas distintas, así que
  // recorren las tres reglas de formación del alfabeto):
  //   l = puntos 1-2-3     → U+2800 + 0x01+0x02+0x04 = U+2807 = ⠇   (b + punto 3)
  //   u = puntos 1-3-6     → U+2800 + 0x01+0x04+0x20 = U+2825 = ⠥   (a + puntos 3 y 6)
  //   z = puntos 1-3-5-6   → U+2800 + 0x01+0x04+0x10+0x20 = U+2835 = ⠵
  // Minúsculas y sin dígitos: no interviene ningún indicador.
  await expect(cajaResultado(page)).toHaveText('⠇⠥⠵');

  // La vista de celdas debe pintar exactamente esos puntos, no otros.
  expect(await celdasVisuales(page)).toEqual(['1-2-3', '1-3-6', '1-3-5-6']);

  // Y la hoja imprimible a escala real, el mismo número de puntos en relieve por celda.
  expect(await celdasDeLaHoja(page)).toEqual([3, 3, 4]);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — mayúscula, ñ y números con su indicador ⠼
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 2 (límite) — "Año 2025": indicador de mayúscula, ñ y prefijo de número', async ({
  page,
}) => {
  await page.goto(RUTA);
  await convertir(page, 'Año 2025');

  // Derivación a mano, signo a signo:
  //   'A' → signo de mayúscula, puntos 4-6 (ONCE / Comisión Braille Española)
  //          = U+2800 + 0x08+0x20 = U+2828 = ⠨
  //         seguido de a = punto 1 = U+2801 = ⠁
  //   'ñ' → puntos 1-2-4-5-6 = U+2800 + 0x01+0x02+0x08+0x10+0x20 = U+283B = ⠻
  //   'o' → puntos 1-3-5 = U+2800 + 0x01+0x04+0x10 = U+2815 = ⠕
  //   ' ' → celda sin puntos = U+2800 = ⠀
  //   '2025' → signo de número, puntos 3-4-5-6 = U+2800 + 0x04+0x08+0x10+0x20 = U+283C = ⠼
  //            una sola vez para toda la secuencia, y luego las letras a-j como cifras:
  //            2 = b = puntos 1-2   = U+2803 = ⠃
  //            0 = j = puntos 2-4-5 = U+281A = ⠚
  //            2 = b               = ⠃
  //            5 = e = puntos 1-5   = U+2811 = ⠑
  await expect(cajaResultado(page)).toHaveText('⠨⠁⠻⠕⠀⠼⠃⠚⠃⠑');

  // Ida y vuelta: el botón «Intercambiar» devuelve el texto original tal cual.
  await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveText('Año 2025');

  // Las seis vocales con diacrítico del español, cada una con sus puntos:
  //   á = 1-2-3-5-6 = ⠷ · é = 2-3-4-6 = ⠮ · í = 3-4 = ⠌
  //   ó = 3-4-6     = ⠬ · ú = 2-3-4-5-6 = ⠾ · ü = 1-2-5-6 = ⠳
  await page.getByRole('button', { name: 'Texto → Braille' }).click();
  await convertir(page, 'áéíóúü');
  await expect(cajaResultado(page)).toHaveText('⠷⠮⠌⠬⠾⠳');
});

// ═══════════════════════════════════════════════════════════════════════════
// CASO 3 (degradar) — caracteres sin equivalente y entrada vacía
// ═══════════════════════════════════════════════════════════════════════════
test('CASO 3 (degradar) — sin texto no inventa resultado; con un emoji no debe colar basura', async ({
  page,
}) => {
  await page.goto(RUTA);

  // Entrada vacía: ni caja de resultado ni hoja imprimible, y el botón de imprimir
  // deshabilitado con su aviso. Esto SÍ degrada con elegancia.
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Imprimir la hoja/ })).toBeDisabled();
  await expect(
    page.getByText('Convierte primero un texto: la hoja se genera con el resultado de arriba.'),
  ).toBeVisible();

  // Un emoji no tiene celda en el braille español (lo dice la propia app en su bloque
  // «Limitaciones»). Lo que hace hoy es copiarlo literal dentro de la cadena braille:
  // el resultado deja de ser braille válido y quien lo pegue en una embosadora no
  // recibirá ningún aviso. Además `result.split('')` parte el par surrogate del emoji,
  // así que la vista dibuja DOS celdas vacías con medio carácter debajo.
  await convertir(page, 'sol 🙂');
  // sol = ⠎(2-3-4) ⠕(1-3-5) ⠇(1-2-3), espacio = ⠀
  await expect(cajaResultado(page)).toHaveText('⠎⠕⠇⠀🙂');
  expect(await celdasVisuales(page)).toEqual(['2-3-4', '1-3-5', '1-2-3', 'vacia', 'vacia', 'vacia']);

  // Al menos la hoja imprimible sí filtra lo que no es braille (regex U+2800–U+28FF):
  // 3 celdas con puntos y ninguna celda fantasma para el emoji.
  expect(await celdasDeLaHoja(page)).toEqual([3, 3, 3]);
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (Inspector, 14/08/2026)
// ═══════════════════════════════════════════════════════════════════════════

// ⚠️ HALLAZGO ABIERTO: el indicador de mayúscula ⠨ falta en la tabla `brailleDots` de
// page.tsx (están las 27 letras, los acentos, la puntuación y el ⠼, pero no el ⠨). Como
// el código resuelve `brailleDots[caracter] ?? []`, la celda de mayúscula se dibuja SIN
// NINGÚN PUNTO — y una celda sin puntos, en braille, es un ESPACIO. En la vista de
// celdas es un despiste; en la «hoja imprimible a escala real», que es la que se punza
// con regleta, "Hola" sale como espacio + h + o + l + a y pierde la mayúscula.
test('HALLAZGO — la celda del indicador de mayúscula debe dibujar sus puntos 4-6', async ({
  page,
}) => {
  test.fail();
  await page.goto(RUTA);
  await convertir(page, 'Hola');

  // La cadena de texto sí es correcta: ⠨(4-6) ⠓(1-2-5) ⠕(1-3-5) ⠇(1-2-3) ⠁(1)
  await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁');

  // Esperado: la primera celda son los puntos 4-6 · Obtenido hoy: 'vacia'
  expect(await celdasVisuales(page)).toEqual(['4-6', '1-2-5', '1-3-5', '1-2-3', '1']);
  // Esperado: 2 puntos en relieve en la primera celda · Obtenido hoy: 0
  expect(await celdasDeLaHoja(page)).toEqual([2, 3, 3, 3, 1]);
});

// ⚠️ HALLAZGO ABIERTO: tres signos de puntuación son los del braille inglés, no los del
// Código Braille Español, en una app que se anuncia como «Traductor Braille a Español»:
//   punto (.)      → estándar ⠄ (punto 3)      · la app usa ⠲ (puntos 2-5-6)
//   interrogación  → estándar ⠢ (puntos 2-6)   · la app usa ⠦ (puntos 2-3-6)
//   comillas (")   → estándar ⠦ (puntos 2-3-6) · la app usa ⠶ (puntos 2-3-5-6)
// El daño es doble porque los signos que sí usa están asignados a otra cosa: ⠦ es la
// comilla española, y ⠄ (el punto español) está dado de alta como apóstrofo, de modo que
// un texto braille español real vuelve mal traducido. Y ni ¿ ni ¡ existen en la tabla,
// pese a que la FAQ del bloque educativo afirma que «el español tiene símbolos únicos
// para ñ, á, é, í, ó, ú, ü y ¡¿» (en braille español ¿ y ? comparten signo, igual que ¡ y !).
test('HALLAZGO — la puntuación debe seguir el Código Braille Español', async ({ page }) => {
  test.fail();
  await page.goto(RUTA);

  // «Hola.» = ⠨ ⠓ ⠕ ⠇ ⠁ + punto = punto 3 = U+2804 = ⠄
  // Obtenido hoy: '⠨⠓⠕⠇⠁⠲' (⠲ son los puntos 2-5-6, el punto del braille inglés).
  await convertir(page, 'Hola.');
  await expect(cajaResultado(page)).toHaveText('⠨⠓⠕⠇⠁⠄');

  // «¿Qué?» — interrogación de apertura y cierre con el MISMO signo, puntos 2-6 = ⠢:
  //   ⠢ ⠨⠟(Q) ⠥(u) ⠮(é) ⠢
  // Obtenido hoy: '¿⠨⠟⠥⠮⠦' — el ¿ se cuela como carácter U+00BF dentro de la cadena
  // braille (y luego la hoja imprimible lo elimina en silencio) y el ? sale como ⠦.
  await convertir(page, '¿Qué?');
  await expect(cajaResultado(page)).toHaveText('⠢⠨⠟⠥⠮⠢');

  // Vuelta atrás desde braille español real: ⠓⠕⠇⠁⠄ es «hola.»
  // Obtenido hoy: "hola'" — porque ⠄ está dado de alta como apóstrofo.
  await page.getByRole('button', { name: 'Braille → Texto' }).click();
  await convertir(page, '⠓⠕⠇⠁⠄');
  await expect(cajaResultado(page)).toHaveText('hola.');
});

// ⚠️ HALLAZGO ABIERTO: el modo número se abre pero no se cierra. `convertTextToBraille`
// emite ⠼ ante el primer dígito y baja `inNumber` al llegar una letra, pero no escribe
// ningún terminador, así que la letra queda dentro del ámbito del indicador numérico:
// «24h» produce ⠼⠃⠙⠓, que un lector braille lee «248» (h es la 8ª letra). La propia app
// lo demuestra: al darle la vuelta a su propia salida devuelve «248», no «24h».
// Segundo defecto, en la función inversa: el indicador de mayúscula no cierra el modo
// número, así que «España 3D» → ⠼⠉⠨⠙ vuelve como «España 34» aunque el ⠨ está ahí.
test('HALLAZGO — tras un número, una letra no puede seguir leyéndose como cifra', async ({
  page,
}) => {
  test.fail();
  await page.goto(RUTA);

  // Ida y vuelta con «24h»: hoy devuelve «248».
  await convertir(page, '24h');
  await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveText('24h');

  // Ida y vuelta con «España 3D»: hoy devuelve «España 34».
  await page.goto(RUTA);
  await convertir(page, 'España 3D');
  await page.getByRole('button', { name: 'Intercambiar dirección de conversión' }).click();
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(cajaResultado(page)).toHaveText('España 3D');
});

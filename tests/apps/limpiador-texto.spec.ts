import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — limpiador-texto (segmento interactiva, riesgo 3, 185 usos)
 *
 * INSPECCIÓN: 31/08/2026.
 *
 * La app promete en su <h1> «Limpiador de Texto» y en su subtítulo «Elimina espacios extra,
 * líneas duplicadas, caracteres especiales y más». Toda la lógica vive INLINE en
 * `app/limpiador-texto/page.tsx` (useMemo `textoLimpio`, líneas 56-118): no hay ningún módulo
 * en `lib/` con el motor de limpieza, así que no hay tests unitarios aparte — este spec es la
 * única red de seguridad del cálculo.
 *
 * Las 13 opciones se aplican SIEMPRE en el orden declarado del array `opciones` (líneas 23-37),
 * no en el orden en que el usuario las activa: espaciosExtra → espaciosInicio → lineasVacias →
 * lineasDuplicadas → saltosLinea → tabulaciones → caracteresEspeciales → numeros → puntuacion →
 * emojis → html → urls → emails. Por defecto solo están activas «Espacios extra» y
 * «Espacios inicio/fin».
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — opciones por defecto, con espacios dobles/triples, un tab intermedio y
 *       tres saltos de línea seguidos.
 *       Entrada:  "Hola   mundo,   qué  tal\n  Segunda línea con tab:\tfinal  \n\n\nTercera línea."
 *       Paso 1 espaciosExtra (solo colapsa el espacio ASCII " ", no toca el tab):
 *                 "Hola mundo, qué tal\n Segunda línea con tab:\tfinal \n\n\nTercera línea."
 *       Paso 2 espaciosInicio (trim por línea; NO afecta al tab interno de la línea 2, ni a
 *                 las dos líneas vacías del salto triple, que «Líneas vacías» está inactiva):
 *                 "Hola mundo, qué tal\nSegunda línea con tab:\tfinal\n\n\nTercera línea."
 *       74 caracteres de entrada → 65 de salida → 9 eliminados (12,16...% → "12,2%" con
 *       formatNumber, coma decimal española).
 *
 *   CASO 2 (límite) — Unicode: emojis, espacio de ancho cero (ZWSP, U+200B), comillas
 *       tipográficas (U+201C/U+201D/U+2018/U+2019) y el texto vacío.
 *       Con el campo vacío, `textoLimpio` sale por `if (!textoEntrada) return ''` (línea 57):
 *       salida vacía y la barra de estadísticas ni se pinta (se renderiza solo si
 *       `textoEntrada` es verdadero, línea 224).
 *       Con SOLO «Emojis» activa sobre:
 *         "Emojis: 😀🎉 y símbolos: ☕. Palabra con ZWSP: in\u200Bvisible. Comillas tipográficas: “hola” y ‘adiós’."
 *       el regex `/[\u{1F600}-\u{1F6FF}]|[\u{1F300}-\u{1F5FF}]|...` (línea 103) solo borra
 *       😀 (U+1F600), 🎉 (U+1F389) y ☕ (U+2615) — deja intactos el ZWSP y las comillas
 *       curvas, que están fuera de esos rangos:
 *         "Emojis:  y símbolos: . Palabra con ZWSP: in\u200Bvisible. Comillas tipográficas: “hola” y ‘adiós’."
 *
 *   CASO 3 (combinación) — espaciosExtra + espaciosInicio + lineasVacias + tabulaciones +
 *       puntuacion activas a la vez, en ese orden fijo (el de declaración, no el de activación
 *       en la UI).
 *       Entrada: "¡Hola,   mundo!\n   \nLínea\tcon tab, y punto.\n\nFin del texto: ¿todo bien?"
 *       1) espaciosExtra: la línea "   " (3 espacios) → " " (1 espacio); "¡Hola,   mundo!" →
 *          "¡Hola, mundo!"
 *       2) espaciosInicio: la línea de un solo espacio → "" tras el trim
 *       3) lineasVacias: elimina esa línea (ya vacía) y la línea realmente vacía del \n\n
 *       4) tabulaciones: el tab de "Línea\tcon tab" → espacio
 *       5) puntuacion: borra ¡ , ! : ¿ ? . de las tres líneas restantes
 *       Resultado: "Hola mundo\nLínea con tab y punto\nFin del texto todo bien"
 *
 * Los tres casos se ejecutaron primero en el navegador con un script de Playwright fuera del
 * repo (scratchpad de sesión) y coincidieron EXACTAMENTE con el cálculo a mano, estadísticas
 * incluidas — no hay hallazgos de cálculo en estos tres casos.
 *
 * HALLAZGOS 557 y 558 — REPARADOS el 31/08/2026:
 *
 *   - «Comillas tipográficas» (FAQ #2 de metadata.ts, JSON-LD de FAQPage): prometía que el
 *     limpiador «los detecta y sustituye por su equivalente en texto limpio», pero la única
 *     opción capaz de tocar comillas curvas era «Caracteres especiales», y las BORRABA sin
 *     sustituir. Reparado: ahora sustituye “”→" y ‘’→' antes de aplicar el filtro.
 *
 *   - «Espacios extra» frente a espacios de no separación (NBSP, U+00A0): el bloque educativo
 *     anuncia esta opción para «texto copiado de Word/PDF con dobles espacios», y precisamente
 *     Word/PDF suelen dejar NBSP en vez de espacio ASCII. El regex `/ {2,}/g` solo matcheaba
 *     el espacio U+0020. Reparado: `/[  ]{2,}/g` colapsa también el NBSP.
 */

const RUTA = '/limpiador-texto/';

function entrada(page: Page) {
  return page.locator('#texto-entrada');
}

function salida(page: Page) {
  return page.getByLabel('Texto limpio resultante');
}

/** Activa o desactiva una opción de limpieza por su nombre visible en la tarjeta. */
async function setOpcion(page: Page, nombre: string, activo: boolean): Promise<void> {
  const checkbox = page.locator('label', { hasText: nombre }).locator('input[type="checkbox"]');
  const marcado = await checkbox.isChecked();
  if (marcado !== activo) {
    await checkbox.click();
  }
}

test.describe('limpiador-texto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
  });

  test('CASO 1 (normal) · espacios dobles, tab intermedio y salto triple con opciones por defecto', async ({
    page,
  }) => {
    // Opciones por defecto: solo «Espacios extra» y «Espacios inicio/fin» están activas.
    await entrada(page).fill(
      'Hola   mundo,   qué  tal\n  Segunda línea con tab:\tfinal  \n\n\nTercera línea.'
    );

    // El tab NO se toca (Tabulaciones inactiva) y las dos líneas vacías del salto triple se
    // conservan (Líneas vacías inactiva) — solo se colapsan los espacios ASCII y se recorta
    // cada línea por sus extremos.
    await expect(salida(page)).toHaveValue(
      'Hola mundo, qué tal\nSegunda línea con tab:\tfinal\n\n\nTercera línea.'
    );

    // 74 caracteres de entrada, 65 de salida, 9 eliminados → 12,16...% con COMA decimal
    // española (formatNumber), no punto.
    const stats = page.locator('[role="status"]');
    await expect(stats).toContainText('74');
    await expect(stats).toContainText('65');
    await expect(stats).toContainText('9 (12,2%)');
  });

  test('CASO 2 (límite) · emojis, espacio de ancho cero, comillas tipográficas y texto vacío', async ({
    page,
  }) => {
    // Con el campo vacío la salida es vacía y la barra de estadísticas ni se pinta.
    await expect(salida(page)).toHaveValue('');
    await expect(page.locator('[role="status"]')).toHaveCount(0);

    // Solo «Emojis» activa: se desactivan las dos que están ON por defecto.
    await setOpcion(page, 'Espacios extra', false);
    await setOpcion(page, 'Espacios inicio/fin', false);
    await setOpcion(page, 'Emojis', true);

    // \u200B = espacio de ancho cero (ZWSP), invisible e indistinguible de un espacio normal
    // a simple vista — se escribe como escape explícito para que el fichero sea auditable.
    // Las comillas tipográficas “”‘’ y los emojis 😀🎉☕ sí son visibles, van literales.
    const texto =
      'Emojis: \u{1F600}\u{1F389} y símbolos: ☕. Palabra con ZWSP: in\u200Bvisible. ' +
      'Comillas tipográficas: “hola” y ‘adiós’.';
    await entrada(page).fill(texto);

    // Solo desaparecen los tres caracteres dentro de los rangos de emoji del regex (😀🎉☕):
    // el espacio de ancho cero y las comillas curvas quedan intactos, porque «Emojis» no las
    // toca (la sustitución de comillas vive en «Caracteres especiales», que aquí está inactiva
    // — ver el test de esa opción más abajo).
    await expect(salida(page)).toHaveValue(
      'Emojis:  y símbolos: . Palabra con ZWSP: in\u200Bvisible. ' +
        'Comillas tipográficas: “hola” y ‘adiós’.'
    );
  });

  test('CASO 3 (combinación) · 5 opciones activas a la vez, en el orden fijo de aplicación', async ({
    page,
  }) => {
    // Además de las dos activas por defecto (espaciosExtra, espaciosInicio):
    await setOpcion(page, 'Líneas vacías', true);
    await setOpcion(page, 'Tabulaciones', true);
    await setOpcion(page, 'Puntuación', true);

    await entrada(page).fill(
      '¡Hola,   mundo!\n   \nLínea\tcon tab, y punto.\n\nFin del texto: ¿todo bien?'
    );

    // espaciosExtra colapsa la línea de 3 espacios a 1 · espaciosInicio la deja vacía ·
    // lineasVacias la elimina (junto con la línea realmente vacía) · tabulaciones convierte
    // el tab en espacio · puntuacion borra ¡ , ! : ¿ ? . de lo que queda.
    await expect(salida(page)).toHaveValue(
      'Hola mundo\nLínea con tab y punto\nFin del texto todo bien'
    );
  });

  // ---------------------------------------------------------------------------------------
  // REPARADO — hallazgos 557 y 558 de la inspección del 31/08/2026: brechas entre lo prometido
  // (metadata.ts / bloque educativo) y lo que hacía el motor de limpieza. Ya reparadas.
  // ---------------------------------------------------------------------------------------

  test.describe('hallazgos 557/558, reparados', () => {
    test('«Caracteres especiales» sustituye las comillas tipográficas por su equivalente recto', async ({
      page,
    }) => {
      // metadata.ts, FAQ #2 (FAQPage JSON-LD): «Word, PDF... añaden... comillas tipográficas...
      // Un limpiador los detecta y sustituye por su equivalente en texto limpio». Ahora sí:
      // comillas curvas sustituidas por su equivalente recto antes del filtro.
      await setOpcion(page, 'Espacios extra', false);
      await setOpcion(page, 'Espacios inicio/fin', false);
      await setOpcion(page, 'Caracteres especiales', true);

      await entrada(page).fill('Comillas tipográficas: “hola” y ‘adiós’.');

      await expect(salida(page)).toHaveValue('Comillas tipográficas: "hola" y \'adiós\'.');
    });

    test('«Espacios extra» colapsa también espacios de no separación (NBSP), el caso Word/PDF que anuncia', async ({
      page,
    }) => {
      // El bloque educativo (EducationalSection, sección «Guía de Opciones») dice literalmente:
      // «Espacios extra → texto copiado de Word/PDF con dobles espacios». Ahora el regex
      // /[ \u00A0]{2,}/g matchea tanto el espacio ASCII como el NBSP (U+00A0), así que un NBSP
      // doble —justo lo que Word suele dejar al pegar— se colapsa igual que un espacio normal.
      await entrada(page).fill(
        'Palabra1\u00A0\u00A0Palabra2 con  doble espacio normal'
      );

      await expect(salida(page)).toHaveValue(
        'Palabra1 Palabra2 con doble espacio normal'
      );
    });
  });
});

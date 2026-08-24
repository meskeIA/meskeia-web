import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — generador-anagramas (segmento interactiva, riesgo 4, 1.548 usos reales)
 *
 * Primera inspección: 24/08/2026. La app promete en su <h1> «Generador de Anagramas» y en su
 * subtítulo «Palabras formables con tus letras, anagramas perfectos de una frase y verificador
 * exacto». Un anagrama tiene verdad comprobable —el MULTICONJUNTO de letras se conserva—, así
 * que se trata como verificable pese a ser una app «creativa».
 *
 * LA PROMESA DEL DICCIONARIO ESTÁ RESPALDADA
 *   La metadata y el bloque educativo anuncian «Lemario General del Español de Ismael Olea,
 *   ~87.000 lemas». El fichero existe de verdad: public/data/diccionario-es.txt, 86.973 líneas
 *   no vacías (`wc -l` da 86.972 porque la última línea, «úvula», no lleva salto final), solo
 *   letras minúsculas del alfabeto español. NO son permutaciones aleatorias: los tres modos
 *   contrastan contra ese fichero. La cifra que pinta la UI, 86.973, es la del fichero.
 *
 * DÓNDE VIVE EL CÁLCULO — todo en app/generador-anagramas/page.tsx
 *   normalizarTexto()             ← minúsculas, sin tildes, solo [a-zñ]  (modos frase y verificar)
 *   buscarAnagramasPerfectos()    ← reparto exacto del multiconjunto entre palabras (modo frase)
 *   compararTextos()              ← recuento letra a letra y sobrantes   (modo verificar)
 *   findAnagrams() + canFormWord()← palabras formables (SUBconjunto)     (modo letras)
 *   OJO: findAnagrams NO quita tildes: letters.replace(/[^a-záéíóúüñ]/g,''). Los otros dos
 *   modos sí. Esa asimetría es deliberada según el bloque educativo, y se fija más abajo.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — modo frase, «roma», con los valores por defecto (3 palabras, 3 letras)
 *       letras a repartir: {a, m, o, r} = 4 letras
 *       Con longitud mínima 3, dos palabras exigirían 3+3 = 6 letras > 4, así que SOLO caben
 *       soluciones de UNA palabra: los lemas de 4 letras cuya firma ordenada sea «amor».
 *       Recorriendo el lemario a mano (firma = letras ordenadas):
 *           amor · maro · mora · ramo · roma
 *       «roma» es el propio texto de partida y el motor lo excluye (claveTrivial), así que
 *       ESPERADO = 4 soluciones: AMOR, MARO, MORA, RAMO — y cada una con exactamente las
 *       mismas letras que la entrada, ni una de más ni una de menos.
 *
 *   CASO 2 (límite) — letras repetidas, tildes, mayúsculas y espacios
 *       2a) modo verificar, «Salvador Dalí» vs «Avida Dollars» (el anagrama que el propio
 *           bloque educativo cita como célebre):
 *             salvadordali → a×3, d×2, i, l×2, o, r, s, v  = 12 letras
 *             avidadollars → a×3, d×2, i, l×2, o, r, s, v  = 12 letras   ⇒ IGUALES
 *           Comprueba «í»→«i», mayúsculas y espacio a la vez. ESPERADO: ✅ y «las mismas 12».
 *       2b) la ñ NO es una n: «año» vs «ano» ⇒ ❌, sobra Ñ en el original y N en la propuesta.
 *       2c) modo frase, «ana maria» (a×4, i, m, n, r = 8 letras) con 3 palabras y mínimo 3:
 *           15 repartos exactos, TODOS distintos entre sí. Es el caso que fuerza la
 *           deduplicación: con cuatro aes la misma combinación se alcanza por varios caminos.
 *
 *   CASO 3 (rechazo) — entradas que no son letras
 *       «12345» y «@@@» no aportan NINGUNA letra. En modo frase el contador dice «0 letras a
 *       repartir» y el botón queda deshabilitado: correcto. En modo letras el botón sigue
 *       habilitado (medía letters.length, no las letras reales) — reparado el 24/08/2026.
 *
 * HALLAZGOS DEL INSPECTOR: al final. Se escribieron con test.fail() afirmando lo que
 * DEBERÍA pasar, y el 24/08/2026 se repararon los cinco: hoy son tests de regresión
 * normales.
 */

const RUTA = '/generador-anagramas/';

/** Espera a que el diccionario esté cargado: sin él los botones de búsqueda están inertes. */
async function abrirConDiccionario(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByText(/Diccionario cargado/)).toBeVisible({ timeout: 20000 });
}

const pestana = (page: Page, nombre: RegExp) => page.getByRole('button', { name: nombre });

/** Firma de un texto: sus letras ordenadas. Dos textos son anagramas si tienen la misma firma. */
const firma = (texto: string): string =>
  texto.toLowerCase().replace(/[^a-zñ]/g, '').split('').sort().join('');

test.describe('generador-anagramas', () => {
  test('CASO 1 · «roma» da los 4 anagramas perfectos y todos conservan las letras', async ({
    page,
  }) => {
    await abrirConDiccionario(page);
    await pestana(page, /Anagrama perfecto de una frase/).click();
    await page.fill('#anagram-frase', 'roma');

    // Los valores por defecto son los que se usaron para resolver el caso a mano.
    await expect(page.locator('#anagram-max-palabras')).toHaveValue('3');
    await expect(page.locator('#anagram-min-longitud')).toHaveValue('3');
    await expect(page.getByText('4 letras a repartir')).toBeVisible();

    await page.getByRole('button', { name: 'Buscar anagramas perfectos' }).click();

    // Enumerados a mano sobre public/data/diccionario-es.txt: los lemas de 4 letras con firma
    // «amor» son amor, maro, mora, ramo y roma; «roma» es la entrada y se excluye por trivial.
    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Anagramas perfectos encontrados: 4'
    );
    // Ojo: se comparan en minúscula porque el DOM las guarda así — las mayúsculas que se ven
    // en pantalla las pone `text-transform: uppercase` del CSS Module.
    await expect(page.locator('[class*="solucionCard"]')).toHaveText([
      'amor',
      'maro',
      'mora',
      'ramo',
    ]);

    // La verdad comprobable del anagrama: mismo multiconjunto de letras, ni una de más ni de
    // menos. Se comprueba sobre lo que la app pinta, no sobre la lista de arriba.
    const soluciones = await page.locator('[class*="solucionCard"]').allInnerTexts();
    for (const solucion of soluciones) {
      expect(firma(solucion), `«${solucion}» no usa exactamente las letras de «roma»`).toBe(
        firma('roma')
      );
    }
    // Y el texto de partida no se devuelve como anagrama de sí mismo.
    expect(soluciones.map((s) => s.trim().toUpperCase())).not.toContain('ROMA');
  });

  test('CASO 2 · límite: tildes, mayúsculas, espacios, ñ y letras repetidas', async ({ page }) => {
    await abrirConDiccionario(page);

    // --- 2a) el anagrama célebre que la propia app cita: 12 letras a cada lado ---
    await pestana(page, /Verificar dos textos/).click();
    await page.fill('#anagram-texto-a', 'Salvador Dalí');
    await page.fill('#anagram-texto-b', 'Avida Dollars');
    const veredicto = page.locator('[class*="veredicto"]').first();
    // salvadordali y avidadollars: a×3 d×2 i l×2 o r s v en ambos, luego anagrama exacto.
    await expect(veredicto).toContainText('Son anagramas exactos');
    await expect(veredicto).toContainText('las mismas 12 letras');

    // --- 2b) la ñ es una letra propia del alfabeto español, no una n con virgulilla ---
    await page.fill('#anagram-texto-a', 'año');
    await page.fill('#anagram-texto-b', 'ano');
    await expect(veredicto).toContainText('No son anagramas exactos');
    await expect(veredicto).toContainText('Sobran en el original (faltan en la propuesta): Ñ');
    await expect(veredicto).toContainText('Sobran en la propuesta (no están en el original): N');

    // --- 2c) letras repetidas: 15 repartos exactos de «ana maria» y NINGUNO duplicado ---
    await pestana(page, /Anagrama perfecto de una frase/).click();
    await page.fill('#anagram-frase', 'ana maria');
    await expect(page.getByText('8 letras a repartir')).toBeVisible();
    await page.getByRole('button', { name: 'Buscar anagramas perfectos' }).click();
    // Enumerados a mano por fuerza bruta sobre el lemario (a×4, i, m, n, r; máximo 3 palabras,
    // mínimo 3 letras): 15 repartos distintos, sin la partición trivial «ana|maria».
    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Anagramas perfectos encontrados: 15'
    );
    const repartos = await page.locator('[class*="solucionCard"]').allInnerTexts();
    expect(repartos).toHaveLength(15);

    // Con cuatro aes la misma combinación se alcanza por varios pivotes: no puede repetirse.
    const claves = repartos.map((r) => r.trim().split(/\s+/).sort().join(' '));
    expect(new Set(claves).size, `hay repartos duplicados: ${claves.join(' / ')}`).toBe(15);

    // Y cada reparto sigue consumiendo exactamente las 8 letras de «ana maria».
    for (const reparto of repartos) {
      expect(firma(reparto), `«${reparto}» no reparte las letras de «ana maria»`).toBe(
        firma('anamaria')
      );
    }
  });

  test('CASO 3 · rechazo: una entrada sin letras no se busca', async ({ page }) => {
    await abrirConDiccionario(page);
    await pestana(page, /Anagrama perfecto de una frase/).click();
    const buscarFrase = page.getByRole('button', { name: 'Buscar anagramas perfectos' });

    // «12345» no aporta ninguna letra: normalizarTexto lo deja vacío.
    await page.fill('#anagram-frase', '12345');
    await expect(page.getByText('0 letras a repartir')).toBeVisible();
    await expect(buscarFrase).toBeDisabled();

    // Símbolos, igual.
    await page.fill('#anagram-frase', '@@@ ### !!!');
    await expect(page.getByText('0 letras a repartir')).toBeVisible();
    await expect(buscarFrase).toBeDisabled();

    // Campo vacío, igual.
    await page.fill('#anagram-frase', '');
    await expect(buscarFrase).toBeDisabled();

    // Y con menos de 3 letras tampoco se busca (el mínimo declarado por el propio motor).
    await page.fill('#anagram-frase', 'ab');
    await expect(buscarFrase).toBeDisabled();

    // Tres letras reales ya habilitan la búsqueda: el corte está donde dice estar.
    await page.fill('#anagram-frase', 'sal');
    await expect(buscarFrase).toBeEnabled();
  });

  // ---------------------------------------------------------------------------------------
  // HALLAZGOS DEL INSPECTOR — reparados el 24/08/2026, ya son regresión
  // ---------------------------------------------------------------------------------------

  test.describe('hallazgos del Inspector', () => {

    test('el modo letras no debería dar veredicto antes de buscar', async ({ page }) => {
      await abrirConDiccionario(page);
      // Nada más teclear «amor», y SIN pulsar «Buscar palabras», la app ya afirma que no hay
      // nada. El bloque se pinta con `results.length === 0 && letters.length >= 2`, y `results`
      // sigue vacío porque todavía no se ha buscado. Al pulsar salen 16 palabras.
      await page.fill('#anagram-letters', 'amor');
      await expect(page.locator('[class*="noResults"]')).toHaveCount(0);
    });

    test('el modo letras no debería mantener en pantalla los resultados de otra búsqueda', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await page.fill('#anagram-letters', 'amor');
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      await expect(page.locator('[class*="wordChip"]')).toHaveCount(16);
      // Se cambian las letras sin volver a buscar: los 16 resultados de «amor» siguen ahí,
      // presentados como si fueran las palabras formables con «zzzz».
      await page.fill('#anagram-letters', 'zzzz');
      await expect(page.locator('[class*="wordChip"]')).toHaveCount(0);
    });

    test('el modo letras debería deshabilitar el botón cuando no hay letras', async ({ page }) => {
      await abrirConDiccionario(page);
      // El botón mira `letters.length < 2`, la longitud CRUDA del campo, no las letras que
      // quedan tras filtrar. Con «12345» se habilita, y al pulsarlo responde «No se encontraron
      // palabras con esas letras», cuando lo cierto es que no se ha escrito ninguna letra.
      // El modo frase sí lo hace bien: mide las letras ya normalizadas.
      await page.fill('#anagram-letters', '12345');
      await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeDisabled();
    });

    test('los títulos del bloque educativo deberían llevar el emoji con aria-hidden', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      // El bloque educativo está siempre en el DOM (se oculta por CSS), pero se abre igual para
      // comprobarlo tal y como lo encuentra un lector de pantalla.
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      // `node scripts/check-a11y-jsx.mjs app/generador-anagramas/page.tsx` señala 5 <h3> con el
      // emoji pegado al texto (L826, L875, L901, L939, L987): un lector de pantalla lee
      // «edificio clásico Historia y Tipos de Reorganización de Letras». CLAUDE.md global §5.
      const titulo = page.locator('h3', { hasText: 'Historia y Tipos de Reorganización' });
      await expect(titulo.locator('[aria-hidden="true"]')).toHaveCount(1);
    });
  });
    /**
     * HALLAZGO 197 — la asimetría de tildes entre los tres modos de la misma app.
     *
     * `normalizarTexto()` iguala á = a en los modos «frase» y «verificar», pero el modo de
     * letras comparaba contra el texto crudo del lema: ahí «á» y «a» eran letras distintas.
     * Medido sobre el diccionario, 18.230 de los 86.973 lemas (el 21 %) quedaban inalcanzables
     * si se tecleaba sin tildes, y al teclear con tilde se perdía todo lo demás. Afectaba de
     * lleno al uso que la propia app promociona —un atril de Scrabble o de Wordle—, donde nadie
     * teclea tildes, y se alcanzaba pulsando su propio botón de ejemplo «corazon».
     */
    test('el modo letras ignora las tildes, como los otros dos modos', async ({ page }) => {
      await abrirConDiccionario(page);

      // El ejemplo que ofrece la propia app: sin tilde tiene que encontrar la palabra con tilde
      await page.fill('#anagram-letters', 'corazon');
      await page.selectOption('#anagram-min', '7');
      await page.selectOption('#anagram-max', '7');
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      const chips = page.locator('[class*="wordChip"]');
      await expect(chips).toContainText(['corazón']);

      // Y al revés: escribiéndolo con tilde salen las mismas palabras que sin ella
      await page.fill('#anagram-letters', 'corazón');
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      await expect(chips).toContainText(['corazón']);

      // «arbol» encuentra «árbol», que antes solo aparecía tecleando la tilde
      await page.fill('#anagram-letters', 'arbol');
      await page.selectOption('#anagram-min', '5');
      await page.selectOption('#anagram-max', '5');
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      // La búsqueda va en un setTimeout: hay que esperar a que aparezcan los resultados
      await expect(chips.first()).toBeVisible();
      const cinco = await chips.allInnerTexts();
      expect(cinco).toContain('árbol');
      expect(cinco).toContain('labor'); // y no se pierde ninguna de las que ya salían
      expect(cinco).toContain('borla');
    });

});

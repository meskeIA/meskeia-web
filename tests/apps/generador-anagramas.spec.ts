import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — generador-anagramas (segmento interactiva, 1.548 usos reales)
 *
 * Primera inspección: 24/08/2026 (5 hallazgos) · Segunda pasada: 24/08/2026, tras la reparación.
 *
 * La app promete en su <h1> «Generador de Anagramas» y en su subtítulo «Palabras formables con
 * tus letras, anagramas perfectos de una frase y verificador exacto». Son TRES promesas
 * distintas y se comprueban como tales. Un anagrama tiene verdad comprobable —el MULTICONJUNTO
 * de letras se conserva—, así que la app es verificable pese a ser «creativa».
 *
 * LA PROMESA DEL DICCIONARIO ESTÁ RESPALDADA
 *   La metadata y el bloque educativo anuncian «Lemario General del Español de Ismael Olea,
 *   ~87.000 lemas». El fichero existe: public/data/diccionario-es.txt, 86.973 líneas no vacías
 *   (`wc -l` da 86.972 porque la última, «úvula», no lleva salto final), sin duplicados, en NFC,
 *   todo minúsculas y SOLO letras del alfabeto español (comprobado carácter a carácter). Los
 *   tres modos contrastan contra ese fichero; la cifra que pinta la UI, 86.973, es la del
 *   fichero. Que no haya signos ni espacios importa: garantiza que longitud original y longitud
 *   normalizada coinciden, y por tanto que agrupar por `word.length` no descoloca ninguna
 *   palabra respecto del filtro de longitud, que trabaja sobre la forma normalizada.
 *
 * DÓNDE VIVE EL CÁLCULO — todo en app/generador-anagramas/page.tsx
 *   normalizarTexto()             ← minúsculas, sin tildes, solo [a-zñ]  (LOS TRES MODOS)
 *   buscarAnagramasPerfectos()    ← reparto exacto del multiconjunto entre palabras (modo frase)
 *   compararTextos()              ← recuento letra a letra y sobrantes   (modo verificar)
 *   findAnagrams() + canFormWord()← palabras formables (SUBconjunto)     (modo letras)
 *   Desde la reparación del 24/08/2026 los tres modos normalizan igual: `findAnagrams()` llama
 *   a `normalizarTexto(letters)` y `wordsByLength` guarda la forma normalizada junto a la
 *   original. La asimetría de tildes que era el hallazgo de fondo ya no existe (CASO 2).
 *
 * LOS TRES CASOS, RESUELTOS ANTES DE ABRIR EL NAVEGADOR
 *   Con 86.973 lemas la enumeración no se hace de memoria: se resolvió con un oráculo propio en
 *   Node (implementación independiente de «quitar tildes + comparar multiconjuntos» escrita
 *   contra el fichero del diccionario, sin importar nada de la app) y SE ANOTÓ ANTES de abrir
 *   el navegador. Las cifras literales de abajo son las de ese oráculo; el navegador devolvió
 *   exactamente las mismas.
 *
 *   CASO 1 (normal) — modo letras, «amor», longitudes 2 a 10
 *       16 palabras: 5 de 4 letras (amor, maro, mora, ramo, roma), 7 de 3 (amo, aro, mar, moa,
 *       mor, ora, roa) y 4 de 2 (am, ar, oa, ro). Ninguna palabra con tilde cabe en {a,m,o,r},
 *       así que el total coincide con el de antes de la reparación: 16 sigue siendo 16.
 *
 *   CASO 2 (límite) — tildes, ñ, letras repetidas
 *       2a) «corazon» (5..10) → 32 palabras, y entre ellas «corazón», la de 7 letras. Con
 *           «corazón» tecleado CON tilde salen las mismas 32, en el mismo orden.
 *       2b) «arbol» (5..5) → 7: albor, árbol, bolar, borla, labor, labro, robla. Idéntico con
 *           «árbol». (Antes de la reparación: «arbol» daba 6 sin «árbol», y «árbol» daba 1.)
 *       2c) modo verificar, «Salvador Dalí» vs «Avida Dollars»:
 *             salvadordali → a×3 d×2 i l×2 o r s v = 12 · avidadollars → lo mismo ⇒ IGUALES.
 *       2d) la ñ NO es una n: «año» vs «ano» ⇒ sobra Ñ en el original y N en la propuesta.
 *       2e) modo frase, «ana maria» (a×4, i, m, n, r): 15 repartos exactos y TODOS distintos
 *           (con cuatro aes la misma combinación se alcanza por varios pivotes).
 *
 *   CASO 3 (rechazo) — entradas que no son letras
 *       «12345» y «@@@» no aportan ninguna letra: en los dos modos con diccionario el botón
 *       queda deshabilitado. «zzzz» sí son letras, se busca y no hay ninguna palabra: ahí el
 *       mensaje «No se encontraron palabras» es correcto porque se ha buscado de verdad.
 *
 * ESTADO DE LOS HALLAZGOS: los 5 de la primera pasada y los 5 de la segunda (264-268) están
 * reparados, y sus tests quedan abajo como regresión. Los de la segunda se cerraron el
 * 24/08/2026 retirando el test.fail() con el que se documentaron y añadiendo la afirmación
 * en positivo: que la app ya no diga lo que decía es media prueba, la otra media es que diga
 * lo correcto.
 */

const RUTA = '/generador-anagramas/';

/** Espera a que el diccionario esté cargado: sin él los botones de búsqueda están inertes. */
async function abrirConDiccionario(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByText(/Diccionario cargado/)).toBeVisible({ timeout: 20000 });
}

const pestana = (page: Page, nombre: RegExp) => page.getByRole('button', { name: nombre });

/** Firma de un texto: sus letras ordenadas, sin tildes. Dos textos son anagramas si coinciden. */
const firma = (texto: string): string =>
  texto
    .toLowerCase()
    .replace(/[áàâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
    .replace(/[óòôö]/g, 'o').replace(/[úùûü]/g, 'u')
    .replace(/[^a-zñ]/g, '')
    .split('')
    .sort()
    .join('');

/** ¿La palabra cabe en las letras disponibles? (multiconjunto, comparado sin tildes) */
function esFormable(palabra: string, letras: string): boolean {
  const disponibles: Record<string, number> = {};
  for (const c of firma(letras)) disponibles[c] = (disponibles[c] ?? 0) + 1;
  for (const c of firma(palabra)) {
    if (!disponibles[c]) return false;
    disponibles[c]--;
  }
  return true;
}

test.describe('generador-anagramas', () => {
  // ---------------------------------------------------------------------------------------
  // CASO 1 · NORMAL
  // ---------------------------------------------------------------------------------------
  test('CASO 1 · «amor» (2..10) da exactamente las 16 palabras formables del lemario', async ({
    page,
  }) => {
    await abrirConDiccionario(page);

    // Los valores por defecto son los que se usaron para resolver el caso.
    await expect(page.locator('#anagram-min')).toHaveValue('2');
    await expect(page.locator('#anagram-max')).toHaveValue('10');

    await page.fill('#anagram-letters', 'amor');
    await page.getByRole('button', { name: 'Buscar palabras' }).click();

    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Palabras encontradas: 16'
    );

    // Oráculo propio sobre public/data/diccionario-es.txt: los lemas que caben en {a,m,o,r}
    // con longitud 2..10, ordenados como los ordena la app (longitud descendente y, dentro de
    // cada grupo, alfabético). Son 5 + 7 + 4.
    await expect(page.locator('[class*="wordChip"]')).toHaveText([
      'amor', 'maro', 'mora', 'ramo', 'roma',
      'amo', 'aro', 'mar', 'moa', 'mor', 'ora', 'roa',
      'am', 'ar', 'oa', 'ro',
    ]);

    // Y los encabezados de grupo dicen cuántas hay de cada longitud.
    await expect(page.locator('[class*="groupTitle"]')).toHaveText([
      '4 letras (5)',
      '3 letras (7)',
      '2 letras (4)',
    ]);

    // La verdad comprobable del modo: toda palabra devuelta cabe en las letras pedidas.
    for (const palabra of await page.locator('[class*="wordChip"]').allTextContents()) {
      expect(esFormable(palabra, 'amor'), `«${palabra}» no se forma con las letras de «amor»`).toBe(
        true
      );
    }
  });

  // ---------------------------------------------------------------------------------------
  // CASO 2 · LÍMITE: tildes, ñ y letras repetidas
  // ---------------------------------------------------------------------------------------
  test('CASO 2a · el modo letras ignora las tildes: «corazon» y «corazón» dan las mismas 32', async ({
    page,
  }) => {
    await abrirConDiccionario(page);
    const chips = page.locator('[class*="wordChip"]');

    // «corazon» es uno de los botones de ejemplo de la propia app.
    await page.fill('#anagram-letters', 'corazon');
    await page.selectOption('#anagram-min', '5');
    await page.selectOption('#anagram-max', '10');
    await page.getByRole('button', { name: 'Buscar palabras' }).click();

    // Oráculo propio: 32 lemas caben en {c,o,r,a,z,o,n} con longitud 5..10, y el único de 7
    // letras es «corazón» — el que antes de la reparación era inalcanzable sin teclear la tilde.
    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Palabras encontradas: 32'
    );
    await expect(page.locator('[class*="groupTitle"]')).toHaveText([
      '7 letras (1)',
      '6 letras (5)',
      '5 letras (26)',
    ]);
    const sinTilde = await chips.allTextContents();
    expect(sinTilde).toContain('corazón');
    expect(sinTilde[0]).toBe('corazón');

    // Simetría: tecleado CON tilde tiene que devolver exactamente lo mismo, no «solo lo que
    // lleva tilde». Es la asimetría entre modos que motivó el hallazgo de fondo.
    await page.fill('#anagram-letters', 'corazón');
    await page.getByRole('button', { name: 'Buscar palabras' }).click();
    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Palabras encontradas: 32'
    );
    expect(await chips.allTextContents()).toEqual(sinTilde);
  });

  test('CASO 2b · «arbol» (5..5) devuelve las 7 de siempre y ahora también «árbol»', async ({
    page,
  }) => {
    await abrirConDiccionario(page);
    await page.selectOption('#anagram-min', '5');
    await page.selectOption('#anagram-max', '5');

    // Oráculo propio: los 7 lemas de 5 letras que caben en {a,r,b,o,l}. Antes de la reparación
    // «arbol» devolvía 6 (sin «árbol») y «árbol» devolvía 1 (solo «árbol»).
    const esperadas = ['albor', 'árbol', 'bolar', 'borla', 'labor', 'labro', 'robla'];

    await page.fill('#anagram-letters', 'arbol');
    await page.getByRole('button', { name: 'Buscar palabras' }).click();
    await expect(page.locator('[class*="wordChip"]')).toHaveText(esperadas);

    await page.fill('#anagram-letters', 'árbol');
    await page.getByRole('button', { name: 'Buscar palabras' }).click();
    await expect(page.locator('[class*="wordChip"]')).toHaveText(esperadas);
  });

  test('CASO 2c-2d · verificador: «Salvador Dalí» = «Avida Dollars», pero «año» ≠ «ano»', async ({
    page,
  }) => {
    await abrirConDiccionario(page);
    await pestana(page, /Verificar dos textos/).click();
    const veredicto = page.locator('[class*="veredicto"]').first();

    // El anagrama célebre que la propia app cita: mayúsculas, espacio y tilde a la vez.
    // salvadordali y avidadollars → a×3 d×2 i l×2 o r s v en ambos ⇒ 12 letras iguales.
    await page.fill('#anagram-texto-a', 'Salvador Dalí');
    await page.fill('#anagram-texto-b', 'Avida Dollars');
    await expect(veredicto).toContainText('Son anagramas exactos');
    await expect(veredicto).toContainText('las mismas 12 letras');

    // La ñ es una letra propia del alfabeto español, no una n con virgulilla.
    await page.fill('#anagram-texto-a', 'año');
    await page.fill('#anagram-texto-b', 'ano');
    await expect(veredicto).toContainText('No son anagramas exactos');
    await expect(veredicto).toContainText('Sobran en el original (faltan en la propuesta): Ñ');
    await expect(veredicto).toContainText('Sobran en la propuesta (no están en el original): N');

    // Y la tilde sí se ignora, igual que en los otros dos modos: «árbol» vs «arbol» son iguales.
    await page.fill('#anagram-texto-a', 'árbol');
    await page.fill('#anagram-texto-b', 'arbol');
    await expect(veredicto).toContainText('Son anagramas exactos');
    await expect(veredicto).toContainText('las mismas 5 letras');
  });

  test('CASO 2e · modo frase: «roma» da 4 repartos y «ana maria» 15, ninguno repetido', async ({
    page,
  }) => {
    await abrirConDiccionario(page);
    await pestana(page, /Anagrama perfecto de una frase/).click();
    const buscarFrase = page.getByRole('button', { name: 'Buscar anagramas perfectos' });

    // Valores por defecto: los usados para resolver el caso.
    await expect(page.locator('#anagram-max-palabras')).toHaveValue('3');
    await expect(page.locator('#anagram-min-longitud')).toHaveValue('3');

    // Con 4 letras y mínimo 3 por palabra, dos palabras exigirían 6 letras: solo caben
    // soluciones de UNA palabra. Oráculo propio: los lemas de 4 letras con firma «amor» son
    // amor, maro, mora, ramo y roma; «roma» es la entrada y se excluye por trivial.
    await page.fill('#anagram-frase', 'roma');
    await expect(page.getByText('4 letras a repartir')).toBeVisible();
    await buscarFrase.click();
    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Anagramas perfectos encontrados: 4'
    );
    // En minúscula porque se compara el textContent: las mayúsculas que se ven las pone
    // `text-transform: uppercase` del CSS Module.
    await expect(page.locator('[class*="solucionCard"]')).toHaveText(['amor', 'maro', 'mora', 'ramo']);
    const soluciones = await page.locator('[class*="solucionCard"]').allTextContents();
    for (const solucion of soluciones) {
      expect(firma(solucion), `«${solucion}» no usa exactamente las letras de «roma»`).toBe(
        firma('roma')
      );
    }
    expect(soluciones.map((s) => s.trim())).not.toContain('roma');

    // Letras repetidas: 15 repartos exactos de «ana maria» (oráculo propio por fuerza bruta
    // sobre el lemario: a×4, i, m, n, r; máximo 3 palabras, mínimo 3 letras), sin la partición
    // trivial «ana|maria» y sin ninguno duplicado.
    await page.fill('#anagram-frase', 'ana maria');
    await expect(page.getByText('8 letras a repartir')).toBeVisible();
    await buscarFrase.click();
    await expect(page.locator('[class*="resultsHeader"] h3')).toHaveText(
      'Anagramas perfectos encontrados: 15'
    );
    // Ojo: aquí sí hace falta innerText y no textContent. En el DOM cada palabra es un <span>
    // sin separador, así que el textContent de la tarjeta «ami arana» y el de «amia rana» son
    // la misma cadena «amiarana» y parecerían repetidas sin serlo. innerText respeta el
    // maquetado (y devuelve las mayúsculas que pone el CSS, indiferente para lo que se mide).
    const repartos = await page.locator('[class*="solucionCard"]').allInnerTexts();
    expect(repartos).toHaveLength(15);
    const claves = repartos.map((r) => r.trim().toLowerCase().split(/\s+/).sort().join(' '));
    expect(new Set(claves).size, `hay repartos duplicados: ${claves.join(' / ')}`).toBe(15);
    for (const reparto of repartos) {
      expect(firma(reparto), `«${reparto}» no reparte las letras de «ana maria»`).toBe(
        firma('anamaria')
      );
    }
  });

  // ---------------------------------------------------------------------------------------
  // CASO 3 · RECHAZO
  // ---------------------------------------------------------------------------------------
  test('CASO 3 · una entrada sin letras no se busca, en ninguno de los dos modos', async ({
    page,
  }) => {
    await abrirConDiccionario(page);
    const buscarPalabras = page.getByRole('button', { name: 'Buscar palabras' });

    // Modo letras: «12345» y «@@@» no aportan ninguna letra tras normalizar.
    await page.fill('#anagram-letters', '12345');
    await expect(buscarPalabras).toBeDisabled();
    await page.fill('#anagram-letters', '@@@');
    await expect(buscarPalabras).toBeDisabled();
    await page.fill('#anagram-letters', 'a');
    await expect(buscarPalabras).toBeDisabled(); // una sola letra tampoco: el mínimo son 2
    await page.fill('#anagram-letters', 'am');
    await expect(buscarPalabras).toBeEnabled(); // el corte está donde dice estar

    // «zzzz» sí son letras: se busca de verdad y NO hay ninguna palabra (oráculo propio: 0).
    // Aquí el mensaje sí es legítimo, porque se ha buscado.
    await page.fill('#anagram-letters', 'zzzz');
    await buscarPalabras.click();
    await expect(page.locator('[class*="noResults"]')).toContainText(
      'No se encontraron palabras con esas letras'
    );
    await expect(page.locator('[class*="wordChip"]')).toHaveCount(0);

    // Modo frase: el contador dice la verdad y el botón queda inerte.
    await pestana(page, /Anagrama perfecto de una frase/).click();
    const buscarFrase = page.getByRole('button', { name: 'Buscar anagramas perfectos' });
    await page.fill('#anagram-frase', '12345');
    await expect(page.getByText('0 letras a repartir')).toBeVisible();
    await expect(buscarFrase).toBeDisabled();
    await page.fill('#anagram-frase', '@@@ ### !!!');
    await expect(page.getByText('0 letras a repartir')).toBeVisible();
    await expect(buscarFrase).toBeDisabled();
    await page.fill('#anagram-frase', 'ab');
    await expect(buscarFrase).toBeDisabled(); // menos de 3 letras: el mínimo del motor
    await page.fill('#anagram-frase', 'sal');
    await expect(buscarFrase).toBeEnabled();
  });

  // ---------------------------------------------------------------------------------------
  // REGRESIÓN — los 5 hallazgos de la primera pasada, reparados el 24/08/2026
  // ---------------------------------------------------------------------------------------
  test.describe('regresión de los 5 hallazgos reparados', () => {
    test('H1 · editar las letras invalida los resultados de la búsqueda anterior', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await page.fill('#anagram-letters', 'amor');
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      await expect(page.locator('[class*="wordChip"]')).toHaveCount(16);
      // Se cambian las letras sin volver a buscar: los 16 resultados de «amor» no pueden
      // seguir en pantalla presentados como los de «zzzz».
      await page.fill('#anagram-letters', 'zzzz');
      await expect(page.locator('[class*="wordChip"]')).toHaveCount(0);
      await expect(page.locator('[class*="resultsHeader"]')).toHaveCount(0);
    });

    test('H2 · el botón mide las letras útiles, no la longitud cruda del campo', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      // Medía `letters.length`, así que «12345» habilitaba el botón y al pulsarlo respondía
      // «No se encontraron palabras con esas letras» — culpando al diccionario de que el
      // usuario no hubiera escrito ninguna letra.
      await page.fill('#anagram-letters', '12345');
      await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeDisabled();
    });

    test('H3 · los <h3> del bloque educativo llevan el emoji con aria-hidden', async ({ page }) => {
      await abrirConDiccionario(page);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      // Eran 5 <h3> con el emoji pegado al texto: un lector de pantalla leía «edificio clásico
      // Historia y Tipos de Reorganización de Letras». CLAUDE.md global §5.
      // `node scripts/check-a11y-jsx.mjs app/generador-anagramas/page.tsx` ya da 0 incumplimientos.
      for (const titulo of [
        'Historia y Tipos de Reorganización',
        'Casos de Uso y Aplicaciones',
        'Preguntas Frecuentes sobre Anagramas',
        'Cómo Sacar el Máximo Partido',
        'Consejos de Estrategia',
      ]) {
        await expect(
          page.locator('h3', { hasText: titulo }).locator('[aria-hidden="true"]')
        ).toHaveCount(1);
      }
    });

    test('H4 · el modo letras no da veredicto antes de buscar', async ({ page }) => {
      await abrirConDiccionario(page);
      // El bloque se pintaba con `results.length === 0 && letters.length >= 2`, así que bastaba
      // teclear «amor» para que la app afirmara que no hay ninguna palabra. Al pulsar salen 16.
      await page.fill('#anagram-letters', 'amor');
      await expect(page.locator('[class*="noResults"]')).toHaveCount(0);
      await page.fill('#anagram-letters', 'corazon');
      await expect(page.locator('[class*="noResults"]')).toHaveCount(0);
    });

    test('H5 · los tres modos tratan «á» y «a» como la misma letra', async ({ page }) => {
      await abrirConDiccionario(page);

      // Modo letras (era el que discrepaba): «corazon» encuentra «corazón».
      await page.fill('#anagram-letters', 'corazon');
      await page.selectOption('#anagram-min', '7');
      await page.selectOption('#anagram-max', '7');
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      await expect(page.locator('[class*="wordChip"]')).toHaveText(['corazón']);

      // Modo frase: «Dalí» y «dali» reparten las mismas letras.
      await pestana(page, /Anagrama perfecto de una frase/).click();
      await page.fill('#anagram-frase', 'Dalí');
      await expect(page.getByText('4 letras a repartir')).toBeVisible();

      // Modo verificar: «corazón» y «corazon» son el mismo multiconjunto.
      await pestana(page, /Verificar dos textos/).click();
      await page.fill('#anagram-texto-a', 'corazón');
      await page.fill('#anagram-texto-b', 'corazon');
      await expect(page.locator('[class*="veredicto"]').first()).toContainText(
        'Son anagramas exactos'
      );
    });
  });

  // ---------------------------------------------------------------------------------------
  // HALLAZGOS 264-268 — segunda pasada del Inspector, 24/08/2026 · REPARADOS el 24/08/2026
  // Estaban escritos con test.fail(). Al repararlos se les ha quitado la marca y se ha
  // añadido la afirmación en POSITIVO: que la app ya no diga lo que decía es la mitad de la
  // prueba; la otra mitad es que diga lo correcto.
  // ---------------------------------------------------------------------------------------
  test.describe('hallazgos 264-268, ya reparados', () => {
    test(
      'la FAQ de tildes cuenta el comportamiento del motor, no el de antes de la reparación',
      async ({ page }) => {
        await abrirConDiccionario(page);
        await page.getByRole('button', { name: 'Ver guía educativa' }).click();
        const faq = page.locator('details', {
          hasText: '¿Las tildes cuentan como letras diferentes?',
        });
        // La reparación actualizó el aviso final («Tildes: da igual escribirlas o no… «corazon»
        // encuentra «corazón» y al revés») pero dejó intacta esta FAQ, que sigue diciendo lo
        // contrario y es donde mira quien tiene la duda. Comprobado en el CASO 2b: «arbol»
        // devuelve «árbol» sin teclear ninguna tilde.
        await expect(faq).not.toContainText(
          'deberás introducir las letras con tilde para que aparezca'
        );
        await expect(faq).toContainText('da igual escribir las tildes o no');
      }
    );

    test('el verificador no juzga dos textos sin ninguna letra', async ({ page }) => {
      await abrirConDiccionario(page);
      await pestana(page, /Verificar dos textos/).click();
      await page.fill('#anagram-texto-a', '123');
      await page.fill('#anagram-texto-b', '456');
      // Los dos textos tienen el mismo multiconjunto de letras (ninguna), y aun así la app
      // emite un ❌ «No son anagramas exactos. El original tiene 0 letras y la propuesta 0»,
      // sin listar ni una letra sobrante. Es el mismo patrón del H4 reparado —veredicto donde
      // no hay nada que juzgar— en el modo que la reparación no tocó.
      const veredicto = page.locator('[class*="veredicto"]').first();
      await expect(veredicto).not.toContainText('No son anagramas exactos');
      await expect(veredicto).toContainText('Todavía no hay nada que comparar');
      // Y en cuanto uno de los dos tiene letras, vuelve a haber veredicto
      await page.fill('#anagram-texto-a', 'roma');
      await page.fill('#anagram-texto-b', 'amor');
      await expect(veredicto).toContainText('Son anagramas exactos');
    });

    test('un rango de longitudes imposible ya no se puede pedir', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await page.fill('#anagram-letters', 'corazon');
      await page.selectOption('#anagram-min', '7');
      await page.selectOption('#anagram-max', '5'); // antes: mínimo > máximo, bucle que no itera
      // Los dos selectores se arrastran: al bajar el máximo por debajo del mínimo, el mínimo
      // baja con él. Nunca se llega a un rango vacío que luego se explique culpando a las
      // letras del usuario («prueba añadiendo más letras», que empuja al revés).
      await expect(page.locator('#anagram-min')).toHaveValue('5');
      await expect(page.locator('#anagram-max')).toHaveValue('5');
      // Y al revés: subir el mínimo por encima del máximo arrastra al máximo
      await page.selectOption('#anagram-min', '7');
      await expect(page.locator('#anagram-max')).toHaveValue('7');
      // Con el rango ya coherente (7..7) la búsqueda devuelve lo que tiene que devolver, en
      // vez del vacío que antes se explicaba culpando a las letras
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      await expect(page.locator('[class*="noResults"]')).toHaveCount(0);
      await expect(page.locator('[class*="wordCard"], [class*="word"]').first()).toBeVisible();
    });

    test('los datos del bloque educativo son correctos', async ({ page }) => {
      await abrirConDiccionario(page);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      // MURCIÉLAGO tiene 10 letras (m-u-r-c-i-é-l-a-g-o), no 12. Es el heterograma que la
      // tabla usa como ejemplo y el dato es contable a mano.
      await expect(page.locator('tr', { hasText: 'Heterograma' })).toContainText(
        'MURCIÉLAGO (10 letras únicas)'
      );
      // Y en el Scrabble español la Q vale 5 puntos (no 8) y no existe ficha K: el juego en
      // español no lleva K ni W. Los demás valores de esa lista sí son correctos.
      const scrabble = page.locator('details', {
        hasText: '¿Qué letras son más valiosas en Scrabble español?',
      });
      await expect(scrabble).not.toContainText('K (8)');
      await expect(scrabble).toContainText('Q (5)');
      await expect(scrabble).toContainText('no tiene fichas K ni W');
    });
  });
});

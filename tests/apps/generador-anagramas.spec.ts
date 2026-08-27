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
  // ---------------------------------------------------------------------------------------
  // TERCERA PASADA — 27/08/2026 · las FICHAS BLANCAS estrenadas en el commit fc27e76b
  //
  // No es una re-inspección de hallazgos: la cola se reabrió porque la app tiene código nuevo
  // sin estrenar. Se comprueba lo que el commit NO dice haber probado, y todo se resolvió
  // ANTES de abrir el navegador con un ORÁCULO PROPIO en Node —implementación independiente
  // de «normalizar (NFD, conservando la Ñ) + repartir multiconjunto con N comodines», escrita
  // contra public/data/diccionario-es.txt (86.973 lemas) sin importar nada de la app—.
  //
  // CIFRA DE CONTROL DEL COMMIT, REVERIFICADA POR ESE ORÁCULO (atril «casa», 2..10):
  //     0 blancas → 9 · 1 → 176 · 2 → 1.244 · 3 → 4.976 · 4 → 13.265   ✔ coinciden
  //
  // DIFERENCIAL COMPLETO app ↔ oráculo (12 atriles, no solo el total: la LISTA entera y la
  // POSICIÓN de cada resaltado): mesa 11 · palabra 37 · ñoquis 15 · sartén? 760 · bici?? 440 ·
  // ll? 10 · chal? (4..4) 37 · ax? (2..4) 27 · zzz? 1 · qu?? (2..5) 186 · aeiou? (5..5) 6 ·
  // perro?? (6..6) 259. Cero divergencias: ni una palabra de más, ni una de menos, ni un
  // resaltado corrido.
  //
  // CASOS LÍMITE DEL ORÁCULO USADOS ABAJO
  //   «a?»            → 23 palabras, todas de 2 letras y todas gastando la blanca
  //   «??»            → el motor daría 95 (todos los lemas de 2 letras); la app lo rechaza
  //   «?»             → daría 0 (un tile no llena una palabra de 2); la app lo rechaza
  //   «casa??»        → 1.244 = 74+343+489+243+95 por longitud; 9 sin gastar blanca
  //   «corazn?» (7..7)→ 8, y «corazón» sale con la blanca puesta EN LA Ó (posición 5)
  //   «casa?» + «ta»  → 10 palabras
  //   «abcdefghijklm??» (13 letras + 2 blancas, el máximo que admite el campo) → 8.847
  // ---------------------------------------------------------------------------------------
  test.describe('fichas blancas · tercera pasada 27/08/2026', () => {
    /** Cada chip con la letra que pone la blanca entre corchetes, EN SU POSICIÓN. */
    const chipsMarcados = (page: Page) =>
      page.locator('[class*="wordChip"]').evaluateAll((nodos) =>
        nodos.map((n) =>
          Array.from(n.childNodes)
            .map((h) => (h.nodeType === 1 ? `[${h.textContent}]` : h.textContent))
            .join('')
        )
      );

    const buscarAtril = async (page: Page, atril: string) => {
      await page.fill('#anagram-letters', atril);
      await page.getByRole('button', { name: 'Buscar palabras' }).click();
      await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeEnabled();
    };

    test('LÍMITE · «a?» (una sola letra y una blanca) da las 23 de dos letras', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await buscarAtril(page, 'a?');
      await expect(page.getByRole('heading', { name: /Palabras encontradas/ })).toHaveText(
        'Palabras encontradas: 23'
      );
      // Oráculo, en este orden exacto: ninguna puede evitar la blanca, así que dentro de la
      // única longitud manda el alfabético español (ál después de al, ña entre na y oa).
      expect(await chipsMarcados(page)).toEqual([
        'a[d]', 'a[h]', 'a[j]', 'a[l]', 'á[l]', 'a[m]', 'a[r]', 'a[s]', 'a[x]', 'a[y]',
        '[c]a', '[e]a', '[f]a', '[h]a', '[j]a', '[k]a', '[l]a', '[n]a', '[ñ]a', '[o]a',
        '[t]a', '[y]a', '[z]a',
      ]);
      // Y el único grupo es el de 2 letras: con 1+1 fichas no cabe nada más largo
      await expect(page.locator('[class*="groupTitle"]')).toHaveText(['2 letras (23)']);
    });

    test('LÍMITE · una sola blanca sin ninguna letra tampoco se busca', async ({ page }) => {
      await abrirConDiccionario(page);
      // El spec de comodines cubre «??»; «?» es el otro extremo y tiene otra cuenta detrás:
      // con una blanca y cero letras el oráculo da 0 palabras (la longitud mínima es 2), no 95.
      await page.fill('#anagram-letters', '?');
      await expect(page.locator('#anagram-atril')).toHaveText(/0 letras \+ 1 ficha blanca/);
      await expect(page.getByRole('button', { name: 'Buscar palabras' })).toBeDisabled();
    });

    test('LÍMITE · «casa??» reparte 1.244 por longitudes y marca las DOS blancas', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await buscarAtril(page, 'casa??');
      await expect(page.getByRole('heading', { name: /Palabras encontradas/ })).toHaveText(
        'Palabras encontradas: 1244'
      );
      // Reparto por longitud del oráculo. Que cuadre grupo a grupo prueba que el filtro de
      // longitud sigue trabajando sobre la forma normalizada también con dos blancas.
      await expect(page.locator('[class*="groupTitle"]')).toHaveText([
        '6 letras (74)', '5 letras (343)', '4 letras (489)', '3 letras (243)', '2 letras (95)',
      ]);
      // 1.244 − 9 = 1.235: las 9 que no gastan blanca son exactamente las de «casa» a secas
      await expect(page.locator('[class*="leyendaComodin"]')).toContainText(
        '1235 de las 1244 necesitan gastarla'
      );
      // Las dos blancas se resaltan por separado y en su sitio (oráculo: t@3 y e@4 en «acates»)
      const chips = await chipsMarcados(page);
      expect(chips.slice(0, 3)).toEqual(['aca[t][e]s', 'ac[o]sa[r]', 'ac[u]sa[r]']);
    });

    test('la blanca puede poner una Ñ y puede caer sobre una vocal con tilde', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await buscarAtril(page, 'casa?');
      const chips = await chipsMarcados(page);
      // La Ñ es letra propia del alfabeto (y ficha propia del juego): la blanca puede ponerla.
      expect(chips).toContain('ca[ñ]a');
      expect(chips).toContain('sa[ñ]a');
      // Y el resaltado cae sobre el carácter ORIGINAL, con su tilde, no sobre el normalizado
      expect(chips).toContain('as[í]');
      // Contraprueba de que no se ha corrido ningún índice: «casca» tiene dos C y el atril
      // solo trae una, así que la blanca va en la SEGUNDA (posición 3), no en la primera.
      expect(chips).toContain('cas[c]a');
    });

    test('el resaltado sobre un lema acentuado apunta a la letra correcta', async ({ page }) => {
      await abrirConDiccionario(page);
      await page.selectOption('#anagram-min', '7');
      await page.selectOption('#anagram-max', '7');
      await buscarAtril(page, 'corazn?');
      // Oráculo: 8 palabras de 7 letras, y en «corazón» la blanca pone la Ó (posición 5 de la
      // forma normalizada «corazon»). Es el caso que ejercita el mapeo normalizada → original.
      await expect(page.getByRole('heading', { name: /Palabras encontradas/ })).toHaveText(
        'Palabras encontradas: 8'
      );
      expect(await chipsMarcados(page)).toEqual([
        'arc[a]zón', 'az[a]rcón', 'coraz[ó]n', 'cr[i]azón', 'r[e]cazón', 'z[i]rcona',
        'zonc[e]ar', 'zonc[e]ra',
      ]);
    });

    test('el filtro «debe contener» sigue mandando cuando hay blanca', async ({ page }) => {
      await abrirConDiccionario(page);
      await page.fill('#anagram-contain', 'ta');
      await buscarAtril(page, 'casa?');
      // Oráculo: 10 palabras con «ta» dentro; en todas la T la pone la blanca, porque el
      // atril «casa» no tiene ninguna T.
      await expect(page.getByRole('heading', { name: /Palabras encontradas/ })).toHaveText(
        'Palabras encontradas: 10'
      );
      expect(await chipsMarcados(page)).toEqual([
        'cas[t]a', '[t]asca', 'ac[t]a', 'as[t]a', 'ca[t]a', '[t]aca', '[t]asa',
        '[t]ac', '[t]as', '[t]a',
      ]);
    });

    test('el atril más grande que admite el campo se pinta entero', async ({ page }) => {
      await abrirConDiccionario(page);
      // maxLength del campo = 15 caracteres. 13 letras + las 2 blancas del tope es el atril
      // máximo posible, y el oráculo da 8.847 palabras: casi el doble de las 4.976 que el
      // commit consideró impintables al fijar el tope en 2 comodines. Se pintan igualmente.
      await buscarAtril(page, 'abcdefghijklm??');
      await expect(page.getByRole('heading', { name: /Palabras encontradas/ })).toHaveText(
        'Palabras encontradas: 8847'
      );
      await expect(page.locator('[class*="wordChip"]')).toHaveCount(8847);
    });

    test('el comodín es del modo letras: el modo frase no lo usa ni lo cuenta', async ({
      page,
    }) => {
      await abrirConDiccionario(page);
      await pestana(page, /Anagrama perfecto/).click();
      await page.fill('#anagram-frase', 'roma?');
      // El «?» no es una letra a repartir y el contador no lo suma: un anagrama PERFECTO
      // consume todas las letras, y una blanca no tiene letra que consumir.
      await expect(page.locator('[class*="contadorLetras"]').first()).toHaveText(
        /^4 letras a repartir/
      );
      await page.getByRole('button', { name: 'Buscar anagramas perfectos' }).click();
      // Los mismos 4 repartos que «roma» a secas (CASO 2e del bloque de arriba)
      await expect(page.getByText(/Anagramas perfectos encontrados: 4/)).toBeVisible();
    });

    // -------------------------------------------------------------------------------------
    // HALLAZGOS ABIERTOS de esta pasada
    // -------------------------------------------------------------------------------------

    test(
      'HALLAZGO · la FAQ de la ficha blanca promete tres comodines y el tope son dos',
      async ({ page }) => {
        test.fail();
        await abrirConDiccionario(page);
        await page.getByRole('button', { name: 'Ver guía educativa' }).click();
        const faq = page.locator('details', {
          hasText: 'Tengo una ficha blanca en el atril, ¿cómo la escribo?',
        });
        // Dice «y hasta tres comodines a la vez», mientras el propio campo dice «Se admiten
        // hasta 2» y el motor tiene MAX_COMODINES = 2. Con «casa???» la app ignora la tercera
        // y devuelve 1.244, no las 4.976 que darían tres blancas (oráculo). Dos afirmaciones
        // opuestas en la misma página, y la falsa es la que responde a la pregunta: el mismo
        // patrón del hallazgo 264, ya reparado, en la FAQ que estrena el commit.
        await expect(faq).not.toContainText('hasta tres comodines');
        await expect(faq).toContainText(/hasta dos comodines|dos a la vez|hasta 2/);
      }
    );

    test(
      'HALLAZGO · el JSON-LD sigue describiendo la app anterior a las fichas blancas',
      async ({ page }) => {
        test.fail();
        await page.goto(RUTA);
        const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
        const faqPage = bloques.find((b) => b.includes('FAQPage')) ?? '';
        expect(faqPage).not.toBe('');
        // Ni los 8 `features` del WebApplication ni las 7 preguntas del FAQPage nombran la
        // ficha blanca; la pregunta de Scrabble sigue diciendo «Introduce las letras que
        // tienes en tu atril (entre 2 y 10 letras)», que además ya no es el límite (el campo
        // admite 15 caracteres). Es la señal estructurada que usan Bing Copilot, ChatGPT,
        // Perplexity y Gemini para responder: la app tiene comodines y su ficha no lo sabe.
        expect(bloques.join(' ')).toMatch(/ficha blanca|comod/i);
      }
    );

    test(
      'HALLAZGO · el rechazo del atril de solo comodines se justifica con una cifra falsa',
      async ({ page }) => {
        test.fail();
        await abrirConDiccionario(page);
        await page.fill('#anagram-letters', '??');
        // «solo con comodines saldría medio diccionario» — con el tope de 2 blancas y ninguna
        // letra saldrían 95 palabras: TODOS los lemas de dos letras y nada más, porque tres
        // fichas no caben en dos blancas. 95 de 86.973 es el 0,1 %, no la mitad. La regla es
        // correcta; el número con el que se explica, no.
        await expect(page.locator('#anagram-atril')).toContainText(
          'hace falta al menos una letra concreta'
        );
        await expect(page.locator('#anagram-atril')).not.toContainText('medio diccionario');
      }
    );
  });
});

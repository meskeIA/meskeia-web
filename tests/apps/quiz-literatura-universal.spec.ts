import { test, expect, type Page } from '@playwright/test';

/**
 * Quiz de Literatura Universal — test de regresión del Inspector (1.ª pasada 25/08/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz de Literatura Universal» · subtítulo «Pon a prueba tus conocimientos
 *   literarios: autores, obras, movimientos y citas célebres».
 * · Pantalla de selección: 4 botones de nivel (Básico, Medio, Avanzado, Mezcla) y el
 *   rótulo «15 preguntas aleatorias · Explicación tras cada respuesta».
 * · metadata.ts (title, description, twitter, jsonLd y faqJsonLd): «50 preguntas»,
 *   «3 niveles», «4 categorías», «Selección aleatoria de 15 preguntas por partida».
 * · Bloque educativo: «Cada partida selecciona 15 preguntas aleatorias del pool. Con
 *   varios intentos verás preguntas diferentes».
 *
 * En un quiz la promesa incluye dos cosas que el maquetado no enseña: que la opción
 * marcada como correcta lo sea DE VERDAD, y que el marcador cuente bien.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · BANCO (abajo): los 46 pares pregunta ↔ respuesta correcta transcritos de POOL en
 *   `app/quiz-literatura-universal/page.tsx` y contrastados uno a uno contra el hecho
 *   literario (autor, año, obra, movimiento, personaje). Se escriben aquí a mano, y NO se
 *   importan de la app, para que el test contraste la clave de respuestas contra la
 *   literatura y no contra sí misma: si mañana alguien mueve un `correcta:`, esto falla.
 * · Los tamaños de partida salen de `PREGUNTAS_POR_PARTIDA = 15` y del propio banco:
 *   `mezclar(nivel).slice(0, 15)` → Básico 15 (de 17), Medio 15 (de 16), Avanzado 13
 *   (de 13, el banco no llega a 15), Mezcla 15 (de 46).
 * · Las etiquetas finales salen de `evaluacion(aciertos, total)` de page.tsx:
 *   pct ≥ 0,9 «¡Excelente! Dominas la literatura.» 🏆 · ≥ 0,7 «Muy bien. Buen nivel
 *   literario.» 🌟 · ≥ 0,5 «Bien. Hay terreno por explorar.» 📚 · resto «Sigue leyendo.
 *   El conocimiento llega con tiempo.» 🌱
 * · El ancho de la barra final es `Math.round(aciertos / total * 100)` en %.
 *
 * ALEATORIEDAD
 * ────────────
 * `mezclar()` usa Math.random y no hay semilla en la UI. En vez de fijar el PRNG (que ata
 * el test a cuántos números consume React al hidratar), se juega con el banco en la mano:
 * se lee el enunciado que sale y se pulsa la opción que la historia de la literatura dice
 * que es la buena. Lo que se comprueba son invariantes que valen en CUALQUIER tanda.
 *
 * HALLAZGOS de esta pasada: los diez se repararon el 25/08/2026 y los que se pueden
 * comprobar aquí quedan al final como regresión, ya sin `test.fail()`.
 *
 * Lo que NO vive en este fichero, y por qué: desde el 25/08/2026 el banco está en
 * `app/quiz-literatura-universal/preguntas.ts`, y sus invariantes —reparto de la correcta
 * entre las cuatro posiciones, tamaño de cada nivel, cobertura geográfica y las
 * explicaciones de b05, m11, a01 y a09— se comprueban contando sobre el banco entero en
 * `tests/quiz-literatura-banco.spec.ts`, sin abrir el navegador. Aquí solo queda lo que
 * exige una partida de verdad.
 */

const RUTA = '/quiz-literatura-universal/';

/**
 * Preguntas por nivel en POOL, contadas en `app/quiz-literatura-universal/preguntas.ts`.
 * El 25/08/2026 eran 17/16/13 y pasaron a 19/19/18: diez preguntas nuevas para que ningún
 * nivel quedara por debajo del tamaño de partida (hallazgo 298) y para que un quiz de
 * literatura «universal» tuviera alguna pregunta de Asia, Oriente Medio o India (309).
 */
const POR_NIVEL = { basico: 19, medio: 19, avanzado: 18 } as const;
/** Total del banco. La metadata lo deriva de ahí desde el 25/08/2026; antes decía «50». */
const TOTAL_BANCO = 56;
/** `PREGUNTAS_POR_PARTIDA` de page.tsx. */
const POR_PARTIDA = 15;

type Nivel = 'basico' | 'medio' | 'avanzado';

/**
 * Clave de respuestas: enunciado → respuesta correcta, verificada contra el hecho
 * literario. Los identificadores son los de POOL, para poder nombrar un hallazgo.
 */
const BANCO: Record<string, { id: string; nivel: Nivel; correcta: string }> = {
  // ── BÁSICO ──
  "¿Quién escribió \"Don Quijote de la Mancha\"?":
    { id: "b01", nivel: "basico", correcta: "Miguel de Cervantes" },
  "¿De qué novela es la primera frase «Llamadme Ismael»?":
    { id: "b02", nivel: "basico", correcta: "Moby Dick" },
  "¿Quién escribió \"Cien años de soledad\"?":
    { id: "b03", nivel: "basico", correcta: "Gabriel García Márquez" },
  "¿En qué movimiento literario se enmarca \"Cien años de soledad\"?":
    { id: "b04", nivel: "basico", correcta: "Realismo mágico" },
  "¿Quién creó al detective Sherlock Holmes?":
    { id: "b05", nivel: "basico", correcta: "Arthur Conan Doyle" },
  "¿A qué obra pertenece el personaje de Emma Bovary?":
    { id: "b06", nivel: "basico", correcta: "Madame Bovary" },
  "¿Quién escribió \"Romeo y Julieta\"?":
    { id: "b07", nivel: "basico", correcta: "William Shakespeare" },
  "¿Quién escribió \"1984\"?":
    { id: "b08", nivel: "basico", correcta: "George Orwell" },
  "¿De qué país procedía Homero, autor de \"La Odisea\"?":
    { id: "b09", nivel: "basico", correcta: "Grecia" },
  "¿Quién escribió \"La metamorfosis\", en la que un hombre despierta convertido en insecto?":
    { id: "b10", nivel: "basico", correcta: "Franz Kafka" },
  "¿Quién escribió \"Orgullo y prejuicio\"?":
    { id: "b11", nivel: "basico", correcta: "Jane Austen" },
  "¿Quién escribió \"El extranjero\"?":
    { id: "b12", nivel: "basico", correcta: "Albert Camus" },
  "¿De qué país es el escritor Jorge Luis Borges?":
    { id: "b13", nivel: "basico", correcta: "Argentina" },
  "¿Qué novela comienza con «Era el mejor de los tiempos, era el peor de los tiempos»?":
    { id: "b14", nivel: "basico", correcta: "Historia de dos ciudades" },
  "¿A qué movimiento pertenece la obra de Victor Hugo?":
    { id: "b15", nivel: "basico", correcta: "Romanticismo" },
  "¿Qué protagonista de Dostoievski asesina a una vieja usurera?":
    { id: "b16", nivel: "basico", correcta: "Rodion Raskólnikov" },
  "¿Qué escritor colombiano ganó el Nobel de Literatura en 1982?":
    { id: "b17", nivel: "basico", correcta: "Gabriel García Márquez" },

  // ── MEDIO ──
  "¿Qué técnica narrativa reproduce el flujo de pensamientos sin orden lógico?":
    { id: "m01", nivel: "medio", correcta: "Flujo de conciencia" },
  "¿En qué ciudad transcurre \"Mrs. Dalloway\" de Virginia Woolf?":
    { id: "m02", nivel: "medio", correcta: "Londres" },
  "¿A qué generación literaria española pertenece Federico García Lorca?":
    { id: "m03", nivel: "medio", correcta: "Generación del 27" },
  "¿Cuál de estas novelas de Proust es la primera de \"En busca del tiempo perdido\"?":
    { id: "m04", nivel: "medio", correcta: "Por el camino de Swann" },
  "¿En qué consiste la «teoría del iceberg» de Hemingway?":
    { id: "m05", nivel: "medio", correcta: "Lo importante permanece implícito bajo la superficie del texto" },
  "¿Qué movimiento literario surge en Latinoamérica en los años 60 con Cortázar, Fuentes y Vargas Llosa?":
    { id: "m06", nivel: "medio", correcta: "Boom Latinoamericano" },
  "¿Qué escritor chileno ganó el Nobel de Literatura en 1971?":
    { id: "m07", nivel: "medio", correcta: "Pablo Neruda" },
  "¿Qué obra de Umberto Eco está ambientada en un monasterio medieval con un misterio de fondo?":
    { id: "m08", nivel: "medio", correcta: "El nombre de la rosa" },
  "¿Qué escritora escribió \"La casa de los espíritus\"?":
    { id: "m09", nivel: "medio", correcta: "Isabel Allende" },
  "¿Qué técnica utilizó Flaubert para fusionar narrador y personaje sin marcas tipográficas?":
    { id: "m10", nivel: "medio", correcta: "Estilo indirecto libre" },
  "¿Qué escritor ruso escribió \"Ana Karenina\"?":
    { id: "m11", nivel: "medio", correcta: "León Tolstói" },
  "¿Qué escritor peruano ganó el Premio Nobel de Literatura en 2010?":
    { id: "m12", nivel: "medio", correcta: "Mario Vargas Llosa" },
  "¿Qué novela de Dostoievski gira en torno al asesinato del padre Karamázov?":
    { id: "m13", nivel: "medio", correcta: "Los hermanos Karamázov" },
  "¿A qué movimiento literario pertenece la obra de Émile Zola?":
    { id: "m14", nivel: "medio", correcta: "Naturalismo" },
  "¿Qué narrador protagoniza \"El gran Gatsby\" de F. Scott Fitzgerald?":
    { id: "m15", nivel: "medio", correcta: "Nick Carraway" },
  "¿De qué obra es la apertura \"Muchos años después, frente al pelotón de fusilamiento…\"?":
    { id: "m16", nivel: "medio", correcta: "Cien años de soledad" },

  // ── AVANZADO ──
  "¿Qué concepto de Bajtín describe la coexistencia de múltiples voces autónomas en Dostoievski?":
    { id: "a01", nivel: "avanzado", correcta: "Novela polifónica" },
  "¿En qué novela de Italo Calvino el «Lector» es el protagonista en segunda persona?":
    { id: "a02", nivel: "avanzado", correcta: "Si una noche de invierno un viajero" },
  "¿Qué teórico ruso acuñó el término «ostranenie» (defamiliarización)?":
    { id: "a03", nivel: "avanzado", correcta: "Víktor Shklovski" },
  "¿Qué escritora brasileña escribió \"La pasión según G.H.\"?":
    { id: "a04", nivel: "avanzado", correcta: "Clarice Lispector" },
  "¿En qué obra de Samuel Beckett dos personajes esperan eternamente a alguien que no llega?":
    { id: "a05", nivel: "avanzado", correcta: "Esperando a Godot" },
  "¿Qué novela de Juan Rulfo influyó decisivamente en García Márquez y el Boom?":
    { id: "a06", nivel: "avanzado", correcta: "Pedro Páramo" },
  "¿Qué movimiento narrativo francés de los años 50-60 rechazó la psicología de personajes y el argumento tradicional?":
    { id: "a07", nivel: "avanzado", correcta: "Nouveau Roman" },
  "¿Qué escritor nigeriano escribió \"El mundo se despedaza\" (Things Fall Apart)?":
    { id: "a08", nivel: "avanzado", correcta: "Chinua Achebe" },
  "¿Qué novela de Roberto Bolaño sigue a jóvenes poetas que buscan a la escritora Cesárea Tinajero?":
    { id: "a09", nivel: "avanzado", correcta: "Los detectives salvajes" },
  "¿Qué categoría propuso Genette para describir quién ve o percibe la historia, frente a quién la cuenta?":
    { id: "a10", nivel: "avanzado", correcta: "Focalización" },
  "¿Qué escritora austríaca ganó el Nobel de Literatura en 2004?":
    { id: "a11", nivel: "avanzado", correcta: "Elfriede Jelinek" },
  "¿En qué año publicó Cervantes la segunda parte del Quijote?":
    { id: "a12", nivel: "avanzado", correcta: "1615" },
  "¿Quién acuñó el término «realismo mágico» en 1925, y a propósito de qué arte?":
    { id: "a13", nivel: "avanzado", correcta: "Franz Roh, a propósito de la pintura" },

  // ── AÑADIDAS EL 25/08/2026 (hallazgos 298 y 309) ──
  // Diez preguntas nuevas: el banco no tenía NINGUNA de Asia, Oriente Medio ni India, y el
  // nivel Avanzado se quedaba en 13, por debajo del tamaño de partida que la app anuncia.
  "¿Qué obra japonesa del siglo XI, escrita por Murasaki Shikibu, se cita a menudo como una de las primeras novelas de la literatura universal?":
    { id: "b18", nivel: "basico", correcta: "La historia de Genji" },
  "¿De qué colección proceden los relatos de Simbad, Aladino y Alí Babá?":
    { id: "b19", nivel: "basico", correcta: "Las mil y una noches" },
  "¿Qué poeta indio, autor de \"Gitanjali\", fue el primer no europeo en recibir el Nobel de Literatura?":
    { id: "m17", nivel: "medio", correcta: "Rabindranath Tagore" },
  "¿Qué escritor egipcio, autor de la \"Trilogía de El Cairo\", ganó el Nobel de Literatura en 1988?":
    { id: "m18", nivel: "medio", correcta: "Naguib Mahfuz" },
  "¿Qué forma poética japonesa de tres versos y 17 moras llevó a su cumbre Matsuo Bashō en el siglo XVII?":
    { id: "m19", nivel: "medio", correcta: "El haiku" },
  "¿Qué novela china del siglo XVIII, atribuida a Cao Xueqin, retrata la decadencia de una familia aristocrática?":
    { id: "a14", nivel: "avanzado", correcta: "Sueño en el pabellón rojo" },
  "¿Qué escritor recibió el Nobel de Literatura en 2012 por una obra que «funde cuentos populares, historia y contemporaneidad»?":
    { id: "a15", nivel: "avanzado", correcta: "Mo Yan" },
  "¿Qué poeta persa del siglo XIII es autor del \"Masnavi\", una de las obras centrales del sufismo?":
    { id: "a16", nivel: "avanzado", correcta: "Yalal ad-Din Rumi" },
  "¿Qué autora surcoreana ganó el Premio Booker Internacional en 2016 por \"La vegetariana\"?":
    { id: "a17", nivel: "avanzado", correcta: "Han Kang" },
  "¿Qué novela empieza con «Todas las familias felices se parecen; cada familia infeliz lo es a su manera»?":
    { id: "a18", nivel: "avanzado", correcta: "Ana Karenina" },
};

// ─── Utilidades de lectura de la pantalla ────────────────────────────────────

const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

/** Los 4 botones de respuesta de la pregunta visible, en orden A-B-C-D. */
function opciones(page: Page) {
  return page.locator('button').filter({ has: page.locator('[class*="opcionLetra"]') });
}

/** Texto de las 4 opciones, en orden. */
async function textosOpcion(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => b.querySelector('[class*="opcionLetra"]'))
      .map((b) => b.querySelector('[class*="opcionTexto"]')?.textContent?.trim() ?? '')
  );
}

/** Enunciado de la pregunta visible. */
async function enunciado(page: Page): Promise<string> {
  return norm(await page.locator('h2[class*="pregunta"]').first().innerText());
}

/** «3/15» de la cabecera. */
async function contador(page: Page): Promise<string> {
  return norm(await page.locator('[class*="quizNumero"]').innerText());
}

/** La ficha final: puntuación, etiqueta, emoji y ancho de la barra. */
async function resultado(page: Page) {
  return page.evaluate(() => ({
    puntuacion: document.querySelector('[class*="resultadoPuntuacion"]')!.textContent!.replace(/\s+/g, ' ').trim(),
    etiqueta: document.querySelector('[class*="resultadoLabel"]')!.textContent!.trim(),
    emoji: document.querySelector('[class*="resultadoEmoji"]')!.textContent!.trim(),
    barra: (document.querySelector('[class*="resultadoBarraFill"]') as HTMLElement).style.width,
  }));
}

async function arrancar(page: Page, nivel: RegExp) {
  await page.goto(RUTA);
  await page.getByRole('button', { name: nivel }).click();
  await page.getByRole('button', { name: /Empezar el quiz/ }).click();
}

/**
 * Comprueba la pregunta visible contra el banco y la responde.
 * `modo` 'bien' pulsa la respuesta correcta; 'mal', la primera que no lo es.
 * Devuelve la ficha del banco y la letra (A-D) en la que estaba la correcta.
 */
async function responder(page: Page, modo: 'bien' | 'mal') {
  const texto = await enunciado(page);
  const ficha = BANCO[texto];
  expect(ficha, `enunciado fuera del banco verificado: «${texto}»`).toBeTruthy();

  const ops = await textosOpcion(page);
  expect(ops, 'toda pregunta ofrece 4 opciones').toHaveLength(4);
  expect(new Set(ops).size, `opciones repetidas en ${ficha.id}: ${ops.join(' · ')}`).toBe(4);

  const iCorrecta = ops.indexOf(ficha.correcta);
  expect(
    iCorrecta,
    `en ${ficha.id} la respuesta correcta «${ficha.correcta}» no está entre las ofrecidas: ${ops.join(' · ')}`
  ).toBeGreaterThanOrEqual(0);

  const iPulsar = modo === 'bien' ? iCorrecta : (iCorrecta === 0 ? 1 : 0);
  await opciones(page).nth(iPulsar).click();

  // Tras responder, las cuatro quedan bloqueadas: no se puede cambiar la respuesta
  for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeDisabled();

  return { ficha, letra: String.fromCharCode(65 + iCorrecta) };
}

/** Pulsa «Siguiente →» / «Ver resultado». Devuelve el rótulo que tenía el botón. */
async function avanzar(page: Page): Promise<string> {
  const btn = page.getByRole('button', { name: /Siguiente|Ver resultado/ });
  const rotulo = norm(await btn.innerText());
  await btn.click();
  return rotulo;
}

/**
 * Juega una partida entera. `aciertosDeseados` respuestas correctas y el resto falladas.
 * Devuelve los identificadores jugados y las letras en que apareció la correcta.
 */
async function jugarPartida(page: Page, aciertosDeseados: number) {
  const ids: string[] = [];
  const letras: string[] = [];
  for (let n = 1; ; n++) {
    const { ficha, letra } = await responder(page, n <= aciertosDeseados ? 'bien' : 'mal');
    ids.push(ficha.id);
    letras.push(letra);
    if (/Ver resultado/.test(await avanzar(page))) break;
  }
  return { ids, letras, total: ids.length };
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz de Literatura Universal', () => {
  /**
   * CASO NORMAL — Básico, 10 respuestas correctas y 5 falladas a propósito.
   *
   * Esperado (calculado a mano ANTES de ejecutar la app):
   *   · 15 preguntas (POR_PARTIDA=15, y el banco básico tiene 17), ninguna repetida,
   *     todas de nivel básico, contador de 1/15 a 15/15.
   *   · marcador final «10 / 15 correctas»
   *   · 10/15 = 0,6667 → cae en el tramo ≥ 0,5 y < 0,7 de `evaluacion()`
   *     → «Bien. Hay terreno por explorar.» 📚
   *   · barra final Math.round(10/15*100) = 67%
   */
  test('caso normal: 10 aciertos y 5 fallos en Básico dan «10 / 15 correctas» y «Bien. Hay terreno por explorar.»', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto(RUTA);

    await expect(page.locator('h1')).toHaveText('Quiz de Literatura Universal');
    await expect(page.locator('[class*="seleccionInfo"]')).toHaveText(
      `${POR_PARTIDA} preguntas aleatorias · Explicación tras cada respuesta`
    );

    await page.getByRole('button', { name: /^Básico/ }).click();
    await page.getByRole('button', { name: /Empezar el quiz/ }).click();

    const ids: string[] = [];
    for (let n = 1; ; n++) {
      expect(await contador(page), `cabecera en la pregunta ${n}`).toBe(`${n}/${POR_PARTIDA}`);

      const { ficha } = await responder(page, n <= 10 ? 'bien' : 'mal');
      expect(ficha.nivel, `«Básico» ha colado una pregunta de nivel ${ficha.nivel} (${ficha.id})`).toBe('basico');
      ids.push(ficha.id);

      // La explicación educativa aparece siempre, se acierte o se falle
      await expect(page.locator('[class*="explicacion"]').first()).toBeVisible();

      const rotulo = await avanzar(page);
      expect(rotulo, `rótulo del botón en la pregunta ${n}`).toBe(n < POR_PARTIDA ? 'Siguiente →' : 'Ver resultado');
      if (/Ver resultado/.test(rotulo)) break;
    }

    // mezclar()+slice() reparte sin reposición: 15 preguntas distintas de las 17 básicas
    expect(ids).toHaveLength(POR_PARTIDA);
    expect(new Set(ids).size, `pregunta repetida en la misma partida: ${ids.join(',')}`).toBe(POR_PARTIDA);

    expect(await resultado(page)).toEqual({
      puntuacion: '10 / 15 correctas', // 10 pulsaciones acertadas de 15 preguntas
      etiqueta: 'Bien. Hay terreno por explorar.', // 0,6667 → tramo [0,5 · 0,7) de evaluacion()
      emoji: '📚',
      barra: '67%', // Math.round(10/15*100)
    });
  });

  /**
   * CASO LÍMITE — Avanzado con TODAS las respuestas correctas.
   *
   * Esperado (calculado a mano ANTES de ejecutar la app):
   *   · Desde el 25/08/2026 el banco avanzado tiene 18 preguntas, así que la partida es de
   *     las 15 que la pantalla anterior anuncia. Antes eran 13 de 13 y el rótulo mentía
   *     (hallazgo 298).
   *   · marcador final «15 / 15 correctas»
   *   · 15/15 = 1,0 ≥ 0,9 → «¡Excelente! Dominas la literatura.» 🏆 · barra 100%
   */
  test('caso límite: todas correctas en Avanzado dan pleno y «¡Excelente! Dominas la literatura.»', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const esperadas = Math.min(POR_PARTIDA, POR_NIVEL.avanzado); // = 15
    await arrancar(page, /^Avanzado/);

    expect(await contador(page)).toBe(`1/${esperadas}`);

    const { ids, total } = await jugarPartida(page, Number.MAX_SAFE_INTEGER);
    expect(total, 'la partida de Avanzado no da las preguntas que anuncia').toBe(esperadas);
    expect(new Set(ids).size).toBe(esperadas);
    expect(ids.every((id) => id.startsWith('a')), `«Avanzado» ha colado otro nivel: ${ids.join(',')}`).toBe(true);

    expect(await resultado(page)).toEqual({
      puntuacion: `${esperadas} / ${esperadas} correctas`,
      etiqueta: '¡Excelente! Dominas la literatura.', // pct = 1,0 ≥ 0,9
      emoji: '🏆',
      barra: '100%',
    });
  });

  /**
   * CASO DE RECHAZO / ROBUSTEZ — pulsar dos veces la misma opción, intentar cambiar la
   * respuesta ya dada, y reiniciar para comprobar que el marcador vuelve a cero.
   *
   * Esperado (calculado a mano ANTES de ejecutar la app):
   *   · `handleRespuesta` sale por `if (respondida) return`, así que el 2.º clic en la
   *     misma opción NO suma otro acierto y el clic en una opción distinta no cambia nada:
   *     1 acierto, no 2, y la marcada sigue siendo la primera.
   *   · resto falladas → «1 / 15 correctas»; 1/15 = 0,0667 < 0,5
   *     → «Sigue leyendo. El conocimiento llega con tiempo.» 🌱 · barra Math.round(6,67)=7%
   *   · «Jugar de nuevo» devuelve a la selección; la partida siguiente, toda fallada,
   *     tiene que dar «0 / 15 correctas» y barra 0% — el marcador NO arrastra el acierto.
   */
  test('caso de rechazo: el doble clic no cuenta dos veces y el reinicio deja el marcador a cero', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await arrancar(page, /^Básico/);

    // ── Pregunta 1: doble clic en la correcta y luego clic en otra opción ──
    const texto = await enunciado(page);
    const ficha = BANCO[texto];
    expect(ficha, `enunciado fuera del banco verificado: «${texto}»`).toBeTruthy();

    const ops = await textosOpcion(page);
    const iCorrecta = ops.indexOf(ficha.correcta);
    const iOtra = iCorrecta === 0 ? 1 : 0;

    await opciones(page).nth(iCorrecta).click();
    await opciones(page).nth(iCorrecta).click({ force: true }); // 2.º clic: debe ser inerte
    await opciones(page).nth(iOtra).click({ force: true });     // cambiar de idea: también

    // Solo la correcta queda marcada como acertada; la otra NO se marca como fallada
    const estado = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => b.querySelector('[class*="opcionLetra"]'))
        .map((b) => ({
          bien: /opcionCorrecta/.test(b.className),
          mal: /opcionIncorrecta/.test(b.className),
          disabled: (b as HTMLButtonElement).disabled,
        }))
    );
    expect(estado.filter((e) => e.bien)).toHaveLength(1);
    expect(estado.filter((e) => e.mal), 'el clic tardío en otra opción la ha marcado como fallada').toHaveLength(0);
    expect(estado[iCorrecta].bien).toBe(true);
    expect(estado.every((e) => e.disabled)).toBe(true);

    await avanzar(page);

    // ── Las 14 restantes, falladas a propósito ──
    for (let n = 2; ; n++) {
      await responder(page, 'mal');
      if (/Ver resultado/.test(await avanzar(page))) break;
    }

    expect(await resultado(page)).toEqual({
      puntuacion: '1 / 15 correctas', // 1 acierto pese a los 3 clics sobre la pregunta 1
      etiqueta: 'Sigue leyendo. El conocimiento llega con tiempo.', // 0,0667 < 0,5
      emoji: '🌱',
      barra: '7%', // Math.round(1/15*100)
    });

    // ── Reinicio: el marcador tiene que volver a cero ──
    await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
    await expect(page.getByRole('button', { name: /Empezar el quiz/ })).toBeVisible();

    await page.getByRole('button', { name: /^Básico/ }).click();
    await page.getByRole('button', { name: /Empezar el quiz/ }).click();
    await jugarPartida(page, 0);

    expect(await resultado(page)).toEqual({
      puntuacion: '0 / 15 correctas', // no arrastra el acierto de la partida anterior
      etiqueta: 'Sigue leyendo. El conocimiento llega con tiempo.',
      emoji: '🌱',
      barra: '0%',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * HALLAZGOS de la 1.ª pasada (25/08/2026), REPARADOS el mismo día. Ya sin `test.fail()`:
 * quedan como regresión.
 */
test.describe('Regresión de los hallazgos del Inspector', () => {
  /**
   * 298 · La pantalla de selección prometía «15 preguntas aleatorias» en los cuatro modos,
   * pero el banco avanzado solo tenía 13 y `slice(0, 15)` las entregaba todas: la partida
   * era de 13 y, además, SIEMPRE el mismo conjunto de preguntas, solo reordenado — con lo
   * que la FAQ de la propia app («Con varios intentos verás preguntas diferentes») tampoco
   * podía cumplirse en Avanzado.
   *
   * Reparado por los dos lados: el rótulo se calcula del banco y ya no puede prometer de
   * más, y el nivel Avanzado pasó de 13 a 18 preguntas para que la promesa sea alcanzable.
   */
  test('298 · Avanzado entrega las 15 preguntas que anuncia la pantalla de selección', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(RUTA);
    await page.getByRole('button', { name: /^Avanzado/ }).click();
    await expect(page.locator('[class*="seleccionInfo"]')).toContainText(`${POR_PARTIDA} preguntas aleatorias`);
    await page.getByRole('button', { name: /Empezar el quiz/ }).click();
    expect(await contador(page)).toBe(`1/${POR_PARTIDA}`);
  });

  /**
   * 303 · Tras responder, si la respuesta fue correcta o no se transmitía ÚNICAMENTE por
   * color (borde/fondo verde o rojo) y por dos marcas ✓/✗ que llevan aria-hidden="true".
   * El nombre accesible de los botones no cambiaba, la explicación no era región live y no
   * decía «correcto» ni «incorrecto»: quien no ve el color no se enteraba de si había
   * acertado hasta el marcador final. WCAG 1.4.1 (uso del color).
   *
   * Reparado por los dos caminos, y aquí se exigen los dos: el nombre accesible del botón
   * lleva el veredicto, y la explicación va dentro de una región live que además empieza
   * diciendo en texto si se acertó y cuál era la respuesta buena.
   */
  test('303 · el acierto o el fallo llegan también en texto, no solo por color', async ({ page }) => {
    await arrancar(page, /^Básico/);

    const ficha = BANCO[await enunciado(page)];
    const ops = await textosOpcion(page);
    const iCorrecta = ops.indexOf(ficha.correcta);
    const iFallada = iCorrecta === 0 ? 1 : 0;
    await opciones(page).nth(iFallada).click(); // se falla a propósito

    // El nombre accesible de un botón con aria-label ES el aria-label: eso es lo que lee un
    // lector de pantalla, no el texto visible.
    const nombres = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => b.querySelector('[class*="opcionLetra"]'))
        .map((b) => {
          const etiqueta = b.getAttribute('aria-label');
          if (etiqueta) return etiqueta.replace(/\s+/g, ' ').trim();
          const clon = b.cloneNode(true) as HTMLElement;
          clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
          return clon.textContent!.replace(/\s+/g, ' ').trim();
        })
    );
    expect(nombres[iCorrecta], 'la opción buena no se anuncia como correcta').toMatch(/respuesta correcta/i);
    expect(nombres[iFallada], 'la opción fallada no se anuncia como incorrecta').toMatch(/incorrecta/i);

    // Y la explicación, dentro de una región live que dice el veredicto antes de explicar.
    const region = page.locator('[role="status"]').filter({ has: page.locator('[class*="explicacion"]') });
    await expect(region).toHaveCount(1);
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('[class*="explicacionVeredicto"]')).toContainText(
      `Incorrecto. La respuesta era: ${ficha.correcta}`,
    );
  });

  /**
   * H3 · metadata.ts anuncia «50 preguntas» en cinco sitios (title, description, twitter,
   * jsonLd.description y jsonLd.features) y en el faqJsonLd, que es el que las IAs usan
   * para grounding. En POOL hay 46.
   */
  test('299 · el JSON-LD servido no anuncia más preguntas de las que tiene el banco', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '')
    );
    const anunciadas = bloques.join(' ').match(/(\d+)\s+preguntas/g) ?? [];
    const exageradas = anunciadas.filter((t) => Number(t.match(/\d+/)![0]) > TOTAL_BANCO);
    expect(exageradas, `el banco tiene ${TOTAL_BANCO} preguntas y el JSON-LD dice: ${anunciadas.join(', ')}`).toEqual([]);
  });

  /**
   * 300 · Sesgo de posición: en las 46 preguntas del banco la correcta estaba 0 veces en A,
   * 3 en B, 19 en C y 24 en D, y las opciones no se barajaban al pintarlas, así que el sesgo
   * era estable y explotable: responder siempre «D» sacaba 24/46 (52 %) sin saber nada de
   * literatura, y responder siempre «A» sacaba cero garantizado.
   *
   * La reparación es el barajado en la partida, y eso es lo que se comprueba aquí: que a lo
   * largo de una partida la correcta NO cae siempre en la misma letra. El reparto del banco
   * en sí lo vigila `tests/quiz-literatura-banco.spec.ts`, que puede contarlo entero sin
   * abrir el navegador.
   *
   * Se juegan varias partidas seguidas porque una sola podría dar un reparto degenerado por
   * puro azar: con 15 preguntas y 4 letras, que todas cayeran en una misma letra tiene
   * probabilidad 4·(1/4)^15, o sea ninguna, pero acumular partidas lo hace además estable.
   */
  test('300 · la correcta no cae siempre en la misma letra: las opciones se barajan', async ({ page }) => {
    test.setTimeout(180_000);
    const cuenta: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

    for (let partida = 0; partida < 3; partida++) {
      await arrancar(page, /^Avanzado/);
      const { letras, total } = await jugarPartida(page, Number.MAX_SAFE_INTEGER);
      expect(total).toBe(POR_PARTIDA);
      for (const l of letras) cuenta[l]++;
    }

    const detalle = JSON.stringify(cuenta);
    // Ninguna letra puede quedarse a cero ni acaparar: con 45 respuestas repartidas al azar
    // entre 4 posiciones, lo esperable son ~11 en cada una.
    for (const letra of ['A', 'B', 'C', 'D']) {
      expect(cuenta[letra], `la letra ${letra} nunca es la correcta · reparto ${detalle}`).toBeGreaterThan(0);
      expect(cuenta[letra], `la letra ${letra} acapara las correctas · reparto ${detalle}`).toBeLessThan(POR_PARTIDA * 3 * 0.6);
    }
  });

  /**
   * 310 · Empezada una partida no había forma de abandonarla ni de volver a la pantalla de
   * selección: cambiar de nivel a mitad, o rendirse, obligaba a recargar la página.
   */
  test('310 · se puede salir de una partida sin recargar la página', async ({ page }) => {
    await arrancar(page, /^Básico/);
    await expect(page.locator('h2[class*="pregunta"]')).toBeVisible();

    await page.getByRole('button', { name: /Cambiar de nivel/ }).click();

    await expect(page.getByRole('heading', { name: 'Elige el nivel de dificultad' })).toBeVisible();
    await expect(page.locator('h2[class*="pregunta"]')).toHaveCount(0);
  });

  /**
   * H5 · Dos enunciados de nivel avanzado con defecto editorial:
   *   · a10 pregunta «¿Qué NARRADORA propuso Genette…?» cuando lo que propuso Genette
   *     (Figuras III, 1972) es una CATEGORÍA, la focalización; tal como está redactada,
   *     la pregunta pide una narradora y la respuesta es un concepto.
   *   · a13 pregunta por «el llamado "trío del realismo mágico" más citado por la crítica»,
   *     un consenso que no existe: no hay tal trío canónico, y Carpentier acuñó «lo real
   *     maravilloso» precisamente para distinguirlo del realismo mágico. La opción marcada
   *     como correcta depende de una interpretación discutible.
   * Una partida de Avanzado siempre recorre las 13 preguntas del nivel, así que las dos
   * aparecen sí o sí.
   */
  test('302 y 307 · ningún enunciado de Avanzado está mal redactado ni presupone un consenso inexistente', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    // Ya no basta con una partida: el nivel tiene 18 preguntas y la partida sirve 15, así
    // que se juegan varias para recorrerlo. Es el precio de haber ampliado el banco.
    const vistos = new Set<string>();
    for (let partida = 0; partida < 4; partida++) {
      await arrancar(page, /^Avanzado/);
      for (;;) {
        vistos.add(await enunciado(page));
        await opciones(page).nth(0).click();
        if (/Ver resultado/.test(await avanzar(page))) break;
      }
    }
    const enunciados = [...vistos];
    expect(enunciados.filter((e) => /narradora propuso Genette/i.test(e)), 'a10: «narradora» por «categoría»').toEqual([]);
    expect(enunciados.filter((e) => /trío del realismo mágico/i.test(e)), 'a13: consenso crítico inexistente').toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * RE-INSPECCIÓN DEL 25/09/2026
 *
 * Banco a esta fecha (contado en `preguntas.ts`): 19 básicas + 19 medias + 18 avanzadas = 56.
 * En el CÓDIGO la correcta sigue sesgada (A=11, B=2, C=19, D=24), pero la partida baraja
 * las opciones al componerse (`barajarOpciones`, page.tsx:62): en 12 partidas reales (180
 * preguntas) la correcta cayó 47 veces en A, 46 en B, 46 en C y 41 en D, y «siempre A»
 * sacó 3, 4, 3 y 4 de 15. Los tramos de `evaluacion()`: ≥ 0,9 Excelente · ≥ 0,7 Muy bien ·
 * ≥ 0,5 Bien · resto Sigue leyendo; barra = Math.round(aciertos / 15 · 100).
 *
 * Los casos que vigilan un defecto de HOY llevan test.fail() y el comportamiento correcto.
 */

/** Explicación visible tras responder la pregunta en pantalla. */
async function explicacionVisible(page: Page): Promise<string> {
  return norm(await page.locator('[class*="explicacionTexto"]').innerText());
}

/**
 * Juega partidas del nivel hasta haber visto las preguntas `ids` (o agotar `maxPartidas`).
 * Responde siempre la A: aquí solo interesa lo que la app dice tras responder.
 */
async function buscarPreguntas(page: Page, nivel: RegExp, ids: string[], maxPartidas = 8) {
  const vistas: Record<string, { enunciado: string; explicacion: string }> = {};
  for (let partida = 0; partida < maxPartidas && ids.some((id) => !vistas[id]); partida++) {
    await arrancar(page, nivel);
    for (;;) {
      const texto = await enunciado(page);
      await opciones(page).nth(0).click();
      const ficha = BANCO[texto];
      if (ficha && ids.includes(ficha.id)) vistas[ficha.id] = { enunciado: texto, explicacion: await explicacionVisible(page) };
      if (/Ver resultado/.test(await avanzar(page))) break;
    }
  }
  return vistas;
}

/**
 * Contraste WCAG del texto de `selector` contra su fondo REAL: compone los fondos
 * semitransparentes de los antecesores hasta dar con uno opaco.
 */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`no existe ${sel}`);
    const leer = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    const sobre = (f: number[], b: number[]) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(leer(getComputedStyle(el).color), fondo);
    const lum = (c: number[]) => {
      const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const [a, b] = [lum(texto), lum(fondo)];
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  }, selector);
}

/** Pone el tema por la clave que lee next-themes ANTES de que la página hidrate. */
async function conTema(page: Page, tema: 'light' | 'dark') {
  await page.addInitScript((t) => {
    try { localStorage.setItem('meskeia-theme', t); } catch { /* sin almacenamiento */ }
  }, tema);
}

/** Responde la pregunta visible bien o mal y aparta el ratón (el :hover cambia el fondo). */
async function responderSinHover(page: Page, modo: 'bien' | 'mal') {
  const ficha = BANCO[await enunciado(page)];
  const ops = await textosOpcion(page);
  const iCorrecta = ops.indexOf(ficha.correcta);
  const iFallada = iCorrecta === 0 ? 1 : 0;
  await opciones(page).nth(modo === 'bien' ? iCorrecta : iFallada).click();
  await page.mouse.move(0, 0);
  return { iCorrecta, iFallada };
}

test.describe('Re-inspección 25/09/2026', () => {
  /**
   * CASO NORMAL — una partida en Medio y otra en Mezcla (Básico y Avanzado ya los cubren
   * los casos del 25/08). Resuelto a mano:
   *   · Medio, 12 bien y 3 mal: 12/15 = 0,80 → [0,7 · 0,9) «Muy bien. Buen nivel literario.»
   *     🌟 · barra Math.round(80) = 80%.
   *   · Mezcla, 7 bien y 8 mal: 7/15 = 0,4667 < 0,5 → «Sigue leyendo. El conocimiento llega
   *     con tiempo.» 🌱 · barra Math.round(46,67) = 47%.
   *   · Las dos anuncian y entregan 15 preguntas distintas (19 y 56 en el banco).
   */
  test('caso normal: Medio 12/15 da «Muy bien» y 80 %; Mezcla 7/15 da «Sigue leyendo» y 47 %', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto(RUTA);
    await page.getByRole('button', { name: /^Medio/ }).click();
    await expect(page.locator('[class*="seleccionInfo"]')).toHaveText('15 preguntas aleatorias · Explicación tras cada respuesta');
    await page.getByRole('button', { name: /Empezar el quiz/ }).click();
    const medio = await jugarPartida(page, 12);
    expect(medio.total).toBe(15);
    expect(new Set(medio.ids).size).toBe(15);
    expect(medio.ids.every((id) => id.startsWith('m')), `Medio ha colado otro nivel: ${medio.ids.join(',')}`).toBe(true);
    expect(await resultado(page)).toEqual({
      puntuacion: '12 / 15 correctas',
      etiqueta: 'Muy bien. Buen nivel literario.', // 0,80 ∈ [0,7 · 0,9)
      emoji: '🌟',
      barra: '80%',
    });

    await page.goto(RUTA);
    await page.getByRole('button', { name: /^Mezcla/ }).click();
    await expect(page.locator('[class*="seleccionInfo"]')).toHaveText('15 preguntas aleatorias · Explicación tras cada respuesta');
    await page.getByRole('button', { name: /Empezar el quiz/ }).click();
    const mezcla = await jugarPartida(page, 7);
    expect(mezcla.total).toBe(15);
    expect(new Set(mezcla.ids).size).toBe(15);
    expect(await resultado(page)).toEqual({
      puntuacion: '7 / 15 correctas',
      etiqueta: 'Sigue leyendo. El conocimiento llega con tiempo.', // 0,4667 < 0,5
      emoji: '🌱',
      barra: '47%', // Math.round(7/15*100)
    });
  });

  /**
   * CASO LÍMITE — el umbral del 0,9 de `evaluacion()`. Con 15 preguntas no hay 13,5
   * aciertos: 13/15 = 0,8667 se queda en «Muy bien» y 14/15 = 0,9333 ya es «Excelente».
   *   · Básico 13/15 → «Muy bien. Buen nivel literario.» 🌟 · barra Math.round(86,67) = 87%.
   *   · Avanzado 14/15 → «¡Excelente! Dominas la literatura.» 🏆 · barra Math.round(93,33) = 93%.
   */
  test('caso límite: 13/15 se queda en «Muy bien» (87 %) y 14/15 ya es «¡Excelente!» (93 %)', async ({ page }) => {
    test.setTimeout(180_000);
    await arrancar(page, /^Básico/);
    await jugarPartida(page, 13);
    expect(await resultado(page)).toEqual({
      puntuacion: '13 / 15 correctas',
      etiqueta: 'Muy bien. Buen nivel literario.', // 0,8667 < 0,9
      emoji: '🌟',
      barra: '87%',
    });

    await arrancar(page, /^Avanzado/);
    await jugarPartida(page, 14);
    expect(await resultado(page)).toEqual({
      puntuacion: '14 / 15 correctas',
      etiqueta: '¡Excelente! Dominas la literatura.', // 0,9333 ≥ 0,9
      emoji: '🏆',
      barra: '93%',
    });
  });

  /**
   * 300, visto desde el jugador: en el banco de Medio la correcta está 10 de 19 veces en
   * la D (preguntas.ts), así que sin el barajado «siempre D» rondaría el 50 %. Barajando,
   * lo esperable son ~4 de 15 por partida (~11 de 45). Se exige menos de la mitad en tres
   * partidas seguidas (45 preguntas: P(≥ 23 aciertos al azar) ≈ 10⁻⁵) y que ninguna letra
   * se quede sin ser nunca la correcta.
   */
  test('300 · pulsar siempre la D en Medio no aprueba: la posición no delata la respuesta', async ({ page }) => {
    test.setTimeout(180_000);
    const cuenta: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    let aciertosD = 0;
    for (let partida = 0; partida < 3; partida++) {
      await arrancar(page, /^Medio/);
      let enEsta = 0;
      for (;;) {
        const ficha = BANCO[await enunciado(page)];
        const ops = await textosOpcion(page);
        const letra = 'ABCD'[ops.indexOf(ficha.correcta)];
        cuenta[letra]++;
        if (letra === 'D') enEsta++;
        await opciones(page).nth(3).click(); // siempre la D
        if (/Ver resultado/.test(await avanzar(page))) break;
      }
      // El marcador cuenta exactamente las veces que la D era la buena
      expect((await resultado(page)).puntuacion).toBe(`${enEsta} / 15 correctas`);
      aciertosD += enEsta;
    }
    const detalle = JSON.stringify(cuenta);
    expect(aciertosD, `«siempre D» acierta demasiado · reparto ${detalle}`).toBeLessThan(23);
    for (const l of ['A', 'B', 'C', 'D']) expect(cuenta[l], `la ${l} nunca es la correcta · ${detalle}`).toBeGreaterThan(0);
  });

  /**
   * OPERATIVA QUE DEBE IMPEDIRSE — resuelto a mano:
   *   · Antes de responder no existe «Siguiente →» (page.tsx:282 lo pinta solo si respondida).
   *   · Enter sobre una opción ya bloqueada no cambia la respuesta.
   *   · Abandonar a mitad («← Cambiar de nivel») con 2 aciertos y empezar otra partida
   *     de Básico toda fallada tiene que dar «0 / 15 correctas»: handleIniciar pone
   *     aciertos a 0, el abandono no arrastra nada.
   */
  test('operativa: sin «Siguiente» antes de responder, respuesta bloqueada y abandono que no arrastra aciertos', async ({ page }) => {
    test.setTimeout(120_000);
    await arrancar(page, /^Básico/);

    await expect(page.getByRole('button', { name: /Siguiente|Ver resultado/ })).toHaveCount(0);

    // Pregunta 1 bien; luego Enter sobre otra opción ya deshabilitada
    const { iCorrecta, iFallada } = await responderSinHover(page, 'bien');
    await opciones(page).nth(iFallada).focus().catch(() => {});
    await page.keyboard.press('Enter');
    await expect(opciones(page).nth(iCorrecta)).toHaveClass(/opcionCorrecta/);
    await expect(page.locator('[class*="opcionIncorrecta"]')).toHaveCount(0);
    await avanzar(page);
    await responder(page, 'bien'); // 2 aciertos
    expect(await contador(page)).toBe('2/15');

    await page.getByRole('button', { name: /Cambiar de nivel/ }).click();
    await expect(page.getByRole('heading', { name: 'Elige el nivel de dificultad' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Básico/ })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /Empezar el quiz/ }).click();
    expect(await contador(page)).toBe('1/15');
    await jugarPartida(page, 0);
    expect(await resultado(page)).toEqual({
      puntuacion: '0 / 15 correctas', // los 2 aciertos de la partida abandonada no cuentan
      etiqueta: 'Sigue leyendo. El conocimiento llega con tiempo.',
      emoji: '🌱',
      barra: '0%',
    });
  });

  /**
   * SOSPECHA DESCARTADA (la forma del 1674 de quiz-tabla-periodica). En oscuro,
   * `[data-theme='dark'] .opcion` (0,2,0) SÍ pisa el borde verde o rojo y
   * `[data-theme='dark'] .opcionLetra` el círculo, pero —a diferencia de aquella app— esta
   * regla no toca el fondo: correcta rgba(39, 174, 96, 0.1), fallada rgba(231, 76, 60, 0.1)
   * y neutra transparente, más las marcas ✓ y ✗ en su color. Medido el 25/09/2026: se
   * distinguen. Esto fija que se sigan distinguiendo.
   */
  test('sospecha 1674 descartada: en oscuro la correcta y la fallada no se pintan igual', async ({ page }) => {
    await conTema(page, 'dark');
    await arrancar(page, /^Básico/);
    const { iCorrecta, iFallada } = await responderSinHover(page, 'mal');
    const iNeutra = [0, 1, 2, 3].find((i) => i !== iCorrecta && i !== iFallada)!;

    const pintura = async (i: number) =>
      opciones(page).nth(i).evaluate((b) => ({
        fondo: getComputedStyle(b).backgroundColor,
        marca: b.querySelector('[class*="opcionMarca"]')?.textContent ?? null,
      }));
    // Espera a que termine la transición de 0,15 s de .opcion
    await expect.poll(async () => (await pintura(iCorrecta)).fondo).toBe('rgba(39, 174, 96, 0.1)');
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');

    const [bien, mal, neutra] = [await pintura(iCorrecta), await pintura(iFallada), await pintura(iNeutra)];
    expect(bien).toEqual({ fondo: 'rgba(39, 174, 96, 0.1)', marca: '✓' });
    expect(mal).toEqual({ fondo: 'rgba(231, 76, 60, 0.1)', marca: '✗' });
    expect(neutra).toEqual({ fondo: 'rgba(0, 0, 0, 0)', marca: null });
  });

  /**
   * HALLAZGO (accesibilidad) — al pulsar «Siguiente →» el botón se desmonta y el foco cae a
   * <body>; el punto de partida de la navegación queda DETRÁS de las opciones nuevas y el
   * primer Tab salta a «← Cambiar de nivel». Medido el 25/09/2026 en escritorio y a 412 px.
   * Lo correcto: el foco queda en la tarjeta de la pregunta, en la opción A o antes de ella.
   */
  test('hallazgo · tras «Siguiente» con teclado el foco no se pierde por detrás de las opciones nuevas', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: activeElement = BODY y el Tab va a «← Cambiar de nivel»
    await arrancar(page, /^Básico/);
    await responderSinHover(page, 'bien');
    await page.getByRole('button', { name: /Siguiente/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="quizNumero"]')).toHaveText('2/15');

    const foco = await page.evaluate(() => {
      const a = document.activeElement;
      const caja = document.querySelector('[class*="quizBox"]');
      const opA = [...document.querySelectorAll('button')].find((b) => b.querySelector('[class*="opcionLetra"]'))!;
      return {
        enBody: a === document.body,
        enLaTarjeta: !!caja && !!a && caja.contains(a),
        antesDeLaA: !!a && (a === opA || !!(a.compareDocumentPosition(opA) & Node.DOCUMENT_POSITION_FOLLOWING)),
      };
    });
    expect(foco).toEqual({ enBody: false, enLaTarjeta: true, antesDeLaA: true });
  });

  /**
   * HALLAZGO (accesibilidad) — la otra mitad: tras «Ver resultado» el foco también cae a
   * <body>, la nota no está en ninguna región viva y el primer Tab va a «Jugar de nuevo»,
   * por debajo de la puntuación. Lo correcto: el foco en la tarjeta del resultado (o la
   * nota anunciada).
   */
  test('hallazgo · tras «Ver resultado» el foco va a la tarjeta de la nota', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: activeElement = BODY, sin región viva
    test.setTimeout(120_000);
    await arrancar(page, /^Básico/);
    for (let n = 1; n < 15; n++) {
      await responder(page, 'mal');
      await avanzar(page);
    }
    await responder(page, 'bien');
    await page.getByRole('button', { name: /Ver resultado/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="resultadoPuntuacion"]')).toHaveText('1 / 15 correctas');

    const r = await page.evaluate(() => {
      const card = document.querySelector('[class*="resultadoCard"]')!;
      const a = document.activeElement;
      let viva = false;
      for (let n: Element | null = card; n; n = n.parentElement) {
        if (n.getAttribute('aria-live') || n.getAttribute('role') === 'status') viva = true;
      }
      return { focoEnLaNota: !!a && a !== document.body && (card === a || card.contains(a)) && !/Jugar de nuevo/.test(a.textContent ?? ''), viva };
    });
    expect(r.focoEnLaNota || r.viva, JSON.stringify(r)).toBe(true);
  });

  /**
   * HALLAZGO (accesibilidad) — la forma del 1677 de quiz-tabla-periodica. Umbral 4,5:1
   * (ninguno de estos textos llega a «grande»: 16 px/600 como mucho). Medido el 25/09/2026:
   *   claro: «Empezar el quiz →» y «Siguiente →» (blanco sobre --primary) 4,11 · rótulo
   *     «Básico» (#27AE60) 2,87 · «¡Correcto!» (#1E8449 sobre su tinte) 4,36.
   *   oscuro: los mismos botones 2,79 · rótulo «Avanzado» (#8B2635) 1,59 · «Incorrecto»
   *     (#EC7063) 4,38 · título «Errores frecuentes…» (#c0392b, sin variante oscura) 2,21.
   */
  test('hallazgo · los botones, el rótulo del nivel y el veredicto llegan a 4,5:1 en los dos temas', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: 4,11 / 2,87 / 4,36 en claro; 2,79 / 1,59 / 4,38 / 2,21 en oscuro
    test.setTimeout(120_000);
    const medidas: Record<string, number> = {};

    // ── Claro ──
    await conTema(page, 'light');
    await arrancar(page, /^Básico/);
    medidas['claro · rótulo Básico'] = await contraste(page, '[class*="quizNivel"]');
    await responderSinHover(page, 'bien');
    await expect(page.locator('[class*="explicacionVeredicto"]')).toHaveText('¡Correcto!');
    medidas['claro · ¡Correcto!'] = await contraste(page, '[class*="explicacionVeredicto"]');
    medidas['claro · Siguiente'] = await contraste(page, '[class*="btnSiguiente"]');

    // ── Oscuro ──
    const oscura = await page.context().newPage();
    await conTema(oscura, 'dark');
    await arrancar(oscura, /^Avanzado/);
    expect(await oscura.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');
    medidas['oscuro · rótulo Avanzado'] = await contraste(oscura, '[class*="quizNivel"]');
    await responderSinHover(oscura, 'mal');
    await expect(oscura.locator('[class*="explicacionVeredicto"]')).toContainText('Incorrecto.');
    medidas['oscuro · Incorrecto'] = await contraste(oscura, '[class*="explicacionVeredicto"]');
    medidas['oscuro · Siguiente'] = await contraste(oscura, '[class*="btnSiguiente"]');
    medidas['oscuro · Errores frecuentes'] = await contraste(oscura, '[class*="warningHeader"] h4');

    const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5);
    expect(bajos, JSON.stringify(medidas)).toEqual([]);
  });

  /**
   * HALLAZGO (dato) — tres explicaciones afirman algo falso; la respuesta marcada es buena
   * en las tres, pero la FAQ de la app dice que las explicaciones «son correctas».
   *   · a06: «García Márquez la describió como el libro que lo hizo querer ser escritor».
   *     En «Breves nostalgias sobre Juan Rulfo» (1980) cuenta que cuando Mutis le dio
   *     «Pedro Páramo» ya tenía publicado un libro y tres más inéditos, y que Rulfo le dio
   *     «el camino que buscaba para continuar mis libros»; la conmoción comparable, dice, fue
   *     la noche en que leyó «La metamorfosis» de Kafka, diez años antes.
   *   · a12: «se publicó en parte para adelantarse a la versión apócrifa de Avellaneda
   *     (1614)». La segunda parte es de 1615: no puede adelantarse a un libro que salió un
   *     año antes (las dos fechas están en la propia explicación).
   *   · b14: el íncipit «contrasta la Revolución Francesa con la tranquilidad inglesa». El
   *     capítulo I («The Period») transcurre en 1775, catorce años antes de la Revolución, y
   *     dice de Inglaterra «there was scarcely an amount of order and protection to justify
   *     much national boasting» (asaltos armados cada noche en Londres).
   */
  test('hallazgo · las explicaciones de a06 y a12 no afirman nada falso', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: a06 «lo hizo querer ser escritor», a12 «adelantarse» a un libro de 1614
    test.setTimeout(240_000);
    const vistas = await buscarPreguntas(page, /^Avanzado/, ['a06', 'a12']);
    expect(Object.keys(vistas).sort(), 'no salieron a06 y a12 en 8 partidas').toEqual(['a06', 'a12']);
    expect(vistas.a06.explicacion).not.toMatch(/lo hizo querer ser escritor/i);
    expect(vistas.a12.explicacion).not.toMatch(/adelantarse a la versi[oó]n ap[oó]crifa/i);
  });

  test('hallazgo · la explicación de b14 no presenta una Inglaterra tranquila frente a la Revolución', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: b14 «contrasta la Revolución Francesa con la tranquilidad inglesa»
    test.setTimeout(240_000);
    const vistas = await buscarPreguntas(page, /^Básico/, ['b14']);
    expect(vistas.b14, 'no salió b14 en 8 partidas').toBeTruthy();
    expect(vistas.b14.explicacion).not.toMatch(/tranquilidad inglesa/i);
  });

  /**
   * HALLAZGO (contenido) — enunciados que la propia app desmiente:
   *   · m15 pregunta «¿Qué narrador PROTAGONIZA "El gran Gatsby"?» y su explicación dice
   *     que Nick es el «narrador-testigo» y que «Gatsby es el protagonista»: quien pulsa
   *     «Jay Gatsby» por leer el enunciado al pie de la letra recibe «Incorrecto» y, acto
   *     seguido, la razón que le daba la razón.
   *   · m06 llama «movimiento literario» al Boom (y b04 al realismo mágico), mientras el
   *     aviso «Errores frecuentes» del bloque educativo dice que «el Boom es una generación,
   *     el realismo mágico es una técnica».
   */
  test('hallazgo · m15 y m06 no contradicen su explicación ni el bloque educativo', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: «narrador protagoniza» frente a «narrador-testigo»; Boom «movimiento» frente a «generación»
    test.setTimeout(240_000);
    await page.goto(RUTA);
    const aviso = norm(await page.locator('[class*="warningList"]').textContent());
    const vistas = await buscarPreguntas(page, /^Medio/, ['m15', 'm06']);
    expect(Object.keys(vistas).sort(), 'no salieron m15 y m06 en 8 partidas').toEqual(['m06', 'm15']);

    const m15Contradice = /narrador protagoniza/i.test(vistas.m15.enunciado) && /narrador-testigo/i.test(vistas.m15.explicacion);
    expect(m15Contradice, `m15: «${vistas.m15.enunciado}» / «${vistas.m15.explicacion}»`).toBe(false);

    const m06Contradice = /movimiento literario/i.test(vistas.m06.enunciado) && /el Boom es una generación/i.test(aviso);
    expect(m06Contradice, `m06: «${vistas.m06.enunciado}» / aviso: «${aviso}»`).toBe(false);
  });

  /**
   * HALLAZGO (contenido) — la primera respuesta del FAQPage (lo que leen Bing Copilot y
   * ChatGPT) dice «Abarca literatura occidental desde la Antigüedad griega hasta el siglo
   * XX», y el párrafo de entrada del bloque educativo, «la tradición literaria occidental y
   * latinoamericana». Desde el 25/08/2026 el banco tiene diez preguntas no occidentales
   * (Genji, Las mil y una noches, Tagore, Mahfuz, Bashō, Cao Xueqin, Mo Yan, Rumi, Han Kang,
   * Achebe) y la FAQ visible de la propia página las enumera.
   */
  test('hallazgo · el FAQPage y la entrada no describen el banco como solo occidental', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: «Abarca literatura occidental … hasta el siglo XX»
    await page.goto(RUTA);
    const faq = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' ')
    );
    const entrada = norm(await page.locator('[class*="guideSection"] > p').first().textContent());
    expect(faq).not.toMatch(/Abarca literatura occidental/);
    expect(entrada).not.toMatch(/tradición literaria occidental y latinoamericana/);
  });
});

/**
 * HALLAZGO (operativa) — en un móvil de 360 px, tras una explicación larga, «Siguiente →»
 * deja la pregunta nueva por encima de la pantalla o bajo la barra fija del logo (62 px):
 * nadie devuelve la vista al enunciado. Medido el 25/09/2026 con desplazamiento mínimo
 * (el que haría un dedo para ver «Siguiente» entero): 3-4 de 14 transiciones por partida
 * (tras b18, a13, a14, a09, a18: enunciado en y = −90…−10 o 4…111) y la nota final en
 * y = −61…42. A 412 × 915 no pasa.
 */
test.describe('Re-inspección 25/09/2026 · móvil 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('hallazgo · tras «Siguiente» la pregunta nueva queda a la vista bajo la barra del logo', async ({ page }) => {
    test.fail(); // hallazgo del 25/09/2026: tras las explicaciones largas el enunciado queda fuera o bajo la barra
    test.setTimeout(240_000);
    const tapar = async (sel: ReturnType<Page['locator']>) => {
      const b = (await sel.boundingBox())!;
      await page.touchscreen.tap(b.x + Math.min(20, b.width / 2), b.y + b.height / 2);
    };
    const ocultas: string[] = [];
    for (const nivel of [/^Avanzado/, /^Básico/]) {
      await page.goto(RUTA);
      await page.getByRole('button', { name: nivel }).tap();
      await page.getByRole('button', { name: /Empezar el quiz/ }).tap();
      for (let n = 1; n <= 15; n++) {
        // El usuario sube lo justo para ver el enunciado bajo la barra, o baja para ver la D
        await page.evaluate(() => {
          const h = document.querySelector('h2[class*="pregunta"]')!.getBoundingClientRect();
          const bs = [...document.querySelectorAll('button')].filter((b) => b.querySelector('[class*="opcionLetra"]'));
          const d = bs[3].getBoundingClientRect();
          if (h.top < 70) scrollBy(0, h.top - 70);
          else if (d.bottom > innerHeight) scrollBy(0, d.bottom - innerHeight + 10);
        });
        const ficha = BANCO[await enunciado(page)];
        await tapar(opciones(page).nth(0));
        // …y baja lo justo para ver «Siguiente» entero
        await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].find((x) => /Siguiente|Ver resultado/.test(x.textContent ?? ''))!;
          const r = b.getBoundingClientRect();
          if (r.bottom > innerHeight - 10) scrollBy(0, r.bottom - innerHeight + 10);
        });
        await tapar(page.getByRole('button', { name: /Siguiente|Ver resultado/ }));
        const objetivo = n < 15 ? 'h2[class*="pregunta"]' : '[class*="resultadoPuntuacion"]';
        await expect(page.locator(objetivo)).toBeVisible();
        const [arriba, barra] = await page.evaluate((sel) => [
          document.querySelector(sel)!.getBoundingClientRect().top,
          document.querySelector('[class*="headerBar"]')?.getBoundingClientRect().bottom ?? 0,
        ], objetivo);
        if (arriba < barra) ocultas.push(`tras ${ficha.id}: ${n < 15 ? 'enunciado' : 'nota'} en y=${Math.round(arriba)} (barra hasta ${Math.round(barra)})`);
      }
    }
    expect(ocultas).toEqual([]);
  });
});

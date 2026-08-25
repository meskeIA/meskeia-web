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
 * HALLAZGOS ABIERTOS de esta pasada: al final, con `test.fail()`. Afirman lo que DEBERÍA
 * pasar y hoy fallan a propósito; el día que se reparen se les quita el `test.fail()` y se
 * quedan como regresión. Dos hallazgos más no caben en un test determinista y viven solo
 * en el acta: la explicación de b05 («Sherlock Holmes fue el primer detective moderno de
 * la ficción», falso — Dupin es de 1841, y Poe está entre los distractores de esa misma
 * pregunta) y tres categorías mal puestas (b08 y b10 preguntan «¿Quién escribió…?» y se
 * rotulan 📖 Obras; m15 pregunta por el narrador de Gatsby y se rotula ✒️ Autores).
 */

const RUTA = '/quiz-literatura-universal/';

/** Preguntas por nivel en POOL (contadas en page.tsx el 25/08/2026). */
const POR_NIVEL = { basico: 17, medio: 16, avanzado: 13 } as const;
/** Total del banco. La metadata anuncia 50; en page.tsx hay 46. */
const TOTAL_BANCO = 46;
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
  "¿Qué narradora propuso Genette como categoría para describir quién ve/percibe la historia?":
    { id: "a10", nivel: "avanzado", correcta: "Focalización" },
  "¿Qué escritora austríaca ganó el Nobel de Literatura en 2004?":
    { id: "a11", nivel: "avanzado", correcta: "Elfriede Jelinek" },
  "¿En qué año publicó Cervantes la segunda parte del Quijote?":
    { id: "a12", nivel: "avanzado", correcta: "1615" },
  "¿Qué escritores conforman el llamado \"trío del realismo mágico\" más citado por la crítica?":
    { id: "a13", nivel: "avanzado", correcta: "García Márquez, Rulfo y Carpentier" },
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
   *   · El banco avanzado tiene 13 preguntas y `slice(0, 15)` no puede dar más:
   *     la partida es de 13, no de las 15 que anuncia la pantalla anterior
   *     (eso es el hallazgo H1, aquí solo se fija el comportamiento real).
   *   · marcador final «13 / 13 correctas»
   *   · 13/13 = 1,0 ≥ 0,9 → «¡Excelente! Dominas la literatura.» 🏆 · barra 100%
   */
  test('caso límite: todas correctas en Avanzado dan pleno y «¡Excelente! Dominas la literatura.»', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const esperadas = Math.min(POR_PARTIDA, POR_NIVEL.avanzado); // = 13
    await arrancar(page, /^Avanzado/);

    expect(await contador(page)).toBe(`1/${esperadas}`);

    const { ids, total } = await jugarPartida(page, Number.MAX_SAFE_INTEGER);
    expect(total, 'la partida de Avanzado se queda en lo que da el banco').toBe(esperadas);
    expect(new Set(ids).size).toBe(esperadas);
    expect(ids.every((id) => id.startsWith('a')), `«Avanzado» ha colado otro nivel: ${ids.join(',')}`).toBe(true);

    expect(await resultado(page)).toEqual({
      puntuacion: '13 / 13 correctas', // 13 = tamaño del banco avanzado en page.tsx
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
 * HALLAZGOS ABIERTOS de la 1.ª pasada (25/08/2026). Cada uno afirma lo que DEBERÍA pasar
 * y hoy falla: `test.fail()` hace que el fichero esté verde mientras el hallazgo siga ahí,
 * y que grite el día que se repare para quitarle el marcador.
 */
test.describe('Hallazgos abiertos del Inspector', () => {
  /**
   * H1 · La pantalla de selección promete «15 preguntas aleatorias» en los cuatro modos,
   * pero el banco avanzado solo tiene 13 y `slice(0, 15)` las entrega todas: la partida es
   * de 13 y, además, SIEMPRE es el mismo conjunto de preguntas, solo reordenado — con lo
   * que la FAQ de la propia app («Con varios intentos verás preguntas diferentes») tampoco
   * se cumple en Avanzado.
   */
  test('H1 · Avanzado debe entregar las 15 preguntas que anuncia la pantalla de selección', async ({ page }) => {
    test.fail();
    test.setTimeout(120_000);
    await page.goto(RUTA);
    await expect(page.locator('[class*="seleccionInfo"]')).toContainText('15 preguntas aleatorias');
    await page.getByRole('button', { name: /^Avanzado/ }).click();
    await page.getByRole('button', { name: /Empezar el quiz/ }).click();
    expect(await contador(page), 'el nivel Avanzado sirve 13 preguntas y anuncia 15').toBe('1/15');
  });

  /**
   * H2 · Tras responder, si la respuesta fue correcta o no se transmite ÚNICAMENTE por
   * color (borde/fondo verde o rojo) y por dos marcas ✓/✗ que llevan aria-hidden="true".
   * El nombre accesible de los botones no cambia, la explicación no es región live y no
   * dice «correcto» ni «incorrecto»: quien no ve el color no se entera de si ha acertado
   * hasta el marcador final. WCAG 1.4.1 (uso del color).
   */
  test('H2 · el acierto o el fallo deben llegar también en texto, no solo por color', async ({ page }) => {
    test.fail();
    await arrancar(page, /^Básico/);

    const ficha = BANCO[await enunciado(page)];
    const ops = await textosOpcion(page);
    const iCorrecta = ops.indexOf(ficha.correcta);
    await opciones(page).nth(iCorrecta === 0 ? 1 : 0).click(); // se falla a propósito

    // Nombre accesible = texto sin los subárboles aria-hidden (así lo lee un lector)
    const nombres = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => b.querySelector('[class*="opcionLetra"]'))
        .map((b) => {
          const clon = b.cloneNode(true) as HTMLElement;
          clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
          return clon.textContent!.replace(/\s+/g, ' ').trim();
        })
    );
    const anunciaCorreccion =
      nombres.some((n) => /correct|incorrect|✓|✗/i.test(n)) ||
      (await page.locator('[class*="explicacion"][role="status"], [class*="explicacion"][aria-live]').count()) > 0;

    expect(anunciaCorreccion, 'la corrección solo se ve por color: ✓ y ✗ llevan aria-hidden').toBe(true);
  });

  /**
   * H3 · metadata.ts anuncia «50 preguntas» en cinco sitios (title, description, twitter,
   * jsonLd.description y jsonLd.features) y en el faqJsonLd, que es el que las IAs usan
   * para grounding. En POOL hay 46.
   */
  test('H3 · el JSON-LD servido no debe anunciar más preguntas de las que tiene el banco', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    const bloques = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '')
    );
    const anunciadas = bloques.join(' ').match(/(\d+)\s+preguntas/g) ?? [];
    const exageradas = anunciadas.filter((t) => Number(t.match(/\d+/)![0]) > TOTAL_BANCO);
    expect(exageradas, `el banco tiene ${TOTAL_BANCO} preguntas y el JSON-LD dice: ${anunciadas.join(', ')}`).toEqual([]);
  });

  /**
   * H4 · Sesgo de posición: en las 46 preguntas del banco la correcta está 0 veces en A,
   * 3 en B, 19 en C y 24 en D. Las opciones no se barajan al pintarlas, así que el sesgo
   * es estable: responder siempre «D» saca 24/46 (52%) sin saber nada, y responder siempre
   * «A» saca 0. Una partida de Avanzado recorre las 13 preguntas del nivel entero, de modo
   * que este recuento es determinista, no un muestreo.
   */
  test('H4 · la opción A debe ser la correcta alguna vez a lo largo del nivel Avanzado', async ({ page }) => {
    test.fail();
    test.setTimeout(120_000);
    await arrancar(page, /^Avanzado/);
    const { letras, total } = await jugarPartida(page, Number.MAX_SAFE_INTEGER);
    expect(total).toBe(POR_NIVEL.avanzado); // la partida es el nivel entero
    const cuenta = Object.fromEntries(['A', 'B', 'C', 'D'].map((l) => [l, letras.filter((x) => x === l).length]));
    expect(cuenta.A, `reparto de la correcta en Avanzado: ${JSON.stringify(cuenta)}`).toBeGreaterThan(0);
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
  test('H5 · ningún enunciado de Avanzado debe estar mal redactado ni presuponer un consenso inexistente', async ({
    page,
  }) => {
    test.fail();
    test.setTimeout(120_000);
    await arrancar(page, /^Avanzado/);
    const enunciados: string[] = [];
    for (;;) {
      enunciados.push(await enunciado(page));
      await opciones(page).nth(0).click();
      if (/Ver resultado/.test(await avanzar(page))) break;
    }
    expect(enunciados.filter((e) => /narradora propuso Genette/i.test(e)), 'a10: «narradora» por «categoría»').toEqual([]);
    expect(enunciados.filter((e) => /trío del realismo mágico/i.test(e)), 'a13: consenso crítico inexistente').toEqual([]);
  });
});

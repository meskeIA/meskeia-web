import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * Quiz Tabla Periódica — test de regresión del Inspector (26/08/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «⚗️ Quiz Tabla Periódica» · sub «40+ preguntas sobre elementos, grupos, propiedades y
 * curiosidades» · tarjeta de inicio «10 preguntas aleatorias de un banco de 40» · metadata
 * y JSON-LD «Quiz interactivo sobre la tabla periódica: números atómicos, grupos, períodos,
 * familias de elementos y propiedades. 40+ preguntas».
 *
 * En un quiz la promesa tiene dos mitades, y ninguna se ve en el maquetado:
 *   (a) que la opción marcada como correcta lo sea DE VERDAD frente a la tabla de la IUPAC;
 *   (b) que el marcador cuente bien lo que el usuario ha ido pulsando.
 * Este test comprueba las dos.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · CLAVE_IUPAC se escribe aquí A MANO, resolviendo cada pregunta contra la tabla periódica
 *   de la IUPAC (números atómicos, grupos, períodos y familias) ANTES de abrir la app. NO se
 *   deriva del banco de preguntas de page.tsx: es deliberado, para que el test contraste la
 *   clave de respuestas contra la química y no contra sí misma. Si alguien moviera un número
 *   atómico o cambiara un grupo en page.tsx, esto tiene que fallar.
 * · El marcador sale de leer el motor de page.tsx:
 *     totalAciertos = aciertos.filter(Boolean).length
 *     Errores       = TOTAL_PREGUNTAS - totalAciertos   (TOTAL_PREGUNTAS = 10)
 *     Puntuación    = Math.round(totalAciertos / 10 * 100)
 *   y los mensajes de getMensaje(): ≥90 % «¡Experto en química!» 🏆 · ≥70 % «¡Muy buen nivel!» 🎯
 *   · ≥50 % «Buen intento, sigue practicando» 📚 · resto «La tabla periódica guarda muchos
 *   secretos» 🔬. Los cuatro tramos se verificaron a mano y en navegador el 26/08/2026 con
 *   rondas de 10, 9, 7, 5, 3 y 0 aciertos.
 *
 * ALEATORIEDAD
 * ────────────
 * `mezclarArray(BANCO_PREGUNTAS).slice(0, 10)` baraja con Math.random y la UI no ofrece
 * semilla. En vez de fijar el PRNG (que ataría el test a cuántos números consume React al
 * hidratar), se juega con la clave en la mano: se LEE la pregunta que sale y se pulsa la
 * opción que la IUPAC dice que es la buena. Lo que se afirma son invariantes que han de
 * cumplirse en CUALQUIER tanda. Que salga una pregunta que no está en CLAVE_IUPAC también
 * es un fallo: significa que el banco cambió y nadie volvió a resolverlo a mano.
 *
 * HALLAZGO 285 (quiz-simbolos-quimicos): allí las cuatro opciones llevaban `aria-pressed`
 * siendo botones de ACCIÓN. Aquí NO pasa —el caso 3 lo fija como regresión— pero sí faltan
 * `aria-hidden` en los emojis decorativos y el foco se pierde al responder.
 *
 * RE-INSPECCIÓN DEL 25/09/2026 (casos 4 a 16, al final del fichero)
 * ─────────────────────────────────────────────────────────────────
 * Los hallazgos 363-368 siguen arreglados (el «40+» de arriba es lo que prometía el 26/08;
 * hoy el hero, la metadata y el JSON-LD dicen «40», derivado del banco). Entraron después
 * 272b0ee7 (el logo fijo ya no tapa el h1 hasta 768 px) y b7733c6d (cabeceras de tabla en
 * --primary-boton, 5,47:1 en los dos temas): los dos se fijan aquí como regresión.
 *
 * El caso 4 recorre el banco ENTERO de forma determinista: Math.random se programa dentro de
 * la MISMA tarea que el clic en «Empezar quiz», así que solo lo consume mezclarArray y las
 * 10 primeras del barajado son las que se piden. No depende de cuántos números gaste React
 * al hidratar, que era la objeción a fijar el PRNG (ver ALEATORIEDAD).
 *
 * Hallazgos ABIERTOS, como test.fail con lo que debería pasar: la pregunta 28 (el grupo 18
 * tiene 7 elementos, no 6), dos explicaciones con un dato que su fuente no sostiene, el tema
 * oscuro que borra el verde/rojo de las opciones, la vista y el foco que no vuelven a la
 * pregunta tras «Siguiente pregunta», y el contraste del veredicto, la nota y los botones.
 */

const RUTA = '/quiz-tabla-periodica/';
const TOTAL_PREGUNTAS = 10; // TOTAL_PREGUNTAS de page.tsx
const TAMANO_BANCO = 40; // BANCO_PREGUNTAS.length de page.tsx

/**
 * Respuesta correcta de cada pregunta del banco, resuelta a mano contra la tabla periódica
 * de la IUPAC (es.wikipedia.org/wiki/Anexo:Elementos_químicos) y las constantes físicas del
 * CRC Handbook. Entre paréntesis, de dónde sale cada valor cuando no es un número atómico.
 */
const CLAVE_IUPAC: Record<string, string> = {
  // ── Números atómicos (Z = protones del núcleo, tabla de la IUPAC) ──
  '¿Cuál es el número atómico del Oro (Au)?': '79', // Au=79 (Ag=47, Pb=82, Cu=29)
  '¿Qué elemento tiene número atómico 1?': 'Hidrógeno', // H=1
  '¿Cuál es el número atómico del Hierro (Fe)?': '26', // Fe=26 (Cr=24, Ni=28, Zn=30)
  '¿Qué elemento tiene número atómico 6?': 'Carbono', // C=6
  '¿Cuál es el número atómico del Uranio (U)?': '92', // U=92 (Ra=88, Th=90, Pu=94)
  '¿Qué elemento tiene número atómico 8?': 'Oxígeno', // O=8
  '¿Cuál es el número atómico del Sodio (Na)?': '11', // Na=11 (F=9, Al=13, P=15)
  '¿Qué elemento tiene número atómico 2?': 'Helio', // He=2
  // ── Grupos y períodos ──
  '¿A qué grupo pertenece el Carbono (C)?': 'Grupo 14', // C con Si, Ge, Sn, Pb
  '¿En qué período se encuentra el Sodio (Na)?': 'Período 3', // Z=11, tercera capa
  '¿A qué grupo pertenecen los Gases Nobles?': 'Grupo 18', // He, Ne, Ar, Kr, Xe, Rn
  '¿A qué grupo pertenecen los Halógenos?': 'Grupo 17', // F, Cl, Br, I, At, Ts
  '¿En qué período se encuentran los Lantánidos?': 'Período 6', // La(57) a Lu(71)
  '¿A qué grupo pertenecen los Metales Alcalinos?': 'Grupo 1', // Li, Na, K, Rb, Cs, Fr
  '¿En qué período se encuentra el Hierro (Fe)?': 'Período 4', // Z=26, con Cr, Mn, Co, Ni, Cu
  // ── Propiedades ──
  '¿Cuál es el metal más abundante en la corteza terrestre?': 'Aluminio', // Al ~8,2 % en masa
  '¿Cuál es el elemento más electronegativo de la tabla periódica?': 'Flúor', // F = 3,98 Pauling
  '¿Qué dos elementos son líquidos a temperatura ambiente (25°C)?': 'Mercurio y Bromo', // Ga funde a 29,8 °C y Cs a 28,5 °C
  '¿Qué metal tiene el punto de fusión más alto de todos?': 'Wolframio (Tungsteno)', // W = 3.422 °C
  '¿Cuál es el elemento más abundante en el universo?': 'Hidrógeno', // ~75 % de la masa bariónica
  '¿Cuál es el metal más ligero (menor densidad)?': 'Litio', // Li = 0,534 g/cm³
  '¿Cuál es el gas noble más abundante en la atmósfera terrestre?': 'Argón', // Ar = 0,93 % del aire
  // CRC Handbook: renio 5.596 °C > wolframio 5.555 °C. Era el hallazgo 363: la app marcaba
  // el Wolframio y trataba «Renio» como fallo, citando en su explicación el 5.555 °C que esa
  // misma fuente le da al W. El enunciado nombra ahora la fuente, porque las tablas no
  // coinciden en el wolframio (5.555 frente a 5.930 °C).
  'Según el CRC Handbook, ¿cuál es el elemento con mayor punto de ebullición?': 'Renio',
  '¿Qué elemento tiene mayor densidad de todos los sólidos?': 'Osmio', // Os = 22,59 g/cm³ (Ir 22,56)
  // ── Familias ──
  '¿Cuál de los siguientes NO es un Gas Noble?': 'Cloro (Cl)', // Cl es halógeno, grupo 17
  '¿Cuál de los siguientes es un Metaloide?': 'Silicio (Si)', // metaloides: B, Si, Ge, As, Sb, Te
  '¿Qué familia incluye al Flúor, Cloro, Bromo y Yodo?': 'Halógenos',
  '¿A qué familia pertenece el Hierro (Fe)?': 'Metales de transición', // grupos 3-12
  '¿Cuál de estos elementos es un metal alcalinotérreo?': 'Calcio (Ca)', // grupo 2: Be, Mg, Ca, Sr, Ba, Ra
  // OJO — hallazgo ABIERTO del 25/09/2026 (caso 5, test.fail): la tabla de la IUPAC pone
  // SIETE elementos en el grupo 18 (He, Ne, Ar, Kr, Xe, Rn y Og). Aquí se deja el 6 que la app
  // marca HOY para que los casos 1-3 no den un rojo por azar cada vez que sale esta pregunta;
  // cuando se repare, esta línea cambia con ella (o con el enunciado nuevo).
  '¿Cuántos elementos forman el grupo de los Gases Nobles?': '6',
  // ── Curiosidades ──
  '¿Qué elemento da el color rojo a los fuegos artificiales?': 'Estroncio', // Sr rojo, Ba verde, Cu azul-verde, K violeta
  '¿Cuál es el único metal líquido a temperatura ambiente estándar?': 'Mercurio', // Hg
  '¿Qué elemento es el principal componente de los chips modernos?': 'Silicio', // Si
  '¿Cuál fue el primer elemento sintético creado por el ser humano?': 'Tecnecio', // Tc, Z=43, 1937
  '¿Qué elemento es esencial para la fotosíntesis y tiene símbolo Mg?': 'Magnesio', // átomo central de la clorofila
  '¿Por qué el Wolframio tiene símbolo W?': 'Su nombre alemán es "Wolfram"',
  '¿Qué elemento da el color amarillo brillante a las llamas?': 'Sodio', // Na, lámparas de vapor de sodio
  '¿Qué gas se usa en los globos de helio de las fiestas?': 'Helio', // He
  '¿Cuál es el elemento más reactivo de todos?': 'Flúor', // F
  '¿Qué elemento tiene el mayor número de isótopos estables?': 'Estaño', // Sn, 10 isótopos estables
};

// ── Localizadores. Las clases van hasheadas por CSS Modules pero conservan el nombre
//    original dentro (p. ej. «QuizTablaPeriodica-module__nE35HW__opcionCorrecta»), y la
//    opción marcada como correcta NO tiene ninguna marca textual: la clase es el único
//    asidero posible para leer la clave de respuestas desde fuera.
const enunciado = (p: Page): Locator => p.locator('[class*="preguntaTexto"]');
const opciones = (p: Page): Locator => p.locator('main button[class*="opcion"]');
const opcionCorrecta = (p: Page): Locator => p.locator('main button[class*="opcionCorrecta"]');
const contadorAciertos = (p: Page): Locator => p.locator('[class*="aciertosProgreso"]');
const botonAvanzar = (p: Page): Locator =>
  p.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ });

/** Texto de una opción sin la letra A/B/C/D del recuadro. */
function limpiar(texto: string): string {
  return texto.replace(/^[ABCD]\s*/, '').replace(/\s+/g, ' ').trim();
}

/** Lee el enunciado en pantalla y devuelve su respuesta correcta según la clave a mano. */
async function respuestaEsperada(p: Page): Promise<{ pregunta: string; correcta: string }> {
  const pregunta = (await enunciado(p).innerText()).trim();
  const correcta = CLAVE_IUPAC[pregunta];
  expect(
    correcta,
    `La pregunta «${pregunta}» no está en CLAVE_IUPAC. El banco de page.tsx ha cambiado y ` +
      'nadie ha vuelto a resolverlo a mano contra la tabla de la IUPAC.',
  ).toBeTruthy();
  return { pregunta, correcta };
}

test.describe('Quiz Tabla Periódica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('h1')).toContainText('Quiz Tabla Periódica');
  });

  /**
   * CASO 1 — Corrección de los datos químicos
   *
   * Resuelto a mano ANTES de ejecutar: los 40 enunciados del banco contra la tabla de la
   * IUPAC (CLAVE_IUPAC de arriba). Se juegan 4 rondas de 10 preguntas —barajadas y sin
   * repetición dentro de cada ronda—, y en cada una se comprueba que la opción que la app
   * pinta como correcta es exactamente la que dice la clave. Cuatro rondas cubren de media
   * 27,3 de las 40 preguntas del banco; se exige un suelo de 18 distintas para que un test en
   * verde no pueda significar «apenas miró nada». El suelo se eligió simulando 200.000 tandas
   * de 4 rondas: el mínimo que salió fue 19, y por debajo de 20 solo 2 veces — con 18 el test
   * no puede ponerse rojo por azar.
   */
  test('caso 1 · dato: la clave de respuestas coincide con la tabla periódica de la IUPAC', async ({ page }) => {
    test.setTimeout(180_000);

    const vistas = new Set<string>();

    for (let ronda = 1; ronda <= 4; ronda++) {
      await page.getByRole('button', { name: /Empezar quiz|Jugar otra vez/ }).click();
      await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();

      const deLaRonda: string[] = [];

      for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
        const { pregunta, correcta } = await respuestaEsperada(page);
        vistas.add(pregunta);
        deLaRonda.push(pregunta);

        // Antes de responder hay exactamente 4 opciones y la correcta está entre ellas.
        const textos = (await opciones(page).allInnerTexts()).map(limpiar);
        expect(textos, `4 opciones en «${pregunta}»`).toHaveLength(4);
        expect(new Set(textos).size, `las 4 opciones son distintas en «${pregunta}»`).toBe(4);
        expect(textos, `la respuesta de la IUPAC está entre las opciones de «${pregunta}»`).toContain(correcta);

        await opciones(page).nth(textos.indexOf(correcta)).click();

        // La app marca como correcta la misma opción que la tabla periódica.
        expect(
          limpiar(await opcionCorrecta(page).innerText()),
          `«${pregunta}» → la app marca otra opción que la IUPAC`,
        ).toBe(correcta);
        await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();

        if (n < TOTAL_PREGUNTAS) await botonAvanzar(page).click();
      }

      // Dentro de una ronda no se repite ninguna pregunta (mezclarArray + slice).
      expect(new Set(deLaRonda).size, `ronda ${ronda} sin preguntas repetidas`).toBe(TOTAL_PREGUNTAS);

      // 10 aciertos de 10 → 100 %.
      await page.getByRole('button', { name: /Ver resultados/ }).click();
      await expect(page.locator('[class*="puntuacionCirculo"]')).toContainText('10');
    }

    expect(
      vistas.size,
      `solo se verificaron ${vistas.size} preguntas distintas de las ${TAMANO_BANCO} del banco`,
    ).toBeGreaterThanOrEqual(18);
  });

  /**
   * CASO 2 — Motor de puntuación
   *
   * Resuelto a mano ANTES de ejecutar, leyendo el motor de page.tsx: se responden las 7
   * primeras BIEN y las 3 últimas MAL, así que aciertos = [true×7, false×3].
   *   totalAciertos = 7 · Errores = 10 - 7 = 3 · Puntuación = round(7/10·100) = 70 %
   *   getMensaje(): 70 >= 70 y 70 < 90 → «¡Muy buen nivel!» 🎯
   * Y durante la partida el contador «✓ N aciertos» debe ir marcando 1,2,3,4,5,6,7,7,7,7.
   */
  test('caso 2 · cálculo: 7 aciertos y 3 fallos dan 7/10, 3 errores y 70 % «¡Muy buen nivel!»', async ({ page }) => {
    test.setTimeout(90_000);

    const ACIERTOS_BUSCADOS = 7; // 7 correctas
    const FALLOS_BUSCADOS = 3; // y 3 incorrectas
    const CONTADOR_ESPERADO = [1, 2, 3, 4, 5, 6, 7, 7, 7, 7]; // aciertos acumulados tras cada respuesta

    await page.getByRole('button', { name: /Empezar quiz/ }).click();
    await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();
    await expect(contadorAciertos(page)).toContainText('0 aciertos'); // se arranca a cero

    for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
      await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
      const { pregunta, correcta } = await respuestaEsperada(page);
      const textos = (await opciones(page).allInnerTexts()).map(limpiar);
      const indiceCorrecta = textos.indexOf(correcta);

      const debeAcertar = n <= ACIERTOS_BUSCADOS;
      const indiceAPulsar = debeAcertar
        ? indiceCorrecta
        : textos.findIndex((_, i) => i !== indiceCorrecta); // cualquier opción que no sea la buena
      await opciones(page).nth(indiceAPulsar).click();

      await expect(
        page.locator(debeAcertar ? '[class*="feedbackCorrecto"]' : '[class*="feedbackIncorrecto"]'),
        `«${pregunta}» respondida ${debeAcertar ? 'bien' : 'mal'} a propósito`,
      ).toBeVisible();
      // Singular con 1: era el hallazgo 366 («1 aciertos»), y lo veía todo el que acertara
      // la primera pregunta.
      const acumulados = CONTADOR_ESPERADO[n - 1];
      await expect(contadorAciertos(page)).toContainText(
        `${acumulados} ${acumulados === 1 ? 'acierto' : 'aciertos'}`,
      );

      if (n < TOTAL_PREGUNTAS) await botonAvanzar(page).click();
    }

    await page.getByRole('button', { name: /Ver resultados/ }).click();

    // Marcador final, calculado a mano arriba.
    await expect(page.locator('[class*="puntuacionCirculo"]')).toContainText('7');
    await expect(page.locator('[class*="puntuacionCirculo"]')).toContainText(`/${TOTAL_PREGUNTAS}`);

    const stats = page.locator('[class*="statItem"]');
    await expect(stats.nth(0)).toContainText('7'); // Aciertos = 7
    await expect(stats.nth(0)).toContainText('Aciertos');
    await expect(stats.nth(1)).toContainText(String(FALLOS_BUSCADOS)); // Errores = 10 - 7 = 3
    await expect(stats.nth(1)).toContainText('Errores');
    await expect(stats.nth(2)).toContainText('70%'); // round(7/10*100)
    await expect(stats.nth(2)).toContainText('Puntuación');

    await expect(page.locator('[class*="mensajeFinal"]')).toContainText('¡Muy buen nivel!');
  });

  /**
   * CASO 3 — Límites y operativa
   *
   * Resuelto a mano ANTES de ejecutar, leyendo page.tsx:
   *   · el bloque de feedback y el botón de avanzar solo se pintan con `haRespondido &&`,
   *     así que antes de responder NO hay forma de saltar la pregunta → 0 botones;
   *   · `disabled={haRespondido}` deshabilita las 4 opciones tras la primera pulsación, y
   *     `responder()` además corta con `if (haRespondido) return` → un segundo clic no puede
   *     cambiar el marcador;
   *   · en la décima, `indice + 1 >= TOTAL_PREGUNTAS` cambia el rótulo a «Ver resultados →»;
   *   · fallándolo todo: 0 aciertos, Errores = 10 - 0 = 10, 0 %, y getMensaje() cae al último
   *     return → «La tabla periódica guarda muchos secretos»;
   *   · «Jugar otra vez» llama a iniciarQuiz(), que devuelve indice=0 y aciertos=[] → vuelve a
   *     «Pregunta 1 de 10» con «0 aciertos».
   * Se fija además la accesibilidad de las opciones: son botones de ACCIÓN, así que llevan
   * type="button" y NO deben llevar aria-pressed (regresión del hallazgo 285).
   */
  test('caso 3 · operativa: no se puede saltar ni responder dos veces, y el 0/10 y el reinicio cuadran', async ({ page }) => {
    test.setTimeout(90_000);

    await page.getByRole('button', { name: /Empezar quiz/ }).click();
    await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();

    // (a) Sin responder no hay salida: ni «Siguiente pregunta» ni «Ver resultados».
    await expect(botonAvanzar(page)).toHaveCount(0);

    // (b) Accesibilidad de las opciones: acción, no conmutador (hallazgo 285).
    await expect(opciones(page)).toHaveCount(4);
    for (const boton of await opciones(page).all()) {
      await expect(boton).toHaveAttribute('type', 'button');
      expect(
        await boton.getAttribute('aria-pressed'),
        'las opciones son botones de ACCIÓN: aria-pressed aquí sería una regresión (hallazgo 285)',
      ).toBeNull();
    }

    for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
      const { correcta } = await respuestaEsperada(page);
      const textos = (await opciones(page).allInnerTexts()).map(limpiar);
      const indiceCorrecta = textos.indexOf(correcta);
      const indiceFallo = textos.findIndex((_, i) => i !== indiceCorrecta);

      await opciones(page).nth(indiceFallo).click(); // fallamos las 10 a propósito
      await expect(contadorAciertos(page)).toContainText('0 aciertos');

      if (n === 1) {
        // (c) Tras responder, las 4 opciones quedan bloqueadas y un segundo clic —incluso
        //     sobre la correcta— no puede sumar un acierto.
        for (const boton of await opciones(page).all()) await expect(boton).toBeDisabled();
        await opciones(page).nth(indiceCorrecta).click({ force: true }).catch(() => { /* bloqueado */ });
        await expect(contadorAciertos(page)).toContainText('0 aciertos');
      }

      // (d) El rótulo del botón cambia solo en la última pregunta.
      await expect(botonAvanzar(page)).toHaveText(
        n < TOTAL_PREGUNTAS ? /Siguiente pregunta/ : /Ver resultados/,
      );
      await botonAvanzar(page).click();
    }

    // (e) Diez fallos: 0/10, 10 errores, 0 % y el mensaje del tramo más bajo.
    await expect(page.locator('[class*="puntuacionCirculo"]')).toContainText('0');
    const stats = page.locator('[class*="statItem"]');
    await expect(stats.nth(0)).toContainText('0'); // Aciertos
    await expect(stats.nth(1)).toContainText(String(TOTAL_PREGUNTAS)); // Errores = 10 - 0
    await expect(stats.nth(2)).toContainText('0%'); // round(0/10*100)
    await expect(page.locator('[class*="mensajeFinal"]')).toContainText(
      'La tabla periódica guarda muchos secretos',
    );

    // (f) «Jugar otra vez» deja el marcador a cero y vuelve a la pregunta 1.
    await page.getByRole('button', { name: /Jugar otra vez/ }).click();
    await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();
    await expect(contadorAciertos(page)).toContainText('0 aciertos');
    await expect(botonAvanzar(page)).toHaveCount(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 25/09/2026
// ══════════════════════════════════════════════════════════════════════════════════════

/**
 * Posiciones en BANCO_PREGUNTAS (0 = id 1) de las preguntas que los casos fuerzan. Cada caso
 * comprueba además el enunciado que sale, así que si el banco se reordena falla diciéndolo.
 */
const POS_UNIVERSO = 19; // id 20 · «¿Cuál es el elemento más abundante en el universo?»
const POS_GASES_NOBLES = 27; // id 28 · «¿Cuántos elementos forman el grupo de los Gases Nobles?»
const POS_ISOTOPOS = 37; // id 38 · «¿Qué elemento tiene el mayor número de isótopos estables?»
const POS_RENIO = 38; // id 39 · la del punto de ebullición (hallazgo 363)
const PRIMERAS_DIEZ = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // ids 1-10, en el orden del banco

/**
 * Pulsa «Empezar quiz» / «Jugar otra vez» con Math.random programado para que las diez
 * primeras del barajado sean las posiciones pedidas. Los valores se calculan deshaciendo el
 * Fisher-Yates de mezclarArray (i de 39 a 1, j = floor(r·(i+1))), y se instalan y retiran
 * DENTRO de la misma tarea que el clic: nada más puede consumirlos. Que se gasten exactamente
 * 39 es la prueba de que los consumió mezclarArray y nadie más.
 */
async function empezarConBanco(page: Page, rotulo: string, primeras: number[]): Promise<void> {
  await esperarPaginaAsentada(page);
  const consumidos = await page.evaluate(
    ({ rotulo, primeras, n }) => {
      const resto = [...Array(n).keys()].filter((i) => !primeras.includes(i));
      const objetivo = [...primeras, ...resto];
      const copia = [...Array(n).keys()];
      const valores: number[] = [];
      for (let i = n - 1; i > 0; i--) {
        const j = copia.indexOf(objetivo[i]);
        valores.push((j + 0.5) / (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      const boton = Array.from(document.querySelectorAll<HTMLButtonElement>('main button')).find((b) =>
        (b.textContent ?? '').includes(rotulo),
      );
      if (!boton) throw new Error(`No hay botón «${rotulo}» en <main>`);
      const original = Math.random;
      let k = 0;
      Math.random = () => (k < valores.length ? valores[k++] : original());
      try {
        boton.click();
      } finally {
        Math.random = original;
      }
      return k;
    },
    { rotulo, primeras, n: TAMANO_BANCO },
  );
  expect(consumidos, 'mezclarArray baraja 40 preguntas: consume 39 números').toBe(TAMANO_BANCO - 1);
  await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();
}

/** Pulsa la opción cuyo texto (sin la letra) es exactamente `texto`. */
async function pulsarOpcion(page: Page, texto: string): Promise<void> {
  const textos = (await opciones(page).allInnerTexts()).map(limpiar);
  const i = textos.indexOf(texto);
  expect(i, `«${texto}» entre las opciones ${textos.join(' / ')}`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(i).click();
}

/** Responde la pregunta en pantalla con la clave a mano y pasa a la siguiente. */
async function responderBienYAvanzar(page: Page): Promise<string> {
  const { pregunta, correcta } = await respuestaEsperada(page);
  await pulsarOpcion(page, correcta);
  await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
  await botonAvanzar(page).click();
  return pregunta;
}

/**
 * Solo con teclado: Tab hasta «Empezar quiz», Enter, un Tab a la opción A, Tab hasta la buena
 * según la clave y Enter. Termina con el foco en «Siguiente pregunta» (el arreglo del 364).
 * El arranque va por teclado a propósito: un clic sintético no mueve el punto de partida de
 * la navegación secuencial, y el primer Tab ya no mediría lo que mide aquí.
 */
async function empezarYAcertarConTeclado(page: Page): Promise<void> {
  await esperarPaginaAsentada(page);
  let enEmpezar = false;
  for (let t = 0; t < 40 && !enEmpezar; t++) {
    await page.keyboard.press('Tab');
    enEmpezar = await page.evaluate(() => (document.activeElement?.textContent ?? '').includes('Empezar quiz'));
  }
  expect(enEmpezar, 'con Tab se llega a «Empezar quiz»').toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(opciones(page).first()).toBeFocused();
  const { correcta } = await respuestaEsperada(page);
  const textos = (await opciones(page).allInnerTexts()).map(limpiar);
  for (let k = 0; k < textos.indexOf(correcta); k++) await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
  await expect(botonAvanzar(page)).toBeFocused();
}

/** Sin el aviso de transparencia fijo del pie, que en la primera visita tapa el quiz. */
async function abrirSinAviso(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: el aviso saldrá, y los clics de Playwright lo esquivan */
    }
  });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz Tabla Periódica');
}

interface Contraste {
  texto: string;
  ratio: number;
  umbral: number;
}

/**
 * Contraste WCAG del texto de un elemento contra su fondo REAL: el color computado de cada
 * antepasado compuesto hasta llegar a uno opaco, o, si lo pinta un degradado, el color del
 * degradado en una rejilla sobre las cajas del propio texto (se devuelve el peor punto).
 * Umbral 3:1 para texto grande (≥ 24 px, o ≥ 18,66 px en negrita) y 4,5:1 para el resto.
 */
async function contrasteDe(loc: Locator): Promise<Contraste> {
  return loc.evaluate((el) => {
    type Rgba = { r: number; g: number; b: number; a: number };
    const rgba = (s: string): Rgba | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (c: Rgba, f: Rgba): Rgba => ({
      r: c.r * c.a + f.r * (1 - c.a),
      g: c.g * c.a + f.g * (1 - c.a),
      b: c.b * c.a + f.b * (1 - c.a),
      a: 1,
    });
    const lum = (c: Rgba): number => {
      const f = (v: number): number => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a: Rgba, b: Rgba): number => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    const peso = Number(cs.fontWeight);
    const umbral = px >= 24 || (px >= 18.66 && peso >= 700) ? 3 : 4.5;
    const color = rgba(cs.color) as Rgba;

    const capas: Rgba[] = [];
    let degradado: Element | null = null;
    for (let e: Element | null = el; e; e = e.parentElement) {
      const ce = getComputedStyle(e);
      if (ce.backgroundImage.startsWith('linear-gradient')) {
        degradado = e;
        break;
      }
      const c = rgba(ce.backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
    }
    let fondos: Rgba[] = [];
    if (degradado) {
      const m = getComputedStyle(degradado).backgroundImage.match(
        /linear-gradient\((\d+)deg,\s*(rgba?\([^)]+\)),\s*(rgba?\([^)]+\))\)/,
      );
      if (!m) throw new Error('Degradado con una forma que esta medida no sabe leer');
      const ang = (Number(m[1]) * Math.PI) / 180;
      const c1 = rgba(m[2]) as Rgba;
      const c2 = rgba(m[3]) as Rgba;
      const caja = degradado.getBoundingClientRect();
      const dx = Math.sin(ang);
      const dy = -Math.cos(ang);
      const largo = Math.abs(caja.width * dx) + Math.abs(caja.height * dy);
      const rango = document.createRange();
      rango.selectNodeContents(el);
      for (const t of Array.from(rango.getClientRects())) {
        for (let i = 0; i <= 4; i++) {
          for (let j = 0; j <= 2; j++) {
            const x = t.left + (t.width * i) / 4;
            const y = t.top + (t.height * j) / 2;
            let k = ((x - (caja.left + caja.width / 2)) * dx + (y - (caja.top + caja.height / 2)) * dy) / largo + 0.5;
            k = Math.min(1, Math.max(0, k));
            fondos.push({ r: c1.r + (c2.r - c1.r) * k, g: c1.g + (c2.g - c1.g) * k, b: c1.b + (c2.b - c1.b) * k, a: 1 });
          }
        }
      }
    } else {
      let base: Rgba = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = capas.length - 1; i >= 0; i--) base = sobre(capas[i], base);
      fondos = [base];
    }
    const minimo = Math.min(...fondos.map((f) => ratio(color.a < 1 ? sobre(color, f) : color, f)));
    return {
      texto: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 30),
      ratio: Math.round(minimo * 100) / 100,
      umbral,
    };
  });
}

test.describe('Quiz Tabla Periódica · re-inspección 25/09/2026 (escritorio)', () => {
  test.beforeEach(async ({ page }) => {
    await abrirSinAviso(page);
  });

  /**
   * CASO 4 — El banco ENTERO, sin azar
   *
   * Resuelto a mano ANTES de ejecutar: las 40 contra CLAVE_IUPAC (la IUPAC para Z, símbolos,
   * grupos, períodos y familias; el CRC Handbook para las propiedades físicas). Cuatro rondas
   * forzadas —posiciones 0-9, 10-19, 20-29 y 30-39 del banco— tienen que enseñar 40
   * enunciados DISTINTOS, todos en la clave, y en cada uno la app tiene que pintar como buena
   * la opción de la clave. El caso 1 lo hace al azar con un suelo de 18; este no deja ninguna
   * sin mirar.
   */
  test('caso 4 · dato: las 40 preguntas del banco, forzadas, marcan la respuesta de la clave', async ({ page }) => {
    test.setTimeout(120_000);
    const vistas = new Set<string>();
    let rotulo = 'Empezar quiz';
    for (let ronda = 0; ronda < 4; ronda++) {
      await empezarConBanco(page, rotulo, [...Array(TOTAL_PREGUNTAS).keys()].map((k) => ronda * 10 + k));
      for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
        await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
        const { pregunta, correcta } = await respuestaEsperada(page);
        vistas.add(pregunta);
        await pulsarOpcion(page, correcta);
        expect(limpiar(await opcionCorrecta(page).innerText()), `«${pregunta}»`).toBe(correcta);
        await botonAvanzar(page).click();
      }
      await expect(page.locator('[class*="puntuacionCirculo"]')).toContainText(`${TOTAL_PREGUNTAS}/${TOTAL_PREGUNTAS}`);
      rotulo = 'Jugar otra vez';
    }
    expect(vistas.size, '4 rondas forzadas × 10 = las 40 del banco, sin repetir').toBe(TAMANO_BANCO);
    expect([...vistas].sort()).toEqual(Object.keys(CLAVE_IUPAC).sort());
  });

  /**
   * CASO 5 — HALLAZGO ABIERTO: la pregunta 28 da por mala la respuesta de la IUPAC
   *
   * «¿Cuántos elementos forman el grupo de los Gases Nobles?» pregunta por el GRUPO, y la tabla
   * periódica de la IUPAC (versión del 4/05/2022) pone siete en el grupo 18: He, Ne, Ar, Kr, Xe,
   * Rn y Og. La IUPAC le dio al oganesón la terminación «-on» precisamente por ser del grupo 18
   * (Koppenol et al., Pure Appl. Chem. 88, 401-405, 2016). La app marca «6» y trata el «7» como
   * fallo con un criterio —«el Oganesón es artificial»— que ella misma no aplica: el tecnecio de
   * la pregunta 32 es artificial y tiene su grupo, y su intro cuenta «los 118 elementos».
   * DEBERÍA: pulsar «7» es acierto (o el enunciado pregunta otra cosa con una sola respuesta,
   * p. ej. cuántos gases nobles hay en la naturaleza; entonces se reescribe este caso).
   */
  test.fail('caso 5 · dato: la pregunta del grupo 18 acepta los 7 elementos de la IUPAC', async ({ page }) => {
    await empezarConBanco(page, 'Empezar quiz', [POS_GASES_NOBLES, ...PRIMERAS_DIEZ.slice(1)]);
    await expect(enunciado(page)).toHaveText('¿Cuántos elementos forman el grupo de los Gases Nobles?');
    await pulsarOpcion(page, '7');
    expect(limpiar(await opcionCorrecta(page).innerText())).toBe('7');
    await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
  });

  /**
   * CASO 6 — HALLAZGO ABIERTO (el mismo): el FAQPage del JSON-LD dice «los seis elementos del
   * grupo 18». Es el texto que leen Google y los buscadores de IA. DEBERÍA: no afirmar que el
   * grupo 18 tiene seis elementos (tiene siete, con el oganesón).
   */
  test.fail('caso 6 · dato: el FAQPage no dice que el grupo 18 tenga seis elementos', async ({ page }) => {
    const html = await (await page.request.get(RUTA)).text();
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as { '@type': string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((x) => x['@type'] === 'FAQPage');
    const respuesta = faq?.mainEntity?.find((q) => /gases nobles/i.test(q.name))?.acceptedAnswer.text ?? '';
    expect(respuesta, 'la pregunta del FAQPage sobre los gases nobles').not.toBe('');
    expect(respuesta).not.toMatch(/seis elementos del grupo 18/i);
  });

  /**
   * CASO 7a — HALLAZGO ABIERTO: la explicación de la pregunta 38 dice «Le sigue el Xenón con 9
   * isótopos estables». El xenón tiene 9 isótopos NATURALES, pero dos son radiactivos con
   * desintegración observada: el ¹²⁴Xe (1,8·10²² años, XENON1T, Nature 568, 532, 2019) y el
   * ¹³⁶Xe (2,2·10²¹ años, EXO-200). NUBASE2020 le deja 7 estables. La respuesta marcada
   * (Estaño, 10 estables) es correcta. DEBERÍA: «9 isótopos naturales», o 7 estables.
   */
  test.fail('caso 7a · dato: la explicación de los isótopos no le da al xenón 9 estables', async ({ page }) => {
    await empezarConBanco(page, 'Empezar quiz', [POS_ISOTOPOS, ...PRIMERAS_DIEZ.slice(1)]);
    await expect(enunciado(page)).toHaveText('¿Qué elemento tiene el mayor número de isótopos estables?');
    await pulsarOpcion(page, 'Estaño');
    await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
    await expect(page.locator('[class*="explicacion"]')).not.toContainText('Xenón con 9 isótopos estables');
  });

  /**
   * CASO 7b — HALLAZGO ABIERTO: la explicación de la pregunta 20 dice que el hidrógeno es
   * «aproximadamente el 75% de la masa del universo». Es el 75 % de la materia ORDINARIA
   * (bariónica); con la materia oscura, que es ~5/6 de la materia (Planck 2018, A&A 641, A6),
   * se queda en torno al 12 % de la masa. La respuesta marcada (Hidrógeno) es correcta.
   * DEBERÍA: decir de qué masa es el 75 % (materia ordinaria, o masa de los elementos).
   */
  test.fail('caso 7b · dato: el 75 % del hidrógeno se refiere a la materia ordinaria', async ({ page }) => {
    await empezarConBanco(page, 'Empezar quiz', [POS_UNIVERSO, ...PRIMERAS_DIEZ.slice(1)]);
    await expect(enunciado(page)).toHaveText('¿Cuál es el elemento más abundante en el universo?');
    await pulsarOpcion(page, 'Hidrógeno');
    await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
    await expect(page.locator('[class*="explicacion"]')).not.toContainText('75% de la masa del universo');
  });

  /**
   * CASO 8 — Límite: diez de diez, y «Jugar otra vez» sin recargar y con otro barajado
   *
   * Resuelto a mano: ronda forzada con las posiciones 10-19 del banco, todas bien →
   * aciertos = [true×10] · Errores = 10 − 10 = 0 · Puntuación = round(10/10·100) = 100 % ·
   * getMensaje(): 100 ≥ 90 → «¡Experto en química!». El contador va 1 (singular) … 10.
   * «Jugar otra vez» llama a iniciarQuiz(), que no navega: una marca puesta en `window` antes
   * de jugar tiene que seguir viva. Y vuelve a barajar: que la ronda nueva repita las mismas
   * diez en el mismo orden tiene probabilidad 30!/40! ≈ 2·10⁻¹⁶.
   */
  test('caso 8 · límite: 10/10 da 100 % y «¡Experto en química!»; «Jugar otra vez» no recarga y rebaraja', async ({ page }) => {
    test.setTimeout(90_000);
    await page.evaluate(() => {
      (window as unknown as { __sinRecarga?: string }).__sinRecarga = 'viva';
    });
    await empezarConBanco(page, 'Empezar quiz', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const primeraRonda: string[] = [];
    for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
      await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
      const { pregunta, correcta } = await respuestaEsperada(page);
      primeraRonda.push(pregunta);
      await pulsarOpcion(page, correcta);
      await expect(contadorAciertos(page)).toHaveText(`✓ ${n} ${n === 1 ? 'acierto' : 'aciertos'}`);
      await botonAvanzar(page).click();
    }
    await expect(page.locator('[class*="puntuacionCirculo"]')).toHaveText('10/10');
    const stats = page.locator('[class*="statItem"]');
    await expect(stats.nth(0)).toHaveText('10Aciertos'); // 10 bien
    await expect(stats.nth(1)).toHaveText('0Errores'); // 10 − 10
    await expect(stats.nth(2)).toHaveText('100%Puntuación'); // round(10/10·100)
    await expect(page.locator('[class*="mensajeTexto"]')).toHaveText('¡Experto en química!');

    await page.getByRole('button', { name: 'Jugar otra vez' }).click();
    await expect(page.getByText(`Pregunta 1 de ${TOTAL_PREGUNTAS}`)).toBeVisible();
    await expect(contadorAciertos(page)).toHaveText('✓ 0 aciertos');
    expect(await page.evaluate(() => (window as unknown as { __sinRecarga?: string }).__sinRecarga)).toBe('viva');
    expect(await page.evaluate(() => performance.getEntriesByType('navigation').length)).toBe(1);

    const segundaRonda: string[] = [];
    for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
      await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
      segundaRonda.push(await responderBienYAvanzar(page));
    }
    expect(new Set(segundaRonda).size, 'la ronda nueva no repite preguntas').toBe(TOTAL_PREGUNTAS);
    expect(segundaRonda, '«Jugar otra vez» vuelve a barajar').not.toEqual(primeraRonda);
  });

  /**
   * CASO 9 — Robustez: doble clic y dos opciones seguidas no cuentan dos veces
   *
   * Resuelto a mano, ronda forzada con los ids 1-10:
   *   P1 (Oro) doble clic en «79» → un solo acierto: el primer clic deja las cuatro opciones
   *     `disabled` y el segundo no llega a ningún manejador → «1 acierto».
   *   P2 (Z = 1) clic en «Helio» y, sin esperar, en «Hidrógeno» → cuenta solo el primero, que es
   *     un fallo: el contador sigue en «1 acierto», «Helio» queda en rojo y «Hidrógeno» en verde.
   *   P3-P10 bien → aciertos = [true, false, true×8] = 9.
   *   Final: 9/10 · Errores = 10 − 9 = 1 · round(9/10·100) = 90 % · getMensaje(): 90 ≥ 90 →
   *   «¡Experto en química!» (el borde exacto del tramo más alto).
   */
  test('caso 9 · robustez: doble clic y dos opciones seguidas cuentan una vez → 9/10, 90 %', async ({ page }) => {
    test.setTimeout(60_000);
    await empezarConBanco(page, 'Empezar quiz', PRIMERAS_DIEZ);

    await expect(enunciado(page)).toHaveText('¿Cuál es el número atómico del Oro (Au)?');
    const textos1 = (await opciones(page).allInnerTexts()).map(limpiar);
    await opciones(page).nth(textos1.indexOf('79')).dblclick();
    await expect(contadorAciertos(page)).toHaveText('✓ 1 acierto');
    await botonAvanzar(page).click();

    await expect(enunciado(page)).toHaveText('¿Qué elemento tiene número atómico 1?');
    const textos2 = (await opciones(page).allInnerTexts()).map(limpiar);
    // Tras avanzar, la vista se queda donde estaba «Siguiente pregunta» (caso 16): hay que
    // traer las opciones a pantalla antes de leer sus cajas para el ratón.
    await opciones(page).nth(3).scrollIntoViewIfNeeded();
    await opciones(page).nth(0).scrollIntoViewIfNeeded();
    const cajaMala = await opciones(page).nth(textos2.indexOf('Helio')).boundingBox();
    const cajaBuena = await opciones(page).nth(textos2.indexOf('Hidrógeno')).boundingBox();
    if (!cajaMala || !cajaBuena) throw new Error('opciones sin caja');
    await page.mouse.click(cajaMala.x + cajaMala.width / 2, cajaMala.y + cajaMala.height / 2);
    await page.mouse.click(cajaBuena.x + cajaBuena.width / 2, cajaBuena.y + cajaBuena.height / 2);
    await expect(page.locator('[class*="feedbackIncorrecto"]')).toBeVisible();
    await expect(contadorAciertos(page)).toHaveText('✓ 1 acierto');
    expect(limpiar(await page.locator('main button[class*="opcionIncorrecta"]').innerText())).toBe('Helio');
    expect(limpiar(await opcionCorrecta(page).innerText())).toBe('Hidrógeno');
    // En claro la correcta y la fallada se distinguen por el borde (verde / rojo). Con sondeo:
    // .opcion anima border-color 0,15 s y leerlo al instante da el valor de partida.
    await expect
      .poll(() =>
        page.evaluate(() =>
          ['opcionCorrecta', 'opcionIncorrecta'].map(
            (c) => getComputedStyle(document.querySelector(`main button[class*="${c}"]`) as Element).borderTopColor,
          ),
        ),
      )
      .toEqual(['rgb(22, 163, 74)', 'rgb(220, 38, 38)']);
    await botonAvanzar(page).click();

    for (let n = 3; n <= TOTAL_PREGUNTAS; n++) {
      await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
      await responderBienYAvanzar(page);
    }
    await expect(page.locator('[class*="puntuacionCirculo"]')).toHaveText('9/10');
    const stats = page.locator('[class*="statItem"]');
    await expect(stats.nth(0)).toHaveText('9Aciertos');
    await expect(stats.nth(1)).toHaveText('1Errores'); // 10 − 9
    await expect(stats.nth(2)).toHaveText('90%Puntuación'); // round(9/10·100)
    await expect(page.locator('[class*="mensajeTexto"]')).toHaveText('¡Experto en química!'); // 90 ≥ 90
  });

  /**
   * CASO 10a — Teclado: lo que arregló el hallazgo 364 sigue en pie
   *
   * Resuelto a mano leyendo page.tsx: al responder, el useEffect lleva el foco a «Siguiente
   * pregunta», y el veredicto se pinta dentro de un div role="status" aria-live="polite" que
   * está en <main>. Al empezar, el botón pulsado desaparece y Chrome conserva el punto de
   * partida de la navegación secuencial donde estaba: un Tab lleva a la opción A.
   */
  test('caso 10a · accesibilidad: con teclado se empieza, se responde y el foco va a «Siguiente pregunta»', async ({ page }) => {
    await empezarYAcertarConTeclado(page);
    await expect(page.locator('main [role="status"][aria-live="polite"]')).toContainText('¡Correcto!');
  });

  /**
   * CASO 10b — HALLAZGO ABIERTO: tras «Siguiente pregunta» el foco no vuelve a la pregunta
   *
   * El botón que se pulsa desaparece (el bloque de feedback se desmonta) y nadie mueve el foco:
   * cae a <body> y el punto de partida queda DETRÁS de las opciones nuevas, así que el Tab
   * siguiente salta a «Ver Guía Completa», en el bloque educativo. Medido el 25/09/2026: 18
   * Tabs para volver a la opción A, en cada una de las 9 transiciones de la partida; y el
   * lector de pantalla no anuncia la pregunta nueva. Es la otra mitad del bucle del 364.
   * DEBERÍA: después de avanzar, el Tab siguiente cae dentro de la tarjeta de la pregunta.
   */
  test.fail('caso 10b · accesibilidad: tras «Siguiente pregunta» el Tab vuelve a la pregunta nueva', async ({ page }) => {
    await empezarYAcertarConTeclado(page);
    await page.keyboard.press('Enter');
    await expect(page.getByText(`Pregunta 2 de ${TOTAL_PREGUNTAS}`)).toBeVisible();
    await page.keyboard.press('Tab');
    const dentro = await page.evaluate(() => !!document.activeElement?.closest('[class*="preguntaCard"]'));
    expect(dentro, 'el primer Tab tras avanzar cae en la pregunta nueva').toBe(true);
  });

  /**
   * CASO 11 — Los arreglos 363, 365, 367 y 368 siguen en pie
   *
   *   363 · con la pregunta del punto de ebullición forzada, «Renio» es acierto y la
   *         explicación da los 5.596 °C del CRC Handbook.
   *   365 · ningún emoji llega al árbol de accesibilidad de <main> ni del <h1> (inicio, juego
   *         y resultado): todos van con aria-hidden.
   *   367 · el banco tiene 40 preguntas contadas a mano, y eso es lo que dicen el hero, la
   *         metadata, OpenGraph y el JSON-LD: «40», nunca «40+».
   *   368 · el FAQPage dice «la ciencia de materiales», no «la materiales».
   */
  test('caso 11 · regresión: renio, emojis ocultos, «40 preguntas» y «ciencia de materiales»', async ({ page }) => {
    test.setTimeout(60_000);
    const html = await (await page.request.get(RUTA)).text();
    expect(html).not.toMatch(/40\s*\+/);
    expect(html).toContain('40 preguntas de química'); // description y JSON-LD
    expect(html).toContain('40 preguntas sobre elementos'); // og:description
    expect(html).toContain('"@type":"WebApplication"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('la ciencia de materiales');
    expect(html).not.toContain('la materiales');
    await expect(page.locator('header p').first()).toHaveText('40 preguntas sobre elementos, grupos, propiedades y curiosidades');

    const EMOJI = /\p{Extended_Pictographic}/u;
    expect(await page.locator('h1').ariaSnapshot()).not.toMatch(EMOJI);
    expect(await page.locator('main').ariaSnapshot(), 'inicio').not.toMatch(EMOJI);

    await empezarConBanco(page, 'Empezar quiz', [POS_RENIO, ...PRIMERAS_DIEZ.slice(1)]);
    await expect(enunciado(page)).toHaveText('Según el CRC Handbook, ¿cuál es el elemento con mayor punto de ebullición?');
    expect(await page.locator('main').ariaSnapshot(), 'jugando').not.toMatch(EMOJI);
    await pulsarOpcion(page, 'Renio');
    await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
    await expect(page.locator('[class*="explicacion"]')).toContainText('5.596 °C');
    await botonAvanzar(page).click();
    for (let n = 2; n <= TOTAL_PREGUNTAS; n++) {
      await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
      await responderBienYAvanzar(page);
    }
    await expect(page.locator('[class*="puntuacionCirculo"]')).toHaveText('10/10');
    expect(await page.locator('main').ariaSnapshot(), 'resultado').not.toMatch(EMOJI);
  });

  /**
   * CASO 12 — Regresión de 272b0ee7: el logo fijo no tapa el título ni los controles ≤ 768 px
   *
   * Resuelto a mano con las cajas: hasta 768 px el hero deja 80 px arriba y la barra del logo
   * termina en ~52 px (logo 10-52, conmutador 12-50). Se comprueba, en 360, 412, 600 y 768:
   * ninguna línea de texto del <h1> se cruza con el logo ni con el conmutador, y en el centro
   * del <h1> el punto lo recibe el propio <h1>. Después, ya en juego, cada opción centrada en
   * pantalla recibe el clic en su centro (no se lo roba la barra fija).
   */
  test('caso 12 · regresión: el logo fijo no tapa el <h1> ni las opciones en 360, 412, 600 y 768 px', async ({ page }) => {
    test.setTimeout(60_000);
    await empezarConBanco(page, 'Empezar quiz', PRIMERAS_DIEZ);
    for (const ancho of [360, 412, 600, 768]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      const cabecera = await page.evaluate(() => {
        const cruza = (a: DOMRect, b: DOMRect): boolean =>
          a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const barra = document.querySelector('[class*="headerBar"]');
        const tapas = barra ? Array.from(barra.children).map((e) => e.getBoundingClientRect()) : [];
        const h1 = document.querySelector('h1') as HTMLElement;
        const rango = document.createRange();
        rango.selectNodeContents(h1);
        const lineas = Array.from(rango.getClientRects());
        const r = h1.getBoundingClientRect();
        const enCentro = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return {
          tapas: tapas.length,
          lineasTapadas: lineas.filter((l) => tapas.some((t) => cruza(t, l))).length,
          centroEnH1: !!enCentro && h1.contains(enCentro),
        };
      });
      expect(cabecera.tapas, `${ancho} px: la barra fija tiene logo y conmutador`).toBeGreaterThanOrEqual(2);
      expect(cabecera.lineasTapadas, `${ancho} px: líneas del <h1> bajo el logo`).toBe(0);
      expect(cabecera.centroEnH1, `${ancho} px: el centro del <h1> es del <h1>`).toBe(true);

      for (let i = 0; i < 4; i++) {
        const libre = await opciones(page).nth(i).evaluate((b) => {
          b.scrollIntoView({ block: 'center' });
          const r = b.getBoundingClientRect();
          const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return !!e && b.contains(e);
        });
        expect(libre, `${ancho} px: el centro de la opción ${'ABCD'[i]} es de la opción`).toBe(true);
      }
    }
  });

  /**
   * CASO 13 — Regresión de b7733c6d: las cabeceras de la tabla del bloque educativo
   *
   * Resuelto a mano: blanco #FFFFFF sobre --primary-boton #26718F, que vale lo mismo en los
   * dos temas → 5,47:1 (texto de 14,4 px en 600, umbral 4,5). Se mide sobre el color
   * COMPUTADO del fondo real, en claro y en oscuro.
   */
  test('caso 13 · regresión: las cabeceras de tabla llegan a 4,5:1 en claro y en oscuro', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      const cabeceras = page.locator('table th');
      await expect(cabeceras).toHaveCount(2);
      for (let i = 0; i < 2; i++) {
        const m = await contrasteDe(cabeceras.nth(i));
        expect(m.ratio, `${tema} · «${m.texto}»`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  /**
   * CASO 14 — HALLAZGO ABIERTO: en oscuro las opciones pierden el verde y el rojo
   *
   * `[data-theme='dark'] .opcion` (especificidad 0,2,0) pisa el borde y el fondo de
   * `.opcionCorrecta` / `.opcionIncorrecta` (0,1,0), y `[data-theme='dark'] .opcionLetra`,
   * que va después en la hoja, pisa el círculo verde/rojo de la letra. Medido el 25/09/2026:
   * tras fallar la del Oro con «47», la fallada y la buena quedan IDÉNTICAS —borde
   * rgba(255,255,255,0,1), fondo rgba(255,255,255,0,04), letra gris— y solo las otras dos se
   * atenúan. En claro son rgb(22,163,74) y rgb(220,38,38) (caso 9).
   * DEBERÍA: en oscuro la correcta y la fallada se distinguen entre sí y de las apagadas.
   */
  test.fail('caso 14 · operativa: en oscuro la opción correcta y la fallada no se pintan igual', async ({ page }) => {
    await activarTema(page, 'dark');
    await page.emulateMedia({ reducedMotion: 'reduce' }); // sin la transición de 0,15 s del borde
    await empezarConBanco(page, 'Empezar quiz', PRIMERAS_DIEZ);
    await pulsarOpcion(page, '47');
    await expect(page.locator('[class*="feedbackIncorrecto"]')).toBeVisible();
    await page.mouse.move(0, 0);
    const estilo = await page.evaluate(() =>
      ['opcionCorrecta', 'opcionIncorrecta'].map((c) => {
        const b = document.querySelector(`main button[class*="${c}"]`) as Element;
        const l = b.querySelector('[class*="opcionLetra"]') as Element;
        return `${getComputedStyle(b).borderTopColor} | ${getComputedStyle(l).backgroundColor}`;
      }),
    );
    expect(estilo[0], 'correcta frente a fallada, en oscuro').not.toBe(estilo[1]);
  });

  /**
   * CASO 15 — HALLAZGO ABIERTO: el veredicto, la nota y los botones no llegan al contraste
   *
   * Flujo del test en cada tema: la del Oro fallada con «47», la de Z = 1 acertada y el resto
   * bien → nota 9/10. Medido el 25/09/2026 sobre el fondo computado (umbral 4,5 texto normal,
   * 3 texto grande; la nota del círculo es de 38,4 px y va al 3):
   *   claro  · «✗ Incorrecto» #dc2626 4,34 · «✓ ¡Correcto!» #16a34a 3,02 · «/10» 2,59 ·
   *            «Siguiente pregunta →» y «Jugar otra vez» (blanco sobre --primary) 4,11 · la
   *            nota «9» cumple (3,25 en su peor punto del degradado)
   *   oscuro · «Incorrecto» 2,67 · «¡Correcto!» 3,60 · la nota «9» 2,43 (ni el 3:1) · «/10»
   *            2,05 · los dos botones 2,79
   * DEBERÍA: todos por encima de su umbral en los dos temas.
   */
  test.fail('caso 15 · accesibilidad: veredicto, nota y botones del quiz llegan a su contraste', async ({ page }) => {
    test.setTimeout(90_000);
    const fallos: string[] = [];
    const anotar = async (tema: string, loc: Locator): Promise<void> => {
      const m = await contrasteDe(loc);
      if (m.ratio < m.umbral) fallos.push(`${tema} «${m.texto}» ${m.ratio} < ${m.umbral}`);
    };
    let rotulo = 'Empezar quiz';
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await empezarConBanco(page, rotulo, PRIMERAS_DIEZ);
      await pulsarOpcion(page, '47'); // Oro: fallo a propósito
      await page.mouse.move(0, 0);
      await anotar(tema, page.locator('[class*="feedbackResultado"]'));
      await anotar(tema, botonAvanzar(page));
      await botonAvanzar(page).click();
      await pulsarOpcion(page, 'Hidrógeno'); // Z = 1: acierto
      await anotar(tema, page.locator('[class*="feedbackResultado"]'));
      await botonAvanzar(page).click();
      for (let n = 3; n <= TOTAL_PREGUNTAS; n++) {
        await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
        await responderBienYAvanzar(page);
      }
      await page.mouse.move(0, 0);
      await anotar(tema, page.locator('[class*="puntuacionNumero"]'));
      await anotar(tema, page.locator('[class*="puntuacionTotal"]'));
      await anotar(tema, page.getByRole('button', { name: 'Jugar otra vez' }));
      rotulo = 'Jugar otra vez';
    }
    expect(fallos).toEqual([]);
  });
});

test.describe('Quiz Tabla Periódica · re-inspección 25/09/2026 (móvil 412 px)', () => {
  test.use({
    viewport: { width: 412, height: 915 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await abrirSinAviso(page);
  });

  /**
   * CASO 9 (táctil) — Dos toques seguidos no cuentan dos veces
   *
   * El mismo resuelto a mano que el caso 9 de escritorio: toque doble en «79» → «1 acierto»;
   * toque en «Helio» y en seguida en «Hidrógeno» → cuenta el fallo y nada más; el resto bien →
   * 9/10, 1 error, 90 %, «¡Experto en química!».
   */
  test('caso 9 (táctil) · dos toques seguidos cuentan una vez → 9/10, 90 %', async ({ page }) => {
    test.setTimeout(60_000);
    await empezarConBanco(page, 'Empezar quiz', PRIMERAS_DIEZ);
    const centro = async (i: number): Promise<{ x: number; y: number }> => {
      await opciones(page).nth(i).scrollIntoViewIfNeeded();
      const c = await opciones(page).nth(i).boundingBox();
      if (!c) throw new Error('opción sin caja');
      return { x: c.x + c.width / 2, y: c.y + c.height / 2 };
    };
    const t1 = (await opciones(page).allInnerTexts()).map(limpiar);
    const p79 = await centro(t1.indexOf('79'));
    await page.touchscreen.tap(p79.x, p79.y);
    await page.touchscreen.tap(p79.x, p79.y);
    await expect(contadorAciertos(page)).toHaveText('✓ 1 acierto');
    await botonAvanzar(page).tap();

    await expect(enunciado(page)).toHaveText('¿Qué elemento tiene número atómico 1?');
    const t2 = (await opciones(page).allInnerTexts()).map(limpiar);
    const pMala = await centro(t2.indexOf('Helio'));
    const pBuena = await centro(t2.indexOf('Hidrógeno'));
    await page.touchscreen.tap(pMala.x, pMala.y);
    await page.touchscreen.tap(pBuena.x, pBuena.y);
    await expect(page.locator('[class*="feedbackIncorrecto"]')).toBeVisible();
    await expect(contadorAciertos(page)).toHaveText('✓ 1 acierto');
    expect(limpiar(await page.locator('main button[class*="opcionIncorrecta"]').innerText())).toBe('Helio');
    await botonAvanzar(page).tap();

    for (let n = 3; n <= TOTAL_PREGUNTAS; n++) {
      await expect(page.getByText(`Pregunta ${n} de ${TOTAL_PREGUNTAS}`)).toBeVisible();
      await responderBienYAvanzar(page);
    }
    await expect(page.locator('[class*="puntuacionCirculo"]')).toHaveText('9/10');
    await expect(page.locator('[class*="statItem"]').nth(2)).toHaveText('90%Puntuación');
    await expect(page.locator('[class*="mensajeTexto"]')).toHaveText('¡Experto en química!');
  });

  /**
   * CASO 16 — HALLAZGO ABIERTO: tras «Siguiente pregunta» la pregunta nueva queda fuera de
   * la vista
   *
   * Al responder, el foco va a «Siguiente pregunta» y el navegador baja la página hasta él
   * (el feedback con la explicación lo empuja abajo). Al avanzar, el feedback se desmonta,
   * la pregunta nueva ocupa el sitio de la anterior y nadie devuelve la vista. Medido el
   * 25/09/2026 a 412 × 915 tras la del renio (la explicación más larga): enunciado de la
   * pregunta 2 en y = −205…−179, opción A en −155, y en pantalla solo asoma la D bajo el logo.
   * Con explicaciones cortas, a 360 px el enunciado queda en −136…−85; a 600 px, en −90…−65;
   * a 768 px, en −35…−9; y a 1.280 × 800 el círculo de la nota sale en −222…−112 al ver los
   * resultados.
   * DEBERÍA: tras avanzar, el enunciado nuevo se ve entero, por debajo del logo fijo.
   */
  test.fail('caso 16 · operativa: tras «Siguiente pregunta» el enunciado nuevo se ve bajo el logo', async ({ page }) => {
    await empezarConBanco(page, 'Empezar quiz', [POS_RENIO, ...PRIMERAS_DIEZ.slice(1)]);
    await pulsarOpcion(page, 'Renio');
    await botonAvanzar(page).tap();
    await expect(page.getByText(`Pregunta 2 de ${TOTAL_PREGUNTAS}`)).toBeAttached();
    await page.waitForTimeout(300); // que asiente el desplazamiento
    const vista = await page.evaluate(() => {
      const logo = document.querySelector('[class*="headerBar"]')?.firstElementChild?.getBoundingClientRect();
      const q = (document.querySelector('[class*="preguntaTexto"]') as Element).getBoundingClientRect();
      return { arriba: Math.round(q.top), abajo: Math.round(q.bottom), finLogo: Math.round(logo?.bottom ?? 0), alto: innerHeight };
    });
    expect(vista.arriba, `enunciado desde y = ${vista.arriba}; el logo acaba en ${vista.finLogo}`).toBeGreaterThanOrEqual(vista.finLogo);
    expect(vista.abajo).toBeLessThanOrEqual(vista.alto);
  });
});

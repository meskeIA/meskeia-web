import { test, expect, type Page, type Locator } from '@playwright/test';

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
  // OJO — dato DISPUTADO, ver hallazgo del acta del 26/08/2026: el CRC Handbook da
  // Renio 5.596 °C por encima de Wolframio 5.555 °C, y la propia explicación de la app cita
  // los 5.555 °C. Aquí se escribe lo que la app afirma HOY para que el test no dé un falso
  // rojo; si alguien lo corrige a «Renio», hay que corregir también esta línea.
  '¿Cuál es el elemento con mayor punto de ebullición?': 'Wolframio (Tungsteno)',
  '¿Qué elemento tiene mayor densidad de todos los sólidos?': 'Osmio', // Os = 22,59 g/cm³ (Ir 22,56)
  // ── Familias ──
  '¿Cuál de los siguientes NO es un Gas Noble?': 'Cloro (Cl)', // Cl es halógeno, grupo 17
  '¿Cuál de los siguientes es un Metaloide?': 'Silicio (Si)', // metaloides: B, Si, Ge, As, Sb, Te
  '¿Qué familia incluye al Flúor, Cloro, Bromo y Yodo?': 'Halógenos',
  '¿A qué familia pertenece el Hierro (Fe)?': 'Metales de transición', // grupos 3-12
  '¿Cuál de estos elementos es un metal alcalinotérreo?': 'Calcio (Ca)', // grupo 2: Be, Mg, Ca, Sr, Ba, Ra
  '¿Cuántos elementos forman el grupo de los Gases Nobles?': '6', // He, Ne, Ar, Kr, Xe, Rn
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
      await expect(contadorAciertos(page)).toContainText(`${CONTADOR_ESPERADO[n - 1]} aciertos`);

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

import { test, expect, type Page } from '@playwright/test';
import { ELEMENTOS, TOTAL_ELEMENTOS } from '../../data/elementos-quimicos';

/**
 * Quiz Símbolos Químicos — test de regresión del Inspector
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Quiz Símbolos Químicos» · hero «{TOTAL_ELEMENTOS} elementos · 3 dificultades ·
 * 2 modos de juego» · metadata y JSON-LD «3 dificultades, 2 modos, N elementos».
 * En un quiz la promesa incluye dos cosas que no se ven en el maquetado: que la
 * respuesta marcada como correcta lo sea DE VERDAD (símbolo, nombre en español y
 * número atómico de la IUPAC) y que el marcador cuente bien.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Los pares símbolo ↔ nombre ↔ Z se escriben aquí a mano desde
 *   es.wikipedia.org/wiki/Anexo:Elementos_químicos (tabla de la IUPAC, 118 filas) y NO se
 *   importan de `data/elementos-quimicos.ts`. Es deliberado: así el test contrasta la clave
 *   de respuestas de la app contra la química, no contra sí misma. Si el fichero de datos
 *   volviera a decir «Tántalo» o moviera un número atómico, esto tiene que fallar.
 * · Los tamaños de partida salen de DIFICULTAD_CONFIG de page.tsx: Fácil 10 preguntas
 *   (solo categoría 'comun'), Medio 15 ('comun'+'conocido'), Difícil 20 (las tres).
 * · Las medallas salen de calcularMedalla(): 100 % «¡Perfecto!», ≥80 «¡Excelente!»,
 *   ≥60 «¡Muy bien!», ≥40 «Bien», <40 «Sigue practicando».
 *
 * ALEATORIEDAD
 * ────────────
 * `generarPreguntas` baraja con Math.random y no hay semilla en la UI. En vez de fijar el
 * PRNG (que ata el test a cuántos números consume React al hidratar, y se rompe al subir de
 * versión), se juega con la tabla canónica en la mano: se lee el símbolo que sale y se pulsa
 * la respuesta que la IUPAC dice que es correcta. Lo que se comprueba son invariantes que
 * han de cumplirse en CUALQUIER tanda: 4 opciones distintas, la correcta entre ellas, ningún
 * elemento repetido y el marcador cuadrando pregunta a pregunta.
 *
 * HALLAZGOS 246-251, reparados el 24/08/2026 y verificados aquí:
 *   246 el bromo se presentaba como gas a temperatura ambiente · 247 «85 elementos» en siete
 *   sitios con 88 en el fichero · 248 curiosidad del uranio con tres afirmaciones falsas ·
 *   249 13 incumplimientos de accesibilidad · 250 el elemento 73 como «Tántalo» ·
 *   251 «electrodes» y «¡Cuántos conoces?».
 */

const RUTA = '/quiz-simbolos-quimicos/';

/**
 * Símbolo canónico de cada elemento, indexado por número atómico (Z=1 el primero).
 * Copiado de la tabla periódica de la IUPAC / Anexo:Elementos químicos de Wikipedia.
 */
const SIMBOLO_CANONICO = (
  'H He Li Be B C N O F Ne ' +
  'Na Mg Al Si P S Cl Ar K Ca ' +
  'Sc Ti V Cr Mn Fe Co Ni Cu Zn ' +
  'Ga Ge As Se Br Kr Rb Sr Y Zr ' +
  'Nb Mo Tc Ru Rh Pd Ag Cd In Sn ' +
  'Sb Te I Xe Cs Ba La Ce Pr Nd ' +
  'Pm Sm Eu Gd Tb Dy Ho Er Tm Yb ' +
  'Lu Hf Ta W Re Os Ir Pt Au Hg ' +
  'Tl Pb Bi Po At Rn Fr Ra Ac Th ' +
  'Pa U Np Pu'
).split(' ');

/** Z canónico de un símbolo (inverso de SIMBOLO_CANONICO). */
const Z_CANONICO: Record<string, number> = Object.fromEntries(
  SIMBOLO_CANONICO.map((s, i) => [s, i + 1])
);

/**
 * Los 26 elementos de categoría 'comun', que son los ÚNICOS que salen en el nivel Fácil.
 * Nombre en español según el DLE y la lista de Wikipedia; Z según la IUPAC.
 */
const COMUNES: Record<string, string> = {
  H: 'Hidrógeno', He: 'Helio', C: 'Carbono', N: 'Nitrógeno', O: 'Oxígeno',
  F: 'Flúor', Ne: 'Neón', Na: 'Sodio', Mg: 'Magnesio', Al: 'Aluminio',
  Si: 'Silicio', P: 'Fósforo', S: 'Azufre', Cl: 'Cloro', Ar: 'Argón',
  K: 'Potasio', Ca: 'Calcio', Fe: 'Hierro', Cu: 'Cobre', Zn: 'Zinc',
  Br: 'Bromo', Ag: 'Plata', I: 'Yodo', Au: 'Oro', Hg: 'Mercurio', Pb: 'Plomo',
};

/**
 * Nombres en español que el quiz ENSEÑA como respuesta correcta y que más fácilmente se
 * desvían de la forma normalizada. Escritos a mano desde el DLE / la lista de la IUPAC.
 * El 73 está aquí porque figuraba como «Tántalo», que es el personaje mitológico.
 */
const NOMBRES_DELICADOS: Record<number, string> = {
  11: 'Sodio', 19: 'Potasio', 26: 'Hierro', 29: 'Cobre', 30: 'Zinc', 36: 'Kriptón',
  39: 'Itrio', 40: 'Circonio', 47: 'Plata', 50: 'Estaño', 53: 'Yodo', 70: 'Iterbio',
  73: 'Tantalio', 74: 'Wolframio', 79: 'Oro', 80: 'Mercurio', 82: 'Plomo',
};

// ─── Utilidades de lectura de la pantalla ────────────────────────────────────

/** Texto de las 4 opciones de la pregunta visible, en orden. */
async function opcionesVisibles(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => b.querySelector('[class*="opcionLetra"]'))
      .map((b) => b.querySelector('[class*="opcionTexto"]')?.textContent ?? '')
  );
}

/** El feedback de la app, sin el route-announcer de Next (que también es role="alert"). */
function feedback(page: Page) {
  return page.locator('[class*="feedbackMensaje"]');
}

/** El símbolo (modo símbolo→nombre) o el nombre (modo inverso) que se pregunta ahora. */
function enunciado(page: Page) {
  return page.locator('[class*="elementoTexto"]');
}

/** Marcador vivo: «✅ n · 🔥 Racha: m», normalizado a una línea. */
async function marcador(page: Page): Promise<string> {
  const t = await page.locator('[class*="progresoInfo"]').innerText();
  return t.replace(/\s+/g, ' ').trim();
}

async function arrancarPartida(page: Page, modo: RegExp, dificultad: RegExp) {
  await page.getByRole('button', { name: modo }).click();
  await page.getByRole('button', { name: dificultad }).click();
  await page.getByRole('button', { name: '¡Empezar quiz!' }).click();
}

test.describe('Quiz Símbolos Químicos', () => {
  /**
   * CASO NORMAL — una partida entera de Fácil respondiendo lo que dice la IUPAC.
   *
   * Esperado (determinado ANTES de ejecutar la app):
   *   · 10 preguntas, todas de los 26 elementos comunes, sin repetir ninguno
   *   · cada símbolo con su Z canónico y su nombre entre las 4 opciones
   *   · tras la pregunta n: «✅ n · 🔥 Racha: n»
   *   · final: «Has acertado 10 de 10 (100%)», medalla «¡Perfecto!», racha máxima 10,
   *     0 errores y NINGUNA sección «Elementos a repasar»
   */
  test('caso normal: 10 respuestas correctas seguidas dan 10 de 10, racha 10 y medalla ¡Perfecto!', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);

    const preguntados: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const simbolo = (await enunciado(page).textContent())!.trim();
      preguntados.push(simbolo);

      const nombre = COMUNES[simbolo];
      expect(nombre, `Fácil solo puede preguntar elementos comunes; salió «${simbolo}»`).toBeTruthy();

      // El Z que la app enseña bajo el símbolo es el de la tabla periódica
      await expect(enunciado(page)).toHaveText(simbolo);
      await expect(page.locator('[class*="elementoZ"]')).toHaveText(`Z = ${Z_CANONICO[simbolo]}`);
      await expect(page.getByText(`Pregunta ${i} / 10`)).toBeVisible();

      const opciones = await opcionesVisibles(page);
      expect(opciones, `Q${i} (${simbolo}) debe ofrecer 4 opciones`).toHaveLength(4);
      expect(new Set(opciones).size, `Q${i} repite alguna opción: ${opciones.join(', ')}`).toBe(4);
      expect(opciones, `Q${i}: la correcta «${nombre}» no está entre las ofrecidas`).toContain(nombre);

      await page.getByRole('button', { name: nombre, exact: true }).click();

      await expect(feedback(page)).toContainText('¡Correcto!');
      await expect(feedback(page)).toContainText(`símbolo ${simbolo}`);
      await expect(feedback(page)).toContainText(`Z=${Z_CANONICO[simbolo]}`);
      // Acierto n → n aciertos y racha n (nunca se ha fallado)
      expect(await marcador(page)).toBe(`Pregunta ${i} / 10 ✅ ${i} · 🔥 Racha: ${i}`);

      // En la última pregunta el botón cambia de rótulo
      await expect(
        page.getByRole('button', { name: i < 10 ? 'Siguiente pregunta →' : 'Ver resultados' })
      ).toBeVisible();
      await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
    }

    // mezclar()+slice() reparte sin reposición: 10 elementos distintos de los 26 comunes
    expect(new Set(preguntados).size, `elemento repetido: ${preguntados.join(', ')}`).toBe(10);

    const fin = page.locator('[class*="finPanel"]');
    await expect(fin).toContainText('¡Perfecto!'); // 100 % en calcularMedalla()
    await expect(fin.getByText(/Has acertado/)).toContainText('10');
    await expect(fin.getByText(/Has acertado/)).toContainText('100%');
    // Aciertos 10 · Errores 0 · Racha máxima 10 · Precisión 100 %
    const stats = (await fin.locator('[class*="statsGrid"]').innerText()).replace(/\s+/g, ' ');
    expect(stats).toBe('10 Aciertos 0 Errores 10 Racha máxima 100% Precisión');
    await expect(fin).not.toContainText('Elementos a repasar');
  });

  /**
   * CASO LÍMITE — la misma partida fallándolo TODO, incluida la última pregunta.
   *
   * Esperado (determinado ANTES de ejecutar la app):
   *   · el marcador se queda en «✅ 0 · 🔥 Racha: 0» las diez veces
   *   · cada fallo enseña el nombre correcto y su símbolo, resalta la opción correcta,
   *     marca la elegida como mala y deshabilita las cuatro
   *   · en la pregunta 10 el botón dice «Ver resultados», no «Siguiente pregunta»
   *   · final: «Has acertado 0 de 10 (0%)», medalla «Sigue practicando», racha máxima 0
   *     y «Elementos a repasar (10)» con los diez elementos preguntados
   */
  test('caso límite: fallarlo todo deja 0 de 10, racha máxima 0 y los 10 elementos a repasar', async ({
    page,
  }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);

    const fallados: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const simbolo = (await enunciado(page).textContent())!.trim();
      const nombre = COMUNES[simbolo];
      fallados.push(nombre);

      const opciones = await opcionesVisibles(page);
      const mala = opciones.find((o) => o !== nombre)!;
      await page.getByRole('button', { name: mala, exact: true }).click();

      await expect(feedback(page)).toContainText('La respuesta correcta era:');
      await expect(feedback(page)).toContainText(nombre);
      await expect(feedback(page)).toContainText(`símbolo ${simbolo}`);
      // Un fallo no puntúa y corta la racha: el marcador NO se mueve en toda la partida
      expect(await marcador(page)).toBe(`Pregunta ${i} / 10 ✅ 0 · 🔥 Racha: 0`);

      await expect(page.getByRole('button', { name: nombre, exact: true })).toHaveClass(
        /opcion-correcta/
      );
      await expect(page.getByRole('button', { name: mala, exact: true })).toHaveClass(
        /seleccionada-mal/
      );
      for (const o of opciones) {
        await expect(page.getByRole('button', { name: o, exact: true })).toBeDisabled();
      }

      await expect(
        page.getByRole('button', { name: i < 10 ? 'Siguiente pregunta →' : 'Ver resultados' })
      ).toBeVisible();
      await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
    }

    const fin = page.locator('[class*="finPanel"]');
    await expect(fin).toContainText('Sigue practicando'); // <40 % en calcularMedalla()
    await expect(fin.getByText(/Has acertado/)).toContainText('0%');
    const stats = (await fin.locator('[class*="statsGrid"]').innerText()).replace(/\s+/g, ' ');
    expect(stats).toBe('0 Aciertos 10 Errores 0 Racha máxima 0% Precisión');
    await expect(page.getByText('Elementos a repasar (10)')).toBeVisible();
    for (const nombre of fallados) {
      await expect(page.locator('[class*="erroresGrid"]')).toContainText(nombre);
    }
  });

  /**
   * CASO DE INTEGRIDAD — el conjunto de datos y lo que la app afirma sobre él.
   *
   * Esperado (determinado ANTES de ejecutar la app):
   *   · 88 elementos (26 comunes + 29 conocidos + 33 avanzados), sin símbolos, nombres ni
   *     números atómicos repetidos, y cada Z con el símbolo que le da la IUPAC
   *   · la cifra del hero y la del JSON-LD salen de ELEMENTOS.length, nunca «85 elementos»
   *   · el elemento 73 se llama «Tantalio» (hallazgo 250)
   *   · una partida de Difícil (20 preguntas, pool de 88) cumple las mismas invariantes
   *   · el bloque educativo dice que el bromo es LÍQUIDO a temperatura ambiente (246)
   */
  test('caso de integridad: los 88 elementos son los de la tabla periódica y la app no promete otra cifra', async ({
    page,
  }) => {
    test.setTimeout(60_000); // incluye una partida entera de Difícil (20 preguntas)

    // ── 1. El fichero de datos, contra la tabla periódica ──────────────────────
    expect(ELEMENTOS).toHaveLength(88);
    expect(TOTAL_ELEMENTOS).toBe(ELEMENTOS.length); // la cifra se deriva, no se teclea
    const porCategoria = (c: string) => ELEMENTOS.filter((e) => e.categoria === c).length;
    expect(porCategoria('comun')).toBe(26); // el pool del nivel Fácil (10 preguntas)
    expect(porCategoria('conocido')).toBe(29); // Medio = comun + conocido = 55 ≥ 15
    expect(porCategoria('avanzado')).toBe(33); // Difícil = las tres = 88 ≥ 20

    expect(new Set(ELEMENTOS.map((e) => e.simbolo)).size, 'símbolo repetido').toBe(88);
    expect(new Set(ELEMENTOS.map((e) => e.nombre)).size, 'nombre repetido').toBe(88);
    expect(new Set(ELEMENTOS.map((e) => e.z)).size, 'número atómico repetido').toBe(88);

    for (const e of ELEMENTOS) {
      expect(e.simbolo, `Z=${e.z} (${e.nombre}) no lleva el símbolo de la IUPAC`).toBe(
        SIMBOLO_CANONICO[e.z - 1]
      );
      expect(e.simbolo, `${e.nombre}: símbolo mal formado`).toMatch(/^[A-Z][a-z]?$/);
    }
    for (const [z, nombre] of Object.entries(NOMBRES_DELICADOS)) {
      const el = ELEMENTOS.find((e) => e.z === Number(z));
      expect(el?.nombre, `el elemento ${z} debe llamarse «${nombre}»`).toBe(nombre);
    }
    // 250 · el 73 es «Tantalio»; «Tántalo» es el personaje mitológico del que sale el nombre
    expect(ELEMENTOS.find((e) => e.z === 73)).toMatchObject({ simbolo: 'Ta', nombre: 'Tantalio' });

    // ── 2. La cifra que la app promete, en pantalla y en el JSON-LD ───────────
    await page.goto(RUTA);
    await expect(page.locator('header')).toContainText(`${TOTAL_ELEMENTOS} elementos`);
    await expect(page.locator('header')).not.toContainText('85 elementos');

    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(ld).toContain(`${TOTAL_ELEMENTOS} elementos`);
    expect(ld).not.toContain('85 elementos'); // 247
    expect(ld).toContain('¿Cuántos conoces?'); // 251: abría con «¡» en el snippet
    expect(ld).not.toContain('¡Cuántos conoces?');

    // ── 3. Difícil: 20 preguntas sobre el pool completo, mismas invariantes ───
    await arrancarPartida(page, /Símbolo → Nombre/, /^Difícil/);
    const vistos: string[] = [];

    for (let i = 1; i <= 20; i++) {
      const simbolo = (await enunciado(page).textContent())!.trim();
      vistos.push(simbolo);
      expect(Z_CANONICO[simbolo], `«${simbolo}» no es un símbolo de la tabla periódica`).toBeDefined();
      await expect(page.locator('[class*="elementoZ"]')).toHaveText(`Z = ${Z_CANONICO[simbolo]}`);

      const opciones = await opcionesVisibles(page);
      expect(new Set(opciones).size, `D${i} repite opción: ${opciones.join(', ')}`).toBe(4);

      // El nombre que el fichero da a ese símbolo tiene que estar entre las 4 ofrecidas
      const correcta = ELEMENTOS.find((e) => e.simbolo === simbolo)!.nombre;
      expect(opciones, `D${i} (${simbolo}): falta la correcta «${correcta}»`).toContain(correcta);

      await page.getByRole('button', { name: correcta, exact: true }).click();
      await expect(feedback(page)).toContainText('¡Correcto!');
      await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
    }
    expect(new Set(vistos).size, `Difícil repitió elemento: ${vistos.join(', ')}`).toBe(20);
    // 20 aciertos de 20 respondiendo con la clave del propio fichero
    await expect(page.locator('[class*="finPanel"]')).toContainText('¡Perfecto!');

    // ── 4. Lo que el bloque educativo afirma de química ───────────────────────
    // EducationalSection arranca colapsada: hay que desplegarla para leer el contenido.
    // Su nombre accesible es el aria-label del componente, no el rótulo visible.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(
      page.getByRole('heading', { name: /6 errores típicos al estudiar la tabla periódica/ })
    ).toBeVisible();
    const texto = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

    // 246 · el bromo funde a −7,2 °C y hierve a 58,8 °C: a 25 °C es LÍQUIDO, no gas
    expect(texto).toContain('el bromo (Br) ni siquiera es un gas');
    expect(texto).not.toContain('H, N, O, F, Cl y Br también son gases');
    // 248 · el uranio no da nombre a ninguna escala geológica, y era «hidrargirio»
    expect(texto).not.toContain('da nombre a la escala geológica');
    expect(texto).not.toContain('hidrárgiro');
    // 251 · anglicismo en la curiosidad del wolframio
    expect(texto).toContain('electrodos de soldadura');
    expect(texto).not.toContain('electrodes');
  });
});

// ===========================================================================
// HALLAZGOS 283-287 — 2.ª pasada del Inspector, 24/08/2026 · REPARADOS el 24/08/2026
// ===========================================================================

test.describe('hallazgos 283-287, ya reparados', () => {
  /**
   * 283 — el botón «Siguiente pregunta», el que más se pulsa (10 o 20 veces por partida),
   * pintaba blanco de 16 px en negrita sobre `--primary` (#2E86AB): 4,11:1, por debajo del
   * 4,5:1 de WCAG AA, e idéntico en claro y en oscuro porque el módulo redefine `--primary`
   * en `.container` y su bloque [data-theme='dark'] no lo toca. Los botones de gradiente eran
   * peores en su mitad teal (2,80:1) y axe no los evalúa.
   *
   * El contraste se calcula aquí a mano, con la fórmula de WCAG sobre los colores computados:
   * así el test cubre también el gradiente, que es donde axe no llega.
   */
  const luminancia = (rgb: string): number => {
    const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3).map(Number).map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contraste = (a: string, b: string): number => {
    const [la, lb] = [luminancia(a), luminancia(b)];
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  test('283 · el botón de siguiente y el de empezar cumplen el 4,5:1 de WCAG AA', async ({ page }) => {
    await page.goto(RUTA);

    // (a) El botón de empezar: gradiente de los dos tonos de marca, ambos accesibles
    const iniciar = await page.locator('button', { hasText: '¡Empezar quiz!' }).first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, fondo: cs.backgroundImage };
    });
    const tonos = iniciar.fondo.match(/rgba?\([^)]+\)/g) ?? [];
    expect(tonos.length, 'el botón debería seguir siendo un gradiente de dos tonos').toBeGreaterThanOrEqual(2);
    for (const tono of tonos) {
      expect(
        contraste(iniciar.color, tono),
        `texto ${iniciar.color} sobre ${tono} no llega a 4,5:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }

    // (b) El botón de siguiente, que solo existe tras responder
    await page.locator('button', { hasText: '¡Empezar quiz!' }).first().click();
    await page.locator('[class*="opcionBtn"]').first().click();
    const siguiente = await page.locator('[class*="btnSiguiente"]').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, fondo: cs.backgroundColor };
    });
    expect(
      contraste(siguiente.color, siguiente.fondo),
      `texto ${siguiente.color} sobre ${siguiente.fondo} no llega a 4,5:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * 284 — la zona de progreso no decía QUÉ mide a quien no ve la pantalla. El div con
   * role="progressbar" no tenía nombre accesible (axe: aria-progressbar-name, serious), y el
   * marcador vivo anunciaba «10 · Racha: 10»: al envolver los emojis en aria-hidden —que es
   * la corrección correcta del hallazgo 249— el número de aciertos se quedó sin etiqueta,
   * porque el emoji era su único rótulo.
   */
  test('284 · la barra de progreso y el marcador dicen qué miden', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('button', { hasText: '¡Empezar quiz!' }).first().click();

    const barra = page.locator('[role="progressbar"]');
    await expect(barra).toHaveAttribute('aria-label', /pregunta/i);
    await expect(barra).toHaveAttribute('aria-valuetext', /de 10 preguntas/);

    const marcador = page.locator('[role="status"]').first();
    await expect(marcador).toHaveAttribute('aria-label', /Aciertos: \d+\. Racha: \d+\./);
    // Lo que se VE no cambia: los emojis siguen ahí y siguen ocultos al lector
    await expect(marcador.locator('[aria-hidden="true"]')).toHaveCount(2);
  });

  /**
   * 285 — las cuatro opciones llevaban aria-pressed, que es el atributo de un conmutador:
   * antes de contestar, un lector de pantalla anunciaba las cuatro como «botón de alternar,
   * no pulsado», y una vez elegida una ya no se podía despulsar porque las cuatro quedan
   * disabled. El CLAUDE.md §5 exime justamente a este patrón. El candado check:a11y-jsx no lo
   * veía porque su regla 3 solo salta cuando el botón no tiene NINGÚN aria-*.
   */
  test('285 · las opciones de respuesta no se anuncian como conmutadores', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('button', { hasText: '¡Empezar quiz!' }).first().click();

    const opciones = page.locator('[class*="opcionBtn"]');
    await expect(opciones).toHaveCount(4);
    expect(await page.locator('[class*="opcionBtn"][aria-pressed]').count()).toBe(0);
    // El grupo sí tiene nombre, que es lo que faltaba de verdad
    await expect(page.locator('[class*="opcionesGrid"]')).toHaveAttribute('role', 'group');

    // Y tras responder tampoco aparece: siguen siendo botones de acción, ya deshabilitados
    await opciones.first().click();
    expect(await page.locator('[class*="opcionBtn"][aria-pressed]').count()).toBe(0);
    await expect(opciones.first()).toBeDisabled();
  });

  /**
   * 286 — el FAQPage del JSON-LD describía mal el propio nivel Fácil: «elementos del primer y
   * segundo período». El nivel Fácil sortea sobre los 26 elementos de categoría 'comun', y
   * solo 7 son de los períodos 1 y 2 (H, He, C, N, O, F, Ne); los otros 19 llegan hasta el
   * plomo (Z=82), el mercurio (80) y el oro (79). Es la misma familia que el hallazgo 247:
   * una afirmación falsa sobre el contenido propio, publicada en datos estructurados, que es
   * lo que ChatGPT, Copilot y Perplexity usan para fundamentar respuestas.
   */
  test('286 · el FAQPage no promete un nivel Fácil que la app no tiene', async ({ page }) => {
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const textos: string[] = faq.mainEntity.map(
      (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
    );
    const nivel = textos.find((t) => t.includes('modo fácil'))!;
    expect(nivel).not.toContain('primer y segundo período');
    expect(nivel).toContain('26 elementos');
  });

  /**
   * 287 — la reparación del hallazgo 248 cambió el titular y el cuerpo de la cuarta
   * curiosidad (de uranio a mercurio) y dejó el icono de radiactividad encima de un texto
   * sobre el mercurio, que es tóxico pero no radiactivo. Además dejaba 2 de 6 tarjetas
   * dedicadas al mercurio, repitiendo las dos la misma etimología y la misma liquidez, y el
   * titular nuevo hablaba de un dios y un planeta que su cuerpo no mencionaba.
   */
  test('287 · las seis curiosidades no se repiten y cada titular lo sostiene su cuerpo', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const tarjetas = page.locator('[class*="tipCard"]');
    await expect(tarjetas).toHaveCount(6);

    const textos = await tarjetas.allTextContents();
    // Ni el icono de radiactividad ni dos tarjetas sobre el mismo elemento
    expect(textos.join(' ')).not.toContain('☢️');
    expect(textos.filter((t) => t.includes('mercurio')).length).toBe(1);
    expect(textos.filter((t) => t.includes('hydrargyrum')).length).toBe(1);

    // Y los dos titulares que no sostenía su cuerpo, corregidos
    const titulares = await tarjetas.locator('h3').allTextContents();
    expect(titulares).not.toContain('El helio y los globos');
    expect(titulares).not.toContain('El mercurio, con nombre de dios y de planeta');
    // La tarjeta nueva habla de lo que el quiz pregunta: símbolos que no siguen al nombre
    const simbolos = textos.find((t) => t.includes('natrium'))!;
    expect(simbolos).toContain('kalium');
    expect(simbolos).toContain('plumbum');
  });
});

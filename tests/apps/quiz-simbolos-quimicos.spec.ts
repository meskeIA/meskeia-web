import { test, expect, type Page, type Locator } from '@playwright/test';
import { ELEMENTOS, TOTAL_ELEMENTOS } from '../../data/elementos-quimicos';
import { esperarPaginaAsentada } from './_hidratacion';

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
 * · Las medallas salen de calcularMedalla(aciertos, total): todas «¡Perfecto!», ≥ 90 %
 *   «¡Excelente!», ≥ 70 % «¡Muy bien!», ≥ 50 % «Vas por buen camino», < 50 % «Sigue practicando»
 *   (hasta el 25/09/2026 eran 80/60/40 y el tercer escalón se rotulaba «Bien»: hallazgo 1815).
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
 * «Zinc» y «Kriptón» NO son errores (sospecha revisada el 25/09/2026): el acuerdo de la RAC, la
 * RAE, la RSEQ y la Fundéu de 2017 (An. Quím. 113, «Adiciones y correcciones») da preferencia a
 * «zinc» y a «kriptón» y registra «cinc» y «criptón» como variantes.
 */
const NOMBRES_DELICADOS: Record<number, string> = {
  11: 'Sodio', 19: 'Potasio', 26: 'Hierro', 29: 'Cobre', 30: 'Zinc', 36: 'Kriptón',
  39: 'Itrio', 40: 'Circonio', 47: 'Plata', 50: 'Estaño', 53: 'Yodo', 70: 'Iterbio',
  73: 'Tántalo', 74: 'Wolframio', 79: 'Oro', 80: 'Mercurio', 82: 'Plomo',
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
   *   · final: «Has acertado 10 de 10 (100 %)», medalla «¡Perfecto!», racha máxima 10,
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
    // El % va separado con espacio duro desde el 25/09/2026 (hallazgo 1816)
    expect(norm(await fin.getByText(/Has acertado/).innerText())).toBe('Has acertado 10 de 10 (100 %)');
    // Aciertos 10 · Errores 0 · Racha máxima 10 · Precisión 100 %
    const stats = (await fin.locator('[class*="statsGrid"]').innerText()).replace(/\s+/g, ' ');
    expect(stats).toBe('10 Aciertos 0 Errores 10 Racha máxima 100 % Precisión');
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
   *   · final: «Has acertado 0 de 10 (0 %)», medalla «Sigue practicando», racha máxima 0
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
    await expect(fin).toContainText('Sigue practicando'); // < 50 % en calcularMedalla()
    expect(norm(await fin.getByText(/Has acertado/).innerText())).toBe('Has acertado 0 de 10 (0 %)');
    const stats = (await fin.locator('[class*="statsGrid"]').innerText()).replace(/\s+/g, ' ');
    expect(stats).toBe('0 Aciertos 10 Errores 0 Racha máxima 0 % Precisión');
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
   *   · el elemento 73 se llama «Tántalo» (acuerdo RAC-RAE-RSEQ-Fundéu de 2017; el hallazgo 250
   *     lo cambió a «Tantalio» al revés, y este caso lo consagraba hasta el 26/09/2026)
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
    // El 73 es «Tántalo»: el acuerdo RAC-RAE-RSEQ-Fundéu de 2017 (An. Quím. 113, punto 6)
    // suprime «tantalio», y el DLE no lo recoge. El hallazgo 250 lo había cambiado al revés.
    expect(ELEMENTOS.find((e) => e.z === 73)).toMatchObject({ simbolo: 'Ta', nombre: 'Tántalo' });

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

// ===========================================================================
// Inspector 25/09/2026 — 3.ª pasada: re-inspección por la sospecha de la familia de quizzes
// (las formas del 1675-1677 de quiz-tabla-periodica, reparadas hoy en quiz-literatura-universal
// 81033bff y quiz-biologia-molecular 8526247c) y tres casos propios.
//
// Lo que la sospecha traía, medido en el navegador:
//   (a) foco a <body> tras «Siguiente» ............ CONFIRMADO → hallazgo (accesibilidad)
//   (b) pregunta bajo la barra tras «Siguiente» ... DESCARTADO a 360 × 740 (0 de 9 en Fácil y
//       0 de 19 en Difícil: el panel entero cabe). Lo que sí falla es «¡Empezar quiz!» → hallazgo
//   (c) «Bien» desde el 40 % ....................... CONFIRMADO → hallazgo (contenido)
//   (d) opciones sin barajar ....................... DESCARTADO: Fisher-Yates; 2.000 preguntas
//       medidas: A 500 · B 479 · C 522 · D 499 (χ² = 1,85, 3 g. l.). Queda de regresión.
//   (e) blanco sobre --primary en botones .......... DESCARTADO en botones (todos con
//       --primary-boton); sigue en `.stepNum`, que no es botón → dentro del hallazgo de contraste
// ===========================================================================

/** Símbolo de cada nombre del nivel Fácil: el inverso de COMUNES (IUPAC + nomenclatura RSEQ). */
const SIMBOLO_DE: Record<string, string> = Object.fromEntries(
  Object.entries(COMUNES).map(([simbolo, nombre]) => [nombre, simbolo]),
);

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim();

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

interface Jugada {
  nombre: string;
  simbolo: string;
  acierto: boolean;
}

/**
 * Juega una partida de Fácil entera siguiendo `patron` (true = pulsar la correcta según la tabla
 * de la IUPAC; false = pulsar la primera opción que NO lo es). `modo` dice qué enseña el enunciado:
 * 'simbolo' (Símbolo → Nombre) o 'nombre' (Nombre → Símbolo). Solo vale para Fácil, porque la
 * clave de respuestas escrita a mano (COMUNES) cubre los 26 elementos de ese nivel.
 */
async function jugarFacil(
  page: Page,
  modo: 'simbolo' | 'nombre',
  patron: boolean[],
  trasResponder?: (i: number, j: Jugada) => Promise<void>,
  /** Índice de la pregunta por la que va la partida (0 = empezarla desde la primera). */
  desde = 0,
): Promise<Jugada[]> {
  const jugadas: Jugada[] = [];
  for (let i = desde; i < patron.length; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} / ${patron.length}`)).toBeVisible();
    const visto = (await enunciado(page).textContent())!.trim();
    const simbolo = modo === 'simbolo' ? visto : SIMBOLO_DE[visto];
    const nombre = modo === 'simbolo' ? COMUNES[visto] : visto;
    expect(simbolo && nombre, `«${visto}» no es de los 26 elementos del nivel Fácil`).toBeTruthy();
    const correcta = modo === 'simbolo' ? nombre : simbolo;
    const opciones = await opcionesVisibles(page);
    expect(opciones, `P${i + 1} (${visto}): falta la correcta «${correcta}»`).toContain(correcta);
    const pulsar = patron[i] ? correcta : opciones.find((o) => o !== correcta)!;
    await page.getByRole('button', { name: pulsar, exact: true }).click();
    const jugada = { nombre, simbolo, acierto: patron[i] };
    jugadas.push(jugada);
    if (trasResponder) await trasResponder(i, jugada);
    await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
  }
  return jugadas;
}

/**
 * Contraste WCAG del texto de `loc` sobre su fondo EFECTIVO: compone los rgba de los ancestros
 * hasta el primer fondo opaco (los tintes al 5-7 % de esta app no se ven con un solo nivel).
 */
async function contrasteDe(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    const rgba = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lin = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (c: number[]): number => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      const a = c.length > 3 ? c[3] : 1;
      if (c.length >= 3 && a > 0) capas.push([c[0], c[1], c[2], a]);
      if (c.length >= 3 && a === 1) break;
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const [l1, l2] = [lum(rgba(getComputedStyle(el).color)), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

test.describe('Inspector 25/09/2026 · casos', () => {
  /**
   * CASO NORMAL — Nombre → Símbolo (los tests anteriores solo juegan Símbolo → Nombre), Fácil,
   * con el patrón ✓ ✓ ✗ ✓ ✓ ✓ ✓ ✗ ✓ ✗. La clave sale de la tabla de la IUPAC (símbolos) y de la
   * nomenclatura en español de la RSEQ (Recomendaciones IUPAC 2005, versión española): COMUNES.
   *
   * Esperado (a mano, ANTES de ejecutar):
   *   · aciertos acumulados 1 2 2 3 4 5 6 6 7 7 · racha 1 2 0 1 2 3 4 0 1 0
   *   · final: 7 aciertos, 3 errores, racha máxima 4 (P4-P7), 7/10 = 70 %
   *   · «Elementos a repasar (3)» con los símbolos y nombres de P3, P8 y P10, en ese orden
   * La medalla NO se afirma aquí: su rótulo es el hallazgo (c) de abajo.
   */
  test('caso normal · Nombre → Símbolo: 7 de 10 con dos rachas dan racha máxima 4 y 3 a repasar', async ({ page }) => {
    await abrir(page);
    await arrancarPartida(page, /Nombre → Símbolo/, /^Fácil/);
    const ACIERTOS = [1, 2, 2, 3, 4, 5, 6, 6, 7, 7];
    const RACHA = [1, 2, 0, 1, 2, 3, 4, 0, 1, 0];
    const jugadas = await jugarFacil(
      page,
      'nombre',
      [true, true, false, true, true, true, true, false, true, false],
      async (i, j) => {
        if (j.acierto) {
          await expect(feedback(page)).toContainText('¡Correcto!');
          await expect(feedback(page)).toContainText(`símbolo ${j.simbolo}`);
          expect(norm(await feedback(page).innerText())).toMatch(new RegExp(`· Z=${Z_CANONICO[j.simbolo]}$`));
        } else {
          await expect(feedback(page)).toContainText(`La respuesta correcta era: ${j.simbolo}`);
          await expect(feedback(page)).toContainText(`nombre: ${j.nombre}`);
        }
        expect(await marcador(page)).toBe(`Pregunta ${i + 1} / 10 ✅ ${ACIERTOS[i]} · 🔥 Racha: ${RACHA[i]}`);
      },
    );
    expect(new Set(jugadas.map((j) => j.simbolo)).size, 'Fácil repitió elemento').toBe(10);

    const fin = page.locator('[class*="finPanel"]');
    expect(norm(await fin.locator('[class*="finSubtitulo"]').innerText())).toMatch(/^Has acertado 7 de 10 \(70 ?%\)$/);
    expect(norm(await fin.locator('[class*="statsGrid"]').innerText())).toMatch(
      /^7 Aciertos 3 Errores 4 Racha máxima 70 ?% Precisión$/,
    );
    await expect(page.getByText('Elementos a repasar (3)')).toBeVisible();
    const fallos = jugadas.filter((j) => !j.acierto);
    expect(await page.locator('[class*="errorSimbolo"]').allTextContents()).toEqual(fallos.map((j) => j.simbolo));
    expect(await page.locator('[class*="errorNombre"]').allTextContents()).toEqual(fallos.map((j) => j.nombre));
  });

  /**
   * CASO LÍMITE — el nivel con menos elementos (Fácil, 26) y el corte exacto del 40 %: seis fallos
   * y cuatro aciertos AL FINAL, para que la racha máxima se alcance en la última pregunta (un
   * error de «uno de más / uno de menos» al cerrar la partida la dejaría en 3).
   *
   * Esperado (a mano): 4 aciertos, 6 errores, racha máxima 4 (P7-P10) y marcador final
   * «✅ 4 · 🔥 Racha: 4»; 4/10 = 40 %, justo el umbral de calcularMedalla(); «Elementos a
   * repasar (6)». La medalla, otra vez, es el hallazgo (c).
   */
  test('caso límite · Fácil 4 de 10 con la racha al final: racha máxima 4 y 40 % exacto', async ({ page }) => {
    await abrir(page);
    await arrancarPartida(page, /Nombre → Símbolo/, /^Fácil/);
    await jugarFacil(page, 'nombre', [false, false, false, false, false, false, true, true, true, true], async (i) => {
      if (i === 9) expect(await marcador(page)).toBe('Pregunta 10 / 10 ✅ 4 · 🔥 Racha: 4');
    });
    const fin = page.locator('[class*="finPanel"]');
    expect(norm(await fin.locator('[class*="finSubtitulo"]').innerText())).toMatch(/^Has acertado 4 de 10 \(40 ?%\)$/);
    expect(norm(await fin.locator('[class*="statsGrid"]').innerText())).toMatch(
      /^4 Aciertos 6 Errores 4 Racha máxima 40 ?% Precisión$/,
    );
    await expect(page.getByText('Elementos a repasar (6)')).toBeVisible();
  });

  /**
   * CASO QUE NO DEBE CONTAR — doble clic en la correcta, clic en otra opción ya respondida y
   * doble clic en «Siguiente».
   * Esperado (a mano): el doble clic puntúa UNA vez («✅ 1 · 🔥 Racha: 1»); la opción pulsada
   * después no cambia nada ni se marca como fallo; el doble clic en «Siguiente» avanza UNA
   * pregunta («Pregunta 2 / 10») y deja la nueva sin responder (sin aviso de corrección).
   */
  test('caso de rechazo · doble clic y respuestas repetidas no cuentan dos veces ni saltan preguntas', async ({ page }) => {
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    const simbolo = (await enunciado(page).textContent())!.trim();
    const nombre = COMUNES[simbolo];
    await page.getByRole('button', { name: nombre, exact: true }).dblclick();
    expect(await marcador(page)).toBe('Pregunta 1 / 10 ✅ 1 · 🔥 Racha: 1');

    const otra = page.locator('[class*="opcionBtn"]').filter({ hasNotText: nombre }).first();
    await otra.dispatchEvent('click'); // un botón disabled no recibe el clic: no debe pasar nada
    expect(await marcador(page)).toBe('Pregunta 1 / 10 ✅ 1 · 🔥 Racha: 1');
    await expect(otra).not.toHaveClass(/seleccionada-mal/);
    await expect(feedback(page)).toContainText('¡Correcto!');

    await page.getByRole('button', { name: 'Siguiente pregunta →' }).dblclick();
    await expect(page.getByText('Pregunta 2 / 10')).toBeVisible();
    expect(await marcador(page)).toBe('Pregunta 2 / 10 ✅ 1 · 🔥 Racha: 1');
    await expect(feedback(page)).toHaveCount(0);
  });

  /**
   * SOSPECHA (d), DESCARTADA — ¿se barajan las opciones? En quiz-biologia-molecular la correcta
   * caía en la C 19 de 30 veces. Aquí mezclar() es un Fisher-Yates correcto, y 2.000 preguntas
   * medidas dieron A 500 · B 479 · C 522 · D 499. Queda como regresión.
   *
   * Muestra: 6 partidas de Fácil = 60 preguntas, pulsando siempre la A y leyendo qué opción marca
   * la app como correcta. Con barajado uniforme, cada letra ~ Binomial(60; 0,25): media 15,
   * desviación 3,35. Umbral: ninguna letra por encima de 30 (la mitad). P(X ≥ 31) ≈ 4,6 σ, del
   * orden de 1e-5 por letra: no da falsos rojos. El sesgo de biología (63 % en una letra) daría
   * ~38 de 60 y lo pararía.
   */
  test('sospecha (d) · la correcta no se concentra en ninguna letra (60 preguntas, ≤ 30 por letra)', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    const porLetra = [0, 0, 0, 0];
    for (let partida = 0; partida < 6; partida++) {
      for (let n = 1; n <= 10; n++) {
        await page.locator('[class*="opcionBtn"]').first().click();
        const pos = await page
          .locator('[class*="opcionBtn"]')
          .evaluateAll((bs) => bs.findIndex((b) => /opcion-correcta/.test(b.className)));
        expect(pos, 'la app no marcó ninguna opción como correcta').toBeGreaterThanOrEqual(0);
        porLetra[pos]++;
        await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
      }
      if (partida < 5) await page.getByRole('button', { name: /Repetir quiz/ }).click();
    }
    expect(porLetra.reduce((a, b) => a + b, 0)).toBe(60);
    expect(Math.max(...porLetra), `A B C D = ${porLetra.join(' ')}`).toBeLessThanOrEqual(30);
  });
});

test.describe('Inspector 25/09/2026 · hallazgos', () => {
  /**
   * HALLAZGO medio (Inspector 25/09/2026) · accesibilidad — sospecha (a), la forma del 1676.
   * Con teclado: al pulsar «Siguiente pregunta →» el bloque de feedback se desmonta y el foco
   * cae a <body>; el primer Tab va a «Ver Guía Completa», FUERA del quiz, y hacen falta 4
   * Shift+Tab para volver a la opción A. En cada transición (9 en Fácil, 19 en Difícil).
   * También al responder (la opción queda disabled → <body>) y en «Ver resultados» (<body>,
   * el resultado no se anuncia). Medido el 25/09/2026.
   * DEBERÍA: tras avanzar, el foco está dentro del quiz y el primer Tab cae en una opción nueva.
   */
  test('hallazgo (a) · tras «Siguiente» con teclado el foco no cae a <body> y el Tab vuelve a las opciones', async ({ page }) => {
    // Hallazgo 1812, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    // Texto del BOTÓN con foco; '' si el foco no está en un botón (el <body> contiene todo el texto)
    const activoTexto = (): Promise<string> =>
      page.evaluate(() => (document.activeElement?.tagName === 'BUTTON' ? document.activeElement.textContent ?? '' : ''));
    const enOpcion = (): Promise<boolean> =>
      page.evaluate(() => {
        const a = document.activeElement;
        return a?.tagName === 'BUTTON' && !!a.querySelector('[class*="opcionLetra"]');
      });
    for (let t = 0; t < 60 && !/Empezar quiz/.test(await activoTexto()); t++) await page.keyboard.press('Tab');
    expect(await activoTexto()).toMatch(/Empezar quiz/);
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    for (let t = 0; t < 10 && !(await enOpcion()); t++) await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(feedback(page)).toBeVisible();
    // Al responder, la opción queda disabled: el foco tiene que ir SOLO a «Siguiente», sin Tab
    await expect.poll(activoTexto).toMatch(/Siguiente pregunta/);
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 / 10')).toBeVisible();

    expect(await page.evaluate(() => document.activeElement === document.body), 'el foco cayó a <body>').toBe(false);
    await page.keyboard.press('Tab');
    expect(await enOpcion(), `el primer Tab fue a «${norm(await activoTexto())}»`).toBe(true);

    // Y al acabar, el foco va al resultado (dentro de finPanel), no al <body>
    await jugarFacil(page, 'simbolo', Array(10).fill(true), undefined, 1);
    await expect(page.locator('[class*="finPanel"]')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest('[class*="finPanel"]')))
      .toBe(true);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — sospecha (c). calcularMedalla() rotula
   * «Bien» 🥉 desde el 40 % y «¡Muy bien!» desde el 60 %. «Bien» es el nombre de una nota de la
   * escala escolar española (LOMLOE: Insuficiente 1-4, Suficiente 5, Bien 6, Notable 7-8,
   * Sobresaliente 9-10), y aquí se le da a un 4 y a un 5. Con 4 opciones el azar ya acierta el
   * 25 %: P(≥ 4 de 10 | p = 1/4) = 1 − 0,7759 = 22,4 %, así que una de cada cuatro o cinco
   * partidas a ciegas sale con medalla y «Bien» (medido: pulsando siempre la A, 2 de 20 partidas
   * dieron 4/10). El bloque educativo no dice nada de la escala. Mismo defecto que el «Aprobado»
   * al 40 % de quiz-biologia-molecular, reparado hoy.
   * Caso: Fácil, 4 aciertos + 6 fallos → 40 % → hasta el 25/09/2026, «Bien». REPARADO (1815): un 4
   * de 10 ya no es «Bien».
   */
  test('hallazgo (c) · 4 de 10 (40 %) no se presenta como «Bien»', async ({ page }) => {
    // Hallazgo 1815, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    await jugarFacil(page, 'simbolo', [true, true, true, true, false, false, false, false, false, false]);
    const fin = page.locator('[class*="finPanel"]');
    expect(norm(await fin.locator('[class*="finSubtitulo"]').innerText())).toMatch(/\(40 ?%\)/);
    expect(norm(await fin.locator('[class*="finTitulo"]').innerText())).not.toBe('Bien');
    // Reparación: el primer escalón pide la mitad de aciertos; 4 de 10 no lleva medalla
    expect(norm(await fin.locator('[class*="finTitulo"]').innerText())).toBe('Sigue practicando');
    // Y la escala se dice en la pantalla, para que el rótulo se pueda juzgar
    await expect(fin.locator('[class*="escalaNota"]')).toContainText('bronce desde la mitad de aciertos');
  });

  /**
   * Los cortes nuevos de la medalla (hallazgo 1815), en su frontera exacta: 5 de 10 es el primer
   * escalón (bronce, «Vas por buen camino»), 7 de 10 plata y 9 de 10 oro.
   */
  test('hallazgo 1815 · los cortes de la medalla: 5, 7 y 9 de 10', async ({ page }) => {
    test.setTimeout(60_000);
    const casos: [number, string][] = [
      [5, 'Vas por buen camino'],
      [7, '¡Muy bien!'],
      [9, '¡Excelente!'],
    ];
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    for (const [n, rotulo] of casos) {
      const patron = Array.from({ length: 10 }, (_, i) => i < n);
      await jugarFacil(page, 'simbolo', patron);
      const fin = page.locator('[class*="finPanel"]');
      expect(norm(await fin.locator('[class*="finTitulo"]').innerText()), `${n} de 10`).toBe(rotulo);
      await page.getByRole('button', { name: /Repetir quiz/ }).click();
    }
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — formato español (CLAUDE.md global §2,
   * desde el 25/09/2026): el % va separado de la cifra con espacio duro. Pegado en
   * «Has acertado N de 10 (N%)» (page.tsx:317), en la tarjeta «Precisión» (page.tsx:334) y en
   * la FAQ de la corteza terrestre («~46%», «~28%», «~8%», «~5%», «~4%», page.tsx:474).
   * Además, «3.422 °C» (page.tsx:545) agrupa un número de cuatro cifras, que la RAE no agrupa.
   */
  test('hallazgo · el % va separado de la cifra con espacio duro', async ({ page }) => {
    // Hallazgo 1816, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    await jugarFacil(page, 'simbolo', [true, true, true, true, true, false, false, false, false, false]);
    const fin = page.locator('[class*="finPanel"]');
    expect(await fin.locator('[class*="finSubtitulo"]').textContent()).toContain('(50 %)');
    expect(await fin.locator('[class*="statValor"]').last().textContent()).toBe('50 %');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = (await page.locator('[class*="faqGrid"]').textContent()) ?? '';
    expect(guia).toContain('46 %');
    expect(guia).not.toMatch(/\d%/);
    expect(await page.locator('[class*="tipsGrid"]').textContent()).not.toContain('3.422');
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) · accesibilidad — contraste por debajo de 4,5:1 en
   * texto normal (WCAG 1.4.3), medido sobre el fondo efectivo el 25/09/2026. Los BOTONES con
   * blanco sobre marca ya están bien (sospecha (e) descartada en ellos); falla lo demás:
   *   · `.stepNum` (los números 1-6 de la guía): blanco sobre --primary, 13,6 px → 4,11:1 en los
   *     dos temas (existe --primary-boton, 5,47:1)
   *   · `.errorSimbolo` (los símbolos de «Elementos a repasar», lo que el alumno tiene que
   *     estudiar): #ef4444 sobre su tinte, 16 px → 3,44:1 en claro
   *   · `.warningBox h2`: #dc2626 sobre su tinte, 17,6 px negrita (no llega a texto grande,
   *     18,66 px) → 4,16:1 en claro
   *   · «Cambiar configuración» al pasar el ratón: --primary como texto → 4,11:1 en claro y
   *     3,50:1 en oscuro
   */
  test('hallazgo · todo el texto de la app llega a 4,5:1 en claro y en oscuro', async ({ page }) => {
    // Hallazgo 1814, reparado el 25/09/2026: sin test.fail().
    test.setTimeout(60_000);
    const medidas: Record<string, number> = {};
    for (const tema of ['claro', 'oscuro'] as const) {
      await abrir(page);
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      // globals.css anima color y fondo 0,3 s al cambiar de tema, y la guía se despliega en 0,3 s:
      // medir antes daría un color a medio camino (se vio 2,22:1 en un título que asentado da 4,57)
      await page.waitForTimeout(800);
      medidas[`${tema} · número de paso`] = await contrasteDe(page.locator('[class*="stepNum"]').first());
      medidas[`${tema} · título de errores típicos`] = await contrasteDe(page.locator('[class*="warningBox"] h2'));
      await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
      await jugarFacil(page, 'simbolo', [false, true, true, true, true, true, true, true, true, true]);
      medidas[`${tema} · símbolo a repasar`] = await contrasteDe(page.locator('[class*="errorSimbolo"]').first());
      const secundario = page.locator('[class*="btnSecundario"]');
      await secundario.hover();
      await page.waitForTimeout(500); // transition: all 0.2s
      medidas[`${tema} · «Cambiar configuración» con el ratón encima`] = await contrasteDe(secundario);
      await page.mouse.move(0, 0);
    }
    const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5);
    expect(bajos, JSON.stringify(medidas)).toEqual([]);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · accesibilidad — la barra de progreso se rotula
   * «Preguntas respondidas» (hallazgo 284) pero cuenta el ÍNDICE: tras responder la 1.ª dice
   * «0 de 10 preguntas respondidas» y tras responder la 10.ª, «9 de 10»; nunca llega a 10.
   */
  test('hallazgo · tras responder la primera, la barra dice «1 de 10 preguntas respondidas»', async ({ page }) => {
    // Hallazgo 1820, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    await page.locator('[class*="opcionBtn"]').first().click();
    await expect(feedback(page)).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute(
      'aria-valuetext',
      '1 de 10 preguntas respondidas',
      { timeout: 2000 },
    );
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) · contenido — el error típico n.º 3 enseña al revés la
   * regla que quiere enseñar: «CO (con mayúscula y minúscula) es la fórmula del monóxido de
   * carbono». CO son DOS mayúsculas (C y O); mayúscula + minúscula es Co, el cobalto. Fuente:
   * IUPAC, Nomenclatura de Química Inorgánica 2005 (IR-3.1: la primera letra del símbolo va en
   * mayúscula y la segunda, si la hay, en minúscula).
   */
  test('hallazgo · el error típico 3 no dice que CO lleva mayúscula y minúscula', async ({ page }) => {
    // Hallazgo 1817, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const avisos = norm((await page.locator('[class*="warningGrid"]').textContent()) ?? '');
    expect(avisos).toContain('monóxido de carbono');
    expect(avisos).not.toContain('CO (con mayúscula y minúscula)');
    expect(avisos).toContain('CO (dos mayúsculas');
    expect(avisos).toContain('Co (mayúscula y minúscula) es el símbolo del cobalto');
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · dato — el FAQPage (lo que leen ChatGPT, Copilot y
   * Perplexity) dice que los elementos 95-118 «tienen vidas medias muy cortas». No los del
   * principio de ese tramo: curio-247, 1,56·10⁷ años; californio-251, ≈ 900 años (NUBASE2020,
   * Kondev et al., Chinese Physics C 45, 030001, 2021).
   */
  test('hallazgo · el FAQPage no atribuye vidas medias muy cortas a todos los elementos 95-118', async ({ page }) => {
    // Hallazgo 1818, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const textos: string[] = faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text);
    const cuantos = textos.find((t) => t.includes('118 elementos'))!;
    expect(cuantos).not.toContain('tienen vidas medias muy cortas');
    // curio-247: T½ = 1,56·10⁷ años (NUBASE2020; NNDC/ENSDF)
    expect(cuantos).toContain('curio-247, unos 15,6 millones de años');
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — dos afirmaciones del bloque educativo:
   *   · «Diez elementos llevan la inicial de su nombre en latín, no en español»: es la cuenta de
   *     los símbolos que no casan con el nombre INGLÉS. En español hay más, y dos en el propio
   *     nivel Fácil: azufre S (lat. sulfur) y fósforo P (lat. phosphorus). Y «Son los que más se
   *     fallan en este quiz» no lo sostiene ningún dato: la app no registra fallos.
   *   · «científicos (Curio, Einsteinio)»: el elemento 99 es «einstenio» (DLE; IUPAC 2005,
   *     versión española de la RSEQ), y los nombres de elemento van en minúscula.
   */
  test('hallazgo · la guía no cuenta «diez» símbolos latinos ni escribe «Einsteinio»', async ({ page }) => {
    // Hallazgo 1819, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = norm((await page.locator('[class*="guideSection"]').allTextContents()).join(' '));
    expect(texto.length, 'la guía no se desplegó').toBeGreaterThan(1000);
    expect(texto).not.toContain('Diez elementos llevan la inicial de su nombre en latín');
    expect(texto).not.toContain('Einsteinio');
    expect(texto).not.toContain('Son los que más se fallan');
    expect(texto).toContain('científicos (curio, einstenio)');
    expect(texto).toContain('S de sulfur y P de phosphorus');
  });
});

/**
 * Móvil de 360 × 740 (el tamaño de la sospecha (b)). El «dedo» se modela como en
 * quiz-biologia-molecular: baja o sube LO JUSTO para ver lo que va a tocar, y toca.
 */
test.describe('Inspector 25/09/2026 · móvil 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const tocar = async (page: Page, loc: Locator): Promise<void> => {
    const b = await loc.boundingBox();
    if (!b) throw new Error('el elemento no tiene caja');
    // En el centro, no a 20 px del borde izquierdo: bajo `next dev`, el indicador «N» de Next
    // (abajo a la izquierda) tapa ese borde del botón cuando queda al pie de la pantalla, y el
    // toque abría su menú en vez de empezar el quiz (visto el 25/09/2026).
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  };
  const bajarHasta = (page: Page, sel: string): Promise<void> =>
    page.evaluate((s) => {
      const r = document.querySelector(s)!.getBoundingClientRect();
      if (r.bottom > innerHeight - 10) scrollBy(0, r.bottom - innerHeight + 10);
    }, sel);
  /** Cajas del rótulo y del símbolo preguntado, y hasta dónde llega la barra fija del logo. */
  const vista = (page: Page) =>
    page.evaluate(() => {
      const caja = (s: string) => {
        const r = document.querySelector(s)!.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
      };
      const barra = document.querySelector('[class*="headerBar"]');
      const fondoBarra = barra ? Math.max(0, ...[...barra.children].map((c) => c.getBoundingClientRect().bottom)) : 0;
      return {
        fondoBarra: Math.round(fondoBarra),
        alto: innerHeight,
        rotulo: caja('[class*="preguntaLabel"]'),
        simbolo: caja('[class*="elementoTexto"]'),
      };
    });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) · operativa — el botón «¡Empezar quiz!» está al final
   * de un panel de configuración largo; al tocarlo, el panel se sustituye por el quiz y la vista
   * NO se mueve: la primera pregunta sale por encima del borde. Medido el 25/09/2026 bajando lo
   * justo para ver el botón: rótulo «¿Cuál es el nombre de este elemento?» en y = −73…−22 y el
   * símbolo en y = −6…39 (cortado, en la franja de la barra del logo, que llega a y = 52); se
   * ven las cuatro respuestas sin lo que se pregunta. A 360 × 640 el símbolo queda entero fuera
   * (y = −106…−61), y al pulsar «Ver resultados» el título de la medalla sale en y = −2…81.
   * DEBERÍA: tras «¡Empezar quiz!» el rótulo y el símbolo se ven enteros bajo la barra.
   */
  test('hallazgo · tras «¡Empezar quiz!» la primera pregunta se ve entera bajo la barra fija', async ({ page }) => {
    // Hallazgo 1813, reparado el 25/09/2026: sin test.fail().
    await abrir(page);
    await bajarHasta(page, '[class*="btnIniciar"]');
    await tocar(page, page.getByRole('button', { name: '¡Empezar quiz!' }));
    await expect(page.getByText('Pregunta 1 / 10')).toBeAttached();
    await page.waitForTimeout(300);
    const v = await vista(page);
    expect(v.rotulo.top, JSON.stringify(v)).toBeGreaterThanOrEqual(v.fondoBarra);
    expect(v.simbolo.top, JSON.stringify(v)).toBeGreaterThanOrEqual(v.fondoBarra);
    expect(v.simbolo.bottom, JSON.stringify(v)).toBeLessThanOrEqual(v.alto);
  });

  /**
   * SOSPECHA (b), DESCARTADA a 360 × 740 — tras «Siguiente» la pregunta nueva NO queda bajo la
   * barra: el panel entero (rótulo → «Siguiente») cabe en 740 px, así que quien subió una vez a
   * leer la pregunta ya no tiene que desplazarse. Medido el 25/09/2026: 0 de 9 transiciones en
   * Fácil y 0 de 19 en Difícil. Queda como regresión.
   * OJO (Inspector 27/09/2026): esa medida tocaba la opción A, que casi siempre ACIERTA o cae arriba.
   * Fallando con la opción más baja y anulando el scrollIntoView de la reparación del 1813 (es
   * decir, la app de antes), a 360 × 640 el enunciado quedaba fuera en 9 de 9 transiciones. Lo
   * cubre ahora el caso «fallando cada pregunta» de más abajo.
   */
  test('sospecha (b) · tras cada «Siguiente» el símbolo nuevo se ve entero bajo la barra', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await bajarHasta(page, '[class*="btnIniciar"]');
    await tocar(page, page.getByRole('button', { name: '¡Empezar quiz!' }));
    await expect(page.getByText('Pregunta 1 / 10')).toBeAttached();
    // El usuario sube lo justo para leer el rótulo bajo el logo (y = 70)
    await page.evaluate(() => {
      const r = document.querySelector('[class*="preguntaLabel"]')!.getBoundingClientRect();
      if (r.top < 70) scrollBy(0, r.top - 70);
    });
    const tapadas: string[] = [];
    for (let n = 1; n <= 9; n++) {
      await page.evaluate(() => {
        const bs = document.querySelectorAll('[class*="opcionBtn"]');
        const r = bs[3].getBoundingClientRect();
        if (r.bottom > innerHeight) scrollBy(0, r.bottom - innerHeight + 10);
      });
      await tocar(page, page.locator('[class*="opcionBtn"]').first());
      await bajarHasta(page, '[class*="btnSiguiente"]');
      await tocar(page, page.getByRole('button', { name: 'Siguiente pregunta →' }));
      await expect(page.getByText(`Pregunta ${n + 1} / 10`)).toBeAttached();
      await page.waitForTimeout(150);
      const v = await vista(page);
      if (v.simbolo.top < v.fondoBarra || v.simbolo.bottom > v.alto) tapadas.push(`P${n + 1}: ${JSON.stringify(v.simbolo)}`);
    }
    expect(tapadas).toEqual([]);
  });

  /**
   * Inspector 27/09/2026 — la reparación del 1813, medida FALLANDO. En quiz-paises-capitales el acta
   * dio el defecto por ausente porque midió acertando con la A; fallando, el aviso de corrección es
   * más largo y la opción pulsada está abajo, así que el dedo baja más.
   * Flujo: Fácil, Símbolo → Nombre; en cada pregunta se toca la opción INCORRECTA más baja (la D, o
   * la C si la D es la correcta), bajando lo justo para verla; luego se baja lo justo hasta
   * «Siguiente» y se toca.
   * Esperado (27/09/2026): tras cada «Siguiente», el rótulo y el símbolo nuevos enteros entre el
   * fondo de la barra del logo y el borde inferior, a 740 y a 640 px de alto; y al «Ver resultados»,
   * el título de la medalla («Sigue practicando», 0 de 10) igual. Medido: 0 de 9 y 0 de 9 (y 0 de
   * 19 en Difícil). Sin la reparación (scrollIntoView anulado) a 640 px: 9 de 9 tapadas.
   */
  test('1813 · fallando cada pregunta con la opción más baja, tras «Siguiente» el enunciado se ve entero', async ({ page }) => {
    test.setTimeout(90_000);
    for (const alto of [740, 640]) {
      await page.setViewportSize({ width: 360, height: alto });
      await abrir(page);
      await bajarHasta(page, '[class*="btnIniciar"]');
      await tocar(page, page.getByRole('button', { name: '¡Empezar quiz!' }));
      await expect(page.getByText('Pregunta 1 / 10')).toBeAttached();
      const tapadas: string[] = [];
      for (let n = 1; n <= 10; n++) {
        const simbolo = (await enunciado(page).textContent())!.trim();
        const nombre = COMUNES[simbolo];
        expect(nombre, `«${simbolo}» no es de los 26 elementos del nivel Fácil`).toBeTruthy();
        const textos = await opcionesVisibles(page);
        const k = textos[3] === nombre ? 2 : 3; // la incorrecta más baja
        const opcion = page.locator('[class*="opcionBtn"]').nth(k);
        await opcion.evaluate((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom > innerHeight - 10) scrollBy(0, r.bottom - innerHeight + 10);
        });
        await tocar(page, opcion);
        await expect(feedback(page)).toContainText(`La respuesta correcta era: ${nombre}`);
        await bajarHasta(page, '[class*="btnSiguiente"]');
        await tocar(page, page.locator('[class*="btnSiguiente"]'));
        if (n === 10) break;
        await expect(page.getByText(`Pregunta ${n + 1} / 10`)).toBeAttached();
        await page.waitForTimeout(150);
        const v = await vista(page);
        if (v.rotulo.top < v.fondoBarra || v.simbolo.top < v.fondoBarra || v.simbolo.bottom > v.alto) {
          tapadas.push(`P${n + 1}: ${JSON.stringify(v)}`);
        }
      }
      expect(tapadas, `360 × ${alto}`).toEqual([]);

      const titulo = page.locator('[class*="finTitulo"]');
      await expect(titulo).toHaveText('Sigue practicando'); // 0 de 10 < la mitad
      await page.waitForTimeout(150);
      const caja = await titulo.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const barra = document.querySelector('[class*="headerBar"]');
        const fondo = barra ? Math.max(0, ...[...barra.children].map((c) => c.getBoundingClientRect().bottom)) : 0;
        return { top: r.top, bottom: r.bottom, fondo, alto: innerHeight };
      });
      expect(caja.top, `360 × ${alto}: ${JSON.stringify(caja)}`).toBeGreaterThanOrEqual(caja.fondo);
      expect(caja.bottom, `360 × ${alto}: ${JSON.stringify(caja)}`).toBeLessThanOrEqual(caja.alto);
    }
  });
});

// ===========================================================================
// Inspector 27/09/2026 — 4.ª pasada. Verificadas en el navegador las reparaciones del 25/09
// (1812-1820): aguantan. Sospecha S1 (el marcador role="status" con el texto en un aria-label):
// DESCARTADA como defecto, ver su caso. Tres casos propios sobre Medio (15 preguntas) y Difícil
// (20), que ningún caso anterior puntuaba, y dos hallazgos de contenido nuevos.
// ===========================================================================

/**
 * Clave de respuestas para Medio y Difícil en el modo Nombre → Símbolo. El nombre sale del fichero
 * de datos (cotejado el 27/09/2026 con el acuerdo RAC-RAE-RSEQ-Fundéu, An. Quím. 2017: circonio,
 * yodo, tántalo, wolframio, zinc y kriptón son las formas preferidas), pero el SÍMBOLO que se pulsa
 * sale de la tabla de la IUPAC escrita a mano arriba (SIMBOLO_CANONICO), por número atómico.
 */
function simboloIupacDe(nombre: string): string {
  const el = ELEMENTOS.find((e) => e.nombre === nombre);
  expect(el, `«${nombre}» no es un nombre del banco`).toBeTruthy();
  return SIMBOLO_CANONICO[el!.z - 1];
}

/** Las cuatro opciones de la pregunta visible, como botones (el grupo acota a ellas). */
function botonOpcion(page: Page, texto: string): Locator {
  return page.getByRole('group', { name: 'Opciones de respuesta' }).getByRole('button', { name: texto, exact: true });
}

/**
 * Juega `patron` en Nombre → Símbolo, en cualquier nivel (true = el símbolo de la IUPAC; false = la
 * primera opción que no lo es). Devuelve los símbolos preguntados, en orden.
 */
async function jugarNombreSimbolo(
  page: Page,
  patron: boolean[],
  trasResponder?: (i: number, simbolo: string, acierto: boolean) => Promise<void>,
): Promise<string[]> {
  const vistos: string[] = [];
  for (let i = 0; i < patron.length; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} / ${patron.length}`)).toBeVisible();
    const nombre = (await enunciado(page).textContent())!.trim();
    const simbolo = simboloIupacDe(nombre);
    vistos.push(simbolo);
    const opciones = await opcionesVisibles(page);
    expect(opciones, `P${i + 1} (${nombre}): falta «${simbolo}»`).toContain(simbolo);
    await botonOpcion(page, patron[i] ? simbolo : opciones.find((o) => o !== simbolo)!).click();
    if (trasResponder) await trasResponder(i, simbolo, patron[i]);
    await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
  }
  return vistos;
}

/** Texto que llega a la capa de accesibilidad: el del nodo sin lo que lleva aria-hidden. */
function textoAccesible(loc: Locator): Promise<string> {
  return loc.evaluate((el) => {
    const copia = el.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    return (copia.textContent ?? '').replace(/\s+/g, ' ').trim();
  });
}

test.describe('Inspector 27/09/2026 · casos', () => {
  /**
   * CASO NORMAL — Medio (15 preguntas, 'comun' + 'conocido'), Nombre → Símbolo, fallando la 5.ª y
   * la 12.ª. Resuelto a mano ANTES de ejecutar:
   *   · aciertos 1 2 3 4 4 5 6 7 8 9 10 10 11 12 13 · racha 1 2 3 4 0 1 2 3 4 5 6 0 1 2 3
   *   · tras responder la n.ª, la barra dice «n de 15 preguntas respondidas» (1820) y en la 15.ª el
   *     botón es «Ver resultados»
   *   · final: 13 de 15 = 86,67 % → formatPercentage(…, 0) = «87 %» con espacio duro (1816);
   *     racha máxima 6 (P6-P11); calcularMedalla: 13·10 = 130 < 15·9 = 135 → NO oro; 130 ≥ 15·7 =
   *     105 → plata, «¡Muy bien!» (1815). Es justo el caso que su comentario cita: redondeado,
   *     87 % no es 90 %, pero comparar el porcentaje redondeado con 0,9 tampoco debe dar oro.
   *   · «Elementos a repasar (2)» con los símbolos de P5 y P12, en ese orden
   */
  test('caso normal · Medio, 13 de 15 son el 87 % y la plata, no el oro', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await arrancarPartida(page, /Nombre → Símbolo/, /^Medio/);
    const PATRON = [true, true, true, true, false, true, true, true, true, true, true, false, true, true, true];
    const ACIERTOS = [1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13];
    const RACHA = [1, 2, 3, 4, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3];
    const vistos = await jugarNombreSimbolo(page, PATRON, async (i, simbolo, acierto) => {
      expect(await marcador(page)).toBe(`Pregunta ${i + 1} / 15 ✅ ${ACIERTOS[i]} · 🔥 Racha: ${RACHA[i]}`);
      if (acierto) await expect(feedback(page)).toContainText(`símbolo ${simbolo} · Z=${Z_CANONICO[simbolo]}`);
      else await expect(feedback(page)).toContainText(`La respuesta correcta era: ${simbolo}`);
      await expect(page.locator('[role="progressbar"]')).toHaveAttribute(
        'aria-valuetext',
        `${i + 1} de 15 preguntas respondidas`,
      );
      if (i === 14) await expect(page.getByRole('button', { name: 'Ver resultados' })).toBeVisible();
    });
    expect(new Set(vistos).size, `Medio repitió elemento: ${vistos.join(', ')}`).toBe(15);
    for (const s of vistos) {
      expect(ELEMENTOS.find((e) => e.simbolo === s)!.categoria, `${s} no es del nivel Medio`).not.toBe('avanzado');
    }

    const fin = page.locator('[class*="finPanel"]');
    expect(await fin.locator('[class*="finSubtitulo"]').textContent()).toBe('Has acertado 13 de 15 (87 %)');
    await expect(fin.locator('[class*="finTitulo"]')).toHaveText('¡Muy bien!');
    await expect(fin.locator('[class*="medallaIcon"]')).toHaveText('🥈');
    expect(norm(await fin.locator('[class*="statsGrid"]').innerText())).toBe(
      '13 Aciertos 2 Errores 6 Racha máxima 87 % Precisión',
    );
    await expect(page.getByText('Elementos a repasar (2)')).toBeVisible();
    expect(await page.locator('[class*="errorSimbolo"]').allTextContents()).toEqual([vistos[4], vistos[11]]);
  });

  /**
   * CASO LÍMITE — los cortes con totales que no son 10.
   *   · Difícil (20, pool de 88), fallando P1 y P2 y acertando las 18 restantes: la racha máxima
   *     se cierra en la ÚLTIMA pregunta (18) y 18 de 20 es el 90 % EXACTO: 18·10 = 180 ≥ 20·9 =
   *     180 → oro, «¡Excelente!» 🥇; «Has acertado 18 de 20 (90 %)».
   *   · Medio (15) con 7 aciertos: la mitad de 15 es 7,5, y 7·10 = 70 < 15·5 = 75 → sin medalla,
   *     «Sigue practicando»; 7/15 = 46,67 % → «47 %».
   */
  test('caso límite · Difícil 18 de 20 es el 90 % justo y da oro; Medio 7 de 15 no llega a la mitad', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await arrancarPartida(page, /Nombre → Símbolo/, /^Difícil/);
    const vistos = await jugarNombreSimbolo(
      page,
      Array.from({ length: 20 }, (_, i) => i >= 2),
      async (i) => {
        if (i === 19) expect(await marcador(page)).toBe('Pregunta 20 / 20 ✅ 18 · 🔥 Racha: 18');
      },
    );
    expect(new Set(vistos).size, `Difícil repitió elemento: ${vistos.join(', ')}`).toBe(20);
    const fin = page.locator('[class*="finPanel"]');
    expect(await fin.locator('[class*="finSubtitulo"]').textContent()).toBe('Has acertado 18 de 20 (90 %)');
    await expect(fin.locator('[class*="finTitulo"]')).toHaveText('¡Excelente!');
    expect(norm(await fin.locator('[class*="statsGrid"]').innerText())).toBe(
      '18 Aciertos 2 Errores 18 Racha máxima 90 % Precisión',
    );

    await page.getByRole('button', { name: /Cambiar configuración/ }).click();
    await arrancarPartida(page, /Nombre → Símbolo/, /^Medio/);
    await jugarNombreSimbolo(page, Array.from({ length: 15 }, (_, i) => i < 7));
    expect(await fin.locator('[class*="finSubtitulo"]').textContent()).toBe('Has acertado 7 de 15 (47 %)');
    await expect(fin.locator('[class*="finTitulo"]')).toHaveText('Sigue practicando');
  });

  /**
   * CASO QUE DEBE RECHAZARSE — avanzar sin responder, y arrastrar la partida anterior.
   * Resuelto a mano: antes de responder no existe «Siguiente pregunta →» ni «Ver resultados»; con el
   * foco en la tarjeta de la pregunta (1812), Enter y Espacio no hacen nada: sigue «Pregunta 1 / 10»,
   * el mismo símbolo, «✅ 0 · 🔥 Racha: 0» y «0 de 10 preguntas respondidas». Una partida con 3
   * fallos deja «Elementos a repasar (3)»; tras «Repetir quiz» el marcador vuelve a 0 y otra partida
   * perfecta termina en «10 Aciertos 0 Errores 10 Racha máxima 100 % Precisión» SIN «Elementos a
   * repasar»: los errores de la partida anterior no se arrastran.
   */
  test('caso de rechazo · sin responder no se avanza, y «Repetir quiz» no arrastra los errores', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    await expect(page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ })).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.matches('[class*="preguntaCard"]')))
      .toBe(true);
    const antes = (await enunciado(page).textContent())!.trim();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    await expect(enunciado(page)).toHaveText(antes);
    expect(await marcador(page)).toBe('Pregunta 1 / 10 ✅ 0 · 🔥 Racha: 0');
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuetext', '0 de 10 preguntas respondidas');
    await expect(feedback(page)).toHaveCount(0);

    await jugarFacil(page, 'simbolo', [false, false, false, true, true, true, true, true, true, true]);
    await expect(page.getByText('Elementos a repasar (3)')).toBeVisible();
    await page.getByRole('button', { name: /Repetir quiz/ }).click();
    expect(await marcador(page)).toBe('Pregunta 1 / 10 ✅ 0 · 🔥 Racha: 0');
    await jugarFacil(page, 'simbolo', Array(10).fill(true));
    const fin = page.locator('[class*="finPanel"]');
    expect(norm(await fin.locator('[class*="statsGrid"]').innerText())).toBe(
      '10 Aciertos 0 Errores 10 Racha máxima 100 % Precisión',
    );
    await expect(fin).not.toContainText('Elementos a repasar');
  });

  /**
   * 1812 (REPARADO el 25/09/2026), los TRES momentos de la familia de quizzes y las dos salidas del
   * resultado. En 7 de 7 quizzes medidos el foco caía a <body> al empezar, al responder o tras
   * «Siguiente». Esperado: empezar → la tarjeta de la pregunta (y el Tab siguiente, la opción A);
   * responder → «Siguiente pregunta →»; siguiente → la tarjeta de la pregunta nueva; «Ver
   * resultados» → el panel del resultado; «Repetir quiz» → la tarjeta de la pregunta 1;
   * «Cambiar configuración» → el título «Elige el modo de juego». Nunca <body>.
   */
  test('1812 · el foco al empezar, al responder, tras «Siguiente», al repetir y al cambiar la configuración', async ({ page }) => {
    test.setTimeout(60_000);
    await abrir(page);
    const foco = (): Promise<string> =>
      page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return 'BODY';
        const c = String(a.className);
        for (const n of ['preguntaCard', 'btnSiguiente', 'finPanel', 'configTitulo', 'opcionBtn']) {
          if (c.includes(n)) return n;
        }
        return `${a.tagName}.${c}`;
      });
    const acabarConRaton = async (): Promise<void> => {
      for (let n = 0; n < 10; n++) {
        await page.locator('[class*="opcionBtn"]').first().click();
        await page.locator('[class*="btnSiguiente"]').click();
      }
    };

    await page.getByRole('button', { name: '¡Empezar quiz!' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(foco).toBe('preguntaCard'); // 1 · empezar
    await page.keyboard.press('Tab');
    expect(await foco()).toBe('opcionBtn');
    await page.keyboard.press('Enter');
    await expect.poll(foco).toBe('btnSiguiente'); // 2 · responder
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 / 10')).toBeVisible();
    await expect.poll(foco).toBe('preguntaCard'); // 3 · siguiente

    // Acabar (P2-P10) y salir del resultado por las dos puertas
    for (let n = 2; n <= 10; n++) {
      await page.locator('[class*="opcionBtn"]').first().click();
      await page.locator('[class*="btnSiguiente"]').click();
    }
    await expect.poll(foco).toBe('finPanel');
    await page.getByRole('button', { name: /Repetir quiz/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    await expect.poll(foco).toBe('preguntaCard');
    await acabarConRaton();
    await expect.poll(foco).toBe('finPanel');
    await page.getByRole('button', { name: /Cambiar configuración/ }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(foco).toBe('configTitulo');
    await expect(page.locator('[class*="configTitulo"]').first()).toHaveText('Elige el modo de juego');
  });

  /**
   * SOSPECHA S1 (25/09/2026), DESCARTADA como defecto el 27/09/2026 — el marcador role="status"
   * (page.tsx ~l. 297) lleva la frase en un aria-label. Medido con CDP (Accessibility.getFullAXTree)
   * y un MutationObserver:
   *   · el CONTENIDO del marcador sí cambia al acertar («0» → «1» en aciertos y en racha) y al fallar
   *     con racha (la racha vuelve a «0»); no cambia al fallar con 0 aciertos y racha 0, que es
   *     cuando no hay nada nuevo que contar. El árbol lo expone como status, live=polite y
   *     atomic=TRUE (implícito del rol), con nombre «Aciertos: 1. Racha: 1.» (del aria-label) y
   *     contenido «1 · Racha: 1» (los emojis, aria-hidden, fuera). WAI-ARIA 1.2, aria-atomic=true:
   *     «assistive technologies will present the entire changed region as a whole, including the
   *     author-defined label if one exists». El nombre viaja con el anuncio.
   *   · El acierto y el fallo NO dependen de él: los anuncia el aviso role="alert" (live=assertive,
   *     atomic=true), que se monta al responder y cuyo TEXTO es «¡Correcto! Sodio · símbolo Na ·
   *     Z=11» o «La respuesta correcta era: Oro (símbolo Au)».
   * Queda como regresión de las dos cosas: que el aviso con texto exista y diga lo que pasó, y que
   * el marcador conserve su rol atómico y su nombre completo.
   */
  test('S1 · el acierto y el fallo se anuncian con TEXTO en una región viva, y el marcador es atómico y con nombre', async ({ page }) => {
    await abrir(page);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);
    const aviso = page.locator('[class*="feedbackMensaje"]');
    const estado = page.locator('[class*="progresoInfo"] [role="status"]');
    await expect(estado).toHaveAccessibleName('Aciertos: 0. Racha: 0.');

    // P1, fallada: el marcador no tiene nada nuevo que decir; el aviso sí
    let simbolo = (await enunciado(page).textContent())!.trim();
    const opciones = await opcionesVisibles(page);
    await botonOpcion(page, opciones.find((o) => o !== COMUNES[simbolo])!).click();
    await expect(aviso).toHaveAttribute('role', 'alert');
    expect(await textoAccesible(aviso)).toBe(`La respuesta correcta era: ${COMUNES[simbolo]} (símbolo ${simbolo})`);
    await expect(estado).toHaveAccessibleName('Aciertos: 0. Racha: 0.');
    await page.getByRole('button', { name: 'Siguiente pregunta →' }).click();

    // P2, acertada: cambian el contenido Y el nombre del marcador, y el aviso lo dice con texto
    simbolo = (await enunciado(page).textContent())!.trim();
    await botonOpcion(page, COMUNES[simbolo]).click();
    expect(await textoAccesible(aviso)).toBe(
      `¡Correcto! ${COMUNES[simbolo]} · símbolo ${simbolo} · Z=${Z_CANONICO[simbolo]}`,
    );
    await expect(estado).toHaveAccessibleName('Aciertos: 1. Racha: 1.');
    expect(await textoAccesible(estado)).toBe('1 · Racha: 1');

    // Lo que ve el lector de pantalla, según Chrome
    const cdp = await page.context().newCDPSession(page);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const props = (n: (typeof nodes)[number]): Record<string, unknown> =>
      Object.fromEntries((n.properties ?? []).map((p) => [p.name, p.value.value]));
    const status = nodes.find((n) => n.role?.value === 'status');
    expect(status?.name?.value).toBe('Aciertos: 1. Racha: 1.');
    expect(props(status!)).toMatchObject({ live: 'polite', atomic: true });
    const alertas = nodes.filter((n) => n.role?.value === 'alert').map(props);
    expect(alertas.some((p) => p.live === 'assertive' && p.atomic === true)).toBe(true);
  });
});

test.describe('Inspector 27/09/2026 · hallazgos', () => {
  /**
   * HALLAZGO bajo (Inspector 27/09/2026) · contenido — ABIERTO. La guía presenta W como un símbolo
   * que no casa con el nombre del elemento EN ESPAÑOL, y en español casa: el acuerdo RAC-RAE-RSEQ-
   * Fundéu (An. Quím. 113, 2017, «Adiciones y correcciones», punto 7) da como preferida
   * «wolframio», que empieza por W. La premisa solo vale para el inglés «tungsten».
   *   · paso 2 de «Cómo memorizar…» («Estudia los "engañosos"»): «Memoriza los que no coinciden
   *     con su nombre español: … W (wolframio)»
   *   · FAQ «¿Por qué el wolframio se llama así en español pero su símbolo es W?»: la pregunta
   *     plantea una contradicción que en español no existe (calco del «why is tungsten W?»).
   * Esperado: W no figura entre los «engañosos» y la FAQ no opone «wolframio» a «W».
   */
  test('hallazgo · la guía no pone W (wolframio) entre los símbolos que no casan con su nombre en español', async ({ page }) => {
    test.fail(); // ABIERTO: W (wolframio) presentado como símbolo «engañoso» en español
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const engañosos = page.locator('[class*="stepCard"]').filter({ hasText: 'engañosos' });
    await expect(engañosos).toHaveCount(1);
    await expect(engañosos).toContainText('Fe (hierro)'); // la guía está desplegada y es esa tarjeta
    await expect(engañosos).not.toContainText('W (wolframio)');
    const preguntas = await page.locator('[class*="faqItem"] h3').allTextContents();
    expect(preguntas).not.toContain('¿Por qué el wolframio se llama así en español pero su símbolo es W?');
  });

  /**
   * HALLAZGO bajo (Inspector 27/09/2026) · dato — ABIERTO. La reparación del 1818 escribió en el
   * FAQPage (lo que leen ChatGPT, Copilot y Perplexity): «Sus vidas medias van de millones de años
   * en los primeros de ese tramo (el curio-247, unos 15,6 millones de años)…». 15,6 millones de años
   * es el PERIODO DE SEMIDESINTEGRACIÓN (semivida, T½) del curio-247 (NUBASE2020: 1,56·10⁷ años, la
   * cifra que cita el propio test del 1818). La vida media es otra magnitud: τ = T½ / ln 2 ≈ 22,5
   * millones de años (IUPAC Gold Book, «mean life» frente a «half life»; es.wikipedia, «Periodo de
   * semidesintegración»: «no debe confundirse con la vida media»).
   * Esperado: o «semivida / periodo de semidesintegración … 15,6 millones», o «vida media … 22,5».
   */
  test('hallazgo · el FAQPage no llama «vida media» a la semivida del curio-247', async ({ page }) => {
    test.fail(); // ABIERTO: «vidas medias» con la cifra de T½ (15,6 Ma; τ ≈ 22,5 Ma)
    await abrir(page);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const textos: string[] = faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text);
    const cuantos = textos.find((t) => t.includes('118 elementos'))!;
    expect(cuantos).toContain('curio-247'); // la respuesta es la que se mide
    expect(cuantos).not.toMatch(/vidas? medias?[^.]*15,6 millones/);
  });
});

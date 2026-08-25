import { test, expect, type Page } from '@playwright/test';
import { verbosIrregulares } from '../../data/verbos-irregulares';

/**
 * Quiz Verbos Irregulares — test de regresión del Inspector (25/08/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Quiz Verbos Irregulares» · subtítulo «Aprende el Past Simple en inglés de forma
 * interactiva · Niveles A1 a B2» · metadata y JSON-LD «75 verbos clasificados por nivel
 * MCER (A1-B2), opción múltiple con conjugación completa».
 * Los verbos son INGLESES y lo que se pregunta es SIEMPRE el Past Simple («¿Cuál es el
 * Past Simple de...?»); el Past Participle solo se enseña en el banner de feedback.
 * En un quiz la promesa incluye dos cosas que no se ven en el maquetado: que la forma
 * marcada como correcta lo sea DE VERDAD, y que el marcador cuente bien.
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Las tres formas de cada verbo se escriben aquí A MANO (CANON, más abajo) desde las
 *   tablas de referencia de verbos irregulares ingleses (Oxford Learner's Dictionaries /
 *   Cambridge Dictionary). NO se derivan de `data/verbos-irregulares.ts`: así el test
 *   contrasta la clave de respuestas contra el inglés, no contra sí misma. Si alguien
 *   escribe «swimmed» o mueve un participio en el fichero de datos, esto tiene que fallar.
 * · Los tamaños de partida salen de OPCIONES_PREGUNTAS de page.tsx: 10, 15 o 20; y del
 *   tamaño del nivel: A1 tiene 15 verbos, A2/B1/B2 tienen 20 cada uno, «todos» 75.
 * · La puntuación sale de calcularPuntuacion() de page.tsx, resuelta a mano:
 *      pct ≥ 0,9              → 100
 *      0,7 ≤ pct < 0,9        → redondeo(60 + (pct − 0,7)/0,2 · 40)
 *      0,5 ≤ pct < 0,7        → redondeo(40 + (pct − 0,5)/0,2 · 20)
 *      pct < 0,5              → redondeo(pct · 80)
 *   → 7/10 = 0,70 exacto → 60 + 0 = 60 pts · 0/15 = 0 → 0 pts · 10/10 = 1,0 → 100 pts
 * · Los rótulos salen de getResultadoTexto(): ≥0,9 «¡Dominas el inglés!», ≥0,7 «¡Muy buena
 *   puntuación!», ≥0,5 «Buen intento», resto «Sigue practicando».
 *
 * ALEATORIEDAD
 * ────────────
 * `generarPreguntas` baraja con Math.random y no hay semilla en la UI. En vez de fijar el
 * PRNG (que ata el test a cuántos números consume React al hidratar), se juega con la tabla
 * canónica en la mano: se lee el infinitivo que sale en pantalla y se pulsa la forma que el
 * inglés dice que es correcta. Lo que se comprueba son invariantes que han de cumplirse en
 * CUALQUIER tanda: 4 opciones distintas, la correcta entre ellas, ningún verbo repetido, la
 * conjugación del banner cuadrando con el canon y el marcador cuadrando pregunta a pregunta.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()`. Afirman lo que DEBERÍA pasar,
 * así que hoy fallan a propósito; cuando se reparen, se les quita el `test.fail()` y quedan
 * como regresión.
 */

const RUTA = '/quiz-verbos-irregulares/';

/**
 * Conjugación canónica de los 75 verbos del banco: infinitivo → past simple → past participle.
 * Escrita a mano desde las tablas de verbos irregulares de Oxford/Cambridge. `variantes` lista
 * las OTRAS formas igualmente correctas que la app no ofrece (no son errores del banco, pero
 * sí lo que un alumno puede haber aprendido y aquí se rechazaría).
 */
const CANON: Record<string, { ps: string; pp: string; es: string; nivel: string; variantes?: string }> = {
  // ── A1 (15) ──
  be:     { ps: 'was / were', pp: 'been',    es: 'ser / estar',         nivel: 'A1' },
  have:   { ps: 'had',        pp: 'had',     es: 'tener',               nivel: 'A1' },
  do:     { ps: 'did',        pp: 'done',    es: 'hacer',               nivel: 'A1' },
  go:     { ps: 'went',       pp: 'gone',    es: 'ir',                  nivel: 'A1' },
  come:   { ps: 'came',       pp: 'come',    es: 'venir',               nivel: 'A1' },
  get:    { ps: 'got',        pp: 'got',     es: 'obtener / conseguir', nivel: 'A1', variantes: 'participio «gotten» en inglés americano' },
  make:   { ps: 'made',       pp: 'made',    es: 'hacer / fabricar',    nivel: 'A1' },
  know:   { ps: 'knew',       pp: 'known',   es: 'saber / conocer',     nivel: 'A1' },
  think:  { ps: 'thought',    pp: 'thought', es: 'pensar',              nivel: 'A1' },
  see:    { ps: 'saw',        pp: 'seen',    es: 'ver',                 nivel: 'A1' },
  say:    { ps: 'said',       pp: 'said',    es: 'decir',               nivel: 'A1' },
  take:   { ps: 'took',       pp: 'taken',   es: 'tomar / coger',       nivel: 'A1' },
  give:   { ps: 'gave',       pp: 'given',   es: 'dar',                 nivel: 'A1' },
  find:   { ps: 'found',      pp: 'found',   es: 'encontrar',           nivel: 'A1' },
  tell:   { ps: 'told',       pp: 'told',    es: 'contar / decir',      nivel: 'A1' },
  // ── A2 (20) ──
  write:  { ps: 'wrote',   pp: 'written', es: 'escribir',             nivel: 'A2' },
  read:   { ps: 'read',    pp: 'read',    es: 'leer',                 nivel: 'A2' },
  buy:    { ps: 'bought',  pp: 'bought',  es: 'comprar',              nivel: 'A2' },
  eat:    { ps: 'ate',     pp: 'eaten',   es: 'comer',                nivel: 'A2' },
  drink:  { ps: 'drank',   pp: 'drunk',   es: 'beber',                nivel: 'A2' },
  sleep:  { ps: 'slept',   pp: 'slept',   es: 'dormir',               nivel: 'A2' },
  run:    { ps: 'ran',     pp: 'run',     es: 'correr',               nivel: 'A2' },
  put:    { ps: 'put',     pp: 'put',     es: 'poner',                nivel: 'A2' },
  sit:    { ps: 'sat',     pp: 'sat',     es: 'sentarse',             nivel: 'A2' },
  meet:   { ps: 'met',     pp: 'met',     es: 'conocer / quedar',     nivel: 'A2' },
  leave:  { ps: 'left',    pp: 'left',    es: 'salir / dejar',        nivel: 'A2' },
  lose:   { ps: 'lost',    pp: 'lost',    es: 'perder',               nivel: 'A2' },
  win:    { ps: 'won',     pp: 'won',     es: 'ganar',                nivel: 'A2' },
  drive:  { ps: 'drove',   pp: 'driven',  es: 'conducir',             nivel: 'A2' },
  bring:  { ps: 'brought', pp: 'brought', es: 'traer',                nivel: 'A2' },
  speak:  { ps: 'spoke',   pp: 'spoken',  es: 'hablar',               nivel: 'A2' },
  hear:   { ps: 'heard',   pp: 'heard',   es: 'oír',                  nivel: 'A2' },
  feel:   { ps: 'felt',    pp: 'felt',    es: 'sentir',               nivel: 'A2' },
  keep:   { ps: 'kept',    pp: 'kept',    es: 'mantener / guardar',   nivel: 'A2' },
  stand:  { ps: 'stood',   pp: 'stood',   es: 'estar de pie',         nivel: 'A2' },
  // ── B1 (20) ──
  break:  { ps: 'broke',  pp: 'broken',    es: 'romper',                    nivel: 'B1' },
  build:  { ps: 'built',  pp: 'built',     es: 'construir',                 nivel: 'B1' },
  choose: { ps: 'chose',  pp: 'chosen',    es: 'elegir',                    nivel: 'B1' },
  cut:    { ps: 'cut',    pp: 'cut',       es: 'cortar',                    nivel: 'B1' },
  fall:   { ps: 'fell',   pp: 'fallen',    es: 'caer',                      nivel: 'B1' },
  fly:    { ps: 'flew',   pp: 'flown',     es: 'volar',                     nivel: 'B1' },
  forget: { ps: 'forgot', pp: 'forgotten', es: 'olvidar',                   nivel: 'B1' },
  grow:   { ps: 'grew',   pp: 'grown',     es: 'crecer',                    nivel: 'B1' },
  hold:   { ps: 'held',   pp: 'held',      es: 'sostener / sujetar',        nivel: 'B1' },
  hurt:   { ps: 'hurt',   pp: 'hurt',      es: 'doler / herir',             nivel: 'B1' },
  pay:    { ps: 'paid',   pp: 'paid',      es: 'pagar',                     nivel: 'B1' },
  sell:   { ps: 'sold',   pp: 'sold',      es: 'vender',                    nivel: 'B1' },
  send:   { ps: 'sent',   pp: 'sent',      es: 'enviar',                    nivel: 'B1' },
  show:   { ps: 'showed', pp: 'shown',     es: 'mostrar',                   nivel: 'B1', variantes: 'participio «showed» también admitido' },
  sing:   { ps: 'sang',   pp: 'sung',      es: 'cantar',                    nivel: 'B1' },
  spend:  { ps: 'spent',  pp: 'spent',     es: 'gastar / pasar tiempo',     nivel: 'B1' },
  swim:   { ps: 'swam',   pp: 'swum',      es: 'nadar',                     nivel: 'B1' },
  wear:   { ps: 'wore',   pp: 'worn',      es: 'llevar puesto',             nivel: 'B1' },
  begin:  { ps: 'began',  pp: 'begun',     es: 'comenzar',                  nivel: 'B1' },
  teach:  { ps: 'taught', pp: 'taught',    es: 'enseñar',                   nivel: 'B1' },
  // ── B2 (20) ──
  bite:   { ps: 'bit',     pp: 'bitten',    es: 'morder',             nivel: 'B2' },
  blow:   { ps: 'blew',    pp: 'blown',     es: 'soplar',             nivel: 'B2' },
  draw:   { ps: 'drew',    pp: 'drawn',     es: 'dibujar',            nivel: 'B2' },
  feed:   { ps: 'fed',     pp: 'fed',       es: 'alimentar',          nivel: 'B2' },
  fight:  { ps: 'fought',  pp: 'fought',    es: 'luchar / pelear',    nivel: 'B2' },
  freeze: { ps: 'froze',   pp: 'frozen',    es: 'congelar',           nivel: 'B2' },
  hide:   { ps: 'hid',     pp: 'hidden',    es: 'esconder',           nivel: 'B2' },
  lay:    { ps: 'laid',    pp: 'laid',      es: 'colocar / poner',    nivel: 'B2' },
  lead:   { ps: 'led',     pp: 'led',       es: 'liderar / guiar',    nivel: 'B2' },
  lend:   { ps: 'lent',    pp: 'lent',      es: 'prestar',            nivel: 'B2' },
  mean:   { ps: 'meant',   pp: 'meant',     es: 'significar',         nivel: 'B2' },
  ride:   { ps: 'rode',    pp: 'ridden',    es: 'montar / ir en',     nivel: 'B2' },
  rise:   { ps: 'rose',    pp: 'risen',     es: 'levantarse / subir', nivel: 'B2' },
  shake:  { ps: 'shook',   pp: 'shaken',    es: 'sacudir / agitar',   nivel: 'B2' },
  shoot:  { ps: 'shot',    pp: 'shot',      es: 'disparar',           nivel: 'B2' },
  steal:  { ps: 'stole',   pp: 'stolen',    es: 'robar',              nivel: 'B2' },
  throw:  { ps: 'threw',   pp: 'thrown',    es: 'lanzar / tirar',     nivel: 'B2' },
  wake:   { ps: 'woke',    pp: 'woken',     es: 'despertar',          nivel: 'B2', variantes: '«waked» en inglés americano' },
  forbid: { ps: 'forbade', pp: 'forbidden', es: 'prohibir',           nivel: 'B2', variantes: '«forbad», hoy en desuso' },
  shine:  { ps: 'shone',   pp: 'shone',     es: 'brillar',            nivel: 'B2', variantes: '«shined» solo con el sentido transitivo de sacar brillo' },
};

/**
 * Verbos que el bloque educativo manda practicar EN UN NIVEL CONCRETO del quiz.
 * Salen de las semanas 1, 2 y 3 del «Plan de 30 días» y del consejo de la FAQ
 * «practica estos pares en el nivel B2 del quiz».
 */
const VERBOS_QUE_EL_PLAN_MANDA_PRACTICAR: { verbo: string; nivelQuePideElPlan: string; donde: string }[] = [
  { verbo: 'put',   nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'cut',   nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'hit',   nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'let',   nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'set',   nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'shut',  nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'burst', nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'cost',  nivelQuePideElPlan: 'A1', donde: 'Semana 1 (A-A-A), «practica 10 preguntas del nivel A1»' },
  { verbo: 'buy',   nivelQuePideElPlan: 'A2', donde: 'Semana 2, «empieza con los A2 … practica en el nivel A2»' },
  { verbo: 'bring', nivelQuePideElPlan: 'A2', donde: 'Semana 2, «empieza con los A2 … practica en el nivel A2»' },
  { verbo: 'think', nivelQuePideElPlan: 'A2', donde: 'Semana 2, «empieza con los A2 … practica en el nivel A2»' },
  { verbo: 'teach', nivelQuePideElPlan: 'A2', donde: 'Semana 2, «empieza con los A2 … practica en el nivel A2»' },
  { verbo: 'sell',  nivelQuePideElPlan: 'A2', donde: 'Semana 2, «empieza con los A2 … practica en el nivel A2»' },
  { verbo: 'lay',   nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
  { verbo: 'lie',   nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
  { verbo: 'rise',  nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
  { verbo: 'raise', nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
  { verbo: 'fall',  nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
  { verbo: 'feel',  nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
  { verbo: 'find',  nivelQuePideElPlan: 'B2', donde: 'FAQ, «practica estos pares en el nivel B2 del quiz»' },
];

// ─── Utilidades de lectura de la pantalla ────────────────────────────────────

/** Los tres valores del HUD: «n/N», aciertos y precisión. */
async function hud(page: Page): Promise<{ progreso: string; correctas: string; precision: string }> {
  const v = await page.locator('[class*="hudValor"]').allTextContents();
  return { progreso: v[0].trim(), correctas: v[1].trim(), precision: v[2].trim() };
}

/** Infinitivo que se pregunta ahora. */
function verboEnPantalla(page: Page) {
  return page.locator('[class*="verboPrincipal"]');
}

/** Texto de las 4 opciones, en orden A-B-C-D (se lee del aria-label, que es su nombre accesible). */
async function opcionesVisibles(page: Page): Promise<string[]> {
  const botones = page.locator('[class*="opcionesGrid"] button');
  const etiquetas = await botones.evaluateAll((bs) =>
    bs.map((b) => b.getAttribute('aria-label') ?? '')
  );
  return etiquetas.map((a) => a.replace(/^Opción [A-D]: /, ''));
}

/** Pulsa la opción cuyo texto sea exactamente `texto`. `forzar` salta el check de habilitado. */
async function pulsarOpcion(page: Page, texto: string, forzar = false) {
  const botones = page.locator('[class*="opcionesGrid"] button');
  const total = await botones.count();
  for (let i = 0; i < total; i++) {
    const b = botones.nth(i);
    const aria = (await b.getAttribute('aria-label')) ?? '';
    if (aria.replace(/^Opción [A-D]: /, '') === texto) {
      await b.click({ force: forzar });
      return;
    }
  }
  throw new Error(`No hay ninguna opción «${texto}» en pantalla`);
}

/** El banner de feedback de la app (no el route-announcer de Next, que también es role="alert"). */
function feedback(page: Page) {
  return page.locator('[class*="feedbackBanner"]');
}

async function arrancarPartida(page: Page, nivel: string, numPreguntas: 10 | 15 | 20) {
  await page.locator('[class*="nivelBtn"]').filter({ hasText: nivel }).click();
  await page.getByRole('button', { name: `${numPreguntas} preguntas` }).click();
  await page.getByRole('button', { name: /^Empezar Quiz/ }).click();
}

/** Avanza a la siguiente pregunta (o a los resultados si es la última). */
function botonSiguiente(page: Page) {
  return page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Verbos Irregulares', () => {
  /**
   * VERACIDAD DEL BANCO — lo primero, porque si la clave de respuestas miente, el resto
   * de los tests solo comprueban que la app se equivoca de forma consistente.
   *
   * Esperado (determinado ANTES de ejecutar la app, ver CANON arriba):
   *   · 75 verbos: 15 A1 + 20 A2 + 20 B1 + 20 B2, exactamente los que anuncian la
   *     metadata («75 verbos») y NIVEL_CONFIG («15 verbos esenciales», «20 …»)
   *   · las tres formas de cada uno, según Oxford/Cambridge
   *   · ningún infinitivo repetido y ningún past simple repetido (dos verbos con el mismo
   *     past simple producirían dos opciones idénticas en la misma pregunta)
   */
  test('el banco dice la verdad: 75 verbos con sus tres formas y sin colisiones', async () => {
    expect(verbosIrregulares).toHaveLength(75);

    const porNivel = { A1: 0, A2: 0, B1: 0, B2: 0 };
    for (const v of verbosIrregulares) porNivel[v.level]++;
    expect(porNivel).toEqual({ A1: 15, A2: 20, B1: 20, B2: 20 });

    for (const v of verbosIrregulares) {
      const canon = CANON[v.infinitive];
      expect(canon, `«${v.infinitive}» no está en la tabla canónica de este test`).toBeTruthy();
      expect(v.pastSimple, `past simple de «${v.infinitive}»`).toBe(canon.ps);
      expect(v.pastParticiple, `past participle de «${v.infinitive}»`).toBe(canon.pp);
      expect(v.level, `nivel de «${v.infinitive}»`).toBe(canon.nivel);
      // El significado no es decorativo: fija cuál de las dos conjugaciones posibles aplica.
      // «shine» conjuga shone SOLO como «brillar» (lustrar es shined) y «lay» conjuga laid
      // SOLO como «colocar» (yacer es lie/lay/lain).
      expect(v.spanish, `significado de «${v.infinitive}»`).toBe(canon.es);
    }

    const infinitivos = verbosIrregulares.map((v) => v.infinitive);
    expect(new Set(infinitivos).size, 'hay infinitivos repetidos').toBe(75);
    const pasados = verbosIrregulares.map((v) => v.pastSimple);
    expect(new Set(pasados).size, 'dos verbos comparten past simple: la misma pregunta ofrecería dos opciones idénticas').toBe(75);
  });

  /**
   * CASO NORMAL — partida de A1 con 10 preguntas: 7 aciertos y 3 fallos.
   *
   * Esperado (calculado a mano ANTES de ejecutar la app):
   *   · las 10 preguntas son verbos de A1, sin repetir ninguno (mezclar+slice sin reposición)
   *   · 4 opciones distintas por pregunta, con la correcta entre ellas
   *   · el banner enseña «infinitivo → past simple → past participle» del canon
   *   · marcador: sube solo con los aciertos → 7 al terminar
   *   · 7/10 = 0,70 → calcularPuntuacion() rama «≥0,7» → 60 + (0,70−0,70)/0,2·40 = 60 pts
   *   · getResultadoTexto(0,7) → «¡Muy buena puntuación!» · «7 de 10 respuestas correctas»
   *   · acierto redondeado: round(0,7·100) = 70 %
   */
  test('caso normal: 7 aciertos y 3 fallos en A1 dan 60 pts y «¡Muy buena puntuación!»', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('h1')).toContainText('Quiz Verbos Irregulares');
    await arrancarPartida(page, 'A1 Básico', 10);

    const preguntados: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const infinitivo = (await verboEnPantalla(page).textContent())!.trim();
      preguntados.push(infinitivo);

      const canon = CANON[infinitivo];
      expect(canon, `A1 preguntó «${infinitivo}», que no está en la tabla canónica`).toBeTruthy();
      expect(canon.nivel, `«${infinitivo}» no es de A1 y ha salido en una partida de A1`).toBe('A1');

      // Lo que se pregunta es SIEMPRE el past simple; el participio nunca se pregunta.
      await expect(page.getByText('¿Cuál es el Past Simple de...?')).toBeVisible();
      await expect(page.getByText(`Pregunta ${i} de 10`)).toBeVisible();
      expect((await hud(page)).progreso).toBe(`${i}/10`);

      const opciones = await opcionesVisibles(page);
      expect(opciones, `Q${i} (${infinitivo}) debe ofrecer 4 opciones`).toHaveLength(4);
      expect(new Set(opciones).size, `Q${i} repite alguna opción: ${opciones.join(', ')}`).toBe(4);
      expect(opciones, `Q${i}: «${canon.ps}» no está entre las ofrecidas`).toContain(canon.ps);

      const acierta = i <= 7;
      const elegida = acierta ? canon.ps : opciones.find((o) => o !== canon.ps)!;
      await pulsarOpcion(page, elegida);

      await expect(feedback(page)).toContainText(acierta ? '¡Correcto!' : 'Incorrecto');
      // La conjugación completa que enseña el banner es la del canon, acierte o falle
      const conjugacion = (await page.locator('[class*="conjugacion"]').textContent())!.replace(/\s+/g, ' ').trim();
      expect(conjugacion).toBe(`${infinitivo}→${canon.ps}→${canon.pp}`);
      // El marcador solo sube con los aciertos
      expect((await hud(page)).correctas, `tras Q${i} debe haber ${acierta ? i : 7} aciertos`).toBe(String(acierta ? i : 7));

      await expect(botonSiguiente(page)).toHaveText(i < 10 ? 'Siguiente pregunta →' : 'Ver resultados');
      await botonSiguiente(page).click();
    }

    expect(new Set(preguntados).size, `verbo repetido: ${preguntados.join(', ')}`).toBe(10);

    // 7/10 → 60 pts (rama «≥0,7» de calcularPuntuacion, resuelta arriba a mano)
    await expect(page.locator('[class*="resultadoPuntos"]')).toHaveText('60 pts');
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('¡Muy buena puntuación!');
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toContainText('7 de 10 respuestas correctas');
    const stats = (await page.locator('[class*="statsResultado"]').innerText()).replace(/\s+/g, ' ');
    expect(stats).toContain('7/10');
    expect(stats).toContain('70%');
  });

  /**
   * CASO LÍMITE — banco agotado y cero aciertos: A1 (15 verbos) pidiendo 20 preguntas
   * y fallándolo todo.
   *
   * Esperado (calculado a mano ANTES de ejecutar la app):
   *   · generarPreguntas hace slice(Math.min(20, 15)) → la partida es de 15, no de 20,
   *     y son EXACTAMENTE los 15 verbos de A1 (el nivel entero, sin repetir)
   *   · marcador clavado en 0 las quince veces
   *   · 0/15 = 0 → rama «pct < 0,5» → round(0 · 80) = 0 pts
   *   · getResultadoTexto(0) → «Sigue practicando» · «0 de 15 respuestas correctas» · 0 %
   *   (que el botón haya prometido 20 preguntas y sirva 15 sin avisar es el HALLAZGO 2,
   *    afirmado abajo con test.fail)
   */
  test('caso límite: A1 con 20 preguntas sirve los 15 verbos del nivel y fallarlo todo da 0 pts', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('[class*="nivelBtn"]').filter({ hasText: 'A1 Básico' }).click();
    await page.getByRole('button', { name: '20 preguntas' }).click();
    await page.getByRole('button', { name: /^Empezar Quiz/ }).click();

    // El banco de A1 tiene 15 verbos, así que la partida se queda en 15
    expect((await hud(page)).progreso).toBe('1/15');

    const preguntados: string[] = [];
    for (let i = 1; i <= 15; i++) {
      const infinitivo = (await verboEnPantalla(page).textContent())!.trim();
      preguntados.push(infinitivo);
      const canon = CANON[infinitivo];

      const opciones = await opcionesVisibles(page);
      await pulsarOpcion(page, opciones.find((o) => o !== canon.ps)!);

      await expect(feedback(page)).toContainText('Incorrecto');
      expect((await hud(page)).correctas, `tras fallar Q${i} el marcador debe seguir en 0`).toBe('0');
      await botonSiguiente(page).click();
    }

    // Los 15 preguntados son el nivel A1 entero, cada uno una sola vez
    const a1 = verbosIrregulares.filter((v) => v.level === 'A1').map((v) => v.infinitive).sort();
    expect(preguntados.slice().sort()).toEqual(a1);

    await expect(page.locator('[class*="resultadoPuntos"]')).toHaveText('0 pts');
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Sigue practicando');
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toContainText('0 de 15 respuestas correctas');
    const stats = (await page.locator('[class*="statsResultado"]').innerText()).replace(/\s+/g, ' ');
    expect(stats).toContain('0/15');
    expect(stats).toContain('0%');
  });

  /**
   * CASO DE RECHAZO / ROBUSTEZ — repulsar la respuesta ya contestada y reiniciar.
   *
   * Esperado (determinado ANTES de ejecutar la app; el guardián es
   * `if (seleccionada !== null) return` en responder(), más `disabled` en las 4 opciones):
   *   · tras contestar, las 4 opciones quedan deshabilitadas
   *   · volver a pulsar LA MISMA opción no suma un segundo acierto (marcador sigue en 1)
   *   · pulsar OTRA opción después no cambia ni el marcador ni el veredicto ya emitido
   *   · acertando las 10 → 10/10 = 1,0 ≥ 0,9 → 100 pts y «¡Dominas el inglés!»
   *   · «🔄 Jugar de nuevo» devuelve el marcador a cero: 1/10, 0 aciertos, 0 %, barra a 0
   */
  test('caso de rechazo: repulsar la opción no suma dos veces y reiniciar deja el marcador a cero', async ({ page }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, 'A1 Básico', 10);

    // ── Q1: se contesta bien y se insiste ──
    const infinitivo = (await verboEnPantalla(page).textContent())!.trim();
    const correcta = CANON[infinitivo].ps;
    await pulsarOpcion(page, correcta);
    expect((await hud(page)).correctas).toBe('1');

    const opciones = page.locator('[class*="opcionesGrid"] button');
    for (let i = 0; i < 4; i++) await expect(opciones.nth(i)).toBeDisabled();

    await pulsarOpcion(page, correcta, true);                       // la MISMA otra vez
    expect((await hud(page)).correctas, 'el segundo clic en la correcta ha sumado otro acierto').toBe('1');

    const otra = (await opcionesVisibles(page)).find((o) => o !== correcta)!;
    await pulsarOpcion(page, otra, true);                           // una distinta, ya contestada
    expect((await hud(page)).correctas, 'pulsar otra opción después de contestar ha cambiado el marcador').toBe('1');
    await expect(feedback(page)).toContainText('¡Correcto!');        // el veredicto no se reescribe

    await botonSiguiente(page).click();

    // ── Resto de la partida, todo correcto → 10/10 ──
    for (let i = 2; i <= 10; i++) {
      const inf = (await verboEnPantalla(page).textContent())!.trim();
      await pulsarOpcion(page, CANON[inf].ps);
      expect((await hud(page)).correctas).toBe(String(i));
      await botonSiguiente(page).click();
    }

    await expect(page.locator('[class*="resultadoPuntos"]')).toHaveText('100 pts');
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('¡Dominas el inglés!');
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toContainText('10 de 10 respuestas correctas');

    // ── Reinicio ──
    await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
    const tras = await hud(page);
    expect(tras.progreso).toBe('1/10');
    expect(tras.correctas, 'el marcador no ha vuelto a cero al reiniciar').toBe('0');
    expect(tras.precision).toBe('0%');
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');
  });

  // ══════════════════════ HALLAZGOS ABIERTOS (test.fail) ══════════════════════

  /**
   * HALLAZGO 1 (cálculo) — la «Precisión» del HUD pasa del 100 % mientras se lee el feedback.
   * Es `correctas / preguntaActual`: al contestar la pregunta i (índice i−1) el numerador ya
   * incluye esa respuesta y el denominador todavía no. Acertando las dos primeras se ve 200 %.
   */
  test('la precisión del HUD nunca debería pasar del 100 %', async ({ page }) => {
    test.fail(); // hoy muestra 200 % tras acertar la segunda pregunta (y 150 %, 133 %, 125 %…)
    await page.goto(RUTA);
    await arrancarPartida(page, 'A1 Básico', 10);

    for (let i = 1; i <= 3; i++) {
      const inf = (await verboEnPantalla(page).textContent())!.trim();
      await pulsarOpcion(page, CANON[inf].ps);
      const { precision } = await hud(page);
      const valor = Number(precision.replace('%', ''));
      expect(valor, `tras acertar ${i} de ${i} la precisión no puede ser ${precision}`).toBeLessThanOrEqual(100);
      await botonSiguiente(page).click();
    }
  });

  /**
   * HALLAZGO 2 (operativa) — A1 solo tiene 15 verbos, así que pedir 20 preguntas sirve 15.
   * El truncado (Math.min en generarPreguntas) es correcto; lo que falla es que el botón
   * sigue prometiendo «20 preguntas» y en ningún sitio se avisa de que el nivel no da para tanto.
   */
  test('pedir más preguntas que verbos tiene el nivel debería avisar antes de empezar', async ({ page }) => {
    test.fail(); // hoy el botón promete 20 preguntas y la partida arranca en «1/15» sin decir nada
    await page.goto(RUTA);
    await page.locator('[class*="nivelBtn"]').filter({ hasText: 'A1 Básico' }).click();
    await page.getByRole('button', { name: '20 preguntas' }).click();

    const rotulo = (await page.getByRole('button', { name: /^Empezar Quiz/ }).textContent())!;
    // O el rótulo dice la verdad (15), o hay un aviso visible de que A1 no llega a 20
    const avisa =
      /15 preguntas/.test(rotulo) ||
      (await page.getByText(/solo (tiene|hay) 15|se jugará con 15|máximo 15/i).count()) > 0;
    expect(avisa, `el botón promete «${rotulo.trim()}» y la partida servirá 15 preguntas`).toBe(true);
  });

  /**
   * HALLAZGO 3 (contenido) — el FAQPage del JSON-LD, que es lo que leen Google, Bing y los
   * asistentes de IA, dice que el quiz «pide seleccionar la forma correcta de Past Simple o
   * Past Participle». El quiz solo pregunta el Past Simple: generarPreguntas usa
   * `verbo.pastSimple` como respuesta y como pool de distractores, y el rótulo de la
   * pregunta es fijo.
   */
  test('el JSON-LD no debería prometer preguntas de Past Participle', async ({ page }) => {
    test.fail(); // hoy el FAQPage dice «Past Simple o Past Participle» y el quiz solo pregunta Past Simple
    await page.goto(RUTA);

    // El rótulo de la pregunta es fijo: nunca se pide el participio
    await arrancarPartida(page, 'A1 Básico', 10);
    await expect(page.getByText('¿Cuál es el Past Simple de...?')).toBeVisible();
    await expect(page.getByText(/¿Cuál es el Past Participle/)).toHaveCount(0);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('FAQPage')) ?? '';
    expect(faq, 'la app no sirve FAQPage').not.toBe('');
    expect(faq, 'el FAQPage promete preguntas de Past Participle que el quiz nunca hace').not.toContain(
      'Past Simple o Past Participle'
    );
  });

  /**
   * HALLAZGO 4 (contenido) — el «Plan de 30 días» y la FAQ mandan practicar verbos concretos
   * en un nivel concreto del quiz, y 10 de esos verbos no están en el banco (hit, let, set,
   * shut, burst, cost, become, overcome, lie, raise) mientras que otros están en un nivel
   * distinto del que dice el plan (put es A2 y no A1; think es A1 y no A2; teach y sell son
   * B1 y no A2; fall es B1, feel A2 y find A1, no B2). El alumno que siga el plan al pie de
   * la letra practica en niveles donde esos verbos no salen nunca.
   */
  test('los verbos que el plan educativo manda practicar deberían estar en el nivel que dice', async () => {
    test.fail(); // hoy 10 no están en el banco y 6 están en otro nivel
    const enBanco = new Map(verbosIrregulares.map((v) => [v.infinitive, v.level]));
    const fallos: string[] = [];

    for (const { verbo, nivelQuePideElPlan, donde } of VERBOS_QUE_EL_PLAN_MANDA_PRACTICAR) {
      const nivelReal = enBanco.get(verbo);
      if (!nivelReal) fallos.push(`«${verbo}» no está en el banco — ${donde}`);
      else if (nivelReal !== nivelQuePideElPlan) fallos.push(`«${verbo}» está en ${nivelReal}, no en ${nivelQuePideElPlan} — ${donde}`);
    }

    expect(fallos, `el bloque educativo manda practicar verbos que el quiz no ofrece ahí:\n  ${fallos.join('\n  ')}`).toEqual([]);
  });

  /**
   * HALLAZGO 5 (accesibilidad) — `npm run check:a11y-jsx` señala 10 incumplimientos en
   * page.tsx: los 6 <button> de la app sin `type="button"` y 3 emojis pegados al texto sin
   * `aria-hidden` (el 📝 del H1 y los rótulos «🔄 Jugar de nuevo» y «⚙️ Cambiar nivel»).
   * Es pasivo anterior al candado, que solo juzga las líneas que un commit añade.
   */
  test('todos los botones deberían llevar type="button"', async ({ page }) => {
    test.fail(); // hoy ninguno de los botones propios de la app lo lleva
    await page.goto(RUTA);
    const sinType = await page
      .locator('[class*="configPanel"] button, [class*="opcionesGrid"] button, [class*="botonesResultado"] button')
      .evaluateAll((bs) => bs.filter((b) => !b.getAttribute('type')).map((b) => (b.textContent ?? '').trim().slice(0, 40)));
    expect(sinType, `botones sin type="button": ${sinType.join(' · ')}`).toEqual([]);
  });
});

import { test, expect, type Page } from '@playwright/test';
import { verbosIrregulares } from '../../data/verbos-irregulares';
import type { Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

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
 * HALLAZGOS: los siete de esta pasada se repararon el 25/08/2026 y quedan al final como
 * REGRESIÓN, ya sin `test.fail()`. Dos decisiones de esa reparación cambian lo que estos
 * tests pueden dar por supuesto, y por eso se nombran aquí:
 *   · «show» sale del sorteo de preguntas —su past simple es regular y era el único en -ed
 *     de los 75— pero sigue en las tablas del bloque educativo.
 *   · de «be» se pregunta «was», no «was / were», y el enunciado lo dice; la conjugación del
 *     banner sí sigue enseñando las dos formas. De ahí `respuestaQueSePregunta()`.
 */

const RUTA = '/quiz-verbos-irregulares/';

/**
 * La forma que el quiz PREGUNTA, que no siempre es el past simple entero del canon.
 *
 * Para «be» el past simple es «was / were», pero desde el 25/08/2026 el quiz pregunta la
 * forma de singular y lo dice en el enunciado: «was / were» era la única respuesta con barra
 * de los 75, así que se acertaba —y se descartaba de distractor— por la forma de la cadena,
 * sin saber nada del verbo (hallazgo 316). El banner de feedback sigue enseñando la
 * conjugación completa, «was / were» incluido.
 */
function respuestaQueSePregunta(infinitivo: string): string {
  return infinitivo === 'be' ? 'was' : CANON[infinitivo].ps;
}

/**
 * Conjugación canónica de los 75 verbos del banco: infinitivo → past simple → past participle.
 * Escrita a mano desde las tablas de verbos irregulares de Oxford/Cambridge.
 *
 * `variantes` lista las OTRAS formas igualmente correctas que la app no ofrece (no son
 * errores del banco, pero sí lo que un alumno puede haber aprendido y aquí se rechazaría).
 *
 * `ppAlt` es la variante de participio que el banner DEBE mostrar, con su etiqueta de
 * variedad. Existe desde el 25/08/2026: la app enseñaba «get → got → got» mientras su propia
 * caja de avisos decía que get admite got/gotten, y un test de aquí fijaba ese
 * «get→got→got» como contrato — o sea, consagraba justo el defecto (hallazgo 315).
 */
const CANON: Record<string, { ps: string; pp: string; es: string; nivel: string; variantes?: string; ppAlt?: string }> = {
  // ── A1 (15) ──
  be:     { ps: 'was / were', pp: 'been',    es: 'ser / estar',         nivel: 'A1' },
  have:   { ps: 'had',        pp: 'had',     es: 'tener',               nivel: 'A1' },
  do:     { ps: 'did',        pp: 'done',    es: 'hacer',               nivel: 'A1' },
  go:     { ps: 'went',       pp: 'gone',    es: 'ir',                  nivel: 'A1' },
  come:   { ps: 'came',       pp: 'come',    es: 'venir',               nivel: 'A1' },
  get:    { ps: 'got',        pp: 'got',     es: 'obtener / conseguir', nivel: 'A1', variantes: 'participio «gotten» en inglés americano', ppAlt: 'gotten (AmE)' },
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
  show:   { ps: 'showed', pp: 'shown',     es: 'mostrar',                   nivel: 'B1', variantes: 'participio «showed» también admitido', ppAlt: 'showed (menos frecuente)' },
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
  wake:   { ps: 'woke',    pp: 'woken',     es: 'despertar',          nivel: 'B2', variantes: '«waked» en inglés americano', ppAlt: 'waked (AmE)' },
  forbid: { ps: 'forbade', pp: 'forbidden', es: 'prohibir',           nivel: 'B2', variantes: '«forbad», hoy en desuso' },
  shine:  { ps: 'shone',   pp: 'shone',     es: 'brillar',            nivel: 'B2', variantes: '«shined» solo con el sentido transitivo de sacar brillo' },
};

/**
 * Verbos que el bloque educativo manda practicar EN UN NIVEL CONCRETO del quiz.
 * Salen de las semanas 1 a 4 del «Plan de 30 días» y del consejo de la FAQ sobre los pares
 * confundidos.
 *
 * Hasta el 25/08/2026 esta tabla listaba 21 verbos, de los que **10 no existían en el banco**
 * (hit, let, set, shut, burst, cost, become, overcome, lie, raise) y 6 estaban en otro nivel:
 * quien seguía el plan al pie de la letra practicaba donde esos verbos no salen nunca
 * (hallazgo 314). El plan se reescribió contra el banco real y esta tabla lo refleja.
 */
const VERBOS_QUE_EL_PLAN_MANDA_PRACTICAR: { verbo: string; nivelQuePideElPlan: string; donde: string }[] = [
  // Semana 1 — A-A-A. El plan ya no manda un nivel concreto para estos, porque están
  // repartidos: dice «practica en el nivel Completo». Lo que sí afirma es dónde está cada uno.
  { verbo: 'put',   nivelQuePideElPlan: 'A2', donde: 'Semana 1 (A-A-A), «put (A2)»' },
  { verbo: 'cut',   nivelQuePideElPlan: 'B1', donde: 'Semana 1 (A-A-A), «cut y hurt (B1)»' },
  { verbo: 'hurt',  nivelQuePideElPlan: 'B1', donde: 'Semana 1 (A-A-A), «cut y hurt (B1)»' },
  { verbo: 'read',  nivelQuePideElPlan: 'A2', donde: 'Semana 1 (A-A-A), «read (A2)»' },
  // Semana 2 — A-B-B, «los de A1 y A2 … practica en A2»
  { verbo: 'think', nivelQuePideElPlan: 'A1', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'buy',   nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'bring', nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'keep',  nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'feel',  nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'leave', nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'meet',  nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'sleep', nivelQuePideElPlan: 'A2', donde: 'Semana 2 (A-B-B), grupo de A1 y A2' },
  { verbo: 'sell',  nivelQuePideElPlan: 'B1', donde: 'Semana 2 (A-B-B), «pasa a B1 para…»' },
  { verbo: 'teach', nivelQuePideElPlan: 'B1', donde: 'Semana 2 (A-B-B), «pasa a B1 para…»' },
  { verbo: 'send',  nivelQuePideElPlan: 'B1', donde: 'Semana 2 (A-B-B), «pasa a B1 para…»' },
  { verbo: 'pay',   nivelQuePideElPlan: 'B1', donde: 'Semana 2 (A-B-B), «pasa a B1 para…»' },
  { verbo: 'build', nivelQuePideElPlan: 'B1', donde: 'Semana 2 (A-B-B), «pasa a B1 para…»' },
  // Días 15-17 — A-B-A
  { verbo: 'come',  nivelQuePideElPlan: 'A1', donde: 'Días 15-17 (A-B-A), «come/came/come (A1)»' },
  { verbo: 'run',   nivelQuePideElPlan: 'A2', donde: 'Días 15-17 (A-B-A), «run/ran/run (A2)»' },
  // Días 18-24 — A-B-C, «empieza por los de A1 … luego el A2»
  { verbo: 'be',    nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'go',    nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'do',    nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'see',   nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'take',  nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'give',  nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'know',  nivelQuePideElPlan: 'A1', donde: 'Días 18-24 (A-B-C), grupo de A1' },
  { verbo: 'write', nivelQuePideElPlan: 'A2', donde: 'Días 18-24 (A-B-C), grupo de A2' },
  { verbo: 'eat',   nivelQuePideElPlan: 'A2', donde: 'Días 18-24 (A-B-C), grupo de A2' },
  { verbo: 'drink', nivelQuePideElPlan: 'A2', donde: 'Días 18-24 (A-B-C), grupo de A2' },
  { verbo: 'speak', nivelQuePideElPlan: 'A2', donde: 'Días 18-24 (A-B-C), grupo de A2' },
  { verbo: 'drive', nivelQuePideElPlan: 'A2', donde: 'Días 18-24 (A-B-C), grupo de A2' },
  // FAQ y escenario de examen oficial — los pares confundidos que SÍ están
  { verbo: 'lay',   nivelQuePideElPlan: 'B2', donde: 'FAQ y escenario de examen, pares confundidos' },
  { verbo: 'rise',  nivelQuePideElPlan: 'B2', donde: 'FAQ y escenario de examen, pares confundidos' },
  { verbo: 'lead',  nivelQuePideElPlan: 'B2', donde: 'FAQ y escenario de examen, pares confundidos' },
  { verbo: 'feed',  nivelQuePideElPlan: 'B2', donde: 'FAQ y escenario de examen, pares confundidos' },
  { verbo: 'fall',  nivelQuePideElPlan: 'B1', donde: 'FAQ, «fall en B1»' },
  { verbo: 'find',  nivelQuePideElPlan: 'A1', donde: 'FAQ, «find en A1»' },
];

/**
 * Parejas regulares que la FAQ nombra para contrastar y que NO están en el banco, porque no
 * son verbos irregulares. La FAQ tiene que decirlo, o vuelve el hallazgo 314 por la puerta
 * de atrás: mandar practicar en el quiz algo que el quiz no tiene.
 */
const PAREJAS_REGULARES_QUE_LA_FAQ_NOMBRA = ['lie', 'raise', 'found'];

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
  // `exact`: desde el 25/08/2026 el botón de empezar también dice «— 15 preguntas», porque
  // ahora anuncia el tamaño REAL de la partida y no el pedido (hallazgo 312).
  await page.getByRole('button', { name: `${numPreguntas} preguntas`, exact: true }).click();
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

      // Lo que se pregunta es SIEMPRE el past simple; el participio nunca se pregunta. En
      // «be» el enunciado añade además la persona, porque ahí la forma depende de ella.
      await expect(page.locator('[class*="preguntaEtiqueta"]')).toHaveText(
        infinitivo === 'be' ? '¿Cuál es el Past Simple (con I, he, she, it) de...?' : '¿Cuál es el Past Simple de...?',
      );
      await expect(page.getByText(`Pregunta ${i} de 10`)).toBeVisible();
      expect((await hud(page)).progreso).toBe(`${i}/10`);

      const opciones = await opcionesVisibles(page);
      expect(opciones, `Q${i} (${infinitivo}) debe ofrecer 4 opciones`).toHaveLength(4);
      expect(new Set(opciones).size, `Q${i} repite alguna opción: ${opciones.join(', ')}`).toBe(4);
      const buena = respuestaQueSePregunta(infinitivo);
      expect(opciones, `Q${i}: «${buena}» no está entre las ofrecidas`).toContain(buena);

      const acierta = i <= 7;
      const elegida = acierta ? buena : opciones.find((o) => o !== buena)!;
      await pulsarOpcion(page, elegida);

      await expect(feedback(page)).toContainText(acierta ? '¡Correcto!' : 'Incorrecto');
      // La conjugación completa que enseña el banner es la del canon, acierte o falle — y
      // «completa» incluye el segundo participio donde el inglés admite dos (hallazgo 315).
      const conjugacion = (await page.locator('[class*="conjugacion"]').textContent())!.replace(/\s+/g, ' ').trim();
      const ppEsperado = canon.ppAlt ? `${canon.pp} / ${canon.ppAlt}` : canon.pp;
      expect(conjugacion).toBe(`${infinitivo}→${canon.ps}→${ppEsperado}`);
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
      await pulsarOpcion(page, opciones.find((o) => o !== respuestaQueSePregunta(infinitivo))!);

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
    const correcta = respuestaQueSePregunta(infinitivo);
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
      await pulsarOpcion(page, respuestaQueSePregunta(inf));
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

  // ═══════════ REGRESIÓN de los hallazgos del 25/08/2026, reparados ese día ═══════════

  /**
   * 311 (cálculo) — la «Precisión» del HUD pasaba del 100 % mientras se lee el feedback,
   * que es justo cuando se mira la pantalla. Era `correctas / preguntaActual`: al contestar
   * la pregunta i el numerador ya incluía esa respuesta y el denominador todavía no.
   * Acertando las dos primeras se veía 200 %; y con la primera fallada y la segunda
   * acertada, 100 % cuando la precisión real era 50 %.
   */
  test('311 · la precisión del HUD nunca pasa del 100 %', async ({ page }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, 'A1 Básico', 10);

    for (let i = 1; i <= 3; i++) {
      const inf = (await verboEnPantalla(page).textContent())!.trim();
      await pulsarOpcion(page, respuestaQueSePregunta(inf));
      const { precision } = await hud(page);
      expect(precision, `tras acertar ${i} de ${i} la precisión tiene que ser 100 %`).toBe('100%');
      await botonSiguiente(page).click();
    }
  });

  /**
   * 311b — el otro lado del mismo defecto, que el acta describe y el test de arriba no puede
   * ver: fallando la primera y acertando la segunda mostraba 100 %, no 50 %.
   */
  test('311b · con una fallada y una acertada la precisión es del 50 %, no del 100 %', async ({ page }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, 'A1 Básico', 10);

    // Primera: se falla a propósito eligiendo una opción que no es la buena.
    const primero = (await verboEnPantalla(page).textContent())!.trim();
    const ops = await opcionesVisibles(page);
    const incorrecta = ops.find((o) => o !== respuestaQueSePregunta(primero))!;
    await pulsarOpcion(page, incorrecta);
    expect((await hud(page)).precision, 'tras fallar la primera').toBe('0%');
    await botonSiguiente(page).click();

    // Segunda: se acierta.
    const segundo = (await verboEnPantalla(page).textContent())!.trim();
    await pulsarOpcion(page, respuestaQueSePregunta(segundo));
    expect((await hud(page)).precision, '1 de 2 es el 50 %').toBe('50%');
  });

  /**
   * HALLAZGO 2 (operativa) — A1 solo tiene 15 verbos, así que pedir 20 preguntas sirve 15.
   * El truncado (Math.min en generarPreguntas) es correcto; lo que falla es que el botón
   * sigue prometiendo «20 preguntas» y en ningún sitio se avisa de que el nivel no da para tanto.
   */
  test('312 · pedir más preguntas que verbos tiene el nivel avisa antes de empezar', async ({ page }) => {
    await page.goto(RUTA);
    await page.locator('[class*="nivelBtn"]').filter({ hasText: 'A1 Básico' }).click();
    await page.getByRole('button', { name: '20 preguntas' }).click();

    // El rótulo dice la verdad: A1 tiene 15 verbos, así que la partida es de 15.
    const rotulo = (await page.getByRole('button', { name: /^Empezar Quiz/ }).textContent())!;
    expect(rotulo, `el botón sigue prometiendo de más: «${rotulo.trim()}»`).toMatch(/15 preguntas/);

    // Y además hay un aviso visible que explica por qué.
    await expect(page.locator('[class*="avisoNivel"]')).toContainText('15 verbos');

    // Y lo que se sirve es lo que se anuncia.
    await page.getByRole('button', { name: /^Empezar Quiz/ }).click();
    expect((await hud(page)).progreso).toBe('1/15');
  });

  /**
   * HALLAZGO 3 (contenido) — el FAQPage del JSON-LD, que es lo que leen Google, Bing y los
   * asistentes de IA, dice que el quiz «pide seleccionar la forma correcta de Past Simple o
   * Past Participle». El quiz solo pregunta el Past Simple: generarPreguntas usa
   * `verbo.pastSimple` como respuesta y como pool de distractores, y el rótulo de la
   * pregunta es fijo.
   */
  test('313 · el JSON-LD no promete preguntas de Past Participle', async ({ page }) => {
    await page.goto(RUTA);

    // El rótulo de la pregunta es fijo: nunca se pide el participio
    await arrancarPartida(page, 'A1 Básico', 10);
    await expect(page.getByText(/¿Cuál es el Past Simple.*de\.\.\.\?/)).toBeVisible();
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
  test('314 · los verbos que el plan educativo manda practicar están en el nivel que dice', async () => {
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
   * 314b — el contrapunto: las parejas regulares que la FAQ nombra para contrastar (lie,
   * raise, found) NO están en el banco porque no son irregulares, y la FAQ tiene que decirlo
   * en vez de mandar practicarlas aquí.
   */
  test('314b · la FAQ avisa de que las parejas regulares no entran en el quiz', async ({ page }) => {
    const enBanco = new Set(verbosIrregulares.map((v) => v.infinitive));
    for (const verbo of PAREJAS_REGULARES_QUE_LA_FAQ_NOMBRA) {
      expect(enBanco.has(verbo), `«${verbo}» es regular y no debería estar en el banco`).toBe(false);
    }

    await page.goto(RUTA);
    const educativo = page.locator('[class*="faqItem"]').filter({ hasText: /más confundidos en el B2/ });
    await expect(educativo).toContainText('no entran');
    await expect(educativo).toContainText('no son irregulares');
  });

  /**
   * HALLAZGO 5 (accesibilidad) — `npm run check:a11y-jsx` señala 10 incumplimientos en
   * page.tsx: los 6 <button> de la app sin `type="button"` y 3 emojis pegados al texto sin
   * `aria-hidden` (el 📝 del H1 y los rótulos «🔄 Jugar de nuevo» y «⚙️ Cambiar nivel»).
   * Es pasivo anterior al candado, que solo juzga las líneas que un commit añade.
   */
  test('317 · todos los botones llevan type="button"', async ({ page }) => {
    await page.goto(RUTA);
    const sinType = await page
      .locator('[class*="configPanel"] button, [class*="opcionesGrid"] button, [class*="botonesResultado"] button')
      .evaluateAll((bs) => bs.filter((b) => !b.getAttribute('type')).map((b) => (b.textContent ?? '').trim().slice(0, 40)));
    expect(sinType, `botones sin type="button": ${sinType.join(' · ')}`).toEqual([]);
  });

  /**
   * 315 (contenido) — el banner de feedback enseña «la conjugación completa» y en los verbos
   * que admiten dos participios enseñaba uno solo: «get → got → got», contradiciendo a la
   * propia caja de avisos de la app («algunos verbos admiten dos participios correctos:
   * got/gotten…») y a su tabla de patrones, que escribe «get/got/got(ten)».
   */
  test('315 · la conjugación del banner incluye el segundo participio donde lo hay', async ({ page }) => {
    await page.goto(RUTA);
    // «get» es A1, así que una partida de A1 con las 15 preguntas lo recorre seguro.
    await arrancarPartida(page, 'A1 Básico', 15);

    let vistoGet = false;
    for (let i = 0; i < 15; i++) {
      const inf = (await verboEnPantalla(page).textContent())!.trim();
      await pulsarOpcion(page, respuestaQueSePregunta(inf));
      if (inf === 'get') {
        vistoGet = true;
        const conjugacion = (await page.locator('[class*="conjugacion"]').innerText()).replace(/\s+/g, ' ');
        expect(conjugacion, 'la conjugación de «get» omite el participio americano').toContain('gotten');
        expect(conjugacion).toContain('AmE');
      }
      const boton = botonSiguiente(page);
      if (/Ver resultados/.test((await boton.textContent()) ?? '')) { await boton.click(); break; }
      await boton.click();
    }
    expect(vistoGet, 'la partida de A1 con 15 preguntas debería recorrer los 15 verbos, «get» incluido').toBe(true);
  });

  /**
   * 316 (contenido) — dos de las 75 respuestas se identificaban por su FORMA, sin saber el
   * verbo: «showed» era el único past simple acabado en -ed de todo el banco (show es
   * irregular solo en el participio) y «was / were» el único con barra. Cuando cualquiera de
   * los dos era la respuesta, se acertaba gratis; cuando salía de distractor, se descartaba
   * igual de gratis — y «was / were» salió de distractor en 5 de 10 preguntas de la partida
   * de prueba del Inspector.
   */
  test('316 · ninguna respuesta se reconoce por su forma sin saber el verbo', async ({ page }) => {
    // «show» queda fuera del sorteo: su past simple es regular y no enseña nada aquí.
    const preguntables = verbosIrregulares.filter((v) => !v.pastSimpleRegular);
    expect(preguntables.map((v) => v.infinitive)).not.toContain('show');
    // Regular = infinitivo + -ed. No vale «acaba en ed» a secas: «fed» y «led» acaban así y
    // son irregulares de manual, y «heard» es infinitivo+d pero cambia la pronunciación.
    // El único de los 75 que forma su pasado con la regla es «show».
    const regulares = preguntables.filter((v) => v.pastSimple === `${v.infinitive}ed`);
    expect(regulares.map((v) => v.infinitive), 'sigue habiendo un past simple regular').toEqual([]);
    expect(preguntables.map((v) => v.pastSimple), 'showed sigue pudiendo salir de distractor').not.toContain('showed');

    // Y de «be» se pregunta la forma de singular, no «was / were».
    await page.goto(RUTA);
    await arrancarPartida(page, 'A1 Básico', 15);
    for (let i = 0; i < 15; i++) {
      const inf = (await verboEnPantalla(page).textContent())!.trim();
      const ops = await opcionesVisibles(page);
      expect(ops.filter((o) => o.includes('/')), `«${inf}»: una opción con barra delata la respuesta`).toEqual([]);
      if (inf === 'be') {
        await expect(page.locator('[class*="preguntaEtiqueta"]')).toContainText('con I, he, she, it');
        await pulsarOpcion(page, 'was');
        expect((await hud(page)).correctas, '«was» tiene que contar como acierto en «be»').not.toBe('0');
      } else {
        await pulsarOpcion(page, respuestaQueSePregunta(inf));
      }
      const boton = botonSiguiente(page);
      if (/Ver resultados/.test((await boton.textContent()) ?? '')) { await boton.click(); break; }
      await boton.click();
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Inspector 25/09/2026 — re-inspección (la anterior, 25/08/2026: hallazgos 311-317)
// ═════════════════════════════════════════════════════════════════════════════
//
// DE DÓNDE SALEN LOS VALORES ESPERADOS DE ESTA SECCIÓN
// · Las formas verbales: el CANON de arriba, que el 25/09/2026 se volvió a cotejar verbo a
//   verbo contra la tabla «Verb Forms» de Oxford Learner's Dictionaries (75 de 75 coinciden en
//   past simple y past participle) y contra Cambridge Dictionary en los que tienen variante:
//   get «got or US usually gotten», wake «woke or waked / woken or waked», shine «shone or
//   shined», lie (yacer) «lay / lain».
// · La puntuación: calcularPuntuacion() de page.tsx, resuelta a mano en cada caso.
// · La precisión del HUD: round(correctas / respondidas · 100), la fórmula reparada en el 311.
// · Los porcentajes se comprueban por su CIFRA con `pct()`, que admite «80%», «80 %» y
//   «80 %»: el formato del % tiene su propio caso (hallazgo de formato, abajo), y así estos
//   casos no se rompen el día que se repare.
//
// Los casos que expresan lo CORRECTO y hoy fallan por un hallazgo llevan test.fail() y un
// comentario «HALLAZGO [severidad] (Inspector 25/09/2026)»; se comprobó que cada uno falla en
// la aserción que vigila y no en el montaje.

/** Normaliza espacios (incluido el duro) para comparar textos. */
const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

/** Casa una cifra de porcentaje con el % pegado, con espacio o con espacio duro. */
const pct = (n: number): RegExp => new RegExp(`^${n}[  ]?%$`);

/** Primer grupo de `re` en `texto`, o cadena vacía. */
const grupo = (texto: string, re: RegExp): string => texto.match(re)?.[1] ?? '';

/** Past simples que el quiz PREGUNTA en un nivel (show sale del sorteo, hallazgo 316). */
function pasadosDelNivel(nivel: string): string[] {
  return Object.entries(CANON)
    .filter(([inf, c]) => c.nivel === nivel && inf !== 'show')
    .map(([inf]) => respuestaQueSePregunta(inf));
}

/** Abre la app sin el aviso fijo de transparencia, con el tema pedido y ya hidratada. */
async function abrirHidratada(page: Page, tema?: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      if (t) localStorage.setItem('meskeia-theme', t);
    } catch {
      /* sin almacenamiento: saldrá el aviso y el tema del sistema */
    }
  }, tema ?? null);
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz Verbos Irregulares');
  // La app no tiene inputs (solo botones): la espera que vale es la de la página confirmada.
  await esperarPaginaAsentada(page);
  if (tema) await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

/** Botón de la opción cuyo texto es `texto` (se lee del aria-label, «Opción X: texto»). */
async function botonDeOpcion(page: Page, texto: string): Promise<Locator> {
  const i = (await opcionesVisibles(page)).indexOf(texto);
  expect(i, `no hay ninguna opción «${texto}»`).toBeGreaterThanOrEqual(0);
  return page.locator('[class*="opcionesGrid"] button').nth(i);
}

/** Contesta bien todas las preguntas que queden y pulsa «Ver resultados». */
async function acertarHastaElFinal(page: Page): Promise<void> {
  for (let i = 0; i < 25; i++) {
    const inf = norm(await verboEnPantalla(page).textContent());
    await pulsarOpcion(page, respuestaQueSePregunta(inf));
    const boton = botonSiguiente(page);
    const ultima = /Ver resultados/.test((await boton.textContent()) ?? '');
    await boton.click();
    if (ultima) break;
  }
  await expect(page.locator('[class*="resultadoPanel"]')).toBeVisible();
}

/**
 * Contraste WCAG del texto de `loc` contra su fondo REAL: compone los fondos
 * semitransparentes de los antecesores hasta dar con uno opaco. (Mismo cálculo que
 * quiz-biologia-molecular.spec.ts; no vale para fondos con degradado.)
 */
async function contraste(loc: Locator): Promise<number> {
  return loc.evaluate((el) => {
    const leer = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    const sobre = (f: number[], b: number[]): number[] => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(leer(getComputedStyle(el).color), fondo);
    const lum = (c: number[]): number => {
      const f = (v: number): number => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const a = lum(texto);
    const b = lum(fondo);
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  });
}

test.describe('Inspector 25/09/2026', () => {
  /**
   * CASO NORMAL — B2 con 10 preguntas: las 8 primeras bien y las 2 últimas mal.
   *
   * Resuelto a mano ANTES de ejecutar:
   *   · B2 tiene 20 verbos, todos preguntables → la partida es de 10, sin aviso, y el botón
   *     dice «Empezar Quiz — 10 preguntas · Nivel B2».
   *   · Los 10 infinitivos son de B2 (CANON) y distintos; las 4 opciones de cada pregunta son
   *     past simples de B2: los distractores salen del mismo nivel (poolRespuestas).
   *   · Precisión tras cada respuesta: 1-8 → 100 % · tras la 9.ª (8 de 9) → round(88,89) = 89 %
   *     · tras la 10.ª (8 de 10) → 80 %.
   *   · 8/10 = 0,8 → rama «≥ 0,7» de calcularPuntuacion: 60 + (0,8 − 0,7)/0,2 · 40 = 60 + 20 =
   *     80 pts · getResultadoTexto(0,8) → «¡Muy buena puntuación!» · «8 de 10 respuestas
   *     correctas» · «8/10» · acierto round(80) = 80 %.
   */
  test('caso normal · B2, 8 bien y 2 mal: HUD 89 % y 80 %, 80 pts y distractores del mismo nivel', async ({ page }) => {
    await abrirHidratada(page);
    await page.locator('[class*="nivelBtn"]').filter({ hasText: 'B2 Avanzado' }).click();
    await page.getByRole('button', { name: '10 preguntas', exact: true }).click();
    await expect(page.locator('[class*="btnIniciar"]')).toHaveText('Empezar Quiz — 10 preguntas · Nivel B2');
    await expect(page.locator('[class*="avisoNivel"]')).toHaveCount(0);
    await page.locator('[class*="btnIniciar"]').click();

    const pasadosB2 = new Set(pasadosDelNivel('B2'));
    const precisionTras = [100, 100, 100, 100, 100, 100, 100, 100, 89, 80];
    const vistos: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const inf = norm(await verboEnPantalla(page).textContent());
      vistos.push(inf);
      expect(CANON[inf]?.nivel, `«${inf}» ha salido en una partida de B2`).toBe('B2');

      const ops = await opcionesVisibles(page);
      expect(new Set(ops).size, `Q${i}: ${ops.join(', ')}`).toBe(4);
      const buena = respuestaQueSePregunta(inf);
      expect(ops).toContain(buena);
      for (const o of ops) expect(pasadosB2.has(o), `Q${i} (${inf}): «${o}» no es un past simple de B2`).toBe(true);

      const acierta = i <= 8;
      await pulsarOpcion(page, acierta ? buena : ops.find((o) => o !== buena)!);
      await expect(feedback(page)).toContainText(acierta ? '¡Correcto!' : 'Incorrecto');

      const canon = CANON[inf];
      const pp = canon.ppAlt ? `${canon.pp} / ${canon.ppAlt}` : canon.pp;
      expect(norm(await page.locator('[class*="conjugacion"]').textContent())).toBe(`${inf}→${canon.ps}→${pp}`);

      const h = await hud(page);
      expect(h.progreso).toBe(`${i}/10`);
      expect(h.correctas).toBe(String(Math.min(i, 8)));
      expect(h.precision, `precisión tras la ${i}.ª`).toMatch(pct(precisionTras[i - 1]));
      await botonSiguiente(page).click();
    }

    expect(new Set(vistos).size, `verbo repetido: ${vistos.join(', ')}`).toBe(10);
    await expect(page.locator('[class*="resultadoPuntos"]')).toHaveText('80 pts');
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('¡Muy buena puntuación!');
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toHaveText('8 de 10 respuestas correctas');
    const valores = (await page.locator('[class*="statRValor"]').allTextContents()).map(norm);
    expect(valores[0]).toBe('8/10');
    expect(valores[1]).toMatch(pct(80));
  });

  /**
   * CASO LÍMITE — el único nivel cuyo banco preguntable es MENOR que su tamaño: B1 tiene 20
   * verbos, pero `show` sale del sorteo (hallazgo 316), así que quedan 19. Se piden 20.
   *
   * Resuelto a mano ANTES de ejecutar:
   *   · min(20, 19) = 19 → botón «Empezar Quiz — 19 preguntas · Nivel B1» y aviso que habla
   *     de 19 preguntas; el HUD arranca en «1/19».
   *   · Las 19 preguntas son los 20 de B1 menos show, cada uno una vez; «showed» no sale nunca.
   *   · Acertándolas todas: precisión 100 % en cada una · 19/19 = 1 ≥ 0,9 → 100 pts ·
   *     «¡Dominas el inglés!» · «19 de 19 respuestas correctas» · «19/19» · 100 %.
   */
  test('caso límite · B1 pidiendo 20 sirve 19 (show fuera) y 19 de 19 dan 100 pts', async ({ page }) => {
    test.setTimeout(60_000);
    await abrirHidratada(page);
    await page.locator('[class*="nivelBtn"]').filter({ hasText: 'B1 Intermedio' }).click();
    await page.getByRole('button', { name: '20 preguntas', exact: true }).click();
    await expect(page.locator('[class*="btnIniciar"]')).toHaveText('Empezar Quiz — 19 preguntas · Nivel B1');
    await expect(page.locator('[class*="avisoNivel"]')).toContainText('la partida será de 19 preguntas');
    await page.locator('[class*="btnIniciar"]').click();

    const vistos: string[] = [];
    for (let i = 1; i <= 19; i++) {
      const inf = norm(await verboEnPantalla(page).textContent());
      vistos.push(inf);
      const ops = await opcionesVisibles(page);
      expect(ops, `Q${i}: «showed» ha salido de opción`).not.toContain('showed');
      await pulsarOpcion(page, respuestaQueSePregunta(inf));
      await expect(feedback(page)).toContainText('¡Correcto!');
      const h = await hud(page);
      expect(h.progreso).toBe(`${i}/19`);
      expect(h.correctas).toBe(String(i));
      expect(h.precision).toMatch(pct(100));
      await expect(botonSiguiente(page)).toHaveText(i < 19 ? 'Siguiente pregunta →' : 'Ver resultados');
      await botonSiguiente(page).click();
    }

    const b1SinShow = Object.entries(CANON).filter(([inf, c]) => c.nivel === 'B1' && inf !== 'show').map(([inf]) => inf).sort();
    expect(b1SinShow).toHaveLength(19);
    expect(vistos.slice().sort()).toEqual(b1SinShow);

    await expect(page.locator('[class*="resultadoPuntos"]')).toHaveText('100 pts');
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('¡Dominas el inglés!');
    await expect(page.locator('[class*="resultadoSubtitulo"]')).toHaveText('19 de 19 respuestas correctas');
    const valores = (await page.locator('[class*="statRValor"]').allTextContents()).map(norm);
    expect(valores[0]).toBe('19/19');
    expect(valores[1]).toMatch(pct(100));
  });

  /**
   * CASO DE RECHAZO — el doble clic, que es lo que hace mucha gente en un botón.
   *
   * Resuelto a mano ANTES de ejecutar (guardián `if (seleccionada !== null) return` en
   * responder() y `disabled` en las opciones; «Siguiente» se desmonta al primer clic):
   *   · doble clic en la opción BUENA de la 1.ª → cuenta una vez: 1 acierto, 1/10, 100 %.
   *   · doble clic en «Siguiente pregunta →» → avanza UNA pregunta: «2/10», no «3/10», y el
   *     segundo clic no contesta la pregunta nueva (sin veredicto, 4 opciones habilitadas).
   *   · fallar la 2.ª → 1 acierto de 2 respondidas → precisión round(50) = 50 %.
   */
  test('caso de rechazo · un doble clic en la opción cuenta una vez y uno en «Siguiente» avanza una sola pregunta', async ({ page }) => {
    await abrirHidratada(page);
    await arrancarPartida(page, 'A2 Elemental', 10);

    const inf1 = norm(await verboEnPantalla(page).textContent());
    await (await botonDeOpcion(page, respuestaQueSePregunta(inf1))).dblclick();
    await expect(feedback(page)).toContainText('¡Correcto!');
    let h = await hud(page);
    expect(h.progreso).toBe('1/10');
    expect(h.correctas, 'el doble clic ha sumado dos aciertos').toBe('1');
    expect(h.precision).toMatch(pct(100));

    await botonSiguiente(page).dblclick();
    await expect(page.getByText('Pregunta 2 de 10', { exact: true })).toBeVisible();
    h = await hud(page);
    expect(h.progreso, 'el doble clic en «Siguiente» se ha saltado una pregunta').toBe('2/10');
    expect(h.correctas).toBe('1');
    await expect(feedback(page), 'el segundo clic ha contestado la pregunta nueva').toHaveCount(0);
    const opciones = page.locator('[class*="opcionesGrid"] button');
    for (let i = 0; i < 4; i++) await expect(opciones.nth(i)).toBeEnabled();

    const inf2 = norm(await verboEnPantalla(page).textContent());
    await pulsarOpcion(page, (await opcionesVisibles(page)).find((o) => o !== respuestaQueSePregunta(inf2))!);
    await expect(feedback(page)).toContainText('Incorrecto');
    h = await hud(page);
    expect(h.correctas).toBe('1');
    expect(h.precision, '1 de 2 respondidas').toMatch(pct(50));
  });

  /**
   * SOSPECHA (c) DESCARTADA — ¿se barajan las opciones? En quiz-biologia-molecular la correcta
   * caía en la C 19 de cada 30. Aquí generarOpciones() pasa la correcta y 3 distractores por
   * el Fisher-Yates de mezclar(): medido el 25/09/2026 en 100 preguntas, A 21 · B 22 · C 28 ·
   * D 29 (χ² = 2,0 con 3 g.l., p ≈ 0,57: compatible con el reparto uniforme).
   *
   * Umbral, no aleatorio-frágil: 60 preguntas (3 partidas de 20 en «Todos»). Con reparto
   * uniforme cada letra es Binomial(60, 1/4), media 15 y desviación 3,35. Se exige que cada
   * letra quede entre 3 y 30: P(X ≥ 31) = 8,4·10⁻⁶ y P(X ≤ 2) = 6,9·10⁻⁶ por letra, así que la
   * probabilidad de un falso rojo es < 6,2·10⁻⁵ por corrida (1 de cada ~16.000). Y si la
   * correcta cayera en una letra el 63 % de las veces, como en biología, el caso lo vería en
   * el 97 % de las corridas.
   */
  test('sospecha (c) descartada · la correcta no se concentra en una letra (60 preguntas, cada letra entre 3 y 30)', async ({ page }) => {
    test.setTimeout(120_000);
    await abrirHidratada(page);
    const cuenta = [0, 0, 0, 0];
    for (let partida = 0; partida < 3; partida++) {
      if (partida === 0) await arrancarPartida(page, 'Todos los niveles', 20);
      else await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
      for (let i = 1; i <= 20; i++) {
        await expect(page.getByText(`Pregunta ${i} de 20`, { exact: true })).toBeVisible();
        const inf = norm(await verboEnPantalla(page).textContent());
        const ops = await opcionesVisibles(page);
        const pos = ops.indexOf(respuestaQueSePregunta(inf));
        expect(pos, `«${inf}»: la buena no está entre ${ops.join(', ')}`).toBeGreaterThanOrEqual(0);
        cuenta[pos]++;
        await page.locator('[class*="opcionesGrid"] button').nth(pos).click();
        await botonSiguiente(page).click();
      }
    }
    expect(cuenta.reduce((a, b) => a + b)).toBe(60);
    for (let l = 0; l < 4; l++) {
      expect(cuenta[l], `la correcta cae en la ${'ABCD'[l]} ${cuenta[l]} de 60 veces (A-D: ${cuenta.join('/')})`).toBeGreaterThanOrEqual(3);
      expect(cuenta[l], `la correcta cae en la ${'ABCD'[l]} ${cuenta[l]} de 60 veces (A-D: ${cuenta.join('/')})`).toBeLessThanOrEqual(30);
    }
  });

  /**
   * SOSPECHA (e) DESCARTADA — ¿una regla oscura genérica pisa el verde/rojo de la correcta y
   * la fallada (el hallazgo 1674 de quiz-biologia-molecular)? Aquí no hay regla oscura sobre
   * `.opcion`; `.opcionCorrecta` y `.opcionIncorrecta` llevan !important y su variante oscura.
   * Medido el 25/09/2026 en oscuro: correcta borde rgb(72,187,120) y texto rgb(104,211,145);
   * fallada borde y texto rgb(252,129,129); neutras con opacidad 0,4. Se afirma sin fijar los
   * valores (una reparación de contraste puede moverlos): verde en la correcta, rojo en la
   * fallada, distintas entre sí y de una neutra.
   */
  test('sospecha (e) descartada · en oscuro la correcta y la fallada se distinguen entre sí y de una neutra', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrirHidratada(page, 'dark');
    await arrancarPartida(page, 'A1 Básico', 10);
    const inf = norm(await verboEnPantalla(page).textContent());
    const ops = await opcionesVisibles(page);
    const iBuena = ops.indexOf(respuestaQueSePregunta(inf));
    const iMala = iBuena === 0 ? 1 : 0;
    const iNeutra = [0, 1, 2, 3].find((i) => i !== iBuena && i !== iMala)!;
    await page.locator('[class*="opcionesGrid"] button').nth(iMala).click();
    await expect(feedback(page)).toContainText('Incorrecto');
    await page.mouse.move(0, 0);

    const pintura = (i: number) =>
      page.locator('[class*="opcionesGrid"] button').nth(i).evaluate((b) => {
        const cs = getComputedStyle(b);
        const rgb = (c: string): number[] => (c.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
        return { borde: rgb(cs.borderTopColor), fondo: cs.backgroundColor, texto: rgb(cs.color), opacidad: cs.opacity };
      });
    // globals.css anima colores: se sondea hasta que la correcta tenga ya su borde verde.
    await expect.poll(async () => { const p = await pintura(iBuena); return p.borde[1] > p.borde[0]; }).toBe(true);
    const buena = await pintura(iBuena);
    const mala = await pintura(iMala);
    const neutra = await pintura(iNeutra);
    expect(buena.borde[1], 'borde de la correcta: verde').toBeGreaterThan(buena.borde[0]);
    expect(buena.texto[1], 'texto de la correcta: verde').toBeGreaterThan(buena.texto[0]);
    expect(mala.borde[0], 'borde de la fallada: rojo').toBeGreaterThan(mala.borde[1]);
    expect(mala.texto[0], 'texto de la fallada: rojo').toBeGreaterThan(mala.texto[1]);
    expect(buena.fondo).not.toBe(mala.fondo);
    expect(buena.borde).not.toEqual(neutra.borde);
    expect(mala.borde).not.toEqual(neutra.borde);
    expect(buena.opacidad).toBe('1');
    expect(mala.opacidad).toBe('1');
  });

  // ───────────────────────────── HALLAZGOS ─────────────────────────────

  /**
   * HALLAZGO medio (Inspector 25/09/2026) · accesibilidad — sospecha (a) CONFIRMADA.
   * Con el teclado: se contesta con Enter, un Tab lleva a «Siguiente pregunta →» y Enter.
   * El botón se desmonta y el foco cae a <body>; el primer Tab va a «⬇️ Ver Guía Completa»,
   * DEBAJO del quiz, y hacen falta cuatro Shift+Tab para volver a la opción A. En cada
   * transición. (Tras «Ver resultados» el foco también cae a <body> y la nota no se anuncia.)
   * DEBERÍA: tras avanzar, el foco no está en <body> y el primer Tab cae en la pregunta nueva
   * (el patrón reparado hoy en quiz-literatura-universal y quiz-biologia-molecular).
   */
  test('hallazgo · tras «Siguiente pregunta» con el teclado el foco no cae a <body> y el Tab entra en la pregunta nueva', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026): foco en BODY y el Tab va a «Ver Guía Completa»
    await abrirHidratada(page);
    await arrancarPartida(page, 'A1 Básico', 10);
    const inf = norm(await verboEnPantalla(page).textContent());
    await (await botonDeOpcion(page, respuestaQueSePregunta(inf))).focus();
    await page.keyboard.press('Enter');
    await expect(feedback(page)).toContainText('¡Correcto!');
    // Hoy hace falta un Tab para llegar a «Siguiente»; si la reparación lleva el foco allí sola,
    // no se pulsa (lo pasaría de largo).
    if (!(await botonSiguiente(page).evaluate((b) => b === document.activeElement))) await page.keyboard.press('Tab');
    await expect(botonSiguiente(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 10', { exact: true })).toBeVisible();

    const activo = await page.evaluate(() => document.activeElement?.tagName ?? 'ninguno');
    expect(activo, 'tras avanzar, el foco ha caído a <body>').not.toBe('BODY');
    await page.keyboard.press('Tab');
    const dentro = await page.evaluate(() => Boolean(document.activeElement?.closest('[class*="preguntaCard"], [class*="opcionesGrid"]')));
    expect(dentro, 'el primer Tab tras avanzar no cae en la pregunta nueva').toBe(true);
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) · accesibilidad — sospecha (d) CONFIRMADA.
   * El módulo redefine `--primary: #2E86AB` en `.container` para los DOS temas, y los botones
   * de acción ponen blanco encima: 4,11:1 (< 4,5:1 de WCAG 1.4.3 para texto de 14-17,6 px).
   * Medido el 25/09/2026, igual en claro y en oscuro: «Empezar Quiz» (17,6 px 700), nivel
   * activo (15,2 px 700), «N preguntas» activo (14,4 px 600), «Siguiente pregunta →» (16 px
   * 600), «Jugar de nuevo» (16 px 600) y los números de paso del plan (14,4 px 700).
   * Existe --primary-boton (#26718F): 5,47:1 con blanco en los dos temas.
   */
  test('hallazgo · el texto blanco de los botones de acción llega a 4,5:1 en los dos temas', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026): 4,11:1 en los seis, en claro y en oscuro
    test.setTimeout(90_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const medidas: Record<string, number> = {};
    for (const tema of ['light', 'dark'] as const) {
      await abrirHidratada(page, tema);
      await page.locator('[class*="nivelBtn"]').filter({ hasText: 'A1 Básico' }).click();
      await page.getByRole('button', { name: '10 preguntas', exact: true }).click();
      await page.mouse.move(0, 0);
      // `.nivelBtn` y `.pregBtn` animan `all 0.2s`: medir en el acto daba el color de partida
      // (5,74:1, gris sobre blanco) en una de dos corridas.
      await page.waitForTimeout(400);
      medidas[`${tema} · nivel activo`] = await contraste(page.locator('[class*="nivelBtn"][aria-pressed="true"] [class*="nivelLabel"]'));
      medidas[`${tema} · preguntas activo`] = await contraste(page.locator('[class*="pregBtn"][aria-pressed="true"]'));
      medidas[`${tema} · Empezar Quiz`] = await contraste(page.locator('[class*="btnIniciar"]'));
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      medidas[`${tema} · número de paso`] = await contraste(page.locator('[class*="stepNumber"]').first());
      await page.locator('[class*="btnIniciar"]').click();
      const inf = norm(await verboEnPantalla(page).textContent());
      await pulsarOpcion(page, respuestaQueSePregunta(inf));
      await page.mouse.move(0, 0);
      medidas[`${tema} · Siguiente`] = await contraste(botonSiguiente(page));
      await botonSiguiente(page).click();
      await acertarHastaElFinal(page);
      await page.mouse.move(0, 0);
      medidas[`${tema} · Jugar de nuevo`] = await contraste(page.locator('[class*="btnRejugar"]'));
    }
    const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5);
    expect(bajos, JSON.stringify(medidas)).toEqual([]);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · accesibilidad / dark mode.
   * El texto en color de marca de la guía no llega a 4,5:1 (texto de 13-16 px): en claro
   * #2E86AB da 4,11:1 sobre blanco, 3,77 en la tabla y 3,59 en la caja de errores, y el título
   * de esa caja (#C05621, 16 px 700) 3,99:1. En OSCURO es peor porque `.container` fija
   * `--primary: #2E86AB` también en ese tema y pisa el #3FA5D1 oscuro de globals.css: 3,50:1
   * en consejos, FAQ, plan y técnicas, 3,21 en la tabla y 2,74 en la caja de errores. Medido el
   * 25/09/2026. (El verbo grande, el HUD y la puntuación son texto grande: ≥ 3:1, pasan.)
   */
  test('hallazgo · el texto en color de marca de la guía llega a 4,5:1 en los dos temas', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): 3,59-4,11 en claro, 2,74-3,50 en oscuro
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const medidas: Record<string, number> = {};
    for (const tema of ['light', 'dark'] as const) {
      await abrirHidratada(page, tema);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await page.mouse.move(0, 0);
      medidas[`${tema} · consejo de escenario`] = await contraste(page.locator('[class*="escenarioTip"]').first());
      medidas[`${tema} · verbo en la tabla`] = await contraste(page.locator('[class*="comparativaTable"] td em').first());
      medidas[`${tema} · verbo en la FAQ`] = await contraste(page.locator('[class*="faqItem"] em').first());
      medidas[`${tema} · verbo en el plan`] = await contraste(page.locator('[class*="stepContent"] em').first());
      medidas[`${tema} · verbo en errores típicos`] = await contraste(page.locator('[class*="warningList"] em').first());
      medidas[`${tema} · título de errores típicos`] = await contraste(page.locator('[class*="warningHeader"] strong'));
    }
    const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5);
    expect(bajos, JSON.stringify(medidas)).toEqual([]);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · accesibilidad — la forma del 317, que se reparó en
   * NIVEL_CONFIG y no aquí: el veredicto es una cadena JS «✅ ¡Correcto!» / «❌ Incorrecto», el
   * candado check:a11y-jsx no la ve y el lector anuncia el nombre del emoji dentro de la
   * alerta («alert: ❌ Incorrecto»). Además la barra de progreso (role="progressbar") no tiene
   * nombre accesible. Medido con ariaSnapshot el 25/09/2026.
   */
  test('hallazgo · el veredicto no anuncia emojis y la barra de progreso tiene nombre', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): «❌ Incorrecto» / «✅ ¡Correcto!» en la alerta
    const EMOJI = /\p{Extended_Pictographic}/u;
    await abrirHidratada(page);
    await arrancarPartida(page, 'A1 Básico', 10);
    const inf = norm(await verboEnPantalla(page).textContent());
    await pulsarOpcion(page, (await opcionesVisibles(page)).find((o) => o !== respuestaQueSePregunta(inf))!);
    await expect(feedback(page)).toContainText('Incorrecto');
    expect(await feedback(page).ariaSnapshot(), 'el veredicto «Incorrecto» se anuncia con su emoji').not.toMatch(EMOJI);
    await botonSiguiente(page).click();
    const inf2 = norm(await verboEnPantalla(page).textContent());
    await pulsarOpcion(page, respuestaQueSePregunta(inf2));
    await expect(feedback(page)).toContainText('¡Correcto!');
    expect(await feedback(page).ariaSnapshot(), 'el veredicto «¡Correcto!» se anuncia con su emoji').not.toMatch(EMOJI);
    expect(await page.locator('[role="progressbar"]').ariaSnapshot(), 'la barra de progreso no tiene nombre').toMatch(/progressbar "[^"]+"/);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — formato español del porcentaje
   * (CLAUDE.md global §2, desde el 25/09/2026: «15 %» con espacio duro U+00A0).
   * Dónde: el HUD «Precisión» (`{…}%`, pegado: «100%») · la ficha final «Acierto» («70%»,
   * pegado) · la guía, «hasta 95 % de acierto» y «superar el 85 %», con espacio NORMAL (el % puede
   * saltar solo de línea). Metadata y JSON-LD no llevan %.
   * Ojo al repararlo: los casos antiguos de arriba (caso normal, límite, 311, 311b, rechazo)
   * fijan «70%», «0%», «100%» y «50%» pegados y habrá que actualizarlos a la vez.
   */
  test('hallazgo · los porcentajes llevan espacio duro antes del %', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): «100%» en el HUD, «100%» en la ficha, «95 %» con espacio normal
    await abrirHidratada(page);
    await arrancarPartida(page, 'A1 Básico', 10);
    const inf = norm(await verboEnPantalla(page).textContent());
    await pulsarOpcion(page, respuestaQueSePregunta(inf));
    expect((await page.locator('[class*="hudValor"]').allTextContents())[2]).toBe('100 %');
    await botonSiguiente(page).click();
    await acertarHastaElFinal(page);
    expect((await page.locator('[class*="statRValor"]').allTextContents())[1]).toBe('100 %');
    const guia = (await page.locator('[class*="stepGuide"]').textContent()) ?? '';
    expect(guia).toContain('95 %');
    expect(guia).toContain('85 %');
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — dos tamaños del nivel B1 en la misma
   * pantalla. Con B1 y «20 preguntas», la tarjeta sigue diciendo «20 verbos habituales» y el
   * aviso justo debajo, «El nivel B1 tiene 19 verbos». Los dos tienen parte de razón (el banco
   * tiene 20; `show` no se pregunta desde el 316), pero el aviso no dice por qué y parece un
   * error. Lo mismo, sin aviso, en «Todos los niveles — 75 verbos completos», el «Plan de 30
   * días» («activa el quiz con los 75 verbos») y la metadata: se preguntan 74.
   */
  test('hallazgo · la tarjeta de B1 y el aviso no dan dos tamaños distintos del nivel', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): «20 verbos habituales» frente a «tiene 19 verbos»
    await abrirHidratada(page);
    const tarjeta = page.locator('[class*="nivelBtn"]').filter({ hasText: 'B1 Intermedio' });
    await tarjeta.click();
    await page.getByRole('button', { name: '20 preguntas', exact: true }).click();
    const textos = `${norm(await tarjeta.textContent())} · ${norm(await page.locator('[class*="avisoNivel"]').textContent())}`;
    const cifras = [...new Set([...textos.matchAll(/(\d+) verbos/g)].map((m) => m[1]))];
    expect(cifras, `la pantalla da dos tamaños de B1: ${textos}`).toHaveLength(1);
  });

  /**
   * HALLAZGO medio (Inspector 25/09/2026) · contenido — la guía llama REGULAR a «lie».
   * · Escenario «Adulto preparando el B2 o C1»: «sus parejas regulares (lie, raise) no entran».
   * · FAQ «¿Cuáles son los más confundidos en el B2?»: «sus parejas regulares (lie, raise, found)
   *   no entran, porque no son irregulares» — la misma respuesta acaba de escribir «lie/lay/lain».
   * · Caja «6 errores típicos»: «Confundir lay/lie/lain vs. lay/laid/laid»; la conjugación de
   *   lie es lie/lay/lain.
   * Fuente: Oxford Learner's Dictionaries, lie¹ (estar tumbado), Verb Forms «past simple lay ·
   * past participle lain»; Cambridge Dictionary, lie «past tense lay, past participle lain».
   * Solo lie «mentir» es regular (lied), y no es la pareja de lay. (Ojo: el caso 314b de arriba
   * y su constante PAREJAS_REGULARES_QUE_LA_FAQ_NOMBRA dan por buena la misma premisa; lo que
   * comprueban —que lie, raise y found no están en el banco— sigue siendo cierto.)
   */
  test('hallazgo · la guía no presenta «lie» como verbo regular ni lo conjuga «lay/lie/lain»', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026): «parejas regulares (lie, raise…)» y «lay/lie/lain»
    await abrirHidratada(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const LIE_REGULAR = /regulares\s*\([^)]*\blie\b/;
    const escenario = norm(await page.locator('[class*="escenarioCard"]').filter({ hasText: 'Adulto preparando' }).textContent());
    expect(escenario, 'el escenario de examen llama regular a «lie»').not.toMatch(LIE_REGULAR);
    const faq = norm(await page.locator('[class*="faqItem"]').filter({ hasText: 'más confundidos en el B2' }).textContent());
    expect(faq, 'la FAQ llama regular a «lie»').not.toMatch(LIE_REGULAR);
    const errores = norm(await page.locator('[class*="warningList"]').textContent());
    expect(errores, 'la caja de errores conjuga «lay/lie/lain»').not.toContain('lay/lie/lain');
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — la FAQ «¿Qué verbos son irregulares en
   * inglés pero no en español?» pone de ejemplo hear (oír), sleep (dormir) y feel (sentir). Los
   * tres son irregulares en español: el Diccionario panhispánico de dudas (RAE-ASALE) marca
   * «Verbo irregular» en dormir, sentir y oír (rae.es/dpd/dormir, /sentir, /oír; consultado el
   * 25/09/2026). La matización de hear («regular en muchos tiempos») no salva la pregunta, y
   * sleep y feel no llevan ninguna.
   */
  test('hallazgo · la FAQ no pone como «regulares en español» verbos que la RAE da por irregulares', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): sleep (dormir), feel (sentir) y hear (oír)
    await abrirHidratada(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const item = page.locator('[class*="faqItem"]').filter({ hasText: 'pero no en español' });
    if ((await item.count()) > 0) {
      expect(norm(await item.textContent())).not.toMatch(/sleep\/slept|feel\/felt|hear\/heard/);
    }
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — dos «10 verbos irregulares más
   * frecuentes» distintos, y ninguno cuadra con los corpus.
   * · Página (FAQ y nota «Los 10 más usados»): be, have, do, go, get, make, say, see, come, take.
   * · FAQPage del JSON-LD: be, have, do, go, say, get, make, know, think, come.
   * Oxford English Corpus (top 100, rangos en Wikipedia «Most common words in English»): be 2 ·
   * have 9 · do 19 · say 28 · get 47 · go 49 · make 52 · know 59 · take 60 · see 69 · come 76 ·
   * think 79. COCA: be 2 · have 8 · do 18 · say 19 · go 35 · get 39 · make 45 · know 47 · think 56 ·
   * take 63 · see 67 · come 70. Los dos corpus coinciden en nueve: be, have, do, say, get, go,
   * make, know, take. La página deja fuera «know» (8.º en los dos) y mete «come» (11.º-12.º).
   */
  test('hallazgo · la lista de los 10 más frecuentes es la misma en la página y en el JSON-LD, y contiene los 9 en que coinciden OEC y COCA', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): la página omite «know»; el JSON-LD da otra lista
    const NUCLEO = ['be', 'have', 'do', 'say', 'get', 'go', 'make', 'know', 'take'];
    const lista = (s: string): string[] => s.split(/,\s*|\s+y\s+/).map((v) => v.trim()).filter(Boolean).sort();
    await abrirHidratada(page);
    const faq = norm(await page.locator('[class*="faqItem"]').filter({ hasText: 'más usados en la práctica' }).textContent());
    const enPagina = lista(grupo(faq, /escrito y oral son: ([^.]+)\./));
    const nota = norm(await page.locator('[class*="eduNota"]').filter({ hasText: 'Los 10 más usados' }).textContent());
    const enNota = nota.split(':')[1].split('·').map((t) => t.split('/')[0].trim()).sort();
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqLd = bloques.find((b) => b.includes('FAQPage')) ?? '';
    const enJsonLd = lista(grupo(faqLd, /frecuencia de uso son: ([^.]+)\./));

    expect(enPagina).toHaveLength(10);
    expect(enNota).toEqual(enPagina);
    expect(enPagina, 'la lista de la página no contiene los 9 en que coinciden OEC y COCA').toEqual(expect.arrayContaining(NUCLEO));
    expect(enJsonLd, 'el FAQPage da otra lista de los 10 más frecuentes').toEqual(enPagina);
  });

  /**
   * HALLAZGO bajo (Inspector 25/09/2026) · contenido — lenguaje Latam-friendly (CLAUDE.md del
   * proyecto §1.bis). El quiz traduce «take» como «tomar / coger», y lo enseña en la pregunta y
   * en el veredicto: «coger» es malsonante en México, Argentina y buena parte de Latinoamérica,
   * que es la mitad del público. En la misma línea, sin caso propio: «conducir» por drive
   * (en América, «manejar»), «quedar» por meet y los escenarios «EOI» y «Opositor». Ojo al
   * repararlo: el caso «el banco dice la verdad» de arriba fija `es: 'tomar / coger'` en CANON.
   */
  test('hallazgo · el significado que el quiz enseña para «take» no usa «coger»', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): «"tomar / coger"»
    await abrirHidratada(page);
    // A1 con 15 preguntas recorre los 15 verbos del nivel, «take» incluido.
    await arrancarPartida(page, 'A1 Básico', 15);
    let significado: string | null = null;
    for (let i = 1; i <= 15; i++) {
      const inf = norm(await verboEnPantalla(page).textContent());
      if (inf === 'take') {
        significado = norm(await page.locator('[class*="verboSignificado"]').textContent());
        break;
      }
      await pulsarOpcion(page, respuestaQueSePregunta(inf));
      await botonSiguiente(page).click();
    }
    expect(significado, 'la partida de A1 con 15 preguntas no ha preguntado «take»').not.toBeNull();
    expect(significado).not.toMatch(/coger/);
  });
});

/**
 * HALLAZGO bajo (Inspector 25/09/2026) · operativa — sospecha (b) CONFIRMADA.
 * En un móvil de 360 × 740, con el desplazamiento mínimo que haría un dedo (subir lo justo para
 * leer el enunciado bajo el logo, bajar lo justo para ver «Siguiente» entero), al tocar
 * «Siguiente pregunta →» el feedback y el botón desaparecen y nadie devuelve la vista: medido el
 * 25/09/2026 en 14 de 14 transiciones de una partida de 15, «Pregunta N de 15» queda en
 * y = −10…7 (fuera y bajo la barra) y «¿Cuál es el Past Simple de...?» en y = 20…41, debajo del
 * logo fijo (15-141 × 10-52); el HUD (pregunta, aciertos, precisión) en y = −193…−106. Con «be»
 * lo tapado es justo el matiz «(con I, he, she, it)». Al empezar, el verbo mismo sale en
 * y = −1…63, medio bajo el logo; y en el resultado, el título en y = −42…−4.
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

  test('hallazgo · tras «Siguiente pregunta» el enunciado nuevo no queda bajo la barra fija del logo', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026): «Pregunta 2 de 10» y el enunciado, bajo el logo
    const tocar = async (loc: Locator): Promise<void> => {
      const b = await loc.boundingBox();
      if (!b) throw new Error('el elemento no tiene caja');
      await page.touchscreen.tap(b.x + Math.min(20, b.width / 2), b.y + b.height / 2);
    };
    await abrirHidratada(page);
    await arrancarPartida(page, 'A1 Básico', 10);
    await expect(page.getByText('Pregunta 1 de 10', { exact: true })).toBeAttached();

    // Sube lo justo para leer el enunciado bajo el logo, o baja para ver la D…
    await page.evaluate(() => {
      const barra = document.querySelector('[class*="headerBar"]');
      const bajoBarra = barra ? Math.max(0, ...[...barra.children].map((c) => c.getBoundingClientRect().bottom)) : 0;
      const e = (document.querySelector('[class*="preguntaEtiqueta"]') as Element).getBoundingClientRect();
      const d = [...document.querySelectorAll('[class*="opcionesGrid"] button')][3].getBoundingClientRect();
      if (e.top < bajoBarra + 8) scrollBy(0, e.top - bajoBarra - 8);
      else if (d.bottom > innerHeight) scrollBy(0, d.bottom - innerHeight + 10);
    });
    const inf = norm(await verboEnPantalla(page).textContent());
    await tocar(await botonDeOpcion(page, respuestaQueSePregunta(inf)));
    await expect(feedback(page)).toContainText('¡Correcto!');
    // …baja lo justo para ver «Siguiente» entero y lo toca.
    await page.evaluate(() => {
      const r = (document.querySelector('[class*="btnSiguiente"]') as Element).getBoundingClientRect();
      if (r.bottom > innerHeight - 10) scrollBy(0, r.bottom - innerHeight + 10);
    });
    await tocar(botonSiguiente(page));
    await expect(page.getByText('Pregunta 2 de 10', { exact: true })).toBeAttached();

    const tapadas = (): Promise<string[]> =>
      page.evaluate(() => {
        const barra = document.querySelector('[class*="headerBar"]');
        const tapas = barra ? [...barra.children].map((c) => c.getBoundingClientRect()) : [];
        const cruza = (a: DOMRect, b: DOMRect): boolean => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const fuera: string[] = [];
        for (const clase of ['preguntaNumero', 'preguntaEtiqueta', 'verboPrincipal']) {
          const el = document.querySelector(`[class*="${clase}"]`);
          if (!el) continue;
          const rango = document.createRange();
          rango.selectNodeContents(el);
          for (const l of rango.getClientRects()) {
            if (l.top < 0 || tapas.some((t) => cruza(t, l))) fuera.push(`${clase} ${Math.round(l.top)}…${Math.round(l.bottom)}`);
          }
        }
        return [...new Set(fuera)];
      });
    // Se sondea: una reparación con scroll suave tarda unos fotogramas en llevar la vista.
    await expect.poll(tapadas, { message: 'líneas de la pregunta nueva fuera de pantalla o bajo el logo', timeout: 3000 }).toEqual([]);
  });
});

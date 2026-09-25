import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Biología Molecular — test de regresión del Inspector (1.ª pasada, 25/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «🧬 Quiz Biología Molecular» · subtítulo «30 preguntas sobre ADN, ARN, replicación,
 *   transcripción, traducción y mutaciones» · tarjeta de inicio «30 preguntas en 5 categorías
 *   con explicaciones detalladas» · modos «Examen completo · 30 preguntas» y «Práctica por
 *   categoría · 6 preguntas».
 * · metadata.ts (title, description, OpenGraph, twitter y JSON-LD): «30 preguntas», «5
 *   categorías», «explicaciones detalladas tras cada respuesta», «puntuación, racha y
 *   clasificación final con desglose por categoría».
 * · Banco (PREGUNTAS de page.tsx): 30 preguntas, 6 por categoría. Examen = las 30 barajadas;
 *   práctica = las 6 de la categoría barajadas. Desde la reparación del 1745 (Ronda 15,
 *   25/09/2026) también se barajan las OPCIONES de cada pregunta, y la corrección va por el
 *   texto de la opción, no por su posición (motor.ts).
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · CLAVE (abajo) se escribió A MANO resolviendo cada enunciado con la biología (dogma
 *   central, replicación, transcripción, código genético, mutaciones), NO copiando el
 *   `correcta:` del banco: así el test contrasta la clave contra la biología y no contra sí
 *   misma. Las 30 coinciden con lo que la app marca como correcto (medido el 25/09/2026).
 * · El marcador sale de leer el motor de page.tsx:
 *     aciertos   = resultados.filter(Boolean).length
 *     Errores    = totalPreguntas − aciertos
 *     porcentaje = Math.round(aciertos / totalPreguntas · 100)
 *   y obtenerClasificacion() de motor.ts, sobre la nota = aciertos·10/total con la escala
 *   española (RD 1125/2003, art. 5.4; reparación del 1752): pleno «¡Perfecto!» 🏆 · ≥9
 *   «Sobresaliente» 🌟 · ≥7 «Notable» 👍 · ≥5 «Aprobado» 😊 · resto «Insuficiente» 😟. La nota se
 *   muestra con un decimal («Nota: 6,7 sobre 10»). La racha máxima es la mayor serie de
 *   aciertos seguidos.
 *
 * ALEATORIEDAD
 * ────────────
 * `mezclarArray` usa Math.random. Los casos generales juegan con la clave en la mano (leen el
 * enunciado y pulsan la opción que dice la biología). Los que necesitan una pregunta concreta
 * programan Math.random DENTRO de la misma tarea que el clic en «Comenzar quiz» (como el caso 4
 * de quiz-tabla-periodica): los 29 primeros números los gasta el barajado del ORDEN de las 30
 * preguntas (se comprueba), y los siguientes, el de las opciones, que sale del azar real.
 *
 * Los casos que vigilan un defecto de HOY expresan el comportamiento CORRECTO y llevan
 * test.fail() con el hallazgo en el comentario, para que el fichero quede en verde.
 */

const RUTA = '/quiz-biologia-molecular/';
const TOTAL_EXAMEN = 30; // PREGUNTAS.length de page.tsx
const POR_CATEGORIA = 6; // 6 preguntas de cada una de las 5 categorías

/**
 * Posición en PREGUNTAS (0 = id 1) de las preguntas que algún caso fuerza. Cada caso comprueba
 * además el enunciado que sale, así que si el banco se reordena falla diciéndolo.
 */
const POS_POLI_A = 17; // id 18 · «¿Qué función tiene la cola poli-A en el ARNm?»
const POS_STOP = 20; // id 21 · «¿Cuántos codones de parada (stop) existen…?»
const POS_TRADUCCION = 21; // id 22 · «¿Dónde ocurre la traducción en eucariotas?»
const POS_SINONIMA = 25; // id 26 · «¿Qué es una mutación sinónima (silenciosa)?»
const POS_FALCIFORME = 29; // id 30 · la de la anemia falciforme (la explicación más larga)

/** Enunciado → respuesta correcta, resuelta a mano con la biología (no con el banco). */
const CLAVE: Record<string, string> = {
  // ── ADN y ARN ──
  '¿Qué tipo de enlace une los nucleótidos en una cadena de ADN?': 'Enlace fosfodiéster', // 3'-OH ↔ 5'-fosfato
  '¿Cuántos puentes de hidrógeno unen el par de bases G-C?': '3', // G≡C 3, A=T 2
  '¿Qué diferencia estructural tiene el ARN respecto al ADN?': 'El ARN contiene ribosa y uracilo en vez de desoxirribosa y timina',
  '¿Qué tipo de ARN transporta los aminoácidos al ribosoma?': 'ARNt',
  '¿Cuál es la dirección de síntesis de una cadena de ADN?': "5' → 3'", // la polimerasa alarga el 3'-OH
  '¿Qué enzima sintetiza ARN a partir de un molde de ADN?': 'ARN polimerasa',
  // ── Replicación ──
  '¿Cómo es la replicación del ADN?': 'Semiconservativa', // Meselson y Stahl, 1958
  '¿Qué enzima rompe los puentes de hidrógeno entre las hebras en la replicación?': 'Helicasa',
  '¿Por qué se necesita un cebador (primer) en la replicación del ADN?':
    "Porque la ADN polimerasa no puede iniciar una cadena nueva sin extremo 3'-OH libre",
  '¿Qué son los fragmentos de Okazaki?': 'Fragmentos cortos sintetizados en la hebra retardada',
  '¿Qué enzima une los fragmentos de Okazaki?': 'ADN ligasa',
  '¿Qué problema resuelve la telomerasa?': 'El acortamiento de los telómeros en cada replicación',
  // ── Transcripción ──
  '¿Cuál de estas afirmaciones sobre la transcripción es correcta?': "La hebra molde se lee en dirección 3' → 5'",
  '¿Qué es el promotor en la transcripción?':
    'La secuencia de ADN a la que se une la ARN polimerasa para iniciar la transcripción',
  "¿Qué modificación protege el extremo 5' del ARNm maduro en eucariotas?": "Caperuza 7-metilguanosina (cap 5')",
  '¿Qué proceso elimina los intrones del pre-ARNm?': 'Splicing (corte y empalme)',
  '¿Qué es el splicing alternativo?':
    'El proceso por el que diferentes combinaciones de exones generan distintas proteínas desde un mismo gen',
  // Hallazgo 1746: «facilita el inicio de la traducción» TAMBIÉN es cierta (PABP–eIF4G), así
  // que ya no es una opción falsa: forma parte de la respuesta buena.
  '¿Qué función tiene la cola poli-A en el ARNm eucariota?':
    'Protege el ARNm de la degradación, ayuda a exportarlo al citoplasma y favorece el inicio de la traducción',
  // ── Traducción ──
  '¿Cuántas bases forman un codón?': '3',
  '¿Cuál es el codón de inicio de la traducción?': 'AUG',
  '¿Cuántos codones de parada (stop) existen en el código genético estándar?': '3', // UAA, UAG, UGA
  '¿Dónde ocurre la traducción en eucariotas?': 'Citoplasma (ribosomas libres o unidos al RE rugoso)',
  '¿Qué es el sitio A del ribosoma?': 'El sitio de aminoacil: donde entra el nuevo ARNt cargado',
  '¿Qué enzima cataliza la formación del enlace peptídico?': 'La peptidiltransferasa (actividad del ARNr 23S/28S)',
  // ── Mutaciones ──
  '¿Qué tipo de mutación cambia un codón que codifica un aminoácido por un codón de parada?': 'Mutación sin sentido (nonsense)',
  '¿Qué es una mutación sinónima (silenciosa)?':
    'Una mutación que cambia una base pero no cambia el aminoácido por degeneración del código',
  '¿Qué mecanismo repara los daños causados por la radiación UV (dímeros de timina)?': 'Reparación por escisión de nucleótidos (NER)',
  '¿Qué consecuencia tiene una inserción de 1 base en la región codificante?':
    'Cambio de marco de lectura que altera todos los aminoácidos downstream',
  '¿Qué es una mutación de ganancia de función?':
    'Una mutación que hace que una proteína sea más activa, activa en condiciones erróneas o adquiera nueva función',
  '¿Cuál es la base molecular de la anemia de células falciformes?':
    'Mutación de cambio de sentido: Glu→Val en la posición 6 de la beta-globina', // GAG→GTG
};

// ─── Utilidades ──────────────────────────────────────────────────────────────

const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim();

const enunciado = (p: Page): Locator => p.locator('[class*="preguntaTexto"]');
/** Los 4 botones de respuesta, en orden A-B-C-D (los únicos con el círculo de la letra). */
const opciones = (p: Page): Locator => p.locator('main button').filter({ has: p.locator('[class*="opcionLetra"]') });
const botonAvanzar = (p: Page): Locator => p.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ });
const aciertosBadge = (p: Page): Locator => p.locator('[class*="aciertosBadge"]');
const explicacion = (p: Page): Locator => p.locator('p[class*="explicacion"]');

/** Texto de las 4 opciones sin la letra del círculo. */
async function textosOpcion(page: Page): Promise<string[]> {
  return opciones(page).evaluateAll((bs) => bs.map((b) => (b.querySelector('span:last-child')?.textContent ?? '').trim()));
}

/** Abre la app sin el aviso fijo de transparencia y con el tema pedido, ya hidratada. */
async function abrir(page: Page, tema?: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      if (t) localStorage.setItem('meskeia-theme', t);
    } catch {
      /* sin almacenamiento: el aviso saldrá y el tema será el del sistema */
    }
  }, tema ?? null);
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz Biología Molecular');
  await esperarPaginaAsentada(page);
}

async function empezar(page: Page, modo: 'examen' | 'practica', categoria?: string): Promise<void> {
  await page.getByRole('button', { name: modo === 'examen' ? /Examen completo/ : /Práctica por categoría/ }).click();
  if (categoria) await page.locator('button[class*="categoriaBtn"]', { hasText: categoria }).click();
  await page.getByRole('button', { name: /Comenzar quiz/ }).click();
  await expect(page.getByText(/^Pregunta 1 de \d+$/)).toBeVisible();
}

/**
 * Examen completo con Math.random programado para que las primeras preguntas sean las
 * posiciones pedidas. Deshace el Fisher-Yates de mezclarArray (i de 29 a 1,
 * j = floor(r·(i+1))) y lo instala y retira DENTRO de la tarea del clic.
 */
async function empezarConOrden(page: Page, primeras: number[]): Promise<void> {
  const consumidos = await page.evaluate(
    ({ primeras, n }) => {
      const resto = [...Array(n).keys()].filter((i) => !primeras.includes(i));
      const objetivo = [...primeras, ...resto];
      const copia = [...Array(n).keys()];
      const valores: number[] = [];
      for (let i = n - 1; i > 0; i--) {
        const j = copia.indexOf(objetivo[i]);
        valores.push((j + 0.5) / (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      const boton = [...document.querySelectorAll<HTMLButtonElement>('main button')].find((b) =>
        /Comenzar quiz/.test(b.textContent ?? ''),
      );
      if (!boton) throw new Error('No hay botón «Comenzar quiz» en <main>');
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
    { primeras, n: TOTAL_EXAMEN },
  );
  expect(consumidos, 'mezclarArray baraja 30 preguntas: consume 29 números').toBe(TOTAL_EXAMEN - 1);
  await expect(page.getByText(`Pregunta 1 de ${TOTAL_EXAMEN}`)).toBeVisible();
}

/**
 * Responde la pregunta visible con la clave: 'bien' pulsa la correcta; 'mal', la primera que no
 * lo es. Devuelve el enunciado y las posiciones de la correcta y de la pulsada.
 */
async function responder(page: Page, modo: 'bien' | 'mal') {
  const texto = norm(await enunciado(page).innerText());
  const correcta = CLAVE[texto];
  expect(correcta, `enunciado fuera de la clave resuelta a mano: «${texto}»`).toBeTruthy();
  const ops = await textosOpcion(page);
  expect(ops, `4 opciones en «${texto}»`).toHaveLength(4);
  const iCorrecta = ops.indexOf(correcta);
  expect(iCorrecta, `«${correcta}» no está entre las opciones de «${texto}»`).toBeGreaterThanOrEqual(0);
  const iPulsada = modo === 'bien' ? iCorrecta : iCorrecta === 0 ? 1 : 0;
  await opciones(page).nth(iPulsada).click();
  await expect(page.locator(modo === 'bien' ? '[class*="feedbackCorrecto"]' : '[class*="feedbackIncorrecto"]')).toBeVisible();
  return { texto, iCorrecta, iPulsada };
}

/** Juega `total` preguntas: las `nBien` primeras bien y el resto mal. */
async function jugar(page: Page, total: number, nBien: number) {
  const vistas: string[] = [];
  const marcadas: number[] = [];
  for (let n = 1; n <= total; n++) {
    await expect(page.getByText(`Pregunta ${n} de ${total}`)).toBeVisible();
    const r = await responder(page, n <= nBien ? 'bien' : 'mal');
    vistas.push(r.texto);
    // La app marca como correcta la misma opción que la clave a mano
    const clases = await opciones(page).evaluateAll((bs) => bs.map((b) => b.className));
    const marcada = clases.findIndex((c) => /opcionCorrecta/.test(c));
    expect(marcada, `«${r.texto}»: la app marca otra opción que la clave`).toBe(r.iCorrecta);
    marcadas.push(marcada);
    await expect(botonAvanzar(page)).toHaveText(n < total ? 'Siguiente pregunta →' : 'Ver resultados →');
    await botonAvanzar(page).click();
  }
  return { vistas, marcadas };
}

/** La ficha final. */
async function resultado(page: Page) {
  await expect(page.locator('[class*="puntuacionCirculo"]')).toBeVisible();
  return page.evaluate(() => ({
    circulo: (document.querySelector('[class*="puntuacionCirculo"]')?.textContent ?? '').trim(),
    etiqueta: (document.querySelector('[class*="clasificacionTexto"]')?.textContent ?? '').trim(),
    emoji: (document.querySelector('[class*="clasificacionEmoji"]')?.textContent ?? '').trim(),
    pct: (document.querySelector('[class*="clasificacionPct"]')?.textContent ?? '').trim(),
    nota: (document.querySelector('[class*="clasificacionNota"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    stats: [...document.querySelectorAll('[class*="statItem"]')].map((s) => (s.textContent ?? '').trim()),
  }));
}

/**
 * Contraste WCAG del texto de `loc` contra su fondo REAL: compone los fondos semitransparentes
 * de los antecesores hasta dar con uno opaco (no vale para fondos con degradado).
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
    const [a, b] = [lum(texto), lum(fondo)];
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Biología Molecular', () => {
  /**
   * CASO NORMAL — Examen completo, 20 bien y 10 mal a propósito.
   *
   * Resuelto a mano ANTES de ejecutar:
   *   · 30 preguntas distintas (las 30 del banco barajadas), cabecera «Pregunta n de 30».
   *   · 20/30 → Math.round(66,67) = 67 % · nota 200/30 = 6,67 → «6,7» → tramo [5 · 7) →
   *     «Aprobado» 😊 (antes del 1752 decía «Notable»).
   *   · Errores 30 − 20 = 10 · racha máx. 20 (las 20 primeras seguidas).
   *   · Desglose: 6 por categoría, y la suma de aciertos por categoría = 20.
   * Además, la clave a mano coincide con lo que la app marca como correcto en las 30.
   */
  test('caso normal: examen con 20 bien y 10 mal da 20/30, 67 %, nota 6,7 y «Aprobado»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);

    await expect(page.locator('header p').first()).toHaveText(
      '30 preguntas sobre ADN, ARN, replicación, transcripción, traducción y mutaciones',
    );
    await expect(page.getByRole('button', { name: /Examen completo/ })).toContainText('30 preguntas');
    await expect(page.getByRole('button', { name: /Práctica por categoría/ })).toContainText('6 preguntas');

    await empezar(page, 'examen');
    await expect(aciertosBadge(page)).toContainText('0 aciertos');
    const { vistas } = await jugar(page, TOTAL_EXAMEN, 20);
    expect(new Set(vistas).size, 'pregunta repetida en el examen').toBe(TOTAL_EXAMEN);

    expect(await resultado(page)).toEqual({
      circulo: '20/30',
      etiqueta: 'Aprobado', // nota 6,67 ∈ [5 · 7)
      emoji: '😊',
      pct: '67%', // Math.round(20/30·100)
      nota: 'Nota: 6,7 sobre 10',
      stats: ['20Aciertos', '10Errores', '20Racha máx.'],
    });
    const desglose = await page.locator('[class*="desgloseScore"]').allInnerTexts();
    expect(desglose).toHaveLength(5);
    expect(desglose.every((d) => d.endsWith(`/${POR_CATEGORIA}`)), desglose.join(' ')).toBe(true);
    expect(desglose.reduce((s, d) => s + Number(d.split('/')[0]), 0)).toBe(20);
  });

  /**
   * CASO LÍMITE — los extremos en modo práctica.
   *   · Transcripción todo bien: 6/6 → 100 % → «¡Perfecto!» 🏆, 0 errores, racha 6.
   *   · Mutaciones todo mal: 0/6 → 0 % → «Insuficiente» 😟, 6 errores, racha 0.
   *   · Las 6 preguntas de la práctica son todas de la categoría elegida (el desglose solo
   *     tiene esa fila).
   */
  test('caso límite: práctica 6/6 da «¡Perfecto!» y 0/6 da «Insuficiente»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await empezar(page, 'practica', 'Transcripción');
    await jugar(page, POR_CATEGORIA, POR_CATEGORIA);
    expect(await resultado(page)).toEqual({
      circulo: '6/6',
      etiqueta: '¡Perfecto!',
      emoji: '🏆',
      pct: '100%',
      nota: 'Nota: 10,0 sobre 10',
      stats: ['6Aciertos', '0Errores', '6Racha máx.'],
    });
    await expect(page.locator('[class*="desgloseItem"]')).toHaveCount(1);
    await expect(page.locator('[class*="desgloseItem"]')).toContainText('Transcripción6/6');

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await empezar(page, 'practica', 'Mutaciones');
    await jugar(page, POR_CATEGORIA, 0);
    expect(await resultado(page)).toEqual({
      circulo: '0/6',
      etiqueta: 'Insuficiente',
      emoji: '😟',
      pct: '0%',
      nota: 'Nota: 0,0 sobre 10',
      stats: ['0Aciertos', '6Errores', '0Racha máx.'],
    });
    await expect(page.locator('[class*="desgloseItem"]')).toContainText('Mutaciones0/6');
  });

  /**
   * CASO LÍMITE — los umbrales de obtenerClasificacion() (escala española, reparación 1752).
   *   · Práctica 5/6 → nota 8,33 → [7 · 9) «Notable» 👍 · 4/6 → nota 6,67 → [5 · 7) «Aprobado» 😊.
   *   · Práctica 3/6 → nota 5 justo → «Aprobado» (el corte incluye el 5).
   *   · Examen 11/30 → nota 3,67 → «Insuficiente» 😟.
   * El 12/30 (un 4) va en el caso del hallazgo 1752, abajo.
   */
  test('caso límite: 5/6 «Notable», 4/6 y 3/6 «Aprobado» y 11/30 «Insuficiente»', async ({ page }) => {
    test.setTimeout(150_000);
    await abrir(page);
    await empezar(page, 'practica', 'Replicación');
    await jugar(page, POR_CATEGORIA, 5);
    expect(await resultado(page)).toMatchObject({ circulo: '5/6', etiqueta: 'Notable', emoji: '👍', pct: '83%', nota: 'Nota: 8,3 sobre 10' });

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await empezar(page, 'practica', 'Traducción');
    await jugar(page, POR_CATEGORIA, 4);
    expect(await resultado(page)).toMatchObject({ circulo: '4/6', etiqueta: 'Aprobado', emoji: '😊', pct: '67%', nota: 'Nota: 6,7 sobre 10' });

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await empezar(page, 'practica', 'ADN y ARN');
    await jugar(page, POR_CATEGORIA, 3);
    expect(await resultado(page)).toMatchObject({ circulo: '3/6', etiqueta: 'Aprobado', pct: '50%', nota: 'Nota: 5,0 sobre 10' });

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await empezar(page, 'examen');
    await jugar(page, TOTAL_EXAMEN, 11);
    expect(await resultado(page)).toEqual({
      circulo: '11/30',
      etiqueta: 'Insuficiente', // nota 3,67 < 5
      emoji: '😟',
      pct: '37%',
      nota: 'Nota: 3,7 sobre 10',
      stats: ['11Aciertos', '19Errores', '11Racha máx.'],
    });
  });

  /**
   * OPERATIVA QUE DEBE IMPEDIRSE — resuelto a mano leyendo page.tsx:
   *   · Antes de responder no existe «Siguiente pregunta» (se pinta solo con estado 'respondida').
   *   · `responder()` sale si ya hay respuesta y las 4 opciones quedan `disabled`: un doble clic
   *     en la correcta cuenta UNA vez, y un clic forzado en otra no la marca como fallada.
   *   · Las opciones son botones de ACCIÓN: type="button" y sin aria-pressed.
   *   · «Volver al inicio» e iniciar otra vez: el marcador arranca en «0 aciertos».
   */
  test('operativa: sin «Siguiente» antes de responder, doble clic que cuenta una vez y reinicio a cero', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await empezar(page, 'examen');

    await expect(botonAvanzar(page)).toHaveCount(0);
    for (const b of await opciones(page).all()) {
      await expect(b).toHaveAttribute('type', 'button');
      expect(await b.getAttribute('aria-pressed'), 'las opciones son botones de acción').toBeNull();
    }

    const texto = norm(await enunciado(page).innerText());
    const ops = await textosOpcion(page);
    const iCorrecta = ops.indexOf(CLAVE[texto]);
    await opciones(page).nth(iCorrecta).dblclick();
    await opciones(page).nth(iCorrecta === 0 ? 1 : 0).click({ force: true }).catch(() => {
      /* bloqueada: es lo que se espera */
    });
    for (const b of await opciones(page).all()) await expect(b).toBeDisabled();
    await expect(page.locator('[class*="opcionIncorrecta"]')).toHaveCount(0);
    await expect(aciertosBadge(page)).toContainText(/\b1 acierto/); // uno, no dos
    await botonAvanzar(page).click();

    // Resto fallado → 1/30 = 3 % → «Insuficiente»
    for (let n = 2; n <= TOTAL_EXAMEN; n++) {
      await responder(page, 'mal');
      await botonAvanzar(page).click();
    }
    expect(await resultado(page)).toEqual({
      circulo: '1/30',
      etiqueta: 'Insuficiente',
      emoji: '😟',
      pct: '3%', // Math.round(3,33)
      nota: 'Nota: 0,3 sobre 10',
      stats: ['1Aciertos', '29Errores', '1Racha máx.'],
    });

    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await page.getByRole('button', { name: /Comenzar quiz/ }).click();
    await expect(page.getByText('Pregunta 1 de 30')).toBeVisible();
    await expect(aciertosBadge(page)).toContainText('0 aciertos');
  });

  /**
   * Control de la sospecha 1674 en CLARO: correcta verde, fallada roja y el resto atenuado.
   * Medido el 25/09/2026: borde rgb(22, 163, 74) / rgb(220, 38, 38), círculo de la letra del
   * mismo color, y las otras dos con opacity 0,4.
   */
  test('en claro la correcta, la fallada y las neutras se pintan distinto', async ({ page }) => {
    await abrir(page, 'light');
    await page.emulateMedia({ reducedMotion: 'reduce' }); // sin la transición de 0,15 s
    await empezar(page, 'examen');
    const { iCorrecta, iPulsada } = await responder(page, 'mal');
    await page.mouse.move(0, 0);
    const iNeutra = [0, 1, 2, 3].find((i) => i !== iCorrecta && i !== iPulsada) ?? 3;
    const pintura = (i: number) =>
      opciones(page).nth(i).evaluate((b) => {
        const l = b.querySelector('[class*="opcionLetra"]') as Element;
        return `${getComputedStyle(b).borderTopColor} | ${getComputedStyle(l).backgroundColor} | ${getComputedStyle(b).opacity}`;
      });
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('light');
    // globals.css anima el fondo de TODO (`* { transition: background-color 0.3s }`); aun
    // reducida a 0,01 ms, la lectura inmediata da el valor de partida: se sondea.
    // El círculo de la letra se oscureció en la reparación del 1748 para que la letra blanca
    // llegue a 4,5:1 (#15803d 5,02 · #b91c1c 6,47); el borde sigue siendo el verde/rojo de antes.
    await expect.poll(() => pintura(iCorrecta)).toBe('rgb(22, 163, 74) | rgb(21, 128, 61) | 1');
    expect(await pintura(iPulsada)).toBe('rgb(220, 38, 38) | rgb(185, 28, 28) | 1');
    expect(await pintura(iNeutra)).toBe('rgba(0, 0, 0, 0.1) | rgba(0, 0, 0, 0.06) | 0.4');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS DE LA 1.ª PASADA (25/09/2026). Cada uno expresa el comportamiento CORRECTO.
// Reparados en la Ronda 15 (25/09/2026): ya sin test.fail(), quedan como regresión.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Hallazgos del Inspector', () => {
  /**
   * SOSPECHA 1674 CONFIRMADA (operativa) — en oscuro `[data-theme='dark'] .opcion` (0,2,0) pisa
   * el fondo y el borde de `.opcionCorrecta` / `.opcionIncorrecta` (0,1,0), y
   * `[data-theme='dark'] .opcionLetra`, que va después en la hoja, pisa el círculo verde/rojo.
   * Medido el 25/09/2026 con data-theme="dark" puesto al medir: correcta y fallada IDÉNTICAS
   * —fondo rgba(255,255,255,0,04), borde rgba(255,255,255,0,1), texto rgb(232,232,232), letra
   * rgba(255,255,255,0,08)— y la neutra igual salvo opacity 0,4. Quien falla en oscuro no ve
   * cuál era la buena.
   * DEBERÍA: correcta y fallada se distinguen entre sí y de una neutra.
   */
  test('1674 · en oscuro la correcta y la fallada no se pintan igual', async ({ page }) => {
    await abrir(page, 'dark');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await empezar(page, 'examen');
    const { iCorrecta, iPulsada } = await responder(page, 'mal');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400); // que acabe cualquier transición de fondo (globals.css anima `*`)
    const iNeutra = [0, 1, 2, 3].find((i) => i !== iCorrecta && i !== iPulsada) ?? 3;
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');
    const pintura = (i: number) =>
      opciones(page).nth(i).evaluate((b) => {
        const l = b.querySelector('[class*="opcionLetra"]') as Element;
        const cs = getComputedStyle(b);
        return `${cs.backgroundColor} | ${cs.borderTopColor} | ${cs.color} | ${getComputedStyle(l).backgroundColor}`;
      });
    const [bien, mal, neutra] = [await pintura(iCorrecta), await pintura(iPulsada), await pintura(iNeutra)];
    expect(bien, 'correcta frente a fallada').not.toBe(mal);
    expect(bien, 'correcta frente a neutra (sin contar la opacidad)').not.toBe(neutra);
  });

  /**
   * HALLAZGO (contenido) — sesgo de posición. En el banco la correcta está 0 veces en A, 3 en B,
   * 19 en C y 8 en D, y las opciones NO se barajan (medido en una partida: A0 B3 C19 D8).
   * «Siempre C» saca 19/30 = 63 % → «Notable» sin saber biología; en la práctica de
   * Transcripción, 5/6 = 83 % → «Sobresaliente»; «siempre A» da 0 garantizado.
   * DEBERÍA: en un examen ninguna letra se queda sin ser nunca la correcta ni acapara más del
   * 60 % (con reparto al azar lo esperable son ~7-8 por letra).
   */
  test('hallazgo · la correcta no se concentra en una letra: la posición no delata la respuesta', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await empezar(page, 'examen');
    const { marcadas } = await jugar(page, TOTAL_EXAMEN, TOTAL_EXAMEN);
    const cuenta = [0, 1, 2, 3].map((l) => marcadas.filter((m) => m === l).length);
    const detalle = `A${cuenta[0]} B${cuenta[1]} C${cuenta[2]} D${cuenta[3]}`;
    for (const c of cuenta) {
      expect(c, `reparto ${detalle}`).toBeGreaterThan(0);
      expect(c, `reparto ${detalle}`).toBeLessThan(TOTAL_EXAMEN * 0.6);
    }
  });

  /**
   * HALLAZGO (contenido) — la pregunta de la cola poli-A tiene DOS respuestas ciertas. Marca
   * como incorrecta «Facilita el inicio de la traducción», que es una función reconocida de la
   * cola poli-A: la PABP unida a ella se une a eIF4G y circulariza el ARNm (Tarun y Sachs 1996;
   * Wells et al., Mol Cell 1998). La propia explicación lo dice: «La PABP … interactúa con
   * factores de iniciación». Quien lo sabe recibe «✗ Incorrecto».
   * DEBERÍA: pulsar esa opción no da «Incorrecto» (o la opción deja de estar entre las falsas).
   *
   * REPARADO (Ronda 15): el inicio de la traducción pasa a formar parte de la respuesta buena
   * y su hueco lo ocupa un distractor falso («Indica al espliceosoma dónde cortar los
   * intrones»). Se comprueba que ninguna opción FALSA habla de la traducción y que acertar
   * da «¡Correcto!» con una explicación que nombra PABP y eIF4G.
   */
  test('hallazgo · poli-A: «Facilita el inicio de la traducción» no se castiga como falsa', async ({ page }) => {
    await abrir(page);
    await empezarConOrden(page, [POS_POLI_A]);
    await expect(enunciado(page)).toHaveText('¿Qué función tiene la cola poli-A en el ARNm eucariota?');
    const ops = await textosOpcion(page);
    const correcta = CLAVE['¿Qué función tiene la cola poli-A en el ARNm eucariota?'];
    const falsas = ops.filter((o) => o !== correcta);
    expect(falsas).toHaveLength(3);
    for (const f of falsas) expect(f, 'una opción falsa que habla de la traducción').not.toMatch(/traducción/i);
    await responder(page, 'bien');
    await expect(page.locator('[class*="feedbackResultado"]')).toContainText('¡Correcto!');
    expect(norm(await explicacion(page).innerText())).toMatch(/PABP.*eIF4G/);
  });

  /**
   * HALLAZGO (dato) — dos explicaciones afirman algo falso (la respuesta marcada es buena):
   *   · id 21: «UAA ("ámbar"), UAG ("ocre")». Es al revés: ámbar = UAG y ocre = UAA (ópalo/
   *     umber = UGA), la nomenclatura de los mutantes amber/ochre de Epstein y Bernstein.
   *   · id 22: «Las proteínas mitocondriales se traducen en los ribosomas mitocondriales». La
   *     inmensa mayoría (~1.100 en humanos, MitoCarta3.0) se codifica en el núcleo, se traduce
   *     en ribosomas citosólicos y se importa; el ADNmt humano solo codifica 13 proteínas
   *     (Anderson et al., Nature 1981), que son las que traduce el mitorribosoma.
   */
  test('hallazgo · las explicaciones de los codones stop y de la traducción mitocondrial no afirman nada falso', async ({ page }) => {
    await abrir(page);
    await empezarConOrden(page, [POS_STOP, POS_TRADUCCION]);
    await expect(enunciado(page)).toHaveText('¿Cuántos codones de parada (stop) existen en el código genético estándar?');
    await responder(page, 'bien');
    const stop = norm(await explicacion(page).innerText());
    await botonAvanzar(page).click();
    await expect(enunciado(page)).toHaveText('¿Dónde ocurre la traducción en eucariotas?');
    await responder(page, 'bien');
    const mito = norm(await explicacion(page).innerText());
    expect(stop).not.toMatch(/UAA \("ámbar"\)|UAG \("ocre"\)/);
    expect(mito).not.toMatch(/Las proteínas mitocondriales se traducen en los ribosomas mitocondriales/);
  });

  /**
   * HALLAZGO (contenido) — el FAQPage (lo que leen Bing Copilot o ChatGPT) dice que el bloque de
   * mutaciones incluye «mutaciones cromosómicas estructurales (inversión, translocación,
   * deleción e inversión) y numéricas (aneuploidía y poliploidía)» y «mutágenos físicos y
   * químicos». Ninguna de las 30 preguntas trata nada de eso (las 6 de mutaciones: sin
   * sentido, sinónima, NER/UV, desfase, ganancia de función y falciforme), y la lista repite
   * «inversión». Si el banco llega a cubrirlo, este caso se reescribe.
   */
  test('hallazgo · el FAQPage no promete mutaciones cromosómicas ni mutágenos que el banco no tiene', async ({ page }) => {
    const html = await (await page.request.get(RUTA)).text();
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"WebApplication"');
    expect(html).not.toMatch(/translocación|aneuploidía|poliploidía|mutágenos físicos y químicos/);
  });

  /**
   * HALLAZGO (contenido) — erratas visibles en el bloque educativo: la tabla «Transcripción vs
   * Traducción» muestra las barras invertidas del código («5\' → 3\' (ARNm)», «Hebra molde del
   * ADN (3\' → 5\')», «ARNm (5\' → 3\')»: en el texto JSX `\'` no es un escape), y el dato
   * curioso de la helicasa dice «desenvuelver».
   */
  test('hallazgo · el bloque educativo no enseña «\\\'» ni «desenvuelver»', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const tabla = await page.locator('table').innerText();
    const curiosos = await page.locator('li', { hasText: 'helicasa' }).first().innerText();
    expect(tabla).toContain("5' → 3' (ARNm)");
    expect(tabla).not.toContain('\\');
    expect(curiosos).not.toContain('desenvuelver');
  });

  /** HALLAZGO (contenido) — tras acertar la primera, el marcador dice «✓ 1 aciertos». */
  test('hallazgo · con un acierto el marcador dice «1 acierto», en singular', async ({ page }) => {
    await abrir(page);
    await empezar(page, 'examen');
    await responder(page, 'bien');
    await expect(aciertosBadge(page)).toHaveText('✓ 1 acierto');
  });

  /**
   * HALLAZGO (contenido) — la clasificación usa los nombres de la escala española de notas con
   * otros cortes: «Aprobado» desde el 40 %, «Notable» desde el 60 % y «Sobresaliente» desde el
   * 80 %. En la escala oficial (RD 1125/2003, art. 5.4; y los cortes de secundaria) 4/10 es
   * suspenso, Aprobado es 5-6,9, Notable 7-8,9 y Sobresaliente 9-10. Caso: examen 12/30 → 40 %
   * → la app dice «Aprobado» 😊 a quien ha sacado un 4.
   * DEBERÍA: un 40 % no se presenta como «Aprobado».
   */
  test('hallazgo · 12/30 (un 4 sobre 10) no se presenta como «Aprobado»', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await empezar(page, 'examen');
    await jugar(page, TOTAL_EXAMEN, 12);
    const r = await resultado(page);
    expect(r.pct).toBe('40%'); // Math.round(12/30·100)
    expect(r.etiqueta).not.toBe('Aprobado');
    // Reparado: nota 120/30 = 4 → «Insuficiente», y la nota se ve en cifras (Latam-friendly:
    // los nombres de la escala española no se entienden sin su número).
    expect(r).toMatchObject({ etiqueta: 'Insuficiente', emoji: '😟', nota: 'Nota: 4,0 sobre 10' });
  });

  /**
   * HALLAZGO (accesibilidad) — la forma del 1676 de quiz-tabla-periodica. Con teclado: al pulsar
   * «Siguiente pregunta →» el bloque de feedback se desmonta, el foco cae a <body> y el punto de
   * partida queda DETRÁS de las opciones nuevas: el primer Tab va a «Ver guía educativa», fuera
   * del quiz, y hacen falta 5 Shift+Tab para volver a la opción A. En cada una de las 29
   * transiciones. Medido el 25/09/2026.
   * DEBERÍA: después de avanzar, el Tab siguiente cae dentro de la tarjeta de la pregunta.
   *
   * REPARADO (Ronda 15) como en quiz-tabla-periodica: al responder, el foco va SOLO a
   * «Siguiente» (ya no hace falta el Tab que pedía el acta: si se pulsara, pasaría de largo), y
   * al avanzar, al enunciado nuevo (tabIndex=-1), de modo que el primer Tab cae en la opción A.
   * Lo mismo al final: «Ver resultados» deja el foco en la tarjeta de la nota.
   */
  test('hallazgo · tras «Siguiente pregunta» el Tab vuelve a la pregunta nueva', async ({ page }) => {
    await abrir(page);
    let enComenzar = false;
    for (let t = 0; t < 40 && !enComenzar; t++) {
      await page.keyboard.press('Tab');
      enComenzar = await page.evaluate(() => /Comenzar quiz/.test(document.activeElement?.textContent ?? ''));
    }
    expect(enComenzar, 'con Tab se llega a «Comenzar quiz»').toBe(true);
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 1 de 30')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(opciones(page).first()).toBeFocused();
    const correcta = CLAVE[norm(await enunciado(page).innerText())];
    const ops = await textosOpcion(page);
    for (let k = 0; k < ops.indexOf(correcta); k++) await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="feedbackCorrecto"]')).toBeVisible();
    await expect(botonAvanzar(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 30')).toBeVisible();
    await expect(enunciado(page)).toBeFocused();
    await page.keyboard.press('Tab');
    const dentro = await page.evaluate(() => !!document.activeElement?.closest('[class*="preguntaCard"]'));
    expect(dentro, 'el primer Tab tras avanzar cae en la pregunta nueva').toBe(true);
    await expect(opciones(page).first()).toBeFocused();
  });

  test('reparación 1749 · tras «Ver resultados» el foco va a la tarjeta de la nota, y al salir, al inicio', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await empezar(page, 'practica', 'Traducción');
    for (let n = 1; n <= POR_CATEGORIA; n++) {
      await responder(page, 'bien');
      await expect(botonAvanzar(page)).toBeFocused();
      await page.keyboard.press('Enter');
    }
    const tarjeta = page.locator('[class*="resultadoCard"]');
    await expect(tarjeta).toBeFocused();
    await expect(tarjeta).toHaveAttribute('aria-label', 'Resultado: 6 de 6 aciertos, ¡Perfecto!');
    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await expect(page.getByRole('heading', { name: '¿Dominas la biología molecular?' })).toBeFocused();
  });

  /**
   * HALLAZGO (accesibilidad) — tras fallar, cuál era la correcta solo se dice con COLOR (borde,
   * fondo y círculo verdes). El nombre accesible de la opción sigue siendo «Opción C: …» y el
   * aviso dice «✗ Incorrecto» y la explicación, sin nombrar la respuesta buena. WCAG 1.4.1. En
   * oscuro, con el color borrado (1674), no queda ni eso.
   * DEBERÍA: el nombre de la opción correcta o el aviso dicen en texto cuál era.
   */
  test('hallazgo · tras fallar, la respuesta correcta se dice también en texto', async ({ page }) => {
    await abrir(page);
    await empezar(page, 'examen');
    const { iCorrecta } = await responder(page, 'mal');
    const nombre = (await opciones(page).nth(iCorrecta).getAttribute('aria-label')) ?? '';
    const aviso = norm(await page.locator('[class*="feedbackIncorrecto"]').innerText());
    expect(/correcta/i.test(nombre) || /respuesta correcta|la correcta (era|es)/i.test(aviso), `${nombre} / ${aviso}`).toBe(true);
  });

  /**
   * HALLAZGO (accesibilidad) — emojis sin aria-hidden que llegan al lector de pantalla: el <h1>
   * («🧬 Quiz Biología Molecular») y «🔥 Racha:» (los dos que marca
   * `node scripts/check-a11y-jsx.mjs`), más las etiquetas de categoría («🧬 ADN y ARN», «🔄
   * Replicación», «📋 Transcripción»…) en los botones, las insignias y el desglose, y el 🔬 de
   * la tarjeta de inicio.
   */
  test('hallazgo · ningún emoji llega al árbol de accesibilidad del <h1> ni de <main>', async ({ page }) => {
    await abrir(page);
    const EMOJI = /\p{Extended_Pictographic}/u;
    expect(await page.locator('h1').ariaSnapshot()).not.toMatch(EMOJI);
    expect(await page.locator('main').ariaSnapshot(), 'inicio').not.toMatch(EMOJI);
    await empezar(page, 'examen');
    expect(await page.locator('main').ariaSnapshot(), 'jugando').not.toMatch(EMOJI);
  });

  /**
   * HALLAZGO (operativa) — empezado un examen de 30 preguntas no hay forma de abandonarlo ni de
   * cambiar de modo: en <main> solo están las 4 opciones (y «Siguiente» tras responder). Para
   * pasar a la práctica hay que responder las 30 o recargar la página.
   */
  test('hallazgo · se puede salir de una partida sin recargar la página', async ({ page }) => {
    await abrir(page);
    await empezar(page, 'examen');
    await expect(page.locator('main').getByRole('button', { name: /Salir|Abandonar|Volver|Terminar|Cambiar/ })).not.toHaveCount(0);
    // Reparado: «Salir de la partida» vuelve al inicio, deja cambiar de modo y no arrastra nada
    await responder(page, 'bien');
    await page.getByRole('button', { name: 'Salir de la partida' }).click();
    await expect(page.getByRole('heading', { name: '¿Dominas la biología molecular?' })).toBeFocused();
    await empezar(page, 'practica', 'Mutaciones');
    await expect(page.getByText('Pregunta 1 de 6')).toBeVisible();
    await expect(aciertosBadge(page)).toHaveText('✓ 0 aciertos');
  });

  /**
   * HALLAZGO (accesibilidad) — la forma del 1677. Umbral 4,5:1 (ningún texto medido llega a
   * «grande»: 16 px/700 como mucho). Medido el 25/09/2026 sobre el fondo real:
   *   claro · «Comenzar quiz →», «Siguiente pregunta →» y «Volver al inicio» (blanco sobre
   *     --primary) 4,11 · «✓ ¡Correcto!» 3,05 · «✗ Incorrecto» 4,40 · «✓ N aciertos» 2,68 ·
   *     insignias de categoría del inicio 3,65 · rótulo «🔄 Replicación» 2,62 · «🔥 Racha» 2,73.
   *   oscuro · los tres botones 2,79 · «✗ Incorrecto» 2,70 · «✓ ¡Correcto!» 3,69 · rótulo
   *     «🔄 Replicación» 4,43. (Y la nota blanca del círculo en degradado, ~2,5:1 en su centro.)
   * Existe --primary-boton (#26718F, 5,47:1 con blanco en los dos temas).
   */
  test('hallazgo · botones, veredicto, marcador y rótulos llegan a 4,5:1 en los dos temas', async ({ page }) => {
    test.setTimeout(90_000);
    const medidas: Record<string, number> = {};
    for (const tema of ['light', 'dark'] as const) {
      const p = tema === 'light' ? page : await page.context().newPage();
      await abrir(p, tema);
      await p.emulateMedia({ reducedMotion: 'reduce' });
      expect(await p.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(tema);
      medidas[`${tema} · Comenzar`] = await contraste(p.getByRole('button', { name: /Comenzar quiz/ }));
      medidas[`${tema} · insignia`] = await contraste(p.locator('[class*="categoriasBadges"] [class*="badge"]').first());
      await empezar(p, 'practica', 'Replicación');
      medidas[`${tema} · rótulo Replicación`] = await contraste(p.locator('[class*="categoriaBadge"]'));
      medidas[`${tema} · aciertos`] = await contraste(aciertosBadge(p));
      await responder(p, 'mal');
      await p.mouse.move(0, 0);
      medidas[`${tema} · Incorrecto`] = await contraste(p.locator('[class*="feedbackResultado"]'));
      medidas[`${tema} · Siguiente`] = await contraste(botonAvanzar(p));
      await botonAvanzar(p).click();
      await responder(p, 'bien');
      await p.mouse.move(0, 0);
      medidas[`${tema} · Correcto`] = await contraste(p.locator('[class*="feedbackResultado"]'));
      // Añadido en la reparación: la racha (sale con 2 seguidas), el aviso de la respuesta
      // buena y, al final, el porcentaje y la nota.
      await botonAvanzar(p).click();
      await responder(p, 'bien');
      await p.mouse.move(0, 0);
      medidas[`${tema} · Racha`] = await contraste(p.locator('[class*="rachaBadge"]'));
      await botonAvanzar(p).click();
      await responder(p, 'mal');
      await p.mouse.move(0, 0);
      medidas[`${tema} · respuesta correcta era`] = await contraste(p.locator('[class*="respuestaCorrecta"]'));
      for (let n = 5; n <= POR_CATEGORIA; n++) {
        await botonAvanzar(p).click();
        await responder(p, 'bien');
      }
      await botonAvanzar(p).click();
      medidas[`${tema} · porcentaje`] = await contraste(p.locator('[class*="clasificacionPct"]'));
      medidas[`${tema} · nota`] = await contraste(p.locator('[class*="clasificacionNota"]'));
      medidas[`${tema} · Volver`] = await contraste(p.getByRole('button', { name: 'Volver al inicio' }));
    }
    const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5);
    expect(bajos, JSON.stringify(medidas)).toEqual([]);
  });
});

/**
 * HALLAZGO (operativa) — la forma del 1675. En un móvil de 360 px, tras una explicación larga,
 * «Siguiente pregunta →» deja el enunciado nuevo bajo el logo fijo (10-52 px): nadie devuelve
 * la vista a la pregunta. Medido el 25/09/2026 con el desplazamiento mínimo que haría un dedo
 * para ver «Siguiente» entero: 5 de 29 transiciones por examen con líneas del enunciado
 * tapadas (tras la falciforme, «¿Qué es una mutación sinónima…?» en y = 7…54, las dos líneas
 * bajo el logo) y la nota final en y = −33…57. A 1.280 × 800 la nota final sale en y = −29.
 */
test.describe('Hallazgos del Inspector · móvil 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('hallazgo · tras «Siguiente pregunta» el enunciado nuevo no queda bajo el logo fijo', async ({ page }) => {
    const tocar = async (loc: Locator): Promise<void> => {
      const b = await loc.boundingBox();
      if (!b) throw new Error('sin caja');
      await page.touchscreen.tap(b.x + Math.min(20, b.width / 2), b.y + b.height / 2);
    };
    await abrir(page);
    await page.getByRole('button', { name: /Comenzar quiz/ }).scrollIntoViewIfNeeded();
    await empezarConOrden(page, [POS_FALCIFORME, POS_SINONIMA]);
    await expect(enunciado(page)).toHaveText('¿Cuál es la base molecular de la anemia de células falciformes?');

    // El usuario sube lo justo para ver el enunciado bajo el logo, o baja para ver la D; toca la buena…
    await page.evaluate(() => {
      const h = (document.querySelector('[class*="preguntaTexto"]') as Element).getBoundingClientRect();
      const bs = [...document.querySelectorAll('main button')].filter((b) => b.querySelector('[class*="opcionLetra"]'));
      const d = bs[3].getBoundingClientRect();
      if (h.top < 70) scrollBy(0, h.top - 70);
      else if (d.bottom > innerHeight) scrollBy(0, d.bottom - innerHeight + 10);
    });
    const ops = await textosOpcion(page);
    await tocar(opciones(page).nth(ops.indexOf(CLAVE['¿Cuál es la base molecular de la anemia de células falciformes?'])));
    // …baja lo justo para ver «Siguiente» entero y lo toca
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button')].find((x) => /Siguiente pregunta/.test(x.textContent ?? ''));
      const r = b?.getBoundingClientRect();
      if (r && r.bottom > innerHeight - 10) scrollBy(0, r.bottom - innerHeight + 10);
    });
    await tocar(botonAvanzar(page));
    await expect(enunciado(page)).toHaveText('¿Qué es una mutación sinónima (silenciosa)?');
    await page.waitForTimeout(300);

    const tapadas = await page.evaluate(() => {
      const el = document.querySelector('[class*="preguntaTexto"]') as Element;
      const cruza = (a: DOMRect, b: DOMRect): boolean => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const barra = document.querySelector('[class*="headerBar"]');
      const tapas = barra ? [...barra.children].map((c) => c.getBoundingClientRect()) : [];
      const rango = document.createRange();
      rango.selectNodeContents(el);
      return [...rango.getClientRects()]
        .filter((l) => l.top < 0 || tapas.some((t) => cruza(t, l)))
        .map((l) => `${Math.round(l.top)}…${Math.round(l.bottom)}`);
    });
    expect(tapadas, 'líneas del enunciado fuera de pantalla o bajo el logo/conmutador').toEqual([]);
  });
});

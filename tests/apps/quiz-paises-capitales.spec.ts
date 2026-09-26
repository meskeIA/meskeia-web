import { test, expect, type Page, type Locator } from '@playwright/test';
import { countries, type Country } from '../../data/countries';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Quiz Países y Capitales — test de regresión del Inspector (1.ª pasada 26/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Quiz Países y Capitales» · «Pon a prueba tus conocimientos de geografía mundial».
 * · Tres modos (Capital, País, Bandera) y cinco niveles (Fácil 10, Normal 15, Difícil 20, Experto
 *   25, Maestro 30 preguntas). DIFICULTAD_CONFIG (page.tsx:23-29) reparte por continente: Fácil =
 *   Europa · Normal = Europa + América · Difícil = + Asia · Experto = + África · Maestro = todos.
 *   La guía lo repite: «Usa el modo Fácil para repasar Europa; después Normal para añadir América».
 * · metadata.ts: «Los 195 Estados de la ONU y Taiwán, 3 modos de juego, 5 dificultades» (hasta el
 *   26/09/2026 decía «195 países» con un banco de 196: hallazgo 2276).
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS
 * ────────────────────────────────────
 * · Puntos: `calcularPuntuacion` (page.tsx:79-85): ≥ 90 % → 100 · 70-90 % → 60 + (pct − 0,7)/0,2·40
 *   · 50-70 % → 40 + (pct − 0,5)/0,2·20 · resto pct·80. Títulos (page.tsx:87-92): ≥ 90 % 🏆
 *   «¡Geógrafo experto!» · ≥ 70 % ⭐ «¡Muy buena puntuación!» · ≥ 50 % 👍 «Buen intento» · resto 📚
 *   «Sigue practicando». 7/10 → 60 pts · 0/10 → 0 pts · 15/15 → 100 pts.
 * · La CLAVE con que se juega se lee de `data/countries.ts`: las partidas miden la MECÁNICA. La verdad
 *   de la clave se coteja aparte («Contenido del banco») contra la lista de países y capitales de la
 *   RAE (Libro de estilo de la Justicia, apéndice 8, que sigue a la Ortografía de 2010) y la tabla
 *   «List of national capitals» de la Wikipedia inglesa (el World Factbook cerró el 04/02/2026).
 *
 * ALEATORIEDAD
 * ────────────
 * `mezclar()` (Fisher-Yates sobre Math.random) baraja países y, en cada pregunta, las 4 opciones.
 * Medido el 26/09/2026 sobre 5.280 respuestas (15 combinaciones modo × nivel): A 1.285 · B 1.338 ·
 * C 1.304 · D 1.353, χ² = 2,19 con 3 g. l. «Pulsar siempre A» saca un 24,3 %: el barajado está sano.
 * Para reproducir un reparto concreto se sustituye Math.random por mulberry32(semilla) SOLO durante
 * el clic en «Empezar Quiz»: generarPreguntas() corre entero dentro de ese manejador.
 */

const RUTA = '/quiz-paises-capitales/';
const POR_NOMBRE = new Map(countries.map((c) => [c.name, c]));
const POR_CAPITAL = new Map(countries.map((c) => [c.capital, c]));
const POR_CODIGO = new Map(countries.map((c) => [c.code, c]));
/** Código ISO de la bandera que se pregunta, leído de su clase `fi-xx` (el aria-label ya no lo da). */
const codigoBandera = (clase: string | null): string => (clase ?? '').match(/\bfi-([a-z]{2})\b/)?.[1] ?? '';
const norm = (s: string | null | undefined): string => (s ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
/** Espacio duro U+00A0: se construye con su código para que se vea en el fuente. */
const DURO = String.fromCharCode(0xa0);
/** «70 %» admitiendo el % pegado o tras espacio duro (su formato se vigila aparte). */
const porcentaje = (p: number): RegExp => new RegExp(`^${p}${DURO}?%$`);
const AMERICA = /^América/;

type Modo = 'Capital' | 'País' | 'Bandera';
type Nivel = 'Fácil' | 'Normal' | 'Difícil' | 'Experto' | 'Maestro';

async function abrir(page: Page, tema?: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      if (t) localStorage.setItem('meskeia-theme', t);
    } catch {
      /* sin almacenamiento: saldrá el aviso y el tema del sistema */
    }
  }, tema ?? null);
  // globals.css anima colores: sin esto, un color leído justo después de pulsar es el de la transición
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toContainText('Quiz Países y Capitales');
  // Sin <input>: la espera que vale es la de la página con la hidratación confirmada.
  await esperarPaginaAsentada(page);
  if (tema) await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

const botonModo = (page: Page, modo: Modo): Locator =>
  page.locator('[class*="modoBtn"]').filter({ has: page.locator('[class*="modoNombre"]', { hasText: new RegExp(`^${modo}$`) }) });
const botonNivel = (page: Page, nivel: Nivel): Locator => page.locator('[class*="difBtn"]').filter({ hasText: nivel });

async function configurar(page: Page, modo: Modo, nivel: Nivel): Promise<void> {
  await botonModo(page, modo).click();
  await expect(botonModo(page, modo)).toHaveAttribute('aria-pressed', 'true');
  await botonNivel(page, nivel).click();
  await expect(botonNivel(page, nivel)).toHaveAttribute('aria-pressed', 'true');
}

async function arrancar(page: Page, modo: Modo, nivel: Nivel): Promise<void> {
  await configurar(page, modo, nivel);
  await page.getByRole('button', { name: /Empezar Quiz/ }).click();
  await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
}

/**
 * Como `arrancar`, pero con Math.random = mulberry32(semilla) solo durante el clic en «Empezar
 * Quiz» (generarPreguntas() reparte ahí las preguntas y sus opciones).
 */
async function arrancarConSemilla(page: Page, modo: Modo, nivel: Nivel, semilla: number): Promise<void> {
  await configurar(page, modo, nivel);
  await page.evaluate((s) => {
    let a = s;
    (window as unknown as { __azar: () => number }).__azar = Math.random;
    Math.random = (): number => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, semilla);
  try {
    await page.getByRole('button', { name: /Empezar Quiz/ }).click();
    await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
  } finally {
    await page.evaluate(() => {
      Math.random = (window as unknown as { __azar: () => number }).__azar;
    });
  }
}

const opciones = (page: Page): Locator => page.locator('[class*="opcionesGrid"] button');
const aviso = (page: Page): Locator => page.locator('[class*="feedbackBanner"]');

async function textosOpcion(page: Page): Promise<string[]> {
  const etiquetas = await opciones(page).evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') ?? ''));
  return etiquetas.map((e) => e.replace(/^Opción [A-D]: /, ''));
}

/** País preguntado y respuesta correcta según el banco, leídos del enunciado visible. */
async function fichaVisible(page: Page, modo: Modo): Promise<{ pais: Country; correcta: string }> {
  let pais: Country | undefined;
  if (modo === 'Bandera') {
    // Desde el hallazgo 2266 el aria-label no nombra el país: se lee el código de la clase fi-xx.
    pais = POR_CODIGO.get(codigoBandera(await page.locator('[class*="preguntaBandera"]').getAttribute('class')));
  } else {
    const destacado = norm(await page.locator('[class*="preguntaTexto"] strong').innerText());
    pais = modo === 'Capital' ? POR_NOMBRE.get(destacado) : POR_CAPITAL.get(destacado);
  }
  expect(pais, 'enunciado que no está en el banco').toBeTruthy();
  const p = pais as Country;
  return { pais: p, correcta: modo === 'Capital' ? p.capital : p.name };
}

/** Responde la pregunta visible. Devuelve el país y la letra (A-D) en que salió la correcta. */
async function responder(page: Page, modo: Modo, bien: boolean): Promise<{ pais: Country; letra: string }> {
  const { pais, correcta } = await fichaVisible(page, modo);
  const ops = await textosOpcion(page);
  expect(ops, 'toda pregunta ofrece 4 opciones').toHaveLength(4);
  const iC = ops.indexOf(correcta);
  expect(iC, `la correcta «${correcta}» no está entre las ofrecidas`).toBeGreaterThanOrEqual(0);
  await opciones(page).nth(bien ? iC : iC === 0 ? 1 : 0).click();
  await expect(aviso(page)).toBeVisible();
  for (let i = 0; i < 4; i++) await expect(opciones(page).nth(i)).toBeDisabled();
  return { pais, letra: 'ABCD'[iC] };
}

async function avanzar(page: Page): Promise<string> {
  const boton = page.locator('[class*="btnSiguiente"]');
  const rotulo = norm(await boton.innerText());
  await boton.click();
  return rotulo;
}

/** Juega hasta el final: las `aciertos` primeras bien y el resto mal. */
async function jugar(page: Page, modo: Modo, aciertos: number): Promise<{ paises: Country[]; rotulos: string[] }> {
  const paises: Country[] = [];
  const rotulos: string[] = [];
  const numero = page.locator('[class*="preguntaNumero"]');
  for (let n = 1; n <= 30; n++) {
    const antes = norm(await numero.innerText());
    const { pais } = await responder(page, modo, n <= aciertos);
    paises.push(pais);
    const rotulo = await avanzar(page);
    rotulos.push(rotulo);
    if (/Ver resultados/.test(rotulo)) break;
    await expect(numero).not.toHaveText(antes);
  }
  return { paises, rotulos };
}

async function hud(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[class*="hudItem"]')].map((h) => [
        (h.querySelector('[class*="hudLabel"]')?.textContent ?? '').trim(),
        (h.querySelector('[class*="hudValor"]')?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim(),
      ]),
    ),
  );
}

async function resultado(page: Page) {
  await expect(page.locator('[class*="resultadoTitulo"]')).toBeVisible();
  return page.evaluate(() => {
    // Se colapsan solo los blancos ASCII: `\s` incluye U+00A0 y borraría el espacio duro del «70 %».
    const t = (s: string): string => (document.querySelector(s)?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim();
    return {
      emoji: t('[class*="resultadoEmoji"]'),
      titulo: t('[class*="resultadoTitulo"]'),
      puntos: t('[class*="resultadoPuntos"]'),
      subtitulo: t('[class*="resultadoSubtitulo"]'),
      stats: Object.fromEntries(
        [...document.querySelectorAll('[class*="statsResultado"] > div')].map((c) => [
          (c.querySelector('[class*="statRLabel"]')?.textContent ?? '').trim(),
          (c.querySelector('[class*="statRValor"]')?.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim(),
        ]),
      ),
    };
  });
}

interface Barrido {
  letras: Record<string, number>;
  continentes: Record<string, number>;
  gemelas: string[];
}

/**
 * Juega `partidas` partidas enteras DENTRO de la página (clics reales del DOM que atiende React),
 * acertando siempre: es la forma de llegar a cientos de respuestas sin que el test dure minutos.
 * Con `semilla`, Math.random = mulberry32(semilla) solo durante el clic en «Empezar Quiz».
 */
async function barrer(page: Page, modo: Modo, nivel: Nivel, partidas: number, semilla?: number): Promise<Barrido> {
  await configurar(page, modo, nivel);
  const banco = countries.map((c) => ({ name: c.name, capital: c.capital, continent: c.continent, code: c.code }));
  return page.evaluate(
    async ({ modo, partidas, banco, semilla }) => {
      const porNombre = new Map(banco.map((p) => [p.name, p]));
      const porCapital = new Map(banco.map((p) => [p.capital, p]));
      const porCodigo = new Map(banco.map((p) => [p.code, p]));
      const esperar = async (fn: () => unknown, max = 4000): Promise<void> => {
        const t0 = performance.now();
        while (performance.now() - t0 < max) {
          if (fn()) return;
          await new Promise((r) => setTimeout(r, 0));
        }
        throw new Error('la partida no avanzó');
      };
      const boton = (re: RegExp): HTMLButtonElement | undefined =>
        [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => re.test(b.textContent ?? ''));
      const mulberry32 = (a: number) => (): number => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const letras: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      const continentes: Record<string, number> = {};
      const gemelas: string[] = [];
      const PARES = [['id', 'mc'], ['td', 'ro']];
      for (let g = 0; g < partidas; g++) {
        const arranque = g === 0 ? boton(/Empezar Quiz/) : boton(/Jugar de nuevo/);
        const original = Math.random;
        if (semilla !== null) Math.random = mulberry32(semilla + g);
        try {
          arranque?.click();
        } finally {
          Math.random = original;
        }
        await esperar(() => document.querySelector('[class*="preguntaTexto"]'));
        for (;;) {
          const num = document.querySelector('[class*="preguntaNumero"]')?.textContent ?? '';
          const destacado = document.querySelector('[class*="preguntaTexto"] strong')?.textContent ?? '';
          const bandera = (document.querySelector('[class*="preguntaBandera"]')?.getAttribute('class') ?? '').match(/\bfi-([a-z]{2})\b/)?.[1] ?? '';
          const pais = modo === 'Capital' ? porNombre.get(destacado) : modo === 'País' ? porCapital.get(destacado) : porCodigo.get(bandera);
          if (!pais) throw new Error(`enunciado fuera del banco en ${num}`);
          const correcta = modo === 'Capital' ? pais.capital : pais.name;
          const ops = [...document.querySelectorAll<HTMLButtonElement>('[class*="opcionesGrid"] button')];
          const textos = ops.map((b) => (b.getAttribute('aria-label') ?? '').replace(/^Opción [A-D]: /, ''));
          const iC = textos.indexOf(correcta);
          if (iC < 0) throw new Error(`la correcta ${correcta} no está en ${textos.join(', ')}`);
          letras['ABCD'[iC]]++;
          continentes[pais.continent] = (continentes[pais.continent] ?? 0) + 1;
          if (modo === 'Bandera') {
            const codigos = textos.map((t) => porNombre.get(t)?.code ?? '');
            for (const [a, b] of PARES)
              if ((pais.code === a || pais.code === b) && codigos.includes(a) && codigos.includes(b))
                gemelas.push(`partida ${g + 1} · ${num}: bandera de ${pais.name} con opciones ${textos.join(' / ')}`);
          }
          ops[iC].click();
          await esperar(() => document.querySelector('[class*="feedbackBanner"]'));
          const siguiente = boton(/Siguiente pregunta|Ver resultados/);
          const ultima = /Ver resultados/.test(siguiente?.textContent ?? '');
          siguiente?.click();
          if (ultima) {
            await esperar(() => document.querySelector('[class*="resultadoPanel"]'));
            break;
          }
          await esperar(() => document.querySelector('[class*="preguntaNumero"]')?.textContent !== num);
        }
      }
      return { letras, continentes, gemelas };
    },
    { modo, partidas, banco, semilla: semilla ?? null },
  );
}

/** Contraste del texto de `sel` contra su fondo efectivo (capas semitransparentes compuestas). */
async function contraste(page: Page, sel: string): Promise<number | null> {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const parse = (c: string) => {
      const m = (c.match(/[\d.]+/g) ?? ['0', '0', '0', '0']).map(Number);
      return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
    };
    type C = ReturnType<typeof parse>;
    const sobre = (a: C, b: C): C => ({ r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1 });
    const lum = (c: C): number => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const capas: C[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg.a > 0) {
        capas.push(bg);
        if (bg.a >= 1) break;
      }
    }
    let base: C = { r: 255, g: 255, b: 255, a: 1 };
    if (capas.length && capas[capas.length - 1].a >= 1) base = capas.pop() as C;
    for (let i = capas.length - 1; i >= 0; i--) base = sobre(capas[i], base);
    let fg = parse(getComputedStyle(el).color);
    if (fg.a < 1) fg = sobre(fg, base);
    const a = lum(fg);
    const b = lum(base);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, sel);
}

const chi2 = (letras: Record<string, number>): { total: number; valor: number } => {
  const total = Object.values(letras).reduce((a, b) => a + b, 0);
  return { total, valor: Object.values(letras).reduce((s, o) => s + (o - total / 4) ** 2 / (total / 4), 0) };
};

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Quiz Países y Capitales · partida', () => {
  /**
   * CASO NORMAL — Capital/Fácil, 7 bien y 3 mal.
   * Esperado a mano: 10 preguntas distintas, todas de Europa (Fácil = ['Europa']); acierto →
   * «¡Correcto! La respuesta es <capital>.» y fallo → «Incorrecto. La respuesta correcta es
   * <capital>.»; 7/10 = 0,7 → 60 + 0 = 60 pts, ⭐ «¡Muy buena puntuación!», «7 de 10 respuestas
   * correctas», Correctas «7/10», Acierto 70 %. La décima pregunta ofrece «Ver resultados».
   */
  test('caso normal: 7 de 10 en Fácil dan 60 pts y «¡Muy buena puntuación!»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);
    await arrancar(page, 'Capital', 'Fácil');
    expect(await hud(page)).toMatchObject({ Pregunta: '1/10', Correctas: '0' });

    const primera = await fichaVisible(page, 'Capital');
    await responder(page, 'Capital', true);
    await expect(aviso(page)).toContainText(`¡Correcto! La respuesta es ${primera.correcta}.`);
    expect((await hud(page)).Correctas).toBe('1');
    await avanzar(page);
    const segunda = await fichaVisible(page, 'Capital');
    await responder(page, 'Capital', false);
    await expect(aviso(page)).toContainText(`Incorrecto. La respuesta correcta es ${segunda.correcta}.`);
    expect((await hud(page)).Correctas, 'un fallo no suma').toBe('1');
    await expect(page.locator('[class*="opcionesGrid"] button[class*="opcionCorrecta"]')).toHaveCount(1);
    await expect(page.locator('[class*="opcionesGrid"] button[class*="opcionIncorrecta"]')).toHaveCount(1);
    await avanzar(page);

    // Quedan 8: 6 bien y 2 mal → 7 aciertos en total
    const { paises, rotulos } = await jugar(page, 'Capital', 6);
    const todos = [primera.pais, segunda.pais, ...paises];
    expect(todos).toHaveLength(10);
    expect(new Set(todos.map((p) => p.name)).size, 'país repetido en la misma partida').toBe(10);
    expect(todos.every((p) => p.continent === 'Europa'), 'Fácil ha colado otro continente').toBe(true);
    expect(rotulos.at(-1)).toBe('Ver resultados');

    const r = await resultado(page);
    expect(r.titulo).toBe('¡Muy buena puntuación!');
    expect(r.emoji).toBe('⭐');
    expect(r.puntos).toBe('60 pts');
    expect(r.subtitulo).toBe('7 de 10 respuestas correctas');
    expect(r.stats.Correctas).toBe('7/10');
    expect(r.stats.Acierto).toMatch(porcentaje(70));
  });

  /**
   * CASO LÍMITE — cero aciertos en Fácil, «Jugar de nuevo» y pleno en Normal.
   * Esperado a mano: 0/10 → 0·80 = 0 pts, 📚 «Sigue practicando», «0/10», 0 %. «Jugar de nuevo»
   * vuelve a «1/10», 0 correctas y reparte otra tanda. 15/15 → 100 pts, 🏆 «¡Geógrafo experto!».
   */
  test('caso límite: 0 de 10 da 0 pts y 15 de 15 da 100 pts', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    await arrancar(page, 'Capital', 'Fácil');
    const tanda1 = (await jugar(page, 'Capital', 0)).paises.map((p) => p.name);
    let r = await resultado(page);
    expect(r.titulo).toBe('Sigue practicando');
    expect(r.emoji).toBe('📚');
    expect(r.puntos).toBe('0 pts');
    expect(r.stats.Correctas).toBe('0/10');
    expect(r.stats.Acierto).toMatch(porcentaje(0));

    await page.getByRole('button', { name: /Jugar de nuevo/ }).click();
    expect(await hud(page)).toMatchObject({ Pregunta: '1/10', Correctas: '0' });
    const tanda2 = (await jugar(page, 'Capital', 0)).paises.map((p) => p.name);
    // Misma tanda y mismo orden: 1 / (45·44·…·36) ≈ 3·10⁻¹⁶
    expect(tanda2.join(','), '«Jugar de nuevo» ha repetido la tanda').not.toBe(tanda1.join(','));

    await page.getByRole('button', { name: /Cambiar modo/ }).click();
    await arrancar(page, 'Capital', 'Normal');
    const { paises } = await jugar(page, 'Capital', 99);
    expect(paises).toHaveLength(15);
    r = await resultado(page);
    expect(r.titulo).toBe('¡Geógrafo experto!');
    expect(r.emoji).toBe('🏆');
    expect(r.puntos).toBe('100 pts');
    expect(r.subtitulo).toBe('15 de 15 respuestas correctas');
    expect(r.stats.Acierto).toMatch(porcentaje(100));
  });

  /**
   * LO QUE NO DEBE OCURRIR — doble clic en la correcta, clic en otra opción ya respondida y doble
   * clic en «Siguiente». Esperado: `responder` sale por `seleccionada !== null` y las opciones quedan
   * disabled → 1 acierto, no 2; el doble clic en «Siguiente» avanza UNA pregunta.
   */
  test('caso de rechazo: el doble clic no puntúa doble ni salta preguntas', async ({ page }) => {
    await abrir(page);
    await arrancar(page, 'País', 'Fácil');
    const { correcta } = await fichaVisible(page, 'País');
    const ops = await textosOpcion(page);
    const iC = ops.indexOf(correcta);
    await opciones(page).nth(iC).dblclick();
    await opciones(page).nth(iC === 0 ? 1 : 0).click({ force: true });
    await expect(aviso(page)).toContainText('¡Correcto!');
    expect((await hud(page)).Correctas).toBe('1');
    await expect(page.locator('[class*="opcionesGrid"] button[class*="opcionIncorrecta"]')).toHaveCount(0);
    await page.locator('[class*="btnSiguiente"]').dblclick();
    await expect(page.locator('[class*="preguntaNumero"]')).toHaveText('Pregunta 2 de 10');
    await expect(aviso(page)).toHaveCount(0);
  });

  /**
   * BARAJADO — forma (4) de la familia: ¿sacaría nota «pulsar siempre la misma letra»?
   * 8 partidas Maestro en modo Capital = 240 respuestas; con reparto uniforme el χ² (3 g. l.) supera
   * 16,27 solo 1 de cada 1.000 veces. Medido 26/09/2026: χ² = 2,19 sobre 5.280.
   */
  test('sano · barajado: la correcta se reparte entre A, B, C y D (χ² < 16,27)', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);
    const { letras } = await barrer(page, 'Capital', 'Maestro', 8);
    const { total, valor } = chi2(letras);
    expect(total).toBe(240);
    expect(valor, `reparto de la correcta ${JSON.stringify(letras)}`).toBeLessThan(16.27);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 26/09/2026 · hallazgos de la partida', () => {
  test('hallazgo · «Normal» añade América a Europa, como promete la guía', async ({ page }) => {
    // page.tsx:25-27 filtra por continent === 'América', pero data/countries.ts usa «América del
    // Norte», «América Central» y «América del Sur»: el filtro no casa nunca. Medido 26/09/2026 en
    // 12 partidas por modo: Normal 540 de 540 europeos, Difícil solo Europa + Asia, Experto solo
    // Europa + Asia + África. América (35 países) solo sale en Maestro. Con Europa + América (80),
    // P(0 americanos en 15) = C(45,15)/C(80,15) ≈ 3·10⁻⁵.
    // REPARADO (hallazgo 2262): page.tsx compara con enRegion(), que acepta «América» + « del Norte»…
    test.setTimeout(60_000);
    await abrir(page);
    const { continentes } = await barrer(page, 'Capital', 'Normal', 1);
    const americanos = Object.entries(continentes).filter(([c]) => AMERICA.test(c)).reduce((s, [, n]) => s + n, 0);
    expect(americanos, `continentes de una partida Normal: ${JSON.stringify(continentes)}`).toBeGreaterThan(0);
  });

  test('reparto de cada nivel: solo sus regiones, y todas ellas salen', async ({ page }) => {
    // Reparto del banco (contado en data/countries.ts): Europa 45 · América 35 (Norte 3, Central 20,
    // Sur 12) · Asia 48 · África 54 · Oceanía 14. Pools: Fácil 45 · Normal 80 · Difícil 128 · Experto
    // 182. Con 4 partidas por nivel, que una región del pool no salga nunca es improbable: la peor,
    // América en Difícil (35 de 128, 80 preguntas), P ≈ (93/128)^80 ≈ 10⁻¹¹.
    test.setTimeout(180_000);
    const REGIONES: Record<Exclude<Nivel, 'Maestro'>, string[]> = {
      Fácil: ['Europa'],
      Normal: ['Europa', 'América'],
      Difícil: ['Europa', 'América', 'Asia'],
      Experto: ['Europa', 'América', 'Asia', 'África'],
    };
    const region = (c: string): string => (AMERICA.test(c) ? 'América' : c);
    for (const [nivel, esperadas] of Object.entries(REGIONES) as [Exclude<Nivel, 'Maestro'>, string[]][]) {
      await abrir(page);
      const { continentes } = await barrer(page, 'Capital', nivel, 4);
      const vistas = [...new Set(Object.keys(continentes).map(region))].sort();
      expect(vistas, `${nivel}: ${JSON.stringify(continentes)}`).toEqual([...esperadas].sort());
    }
  });

  test('hallazgo · la Precisión del marcador no pasa del 100 %', async ({ page }) => {
    // page.tsx:232 — `correctas / Math.max(preguntaActual, 1)`: el denominador es el ÍNDICE de la
    // pregunta, no las respondidas. Dos aciertos seguidos → 2/1 = «200%»; luego 150, 133… y 15 de 15
    // en Normal termina en «107%».
    // REPARADO (hallazgo 2263): aciertos / respondidas. Antes de responder la primera, «—».
    await abrir(page);
    await arrancar(page, 'Capital', 'Fácil');
    expect((await hud(page)).Precisión, 'sin respuestas no hay precisión').toBe('—');
    await responder(page, 'Capital', true);
    expect((await hud(page)).Precisión).toMatch(porcentaje(100));
    await avanzar(page);
    expect((await hud(page)).Precisión, '1 de 1 respondida, con la 2 aún sin contestar').toMatch(porcentaje(100));
    await responder(page, 'Capital', true);
    expect((await hud(page)).Precisión, '2 aciertos de 2 respondidas').toMatch(porcentaje(100));
    await avanzar(page);
    await responder(page, 'Capital', false);
    // 2 / 3 = 0,666… → 67 %
    expect((await hud(page)).Precisión, '2 aciertos de 3 respondidas').toMatch(porcentaje(67));
  });

  test('hallazgo · el porcentaje va separado con espacio duro y el tiempo con unidades («70 %», «5 s»)', async ({ page }) => {
    // Ortografía RAE 2010 y regla de formato del 25/09/2026: page.tsx:232 y :342 pegan el «%».
    // page.tsx:160 escribe «1m 5s»: «m» es el metro; el minuto es «min» y va separado.
    // REPARADO (hallazgo 2270): formatPercentage de @/lib y formatTiempo con «min» y «s».
    test.setTimeout(60_000);
    await abrir(page);
    await arrancar(page, 'Capital', 'Fácil');
    const fallos: string[] = [];
    await responder(page, 'Capital', true);
    const precision = (await hud(page)).Precisión;
    if (!precision.includes(`${DURO}%`)) fallos.push(`Precisión «${precision}»`);
    await avanzar(page);
    await jugar(page, 'Capital', 6);
    const r = await resultado(page);
    if (r.stats.Acierto !== `70${DURO}%`) fallos.push(`Acierto «${r.stats.Acierto}»`);
    if (!/^\d+ s$|^\d+ min \d+ s$/.test(r.stats.Tiempo)) fallos.push(`Tiempo «${r.stats.Tiempo}»`);
    expect(fallos).toEqual([]);
  });

  test('hallazgo · el foco no cae a <body> al empezar, al responder ni al pasar de pregunta', async ({ page }) => {
    // page.tsx:177/295/306 — «Empezar Quiz» se desmonta, la opción pulsada queda disabled y
    // «Siguiente» se desmonta. Medido: tras «Siguiente» el primer Tab cae en «Ver guía educativa» y
    // hacen falta 18 Tab para volver a la opción A.
    // REPARADO (hallazgo 2264): el foco va a la tarjeta de la pregunta (tabIndex −1) al empezar y
    // al avanzar, y a «Siguiente» al responder. Se comprueba además DÓNDE cae, no solo que no sea <body>.
    const enBody = () => page.evaluate(() => document.activeElement === document.body || document.activeElement === null);
    await abrir(page);
    await page.getByRole('button', { name: /Empezar Quiz/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
    const tras: string[] = [];
    if (await enBody()) tras.push('Empezar');
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    const { correcta } = await fichaVisible(page, 'Capital');
    await opciones(page).nth((await textosOpcion(page)).indexOf(correcta)).focus();
    await page.keyboard.press('Enter');
    await expect(aviso(page)).toBeVisible();
    if (await enBody()) tras.push('responder');
    await expect(page.locator('[class*="btnSiguiente"]')).toBeFocused();
    // Enter directamente sobre el foco que dejó la app, sin volver a enfocarlo a mano.
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaNumero"]')).toHaveText('Pregunta 2 de 15');
    if (await enBody()) tras.push('Siguiente');
    await expect(page.locator('[class*="preguntaCard"]')).toBeFocused();
    // Un solo Tab desde la tarjeta lleva a la opción A (antes hacían falta 18).
    await page.keyboard.press('Tab');
    await expect(opciones(page).nth(0)).toBeFocused();
    expect(tras, 'acciones tras las que el foco acaba en <body>').toEqual([]);
  });

  test('hallazgo · ni la región viva ni los botones de nivel anuncian emojis', async ({ page }) => {
    // page.tsx:314-315 — «✅ ¡Correcto!…» / «❌ Incorrecto…» son CADENAS dentro de role="alert" (con
    // aria-live="polite" en el mismo nodo). page.tsx:24-28 — «🟢 Fácil», «🟡 Normal»… van en la
    // etiqueta del nivel y forman su nombre accesible. check:a11y-jsx no ve ninguno (solo mira JSX).
    // REPARADO (hallazgo 2267): el emoji va en su <span aria-hidden="true">, en el aviso y en el
    // nivel. El nombre accesible del botón se mide igual que la región viva, sin los nodos ocultos
    // (la primera versión leía textContent, que incluye lo aria-hidden y no es lo que oye el lector).
    // Se comprueba además que el nombre accesible es exactamente la etiqueta.
    await abrir(page);
    const nombres = await page.locator('[class*="difBtn"]').evaluateAll((bs) =>
      bs.map((b) => {
        const clon = b.cloneNode(true) as HTMLElement;
        clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
        return (clon.textContent ?? '').replace(/\s+/g, ' ').trim();
      }),
    );
    expect(nombres).toEqual(['Fácil', 'Normal', 'Difícil', 'Experto', 'Maestro']);
    for (const nivel of nombres) await expect(page.getByRole('button', { name: nivel, exact: true })).toHaveCount(1);
    await arrancar(page, 'Capital', 'Fácil');
    await responder(page, 'Capital', true);
    const vivas = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-live], [role="alert"], [role="status"]')]
        .filter((r) => r.id !== '__next-route-announcer__' && r.className.includes('feedbackBanner'))
        .map((r) => {
          const clon = r.cloneNode(true) as HTMLElement;
          clon.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
          return (clon.textContent ?? '').replace(/\s+/g, ' ').trim();
        }),
    );
    expect(vivas.length, 'no hay región viva en el aviso').toBeGreaterThan(0);
    const conEmoji = [...vivas, ...nombres].filter((t) => /\p{Extended_Pictographic}/u.test(t));
    expect(conEmoji).toEqual([]);
  });

  test('hallazgo · en modo Bandera la alternativa textual no dice el país que se pregunta', async ({ page }) => {
    // page.tsx:254-258 — role="img" aria-label={`Bandera de ${pais.name}`}: el lector de pantalla lee
    // la respuesta. WCAG 1.1.1 admite que un ejercicio no dé la alternativa equivalente, pero no que
    // la dé resuelta: lo coherente es describir la bandera («franja roja sobre franja blanca»).
    // REPARADO (hallazgo 2266): aria-label «Bandera a identificar», sin nombre. Se recorre la
    // partida entera y se mira que ninguna opción ofrecida aparezca en el nombre accesible.
    test.setTimeout(60_000);
    await abrir(page);
    await arrancar(page, 'Bandera', 'Fácil');
    const numero = page.locator('[class*="preguntaNumero"]');
    for (let n = 1; n <= 10; n++) {
      const { pais } = await fichaVisible(page, 'Bandera');
      const nombre = (await page.locator('[class*="preguntaBandera"]').getAttribute('aria-label')) ?? '';
      expect(nombre).toBe('Bandera a identificar');
      for (const op of await textosOpcion(page)) expect(nombre, `pregunta ${n}`).not.toContain(op);
      expect(nombre).not.toContain(pais.name);
      await responder(page, 'Bandera', true);
      const antes = norm(await numero.innerText());
      const rotulo = await avanzar(page);
      if (/Ver resultados/.test(rotulo)) break;
      await expect(numero).not.toHaveText(antes);
    }
  });

  test('hallazgo · en modo Bandera no salen juntas dos banderas gemelas (Indonesia / Mónaco)', async ({ page }) => {
    // flag-icons dibuja a 4:3 Indonesia (#e70011 sobre blanco) y Mónaco (#f31830 sobre blanco) con la
    // misma geometría; Chad y Rumanía solo difieren en un tono de azul. generarOpciones() saca los
    // distractores del pool sin excluirlas. Medido 26/09/2026: 2 preguntas indecidibles en 96 partidas
    // Bandera/Difícil. Con la semilla 158 la pregunta 2 es la bandera de Indonesia con «Mónaco» de
    // opción. El invariante se comprueba en la partida entera, para que siga valiendo tras reparar.
    // REPARADO (hallazgo 2268): BANDERAS_GEMELAS en page.tsx saca a la gemela de los distractores.
    // Con la reparación de América (2262) el pool de Difícil cambió y la semilla 158 ya no lleva a la
    // pregunta indecidible. El caso que sigue reproduce el defecto con el pool nuevo: simulado el
    // 26/09/2026 con el algoritmo SIN exclusión, la semilla 307 da en la pregunta 7 la bandera de
    // Indonesia con «Indonesia / Afganistán / Mónaco / Irlanda». La exclusión no cambia cuántos
    // números aleatorios se consumen antes de esa pregunta (ninguna anterior tiene gemela), así que
    // tras reparar la pregunta 7 sigue siendo Indonesia y «Mónaco» no puede estar entre las opciones.
    test.setTimeout(60_000);
    await abrir(page);
    const { gemelas } = await barrer(page, 'Bandera', 'Difícil', 1, 307);
    expect(gemelas).toEqual([]);
    await page.getByRole('button', { name: /Cambiar modo/ }).click();
    await arrancarConSemilla(page, 'Bandera', 'Difícil', 307);
    for (let n = 1; n < 7; n++) {
      await responder(page, 'Bandera', true);
      await avanzar(page);
      await expect(page.locator('[class*="preguntaNumero"]')).toHaveText(`Pregunta ${n + 1} de 20`);
    }
    const { pais } = await fichaVisible(page, 'Bandera');
    expect(pais.name, 'la semilla 307 ya no lleva a Indonesia en la pregunta 7: el caso no mide lo que dice').toBe('Indonesia');
    const ops = await textosOpcion(page);
    expect(ops).toContain('Indonesia');
    expect(ops).not.toContain('Mónaco');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Inspector 26/09/2026 · contraste', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`hallazgo · botones y textos de marca con 4,5:1 (${tema === 'light' ? 'claro' : 'oscuro'})`, async ({ page }) => {
      // Blanco sobre #2E86AB = 4,11:1 en «Empezar Quiz», modo y nivel activos, «Siguiente», «Jugar de
      // nuevo» y números de la guía, en AMBOS temas: .container redeclara --primary (#2E86AB) y pisa
      // el #3FA5D1 oscuro de globals (existe --primary-boton, 5,47:1). Letra blanca sobre el verde
      // #48BB78 2,43:1 y sobre el rojo #FC8181 2,44:1. Texto de marca pequeño: pregunta del FAQ
      // 3,77 / 3,21 (oscuro) y fila de región de la tabla 3,74 / 2,95 (oscuro).
      // REPARADO (hallazgo 2265): .container ya no redeclara la marca; fondos con --primary-boton,
      // texto de marca con --primary-texto, letra oscura sobre verde y rojo, franja de región oscura
      // al 0,08.
      test.setTimeout(90_000);
      await abrir(page, tema);
      const fallos: string[] = [];
      const medir = async (nombre: string, sel: string) => {
        const r = await contraste(page, sel);
        if (r !== null && r < 4.5) fallos.push(`${nombre} ${r.toFixed(2)}`);
      };
      await configurar(page, 'Capital', 'Fácil');
      await page.mouse.move(0, 0);
      await expect
        .poll(() => botonNivel(page, 'Fácil').evaluate((b) => getComputedStyle(b).color))
        .toBe('rgb(255, 255, 255)');
      await medir('nivel activo', '[class*="difBtn"][aria-pressed="true"]');
      await medir('modo activo', '[class*="modoBtn"][aria-pressed="true"] [class*="modoNombre"]');
      await medir('Empezar Quiz', '[class*="btnIniciar"]');
      await page.getByRole('button', { name: /Empezar Quiz/ }).click();
      const { correcta } = await fichaVisible(page, 'Capital');
      const ops = await textosOpcion(page);
      const iC = ops.indexOf(correcta);
      const iM = iC === 0 ? 1 : 0;
      await opciones(page).nth(iM).click();
      await opciones(page).nth(iC).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-ok'; });
      await opciones(page).nth(iM).locator('[class*="opcionLetra"]').evaluate((e) => { e.id = 'letra-mal'; });
      await expect
        .poll(() => page.evaluate(() => getComputedStyle(document.getElementById('letra-ok') as Element).backgroundColor))
        .toBe('rgb(72, 187, 120)');
      await medir('letra sobre verde', '#letra-ok');
      await medir('letra sobre rojo', '#letra-mal');
      await medir('Siguiente', '[class*="btnSiguiente"]');
      await avanzar(page);
      await jugar(page, 'Capital', 0);
      await medir('Jugar de nuevo', '[class*="btnRejugar"]');
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await medir('número de paso', '[class*="stepNumber"]');
      await medir('pregunta del FAQ', '[class*="faqItem"] dt');
      await medir('fila de región de la tabla', '[class*="tableRegion"]');
      expect(fallos).toEqual([]);
    });
  }

  test('sano · el oscuro conserva el verde y el rojo de correcta/incorrecta (forma 7)', async ({ page }) => {
    await abrir(page, 'dark');
    await arrancar(page, 'Capital', 'Fácil');
    const { correcta } = await fichaVisible(page, 'Capital');
    const iC = (await textosOpcion(page)).indexOf(correcta);
    const iM = iC === 0 ? 1 : 0;
    await opciones(page).nth(iM).click();
    await expect(opciones(page).nth(iC)).toHaveCSS('color', 'rgb(104, 211, 145)');
    await expect(opciones(page).nth(iC)).toHaveCSS('border-top-color', 'rgb(72, 187, 120)');
    await expect(opciones(page).nth(iM)).toHaveCSS('color', 'rgb(252, 129, 129)');
    await expect(opciones(page).nth(iM)).toHaveCSS('border-top-color', 'rgb(252, 129, 129)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Móvil de 360 px (forma (2) de la familia). La barra fija del logo ocupa y = 0…62.
 *
 * Lo que decide si la pregunta nueva se ve es el SCROLL que queda de la anterior, no el azar del
 * test: si para llegar a «Siguiente» hay que bajar (la respuesta es incorrecta, y su aviso es más
 * largo, o la correcta cae abajo), la página conserva ese desplazamiento y la pregunta 2 se pinta
 * por encima de la vista. Barrido del 26/09/2026 pulsando siempre la opción A con Math.random =
 * mulberry32(1…40) durante «Empezar Quiz»: 33 de 40 partidas con el enunciado fuera (scrollY 824,
 * enunciado en y = −217…−129); las 7 limpias son justo aquellas en que la A era la correcta.
 * La primera versión de este bloque afirmaba «sano» porque medía acertando: pasaba o fallaba según
 * la pregunta que tocara (2 de 10 corridas en rojo). Por eso ahora cada caso fija su semilla:
 *   · semilla 3 → P1 Ucrania, la A es Kiev (correcta): no hay que bajar → control en verde.
 *   · semilla 1 → P1 Rusia, la A es Bucarest (incorrecta): hay que bajar → hallazgo.
 */
test.describe('Inspector 26/09/2026 · móvil 360 × 740', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const tocar = async (page: Page, loc: Locator): Promise<void> => {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    if (!b) throw new Error('el elemento no tiene caja');
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  };
  /** Líneas de texto de las clases dadas que quedan fuera de la vista o bajo la barra fija. */
  const tapadas = (page: Page, clases: string[]): Promise<string[]> =>
    page.evaluate((cls) => {
      const barra = document.querySelector('[class*="headerBar"]');
      const tapa = barra ? barra.getBoundingClientRect() : null;
      const fuera: string[] = [];
      for (const clase of cls) {
        for (const el of document.querySelectorAll(`[class*="${clase}"]`)) {
          const rango = document.createRange();
          rango.selectNodeContents(el);
          for (const l of rango.getClientRects())
            if (l.top < 0 || l.bottom > innerHeight || (tapa && l.top < tapa.bottom && l.bottom > tapa.top))
              fuera.push(`${clase} ${Math.round(l.top)}…${Math.round(l.bottom)}`);
        }
      }
      return [...new Set(fuera)];
    }, clases);

  /**
   * Fácil/Capital con Math.random = mulberry32(semilla) solo durante el toque en «Empezar Quiz»
   * (generarPreguntas() reparte ahí las 10 preguntas y sus opciones), pulsa la opción A de la
   * pregunta 1 y toca «Siguiente».
   */
  async function hastaSegunda(page: Page, semilla: number, p1: { pais: string; a: string }): Promise<void> {
    await abrir(page);
    await tocar(page, botonNivel(page, 'Fácil'));
    await page.evaluate((s) => {
      let a = s;
      (window as unknown as { __azar: () => number }).__azar = Math.random;
      Math.random = (): number => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }, semilla);
    try {
      await tocar(page, page.getByRole('button', { name: /Empezar Quiz/ }));
      await expect(page.locator('[class*="preguntaTexto"]')).toBeVisible();
    } finally {
      await page.evaluate(() => {
        Math.random = (window as unknown as { __azar: () => number }).__azar;
      });
    }
    // El reparto que da la semilla: si esto cambia, el caso ya no mide lo que dice.
    await expect(page.locator('[class*="preguntaTexto"] strong')).toHaveText(p1.pais);
    expect((await textosOpcion(page))[0]).toBe(p1.a);
    await expect.poll(() => tapadas(page, ['preguntaNumero', 'preguntaTexto']), { message: 'tras «Empezar Quiz»' }).toEqual([]);
    await tocar(page, opciones(page).nth(0));
    await expect(aviso(page)).toBeVisible();
    await tocar(page, page.locator('[class*="btnSiguiente"]'));
    await expect(page.locator('[class*="preguntaNumero"]')).toHaveText('Pregunta 2 de 10');
  }

  test('control · acertando con la A (semilla 3, Ucrania → Kiev) la pregunta 2 queda a la vista', async ({ page }) => {
    await hastaSegunda(page, 3, { pais: 'Ucrania', a: 'Kiev' });
    await expect(aviso(page)).toHaveCount(0);
    await expect.poll(() => tapadas(page, ['preguntaNumero', 'preguntaTexto']), { message: 'tras «Siguiente»' }).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });

  test('hallazgo · fallando la pregunta 1 (semilla 1, Rusia → Bucarest), la pregunta 2 se pinta por encima de la vista', async ({ page }) => {
    // Medido el 26/09/2026: scrollY 824 y enunciado en y = −217…−129; solo se ven las opciones.
    // REPARADO (hallazgo 2277): si el marcador o la tarjeta no se ven enteros, la vista sube al
    // principio del quiz, con scroll-margin-top de 88 px bajo la barra fija (forma de quiz-verbos).
    await hastaSegunda(page, 1, { pais: 'Rusia', a: 'Bucarest' });
    await page.waitForTimeout(300);
    expect(await tapadas(page, ['preguntaNumero', 'preguntaTexto'])).toEqual([]);
  });

  test('hallazgo · tras «Siguiente» el marcador (Pregunta, Correctas, Precisión) no queda bajo la barra fija', async ({ page }) => {
    // REPARADO (hallazgo 2269): el marcador es una de las claves que decide si la vista sube.
    await hastaSegunda(page, 1, { pais: 'Rusia', a: 'Bucarest' });
    await page.waitForTimeout(300);
    expect(await tapadas(page, ['hudValor'])).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONTENIDO DEL BANCO — cotejado el 26/09/2026 contra:
 * · RAE, Libro de estilo de la Justicia, apéndice 8 «Países y capitales, con sus gentilicios»
 *   (rae.es/libro-estilo-justicia/apéndice-8-países-y-capitales-con-sus-gentilicios), que recoge la
 *   lista de la Ortografía de 2010. Coinciden literalmente 172 de los 196 pares del banco.
 * · Wikipedia (en), «List of national capitals», para las capitales múltiples o discutidas.
 */
const capitalDe = (nombre: string): string => {
  const c = POR_NOMBRE.get(nombre);
  if (!c) throw new Error(`«${nombre}» no está en el banco`);
  return c.capital;
};

test.describe('Inspector 26/09/2026 · contenido del banco', () => {
  test('sano · 196 entradas sin nombres, capitales ni códigos repetidos', () => {
    expect(countries).toHaveLength(196);
    for (const campo of ['name', 'capital', 'code'] as const) expect(new Set(countries.map((c) => c[campo])).size, campo).toBe(196);
  });

  test('sano · muestra de 30 pares país → capital según la RAE', () => {
    // Valor escrito a mano desde el apéndice 8 de la RAE (grafía española).
    const RAE: [string, string][] = [
      ['Alemania', 'Berlín'], ['Moldavia', 'Chisináu'], ['Eslovenia', 'Liubliana'], ['Macedonia del Norte', 'Skopie'],
      ['Islandia', 'Reikiavik'], ['Ucrania', 'Kiev'], ['Kazajistán', 'Astaná'], ['Kirguistán', 'Biskek'],
      ['Turkmenistán', 'Asjabad'], ['Tayikistán', 'Dusambé'], ['Bután', 'Timbu'], ['Camboya', 'Nom Pen'],
      ['Corea del Norte', 'Pionyang'], ['Laos', 'Vientián'], ['Myanmar', 'Naipyidó'], ['Nigeria', 'Abuya'],
      ['Costa de Marfil', 'Yamusukro'], ['Tanzania', 'Dodoma'], ['Suiza', 'Berna'], ['Países Bajos', 'Ámsterdam'],
      ['Chad', 'Yamena'], ['Malaui', 'Lilongüe'], ['Mauritania', 'Nuakchot'], ['Sudán del Sur', 'Yuba'],
      ['Etiopía', 'Adís Abeba'], ['Bahamas', 'Nasáu'], ['Trinidad y Tobago', 'Puerto España'], ['Haití', 'Puerto Príncipe'],
      ['Tonga', 'Nukualofa'], ['Yemen', 'Saná'],
    ];
    for (const [pais, cap] of RAE) expect(capitalDe(pais), pais).toBe(cap);
  });

  test('sano · capitales múltiples: la del banco es una de las oficiales y la otra nunca es opción', () => {
    // RAE: Bolivia «CAPS. Sucre y La Paz» · Sudáfrica «Bloemfontein, Ciudad del Cabo y Pretoria» ·
    // Benín «Porto Novo y Cotonú» · Países Bajos «Ámsterdam» (Wikipedia: The Hague de facto) · Costa
    // de Marfil «Yamusukro» (Wikipedia: Abidjan, antigua capital) · Sri Lanka (Wikipedia: Sri
    // Jayawardenepura Kotte oficial, Colombo ejecutiva). Como ninguna otra ciudad está en el banco,
    // no puede salir como distractor y la pregunta tiene UNA respuesta posible.
    expect(capitalDe('Bolivia')).toBe('Sucre');
    expect(capitalDe('Sudáfrica')).toBe('Pretoria');
    expect(capitalDe('Benín')).toBe('Porto Novo');
    expect(capitalDe('Países Bajos')).toBe('Ámsterdam');
    expect(capitalDe('Costa de Marfil')).toBe('Yamusukro');
    expect(capitalDe('Sri Lanka')).toBe('Sri Jayawardenepura Kotte');
    const capitales = new Set(countries.map((c) => c.capital));
    for (const otra of ['La Paz', 'Ciudad del Cabo', 'Bloemfontein', 'Cotonú', 'La Haya', 'Abiyán', 'Colombo', 'Lobamba', 'Almatý'])
      expect(capitales.has(otra), otra).toBe(false);
  });

  test('hallazgo · Antigua y Barbuda: la capital es Saint John’s, no «Saint John»', () => {
    // RAE, apéndice 8: «Antigua y Barbuda. […] CAP. Saint John’s». «Saint John» es otra ciudad (en
    // Nuevo Brunswick, Canadá). data/countries.ts escribía «Saint John».
    // REPARADO (hallazgo 2271): «Saint John’s», con el apóstrofo tipográfico de la RAE.
    expect(capitalDe('Antigua y Barbuda')).toMatch(/^Saint John[’']s$/);
  });

  test('hallazgo · grafía de las capitales según la RAE', () => {
    // RAE, apéndice 8: Andorra la Vieja · Nueva Deli · Amán · Camberra · Babane (y Lobamba) ·
    // Port-Louis · Washington D. C. El banco traía la forma local o inglesa.
    // REPARADO (hallazgo 2272): cotejado de nuevo contra la página de la RAE el 26/09/2026.
    const RAE: Record<string, string> = {
      Andorra: 'Andorra la Vieja',
      India: 'Nueva Deli',
      Jordania: 'Amán',
      Australia: 'Camberra',
      Esuatini: 'Babane',
      Mauricio: 'Port-Louis',
      'Estados Unidos': 'Washington D. C.',
    };
    const distintas = Object.entries(RAE)
      .filter(([pais, cap]) => capitalDe(pais) !== cap)
      .map(([pais, cap]) => `${pais}: «${capitalDe(pais)}» (RAE «${cap}»)`);
    expect(distintas).toEqual([]);
  });

  test('hallazgo · Jerusalén y Ramala no se presentan como respuesta única sin matiz', async ({ page }) => {
    // RAE, apéndice 8: «Israel […] CAP. (no reconocida por la ONU). Jerusalén» y «Palestina […] CAP.
    // (no reconocida por la ONU). Jerusalén». Wikipedia, «List of national capitals»: Ramallah (de
    // facto). El banco da «Jerusalén» a Israel y «Ramala» a Palestina como única respuesta, y ni el
    // aviso ni la guía lo matizan (antipatrón 6 de neutralidad).
    // Pasa si el banco deja de dar «Jerusalén» a secas o si la guía lo matiza.
    // REPARADO (hallazgo 2273): la FAQ de la guía lo matiza; el aviso de respuesta, en el test siguiente.
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = norm(await page.locator('body').innerText());
    const matizado = /Jerusal[ée]n[^.]*(ONU|reconoc|disput)|(ONU|reconoc|disput)[^.]*Jerusal[ée]n/.test(texto);
    const sinMatiz = capitalDe('Israel') === 'Jerusalén' && capitalDe('Palestina') === 'Ramala' && !matizado;
    expect(sinMatiz, 'Israel → «Jerusalén» y Palestina → «Ramala» sin matiz en la página').toBe(false);
  });

  test('hallazgo · el FAQ de la metadata no usa «Nur-Sultán» ni grafías ajenas al banco', async ({ page }) => {
    // metadata.ts:86 — «Nur-Sultán (Kazajistán), Naypyidaw (Myanmar), Yamoussoukro (Costa de Marfil)»
    // y, en la misma respuesta, «Astana». Wikipedia: «Astana was named Nur-Sultan from 2019 to 2022».
    // El banco (y la RAE) dicen Astaná, Naipyidó y Yamusukro. Es el FAQPage que leen los asistentes.
    // REPARADO (hallazgo 2274).
    await abrir(page);
    const faq = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' '));
    expect(faq).toContain('FAQPage');
    const ajenas = ['Nur-Sult', 'Naypyidaw', 'Yamoussoukro'].filter((f) => faq.includes(f));
    expect(ajenas).toEqual([]);
  });

  test('hallazgo · la guía no se contradice con sus propias cifras ni con el banco', async ({ page }) => {
    // FAQ «capital más fría»: da Astana −14 °C y Ulán Bator −22 °C en enero, pero corona a Astana.
    //   Wikipedia «Ulaanbaatar»: «It is the coldest national capital in the world» (enero −21,3 °C).
    // Aviso: «Mumbai supera los 20 millones frente a los ~4 millones de la capital». Wikipedia «New
    //   Delhi»: NDMC 249.998 hab. (2011); área metropolitana de Delhi 28.514.000 (2018).
    // Grafía distinta de la del banco (y de la RAE): «Astana» (banco: Astaná), «Reykiavik» (Reikiavik).
    // Errata: «oposición de diplomatía».
    // REPARADO (hallazgo 2275): Ulán Bator es la más fría; Nueva Deli con sus cifras y su fuente.
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = norm(await page.locator('body').innerText());
    const fallos: string[] = [];
    if (/Astana \(Kazajistán\) es la capital más fría/.test(texto)) fallos.push('Astana «la capital más fría»');
    if (/~4 millones de la capital/.test(texto)) fallos.push('~4 millones de la capital');
    if (/\bAstana\b/.test(texto)) fallos.push('Astana sin tilde');
    if (/Reykiavik/.test(texto)) fallos.push('Reykiavik');
    if (/diplomatía/.test(texto)) fallos.push('diplomatía');
    expect(fallos).toEqual([]);
  });

  test('hallazgo · el número de países anunciado coincide con el banco', async ({ page }) => {
    // metadata.ts:6 «195 países» y la guía «El nivel Maestro mezcla los 195 países»; el banco tiene 196
    // porque añade Taiwán (data/countries.ts:3), que no es miembro ni observador de la ONU —el criterio
    // que la propia FAQ usa para contar 195— y no figura en la lista de la RAE.
    // REPARADO (hallazgo 2276) sin tocar el banco (lo comparte paises-del-mundo): la app anuncia
    // «los 195 Estados de la ONU y Taiwán», que cuenta lo que hay sin llamar «país» a Taiwán ni
    // retirarlo. El «esperado» de la ficha (countries.length = 195) exigía quitar Taiwán; el test
    // afirma en su lugar que lo anunciado SUMA lo que hay en el banco, y que ningún texto de la app
    // habla ya de «195 países» a secas.
    const ONU = countries.filter((c) => c.name !== 'Taiwán');
    expect(ONU, 'el banco son los 195 de la ONU más Taiwán').toHaveLength(195);
    expect(countries).toHaveLength(196);
    await abrir(page);
    const metas = await page.evaluate(() =>
      ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].map(
        (s) => document.querySelector(s)?.getAttribute('content') ?? '',
      ),
    );
    for (const d of metas) {
      expect(d, 'descripción vacía').not.toBe('');
      expect(d).toContain('Los 195 Estados de la ONU y Taiwán');
      expect(d).not.toMatch(/\d+ países/);
    }
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const texto = norm(await page.locator('body').innerText());
    expect(texto).toContain(`El nivel Maestro mezcla las ${countries.length} entradas del quiz: los 195 Estados de la ONU (miembros y observadores) y Taiwán.`);
    expect(texto).not.toMatch(/195 (países|capitales)/);
  });

  test('capitales discutidas: el aviso de respuesta matiza Jerusalén y Ramala, y ninguna pregunta tiene dos respuestas', async ({ page }) => {
    // Hallazgo 2273. Semillas halladas simulando generarPreguntas() con mulberry32 (26/09/2026):
    //   · 221 en Difícil → pregunta 1 = Israel (Capital: Lima / Skopie / Kuwait / Jerusalén;
    //     País: Estonia / Guatemala / Israel / Canadá).
    //   · 8 en Difícil → pregunta 1 = Palestina (Capital: Ramala / Puerto España / La Habana / Reikiavik).
    // Esperado: el aviso lleva el matiz de la ONU; en Capital/Palestina «Jerusalén» no es opción y en
    // País/Israel («¿A qué país pertenece la capital Jerusalén?») «Palestina» no es opción.
    test.setTimeout(60_000);
    const casos: { modo: Modo; semilla: number; enunciado: string; vetada?: string; nota: RegExp }[] = [
      { modo: 'Capital', semilla: 221, enunciado: 'Israel', nota: /Israel designa Jerusalén como su capital; la ONU no reconoce ese estatus\./ },
      { modo: 'Capital', semilla: 8, enunciado: 'Palestina', vetada: 'Jerusalén', nota: /Ramala es la sede de la Autoridad Nacional Palestina; Palestina proclama Jerusalén como su capital, estatus que la ONU no reconoce\./ },
      { modo: 'País', semilla: 221, enunciado: 'Jerusalén', vetada: 'Palestina', nota: /Israel designa Jerusalén como su capital; la ONU no reconoce ese estatus\./ },
    ];
    for (const c of casos) {
      await abrir(page);
      await arrancarConSemilla(page, c.modo, 'Difícil', c.semilla);
      await expect(page.locator('[class*="preguntaTexto"] strong'), `semilla ${c.semilla}: el caso ya no mide lo que dice`).toHaveText(c.enunciado);
      if (c.vetada) expect(await textosOpcion(page)).not.toContain(c.vetada);
      await responder(page, c.modo, true);
      await expect(aviso(page)).toContainText('¡Correcto!');
      await expect(aviso(page)).toContainText(c.nota);
    }
  });
});

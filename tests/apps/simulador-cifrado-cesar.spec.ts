import { test, expect, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * Cifrado César — Inspector, 25/09/2026 (PRIMERA inspección)
 *
 * Motor bajo prueba: `cifrarLetra`, `procesarTexto`, `calcularFrecuencias` y
 * `detectarDesplazamiento`, funciones puras al principio de `app/simulador-cifrado-cesar/page.tsx`
 * (no hay módulo aparte), más la rueda que pinta `dibujar()` en un <canvas>.
 *
 * QUÉ ALFABETO DECLARA: el latino de 26 letras, A-Z. La rueda pinta 26, el bloque educativo
 * dice «Olvidar el módulo 26: la Z+1 debe volver a la A» y «25 claves posibles». La Ñ y las
 * vocales con tilde NO están en él: pasan sin cifrar (como números, espacios y signos), y la app
 * no lo dice en ninguna parte (solo avisa de que «Los espacios no se cifran»). Mayúsculas y
 * minúsculas se conservan. La clave es un deslizador de 0 a 25: k = 26, k negativo y una clave
 * no numérica no se pueden teclear (el propio control capa 30 → 25 y −5 → 0).
 *
 * La verdad es exacta: cada letra se desplaza k posiciones módulo 26. Resuelto A MANO:
 *
 * CASO 1 (normal) — «Ataque al amanecer», k = 3 (A→D, t→w, q→t, u→x, e→h, l→o, m→p, n→q,
 *   c→f, r→u) → «Dwdtxh do dpdqhfhu». Descifrar ese texto con k = 3 → «Ataque al amanecer».
 *
 * CASO 2 (límite) — «xyz XYZ Hola»:
 *   k = 3  → x(23)+3 = 26 ≡ 0 → a: «abc ABC Krod»          (las del final dan la vuelta)
 *   k = 25 → x → w, y → x, z → y, H(7)+25 = 32 ≡ 6 → G: «wxy WXY Gnkz»
 *   k = 0  → identidad: «xyz XYZ Hola»
 *   k = 13 → x(23)+13 = 36 ≡ 10 → k: «klm KLM Ubyn», y la insignia ROT-13
 *   Descifrar «Gnkz» con k = 25 → desplazar +1 → «Hola».
 *   «Año Ñandú, 2026!» con k = 3 → «Dñr Ñdqgú, 2026!»: ñ, Ñ y ú fuera del alfabeto de 26.
 *
 * CASO 3 (rechazo) — texto vacío → resultado vacío, y el «Ataque automático» se niega con
 *   «Necesitas al menos 20 letras para un análisis de frecuencias fiable.»; con 19 letras,
 *   lo mismo; con 20 ya ataca.
 *
 * HALLAZGOS ABIERTOS — marcados con `test.fail()`. Cada uno afirma lo que DEBERÍA pasar;
 * cuando se reparen, pasarán a verde y Playwright avisará para retirar la marca:
 *   A. La rueda del alfabeto enseña la IDENTIDAD para toda k: las letras del anillo exterior
 *      se desplazan k en el índice (`ALFABETO[(i + k) % 26]`) Y además el anillo gira k
 *      posiciones (`anguloBase`), y los dos desplazamientos se anulan. En reposo, frente a la
 *      A interior queda la A exterior (y frente a cada letra, ella misma). La animación parte
 *      del emparejamiento correcto (A↔D con k = 3) y gira hasta el incorrecto.
 *   B. SOSPECHA del 25/09 convertida en caso: si el contenedor del lienzo mide menos de 32 px
 *      al montar (oculto con display:none, o ventana de menos de 120 px), `dibujar()` llama a
 *      `arc()` con radio negativo, lanza «IndexSizeError … The radius provided (-4) is
 *      negative» dentro de un useEffect y la página entera cae a «Algo salió mal». Es la
 *      misma forma que simulador-trigonometria-circulo-unitario (3 caídas reales el 24/09 en
 *      un móvil de 412×915). Con la ventana ya cargada, estrecharla a 80 px NO tira la página
 *      (el error salta en el listener de resize, fuera de React): el lienzo queda a 0×0 y se
 *      recupera al volver a ensanchar.
 *   C. «Ataque automático» en modo Descifrar detecta bien la clave pero pasa la app a Cifrar,
 *      así que el resultado es el texto cifrado OTRA VEZ (clave total 2k) en vez del texto en
 *      claro, y la entrada, que es el criptograma, pasa a llamarse «Texto original».
 *   D. El ataque solo mira la letra más frecuente y la supone E, pero la guía dice que
 *      «detecta la clave más probable comparando con la distribución del español»: la tabla
 *      `FREQS_ES` está declarada y no la usa nadie. Con su propio preset «Párrafo largo» (A 39
 *      veces, E 31) y k = 3 anuncia «Desplazamiento detectado: 25». Una χ² contra esa misma
 *      tabla devuelve 3.
 *   E. «En español, la E tiene ~14,7 %» (cuatro veces en la página) sin fuente, y no coincide
 *      con las publicadas: Pratt (Secret and Urgent, 1939, pp. 254-255) da 13,68 %; la tabla
 *      de «Letter frequency» de Wikipedia, 13,70 %; el Quijote, 14,0 %. La tabla muerta
 *      `FREQS_ES` de la que sale suma 102 %.
 *   F. La guía llama a ROT-13 «operación idempotente de orden 2»: idempotente es f(f(x)) = f(x),
 *      y ROT-13(«Hola») = «Ubyn» ≠ «Hola». Es una INVOLUCIÓN, como la propia app dice en otra
 *      tarjeta.
 *   G. La FAQ afirma que el César «es el registro histórico más antiguo de un cifrado de
 *      sustitución documentado»: el atbash hebreo del libro de Jeremías (25:26 y 51:41, «Sesac»
 *      por Babel, siglo VI a. C.) es cinco siglos anterior.
 *   H. La Ñ y las vocales con tilde quedan en claro sin que la app lo declare: en su propio
 *      preset «Mensaje técnico», «Reunión» sale «Uhxqlóq» y «número», «qúphur».
 *   I. El porcentaje de cada barra del histograma, que solo vive en su `title`, sale con
 *      formato inglés («L: 41.7%» en vez de «L: 41,7 %»).
 */

const RUTA = '/simulador-cifrado-cesar/';
const DESLIZADOR = '#slider-desp';
const ENTRADA = '#texto-original';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cifrado César');
  await esperarHidratacion(page, [DESLIZADOR, ENTRADA]);
}

/** Escribe en el texto de entrada y espera a que el estado de React lo recoja. */
async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator(ENTRADA).fill(texto);
  await esperarValorEnReact(page, ENTRADA, texto);
}

const resultado = (page: Page) => page.locator('#texto-resultado');
const botonCifrar = (page: Page) => page.getByRole('button', { name: 'Cifrar', exact: true });
const botonDescifrar = (page: Page) => page.getByRole('button', { name: 'Descifrar', exact: true });
const botonAtaque = (page: Page) => page.getByRole('button', { name: 'Ataque automático' });
// El aviso del ataque lleva role="alert"; se acota por su clase para no casar con el
// anunciador de rutas de Next.
const avisoAtaque = (page: Page) => page.locator('p[class*="attackResult"]');

// ============================================================
// Lectura de la rueda: se interceptan las letras que pinta el último fotograma
// ============================================================

/** Registra cada `fillText` del lienzo; `clearRect` marca el inicio de un fotograma. */
async function interceptarRueda(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __letras: { t: string; x: number; y: number; oro: boolean }[] };
    w.__letras = [];
    const P = CanvasRenderingContext2D.prototype;
    const limpiar = P.clearRect;
    P.clearRect = function (x: number, y: number, an: number, al: number) {
      w.__letras = [];
      return limpiar.call(this, x, y, an, al);
    };
    const pintar = P.fillText;
    P.fillText = function (t: string, x: number, y: number, max?: number) {
      w.__letras.push({ t, x, y, oro: String(this.fillStyle).toLowerCase() === '#f4d03f' });
      return max === undefined ? pintar.call(this, t, x, y) : pintar.call(this, t, x, y, max);
    };
  });
}

interface Rueda {
  interior: string[]; // letra en cada posición 0..25, empezando arriba y en sentido horario
  exterior: string[];
}

/** Las 26 letras de cada anillo, colocadas por su ángulo (posición 0 = arriba). */
async function leerRueda(page: Page): Promise<Rueda> {
  return page.evaluate(() => {
    const w = window as unknown as { __letras: { t: string; x: number; y: number }[] };
    const lienzo = document.querySelector('canvas') as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const cx = lienzo.width / dpr / 2;
    const cy = lienzo.height / dpr / 2;
    const letras = w.__letras
      .filter((l) => /^[A-Z]$/.test(l.t))
      .map((l) => {
        let a = Math.atan2(l.y - cy, l.x - cx) + Math.PI / 2;
        if (a < 0) a += 2 * Math.PI;
        return { t: l.t, r: Math.round(Math.hypot(l.x - cx, l.y - cy)), pos: Math.round((a / (2 * Math.PI)) * 26) % 26 };
      });
    const radios = [...new Set(letras.map((l) => l.r))].sort((a, b) => a - b);
    const anillo = (r: number): string[] => {
      const fila = Array<string>(26).fill('?');
      for (const l of letras.filter((x) => x.r === r)) fila[l.pos] = l.t;
      return fila;
    };
    return { interior: anillo(radios[0]), exterior: anillo(radios[radios.length - 1]) };
  });
}

/** Espera a que la animación de la rueda termine: dos lecturas seguidas iguales. */
async function ruedaAsentada(page: Page): Promise<Rueda> {
  let previa = '';
  for (let i = 0; i < 30; i++) {
    const foto = JSON.stringify(
      await page.evaluate(() => (window as unknown as { __letras: unknown[] }).__letras),
    );
    if (foto === previa && foto !== '[]') return leerRueda(page);
    previa = foto;
    await page.waitForTimeout(250);
  }
  throw new Error('La rueda no dejó de moverse en 7,5 s.');
}

// ============================================================
// Casos resueltos a mano
// ============================================================
test.describe('Cifrado César — cálculo', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 — «Ataque al amanecer» con k = 3 se cifra y se descifra', async ({ page }) => {
    // k = 3 es el valor inicial de la app; no se mueve el deslizador.
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');

    // A mano: A→D t→w a→d q→t u→x e→h · a→d l→o · a→d m→p a→d n→q e→h c→f e→h r→u
    await escribir(page, 'Ataque al amanecer');
    await expect(resultado(page)).toHaveValue('Dwdtxh do dpdqhfhu');

    await botonDescifrar(page).click();
    await expect(botonDescifrar(page)).toHaveAttribute('aria-pressed', 'true');
    await escribir(page, 'Dwdtxh do dpdqhfhu');
    await expect(resultado(page)).toHaveValue('Ataque al amanecer');
  });

  test('CASO 2 — límites: la vuelta de la Z, k = 25, k = 0, ROT-13 y el deslizador acotado', async ({ page }) => {
    await escribir(page, 'xyz XYZ Hola');

    // k = 3 (inicial): x(23)+3 = 26 ≡ 0 → a; conserva mayúsculas; H→K o→r l→o a→d
    await expect(resultado(page)).toHaveValue('abc ABC Krod');

    // k = 25 ≡ −1: cada letra retrocede una
    await sembrarValor(page, DESLIZADOR, 25);
    await expect(resultado(page)).toHaveValue('wxy WXY Gnkz');

    // k = 0: identidad
    await sembrarValor(page, DESLIZADOR, 0);
    await expect(resultado(page)).toHaveValue('xyz XYZ Hola');

    // k = 13: x(23)+13 = 36 ≡ 10 → k; H(7)+13 = 20 → U; o(14)+13 = 27 ≡ 1 → b
    await sembrarValor(page, DESLIZADOR, 13);
    await expect(resultado(page)).toHaveValue('klm KLM Ubyn');
    await expect(page.locator('[class*="rot13Badge"]')).toHaveText('ROT-13');

    // ROT-13 es su propio inverso: cifrar «Ubyn» con k = 13 devuelve «Hola»
    await escribir(page, 'Ubyn');
    await expect(resultado(page)).toHaveValue('Hola');

    // Descifrar con k = 25 equivale a desplazar +1: G→H n→o k→l z→a
    await sembrarValor(page, DESLIZADOR, 25);
    await botonDescifrar(page).click();
    await escribir(page, 'Gnkz');
    await expect(resultado(page)).toHaveValue('Hola');

    // Claves fuera de [0, 25]: el deslizador las capa, no hay k = 26 ni negativa
    expect(await sembrarValorAcotado(page, DESLIZADOR, 30)).toBe('25');
    expect(await sembrarValorAcotado(page, DESLIZADOR, -5)).toBe('0');
    await expect(page.locator(DESLIZADOR)).toHaveAttribute('max', '25');
  });

  test('CASO 2 bis — la Ñ, las tildes, los números y los signos pasan sin cifrar (alfabeto de 26)', async ({ page }) => {
    // A→D, o→r, a→d, n→q, d→g; ñ, Ñ, ú, dígitos, coma y exclamación fuera del alfabeto A-Z.
    await escribir(page, 'Año Ñandú, 2026!');
    await expect(resultado(page)).toHaveValue('Dñr Ñdqgú, 2026!');
  });

  test('CASO 3 — texto vacío y ataque con menos de 20 letras se rechazan de forma explícita', async ({ page }) => {
    await escribir(page, '');
    await expect(resultado(page)).toHaveValue('');

    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toHaveText(
      'Necesitas al menos 20 letras para un análisis de frecuencias fiable.',
    );

    // 19 letras: todavía no
    await escribir(page, 'abcdefghijklmnopqrs');
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toHaveText(
      'Necesitas al menos 20 letras para un análisis de frecuencias fiable.',
    );

    // 20 letras: ya ataca (qué clave detecte con todas las letras empatadas no es lo que se mide)
    await escribir(page, 'abcdefghijklmnopqrst');
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Ataque completado.');
  });

  test('El ataque en modo Cifrar recupera k = 3 cuando la E domina el texto', async ({ page }) => {
    // Plano «EL ENEMIGO ESPERA EN EL PUENTE DESDE ESTE MES»: 37 letras, 14 E.
    // Cifrado con k = 3, la más frecuente es H → H(7) − E(4) = 3.
    await escribir(page, 'EL ENEMIGO ESPERA EN EL PUENTE DESDE ESTE MES');
    await expect(resultado(page)).toHaveValue('HO HQHPLJR HVSHUD HQ HO SXHQWH GHVGH HVWH PHV');
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Desplazamiento detectado: 3.');
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');
  });
});

// ============================================================
// Hallazgos abiertos
// ============================================================
test.describe('Cifrado César — la rueda del alfabeto', () => {
  test.beforeEach(async ({ page }) => {
    await interceptarRueda(page);
    await abrir(page);
  });

  test('la lectura de la rueda funciona: 26 letras por anillo y el interior empieza en A arriba', async ({ page }) => {
    const rueda = await ruedaAsentada(page);
    expect(rueda.interior.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect([...rueda.exterior].sort().join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  });

  // HALLAZGO A: con k = 3, frente a la A interior (arriba, en la línea amarilla) debe quedar
  // la D exterior, y frente a cada letra X, la X + 3. HOY queda cada letra frente a sí misma.
  test.fail('HALLAZGO A — con k = 3 la rueda empareja A↔D, B↔E … Z↔C', async ({ page }) => {
    const rueda = await ruedaAsentada(page);
    expect(rueda.exterior[0]).toBe('D');
    expect(rueda.exterior.join('')).toBe('DEFGHIJKLMNOPQRSTUVWXYZABC');
  });
});

test.describe('Cifrado César — ataque automático', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // HALLAZGO C: con el criptograma en modo Descifrar, el ataque debe dejar a la vista el
  // texto en claro. HOY detecta k = 3, pasa a Cifrar y muestra el criptograma cifrado otra
  // vez: «KR KTKSOMU KYVKXG KT KR VAKTZK JKYJK KYZK SKY» (clave total 6).
  test.fail('HALLAZGO C — en modo Descifrar, el ataque descifra el criptograma', async ({ page }) => {
    await sembrarValor(page, DESLIZADOR, 0); // «no conozco la clave»
    await botonDescifrar(page).click();
    await escribir(page, 'HO HQHPLJR HVSHUD HQ HO SXHQWH GHVGH HVWH PHV');
    await expect(resultado(page)).toHaveValue('HO HQHPLJR HVSHUD HQ HO SXHQWH GHVGH HVWH PHV');

    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Desplazamiento detectado: 3.');
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');
    await expect(resultado(page)).toHaveValue('EL ENEMIGO ESPERA EN EL PUENTE DESDE ESTE MES');
  });

  // HALLAZGO D: el preset «Párrafo largo» (256 letras A-Z: A 39, E 31) cifrado con k = 3.
  // Comparando con la distribución del español, como promete la guía, sale k = 3 (χ² contra
  // la propia tabla FREQS_ES). HOY toma la D (= A + 3) por E y anuncia 25.
  test.fail('HALLAZGO D — el ataque recupera k = 3 en el preset «Párrafo largo»', async ({ page }) => {
    await page.getByRole('button', { name: 'Párrafo largo' }).click();
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Desplazamiento detectado: 3.');
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');
  });
});

test.describe('Cifrado César — el lienzo sin tamaño (sospecha del 25/09)', () => {
  /** Errores de radio negativo, vengan como excepción suelta o capturados por React. */
  function vigilarRadio(page: Page): string[] {
    const errores: string[] = [];
    page.on('pageerror', (e) => {
      if (e.message.includes('radius')) errores.push(e.message);
    });
    page.on('console', (m) => {
      if (m.type() === 'error' && m.text().includes('IndexSizeError')) errores.push(m.text());
    });
    return errores;
  }

  test('en un móvil de 412×915 carga sin error y pinta la rueda', async ({ browser }) => {
    const contexto = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; SM-A065M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });
    const page = await contexto.newPage();
    const errores = vigilarRadio(page);
    await abrir(page);
    await esperarPaginaAsentada(page);
    // Contenedor de 324 px → lienzo de 320 CSS px × 2,625 = 840 px de mapa de bits
    await expect(page.locator('canvas')).toHaveJSProperty('width', 840);
    expect(errores).toEqual([]);
    await contexto.close();
  });

  // HALLAZGO B: con el contenedor del lienzo oculto al montar, la app debe verse igual (el
  // lienzo, simplemente, sin dibujar). HOY arc() recibe radio −4 y todo cae a «Algo salió mal».
  test.fail('HALLAZGO B — contenedor del lienzo en display:none antes de hidratar: la página no cae', async ({ page }) => {
    const errores = vigilarRadio(page);
    await page.addInitScript(() => {
      const css = document.createElement('style');
      css.textContent = '[class*="canvasWrap"]{display:none !important}';
      const poner = (): boolean => {
        if (!document.head) return false;
        document.head.appendChild(css);
        return true;
      };
      if (!poner()) {
        const obs = new MutationObserver(() => {
          if (poner()) obs.disconnect();
        });
        obs.observe(document, { childList: true, subtree: true });
      }
    });
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cifrado César');
    expect(errores).toEqual([]);
  });

  // HALLAZGO B, sin tocar el DOM: una ventana de 100 px deja el contenedor en 12 px
  // (100 − 40 de márgenes de <main> − 48 del panel) → radio exterior 6 − 16 = −10.
  // Medido: 119 px cae, 120 px no.
  test.fail('HALLAZGO B — ventana de 100 px de ancho: la página no cae', async ({ page }) => {
    const errores = vigilarRadio(page);
    await page.setViewportSize({ width: 100, height: 700 });
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cifrado César');
    expect(errores).toEqual([]);
  });
});

test.describe('Cifrado César — contenido y formato', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  });

  // HALLAZGO E: el porcentaje de la E debe salir de una fuente citada (Pratt 1939: 13,68 %).
  // HOY «~14,7 %», sin fuente, cuatro veces.
  test.fail('HALLAZGO E — la frecuencia de la E en español no es un 14,7 % sin fuente', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('14,7');
  });

  // HALLAZGO F: ROT-13 es una involución (f∘f = identidad), no idempotente (f∘f = f).
  test.fail('HALLAZGO F — la guía no llama «idempotente» a ROT-13', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('idempotente');
  });

  // HALLAZGO G: el atbash de Jeremías (s. VI a. C.) es anterior al César (s. I a. C.).
  test.fail('HALLAZGO G — la FAQ no presenta el César como el cifrado de sustitución más antiguo', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('registro histórico más antiguo');
  });

  // HALLAZGO H: la app debe decir qué hace con la Ñ y las tildes, que deja en claro (lo mide
  // el CASO 2 bis). HOY solo avisa de los espacios; su preset «Mensaje técnico» enseña
  // «Uhxqlóq» (Reunión) y «qúphur» (número) con la ó y la ú a la vista.
  test.fail('HALLAZGO H — la app declara qué hace con la Ñ y las vocales con tilde', async ({ page }) => {
    await expect(page.locator('main')).toContainText(/tilde|acentuad|la Ñ|la eñe/i);
  });

  // HALLAZGO I: «Yhql, ylgl, ylfl» tiene 12 letras y 5 L → 5/12 = 41,67 % → «41,7 %».
  test.fail('HALLAZGO I — el porcentaje de la barra L va en formato español', async ({ page }) => {
    await expect(resultado(page)).toHaveValue('Yhql, ylgl, ylfl');
    await expect(page.locator('[class*="histoBarInner"]').nth(11)).toHaveAttribute('title', 'L: 41,7 %');
  });
});

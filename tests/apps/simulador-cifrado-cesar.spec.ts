import { test, expect, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';
import {
  AVISO_ALFABETO_26,
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  criptogramaDe,
  generarEjercicioAleatorio,
  resolverCaso,
  type DatosCaso,
} from '../../app/simulador-cifrado-cesar/casos';
import { detectarDesplazamiento } from '../../app/simulador-cifrado-cesar/motor';

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
 * HALLAZGOS 1620-1628 (A = 1620, B = 1621 … I = 1628), REPARADOS el 25/09/2026: sus tests
 * quedan como regresión. Lo que describía cada uno:
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
  test('HALLAZGO A — con k = 3 la rueda empareja A↔D, B↔E … Z↔C', async ({ page }) => {
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
  test('HALLAZGO C — en modo Descifrar, el ataque descifra el criptograma', async ({ page }) => {
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
  test('HALLAZGO D — el ataque recupera k = 3 en el preset «Párrafo largo»', async ({ page }) => {
    await page.getByRole('button', { name: 'Párrafo largo' }).click();
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Desplazamiento detectado: 3.');
    await expect(page.locator(DESLIZADOR)).toHaveValue('3');

    // El mismo ataque desde el otro lado: el criptograma del párrafo con k = 3 como entrada en
    // Descifrar, clave desconocida (k = 0) → detecta 3 y deja el texto en claro.
    const claro = await page.locator(ENTRADA).inputValue();
    const cripto = await resultado(page).inputValue();
    await sembrarValor(page, DESLIZADOR, 0);
    await botonDescifrar(page).click();
    await escribir(page, cripto);
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Desplazamiento detectado: 3.');
    await expect(resultado(page)).toHaveValue(claro);
  });

  // HALLAZGO D, segundo preset: «En un lugar de la Mancha…» (A 9, E 6) con k = 3.
  test('HALLAZGO D — el ataque recupera k = 3 en el preset «Quijote»', async ({ page }) => {
    await page.getByRole('button', { name: 'Quijote' }).click();
    await botonAtaque(page).click();
    await expect(avisoAtaque(page)).toContainText('Desplazamiento detectado: 3.');
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
  test('HALLAZGO B — contenedor del lienzo en display:none antes de hidratar: la página no cae', async ({ page }) => {
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
  test('HALLAZGO B — ventana de 100 px de ancho: la página no cae', async ({ page }) => {
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
  test('HALLAZGO E — la frecuencia de la E en español no es un 14,7 % sin fuente', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('14,7');
    // Y la cifra que queda, junto al histograma, lleva su fuente: Pratt 1939, E = 13,68 %.
    await expect(page.locator('p[class*="histoHint"]').last()).toContainText(/13,7 %.*Pratt.*1939/);
  });

  // HALLAZGO F: ROT-13 es una involución (f∘f = identidad), no idempotente (f∘f = f).
  test('HALLAZGO F — la guía no llama «idempotente» a ROT-13', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('idempotente');
  });

  // HALLAZGO G: el atbash de Jeremías (s. VI a. C.) es anterior al César (s. I a. C.).
  test('HALLAZGO G — la FAQ no presenta el César como el cifrado de sustitución más antiguo', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('registro histórico más antiguo');
  });

  // HALLAZGO H: la app debe decir qué hace con la Ñ y las tildes, que deja en claro (lo mide
  // el CASO 2 bis). HOY solo avisa de los espacios; su preset «Mensaje técnico» enseña
  // «Uhxqlóq» (Reunión) y «qúphur» (número) con la ó y la ú a la vista.
  test('HALLAZGO H — la app declara qué hace con la Ñ y las vocales con tilde', async ({ page }) => {
    await expect(page.locator('main')).toContainText(/tilde|acentuad|la Ñ|la eñe/i);
  });

  // HALLAZGO I: «Yhql, ylgl, ylfl» tiene 12 letras y 5 L → 5/12 = 41,67 % → «41,7 %».
  test('HALLAZGO I — el porcentaje de la barra L va en formato español', async ({ page }) => {
    await expect(resultado(page)).toHaveValue('Yhql, ylgl, ylfl');
    await expect(page.locator('[class*="histoBarInner"]').nth(11)).toHaveAttribute('title', 'L: 41,7 %');
  });
});

// ============================================================
// Casos para clase (skill /casos-aula-meskeia, 02/11/2026)
// ============================================================
/*
 * Van detrás del acta, en su propio describe: el acta no tiene `beforeEach` de nivel superior,
 * así que las invariantes sin navegador no pagan ninguna carga.
 *
 * EL CONVENIO: alfabeto de 26 letras, sin Ñ (el de la rueda); cifrar = avanzar k, con la vuelta
 * de la Z a la A. Muchas aulas hispanas cuentan 27 letras, y entonces el resultado cambia en
 * cuanto una letra cruza la N o da la vuelta. Este spec cifra con un César PROPIO, de 26 y de 27
 * letras (`cesar` y `cesar27`, abajo), sin usar el motor de la app.
 *
 * LAS 12 RESPUESTAS, A MANO (A=0 … N=13, O=14 … Z=25; con Ñ: Ñ=14, O=15 … Z=26):
 *    1  FUEGO + 3          F5→I8 U20→X23 E4→H7 G6→J9 O14→R17                    = IXHJR
 *    2  LUNA + 4           L11→P15 U20→Y24 N13→R17 A0→E4                        = PYRE   (con Ñ: OYQE)
 *    3  ZORRO + 6          Z25→31−26=5 F · O→U · R→X · R→X · O→U                 = FUXXU
 *    4  DYBDEQK − 10       D3→−7+26=19 T · Y24→O · B1→R · D→T · E4→U · Q16→G · K10→A = TORTUGA
 *    5  GATO → NHAV        G6→N13: 7 · A→H: 7 · T19→A(26): 7 · O14→V21: 7       = 7
 *    6  deshacer k = 8     26 − 8                                               = 18
 *    7  k = 15 y k = 17    32 − 26                                              = 6
 *    8  ROT-13             ABF IRZBF RA RY CNGVB − 13                           = NOS VEMOS EN EL PATIO
 *    9  TESORO → EPDZCZ    T19→E4: −15+26 · E4→P15 · S18→D3 · O14→Z25 · R17→C2  = 11 (con Ñ no hay una sola k)
 *   10  VUELVE PRONTO + 1                                                       = WVFMWF QSPOUP
 *   11  sin clave          la E sale 13 veces en el claro; la N, la más frecuente del criptograma: 13 − 4 = 9
 *   12  sin clave          la E sale 9 veces; la V, la más frecuente: 21 − 4 = 17 → NOS VEMOS EN LA ENTRADA DEL MUSEO ANTES DE LAS SIETE
 */
const A_MANO_CASOS: Record<number, string | number> = {
  1: 'IXHJR',
  2: 'PYRE',
  3: 'FUXXU',
  4: 'TORTUGA',
  5: 7,
  6: 18,
  7: 6,
  8: 'NOS VEMOS EN EL PATIO',
  9: 11,
  10: 'WVFMWF QSPOUP',
  11: 9,
  12: 'NOS VEMOS EN LA ENTRADA DEL MUSEO ANTES DE LAS SIETE',
};

const A26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const A27 = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const desplazar = (alfabeto: string, texto: string, k: number): string =>
  [...texto]
    .map((c) => {
      const i = alfabeto.indexOf(c);
      return i < 0 ? c : alfabeto[(((i + k) % alfabeto.length) + alfabeto.length) % alfabeto.length];
    })
    .join('');
const cesar = (texto: string, k: number) => desplazar(A26, texto, k);
const cesar27 = (texto: string, k: number) => desplazar(A27, texto, k);

/** La letra más frecuente de un texto en mayúsculas; un empate deja sin respuesta única. */
function masFrecuente(texto: string): string {
  const cuenta = new Map<string, number>();
  for (const c of texto) if (A26.includes(c)) cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
  const orden = [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
  return orden[0][1] > orden[1][1] ? orden[0][0] : '';
}

/** La respuesta de un caso recalculada con el César propio del spec, con 26 o con 27 letras. */
function aMano(d: DatosCaso, alfabeto: string): string | number {
  const n = alfabeto.length;
  const mover = (t: string, k: number) => desplazar(alfabeto, t, k);
  switch (d.tipo) {
    case 'cifrar':
      return mover(d.mensaje, d.clave);
    case 'descifrar':
    case 'sin-clave-texto':
      // El criptograma es SIEMPRE el de la app (26 letras); quien cuenta 27 lo descifra mal.
      return mover(cesar(d.mensaje, d.clave), -d.clave);
    case 'hallar-clave': {
      const claro = d.mensaje.replace(/ /g, '');
      const cifrado = cesar(claro, d.clave);
      const ks = new Set([...claro].map((x, i) => (alfabeto.indexOf(cifrado[i]) - alfabeto.indexOf(x) + n) % n));
      return ks.size === 1 ? [...ks][0] : Number.NaN;
    }
    case 'clave-inversa':
      return (n - d.clave) % n;
    case 'composicion':
      return (d.clave + (d.clave2 ?? 0)) % n;
    case 'sin-clave-clave': {
      const m = masFrecuente(cesar(d.mensaje, d.clave));
      return (alfabeto.indexOf(m) - alfabeto.indexOf('E') + n) % n;
    }
  }
}

test.describe('Casos para clase — invariantes, sin navegador', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(b.valor, `caso ${caso.id}`).toBe(a.valor);
      expect(b.pasos, `caso ${caso.id}`).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde los datos', () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(r.valor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta, desarrollo y pista', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(String(caso.respuesta).trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(/\bNaN\b|undefined/.test(caso.enunciado + caso.pasos.join(' ')), `caso ${caso.id}`).toBe(false);
      expect(caso.enunciado, `caso ${caso.id}`).not.toMatch(/\b[Dd]e el\b/);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad o una moneda', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|Quito|euros?|dólares?|pesos (mexicanos|colombianos|chilenos|argentinos|uruguayos)|Bachillerato|selectividad)\b/i;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || /\bESO\b/.test(texto), `caso ${caso.id}`).toBe(false);
    }
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(PROHIBIDO.test(e.enunciado) || /\bESO\b/.test(e.enunciado), `semilla ${s}`).toBe(false);
    }
  });

  test('6 · el generador es reproducible, variado y usa la misma aritmética', () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => String(m.respuesta))).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.tipo)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      const r = resolverCaso(m.datos);
      expect(r.ok, m.enunciado).toBe(true);
      expect(r.valor, m.enunciado).toBe(m.respuesta);
      // Y la misma que el César propio del spec, no solo la del motor.
      expect(aMano(m.datos, A26), m.enunciado).toBe(m.respuesta);
      expect(comprobarRespuesta(String(m.respuesta), m).correcto, m.enunciado).toBe(true);
      if (aMano(m.datos, A27) !== m.respuesta) expect(m.enunciado, m.enunciado).toContain(AVISO_ALFABETO_26);
    }
  });

  test('7 · el convenio queda fijado: las doce respuestas son las de la tabla a mano', () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_CASOS[caso.id]);
      expect(aMano(caso.datos, A26), `caso ${caso.id}`).toBe(caso.respuesta);
    }
    // Las dos lecturas, a mano: con 26 letras de la N se pasa a la O.
    expect(cesar('LUNA', 4)).toBe('PYRE');
    expect(cesar27('LUNA', 4)).toBe('OYQE');
  });

  test('7.bis · el aviso de las 26 letras va justo donde la respuesta cambiaría con 27', () => {
    for (const caso of CASOS) {
      const cambia = aMano(caso.datos, A27) !== caso.respuesta;
      // Se prueba EJECUTANDO con el otro alfabeto, no buscando la cadena (física, 14/09/2026).
      if (cambia) expect(caso.enunciado, `caso ${caso.id}`).toContain(AVISO_ALFABETO_26);
      else expect(caso.enunciado, `caso ${caso.id}`).not.toContain(AVISO_ALFABETO_26);
    }
  });

  test('8 · el criptograma que enseña el enunciado es el cifrado de verdad del mensaje', () => {
    for (const caso of CASOS) {
      const cripto = cesar(caso.datos.mensaje, caso.datos.clave);
      expect(criptogramaDe(caso.datos), `caso ${caso.id}`).toBe(cripto);
      if (['descifrar', 'hallar-clave', 'sin-clave-texto', 'sin-clave-clave'].includes(caso.datos.tipo)) {
        expect(caso.enunciado, `caso ${caso.id}`).toContain(cripto);
      }
      // Solo A–Z: la Ñ, las tildes y las cifras, que la app deja pasar, no influyen.
      expect(caso.datos.mensaje, `caso ${caso.id}`).toMatch(/^[A-Z]+( [A-Z]+)*$/);
    }
  });

  test('9 · sin clave: el análisis de frecuencias de la app y el de a mano dan la misma k', () => {
    const sinClave = CASOS.filter((c) => c.datos.tipo.startsWith('sin-clave'));
    expect(sinClave.length).toBeGreaterThan(0);
    for (const caso of sinClave) {
      const cripto = cesar(caso.datos.mensaje, caso.datos.clave);
      expect(cripto.replace(/ /g, '').length, `caso ${caso.id}: con menos de 20 letras no es fiable`).toBeGreaterThanOrEqual(20);
      expect(masFrecuente(caso.datos.mensaje), `caso ${caso.id}: la E manda en el claro`).toBe('E');
      expect(detectarDesplazamiento(cripto), `caso ${caso.id}`).toBe(caso.datos.clave);
      expect((A26.indexOf(masFrecuente(cripto)) - 4 + 26) % 26, `caso ${caso.id}`).toBe(caso.datos.clave);
    }
  });

  test('10 · el corrector normaliza el texto y nombra los errores típicos', () => {
    const corregir = (id: number, entrada: string) => comprobarRespuesta(entrada, CASOS[id - 1]);
    // Normalización: minúsculas, espacios, signos y tildes no cuentan; la Ñ no vale por N.
    expect(corregir(1, 'ixhjr').correcto).toBe(true);
    expect(corregir(1, 'I X H J R').correcto).toBe(true);
    expect(corregir(2, 'Pyré').correcto).toBe(true);
    expect(corregir(8, 'nos vemos en el patio.').correcto).toBe(true);
    expect(corregir(8, 'NOSVEMOSENELPATIO').correcto).toBe(true);
    expect(corregir(4, 'TORTUGÑ').correcto).toBe(false);
    // Las trampas con nombre propio.
    expect(corregir(2, 'OYQE').motivo).toMatch(/Ñ/); // 27 letras
    expect(corregir(2, 'HQJW').motivo).toMatch(/descifrar/i); // sentido contrario
    expect(corregir(4, 'TORTUHA').motivo).toMatch(/Ñ/);
    expect(corregir(5, '19').motivo).toMatch(/DESHACE/);
    expect(corregir(7, '32').motivo).toMatch(/26/);
    expect(corregir(6, '8').motivo).toMatch(/se cifró/);
    // Claves: «k = 7» y «7,0» valen; 26 y 7,5 son imposibles, no un fallo cualquiera.
    expect(corregir(5, 'k = 7').correcto).toBe(true);
    expect(corregir(5, '7,0').correcto).toBe(true);
    expect(corregir(5, '26').estado).toBe('imposible');
    expect(corregir(5, '7,5').estado).toBe('imposible');
    expect(corregir(5, '').estado).toBe('vacio');
    expect(corregir(5, 'abc').motivo).not.toMatch(/NaN/);
    // Una respuesta correcta nunca coincide con una de sus trampas (se filtran).
    for (const c of CASOS) {
      for (const t of c.trampas) expect(String(t.valor), `caso ${c.id}`).not.toBe(String(c.respuesta));
    }
  });

  test('11 · ningún título choca con los localizadores del acta', () => {
    // El acta busca sin `exact` «Ataque automático», «Párrafo largo», «Quijote» y «Ver guía
    // educativa», y con `exact` «Cifrar» y «Descifrar». El botón de un caso es «Caso N: título».
    for (const caso of CASOS) {
      expect(caso.titulo, `caso ${caso.id}`).not.toMatch(/Ataque automático|Párrafo largo|Quijote|Ver guía educativa/);
      expect(caso.titulo, `caso ${caso.id}`).not.toMatch(/^(Cifrar|Descifrar)$/);
    }
  });
});

test.describe('Casos para clase — en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, [DESLIZADOR, '#casos-respuesta']);
  });

  const seccionCasos = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test('el caso 2 se corrige: OYQE recibe el motivo de la Ñ y PYRE vale', async ({ page }) => {
    const boton = page.getByRole('button', { name: /^Caso 2: / });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    await expect(seccionCasos(page)).toContainText('LUNA');
    const caja = page.locator('#casos-respuesta');
    const veredicto = seccionCasos(page).getByRole('alert');

    await caja.fill('OYQE');
    await esperarValorEnReact(page, '#casos-respuesta', 'OYQE');
    await seccionCasos(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto).toContainText('Ñ');

    await caja.fill('pyre');
    await esperarValorEnReact(page, '#casos-respuesta', 'pyre');
    await caja.press('Enter');
    await expect(veredicto).toContainText('¡Correcto!');
  });

  test('la solución se despliega con aria-expanded y enseña la respuesta', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 4: / }).click();
    const boton = seccionCasos(page).getByRole('button', { name: 'Ver solución' });
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await boton.click();
    await expect(page.locator('#casos-solucion')).toContainText('TORTUGA');
  });

  test('Practicar trae un ejercicio, y una casilla vacía no pinta «NaN»', async ({ page }) => {
    await seccionCasos(page).getByRole('button', { name: /Practicar/ }).click();
    await expect(seccionCasos(page).getByRole('heading', { level: 3 })).toHaveText('Ejercicio de práctica');
    await seccionCasos(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccionCasos(page).getByRole('alert')).not.toContainText('NaN');
  });

  test('la sección no deja ambiguos los localizadores del acta', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Cifrar', exact: true })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Descifrar', exact: true })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Ataque automático' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Quijote' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Párrafo largo' })).toHaveCount(1);
    await expect(page.locator('canvas')).toHaveCount(1);
    // El aviso del ataque solo se monta tras atacar: la sección no añade otro con esa clase.
    await expect(page.locator('#casos-respuesta')).toBeVisible();
    await expect(page.locator('section[aria-labelledby="casos-aula-titulo"] [class*="attackResult"], section[aria-labelledby="casos-aula-titulo"] [class*="histo"], section[aria-labelledby="casos-aula-titulo"] [class*="rot13"]')).toHaveCount(0);
  });
});

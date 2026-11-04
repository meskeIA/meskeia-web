import { test, expect, Page } from '@playwright/test';

/**
 * tablero-comunicacion — Inspector, 04/11/2026 (modo primera).
 *
 * La app no calcula nada: lo que tiene verdad comprobable es la OPERATIVA del tablero
 * (qué frase compone cada pulsación, qué llega a `speechSynthesis.speak`, qué queda tras
 * borrar, qué se conserva al recargar) y su accesibilidad, porque su público puede usar
 * teclado, conmutador o lector de pantalla. Los esperados salen del código de la página
 * (`SIMBOLOS`, `leerTexto`, `leerFrase`, que une con «. ») y de lo que promete el texto:
 * el subtítulo («El botón verde la leerá en voz alta»), la FAQ visible («accesibles por
 * teclado (Tab + Enter)», «La frase se borra al cerrar o recargar») y las `features`
 * del JSON-LD («Favoritos guardados localmente»).
 *
 * Chromium sin cabeza tiene voces SAPI en esta máquina, pero no se puede contar con ellas en
 * cualquier PC: `speechSynthesis` y `SpeechSynthesisUtterance` se sustituyen por un DOBLE
 * que anota cada llamada (texto, idioma, voz, velocidad y tono) y que puede fallar a voluntad.
 *
 * Los hallazgos abiertos van con test.fail(): cuando se reparen, el test «pasará» y Playwright
 * lo marcará como fallo inesperado; entonces se quita el test.fail() y se escribe REPARADO.
 */

const RUTA = '/tablero-comunicacion/';

// Sin transiciones: el color de una pestaña se mide en su estado final, no a medio camino.
test.use({ reducedMotion: 'reduce' });

interface VozFalsa {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

interface ConfigDoble {
  voces: VozFalsa[];
  /** speak() emite un evento `error` (motor sin voz, voz remota sin red…). */
  falla?: boolean;
  /** El navegador no tiene `speechSynthesis` (p. ej. un navegador integrado en otra app). */
  sinSoporte?: boolean;
}

interface Llamada {
  f: 'speak' | 'cancel';
  text?: string;
  lang?: string;
  voz?: string | null;
  rate?: number;
  pitch?: number;
}

/** Se serializa y corre en la página antes que la app: no puede usar nada de fuera. */
function instalarDoble(config: ConfigDoble): void {
  type Manejador = ((e: Record<string, unknown>) => void) | null;
  const w = window as unknown as Record<string, unknown>;
  if (config.sinSoporte) {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    return;
  }
  const llamadas: Llamada[] = [];
  w.__llamadas = llamadas;

  class LocucionFalsa {
    text: string;
    lang = '';
    voice: VozFalsa | null = null;
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: Manejador = null;
    onerror: Manejador = null;
    onstart: Manejador = null;
    private oyentes: Record<string, Array<(e: Record<string, unknown>) => void>> = {};
    constructor(text: string) {
      this.text = text;
    }
    addEventListener(tipo: string, f: (e: Record<string, unknown>) => void): void {
      (this.oyentes[tipo] ||= []).push(f);
    }
    removeEventListener(): void {}
    emitir(tipo: 'error' | 'end', e: Record<string, unknown>): void {
      const h = tipo === 'error' ? this.onerror : this.onend;
      if (h) h(e);
      (this.oyentes[tipo] || []).forEach((f) => f(e));
    }
  }

  const synth = {
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null as Manejador,
    getVoices: (): VozFalsa[] => config.voces,
    speak(u: LocucionFalsa): void {
      llamadas.push({
        f: 'speak',
        text: u.text,
        lang: u.lang,
        voz: u.voice ? u.voice.name : null,
        rate: u.rate,
        pitch: u.pitch,
      });
      if (config.falla) setTimeout(() => u.emitir('error', { error: 'synthesis-failed' }), 10);
    },
    cancel(): void {
      llamadas.push({ f: 'cancel' });
    },
    pause(): void {},
    resume(): void {},
    addEventListener(): void {},
    removeEventListener(): void {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  w.SpeechSynthesisUtterance = LocucionFalsa;
}

const VOCES_ES: VozFalsa[] = [
  { name: 'Voz local A', lang: 'es-ES', localService: true, default: true, voiceURI: 'a' },
];

/**
 * La app no tiene inputs (el testigo de `_hidratacion.ts` es el rastreador de valor de un
 * input): se espera a que React haya puesto sus props en una celda, que es lo que hace falta
 * para que un clic no se pierda, y a que el efecto de montaje haya pasado (fija
 * `onvoiceschanged`; bajo `next dev` StrictMode lo monta dos veces y su limpieza llama a
 * cancel(), por eso cada caso borra las llamadas antes de medir).
 */
async function abrir(page: Page, config: ConfigDoble = { voces: VOCES_ES }): Promise<void> {
  await page.addInitScript(instalarDoble, config);
  await page.goto(RUTA);
  await page.waitForFunction(() => {
    const b = document.querySelector('button[aria-label="Agua"]');
    return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps$'));
  });
  if (!config.sinSoporte) {
    await page.waitForFunction(
      () => typeof (window.speechSynthesis as unknown as { onvoiceschanged: unknown }).onvoiceschanged === 'function',
    );
  }
  await limpiarLlamadas(page);
}

async function limpiarLlamadas(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __llamadas?: Llamada[] };
    if (w.__llamadas) w.__llamadas.length = 0;
  });
}

async function llamadas(page: Page): Promise<Llamada[]> {
  return page.evaluate(() => (window as unknown as { __llamadas: Llamada[] }).__llamadas.slice());
}

const frase = (page: Page) => page.locator('[aria-label="Frase construida"] [aria-live="polite"]');
const celda = (page: Page, texto: string) => page.getByRole('button', { name: texto, exact: true });
const pestana = (page: Page, nombre: string) => page.getByRole('tab', { name: new RegExp(nombre) });
const botonLeer = (page: Page) => page.getByRole('button', { name: 'Leer frase en voz alta' });
const botonBorrar = (page: Page) => page.getByRole('button', { name: 'Borrar último símbolo' });
const botonLimpiar = (page: Page) => page.getByRole('button', { name: 'Borrar toda la frase' });

const locucion = (text: string): Llamada => ({
  f: 'speak',
  text,
  lang: 'es-ES',
  voz: 'Voz local A',
  rate: 0.9,
  pitch: 1.1,
});

/**
 * Contraste WCAG del texto de `el` contra su fondo efectivo (compone las capas rgba de los
 * antepasados hasta la primera opaca). Se serializa: no puede usar nada de fuera.
 */
function contrasteDe(el: Element): number {
  const leer = (s: string): { r: number; g: number; b: number; a: number } => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    const p = (m ? m[1] : '0,0,0,0').split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lineal = (c: number): number => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = (c: { r: number; g: number; b: number }): number =>
    0.2126 * lineal(c.r) + 0.7152 * lineal(c.g) + 0.0722 * lineal(c.b);
  const capas: Array<{ r: number; g: number; b: number; a: number }> = [];
  for (let n: Element | null = el; n; n = n.parentElement) {
    const bg = leer(getComputedStyle(n).backgroundColor);
    if (bg.a > 0) capas.push(bg);
    if (bg.a === 1) break;
  }
  let base = { r: 255, g: 255, b: 255 };
  for (let i = capas.length - 1; i >= 0; i--) {
    const c = capas[i];
    base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a) };
  }
  const l1 = lum(leer(getComputedStyle(el).color));
  const l2 = lum(base);
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
}

const CATEGORIAS = ['Favoritos', 'Necesidades', 'Emociones', 'Comida', 'Acciones', 'Personas', 'Lugares'];

/** Pestañas activas, «Leer» y «⌫» que no llegan a su umbral, en el tema pedido. */
async function contrastesQueNoCumplen(page: Page, tema: 'light' | 'dark'): Promise<string[]> {
  await page.addInitScript((t) => localStorage.setItem('meskeia-theme', t), tema);
  await abrir(page);
  // Si el tema no se aplicó, el caso mediría el otro: se exige antes de medir.
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
  const fallos: string[] = [];
  await celda(page, 'Agua').click();
  await page.mouse.move(0, 0);
  await expect.poll(() => botonLeer(page).evaluate((b) => b.getAnimations().length)).toBe(0);
  // «Leer»: 15,2 px en negrita no es texto grande → 4,5:1. «⌫»: 20,8 px en negrita sí → 3:1.
  const leer = await botonLeer(page).evaluate(contrasteDe);
  if (leer < 4.5) fallos.push(`Leer ${leer}:1 < 4,5`);
  const borrar = await botonBorrar(page).evaluate(contrasteDe);
  if (borrar < 3) fallos.push(`⌫ ${borrar}:1 < 3`);
  // Rótulo de la pestaña activa: 13,12 px en negrita → 4,5:1.
  for (const nombre of CATEGORIAS) {
    await pestana(page, nombre).click();
    await page.mouse.move(0, 0);
    await expect(pestana(page, nombre)).toHaveAttribute('aria-selected', 'true');
    // Aun con reducedMotion la transición dura 0,01 ms: medir en el mismo fotograma del clic da
    // el gris de la pestaña inactiva. Se espera a que no le quede ninguna transición en curso.
    await expect.poll(() => pestana(page, nombre).evaluate((t) => t.getAnimations().length)).toBe(0);
    const r = await pestana(page, nombre).evaluate(contrasteDe);
    if (r < 4.5) fallos.push(`pestaña ${nombre} ${r}:1 < 4,5`);
  }
  return fallos;
}

test.describe('tablero-comunicacion — escritorio', () => {
  test('CASO 1: Agua + Galleta + Otra vez compone la frase, cada celda se dice y «Leer» la dice entera', async ({ page }) => {
    await abrir(page);
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase vacía');

    await celda(page, 'Agua').click();
    await pestana(page, 'Comida').click();
    await celda(page, 'Galleta').click();
    await pestana(page, 'Acciones').click();
    await celda(page, 'Otra vez').click();

    // Esperado: tres fichas en el orden pulsado (texto de SIMBOLOS) y una locución por celda,
    // en es-ES a 0,9 de velocidad y 1,1 de tono (leerTexto), precedida de cancel().
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase: Agua, Galleta, Otra vez');
    await expect(frase(page).locator(':scope > span')).toHaveText(['💧Agua', '🍪Galleta', '🔄Otra vez']);
    expect(await llamadas(page)).toEqual([
      { f: 'cancel' }, locucion('Agua'),
      { f: 'cancel' }, locucion('Galleta'),
      { f: 'cancel' }, locucion('Otra vez'),
    ]);

    // «Leer» une los textos con «. » (leerFrase).
    await limpiarLlamadas(page);
    await botonLeer(page).click();
    expect(await llamadas(page)).toEqual([{ f: 'cancel' }, locucion('Agua. Galleta. Otra vez')]);

    // «⌫» quita solo la última; «🗑️» vacía la frase, corta la voz y deshabilita los tres botones.
    await botonBorrar(page).click();
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase: Agua, Galleta');
    await limpiarLlamadas(page);
    await botonLimpiar(page).click();
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase vacía');
    expect(await llamadas(page)).toEqual([{ f: 'cancel' }]);
    await expect(botonLeer(page)).toBeDisabled();
    await expect(botonBorrar(page)).toBeDisabled();
    await expect(botonLimpiar(page)).toBeDisabled();
  });

  test('CASO 2: frase vacía, Favoritos vacía y 30 «Sí» seguidos', async ({ page }) => {
    await abrir(page);
    // «Leer» con la frase vacía no habla: está deshabilitado y leerFrase sale sin llamar a speak.
    await expect(botonLeer(page)).toBeDisabled();
    await botonLeer(page).click({ force: true });
    expect(await llamadas(page)).toEqual([]);

    // Favoritos sin nada marcado: el aviso y ninguna celda.
    await pestana(page, 'Favoritos').click();
    const panel = page.getByRole('tabpanel');
    await expect(panel).toHaveText('⭐ Pulsa la estrella ☆ en cualquier símbolo para añadirlo aquí');
    await expect(panel.getByRole('button')).toHaveCount(0);

    // 30 veces «Sí»: 30 fichas, sin desbordar a lo ancho, y «Leer» dice una sola locución de
    // 30 × 2 + 29 × 2 = 118 caracteres («Sí. Sí. … Sí»).
    await pestana(page, 'Necesidades').click();
    for (let i = 0; i < 30; i++) await celda(page, 'Sí').click();
    await expect(frase(page).locator(':scope > span')).toHaveCount(30);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ancho).toBeLessThanOrEqual(0);
    await limpiarLlamadas(page);
    await botonLeer(page).click();
    expect(await llamadas(page)).toEqual([{ f: 'cancel' }, locucion(Array(30).fill('Sí').join('. '))]);
  });

  test('CASO 2 (teclado): con Tab, Enter y Espacio se compone «Sí, Agua, Hambre»', async ({ page }) => {
    await abrir(page);
    // Desde la última pestaña, Tab lleva a la primera celda del panel (FAQ: «Tab + Enter»).
    await pestana(page, 'Lugares').focus();
    await page.keyboard.press('Tab');
    await expect(celda(page, 'Sí')).toBeFocused();
    await page.keyboard.press('Enter');
    await celda(page, 'Agua').focus();
    await page.keyboard.press('Enter');
    await celda(page, 'Hambre').focus();
    await page.keyboard.press('Space');
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase: Sí, Agua, Hambre');
  });

  test('favoritos: «Agua» marcada sigue en Favoritos al recargar, y la frase no se guarda', async ({ page }) => {
    await abrir(page);
    await celda(page, 'Hambre').click();
    await page.getByRole('button', { name: 'Añadir Agua a favoritos' }).click();
    await expect(page.getByRole('button', { name: 'Quitar Agua de favoritos' })).toHaveAttribute('aria-pressed', 'true');
    await expect(pestana(page, 'Favoritos')).toHaveText(/Favoritos \(1\)/);

    await page.reload();
    await page.waitForFunction(() => {
      const b = document.querySelector('button[aria-label="Agua"]');
      return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps$'));
    });
    // features: «Favoritos guardados localmente» · FAQ: «La frase construida se borra al recargar».
    await expect(pestana(page, 'Favoritos')).toHaveText(/Favoritos \(1\)/);
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase vacía');
    await pestana(page, 'Favoritos').click();
    await expect(page.getByRole('tabpanel').getByRole('button', { name: 'Agua', exact: true })).toBeVisible();
  });

  // ABIERTO (inspector 04/11/2026): la estrella de favoritos tiene `opacity: 0` salvo con :hover
  // del ratón, así que con teclado cada segundo Tab cae en un control invisible (y su anillo de
  // foco también: WCAG 2.4.7). Esperado: el control con foco se ve.
  test('la estrella de favoritos se ve cuando recibe el foco con Tab', async ({ page }) => {
    test.fail();
    await abrir(page);
    await celda(page, 'Sí').focus();
    await page.keyboard.press('Tab');
    const estrella = page.getByRole('button', { name: 'Añadir Sí a favoritos' });
    await expect(estrella).toBeFocused();
    await expect(estrella).toHaveCSS('opacity', '1', { timeout: 1000 });
  });

  // ABIERTO (inspector 04/11/2026): role="tablist" sin flechas (todas las pestañas con
  // tabindex 0) y aria-controls que apunta a un panel que no existe en 5 de las 7 pestañas.
  test('las pestañas responden a las flechas y su aria-controls apunta a un panel que existe', async ({ page }) => {
    test.fail();
    await abrir(page);
    const rotos = await page.evaluate(() =>
      [...document.querySelectorAll('[role="tab"]')]
        .filter((t) => !document.getElementById(t.getAttribute('aria-controls') || ''))
        .map((t) => (t.textContent || '').trim()),
    );
    await pestana(page, 'Necesidades').focus();
    await page.keyboard.press('ArrowRight');
    expect({ rotos, foco: await page.evaluate(() => (document.activeElement?.textContent || '').trim()) }).toEqual({
      rotos: [],
      foco: '😊Emociones',
    });
  });

  // ABIERTO (inspector 04/11/2026): blanco sobre #16A34A en «Leer» (3,30:1), blanco sobre #F59E0B
  // en «⌫» (2,15:1) y el color de categoría como texto de la pestaña activa (en claro: Favoritos
  // y Emociones 2,81, Comida 2,91, Lugares 3,31, Acciones 3,63, Necesidades 4,27).
  test('contraste en claro: «Leer», «⌫» y la pestaña activa llegan a su umbral', async ({ page }) => {
    test.fail();
    expect(await contrastesQueNoCumplen(page, 'light')).toEqual([]);
  });

  // ABIERTO (inspector 04/11/2026): en oscuro, Personas 2,84, Necesidades 3,35, Acciones 3,94 y
  // Lugares 4,32, además de «Leer» y «⌫», que no cambian de color con el tema.
  test('contraste en oscuro: «Leer», «⌫» y la pestaña activa llegan a su umbral', async ({ page }) => {
    test.fail();
    expect(await contrastesQueNoCumplen(page, 'dark')).toEqual([]);
  });

  // ABIERTO (inspector 04/11/2026): sin `speechSynthesis` leerTexto sale en silencio. Esperado:
  // un aviso de que la voz no está disponible (el subtítulo promete que «la leerá en voz alta»).
  test('sin síntesis de voz en el navegador, la app avisa de que no puede hablar', async ({ page }) => {
    test.fail();
    await abrir(page, { voces: [], sinSoporte: true });
    await celda(page, 'Agua').click();
    await botonLeer(page).click();
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase: Agua');
    await expect(page.locator('[role="alert"], [role="status"]').filter({ hasText: /voz/i })).toBeVisible({ timeout: 2000 });
  });

  // ABIERTO (inspector 04/11/2026): leerTexto no escucha el `error` de la locución.
  test('si la locución falla (evento error), la app lo dice', async ({ page }) => {
    test.fail();
    await abrir(page, { voces: VOCES_ES, falla: true });
    await celda(page, 'Agua').click();
    await botonLeer(page).click();
    expect((await llamadas(page)).filter((l) => l.f === 'speak')).toHaveLength(2);
    await expect(page.locator('[role="alert"], [role="status"]').filter({ hasText: /voz/i })).toBeVisible({ timeout: 2000 });
  });

  // ABIERTO (inspector 04/11/2026): el FAQPage dice que la voz «genera habla natural» y que
  // funcionar sin conexión «garantiza disponibilidad en cualquier momento»; la página avisa de
  // que «puede sonar robótica» y la app no habla (ni avisa) si el navegador no tiene voz.
  test('el FAQPage no promete voz natural ni disponibilidad garantizada', async ({ page }) => {
    test.fail();
    await page.goto(RUTA);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.find((b) => b.includes('"FAQPage"')) || '';
    expect(faq).toContain('síntesis de voz');
    expect({ natural: faq.includes('habla natural'), garantiza: faq.includes('garantiza disponibilidad') }).toEqual({
      natural: false,
      garantiza: false,
    });
  });
});

test.describe('tablero-comunicacion — móvil (Pixel 7)', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 3: las 12 celdas caben sin desbordar, miden al menos 44 × 44 y un toque en «Agua» la añade', async ({ page }) => {
    await abrir(page);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ancho).toBeLessThanOrEqual(0);
    const cajas = await page
      .getByRole('tabpanel')
      .locator('button:not([aria-pressed])')
      .evaluateAll((bs) => bs.map((b) => { const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, der: r.right }; }));
    expect(cajas).toHaveLength(12);
    for (const c of cajas) {
      expect(c.w).toBeGreaterThanOrEqual(44);
      expect(c.h).toBeGreaterThanOrEqual(44);
      expect(c.der).toBeLessThanOrEqual(412);
    }
    await celda(page, 'Agua').tap();
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase: Agua');
    expect((await llamadas(page)).filter((l) => l.f === 'speak')).toEqual([locucion('Agua')]);
  });

  // ABIERTO (inspector 04/11/2026): con la barra de frase a la vista, la 6.ª ficha abre una segunda
  // fila, la barra crece y la rejilla baja: el 6.º toque en el mismo punto cae en la pestaña
  // «Favoritos» (vacía) y la frase se queda en cinco «Sí». Esperado: seis «Sí».
  test('seis toques en el mismo punto de «Sí» dan seis «Sí»', async ({ page }) => {
    test.fail();
    await abrir(page);
    await page.evaluate(() => {
      const r = document.querySelector('[aria-label="Frase construida"]')!.getBoundingClientRect();
      window.scrollBy(0, r.top - 8);
    });
    const caja = (await celda(page, 'Sí').boundingBox())!;
    const x = caja.x + caja.width / 2;
    const y = caja.y + caja.height / 2;
    const esperadas: string[] = [];
    for (let i = 1; i <= 6; i++) {
      await page.touchscreen.tap(x, y);
      esperadas.push('Sí');
      await expect(frase(page)).toHaveAttribute('aria-label', `Frase: ${esperadas.join(', ')}`, { timeout: 1500 });
    }
  });

  // ABIERTO (inspector 04/11/2026): en táctil no hay :hover, así que al cargar las 12 estrellas
  // están en opacity 0 y el aviso de Favoritos («Pulsa la estrella ☆ en cualquier símbolo») no se
  // puede seguir. Solo aparece la de una celda tras TOCARLA (el :hover pegajoso del toque), que
  // ya ha añadido esa palabra a la frase y la ha dicho en voz alta.
  test('la estrella de favoritos se ve en un dispositivo táctil sin tener que tocar antes la celda', async ({ page }) => {
    test.fail();
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Añadir Sí a favoritos' })).toHaveCSS('opacity', '1', { timeout: 1000 });
  });

  test('tocar una celda revela su estrella, pero a costa de añadir la palabra a la frase', async ({ page }) => {
    await abrir(page);
    await celda(page, 'Sí').tap();
    await expect(page.getByRole('button', { name: 'Añadir Sí a favoritos' })).toHaveCSS('opacity', '1');
    await expect(frase(page)).toHaveAttribute('aria-label', 'Frase: Sí');
  });

  // ABIERTO (inspector 04/11/2026): «Personas» (402-472 px) y «Lugares» (478-548 px) quedan fuera
  // de los 412 px, con la barra de desplazamiento oculta. Si la reparación opta por un indicador
  // de desplazamiento en vez de que quepan, este caso se reescribe con ese indicador.
  test('las siete pestañas de categoría están a la vista', async ({ page }) => {
    test.fail();
    await abrir(page);
    const derecha = await pestana(page, 'Lugares').evaluate((t) => t.getBoundingClientRect().right);
    expect(derecha).toBeLessThanOrEqual(412);
  });
});

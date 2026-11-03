import { test, expect, devices, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * lector-texto-voz — Inspector, 03/11/2026 (modo primera).
 *
 * La app no calcula nada normativo; lo que tiene verdad comprobable es:
 *   · el contador «N palabras · M caracteres» (palabras = trozos separados por blancos;
 *     caracteres = longitud del texto),
 *   · la palabra que se resalta para cada `charIndex` de un evento `boundary`,
 *   · el porcentaje de la barra: palabra actual ÷ total (redondeado),
 *   · el estado de los botones (Leer, Pausar/Reanudar, Detener).
 *
 * Chromium sin cabeza tiene voces SAPI en esta máquina, pero no se puede contar con ellas en
 * cualquier PC ni hacerlas emitir `boundary` a voluntad: por eso `window.speechSynthesis` y
 * `SpeechSynthesisUtterance` se sustituyen por un DOBLE (instalarDoble) que anota cada llamada
 * y emite los `boundary` que elige el test. Con el motor real (Chromium 156 + Microsoft Helena,
 * script del Inspector) el resaltado y el progreso coincidieron con este mismo oráculo en las
 * 13 palabras medidas, y Pausar → Detener → Leer volvió a hablar.
 *
 * La medición de las voces de Edge (324 voces, 45 de las 48 en español con
 * `localService: false`) va en el acta, no aquí: el spec no depende de que Edge esté instalado.
 *
 * Los hallazgos nuevos van con test.fail(): cuando se reparen, el test «pasará» y Playwright lo
 * marcará como fallo inesperado; entonces se quita el test.fail() y se escribe REPARADO.
 */

const RUTA = '/lector-texto-voz/';

interface VozFalsa {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

interface ConfigDoble {
  voces: VozFalsa[];
  sinSoporte?: boolean;
}

interface Llamada {
  f: 'speak' | 'pause' | 'resume' | 'cancel';
  text?: string;
  lang?: string;
  voz?: string | null;
  local?: boolean | null;
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
    onboundary: Manejador = null;
    onend: Manejador = null;
    onerror: Manejador = null;
    onstart: Manejador = null;
    constructor(text: string) {
      this.text = text;
    }
  }

  let actual: LocucionFalsa | null = null;
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
        local: u.voice ? u.voice.localService : null,
        rate: u.rate,
        pitch: u.pitch,
      });
      actual = u;
      synth.speaking = true;
    },
    pause(): void {
      llamadas.push({ f: 'pause' });
      synth.paused = true;
    },
    resume(): void {
      llamadas.push({ f: 'resume' });
      synth.paused = false;
    },
    cancel(): void {
      llamadas.push({ f: 'cancel' });
      const u = actual;
      actual = null;
      synth.speaking = false;
      if (u && u.onerror) setTimeout(() => u.onerror?.({ error: 'interrupted' }), 0);
    },
    addEventListener(): void {},
    removeEventListener(): void {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  w.SpeechSynthesisUtterance = LocucionFalsa;
  w.__boundary = (charIndex: number, name = 'word'): void => {
    actual?.onboundary?.({ name, charIndex });
  };
  w.__fin = (): void => {
    const u = actual;
    actual = null;
    synth.speaking = false;
    u?.onend?.({});
  };
}

const VOCES_ES: VozFalsa[] = [
  { name: 'Voz local A', lang: 'es-ES', localService: true, default: true, voiceURI: 'a' },
  { name: 'Voz local B', lang: 'es-MX', localService: true, default: false, voiceURI: 'b' },
];

async function abrir(page: Page, config: ConfigDoble = { voces: VOCES_ES }): Promise<void> {
  await page.addInitScript(instalarDoble, config);
  await page.goto(RUTA);
  await esperarHidratacion(page, ['textarea']);
}

async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator('textarea').fill(texto);
  await esperarValorEnReact(page, 'textarea', texto);
}

const contador = (page: Page) => page.locator('p', { hasText: /· \d+ caracteres$/ });
const botonLeer = (page: Page) => page.getByRole('button', { name: 'Iniciar lectura' });
const resaltada = (page: Page) => page.locator('mark[aria-current="true"]');

async function boundary(page: Page, charIndex: number): Promise<void> {
  await page.evaluate(
    (c) => (window as unknown as { __boundary: (c: number) => void }).__boundary(c),
    charIndex,
  );
}

async function llamadas(page: Page): Promise<Llamada[]> {
  return page.evaluate(() => (window as unknown as { __llamadas: Llamada[] }).__llamadas);
}

test.describe('lector-texto-voz · contador, resaltado y controles', () => {
  test('normal · el texto de ejemplo: 60 palabras · 402 caracteres', async ({ page }) => {
    // Contado a mano: párrafo 1 → 24 palabras y 167 caracteres; párrafo 2 → 20 y 135;
    // párrafo 3 → 16 y 96; más los dos «\n\n» (4). 24 + 20 + 16 = 60 · 167 + 135 + 96 + 4 = 402.
    await abrir(page);
    await expect(contador(page)).toHaveText('60 palabras · 402 caracteres');
    await expect(botonLeer(page)).toBeEnabled();
  });

  test('normal · «Hola mundo bonito»: resaltado y progreso 0/33/67 %, pausa, reanudación y fin', async ({
    page,
  }) => {
    // Palabras: Hola (0, empieza en 0), mundo (1, en 5), bonito (2, en 11). Total 3.
    // Progreso = round(índice ÷ 3 × 100): 0 · 33,3 → 33 · 66,7 → 67.
    await abrir(page);
    await escribir(page, 'Hola mundo bonito');
    await expect(contador(page)).toHaveText('3 palabras · 17 caracteres');

    await botonLeer(page).click();
    await expect(page.getByRole('tab', { name: /Seguir lectura/ })).toHaveAttribute('aria-selected', 'true');
    const [speak] = (await llamadas(page)).filter((l) => l.f === 'speak');
    expect(speak).toMatchObject({ text: 'Hola mundo bonito', lang: 'es-ES', voz: 'Voz local A', rate: 1, pitch: 1 });

    const barra = page.getByRole('progressbar');
    for (const [ci, palabra, pct] of [
      [0, 'Hola', '0'],
      [5, 'mundo', '33'],
      [11, 'bonito', '67'],
    ] as const) {
      await boundary(page, ci);
      await expect(resaltada(page)).toHaveText(palabra);
      await expect(barra).toHaveAttribute('aria-valuenow', pct);
    }
    // Un boundary en un blanco (charIndex 4) no mueve el resaltado
    await boundary(page, 4);
    await expect(resaltada(page)).toHaveText('bonito');

    await page.getByRole('button', { name: 'Pausar lectura' }).click();
    await expect(page.getByRole('button', { name: 'Reanudar lectura' })).toBeVisible();
    await page.getByRole('button', { name: 'Reanudar lectura' }).click();
    await expect(page.getByRole('button', { name: 'Pausar lectura' })).toBeVisible();
    expect((await llamadas(page)).map((l) => l.f)).toEqual(['cancel', 'speak', 'pause', 'resume']);

    // Fin natural: vuelve Leer, desaparece la barra y no queda palabra resaltada
    await page.evaluate(() => (window as unknown as { __fin: () => void }).__fin());
    await expect(botonLeer(page)).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(resaltada(page)).toHaveCount(0);
  });

  test('normal · Detener cancela la locución y devuelve el botón Leer', async ({ page }) => {
    await abrir(page);
    await escribir(page, 'Hola mundo bonito');
    await botonLeer(page).click();
    await boundary(page, 5);
    await page.getByRole('button', { name: 'Detener lectura' }).click();
    await expect(botonLeer(page)).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    expect((await llamadas(page)).map((l) => l.f)).toEqual(['cancel', 'speak', 'cancel']);
  });

  test('rechazo · vacío, solo espacios o solo saltos de línea: Leer deshabilitado', async ({ page }) => {
    await abrir(page);
    for (const texto of ['', '   ', '\n\n  \n']) {
      await escribir(page, texto);
      await expect(botonLeer(page), JSON.stringify(texto)).toBeDisabled();
    }
  });

  test('rechazo · navegador sin síntesis de voz: aviso y Leer deshabilitado aunque haya texto', async ({
    page,
  }) => {
    await abrir(page, { voces: [], sinSoporte: true });
    // Acotado al aviso de la app (el anunciador de rutas de Next también es role=alert)
    await expect(page.locator('[role="alert"]', { hasText: 'síntesis de voz' })).toContainText(
      'Tu navegador no soporta síntesis de voz.',
    );
    await expect(botonLeer(page)).toBeDisabled();
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · el contador suma palabras fantasma con blancos al principio o al final', async ({
    page,
  }) => {
    // texto.split(/(\s+)/) deja un «» vacío delante y otro detrás cuando el texto empieza o
    // acaba en blanco, y cada «» cuenta como palabra. Esperado (a mano):
    //   «» → 0 palabras · 0 caracteres (hoy 1)
    //   «   » → 0 · 3 (hoy 2)
    //   «Hola mundo\n» (lo normal al pegar un párrafo) → 2 · 11 (hoy 3)
    //   «  Hola mundo» → 2 · 12 (hoy 3)
    test.fail();
    await abrir(page);
    for (const [texto, esperado] of [
      ['', '0 palabras · 0 caracteres'],
      ['   ', '0 palabras · 3 caracteres'],
      ['Hola mundo\n', '2 palabras · 11 caracteres'],
      ['  Hola mundo', '2 palabras · 12 caracteres'],
    ] as const) {
      await escribir(page, texto);
      await expect(contador(page), JSON.stringify(texto)).toHaveText(esperado);
    }
  });

  test('HALLAZGO (03/11/2026, ABIERTO, el mismo del contador) · con blancos delante, la barra marca 33 % en la primera palabra', async ({
    page,
  }) => {
    // «  Hola mundo»: Hola empieza en 2 y mundo en 7; total 2 palabras → 0 % y 50 %.
    // Hoy la palabra fantasma del principio sube el índice y el total: 33 % y 67 %.
    // «Hola mundo\n»: mundo (en 5) → 50 %; hoy 33 % por la fantasma del final.
    test.fail();
    await abrir(page);
    await escribir(page, '  Hola mundo');
    await botonLeer(page).click();
    const barra = page.getByRole('progressbar');
    await boundary(page, 2);
    await expect(resaltada(page)).toHaveText('Hola');
    await expect(barra).toHaveAttribute('aria-valuenow', '0');
    await boundary(page, 7);
    await expect(resaltada(page)).toHaveText('mundo');
    await expect(barra).toHaveAttribute('aria-valuenow', '50');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · la FAQ promete elegir voz inglesa o francesa y el selector solo ofrece español', async ({
    page,
  }) => {
    // FAQ visible: «Si pegas texto en inglés o francés, puedes seleccionar la voz correspondiente
    // en el selector de voces». cargarVoces filtra a `lang` es-* en cuanto hay una sola voz
    // española, y además fija utt.lang = 'es-ES' sea cual sea la voz. En Edge (03/11/2026)
    // había 324 voces, 22 de ellas en-US o fr-FR, y el selector ofrecía 0 que no fueran es-*.
    test.fail();
    await abrir(page, {
      voces: [
        { name: 'Voz ES', lang: 'es-ES', localService: true, default: true, voiceURI: 'es' },
        { name: 'Voice EN', lang: 'en-US', localService: true, default: false, voiceURI: 'en' },
        { name: 'Voix FR', lang: 'fr-FR', localService: true, default: false, voiceURI: 'fr' },
      ],
    });
    const opciones = page.locator('#selector-voz option');
    await expect(opciones).toHaveCount(3);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · privacidad: una voz de servicio remoto se usa sin aviso y la página dice que el texto nunca sale del dispositivo', async ({
    page,
  }) => {
    // SpeechSynthesisVoice.localService (W3C Web Speech API): true = síntesis local; false =
    // servicio remoto. Las «voces neuronales de mayor calidad» que la página recomienda en
    // Edge y Chrome son de las segundas (Edge, 03/11/2026: 45 de 48 voces es-* con
    // localService=false, «Microsoft … Online (Natural)»). El selector las ofrece mezcladas,
    // sin distinguirlas, y la app les manda el texto entero. Coherente sería: o no se ofrecen
    // (o se avisan), o la página no promete «el texto nunca sale de tu dispositivo».
    test.fail();
    await abrir(page, {
      voces: [
        { name: 'Voz local', lang: 'es-ES', localService: true, default: true, voiceURI: 'l' },
        { name: 'Voz Online (Natural)', lang: 'es-ES', localService: false, default: false, voiceURI: 'r' },
      ],
    });
    await expect(page.locator('#selector-voz option')).toHaveCount(2);
    await page.locator('#selector-voz').selectOption('Voz Online (Natural)');
    await botonLeer(page).click();
    const [speak] = (await llamadas(page)).filter((l) => l.f === 'speak');
    // Hoy: el texto de ejemplo entero va a la voz remota
    const usoRemoto = speak?.local === false;
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const textoPagina = (await page.locator('body').textContent()) ?? '';
    const promete = /nunca sale de tu dispositivo|Ni el texto ni el audio salen|funciona sin conexión/.test(
      textoPagina,
    );
    expect(usoRemoto && promete, 'voz remota usada sin aviso con la promesa de privacidad en pantalla').toBe(false);
  });

  test('accesibilidad · Leer con teclado deja el foco en Pausar', async ({ page }) => {
    // React reutiliza el <button> de Leer como el de Pausar: hoy el foco no se pierde aquí.
    await abrir(page);
    await botonLeer(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Pausar lectura' })).toBeFocused();
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · Detener con teclado manda el foco a <body>', async ({ page }) => {
    // Al volver a «parado», React conserva el primer botón (Pausar → Leer) y DESMONTA Detener,
    // que era el que tenía el foco. Un usuario de teclado o lector de pantalla vuelve al
    // principio del documento. Esperado: el foco en un control de reproducción (Leer).
    test.fail();
    await abrir(page);
    await botonLeer(page).click();
    await page.getByRole('button', { name: 'Detener lectura' }).focus();
    await page.keyboard.press('Enter');
    await expect(botonLeer(page)).toBeVisible();
    const enfocado = await page.evaluate(() => document.activeElement?.tagName ?? null);
    expect(enfocado).not.toBe('BODY');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · la barra de progreso no tiene nombre accesible', async ({ page }) => {
    // El aria-label «Progreso: N%» está en el <div> contenedor (genérico, donde aria-label no
    // vale); el role="progressbar" interior no tiene aria-label ni aria-labelledby.
    test.fail();
    await abrir(page);
    await botonLeer(page).click();
    await expect(page.getByRole('progressbar', { name: /progreso/i })).toHaveCount(1);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · cada palabra se expone como «mark» (resaltada), no solo la que se lee', async ({
    page,
  }) => {
    // Cada palabra es un <mark>, que el árbol de accesibilidad publica con rol «mark»: con el
    // texto de ejemplo, 60 palabras resaltadas para el lector de pantalla. La que se lee ya
    // lleva aria-current. Esperado: como mucho un elemento con rol mark.
    test.fail();
    await abrir(page);
    await botonLeer(page).click();
    await boundary(page, 0);
    const arbol = await page.getByRole('status').filter({ hasText: 'La lectura en voz alta' }).ariaSnapshot();
    const marks = arbol.split('\n').filter((l) => /^\s*- mark\b/.test(l)).length;
    expect(marks).toBeLessThanOrEqual(1);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · en pausa, velocidad, tono y voz se pueden mover y no se aplican', async ({
    page,
  }) => {
    // FAQ visible: «los sliders están desactivados durante la reproducción». Lo están solo con
    // estado «reproduciendo»: en pausa se habilitan, la etiqueta cambia a 1.5× y al Reanudar
    // la locución sigue con rate 1 (no hay speak nuevo). Vale cualquiera de las dos reparaciones.
    test.fail();
    await abrir(page);
    await escribir(page, 'Hola mundo bonito');
    await botonLeer(page).click();
    await page.getByRole('button', { name: 'Pausar lectura' }).click();
    const deslizador = page.locator('#slider-velocidad');
    if (await deslizador.isEnabled()) {
      await sembrarValor(page, '#slider-velocidad', '1.5');
      await page.getByRole('button', { name: 'Reanudar lectura' }).click();
      const speaks = (await llamadas(page)).filter((l) => l.f === 'speak');
      expect(speaks.at(-1)?.rate).toBe(1.5);
    } else {
      await expect(deslizador).toBeDisabled();
    }
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · el JSON-LD promete «ajuste de tono y volumen» y no hay control de volumen', async ({
    page,
  }) => {
    // La app tiene dos deslizadores, Velocidad y Tono; ninguna línea fija utt.volume.
    test.fail();
    await abrir(page);
    await expect(page.locator('input[type="range"]')).toHaveCount(2);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = scripts
      .map((s) => JSON.parse(s) as Record<string, unknown>)
      .find((o) => o['@type'] === 'WebApplication');
    const features = (app?.featureList as string[] | undefined) ?? [];
    expect(features.length).toBeGreaterThanOrEqual(4);
    expect(features.join(' · ')).not.toMatch(/volumen/i);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · FAQPage y página recomiendan velocidades distintas para la dislexia', async ({
    page,
  }) => {
    // FAQPage (solo la leen buscadores e IA): «Las personas con dislexia… entre el 60% y el 80%».
    // Página, paso 2: «Para personas con dislexia o mayores, empieza en 0.8× o 0.9×».
    test.fail();
    await abrir(page);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = scripts
      .map((s) => JSON.parse(s) as { '@type'?: string; mainEntity?: { acceptedAnswer: { text: string } }[] })
      .find((o) => o['@type'] === 'FAQPage');
    const respuestas = (faq?.mainEntity ?? []).map((q) => q.acceptedAnswer.text).join('\n');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const paso2 = await page.locator('li', { hasText: 'Ajusta la velocidad' }).textContent();
    const dislexiaFaq60 = /dislexia[^.]*entre el 60\s?% y el 80\s?%/.test(respuestas);
    const paginaDice09 = /dislexia o mayores, empieza en 0[.,]8×? o 0[.,]9×/.test(paso2 ?? '');
    expect(dislexiaFaq60 && paginaDice09).toBe(false);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · formato: «1.0×», «33%», «1 palabras» y «35999 caracteres»', async ({
    page,
  }) => {
    // Formato español (CLAUDE.md global §2): coma decimal, «33 %» con espacio, punto de miles
    // con cinco cifras; y el singular con una palabra.
    test.fail();
    await abrir(page);
    await expect(page.locator('label[for="slider-velocidad"]')).toContainText('1,0×');
    await escribir(page, 'Hola');
    await expect(contador(page)).toHaveText('1 palabra · 4 caracteres');
    // 4.000 × «estudiar» (8) + 3.999 espacios = 35.999 caracteres
    await escribir(page, Array.from({ length: 4000 }, () => 'estudiar').join(' '));
    await expect(contador(page)).toHaveText('4000 palabras · 35.999 caracteres');
    await escribir(page, 'Hola mundo bonito');
    await botonLeer(page).click();
    await boundary(page, 5);
    await expect(page.locator('[class*="progresoTexto"]')).toHaveText(/^33\s%$/);
  });
});

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];

test.describe('lector-texto-voz · móvil (Pixel 7)', () => {
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test('móvil · tocar Leer, resaltar la última palabra (67 %), Pausar y sin desborde', async ({ page }) => {
    // «Hola mundo bonito»: bonito empieza en 11, índice 2 de 3 → round(66,7) = 67.
    await abrir(page);
    await escribir(page, 'Hola mundo bonito');
    await botonLeer(page).tap();
    await boundary(page, 11);
    await expect(resaltada(page)).toHaveText('bonito');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    await page.getByRole('button', { name: 'Pausar lectura' }).tap();
    await expect(page.getByRole('button', { name: 'Reanudar lectura' })).toBeVisible();
    expect((await llamadas(page)).map((l) => l.f)).toEqual(['cancel', 'speak', 'pause']);
    const { scroll, ancho } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      ancho: window.innerWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(ancho);
  });
});

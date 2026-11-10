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
  // Bajo `next dev`, StrictMode monta, desmonta y vuelve a montar los efectos: la limpieza del
  // de las voces llama a cancel() al cargar (pila: disconnectPassiveEffect, medido el 03/11/2026)
  // y en `next start` no. Las llamadas que mide cada caso son las de después de cargar. El
  // selector de voz aparece tras ese efecto (setVoces), así que verlo garantiza que ya pasó.
  if (!config.sinSoporte && config.voces.length > 0) await expect(page.locator('#selector-voz')).toBeVisible();
  await page.evaluate(() => {
    const w = window as unknown as { __llamadas?: Llamada[] };
    if (w.__llamadas) w.__llamadas.length = 0;
  });
}

async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator('textarea').fill(texto);
  await esperarValorEnReact(page, 'textarea', texto);
}

const contador = (page: Page) => page.locator('p', { hasText: /· [\d.]+ (caracteres|carácter)$/ });
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

  test('HALLAZGO 3960 (03/11/2026, REPARADO) · el contador no suma palabras fantasma con blancos al principio o al final', async ({
    page,
  }) => {
    // texto.split(/(\s+)/) dejaba un «» vacío delante y otro detrás cuando el texto empieza o
    // acaba en blanco, y cada «» contaba como palabra. Ahora los trozos vacíos se descartan.
    // Esperado (a mano):
    //   «» → 0 palabras · 0 caracteres (antes 1)
    //   «   » → 0 · 3 (antes 2)
    //   «\n\n  \n» → 0 · 5 (antes 2)
    //   «Hola mundo\n» (lo normal al pegar un párrafo) → 2 · 11 (antes 3)
    //   «  Hola mundo» → 2 · 12 (antes 3)
    await abrir(page);
    for (const [texto, esperado] of [
      ['', '0 palabras · 0 caracteres'],
      ['   ', '0 palabras · 3 caracteres'],
      ['\n\n  \n', '0 palabras · 5 caracteres'],
      ['Hola mundo\n', '2 palabras · 11 caracteres'],
      ['  Hola mundo', '2 palabras · 12 caracteres'],
    ] as const) {
      await escribir(page, texto);
      await expect(contador(page), JSON.stringify(texto)).toHaveText(esperado);
    }
  });

  test('HALLAZGO 3960 (03/11/2026, REPARADO, el mismo del contador) · con blancos delante o detrás, la barra cuenta solo las palabras', async ({
    page,
  }) => {
    // «  Hola mundo»: Hola empieza en 2 y mundo en 7; total 2 palabras → 0 % y 50 %.
    // Antes la palabra fantasma del principio subía el índice y el total: 33 % y 67 %.
    // «Hola mundo\n»: mundo (en 5) → 50 %; antes 33 % por la fantasma del final.
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
    await page.getByRole('button', { name: 'Detener lectura' }).click();

    await page.getByRole('tab', { name: /Editar texto/ }).click();
    await escribir(page, 'Hola mundo\n');
    await botonLeer(page).click();
    await boundary(page, 5);
    await expect(resaltada(page)).toHaveText('mundo');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  test('HALLAZGO 3961 (03/11/2026, REPARADO con otro esperado) · la FAQ ya no promete voces inglesas o francesas: dice lo que hace el selector', async ({
    page,
  }) => {
    // La FAQ visible prometía «Si pegas texto en inglés o francés, puedes seleccionar la voz
    // correspondiente en el selector de voces», y cargarVoces filtra a `lang` es-* en cuanto hay
    // una sola voz española (en Edge, 03/11/2026: 324 voces, 22 en-US o fr-FR, y 0 ofrecidas).
    // El acta pedía 3 opciones en el selector; ampliar la app a otros idiomas es decisión del
    // usuario (frontera: «ampliar una app para cumplir su promesa»), así que se baja la promesa a
    // lo que la app hace (frontera N2 «promesa»): FAQ y selector dicen ahora lo mismo.
    await abrir(page, {
      voces: [
        { name: 'Voz ES', lang: 'es-ES', localService: true, default: true, voiceURI: 'es' },
        { name: 'Voice EN', lang: 'en-US', localService: true, default: false, voiceURI: 'en' },
        { name: 'Voix FR', lang: 'fr-FR', localService: true, default: false, voiceURI: 'fr' },
      ],
    });
    await expect(page.locator('#selector-voz option')).toHaveCount(1);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const respuesta = page
      .locator('dt', { hasText: '¿Puedo usar esta herramienta para textos en otros idiomas?' })
      .locator('xpath=following-sibling::dd[1]');
    await expect(respuesta).toContainText('pensada para textos en español');
    await expect(respuesta).not.toContainText(/puedes seleccionar la voz correspondiente/);
  });

  test('HALLAZGO 3959 (03/11/2026, REPARADO) · privacidad: las voces en línea se separan, se avisan y no se eligen por defecto', async ({
    page,
  }) => {
    // SpeechSynthesisVoice.localService (W3C Web Speech API): true = síntesis local; false =
    // servicio remoto. Las «voces neuronales de mayor calidad» que la página recomienda en
    // Edge y Chrome son de las segundas (Edge, 03/11/2026: 45 de 48 voces es-* con
    // localService=false, «Microsoft … Online (Natural)»). El selector las ofrecía mezcladas,
    // sin distinguirlas, mientras la página decía «el texto nunca sale de tu dispositivo».
    // Ahora: grupo propio «En línea», aviso visible al elegirlas, voz local por defecto aunque
    // la remota venga primera en getVoices(), y la página explica qué voces procesan fuera.
    await abrir(page, {
      voces: [
        { name: 'Voz Online (Natural)', lang: 'es-ES', localService: false, default: true, voiceURI: 'r' },
        { name: 'Voz local', lang: 'es-ES', localService: true, default: false, voiceURI: 'l' },
      ],
    });
    const selector = page.locator('#selector-voz');
    await expect(selector.locator('option')).toHaveCount(2);
    await expect(selector).toHaveValue('Voz local');
    await expect(selector.locator('optgroup[label^="En línea"] option')).toHaveText(['Voz Online (Natural) (es-ES) · en línea']);
    const aviso = page.locator('#aviso-voz');
    await expect(aviso).toHaveText(/sin salir de tu ordenador o móvil/);

    await selector.selectOption('Voz Online (Natural)');
    await expect(aviso).toHaveText(/Voz en línea: el navegador envía el texto a su servicio de voz/);
    await expect(selector).toHaveAttribute('aria-describedby', 'aviso-voz');
    await botonLeer(page).click();
    const [speak] = (await llamadas(page)).filter((l) => l.f === 'speak');
    expect(speak?.local).toBe(false);

    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const textoPagina = (await page.locator('body').textContent()) ?? '';
    expect(textoPagina).not.toMatch(/nunca sale de tu dispositivo|Ni el texto ni el audio salen|funciona sin conexión|privacidad al 100/);
    expect(textoPagina).toContain('envían el texto a su servicio de voz');
  });

  test('accesibilidad · Leer con teclado deja el foco en Pausar', async ({ page }) => {
    // React reutiliza el <button> de Leer como el de Pausar: hoy el foco no se pierde aquí.
    await abrir(page);
    await botonLeer(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Pausar lectura' })).toBeFocused();
  });

  test('HALLAZGO 3962 (03/11/2026, REPARADO) · Detener con teclado deja el foco en Leer', async ({ page }) => {
    // Al volver a «parado», React conserva el primer botón (Pausar → Leer) y DESMONTA Detener,
    // que era el que tenía el foco: caía a <body> y el usuario de teclado o lector de pantalla
    // volvía al principio del documento. Ahora el foco pasa al botón Leer.
    await abrir(page);
    await botonLeer(page).click();
    await page.getByRole('button', { name: 'Detener lectura' }).focus();
    await page.keyboard.press('Enter');
    await expect(botonLeer(page)).toBeVisible();
    await expect(botonLeer(page)).toBeFocused();
  });

  test('HALLAZGO 3965 (03/11/2026, REPARADO) · la barra de progreso tiene nombre accesible', async ({ page }) => {
    // El aria-label «Progreso: N%» estaba en el <div> contenedor (genérico, donde aria-label no
    // vale); ahora el role="progressbar" lleva su propio aria-label y el valor como texto.
    await abrir(page);
    await botonLeer(page).click();
    await expect(page.getByRole('progressbar', { name: /progreso/i })).toHaveCount(1);
    await expect(page.getByRole('group', { name: 'Controles de reproducción' })).toHaveCount(1);
  });

  test('HALLAZGO 3966 (03/11/2026, REPARADO) · solo la palabra que se lee se expone como «mark»', async ({
    page,
  }) => {
    // Cada palabra era un <mark>, que el árbol de accesibilidad publica con rol «mark»: con el
    // texto de ejemplo, 60 palabras resaltadas para el lector de pantalla. Ahora las demás son
    // <span> y solo la actual (con aria-current) es <mark>.
    await abrir(page);
    await botonLeer(page).click();
    await boundary(page, 0);
    // Primero que React haya pintado la palabra actual: la foto del árbol tomada justo tras el
    // evento podía llegar antes del render y contar 0 marcas (inestable en la suite del 09/11/2026,
    // cabo C0700). Y la cuenta, con reintento, por si el árbol tarda un fotograma más.
    await expect(resaltada(page)).toHaveText('La');
    const estado = page.getByRole('status').filter({ hasText: 'La lectura en voz alta' });
    await expect
      .poll(async () => (await estado.ariaSnapshot()).split('\n').filter((l) => /^\s*- mark\b/.test(l)).length)
      .toBe(1);
  });

  test('HALLAZGO 3964 (03/11/2026, REPARADO) · en pausa, velocidad, tono y voz quedan fijos', async ({
    page,
  }) => {
    // FAQ visible: los ajustes «están desactivados durante la reproducción». Lo estaban solo con
    // estado «reproduciendo»: en pausa se habilitaban, la etiqueta cambiaba a 1.5× y al Reanudar
    // la locución seguía con rate 1. Ahora también en pausa están deshabilitados.
    await abrir(page);
    await escribir(page, 'Hola mundo bonito');
    await botonLeer(page).click();
    await page.getByRole('button', { name: 'Pausar lectura' }).click();
    await expect(page.getByRole('button', { name: 'Reanudar lectura' })).toBeVisible();
    await expect(page.locator('#slider-velocidad')).toBeDisabled();
    await expect(page.locator('#slider-tono')).toBeDisabled();
    await expect(page.locator('#selector-voz')).toBeDisabled();
    await page.getByRole('button', { name: 'Detener lectura' }).click();
    await expect(page.locator('#slider-velocidad')).toBeEnabled();
  });

  test('HALLAZGO 3963 (03/11/2026, REPARADO) · el JSON-LD ya no promete «ajuste de tono y volumen»', async ({
    page,
  }) => {
    // La app tiene dos deslizadores, Velocidad y Tono; ninguna línea fija utt.volume.
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

  test('HALLAZGO 3967 (03/11/2026, REPARADO) · FAQPage y página recomiendan la misma velocidad para la dislexia, sin cifras sin fuente', async ({
    page,
  }) => {
    // FAQPage (solo la leen buscadores e IA) decía «Las personas con dislexia… entre el 60% y el
    // 80%», «130-160 palabras por minuto» y «sin perder comprensión significativa». Página,
    // paso 2: «Para personas con dislexia o mayores, empieza en 0,8× o 0,9×». Ahora la FAQPage
    // dice lo mismo que la página, y que 1× no equivale a un ritmo fijo.
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
    expect(dislexiaFaq60).toBe(false);
    expect(paginaDice09).toBe(true);
    expect(respuestas).toMatch(/dislexia[^.]*0,8× o 0,9×/);
    expect(respuestas).not.toMatch(/\d+\s*-\s*\d+ palabras por minuto|sin perder comprensión significativa/);
  });

  test('HALLAZGO 3968 (03/11/2026, REPARADO) · formato: «1,0×», «33 %», «1 palabra» y «35.999 caracteres»', async ({
    page,
  }) => {
    // Formato español (CLAUDE.md global §2): coma decimal, «33 %» con espacio, punto de miles
    // con cinco cifras (con cuatro no se agrupa); y el singular con una palabra.
    await abrir(page);
    await expect(page.locator('label[for="slider-velocidad"]')).toContainText('1,0×');
    await expect(page.locator('label[for="slider-tono"]')).toContainText('Tono: 1,0');
    await expect(page.locator('#slider-velocidad')).toHaveAttribute('aria-valuetext', '1,0 veces la velocidad normal');
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

test('HALLAZGO 3975 (03/11/2026, ABIERTO) · el porcentaje de la barra de progreso se ve en pantalla', async ({ page }) => {
  // Visto en /reparar al reparar el 3968: .progresoTexto va con top: 14px dentro de .progreso,
  // que mide 10 px y lleva overflow: hidden, así que «N %» queda entero bajo el recorte (a
  // 1280×800: caja de 340,9 a 350,9 px, texto de 354,9 a 374,1). Cuando se repare, este caso
  // pasará: se quita el test.fail() y se escribe REPARADO.
  test.fail();
  await abrir(page);
  await botonLeer(page).click();
  const medida = await page.locator('[class*="progresoTexto"]').evaluate((t) => {
    const texto = t.getBoundingClientRect();
    let visible = texto.height > 0;
    for (let a = t.parentElement; a && visible; a = a.parentElement) {
      if (getComputedStyle(a).overflow === 'visible') continue;
      const c = a.getBoundingClientRect();
      visible = texto.top >= c.top - 1 && texto.bottom <= c.bottom + 1;
    }
    return visible;
  });
  expect(medida).toBe(true);
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

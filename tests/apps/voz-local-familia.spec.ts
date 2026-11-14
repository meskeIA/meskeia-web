import { test, expect, type Page } from '@playwright/test';

/**
 * Testigo de familia: la síntesis de voz elige una voz LOCAL (cabo C0738, 14/11/2026).
 *
 * Clase del hallazgo 3959 (lector-texto-voz): tablero-comunicacion y components/TextToSpeech
 * tomaban la PRIMERA voz cuyo idioma empieza por «es», sin mirar `localService`; teclado-barrido-
 * switch y guia-respiracion solo fijaban `lang` y dejaban elegir al navegador. Donde la voz en
 * línea va delante (Chrome: «Google español»), el texto se sintetiza en un servidor: sale del
 * equipo y sin conexión no suena, aunque haya una voz española instalada.
 *
 * El doble: `getVoices()` devuelve la voz EN LÍNEA primero, luego una local española y una local
 * inglesa; `speak()` anota la voz que lleva el enunciado. Esperado en cada app: la local española.
 * Control: antes de lib/vozSintesis.ts, tablero y TextToSpeech decían «Google español» y teclado y
 * respiración no fijaban voz (null).
 *
 * Una fila por app: cómo se llega a que hable.
 */

interface Dicha {
  voz: string | null;
  lang: string;
}

/** Se serializa y corre en la página antes que la app: no puede usar nada de fuera. */
function instalarDoble(): void {
  const voces = [
    { name: 'Google español', lang: 'es-ES', localService: false, default: false, voiceURI: 'g-es' },
    { name: 'Microsoft Helena', lang: 'es-ES', localService: true, default: false, voiceURI: 'ms-helena' },
    { name: 'Microsoft Zira', lang: 'en-US', localService: true, default: true, voiceURI: 'ms-zira' },
  ];
  const dichas: Array<{ voz: string | null; lang: string }> = [];
  (window as unknown as { __dichas: typeof dichas }).__dichas = dichas;

  class LocucionFalsa {
    text: string;
    lang = '';
    voice: { name: string } | null = null;
    rate = 1;
    pitch = 1;
    volume = 1;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onboundary: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null as unknown,
    getVoices: () => voces,
    speak: (u: LocucionFalsa) => {
      dichas.push({ voz: u.voice ? u.voice.name : null, lang: u.lang });
    },
    cancel: () => undefined,
    pause: () => undefined,
    resume: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: LocucionFalsa, configurable: true });
}

async function dichas(page: Page): Promise<Dicha[]> {
  return page.evaluate(() => (window as unknown as { __dichas: Dicha[] }).__dichas);
}

interface Fila {
  app: string;
  ruta: string;
  /** Lo que hay que hacer para que la app hable. */
  hablar: (page: Page) => Promise<void>;
}

const FILAS: Fila[] = [
  {
    app: 'tablero-comunicacion',
    ruta: '/tablero-comunicacion/',
    hablar: async (page) => {
      await page.getByRole('button', { name: 'Agua', exact: true }).click();
    },
  },
  {
    app: 'teclado-barrido-switch',
    ruta: '/teclado-barrido-switch/',
    hablar: async (page) => {
      await page.getByRole('button', { name: 'Letra E' }).click();
      await page.getByRole('button', { name: 'Leer en voz alta', exact: true }).click();
    },
  },
  {
    app: 'guia-respiracion',
    ruta: '/guia-respiracion/',
    hablar: async (page) => {
      await page.getByRole('button', { name: /Voz guiada desactivada/ }).click();
      await page.getByRole('button', { name: 'Iniciar ejercicio de respiración' }).click();
    },
  },
  {
    app: 'TextToSpeech (guia-cuidado-mascota)',
    ruta: '/guia-cuidado-mascota/preparacion/antes-de-adoptar/',
    hablar: async (page) => {
      await page.getByRole('button', { name: 'Leer en voz alta' }).first().click();
    },
  },
];

for (const fila of FILAS) {
  test(`CABO C0738 · ${fila.app}: habla con la voz española LOCAL, no con la en línea que va primero`, async ({ page }) => {
    await page.addInitScript(instalarDoble);
    await page.goto(fila.ruta);
    await page.waitForLoadState('load');
    // El clic antes de hidratar no llega a React: se repite hasta que algo se diga.
    await expect(async () => {
      if ((await dichas(page)).length === 0) await fila.hablar(page);
      expect((await dichas(page)).length).toBeGreaterThan(0);
    }).toPass({ timeout: 15_000 });
    const lista = await dichas(page);
    for (const d of lista) {
      expect(d.voz, `${fila.app}: voz de «${d.lang}»`).toBe('Microsoft Helena');
      expect(d.lang).toMatch(/^es/);
    }
  });
}

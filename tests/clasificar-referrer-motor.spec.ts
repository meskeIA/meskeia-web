/**
 * Tests unitarios para `clasificarReferrer` (lib/clasificarReferrer.ts)
 *
 * Decide si una visita llega por IA (`referral-ia`), por red social
 * (`referral-social`) o por ninguna de las dos. Su defecto no rompía nada
 * visible: inflaba el canal social en casi un tercio y metía en el foso IA
 * visitas que llegaban desde el propio meskeia.com.
 *
 * Los casos de «no es un canal» son los REINYECTADOS del dump de Turso del
 * 17/10/2026 (acta del digest, P1): dominios reales que la regla antigua, que
 * buscaba el patrón en la URL entera, clasificaba mal. El último bloque
 * comprueba que la regla antigua falla en ellos: si un día dejara de fallar,
 * estos casos ya no probarían nada.
 *
 * Ejecutar con: npm run test:calc (o npx playwright test --config playwright.calc.config.ts tests/clasificar-referrer-motor.spec.ts)
 */

import { test, expect } from '@playwright/test';

import { clasificarReferrer } from '../lib/clasificarReferrer';

/** La regla anterior al 17/10/2026, copiada tal cual de AnalyticsTracker. */
function comoLoHaciaAntes(referrer: string): 'ia' | 'social' | null {
  if (/chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google|copilot\.microsoft\.com|you\.com|phind\.com|poe\.com/i.test(referrer)) return 'ia';
  if (/t\.co|x\.com|twitter\.com|instagram\.com|facebook\.com|linkedin\.com/i.test(referrer)) return 'social';
  return null;
}

/** Dominios del dump del 17/10/2026 que NO son ni IA ni red social. */
const NO_SON_CANAL = [
  'https://www.qwant.com/',
  'https://padlet.com/profe/clase-ciencias',
  'https://deliacienciasdelavida.blogspot.com/2026/10/entrada.html',
  'https://prialecomunica.blogspot.com/',
  'https://yandex.com/',
  'https://teams.microsoft.com/',
  'https://doc-0o-2o-apps-viewer.googleusercontent.com/viewer',
  'https://meskeia.com/generador-cartones-bingo/?utm_source=chatgpt.com',
  'https://meskeia.com/?from=t.co',
];

test.describe('clasificarReferrer — IA', () => {
  for (const [referrer, dominio] of [
    ['https://chatgpt.com/', 'chatgpt.com'],
    ['https://copilot.microsoft.com/chats/abc', 'copilot.microsoft.com'],
    ['https://gemini.google.com/app', 'gemini.google.com'],
    ['https://www.perplexity.ai/search?q=x', 'www.perplexity.ai'],
    ['https://claude.ai/', 'claude.ai'],
    ['https://poe.com/', 'poe.com'],
  ] as const) {
    test(`${dominio} es IA`, () => {
      expect(clasificarReferrer(referrer)).toEqual({ canal: 'ia', dominio });
    });
  }
});

test.describe('clasificarReferrer — red social', () => {
  for (const [referrer, dominio] of [
    ['https://t.co/AbCdEf', 't.co'],
    ['https://l.instagram.com/?u=https%3A%2F%2Fmeskeia.com', 'l.instagram.com'],
    ['https://www.facebook.com/', 'www.facebook.com'],
    ['https://m.facebook.com/', 'm.facebook.com'],
    ['https://l.facebook.com/l.php', 'l.facebook.com'],
    ['https://x.com/usuario/status/1', 'x.com'],
    ['https://www.linkedin.com/feed/', 'www.linkedin.com'],
  ] as const) {
    test(`${dominio} es red social`, () => {
      expect(clasificarReferrer(referrer)).toEqual({ canal: 'social', dominio });
    });
  }
});

test.describe('clasificarReferrer — ni IA ni red social', () => {
  for (const referrer of NO_SON_CANAL) {
    test(`${referrer} no es un canal`, () => {
      expect(clasificarReferrer(referrer)).toEqual({ canal: null, dominio: null });
    });
  }

  // cronicum.com salió en el dump como `referral-social`, pero el dump solo guarda el
  // dominio: la URL que lo provocó no se conoce, así que no se reinyecta en el bloque final.
  test('los dominios propios nunca son un canal', () => {
    for (const host of ['meskeia.com', 'www.meskeia.com', 'cronicum.com', 'stemum.com', 'delegum.com', 'coquinum.com']) {
      expect(clasificarReferrer(`https://${host}/x/?utm_source=chatgpt.com&from=t.co`)).toEqual({ canal: null, dominio: null });
    }
  });

  test('sin referrer o con uno que no es una URL', () => {
    expect(clasificarReferrer('')).toEqual({ canal: null, dominio: null });
    expect(clasificarReferrer('no es una url')).toEqual({ canal: null, dominio: null });
  });

  test('un dominio que solo EMPIEZA como uno de la lista no cuenta', () => {
    expect(clasificarReferrer('https://t.co.example.org/').canal).toBeNull();
    expect(clasificarReferrer('https://notchatgpt.com/').canal).toBeNull();
  });
});

// Cabo C0282 (18/10/2026): ChatGPT marca sus enlaces con ?utm_source=chatgpt.com, y una visita
// suya sin Referer entraba como `web`. Sin referrer, el utm_source de la URL decide; con
// referrer, no se mira (en navegación interna la URL propia puede arrastrar la etiqueta).
test.describe('clasificarReferrer — sin referrer, el utm_source', () => {
  test('sin referrer y utm_source=chatgpt.com es IA (antes, web sin rastro)', () => {
    expect(clasificarReferrer('', 'chatgpt.com')).toEqual({ canal: 'ia', dominio: 'chatgpt.com' });
    expect(clasificarReferrer('')).toEqual({ canal: null, dominio: null });
  });

  test('se compara como dominio: mayúsculas, espacios y subdominios', () => {
    expect(clasificarReferrer('', ' ChatGPT.com ')).toEqual({ canal: 'ia', dominio: 'chatgpt.com' });
    expect(clasificarReferrer('', 'www.perplexity.ai')).toEqual({ canal: 'ia', dominio: 'www.perplexity.ai' });
    expect(clasificarReferrer('', 'notchatgpt.com').canal).toBeNull();
    expect(clasificarReferrer('', 'chatgpt').canal).toBeNull();
  });

  test('un utm_source que no es de IA no da canal (tampoco social: solo la lista de IA)', () => {
    for (const utm of ['newsletter', 'facebook.com', 't.co', 'google']) {
      expect(clasificarReferrer('', utm)).toEqual({ canal: null, dominio: null });
    }
  });

  test('con referrer manda el referrer, aunque la URL traiga utm_source de IA', () => {
    expect(clasificarReferrer('https://meskeia.com/otra-app/', 'chatgpt.com')).toEqual({ canal: null, dominio: null });
    expect(clasificarReferrer('https://www.bing.com/', 'chatgpt.com')).toEqual({ canal: null, dominio: null });
    expect(clasificarReferrer('https://gemini.google.com/app', 'chatgpt.com')).toEqual({ canal: 'ia', dominio: 'gemini.google.com' });
  });
});

test.describe('la regla antigua fallaba en los casos reinyectados', () => {
  for (const referrer of NO_SON_CANAL) {
    test(`antes: ${referrer} contaba como canal`, () => {
      expect(comoLoHaciaAntes(referrer)).not.toBeNull();
    });
  }
});

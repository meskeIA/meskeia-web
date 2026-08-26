/**
 * Tests del banco de `quiz-tabla-periodica` — sin navegador.
 *
 * Salen de la reparación de los hallazgos 363-368 del Inspector (26/08/2026). Dos de ellos
 * NO se pueden vigilar desde un test de navegador, porque exigen contar sobre el banco
 * entero y la partida solo enseña diez preguntas sorteadas:
 *
 *   · el 367 — la app prometía «40+ preguntas» en el hero, la metadata, OpenGraph y el
 *     JSON-LD cuando había exactamente 40, mientras su propia tarjeta de inicio decía la
 *     verdad tres líneas más abajo;
 *   · el sesgo de posición de la respuesta correcta, que en el quiz de literatura de la
 *     ronda anterior llegó a permitir sacar un 52 % respondiendo siempre «D».
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts
 */

import { test, expect } from '@playwright/test';

import { BANCO_PREGUNTAS, TOTAL_BANCO } from '../app/quiz-tabla-periodica/preguntas';

test.describe('integridad del banco', () => {
  test('la cifra que la app promete se DERIVA del banco', () => {
    expect(TOTAL_BANCO).toBe(BANCO_PREGUNTAS.length);
    expect(TOTAL_BANCO).toBeGreaterThanOrEqual(40);
  });

  test('cada pregunta tiene 4 opciones y una correcta dentro de rango', () => {
    const malas = BANCO_PREGUNTAS.filter(
      p => p.opciones.length !== 4 || p.correcta < 0 || p.correcta >= p.opciones.length,
    ).map(p => p.id);
    expect(malas).toEqual([]);
  });

  test('ninguna pregunta repite una opción ni deja una vacía', () => {
    const malas = BANCO_PREGUNTAS.filter(
      p => new Set(p.opciones).size !== p.opciones.length || p.opciones.some(o => !o.trim()),
    ).map(p => p.id);
    expect(malas).toEqual([]);
  });

  test('los ids no se repiten y todas tienen explicación', () => {
    expect(new Set(BANCO_PREGUNTAS.map(p => p.id)).size).toBe(BANCO_PREGUNTAS.length);
    const sinExplicar = BANCO_PREGUNTAS.filter(p => p.explicacion.trim().length < 30).map(p => p.id);
    expect(sinExplicar).toEqual([]);
  });
});

test.describe('sesgo de posición de la respuesta correcta', () => {
  test('ninguna posición concentra más de la mitad de las respuestas', () => {
    // Si una letra acumulase la mayoría, se aprobaría el quiz sin saber química: es lo que
    // pasó en `quiz-literatura-universal` (0 correctas en A y 24 en D, un 52 % gratis).
    const reparto = [0, 0, 0, 0];
    for (const p of BANCO_PREGUNTAS) reparto[p.correcta]++;
    const mayor = Math.max(...reparto);
    expect(mayor / BANCO_PREGUNTAS.length, `reparto ${reparto.join('/')}`).toBeLessThan(0.5);
  });

  test('las cuatro posiciones se usan al menos una vez', () => {
    const reparto = [0, 0, 0, 0];
    for (const p of BANCO_PREGUNTAS) reparto[p.correcta]++;
    expect(reparto.filter(n => n === 0), `reparto ${reparto.join('/')}`).toEqual([]);
  });
});

test.describe('cobertura por categorías', () => {
  test('las cinco categorías del selector tienen preguntas', () => {
    const categorias = ['numero-atomico', 'grupo-periodo', 'propiedades', 'familia', 'curiosidad'] as const;
    const vacias = categorias.filter(c => !BANCO_PREGUNTAS.some(p => p.categoria === c));
    expect(vacias).toEqual([]);
  });

  test('hay banco de sobra para que dos partidas no sean la misma', () => {
    // La app sortea 10 de las 40: con menos de 20 el solapamiento sería la norma y la FAQ
    // que promete preguntas distintas entre intentos dejaría de ser cierta.
    expect(TOTAL_BANCO).toBeGreaterThanOrEqual(20);
  });
});

test.describe('datos que el Inspector encontró mal', () => {
  test('REGRESIÓN 363: el récord de ebullición es del Renio, y la fuente se nombra', () => {
    // CRC Handbook: renio 5.596 °C, wolframio 5.555 °C. La app marcaba el Wolframio y
    // trataba «Renio» como fallo, mientras su propia explicación citaba el 5.555 °C —el
    // valor que ESA fuente da al W— para sostener el superlativo contrario.
    const p = BANCO_PREGUNTAS.find(q => q.pregunta.includes('mayor punto de ebullición'));
    expect(p, 'la pregunta del punto de ebullición').toBeDefined();
    expect(p!.opciones[p!.correcta]).toBe('Renio');
    // Las fuentes discrepan en el wolframio (5.555 frente a 5.930 °C), así que el enunciado
    // dice de cuál habla: sin eso, la pregunta no tiene una respuesta única.
    expect(p!.pregunta).toContain('CRC Handbook');
    expect(p!.explicacion).toContain('5.596');
  });

  test('el récord de FUSIÓN sigue siendo del Wolframio, que ese no se discute', () => {
    const p = BANCO_PREGUNTAS.find(q => q.pregunta.includes('punto de fusión'));
    if (p) expect(p.opciones[p.correcta]).toMatch(/Wolframio|Tungsteno/);
  });

  test('ninguna explicación se contradice citando la respuesta que descarta', () => {
    // La forma del hallazgo 363: la explicación daba como prueba un dato que sostenía la
    // opción marcada como incorrecta. Aquí se comprueba lo comprobable por la forma: que la
    // explicación mencione la opción correcta.
    const mudas = BANCO_PREGUNTAS.filter(p => {
      const correcta = p.opciones[p.correcta];
      // El nombre puede aparecer entre paréntesis o con su símbolo: basta la primera palabra.
      const clave = correcta.split(/[\s(]/)[0];
      return clave.length > 3 && !p.explicacion.includes(clave);
    }).map(p => `${p.id}: ${p.opciones[p.correcta]}`);
    expect(mudas).toEqual([]);
  });
});

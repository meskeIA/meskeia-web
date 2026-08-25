/**
 * Tests del BANCO del quiz de literatura universal — `app/quiz-literatura-universal/preguntas.ts`
 *
 * Por qué existen, y por qué van aparte del spec de navegador:
 *
 * El hallazgo 300 del Inspector no se puede ver jugando una partida. La respuesta correcta
 * estaba 0 veces en A, 3 en B, 19 en C y 24 en D, y las opciones no se barajaban al pintarlas:
 * responder siempre «D» sacaba 24/46 (52 %) sin saber nada de literatura —63 % en Medio, o
 * sea «Bien»— y responder siempre «A» sacaba cero garantizado. Eso solo se detecta CONTANDO
 * sobre el banco entero, y para contarlo hay que poder importarlo.
 *
 * Y el 298 y el 299 son de la misma familia: el nivel Avanzado prometía 15 preguntas y tenía
 * 13, y la metadata anunciaba 50 cuando había 46. Los tres son invariantes del banco, no
 * comportamientos de la interfaz, así que van aquí y no en un test de navegador.
 */

import { test, expect } from '@playwright/test';
import { POOL, TOTAL_PREGUNTAS, preguntasDeNivel, type Nivel } from '../app/quiz-literatura-universal/preguntas';

const NIVELES: Nivel[] = ['basico', 'medio', 'avanzado'];

/** La partida más larga que la app ofrece. Debe estar sincronizada con page.tsx. */
const PREGUNTAS_POR_PARTIDA = 15;

test.describe('Integridad del banco', () => {
  test('los identificadores no se repiten', () => {
    const ids = POOL.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('cada pregunta tiene 4 opciones y una correcta dentro de rango', () => {
    for (const p of POOL) {
      expect(p.opciones, `${p.id}: número de opciones`).toHaveLength(4);
      expect(p.correcta, `${p.id}: índice de la correcta`).toBeGreaterThanOrEqual(0);
      expect(p.correcta, `${p.id}: índice de la correcta`).toBeLessThan(p.opciones.length);
    }
  });

  test('ninguna pregunta repite una opción', () => {
    for (const p of POOL) {
      expect(new Set(p.opciones).size, `${p.id}: opciones duplicadas`).toBe(4);
    }
  });

  test('toda pregunta lleva explicación', () => {
    for (const p of POOL) {
      expect(p.explicacion.length, `${p.id}: sin explicación`).toBeGreaterThan(20);
    }
  });

  test('TOTAL_PREGUNTAS es el tamaño real del banco', () => {
    // Es la cifra que la metadata y el faqJsonLd publican. Si deja de cuadrar, la app vuelve
    // a prometer preguntas que no tiene.
    expect(TOTAL_PREGUNTAS).toBe(POOL.length);
  });
});

test.describe('HALLAZGO 298 — la partida no puede prometer más preguntas de las que hay', () => {
  test('cada nivel tiene al menos las preguntas de una partida completa', () => {
    for (const nivel of NIVELES) {
      expect(
        preguntasDeNivel(nivel).length,
        `el nivel ${nivel} no llega a ${PREGUNTAS_POR_PARTIDA} preguntas`,
      ).toBeGreaterThanOrEqual(PREGUNTAS_POR_PARTIDA);
    }
  });

  test('y con margen suficiente para que dos partidas seguidas no sean idénticas', () => {
    // Con exactamente 15 de 15, `slice(0, 15)` devuelve el nivel ENTERO y la FAQ de la app
    // («con varios intentos verás preguntas diferentes») no puede cumplirse nunca. El margen
    // no garantiza partidas distintas, pero sin él son imposibles.
    for (const nivel of NIVELES) {
      expect(
        preguntasDeNivel(nivel).length,
        `el nivel ${nivel} no tiene margen sobre el tamaño de partida`,
      ).toBeGreaterThan(PREGUNTAS_POR_PARTIDA);
    }
  });
});

test.describe('HALLAZGO 300 — el banco no puede resolverse por la posición', () => {
  test('ninguna posición concentra más de la mitad de las respuestas correctas', () => {
    const reparto = [0, 0, 0, 0];
    for (const p of POOL) reparto[p.correcta]++;

    const detalle = reparto.map((n, i) => `${String.fromCharCode(65 + i)}=${n}`).join(' ');
    for (let i = 0; i < 4; i++) {
      expect(reparto[i], `posición ${String.fromCharCode(65 + i)} (${detalle})`)
        .toBeLessThanOrEqual(Math.ceil(POOL.length / 2));
    }
  });

  test('ninguna posición se queda a cero', () => {
    // Responder siempre «A» sacaba CERO garantizado en cualquier nivel, que es tan
    // informativo para quien quiera hacer trampas como el 52 % de la «D».
    const reparto = [0, 0, 0, 0];
    for (const p of POOL) reparto[p.correcta]++;
    for (let i = 0; i < 4; i++) {
      expect(reparto[i], `posición ${String.fromCharCode(65 + i)} sin ninguna correcta`).toBeGreaterThan(0);
    }
  });

  test('lo mismo dentro de cada nivel, que es como se juega de verdad', () => {
    // El reparto global puede parecer sano y estar sesgado nivel a nivel: en Avanzado la
    // correcta estaba en A=0 B=1 C=4 D=8, y una partida es de UN nivel.
    for (const nivel of NIVELES) {
      const preguntas = preguntasDeNivel(nivel);
      const reparto = [0, 0, 0, 0];
      for (const p of preguntas) reparto[p.correcta]++;
      const detalle = reparto.map((n, i) => `${String.fromCharCode(65 + i)}=${n}`).join(' ');

      for (let i = 0; i < 4; i++) {
        expect(reparto[i], `${nivel}: posición ${String.fromCharCode(65 + i)} (${detalle})`)
          .toBeLessThanOrEqual(Math.ceil(preguntas.length * 0.55));
      }
    }
  });
});

test.describe('HALLAZGO 309 — un quiz de literatura UNIVERSAL', () => {
  test('hay preguntas de literatura no occidental', () => {
    // Antes: 0 preguntas de Asia y Oriente Medio en 46, y una sola africana, mientras la FAQ
    // lo describía como que esas tradiciones «tienen menor representación».
    const marcadores = [
      /Murasaki|Genji/i,               // Japón clásico
      /Bash[oō]|haiku/i,               // poética japonesa
      /mil y una noches/i,             // literatura árabe clásica
      /Mahfuz/i,                       // literatura árabe contemporánea
      /Tagore/i,                       // India
      /Cao Xueqin|pabell[oó]n rojo/i,  // China clásica
      /Mo Yan/i,                       // China contemporánea
      /Rumi/i,                         // Persia
      /Han Kang/i,                     // Corea
      /Achebe/i,                       // África
    ];
    const texto = POOL.map(p => `${p.pregunta} ${p.opciones.join(' ')} ${p.explicacion}`).join(' | ');
    for (const marcador of marcadores) {
      expect(texto, `sin rastro de ${marcador}`).toMatch(marcador);
    }
  });
});

test.describe('HALLAZGOS 301, 302, 306, 307 y 308 — lo que las explicaciones afirmaban', () => {
  const pregunta = (id: string) => {
    const p = POOL.find(x => x.id === id);
    if (!p) throw new Error(`la pregunta ${id} ya no existe en el banco`);
    return p;
  };

  test('301 · Holmes no se presenta como el primer detective de la ficción', () => {
    const b05 = pregunta('b05');
    expect(b05.explicacion).not.toMatch(/primer detective moderno de la ficci[oó]n/i);
    // Poe figura como distractor en esa misma pregunta: la explicación no puede desmentir a
    // quien dudó por el motivo correcto.
    expect(b05.opciones).toContain('Edgar Allan Poe');
    expect(b05.explicacion).toMatch(/Dupin/);
  });

  test('302 · ninguna pregunta descansa en un «trío del realismo mágico»', () => {
    const texto = POOL.map(p => p.pregunta).join(' | ');
    expect(texto).not.toMatch(/tr[ií]o del realismo m[aá]gico/i);
  });

  test('306 · las preguntas por el autor van en la categoría «autores»', () => {
    for (const id of ['b01', 'b03', 'b08', 'b10']) {
      expect(pregunta(id).categoria, `${id}`).toBe('autores');
    }
    // Y la que pregunta por un personaje, no.
    expect(pregunta('m15').categoria).toBe('obras');
  });

  test('307 · a10 pide una categoría, no una persona', () => {
    const a10 = pregunta('a10');
    expect(a10.pregunta).not.toMatch(/narradora propuso/i);
    expect(a10.pregunta).toMatch(/categor[ií]a/i);
    expect(a10.opciones[a10.correcta]).toBe('Focalización');
  });

  test('308 · las tres fechas y atribuciones corregidas', () => {
    expect(pregunta('m11').explicacion).toMatch(/1875/);         // Ana Karenina se serializó desde 1875
    expect(pregunta('a09').explicacion).toMatch(/infrarrealismo/); // no el estridentismo
    expect(pregunta('a01').explicacion).toMatch(/1963/);          // el título de 1929 era otro
  });
});

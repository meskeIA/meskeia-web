/**
 * Tests del motor del buscador de emojis por intención (lib/calculadoras/buscadorEmojis.ts) y de
 * la integridad de su diccionario (app/buscador-emojis/intenciones.ts).
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/buscador-emojis-motor.spec.ts
 *
 * Casos resueltos a mano con un diccionario de 6 intenciones (N = 6, peso = ln(N/df) + 1):
 *
 *   «estoy feliz» → palabras [estoy, feliz]. «estoy» está en 2 intenciones (peso ln 3 + 1 = 2,0986)
 *   y «feliz» en 1 (ln 6 + 1 = 2,7918). FELIZ cubre las dos (1) y su frase es idéntica (+3) = 4.
 *   CANSADO solo cubre «estoy»: 2,0986 / 4,8904 = 0,429 < 0,5, y ninguna frase suya contiene la
 *   consulta ni está dentro de ella → fuera. Resultado: solo FELIZ.
 *
 *   «lo siento» → «lo» es palabra vacía; queda [siento], raíz «sient», en PERDON y PESAME.
 *   PERDON: cobertura 1 + frase idéntica 3 = 4. PESAME: 1 + «lo siento mucho» contiene la
 *   consulta 2 = 3. Orden: PERDON, PESAME.
 *
 *   «me alegro muchísimo por tu ascenso» → [alegro, muchisimo, ascenso]. La raíz de «muchisimo»
 *   es «muchi» (no «mucho»: son sus 5 primeras letras) y no está en el diccionario; «ascenso»
 *   tampoco. Solo cuenta «alegr»: ALEGRIA cobertura 1 + «me alegro» dentro de la consulta 1 = 2.
 *   PESAME, pese a «lo siento mucho», no sale.
 *
 *   «agra» (escribiendo, sin espacio final) → prefijo de «agrad» → GRACIAS. «agra » (con espacio)
 *   ya no es prefijo y «agra» no es raíz de nada → [].
 */

import { test, expect } from '@playwright/test';
import {
  buscarIntenciones,
  buscarPorEmoji,
  claveEmoji,
  extraerEmojis,
  indexar,
  normalizar,
  raiz,
  type Intencion,
} from '../lib/calculadoras/buscadorEmojis';
import { AVISOS, DESTACADAS, GRUPOS, INTENCIONES } from '../app/buscador-emojis/intenciones';

function mini(id: string, frases: string, emojis: string[] = ['😊', '😄', '🙂'], cuidado: string[] = []): Intencion {
  const lista = frases.split('|');
  return {
    id,
    grupo: 'prueba',
    titulo: lista[0],
    frases: lista,
    emojis: emojis.map((e) => [e, 'nota'] as const),
    cuidado: cuidado.map((e) => [e, 'motivo'] as const),
  };
}

const DICCIONARIO = [
  mini('alegria', 'me alegro|que bien|genial'),
  mini('perdon', 'lo siento|perdon|disculpa', ['😔', '🙏', '😞'], ['😅']),
  mini('pesame', 'pesame|lo siento mucho|condolencias', ['🕊️', '🤍', '🙏'], ['😭']),
  mini('cansado', 'estoy cansado|agotado'),
  mini('feliz', 'estoy feliz|contento'),
  mini('gracias', 'gracias|agradecido', ['🙏', '❤️', '😊']),
];
const INDICE = indexar(DICCIONARIO);
const ids = (consulta: string) => buscarIntenciones(consulta, INDICE).map((r) => r.intencion.id);

test.describe('Normalización', () => {
  test('minúsculas, sin tildes ni signos', () => {
    expect(normalizar('¡¡Qué BIEN!!')).toBe('que bien');
    expect(normalizar('Pésame')).toBe('pesame');
    expect(normalizar('  te   extraño ')).toBe('te extrano');
  });
  test('las letras repetidas tres o más veces se quedan en una; dos se respetan', () => {
    expect(normalizar('Graciaaaas')).toBe('gracias');
    expect(normalizar('holaaa')).toBe('hola');
    expect(normalizar('llorar')).toBe('llorar');
  });
  test('los emojis no cuentan como texto', () => {
    expect(normalizar('Me alegro 😊')).toBe('me alegro');
  });
  test('raíz: 5 letras, o la palabra entera si es más corta', () => {
    expect(raiz('alegro')).toBe('alegr');
    expect(raiz('alegria')).toBe('alegr');
    expect(raiz('no')).toBe('no');
    expect(raiz('vale')).toBe('vale');
  });
});

test.describe('Búsqueda (casos a mano de la cabecera)', () => {
  test('«estoy feliz»: la palabra común no arrastra a «estoy cansado»', () => {
    const r = buscarIntenciones('estoy feliz', INDICE);
    expect(r.map((x) => x.intencion.id)).toEqual(['feliz']);
    expect(r[0].puntuacion).toBeCloseTo(4, 6);
  });
  test('«lo siento»: primero la disculpa, después el pésame', () => {
    const r = buscarIntenciones('lo siento', INDICE);
    expect(r.map((x) => x.intencion.id)).toEqual(['perdon', 'pesame']);
    expect(r[0].puntuacion).toBeCloseTo(4, 6);
    expect(r[1].puntuacion).toBeCloseTo(3, 6);
  });
  test('una frase larga con palabras desconocidas encuentra la intención', () => {
    const r = buscarIntenciones('Me alegro muchísimo por tu ascenso', INDICE);
    expect(r.map((x) => x.intencion.id)).toEqual(['alegria']);
    expect(r[0].puntuacion).toBeCloseTo(2, 6);
  });
  test('la última palabra cuenta como prefijo solo mientras se escribe', () => {
    expect(ids('agra')).toEqual(['gracias']);
    expect(ids('agra ')).toEqual([]);
  });
  test('«graciaaas!!» se lee como «gracias»', () => {
    expect(ids('graciaaas!!')[0]).toBe('gracias');
  });
  test('vacía, solo palabras vacías o desconocida → nada', () => {
    expect(ids('')).toEqual([]);
    expect(ids('   ')).toEqual([]);
    expect(ids('me')).toEqual([]);
    expect(ids('xyzzy')).toEqual([]);
  });
});

test.describe('Emojis pegados en el buscador', () => {
  test('extrae grafemas completos: tono de piel, ❤️ y familias', () => {
    expect(extraerEmojis('Hola 👍🏽 y ❤️ 👨‍👩‍👧 adiós')).toEqual(['👍🏽', '❤️', '👨‍👩‍👧']);
    expect(extraerEmojis('sin emojis')).toEqual([]);
  });
  test('❤️ y ❤ son el mismo emoji', () => {
    expect(claveEmoji('❤️')).toBe(claveEmoji('❤'));
  });
  test('dónde se recomienda y dónde se desaconseja', () => {
    const r = buscarPorEmoji('🙏', DICCIONARIO, []);
    expect(r.recomendado.map((i) => i.id)).toEqual(['perdon', 'pesame', 'gracias']);
    expect(r.desaconsejado).toEqual([]);
    expect(r.aviso).toBeNull();
    expect(buscarPorEmoji('😅', DICCIONARIO, []).desaconsejado.map((i) => i.id)).toEqual(['perdon']);
    expect(buscarPorEmoji('❤', DICCIONARIO, []).recomendado.map((i) => i.id)).toEqual(['gracias']);
  });
});

test.describe('Integridad del diccionario', () => {
  test('entre 150 y 200 intenciones, con id único', () => {
    expect(INTENCIONES.length).toBeGreaterThanOrEqual(150);
    expect(INTENCIONES.length).toBeLessThanOrEqual(200);
    expect(new Set(INTENCIONES.map((i) => i.id)).size).toBe(INTENCIONES.length);
  });
  test('cada intención está en un grupo que existe, y todos los grupos se usan', () => {
    const grupos = new Set(GRUPOS.map((g) => g.id));
    for (const i of INTENCIONES) expect(grupos.has(i.grupo), i.id).toBe(true);
    for (const g of GRUPOS) expect(INTENCIONES.some((i) => i.grupo === g.id), g.id).toBe(true);
  });
  test('de 3 a 6 emojis recomendados, sin repetir, y ninguno también en «cuidado»', () => {
    for (const i of INTENCIONES) {
      expect(i.emojis.length, i.id).toBeGreaterThanOrEqual(3);
      expect(i.emojis.length, i.id).toBeLessThanOrEqual(6);
      const claves = i.emojis.map(([e]) => claveEmoji(e));
      expect(new Set(claves).size, i.id).toBe(claves.length);
      for (const [e] of i.cuidado) expect(claves.includes(claveEmoji(e)), `${i.id} ${e}`).toBe(false);
    }
  });
  test('cada «emoji» es de 1 a 3 grafemas, todos emoji, con su nota', () => {
    const todos = [
      ...INTENCIONES.flatMap((i) => [...i.emojis, ...i.cuidado]),
      ...AVISOS.map((a) => [a.emoji, a.lecturas] as const),
    ];
    for (const [e, nota] of todos) {
      const grafemas = extraerEmojis(e);
      expect(grafemas.join(''), e).toBe(e);
      expect(grafemas.length, e).toBeGreaterThanOrEqual(1);
      expect(grafemas.length, e).toBeLessThanOrEqual(3);
      expect(nota.trim().length, e).toBeGreaterThan(0);
    }
  });
  test('ninguna frase vacía ni repetida dentro de su intención', () => {
    for (const i of INTENCIONES) {
      const frases = i.frases.map(normalizar);
      for (const f of frases) expect(f.length, i.id).toBeGreaterThan(0);
      expect(new Set(frases).size, `${i.id}: ${frases.join(' | ')}`).toBe(frases.length);
    }
  });
  test('avisos: un emoji por aviso, con nombre y lecturas terminadas en punto', () => {
    const claves = AVISOS.map((a) => claveEmoji(a.emoji));
    expect(new Set(claves).size).toBe(claves.length);
    for (const a of AVISOS) {
      expect(a.nombre.length, a.emoji).toBeGreaterThan(0);
      expect(a.lecturas.endsWith('.'), a.emoji).toBe(true);
    }
  });
  test('las destacadas existen', () => {
    for (const id of DESTACADAS) expect(INTENCIONES.some((i) => i.id === id), id).toBe(true);
  });
});

test.describe('Búsquedas reales (las que Win + . no encuentra)', () => {
  const indice = indexar(INTENCIONES);
  const primera = (q: string) => buscarIntenciones(q, indice)[0]?.intencion.id;
  const top = (q: string, n: number) => buscarIntenciones(q, indice).slice(0, n).map((r) => r.intencion.id);

  test('«me alegro» y «qué bien» → Me alegro por ti', () => {
    expect(primera('me alegro')).toBe('me-alegro');
    expect(primera('qué bien')).toBe('me-alegro');
  });
  test('«lo siento» → primero la disculpa y, entre las tres primeras, el pésame', () => {
    expect(primera('lo siento')).toBe('lo-siento');
    expect(top('lo siento', 3)).toContain('pesame');
  });
  test('una frase de cada grupo cae en su intención', () => {
    const casos: Record<string, string> = {
      'pésame': 'pesame',
      'DEP': 'pesame',
      'feliz cumple': 'cumpleanos',
      'te extraño': 'te-echo-de-menos',
      'ánimo': 'animo',
      'gracias': 'gracias',
      'graciaaas': 'gracias',
      'enhorabuena': 'felicidades',
      'no': 'no',
      'sí, claro': 'si',
      'jajaja': 'risa',
      'qué vergüenza': 'verguenza',
      'estoy harto': 'harto',
      'buenas noches': 'buenas-noches',
      'que te mejores': 'que-te-mejores',
      'feliz navidad': 'navidad',
      'buen trabajo': 'buen-trabajo',
      'me alegro mucho por tu ascenso': 'me-alegro',
    };
    for (const [q, id] of Object.entries(casos)) expect(primera(q), q).toBe(id);
  });
  test('«me da pena»: vergüenza en buena parte de Latinoamérica, tristeza en España', () => {
    expect(top('me da pena', 2).sort()).toEqual(['triste', 'verguenza']);
  });
  test('🙂 pegado: tiene aviso, se recomienda en lo formal y se desaconseja al alegrarse', () => {
    const r = buscarPorEmoji('🙂', INTENCIONES, AVISOS);
    expect(r.aviso?.nombre).toBe('Cara sonriente leve');
    expect(r.recomendado.map((i) => i.id)).toContain('saludo-formal');
    expect(r.desaconsejado.map((i) => i.id)).toEqual(expect.arrayContaining(['me-alegro', 'hola']));
  });
});

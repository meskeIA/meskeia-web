import { test, expect } from '@playwright/test';
import {
  EJERCICIOS, TOTAL_EJERCICIOS, corregir, explicacion, normalizar, interpretar, fraseCompleta,
  formaCorrecta, leerSeleccion, ejercicioPorNumero, ejerciciosDe, rangoDe, type Ejercicio, type Preposicion,
} from '../app/preposiciones-ingles/motor';

/**
 * Motor de preposiciones-ingles, con casos resueltos A MANO antes de escribir la vista.
 *
 * El CANON escribe, ejercicio a ejercicio, la frase y las preposiciones que se dan por buenas tal
 * como las dan Cambridge Grammar (English Grammar Today, «at, in and on») y Oxford Learner's
 * Dictionaries. No sale del motor: si el banco cambia una respuesta o corre un número, este
 * fichero lo para, porque un profesor puede tener asignado «el ejercicio 12».
 */
const CANON: Record<number, [string, Preposicion[]]> = {
  1: ["The film starts ___ 8 o'clock.", ['at']],
  2: ['The train leaves ___ half past six.', ['at']],
  3: ['I usually go to bed ___ midnight.', ['at']],
  4: ['Owls hunt ___ night.', ['at']],
  5: ['The shop closes ___ noon.', ['at']],
  6: ["I'll see you ___ lunchtime.", ['at']],
  7: ['What are you doing ___ the weekend?', ['at', 'on']],
  8: ['The concert is ___ Friday.', ['on']],
  9: ['We met ___ my birthday.', ['on']],
  10: ['Classes start ___ 2 September.', ['on']],
  11: ['Many shops are closed ___ Christmas Day.', ['on']],
  12: ['We have an exam ___ Monday morning.', ['on']],
  13: ['I go jogging ___ the morning.', ['in']],
  14: ['We play tennis ___ the afternoon.', ['in']],
  15: ['She was born ___ 2010.', ['in']],
  16: ["My sister's wedding is ___ June.", ['in']],
  17: ['We go to the beach ___ summer.', ['in']],
  18: ['The internet became popular ___ the 1990s.', ['in']],
  19: ['Tenochtitlan was founded ___ the 14th century.', ['in']],
  20: ['The bus will be here ___ ten minutes.', ['in']],
  21: ['Wait for me ___ the bus stop.', ['at']],
  22: ['Turn left ___ the traffic lights.', ['at']],
  23: ['I left my phone ___ home.', ['at']],
  24: ['My parents are ___ work right now.', ['at']],
  25: ['We met ___ a party.', ['at']],
  26: ['They live ___ 42 Elm Street.', ['at']],
  27: ['I put the toys back ___ the box and closed the lid.', ['in']],
  28: ["There's some cold milk ___ the fridge.", ['in']],
  29: ['Dad is cooking ___ the kitchen.', ['in']],
  30: ['My cousin lives ___ Peru.', ['in']],
  31: ['She grew up ___ a small town.', ['in']],
  32: ["There's a beautiful painting ___ the wall.", ['on']],
  33: ['Your glasses are ___ the table.', ['on']],
  34: ['I always read ___ the train.', ['on']],
  35: ['There were 200 people ___ the plane.', ['on']],
  36: ['She left her umbrella ___ the taxi.', ['in']],
  37: ['Our office is ___ the third floor.', ['on']],
  38: ['The children were playing ___ the street.', ['in', 'on']],
  39: ['The bank is ___ Main Street.', ['in', 'on']],
  40: ['The bathroom is ___ the left.', ['on']],
  41: ['I saw the news ___ TV.', ['on']],
  42: ["I'll call you ___ next week.", ['ninguna']],
  43: ['We went to the cinema ___ last Friday.', ['ninguna']],
  44: ['I go to the gym ___ every day.', ['ninguna']],
  45: ['I saw him ___ this morning.', ['ninguna']],
  46: ["Let's go to the beach ___ tomorrow.", ['ninguna']],
  47: ['What are you doing ___ tonight?', ['ninguna']],
  48: ['My grandparents visit us ___ every summer.', ['ninguna']],
  49: ['We moved here ___ last year.', ['ninguna']],
  50: ["It's late. Let's go ___ home.", ['ninguna']],
};

const TODAS: Preposicion[] = ['in', 'on', 'at', 'ninguna'];
/** Cómo se escribe cada respuesta en el modo elegir y en el corrector. */
const ESCRITA: Record<Preposicion, string> = { in: 'in', on: 'on', at: 'at', ninguna: '—' };

const ej = (n: number): Ejercicio => {
  const e = ejercicioPorNumero(n);
  if (!e) throw new Error(`no existe el ejercicio ${n}`);
  return e;
};

test.describe('Banco de ejercicios', () => {
  test('los números van del 1 al N, sin huecos ni repetidos, y en orden', () => {
    expect(EJERCICIOS.map((e) => e.numero)).toEqual(Array.from({ length: TOTAL_EJERCICIOS }, (_, i) => i + 1));
    expect(TOTAL_EJERCICIOS).toBe(Object.keys(CANON).length);
  });

  test('cada ejercicio coincide con su CANON: frase y respuestas admitidas', () => {
    for (const e of EJERCICIOS) {
      const [frase, admitidas] = CANON[e.numero];
      expect(e.frase, `frase del ${e.numero}`).toBe(frase);
      expect([...e.admitidas].sort(), `admitidas del ${e.numero}`).toEqual([...admitidas].sort());
    }
  });

  test('cada respuesta: las admitidas se corrigen bien y las demás mal', () => {
    let casos = 0;
    for (const e of EJERCICIOS) {
      const [, admitidas] = CANON[e.numero];
      for (const p of TODAS) {
        expect(corregir(e, ESCRITA[p]).correcta, `${e.numero} con «${p}»`).toBe(admitidas.includes(p));
        casos++;
      }
    }
    expect(casos).toBe(TOTAL_EJERCICIOS * 4);
  });

  test('cada frase tiene un solo hueco, su traducción y una explicación que nombra su caso', () => {
    for (const e of EJERCICIOS) {
      expect(e.frase.split('___').length, `hueco del ${e.numero}`).toBe(2);
      expect(e.traduccion.length).toBeGreaterThan(3);
      const texto = explicacion(e);
      expect(texto.length, `explicación del ${e.numero}`).toBeGreaterThan(30);
      expect(texto).not.toContain('undefined');
    }
  });

  test('categorías: tiempo 1-20, lugar 21-41, sin preposición 42-50', () => {
    expect(ejerciciosDe(['tiempo']).map((e) => e.numero)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(ejerciciosDe(['lugar']).map((e) => e.numero)).toEqual(Array.from({ length: 21 }, (_, i) => i + 21));
    expect(ejerciciosDe(['sin']).map((e) => e.numero)).toEqual(Array.from({ length: 9 }, (_, i) => i + 42));
    expect([rangoDe('tiempo'), rangoDe('lugar'), rangoDe('sin')]).toEqual(['del 1 al 20', 'del 21 al 41', 'del 42 al 50']);
    expect(ejerciciosDe(['sin']).every((e) => e.admitidas.length === 1 && e.admitidas[0] === 'ninguna')).toBe(true);
  });
});

test.describe('Errores típicos de hispanohablantes, rechazados', () => {
  const casos: [number, string, string][] = [
    [8, 'in', 'in Monday → on Friday'],
    [4, 'in', 'in the night → at night'],
    [13, 'on', 'on the morning → in the morning'],
    [15, 'at', 'at 2026 → in 2010'],
    [7, 'in', 'in the weekend → at/on the weekend'],
    [34, 'in', 'in the bus → on the train'],
    [35, 'in', 'in the plane → on the plane'],
    [25, 'in', 'in a party → at a party'],
    [10, 'in', 'in 2 September → on'],
    [42, 'on', 'on next week → next week'],
    [43, 'on', 'on last Friday → last Friday'],
    [50, 'at', 'go at home → go home'],
    [24, 'in', 'in work → at work'],
    [12, 'in', 'in Monday morning → on'],
    [26, 'on', 'on 42 Elm Street → at'],
  ];
  for (const [n, mal, nombre] of casos) {
    test(nombre, () => {
      expect(corregir(ej(n), mal).correcta).toBe(false);
    });
  }
});

test.describe('Variantes admitidas', () => {
  test('el fin de semana: at (británico) y on (americano)', () => {
    expect(corregir(ej(7), 'at').correcta).toBe(true);
    expect(corregir(ej(7), 'on').correcta).toBe(true);
    expect(corregir(ej(7), 'at/on').correcta).toBe(true);
    expect(corregir(ej(7), 'at o on').correcta).toBe(true);
  });
  test('la calle: in the street (británico) y on the street (americano)', () => {
    expect(corregir(ej(38), 'in').correcta).toBe(true);
    expect(corregir(ej(38), 'on').correcta).toBe(true);
    expect(corregir(ej(38), 'at').correcta).toBe(false);
  });
  test('una calle con nombre: on Main Street, y en británico in', () => {
    expect(corregir(ej(39), 'on').correcta).toBe(true);
    expect(corregir(ej(39), 'in').correcta).toBe(true);
    expect(corregir(ej(39), 'at').correcta).toBe(false);
  });
  test('escribir dos cuando solo vale una no se premia', () => {
    expect(corregir(ej(8), 'on/in').correcta).toBe(false);
    expect(corregir(ej(8), 'at, on').correcta).toBe(false);
  });
});

test.describe('Corrector: lo que escribe un alumno', () => {
  test('mayúsculas, espacios y punto final', () => {
    expect(corregir(ej(1), 'AT').correcta).toBe(true);
    expect(corregir(ej(1), '  at.  ').correcta).toBe(true);
    expect(corregir(ej(1), 'At!').correcta).toBe(true);
    expect(corregir(ej(30), '"in"').correcta).toBe(true);
    expect(normalizar('  ON   the  ')).toBe('on the');
  });
  test('sin preposición: guion, raya, «ninguna», «none», «sin preposición»', () => {
    for (const s of ['-', '—', '–', 'ninguna', 'Ninguna.', 'none', 'nada', 'sin preposición', 'Sin preposicion', 'x', 'ø']) {
      expect(corregir(ej(42), s).correcta, `«${s}»`).toBe(true);
    }
  });
  test('vacío, una palabra cualquiera u otra preposición: incorrecto y no reconocido', () => {
    for (const s of ['', '   ', 'into', 'to', 'by', 'en', 'the', 'at the']) {
      const c = corregir(ej(1), s);
      expect(c.correcta, `«${s}»`).toBe(false);
      expect(c.formas, `«${s}»`).toBeNull();
    }
    // vacío en un ejercicio sin preposición tampoco cuenta: hay que escribir el guion
    expect(corregir(ej(42), '').correcta).toBe(false);
  });
  test('interpretar devuelve las formas sin repetir', () => {
    expect(interpretar('in / IN')).toEqual(['in']);
    expect(interpretar('at or on')).toEqual(['at', 'on']);
    expect(interpretar('-')).toEqual(['ninguna']);
  });
});

test.describe('Forma correcta y explicación', () => {
  test('la frase completa', () => {
    expect(formaCorrecta(ej(1))).toBe("The film starts at 8 o'clock.");
    expect(formaCorrecta(ej(7))).toBe('What are you doing at / on the weekend?');
    expect(formaCorrecta(ej(42))).toBe("I'll call you next week.");
    expect(formaCorrecta(ej(47))).toBe('What are you doing tonight?');
    expect(formaCorrecta(ej(50))).toBe("It's late. Let's go home.");
    expect(fraseCompleta(ej(8), 'in')).toBe('The concert is in Friday.');
  });
  test('la explicación aplica la regla al caso', () => {
    expect(explicacion(ej(1))).toContain("at 8 o'clock");
    expect(explicacion(ej(4))).toContain('at night');
    expect(explicacion(ej(7))).toMatch(/británica.*americana/);
    expect(explicacion(ej(8))).toContain('on Friday');
    expect(explicacion(ej(13))).toContain('in the morning');
    expect(explicacion(ej(15))).toContain('in 2010');
    expect(explicacion(ej(26))).toContain('at 42 Elm Street');
    expect(explicacion(ej(34))).toContain('on the train');
    expect(explicacion(ej(36))).toContain('in the taxi');
    expect(explicacion(ej(42))).toContain('«next week»');
    expect(explicacion(ej(50))).toContain('go home');
  });
});

test.describe('Selección por números', () => {
  test('sueltos, en el orden escrito', () => {
    expect(leerSeleccion('3, 7, 11')).toEqual({ ok: true, numeros: [3, 7, 11] });
    expect(leerSeleccion('11 3 7')).toEqual({ ok: true, numeros: [11, 3, 7] });
    expect(leerSeleccion('3; 7 y 11')).toEqual({ ok: true, numeros: [3, 7, 11] });
  });
  test('rangos, también al revés y con espacios', () => {
    expect(leerSeleccion('5-9')).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(leerSeleccion('5 – 7')).toEqual({ ok: true, numeros: [5, 6, 7] });
    expect(leerSeleccion('9-7')).toEqual({ ok: true, numeros: [7, 8, 9] });
    expect(leerSeleccion('2, 5-6, 12')).toEqual({ ok: true, numeros: [2, 5, 6, 12] });
  });
  test('los repetidos se juegan una vez', () => {
    expect(leerSeleccion('3, 3, 2-4')).toEqual({ ok: true, numeros: [3, 2, 4] });
  });
  test('errores: vacío, número que no existe, texto', () => {
    const vacio = leerSeleccion('  ');
    expect(vacio.ok).toBe(false);
    const fuera = leerSeleccion('3, 51, 0');
    expect(fuera).toEqual({ ok: false, error: 'Los ejercicios 51, 0 no existen: el banco va del 1 al 50.' });
    const uno = leerSeleccion('60');
    expect(uno).toEqual({ ok: false, error: 'El ejercicio 60 no existe: el banco va del 1 al 50.' });
    const texto = leerSeleccion('tres');
    expect(texto.ok).toBe(false);
    if (!texto.ok) expect(texto.error).toContain('«tres»');
    expect(leerSeleccion('1-100000').ok).toBe(false);
  });
});

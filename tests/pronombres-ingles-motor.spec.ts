import { test, expect } from '@playwright/test';
import {
  PRONOMBRES, TIPOS, PERSONAS, EJERCICIOS, CATEGORIAS, HUECO,
  normalizar, corregir, explicacion, fraseResuelta, partesDelEnunciado, opcionesDe,
  buscarEjercicio, ejerciciosDe, leerNumeros,
  type Persona, type Tipo, type Ejercicio,
} from '../app/pronombres-ingles/motor';

/**
 * Motor de pronombres-ingles, con casos escritos A MANO antes de la vista.
 *
 * El CANON de la tabla y el de los ejercicios dicen, forma a forma y hueco a hueco, lo que
 * dan Cambridge Grammar y Oxford Learner's Dictionaries. No salen del motor: si el motor o el
 * banco se equivocan, este fichero no se equivoca con ellos.
 */

/** Orden de las columnas: sujeto, objeto, adjetivo posesivo, pronombre posesivo, reflexivo. */
const CANON_TABLA: Record<Persona, [string, string, string, string, string]> = {
  I: ['I', 'me', 'my', 'mine', 'myself'],
  you: ['you', 'you', 'your', 'yours', 'yourself / yourselves'],
  he: ['he', 'him', 'his', 'his', 'himself'],
  she: ['she', 'her', 'her', 'hers', 'herself'],
  it: ['it', 'it', 'its', 'its', 'itself'],
  we: ['we', 'us', 'our', 'ours', 'ourselves'],
  they: ['they', 'them', 'their', 'theirs', 'themselves'],
};

/** Respuestas admitidas de cada ejercicio, por número. La primera es la que se enseña. */
const CANON_EJERCICIOS: Record<number, string[]> = {
  1: ['She'],
  2: ['We'],
  3: ['It'],
  4: ['They'],
  5: ['I'],
  6: ['He'],
  7: ['you'],
  8: ['them'],
  9: ['her'],
  10: ['me'],
  11: ['them'],
  12: ['him'],
  13: ['us'],
  14: ['it'],
  15: ['our'],
  16: ['their'],
  17: ['my'],
  18: ['your'],
  19: ['its'],
  20: ['Our'],
  21: ['her'],
  22: ['their'],
  23: ['hers'],
  24: ['Mine'],
  25: ['ours'],
  26: ['yours'],
  27: ['theirs'],
  28: ['his'],
  29: ['hers'],
  30: ['mine'],
  31: ['yourself'],
  32: ['yourselves'],
  33: ['himself'],
  34: ['herself'],
  35: ['ourselves'],
  36: ['themselves'],
  37: ['itself'],
  38: ['myself'],
  39: ['its'],
  40: ['It'],
  41: ["It's", 'It is'],
  42: ['Their'],
  43: ["they're", 'they are'],
  44: ['there'],
  45: ['her'],
  46: ['his'],
  47: ['their', 'his or her', 'his/her', 'her or his'],
  48: ['yourselves'],
  49: ['yourself'],
  50: ['I'],
};

/** Errores típicos de un hispanohablante que el corrector tiene que rechazar. */
const ERRORES_TIPICOS: [number, string, string][] = [
  [19, "it's", "it's por its (posesivo)"],
  [39, "it's", "it's por its (posesivo)"],
  [39, 'its.', 'tampoco al revés: its sí vale (control)'],
  [41, 'Its', 'its por it\'s (it is)'],
  [40, 'Is', 'verbo sin sujeto: «Is raining»'],
  [50, 'me', 'me por I como sujeto'],
  [5, 'me', 'me por I como sujeto'],
  [10, 'I', 'I tras preposición: «between you and I»'],
  [23, 'her', 'her por hers sin sustantivo detrás'],
  [29, 'her', 'her por hers sin sustantivo detrás'],
  [23, "her's", 'hers con apóstrofo'],
  [33, 'hisself', 'hisself'],
  [36, 'theirselves', 'theirselves'],
  [32, 'yourself', 'yourself con varios'],
  [48, 'yourself', 'yourself con dos personas'],
  [31, 'yourselves', 'yourselves con una persona'],
  [45, 'his', 'his porque brother es masculino'],
  [46, 'her', 'her porque grandmother es femenino'],
  [42, 'there', 'there por their'],
  [42, "they're", "they're por their"],
  [43, 'their', 'their por they\'re'],
  [44, 'their', 'their por there'],
  [17, 'the', 'artículo con partes del cuerpo'],
  [30, 'me', 'a friend of me'],
  [8, 'it', 'it por them con un plural'],
  [3, 'He', 'he para una cosa'],
  [35, 'us', 'enjoyed us'],
];

const ej = (n: number): Ejercicio => {
  const e = buscarEjercicio(n);
  if (!e) throw new Error(`no existe el ejercicio ${n}`);
  return e;
};

test.describe('Tabla de pronombres', () => {
  test('siete personas en orden y cinco tipos en orden', () => {
    expect(PRONOMBRES.map((f) => f.persona)).toEqual(['I', 'you', 'he', 'she', 'it', 'we', 'they']);
    expect(PERSONAS).toEqual(['I', 'you', 'he', 'she', 'it', 'we', 'they']);
    expect(TIPOS).toEqual(['sujeto', 'objeto', 'adjetivoPosesivo', 'pronombrePosesivo', 'reflexivo']);
  });

  for (const fila of PRONOMBRES) {
    test(`${fila.persona}: ${CANON_TABLA[fila.persona].join(' · ')}`, () => {
      expect(TIPOS.map((t: Tipo) => fila.celdas[t].forma)).toEqual(CANON_TABLA[fila.persona]);
    });
  }

  test('cada celda tiene traducción y un ejemplo que contiene su forma (salvo its pronombre, que se evita)', () => {
    for (const fila of PRONOMBRES) {
      for (const t of TIPOS) {
        const c = fila.celdas[t];
        expect(c.traduccion.length, `${fila.persona}/${t}`).toBeGreaterThan(0);
        expect(c.ejemploEs.length, `${fila.persona}/${t}`).toBeGreaterThan(0);
        if (fila.persona === 'it' && t === 'pronombrePosesivo') continue;
        const formas = c.forma.split(' / ');
        const palabras = c.ejemplo.replace(/[.,!?·]/g, ' ').split(/\s+/).map((p) => p.toLowerCase());
        expect(formas.some((f) => palabras.includes(f.toLowerCase())), `${fila.persona}/${t}: ${c.ejemplo}`).toBe(true);
      }
    }
  });

  test('its como pronombre posesivo lleva el aviso de que casi no se usa', () => {
    const it = PRONOMBRES.find((f) => f.persona === 'it')!;
    expect(it.celdas.pronombrePosesivo.nota).toMatch(/casi no se usa/);
  });
});

test.describe('Banco de ejercicios', () => {
  test('números del 1 al N, sin huecos ni repetidos, en orden', () => {
    expect(EJERCICIOS.map((e) => e.numero)).toEqual(EJERCICIOS.map((_, i) => i + 1));
    expect(EJERCICIOS.length).toBeGreaterThanOrEqual(40);
    expect(EJERCICIOS.length).toBeLessThanOrEqual(55);
  });

  test('el banco y el canon tienen los mismos números', () => {
    expect(EJERCICIOS.map((e) => e.numero)).toEqual(Object.keys(CANON_EJERCICIOS).map(Number));
  });

  for (const [n, admitidas] of Object.entries(CANON_EJERCICIOS)) {
    test(`ejercicio ${n} → ${admitidas.join(' / ')}`, () => {
      const e = ej(Number(n));
      expect(e.admitidas).toEqual(admitidas);
      for (const a of admitidas) expect(corregir(e, a)).toBe(true);
    });
  }

  test('cada enunciado tiene exactamente un hueco', () => {
    for (const e of EJERCICIOS) expect(e.enunciado.split(HUECO).length, `ejercicio ${e.numero}`).toBe(2);
  });

  test('cuatro opciones distintas, y solo una es correcta', () => {
    for (const e of EJERCICIOS) {
      const ops = opcionesDe(e);
      expect(ops.length).toBe(4);
      expect(new Set(ops.map(normalizar)).size, `ejercicio ${e.numero}`).toBe(4);
      expect(ops.filter((o) => corregir(e, o)), `ejercicio ${e.numero}`).toEqual([e.admitidas[0]]);
    }
  });

  test('todas las categorías tienen ejercicios, y suman el banco', () => {
    let suma = 0;
    for (const c of CATEGORIAS) {
      const n = ejerciciosDe([c]).length;
      expect(n, c).toBeGreaterThanOrEqual(6);
      suma += n;
    }
    expect(suma).toBe(EJERCICIOS.length);
  });

  test('cada ejercicio trae su regla, y la regla nombra la respuesta', () => {
    for (const e of EJERCICIOS) {
      const r = explicacion(e).toLowerCase();
      expect(r.length, `ejercicio ${e.numero}`).toBeGreaterThan(40);
      expect(r.includes(e.admitidas[0].toLowerCase()), `ejercicio ${e.numero}`).toBe(true);
    }
  });

  test('la frase resuelta y las partes del enunciado', () => {
    expect(fraseResuelta(ej(23))).toBe('This book belongs to her. → This book is hers.');
    expect(fraseResuelta(ej(40))).toBe('It is raining again.');
    expect(partesDelEnunciado(ej(40))).toEqual(['', ' is raining again.']);
    expect(partesDelEnunciado(ej(33))).toEqual(['Pedro lives by ', '.']);
  });

  test('they singular solo donde el contexto lo pide (someone)', () => {
    const conTheirSingular = EJERCICIOS.filter((e) => e.admitidas.includes('his or her')).map((e) => e.numero);
    expect(conTheirSingular).toEqual([47]);
    expect(ej(47).regla).toMatch(/Cambridge/);
  });
});

test.describe('Corrector', () => {
  test('mayúsculas, espacios de más y punto final no cuentan', () => {
    expect(corregir(ej(23), '  HERS. ')).toBe(true);
    expect(corregir(ej(1), 'she')).toBe(true);
    expect(corregir(ej(36), 'Themselves!')).toBe(true);
    expect(corregir(ej(43), 'they   are')).toBe(true);
  });

  test('el apóstrofo tipográfico vale como el recto', () => {
    expect(corregir(ej(41), 'It’s')).toBe(true);
    expect(corregir(ej(43), 'they’re')).toBe(true);
    expect(normalizar('IT‘S.')).toBe("it's");
  });

  test('his or her y his / her valen en el ejercicio de someone', () => {
    expect(corregir(ej(47), 'his / her')).toBe(true);
    expect(corregir(ej(47), 'His or her')).toBe(true);
    expect(corregir(ej(47), 'their')).toBe(true);
    expect(corregir(ej(47), 'his')).toBe(false);
  });

  test('vacío o solo espacios no es una respuesta', () => {
    expect(corregir(ej(1), '')).toBe(false);
    expect(corregir(ej(1), '   ')).toBe(false);
    expect(corregir(ej(1), '.')).toBe(false);
  });

  for (const [n, respuesta, que] of ERRORES_TIPICOS) {
    const esControl = que.includes('(control)');
    test(`ejercicio ${n}: «${respuesta}» ${esControl ? 'se acepta' : 'se rechaza'} — ${que}`, () => {
      expect(corregir(ej(n), respuesta)).toBe(esControl);
    });
  }
});

test.describe('Ejercicios por número', () => {
  const T = EJERCICIOS.length;

  test('lista con comas, en el orden escrito', () => {
    expect(leerNumeros('3, 7, 11', T)).toEqual({ ok: true, numeros: [3, 7, 11] });
    expect(leerNumeros('11 7 3', T)).toEqual({ ok: true, numeros: [11, 7, 3] });
    expect(leerNumeros('3;7', T)).toEqual({ ok: true, numeros: [3, 7] });
  });

  test('rangos, también con raya y al revés, y mezclados', () => {
    expect(leerNumeros('5-9', T)).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(leerNumeros('5 – 7', T)).toEqual({ ok: true, numeros: [5, 6, 7] });
    expect(leerNumeros('9-7', T)).toEqual({ ok: true, numeros: [7, 8, 9] });
    expect(leerNumeros('1-3, 8', T)).toEqual({ ok: true, numeros: [1, 2, 3, 8] });
  });

  test('los repetidos se quitan', () => {
    expect(leerNumeros('3, 3, 2-4', T)).toEqual({ ok: true, numeros: [3, 2, 4] });
  });

  test('errores: vacío, texto, número que no existe', () => {
    const vacio = leerNumeros('  ', T);
    expect(vacio.ok).toBe(false);
    const texto = leerNumeros('3, siete', T);
    expect(texto.ok).toBe(false);
    if (!texto.ok) expect(texto.error).toContain('«siete»');
    const fuera = leerNumeros('3, 99', T);
    expect(fuera).toEqual({ ok: false, error: `El ejercicio 99 no existe: hay del 1 al ${T}.` });
    const cero = leerNumeros('0', T);
    expect(cero.ok).toBe(false);
    const decimales = leerNumeros('3,5', T);
    expect(decimales).toEqual({ ok: true, numeros: [3, 5] });
  });
});

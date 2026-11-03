import { test, expect } from '@playwright/test';
import {
  EJERCICIOS, VERBOS, CATEGORIAS, TOTAL_EJERCICIOS, conjugar, formasDelHueco, esRespuestaCorrecta,
  opcionesDe, leerNumeros, pistaDe, enunciadoTexto, fraseCompleta, explicarConstruccion, formasIng,
  terceraPersona, notaIng, verboDe, esIrregular, normalizar, ejercicioDe, type Ejercicio,
} from '../app/tiempos-verbales-ingles/motor';
import { verbosIrregulares } from '../data/verbos-irregulares';
import { VERBOS_REGULARES } from '../app/quiz-verbos-irregulares/regulares';

/**
 * Motor de tiempos-verbales-ingles, con casos resueltos A MANO antes de escribir la vista.
 *
 * El CANON escribe, ejercicio a ejercicio, todo lo que se da por bueno en el hueco: la respuesta
 * que se enseña primero y, detrás, las demás formas correctas (la completa de una negativa
 * contraída). No sale del motor: si el motor o el banco se equivocan, este fichero no se
 * equivoca con ellos. Gramática: Cambridge Grammar y Oxford Learner's Dictionaries.
 */
const CANON: Record<number, string[]> = {
  1: ['visits'],
  2: ['is raining'],
  3: ['is singing'],
  4: ['boils'],
  5: ["don't like", 'do not like'],
  6: ['is studying'],
  7: ['goes'],
  8: ['do you want'],
  9: ['are playing'],
  10: ['know'],
  11: ['does your sister swim'],
  12: ['is sleeping'],
  13: ['needs'],
  14: ['opens'],
  15: ['are you doing'],
  16: ['has'],
  17: ['was reading'],
  18: ['knocked'],
  19: ['were you doing'],
  20: ['lost'],
  21: ['were playing'],
  22: ['were waiting'],
  23: ["didn't go", 'did not go'],
  24: ['did you see'],
  25: ['were sleeping'],
  26: ['wrote'],
  27: ['were you'],
  28: ["wasn't sleeping", 'was not sleeping'],
  29: ['have never been'],
  30: ['have you ever eaten'],
  31: ['saw'],
  32: ['moved'],
  33: ['have known'],
  34: ["hasn't seen", 'has not seen'],
  35: ['have had'],
  36: ['got'],
  37: ['have you had'],
  38: ['has won'],
  39: ['did you buy'],
  40: ['has broken'],
  41: ['is going to rain'],
  42: ['will answer'],
  43: ["won't tell", 'will not tell'],
  44: ['is going to paint'],
  45: ['are going to fall'],
  46: ['will close'],
  47: ['is going to study'],
  48: ['will help'],
  49: ['is going to have'],
};

const ej = (n: number): Ejercicio => {
  const e = ejercicioDe(n);
  if (!e) throw new Error(`no existe el ejercicio ${n}`);
  return e;
};
const ordenado = (xs: string[]) => [...xs].sort();

test.describe('Banco de ejercicios', () => {
  test('los números van de 1 a N, sin huecos ni repetidos, en orden', () => {
    expect(EJERCICIOS.map((e) => e.numero)).toEqual(Array.from({ length: TOTAL_EJERCICIOS }, (_, i) => i + 1));
  });

  test('el canon cubre exactamente los mismos números que el banco', () => {
    expect(Object.keys(CANON).map(Number)).toEqual(EJERCICIOS.map((e) => e.numero));
  });

  test('cada categoría tiene al menos 8 ejercicios', () => {
    for (const c of CATEGORIAS) expect(EJERCICIOS.filter((e) => e.categoria === c).length).toBeGreaterThanOrEqual(8);
  });

  test('cada ejercicio usa un verbo del banco y lleva su regla', () => {
    for (const e of EJERCICIOS) {
      expect(() => verboDe(e.verbo)).not.toThrow();
      expect(e.regla.length).toBeGreaterThan(20);
    }
  });

  test('los irregulares del banco están en data/verbos-irregulares y los regulares no', () => {
    const irregulares = new Set(verbosIrregulares.map((v) => v.infinitive));
    const declarados = ['be', 'have', 'do', 'go', 'see', 'know', 'make', 'get', 'begin', 'swim', 'sing', 'sleep',
      'read', 'write', 'eat', 'lose', 'win', 'buy', 'break', 'tell', 'fall', 'come'];
    expect(VERBOS.filter((v) => esIrregular(v)).map((v) => v.infinitivo).sort()).toEqual([...declarados].sort());
    for (const v of VERBOS) expect(irregulares.has(v.infinitivo)).toBe(declarados.includes(v.infinitivo));
  });

  test('la tonicidad coincide con la del banco de regulares en los verbos que comparten', () => {
    for (const v of VERBOS) {
      const r = VERBOS_REGULARES.find((x) => x.infinitivo === v.infinitivo);
      if (r) expect(`${v.infinitivo}:${v.ultimaTonica}`).toBe(`${r.infinitivo}:${r.ultimaTonica}`);
    }
  });
});

test.describe('Canon ejercicio a ejercicio', () => {
  for (const [n, esperado] of Object.entries(CANON)) {
    test(`${n}: ${esperado.join(' / ')}`, () => {
      const e = ej(Number(n));
      expect(e.respuesta).toBe(esperado[0]);
      expect(ordenado(formasDelHueco(e))).toEqual(ordenado(esperado));
      for (const f of esperado) expect(esRespuestaCorrecta(e, f)).toBe(true);
    });
  }
});

test.describe('Conjugación', () => {
  test('3.ª persona: -s, -es, -ies, y has / is', () => {
    const tercera = (inf: string) => terceraPersona(verboDe(inf));
    expect(tercera('go')).toBe('goes');
    expect(tercera('watch')).toBe('watches');
    expect(tercera('fix')).toBe('fixes');
    expect(tercera('do')).toBe('does');
    expect(tercera('study')).toBe('studies');
    expect(tercera('play')).toBe('plays');
    expect(tercera('buy')).toBe('buys');
    expect(tercera('have')).toBe('has');
    expect(tercera('be')).toBe('is');
    expect(tercera('close')).toBe('closes');
    expect(tercera('lie')).toBe('lies');
  });

  test('-ing: e muda, ie, ee, consonante doblada según la tonicidad, l británica', () => {
    const ing = (inf: string) => formasIng(verboDe(inf));
    expect(ing('make')).toEqual(['making']);
    expect(ing('write')).toEqual(['writing']);
    expect(ing('swim')).toEqual(['swimming']);
    expect(ing('lie')).toEqual(['lying']);
    expect(ing('see')).toEqual(['seeing']);
    expect(ing('be')).toEqual(['being']);
    expect(ing('visit')).toEqual(['visiting']);
    expect(ing('begin')).toEqual(['beginning']);
    expect(ing('travel')).toEqual(['travelling', 'traveling']);
    expect(ing('get')).toEqual(['getting']);
    expect(ing('stop')).toEqual(['stopping']);
    expect(ing('open')).toEqual(['opening']);
    expect(ing('answer')).toEqual(['answering']);
    expect(ing('play')).toEqual(['playing']);
    expect(ing('fix')).toEqual(['fixing']);
    expect(ing('rain')).toEqual(['raining']);
    expect(ing('tell')).toEqual(['telling']);
    expect(ing('study')).toEqual(['studying']);
  });

  test('be en presente y pasado según la persona; «amn\'t» no existe', () => {
    expect(conjugar('be', 'present-simple', 'I', 'afirmativa')).toEqual(['I am', "I'm"]);
    expect(conjugar('be', 'present-simple', 'I', 'negativa')).toEqual(['I am not', "I'm not"]);
    expect(conjugar('be', 'present-simple', 'they', 'negativa')).toEqual(['they are not', "they aren't", "they're not"]);
    expect(conjugar('be', 'past-simple', 'I', 'afirmativa')).toEqual(['I was']);
    expect(conjugar('be', 'past-simple', 'you', 'afirmativa')).toEqual(['you were']);
    expect(conjugar('be', 'past-simple', 'we', 'negativa')).toEqual(['we were not', "we weren't"]);
    expect(conjugar('be', 'past-simple', 'he', 'interrogativa')).toEqual(['was he']);
  });

  test('present simple: do / does en negativas y preguntas, con el verbo en forma base', () => {
    expect(conjugar('have', 'present-simple', 'she', 'negativa')).toEqual(['she does not have', "she doesn't have"]);
    expect(conjugar('do', 'present-simple', 'he', 'interrogativa')).toEqual(['does he do']);
    expect(conjugar('work', 'present-simple', 'we', 'afirmativa')).toEqual(['we work']);
  });

  test('present continuous: contracción con el sujeto y la de la negativa', () => {
    expect(conjugar('work', 'present-continuous', 'she', 'negativa')).toEqual(['she is not working', "she isn't working", "she's not working"]);
    expect(conjugar('lie', 'present-continuous', 'you', 'afirmativa')).toEqual(['you are lying', "you're lying"]);
    expect(conjugar('work', 'present-continuous', 'I', 'negativa')).toEqual(['I am not working', "I'm not working"]);
  });

  test('past simple: regulares por su regla (travelled / traveled) e irregulares del banco', () => {
    expect(conjugar('travel', 'past-simple', 'they', 'afirmativa')).toEqual(['they travelled', 'they traveled']);
    expect(conjugar('study', 'past-simple', 'I', 'afirmativa')).toEqual(['I studied']);
    expect(conjugar('stop', 'past-simple', 'it', 'afirmativa')).toEqual(['it stopped']);
    expect(conjugar('go', 'past-simple', 'she', 'negativa')).toEqual(['she did not go', "she didn't go"]);
    expect(conjugar('study', 'past-continuous', 'he', 'interrogativa')).toEqual(['was he studying']);
  });

  test('present perfect: has con he/she/it, participio irregular y variante got / gotten', () => {
    expect(conjugar('go', 'present-perfect', 'he', 'afirmativa')).toEqual(['he has gone', "he's gone"]);
    expect(conjugar('get', 'present-perfect', 'we', 'afirmativa')).toEqual(['we have got', "we've got", 'we have gotten', "we've gotten"]);
    expect(conjugar('eat', 'present-perfect', 'they', 'negativa')).toEqual(['they have not eaten', "they haven't eaten", "they've not eaten"]);
  });

  test('will y be going to', () => {
    expect(conjugar('come', 'future-will', 'I', 'negativa')).toEqual(['I will not come', "I won't come"]);
    expect(conjugar('come', 'future-will', 'she', 'afirmativa')).toEqual(['she will come', "she'll come"]);
    expect(conjugar('study', 'going-to', 'they', 'interrogativa')).toEqual(['are they going to study']);
    expect(conjugar('rain', 'going-to', 'it', 'afirmativa')).toEqual(['it is going to rain', "it's going to rain"]);
  });

  test('adverbio tras el auxiliar, o delante del verbo si no hay auxiliar', () => {
    expect(conjugar('be', 'present-perfect', 'I', 'afirmativa', { adverbio: 'never' })).toEqual(['I have never been', "I've never been"]);
    expect(conjugar('eat', 'present-perfect', 'you', 'interrogativa', { adverbio: 'ever' })).toEqual(['have you ever eaten']);
    expect(conjugar('go', 'present-simple', 'he', 'afirmativa', { adverbio: 'always' })).toEqual(['he always goes']);
  });
});

test.describe('Corrector', () => {
  test('mayúsculas, espacios, punto final y apóstrofo tipográfico no cuentan', () => {
    expect(esRespuestaCorrecta(ej(1), '  Visits. ')).toBe(true);
    expect(esRespuestaCorrecta(ej(5), 'don’t like')).toBe(true);
    expect(esRespuestaCorrecta(ej(5), "DON'T   LIKE")).toBe(true);
    expect(esRespuestaCorrecta(ej(30), 'Have you ever eaten?')).toBe(true);
    expect(normalizar(' Don’t  like. ')).toBe("don't like");
  });

  test('con un pronombre antes del hueco, vale repetirlo o empezar por la contracción', () => {
    expect(esRespuestaCorrecta(ej(1), 'She visits')).toBe(true);
    expect(esRespuestaCorrecta(ej(2), "It's raining")).toBe(true);
    expect(esRespuestaCorrecta(ej(2), "'s raining")).toBe(true);
    expect(esRespuestaCorrecta(ej(42), "I'll answer")).toBe(true);
    expect(esRespuestaCorrecta(ej(42), "'ll answer")).toBe(true);
    expect(esRespuestaCorrecta(ej(29), "I've never been")).toBe(true);
    expect(esRespuestaCorrecta(ej(5), "I don't like")).toBe(true);
  });

  test('con un sujeto que no es pronombre, repetirlo no vale (el hueco no lo lleva)', () => {
    expect(esRespuestaCorrecta(ej(3), 'he is singing')).toBe(false);
    expect(esRespuestaCorrecta(ej(6), "he's studying")).toBe(false);
  });

  test('los errores típicos se dan por malos', () => {
    expect(esRespuestaCorrecta(ej(1), 'visit')).toBe(false);
    expect(esRespuestaCorrecta(ej(1), 'is visiting')).toBe(false);
    expect(esRespuestaCorrecta(ej(1), 'visites')).toBe(false);
    expect(esRespuestaCorrecta(ej(2), 'rains')).toBe(false);
    expect(esRespuestaCorrecta(ej(2), 'is rainning')).toBe(false);
    expect(esRespuestaCorrecta(ej(5), "don't likes")).toBe(false);
    expect(esRespuestaCorrecta(ej(5), "I'm not liking")).toBe(false);
    expect(esRespuestaCorrecta(ej(10), 'am knowing')).toBe(false);
    expect(esRespuestaCorrecta(ej(11), 'does your sister swims')).toBe(false);
    expect(esRespuestaCorrecta(ej(23), "didn't went")).toBe(false);
    expect(esRespuestaCorrecta(ej(29), 'have never went')).toBe(false);
    expect(esRespuestaCorrecta(ej(29), 'was never')).toBe(false);
    expect(esRespuestaCorrecta(ej(30), 'have you ever ate')).toBe(false);
    expect(esRespuestaCorrecta(ej(30), 'did you ever eat')).toBe(false);
    expect(esRespuestaCorrecta(ej(31), 'have seen')).toBe(false);
    expect(esRespuestaCorrecta(ej(34), "hasn't saw")).toBe(false);
    expect(esRespuestaCorrecta(ej(42), 'am going to answer')).toBe(false);
    expect(esRespuestaCorrecta(ej(42), 'will answers')).toBe(false);
    expect(esRespuestaCorrecta(ej(43), "won't to tell")).toBe(false);
    expect(esRespuestaCorrecta(ej(1), '')).toBe(false);
    expect(esRespuestaCorrecta(ej(1), '   ')).toBe(false);
  });
});

test.describe('Opciones del modo elegir', () => {
  test('cuatro opciones distintas, la primera la respuesta y solo ella correcta', () => {
    for (const e of EJERCICIOS) {
      const op = opcionesDe(e);
      expect(op.length, `ejercicio ${e.numero}`).toBe(4);
      expect(new Set(op.map(normalizar)).size, `ejercicio ${e.numero}`).toBe(4);
      expect(op[0]).toBe(e.respuesta);
      expect(op.slice(1).filter((o) => esRespuestaCorrecta(e, o)), `ejercicio ${e.numero}`).toEqual([]);
    }
  });

  test('el primer distractor es el otro tiempo de la pareja', () => {
    expect(opcionesDe(ej(1))[1]).toBe('is visiting');
    expect(opcionesDe(ej(2))[1]).toBe('rains');
    expect(opcionesDe(ej(5))[1]).toBe('am not liking');
    expect(opcionesDe(ej(29))[1]).toBe('was never');
    expect(opcionesDe(ej(41))[1]).toBe('will rain');
  });

  test('ningún distractor es una forma que también se dice en esa frase', () => {
    expect(opcionesDe(ej(43))).toEqual(["won't tell", "am not going to tell", "don't tell", "didn't tell"]);
    expect(opcionesDe(ej(29))).toEqual(['have never been', 'was never', 'am never', 'will never be']);
  });

  test('«Did you ever…?» no se ofrece de distractor en el 30: en americano informal se oye', () => {
    expect(opcionesDe(ej(30)).map(normalizar)).not.toContain('did you ever eat');
  });
});

test.describe('Enunciado y explicaciones', () => {
  test('la pista entre paréntesis: verbo, not, adverbio y sujeto de la pregunta', () => {
    expect(pistaDe(ej(1))).toBe('visit');
    expect(pistaDe(ej(5))).toBe('not / like');
    expect(pistaDe(ej(29))).toBe('never / be');
    expect(pistaDe(ej(30))).toBe('you / ever / eat');
    expect(pistaDe(ej(11))).toBe('your sister / swim');
  });

  test('enunciado y frase resuelta, con la mayúscula cuando el hueco abre la frase', () => {
    expect(enunciadoTexto(ej(1))).toBe('She ___ (visit) her grandmother every Sunday.');
    expect(enunciadoTexto(ej(2))).toBe('Look! It ___ (rain).');
    expect(enunciadoTexto(ej(8))).toBe('___ (you / want) some tea?');
    expect(fraseCompleta(ej(8))).toBe('Do you want some tea?');
    expect(fraseCompleta(ej(11))).toBe('How often does your sister swim?');
    expect(fraseCompleta(ej(23))).toBe("We didn't go to the party last Saturday.");
  });

  test('la explicación de la construcción nombra la forma del caso', () => {
    expect(explicarConstruccion(ej(7))).toContain('goes');
    expect(explicarConstruccion(ej(7))).toContain('-es');
    expect(explicarConstruccion(ej(12))).toContain('sleeping');
    expect(explicarConstruccion(ej(23))).toContain("nunca «didn't went»");
    expect(explicarConstruccion(ej(29))).toContain('been');
    expect(explicarConstruccion(ej(11))).toContain('does your sister swim');
    expect(explicarConstruccion(ej(32))).toContain('moved');
    expect(notaIng(verboDe('swim'))).toContain('se dobla la m (swimming)');
    expect(notaIng(verboDe('travel'))).toContain('travelling');
    expect(notaIng(verboDe('travel'))).toContain('traveling');
    expect(notaIng(verboDe('visit'))).toContain('visiting');
  });
});

test.describe('Selección por número', () => {
  const leer = (t: string) => leerNumeros(t, TOTAL_EJERCICIOS);

  test('números sueltos, intervalos y su mezcla, en el orden escrito y sin repetir', () => {
    expect(leer('3, 7, 11')).toEqual({ ok: true, numeros: [3, 7, 11] });
    expect(leer('5-9')).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(leer('5 – 9')).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(leer('9-5')).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(leer('1-3 y 10')).toEqual({ ok: true, numeros: [1, 2, 3, 10] });
    expect(leer('11 3; 3')).toEqual({ ok: true, numeros: [11, 3] });
  });

  test('lo que no existe o no se entiende da un error que lo nombra', () => {
    const vacio = leer('  ');
    expect(vacio.ok).toBe(false);
    const fuera = leer('3, 50');
    expect(fuera).toEqual({ ok: false, error: `No existe el ejercicio 50: hay del 1 al ${TOTAL_EJERCICIOS}.` });
    expect(leer('0').ok).toBe(false);
    const rango = leer('48-52');
    expect(rango.ok).toBe(false);
    if (!rango.ok) expect(rango.error).toContain('48-52');
    const texto = leer('tres');
    expect(texto.ok).toBe(false);
    if (!texto.ok) expect(texto.error).toContain('«tres»');
  });
});

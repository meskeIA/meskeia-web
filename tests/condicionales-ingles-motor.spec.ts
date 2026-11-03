import { test, expect } from '@playwright/test';
import {
  BANCO, TOTAL_EJERCICIOS, REGLAS, normalizar, corregir, tipoDe, explicar, fraseCompleta,
  filtrar, porNumero, parsearNumeros, type Ejercicio, type EjercicioCompletar, type TipoCondicional,
} from '../app/condicionales-ingles/motor';

/**
 * Motor de condicionales-ingles, con casos resueltos A MANO antes de escribir la vista.
 *
 * El CANON escribe, ejercicio a ejercicio, su tipo, la frase correcta entera y las respuestas que
 * valen en el hueco, según Cambridge Grammar («Conditionals», «unless», «If I were you») y Oxford
 * Learner's Grammar. No sale del motor: si el banco se equivoca, este fichero no se equivoca con él.
 */
interface Canon {
  tipo: TipoCondicional;
  frase: string;
  /** Lo que vale en el hueco (solo en los de completar). */
  vale?: string[];
}

const CANON: Record<number, Canon> = {
  1: { tipo: 0, frase: 'If you heat ice, it melts.', vale: ['heat'] },
  2: { tipo: 0, frase: 'If water reaches 100 °C at sea level, it boils.', vale: ['reaches'] },
  3: { tipo: 0, frase: 'If you mix red and white paint, you get pink.', vale: ['mix'] },
  4: { tipo: 0, frase: "Plants die if they don't get enough water.", vale: ["don't get", 'do not get'] },
  5: { tipo: 0, frase: 'If people are tired, they make more mistakes.', vale: ['are'] },
  6: { tipo: 0, frase: 'Unless you press save, the changes are lost.', vale: ['press'] },
  7: { tipo: 1, frase: 'If it rains tomorrow, we will stay at home.', vale: ['rains'] },
  8: { tipo: 1, frase: 'If Maria studies hard, she will pass the exam.', vale: ['will pass', "'ll pass"] },
  9: { tipo: 1, frase: "If you don't hurry, you will miss the bus.", vale: ["don't hurry", 'do not hurry'] },
  10: { tipo: 1, frase: "If we leave now, we won't be late.", vale: ["won't be", 'will not be'] },
  11: { tipo: 1, frase: 'I will call you if I hear any news.', vale: ['will call', "'ll call"] },
  12: { tipo: 1, frase: 'If Tom misses the train, he will take a taxi.', vale: ['misses'] },
  13: { tipo: 1, frase: "Unless you study, you won't pass the test.", vale: ['study'] },
  14: { tipo: 1, frase: "You won't get a table unless you book in advance.", vale: ['book'] },
  15: { tipo: 1, frase: "If you don't take an umbrella, you might get wet.", vale: ['might get'] },
  16: { tipo: 1, frase: 'If she feels better tomorrow, she will come to the party.', vale: ['feels'] },
  17: { tipo: 2, frase: 'If I had more free time, I would learn to play the guitar.', vale: ['had'] },
  18: { tipo: 2, frase: 'If I had more money, I would buy a new bike.', vale: ['would buy', "'d buy"] },
  19: { tipo: 2, frase: 'If she lived closer, we would see each other more often.', vale: ['lived'] },
  20: { tipo: 2, frase: 'If I were you, I would talk to the teacher.', vale: ['were', 'was'] },
  21: { tipo: 2, frase: 'If it were warmer, we would eat outside.', vale: ['were', 'was'] },
  22: { tipo: 2, frase: 'If you won the lottery, what would you do?', vale: ['would you do'] },
  23: { tipo: 2, frase: "We wouldn't need a car if we lived in the city.", vale: ["wouldn't need", 'would not need'] },
  24: { tipo: 2, frase: "If they didn't work so much, they would spend more time with their family.", vale: ["didn't work", 'did not work'] },
  25: { tipo: 2, frase: 'If I knew the answer, I could help you.', vale: ['could help'] },
  26: { tipo: 2, frase: 'If Ahmed spoke Japanese, he would apply for the job in Tokyo.', vale: ['spoke'] },
  27: { tipo: 3, frase: 'If I had known about the party, I would have gone.', vale: ['had known', "'d known"] },
  28: { tipo: 3, frase: "If we had left earlier, we wouldn't have missed the flight.", vale: ["wouldn't have missed", 'would not have missed'] },
  29: { tipo: 3, frase: 'If she had studied harder, she would have passed the exam.', vale: ['had studied', "'d studied"] },
  30: { tipo: 3, frase: 'If you had told me, I would have helped you.', vale: ['would have helped', "'d have helped", "would've helped"] },
  31: { tipo: 3, frase: 'They would have arrived on time if they had taken the earlier train.', vale: ['would have arrived', "'d have arrived", "would've arrived"] },
  32: { tipo: 3, frase: "If it hadn't rained, we would have played the final.", vale: ["hadn't rained", 'had not rained'] },
  33: { tipo: 3, frase: 'If Lucas had remembered his keys, he could have opened the door.', vale: ['could have opened', "could've opened"] },
  34: { tipo: 3, frase: 'If you had asked me, I would have said yes.', vale: ['had asked', "'d asked"] },
  35: { tipo: 0, frase: 'If you freeze water, it turns into ice.' },
  36: { tipo: 1, frase: 'If I see Ana, I will give her your message.' },
  37: { tipo: 2, frase: 'If I won a scholarship, I would study in Canada.' },
  38: { tipo: 3, frase: 'If they had invited me, I would have gone to the wedding.' },
  39: { tipo: 1, frase: 'Unless it rains, we will have the picnic in the park.' },
  40: { tipo: 0, frase: 'If babies are hungry, they cry.' },
  41: { tipo: 2, frase: 'She would be happier if she had a job she liked.' },
  42: { tipo: 3, frase: "We would have won the match if our goalkeeper hadn't been injured." },
  43: { tipo: 1, frase: "If you don't water the plants, they will die." },
  44: { tipo: 2, frase: 'If I were taller, I would play basketball.' },
  45: { tipo: 0, frase: 'If you press this button, the machine stops.' },
  46: { tipo: 3, frase: "If he had saved some money, he wouldn't have needed a loan." },
  47: { tipo: 1, frase: "You'll feel better if you get some sleep." },
};

/** Errores típicos, escritos a mano: todos tienen que salir MAL. */
const ERRORES: Record<number, string[]> = {
  1: ['will heat', 'heats'],
  4: ["won't get", "doesn't get", 'not get'],
  6: ["don't press", 'will press'],
  7: ['will rain', 'rain', 'would rain'],
  8: ['would pass', 'pass', 'passes'],
  9: ["won't hurry", 'not hurry'],
  10: ["wouldn't be", "aren't"],
  11: ['would call', 'call'],
  12: ['miss', 'will miss'],
  13: ["don't study", 'will study'],
  14: ["don't book", 'will book'],
  15: ['will might get', 'might got', 'might to get'],
  17: ['would have', 'have', 'had had'],
  18: ['will buy', 'would bought', 'would have bought'],
  19: ['would live', 'lives'],
  20: ['would be', 'am', 'be'],
  22: ['will you do', 'you would do'],
  23: ["won't need", "wouldn't needed"],
  24: ["wouldn't work", "don't work"],
  25: ['could helped', 'can help', 'could have helped'],
  26: ['would speak', 'speaked'],
  27: ['would have known', 'knew', "would've known"],
  28: ["wouldn't miss", "won't miss"],
  29: ['would have studied', 'studied'],
  30: ['would help', 'will help', 'would have help'],
  31: ['would arrive', 'had arrived'],
  32: ["didn't rain", "wouldn't have rained"],
  33: ['could open', 'could opened', "could've open"],
  34: ['asked', 'would have asked'],
};

const ej = (n: number): Ejercicio => {
  const e = porNumero(n);
  if (!e) throw new Error(`no hay ejercicio ${n}`);
  return e;
};
const completar = (n: number): EjercicioCompletar => {
  const e = ej(n);
  if (e.clase !== 'completar') throw new Error(`el ${n} no es de completar`);
  return e;
};

test.describe('Banco', () => {
  test('los números van del 1 al N sin huecos ni repetidos, y el banco va en orden', () => {
    expect(BANCO.map((e) => e.numero)).toEqual(Array.from({ length: BANCO.length }, (_, i) => i + 1));
    expect(TOTAL_EJERCICIOS).toBe(BANCO.length);
  });

  test('el banco y el canon tienen los mismos ejercicios', () => {
    expect(BANCO.map((e) => e.numero)).toEqual(Object.keys(CANON).map(Number));
    expect(BANCO.length).toBeGreaterThanOrEqual(40);
    expect(BANCO.length).toBeLessThanOrEqual(50);
  });

  test('hay ejercicios de los cuatro tipos en las dos clases, y con unless', () => {
    for (const t of [0, 1, 2, 3] as TipoCondicional[]) {
      expect(filtrar([t], ['completar']).length).toBeGreaterThanOrEqual(5);
      expect(filtrar([t], ['tipo']).length).toBeGreaterThanOrEqual(3);
    }
    expect(BANCO.filter((e) => /\bunless\b/i.test(fraseCompleta(e))).length).toBeGreaterThanOrEqual(3);
  });

  test('cada ejercicio de completar tiene 4 opciones distintas y exactamente una correcta', () => {
    for (const e of BANCO) {
      if (e.clase !== 'completar') continue;
      expect(new Set(e.opciones).size, `ejercicio ${e.numero}`).toBe(4);
      const buenas = e.opciones.filter((o) => corregir(e, o).correcta);
      expect(buenas, `ejercicio ${e.numero}`).toEqual([e.admitidas[0]]);
    }
  });

  test('el tipo de cada ejercicio cuadra con los verbos de sus dos cláusulas (tipoDe)', () => {
    for (const e of BANCO) expect(tipoDe(e.condicion, e.resultado), `ejercicio ${e.numero}`).toBe(e.tipo);
  });

  test('los verbos de las dos cláusulas están de verdad en la frase', () => {
    for (const e of BANCO) {
      const frase = fraseCompleta(e);
      expect(frase, `ejercicio ${e.numero}`).toContain(e.condicion);
      expect(frase, `ejercicio ${e.numero}`).toContain(e.resultado);
    }
  });
});

test.describe('Canon ejercicio a ejercicio', () => {
  for (const [numero, canon] of Object.entries(CANON)) {
    const n = Number(numero);
    test(`${n} · tipo ${canon.tipo} · ${canon.frase}`, () => {
      const e = ej(n);
      expect(e.tipo).toBe(canon.tipo);
      expect(fraseCompleta(e)).toBe(canon.frase);
      if (canon.vale) {
        expect(e.clase).toBe('completar');
        const c = completar(n);
        expect([...c.admitidas].sort()).toEqual([...canon.vale].sort());
        for (const v of canon.vale) expect(corregir(e, v).correcta, v).toBe(true);
      } else {
        expect(e.clase).toBe('tipo');
        expect(corregir(e, String(canon.tipo)).correcta).toBe(true);
        for (const otro of [0, 1, 2, 3].filter((t) => t !== canon.tipo)) {
          expect(corregir(e, String(otro)).correcta).toBe(false);
        }
      }
      for (const malo of ERRORES[n] ?? []) expect(corregir(e, malo).correcta, malo).toBe(false);
    });
  }
});

test.describe('Lo que un alumno escribe', () => {
  test('normalizar: mayúsculas, espacios, punto final y apóstrofo tipográfico', () => {
    expect(normalizar('  Will   PASS. ')).toBe('will pass');
    expect(normalizar('Won’t be')).toBe("won't be");
    expect(normalizar('wouldn‘t need!')).toBe("wouldn't need");
  });

  test('las variantes admitidas valen escritas de cualquier forma', () => {
    expect(corregir(ej(7), 'Rains.').correcta).toBe(true);
    expect(corregir(ej(10), 'won’t be').correcta).toBe(true);
    expect(corregir(ej(10), 'WILL NOT BE').correcta).toBe(true);
    expect(corregir(ej(18), '’d buy').correcta).toBe(true);
    expect(corregir(ej(27), 'had   known').correcta).toBe(true);
    expect(corregir(ej(30), 'would’ve helped.').correcta).toBe(true);
    expect(corregir(ej(4), 'do not get').correcta).toBe(true);
  });

  test('tipo 2 con I o it: were y was valen, con la nota de que se prefiere were', () => {
    expect(corregir(ej(20), 'were').correcta).toBe(true);
    expect(corregir(ej(20), 'was').correcta).toBe(true);
    expect(corregir(ej(21), 'Was').correcta).toBe(true);
    expect(ej(20).nota).toContain('se prefiere «were»');
    expect(ej(20).nota).toContain('If I were you');
  });

  test('vacío no vale', () => {
    expect(corregir(ej(7), '').correcta).toBe(false);
    expect(corregir(ej(7), '   ').aviso).toBe('No has escrito nada en el hueco.');
  });

  test('«¿qué tipo es?» admite el número, «tipo N» y el nombre inglés', () => {
    expect(corregir(ej(37), '2').correcta).toBe(true);
    expect(corregir(ej(37), 'Tipo 2').correcta).toBe(true);
    expect(corregir(ej(37), 'second conditional').correcta).toBe(true);
    expect(corregir(ej(38), 'third').correcta).toBe(true);
    expect(corregir(ej(38), 'second').correcta).toBe(false);
  });
});

test.describe('Errores típicos y su aviso', () => {
  test('will en la cláusula con if: «If it will rain»', () => {
    const c = corregir(ej(7), 'will rain');
    expect(c.correcta).toBe(false);
    expect(c.aviso).toContain('no se usa will');
  });

  test('would have en la cláusula con if: «If I would have known»', () => {
    const c = corregir(ej(27), 'would have known');
    expect(c.correcta).toBe(false);
    expect(c.aviso).toContain('had + participio');
  });

  test('would en el tipo 1', () => {
    const c = corregir(ej(8), 'would pass');
    expect(c.correcta).toBe(false);
    expect(c.aviso).toContain('lleva will');
  });

  test('will en el tipo 2 y would have en el tipo 2', () => {
    expect(corregir(ej(18), 'will buy').aviso).toContain('lleva would');
    expect(corregir(ej(18), 'would have bought').aviso).toContain('tipo 3');
  });

  test('would + infinitivo en el tipo 3', () => {
    expect(corregir(ej(30), 'would help').aviso).toContain('would have + participio');
    expect(corregir(ej(28), "won't miss").aviso).toContain('would have + participio');
  });

  test('negativa tras unless: «Unless you don\'t study»', () => {
    const c = corregir(ej(13), "don't study");
    expect(c.correcta).toBe(false);
    expect(c.aviso).toContain('afirmativa');
  });

  test('dos modales seguidos y modal + -ed', () => {
    expect(corregir(ej(15), 'will might get').aviso).toContain('Dos modales');
    expect(corregir(ej(25), 'could helped').aviso).toContain('sin -ed');
  });

  test('elegir otro tipo explica qué le faltaría a la frase', () => {
    const c = corregir(ej(38), '2');
    expect(c.correcta).toBe(false);
    expect(c.aviso).toContain('past simple');
    expect(c.aviso).toContain('would + infinitivo');
  });
});

test.describe('tipoDe', () => {
  test('clasifica por las dos cláusulas', () => {
    expect(tipoDe('heat', 'melts')).toBe(0);
    expect(tipoDe('rains', 'will stay')).toBe(1);
    expect(tipoDe("don't take", 'might get')).toBe(1);
    expect(tipoDe('had', 'would buy')).toBe(2);
    expect(tipoDe('were', "'d buy")).toBe(2);
    expect(tipoDe('had known', 'would have gone')).toBe(3);
    expect(tipoDe("'d known", "would've gone")).toBe(3);
  });

  test('las combinaciones que no son ninguno de los cuatro dan null', () => {
    expect(tipoDe('will rain', 'will stay')).toBeNull();
    expect(tipoDe('would have known', 'would have gone')).toBeNull();
    expect(tipoDe('knew', 'would have gone')).toBeNull();
    expect(tipoDe('had known', 'would go')).toBeNull();
  });
});

test.describe('Explicaciones', () => {
  test('nombran el tipo, la forma correcta y la cláusula que lo decide', () => {
    const e7 = explicar(ej(7));
    expect(e7).toContain('tipo 1 (first conditional)');
    expect(e7).toContain('«will stay»');
    expect(e7).toContain('«rains»');
    expect(e7).toContain('no se usa will');

    const e18 = explicar(ej(18));
    expect(e18).toContain('«had» (past simple)');
    expect(e18).toContain('would + infinitivo');
    expect(e18).toContain('«would buy»');

    const e33 = explicar(ej(33));
    expect(e33).toContain('could have + participio');

    const e38 = explicar(ej(38));
    expect(e38).toContain('«had invited»');
    expect(e38).toContain('«would have gone»');
    expect(e38).toContain('tipo 3');
  });

  test('las de unless explican que equivale a if… not', () => {
    expect(explicar(ej(13))).toContain('if… not');
    expect(explicar(ej(39))).toContain('cláusula con unless');
  });

  test('la tabla de reglas lleva las cuatro estructuras', () => {
    expect(REGLAS[0].estructura).toBe('If + present simple, present simple');
    expect(REGLAS[1].estructura).toBe('If + present simple, will + infinitivo');
    expect(REGLAS[2].estructura).toBe('If + past simple, would + infinitivo');
    expect(REGLAS[3].estructura).toBe('If + past perfect, would have + participio');
  });
});

test.describe('Ejercicios por número', () => {
  test('lista, intervalo y mezcla, en el orden escrito y sin repetir', () => {
    expect(parsearNumeros('3, 7, 11')).toEqual({ ok: true, numeros: [3, 7, 11] });
    expect(parsearNumeros('5-9')).toEqual({ ok: true, numeros: [5, 6, 7, 8, 9] });
    expect(parsearNumeros('5 – 7')).toEqual({ ok: true, numeros: [5, 6, 7] });
    expect(parsearNumeros('11 3; 3 1-2')).toEqual({ ok: true, numeros: [11, 3, 1, 2] });
  });

  test('errores: vacío, fuera de rango, al revés y lo que no es un número', () => {
    const vacio = parsearNumeros('  ');
    expect(vacio.ok).toBe(false);
    const fuera = parsearNumeros('3, 99');
    expect(fuera).toEqual({ ok: false, error: `No hay ejercicio 99: los números van del 1 al ${TOTAL_EJERCICIOS}.` });
    expect(parsearNumeros('0').ok).toBe(false);
    expect(parsearNumeros('9-5')).toEqual({ ok: false, error: 'El intervalo «9-5» va al revés: escribe 5-9.' });
    expect(parsearNumeros('3, abc')).toEqual({ ok: false, error: '«abc» no es un número de ejercicio.' });
    expect(parsearNumeros('2.5').ok).toBe(false);
  });

  test('filtrar respeta tipos y clases, en el orden del banco', () => {
    const t3 = filtrar([3], ['tipo']).map((e) => e.numero);
    expect(t3).toEqual([38, 42, 46]);
    expect(filtrar([0, 1, 2, 3], ['completar', 'tipo']).length).toBe(TOTAL_EJERCICIOS);
  });
});

import { test, expect } from '@playwright/test';
import {
  corregir, esFormaCorrecta, formasEscritas, pasadosAdmitidos, participiosAdmitidos,
  anotarRespuesta, verbosPendientes, leerRegistro, ACIERTOS_PARA_SALIR, type ListaRepaso,
} from '../app/quiz-verbos-irregulares/motor';
import type { VerboIrregular } from '../data/verbos-irregulares';

/**
 * Motor del modo «Escribir las formas» y de la lista de repaso de quiz-verbos-irregulares
 * (S0181), con casos resueltos A MANO antes de escribir la vista.
 *
 * Los verbos de prueba se escriben aquí y no se importan del banco: así el caso dice qué tiene
 * que aceptar el corrector para una conjugación concreta, sin depender de lo que el banco diga.
 * Que el banco lleve las formas correctas ya lo vigila el CANON de
 * tests/apps/quiz-verbos-irregulares.spec.ts.
 *
 * Fuentes de las variantes: Cambridge Dictionary, get «past tense got, past participle got or
 * US usually gotten» y wake «past tense woke or US also waked, past participle woken or US also
 * waked».
 */

const GO: VerboIrregular = { infinitive: 'go', pastSimple: 'went', pastParticiple: 'gone', spanish: 'ir', level: 'A1' };
const BE: VerboIrregular = { infinitive: 'be', pastSimple: 'was / were', pastParticiple: 'been', spanish: 'ser / estar', level: 'A1' };
const GET: VerboIrregular = {
  infinitive: 'get', pastSimple: 'got', pastParticiple: 'got', spanish: 'obtener / conseguir', level: 'A1',
  varianteParticipio: { forma: 'gotten', variedad: 'AmE' },
};
const WAKE: VerboIrregular = {
  infinitive: 'wake', pastSimple: 'woke', pastParticiple: 'woken', spanish: 'despertar', level: 'B2',
  varianteParticipio: { forma: 'waked', variedad: 'AmE' },
};
const SHINE: VerboIrregular = { infinitive: 'shine', pastSimple: 'shone', pastParticiple: 'shone', spanish: 'brillar', level: 'B2' };
const PUT: VerboIrregular = { infinitive: 'put', pastSimple: 'put', pastParticiple: 'put', spanish: 'poner', level: 'A2' };

test.describe('Formas admitidas', () => {
  test('be admite was y were por separado; get, got y gotten; wake, woke y waked', () => {
    expect(pasadosAdmitidos(BE)).toEqual(['was', 'were']);
    expect(participiosAdmitidos(BE)).toEqual(['been']);
    expect(participiosAdmitidos(GET)).toEqual(['got', 'gotten']);
    expect(pasadosAdmitidos(WAKE)).toEqual(['woke', 'waked']);
    expect(participiosAdmitidos(WAKE)).toEqual(['woken', 'waked']);
  });

  test('shine no admite «shined»: solo vale con el sentido de sacar brillo, y el quiz enseña «brillar»', () => {
    expect(pasadosAdmitidos(SHINE)).toEqual(['shone']);
    expect(corregir(SHINE, 'shined', 'shined')).toEqual({ pasadoOk: false, participioOk: false });
  });
});

test.describe('Lectura de lo escrito', () => {
  test('mayúsculas, espacios y punto final no cuentan', () => {
    expect(formasEscritas('  Went. ')).toEqual(['went']);
    expect(esFormaCorrecta('  WENT ', ['went'])).toBe(true);
  });

  test('dos formas con barra, coma, guion u «or» se leen como dos', () => {
    expect(formasEscritas('was/were')).toEqual(['was', 'were']);
    expect(formasEscritas('was, were')).toEqual(['was', 'were']);
    expect(formasEscritas('was-were')).toEqual(['was', 'were']);
    expect(formasEscritas('got or gotten')).toEqual(['got', 'gotten']);
    expect(formasEscritas('was o were')).toEqual(['was', 'were']);
  });

  test('el paréntesis de las tablas de clase, «got(ten)», son las dos formas', () => {
    expect(formasEscritas('got(ten)')).toEqual(['got', 'gotten']);
    expect(esFormaCorrecta('got(ten)', participiosAdmitidos(GET))).toBe(true);
  });
});

test.describe('Corrección de las dos casillas', () => {
  test('go: went / gone → las dos bien', () => {
    expect(corregir(GO, 'went', 'gone')).toEqual({ pasadoOk: true, participioOk: true });
  });

  test('go: el error clásico «goed / goed» → las dos mal', () => {
    expect(corregir(GO, 'goed', 'goed')).toEqual({ pasadoOk: false, participioOk: false });
  });

  test('go: «went / went» → pasado bien y participio mal (el «I have went» de la guía)', () => {
    expect(corregir(GO, 'went', 'went')).toEqual({ pasadoOk: true, participioOk: false });
  });

  test('go: las formas cambiadas de casilla, «gone / went» → las dos mal', () => {
    expect(corregir(GO, 'gone', 'went')).toEqual({ pasadoOk: false, participioOk: false });
  });

  test('go: escribir las dos formas en la casilla del pasado no la da por buena', () => {
    // Una de las dos palabras acierta, pero «gone» no es un pasado: todas tienen que serlo.
    expect(corregir(GO, 'went gone', 'gone').pasadoOk).toBe(false);
  });

  test('casilla vacía → mal, no «sin responder» a medias', () => {
    expect(corregir(GO, '', 'gone')).toEqual({ pasadoOk: false, participioOk: true });
    expect(corregir(GO, '   ', '  ')).toEqual({ pasadoOk: false, participioOk: false });
  });

  test('be: was, were o «was/were» valen; «was/been» en el pasado no', () => {
    expect(corregir(BE, 'was', 'been').pasadoOk).toBe(true);
    expect(corregir(BE, 'were', 'been').pasadoOk).toBe(true);
    expect(corregir(BE, 'was / were', 'been').pasadoOk).toBe(true);
    expect(corregir(BE, 'was/been', 'been').pasadoOk).toBe(false);
  });

  test('get: got / got, got / gotten y got / got(ten) valen los tres', () => {
    expect(corregir(GET, 'got', 'got')).toEqual({ pasadoOk: true, participioOk: true });
    expect(corregir(GET, 'got', 'gotten')).toEqual({ pasadoOk: true, participioOk: true });
    expect(corregir(GET, 'got', 'got(ten)')).toEqual({ pasadoOk: true, participioOk: true });
    // «gotten» no es pasado en ninguna variedad
    expect(corregir(GET, 'gotten', 'got').pasadoOk).toBe(false);
  });

  test('wake: el americano waked / waked vale', () => {
    expect(corregir(WAKE, 'waked', 'waked')).toEqual({ pasadoOk: true, participioOk: true });
    expect(corregir(WAKE, 'woke', 'woke').participioOk).toBe(false);
  });

  test('put: A-A-A, el infinitivo es la respuesta en las dos casillas', () => {
    expect(corregir(PUT, 'put', 'put')).toEqual({ pasadoOk: true, participioOk: true });
    expect(corregir(PUT, 'putted', 'put').pasadoOk).toBe(false);
  });
});

test.describe('Lista de repaso', () => {
  test(`un fallo entra; hacen falta ${ACIERTOS_PARA_SALIR} aciertos SEGUIDOS para salir`, () => {
    expect(ACIERTOS_PARA_SALIR).toBe(2);
    let l: ListaRepaso = {};
    l = anotarRespuesta(l, 'go', false);
    expect(l).toEqual({ go: { fallos: 1, racha: 0 } });
    l = anotarRespuesta(l, 'go', true);
    expect(l).toEqual({ go: { fallos: 1, racha: 1 } });
    // Un fallo entre medias pone la racha a cero y suma un fallo
    l = anotarRespuesta(l, 'go', false);
    expect(l).toEqual({ go: { fallos: 2, racha: 0 } });
    l = anotarRespuesta(l, 'go', true);
    l = anotarRespuesta(l, 'go', true);
    expect(l).toEqual({});
  });

  test('acertar un verbo que no estaba en la lista no lo mete', () => {
    const l = anotarRespuesta({}, 'see', true);
    expect(l).toEqual({});
  });

  test('anotar no muta la lista de entrada', () => {
    const antes: ListaRepaso = { go: { fallos: 1, racha: 0 } };
    anotarRespuesta(antes, 'go', true);
    anotarRespuesta(antes, 'see', false);
    expect(antes).toEqual({ go: { fallos: 1, racha: 0 } });
  });

  test('orden: más fallos primero; a igualdad, menos racha; luego el orden del banco', () => {
    const banco = [BE, GO, GET, WAKE, PUT];
    const lista: ListaRepaso = {
      put: { fallos: 1, racha: 0 },
      wake: { fallos: 3, racha: 1 },
      get: { fallos: 1, racha: 1 },
      be: { fallos: 1, racha: 0 },
    };
    // wake (3) · be y put (1, racha 0: be va antes en el banco) · get (1, racha 1). go no está.
    expect(verbosPendientes(lista, banco).map((v) => v.infinitive)).toEqual(['wake', 'be', 'put', 'get']);
  });
});

test.describe('Lectura de lo guardado', () => {
  const VALIDOS = ['go', 'be', 'get'];

  test('vacío, JSON roto o un array → registro vacío, sin romper', () => {
    const vacio = { elegir: {}, escribir: {} };
    expect(leerRegistro(null, VALIDOS)).toEqual(vacio);
    expect(leerRegistro('{no es json', VALIDOS)).toEqual(vacio);
    expect(leerRegistro('[1,2]', VALIDOS)).toEqual(vacio);
    expect(leerRegistro('"hola"', VALIDOS)).toEqual(vacio);
  });

  test('se queda con las fichas buenas y descarta las raras, ficha a ficha', () => {
    const crudo = JSON.stringify({
      escribir: {
        go: { fallos: 2, racha: 1 },        // buena
        swimmed: { fallos: 1, racha: 0 },   // no está en el banco
        be: { fallos: 0, racha: 0 },        // 0 fallos: no debería estar en la lista
        get: { fallos: 1, racha: 2 },       // racha 2 ya habría salido
      },
      elegir: { be: { fallos: 1.5, racha: 0 }, get: { fallos: 1, racha: 0 } },
      otraCosa: { go: { fallos: 9, racha: 0 } },
    });
    expect(leerRegistro(crudo, VALIDOS)).toEqual({
      elegir: { get: { fallos: 1, racha: 0 } },
      escribir: { go: { fallos: 2, racha: 1 } },
    });
  });
});

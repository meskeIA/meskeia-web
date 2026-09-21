import { test, expect } from '@playwright/test';
import {
  conjugarVerbo,
  expandirConCompuestos,
  TIEMPOS,
  PRONOMBRES,
} from '../app/conjugador-verbos/motorConjugacion';
import { verbosIrregulares } from '../app/conjugador-verbos/verbosIrregulares';

/**
 * Tiempos compuestos y futuro de subjuntivo — casos resueltos A MANO.
 *
 * De dónde sale esto: hasta el 21/09/2026 el título de la app prometía «Todos los
 * tiempos verbales» y el motor entregaba ocho paradigmas, ninguno compuesto. El propio
 * JSON-LD de la página llegaba a citar el pretérito anterior y el futuro de subjuntivo,
 * que no existían por ninguna parte. Este fichero es el oráculo de los nueve que se
 * añadieron.
 *
 * El oráculo son paradigmas que se saben sin gramática delante:
 *
 *   he cantado        el perfecto compuesto de cualquier regular en -ar
 *   he dicho          el auxiliar es siempre «haber», el participio lo pone el verbo
 *   hubo salido       el pretérito anterior, que existe aunque casi no se use
 *   adonde fueres     el futuro de subjuntivo de «ir», vivo en el refrán
 *
 * Y una propiedad que NO es un caso suelto sino lo que separa al español del francés:
 * el participio de un tiempo compuesto es INVARIABLE. «Las cartas que he escrito»,
 * nunca «escritas». Si alguna vez alguien hace concordar el participio, el test de
 * invariabilidad lo caza para los 72 irregulares a la vez.
 */

const YO = 0;
const TU = 1;
const EL = 2;
const NOSOTROS = 3;
const VOSOTROS = 4;
const ELLOS = 5;

test.describe('El auxiliar y el participio se combinan bien', () => {
  test('cantar: el perfecto compuesto entero, que es el que todo el mundo sabe', () => {
    const cantar = conjugarVerbo('cantar')!;
    expect(cantar.indicativo.preterito_perfecto).toEqual([
      'he cantado',
      'has cantado',
      'ha cantado',
      'hemos cantado',
      'habéis cantado',
      'han cantado',
    ]);
  });

  test('cantar: los otros cuatro compuestos de indicativo', () => {
    const cantar = conjugarVerbo('cantar')!;
    expect(cantar.indicativo.preterito_pluscuamperfecto[YO]).toBe('había cantado');
    expect(cantar.indicativo.preterito_anterior[EL]).toBe('hubo cantado');
    expect(cantar.indicativo.futuro_perfecto[NOSOTROS]).toBe('habremos cantado');
    expect(cantar.indicativo.condicional_perfecto[ELLOS]).toBe('habrían cantado');
  });

  test('cantar: los dos compuestos de subjuntivo', () => {
    const cantar = conjugarVerbo('cantar')!;
    expect(cantar.subjuntivo.preterito_perfecto[YO]).toBe('haya cantado');
    expect(cantar.subjuntivo.preterito_pluscuamperfecto[TU]).toBe('hubieras cantado');
  });

  test('comer y vivir: las otras dos conjugaciones regulares', () => {
    expect(conjugarVerbo('comer')!.indicativo.condicional_perfecto[YO]).toBe('habría comido');
    expect(conjugarVerbo('vivir')!.subjuntivo.preterito_perfecto[NOSOTROS]).toBe('hayamos vivido');
  });

  test('el participio irregular viaja al compuesto tal cual', () => {
    expect(conjugarVerbo('decir')!.indicativo.preterito_perfecto[YO]).toBe('he dicho');
    expect(conjugarVerbo('escribir')!.indicativo.preterito_perfecto[YO]).toBe('he escrito');
    expect(conjugarVerbo('hacer')!.indicativo.preterito_anterior[YO]).toBe('hube hecho');
    expect(conjugarVerbo('ver')!.indicativo.futuro_perfecto[YO]).toBe('habré visto');
    expect(conjugarVerbo('volver')!.subjuntivo.preterito_pluscuamperfecto[YO]).toBe('hubiera vuelto');
  });

  test('haber consigo mismo: «ha habido» es correcto y sale solo', () => {
    expect(conjugarVerbo('haber')!.indicativo.preterito_perfecto[EL]).toBe('ha habido');
  });
});

test.describe('El participio de un compuesto es invariable', () => {
  test('ningún compuesto concuerda en género o número en los 72 irregulares', () => {
    const fallos: string[] = [];
    for (const [infinitivo, simple] of Object.entries(verbosIrregulares)) {
      const conj = expandirConCompuestos(simple);
      const compuestos = [
        ...conj.indicativo.preterito_perfecto,
        ...conj.indicativo.preterito_pluscuamperfecto,
        ...conj.indicativo.preterito_anterior,
        ...conj.indicativo.futuro_perfecto,
        ...conj.indicativo.condicional_perfecto,
        ...conj.subjuntivo.preterito_perfecto,
        ...conj.subjuntivo.preterito_pluscuamperfecto,
        ...conj.subjuntivo.futuro_perfecto,
      ];
      for (const forma of compuestos) {
        if (!forma.endsWith(` ${simple.participio}`)) {
          fallos.push(`${infinitivo}: «${forma}» no acaba en «${simple.participio}»`);
        }
      }
    }
    expect(fallos).toEqual([]);
  });
});

test.describe('Futuro de subjuntivo — sale del imperfecto en -ra', () => {
  test('ir: el paradigma del refrán («adonde fueres, haz lo que vieres»)', () => {
    const ir = conjugarVerbo('ir')!;
    expect(ir.subjuntivo.futuro).toEqual(['fuere', 'fueres', 'fuere', 'fuéremos', 'fuereis', 'fueren']);
  });

  test('ver: la segunda mitad del mismo refrán', () => {
    expect(conjugarVerbo('ver')!.subjuntivo.futuro[TU]).toBe('vieres');
  });

  test('cantar: el regular, con la tilde de la primera persona del plural', () => {
    const cantar = conjugarVerbo('cantar')!;
    expect(cantar.subjuntivo.futuro).toEqual([
      'cantare',
      'cantares',
      'cantare',
      'cantáremos',
      'cantareis',
      'cantaren',
    ]);
  });

  test('decir: la raíz irregular del indefinido se conserva (dijeron → dijera → dijere)', () => {
    const decir = conjugarVerbo('decir')!;
    expect(decir.subjuntivo.futuro[YO]).toBe('dijere');
    expect(decir.subjuntivo.futuro[NOSOTROS]).toBe('dijéremos');
  });

  test('el futuro compuesto de subjuntivo usa «hubiere»', () => {
    expect(conjugarVerbo('cantar')!.subjuntivo.futuro_perfecto[YO]).toBe('hubiere cantado');
    expect(conjugarVerbo('decir')!.subjuntivo.futuro_perfecto[VOSOTROS]).toBe('hubiereis dicho');
  });

  test('ninguna forma del futuro de subjuntivo conserva la -a- del imperfecto', () => {
    const sospechosas: string[] = [];
    for (const [infinitivo, simple] of Object.entries(verbosIrregulares)) {
      for (const forma of expandirConCompuestos(simple).subjuntivo.futuro) {
        if (/ra(s|mos|is|n)?$/.test(forma)) sospechosas.push(`${infinitivo}: ${forma}`);
      }
    }
    expect(sospechosas).toEqual([]);
  });
});

test.describe('La promesa del título se puede contar', () => {
  test('17 tiempos: 10 de indicativo, 6 de subjuntivo y 1 de imperativo', () => {
    expect(Object.keys(TIEMPOS.indicativo)).toHaveLength(10);
    expect(Object.keys(TIEMPOS.subjuntivo)).toHaveLength(6);
    // El imperativo es UN tiempo con dos formas, afirmativa y negativa.
    expect(Object.keys(TIEMPOS.imperativo)).toHaveLength(2);
  });

  test('cada tiempo declarado en TIEMPOS tiene sus seis personas, regular o irregular', () => {
    for (const verbo of ['cantar', 'comer', 'vivir', 'ser', 'ir', 'decir']) {
      const conj = conjugarVerbo(verbo)!;
      for (const clave of Object.keys(TIEMPOS.indicativo)) {
        const formas = conj.indicativo[clave as keyof typeof conj.indicativo];
        expect(formas, `${verbo} → indicativo.${clave}`).toHaveLength(PRONOMBRES.length);
        expect(formas.every((f) => f.trim().length > 0), `${verbo} → indicativo.${clave}`).toBe(true);
      }
      for (const clave of Object.keys(TIEMPOS.subjuntivo)) {
        const formas = conj.subjuntivo[clave as keyof typeof conj.subjuntivo];
        expect(formas, `${verbo} → subjuntivo.${clave}`).toHaveLength(PRONOMBRES.length);
        expect(formas.every((f) => f.trim().length > 0), `${verbo} → subjuntivo.${clave}`).toBe(true);
      }
    }
  });
});

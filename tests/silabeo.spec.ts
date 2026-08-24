/**
 * Tests unitarios del silabeador — `app/contador-silabas/silabeo.ts`
 *
 * Ninguna separación de este fichero sale del código: todas están resueltas a mano contra la
 * Ortografía de la lengua española (RAE, 2010) y el Diccionario panhispánico de dudas, y
 * varias vienen literalmente del acta del Inspector del 24/08/2026 (hallazgos 207-212).
 *
 * Ejecutar con: npx playwright test tests/silabeo.spec.ts
 */
import { test, expect } from '@playwright/test';
import { separarSilabas, encuentrosVocalicos } from '../app/contador-silabas/silabeo';

const sil = (p: string) => separarSilabas(p).join('-');

test.describe('separarSilabas — casos corrientes', () => {
  test('palabras llanas de estructura CV', () => {
    expect(sil('casa')).toBe('ca-sa');
    expect(sil('camino')).toBe('ca-mi-no');
    expect(sil('mesa')).toBe('me-sa');
  });

  test('una consonante entre vocales va con la sílaba siguiente', () => {
    expect(sil('examen')).toBe('e-xa-men');
    expect(sil('elefante')).toBe('e-le-fan-te');
  });

  test('los dígrafos ch, ll y rr no se parten', () => {
    expect(sil('muchacho')).toBe('mu-cha-cho');
    expect(sil('calle')).toBe('ca-lle');
    expect(sil('perro')).toBe('pe-rro');
    expect(sil('carro')).toBe('ca-rro');
  });

  test('consonante + l/r forman ataque y viajan juntas', () => {
    expect(sil('padre')).toBe('pa-dre');
    expect(sil('problema')).toBe('pro-ble-ma');
    expect(sil('aplauso')).toBe('a-plau-so');
  });

  test('dos consonantes que no forman grupo se reparten una a cada lado', () => {
    expect(sil('carta')).toBe('car-ta');
    expect(sil('campo')).toBe('cam-po');
    expect(sil('isla')).toBe('is-la');   // «sl» no es ataque en español
  });
});

/**
 * HALLAZGO 207 — la «u» muda de «qu» y «gü».
 *
 * Se trataba como una vocal más, así que la regla del hiato cortaba contra ella y devolvía
 * una «sílaba» sin ninguna vocal: a-qu-í, qu-í-mi-ca, es-qu-í, lin-gü-ís-ti-ca. La propia
 * FAQ de la app declara que toda sílaba tiene al menos una vocal.
 */
test.describe('separarSilabas — la u que no suena (hallazgo 207)', () => {
  test('«qu» ante e/i es una sola consonante', () => {
    expect(sil('aquí')).toBe('a-quí');
    expect(sil('química')).toBe('quí-mi-ca');
    expect(sil('esquí')).toBe('es-quí');
    expect(sil('queso')).toBe('que-so');
    expect(sil('esquema')).toBe('es-que-ma');
  });

  test('«gu» ante e/i también, pero «gü» con diéresis lleva vocal', () => {
    expect(sil('guerra')).toBe('gue-rra');
    expect(sil('guitarra')).toBe('gui-ta-rra');
    expect(sil('lingüística')).toBe('lin-güís-ti-ca');
    expect(sil('pingüino')).toBe('pin-güi-no');
  });

  test('ante a/o/u la «u» de «gu» sí es vocal', () => {
    expect(sil('guante')).toBe('guan-te');
    expect(sil('agua')).toBe('a-gua');
    expect(sil('uruguay')).toBe('u-ru-guay');
  });

  test('ninguna sílaba puede quedarse sin vocal', () => {
    const vocales = /[aeiouáéíóúü]/;
    for (const palabra of ['aquí', 'química', 'esquí', 'lingüística', 'guerra', 'quiosco']) {
      for (const silaba of separarSilabas(palabra)) {
        expect(silaba, `«${silaba}» de «${palabra}» no contiene ninguna vocal`).toMatch(vocales);
      }
    }
  });
});

/**
 * HALLAZGO 209 — la h intercalada no impide el diptongo.
 *
 * RAE, Ortografía 2010: ahu-mar, sahu-me-rio, prohi-bir, de-sahu-cio. El motor incluía la h
 * en su lista de consonantes y cortaba contra ella, devolviendo una sílaba de más. El caso
 * simétrico, donde la tilde sí crea hiato, ya lo acertaba (bú-ho) y tiene que seguir así.
 */
test.describe('separarSilabas — la h entre vocales (hallazgo 209)', () => {
  test('la h no rompe el diptongo', () => {
    expect(sil('ahumar')).toBe('ahu-mar');
    expect(sil('prohibir')).toBe('prohi-bir');
    expect(sil('desahucio')).toBe('de-sahu-cio');
    expect(sil('sahumerio')).toBe('sahu-me-rio');
  });

  test('cuando hay hiato de verdad, la h se va con la sílaba siguiente', () => {
    expect(sil('búho')).toBe('bú-ho');
    expect(sil('ahora')).toBe('a-ho-ra');   // a-o es hiato de dos abiertas
  });

  test('la h inicial y la h tras consonante se comportan como consonantes normales', () => {
    expect(sil('hola')).toBe('ho-la');
    expect(sil('deshacer')).toBe('des-ha-cer');
  });
});

/**
 * HALLAZGO 210 — grupos de tres o más consonantes.
 *
 * El motor solo examinaba DOS consonantes seguidas: cerraba la sílaba tras la primera y
 * arrastraba el resto, dejando ataques imposibles en español (ab-strac-to, con-struir,
 * tran-spor-te). La regla: de tres consonantes, las dos últimas pasan a la derecha solo si
 * forman grupo inseparable; si no, van dos a la izquierda y una a la derecha.
 */
test.describe('separarSilabas — tres o más consonantes seguidas (hallazgo 210)', () => {
  test('los ocho casos del acta', () => {
    expect(sil('abstracto')).toBe('abs-trac-to');
    expect(sil('construir')).toBe('cons-truir');
    expect(sil('transporte')).toBe('trans-por-te');
    expect(sil('constar')).toBe('cons-tar');
    expect(sil('instituto')).toBe('ins-ti-tu-to');
    expect(sil('obstáculo')).toBe('obs-tá-cu-lo');
    expect(sil('perspectiva')).toBe('pers-pec-ti-va');
    expect(sil('inglés')).toBe('in-glés');   // «gl» sí es ataque
  });

  /**
   * Con cuatro o más consonantes la pregunta es la misma que con tres: si las DOS ÚLTIMAS
   * pueden abrir sílaba, viajan juntas; si no, solo pasa una. No es «dos y dos» siempre.
   * «st» no puede abrir sílaba en español, así que «tungsteno» es tungs-te-no y no
   * tung-ste-no, que es lo que salía hasta el 24/08/2026 (hallazgo 259 del Inspector).
   */
  test('con cuatro consonantes decide si las dos últimas pueden abrir sílaba', () => {
    expect(sil('substraer')).toBe('subs-tra-er');   // «tr» sí abre → viajan dos
    expect(sil('tungsteno')).toBe('tungs-te-no');   // «st» no abre → viaja una
    expect(sil('angstrom')).toBe('angs-trom');      // «tr» sí abre
  });
});

/**
 * Diptongos, triptongos e hiatos. La distinción tiene que sobrevivir a la tilde: dos vocales
 * cerradas distintas forman diptongo aunque una lleve tilde (RAE, a efectos ortográficos),
 * mientras que una cerrada tónica junto a una abierta siempre es hiato.
 */
test.describe('separarSilabas — diptongos, triptongos e hiatos', () => {
  test('diptongos', () => {
    expect(sil('cielo')).toBe('cie-lo');
    expect(sil('cuento')).toBe('cuen-to');
    expect(sil('aire')).toBe('ai-re');
    expect(sil('ciudad')).toBe('ciu-dad');
  });

  test('hiatos', () => {
    expect(sil('país')).toBe('pa-ís');
    expect(sil('día')).toBe('dí-a');
    expect(sil('baúl')).toBe('ba-úl');
    expect(sil('leer')).toBe('le-er');
    expect(sil('caos')).toBe('ca-os');
    expect(sil('teatro')).toBe('te-a-tro');
  });

  test('triptongos', () => {
    expect(sil('buey')).toBe('buey');
    expect(sil('averiguáis')).toBe('a-ve-ri-guáis');
    expect(sil('miau')).toBe('miau');
  });

  test('la «y» final funciona como vocal y la intervocálica como consonante', () => {
    expect(sil('rey')).toBe('rey');
    expect(sil('hoy')).toBe('hoy');
    expect(sil('mayo')).toBe('ma-yo');
  });
});

/**
 * HALLAZGO 212 — la app anunciaba en su JSON-LD «Identificación de diptongos, hiatos y
 * triptongos» y no marcaba ninguno.
 */
test.describe('encuentrosVocalicos', () => {
  test('nombra los diptongos y los triptongos', () => {
    expect(encuentrosVocalicos('cielo').diptongos).toEqual(['ie']);
    expect(encuentrosVocalicos('buey').triptongos).toEqual(['uey']);
    expect(encuentrosVocalicos('uruguay').triptongos).toEqual(['uay']);
  });

  test('nombra los hiatos, incluidos los que la h no rompe', () => {
    expect(encuentrosVocalicos('país').hiatos).toEqual(['a-í']);
    expect(encuentrosVocalicos('búho').hiatos).toEqual(['ú-o']);
    expect(encuentrosVocalicos('teatro').hiatos).toEqual(['e-a']);
  });

  test('la u muda de «qu» no aparece como encuentro vocálico', () => {
    const q = encuentrosVocalicos('aquí');
    expect(q.diptongos).toEqual([]);
    expect(q.hiatos).toEqual([]);
  });
});

test.describe('separarSilabas — entradas raras', () => {
  test('una palabra sin vocales no se parte', () => {
    expect(separarSilabas('psst')).toEqual(['psst']);
  });

  test('vacío y espacios', () => {
    expect(separarSilabas('')).toEqual([]);
    expect(separarSilabas('   ')).toEqual([]);
  });

  test('el resultado siempre reconstruye la palabra original', () => {
    const palabras = [
      'aquí', 'química', 'ahumar', 'abstracto', 'construir', 'perspectiva', 'lingüística',
      'uruguay', 'desahucio', 'buey', 'transporte', 'obstáculo', 'pingüino', 'deshacer',
    ];
    for (const p of palabras) {
      expect(separarSilabas(p).join('')).toBe(p);
    }
  });
});

/**
 * Tests unitarios del motor de rima — app/diccionario-rimas/rimas.ts
 *
 * La rima es fonética, no ortográfica, y el español tiene reglas que un
 * «comparar las últimas letras» se salta (diptongos, esdrújulas, seseo,
 * yeísmo). Cada caso de aquí viene de una de esas reglas.
 *
 * Ejecutar: npx playwright test tests/rimas.spec.ts
 */

import { test, expect } from '@playwright/test';

import {
  escandirPalabra,
  aFonemas,
  claveAsonante,
  indiceVacio,
  indexarBloque,
  buscarRimas,
} from '../app/diccionario-rimas/rimas';

const nucleoDe = (p: string) => escandirPalabra(p)?.nucleo;
const fonDist = (p: string) => aFonemas(escandirPalabra(p)!.nucleo, false);
const fonSeseo = (p: string) => aFonemas(escandirPalabra(p)!.nucleo, true);
const asonDe = (p: string) => claveAsonante(escandirPalabra(p)!);

test.describe('Núcleo de rima (desde la vocal tónica)', () => {
  test('agudas: el núcleo arranca en la última sílaba', () => {
    expect(nucleoDe('corazón')).toBe('ón');
    expect(nucleoDe('amor')).toBe('or');
  });

  test('llanas: arranca en la penúltima', () => {
    expect(nucleoDe('vaca')).toBe('aca');
    expect(nucleoDe('cabeza')).toBe('eza');
  });

  test('esdrújulas: arranca en la antepenúltima', () => {
    expect(nucleoDe('pájaro')).toBe('ájaro');
    expect(nucleoDe('lágrima')).toBe('ágrima');
  });

  test('en un diptongo la tónica es la vocal fuerte, no la primera', () => {
    // Si tomara la primera vocal saldría «uento» y no casaría con «viento»
    expect(nucleoDe('cuento')).toBe('ento');
    expect(nucleoDe('viento')).toBe('ento');
  });

  test('monosílabos: el núcleo es desde su única vocal', () => {
    expect(nucleoDe('sol')).toBe('ol');
    expect(nucleoDe('flor')).toBe('or');
  });
});

test.describe('Rima consonante: mismo sonido, distinta letra', () => {
  test('b y v son el mismo fonema', () => {
    expect(fonDist('tuvo')).toBe(fonDist('cubo'));
  });

  test('c ante a/o/u equivale a qu', () => {
    expect(fonDist('vaca')).toBe(fonDist('flaca'));
    expect(fonDist('toque')).toBe(fonDist('choque'));
  });

  test('g ante e/i equivale a j', () => {
    expect(fonDist('protege')).toBe(fonDist('hereje'));
  });

  test('la h es muda', () => {
    expect(fonDist('ahora')).toBe(fonDist('mora'));
  });

  test('yeísmo: ll e y suenan igual', () => {
    expect(fonDist('calló')).toBe(fonDist('cayó'));
  });

  test('rr y r simple NO son el mismo sonido', () => {
    expect(fonDist('carro')).not.toBe(fonDist('caro'));
  });

  test('palabras que no riman siguen sin rimar', () => {
    expect(fonDist('mesa')).not.toBe(fonDist('silla'));
  });
});

test.describe('Seseo: la variedad cambia el resultado', () => {
  test('con distinción (España peninsular) «taza» y «casa» no riman', () => {
    expect(fonDist('taza')).not.toBe(fonDist('casa'));
  });

  test('con seseo (Latinoamérica, Canarias) sí riman', () => {
    expect(fonSeseo('taza')).toBe(fonSeseo('casa'));
  });

  test('la z con z rima en ambas variedades', () => {
    expect(fonDist('cabeza')).toBe(fonDist('pereza'));
    expect(fonSeseo('cabeza')).toBe(fonSeseo('pereza'));
  });
});

test.describe('Rima asonante: solo las vocales', () => {
  test('en las esdrújulas la vocal intermedia no cuenta', () => {
    // Regla clásica: «pájaro» (a-a-o) asuena con «campo» (a-o)
    expect(asonDe('pájaro')).toBe('ao');
    expect(asonDe('campo')).toBe('ao');
  });

  test('la i/u átona final se abre a e/o', () => {
    expect(asonDe('débil')).toBe(asonDe('verde'));
    expect(asonDe('tribu')).toBe(asonDe('siglo'));
  });

  test('el diptongo átono cuenta solo con su vocal fuerte', () => {
    expect(asonDe('infancia')).toBe(asonDe('casa'));
  });

  test('vocales distintas no asuenan', () => {
    expect(asonDe('campo')).not.toBe(asonDe('cielo'));
  });
});

test.describe('Búsqueda sobre un índice', () => {
  const PALABRAS = [
    'corazón', 'razón', 'canción', 'pasión', 'melón',
    'vaca', 'flaca', 'placa', 'casa', 'taza',
    'pájaro', 'campo', 'cielo', 'vuelo', 'suelo', 'consuelo', 'cuento', 'viento',
  ];

  const indice = indiceVacio();
  indexarBloque(indice, PALABRAS);

  test('encuentra las consonantes y excluye la propia palabra', () => {
    const r = buscarRimas(indice, 'corazón', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    const palabras = r!.palabras.map((p) => p.palabra);
    expect(palabras).toContain('razón');
    expect(palabras).toContain('canción');
    expect(palabras).not.toContain('corazón');
  });

  test('el diptongo encuentra a su pareja', () => {
    const r = buscarRimas(indice, 'cuento', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    expect(r!.palabras.map((p) => p.palabra)).toContain('viento');
  });

  test('el filtro por número de sílabas acota sin inventar', () => {
    const r = buscarRimas(indice, 'cielo', 'consonante', false, {
      silabas: 2,
      acentuacion: null,
    });
    expect(r!.palabras.map((p) => p.palabra)).toEqual(['suelo', 'vuelo']);
    expect(r!.totalSinFiltrar).toBeGreaterThan(r!.palabras.length);
  });

  test('la asonante no repite lo que ya es consonante', () => {
    const r = buscarRimas(indice, 'vaca', 'asonante', false, {
      silabas: null,
      acentuacion: null,
    });
    const palabras = r!.palabras.map((p) => p.palabra);
    expect(palabras).toContain('casa');
    expect(palabras).not.toContain('flaca'); // esa es consonante
  });

  test('el seseo amplía el resultado en Latinoamérica', () => {
    const sin = buscarRimas(indice, 'casa', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    const con = buscarRimas(indice, 'casa', 'consonante', true, {
      silabas: null,
      acentuacion: null,
    });
    expect(sin!.palabras.map((p) => p.palabra)).not.toContain('taza');
    expect(con!.palabras.map((p) => p.palabra)).toContain('taza');
  });

  test('la rima rica va antes que la pobre', () => {
    // «razón» comparte «-azón» con «corazón»; «melón» solo «-ón». Sin este
    // orden, el alfabético dejaría arriba las rarezas del diccionario.
    const r = buscarRimas(indice, 'corazón', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    const palabras = r!.palabras.map((p) => p.palabra);
    expect(palabras.indexOf('razón')).toBeLessThan(palabras.indexOf('melón'));
  });

  test('rimar con una derivada es rima pobre: va detrás', () => {
    const conDerivada = indiceVacio();
    indexarBloque(conDerivada, ['vida', 'movida', 'brida', 'huida']);
    const r = buscarRimas(conDerivada, 'vida', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    expect(r!.palabras[r!.palabras.length - 1].palabra).toBe('movida');
  });

  test('un monosílabo no convierte en derivada a quien acaba igual', () => {
    // «amar» acaba en «mar» por casualidad, no por familia léxica
    const conMar = indiceVacio();
    indexarBloque(conMar, ['mar', 'amar', 'bar']);
    const r = buscarRimas(conMar, 'mar', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    expect(r!.palabras[0].palabra).toBe('amar');
  });

  test('una palabra sin rimas devuelve lista vacía, no error', () => {
    const r = buscarRimas(indice, 'zzzz', 'consonante', false, {
      silabas: null,
      acentuacion: null,
    });
    expect(r!.palabras).toEqual([]);
  });
});

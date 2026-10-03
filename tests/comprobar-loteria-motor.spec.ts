import { test, expect } from '@playwright/test';
import { comprobarApuesta, validarSorteo, leerBola, textoVeredicto, type Sorteo } from '../app/generador-loteria/comprobar';

/**
 * Motor de comprobación de generador-loteria (S0176) — casos resueltos A MANO antes
 * de escribir la vista.
 *
 * El oráculo es contar coincidencias entre dos listas cortas y leer la tabla oficial de
 * categorías de cada modalidad (fuentes en la cabecera de app/generador-loteria/comprobar.ts).
 * Cada sorteo de abajo es inventado; cada apuesta está construida para caer en UNA casilla
 * concreta de su tabla, y el comentario dice cuál y por qué.
 *
 * Los dos casos que más fácil se rompen:
 *   · Primitiva con 5 aciertos: sube a 2.ª solo si el SEXTO número de la apuesta es el
 *     complementario. Con 4 aciertos el complementario no cuenta, aunque esté.
 *   · Bonoloto con 6 aciertos y reintegro: es 1.ª, no «especial» — la categoría especial
 *     es solo de La Primitiva.
 */

test.describe('La Primitiva — sorteo 3 12 25 33 41 48 · C 7 · R 5', () => {
  const sorteo: Sorteo = { principales: [3, 12, 25, 33, 41, 48], complementario: 7, reintegro: 5 };

  test('6 aciertos + reintegro → categoría especial', () => {
    const c = comprobarApuesta('primitiva', { principales: [3, 12, 25, 33, 41, 48], extras: [5] }, sorteo);
    expect(c.acertados).toHaveLength(6);
    expect(c.reintegro).toBe(true);
    expect(c.categoria?.nombre).toBe('Categoría especial');
  });

  test('6 aciertos sin reintegro → 1.ª', () => {
    const c = comprobarApuesta('primitiva', { principales: [3, 12, 25, 33, 41, 48], extras: [2] }, sorteo);
    expect(c.reintegro).toBe(false);
    expect(c.categoria).toEqual({ nombre: '1.ª categoría', requisito: '6 aciertos' });
  });

  test('5 aciertos y el sexto es el complementario (7) → 2.ª', () => {
    const c = comprobarApuesta('primitiva', { principales: [3, 7, 12, 25, 33, 41], extras: [0] }, sorteo);
    expect(c.acertados).toEqual([3, 12, 25, 33, 41]);
    expect(c.conComplementario).toBe(true);
    expect(c.categoria).toEqual({ nombre: '2.ª categoría', requisito: '5 aciertos + complementario' });
  });

  test('5 aciertos sin complementario → 3.ª', () => {
    const c = comprobarApuesta('primitiva', { principales: [3, 9, 12, 25, 33, 41], extras: [0] }, sorteo);
    expect(c.categoria?.nombre).toBe('3.ª categoría');
  });

  test('4 aciertos con el complementario dentro → 4.ª (el complementario solo cuenta con 5)', () => {
    const c = comprobarApuesta('primitiva', { principales: [3, 7, 9, 12, 25, 33], extras: [0] }, sorteo);
    expect(c.acertados).toHaveLength(4);
    expect(c.conComplementario).toBe(true);
    expect(c.categoria?.nombre).toBe('4.ª categoría');
  });

  test('3 aciertos + reintegro → 5.ª y reintegro, por separado', () => {
    const c = comprobarApuesta('primitiva', { principales: [1, 2, 3, 4, 12, 25], extras: [5] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '5.ª categoría', requisito: '3 aciertos' });
    expect(c.reintegro).toBe(true);
  });

  test('0 aciertos + reintegro → sin categoría, solo reintegro', () => {
    const c = comprobarApuesta('primitiva', { principales: [1, 2, 4, 6, 8, 10], extras: [5] }, sorteo);
    expect(c.acertados).toEqual([]);
    expect(c.categoria).toBeNull();
    expect(c.reintegro).toBe(true);
  });

  test('2 aciertos → sin premio', () => {
    const c = comprobarApuesta('primitiva', { principales: [1, 2, 3, 4, 6, 12], extras: [9] }, sorteo);
    expect(c.acertados).toEqual([3, 12]);
    expect(c.categoria).toBeNull();
    expect(c.reintegro).toBe(false);
  });
});

test.describe('Bonoloto — mismo sorteo, sin categoría especial', () => {
  const sorteo: Sorteo = { principales: [3, 12, 25, 33, 41, 48], complementario: 7, reintegro: 5 };

  test('6 aciertos + reintegro → 1.ª, no «especial»', () => {
    const c = comprobarApuesta('bonoloto', { principales: [3, 12, 25, 33, 41, 48], extras: [5] }, sorteo);
    expect(c.categoria?.nombre).toBe('1.ª categoría');
    expect(c.reintegro).toBe(true);
  });

  test('5 aciertos + complementario → 2.ª', () => {
    const c = comprobarApuesta('bonoloto', { principales: [3, 7, 12, 25, 33, 41], extras: [1] }, sorteo);
    expect(c.categoria?.nombre).toBe('2.ª categoría');
  });
});

test.describe('Euromillones — sorteo 5 14 23 37 44 · estrellas 3 11', () => {
  const sorteo: Sorteo = { principales: [5, 14, 23, 37, 44], extras: [3, 11] };

  test('5 + 2 → 1.ª', () => {
    const c = comprobarApuesta('euromillones', { principales: [5, 14, 23, 37, 44], extras: [3, 11] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '1.ª categoría', requisito: '5 aciertos + 2 estrellas' });
    expect(c.reintegro).toBe(false);
  });

  test('5 + 1 → 2.ª', () => {
    const c = comprobarApuesta('euromillones', { principales: [5, 14, 23, 37, 44], extras: [3, 7] }, sorteo);
    expect(c.extrasAcertados).toEqual([3]);
    expect(c.categoria).toEqual({ nombre: '2.ª categoría', requisito: '5 aciertos + 1 estrella' });
  });

  test('4 + 0 → 7.ª (va por detrás de 3 + 2, que es 6.ª)', () => {
    const c = comprobarApuesta('euromillones', { principales: [1, 5, 14, 23, 37], extras: [2, 9] }, sorteo);
    expect(c.categoria?.nombre).toBe('7.ª categoría');
  });

  test('1 + 2 → 11.ª', () => {
    const c = comprobarApuesta('euromillones', { principales: [1, 2, 4, 5, 6], extras: [3, 11] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '11.ª categoría', requisito: '1 acierto + 2 estrellas' });
  });

  test('2 + 1 → 12.ª', () => {
    const c = comprobarApuesta('euromillones', { principales: [1, 2, 3, 5, 14], extras: [1, 3] }, sorteo);
    expect(c.categoria?.nombre).toBe('12.ª categoría');
  });

  test('2 + 0 → 13.ª, la última', () => {
    const c = comprobarApuesta('euromillones', { principales: [1, 2, 3, 5, 14], extras: [1, 2] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '13.ª categoría', requisito: '2 aciertos' });
  });

  test('1 + 1 → sin premio', () => {
    const c = comprobarApuesta('euromillones', { principales: [1, 2, 3, 4, 5], extras: [1, 11] }, sorteo);
    expect(c.categoria).toBeNull();
  });
});

test.describe('El Gordo de la Primitiva — sorteo 7 19 28 40 52 · clave 4', () => {
  const sorteo: Sorteo = { principales: [7, 19, 28, 40, 52], extras: [4] };

  test('5 + clave → 1.ª, y la clave da además el reintegro (norma 68.ª)', () => {
    const c = comprobarApuesta('gordo', { principales: [7, 19, 28, 40, 52], extras: [4] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '1.ª categoría', requisito: '5 aciertos + clave' });
    expect(c.reintegro).toBe(true);
  });

  test('3 + clave → 5.ª', () => {
    const c = comprobarApuesta('gordo', { principales: [1, 2, 7, 19, 28], extras: [4] }, sorteo);
    expect(c.categoria?.nombre).toBe('5.ª categoría');
  });

  test('2 sin clave → 8.ª', () => {
    const c = comprobarApuesta('gordo', { principales: [1, 2, 3, 7, 19], extras: [0] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '8.ª categoría', requisito: '2 aciertos' });
    expect(c.reintegro).toBe(false);
  });

  test('1 + clave → sin categoría, pero reintegro', () => {
    const c = comprobarApuesta('gordo', { principales: [1, 2, 3, 5, 7], extras: [4] }, sorteo);
    expect(c.categoria).toBeNull();
    expect(c.reintegro).toBe(true);
  });
});

test.describe('Lototurf — sorteo 2 9 15 22 27 31 · caballo 6', () => {
  const sorteo: Sorteo = { principales: [2, 9, 15, 22, 27, 31], extras: [6] };

  test('6 + caballo → 1.ª; el reintegro no se puede comprobar', () => {
    const c = comprobarApuesta('lototurf', { principales: [2, 9, 15, 22, 27, 31], extras: [6] }, sorteo);
    expect(c.categoria).toEqual({ nombre: '1.ª categoría', requisito: '6 aciertos + caballo' });
    expect(c.reintegro).toBeNull();
  });

  test('3 + caballo → 7.ª', () => {
    const c = comprobarApuesta('lototurf', { principales: [1, 2, 3, 4, 9, 15], extras: [6] }, sorteo);
    expect(c.categoria?.nombre).toBe('7.ª categoría');
  });

  test('3 sin caballo → sin premio (no hay categoría 3 + 0)', () => {
    const c = comprobarApuesta('lototurf', { principales: [1, 2, 3, 4, 9, 15], extras: [5] }, sorteo);
    expect(c.categoria).toBeNull();
  });

  test('4 sin caballo → 6.ª', () => {
    const c = comprobarApuesta('lototurf', { principales: [1, 2, 9, 15, 22, 30], extras: [5] }, sorteo);
    expect(c.categoria?.nombre).toBe('6.ª categoría');
  });
});

test.describe('Veredicto en una línea', () => {
  const primitiva: Sorteo = { principales: [3, 12, 25, 33, 41, 48], complementario: 7, reintegro: 5 };
  const gordo: Sorteo = { principales: [7, 19, 28, 40, 52], extras: [4] };
  const euro: Sorteo = { principales: [5, 14, 23, 37, 44], extras: [3, 11] };

  test('categoría y reintegro van unidos con «y», sin sumar nada', () => {
    const c = comprobarApuesta('primitiva', { principales: [1, 2, 3, 4, 12, 25], extras: [5] }, primitiva);
    expect(textoVeredicto('primitiva', c)).toBe('5.ª categoría (3 aciertos) y reintegro');
  });

  test('categoría especial: el reintegro no se repite detrás', () => {
    const c = comprobarApuesta('primitiva', { principales: [3, 12, 25, 33, 41, 48], extras: [5] }, primitiva);
    expect(textoVeredicto('primitiva', c)).toBe('Categoría especial (6 aciertos + reintegro)');
  });

  test('El Gordo: 1.ª con clave y además reintegro (norma 68.ª, «sin perjuicio»)', () => {
    const c = comprobarApuesta('gordo', { principales: [7, 19, 28, 40, 52], extras: [4] }, gordo);
    expect(textoVeredicto('gordo', c)).toBe('1.ª categoría (5 aciertos + clave) y reintegro');
  });

  test('solo reintegro', () => {
    const c = comprobarApuesta('gordo', { principales: [1, 2, 3, 5, 7], extras: [4] }, gordo);
    expect(textoVeredicto('gordo', c)).toBe('Reintegro (1 acierto + clave, sin premio de categoría)');
  });

  test('sin premio, con lo acertado en palabras', () => {
    const c = comprobarApuesta('euromillones', { principales: [1, 2, 3, 4, 5], extras: [1, 11] }, euro);
    expect(textoVeredicto('euromillones', c)).toBe('Sin premio (1 acierto + 1 estrella)');
    const cero = comprobarApuesta('primitiva', { principales: [1, 2, 4, 6, 8, 10], extras: [9] }, primitiva);
    expect(textoVeredicto('primitiva', cero)).toBe('Sin premio (0 aciertos)');
  });
});

test.describe('Lectura y validación de lo tecleado', () => {
  test('leerBola: solo una o dos cifras', () => {
    expect(leerBola(' 7 ')).toBe(7);
    expect(leerBola('49')).toBe(49);
    expect(leerBola('0')).toBe(0);
    expect(leerBola('')).toBeNull();
    expect(leerBola('12abc')).toBeNull();
    expect(leerBola('1,5')).toBeNull();
    expect(leerBola('-3')).toBeNull();
    expect(leerBola('007')).toBeNull();
  });

  const primitivaValida = { principales: ['3', '12', '25', '33', '41', '48'], complementario: '7', reintegro: '5', extras: [] };

  test('Primitiva completa → sorteo', () => {
    const r = validarSorteo('primitiva', primitivaValida);
    expect(r).toEqual({ ok: true, sorteo: { principales: [3, 12, 25, 33, 41, 48], complementario: 7, reintegro: 5 } });
  });

  test('número repetido → error', () => {
    const r = validarSorteo('primitiva', { ...primitivaValida, principales: ['3', '12', '25', '33', '41', '3'] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('repetido');
  });

  test('fuera de rango (50 en la Primitiva) → error', () => {
    const r = validarSorteo('primitiva', { ...primitivaValida, principales: ['3', '12', '25', '33', '41', '50'] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('del 1 al 49');
  });

  test('complementario dentro de la combinación → error', () => {
    const r = validarSorteo('primitiva', { ...primitivaValida, complementario: '12' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('complementario');
  });

  test('reintegro de dos cifras → error', () => {
    const r = validarSorteo('primitiva', { ...primitivaValida, reintegro: '10' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('del 0 al 9');
  });

  test('casilla a medias («12abc») → error, no 12', () => {
    const r = validarSorteo('primitiva', { ...primitivaValida, principales: ['3', '12abc', '25', '33', '41', '48'] });
    expect(r.ok).toBe(false);
  });

  test('Euromillones: estrella 13 o estrellas iguales → error', () => {
    const base = { principales: ['5', '14', '23', '37', '44'], complementario: '', reintegro: '', extras: ['3', '11'] };
    expect(validarSorteo('euromillones', base)).toEqual({ ok: true, sorteo: { principales: [5, 14, 23, 37, 44], extras: [3, 11] } });
    const fuera = validarSorteo('euromillones', { ...base, extras: ['3', '13'] });
    expect(fuera.ok).toBe(false);
    const iguales = validarSorteo('euromillones', { ...base, extras: ['3', '3'] });
    expect(iguales.ok).toBe(false);
    if (!iguales.ok) expect(iguales.error).toContain('estrellas');
  });

  test('Gordo: la clave admite el 0; Lototurf: el caballo no', () => {
    const gordo = validarSorteo('gordo', { principales: ['7', '19', '28', '40', '52'], complementario: '', reintegro: '', extras: ['0'] });
    expect(gordo.ok).toBe(true);
    const turf = validarSorteo('lototurf', { principales: ['2', '9', '15', '22', '27', '31'], complementario: '', reintegro: '', extras: ['0'] });
    expect(turf.ok).toBe(false);
  });
});

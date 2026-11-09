import { test, expect } from '@playwright/test';
import {
  TAMANOS,
  agruparRespuestas,
  comprobarCarton,
  crearAleatorio,
  enJuegoPara,
  generarSumasRestas,
  generarTablas,
  leerListaPropia,
  minimoPara,
  prepararPartida,
  sacarBola,
  tamanoDisponible,
  type CartonJuego,
  type Tamano,
} from '../app/bingo-personalizado/motor';
import { LISTAS, elementosDeLista } from '../app/bingo-personalizado/listas';

/**
 * Motor del Bingo Personalizado (S0263, 09/11/2026) — casos resueltos A MANO antes de la vista.
 *
 *  · Mínimos por tamaño = ⌈1,5 × casillas⌉: 3×3 → 14 · 3×4 → 18 · 3×5 → 23 (22,5) · 3×6 → 27 ·
 *    4×4 → 24 · 5×5 → 38 (37,5).
 *  · Tablas del 2 y del 3, del ×1 al ×10: los pares 2…20 (10 respuestas) más los múltiplos de 3
 *    que no están ya: 3, 9, 15, 21, 24, 27, 30 (7) → 17 respuestas. El 6 sale de 2 × 3 y 3 × 2.
 *  · Sumas y restas hasta 20 (operandos desde 1): las sumas dan 2…20 y las restas 1…19 → 20.
 *    Hasta 100 (operandos desde 2): sumas 4…100, restas 1…98 → 100.
 */

const tam = (id: string): Tamano => {
  const t = TAMANOS.find((x) => x.id === id);
  if (!t) throw new Error(`tamaño ${id} inexistente`);
  return t;
};

test.describe('tamaños', () => {
  test('mínimo de respuestas = 1,5 veces las casillas, redondeado hacia arriba', () => {
    expect(TAMANOS.map((t) => [t.id, minimoPara(t)])).toEqual([
      ['3x3', 14], ['3x4', 18], ['3x5', 23], ['3x6', 27], ['4x4', 24], ['5x5', 38],
    ]);
  });

  test('en juego entra el doble de casillas, o todo si la lista no llega', () => {
    expect(enJuegoPara(100, tam('3x5'))).toBe(30);
    expect(enJuegoPara(20, tam('3x4'))).toBe(20);
  });
});

test.describe('listas de cálculo', () => {
  test('tablas del 2 y del 3: 17 respuestas, y el 6 se canta como 2 × 3 o 3 × 2', () => {
    const r = agruparRespuestas(generarTablas([2, 3]));
    expect(r).toHaveLength(17);
    expect(r.find((x) => x.carton === '6')?.preguntas.sort()).toEqual(['2 × 3', '3 × 2']);
    expect(tamanoDisponible(17, tam('3x3'))).toBe(true);
    expect(tamanoDisponible(17, tam('3x4'))).toBe(false);
  });

  test('cada pregunta de las tablas da su casilla', () => {
    for (const e of generarTablas([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) {
      const [a, b] = e.canta.split(' × ').map(Number);
      expect(String(a * b)).toBe(e.carton);
    }
  });

  test('sumas y restas hasta 20: respuestas del 1 al 20, solo admite 3×3 y 3×4', () => {
    const r = agruparRespuestas(generarSumasRestas(20, 1));
    expect(r.map((x) => Number(x.carton)).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    expect(TAMANOS.filter((t) => tamanoDisponible(r.length, t)).map((t) => t.id)).toEqual(['3x3', '3x4']);
  });

  test('sumas y restas hasta 100: 100 respuestas, y cada operación da su casilla', () => {
    const elementos = generarSumasRestas(100, 2);
    expect(agruparRespuestas(elementos)).toHaveLength(100);
    for (const e of elementos) {
      const suma = e.canta.match(/^(\d+) \+ (\d+)$/);
      const resta = e.canta.match(/^(\d+) − (\d+)$/);
      const valor = suma ? Number(suma[1]) + Number(suma[2]) : Number(resta?.[1]) - Number(resta?.[2]);
      expect(String(valor)).toBe(e.carton);
      expect(valor).toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe('listas de palabras', () => {
  test('ninguna lista de palabras repite casilla ni deja una vacía', () => {
    for (const id of ['ingles', 'capitales', 'quimica', 'animales', 'comida', 'navidad']) {
      const elementos = elementosDeLista(id, []);
      expect(agruparRespuestas(elementos), id).toHaveLength(elementos.length);
      for (const e of elementos) expect(e.canta.trim() && e.carton.trim(), id).toBeTruthy();
    }
  });

  test('tamaños que admite cada lista, con sus cuentas hechas a mano', () => {
    const admitidos = (id: string) =>
      TAMANOS.filter((t) => tamanoDisponible(agruparRespuestas(elementosDeLista(id, [])).length, t)).map((t) => t.id);
    const todos = ['3x3', '3x4', '3x5', '3x6', '4x4', '5x5'];
    // 47 · 51 · 44 · 39 elementos: todas pasan de 38 → los seis tamaños
    for (const id of ['ingles', 'capitales', 'animales', 'comida']) expect(admitidos(id), id).toEqual(todos);
    // Navidad: 32 → llega a 3×6 (27) y 4×4 (24), no a 5×5 (38)
    expect(elementosDeLista('navidad', [])).toHaveLength(32);
    expect(admitidos('navidad')).toEqual(['3x3', '3x4', '3x5', '3x6', '4x4']);
    expect(elementosDeLista('ingles', [])).toHaveLength(47);
    expect(elementosDeLista('capitales', [])).toHaveLength(51);
    expect(elementosDeLista('animales', [])).toHaveLength(44);
    expect(elementosDeLista('comida', [])).toHaveLength(39);
  });

  test('las nueve listas del selector tienen elementos', () => {
    expect(LISTAS).toHaveLength(9);
    for (const l of LISTAS) expect(elementosDeLista(l.id, [2, 3]).length, l.id).toBeGreaterThan(0);
  });
});

test.describe('lista propia', () => {
  test('«pregunta = respuesta», línea sola, espacios y repetidas', () => {
    const l = leerListaPropia('gato = cat\r\nperro=dog\n\n   sol   radiante  \nsol radiante\nGATO = CAT');
    expect(l.elementos).toEqual([
      { canta: 'gato', carton: 'cat' },
      { canta: 'perro', carton: 'dog' },
      { canta: 'sol radiante', carton: 'sol radiante' },
    ]);
    expect(l.repetidas).toBe(2); // «sol radiante» y «GATO = CAT» (mayúsculas no cuentan)
  });

  test('se parte en el PRIMER «=» y avisa de las respuestas compartidas', () => {
    const l = leerListaPropia('2 + 2 = 4\n3 + 1 = 4\nx = y = z');
    expect(l.elementos[2]).toEqual({ canta: 'x', carton: 'y = z' });
    expect(l.respuestasCompartidas).toBe(1); // el 4
  });

  test('una línea con «=» pero un lado vacío no entra', () => {
    expect(leerListaPropia('= cat\ngato =\nperro').elementos).toEqual([{ canta: 'perro', carton: 'perro' }]);
  });
});

test.describe('partida', () => {
  const respuestas = agruparRespuestas(generarSumasRestas(100, 2));

  test('el mismo número de partida da los mismos cartones; otro número, otros', () => {
    const a = prepararPartida(respuestas, tam('3x5'), 10, 4242);
    const b = prepararPartida(respuestas, tam('3x5'), 10, 4242);
    const c = prepararPartida(respuestas, tam('3x5'), 10, 4243);
    expect(b).toEqual(a);
    expect(c.cartones).not.toEqual(a.cartones);
  });

  test('cartones distintos, con la forma del tamaño y casillas sin repetir', () => {
    const p = prepararPartida(respuestas, tam('3x6'), 40, 7);
    expect(p.enJuego).toHaveLength(36);
    expect(p.cartones).toHaveLength(40);
    const firmas = new Set<string>();
    for (const c of p.cartones) {
      expect(c.casillas).toHaveLength(3);
      for (const fila of c.casillas) expect(fila).toHaveLength(6);
      const todas = c.casillas.flat();
      expect(new Set(todas).size).toBe(18);
      for (const i of todas) expect(i).toBeLessThan(36);
      firmas.add([...todas].sort((x, y) => x - y).join(','));
    }
    expect(firmas.size).toBe(40);
  });

  test('un tamaño que la lista no llena da una partida vacía', () => {
    const p = prepararPartida(agruparRespuestas(generarTablas([2])), tam('3x3'), 5, 1);
    expect(p).toEqual({ enJuego: [], cartones: [] });
  });

  test('el bombo saca cada respuesta una sola vez y canta una de sus preguntas', () => {
    const p = prepararPartida(agruparRespuestas(generarTablas([2, 3, 4])), tam('3x3'), 3, 99);
    const salidas = new Set<number>();
    const azar = crearAleatorio(5);
    for (let n = 0; n < p.enJuego.length; n++) {
      const bola = sacarBola(p, salidas, azar);
      expect(bola).not.toBeNull();
      if (!bola) break;
      expect(salidas.has(bola.indice)).toBe(false);
      expect(p.enJuego[bola.indice].preguntas).toContain(bola.pregunta);
      salidas.add(bola.indice);
    }
    expect(sacarBola(p, salidas, azar)).toBeNull();
  });
});

test.describe('comprobar un cartón', () => {
  const carton: CartonJuego = { numero: 1, casillas: [[0, 1, 2], [3, 4, 5], [6, 7, 8]] };

  test('fila 2 completa y el 0 suelto: línea, no lleno, faltan 5 (dos de la fila 1 y la fila 3 entera)', () => {
    expect(comprobarCarton(carton, new Set([3, 4, 5, 0]))).toEqual({ filasCompletas: [2], lleno: false, faltan: 5 });
  });

  test('todas las casillas: lleno, con las tres filas', () => {
    expect(comprobarCarton(carton, new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 20]))).toEqual({
      filasCompletas: [1, 2, 3],
      lleno: true,
      faltan: 0,
    });
  });

  test('una columna completa NO es línea: la línea es siempre horizontal', () => {
    expect(comprobarCarton(carton, new Set([0, 3, 6])).filasCompletas).toEqual([]);
  });
});

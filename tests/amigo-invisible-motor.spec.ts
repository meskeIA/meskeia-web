import { test, expect } from '@playwright/test';
import {
  sortear, existeReparto, matrizPermitidos, repartoValido, leerParticipantes,
  codificarEnlace, decodificarEnlace, fechaEspanola, type Exclusion, type ResultadoSorteo,
} from '../app/sorteo-amigo-invisible/motor';

/**
 * Motor del sorteo del amigo invisible (S0239) — casos resueltos A MANO antes de la vista.
 *
 * Participantes por índice: 0 = A, 1 = B, 2 = C, 3 = D. Con 4 personas hay 9 repartos sin que
 * nadie se toque a sí mismo (los desarreglos de 4): 6 ciclos de cuatro (A→B→C→D→A y sus
 * variantes) y 3 dobles parejas (A↔B con C↔D, A↔C con B↔D, A↔D con B↔C). «Sin regalos
 * mutuos» deja solo los 6 ciclos. Con 3 personas solo hay 2 repartos, y ninguno es mutuo.
 */

/** mulberry32: azar con semilla, para que cada caso sea reproducible. */
function rng(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ok(r: ResultadoSorteo): number[] {
  if (!r.ok) throw new Error(`Se esperaba un reparto y salió: ${r.motivo}`);
  return r.asignacion;
}

const mutuas = (pares: [number, number][]): Exclusion[] => pares.flatMap(([x, y]) => [{ de: x, a: y }, { de: y, a: x }]);

test.describe('Casos límite del sorteo', () => {
  test('con 2 personas no hay sorteo: cada una sabría a quién le toca', () => {
    expect(sortear(2, [], { sinMutuos: false }, rng(1))).toEqual({ ok: false, motivo: 'pocos' });
  });

  test('A no puede regalar ni a B ni a C → sin opciones, y se nombra a A', () => {
    const r = sortear(3, [{ de: 0, a: 1 }, { de: 0, a: 2 }], { sinMutuos: false }, rng(1));
    expect(r).toEqual({ ok: false, motivo: 'sin-opciones', indice: 0 });
  });

  test('ni A ni C pueden regalar a B → B se queda sin regalo, y se nombra a B', () => {
    const r = sortear(3, [{ de: 0, a: 1 }, { de: 2, a: 1 }], { sinMutuos: false }, rng(1));
    expect(r).toEqual({ ok: false, motivo: 'sin-regalador', indice: 1 });
  });

  test('A y B solo pueden regalar a C → nadie se queda a cero, pero no hay reparto', () => {
    // A: excluye B y D → solo C. B: excluye A y D → solo C. Dos personas para un solo destinatario.
    const ex: Exclusion[] = [{ de: 0, a: 1 }, { de: 0, a: 3 }, { de: 1, a: 0 }, { de: 1, a: 3 }];
    expect(existeReparto(matrizPermitidos(4, ex))).toBe(false);
    expect(sortear(4, ex, { sinMutuos: false }, rng(1))).toEqual({ ok: false, motivo: 'imposible' });
  });

  test('A solo puede regalar a B y B solo a A: vale, salvo que se prohíban los mutuos', () => {
    const ex: Exclusion[] = [{ de: 0, a: 2 }, { de: 0, a: 3 }, { de: 1, a: 2 }, { de: 1, a: 3 }];
    const a = ok(sortear(4, ex, { sinMutuos: false }, rng(7)));
    expect(a).toEqual([1, 0, 3, 2]);
    expect(sortear(4, ex, { sinMutuos: true }, rng(7))).toEqual({ ok: false, motivo: 'imposible' });
  });
});

test.describe('Repartos válidos', () => {
  test('3 personas sin exclusiones: siempre uno de los dos ciclos, nunca a sí mismo', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 200; s++) {
      const a = ok(sortear(3, [], { sinMutuos: false }, rng(s)));
      vistos.add(a.join(','));
    }
    expect([...vistos].sort()).toEqual(['1,2,0', '2,0,1']);
  });

  test('4 personas «sin mutuos»: salen los 6 ciclos de cuatro y ninguna doble pareja', () => {
    const vistos = new Set<string>();
    for (let s = 1; s <= 600; s++) {
      const a = ok(sortear(4, [], { sinMutuos: true }, rng(s)));
      for (let i = 0; i < 4; i++) expect(a[a[i]]).not.toBe(i);
      vistos.add(a.join(','));
    }
    expect(vistos.size).toBe(6);
  });

  test('dos parejas (A↔B, C↔D) que no se regalan entre sí: cada uno regala a la otra pareja', () => {
    const ex = mutuas([[0, 1], [2, 3]]);
    for (let s = 1; s <= 100; s++) {
      const a = ok(sortear(4, ex, { sinMutuos: false }, rng(s)));
      expect([2, 3]).toContain(a[0]);
      expect([2, 3]).toContain(a[1]);
      expect([0, 1]).toContain(a[2]);
      expect([0, 1]).toContain(a[3]);
    }
  });

  test('las mismas dos parejas «sin mutuos»: solo queda el ciclo de cuatro cruzado', () => {
    // A→C obliga a C→B (C no puede volver a A ni regalar a D), y entonces B→D y D→A:
    // [2,3,1,0]. Por simetría, A→D da A→D→B→C→A: [3,2,0,1]. No hay más.
    const ex = mutuas([[0, 1], [2, 3]]);
    const vistos = new Set<string>();
    for (let s = 1; s <= 300; s++) {
      const a = ok(sortear(4, ex, { sinMutuos: true }, rng(s)));
      expect(repartoValido(a, matrizPermitidos(4, ex), { sinMutuos: true })).toBe(true);
      vistos.add(a.join(','));
    }
    expect([...vistos].sort()).toEqual(['2,3,1,0', '3,2,0,1']);
  });

  test('sin exclusiones, los 9 repartos de 4 personas salen con la misma frecuencia', () => {
    // 9.000 sorteos → 1.000 de media por reparto; con azar justo cae entre 880 y 1.120
    // (más de 4 desviaciones típicas de margen, √(9000·1/9·8/9) ≈ 29,8).
    const cuenta = new Map<string, number>();
    const azar = rng(2026);
    for (let t = 0; t < 9000; t++) {
      const k = ok(sortear(4, [], { sinMutuos: false }, azar)).join(',');
      cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
    }
    expect(cuenta.size).toBe(9);
    for (const n of cuenta.values()) {
      expect(n).toBeGreaterThan(880);
      expect(n).toBeLessThan(1120);
    }
  });

  test('100 personas con 40 parejas excluidas y «sin mutuos»: reparto válido y rápido', () => {
    const ex = mutuas(Array.from({ length: 40 }, (_, i) => [2 * i, 2 * i + 1] as [number, number]));
    const inicio = Date.now();
    const a = ok(sortear(100, ex, { sinMutuos: true }, rng(3)));
    expect(repartoValido(a, matrizPermitidos(100, ex), { sinMutuos: true })).toBe(true);
    expect(Date.now() - inicio).toBeLessThan(2000);
  });
});

test.describe('Lista de participantes', () => {
  test('una por línea, sin vacías, y los repetidos se detectan sin mirar mayúsculas ni acentos', () => {
    expect(leerParticipantes('Ana\n\n  ana  \nLuis\r\nÁngel\nangel\n   \nMaría  José')).toEqual({
      nombres: ['Ana', 'Luis', 'Ángel', 'María José'],
      repetidos: ['ana', 'angel'],
    });
  });
});

test.describe('Enlace privado', () => {
  test('ida y vuelta con acentos, eñes y emoji', () => {
    const d = { de: 'Begoña', a: 'José Ángel 🎅', evento: 'Navidad en la oficina', presupuesto: '20 €', fecha: '2026-12-24' };
    expect(decodificarEnlace('#' + codificarEnlace(d))).toEqual(d);
  });

  test('el nombre del destinatario no se lee en el enlace', () => {
    const f = codificarEnlace({ de: 'Ana', a: 'Luis' });
    expect(f.startsWith('r=')).toBe(true);
    expect(f).not.toContain('Luis');
    expect(f).toMatch(/^r=[A-Za-z0-9_-]+$/);
  });

  test('sin campos opcionales no aparecen claves vacías', () => {
    expect(decodificarEnlace(codificarEnlace({ de: 'Ana', a: 'Luis' }))).toEqual({
      de: 'Ana', a: 'Luis', evento: undefined, presupuesto: undefined, fecha: undefined,
    });
  });

  test('basura, otra versión o falta de nombres → null; una fecha mal formada se descarta', () => {
    expect(decodificarEnlace('#etapas')).toBeNull();
    expect(decodificarEnlace('#r=%%%')).toBeNull();
    expect(decodificarEnlace('#r=' + btoa('no es json'))).toBeNull();
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
    expect(decodificarEnlace('r=' + b64({ v: 2, de: 'Ana', a: 'Luis' }))).toBeNull();
    expect(decodificarEnlace('r=' + b64({ v: 1, de: 'Ana' }))).toBeNull();
    expect(decodificarEnlace('r=' + b64({ v: 1, de: 'Ana', a: 'Luis', f: '24/12/2026' }))?.fecha).toBeUndefined();
  });

  test('la fecha se muestra DD/MM/AAAA sin que la zona horaria mueva el día', () => {
    expect(fechaEspanola('2026-12-24')).toBe('24/12/2026');
    expect(fechaEspanola('2027-01-01')).toBe('01/01/2027');
  });
});

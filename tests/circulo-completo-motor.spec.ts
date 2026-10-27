import { test, expect } from '@playwright/test';
import {
  CIRCULO_COMPLETO,
  FRACCIONES_PI,
  puntoNotable,
} from '../app/simulador-trigonometria-circulo-unitario/casos';

/**
 * Motor del «círculo trigonométrico completo» de simulador-trigonometria-circulo-unitario —
 * casos resueltos A MANO antes de escribir la vista (semilla S0232, 27/10/2026).
 *
 * El oráculo no es el motor: es la tabla de abajo, copiada del círculo de cualquier libro de
 * secundaria. Sale de dos triángulos y de los signos por cuadrante:
 *
 *   · 30-60-90 (equilátero de lado 2 partido por la altura): cos 30° = √3/2, sen 30° = 1/2,
 *     y al revés en 60°.
 *   · 45-45-90 (cuadrado de lado 1): cos 45° = sen 45° = √2/2.
 *   · Signos (x = cos, y = sen): I (+,+) · II (−,+) · III (−,−) · IV (+,−).
 *
 * Y una comprobación independiente de la tabla: cada cadena exacta, evaluada como número,
 * debe coincidir con Math.cos / Math.sin del ángulo. Si alguien teclease mal una fila de la
 * tabla a mano, la evaluación numérica lo cazaría, y al revés.
 */

const A_MANO: readonly [number, string, string, string, string][] = [
  // grados, radianes, cos, sen, cuadrante
  [0, '0', '1', '0', '—'],
  [30, 'π/6', '√3/2', '1/2', 'I'],
  [45, 'π/4', '√2/2', '√2/2', 'I'],
  [60, 'π/3', '1/2', '√3/2', 'I'],
  [90, 'π/2', '0', '1', '—'],
  [120, '2π/3', '−1/2', '√3/2', 'II'],
  [135, '3π/4', '−√2/2', '√2/2', 'II'],
  [150, '5π/6', '−√3/2', '1/2', 'II'],
  [180, 'π', '−1', '0', '—'],
  [210, '7π/6', '−√3/2', '−1/2', 'III'],
  [225, '5π/4', '−√2/2', '−√2/2', 'III'],
  [240, '4π/3', '−1/2', '−√3/2', 'III'],
  [270, '3π/2', '0', '−1', '—'],
  [300, '5π/3', '1/2', '−√3/2', 'IV'],
  [315, '7π/4', '√2/2', '−√2/2', 'IV'],
  [330, '11π/6', '√3/2', '−1/2', 'IV'],
];

/** «−√3/2» → −0,8660…; «1/2» → 0,5; «−1» → −1. Solo la forma que usa el círculo. */
function evaluar(exacto: string): number {
  const negativo = exacto.startsWith('−');
  const cuerpo = negativo ? exacto.slice(1) : exacto;
  const [numerador, denominador = '1'] = cuerpo.split('/');
  const valorNumerador = numerador.startsWith('√') ? Math.sqrt(Number(numerador.slice(1))) : Number(numerador);
  const valor = valorNumerador / Number(denominador);
  return negativo ? -valor : valor;
}

test.describe('CIRCULO_COMPLETO — los 16 puntos notables', () => {
  test('A MANO: los 16 puntos coinciden fila a fila con la tabla del libro', () => {
    expect(CIRCULO_COMPLETO.map(p => [p.grados, p.radianes, p.cos, p.sen, p.cuadrante])).toEqual(A_MANO);
  });

  test('cada valor exacto, evaluado, es el coseno y el seno del ángulo', () => {
    for (const p of CIRCULO_COMPLETO) {
      const rad = (p.grados * Math.PI) / 180;
      expect(evaluar(p.cos), `cos ${p.grados}°`).toBeCloseTo(Math.cos(rad), 12);
      expect(evaluar(p.sen), `sen ${p.grados}°`).toBeCloseTo(Math.sin(rad), 12);
    }
  });

  test('el cero va sin signo: ni «−0» en cos 90°/270° ni en sen 180°', () => {
    const textos = CIRCULO_COMPLETO.flatMap(p => [p.cos, p.sen]);
    expect(textos).not.toContain('−0');
  });

  test('el signo menos es U+2212, el mismo de la tabla del bloque educativo', () => {
    const negativos = CIRCULO_COMPLETO.flatMap(p => [p.cos, p.sen]).filter(t => t.includes('-') || t.includes('−'));
    // 7 cosenos negativos (120° a 240°) y 7 senos negativos (210° a 330°)
    expect(negativos.length).toBe(14);
    for (const t of negativos) expect(t.startsWith('−')).toBe(true);
  });

  test('las fracciones de π son las del panel de valores', () => {
    for (const p of CIRCULO_COMPLETO) expect(p.radianes).toBe(FRACCIONES_PI[p.grados]);
  });
});

test.describe('puntoNotable — fuera de la vuelta y fuera de los notables', () => {
  test('A MANO: 390° es 30° y −30° es 330° (las razones se repiten cada vuelta)', () => {
    expect(puntoNotable(390)).toEqual(puntoNotable(30));
    expect(puntoNotable(-30)?.grados).toBe(330);
    expect(puntoNotable(-30)?.sen).toBe('−1/2');
    expect(puntoNotable(360)?.grados).toBe(0);
  });

  test('un ángulo no notable no se rotula: nunca una aproximación con aspecto de exacta', () => {
    expect(puntoNotable(29.6)).toBeNull();
    expect(puntoNotable(20)).toBeNull();
    expect(puntoNotable(Number.NaN)).toBeNull();
  });
});

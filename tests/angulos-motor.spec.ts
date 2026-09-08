import { test, expect } from '@playwright/test';
import {
  anguloEntre,
  anguloReflejo,
  complementario,
  suplementario,
  clasificarAngulo,
  aGradosMinutosSegundos,
} from '../lib/calculadoras/angulos';

/**
 * Motor de medida de ángulos — casos resueltos A MANO antes de escribir la vista.
 *
 * El oráculo son ángulos que se conocen sin calculadora: los ejes cartesianos y
 * las diagonales del cuadrado.
 *
 *   (1,0) y (0,1)   → 90°   los dos ejes
 *   (1,0) y (-1,0)  → 180°  sentidos opuestos sobre la misma recta
 *   (1,0) y (1,1)   → 45°   la diagonal del cuadrado unidad
 *   (1,0) y (-1,1)  → 135°  la otra diagonal
 *   (1,0) y (1,0)   → 0°    misma dirección
 *
 * OJO CON EL EJE Y: en pantalla crece hacia abajo, así que (0,1) apunta hacia
 * el SUELO, no hacia arriba. El ángulo entre dos vectores no depende de eso —
 * son 90° en cualquiera de las dos convenciones—, y por eso el motor no invierte
 * nada. Estos casos valen igual leídos como matemáticas o como píxeles.
 */

const O = { x: 0, y: 0 };
const PRECISION = 6; // dígitos decimales: la aritmética de punto flotante no da más

test.describe('anguloEntre — los ángulos que se saben de memoria', () => {
  test('los dos ejes forman 90°', () => {
    expect(anguloEntre(O, { x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(90, PRECISION);
  });

  test('sentidos opuestos sobre la misma recta forman 180°', () => {
    expect(anguloEntre(O, { x: 1, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(180, PRECISION);
  });

  test('la diagonal del cuadrado forma 45° con el eje', () => {
    expect(anguloEntre(O, { x: 1, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(45, PRECISION);
    expect(anguloEntre(O, { x: 1, y: 0 }, { x: -1, y: 1 })).toBeCloseTo(135, PRECISION);
  });

  test('la misma dirección son 0°', () => {
    expect(anguloEntre(O, { x: 1, y: 0 }, { x: 5, y: 0 })).toBeCloseTo(0, PRECISION);
  });

  test('la longitud de los brazos no cambia el ángulo', () => {
    const corto = anguloEntre(O, { x: 1, y: 0 }, { x: 0, y: 1 });
    const largo = anguloEntre(O, { x: 900, y: 0 }, { x: 0, y: 350 });
    expect(largo).toBeCloseTo(corto as number, PRECISION);
  });

  test('el vértice puede estar en cualquier sitio, no solo en el origen', () => {
    const v = { x: 120, y: 340 };
    expect(anguloEntre(v, { x: 121, y: 340 }, { x: 120, y: 341 })).toBeCloseTo(90, PRECISION);
  });

  test('el resultado nunca pasa de 180°: se mide siempre el menor', () => {
    // Dos vectores separados 270° en sentido antihorario son 90° por el otro lado.
    const medida = anguloEntre(O, { x: 1, y: 0 }, { x: 0, y: -1 }) as number;
    expect(medida).toBeCloseTo(90, PRECISION);
    expect(medida).toBeLessThanOrEqual(180);
  });

  test('un brazo de longitud cero no tiene ángulo, y se dice con null', () => {
    // Devolver 0 sería mentir: 0° significa «apuntan al mismo sitio», y aquí no
    // hay adónde apuntar.
    expect(anguloEntre(O, O, { x: 1, y: 0 })).toBeNull();
    expect(anguloEntre(O, { x: 1, y: 0 }, O)).toBeNull();
  });
});

test.describe('ángulos derivados', () => {
  test('el reflejo completa la vuelta', () => {
    expect(anguloReflejo(90)).toBe(270);
    expect(anguloReflejo(135)).toBe(225);
    expect(anguloReflejo(180)).toBe(180);
  });

  test('el complementario solo existe hasta 90°', () => {
    expect(complementario(30)).toBe(60);
    expect(complementario(90)).toBe(0);
    expect(complementario(120)).toBeNull();
  });

  test('el suplementario solo existe hasta 180°', () => {
    expect(suplementario(30)).toBe(150);
    expect(suplementario(180)).toBe(0);
  });
});

test.describe('clasificarAngulo', () => {
  test('nombra los cuatro tipos de la geometría elemental', () => {
    expect(clasificarAngulo(45)).toBe('agudo');
    expect(clasificarAngulo(90)).toBe('recto');
    expect(clasificarAngulo(135)).toBe('obtuso');
    expect(clasificarAngulo(180)).toBe('llano');
    expect(clasificarAngulo(0)).toBe('nulo');
  });

  test('medio grado de tolerancia alrededor del recto, porque se mide arrastrando', () => {
    expect(clasificarAngulo(89.7)).toBe('recto');
    expect(clasificarAngulo(90.4)).toBe('recto');
    // Y fuera de la tolerancia deja de serlo: la holgura no puede ser infinita.
    expect(clasificarAngulo(89.2)).toBe('agudo');
    expect(clasificarAngulo(91)).toBe('obtuso');
  });

  test('el llano también tiene su holgura', () => {
    expect(clasificarAngulo(179.8)).toBe('llano');
    expect(clasificarAngulo(178)).toBe('obtuso');
  });
});

test.describe('aGradosMinutosSegundos', () => {
  test('convierte una medida decimal a la notación de los planos', () => {
    // 30,5° = 30° 30' 0"  (media parte de grado son 30 minutos)
    expect(aGradosMinutosSegundos(30.5)).toEqual({ grados: 30, minutos: 30, segundos: 0 });
    // 45,25° = 45° 15' 0"
    expect(aGradosMinutosSegundos(45.25)).toEqual({ grados: 45, minutos: 15, segundos: 0 });
    // Un cuarto de minuto son 15 segundos
    expect(aGradosMinutosSegundos(10 + 20 / 60 + 15 / 3600)).toEqual({
      grados: 10,
      minutos: 20,
      segundos: 15,
    });
  });

  test('un ángulo entero no inventa minutos ni segundos', () => {
    expect(aGradosMinutosSegundos(90)).toEqual({ grados: 90, minutos: 0, segundos: 0 });
  });

  test('el redondeo nunca escribe 60 segundos, que no es una medida válida', () => {
    // 12° 30' 59,7" redondea a 60": tiene que subir a 12° 31' 0"
    const casi = 12 + 30 / 60 + 59.7 / 3600;
    expect(aGradosMinutosSegundos(casi)).toEqual({ grados: 12, minutos: 31, segundos: 0 });

    // Y con 59 minutos, el arrastre sube al grado siguiente
    const casiGrado = 12 + 59 / 60 + 59.7 / 3600;
    expect(aGradosMinutosSegundos(casiGrado)).toEqual({ grados: 13, minutos: 0, segundos: 0 });
  });
});

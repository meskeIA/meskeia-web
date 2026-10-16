/**
 * Tests unitarios del motor de calculadora-seccion-cable
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/seccion-cable-motor.spec.ts
 *
 * Origen: mensaje de contacto del 16/10/2026, «es imposible que 40 A pasen por un cable de 1,5».
 * La app solo aplicaba la caída de tensión y en un tramo corto recomendaba 1,5 mm² para 40 A.
 *
 * Conductividad a la temperatura de servicio: cobre 48 (PVC, 70 °C) y 44 (XLPE, 90 °C).
 * Intensidades: REBT, ITC-BT-19, Tabla 1 (cobre, aire a 40 °C). Casos resueltos a mano:
 *
 *   CASO 1 — el del mensaje. Monofásico 230 V, 40 A, cos φ 1, 5 m, cobre PVC, método B, 5 %
 *     ΔV adm = 0,05·230 = 11,5 V
 *     S caída = 2·5·40·1/(48·11,5) = 400/552 = 0,72464 mm² → 1,5 mm²
 *     Iz (B, PVC, 2 cargados → columna 5): 1,5→15 · 2,5→21 · 4→27 · 6→36 · 10→50 → 10 mm²
 *     Recomendada 10 mm², manda la intensidad. ΔV con 10 mm² = 400/480 = 0,83333 V (0,36232 %)
 *   CASO 2 — el mismo con XLPE: S caída = 400/(44·11,5) = 0,79051 → 1,5
 *     Iz (B, XLPE, 2 → columna 9): 21 · 29 · 38 · 49 → 6 mm² (49 A)
 *   CASO 3 — manda la caída. 3.500 W a 230 V, cos φ 1 → I = 15,21739 A; 50 m; PVC; B; 5 %
 *     S caída = 2·50·15,21739/(48·11,5) = 1.521,739/552 = 2,75677 → 4 mm²
 *     Iz: 1,5→15 (< 15,22) · 2,5→21 → 2,5 mm². Recomendada 4, manda la caída.
 *     ΔV con 4 mm² = 1.521,739/192 = 7,92572 V (3,44597 %)
 *   CASO 4 — empate. 16 A, 30 m, PVC, B, 5 %: S caída = 960/552 = 1,73913 → 2,5; Iz 2,5 → 21. Ambos.
 *   CASO 5 — trifásico 400 V, 20.000 W, cos φ 0,85, 30 m, XLPE, método C, 5 %
 *     I = 20.000/(√3·400·0,85) = 20.000/588,8973 = 33,96179 A · ΔV adm = 20 V
 *     S caída = √3·30·33,96179·0,85/(44·20) = 1.500,000/880 = 1,70455 → 2,5
 *     (√3·30·I·0,85 = 30·20.000/400 = 1.500 exactos: el cos φ y el √3 se cancelan)
 *     Iz (C, XLPE, 3 → columna 8): 18 · 25 · 34 → 4 mm² (34 A). Recomendada 4, intensidad.
 *   CASO 6 — nota 1) «a partir de 25 mm²»: G con PVC y F con XLPE no bajan de 25 mm²
 *     aunque la corriente sea 10 A (columna 9 a 25 → 116 A; columna 10 a 25 → 123 A).
 *   CASO 7 — modo caída con 1,5 mm² instalados y 40 A (caso 1): Iz 15 A → NO cumple;
 *     la caída sí: ΔV = 400/(48·1,5) = 5,55556 V (2,41546 %).
 *
 *   Sin tabla, NO hay sección recomendada: aluminio (la Tabla 1 solo trae cobre), F y G en
 *   monofásico (la tabla solo los da con 3 conductores cargados) y corriente por encima del
 *   último valor de la columna (1.000 A en B trifásico PVC, máximo 360 A).
 */

import { test, expect } from '@playwright/test';
import { calcularLinea, metodosDisponibles, type Entrada } from '../app/calculadora-seccion-cable/motor';
import {
  COLUMNAS_ITC_BT_19,
  SECCIONES_TABLA_ITC_BT_19,
  intensidadAdmisible,
} from '../data/rebt-intensidades-admisibles';

const BASE: Entrada = {
  modo: 'seccion',
  sistema: 'monofasico',
  tension: 230,
  entradaCarga: 'corriente',
  potencia: 3500,
  corrienteManual: 40,
  cosPhi: 1,
  longitud: 5,
  material: 'cobre',
  aislamiento: 'PVC',
  metodo: 'B',
  limitePorcentaje: 5,
  seccionElegida: 2.5,
};

test.describe('Tabla 1 de la ITC-BT-19', () => {
  test('cada columna tiene una celda por sección y crece con la sección', () => {
    for (const [columna, valores] of Object.entries(COLUMNAS_ITC_BT_19)) {
      expect(valores, `columna ${columna}`).toHaveLength(SECCIONES_TABLA_ITC_BT_19.length);
      const conValor = valores.filter((v): v is number => v !== null);
      for (let i = 1; i < conValor.length; i++) {
        expect(conValor[i], `columna ${columna}, posición ${i}`).toBeGreaterThan(conValor[i - 1]);
      }
    }
  });

  test('los valores de referencia de una vivienda: B con PVC y 2 conductores', () => {
    expect(intensidadAdmisible('B', 'PVC', 2, 1.5)).toBe(15);
    expect(intensidadAdmisible('B', 'PVC', 2, 2.5)).toBe(21);
    expect(intensidadAdmisible('B', 'PVC', 2, 6)).toBe(36);
  });

  test('F y G solo existen con 3 conductores cargados', () => {
    expect(metodosDisponibles('PVC', 2)).toEqual(['A', 'A2', 'B', 'B2', 'C', 'E']);
    expect(metodosDisponibles('XLPE', 3)).toEqual(['A', 'A2', 'B', 'B2', 'C', 'E', 'F', 'G']);
  });
});

test.describe('Sección recomendada: la mayor de los dos criterios', () => {
  test('CASO 1 — 40 A en 5 m ya no sale con 1,5 mm²: manda la intensidad, 10 mm²', () => {
    const r = calcularLinea(BASE);
    expect(r.seccionTeorica).toBeCloseTo(0.72464, 4);
    expect(r.seccionPorCaida).toBe(1.5);
    expect(r.intensidad).toEqual({ estado: 'ok', seccion: 10, iz: 50 });
    expect(r.seccionRecomendada).toBe(10);
    expect(r.criterioDominante).toBe('intensidad');
    expect(r.caidaV).toBeCloseTo(0.83333, 4);
    expect(r.caidaPorcentaje).toBeCloseTo(0.36232, 4);
    expect(r.cumpleIntensidad).toBe(true);
    expect(r.cumpleCaida).toBe(true);
  });

  test('CASO 2 — con XLPE el mismo cable admite más: 6 mm²', () => {
    const r = calcularLinea({ ...BASE, aislamiento: 'XLPE' });
    expect(r.seccionTeorica).toBeCloseTo(0.79051, 4);
    expect(r.intensidad).toEqual({ estado: 'ok', seccion: 6, iz: 49 });
    expect(r.seccionRecomendada).toBe(6);
  });

  test('CASO 3 — línea larga: manda la caída, 4 mm²', () => {
    const r = calcularLinea({ ...BASE, entradaCarga: 'potencia', potencia: 3500, longitud: 50 });
    expect(r.corriente).toBeCloseTo(15.21739, 4);
    expect(r.seccionTeorica).toBeCloseTo(2.75677, 4);
    expect(r.intensidad).toEqual({ estado: 'ok', seccion: 2.5, iz: 21 });
    expect(r.seccionRecomendada).toBe(4);
    expect(r.criterioDominante).toBe('caida');
    expect(r.caidaV).toBeCloseTo(7.92572, 4);
    expect(r.caidaPorcentaje).toBeCloseTo(3.44597, 4);
  });

  test('CASO 4 — los dos criterios piden la misma sección', () => {
    const r = calcularLinea({ ...BASE, corrienteManual: 16, longitud: 30 });
    expect(r.seccionTeorica).toBeCloseTo(1.73913, 4);
    expect(r.seccionRecomendada).toBe(2.5);
    expect(r.criterioDominante).toBe('ambos');
  });

  test('CASO 5 — trifásico con XLPE en pared: 4 mm² por intensidad', () => {
    const r = calcularLinea({
      ...BASE,
      sistema: 'trifasico',
      tension: 400,
      entradaCarga: 'potencia',
      potencia: 20000,
      cosPhi: 0.85,
      longitud: 30,
      aislamiento: 'XLPE',
      metodo: 'C',
    });
    expect(r.conductoresCargados).toBe(3);
    expect(r.corriente).toBeCloseTo(33.96179, 4);
    expect(r.seccionTeorica).toBeCloseTo(1.70455, 4);
    expect(r.intensidad).toEqual({ estado: 'ok', seccion: 4, iz: 34 });
    expect(r.seccionRecomendada).toBe(4);
  });

  test('CASO 6 — la nota 1) de la tabla: G con PVC y F con XLPE desde 25 mm²', () => {
    const tri = { ...BASE, sistema: 'trifasico' as const, tension: 400, corrienteManual: 10 };
    expect(calcularLinea({ ...tri, metodo: 'G', aislamiento: 'PVC' }).intensidad).toEqual({
      estado: 'ok',
      seccion: 25,
      iz: 116,
    });
    expect(calcularLinea({ ...tri, metodo: 'F', aislamiento: 'XLPE' }).intensidad).toEqual({
      estado: 'ok',
      seccion: 25,
      iz: 123,
    });
  });
});

test.describe('Modo caída: la sección instalada se juzga también por intensidad', () => {
  test('CASO 7 — 1,5 mm² con 40 A: la caída cumple, la intensidad no', () => {
    const r = calcularLinea({ ...BASE, modo: 'caida', seccionElegida: 1.5 });
    expect(r.seccionUsada).toBe(1.5);
    expect(r.izSeccionUsada).toBe(15);
    expect(r.cumpleIntensidad).toBe(false);
    expect(r.caidaV).toBeCloseTo(5.55556, 4);
    expect(r.caidaPorcentaje).toBeCloseTo(2.41546, 4);
    expect(r.cumpleCaida).toBe(true);
  });
});

test.describe('Sin tabla no hay sección recomendada', () => {
  test('aluminio: solo la sección por caída, sin recomendación', () => {
    const r = calcularLinea({ ...BASE, material: 'aluminio' });
    expect(r.intensidad).toEqual({ estado: 'sin-tabla', motivo: 'aluminio', izMaxima: null });
    expect(r.seccionRecomendada).toBeNull();
    expect(r.seccionPorCaida).not.toBeNull();
    expect(r.cumpleIntensidad).toBeNull();
    expect(r.izSeccionUsada).toBeNull();
  });

  test('F en monofásico: la tabla no lo recoge', () => {
    const r = calcularLinea({ ...BASE, metodo: 'F' });
    expect(r.intensidad).toEqual({ estado: 'sin-tabla', motivo: 'metodo', izMaxima: null });
    expect(r.seccionRecomendada).toBeNull();
  });

  test('1.000 A supera la tabla: no cumple y no se recomienda nada', () => {
    const r = calcularLinea({
      ...BASE,
      sistema: 'trifasico',
      tension: 400,
      corrienteManual: 1000,
      longitud: 1,
    });
    expect(r.intensidad).toEqual({ estado: 'sin-tabla', motivo: 'excede', izMaxima: 360 });
    expect(r.seccionRecomendada).toBeNull();
    expect(r.cumpleIntensidad).toBe(false);
  });
});

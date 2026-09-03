/**
 * Tests del motor de importación de `simulador-kmeans` — parseo puro, sin navegador.
 *
 * La funcionalidad nace de la semilla S0113: la app tenía datasets predefinidos, generador
 * sintético, método del codo e índice de silueta, pero quien llegaba con su propia tabla no
 * podía usarla. El riesgo de esta clase de código es silencioso: un separador mal elegido
 * produce números plausibles (leer «12,5 30,2» por comas da un campo «5 30» que parsea a 530)
 * y el lienzo dibuja una nube razonable que nadie sabría distinguir de la correcta.
 *
 * Todos los valores esperados están resueltos a mano ANTES de ejecutar nada.
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts
 */

import { test, expect } from '@playwright/test';

import {
  escalarAlLienzo,
  parsearDatosTabulares,
  MAX_PUNTOS_IMPORTADOS,
} from '../app/simulador-kmeans/parseo-datos';

test.describe('parsearDatosTabulares — separadores', () => {
  test('CSV internacional con cabecera: coma separa columnas y el punto es decimal', () => {
    const r = parsearDatosTabulares('edad,ingresos\n25,32000\n41.5,58500\n33,41000');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 25, y: 32000 },
      { x: 41.5, y: 58500 },
      { x: 33, y: 41000 },
    ]);
    expect(r.datos.nombres).toEqual({ x: 'edad', y: 'ingresos' });
    expect(r.datos.filasIgnoradas).toBe(0);
    expect(r.datos.totalLeidas).toBe(4);
    expect(r.datos.recortadoA).toBeNull();
  });

  test('pegado desde hoja de cálculo española: tabulador con coma decimal', () => {
    const r = parsearDatosTabulares('1,5\t2,25\n3,75\t4,5');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 1.5, y: 2.25 },
      { x: 3.75, y: 4.5 },
    ]);
  });

  test('espacios con decimales españoles: NO puede ganar la coma', () => {
    // Partido por comas daría un campo «5 30» que parsea a 530 sin protestar
    const r = parsearDatosTabulares('12,5 30,2\n14,8 31,6');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 12.5, y: 30.2 },
      { x: 14.8, y: 31.6 },
    ]);
  });

  test('punto y coma (CSV español) con coma decimal', () => {
    const r = parsearDatosTabulares('10,5;20,25\n11;21');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 10.5, y: 20.25 },
      { x: 11, y: 21 },
    ]);
  });

  test('con más de dos columnas se usan las dos primeras', () => {
    const r = parsearDatosTabulares('1,2,99\n3,4,98');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });
});

test.describe('parsearDatosTabulares — filas descartadas y límites', () => {
  test('cuenta las filas ilegibles en vez de romper', () => {
    const r = parsearDatosTabulares('1 2\ntexto malo\n3 4\n\n5 6');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toHaveLength(3);
    expect(r.datos.filasIgnoradas).toBe(1);
    // Sin cabecera: la primera fila ya era numérica
    expect(r.datos.nombres).toEqual({ x: 'Columna 1', y: 'Columna 2' });
  });

  test('descarta líneas vacías y comentarios con almohadilla', () => {
    const r = parsearDatosTabulares('# mis datos\n\n1 2\n3 4\n');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toHaveLength(2);
    expect(r.datos.filasIgnoradas).toBe(0);
  });

  test('recorta al máximo y lo declara', () => {
    const filas = Array.from({ length: 10 }, (_, i) => `${i} ${i * 2}`).join('\n');
    const r = parsearDatosTabulares(filas, 5);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toHaveLength(5);
    expect(r.datos.recortadoA).toBe(5);
  });

  test('texto vacío y texto sin números devuelven error, no puntos inventados', () => {
    expect(parsearDatosTabulares('').ok).toBe(false);
    expect(parsearDatosTabulares('   \n\n  ').ok).toBe(false);
    expect(parsearDatosTabulares('hola que tal\nadios').ok).toBe(false);
  });

  test('una sola fila válida no basta para agrupar', () => {
    const r = parsearDatosTabulares('1 2');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toContain('al menos dos puntos');
  });

  test('el tope por defecto es 2.000 puntos', () => {
    expect(MAX_PUNTOS_IMPORTADOS).toBe(2000);
  });

  test('admite negativos', () => {
    const r = parsearDatosTabulares('-1,5\t-2\n3\t4');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: -1.5, y: -2 },
      { x: 3, y: 4 },
    ]);
  });
});

test.describe('escalarAlLienzo', () => {
  test('lleva los extremos a los márgenes e invierte el eje Y', () => {
    const { escalados, rangoX, rangoY } = escalarAlLienzo(
      [{ x: 0, y: 0 }, { x: 10, y: 100 }],
      600,
      400,
      30,
    );
    // utilAncho = 540, utilAlto = 340
    expect(escalados[0]).toEqual({ x: 30, y: 370 });   // el valor mínimo de Y queda ABAJO
    expect(escalados[1]).toEqual({ x: 570, y: 30 });   // el máximo, arriba
    expect(rangoX).toEqual({ min: 0, max: 10 });
    expect(rangoY).toEqual({ min: 0, max: 100 });
  });

  test('un eje sin variación se centra en vez de dividir por cero', () => {
    const { escalados } = escalarAlLienzo([{ x: 5, y: 1 }, { x: 5, y: 3 }], 600, 400, 30);
    expect(escalados[0].x).toBe(300);
    expect(escalados[1].x).toBe(300);
    expect(Number.isFinite(escalados[0].y)).toBe(true);
  });

  test('escalar cada eje por separado normaliza magnitudes dispares', () => {
    // Edad (25-45) frente a salario (20.000-90.000): sin normalizar, el salario mandaría
    const { escalados } = escalarAlLienzo(
      [{ x: 25, y: 20000 }, { x: 35, y: 55000 }, { x: 45, y: 90000 }],
      600,
      400,
      30,
    );
    expect(escalados[1].x).toBeCloseTo(300, 6);
    expect(escalados[1].y).toBeCloseTo(200, 6);
  });
});

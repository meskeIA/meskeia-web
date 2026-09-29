/**
 * Tests del motor de importación de `simulador-kmeans` — parseo puro, sin navegador.
 *
 * La funcionalidad nace de la semilla S0113: la app tenía datasets predefinidos, generador
 * sintético y método del codo, pero quien llegaba con su propia tabla no podía usarla. (Hasta
 * el 29/09/2026 esta cabecera citaba también un «índice de silueta»: la app no lo calcula,
 * solo lo nombra en la guía.) El riesgo de esta clase de código es silencioso: un separador mal elegido
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
  lienzoADatos,
  marcoDatos,
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
    // Con la coma como separador, tres campos también podrían ser «1,2» y «99»: se avisa
    expect(r.datos.aviso).toContain('3 campos separados por comas');
  });

  test('con punto y coma, más columnas no son ambiguas: sin aviso', () => {
    const r = parsearDatosTabulares('1;2;99\n3;4;98');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.aviso).toBeNull();
  });

  test('hallazgo 2455: coma decimal con la coma como separador → se leen columnas, pero con aviso', () => {
    // «1,5,2,5» es (1,5; 2,5) o cuatro columnas enteras: ambigüedad irreducible. Se lee lo que
    // un CSV internacional dice (columnas) y el aviso cita la lectura para que se pueda juzgar
    const r = parsearDatosTabulares('1,5,2,5\n3,2,4,8');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 1, y: 5 },
      { x: 3, y: 2 },
    ]);
    expect(r.datos.aviso).toBe(
      'Las filas traen 4 campos separados por comas y se han leído los dos primeros como X e Y ' +
        '(en la primera fila, X = 1 e Y = 5). Si tus números llevan coma decimal, separa las ' +
        'columnas con punto y coma o tabulador.',
    );
  });

  test('una tabla limpia de dos columnas no trae aviso', () => {
    const r = parsearDatosTabulares('edad,ingresos\n25,32000\n41.5,58500');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.aviso).toBeNull();
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

  test('hallazgo 2454: una primera fila con un número no es cabecera, es una fila rota', () => {
    const r = parsearDatosTabulares('1;abc\n2;3\n4;5');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.puntos).toEqual([
      { x: 2, y: 3 },
      { x: 4, y: 5 },
    ]);
    expect(r.datos.filasIgnoradas).toBe(1);
    expect(r.datos.nombres).toEqual({ x: 'Columna 1', y: 'Columna 2' });
    expect(r.datos.totalLeidas).toBe(3);
  });

  test('las líneas ilegibles ANTES de la cabecera también se cuentan', () => {
    // «mis datos» no tiene números, pero no va justo antes de la primera fila numérica
    const r = parsearDatosTabulares('mis datos\nedad;ingresos\n24;18500\n27;21000');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.datos.nombres).toEqual({ x: 'edad', y: 'ingresos' });
    expect(r.datos.filasIgnoradas).toBe(1);
    expect(r.datos.puntos).toHaveLength(2);
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
  // Lienzo 600 × 400 con margen 30. Hasta el 29/09/2026 cada eje se estiraba a su hueco
  // (X de 30 a 570, Y de 30 a 370) y este test lo consagraba; así el X pesaba 1,59 veces más
  // en la distancia (hallazgo 2451). Ahora los datos van a un CUADRADO de lado 340 centrado,
  // x de 130 a 470 e y de 30 a 370: los dos ejes con los mismos px por unidad normalizada.
  test('lleva cada eje de su mínimo a su máximo sobre el mismo lado, e invierte el eje Y', () => {
    const { escalados, rangoX, rangoY } = escalarAlLienzo(
      [{ x: 0, y: 0 }, { x: 10, y: 100 }],
      600,
      400,
      30,
    );
    expect(marcoDatos(600, 400, 30)).toEqual({ x0: 130, y0: 30, lado: 340 });
    expect(escalados[0]).toEqual({ x: 130, y: 370 });  // el valor mínimo de Y queda ABAJO
    expect(escalados[1]).toEqual({ x: 470, y: 30 });   // el máximo, arriba
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

  test('hallazgo 2451: intercambiar las columnas conserva todas las distancias', () => {
    // A(0;0) B(1;0) C(0,15;1): normalizados, A–B = 1 y A–C = √(0,15² + 1) = 1,0112. En el
    // cuadrado de 340 px: 340 y 343,80. Con las columnas cambiadas deben salir las mismas;
    // antes, con 540 px en X y 340 en Y, salían 540/349,5 en un orden y 340/542,4 en el otro
    const d = (p: { x: number; y: number }, q: { x: number; y: number }) =>
      Math.hypot(p.x - q.x, p.y - q.y);
    const directo = escalarAlLienzo([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.15, y: 1 }], 600, 400, 30).escalados;
    const cambiado = escalarAlLienzo([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0.15 }], 600, 400, 30).escalados;
    expect(d(directo[0], directo[1])).toBeCloseTo(340, 6);
    expect(d(directo[0], directo[2])).toBeCloseTo(340 * Math.sqrt(1.0225), 6);
    expect(d(cambiado[0], cambiado[1])).toBeCloseTo(d(directo[0], directo[1]), 6);
    expect(d(cambiado[0], cambiado[2])).toBeCloseTo(d(directo[0], directo[2]), 6);
  });

  test('hallazgo 2450: la media en el lienzo vuelve a ser la media en las unidades de las columnas', () => {
    // (1;1) (1;2) (2;1) (8;8) (8;9) (9;8): medias (4/3; 4/3) y (25/3; 25/3)
    const datos = [
      { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 },
      { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 8 },
    ];
    const { escalados, rangoX, rangoY } = escalarAlLienzo(datos, 600, 400, 30);
    const marco = marcoDatos(600, 400, 30);
    const media = (ps: { x: number; y: number }[]) => ({
      x: ps.reduce((s, p) => s + p.x, 0) / ps.length,
      y: ps.reduce((s, p) => s + p.y, 0) / ps.length,
    });
    const c1 = lienzoADatos(media(escalados.slice(0, 3)), marco, rangoX, rangoY);
    const c2 = lienzoADatos(media(escalados.slice(3)), marco, rangoX, rangoY);
    expect(c1.x).toBeCloseTo(4 / 3, 9);
    expect(c1.y).toBeCloseTo(4 / 3, 9);
    expect(c2.x).toBeCloseTo(25 / 3, 9);
    expect(c2.y).toBeCloseTo(25 / 3, 9);
    // Un eje sin variación devuelve su único valor
    const plano = escalarAlLienzo([{ x: 5, y: 1 }, { x: 5, y: 3 }], 600, 400, 30);
    expect(lienzoADatos(plano.escalados[0], marco, plano.rangoX, plano.rangoY)).toEqual({ x: 5, y: 1 });
  });
});

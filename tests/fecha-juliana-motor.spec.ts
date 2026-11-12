/**
 * Tests del motor de conversor-fecha-juliana (lib/calculadoras/fechaJuliana.ts).
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/fecha-juliana-motor.spec.ts
 *
 * ── Fecha ordinal (la «fecha juliana» de los lotes), resuelta a mano ──
 *   12/11/2026: ene 31 + feb 28 + mar 31 + abr 30 + may 31 + jun 30 + jul 31 + ago 31 + sep 30
 *               + oct 31 = 304, + 12 = 316 → 26316 · 2026316 · 6316 · 2026-316 · faltan 49
 *   31/12/2024: bisiesto → 366, faltan 0 · 01/03/2024 → 31 + 29 + 1 = 61 · 01/03/2023 → 60
 *   Lectura con año de referencia 2026:
 *     «26316»    → AADDD, 12/11/2026 · el otro siglo: 1926, también no bisiesto → 12/11/1926
 *     «6316»     → ADDD, 2026 · décadas vecinas 2016 y 2036, bisiestos → 11/11
 *     «9001»     → último año acabado en 9 hasta 2026 = 2019 → 01/01/2019
 *     «99032»    → 2099 se pasa de 2026 + 50 → 1999 → 01/02/1999 · alternativa 01/02/2099
 *     «2024366»  → 31/12/2024 · «2025366» → error (2025 no es bisiesto)
 *     «316»      → DDD del año de referencia → 12/11/2026
 *
 * ── Día juliano astronómico: ejemplos publicados de Meeus, Astronomical Algorithms, cap. 7 ──
 *   1/1/2000 12:00 UT              → JD 2.451.545,0 (época J2000.0) · sábado
 *   4/10/1957 19:26:24 UT (día 4,81) → JD 2.436.116,31 (ejemplo 7.a, Sputnik)
 *   27/1/333 12:00, juliano        → JD 1.842.713,0 (ejemplo 7.b)
 *   4/10/1582 0:00, juliano        → JD 2.299.159,5 · jueves
 *   15/10/1582 0:00, gregoriano    → JD 2.299.160,5 · viernes (el día siguiente)
 *   1/1/1970 0:00 UT (época Unix)  → JD 2.440.587,5 · MJD 40.587
 *   Del 5 al 14/10/1582            → no existen
 */

import { test, expect } from '@playwright/test';
import {
  codigosDeFecha,
  diaDelAnio,
  diaSemanaDeJd,
  diaSemanaGregoriano,
  esFechaGregorianaValida,
  fechaDesdeJd,
  fechaDesdeOrdinal,
  jdDesdeFecha,
  leerCodigo,
  textoFecha,
  textoHora,
  type FechaHoraUT,
} from '../lib/calculadoras/fechaJuliana';

const fh = (anio: number, mes: number, dia: number, hora = 0, minuto = 0, segundo = 0): FechaHoraUT => ({
  anio, mes, dia, hora, minuto, segundo,
});

test.describe('Fecha ordinal: de la fecha al código', () => {
  test('12/11/2026 es el día 316', () => {
    const c = codigosDeFecha({ anio: 2026, mes: 11, dia: 12 });
    expect(c).toEqual({ ordinal: 316, diasRestantes: 49, aaddd: '26316', aaaaddd: '2026316', addd: '6316', iso: '2026-316' });
  });
  test('el bisiesto mueve los días desde marzo', () => {
    expect(diaDelAnio({ anio: 2024, mes: 3, dia: 1 })).toBe(61);
    expect(diaDelAnio({ anio: 2023, mes: 3, dia: 1 })).toBe(60);
    const fin = codigosDeFecha({ anio: 2024, mes: 12, dia: 31 });
    expect(fin?.ordinal).toBe(366);
    expect(fin?.diasRestantes).toBe(0);
  });
  test('1900 no fue bisiesto y 2000 sí (regla de los siglos)', () => {
    expect(esFechaGregorianaValida({ anio: 1900, mes: 2, dia: 29 })).toBe(false);
    expect(esFechaGregorianaValida({ anio: 2000, mes: 2, dia: 29 })).toBe(true);
  });
  test('los días cortos se rellenan con ceros: 1 de enero = 001', () => {
    const c = codigosDeFecha({ anio: 2007, mes: 1, dia: 1 });
    expect(c?.aaddd).toBe('07001');
    expect(c?.addd).toBe('7001');
    expect(c?.iso).toBe('2007-001');
  });
  test('día de la semana gregoriano: 12/11/2026 jueves, 1/1/2000 sábado, 15/10/1582 viernes', () => {
    expect(diaSemanaGregoriano({ anio: 2026, mes: 11, dia: 12 })).toBe(4);
    expect(diaSemanaGregoriano({ anio: 2000, mes: 1, dia: 1 })).toBe(6);
    expect(diaSemanaGregoriano({ anio: 1582, mes: 10, dia: 15 })).toBe(5);
    // y coincide con el JD en todo el gregoriano
    for (const [anio, mes, dia] of [[1700, 3, 1], [1999, 12, 31], [2024, 2, 29], [9999, 12, 31]]) {
      const r = jdDesdeFecha(fh(anio, mes, dia, 12));
      if (!r.ok) throw new Error(r.error);
      expect(diaSemanaGregoriano({ anio, mes, dia })).toBe(r.diaSemana);
    }
  });
  test('una fecha que no existe no da código', () => {
    expect(codigosDeFecha({ anio: 2023, mes: 2, dia: 29 })).toBeNull();
    expect(codigosDeFecha({ anio: 2026, mes: 4, dia: 31 })).toBeNull();
  });
  test('ida y vuelta: todos los días de un año bisiesto y de uno normal', () => {
    for (const anio of [2023, 2024]) {
      for (let n = 1; n <= (anio === 2024 ? 366 : 365); n++) {
        const f = fechaDesdeOrdinal(anio, n);
        expect(f).not.toBeNull();
        expect(diaDelAnio(f!)).toBe(n);
      }
      expect(fechaDesdeOrdinal(anio, anio === 2024 ? 367 : 366)).toBeNull();
    }
  });
});

test.describe('Fecha ordinal: leer un código de lote (referencia 2026)', () => {
  test('AADDD «26316» → 12/11/2026, y el otro siglo como alternativa', () => {
    const r = leerCodigo('26316', 2026);
    if (!r.ok) throw new Error(r.error);
    expect(r.formato).toBe('AADDD');
    expect(textoFecha(r.fecha)).toBe('12/11/2026');
    expect(r.alternativas.map(textoFecha)).toEqual(['12/11/1926']);
  });
  test('ADDD «6316» → 2026; en 2016 y 2036, bisiestos, el 316 es el 11/11', () => {
    const r = leerCodigo('6316', 2026);
    if (!r.ok) throw new Error(r.error);
    expect(r.formato).toBe('ADDD');
    expect(textoFecha(r.fecha)).toBe('12/11/2026');
    expect(r.alternativas.map(textoFecha)).toEqual(['11/11/2016', '11/11/2036']);
  });
  test('ADDD «9001» → el último año acabado en 9 que no pasa de 2026: 2019', () => {
    const r = leerCodigo('9001', 2026);
    if (!r.ok) throw new Error(r.error);
    expect(textoFecha(r.fecha)).toBe('01/01/2019');
  });
  test('AADDD «99032» → 1999 (2099 queda a más de 50 años)', () => {
    const r = leerCodigo('99032', 2026);
    if (!r.ok) throw new Error(r.error);
    expect(textoFecha(r.fecha)).toBe('01/02/1999');
    expect(r.alternativas.map(textoFecha)).toEqual(['01/02/2099']);
  });
  test('AAAADDD con y sin guion', () => {
    for (const codigo of ['2024366', '2024-366', ' 2024 366 ']) {
      const r = leerCodigo(codigo, 2026);
      if (!r.ok) throw new Error(r.error);
      expect(r.formato).toBe('AAAADDD');
      expect(textoFecha(r.fecha)).toBe('31/12/2024');
      expect(r.alternativas).toEqual([]);
    }
  });
  test('DDD «316» → el día 316 del año de referencia', () => {
    const r = leerCodigo('316', 2026);
    if (!r.ok) throw new Error(r.error);
    expect(r.formato).toBe('DDD');
    expect(textoFecha(r.fecha)).toBe('12/11/2026');
  });
  test('el día 366 de un año no bisiesto se rechaza diciéndolo', () => {
    const r = leerCodigo('2025366', 2026);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('no es bisiesto');
  });
  test('códigos que no valen', () => {
    for (const codigo of ['', '26000', '26400', '263161', '26a16', '12']) {
      expect(leerCodigo(codigo, 2026).ok, codigo).toBe(false);
    }
  });
});

test.describe('Día juliano astronómico (Meeus, cap. 7)', () => {
  test('J2000.0: 1/1/2000 12:00 UT = 2.451.545,0, sábado', () => {
    const r = jdDesdeFecha(fh(2000, 1, 1, 12));
    if (!r.ok) throw new Error(r.error);
    expect(r.jd).toBe(2451545);
    expect(r.calendario).toBe('gregoriano');
    expect(r.diaSemana).toBe(6);
  });
  test('ejemplo 7.a: 4/10/1957 19:26:24 UT = 2.436.116,31', () => {
    const r = jdDesdeFecha(fh(1957, 10, 4, 19, 26, 24));
    if (!r.ok) throw new Error(r.error);
    expect(r.jd).toBeCloseTo(2436116.31, 6);
  });
  test('ejemplo 7.b: 27/1/333 12:00 en el calendario juliano = 1.842.713,0', () => {
    const r = jdDesdeFecha(fh(333, 1, 27, 12));
    if (!r.ok) throw new Error(r.error);
    expect(r.jd).toBe(1842713);
    expect(r.calendario).toBe('juliano');
  });
  test('el salto de 1582: jueves 4/10 (juliano) y viernes 15/10 (gregoriano) son días seguidos', () => {
    const jueves = jdDesdeFecha(fh(1582, 10, 4));
    const viernes = jdDesdeFecha(fh(1582, 10, 15));
    if (!jueves.ok || !viernes.ok) throw new Error('debían existir');
    expect(jueves.jd).toBe(2299159.5);
    expect(viernes.jd).toBe(2299160.5);
    expect(jueves.diaSemana).toBe(4);
    expect(viernes.diaSemana).toBe(5);
    const hueco = jdDesdeFecha(fh(1582, 10, 10));
    expect(hueco.ok).toBe(false);
  });
  test('época Unix: 1/1/1970 0:00 UT = 2.440.587,5 · MJD 40.587', () => {
    const r = jdDesdeFecha(fh(1970, 1, 1));
    if (!r.ok) throw new Error(r.error);
    expect(r.jd).toBe(2440587.5);
    expect(r.mjd).toBe(40587);
  });
  test('en el calendario juliano el año 1500 sí tuvo 29 de febrero; en el gregoriano 1700 no', () => {
    expect(jdDesdeFecha(fh(1500, 2, 29)).ok).toBe(true);
    expect(jdDesdeFecha(fh(1700, 2, 29)).ok).toBe(false);
  });
  test('entradas que no valen', () => {
    expect(jdDesdeFecha(fh(0, 1, 1)).ok).toBe(false);
    expect(jdDesdeFecha(fh(2026, 13, 1)).ok).toBe(false);
    expect(jdDesdeFecha(fh(2026, 1, 1, 24)).ok).toBe(false);
    expect(jdDesdeFecha(fh(2026, 1, 1, 0, 0, Number.NaN)).ok).toBe(false);
  });
});

test.describe('Del día juliano a la fecha', () => {
  test('ejemplo 7.c: 2.436.116,31 → 4/10/1957 19:26:24', () => {
    const r = fechaDesdeJd(2436116.31);
    if (!r.ok) throw new Error(r.error);
    expect(textoFecha(r.fecha)).toBe('04/10/1957');
    expect(textoHora(r.fecha)).toBe('19:26:24');
    expect(r.calendario).toBe('gregoriano');
  });
  test('1.842.713,0 → 27/1/333 12:00, juliano', () => {
    const r = fechaDesdeJd(1842713);
    if (!r.ok) throw new Error(r.error);
    expect(textoFecha(r.fecha)).toBe('27/01/0333');
    expect(textoHora(r.fecha)).toBe('12:00:00');
    expect(r.calendario).toBe('juliano');
  });
  test('a ambos lados del salto de 1582', () => {
    const antes = fechaDesdeJd(2299160.4);
    const despues = fechaDesdeJd(2299160.5);
    if (!antes.ok || !despues.ok) throw new Error('debían existir');
    expect(textoFecha(antes.fecha)).toBe('04/10/1582');
    expect(antes.calendario).toBe('juliano');
    expect(textoFecha(despues.fecha)).toBe('15/10/1582');
    expect(despues.calendario).toBe('gregoriano');
  });
  test('23:59:59,6 redondea al día siguiente, no a «24:00:00»', () => {
    const r = fechaDesdeJd(2451545.5 - 0.4 / 86400);
    if (!r.ok) throw new Error(r.error);
    expect(textoFecha(r.fecha)).toBe('02/01/2000');
    expect(textoHora(r.fecha)).toBe('00:00:00');
  });
  test('ida y vuelta en fechas de los dos calendarios', () => {
    const casos = [fh(1, 1, 1), fh(800, 12, 25, 6), fh(1582, 10, 4, 23, 59, 59), fh(1582, 10, 15), fh(1900, 3, 1, 8, 15), fh(2026, 11, 12, 14, 30, 5), fh(9999, 12, 31, 23, 59, 59)];
    for (const c of casos) {
      const ida = jdDesdeFecha(c);
      if (!ida.ok) throw new Error(ida.error);
      const vuelta = fechaDesdeJd(ida.jd);
      if (!vuelta.ok) throw new Error(vuelta.error);
      expect(vuelta.fecha, textoFecha(c)).toEqual(c);
    }
  });
  test('fuera de los años 1-9999 se rechaza', () => {
    expect(fechaDesdeJd(0).ok).toBe(false);
    expect(fechaDesdeJd(6000000).ok).toBe(false);
    expect(fechaDesdeJd(Number.NaN).ok).toBe(false);
  });
  test('el día de la semana no depende del calendario', () => {
    // 12/11/2026 a mediodía: JD 2.461.357,0 → jueves
    const r = jdDesdeFecha(fh(2026, 11, 12, 12));
    if (!r.ok) throw new Error(r.error);
    expect(r.jd).toBe(2461357);
    expect(diaSemanaDeJd(r.jd)).toBe(4);
  });
});

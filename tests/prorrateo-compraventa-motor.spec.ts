import { test, expect } from '@playwright/test';
import {
  repartoIbi,
  repartoComunidad,
  periodoDe,
  fechaValida,
  leerFechaISO,
} from '../lib/calculadoras/prorrateoCompraventa';

/**
 * Reparto del IBI y la comunidad en una compraventa — casos resueltos A MANO antes de la vista.
 *
 * Convención: el vendedor cuenta del inicio del periodo al DÍA ANTERIOR a la escritura; el
 * comprador, desde el día de la escritura incluido.
 *
 *   IBI 600 €, escritura 01/07/2026 (año de 365): vendedor 31+28+31+30+31+30 = 181 días,
 *     comprador 184 → 600·181/365 = 297,534… y 600·184/365 = 302,465…
 *   IBI 600 €, 01/01/2026: vendedor 0 días, comprador 365 → todo el recibo, 600
 *   IBI 600 €, 31/12/2026: vendedor 364, comprador 1 → 600/365 = 1,6438…
 *   IBI 732 €, 01/03/2028 (bisiesto): vendedor 31+29 = 60, comprador 306 → 732·306/366 = 612
 *   Comunidad 90 € trimestral, 15/05/2026: trimestre 01/04–30/06 = 91 días; vendedor
 *     30 + 14 = 44, comprador 47 → 90·47/91 = 46,483…
 *   Comunidad 60 € mensual, 15/02/2026: febrero de 28; vendedor 14, comprador 14 → 30
 *   Comunidad 300 € semestral, 01/07/2026: semestre 01/07–31/12, vendedor 0 → comprador 300
 */

const cerca = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

test.describe('Reparto del IBI', () => {
  test('escritura el 1 de julio de un año normal', () => {
    const r = repartoIbi(600, { anio: 2026, mes: 7, dia: 1 });
    expect(r.diasTotal).toBe(365);
    expect(r.diasVendedor).toBe(181);
    expect(r.diasComprador).toBe(184);
    cerca(r.importeVendedor, (600 * 181) / 365);
    cerca(r.importeComprador, (600 * 184) / 365);
    cerca(r.importeVendedor + r.importeComprador, 600);
  });

  test('escritura el 1 de enero: todo para el comprador', () => {
    const r = repartoIbi(600, { anio: 2026, mes: 1, dia: 1 });
    expect(r.diasVendedor).toBe(0);
    cerca(r.importeComprador, 600);
  });

  test('escritura el 31 de diciembre: un solo día del comprador', () => {
    const r = repartoIbi(600, { anio: 2026, mes: 12, dia: 31 });
    expect(r.diasVendedor).toBe(364);
    expect(r.diasComprador).toBe(1);
    cerca(r.importeComprador, 600 / 365);
  });

  test('año bisiesto: 366 días y febrero de 29', () => {
    const r = repartoIbi(732, { anio: 2028, mes: 3, dia: 1 });
    expect(r.diasTotal).toBe(366);
    expect(r.diasVendedor).toBe(60);
    cerca(r.importeComprador, 612);
  });
});

test.describe('Reparto de la comunidad', () => {
  test('cuota trimestral a mitad de mayo', () => {
    const r = repartoComunidad(90, 'trimestral', { anio: 2026, mes: 5, dia: 15 });
    expect(r.inicio).toEqual({ anio: 2026, mes: 4, dia: 1 });
    expect(r.fin).toEqual({ anio: 2026, mes: 6, dia: 30 });
    expect(r.diasTotal).toBe(91);
    expect(r.diasVendedor).toBe(44);
    cerca(r.importeComprador, (90 * 47) / 91);
  });

  test('cuota mensual en febrero', () => {
    const r = repartoComunidad(60, 'mensual', { anio: 2026, mes: 2, dia: 15 });
    expect(r.diasTotal).toBe(28);
    cerca(r.importeComprador, 30);
  });

  test('cuota semestral el primer día del semestre', () => {
    const r = repartoComunidad(300, 'semestral', { anio: 2026, mes: 7, dia: 1 });
    expect(r.diasVendedor).toBe(0);
    cerca(r.importeComprador, 300);
  });

  test('periodos naturales: diciembre cierra el último trimestre y el año', () => {
    expect(periodoDe({ anio: 2026, mes: 12, dia: 5 }, 'trimestral')).toEqual({
      inicio: { anio: 2026, mes: 10, dia: 1 },
      fin: { anio: 2026, mes: 12, dia: 31 },
    });
    expect(periodoDe({ anio: 2026, mes: 12, dia: 5 }, 'mensual').fin).toEqual({ anio: 2026, mes: 12, dia: 31 });
  });
});

test.describe('Fechas', () => {
  test('rechaza fechas que no existen', () => {
    expect(fechaValida({ anio: 2026, mes: 2, dia: 29 })).toBe(false);
    expect(fechaValida({ anio: 2028, mes: 2, dia: 29 })).toBe(true);
    expect(fechaValida({ anio: 2026, mes: 13, dia: 1 })).toBe(false);
    expect(fechaValida({ anio: 2026, mes: 4, dia: 31 })).toBe(false);
  });

  test('lee la fecha de un input type="date"', () => {
    expect(leerFechaISO('2026-07-01')).toEqual({ anio: 2026, mes: 7, dia: 1 });
    expect(leerFechaISO('')).toBeNull();
    expect(leerFechaISO('2026-02-30')).toBeNull();
    expect(leerFechaISO('01/07/2026')).toBeNull();
  });
});

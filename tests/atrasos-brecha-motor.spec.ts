import { test, expect } from '@playwright/test';
import { calcularAtrasos, type ResultadoAtrasos } from '../app/verificador-complemento-brecha-genero/atrasos';
import { COMPLEMENTO_BRECHA_GENERO_SERIE } from '../data/fiscal/pensiones';

/**
 * Atrasos del complemento por brecha de género (S0211) — casos resueltos A MANO antes de la
 * vista. Cuantías por hijo y mes, cada una con su cita del BOE en data/fiscal/pensiones.ts:
 * 2021 27,00 · 2022 28,00 · 2023 30,40 · 2024 33,20 · 2025 35,90 · 2026 36,90.
 * Devengo de un mes completo = cuantía × hijos × prorrata × 14 ÷ 12.
 */

function ok(r: ResultadoAtrasos) {
  if (!r.ok) throw new Error(`Se esperaba un cálculo válido y salió: ${JSON.stringify(r)}`);
  return r;
}

test.describe('Serie de cuantías', () => {
  test('las seis cuantías son las del BOE, y 2026 coincide con la vigente', () => {
    expect(COMPLEMENTO_BRECHA_GENERO_SERIE.map((s) => [s.anio, s.cuantiaPorHijoMensual])).toEqual([
      [2021, 27], [2022, 28], [2023, 30.40], [2024, 33.20], [2025, 35.90], [2026, 36.90],
    ]);
  });

  test('cada cita contiene la cifra de su año escrita como la publica el BOE', () => {
    for (const s of COMPLEMENTO_BRECHA_GENERO_SERIE) {
      const cifra = Number.isInteger(s.cuantiaPorHijoMensual)
        ? String(s.cuantiaPorHijoMensual)
        : s.cuantiaPorHijoMensual.toFixed(2).replace('.', ',');
      expect(s.cita, `${s.anio}`).toContain(`${cifra} euros`);
    }
  });
});

test.describe('Atrasos', () => {
  /**
   * Efectos el 04/02/2021, hasta el 18/10/2026, 2 hijos, sin prorrata. Un mes completo:
   *   2021 → 27 × 2 × 14/12 = 63,00 · febrero cuenta 25 días de 28 (del 4 al 28):
   *          63 × 10 + 63 × 25/28 = 630 + 56,25 = 686,25
   *   2022 → 28 × 2 × 14 = 784,00 · 2023 → 30,40 × 2 × 14 = 851,20
   *   2024 → 33,20 × 2 × 14 = 929,60 · 2025 → 35,90 × 2 × 14 = 1.005,20
   *   2026 → 36,90 × 2 × 14/12 = 86,10 al mes · 9 meses = 774,90 · octubre 18/31:
   *          86,10 × 18/31 = 49,9935… → 774,90 + 49,9935 = 824,8935 → 824,89
   *   Total = 686,25 + 784 + 851,20 + 929,60 + 1.005,20 + 824,89 = 5.081,14
   */
  test('desde el primer día del complemento hasta el 18/10/2026, 2 hijos → 5.081,14 €', () => {
    const r = ok(calcularAtrasos('2021-02-04', '2026-10-18', 2));
    expect(r.tramos.map((t) => [t.anio, t.importe])).toEqual([
      [2021, 686.25], [2022, 784], [2023, 851.2], [2024, 929.6], [2025, 1005.2], [2026, 824.89],
    ]);
    expect(r.tramos[0].meses).toBeCloseTo(10 + 25 / 28, 10);
    expect(r.total).toBe(5081.14);
    expect(r.porMesMas).toBe(86.1);
  });

  /**
   * Efectos el 01/07/2024, hasta el 31/01/2025, 1 hijo, prorrata del 50 %:
   *   2024 → 33,20 × 0,5 × 14/12 = 19,3666… × 6 meses = 116,20
   *   2025 → 35,90 × 0,5 × 14/12 = 20,9416… × 1 mes = 20,94
   *   Total = 137,14 · por mes más (2025) = 20,94
   */
  test('con prorrata del 50 % y 1 hijo, de julio de 2024 a enero de 2025 → 137,14 €', () => {
    const r = ok(calcularAtrasos('2024-07-01', '2025-01-31', 1, 0.5));
    expect(r.tramos.map((t) => [t.anio, t.importe])).toEqual([[2024, 116.2], [2025, 20.94]]);
    expect(r.total).toBe(137.14);
    expect(r.porMesMas).toBe(20.94);
  });

  /** Un año entero son exactamente las 14 pagas: 4 hijos en 2023 → 30,40 × 4 × 14 = 1.702,40 */
  test('un año natural completo da las 14 pagas exactas', () => {
    const r = ok(calcularAtrasos('2023-01-01', '2023-12-31', 4));
    expect(r.total).toBe(1702.4);
  });

  /** Mismo día de inicio y fin: 1 día de 30 en junio de 2025, 1 hijo → 35,90 × 14/12 / 30 = 1,3961… → 1,40 */
  test('un solo día cuenta por días', () => {
    expect(ok(calcularAtrasos('2025-06-15', '2025-06-15', 1)).total).toBe(1.4);
  });
});

test.describe('Lo que no se calcula', () => {
  test('efectos anteriores al 04/02/2021: no es este complemento', () => {
    expect(calcularAtrasos('2021-02-03', '2026-10-18', 2)).toEqual({ ok: false, error: 'anterior-al-complemento' });
  });

  test('efectos posteriores a hoy', () => {
    expect(calcularAtrasos('2026-11-01', '2026-10-18', 2)).toEqual({ ok: false, error: 'futura' });
  });

  test('fecha imposible o mal escrita', () => {
    expect(calcularAtrasos('2023-02-30', '2026-10-18', 2)).toEqual({ ok: false, error: 'fecha-invalida' });
    expect(calcularAtrasos('18/10/2023', '2026-10-18', 2)).toEqual({ ok: false, error: 'fecha-invalida' });
  });

  /** El candado de la revalorización: un año sin cuantía sellada NO se suma con la anterior */
  test('un año sin cuantía en la serie se niega, no se rellena', () => {
    expect(calcularAtrasos('2026-12-01', '2027-01-15', 2)).toEqual({ ok: false, error: 'sin-cuantia', anio: 2027 });
  });
});

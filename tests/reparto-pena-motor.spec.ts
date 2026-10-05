import { test, expect } from '@playwright/test';
import { exencionPorImporteJugado, gravamenPremio } from '../data/fiscal/premios-loterias';
import { repartirCentimos, repartirPremio, type ResultadoReparto } from '../app/generador-loteria/reparto';

/**
 * Reparto del premio de una peña (S0180) y gravamen especial de la DA 33.ª LIRPF — casos
 * resueltos A MANO antes de la vista. La norma, cotejada en el BOE, está en la cabecera de
 * data/fiscal/premios-loterias.ts.
 *
 * Los premios de abajo (400.000, 125.000, 50.000 y 20.000 € por décimo) son importes de
 * ejemplo elegidos para que las cuentas salgan redondas, no el programa de ningún sorteo.
 */

function ok(r: ResultadoReparto) {
  if (!r.ok) throw new Error(`Se esperaba un reparto válido y salió: ${r.error}`);
  return r;
}

test.describe('Gravamen de UN décimo (DA 33.ª)', () => {
  test('premio de 400.000 € → exentos 40.000, base 360.000, retención 72.000, cobra 328.000', () => {
    expect(gravamenPremio(400_000, 20)).toEqual({ exento: 40_000, base: 360_000, retencion: 72_000, neto: 328_000 });
  });

  test('premio de 40.000 € justos → exento entero (el apartado 2 dice «igual o inferior»)', () => {
    expect(gravamenPremio(40_000, 20)).toEqual({ exento: 40_000, base: 0, retencion: 0, neto: 40_000 });
  });

  test('premio de 20.000 € → exento, el exento no puede superar al premio', () => {
    expect(gravamenPremio(20_000, 20)).toEqual({ exento: 20_000, base: 0, retencion: 0, neto: 20_000 });
  });

  test('apuesta de 0,50 € (Bonoloto) → exención completa: el umbral es «al menos 0,50»', () => {
    expect(exencionPorImporteJugado(0.5)).toBe(40_000);
  });

  test('apuesta de 0,25 € → exención reducida a la mitad, 20.000 €', () => {
    // 40.000 × 0,25 / 0,50 = 20.000 · premio 30.000 → base 10.000 → retención 2.000
    expect(exencionPorImporteJugado(0.25)).toBe(20_000);
    expect(gravamenPremio(30_000, 0.25)).toEqual({ exento: 20_000, base: 10_000, retencion: 2_000, neto: 28_000 });
  });
});

test.describe('Reparto de la peña', () => {
  test('400.000 € entre 4 que ponen 5 € cada uno → 82.000 € netos por cabeza', () => {
    // Cuota 1/4 · bruto 100.000 · exento 10.000 · retención 72.000/4 = 18.000 · neto 82.000
    const r = ok(repartirPremio({
      participantes: [
        { nombre: 'Ana', aportacion: 5 }, { nombre: 'Luis', aportacion: 5 },
        { nombre: 'Marta', aportacion: 5 }, { nombre: 'Pedro', aportacion: 5 },
      ],
      premios: [400_000],
      importeJugado: 20,
    }));
    expect(r.total).toEqual({ premio: 400_000, exento: 40_000, base: 360_000, retencion: 72_000, neto: 328_000 });
    for (const p of r.partes) {
      expect(p.cuota).toBe(0.25);
      expect(p.bruto).toBe(100_000);
      expect(p.exento).toBe(10_000);
      expect(p.retencion).toBe(18_000);
      expect(p.neto).toBe(82_000);
    }
  });

  test('aportaciones desiguales 10 / 6 / 4 € y un premio de 125.000 €', () => {
    // Cuotas 50 % / 30 % / 20 % · base 85.000 · retención 17.000 · neto 108.000
    // brutos 62.500 / 37.500 / 25.000 · retenciones 8.500 / 5.100 / 3.400
    // netos 54.000 / 32.400 / 21.600
    const r = ok(repartirPremio({
      participantes: [{ nombre: 'A', aportacion: 10 }, { nombre: 'B', aportacion: 6 }, { nombre: 'C', aportacion: 4 }],
      premios: [125_000],
      importeJugado: 20,
    }));
    expect(r.total.retencion).toBe(17_000);
    expect(r.partes.map(p => p.cuota)).toEqual([0.5, 0.3, 0.2]);
    expect(r.partes.map(p => p.bruto)).toEqual([62_500, 37_500, 25_000]);
    expect(r.partes.map(p => p.exento)).toEqual([20_000, 12_000, 8_000]);
    expect(r.partes.map(p => p.retencion)).toEqual([8_500, 5_100, 3_400]);
    expect(r.partes.map(p => p.neto)).toEqual([54_000, 32_400, 21_600]);
  });

  test('dos décimos premiados: la exención se aplica a CADA uno, no una vez al total', () => {
    // 125.000 → base 85.000 · 50.000 → base 10.000 · total base 95.000 · retención 19.000
    // Con una sola exención al total (175.000 − 40.000) saldría 27.000: el error a evitar
    const r = ok(repartirPremio({
      participantes: [{ nombre: 'A', aportacion: 20 }, { nombre: 'B', aportacion: 20 }],
      premios: [125_000, 50_000],
      importeJugado: 20,
    }));
    expect(r.porPremio.map(p => p.base)).toEqual([85_000, 10_000]);
    expect(r.total).toEqual({ premio: 175_000, exento: 80_000, base: 95_000, retencion: 19_000, neto: 156_000 });
    expect(r.partes.map(p => p.neto)).toEqual([78_000, 78_000]);
  });

  test('premio de 20.000 € → sin retención para nadie', () => {
    const r = ok(repartirPremio({
      participantes: [{ nombre: 'A', aportacion: 15 }, { nombre: 'B', aportacion: 5 }],
      premios: [20_000],
      importeJugado: 20,
    }));
    expect(r.total.retencion).toBe(0);
    expect(r.partes.map(p => p.neto)).toEqual([15_000, 5_000]);
  });

  test('tres a partes iguales con 100.000 €: los céntimos cuadran y el sobrante va al primero', () => {
    // 100.000 / 3 = 33.333,333… → 33.333,34 + 33.333,33 + 33.333,33 = 100.000,00
    // Retención: base 60.000 → 12.000 → 4.000 justos cada uno
    const r = ok(repartirPremio({
      participantes: [{ nombre: 'A', aportacion: 1 }, { nombre: 'B', aportacion: 1 }, { nombre: 'C', aportacion: 1 }],
      premios: [100_000],
      importeJugado: 1,
    }));
    expect(r.partes.map(p => p.bruto)).toEqual([33_333.34, 33_333.33, 33_333.33]);
    expect(r.partes.map(p => p.retencion)).toEqual([4_000, 4_000, 4_000]);
    const suma = (k: 'bruto' | 'neto' | 'retencion' | 'exento') =>
      Math.round(r.partes.reduce((s, p) => s + p[k] * 100, 0)) / 100;
    expect(suma('bruto')).toBe(r.total.premio);
    expect(suma('neto')).toBe(r.total.neto);
    expect(suma('retencion')).toBe(r.total.retencion);
    expect(suma('exento')).toBe(r.total.exento);
  });

  test('quien pone 0 € figura con 0 €', () => {
    const r = ok(repartirPremio({
      participantes: [{ nombre: 'A', aportacion: 10 }, { nombre: 'B', aportacion: 0 }],
      premios: [400_000],
      importeJugado: 20,
    }));
    expect(r.partes[1]).toMatchObject({ cuota: 0, bruto: 0, retencion: 0, neto: 0 });
    expect(r.partes[0].neto).toBe(328_000);
  });
});

test.describe('Entradas que no se pueden repartir', () => {
  const base = { participantes: [{ nombre: 'A', aportacion: 5 }], premios: [1000], importeJugado: 20 };

  test('sin personas', () => {
    expect(repartirPremio({ ...base, participantes: [] }).ok).toBe(false);
  });
  test('la peña suma 0 €', () => {
    expect(repartirPremio({ ...base, participantes: [{ nombre: 'A', aportacion: 0 }] }).ok).toBe(false);
  });
  test('aportación negativa o no numérica', () => {
    expect(repartirPremio({ ...base, participantes: [{ nombre: 'A', aportacion: -5 }] }).ok).toBe(false);
    expect(repartirPremio({ ...base, participantes: [{ nombre: 'A', aportacion: NaN }] }).ok).toBe(false);
  });
  test('sin premios, o un premio de 0 €', () => {
    expect(repartirPremio({ ...base, premios: [] }).ok).toBe(false);
    expect(repartirPremio({ ...base, premios: [0] }).ok).toBe(false);
  });
  test('importe jugado no válido', () => {
    expect(repartirPremio({ ...base, importeJugado: 0 }).ok).toBe(false);
  });
});

test.describe('Mayor resto', () => {
  test('reparte 10 céntimos entre pesos 1/1/1 → 4/3/3', () => {
    expect(repartirCentimos(10, [1, 1, 1])).toEqual([4, 3, 3]);
  });
  test('el céntimo sobrante va al mayor decimal, no al primero', () => {
    // 100 × 1/6 = 16,67 · 100 × 2/6 = 33,33 · 100 × 3/6 = 50 → 16 + 33 + 50 = 99 → el 0,67 se lleva 1
    expect(repartirCentimos(100, [1, 2, 3])).toEqual([17, 33, 50]);
  });
});

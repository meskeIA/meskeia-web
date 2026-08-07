/**
 * CAPA 1 — Tests de VALOR para la venta de inmuebles (familia compraventa)
 *
 * Ejecutar con: npm run test:calc
 *
 * A diferencia de calculadoras-invariantes.spec.ts (que comprueba invariantes
 * estructurales sin conocer el valor exacto), aquí SÍ se comprueban cifras
 * concretas, porque la fórmula está en la ley y puede calcularse a mano:
 *
 *   valor de adquisición = compra + gastos e impuestos de la compra + mejoras − amortizaciones
 *   valor de transmisión = venta − gastos de la venta − plusvalía municipal
 *   ganancia             = transmisión − adquisición          (arts. 34-36 LIRPF)
 *   cuota                = escala del ahorro 19/21/23/27/30    (art. 66 LIRPF)
 *
 * Origen (2026-08-07): las cuatro apps de compraventa calculaban la ganancia como
 * `venta − compra − comisión − gestoría`, dejando fuera los impuestos y gastos de la
 * compra original y la plusvalía municipal. Ambos desvíos empujaban el IRPF AL ALZA.
 * Estos tests fijan el resultado correcto para que el error no pueda volver.
 */

import { test, expect } from '@playwright/test';

import { calcularGananciaInmueble } from '../data/fiscal/ganancia-inmueble';
import { calcularCuotaBaseAhorro, desglosarCuotaBaseAhorro } from '../data/fiscal/inmuebles';
import { calcularPlusvaliaMunicipal } from '../data/itp-ccaa';
import { calcularVentaInmueble } from '../lib/calculadoras/ventaInmueble';

/** Redondeo a 2 decimales para comparar con el cálculo hecho a mano */
const r2 = (n: number) => Math.round(n * 100) / 100;

test.describe('Escala del ahorro (art. 66 LIRPF)', () => {
  test('un tramo: 5.000 € al 19 %', () => {
    expect(r2(calcularCuotaBaseAhorro(5000))).toBe(950);
  });

  test('dos tramos: 10.000 € = 6.000×19 % + 4.000×21 %', () => {
    // 1.140 + 840 = 1.980
    expect(r2(calcularCuotaBaseAhorro(10000))).toBe(1980);
  });

  test('cuatro tramos: 60.000 € = 1.140 + 9.240 + 2.300', () => {
    // 6.000×19 % = 1.140 · 44.000×21 % = 9.240 · 10.000×23 % = 2.300 → 12.680
    expect(r2(calcularCuotaBaseAhorro(60000))).toBe(12680);
  });

  test('el desglose por tramos suma exactamente la cuota', () => {
    for (const base of [0, 1, 5999, 6000, 50000, 123456.78, 400000]) {
      const suma = desglosarCuotaBaseAhorro(base).reduce((s, t) => s + t.cuota, 0);
      expect(r2(suma)).toBe(r2(calcularCuotaBaseAhorro(base)));
    }
  });

  test('base cero o negativa no genera cuota', () => {
    expect(calcularCuotaBaseAhorro(0)).toBe(0);
    expect(calcularCuotaBaseAhorro(-5000)).toBe(0);
  });
});

test.describe('Ganancia patrimonial (arts. 34-36 LIRPF)', () => {
  test('los gastos de la compra original REDUCEN la ganancia', () => {
    // Compra 150.000 + 20.000 de gastos = adquisición 170.000
    // Venta 250.000 − 7.500 de comisión = transmisión 242.500
    // Ganancia = 72.500
    const g = calcularGananciaInmueble({
      precioVenta: 250000,
      precioCompra: 150000,
      gastosAdquisicion: 20000,
      gastosTransmision: 7500,
    });
    expect(r2(g.valorAdquisicion)).toBe(170000);
    expect(r2(g.valorTransmision)).toBe(242500);
    expect(r2(g.ganancia)).toBe(72500);
    // 1.140 + 9.240 + 22.500×23 % = 1.140 + 9.240 + 5.175 = 15.555
    expect(r2(g.cuotaIRPF)).toBe(15555);
  });

  test('sin declarar los gastos de la compra, la ganancia y la cuota son MAYORES', () => {
    const con = calcularGananciaInmueble({
      precioVenta: 250000, precioCompra: 150000, gastosAdquisicion: 20000, gastosTransmision: 7500,
    });
    const sin = calcularGananciaInmueble({
      precioVenta: 250000, precioCompra: 150000, gastosTransmision: 7500,
    });
    expect(sin.ganancia).toBeGreaterThan(con.ganancia);
    expect(r2(sin.ganancia - con.ganancia)).toBe(20000);
    // Diferencia de cuota: 20.000 al 23 % = 4.600 €
    expect(r2(sin.cuotaIRPF - con.cuotaIRPF)).toBe(4600);
  });

  test('la plusvalía municipal minora el valor de transmisión', () => {
    const g = calcularGananciaInmueble({
      precioVenta: 250000,
      precioCompra: 150000,
      gastosAdquisicion: 20000,
      gastosTransmision: 7500,
      plusvaliaMunicipal: 3000,
    });
    expect(r2(g.valorTransmision)).toBe(239500);
    expect(r2(g.ganancia)).toBe(69500);
  });

  test('las mejoras suman al valor de adquisición y las amortizaciones restan', () => {
    const g = calcularGananciaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      gastosAdquisicion: 10000,
      mejoras: 15000,
      amortizacionesDeducidas: 5000,
    });
    // 100.000 + 10.000 + 15.000 − 5.000 = 120.000
    expect(r2(g.valorAdquisicion)).toBe(120000);
    expect(r2(g.ganancia)).toBe(80000);
  });

  test('vender por debajo del valor de adquisición es pérdida y no genera cuota', () => {
    const g = calcularGananciaInmueble({
      precioVenta: 160000, precioCompra: 150000, gastosAdquisicion: 20000, gastosTransmision: 5000,
    });
    expect(g.esPerdida).toBe(true);
    expect(g.ganancia).toBeLessThan(0);
    expect(g.cuotaIRPF).toBe(0);
  });
});

test.describe('Exenciones del vendedor', () => {
  test('mayor de 65 con vivienda habitual: exención total (art. 33.4.b LIRPF)', () => {
    const g = calcularGananciaInmueble({
      precioVenta: 300000, precioCompra: 100000, exentoPorEdad: true,
    });
    expect(r2(g.ganancia)).toBe(200000);
    expect(g.cuotaIRPF).toBe(0);
    expect(g.exentaPorEdad).toBe(200000);
    expect(g.motivoExencion).toContain('65');
  });

  test('reinversión total: exención completa (art. 38 LIRPF)', () => {
    const g = calcularGananciaInmueble({
      precioVenta: 250000,
      precioCompra: 150000,
      reinversion: { importeReinvertido: 250000 },
    });
    expect(g.proporcionReinvertida).toBe(1);
    expect(g.cuotaIRPF).toBe(0);
    expect(r2(g.exentaPorReinversion)).toBe(100000);
  });

  test('reinversión de la mitad: exenta la mitad de la ganancia (art. 41 RIRPF)', () => {
    // Transmisión 200.000 · reinvierte 100.000 → 50 % · ganancia 100.000 → 50.000 exentos
    const g = calcularGananciaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      reinversion: { importeReinvertido: 100000 },
    });
    expect(g.proporcionReinvertida).toBe(0.5);
    expect(r2(g.exentaPorReinversion)).toBe(50000);
    expect(r2(g.baseImponible)).toBe(50000);
    // 1.140 + 9.240 = 10.380
    expect(r2(g.cuotaIRPF)).toBe(10380);
  });

  test('la hipoteca pendiente reduce el importe a reinvertir para lograr la exención total', () => {
    // Transmisión 200.000 − 80.000 de hipoteca = 120.000 a reinvertir para exención total
    const g = calcularGananciaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      reinversion: { importeReinvertido: 120000, principalPendiente: 80000 },
    });
    expect(r2(g.importeTotalObtenido)).toBe(120000);
    expect(g.proporcionReinvertida).toBe(1);
    expect(g.cuotaIRPF).toBe(0);
  });

  test('la exención por edad prevalece sobre la reinversión parcial', () => {
    const g = calcularGananciaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      exentoPorEdad: true,
      reinversion: { importeReinvertido: 10000 },
    });
    expect(g.cuotaIRPF).toBe(0);
    expect(g.exentaPorEdad).toBe(g.ganancia);
  });
});

test.describe('Plusvalía municipal (IIVTNU)', () => {
  test('método objetivo: valor catastral del suelo × coeficiente × tipo', () => {
    // Sin valor catastral total el método real NO es calculable: se aplica el objetivo
    const p = calcularPlusvaliaMunicipal({
      valorCatastralSuelo: 50000,
      aniosPropiedad: 10,
      precioCompra: 150000,
      precioVenta: 250000,
    });
    expect(p.metodoRealDisponible).toBe(false);
    expect(p.recomendado).toBe(p.metodoObjetivo);
    expect(p.metodoObjetivo).toBeGreaterThan(0);
  });

  test('método real: el incremento se reparte en la proporción CATASTRAL suelo/total', () => {
    // Incremento 100.000 · proporción 50.000/125.000 = 0,4 → base 40.000 · 25 % = 10.000
    const p = calcularPlusvaliaMunicipal({
      valorCatastralSuelo: 50000,
      valorCatastralTotal: 125000,
      aniosPropiedad: 10,
      precioCompra: 150000,
      precioVenta: 250000,
      tipoMaximo: 25,
    });
    expect(p.metodoRealDisponible).toBe(true);
    expect(r2(p.metodoReal)).toBe(10000);
    // Y se aplica el más favorable de los dos
    expect(p.recomendado).toBe(Math.min(p.metodoObjetivo, p.metodoReal));
  });

  test('el método real NO depende del precio de compra en la proporción (regresión)', () => {
    // La fórmula anterior era suelo × (incremento / precioCompra): al cambiar SOLO el
    // valor catastral total, aquel cálculo no se movía. El correcto sí.
    const base = {
      valorCatastralSuelo: 50000, aniosPropiedad: 10,
      precioCompra: 150000, precioVenta: 250000, tipoMaximo: 25,
    };
    const pocaConstruccion = calcularPlusvaliaMunicipal({ ...base, valorCatastralTotal: 60000 });
    const muchaConstruccion = calcularPlusvaliaMunicipal({ ...base, valorCatastralTotal: 250000 });
    expect(pocaConstruccion.metodoReal).toBeGreaterThan(muchaConstruccion.metodoReal);
  });

  test('sin incremento de valor no está sujeta (art. 104.5 TRLHL)', () => {
    const p = calcularPlusvaliaMunicipal({
      valorCatastralSuelo: 50000,
      valorCatastralTotal: 125000,
      aniosPropiedad: 10,
      precioCompra: 250000,
      precioVenta: 200000,
    });
    expect(p.exento).toBe(true);
    expect(p.recomendado).toBe(0);
  });

  test('la proporción de suelo nunca supera 1 aunque los datos sean incoherentes', () => {
    const p = calcularPlusvaliaMunicipal({
      valorCatastralSuelo: 200000,
      valorCatastralTotal: 100000, // suelo > total: dato imposible
      aniosPropiedad: 5,
      precioCompra: 100000,
      precioVenta: 200000,
      tipoMaximo: 25,
    });
    // Como mucho, todo el incremento es suelo: 100.000 × 25 % = 25.000
    expect(r2(p.metodoReal)).toBe(25000);
  });
});

test.describe('Coherencia entre la tool MCP y el motor de las apps web', () => {
  test('calcularVentaInmueble da la misma ganancia que el motor compartido', () => {
    const venta = calcularVentaInmueble({
      precioVenta: 250000,
      precioCompra: 150000,
      gastosCompraOriginal: 20000,
      aniosTenencia: 10,
      comisionInmobiliaria: 3,
      gastosGestoria: 300,
    });

    const g = calcularGananciaInmueble({
      precioVenta: 250000,
      precioCompra: 150000,
      gastosAdquisicion: 20000,
      gastosTransmision: 250000 * 0.03 + 300,
      plusvaliaMunicipal: venta.plusvaliaMunicipal,
    });

    expect(venta.valorAdquisicion).toBe(r2(g.valorAdquisicion));
    expect(venta.gananciaPatrimonial).toBe(r2(g.ganancia));
    expect(venta.irpfGanancia).toBe(r2(g.cuotaIRPF));
  });

  test('el neto del vendedor es el precio menos todos sus gastos (invariante estructural)', () => {
    const v = calcularVentaInmueble({
      precioVenta: 300000,
      precioCompra: 120000,
      gastosCompraOriginal: 15000,
      aniosTenencia: 12,
      valorCatastralSuelo: 40000,
      valorCatastralTotal: 100000,
    });
    const suma = r2(v.comisionInmobiliaria + v.gastosGestoria + v.plusvaliaMunicipal + v.irpfGanancia);
    expect(v.totalGastosVendedor).toBe(suma);
    expect(v.netoVendedor).toBe(r2(v.precioVenta - v.totalGastosVendedor));
  });

  test('reinversión parcial vía MCP: exención proporcional, no todo o nada (regresión)', () => {
    const v = calcularVentaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      aniosTenencia: 8,
      comisionInmobiliaria: 0,
      gastosGestoria: 0,
      esViviendaHabitual: true,
      reinvierteTotalEnVivienda: true,
      importeReinversion: 100000,
    });
    // Antes, marcar la casilla dejaba la cuota a 0 aunque solo se reinvirtiera la mitad
    expect(v.irpfGanancia).toBeGreaterThan(0);
    expect(v.irpfGanancia).toBe(10380);
  });

  test('sin importe de reinversión, marcar la casilla sigue significando reinversión total', () => {
    const v = calcularVentaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      aniosTenencia: 8,
      esViviendaHabitual: true,
      reinvierteTotalEnVivienda: true,
    });
    expect(v.irpfGanancia).toBe(0);
    expect(v.exentoIRPF).toBe(true);
  });
});

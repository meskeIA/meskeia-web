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

  /**
   * Hallazgo 1797 (25/09/2026). Con el principal pendiente igual o mayor que el valor de
   * transmisión, el importe total obtenido del art. 41.1 RIRPF es 0 y cualquier reinversión lo
   * cubre: el art. 41.4 solo prorratea si la reinversión es INFERIOR al total obtenido. La guarda
   * `importeTotalObtenido > 0` perdía la exención entera justo ahí: con 1 € menos de hipoteca
   * salía exenta y con 1 € más, la cuota completa.
   */
  test('hipoteca igual o mayor que el valor de transmisión: cualquier reinversión exime del todo', () => {
    for (const principalPendiente of [199999, 200000, 200001, 250000]) {
      const g = calcularGananciaInmueble({
        precioVenta: 200000,
        precioCompra: 100000,
        reinversion: { importeReinvertido: 1000, principalPendiente },
      });
      expect(g.proporcionReinvertida, `principal ${principalPendiente}`).toBe(1);
      expect(g.cuotaIRPF, `principal ${principalPendiente}`).toBe(0);
      expect(r2(g.exentaPorReinversion)).toBe(100000);
    }
  });

  test('sin reinvertir nada no hay exención aunque la hipoteca supere el valor (art. 41.1 RIRPF)', () => {
    // Ganancia 100.000 sin exención: 1.140 + 9.240 + 23 % × 50.000 = 21.880
    const g = calcularGananciaInmueble({
      precioVenta: 200000,
      precioCompra: 100000,
      reinversion: { importeReinvertido: 0, principalPendiente: 250000 },
    });
    expect(g.proporcionReinvertida).toBe(0);
    expect(r2(g.cuotaIRPF)).toBe(21880);
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

/**
 * Hallazgo 3368 (18/10/2026): la escala del art. 66 LIRPF se aplica a la base del ahorro ENTERA.
 * La venta paga lo que sube la cuota al sumarla a las demás rentas del ahorro del año:
 *   cuota de la venta = cuota(otras + ganancia) − cuota(otras)
 * Caso de la ficha: ganancia 3.665 €. Sola, 3.665 × 19 % = 696,35. Con 6.000 € de intereses,
 * cuota(9.665) = 1.140 + 3.665 × 21 % = 1.909,65, menos cuota(6.000) = 1.140 → 769,65.
 */
test.describe('Otras rentas del ahorro del año (hallazgo 3368)', () => {
  const venta = { precioVenta: 10000, precioCompra: 6335 };

  test('sin otras rentas, la cuota de la ganancia sola: 3.665 × 19 % = 696,35', () => {
    const g = calcularGananciaInmueble(venta);
    expect(g.ganancia).toBe(3665);
    expect(r2(g.cuotaIRPF)).toBe(696.35);
    expect(g.otrasRentasAhorro).toBe(0);
  });

  test('con 6.000 € de intereses la venta tributa toda al 21 %: 769,65', () => {
    const g = calcularGananciaInmueble({ ...venta, otrasRentasAhorro: 6000 });
    expect(r2(g.cuotaIRPF)).toBe(769.65);
    expect(g.otrasRentasAhorro).toBe(6000);
    // La ganancia y la base no cambian: solo el tramo en que cae.
    expect(g.ganancia).toBe(3665);
    expect(g.baseImponible).toBe(3665);
  });

  test('a caballo entre dos tramos: 4.000 de otras + 5.000 de ganancia = 2.000 × 19 % + 3.000 × 21 % = 1.010', () => {
    const g = calcularGananciaInmueble({ precioVenta: 10000, precioCompra: 5000, otrasRentasAhorro: 4000 });
    expect(r2(g.cuotaIRPF)).toBe(1010);
  });

  test('un importe ilegible (NaN) o negativo cuenta como 0, el cálculo de antes', () => {
    expect(r2(calcularGananciaInmueble({ ...venta, otrasRentasAhorro: NaN }).cuotaIRPF)).toBe(696.35);
    expect(r2(calcularGananciaInmueble({ ...venta, otrasRentasAhorro: -3000 }).cuotaIRPF)).toBe(696.35);
  });

  test('con pérdida o exención no hay cuota, haya o no otras rentas', () => {
    expect(calcularGananciaInmueble({ precioVenta: 5000, precioCompra: 6000, otrasRentasAhorro: 9000 }).cuotaIRPF).toBe(0);
    expect(calcularGananciaInmueble({ ...venta, exentoPorEdad: true, otrasRentasAhorro: 9000 }).cuotaIRPF).toBe(0);
  });

  test('Ceuta: el 60 % de la parte PROPORCIONAL de la cuota total (art. 68.4 LIRPF)', () => {
    // Cuota total 1.909,65 × 3.665 / 9.665 = 724,1456… → deducción × 60 % = 434,49
    // La venta añade 769,65 − 434,49 = 335,16
    const g = calcularGananciaInmueble({ ...venta, otrasRentasAhorro: 6000, inmuebleEnCeutaMelilla: true });
    expect(r2(g.deduccionCeutaMelilla)).toBe(434.49);
    expect(r2(g.cuotaIRPF)).toBe(335.16);
    // Sin otras rentas, la proporción es 1 y vuelve el cálculo de antes: 696,35 × 40 % = 278,54
    const sola = calcularGananciaInmueble({ ...venta, inmuebleEnCeutaMelilla: true });
    expect(r2(sola.cuotaIRPF)).toBe(278.54);
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

  /**
   * ⚠️ Este caso afirmaba lo CONTRARIO hasta el 18/09/2026, y estaba en verde: «la proporción
   * de suelo nunca supera 1 aunque los datos sean incoherentes», con el método real liquidando
   * 25.000 € sobre un par imposible. O sea que el test consagraba el defecto que el Inspector
   * encontró como hallazgo 900 — el acotado con Math.min era la prueba de que el código SE
   * DABA CUENTA de que los datos no podían ser, y en vez de decirlo liquidaba.
   *
   * El valor catastral total incluye el suelo por definición, así que un suelo mayor que el
   * total no describe ningún inmueble: es el despiste de intercambiar dos campos que salen
   * consecutivos del mismo recibo del IBI. Lo correcto es no usar un método que necesita una
   * proporción que ese par no permite calcular, igual que ya se hacía cuando falta el total.
   */
  test('un par catastral imposible NO se liquida por el método real', () => {
    const p = calcularPlusvaliaMunicipal({
      valorCatastralSuelo: 200000,
      valorCatastralTotal: 100000, // suelo > total: dato imposible
      aniosPropiedad: 5,
      precioCompra: 100000,
      precioVenta: 200000,
      tipoMaximo: 25,
    });
    expect(p.parCatastralImposible).toBe(true);
    expect(p.metodoRealDisponible).toBe(false);
    // Y se liquida por el objetivo, que solo necesita el suelo: 200.000 × 0,16 × 25 % = 8.000
    expect(r2(p.recomendado)).toBe(r2(p.metodoObjetivo));
  });

  test('el mismo par AL DERECHO sí usa el método real', () => {
    // Suelo 100.000 y total 200.000: proporción 0,5 y real = 100.000 × 0,5 × 25 % = 12.500 €.
    // El rechazo de arriba no puede llevarse por delante el caso legítimo.
    const p = calcularPlusvaliaMunicipal({
      valorCatastralSuelo: 100000,
      valorCatastralTotal: 200000,
      aniosPropiedad: 5,
      precioCompra: 100000,
      precioVenta: 200000,
      tipoMaximo: 25,
    });
    expect(p.parCatastralImposible).toBe(false);
    expect(p.metodoRealDisponible).toBe(true);
    expect(r2(p.metodoReal)).toBe(12500);
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

/**
 * Cabo C0193 (aprobado por el usuario el 15/10/2026): la tool del MCP pregunta dónde está el
 * inmueble y aplica lo que las apps aplican desde el 10/10/2026. Caso común, hecho a mano:
 * venta 200.000, compra 100.000, 10 años, suelo 40.000 sin valor total, sin comisión ni gestoría.
 *   plusvalía objetivo = 40.000 × 0,12 (10 años) × 25 % = 1.200 €
 *   escala del ahorro: 6.000 × 19 % + 44.000 × 21 % + resto × 23 %
 */
test.describe('Venta vía MCP según dónde está el inmueble (cabo C0193)', () => {
  const base = {
    precioVenta: 200000,
    precioCompra: 100000,
    aniosTenencia: 10,
    valorCatastralSuelo: 40000,
    comisionInmobiliaria: 0,
    gastosGestoria: 0,
  };

  test('Ceuta: plusvalía al 50 % (art. 159.2 TRLRHL) y deducción del 60 % del IRPF (art. 68.4 LIRPF)', () => {
    const v = calcularVentaInmueble({ ...base, ccaa: 'ceuta' });
    // 1.200 × 50 % = 600
    expect(v.plusvaliaMunicipal).toBe(600);
    // ganancia = 200.000 − 600 − 100.000 = 99.400
    expect(v.gananciaPatrimonial).toBe(99400);
    // cuota íntegra = 1.140 + 9.240 + 49.400 × 23 % (11.362) = 21.742; × 40 % = 8.696,80
    expect(v.irpfGanancia).toBe(8696.8);
    expect(v.deduccionIRPFCeutaMelilla).toBe(13045.2);
    expect(v.avisosTerritorio.join(' ')).toContain('68.4 LIRPF');
  });

  test('Madrid: el cálculo de siempre, sin avisos de territorio', () => {
    const v = calcularVentaInmueble({ ...base, ccaa: 'madrid' });
    expect(v.plusvaliaMunicipal).toBe(1200);
    // ganancia 98.800: 1.140 + 9.240 + 48.800 × 23 % (11.224) = 21.604
    expect(v.irpfGanancia).toBe(21604);
    expect(v.deduccionIRPFCeutaMelilla).toBe(0);
    expect(v.avisosTerritorio).toEqual([]);
  });

  test('sin comunidad: el cálculo de siempre y un aviso de lo que no se ha aplicado', () => {
    const v = calcularVentaInmueble(base);
    expect(v.plusvaliaMunicipal).toBe(1200);
    expect(v.irpfGanancia).toBe(21604);
    expect(v.avisosTerritorio).toHaveLength(1);
    expect(v.avisosTerritorio[0]).toContain('Ceuta y Melilla');
  });

  test('País Vasco, vivienda habitual: ni plusvalía (foral) ni cuota del IRPF (reside allí)', () => {
    const v = calcularVentaInmueble({ ...base, ccaa: 'pais-vasco', esViviendaHabitual: true });
    expect(v.plusvaliaForal).toBe(true);
    expect(v.iivtnuCalculable).toBe(false);
    expect(v.plusvaliaMunicipal).toBe(0);
    expect(v.metodoPlusvalia).toContain('norma foral');
    expect(v.irpfForal).toBe(true);
    expect(v.irpfGanancia).toBe(0);
    // Un 0 que no es una exención
    expect(v.exentoIRPF).toBe(false);
    expect(v.desgloseIRPF).toEqual([]);
    expect(v.avisosTerritorio.join(' ')).toContain('IRPF no calculado');
  });

  test('Navarra, no habitual: plusvalía foral sin calcular, IRPF de la escala estatal con su aviso', () => {
    const v = calcularVentaInmueble({ ...base, ccaa: 'navarra' });
    expect(v.plusvaliaForal).toBe(true);
    expect(v.plusvaliaMunicipal).toBe(0);
    expect(v.metodoPlusvalia).toContain('Ley Foral 2/1995');
    expect(v.irpfForal).toBe(false);
    // ganancia 100.000: 1.140 + 9.240 + 50.000 × 23 % (11.500) = 21.880
    expect(v.irpfGanancia).toBe(21880);
    expect(v.avisosTerritorio.join(' ')).toContain('escala estatal');
  });

  test('con otras rentas del ahorro la venta sube de tramo, y el desglose empieza donde ellas la dejan (cabo C0293)', () => {
    // Madrid, ganancia 98.800 € sobre 50.000 € de otras rentas: la base entera es 148.800 € y la
    // venta ocupa de 50.000 a 148.800, todo en el tramo del 23 %: 98.800 × 23 % = 22.724 €.
    // Sola eran 21.604 € (test de arriba): la tool publicaba 1.120 € de menos sin decirlo.
    const v = calcularVentaInmueble({ ...base, ccaa: 'madrid', otrasRentasAhorro: 50000 });
    expect(v.otrasRentasAhorro).toBe(50000);
    expect(v.irpfGanancia).toBe(22724);
    expect(v.desgloseIRPF).toEqual([{ desde: 50000, hasta: 148800, tipo: 23, cuota: 22724 }]);
    // Sin el dato, el cálculo de antes: la venta como única renta del ahorro.
    const sola = calcularVentaInmueble({ ...base, ccaa: 'madrid' });
    expect(sola.otrasRentasAhorro).toBe(0);
    expect(r2(sola.desgloseIRPF.reduce((s, t) => s + t.cuota, 0))).toBe(21604);
  });

  test('País Vasco, habitual de un mayor de 65: tampoco se publica la exención de la LIRPF, que no es su norma', () => {
    const v = calcularVentaInmueble({
      ...base, ccaa: 'pais-vasco', esViviendaHabitual: true, vendedorMayor65: true,
    });
    expect(v.irpfForal).toBe(true);
    expect(v.exentoIRPF).toBe(false);
    expect(v.motivoExencion).toBeUndefined();
  });
});

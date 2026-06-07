/**
 * CAPA 0 — Tests de invariantes para las calculadoras de Delegum (MCP)
 *
 * Ejecutar con: npm run test:calc
 *
 * Filosofía: estos tests NO comprueban que un número concreto sea "el correcto"
 * (eso es la Capa 1, que necesita valores oficiales de AEAT/SEPE/SS). Comprueban
 * INVARIANTES estructurales que deben cumplirse SIEMPRE, sin conocer el valor exacto:
 *
 *   1. ESTRUCTURAL   → el total mostrado es la suma de sus partidas visibles.
 *   2. REGRESIÓN     → bugs ya corregidos no vuelven (ej: finiquito no incluye indemnización).
 *   3. COMPOSICIÓN   → los orquestadores (consulta_*, comparar_*) no cuentan dos veces
 *                       un mismo concepto al combinar calculadoras.
 *
 * Origen: bug del finiquito (2026-06-07) — calcularFiniquito metía su propia
 * indemnización dentro de totalFiniquitoBruto, y consulta_despido la volvía a sumar.
 *
 * Cómo extender: replica los bloques describe() para otros orquestadores
 * (consulta_jubilacion, consulta_herencia, comparar_donacion_vs_herencia, etc.).
 */

import { test, expect } from '@playwright/test';

import { calcularFiniquito } from '../lib/calculadoras/finiquito';
import { calcularIndemnizacionDespido } from '../lib/calculadoras/indemnizacionDespido';
import { calcularSueldoNeto } from '../lib/calculadoras/sueldoNeto';
import { calcularCuotaAutonomo } from '../lib/calculadoras/cuotaAutonomo';
import { calcularIRPF } from '../lib/calculadoras/irpf';
import { compararAutonomoVsSL } from '../lib/calculadoras/autonomoVsSL';
import { calcularCompraventa } from '../lib/calculadoras/compraventa';
import { calcularHipoteca } from '../lib/calculadoras/hipoteca';
import { calcularSucesion } from '../lib/calculadoras/sucesiones';
import { calcularPensionPublica } from '../lib/calculadoras/pensionPublica';
import { calcularBrechaJubilacion } from '../lib/calculadoras/brechaJubilacion';
import { calcularVentaInmueble } from '../lib/calculadoras/ventaInmueble';
import { compararDonacionHerencia } from '../lib/calculadoras/comparacionDonacionHerencia';

/** Redondeo a 2 decimales idéntico al de las calculadoras */
const r2 = (n: number) => Math.round(n * 100) / 100;

// ────────────────────────────────────────────────────────────────────────────
// FINIQUITO — calcular_finiquito
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes — calcularFiniquito', () => {
  const base = {
    salarioBrutoMensual: 2666.67,
    fechaInicio: '2017-03-01',
    fechaBaja: '2026-06-07',
  } as const;

  test('ESTRUCTURAL: el total es exactamente la suma de vacaciones + pagas + salarios', () => {
    const f = calcularFiniquito({ ...base, motivoFiniquito: 'despido_improcedente' });
    const sumaPartes = r2(f.vacacionesPendientes + f.pagasExtrasProporcionales + f.salariosAtrasados);
    expect(f.totalFiniquitoBruto).toBeCloseTo(sumaPartes, 2);
  });

  test('REGRESIÓN: el finiquito NO incluye ninguna indemnización por despido', () => {
    // El bug de 2026-06-07: totalFiniquitoBruto arrastraba ~27.000 € de indemnización.
    // El resultado ya no debe exponer un campo indemnización...
    const f = calcularFiniquito({ ...base, motivoFiniquito: 'despido_improcedente' });
    expect(f).not.toHaveProperty('indemnizacion');

    // ...y el total debe ser pequeño frente a la indemnización equivalente.
    // (finiquito típico ~5.900 € vs indemnización ~26.800 € para este caso)
    const indem = calcularIndemnizacionDespido({
      tipoDespido: 'improcedente',
      salarioBrutoAnual: base.salarioBrutoMensual * 12,
      fechaInicio: base.fechaInicio,
      fechaExtincion: base.fechaBaja,
    });
    expect(f.totalFiniquitoBruto).toBeLessThan(indem.indemnizacionFinal);
  });

  test('ESTRUCTURAL: ninguna partida del finiquito es negativa', () => {
    const f = calcularFiniquito({ ...base, motivoFiniquito: 'despido_improcedente' });
    expect(f.vacacionesPendientes).toBeGreaterThanOrEqual(0);
    expect(f.pagasExtrasProporcionales).toBeGreaterThanOrEqual(0);
    expect(f.salariosAtrasados).toBeGreaterThanOrEqual(0);
    expect(f.totalFiniquitoBruto).toBeGreaterThanOrEqual(0);
  });

  test('INVARIANTE: el motivo no altera las partidas del finiquito (solo la indemnización, que va aparte)', () => {
    // Vacaciones, pagas y salarios se deben con cualquier motivo de cese.
    const despido = calcularFiniquito({ ...base, motivoFiniquito: 'despido_improcedente' });
    const baja = calcularFiniquito({ ...base, motivoFiniquito: 'baja_voluntaria' });
    expect(baja.totalFiniquitoBruto).toBeCloseTo(despido.totalFiniquitoBruto, 2);
  });

  test('MONOTONÍA: a mayor salario, mayor finiquito', () => {
    const bajo = calcularFiniquito({ ...base, salarioBrutoMensual: 2000, motivoFiniquito: 'despido_improcedente' });
    const alto = calcularFiniquito({ ...base, salarioBrutoMensual: 4000, motivoFiniquito: 'despido_improcedente' });
    expect(alto.totalFiniquitoBruto).toBeGreaterThan(bajo.totalFiniquitoBruto);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// INDEMNIZACIÓN POR DESPIDO — calcular_indemnizacion_despido
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes — calcularIndemnizacionDespido', () => {
  const base = {
    salarioBrutoAnual: 32000,
    fechaInicio: '2017-03-01',
    fechaExtincion: '2026-06-07',
  } as const;

  test('ESTRUCTURAL: la indemnización final es min(sinTope, tope) y nunca negativa', () => {
    const i = calcularIndemnizacionDespido({ ...base, tipoDespido: 'improcedente' });
    expect(i.indemnizacionFinal).toBeGreaterThanOrEqual(0);
    expect(i.indemnizacionFinal).toBeCloseTo(Math.min(i.indemnizacionSinTope, i.topeMáximoEuros), 2);
  });

  test('TOPE: improcedente nunca supera 24 mensualidades del salario', () => {
    const i = calcularIndemnizacionDespido({ ...base, tipoDespido: 'improcedente' });
    const salarioMensual = base.salarioBrutoAnual / 12;
    expect(i.indemnizacionFinal).toBeLessThanOrEqual(r2(salarioMensual * 24) + 0.01);
    expect(i.diasPorAnio).toBe(33);
    expect(i.maxMensualidades).toBe(24);
  });

  test('TOPE: objetivo aplica 20 días/año y tope 12 mensualidades', () => {
    const i = calcularIndemnizacionDespido({ ...base, tipoDespido: 'objetivo' });
    expect(i.diasPorAnio).toBe(20);
    expect(i.maxMensualidades).toBe(12);
    expect(i.indemnizacionFinal).toBeLessThan(
      calcularIndemnizacionDespido({ ...base, tipoDespido: 'improcedente' }).indemnizacionFinal,
    );
  });

  test('REGLA: el despido disciplinario procedente no genera indemnización', () => {
    const i = calcularIndemnizacionDespido({ ...base, tipoDespido: 'disciplinario_procedente' });
    expect(i.indemnizacionFinal).toBe(0);
  });

  test('MONOTONÍA: a más antigüedad, más indemnización (hasta el tope)', () => {
    const corta = calcularIndemnizacionDespido({ ...base, tipoDespido: 'improcedente', fechaInicio: '2023-01-01' });
    const larga = calcularIndemnizacionDespido({ ...base, tipoDespido: 'improcedente', fechaInicio: '2017-03-01' });
    expect(larga.indemnizacionFinal).toBeGreaterThan(corta.indemnizacionFinal);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_despido (orquestador)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_despido', () => {
  // Replica EXACTAMENTE lo que hace el orquestador en route.ts:
  //   totalInmediato = indemnizacionFinal + totalFiniquitoBruto
  const salarioBrutoAnual = 32000;
  const salarioMensual = salarioBrutoAnual / 12;
  const fechaInicio = '2017-03-01';
  const fechaFin = '2026-06-07';

  const indem = calcularIndemnizacionDespido({
    tipoDespido: 'improcedente',
    salarioBrutoAnual,
    fechaInicio,
    fechaExtincion: fechaFin,
  });
  const fin = calcularFiniquito({
    salarioBrutoMensual: salarioMensual,
    motivoFiniquito: 'despido_improcedente',
    fechaInicio,
    fechaBaja: fechaFin,
  });

  test('SIN DOBLE CONTEO: el "a percibir de inmediato" = indemnización + (vacaciones + pagas + salarios)', () => {
    const totalInmediato = r2(indem.indemnizacionFinal + fin.totalFiniquitoBruto);
    const esperadoSinSolape = r2(
      indem.indemnizacionFinal +
        fin.vacacionesPendientes +
        fin.pagasExtrasProporcionales +
        fin.salariosAtrasados,
    );
    // Si el finiquito volviera a incluir la indemnización, estos dos números
    // diferirían en ~la indemnización completa. Deben ser idénticos.
    expect(totalInmediato).toBeCloseTo(esperadoSinSolape, 2);
  });

  test('SIN DOBLE CONTEO: el total no contiene dos veces la indemnización', () => {
    const totalInmediato = indem.indemnizacionFinal + fin.totalFiniquitoBruto;
    // La indemnización debe representarse UNA sola vez: el total menos la
    // indemnización debe ser un finiquito plausible (< 1 año de salario), no ~2x.
    expect(totalInmediato - indem.indemnizacionFinal).toBeLessThan(salarioBrutoAnual);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_nomina (bruto → neto)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_nomina', () => {
  const r = calcularSueldoNeto({ brutoAnual: 30000, situacion: 'soltero', pagas: 14 });

  test('ESTRUCTURAL: neto anual = bruto − cotización SS − retención IRPF', () => {
    expect(r.netoAnual).toBeCloseTo(r.brutoAnual - r.cuotaSSAnual - r.cuotaIRPF, 2);
  });

  test('ESTRUCTURAL: neto mensual = neto anual / nº de pagas', () => {
    expect(r.netoMensual).toBeCloseTo(r.netoAnual / r.pagas, 2);
  });

  test('COHERENCIA: 0 < neto < bruto y sin importes negativos', () => {
    expect(r.cuotaSSAnual).toBeGreaterThanOrEqual(0);
    expect(r.cuotaIRPF).toBeGreaterThanOrEqual(0);
    expect(r.netoAnual).toBeGreaterThan(0);
    expect(r.netoAnual).toBeLessThan(r.brutoAnual);
  });

  test('MONOTONÍA: a mayor bruto, mayor neto', () => {
    const bajo = calcularSueldoNeto({ brutoAnual: 20000, situacion: 'soltero' });
    const alto = calcularSueldoNeto({ brutoAnual: 50000, situacion: 'soltero' });
    expect(alto.netoAnual).toBeGreaterThan(bajo.netoAnual);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_autonomo (cuota RETA + IRPF + autónomo vs SL)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_autonomo', () => {
  // Replica el cálculo del orquestador en route.ts.
  const facturacion = 40000;
  const gastos = 5000;
  const rendimientoNeto = facturacion - gastos;
  const cuota = calcularCuotaAutonomo({ rendimientoNetoMensual: rendimientoNeto / 12, esNuevoAutonomo: false });
  const baseIRPF = Math.max(0, rendimientoNeto - cuota.cuotaAnual);
  const irpf = calcularIRPF({ rendimientosTrabajo: baseIRPF, situacion: 'soltero', esTrabajador: false });

  test('COHERENCIA: cuota RETA e IRPF no negativos', () => {
    expect(cuota.cuotaAnual).toBeGreaterThanOrEqual(0);
    expect(irpf.cuotaIntegra).toBeGreaterThanOrEqual(0);
  });

  test('SIN DOBLE CONTEO: neto = facturación − gastos − cuota RETA − IRPF, y queda ordenado', () => {
    const netoAnual = rendimientoNeto - cuota.cuotaAnual - irpf.cuotaIntegra;
    // La cuota de la SS se resta UNA sola vez (no dentro de la base de IRPF y otra vez aparte
    // de forma duplicada): el neto debe quedar por debajo del rendimiento y de la facturación.
    expect(netoAnual).toBeLessThan(rendimientoNeto);
    expect(netoAnual).toBeLessThan(facturacion);
    expect(netoAnual).toBeGreaterThan(0);
  });

  test('COHERENCIA autónomo vs SL: convieneSL ⟺ la SL deja más neto', () => {
    const cmp = compararAutonomoVsSL({ beneficioAnual: facturacion, gastosDeducibles: gastos, tipoIS: 'general', repartirDividendos: true });
    expect(cmp.convieneSL).toBe(cmp.sl.netoAnual > cmp.autonomo.netoAnual);
    expect(cmp.autonomo.tipoEfectivoTotal).toBeGreaterThanOrEqual(0);
    expect(cmp.sl.tipoEfectivoTotal).toBeGreaterThanOrEqual(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_compra_vivienda (compraventa + hipoteca)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_compra_vivienda', () => {
  const cv = calcularCompraventa({ precioInmueble: 200000, ccaa: 'madrid', tipoTransmision: 'segunda_mano' });
  const c = cv.comprador;

  test('ESTRUCTURAL: total de gastos = impuesto + AJD + notaría + registro + gestoría', () => {
    const suma = c.importeImpuesto + c.ajd + c.notaria + c.registro + c.gestoria;
    expect(c.totalGastos).toBeCloseTo(suma, 2);
  });

  test('ESTRUCTURAL: ahorro total necesario = precio + gastos', () => {
    expect(c.totalOperacion).toBeCloseTo(c.precioInmueble + c.totalGastos, 2);
  });

  test('HIPOTECA: capital financiado = precio − entrada y financiación coherente', () => {
    const entrada = 40000;
    const hip = calcularHipoteca({
      precioVivienda: 200000, entrada, plazoAnios: 30,
      tipoHipoteca: 'fijo', interesAnual: 3, ingresosMensuales: 2500,
    });
    expect(hip.capital).toBeCloseTo(200000 - entrada, 2);
    expect(hip.cuotaMensual).toBeGreaterThan(0);
    expect(hip.totalIntereses).toBeGreaterThan(0);
    expect(hip.porcentajeFinanciacion).toBeGreaterThan(0);
    expect(hip.porcentajeFinanciacion).toBeLessThanOrEqual(100);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_herencia (Impuesto de Sucesiones)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_herencia', () => {
  const r = calcularSucesion({ baseImponible: 200000, ccaa: 'madrid', grupo: 'II', viviendaHabitual: 120000 });

  test('ESTRUCTURAL: base liquidable = base imponible − reducciones', () => {
    expect(r.baseLiquidable).toBeCloseTo(r.baseImponible - r.totalReducciones, 2);
  });

  test('COHERENCIA: la cuota final nunca es negativa ni supera la cuota íntegra por coeficiente', () => {
    expect(r.cuotaFinal).toBeGreaterThanOrEqual(0);
    expect(r.cuotaFinal).toBeLessThanOrEqual(r.cuotaIntegra * r.coeficienteMultiplicador + 0.01);
  });

  test('COHERENCIA: el tipo efectivo es cuota final / base imponible', () => {
    expect(r.tipoEfectivo).toBeCloseTo((r.cuotaFinal / r.baseImponible) * 100, 1);
  });

  test('REDUCCIÓN: declarar vivienda habitual genera reducciones', () => {
    expect(r.totalReducciones).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_jubilacion (pensión pública + brecha)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_jubilacion', () => {
  const pension = calcularPensionPublica({ baseCotizacionMensual: 2500, anosCotizados: 35, edadActual: 50 });

  test('ESTRUCTURAL: pensión anual = pensión mensual × 14 pagas', () => {
    expect(pension.pensionBrutaAnual / pension.pensionBrutaMensual).toBeCloseTo(14, 1);
  });

  test('COHERENCIA: el porcentaje de pensión está entre 0 y 100 y la pensión es positiva', () => {
    expect(pension.porcentajePension).toBeGreaterThan(0);
    expect(pension.porcentajePension).toBeLessThanOrEqual(100);
    expect(pension.pensionBrutaMensual).toBeGreaterThan(0);
  });

  test('BRECHA: si el sueldo supera la pensión, la brecha es positiva y menor que el sueldo', () => {
    const sueldoNetoMensual = 3000;
    const brecha = calcularBrechaJubilacion({
      sueldoNetoMensual,
      pensionEstimadaMensual: pension.pensionBrutaMensual,
      edadActual: 50,
    });
    if (brecha.tieneBrecha) {
      expect(brecha.brechaMensual).toBeGreaterThan(0);
      expect(brecha.brechaMensual).toBeLessThan(sueldoNetoMensual);
      expect(brecha.porcentajePensionSobreSueldo).toBeGreaterThanOrEqual(0);
      expect(brecha.porcentajePensionSobreSueldo).toBeLessThanOrEqual(100);
      expect(brecha.ahorroMensualNecesario).toBeGreaterThanOrEqual(0);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — consulta_venta_vivienda (ganancia IRPF + plusvalía + neto)
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — consulta_venta_vivienda', () => {
  const r = calcularVentaInmueble({
    precioVenta: 300000, precioCompra: 200000, aniosTenencia: 10,
    gastosCompraOriginal: 20000, valorCatastralSuelo: 50000, tipoMunicipalIIVTNU: 25,
    comisionInmobiliaria: 3, gastosGestoria: 300,
  });

  test('ESTRUCTURAL: ganancia patrimonial = valor transmisión − valor adquisición', () => {
    expect(r.gananciaPatrimonial).toBeCloseTo(r.valorTransmision - r.valorAdquisicion, 2);
  });

  test('ESTRUCTURAL: total de gastos del vendedor = comisión + gestoría + plusvalía + IRPF', () => {
    const suma = r.comisionInmobiliaria + r.gastosGestoria + r.plusvaliaMunicipal + r.irpfGanancia;
    expect(r.totalGastosVendedor).toBeCloseTo(suma, 2);
  });

  test('SIN DOBLE CONTEO: neto del vendedor = precio de venta − total de gastos', () => {
    expect(r.netoVendedor).toBeCloseTo(r.precioVenta - r.totalGastosVendedor, 2);
    expect(r.netoVendedor).toBeLessThan(r.precioVenta);
  });

  test('EXENCIÓN: mayor de 65 + vivienda habitual ⇒ IRPF de la ganancia exento (0 €)', () => {
    const exento = calcularVentaInmueble({
      precioVenta: 300000, precioCompra: 200000, aniosTenencia: 10,
      vendedorMayor65: true, esViviendaHabitual: true,
    });
    expect(exento.exentoIRPF).toBe(true);
    expect(exento.irpfGanancia).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// COMPOSICIÓN — comparar_donacion_vs_herencia
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de composición — comparar_donacion_vs_herencia', () => {
  const r = compararDonacionHerencia({
    valorInmueble: 300000, valorAdquisicion: 150000, anioAdquisicion: 2003,
    ccaa: 'madrid', grupo: 'II',
  });

  test('DOMINIO: en la herencia el IRPF del causante está exento (0 €)', () => {
    // Invariante normativo (art. 33.3.b LIRPF): no existe "plusvalía del muerto".
    expect(r.herencia.irpfTransmitente).toBe(0);
  });

  test('ESTRUCTURAL: cada total = ISD + IRPF del transmitente + plusvalía municipal', () => {
    expect(r.donacion.total).toBeCloseTo(
      r.donacion.isd + r.donacion.irpfTransmitente + (r.donacion.plusvaliaMunicipal ?? 0), 2,
    );
    expect(r.herencia.total).toBeCloseTo(
      r.herencia.isd + r.herencia.irpfTransmitente + (r.herencia.plusvaliaMunicipal ?? 0), 2,
    );
  });

  test('COHERENCIA: la recomendación concuerda con el total más barato', () => {
    expect(r.ahorroEstimado).toBeCloseTo(Math.abs(r.donacion.total - r.herencia.total), 2);
    if (r.opcionRecomendada === 'donacion') {
      expect(r.donacion.total).toBeLessThan(r.herencia.total);
    } else if (r.opcionRecomendada === 'herencia') {
      expect(r.herencia.total).toBeLessThan(r.donacion.total);
    }
  });
});

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
import { calcularPensionDesempleo } from '../lib/calculadoras/pensionDesempleo';

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

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularIndemnizacionDespido
//
// Valores verificados internamente contra la fórmula del ET (RDL 2/2015):
//   improcedente: 33 días × salarioDiario × antigüedad, tope 24 mensualidades
//   objetivo:     20 días × salarioDiario × antigüedad, tope 12 mensualidades
//
// Verificado por el usuario en Google Sheets el 2026-06-09.
// Fecha fija en fechaExtincion para que el test sea reproducible.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularIndemnizacionDespido (Capa 1)', () => {
  const FI_CORTA = '2020-01-01';
  const FI_LARGA = '2001-06-09';
  const FE       = '2026-06-09'; // fecha fija: 2351 días / 9131 días

  test('GOLDEN-A: improcedente 30k ~6,44 años → 17.458,03 € (sin tope)', () => {
    const res = calcularIndemnizacionDespido({
      tipoDespido: 'improcedente',
      salarioBrutoAnual: 30000,
      fechaInicio: FI_CORTA,
      fechaExtincion: FE,
    });
    expect(res.indemnizacionFinal).toBeCloseTo(17458.03, 2);
    expect(res.topeAplicado).toBe(false);
    expect(res.diasPorAnio).toBe(33);
    expect(res.maxMensualidades).toBe(24);
  });

  test('GOLDEN-B: objetivo 30k ~6,44 años → 10.580,63 € (sin tope)', () => {
    const res = calcularIndemnizacionDespido({
      tipoDespido: 'objetivo',
      salarioBrutoAnual: 30000,
      fechaInicio: FI_CORTA,
      fechaExtincion: FE,
    });
    expect(res.indemnizacionFinal).toBeCloseTo(10580.63, 2);
    expect(res.topeAplicado).toBe(false);
    expect(res.diasPorAnio).toBe(20);
    expect(res.maxMensualidades).toBe(12);
  });

  test('GOLDEN-C: improcedente 30k 25 años → tope 60.000 € (24 mensualidades)', () => {
    const res = calcularIndemnizacionDespido({
      tipoDespido: 'improcedente',
      salarioBrutoAnual: 30000,
      fechaInicio: FI_LARGA,
      fechaExtincion: FE,
    });
    expect(res.topeAplicado).toBe(true);
    expect(res.indemnizacionFinal).toBeCloseTo(60000, 2);
    expect(res.topeMáximoEuros).toBeCloseTo(60000, 2);
    expect(res.indemnizacionSinTope).toBeGreaterThan(60000);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPensionDesempleo
//
// Valores calculados internamente desde LGSS arts. 266-279 + IPREM 2025 (600 €/mes).
// Topes 2025 sin hijos: máx 1.208 €, mín 552 €.
// PENDIENTES DE VALIDACIÓN CONTRA SEPE — marcados TODO:SEPE.
// Una vez confirmados por el usuario, eliminar la marca.
// ────────────────────────────────────────────────────────────────────────────

// Correcciones aplicadas tras verificación SEPE 2026-06-09:
//   – IPREM diario14 = 8.400/360 (año 360 días), no 8.400/365
//   – Segundo tramo = 60 % BR (art. 270.1 LGSS reformado), no 50 %
test.describe('Golden — calcularPensionDesempleo (Capa 1 · SEPE ✓)', () => {
  test('GOLDEN-D: 900 días, BR 1.800 €, sin hijos → tope máx 1.225 €, 11.670 € total [SEPE ✓]', () => {
    const res = calcularPensionDesempleo({
      diasCotizados: 900,
      baseReguladoraMensual: 1800,
      numHijos: 0,
    });
    expect(res.tieneDerechoPrestacion).toBe(true);
    expect(res.diasPrestacion).toBe(300);
    expect(res.mesesPrestacion).toBe(10);
    // 70 % × 1.800 = 1.260 > tope máx 1.225 → se aplica tope (SEPE confirmó 1.225 €)
    expect(res.cuantiaEfectivaPrimeros6).toBeCloseTo(1225, 2);
    expect(res.aplicaTopeMaximo).toBe(true);
    // 60 % × 1.800 = 1.080, dentro de topes (SEPE confirmó 1.080 €)
    expect(res.cuantiaEfectivaResto).toBeCloseTo(1080, 2);
    expect(res.totalPrestacionBruta).toBeCloseTo(11670, 2);  // 1.225×6 + 1.080×4
  });

  test('GOLDEN-E: 540 días, BR 1.200 €, sin hijos → 840 €/mes, 5.040 € total [SEPE ✓]', () => {
    const res = calcularPensionDesempleo({
      diasCotizados: 540,
      baseReguladoraMensual: 1200,
      numHijos: 0,
    });
    expect(res.tieneDerechoPrestacion).toBe(true);
    expect(res.diasPrestacion).toBe(180);
    expect(res.mesesPrestacion).toBe(6);
    // 70 % × 1.200 = 840, sin tope (SEPE confirmó 840 €)
    expect(res.cuantiaEfectivaPrimeros6).toBeCloseTo(840, 2);
    expect(res.aplicaTopeMaximo).toBe(false);
    expect(res.aplicaTopeMinimo).toBe(false);
    expect(res.totalPrestacionBruta).toBeCloseTo(5040, 2);
  });

  test('GOLDEN-F: 540 días, BR 600 €, sin hijos → tope mínimo 560 €, 3.360 € total [SEPE ✓]', () => {
    const res = calcularPensionDesempleo({
      diasCotizados: 540,
      baseReguladoraMensual: 600,
      numHijos: 0,
    });
    expect(res.tieneDerechoPrestacion).toBe(true);
    expect(res.diasPrestacion).toBe(180);
    // 70 % × 600 = 420 < tope mínimo 560 → se aplica tope (SEPE confirmó 560 €)
    expect(res.cuantiaEfectivaPrimeros6).toBeCloseTo(560, 2);
    expect(res.aplicaTopeMinimo).toBe(true);
    expect(res.totalPrestacionBruta).toBeCloseTo(3360, 2);  // 560 × 6
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularHipoteca
//
// Valores calculados internamente: fórmula francesa estándar (determinista).
// Verificación: script Node.js con la misma fórmula — pendienteUltimo = 0
// en los tres casos, confirmando amortización completa sin residuo.
// No requiere simulador externo (matemática pura; el BdE usa la misma fórmula).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularHipoteca (Capa 1 · fórmula francesa)', () => {
  test('GOLDEN-G: fija 200k € al 3,5% a 25 años → cuota 1.001,25 €, intereses 100.374,14 €', () => {
    const res = calcularHipoteca({
      precioVivienda: 250000,
      entrada: 50000,
      tipoHipoteca: 'fijo',
      interesAnual: 3.5,
      plazoAnios: 25,
    });
    expect(res.capital).toBeCloseTo(200000, 2);
    expect(res.porcentajeFinanciacion).toBeCloseTo(80, 2);
    expect(res.tipoEfectivo).toBe(3.5);
    expect(res.cuotaMensual).toBeCloseTo(1001.25, 2);
    expect(res.totalIntereses).toBeCloseTo(100374.14, 2);
    expect(res.totalPagado).toBeCloseTo(300374.14, 2);
    expect(res.porcentajeInteresesSobreCapital).toBeCloseTo(50.19, 2);
    // Año 1: el primer año paga más intereses que capital (francés)
    expect(res.resumenAnual[0].interesesAnio).toBeCloseTo(6918.76, 2);
    expect(res.resumenAnual[0].capitalAnio).toBeCloseTo(5096.2, 2);
    expect(res.resumenAnual[0].capitalPendiente).toBeCloseTo(194903.8, 2);
  });

  test('GOLDEN-H: variable 150k € (Euríbor 3% + 0,8%) a 30 años → cuota 698,94 €, intereses 101.616,97 €', () => {
    const res = calcularHipoteca({
      precioVivienda: 200000,
      entrada: 50000,
      tipoHipoteca: 'variable',
      euribor: 3.0,
      diferencial: 0.8,
      plazoAnios: 30,
    });
    expect(res.capital).toBeCloseTo(150000, 2);
    expect(res.porcentajeFinanciacion).toBeCloseTo(75, 2);
    expect(res.tipoEfectivo).toBeCloseTo(3.8, 2);
    expect(res.cuotaMensual).toBeCloseTo(698.94, 2);
    expect(res.totalIntereses).toBeCloseTo(101616.97, 2);
    expect(res.totalPagado).toBeCloseTo(251616.97, 2);
    expect(res.porcentajeInteresesSobreCapital).toBeCloseTo(67.74, 2);
  });

  test('GOLDEN-I: fija 300k € al 2,5% a 30 años → cuota 1.185,36 €, intereses 126.730,57 €', () => {
    const res = calcularHipoteca({
      precioVivienda: 375000,
      entrada: 75000,
      tipoHipoteca: 'fijo',
      interesAnual: 2.5,
      plazoAnios: 30,
    });
    expect(res.capital).toBeCloseTo(300000, 2);
    expect(res.porcentajeFinanciacion).toBeCloseTo(80, 2);
    expect(res.tipoEfectivo).toBe(2.5);
    expect(res.cuotaMensual).toBeCloseTo(1185.36, 2);
    expect(res.totalIntereses).toBeCloseTo(126730.57, 2);
    expect(res.totalPagado).toBeCloseTo(426730.57, 2);
    expect(res.porcentajeInteresesSobreCapital).toBeCloseTo(42.24, 2);
  });

  test('GOLDEN-J: ratio de endeudamiento — cuota 1.001 € sobre 3.000 € netos → 33,38 % → alerta activa', () => {
    const res = calcularHipoteca({
      precioVivienda: 250000,
      entrada: 50000,
      tipoHipoteca: 'fijo',
      interesAnual: 3.5,
      plazoAnios: 25,
      ingresosMensuales: 3000,
    });
    // Ratio sobre cuota exacta (1.001,247…), no sobre la redondeada (1.001,25)
    expect(res.ratioCuotaIngresos).toBeCloseTo(33.37, 2);
    expect(res.alertaRatio).toBe(true);
    // Sin ingresos: ratio null y sin alerta
    const r2 = calcularHipoteca({
      precioVivienda: 250000, entrada: 50000,
      tipoHipoteca: 'fijo', interesAnual: 3.5, plazoAnios: 25,
    });
    expect(r2.ratioCuotaIngresos).toBeNull();
    expect(r2.alertaRatio).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularCuotaAutonomo
//
// Tabla verificada contra importass.seg-social.es el 2026-06-09.
// Bug detectado: 9 de 12 tramos de la tabla general tenían bases mínimas
// de la tabla 2023 (no actualizadas). Corregido en data/fiscal/autonomos.ts.
// Tipo de cotización: 31,50% (desglose oficial suma a este valor aunque el
// encabezado del portal diga "31,40%" — texto de 2025 no actualizado).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularCuotaAutonomo (Capa 1 · SS 2026 ✓)', () => {
  test('GOLDEN-K: rendimiento 1.600 €/mes → tramo 6, base 960,78 €, cuota 302,65 €/mes [SS ✓]', () => {
    const res = calcularCuotaAutonomo({ rendimientoNetoMensual: 1600 });
    expect(res.tramo).toBe(6);
    expect(res.baseMinima).toBeCloseTo(960.78, 2);
    expect(res.baseCotizacion).toBeCloseTo(960.78, 2);   // base mínima por defecto
    expect(res.cuotaMensualGeneral).toBeCloseTo(302.65, 2);
    expect(res.cuotaEfectiva).toBeCloseTo(302.65, 2);
    expect(res.cuotaAnual).toBeCloseTo(3631.80, 2);
    expect(res.aplicaTarifaPlana).toBe(false);
    expect(res.tipoCotizacion).toBeCloseTo(31.5, 1);
  });

  test('GOLDEN-L: rendimiento 2.500 €/mes → tramo 10, base 1.356,21 €, cuota 427,21 €/mes [SS ✓]', () => {
    // Con la tabla 2023 (incorrecta) este caso daba 350 €/mes (base 1.111,11).
    // Con la tabla 2026 correcta la base mínima del tramo es 1.356,21.
    const res = calcularCuotaAutonomo({ rendimientoNetoMensual: 2500 });
    expect(res.tramo).toBe(10);
    expect(res.baseMinima).toBeCloseTo(1356.21, 2);
    expect(res.baseCotizacion).toBeCloseTo(1356.21, 2);
    expect(res.cuotaMensualGeneral).toBeCloseTo(427.21, 2);
    expect(res.cuotaEfectiva).toBeCloseTo(427.21, 2);
    expect(res.cuotaAnual).toBeCloseTo(5126.52, 2);
    expect(res.aplicaTarifaPlana).toBe(false);
  });

  test('GOLDEN-M: nuevo autónomo → tarifa plana 80 €/mes independiente del rendimiento', () => {
    const res = calcularCuotaAutonomo({ rendimientoNetoMensual: 2500, esNuevoAutonomo: true });
    expect(res.aplicaTarifaPlana).toBe(true);
    expect(res.cuotaEfectiva).toBeCloseTo(80, 2);
    expect(res.cuotaAnual).toBeCloseTo(960, 2);
    // La cuota general sigue calculada (no se oculta)
    expect(res.cuotaMensualGeneral).toBeCloseTo(427.21, 2);
    expect(res.cuotaConTarifaPlana).toBeCloseTo(80, 2);
  });
});

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
import { calcularIVA } from '../lib/calculadoras/iva';
import { calcularModelo130 } from '../lib/calculadoras/modelo130';
import { calcularModelo303 } from '../lib/calculadoras/modelo303';
import { calcularInteresCompuesto } from '../lib/calculadoras/interesCompuesto';
import { calcularPlusvaliasIRPF } from '../lib/calculadoras/plusvaliasIRPF';
import { calcularRetencionAlquiler } from '../lib/calculadoras/retencionAlquiler';
import { calcularRendimientoCapitalInmobiliario } from '../lib/calculadoras/rendimientoCapitalInmobiliario';

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

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularIVA
// Aritmética pura: base × tipo, sin tablas externas. Verificación interna.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularIVA (Capa 1 · aritmética)', () => {
  test('GOLDEN-N: añadir IVA general 21% sobre 1.000 € → cuota 210 €, total 1.210 €', () => {
    const res = calcularIVA({ importe: 1000, tipoIVA: 21, modo: 'anadir' });
    expect(res.baseImponible).toBeCloseTo(1000, 2);
    expect(res.cuotaIVA).toBeCloseTo(210, 2);
    expect(res.totalConIVA).toBeCloseTo(1210, 2);
    expect(res.tipoIVA).toBe(21);
  });

  test('GOLDEN-O: quitar IVA reducido 10% de 110 € → base 100 €, cuota 10 €', () => {
    const res = calcularIVA({ importe: 110, tipoIVA: 10, modo: 'quitar' });
    expect(res.baseImponible).toBeCloseTo(100, 2);
    expect(res.cuotaIVA).toBeCloseTo(10, 2);
    expect(res.totalConIVA).toBeCloseTo(110, 2);
  });

  test('GOLDEN-P: quitar IVA general 21% de 363 € → base 300 €, cuota 63 €', () => {
    const res = calcularIVA({ importe: 363, tipoIVA: 21, modo: 'quitar' });
    expect(res.baseImponible).toBeCloseTo(300, 2);
    expect(res.cuotaIVA).toBeCloseTo(63, 2);
    expect(res.totalConIVA).toBeCloseTo(363, 2);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularModelo130
// Fórmula RIRPF art. 110: 20% rendimiento neto - retenciones - pagos previos.
// Verificación interna (no existe simulador AEAT abierto para el 130).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularModelo130 (Capa 1 · RIRPF art. 110)', () => {
  test('GOLDEN-Q: T1 ingresos=15.000 € gastos=5.000 € sin retenciones → cuota 2.000 €', () => {
    const res = calcularModelo130({
      trimestre: 'T1', ingresosAcumulados: 15000,
      gastosDeduciblesAcumulados: 5000, retencionesAcumuladas: 0, pagosFraccionadosAnteriores: 0,
    });
    expect(res.rendimientoNetoAcumulado).toBeCloseTo(10000, 2);
    expect(res.cuotaBruta).toBeCloseTo(2000, 2);
    expect(res.cuotaAIngresar).toBeCloseTo(2000, 2);
    expect(res.obligacionPresentar).toBe(true);
  });

  test('GOLDEN-R: T2 ingresos=30k gastos=10k retenciones=1k previos=2k → cuota 1.000 €', () => {
    const res = calcularModelo130({
      trimestre: 'T2', ingresosAcumulados: 30000,
      gastosDeduciblesAcumulados: 10000, retencionesAcumuladas: 1000, pagosFraccionadosAnteriores: 2000,
    });
    expect(res.rendimientoNetoAcumulado).toBeCloseTo(20000, 2);
    expect(res.cuotaBruta).toBeCloseTo(4000, 2);
    // 4.000 - 1.000 retenciones - 2.000 previos = 1.000
    expect(res.cuotaAIngresar).toBeCloseTo(1000, 2);
  });

  test('GOLDEN-S: gastos > ingresos → rendimiento negativo → cuota 0 (no devuelve)', () => {
    const res = calcularModelo130({
      trimestre: 'T3', ingresosAcumulados: 5000,
      gastosDeduciblesAcumulados: 6000, retencionesAcumuladas: 0, pagosFraccionadosAnteriores: 0,
    });
    expect(res.rendimientoNetoAcumulado).toBeCloseTo(-1000, 2);
    expect(res.cuotaBruta).toBeCloseTo(0, 2);
    expect(res.cuotaAIngresar).toBeCloseTo(0, 2);
  });

  test('GOLDEN-T: retenciones cubren toda la cuota → cuota 0 (las retenciones absorben el 20%)', () => {
    const res = calcularModelo130({
      trimestre: 'T3', ingresosAcumulados: 9000,
      gastosDeduciblesAcumulados: 0, retencionesAcumuladas: 1800, pagosFraccionadosAnteriores: 0,
    });
    expect(res.cuotaBruta).toBeCloseTo(1800, 2);   // 9.000 × 20%
    expect(res.cuotaAIngresar).toBeCloseTo(0, 2);   // 1.800 - 1.800 = 0
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularModelo303
// Ley 37/1992 IVA: devengado - soportado = diferencial. Aritmética pura.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularModelo303 (Capa 1 · Ley IVA 37/1992)', () => {
  test('GOLDEN-U: T1 solo 21%, emit=10.000 € recib=3.000 € → diferencial 1.470 € (a ingresar)', () => {
    const res = calcularModelo303({
      trimestre: 'T1', baseImponibleEmitidas21: 10000, baseImponibleRecibidas21: 3000,
    });
    expect(res.ivaDevengadoTotal).toBeCloseTo(2100, 2);
    expect(res.ivaSoportadoTotal).toBeCloseTo(630, 2);
    expect(res.cuotaDiferencial).toBeCloseTo(1470, 2);
    expect(res.resultadoFinal).toBeCloseTo(1470, 2);
    expect(res.aIngresar).toBe(true);
    expect(res.aCompensar).toBe(false);
  });

  test('GOLDEN-V: T2 mix tipos (21%+10%) emit=7.000 € recib=1.000 € → diferencial 1.040 €', () => {
    const res = calcularModelo303({
      trimestre: 'T2',
      baseImponibleEmitidas21: 5000, baseImponibleEmitidas10: 2000,
      baseImponibleRecibidas21: 1000,
    });
    // devengado = 5000×0.21 + 2000×0.10 = 1050+200 = 1250
    expect(res.ivaDevengadoTotal).toBeCloseTo(1250, 2);
    expect(res.ivaSoportadoTotal).toBeCloseTo(210, 2);
    expect(res.cuotaDiferencial).toBeCloseTo(1040, 2);
    expect(res.resultadoFinal).toBeCloseTo(1040, 2);
  });

  test('GOLDEN-W: T4 IVA soportado > devengado → resultado negativo → puede solicitar devolución', () => {
    const res = calcularModelo303({
      trimestre: 'T4', baseImponibleEmitidas21: 1000, baseImponibleRecibidas21: 5000,
    });
    expect(res.ivaDevengadoTotal).toBeCloseTo(210, 2);
    expect(res.ivaSoportadoTotal).toBeCloseTo(1050, 2);
    expect(res.cuotaDiferencial).toBeCloseTo(-840, 2);
    expect(res.resultadoFinal).toBeCloseTo(-840, 2);
    expect(res.aCompensar).toBe(true);
    expect(res.puedesolicitarDevolucion).toBe(true);
  });

  test('GOLDEN-X: T2 con compensación anterior 500 € → resultadoFinal 970 €', () => {
    const res = calcularModelo303({
      trimestre: 'T2',
      baseImponibleEmitidas21: 10000, baseImponibleRecibidas21: 3000,
      compensacionAnterior: 500,
    });
    expect(res.cuotaDiferencial).toBeCloseTo(1470, 2);
    expect(res.compensacionAplicada).toBeCloseTo(500, 2);
    expect(res.resultadoFinal).toBeCloseTo(970, 2);
    expect(res.aIngresar).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularInteresCompuesto
// Fórmula exponencial estándar + anualidades. Verificación interna.
// Nota: aportacionPeriodica se interpreta siempre como €/mes
// (la función la convierte a aportación por período internamente).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularInteresCompuesto (Capa 1 · fórmula exponencial)', () => {
  test('GOLDEN-Y: 10.000 € al 5% anual durante 10 años sin aportaciones → 16.288,95 €', () => {
    const res = calcularInteresCompuesto({ capitalInicial: 10000, tasaAnual: 5, anos: 10 });
    expect(res.capitalFinal).toBeCloseTo(16288.95, 2);
    expect(res.totalAportado).toBeCloseTo(10000, 2);
    expect(res.totalIntereses).toBeCloseTo(6288.95, 2);
    expect(res.rentabilidadPct).toBeCloseTo(62.9, 1);
  });

  test('GOLDEN-Z: 1.000 € al 6% mensual, 5 años, 100 €/mes aportación → 8.325,85 €', () => {
    const res = calcularInteresCompuesto({
      capitalInicial: 1000, tasaAnual: 6, anos: 5,
      aportacionPeriodica: 100, frecuenciaCapitalizacion: 'mensual',
    });
    expect(res.capitalFinal).toBeCloseTo(8325.85, 2);
    expect(res.totalAportado).toBeCloseTo(7000, 2);    // 1000 + 100×12×5
    expect(res.totalIntereses).toBeCloseTo(1325.85, 2);
    expect(res.rentabilidadPct).toBeCloseTo(18.9, 1);
  });

  test('GOLDEN-AA: tasa 0% — el capital final = total aportado, intereses exactamente 0', () => {
    const res = calcularInteresCompuesto({
      capitalInicial: 5000, tasaAnual: 0, anos: 3, aportacionPeriodica: 200,
    });
    expect(res.capitalFinal).toBeCloseTo(12200, 2);    // 5000 + 200×12×3
    expect(res.totalAportado).toBeCloseTo(12200, 2);
    expect(res.totalIntereses).toBeCloseTo(0, 2);
    expect(res.rentabilidadPct).toBeCloseTo(0, 1);
  });

  test('GOLDEN-AB: 10.000 € al 7% trimestral 20 años sin aport → 40.063,92 € (efecto capitalización)', () => {
    const res = calcularInteresCompuesto({
      capitalInicial: 10000, tasaAnual: 7, anos: 20,
      frecuenciaCapitalizacion: 'trimestral',
    });
    // trimestral > anual por mismo tipo nominal → capital mayor que 7% anual puro
    expect(res.capitalFinal).toBeCloseTo(40063.92, 2);
    expect(res.totalAportado).toBeCloseTo(10000, 2);
    expect(res.totalIntereses).toBeCloseTo(30063.92, 2);
    expect(res.rentabilidadPct).toBeCloseTo(300.6, 1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularSucesion (ISD)
// Tarifa estatal (Ley 29/1987) + tarifa Cataluña.
// Todos los casos verificados internamente con la misma fórmula que el código.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularSucesion (Capa 1 · tarifa ISD estatal + autonómica)', () => {

  test('GOLDEN-AC: Madrid, I-descendiente, 200.000 € → 99% bonif → cuotaFinal 177,52 €', () => {
    // Hijo hereda 200.000 € de padre. Madrid aplica 99% bonificación.
    // baseLiquidable = 200.000 − 15.956,87 (red. parentesco) = 184.043,13
    // cuotaIntegra (tramo 4) = 17.751,99; bonif 99% → cuotaFinal = 177,52 €
    const res = calcularSucesion({ baseImponible: 200000, ccaa: 'madrid', grupo: 'I-descendiente' });
    expect(res.reduccionParentesco).toBeCloseTo(15956.87, 2);
    expect(res.baseLiquidable).toBeCloseTo(184043.13, 2);
    expect(res.cuotaIntegra).toBeCloseTo(17751.99, 2);
    expect(res.coeficienteMultiplicador).toBe(1.0);
    expect(res.cuotaTributaria).toBeCloseTo(17751.99, 2);
    expect(res.bonificacionCcaa).toBeCloseTo(17574.47, 2);
    expect(res.porcentajeBonificacion).toBeCloseTo(99, 1);
    expect(res.cuotaFinal).toBeCloseTo(177.52, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.09, 2);
    expect(res.esForal).toBe(false);
  });

  test('GOLDEN-AD: Asturias, Grupo IV (extraño), 50.000 € → coef×2 → cuotaFinal 8.671,82 €', () => {
    // Grupo IV (no pariente): sin reducción parentesco, coeficiente multiplicador 2,0.
    // baseLiquidable = 50.000; cuotaIntegra (tramo 3) = 4.335,91; ×2 = 8.671,82 €
    const res = calcularSucesion({ baseImponible: 50000, ccaa: 'asturias', grupo: 'IV' });
    expect(res.reduccionParentesco).toBe(0);
    expect(res.baseLiquidable).toBe(50000);
    expect(res.cuotaIntegra).toBeCloseTo(4335.91, 2);
    expect(res.coeficienteMultiplicador).toBe(2.0);
    expect(res.cuotaTributaria).toBeCloseTo(8671.82, 2);
    expect(res.bonificacionCcaa).toBe(0);
    expect(res.cuotaFinal).toBeCloseTo(8671.82, 2);
    expect(res.tipoEfectivo).toBeCloseTo(17.34, 2);
  });

  test('GOLDEN-AE: Cataluña, Grupo II, 300.000 € → tarifa propia → cuotaFinal 31.500 €', () => {
    // Cataluña usa tarifa propia (7%–32%) y reducción parentesco propia (50.000 €).
    // baseLiquidable = 300.000 − 50.000 = 250.000; tramo 17% → cuotaIntegra = 31.500 €
    const res = calcularSucesion({ baseImponible: 300000, ccaa: 'cataluna', grupo: 'II' });
    expect(res.reduccionParentesco).toBeCloseTo(50000, 2);
    expect(res.baseLiquidable).toBe(250000);
    expect(res.cuotaIntegra).toBeCloseTo(31500, 2);
    expect(res.cuotaFinal).toBeCloseTo(31500, 2);
    expect(res.tipoEfectivo).toBeCloseTo(10.5, 2);
    expect(res.esForal).toBe(true);
    expect(res.tarifaAplicada).toContain('Cataluña');
  });

  test('GOLDEN-AF: Madrid, I-descendiente, 200.000 € + vivienda 200.000 € → cuotaFinal 54,05 €', () => {
    // Reducción vivienda habitual al 95%, pero tope 122.606,47 €.
    // 200.000 × 95% = 190.000 → se aplica el tope de 122.606,47 €.
    // baseLiquidable = 200.000 − 15.956,87 − 122.606,47 = 61.436,66
    const res = calcularSucesion({
      baseImponible: 200000, ccaa: 'madrid', grupo: 'I-descendiente',
      viviendaHabitual: 200000,
    });
    expect(res.reduccionVivienda).toBeCloseTo(122606.47, 2);
    expect(res.totalReducciones).toBeCloseTo(138563.34, 2);
    expect(res.baseLiquidable).toBeCloseTo(61436.66, 2);
    expect(res.cuotaIntegra).toBeCloseTo(5405.24, 2);
    expect(res.cuotaTributaria).toBeCloseTo(5405.24, 2);
    expect(res.bonificacionCcaa).toBeCloseTo(5351.19, 2);
    expect(res.cuotaFinal).toBeCloseTo(54.05, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.03, 2);
  });

  test('GOLDEN-AG: Madrid, I-descendiente, 200.000 €, edad 16 → reducción menor-21 → cuotaFinal 157,17 €', () => {
    // Reducción por edad: (21−16) × 3.990,72 = 19.953,60 €.
    // baseLiquidable = 200.000 − 15.956,87 − 19.953,60 = 164.089,53
    const res = calcularSucesion({
      baseImponible: 200000, ccaa: 'madrid', grupo: 'I-descendiente', edadHeredero: 16,
    });
    expect(res.reduccionEdadMenor21).toBeCloseTo(19953.6, 2);
    expect(res.totalReducciones).toBeCloseTo(35910.47, 2);
    expect(res.baseLiquidable).toBeCloseTo(164089.53, 2);
    expect(res.cuotaIntegra).toBeCloseTo(15716.72, 2);
    expect(res.bonificacionCcaa).toBeCloseTo(15559.55, 2);
    expect(res.cuotaFinal).toBeCloseTo(157.17, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.08, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularIRPF
// Tramos estatal + autonómico medio 2025 (Ley 35/2006 + LPGE 2025).
// Todos los casos verificados internamente. Pipeline:
//   input → −gastos deducibles (2.000€) → −reducción RNT (art.20) → tarifa progresiva → −mínimo personal/familiar
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularIRPF (Capa 1 · tarifa progresiva 2025)', () => {

  test('GOLDEN-AH: soltero, 30.000 € trabajo → cuota 4.198,14 €, tipo 16,38%', () => {
    // rntBruto = 28.000 → red. RNT 2.364 (>=16.825) → rtn=25.636
    // blg = 25.636 − 5.550 = 20.086 → cruza tramos 19% y 24%
    const res = calcularIRPF({ rendimientosTrabajo: 30000 });
    expect(res.gastosDeducibles).toBe(2000);
    expect(res.reduccionRNT).toBe(2364);
    expect(res.rendimientosTrabajoNetos).toBe(25636);
    expect(res.baseImponibleGeneral).toBe(25636);
    expect(res.minimoPersonalFamiliar).toBe(5550);
    expect(res.baseLiquidableGeneral).toBe(20086);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(4198.14, 2);
    expect(res.cuotaIntegralAhorro).toBe(0);
    expect(res.cuotaIntegra).toBeCloseTo(4198.14, 2);
    expect(res.tipoEfectivoGeneral).toBeCloseTo(16.38, 2);
  });

  test('GOLDEN-AI: soltero, 60.000 € trabajo → cuota 14.233,32 €, tipo 25,58%', () => {
    // rntBruto = 58.000 → red. RNT 2.364 → rtn=55.636 → blg=50.086
    // Activa tramos 19%, 24%, 30% y 37% (parcial)
    const res = calcularIRPF({ rendimientosTrabajo: 60000 });
    expect(res.reduccionRNT).toBe(2364);
    expect(res.rendimientosTrabajoNetos).toBe(55636);
    expect(res.baseLiquidableGeneral).toBe(50086);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(14233.32, 2);
    expect(res.cuotaIntegra).toBeCloseTo(14233.32, 2);
    expect(res.tipoEfectivoGeneral).toBeCloseTo(25.58, 2);
  });

  test('GOLDEN-AJ: soltero, 13.000 € trabajo → mínimo personal cubre la base → cuota 0 €', () => {
    // rntBruto=11.000 → red. RNT 6.498 (máxima, ≤13.115) → rtn=4.502
    // blg = max(0, 4.502 − 5.550) = 0 → el mínimo personal absorbe toda la base
    const res = calcularIRPF({ rendimientosTrabajo: 13000 });
    expect(res.reduccionRNT).toBe(6498);
    expect(res.rendimientosTrabajoNetos).toBeCloseTo(4502, 2);
    expect(res.baseLiquidableGeneral).toBe(0);
    expect(res.cuotaIntegra).toBe(0);
    expect(res.cuotaDiferencial).toBe(0);
    expect(res.tipoEfectivoGeneral).toBe(0);
  });

  test('GOLDEN-AK: 40.000 € trabajo + 5.000 € capital, 2 hijos, 4.000 € retenciones → diferencial 2.611,30 €', () => {
    // Base ahorro 5.000 € al 19% → 950 €. Base general: mínimo 10.650 (personal+2hijos)
    // cuotaGeneral = 5.661,30 + cuotaAhorro 950 = 6.611,30 − 4.000 ret = 2.611,30 €
    const res = calcularIRPF({
      rendimientosTrabajo: 40000,
      rendimientosCapitalMobiliario: 5000,
      numHijos: 2,
      retenciones: 4000,
    });
    expect(res.minimoPersonalFamiliar).toBe(10650);   // 5550 + 2400 + 2700
    expect(res.baseLiquidableGeneral).toBeCloseTo(24986, 2);
    expect(res.baseImponibleAhorro).toBe(5000);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(5661.3, 2);
    expect(res.cuotaIntegralAhorro).toBeCloseTo(950, 2);
    expect(res.cuotaIntegra).toBeCloseTo(6611.3, 2);
    expect(res.retenciones).toBe(4000);
    expect(res.cuotaDiferencial).toBeCloseTo(2611.3, 2);
    expect(res.tipoEfectivoGeneral).toBeCloseTo(15.89, 2);
  });

  test('GOLDEN-AL: 17.000 € trabajo → zona interpolación reducción RNT → cuota 969,17 €', () => {
    // rntBruto=15.000, entre 13.115 y 16.825 → reducción interpolada: 6.498 − 1,14×(15.000−13.115)
    // = 6.498 − 2.148,90 = 4.349,10 → rtn=10.650,90 → blg=5.100,90 → tipo 19%
    const res = calcularIRPF({ rendimientosTrabajo: 17000 });
    expect(res.reduccionRNT).toBeCloseTo(4349.1, 2);
    expect(res.rendimientosTrabajoNetos).toBeCloseTo(10650.9, 2);
    expect(res.baseLiquidableGeneral).toBeCloseTo(5100.9, 2);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(969.17, 2);
    expect(res.cuotaIntegra).toBeCloseTo(969.17, 2);
    expect(res.tipoEfectivoGeneral).toBeCloseTo(9.1, 1);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPlusvaliasIRPF
// Tramos base del ahorro 2025 (arts. 33-39 + 66 Ley 35/2006).
// Verificación interna: aritmética pura sobre tramos conocidos.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPlusvaliasIRPF (Capa 1 · base del ahorro 2025)', () => {

  test('GOLDEN-AM: ganancia 3.700 € (< 6.000 €) → solo tramo 19% → cuota 703 €', () => {
    // compra 10.200 € (10k+200 gastos), venta 13.900 € (14k-100 gastos), 730 días → largo plazo
    const res = calcularPlusvaliasIRPF({
      precioCompra: 10000, gastosCompra: 200,
      precioVenta: 14000, gastosVenta: 100,
      fechaCompra: '2022-01-01', fechaVenta: '2024-01-01',
    });
    expect(res.precioAdquisicion).toBe(10200);
    expect(res.precioTransmision).toBe(13900);
    expect(res.gananciaNeta).toBe(3700);
    expect(res.esGanancia).toBe(true);
    expect(res.esLargoPlazo).toBe(true);
    expect(res.diasTranscurridos).toBe(730);
    expect(res.baseLiquidable).toBe(3700);
    expect(res.cuotaIRPF).toBe(703);
    expect(res.tipoEfectivo).toBe(19);
    expect(res.gananciaNeta_DI).toBe(2997);
    expect(res.rentabilidadNetaImpuestos).toBeCloseTo(29.38, 2);
  });

  test('GOLDEN-AN: ganancia 25.000 € → cruza tramos 19% + 21% → cuota 5.130 €', () => {
    // 19%×6.000=1.140 + 21%×19.000=3.990 = 5.130 €; tipo efectivo 20,52%
    const res = calcularPlusvaliasIRPF({
      precioCompra: 50000, precioVenta: 75000,
      fechaCompra: '2020-01-01', fechaVenta: '2025-01-01',
    });
    expect(res.gananciaNeta).toBe(25000);
    expect(res.baseLiquidable).toBe(25000);
    expect(res.cuotaIRPF).toBe(5130);
    expect(res.tipoEfectivo).toBeCloseTo(20.52, 2);
    expect(res.gananciaNeta_DI).toBe(19870);
    expect(res.rentabilidadNetaImpuestos).toBeCloseTo(39.74, 2);
    expect(res.desglose).toHaveLength(2);
    expect(res.desglose[0]).toMatchObject({ tipo: 19, cuota: 1140 });
    expect(res.desglose[1]).toMatchObject({ tipo: 21, cuota: 3990 });
  });

  test('GOLDEN-AO: pérdida patrimonial −3.000 € → cuota 0, base liquidable 0', () => {
    // Venta por debajo del precio de compra → esGanancia=false, sin tributación
    const res = calcularPlusvaliasIRPF({
      precioCompra: 10000, precioVenta: 7000,
      fechaCompra: '2021-01-01', fechaVenta: '2024-01-01',
    });
    expect(res.gananciaNeta).toBe(-3000);
    expect(res.esGanancia).toBe(false);
    expect(res.baseLiquidable).toBe(0);
    expect(res.cuotaIRPF).toBe(0);
    expect(res.tipoEfectivo).toBe(0);
    expect(res.gananciaNeta_DI).toBe(-3000);
  });

  test('GOLDEN-AP: ganancia 10.000 € con compensación 3.000 € → base 7.000 € → cuota 1.350 €', () => {
    // saldoCompensado = 3.000 → baseLiquidable = 7.000
    // 19%×6.000=1.140 + 21%×1.000=210 = 1.350 €; tipo efectivo 13,5%
    const res = calcularPlusvaliasIRPF({
      precioCompra: 10000, precioVenta: 20000,
      fechaCompra: '2020-01-01', fechaVenta: '2025-01-01',
      saldoCompensacion: 3000,
    });
    expect(res.gananciaNeta).toBe(10000);
    expect(res.saldoCompensado).toBe(3000);
    expect(res.baseLiquidable).toBe(7000);
    expect(res.cuotaIRPF).toBe(1350);
    expect(res.tipoEfectivo).toBeCloseTo(13.5, 2);
    expect(res.gananciaNeta_DI).toBe(8650);
    expect(res.rentabilidadNetaImpuestos).toBeCloseTo(86.5, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularRetencionAlquiler
// Verificación interna. Bug previo corregido (2026-06-09): calcularCuotaIRPF
// usaba fórmula no estándar que producía valores ~10× incorrectos. Fix: tarifa
// progresiva diferencial (tarifa(total) − tarifa(otros)).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularRetencionAlquiler (Capa 1)', () => {

  test('GOLDEN-AQ: 800 €/mes, pc=150.000 € → amort 3.150, rn 6.450, cuota 490,20 €', () => {
    // Amortización = 150.000 × 70% × 3% = 3.150. Reducción 60% → rnr = 2.580
    // IRPF sobre 2.580 al 19% = 490,20 € (sin arrendatario empresa → sin retención)
    const res = calcularRetencionAlquiler({ alquilerMensual: 800, precioCompra: 150000 });
    expect(res.ingresosIntegros).toBe(9600);
    expect(res.gastos.amortizacion).toBe(3150);
    expect(res.gastos.total).toBe(3150);
    expect(res.rendimientoNeto).toBe(6450);
    expect(res.reduccionViviendaHabitual).toBe(true);
    expect(res.reduccion60pct).toBe(3870);
    expect(res.rendimientoNetoReducido).toBe(2580);
    expect(res.cuotaIRPFEstimada).toBeCloseTo(490.2, 2);
    expect(res.tipoMarginal).toBe(19);
    expect(res.retencionAnual).toBe(0);
    expect(res.cuotaDiferencial).toBeCloseTo(490.2, 2);
    expect(res.aDevolver).toBe(false);
  });

  test('GOLDEN-AR: 1.000 €/mes empresa, gastos+hipoteca → retención 2.280 → a devolver 1.938 €', () => {
    // Arrendatario empresa: retención 19% × 12.000 = 2.280. Cuota IRPF 342 < 2.280 → devolver
    const res = calcularRetencionAlquiler({
      alquilerMensual: 1000, precioCompra: 200000,
      ibi: 500, comunidad: 600, seguro: 200, interesesHipoteca: 2000,
      arrendatarioEmpresa: true,
    });
    expect(res.ingresosIntegros).toBe(12000);
    expect(res.gastos.amortizacion).toBe(4200);
    expect(res.gastos.total).toBe(7500);
    expect(res.rendimientoNeto).toBe(4500);
    expect(res.rendimientoNetoReducido).toBe(1800);
    expect(res.cuotaIRPFEstimada).toBeCloseTo(342, 2);
    expect(res.retencionAnual).toBe(2280);
    expect(res.retencionMensual).toBe(190);
    expect(res.cuotaDiferencial).toBeCloseTo(-1938, 2);
    expect(res.aDevolver).toBe(true);
  });

  test('GOLDEN-AS: 500 €/mes, gastos > ingresos → rendimientoNeto −1.220 → cuota 0', () => {
    // Gastos 7.220 > ingresos 6.000 → rendimiento negativo, sin reducción, sin IRPF
    const res = calcularRetencionAlquiler({
      alquilerMensual: 500, precioCompra: 120000,
      interesesHipoteca: 4000, ibi: 400, comunidad: 300,
    });
    expect(res.ingresosIntegros).toBe(6000);
    expect(res.gastos.amortizacion).toBe(2520);
    expect(res.gastos.total).toBe(7220);
    expect(res.rendimientoNeto).toBe(-1220);
    expect(res.reduccionViviendaHabitual).toBe(false);
    expect(res.reduccion60pct).toBe(0);
    expect(res.cuotaIRPFEstimada).toBe(0);
    expect(res.cuotaDiferencial).toBe(0);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularRendimientoCapitalInmobiliario
// LIRPF arts. 22-24 + Ley 12/2023. Verificación interna.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularRendimientoCapitalInmobiliario (Capa 1)', () => {

  test('GOLDEN-AT: vivienda habitual 50%, 12.000 € ingresos, valorConst=150.000 → rnr 3.350 €', () => {
    // Amort = 150.000 × 3% = 4.500. Gastos = 4.500+600+200 = 5.300. rn = 6.700 → 50% → 3.350
    const res = calcularRendimientoCapitalInmobiliario({
      tipoInmueble: 'vivienda_habitual_arrendatario',
      ingresosIntegros: 12000,
      gastos: { ibiYTributos: 600, seguros: 200, valorConstruccion: 150000 },
    });
    expect(res.amortizacionComputada).toBe(4500);
    expect(res.totalGastosBrutos).toBe(5300);
    expect(res.totalGastosEfectivos).toBe(5300);
    expect(res.excesoNoDeducible).toBe(0);
    expect(res.rendimientoNeto).toBe(6700);
    expect(res.pctReduccion).toBe(50);
    expect(res.importeReduccion).toBe(3350);
    expect(res.rendimientoNetoReducido).toBe(3350);
  });

  test('GOLDEN-AU: local (no_vivienda), amortización directa → sin reducción → rnr = rn', () => {
    // Local comercial: sin reducción. rn = 8.000 − 2.400 = 5.600 = rnr
    const res = calcularRendimientoCapitalInmobiliario({
      tipoInmueble: 'no_vivienda',
      ingresosIntegros: 8000,
      gastos: { ibiYTributos: 400, amortizacionDirecta: 2000 },
    });
    expect(res.amortizacionComputada).toBe(2000);
    expect(res.totalGastosBrutos).toBe(2400);
    expect(res.rendimientoNeto).toBe(5600);
    expect(res.pctReduccion).toBe(0);
    expect(res.importeReduccion).toBe(0);
    expect(res.rendimientoNetoReducido).toBe(5600);
  });

  test('GOLDEN-AV: intereses+reparación (8.000) > ingresos (6.000) → exceso 2.000 no deducible, rn −300', () => {
    // Gastos sujetos a límite = 5.000+3.000 = 8.000 > 6.000 → exceso 2.000 trasladable 4 años
    // Gastos efectivos = 6.000+300 = 6.300 → rn = −300 → no aplica reducción
    const res = calcularRendimientoCapitalInmobiliario({
      tipoInmueble: 'vivienda_habitual_arrendatario',
      ingresosIntegros: 6000,
      gastos: { interesesPrestamo: 5000, reparacionConservacion: 3000, ibiYTributos: 300 },
    });
    expect(res.gastosSujetosLimite).toBe(8000);
    expect(res.limiteGastos).toBe(6000);
    expect(res.excesoNoDeducible).toBe(2000);
    expect(res.totalGastosBrutos).toBe(8300);
    expect(res.totalGastosEfectivos).toBe(6300);
    expect(res.rendimientoNeto).toBe(-300);
    expect(res.importeReduccion).toBe(0);        // no aplica: rn negativo
    expect(res.rendimientoNetoReducido).toBe(-300);
  });

});

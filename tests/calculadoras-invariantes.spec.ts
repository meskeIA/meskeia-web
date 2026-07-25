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
import { calcularGastosCompraInmueble } from '../lib/calculadoras/gastosCompraInmueble';
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
import { calcularDonacion } from '../lib/calculadoras/donaciones';
import { calcularAmortizacionAnticipada } from '../lib/calculadoras/amortizacionAnticipada';
import { calcularTarifaFreelance } from '../lib/calculadoras/tarifaFreelance';
import { calcularGastosDeduciblesAutonomo } from '../lib/calculadoras/gastosDeduciblesAutonomo';
import { calcularReduccionJornada } from '../lib/calculadoras/reduccionJornada';
import { calcularCapacidadHipoteca } from '../lib/calculadoras/capacidadHipoteca';
import { calcularGananciaCriptomonedas } from '../lib/calculadoras/gananciaCriptomonedas';
import { calcularPlanPensiones } from '../lib/calculadoras/planPensiones';
import { calcularBajaMedica } from '../lib/calculadoras/bajaMedica';
import { calcularJubilacionAnticipada } from '../lib/calculadoras/jubilacionAnticipada';
import { calcularPensionIncapacidad } from '../lib/calculadoras/pensionIncapacidad';
import { calcularPensionViudedad } from '../lib/calculadoras/pensionViudedad';
import { calcularPrestacionMaternidadPaternidad } from '../lib/calculadoras/prestacionMaternidadPaternidad';
import { calcularExcedencia } from '../lib/calculadoras/excedencia';
import { calcularComplementoBrechaGenero } from '../lib/calculadoras/complementoBrechaGenero';
import { calcularImpuestoSociedades } from '../lib/calculadoras/impuestoSociedades';

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
// CAPA 1 — Golden tests: compararAutonomoVsSL — IS micropymes (escala Ley 7/2024)
//
// Verificado 2026-06-10: el tipo plano histórico (23%) quedó OBSOLETO desde el
// ejercicio 2025. La Ley 7/2024 introduce una escala progresiva para
// microempresas (cifra de negocio < 1M €): 2026 → 19% (hasta 50.000 € BI) /
// 21% (resto). Ver TRAMOS_IS_MICROPYMES_2026 en data/fiscal/sociedades.ts.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — compararAutonomoVsSL (Capa 1 · IS micropymes 2026 ✓)', () => {
  test('GOLDEN-MICROPYME-A: BI 40.000 € (≤ 50.000 €) → IS = 19% plano = 7.600 €', () => {
    const cmp = compararAutonomoVsSL({ beneficioAnual: 60000, gastosDeducibles: 20000, tipoIS: 'micropyme', repartirDividendos: true });
    expect(cmp.sl.baseImponible).toBeCloseTo(40000, 2);
    expect(cmp.sl.cuotaImpuesto).toBeCloseTo(7600, 2);
    expect(cmp.tipoISAplicado).toBeCloseTo(19, 2);
    expect(cmp.sl.irpfDividendos).toBeCloseTo(6684, 2);
    expect(cmp.sl.totalCargas).toBeCloseTo(20463.88, 2);
    expect(cmp.sl.netoAnual).toBeCloseTo(19536.12, 2);
  });

  test('GOLDEN-MICROPYME-B: BI 80.000 € (> 50.000 €) → escala 19%/21% = 15.800 € (tipo medio 19,75%)', () => {
    const cmp = compararAutonomoVsSL({ beneficioAnual: 100000, gastosDeducibles: 20000, tipoIS: 'micropyme', repartirDividendos: true });
    expect(cmp.sl.baseImponible).toBeCloseTo(80000, 2);
    expect(cmp.sl.cuotaImpuesto).toBeCloseTo(15800, 2);
    expect(cmp.tipoISAplicado).toBeCloseTo(19.75, 2);
    expect(cmp.sl.irpfDividendos).toBeCloseTo(13646, 2);
    expect(cmp.sl.totalCargas).toBeCloseTo(35625.88, 2);
    expect(cmp.sl.netoAnual).toBeCloseTo(44374.12, 2);
  });

  test('REGRESIÓN: tipoIS "general" sigue aplicando el 25% plano (no afectado por la escala micropyme)', () => {
    const cmp = compararAutonomoVsSL({ beneficioAnual: 60000, gastosDeducibles: 20000, tipoIS: 'general', repartirDividendos: false });
    expect(cmp.sl.baseImponible).toBeCloseTo(40000, 2);
    expect(cmp.sl.cuotaImpuesto).toBeCloseTo(10000, 2); // 40.000 × 25%
    expect(cmp.tipoISAplicado).toBeCloseTo(25, 2);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularImpuestoSociedades — IS micropymes (escala Ley 7/2024)
//
// Verificado 2026-06-10: 'pyme' (23% plano) y 'microempresa' (20% plano,
// requisito de plantilla nunca incorporado a la ley) eran categorías
// obsoletas/incorrectas. La Ley 7/2024 unifica ambas bajo la misma escala
// progresiva para entidades con cifra de negocio < 1M€: 2026 → 19% (hasta
// 50.000 € BI) / 21% (resto). Ver TRAMOS_IS_MICROPYMES_2026 en data/fiscal/sociedades.ts.
// La reserva de nivelación (art. 105 LIS, 10% de la BI) se aplica siempre
// para 'pyme'/'microempresa' antes de calcular la escala.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularImpuestoSociedades (Capa 1 · IS micropymes 2026 ✓)', () => {
  test('GOLDEN-IS-PYME-A: BI 40.000 € → reserva nivelación 4.000 € → BL 36.000 € (≤ 50.000 €) → IS = 19% = 6.840 €', () => {
    const r = calcularImpuestoSociedades({ regimenFiscal: 'pyme', baseImponible: 40000 });
    expect(r.reservaNivelacion).toBeCloseTo(4000, 2);
    expect(r.baseLiquidable).toBeCloseTo(36000, 2);
    expect(r.cuotaIntegra).toBeCloseTo(6840, 2);
    expect(r.tipoGravamen).toBeCloseTo(19, 2);
    expect(r.cuotaLiquida).toBeCloseTo(6840, 2);
    expect(r.tipoEfectivo).toBeCloseTo(17.1, 2);
  });

  test('GOLDEN-IS-MICROEMPRESA-B: BI 100.000 € → reserva nivelación 10.000 € → BL 90.000 € (> 50.000 €) → escala 19%/21% = 17.900 € (tipo medio 19,89%)', () => {
    const r = calcularImpuestoSociedades({ regimenFiscal: 'microempresa', baseImponible: 100000 });
    expect(r.reservaNivelacion).toBeCloseTo(10000, 2);
    expect(r.baseLiquidable).toBeCloseTo(90000, 2);
    expect(r.cuotaIntegra).toBeCloseTo(17900, 2);
    expect(r.tipoGravamen).toBeCloseTo(19.89, 2);
    expect(r.cuotaLiquida).toBeCloseTo(17900, 2);
    expect(r.tipoEfectivo).toBeCloseTo(17.9, 2);
  });

  test('EQUIVALENCIA: \'pyme\' y \'microempresa\' producen el mismo resultado (Ley 7/2024 unifica ambas categorías)', () => {
    const pyme = calcularImpuestoSociedades({ regimenFiscal: 'pyme', baseImponible: 75000 });
    const micro = calcularImpuestoSociedades({ regimenFiscal: 'microempresa', baseImponible: 75000 });
    expect(pyme.cuotaIntegra).toBeCloseTo(micro.cuotaIntegra, 2);
    expect(pyme.tipoGravamen).toBeCloseTo(micro.tipoGravamen, 2);
  });

  test('REGRESIÓN: regimenFiscal "general" sigue aplicando el 25% plano sin reserva de nivelación', () => {
    const r = calcularImpuestoSociedades({ regimenFiscal: 'general', baseImponible: 40000 });
    expect(r.reservaNivelacion).toBe(0);
    expect(r.baseLiquidable).toBeCloseTo(40000, 2);
    expect(r.cuotaIntegra).toBeCloseTo(10000, 2); // 40.000 × 25%
    expect(r.tipoGravamen).toBeCloseTo(25, 2);
    expect(r.tipoEfectivo).toBeCloseTo(25, 2);
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
// Bug previo corregido (2026-06-12): reducción por vivienda habitual usaba
// 60% (vigente hasta 2023); desde Ley 12/2023 (01/01/2024) es 50%.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularRetencionAlquiler (Capa 1)', () => {

  test('GOLDEN-AQ: 800 €/mes, pc=150.000 € → amort 3.150, rn 6.450, cuota 612,75 €', () => {
    // Amortización = 150.000 × 70% × 3% = 3.150. Reducción 50% → rnr = 3.225
    // IRPF sobre 3.225 al 19% = 612,75 € (sin arrendatario empresa → sin retención)
    const res = calcularRetencionAlquiler({ alquilerMensual: 800, precioCompra: 150000 });
    expect(res.ingresosIntegros).toBe(9600);
    expect(res.gastos.amortizacion).toBe(3150);
    expect(res.gastos.total).toBe(3150);
    expect(res.rendimientoNeto).toBe(6450);
    expect(res.reduccionViviendaHabitual).toBe(true);
    expect(res.reduccionVivienda).toBe(3225);
    expect(res.rendimientoNetoReducido).toBe(3225);
    expect(res.cuotaIRPFEstimada).toBeCloseTo(612.75, 2);
    expect(res.tipoMarginal).toBe(19);
    expect(res.retencionAnual).toBe(0);
    expect(res.cuotaDiferencial).toBeCloseTo(612.75, 2);
    expect(res.aDevolver).toBe(false);
  });

  test('GOLDEN-AR: 1.000 €/mes empresa, gastos+hipoteca → retención 2.280 → a devolver 1.852,50 €', () => {
    // Arrendatario empresa: retención 19% × 12.000 = 2.280. Reducción 50% → rnr = 2.250
    // Cuota IRPF 427,50 < 2.280 → devolver
    const res = calcularRetencionAlquiler({
      alquilerMensual: 1000, precioCompra: 200000,
      ibi: 500, comunidad: 600, seguro: 200, interesesHipoteca: 2000,
      arrendatarioEmpresa: true,
    });
    expect(res.ingresosIntegros).toBe(12000);
    expect(res.gastos.amortizacion).toBe(4200);
    expect(res.gastos.total).toBe(7500);
    expect(res.rendimientoNeto).toBe(4500);
    expect(res.reduccionVivienda).toBe(2250);
    expect(res.rendimientoNetoReducido).toBe(2250);
    expect(res.cuotaIRPFEstimada).toBeCloseTo(427.5, 2);
    expect(res.retencionAnual).toBe(2280);
    expect(res.retencionMensual).toBe(190);
    expect(res.cuotaDiferencial).toBeCloseTo(-1852.5, 2);
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
    expect(res.reduccionVivienda).toBe(0);
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

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularDonacion (Impuesto de Donaciones ISD)
// Ley 29/1987 ISD — tarifa estatal 16 tramos + tarifa Cataluña + bonificaciones CCAA.
// Verificación interna. Deuda técnica: bonificaciones autonómicas verificadas 2025-01-01.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularDonacion (Capa 1 · ISD donaciones)', () => {

  test('GOLDEN-AW: Madrid, I-descendiente, 30.000 € → cuotaFinal 11,26 € (bonif 99%)', () => {
    // reduccionParentesco = 15.956,87 → baseNetaReducida = 14.043,13
    // Tarifa estatal tramo 2: 611,50 + (14.043,13 − 7.993,46) × 8,5% = 1.125,72
    // bonif 99% → cuotaFinal ≈ 11,26 €, tipoEfectivo ≈ 0,04%
    const res = calcularDonacion({
      valorDonacion: 30000,
      ccaa: 'madrid',
      grupo: 'I-descendiente',
    });
    expect(res.baseImponible).toBe(30000);
    expect(res.baseLiquidable).toBe(30000);
    expect(res.reduccionParentesco).toBeCloseTo(15956.87, 2);
    expect(res.baseNetaReducida).toBeCloseTo(14043.13, 2);
    expect(res.cuotaIntegra).toBeCloseTo(1125.72, 2);
    expect(res.coeficienteMultiplicador).toBe(1);
    expect(res.cuotaTributaria).toBeCloseTo(1125.72, 2);
    expect(res.porcentajeBonificacion).toBe(99);
    expect(res.cuotaFinal).toBeCloseTo(11.26, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.04, 2);
    expect(res.esForal).toBe(false);
  });

  test('GOLDEN-AX: Asturias, Grupo IV, 50.000 € → coef 2,0, cuotaFinal 9.897,87 €, tipo 19,8%', () => {
    // Sin reducción de parentesco (Grupo IV = 0). Tarifa estatal: tramo 7 → 4.948,93.
    // Coeficiente multiplicador Grupo IV = 2,0 → 9.897,87. Sin bonificación autonómica.
    const res = calcularDonacion({
      valorDonacion: 50000,
      ccaa: 'asturias',
      grupo: 'IV',
    });
    expect(res.reduccionParentesco).toBe(0);
    expect(res.baseNetaReducida).toBe(50000);
    expect(res.cuotaIntegra).toBeCloseTo(4948.93, 2);
    expect(res.coeficienteMultiplicador).toBe(2);
    expect(res.cuotaTributaria).toBeCloseTo(9897.87, 2);
    expect(res.bonificacionCcaa).toBe(0);
    expect(res.cuotaFinal).toBeCloseTo(9897.87, 2);
    expect(res.tipoEfectivo).toBeCloseTo(19.8, 2);
    expect(res.esForal).toBe(false);
  });

  test('GOLDEN-AY: Cataluña, I-descendiente, 100.000 €, escritura → tarifa reducida 5%, cuota 5.000 €', () => {
    // Régimen foral. Tarifa reducida (Grupos I/II + escritura): 0 + 100.000 × 5% = 5.000.
    // Sin reducción de parentesco (Cataluña aplica su propia tarifa). Sin bonificación.
    const res = calcularDonacion({
      valorDonacion: 100000,
      ccaa: 'cataluna',
      grupo: 'I-descendiente',
      escrituraPublica: true,
    });
    expect(res.reduccionParentesco).toBe(0);
    expect(res.baseNetaReducida).toBe(100000);
    expect(res.cuotaIntegra).toBeCloseTo(5000, 2);
    expect(res.coeficienteMultiplicador).toBe(1);
    expect(res.cuotaTributaria).toBeCloseTo(5000, 2);
    expect(res.cuotaFinal).toBeCloseTo(5000, 2);
    expect(res.tipoEfectivo).toBeCloseTo(5, 2);
    expect(res.esForal).toBe(true);
    expect(res.tarifaAplicada).toContain('reducida');
  });

  test('GOLDEN-AZ: Madrid, I-descendiente, 80.000 €, discapacidad ≥65% → baseNetaReducida 0, cuota 0 €', () => {
    // reduccionParentesco 15.956,87 + reduccionDiscapacidad 150.253,03 > 80.000.
    // baseNetaReducida = max(0, 80.000 − 15.956,87 − 150.253,03) = 0 → cuota = 0.
    const res = calcularDonacion({
      valorDonacion: 80000,
      ccaa: 'madrid',
      grupo: 'I-descendiente',
      discapacidad: '65',
    });
    expect(res.reduccionParentesco).toBeCloseTo(15956.87, 2);
    expect(res.reduccionDiscapacidad).toBeCloseTo(150253.03, 2);
    expect(res.baseNetaReducida).toBe(0);
    expect(res.cuotaIntegra).toBe(0);
    expect(res.cuotaTributaria).toBe(0);
    expect(res.cuotaFinal).toBe(0);
    expect(res.tipoEfectivo).toBe(0);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularAmortizacionAnticipada
// Fórmula francesa (idéntica a calcularHipoteca). Verificación interna.
// cuotaOriginal coincide con GOLDEN-G (200k @ 3,5% 25a = 1.001,25 €).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularAmortizacionAnticipada (Capa 1 · fórmula francesa)', () => {

  test('GOLDEN-BA: 200k @ 3,5% 25a, amortizar 20k en mes 60 → cuota baja a 885,26 €, ahorro plazo 18.047,40 €', () => {
    // Saldo mes 60 = 172.640,81 €. Tras amortizar: 152.640,81 €.
    // Opción cuota: nueva cuota 885,26 € (−115,99), ahorra 7.836,92 € en intereses.
    // Opción plazo: termina 38 meses antes (202 meses restantes), ahorra 18.047,40 €.
    // Reducir plazo siempre domina en ahorro total de intereses (francés convexo).
    const res = calcularAmortizacionAnticipada({
      capitalInicial: 200000,
      plazoAnios: 25,
      tin: 3.5,
      importeAmortizacion: 20000,
      mesesTranscurridos: 60,
    });
    expect(res.cuotaOriginal).toBeCloseTo(1001.25, 2);   // coincide con GOLDEN-G
    expect(res.saldoAntes).toBeCloseTo(172640.81, 2);
    expect(res.saldoDespues).toBeCloseTo(152640.81, 2);
    expect(res.plazoRestanteMeses).toBe(240);            // 300 - 60
    expect(res.nuevaCuota).toBeCloseTo(885.26, 2);
    expect(res.reduccionCuota).toBeCloseTo(115.99, 2);
    expect(res.ahorroInteresesCuota).toBeCloseTo(7836.92, 2);
    expect(res.nuevoPlazoMeses).toBe(202);
    expect(res.reduccionMeses).toBe(38);
    expect(res.ahorroInteresesPlazo).toBeCloseTo(18047.4, 2);
    expect(res.totalInteresesSinAmortizar).toBeCloseTo(67658.51, 2);
    // Reducir plazo ahorra más: invariante de la fórmula francesa
    expect(res.ahorroInteresesPlazo).toBeGreaterThan(res.ahorroInteresesCuota);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularTarifaFreelance
// Aritmética pura: días laborables → facturación → tarifa. Verificación interna.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularTarifaFreelance (Capa 1 · aritmética)', () => {

  test('GOLDEN-BB: neto 3.000 €/mes, todo por defecto → tarifa 42,54 €/h (sin IVA), 51,47 €/h (con IVA)', () => {
    // Días lab: 365−104−22−14−5=220; facturables=154; mes=12,83 días; 102,67 h/mes.
    // Facturación nec: (3.000/0,79)×1,15 = 4.367,09 €/mes.
    // IRPF 21% sobre 52.405,08 anual = 11.005,07 €.
    const res = calcularTarifaFreelance({ ingresoNetoMensual: 3000 });
    expect(res.diasLaborablesAno).toBe(220);
    expect(res.diasFacturablesAno).toBeCloseTo(154, 2);
    expect(res.diasFacturablesMes).toBeCloseTo(12.83, 2);
    expect(res.horasFacturablesAno).toBeCloseTo(1232, 2);
    expect(res.horasFacturablesMes).toBeCloseTo(102.67, 2);
    expect(res.facturacionMensualNecesaria).toBeCloseTo(4367.09, 2);
    expect(res.tarifaHora).toBeCloseTo(42.54, 2);
    expect(res.tarifaDia).toBeCloseTo(340.38, 2);
    expect(res.tarifaSemana).toBeCloseTo(1701.9, 2);
    expect(res.tarifaHoraConIVA).toBeCloseTo(51.47, 2);
    expect(res.tarifaDiaConIVA).toBeCloseTo(411.86, 2);
    expect(res.facturacionAnual).toBeCloseTo(52405.08, 2);
    expect(res.irpfAnual).toBeCloseTo(11005.07, 2);
    expect(res.beneficioNetoAnual).toBeCloseTo(41400.01, 2);
  });

  test('GOLDEN-BC: neto 2.000 €/mes + gastos 400 €/mes → facturación 3.493,67 €, tarifa 34,03 €/h', () => {
    // Los gastos se añaden a la base antes de grossing-up por IRPF.
    // Facturación: ((2000+400)/0,79)×1,15 = 3.493,67 €/mes.
    const res = calcularTarifaFreelance({
      ingresoNetoMensual: 2000,
      gastosFijos: [{ concepto: 'Cuota RETA', importe: 310 }, { concepto: 'Seguro', importe: 90 }],
    });
    expect(res.totalGastosMensuales).toBeCloseTo(400, 2);
    expect(res.facturacionMensualNecesaria).toBeCloseTo(3493.67, 2);
    expect(res.tarifaHora).toBeCloseTo(34.03, 2);
    expect(res.tarifaDia).toBeCloseTo(272.3, 2);
    expect(res.facturacionAnual).toBeCloseTo(41924.04, 2);
    expect(res.gastosAnuales).toBeCloseTo(4800, 2);
    expect(res.irpfAnual).toBeCloseTo(7796.05, 2);
    expect(res.beneficioNetoAnual).toBeCloseTo(29327.99, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularGastosDeduciblesAutonomo
// LIRPF arts. 28-30 + RIRPF art. 22. Reglas aplicadas:
//   suministros vivienda = %afecta × 30%; vehículo no exclusivo = 50%.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularGastosDeduciblesAutonomo (Capa 1 · LIRPF art. 28-30)', () => {

  test('GOLDEN-BD: local independiente — suministros 100%, cuota 100%, publicidad 100%, vehículo 50% → total 8.700 €', () => {
    // sub=2.400(100%)=2.400, cuota=3.600, pub=1.200, veh=3.000×50%=1.500. Suma=8.700.
    const res = calcularGastosDeduciblesAutonomo({
      modalidad: 'normal',
      tipoLocal: 'local_independiente',
      gastosSubministros: 2400,
      cuotaAutonomo: 3600,
      gastosPublicidad: 1200,
      vehiculo: { totalGastosVehiculo: 3000, tipoActividad: 'no_exclusivo' },
    });
    expect(res.totalGastosDeducibles).toBeCloseTo(8700, 2);
    expect(res.provisionGlobalED5pct).toBe(0);
    expect(res.totalGastosConProvision).toBeCloseTo(8700, 2);
    // Línea de suministros al 100% (local independiente)
    const linSub = res.lineas.find(l => l.concepto.includes('Suministros'));
    expect(linSub?.porcentajeDeducible).toBe(100);
    expect(linSub?.importeDeducible).toBe(2400);
    // Línea de vehículo al 50% (actividad no exclusiva)
    const linVeh = res.lineas.find(l => l.concepto.includes('vehículo'));
    expect(linVeh?.porcentajeDeducible).toBe(50);
    expect(linVeh?.importeDeducible).toBeCloseTo(1500, 2);
  });

  test('GOLDEN-BE: vivienda habitual 20% — suministros al 6% (RIRPF art.22), seguro médico topado → total 5.680 €', () => {
    // pctSub = 20% vivienda × 30% = 6%. sub=3.000×6%=180.
    // Seguro: prima=2.000, 2 familiares → límite=500+2×500=1.500 → deducible=1.500.
    // Total = 180 + 4.000 + 1.500 = 5.680.
    const res = calcularGastosDeduciblesAutonomo({
      modalidad: 'simplificada',
      tipoLocal: 'vivienda_habitual',
      pctViviendaAfecta: 20,
      gastosSubministros: 3000,
      cuotaAutonomo: 4000,
      segurosPrivadosMedicos: 2000,
      numFamiliaresSeguroMedico: 2,
    });
    expect(res.totalGastosDeducibles).toBeCloseTo(5680, 2);
    expect(res.provisionGlobalED5pct).toBe(0);   // saldoDeudores no proporcionado
    const linSub = res.lineas.find(l => l.concepto.includes('Suministros'));
    expect(linSub?.porcentajeDeducible).toBeCloseTo(6, 2);   // 20% × 30%
    expect(linSub?.importeDeducible).toBeCloseTo(180, 2);
    const linSeg = res.lineas.find(l => l.concepto.includes('médico'));
    expect(linSeg?.importeDeducible).toBeCloseTo(1500, 2);   // limitado a 1.500 €
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularReduccionJornada
// ET arts. 37.6 + 37.7 + LGSS art. 237. Aritmética proporcional + reglas de límites.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularReduccionJornada (Capa 1 · ET art. 37.6)', () => {

  test('GOLDEN-BF: hijo_menor_12, salario 2.500 €, jornada completa 40h, reducción 25% → merma 625 €/mes', () => {
    // Jornada reducida: 30h. Salario: 2.500×75%=1.875 €. Merma: 625/mes, 7.500/año.
    // Primeros 24 meses: baseSSCompleta=true (art. 237 LGSS protege cotización a jornada completa).
    // Rango legal: 12,5%–50%; 25% ∈ rango → dentroRangoLegal=true.
    const res = calcularReduccionJornada({
      motivo: 'hijo_menor_12',
      salarioBrutoMensualCompleto: 2500,
      horasSemanalesCompletas: 40,
      fraccionReduccion: 0.25,
    });
    expect(res.pctJornadaReducida).toBeCloseTo(25, 2);
    expect(res.pctJornadaTrabajada).toBeCloseTo(75, 2);
    expect(res.horasSemanalesTrasReduccion).toBeCloseTo(30, 2);
    expect(res.salarioBrutoMensualReducido).toBeCloseTo(1875, 2);
    expect(res.mermaMensualBruta).toBeCloseTo(625, 2);
    expect(res.mermaAnualBruta).toBeCloseTo(7500, 2);
    expect(res.baseSSCompleta).toBe(true);
    expect(res.baseReguladoraEstimada).toBeCloseTo(2500, 2);   // jornada completa
    expect(res.reduccionMinimaPermitida).toBeCloseTo(12.5, 2);
    expect(res.reduccionMaximaPermitida).toBeCloseTo(50, 2);
    expect(res.dentroRangoLegal).toBe(true);
  });

  test('GOLDEN-BG: hijo_discapacidad_grave (art.37.7), salario 3.200 €, reducción 50% → merma 1.600 €/mes, rango 50–100%', () => {
    // Art. 37.7 ET: reducción mínima ≥50%, sin tope máximo. Límite inferior 50% (no 12,5%).
    // fraccion=0,50 → en el límite inferior del rango especial → dentroRangoLegal=true.
    const res = calcularReduccionJornada({
      motivo: 'hijo_discapacidad_grave',
      salarioBrutoMensualCompleto: 3200,
      horasSemanalesCompletas: 40,
      fraccionReduccion: 0.50,
    });
    expect(res.pctJornadaReducida).toBeCloseTo(50, 2);
    expect(res.salarioBrutoMensualReducido).toBeCloseTo(1600, 2);
    expect(res.mermaMensualBruta).toBeCloseTo(1600, 2);
    expect(res.mermaAnualBruta).toBeCloseTo(19200, 2);
    expect(res.reduccionMinimaPermitida).toBeCloseTo(50, 2);
    expect(res.reduccionMaximaPermitida).toBeCloseTo(100, 2);
    expect(res.dentroRangoLegal).toBe(true);
    expect(res.baseSSCompleta).toBe(true);
    expect(res.baseReguladoraEstimada).toBeCloseTo(3200, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularCapacidadHipoteca
// Regla de esfuerzo BdE (cuota ≤ 30-35% ingresos netos). Fórmula francesa inversa.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularCapacidadHipoteca (Capa 1 · Banco de España)', () => {

  test('GOLDEN-BH: 3.000 € neto, 40.000 € ahorros, 3,5% 30a → capital 200.425,49 €, precio máx 218.568,63 €', () => {
    // cuota máx = 3.000×30% = 900 €. Capital = despeje fórmula francesa = 200.425,49 €.
    // entrada = (40.000 − capital×10%) / 1,10 = 18.143,14 €.
    // Financiación 91,7% > 80% → alerta. Esfuerzo = 30% → cumple BdE (justo en el límite).
    const res = calcularCapacidadHipoteca({
      ingresosMensualesNetos: 3000,
      ahorrosDisponibles: 40000,
    });
    expect(res.cuotaMaximaMensual).toBeCloseTo(900, 2);
    expect(res.cuotaDisponible).toBeCloseTo(900, 2);
    expect(res.capitalMaximo).toBeCloseTo(200425.49, 2);
    expect(res.entradaDisponible).toBeCloseTo(18143.14, 2);
    expect(res.gastosCompraReservados).toBeCloseTo(21856.86, 2);
    expect(res.precioMaximoVivienda).toBeCloseTo(218568.63, 2);
    expect(res.porcentajeFinanciacion).toBeCloseTo(91.7, 2);
    expect(res.esfuerzoHipotecario).toBeCloseTo(30, 2);
    expect(res.cumpleRecomendacionBDE).toBe(true);
    // Alerta: financiación > 80%
    expect(res.advertencias.some(a => a.includes('80%'))).toBe(true);
  });

  test('GOLDEN-BI: 4.500 € neto, 70.000 € ahorros, otras=300 €, 4% 25a → capital 198.925,11 €, esfuerzo 23,33%', () => {
    // cuotaMax = 4.500×30% = 1.350. cuotaDisp = 1.350−300 = 1.050 €.
    // Capital = 198.925,11 €. Precio máx = 244.477,37 €. Fin. 81,37% (>80% → alerta).
    const res = calcularCapacidadHipoteca({
      ingresosMensualesNetos: 4500,
      ahorrosDisponibles: 70000,
      otrasDeudasMensuales: 300,
      tasaInteres: 4,
      plazo: 25,
    });
    expect(res.cuotaMaximaMensual).toBeCloseTo(1350, 2);
    expect(res.cuotaDisponible).toBeCloseTo(1050, 2);
    expect(res.capitalMaximo).toBeCloseTo(198925.11, 2);
    expect(res.entradaDisponible).toBeCloseTo(45552.26, 2);
    expect(res.gastosCompraReservados).toBeCloseTo(24447.74, 2);
    expect(res.precioMaximoVivienda).toBeCloseTo(244477.37, 2);
    expect(res.porcentajeFinanciacion).toBeCloseTo(81.37, 2);
    expect(res.esfuerzoHipotecario).toBeCloseTo(23.33, 2);
    expect(res.cumpleRecomendacionBDE).toBe(true);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularFiniquito
// Cálculo proporcional de vacaciones, pagas extra y salarios pendientes.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularFiniquito (Capa 1 · ET arts. 52-56)', () => {

  test('GOLDEN-BJ: bruto 2.000 €, 6a y 182d antigüedad, 12 días vacaciones pendientes → total 2.705,08 €', () => {
    // Vacaciones devengadas en 2026 (181 días/365 × 22) = 10,9096 días − 10 disfrutados = 0,9096 días → 60,64 €.
    // 2 pagas extra, última devengada el 01/06/2026 → 29/30 meses proporcionales (tope 6) → 644,44 €.
    // Salarios atrasados = salario diario × día del mes (30) = 2.000 €.
    const f = calcularFiniquito({
      salarioBrutoMensual: 2000,
      motivoFiniquito: 'baja_voluntaria',
      fechaInicio: '2020-01-01',
      fechaBaja: '2026-06-30',
      diasVacacionesDisfrutados: 10,
      ultimaPagaExtraFecha: '2026-06-01',
    });
    expect(f.antiguedadAnios).toBe(6);
    expect(f.antiguedadDias).toBe(182);
    expect(f.diasVacacionesPendientes).toBeCloseTo(0.91, 2);
    expect(f.vacacionesPendientes).toBeCloseTo(60.64, 2);
    expect(f.pagasExtrasProporcionales).toBeCloseTo(644.44, 2);
    expect(f.salariosAtrasados).toBeCloseTo(2000, 2);
    expect(f.totalFiniquitoBruto).toBeCloseTo(2705.08, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularSueldoNeto
// Retenciones IRPF + SS empleado sobre bruto anual (IRPF 2025).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularSueldoNeto (Capa 1 · IRPF 2025)', () => {

  test('GOLDEN-BK: soltero, bruto 24.000 €, 14 pagas → cuota SS 1.560,00 €, IRPF 2.383,74 €, neto mensual 1.432,59 €', () => {
    // baseSS = 2.000 €/mes (dentro de mín-máx). Cuota SS anual = 2.000×6,50%×12 = 1.560,00 €.
    // Base imponible = 24.000 − 1.560,00 − 2.000 = 20.440,00 € → reducción RNT mínima (2.364 €, RNT > 16.825).
    // Mínimo personal (soltero, sin hijos) = 5.550 €. Base liquidable = 20.440,00 − 2.364 − 5.550 = 12.526,00 €.
    // Cuota IRPF = 12.450×19% + 76,00×24% = 2.365,50 + 18,24 = 2.383,74 €.
    const r = calcularSueldoNeto({ brutoAnual: 24000, situacion: 'soltero', pagas: 14 });
    expect(r.cuotaSSAnual).toBeCloseTo(1560.00, 2);
    expect(r.baseImponible).toBeCloseTo(20440.00, 2);
    expect(r.reduccionRNT).toBeCloseTo(2364, 2);
    expect(r.minimoPersonalFamiliar).toBeCloseTo(5550, 2);
    expect(r.baseLiquidable).toBeCloseTo(12526.00, 2);
    expect(r.cuotaIRPF).toBeCloseTo(2383.74, 2);
    expect(r.tipoRetencion).toBeCloseTo(9.93, 2);
    expect(r.netoAnual).toBeCloseTo(20056.26, 2);
    expect(r.netoMensual).toBeCloseTo(1432.59, 2);
  });

  test('GOLDEN-BL: casado con ingresos, bruto 35.000 €, 2 hijos (1 menor de 3), 12 pagas → mínimo familiar 13.450 €, neto mensual 2.480,74 €', () => {
    // Mínimo personal+familiar = 5.550 (personal) + 2.400 (hijo 1º) + 2.700 (hijo 2º) + 2.800 (hijo <3) = 13.450 €.
    // Base imponible = 35.000 − 2.275,00 (SS) − 2.000 = 30.725,00 € → reducción RNT mínima (2.364 €).
    // Base liquidable = 30.725,00 − 2.364 − 13.450 = 14.911,00 €.
    // Cuota IRPF = 12.450×19% + 2.461,00×24% = 2.365,50 + 590,64 = 2.956,14 €.
    const r = calcularSueldoNeto({
      brutoAnual: 35000,
      situacion: 'casado_con_ingresos',
      numHijos: 2,
      hijosMenores3: 1,
      pagas: 12,
    });
    expect(r.cuotaSSAnual).toBeCloseTo(2275.00, 2);
    expect(r.baseImponible).toBeCloseTo(30725.00, 2);
    expect(r.reduccionRNT).toBeCloseTo(2364, 2);
    expect(r.minimoPersonalFamiliar).toBeCloseTo(13450, 2);
    expect(r.baseLiquidable).toBeCloseTo(14911.00, 2);
    expect(r.cuotaIRPF).toBeCloseTo(2956.14, 2);
    expect(r.tipoRetencion).toBeCloseTo(8.45, 2);
    expect(r.netoAnual).toBeCloseTo(29768.86, 2);
    expect(r.netoMensual).toBeCloseTo(2480.74, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPensionPublica
// Porcentaje de base reguladora según años cotizados (LGSS, transitorio 2025).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPensionPublica (Capa 1 · LGSS / Ley 21/2021)', () => {

  test('GOLDEN-BM: base 2.800 €, 30 años cotizados (360 meses) → 86,12%, pensión 2.066,90 €/mes (sistema dual), sin límites', () => {
    // BR clásica = 2.800 × 300/350 = 2.400 €. BR dual (2026) = 2.800 × 302/352,33 ≈ 2.400,02 €.
    // % pensión: tramo 277-9999 → 70,16 + (360-277+1)×0,19 = 70,16 + 84×0,19 = 86,12%.
    // Pensión clásica = 2.400 × 86,12% = 2.066,88 €. Pensión dual = 2.400,02 × 86,12% ≈ 2.066,90 €.
    // El sistema dual (DT 40.a LGSS, vigente desde 2026) es marginalmente más favorable → se aplica de oficio.
    // Ambas dentro de [888,70 ; 3.359,60], no se aplican límites.
    const p = calcularPensionPublica({ baseCotizacionMensual: 2800, anosCotizados: 30, edadActual: 55 });
    expect(p.baseReguladoraClasica).toBeCloseTo(2400, 2);
    expect(p.baseReguladoraDual).toBeCloseTo(2400.02, 2);
    expect(p.formulaAplicada).toBe('dual');
    expect(p.baseReguladora).toBeCloseTo(2400.02, 2);
    expect(p.porcentajePension).toBeCloseTo(86.12, 2);
    expect(p.pensionClasicaMensual).toBeCloseTo(2066.88, 2);
    expect(p.pensionDualMensual).toBeCloseTo(2066.90, 2);
    expect(p.pensionBrutaSinLimites).toBeCloseTo(2066.90, 2);
    expect(p.pensionBrutaMensual).toBeCloseTo(2066.90, 2);
    expect(p.pensionBrutaAnual).toBeCloseTo(28936.60, 2);
    expect(p.aplicaMinimo).toBe(false);
    expect(p.aplicaMaximo).toBe(false);
    expect(p.mesesParaCien).toBe(81);
  });

  test('GOLDEN-BN: base mínima 1.184,40 €, 15 años cotizados (180 meses, mínimo de acceso) → se aplica pensión mínima 888,70 €/mes', () => {
    // BR = 1.184,40 × 300/350 = 1.015,20 €. % pensión = 50% (180 meses, primer tramo).
    // Pensión sin límites = 1.015,20 × 50% = 507,60 € < 888,70 € (mínima sin cónyuge) → se aplica el mínimo.
    const p = calcularPensionPublica({ baseCotizacionMensual: 1184.40, anosCotizados: 15, edadActual: 65 });
    expect(p.baseReguladora).toBeCloseTo(1015.20, 2);
    expect(p.porcentajePension).toBeCloseTo(50, 2);
    expect(p.pensionBrutaSinLimites).toBeCloseTo(507.60, 2);
    expect(p.aplicaMinimo).toBe(true);
    expect(p.aplicaMaximo).toBe(false);
    expect(p.pensionBrutaMensual).toBeCloseTo(888.70, 2);
    expect(p.pensionBrutaAnual).toBeCloseTo(12441.80, 2);
    expect(p.mesesParaCien).toBe(261);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularBrechaJubilacion
// Diferencial sueldo neto actual vs. pensión estimada + ahorro mensual necesario.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularBrechaJubilacion (Capa 1 · cálculo financiero propio)', () => {

  test('GOLDEN-BO: sueldo neto 2.400 €, pensión 1.500 €, 47 años → brecha 900 €/mes, capital 216.000 €, ahorro 588,92 €/mes', () => {
    // Brecha mensual = 2.400 − 1.500 = 900 €. Brecha anual = 10.800 €. Capital = 10.800 × 20 años = 216.000 €.
    // % pensión/sueldo = 1.500/2.400 × 100 = 62,5%. Años hasta jubilación (67−47) = 20 → n = 240 meses, r_mes = 4%/12.
    // PMT = 216.000 × r_mes / ((1+r_mes)^240 − 1) = 588,92 €/mes.
    const b = calcularBrechaJubilacion({ sueldoNetoMensual: 2400, pensionEstimadaMensual: 1500, edadActual: 47 });
    expect(b.brechaMensual).toBeCloseTo(900, 2);
    expect(b.brechaAnual).toBeCloseTo(10800, 2);
    expect(b.capitalNecesario).toBeCloseTo(216000, 2);
    expect(b.porcentajePensionSobreSueldo).toBeCloseTo(62.5, 2);
    expect(b.anosHastaJubilacion).toBe(20);
    expect(b.ahorroMensualNecesario).toBeCloseTo(588.92, 2);
    expect(b.tieneBrecha).toBe(true);
    expect(b.edadJubilacion).toBe(67);
    expect(b.anosJubilado).toBe(20);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularGananciaCriptomonedas
// Base del ahorro IRPF (LIRPF art. 37.1.v), FIFO, escala del ahorro 2025.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularGananciaCriptomonedas (Capa 1 · LIRPF art. 37.1.v)', () => {

  test('GOLDEN-BP: ganancia 14.850 € + pérdida 4.000 € → saldo neto 10.850 €, cuota 2.158,50 €', () => {
    // Op.1: adquisición 1×20.000+50=20.050 €, transmisión 1×35.000−100=34.900 € → ganancia 14.850 €.
    // Op.2: adquisición 2×3.000=6.000 €, transmisión 2×1.000=2.000 € → pérdida 4.000 €.
    // Saldo neto = 14.850 − 4.000 = 10.850 € → escala ahorro: 6.000×19% + 4.850×21% = 1.140 + 1.018,50 = 2.158,50 €.
    const g = calcularGananciaCriptomonedas({
      operaciones: [
        { tipoOperacion: 'venta', unidades: 1, precioAdquisicionUnitario: 20000, gastosAdquisicion: 50, precioTransmisionUnitario: 35000, gastosTransmision: 100 },
        { tipoOperacion: 'venta', unidades: 2, precioAdquisicionUnitario: 3000, precioTransmisionUnitario: 1000 },
      ],
    });
    expect(g.detalleOperaciones[0].valorAdquisicion).toBeCloseTo(20050, 2);
    expect(g.detalleOperaciones[0].valorTransmision).toBeCloseTo(34900, 2);
    expect(g.detalleOperaciones[0].gananciaPerdida).toBeCloseTo(14850, 2);
    expect(g.detalleOperaciones[1].gananciaPerdida).toBeCloseTo(-4000, 2);
    expect(g.totalGanancias).toBeCloseTo(14850, 2);
    expect(g.totalPerdidas).toBeCloseTo(4000, 2);
    expect(g.saldoNeto).toBeCloseTo(10850, 2);
    expect(g.cuotaTributaria).toBeCloseTo(2158.50, 2);
    expect(g.compensacionRCMPosible).toBe(0);
    expect(g.perdidaPendienteCompensacion).toBe(0);
  });

  test('GOLDEN-BQ: pérdida neta 7.530 € con RCM positivo 10.000 € → compensa 2.500 € (25%), pendiente 5.030 €', () => {
    // Adquisición = 0,5×40.000+20=20.020 €, transmisión = 0,5×25.000−10=12.490 € → pérdida 7.530 €.
    // Compensación = min(7.530, 10.000×25%) = min(7.530, 2.500) = 2.500 €. Pendiente = 7.530 − 2.500 = 5.030 €.
    const g = calcularGananciaCriptomonedas({
      operaciones: [
        { tipoOperacion: 'venta', unidades: 0.5, precioAdquisicionUnitario: 40000, gastosAdquisicion: 20, precioTransmisionUnitario: 25000, gastosTransmision: 10 },
      ],
      saldoPositivoRCM: 10000,
    });
    expect(g.saldoNeto).toBeCloseTo(-7530, 2);
    expect(g.cuotaTributaria).toBe(0);
    expect(g.compensacionRCMPosible).toBeCloseTo(2500, 2);
    expect(g.perdidaPendienteCompensacion).toBeCloseTo(5030, 2);
    expect(g.advertencias.some(a => a.includes('Pérdida patrimonial'))).toBe(true);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPlanPensiones
// Proyección de ahorro privado + deducción IRPF (LIRPF art. 51).
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPlanPensiones (Capa 1 · LIRPF art. 51)', () => {

  test('GOLDEN-BR: rendimientos 40.000 €, aportación 1.500 €, 40→67 años → ahorro fiscal 450 €, capital 70.626,32 €', () => {
    // Límite deducible = min(1.500, 40.000×30%) = min(1.500, 12.000) = 1.500 € → toda la aportación es deducible.
    // Tipo marginal: RNT = 40.000 − 40.000×6,50% − 2.000 = 35.400 € → tras reducción RNT (2.364 €) = 33.036 € ≤ 35.200 → tramo 30%.
    // Ahorro fiscal = 1.500×30% = 450 €. Coste neto = 1.500 − 450 = 1.050 €.
    // Capital a 27 años (4% anual, sin capital previo) = 1.500 × ((1,04^27 − 1)/0,04) = 70.626,32 €.
    const pp = calcularPlanPensiones({
      rendimientosNetos: 40000,
      aportacionIndividual: 1500,
      edadActual: 40,
    });
    expect(pp.aportacionTotal).toBeCloseTo(1500, 2);
    expect(pp.limiteDeducible).toBeCloseTo(1500, 2);
    expect(pp.baseReducible).toBeCloseTo(1500, 2);
    expect(pp.excesoNoDeducible).toBe(0);
    expect(pp.superaLimite).toBe(false);
    expect(pp.tipoMarginal).toBe(30);
    expect(pp.ahorroFiscalAnual).toBeCloseTo(450, 2);
    expect(pp.costeNetoAnual).toBeCloseTo(1050, 2);
    expect(pp.anosAhorro).toBe(27);
    expect(pp.capitalEstimadoJubilacion).toBeCloseTo(70626.32, 2);
    expect(pp.rentaMensualEstimada).toBeCloseTo(235.42, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularBajaMedica
// Subsidio por Incapacidad Temporal (LGSS arts. 169-176).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularBajaMedica (Capa 1 · LGSS arts. 169-176)', () => {

  test('GOLDEN-BS: contingencia común, 2.000 €/mes, 30 días → subsidio 1.180 € [SS pendiente verificación]', () => {
    // BC diaria = 2.000/30 = 66,67 €. Días 1-3 sin subsidio (espera).
    // Días 4-20 (17 días) al 60% = 40,00 €/día → 680,00 €.
    // Días 21-30 (10 días) al 75% = 50,00 €/día → 500,00 €.
    // Total = 1.180,00 €. Equivalente mensual = 1.180,00 €. Pérdida = 2.000 − 1.180 = 820 €.
    const bm = calcularBajaMedica({
      salarioBrutoMensual: 2000,
      tipoBaja: 'comun',
      diasBaja: 30,
    });
    expect(bm.baseCotizacionDiaria).toBeCloseTo(66.67, 2);
    expect(bm.diasEspera).toBe(3);
    expect(bm.subsidioDiarioFase1).toBeCloseTo(40.00, 2);
    expect(bm.subsidioDiarioFase2).toBeCloseTo(50.00, 2);
    expect(bm.totalSubsidio).toBeCloseTo(1180.00, 2);
    expect(bm.subsidioMensualEquivalente).toBeCloseTo(1180.00, 2);
    expect(bm.perdidaEstimada).toBeCloseTo(820.00, 2);
  });

  test('GOLDEN-BT: accidente laboral, 3.000 €/mes, 15 días → subsidio 1.125 € desde día 1 [SS pendiente verificación]', () => {
    // BC diaria = 3.000/30 = 100 €. Accidente laboral: 75% desde el día 1, sin espera.
    // Diario = 75 €. Total 15 días = 1.125 €. Equivalente mensual = 75×30 = 2.250 €.
    // Pérdida = 3.000 − 2.250 = 750 €.
    const bm = calcularBajaMedica({
      salarioBrutoMensual: 3000,
      tipoBaja: 'accidente_laboral',
      diasBaja: 15,
    });
    expect(bm.baseCotizacionDiaria).toBeCloseTo(100.00, 2);
    expect(bm.diasEspera).toBe(0);
    expect(bm.subsidioDiarioFase1).toBeCloseTo(75.00, 2);
    expect(bm.subsidioDiarioFase2).toBeCloseTo(75.00, 2);
    expect(bm.totalSubsidio).toBeCloseTo(1125.00, 2);
    expect(bm.subsidioMensualEquivalente).toBeCloseTo(2250.00, 2);
    expect(bm.perdidaEstimada).toBeCloseTo(750.00, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularJubilacionAnticipada
// Coeficientes reductores por años cotizados (RDL 2/2023 + LGSS arts. 207-208).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularJubilacionAnticipada (Capa 1 · RDL 2/2023)', () => {

  test('GOLDEN-BU: involuntaria, 35 años cotizados, 12 meses anticipación → reducción 7,5% [SS pendiente verificación]', () => {
    // 35 años cotizados < 38a6m → coeficiente plano 1,875%/trimestre (RDL 2/2023).
    // 12 meses = 4 trimestres → 4×1,875 = 7,5%.
    // Pensión con reducción = 1.500 × (1 − 7,5/100) = 1.387,50 €.
    // Pérdida mensual = 112,50 €. Pérdida anual (14 pagas) = 1.575 €.
    // 35 años × 12 = 420 meses < 459 (38a3m) → edad ordinaria según TABLA_EDAD_JUBILACION
    // del año en curso (2026: 66 años y 10 meses). Revisar anualmente al actualizar la tabla.
    const ja = calcularJubilacionAnticipada({
      anosCotizados: 35,
      mesesAnticipacion: 12,
      tipo: 'involuntaria',
      pensionOrdinaria: 1500,
    });
    expect(ja.posible).toBe(true);
    expect(ja.cumpleCotizacion).toBe(true);
    expect(ja.trimestreAnticipacion).toBe(4);
    expect(ja.reduccionTotal).toBeCloseTo(7.5, 2);
    expect(ja.pensionConReduccion).toBeCloseTo(1387.50, 2);
    expect(ja.perdidaMensual).toBeCloseTo(112.50, 2);
    expect(ja.perdidaAnual).toBeCloseTo(1575.00, 2);
    expect(ja.edadOrdinaria).toBe('66 años y 10 meses');
  });

  test('GOLDEN-BV: voluntaria, 37 años cotizados, 24 meses anticipación → reducción 16% [SS pendiente verificación]', () => {
    // 37 años cotizados < 38a6m → coeficiente plano 2,00%/trimestre (RDL 2/2023).
    // 24 meses = 8 trimestres → 8×2,00 = 16%.
    // Pensión con reducción = 1.800 × (1 − 16/100) = 1.512 €.
    // Pérdida mensual = 288 €. Pérdida anual (14 pagas) = 4.032 €.
    const ja = calcularJubilacionAnticipada({
      anosCotizados: 37,
      mesesAnticipacion: 24,
      tipo: 'voluntaria',
      pensionOrdinaria: 1800,
    });
    expect(ja.posible).toBe(true);
    expect(ja.cumpleCotizacion).toBe(true);
    expect(ja.trimestreAnticipacion).toBe(8);
    expect(ja.reduccionTotal).toBeCloseTo(16.00, 2);
    expect(ja.pensionConReduccion).toBeCloseTo(1512.00, 2);
    expect(ja.perdidaMensual).toBeCloseTo(288.00, 2);
    expect(ja.perdidaAnual).toBeCloseTo(4032.00, 2);
  });

  test('GOLDEN-BW: involuntaria, 30 años cotizados (no cumple mínimo de 33) → no posible [SS pendiente verificación]', () => {
    const ja = calcularJubilacionAnticipada({
      anosCotizados: 30,
      mesesAnticipacion: 12,
      tipo: 'involuntaria',
      pensionOrdinaria: 1500,
    });
    expect(ja.posible).toBe(false);
    expect(ja.cumpleCotizacion).toBe(false);
    expect(ja.anosMinimosRequeridos).toBe(33);
    expect(ja.reduccionTotal).toBe(0);
    expect(ja.pensionConReduccion).toBeCloseTo(1500.00, 2);
    expect(ja.motivoImpedimento.length).toBeGreaterThan(0);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPensionIncapacidad
// Pensión de Incapacidad Permanente (LGSS arts. 194-200).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPensionIncapacidad (Capa 1 · LGSS arts. 194-200)', () => {

  test('GOLDEN-BX: IPT, edad 50 (sin recargo), sin cónyuge → 55% BR = 1.100 €/mes [SS pendiente verificación]', () => {
    // BR = 224.000 / 112 = 2.000 €. IPT al 55% (sin recargo, edad < 55) = 1.100 €/mes.
    // Mínimo (IPT < 60 años, unipersonal, 2026) = 671 € → no se aplica (1.100 > 671).
    // Anual (14 pagas) = 1.100 × 14 = 15.400 €.
    const pi = calcularPensionIncapacidad({
      gradoIncapacidad: 'total',
      origenContingencia: 'comun',
      sumaBasesCotizacion: 224000,
      edad: 50,
      tieneConyuge: false,
    });
    expect(pi.baseReguladora).toBeCloseTo(2000.00, 2);
    expect(pi.porcentajeAplicado).toBe(55);
    expect(pi.recargo55Anios).toBe(false);
    expect(pi.cuantiaBrutaMensual).toBeCloseTo(1100.00, 2);
    expect(pi.pensionMinimaGarantizada).toBeCloseTo(671.00, 2);
    expect(pi.cuantiaEfectivaMensual).toBeCloseTo(1100.00, 2);
    expect(pi.cuantiaAnual14Pagas).toBeCloseTo(15400.00, 2);
  });

  test('GOLDEN-BY: IPA, edad 60, con cónyuge → 100% BR = 1.500 €/mes [SS pendiente verificación]', () => {
    // BR = 168.000 / 112 = 1.500 €. IPA al 100% = 1.500 €/mes.
    // Mínimo (IPA con cónyuge a cargo, 2026) = 1.256,60 € → no se aplica (1.500 > 1.256,60).
    // Anual (14 pagas) = 1.500 × 14 = 21.000 €.
    const pi = calcularPensionIncapacidad({
      gradoIncapacidad: 'absoluta',
      origenContingencia: 'comun',
      sumaBasesCotizacion: 168000,
      edad: 60,
      tieneConyuge: true,
    });
    expect(pi.baseReguladora).toBeCloseTo(1500.00, 2);
    expect(pi.porcentajeAplicado).toBe(100);
    expect(pi.cuantiaBrutaMensual).toBeCloseTo(1500.00, 2);
    expect(pi.pensionMinimaGarantizada).toBeCloseTo(1256.60, 2);
    expect(pi.cuantiaEfectivaMensual).toBeCloseTo(1500.00, 2);
    expect(pi.cuantiaAnual14Pagas).toBeCloseTo(21000.00, 2);
  });

  test('GOLDEN-BZ: Gran Invalidez → BR + complemento 45% base mínima cotización + 30% última base (art. 196.4 LGSS)', () => {
    // BR = 112.000 / 112 = 1.000 €. Cuantía bruta = 100% × 1.000 = 1.000 €.
    // Complemento GI = 45% × 1.424,40 (base mínima cotización 2026) + 30% × 1.200 (última base)
    //                = 640,98 + 360 = 1.000,98 €.
    // Mínimo del complemento = 45% × 1.000 (pensión sin complemento) = 450 € → no se aplica (1.000,98 > 450).
    // Total mensual = 1.000 + 1.000,98 = 2.000,98 €. Mínimo GI (unipersonal, 2026) = 1.404,30 € → no se aplica.
    // Anual (14 pagas) = 2.000,98 × 14 = 28.013,72 €.
    const pi = calcularPensionIncapacidad({
      gradoIncapacidad: 'gran_invalidez',
      origenContingencia: 'comun',
      sumaBasesCotizacion: 112000,
      edad: 58,
      ultimaBaseCotizacion: 1200,
    });
    expect(pi.baseReguladora).toBeCloseTo(1000.00, 2);
    expect(pi.cuantiaBrutaMensual).toBeCloseTo(1000.00, 2);
    expect(pi.complementoGranInvalidez).toBeCloseTo(1000.98, 2);
    expect(pi.cuantiaBrutaTotalMensual).toBeCloseTo(2000.98, 2);
    expect(pi.pensionMinimaGarantizada).toBeCloseTo(1404.30, 2);
    expect(pi.cuantiaEfectivaMensual).toBeCloseTo(2000.98, 2);
    expect(pi.cuantiaAnual14Pagas).toBeCloseTo(28013.72, 2);
  });

  test('GOLDEN-CA: IP Parcial → indemnización única de 24 mensualidades de BR [SS pendiente verificación]', () => {
    // BR = 56.000 / 112 = 500 €. Indemnización = 24 × 500 = 12.000 € (no genera pensión mensual).
    const pi = calcularPensionIncapacidad({
      gradoIncapacidad: 'parcial',
      origenContingencia: 'comun',
      sumaBasesCotizacion: 56000,
      edad: 45,
    });
    expect(pi.baseReguladora).toBeCloseTo(500.00, 2);
    expect(pi.indemnizacionTotalIPParcial).toBeCloseTo(12000.00, 2);
    expect(pi.cuantiaEfectivaMensual).toBe(0);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPensionViudedad
// Pensión de Viudedad (LGSS arts. 219-231, RDL 8/2015).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPensionViudedad (Capa 1 · LGSS arts. 219-231)', () => {

  test('GOLDEN-CB: causante activo, BC media 2.000 €, 50 años → 52% general = 891,43 €/mes [SS pendiente verificación]', () => {
    // BR = (24 × 2.000) / 28 = 1.714,29 €. Sin cargas ni condiciones especiales → 52% general.
    // Pensión bruta = 1.714,29 × 52% = 891,43 €. Mínimo (< 60, sin cargas) = 583 € → no se aplica.
    // Anual = 891,43 × 14 = 12.480,02 € < 15.000 → sin retención.
    const pv = calcularPensionViudedad({
      situacionCausante: 'activo',
      baseCotizacionMedia: 2000,
      edadBeneficiario: 50,
      tieneCargas: false,
      ingresosMensualesPropios: 0,
    });
    expect(pv.baseReguladora).toBeCloseTo(1714.29, 2);
    expect(pv.porcentajeAplicable).toBe(52);
    expect(pv.pensionBruta).toBeCloseTo(891.43, 2);
    expect(pv.pensionMinima).toBeCloseTo(583.00, 2);
    expect(pv.pensionFinal).toBeCloseTo(891.43, 2);
    expect(pv.pensionNetaAprox).toBeCloseTo(891.43, 2);
  });

  test('GOLDEN-CC: causante jubilado, pensión 1.800 €, beneficiario 67 años, ingresos < SMI → 60% [SS pendiente verificación]', () => {
    // BR = pensión del causante = 1.800 €. Edad ≥ 65 e ingresos (500) < SMI (1.221) → 60%.
    // Pensión bruta = 1.800 × 60% = 1.080 €. Mínimo (≥ 65) = 853 € → no se aplica.
    // Anual = 1.080 × 14 = 15.120 € → tramo retención 8% (15.000-22.000).
    // Neta = 1.080 × (1 − 0,08) = 993,60 €.
    const pv = calcularPensionViudedad({
      situacionCausante: 'jubilado',
      pensionCausante: 1800,
      edadBeneficiario: 67,
      tieneCargas: false,
      ingresosMensualesPropios: 500,
    });
    expect(pv.baseReguladora).toBeCloseTo(1800.00, 2);
    expect(pv.porcentajeAplicable).toBe(60);
    expect(pv.pensionBruta).toBeCloseTo(1080.00, 2);
    expect(pv.pensionMinima).toBeCloseTo(853.00, 2);
    expect(pv.pensionFinal).toBeCloseTo(1080.00, 2);
    expect(pv.pensionNetaAprox).toBeCloseTo(993.60, 2);
  });

  test('GOLDEN-CD: causante activo, BC media 1.200 €, 45 años con cargas → 70% pero se aplica el mínimo [SS pendiente verificación]', () => {
    // BR = (24 × 1.200) / 28 = 1.028,57 €. Cargas + ingresos (500) < límite 70% (916) → 70%.
    // Pensión bruta = 1.028,57 × 70% = 720,00 €. Mínimo (< 60 con cargas) = 785 € → SE APLICA (785 > 720).
    // Anual = 785 × 14 = 10.990 € < 15.000 → sin retención.
    const pv = calcularPensionViudedad({
      situacionCausante: 'activo',
      baseCotizacionMedia: 1200,
      edadBeneficiario: 45,
      tieneCargas: true,
      ingresosMensualesPropios: 500,
    });
    expect(pv.baseReguladora).toBeCloseTo(1028.57, 2);
    expect(pv.porcentajeAplicable).toBe(70);
    expect(pv.pensionBruta).toBeCloseTo(720.00, 2);
    expect(pv.pensionMinima).toBeCloseTo(785.00, 2);
    expect(pv.pensionFinal).toBeCloseTo(785.00, 2);
    expect(pv.pensionNetaAprox).toBeCloseTo(785.00, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPrestacionMaternidadPaternidad
// Prestación por nacimiento/cuidado de menor (LGSS arts. 177-182, RDL 6/2019,
// ampliada por RDL 9/2025 — 19 semanas biparental / 32 monoparental).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPrestacionMaternidadPaternidad (Capa 1 · LGSS arts. 177-182 + RDL 9/2025)', () => {

  test('GOLDEN-CE: BC 2.400 €/mes, 1 hijo, ≥26 años, biparental → 19 semanas, prestación 100% BR [SS pendiente verificación]', () => {
    // BR diaria = 2.400/30 = 80 €. No supera la base máxima diaria (163,65 €).
    // Duración = 19 semanas (RDL 9/2025) = 133 días. Obligatorios = 42 días, flexibles = 91 días.
    // Cuantía mensual = 80 × 30 = 2.400 €. Total prestación = 80 × 133 = 10.640 €.
    const mp = calcularPrestacionMaternidadPaternidad({
      baseCotizacionMensual: 2400,
      edadProgenitor: 'mayor_26',
      numerosHijos: 1,
    });
    expect(mp.tipoFamilia).toBe('biparental');
    expect(mp.baseReguladoraDiaria).toBeCloseTo(80.00, 2);
    expect(mp.limitadaPorBaseMaxima).toBe(false);
    expect(mp.baseReguladoraMensual).toBeCloseTo(2400.00, 2);
    expect(mp.semanasBase).toBe(19);
    expect(mp.duracionTotalDias).toBe(133);
    expect(mp.diasObligatorios).toBe(42);
    expect(mp.diasFlexibles).toBe(91);
    expect(mp.cumpleCarencia).toBe(true);
    expect(mp.cuantiaMensual).toBeCloseTo(2400.00, 2);
    expect(mp.cuotaTotalPrestacion).toBeCloseTo(10640.00, 2);
  });

  test('GOLDEN-CF: BC 3.000 €/mes, parto múltiple (2 hijos) + discapacidad → +3 semanas adicionales [SS pendiente verificación]', () => {
    // BR diaria = 3.000/30 = 100 €. +1 semana (1 hijo adicional, RDL 9/2025) + 2 semanas (discapacidad) = 22 semanas = 154 días.
    // Obligatorios = 42 días, flexibles = 112 días.
    // Cuantía mensual = 100 × 30 = 3.000 €. Total prestación = 100 × 154 = 15.400 €.
    const mp = calcularPrestacionMaternidadPaternidad({
      baseCotizacionMensual: 3000,
      edadProgenitor: 'entre_21_y_26',
      numerosHijos: 2,
      hijoConDiscapacidad: true,
    });
    expect(mp.baseReguladoraDiaria).toBeCloseTo(100.00, 2);
    expect(mp.baseReguladoraMensual).toBeCloseTo(3000.00, 2);
    expect(mp.semanasAdicionalMultiple).toBe(1);
    expect(mp.semanasAdicionalDiscapacidad).toBe(2);
    expect(mp.duracionTotalDias).toBe(154);
    expect(mp.diasObligatorios).toBe(42);
    expect(mp.diasFlexibles).toBe(112);
    expect(mp.cuantiaMensual).toBeCloseTo(3000.00, 2);
    expect(mp.cuotaTotalPrestacion).toBeCloseTo(15400.00, 2);
  });

  test('GOLDEN-CG: BC 6.000 €/mes (supera base máxima) sin carencia → cuantía 0 [SS pendiente verificación]', () => {
    // BR diaria sin tope = 6.000/30 = 200 €, limitada a la base máxima diaria 2025 = 4.909,50/30 = 163,65 €.
    // Sin carencia → cuantía diaria = 0 → cuantía mensual y total = 0.
    const mp = calcularPrestacionMaternidadPaternidad({
      baseCotizacionMensual: 6000,
      edadProgenitor: 'mayor_26',
      numerosHijos: 1,
      cumpleCarencia: false,
    });
    expect(mp.baseReguladoraDiaria).toBeCloseTo(163.65, 2);
    expect(mp.limitadaPorBaseMaxima).toBe(true);
    expect(mp.baseReguladoraMensual).toBeCloseTo(4909.50, 2);
    expect(mp.cumpleCarencia).toBe(false);
    expect(mp.cuantiaMensual).toBe(0);
    expect(mp.cuotaTotalPrestacion).toBe(0);
  });

  test('GOLDEN-CO: BC 3.000 €/mes, familia monoparental, 1 hijo → 32 semanas (RDL 9/2025) [SS pendiente verificación]', () => {
    // BR diaria = 3.000/30 = 100 €. Duración monoparental = 32 semanas = 224 días.
    // Obligatorios = 42 días, flexibles = 182 días.
    // Cuantía mensual = 100 × 30 = 3.000 €. Total prestación = 100 × 224 = 22.400 €.
    const mp = calcularPrestacionMaternidadPaternidad({
      baseCotizacionMensual: 3000,
      edadProgenitor: 'mayor_26',
      numerosHijos: 1,
      tipoFamilia: 'monoparental',
    });
    expect(mp.tipoFamilia).toBe('monoparental');
    expect(mp.semanasBase).toBe(32);
    expect(mp.duracionTotalDias).toBe(224);
    expect(mp.diasObligatorios).toBe(42);
    expect(mp.diasFlexibles).toBe(182);
    expect(mp.cuantiaMensual).toBeCloseTo(3000.00, 2);
    expect(mp.cuotaTotalPrestacion).toBeCloseTo(22400.00, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularExcedencia
// Excedencias laborales (ET arts. 45-46 + LGSS arts. 237-238).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularExcedencia (Capa 1 · ET arts. 45-46)', () => {

  test('GOLDEN-CH: voluntaria, 3 años de antigüedad, 12 meses → cumple requisitos, sin cotización [SS pendiente verificación]', () => {
    // Antigüedad ≥ 1 año y duración dentro de [4, 60] meses → cumple requisitos.
    // No cotiza durante la excedencia voluntaria. Coste = 2.000 × 12 = 24.000 €.
    const ex = calcularExcedencia({
      tipo: 'voluntaria',
      antiguedadAnios: 3,
      salarioBrutoMensual: 2000,
      duracionMeses: 12,
    });
    expect(ex.cumpleRequisitos).toBe(true);
    expect(ex.duracionMinimaMeses).toBe(4);
    expect(ex.duracionMaximaMeses).toBe(60);
    expect(ex.reservaPuestoExacto).toBe(false);
    expect(ex.cotizaDurante).toBe(false);
    expect(ex.mesesComputablesSSTotal).toBe(0);
    expect(ex.plazoNuevaExcedenciaVoluntaria).toBe(48);
    expect(ex.salerioMensualPerdido).toBeCloseTo(2000.00, 2);
    expect(ex.costeTotalIngresosNoPecibidos).toBeCloseTo(24000.00, 2);
  });

  test('GOLDEN-CI: cuidado de hijo, 1.800 €/mes, 18 meses → reserva 12 meses, computan 18 meses SS [SS pendiente verificación]', () => {
    // Primer año (12 meses) con reserva de puesto exacto. Los 18 meses computan a efectos SS (≤ 36).
    // Coste = 1.800 × 18 = 32.400 €.
    const ex = calcularExcedencia({
      tipo: 'cuidado_hijo',
      antiguedadAnios: 2,
      salarioBrutoMensual: 1800,
      duracionMeses: 18,
    });
    expect(ex.cumpleRequisitos).toBe(true);
    expect(ex.duracionMaximaMeses).toBe(36);
    expect(ex.reservaPuestoExacto).toBe(true);
    expect(ex.mesesReservaPuestoExacto).toBe(12);
    expect(ex.cotizaDurante).toBe(false);
    expect(ex.mesesComputablesSSTotal).toBe(18);
    expect(ex.costeTotalIngresosNoPecibidos).toBeCloseTo(32400.00, 2);
  });

  test('GOLDEN-CJ: voluntaria con menos de 1 año de antigüedad → no cumple requisitos [SS pendiente verificación]', () => {
    const ex = calcularExcedencia({
      tipo: 'voluntaria',
      antiguedadAnios: 0.5,
      salarioBrutoMensual: 1500,
      duracionMeses: 6,
    });
    expect(ex.cumpleRequisitos).toBe(false);
    expect(ex.motivoIncumplimiento).toBeDefined();
    expect(ex.motivoIncumplimiento?.length ?? 0).toBeGreaterThan(0);
    expect(ex.costeTotalIngresosNoPecibidos).toBeCloseTo(9000.00, 2);
  });

  test('GOLDEN-CK: cuidado de familiar, 2.200 €/mes, 24 meses → reserva 12 meses, computan los 24 meses SS (RDL 2/2023) [Capa 1 · LGSS art. 237.2]', () => {
    // Duración máxima 24 meses (≤ 24, cumple). Reserva puesto exacto primer año (12 meses).
    // El RDL 2/2023 amplió de 1 a 3 años (36 meses) el período computable a efectos SS para
    // cuidado de familiar (art. 237.2 LGSS), por lo que los 24 meses solicitados (< 36) computan íntegros.
    // Coste = 2.200 × 24 = 52.800 €.
    const ex = calcularExcedencia({
      tipo: 'cuidado_familiar',
      antiguedadAnios: 5,
      salarioBrutoMensual: 2200,
      duracionMeses: 24,
    });
    expect(ex.cumpleRequisitos).toBe(true);
    expect(ex.duracionMaximaMeses).toBe(24);
    expect(ex.mesesReservaPuestoExacto).toBe(12);
    expect(ex.mesesComputablesSSTotal).toBe(24);
    expect(ex.costeTotalIngresosNoPecibidos).toBeCloseTo(52800.00, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularComplementoBrechaGenero
// Complemento por hijos en pensiones contributivas (art. 60 LGSS, RDL 3/2026).
// [SS pendiente verificación]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularComplementoBrechaGenero (Capa 1 · art. 60 LGSS)', () => {

  test('GOLDEN-CL: jubilación, 2 hijos → complemento 73,80 €/mes (2 × 36,90 €) [SS pendiente verificación]', () => {
    // Complemento mensual = 2 × 36,90 = 73,80 €. Anual (14 pagas) = 1.033,20 €.
    // Pensión total con complemento = 1.200 + 73,80 = 1.273,80 €.
    const cb = calcularComplementoBrechaGenero({
      sexo: 'mujer',
      numHijos: 2,
      tipoPension: 'jubilacion',
      cuantiaPensionBeneficiario: 1200,
    });
    expect(cb.tieneDerechoComplemento).toBe(true);
    expect(cb.hijosComputables).toBe(2);
    expect(cb.cuantiaPorHijoMensual).toBeCloseTo(36.90, 2);
    expect(cb.complementoMensual).toBeCloseTo(73.80, 2);
    expect(cb.complementoAnual).toBeCloseTo(1033.20, 2);
    expect(cb.pensionTotalMensual).toBeCloseTo(1273.80, 2);
  });

  test('GOLDEN-CM: incapacidad permanente, 5 hijos → se computan máximo 4 hijos = 147,60 €/mes [SS pendiente verificación]', () => {
    // hijosComputables = min(5, 4) = 4. Complemento mensual = 4 × 36,90 = 147,60 €.
    // Anual (14 pagas) = 2.066,40 €.
    const cb = calcularComplementoBrechaGenero({
      sexo: 'hombre',
      numHijos: 5,
      tipoPension: 'incapacidad_permanente',
    });
    expect(cb.tieneDerechoComplemento).toBe(true);
    expect(cb.hijosComputables).toBe(4);
    expect(cb.complementoMensual).toBeCloseTo(147.60, 2);
    expect(cb.complementoAnual).toBeCloseTo(2066.40, 2);
  });

  test('GOLDEN-CN: hecho causante anterior a 2021 → no procede el complemento [SS pendiente verificación]', () => {
    const cb = calcularComplementoBrechaGenero({
      sexo: 'mujer',
      numHijos: 1,
      tipoPension: 'jubilacion',
      fechaHechoCausante: 'antes_2021',
    });
    expect(cb.tieneDerechoComplemento).toBe(false);
    expect(cb.hijosComputables).toBe(0);
    expect(cb.complementoMensual).toBe(0);
    expect(cb.complementoAnual).toBe(0);
  });

});


// ────────────────────────────────────────────────────────────────────────────
// RAMAS FISCALES — calcular_gastos_compra_inmueble
// El riesgo de esta calculadora no es aritmético sino de ENRUTADO: aplicar la regla
// de la vivienda a un inmueble que no lo es. Cada test fija una rama que diverge.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Invariantes de ramas fiscales — calcular_gastos_compra_inmueble', () => {
  const base = { precio: 100000, ccaa: 'madrid' } as const;

  test('ESTRUCTURAL: total de gastos = impuesto + AJD + notaría + registro + gestoría', () => {
    const g = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'local_comercial' });
    expect(g.totalGastos).toBeCloseTo(g.importeImpuesto + g.ajd + g.notaria + g.registro + g.gestoria, 2);
    expect(g.totalOperacion).toBeCloseTo(g.precio + g.totalGastos, 2);
  });

  test('ANEJO: garaje de obra nueva con la vivienda paga IVA 10%; independiente, 21%', () => {
    const conVivienda = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'garaje', obraNueva: true, anejoDeVivienda: true });
    const aparte = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'garaje', obraNueva: true, anejoDeVivienda: false });
    expect(conVivienda.porcentajeImpuesto).toBe(10);
    expect(aparte.porcentajeImpuesto).toBe(21);
    expect(aparte.importeImpuesto).toBeGreaterThan(conVivienda.importeImpuesto);
  });

  test('REGRESIÓN: el trastero independiente NO hereda el IVA reducido del anejo', () => {
    // Bug corregido el 25/07/2026: la app aplicaba 10% aunque se marcara "independiente".
    const g = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'trastero', obraNueva: true, anejoDeVivienda: false });
    expect(g.porcentajeImpuesto).toBe(21);
  });

  test('RÚSTICA: exenta de IVA → paga ITP y no genera plusvalía municipal', () => {
    const g = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'finca_rustica' });
    expect(g.tipoImpuesto).toContain('ITP');
    expect(g.ajd).toBe(0); // ITP y AJD gradual son incompatibles (art. 31.2 TRLITP)
    expect(g.vendedorPagaPlusvaliaMunicipal).toBe(false);
  });

  test('SOLAR: quien vende decide el impuesto — promotor IVA + AJD, particular ITP', () => {
    const dePromotor = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'solar_edificable', vendedorEsEmpresario: true });
    const deParticular = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'solar_edificable', vendedorEsEmpresario: false });
    expect(dePromotor.porcentajeImpuesto).toBe(21);
    expect(dePromotor.ajd).toBeGreaterThan(0);
    expect(deParticular.tipoImpuesto).toContain('ITP');
    expect(deParticular.ajd).toBe(0);
    // A diferencia de la rústica, el solar es suelo urbano
    expect(dePromotor.vendedorPagaPlusvaliaMunicipal).toBe(true);
  });

  test('RENUNCIA: local en segunda mano con renuncia pasa de ITP a IVA deducible + AJD', () => {
    const sinRenuncia = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'local_comercial' });
    const conRenuncia = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'local_comercial', renunciaExencionIva: true });
    expect(sinRenuncia.tipoImpuesto).toContain('ITP');
    expect(sinRenuncia.ivaDeducible).toBe(false);
    expect(conRenuncia.porcentajeImpuesto).toBe(21);
    expect(conRenuncia.ivaDeducible).toBe(true);
    expect(conRenuncia.ajd).toBeGreaterThan(0);
  });

  test('REDUCIDOS: los tipos de ITP por perfil no alcanzan a local, nave ni suelo', () => {
    const conPerfil = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'nave_industrial', perfilComprador: 'joven' });
    const general = calcularGastosCompraInmueble({ ...base, tipoInmueble: 'nave_industrial', perfilComprador: 'general' });
    expect(conPerfil.porcentajeImpuesto).toBe(general.porcentajeImpuesto);
  });

  test('ESTRUCTURAL: precio no positivo lanza error en lugar de devolver ceros', () => {
    expect(() => calcularGastosCompraInmueble({ ...base, precio: 0, tipoInmueble: 'vivienda' })).toThrow();
  });
});

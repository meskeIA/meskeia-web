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
 *
 * ── Qué significa la marca [sin contraste oficial] ───────────────────────────
 *
 * La llevan los goldens de prestaciones (incapacidad, viudedad, maternidad,
 * excedencia, baja médica…), y afirma UNA cosa concreta: que el valor esperado se
 * dedujo de la lógica de la propia calculadora, sin contrastar el caso contra el
 * simulador oficial de la Seguridad Social.
 *
 * Es decir, son candados de REGRESIÓN, no certificados de acierto: detectan que un
 * resultado cambie sin querer, pero no prometen que sea el que daría el INSS. No
 * confundir con la vigencia de los DATOS: las cifras que consumen sí están selladas
 * en data/fiscal/ contra su fuente oficial.
 *
 * NO ES UNA TAREA PENDIENTE, y por eso dejó de llamarse [SS pendiente verificación]
 * el 13/08/2026. El contraste con los simuladores del INSS no está a nuestro
 * alcance —requieren identificación y este proyecto no es una gestoría autorizada,
 * que es justo lo que declaran los disclaimers de las apps—, así que anunciarlo como
 * pendiente prometía un trabajo que nunca iba a hacerse: cada pocos meses obligaba a
 * releer el git log para acabar concluyendo lo mismo. La marca describe ahora el
 * alcance permanente del test, que es información honesta y estable.
 *
 * Qué hacer al verla: nada. Al tocar uno de estos tests, actualizar sus cifras
 * contra data/fiscal/ y conservar la marca.
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
import { calcularPensionComplementaria } from '../lib/calculadoras/pensionComplementaria';
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
import { calcularDeduccionAutonomoIRPF } from '../lib/calculadoras/deduccionAutonomoIRPF';
import { calcularDeduccionDiscapacidadIRPF } from '../lib/calculadoras/deduccionDiscapacidadIRPF';
import { calcularDeduccionMaternidadIRPF } from '../lib/calculadoras/deduccionMaternidadIRPF';
import { calcularIIVTNU } from '../lib/calculadoras/iivtnuPlusvaliaMunicipal';
import { calcularImpuestoPatrimonio } from '../lib/calculadoras/impuestoPatrimonio';
import { calcularImpuestosDivorcio } from '../lib/calculadoras/impuestosDivorcio';
import { calcularIRPFSegundoPagador } from '../lib/calculadoras/irpfSegundoPagador';
import {
  calcularLegitimas,
  REGIMENES_INFO,
  REGIMENES_VALIDOS,
  type RegimenId,
} from '../lib/calculadoras/legitimas';
import { calcularRetencionDividendos } from '../lib/calculadoras/retencionDividendos';
import { TRAMOS_IRPF_2025, MINIMOS_IRPF_2025, OBLIGACION_DECLARAR_2025, REDUCCION_TRIBUTACION_CONJUNTA_2025, cuotaEscalaGeneral, desglosarEscalaGeneral, calcularCuotaIntegraGeneral } from '../data/fiscal/irpf';
import { DEDUCCIONES_IRPF_DISCAPACIDAD_2025 } from '../data/fiscal/dependencia';
import { DEDUCCION_MATERNIDAD_IRPF } from '../data/fiscal/maternidad';
import { COEFICIENTES_IIVTNU_2025 } from '../data/fiscal/inmuebles';
import { TRAMOS_GANANCIAS_PATRIMONIALES_2025, RETENCIONES_IS_2025, TIPOS_IS_2025 } from '../data/fiscal';

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
// REGRESIÓN 09/09/2026 — dos defectos del motor de sucesiones, encontrados al reparar
// la tanda del Inspector del 07/09 en `simulador-heredar-vivienda`.
//
// No los levantó el Inspector, y no es un fallo suyo: sus actas cubren APPS, y este motor
// —que alimenta además la tool `calcular_sucesiones` del MCP de Delegum y
// /api/chatgpt/sucesiones— solo se mira desde la app que lo llama. Salieron de comparar la
// cadena que la web reconstruye a mano con la que el motor calcula, y por eso quedan aquí:
// en el fichero de invariantes del motor, no en el de la app.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Regresión — el motor de sucesiones no pierde al nieto ni descuadra su desglose', () => {
  test('el NIETO de 21 o más años recibe la reducción en base de Asturias, igual que el hijo', () => {
    // `reduccionAutonomicaBase` indexaba `bonificaciones[p.grupo]` en crudo, y ninguna
    // comunidad declara la clave 'II-descendiente' —el grupo se separó SOLO para la escala
    // catalana—, así que en Asturias el nieto perdía los 300.000 € que las notas de esa misma
    // ficha reconocen a los «Grupos I y II». La otra función del fichero que lee esa tabla,
    // `aplicarBonificacionIS`, sí colapsaba la clave con `claveBonificacion`.
    const nieto = calcularSucesion({ baseImponible: 150000, ccaa: 'asturias', grupo: 'II-descendiente', edadHeredero: 40 });
    const hijo = calcularSucesion({ baseImponible: 150000, ccaa: 'asturias', grupo: 'II', edadHeredero: 40 });

    // Antes: el nieto pagaba 12.651,99 € donde le corresponden 0 €.
    expect(nieto.reduccionAutonomicaBase).toBe(300000);
    expect(nieto.cuotaFinal).toBe(hijo.cuotaFinal);
    expect(nieto.cuotaFinal).toBe(0);

    // Con base mayor la diferencia era de 56.926,11 €.
    const nietoAlto = calcularSucesion({ baseImponible: 600000, ccaa: 'asturias', grupo: 'II-descendiente', edadHeredero: 40 });
    const hijoAlto = calcularSucesion({ baseImponible: 600000, ccaa: 'asturias', grupo: 'II', edadHeredero: 40 });
    expect(nietoAlto.cuotaFinal).toBe(hijoAlto.cuotaFinal);
    // Base liquidable 284.043,13 € (600.000 − 15.956,87 − 300.000). Tramo que abre en
    // 239.389,13: 40.011,04 + 25,50 % de 44.654,00 = 51.397,81 €. Antes del hallazgo 735
    // este golden decía 30.241,34 €, que era la escala de siete tramos.
    expect(nietoAlto.cuotaFinal).toBe(51397.81);
  });

  test('pero Cataluña SIGUE distinguiendo al nieto del hijo, que es para lo que existe el grupo', () => {
    // La reparación colapsa la clave solo donde el régimen común no distingue. Si esto se
    // igualara, se habría deshecho la corrección catalana del 08/09/2026 (100.000 € al hijo,
    // 50.000 € al nieto) sin que nada lo dijera.
    const nieto = calcularSucesion({ baseImponible: 600000, ccaa: 'cataluna', grupo: 'II-descendiente', edadHeredero: 40 });
    const hijo = calcularSucesion({ baseImponible: 600000, ccaa: 'cataluna', grupo: 'II', edadHeredero: 40 });
    expect(nieto.cuotaFinal).toBeGreaterThan(hijo.cuotaFinal);
    expect(hijo.cuotaFinal).toBe(41175);
    expect(nieto.cuotaFinal).toBe(47275);
  });

  test('INVARIANTE: cuota tributaria − bonificación publicada = cuota final, en todo el barrido', () => {
    // El motor publicaba `bonificacionCcaa` redondeada a dos decimales pero restaba la de
    // dentro, sin redondear, así que el desglose no cuadraba consigo mismo por un céntimo en
    // el 0,9 % de los casos. En una liquidación fiscal la aritmética escrita tiene que salir.
    const ccaas = ['asturias', 'castilla-mancha', 'madrid', 'cantabria', 'andalucia', 'murcia', 'galicia', 'cataluna'];
    const grupos = ['I-conyuge', 'I-descendiente', 'II', 'II-descendiente', 'II-ascendiente', 'III', 'IV'] as const;
    let comprobados = 0;
    for (const ccaa of ccaas) {
      for (const grupo of grupos) {
        for (let base = 20000; base <= 900000; base += 7137) {
          const res = calcularSucesion({ baseImponible: base, ccaa, grupo, edadHeredero: 45 });
          const resta = Math.round((res.cuotaTributaria - res.bonificacionCcaa) * 100) / 100;
          expect(resta, `${ccaa}/${grupo}/${base}`).toBe(res.cuotaFinal);
          comprobados++;
        }
      }
    }
    expect(comprobados).toBeGreaterThan(6000);
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
// Tarifa estatal (art. 21.2 de la Ley 29/1987) + tarifa Cataluña.
//
// ⚠️ 11/09/2026 — ocho de estos goldens cambiaron de valor con el hallazgo 735, y conviene
// saber por qué NO lo cazaron: se escribieron "verificados internamente con la misma fórmula
// que el código", es decir leyendo la misma tabla que estaba mal. Un golden así no certifica
// que el número sea el de la ley; solo congela el que salía. Es la forma exacta que ya había
// avisado GOLDEN-AE con la reducción catalana. Los valores de abajo están recalculados contra
// la escala del BOE, tramo por tramo; la escala en sí la vigila tests/tarifa-isd-motor.spec.ts,
// que la compara fila a fila con el texto legal en vez de con el propio motor.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularSucesion (Capa 1 · tarifa ISD estatal + autonómica)', () => {

  test('GOLDEN-AC: Madrid, I-descendiente, 200.000 € → 99% bonif → cuotaFinal 282,50 €', () => {
    // Hijo hereda 200.000 € de padre. Madrid aplica 99% bonificación.
    // baseLiquidable = 200.000 − 15.956,87 (red. parentesco) = 184.043,13
    // cuotaIntegra, tramo que abre en 159.634,83 = 23.063,25 + 21,25 % de 24.408,30 = 28.250,01
    // bonif 99% → cuotaFinal = 282,50 €
    const res = calcularSucesion({ baseImponible: 200000, ccaa: 'madrid', grupo: 'I-descendiente' });
    expect(res.reduccionParentesco).toBeCloseTo(15956.87, 2);
    expect(res.baseLiquidable).toBeCloseTo(184043.13, 2);
    expect(res.cuotaIntegra).toBeCloseTo(28250.01, 2);
    expect(res.coeficienteMultiplicador).toBe(1.0);
    expect(res.cuotaTributaria).toBeCloseTo(28250.01, 2);
    expect(res.bonificacionCcaa).toBeCloseTo(27967.51, 2);
    expect(res.porcentajeBonificacion).toBeCloseTo(99, 1);
    expect(res.cuotaFinal).toBeCloseTo(282.50, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.14, 2);
    expect(res.esForal).toBe(false);
  });

  test('GOLDEN-AD: Asturias, Grupo IV (extraño), 50.000 € → coef×2 → cuotaFinal 9.897,86 €', () => {
    // Grupo IV (no pariente): sin reducción parentesco, coeficiente multiplicador 2,0.
    // baseLiquidable = 50.000; tramo que abre en 47.930,72: 4.685,10 + 12,75 % de 2.069,28
    // = 4.948,93 de cuota íntegra; ×2 = 9.897,86 €
    const res = calcularSucesion({ baseImponible: 50000, ccaa: 'asturias', grupo: 'IV' });
    expect(res.reduccionParentesco).toBe(0);
    expect(res.baseLiquidable).toBe(50000);
    expect(res.cuotaIntegra).toBeCloseTo(4948.93, 2);
    expect(res.coeficienteMultiplicador).toBe(2.0);
    expect(res.cuotaTributaria).toBeCloseTo(9897.86, 2);
    expect(res.bonificacionCcaa).toBe(0);
    expect(res.cuotaFinal).toBeCloseTo(9897.86, 2);
    expect(res.tipoEfectivo).toBeCloseTo(19.80, 2);
  });

  /**
   * El caso del hallazgo 276 del Inspector: hasta el 24/08/2026 `reduccionBase` solo se leía
   * para ROTULARLA («Reducción adicional en base: 300.000 €») y nunca se restaba, así que el
   * MCP de Delegum y el GPT liquidaban 10.346,13 € sobre una herencia que la web —que sí la
   * aplicaba desde el hallazgo 200— resolvía en 0,00 €. La respuesta se contradecía a sí misma.
   *
   * Hijo, Asturias, 250.000 € que son íntegramente vivienda habitual:
   *   reducción parentesco     15.956,87
   *   reducción vivienda       122.606,47  (250.000 × 95 % = 237.500 → tope 122.606,47)
   *   reducción autonómica     300.000,00  (BONIFICACIONES_CCAA_IS.asturias…['II'].reduccionBase)
   *                            ──────────
   *                            438.563,34 > 250.000 → base liquidable 0 → cuota 0,00 €
   */
  test('GOLDEN-AD2: Asturias aplica su reducción en BASE, no solo la rotula (hallazgo 276)', () => {
    const res = calcularSucesion({
      baseImponible: 250000, ccaa: 'asturias', grupo: 'II', viviendaHabitual: 250000,
    });
    expect(res.reduccionAutonomicaBase).toBe(300000);
    expect(res.totalReducciones).toBeCloseTo(438563.34, 2);
    expect(res.baseLiquidable).toBe(0);
    expect(res.cuotaIntegra).toBe(0);
    expect(res.cuotaFinal).toBe(0);
    // Lo que la respuesta dice y lo que liquida tienen que ser lo mismo
    expect(res.detalleBonificacion).toContain('ya aplicada antes de la tarifa');
  });

  /**
   * Y el mismo beneficio cuando NO absorbe la base entera, para que el test anterior no pase
   * por un cero que también daría una reducción desbocada. Hijo, Asturias, 500.000 € sin
   * vivienda habitual:
   *   base liquidable = 500.000 − 15.956,87 − 300.000 = 184.043,13
   *   cuota íntegra   = 23.063,25 + (184.043,13 − 159.634,83) × 21,25 % = 28.250,01
   *   coeficiente 1,0 y Asturias no bonifica en cuota → cuota final 28.250,01 €
   */
  test('GOLDEN-AD3: Asturias, Grupo II, 500.000 € → base 184.043,13 → cuotaFinal 28.250,01 €', () => {
    const res = calcularSucesion({ baseImponible: 500000, ccaa: 'asturias', grupo: 'II' });
    expect(res.reduccionAutonomicaBase).toBe(300000);
    expect(res.baseLiquidable).toBeCloseTo(184043.13, 2);
    expect(res.cuotaIntegra).toBeCloseTo(28250.01, 2);
    expect(res.coeficienteMultiplicador).toBe(1.0);
    expect(res.bonificacionCcaa).toBe(0);
    expect(res.cuotaFinal).toBeCloseTo(28250.01, 2);
  });

  /**
   * ⚠️ Este golden esperaba 31.500 € hasta el 08/09/2026, y esa cifra venía de aplicarle al
   * HIJO la reducción de 50.000 € que el art. 2 de la Ley 19/2010 reserva al nieto. El golden
   * no detectó el error: lo fijó, porque se escribió leyendo el mismo `data/fiscal` que estaba
   * mal. La cifra de ahora está contrastada contra la Agència Tributària de Catalunya — el
   * detalle, en `tests/sucesiones-cataluna-motor.spec.ts`.
   */
  test('GOLDEN-AE: Cataluña, HIJO ≥21, 300.000 € → tarifa propia y art. 58 bis → cuotaFinal 10.350 €', () => {
    // Cataluña usa tarifa propia (7%–32%) y reducción de parentesco propia: 100.000 € al hijo.
    // baseLiquidable = 300.000 − 100.000 = 200.000; tramo 17% → cuotaIntegra = 23.000 €
    // Bonificación del art. 58 bis por la BASE IMPONIBLE de 300.000 €: 55,00 % → 10.350 €
    const res = calcularSucesion({ baseImponible: 300000, ccaa: 'cataluna', grupo: 'II' });
    expect(res.reduccionParentesco).toBeCloseTo(100000, 2);
    expect(res.baseLiquidable).toBe(200000);
    expect(res.cuotaIntegra).toBeCloseTo(23000, 2);
    expect(res.porcentajeBonificacion).toBeCloseTo(55, 2);
    expect(res.cuotaFinal).toBeCloseTo(10350, 2);
    expect(res.tipoEfectivo).toBeCloseTo(3.45, 2);
    expect(res.esForal).toBe(true);
    expect(res.tarifaAplicada).toContain('Cataluña');
  });

  test('GOLDEN-AE2: Cataluña, NIETO ≥21, 300.000 € → reduce 50.000 € → cuotaFinal 14.175 €', () => {
    // El mismo caso con el parentesco que de verdad reduce 50.000 €: la cifra que el golden
    // original atribuía al hijo (31.500 € de cuota íntegra) es la que le corresponde al nieto.
    // Misma escala del Grupo II —el art. 58 bis no distingue nieto de hijo—: 55,00 %.
    const res = calcularSucesion({ baseImponible: 300000, ccaa: 'cataluna', grupo: 'II-descendiente' });
    expect(res.reduccionParentesco).toBeCloseTo(50000, 2);
    expect(res.baseLiquidable).toBe(250000);
    expect(res.cuotaIntegra).toBeCloseTo(31500, 2);
    expect(res.cuotaFinal).toBeCloseTo(14175, 2);
  });

  test('GOLDEN-AF: Madrid, I-descendiente, 200.000 € + vivienda 200.000 € → cuotaFinal 64,54 €', () => {
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
    // Tramo que abre en 55.918,17: 5.703,50 + 13,60 % de 5.518,49 = 6.454,01
    expect(res.cuotaIntegra).toBeCloseTo(6454.01, 2);
    expect(res.cuotaTributaria).toBeCloseTo(6454.01, 2);
    expect(res.bonificacionCcaa).toBeCloseTo(6389.47, 2);
    expect(res.cuotaFinal).toBeCloseTo(64.54, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.03, 2);
  });

  test('GOLDEN-AG: Madrid, I-descendiente, 200.000 €, edad 16 → reducción menor-21 → cuotaFinal 240,10 €', () => {
    // Reducción por edad: (21−16) × 3.990,72 = 19.953,60 €.
    // baseLiquidable = 200.000 − 15.956,87 − 19.953,60 = 164.089,53
    const res = calcularSucesion({
      baseImponible: 200000, ccaa: 'madrid', grupo: 'I-descendiente', edadHeredero: 16,
    });
    expect(res.reduccionEdadMenor21).toBeCloseTo(19953.6, 2);
    expect(res.totalReducciones).toBeCloseTo(35910.47, 2);
    expect(res.baseLiquidable).toBeCloseTo(164089.53, 2);
    // Tramo que abre en 159.634,83: 23.063,25 + 21,25 % de 4.454,70 = 24.009,87
    expect(res.cuotaIntegra).toBeCloseTo(24009.87, 2);
    expect(res.bonificacionCcaa).toBeCloseTo(23769.77, 2);
    expect(res.cuotaFinal).toBeCloseTo(240.10, 2);
    expect(res.tipoEfectivo).toBeCloseTo(0.12, 2);
  });

  /**
   * Hallazgo 500 del Inspector: `evaluarReduccionVivienda` es la fuente única de la reducción
   * de vivienda habitual desde el 27/08/2026, pero `app/estimador-impuesto-sucesiones/page.tsx`
   * tenía una TERCERA copia que concedía el 95% a todo el Grupo III sin comprobar el art.
   * 20.2.c LISD (65 años + convivencia 2 años). Este golden fija el caso del acta: colateral SIN
   * esos datos no debe recibir la reducción, aunque declare una vivienda habitual.
   */
  test('GOLDEN-AH: Madrid, Grupo III, vivienda 200.000 € sin edad/convivencia → sin reducción (hallazgo 500)', () => {
    const res = calcularSucesion({
      baseImponible: 200000, ccaa: 'madrid', grupo: 'III', incluyeAjuar: true, viviendaHabitual: 200000,
    });
    expect(res.baseImponibleConAjuar).toBeCloseTo(206000, 2);
    expect(res.reduccionParentesco).toBeCloseTo(7993.46, 2);
    expect(res.reduccionVivienda).toBe(0);
    expect(res.reduccionViviendaNoAplicada).toContain('menor de');
    expect(res.baseLiquidable).toBeCloseTo(198006.54, 2);
    // Tramo que abre en 159.634,83: 23.063,25 + 21,25 % de 38.371,71 = 31.217,24
    expect(res.cuotaIntegra).toBeCloseTo(31217.24, 2);
    expect(res.coeficienteMultiplicador).toBeCloseTo(1.5882, 4);
    expect(res.cuotaTributaria).toBeCloseTo(49579.22, 2);
    expect(res.cuotaFinal).toBeCloseTo(24789.61, 2);
  });

  test('GOLDEN-AI: Madrid, Grupo III, ≥65 años y convivencia → SÍ hay reducción de vivienda (hallazgo 500)', () => {
    const res = calcularSucesion({
      baseImponible: 200000, ccaa: 'madrid', grupo: 'III', incluyeAjuar: true, viviendaHabitual: 200000,
      edadHeredero: 70, convivenciaDosAnios: true,
    });
    expect(res.reduccionVivienda).toBeCloseTo(122606.47, 2);
    expect(res.reduccionViviendaNoAplicada).toBeNull();
    expect(res.baseLiquidable).toBeCloseTo(75400.07, 2);
    // Tramo que abre en 71.893,07: 7.943,98 + 15,30 % de 3.507,00 = 8.480,55
    expect(res.cuotaIntegra).toBeCloseTo(8480.55, 2);
    expect(res.cuotaFinal).toBeCloseTo(6734.40, 2);
  });

  test('GOLDEN-AJ: Grupo III, edad ≥65 pero SIN convivencia → sin reducción, con motivo propio', () => {
    const res = calcularSucesion({
      baseImponible: 200000, ccaa: 'madrid', grupo: 'III', viviendaHabitual: 200000, edadHeredero: 70,
    });
    expect(res.reduccionVivienda).toBe(0);
    expect(res.reduccionViviendaNoAplicada).toContain('no convivió');
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularIRPF
// Tramos estatal + autonómico medio 2025 (Ley 35/2006 + LPGE 2025).
// Todos los casos verificados internamente. Pipeline:
//   input → −gastos deducibles (2.000€) → −reducción RNT (art.20) → tarifa progresiva → −mínimo personal/familiar
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularIRPF (Capa 1 · tarifa progresiva 2025)', () => {

  test('GOLDEN-AH: soltero, 30.000 € trabajo → cuota 5.511,00 €, tipo 19,68%', () => {
    // ⚠️ RECALCULADO EL 09/09/2026 tras dos correcciones verificadas contra el Manual
    // práctico de Renta 2025 de la AEAT:
    //   1. La reducción del art. 20 llevaba la redacción anterior al RDL 4/2024 y, sobre
    //      todo, una reducción residual de 2.364 € para todo RNT ≥ 16.825 € que NO EXISTE:
    //      se agota en 19.747,5 €.
    //   2. El mínimo personal se restaba de la BASE. El art. 63.1.2º manda aplicar la escala
    //      a la base completa y minorar la cuota con la escala aplicada AL MÍNIMO.
    // Los valores de antes no eran "otro criterio": estaban mal.
    // A mano: rntBruto = 28.000 → reducción art.20 = 0 (28.000 > 19.747,5) → rtn = 28.000
    //         cuota = escala(28.000) − escala(5.550)
    //               = (12.450×19% + 7.750×24% + 7.800×30%) − 5.550×19%
    //               = 6.565,50 − 1.054,50 = 5.511,00 €
    const res = calcularIRPF({ rendimientosTrabajo: 30000 });
    expect(res.gastosDeducibles).toBe(2000);
    expect(res.reduccionRNT).toBe(0);
    expect(res.rendimientosTrabajoNetos).toBe(28000);
    expect(res.baseImponibleGeneral).toBe(28000);
    expect(res.minimoPersonalFamiliar).toBe(5550);
    expect(res.baseLiquidableGeneral).toBe(28000);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(5511, 2);
    expect(res.cuotaIntegralAhorro).toBe(0);
    expect(res.cuotaIntegra).toBeCloseTo(5511, 2);
    expect(res.tipoEfectivoGeneral).toBeCloseTo(19.68, 2);
  });

  test('GOLDEN-AI: soltero, 60.000 € trabajo → cuota 16.107,00 €, tipo 27,77%', () => {
    // A mano: rntBruto = 58.000 → reducción 0 → base 58.000
    //   escala(58.000) = 2.365,50 + 1.860 + 4.500 + 22.800×37% = 17.161,50
    //   − escala(5.550) = 1.054,50  →  16.107,00 €
    const res = calcularIRPF({ rendimientosTrabajo: 60000 });
    expect(res.reduccionRNT).toBe(0);
    expect(res.rendimientosTrabajoNetos).toBe(58000);
    expect(res.baseLiquidableGeneral).toBe(58000);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(16107, 2);
    expect(res.cuotaIntegra).toBeCloseTo(16107, 2);
    expect(res.tipoEfectivoGeneral).toBeCloseTo(27.77, 2);
  });

  test('GOLDEN-AJ: soltero, 13.000 € trabajo → el mínimo personal cubre la base → cuota 0 €', () => {
    // RECALCULADO 09/09/2026: la reducción máxima del art. 20 es 7.302 € (RNT ≤ 14.852),
    // no 6.498 €. rntBruto = 11.000 → reducción 7.302 → rtn = 3.698.
    // El mínimo (5.550) supera la base (3.698), así que se acota a ella y la cuota es 0:
    // escala(3.698) − escala(3.698) = 0. La conclusión del golden no cambia, la aritmética sí.
    const res = calcularIRPF({ rendimientosTrabajo: 13000 });
    expect(res.reduccionRNT).toBe(7302);
    expect(res.rendimientosTrabajoNetos).toBeCloseTo(3698, 2);
    expect(res.baseLiquidableGeneral).toBeCloseTo(3698, 2);
    expect(res.cuotaIntegra).toBe(0);
    expect(res.cuotaDiferencial).toBe(0);
    expect(res.tipoEfectivoGeneral).toBe(0);
  });

  test('GOLDEN-AK: 40.000 € trabajo + 5.000 € capital, 2 hijos, 4.000 € retenciones → diferencial 4.688 €', () => {
    // RECALCULADO 09/09/2026 (reducción art.20 = 0 por encima de 19.747,5 y mínimo aplicado
    // en cuota, no en base). A mano:
    //   base general = 40.000 − 2.000 = 38.000 · mínimo = 5.550 + 2.400 + 2.700 = 10.650
    //   cuota general = escala(38.000) − escala(10.650)
    //                 = (2.365,50 + 1.860 + 4.500 + 2.800×37%) − 10.650×19%
    //                 = 9.761,50 − 2.023,50 = 7.738,00
    //   cuota ahorro  = 5.000 × 19% = 950,00
    //   diferencial   = 8.688,00 − 4.000 = 4.688,00 €
    const res = calcularIRPF({
      rendimientosTrabajo: 40000,
      rendimientosCapitalMobiliario: 5000,
      numHijos: 2,
      retenciones: 4000,
    });
    expect(res.minimoPersonalFamiliar).toBe(10650);   // 5550 + 2400 + 2700
    expect(res.baseLiquidableGeneral).toBeCloseTo(38000, 2);
    expect(res.baseImponibleAhorro).toBe(5000);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(7738, 2);
    expect(res.cuotaIntegralAhorro).toBeCloseTo(950, 2);
    expect(res.cuotaIntegra).toBeCloseTo(8688, 2);
    expect(res.retenciones).toBe(4000);
    expect(res.cuotaDiferencial).toBeCloseTo(4688, 2);
  });

  test('GOLDEN-AL: 17.000 € trabajo → PRIMER tramo decreciente de la reducción → cuota 457,33 €', () => {
    // RECALCULADO 09/09/2026. La reducción del art. 20 tiene DOS tramos decrecientes, no uno:
    //   rntBruto = 15.000, que cae en el primero (14.852 → 17.673,52), con pendiente 1,75:
    //   reducción = 7.302 − 1,75 × (15.000 − 14.852) = 7.302 − 259 = 7.043,00
    //   rtn = 15.000 − 7.043 = 7.957 → base 7.957, mínimo 5.550, ambos en el tramo del 19 %
    //   cuota = (7.957 − 5.550) × 19 % = 457,33 €
    const res = calcularIRPF({ rendimientosTrabajo: 17000 });
    expect(res.reduccionRNT).toBeCloseTo(7043, 2);
    expect(res.rendimientosTrabajoNetos).toBeCloseTo(7957, 2);
    expect(res.baseLiquidableGeneral).toBeCloseTo(7957, 2);
    expect(res.cuotaIntegraGeneral).toBeCloseTo(457.33, 2);
    expect(res.cuotaIntegra).toBeCloseTo(457.33, 2);
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

  test('GOLDEN-BK: soltero, bruto 24.000 €, 14 pagas → IRPF 3.243,00 €, neto mensual 1.371,21 €', () => {
    // ⚠️ RECALCULADO EL 09/09/2026, y el neto BAJA 61,38 €/mes respecto al valor anterior.
    // No es un cambio de criterio: las dos cifras de antes estaban mal, verificado contra el
    // Manual práctico de Renta 2025 de la AEAT.
    //   1. La reducción del art. 20 NO deja un residual de 2.364 € para rentas medias: se
    //      agota en 19.747,5 € de RNT. Con 20.440 € la reducción es 0, no 2.364.
    //   2. El mínimo personal no se resta de la base (art. 63.1.2º): la escala se aplica a la
    //      base completa y la cuota se minora con la escala aplicada al mínimo.
    //
    // A mano: baseSS 2.000 €/mes → SS anual = 2.000 × 6,50 % × 12 = 1.560,00 €
    //   base imponible = 24.000 − 1.560 − 2.000 = 20.440,00 → reducción art. 20 = 0
    //   cuota = escala(20.440) − escala(5.550)
    //         = (12.450×19 % + 7.750×24 % + 240×30 %) − 5.550×19 %
    //         = 4.297,50 − 1.054,50 = 3.243,00 €
    //   neto anual = 24.000 − 1.560 − 3.243 = 19.197,00 → /14 = 1.371,21 €/mes
    const r = calcularSueldoNeto({ brutoAnual: 24000, situacion: 'soltero', pagas: 14 });
    expect(r.cuotaSSAnual).toBeCloseTo(1560.00, 2);
    expect(r.baseImponible).toBeCloseTo(20440.00, 2);
    expect(r.reduccionRNT).toBeCloseTo(0, 2);
    expect(r.minimoPersonalFamiliar).toBeCloseTo(5550, 2);
    expect(r.baseLiquidable).toBeCloseTo(20440.00, 2);
    expect(r.cuotaIRPF).toBeCloseTo(3243, 2);
    expect(r.tipoRetencion).toBeCloseTo(13.51, 2);
    expect(r.netoAnual).toBeCloseTo(19197, 2);
    expect(r.netoMensual).toBeCloseTo(1371.21, 2);
  });

  test('GOLDEN-BL: casado con ingresos, bruto 35.000 €, 2 hijos (1 menor de 3), 12 pagas → IRPF 4.777,50 €, neto mensual 2.328,96 €', () => {
    // ⚠️ RECALCULADO EL 09/09/2026 por las mismas dos correcciones que GOLDEN-BK.
    // Mínimo personal+familiar = 5.550 + 2.400 (hijo 1º) + 2.700 (hijo 2º) + 2.800 (hijo <3) = 13.450 €.
    // A mano: base imponible = 35.000 − 2.275,00 (SS) − 2.000 = 30.725,00 → reducción art. 20 = 0
    //   cuota = escala(30.725) − escala(13.450)
    //         = (12.450×19 % + 7.750×24 % + 10.525×30 %) − (12.450×19 % + 1.000×24 %)
    //         = 7.383,00 − 2.605,50 = 4.777,50 €
    //   neto anual = 35.000 − 2.275 − 4.777,50 = 27.947,50 → /12 = 2.328,96 €/mes
    const r = calcularSueldoNeto({
      brutoAnual: 35000,
      situacion: 'casado_con_ingresos',
      numHijos: 2,
      hijosMenores3: 1,
      pagas: 12,
    });
    expect(r.cuotaSSAnual).toBeCloseTo(2275.00, 2);
    expect(r.baseImponible).toBeCloseTo(30725.00, 2);
    expect(r.reduccionRNT).toBeCloseTo(0, 2);
    expect(r.minimoPersonalFamiliar).toBeCloseTo(13450, 2);
    expect(r.baseLiquidable).toBeCloseTo(30725.00, 2);
    expect(r.cuotaIRPF).toBeCloseTo(4777.5, 2);
    expect(r.tipoRetencion).toBeCloseTo(13.65, 2);
    expect(r.netoAnual).toBeCloseTo(27947.5, 2);
    expect(r.netoMensual).toBeCloseTo(2328.96, 2);
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

  test('GOLDEN-BO: sueldo neto 2.400 €, pensión 1.500 €, 47 años → brecha 900 €/mes, capital 213.840 €, ahorro 583,03 €/mes', () => {
    // Brecha mensual = 2.400 − 1.500 = 900 €. Brecha anual = 10.800 €.
    // Años de jubilación por defecto = 65 + 21,76 (esperanza de vida a los 65, INE 2024) − 67 = 19,8.
    // Capital = 10.800 × 19,8 = 213.840 €.
    // % pensión/sueldo = 1.500/2.400 × 100 = 62,5%. Años hasta jubilación (67−47) = 20 → n = 240 meses, r_mes = 4%/12.
    // PMT = 213.840 × r_mes / ((1+r_mes)^240 − 1) = 583,03 €/mes.
    const b = calcularBrechaJubilacion({ sueldoNetoMensual: 2400, pensionEstimadaMensual: 1500, edadActual: 47 });
    expect(b.brechaMensual).toBeCloseTo(900, 2);
    expect(b.brechaAnual).toBeCloseTo(10800, 2);
    expect(b.capitalNecesario).toBeCloseTo(213840, 2);
    expect(b.porcentajePensionSobreSueldo).toBeCloseTo(62.5, 2);
    expect(b.anosHastaJubilacion).toBe(20);
    expect(b.ahorroMensualNecesario).toBeCloseTo(583.03, 2);
    expect(b.tieneBrecha).toBe(true);
    expect(b.edadJubilacion).toBe(67);
    expect(b.anosJubilado).toBe(19.8);
  });

  test('GOLDEN-BO2: el supuesto de longevidad es el mismo en brecha y en pensión complementaria', () => {
    // Candado de la unificación (13/08/2026): hasta esa fecha brechaJubilacion usaba 20 años
    // y pensionComplementaria una esperanza de vida de 85 (= 18 años), sin fuente ninguna.
    // Ambos derivan ahora de data/fiscal/esperanza-vida, así que a la misma edad de jubilación
    // los dos motores tienen que cubrir exactamente los mismos años.
    const b = calcularBrechaJubilacion({ sueldoNetoMensual: 2400, pensionEstimadaMensual: 1500, edadActual: 47 });
    const c = calcularPensionComplementaria({ rentaDeseadaMensual: 2400, pensionPublicaEstimada: 1500, edadActual: 47 });
    expect(b.anosJubilado).toBeCloseTo(c.anosJubilacion, 2);
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

  test('GOLDEN-BR: rendimientos 40.000 €, aportación 1.500 €, 40→67 años → ahorro fiscal 555 €, capital 70.626,32 €', () => {
    // Límite deducible = min(1.500, 40.000×30%) = min(1.500, 12.000) = 1.500 € → toda la aportación es deducible.
    // ⚠️ RECALCULADO EL 09/09/2026: el tipo marginal pasa de 30 % a 37 %, y el caso está justo
    // en el filo. RNT = 40.000 − 40.000×6,50 % − 2.000 = 35.400 €. Antes se le restaba una
    // reducción residual del art. 20 de 2.364 € que NO existe (se agota en 19.747,5 €), lo que
    // dejaba la base en 33.036 € y por debajo del corte de 35.200 €. Sin esa resta indebida,
    // 35.400 > 35.200 y el marginal es el 37 %.
    // Ahorro fiscal = 1.500×37% = 555 €. Coste neto = 1.500 − 555 = 945 €.
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
    expect(pp.tipoMarginal).toBe(37);
    expect(pp.ahorroFiscalAnual).toBeCloseTo(555, 2);
    expect(pp.costeNetoAnual).toBeCloseTo(945, 2);
    expect(pp.anosAhorro).toBe(27);
    expect(pp.capitalEstimadoJubilacion).toBeCloseTo(70626.32, 2);
    expect(pp.rentaMensualEstimada).toBeCloseTo(235.42, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularBajaMedica
// Subsidio por Incapacidad Temporal (LGSS arts. 169-176).
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularBajaMedica (Capa 1 · LGSS arts. 169-176)', () => {

  test('GOLDEN-BS: contingencia común, 2.000 €/mes, 30 días → subsidio 1.180 € [sin contraste oficial]', () => {
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

  test('GOLDEN-BT: accidente laboral, 3.000 €/mes, 15 días → subsidio 1.125 € desde día 1 [sin contraste oficial]', () => {
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
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularJubilacionAnticipada (Capa 1 · RDL 2/2023)', () => {

  test('GOLDEN-BU: involuntaria, 35 años cotizados, 12 meses anticipación → reducción 7,5% [sin contraste oficial]', () => {
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

  test('GOLDEN-BV: voluntaria, 37 años cotizados, 24 meses anticipación → reducción 16% [sin contraste oficial]', () => {
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

  test('GOLDEN-BW: involuntaria, 30 años cotizados (no cumple mínimo de 33) → no posible [sin contraste oficial]', () => {
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
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPensionIncapacidad (Capa 1 · LGSS arts. 194-200)', () => {

  test('GOLDEN-BX: IPT, edad 50 (sin recargo), sin cónyuge → 55% BR = 1.100 €/mes [sin contraste oficial]', () => {
    // BR = 224.000 / 112 = 2.000 €. IPT al 55% (sin recargo, edad < 55) = 1.100 €/mes.
    // Mínimo (IPT < 60 años, unipersonal, 2026) = 690,20 € → no se aplica (1.100 > 690,20).
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
    expect(pi.pensionMinimaGarantizada).toBeCloseTo(690.20, 2);
    expect(pi.cuantiaEfectivaMensual).toBeCloseTo(1100.00, 2);
    expect(pi.cuantiaAnual14Pagas).toBeCloseTo(15400.00, 2);
  });

  test('GOLDEN-BY: IPA, edad 60, con cónyuge → 100% BR = 1.500 €/mes [sin contraste oficial]', () => {
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

  test('GOLDEN-CA: IP Parcial → indemnización única de 24 mensualidades de BR [sin contraste oficial]', () => {
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
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPensionViudedad (Capa 1 · LGSS arts. 219-231)', () => {

  test('GOLDEN-CB: causante activo, BC media 2.000 €, 50 años → 52% general = 891,43 €/mes [sin contraste oficial]', () => {
    // BR = (24 × 2.000) / 28 = 1.714,29 €. Sin cargas ni condiciones especiales → 52% general.
    // Pensión bruta = 1.714,29 × 52% = 891,43 €. Mínimo (< 60, sin cargas, 2026) = 709,40 € → no se aplica.
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
    expect(pv.pensionMinima).toBeCloseTo(709.40, 2);
    expect(pv.pensionFinal).toBeCloseTo(891.43, 2);
    expect(pv.pensionNetaAprox).toBeCloseTo(891.43, 2);
  });

  test('GOLDEN-CC: causante jubilado, pensión 1.800 €, beneficiario 67 años, ingresos < SMI → 60% [sin contraste oficial]', () => {
    // BR = pensión del causante = 1.800 €. Edad ≥ 65 e ingresos (500) < SMI (1.221) → 60%.
    // Pensión bruta = 1.800 × 60% = 1.080 €. Mínimo (≥ 65, 2026) = 936,20 € → no se aplica.
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
    expect(pv.pensionMinima).toBeCloseTo(936.20, 2);
    expect(pv.pensionFinal).toBeCloseTo(1080.00, 2);
    expect(pv.pensionNetaAprox).toBeCloseTo(993.60, 2);
  });

  test('GOLDEN-CD: causante activo, BC media 1.200 €, 45 años con cargas → 70% pero se aplica el mínimo [sin contraste oficial]', () => {
    // BR = (24 × 1.200) / 28 = 1.028,57 €. Cargas + ingresos (500) < límite 70% (916) → 70%.
    // Pensión bruta = 1.028,57 × 70% = 720,00 €. Mínimo (con cargas, 2026) = 1.256,60 € → SE APLICA.
    // Las cargas familiares mandan sobre la edad (Anexo I del RD 241/2026).
    // Anual = 1.256,60 × 14 = 17.592,40 € → tramo retención 8% (15.000-22.000).
    // Neta = 1.256,60 × (1 − 0,08) = 1.156,07 €.
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
    expect(pv.pensionMinima).toBeCloseTo(1256.60, 2);
    expect(pv.pensionFinal).toBeCloseTo(1256.60, 2);
    expect(pv.pensionNetaAprox).toBeCloseTo(1156.07, 2);
  });

});

// ────────────────────────────────────────────────────────────────────────────
// CAPA 1 — Golden tests: calcularPrestacionMaternidadPaternidad
// Prestación por nacimiento/cuidado de menor (LGSS arts. 177-182, RDL 6/2019,
// ampliada por RDL 9/2025 — 19 semanas biparental / 32 monoparental).
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularPrestacionMaternidadPaternidad (Capa 1 · LGSS arts. 177-182 + RDL 9/2025)', () => {

  test('GOLDEN-CE: BC 2.400 €/mes, 1 hijo, ≥26 años, biparental → 19 semanas, prestación 100% BR [sin contraste oficial]', () => {
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

  test('GOLDEN-CF: BC 3.000 €/mes, parto múltiple (2 hijos) + discapacidad → +3 semanas adicionales [sin contraste oficial]', () => {
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

  test('GOLDEN-CG: BC 6.000 €/mes (supera base máxima) sin carencia → subsidio no contributivo de 600 €/mes [sin contraste oficial]', () => {
    // BR diaria sin tope = 6.000/30 = 200 €, limitada a la base máxima diaria 2026 = 5.101,20/30 = 170,04 €.
    // Sin carencia NO se cobra cero: nace el subsidio NO CONTRIBUTIVO del art. 182 LGSS, que son
    // 42 días naturales (6 semanas de descanso obligatorio) al 100% del IPREM, o la base reguladora
    // si fuera inferior. IPREM 2026 = 20 €/día → 600 €/mes y 20 × 42 = 840 € en total.
    //
    // Este assert es el candado del fix de 2026-08-13 (497842b7): hasta ese día el motor —y con él
    // el MCP que habla con ChatGPT y Claude— afirmaba que sin carencia no se cobra nada.
    const mp = calcularPrestacionMaternidadPaternidad({
      baseCotizacionMensual: 6000,
      edadProgenitor: 'mayor_26',
      numerosHijos: 1,
      cumpleCarencia: false,
    });
    expect(mp.baseReguladoraDiaria).toBeCloseTo(170.04, 2);
    expect(mp.limitadaPorBaseMaxima).toBe(true);
    expect(mp.baseReguladoraMensual).toBeCloseTo(5101.20, 2);
    expect(mp.cumpleCarencia).toBe(false);
    expect(mp.modalidad).toBe('no_contributiva');
    expect(mp.duracionTotalDias).toBe(42);
    expect(mp.cuantiaMensual).toBeCloseTo(600.00, 2);
    expect(mp.cuotaTotalPrestacion).toBeCloseTo(840.00, 2);
  });

  test('GOLDEN-CO: BC 3.000 €/mes, familia monoparental, 1 hijo → 32 semanas (RDL 9/2025) [sin contraste oficial]', () => {
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
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularExcedencia (Capa 1 · ET arts. 45-46)', () => {

  test('GOLDEN-CH: voluntaria, 3 años de antigüedad, 12 meses → cumple requisitos, sin cotización [sin contraste oficial]', () => {
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

  test('GOLDEN-CI: cuidado de hijo, 1.800 €/mes, 18 meses → reserva 12 meses, computan 18 meses SS [sin contraste oficial]', () => {
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

  test('GOLDEN-CJ: voluntaria con menos de 1 año de antigüedad → no cumple requisitos [sin contraste oficial]', () => {
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
// [sin contraste oficial]: valores calculados con la lógica propia de la
// calculadora, sin contraste contra el simulador oficial de la Seguridad Social.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Golden — calcularComplementoBrechaGenero (Capa 1 · art. 60 LGSS)', () => {

  test('GOLDEN-CL: jubilación, 2 hijos → complemento 73,80 €/mes (2 × 36,90 €) [sin contraste oficial]', () => {
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

  test('GOLDEN-CM: incapacidad permanente, 5 hijos → se computan máximo 4 hijos = 147,60 €/mes [sin contraste oficial]', () => {
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

  /**
   * Art. 60.4 LGSS: la jubilación parcial queda excluida expresamente, aunque sea
   * contributiva y sea jubilación. Hasta el 24/08/2026 el motor no contemplaba el caso y
   * devolvía «cumples los requisitos» con importe, mientras el FAQPage de la app declaraba
   * a los buscadores justo lo contrario (hallazgo 280 del Inspector).
   */
  test('GOLDEN-CN2: jubilación parcial → no procede, art. 60.4 LGSS [sin contraste oficial]', () => {
    const cb = calcularComplementoBrechaGenero({
      sexo: 'mujer',
      numHijos: 2,
      tipoPension: 'jubilacion_parcial',
    });
    expect(cb.tieneDerechoComplemento).toBe(false);
    expect(cb.complementoMensual).toBe(0);
    expect(cb.complementoAnual).toBe(0);
    expect(cb.motivo).toContain('60.4');
    // Y el paso siguiente tiene que decir lo que la ley sí permite
    expect(cb.pasoSiguiente).toContain('jubilación plena');
  });

  test('GOLDEN-CN: hecho causante anterior a 2021 → no procede el complemento [sin contraste oficial]', () => {
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

// ════════════════════════════════════════════════════════════════════════════
// PASADA DE VERIFICACIÓN DE MOTORES COMPARTIDOS — 09/09/2026
//
// Los nueve motores fiscales de riesgo 1 que estaban SIN TEST y expuestos por el MCP de
// Delegum o las API de ChatGPT. Acta completa, terreno y método: _private/inspector/MOTORES.md
//
// Por qué existió esta pasada: el Inspector cubre APPS, y un motor compartido solo se mira
// desde la app que lo llama. De los 43 motores sin test y expuestos, 41 NO los usa ninguna
// app — sus cifras solo las ve un LLM que se las recita a un usuario real. Y donde SÍ hay una
// app del mismo tema, resultó que lleva su PROPIA implementación inline en vez de llamar al
// motor: cada cálculo está escrito dos veces y solo se mira una.
//
// De ahí que la técnica que más rindió no fuera leer el motor, sino compararlo con la otra
// implementación del mismo cálculo que ya vivía en el repositorio.
//
// Los test.fail() marcan defectos ABIERTOS: afirman lo correcto sobre un motor sin reparar.
// Al repararlo se les quita la marca y quedan como regresión. Un test.fail() que pasa a verde
// NO es prueba de nada hasta comprobar que lo que afirma sigue siendo correcto.
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// SONDEO DE MOTORES 09/09/2026 — TANDA 1: las tres deducciones de IRPF que solo
// mira un LLM.
//
// Salen de la pasada de verificación de motores COMPARTIDOS abierta por los dos
// defectos de sucesiones del 09/09. El acta completa —terreno, método y los tres
// críticos con su impacto en euros— está en `_private/inspector/MOTORES.md`.
//
// Qué tienen en común los tres, y por qué el Inspector no podía verlo: sus actas
// cubren APPS, y NINGUNA app importa estos motores. `deduccionAutonomoIRPF` no
// tiene app siquiera; las de discapacidad y maternidad existen pero llevan su
// PROPIA implementación inline. Es decir, cada cálculo está escrito dos veces —una
// en el motor que lee el LLM y otra en la app que ve la persona— y solo se mira
// una. Los tres críticos son divergencias entre esas dos copias.
//
// Los `test.fail()` marcan defectos ABIERTOS: afirman lo correcto sobre un motor
// sin reparar. Al repararlo se les quita la marca y quedan como regresión.
// ────────────────────────────────────────────────────────────────────────────

/** Escala progresiva canónica del repo: lo que hace `calcularCuotaTramos` en lib/calculadoras/irpf.ts. */
function cuotaProgresivaIRPF(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    cuota += (Math.min(base, tramo.hasta) - anterior) * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return Math.round(cuota * 100) / 100;
}

test.describe('Motores 09/09 — deducción de autónomo IRPF (solo la lee /api/chatgpt/gastos-deducibles)', () => {
  test('CRÍTICO: la cuota sale de la ESCALA, no de marginal × base entera', () => {
    // El motor localiza el tramo de TRAMOS_IRPF_2025 y multiplica la base ENTERA por ese tipo
    // marginal (deduccionAutonomoIRPF.ts:258-268). Es el error de «mi tramo es el 37 %, luego
    // pago el 37 % de todo» — justo lo que la app `simulador-mito-tramo-superior` existe para
    // desmentir. Y la respuesta correcta ya estaba escrita al lado: `calcularCuotaTramos` de
    // lib/calculadoras/irpf.ts, que sí usa `calcularIRPF`. Misma firma que el caso del nieto:
    // la otra pieza del mismo repositorio sí lo hace bien.
    const res = calcularDeduccionAutonomoIRPF({
      modalidadEstimacion: 'simplificada',
      ingresosBrutos: 45000,
      cuotasSSAutonomo: 4200,
      gastosAsesoria: 900,
      otrosGastos: 1100,
    });
    // A mano: gastos 6.200 → previo 38.800 → difícil min(7 % × 38.800; 2.000) = 2.000
    //         → actividad 36.800 → tramo `hasta: 60000` → 37 %
    expect(res.rendimientoNetoActividad).toBe(36800);
    expect(res.tipoIRPFEstimado).toBe(37);
    // 12.450×19 % + 7.750×24 % + 15.000×30 % + 1.600×37 % = 9.317,50 €
    // Hoy devuelve 36.800 × 37 % = 13.616,00 € → +4.298,50 € (+46,1 %), y es cota INFERIOR:
    // tampoco resta el mínimo personal de MINIMOS_IRPF_2025.
    expect(res.cuotaIRPFEstimada).toBe(cuotaProgresivaIRPF(36800));
  });

  test('ALTO: ganar 1 € más nunca puede dejar menos neto (los 5 bordes de la escala)', () => {
    // Saltos de cuota por 1 € de rendimiento adicional: 12.450 → +622,74 € · 20.200 →
    // +1.212,30 € · 35.200 → +2.464,37 € · 60.000 → +4.800,45 € · 300.000 → +6.000,47 €.
    // Lo peligroso al citarlo un LLM: en el borde, «deduce 1 € más» aparenta ahorrar 622 €.
    const roturas: string[] = [];
    for (const borde of [12450, 20200, 35200, 60000, 300000]) {
      const a = calcularDeduccionAutonomoIRPF({ modalidadEstimacion: 'directa_normal', ingresosBrutos: borde });
      const b = calcularDeduccionAutonomoIRPF({ modalidadEstimacion: 'directa_normal', ingresosBrutos: borde + 1 });
      const netoA = a.rendimientoNetoActividad - a.cuotaIRPFEstimada;
      const netoB = b.rendimientoNetoActividad - b.cuotaIRPFEstimada;
      if (netoB < netoA) roturas.push(`${borde} €: neto ${netoA.toFixed(2)} → ${netoB.toFixed(2)}`);
    }
    expect(roturas, roturas.join(' | ')).toHaveLength(0);
  });

  test('ALTO: los suministros del hogar sin % de superficie no pueden desaparecer sin avisar', () => {
    // La guarda exige gasto Y porcentaje, así que sin el % no se crea línea NI advertencia:
    // los 3.000 € declarados no aparecen en ninguna parte del resultado. El motor gemelo del
    // mismo dominio, `calcularGastosDeduciblesAutonomo`, SÍ cubre este caso exacto.
    const res = calcularDeduccionAutonomoIRPF({
      modalidadEstimacion: 'simplificada',
      ingresosBrutos: 40000,
      gastosSupministrosHogar: 3000,
    });
    const rastro = res.gastos.some((g) => g.concepto.startsWith('Suministros')) ||
      res.advertencias.some((a) => /superficie|suministro/i.test(a));
    expect(rastro, 'ni línea ni advertencia sobre los 3.000 € declarados').toBe(true);
  });

  test('ALTO · CUADRE: ingreso publicado − gastos publicados = rendimiento previo publicado', () => {
    // El mismo defecto de redondeo que en sucesiones: `ingresosBrutos` se publica redondeado
    // pero `rendimientoNetoPrevio` se calcula con el valor EN CRUDO. 56 descuadres de 2.997
    // combinaciones (1,9 %). Muestra: 40.000,02 − 3.800,44 = 36.199,58 pero publica 36.199,57.
    let descuadres = 0;
    for (let mils = 1; mils <= 999; mils++) {
      for (const gasto of [4000, 3800.44, 1210.33]) {
        const res = calcularDeduccionAutonomoIRPF({
          modalidadEstimacion: 'directa_normal',
          ingresosBrutos: 40000 + mils / 1000,
          cuotasSSAutonomo: gasto,
        });
        const previo = Math.round((res.ingresosBrutos - res.totalGastosDeducibles) * 100) / 100;
        if (previo !== res.rendimientoNetoPrevio) descuadres++;
      }
    }
    expect(descuadres, 'el desglose publicado no cuadra consigo mismo').toBe(0);
  });

  test('CUADRE (sano): la suma de las líneas publicadas da el total, y previo − difícil = actividad', () => {
    // Candado permanente: este eje SÍ estaba bien y tiene que seguir estándolo.
    let n = 0;
    for (const modalidadEstimacion of ['simplificada', 'directa_normal'] as const) {
      for (let ingresosBrutos = 3000; ingresosBrutos <= 400000; ingresosBrutos += 9173) {
        const res = calcularDeduccionAutonomoIRPF({
          modalidadEstimacion, ingresosBrutos,
          cuotasSSAutonomo: 3800.44, gastosAsesoria: 1210.33, gastosSeguros: 640.77, otrosGastos: 933.19,
        });
        const suma = Math.round(res.gastos.reduce((s, g) => s + g.importeDeducible, 0) * 100) / 100;
        expect(suma, `suma ${ingresosBrutos}`).toBe(res.totalGastosDeducibles);
        const act = Math.round((res.rendimientoNetoPrevio - res.deduccionDificilJustificacion) * 100) / 100;
        expect(act, `actividad ${ingresosBrutos}`).toBe(res.rendimientoNetoActividad);
        n++;
      }
    }
    expect(n).toBeGreaterThan(80);
  });

  test('DERIVA: la escala copiada dentro del motor sigue coincidiendo con TRAMOS_IRPF_2025', () => {
    // El motor no importa nada de data/fiscal: reescribe la escala como una escalera de `if`
    // pese a que TRAMOS_IRPF_2025 está sellada contra el BOE. Este candado no deshace la
    // duplicación, pero avisa el día que data/fiscal cambie y el motor se quede atrás.
    for (const tramo of TRAMOS_IRPF_2025) {
      const base = tramo.hasta === Infinity ? 500000 : tramo.hasta;
      const res = calcularDeduccionAutonomoIRPF({ modalidadEstimacion: 'directa_normal', ingresosBrutos: base });
      expect(res.tipoIRPFEstimado, `borde ${tramo.hasta}`).toBe(tramo.tipo);
    }
  });
});

test.describe('Motores 09/09 — mínimo por discapacidad IRPF (tool del MCP de Delegum)', () => {
  test('CRÍTICO: el grado ≥65 % suma los 3.000 € de asistencia AUNQUE no se marque la casilla', () => {
    // El art. 60 LIRPF concede el aumento de 3.000 € ante CUALQUIERA de tres supuestos
    // ALTERNATIVOS: acreditar ayuda de terceras personas, acreditar movilidad reducida, «o un
    // grado de discapacidad igual o superior al 65 por 100». El motor solo recoge los dos
    // primeros, así que con grado '65oMas' y la casilla sin marcar da 9.000 € donde
    // corresponden 12.000 €.
    //
    // La pista fue la misma que con el nieto: incoherencia interna. El ejemplo resuelto «Madre
    // con discapacidad del 70 %» de app/estimacion-deduccion-discapacidad/page.tsx publica
    // 9.000 + 3.000 = 12.000 € y 4.440 €/año SIN mencionar ayuda de terceros, mientras el
    // ejemplo hermano (hija al 50 %) sí especifica «movilidad reducida» para justificarlos.
    // La calculadora de esa misma página contradice a su propio ejemplo resuelto.
    //
    // ⚠️ La reparación NO es solo del motor: la regla incompleta está también en la copia
    // inline de la app, en la `nota` de data/fiscal/dependencia.ts, en la descripción de la
    // tool del MCP y en tres FAQ de JSON-LD. Corregir el número sin corregir los textos deja
    // al LLM explicando mal la norma aunque devuelva bien la cifra.
    const r = calcularDeduccionDiscapacidadIRPF({
      titular: 'ascendiente', grado: '65oMas', necesitaAsistencia: false,
    });
    expect(r.gastosAsistencia).toBe(3000);
    expect(r.totalMinimo).toBe(12000);                              // hoy: 9.000
    // 12/09/2026: el ahorro dejó de ser `total × marginal`. Art. 63.1.2º LIRPF — el mínimo se
    // grava a tipo cero, así que vale lo que la escala le aplica encima del mínimo personal:
    // escala(5.550 + 12.000) − escala(5.550) = 6.900 × 19 % + 5.100 × 24 % = 2.535 €.
    expect(Math.round(r.ahorroEstimado * 100) / 100).toBe(2535);
  });

  test('la rama que SÍ funciona hoy: con la casilla marcada salen los 12.000 €', () => {
    // Candado de que la reparación no rompa el camino correcto ni sume los 3.000 € dos veces.
    for (const titular of ['contribuyente', 'ascendiente', 'descendiente'] as const) {
      const r = calcularDeduccionDiscapacidadIRPF({
        titular, grado: '65oMas', necesitaAsistencia: true,
      });
      expect(r.totalMinimo, titular).toBe(12000);
      expect(Math.round(r.ahorroEstimado * 100) / 100, titular).toBe(2535);
    }
  });

  test('el grado 33-64 % SIN acreditar asistencia se queda en 3.000 €, que es lo correcto', () => {
    // El otro extremo: aquí la casilla sí es condición necesaria. Si la reparación regalara
    // los 3.000 € a todo el mundo, este test lo cazaría.
    const sin = calcularDeduccionDiscapacidadIRPF({
      titular: 'contribuyente', grado: '33a65', necesitaAsistencia: false,
    });
    expect(sin.totalMinimo).toBe(3000);
    // 5.550 + 3.000 = 8.550, todo dentro del primer tramo: 3.000 × 19 % = 570 €.
    expect(Math.round(sin.ahorroEstimado * 100) / 100).toBe(570);
    const con = calcularDeduccionDiscapacidadIRPF({
      titular: 'contribuyente', grado: '33a65', necesitaAsistencia: true,
    });
    expect(con.totalMinimo).toBe(6000);
  });

  test('CUADRE: mínimo + gastos = total, y el ahorro sale de la escala (18 combinaciones)', () => {
    // El barrido de 7.218 casos recorría el tipo marginal de 0 a 100 en pasos de 0,25. Ese eje
    // desapareció el 12/09/2026 con el propio parámetro: el art. 63.1.2º grava el mínimo a tipo
    // cero, de modo que el ahorro NO depende del marginal de quien declara. Lo que queda es el
    // barrido exhaustivo de las 18 combinaciones reales, contrastado contra la escala.
    const MINIMO_PERSONAL = 5550;
    let n = 0;
    for (const titular of ['contribuyente', 'ascendiente', 'descendiente'] as const) {
      for (const grado of ['33a65', '65oMas'] as const) {
        for (const asistencia of [false, true, undefined]) {
          const r = calcularDeduccionDiscapacidadIRPF({
            titular, grado, necesitaAsistencia: asistencia,
          });
          const dos = (x: number) => Math.round(x * 100) / 100;
          const etq = `${titular}/${grado}/${String(asistencia)}`;
          expect(dos(r.minimoDiscapacidad) + dos(r.gastosAsistencia), etq).toBe(dos(r.totalMinimo));
          const esperado = dos(
            cuotaEscalaGeneral(MINIMO_PERSONAL + r.totalMinimo) - cuotaEscalaGeneral(MINIMO_PERSONAL)
          );
          expect(dos(r.ahorroEstimado), etq).toBe(esperado);
          // Y el tipo efectivo nunca puede alcanzar los tipos altos de la escala: el mínimo
          // cae siempre en los primeros tramos, esté donde esté la renta del contribuyente.
          expect(r.tipoEfectivoAhorro, etq).toBeLessThanOrEqual(24);
          n++;
        }
      }
    }
    expect(n).toBe(18);
  });

  test('CLAVES: ninguna de las 18 combinaciones declaradas se cae en un 0 o un undefined', () => {
    // Barrido EXHAUSTIVO de los dos tipos unión (3 × 2 × 3), no muestreo.
    for (const titular of ['contribuyente', 'ascendiente', 'descendiente'] as const) {
      const bloque = titular === 'contribuyente'
        ? DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente
        : DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar;
      for (const grado of ['33a65', '65oMas'] as const) {
        for (const asistencia of [false, true, undefined]) {
          const r = calcularDeduccionDiscapacidadIRPF({
            titular, grado, necesitaAsistencia: asistencia,
          });
          const etq = `${titular}/${grado}/${String(asistencia)}`;
          expect(r.minimoDiscapacidad, etq).toBe(
            grado === '33a65' ? bloque.discapacidad33a65 : bloque.discapacidad65oMas
          );
          expect(r.minimoDiscapacidad, etq).toBeGreaterThan(0);
          expect(Number.isNaN(r.totalMinimo), etq).toBe(false);
        }
      }
    }
  });

  test('CRUCE: los dos módulos fiscales que declaran el mínimo no divergen', () => {
    // dependencia.ts e irpf.ts sostienen la misma cifra desde sitios distintos. Si una revisión
    // fiscal toca solo uno, este test lo dice antes que el usuario.
    expect(DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente.discapacidad33a65).toBe(MINIMOS_IRPF_2025.discapacidad_33_65);
    expect(DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente.discapacidad65oMas).toBe(MINIMOS_IRPF_2025.discapacidad_65_mas);
    expect(DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar.discapacidad33a65).toBe(MINIMOS_IRPF_2025.discapacidad_33_65);
    expect(DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar.discapacidad65oMas).toBe(MINIMOS_IRPF_2025.discapacidad_65_mas);
  });
});

test.describe('Motores 09/09 — deducción por maternidad IRPF (tool del MCP de Delegum)', () => {
  const BASE = DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo;                             // 1.200
  const MENSUAL = DEDUCCION_MATERNIDAD_IRPF.importeMensualPorHijo;                        // 100
  const MAX_GUARDERIA = DEDUCCION_MATERNIDAD_IRPF.incrementoGuarderia.importeMaximoAnual; // 1.000
  const EXTRA_ALTA_POSTERIOR = DEDUCCION_MATERNIDAD_IRPF.incrementoAltaPosterior.importe; // 150

  test('CRÍTICO: sin ninguna de las 3 vías del art. 81.1 la deducción es 0 €, no 1.200 €', () => {
    // data/fiscal/maternidad.ts declara `situacionesConDerecho` como TRES vías ALTERNATIVAS
    // —alta en SS/mutualidad, prestación o subsidio de desempleo al nacer el menor, o alta
    // posterior con 30 días cotizados— y todas exigen alguna relación con el sistema.
    //
    // El motor colapsa las cuatro situaciones en un BOOLEANO, y con `false` no deniega el
    // derecho: pone el límite por cotizaciones a `Infinity` y paga el máximo. La falta de
    // derecho se convierte en AUSENCIA DE LÍMITE.
    //
    // Agravante: emite además una advertencia —que el MCP imprime literalmente— afirmando que
    // la deducción aplica «aunque la madre no este trabajando ni perciba prestaciones»,
    // contradiciendo a su propio módulo fiscal, que describe la reforma de 2023 como
    // ampliación de las VÍAS DE ACCESO, no su supresión.
    const r = calcularDeduccionMaternidadIRPF({
      hijos: [{ edadMesesInicioEjercicio: 12, mesesConDerechoEjercicio: 12 }],
      cotizacionesSSTotalesAnio: 0,
      madreEnActivoOPrestacion: false,
    });
    expect(r.totalDeduccionEfectiva).toBe(0); // hoy: 1.200 € por hijo
  });

  test('ALTO: la vía «alta-posterior» del art. 81.3 y sus 150 € ya son alcanzables', () => {
    // REPARADO 09/09/2026. `data/fiscal` declara `incrementoAltaPosterior.importe = 150` atada a
    // la tercera vía de acceso, pero el motor colapsaba las cuatro situaciones en un BOOLEANO:
    // con dos estados para tres vías, ninguna rama alcanzaba «alta-posterior» y esos 150 € no se
    // pagaban NUNCA. Era el defecto del nieto en otra forma: una clave declarada en data/fiscal
    // que ningún camino del código podía tocar.
    //
    // La reparación adopta el tipo unión que ya usaba la app hermana
    // ('alta' | 'desempleo' | 'alta-posterior' | 'ninguna'), conservando el booleano antiguo
    // como parámetro obsoleto para no romper a quien lo pase.
    expect(DEDUCCION_MATERNIDAD_IRPF.situacionesConDerecho.map((s) => s.id))
      .toEqual(['alta', 'desempleo', 'alta-posterior']);

    const porVia = calcularDeduccionMaternidadIRPF({
      hijos: [{ edadMesesInicioEjercicio: 2, mesesConDerechoEjercicio: 12 }],
      cotizacionesSSTotalesAnio: 5000,
      situacion: 'alta-posterior',
    });
    expect(porVia.totalDeduccionEfectiva).toBe(BASE + EXTRA_ALTA_POSTERIOR); // 1.350 €

    // Y por la vía ordinaria siguen siendo 1.200 €: el incremento es de la tercera vía, no de todas.
    const ordinaria = calcularDeduccionMaternidadIRPF({
      hijos: [{ edadMesesInicioEjercicio: 2, mesesConDerechoEjercicio: 12 }],
      cotizacionesSSTotalesAnio: 5000,
      situacion: 'alta',
    });
    expect(ordinaria.totalDeduccionEfectiva).toBe(BASE);
  });

  test('ALTO · CUADRE: Σ detalleHijos.totalDeduccionHijo = totalDeduccionEfectiva', () => {
    // Las líneas por hijo publican la deducción BRUTA (meses × 100) y el total publica la
    // EFECTIVA, ya recortada por el límite de cotizaciones, así que el desglose no cuadra
    // consigo mismo en cuanto el límite muerde. Es el defecto (b) de sucesiones, pero de
    // céntimos a MILES de euros: 223 descuadres de 432 combinaciones, hasta 4.800 €.
    const fallos: string[] = [];
    let comprobados = 0;
    for (const numHijos of [1, 2, 3, 4]) {
      for (const meses of [1, 5, 12]) {
        for (const gasto of [0, 250, 400, 1000, 1500, 3000]) {
          for (const cotiz of [0, 500, 800, 1234.56, 5000, 20000]) {
            const r = calcularDeduccionMaternidadIRPF({
              hijos: Array.from({ length: numHijos }, (_, i) => ({
                edadMesesInicioEjercicio: i * 6,
                mesesConDerechoEjercicio: meses,
                gastosGuarderiaAnuales: gasto,
              })),
              cotizacionesSSTotalesAnio: cotiz,
              madreEnActivoOPrestacion: true,
            });
            const suma = Math.round(r.detalleHijos.reduce((s, d) => s + d.totalDeduccionHijo, 0) * 100) / 100;
            comprobados++;
            if (suma !== r.totalDeduccionEfectiva) {
              fallos.push(`${numHijos}h/${meses}m/gasto ${gasto}/cotiz ${cotiz}: Σ ${suma} ≠ ${r.totalDeduccionEfectiva}`);
            }
          }
        }
      }
    }
    expect(comprobados).toBeGreaterThan(400);
    expect(fallos.length, fallos.slice(0, 3).join(' | ')).toBe(0); // hoy: 223 de 432
  });

  test('ALTO · CUADRE: el reparto del incremento de guardería pierde un céntimo con 3 hijos', () => {
    // 1.000 € / 3 = 333,333… → cada línea se publica a 333,33 y suman 999,99 frente al 1.000 €
    // publicado como total. Exactamente el céntimo de sucesiones: se publica redondeado lo que
    // se reparte sin redondear.
    const r = calcularDeduccionMaternidadIRPF({
      hijos: [0, 6, 12].map((e) => ({
        edadMesesInicioEjercicio: e, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: 1000,
      })),
      cotizacionesSSTotalesAnio: 5000,
      madreEnActivoOPrestacion: true,
    });
    const suma = Math.round(r.detalleHijos.reduce((s, d) => s + d.incrementoGuarderia, 0) * 100) / 100;
    expect(suma).toBe(r.incrementoGuarderiaEfectivo); // hoy: 999,99 vs 1.000
  });

  test('RESUELTO: el tope de 1.000 € de guardería es POR HIJO, no del conjunto', () => {
    // Esta mañana quedó como DIVERGENCIA sin veredicto: el motor topaba el agregado y la app
    // `estimacion-deduccion-maternidad` lo aplicaba por hijo, y el repositorio no podía decir
    // cuál era la correcta. Se consultó a la AEAT en la misma sesión (Manual práctico Renta
    // 2025, «Límites de la deducción») y el texto es literal:
    //   «El incremento de la deducción POR CADA HIJO que otorgue derecho a la misma no podrá
    //    superar PARA CADA HIJO ninguno de los dos límites», siendo los dos (a) 1.000 € anuales
    //    y (b) el gasto efectivo no subvencionado satisfecho en relación con ESE hijo.
    // Gana la app: el motor cobraba 1.000 € de menos por cada hijo a partir del primero.
    //
    // ⚠️ Lo que NO se pudo anclar y sigue tal cual: si el incremento está además limitado por
    // las cotizaciones. El motor conserva ese tope sobre el agregado, con un comentario que
    // apunta a /triaje-fiscal.
    const r = calcularDeduccionMaternidadIRPF({
      hijos: [
        { edadMesesInicioEjercicio: 6, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: 1500 },
        { edadMesesInicioEjercicio: 20, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: 1500 },
      ],
      cotizacionesSSTotalesAnio: 5000,
      situacion: 'alta',
    });
    expect(r.incrementoGuarderiaEfectivo).toBe(2 * MAX_GUARDERIA);
    expect(r.totalDeduccionEfectiva).toBe(4400);
  });

  test('lo que el motor SÍ hace bien: prorrateo de 100 €/mes, tope de 12 meses y corte a los 3 años', () => {
    // Candado permanente de los ejes sanos.
    for (let m = 0; m <= 12; m++) {
      const r = calcularDeduccionMaternidadIRPF({
        hijos: [{ edadMesesInicioEjercicio: 4, mesesConDerechoEjercicio: m }], cotizacionesSSTotalesAnio: 99999,
      });
      expect(r.deduccionMaternidadEfectiva, `${m} meses`).toBe(m * MENSUAL);
    }
    const trece = calcularDeduccionMaternidadIRPF({
      hijos: [{ edadMesesInicioEjercicio: 4, mesesConDerechoEjercicio: 13 }], cotizacionesSSTotalesAnio: 99999,
    });
    expect(trece.deduccionMaternidadEfectiva).toBe(BASE);

    const corte = calcularDeduccionMaternidadIRPF({
      hijos: [
        { edadMesesInicioEjercicio: 36, mesesConDerechoEjercicio: 12 },
        { edadMesesInicioEjercicio: 35, mesesConDerechoEjercicio: 12 },
      ],
      cotizacionesSSTotalesAnio: 99999,
    });
    expect(corte.numHijosConDerecho).toBe(1);
    expect(corte.deduccionMaternidadEfectiva).toBe(BASE);
  });

  test('DERIVA: las constantes hardcodeadas del motor siguen coincidiendo con data/fiscal', () => {
    // El motor hardcodea 1.200 / 100 / 1.000 en vez de importarlas, contra la regla del
    // CLAUDE.md. Hoy coinciden; esto fija que sigan coincidiendo si el módulo cambia — que es
    // por donde las dos implementaciones pudieron divergir en primer lugar.
    const anual = calcularDeduccionMaternidadIRPF({
      hijos: [{ edadMesesInicioEjercicio: 0, mesesConDerechoEjercicio: 12 }], cotizacionesSSTotalesAnio: 99999,
    });
    expect(anual.deduccionMaternidadEfectiva).toBe(BASE);
    const guarderia = calcularDeduccionMaternidadIRPF({
      hijos: [{ edadMesesInicioEjercicio: 0, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: 99999 }],
      cotizacionesSSTotalesAnio: 99999,
    });
    expect(guarderia.incrementoGuarderiaEfectivo).toBe(MAX_GUARDERIA);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SONDEO DE MOTORES 09/09/2026 — TANDA 2: plusvalía municipal, patrimonio y divorcio.
// Acta completa en `_private/inspector/MOTORES.md`.
// ────────────────────────────────────────────────────────────────────────────

/** Coeficiente oficial sellado en data/fiscal, con el clamp que aplican la app y ventaInmueble. */
function coefOficialIIVTNU(anios: number): number {
  const clamp = Math.min(Math.max(0, Math.floor(anios)), 20);
  const e = COEFICIENTES_IIVTNU_2025.find((c) => c.anios === clamp);
  if (!e) throw new Error(`data/fiscal no declara coeficiente para ${anios} años`);
  return e.coeficiente;
}

test.describe('Motores 09/09 — IIVTNU: el motor llevaba su PROPIA tabla de coeficientes', () => {
  // `lib/calculadoras/iivtnuPlusvaliaMunicipal.ts` hardcodea `COEFICIENTES_MAXIMOS` citando en su
  // cabecera «RDL 26/2021 — verificado 2025-01-15»: exactamente la misma fuente y la misma fecha de
  // sellado que `COEFICIENTES_IIVTNU_2025` de `data/fiscal/inmuebles.ts`, con la que NO coincide en
  // 20 de los 21 tramos. La tabla de data/fiscal tiene la forma de U del RDL (0,14 al inicio →
  // mínimo 0,08 en los años 10-13 → 0,45 a los 20); la del motor es casi plana.
  //
  // Siete consumidores usan la tabla sellada —la app `estimador-plusvalia-municipal`, la ficha de
  // `delegum/datos-fiscales/plusvalia-municipal`, `ventaInmueble.ts`, `compraventa.ts`…— y SOLO este
  // motor usa la suya, que es justo el que alimenta /api/chatgpt/plusvalia-municipal y el MCP.
  // meskeIA publicaba dos plusvalías distintas del mismo inmueble según se preguntara por la web
  // o por un LLM.
  //
  // No lo levantó el Inspector, y no es un fallo suyo: la app aquí está BIEN. Es el motor
  // compartido, que ninguna app llama, el que diverge.

  test('CRÍTICO: 10 años de tenencia aplican el coeficiente 0,08 de data/fiscal, no el 0,22 propio', () => {
    // Objetivo (data/fiscal, 10 años → 0,08): 40.000 × 0,08 = 3.200 → 25 % = 800,00 €
    // Real: (200.000 − 150.000) × (40.000/100.000) = 20.000 → 25 % = 5.000,00 €
    // El contribuyente elige el menor → 800,00 €. El motor cobra 2.200,00 € (+1.400,00 €).
    const res = calcularIIVTNU({
      valorCatastralSuelo: 40000, valorCatastralTotal: 100000, aniosTenencia: 10,
      tipoImpositivo: 25, precioAdquisicion: 150000, precioTransmision: 200000,
    });
    expect(res.coeficienteAplicado).toBe(0.08);
    expect(res.cuotaIIVTNU).toBe(800);
  });

  test('CRÍTICO: 20 años exactos son «20 o más años» → coeficiente 0,45', () => {
    // data/fiscal declara `{ anios: 20, label: '20 o más años', coeficiente: 0.45 }`, y la propia
    // cabecera del motor dice «>20 usa valor especial»: el tramo se rompe justo en el borde.
    // 60.000 × 0,45 = 27.000 → 30 % = 8.100,00 €. El motor liquida 5.400,00 € (−2.700,00 €).
    const res = calcularIIVTNU({
      valorCatastralSuelo: 60000, valorCatastralTotal: 120000, aniosTenencia: 20, tipoImpositivo: 30,
    });
    expect(res.coeficienteAplicado).toBe(0.45);
    expect(res.cuotaIIVTNU).toBe(8100);
  });

  test('CRÍTICO · NINGUNA CLAVE SE CAE: los años con decimales no pueden ir al coeficiente máximo', () => {
    // ES EL BUG DEL NIETO EN SU FORMA EXACTA. El motor indexa `COEFICIENTES_MAXIMOS[anios]` sin
    // `Math.floor` —la app, `ventaInmueble` y `compraventa` sí lo hacen—, así que
    // `COEFICIENTES_MAXIMOS[7.5]` es undefined y el `?? COEFICIENTE_MAS_20_ANIOS` lo manda al 0,45,
    // el MÁXIMO de la escala. Con el agravante de que aquí el fallback no es 0 (que perjudicaría a
    // Hacienda) sino el máximo, que perjudica al contribuyente.
    //
    // «Siete años y medio» es la forma natural de decírselo a un LLM, y
    // /api/chatgpt/plusvalia-municipal acepta cualquier `number` ≥ 0.
    // 50.000 × 0,12 (año 7) = 6.000 → 25 % = 1.500,00 €. El motor cobra 5.625,00 € (+4.125,00 €).
    const medio = calcularIIVTNU({
      valorCatastralSuelo: 50000, valorCatastralTotal: 100000, aniosTenencia: 7.5, tipoImpositivo: 25,
    });
    expect(medio.coeficienteAplicado).toBe(0.12);
    expect(medio.cuotaIIVTNU).toBe(1500);

    // Y medio año NO entra por la rama de «menos de 1 año»: `anios === 0` solo casa con el 0 exacto.
    const seisMeses = calcularIIVTNU({
      valorCatastralSuelo: 50000, valorCatastralTotal: 100000, aniosTenencia: 0.5, tipoImpositivo: 25,
    });
    expect(seisMeses.coeficienteAplicado).toBe(0.14);
    expect(seisMeses.cuotaIIVTNU).toBe(1750);
  });

  test('BARRIDO: todo año de 0 a 40, entero o con decimales, da el coeficiente de data/fiscal', () => {
    const fallos: string[] = [];
    for (let x = 0; x <= 400; x++) {
      const anios = x / 10;
      const res = calcularIIVTNU({
        valorCatastralSuelo: 100000, valorCatastralTotal: 200000, aniosTenencia: anios, tipoImpositivo: 30,
      });
      const esperado = coefOficialIIVTNU(anios);
      if (res.coeficienteAplicado !== esperado) {
        fallos.push(`${anios}a: motor ${res.coeficienteAplicado} != data/fiscal ${esperado}`);
      }
    }
    expect(fallos.length, `${fallos.length} tenencias con coeficiente distinto al sellado`).toBe(0);
  });

  test('COHERENCIA: calcularIIVTNU y calcularVentaInmueble dan la MISMA plusvalía del mismo piso', () => {
    // Las dos son tools del MCP y responden por la misma plusvalía. `ventaInmueble` importa
    // data/fiscal; el motor de IIVTNU no. Y `comparacionDonacionHerencia.ts:198` llama a
    // `calcularIIVTNU`, así que comparar donación con herencia arrastra la tabla mala mientras
    // vender el mismo piso arrastra la buena — dentro del mismo servidor MCP.
    for (const anios of [1, 7, 10, 15, 19, 20]) {
      const motor = calcularIIVTNU({
        valorCatastralSuelo: 45000, valorCatastralTotal: 150000, aniosTenencia: anios, tipoImpositivo: 25,
      });
      const venta = calcularVentaInmueble({
        precioVenta: 300000, precioCompra: 200000, aniosTenencia: anios,
        valorCatastralSuelo: 45000, valorCatastralTotal: 150000, tipoMunicipalIIVTNU: 25,
      });
      expect(motor.cuotaIIVTNU, `${anios} años`).toBe(venta.plusvaliaMunicipal);
    }
  });

  test('ALTO: sin precios de compra y venta, el motor NO puede afirmar que hay incremento de valor', () => {
    // `hayIncrementoReal` nace en `true` y solo se desmiente si llegan AMBOS precios. El campo
    // está documentado como «¿Hay incremento real de valor? (si no, no se tributa)»: es la no
    // sujeción del art. 104.5 TRLHL. Devolverlo en `true` sin haber visto un precio le da a un LLM
    // una afirmación jurídica que nadie ha comprobado, justo en el caso —vender con pérdida— en
    // que el usuario podría no deber nada.
    const res = calcularIIVTNU({
      valorCatastralSuelo: 40000, valorCatastralTotal: 100000, aniosTenencia: 10, tipoImpositivo: 25,
    });
    expect(res.incrementoRealValor).toBeNull();
    expect(res.hayIncrementoReal).toBe(false);
  });

  // ── Lo que SÍ está sano en este motor, como candado permanente ────────────

  test('RECHAZOS (sano): el motor no calcula sobre entradas imposibles', () => {
    expect(() => calcularIIVTNU({ valorCatastralSuelo: 0, valorCatastralTotal: 100000, aniosTenencia: 5 })).toThrow();
    expect(() => calcularIIVTNU({ valorCatastralSuelo: 80000, valorCatastralTotal: 50000, aniosTenencia: 5 })).toThrow();
    expect(() => calcularIIVTNU({ valorCatastralSuelo: 40000, valorCatastralTotal: 100000, aniosTenencia: -1 })).toThrow();
  });

  test('NO SUJECIÓN (sano, art. 104.5 TRLHL / STC 182/2021): sin incremento no se tributa', () => {
    for (const [compra, venta] of [[200000, 180000], [200000, 200000]]) {
      const res = calcularIIVTNU({
        valorCatastralSuelo: 40000, valorCatastralTotal: 100000, aniosTenencia: 10,
        tipoImpositivo: 25, precioAdquisicion: compra, precioTransmision: venta,
      });
      expect(res.hayIncrementoReal, `${compra}->${venta}`).toBe(false);
      expect(res.metodoAplicable).toBe('ninguno_sin_incremento');
      expect(res.cuotaIIVTNU).toBe(0);
    }
  });

  test('CUADRE (sano): el desglose sale con las cifras publicadas y gana siempre el método menor', () => {
    // 1.664 combinaciones. La mecánica del doble método está bien: el daño está entero en la
    // tabla de entrada. Se admite 1 céntimo SOLO en las cuotas, por el medio céntimo exacto de la
    // coma flotante de JS (16.834,95 × 30 % = 5.050,485 → Math.round da 5.050,48).
    let comprobados = 0;
    const fallos: string[] = [];
    const cerca = (a: number, b: number) => Math.abs(a - b) <= 0.011;
    for (let anios = 0; anios <= 25; anios++) {
      for (const vcSuelo of [1000, 37411, 82345.67, 250000]) {
        for (const tipo of [5, 12.5, 25, 30]) {
          for (const [pa, pt] of [[0, 0], [120000, 200000], [200000, 180000], [95000, 95500]]) {
            const usaReal = pa > 0;
            const res = calcularIIVTNU({
              valorCatastralSuelo: vcSuelo, valorCatastralTotal: vcSuelo * 2.5,
              aniosTenencia: anios, tipoImpositivo: tipo,
              precioAdquisicion: usaReal ? pa : undefined,
              precioTransmision: usaReal ? pt : undefined,
            });
            const id = `${anios}a/${vcSuelo}/${tipo}%`;
            if (Math.round(vcSuelo * res.coeficienteAplicado * 100) / 100 !== res.baseImponibleObjetivo) fallos.push(`baseObj ${id}`);
            if (!cerca(res.baseImponibleObjetivo * res.tipoImpositivoAplicado / 100, res.cuotaMetodoObjetivo)) fallos.push(`cuotaObj ${id}`);
            if (res.hayIncrementoReal && res.cuotaMetodoReal !== null
              && res.cuotaIIVTNU !== Math.min(res.cuotaMetodoReal, res.cuotaMetodoObjetivo)) fallos.push(`nomenor ${id}`);
            comprobados++;
          }
        }
      }
    }
    expect(fallos, `${fallos.length} descuadres`).toEqual([]);
    expect(comprobados).toBeGreaterThan(1600);
  });
});

test.describe('Motores 09/09 — impuesto sobre el patrimonio (la escala SÍ escalona)', () => {
  // Lo que se buscaba primero —el defecto de `deduccionAutonomoIRPF`, marginal × base entera— NO
  // está aquí: `calcularCuotaPatrimonioEstatal` recorre los 8 tramos igual que `calcularCuotaTramos`
  // de irpf.ts, y las 6 escalas autonómicas están transcritas al céntimo (salto máximo en cualquier
  // frontera de tramo de las 15 CCAA de régimen común: 0,00953 €, que es el redondeo con que el BOE
  // publica las cuotas acumuladas). El motor no hardcodea ni un tipo ni un mínimo.

  test('GOLDEN (sano): Canarias, escala estatal, cuota 732,87 € resuelta a mano', () => {
    // VH computable 100.000 (exención 300.000) · bruto 1.400.000 · base 1.000.000
    // · mínimo exento 700.000 · liquidable 300.000
    // → 167.129,45 × 0,2 % + 132.870,55 × 0,3 % = 732,87 €
    // Con «marginal × base entera» habría dado 900,00 €.
    const r = calcularImpuestoPatrimonio({
      ccaaId: 'canarias', viviendaHabitual: 400000, otrosInmuebles: 250000,
      cuentasDepositos: 200000, accionesFondos: 500000, otrosBienes: 50000, deudas: 100000,
    });
    expect(r.cuotaBruta).toBe(732.87);
  });

  test('ALTO: con bonificación del 100 % y ≤ 2 M € brutos NO hay obligación de declarar', () => {
    // Art. 37 Ley 19/1991: se declara cuando la cuota, «una vez aplicadas las deducciones o
    // bonificaciones que procedieren, resulte a ingresar», o cuando los bienes brutos superan
    // 2.000.000 €. El motor sustituye lo primero por `baseImponible > minimoExento`, que es la
    // cuota ANTES de bonificar, y el resultado se contradice a sí mismo: publica a la vez
    // cuotaNeta 0, bonificación 100 % y obligadoDeclarar true.
    //
    // Afecta a 7 de las 17 CCAA (Andalucía, Cantabria, Castilla y León, Extremadura, La Rioja,
    // Madrid, Murcia). Impacto: 0 € de cuota mal calculada — solo yerra hacia el lado conservador,
    // y por eso es ALTO y no CRÍTICO. La frase correcta ya estaba escrita en la FAQ de
    // app/orientador-impuesto-patrimonio/page.tsx:505.
    const r = calcularImpuestoPatrimonio({ ccaaId: 'madrid', cuentasDepositos: 1500000 });
    expect(r.cuotaNeta).toBe(0);
    expect(r.obligadoDeclarar).toBe(false);
  });

  test('ALTO · CUADRE: cuota neta publicada = cuota bruta publicada − bonificación publicada', () => {
    // El mismo defecto 2 de sucesiones: se publica `cuotaBruta` redondeada pero `cuotaNeta` se
    // calcula sobre la NO redondeada. Solo se ve en Galicia, única CCAA con bonificación parcial
    // (50 %) — con 0 % y con 100 % la resta cuadra por construcción. Descuadra el 25 % de los
    // casos, siempre por 1 céntimo, y llega a pantalla: la route imprime las tres líneas a dos
    // decimales, así que 1 de cada 4 respuestas de Galicia muestra una resta que no es una resta.
    const r = calcularImpuestoPatrimonio({ ccaaId: 'galicia', cuentasDepositos: 1500000 });
    const dos = (x: number) => Math.round(x * 100) / 100;
    const bruta = r.cuotaBruta ?? 0;
    const neta = r.cuotaNeta ?? 0;
    // La bonificación publicada es la diferencia entre las dos líneas que se imprimen.
    expect(dos(bruta - (bruta - neta))).toBe(dos(neta));
    expect(neta).toBe(1845.19); // publica 1.845,18
  });

  test('RECHAZO (sano): una CCAA no reconocida lanza, en vez de caer a un mínimo por defecto', () => {
    // Importa porque `getMinimoExentoPatrimonio()` sí tiene fallback silencioso a 700.000 €.
    expect(() => calcularImpuestoPatrimonio({ ccaaId: 'comunidad_valenciana', cuentasDepositos: 1000000 })).toThrow();
    expect(() => calcularImpuestoPatrimonio({ ccaaId: 'ceuta', cuentasDepositos: 1000000 })).toThrow();
  });
});

test.describe('Motores 09/09 — divorcio: el cálculo está bien, falta el VALIDADOR', () => {
  // El cabecero del motor lo anunciaba sin saberlo: «Réplica server-side de la lógica inline de
  // app/impuestos-divorcio/page.tsx. TODO: unificar». Se replicaron las tres funciones de cálculo
  // —numéricamente equivalentes a las de la app— pero NO su `pasoValido()`, que es donde la app
  // guarda sus cinco condiciones de completitud. Lo que la app impide, el motor lo resuelve solo:
  // unas veces callando, otras eligiendo el resultado desfavorable, nunca con un rechazo.

  test('GOLDEN (sano): la pensión compensatoria sale al céntimo por los dos lados', () => {
    // A mano contra data/fiscal/irpf.ts (sellado 2026-08-12):
    //   rnt = 45.000 − 2.000 = 43.000 ≥ 16.825 → reducción art. 20 = 2.364 → base 40.636
    //   cuota(40.636) = 10.736,82 · cuota(34.636) = 8.556,30 → ahorro 2.180,52 €
    // ⚠️ RECALCULADO EL 09/09/2026. Antes el pagador ahorraba 2.180,52 € y el perceptor pagaba
    // 2.220,00 €, y esa asimetría de 39,48 € se atribuyó a un cruce de escalón. NO era eso: la
    // causaba la reducción residual del art. 20 —2.364 € para todo RNT ≥ 16.825— que este
    // proyecto arrastraba y que no existe. Corregida, los dos lados están en el tramo del 37 %
    // y la operación es simétrica, que es lo que cabe esperar.
    // A mano: rnt = 45.000 − 2.000 = 43.000, reducción 0 → base 43.000
    //   pagador:   escala(43.000) − escala(37.000) = 11.611,50 − 9.391,50 = 2.220,00
    //   perceptor: escala(51.000) − escala(45.000) = 14.571,50 − 12.351,50 = 2.220,00
    const comun = { regimen: 'gananciales' as const, ingresos: 45000, tienePensionConyuge: true, pensionMensual: 500 };
    const paga = calcularImpuestosDivorcio({ ...comun, rolPension: 'pago' });
    expect(paga.pensionConyuge?.tipo).toBe('ahorro');
    expect(Math.round(paga.pensionConyuge!.importe * 100) / 100).toBe(2220);
    const cobra = calcularImpuestosDivorcio({ ...comun, rolPension: 'cobro' });
    expect(cobra.pensionConyuge?.tipo).toBe('coste');
    expect(Math.round(cobra.pensionConyuge!.importe * 100) / 100).toBe(2220);
  });

  test('ALTO: con hipoteca antigua pero SIN decir quién paga, no debe afirmar que se pierde', () => {
    // Es el ÚNICO de los cuatro bloques del fichero que usa if/else en vez de exigir su
    // discriminante (los otros hacen `p.rolPension &&`, `p.custodia &&`, `posVivienda === 'salgo'`),
    // así que el `else` se traga el undefined y el MCP escribe «se pierde la deducción por esa
    // parte» sin que nadie lo haya dicho. Hasta 1.356 €/año (9.040 × 15 %) dados por perdidos.
    // La app lo impide: pasoValido() case 4 exige `posHipoteca !== null`.
    // Esa incoherencia interna es literalmente la pista del caso del nieto.
    const r = calcularImpuestosDivorcio({ regimen: 'gananciales', ingresos: 45000, tieneHipotecaAntigua: true });
    expect(r.hipoteca).toBeUndefined();
  });

  test('ALTO: con hijos y custodia pero SIN número, el motor pide el dato en vez de callar', () => {
    // REPARADO 09/09/2026. Antes, `p.numHijos ?? 0` + la guarda `> 0` hacían desaparecer el
    // bloque de hijos ENTERO sin decir nada, omitiendo entre 456 €/año (1 hijo) y 2.584 €/año
    // (4 hijos). El campo es `.optional()` en el esquema zod del MCP, así que el LLM lo omite
    // en cuanto el usuario no lo menciona.
    //
    // La reparación rechaza en vez de advertir, y la razón es buena: el motor no tiene canal de
    // advertencias y la route no imprime ninguna, así que habría que inventar uno que se puede
    // olvidar. Un error no se olvida, y deja al LLM re-preguntando en vez de resumir una
    // respuesta a la que le faltan 2.584 €. Es lo que ya hacen calcularIRPF y calcularLegitimas.
    expect(() => calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 45000, tieneHijos: true, custodia: 'exclusiva-tengo',
    })).toThrow(/numHijos/i);

    // Con el dato, el bloque vuelve a emitirse con normalidad.
    const conDato = calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 45000, tieneHijos: true, custodia: 'exclusiva-tengo', numHijos: 1,
    });
    expect(conDato.hijos).toBeDefined();
  });

  test('ALTO: ingresos negativos deben lanzar, como hace calcularIRPF del mismo directorio', () => {
    // `calcularIRPF` valida (`if (p.rendimientosTrabajo < 0) throw`) y la app exige ingresos > 0
    // en pasoValido() case 0. Este motor no valida NADA: acepta también porcPropiedad = 500 %
    // (imputa 5 veces el valor catastral) y numHijos = 12. Hoy lo tapa zod en el único consumidor.
    expect(() => calcularImpuestosDivorcio({ regimen: 'gananciales', ingresos: -50000 })).toThrow();
  });

  test('FIJADO (no aprobado): el catastro sin declarar cae al 2 %, el tipo más caro', () => {
    // `p.catastroRevisado ? 0.011 : 0.02` trata el undefined como «no revisado». Está declarado en
    // el describe de zod («Por defecto false»), pero el default declarado es el desfavorable y el
    // LLM no puede conocer el dato sin preguntar. +333 €/año en el caso tipo. La app exige
    // `catastroRevisado !== null`. Se fija el comportamiento actual para que un cambio se vea.
    const comun = {
      regimen: 'gananciales' as const, ingresos: 45000, tieneVivienda: true,
      posVivienda: 'salgo' as const, valorCatastral: 200000, porcPropiedad: 50,
    };
    expect(calcularImpuestosDivorcio({ ...comun, catastroRevisado: true }).vivienda!.imputacionAnual).toBe(1100);
    expect(calcularImpuestosDivorcio(comun).vivienda!.imputacionAnual).toBe(2000);
  });

  test('CLAVES (sano en 4 de 5): cada valor de los tipos unión llega a la salida', () => {
    // Régimen: 3 valores colapsados en un booleano — 'separacion' y 'participacion' son
    // indistinguibles (solo cambia un texto, 0 € de impacto), pero es el patrón «unión colapsada».
    expect((['gananciales', 'separacion', 'participacion'] as const).map((regimen) =>
      calcularImpuestosDivorcio({ regimen, ingresos: 45000 }).gananciales)).toEqual([true, false, false]);

    // Custodia: los 3 discriminan bien.
    expect((['exclusiva-tengo', 'exclusiva-otro', 'compartida'] as const).map((custodia) =>
      calcularImpuestosDivorcio({
        regimen: 'gananciales', ingresos: 45000, tieneHijos: true, custodia, numHijos: 2,
      }).hijos!.porcentaje)).toEqual([100, 0, 50]);

    // Pensión: los 2 emiten y la AUSENCIA del discriminante NO emite — la guarda correcta, que es
    // justo la que le falta a la hipoteca.
    expect(calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 45000, tienePensionConyuge: true, pensionMensual: 500,
    }).pensionConyuge).toBeUndefined();
  });
});

const r2m = (n: number) => Math.round(n * 100) / 100;

// ────────────────────────────────────────────────────────────────────────────
// SONDEO DE MOTORES 09/09/2026 — TANDA 3: segundo pagador, legítimas y dividendos.
// Ninguno de los tres tiene app: su única salida al mundo es una API o el MCP, así que
// sus cifras solo las ve un LLM que se las recita a un usuario real y ninguna ronda de
// navegador puede alcanzarlos. Acta completa en `_private/inspector/MOTORES.md`.
// ────────────────────────────────────────────────────────────────────────────

test.describe('Motores 09/09 — segundo pagador: dos constantes copiadas y envejecidas', () => {
  test('CRÍTICO: el umbral de VARIOS pagadores es el de data/fiscal (15.876 €), no 15.000 €', () => {
    // REPARADO 09/09/2026: el motor ya importa OBLIGACION_DECLARAR_2025 en vez de copiarlo.
    // `LIMITE_OBLIGACION_SEGUNDO_PAGADOR = 15000` quedó congelado en el valor anterior a la
    // subida del SMI. data/fiscal dice 15.876 desde 2024, y lo repiten test-obligado-declarar-renta,
    // estimador-irpf, orientador-tipos-renta-irpf, simulador-desglose-nomina y
    // declaracion-renta-fallecidos. En la banda 15.000,01–15.876,00 € el motor afirma una
    // obligación legal que NO existe — y el perfil de esa banda (empleo parcial + SEPE) es
    // justo el que hace esta consulta.
    //
    // El número malo no vive solo en el campo: va redactado dentro de `advertencias`, que es
    // lo que el LLM copia literalmente.
    const res = calcularIRPFSegundoPagador({
      pagadores: [
        { descripcion: 'Empresa', importeBruto: 14000, retencionesPracticadas: 0 },
        { descripcion: 'SEPE', importeBruto: 1501, retencionesPracticadas: 0 },
      ],
    });
    expect(res.superaUmbralSegundoPagador).toBe(true);
    expect(res.limiteObligacionDeclarar).toBe(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores);
    expect(res.obligacionDeclarar).toBe(false); // 15.501 € ≤ 15.876 €
  });

  test('CRÍTICO: la reducción del art. 20 se aplica sobre el RNT y con los importes vigentes', () => {
    // REPARADO 09/09/2026 — y este test estuvo MAL escrito antes de repararlo, lo que
    // ilustra el aviso del CLAUDE.md: «un test.fail() que pasa a verde no es prueba de nada
    // hasta comprobar que lo que afirma sigue siendo correcto».
    //
    // La primera versión afirmaba una cuota de 4.198,14 € para 30.000 € de brutos. Esa cifra
    // salía de `data/fiscal`, que a su vez llevaba la redacción ANTERIOR al RDL 4/2024 con una
    // reducción residual de 2.364 € que no existe. O sea: el test consagraba el error.
    //
    // Contrastado con el Manual práctico de Renta 2025 de la AEAT, la cadena correcta para
    // 30.000 € de brutos es:
    //   RNT = 30.000 − 2.000 = 28.000  →  reducción art. 20 = 0 (RNT > 19.747,5)
    //   base liquidable = 28.000 − 5.550 = 22.450
    //   cuota = 12.450×19 % + 7.750×24 % + 2.250×30 % = 4.900,50 €
    // que es justo lo que este motor ya devolvía: en el tramo alto acertaba, porque su
    // reducción mínima de 0 € coincide con la norma. Su defecto estaba en el tramo BAJO.
    const alto = calcularIRPFSegundoPagador({
      pagadores: [
        { descripcion: 'Empresa A', importeBruto: 24000, retencionesPracticadas: 3100 },
        { descripcion: 'SEPE', importeBruto: 6000, retencionesPracticadas: 0 },
      ],
    });
    // Y tras corregir también el mínimo personal (art. 63.1.2º, misma sesión), la cuota pasa a
    // 5.511,00 € — la MISMA que da `calcularIRPF` para 30.000 €. Las dos tools del MCP, que
    // discrepaban, ya coinciden:
    //   base 28.000 → escala(28.000) − escala(5.550) = 6.565,50 − 1.054,50 = 5.511,00
    expect(alto.cuotaIRPFEstimada).toBe(5511);
    expect(alto.resultadoEstimadoDeclaracion).toBe(2411);
  });

  test('CRÍTICO: en el tramo BAJO, que es donde fallaba, ya no cobra de más', () => {
    // Antes de reparar, el motor comparaba los umbrales de la reducción contra los BRUTOS en
    // vez de contra el RNT y usaba 5.565 € de reducción máxima. Medido contra la cadena
    // canónica, cobraba de más justo a quien menos gana:
    //   15.000 € brutos → 767,47 € cobrados frente a 28,12 € reales   (+739 €)
    //   17.000 € brutos → 1.795,50 € frente a 457,33 €                (+1.338 €)
    //   20.000 € brutos → 2.365,50 € frente a 1.986,99 €              (+378 €)
    // Ahora la reducción sale de `calcularReduccionRendimientosTrabajo` sobre el RNT.
    // Valores tras las DOS correcciones (reducción del art. 20 y mínimo en cuota). A mano,
    // 20.000 € brutos: rnt 18.000 → reducción = 2.364,34 − 1,14×(18.000 − 17.673,52) = 1.992,15
    //   base 16.007,85 → escala(16.007,85) − escala(5.550) = 3.219,38 − 1.054,50 = 2.164,88
    const casos: Array<[number, number]> = [
      [15000, 28.12],
      [17000, 457.33],
      [20000, 2164.88],
    ];
    for (const [brutos, esperado] of casos) {
      const res = calcularIRPFSegundoPagador({
        pagadores: [{ descripcion: 'A', importeBruto: brutos, retencionesPracticadas: 0 }],
      });
      expect(res.cuotaIRPFEstimada, `${brutos} € brutos`).toBeCloseTo(esperado, 1);
    }
  });

  test('ALTO: una retención negativa se rechaza, igual que un importe negativo', () => {
    // REPARADO 09/09/2026: la guarda vivía solo en la ruta HTTP; ahora está en el motor.
    // El motor valida `importeBruto < 0` pero no `retencionesPracticadas < 0`. Su ruta HTTP sí
    // (route.ts:76-81), de modo que la guarda vive FUERA del motor: el patrón de impuestosDivorcio,
    // que replicó la aritmética de su app y no su validador.
    expect(() => calcularIRPFSegundoPagador({
      pagadores: [{ descripcion: 'A', importeBruto: 30000, retencionesPracticadas: -500 }],
    })).toThrow();
  });

  test('ALTO: un importe no finito se rechaza, en vez de responder «no estás obligado a declarar»', () => {
    // REPARADO 09/09/2026: NaN e Infinity ya no atraviesan las guardas.
    // NaN e Infinity pasan los DOS filtros —el del motor y el de la ruta— porque
    // typeof NaN === 'number' y NaN < 0 es false. Con NaN el motor devuelve
    // obligacionDeclarar = false: la respuesta tranquilizadora, calculada sobre nada.
    // Infinity llega de verdad por HTTP: JSON.parse('1e999') === Infinity.
    expect(() => calcularIRPFSegundoPagador({
      pagadores: [{ descripcion: 'A', importeBruto: Number.NaN, retencionesPracticadas: 0 }],
    })).toThrow();
  });

  test('SANO — 1.500 € exactos NO activan el umbral reducido (no tocar al reparar)', () => {
    // La condición compuesta del art. 96.3 está bien montada y NO debe tocarse al arreglar la
    // cifra del umbral: el 1.500 es un «supere», no un «alcance». El error fácil —aplicar el
    // umbral bajo con un segundo pagador de 1.500 € clavados— no está aquí.
    const exacto = calcularIRPFSegundoPagador({
      pagadores: [
        { descripcion: 'A', importeBruto: 18000, retencionesPracticadas: 0 },
        { descripcion: 'B', importeBruto: 800, retencionesPracticadas: 0 },
        { descripcion: 'C', importeBruto: 700, retencionesPracticadas: 0 },
      ],
    });
    expect(exacto.importeSegundoYRestantesPagadores).toBe(1500);
    expect(exacto.superaUmbralSegundoPagador).toBe(false);
    expect(exacto.limiteObligacionDeclarar).toBe(OBLIGACION_DECLARAR_2025.trabajo.unPagador);
  });

  test('SANO — «segundo y restantes» se toma por orden de CUANTÍA, no de entrada', () => {
    // El art. 96.3 dice «del segundo y restantes pagadores, por orden de cuantía». El motor
    // ordena antes de partir, así que aquí el pagador de 1.000 € es el segundo aunque venga
    // primero en la lista.
    const res = calcularIRPFSegundoPagador({
      pagadores: [
        { descripcion: 'Pequeño', importeBruto: 1000, retencionesPracticadas: 0 },
        { descripcion: 'Grande', importeBruto: 19000, retencionesPracticadas: 0 },
      ],
    });
    expect(res.pagadores[0].descripcion).toBe('Grande');
    expect(res.importeSegundoYRestantesPagadores).toBe(1000);
    expect(res.superaUmbralSegundoPagador).toBe(false);
  });

  test('SANO · CUADRE: resultado = cuota − retenciones, y 1.º + resto = total', () => {
    // Hoy cuadra en los 464 casos; el candado es para que siga cuadrando cuando se corrijan
    // las constantes, que es justo el momento en que un redondeo intermedio se descoloca.
    let casos = 0;
    for (let a = 0; a <= 90000; a += 3137) {
      for (let b = 0; b <= 20000; b += 2711) {
        const res = calcularIRPFSegundoPagador({
          pagadores: [
            { descripcion: 'A', importeBruto: a, retencionesPracticadas: Math.round(a * 11) / 100 },
            { descripcion: 'B', importeBruto: b, retencionesPracticadas: Math.round(b * 2) / 100 },
          ],
        });
        const etq = `a=${a} b=${b}`;
        expect(r2m(res.cuotaIRPFEstimada - res.totalRetencionesPracticadas), etq).toBe(res.resultadoEstimadoDeclaracion);
        expect(r2m(res.pagadores.reduce((s, p) => s + p.importeBruto, 0)), etq).toBe(res.totalRendimientosBrutos);
        casos++;
      }
    }
    expect(casos).toBeGreaterThan(200);
  });
});

test.describe('Motores 09/09 — legítimas: sí distingue los siete regímenes, pero inventa herederos', () => {
  const REGIMENES_LEG: RegimenId[] = ['comun', 'cataluna', 'aragon', 'galicia', 'baleares', 'pais-vasco', 'navarra'];

  test('SANO — el motor NO colapsa los siete regímenes civiles en el Código Civil', () => {
    // Lo que este motor hace bien y hay que impedir que se pierda: el derecho civil español no
    // es uniforme, y decirle «te corresponden 2/3» a alguien de Barcelona sería falso.
    //
    // ⚠️ CORREGIDO EL 09/09/2026 — y este test estaba MAL. Afirmaba que en Baleares la legítima
    // pasa a 1/2 «con 2 o más hijos», copiando la tabla de la app. El art. 42 de la Compilació
    // (extendido a Menorca por el art. 65, y con el art. 79 para Eivissa i Formentera) dice
    // literalmente: «la tercera parte del haber hereditario si fueren CUATRO O MENOS de cuatro,
    // y la mitad si excedieren de este número». El corte está en el cuarto hijo, no en el
    // primero. Verificado en el BOE (texto consolidado de la Compilació) durante la reparación.
    //
    // Es el segundo test de esta pasada que consagraba un error en vez de detectarlo — el otro
    // fue la cuota del segundo pagador. Por eso el CLAUDE.md exige releer lo que un test AFIRMA
    // antes de darlo por bueno, y no solo mirar si está verde.
    const PN = 300000;
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'comun', numHijos: 2 }).legitimaTotal).toBe(200000);      // 2/3
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'cataluna', numHijos: 2 }).legitimaTotal).toBe(75000);    // 1/4
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'galicia', numHijos: 2 }).legitimaTotal).toBe(75000);     // 1/4
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'aragon', numHijos: 2 }).legitimaTotal).toBe(150000);     // 1/2 colectiva
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'pais-vasco', numHijos: 2 }).legitimaTotal).toBe(100000); // 1/3
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'navarra', numHijos: 2 }).legitimaTotal).toBe(0);         // formal
    // Baleares: 1/3 hasta CUATRO hijos, 1/2 a partir del quinto (art. 42 Compilació).
    for (const n of [1, 2, 3, 4]) {
      expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'baleares', numHijos: n }).legitimaTotal, `${n} hijos`).toBe(100000);
    }
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'baleares', numHijos: 5 }).legitimaTotal).toBe(150000);
  });

  test('CRÍTICO: sin descendientes ya no se publica una legítima de descendientes', () => {
    // REPARADO EL 09/09/2026. Antes, con `numHijos: 0`, los SIETE regímenes publicaban una
    // legítima de descendientes —común 200.000 €, Cataluña 75.000 €, Aragón 150.000 €— y el
    // común citaba además el art. 834 CC, que exige concurrir CON descendientes.
    //
    // La reparación no se quedó en rechazar: «no tengo hijos, ¿cuánto puedo dejar a quien
    // quiera?» es una pregunta legítima y frecuente. En Derecho Común se modela (arts. 807,
    // 809, 837 y 838 CC); en los forales, donde la legítima de ascendientes cambia en cada
    // uno, se rechaza con un error que explica por qué. Navarra sí responde: su legítima es
    // formal (0 €) haya descendientes o no.
    //
    // Y no se adivina el dato: sin `tieneAscendientes` el motor NO supone que no los hay,
    // porque publicar «puedes disponer del 100 %» a quien tiene a sus padres vivos sería la
    // misma clase de mentira que se estaba corrigiendo.
    const sinDato = () => calcularLegitimas({ patrimonioNeto: 300000, regimen: 'comun', numHijos: 0, tieneConyuge: true });
    expect(sinDato).toThrow(/ascendientes/i);

    // Con ascendientes vivos y cónyuge: 1/3 (art. 809), y el usufructo del viudo es 1/2 (art. 837).
    const conAsc = calcularLegitimas({ patrimonioNeto: 300000, regimen: 'comun', numHijos: 0, tieneConyuge: true, tieneAscendientes: true });
    expect(conAsc.legitimaTotal).toBe(100000);
    expect(conAsc.libreDisposicion).toBe(200000);
    expect(conAsc.legitimarios).toBe('ascendientes');

    // Sin ascendientes ni descendientes: no hay legítima, y el viudo usufructúa 2/3 (art. 838).
    const sinAsc = calcularLegitimas({ patrimonioNeto: 300000, regimen: 'comun', numHijos: 0, tieneConyuge: true, tieneAscendientes: false });
    expect(sinAsc.legitimaTotal).toBe(0);
    expect(sinAsc.libreDisposicion).toBe(300000);

    // El art. 834 ya no se cita donde no hay descendientes con quien concurrir.
    expect(conAsc.descripcionDerechoConyuge).not.toContain('834');
    expect(sinAsc.descripcionDerechoConyuge).not.toContain('834');
  });

  test('ALTO: una clave heredada de Object.prototype no puede pasar por régimen', () => {
    // `if (!REGIMENES[p.regimen]) throw` no protege: REGIMENES es un literal con prototipo, así
    // que REGIMENES['constructor'] es truthy, el switch no casa ningún caso y todo se queda en
    // su inicialización — 0 € de legítima Y 0 € de libre disposición: el patrimonio entero
    // desaparece. Es el `?? 0` de este motor. /api/chatgpt/legitimas pasa `body.regimen` en
    // crudo, sin esquema, y devuelve eso con HTTP 200. Un régimen inventado normal
    // ('valencia') sí se rechaza: solo se cuelan las heredadas.
    for (const k of ['constructor', 'toString', 'valueOf', 'hasOwnProperty']) {
      expect(() => calcularLegitimas({ patrimonioNeto: 300000, regimen: k as RegimenId, numHijos: 2 }), k).toThrow();
    }
  });

  test('ALTO: un patrimonio o un número de hijos no finitos se rechazan', () => {
    // NaN < 0 y NaN > 20 son ambos false, así que las tres guardas del motor lo dejan pasar.
    // Por la API sale como "legitimaTotal": null con HTTP 200, y el LLM puede leerlo como
    // «no corresponde legítima». Y numHijos: 2.5 reparte entre dos hijos y medio.
    expect(() => calcularLegitimas({ patrimonioNeto: NaN, regimen: 'comun', numHijos: 2 })).toThrow();
    expect(() => calcularLegitimas({ patrimonioNeto: Infinity, regimen: 'comun', numHijos: 2 })).toThrow();
    expect(() => calcularLegitimas({ patrimonioNeto: 300000, regimen: 'comun', numHijos: 2.5 })).toThrow();
  });

  test('CUADRE: legítima total + libre disposición = el patrimonio publicado', () => {
    // 240 de 1.344 casos no cuadran, por dos causas distintas:
    //  · común (160) — `legitimaTotal = r(tercioEstricto + tercioMejora)` suma el tercio SIN
    //    redondear con el YA redondeado. Con 200.000 € —el valor por defecto de la app—
    //    publica 133.333,34 donde 2/3 son 133.333,33, y las partes suman 200.000,01.
    //  · Aragón (80) — r(PN/2) + r(PN/2) duplica el medio céntimo con céntimos impares.
    const caudales = [1, 100, 999, 100003, 1000003, 0.01, 100.01, 250000.55, 333333.33, 7919, 104729, 61.73];
    const fallos: string[] = [];
    for (const regimen of REGIMENES_LEG) {
      for (let n = 1; n <= 8; n++) {
        for (const PN of caudales) {
          const r = calcularLegitimas({ patrimonioNeto: PN, regimen, numHijos: n, tieneConyuge: true });
          const suma = Math.round((r.legitimaTotal + r.libreDisposicion) * 100) / 100;
          if (suma !== PN) fallos.push(`${regimen}/${n}h/${PN} → ${suma}`);
        }
      }
    }
    expect(fallos.length, `${fallos.length} descuadres`).toBe(0);
  });

  test('ALTO: «usufructo universal sobre todos los bienes» tiene que valer el patrimonio entero', () => {
    // REPARADO 09/09/2026, y de paso salieron dos cifras mal ancladas en fuente:
    //   · Baleares — el usufructo del viudo es la MITAD del haber cuando concurre con
    //     descendientes (art. 45 Compilació), no universal. El texto decía «universal» y la
    //     cifra copiaba `legitimaTotal`: ni una ni otra eran correctas.
    //   · País Vasco — Ley 5/2015 art. 52: «usufructo de la MITAD de todos los bienes del
    //     causante si concurriere con descendientes» (dos tercios en su defecto). El motor
    //     publicaba el patrimonio entero rotulado «usufructo universal de viudedad foral».
    // Aragón (CDFA art. 271) y Navarra (usufructo de fidelidad) SÍ son universales, y ahí el
    // texto y la cifra ya concordaban. Este test vigila que sigan concordando.
    for (const regimen of REGIMENES_LEG) {
      const r = calcularLegitimas({ patrimonioNeto: 300000, regimen, numHijos: 2, tieneConyuge: true });
      if (/universal|todos los bienes/i.test(r.descripcionDerechoConyuge)) {
        expect(r.derechoConyuge, `${regimen}: "${r.descripcionDerechoConyuge}"`).toBe(r.patrimonioNeto);
      }
    }
  });

  test('SANO — lo que el motor ya rechaza sigue rechazándose', () => {
    expect(() => calcularLegitimas({ patrimonioNeto: -1, regimen: 'comun', numHijos: 2 })).toThrow();
    expect(() => calcularLegitimas({ patrimonioNeto: 300000, regimen: 'comun', numHijos: 21 })).toThrow();
    expect(() => calcularLegitimas({ patrimonioNeto: 300000, regimen: 'valencia' as RegimenId, numHijos: 2 })).toThrow();
  });
});

test.describe('Motores 09/09 — retención de dividendos: la escala del ahorro copiada al 28 %', () => {
  const canonica = (base: number) => {
    if (base <= 0) return 0;
    let cuota = 0, anterior = 0;
    for (const t of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
      if (base <= anterior) break;
      cuota += (Math.min(base, t.hasta) - anterior) * (t.tipo / 100);
      anterior = t.hasta;
    }
    return Math.round(cuota * 100) / 100;
  };

  test('CRÍTICO: la escala del ahorro es la de data/fiscal, no una copia con el último tramo al 28 %', () => {
    // `retencionDividendos.ts:52-59` lleva su propia copia. Los cuatro primeros tramos coinciden
    // valor a valor con TRAMOS_GANANCIAS_PATRIMONIALES_2025; el quinto no: 28 frente al 30
    // canónico. No es un fallo de método —`cuotaAhorro` escalona bien, tramo a tramo—: es el valor.
    //
    // data/fiscal/irpf.ts:48-51 deja escrita la instrucción literal: «La escala de la BASE DEL
    // AHORRO está centralizada en data/fiscal/inmuebles.ts […] Importar desde allí; no duplicar
    // aquí». Y plusvaliasIRPF.ts:16-18 explica por qué: «si se hardcodean, la tool MCP divergiría
    // de las apps web cuando cambien los tipos». Es exactamente lo que ha pasado.
    //
    // ⚠️ El mismo `{ hasta: Infinity, tipo: 28 }` está en NUEVE motores, y
    // app/api/datos/[slug]/route.ts publica la canónica al 30 %: dos endpoints públicos de
    // meskeIA sirven hoy cifras contradictorias. La reparación es de flota.
    const res = calcularRetencionDividendos({ tipoReceptor: 'persona_fisica_residente', dividendoBruto: 400000 });
    expect(res.cuotaImpuesto).toBe(canonica(400000)); // 101.880,00 €; el motor da 99.880,00 €
  });

  test('CRÍTICO: un tipo de CDI imposible se rechaza, no genera un dividendo neto negativo', () => {
    // tipoCDI: 150 → retención 1.500 € sobre 1.000 € y dividendoNeto −500 €.
    // tipoCDI: −30 → retención −300 € y neto 1.300 €, más de lo que se reparte.
    // El LLM que ponga «30» donde el esquema pide un porcentaje pero el usuario habló de euros
    // obtiene un número aritméticamente imposible, presentado con la misma seguridad que uno bueno.
    expect(() => calcularRetencionDividendos({
      tipoReceptor: 'no_residente', dividendoBruto: 1000, tipoCDI: 150,
    })).toThrow();
  });

  test('ALTO: omitir mesesTenencia no puede convertir un dividendo exento en 25.000 € de IS', () => {
    // `p.mesesTenencia ?? 0`: los dos campos son OPCIONALES en el esquema OpenAPI que lee el LLM
    // y ninguno declara valor por defecto. Si no los rellena —lo normal cuando el usuario no los
    // menciona—, el motor inventa un 0, liquida el IS y encima lo escribe como si el usuario lo
    // hubiera declarado: «Tenencia inferior a 12 meses (0 meses)». Con mesesTenencia: 24 la cuota
    // es 0. Sin el campo, 25.000 € sobre 100.000 € brutos. No distingue «no me lo has dicho» de
    // «es cero».
    const sinDato = calcularRetencionDividendos({
      tipoReceptor: 'sociedad_residente', dividendoBruto: 100000, porcentajeParticipacion: 10,
    });
    expect(sinDato.advertencias.join(' ') + (sinDato.motivoNoExencion ?? ''))
      .toMatch(/no (se ha )?(indicad|aport|facilit)|falta|desconocid|sin dato/i);
  });

  test('ALTO: un dividendo que el motor declara EXENTO no soporta retención española', () => {
    test.fail(); // ABIERTO A PROPÓSITO — pendiente de fuente oficial, no de trabajo
    // Incoherencia entre dos umbrales del mismo bloque: exime del IS desde el 5 % + 12 meses,
    // pero solo suprime la retención desde el 25 %. Con 10 % y 24 meses publica
    // aplicaExencionIS: true junto a 19.000 € de retención practicada.
    //
    // ⚠️ ESTE test.fail() NO se retira todavía, y no es un olvido. En la sesión de reparación
    // del 09/09/2026 se buscó la fuente y NO se pudo anclar cuál de los dos umbrales es el
    // correcto: `data/fiscal` no tiene módulo de excepciones a la obligación de retener y la
    // consulta al art. 61 RIS no fue concluyente. Elegir uno «por coherencia» habría sido
    // inventar normativa, y en la dirección equivocada haría daño: si el bueno fuera el 25 %,
    // quitar la retención dejaría al usuario sin reclamar una devolución que le corresponde.
    //
    // Lo que SÍ se reparó es que la respuesta ya no deja las dos afirmaciones sin reconciliar:
    // el motor explica que la retención es un pago a cuenta íntegramente recuperable y que la
    // `cuotaDiferencial` negativa ES esa devolución. Queda para /triaje-fiscal.
    const res = calcularRetencionDividendos({
      tipoReceptor: 'sociedad_residente', dividendoBruto: 100000,
      porcentajeParticipacion: 10, mesesTenencia: 24,
    });
    expect(res.aplicaExencionIS).toBe(true);
    expect(res.retencionPracticada).toBe(0);
  });

  test('SANO — el caso corriente sale bien y tiene que seguir saliendo', () => {
    // 5.000 € caen enteros en el primer tramo, donde la copia y la canónica coinciden (19 %).
    const res = calcularRetencionDividendos({ tipoReceptor: 'persona_fisica_residente', dividendoBruto: 5000 });
    expect(res.retencionPracticada).toBe(950);
    expect(res.cuotaImpuesto).toBe(950);
    expect(res.dividendoNeto).toBe(4050);
    expect(res.cuotaDiferencial).toBe(0);
  });

  test('SANO — la escala del ahorro ESCALONA, no aplica el marginal a la base entera', () => {
    // Lo que hundió a deduccionAutonomoIRPF (marginal × base entera, +46 %) aquí NO pasa, y este
    // candado lo fija: si alguien «simplifica» cuotaAhorro, se entera.
    const res = calcularRetencionDividendos({ tipoReceptor: 'persona_fisica_residente', dividendoBruto: 350000 });
    expect(res.cuotaImpuesto).toBeLessThan(350000 * 0.27);
    expect(res.cuotaImpuesto).toBeGreaterThan(350000 * 0.19);
  });

  test('SANO · CUADRE: bruto − retención = neto y cuota − retención = diferencial', () => {
    // Cadenas que hoy SÍ cuadran en todo el barrido, incluidos importes que caen en medio
    // céntimo. Quedan clavadas: es la aritmética que el LLM le lee al usuario.
    const fallos: string[] = [];
    for (let bruto = 100.004; bruto <= 400000; bruto = bruto * 1.37 + 0.005) {
      for (const otros of [0, 5999.99, 6000, 49999.5, 200000, 299999.99]) {
        const res = calcularRetencionDividendos({
          tipoReceptor: 'persona_fisica_residente', dividendoBruto: bruto, otrosRdtoAhorroEjercicio: otros,
        });
        if (r2m(res.dividendoBruto - res.retencionPracticada) !== res.dividendoNeto) fallos.push(`NETO ${bruto}/${otros}`);
        if (r2m(res.cuotaImpuesto - res.retencionPracticada) !== res.cuotaDiferencial) fallos.push(`DIF ${bruto}/${otros}`);
      }
    }
    expect(fallos, `${fallos.length} descuadres`).toEqual([]);
  });

  test('DERIVA: el tipo de IS y la retención del 19 % coinciden HOY con data/fiscal', () => {
    // Los otros dos valores hardcodeados del motor (19 % y 25 %) NO divergen todavía. Este
    // candado existe para que se enteren el día que data/fiscal cambie, que es exactamente lo
    // que nadie vio pasar con el tramo del 28 %.
    const soc = calcularRetencionDividendos({
      tipoReceptor: 'sociedad_residente', dividendoBruto: 100000, porcentajeParticipacion: 3, mesesTenencia: 24,
    });
    expect(soc.cuotaImpuesto).toBe(100000 * TIPOS_IS_2025.general / 100);
    const pf = calcularRetencionDividendos({ tipoReceptor: 'persona_fisica_residente', dividendoBruto: 100000 });
    expect(pf.retencionPracticada).toBe(100000 * RETENCIONES_IS_2025.dividendos / 100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFICACIÓN APP ↔ MOTOR — 10/09/2026
//
// La pasada del 09/09 dejó escrito que la causa raíz de sus once críticos no era que los
// motores estuvieran mal escritos, sino que CADA CÁLCULO ESTABA ESCRITO DOS VECES —una en el
// motor que lee un LLM y otra inline en la app que ve la persona— y solo se miraba una.
//
// El 10/09 se retiraron las cinco copias inline nombradas en el acta: `estimador-legitimas`,
// `impuestos-divorcio`, `estimacion-deduccion-discapacidad`, `estimacion-deduccion-maternidad` y
// `orientador-impuesto-patrimonio`. Las cinco apps importan ahora su motor.
//
// Lo que sigue clava los valores en los que la web y la API DIVERGÍAN cuando esas dos copias
// convivían. No son casos inventados para la ocasión: cada uno es una cifra que meskeIA publicaba
// de dos maneras distintas según se preguntase por el navegador o por un LLM. Si alguien vuelve a
// escribir el cálculo en la app, estos son los números que tendrá que reproducir.
//
// ⚠️ Un test en verde no prueba nada hasta releer lo que AFIRMA. El 09/09 dos tests escritos esa
// misma mañana consagraban errores, y se cazaron leyéndolos, no mirando el color. Cada afirmación
// de aquí abajo lleva el artículo que la sostiene.
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Unificación 10/09 — legítimas: la web publicaba otra cifra que la API', () => {
  test('Baleares: el corte está en CUATRO hijos, no en uno (art. 42 Compilació)', () => {
    // La copia inline de `app/estimador-legitimas` cortaba en `numHijos === 1 ? 1/3 : 1/2`. El
    // art. 42 de la Compilació —y el 79 para Eivissa— reserva 1/3 «si fueren CUATRO O MENOS de
    // cuatro, y la mitad si excedieren de este número». Con 200.000 € y 2 hijos la web decía
    // 100.000 € y la API 66.666,67 €: 33.333,33 € de diferencia sobre la misma herencia.
    const PN = 200000;
    for (const n of [1, 2, 3, 4]) {
      const res = calcularLegitimas({ patrimonioNeto: PN, regimen: 'baleares', numHijos: n });
      expect(res.legitimaTotal, `${n} hijo(s): 1/3 hasta cuatro`).toBe(66666.67);
      expect(res.fraccionLegitima).toContain('1/3');
    }
    // El quinto hijo es el que cambia la fracción, y es el único punto donde debe cambiar.
    expect(calcularLegitimas({ patrimonioNeto: PN, regimen: 'baleares', numHijos: 5 }).legitimaTotal).toBe(100000);
  });

  test('el usufructo viudal balear y el vasco son de LA MITAD, no universales', () => {
    // La copia inline atribuía al viudo el patrimonio ENTERO en País Vasco («usufructo universal
    // de todos los bienes») y la legítima en Baleares bajo el rótulo «usufructo universal».
    // Art. 45 de la Compilació (Ley 7/2017) y art. 52 de la Ley 5/2015 vasca: en concurrencia
    // con descendientes, el usufructo alcanza la MITAD del haber.
    const PN = 300000;
    for (const regimen of ['baleares', 'pais-vasco'] as const) {
      const res = calcularLegitimas({ patrimonioNeto: PN, regimen, numHijos: 2, tieneConyuge: true });
      expect(res.derechoConyuge, `${regimen}: la mitad del haber`).toBe(150000);
      // «Universal» es la palabra que delataba el defecto: no puede volver a aparecer aquí.
      expect(res.descripcionDerechoConyuge.toLowerCase()).not.toContain('universal');
    }
  });

  test('los textos normativos del selector salen del motor, no de una copia', () => {
    // La tabla de regímenes de la app afirmaba que «en Menorca rige el Derecho Común», y el
    // art. 65 de la Compilació le extiende el régimen de Mallorca. Ahora la ficha de cada
    // régimen se exporta desde el motor: `REGIMENES_INFO`. Este candado exige que siga estando
    // completa —siete regímenes con nombre, CCAA y norma— porque es lo que la app enseña.
    expect(REGIMENES_VALIDOS).toHaveLength(7);
    for (const id of REGIMENES_VALIDOS) {
      const info = REGIMENES_INFO[id];
      expect(info.nombre.length, `${id}: nombre`).toBeGreaterThan(0);
      expect(info.ccaas.length, `${id}: CCAA`).toBeGreaterThan(0);
      expect(info.fuente.length, `${id}: norma`).toBeGreaterThan(0);
    }
    // Y que no reaparezca la afirmación falsa sobre Menorca por ninguna de sus dos vías.
    const balear = calcularLegitimas({ patrimonioNeto: 100000, regimen: 'baleares', numHijos: 2, tieneConyuge: true });
    const textoBalear = [balear.descripcionDerechoConyuge, ...balear.notas].join(' ');
    expect(textoBalear).not.toMatch(/Menorca[^.]*Derecho Común/i);
  });
});

test.describe('Unificación 10/09 — divorcio: el validador que la copia no replicó', () => {
  test('sin decir quién paga la hipoteca, el bloque NO se emite', () => {
    // Es el caso que motivó el «TODO: unificar»: el motor era el único de los cuatro bloques con
    // `if/else`, y ese `else` se tragaba el `undefined` afirmando que se perdía una deducción de
    // hasta 1.356 €/año sin que nadie hubiera dicho quién paga. La app lo impedía con
    // `pasoValido()`; ahora la regla vive una sola vez, aquí.
    const sinDecir = calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 30000, tieneHipotecaAntigua: true,
    });
    expect(sinDecir.hipoteca).toBeUndefined();

    // Con el discriminante presente sí se emite, en los dos sentidos.
    const meQuedo = calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 30000, tieneHipotecaAntigua: true,
      posHipoteca: 'me-quedo', cuotaHipoteca: 6000,
    });
    expect(meQuedo.hipoteca).toEqual({ deduccionAnual: 900, tipo: 'mantiene' }); // 6.000 × 15 %
    const otroPaga = calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 30000, tieneHipotecaAntigua: true, posHipoteca: 'otro-paga',
    });
    expect(otroPaga.hipoteca).toEqual({ deduccionAnual: 0, tipo: 'pierde' });
  });

  test('el tope de la deducción de vivienda son 9.040 € de base, no de cuota', () => {
    // Con una cuota muy por encima del tope, la deducción se clava en 9.040 × 15 % = 1.356 €.
    // Es el techo que la app anunciaba y que ahora se comprueba en un solo sitio.
    const res = calcularImpuestosDivorcio({
      regimen: 'separacion', ingresos: 60000, tieneHipotecaAntigua: true,
      posHipoteca: 'me-quedo', cuotaHipoteca: 50000,
    });
    expect(res.hipoteca?.deduccionAnual).toBe(1356);
  });

  test('faltando la MAGNITUD con el discriminante puesto, se rechaza en vez de callar', () => {
    // La regla uniforme de los cuatro bloques: falta el discriminante → no se emite; falta la
    // magnitud → se rechaza nombrando el campo. Callar omitiría hasta 2.584 €/año en silencio.
    expect(() => calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 30000, tieneHijos: true, custodia: 'exclusiva-tengo',
    })).toThrow(/numHijos/);
    expect(() => calcularImpuestosDivorcio({
      regimen: 'gananciales', ingresos: 30000, tienePensionConyuge: true, rolPension: 'pago',
    })).toThrow(/pensionMensual/);
    // Y los ingresos negativos, que la app rechazaba y el motor aceptaba sin protestar.
    expect(() => calcularImpuestosDivorcio({ regimen: 'gananciales', ingresos: -1000 })).toThrow();
  });
});

test.describe('Unificación 10/09 — deducciones de IRPF por discapacidad y maternidad', () => {
  test('discapacidad ≥65 %: los 3.000 € no dependen de acreditar ayuda de terceros', () => {
    // Los tres supuestos del art. 60 LIRPF son ALTERNATIVOS y el tercero es el propio grado
    // ≥65 %. Esta era la regla que el motor tenía mal y la APP tenía bien: al unificar hay que
    // conservar la versión de la app, no la del motor. Son 3.000 € de mínimo.
    const sinAcreditar = calcularDeduccionDiscapacidadIRPF({
      titular: 'ascendiente', grado: '65oMas', necesitaAsistencia: false,
    });
    expect(sinAcreditar.gastosAsistencia).toBe(3000);
    expect(sinAcreditar.totalMinimo).toBe(12000);
    expect(sinAcreditar.ahorroEstimado).toBeCloseTo(2535, 2);

    // Con grado 33-64 % la acreditación SÍ es condición necesaria: ahí el incremento no procede.
    const grado33 = calcularDeduccionDiscapacidadIRPF({
      titular: 'ascendiente', grado: '33a65', necesitaAsistencia: false,
    });
    expect(grado33.gastosAsistencia).toBe(0);
  });

  test('maternidad: el tope de guardería es POR HIJO — aquí tenía razón la app', () => {
    // Divergencia demostrada el 09/09 y resuelta contra el Manual práctico Renta 2025, «Límites
    // de la deducción»: el incremento «no podrá superar PARA CADA HIJO» los 1.000 €. El motor lo
    // aplicaba al agregado y perdía 1.000 € por cada hijo adicional; la app lo hacía bien.
    const tresHijos = calcularDeduccionMaternidadIRPF({
      situacion: 'alta',
      cotizacionesSSTotalesAnio: 99999,
      hijos: [0, 0, 0].map(() => ({
        edadMesesInicioEjercicio: 0, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: 2500,
      })),
    });
    expect(tresHijos.totalIncrementoGuarderia).toBe(3000); // 1.000 × 3, no 1.000 en total
  });

  test('maternidad: sin ninguna de las tres vías del art. 81.1 la deducción es 0', () => {
    // El defecto era del signo contrario al que uno esperaría: la falta de derecho se convertía
    // en AUSENCIA de límite y se cobraba el máximo. Sin derecho no hay deducción ni guardería.
    const sinDerecho = calcularDeduccionMaternidadIRPF({
      situacion: 'ninguna',
      cotizacionesSSTotalesAnio: 0,
      hijos: [{ edadMesesInicioEjercicio: 12, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: 3000 }],
    });
    expect(sinDerecho.tieneDerecho).toBe(false);
    expect(sinDerecho.totalDeduccionEfectiva).toBe(0);
    expect(sinDerecho.limiteMaternidadCotizaciones).toBe(0);
  });

  test('CUADRE: las líneas por hijo suman EXACTAMENTE el total publicado', () => {
    // El descuadre llegó a ser de 4.800 € porque el detalle publicaba la deducción bruta y el
    // total la efectiva. Se barre el reparto en céntimos, que es donde 1.000/3 producía 999,99.
    const fallos: string[] = [];
    for (const numHijos of [1, 2, 3, 4]) {
      for (const cotizaciones of [0, 500, 1200, 2400, 99999]) {
        for (const gasto of [0, 333.33, 1000, 5000]) {
          const res = calcularDeduccionMaternidadIRPF({
            situacion: 'alta',
            cotizacionesSSTotalesAnio: cotizaciones,
            hijos: Array.from({ length: numHijos }, () => ({
              edadMesesInicioEjercicio: 0, mesesConDerechoEjercicio: 12, gastosGuarderiaAnuales: gasto,
            })),
          });
          const suma = Math.round(
            res.detalleHijos.reduce((s, d) => s + d.totalDeduccionHijo, 0) * 100
          ) / 100;
          if (suma !== res.totalDeduccionEfectiva) {
            fallos.push(`${numHijos}h/${cotizaciones}€/${gasto}€: ${suma} ≠ ${res.totalDeduccionEfectiva}`);
          }
        }
      }
    }
    expect(fallos, `${fallos.length} descuadres`).toEqual([]);
  });
});

test.describe('Unificación 10/09 — patrimonio: el veredicto del art. 37', () => {
  test('bonificación del 100 % y cuota cero NO obligan a declarar por sí solas', () => {
    // El art. 37 de la Ley 19/1991 obliga cuando la cuota, «una vez aplicadas las deducciones o
    // bonificaciones que procedieren, resulte a ingresar». Con 1,5 M € en Madrid el motor
    // publicaba a la vez cuota 0, bonificación del 100 % y «obligado a declarar»: se contradecía
    // consigo mismo, y la copia inline de la app hacía lo mismo. Afecta a 7 de 17 CCAA.
    const madrid = calcularImpuestoPatrimonio({ ccaaId: 'madrid', otrosBienes: 1500000 });
    expect(madrid.cuotaNeta).toBe(0);
    expect(madrid.porcentajeBonificacion).toBe(100);
    expect(madrid.obligadoDeclarar).toBe(false);
    expect(madrid.obligacion).toBe('no-obligado');
  });

  test('pero por encima de 2.000.000 € de bienes BRUTOS sí obliga, bonifique quien bonifique', () => {
    // La segunda vía del art. 37 es independiente de la cuota, y es la que sigue viva en Madrid.
    // Los bienes brutos NO descuentan deudas ni la exención de vivienda habitual: por eso el
    // caso se construye con deudas grandes, que son las que tentarían a mirar el neto.
    const rico = calcularImpuestoPatrimonio({ ccaaId: 'madrid', otrosBienes: 2500000, deudas: 2000000 });
    expect(rico.patrimonioBruto).toBe(2500000);
    expect(rico.obligadoDeclarar).toBe(true);
    expect(rico.obligacion).toBe('obligado-bruto-2m');
  });

  test('CUADRE: cuota bruta − bonificación publicada = cuota neta publicada', () => {
    // Se publicaba `cuotaBruta` redondeada y se calculaba `cuotaNeta` sobre la NO redondeada.
    // Galicia es la única CCAA con bonificación parcial (50 %), así que es la única donde se ve
    // —y descuadraba el 25 % de los casos—. La app restaba las dos cifras a mano en pantalla, que
    // es justo lo que reproducía el descuadre; ahora imprime `bonificacionAplicada` del motor.
    const fallos: string[] = [];
    for (let base = 700001; base <= 12000000; base = base * 1.21 + 0.37) {
      const res = calcularImpuestoPatrimonio({ ccaaId: 'galicia', otrosBienes: base });
      if (res.cuotaBruta === null || res.cuotaNeta === null || res.bonificacionAplicada === null) continue;
      const neta = Math.round((res.cuotaBruta - res.bonificacionAplicada) * 100) / 100;
      if (neta !== res.cuotaNeta) fallos.push(`${base}: ${neta} ≠ ${res.cuotaNeta}`);
    }
    expect(fallos, `${fallos.length} descuadres`).toEqual([]);
  });

  test('el aviso del ITSGF se mide sobre la base imponible, no sobre el neto', () => {
    // Se comparaba contra el neto SIN descontar la vivienda habitual exenta, así que saltaba
    // ~800.000 € antes de que ese impuesto cobrase nada: su escala deja el 0 % hasta 3.700.000 €
    // de patrimonio neto una vez restado el mínimo de 700.000 €.
    const justoDebajo = calcularImpuestoPatrimonio({
      ccaaId: 'madrid', viviendaHabitual: 300000, otrosBienes: 3600000,
    });
    expect(justoDebajo.aplicaItsgf).toBe(false);
    const porEncima = calcularImpuestoPatrimonio({ ccaaId: 'madrid', otrosBienes: 3800000 });
    expect(porEncima.aplicaItsgf).toBe(true);
  });
});


test.describe('Cuota íntegra general — art. 63.1.2º LIRPF (fuente única desde el 12/09/2026)', () => {
  /**
   * `calcularCuotaIntegraGeneral` es la ÚNICA implementación del art. 63.1.2º del proyecto
   * desde el 12/09/2026. Antes la fórmula estaba copiada en 19 sitios y ocho de ellos la
   * aplicaban mal: restaban el mínimo de la base antes de la escala, lo que lo valora al tipo
   * MARGINAL en vez de a los tipos bajos, y subestimaba la cuota hasta 3.691 €/año.
   *
   * Norma verificada en sesión el 12/09/2026 contra la AEAT, manual de ayuda de Renta 2025,
   * «8.4.3.1 Cuota íntegra estatal»: la escala se aplica a la base liquidable general SIN
   * descontar el mínimo, después a la parte correspondiente al mínimo, y se resta la segunda
   * cuota de la primera. El art. 74 hace lo mismo con la escala autonómica, de modo que el
   * método vale igual sobre la escala combinada de `TRAMOS_IRPF_2025`.
   *
   * Los valores esperados están resueltos a mano desde la escala, no tomados de la función.
   */

  test('los casos resueltos a mano desde la escala', () => {
    // escala acumulada: 12.450 → 2.365,50 · 20.200 → 4.225,50 · 35.200 → 8.725,50 · 60.000 → 17.901,50
    const dos = (x: number) => Math.round(x * 100) / 100;

    // Base 26.050 €, mínimo 5.550 € (nómina de 30.000 € brutos, soltero)
    //   escala(26.050) = 2.365,50 + 1.860,00 + 5.850×30 % = 5.980,50
    //   escala(5.550)  = 1.054,50  →  4.926,00
    expect(dos(calcularCuotaIntegraGeneral(26050, 5550))).toBe(4926);

    // Base 40.000 €, mínimo 10.650 € (dos hijos)
    //   escala(40.000) = 8.725,50 + 4.800×37 % = 10.501,50
    //   escala(10.650) = 2.023,50  →  8.478,00
    expect(dos(calcularCuotaIntegraGeneral(40000, 10650))).toBe(8478);

    // Base 70.000 €, mínimo 17.450 € (tres hijos, uno menor de 3 años)
    //   escala(70.000) = 17.901,50 + 10.000×45 % = 22.401,50
    //   escala(17.450) = 2.365,50 + 5.000×24 % = 3.565,50  →  18.836,00
    expect(dos(calcularCuotaIntegraGeneral(70000, 17450))).toBe(18836);
  });

  test('el mínimo se valora SIEMPRE a los tipos bajos, nunca al marginal', () => {
    // Es el corazón del art. 63.1.2º y lo que el método viejo rompía: dos contribuyentes con
    // el mismo mínimo se ahorran lo MISMO, gane uno 26.000 € y el otro 200.000 €.
    const dos = (x: number) => Math.round(x * 100) / 100;
    const ahorro = (base: number) =>
      dos(cuotaEscalaGeneral(base) - calcularCuotaIntegraGeneral(base, MINIMOS_IRPF_2025.personal));

    const esperado = dos(MINIMOS_IRPF_2025.personal * 0.19); // 1.054,50 €
    for (const base of [26050, 40000, 60000, 100000, 200000, 500000]) {
      expect(ahorro(base), `base ${base}`).toBe(esperado);
    }

    // Y la diferencia con el método viejo es exactamente lo que se subestimaba. Su techo,
    // 5.550 × (45 − 19) % = 1.443 €, se alcanza en cuanto el marginal llega al 45 %.
    const viejo = (base: number) => cuotaEscalaGeneral(Math.max(0, base - MINIMOS_IRPF_2025.personal));
    expect(dos(calcularCuotaIntegraGeneral(26050, 5550) - viejo(26050))).toBe(610.5);
    expect(dos(calcularCuotaIntegraGeneral(100000, 5550) - viejo(100000))).toBe(1443);
  });

  test('el mínimo se acota a la base: la cuota nunca es negativa', () => {
    // Art. 56.2: el mínimo forma parte de la base liquidable «hasta el importe de esta última».
    // Sin acotarlo, escala(base) − escala(mínimo) da negativo en cuanto la renta cae por debajo
    // del mínimo, que es lo que varios motores tapaban con un Math.max(0, …) a posteriori.
    expect(calcularCuotaIntegraGeneral(3000, 5550)).toBe(0);
    expect(calcularCuotaIntegraGeneral(0, 5550)).toBe(0);
    expect(calcularCuotaIntegraGeneral(5550, 5550)).toBe(0);
    // Y justo por encima del mínimo, la cuota es la del primer tramo sobre el exceso.
    expect(Math.round(calcularCuotaIntegraGeneral(6550, 5550) * 100) / 100).toBe(190);
  });

  test('entradas rotas: nada de NaN ni de negativos saliendo hacia la pantalla', () => {
    for (const base of [NaN, Infinity, -1000]) {
      expect(Number.isFinite(calcularCuotaIntegraGeneral(base, 5550)), String(base)).toBe(true);
      expect(calcularCuotaIntegraGeneral(base, 5550), String(base)).toBeGreaterThanOrEqual(0);
    }
    for (const minimo of [NaN, Infinity, -1000]) {
      const c = calcularCuotaIntegraGeneral(26050, minimo);
      expect(Number.isFinite(c), String(minimo)).toBe(true);
      expect(c, String(minimo)).toBeGreaterThanOrEqual(0);
    }
  });

  test('el desglose por tramos suma la cuota de la PRIMERA aplicación de la escala', () => {
    // Lo que se imprime en pantalla es el desglose de la escala sobre la base entera, así que
    // suma más que la cuota íntegra. Si algún día sumase la cuota íntegra sería porque el
    // mínimo volvió a restarse de la base antes de desglosar.
    const { cuota, tramos } = desglosarEscalaGeneral(26050);
    const suma = tramos.reduce((s, t) => s + t.cuota, 0);
    expect(Math.round(suma * 100) / 100).toBe(Math.round(cuota * 100) / 100);
    expect(Math.round(cuota * 100) / 100).toBe(5980.5);
    expect(tramos).toHaveLength(3);
    expect(tramos[2]).toMatchObject({ desde: 20200, hasta: 35200, tipo: 30, base: 5850 });
    // La base de cada tramo suma la base entera, mínimo incluido.
    expect(tramos.reduce((s, t) => s + t.base, 0)).toBe(26050);
  });

  test('la reducción por tributación conjunta NO es un mínimo y no se calcula como tal', () => {
    // Art. 84.2 reglas 3ª y 4ª: «la base imponible se reducirá». Va contra la BASE, así que se
    // valora al tipo marginal — justo lo contrario que el mínimo. Con una base de 40.075 € el
    // marginal es el 37 %, así que los 3.400 € valen 1.258 €; si se tratara como un mínimo
    // valdrían 3.400 × 19 % = 646 €. Mezclarlas da uno u otro número, pero nunca el correcto.
    const dos = (x: number) => Math.round(x * 100) / 100;
    const base = 40075;
    const min = MINIMOS_IRPF_2025.personal;
    const red = REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental;

    const sinConjunta = calcularCuotaIntegraGeneral(base, min);
    const conConjunta = calcularCuotaIntegraGeneral(base - red, min);
    expect(dos(sinConjunta - conConjunta)).toBe(dos(red * 0.37));

    // Y el error de sumarla al mínimo, que es lo que hacían `estimador-irpf` y
    // `estimador-sueldo-neto` con los 2.150 € de la unidad monoparental.
    const comoSiFueraMinimo = calcularCuotaIntegraGeneral(base, min + red);
    expect(dos(comoSiFueraMinimo - conConjunta)).toBe(dos(red * 0.37 - red * 0.19));
  });
});

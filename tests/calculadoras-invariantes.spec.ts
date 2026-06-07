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

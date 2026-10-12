/**
 * Tests unitarios del motor de simulador-osmosis
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/osmosis-motor.spec.ts
 *
 * R = 8,314462618 J/(mol·K) = 0,0820573661 atm·L/(mol·K) (8,314462618 / 101,325), g = 9,81 m/s²,
 * ρ_agua = 1000 kg/m³. Casos resueltos A MANO (oráculo: si el motor no los da, el motor está mal):
 *
 *   PRESIÓN OSMÓTICA
 *   Glucosa 0,1 M a 25 °C (298,15 K), i = 1
 *     R·T = 0,0820573661 · 298,15 = 24,4654037 atm·L/mol
 *     π   = 0,1 · 24,4654037 = 2,44654037 atm = 1859,37068 mmHg
 *     en Pa: 100 mol/m³ · 8,314462618 · 298,15 = 247.895,703 Pa = 247,895703 kPa
 *     columna de agua: 247.895,703 / (1000 · 9,81) = 25,269695 m
 *
 *   CONCENTRACIÓN EN %
 *   NaCl 0,9 % m/v: 9 g/L / 58,44 = 0,1540041068 M → osm = 2 · M = 0,3080082136 osmol/L
 *   NaCl 3 %:       30 / 58,44 = 0,513347023 M → osm 1,026694045
 *   CaCl₂ 0,05 M:   osm = 3 · 0,05 = 0,15
 *
 *   DOS COMPARTIMENTOS
 *   Glucosa 0,2 M frente a NaCl 0,1 M: 0,2 = 0,2 → el agua no pasa en neto
 *   Sacarosa 0,5 M (A) frente a agua pura (B), 25 °C: el agua va de B a A
 *     Δπ = 0,5 · 24,4654037 = 12,23270185 atm
 *     h  = 500 · 8,314462618 · 298,15 / 9810 = 1.239.478,515 / 9810 = 126,348472 m
 *   Agua (A) frente a CaCl₂ 0,05 M (B): el agua va de A a B
 *
 *   CÉLULA (interior 0,30 osmol/L, banda isotónica ±5 % → de 0,285 a 0,315)
 *   Suero fisiológico 0,308: +2,67 % → isotónico (animal normal, vegetal flácida)
 *   Agua destilada: −100 % → hipotónico, entra agua (animal hinchada, vegetal turgente)
 *     Δπ a 37 °C (310,15 K): 0,30 · 0,0820573661 · 310,15 = 0,30 · 25,45009209 = 7,63502763 atm
 *   NaCl 3 % (1,0267): hipertónico, sale agua (animal crenada, vegetal plasmolizada)
 *   Bordes: 0,315 y 0,285 → isotónico; 0,316 → hipertónico; 0,284 → hipotónico
 *
 *   Datos imposibles (concentración negativa, NaN, temperatura en el cero absoluto, interior 0)
 *   → null.
 */

import { test, expect } from '@playwright/test';
import {
  R_SI,
  R_ATM_L,
  G,
  P_ATM,
  SOLUTOS,
  solutoPorId,
  molaridadDesde,
  osmolaridad,
  aKelvin,
  presionOsmotica,
  compararCompartimentos,
  clasificarMedio,
  celulaEnMedio,
  type Soluto,
} from '../app/simulador-osmosis/motor';

function soluto(id: string): Soluto {
  const s = solutoPorId(id);
  if (!s) throw new Error(`soluto ${id} no existe`);
  return s;
}

test.describe('Constantes y solutos', () => {
  test('R exacta del SI y su valor en atm·L/(mol·K)', () => {
    expect(R_SI).toBe(8.314462618);
    expect(R_ATM_L).toBeCloseTo(0.08205737, 7);
    expect(G).toBe(9.81);
    expect(P_ATM).toBe(101325);
  });

  test('factores de van \'t Hoff ideales: 1, 2 y 3', () => {
    expect(soluto('glucosa').i).toBe(1);
    expect(soluto('sacarosa').i).toBe(1);
    expect(soluto('urea').i).toBe(1);
    expect(soluto('nacl').i).toBe(2);
    expect(soluto('kcl').i).toBe(2);
    expect(soluto('cacl2').i).toBe(3);
  });

  test('ids únicos y masas molares positivas', () => {
    const ids = SOLUTOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOLUTOS) expect(s.masaMolar).toBeGreaterThan(0);
  });
});

test.describe('Concentración y osmolaridad', () => {
  test('NaCl 0,9 % m/v: 0,1540 M y 0,3080 osmol/L', () => {
    const m = molaridadDesde(0.9, 'porcentaje', soluto('nacl'));
    expect(m).toBeCloseTo(0.1540041068, 9);
    expect(osmolaridad(m!, soluto('nacl'))).toBeCloseTo(0.3080082136, 9);
  });

  test('NaCl 3 %: 0,5133 M y 1,0267 osmol/L', () => {
    const m = molaridadDesde(3, 'porcentaje', soluto('nacl'));
    expect(m).toBeCloseTo(0.513347023, 8);
    expect(osmolaridad(m!, soluto('nacl'))).toBeCloseTo(1.026694045, 8);
  });

  test('en mol/L la molaridad es el dato; CaCl₂ 0,05 M da 0,15 osmol/L', () => {
    expect(molaridadDesde(0.05, 'molar', soluto('cacl2'))).toBe(0.05);
    expect(osmolaridad(0.05, soluto('cacl2'))).toBeCloseTo(0.15, 12);
  });

  test('agua pura: concentración 0, osmolaridad 0', () => {
    expect(molaridadDesde(0, 'porcentaje', soluto('glucosa'))).toBe(0);
    expect(osmolaridad(0, soluto('nacl'))).toBe(0);
  });

  test('concentración negativa o no numérica → null', () => {
    expect(molaridadDesde(-0.1, 'molar', soluto('glucosa'))).toBeNull();
    expect(molaridadDesde(Number.NaN, 'porcentaje', soluto('glucosa'))).toBeNull();
    expect(osmolaridad(-1, soluto('nacl'))).toBeNull();
  });
});

test.describe('Presión osmótica', () => {
  test('glucosa 0,1 M a 25 °C: 2,4465 atm, 247,90 kPa y 1859,4 mmHg', () => {
    const p = presionOsmotica(0.1, 25);
    expect(p).not.toBeNull();
    expect(p!.atm).toBeCloseTo(2.44654037, 7);
    expect(p!.pa).toBeCloseTo(247895.703, 2);
    expect(p!.kPa).toBeCloseTo(247.895703, 5);
    expect(p!.mmHg).toBeCloseTo(1859.37068, 4);
  });

  test('0 °C son 273,15 K; el cero absoluto no es una temperatura válida', () => {
    expect(aKelvin(0)).toBeCloseTo(273.15, 12);
    expect(aKelvin(-273.15)).toBeNull();
    expect(presionOsmotica(0.1, -300)).toBeNull();
    expect(presionOsmotica(0.1, Number.NaN)).toBeNull();
  });

  test('agua pura: π = 0', () => {
    expect(presionOsmotica(0, 25)!.atm).toBe(0);
  });
});

test.describe('Dos compartimentos separados por una membrana semipermeable', () => {
  test('glucosa 0,2 M frente a NaCl 0,1 M: misma osmolaridad, sin paso neto', () => {
    const r = compararCompartimentos(0.2, 2 * 0.1, 25);
    expect(r!.sentido).toBe('ninguno');
    expect(r!.diferenciaOsm).toBe(0);
    expect(r!.deltaPi.atm).toBe(0);
    expect(r!.alturaColumna).toBe(0);
  });

  test('sacarosa 0,5 M frente a agua: el agua va de B a A, Δπ 12,23 atm y 126,3 m de columna', () => {
    const r = compararCompartimentos(0.5, 0, 25);
    expect(r!.sentido).toBe('B_a_A');
    expect(r!.deltaPi.atm).toBeCloseTo(12.23270185, 7);
    expect(r!.alturaColumna).toBeCloseTo(126.348472, 5);
  });

  test('glucosa 0,1 M frente a agua: 25,27 m de columna', () => {
    const r = compararCompartimentos(0.1, 0, 25);
    expect(r!.alturaColumna).toBeCloseTo(25.269695, 5);
  });

  test('agua frente a CaCl₂ 0,05 M: el agua va de A a B', () => {
    const r = compararCompartimentos(0, 3 * 0.05, 25);
    expect(r!.sentido).toBe('A_a_B');
    expect(r!.diferenciaOsm).toBeCloseTo(0.15, 12);
  });

  test('el sentido no depende del orden: intercambiar los lados invierte la flecha', () => {
    expect(compararCompartimentos(0.3, 0.1, 20)!.sentido).toBe('B_a_A');
    expect(compararCompartimentos(0.1, 0.3, 20)!.sentido).toBe('A_a_B');
    expect(compararCompartimentos(0.3, 0.1, 20)!.deltaPi.atm).toBeCloseTo(
      compararCompartimentos(0.1, 0.3, 20)!.deltaPi.atm,
      12,
    );
  });

  test('datos imposibles → null', () => {
    expect(compararCompartimentos(-0.1, 0.2, 25)).toBeNull();
    expect(compararCompartimentos(0.1, 0.2, -274)).toBeNull();
  });
});

test.describe('Una célula en un medio', () => {
  test('suero fisiológico frente a glóbulo rojo de 0,30: isotónico, la célula queda normal', () => {
    const osmSuero = 2 * (9 / 58.44);
    const r = celulaEnMedio('animal', 0.3, osmSuero, 37);
    expect(r!.tonicidad).toBe('isotonico');
    expect(r!.agua).toBe('equilibrio');
    expect(r!.estado).toBe('normal');
    expect(r!.diferenciaRelativa).toBeCloseTo(0.026694, 6);
  });

  test('agua destilada: hipotónico, entra agua; animal hinchada, vegetal turgente', () => {
    const animal = celulaEnMedio('animal', 0.3, 0, 37);
    expect(animal!.tonicidad).toBe('hipotonico');
    expect(animal!.agua).toBe('entra');
    expect(animal!.estado).toBe('hinchada');
    expect(animal!.diferenciaRelativa).toBe(-1);
    expect(animal!.deltaPi.atm).toBeCloseTo(7.63502763, 7);
    expect(celulaEnMedio('vegetal', 0.3, 0, 20)!.estado).toBe('turgente');
  });

  test('NaCl 3 %: hipertónico, sale agua; animal crenada, vegetal plasmolizada', () => {
    const osm = 2 * (30 / 58.44);
    const vegetal = celulaEnMedio('vegetal', 0.3, osm, 20);
    expect(vegetal!.tonicidad).toBe('hipertonico');
    expect(vegetal!.agua).toBe('sale');
    expect(vegetal!.estado).toBe('plasmolizada');
    expect(celulaEnMedio('animal', 0.3, osm, 37)!.estado).toBe('crenada');
  });

  test('vegetal en medio isotónico: flácida', () => {
    expect(celulaEnMedio('vegetal', 0.3, 0.3, 20)!.estado).toBe('flacida');
  });

  test('bordes de la banda del ±5 %', () => {
    expect(clasificarMedio(0.3, 0.315)).toBe('isotonico');
    expect(clasificarMedio(0.3, 0.285)).toBe('isotonico');
    expect(clasificarMedio(0.3, 0.316)).toBe('hipertonico');
    expect(clasificarMedio(0.3, 0.284)).toBe('hipotonico');
  });

  test('interior 0 o negativo, o medio negativo → null', () => {
    expect(clasificarMedio(0, 0.3)).toBeNull();
    expect(clasificarMedio(-0.3, 0.3)).toBeNull();
    expect(clasificarMedio(0.3, -0.1)).toBeNull();
    expect(celulaEnMedio('animal', 0.3, 0.3, -300)).toBeNull();
  });
});

/**
 * Candado de la tarifa estatal del ISD — art. 21.2 de la Ley 29/1987
 *
 * Ejecutar con: npm run test:calc
 *
 * DE DÓNDE SALE (hallazgo 735 del Inspector, 11/09/2026)
 * ─────────────────────────────────────────────────────
 * La escala del art. 21 estuvo transcrita a mano DOS veces —`TARIFA_ESTATAL_IS` en la rama de
 * sucesiones y `TARIFA_ESTATAL_ID` en la de donaciones— y las dos copias divergieron. La de
 * sucesiones tenía SIETE tramos y se quedaba en el 25,50 %: umbrales reales del art. 21
 * emparejados con la cuota y el tipo de filas que no les correspondían, de modo que la escala
 * era internamente coherente y legalmente inexistente. Infravaloraba la cuota SIEMPRE, y más
 * cuanto mayor era la herencia.
 *
 * Lo que vigilan estos tests es exactamente lo que falló, y por ese orden:
 *
 *   1. Que la tabla transcrita sea la del BOE, fila a fila. Es lo único que distingue una
 *      escala legal de una escala coherente: la vieja pasaba cualquier prueba de monotonía.
 *   2. Que las dos ramas sigan siendo el MISMO array. Dos copias de un dato normativo existen
 *      precisamente para poder divergir, y ésta ya divergió una vez.
 *   3. Que el motor del MCP (`calcular_sucesiones`) devuelva la cuota de la ley en el caso
 *      concreto del acta, con su coeficiente multiplicador incluido.
 *
 * Un test de monotonía NO habría detectado el fallo, así que aquí no basta con invariantes:
 * hacen falta los valores oficiales.
 */

import { test, expect } from '@playwright/test';

import { TARIFA_ESTATAL_ISD, TARIFA_ESTATAL_IS } from '../data/fiscal/sucesiones';
import { TARIFA_ESTATAL_ID } from '../data/fiscal/donaciones';
import { calcularCuotaIntegraIS, calcularSucesion } from '../lib/calculadoras/sucesiones';

/** La escala del art. 21.2 LISD tal como la publica el BOE, con sus propios redondeos. */
const ESCALA_BOE = [
  { hasta: 7993.46, cuota: 0, tipo: 7.65 },
  { hasta: 15980.91, cuota: 611.5, tipo: 8.5 },
  { hasta: 23968.36, cuota: 1290.43, tipo: 9.35 },
  { hasta: 31955.81, cuota: 2037.26, tipo: 10.2 },
  { hasta: 39943.26, cuota: 2851.98, tipo: 11.05 },
  { hasta: 47930.72, cuota: 3734.59, tipo: 11.9 },
  { hasta: 55918.17, cuota: 4685.1, tipo: 12.75 },
  { hasta: 63905.62, cuota: 5703.5, tipo: 13.6 },
  { hasta: 71893.07, cuota: 6789.79, tipo: 14.45 },
  { hasta: 79880.52, cuota: 7943.98, tipo: 15.3 },
  { hasta: 119757.67, cuota: 9166.06, tipo: 16.15 },
  { hasta: 159634.83, cuota: 15606.22, tipo: 18.7 },
  { hasta: 239389.13, cuota: 23063.25, tipo: 21.25 },
  { hasta: 398777.54, cuota: 40011.04, tipo: 25.5 },
  { hasta: 797555.08, cuota: 80655.08, tipo: 29.75 },
  { hasta: Infinity, cuota: 199291.4, tipo: 34 },
];

test.describe('Tarifa estatal del ISD (art. 21.2 LISD)', () => {
  test('la escala transcrita es la del BOE, fila a fila', () => {
    expect(TARIFA_ESTATAL_ISD).toEqual(ESCALA_BOE);
  });

  test('sucesiones y donaciones comparten la MISMA escala, no dos copias', () => {
    // Identidad de referencia a propósito: si alguien vuelve a transcribirla, esto se rompe
    // aunque los números coincidan el primer día. El fallo de 2026 fue justo ése.
    expect(TARIFA_ESTATAL_IS).toBe(TARIFA_ESTATAL_ISD);
    expect(TARIFA_ESTATAL_ID).toBe(TARIFA_ESTATAL_ISD);
  });

  test('el tipo máximo es el 34 % y entra a partir de 797.555,08 €', () => {
    const ultimo = TARIFA_ESTATAL_ISD[TARIFA_ESTATAL_ISD.length - 1];
    const penultimo = TARIFA_ESTATAL_ISD[TARIFA_ESTATAL_ISD.length - 2];
    expect(ultimo.tipo).toBe(34);
    expect(penultimo.hasta).toBe(797555.08);
    // Es lo que el faqJsonLd de estimador-impuesto-sucesiones lleva diciendo desde el origen
    // («entre el 7,65 % … y el 34 % para importes superiores a 797.555 €») mientras el motor
    // liquidaba otra cosa: la señal que leen las IAs y el cálculo vuelven a ser lo mismo.
    expect(TARIFA_ESTATAL_ISD[0].tipo).toBe(7.65);
  });

  test('cuota íntegra en un tramo intermedio: 100.000 € de base liquidable', () => {
    // Tramo «hasta 119.757,67»: 9.166,06 + 16,15 % de (100.000 − 79.880,52) = 12.415,36 €.
    // Caso discriminante: la escala corta lo mandaba al tramo del 10,20 % y daba 9.179,59 €.
    expect(calcularCuotaIntegraIS(100000, TARIFA_ESTATAL_ISD)).toBeCloseTo(12415.36, 2);
  });

  test('hallazgo 735: Madrid · Grupo IV · 800.000 € en cuentas', () => {
    const r = calcularSucesion({
      baseImponible: 800000,
      ccaa: 'madrid',
      grupo: 'IV',
      incluyeAjuar: true,
    });

    // Ajuar del 3 % → base imponible 824.000 €. El Grupo IV no tiene reducción por
    // parentesco, así que la base liquidable es la misma.
    expect(r.baseImponibleConAjuar).toBeCloseTo(824000, 2);
    expect(r.baseLiquidable).toBeCloseTo(824000, 2);

    // Último tramo: 199.291,40 + 34 % de (824.000 − 797.555,08) = 208.282,67 €.
    expect(r.cuotaIntegra).toBeCloseTo(208282.67, 2);
    expect(r.coeficienteMultiplicador).toBe(2);

    // 208.282,67 × 2. El acta del Inspector anotó 416.565,35 porque multiplicó la cuota
    // íntegra SIN redondear (208.282,6728 × 2 = 416.565,3456). El motor la redondea antes,
    // que es lo que hace la autoliquidación: la cuota íntegra es una magnitud que se consigna
    // en céntimos. De ahí el céntimo de diferencia, que no es el defecto.
    expect(r.cuotaTributaria).toBeCloseTo(416565.34, 2);

    // Madrid no bonifica al Grupo IV: la cuota final es la tributaria.
    expect(r.cuotaFinal).toBeCloseTo(416565.34, 2);

    // El defecto daba 278.585,05 €, casi 138.000 € por debajo de lo que exige la ley.
    expect(r.cuotaFinal).toBeGreaterThan(278585.05);
  });

  test('cada columna `cuota` cuadra con el tramo anterior, salvo el redondeo del BOE', () => {
    /**
     * La cuota declarada al abrir un tramo tiene que ser la que deja el tramo anterior al
     * agotarse. Medido sobre la tabla vigente, la mayor discrepancia son 0,0045 € —los
     * redondeos a céntimo con los que la ley publica la columna—, así que un céntimo de
     * tolerancia basta y sobra.
     *
     * No es monotonía decorativa: es la prueba de que cada fila lleva emparejados SU umbral,
     * SU cuota y SU tipo. La escala corta que estuvo en producción fallaba aquí por 2,33 € en
     * el borde de los 79.881,18 €, porque sus umbrales eran reales pero la cuota y el tipo
     * venían de otras filas.
     */
    let prevHasta = 0;
    for (const tramo of TARIFA_ESTATAL_ISD) {
      const cuotaQueDejaElAnterior = calcularCuotaIntegraIS(prevHasta, TARIFA_ESTATAL_ISD);
      expect(Math.abs(tramo.cuota - cuotaQueDejaElAnterior)).toBeLessThanOrEqual(0.01);
      prevHasta = tramo.hasta;
      if (prevHasta === Infinity) break;
    }
  });
});

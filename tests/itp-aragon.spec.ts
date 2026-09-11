/**
 * Aragón — escala del art. 121-1 y bonificaciones en cuota de los arts. 121-4, 121-5 y 160-3
 *
 * Test unitario del motor `data/itp-ccaa.ts`. Ejecutar:
 *   npx playwright test tests/itp-aragon.spec.ts
 *
 * DE DÓNDE SALE
 * ─────────────
 * Triaje fiscal del 11/09/2026. El cotejo de las dos tablas de ITP dejó a Aragón como la
 * única comunidad que no cuadraba: `data/fiscal` publicaba un tipo reducido del 5 % y
 * `data/itp-ccaa.ts` calculaba con un 6 %. Al abrir la norma resultó que **ninguno de los
 * dos existe**: Aragón no tiene tipos reducidos por colectivo, tiene una bonificación del
 * 12,5 % sobre la cuota (art. 121-4), que sobre el 8 % general deja el efectivo en el 7 %.
 *
 * El error salía por dos canales distintos y con dos cifras distintas. Para un joven de
 * menos de 35 años comprando por 100.000 €:
 *   · MCP de Delegum, Action del GPT y `estimador-compraventa-inmueble`, que leen el campo
 *     `reducido` de `data/fiscal` → 5.000 €;
 *   · las 7 apps del clúster de compraventa, que leen `ITP_CCAA` → 6.000 €;
 *   · lo que dice la norma → 7.000 €.
 *
 * Además, a los tramos les faltaban los tres escalones intermedios (8,5 / 9 / 9,5 %), así
 * que toda vivienda entre 400.000 y 750.000 € liquidaba de más.
 *
 * Todo lo que se comprueba aquí está verificado contra el texto consolidado del BOE
 * (`BOA-d-2005-90006`), que es fuente de nivel 1 del §1.0 del manifiesto. El portal
 * tributario de Aragón dice lo mismo, pero es nivel 3 y no sella.
 *
 * QUÉ VIGILA
 * ──────────
 * Que la escala reproduzca las cuotas acumuladas de la tabla oficial, y que los tipos
 * efectivos de los cinco colectivos sigan siendo el resultado de aplicar su bonificación.
 * Si alguien vuelve a escribir «6 %» para los jóvenes, o reintroduce el «municipio rural»
 * como condición de la bonificación general, esto se pone en rojo.
 */

import { test, expect } from '@playwright/test';
import { calcularITP, ITP_CCAA } from '../data/itp-ccaa';
import { TIPOS_ITP_CCAA_2025 } from '../data/fiscal';

const aragon = ITP_CCAA['aragon'];

/** Busca un tipo reducido por su nombre exacto y falla si no está. */
function reducido(nombre: string) {
  const encontrado = aragon.tiposReducidos.find((t) => t.nombre === nombre);
  expect(encontrado, `falta el tipo reducido «${nombre}»`).toBeDefined();
  return encontrado!;
}

test.describe('Aragón — escala del art. 121-1 (cuota acumulada)', () => {
  // Los cuatro cortes de la tabla oficial del art. 121-1. Resueltos a mano:
  //   400.000 → 400.000 × 8 %                                  = 32.000,00
  //   450.000 → 32.000 + 50.000 × 8,5 %  = 32.000 + 4.250       = 36.250,00
  //   500.000 → 36.250 + 50.000 × 9 %    = 36.250 + 4.500       = 40.750,00
  //   750.000 → 40.750 + 250.000 × 9,5 % = 40.750 + 23.750      = 64.500,00
  const cortes: Array<[number, number]> = [
    [400000, 32000],
    [450000, 36250],
    [500000, 40750],
    [750000, 64500],
  ];

  for (const [valor, cuota] of cortes) {
    test(`${valor.toLocaleString('es-ES')} € liquidan ${cuota.toLocaleString('es-ES')} €`, () => {
      expect(calcularITP(valor, 'aragon')).toBeCloseTo(cuota, 2);
    });
  }

  test('por encima de 750.000 € el exceso va al 10 %', () => {
    // 1.000.000 → 64.500 + 250.000 × 10 % = 64.500 + 25.000 = 89.500
    expect(calcularITP(1000000, 'aragon')).toBeCloseTo(89500, 2);
  });

  test('dentro del primer tramo es el 8 % liso', () => {
    expect(calcularITP(100000, 'aragon')).toBeCloseTo(8000, 2);
    expect(calcularITP(200000, 'aragon')).toBeCloseTo(16000, 2);
  });

  test('REGRESIÓN: los tres escalones intermedios existen', () => {
    // El fallo de origen era una escala de dos tramos, que daba 42.000 € sobre 500.000 €.
    expect(aragon.tramosProgresivos).toHaveLength(5);
    expect(calcularITP(500000, 'aragon')).not.toBeCloseTo(42000, 2);
  });
});

test.describe('Aragón — bonificaciones en cuota como tipo efectivo', () => {
  test('art. 121-4: los tres colectivos del 12,5 % quedan en el 7 %', () => {
    // 8 % × (1 − 0,125) = 7 %. Exacto mientras el techo de 100.000 € del propio artículo
    // mantenga la operación dentro del primer tramo, que llega a 400.000 €.
    for (const nombre of ['Jóvenes < 35 años', 'Discapacidad ≥65%', 'Víctimas de violencia de género']) {
      expect(reducido(nombre).tipo, nombre).toBe(7);
      expect(reducido(nombre).valorMaximo, nombre).toBe(100000);
    }
  });

  test('un joven que compra por 100.000 € paga 7.000 €, no 6.000 ni 5.000', () => {
    const cuota = calcularITP(100000, 'aragon', reducido('Jóvenes < 35 años').tipo);
    expect(cuota).toBeCloseTo(7000, 2);
    // Las dos cifras que salían antes por los dos canales:
    expect(cuota).not.toBeCloseTo(6000, 2);
    expect(cuota).not.toBeCloseTo(5000, 2);
  });

  test('art. 121-5: familia numerosa al 50 % queda en el 4 %', () => {
    const fn = reducido('Familia numerosa');
    expect(fn.tipo).toBe(4);
    expect(fn.rentaMaxima).toBe(35000);
  });

  test('art. 160-3: en medio rural sube al 60 % y queda en el 3,2 %', () => {
    expect(reducido('Familia numerosa en medio rural').tipo).toBeCloseTo(3.2, 4);
  });

  test('REGRESIÓN: el medio rural NO es condición de la bonificación general', () => {
    // El error de origen ponía «Municipio rural» entre las condiciones del 50 %. Es al
    // revés: el 50 % no lo pide, y lo que hace el medio rural es subirlo al 60 %.
    const condiciones = reducido('Familia numerosa').condiciones.join(' ').toLowerCase();
    expect(condiciones).not.toContain('rural');
    // Y los requisitos de verdad, que antes no estaban, sí tienen que aparecer.
    expect(condiciones).toContain('vender la anterior vivienda habitual');
    expect(condiciones).toContain('10%');
  });
});

test.describe('Aragón — las dos tablas dicen lo mismo', () => {
  test('el tipo general de data/fiscal es el primer tramo de la escala', () => {
    const ficha = TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'Aragón');
    expect(ficha?.tipo).toBe(8);
    expect(aragon.tramosProgresivos?.[0].tipo).toBe(8);
  });

  test('REGRESIÓN: el reducido publicado coincide con el que calculan las apps', () => {
    // La divergencia de origen: data/fiscal publicaba 5 y el motor calculaba 6, cuando
    // el efectivo del art. 121-4 es 7. El campo `reducido` no es decorativo — entra en el
    // cálculo en lib/calculadoras/compraventa.ts y en gastosCompraInmueble.ts, así que
    // sale por el MCP de Delegum y por la Action del GPT.
    const ficha = TIPOS_ITP_CCAA_2025.find((t) => t.ccaa === 'Aragón');
    expect(ficha?.reducido).toBe(7);
    expect(ficha?.reducido).toBe(reducido('Jóvenes < 35 años').tipo);
  });
});

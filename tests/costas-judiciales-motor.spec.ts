/**
 * Tests del motor de `estimador-costas-judiciales` — lógica pura, sin navegador.
 *
 * Nacen de la reparación de los ocho hallazgos del Inspector del 26/08/2026 sobre una app
 * de RIESGO 1. Al reparar aparecieron tres defectos normativos que el acta no recogía y que
 * pesan más que varios de los que sí: la app citaba un real decreto derogado, cobraba una
 * tasa anulada por el Tribunal Constitucional y usaba el umbral del juicio verbal anterior
 * a la reforma de 2025. Los tres se comprueban aquí.
 *
 * Todos los valores esperados están resueltos a mano ANTES de ejecutar nada, contra el texto
 * consolidado del BOE:
 *   · RD 434/2024 (arancel de la Procura), arts. 1.4, 2, 3, 18.d y 24.1
 *   · Ley 10/2012 (tasas), arts. 4 y 7, con la nulidad de la STC 140/2016
 *   · LEC arts. 23.2.1.º, 31.2.1.º, 250.2 y 394.3, tras la LO 1/2025
 *   · Ley 37/1992 (IVA), tipo general del 21 % sobre servicios profesionales
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts
 */

import { test, expect } from '@playwright/test';

import {
  arancelBaseProcura,
  calcular,
  estimarArancelesProcurador,
  estimarHonorariosAbogado,
  estimarTasas,
} from '../app/estimador-costas-judiciales/motor';
import { parseSpanishNumber } from '../lib/formatters';

/** Los importes se comparan al céntimo salvo que se diga otra cosa. */
const CENTIMO = 0.005;

// ─── Arancel de la Procura (RD 434/2024) ─────────────────────────────────────

test.describe('arancel de la Procura — RD 434/2024, escala del art. 2', () => {
  test('la escala es de escalón plano: la cuantía cae entera en su tramo', () => {
    // Art. 2: importe máximo para las cuantías que «no excedan de» cada peldaño.
    expect(arancelBaseProcura(60)).toBeCloseTo(13.01, 2);
    expect(arancelBaseProcura(60.01)).toBeCloseTo(23.48, 2);
    expect(arancelBaseProcura(2000)).toBeCloseTo(120.49, 2); // tramo «hasta 2.400»
    expect(arancelBaseProcura(15000)).toBeCloseTo(535.5, 2); // tramo «hasta 24.000»
    expect(arancelBaseProcura(30000)).toBeCloseTo(714.0, 2); // tramo «hasta 36.000»
    expect(arancelBaseProcura(600000)).toBeCloseTo(2079.53, 2);
  });

  test('por encima de 600.000 € se suma 15,17 € por cada 6.000 € o fracción (art. 2.2)', () => {
    // Un euro de exceso ya es una fracción entera: 2.079,53 + 15,17.
    expect(arancelBaseProcura(600001)).toBeCloseTo(2094.7, 2);
    // 1.000.000 €: exceso 400.000 → ceil(400000/6000) = 67 fracciones.
    expect(arancelBaseProcura(1000000)).toBeCloseTo(2079.53 + 67 * 15.17, 2);
  });

  test('el tope global del art. 1.4 corta en 75.000 € por profesional y asunto', () => {
    expect(arancelBaseProcura(50_000_000)).toBe(75000);
    expect(estimarArancelesProcurador(50_000_000, 'ordinario', false)).toBe(75000);
  });

  test('el juicio ordinario devenga un 10 % más (art. 18.d)', () => {
    expect(estimarArancelesProcurador(30000, 'ordinario', false)).toBeCloseTo(714.0 * 1.1, 2);
    expect(estimarArancelesProcurador(30000, 'verbal', false)).toBeCloseTo(714.0, 2);
  });

  test('el monitorio tiene concepto propio: 47,25 € por el conjunto (art. 24.1)', () => {
    expect(estimarArancelesProcurador(5000, 'monitorio', false)).toBeCloseTo(47.25, 2);
    expect(estimarArancelesProcurador(500000, 'monitorio', false)).toBeCloseTo(47.25, 2);
  });

  test('la cuantía indeterminada devenga 351,00 € (art. 3), con el 10 % del ordinario', () => {
    expect(estimarArancelesProcurador(0, 'verbal', true)).toBeCloseTo(351.0, 2);
    expect(estimarArancelesProcurador(0, 'ordinario', true)).toBeCloseTo(351.0 * 1.1, 2);
  });

  test('REGRESIÓN: las cifras anteriores superaban el máximo legal en las cuantías altas', () => {
    // Hasta el 26/08/2026 la app daba 1.100 € a 60.000 €, 1.800 € a 150.000 € y 3.000 € a
    // 600.000 €, atribuidos a un RD derogado. El arancel vigente los pone por debajo.
    expect(arancelBaseProcura(60000)).toBeLessThan(1100);
    expect(arancelBaseProcura(150000)).toBeLessThan(1800);
    expect(arancelBaseProcura(600000)).toBeLessThan(3000);
  });
});

// ─── Tasas judiciales (Ley 10/2012 tras la STC 140/2016) ─────────────────────

test.describe('tasas judiciales', () => {
  test('la persona física está exenta siempre, sea cual sea la cuantía (art. 4.2.a)', () => {
    expect(estimarTasas(1000, 'ordinario', 'fisica')).toBe(0);
    expect(estimarTasas(5_000_000, 'ordinario', 'fisica')).toBe(0);
  });

  test('la persona jurídica paga la cuota FIJA de su procedimiento (art. 7.1)', () => {
    expect(estimarTasas(30000, 'verbal', 'juridica')).toBe(150);
    expect(estimarTasas(30000, 'cambiario', 'juridica')).toBe(150);
    expect(estimarTasas(30000, 'ordinario', 'juridica')).toBe(300);
    expect(estimarTasas(30000, 'monitorio', 'juridica')).toBe(100);
    expect(estimarTasas(30000, 'contencioso', 'juridica')).toBe(350);
  });

  test('REGRESIÓN: la cuota variable NO se devenga — es nula desde la STC 140/2016', () => {
    // La app sumaba «0,10 % de la cuantía, con tope 10.000 €» a la cuota fija. Ese apartado
    // 7.2 fue declarado inconstitucional y nulo EN SU TOTALIDAD con efectos del 15/08/2016.
    // Si volviera, la tasa crecería con la cuantía; la prueba es que no crece.
    expect(estimarTasas(1000, 'ordinario', 'juridica')).toBe(300);
    expect(estimarTasas(1_000_000, 'ordinario', 'juridica')).toBe(300);
    expect(estimarTasas(50_000_000, 'ordinario', 'juridica')).toBe(300);
  });

  test('el orden social no devenga tasa en instancia', () => {
    expect(estimarTasas(120000, 'laboral', 'juridica')).toBe(0);
  });

  test('exención objetiva del art. 4.1.c: monitorio y verbal de cantidad hasta 2.000 €', () => {
    // Alcanza también a la persona jurídica, que es lo que la distingue de la del art. 4.2.
    expect(estimarTasas(2000, 'monitorio', 'juridica')).toBe(0);
    expect(estimarTasas(2000, 'verbal', 'juridica')).toBe(0);
    expect(estimarTasas(2000.01, 'monitorio', 'juridica')).toBe(100);
    expect(estimarTasas(2000.01, 'verbal', 'juridica')).toBe(150);
  });
});

// ─── Honorarios de abogado: continuidad ──────────────────────────────────────

test.describe('honorarios de abogado — estimación de mercado, continua', () => {
  test('las anclas se respetan exactamente', () => {
    expect(estimarHonorariosAbogado(2000, 'ordinario')).toEqual({ min: 400, max: 900 });
    expect(estimarHonorariosAbogado(30000, 'ordinario')).toEqual({ min: 1500, max: 4500 });
    expect(estimarHonorariosAbogado(600000, 'ordinario')).toEqual({ min: 6000, max: 20000 });
  });

  test('entre anclas se interpola: 24.000 € cae al 60 % del tramo 15.000-30.000', () => {
    // t = (24000 - 15000) / (30000 - 15000) = 0,6
    const h = estimarHonorariosAbogado(24000, 'ordinario');
    expect(h.min).toBeCloseTo(1000 + 0.6 * 500, 6); // 1.300
    expect(h.max).toBeCloseTo(3000 + 0.6 * 1500, 6); // 3.900
  });

  test('REGRESIÓN del hallazgo 420: un euro ya no dispara la estimación un 61 %', () => {
    // Antes: 600.000 € → 6.000-20.000 y 600.001 € → 10.000-35.000, de golpe.
    const a = estimarHonorariosAbogado(600000, 'ordinario');
    const b = estimarHonorariosAbogado(600001, 'ordinario');
    expect(b.min - a.min).toBeLessThan(0.02);
    expect(b.max - a.max).toBeLessThan(0.02);
  });

  test('la extrapolación reproduce el 10.000-35.000 € que el escalón daba de golpe', () => {
    // Tipo marginal del último tramo cerrado: (6000-4000)/450000 y (20000-12000)/450000.
    // El mínimo alcanza 10.000 € hacia 1.500.000 € y el máximo 35.000 € hacia 1.443.750 €.
    expect(estimarHonorariosAbogado(1_500_000, 'ordinario').min).toBeCloseTo(10000, 0);
    expect(estimarHonorariosAbogado(1_443_750, 'ordinario').max).toBeCloseTo(35000, 0);
  });

  test('cada tipo de procedimiento usa su propia tabla', () => {
    expect(estimarHonorariosAbogado(1500, 'monitorio')).toEqual({ min: 200, max: 500 });
    expect(estimarHonorariosAbogado(6000, 'laboral')).toEqual({ min: 600, max: 1500 });
    expect(estimarHonorariosAbogado(6000, 'ordinario')).toEqual({ min: 600, max: 1500 });
  });
});

// ─── Cálculo completo ────────────────────────────────────────────────────────

test.describe('cálculo completo', () => {
  test('CASO 1 · ordinario, persona física, 30.000 €, sin perito', () => {
    const r = calcular({ cuantia: 30000, tipo: 'ordinario', persona: 'fisica', incluirPerito: false });

    expect(r.abogado).toEqual({ min: 1500, max: 4500 });
    expect(r.procurador).toBeCloseTo(714.0 * 1.1, 2); // 785,40
    expect(r.tasas).toBe(0);
    expect(r.perito).toBe(0);

    // El IVA va sobre abogado + procurador + perito, NUNCA sobre las tasas.
    expect(r.baseImponible.min).toBeCloseTo(1500 + 785.4, 2);
    expect(r.baseImponible.max).toBeCloseTo(4500 + 785.4, 2);
    expect(r.iva.min).toBeCloseTo(2285.4 * 0.21, 2);
    expect(r.iva.max).toBeCloseTo(5285.4 * 0.21, 2);
    expect(r.total.min).toBeCloseTo(2285.4 * 1.21, 2);
    expect(r.total.max).toBeCloseTo(5285.4 * 1.21, 2);

    // El tope del art. 394.3 sobre 30.000 € son 10.000 €: no llega a morder.
    expect(r.limiteCostas).toBeCloseTo(10000, 2);
    expect(r.limiteCostasMuerde).toBe(false);
  });

  test('CASO 2 · verbal, persona física, 2.000 €: el abogado no es preceptivo y el tercio muerde', () => {
    const r = calcular({ cuantia: 2000, tipo: 'verbal', persona: 'fisica', incluirPerito: false });

    // Arts. 23.2.1.º y 31.2.1.º LEC: hasta 2.000 € se puede comparecer por sí mismo.
    expect(r.abogadoOpcional).toBe(true);
    expect(r.abogado.min).toBe(0);
    expect(r.abogado.max).toBe(900);
    expect(r.procurador).toBe(0);
    expect(r.tasas).toBe(0);
    expect(r.total.min).toBe(0);
    expect(r.total.max).toBeCloseTo(900 * 1.21, 2);

    // El caso que el acta señalaba: el tercio (666,67 €) queda por debajo del máximo de
    // abogado (900 €), así que la exposición real del perdedor es menor de lo que parece.
    expect(r.limiteCostas).toBeCloseTo(2000 / 3, 2);
    expect(r.limiteCostasMuerde).toBe(true);
  });

  test('CASO 3 · verbal, 2.001 €: cruzar el umbral hace preceptivos abogado y procurador', () => {
    const r = calcular({ cuantia: 2001, tipo: 'verbal', persona: 'fisica', incluirPerito: false });

    expect(r.abogadoOpcional).toBe(false);
    expect(r.abogado.min).toBeCloseTo(400 + (1 / 4000) * 200, 4);
    expect(r.procurador).toBeCloseTo(120.49, 2); // escalón «hasta 2.400», sin recargo
    expect(r.notas.some(n => n.includes('procurador obligatorio'))).toBe(true);
  });

  test('CASO 4 · monitorio de 1.500 € de una empresa: exento de tasa y sin procurador', () => {
    const r = calcular({ cuantia: 1500, tipo: 'monitorio', persona: 'juridica', incluirPerito: false });

    expect(r.abogadoOpcional).toBe(true);
    expect(r.abogado.min).toBe(0); // hallazgo 418: el mínimo de quien va sin abogado es 0 €
    expect(r.abogado.max).toBe(500);
    expect(r.procurador).toBe(0);
    expect(r.tasas).toBe(0); // art. 4.1.c, exención objetiva
    expect(r.total.max).toBeCloseTo(500 * 1.21, 2);
  });

  test('CASO 5 · cuantía indeterminada: 351 € de arancel y 24.000 € de valoración legal', () => {
    const r = calcular({ cuantia: null, tipo: 'ordinario', persona: 'fisica', incluirPerito: false });

    expect(r.cuantiaIndeterminada).toBe(true);
    expect(r.cuantiaAplicada).toBe(24000); // art. 394.3 LEC tras la LO 1/2025
    expect(r.procurador).toBeCloseTo(351 * 1.1, 2); // art. 3 + art. 18.d
    expect(r.limiteCostas).toBeCloseTo(8000, 2);
    expect(r.abogado.min).toBeCloseTo(1300, 6);
    expect(r.abogado.max).toBeCloseTo(3900, 6);
  });

  test('CASO 6 · laboral: sin procurador, sin tasa y con el abogado en el mínimo 0 €', () => {
    const r = calcular({ cuantia: 20000, tipo: 'laboral', persona: 'fisica', incluirPerito: false });

    expect(r.procurador).toBe(0);
    expect(r.tasas).toBe(0);
    expect(r.abogadoOpcional).toBe(true); // art. 18 LRJS
    expect(r.abogado.min).toBe(0);
    expect(r.abogado.max).toBeCloseTo(1500 + (14000 / 24000) * 1500, 6); // 2.375
  });

  test('CASO 7 · el desglose suma el total, con y sin perito', () => {
    for (const incluirPerito of [false, true]) {
      const r = calcular({ cuantia: 45000, tipo: 'ordinario', persona: 'juridica', incluirPerito });
      const baseMin = r.abogado.min + r.procurador + r.perito;
      const baseMax = r.abogado.max + r.procurador + r.perito;

      expect(r.baseImponible.min).toBeCloseTo(baseMin, 6);
      expect(r.total.min).toBeCloseTo(baseMin * 1.21 + r.tasas, 6);
      expect(r.total.max).toBeCloseTo(baseMax * 1.21 + r.tasas, 6);
      // Las tasas entran en el total SIN IVA: son un tributo, no un servicio.
      expect(r.total.min - r.baseImponible.min - r.iva.min).toBeCloseTo(r.tasas, CENTIMO);
    }
  });

  test('CASO 8 · el total crece de forma monótona con la cuantía (no hay escalones locos)', () => {
    let previo = 0;
    for (const cuantia of [1000, 5000, 15000, 15001, 60000, 150000, 599999, 600000, 600001, 900000]) {
      const r = calcular({ cuantia, tipo: 'ordinario', persona: 'fisica', incluirPerito: false });
      expect(r.total.max).toBeGreaterThanOrEqual(previo);
      previo = r.total.max;
    }
  });

  test('CASO 9 · verbal por encima de 15.000 € avisa de que sería un ordinario (art. 250.2)', () => {
    const dentro = calcular({ cuantia: 15000, tipo: 'verbal', persona: 'fisica', incluirPerito: false });
    const fuera = calcular({ cuantia: 15001, tipo: 'verbal', persona: 'fisica', incluirPerito: false });

    expect(dentro.notas.some(n => n.includes('sería un juicio ordinario'))).toBe(false);
    expect(fuera.notas.some(n => n.includes('sería un juicio ordinario'))).toBe(true);
  });
});

// ─── Parser de la cuantía (hallazgo 416) ─────────────────────────────────────

test.describe('lectura de la cuantía', () => {
  test('lo que no es un número se rechaza en vez de colarse por el prefijo', () => {
    // `parseFloat('15000abc')` devolvía 15.000 y la app estimaba sobre esa cifra.
    expect(Number.isNaN(parseSpanishNumber('15000abc'))).toBe(true);
    expect(Number.isNaN(parseSpanishNumber('1e3'))).toBe(true);
    expect(Number.isNaN(parseSpanishNumber('1.2.3'))).toBe(true);
  });

  test('con los dos separadores el último es el decimal', () => {
    // «10,500.00» son diez mil quinientos, no diez con cinco.
    expect(parseSpanishNumber('10,500.00')).toBe(10500);
    expect(parseSpanishNumber('10.500,00')).toBe(10500);
    expect(parseSpanishNumber('10500')).toBe(10500);
  });

  test('las tres lecturas de diez mil quinientos dan la MISMA estimación', () => {
    const esperado = calcular({ cuantia: 10500, tipo: 'verbal', persona: 'fisica', incluirPerito: false });
    for (const escrito of ['10500', '10.500', '10,500.00']) {
      const r = calcular({
        cuantia: parseSpanishNumber(escrito),
        tipo: 'verbal',
        persona: 'fisica',
        incluirPerito: false,
      });
      expect(r.total.min).toBeCloseTo(esperado.total.min, 6);
      expect(r.total.max).toBeCloseTo(esperado.total.max, 6);
    }
  });
});

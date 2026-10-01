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
 *   · RD 434/2024 (arancel de la Procura), arts. 1.4, 2, 3, 18.d, 24.1 y 69
 *   · Ley 10/2012 (tasas), arts. 4, 6.2 y 7, con la nulidad de la STC 140/2016
 *   · LEC arts. 23.2.1.º, 31.2.1.º, 250 y 394.3, tras la LO 1/2025
 *   · LJCA arts. 23 y 139.4 · LRJS arts. 21, 97.3 y 235
 *   · Ley 37/1992 (IVA), tipo general del 21 % sobre servicios profesionales
 *
 * Re-inspección del 01/10/2026 (hallazgos 2550-2557): la tasa del contencioso que el golden de
 * cuotas fijas daba por buena (350 €) estaba anulada; se corrige allí con su razonamiento. Los
 * casos 10 a 16 son los nuevos, cotejados de nuevo contra el BOE en sesión.
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

  test('HALLAZGO 2555 · el contencioso inestimable tiene concepto propio: 351,11 € (art. 69.2.a)', () => {
    // El art. 3 es supletorio: «en aquellos que no tengan fijado expresamente un concepto
    // especial». El art. 69.2 lo fija para el contencioso: 351,11 € ante los Juzgados (a),
    // 451,41 € ante TSJ y AN (b), 401,27 € ante el TS (c). Sin el 10 % del art. 18.d, que es
    // del juicio ordinario civil. Con cuantía determinada, art. 69.1 → art. 2.
    expect(estimarArancelesProcurador(0, 'contencioso', true)).toBeCloseTo(351.11, 2);
    expect(estimarArancelesProcurador(30000, 'contencioso', false)).toBeCloseTo(714.0, 2);
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

  test('la persona jurídica paga la cuota FIJA de su procedimiento civil (art. 7.1)', () => {
    expect(estimarTasas(30000, 'verbal', 'juridica')).toBe(150);
    expect(estimarTasas(30000, 'cambiario', 'juridica')).toBe(150);
    expect(estimarTasas(30000, 'ordinario', 'juridica')).toBe(300);
    expect(estimarTasas(30000, 'monitorio', 'juridica')).toBe(100);
  });

  test('HALLAZGO 2550 · en el contencioso no queda tasa: la STC 140/2016 anuló también la instancia', () => {
    // Este golden decía 350 € hasta el 01/10/2026, y CONSAGRABA el defecto: el fallo de la
    // STC 140/2016 declaró nulos los incisos «abreviado: 200 €; ordinario: 350 €; apelación:
    // 800 €; casación: 1.200 €» del contencioso. El texto consolidado de la Ley 10/2012 los
    // marca en negrilla como anulados. Ni la cuantía ni el tipo de recurso la resucitan.
    expect(estimarTasas(30000, 'contencioso', 'juridica')).toBe(0);
    expect(estimarTasas(18000, 'contencioso', 'juridica')).toBe(0);
    expect(estimarTasas(5_000_000, 'contencioso', 'juridica')).toBe(0);
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
    const aviso = fuera.notas.find(n => n.includes('sería un juicio ordinario')) ?? '';
    expect(aviso).not.toBe('');
    // HALLAZGO 2557 — art. 250.1 LEC: rentas, desahucio, propiedad horizontal… van a verbal
    // «cualquiera que sea su cuantía». El aviso por cuantía tiene que salvarlos.
    expect(aviso).toContain('art. 250.1');
    expect(aviso).toContain('impago de rentas');
  });

  test('CASO 10 · HALLAZGO 2550 · contencioso, empresa, 30.000 €: sin tasa y procurador del art. 2', () => {
    const r = calcular({ cuantia: 30000, tipo: 'contencioso', persona: 'juridica', incluirPerito: false });

    // Abogado: ancla de mercado exacta 1.500 – 4.500. Procurador: art. 69.1 → art. 2, escalón
    // «hasta 36.000» = 714,00, sin el 10 % del art. 18.d. Tasa: 0 (STC 140/2016).
    expect(r.abogado).toEqual({ min: 1500, max: 4500 });
    expect(r.procurador).toBeCloseTo(714.0, 2);
    expect(r.tasas).toBe(0);
    // base 2.214 – 5.214 · ×1,21 → 2.678,94 – 6.308,94
    expect(r.total.min).toBeCloseTo(2678.94, 2);
    expect(r.total.max).toBeCloseTo(6308.94, 2);
    // Art. 23.1 LJCA: ante un Juzgado el procurador es potestativo; se estima, pero se dice.
    expect(r.procuradorPotestativo).toBe(true);
    expect(r.notas.some(n => n.includes('art. 23.1 LJCA'))).toBe(true);
    // Art. 139.4 LJCA: tercio 10.000; abogado 4.500 + procurador 714 = 5.214 → no muerde.
    expect(r.regimenCostas).toBe('ljca');
    expect(r.limiteCostas).toBeCloseTo(10000, 2);
    expect(r.sujetoAlTope).toBeCloseTo(5214, 2);
    expect(r.limiteCostasMuerde).toBe(false);
  });

  test('CASO 11 · HALLAZGO 2551 · verbal, empresa, cuantía indeterminada: tasa de 150 €', () => {
    const r = calcular({ cuantia: null, tipo: 'verbal', persona: 'juridica', incluirPerito: false });

    // La exención del art. 4.1.c es del verbal «en reclamación de cantidad» hasta 2.000 €; lo
    // indeterminado vale 18.000 € para la tasa (art. 6.2) → cuota del verbal, 150 €.
    expect(r.tasas).toBe(150);
    // Honorarios sobre la valoración del art. 394.3 (24.000): t = 0,6 → 1.300 – 3.900.
    // Abogado preceptivo: la excepción de los arts. 23.2.1.º y 31.2.1.º es solo del verbal
    // DETERMINADO por la cuantía hasta 2.000 €. Procurador: art. 3, 351,00, sin recargo.
    expect(r.abogadoOpcional).toBe(false);
    expect(r.abogado.min).toBeCloseTo(1300, 6);
    expect(r.abogado.max).toBeCloseTo(3900, 6);
    expect(r.procurador).toBeCloseTo(351.0, 2);
    // base 1.651 – 4.251 · ×1,21 = 1.997,71 – 5.143,71 · + 150 → 2.147,71 – 5.293,71
    expect(r.total.min).toBeCloseTo(2147.71, 2);
    expect(r.total.max).toBeCloseTo(5293.71, 2);
    // Sin cuantía, la app no puede afirmar que «supera 2.000 €».
    expect(r.notas.some(n => n.includes('Cuantía superior a'))).toBe(false);
    expect(r.notas.some(n => n.includes('Con cuantía indeterminada, abogado y procurador son obligatorios'))).toBe(true);
  });

  test('CASO 12 · HALLAZGO 2552 · monitorio: la petición inicial no exige abogado ni procurador a ninguna cuantía', () => {
    // Arts. 23.2.1.º y 31.2.1.º LEC: «y para la petición inicial de los procedimientos
    // monitorios», sin límite de cuantía. El de 2.000 € es solo del verbal.
    const r = calcular({ cuantia: 5000, tipo: 'monitorio', persona: 'fisica', incluirPerito: false });
    // Anclas del monitorio: 2.000 → 200/500 · 6.000 → 400/1.000; t = 3.000/4.000 = 0,75 → 350/875.
    expect(r.abogadoOpcional).toBe(true);
    expect(r.abogado).toEqual({ min: 0, max: 875 });
    expect(r.procurador).toBe(0);
    expect(r.procuradorOpcional).toBe(true);
    expect(r.total.min).toBe(0);
    expect(r.total.max).toBeCloseTo(875 * 1.21, 2); // 1.058,75

    // Ningún salto en los 2.000 €: el procurador no aparece a 2.000,01 €. La tasa sí cambia,
    // porque la exención del art. 4.1.c (Ley 10/2012) SÍ tiene el límite de 2.000 €.
    const a = calcular({ cuantia: 2000, tipo: 'monitorio', persona: 'juridica', incluirPerito: false });
    const b = calcular({ cuantia: 2000.01, tipo: 'monitorio', persona: 'juridica', incluirPerito: false });
    expect(a.procurador).toBe(0);
    expect(b.procurador).toBe(0);
    expect(a.tasas).toBe(0);
    expect(b.tasas).toBe(100);
  });

  test('CASO 13 · HALLAZGO 2553 · laboral: no hay tope del art. 394.3 porque no hay condena por vencimiento', () => {
    // LRJS art. 97.3: en la instancia, solo mala fe o temeridad, y honorarios hasta 600 € si el
    // condenado es el empresario. El tercio de la LEC no pinta nada aquí.
    const r = calcular({ cuantia: 30000, tipo: 'laboral', persona: 'fisica', incluirPerito: false });
    expect(r.regimenCostas).toBe('lrjs');
    expect(r.limiteCostas).toBeNull();
    expect(r.limiteCostasMuerde).toBe(false);
  });

  test('CASO 14 · HALLAZGOS 2553 y 2555 · contencioso, cuantía indeterminada: 18.000 € y art. 69.2', () => {
    const r = calcular({ cuantia: null, tipo: 'contencioso', persona: 'fisica', incluirPerito: false });

    // Art. 139.4 LJCA: lo indeterminado se valora en 18.000 € (no los 24.000 € de la LEC) → tope 6.000.
    expect(r.cuantiaAplicada).toBe(18000);
    expect(r.limiteCostas).toBeCloseTo(6000, 2);
    // Honorarios sobre 18.000: t = 3.000/15.000 = 0,2 → 1.100 – 3.300.
    expect(r.abogado.min).toBeCloseTo(1100, 6);
    expect(r.abogado.max).toBeCloseTo(3300, 6);
    // Procurador: art. 69.2.a, 351,11 (Juzgado). Tasa: 0.
    expect(r.procurador).toBeCloseTo(351.11, 2);
    expect(r.tasas).toBe(0);
    // base 1.451,11 – 3.651,11 · ×1,21 → 1.755,84 – 4.417,84
    expect(r.total.min).toBeCloseTo(1755.84, 2);
    expect(r.total.max).toBeCloseTo(4417.84, 2);
    // El tope de la LJCA es «una cantidad total»: el procurador entra. 3.300 + 351,11 < 6.000.
    expect(r.sujetoAlTope).toBeCloseTo(3651.11, 2);
    expect(r.limiteCostasMuerde).toBe(false);
    expect(r.notas.some(n => n.includes('art. 69.2 RD 434/2024'))).toBe(true);
  });

  test('CASO 15 · HALLAZGO 2553 · a 4.000 € el procurador decide si el tope muerde, y solo en el contencioso', () => {
    // Abogado (anclas 2.000 → 400/900 · 6.000 → 600/1.500, t = 0,5): 500 – 1.200. Tercio: 1.333,33.
    // Procurador: art. 2, escalón «hasta 4.200» = 169,56.
    // LJCA 139.4 (procurador DENTRO): 1.200 + 169,56 = 1.369,56 > 1.333,33 → muerde.
    // LEC 394.3 (procurador FUERA): 1.200 < 1.333,33 → no muerde.
    const ca = calcular({ cuantia: 4000, tipo: 'contencioso', persona: 'fisica', incluirPerito: false });
    const civil = calcular({ cuantia: 4000, tipo: 'verbal', persona: 'fisica', incluirPerito: false });
    expect(ca.procurador).toBeCloseTo(169.56, 2);
    expect(ca.sujetoAlTope).toBeCloseTo(1369.56, 2);
    expect(ca.limiteCostasMuerde).toBe(true);
    expect(civil.procurador).toBeCloseTo(169.56, 2);
    expect(civil.sujetoAlTope).toBeCloseTo(1200, 6);
    expect(civil.limiteCostasMuerde).toBe(false);
  });

  test('CASO 16 · HALLAZGO 2556 · el perito entra en el tercio del art. 394.3 LEC', () => {
    // «abogados y demás profesionales que no estén sujetos a tarifa o arancel»: el perito no lo
    // está. Verbal 6.000 €: tope 2.000; abogado máx. 1.500 (ancla) + perito 600 (ancla de
    // 15.000 €, que rige por debajo) = 2.100 > 2.000 → muerde. Sin perito, 1.500 < 2.000.
    const con = calcular({ cuantia: 6000, tipo: 'verbal', persona: 'fisica', incluirPerito: true });
    const sin = calcular({ cuantia: 6000, tipo: 'verbal', persona: 'fisica', incluirPerito: false });
    expect(con.perito).toBe(600);
    expect(con.limiteCostas).toBeCloseTo(2000, 2);
    expect(con.sujetoAlTope).toBeCloseTo(2100, 6);
    expect(con.limiteCostasMuerde).toBe(true);
    expect(sin.limiteCostasMuerde).toBe(false);
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

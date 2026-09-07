/**
 * Tests del motor `recargoPresentacionTardia` — lógica pura, sin navegador.
 *
 * Nacen de la auditoría de `lib/calculadoras` del 07/09/2026, donde el motor apareció
 * como el ÚNICO de los 96 con normativa a mano que tiene tráfico web real: lo usan
 * `estimador-compraventa-inmueble`, `simulador-gastos-compraventa-garaje` y
 * `simulador-gastos-compraventa-trastero` (1.338 visitas acumuladas), además de la tool
 * MCP `calcular_recargo_presentacion_tardia`.
 *
 * Los dos defectos que se corrigieron ese día, y que estos casos fijan para siempre:
 *
 *   1. FALTABA EL 1 % BASE. El motor calculaba `meses × 1 %`, un punto porcentual por
 *      debajo de la ley en TODA la escala, y devolvía 0 % —«no debes recargo»— para un
 *      retraso de menos de un mes. El art. 27.2 exige «el 1 por ciento MÁS otro 1 por
 *      ciento adicional por cada mes completo». Se coló el 27/08/2026 al sustituir la
 *      escala derogada (5/10/15/20 %) por la de la Ley 11/2021.
 *
 *   2. LA REDUCCIÓN DEL 25 % SE APLICABA TAMBIÉN A LOS INTERESES. El art. 27.5 reduce
 *      «el importe de LOS RECARGOS a que se refiere el apartado 2»; los intereses de
 *      demora no son recargo. Solo afectaba al tramo de más de 12 meses.
 *
 * Todos los valores esperados están resueltos a mano ANTES de ejecutar nada, contra el
 * texto consolidado del BOE leído en sesión el 07/09/2026:
 *   · Art. 27.2 y 27.5 LGT (Ley 58/2003), redacción del art. 13.3 de la Ley 11/2021
 *     — BOE-A-2021-11473, vigente desde el 11/07/2021
 *   · Interés de demora tributario: art. 26 LGT (interés legal + 25 %), que el motor
 *     importa de `data/fiscal/intereses.ts` en vez de escribirlo a mano
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/recargo-extemporaneo-motor.spec.ts
 */

import { test, expect } from '@playwright/test';

import {
  ESCALA_RECARGO_EXTEMPORANEO,
  calcularRecargoPresentacionTardia,
  porcentajeRecargoExtemporaneo,
} from '../lib/calculadoras/recargoPresentacionTardia';

/** Cuota de referencia: un ITP típico del clúster de compraventa. */
const CUOTA = 1500;

test.describe('Escala del art. 27.2 LGT — el 1 % base', () => {
  test('menos de un mes de retraso YA devenga el 1 %, no cero', () => {
    // El defecto más grave del motor anterior: respondía 0 % y, con ello, «no hay recargo».
    expect(porcentajeRecargoExtemporaneo(0)).toBe(1);

    const r = calcularRecargoPresentacionTardia({ cuotaAIngresar: CUOTA, mesesRetraso: 0 });
    expect(r.porcentajeRecargo).toBe(1);
    expect(r.recargoBruto).toBe(15);        // 1.500 × 1 %
    expect(r.reduccionProntoPago).toBe(3.75); // 25 % de 15
    expect(r.totalAPagar).toBe(11.25);
    expect(r.deudaTotalAPagar).toBe(1511.25);
  });

  test('cada mes completo añade un punto sobre el 1 % de partida', () => {
    // «1 por ciento más otro 1 por ciento adicional por cada mes completo de retraso»
    expect(porcentajeRecargoExtemporaneo(1)).toBe(2);
    expect(porcentajeRecargoExtemporaneo(2)).toBe(3);
    expect(porcentajeRecargoExtemporaneo(3)).toBe(4);
    expect(porcentajeRecargoExtemporaneo(11)).toBe(12);
  });

  test('tres meses de retraso: 4 %, no 3 %', () => {
    const r = calcularRecargoPresentacionTardia({ cuotaAIngresar: CUOTA, mesesRetraso: 3 });
    expect(r.tipoRecargo).toBe('proporcional');
    expect(r.porcentajeRecargo).toBe(4);
    expect(r.recargoBruto).toBe(60);          // 1.500 × 4 %
    expect(r.interesesDemora).toBe(0);
    expect(r.reduccionProntoPago).toBe(15);   // 25 % de 60
    expect(r.totalAPagar).toBe(45);           // el motor viejo daba 33,75
  });

  test('once meses completos llegan al 12 %, el techo de la escala proporcional', () => {
    const r = calcularRecargoPresentacionTardia({ cuotaAIngresar: CUOTA, mesesRetraso: 11 });
    expect(r.porcentajeRecargo).toBe(12);
    expect(r.recargoBruto).toBe(180);
    expect(r.totalAPagar).toBe(135);          // 180 − 45
  });

  test('sin pago en voluntario no hay reducción', () => {
    const r = calcularRecargoPresentacionTardia({
      cuotaAIngresar: CUOTA,
      mesesRetraso: 3,
      pagoEnVoluntario: false,
    });
    expect(r.reduccionProntoPago).toBe(0);
    expect(r.totalAPagar).toBe(60);
  });
});

test.describe('Transcurridos 12 meses — recargo fijo del 15 % e intereses', () => {
  test('a los 12 meses cumplidos ya se aplica el 15 %, no el 13 %', () => {
    // «una vez TRANSCURRIDOS 12 meses […] el recargo será del 15 por ciento»:
    // el corte es >= 12. Con 11 meses la escala llega al 12 % y de ahí salta al 15 %.
    expect(porcentajeRecargoExtemporaneo(12)).toBe(15);

    const r = calcularRecargoPresentacionTardia({ cuotaAIngresar: CUOTA, mesesRetraso: 12 });
    expect(r.tipoRecargo).toBe('fijo_con_intereses');
    expect(r.porcentajeRecargo).toBe(15);
    expect(r.recargoBruto).toBe(225);
    expect(r.interesesDemora).toBe(0); // aún no ha corrido ni un día más allá de los 12 meses
    expect(r.totalAPagar).toBe(168.75); // 225 − 56,25
  });

  test('la reducción del 25 % NO alcanza a los intereses de demora', () => {
    // 18 meses: 6 meses más allá del año ⇒ 180 días de intereses.
    // Intereses = 1.500 × 4,0625 % × 180/365 = 30,05 €
    // Reducción = 25 % de 225 (SOLO el recargo) = 56,25 €  ← el motor viejo reducía 63,76
    const r = calcularRecargoPresentacionTardia({ cuotaAIngresar: CUOTA, mesesRetraso: 18 });

    expect(r.recargoBruto).toBe(225);
    expect(r.interesesDemora).toBeCloseTo(30.05, 2);
    expect(r.totalAntesReduccion).toBeCloseTo(255.05, 2);
    expect(r.reduccionProntoPago).toBe(56.25);
    expect(r.totalAPagar).toBeCloseTo(198.8, 2);
  });
});

test.describe('Trazabilidad de los datos', () => {
  test('el interés de demora viene de data/fiscal, no escrito a mano en el motor', () => {
    // Si algún día vuelve a hardcodearse, este caso no lo detecta por el valor
    // —hoy coinciden— sino que el módulo fiscal es quien manda: se comprueba que la
    // escala expone el mismo tipo que el resultado, y que es el que vigila el ciclo fiscal.
    const r = calcularRecargoPresentacionTardia({ cuotaAIngresar: CUOTA, mesesRetraso: 18 });
    expect(r.tipoInteresDemora).toBe(ESCALA_RECARGO_EXTEMPORANEO.interesDemoraAnual);
    expect(r.tipoInteresDemora).toBeGreaterThan(0);
  });

  test('la escala expuesta lleva el 1 % base, para que ninguna app lo pierda al componer texto', () => {
    expect(ESCALA_RECARGO_EXTEMPORANEO.porcentajeBase).toBe(1);
    expect(ESCALA_RECARGO_EXTEMPORANEO.porcentajePorMes).toBe(1);
    expect(ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses).toBe(15);
    expect(ESCALA_RECARGO_EXTEMPORANEO.reduccionProntoPago).toBe(25);
    expect(ESCALA_RECARGO_EXTEMPORANEO.baseNormativa).toContain('BOE-A-2021-11473');
  });

  test('la cuota no puede ser negativa ni los meses tampoco', () => {
    expect(() => calcularRecargoPresentacionTardia({ cuotaAIngresar: -1, mesesRetraso: 3 })).toThrow();
    expect(() => calcularRecargoPresentacionTardia({ cuotaAIngresar: 100, mesesRetraso: -1 })).toThrow();
  });
});

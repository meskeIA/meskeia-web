/**
 * Tests del motor de `calculadora-subastas-boe` — lógica pura, sin navegador.
 *
 * Los valores esperados están resueltos a mano ANTES de ejecutar nada, contra el texto
 * consolidado del BOE leído el 22/10/2026 (cabecera de `data/fiscal/subastas.ts`):
 *   · Depósito: art. 669.1 LEC (20 %, mínimo 1.000 €, LO 1/2025; 5 % antes) · art. 103 bis.1.b
 *     RGR (5 %) · arts. 117.e-f RGRSS (25 % en sobre, 30 % en el acto)
 *   · Plazo: art. 670.1 LEC (20 días; 40 antes) · art. 101.f RGR (15) · art. 117.g RGRSS (5 hábiles)
 *   · ITP: art. 10.2 TRLITPAJD — el valor de referencia salvo que el precio sea mayor
 *   · Tipos de ITP de Madrid (6 %) y Andalucía (7 %), los de `TIPOS_ITP_CCAA_2025`
 *
 * El caso que justifica la app es el 1: se puja por debajo del valor de referencia y el ITP se
 * paga sobre ese valor, no sobre la puja. Y los casos 8 a 11 son la condición con la que el
 * usuario aceptó hacerla (22/10/2026): lo que depende del inmueble y no se conoce NO entra en
 * el total, que sale incompleto y dice qué le falta.
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts
 */

import { test, expect } from '@playwright/test';

import { calcularSubasta, calcularDeposito, plazoPago, tramoPujaJudicial, type DatosSubasta } from '../app/calculadora-subastas-boe/motor';
import { calcularRegistro } from '../data/itp-ccaa';

/** Caso base: subasta judicial de 2026 en Madrid, deudor particular, todo conocido. */
const BASE: DatosSubasta = {
  regimen: 'judicial',
  inicio: 'desde-reforma',
  modalidadSS: 'sobre',
  valorSubasta: 200000,
  puja: 150000,
  ccaa: 'madrid',
  perfil: 'general',
  viviendaHabitual: false,
  valorReferencia: 180000,
  deudor: 'particular',
  cargasAnteriores: 0,
  deudaComunidad: 1200,
  deudaIbi: 600,
  otrosGastos: 0,
};

test.describe('caso 1 — judicial tras la LO 1/2025, puja por debajo del valor de referencia', () => {
  const r = calcularSubasta(BASE);

  test('depósito del 20 % del valor de subasta: 40.000 €', () => {
    expect(r.deposito.importe).toBe(40000);
    expect(r.deposito.minimoAplicado).toBe(false);
  });

  test('resto a pagar 110.000 € en 20 días desde el cierre', () => {
    expect(r.resto).toBe(110000);
    expect(r.plazo.dias).toBe(20);
  });

  test('una puja del 75 % se aprueba directamente', () => {
    expect(r.porcentajePuja).toBeCloseTo(75, 6);
    expect(r.tramoJudicial).toBe('aprobacion-directa');
  });

  test('el ITP va sobre el valor de referencia (180.000 € × 6 % = 10.800 €), no sobre la puja', () => {
    expect(r.itp.estado).toBe('calculado');
    if (r.itp.estado !== 'calculado') return;
    expect(r.itp.base).toBe(180000);
    expect(r.itp.baseEsValorReferencia).toBe(true);
    expect(r.itp.importe).toBe(10800);
  });

  test('total completo: 150.000 + 10.800 + Registro + 1.200 + 600', () => {
    const registro = calcularRegistro(150000, 'madrid');
    expect(r.registro).toBeCloseTo(registro, 2);
    // A mano, arancel del RD 1427/1989 hasta 150.000 €: 24,04 + 42,07 + 37,56 + 67,42 = 171,09 €,
    // menos el 5 % = 162,54 €; con presentación, nota simple e IVA queda en torno a 200 €
    expect(r.registro).toBeGreaterThan(190);
    expect(r.registro).toBeLessThan(230);
    expect(r.totalConocido).toBeCloseTo(162600 + r.registro, 2);
    expect(r.completo).toBe(true);
    expect(r.pendientes).toEqual([]);
  });
});

test.describe('caso 2 — el mínimo de 1.000 € del depósito judicial', () => {
  test('valor de 4.000 €: el 20 % son 800 €, pero se depositan 1.000 €', () => {
    const d = calcularDeposito({ ...BASE, valorSubasta: 4000 });
    expect(d.importe).toBe(1000);
    expect(d.minimoAplicado).toBe(true);
  });
  test('valor de 5.000 €: el 20 % son justo 1.000 €, sin mínimo que aplicar', () => {
    const d = calcularDeposito({ ...BASE, valorSubasta: 5000 });
    expect(d.importe).toBe(1000);
    expect(d.minimoAplicado).toBe(false);
  });
});

test.describe('casos 3 y 4 — procedimiento judicial anterior a la reforma, o desconocido', () => {
  test('antes del 03/04/2025: 5 % sin mínimo y 40 días', () => {
    const r = calcularSubasta({ ...BASE, inicio: 'antes-reforma' });
    expect(r.deposito.importe).toBe(10000);
    expect(r.resto).toBe(140000);
    expect(r.plazo.dias).toBe(40);
    expect(r.supuestoReforma).toBe(false);
    // 5 % de 4.000 € = 200 €: la redacción anterior no tenía mínimo
    expect(calcularDeposito({ ...BASE, inicio: 'antes-reforma', valorSubasta: 4000 }).importe).toBe(200);
  });
  test('sin saber la fecha se toma el régimen nuevo: más depósito y menos plazo', () => {
    const r = calcularSubasta({ ...BASE, inicio: 'no-lo-se' });
    expect(r.deposito.importe).toBe(40000);
    expect(r.plazo.dias).toBe(20);
    expect(r.supuestoReforma).toBe(true);
  });
});

test.describe('caso 5 — subasta de la Agencia Tributaria', () => {
  const aeat: DatosSubasta = { ...BASE, regimen: 'aeat', valorSubasta: 120000, puja: 10000 };
  test('depósito del 5 % del tipo (6.000 €) y 15 días tras la notificación', () => {
    const r = calcularSubasta(aeat);
    expect(r.deposito.importe).toBe(6000);
    expect(r.resto).toBe(4000);
    expect(r.plazo.dias).toBe(15);
    expect(r.tramoJudicial).toBeNull();
  });
  test('una puja del 8,33 % no llega a la puja mínima del 10 % (12.000 €)', () => {
    const r = calcularSubasta(aeat);
    expect(r.avisos).toContainEqual({ tipo: 'puja-minima-aeat', minimo: 12000 });
    expect(r.avisos.some((a) => a.tipo === 'puja-bajo-deposito')).toBe(false);
  });
});

test.describe('caso 6 — subasta de la Seguridad Social por embargo', () => {
  const ss: DatosSubasta = { ...BASE, regimen: 'seguridad-social', valorSubasta: 100000, puja: 70000 };
  test('en sobre cerrado: 25 % (25.000 €) y 5 días hábiles', () => {
    const r = calcularSubasta(ss);
    expect(r.deposito.importe).toBe(25000);
    expect(r.resto).toBe(45000);
    expect(r.plazo.dias).toBe(5);
    expect(r.avisos).toEqual([]);
  });
  test('de viva voz en el acto: 30 % (30.000 €) y la postura ha de llegar al 75 % (75.000 €)', () => {
    const r = calcularSubasta({ ...ss, modalidadSS: 'en-el-acto' });
    expect(r.deposito.importe).toBe(30000);
    expect(r.avisos).toContainEqual({ tipo: 'postura-verbal-ss', minimo: 75000 });
  });
});

test.describe('caso 7 — puja por encima del valor de referencia', () => {
  test('Andalucía: el ITP va sobre la puja, 150.000 € × 7 % = 10.500 €', () => {
    const r = calcularSubasta({ ...BASE, ccaa: 'andalucia', valorReferencia: 120000 });
    expect(r.itp.estado).toBe('calculado');
    if (r.itp.estado !== 'calculado') return;
    expect(r.itp.base).toBe(150000);
    expect(r.itp.baseEsValorReferencia).toBe(false);
    expect(r.itp.importe).toBe(10500);
  });
});

test.describe('casos 8 a 11 — lo que no se conoce no entra en el total', () => {
  test('8 · sin valor de referencia no hay ITP, y el total lo dice', () => {
    const r = calcularSubasta({ ...BASE, valorReferencia: null });
    expect(r.itp.estado).toBe('sin-valor-referencia');
    expect(r.pendientes).toEqual(['valor-referencia']);
    expect(r.completo).toBe(false);
    expect(r.totalConocido).toBeCloseTo(151800 + r.registro, 2);
  });

  test('9 · en el País Vasco y Navarra no se calcula el ITP: la base es foral', () => {
    for (const ccaa of ['pais-vasco', 'navarra'] as const) {
      const r = calcularSubasta({ ...BASE, ccaa });
      expect(r.itp.estado).toBe('foral');
      expect(r.pendientes).toContain('impuesto-foral');
      expect(r.pendientes).not.toContain('valor-referencia');
      expect(r.completo).toBe(false);
    }
  });

  test('10 · deudor empresa: sin cifra de impuesto, ni siquiera la orientativa', () => {
    const r = calcularSubasta({ ...BASE, deudor: 'empresa' });
    expect(r.itp.estado).toBe('deudor-empresa');
    expect(r.itpSiParticular).toBeNull();
    expect(r.pendientes).toContain('impuesto-deudor');
    expect(r.totalConocido).toBeCloseTo(151800 + r.registro, 2);
  });

  test('10.bis · deudor desconocido: el ITP de particular se da aparte y no suma', () => {
    const r = calcularSubasta({ ...BASE, deudor: 'no-lo-se' });
    expect(r.itp.estado).toBe('deudor-empresa');
    expect(r.itpSiParticular).toBe(10800);
    expect(r.totalConocido).toBeCloseTo(151800 + r.registro, 2);
    expect(r.completo).toBe(false);
  });

  test('11 · cargas, comunidad e IBI sin importe: tres pendientes y fuera del total', () => {
    const r = calcularSubasta({ ...BASE, cargasAnteriores: null, deudaComunidad: null, deudaIbi: null });
    expect(r.pendientes).toEqual(['cargas', 'comunidad', 'ibi']);
    expect(r.totalConocido).toBeCloseTo(160800 + r.registro, 2);
    expect(r.completo).toBe(false);
  });

  test('11.bis · una carga anterior conocida sí suma: se asume con el inmueble', () => {
    const r = calcularSubasta({ ...BASE, cargasAnteriores: 30000, otrosGastos: 2500 });
    expect(r.totalConocido).toBeCloseTo(195100 + r.registro, 2);
    expect(r.completo).toBe(true);
  });
});

test.describe('caso 12 — tramos de la puja judicial (arts. 670 y 671 LEC)', () => {
  test('70 % aprueba; por debajo hay mejora y mínimo; bajo el 40 %, decide el letrado', () => {
    expect(tramoPujaJudicial(70)).toBe('aprobacion-directa');
    expect(tramoPujaJudicial(69.99)).toBe('mejora-y-minimo');
    expect(tramoPujaJudicial(40)).toBe('mejora-y-minimo');
    expect(tramoPujaJudicial(39.99)).toBe('bajo-minimo');
  });
  test('una puja inferior al depósito se avisa', () => {
    const r = calcularSubasta({ ...BASE, puja: 30000 });
    expect(r.avisos).toContainEqual({ tipo: 'puja-bajo-deposito' });
    expect(r.resto).toBe(0);
  });
  test('el plazo de la Seguridad Social no depende de la fecha del procedimiento', () => {
    expect(plazoPago({ regimen: 'seguridad-social', inicio: 'antes-reforma' }).dias).toBe(5);
  });
});

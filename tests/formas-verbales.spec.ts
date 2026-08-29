/**
 * Tests unitarios de la expansión verbal — app/diccionario-rimas/formas-verbales.ts
 *
 * Cada caso viene de una clase real de la morfología española (raíz en
 * vocal fuerte, cambio e→i, cambio o→u, verbo «-eír»...) porque ahí es
 * donde la regla general («raíz + ando/iendo», «raíz + ado/ido») falla y
 * generaría una forma inventada si no estuviera en el mapa de excepciones.
 *
 * Ejecutar: npx playwright test tests/formas-verbales.spec.ts
 */

import { test, expect } from '@playwright/test';

import { formasVerbalesFlexionadas } from '../app/diccionario-rimas/formas-verbales';

test.describe('Formas verbales flexionadas', () => {
  const formas = formasVerbalesFlexionadas();

  test('verbos regulares: raíz + ando/iendo, raíz + ado/ido', () => {
    expect(formas).toContain('cantando');
    expect(formas).toContain('cantado');
    expect(formas).toContain('bailando');
    expect(formas).toContain('bailado');
    expect(formas).toContain('vivido');
    expect(formas).toContain('viviendo');
  });

  test('raíz -er/-ir en vocal fuerte: la i de -iendo se hace y', () => {
    expect(formas).toContain('leyendo');
    expect(formas).toContain('cayendo');
    expect(formas).toContain('oyendo');
    expect(formas).toContain('construyendo');
    // La forma NO derivada («leiendo») nunca debe colarse
    expect(formas).not.toContain('leiendo');
    expect(formas).not.toContain('caiendo');
  });

  test('raíz -ir que cambia e→i en gerundio (pedir, seguir, decir)', () => {
    expect(formas).toContain('pidiendo');
    expect(formas).toContain('siguiendo');
    expect(formas).toContain('diciendo');
    expect(formas).not.toContain('pediendo');
    expect(formas).not.toContain('deciendo');
  });

  test('raíz -ir que cambia e→ie en presente pero e→i en gerundio (sentir, venir)', () => {
    expect(formas).toContain('sintiendo');
    expect(formas).toContain('viniendo');
    expect(formas).not.toContain('sentiendo');
    expect(formas).not.toContain('veniendo');
  });

  test('raíz -ir que cambia o→u en gerundio (dormir, morir)', () => {
    expect(formas).toContain('durmiendo');
    expect(formas).toContain('muriendo');
  });

  test('verbos en -eír: pierden la vocal propia ante el sufijo', () => {
    expect(formas).toContain('riendo');
    expect(formas).toContain('friendo');
    expect(formas).not.toContain('reyendo'); // sería el patrón vocal-fuerte, no el de reír
  });

  test('gerundio regular con participio irregular (poner, ver, abrir)', () => {
    expect(formas).toContain('poniendo');
    expect(formas).toContain('puesto');
    expect(formas).toContain('viendo');
    expect(formas).toContain('visto');
    expect(formas).toContain('abriendo');
    expect(formas).toContain('abierto');
  });

  test('participio en vocal fuerte + ido: hiato con tilde (traer, oír)', () => {
    expect(formas).toContain('traído');
    expect(formas).toContain('oído');
    expect(formas).not.toContain('traido'); // sin tilde, hiato mal escrito
  });

  test('participios tradicionales irregulares (hacer, decir, escribir, romper)', () => {
    expect(formas).toContain('hecho');
    expect(formas).toContain('dicho');
    expect(formas).toContain('escrito');
    expect(formas).toContain('roto');
    expect(formas).toContain('frito');
  });

  test('sin formas repetidas', () => {
    expect(new Set(formas).size).toBe(formas.length);
  });
});

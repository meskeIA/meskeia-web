/**
 * Tests unitarios para `urlParaCompartir` (lib/trackingFrom.ts)
 *
 * Es la URL que sale del botón Compartir del Footer y de la ShareCard. Su
 * defecto no rompía nada visible: solo falseaba la medición, en silencio y
 * durante días, porque el enlace defectuoso sigue circulando después.
 *
 * Los dos primeros casos son los REINYECTADOS del defecto real medido el
 * 04/09/2026 en el dump de Turso: 30 aperturas de un enlace de
 * `simulador-pendulo` compartido desde el Footer, registradas como clics de
 * RelatedApps de `simulador-mas-resorte` — una app que no participó en ninguna
 * de esas visitas — y ninguna contada como compartido.
 *
 * Ejecutar con: npx playwright test tests/url-compartir.spec.ts
 */

import { test, expect } from '@playwright/test';

import { urlParaCompartir } from '../lib/trackingFrom';

/** Lo que hace AnalyticsTracker con la URL de aterrizaje, replicado tal cual. */
function comoLoLeeElTracker(href: string): { ref: string | null; from: string | null } {
  const url = new URL(href);
  const urlParams = new URLSearchParams(url.search);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  return {
    ref: urlParams.get('ref'),
    from: urlParams.get('from') || hashParams.get('from'),
  };
}

test.describe('urlParaCompartir — lo que debe corregir', () => {
  test('compartir desde una app a la que se llegó por RelatedApps', () => {
    const compartida = urlParaCompartir(
      'https://meskeia.com/simulador-pendulo/#from=related-simulador-mas-resorte'
    );

    expect(compartida).toBe('https://meskeia.com/simulador-pendulo/?ref=share');

    // Lo que veía el tracker ANTES: ref nulo y un from que nadie pinchó.
    const leido = comoLoLeeElTracker(compartida);
    expect(leido.ref).toBe('share');
    expect(leido.from).toBeNull();
  });

  test('cura un enlace ya defectuoso que siga circulando', () => {
    // Esta URL es la que produjo los 30 registros: el ?ref=share quedó DENTRO
    // del fragmento, así que no existía como parámetro.
    const fosil = 'https://meskeia.com/simulador-pendulo/#from=related-simulador-mas-resorte?ref=share';
    expect(comoLoLeeElTracker(fosil).ref).toBeNull();
    expect(comoLoLeeElTracker(fosil).from).toBe('related-simulador-mas-resorte?ref=share');

    // Al recompartirlo queda limpio.
    expect(urlParaCompartir(fosil)).toBe('https://meskeia.com/simulador-pendulo/?ref=share');
  });
});

test.describe('urlParaCompartir — lo que NO debe tocar', () => {
  test('una URL limpia solo gana el parámetro', () => {
    expect(urlParaCompartir('https://meskeia.com/estimador-irpf/')).toBe(
      'https://meskeia.com/estimador-irpf/?ref=share'
    );
  });

  test('un ancla de verdad se conserva: forma parte de lo que se comparte', () => {
    const compartida = urlParaCompartir('https://meskeia.com/curso-python/#modulo-3');
    expect(compartida).toBe('https://meskeia.com/curso-python/?ref=share#modulo-3');
    expect(comoLoLeeElTracker(compartida).ref).toBe('share');
  });

  test('la atribución cross-dominio va en query y sobrevive', () => {
    const compartida = urlParaCompartir('https://cronicum.com/historia-roma/?from=meskeia');
    const leido = comoLoLeeElTracker(compartida);
    expect(leido.from).toBe('meskeia');
    expect(leido.ref).toBe('share');
  });

  test('es idempotente: recompartir no duplica el parámetro', () => {
    const unaVez = urlParaCompartir('https://meskeia.com/sonometro/');
    expect(urlParaCompartir(unaVez)).toBe(unaVez);
  });
});

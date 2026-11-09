import { test, expect } from '@playwright/test';
import { repararTextoPdf } from '../app/limpiador-texto/motor';

/**
 * Motor de «Párrafos de PDF» del Limpiador de Texto (S0262, 09/11/2026) — casos resueltos A MANO
 * antes de escribir la vista. Longitudes contadas a mano: la regla del párrafo corta cuando una
 * línea acaba en punto y mide menos del 80 % de la más larga de su bloque, o menos del 50 % y la
 * siguiente empieza en mayúscula.
 */

test.describe('repararTextoPdf', () => {
  test('palabra partida con guion: se quita el guion y se une sin espacio', () => {
    expect(repararTextoPdf('La comunica-\nción es clave.')).toBe('La comunicación es clave.');
  });

  test('compuesto partido en su guion, repetido como manda la RAE: queda UN guion', () => {
    expect(repararTextoPdf('el acuerdo franco-\n-alemán se firmó')).toBe('el acuerdo franco-alemán se firmó');
  });

  test('guion ante mayúscula se conserva, aunque la línea sea muy corta', () => {
    // «anti-» (5) es menos del 50 % de «OTAN y otras siglas» (19): sin la excepción del guion,
    // la regla del título sin punto la habría cortado.
    expect(repararTextoPdf('anti-\nOTAN y otras siglas')).toBe('anti-OTAN y otras siglas');
  });

  test('guion entre cifras se conserva: es un intervalo', () => {
    expect(repararTextoPdf('páginas 3-\n4 y 5')).toBe('páginas 3-4 y 5');
  });

  test('la línea en blanco separa párrafos y se conserva', () => {
    expect(repararTextoPdf('Primera línea del\npárrafo uno.\n\nSegunda parte\nsigue aquí.')).toBe(
      'Primera línea del párrafo uno.\n\nSegunda parte sigue aquí.'
    );
  });

  test('línea corta acabada en punto cierra el párrafo aunque no haya línea en blanco', () => {
    // 53 · 26 · 52 · 16 caracteres: la de 26 acaba en punto y 26 < 0,8 × 53 = 42,4 → corta.
    const entrada = [
      'Este es un párrafo largo que ocupa toda la anchura de',
      'la columna y termina aquí.',
      'Otro párrafo empieza en la línea siguiente y también',
      'acaba con punto.',
    ].join('\n');
    expect(repararTextoPdf(entrada)).toBe(
      'Este es un párrafo largo que ocupa toda la anchura de la columna y termina aquí.\n' +
        'Otro párrafo empieza en la línea siguiente y también acaba con punto.'
    );
  });

  test('línea LARGA acabada en punto no corta: la frase acabó en el borde del renglón', () => {
    // 52 · 51 · 5: la de 52 acaba en punto pero 52 ≥ 0,8 × 52 → sigue el párrafo.
    const entrada = [
      'La primera frase termina justo al final del renglón.',
      'Y el párrafo sigue en la línea siguiente sin cortar',
      'nada.',
    ].join('\n');
    expect(repararTextoPdf(entrada)).toBe(
      'La primera frase termina justo al final del renglón. Y el párrafo sigue en la línea siguiente sin cortar nada.'
    );
  });

  test('las viñetas y los números de lista quedan cada uno en su línea', () => {
    const lista = 'Ingredientes:\n• harina\n• agua\n1. Mezclar\n2. Hornear';
    expect(repararTextoPdf(lista)).toBe(lista);
  });

  test('una inicial en mayúscula no es una viñeta', () => {
    // «A. Pérez» con la regla de letra de lista en mayúscula habría cortado aquí.
    expect(repararTextoPdf('El informe lo firmó el director\nA. Pérez en marzo de ese año.')).toBe(
      'El informe lo firmó el director A. Pérez en marzo de ese año.'
    );
  });

  test('un título en mayúsculas queda en su línea', () => {
    expect(repararTextoPdf('CAPÍTULO 1\nEra una noche oscura y tormentosa en la que nadie\nsalió de casa.')).toBe(
      'CAPÍTULO 1\nEra una noche oscura y tormentosa en la que nadie salió de casa.'
    );
  });

  test('guion blando a final de línea une sin espacio; CRLF y sangrías no estorban', () => {
    expect(repararTextoPdf('  comu­\r\n  nicación clara  ')).toBe('comunicación clara');
    expect(repararTextoPdf('ca­sa grande')).toBe('casa grande');
  });

  test('un texto ya limpio no cambia, y el vacío sigue vacío', () => {
    expect(repararTextoPdf('Un párrafo.\n\nOtro párrafo.')).toBe('Un párrafo.\n\nOtro párrafo.');
    expect(repararTextoPdf('')).toBe('');
  });
});

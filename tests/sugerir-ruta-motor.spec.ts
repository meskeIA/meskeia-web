/**
 * Tests unitarios de lib/sugerirRuta.ts: la redirección de proxy.ts (`rutaCanonica`) y la
 * sugerencia de la página 404 (`sugerirRuta`).
 *
 * Semilla S0278 (16/11/2026). Los casos son URLs REALES: de las 1.132 páginas de meskeia.com con
 * impresiones en Google en 90 días, 118 daban 404 sin haber existido nunca en el repositorio
 * (scratch/gsc-fantasmas.mjs las regenera). Las dos invariantes del final son las que importan
 * para producción: ninguna URL del catálogo puede redirigirse, porque `rutaCanonica` corre en el
 * proxy para todas las peticiones de meskeia.com.
 *
 * Ejecutar con: npm run test:calc (o npx playwright test --config playwright.calc.config.ts tests/sugerir-ruta-motor.spec.ts)
 */

import { test, expect } from '@playwright/test';

import { rutaCanonica, sugerirRuta } from '../lib/sugerirRuta';
import { implementedAppsUrls } from '../data/implemented-apps';

test.describe('rutaCanonica (308 en proxy.ts)', () => {
  const casos: Array<[string, string]> = [
    ['/meskeia.com/generador-anagramas/', '/generador-anagramas/'],
    ['/meskeIA.com/simulador-pendulo/', '/simulador-pendulo/'],
    ['/meskeia-com/simulador-circuitos-electricos/', '/simulador-circuitos-electricos/'],
    ['/meskeia/simulador-gastos-compraventa-garaje/', '/simulador-gastos-compraventa-garaje/'],
    ['/meskeia.com/es/generador-de-anagramas/', '/generador-de-anagramas/'],
    ['/meskeia/', '/'],
    ['/lux%C3%B3metro/', '/luxometro/'],
    ['/luxómetro/', '/luxometro/'],
    ['/son%C3%B3metro/', '/sonometro/'],
    ['/calculadora-sistemas-num%C3%A9ricos/', '/calculadora-sistemas-numericos/'],
    ['/Lupa-Digital', '/lupa-digital/'],
  ];
  for (const [ruta, esperada] of casos) {
    test(`${ruta} → ${esperada}`, () => {
      expect(rutaCanonica(ruta)).toBe(esperada);
    });
  }

  test('no toca una ruta ya canónica, con barra final o sin ella', () => {
    expect(rutaCanonica('/generador-anagramas/')).toBeNull();
    expect(rutaCanonica('/generador-anagramas')).toBeNull();
    expect(rutaCanonica('/')).toBeNull();
    expect(rutaCanonica('/visualizador-historia/roma/')).toBeNull();
  });

  test('no redirige en bucle un carácter codificado (%20)', () => {
    // Comparar con la ruta codificada daría «/a b/», que el navegador vuelve a pedir como «/a%20b/».
    expect(rutaCanonica('/a%20b/')).toBeNull();
  });

  test('una palabra que solo EMPIEZA por meskeia no es el dominio repetido', () => {
    expect(rutaCanonica('/meskeia-ia/')).toBeNull();
    expect(rutaCanonica('/meskeia-generador-tonos/')).toBeNull();
  });

  test('INVARIANTE: ninguna URL del catálogo se redirige', () => {
    const redirigidas = implementedAppsUrls.filter((u) => rutaCanonica(u) !== null);
    expect(redirigidas).toEqual([]);
  });
});

test.describe('sugerirRuta (página 404)', () => {
  const casos: Array<[string, string]> = [
    ['/simulador-compraventa-garaje/', '/simulador-gastos-compraventa-garaje/'],
    ['/simulador-gastso-compraventa-solar/', '/simulador-gastos-compraventa-solar/'],
    ['/simulador-grassos-compraventa-garaje/', '/simulador-gastos-compraventa-garaje/'],
    ['/simulador-compraventa-terreno-rustico/', '/simulador-gastos-compraventa-terreno-rustico/'],
    ['/simulador-arboles-avl/', '/simulador-arboles-bst-avl/'],
    ['/simulador-arvoles-bst-avl/', '/simulador-arboles-bst-avl/'],
    ['/simulator-arboles-bst-avl/', '/simulador-arboles-bst-avl/'],
    ['/guia-tipo-arroz/', '/guia-tipos-arroz/'],
    ['/calculadora-de-regla-de-tres/', '/calculadora-regla-de-tres/'],
    ['/calculadora-mcm-mcd/', '/calculadora-mcd-mcm/'],
    ['/calculadora-jugada-scrabla/', '/calculadora-jugada-scrabble/'],
    ['/conversor-coordinadas/', '/conversor-coordenadas/'],
    ['/simulador-trigonmetria-circulo-unitario/', '/simulador-trigonometria-circulo-unitario/'],
    ['/visualizador-algebra-linear/', '/visualizador-algebra-lineal/'],
    ['/meskeia-generador-tonos/', '/generador-tonos/'],
    ['/simulador-circular/', '/simulador-movimiento-circular/'],
    ['/lux%C3%B3metro/', '/luxometro/'],
  ];
  for (const [ruta, esperada] of casos) {
    test(`${ruta} → ${esperada}`, () => {
      expect(sugerirRuta(ruta, implementedAppsUrls)).toBe(esperada);
    });
  }

  test('una palabra genérica sola no decide nada', () => {
    // Sin el peso por rareza, «/simulador/» proponía el simulador VSEPR y
    // «/simulador-energia-mecanica/» el de genética, por «mecanica» ~ «genetica».
    expect(sugerirRuta('/simulador/', implementedAppsUrls)).toBeNull();
    expect(sugerirRuta('/simulador-energia-mecanica/', implementedAppsUrls)).not.toBe('/simulador-genetica/');
  });

  test('sin parecido suficiente, no sugiere', () => {
    expect(sugerirRuta('/zzzz-qqqq/', implementedAppsUrls)).toBeNull();
    expect(sugerirRuta('/', implementedAppsUrls)).toBeNull();
  });

  test('INVARIANTE: cada URL del catálogo se sugiere a sí misma', () => {
    const fallan = implementedAppsUrls.filter((u) => sugerirRuta(u, implementedAppsUrls) !== u);
    expect(fallan).toEqual([]);
  });
});

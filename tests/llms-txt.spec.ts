/**
 * meskeia.com/llms.txt (app/llms-txt/route.ts): toda URL de meskeia.com que anuncia tiene página.
 *
 * Cabo C0372 (23/10/2026): el fichero se escribía a mano y 66 de sus 105 URLs no tenían página
 * detrás —nombres que nunca existieron (simulador-hipoteca, modelo-130, calculadora-finiquito,
 * tdah-herramientas…) y apps renombradas (calculadora-imc, calculadora-fire)—. Se servía así a los
 * LLM como el mapa de herramientas de meskeIA. `check:enlaces` no lo veía porque solo mira los
 * href literales, y esto son URLs absolutas dentro de una cadena.
 *
 * Desde entonces las listas guardan solo el slug y la ruta lanza un error si no está en el
 * catálogo; este test mira la SALIDA, que es lo que lee el LLM, contra las carpetas de app/.
 *
 * Ejecutar con: npx playwright test tests/llms-txt.spec.ts
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

import { test, expect } from '@playwright/test';

test('C0372 · cada URL de meskeia.com que anuncia llms.txt tiene página en app/', async ({ request }) => {
  const respuesta = await request.get('/llms-txt');
  expect(respuesta.status()).toBe(200);
  const texto = await respuesta.text();

  const rutas = [...new Set([...texto.matchAll(/https:\/\/meskeia\.com(\/[^\s)]*)/g)].map((m) => m[1]))];
  // Que el extractor no se quede mudo: el fichero anuncia decenas de apps.
  expect(rutas.length).toBeGreaterThan(60);

  const sinPagina = rutas.filter((ruta) => {
    // Fuera: la raíz, la API, los ficheros (ai-index.json, sitemap.xml) y el patrón «/{slug}/».
    if (ruta === '/' || ruta.startsWith('/api/') || /\.[a-z]{2,4}$/.test(ruta) || ruta.includes('{')) return false;
    return !existsSync(path.join('app', ruta, 'page.tsx'));
  });
  expect(sinPagina).toEqual([]);
});

/**
 * Tests unitarios para `esVisitaPropia` (lib/esVisitaPropia.ts)
 *
 * Decide el `es_propio` de cada fila que inserta /api/analytics/track. Su defecto no rompía
 * nada visible: contaba como visitante a un test.
 *
 * Caso de origen (acta del digest del 24/10/2026, P1): `tests/analytics-duracion-spa.spec.ts`
 * sortea las tres guardas del tracker y el servidor local, que tiene las credenciales de
 * Turso, escribía sus visitas en producción. 126 filas de calculadora-iva y
 * orientador-iva-espana desde el 16/09, todas con `ip_address = '::ffff::'` (lo que deja la
 * anonimización de `::ffff:127.0.0.1`) y ninguna marcada: la IP excluida es la pública del
 * usuario, no la local. Una IP local solo puede llegar desde el propio PC, así que es
 * propia sin consultar nada.
 *
 * Ejecutar con: npm run test:calc (o npx playwright test --config playwright.calc.config.ts tests/es-visita-propia-motor.spec.ts)
 */

import { test, expect } from '@playwright/test';

import { esVisitaPropia } from '../lib/esVisitaPropia';

/** IP pública excluida, ya anonimizada, como la guarda `analytics_config.ip_excluida`. */
const IP_EXCLUIDA = '83.45.123.0';

test.describe('IP local: siempre propia', () => {
  for (const [origen, anonimizada] of [
    ['::ffff:127.0.0.1', '::ffff::'], // la de las 126 filas: `next dev` en Windows
    ['127.0.0.1', '127.0.0.0'],
    ['::1', 'anonymous'],
  ] as const) {
    test(`${origen} es propia aunque no sea la IP excluida`, () => {
      expect(esVisitaPropia(origen, anonimizada, IP_EXCLUIDA)).toBe(true);
    });

    test(`${origen} es propia aunque no haya IP excluida configurada`, () => {
      expect(esVisitaPropia(origen, anonimizada, null)).toBe(true);
    });
  }
});

test.describe('IP pública: propia solo si es la excluida', () => {
  test('la IP excluida es propia', () => {
    expect(esVisitaPropia('83.45.123.67', '83.45.123.0', IP_EXCLUIDA)).toBe(true);
  });

  test('otra IP no es propia', () => {
    expect(esVisitaPropia('88.10.20.30', '88.10.20.0', IP_EXCLUIDA)).toBe(false);
  });

  test('sin IP excluida configurada, nada es propio', () => {
    expect(esVisitaPropia('83.45.123.67', '83.45.123.0', null)).toBe(false);
  });

  test('sin IP de origen, no es propia', () => {
    expect(esVisitaPropia(null, null, IP_EXCLUIDA)).toBe(false);
  });

  // Un IPv4 mapeado que NO es el bucle local se anonimiza igual que el local ('::ffff::'):
  // la regla mira la IP de origen, no la anonimizada, para no marcar a un visitante real.
  test('un IPv4 mapeado que no es local no es propio', () => {
    expect(esVisitaPropia('::ffff:88.10.20.30', '::ffff::', IP_EXCLUIDA)).toBe(false);
  });
});

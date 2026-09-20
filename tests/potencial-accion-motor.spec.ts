/**
 * Tests unitarios del motor de simulador-potencial-accion
 *
 * Ejecutar: npx playwright test tests/potencial-accion-motor.spec.ts
 *
 * El modelo es un integrador con fuga y umbral: la membrana carga desde V_reposo = −70 mV
 * hacia V_reposo + I con τ = 5 ms, así que un pulso de duración d la lleva a
 *
 *     V(d) = −70 + I·(1 − e^(−d/τ))
 *
 * Resuelto a mano, con τ = 5 ms:
 *
 *     d = 2 ms → 1 − e^(−0,4) = 0,32968   →  I = 16 llega a −64,73 mV
 *                                            I = 40 llega a −56,81 mV
 *     d = 5 ms → 1 − e^(−1,0) = 0,63212   →  I = 23 llega a −55,46 mV  (subumbral)
 *                                            I = 24 llega a −54,83 mV  (dispara)
 *
 * Para cruzar el umbral de −55 mV hacen falta 15/0,32968 = 45,5 u.a. con el pulso de 2 ms
 * —más de lo que el deslizador ofrece (40)— y 15/0,63212 = 23,7 u.a. con el de 5 ms.
 *
 * El hallazgo 978 era justo eso: con el pulso de fábrica de 2 ms la neurona NO PODÍA
 * disparar con ninguna intensidad del deslizador, y la FAQ mandaba probar «14 y luego 16».
 * El 980, que el PA arrancaba siempre en −55 mV aunque el umbral fuera otro.
 */

import { test, expect } from '@playwright/test';
import {
  simular,
  formaPA,
  despolarizacionAlcanzable,
  intensidadUmbral,
  umbralEfectivo,
  V_REPOSO,
  V_PICO,
  REFRACTARIO_RELATIVO,
  type ParametrosSimulacion,
} from '../app/simulador-potencial-accion/motor';

const BASE: ParametrosSimulacion = {
  intensidad: 20,
  duracionEstimulo: 5,
  inicioEstimulo: 5,
  umbral: -55,
  modo: 'unico',
  intervaloSostenido: 10,
};

const correr = (p: Partial<ParametrosSimulacion> = {}) => simular({ ...BASE, ...p });

test.describe('Hallazgo 978 y 979 — la despolarización anunciada es la alcanzable', () => {
  test('un pulso de 2 ms solo recorre el 33 % del camino hacia V_reposo + I', () => {
    expect(despolarizacionAlcanzable(16, 2)).toBeCloseTo(-64.73, 2);
    expect(despolarizacionAlcanzable(40, 2)).toBeCloseTo(-56.81, 2);
    // La asíntota V_reposo + I sería −54 y −30 mV: ninguna de las dos se alcanza.
    expect(despolarizacionAlcanzable(40, 2)).toBeLessThan(V_REPOSO + 40);
  });

  test('con 5 ms recorre el 63 %, y ahí el deslizador ya cruza el umbral', () => {
    expect(despolarizacionAlcanzable(23, 5)).toBeCloseTo(-55.46, 2);
    expect(despolarizacionAlcanzable(24, 5)).toBeCloseTo(-54.83, 2);
  });

  test('la intensidad umbral dice lo que hace falta con cada pulso', () => {
    expect(intensidadUmbral(-55, 2)).toBeCloseTo(45.5, 1); // fuera del deslizador (máx 40)
    expect(intensidadUmbral(-55, 5)).toBeCloseTo(23.7, 1);
    expect(intensidadUmbral(-65, 5)).toBeCloseTo(7.9, 1);
  });

  test('el experimento del todo o nada reproduce con el pulso de fábrica', () => {
    // Es el consejo de la propia FAQ: una intensidad no dispara y la siguiente sí.
    expect(correr({ intensidad: 23 }).spikes).toHaveLength(0);
    expect(correr({ intensidad: 24 }).spikes).toHaveLength(1);
  });

  test('y la ley del todo o nada se cumple: el pico no depende de la intensidad', () => {
    expect(correr({ intensidad: 24 }).alturaMaxAlcanzada).toBeCloseTo(V_PICO, 6);
    expect(correr({ intensidad: 40 }).alturaMaxAlcanzada).toBeCloseTo(V_PICO, 6);
  });

  test('con el pulso corto de 2 ms sigue sin poder dispararse, y es correcto', () => {
    // No es un defecto del modelo: con τ = 5 ms, 2 ms no dan para cruzar. Lo que fallaba
    // era el consejo de la app, que suponía la asíntota instantánea.
    const r = correr({ intensidad: 40, duracionEstimulo: 2 });
    expect(r.spikes).toHaveLength(0);
    expect(r.alturaMaxAlcanzada).toBeCloseTo(-56.7, 1); // la integración discreta llega a −56,70
  });
});

test.describe('Hallazgo 980 (medio) — el PA arranca en el umbral cruzado', () => {
  test('con umbral −65 el trazo no salta 10 mV al disparar', () => {
    const r = correr({ umbral: -65, intensidad: 12 });
    expect(r.spikes).toHaveLength(1);

    const inicio = r.spikes[0].inicio;
    const enElDisparo = r.trayectoria.find((m) => Math.abs(m.t - inicio) < 1e-9)!;
    // Antes valía −55 mV: un salto vertical de 10 mV contra la línea de umbral dibujada.
    expect(enElDisparo.v).toBeCloseTo(-65, 0);
  });

  test('con umbral −45 el trazo no retrocede al disparar', () => {
    const r = correr({ umbral: -45, intensidad: 40 });
    expect(r.spikes).toHaveLength(1);

    const inicio = r.spikes[0].inicio;
    const enElDisparo = r.trayectoria.find((m) => Math.abs(m.t - inicio) < 1e-9)!;
    expect(enElDisparo.v).toBeGreaterThan(-46); // antes bajaba a −55
  });

  test('la plantilla sube desde donde se le diga hasta el pico', () => {
    expect(formaPA(0, -65)).toBe(-65);
    expect(formaPA(0, -45)).toBe(-45);
    expect(formaPA(1.0, -65)).toBeCloseTo(V_PICO, 6); // a 1 ms está en el pico
    expect(formaPA(3.0, -65)).toBeCloseTo(-85, 6); // a 3 ms, en el mínimo de la hiperpolarización
    expect(formaPA(0.5, -65)).toBeCloseTo((-65 + V_PICO) / 2, 6);
    // El pico es el mismo salga de donde salga: es la ley del todo o nada.
    expect(formaPA(0.999, -65)).toBeCloseTo(V_PICO, 0);
    expect(formaPA(0.999, -45)).toBeCloseTo(V_PICO, 0);
  });
});

test.describe('Hallazgo 982 — el refractario relativo existe de verdad', () => {
  test('el umbral queda elevado al terminar el PA y decae', () => {
    expect(umbralEfectivo(-55, null)).toBe(-55); // sin PA previo
    expect(umbralEfectivo(-55, 0)).toBeCloseTo(-40, 6); // +15 mV justo al terminar
    expect(umbralEfectivo(-55, REFRACTARIO_RELATIVO)).toBe(-55); // ya recuperado
    // Y decae de forma monótona por el camino.
    expect(umbralEfectivo(-55, 1)).toBeGreaterThan(umbralEfectivo(-55, 3));
    expect(umbralEfectivo(-55, 3)).toBeGreaterThan(umbralEfectivo(-55, 5));
  });

  test('con estímulo sostenido, más intensidad da más potenciales de acción', () => {
    const sostenido = { modo: 'sostenido' as const, duracionEstimulo: 5, intervaloSostenido: 5 };
    const flojo = correr({ ...sostenido, intensidad: 24 }).spikes.length;
    const fuerte = correr({ ...sostenido, intensidad: 40 }).spikes.length;
    // Antes la frecuencia se topaba: los 8 ms de plantilla eran refractario absoluto puro
    // y ninguna intensidad los acortaba.
    expect(fuerte).toBeGreaterThan(flojo);
  });

  test('pero durante el refractario ABSOLUTO no dispara nada', () => {
    const r = correr({
      modo: 'sostenido',
      duracionEstimulo: 5,
      intervaloSostenido: 5,
      intensidad: 40,
    });
    for (let i = 1; i < r.spikes.length; i++) {
      expect(r.spikes[i].inicio - r.spikes[i - 1].inicio).toBeGreaterThanOrEqual(8);
    }
  });
});

test.describe('El reposo y el estímulo nulo', () => {
  test('sin estímulo la membrana se queda en el reposo', () => {
    const r = correr({ intensidad: 0 });
    expect(r.spikes).toHaveLength(0);
    expect(r.alturaMaxAlcanzada).toBeCloseTo(V_REPOSO, 6);
  });

  test('la trayectoria cubre la ventana entera con el paso declarado', () => {
    const r = correr();
    expect(r.trayectoria).toHaveLength(501); // 50 ms / 0,1 ms + 1
    expect(r.trayectoria[0].t).toBe(0);
    expect(r.trayectoria[r.trayectoria.length - 1].t).toBeCloseTo(50, 6);
  });
});

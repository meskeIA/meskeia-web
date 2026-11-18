/**
 * Tests del motor de informacion-tiempo (lib/calculadoras/franjasTiempo.ts).
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts tests/franjas-tiempo-motor.spec.ts
 *
 * ── Casos resueltos a mano (tramos de 3 h en UTC, como los da /forecast) ──
 *   Madrid (+1 h): UTC 18/11 09,12,15,18,21 · 19/11 00,03,06,09,12
 *     → local 10, 13, 16, 19, 22 del 18 · 01, 04, 07, 10, 13 del 19
 *     día 18: mañana [10] · tarde [13, 16] · noche [19, 22, 01, 04] (la madrugada del 19 es
 *             la noche del 18) · día 19: mañana [07, 10] · tarde [13]
 *     temperaturas 12, 18, 17, 14, 11 | 9, 8, 10, 15, 19
 *       día 18 (natural, 10–22 h): mín 11, máx 18 · noche del 18: 14, 11, 9, 8 → 8 / 14
 *       día 19 (natural, 01–13 h): mín 8, máx 19
 *     tarde del 18: pop 0,2 y 0,7 → 70 % · lluvia 0,5 + 1,25 = 1,75 → 1,8 mm
 *       nubes (803) a las 13 y lluvia (500) a las 16 → manda la lluvia, icono 10d
 *       viento 3 y 5 m/s → 5 × 3,6 = 18 km/h
 *     icono del día 18: el tramo de las 13 locales (el más cercano a las 13)
 *   Nueva York (−5 h): UTC 18/11 12, 18 · 19/11 00, 09, 15
 *     → local 07, 13, 19 del 18 · 04, 10 del 19
 *     el tramo de las 00 UTC del 19 es la noche del 18 en Nueva York (con dt_txt caía en el 19)
 *     día 18: mañana [07] · tarde [13] · noche [19, 04] · día 19: mañana [10]
 *   India (+5 h 30 min): UTC 18/11 00, 03, 21 · 19/11 03
 *     → local 05:30 y 08:30 del 18 · 02:30 y 08:30 del 19
 *     primer día consultado antes de las 6: madrugada [05:30] · mañana [08:30] · noche [02:30 del 19]
 *   40 tramos desde UTC 18/11 09:00, Madrid: el último es UTC 23/11 06:00 = 07:00 del 23
 *     → 6 días locales, se devuelven 5 · noche del 22: 19, 22 del 22 + 01, 04 del 23 = 4 tramos
 */

import { test, expect } from '@playwright/test';
import {
  agruparPronostico,
  fechaHoraLocal,
  pesoCondicion,
  type TramoPronostico,
} from '@/lib/calculadoras/franjasTiempo';

const NUBES = { id: 803, description: 'nubes rotas', icon: '04d' };
const LLUVIA = { id: 500, description: 'lluvia ligera', icon: '10d' };
const DESPEJADO_N = { id: 800, description: 'cielo claro', icon: '01n' };

function tramo(
  dia: number,
  horaUtc: number,
  temp: number,
  extra: Partial<Omit<TramoPronostico, 'dt' | 'main'>> = {}
): TramoPronostico {
  return {
    dt: Date.UTC(2026, 10, dia, horaUtc) / 1000,
    main: { temp },
    weather: [NUBES],
    ...extra,
  };
}

const MADRID = 3600;
const NUEVA_YORK = -18000;
const INDIA = 19800;

test.describe('Franjas del pronóstico — motor', () => {
  const tramosMadrid: TramoPronostico[] = [
    tramo(18, 9, 12),
    tramo(18, 12, 18, { pop: 0.2, rain: { '3h': 0.5 }, wind: { speed: 3 } }),
    tramo(18, 15, 17, { weather: [LLUVIA], pop: 0.7, rain: { '3h': 1.25 }, wind: { speed: 5 } }),
    tramo(18, 18, 14),
    tramo(18, 21, 11),
    tramo(19, 0, 9),
    tramo(19, 3, 8),
    tramo(19, 6, 10),
    tramo(19, 9, 15),
    tramo(19, 12, 19),
  ];

  test('Madrid: reparto en franjas con la hora local', () => {
    const dias = agruparPronostico(tramosMadrid, MADRID);
    expect(dias.map(d => d.clave)).toEqual(['2026-11-18', '2026-11-19']);

    const [d18, d19] = dias;
    expect(d18.franjas.map(f => [f.clave, f.numTramos])).toEqual([
      ['manana', 1],
      ['tarde', 2],
      ['noche', 4],
    ]);
    expect(d19.franjas.map(f => [f.clave, f.numTramos])).toEqual([
      ['manana', 2],
      ['tarde', 1],
    ]);
  });

  test('Madrid: mínimos y máximos del día natural y de la noche', () => {
    const [d18, d19] = agruparPronostico(tramosMadrid, MADRID);
    expect([d18.tempMin, d18.tempMax]).toEqual([11, 18]);
    expect([d19.tempMin, d19.tempMax]).toEqual([8, 19]);
    const noche = d18.franjas.find(f => f.clave === 'noche')!;
    expect([noche.tempMin, noche.tempMax]).toEqual([8, 14]);
    expect(noche.horas).toBe('18–06 h');
  });

  test('Madrid: la tarde da la mayor probabilidad, la lluvia sumada y la condición que manda', () => {
    const tarde = agruparPronostico(tramosMadrid, MADRID)[0].franjas.find(f => f.clave === 'tarde')!;
    expect(tarde.probLluvia).toBe(0.7);
    expect(tarde.precipitacionMm).toBe(1.8);
    expect(tarde.icon).toBe('10d');
    expect(tarde.desc).toBe('lluvia ligera');
    expect(tarde.vientoMaxKmh).toBe(18);
  });

  test('Madrid: el icono del día es el del tramo más cercano a las 13 locales', () => {
    const d18 = agruparPronostico(
      tramosMadrid.map((t, i) => (i === 1 ? { ...t, weather: [DESPEJADO_N] } : t)),
      MADRID
    )[0];
    expect(d18.icon).toBe('01n');
  });

  test('Nueva York: el tramo de las 00 UTC es la noche del día anterior', () => {
    const dias = agruparPronostico(
      [tramo(18, 12, 5), tramo(18, 18, 9), tramo(19, 0, 6), tramo(19, 9, 2), tramo(19, 15, 4)],
      NUEVA_YORK
    );
    expect(dias.map(d => d.clave)).toEqual(['2026-11-18', '2026-11-19']);
    expect(dias[0].franjas.map(f => [f.clave, f.numTramos])).toEqual([
      ['manana', 1],
      ['tarde', 1],
      ['noche', 2],
    ]);
    expect(dias[1].franjas.map(f => [f.clave, f.numTramos])).toEqual([['manana', 1]]);
  });

  test('India (+5:30): madrugada solo en el primer día, y la media hora cuenta', () => {
    expect(fechaHoraLocal(Date.UTC(2026, 10, 18, 0) / 1000, INDIA).hora).toBe(5.5);
    const dias = agruparPronostico(
      [tramo(18, 0, 20), tramo(18, 3, 24), tramo(18, 21, 19), tramo(19, 3, 23)],
      INDIA
    );
    expect(dias[0].franjas.map(f => [f.clave, f.numTramos])).toEqual([
      ['madrugada', 1],
      ['manana', 1],
      ['noche', 1],
    ]);
    expect(dias[0].franjas[0].horas).toBe('00–06 h');
    expect(dias[1].franjas.map(f => f.clave)).toEqual(['manana']);
  });

  test('40 tramos: se devuelven 5 días y la noche del último recoge la madrugada siguiente', () => {
    const inicio = Date.UTC(2026, 10, 18, 9) / 1000;
    const tramos: TramoPronostico[] = Array.from({ length: 40 }, (_, i) => ({
      dt: inicio + i * 3 * 3600,
      main: { temp: 10 },
      weather: [NUBES],
    }));
    const dias = agruparPronostico(tramos, MADRID);
    expect(dias).toHaveLength(5);
    expect(dias[4].clave).toBe('2026-11-22');
    expect(dias[4].franjas.find(f => f.clave === 'noche')!.numTramos).toBe(4);
  });

  test('la precipitación sumada no arrastra colas de coma flotante', () => {
    const [d] = agruparPronostico(
      [tramo(18, 12, 10, { rain: { '3h': 0.1 } }), tramo(18, 15, 10, { snow: { '3h': 0.2 } })],
      0
    );
    expect(d.franjas[0].precipitacionMm).toBe(0.3);
  });

  test('sin probabilidad ni lluvia en la respuesta, la franja da cero', () => {
    const [d] = agruparPronostico([tramo(18, 12, 10)], 0);
    expect(d.franjas[0].probLluvia).toBe(0);
    expect(d.franjas[0].precipitacionMm).toBe(0);
    expect(d.franjas[0].vientoMaxKmh).toBe(0);
  });

  test('peso de las condiciones: tormenta > nieve > lluvia > llovizna > niebla > nubes > despejado', () => {
    const pesos = [211, 601, 500, 300, 741, 804, 801, 800].map(pesoCondicion);
    expect([...pesos].sort((a, b) => b - a)).toEqual(pesos);
    expect(new Set(pesos).size).toBe(pesos.length);
  });
});

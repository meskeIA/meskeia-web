/**
 * Tests del motor de `simulador-conservacion-energia` — física pura, sin navegador.
 *
 * Nacen de la reparación de los hallazgos 357-362 del Inspector (26/08/2026). El defecto de
 * fondo era que la única prueba de la física estaba en el canvas: un dibujo plausible pasa
 * cualquier build, y por eso una app cuya promesa central es «sin fricción, E_c + E_p
 * permanece constante» disipaba 98 J de golpe a los 2,8 s de arrancar con el rozamiento a
 * cero, y le enseñaba al usuario la deriva del integrador rotulada «Energía disipada».
 *
 * Todos los valores esperados están resueltos a mano ANTES de ejecutar nada.
 *
 * Nota de método: los invariantes se resuelven en JavaScript y se aseveran UNA vez. Una
 * primera versión llamaba a `expect()` dentro del bucle de la simulación —cientos de miles
 * de llamadas— y el proceso se comió 900 MB sin llegar a terminar. Un test que no termina no
 * informa de nada.
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts
 */

import { test, expect } from '@playwright/test';

import {
  buscarX,
  crearEstado,
  leer,
  paso,
  rangoAlturas,
  SUELO_ALTURA,
  TRACKS,
  TRACK_IDS,
  type Lectura,
  type Parametros,
  type TrackDef,
} from '../app/simulador-conservacion-energia/motor';

const P: Parametros = { masa: 1, g: 9.8, mu: 0 };
const DT = 1 / 120;

/** Corre la simulación `segundos` con paso fijo y devuelve todas las lecturas. */
function correr(track: TrackDef, altura: number, p: Parametros, segundos: number) {
  const estado = crearEstado(track, altura, p);
  const historia: Lectura[] = [leer(estado, track, p)];
  const n = Math.round(segundos / DT);
  for (let i = 0; i < n; i++) {
    paso(estado, track, p, DT);
    historia.push(leer(estado, track, p));
  }
  return { estado, historia };
}

// ─── Colocación inicial ──────────────────────────────────────────────────────

test.describe('colocación inicial — hallazgo 358', () => {
  test('el rango de alturas de cada pista existe de verdad en su perfil', () => {
    // Los dos extremos del deslizador tienen que ser alturas que la pista alcanza: si el
    // control ofrece un valor que el perfil no tiene, el rótulo miente sobre la pelota.
    const fallos = TRACK_IDS.flatMap(id => {
      const track = TRACKS[id];
      const r = rangoAlturas(track);
      return [r.min, r.max]
        .filter(a => Math.abs(track.y(buscarX(track, a)) - a) >= 0.02)
        .map(a => `${id} a ${a} m`);
    });
    expect(fallos).toEqual([]);

    for (const id of TRACK_IDS) {
      const r = rangoAlturas(TRACKS[id]);
      expect(r.min, id).toBeGreaterThanOrEqual(SUELO_ALTURA);
      expect(r.max, id).toBeGreaterThan(r.min);
    }
  });

  test('REGRESIÓN: el deslizador ya no ofrece 1-12 m en las cuatro pistas', () => {
    // Los mínimos reales de las dos pistas procedurales están por encima de 1 m y sus
    // máximos no coinciden entre sí: el rango fijo era imposible por construcción.
    expect(rangoAlturas(TRACKS.montana_rusa).min).toBeGreaterThan(1);
    expect(rangoAlturas(TRACKS.looping_suave).min).toBeGreaterThan(1);
    // Rampa y valle no llegan a 12 m: su tope es 10.
    expect(rangoAlturas(TRACKS.rampa).max).toBe(10);
    expect(rangoAlturas(TRACKS.valle).max).toBe(10);
  });

  test('REGRESIÓN: alturas distintas dan puntos distintos (la mitad del control no es inerte)', () => {
    // Antes, en montaña rusa, 1, 2, 4 y 6 m daban los cuatro exactamente 6,64 m porque el
    // barrido solo miraba los seis primeros metros de pista.
    const track = TRACKS.montana_rusa;
    const r = rangoAlturas(track);
    const alturas = [r.min, (r.min + r.max) / 2, r.max];
    const posiciones = alturas.map(a => buscarX(track, a));
    expect(new Set(posiciones.map(x => x.toFixed(2))).size).toBe(3);
    const desviaciones = alturas.map((a, i) => Math.abs(track.y(posiciones[i]) - a));
    expect(Math.max(...desviaciones)).toBeLessThan(0.02);
  });

  test('la energía inicial es exactamente m·g·h de la altura que se muestra', () => {
    const errores = TRACK_IDS.flatMap(id => {
      const track = TRACKS[id];
      const r = rangoAlturas(track);
      return [r.min, r.max].map(altura => {
        const l = leer(crearEstado(track, altura, P), track, P);
        return { id, altura, desvio: Math.abs(l.eInicial - P.masa * P.g * l.y), v: l.v, eC: l.eC };
      });
    });
    expect(Math.max(...errores.map(e => e.desvio))).toBeLessThan(1e-9);
    expect(errores.every(e => e.v === 0 && e.eC === 0)).toBe(true);
  });

  test('el valle de fábrica arranca en x = 0 con 98,00 J exactos', () => {
    // y(x) = 0,1·(x−10)² vale 10 en x = 0 · E = 1 · 9,8 · 10 = 98 J
    const l = leer(crearEstado(TRACKS.valle, 10, P), TRACKS.valle, P);
    expect(l.x).toBeCloseTo(0, 6);
    expect(l.y).toBeCloseTo(10, 6);
    expect(l.eInicial).toBeCloseTo(98, 6);
  });
});

// ─── Conservación ────────────────────────────────────────────────────────────

test.describe('conservación de la energía — hallazgos 357 y 360', () => {
  test('sin rozamiento, la energía disipada es EXACTAMENTE cero en toda la simulación', () => {
    const conDisipacion = TRACK_IDS.filter(id => {
      const track = TRACKS[id];
      const { historia } = correr(track, rangoAlturas(track).max, P, 25);
      return historia.some(l => l.eDisipada !== 0);
    });
    expect(conDisipacion).toEqual([]);
  });

  test('sin rozamiento, la energía mecánica NO crece nunca por encima de la inicial', () => {
    // La app declara en su FAQ que ganar energía sin aporte externo es imposible; antes la
    // pantalla la desmentía (98,24 J partiendo de 98,00).
    const excesos = TRACK_IDS.map(id => {
      const track = TRACKS[id];
      const { historia } = correr(track, rangoAlturas(track).max, P, 25);
      return { id, exceso: Math.max(...historia.map(l => l.eTotal)) - historia[0].eInicial };
    });
    expect(excesos.filter(e => e.exceso > 1e-9)).toEqual([]);
  });

  test('REGRESIÓN 357: llegar al final de la pista no disipa la energía cinética', () => {
    // Rampa · h₀ = 10 m: la pelota baja y recorre el suelo llano hasta x = 20, donde antes
    // se paraba en seco y sus 98 J aparecían enteros como «disipados sin fricción».
    const { estado, historia } = correr(TRACKS.rampa, 10, P, 10);
    expect(estado.haRebotado).toBe(true);
    expect(historia.filter(l => l.eDisipada !== 0).length).toBe(0);
    // Y en ningún instante las tres barras caen a cero a la vez.
    expect(Math.min(...historia.map(l => l.eTotal))).toBeGreaterThan(97.9);
  });

  test('en el fondo del valle la velocidad es √(2gh) = 14,00 m/s', () => {
    const { historia } = correr(TRACKS.valle, 10, P, 10);
    const enElFondo = historia.filter(l => l.y < 0.01);
    expect(enElFondo.length).toBeGreaterThan(0);
    const esperada = Math.sqrt(2 * P.g * 10); // 14,00 m/s
    const peor = Math.max(...enElFondo.map(l => Math.abs(Math.abs(l.v) - esperada)));
    expect(peor).toBeLessThan(0.01);
  });

  test('la pelota nunca sube por encima de su altura de partida', () => {
    const subidas = TRACK_IDS.map(id => {
      const track = TRACKS[id];
      const altura = rangoAlturas(track).max;
      const { historia } = correr(track, altura, P, 25);
      return { id, exceso: Math.max(...historia.map(l => l.y)) - altura };
    });
    expect(subidas.filter(s => s.exceso > 1e-6)).toEqual([]);
  });
});

// ─── Rozamiento ──────────────────────────────────────────────────────────────

test.describe('rozamiento', () => {
  const CON_ROCE: Parametros = { masa: 1, g: 9.8, mu: 0.1 };

  test('la energía disipada solo crece: es una integral acumulada, no una resta', () => {
    const { historia } = correr(TRACKS.valle, 10, CON_ROCE, 25);
    let retrocesos = 0;
    for (let i = 1; i < historia.length; i++) {
      if (historia[i].eDisipada < historia[i - 1].eDisipada - 1e-12) retrocesos++;
    }
    expect(retrocesos).toBe(0);
  });

  test('E_mecánica + E_disipada = E_inicial en todo momento', () => {
    const { historia } = correr(TRACKS.rampa, 10, CON_ROCE, 20);
    const peor = Math.max(...historia.map(l => Math.abs(l.eTotal + l.eDisipada - l.eInicial)));
    expect(peor).toBeLessThan(1e-6);
  });

  test('el trabajo del rozamiento es μ·m·g·(recorrido HORIZONTAL) en la rampa', () => {
    // Con N = m·g·cosθ y ds = secθ·dx, el trabajo se reduce al recorrido en x. Bajando los
    // 10 m de rampa: W = 0,1 · 1 · 9,8 · 10 = 9,80 J → E = 98 − 9,80 = 88,20 J
    // → v = √(2 · 88,20 / 1) = 13,28 m/s al pie de la bajada.
    const { historia } = correr(TRACKS.rampa, 10, CON_ROCE, 5);
    const alPie = historia.find(l => l.x >= 10);
    expect(alPie).toBeDefined();
    expect(alPie!.eDisipada).toBeCloseTo(9.8, 1);
    expect(Math.abs(alPie!.v)).toBeCloseTo(13.28, 1);
  });

  test('con rozamiento la pelota acaba parándose y no le queda energía cinética', () => {
    const { historia } = correr(TRACKS.rampa, 10, { masa: 1, g: 9.8, mu: 0.5 }, 60);
    const final = historia[historia.length - 1];
    expect(Math.abs(final.v)).toBeLessThan(0.05);
    expect(final.eC).toBeLessThan(0.01);
  });

  test('el rozamiento nunca disipa más de lo que había, ni deja energía cinética negativa', () => {
    const anomalias = [0.05, 0.2, 0.5, 1].flatMap(mu => {
      const { historia } = correr(TRACKS.valle, 10, { masa: 1, g: 9.8, mu }, 30);
      const deMas = Math.max(...historia.map(l => l.eDisipada - l.eInicial));
      const cineticaNegativa = Math.min(...historia.map(l => l.eC));
      return deMas > 1e-9 || cineticaNegativa < -1e-9 ? [`mu=${mu}`] : [];
    });
    expect(anomalias).toEqual([]);
  });
});

// ─── Robustez ────────────────────────────────────────────────────────────────

test.describe('robustez', () => {
  test('la pelota nunca sale del dominio de su pista', () => {
    const fugas = TRACK_IDS.filter(id => {
      const track = TRACKS[id];
      const { historia } = correr(track, rangoAlturas(track).max, P, 30);
      return historia.some(l => l.x < track.xMin - 1e-9 || l.x > track.xMax + 1e-9);
    });
    expect(fugas).toEqual([]);
  });

  test('ninguna lectura degenera en NaN o Infinity, ni con los mínimos legales', () => {
    const minimos: Parametros = { masa: 0.1, g: 1, mu: 0 };
    const rotas = TRACK_IDS.filter(id => {
      const track = TRACKS[id];
      const { historia } = correr(track, rangoAlturas(track).min, minimos, 25);
      return historia.some(l => Object.values(l).some(v => !Number.isFinite(v)));
    });
    expect(rotas).toEqual([]);
  });

  test('la masa no cambia la trayectoria: solo escala las energías', () => {
    // E ∝ m pero la dinámica no depende de m (a = −g·senθ − μ·g·cosθ).
    const a = correr(TRACKS.valle, 10, { masa: 1, g: 9.8, mu: 0.1 }, 10);
    const b = correr(TRACKS.valle, 10, { masa: 5, g: 9.8, mu: 0.1 }, 10);
    let peorX = 0;
    let peorE = 0;
    for (let i = 0; i < a.historia.length; i += 60) {
      peorX = Math.max(peorX, Math.abs(b.historia[i].x - a.historia[i].x));
      peorE = Math.max(peorE, Math.abs(b.historia[i].eTotal - a.historia[i].eTotal * 5));
    }
    expect(peorX).toBeLessThan(1e-6);
    expect(peorE).toBeLessThan(1e-6);
  });
});

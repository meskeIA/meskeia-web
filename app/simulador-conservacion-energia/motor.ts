/**
 * Motor físico del simulador de conservación de energía.
 *
 * Vive aparte de la vista porque el build no puede ver la física mal: un canvas que dibuja
 * algo plausible pasa cualquier compilación. Sus invariantes se comprueban con casos
 * resueltos a mano en `tests/conservacion-energia-motor.spec.ts`, sin abrir el navegador.
 *
 * ── Por qué el integrador trabaja con ENERGÍA y no con fuerzas ────────────────
 *
 * Hasta el 26/08/2026 la simulación avanzaba con Euler semi-implícito sobre la velocidad,
 * y eso producía dos defectos que el Inspector documentó como hallazgos 357 y 360:
 *
 *   · La deriva del integrador (~0,25 %) se le enseñaba al usuario como «Energía disipada»
 *     en una tarjeta cuya propia nota decía «sin fricción», y la energía mecánica llegaba a
 *     SUPERAR a la inicial — justo lo que la FAQ de la app declara imposible.
 *   · Al topar en el extremo de la pista se hacía `v = 0` de golpe, sin contabilizar esa
 *     energía en ninguna parte: las tres barras caían a cero a la vez y los 98 J aparecían
 *     enteros como disipados a los 2,8 s de arrancar, con el rozamiento a cero.
 *
 * Aquí la energía mecánica es la variable de estado y la velocidad se DERIVA de ella:
 *
 *     E_mec = E_inicial − W_fricción_acumulado
 *     E_c   = E_mec − m·g·y(x)                     (si sale negativa, hay punto de retorno)
 *     |v|   = sqrt(2·E_c/m)
 *
 * Con µ = 0 la conservación es exacta al bit y la energía disipada es exactamente 0, no
 * «0,00 J redondeado». Y la disipación deja de ser una resta de energías —que arrastra
 * cualquier error numérico— para ser lo que físicamente es: el trabajo de la fuerza de
 * rozamiento, µ·m·g·cos(θ)·|Δs|, acumulado paso a paso y por tanto siempre creciente.
 *
 * Los extremos de la pista son TOPES ELÁSTICOS: la pelota rebota conservando su energía en
 * vez de detenerse. Es la única opción que mantiene la promesa central de la app cuando no
 * hay rozamiento, y se dice en pantalla para que el rebote no parezca un fallo.
 */

// ─── Pistas ───────────────────────────────────────────────────────────────────

export type TrackId = 'rampa' | 'valle' | 'montana_rusa' | 'looping_suave';

export interface TrackDef {
  id: TrackId;
  nombre: string;
  icono: string;
  /** Perfil de la pista: altura en metros para cada x. */
  y: (x: number) => number;
  /** Derivada dy/dx del perfil. */
  yPrime: (x: number) => number;
  xMin: number;
  xMax: number;
  xInicial: number;
  altInicialDefault: number;
}

export const TRACKS: Record<TrackId, TrackDef> = {
  rampa: {
    id: 'rampa',
    nombre: 'Rampa',
    icono: '⛷️',
    y: (x) => (x < 10 ? 10 - x : 0),
    yPrime: (x) => (x < 10 ? -1 : 0),
    xMin: 0,
    xMax: 20,
    xInicial: 0,
    altInicialDefault: 10,
  },
  valle: {
    id: 'valle',
    nombre: 'Valle parabólico',
    icono: '🥣',
    y: (x) => 0.1 * (x - 10) * (x - 10),
    yPrime: (x) => 0.2 * (x - 10),
    xMin: 0,
    xMax: 20,
    xInicial: 0,
    altInicialDefault: 10,
  },
  montana_rusa: {
    id: 'montana_rusa',
    nombre: 'Montaña rusa',
    icono: '🎢',
    y: (x) => {
      const decay = Math.max(0, 10 - x * 0.3);
      const oscil = 2.5 * Math.cos(x * 0.7) * Math.exp(-0.05 * x);
      return decay + oscil;
    },
    yPrime: (x) => {
      // Ojo: `decay` es max(0, 10 − 0,3x), cuya derivada es 0 pasados los 33,3 m. El
      // dominio llega a 24, así que dentro de la pista siempre vale −0,3.
      const decayPrime = -0.3;
      const oscilPrime =
        2.5 * (-0.7 * Math.sin(x * 0.7) * Math.exp(-0.05 * x) - 0.05 * Math.cos(x * 0.7) * Math.exp(-0.05 * x));
      return decayPrime + oscilPrime;
    },
    xMin: 0,
    xMax: 24,
    xInicial: 0,
    altInicialDefault: 12.5,
  },
  looping_suave: {
    id: 'looping_suave',
    nombre: 'Doble joroba',
    icono: '🌊',
    y: (x) => 8 - x * 0.2 + 3 * Math.sin(x * 0.5) * Math.exp(-0.04 * x),
    yPrime: (x) => {
      const decayPrime = -0.2;
      const oscilPrime =
        3 * (0.5 * Math.cos(x * 0.5) * Math.exp(-0.04 * x) - 0.04 * Math.sin(x * 0.5) * Math.exp(-0.04 * x));
      return decayPrime + oscilPrime;
    },
    xMin: 0,
    xMax: 24,
    xInicial: 0,
    altInicialDefault: 8,
  },
};

export const TRACK_IDS: TrackId[] = ['rampa', 'valle', 'montana_rusa', 'looping_suave'];

// ─── Alturas que la pista puede dar de verdad ────────────────────────────────

/** Altura inicial mínima que se ofrece, aunque la pista baje hasta el suelo. */
export const SUELO_ALTURA = 1;

export interface RangoAltura {
  min: number;
  max: number;
}

/**
 * Alturas alcanzables de una pista, barriendo su dominio completo y redondeando HACIA
 * DENTRO al múltiplo de `paso` para que ningún valor del deslizador quede fuera del perfil.
 *
 * El hallazgo 358 nació de que el deslizador ofrecía 1-12 m en las cuatro pistas mientras
 * ninguna cubría esa banda: en montaña rusa y doble joroba la mitad baja del recorrido era
 * inerte —1, 2, 4 y 6 m daban los cuatro la misma altura— y en rampa y valle lo era la
 * parte alta. El rótulo seguía afirmando la altura pedida mientras la tarjeta «m·g·h₀»
 * mostraba una energía hasta 6,6 veces mayor. Un control cuyo recorrido no sale de la pista
 * no puede mentir así.
 */
export function rangoAlturas(track: TrackDef, paso = 0.5): RangoAltura {
  let min = Infinity;
  let max = -Infinity;
  for (let x = track.xMin; x <= track.xMax; x += 0.01) {
    const y = track.y(x);
    if (y < min) min = y;
    if (y > max) max = y;
  }
  // Hacia dentro por los dos lados: el extremo del deslizador tiene que existir en la pista.
  // Y con suelo de 1 m: por debajo de eso la pelota apenas se mueve y deja de ser una
  // simulación de nada, aunque el perfil llegue a cero.
  return {
    min: Math.max(SUELO_ALTURA, Math.ceil(min / paso) * paso),
    max: Math.floor(max / paso) * paso,
  };
}

/**
 * Primer x del dominio cuya altura es la pedida. Barre la pista entera —no solo los seis
 * primeros metros, que era el otro lado del hallazgo 358— y afina con bisección sobre el
 * intervalo donde el perfil cruza la altura buscada.
 */
export function buscarX(track: TrackDef, altura: number): number {
  const PASO = 0.01;
  let mejorX = track.xMin;
  let mejorDif = Math.abs(track.y(track.xMin) - altura);

  for (let x = track.xMin; x <= track.xMax; x += PASO) {
    const dif = Math.abs(track.y(x) - altura);
    if (dif < mejorDif) {
      mejorDif = dif;
      mejorX = x;
    }
    // Cruce exacto entre dos muestras: se afina y se devuelve el PRIMERO, que es el que
    // deja a la pelota al principio del recorrido.
    const y0 = track.y(x);
    const y1 = track.y(Math.min(x + PASO, track.xMax));
    if ((y0 - altura) * (y1 - altura) <= 0 && y0 !== y1) {
      let a = x;
      let b = Math.min(x + PASO, track.xMax);
      for (let i = 0; i < 40; i++) {
        const m = (a + b) / 2;
        if ((track.y(a) - altura) * (track.y(m) - altura) <= 0) b = m;
        else a = m;
      }
      return (a + b) / 2;
    }
  }
  return mejorX;
}

// ─── Estado y paso de integración ────────────────────────────────────────────

export interface EstadoFisico {
  /** Posición a lo largo del eje x, en metros. */
  x: number;
  /** Velocidad a lo largo de la curva, con signo. */
  v: number;
  /** Energía mecánica del instante inicial, en julios. */
  energiaInicial: number;
  /** Trabajo acumulado de la fuerza de rozamiento, en julios. Nunca decrece. */
  eDisipada: number;
  /** La pelota ha rebotado en un tope de la pista desde el último reinicio. */
  haRebotado: boolean;
}

export interface Parametros {
  masa: number;
  g: number;
  /** Coeficiente de rozamiento cinético. Con 0 no hay disipación posible. */
  mu: number;
}

export function crearEstado(track: TrackDef, altura: number, p: Parametros): EstadoFisico {
  const x = buscarX(track, altura);
  return {
    x,
    v: 0,
    energiaInicial: p.masa * p.g * track.y(x),
    eDisipada: 0,
    haRebotado: false,
  };
}

/**
 * Avanza la simulación un intervalo dt.
 *
 * La posición y la dirección se integran con las fuerzas; el MÓDULO de la velocidad se
 * recalcula de la energía disponible, de modo que la conservación no depende del error de
 * truncamiento del integrador.
 */
export function paso(estado: EstadoFisico, track: TrackDef, p: Parametros, dt: number): void {
  const { masa, g, mu } = p;
  const s = estado;

  const yp = track.yPrime(s.x);
  const sec = Math.sqrt(1 + yp * yp); // ds/dx

  // Componente de la gravedad a lo largo de la curva.
  const aGrav = (-g * yp) / sec;
  let aFric = 0;
  if (mu > 0 && Math.abs(s.v) > 1e-4) {
    aFric = ((-mu * g) / sec) * Math.sign(s.v);
  }

  const xPrevio = s.x;
  const vTentativa = s.v + (aGrav + aFric) * dt;
  s.x += (vTentativa / sec) * dt;

  // Topes de la pista: rebote ELÁSTICO. Detener la pelota haría desaparecer su energía
  // cinética, que es exactamente el hallazgo 357.
  if (s.x < track.xMin) {
    s.x = track.xMin + (track.xMin - s.x);
    s.v = Math.abs(vTentativa);
    s.haRebotado = true;
  } else if (s.x > track.xMax) {
    s.x = track.xMax - (s.x - track.xMax);
    s.v = -Math.abs(vTentativa);
    s.haRebotado = true;
  } else {
    s.v = vTentativa;
  }

  // Trabajo del rozamiento sobre el recorrido realmente andado: |F_roz| · |Δs|, con
  // |F_roz| = µ·m·g·cos(θ) = µ·m·g/sec. Es una integral acumulada, así que solo crece.
  if (mu > 0) {
    const deltaS = Math.abs(s.x - xPrevio) * sec;
    s.eDisipada += ((mu * masa * g) / sec) * deltaS;
  }

  // La energía mecánica disponible manda sobre el módulo de la velocidad.
  const eMecDisponible = s.energiaInicial - s.eDisipada;
  const eP = masa * g * track.y(s.x);
  const eC = eMecDisponible - eP;

  if (eC <= 0) {
    // Punto de retorno: no había energía para llegar aquí. Se deshace el avance y se
    // invierte el sentido, que es lo que hace una pelota al quedarse sin carrerilla.
    s.x = xPrevio;
    s.v = -Math.sign(s.v || 1) * 0;
    const eCPrevio = eMecDisponible - masa * g * track.y(xPrevio);
    if (eCPrevio > 0) s.v = -Math.sign(vTentativa || 1) * Math.sqrt((2 * eCPrevio) / masa);
  } else {
    s.v = Math.sign(s.v || 1) * Math.sqrt((2 * eC) / masa);
  }

  // Rozamiento fuerte y pelota casi parada en terreno llano: se detiene del todo, y la
  // energía que le quedaba se contabiliza como disipada en vez de evaporarse.
  if (mu > 0 && Math.abs(s.v) < 1e-3 && Math.abs(yp) < 1e-3) {
    s.eDisipada = s.energiaInicial - masa * g * track.y(s.x);
    s.v = 0;
  }
}

// ─── Lectura para la vista ───────────────────────────────────────────────────

export interface Lectura {
  x: number;
  y: number;
  v: number;
  eC: number;
  eP: number;
  eTotal: number;
  eInicial: number;
  eDisipada: number;
}

export function leer(estado: EstadoFisico, track: TrackDef, p: Parametros): Lectura {
  const y = track.y(estado.x);
  const eP = p.masa * p.g * y;
  const eC = 0.5 * p.masa * estado.v * estado.v;
  return {
    x: estado.x,
    y,
    v: estado.v,
    eC,
    eP,
    eTotal: eC + eP,
    eInicial: estado.energiaInicial,
    eDisipada: estado.eDisipada,
  };
}

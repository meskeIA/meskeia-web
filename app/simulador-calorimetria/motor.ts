/**
 * Motor de cálculo de calorimetría.
 *
 * Todo se apoya en una función de entalpía específica H(T) definida a trozos:
 * mientras no hay cambio de estado la energía crece con la pendiente del calor
 * específico, y en cada punto de fusión o ebullición da un salto del tamaño del
 * calor latente. Con esa función, el calor entre dos temperaturas es una simple
 * resta, y la temperatura de equilibrio de una mezcla es la raíz de una función
 * creciente — que se puede buscar por bisección sin encadenar hipótesis a mano.
 *
 * No sabe nada de presentación: devuelve números y deja el formato a la vista.
 */

export interface Sustancia {
  id: string;
  nombre: string;
  icono: string;
  /** Calor específico en fase sólida, J/(kg·K). Ausente = fase no modelada */
  cSolido?: number;
  /** Calor específico en fase líquida, J/(kg·K) */
  cLiquido?: number;
  /** Calor específico en fase gaseosa, J/(kg·K) */
  cGas?: number;
  /** Temperatura de fusión en °C. Ausente = sin cambios de estado modelados */
  tFusion?: number;
  /** Calor latente de fusión, J/kg */
  lFusion?: number;
  /** Temperatura de ebullición en °C a 1 atm */
  tEbullicion?: number;
  /** Calor latente de vaporización, J/kg */
  lVaporizacion?: number;
  nombreSolido: string;
  nombreLiquido: string;
  nombreGas: string;
  nota: string;
}

export type ProcesoTramo =
  | 'calentar'
  | 'enfriar'
  | 'fusion'
  | 'solidificacion'
  | 'vaporizacion'
  | 'condensacion';

export interface Tramo {
  tipo: 'sensible' | 'latente';
  proceso: ProcesoTramo;
  /** Nombre de la fase implicada, ya particularizado ("hielo", "agua", "vapor") */
  nombreFase: string;
  tIni: number;
  tFin: number;
  masaKg: number;
  /** c en J/(kg·K) si el tramo es sensible; L en J/kg si es latente */
  coeficiente: number;
  /** Proporción de la masa que cambia de fase: 1 salvo cambio de estado a medias */
  fraccion: number;
  /** Calor en julios: positivo si la sustancia lo absorbe, negativo si lo cede */
  calor: number;
}

export interface CambioParcial {
  cuerpo: 'A' | 'B';
  proceso: ProcesoTramo;
  /** Proporción de la masa que llega a cambiar de fase, entre 0 y 1 */
  fraccion: number;
  masaCambiadaG: number;
  masaRestanteG: number;
  nombreRestante: string;
  nombreCambiado: string;
  temperatura: number;
}

export interface ResultadoMezcla {
  tEquilibrio: number;
  tramosA: Tramo[];
  tramosB: Tramo[];
  calorA: number;
  calorB: number;
  parcial: CambioParcial | null;
}

// ============================================================
// Sustancias
// Calores específicos y latentes a presión atmosférica normal.
// Fuente: CRC Handbook of Chemistry and Physics, 97.ª ed., con los
// redondeos habituales de los libros de texto de secundaria.
// ============================================================
export const SUSTANCIAS: Sustancia[] = [
  {
    id: 'agua',
    nombre: 'Agua',
    icono: '💧',
    cSolido: 2090,
    cLiquido: 4180,
    cGas: 2010,
    tFusion: 0,
    lFusion: 334_000,
    tEbullicion: 100,
    lVaporizacion: 2_257_000,
    nombreSolido: 'hielo',
    nombreLiquido: 'agua',
    nombreGas: 'vapor',
    nota: 'La sustancia con el calor específico más alto de uso corriente: por eso el mar templa el clima de la costa.',
  },
  {
    id: 'etanol',
    nombre: 'Etanol',
    icono: '🧪',
    cLiquido: 2440,
    cGas: 1430,
    tFusion: -114.1,
    lFusion: 108_000,
    tEbullicion: 78.4,
    lVaporizacion: 841_000,
    nombreSolido: 'etanol sólido',
    nombreLiquido: 'etanol',
    nombreGas: 'vapor de etanol',
    nota: 'Hierve a 78 °C, muy por debajo del agua. Sin datos de la fase sólida: el rango empieza en su punto de fusión.',
  },
  {
    id: 'mercurio',
    nombre: 'Mercurio',
    icono: '🌡️',
    cLiquido: 140,
    tFusion: -38.8,
    lFusion: 11_400,
    tEbullicion: 356.7,
    lVaporizacion: 295_000,
    nombreSolido: 'mercurio sólido',
    nombreLiquido: 'mercurio',
    nombreGas: 'vapor de mercurio',
    nota: 'El único metal líquido a temperatura ambiente. El rango llega hasta su ebullición.',
  },
  {
    id: 'hierro',
    nombre: 'Hierro',
    icono: '⚙️',
    cSolido: 450,
    cLiquido: 820,
    tFusion: 1538,
    lFusion: 247_000,
    tEbullicion: 2861,
    lVaporizacion: 6_090_000,
    nombreSolido: 'hierro',
    nombreLiquido: 'hierro fundido',
    nombreGas: 'vapor de hierro',
    nota: 'Se calienta nueve veces más deprisa que el agua con la misma energía.',
  },
  {
    id: 'aluminio',
    nombre: 'Aluminio',
    icono: '🥫',
    cSolido: 897,
    cLiquido: 1180,
    tFusion: 660.3,
    lFusion: 397_000,
    tEbullicion: 2519,
    lVaporizacion: 10_900_000,
    nombreSolido: 'aluminio',
    nombreLiquido: 'aluminio fundido',
    nombreGas: 'vapor de aluminio',
    nota: 'Funde a 660 °C, al alcance de un horno de fundición pequeño.',
  },
  {
    id: 'cobre',
    nombre: 'Cobre',
    icono: '🔶',
    cSolido: 385,
    cLiquido: 495,
    tFusion: 1084.6,
    lFusion: 209_000,
    tEbullicion: 2562,
    lVaporizacion: 4_730_000,
    nombreSolido: 'cobre',
    nombreLiquido: 'cobre fundido',
    nombreGas: 'vapor de cobre',
    nota: 'Buen conductor del calor y de la electricidad, con un calor específico bajo.',
  },
  {
    id: 'plomo',
    nombre: 'Plomo',
    icono: '🪙',
    cSolido: 129,
    cLiquido: 138,
    tFusion: 327.5,
    lFusion: 23_200,
    tEbullicion: 1749,
    lVaporizacion: 858_000,
    nombreSolido: 'plomo',
    nombreLiquido: 'plomo fundido',
    nombreGas: 'vapor de plomo',
    nota: 'Calor específico y calor latente pequeñísimos: funde con muy poca energía.',
  },
  {
    id: 'plata',
    nombre: 'Plata',
    icono: '🥈',
    cSolido: 235,
    cLiquido: 283,
    tFusion: 961.8,
    lFusion: 105_000,
    tEbullicion: 2162,
    lVaporizacion: 2_360_000,
    nombreSolido: 'plata',
    nombreLiquido: 'plata fundida',
    nombreGas: 'vapor de plata',
    nota: 'El mejor conductor térmico de todos los metales.',
  },
  {
    id: 'vidrio',
    nombre: 'Vidrio',
    icono: '🪟',
    cSolido: 840,
    nombreSolido: 'vidrio',
    nombreLiquido: 'vidrio',
    nombreGas: 'vidrio',
    nota: 'No tiene punto de fusión definido: reblandece progresivamente, así que aquí solo se modela el calentamiento.',
  },
];

export function sustanciaPorId(id: string): Sustancia {
  return SUSTANCIAS.find((s) => s.id === id) ?? SUSTANCIAS[0];
}

/**
 * Entalpía específica en J/kg, con el cero puesto en el punto de fusión justo
 * antes de fundir. La referencia es arbitraria porque solo se usan diferencias
 * dentro de una misma sustancia.
 *
 * En una meseta la entalpía da un salto, así que justo ahí el valor es ambiguo:
 * 0 °C es tanto la del hielo a punto de fundir como la del agua a punto de
 * congelarse, y entre ambas hay 334 kJ/kg de diferencia. El parámetro `lado`
 * elige cuál de las dos se quiere; por defecto la de la fase inferior.
 */
export function entalpiaEspecifica(
  s: Sustancia,
  t: number,
  lado: 'inferior' | 'superior' = 'inferior',
): number {
  let h: number;
  if (s.tFusion === undefined) {
    h = (s.cSolido ?? 0) * t;
  } else if (t <= s.tFusion) {
    h = (s.cSolido ?? 0) * (t - s.tFusion);
  } else {
    const base = s.lFusion ?? 0;
    if (s.tEbullicion === undefined || t <= s.tEbullicion) {
      h = base + (s.cLiquido ?? 0) * (t - s.tFusion);
    } else {
      const hastaEbullicion = base + (s.cLiquido ?? 0) * (s.tEbullicion - s.tFusion);
      h = hastaEbullicion + (s.lVaporizacion ?? 0) + (s.cGas ?? 0) * (t - s.tEbullicion);
    }
  }

  if (lado === 'superior') {
    for (const meseta of mesetasDe(s)) {
      if (Math.abs(t - meseta.t) < 1e-9) return h + meseta.latente;
    }
  }
  return h;
}

/** Intervalo de temperaturas con datos disponibles para la sustancia */
export function rangoSustancia(s: Sustancia): { min: number; max: number } {
  const min = s.cSolido !== undefined ? -273.15 : (s.tFusion ?? -273.15);
  let max: number;
  if (s.tFusion === undefined) max = 1000;
  else if (s.cGas === undefined) max = s.tEbullicion ?? s.tFusion + 1000;
  else max = 5000;
  return { min, max };
}

/**
 * Desglose del calor entre dos temperaturas, tramo a tramo. Si t1 < t0 los
 * tramos salen en orden inverso, con el calor negativo y los cambios de estado
 * nombrados al revés (solidificación en vez de fusión).
 */
export function calcularTramos(s: Sustancia, masaKg: number, t0: number, t1: number): Tramo[] {
  if (masaKg <= 0 || t0 === t1) return [];

  const enfriando = t1 < t0;
  const desde = Math.min(t0, t1);
  const hasta = Math.max(t0, t1);
  const tramos: Tramo[] = [];

  const sensible = (c: number, ta: number, tb: number, nombreFase: string) => {
    if (tb <= ta || c <= 0) return;
    tramos.push({
      tipo: 'sensible',
      proceso: 'calentar',
      nombreFase,
      tIni: ta,
      tFin: tb,
      masaKg,
      coeficiente: c,
      fraccion: 1,
      calor: masaKg * c * (tb - ta),
    });
  };

  const latente = (l: number, t: number, proceso: ProcesoTramo, nombreFase: string) => {
    tramos.push({
      tipo: 'latente',
      proceso,
      nombreFase,
      tIni: t,
      tFin: t,
      masaKg,
      coeficiente: l,
      fraccion: 1,
      calor: masaKg * l,
    });
  };

  let t = desde;

  // Fase sólida y fusión
  if (s.tFusion !== undefined && t < s.tFusion) {
    sensible(s.cSolido ?? 0, t, Math.min(hasta, s.tFusion), s.nombreSolido);
    t = Math.min(hasta, s.tFusion);
    if (hasta > s.tFusion) {
      latente(s.lFusion ?? 0, s.tFusion, 'fusion', s.nombreSolido);
    }
  }

  // Fase líquida y vaporización
  if (t < hasta) {
    const techo = s.tEbullicion !== undefined ? Math.min(hasta, s.tEbullicion) : hasta;
    const sinFases = s.tFusion === undefined;
    sensible(
      sinFases ? (s.cSolido ?? 0) : (s.cLiquido ?? 0),
      t,
      techo,
      sinFases ? s.nombreSolido : s.nombreLiquido,
    );
    t = Math.max(t, techo);
    if (s.tEbullicion !== undefined && hasta > s.tEbullicion) {
      latente(s.lVaporizacion ?? 0, s.tEbullicion, 'vaporizacion', s.nombreLiquido);
    }
  }

  // Fase gaseosa
  if (t < hasta && s.cGas !== undefined) {
    sensible(s.cGas, t, hasta, s.nombreGas);
  }

  if (!enfriando) return tramos;

  const inverso: Record<ProcesoTramo, ProcesoTramo> = {
    calentar: 'enfriar',
    enfriar: 'calentar',
    fusion: 'solidificacion',
    solidificacion: 'fusion',
    vaporizacion: 'condensacion',
    condensacion: 'vaporizacion',
  };

  return tramos
    .slice()
    .reverse()
    .map((tr) => ({
      ...tr,
      proceso: inverso[tr.proceso],
      tIni: tr.tFin,
      tFin: tr.tIni,
      calor: -tr.calor,
    }));
}

/** Mesetas de cambio de estado de una sustancia */
function mesetasDe(s: Sustancia) {
  const puntos: {
    t: number;
    latente: number;
    proceso: ProcesoTramo;
    procesoInverso: ProcesoTramo;
    nombreAntes: string;
    nombreDespues: string;
  }[] = [];
  if (s.tFusion !== undefined && s.lFusion !== undefined) {
    puntos.push({
      t: s.tFusion,
      latente: s.lFusion,
      proceso: 'fusion',
      procesoInverso: 'solidificacion',
      nombreAntes: s.nombreSolido,
      nombreDespues: s.nombreLiquido,
    });
  }
  if (s.tEbullicion !== undefined && s.lVaporizacion !== undefined) {
    puntos.push({
      t: s.tEbullicion,
      latente: s.lVaporizacion,
      proceso: 'vaporizacion',
      procesoInverso: 'condensacion',
      nombreAntes: s.nombreLiquido,
      nombreDespues: s.nombreGas,
    });
  }
  return puntos;
}

/**
 * Temperatura de equilibrio de dos cuerpos en un calorímetro ideal, por
 * bisección sobre la entalpía total. Los cambios de estado incompletos —el
 * hielo que solo se funde a medias— salen solos: el equilibrio se clava en la
 * meseta y la fracción se deduce de la energía sobrante.
 */
export function resolverMezcla(
  sa: Sustancia,
  ma: number,
  ta: number,
  sb: Sustancia,
  mb: number,
  tb: number,
): ResultadoMezcla {
  const balance = (t: number) =>
    ma * (entalpiaEspecifica(sa, t) - entalpiaEspecifica(sa, ta)) +
    mb * (entalpiaEspecifica(sb, t) - entalpiaEspecifica(sb, tb));

  let lo = Math.min(ta, tb);
  let hi = Math.max(ta, tb);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (balance(mid) < 0) lo = mid;
    else hi = mid;
  }
  let tEquilibrio = (lo + hi) / 2;

  const cuerpos = [
    { cuerpo: 'A' as const, s: sa, m: ma, tIni: ta, otro: { s: sb, m: mb, tIni: tb } },
    { cuerpo: 'B' as const, s: sb, m: mb, tIni: tb, otro: { s: sa, m: ma, tIni: ta } },
  ];

  let parcial: CambioParcial | null = null;

  for (const c of cuerpos) {
    for (const meseta of mesetasDe(c.s)) {
      if (Math.abs(tEquilibrio - meseta.t) > 1e-6) continue;

      const subiendo = c.tIni <= meseta.t;
      // Cada cuerpo llega a la meseta por el lado del que viene: el que sube la
      // alcanza en la fase inferior y el que baja en la superior.
      const hBorde = (x: { s: Sustancia; tIni: number }) =>
        entalpiaEspecifica(x.s, meseta.t, x.tIni <= meseta.t ? 'inferior' : 'superior');

      // Residuo del balance si ambos llegan a la meseta sin llegar a cruzarla:
      // lo que falte o sobre es justo lo que paga el cambio de estado a medias.
      const residuo =
        c.m * (hBorde(c) - entalpiaEspecifica(c.s, c.tIni)) +
        c.otro.m * (hBorde(c.otro) - entalpiaEspecifica(c.otro.s, c.otro.tIni));
      const fraccion = (subiendo ? -residuo : residuo) / (c.m * meseta.latente);

      if (fraccion > 1e-9 && fraccion < 1 - 1e-9) {
        parcial = {
          cuerpo: c.cuerpo,
          proceso: subiendo ? meseta.proceso : meseta.procesoInverso,
          fraccion,
          masaCambiadaG: fraccion * c.m * 1000,
          masaRestanteG: (1 - fraccion) * c.m * 1000,
          nombreRestante: subiendo ? meseta.nombreAntes : meseta.nombreDespues,
          nombreCambiado: subiendo ? meseta.nombreDespues : meseta.nombreAntes,
          temperatura: meseta.t,
        };
      }
    }
  }

  // La bisección deja el equilibrio a un infinitésimo de la meseta, por arriba o
  // por abajo según el redondeo. Si el cambio de estado se ha quedado a medias,
  // ese infinitésimo decidiría si calcularTramos cuenta la meseta entera o
  // ninguna, así que se clava en el punto exacto.
  if (parcial) tEquilibrio = parcial.temperatura;

  const tramosA = calcularTramos(sa, ma, ta, tEquilibrio);
  const tramosB = calcularTramos(sb, mb, tb, tEquilibrio);

  // El cambio de estado a medias no lo genera calcularTramos (que solo cuenta
  // mesetas cruzadas por completo), así que se añade aquí con su fracción.
  if (parcial) {
    const esA = parcial.cuerpo === 'A';
    const s = esA ? sa : sb;
    const m = esA ? ma : mb;
    const tIni = esA ? ta : tb;
    const meseta = mesetasDe(s).find((x) => Math.abs(x.t - tEquilibrio) < 1e-6);
    if (meseta) {
      const signo = tIni <= meseta.t ? 1 : -1;
      const tramo: Tramo = {
        tipo: 'latente',
        proceso: parcial.proceso,
        nombreFase: parcial.nombreRestante,
        tIni: meseta.t,
        tFin: meseta.t,
        masaKg: m,
        coeficiente: meseta.latente,
        fraccion: parcial.fraccion,
        calor: signo * parcial.fraccion * m * meseta.latente,
      };
      if (esA) tramosA.push(tramo);
      else tramosB.push(tramo);
    }
  }

  const suma = (ts: Tramo[]) => ts.reduce((acc, t) => acc + t.calor, 0);

  return {
    tEquilibrio,
    tramosA,
    tramosB,
    calorA: suma(tramosA),
    calorB: suma(tramosB),
    parcial,
  };
}

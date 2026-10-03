// Calculadoras de deporte y rendimiento físico — lógica pura

// ─── Utilidades internas ──────────────────────────────────────────────────────

function formatearTiempo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.round(segundos % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min ${s.toString().padStart(2, '0')}s`;
  return `${m}min ${s.toString().padStart(2, '0')}s`;
}

function formatearPace(segundos_km: number): string {
  const m = Math.floor(segundos_km / 60);
  const s = Math.round(segundos_km % 60);
  return `${m}:${s.toString().padStart(2, '0')} min/km`;
}

// ─── 1. Predictor de tiempos running (Riegel) ────────────────────────────────

export interface PrediccionDistancia {
  distancia_km: number;
  nombre: string;
  tiempo_s: number;
  tiempoFormateado: string;
  pace_s_km: number;
  paceFormateado: string;
}

export interface ResultadoPrediccionRunning {
  tiempoPredicto_s: number;
  tiempoFormateado: string;
  pace_s_km: number;
  paceFormateado: string;
  velocidad_km_h: number;
  prediccionesEstandar: PrediccionDistancia[];
  advertencia: string | null;
}

export function calcularPrediccionRunning(
  distanciaBase_km: number,
  tiempoBase_s: number,
  distanciaObjetivo_km: number,
): ResultadoPrediccionRunning {
  const factor = 1.06;
  const tiempoPredicto_s = tiempoBase_s * Math.pow(distanciaObjetivo_km / distanciaBase_km, factor);
  const pace_s_km = tiempoPredicto_s / distanciaObjetivo_km;
  const velocidad_km_h = 3600 / pace_s_km;

  const distanciasEstandar: { distancia_km: number; nombre: string }[] = [
    { distancia_km: 1,      nombre: '1 km' },
    { distancia_km: 5,      nombre: '5 km' },
    { distancia_km: 10,     nombre: '10 km' },
    { distancia_km: 15,     nombre: '15 km' },
    { distancia_km: 21.097, nombre: 'Media maratón' },
    { distancia_km: 42.195, nombre: 'Maratón' },
  ];

  const prediccionesEstandar: PrediccionDistancia[] = distanciasEstandar.map(({ distancia_km, nombre }) => {
    const t = tiempoBase_s * Math.pow(distancia_km / distanciaBase_km, factor);
    const p = t / distancia_km;
    return {
      distancia_km,
      nombre,
      tiempo_s: Math.round(t),
      tiempoFormateado: formatearTiempo(t),
      pace_s_km: p,
      paceFormateado: formatearPace(p),
    };
  });

  // La fórmula Riegel pierde precisión en distancias muy superiores a la base
  const ratioDistancias = distanciaObjetivo_km / distanciaBase_km;
  let advertencia: string | null = null;
  if (ratioDistancias > 4)
    advertencia = 'La fórmula Riegel es menos precisa cuando la distancia objetivo es más de 4 veces la distancia base.';
  if (distanciaObjetivo_km > 42.195)
    advertencia = 'Para distancias ultra (>42 km) la fórmula Riegel tiende a subestimar el tiempo real.';

  return {
    tiempoPredicto_s: Math.round(tiempoPredicto_s),
    tiempoFormateado: formatearTiempo(tiempoPredicto_s),
    pace_s_km,
    paceFormateado: formatearPace(pace_s_km),
    velocidad_km_h: Math.round(velocidad_km_h * 10) / 10,
    prediccionesEstandar,
    advertencia,
  };
}

// ─── 2. Zonas cardíacas (Karvonen) ────────────────────────────────────────────

export interface ZonaCardiaca {
  zona: number;
  nombre: string;
  descripcion: string;
  porcentajeMin: number;
  porcentajeMax: number;
  fcMin: number;
  fcMax: number;
  beneficioPrincipal: string;
}

export interface ResultadoZonasCardiacas {
  fcMax: number;
  fcMaxEstimada: boolean;
  fcReposo: number;
  fcReserva: number;
  zonas: ZonaCardiaca[];
}

export function calcularZonasCardiacas(
  edad: number,
  fcReposo: number,
  fcMaxima?: number,
): ResultadoZonasCardiacas {
  const fcMax = fcMaxima ?? (220 - edad);
  const fcMaxEstimada = fcMaxima === undefined;
  const fcReserva = fcMax - fcReposo;

  const definicionesZonas: Omit<ZonaCardiaca, 'fcMin' | 'fcMax'>[] = [
    { zona: 1, nombre: 'Recuperación activa', descripcion: 'Esfuerzo muy ligero', porcentajeMin: 50, porcentajeMax: 60, beneficioPrincipal: 'Recuperación y calentamiento' },
    { zona: 2, nombre: 'Base aeróbica',        descripcion: 'Conversación cómoda', porcentajeMin: 60, porcentajeMax: 70, beneficioPrincipal: 'Resistencia de base y quema de grasa' },
    { zona: 3, nombre: 'Aeróbica',             descripcion: 'Esfuerzo moderado-alto', porcentajeMin: 70, porcentajeMax: 80, beneficioPrincipal: 'Mejora cardiovascular y eficiencia aeróbica' },
    { zona: 4, nombre: 'Umbral anaeróbico',    descripcion: 'Difícil mantener conversación', porcentajeMin: 80, porcentajeMax: 90, beneficioPrincipal: 'Aumento de umbral de lactato' },
    { zona: 5, nombre: 'Máxima intensidad',    descripcion: 'Esfuerzo máximo sostenible brevemente', porcentajeMin: 90, porcentajeMax: 100, beneficioPrincipal: 'Capacidad máxima y velocidad punta' },
  ];

  const zonas: ZonaCardiaca[] = definicionesZonas.map(z => ({
    ...z,
    fcMin: Math.round(fcReposo + (z.porcentajeMin / 100) * fcReserva),
    fcMax: Math.round(fcReposo + (z.porcentajeMax / 100) * fcReserva),
  }));

  return { fcMax, fcMaxEstimada, fcReposo, fcReserva, zonas };
}

// ─── 3. 1RM — Repetición máxima (Epley + Brzycki) ───────────────────────────

export interface EntradaPercentaje1RM {
  porcentaje: number;
  peso_kg: number;
  repsAproximadas: string;
}

export interface Resultado1RM {
  epley: number;
  brzycki: number;
  media: number;
  tablaPorcentajes: EntradaPercentaje1RM[];
  advertencia: string | null;
}

export function calcular1RM(peso_kg: number, repeticiones: number): Resultado1RM {
  const epley   = repeticiones === 1 ? peso_kg : peso_kg * (1 + repeticiones / 30);
  const brzycki = repeticiones === 1 ? peso_kg : peso_kg / (1.0278 - 0.0278 * repeticiones);
  const media   = (epley + brzycki) / 2;

  const tablaDatos: { pct: number; reps: string }[] = [
    { pct: 100, reps: '1' },
    { pct: 95,  reps: '2' },
    { pct: 90,  reps: '3–4' },
    { pct: 85,  reps: '5–6' },
    { pct: 80,  reps: '7–8' },
    { pct: 75,  reps: '9–10' },
    { pct: 70,  reps: '11–13' },
    { pct: 65,  reps: '14–16' },
    { pct: 60,  reps: '17–20' },
  ];

  const tablaPorcentajes: EntradaPercentaje1RM[] = tablaDatos.map(({ pct, reps }) => ({
    porcentaje: pct,
    peso_kg: Math.round((media * pct) / 100 * 10) / 10,
    repsAproximadas: reps,
  }));

  let advertencia: string | null = null;
  if (repeticiones > 12)
    advertencia = 'Las fórmulas de 1RM son menos precisas con más de 12 repeticiones. Realiza un test directo para mayor exactitud.';
  if (repeticiones < 1)
    advertencia = 'El número de repeticiones debe ser al menos 1.';

  return {
    epley:  Math.round(epley * 10) / 10,
    brzycki: Math.round(brzycki * 10) / 10,
    media:  Math.round(media * 10) / 10,
    tablaPorcentajes,
    advertencia,
  };
}

// ─── 4. Potencia en ciclismo (W/kg + VAM) ────────────────────────────────────

export interface ZonaPotencia {
  zona: string;
  nombre: string;
  porcentajeFTP: string;
  wattsMin: number;
  /**
   * null en la Z7 (potencia neuromuscular): Coggan no le pone techo ni porcentaje, son
   * esfuerzos máximos de pocos segundos (hallazgo 2745).
   */
  wattsMax: number | null;
}

export interface ResultadoPotenciaCiclismo {
  wattsKg: number;
  nivelWattsKg: string;
  descripcionNivel: string;
  vam: number | null;
  nivelVam: string | null;
  zonasPotencia: ZonaPotencia[];
  /** Por qué no se ha podido calcular la VAM, cuando el usuario pidió calcularla */
  avisoVam: string | null;
}

/**
 * Límites SUPERIORES de las zonas de Coggan, en % del FTP.
 *
 * Van como límite superior y no como par min-max porque el modelo original es continuo
 * (menos de 55 %, 55-75 %, 75-90 %…) y al escribirlo como 0-55 / 56-75 / 76-90 quedaban
 * vatios sin zona: con un FTP de 280 W, 155 y 156 W no caían en ninguna, y así en los cinco
 * cortes. Ahora cada zona empieza donde acaba la anterior.
 */
/**
 * Rangos admitidos, los mismos que los controles de la app declaran en sus `min`/`max`.
 * Viven aquí para que el motor pueda hacerlos cumplir: son parte del contrato, no adorno.
 */
export const PESO_MIN_KG = 30;
export const PESO_MAX_KG = 150;
export const FTP_MIN_W = 50;
export const FTP_MAX_W = 600;

/**
 * Techo del cociente W/kg de FTP. Los rangos de peso y FTP por separado no bastan: 30 kg y
 * 600 W caben en los dos y dan «20,00 W/kg · Profesional / Élite», el absurdo que el hallazgo
 * 253 quería evitar (hallazgo 2493). Es un techo de PLAUSIBILIDAD de la herramienta, holgado a
 * propósito, no una cifra de la literatura: por encima no hay veredicto que dar. El 03/10/2026
 * se retiró de la guía el «6,0-7,5 W/kg de los grandes escaladores» en el que se apoyaba, porque
 * no tenía fuente (hallazgo 2745). Lo usa también el estimador por fuerzas (hallazgo 2740).
 */
export const WKG_MAX = 7.5;

/** Rangos que declaran los campos de la VAM (hallazgo 2494): son contrato, no adorno. */
export const DESNIVEL_MIN_M = 1;
export const DESNIVEL_MAX_M = 3000;
export const TIEMPO_MIN_MIN = 1;
export const TIEMPO_MAX_MIN = 600;
/**
 * VAM por encima de la cual no se emite veredicto. La guía de la app da como tope que «los
 * mejores escaladores han superado los 1.800 m/h» en las grandes subidas; 2.000 m/h deja
 * margen sobre esa cifra y sigue por debajo de lo que da cualquier error de tecleo típico
 * (1000 m en 10 min son 6000 m/h y la app los clasificaba «Élite / Profesional»).
 */
export const VAM_MAX_M_H = 2000;

/**
 * Los siete niveles de entrenamiento por potencia que propuso Andrew Coggan (tabla «Power
 * Training Levels», TrainingPeaks; también en Allen y Coggan, «Training and Racing with a Power
 * Meter», VeloPress, 2006). Coggan da la Z6 como «más del 120 %» y deja la Z7 sin porcentaje:
 * el techo de 150 % de la Z6 es la convención práctica de muchas plataformas para poder dar
 * vatios, y la página lo dice. La Z7 faltaba hasta el 03/10/2026 (hallazgo 2745).
 */
const ZONAS_COGGAN: { zona: string; nombre: string; limite: number }[] = [
  { zona: 'Z1', nombre: 'Recuperación activa', limite: 55 },
  { zona: 'Z2', nombre: 'Resistencia', limite: 75 },
  { zona: 'Z3', nombre: 'Tempo', limite: 90 },
  { zona: 'Z4', nombre: 'Umbral (FTP)', limite: 105 },
  { zona: 'Z5', nombre: 'VO2max', limite: 120 },
  { zona: 'Z6', nombre: 'Capacidad anaeróbica', limite: 150 },
];
/** Z7 de Coggan: sprints de pocos segundos, sin techo ni porcentaje en el modelo original. */
const ZONA_NEUROMUSCULAR = { zona: 'Z7', nombre: 'Potencia neuromuscular' };

export function calcularPotenciaCiclismo(
  peso_kg: number,
  ftp_w: number,
  desnivel_m?: number,
  tiempo_min?: number,
): ResultadoPotenciaCiclismo {
  // Sin esto, un peso de 0 kg producía Infinity —que formatNumber pinta como «∞ W/kg»— y la
  // app lo acompañaba del veredicto MÁS favorable de su escala («Profesional / Élite»); un
  // peso negativo daba el más desfavorable. Los min/max de los inputs son una sugerencia del
  // navegador, no una validación.
  if (!Number.isFinite(peso_kg) || peso_kg <= 0) {
    throw new Error('El peso debe ser un número mayor que 0 kg.');
  }
  if (!Number.isFinite(ftp_w) || ftp_w <= 0) {
    throw new Error('El FTP debe ser un número mayor que 0 W.');
  }
  /**
   * Los rangos que la app DECLARA en sus controles se comprueban aquí, porque los `min` y
   * `max` de un input son una sugerencia del navegador y se saltan escribiendo el número a
   * mano: con 70 kg y 1.000 W de FTP salía «14,29 W/kg» y el veredicto más favorable de la
   * escala, y con 10 kg y 200 W, «20,00 W/kg» — casi el triple del récord humano— sin una
   * palabra (hallazgo 253 del Inspector). Reparar solo el formato de la cifra, como se hizo
   * al cerrar el 245, dejaba en pie el veredicto sobre datos imposibles.
   *
   * Y de paso desaparece el caso que producía filas de zonas invertidas (254): con FTP por
   * debajo de ~7 W, dos límites consecutivos de Coggan redondean al mismo entero y
   * `wattsMin = anterior + 1` quedaba por encima del máximo de su propia fila.
   */
  if (peso_kg < PESO_MIN_KG || peso_kg > PESO_MAX_KG) {
    throw new Error(`El peso debe estar entre ${PESO_MIN_KG} y ${PESO_MAX_KG} kg, que es el rango que admite la herramienta.`);
  }
  if (ftp_w < FTP_MIN_W || ftp_w > FTP_MAX_W) {
    throw new Error(`El FTP debe estar entre ${FTP_MIN_W} y ${FTP_MAX_W} W, que es el rango que admite la herramienta.`);
  }

  const wattsKg = Math.round((ftp_w / peso_kg) * 100) / 100;
  if (wattsKg > WKG_MAX) {
    throw new Error(
      `${ftp_w} W con ${peso_kg} kg son ${wattsKg.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W/kg, ` +
      `por encima del techo de ${WKG_MAX.toLocaleString('es-ES')} W/kg que admite la herramienta, más de lo que se atribuye a los mejores ` +
      `escaladores profesionales: revisa el peso y el FTP.`,
    );
  }

  let nivelWattsKg: string;
  let descripcionNivel: string;
  if      (wattsKg < 1.5) { nivelWattsKg = 'Principiante';          descripcionNivel = 'Inicio en el ciclismo'; }
  else if (wattsKg < 2.5) { nivelWattsKg = 'Cicloturista';          descripcionNivel = 'Salidas recreativas regulares'; }
  else if (wattsKg < 3.5) { nivelWattsKg = 'Amateur';               descripcionNivel = 'Entrenamiento estructurado'; }
  else if (wattsKg < 4.5) { nivelWattsKg = 'Amateur competitivo';   descripcionNivel = 'Competición aficionado'; }
  else if (wattsKg < 5.5) { nivelWattsKg = 'Semiprofesional';       descripcionNivel = 'Nivel élite regional'; }
  else                    { nivelWattsKg = 'Profesional / Élite';   descripcionNivel = 'Nivel profesional internacional'; }

  let vam: number | null = null;
  let nivelVam: string | null = null;
  let avisoVam: string | null = null;
  const pidioVam = desnivel_m !== undefined || tiempo_min !== undefined;
  if (desnivel_m !== undefined && tiempo_min !== undefined && tiempo_min > 0 && desnivel_m > 0) {
    const vamCalculada = Math.round((desnivel_m / tiempo_min) * 60);
    // Los rangos de los campos se hacen cumplir aquí, y una VAM que ninguna subida real
    // alcanza no recibe veredicto (hallazgo 2494): antes 5000 m en 0,5 min salían
    // «600.000 m/h · Élite / Profesional».
    // El aviso declaraba «entre 1 y 3000 m» pero solo se exigía > 0: 0,85 m (kilómetros escritos
    // en el campo de metros) recibía «1 m/h · Principiante» (hallazgo 2741).
    if (desnivel_m < DESNIVEL_MIN_M || desnivel_m > DESNIVEL_MAX_M) {
      avisoVam = `El desnivel debe estar entre ${DESNIVEL_MIN_M} y ${DESNIVEL_MAX_M} m, que es el rango que admite la herramienta.`;
    } else if (tiempo_min < TIEMPO_MIN_MIN || tiempo_min > TIEMPO_MAX_MIN) {
      avisoVam = `El tiempo debe estar entre ${TIEMPO_MIN_MIN} y ${TIEMPO_MAX_MIN} minutos, que es el rango que admite la herramienta.`;
    } else if (vamCalculada < 1) {
      // 1 m en 600 min son 0,1 m/h: redondeado, «0 m/h · Principiante», un veredicto sobre una
      // subida que no es tal (caso del hallazgo 2741).
      avisoVam = `${desnivel_m} m en ${tiempo_min} min no llegan a 1 m/h de VAM: no es una subida que se pueda clasificar. Revisa el desnivel y el tiempo.`;
    } else if (vamCalculada > VAM_MAX_M_H) {
      avisoVam =
        `${desnivel_m} m en ${tiempo_min} min serían ${vamCalculada.toLocaleString('es-ES')} m/h de VAM, más de lo que se ha medido ` +
        `en las grandes subidas del ciclismo profesional (los mejores escaladores rondan los 1.800 m/h): revisa el desnivel y el tiempo. ` +
        `En un repecho de pocos minutos la VAM se dispara, y esta escala, pensada para subidas largas, no se le aplica.`;
    } else {
      vam = vamCalculada;
      if      (vam < 800)  nivelVam = 'Principiante';
      else if (vam < 1000) nivelVam = 'Cicloturista';
      else if (vam < 1200) nivelVam = 'Amateur';
      else if (vam < 1400) nivelVam = 'Amateur fuerte';
      else if (vam < 1600) nivelVam = 'Semiprofesional';
      else                 nivelVam = 'Élite / Profesional';
    }
  } else if (pidioVam) {
    // Antes la tarjeta desaparecía sin decir nada: el usuario abría el plegable, rellenaba un
    // campo, pulsaba Calcular y no obtenía ni VAM ni explicación.
    // Cada caso con su aviso. Antes solo se distinguía «tiempo <= 0» y todo lo demás caía en
    // el mensaje genérico: con desnivel 0 y tiempo 30 min —los dos campos RELLENOS— la app
    // decía «hacen falta los dos datos», que la propia pantalla desmiente (hallazgo 255).
    if (tiempo_min !== undefined && tiempo_min <= 0) {
      avisoVam = 'Indica un tiempo mayor que 0 minutos para calcular la VAM.';
    } else if (desnivel_m !== undefined && desnivel_m <= 0 && tiempo_min !== undefined) {
      avisoVam = 'Indica un desnivel mayor que 0 metros: la VAM mide lo que se sube, así que en llano no hay ninguna que calcular.';
    } else if (desnivel_m === undefined) {
      avisoVam = 'Falta el desnivel subido: la VAM necesita los metros y el tiempo.';
    } else {
      avisoVam = 'Falta el tiempo empleado: la VAM necesita los metros y el tiempo.';
    }
  }

  let anterior = 0;
  const zonasPotencia: ZonaPotencia[] = ZONAS_COGGAN.map((z, i) => {
    const wattsMax = Math.round((ftp_w * z.limite) / 100);
    const wattsMin = i === 0 ? 0 : anterior + 1;
    anterior = wattsMax;
    return {
      zona: z.zona,
      nombre: z.nombre,
      // El % va separado con espacio duro (U+00A0), Ortografía de la RAE (2010) y regla del
      // catálogo del 25/09/2026 (hallazgo 2497): «hasta 55 %», nunca «hasta 55%».
      porcentajeFTP: i === 0 ? `hasta ${z.limite}\u00A0%` : `${ZONAS_COGGAN[i - 1].limite}–${z.limite}\u00A0%`,
      wattsMin,
      wattsMax,
    };
  });
  zonasPotencia.push({
    zona: ZONA_NEUROMUSCULAR.zona,
    nombre: ZONA_NEUROMUSCULAR.nombre,
    porcentajeFTP: `más de ${ZONAS_COGGAN[ZONAS_COGGAN.length - 1].limite} %`,
    wattsMin: anterior + 1,
    wattsMax: null,
  });

  return { wattsKg, nivelWattsKg, descripcionNivel, vam, nivelVam, zonasPotencia, avisoVam };
}

// ─── 4.bis Vatios a partir del modelo de fuerzas (sin potenciómetro) ─────────

export interface ParametrosVatios {
  /** Masa total en movimiento: ciclista + bicicleta + equipaje (kg) */
  masaTotal_kg: number;
  /** Velocidad media sostenida (km/h) */
  velocidad_kmh: number;
  /** Pendiente media en % (0 en llano; admite negativa en bajada) */
  pendiente_pct: number;
}

export interface ResultadoVatios {
  /** Potencia total en el pedal (W). Nunca negativa: ver `sinPedalear`. */
  vatios: number;
  /** Reparto del esfuerzo, en vatios. La gravedad sale NEGATIVA en bajada: empuja. */
  desglose: { gravedad: number; rodadura: number; aerodinamica: number };
  /** Velocidad ascensional media que corresponde a esa subida (m/h), null en llano o bajada */
  vam: number | null;
  /**
   * A esa velocidad y esa pendiente no hace falta pedalear: la gravedad sostiene la marcha
   * de sobra. El balance de fuerzas da entonces un número negativo, que es correcto como
   * balance pero NO es la potencia del ciclista — a esa velocidad no pedalea, frena.
   */
  sinPedalear: boolean;
  /** Potencia que sobra en el balance (W, positiva), solo cuando `sinPedalear` */
  potenciaSobrante: number;
}

/*
 * Fuente del MODELO: Martin, Milliken, Cobb, McFadden y Coggan (1998), «Validation of a
 * mathematical model for road cycling power», Journal of Applied Biomechanics 14(3), 276-291:
 * gravedad + rodadura + aire, validado contra potenciómetro (R² = 0,97, error típico 2,7 W).
 * Los COEFICIENTES de abajo no salen de ese estudio, que midió los de sus propios ciclistas: son
 * supuestos típicos de carretera, y la página los presenta como tales, sin atribuirlos a nadie
 * (hallazgo 2744). Si se cambian, cambia también el párrafo de supuestos de la tarjeta.
 */
/** Aceleración de la gravedad (m/s²) */
const G = 9.80665;
/** Coeficiente de rodadura supuesto: neumático de carretera sobre asfalto en buen estado */
export const CRR = 0.005;
/** Área frontal por coeficiente aerodinámico supuesta, posición sobre las manetas (m²) */
export const CDA = 0.32;
/** Densidad del aire a nivel del mar y 15 °C (kg/m³), atmósfera estándar ISA */
const RHO = 1.225;
/** Rendimiento supuesto de la transmisión: parte de la potencia del pedal que llega a la rueda */
export const RENDIMIENTO_TRANSMISION = 0.975;

/** Rangos que declaran los campos del estimador en la app (hallazgo 2494). */
export const MASA_TOTAL_MIN_KG = 30;
export const MASA_TOTAL_MAX_KG = 200;
export const VELOCIDAD_MIN_KMH = 1;
export const VELOCIDAD_MAX_KMH = 80;
export const PENDIENTE_MIN_PCT = -15;
export const PENDIENTE_MAX_PCT = 25;

/**
 * Estima los vatios a partir de datos que el ciclista SÍ tiene sin potenciómetro: su peso, la
 * velocidad que sostuvo y la pendiente.
 *
 * Es el modelo estándar de fuerzas: P = (F_gravedad + F_rodadura + F_aerodinámica) · v / η.
 * Existe porque el título de la app promete «calcular tus vatios» y el motor exigía el FTP en
 * vatios como ENTRADA: quien buscaba «cuántos vatios muevo» se encontraba un formulario que le
 * pedía justo el dato que venía a buscar (hallazgo 240 del Inspector).
 *
 * Los coeficientes son los típicos de carretera y van fijos a propósito: pedir CdA y Crr a
 * quien no tiene potenciómetro sería cambiar un dato que no conoce por otros dos.
 */
export function calcularVatiosPorFuerzas(p: ParametrosVatios): ResultadoVatios {
  if (!Number.isFinite(p.masaTotal_kg) || p.masaTotal_kg <= 0) {
    throw new Error('La masa total debe ser un número mayor que 0 kg.');
  }
  if (!Number.isFinite(p.velocidad_kmh) || p.velocidad_kmh <= 0) {
    throw new Error('La velocidad debe ser un número mayor que 0 km/h.');
  }
  if (!Number.isFinite(p.pendiente_pct)) {
    throw new Error('La pendiente debe ser un número.');
  }
  // Los rangos que declaran los campos del estimador (hallazgo 2494): con 200 km/h en llano
  // salía «Potencia estimada 34.687 W» sin una palabra, porque solo se exigía > 0.
  if (p.masaTotal_kg < MASA_TOTAL_MIN_KG || p.masaTotal_kg > MASA_TOTAL_MAX_KG) {
    throw new Error(`La masa total debe estar entre ${MASA_TOTAL_MIN_KG} y ${MASA_TOTAL_MAX_KG} kg, que es el rango que admite la herramienta.`);
  }
  if (p.velocidad_kmh < VELOCIDAD_MIN_KMH || p.velocidad_kmh > VELOCIDAD_MAX_KMH) {
    throw new Error(`La velocidad debe estar entre ${VELOCIDAD_MIN_KMH} y ${VELOCIDAD_MAX_KMH} km/h, que es el rango que admite la herramienta.`);
  }
  if (p.pendiente_pct < PENDIENTE_MIN_PCT || p.pendiente_pct > PENDIENTE_MAX_PCT) {
    throw new Error(`La pendiente debe estar entre ${PENDIENTE_MIN_PCT} y ${PENDIENTE_MAX_PCT}\u00A0%, que es el rango que admite la herramienta.`);
  }

  const v = p.velocidad_kmh / 3.6;                    // m/s
  const angulo = Math.atan(p.pendiente_pct / 100);
  const senoA = Math.sin(angulo);
  const cosenoA = Math.cos(angulo);

  const fGravedad = p.masaTotal_kg * G * senoA;
  const fRodadura = CRR * p.masaTotal_kg * G * cosenoA;
  const fAero = 0.5 * RHO * CDA * v * v;

  const potencia = ((fGravedad + fRodadura + fAero) * v) / RENDIMIENTO_TRANSMISION;

  /**
   * Techo de la COMBINACIÓN, el patrón del 2493 en el formulario principal (hallazgo 2740): cada
   * campo dentro de su rango no basta, y 78 kg a 80 km/h en llano publicaban «Potencia estimada
   * 2293 W» de una «velocidad media sostenida». Se aplica el mismo techo de 7,5 W/kg, dividido
   * por la masa TOTAL (ciclista + bici), que es más holgado que dividir por el peso del ciclista:
   * se rechaza solo lo que ningún ciclista sostiene, no lo que es duro.
   */
  if (potencia / p.masaTotal_kg > WKG_MAX) {
    const fmt = (n: number, d = 0) =>
      n.toLocaleString('es-ES', { maximumFractionDigits: d });
    throw new Error(
      `A ${fmt(p.velocidad_kmh, 1)} km/h con una pendiente del ${fmt(p.pendiente_pct, 1)}\u00A0% harían falta ` +
      `${fmt(potencia)} W para mover ${fmt(p.masaTotal_kg, 1)} kg, más de ${fmt(WKG_MAX, 1)} W por kilo de masa total: ` +
      `ninguna velocidad media sostenida exige tanto, ni sirve como FTP. Revisa la velocidad y la pendiente.`,
    );
  }

  /**
   * Fuera de dominio: en bajada el balance puede dar un número negativo, y la app invita
   * expresamente a esa entrada («0 en llano; negativa en bajada», mínimo −15 %). Publicarlo
   * como «Potencia estimada −178 W» era rotular como potencia del ciclista la solución de
   * una ecuación que ahí no describe su esfuerzo: a esa velocidad no pedalea, frena
   * (hallazgo 252 del Inspector). La potencia en el pedal es 0 y el sobrante se dice aparte.
   */
  const sinPedalear = potencia < 0;

  return {
    vatios: Math.max(0, Math.round(potencia)),
    sinPedalear,
    potenciaSobrante: sinPedalear ? Math.round(-potencia) : 0,
    desglose: {
      gravedad: Math.round((fGravedad * v) / RENDIMIENTO_TRANSMISION),
      rodadura: Math.round((fRodadura * v) / RENDIMIENTO_TRANSMISION),
      aerodinamica: Math.round((fAero * v) / RENDIMIENTO_TRANSMISION),
    },
    // VAM = componente vertical de la velocidad, en metros por hora
    vam: p.pendiente_pct > 0 ? Math.round(v * senoA * 3600) : null,
  };
}

// ─── 5. Pace running — conversiones y splits ─────────────────────────────────

export interface SplitRunning {
  km: number;
  tiempoAcumulado_s: number;
  tiempoFormateado: string;
}

export interface ProyeccionDistancia {
  distancia_km: number;
  nombre: string;
  tiempo_s: number;
  tiempoFormateado: string;
}

export interface ResultadoPaceRunning {
  pace_s_km: number;
  paceFormateado: string;
  velocidad_km_h: number;
  splits: SplitRunning[];
  proyecciones: ProyeccionDistancia[];
}

export function calcularPaceRunning(
  distancia_km: number,
  tiempo_s: number,
): ResultadoPaceRunning {
  const pace_s_km = tiempo_s / distancia_km;
  const velocidad_km_h = Math.round((3600 / pace_s_km) * 10) / 10;

  const numSplits = Math.min(Math.ceil(distancia_km), 42);
  const splits: SplitRunning[] = Array.from({ length: numSplits }, (_, i) => {
    const km = i + 1;
    const t = pace_s_km * Math.min(km, distancia_km);
    return { km, tiempoAcumulado_s: Math.round(t), tiempoFormateado: formatearTiempo(t) };
  });

  const distanciasRef: { distancia_km: number; nombre: string }[] = [
    { distancia_km: 5,      nombre: '5 km' },
    { distancia_km: 10,     nombre: '10 km' },
    { distancia_km: 21.097, nombre: 'Media maratón' },
    { distancia_km: 42.195, nombre: 'Maratón' },
  ];

  const proyecciones: ProyeccionDistancia[] = distanciasRef.map(({ distancia_km: d, nombre }) => {
    const t = pace_s_km * d;
    return { distancia_km: d, nombre, tiempo_s: Math.round(t), tiempoFormateado: formatearTiempo(t) };
  });

  return {
    pace_s_km,
    paceFormateado: formatearPace(pace_s_km),
    velocidad_km_h,
    splits,
    proyecciones,
  };
}

// ─── 6. SWOLF (eficiencia en natación) ───────────────────────────────────────

export type NivelSWOLF = 'elite' | 'avanzado' | 'intermedio' | 'principiante';

/**
 * Cortes de nivel del SWOLF en piscina de 25 m (bordes inclusivos). Orientativos: no existe
 * una escala oficial de SWOLF. En otra piscina se clasifica con el equivalente por 25 m.
 */
export const CORTES_SWOLF_25 = { elite: 25, avanzado: 30, intermedio: 38 } as const;

/**
 * Rangos admitidos POR CADA 25 m de largo; en 50 m se multiplican por 2. Un largo de 25 m en
 * menos de 5 s (5 m/s, por encima del récord mundial) o con 0 brazadas no describe a nadie,
 * y hasta el 02/10/2026 recibía «Élite» (hallazgo 2632).
 */
export const RANGO_TIEMPO_SWOLF_POR_25 = { min: 5, max: 300 } as const;
export const RANGO_BRAZADAS_SWOLF_POR_25 = { min: 1, max: 100 } as const;

/** Longitudes de piscina admitidas. */
export const PISCINAS_SWOLF = [25, 50] as const;

export interface ResultadoSWOLF {
  /** Segundos + brazadas por largo, a la décima. */
  swolf: number;
  /** El mismo SWOLF expresado por 25 m de largo (en 50 m, la mitad): el que decide el nivel. */
  swolfEquivalente25: number;
  nivel: NivelSWOLF;
  eficiencia: string;
  descripcionNivel: string;
  consejo: string;
  velocidadMedia_m_s: number;
  velocidadMedia_min100m: string;
}

/**
 * SWOLF y nivel orientativo.
 *
 * ⚠️ 02/10/2026 — hallazgo 2631 (alto): hasta hoy los cortes de 50 m eran los de 25 m + 8
 * (élite ≤ 33). Pero SWOLF suma segundos y brazadas POR LARGO, y en 50 m el largo mide el
 * doble: a igual ritmo y mismas brazadas por metro el SWOLF es exactamente el doble
 * (25 m · 22 s · 16 = 38; 50 m · 44 s · 32 = 76). Con el +8, el mismo nadador bajaba de
 * Intermedio a Principiante por cambiar de piscina. Ahora se clasifica con el equivalente por
 * 25 m (SWOLF ÷ metros/25). Es el mínimo que da la geometría: sin el impulso de un viraje, el
 * real en 50 m sale algo por encima, y cerca de un corte la clasificación es conservadora.
 * La app, la API de ChatGPT y la tool del MCP comparten este motor.
 *
 * @throws RangeError si la piscina no es de 25 o 50 m, o si el tiempo o las brazadas no son
 *   números dentro de los rangos de RANGO_*_POR_25 escalados a la piscina.
 */
export function calcularSWOLF(
  tiempo_s_largo: number,
  brazadas_largo: number,
  metros_largo: number = 25,
): ResultadoSWOLF {
  if (!(PISCINAS_SWOLF as readonly number[]).includes(metros_largo)) {
    throw new RangeError('La piscina debe ser de 25 o de 50 metros.');
  }
  const factor = metros_largo / 25;
  const tMin = RANGO_TIEMPO_SWOLF_POR_25.min * factor;
  const tMax = RANGO_TIEMPO_SWOLF_POR_25.max * factor;
  const bMin = RANGO_BRAZADAS_SWOLF_POR_25.min * factor;
  const bMax = RANGO_BRAZADAS_SWOLF_POR_25.max * factor;
  if (!Number.isFinite(tiempo_s_largo) || tiempo_s_largo < tMin || tiempo_s_largo > tMax) {
    throw new RangeError(`En piscina de ${metros_largo} m, el tiempo por largo debe estar entre ${tMin} y ${tMax} segundos.`);
  }
  if (!Number.isFinite(brazadas_largo) || brazadas_largo < bMin || brazadas_largo > bMax) {
    throw new RangeError(`En piscina de ${metros_largo} m, las brazadas por largo deben estar entre ${bMin} y ${bMax}.`);
  }

  // Se clasifica la cifra que se MUESTRA (a la décima), para que un 38,04 que se lee «38» no
  // caiga en el nivel de un 39. Dividir entre 1 o 2 es exacto en coma flotante.
  const swolf = Math.round((tiempo_s_largo + brazadas_largo) * 10) / 10;
  const swolfEquivalente25 = swolf / factor;

  let nivel: NivelSWOLF;
  let eficiencia: string;
  let descripcionNivel: string;
  let consejo: string;

  if (swolfEquivalente25 <= CORTES_SWOLF_25.elite) {
    nivel = 'elite'; eficiencia = 'Excelente';
    descripcionNivel = 'Eficiencia de nadador avanzado o competitivo';
    consejo = 'Mantén la técnica y trabaja la resistencia para bajar tiempos.';
  } else if (swolfEquivalente25 <= CORTES_SWOLF_25.avanzado) {
    nivel = 'avanzado'; eficiencia = 'Buena';
    descripcionNivel = 'Técnica consolidada con margen de mejora';
    consejo = 'Trabaja la planada y el agarre para reducir brazadas por largo.';
  } else if (swolfEquivalente25 <= CORTES_SWOLF_25.intermedio) {
    nivel = 'intermedio'; eficiencia = 'En desarrollo';
    descripcionNivel = 'Nadador con base, técnica mejorable';
    consejo = 'Practica drills de técnica (catch-up, dedos al suelo). Menos brazadas con más propulsión.';
  } else {
    nivel = 'principiante'; eficiencia = 'Básica';
    descripcionNivel = 'Fase inicial de aprendizaje técnico';
    consejo = 'Prioriza la técnica antes que la velocidad. El trabajo con aletas ayuda a sentir el deslizamiento.';
  }

  const velocidadMedia_m_s = metros_largo / tiempo_s_largo;
  // Se redondea el TOTAL de segundos antes de partirlo: redondear solo los segundos daba
  // «0:60» con 14,99 s en 25 m.
  const totalSeg100m = Math.round((tiempo_s_largo * 100) / metros_largo);
  const min100m = Math.floor(totalSeg100m / 60);
  const sec100m = totalSeg100m % 60;
  const velocidadMedia_min100m = `${min100m}:${sec100m.toString().padStart(2, '0')} min/100 m`;

  return {
    swolf,
    swolfEquivalente25,
    nivel,
    eficiencia,
    descripcionNivel,
    consejo,
    velocidadMedia_m_s: Math.round(velocidadMedia_m_s * 100) / 100,
    velocidadMedia_min100m,
  };
}

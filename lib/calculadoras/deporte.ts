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
  wattsMax: number;
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

const ZONAS_COGGAN: { zona: string; nombre: string; limite: number }[] = [
  { zona: 'Z1', nombre: 'Recuperación activa', limite: 55 },
  { zona: 'Z2', nombre: 'Resistencia', limite: 75 },
  { zona: 'Z3', nombre: 'Tempo', limite: 90 },
  { zona: 'Z4', nombre: 'Umbral (FTP)', limite: 105 },
  { zona: 'Z5', nombre: 'VO2max', limite: 120 },
  { zona: 'Z6', nombre: 'Capacidad anaeróbica', limite: 150 },
];

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

  let nivelWattsKg: string;
  let descripcionNivel: string;
  if      (wattsKg < 1.5) { nivelWattsKg = 'Principiante';          descripcionNivel = 'Inicio en el ciclismo'; }
  else if (wattsKg < 2.5) { nivelWattsKg = 'Cicloturista';          descripcionNivel = 'Salidas recreativas regulares'; }
  else if (wattsKg < 3.5) { nivelWattsKg = 'Amateur';               descripcionNivel = 'Entrenamiento estructurado'; }
  else if (wattsKg < 4.5) { nivelWattsKg = 'Amateur competitivo';   descripcionNivel = 'Competición aficionado'; }
  else if (wattsKg < 5.5) { nivelWattsKg = 'Semi-profesional';      descripcionNivel = 'Nivel élite regional'; }
  else                    { nivelWattsKg = 'Profesional / Élite';   descripcionNivel = 'Nivel profesional internacional'; }

  let vam: number | null = null;
  let nivelVam: string | null = null;
  let avisoVam: string | null = null;
  const pidioVam = desnivel_m !== undefined || tiempo_min !== undefined;
  if (desnivel_m !== undefined && tiempo_min !== undefined && tiempo_min > 0 && desnivel_m > 0) {
    vam = Math.round((desnivel_m / tiempo_min) * 60);
    if      (vam < 800)  nivelVam = 'Principiante';
    else if (vam < 1000) nivelVam = 'Cicloturista';
    else if (vam < 1200) nivelVam = 'Amateur';
    else if (vam < 1400) nivelVam = 'Amateur fuerte';
    else if (vam < 1600) nivelVam = 'Semi-profesional';
    else                 nivelVam = 'Élite / Profesional';
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
      porcentajeFTP: i === 0 ? `hasta ${z.limite}%` : `${ZONAS_COGGAN[i - 1].limite}–${z.limite}%`,
      wattsMin,
      wattsMax,
    };
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

/** Aceleración de la gravedad (m/s²) */
const G = 9.80665;
/** Coeficiente de rodadura de un neumático de carretera sobre asfalto en buen estado */
const CRR = 0.005;
/** Área frontal por coeficiente aerodinámico, posición sobre las manetas (m²) */
const CDA = 0.32;
/** Densidad del aire a nivel del mar y 15 °C (kg/m³) */
const RHO = 1.225;
/** Rendimiento de la transmisión: parte de la potencia del pedal que llega a la rueda */
const RENDIMIENTO_TRANSMISION = 0.975;

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

  const v = p.velocidad_kmh / 3.6;                    // m/s
  const angulo = Math.atan(p.pendiente_pct / 100);
  const senoA = Math.sin(angulo);
  const cosenoA = Math.cos(angulo);

  const fGravedad = p.masaTotal_kg * G * senoA;
  const fRodadura = CRR * p.masaTotal_kg * G * cosenoA;
  const fAero = 0.5 * RHO * CDA * v * v;

  const potencia = ((fGravedad + fRodadura + fAero) * v) / RENDIMIENTO_TRANSMISION;

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

export interface ResultadoSWOLF {
  swolf: number;
  nivel: NivelSWOLF;
  eficiencia: string;
  descripcionNivel: string;
  consejo: string;
  velocidadMedia_m_s: number;
  velocidadMedia_min100m: string;
}

export function calcularSWOLF(
  tiempo_s_largo: number,
  brazadas_largo: number,
  metros_largo: number = 25,
): ResultadoSWOLF {
  const swolf = tiempo_s_largo + brazadas_largo;

  // Umbrales ajustados por longitud de piscina
  const ajuste = metros_largo === 50 ? 8 : 0;
  const elite       = 25 + ajuste;
  const avanzado    = 30 + ajuste;
  const intermedio  = 38 + ajuste;

  let nivel: NivelSWOLF;
  let eficiencia: string;
  let descripcionNivel: string;
  let consejo: string;

  if (swolf <= elite) {
    nivel = 'elite'; eficiencia = 'Excelente';
    descripcionNivel = 'Eficiencia de nadador avanzado o competitivo';
    consejo = 'Mantén la técnica y trabaja la resistencia para bajar tiempos.';
  } else if (swolf <= avanzado) {
    nivel = 'avanzado'; eficiencia = 'Buena';
    descripcionNivel = 'Técnica consolidada con margen de mejora';
    consejo = 'Trabaja la planada y el agarre para reducir brazadas por largo.';
  } else if (swolf <= intermedio) {
    nivel = 'intermedio'; eficiencia = 'En desarrollo';
    descripcionNivel = 'Nadador con base, técnica mejorable';
    consejo = 'Practica drills de técnica (catch-up, dedos al suelo). Menos brazadas con más propulsión.';
  } else {
    nivel = 'principiante'; eficiencia = 'Básica';
    descripcionNivel = 'Fase inicial de aprendizaje técnico';
    consejo = 'Prioriza la técnica antes que la velocidad. El trabajo con aletas ayuda a sentir el deslizamiento.';
  }

  const velocidadMedia_m_s = metros_largo / tiempo_s_largo;
  const segundosPor100m    = 100 / velocidadMedia_m_s;
  const min100m            = Math.floor(segundosPor100m / 60);
  const sec100m            = Math.round(segundosPor100m % 60);
  const velocidadMedia_min100m = `${min100m}:${sec100m.toString().padStart(2, '0')} min/100m`;

  return {
    swolf,
    nivel,
    eficiencia,
    descripcionNivel,
    consejo,
    velocidadMedia_m_s: Math.round(velocidadMedia_m_s * 100) / 100,
    velocidadMedia_min100m,
  };
}

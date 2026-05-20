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
}

export function calcularPotenciaCiclismo(
  peso_kg: number,
  ftp_w: number,
  desnivel_m?: number,
  tiempo_min?: number,
): ResultadoPotenciaCiclismo {
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
  if (desnivel_m !== undefined && tiempo_min !== undefined && tiempo_min > 0) {
    vam = Math.round((desnivel_m / tiempo_min) * 60);
    if      (vam < 800)  nivelVam = 'Principiante';
    else if (vam < 1000) nivelVam = 'Cicloturista';
    else if (vam < 1200) nivelVam = 'Amateur';
    else if (vam < 1400) nivelVam = 'Amateur fuerte';
    else if (vam < 1600) nivelVam = 'Semi-profesional';
    else                 nivelVam = 'Élite / Profesional';
  }

  const zonasDefinicion: { zona: string; nombre: string; pctMin: number; pctMax: number }[] = [
    { zona: 'Z1', nombre: 'Recuperación activa',  pctMin: 0,   pctMax: 55  },
    { zona: 'Z2', nombre: 'Resistencia',           pctMin: 56,  pctMax: 75  },
    { zona: 'Z3', nombre: 'Tempo',                 pctMin: 76,  pctMax: 90  },
    { zona: 'Z4', nombre: 'Umbral (FTP)',          pctMin: 91,  pctMax: 105 },
    { zona: 'Z5', nombre: 'VO2max',                pctMin: 106, pctMax: 120 },
    { zona: 'Z6', nombre: 'Capacidad anaeróbica',  pctMin: 121, pctMax: 150 },
  ];

  const zonasPotencia: ZonaPotencia[] = zonasDefinicion.map(z => ({
    zona: z.zona,
    nombre: z.nombre,
    porcentajeFTP: `${z.pctMin}–${z.pctMax}%`,
    wattsMin: Math.round(ftp_w * z.pctMin / 100),
    wattsMax: Math.round(ftp_w * z.pctMax / 100),
  }));

  return { wattsKg, nivelWattsKg, descripcionNivel, vam, nivelVam, zonasPotencia };
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

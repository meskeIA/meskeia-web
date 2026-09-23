/**
 * Motor solar de Golden Hour — algoritmo de la NOAA Solar Calculator (Meeus).
 *
 * Sin dependencias ni presentación: devuelve INSTANTES (milisegundos UTC) y la vista decide en
 * qué huso los escribe. Sustituye al cálculo anterior, que tenía tres defectos que se
 * multiplicaban entre sí (hallazgos 1233, 1234, 1237 y 1239 del Inspector):
 *   · `(x + 24) % 24` quedaba NEGATIVO en JavaScript y `Math.floor` restaba una hora a todo;
 *   · montaba el instante con `setUTCHours` sobre la medianoche LOCAL, así que en UTC±X el
 *     evento caía en la víspera (el ocaso de México antes que su orto, y en Europa ningún
 *     evento era «futuro»);
 *   · leía la fecha elegida con `new Date('AAAA-MM-DD')`, que es medianoche UTC: al oeste de
 *     Greenwich calculaba el día anterior.
 *
 * Aquí la fecha es de CALENDARIO en el huso del lugar, el día se ancla en su mediodía solar
 * (el tránsito que cae en esa fecha civil) y cada evento se busca como el cruce de la altura
 * del sol con su umbral, a un lado u otro del tránsito. Así no hay aritmética de horas que
 * pueda salirse de rango, y el sol de medianoche y la noche polar salen solos: son umbrales
 * que no se cruzan.
 */

const RAD = Math.PI / 180;
const MS_MIN = 60_000;
const MS_DIA = 86_400_000;

/** Umbrales de altura geométrica del centro del sol, en grados. */
export const UMBRAL = {
  /** Orto y ocaso: borde superior en el horizonte con la refracción estándar (NOAA). */
  horizonte: -0.833,
  horaDorada: 6,
  civil: -6,
  nautico: -12,
  astronomico: -18,
} as const;

interface Efemeride {
  /** Declinación del sol, en grados. */
  declinacion: number;
  /** Ecuación del tiempo, en minutos. */
  ecuacionTiempo: number;
}

function efemeride(ms: number): Efemeride {
  const jd = ms / MS_DIA + 2440587.5;
  const T = (jd - 2451545) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C =
    Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const declinacion = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) / RAD;
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const ecuacionTiempo =
    (4 / RAD) *
    (y * Math.sin(2 * L0 * RAD) -
      2 * e * Math.sin(M * RAD) +
      4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
      0.5 * y * y * Math.sin(4 * L0 * RAD) -
      1.25 * e * e * Math.sin(2 * M * RAD));
  return { declinacion, ecuacionTiempo };
}

export interface PosicionSol {
  /** Altura geométrica sobre el horizonte, en grados (sin refracción). */
  altura: number;
  /** Azimut desde el norte en el sentido de las agujas del reloj, en grados [0, 360). */
  azimut: number;
}

/** Posición del sol en un instante, vista desde (lat, lon). Longitud positiva al este. */
export function posicionSol(ms: number, lat: number, lon: number): PosicionSol {
  const { declinacion, ecuacionTiempo } = efemeride(ms);
  const minutosUtc = (((ms % MS_DIA) + MS_DIA) % MS_DIA) / MS_MIN;
  const horaSolar = minutosUtc + ecuacionTiempo + 4 * lon;
  const anguloHorario = horaSolar / 4 - 180;
  const cosZ =
    Math.sin(lat * RAD) * Math.sin(declinacion * RAD) +
    Math.cos(lat * RAD) * Math.cos(declinacion * RAD) * Math.cos(anguloHorario * RAD);
  const zenit = Math.acos(Math.max(-1, Math.min(1, cosZ))) / RAD;
  const altura = 90 - zenit;

  const denominador = Math.cos(lat * RAD) * Math.sin(zenit * RAD);
  let azimut: number;
  if (Math.abs(denominador) < 1e-9) {
    azimut = lat > 0 ? 180 : 0;
  } else {
    const cosAz =
      (Math.sin(lat * RAD) * Math.cos(zenit * RAD) - Math.sin(declinacion * RAD)) / denominador;
    const base = Math.acos(Math.max(-1, Math.min(1, cosAz))) / RAD;
    // El ángulo horario, reducido a (−180, 180]: positivo por la tarde.
    const ah = ((((anguloHorario + 180) % 360) + 360) % 360) - 180;
    azimut = ah > 0 ? (base + 180) % 360 : (540 - base) % 360;
  }
  return { altura, azimut };
}

// ─── Husos horarios ─────────────────────────────────────────────────────────────────────────

export interface FechaCivil {
  anio: number;
  mes: number; // 1-12
  dia: number;
}

/** «AAAA-MM-DD» → fecha de calendario, o null si no es una fecha válida. */
export function leerFecha(texto: string): FechaCivil | null {
  const m = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const prueba = new Date(Date.UTC(anio, mes - 1, dia));
  if (prueba.getUTCFullYear() !== anio || prueba.getUTCMonth() !== mes - 1 || prueba.getUTCDate() !== dia) {
    return null;
  }
  return { anio, mes, dia };
}

/** Fecha de calendario de un instante en un huso IANA. */
export function fechaEnZona(ms: number, zona: string): FechaCivil {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(ms));
  const valor = (tipo: string): number => Number(partes.find((p) => p.type === tipo)?.value);
  return { anio: valor('year'), mes: valor('month'), dia: valor('day') };
}

/** Desfase del huso respecto de UTC en ese instante, en minutos (Madrid en verano: +120). */
export function desfaseZona(ms: number, zona: string): number {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ms));
  const valor = (tipo: string): number => Number(partes.find((p) => p.type === tipo)?.value);
  const comoUtc = Date.UTC(valor('year'), valor('month') - 1, valor('day'), valor('hour'), valor('minute'), valor('second'));
  return Math.round((comoUtc - Math.floor(ms / 1000) * 1000) / MS_MIN);
}

/** true si el navegador reconoce el huso IANA. */
export function zonaValida(zona: string): boolean {
  try {
    new Intl.DateTimeFormat('es-ES', { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}

/** Husos IANA de un país (código ISO de dos letras), o [] si el navegador no sabe darlos. */
export function husosDelPais(codigoPais: string): string[] {
  try {
    const locale = new Intl.Locale('und', { region: codigoPais.toUpperCase() }) as Intl.Locale & {
      getTimeZones?: () => string[];
      timeZones?: string[];
    };
    const lista = locale.getTimeZones?.() ?? locale.timeZones ?? [];
    return lista.filter(zonaValida);
  } catch {
    return [];
  }
}

/**
 * Ciudad de referencia (zone.tab de la IANA) de los husos de los países con MÁS de un desfase
 * donde el catálogo tiene público: sirve para elegir el huso más cercano al lugar buscado. La
 * longitud sola no vale: la España peninsular está en el huso de Europa central, y con ella
 * Madrid saldría en el de Canarias.
 */
const REFERENCIA_HUSO: Readonly<Record<string, readonly [number, number]>> = {
  'Europe/Madrid': [40.4, -3.683],
  'Africa/Ceuta': [35.883, -5.317],
  'Atlantic/Canary': [28.1, -15.4],
  'Europe/Lisbon': [38.717, -9.133],
  'Atlantic/Madeira': [32.633, -16.9],
  'Atlantic/Azores': [37.733, -25.667],
  'America/Mexico_City': [19.4, -99.15],
  'America/Cancun': [21.083, -86.767],
  'America/Merida': [20.967, -89.617],
  'America/Monterrey': [25.667, -100.317],
  'America/Matamoros': [25.833, -97.5],
  'America/Chihuahua': [28.633, -106.083],
  'America/Ciudad_Juarez': [31.733, -106.483],
  'America/Ojinaga': [29.567, -104.417],
  'America/Mazatlan': [23.217, -106.417],
  'America/Bahia_Banderas': [20.8, -105.25],
  'America/Hermosillo': [29.067, -110.967],
  'America/Tijuana': [32.533, -117.017],
  'America/Santiago': [-33.45, -70.667],
  'America/Punta_Arenas': [-53.15, -70.917],
  'Pacific/Easter': [-27.15, -109.433],
  'America/Guayaquil': [-2.167, -79.833],
  'Pacific/Galapagos': [-0.9, -89.6],
};

/**
 * Entre husos equivalentes (mismo desfase todo el año), el nombre que reconoce quien lo lee:
 * Sevilla en «Europe/Madrid» y no en «Africa/Ceuta», Argentina en «Buenos_Aires».
 */
const PREFERIDOS: readonly string[] = [
  'Europe/Madrid',
  'Europe/Lisbon',
  'America/Mexico_City',
  'America/Argentina/Buenos_Aires',
  'America/Buenos_Aires',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Australia/Sydney',
  'Europe/Moscow',
];

export type OrigenHuso = 'pais' | 'estimado' | 'desconocido';

/**
 * Huso con el que escribir las horas de un lugar elegido en el buscador.
 *   · 'pais': el país tiene un solo desfase, así que cualquiera de sus husos da la misma hora.
 *   · 'estimado': tiene varios; se elige el de la ciudad de referencia más cercana (o, si no
 *     hay referencia, el que mejor casa con la longitud) y la vista debe pedir que se compruebe.
 *   · 'desconocido': el navegador no sabe los husos del país; se devuelve `porDefecto`.
 */
export function husoParaLugar(
  codigoPais: string | undefined,
  lat: number,
  lon: number,
  instante: number,
  porDefecto: string,
): { zona: string; origen: OrigenHuso; candidatos: string[] } {
  const candidatos = codigoPais ? husosDelPais(codigoPais) : [];
  if (candidatos.length === 0) return { zona: porDefecto, origen: 'desconocido', candidatos };

  // Dos desfases distintos en enero o en julio = el país no tiene una sola hora.
  const anio = new Date(instante).getUTCFullYear();
  const muestras = [Date.UTC(anio, 0, 15, 12), Date.UTC(anio, 6, 15, 12), instante];
  const firma = (z: string): string => muestras.map((t) => desfaseZona(t, z)).join('/');
  const firmas = new Set(candidatos.map(firma));
  /** El huso equivalente a `z` con el nombre más reconocible (el del dispositivo, si lo es). */
  const nombreClaro = (z: string): string => {
    const iguales = candidatos.filter((c) => firma(c) === firma(z));
    if (iguales.includes(porDefecto)) return porDefecto;
    return PREFERIDOS.find((p) => iguales.includes(p)) ?? z;
  };
  if (firmas.size === 1) {
    return { zona: nombreClaro(candidatos[0]), origen: 'pais', candidatos };
  }

  const conReferencia = candidatos.filter((z) => REFERENCIA_HUSO[z]);
  let zona: string;
  if (conReferencia.length > 0) {
    const distancia = (z: string): number => {
      const [rlat, rlon] = REFERENCIA_HUSO[z];
      const dx = (rlon - lon) * Math.cos(((rlat + lat) / 2) * RAD);
      return dx * dx + (rlat - lat) ** 2;
    };
    zona = conReferencia.reduce((a, b) => (distancia(b) < distancia(a) ? b : a));
  } else {
    const horasSolares = lon / 15;
    const error = (z: string): number => Math.abs(desfaseZona(Date.UTC(anio, 0, 15, 12), z) / 60 - horasSolares);
    zona = candidatos.reduce((a, b) => (error(b) < error(a) ? b : a));
  }
  return { zona: nombreClaro(zona), origen: 'estimado', candidatos };
}

/** Días de diferencia entre dos fechas de calendario (b − a). */
export function diasEntre(a: FechaCivil, b: FechaCivil): number {
  return Math.round((Date.UTC(b.anio, b.mes - 1, b.dia) - Date.UTC(a.anio, a.mes - 1, a.dia)) / MS_DIA);
}

// ─── Eventos del día ────────────────────────────────────────────────────────────────────────

/** Tránsito (mediodía solar) más cercano a un instante de referencia. */
function transitoCercaDe(ms: number, lon: number): number {
  const medianocheUtc = Math.floor(ms / MS_DIA) * MS_DIA;
  let t = medianocheUtc + (720 - 4 * lon) * MS_MIN;
  for (let i = 0; i < 3; i++) {
    t = medianocheUtc + (720 - 4 * lon - efemeride(t).ecuacionTiempo) * MS_MIN;
  }
  // El tránsito se repite cada ~24 h: se lleva al más próximo a la referencia.
  while (t - ms > MS_DIA / 2) t -= MS_DIA;
  while (ms - t > MS_DIA / 2) t += MS_DIA;
  return t;
}

/** El mediodía solar que cae en la fecha civil `fecha` del huso `zona`. */
export function transitoDelDia(fecha: FechaCivil, lon: number, zona: string): number {
  // Punto de partida: las 12:00 de esa fecha en el huso del lugar.
  const docePrevias = Date.UTC(fecha.anio, fecha.mes - 1, fecha.dia, 12);
  const doce = docePrevias - desfaseZona(docePrevias, zona) * MS_MIN;
  let t = transitoCercaDe(doce, lon);
  for (let i = 0; i < 2; i++) {
    const d = diasEntre(fecha, fechaEnZona(t, zona));
    if (d === 0) break;
    t = transitoCercaDe(t - d * MS_DIA, lon);
  }
  return t;
}

/**
 * Instante en que la altura cruza `umbral` dentro de [desde, hasta], subiendo o bajando.
 * Muestrea cada 5 min y refina por bisección hasta el segundo. null si no lo cruza.
 */
function cruce(
  desde: number,
  hasta: number,
  lat: number,
  lon: number,
  umbral: number,
  subiendo: boolean,
): number | null {
  const PASO = 5 * MS_MIN;
  const f = (t: number): number => posicionSol(t, lat, lon).altura - umbral;
  let a = desde;
  let fa = f(a);
  while (a < hasta) {
    const b = Math.min(a + PASO, hasta);
    const fb = f(b);
    const cruza = subiendo ? fa < 0 && fb >= 0 : fa >= 0 && fb < 0;
    if (cruza) {
      let lo = a;
      let hi = b;
      let flo = fa;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (fm < 0 === flo < 0) {
          lo = mid;
          flo = fm;
        } else {
          hi = mid;
        }
      }
      return Math.round((lo + hi) / 2);
    }
    a = b;
    fa = fb;
  }
  return null;
}

export type Regimen = 'normal' | 'solDeMedianoche' | 'nochePolar';

export interface EventosDia {
  /** Instantes en ms UTC; null cuando el sol no cruza ese umbral ese día. */
  amanecerAstronomico: number | null;
  amanecerNautico: number | null;
  amanecerCivil: number | null;
  orto: number | null;
  finDoradaManana: number | null;
  mediodia: number;
  inicioDoradaTarde: number | null;
  ocaso: number | null;
  anochecerCivil: number | null;
  anochecerNautico: number | null;
  anochecerAstronomico: number | null;
  /** Minutos con el sol por encima del horizonte (1440 con sol de medianoche, 0 en noche polar). */
  duracionDia: number;
  regimen: Regimen;
  /** Alturas extremas del día: en el mediodía solar y en la medianoche solar. */
  alturaMaxima: number;
  alturaMinima: number;
}

/**
 * Eventos solares de la fecha civil `fecha` en el huso `zona`, para (lat, lon).
 * Los de la mañana se buscan en las 12 h anteriores al mediodía solar y los de la tarde en las
 * 12 h siguientes, así que un anochecer que cae pasada la medianoche civil (noches blancas)
 * sigue perteneciendo a su tarde.
 */
export function eventosDelDia(fecha: FechaCivil, lat: number, lon: number, zona: string): EventosDia {
  const mediodia = transitoDelDia(fecha, lon, zona);
  const inicio = mediodia - MS_DIA / 2;
  const fin = mediodia + MS_DIA / 2;
  const manana = (umbral: number): number | null => cruce(inicio, mediodia, lat, lon, umbral, true);
  const tarde = (umbral: number): number | null => cruce(mediodia, fin, lat, lon, umbral, false);

  const orto = manana(UMBRAL.horizonte);
  const ocaso = tarde(UMBRAL.horizonte);
  const alturaMaxima = posicionSol(mediodia, lat, lon).altura;
  const alturaMinima = Math.min(posicionSol(inicio, lat, lon).altura, posicionSol(fin, lat, lon).altura);

  let regimen: Regimen = 'normal';
  let duracionDia: number;
  if (orto !== null && ocaso !== null) {
    duracionDia = (ocaso - orto) / MS_MIN;
  } else if (alturaMaxima < UMBRAL.horizonte) {
    regimen = 'nochePolar';
    duracionDia = 0;
  } else if (alturaMinima >= UMBRAL.horizonte) {
    regimen = 'solDeMedianoche';
    duracionDia = 1440;
  } else {
    // Día de transición (el sol sale pero no se pone en la ventana, o al revés): se cuenta lo
    // que hay por encima del horizonte en las 24 h centradas en el mediodía.
    const desde = orto ?? inicio;
    const hasta = ocaso ?? fin;
    duracionDia = (hasta - desde) / MS_MIN;
  }

  return {
    amanecerAstronomico: manana(UMBRAL.astronomico),
    amanecerNautico: manana(UMBRAL.nautico),
    amanecerCivil: manana(UMBRAL.civil),
    orto,
    finDoradaManana: manana(UMBRAL.horaDorada),
    mediodia,
    inicioDoradaTarde: tarde(UMBRAL.horaDorada),
    ocaso,
    anochecerCivil: tarde(UMBRAL.civil),
    anochecerNautico: tarde(UMBRAL.nautico),
    anochecerAstronomico: tarde(UMBRAL.astronomico),
    duracionDia,
    regimen,
    alturaMaxima,
    alturaMinima,
  };
}

export type ClaveEvento = Exclude<keyof EventosDia, 'duracionDia' | 'regimen' | 'alturaMaxima' | 'alturaMinima'>;

/** Orden cronológico de los eventos de un día. */
export const ORDEN_EVENTOS: readonly ClaveEvento[] = [
  'amanecerAstronomico',
  'amanecerNautico',
  'amanecerCivil',
  'orto',
  'finDoradaManana',
  'mediodia',
  'inicioDoradaTarde',
  'ocaso',
  'anochecerCivil',
  'anochecerNautico',
  'anochecerAstronomico',
];

/**
 * Primer evento posterior a `ahora`, mirando la víspera, hoy y mañana en el huso del lugar
 * (el anochecer de la víspera puede caer pasada la medianoche de hoy).
 */
export function proximoEvento(
  ahora: number,
  lat: number,
  lon: number,
  zona: string,
): { clave: ClaveEvento; instante: number } | null {
  const hoy = fechaEnZona(ahora, zona);
  const candidatos: { clave: ClaveEvento; instante: number }[] = [];
  for (const desplazamiento of [-1, 0, 1]) {
    const base = new Date(Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia + desplazamiento));
    const fecha = { anio: base.getUTCFullYear(), mes: base.getUTCMonth() + 1, dia: base.getUTCDate() };
    const ev = eventosDelDia(fecha, lat, lon, zona);
    for (const clave of ORDEN_EVENTOS) {
      const instante = ev[clave];
      if (instante !== null && instante > ahora) candidatos.push({ clave, instante });
    }
  }
  candidatos.sort((a, b) => a.instante - b.instante);
  return candidatos[0] ?? null;
}

/** true si el sol está subiendo en ese instante (antes del mediodía solar). */
export function solSubiendo(ms: number, lat: number, lon: number): boolean {
  return posicionSol(ms + MS_MIN, lat, lon).altura > posicionSol(ms, lat, lon).altura;
}

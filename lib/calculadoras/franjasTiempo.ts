/**
 * Motor de informacion-tiempo: agrupa los tramos de 3 h del endpoint `/forecast` de
 * OpenWeatherMap en días y franjas (mañana, tarde, noche) EN LA HORA LOCAL DE LA CIUDAD.
 *
 * Por qué existe (18/11/2026): la app agrupaba por `dt_txt`, que va en UTC. Los días se cortaban
 * a medianoche UTC y el «mediodía» del icono era el tramo de las 12:00 UTC, que en Nueva York son
 * las 7:00. Con un resumen por días apenas se notaba; con franjas, la «mañana» de Nueva York
 * habría salido de madrugada. La respuesta trae el desfase de la ciudad (`city.timezone`, en
 * segundos respecto a UTC) y aquí se usa ese, nunca el huso del navegador.
 *
 * Franjas (hora local de la ciudad):
 *   mañana    06–12 h
 *   tarde     12–18 h
 *   noche     18–06 h · la noche del día D sigue en la madrugada de D+1, como se dice
 *                       «la noche del miércoles»
 *   madrugada 00–06 h · SOLO en el primer día y solo si se consulta antes de las 6: esos tramos
 *                       serían la noche del día anterior, que ya no se muestra
 *
 * Sin dependencias: lo prueban los goldens de tests/franjas-tiempo-motor.spec.ts.
 */

export interface TramoPronostico {
  dt: number; // instante del tramo, segundos Unix (UTC)
  main: { temp: number };
  weather: Array<{ id: number; description: string; icon: string }>;
  wind?: { speed: number }; // m/s
  pop?: number; // probabilidad de precipitación, 0–1
  rain?: { '3h'?: number }; // mm acumulados en el tramo
  snow?: { '3h'?: number };
}

export type ClaveFranja = 'madrugada' | 'manana' | 'tarde' | 'noche';

export interface FranjaPronostico {
  clave: ClaveFranja;
  nombre: string;
  horas: string;
  tempMin: number; // °C, redondeado
  tempMax: number;
  icon: string; // código de icono de OpenWeatherMap del tramo más significativo
  desc: string;
  probLluvia: number; // 0–1, la mayor de sus tramos
  precipitacionMm: number; // lluvia + nieve, suma de sus tramos
  vientoMaxKmh: number; // redondeado
  numTramos: number;
}

export interface DiaPronostico {
  clave: string; // AAAA-MM-DD local
  anio: number;
  mes: number; // 1–12
  dia: number;
  tempMin: number;
  tempMax: number;
  icon: string;
  desc: string;
  franjas: FranjaPronostico[]; // en orden; las que no tienen tramos no aparecen
  numTramos: number; // tramos del día natural: 8 = día completo
}

const DEFINICION_FRANJAS: Record<ClaveFranja, { nombre: string; horas: string }> = {
  madrugada: { nombre: 'Madrugada', horas: '00–06 h' },
  manana: { nombre: 'Mañana', horas: '06–12 h' },
  tarde: { nombre: 'Tarde', horas: '12–18 h' },
  noche: { nombre: 'Noche', horas: '18–06 h' },
};

const ORDEN_FRANJAS: ClaveFranja[] = ['madrugada', 'manana', 'tarde', 'noche'];

interface FechaHoraLocal {
  clave: string;
  anio: number;
  mes: number;
  dia: number;
  hora: number; // con fracción: 5,5 = 05:30
}

/** Fecha y hora locales de un instante, con el desfase de la ciudad. */
export function fechaHoraLocal(dt: number, desfaseSegundos: number): FechaHoraLocal {
  const d = new Date((dt + desfaseSegundos) * 1000);
  const anio = d.getUTCFullYear();
  const mes = d.getUTCMonth() + 1;
  const dia = d.getUTCDate();
  const hora = d.getUTCHours() + d.getUTCMinutes() / 60;
  const clave = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  return { clave, anio, mes, dia, hora };
}

/**
 * Peso de un código de condición de OpenWeatherMap: cuanto más alto, más condiciona el plan.
 * Tormenta > nieve > lluvia > llovizna > niebla/bruma > nubes (más cuanto más cubierto) > despejado.
 */
export function pesoCondicion(id: number): number {
  if (id >= 200 && id < 300) return 6;
  if (id >= 600 && id < 700) return 5;
  if (id >= 500 && id < 600) return 4;
  if (id >= 300 && id < 400) return 3;
  if (id >= 700 && id < 800) return 2;
  if (id > 800 && id < 900) return 1 + (id - 800) / 10; // 801 → 1,1 · 804 → 1,4
  return 0; // 800 despejado
}

/** El tramo que manda en el icono: el de condición más pesada; a igualdad, el primero. */
function tramoRepresentativo(tramos: TramoPronostico[]): TramoPronostico {
  let elegido = tramos[0];
  let pesoElegido = pesoCondicion(elegido.weather[0]?.id ?? 800);
  for (const t of tramos.slice(1)) {
    const peso = pesoCondicion(t.weather[0]?.id ?? 800);
    if (peso > pesoElegido) {
      elegido = t;
      pesoElegido = peso;
    }
  }
  return elegido;
}

function resumirFranja(clave: ClaveFranja, tramos: TramoPronostico[]): FranjaPronostico {
  const temps = tramos.map(t => t.main.temp);
  const rep = tramoRepresentativo(tramos);
  const precipitacion = tramos.reduce(
    (suma, t) => suma + (t.rain?.['3h'] ?? 0) + (t.snow?.['3h'] ?? 0),
    0
  );
  return {
    clave,
    nombre: DEFINICION_FRANJAS[clave].nombre,
    horas: DEFINICION_FRANJAS[clave].horas,
    tempMin: Math.round(Math.min(...temps)),
    tempMax: Math.round(Math.max(...temps)),
    icon: rep.weather[0]?.icon ?? '',
    desc: rep.weather[0]?.description ?? '',
    probLluvia: Math.max(...tramos.map(t => t.pop ?? 0)),
    // Redondeo a décimas aquí y no solo al pintar: la suma en coma flotante deja colas
    // (0,1 + 0,2 = 0,30000000000000004) y la vista decide si hay lluvia con «> 0»
    precipitacionMm: Math.round(precipitacion * 10) / 10,
    vientoMaxKmh: Math.round(Math.max(...tramos.map(t => (t.wind?.speed ?? 0) * 3.6))),
    numTramos: tramos.length,
  };
}

/**
 * Agrupa los tramos en los primeros `maxDias` días locales, cada uno con sus franjas.
 * El mínimo y el máximo del día son los del día natural (00–24 h local), como antes.
 */
export function agruparPronostico(
  tramos: TramoPronostico[],
  desfaseSegundos: number,
  maxDias = 5
): DiaPronostico[] {
  const ordenados = [...tramos].sort((a, b) => a.dt - b.dt);

  // 1. Días naturales locales, en orden de aparición
  const dias = new Map<string, { local: FechaHoraLocal; tramos: TramoPronostico[] }>();
  for (const t of ordenados) {
    const local = fechaHoraLocal(t.dt, desfaseSegundos);
    const dia = dias.get(local.clave);
    if (dia) dia.tramos.push(t);
    else dias.set(local.clave, { local, tramos: [t] });
  }
  const claves = [...dias.keys()];
  const primeraClave = claves[0];

  // 2. Reparto en franjas. La madrugada (00–06) es la noche del día anterior, salvo en el
  //    primer día, que no tiene día anterior a la vista
  const franjasPorDia = new Map<string, Map<ClaveFranja, TramoPronostico[]>>();
  const anadir = (claveDia: string, franja: ClaveFranja, t: TramoPronostico) => {
    let porFranja = franjasPorDia.get(claveDia);
    if (!porFranja) {
      porFranja = new Map();
      franjasPorDia.set(claveDia, porFranja);
    }
    const lista = porFranja.get(franja);
    if (lista) lista.push(t);
    else porFranja.set(franja, [t]);
  };

  for (const t of ordenados) {
    const local = fechaHoraLocal(t.dt, desfaseSegundos);
    if (local.hora < 6) {
      if (local.clave === primeraClave) {
        anadir(local.clave, 'madrugada', t);
      } else {
        const anterior = claves[claves.indexOf(local.clave) - 1];
        anadir(anterior, 'noche', t);
      }
    } else if (local.hora < 12) {
      anadir(local.clave, 'manana', t);
    } else if (local.hora < 18) {
      anadir(local.clave, 'tarde', t);
    } else {
      anadir(local.clave, 'noche', t);
    }
  }

  // 3. Resumen de cada día
  return claves.slice(0, maxDias).map(clave => {
    const { local, tramos: delDia } = dias.get(clave)!;
    const temps = delDia.map(t => t.main.temp);
    // Icono del día: el tramo más cercano a las 13:00 locales (antes, el de las 12:00 UTC)
    const mediodia = delDia.reduce((mejor, t) =>
      Math.abs(fechaHoraLocal(t.dt, desfaseSegundos).hora - 13) <
      Math.abs(fechaHoraLocal(mejor.dt, desfaseSegundos).hora - 13)
        ? t
        : mejor
    );
    const porFranja = franjasPorDia.get(clave);
    const franjas = ORDEN_FRANJAS.filter(f => porFranja?.has(f)).map(f =>
      resumirFranja(f, porFranja!.get(f)!)
    );
    return {
      clave,
      anio: local.anio,
      mes: local.mes,
      dia: local.dia,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      icon: mediodia.weather[0]?.icon ?? '',
      desc: mediodia.weather[0]?.description ?? '',
      franjas,
      numTramos: delDia.length,
    };
  });
}

export interface PronosticoRepartido {
  hoy: DiaPronostico | null; // lo que queda de hoy; null si el pronóstico ya empieza mañana
  siguientes: DiaPronostico[]; // días posteriores COMPLETOS (8 tramos), hasta `maxSiguientes`
  extremosHoy: { min: number; max: number } | null;
}

/**
 * Reparte el pronóstico en «hoy» (que va en la tarjeta del tiempo actual) y los días siguientes.
 *
 * Por qué existe (19/11/2026): la tarjeta del tiempo actual pintaba como máxima y mínima los
 * `temp_max` / `temp_min` de /weather, que NO son los del día: son la dispersión entre estaciones
 * de la zona en ese instante (Mataró a las 7:51: «↑20° ↓18°» con una mínima prevista de 10°).
 * Aquí salen de las franjas que quedan de hoy —la noche incluida, hasta las 6 del día siguiente,
 * que es lo que se ve debajo— más la temperatura actual. El endpoint gratuito no da las horas ya
 * pasadas: es la máxima y la mínima de lo que queda, no del día entero.
 *
 * El último día de los 40 tramos suele venir a medias (sus mín./máx. serían falsos): solo pasan
 * los días con sus 8 tramos.
 */
export function repartirPronostico(
  tramos: TramoPronostico[],
  desfaseSegundos: number,
  dtActual: number,
  tempActual: number,
  maxSiguientes = 5
): PronosticoRepartido {
  const claveHoy = fechaHoraLocal(dtActual, desfaseSegundos).clave;
  const dias = agruparPronostico(tramos, desfaseSegundos, 6);
  const hoy = dias.find(d => d.clave === claveHoy) ?? null;
  const siguientes = dias
    .filter(d => d.clave > claveHoy && d.numTramos >= 8)
    .slice(0, maxSiguientes);

  let extremosHoy: PronosticoRepartido['extremosHoy'] = null;
  if (hoy && hoy.franjas.length > 0) {
    const actual = Math.round(tempActual);
    extremosHoy = {
      min: Math.min(actual, ...hoy.franjas.map(f => f.tempMin)),
      max: Math.max(actual, ...hoy.franjas.map(f => f.tempMax)),
    };
  }
  return { hoy, siguientes, extremosHoy };
}

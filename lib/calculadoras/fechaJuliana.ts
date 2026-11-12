/**
 * Motor de `conversor-fecha-juliana` (S0271, 12/11/2026). Lógica pura, sin React ni `Date`.
 * Casos resueltos a mano en `tests/fecha-juliana-motor.spec.ts`.
 *
 * «Fecha juliana» nombra dos cosas que no tienen nada que ver, y la app cubre las dos:
 *
 * 1 · La FECHA ORDINAL (día del año), que la industria llama «fecha juliana» o «código
 *     juliano»: 12/11/2026 es el día 316 y se imprime en un lote como 26316 (AADDD), 2026316
 *     (AAAADDD) o 6316 (ADDD). ISO 8601 la escribe 2026-316. Va con el calendario gregoriano.
 *
 * 2 · El DÍA JULIANO astronómico (JD): días, con decimales, desde el mediodía (tiempo
 *     universal) del 1 de enero del 4713 a. C. del calendario juliano. El 1/1/2000 a las 12:00
 *     UTC es el JD 2.451.545,0. Se convierte con el algoritmo de Jean Meeus (Astronomical
 *     Algorithms, 2.ª ed., cap. 7), que usa el calendario JULIANO hasta el 4/10/1582 y el
 *     GREGORIANO desde el 15/10/1582, como hacen los astrónomos: los días 5 a 14 de octubre de
 *     1582 no existieron en ninguno de los dos y se rechazan.
 *
 * ── Por qué sin `Date` ─────────────────────────────────────────────────────────
 * `Date` usa el gregoriano proléptico hacia atrás sin límite, así que una fecha de 1500 sale
 * desplazada diez días respecto a la que escribe un historiador o un astrónomo, y depende de la
 * zona horaria del navegador. Aquí todo es aritmética entera sobre (año, mes, día) y tiempo
 * universal.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Calendario gregoriano
// ─────────────────────────────────────────────────────────────────────────────

export const NOMBRES_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

/** 0 = domingo … 6 = sábado, como `Date.getDay()`. */
export const NOMBRES_DIA_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function esBisiestoGregoriano(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

export function esBisiestoJuliano(anio: number): boolean {
  // Con años astronómicos (el 1 a. C. es el año 0) la regla es la misma para los negativos.
  return ((anio % 4) + 4) % 4 === 0;
}

export function diasDelAnio(anio: number): number {
  return esBisiestoGregoriano(anio) ? 366 : 365;
}

function diasDelMes(anio: number, mes: number, bisiesto: (a: number) => boolean): number {
  return mes === 2 && bisiesto(anio) ? 29 : DIAS_MES[mes - 1];
}

export interface FechaCivil {
  anio: number;
  mes: number;
  dia: number;
}

/** ¿Existe esa fecha en el calendario gregoriano? (Para la fecha ordinal: años 1 a 9999.) */
export function esFechaGregorianaValida({ anio, mes, dia }: FechaCivil): boolean {
  if (![anio, mes, dia].every(Number.isInteger)) return false;
  if (anio < 1 || anio > 9999 || mes < 1 || mes > 12 || dia < 1) return false;
  return dia <= diasDelMes(anio, mes, esBisiestoGregoriano);
}

/** Día del año (1 a 365/366) de una fecha gregoriana válida. */
export function diaDelAnio({ anio, mes, dia }: FechaCivil): number {
  let n = dia;
  for (let m = 1; m < mes; m++) n += diasDelMes(anio, m, esBisiestoGregoriano);
  return n;
}

/** Fecha gregoriana del día `ordinal` del año `anio`. `null` si el día no existe ese año. */
export function fechaDesdeOrdinal(anio: number, ordinal: number): FechaCivil | null {
  if (!Number.isInteger(anio) || anio < 1 || anio > 9999) return null;
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > diasDelAnio(anio)) return null;
  let resto = ordinal;
  for (let mes = 1; mes <= 12; mes++) {
    const dm = diasDelMes(anio, mes, esBisiestoGregoriano);
    if (resto <= dm) return { anio, mes, dia: resto };
    resto -= dm;
  }
  return null; // inalcanzable con el ordinal validado
}

/**
 * Día de la semana (0 = domingo) de una fecha GREGORIANA, también antes de 1582 (gregoriano
 * proléptico, el de la fecha ordinal). Método de Tomohiko Sakamoto.
 */
export function diaSemanaGregoriano({ anio, mes, dia }: FechaCivil): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const y = mes < 3 ? anio - 1 : anio;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[mes - 1] + dia) % 7;
}

const relleno = (n: number, cifras: number): string => String(Math.abs(n)).padStart(cifras, '0');

/** «12/11/2026» (DD/MM/AAAA). */
export function textoFecha({ anio, mes, dia }: FechaCivil): string {
  return `${relleno(dia, 2)}/${relleno(mes, 2)}/${anio < 1 ? `${1 - anio} a. C.` : relleno(anio, 4)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Fecha ordinal («fecha juliana» de la industria)
// ─────────────────────────────────────────────────────────────────────────────

export interface CodigosOrdinales {
  ordinal: number;
  diasRestantes: number;
  /** AADDD: 26316 */
  aaddd: string;
  /** AAAADDD: 2026316 */
  aaaaddd: string;
  /** ADDD: 6316 (el año con una cifra; habitual en lotes de alimentación) */
  addd: string;
  /** ISO 8601 ordinal: 2026-316 */
  iso: string;
}

export function codigosDeFecha(fecha: FechaCivil): CodigosOrdinales | null {
  if (!esFechaGregorianaValida(fecha)) return null;
  const ordinal = diaDelAnio(fecha);
  const ddd = relleno(ordinal, 3);
  return {
    ordinal,
    diasRestantes: diasDelAnio(fecha.anio) - ordinal,
    aaddd: `${relleno(fecha.anio % 100, 2)}${ddd}`,
    aaaaddd: `${relleno(fecha.anio, 4)}${ddd}`,
    addd: `${fecha.anio % 10}${ddd}`,
    iso: `${relleno(fecha.anio, 4)}-${ddd}`,
  };
}

export type FormatoCodigo = 'DDD' | 'ADDD' | 'AADDD' | 'AAAADDD';

export type LecturaCodigo =
  | {
      ok: true;
      formato: FormatoCodigo;
      fecha: FechaCivil;
      ordinal: number;
      /** Otras lecturas posibles cuando el código no lleva el año entero (otra década o siglo). */
      alternativas: FechaCivil[];
    }
  | { ok: false; error: string };

/**
 * Lee un código juliano de lote. El formato sale del número de cifras (se ignoran espacios,
 * guiones y puntos: «2026-316» vale como AAAADDD):
 *   · 3 cifras (DDD): el día del año `anioReferencia`.
 *   · 4 cifras (ADDD): el último año acabado en esa cifra que no pasa de `anioReferencia`
 *     —un lote se fabrica en el pasado—; las décadas vecinas van como alternativas.
 *   · 5 cifras (AADDD): el año de dos cifras más cercano a `anioReferencia` (ventana de
 *     ±50 años: con 2026, «99» es 1999 y «30» es 2030); el otro siglo, como alternativa.
 *   · 7 cifras (AAAADDD).
 * `anioReferencia` es el año en curso: lo pone la vista al montar, no el motor.
 */
export function leerCodigo(texto: string, anioReferencia: number): LecturaCodigo {
  const limpio = texto.replace(/[\s.\-/]/g, '');
  if (limpio === '') return { ok: false, error: 'Escribe el código: solo cifras, entre 3 y 7.' };
  if (!/^\d+$/.test(limpio)) return { ok: false, error: 'El código solo puede llevar cifras (se admiten espacios y guiones).' };

  const ddd = Number(limpio.slice(-3));
  const prefijo = limpio.slice(0, -3);
  let formato: FormatoCodigo;
  let anio: number;
  let candidatos: number[] = [];

  switch (limpio.length) {
    case 3:
      formato = 'DDD';
      anio = anioReferencia;
      break;
    case 4: {
      formato = 'ADDD';
      const cifra = Number(prefijo);
      anio = anioReferencia - ((((anioReferencia - cifra) % 10) + 10) % 10);
      candidatos = [anio - 10, anio + 10];
      break;
    }
    case 5: {
      formato = 'AADDD';
      const dos = Number(prefijo);
      anio = Math.floor(anioReferencia / 100) * 100 + dos;
      if (anio > anioReferencia + 50) anio -= 100;
      else if (anio < anioReferencia - 50) anio += 100;
      candidatos = [anio < anioReferencia ? anio + 100 : anio - 100];
      break;
    }
    case 7:
      formato = 'AAAADDD';
      anio = Number(prefijo);
      break;
    default:
      return {
        ok: false,
        error: `Un código juliano tiene 3, 4, 5 o 7 cifras (DDD, ADDD, AADDD o AAAADDD); este tiene ${limpio.length}.`,
      };
  }

  if (anio < 1 || anio > 9999) return { ok: false, error: 'El año del código queda fuera del intervalo 1-9999.' };
  if (ddd < 1) return { ok: false, error: 'El día del año empieza en 001: «000» no existe.' };
  const fecha = fechaDesdeOrdinal(anio, ddd);
  if (!fecha) {
    return {
      ok: false,
      error: ddd === 366
        ? `${anio} no es bisiesto: tiene 365 días, así que el día 366 no existe.`
        : `El día del año va de 001 a ${diasDelAnio(anio)}; ${relleno(ddd, 3)} no existe.`,
    };
  }
  const alternativas = candidatos
    .map((a) => fechaDesdeOrdinal(a, ddd))
    .filter((f): f is FechaCivil => f !== null);
  return { ok: true, formato, fecha, ordinal: ddd, alternativas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Día juliano astronómico (Meeus, cap. 7)
// ─────────────────────────────────────────────────────────────────────────────

/** Diferencia entre el JD y el día juliano modificado (MJD = JD − 2.400.000,5). */
export const DESFASE_MJD = 2400000.5;

/** JD de la primera fecha gregoriana (15/10/1582 a las 0:00 UT). */
const JD_INICIO_GREGORIANO = 2299160.5;

export interface FechaHoraUT extends FechaCivil {
  hora: number;
  minuto: number;
  segundo: number;
}

export type Calendario = 'gregoriano' | 'juliano';

/** ¿En qué calendario se lee esa fecha? El cambio va del 4/10/1582 (juliano) al 15/10/1582. */
export function calendarioDe({ anio, mes, dia }: FechaCivil): Calendario | 'inexistente' {
  const clave = anio * 10000 + mes * 100 + dia;
  if (clave >= 15821015) return 'gregoriano';
  if (clave <= 15821004) return 'juliano';
  return 'inexistente';
}

export type ResultadoJd =
  | { ok: true; jd: number; mjd: number; calendario: Calendario; diaSemana: number }
  | { ok: false; error: string };

/** Día de la semana (0 = domingo) del día civil que contiene ese JD. */
export function diaSemanaDeJd(jd: number): number {
  return ((Math.floor(jd + 1.5) % 7) + 7) % 7;
}

/**
 * JD de una fecha y hora en tiempo universal. Años 1 a 9999: antes del 15/10/1582 la fecha se
 * lee en el calendario juliano.
 */
export function jdDesdeFecha(f: FechaHoraUT): ResultadoJd {
  const { anio, mes, dia, hora, minuto, segundo } = f;
  if (![anio, mes, dia, hora, minuto].every(Number.isInteger) || !Number.isFinite(segundo)) {
    return { ok: false, error: 'Revisa la fecha y la hora: hay un campo vacío o que no es un número.' };
  }
  if (anio < 1 || anio > 9999) return { ok: false, error: 'El año tiene que estar entre 1 y 9999.' };
  if (mes < 1 || mes > 12) return { ok: false, error: 'El mes va de 1 a 12.' };
  if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59 || segundo < 0 || segundo >= 60) {
    return { ok: false, error: 'La hora va de 00:00:00 a 23:59:59.' };
  }
  const calendario = calendarioDe(f);
  if (calendario === 'inexistente') {
    return {
      ok: false,
      error: 'Del 5 al 14 de octubre de 1582 no hubo días: tras el jueves 4 (juliano) vino el viernes 15 (gregoriano).',
    };
  }
  const bisiesto = calendario === 'gregoriano' ? esBisiestoGregoriano : esBisiestoJuliano;
  if (dia < 1 || dia > diasDelMes(anio, mes, bisiesto)) {
    return { ok: false, error: `${NOMBRES_MES[mes - 1]} de ${anio} no tiene día ${dia} en el calendario ${calendario}.` };
  }

  let y = anio;
  let m = mes;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  let b = 0;
  if (calendario === 'gregoriano') {
    const a = Math.floor(y / 100);
    b = 2 - a + Math.floor(a / 4);
  }
  const fraccion = (hora + minuto / 60 + segundo / 3600) / 24;
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dia + fraccion + b - 1524.5;
  return { ok: true, jd, mjd: jd - DESFASE_MJD, calendario, diaSemana: diaSemanaDeJd(jd) };
}

export type ResultadoFechaDesdeJd =
  | { ok: true; fecha: FechaHoraUT; calendario: Calendario; diaSemana: number; mjd: number }
  | { ok: false; error: string };

/** JD mínimo y máximo que acepta la vista: 1/1/1 (juliano) y 31/12/9999 23:59:59. */
export const JD_MINIMO = 1721423.5;
export const JD_MAXIMO = 5373484.499988426;

/** Fecha y hora UT de un JD, redondeada al segundo. Inverso de Meeus (cap. 7). */
export function fechaDesdeJd(jd: number): ResultadoFechaDesdeJd {
  if (!Number.isFinite(jd)) return { ok: false, error: 'Escribe un día juliano: un número, con decimales si quieres la hora.' };
  if (jd < JD_MINIMO || jd > JD_MAXIMO) {
    return { ok: false, error: 'El día juliano tiene que corresponder a una fecha entre el año 1 y el 9999 (de 1.721.423,5 a 5.373.484,5).' };
  }
  // Redondear al segundo ANTES de separar día y hora, para que 23:59:59,6 pase al día siguiente
  // en vez de pintar «24:00:00».
  let z = Math.floor(jd + 0.5);
  let segundos = Math.round((jd + 0.5 - z) * 86400);
  if (segundos >= 86400) {
    z += 1;
    segundos -= 86400;
  }
  let a = z;
  if (z >= JD_INICIO_GREGORIANO + 0.5) {
    const alfa = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alfa - Math.floor(alfa / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const dia = b - d - Math.floor(30.6001 * e);
  const mes = e < 14 ? e - 1 : e - 13;
  const anio = mes > 2 ? c - 4716 : c - 4715;
  const fecha: FechaHoraUT = {
    anio,
    mes,
    dia,
    hora: Math.floor(segundos / 3600),
    minuto: Math.floor((segundos % 3600) / 60),
    segundo: segundos % 60,
  };
  return {
    ok: true,
    fecha,
    calendario: z >= JD_INICIO_GREGORIANO + 0.5 ? 'gregoriano' : 'juliano',
    diaSemana: diaSemanaDeJd(jd),
    mjd: jd - DESFASE_MJD,
  };
}

/** «14:30:05». */
export function textoHora({ hora, minuto, segundo }: FechaHoraUT): string {
  return `${relleno(hora, 2)}:${relleno(minuto, 2)}:${relleno(Math.round(segundo), 2)}`;
}

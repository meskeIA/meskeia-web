/**
 * Calculadoras de fechas — lógica pura sin React ni DOM
 * Usadas por: asistente conversacional, MCP server
 */

// ---------------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------------

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function parsearFecha(str: string): Date {
  if (str === 'hoy' || str === 'today') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // Esperar formato YYYY-MM-DD
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d.getTime())) {
    throw new Error(`Fecha inválida: "${str}". Usa formato YYYY-MM-DD o "hoy".`);
  }
  return d;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatearLargo(d: Date): string {
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// 1. Diferencia entre dos fechas
// ---------------------------------------------------------------------------

export interface ParametrosDiferenciaFechas {
  fechaInicio: string; // YYYY-MM-DD o "hoy"
  fechaFin: string;    // YYYY-MM-DD o "hoy"
}

export interface ResultadoDiferenciaFechas {
  diasTotales: number;
  semanas: number;
  mesesAproximados: number;
  aniosExactos: number;
  mesesExactos: number;
  diasExactos: number;
  descripcion: string; // ej: "2 años, 3 meses y 5 días"
}

export function calcularDiferenciaFechas(p: ParametrosDiferenciaFechas): ResultadoDiferenciaFechas {
  const inicio = parsearFecha(p.fechaInicio);
  const fin = parsearFecha(p.fechaFin);

  if (inicio > fin) {
    throw new Error('La fecha de inicio debe ser anterior o igual a la fecha fin.');
  }

  const diffMs = fin.getTime() - inicio.getTime();
  const diasTotales = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(diasTotales / 7);
  const mesesAproximados = Math.floor(diasTotales / 30.44);

  // Cálculo exacto en años/meses/días
  let anios = fin.getFullYear() - inicio.getFullYear();
  let meses = fin.getMonth() - inicio.getMonth();
  let dias = fin.getDate() - inicio.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} año${anios !== 1 ? 's' : ''}`);
  if (meses > 0) partes.push(`${meses} mes${meses !== 1 ? 'es' : ''}`);
  if (dias > 0) partes.push(`${dias} día${dias !== 1 ? 's' : ''}`);
  const descripcion = partes.length > 0 ? partes.join(', ') : 'Misma fecha (0 días)';

  return { diasTotales, semanas, mesesAproximados, aniosExactos: anios, mesesExactos: meses, diasExactos: dias, descripcion };
}

// ---------------------------------------------------------------------------
// 2. Sumar o restar tiempo a una fecha
// ---------------------------------------------------------------------------

export type UnidadTiempo = 'dias' | 'semanas' | 'meses' | 'anios';
export type OperacionFecha = 'sumar' | 'restar';

export interface ParametrosOperacionFecha {
  fechaBase: string;       // YYYY-MM-DD o "hoy"
  operacion: OperacionFecha;
  cantidad: number;
  unidad: UnidadTiempo;
}

export interface ResultadoOperacionFecha {
  fechaResultado: string;  // YYYY-MM-DD
  fechaFormateada: string; // "Lunes, 15 de marzo de 2026"
  diaSemana: string;
}

export function calcularOperacionFecha(p: ParametrosOperacionFecha): ResultadoOperacionFecha {
  if (p.cantidad <= 0) throw new Error('La cantidad debe ser mayor que 0.');

  const base = parsearFecha(p.fechaBase);
  const resultado = new Date(base);
  const mult = p.operacion === 'sumar' ? 1 : -1;

  switch (p.unidad) {
    case 'dias':
      resultado.setDate(resultado.getDate() + p.cantidad * mult);
      break;
    case 'semanas':
      resultado.setDate(resultado.getDate() + p.cantidad * 7 * mult);
      break;
    case 'meses':
      resultado.setMonth(resultado.getMonth() + p.cantidad * mult);
      break;
    case 'anios':
      resultado.setFullYear(resultado.getFullYear() + p.cantidad * mult);
      break;
  }

  return {
    fechaResultado: toISO(resultado),
    fechaFormateada: formatearLargo(resultado),
    diaSemana: DIAS[resultado.getDay()],
  };
}

// ---------------------------------------------------------------------------
// 3. Día de la semana de una fecha
// ---------------------------------------------------------------------------

export interface ParametrosDiaSemana {
  fecha: string; // YYYY-MM-DD o "hoy"
}

export interface ResultadoDiaSemana {
  diaSemana: string;
  fechaFormateada: string;
  referenciaHoy: string; // "hace 5 días", "en 3 días", "hoy", "ayer", "mañana"
}

export function calcularDiaSemana(p: ParametrosDiaSemana): ResultadoDiaSemana {
  const fecha = parsearFecha(p.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffDias = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  let referenciaHoy: string;
  if (diffDias === 0) referenciaHoy = 'hoy';
  else if (diffDias === 1) referenciaHoy = 'mañana';
  else if (diffDias === -1) referenciaHoy = 'ayer';
  else if (diffDias > 0) referenciaHoy = `en ${diffDias} días`;
  else referenciaHoy = `hace ${Math.abs(diffDias)} días`;

  return {
    diaSemana: DIAS[fecha.getDay()],
    fechaFormateada: formatearLargo(fecha),
    referenciaHoy,
  };
}

// ---------------------------------------------------------------------------
// 4. Calcular edad exacta
// ---------------------------------------------------------------------------

export interface ParametrosEdad {
  fechaNacimiento: string;  // YYYY-MM-DD
  fechaReferencia?: string; // YYYY-MM-DD o "hoy" (por defecto hoy)
}

export interface ResultadoEdad {
  anios: number;
  meses: number;
  dias: number;
  totalDias: number;
  proximoCumpleanos: string;           // YYYY-MM-DD
  diasHastaProximoCumpleanos: number;
  descripcion: string;                  // "25 años, 3 meses y 12 días"
}

export function calcularEdad(p: ParametrosEdad): ResultadoEdad {
  const nacimiento = parsearFecha(p.fechaNacimiento);
  const referencia = p.fechaReferencia
    ? parsearFecha(p.fechaReferencia)
    : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  if (nacimiento >= referencia) {
    throw new Error('La fecha de nacimiento debe ser anterior a la fecha de referencia.');
  }

  let anios = referencia.getFullYear() - nacimiento.getFullYear();
  let meses = referencia.getMonth() - nacimiento.getMonth();
  let dias = referencia.getDate() - nacimiento.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(referencia.getFullYear(), referencia.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  const totalDias = Math.floor((referencia.getTime() - nacimiento.getTime()) / (1000 * 60 * 60 * 24));

  let proxCumple = new Date(referencia.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
  if (proxCumple <= referencia) proxCumple.setFullYear(proxCumple.getFullYear() + 1);
  const diasHastaProx = Math.floor((proxCumple.getTime() - referencia.getTime()) / (1000 * 60 * 60 * 24));

  return {
    anios,
    meses,
    dias,
    totalDias,
    proximoCumpleanos: toISO(proxCumple),
    diasHastaProximoCumpleanos: diasHastaProx,
    descripcion: `${anios} años, ${meses} meses y ${dias} días`,
  };
}

/**
 * Motor del Orientador de Tensión Arterial — sin dependencias de React ni del DOM.
 *
 * Aquí vive todo lo que decide una cifra o una categoría: la tabla ESH 2023, la lectura de
 * los campos, los derivados (TAM, presión de pulso) y la lectura del historial guardado.
 * La vista (`page.tsx`) solo pinta lo que este módulo devuelve.
 *
 * ── Los decimales (hallazgo 1717, 25/09/2026) ──────────────────────────────────────────
 * Hasta esa fecha la vista leía los campos con `parseInt`, que TRUNCA: 179,67 (la media de
 * 179, 180 y 180, justo lo que la app pide introducir en su paso 5) se quedaba en 179 y la
 * lectura bajaba de crisis a grado 2, siempre hacia la categoría menos grave y sin avisar.
 * La ESH define sus cortes en mmHg enteros (140–159, ≥ 180…), así que un valor con
 * decimales se REDONDEA al entero más próximo —179,67 → 180, 139,5 → 140— y la vista dice
 * qué valor tecleó la persona y con cuál se ha clasificado.
 *
 * ── El historial (hallazgo 1718, 25/09/2026) ───────────────────────────────────────────
 * El historial guardaba la categoría (`clasificacionId`) y la pintaba tal cual. Hasta el
 * 25/08/2026 toda lectura con diastólica < 60 y sistólica 90–179 se guardaba como
 * 'hipotension' (crítico 294), así que el error seguía a la vista para quien usó la app
 * antes del arreglo. La categoría se DERIVA de sistólica y diastólica, así que ya no se
 * guarda ni se lee: se recalcula al pintar. Una lectura guardada que no se puede leer
 * (valores ausentes, fuera de rango o sistólica ≤ diastólica) no recibe categoría.
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ClasificacionId =
  | 'hipotension'
  | 'optima'
  | 'normal'
  | 'normal-alta'
  | 'hta-grado-1'
  | 'hta-grado-2'
  | 'hta-grado-3'
  | 'crisis-hipertensiva'
  | 'sistolica-aislada';

export type Urgencia = 'normal' | 'atencion' | 'alerta' | 'urgente' | 'emergencia';

export interface Clasificacion {
  id: ClasificacionId;
  nombre: string;
  descripcion: string;
  recomendacion: string;
  color: string;
  urgencia: Urgencia;
}

// ─── Clasificaciones ESH 2023 ────────────────────────────────────────────────

export const CLASIFICACIONES: Record<ClasificacionId, Clasificacion> = {
  hipotension: {
    id: 'hipotension',
    nombre: 'Hipotensión',
    descripcion: 'Tensión arterial por debajo de los valores normales (< 90/60 mmHg)',
    recomendacion: 'Consulta con tu médico si presentas síntomas como mareos, cansancio o desmayos.',
    color: 'var(--cl-hipotension)',
    urgencia: 'atencion',
  },
  optima: {
    id: 'optima',
    nombre: 'Tensión Óptima',
    descripcion: 'Tensión arterial en los valores más saludables (< 120/80 mmHg)',
    recomendacion: 'Excelente. Mantén tus hábitos de vida saludable.',
    color: 'var(--cl-optima)',
    urgencia: 'normal',
  },
  normal: {
    id: 'normal',
    nombre: 'Tensión Normal',
    descripcion: 'Tensión arterial dentro del rango normal (120–129 / 80–84 mmHg)',
    recomendacion: 'Bien. Continúa con hábitos saludables y revisiones periódicas.',
    color: 'var(--cl-normal)',
    urgencia: 'normal',
  },
  'normal-alta': {
    id: 'normal-alta',
    nombre: 'Normal-Alta',
    descripcion: 'Tensión en el límite superior de la normalidad (130–139 / 85–89 mmHg)',
    recomendacion: 'Presta atención a tu dieta, reduce el sodio y haz ejercicio regular. Consulta a tu médico.',
    color: 'var(--cl-normal-alta)',
    urgencia: 'atencion',
  },
  'hta-grado-1': {
    id: 'hta-grado-1',
    nombre: 'HTA Grado 1',
    descripcion: 'Hipertensión leve (140–159 / 90–99 mmHg)',
    recomendacion: 'Consulta a tu médico. Pueden recomendarse cambios en el estilo de vida o tratamiento.',
    color: 'var(--cl-hta1)',
    urgencia: 'alerta',
  },
  'hta-grado-2': {
    id: 'hta-grado-2',
    nombre: 'HTA Grado 2',
    descripcion: 'Hipertensión moderada (160–179 / 100–109 mmHg)',
    recomendacion: 'Consulta a tu médico con prontitud. Suele requerir tratamiento farmacológico.',
    color: 'var(--cl-hta2)',
    urgencia: 'urgente',
  },
  'hta-grado-3': {
    id: 'hta-grado-3',
    nombre: 'HTA Grado 3',
    descripcion: 'Hipertensión severa (≥ 180 / ≥ 110 mmHg)',
    recomendacion: 'Busca atención médica urgente. No esperes para consultar.',
    color: 'var(--cl-hta3)',
    urgencia: 'emergencia',
  },
  'crisis-hipertensiva': {
    id: 'crisis-hipertensiva',
    nombre: 'Crisis Hipertensiva',
    descripcion: 'Tensión sistólica ≥ 180 mmHg y/o diastólica ≥ 120 mmHg',
    // Sin emoji: la cadena se lee en voz alta y un lector de pantalla antepondría
    // «señal de advertencia» a la única instrucción urgente de la app (hallazgo 297).
    recomendacion: 'Acude a urgencias inmediatamente o llama al 112.',
    color: 'var(--cl-crisis)',
    urgencia: 'emergencia',
  },
  'sistolica-aislada': {
    id: 'sistolica-aislada',
    nombre: 'HTA Sistólica Aislada',
    descripcion: 'Sistólica elevada con diastólica normal (≥ 140 / < 90 mmHg)',
    recomendacion: 'Consulta a tu médico. Es frecuente en personas mayores y requiere seguimiento.',
    color: 'var(--cl-hta1)',
    urgencia: 'alerta',
  },
};

// ─── Clasificación ESH 2023 ──────────────────────────────────────────────────

/**
 * Clasifica una lectura (en mmHg ENTEROS) según la tabla de la ESH 2023.
 *
 * La regla que gobierna toda la tabla es que **manda la categoría más alta de las dos**:
 * si la sistólica cae en grado 2 y la diastólica es normal, la lectura es de grado 2. De
 * ahí que las ramas vayan de mayor a menor gravedad y que la hipotensión se evalúe la
 * ÚLTIMA: hasta el 25/08/2026 iba la segunda y con OR, así que toda lectura con
 * diastólica < 60 se resolvía como «Hipotensión» sin llegar a mirar la sistólica —
 * 175/55 salía rotulada como tensión baja (hallazgo 294 del Inspector).
 *
 * La HTA sistólica aislada NO es una rama de esta función: la guía la gradúa por el valor
 * de la sistólica, así que es un matiz sobre el grado (ver `esSistolicaAislada`), no una
 * categoría que lo sustituya.
 */
export function clasificarTension(sis: number, dia: number): ClasificacionId {
  // Crisis hipertensiva (prioridad máxima) — PAS ≥ 180 y/o PAD ≥ 120
  if (sis >= 180 || dia >= 120) return 'crisis-hipertensiva';
  if (sis >= 180 || dia >= 110) return 'hta-grado-3';
  if (sis >= 160 || dia >= 100) return 'hta-grado-2';
  if (sis >= 140 || dia >= 90) return 'hta-grado-1';
  if (sis >= 130 || dia >= 85) return 'normal-alta';
  // Hipotensión — solo cuando NADA está elevado, para que nunca eclipse a una HTA. Va aquí
  // y no al final para no perder los casos de diastólica baja con sistólica de 120-129.
  if (sis < 90 || dia < 60) return 'hipotension';
  if (sis >= 120 || dia >= 80) return 'normal';
  return 'optima';
}

/**
 * Patrón de HTA sistólica aislada: sistólica alta con diastólica normal, típico de la
 * rigidez arterial del mayor. Se superpone al grado, que lo fija la sistólica.
 */
export function esSistolicaAislada(sis: number, dia: number): boolean {
  return sis >= 140 && dia < 90;
}

/** Nombre que se muestra: el del grado, con el matiz del patrón cuando lo hay. */
export function nombreClasificacion(clId: ClasificacionId, sis: number, dia: number): string {
  const base = CLASIFICACIONES[clId].nombre;
  if (!esSistolicaAislada(sis, dia)) return base;
  if (clId === 'hta-grado-1') return 'HTA Sistólica Aislada (Grado 1)';
  if (clId === 'hta-grado-2') return 'HTA Sistólica Aislada (Grado 2)';
  if (clId === 'hta-grado-3') return 'HTA Sistólica Aislada (Grado 3)';
  return base;
}

/** TAM = diastólica + (sistólica − diastólica) / 3, redondeada al mmHg. */
export function calcularTAM(sis: number, dia: number): number {
  return Math.round(dia + (sis - dia) / 3);
}

export function calcularPresionPulso(sis: number, dia: number): number {
  return sis - dia;
}

export function valorarPresionPulso(pp: number): string {
  if (pp < 25) return 'Muy baja (< 25 mmHg)';
  if (pp < 40) return 'Baja (< 40 mmHg)';
  if (pp <= 60) return 'Normal (40–60 mmHg)';
  if (pp <= 80) return 'Elevada (> 60 mmHg)';
  return 'Muy elevada (> 80 mmHg)';
}

// ─── Lectura de los campos ───────────────────────────────────────────────────

export const RANGO_SISTOLICA = { min: 50, max: 300 } as const;
export const RANGO_DIASTOLICA = { min: 30, max: 200 } as const;
export const RANGO_PULSO = { min: 20, max: 300 } as const;

export type CampoLectura = 'sistólica' | 'diastólica' | 'pulso';

/** Un valor tecleado con decimales y el entero con el que se ha clasificado. */
export interface Redondeo {
  campo: CampoLectura;
  tecleado: number;
  /** Decimales con que se tecleó, para mostrarlo tal cual (179,67 y no 179,670). */
  decimales: number;
  usado: number;
}

export interface Lectura {
  sis: number;
  dia: number;
  pulso: number | null;
  redondeos: Redondeo[];
}

export interface ErroresLectura {
  sis?: string;
  dia?: string;
  pulso?: string;
}

/**
 * Convierte el valor de un `<input type="number">` en número. Ese valor lo normaliza el
 * navegador (punto decimal, sin millares) aunque la persona teclee «179,67» con el
 * teclado español, así que aquí `Number` es el parser correcto: `parseSpanishNumber`
 * leería «1.500» como mil quinientos, que no es lo que el control entrega.
 */
function numeroDelCampo(texto: string): number {
  const limpio = texto.trim();
  if (limpio === '') return NaN;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : NaN;
}

function decimalesDe(texto: string): number {
  const parteDecimal = texto.trim().split('.')[1];
  return parteDecimal ? Math.min(parteDecimal.length, 3) : 0;
}

/**
 * Valida los tres campos y devuelve la lectura en mmHg enteros, o los errores.
 * El rango se comprueba sobre el valor YA redondeado, que es con el que se clasifica.
 */
export function leerLectura(
  sistolica: string,
  diastolica: string,
  pulso: string,
): { lectura: Lectura | null; errores: ErroresLectura } {
  const errores: ErroresLectura = {};
  const redondeos: Redondeo[] = [];

  const registrar = (campo: CampoLectura, texto: string, valor: number): number => {
    const usado = Math.round(valor);
    if (usado !== valor) redondeos.push({ campo, tecleado: valor, decimales: decimalesDe(texto), usado });
    return usado;
  };

  const sisBruto = numeroDelCampo(sistolica);
  const diaBruto = numeroDelCampo(diastolica);
  const sis = Number.isNaN(sisBruto) ? NaN : registrar('sistólica', sistolica, sisBruto);
  const dia = Number.isNaN(diaBruto) ? NaN : registrar('diastólica', diastolica, diaBruto);

  if (Number.isNaN(sis)) {
    errores.sis = 'Introduce la tensión sistólica';
  } else if (sis < RANGO_SISTOLICA.min || sis > RANGO_SISTOLICA.max) {
    errores.sis = `Valor fuera de rango (${RANGO_SISTOLICA.min}–${RANGO_SISTOLICA.max} mmHg)`;
  }

  if (Number.isNaN(dia)) {
    errores.dia = 'Introduce la tensión diastólica';
  } else if (dia < RANGO_DIASTOLICA.min || dia > RANGO_DIASTOLICA.max) {
    errores.dia = `Valor fuera de rango (${RANGO_DIASTOLICA.min}–${RANGO_DIASTOLICA.max} mmHg)`;
  }

  if (!errores.sis && !errores.dia && sis <= dia) {
    errores.sis = 'La sistólica debe ser mayor que la diastólica';
  }

  let pulsoNum: number | null = null;
  if (pulso.trim() !== '') {
    const pulsoBruto = numeroDelCampo(pulso);
    const usado = Number.isNaN(pulsoBruto) ? NaN : registrar('pulso', pulso, pulsoBruto);
    if (Number.isNaN(usado) || usado < RANGO_PULSO.min || usado > RANGO_PULSO.max) {
      errores.pulso = `Valor fuera de rango (${RANGO_PULSO.min}–${RANGO_PULSO.max} ppm)`;
    } else {
      pulsoNum = usado;
    }
  }

  if (Object.keys(errores).length > 0) return { lectura: null, errores };
  return { lectura: { sis, dia, pulso: pulsoNum, redondeos }, errores };
}

// ─── Historial ───────────────────────────────────────────────────────────────

export const MAX_HISTORIAL = 20;

/**
 * Una lectura del historial. Sin `clasificacionId`: la categoría se deriva de sistólica y
 * diastólica al pintarla (hallazgo 1718). Los valores pueden venir `null` si lo guardado
 * no era un número; entonces la lectura no se clasifica.
 */
export interface Medicion {
  id: string;
  fecha: string; // ISO
  sistolica: number | null;
  diastolica: number | null;
  pulso: number | null;
}

function comoNumero(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Lee lo guardado en localStorage sin fiarse de su forma: puede venir de una versión
 * anterior (con `clasificacionId`, que se ignora) o estar corrupto. Nunca lanza.
 */
export function normalizarHistorial(bruto: unknown): Medicion[] {
  if (!Array.isArray(bruto)) return [];
  const vistos = new Set<string>();
  const salida: Medicion[] = [];
  bruto.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) return;
    const r = item as Record<string, unknown>;
    let id = typeof r.id === 'string' && r.id !== '' ? r.id : `h${i}`;
    if (vistos.has(id)) id = `${id}-${i}`;
    vistos.add(id);
    salida.push({
      id,
      fecha: typeof r.fecha === 'string' ? r.fecha : '',
      sistolica: comoNumero(r.sistolica),
      diastolica: comoNumero(r.diastolica),
      pulso: comoNumero(r.pulso),
    });
  });
  return salida;
}

/**
 * Clasificación de una lectura guardada, recalculada con las MISMAS reglas que una
 * lectura nueva (redondeo al mmHg y rangos del formulario). `null` si no se puede leer:
 * antes que inventar una categoría, la vista dice que la lectura es ilegible.
 */
export function clasificarGuardada(m: Medicion): { id: ClasificacionId; nombre: string } | null {
  if (m.sistolica === null || m.diastolica === null) return null;
  const sis = Math.round(m.sistolica);
  const dia = Math.round(m.diastolica);
  const enRango =
    sis >= RANGO_SISTOLICA.min && sis <= RANGO_SISTOLICA.max &&
    dia >= RANGO_DIASTOLICA.min && dia <= RANGO_DIASTOLICA.max;
  if (!enRango || sis <= dia) return null;
  const id = clasificarTension(sis, dia);
  return { id, nombre: nombreClasificacion(id, sis, dia) };
}

/**
 * Añade una lectura al principio. Si se supera el tope, devuelve también las que salen,
 * para que la vista lo diga en vez de perderlas en silencio (hallazgo 1719).
 */
export function agregarAlHistorial(
  nueva: Medicion,
  historial: Medicion[],
): { historial: Medicion[]; descartadas: Medicion[] } {
  const todas = [nueva, ...historial];
  return { historial: todas.slice(0, MAX_HISTORIAL), descartadas: todas.slice(MAX_HISTORIAL) };
}

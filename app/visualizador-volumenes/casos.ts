/**
 * Casos para clase — la tarea asignable de `visualizador-volumenes` (19/10/2026; 49 visitas de
 * aula, la primera de la cola de `/audit-meskeia`).
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la geometría está
 * bien: un volumen plausible pasa cualquier compilación ([[feedback_motor_calculo_aparte_y_probado]]).
 * Aquí no hay React ni DOM, solo funciones puras.
 *
 * ── LA ARITMÉTICA NO SE REPLICA ───────────────────────────────────────────────
 *
 * `calcVolumen` vivía en `page.tsx` y se MOVIÓ aquí tal cual: la tarjeta «Volumen» del
 * visualizador y la respuesta de cada caso salen de la MISMA función. Los pasos de la solución
 * escriben cifras intermedias —son la explicación para el alumno—, pero la RESPUESTA es siempre
 * la de `calcVolumen`. La altura que se despeja también: h = V ÷ (volumen de la misma figura con
 * h = 1), que es lineal en h en las cuatro figuras que la tienen.
 *
 * ── EL CONVENIO DE ESTA APP: π ────────────────────────────────────────────────
 *
 * El visualizador calcula con `Math.PI` y en clase se usa π ≈ 3,14 (o 22/7): un 0,05 % de
 * diferencia que mueve la segunda cifra decimal de casi cualquier volumen. Por eso las
 * respuestas que dependen de π se corrigen con la tolerancia RELATIVA del corrector (el mayor
 * entre 0,01 y el 1 %), que acepta las dos cuentas y rechaza π = 3 (un 4,5 % por debajo). Las que
 * NO dependen de π —el prisma, la pirámide y las razones en que π se cancela— son exactas y se
 * corrigen con la de REDONDEO, sin margen si la cifra es exacta: un «119» no es un redondeo
 * aceptable de 120 (la lección del hallazgo 751 de simulador-punnett). Qué respuesta depende de π
 * no se decide a mano: `dependeDePi` recalcula el caso con π = 3,14 y mira si cambia. El test
 * comprueba con π = 3,14 y 22/7 que la cuenta de libro se acepta en los doce casos y en el modo
 * práctica, y que con π = 3 se suspende.
 *
 * Todas las medidas de los casos caben en los deslizadores de la app (de 1 a 50, paso 0,5): el
 * alumno puede comprobar cada volumen poniéndolas en el visualizador.
 *
 * Nada lanza excepciones: un `throw` dentro de un render tumba la app entera; aquí los datos
 * imposibles devuelven `{ ok: false, error }` y un NaN.
 */

import { formatNumber } from '@/lib';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  textoDesviacion,
  toleranciaDeRedondeo,
  toleranciaRelativa,
  type Magnitud,
} from '@/lib/calculadoras/correctorCasosAula';

/* ─────────────────────────── La geometría (la de la app) ─────────────────────────── */

export type Figura = 'esfera' | 'cubo' | 'cilindro' | 'cono' | 'piramide';

/** Las medidas de las cinco figuras, como las guarda el estado de la página. */
export interface ParamsVolumen {
  radio: number;
  ancho: number;
  largo: number;
  alto: number;
  radioCil: number;
  alturaCil: number;
  radioCon: number;
  alturaCon: number;
  lado: number;
  alturaPir: number;
}

/**
 * El volumen de la figura: lo que pinta la tarjeta «Volumen» del visualizador y de donde sale la
 * respuesta de cada caso. `pi` solo lo cambian los tests y `dependeDePi`; la app usa `Math.PI`.
 */
export function calcVolumen(figura: Figura, p: ParamsVolumen, pi: number = Math.PI): number {
  switch (figura) {
    case 'esfera': return (4 / 3) * pi * Math.pow(p.radio, 3);
    case 'cubo': return p.ancho * p.largo * p.alto;
    case 'cilindro': return pi * Math.pow(p.radioCil, 2) * p.alturaCil;
    case 'cono': return (1 / 3) * pi * Math.pow(p.radioCon, 2) * p.alturaCon;
    case 'piramide': return (1 / 3) * Math.pow(p.lado, 2) * p.alturaPir;
  }
}

/** Las medidas de un caso: r radio, a anchura, b profundidad, h altura, l lado de la base. */
export interface Medidas {
  r?: number;
  a?: number;
  b?: number;
  h?: number;
  l?: number;
}

/** Qué medidas necesita cada figura, en el orden de los controles de la app. */
export const MEDIDAS_DE: Record<Figura, readonly (keyof Medidas)[]> = {
  esfera: ['r'],
  cubo: ['a', 'b', 'h'],
  cilindro: ['r', 'h'],
  cono: ['r', 'h'],
  piramide: ['l', 'h'],
};

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function medidasValidas(figura: Figura, m: Medidas): boolean {
  return MEDIDAS_DE[figura].every((k) => positivo(m[k]));
}

/** Las medidas de un caso puestas en los campos que lee `calcVolumen`. */
export function paramsDe(figura: Figura, m: Medidas): ParamsVolumen {
  const p: ParamsVolumen = {
    radio: 0, ancho: 0, largo: 0, alto: 0, radioCil: 0, alturaCil: 0, radioCon: 0, alturaCon: 0, lado: 0, alturaPir: 0,
  };
  switch (figura) {
    case 'esfera': p.radio = m.r ?? 0; break;
    case 'cubo': p.ancho = m.a ?? 0; p.largo = m.b ?? 0; p.alto = m.h ?? 0; break;
    case 'cilindro': p.radioCil = m.r ?? 0; p.alturaCil = m.h ?? 0; break;
    case 'cono': p.radioCon = m.r ?? 0; p.alturaCon = m.h ?? 0; break;
    case 'piramide': p.lado = m.l ?? 0; p.alturaPir = m.h ?? 0; break;
  }
  return p;
}

/** El volumen con las medidas de un caso; NaN si falta una o no es positiva. */
export function volumenDe(figura: Figura, m: Medidas, pi: number = Math.PI): number {
  if (!medidasValidas(figura, m)) return NaN;
  const v = calcVolumen(figura, paramsDe(figura, m), pi);
  return Number.isFinite(v) ? v : NaN;
}

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta = 'volumen' | 'capacidad' | 'altura' | 'razon';
export type UnidadLongitud = 'cm' | 'dm' | 'm';
export type UnidadCapacidad = 'mL' | 'L';

export interface DatosCaso {
  pregunta: Pregunta;
  figura: Figura;
  medidas: Medidas;
  unidad: UnidadLongitud;
  /** En qué se pide la capacidad. Obligatorio en `capacidad`. */
  capacidad?: UnidadCapacidad;
  /** El volumen que da el enunciado, en unidad³. Obligatorio en `altura` (y entonces `h` no cuenta). */
  volumenDado?: number;
  /** El enunciado da el DIÁMETRO, no el radio: activa el aviso de «has usado el diámetro». */
  diametroEnEnunciado?: boolean;
  /** La otra figura de una razón: la respuesta es V(figura) ÷ V(otra). */
  otra?: { figura: Figura; medidas: Medidas };
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Todas las respuestas se piden con dos decimales como mucho. */
export const DECIMALES = 2;

/** Cuántos mL o L hay en una unidad³ de longitud. */
export function factorCapacidad(unidad: UnidadLongitud, capacidad: UnidadCapacidad): number {
  const litrosPorUnidadCubica: Record<UnidadLongitud, number> = { cm: 0.001, dm: 1, m: 1000 };
  const litros = litrosPorUnidadCubica[unidad];
  return capacidad === 'L' ? litros : litros * 1000;
}

const NOMBRE_CAPACIDAD: Record<UnidadCapacidad, string> = { mL: 'mililitros', L: 'litros' };

export function unidadDe(d: DatosCaso): string {
  switch (d.pregunta) {
    case 'volumen': return `${d.unidad}³`;
    case 'capacidad': return d.capacidad ?? 'L';
    case 'altura': return d.unidad;
    case 'razon': return '';
  }
}

/** Lo que se escribe en la casilla, con unidad. Derivado de la pregunta, nunca a mano. */
export function etiquetaDe(d: DatosCaso): string {
  switch (d.pregunta) {
    case 'volumen': return `Volumen, en ${d.unidad}³`;
    case 'capacidad': return `Capacidad, en ${NOMBRE_CAPACIDAD[d.capacidad ?? 'L']} (${d.capacidad ?? 'L'})`;
    case 'altura': return `Altura, en ${d.unidad}`;
    case 'razon': return 'Número de veces, sin unidad';
  }
}

/* ─────────────────────────── Formato ─────────────────────────── */

/** Cifra en formato español con los decimales que de verdad tiene, hasta `maxDecimales`. */
function cifra(n: number, maxDecimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  let d = 0;
  while (d < maxDecimales && Math.abs(redondearA(n, d) - n) > 1e-9 * Math.max(1, Math.abs(n))) d += 1;
  return formatNumber(redondearA(n, d), d);
}

/**
 * La respuesta con su unidad: «904,78 cm³», «48.000 L», «3». Con DOS decimales justos si hubo
 * que redondear —así lo pide el enunciado— y, si es exacta, con los que tenga.
 * Espacio duro antes de la unidad (CLAUDE.md global §2).
 */
export function textoRespuesta(valor: number, unidad: string, redondeada: boolean): string {
  if (!Number.isFinite(valor)) return '—';
  const numero = redondeada ? formatNumber(valor, DECIMALES) : cifra(valor, DECIMALES);
  return unidad ? `${numero} ${unidad}` : numero;
}

/** «Volumen de la esfera», «Volumen del cono»: con la contracción. */
const VOLUMEN_DE: Record<Figura, string> = {
  esfera: 'Volumen de la esfera',
  cubo: 'Volumen del prisma rectangular',
  cilindro: 'Volumen del cilindro',
  cono: 'Volumen del cono',
  piramide: 'Volumen de la pirámide',
};

/** La fórmula general, como la escribe la caja «Fórmula aplicada» del visualizador. */
const FORMULA: Record<Figura, string> = {
  esfera: 'V = (4/3) × π × r³',
  cubo: 'V = a × b × h',
  cilindro: 'V = π × r² × h',
  cono: 'V = (1/3) × π × r² × h',
  piramide: 'V = (1/3) × l² × h',
};

/** La fórmula con las medidas sustituidas. */
function sustitucion(figura: Figura, m: Medidas): string {
  const c = (n: number | undefined) => cifra(n ?? NaN);
  switch (figura) {
    case 'esfera': return `(4/3) × π × ${c(m.r)}³`;
    case 'cubo': return `${c(m.a)} × ${c(m.b)} × ${c(m.h)}`;
    case 'cilindro': return `π × ${c(m.r)}² × ${c(m.h)}`;
    case 'cono': return `(1/3) × π × ${c(m.r)}² × ${c(m.h)}`;
    case 'piramide': return `(1/3) × ${c(m.l)}² × ${c(m.h)}`;
  }
}

/** Los pasos que llevan al volumen de una figura: radio desde el diámetro, fórmula y cuenta. */
function pasosDelVolumen(figura: Figura, m: Medidas, unidad: UnidadLongitud, diametro: boolean, v: number): string[] {
  const pasos: string[] = [];
  if (diametro && m.r !== undefined) {
    pasos.push(`El radio es la mitad del diámetro: r = ${cifra(2 * m.r)} ÷ 2 = ${cifra(m.r)} ${unidad}.`);
  }
  pasos.push(`${VOLUMEN_DE[figura]}: ${FORMULA[figura]}.`);
  pasos.push(`V = ${sustitucion(figura, m)} = ${cifra(v)} ${unidad}³.`);
  return pasos;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

/**
 * Resuelve el caso desde sus datos, sin mirar la respuesta declarada. `pi` solo lo cambian los
 * tests y `dependeDePi`.
 */
export function resolverCaso(d: DatosCaso, pi: number = Math.PI): Resolucion {
  const fallo = (error: string): Resolucion => ({ ok: false, valor: NaN, pasos: [], error });
  const diametro = Boolean(d.diametroEnEnunciado);

  switch (d.pregunta) {
    case 'volumen': {
      const v = volumenDe(d.figura, d.medidas, pi);
      if (!Number.isFinite(v)) return fallo('Faltan medidas o alguna no es positiva.');
      return { ok: true, valor: v, pasos: pasosDelVolumen(d.figura, d.medidas, d.unidad, diametro, v) };
    }
    case 'capacidad': {
      const v = volumenDe(d.figura, d.medidas, pi);
      if (!Number.isFinite(v) || !d.capacidad) return fallo('Faltan medidas o la unidad de capacidad.');
      const factor = factorCapacidad(d.unidad, d.capacidad);
      const c = v * factor;
      const pasos = pasosDelVolumen(d.figura, d.medidas, d.unidad, diametro, v);
      pasos.push(`1 ${d.unidad}³ = ${cifra(factor, 3)} ${d.capacidad}, así que ${cifra(v)} ${d.unidad}³ × ${cifra(factor, 3)} = ${cifra(c)} ${d.capacidad}.`);
      return { ok: true, valor: c, pasos };
    }
    case 'altura': {
      if (d.figura === 'esfera') return fallo('La esfera no tiene altura que despejar.');
      if (!positivo(d.volumenDado)) return fallo('Falta el volumen.');
      // El volumen de la misma figura con h = 1 es el factor que multiplica a h en la fórmula.
      const base = volumenDe(d.figura, { ...d.medidas, h: 1 }, pi);
      if (!Number.isFinite(base)) return fallo('Faltan medidas o alguna no es positiva.');
      const h = d.volumenDado / base;
      const factorTexto: Record<Exclude<Figura, 'esfera'>, string> = {
        cubo: `a × b = ${cifra(d.medidas.a ?? NaN)} × ${cifra(d.medidas.b ?? NaN)}`,
        cilindro: `π × r² = π × ${cifra(d.medidas.r ?? NaN)}²`,
        cono: `(1/3) × π × r² = (1/3) × π × ${cifra(d.medidas.r ?? NaN)}²`,
        piramide: `(1/3) × l² = (1/3) × ${cifra(d.medidas.l ?? NaN)}²`,
      };
      const pasos: string[] = [];
      if (diametro && d.medidas.r !== undefined) {
        pasos.push(`El radio es la mitad del diámetro: r = ${cifra(2 * d.medidas.r)} ÷ 2 = ${cifra(d.medidas.r)} ${d.unidad}.`);
      }
      pasos.push(`${VOLUMEN_DE[d.figura]}: ${FORMULA[d.figura]}. Despeja h: h = V ÷ (lo que multiplica a h).`);
      pasos.push(`Lo que multiplica a h: ${factorTexto[d.figura]} = ${cifra(base)} ${d.unidad}².`);
      pasos.push(`h = ${cifra(d.volumenDado)} ÷ ${cifra(base)} = ${cifra(h)} ${d.unidad}.`);
      return { ok: true, valor: h, pasos };
    }
    case 'razon': {
      if (!d.otra) return fallo('Falta la segunda figura.');
      const va = volumenDe(d.figura, d.medidas, pi);
      const vb = volumenDe(d.otra.figura, d.otra.medidas, pi);
      if (!Number.isFinite(va) || !Number.isFinite(vb)) return fallo('Faltan medidas o alguna no es positiva.');
      const razon = va / vb;
      const pasos = [
        `${VOLUMEN_DE[d.figura]} con ${describirMedidas(d.figura, d.medidas, d.unidad)}: V₁ = ${sustitucion(d.figura, d.medidas)} = ${cifra(va)} ${d.unidad}³.`,
        `${VOLUMEN_DE[d.otra.figura]} con ${describirMedidas(d.otra.figura, d.otra.medidas, d.unidad)}: V₂ = ${sustitucion(d.otra.figura, d.otra.medidas)} = ${cifra(vb)} ${d.unidad}³.`,
      ];
      // Con otro π la razón no cambia si π se cancela (no se llama a dependeDePi: resolvería otra
      // vez). Solo se dice si π aparece: en prisma frente a pirámide no hay π que cancelar.
      const otroPi = pi === 3.14 ? Math.PI : 3.14;
      const conOtroPi = volumenDe(d.figura, d.medidas, otroPi) / volumenDe(d.otra.figura, d.otra.medidas, otroPi);
      const conPi = (f: Figura) => f === 'esfera' || f === 'cilindro' || f === 'cono';
      if (conPi(d.figura) && conPi(d.otra.figura) && Math.abs(conOtroPi - razon) <= 1e-9 * Math.max(1, razon)) {
        pasos.push('π aparece en los dos volúmenes y se cancela: el resultado no depende del valor de π que uses.');
      }
      pasos.push(`V₁ ÷ V₂ = ${cifra(va)} ÷ ${cifra(vb)} = ${cifra(razon)}.`);
      return { ok: true, valor: razon, pasos };
    }
  }
}

/** «r = 3 cm», «l = 9 cm y h = 10 cm»: para los pasos de una razón. */
function describirMedidas(figura: Figura, m: Medidas, unidad: UnidadLongitud): string {
  const partes = MEDIDAS_DE[figura].map((k) => `${k} = ${cifra(m[k] ?? NaN)} ${unidad}`);
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0];
}

/**
 * ¿Cambia la respuesta si se calcula con π = 3,14? Decide la política de tolerancia (cabecera).
 * Se mira ejecutando, no por la figura: en una razón entre cono y cilindro π se cancela.
 */
export function dependeDePi(d: DatosCaso): boolean {
  const exacta = resolverCaso(d).valor;
  const libro = resolverCaso(d, 3.14).valor;
  if (!Number.isFinite(exacta) || !Number.isFinite(libro)) return false;
  return Math.abs(exacta - libro) > 1e-9 * Math.max(1, Math.abs(exacta));
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** Un volumen, una capacidad, una altura o una razón: números reales, positivos por el tema. */
export function magnitudDe(): Magnitud {
  return 'real';
}

/** La relativa si la respuesta depende de π; la de redondeo si es exacta (cabecera). */
export function toleranciaDe(esperado: number, d: DatosCaso): number {
  if (dependeDePi(d)) return toleranciaRelativa(esperado);
  const exacta = resolverCaso(d).valor;
  return toleranciaDeRedondeo(Number.isFinite(exacta) ? exacta : esperado, DECIMALES);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Los errores típicos del tema, cada uno con el valor que produce y lo que hay que decirle al
 * alumno. Se calculan con el motor desde los datos, igual que la respuesta.
 */
export function erroresTipicos(d: DatosCaso): { valor: number; motivo: string }[] {
  const r = resolverCaso(d);
  if (!r.ok) return [];
  const errores: { valor: number; motivo: string }[] = [];
  const puntiaguda = d.figura === 'cono' || d.figura === 'piramide';

  if (d.diametroEnEnunciado && d.medidas.r !== undefined) {
    const conDiametro = resolverCaso({ ...d, medidas: { ...d.medidas, r: 2 * d.medidas.r } });
    if (conDiametro.ok) {
      errores.push({
        valor: conDiametro.valor,
        motivo: 'Has usado el diámetro como si fuera el radio. El radio es la mitad del diámetro: divide entre 2 antes de aplicar la fórmula.',
      });
    }
  }
  if (puntiaguda && (d.pregunta === 'volumen' || d.pregunta === 'capacidad')) {
    errores.push({
      valor: r.valor * 3,
      motivo: `Te ha salido el triple: falta el factor 1/3. ${d.figura === 'cono' ? 'Un cono' : 'Una pirámide'} ocupa un tercio de ${d.figura === 'cono' ? 'un cilindro' : 'un prisma'} de la misma base y altura.`,
    });
  }
  if (puntiaguda && d.pregunta === 'altura') {
    errores.push({
      valor: r.valor / 3,
      motivo: 'Te ha salido la tercera parte: falta el factor 1/3 al despejar la altura.',
    });
  }
  if (d.pregunta === 'capacidad' && d.capacidad) {
    const factor = factorCapacidad(d.unidad, d.capacidad);
    errores.push({
      valor: r.valor / factor,
      motivo: `Eso es el volumen en ${d.unidad}³: falta pasarlo a ${NOMBRE_CAPACIDAD[d.capacidad]} (1 ${d.unidad}³ = ${cifra(factor, 3)} ${d.capacidad}).`,
    });
    errores.push({
      valor: r.valor / factor / factor,
      motivo: `Has dividido en vez de multiplicar al pasar a ${NOMBRE_CAPACIDAD[d.capacidad]}: 1 ${d.unidad}³ = ${cifra(factor, 3)} ${d.capacidad}.`,
    });
  }
  if (d.pregunta === 'razon') {
    errores.push({
      valor: 1 / r.valor,
      motivo: 'Has dividido al revés: se pide cuántas veces es mayor el primer volumen que el segundo.',
    });
  }
  return errores;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number, d: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(esperado, d);
  const c = corregirNumero(usuario, esperado, { tolerancia, magnitud: magnitudDe() });
  const { diferencia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal, por ejemplo 904,78).', diferencia: NaN, tolerancia };
  }
  if (c.motivoImposible) return { correcto: false, motivo: c.motivoImposible, diferencia, tolerancia };
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  if (usuario <= 0) {
    return { correcto: false, motivo: 'No es correcto: un volumen, una capacidad, una altura o una razón entre volúmenes no pueden ser cero ni negativos.', diferencia, tolerancia };
  }

  for (const e of erroresTipicos(d)) {
    if (!dentroDeTolerancia(e.valor, esperado, tolerancia) && dentroDeTolerancia(usuario, e.valor, toleranciaRelativa(e.valor))) {
      return { correcto: false, motivo: e.motivo, diferencia, tolerancia };
    }
  }

  const unidad = unidadDe(d);
  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, DECIMALES, formatNumber)}${unidad ? ` ${unidad}` : ''} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  unidad: string;
  /** Calculada por el motor desde `datos` y redondeada a dos decimales. */
  respuesta: number;
  respuestaTexto: string;
  /** true si la cifra exacta tiene más de dos decimales: el enunciado lo dice. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** « Redondea a dos decimales.» o nada, según lo decida `exigeRedondeo` sobre la cifra exacta. */
function fraseRedondeo(d: DatosCaso): string {
  const r = resolverCaso(d);
  return r.ok && exigeRedondeo(r.valor, DECIMALES) ? ' Redondea a dos decimales.' : '';
}

/** Los pasos del motor y, si hubo que redondear, la cifra que se escribe en la casilla (5.bis). */
function pasosConRedondeo(r: Resolucion, unidad: string, requiereRedondeo: boolean): string[] {
  if (!r.ok) return [r.error ?? 'No se pudo resolver.'];
  if (!requiereRedondeo) return r.pasos;
  return [...r.pasos, `Redondeado a dos decimales: ${textoRespuesta(redondearA(r.valor, DECIMALES), unidad, true)}.`];
}

type DefinicionCaso = Pick<Caso, 'id' | 'titulo' | 'enunciado' | 'categoria' | 'datos' | 'pista'>;

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'Volumen de una esfera',
    enunciado: 'Calcula el volumen de una esfera de 6 cm de radio.',
    categoria: 'abstracto',
    datos: { pregunta: 'volumen', figura: 'esfera', medidas: { r: 6 }, unidad: 'cm' },
    pista: 'V = (4/3) × π × r³. Eleva primero el radio al cubo: 6³ = 216.',
  },
  {
    id: 2,
    titulo: 'Volumen de un prisma rectangular',
    enunciado: 'Calcula el volumen de un prisma rectangular (ortoedro) de 7 cm de anchura, 4 cm de profundidad y 2,5 cm de altura.',
    categoria: 'abstracto',
    datos: { pregunta: 'volumen', figura: 'cubo', medidas: { a: 7, b: 4, h: 2.5 }, unidad: 'cm' },
    pista: 'El volumen de un prisma rectangular es el producto de sus tres dimensiones.',
  },
  {
    id: 3,
    titulo: 'Volumen de un cilindro',
    enunciado: 'Calcula el volumen de un cilindro de 3 cm de radio y 10 cm de altura.',
    categoria: 'abstracto',
    datos: { pregunta: 'volumen', figura: 'cilindro', medidas: { r: 3, h: 10 }, unidad: 'cm' },
    pista: 'Área de la base (π × r²) por la altura.',
  },
  {
    id: 4,
    titulo: 'Volumen de un cono',
    enunciado: 'Calcula el volumen de un cono de 6 cm de radio de la base y 7 cm de altura.',
    categoria: 'abstracto',
    datos: { pregunta: 'volumen', figura: 'cono', medidas: { r: 6, h: 7 }, unidad: 'cm' },
    pista: 'Es la tercera parte del cilindro de la misma base y altura: (1/3) × π × r² × h.',
  },
  {
    id: 5,
    titulo: 'Volumen de una pirámide',
    enunciado: 'Calcula el volumen de una pirámide de base cuadrada de 9 cm de lado y 10 cm de altura.',
    categoria: 'abstracto',
    datos: { pregunta: 'volumen', figura: 'piramide', medidas: { l: 9, h: 10 }, unidad: 'cm' },
    pista: 'Un tercio del área de la base (l²) por la altura.',
  },
  {
    id: 6,
    titulo: 'La capacidad de una lata',
    enunciado: 'Una lata cilíndrica mide 7 cm de diámetro y 12 cm de altura. ¿Cuántos mililitros caben en ella?',
    categoria: 'aplicado',
    datos: { pregunta: 'capacidad', figura: 'cilindro', medidas: { r: 3.5, h: 12 }, unidad: 'cm', capacidad: 'mL', diametroEnEnunciado: true },
    pista: 'Ojo: te dan el diámetro, no el radio. Y 1 cm³ = 1 mL.',
  },
  {
    id: 7,
    titulo: 'El agua de una piscina',
    enunciado: 'Una piscina con forma de prisma rectangular mide 8 m de largo, 4 m de ancho y 1,5 m de profundidad. ¿Cuántos litros de agua caben si se llena hasta el borde?',
    categoria: 'aplicado',
    datos: { pregunta: 'capacidad', figura: 'cubo', medidas: { a: 8, b: 4, h: 1.5 }, unidad: 'm', capacidad: 'L' },
    pista: 'Calcula primero los metros cúbicos. Cada metro cúbico son 1.000 litros.',
  },
  {
    id: 8,
    titulo: 'Un depósito esférico',
    enunciado: 'Un depósito de gas tiene forma de esfera de 2 m de diámetro. ¿Cuántos litros caben en él?',
    categoria: 'aplicado',
    datos: { pregunta: 'capacidad', figura: 'esfera', medidas: { r: 1 }, unidad: 'm', capacidad: 'L', diametroEnEnunciado: true },
    pista: 'El radio es 1 m. Calcula los metros cúbicos y multiplica por 1.000.',
  },
  {
    id: 9,
    titulo: 'Un cucurucho de helado',
    enunciado: 'Un cucurucho tiene forma de cono de 2,5 cm de radio y 12 cm de altura. ¿Cuál es su volumen?',
    categoria: 'aplicado',
    datos: { pregunta: 'volumen', figura: 'cono', medidas: { r: 2.5, h: 12 }, unidad: 'cm' },
    pista: 'No olvides el factor 1/3 del cono: es el error más frecuente.',
  },
  {
    id: 10,
    titulo: 'Hasta dónde llega el agua',
    enunciado: 'Un vaso cilíndrico tiene 4 cm de radio interior. Si se vierten en él 1000 cm³ de agua (un litro), ¿hasta qué altura llega el agua?',
    categoria: 'aplicado',
    datos: { pregunta: 'altura', figura: 'cilindro', medidas: { r: 4 }, unidad: 'cm', volumenDado: 1000 },
    pista: 'V = π × r² × h, así que h = V ÷ (π × r²).',
  },
  {
    id: 11,
    titulo: 'Conos para llenar un cilindro',
    enunciado: 'Un cilindro y un cono tienen los dos 5 cm de radio y 9 cm de altura. ¿Cuántas veces hay que llenar el cono y vaciarlo en el cilindro para llenar el cilindro?',
    categoria: 'abstracto',
    datos: {
      pregunta: 'razon', figura: 'cilindro', medidas: { r: 5, h: 9 }, unidad: 'cm',
      otra: { figura: 'cono', medidas: { r: 5, h: 9 } },
    },
    pista: 'Divide el volumen del cilindro entre el del cono. Compruébalo en el visualizador con las mismas medidas.',
  },
  {
    id: 12,
    titulo: 'Duplicar el radio de una esfera',
    enunciado: 'Una esfera de 3 cm de radio se agranda hasta tener 6 cm de radio. ¿Por cuánto se multiplica su volumen?',
    categoria: 'abstracto',
    datos: {
      pregunta: 'razon', figura: 'esfera', medidas: { r: 6 }, unidad: 'cm',
      otra: { figura: 'esfera', medidas: { r: 3 } },
    },
    pista: 'Divide el volumen nuevo entre el de antes. El radio va elevado al cubo.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const unidad = unidadDe(def.datos);
  const requiereRedondeo = r.ok ? exigeRedondeo(r.valor, DECIMALES) : false;
  const valor = r.ok ? redondearA(r.valor, DECIMALES) : NaN;
  return {
    ...def,
    enunciado: def.enunciado + fraseRedondeo(def.datos),
    etiquetaRespuesta: etiquetaDe(def.datos),
    unidad,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, unidad, requiereRedondeo),
    requiereRedondeo,
    pasos: pasosConRedondeo(r, unidad, requiereRedondeo),
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * 1, 2, 3… los primeros valores salen diminutos y muy parecidos, y el «aleatorio» acaba dando
 * SIEMPRE el mismo ejercicio (simulador-genetica, 14/09/2026): reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

function elegir<T>(rnd: () => number, opciones: readonly T[]): T {
  return opciones[Math.min(opciones.length - 1, Math.floor(rnd() * opciones.length))];
}

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  unidad: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

/** Medidas que caben en los deslizadores de la app (de 1 a 50, paso 0,5). */
const MEDIDAS_PRACTICA = [2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 9, 10, 12, 15] as const;
const FIGURAS: readonly Figura[] = ['esfera', 'cubo', 'cilindro', 'cono', 'piramide'];
const CON_ALTURA: readonly Exclude<Figura, 'esfera'>[] = ['cubo', 'cilindro', 'cono', 'piramide'];

/** «una esfera de 6 cm de radio», «un cono de 8 cm de diámetro y 9 cm de altura»… */
export function describirFigura(figura: Figura, m: Medidas, u: UnidadLongitud, diametro = false, conAltura = true): string {
  const c = (n: number | undefined) => `${cifra(n ?? NaN)} ${u}`;
  const radio = diametro ? `${c(2 * (m.r ?? NaN))} de diámetro` : `${c(m.r)} de radio`;
  const altura = conAltura ? ` y ${c(m.h)} de altura` : '';
  switch (figura) {
    case 'esfera': return `una esfera de ${radio}`;
    case 'cubo': return conAltura
      ? `un prisma rectangular (ortoedro) de ${c(m.a)} de anchura, ${c(m.b)} de profundidad y ${c(m.h)} de altura`
      : `un prisma rectangular (ortoedro) de ${c(m.a)} de anchura y ${c(m.b)} de profundidad`;
    case 'cilindro': return `un cilindro de ${radio}${altura}`;
    case 'cono': return `un cono de ${radio} de la base${altura}`;
    case 'piramide': return `una pirámide de base cuadrada de ${c(m.l)} de lado${altura}`;
  }
}

function medidasAleatorias(rnd: () => number, figura: Figura): Medidas {
  const m: Medidas = {};
  for (const k of MEDIDAS_DE[figura]) m[k] = elegir(rnd, MEDIDAS_PRACTICA);
  return m;
}

function intentar(rnd: () => number): { datos: DatosCaso; enunciado: string } | null {
  const pregunta = elegir(rnd, ['volumen', 'volumen', 'capacidad', 'altura', 'razon'] as const);
  switch (pregunta) {
    case 'volumen': {
      const figura = elegir(rnd, FIGURAS);
      const unidad = elegir(rnd, ['cm', 'm'] as const);
      const medidas = medidasAleatorias(rnd, figura);
      const diametroEnEnunciado = medidas.r !== undefined && rnd() < 0.3;
      const datos: DatosCaso = { pregunta, figura, medidas, unidad, diametroEnEnunciado };
      return { datos, enunciado: `Calcula el volumen de ${describirFigura(figura, medidas, unidad, diametroEnEnunciado)}.` };
    }
    case 'capacidad': {
      const figura = elegir(rnd, FIGURAS);
      const [unidad, capacidad] = elegir(rnd, [['cm', 'mL'], ['cm', 'L'], ['dm', 'L'], ['m', 'L']] as const);
      const medidas = medidasAleatorias(rnd, figura);
      const diametroEnEnunciado = medidas.r !== undefined && rnd() < 0.3;
      const datos: DatosCaso = { pregunta, figura, medidas, unidad, capacidad, diametroEnEnunciado };
      const texto = describirFigura(figura, medidas, unidad, diametroEnEnunciado);
      return { datos, enunciado: `Un recipiente tiene la forma de ${texto}. ¿Cuántos ${NOMBRE_CAPACIDAD[capacidad]} caben en él?` };
    }
    case 'altura': {
      const figura = elegir(rnd, CON_ALTURA);
      const unidad = elegir(rnd, ['cm', 'm'] as const);
      const completas = medidasAleatorias(rnd, figura);
      const v = volumenDe(figura, completas);
      if (!Number.isFinite(v)) return null;
      // El volumen se da con dos decimales, como lo escribiría un libro; la altura sale de ESE
      // volumen, no de la h con que se generó.
      const volumenDado = redondearA(v, DECIMALES);
      const medidas: Medidas = { ...completas };
      delete medidas.h;
      const datos: DatosCaso = { pregunta, figura, medidas, unidad, volumenDado };
      const texto = describirFigura(figura, medidas, unidad, false, false);
      return { datos, enunciado: `El volumen de ${texto} es de ${cifra(volumenDado, DECIMALES)} ${unidad}³. ¿Cuál es su altura?` };
    }
    case 'razon': {
      const unidad = 'cm' as const;
      if (rnd() < 0.4) {
        // Cono frente a cilindro, o pirámide frente a prisma, de la misma base y altura.
        const conos = rnd() < 0.5;
        const h = elegir(rnd, MEDIDAS_PRACTICA);
        const lado = elegir(rnd, MEDIDAS_PRACTICA);
        const datos: DatosCaso = conos
          ? { pregunta, figura: 'cilindro', medidas: { r: lado, h }, unidad, otra: { figura: 'cono', medidas: { r: lado, h } } }
          : { pregunta, figura: 'cubo', medidas: { a: lado, b: lado, h }, unidad, otra: { figura: 'piramide', medidas: { l: lado, h } } };
        const enunciado = conos
          ? `Un cilindro y un cono tienen los dos ${cifra(lado)} cm de radio y ${cifra(h)} cm de altura. ¿Cuántas veces cabe el volumen del cono en el del cilindro?`
          : `Un prisma de base cuadrada y una pirámide tienen los dos una base de ${cifra(lado)} cm de lado y ${cifra(h)} cm de altura. ¿Cuántas veces cabe el volumen de la pirámide en el del prisma?`;
        return { datos, enunciado };
      }
      // Agrandar una medida: el volumen se multiplica por el factor elevado a su exponente.
      const figura = elegir(rnd, FIGURAS);
      const medidas = medidasAleatorias(rnd, figura);
      const clave = elegir(rnd, MEDIDAS_DE[figura]);
      const factor = elegir(rnd, [2, 3] as const);
      const nuevas: Medidas = { ...medidas, [clave]: (medidas[clave] ?? 0) * factor };
      if ((nuevas[clave] ?? 0) > 50) return null;
      const nombres: Record<keyof Medidas, string> = { r: 'el radio', a: 'la anchura', b: 'la profundidad', h: 'la altura', l: 'el lado de la base' };
      const verbo = factor === 2 ? 'Si se duplica' : 'Si se triplica';
      const datos: DatosCaso = { pregunta, figura, medidas: nuevas, unidad, otra: { figura, medidas } };
      return {
        datos,
        enunciado: `Tienes ${describirFigura(figura, medidas, unidad)}. ${verbo} ${nombres[clave]} sin cambiar las demás medidas, ¿por cuánto se multiplica su volumen?`,
      };
    }
  }
}

/** Si en 200 intentos no sale nada válido (no pasa con estas listas), el caso 3. */
const RESERVA: { datos: DatosCaso; enunciado: string } = {
  datos: { pregunta: 'volumen', figura: 'cilindro', medidas: { r: 3, h: 10 }, unidad: 'cm' },
  enunciado: 'Calcula el volumen de un cilindro de 3 cm de radio y 10 cm de altura.',
};

/** Un ejercicio de práctica, con la MISMA resolución (`resolverCaso`) que los doce fijos. */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let elegido: { datos: DatosCaso; enunciado: string } | null = null;
  for (let i = 0; i < 200 && !elegido; i++) {
    const intento = intentar(rnd);
    // Por debajo de 1 el margen mínimo de 0,01 vale más que la diferencia entre π y 3 (un
    // 4,5 %): una capacidad de 0,11 L se daría por buena con π = 3. Por encima de 100.000, el
    // redondeo a dos decimales queda por debajo del margen relativo de `exigeRedondeo` y el
    // enunciado dejaría de pedirlo (una esfera de 9 m de radio: 3.053.628,06 L). Se descartan.
    const r = intento ? resolverCaso(intento.datos) : null;
    if (intento && r?.ok && r.valor >= 1 && r.valor <= 100000) elegido = intento;
  }
  const { datos, enunciado } = elegido ?? RESERVA;
  const r = resolverCaso(datos);
  const requiereRedondeo = r.ok ? exigeRedondeo(r.valor, DECIMALES) : false;
  return {
    semilla,
    enunciado: enunciado + fraseRedondeo(datos),
    datos,
    respuesta: r.ok ? redondearA(r.valor, DECIMALES) : NaN,
    etiquetaRespuesta: etiquetaDe(datos),
    unidad: unidadDe(datos),
    requiereRedondeo,
    pasos: pasosConRedondeo(r, unidadDe(datos), requiereRedondeo),
  };
}

/**
 * Casos para clase — la tarea asignable de `simulador-osmosis`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, que se prueban sin navegador.
 *
 * DOS TIPOS DE TAREA (skill /casos-aula-meskeia) en una sola lista de doce:
 *   · C · PREDECIR, antes de comprobarlo en el simulador, hacia dónde pasa el agua entre dos
 *     disoluciones, qué tipo de medio es una disolución para una célula o qué le pasa a la
 *     célula. La opción correcta sale de EJECUTAR el motor, nunca de una tabla escrita a mano.
 *   · A · CALCULAR la osmolaridad (i·M), la molaridad desde un % m/v, la presión osmótica
 *     π = i·M·R·T, la diferencia Δπ entre dos lados o la altura de la columna h = Δπ/(ρ·g).
 *   Los casos 1-8 son de secundaria (13-16 años: sentido del agua, tonicidad, partículas por
 *   litro, % a mol/L); los 9-12 usan π = i·M·R·T, que es química de 16-17: el profesor de
 *   secundaria puede asignar solo los primeros.
 *
 * ── EL MOTOR ES EL DE LA APP (camino IMPORTAR) ───────────────────────────────
 *
 * Todo número sale de `./motor.ts`, el mismo que pinta los dos paneles: `molaridadDesde`,
 * `osmolaridad`, `presionOsmotica`, `compararCompartimentos`, `clasificarMedio` y
 * `celulaEnMedio`. Aquí no se reescribe ninguna fórmula. Si la corrección y el panel calcularan
 * distinto, la app suspendería una respuesta que ella misma imprime.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **R y T.** El motor usa R = 8,314462618 / 101,325 = 0,0820574 atm·L/(mol·K), exacta desde
 *    el SI de 2019, y T = t + 273,15. En clase se usa R = 0,082 y T = t + 273. Entre las dos
 *    tandas hay como mucho un 0,2 % (0,07 % de R y ≤ 0,05 % de T entre 20 y 37 °C). Los
 *    enunciados de π DECLARAN «R = 0,082 atm·L/(mol·K)», la respuesta que se enseña es la del
 *    motor y la tolerancia es la RELATIVA (`toleranciaRelativa`, el 1 %), que acepta las dos.
 *
 * ⚠️ **i es el factor de van 't Hoff IDEAL** (disociación completa: NaCl y KCl 2, CaCl₂ 3), como
 *    en el motor, y cada enunciado lo dice. El real es algo menor (el NaCl 0,9 % ronda 1,86).
 *
 * ⚠️ **Masas molares: las de `SOLUTOS`** (NaCl 58,44, glucosa 180,16…). El enunciado que pasa
 *    de % a mol/L escribe la que usa, así que la molaridad y la osmolaridad son EXACTAS con ese
 *    dato y van con la tolerancia de redondeo (media unidad del tercer decimal si hay que
 *    redondear, 0 si es exacta).
 *
 * ⚠️ **Las predicciones (tipo C) son ROBUSTAS** (`prediccionRobusta`): se recorrió la rejilla
 *    de escenarios (6 solutos × 12 concentraciones + agua, 5.329 parejas de lados y 292 medios
 *    frente a cuatro interiores) y solo valen los que (a) no cambian de respuesta con el i real
 *    (≈ 1 + 0,9·(i − 1)), (b) no cambian con R = 0,082 y T = t + 273, y (c) quedan lejos de la
 *    banda isotónica del ±5 % del motor (diferencia relativa ≥ 15 %). Las dos excepciones a (c)
 *    son las respuestas «iguales»: «Ninguno» entre dos lados solo con solutos del MISMO i a la
 *    misma molaridad (glucosa frente a sacarosa) y «Medio isotónico» solo con un no electrolito
 *    EXACTAMENTE igual al interior (glucosa 0,30 M frente a 0,30 osmol/L). Por eso no hay casos
 *    con «NaCl 0,15 M frente a sacarosa 0,3 M» (con i real deja de ser «Ninguno»), ni con el
 *    suero fisiológico como isotónico (0,308 frente a 0,30: isotónico por la banda, no exacto),
 *    ni con glucosa al 5 % (sale HIPOtónica frente a 0,30). La urea no entra en los casos de
 *    célula: atraviesa la membrana, y un medio de urea iso-osmolar se comporta como hipotónico.
 *
 * ⚠️ **Decimales como los enseña el panel**: π en atm con 2 decimales si ≥ 1 atm y 3 si no; kPa
 *    con 1 decimal desde 10 kPa; h con 2 decimales en metros; osmolaridad con 3. Si la respuesta
 *    no es exacta con esos decimales, el enunciado pide redondear (`exigeRedondeo`).
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
  type MagnitudAcotada,
} from '@/lib/calculadoras/correctorCasosAula';
import {
  CERO_CELSIUS_K,
  DENSIDAD_AGUA,
  G,
  P_ATM,
  R_ATM_L,
  R_SI,
  aKelvin,
  celulaEnMedio,
  clasificarMedio,
  compararCompartimentos,
  molaridadDesde,
  osmolaridad,
  presionOsmotica,
  solutoPorId,
  type EstadoCelula,
  type Sentido,
  type Soluto,
  type TipoCelula,
  type Tonicidad,
  type Unidad,
} from './motor';

/* ─────────────────────────── Tipos de los casos ─────────────────────────── */

/** Una disolución tal como la da el enunciado (y como se teclea en el simulador). */
export interface DisolucionCaso {
  solutoId: string;
  valor: number;
  unidad: Unidad;
}

export type UnidadPresion = 'atm' | 'kPa';

/**
 * Unión discriminada por `tipo`, con literales en todos los miembros: sin eso TypeScript no
 * estrecha y `datos.ladoA` compilaría en una rama que no lo tiene (types/CLAUDE.md).
 */
export type DatosCaso =
  /** A · osmolaridad = i·M, en osmol/L. */
  | { tipo: 'osmolaridad'; disolucion: DisolucionCaso }
  /** A · molaridad desde un % m/v, en mol/L. */
  | { tipo: 'molaridad'; disolucion: DisolucionCaso }
  /** A · presión osmótica π = i·M·R·T, en atm o kPa. */
  | { tipo: 'presion'; disolucion: DisolucionCaso; celsius: number; unidadPresion: UnidadPresion }
  /** A · diferencia de presión osmótica entre los dos lados, en atm o kPa. */
  | { tipo: 'deltaPi'; ladoA: DisolucionCaso; ladoB: DisolucionCaso; celsius: number; unidadPresion: UnidadPresion }
  /** A · columna de agua que equilibra Δπ, h = Δπ/(ρ·g), en metros. */
  | { tipo: 'altura'; ladoA: DisolucionCaso; ladoB: DisolucionCaso; celsius: number }
  /** C · hacia dónde pasa el agua en neto entre A y B. */
  | { tipo: 'sentido'; ladoA: DisolucionCaso; ladoB: DisolucionCaso; celsius: number }
  /** C · qué le pasa a una célula animal o vegetal en un medio. */
  | { tipo: 'estado'; celula: TipoCelula; interior: number; medio: DisolucionCaso; celsius: number }
  /** C · qué tipo de medio es (hipotónico, isotónico, hipertónico) para la célula. */
  | { tipo: 'tonicidad'; interior: number; medio: DisolucionCaso };

export type TipoPregunta = DatosCaso['tipo'];
export type TipoNumerico = 'osmolaridad' | 'molaridad' | 'presion' | 'deltaPi' | 'altura';
export type TipoPrediccion = 'sentido' | 'estado' | 'tonicidad';

/** Lo que se elige en un caso de predicción: un sentido, un estado de la célula o una tonicidad. */
export type OpcionPrediccion = Sentido | EstadoCelula | Tonicidad;
export type Respuesta = number | OpcionPrediccion;

export interface Opcion {
  valor: OpcionPrediccion;
  texto: string;
}

/**
 * Los textos de las opciones son las MISMAS palabras que pinta la pantalla: el «Paso neto de
 * agua» de la sección 1, el título de la tonicidad y el del estado de la célula de la sección 2
 * (`NOMBRE_TONICIDAD` y `EXPLICACION[estado].titulo` de page.tsx). Así el alumno compara su
 * predicción con lo que ve escrito, letra por letra.
 */
export const OPCIONES_SENTIDO: readonly Opcion[] = [
  { valor: 'A_a_B', texto: 'De A hacia B' },
  { valor: 'B_a_A', texto: 'De B hacia A' },
  { valor: 'ninguno', texto: 'Ninguno' },
];

export const OPCIONES_TONICIDAD: readonly Opcion[] = [
  { valor: 'hipotonico', texto: 'Medio hipotónico' },
  { valor: 'isotonico', texto: 'Medio isotónico' },
  { valor: 'hipertonico', texto: 'Medio hipertónico' },
];

export const OPCIONES_ESTADO: Record<TipoCelula, readonly Opcion[]> = {
  animal: [
    { valor: 'hinchada', texto: 'La célula se hincha' },
    { valor: 'normal', texto: 'La célula conserva su forma' },
    { valor: 'crenada', texto: 'La célula se arruga (crenación)' },
  ],
  vegetal: [
    { valor: 'turgente', texto: 'La célula queda turgente' },
    { valor: 'flacida', texto: 'La célula queda flácida' },
    { valor: 'plasmolizada', texto: 'La membrana se despega de la pared (plasmólisis)' },
  ],
};

/** ¿Se responde eligiendo una opción (tipo C) o tecleando un número (tipo A)? */
export function esPrediccion(datos: DatosCaso): boolean {
  return datos.tipo === 'sentido' || datos.tipo === 'estado' || datos.tipo === 'tonicidad';
}

/** Las opciones entre las que se elige; vacío en los casos numéricos. */
export function opcionesDe(datos: DatosCaso): readonly Opcion[] {
  if (datos.tipo === 'sentido') return OPCIONES_SENTIDO;
  if (datos.tipo === 'tonicidad') return OPCIONES_TONICIDAD;
  if (datos.tipo === 'estado') return OPCIONES_ESTADO[datos.celula];
  return [];
}

/* ─────────────────────────── Magnitud y unidades ─────────────────────────── */

/**
 * Ninguna de las cinco magnitudes puede ser negativa: una osmolaridad, una presión osmótica o una
 * columna de agua de −0,2 no existen. Sin techo: el que pondría el motor (~35 osmol/L con NaCl al
 * 100 %) no es un límite que se pueda enseñar como imposible. Un tipo nuevo no compila sin decidirlo.
 */
export const MAGNITUD: Record<TipoNumerico, MagnitudAcotada> = {
  osmolaridad: { entero: false, minimo: 0, maximo: Infinity, que: 'la osmolaridad' },
  molaridad: { entero: false, minimo: 0, maximo: Infinity, que: 'la molaridad' },
  presion: { entero: false, minimo: 0, maximo: Infinity, que: 'la presión osmótica' },
  deltaPi: { entero: false, minimo: 0, maximo: Infinity, que: 'la diferencia de presión osmótica' },
  altura: { entero: false, minimo: 0, maximo: Infinity, que: 'la altura de la columna' },
};

/** La magnitud de un caso numérico; 'real' en las predicciones, que no se corrigen como número. */
export function magnitudDe(datos: DatosCaso): MagnitudAcotada | 'real' {
  switch (datos.tipo) {
    case 'osmolaridad':
    case 'molaridad':
    case 'presion':
    case 'deltaPi':
    case 'altura':
      return MAGNITUD[datos.tipo];
    default:
      return 'real';
  }
}

/** Unidad de la respuesta numérica, tal como la escribe el panel. */
export function unidadDe(datos: DatosCaso): string {
  switch (datos.tipo) {
    case 'osmolaridad':
      return 'osmol/L';
    case 'molaridad':
      return 'mol/L';
    case 'presion':
    case 'deltaPi':
      return datos.unidadPresion;
    case 'altura':
      return 'm';
    default:
      return '';
  }
}

/** Decimales con que se pide (y se enseña) la respuesta: los del panel de la app. */
export function decimalesDe(datos: DatosCaso, valor: number): number {
  switch (datos.tipo) {
    case 'osmolaridad':
    case 'molaridad':
      return 3;
    case 'presion':
    case 'deltaPi':
      if (datos.unidadPresion === 'kPa') return Math.abs(valor) < 10 ? 2 : 1;
      return Math.abs(valor) < 1 ? 3 : 2;
    case 'altura':
      return 2;
    default:
      return 0;
  }
}

/** ¿Pide el enunciado redondear? Decide a la vez el «redondea» y el margen del corrector. */
export function requiereRedondeo(datos: DatosCaso, valor: number): boolean {
  if (esPrediccion(datos) || !Number.isFinite(valor)) return false;
  return exigeRedondeo(valor, decimalesDe(datos, valor));
}

/**
 * La tolerancia de un caso numérico. Dos políticas, según dependa o no de R:
 *   · osmolaridad y molaridad: exactas con la masa molar que da el enunciado → redondeo (media
 *     unidad del tercer decimal si hay que redondear; 0 si es exacta).
 *   · π, Δπ y h: dependen de R y de T, y la clase usa 0,082 y t + 273 → RELATIVA (el 1 %).
 */
export function toleranciaDe(datos: DatosCaso, esperado: number): number {
  if (datos.tipo === 'osmolaridad' || datos.tipo === 'molaridad') {
    return toleranciaDeRedondeo(esperado, decimalesDe(datos, esperado));
  }
  return toleranciaRelativa(esperado);
}

/* ─────────────────────────── Presentación ─────────────────────────── */

/** Cifra en formato español con, como mucho, `decimales` decimales: «0,3», «4,93», «247,9». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (redondearA(n, decimales) + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

/** El nombre del soluto en una frase: «cloruro de sodio (NaCl)», «glucosa». */
function nombreSoluto(s: Soluto): string {
  const nombre = s.nombre.charAt(0).toLowerCase() + s.nombre.slice(1);
  return s.i === 1 ? nombre : `${nombre} (${s.formula})`;
}

/** La primera letra en mayúscula, para un paso que empieza por el nombre de un soluto. */
function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** «glucosa 0,1 mol/L» · «cloruro de sodio (NaCl) al 3 % m/v» · «agua pura». */
export function textoDisolucion(d: DisolucionCaso): string {
  const s = solutoPorId(d.solutoId);
  if (!s) return '—';
  if (d.valor === 0) return 'agua pura';
  return d.unidad === 'molar'
    ? `${nombreSoluto(s)} ${numero(d.valor)} mol/L`
    : `${nombreSoluto(s)} al ${numero(d.valor)} % m/v`;
}

/** Lo que el alumno tiene que saber del soluto: «i = 2» y, si viene en %, su masa molar. */
function datoSoluto(d: DisolucionCaso): string {
  const s = solutoPorId(d.solutoId);
  if (!s || d.valor === 0) return '';
  const disocia = s.i === 1 ? 'no se disocia: i = 1' : `se disocia por completo: i = ${s.i}`;
  return d.unidad === 'porcentaje'
    ? `${disocia}; masa molar ${numero(s.masaMolar, 2)} g/mol`
    : disocia;
}

/** «0,3 osmol/L», «4,93 atm», «Ninguno». */
export function textoRespuesta(valor: Respuesta, datos: DatosCaso): string {
  if (typeof valor === 'string') return opcionesDe(datos).find((o) => o.valor === valor)?.texto ?? '—';
  if (!Number.isFinite(valor)) return '—';
  const d = decimalesDe(datos, valor);
  const cifra = requiereRedondeo(datos, valor) ? formatNumber(redondearA(valor, d), d) : numero(valor, d);
  return `${cifra} ${unidadDe(datos)}`;
}

/* ─────────────────────────── El cálculo, con el motor ─────────────────────────── */

/**
 * Las variantes de un error típico, para reconocerlo con nombre propio. Cada una cambia UN dato
 * de entrada del motor, nunca la fórmula: el cálculo sigue siendo el de la app.
 */
interface Variante {
  /** Toma i = 1 para todos los solutos (olvida que el electrolito se disocia). */
  iUno?: boolean;
  /** Usa la temperatura en °C como si fuera kelvin. */
  celsiusComoKelvin?: boolean;
  /** Toma el % m/v como si fueran mol/L. */
  porcentajeComoMolar?: boolean;
  /** Pasa de % a mol/L sin el ×10 (1 % = 1 g/L en vez de 10 g/L). */
  sinPorDiez?: boolean;
  /** Factor de van 't Hoff real aproximado, 1 + 0,9·(i − 1): solo para comprobar la robustez. */
  iReal?: boolean;
}

function solutoCon(s: Soluto, v: Variante): Soluto {
  if (v.iUno) return { ...s, i: 1 };
  if (v.iReal) return { ...s, i: 1 + 0.9 * (s.i - 1) };
  return s;
}

interface Calculada {
  soluto: Soluto;
  molaridad: number;
  osm: number;
}

function calcularDisolucion(d: DisolucionCaso, v: Variante = {}): Calculada | null {
  const base = solutoPorId(d.solutoId);
  if (!base) return null;
  const soluto = solutoCon(base, v);
  let molaridad: number | null;
  if (d.unidad === 'porcentaje' && v.porcentajeComoMolar) molaridad = molaridadDesde(d.valor, 'molar', soluto);
  else if (d.unidad === 'porcentaje' && v.sinPorDiez) molaridad = molaridadDesde(d.valor / 10, 'porcentaje', soluto);
  else molaridad = molaridadDesde(d.valor, d.unidad, soluto);
  if (molaridad === null) return null;
  const osm = osmolaridad(molaridad, soluto);
  if (osm === null) return null;
  return { soluto, molaridad, osm };
}

/** La temperatura que se le pasa al motor: con °C tomados por K, t − 273,15 da T = t. */
function celsiusPara(celsius: number, v: Variante): number {
  return v.celsiusComoKelvin ? celsius - CERO_CELSIUS_K : celsius;
}

/** La respuesta numérica de un caso A, con el motor. NaN si un dato no es válido. */
function valorNumerico(datos: DatosCaso, v: Variante = {}): number {
  switch (datos.tipo) {
    case 'osmolaridad': {
      const c = calcularDisolucion(datos.disolucion, v);
      return c ? c.osm : NaN;
    }
    case 'molaridad': {
      const c = calcularDisolucion(datos.disolucion, v);
      return c ? c.molaridad : NaN;
    }
    case 'presion': {
      const c = calcularDisolucion(datos.disolucion, v);
      const p = c ? presionOsmotica(c.osm, celsiusPara(datos.celsius, v)) : null;
      return p ? p[datos.unidadPresion] : NaN;
    }
    case 'deltaPi':
    case 'altura': {
      const a = calcularDisolucion(datos.ladoA, v);
      const b = calcularDisolucion(datos.ladoB, v);
      const r = a && b ? compararCompartimentos(a.osm, b.osm, celsiusPara(datos.celsius, v)) : null;
      if (!r) return NaN;
      return datos.tipo === 'altura' ? r.alturaColumna : r.deltaPi[datos.unidadPresion];
    }
    default:
      return NaN;
  }
}

/** La opción correcta de un caso C, EJECUTANDO el motor. null si un dato no es válido. */
function opcionCorrecta(datos: DatosCaso, v: Variante = {}): OpcionPrediccion | null {
  switch (datos.tipo) {
    case 'sentido': {
      const a = calcularDisolucion(datos.ladoA, v);
      const b = calcularDisolucion(datos.ladoB, v);
      const r = a && b ? compararCompartimentos(a.osm, b.osm, celsiusPara(datos.celsius, v)) : null;
      return r ? r.sentido : null;
    }
    case 'estado': {
      const m = calcularDisolucion(datos.medio, v);
      const r = m ? celulaEnMedio(datos.celula, datos.interior, m.osm, datos.celsius) : null;
      return r ? r.estado : null;
    }
    case 'tonicidad': {
      const m = calcularDisolucion(datos.medio, v);
      return m ? clasificarMedio(datos.interior, m.osm) : null;
    }
    default:
      return null;
  }
}

/* ─────────────────────────── Robustez de las predicciones ─────────────────────────── */

/** Distancia mínima a la igualdad para que una predicción no dependa del convenio. */
export const MARGEN_PREDICCION = 0.15;

/** Solutos que no se usan en los casos de célula: la urea atraviesa la membrana. */
const PERMEANTES = new Set(['urea']);

/**
 * ¿La respuesta de esta predicción es la misma con cualquier convenio razonable? (a) Con el i
 * real, (b) con R = 0,082 y T = t + 273 (el sentido y la tonicidad comparan osmolaridades, así
 * que no dependen de T; se comprueba igual moviendo T 0,15 K), y (c) lejos de la igualdad
 * (≥ 15 %), salvo las igualdades EXACTAS que el i real no rompe. En los casos A devuelve true.
 */
export function prediccionRobusta(datos: DatosCaso): boolean {
  if (!esPrediccion(datos)) return true;
  const ideal = opcionCorrecta(datos);
  if (ideal === null) return false;
  if (opcionCorrecta(datos, { iReal: true }) !== ideal) return false;

  if (datos.tipo === 'sentido') {
    const conT = { ...datos, celsius: datos.celsius - 0.15 };
    if (opcionCorrecta(conT) !== ideal) return false;
    const a = calcularDisolucion(datos.ladoA);
    const b = calcularDisolucion(datos.ladoB);
    if (!a || !b) return false;
    if (ideal === 'ninguno') {
      // Igualdad solo entre solutos del mismo i, y no agua frente a agua
      return a.osm > 0 && a.soluto.i === b.soluto.i;
    }
    return Math.abs(a.osm - b.osm) / Math.max(a.osm, b.osm) >= MARGEN_PREDICCION;
  }

  // Célula: tonicidad o estado. La guarda explícita es la que estrecha el tipo: `esPrediccion`
  // devuelve un boolean, no un predicado de tipo.
  if (datos.tipo !== 'estado' && datos.tipo !== 'tonicidad') return true;
  const medio = datos.medio;
  if (medio.valor > 0 && PERMEANTES.has(medio.solutoId)) return false;
  if (datos.tipo === 'estado' && opcionCorrecta({ ...datos, celsius: datos.celsius - 0.15 }) !== ideal) return false;
  const m = calcularDisolucion(medio);
  if (!m || !(datos.interior > 0)) return false;
  const relativa = (m.osm - datos.interior) / datos.interior;
  if (ideal === 'isotonico' || ideal === 'normal' || ideal === 'flacida') {
    return m.soluto.i === 1 && Math.abs(relativa) <= 1e-12;
  }
  return Math.abs(relativa) >= MARGEN_PREDICCION;
}

/* ─────────────────────────── Resolver un caso ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: Respuesta;
  pasos: string[];
  error?: string;
}

const R_TEXTO = numero(R_ATM_L, 5);

/** «T = 25 + 273,15 = 298,15 K» */
function pasoKelvin(celsius: number): string {
  const t = aKelvin(celsius);
  return `T = ${numero(celsius)} + 273,15 = ${numero(t ?? NaN, 2)} K (la fórmula pide kelvin).`;
}

/** Los pasos de la molaridad y la osmolaridad de una disolución, con un rótulo opcional. */
function pasosDisolucion(d: DisolucionCaso, c: Calculada, rotulo = ''): string[] {
  const pre = rotulo ? `${rotulo}: ` : '';
  if (d.valor === 0) return [mayuscula(`${pre}agua pura, sin soluto: 0 osmol/L.`)];
  const pasos: string[] = [];
  if (d.unidad === 'porcentaje') {
    pasos.push(
      `${pre}${numero(d.valor)} % m/v son ${numero(d.valor)} g en 100 mL, es decir, ${numero(d.valor * 10)} g por litro → M = ${numero(d.valor * 10)} / ${numero(c.soluto.masaMolar, 2)} = ${numero(c.molaridad)} mol/L.`,
    );
  }
  pasos.push(
    mayuscula(
      c.soluto.i === 1
        ? `${pre}${nombreSoluto(c.soluto)} no se disocia (i = 1): osmolaridad = ${numero(c.molaridad)} osmol/L.`
        : `${pre}${nombreSoluto(c.soluto)} se separa en ${c.soluto.i} iones (i = ${c.soluto.i}): osmolaridad = i·M = ${c.soluto.i} · ${numero(c.molaridad)} = ${numero(c.osm)} osmol/L.`,
    ),
  );
  return pasos;
}

const NOTA_R =
  'Con R = 0,082 atm·L/(mol·K) y T = t + 273, como en clase, la cifra cambia menos de un 0,2 % y también se acepta.';

/** Cómo verlo en la sección 1 del simulador. */
function comprobarEnMembrana(a: DisolucionCaso, b: DisolucionCaso, celsius: number): string {
  return `Compruébalo en la sección 1: temperatura ${numero(celsius)} °C, lado A con ${textoDisolucion(a)} y lado B con ${textoDisolucion(b)} (agua pura es concentración 0).`;
}

/** Cómo verlo en la sección 2 del simulador. */
function comprobarEnCelula(celula: TipoCelula | null, interior: number, medio: DisolucionCaso): string {
  const tipo = celula === 'vegetal' ? '«Vegetal (con pared celular)», ' : celula === 'animal' ? '«Animal (glóbulo rojo)», ' : '';
  const comoMedio = medio.valor === 0 ? 'el botón «Agua destilada»' : textoDisolucion(medio);
  return `Compruébalo en la sección 2: ${tipo}interior de ${numero(interior)} osmol/L y, como medio, ${comoMedio}.`;
}

const MECANISMO_ESTADO: Record<EstadoCelula, string> = {
  hinchada:
    'Entra agua y la célula animal, que no tiene pared que la sujete, se hincha; con una diferencia grande revienta (en los glóbulos rojos, hemólisis).',
  normal: 'Entra y sale la misma cantidad de agua: el volumen no cambia.',
  crenada: 'Sale agua, la célula animal pierde volumen y su membrana se arruga (crenación).',
  turgente:
    'Entra agua, la vacuola se llena y aprieta la membrana contra la pared celular, que aguanta: la célula queda turgente y no revienta.',
  flacida: 'No hay paso neto de agua: la membrana no presiona la pared y la célula pierde firmeza (flácida).',
  plasmolizada:
    'Sale agua, la vacuola se encoge y la membrana se despega de la pared celular (plasmólisis). La pared, rígida, conserva su forma.',
};

const MECANISMO_TONICIDAD: Record<Tonicidad, string> = {
  hipotonico: 'El medio tiene menos partículas disueltas que el interior: es hipotónico y el agua entra en la célula.',
  isotonico: 'El medio tiene las mismas partículas disueltas por litro que el interior: es isotónico y no hay paso neto de agua.',
  hipertonico: 'El medio tiene más partículas disueltas que el interior: es hipertónico y el agua sale de la célula.',
};

/** Medio frente al interior, en una frase con la diferencia relativa. */
function pasoComparacionCelula(interior: number, osmMedio: number, tonicidad: Tonicidad): string {
  const rel = (osmMedio - interior) / interior;
  const porcentaje = `${rel > 0 ? '+' : rel < 0 ? '−' : ''}${numero(Math.abs(rel) * 100, 1)} %`;
  return `Medio ${numero(osmMedio)} osmol/L frente a un interior de ${numero(interior)} osmol/L (${porcentaje}). ${MECANISMO_TONICIDAD[tonicidad]}`;
}

/**
 * Recalcula la respuesta de un caso desde sus datos, con el MISMO motor que pinta los paneles, y
 * explica cómo se llega a ella. No mira `respuesta`. Nunca lanza: un dato fuera de lugar
 * devuelve `{ ok: false }`.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const fallo = (error: string): Resolucion => ({ ok: false, valor: NaN, pasos: [], error });

  switch (datos.tipo) {
    case 'osmolaridad':
    case 'molaridad': {
      const c = calcularDisolucion(datos.disolucion);
      if (!c) return fallo('Disolución no válida.');
      if (datos.tipo === 'molaridad') {
        if (datos.disolucion.unidad !== 'porcentaje') return fallo('La molaridad se pide desde un % m/v.');
        const d = datos.disolucion;
        return {
          ok: true,
          valor: c.molaridad,
          pasos: [
            `${numero(d.valor)} % m/v quiere decir ${numero(d.valor)} g de soluto en 100 mL de disolución: en un litro, 10 veces más, ${numero(d.valor * 10)} g.`,
            `Moles en ese litro: M = ${numero(d.valor * 10)} g / ${numero(c.soluto.masaMolar, 2)} g/mol = ${numero(c.molaridad, 6)} mol/L.`,
          ],
        };
      }
      return { ok: true, valor: c.osm, pasos: pasosDisolucion(datos.disolucion, c) };
    }

    case 'presion': {
      const c = calcularDisolucion(datos.disolucion);
      const p = c ? presionOsmotica(c.osm, datos.celsius) : null;
      if (!c || !p) return fallo('Datos no válidos.');
      const T = aKelvin(datos.celsius) ?? NaN;
      const pasos = [
        ...pasosDisolucion(datos.disolucion, c),
        pasoKelvin(datos.celsius),
        `π = i·M·R·T = ${numero(c.osm)} · ${R_TEXTO} · ${numero(T, 2)} = ${numero(p.atm, 4)} atm.`,
      ];
      if (datos.unidadPresion === 'kPa') pasos.push(`En kPa: ${numero(p.atm, 4)} · 101,325 = ${numero(p.kPa, 2)} kPa.`);
      pasos.push(NOTA_R);
      return { ok: true, valor: p[datos.unidadPresion], pasos };
    }

    case 'deltaPi':
    case 'altura':
    case 'sentido': {
      const a = calcularDisolucion(datos.ladoA);
      const b = calcularDisolucion(datos.ladoB);
      const r = a && b ? compararCompartimentos(a.osm, b.osm, datos.celsius) : null;
      if (!a || !b || !r) return fallo('Datos no válidos.');
      const base = [...pasosDisolucion(datos.ladoA, a, 'Lado A'), ...pasosDisolucion(datos.ladoB, b, 'Lado B')];

      if (datos.tipo === 'sentido') {
        const mecanismo =
          r.sentido === 'ninguno'
            ? 'Las dos osmolaridades son iguales: el agua cruza la membrana lo mismo en cada sentido y no hay paso neto. Lo que cuenta es el número de partículas, no qué soluto es.'
            : `El agua pasa en neto hacia el lado con MÁS partículas disueltas, el ${r.sentido === 'A_a_B' ? 'B' : 'A'}: ahí hay menos agua libre, y el soluto no puede cruzar para igualar.`;
        return {
          ok: true,
          valor: r.sentido,
          pasos: [...base, mecanismo, comprobarEnMembrana(datos.ladoA, datos.ladoB, datos.celsius)],
        };
      }

      if (r.sentido === 'ninguno') return fallo('Los dos lados tienen la misma osmolaridad: no hay Δπ que calcular.');
      const T = aKelvin(datos.celsius) ?? NaN;
      const delta = [
        ...base,
        `Diferencia de osmolaridad: ${numero(r.diferenciaOsm)} osmol/L.`,
        pasoKelvin(datos.celsius),
        `Δπ = Δ(i·M)·R·T = ${numero(r.diferenciaOsm)} · ${R_TEXTO} · ${numero(T, 2)} = ${numero(r.deltaPi.atm, 4)} atm.`,
      ];
      if (datos.tipo === 'deltaPi') {
        if (datos.unidadPresion === 'kPa') delta.push(`En kPa: ${numero(r.deltaPi.atm, 4)} · 101,325 = ${numero(r.deltaPi.kPa, 2)} kPa.`);
        delta.push(NOTA_R);
        return { ok: true, valor: r.deltaPi[datos.unidadPresion], pasos: delta };
      }
      delta.push(
        `En pascales: ${numero(r.deltaPi.atm, 4)} · ${numero(P_ATM, 0)} = ${numero(r.deltaPi.pa, 1)} Pa.`,
        `h = Δπ / (ρ·g) = ${numero(r.deltaPi.pa, 1)} / (${numero(DENSIDAD_AGUA, 0)} · ${numero(G, 2)}) = ${numero(r.alturaColumna, 4)} m.`,
        NOTA_R,
      );
      return { ok: true, valor: r.alturaColumna, pasos: delta };
    }

    case 'estado':
    case 'tonicidad': {
      const m = calcularDisolucion(datos.medio);
      if (!m || !(datos.interior > 0)) return fallo('Datos no válidos.');
      const tonicidad = clasificarMedio(datos.interior, m.osm);
      if (!tonicidad) return fallo('Datos no válidos.');
      const pasos = [...pasosDisolucion(datos.medio, m, 'Medio'), pasoComparacionCelula(datos.interior, m.osm, tonicidad)];
      if (datos.tipo === 'tonicidad') {
        pasos.push(comprobarEnCelula(null, datos.interior, datos.medio));
        return { ok: true, valor: tonicidad, pasos };
      }
      const r = celulaEnMedio(datos.celula, datos.interior, m.osm, datos.celsius);
      if (!r) return fallo('Datos no válidos.');
      pasos.push(
        datos.celula === 'animal'
          ? `Es una célula animal, sin pared celular. ${MECANISMO_ESTADO[r.estado]}`
          : `Es una célula vegetal, con pared celular. ${MECANISMO_ESTADO[r.estado]}`,
        comprobarEnCelula(datos.celula, datos.interior, datos.medio),
      );
      return { ok: true, valor: r.estado, pasos };
    }
  }
}

/* ─────────────────────────── Corregir ─────────────────────────── */

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  /** |usuario − esperado| en los numéricos; NaN en las predicciones o si no se leyó un número. */
  diferencia: number;
  tolerancia: number;
}

/** ¿Lleva el caso algún electrolito (i > 1)? */
function hayElectrolito(datos: DatosCaso): boolean {
  const lista =
    datos.tipo === 'osmolaridad' || datos.tipo === 'molaridad' || datos.tipo === 'presion'
      ? [datos.disolucion]
      : datos.tipo === 'deltaPi' || datos.tipo === 'altura' || datos.tipo === 'sentido'
        ? [datos.ladoA, datos.ladoB]
        : [datos.medio];
  return lista.some((d) => d.valor > 0 && (solutoPorId(d.solutoId)?.i ?? 1) > 1);
}

function hayPorcentaje(datos: DatosCaso): boolean {
  const lista =
    datos.tipo === 'osmolaridad' || datos.tipo === 'molaridad' || datos.tipo === 'presion'
      ? [datos.disolucion]
      : datos.tipo === 'deltaPi' || datos.tipo === 'altura' || datos.tipo === 'sentido'
        ? [datos.ladoA, datos.ladoB]
        : [datos.medio];
  return lista.some((d) => d.valor > 0 && d.unidad === 'porcentaje');
}

/**
 * Los errores típicos con nombre propio. Cada uno es el resultado del MOTOR con un dato de
 * entrada cambiado como lo cambia quien se equivoca; se prueban en orden y gana el primero.
 */
function erroresTipicos(datos: DatosCaso, esperado: number): Array<{ valor: number; motivo: string }> {
  const lista: Array<{ valor: number; motivo: string }> = [];
  if (hayElectrolito(datos)) {
    lista.push({
      valor: valorNumerico(datos, { iUno: true }),
      motivo:
        'Has tomado i = 1. El NaCl y el KCl se separan en dos iones (i = 2) y el CaCl₂ en tres (i = 3): cuenta partículas, no fórmulas.',
    });
  }
  if (datos.tipo === 'presion' || datos.tipo === 'deltaPi' || datos.tipo === 'altura') {
    lista.push({
      valor: valorNumerico(datos, { celsiusComoKelvin: true }),
      motivo: 'Has usado la temperatura en grados Celsius. La ecuación de van ’t Hoff pide kelvin: T = t + 273.',
    });
  }
  if ((datos.tipo === 'presion' || datos.tipo === 'deltaPi') && datos.unidadPresion === 'atm') {
    lista.push({
      valor: (esperado * P_ATM) / 1000,
      motivo:
        'Ese número está en kPa (es lo que sale con R = 8,314 y M en mol/L). Se pide en atm: usa R = 0,082 atm·L/(mol·K) o divide entre 101,325.',
    });
  }
  if ((datos.tipo === 'presion' || datos.tipo === 'deltaPi') && datos.unidadPresion === 'kPa') {
    lista.push({
      valor: (esperado * 1000) / P_ATM,
      motivo: 'Ese número está en atm. Se pide en kPa: multiplica por 101,325 (o usa R = 8,314 con M en mol/L).',
    });
  }
  if (hayPorcentaje(datos)) {
    lista.push(
      {
        valor: valorNumerico(datos, { porcentajeComoMolar: true }),
        motivo: 'Has usado el % como si fueran mol/L. Primero pasa a mol/L: M = % · 10 / masa molar.',
      },
      {
        valor: valorNumerico(datos, { sinPorDiez: true }),
        motivo: 'Te falta el ×10: un 1 % m/v son 1 g en 100 mL, es decir, 10 g por litro.',
      },
    );
  }
  return lista;
}

/**
 * Corrige la respuesta del alumno. En los casos de predicción, `usuario` es la opción elegida (o
 * null si no eligió ninguna); en los numéricos, el número que tecleó (NaN si no se lee). Nunca
 * lanza.
 */
export function comprobarRespuesta(usuario: Respuesta | null, esperado: Respuesta, datos: DatosCaso): Veredicto {
  if (esPrediccion(datos)) {
    if (usuario === null || typeof usuario === 'number') {
      return { correcto: false, motivo: 'Elige una de las tres opciones antes de comprobar.', diferencia: NaN, tolerancia: 0 };
    }
    return usuario === esperado
      ? { correcto: true, motivo: '¡Correcto! Compruébalo ahora en el simulador y lee por qué en la solución.', diferencia: NaN, tolerancia: 0 }
      : {
          correcto: false,
          motivo: 'No es eso. Compara cuántas partículas disueltas hay por litro a cada lado de la membrana.',
          diferencia: NaN,
          tolerancia: 0,
        };
  }

  if (typeof esperado !== 'number' || typeof usuario === 'string') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal).', diferencia: NaN, tolerancia: 0 };
  }
  const tolerancia = toleranciaDe(datos, esperado);
  const magnitud = magnitudDe(datos);
  const c = corregirNumero(usuario ?? NaN, esperado, { tolerancia, magnitud });
  const { diferencia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal).', diferencia: NaN, tolerancia };
  }
  if (c.estado === 'imposible') {
    // El motor dice «va de 0 a Infinity» para una magnitud sin techo: aquí se dice en claro
    const que = magnitud === 'real' ? 'la respuesta' : magnitud.que;
    return {
      correcto: false,
      motivo: `${mayuscula(que)} no puede ser negativa: repasa la cuenta.`,
      diferencia,
      tolerancia,
    };
  }
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };

  for (const error of erroresTipicos(datos, esperado)) {
    if (!Number.isFinite(error.valor)) continue;
    // Un error que da lo mismo que la respuesta no se puede reconocer
    if (dentroDeTolerancia(error.valor, esperado, tolerancia)) continue;
    if (dentroDeTolerancia(usuario ?? NaN, error.valor, toleranciaDe(datos, error.valor))) {
      return { correcto: false, motivo: error.motivo, diferencia, tolerancia };
    }
  }

  const d = decimalesDe(datos, esperado);
  return {
    correcto: false,
    // Con tolerancia 0, «0,30004» para 0,3 no puede decir «Te has desviado 0» (hallazgo 3369)
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, d, numero)} de la respuesta.`,
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
  /** A = calcular un número · C = predecir antes de comprobar en el simulador. */
  tarea: 'A' | 'C';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: Respuesta;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

const PREDICE = 'ANTES de comprobarlo en el simulador, predice:';
const CON_R = 'Usa π = i·M·R·T con R = 0,082 atm·L/(mol·K) y la temperatura en kelvin.';

const ETIQUETA_SENTIDO = 'Paso neto de agua';
const ETIQUETA_ESTADO = '¿Qué le pasa a la célula?';
const ETIQUETA_TONICIDAD = 'Para la célula, el medio es…';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible. El «Redondea a N decimales» lo
 * añade `requiereRedondeo`, para que el enunciado y el margen del corrector no se separen.
 *
 * Sin ciudades, países ni monedas: el canal de aula es sobre todo latinoamericano.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'El agua busca las partículas',
    enunciado: `Una membrana semipermeable separa dos disoluciones de glucosa (no se disocia): en el lado A hay 0,1 mol/L y en el lado B, 0,4 mol/L. ${PREDICE} ¿hacia dónde pasa el agua en neto?`,
    categoria: 'abstracto',
    tarea: 'C',
    datos: {
      tipo: 'sentido',
      ladoA: { solutoId: 'glucosa', valor: 0.1, unidad: 'molar' },
      ladoB: { solutoId: 'glucosa', valor: 0.4, unidad: 'molar' },
      celsius: 25,
    },
    etiquetaRespuesta: ETIQUETA_SENTIDO,
    pista: 'La membrana deja pasar el agua, no el azúcar. ¿Qué lado tiene más partículas disueltas?',
  },
  {
    id: 2,
    titulo: 'Un glóbulo rojo en agua destilada',
    enunciado: `Un glóbulo rojo, cuyo interior tiene 0,30 osmol/L de partículas disueltas, se pone en agua destilada. ${PREDICE} ¿qué le pasa a la célula?`,
    categoria: 'aplicado',
    tarea: 'C',
    datos: { tipo: 'estado', celula: 'animal', interior: 0.3, medio: { solutoId: 'nacl', valor: 0, unidad: 'porcentaje' }, celsius: 25 },
    etiquetaRespuesta: ETIQUETA_ESTADO,
    pista: 'El agua destilada no lleva nada disuelto. ¿Hacia dónde va el agua? Y la célula animal, ¿tiene algo que la sujete?',
  },
  {
    id: 3,
    titulo: 'Lechuga en agua con sal',
    enunciado: `Una hoja de lechuga se deja en agua con sal: cloruro de sodio (NaCl) al 3 % m/v (se disocia por completo: i = 2). Sus células tienen un interior de 0,30 osmol/L. ${PREDICE} ¿qué les pasa a sus células?`,
    categoria: 'aplicado',
    tarea: 'C',
    datos: { tipo: 'estado', celula: 'vegetal', interior: 0.3, medio: { solutoId: 'nacl', valor: 3, unidad: 'porcentaje' }, celsius: 25 },
    etiquetaRespuesta: ETIQUETA_ESTADO,
    pista: 'El agua con sal tiene muchas más partículas por litro que la célula. Recuerda que la célula vegetal tiene pared.',
  },
  {
    id: 4,
    titulo: 'Partículas por litro',
    enunciado:
      'El cloruro de calcio (CaCl₂) se disuelve separándose por completo en tres iones: un Ca²⁺ y dos Cl⁻ (i = 3). ¿Cuántos osmoles de partículas disueltas hay por litro en una disolución de CaCl₂ 0,1 mol/L? Es su osmolaridad.',
    categoria: 'abstracto',
    tarea: 'A',
    datos: { tipo: 'osmolaridad', disolucion: { solutoId: 'cacl2', valor: 0.1, unidad: 'molar' } },
    etiquetaRespuesta: 'Osmolaridad (osmol/L)',
    pista: 'Cada fórmula de CaCl₂ que se disuelve da tres partículas. Osmolaridad = i·M.',
  },
  {
    id: 5,
    titulo: '¿Qué medio es para la célula?',
    enunciado: `Se prepara una disolución de glucosa 0,30 mol/L (no se disocia: i = 1) para poner glóbulos rojos, cuyo interior tiene 0,30 osmol/L. ${PREDICE} ¿qué tipo de medio es esa disolución para esas células?`,
    categoria: 'aplicado',
    tarea: 'C',
    datos: { tipo: 'tonicidad', interior: 0.3, medio: { solutoId: 'glucosa', valor: 0.3, unidad: 'molar' } },
    etiquetaRespuesta: ETIQUETA_TONICIDAD,
    pista: 'Compara las partículas disueltas por litro fuera (i·M) con las de dentro.',
  },
  {
    id: 6,
    titulo: 'Mismos gramos, distintas partículas',
    enunciado: `En el lado A de una membrana semipermeable hay glucosa al 10 % m/v y en el lado B, sacarosa al 10 % m/v: los mismos gramos por litro. Ninguna de las dos se disocia. La masa molar de la glucosa es 180,16 g/mol y la de la sacarosa, 342,3 g/mol. ${PREDICE} ¿hacia dónde pasa el agua en neto?`,
    categoria: 'abstracto',
    tarea: 'C',
    datos: {
      tipo: 'sentido',
      ladoA: { solutoId: 'glucosa', valor: 10, unidad: 'porcentaje' },
      ladoB: { solutoId: 'sacarosa', valor: 10, unidad: 'porcentaje' },
      celsius: 25,
    },
    etiquetaRespuesta: ETIQUETA_SENTIDO,
    pista: 'Lo que cuenta no son los gramos, sino las partículas. ¿Con cuál de los dos azúcares hay más moles en 100 g?',
  },
  {
    id: 7,
    titulo: 'Dos azúcares a la par',
    enunciado: `En el lado A hay glucosa 0,2 mol/L y en el lado B, sacarosa 0,2 mol/L. Ninguna de las dos se disocia. ${PREDICE} ¿hacia dónde pasa el agua en neto?`,
    categoria: 'abstracto',
    tarea: 'C',
    datos: {
      tipo: 'sentido',
      ladoA: { solutoId: 'glucosa', valor: 0.2, unidad: 'molar' },
      ladoB: { solutoId: 'sacarosa', valor: 0.2, unidad: 'molar' },
      celsius: 25,
    },
    etiquetaRespuesta: ETIQUETA_SENTIDO,
    pista: 'Son solutos distintos, pero ¿cuántas partículas disueltas hay por litro en cada lado?',
  },
  {
    id: 8,
    titulo: 'El suero que se pone en vena',
    enunciado:
      'El suero fisiológico que se pone en vena lleva cloruro de sodio (NaCl) al 0,9 % m/v: 0,9 g por cada 100 mL. Con la masa molar del NaCl, 58,44 g/mol, ¿cuál es su molaridad?',
    categoria: 'aplicado',
    tarea: 'A',
    datos: { tipo: 'molaridad', disolucion: { solutoId: 'nacl', valor: 0.9, unidad: 'porcentaje' } },
    etiquetaRespuesta: 'Molaridad (mol/L)',
    pista: 'Primero pasa a gramos por LITRO (×10) y después divide entre la masa molar.',
  },
  {
    id: 9,
    titulo: 'La presión osmótica de la sacarosa',
    enunciado: `Calcula la presión osmótica de una disolución de sacarosa 0,2 mol/L a 27 °C (la sacarosa no se disocia: i = 1). ${CON_R}`,
    categoria: 'abstracto',
    tarea: 'A',
    datos: { tipo: 'presion', disolucion: { solutoId: 'sacarosa', valor: 0.2, unidad: 'molar' }, celsius: 27, unidadPresion: 'atm' },
    etiquetaRespuesta: 'π (atm)',
    pista: 'Pasa los 27 °C a kelvin sumando 273 y multiplica i·M·R·T.',
  },
  {
    id: 10,
    titulo: 'Desalinizar el agua de mar',
    enunciado: `Una planta de ósmosis inversa empuja el agua de mar contra una membrana semipermeable con más presión que su presión osmótica, y así saca agua dulce. Trata el agua de mar como cloruro de sodio (NaCl) al 3,5 % m/v (masa molar 58,44 g/mol; se disocia por completo: i = 2) a 20 °C. ¿Cuál es su presión osmótica? ${CON_R}`,
    categoria: 'aplicado',
    tarea: 'A',
    datos: { tipo: 'presion', disolucion: { solutoId: 'nacl', valor: 3.5, unidad: 'porcentaje' }, celsius: 20, unidadPresion: 'atm' },
    etiquetaRespuesta: 'π (atm)',
    pista: 'Tres pasos: % a mol/L, mol/L a osmol/L (×i) y después π = i·M·R·T.',
  },
  {
    id: 11,
    titulo: 'La diferencia, en kilopascales',
    enunciado:
      'En el lado A de una membrana hay cloruro de sodio (NaCl) 0,1 mol/L (se disocia por completo: i = 2) y en el lado B, glucosa 0,1 mol/L (i = 1). A 25 °C, ¿cuál es la diferencia de presión osmótica Δπ entre los dos lados, en kilopascales? Usa R = 0,082 atm·L/(mol·K) y 1 atm = 101,325 kPa, o directamente R = 8,314 kPa·L/(mol·K).',
    categoria: 'abstracto',
    tarea: 'A',
    datos: {
      tipo: 'deltaPi',
      ladoA: { solutoId: 'nacl', valor: 0.1, unidad: 'molar' },
      ladoB: { solutoId: 'glucosa', valor: 0.1, unidad: 'molar' },
      celsius: 25,
      unidadPresion: 'kPa',
    },
    etiquetaRespuesta: 'Δπ (kPa)',
    pista: 'Δπ = (diferencia de osmolaridad)·R·T. Calcula primero la osmolaridad de cada lado.',
  },
  {
    id: 12,
    titulo: 'La columna del osmómetro',
    enunciado:
      'En un osmómetro, una disolución de sacarosa 0,01 mol/L (i = 1) queda separada de agua pura por una membrana semipermeable, a 20 °C. El agua entra y la disolución sube por un tubo hasta que el peso de su columna equilibra la diferencia de presión osmótica. ¿Qué altura alcanza la columna? Usa h = Δπ/(ρ·g) con ρ = 1000 kg/m³, g = 9,81 m/s² y Δπ en pascales (1 atm = 101.325 Pa), y R = 0,082 atm·L/(mol·K).',
    categoria: 'aplicado',
    tarea: 'A',
    datos: {
      tipo: 'altura',
      ladoA: { solutoId: 'sacarosa', valor: 0.01, unidad: 'molar' },
      ladoB: { solutoId: 'sacarosa', valor: 0, unidad: 'molar' },
      celsius: 20,
    },
    etiquetaRespuesta: 'h (m)',
    pista: 'Calcula Δπ en atm, pásala a pascales y divide entre ρ·g.',
  },
];

/** «Redondea a 2 decimales.» si la respuesta no es exacta con los decimales del panel. */
function sufijoRedondeo(datos: DatosCaso, valor: number): string {
  if (!requiereRedondeo(datos, valor)) return '';
  const d = decimalesDe(datos, valor);
  return ` Redondea a ${d === 1 ? 'un decimal' : `${d} decimales`}.`;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const valor: Respuesta = r.ok ? r.valor : NaN;
  const numerica = typeof valor === 'number';
  return {
    ...def,
    enunciado: numerica ? `${def.enunciado}${sufijoRedondeo(def.datos, valor)}` : def.enunciado,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.datos),
    requiereRedondeo: numerica && requiereRedondeo(def.datos, valor),
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: reproducible, pero no variado (simulador-genetica).
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

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: Respuesta;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  etiquetaRespuesta: string;
  pasos: string[];
}

const SOLUTOS_PRACTICA = ['glucosa', 'sacarosa', 'urea', 'nacl', 'kcl', 'cacl2'] as const;
const NO_ELECTROLITOS = ['glucosa', 'sacarosa'] as const;
const MOLARES = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5] as const;
const PORCENTAJES = [0.5, 0.9, 1, 2, 3, 5, 10] as const;
const DILUIDAS = [0.005, 0.01, 0.02, 0.05, 0.1] as const;
const TEMPERATURAS = [20, 25, 27, 30, 37] as const;
const INTERIORES = [0.28, 0.29, 0.3, 0.32] as const;
const TIPOS_PRACTICA: readonly TipoPregunta[] = [
  'osmolaridad',
  'molaridad',
  'presion',
  'deltaPi',
  'altura',
  'sentido',
  'estado',
  'tonicidad',
];

function disolucionAleatoria(rnd: () => number, solutos: readonly string[] = SOLUTOS_PRACTICA): DisolucionCaso {
  const solutoId = elegir(solutos, rnd);
  return rnd() < 0.6
    ? { solutoId, valor: elegir(MOLARES, rnd), unidad: 'molar' }
    : { solutoId, valor: elegir(PORCENTAJES, rnd), unidad: 'porcentaje' };
}

/** Un medio para una célula: a veces exactamente isotónico con un no electrolito, nunca urea. */
function medioAleatorio(rnd: () => number, interior: number): DisolucionCaso {
  const tirada = rnd();
  if (tirada < 0.2) return { solutoId: elegir(NO_ELECTROLITOS, rnd), valor: interior, unidad: 'molar' };
  if (tirada < 0.3) return { solutoId: 'nacl', valor: 0, unidad: 'porcentaje' };
  return disolucionAleatoria(rnd, ['glucosa', 'sacarosa', 'nacl', 'kcl', 'cacl2']);
}

/** Un escenario del tipo pedido; puede no ser válido (lo filtra `ejercicioValido`). */
function construir(tipo: TipoPregunta, rnd: () => number): DatosCaso {
  const celsius = elegir(TEMPERATURAS, rnd);
  switch (tipo) {
    case 'osmolaridad':
      return { tipo, disolucion: disolucionAleatoria(rnd) };
    case 'molaridad':
      return { tipo, disolucion: { solutoId: elegir(SOLUTOS_PRACTICA, rnd), valor: elegir(PORCENTAJES, rnd), unidad: 'porcentaje' } };
    case 'presion':
      return { tipo, disolucion: disolucionAleatoria(rnd), celsius, unidadPresion: rnd() < 0.7 ? 'atm' : 'kPa' };
    case 'deltaPi':
      return {
        tipo,
        ladoA: { solutoId: elegir(SOLUTOS_PRACTICA, rnd), valor: elegir(MOLARES, rnd), unidad: 'molar' },
        ladoB: { solutoId: elegir(SOLUTOS_PRACTICA, rnd), valor: elegir(MOLARES, rnd), unidad: 'molar' },
        celsius,
        unidadPresion: rnd() < 0.7 ? 'atm' : 'kPa',
      };
    case 'altura':
      return {
        tipo,
        ladoA: { solutoId: elegir(SOLUTOS_PRACTICA, rnd), valor: elegir(DILUIDAS, rnd), unidad: 'molar' },
        ladoB: { solutoId: 'glucosa', valor: 0, unidad: 'molar' },
        celsius,
      };
    case 'sentido': {
      if (rnd() < 0.2) {
        // «Ninguno»: dos solutos distintos del MISMO i a la misma molaridad
        const pareja = elegir([['glucosa', 'sacarosa'], ['sacarosa', 'glucosa'], ['nacl', 'kcl'], ['kcl', 'nacl']] as const, rnd);
        const valor = elegir(MOLARES, rnd);
        return {
          tipo,
          ladoA: { solutoId: pareja[0], valor, unidad: 'molar' },
          ladoB: { solutoId: pareja[1], valor, unidad: 'molar' },
          celsius,
        };
      }
      const conAgua = rnd() < 0.15;
      const a = disolucionAleatoria(rnd);
      const b: DisolucionCaso = conAgua ? { solutoId: 'glucosa', valor: 0, unidad: 'molar' } : disolucionAleatoria(rnd);
      return rnd() < 0.5 ? { tipo, ladoA: a, ladoB: b, celsius } : { tipo, ladoA: b, ladoB: a, celsius };
    }
    case 'estado': {
      const interior = elegir(INTERIORES, rnd);
      return { tipo, celula: rnd() < 0.5 ? 'animal' : 'vegetal', interior, medio: medioAleatorio(rnd, interior), celsius };
    }
    case 'tonicidad': {
      const interior = elegir(INTERIORES, rnd);
      return { tipo, interior, medio: medioAleatorio(rnd, interior) };
    }
  }
}

/**
 * ¿Sirve como ejercicio? Las predicciones, solo si son robustas. Las numéricas, con un SUELO de
 * respuesta para que el margen mínimo de 0,01 de la tolerancia relativa no se coma el problema
 * (visualizador-volumenes, 19/10/2026): π y Δπ ≥ 1 atm (≥ 100 kPa) y 1 m ≤ h < 100 m, que es
 * donde el panel escribe la altura en metros con dos decimales. Y que ningún error típico dé lo
 * mismo que la respuesta, para que el corrector lo pueda nombrar.
 */
function ejercicioValido(datos: DatosCaso): boolean {
  if (esPrediccion(datos)) return prediccionRobusta(datos);
  const r = resolverCaso(datos);
  if (!r.ok || typeof r.valor !== 'number' || !Number.isFinite(r.valor) || r.valor <= 0) return false;
  const v = r.valor;
  if (datos.tipo === 'presion' || datos.tipo === 'deltaPi') {
    if (datos.unidadPresion === 'atm' ? v < 1 : v < 100) return false;
  }
  if (datos.tipo === 'altura' && (v < 1 || v >= 100)) return false;
  const tol = toleranciaDe(datos, v);
  return erroresTipicos(datos, v).every((e) => !Number.isFinite(e.valor) || !dentroDeTolerancia(e.valor, v, tol));
}

const ESCENARIO_RESERVA: DatosCaso = {
  tipo: 'sentido',
  ladoA: { solutoId: 'nacl', valor: 0.1, unidad: 'molar' },
  ladoB: { solutoId: 'glucosa', valor: 0.5, unidad: 'molar' },
  celsius: 25,
};

/** El enunciado de un ejercicio de práctica, con los datos que hacen falta para resolverlo. */
function enunciadoPractica(datos: DatosCaso): { enunciado: string; etiqueta: string } {
  const con = (d: DisolucionCaso) => {
    const dato = datoSoluto(d);
    return dato ? `${textoDisolucion(d)} (${dato})` : textoDisolucion(d);
  };
  switch (datos.tipo) {
    case 'osmolaridad':
      return {
        enunciado: `¿Cuál es la osmolaridad (partículas disueltas por litro) de una disolución de ${con(datos.disolucion)}?`,
        etiqueta: 'Osmolaridad (osmol/L)',
      };
    case 'molaridad':
      return {
        enunciado: `¿Cuál es la molaridad de una disolución de ${con(datos.disolucion)}?`,
        etiqueta: 'Molaridad (mol/L)',
      };
    case 'presion':
      return {
        enunciado: `Calcula la presión osmótica de una disolución de ${con(datos.disolucion)} a ${numero(datos.celsius)} °C, en ${datos.unidadPresion === 'atm' ? 'atmósferas' : 'kilopascales (1 atm = 101,325 kPa)'}. ${CON_R}`,
        etiqueta: `π (${datos.unidadPresion})`,
      };
    case 'deltaPi':
      return {
        enunciado: `Una membrana semipermeable separa ${con(datos.ladoA)} en el lado A y ${con(datos.ladoB)} en el lado B, a ${numero(datos.celsius)} °C. ¿Cuál es la diferencia de presión osmótica Δπ entre los dos lados, en ${datos.unidadPresion === 'atm' ? 'atmósferas' : 'kilopascales (1 atm = 101,325 kPa)'}? ${CON_R}`,
        etiqueta: `Δπ (${datos.unidadPresion})`,
      };
    case 'altura':
      return {
        enunciado: `En un osmómetro, una disolución de ${con(datos.ladoA)} queda separada de agua pura por una membrana semipermeable, a ${numero(datos.celsius)} °C. ¿Qué altura alcanza la columna de disolución que equilibra Δπ? Usa h = Δπ/(ρ·g) con ρ = 1000 kg/m³, g = 9,81 m/s² y Δπ en pascales (1 atm = 101.325 Pa), y R = 0,082 atm·L/(mol·K).`,
        etiqueta: 'h (m)',
      };
    case 'sentido':
      return {
        enunciado: `Una membrana semipermeable separa ${con(datos.ladoA)} en el lado A y ${con(datos.ladoB)} en el lado B. ${PREDICE} ¿hacia dónde pasa el agua en neto?`,
        etiqueta: ETIQUETA_SENTIDO,
      };
    case 'estado':
      return {
        enunciado: `Una célula ${datos.celula === 'animal' ? 'animal (un glóbulo rojo)' : 'vegetal (con pared celular)'}, con un interior de ${numero(datos.interior)} osmol/L, se pone en ${datos.medio.valor === 0 ? 'agua destilada' : `una disolución de ${con(datos.medio)}`}. ${PREDICE} ¿qué le pasa a la célula?`,
        etiqueta: ETIQUETA_ESTADO,
      };
    case 'tonicidad':
      return {
        enunciado: `Una célula con un interior de ${numero(datos.interior)} osmol/L se pone en ${datos.medio.valor === 0 ? 'agua destilada' : `una disolución de ${con(datos.medio)}`}. ${PREDICE} ¿qué tipo de medio es para la célula?`,
        etiqueta: ETIQUETA_TONICIDAD,
      };
  }
}

/**
 * Ejercicio aleatorio de cualquiera de los ocho tipos de pregunta. Usa EL MISMO `resolverCaso`
 * que los doce fijos, y por tanto el mismo motor que los paneles: si divergieran, el alumno
 * entrenaría con una regla y sería corregido con otra. Las predicciones pasan el mismo filtro de
 * robustez que los casos fijos.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const tipo = elegir(TIPOS_PRACTICA, rnd);
  let datos: DatosCaso = ESCENARIO_RESERVA;
  for (let intento = 0; intento < 60; intento++) {
    const candidato = construir(tipo, rnd);
    if (ejercicioValido(candidato)) {
      datos = candidato;
      break;
    }
  }
  const r = resolverCaso(datos);
  const valor: Respuesta = r.ok ? r.valor : NaN;
  const numerica = typeof valor === 'number';
  const { enunciado, etiqueta } = enunciadoPractica(datos);
  return {
    enunciado: numerica ? `${enunciado}${sufijoRedondeo(datos, valor)}` : enunciado,
    datos,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, datos),
    requiereRedondeo: numerica && requiereRedondeo(datos, valor),
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}

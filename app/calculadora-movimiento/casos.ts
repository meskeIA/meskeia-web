/**
 * Casos para clase — la tarea asignable de `calculadora-movimiento` (skill /casos-aula-meskeia,
 * 24/10/2026).
 *
 * Por qué esta app: es la que más aula recibe de todas las que no tenían tarea dentro. 141 visitas
 * de aula, el 44 % de su tráfico de vida: una clase de Ecuador con 41 IPs el 22/10/2026, y antes
 * Colombia (02/10), Perú (06-08/10) y México (14/10). Cuatro países es el tema atrayendo clase.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada de la cinemática se reescribe aquí: se calcula con `posicion`, `velocidad`,
 * `instanteParada`, `resolverRectilineo` y `resolverParabolico` de `./motor.ts`, el MISMO módulo
 * con el que las tarjetas, el simulador y sus gráficas pintan sus cifras.
 *
 * Las únicas cuentas propias son las INVERSIONES que el motor no despeja: t = x/v (caso 2),
 * a = (v − v₀)/t (caso 5) y t = √(2h/g) (caso 9). Las tres se devuelven al motor y se exige que
 * reproduzcan el dato del enunciado; si no cuadra, la resolución sale con `{ ok: false }`.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **g = 9,81 m/s²**, la de la app. En Latinoamérica muchos libros usan 9,8 o 10, así que todo
 *    enunciado cuya respuesta cambie con g = 10 lo dice («toma g = 9,81 m/s²»), y el spec lo exige
 *    recalculando cada caso con g = 10. Quien usa 10 recibe un motivo con nombre propio.
 * ⚠️ **El signo es convenio de cada libro** (la app mide la caída con el eje hacia ABAJO). Por eso
 *    ningún caso pide un valor con signo: se preguntan distancias, tiempos y rapideces, que salen
 *    igual con cualquier eje. Los frenados se enuncian como «frena con 6 m/s²» o «una aceleración
 *    de 4 m/s² en sentido contrario a su velocidad», no con un número negativo.
 * ⚠️ **Distancia recorrida ≠ desplazamiento** cuando el móvil se para y vuelve (motor.ts, S0179).
 *    El caso 8 lo pregunta a propósito, y el corrector reconoce el desplazamiento por su nombre.
 * ⚠️ **km/h**: los casos 2, 5 y 6 dan velocidades en km/h, el error nº 1 de la propia página.
 *    Quien no las pasa a m/s recibe un motivo con nombre propio.
 *
 * Los datos están elegidos para que cada error típico dé OTRA cifra (hallazgo 2628 de
 * simulador-mas-resorte): olvidar el ½, confundir v con x, no convertir km/h, usar g = 10.
 */

import { formatNumber } from '@/lib';
import { G, instanteParada, posicion, resolverParabolico, resolverRectilineo, velocidad } from './motor';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  textoDesviacion,
  toleranciaDeRedondeo,
} from '@/lib/calculadoras/correctorCasosAula';

/** Holgura relativa con la que una inversión tiene que reproducir el dato del enunciado. */
const HOLGURA_INVERSION = 1e-9;

/** km/h → m/s. */
const KMH_A_MS = 3.6;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  /** MRU: x = v·t. */
  | 'distanciaMru'
  /** MRU despejando el tiempo: t = x/v. */
  | 'tiempoMru'
  /** MRUA: v = v₀ + a·t. */
  | 'velocidadFinal'
  /** MRUA acelerando: x = v₀·t + ½·a·t². */
  | 'distanciaMrua'
  /** MRUA despejando la aceleración: a = (v − v₀)/t. */
  | 'aceleracion'
  /** Frenado hasta pararse: t = v₀/|a|. */
  | 'tiempoFrenado'
  /** Frenado hasta pararse: d = v₀²/(2·|a|). */
  | 'distanciaFrenado'
  /** Frena, se para y vuelve: la longitud del camino, no el desplazamiento. */
  | 'distanciaConVuelta'
  /** Caída desde el reposo: t = √(2h/g). */
  | 'tiempoCaida'
  /** Caída desde el reposo: v = g·t. */
  | 'velocidadCaida'
  /** Lanzamiento vertical hacia arriba: h = v₀²/(2g). */
  | 'alturaMaxima'
  /** Tiro parabólico de suelo a suelo: R = v₀²·sen(2θ)/g. */
  | 'alcance';

export interface DatosCaso {
  pregunta: Pregunta;
  /** Velocidad inicial (o la constante del MRU), en m/s; en km/h si `enKmh`. */
  v0?: number;
  /** Velocidad final, en m/s; en km/h si `enKmh`. Solo para despejar la aceleración. */
  v?: number;
  /**
   * Aceleración en m/s². En los frenados es el MÓDULO (el enunciado dice «frena con 6 m/s²»);
   * en `distanciaConVuelta` va con signo, negativa, porque se opone a la velocidad.
   */
  a?: number;
  /** Tiempo, en s. */
  t?: number;
  /** Distancia que hay que recorrer, en m (solo `tiempoMru`). */
  x?: number;
  /** El enunciado da la distancia en km: la solución enseña el paso a metros. */
  xEnKm?: boolean;
  /** Altura de la que cae, en m. */
  h?: number;
  /** Ángulo de lanzamiento sobre la horizontal, en grados. */
  angulo?: number;
  /** Las velocidades del enunciado están en km/h. */
  enKmh?: boolean;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/** Opciones para recalcular un caso con OTRO convenio: así se reconocen los errores típicos. */
export interface OpcionesResolucion {
  /** Gravedad, m/s². Por defecto la de la app, 9,81. */
  g?: number;
  /** No pasar los km/h a m/s (el error típico). */
  sinConvertir?: boolean;
}

/** Las preguntas cuya respuesta depende de g: sus enunciados declaran g = 9,81. */
const USAN_G: ReadonlySet<Pregunta> = new Set(['tiempoCaida', 'velocidadCaida', 'alturaMaxima', 'alcance']);

export function usaGravedad(pregunta: Pregunta): boolean {
  return USAN_G.has(pregunta);
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (m, s, m/s o m/s²). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «2,0193», «3000». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  return `a ${decimales} decimales`;
}

function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function noNegativo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

/** Unidad en la que sale el resultado de cada pregunta. */
export function unidadDePregunta(pregunta: Pregunta): string {
  switch (pregunta) {
    case 'tiempoMru':
    case 'tiempoFrenado':
    case 'tiempoCaida':
      return 's';
    case 'velocidadFinal':
    case 'velocidadCaida':
      return 'm/s';
    case 'aceleracion':
      return 'm/s²';
    default:
      return 'm';
  }
}

/** ¿Reproduce `obtenido` el dato `dado`? Las inversiones se contrastan así con el motor. */
function reproduce(obtenido: number, dado: number): boolean {
  return Math.abs(obtenido - dado) <= HOLGURA_INVERSION * Math.max(1, Math.abs(dado));
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera.
 */
export function resolverCaso(datos: DatosCaso, opciones: OpcionesResolucion = {}): Resolucion {
  const decimales = datos.decimales ?? 2;
  const g = opciones.g ?? G;
  const pasos: string[] = [];
  let valor: number;

  if (!(Number.isFinite(g) && g > 0)) {
    return { ok: false, valor: NaN, pasos, error: 'La gravedad debe ser un número positivo.' };
  }

  /** Pasa una velocidad del enunciado a m/s, y deja el paso escrito si venía en km/h. */
  let convertidas = 0;
  const aMs = (vel: number, rotulo: string): number => {
    if (!datos.enKmh) return vel;
    if (opciones.sinConvertir) return vel;
    const ms = vel / KMH_A_MS;
    const entrada = convertidas === 0 ? 'Primero, a unidades del SI:' : 'Igual con';
    convertidas += 1;
    pasos.push(`${entrada} ${rotulo} = ${numero(vel)} km/h ÷ 3,6 = ${numero(ms)} m/s.`);
    return ms;
  };

  switch (datos.pregunta) {
    case 'distanciaMru': {
      if (!positivo(datos.v0)) return falta('la velocidad', pasos);
      if (!positivo(datos.t)) return falta('el tiempo', pasos);
      const v = aMs(datos.v0, 'v');
      valor = posicion({ v0: v, a: 0 }, datos.t);
      pasos.push(`En el MRU la velocidad no cambia, así que x = v·t = ${numero(v)}·${numero(datos.t)} = ${numero(valor)} m.`);
      break;
    }

    case 'tiempoMru': {
      if (!positivo(datos.v0)) return falta('la velocidad', pasos);
      if (!positivo(datos.x)) return falta('la distancia', pasos);
      const v = aMs(datos.v0, 'v');
      valor = datos.x / v;
      if (datos.xEnKm) pasos.push(`La distancia, también en metros: ${numero(datos.x / 1000)} km = ${numero(datos.x)} m.`);
      pasos.push(`De x = v·t se despeja t = x/v = ${numero(datos.x)}/${numero(v)} = ${numero(valor)} s.`);
      if (!reproduce(posicion({ v0: v, a: 0 }, valor), datos.x)) {
        return { ok: false, valor: NaN, pasos, error: 'El tiempo despejado no reproduce la distancia.' };
      }
      pasos.push(`Comprobación: ${numero(v)} m/s · ${numero(valor)} s = ${numero(datos.x)} m.`);
      break;
    }

    case 'velocidadFinal': {
      if (!noNegativo(datos.v0)) return falta('la velocidad inicial', pasos);
      if (!positivo(datos.a)) return falta('la aceleración', pasos);
      if (!positivo(datos.t)) return falta('el tiempo', pasos);
      const v0 = aMs(datos.v0, 'v₀');
      valor = velocidad({ v0, a: datos.a }, datos.t);
      pasos.push(
        `En el MRUA la velocidad crece lo mismo cada segundo: v = v₀ + a·t = ${numero(v0)} + ${numero(datos.a)}·${numero(datos.t)} = ${numero(valor)} m/s.`,
      );
      pasos.push(
        `Ojo: ½·a·t² = ${numero(0.5 * datos.a * datos.t * datos.t)} es la distancia que recorre partiendo del reposo, no su velocidad.`,
      );
      break;
    }

    case 'distanciaMrua': {
      if (!noNegativo(datos.v0)) return falta('la velocidad inicial', pasos);
      if (!positivo(datos.a)) return falta('la aceleración', pasos);
      if (!positivo(datos.t)) return falta('el tiempo', pasos);
      const v0 = aMs(datos.v0, 'v₀');
      const r = resolverRectilineo({ v0, a: datos.a }, datos.t);
      valor = r.distancia;
      pasos.push(
        `x = v₀·t + ½·a·t² = ${numero(v0)}·${numero(datos.t)} + ½·${numero(datos.a)}·${numero(datos.t)}² = ${numero(v0 * datos.t)} + ${numero(0.5 * datos.a * datos.t * datos.t)} = ${numero(valor)} m.`,
      );
      pasos.push('Como acelera en el sentido en que ya se movía, no se para ni vuelve: la distancia recorrida es ese mismo desplazamiento.');
      break;
    }

    case 'aceleracion': {
      if (!noNegativo(datos.v0)) return falta('la velocidad inicial', pasos);
      if (!positivo(datos.v)) return falta('la velocidad final', pasos);
      if (!positivo(datos.t)) return falta('el tiempo', pasos);
      const v0 = aMs(datos.v0, 'v₀');
      const v = aMs(datos.v, 'v');
      valor = (v - v0) / datos.t;
      pasos.push(`De v = v₀ + a·t se despeja a = (v − v₀)/t = (${numero(v)} − ${numero(v0)})/${numero(datos.t)} = ${numero(valor)} m/s².`);
      if (!reproduce(velocidad({ v0, a: valor }, datos.t), v)) {
        return { ok: false, valor: NaN, pasos, error: 'La aceleración despejada no reproduce la velocidad final.' };
      }
      break;
    }

    case 'tiempoFrenado':
    case 'distanciaFrenado': {
      if (!positivo(datos.v0)) return falta('la velocidad inicial', pasos);
      if (!positivo(datos.a)) return falta('la aceleración de frenado', pasos);
      const v0 = aMs(datos.v0, 'v₀');
      const mov = { v0, a: -datos.a };
      const tp = instanteParada(mov);
      if (tp === null) return { ok: false, valor: NaN, pasos, error: 'El móvil no llega a pararse.' };
      pasos.push(
        `Frenar es acelerar en contra de la velocidad. Se para cuando v = v₀ − a·t = 0, es decir, en t = v₀/a = ${numero(v0)}/${numero(datos.a)} = ${numero(tp)} s.`,
      );
      if (datos.pregunta === 'tiempoFrenado') {
        valor = tp;
      } else {
        valor = posicion(mov, tp);
        pasos.push(
          `En ese tiempo recorre x = v₀·t − ½·a·t² = ${numero(v0)}·${numero(tp)} − ½·${numero(datos.a)}·${numero(tp)}² = ${numero(valor)} m.`,
        );
        pasos.push(`Atajo sin tiempo: v² = v₀² − 2·a·d con v = 0, así que d = v₀²/(2·a) = ${numero(v0 * v0)}/${numero(2 * datos.a)} = ${numero(valor)} m.`);
      }
      break;
    }

    case 'distanciaConVuelta': {
      if (!positivo(datos.v0)) return falta('la velocidad inicial', pasos);
      if (typeof datos.a !== 'number' || !(datos.a < 0)) return falta('una aceleración contraria a la velocidad', pasos);
      if (!positivo(datos.t)) return falta('el tiempo', pasos);
      const mov = { v0: datos.v0, a: datos.a };
      const r = resolverRectilineo(mov, datos.t);
      if (r.tParada === null || r.xParada === null) {
        return { ok: false, valor: NaN, pasos, error: 'El móvil no llega a darse la vuelta en ese tiempo.' };
      }
      const frena = -datos.a;
      pasos.push(`Primero, ¿se para antes de ${numero(datos.t)} s? v = 0 en t = v₀/a = ${numero(datos.v0)}/${numero(frena)} = ${numero(r.tParada)} s. Sí: a partir de ahí vuelve.`);
      pasos.push(
        `Ida: hasta pararse recorre x = ${numero(datos.v0)}·${numero(r.tParada)} − ½·${numero(frena)}·${numero(r.tParada)}² = ${numero(r.xParada)} m.`,
      );
      pasos.push(
        `Al final está en x(${numero(datos.t)}) = ${numero(datos.v0)}·${numero(datos.t)} − ½·${numero(frena)}·${numero(datos.t)}² = ${numero(r.desplazamiento)} m del origen (ese es el desplazamiento).`,
      );
      valor = r.distancia;
      pasos.push(
        `Vuelta: de ${numero(r.xParada)} m a ${numero(r.desplazamiento)} m son ${numero(Math.abs(r.xParada - r.desplazamiento))} m. Distancia recorrida = ${numero(r.xParada)} + ${numero(Math.abs(r.xParada - r.desplazamiento))} = ${numero(valor)} m.`,
      );
      break;
    }

    case 'tiempoCaida': {
      if (!positivo(datos.h)) return falta('la altura', pasos);
      valor = Math.sqrt((2 * datos.h) / g);
      pasos.push(`Cae desde el reposo, así que h = ½·g·t², y se despeja t = √(2h/g) = √(2·${numero(datos.h)}/${numero(g)}) = ${numero(valor)} s.`);
      if (!reproduce(posicion({ v0: 0, a: g }, valor), datos.h)) {
        return { ok: false, valor: NaN, pasos, error: 'El tiempo despejado no reproduce la altura.' };
      }
      pasos.push('La masa no interviene: sin rozamiento con el aire, todos los cuerpos caen igual.');
      break;
    }

    case 'velocidadCaida': {
      if (!positivo(datos.t)) return falta('el tiempo', pasos);
      valor = velocidad({ v0: 0, a: g }, datos.t);
      pasos.push(`Desde el reposo, v = g·t = ${numero(g)}·${numero(datos.t)} = ${numero(valor)} m/s.`);
      break;
    }

    case 'alturaMaxima': {
      if (!positivo(datos.v0)) return falta('la velocidad de lanzamiento', pasos);
      // El eje de la app apunta hacia abajo: lanzar hacia arriba es v₀ negativa (motor.ts).
      const mov = { v0: -datos.v0, a: g };
      const tp = instanteParada(mov);
      if (tp === null) return { ok: false, valor: NaN, pasos, error: 'El objeto no llega a pararse.' };
      valor = Math.abs(posicion(mov, tp));
      pasos.push(`Sube frenando por la gravedad hasta que su velocidad es cero: t = v₀/g = ${numero(datos.v0)}/${numero(g)} = ${numero(tp)} s.`);
      pasos.push(`Altura: h = v₀·t − ½·g·t² = ${numero(datos.v0)}·${numero(tp)} − ½·${numero(g)}·${numero(tp)}² = ${numero(valor)} m.`);
      pasos.push(`Sin pasar por el tiempo: v² = v₀² − 2·g·h con v = 0, así que h = v₀²/(2g) = ${numero(datos.v0 * datos.v0)}/${numero(2 * g)} = ${numero(valor)} m.`);
      break;
    }

    case 'alcance': {
      if (!positivo(datos.v0)) return falta('la velocidad de lanzamiento', pasos);
      if (!(positivo(datos.angulo) && datos.angulo < 90)) return falta('un ángulo entre 0° y 90°', pasos);
      const r = resolverParabolico(datos.v0, datos.angulo, g);
      pasos.push(
        `Se descompone la velocidad: vₓ = v₀·cos ${numero(datos.angulo)}° = ${numero(r.velocidadX)} m/s y vᵧ = v₀·sen ${numero(datos.angulo)}° = ${numero(r.velocidadY)} m/s.`,
      );
      pasos.push(`Tiempo de vuelo, hasta volver al suelo: T = 2·vᵧ/g = 2·${numero(r.velocidadY)}/${numero(g)} = ${numero(r.tiempoVuelo)} s.`);
      valor = r.alcance;
      pasos.push(`En horizontal no hay aceleración: R = vₓ·T = ${numero(r.velocidadX)}·${numero(r.tiempoVuelo)} = ${numero(valor)} m.`);
      pasos.push(`Es lo mismo que R = v₀²·sen(2θ)/g = ${numero(datos.v0 * datos.v0)}·sen ${numero(2 * datos.angulo)}°/${numero(g)}.`);
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Pregunta desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  const unidad = unidadDePregunta(datos.pregunta);
  const redondeado = redondearA(valor, decimales);
  pasos.push(
    exigeRedondeo(valor, decimales)
      ? `Redondeando ${textoRedondeo(decimales)}: ${formatNumber(redondeado, decimales)} ${unidad}.`
      : `Resultado: ${formatNumber(redondeado, decimales)} ${unidad}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * Los datos son EXACTOS (g = 9,81 declarada, velocidades y tiempos exactos), así que solo queda
 * el redondeo: media unidad del último decimal pedido si hay que redondear, y 0 si la cifra es
 * exacta. Es la política de simulador-mas-resorte y simulador-plano-inclinado.
 */
export function toleranciaDe(datos: DatosCaso): number {
  const r = resolverCaso(datos);
  if (!r.ok) return 0;
  return toleranciaDeRedondeo(r.valor, datos.decimales ?? 2);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** ¿Da `usuario` lo que saldría con otro convenio? Con la misma tolerancia que la respuesta. */
function coincideCon(usuario: number, datos: DatosCaso, opciones: OpcionesResolucion, tolerancia: number): boolean {
  const r = resolverCaso(datos, opciones);
  if (!r.ok) return false;
  const otra = redondearA(r.valor, datos.decimales ?? 2);
  return dentroDeTolerancia(usuario, otra, Math.max(tolerancia, toleranciaDeRedondeo(r.valor, datos.decimales ?? 2)));
}

/**
 * Corrige la respuesta del alumno. Nunca lanza. Reconoce por su nombre los errores típicos del
 * tema: usar g = 10, no pasar los km/h a m/s, dar el desplazamiento en vez de la distancia
 * recorrida y poner un signo a una magnitud que se pide sin él.
 */
export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  // Magnitudes continuas (distancias, tiempos, rapideces, una aceleración): ningún valor es
  // imposible por sí mismo; el signo cambiado se diagnostica aparte, con su porqué.
  const c = corregirNumero(usuario, esperado, { tolerancia: toleranciaDe(datos), magnitud: 'real' });
  const { diferencia, tolerancia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal).', diferencia: NaN, tolerancia };
  }
  if (c.motivoImposible) return { correcto: false, motivo: c.motivoImposible, diferencia, tolerancia };
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };

  if (esperado > 0 && dentroDeTolerancia(-usuario, esperado, tolerancia)) {
    return {
      correcto: false,
      motivo: 'La cifra está bien, pero se pide sin signo: una distancia, un tiempo o una rapidez no dependen de hacia dónde apunte tu eje.',
      diferencia,
      tolerancia,
    };
  }
  if (usaGravedad(datos.pregunta) && coincideCon(usuario, datos, { g: 10 }, tolerancia)) {
    return {
      correcto: false,
      motivo: 'Has usado g = 10 m/s². El enunciado pide g = 9,81 m/s², la misma que usa la calculadora.',
      diferencia,
      tolerancia,
    };
  }
  if (datos.enKmh && coincideCon(usuario, datos, { sinConvertir: true }, tolerancia)) {
    return {
      correcto: false,
      motivo: 'Te falta pasar los km/h a m/s: divide entre 3,6 antes de operar.',
      diferencia,
      tolerancia,
    };
  }
  if (datos.pregunta === 'distanciaConVuelta' && positivo(datos.v0) && typeof datos.a === 'number' && positivo(datos.t)) {
    const desplazamiento = Math.abs(resolverRectilineo({ v0: datos.v0, a: datos.a }, datos.t).desplazamiento);
    if (dentroDeTolerancia(usuario, redondearA(desplazamiento, datos.decimales ?? 2), tolerancia)) {
      return {
        correcto: false,
        motivo: 'Eso es el desplazamiento (dónde acaba), no la distancia recorrida: el móvil se para, da la vuelta y ese camino de vuelta también cuenta.',
        diferencia,
        tolerancia,
      };
    }
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, datos.decimales ?? 2, numero)} de la respuesta.`,
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
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
  /** La respuesta exacta tiene más decimales de los que se piden. Se CALCULA, no se declara. */
  requiereRedondeo: boolean;
  /** Qué poner en la calculadora para ver la cifra o confirmarla. Solo donde es verdad. */
  comoComprobar?: string;
}

const G_DECLARADA = 'Toma g = 9,81 m/s².';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`.
 *
 * ⚠️ Los TÍTULOS no pueden contener «MRUA», «Caída», «Parabólico», «Pausa», «Al inicio» ni
 * «Reproducir»: el acta del Inspector (tests/apps/calculadora-movimiento.spec.ts) busca los
 * botones del selector y del simulador por esas palabras sin `exact`, y el nombre accesible de
 * cada botón de caso es «Caso N: título». Un título con «Caída» dejaría su localizador ambiguo.
 *
 * Sin ciudades, países ni monedas: más del 90 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'A velocidad constante',
    enunciado: 'Un móvil avanza en línea recta a 12 m/s constantes. ¿Qué distancia recorre en 25 s? Da el resultado en metros.',
    categoria: 'abstracto',
    // x = 12·25 = 300 m.
    datos: { pregunta: 'distanciaMru', v0: 12, t: 25, decimales: 0 },
    etiquetaRespuesta: 'Distancia en m',
    pista: 'En el MRU la velocidad no cambia: distancia = velocidad · tiempo.',
    comoComprobar: 'Elige MRU y pon v₀ = 12 m/s y t = 25 s: la tarjeta «Desplazamiento (x)» marca 300,00 m.',
  },
  {
    id: 2,
    titulo: 'El tren de 90 km/h',
    enunciado:
      'Un tren circula a 90 km/h constantes por una vía recta. ¿Cuántos segundos tarda en recorrer 3 km? Da el resultado en segundos.',
    categoria: 'aplicado',
    // 90 km/h = 25 m/s · t = 3000/25 = 120 s. Sin convertir: 3000/90 = 33,33 (o 3/90 h).
    datos: { pregunta: 'tiempoMru', v0: 90, x: 3000, xEnKm: true, enKmh: true, decimales: 0 },
    etiquetaRespuesta: 'Tiempo en s',
    pista: 'Pasa todo al SI antes de operar: los km/h a m/s (÷ 3,6) y los km a m. Después, t = x/v.',
    comoComprobar: 'Elige MRU y pon v₀ = 25 m/s (90 km/h ÷ 3,6) y en t tu resultado: el «Desplazamiento (x)» debe marcar 3000,00 m.',
  },
  {
    id: 3,
    titulo: 'Arrancar desde el reposo',
    enunciado:
      'Un coche parte del reposo y acelera de forma constante a 2,5 m/s² durante 8 s. ¿Qué velocidad alcanza, en m/s?',
    categoria: 'aplicado',
    // v = 0 + 2,5·8 = 20 m/s. El error de usar ½·a·t² da 80.
    datos: { pregunta: 'velocidadFinal', v0: 0, a: 2.5, t: 8, decimales: 0 },
    etiquetaRespuesta: 'Velocidad en m/s',
    pista: 'v = v₀ + a·t, y «parte del reposo» quiere decir v₀ = 0.',
    comoComprobar: 'Elige MRUA y pon v₀ = 0, a = 2,5 m/s² y t = 8 s: la tarjeta «Velocidad final» marca 20,00 m/s.',
  },
  {
    id: 4,
    titulo: 'Acelerar con velocidad inicial',
    enunciado:
      'Un móvil que va a 4 m/s empieza a acelerar a 3 m/s² en el mismo sentido en que se mueve. ¿Qué distancia recorre en los 6 s siguientes? Da el resultado en metros.',
    categoria: 'abstracto',
    // x = 4·6 + ½·3·36 = 24 + 54 = 78 m. Sin el ½: 132 · sin la v₀: 54.
    datos: { pregunta: 'distanciaMrua', v0: 4, a: 3, t: 6, decimales: 0 },
    etiquetaRespuesta: 'Distancia en m',
    pista: 'x = v₀·t + ½·a·t². No olvides el término de la velocidad inicial.',
    comoComprobar: 'Elige MRUA y pon v₀ = 4 m/s, a = 3 m/s² y t = 6 s: la tarjeta «Distancia recorrida» marca 78,00 m.',
  },
  {
    id: 5,
    titulo: 'La moto que adelanta',
    enunciado:
      'Para adelantar, una moto pasa de 36 km/h a 72 km/h en 5 s con aceleración constante. ¿Cuál es su aceleración, en m/s²?',
    categoria: 'aplicado',
    // 10 → 20 m/s · a = 10/5 = 2 m/s². Sin convertir: 36/5 = 7,2.
    datos: { pregunta: 'aceleracion', v0: 36, v: 72, t: 5, enKmh: true, decimales: 0 },
    etiquetaRespuesta: 'Aceleración en m/s²',
    pista: 'Pasa las dos velocidades a m/s (÷ 3,6) y despeja a de v = v₀ + a·t.',
    comoComprobar:
      'Elige MRUA y pon v₀ = 10 m/s (36 km/h), t = 5 s y en a tu resultado: la «Velocidad final» debe marcar 20,00 m/s, que son 72 km/h.',
  },
  {
    id: 6,
    titulo: 'Cuánto tarda en pararse',
    enunciado:
      'Un coche circula a 108 km/h y frena con una deceleración constante de 6 m/s² hasta detenerse. ¿Cuántos segundos tarda en pararse?',
    categoria: 'aplicado',
    // 108 km/h = 30 m/s · t = 30/6 = 5 s. Sin convertir: 108/6 = 18.
    datos: { pregunta: 'tiempoFrenado', v0: 108, a: 6, enKmh: true, decimales: 0 },
    etiquetaRespuesta: 'Tiempo en s',
    pista: 'Se para cuando su velocidad llega a cero: 0 = v₀ − a·t. Antes, pasa los km/h a m/s.',
    comoComprobar:
      'Elige MRUA y pon v₀ = 30 m/s, a = −6 m/s² (negativa, porque frena) y t = 8 s: el aviso de debajo de las tarjetas dice en qué instante se detiene.',
  },
  {
    id: 7,
    titulo: 'La frenada del ciclista',
    enunciado:
      'Un ciclista va a 10 m/s y frena con una deceleración constante de 2 m/s² hasta pararse. ¿Qué distancia recorre mientras frena? Da el resultado en metros.',
    categoria: 'aplicado',
    // t = 5 s · d = 10·5 − ½·2·25 = 25 m = v₀²/(2a) = 100/4. Sin el 2: 50.
    datos: { pregunta: 'distanciaFrenado', v0: 10, a: 2, decimales: 0 },
    etiquetaRespuesta: 'Distancia en m',
    pista: 'Calcula cuánto tarda en pararse y usa x = v₀·t − ½·a·t². O, sin tiempo, d = v₀²/(2·a).',
    comoComprobar:
      'Elige MRUA y pon v₀ = 10 m/s, a = −2 m/s² y t = 5 s (justo cuando se para): la tarjeta «Distancia recorrida» marca 25,00 m.',
  },
  {
    id: 8,
    titulo: 'Ir y volver: distancia frente a desplazamiento',
    enunciado:
      'Un móvil sale a 12 m/s y, desde ese instante, tiene una aceleración constante de 4 m/s² en sentido contrario a su velocidad inicial. ¿Qué distancia total recorre en los primeros 5 s? Da el resultado en metros.',
    categoria: 'abstracto',
    // Se para en t = 3 s, a 12·3 − 2·9 = 18 m. En t = 5: 60 − 50 = 10 m (desplazamiento).
    // Distancia = 18 + (18 − 10) = 26 m. El desplazamiento, 10, es el error que se busca.
    datos: { pregunta: 'distanciaConVuelta', v0: 12, a: -4, t: 5, decimales: 0 },
    etiquetaRespuesta: 'Distancia recorrida en m',
    pista: '¿Se para antes de los 5 s? Si se para, a partir de ahí vuelve, y el camino de vuelta también se recorre.',
    comoComprobar:
      'Elige MRUA y pon v₀ = 12 m/s, a = −4 m/s² y t = 5 s: «Distancia recorrida» marca 26,00 m y «Desplazamiento (x)», 10,00 m.',
  },
  {
    id: 9,
    titulo: 'La maceta del balcón',
    enunciado: `Una maceta se suelta desde un balcón a 20 m del suelo. Sin contar el rozamiento con el aire, ¿cuánto tarda en llegar al suelo? ${G_DECLARADA} Da el resultado en segundos, redondeado a dos decimales.`,
    categoria: 'aplicado',
    // t = √(40/9,81) = 2,0193 → 2,02 s. Con g = 10: 2,00.
    datos: { pregunta: 'tiempoCaida', h: 20 },
    etiquetaRespuesta: 'Tiempo en s',
    pista: 'Parte del reposo: h = ½·g·t². Despeja t.',
    comoComprobar:
      'Elige la caída libre, pon v₀ = 0 y en t tu resultado: el «Desplazamiento vertical (y)» debe marcar casi 20 m (con 2,02 s, 20,01 m).',
  },
  {
    id: 10,
    titulo: 'Un objeto soltado durante 3 s',
    enunciado: `Se suelta un objeto desde el reposo y cae libremente. ¿Qué rapidez lleva al cabo de 3 s? ${G_DECLARADA} Da el resultado en m/s.`,
    categoria: 'abstracto',
    // v = 9,81·3 = 29,43 m/s exactos. Con g = 10: 30.
    datos: { pregunta: 'velocidadCaida', t: 3 },
    etiquetaRespuesta: 'Rapidez en m/s',
    pista: 'Es un MRUA con a = g y v₀ = 0: v = g·t.',
    comoComprobar: 'Elige la caída libre y pon v₀ = 0 y t = 3 s: la tarjeta «Velocidad final» marca 29,43 m/s.',
  },
  {
    id: 11,
    titulo: 'La pelota lanzada hacia arriba',
    enunciado: `Se lanza una pelota verticalmente hacia arriba a 14 m/s. Sin rozamiento con el aire, ¿qué altura máxima alcanza sobre el punto de lanzamiento? ${G_DECLARADA} Da el resultado en metros, redondeado a dos decimales.`,
    categoria: 'aplicado',
    // h = 196/19,62 = 9,9898 → 9,99 m. Con g = 10: 9,80 · con g = 9,8: 10,00.
    datos: { pregunta: 'alturaMaxima', v0: 14 },
    etiquetaRespuesta: 'Altura en m',
    pista: 'En el punto más alto la velocidad es cero. Usa v² = v₀² − 2·g·h con v = 0.',
    comoComprobar:
      'Elige la caída libre y pon v₀ = −14 m/s (negativa: la calculadora mide hacia abajo) y t = 3 s: el aviso dice que se detiene a −9,99 m del origen, y el signo menos es «por encima».',
  },
  {
    id: 12,
    titulo: 'El balón a 30°',
    enunciado: `Un balón se patea desde el suelo a 20 m/s con un ángulo de 30° sobre la horizontal y vuelve a caer al suelo. Sin rozamiento con el aire, ¿a qué distancia horizontal cae? ${G_DECLARADA} Da el resultado en metros, redondeado a dos decimales.`,
    categoria: 'aplicado',
    // R = 400·sen 60°/9,81 = 346,41/9,81 = 35,3119 → 35,31 m. Con g = 10: 34,64.
    datos: { pregunta: 'alcance', v0: 20, angulo: 30 },
    etiquetaRespuesta: 'Alcance en m',
    pista: 'Descompón la velocidad: vₓ = v₀·cos θ y vᵧ = v₀·sen θ. El tiempo de vuelo es 2·vᵧ/g y el alcance, vₓ por ese tiempo.',
    comoComprobar: 'Elige el tiro parabólico y pon v₀ = 20 m/s y ángulo 30°: la tarjeta «Alcance» marca 35,31 m.',
  },
];

/** Formatea el resultado con su unidad, sacada de la etiqueta («Altura en m» → «m»). */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  const cifra = formatNumber(valor, decimales);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondearA(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
    pasos: r.pasos,
    requiereRedondeo: r.ok && exigeRedondeo(r.valor, decimales),
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio. La semilla se MEZCLA
 * antes de usarse (splitmix32): sembrar xorshift con enteros pequeños devolvía siempre el mismo
 * índice, y un generador así es reproducible pero no variado (simulador-genetica, 14/09/2026).
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
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

const PREGUNTAS_PRACTICA = [
  'distanciaMru',
  'velocidadFinal',
  'distanciaMrua',
  'tiempoFrenado',
  'distanciaFrenado',
  'velocidadCaida',
  'tiempoCaida',
] as const;
type PreguntaPractica = (typeof PREGUNTAS_PRACTICA)[number];

/** Listas «amables»: enteros pequeños, y las velocidades de frenado son múltiplos de su deceleración. */
const VELOCIDADES = [4, 5, 6, 8, 10, 12, 15, 20] as const;
const ACELERACIONES = [1, 2, 3, 4, 5] as const;
const TIEMPOS = [2, 3, 4, 5, 6, 8, 10] as const;
const ALTURAS = [5, 10, 15, 20, 30, 45, 80] as const;

const ETIQUETAS: Record<PreguntaPractica, string> = {
  distanciaMru: 'Distancia en m',
  velocidadFinal: 'Velocidad en m/s',
  distanciaMrua: 'Distancia en m',
  tiempoFrenado: 'Tiempo en s',
  distanciaFrenado: 'Distancia en m',
  velocidadCaida: 'Rapidez en m/s',
  tiempoCaida: 'Tiempo en s',
};

function enunciadoPractica(pregunta: PreguntaPractica, d: DatosCaso): string {
  const redondeo = 'Redondea a dos decimales.';
  switch (pregunta) {
    case 'distanciaMru':
      return `Un móvil avanza en línea recta a ${numero(d.v0 ?? NaN)} m/s constantes. ¿Qué distancia recorre en ${numero(d.t ?? NaN)} s, en metros? ${redondeo}`;
    case 'velocidadFinal':
      return `Un móvil que va a ${numero(d.v0 ?? NaN)} m/s acelera a ${numero(d.a ?? NaN)} m/s² en el sentido de su movimiento. ¿Qué velocidad lleva al cabo de ${numero(d.t ?? NaN)} s, en m/s? ${redondeo}`;
    case 'distanciaMrua':
      return `Un móvil que va a ${numero(d.v0 ?? NaN)} m/s acelera a ${numero(d.a ?? NaN)} m/s² en el sentido de su movimiento. ¿Qué distancia recorre en ${numero(d.t ?? NaN)} s, en metros? ${redondeo}`;
    case 'tiempoFrenado':
      return `Un móvil va a ${numero(d.v0 ?? NaN)} m/s y frena con una deceleración constante de ${numero(d.a ?? NaN)} m/s² hasta pararse. ¿Cuánto tarda en detenerse, en segundos? ${redondeo}`;
    case 'distanciaFrenado':
      return `Un móvil va a ${numero(d.v0 ?? NaN)} m/s y frena con una deceleración constante de ${numero(d.a ?? NaN)} m/s² hasta pararse. ¿Qué distancia recorre mientras frena, en metros? ${redondeo}`;
    case 'velocidadCaida':
      return `Se suelta un objeto desde el reposo y cae libremente. ¿Qué rapidez lleva al cabo de ${numero(d.t ?? NaN)} s, en m/s? ${G_DECLARADA} ${redondeo}`;
    case 'tiempoCaida':
    default:
      return `Se suelta un objeto desde ${numero(d.h ?? NaN)} m de altura. Sin rozamiento con el aire, ¿cuánto tarda en llegar al suelo, en segundos? ${G_DECLARADA} ${redondeo}`;
  }
}

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos, y por tanto el mismo motor
 * que las tarjetas: si divergieran, el alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS_PRACTICA, rnd);
  const datos: DatosCaso = {
    pregunta,
    v0: elegir(VELOCIDADES, rnd),
    a: elegir(ACELERACIONES, rnd),
    t: elegir(TIEMPOS, rnd),
    h: elegir(ALTURAS, rnd),
    decimales: 2,
  };
  if (pregunta === 'velocidadCaida' || pregunta === 'tiempoCaida') datos.v0 = undefined;
  if (pregunta === 'distanciaMru') datos.a = undefined;

  const r = resolverCaso(datos);
  return {
    enunciado: enunciadoPractica(pregunta, datos),
    datos,
    respuesta: r.ok ? redondearA(r.valor, 2) : NaN,
    etiquetaRespuesta: ETIQUETAS[pregunta],
    pasos: r.pasos,
  };
}

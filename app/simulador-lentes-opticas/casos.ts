/**
 * Casos para clase — la tarea asignable de `simulador-lentes-opticas`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la óptica está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Toda respuesta sale de `./motor.ts`: `calcularImagen` (el cuerpo del `useMemo` `calculoOptico`
 * de la página, trasladado tal cual) y `potenciaDioptrias` (la expresión de la tarjeta de
 * potencia). Si la corrección y el panel de resultados calcularan distinto, la app suspendería
 * una respuesta que ella misma imprime.
 *
 * Tres preguntas piden algo que el panel no publica, y ninguna inventa óptica nueva:
 *   · la FOCAL a partir de dónde están objeto e imagen: se despeja de la misma ecuación
 *     1/s + 1/s' = 1/f y, antes de darla por buena, se EJECUTA el motor con esa focal y se
 *     exige que devuelva la s' del enunciado. Si no, `resolverCaso` responde `ok: false`;
 *   · la DISTANCIA DEL OBJETO para un aumento dado: igual, despejada de M = −s'/s y de la
 *     ecuación de las lentes, y verificada ejecutando el motor (debe devolver ese M);
 *   · la POTENCIA DE DOS LENTES en contacto: `potenciaDioptrias` de cada una, sumadas. La suma
 *     de potencias de lentes delgadas en contacto es la que ya enseña la sección educativa.
 *
 * ── EL CONVENIO, Y POR QUÉ LAS PREGUNTAS ESTÁN ELEGIDAS ASÍ ───────────────────
 *
 * La app usa el convenio «real es positivo»:
 *     1/s + 1/s' = 1/f     s > 0 objeto delante (a la izquierda)     M = −s'/s
 *     s' > 0 imagen real (al otro lado)  ·  s' < 0 virtual  ·  f < 0 lente divergente
 *
 * ⚠️ En España (y en parte de Latinoamérica) se enseña además el convenio DIN/normalizado:
 *     1/s' − 1/s = 1/f'    con la s del objeto NEGATIVA     M = s'/s
 * Los dos convenios dan resultados IGUALES en todo menos en el signo de s. Por eso los doce
 * casos preguntan SOLO magnitudes que coinciden en ambos:
 *   · s' (posición de la imagen): positiva si es real, negativa si es virtual, en los dos;
 *   · M: con s negativa, s'/s vale lo mismo que −s'/|s|; negativo si la imagen se invierte;
 *   · h' = M·h, la potencia en dioptrías y la focal (f' del DIN = f de aquí, con su signo);
 *   · la distancia del objeto se da y se pide SIEMPRE como distancia («a 15 cm delante de la
 *     lente»), nunca como una s con signo.
 * ⚠️ **Nunca se pide «s» con signo**: sería la única respuesta que cambia de convenio a
 *    convenio, y un alumno que acierta suspendería por el libro que usa su clase.
 * ⚠️ **Ningún caso pone el objeto en el foco de una convergente**: no hay imagen, y la
 *    respuesta no sería un número (el motor devuelve `valido: false`).
 * ⚠️ Las lentes se describen como «convergente de 10 cm de focal» o «divergente de focal
 *    10 cm»: el signo de f lo pone el alumno, que es justo lo que se aprende.
 */

import { formatNumber } from '@/lib';
import { calcularImagen, potenciaDioptrias, type ImagenLente } from './motor';

/**
 * Altura de referencia para las preguntas en las que NO influye (s', M): el motor necesita
 * un número y cualquiera da la misma respuesta.
 */
const ALTURA_REFERENCIA = 1;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  /** Posición de la imagen s' (cm), con signo: + real, − virtual. */
  | 'posicionImagen'
  /** Aumento lateral M = −s'/s, sin unidad, con signo: − invertida. */
  | 'aumento'
  /** Altura de la imagen h' = M·h (cm), con signo: − invertida. */
  | 'alturaImagen'
  /** Potencia P = 1/f (dioptrías, f en metros), con signo: − divergente. */
  | 'potencia'
  /** Focal (cm) de la lente que forma una imagen REAL a `distanciaImagen` de un objeto. */
  | 'focalDesdeDistancias'
  /** Distancia (cm, sin signo) a la que poner el objeto para conseguir el aumento `aumento`. */
  | 'distanciaObjetoParaAumento'
  /** Potencia (D) de dos lentes delgadas en contacto: P₁ + P₂. */
  | 'potenciaConjunto';

export interface DatosCaso {
  pregunta: Pregunta;
  /** Focal con signo, cm: + convergente, − divergente (convenio de la app). */
  focal?: number;
  /** Focal de la segunda lente, cm, con signo (solo `potenciaConjunto`). */
  focal2?: number;
  /** Distancia del objeto a la lente, cm: una DISTANCIA, siempre positiva. */
  distanciaObjeto?: number;
  /** Distancia de la lente a la imagen real, cm (solo `focalDesdeDistancias`). */
  distanciaImagen?: number;
  /** Altura del objeto, cm (solo `alturaImagen`). */
  altura?: number;
  /** Aumento lateral buscado, con signo (solo `distanciaObjetoParaAumento`). */
  aumento?: number;
  /** Decimales a los que se pide la respuesta. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno y con el signo «−» del panel. */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  const texto = (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
  return texto.replace(/^-/, '−');
}

/** «1/10» o «1/(−10)»: el paréntesis solo cuando hay signo menos. */
function inversaDe(n: number): string {
  return n < 0 ? `1/(${numero(n)})` : `1/${numero(n)}`;
}

/** Focal con su signo explícito: «+10», «−20». */
function conSigno(n: number): string {
  return n > 0 ? `+${numero(n)}` : numero(n);
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** «a unidades», «a una décima», «a dos decimales»: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  if (decimales === 3) return 'a tres decimales';
  return `a ${decimales} decimales`;
}

/** Unidad en la que sale cada pregunta ('' para el aumento, que no tiene). */
export function unidadDePregunta(pregunta: Pregunta): string {
  switch (pregunta) {
    case 'posicionImagen':
    case 'alturaImagen':
    case 'focalDesdeDistancias':
    case 'distanciaObjetoParaAumento':
      return 'cm';
    case 'potencia':
    case 'potenciaConjunto':
      return 'D';
    default:
      return '';
  }
}

/** Cifra final con formatNumber de @/lib y el signo «−» que imprime el panel. */
function cifra(valor: number, decimales: number): string {
  return formatNumber(valor, decimales).replace(/^-/, '−');
}

function conUnidad(valor: number, datos: DatosCaso): string {
  const unidad = unidadDePregunta(datos.pregunta);
  const texto = cifra(valor, datos.decimales ?? 2);
  return unidad ? `${texto} ${unidad}` : texto;
}

function error(texto: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: texto };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function focalValida(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n !== 0;
}

/** «convergente» o «divergente» según el signo de la focal. */
function tipoDe(f: number): string {
  return f > 0 ? 'convergente' : 'divergente';
}

/** Pasos que sitúan la imagen: la ecuación de las lentes con los datos del caso. */
function pasosPosicion(f: number, s: number, r: ImagenLente, pasos: string[]): void {
  pasos.push(
    `Con el convenio del simulador: f = ${conSigno(f)} cm (lente ${tipoDe(f)}${f < 0 ? ', por eso lleva signo menos' : ''}) y s = ${numero(s)} cm (el objeto está delante de la lente).`,
  );
  const inversa = 1 / f - 1 / s;
  pasos.push(
    `Ecuación de las lentes delgadas: 1/s + 1/s' = 1/f, así que 1/s' = 1/f − 1/s = ${inversaDe(f)} − 1/${numero(s)} = ${numero(inversa, 5)} cm⁻¹.`,
  );
  pasos.push(`s' = 1/(${numero(inversa, 5)}) = ${numero(r.sImg)} cm.`);
  pasos.push(
    r.sImg > 0
      ? 'Sale POSITIVA: la imagen se forma al otro lado de la lente, donde los rayos se cortan de verdad. Es real y se puede recoger en una pantalla.'
      : 'Sale NEGATIVA: la imagen queda del mismo lado que el objeto, donde solo se cortan las prolongaciones de los rayos. Es virtual: se ve mirando a través de la lente, pero no se puede proyectar.',
  );
}

/** Pasos del aumento, a partir de una imagen ya situada. */
function pasosAumento(s: number, r: ImagenLente, pasos: string[]): void {
  pasos.push(`Aumento lateral: M = −s'/s = −(${numero(r.sImg)})/${numero(s)} = ${numero(r.M)}.`);
  const sentido = r.M < 0 ? 'NEGATIVO: la imagen sale invertida' : 'POSITIVO: la imagen sale derecha';
  const tam = Math.abs(r.M);
  const tamano =
    Math.abs(tam - 1) < 1e-9
      ? 'del mismo tamaño que el objeto'
      : tam > 1
        ? `${numero(tam)} veces MAYOR que el objeto`
        : `más pequeña que el objeto (${numero(tam)} veces su tamaño)`;
  pasos.push(`M es ${sentido}, y como |M| = ${numero(tam)}, es ${tamano}.`);
}

/** Nota del otro convenio: se enseña que la respuesta no cambia. */
function pasoOtroConvenio(f: number, s: number, r: ImagenLente, pasos: string[], conAumento: boolean): void {
  const base = `Con el convenio que toma la distancia del objeto negativa (1/s' − 1/s = 1/f, s = −${numero(s)} cm) sale lo mismo: 1/s' = 1/f + 1/s = ${inversaDe(f)} + 1/(−${numero(s)}), y s' = ${numero(r.sImg)} cm`;
  pasos.push(
    conAumento
      ? `${base}; allí el aumento se escribe M = s'/s = ${numero(r.sImg)}/(−${numero(s)}) = ${numero(r.M)}, el mismo número.`
      : `${base}.`,
  );
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  let valor: number;

  switch (datos.pregunta) {
    case 'posicionImagen':
    case 'aumento':
    case 'alturaImagen': {
      const f = datos.focal;
      const s = datos.distanciaObjeto;
      const h = datos.pregunta === 'alturaImagen' ? datos.altura : ALTURA_REFERENCIA;
      if (!focalValida(f)) return error('Falta un dato: la distancia focal de la lente.', pasos);
      if (!positivo(s)) return error('Falta un dato: la distancia del objeto, positiva.', pasos);
      if (!positivo(h)) return error('Falta un dato: la altura del objeto, positiva.', pasos);

      const r = calcularImagen(f, s, h);
      if (!r.valido) {
        return error(
          'El objeto está en el foco: los rayos salen paralelos y no se forma imagen, así que no hay número que dar.',
          pasos,
        );
      }
      pasosPosicion(f, s, r, pasos);
      if (datos.pregunta === 'posicionImagen') {
        pasoOtroConvenio(f, s, r, pasos, false);
        valor = r.sImg;
        break;
      }
      pasosAumento(s, r, pasos);
      if (datos.pregunta === 'aumento') {
        pasoOtroConvenio(f, s, r, pasos, true);
        valor = r.M;
        break;
      }
      pasos.push(
        `Altura de la imagen: h' = M·h = ${numero(r.M)}·${numero(h)} = ${numero(r.hImg)} cm. ${r.hImg < 0 ? 'El signo menos dice que está cabeza abajo.' : 'Positiva: apunta hacia arriba, como el objeto.'}`,
      );
      valor = r.hImg;
      break;
    }

    case 'potencia': {
      const f = datos.focal;
      if (!focalValida(f)) return error('Falta un dato: la distancia focal de la lente.', pasos);
      valor = potenciaDioptrias(f);
      pasos.push(
        `La lente es ${tipoDe(f)}, así que su focal lleva signo ${f > 0 ? 'más' : 'menos'}: f = ${conSigno(f)} cm = ${numero(f / 100)} m.`,
      );
      pasos.push(
        `La potencia se mide en dioptrías con la focal en METROS: P = 1/f = 1/(${numero(f / 100)} m) = ${numero(valor)} D. Con la focal en cm, P = 100/f.`,
      );
      pasos.push(
        f > 0
          ? 'Positiva: lente convergente, la que corrige la hipermetropía y la vista cansada.'
          : 'Negativa: lente divergente, la que corrige la miopía.',
      );
      break;
    }

    case 'focalDesdeDistancias': {
      const s = datos.distanciaObjeto;
      const sImg = datos.distanciaImagen;
      if (!positivo(s)) return error('Falta un dato: la distancia del objeto, positiva.', pasos);
      if (!positivo(sImg)) return error('Falta un dato: la distancia de la imagen real, positiva.', pasos);
      pasos.push(
        `La imagen se recoge sobre una pantalla o un sensor: es REAL, así que s' = +${numero(sImg)} cm (positiva en los dos convenios). El objeto está a s = ${numero(s)} cm.`,
      );
      const inversa = 1 / s + 1 / sImg;
      valor = 1 / inversa;
      pasos.push(
        `De 1/s + 1/s' = 1/f: 1/f = 1/${numero(s)} + 1/${numero(sImg)} = ${numero(inversa, 5)} cm⁻¹, así que f = 1/${numero(inversa, 5)} = ${numero(valor)} cm.`,
      );
      // Antes de darla por buena, el motor de la app tiene que devolver la imagen del enunciado.
      const r = calcularImagen(valor, s, ALTURA_REFERENCIA);
      if (!r.valido || Math.abs(r.sImg - sImg) > 1e-6 * Math.max(1, sImg)) {
        return error('La focal despejada no reproduce la imagen del enunciado.', pasos);
      }
      pasos.push(
        `Comprobación: con f = ${numero(valor)} cm y el objeto a ${numero(s)} cm, la ecuación devuelve s' = ${numero(r.sImg)} cm. Sale positiva, así que la lente es convergente: solo una convergente da imagen real de un objeto real.`,
      );
      break;
    }

    case 'distanciaObjetoParaAumento': {
      const f = datos.focal;
      const m = datos.aumento;
      if (!focalValida(f)) return error('Falta un dato: la distancia focal de la lente.', pasos);
      if (!(typeof m === 'number' && Number.isFinite(m) && m !== 0 && m !== 1)) {
        return error('El aumento pedido debe ser un número distinto de 0 y de 1.', pasos);
      }
      valor = f * (1 - 1 / m);
      if (!(Number.isFinite(valor) && valor > 0)) {
        return error('Con esta lente no hay ninguna posición del objeto que dé ese aumento.', pasos);
      }
      pasos.push(
        `${m > 0 ? 'Derecha' : 'Invertida'} y ${numero(Math.abs(m))} veces ${Math.abs(m) > 1 ? 'mayor' : 'menor'} significa M = ${conSigno(m)}. De M = −s'/s sale s' = −M·s = ${numero(-m)}·s.`,
      );
      pasos.push(
        `Sustituyendo en 1/s + 1/s' = 1/f: 1/s + 1/(${numero(-m)}·s) = 1/f, es decir (1 − 1/M)/s = 1/f, y s = f·(1 − 1/M) = ${numero(f)}·(1 − 1/${numero(m)}) = ${numero(valor)} cm.`,
      );
      // Antes de darla por buena, el motor de la app tiene que devolver el aumento pedido.
      const r = calcularImagen(f, valor, ALTURA_REFERENCIA);
      if (!r.valido || Math.abs(r.M - m) > 1e-6 * Math.max(1, Math.abs(m))) {
        return error('La distancia despejada no reproduce el aumento del enunciado.', pasos);
      }
      pasos.push(
        `Comprobación: con el objeto a ${numero(valor)} cm, 1/s' = ${inversaDe(f)} − 1/${numero(valor)}, s' = ${numero(r.sImg)} cm y M = −s'/s = ${numero(r.M)}. ${r.sImg < 0 ? 'La imagen es virtual: el objeto está dentro de la distancia focal, como con cualquier lupa.' : 'La imagen es real.'}`,
      );
      break;
    }

    case 'potenciaConjunto': {
      const f1 = datos.focal;
      const f2 = datos.focal2;
      if (!focalValida(f1) || !focalValida(f2)) {
        return error('Faltan datos: las distancias focales de las dos lentes.', pasos);
      }
      const p1 = potenciaDioptrias(f1);
      const p2 = potenciaDioptrias(f2);
      valor = p1 + p2;
      pasos.push(
        `Primera lente, ${tipoDe(f1)}: f₁ = ${conSigno(f1)} cm = ${numero(f1 / 100)} m, P₁ = 1/f₁ = ${numero(p1)} D.`,
      );
      pasos.push(
        `Segunda lente, ${tipoDe(f2)}: f₂ = ${conSigno(f2)} cm = ${numero(f2 / 100)} m, P₂ = 1/f₂ = ${numero(p2)} D.`,
      );
      pasos.push(
        `En lentes delgadas en contacto las potencias se SUMAN (las focales no): P = P₁ + P₂ = ${numero(p1)} + (${numero(p2)}) = ${numero(valor)} D.`,
      );
      pasos.push(
        valor > 0
          ? `Positiva: el conjunto se comporta como una sola lente convergente de focal 100/P = ${numero(100 / valor)} cm.`
          : `Negativa: el conjunto se comporta como una sola lente divergente de focal 100/P = ${numero(100 / valor)} cm.`,
      );
      break;
    }

    default:
      return error('Pregunta desconocida.', pasos);
  }

  if (!Number.isFinite(valor)) {
    return error('El resultado no es un número finito.', pasos);
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondear(valor, decimales);
  const exacto = Math.abs(valor - redondeado) < 1e-9;
  pasos.push(
    exacto
      ? `Resultado: ${conUnidad(redondeado, datos)}.`
      : `Redondeando ${textoRedondeo(decimales)}: ${conUnidad(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal y el signo menos).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde
   * EXACTO de la tolerancia la resta en coma flotante decide por ±1 ulp. 1e-9 absorbe ese ruido
   * y queda siete órdenes de magnitud por debajo de la tolerancia más pequeña (0,01).
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  // El fallo más típico de este tema es acertar el número y equivocar el signo: se dice.
  const signoCambiado =
    esperado !== 0 && Math.abs(usuario + esperado) <= tolerancia + RUIDO_BINARIO;
  if (signoCambiado) {
    return {
      correcto: false,
      motivo:
        'No es correcto: el valor es ese, pero el signo no. Repasa qué significa el signo en esta pregunta (real o virtual, derecha o invertida, convergente o divergente).',
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia, 2)} de la respuesta.`,
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
  /** El enunciado pide redondear: la respuesta exacta tiene más decimales de los que se piden. */
  requiereRedondeo: boolean;
  /**
   * Cómo ver la cifra en el simulador, con los decimales que imprime el panel. Solo donde es
   * VERDAD con los deslizadores actuales (|f| 2–20 cm, s 2–40 cm, h 0,5–5 cm).
   */
  comoComprobar?: string;
}

/** Cómo se escribe el signo de s' en los enunciados: igual en los dos convenios. */
const SIGNO_POSICION =
  'Escríbela con signo: positiva si se forma al otro lado de la lente (imagen real) y negativa si queda del mismo lado que el objeto (imagen virtual).';

/** Recordatorio común a las pistas de posición. */
const PISTA_ECUACION = "1/s + 1/s' = 1/f, con la distancia del objeto positiva y f positiva en una convergente.";

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Dónde se forma la imagen de una lente convergente',
    enunciado: `Una lente convergente tiene una distancia focal de 10 cm. Se coloca un objeto a 15 cm delante de ella. ¿A qué distancia de la lente se forma la imagen? ${SIGNO_POSICION}`,
    categoria: 'abstracto',
    datos: { pregunta: 'posicionImagen', focal: 10, distanciaObjeto: 15 },
    etiquetaRespuesta: "s' en cm",
    requiereRedondeo: false,
    pista: `Usa ${PISTA_ECUACION} El objeto está entre F y 2F: espera una imagen real, más lejos que 2F.`,
    comoComprobar:
      'Con la lente convergente elegida, pon la distancia focal en 10 cm y la del objeto en 15 cm: la tarjeta de la distancia de la imagen da 30,00 cm.',
  },
  {
    id: 2,
    titulo: 'El aumento con el objeto lejos de la lente',
    enunciado:
      'Un objeto está a 30 cm delante de una lente convergente de 10 cm de focal. ¿Cuánto vale el aumento lateral de su imagen? Escríbelo con su signo: negativo si la imagen sale invertida.',
    categoria: 'abstracto',
    datos: { pregunta: 'aumento', focal: 10, distanciaObjeto: 30 },
    etiquetaRespuesta: 'M (sin unidad)',
    requiereRedondeo: false,
    pista: "Primero la posición de la imagen con 1/s + 1/s' = 1/f; después M = −s'/s. El objeto está más allá de 2F: la imagen será más pequeña.",
    comoComprobar:
      'Pon la distancia focal en 10 cm y la del objeto en 30 cm (lente convergente): la tarjeta del aumento da −0,500 (el panel lo escribe con tres decimales).',
  },
  {
    id: 3,
    titulo: 'Un objeto en el doble de la focal',
    enunciado:
      'Un objeto de 3 cm de altura está a 20 cm delante de una lente convergente de 10 cm de focal. ¿Qué altura tiene su imagen? Escríbela con signo: negativa si la imagen sale invertida.',
    categoria: 'abstracto',
    datos: { pregunta: 'alturaImagen', focal: 10, distanciaObjeto: 20, altura: 3 },
    etiquetaRespuesta: "h' en cm",
    requiereRedondeo: false,
    pista: "h' = M·h, con M = −s'/s. Cuando el objeto está justo en 2F, la imagen también se forma en 2F', al otro lado.",
    comoComprobar:
      'Pon la distancia focal en 10 cm, la del objeto en 20 cm y la altura del objeto en 3 cm (lente convergente): la tarjeta de la altura de la imagen da −3,00 cm.',
  },
  {
    id: 4,
    titulo: 'Cuánto aumenta una lupa',
    enunciado:
      'Para leer la letra diminuta de un sello, alguien sostiene una lupa, que es una lente convergente de 12 cm de focal, a 8 cm del sello. ¿Cuánto vale el aumento lateral? Escríbelo con su signo: positivo si la imagen se ve derecha.',
    categoria: 'aplicado',
    datos: { pregunta: 'aumento', focal: 12, distanciaObjeto: 8 },
    etiquetaRespuesta: 'M (sin unidad)',
    requiereRedondeo: false,
    pista: "El sello está más cerca que el foco (8 cm < 12 cm): la imagen será virtual, así que s' saldrá negativa. Después, M = −s'/s.",
    comoComprobar:
      'Pon la distancia focal en 12 cm y la del objeto en 8 cm (lente convergente): la tarjeta del aumento da 3,000.',
  },
  {
    id: 5,
    titulo: 'Un objeto dentro de la distancia focal',
    enunciado: `Una lente convergente de 6 cm de focal tiene un objeto a 4 cm delante. ¿A qué distancia de la lente se forma la imagen? ${SIGNO_POSICION}`,
    categoria: 'abstracto',
    datos: { pregunta: 'posicionImagen', focal: 6, distanciaObjeto: 4 },
    etiquetaRespuesta: "s' en cm",
    requiereRedondeo: false,
    pista: `Usa ${PISTA_ECUACION} Con el objeto entre la lente y el foco, 1/f − 1/s sale negativo: fíjate en qué significa ese signo.`,
    comoComprobar:
      'Pon la distancia focal en 6 cm y la del objeto en 4 cm (lente convergente): la tarjeta de la distancia de la imagen da −12,00 cm, y el lienzo dibuja la imagen en discontinua.',
  },
  {
    id: 6,
    titulo: 'La imagen en una lente divergente',
    enunciado: `Una lente divergente de focal 10 cm tiene un objeto a 10 cm delante. ¿A qué distancia de la lente se forma la imagen? ${SIGNO_POSICION}`,
    categoria: 'abstracto',
    datos: { pregunta: 'posicionImagen', focal: -10, distanciaObjeto: 10 },
    etiquetaRespuesta: "s' en cm",
    requiereRedondeo: false,
    pista:
      "En una divergente la focal lleva signo menos: f = −10 cm. Aunque el objeto esté a la misma distancia que el foco, en una divergente sí hay imagen: 1/s' = 1/(−10) − 1/10.",
    comoComprobar:
      'Elige la lente divergente y pon la distancia focal en 10 cm y la del objeto en 10 cm: la tarjeta de la distancia de la imagen da −5,00 cm.',
  },
  {
    id: 7,
    titulo: 'La altura de la imagen en una mirilla',
    enunciado:
      'Una lente divergente de focal 20 cm, como la de una mirilla sencilla, tiene delante, a 20 cm, un objeto de 4 cm de altura. ¿Qué altura tiene la imagen que se ve a través de la lente? Escríbela con signo: negativa si saliera invertida.',
    categoria: 'aplicado',
    datos: { pregunta: 'alturaImagen', focal: -20, distanciaObjeto: 20, altura: 4 },
    etiquetaRespuesta: "h' en cm",
    requiereRedondeo: false,
    pista: "f = −20 cm. Calcula s', después M = −s'/s y por último h' = M·h. Una divergente da siempre una imagen virtual, derecha y más pequeña.",
    comoComprobar:
      'Elige la lente divergente, pon la distancia focal en 20 cm, la del objeto en 20 cm y la altura del objeto en 4 cm: la tarjeta de la altura de la imagen da 2,00 cm.',
  },
  {
    id: 8,
    titulo: 'Las dioptrías de unas gafas para miopía',
    enunciado:
      'Un óptico mide una lente de unas gafas para miopía: es divergente, de focal 20 cm. ¿Cuál es su potencia en dioptrías? Escríbela con su signo, como aparece en una receta de gafas.',
    categoria: 'aplicado',
    datos: { pregunta: 'potencia', focal: -20 },
    etiquetaRespuesta: 'P en D',
    requiereRedondeo: false,
    pista: 'P = 1/f con la focal en METROS y con su signo: una divergente tiene f negativa.',
    comoComprobar:
      'Elige la lente divergente y pon la distancia focal en 20 cm: la tarjeta de la potencia da −5,00 D.',
  },
  {
    id: 9,
    titulo: 'Dos lentes juntas',
    enunciado:
      'Un optometrista prueba dos lentes delgadas juntas, en contacto: una convergente de 20 cm de focal y otra divergente de focal 50 cm. ¿Cuál es la potencia del conjunto, en dioptrías? Escríbela con su signo.',
    categoria: 'aplicado',
    datos: { pregunta: 'potenciaConjunto', focal: 20, focal2: -50 },
    etiquetaRespuesta: 'P en D',
    requiereRedondeo: false,
    pista: 'Pasa cada focal a metros, calcula la potencia de cada lente con su signo y súmalas. Lo que se suma son las potencias, no las focales.',
  },
  {
    id: 10,
    titulo: 'La focal de la lente de un proyector',
    enunciado:
      'Un proyector tiene la diapositiva a 10,2 cm de su lente y forma una imagen nítida sobre una pared situada a 5,1 m al otro lado de la lente. ¿Cuál es la distancia focal de la lente, en centímetros?',
    categoria: 'aplicado',
    datos: { pregunta: 'focalDesdeDistancias', distanciaObjeto: 10.2, distanciaImagen: 510 },
    etiquetaRespuesta: 'f en cm',
    requiereRedondeo: false,
    pista: "Pasa primero todo a centímetros (5,1 m = 510 cm). La imagen se recoge en la pared, así que es real y s' es positiva. Después, 1/f = 1/s + 1/s'.",
  },
  {
    id: 11,
    titulo: 'Dónde va el sensor de una cámara',
    enunciado:
      'El objetivo de una cámara se comporta como una lente convergente de 5 cm de focal. Se enfoca una flor situada a 1,05 m de la lente. ¿A qué distancia de la lente tiene que quedar el sensor para que la foto salga nítida, en centímetros?',
    categoria: 'aplicado',
    datos: { pregunta: 'posicionImagen', focal: 5, distanciaObjeto: 105 },
    etiquetaRespuesta: "s' en cm",
    requiereRedondeo: false,
    pista: "El sensor tiene que estar donde se forma la imagen. Pasa 1,05 m a cm y usa 1/s + 1/s' = 1/f. Con un objeto lejano, la imagen queda un poco más allá del foco.",
  },
  {
    id: 12,
    titulo: 'Dónde poner la lupa para un aumento dado',
    enunciado:
      '¿A qué distancia de una lupa de 10 cm de focal (lente convergente) hay que poner un objeto para verlo derecho y 5 veces más grande? Responde con la distancia en centímetros, sin signo.',
    categoria: 'aplicado',
    datos: { pregunta: 'distanciaObjetoParaAumento', focal: 10, aumento: 5 },
    etiquetaRespuesta: 'distancia en cm',
    requiereRedondeo: false,
    pista: "Derecho y 5 veces mayor es M = +5, así que s' = −5·s. Sustituye esa s' en 1/s + 1/s' = 1/f y despeja s.",
    comoComprobar:
      'Pon la distancia focal en 10 cm (lente convergente) y mueve la distancia del objeto hasta que la tarjeta del aumento marque 5,000: esa distancia del objeto es la respuesta.',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «−12,00 cm». La unidad es lo que
 * va detrás de « en » en la etiqueta («s' en cm» → «cm»), así que no se imprime nunca un número
 * suelto junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  const texto = cifra(valor, decimales);
  return unidad ? `${texto} ${unidad}` : texto;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
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
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/**
 * Listas «amables»: cifras que se teclean sin error y caben en los deslizadores del simulador
 * (|f| 2–20 cm, s 2–40 cm, h 0,5–5 cm), así que cualquier ejercicio se puede montar en él.
 */
const FOCALES = [4, 5, 6, 8, 10, 12, 15, 20] as const;
const DISTANCIAS = [3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 24, 25, 30, 36, 40] as const;
const ALTURAS = [1, 1.5, 2, 2.5, 3, 4, 5] as const;
const PREGUNTAS = ['posicionImagen', 'aumento', 'alturaImagen', 'potencia'] as const;
/** Imágenes más lejos que esto no caben en ningún banco de óptica escolar: se evitan. */
const IMAGEN_MAXIMA = 150;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/**
 * Ejercicio aleatorio con los mismos tipos de pregunta que los casos fijos. Usa EL MISMO
 * `resolverCaso` que los doce, y por tanto el mismo motor que el panel: si divergieran, el
 * alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const convergente = rnd() < 0.6;
  const fAbs = elegir(FOCALES, rnd);
  const focal = convergente ? fAbs : -fAbs;
  let indice = Math.min(DISTANCIAS.length - 1, Math.floor(rnd() * DISTANCIAS.length));
  const altura = elegir(ALTURAS, rnd);

  // Nunca el objeto en el foco (no hay imagen), ni tan cerca de él que la imagen se vaya a
  // metros: se avanza por la lista, con un número de intentos acotado.
  const aceptable = (s: number): boolean => {
    const r = calcularImagen(focal, s, altura);
    return r.valido && Math.abs(r.sImg) <= IMAGEN_MAXIMA;
  };
  let intentos = 0;
  while (!aceptable(DISTANCIAS[indice]) && intentos < DISTANCIAS.length) {
    indice = (indice + 1) % DISTANCIAS.length;
    intentos += 1;
  }
  const distanciaObjeto: number = DISTANCIAS[indice];

  // Cada pregunta lleva SOLO los datos que usa: la potencia no depende del objeto.
  const datos: DatosCaso =
    pregunta === 'potencia'
      ? { pregunta, focal }
      : pregunta === 'alturaImagen'
        ? { pregunta, focal, distanciaObjeto, altura }
        : { pregunta, focal, distanciaObjeto };
  const lente = convergente
    ? `una lente convergente de ${numero(fAbs)} cm de focal`
    : `una lente divergente de focal ${numero(fAbs)} cm`;
  const redondeo = 'Si no sale exacto, redondea a dos decimales.';

  let enunciado: string;
  let etiqueta: string;

  if (pregunta === 'posicionImagen') {
    enunciado = `Un objeto está a ${numero(distanciaObjeto)} cm delante de ${lente}. ¿A qué distancia de la lente se forma la imagen? ${SIGNO_POSICION} ${redondeo}`;
    etiqueta = "s' en cm";
  } else if (pregunta === 'aumento') {
    enunciado = `Un objeto está a ${numero(distanciaObjeto)} cm delante de ${lente}. ¿Cuánto vale el aumento lateral de su imagen? Escríbelo con su signo: negativo si la imagen sale invertida. ${redondeo}`;
    etiqueta = 'M (sin unidad)';
  } else if (pregunta === 'alturaImagen') {
    enunciado = `Un objeto de ${numero(altura)} cm de altura está a ${numero(distanciaObjeto)} cm delante de ${lente}. ¿Qué altura tiene su imagen? Escríbela con signo: negativa si la imagen sale invertida. ${redondeo}`;
    etiqueta = "h' en cm";
  } else {
    enunciado = `¿Cuál es la potencia, en dioptrías, de ${lente}? Escríbela con su signo. ${redondeo}`;
    etiqueta = 'P en D';
  }

  const r = resolverCaso(datos);
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}

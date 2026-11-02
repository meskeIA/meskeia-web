/**
 * Casos para clase — la tarea asignable de `simulador-cifrado-cesar`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la aritmética está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y nada lanza excepciones: lo que falla devuelve `{ ok: false, error }` o NaN.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Ningún cifrado se reescribe aquí: todo sale de `./motor.ts`, el mismo módulo con el que la
 * herramienta pinta su resultado (`procesarTexto`) y su ataque (`detectarDesplazamiento`). Si
 * la corrección y la rueda contaran distinto, la app suspendería un mensaje que ella misma
 * produce. Lo propio de este fichero es leer la pregunta, escribir el paso a paso y corregir.
 *
 * ── EL CONVENIO, POR ESCRITO ──────────────────────────────────────────────────
 *
 *   · Alfabeto de 26 letras, SIN Ñ: el de la rueda. Muchas aulas hispanas usan 27 letras con Ñ,
 *     que da otro resultado en cuanto una letra cruza la N (con 27, la N + 1 es la Ñ) o da la
 *     vuelta. Por eso cada enunciado cuya respuesta cambiaría con 27 letras lo DICE con
 *     `AVISO_ALFABETO_26`, y no se decide a mano: lo decide `cambiaConAlfabeto27`, que vuelve a
 *     resolver con `cifrarConAlfabeto27` del motor.
 *   · Cifrar = AVANZAR k posiciones (A → D con k = 3), con la vuelta de la Z a la A. Descifrar =
 *     retroceder k, que es lo mismo que avanzar 26 − k.
 *   · La Ñ, las tildes, los números y los signos pasan sin cifrar (lo hace la app). Para que eso
 *     no influya, los mensajes de los casos usan SOLO letras A–Z y espacios: lo comprueba
 *     `resolverCaso`, que rechaza un mensaje con cualquier otra cosa.
 *   · Se corrigen solo las LETRAS (`normalizarMensaje`): mayúsculas o minúsculas, espacios,
 *     signos y cifras dan igual, y las vocales con tilde valen como sin ella. La Ñ NO vale por N.
 *
 * ── DOS FORMAS DE RESPUESTA ──────────────────────────────────────────────────
 *
 *   · 'texto' (cifrar, descifrar, descifrar sin clave): un mensaje, comparado normalizado, con
 *     sus trampas con nombre propio (contar la Ñ, ir en el sentido contrario, copiarlo tal cual).
 *   · 'clave' (hallar la clave, la clave que deshace, dos cifrados seguidos, la clave sin
 *     conocerla): un entero exacto, corregido con `corregirNumero` del motor común y la magnitud
 *     de `MAGNITUD_CLAVE` (la clave va de 0 o 1 a 25), también con sus trampas (26 − k, −k,
 *     k₁ + k₂ sin reducir, contar la Ñ).
 *
 * Las trampas se miran ANTES que el dominio: «32» en dos cifrados seguidos está fuera de 0–25,
 * pero lo que le sirve al alumno es saber que le falta restar 26. Y ninguna trampa tapa una
 * respuesta aceptada: si con 26 y con 27 letras sale lo mismo, no hay trampa que decir.
 *
 * ⚠️ Ningún título ni texto de esta sección repite los nombres de los botones de la herramienta
 * («Cifrar», «Descifrar», «Ataque automático», los textos predefinidos): el acta del Inspector
 * (`tests/apps/simulador-cifrado-cesar.spec.ts`) los busca por nombre, y el nombre de cada botón
 * de caso es «Caso N: título».
 */

import { corregirNumero, leerRespuestaAula, type MagnitudAcotada } from '@/lib/calculadoras/correctorCasosAula';
import {
  ALFABETO,
  ALFABETO_27,
  calcularFrecuencias,
  cifrarConAlfabeto27,
  claveEntre,
  claveEntre27,
  detectarDesplazamiento,
  normalizarMensaje,
  procesarTexto,
} from './motor';

/* ─────────────────────────── Tipos ─────────────────────────── */

export type TipoPregunta =
  /** Cifrar `mensaje` con `clave`. Respuesta: texto. */
  | 'cifrar'
  /** Descifrar el criptograma de `mensaje` con `clave` (conocida). Respuesta: texto. */
  | 'descifrar'
  /** Dados `mensaje` y su criptograma, la clave. Respuesta: clave. */
  | 'hallar-clave'
  /** La clave que, CIFRANDO otra vez, deshace un cifrado con `clave`: 26 − k. Respuesta: clave. */
  | 'clave-inversa'
  /** Cifrar con `clave` y luego con `clave2` equivale a una sola: (k₁ + k₂) mod 26. Respuesta: clave. */
  | 'composicion'
  /** Descifrar SIN clave un criptograma largo, por frecuencias. Respuesta: texto. */
  | 'sin-clave-texto'
  /** La clave de un criptograma largo, por frecuencias. Respuesta: clave. */
  | 'sin-clave-clave';

export type FormaRespuesta = 'texto' | 'clave';

export const FORMA: Record<TipoPregunta, FormaRespuesta> = {
  cifrar: 'texto',
  descifrar: 'texto',
  'sin-clave-texto': 'texto',
  'hallar-clave': 'clave',
  'clave-inversa': 'clave',
  composicion: 'clave',
  'sin-clave-clave': 'clave',
};

/** Las preguntas cuya respuesta es una clave. */
export type TipoClave = 'hallar-clave' | 'clave-inversa' | 'composicion' | 'sin-clave-clave';

/**
 * Qué valores son IMPOSIBLES para cada clave. Entre dos textos distintos la clave no puede ser 0;
 * dos cifrados seguidos sí pueden dar 0 (13 + 13 es la vuelta completa).
 */
export const MAGNITUD_CLAVE: Record<TipoClave, MagnitudAcotada> = {
  'hallar-clave': { entero: true, minimo: 1, maximo: 25, que: 'la clave' },
  'clave-inversa': { entero: true, minimo: 1, maximo: 25, que: 'la clave' },
  composicion: { entero: true, minimo: 0, maximo: 25, que: 'la clave' },
  'sin-clave-clave': { entero: true, minimo: 1, maximo: 25, que: 'la clave' },
};

export function esTipoClave(tipo: TipoPregunta): tipo is TipoClave {
  return FORMA[tipo] === 'clave';
}

export interface DatosCaso {
  tipo: TipoPregunta;
  /** El mensaje EN CLARO: solo letras A–Z y espacios (ni Ñ, ni tildes, ni cifras). */
  mensaje: string;
  /** La clave con que se cifra, de 1 a 25. En 'composicion', la primera. */
  clave: number;
  /** Solo en 'composicion': la segunda clave, de 1 a 25. */
  clave2?: number;
}

/** Una respuesta equivocada pero reconocible, que merece un aviso distinto de «no es correcto». */
export interface Trampa {
  /** Un mensaje (forma 'texto') o una clave (forma 'clave'). */
  valor: string | number;
  motivo: string;
}

export interface Resolucion {
  ok: boolean;
  forma: FormaRespuesta;
  /** Forma 'texto': el mensaje en mayúsculas, con sus espacios. Forma 'clave': el entero. */
  valor: string | number;
  /** Lo que saldría contando con el alfabeto de 27 letras (texto o número; NaN si no hay una sola clave). */
  con27: string | number;
  pasos: string[];
  trampas: Trampa[];
  error?: string;
}

/* ─────────────────────────── Textos fijos ─────────────────────────── */

/** La frase que llevan los enunciados cuya respuesta cambiaría con el alfabeto de 27 letras. */
export const AVISO_ALFABETO_26 = 'Cuenta con el alfabeto de 26 letras, sin Ñ, el de la rueda.';

/** El convenio, en pantalla, para que no dependa de esta cabecera. */
export const NOTA_CONVENIO =
  'Se cuenta como la rueda: alfabeto de 26 letras, sin Ñ, y cifrar es avanzar k posiciones (con k = 3, la A pasa a D), con la vuelta de la Z a la A. ' +
  'Se corrigen solo las letras: da igual escribir en mayúsculas o minúsculas, con espacios o sin ellos.';

const MOTIVO_N =
  'Has contado la Ñ: la rueda de esta app tiene 26 letras, sin Ñ, y de la N se pasa directamente a la O.';

/* ─────────────────────────── Utilidades ─────────────────────────── */

const MENSAJE_VALIDO = /^[A-Z]+( [A-Z]+)*$/;

function claveValida(k: number | undefined): k is number {
  return typeof k === 'number' && Number.isInteger(k) && k >= 1 && k <= 25;
}

/** Posición de una letra en la rueda (A = 0 … Z = 25). */
function pos(letra: string): number {
  return ALFABETO.indexOf(letra);
}

/** Las letras distintas de un texto, en el orden en que aparecen. */
function letrasDistintas(texto: string): string[] {
  return [...new Set(normalizarMensaje(texto).split(''))];
}

/** «L (11) + 4 = 15 → P» · «Z (25) + 6 = 31 → 31 − 26 = 5 → F». */
function lineaAvance(letra: string, k: number): string {
  const p = pos(letra);
  const s = p + k;
  const destino = ALFABETO[s % 26];
  return s < 26
    ? `  ${letra} (${p}) + ${k} = ${s} → ${destino}`
    : `  ${letra} (${p}) + ${k} = ${s} → ${s} − 26 = ${s - 26} → ${destino}`;
}

/** «W (22) − 10 = 12 → M» · «D (3) − 10 = −7 → −7 + 26 = 19 → T». */
function lineaRetroceso(letra: string, k: number): string {
  const p = pos(letra);
  const r = p - k;
  const destino = ALFABETO[(r + 26) % 26];
  return r >= 0
    ? `  ${letra} (${p}) − ${k} = ${r} → ${destino}`
    : `  ${letra} (${p}) − ${k} = −${-r} → −${-r} + 26 = ${r + 26} → ${destino}`;
}

/** Recuento de las letras A–Z, de más a menos frecuente (empates por orden alfabético). */
function recuento(texto: string): { letra: string; veces: number }[] {
  const f = calcularFrecuencias(texto);
  const total = normalizarMensaje(texto).replace(/Ñ/g, '').length;
  return ALFABETO.split('')
    .map((letra) => ({ letra, veces: Math.round((f[letra] * total) / 100) }))
    .filter((x) => x.veces > 0)
    .sort((a, b) => b.veces - a.veces || a.letra.localeCompare(b.letra));
}

/** ¿Es la E la letra más frecuente del mensaje, sin empate? Así el método a mano y la app coinciden. */
function eDominaEn(mensaje: string): boolean {
  const r = recuento(mensaje);
  return r.length > 0 && r[0].letra === 'E' && (r.length === 1 || r[1].veces < r[0].veces);
}

function fallo(forma: FormaRespuesta, error: string): Resolucion {
  return { ok: false, forma, valor: forma === 'texto' ? '' : NaN, con27: NaN, pasos: [], trampas: [], error };
}

/** El criptograma que se enseña en el enunciado: el mensaje cifrado con la app. */
export function criptogramaDe(datos: DatosCaso): string {
  return procesarTexto(datos.mensaje, datos.clave, false);
}

/** Quita las trampas que coinciden con la respuesta aceptada (o con otra trampa ya dicha). */
function filtrarTrampas(forma: FormaRespuesta, valor: string | number, trampas: Trampa[], sinonimos: readonly string[] = []): Trampa[] {
  const clave = (v: string | number): string =>
    forma === 'texto' ? normalizarMensaje(String(v)) : Number.isFinite(v) ? String(v) : '';
  const vistas = new Set<string>([clave(valor), ...sinonimos.map(clave)]);
  const salida: Trampa[] = [];
  for (const t of trampas) {
    const c = clave(t.valor);
    if (c === '' || vistas.has(c)) continue;
    vistas.add(c);
    salida.push(t);
  }
  return salida;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca lanza:
 * un `throw` dentro de un render de React tumbaría la app entera.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const tipo = datos.tipo;
  const forma = FORMA[tipo];
  if (!forma) return fallo('texto', 'Pregunta desconocida.');
  const m = datos.mensaje ?? '';
  const k = datos.clave;
  if (!MENSAJE_VALIDO.test(m)) return fallo(forma, 'El mensaje solo puede llevar letras de la A a la Z y espacios.');
  if (!claveValida(k)) return fallo(forma, 'La clave debe ser un entero de 1 a 25.');

  const c = criptogramaDe(datos);
  const pasos: string[] = [];
  let valor: string | number;
  let con27: string | number;
  let trampas: Trampa[] = [];

  switch (tipo) {
    case 'cifrar': {
      valor = procesarTexto(m, k, false);
      con27 = cifrarConAlfabeto27(m, k);
      pasos.push(
        `Con k = ${k}, cada letra AVANZA ${k} ${k === 1 ? 'posición' : 'posiciones'} en el alfabeto (A = 0, B = 1 … Z = 25). Si se pasa de 25, se resta 26: la Z vuelve a la A.`,
      );
      for (const l of letrasDistintas(m)) pasos.push(lineaAvance(l, k));
      pasos.push(`Letra a letra: ${m} → ${valor}.`);
      trampas = [
        { valor: procesarTexto(m, k, true), motivo: `Has retrocedido ${k} ${k === 1 ? 'posición' : 'posiciones'}: eso es descifrar. Para cifrar se avanza: con k = 3, la A pasa a D.` },
        { valor: con27, motivo: MOTIVO_N },
        { valor: m, motivo: `Ese es el mensaje sin cifrar: cada letra tiene que avanzar ${k} ${k === 1 ? 'posición' : 'posiciones'}.` },
      ];
      break;
    }

    case 'descifrar': {
      valor = procesarTexto(c, k, true);
      con27 = cifrarConAlfabeto27(c, -k);
      pasos.push(
        `Para descifrar, cada letra RETROCEDE ${k} ${k === 1 ? 'posición' : 'posiciones'} (A = 0 … Z = 25). Si queda por debajo de 0, se suma 26. Es lo mismo que avanzar 26 − ${k} = ${26 - k}.`,
      );
      for (const l of letrasDistintas(c)) pasos.push(lineaRetroceso(l, k));
      pasos.push(`Letra a letra: ${c} → ${valor}.`);
      trampas = [
        { valor: procesarTexto(c, k, false), motivo: `Has avanzado otras ${k} posiciones: eso es cifrar dos veces. Para descifrar se retrocede ${k}.` },
        { valor: con27, motivo: MOTIVO_N },
        { valor: c, motivo: `Ese es el criptograma tal cual: cada letra tiene que retroceder ${k} ${k === 1 ? 'posición' : 'posiciones'}.` },
      ];
      break;
    }

    case 'hallar-clave': {
      valor = claveEntre(m, c);
      con27 = claveEntre27(m, c);
      const a = normalizarMensaje(m);
      const b = normalizarMensaje(c);
      pasos.push('La clave es lo que avanza cada letra, contando de la letra en claro a la cifrada (A = 0 … Z = 25). Si la resta sale negativa, se suma 26.');
      const vistas = new Set<string>();
      for (let i = 0; i < a.length; i++) {
        const par = a[i] + b[i];
        if (vistas.has(par)) continue;
        vistas.add(par);
        const d = pos(b[i]) - pos(a[i]);
        pasos.push(
          d >= 0
            ? `  ${a[i]} (${pos(a[i])}) → ${b[i]} (${pos(b[i])}): ${pos(b[i])} − ${pos(a[i])} = ${d}`
            : `  ${a[i]} (${pos(a[i])}) → ${b[i]} (${pos(b[i])}): ${pos(b[i])} − ${pos(a[i])} = −${-d} → −${-d} + 26 = ${d + 26}`,
        );
      }
      pasos.push(`Todas las letras avanzan lo mismo: la clave es k = ${valor}.`);
      trampas = [
        { valor: (26 - k) % 26, motivo: `Has contado hacia atrás, de la letra cifrada a la clara: ${(26 - k) % 26} es la clave que lo DESHACE. La de cifrado se cuenta hacia delante, de la letra en claro a la cifrada.` },
        { valor: -k, motivo: 'La clave se cuenta hacia delante, de la letra en claro a la cifrada, y va de 1 a 25: has restado al revés.' },
        { valor: claveEntre27(m, c, true), motivo: MOTIVO_N },
      ];
      break;
    }

    case 'clave-inversa': {
      valor = (26 - k) % 26;
      con27 = 27 - k;
      const vuelta = procesarTexto(c, valor, false);
      pasos.push(`Cifrar con ${k} y después con x deja el mensaje igual cuando las dos claves suman una vuelta completa de la rueda, 26 posiciones.`);
      pasos.push(`  ${k} + x = 26 → x = 26 − ${k} = ${valor}`);
      pasos.push(`Comprobación con la palabra ${m}: con k = ${k} sale ${c}, y cifrando ${c} con k = ${valor} vuelve a salir ${vuelta}.`);
      trampas = [
        { valor: k, motivo: `Esa es la clave con la que se cifró. La que lo deshace avanzando es la que completa la vuelta: 26 − ${k}.` },
        { valor: -k, motivo: `Retroceder ${k} deshace el cifrado, pero se pide la clave para AVANZAR, de 1 a 25: retroceder ${k} es avanzar 26 − ${k}.` },
        { valor: con27, motivo: MOTIVO_N },
      ];
      break;
    }

    case 'composicion': {
      const k2 = datos.clave2;
      if (!claveValida(k2)) return fallo(forma, 'La segunda clave debe ser un entero de 1 a 25.');
      const suma = k + k2;
      // La respuesta sale de comparar el mensaje con su doble cifrado, hecho con la app.
      const doble = procesarTexto(c, k2, false);
      valor = claveEntre(m, doble);
      con27 = suma % 27;
      pasos.push(`Avanzar ${k} posiciones y después otras ${k2} es avanzar ${k} + ${k2} = ${suma}.`);
      pasos.push(
        suma >= 26
          ? `  La rueda tiene 26 letras: avanzar ${suma} es dar una vuelta entera y avanzar ${suma} − 26 = ${suma - 26}.`
          : `  ${suma} no llega a 26: no hace falta restar nada.`,
      );
      pasos.push(`Comprobación con la palabra ${m}: con k = ${k} sale ${c}; con k = ${k2} sale ${doble}; y ${m} con k = ${valor} da también ${procesarTexto(m, valor, false)}.`);
      trampas = [
        { valor: suma, motivo: `Has sumado bien, pero ${suma} se pasa de 25: la rueda da la vuelta cada 26 posiciones, así que hay que restar 26.` },
        { valor: Math.abs(k - k2), motivo: 'Los dos cifrados avanzan, así que las claves se SUMAN, no se restan.' },
        { valor: con27, motivo: MOTIVO_N },
      ];
      break;
    }

    case 'sin-clave-texto':
    case 'sin-clave-clave': {
      const letras = normalizarMensaje(c).length;
      if (letras < 20) return fallo(forma, 'Un criptograma para atacar por frecuencias necesita al menos 20 letras.');
      if (!eDominaEn(m)) return fallo(forma, 'En este mensaje la E no es la letra más frecuente: el método a mano no daría la clave.');
      const kDetectada = detectarDesplazamiento(c);
      if (kDetectada !== k) return fallo(forma, 'El análisis de frecuencias de la app no recupera la clave de este criptograma.');
      const r = recuento(c);
      const top = r.slice(0, 3).map((x) => `${x.letra} (${x.veces} ${x.veces === 1 ? 'vez' : 'veces'})`).join(', ');
      const masFrecuente = r[0].letra;
      const claro = procesarTexto(c, kDetectada, true);
      pasos.push(`El criptograma tiene ${letras} letras. Las que más se repiten: ${top}.`);
      pasos.push('En un texto en español la letra más frecuente suele ser la E (13,7 % según Fletcher Pratt, 1939), seguida de la A.');
      const d = pos(masFrecuente) - pos('E');
      pasos.push(
        d >= 0
          ? `Si la ${masFrecuente} del criptograma es la E del mensaje: ${masFrecuente} (${pos(masFrecuente)}) − E (4) = ${d} → k = ${kDetectada}.`
          : `Si la ${masFrecuente} del criptograma es la E del mensaje: ${masFrecuente} (${pos(masFrecuente)}) − E (4) = −${-d} → −${-d} + 26 = ${d + 26} → k = ${kDetectada}.`,
      );
      pasos.push(`El ataque de la app compara el histograma entero con el del español (prueba χ²) y da la misma clave: k = ${kDetectada}.`);
      pasos.push(`Retrocediendo ${kDetectada} posiciones cada letra se lee un mensaje con sentido: ${claro}.`);
      if (tipo === 'sin-clave-texto') {
        valor = claro;
        con27 = cifrarConAlfabeto27(c, -kDetectada);
        trampas = [
          { valor: procesarTexto(c, kDetectada, false), motivo: 'Has avanzado en vez de retroceder: eso vuelve a cifrar el criptograma. Para descifrar se retrocede la clave (en la app, con el modo de descifrar).' },
          { valor: con27, motivo: MOTIVO_N },
          { valor: c, motivo: 'Ese es el criptograma tal cual: primero hay que averiguar la clave y luego retroceder cada letra.' },
        ];
      } else {
        valor = kDetectada;
        // Con 27 letras, el método a mano: de la E a la letra más frecuente, contando la Ñ.
        con27 = (ALFABETO_27.indexOf(masFrecuente) - ALFABETO_27.indexOf('E') + 27) % 27;
        trampas = [
          { valor: (26 - kDetectada) % 26, motivo: `Esa es la clave que lo DESHACE (26 − ${kDetectada}). Se pide la clave con la que se cifró: lo que avanza la E del mensaje hasta la letra más frecuente del criptograma.` },
          { valor: -kDetectada, motivo: 'La clave se cuenta hacia delante, de la letra en claro a la cifrada, y va de 1 a 25: has restado al revés.' },
          { valor: con27, motivo: MOTIVO_N },
        ];
      }
      break;
    }

    default:
      return fallo('texto', 'Pregunta desconocida.');
  }

  if (forma === 'clave' && (typeof valor !== 'number' || !Number.isInteger(valor))) {
    return fallo(forma, 'No hay una sola clave que lleve un texto al otro.');
  }
  if (forma === 'texto' && (typeof valor !== 'string' || valor === '')) {
    return fallo(forma, 'El mensaje ha salido vacío.');
  }

  return { ok: true, forma, valor, con27, pasos, trampas: filtrarTrampas(forma, valor, trampas) };
}

/**
 * ¿Cambia la respuesta si se cuenta con el alfabeto de 27 letras? Es lo que decide si el
 * enunciado lleva `AVISO_ALFABETO_26`. Se calcula, no se escribe a mano.
 */
export function cambiaConAlfabeto27(datos: DatosCaso): boolean {
  const r = resolverCaso(datos);
  if (!r.ok) return false;
  if (r.forma === 'texto') return normalizarMensaje(String(r.con27)) !== normalizarMensaje(String(r.valor));
  return r.con27 !== r.valor;
}

/* ─────────────────────────── Textos de la casilla y de la solución ─────────────────────────── */

export function etiquetaDe(datos: DatosCaso): string {
  switch (datos.tipo) {
    case 'cifrar':
      return 'Mensaje cifrado (solo cuentan las letras)';
    case 'descifrar':
    case 'sin-clave-texto':
      return 'Mensaje en claro (solo cuentan las letras)';
    default: {
      const mag = esTipoClave(datos.tipo) ? MAGNITUD_CLAVE[datos.tipo] : null;
      return mag ? `Clave k (un entero de ${mag.minimo} a ${mag.maximo})` : 'Clave k';
    }
  }
}

/** «IXHJR» o «k = 7»: lo que se enseña como respuesta. */
export function textoRespuesta(forma: FormaRespuesta, valor: string | number): string {
  if (forma === 'texto') return typeof valor === 'string' && valor !== '' ? valor : '—';
  return typeof valor === 'number' && Number.isFinite(valor) ? `k = ${valor}` : '—';
}

/** Qué hacer en la herramienta de arriba para verlo. Generado desde los datos. */
export function comoComprobarDe(datos: DatosCaso): string {
  const c = criptogramaDe(datos);
  const k = datos.clave;
  switch (datos.tipo) {
    case 'cifrar':
      return `Arriba, deja el modo de cifrar, pon el deslizador en k = ${k} y escribe ${datos.mensaje} en el texto original: el resultado sale en el cuadro de al lado.`;
    case 'descifrar':
      return `Arriba, pasa al modo de descifrar, pon el deslizador en k = ${k} y escribe el criptograma ${c} en el cuadro de entrada: el mensaje sale en el cuadro de al lado.`;
    case 'hallar-clave':
      return `Arriba, en modo de cifrar, escribe ${datos.mensaje} y mueve el deslizador hasta que el resultado sea ${c}: el número del deslizador es la clave.`;
    case 'clave-inversa':
      return `Arriba, en modo de cifrar, escribe ${c} (que es ${datos.mensaje} cifrado con k = ${k}) y mueve el deslizador hasta que el resultado vuelva a ser ${datos.mensaje}.`;
    case 'composicion': {
      const doble = procesarTexto(c, datos.clave2 ?? 0, false);
      return `Arriba, en modo de cifrar, escribe ${datos.mensaje} y mueve el deslizador hasta que el resultado sea ${doble}, que es ${datos.mensaje} cifrado con k = ${k} y luego con k = ${datos.clave2 ?? ''}.`;
    }
    case 'sin-clave-texto':
    case 'sin-clave-clave':
      return 'Arriba, pasa al modo de descifrar, pega el criptograma en el cuadro de entrada y pulsa el botón del ataque, junto al histograma: la app pone la clave en el deslizador y deja el mensaje a la vista.';
    default:
      return '';
  }
}

/* ─────────────────────────── Corrección ─────────────────────────── */

export interface ObjetivoCorreccion {
  datos: DatosCaso;
  forma: FormaRespuesta;
  respuesta: string | number;
  sinonimos: readonly string[];
  trampas: readonly Trampa[];
}

export type EstadoVeredicto = 'vacio' | 'acierto' | 'trampa' | 'imposible' | 'fallo';

export interface Veredicto {
  correcto: boolean;
  estado: EstadoVeredicto;
  motivo: string;
}

/** Quita un «k =» delante de la clave escrita: «k = 7» y «k=7» valen como «7». */
export function limpiarClave(texto: string): string {
  return (texto ?? '').replace(/^\s*k\s*=\s*/i, '');
}

/**
 * Corrige la respuesta del alumno. Nunca lanza.
 *
 * Forma 'texto': `entrada` es lo que escribió; se compara con `normalizarMensaje` (solo letras,
 * sin tildes, la Ñ aparte). Forma 'clave': `entrada` es el número ya leído con
 * `leerRespuestaAula` (lo hace la vista); si llega el texto, se lee aquí igual. Se corrige exacto
 * con `corregirNumero` y la magnitud de `MAGNITUD_CLAVE`.
 *
 * Orden: vacío → acierto → trampa con nombre → imposible → fallo.
 */
export function comprobarRespuesta(entrada: string | number, objetivo: ObjetivoCorreccion): Veredicto {
  const { forma, respuesta, datos } = objetivo;

  if (forma === 'texto') {
    if (typeof respuesta !== 'string' || respuesta === '') {
      return { correcto: false, estado: 'fallo', motivo: 'Este caso no tiene respuesta que comparar. No es cosa de tu respuesta.' };
    }
    const escrito = normalizarMensaje(typeof entrada === 'string' ? entrada : '');
    if (escrito === '') {
      return { correcto: false, estado: 'vacio', motivo: 'Escribe el mensaje con letras antes de comprobar.' };
    }
    const esperado = normalizarMensaje(respuesta);
    if (escrito === esperado || objetivo.sinonimos.some((s) => normalizarMensaje(s) === escrito)) {
      return { correcto: true, estado: 'acierto', motivo: `¡Correcto! ${respuesta}.` };
    }
    for (const t of objetivo.trampas) {
      if (typeof t.valor === 'string' && normalizarMensaje(t.valor) === escrito) {
        return { correcto: false, estado: 'trampa', motivo: t.motivo };
      }
    }
    if (escrito.length !== esperado.length) {
      return {
        correcto: false,
        estado: 'fallo',
        motivo: `Tu respuesta tiene ${escrito.length} letras y el mensaje tiene ${esperado.length}: el cifrado César cambia cada letra por otra, pero no quita ni añade ninguna.`,
      };
    }
    let primera = -1;
    let bien = 0;
    for (let i = 0; i < esperado.length; i++) {
      if (escrito[i] === esperado[i]) bien++;
      else if (primera < 0) primera = i;
    }
    return {
      correcto: false,
      estado: 'fallo',
      motivo: `No es correcto: coinciden ${bien} de ${esperado.length} letras. Revisa a partir de la letra número ${primera + 1}.`,
    };
  }

  // Forma 'clave'
  if (typeof respuesta !== 'number' || !Number.isFinite(respuesta) || !esTipoClave(datos.tipo)) {
    return { correcto: false, estado: 'fallo', motivo: 'Este caso no tiene respuesta que comparar. No es cosa de tu respuesta.' };
  }
  const valor = typeof entrada === 'number' ? entrada : leerRespuestaAula(limpiarClave(entrada), respuesta);
  const magnitud = MAGNITUD_CLAVE[datos.tipo];
  const r = corregirNumero(valor, respuesta, { tolerancia: 0, magnitud });
  if (r.estado === 'no-numerico') {
    return {
      correcto: false,
      estado: 'vacio',
      motivo: `Escribe la clave como un número entero de ${magnitud.minimo} a ${magnitud.maximo}.`,
    };
  }
  if (r.estado === 'acierto') {
    return { correcto: true, estado: 'acierto', motivo: `¡Correcto! k = ${respuesta}.` };
  }
  for (const t of objetivo.trampas) {
    if (typeof t.valor === 'number' && t.valor === valor) {
      return { correcto: false, estado: 'trampa', motivo: t.motivo };
    }
  }
  if (r.estado === 'imposible') {
    return { correcto: false, estado: 'imposible', motivo: r.motivoImposible ?? 'Ese valor no puede ser una clave.' };
  }
  return { correcto: false, estado: 'fallo', motivo: 'No es correcto. Abre la pista y repasa el procedimiento.' };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  /** Con el criptograma ya escrito y, si la respuesta cambia con 27 letras, `AVISO_ALFABETO_26`. */
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  forma: FormaRespuesta;
  /** Qué se escribe en la casilla. Nunca vacía. */
  etiquetaRespuesta: string;
  /** Calculada por el motor desde `datos`, jamás escrita a mano: texto o entero según `forma`. */
  respuesta: string | number;
  /** Otras grafías legítimas de la misma respuesta (normalmente ninguna). */
  sinonimos: readonly string[];
  trampas: readonly Trampa[];
  /** «IXHJR» o «k = 7». */
  respuestaTexto: string;
  pasos: string[];
  pista: string;
  comoComprobar: string;
}

interface Definicion {
  id: number;
  titulo: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** El enunciado, a partir del criptograma que produce la app (`c`). */
  enunciado: (c: string) => string;
  pista: string;
  sinonimos?: readonly string[];
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso` con el motor
 * de la app, de modo que editar un enunciado sin tocar la solución es imposible. Tampoco se
 * escriben a mano los criptogramas: los produce `procesarTexto`.
 *
 * Sin ciudades, países ni monedas. Los mensajes, solo con letras A–Z y espacios.
 */
const DEFINICIONES: readonly Definicion[] = [
  {
    id: 1,
    titulo: 'Avanzar tres posiciones',
    categoria: 'abstracto',
    datos: { tipo: 'cifrar', mensaje: 'FUEGO', clave: 3 },
    enunciado: () => 'Cifra la palabra FUEGO con la clave k = 3: cada letra avanza 3 posiciones en el alfabeto (la A pasa a D, la B a E…).',
    pista: 'Numera las letras desde A = 0 hasta Z = 25 y suma 3 a cada una. F es la 5, así que pasa a la 8, que es la I.',
  },
  {
    id: 2,
    titulo: 'Pasar por la N',
    categoria: 'abstracto',
    datos: { tipo: 'cifrar', mensaje: 'LUNA', clave: 4 },
    enunciado: () => 'Cifra la palabra LUNA con la clave k = 4.',
    pista: 'Cuenta cuatro letras hacia delante desde cada una. Fíjate en lo que hay después de la N en la rueda.',
  },
  {
    id: 3,
    titulo: 'La vuelta de la Z',
    categoria: 'abstracto',
    datos: { tipo: 'cifrar', mensaje: 'ZORRO', clave: 6 },
    enunciado: () => 'Cifra la palabra ZORRO con la clave k = 6. La rueda es circular: después de la Z vuelve a empezar la A.',
    pista: 'La Z es la 25: 25 + 6 = 31, y como la rueda tiene 26 letras, 31 − 26 = 5. ¿Qué letra es la 5?',
  },
  {
    id: 4,
    titulo: 'Retroceder la clave',
    categoria: 'abstracto',
    datos: { tipo: 'descifrar', mensaje: 'TORTUGA', clave: 10 },
    enunciado: (c) => `Este criptograma se cifró con la clave k = 10: ${c}. Descífralo: ¿qué palabra era?`,
    pista: 'Para descifrar se retrocede: resta 10 a la posición de cada letra. Si te sale negativo, suma 26.',
  },
  {
    id: 5,
    titulo: 'Comparar letra a letra',
    categoria: 'abstracto',
    datos: { tipo: 'hallar-clave', mensaje: 'GATO', clave: 7 },
    enunciado: (c) => `Con el cifrado César, la palabra GATO se ha convertido en ${c}. ¿Cuál es la clave k?`,
    pista: 'Cuenta cuántas posiciones hay que avanzar desde la G hasta la primera letra del criptograma, y comprueba que con las demás letras sale lo mismo.',
  },
  {
    id: 6,
    titulo: 'La clave que deshace',
    categoria: 'abstracto',
    datos: { tipo: 'clave-inversa', mensaje: 'GATO', clave: 8 },
    enunciado: () => 'Un mensaje se ha cifrado con k = 8. Si solo puedes cifrar (avanzar letras), ¿con qué clave, de 1 a 25, tienes que cifrarlo otra vez para recuperar el mensaje original?',
    pista: 'Avanzar 8 y luego avanzar x tiene que equivaler a no moverse: a dar una vuelta completa a la rueda.',
  },
  {
    id: 7,
    titulo: 'Dos cifrados seguidos',
    categoria: 'abstracto',
    datos: { tipo: 'composicion', mensaje: 'PLANETA', clave: 15, clave2: 17 },
    enunciado: () => 'Se cifra un mensaje con k = 15 y el resultado se vuelve a cifrar con k = 17. ¿Con qué clave única, de 0 a 25, se obtiene lo mismo en un solo paso?',
    pista: 'Los dos pasos avanzan, así que sus claves se suman. Si la suma se pasa de 25, recuerda que la rueda da la vuelta.',
  },
  {
    id: 8,
    titulo: 'Una nota en ROT-13',
    categoria: 'aplicado',
    datos: { tipo: 'descifrar', mensaje: 'NOS VEMOS EN EL PATIO', clave: 13 },
    enunciado: (c) => `Una compañera de clase te pasa una nota cifrada con ROT-13, es decir, con la clave k = 13: «${c}». ¿Qué dice la nota?`,
    pista: 'Con k = 13 retroceder y avanzar dan lo mismo, porque 13 es justo media vuelta de la rueda.',
  },
  {
    id: 9,
    titulo: 'La pista de la búsqueda del tesoro',
    categoria: 'aplicado',
    datos: { tipo: 'hallar-clave', mensaje: 'TESORO', clave: 11 },
    enunciado: (c) => `En una búsqueda del tesoro, una de las pistas está cifrada con el método César y dice ${c}. Sabes que esa palabra es TESORO. ¿Con qué clave k se cifró?`,
    pista: 'La T es la 19. ¿Cuánto hay que avanzar desde la 19 para llegar a la primera letra de la pista? Si pasas de la Z, sigue contando desde la A.',
  },
  {
    id: 10,
    titulo: 'La carta de Augusto',
    categoria: 'aplicado',
    datos: { tipo: 'cifrar', mensaje: 'VUELVE PRONTO', clave: 1 },
    enunciado: () => 'Según el historiador Suetonio, el emperador Augusto cifraba sus cartas escribiendo cada letra por la siguiente del alfabeto: un César con k = 1. ¿Cómo cifraría el mensaje VUELVE PRONTO?',
    pista: 'Cambia cada letra por la que va justo después. Ojo con la N: en la rueda de esta app, después de la N va la O.',
  },
  {
    id: 11,
    titulo: 'Frecuencias: la clave',
    categoria: 'aplicado',
    datos: { tipo: 'sin-clave-clave', mensaje: 'EL EQUIPO QUE ENCUENTRE ESTE MENSAJE GANA EL PRIMER PREMIO', clave: 9 },
    enunciado: (c) => `En un juego de pistas interceptas este mensaje del otro equipo, cifrado con el método César en español: «${c}». No conoces la clave. Con el análisis de frecuencias (a mano o con el histograma de la app), ¿qué clave k se usó?`,
    pista: 'Cuenta qué letra se repite más en el criptograma: lo más probable es que sea la E del mensaje. ¿Cuánto hay que avanzar desde la E hasta ella?',
  },
  {
    id: 12,
    titulo: 'Frecuencias: el mensaje',
    categoria: 'aplicado',
    datos: { tipo: 'sin-clave-texto', mensaje: 'NOS VEMOS EN LA ENTRADA DEL MUSEO ANTES DE LAS SIETE', clave: 17 },
    enunciado: (c) => `Encuentras este criptograma en una nota, cifrado con el método César en español: «${c}». No conoces la clave. Averíguala con el análisis de frecuencias y escribe el mensaje descifrado.`,
    pista: 'Busca la letra que más se repite y supón que es la E. Con esa clave, descifra las primeras palabras: si se leen, vas bien.',
  },
];

/** Enunciado + aviso de alfabeto si la respuesta cambia con 27 letras. */
function conAviso(texto: string, datos: DatosCaso): string {
  return cambiaConAlfabeto27(datos) ? `${texto} ${AVISO_ALFABETO_26}` : texto;
}

function construir(def: Definicion): Caso {
  const r = resolverCaso(def.datos);
  const forma = FORMA[def.datos.tipo];
  const sinonimos = def.sinonimos ?? [];
  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: conAviso(def.enunciado(criptogramaDe(def.datos)), def.datos),
    categoria: def.categoria,
    datos: def.datos,
    forma,
    etiquetaRespuesta: etiquetaDe(def.datos),
    respuesta: r.ok ? r.valor : forma === 'texto' ? '' : NaN,
    sinonimos,
    trampas: r.ok ? filtrarTrampas(forma, r.valor, r.trampas, sinonimos) : [],
    respuestaTexto: textoRespuesta(forma, r.ok ? r.valor : NaN),
    pasos: r.pasos,
    pista: def.pista,
    comoComprobar: comoComprobarDe(def.datos),
  };
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map(construir);

export const TOTAL_CASOS: number = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd() * n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio y
 * aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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

/** Entero entre `min` y `max`, ambos incluidos. */
function entre(min: number, max: number, rnd: () => number): number {
  return min + Math.min(max - min, Math.floor(rnd() * (max - min + 1)));
}

/** Palabras y frases cortas universales, solo con letras A–Z (sin Ñ ni tildes). */
export const MENSAJES_CORTOS: readonly string[] = [
  'GATO', 'LIBRO', 'PUERTA', 'VENTANA', 'ESCALERA', 'BOSQUE', 'NUBE', 'CIELO', 'PLAYA', 'TIGRE',
  'BALLENA', 'TESORO', 'LLAVE', 'MAPA', 'CASTILLO', 'RELOJ', 'PALABRA', 'SECRETO', 'MENSAJE', 'FARO',
  'PUENTE', 'LUNA', 'ARENA', 'TRUENO', 'HIELO', 'CAMINO', 'ESPEJO', 'PLUMA', 'VIENTO', 'ISLA',
  'SELVA', 'NIEVE', 'PLANETA', 'ESTRELLA', 'CABALLO', 'ABRE LA PUERTA', 'SIGUE EL CAMINO',
  'TRAE EL MAPA', 'BUSCA LA SEGUNDA PISTA', 'MIRA DEBAJO DE LA MESA', 'NOS VEMOS EN EL PATIO',
];

/**
 * Frases largas para descifrar sin clave: 20 letras o más, con la E como letra más frecuente sin
 * empate, y en las que el ataque de la app recupera las 25 claves (lo exige `resolverCaso`).
 */
export const MENSAJES_LARGOS: readonly string[] = [
  'ESTE MENSAJE SE ENTREGA EN LA PUERTA DEL GIMNASIO',
  'NOS VEMOS EN LA ENTRADA DEL MUSEO ANTES DE LAS SIETE',
  'EL EQUIPO QUE ENCUENTRE ESTE MENSAJE GANA EL PRIMER PREMIO',
  'LA RESPUESTA SE ESCONDE DEBAJO DE LA SEGUNDA PIEDRA DEL CAMINO',
  'QUIEN LEA ESTE MENSAJE DEBE ESPERAR EN EL PUENTE',
];

const TIPOS_PRACTICA: readonly TipoPregunta[] = [
  'cifrar',
  'cifrar',
  'descifrar',
  'descifrar',
  'hallar-clave',
  'clave-inversa',
  'composicion',
  'sin-clave-texto',
  'sin-clave-clave',
];

/** El enunciado genérico de cada tipo, para el modo práctica. */
function enunciadoPractica(datos: DatosCaso): string {
  const c = criptogramaDe(datos);
  switch (datos.tipo) {
    case 'cifrar':
      return `Cifra ${datos.mensaje} con la clave k = ${datos.clave}.`;
    case 'descifrar':
      return `Este criptograma se cifró con la clave k = ${datos.clave}: ${c}. Descífralo.`;
    case 'hallar-clave':
      return `Con el cifrado César, ${datos.mensaje} se ha convertido en ${c}. ¿Cuál es la clave k?`;
    case 'clave-inversa':
      return `Un mensaje se ha cifrado con k = ${datos.clave}. ¿Con qué clave, de 1 a 25, hay que cifrarlo otra vez para recuperar el original?`;
    case 'composicion':
      return `Se cifra un mensaje con k = ${datos.clave} y el resultado otra vez con k = ${datos.clave2 ?? ''}. ¿Qué clave única, de 0 a 25, hace lo mismo en un solo paso?`;
    case 'sin-clave-texto':
      return `Descifra sin conocer la clave, por análisis de frecuencias, este criptograma en español: «${c}».`;
    case 'sin-clave-clave':
      return `Averigua, por análisis de frecuencias, con qué clave k se cifró este criptograma en español: «${c}».`;
    default:
      return '';
  }
}

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  forma: FormaRespuesta;
  etiquetaRespuesta: string;
  respuesta: string | number;
  sinonimos: readonly string[];
  trampas: readonly Trampa[];
  respuestaTexto: string;
  pasos: string[];
  comoComprobar: string;
}

/**
 * Ejercicio aleatorio de cualquiera de los siete tipos. Usa EL MISMO `resolverCaso` que los doce
 * fijos, y por tanto el mismo motor que la rueda: si divergieran, el alumno entrenaría con una
 * regla y sería corregido con otra. Si unos datos no se pudieran resolver (no debería pasar con
 * estas listas), se prueba la semilla siguiente, hasta 50 veces.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  for (let intento = 0; intento < 50; intento++) {
    const rnd = aleatorioCon(semilla + intento);
    const tipo = elegir(TIPOS_PRACTICA, rnd);
    const largo = tipo === 'sin-clave-texto' || tipo === 'sin-clave-clave';
    const mensaje = elegir(largo ? MENSAJES_LARGOS : MENSAJES_CORTOS, rnd);
    let clave = entre(1, 25, rnd);
    let clave2: number | undefined;
    if (tipo === 'composicion') {
      // Que la suma pase de 25 la mitad de las veces: es lo que ejercita la vuelta de la rueda.
      clave = entre(2, 24, rnd);
      clave2 = entre(1, 25, rnd);
      if (clave + clave2 === 26) clave2 = clave2 === 25 ? 24 : clave2 + 1;
    }
    const datos: DatosCaso = clave2 === undefined ? { tipo, mensaje, clave } : { tipo, mensaje, clave, clave2 };
    const r = resolverCaso(datos);
    if (!r.ok) continue;
    return {
      semilla,
      enunciado: conAviso(enunciadoPractica(datos), datos),
      datos,
      forma: r.forma,
      etiquetaRespuesta: etiquetaDe(datos),
      respuesta: r.valor,
      sinonimos: [],
      trampas: r.trampas,
      respuestaTexto: textoRespuesta(r.forma, r.valor),
      pasos: r.pasos,
      comoComprobar: comoComprobarDe(datos),
    };
  }
  // Inalcanzable con estas listas; se devuelve un ejercicio fijo antes que lanzar.
  const datos: DatosCaso = { tipo: 'cifrar', mensaje: 'GATO', clave: 3 };
  const r = resolverCaso(datos);
  return {
    semilla,
    enunciado: conAviso(enunciadoPractica(datos), datos),
    datos,
    forma: r.forma,
    etiquetaRespuesta: etiquetaDe(datos),
    respuesta: r.valor,
    sinonimos: [],
    trampas: r.trampas,
    respuestaTexto: textoRespuesta(r.forma, r.valor),
    pasos: r.pasos,
    comoComprobar: comoComprobarDe(datos),
  };
}

/** Las letras del alfabeto de 27, reexportadas para quien quiera comprobar el aviso en un test. */
export { ALFABETO_27, cifrarConAlfabeto27, claveEntre27, normalizarMensaje };

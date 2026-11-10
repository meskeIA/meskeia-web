/**
 * Casos para clase — la tarea asignable de `simulador-ley-coulomb`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA FÍSICA NO SE REPLICA AQUÍ ──────────────────────────────────────────────
 *
 * Todo número sale de `./motor.ts`, el MISMO módulo con que calcula la página: `fuerzaCoulomb`,
 * `distanciaParaFuerza`, `cargaParaFuerza`, `cargaIgualParaFuerza`, `factorDeFuerza` y
 * `factorDeDistanciaParaIgualFuerza`. Si la corrección y la calculadora calculasen cada una a su
 * manera, la app podría suspender una respuesta que ella misma acaba de enseñar.
 *
 * Los casos NO son los de `simulador-campo-electrico`, aunque compartan k: allí se mide un campo
 * en un punto del plano y aquí la fuerza entre dos cargas, con sus despejes y sus «¿qué pasa
 * si…?». Copiarlos sería ofrecer dos veces la misma tarea con dos correctores.
 *
 * ── EL CONVENIO DE ESTA APP (fijado por escrito) ──────────────────────────────
 *
 * · k = 8,99·10⁹ N·m²/C², el de la app. Muchos libros usan 9·10⁹: la diferencia es del 0,11 %
 *   y cabe en la tolerancia del 1 %, pero CADA ENUNCIADO QUE USA k LO DECLARA. Los de
 *   proporcionalidad («¿por cuánto queda multiplicada…?») no la declaran porque se cancela.
 * · El caso del hidrógeno declara e = 1,60·10⁻¹⁹ C y calcula con ESE valor, no con el exacto
 *   del SI (1,602…): el alumno usará el del enunciado. El de levitación declara g = 9,8 m/s².
 * · Todas las respuestas son MÓDULOS o factores: positivas. Un negativo se rechaza con su motivo.
 * · Unidades elegidas para que ninguna respuesta haya que teclearla con exponente
 *   (`parseSpanishNumber` devuelve NaN con «8e-8»): por eso el hidrógeno se pide en nN y las
 *   esferas frotadas en mN.
 * · Respuesta con dos decimales; si la cifra exacta tiene más, el enunciado dice «redondea».
 *
 * Nada lanza excepciones: los datos imposibles devuelven `{ ok: false, error }` y un NaN.
 */

import { formatNumber } from '@/lib';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  toleranciaRelativa,
} from '@/lib/calculadoras/correctorCasosAula';
import {
  K_COULOMB,
  cargaIgualParaFuerza,
  cargaParaFuerza,
  distanciaParaFuerza,
  factorDeDistanciaParaIgualFuerza,
  factorDeFuerza,
  fuerzaCoulomb,
} from './motor';
import { mantisaYExponente, superindice } from './formato';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/**
 * Qué se pide:
 *   fuerza            |F| a partir de q₁, q₂, r y εr
 *   distancia         r a partir de q₁, q₂ y |F|
 *   carga             |q₂| a partir de q₁, r y |F|
 *   carga-igual       |q| de dos cargas iguales a partir de r y |F|
 *   factor-fuerza     F'/F cuando q₁ ×a, q₂ ×b y r ×c
 *   factor-distancia  por cuánto multiplicar r para que F no cambie cuando q₁ ×a y q₂ ×b
 */
export type Pregunta = 'fuerza' | 'distancia' | 'carga' | 'carga-igual' | 'factor-fuerza' | 'factor-distancia';

/** Unidad en la que se pide la respuesta: cuántas unidades del SI vale una. */
export interface UnidadRespuesta {
  simbolo: string;
  factor: number;
}

export interface DatosCaso {
  pregunta: Pregunta;
  /** Cargas en culombios, con signo. */
  q1?: number;
  q2?: number;
  /** Distancia en metros. */
  r?: number;
  /** Módulo de la fuerza en newtons, para los despejes. */
  F?: number;
  /** Permitividad relativa del medio. Por defecto, 1 (vacío). */
  epsR?: number;
  /** Multiplicadores de q₁, q₂ y r en los casos de proporcionalidad. */
  a?: number;
  b?: number;
  c?: number;
  /** Unidad de la respuesta. Sin ella, la del SI de la magnitud. */
  unidad: UnidadRespuesta;
  /** El enunciado da la distancia en centímetros: activa el aviso de «no la has pasado a metros». */
  distanciaEnCm?: boolean;
}

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta. */
  valor: number;
  pasos: string[];
  error?: string;
}

/* ─────────────────────────── Formato ─────────────────────────── */

const DECIMALES = 2;

/** Cifra española con los decimales que de verdad tiene, hasta `max`: «0,3», «29,98», «4». */
function cifra(n: number, max = 4): string {
  if (!Number.isFinite(n)) return '—';
  const v = Math.abs(n) < 1e-12 ? 0 : n;
  let d = 0;
  while (d < max && Math.abs(redondearA(v, d) - v) > 1e-9 * Math.max(1, Math.abs(v))) d += 1;
  return formatNumber(v, d);
}

/**
 * Notación científica sin ceros de relleno: «2 × 10⁻⁶», «8,193 × 10⁻⁸». Hasta 4 cifras
 * significativas, que es lo que se arrastra en los pasos intermedios. Valores entre 0,01 y
 * 10.000 se escriben como decimal corriente.
 */
function sci(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  const signo = n < 0 ? '−' : '';
  if (abs >= 0.01 && abs < 1e4) return signo + cifra(abs, 4);
  const { mantisa, exponente } = mantisaYExponente(abs, 4);
  return `${signo}${cifra(mantisa, 3)} × 10${superindice(exponente)}`;
}

/** Un valor al cuadrado: con paréntesis si va en notación científica, «(5,3 × 10⁻¹¹)²». */
function cuadrado(n: number): string {
  const s = sci(n);
  return s.includes('×') ? `(${s})²` : `${s}²`;
}

/** Carga con signo explícito, en culombios: «+2 × 10⁻⁶ C». */
function textoCargaSI(q: number): string {
  return `${q < 0 ? '' : '+'}${sci(q)} C`;
}

const K_SCI = '8,99 × 10⁹';

/** El resultado con su unidad y dos decimales: «0,60 N». Sin unidad, la cifra sola. */
export function textoRespuesta(valor: number, unidad: UnidadRespuesta): string {
  if (!Number.isFinite(valor)) return '—';
  const n = formatNumber(valor, DECIMALES);
  return unidad.simbolo ? `${n} ${unidad.simbolo}` : n;
}

const NOMBRE: Record<Pregunta, string> = {
  fuerza: '|F|',
  distancia: 'r',
  carga: '|q₂|',
  'carga-igual': '|q|',
  'factor-fuerza': "F'/F",
  'factor-distancia': "r'/r",
};

/** Qué se escribe en la casilla. Nunca vacía. */
export function etiquetaDe(datos: DatosCaso): string {
  const u = datos.unidad.simbolo;
  switch (datos.pregunta) {
    case 'fuerza':
      return `Módulo de la fuerza, en ${u}`;
    case 'distancia':
      return `Distancia, en ${u}`;
    case 'carga':
      return `Valor de la carga (sin signo), en ${u}`;
    case 'carga-igual':
      return `Valor de cada carga (sin signo), en ${u}`;
    case 'factor-fuerza':
      return 'Factor por el que queda multiplicada la fuerza (sin unidad)';
    case 'factor-distancia':
      return 'Factor por el que hay que multiplicar la distancia (sin unidad)';
  }
}

/* ─────────────────────────── Resolución ─────────────────────────── */

function noResuelto(error: string): Resolucion {
  return { ok: false, valor: NaN, pasos: [], error };
}

function pasoMedio(epsR: number): string {
  return epsR === 1 ? '' : ` · εr = ${cifra(epsR)}`;
}

function formula(epsR: number): string {
  return epsR === 1 ? 'k·|q₁·q₂| / r²' : 'k·|q₁·q₂| / (εr·r²)';
}

/** El paso que pasa del SI a la unidad pedida, si son distintas. */
function pasoUnidad(valorSI: number, siSimbolo: string, unidad: UnidadRespuesta): string | null {
  if (unidad.factor === 1) return null;
  return `En ${unidad.simbolo}: ${sci(valorSI)} ${siSimbolo} ÷ ${sci(unidad.factor)} = ${cifra(valorSI / unidad.factor)} ${unidad.simbolo}.`;
}

function pasoFinal(valor: number, datos: DatosCaso): string {
  const texto = textoRespuesta(redondearA(valor, DECIMALES), datos.unidad);
  return exigeRedondeo(valor, DECIMALES)
    ? `Redondeando a ${DECIMALES} decimales: ${NOMBRE[datos.pregunta]} = ${texto}.`
    : `Resultado: ${NOMBRE[datos.pregunta]} = ${texto}.`;
}

/**
 * Resuelve el caso desde sus datos, sin mirar la respuesta guardada. Lo usa la corrección, el
 * modo práctica y el test que comprueba que cada respuesta declarada es la que sale de `datos`.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const epsR = datos.epsR ?? 1;
  const pasos: string[] = [];
  const u = datos.unidad;

  switch (datos.pregunta) {
    case 'fuerza': {
      const { q1, q2, r } = datos;
      if (q1 === undefined || q2 === undefined || r === undefined) return noResuelto('Faltan datos del caso.');
      const res = fuerzaCoulomb(q1, q2, r, epsR);
      if (!res.ok) return noResuelto(res.error ?? 'Datos imposibles.');
      pasos.push(`Datos en el SI: q₁ = ${textoCargaSI(q1)} · q₂ = ${textoCargaSI(q2)} · r = ${sci(r)} m${pasoMedio(epsR)}.`);
      pasos.push(`Ley de Coulomb: F = ${formula(epsR)}, con k = ${K_SCI} N·m²/C².`);
      const den = epsR === 1 ? cuadrado(r) : `(${cifra(epsR)} · ${cuadrado(r)})`;
      pasos.push(`F = ${K_SCI} · ${sci(Math.abs(q1 * q2))} / ${den} = ${sci(res.modulo)} N.`);
      pasos.push(
        res.tipo === 'repulsion'
          ? 'Las dos cargas tienen el mismo signo: se REPELEN.'
          : 'Las cargas tienen signos contrarios: se ATRAEN.',
      );
      const pu = pasoUnidad(res.modulo, 'N', u);
      if (pu) pasos.push(pu);
      const valor = res.modulo / u.factor;
      pasos.push(pasoFinal(valor, datos));
      return { ok: true, valor, pasos };
    }

    case 'distancia': {
      const { q1, q2, F } = datos;
      if (q1 === undefined || q2 === undefined || F === undefined) return noResuelto('Faltan datos del caso.');
      const r = distanciaParaFuerza(q1, q2, F, epsR);
      if (!Number.isFinite(r)) return noResuelto('Con esos datos no hay ninguna distancia que dé esa fuerza.');
      pasos.push(`Datos en el SI: q₁ = ${textoCargaSI(q1)} · q₂ = ${textoCargaSI(q2)} · |F| = ${sci(F)} N${pasoMedio(epsR)}.`);
      pasos.push(`Se despeja r de F = ${formula(epsR)}: r = √(k·|q₁·q₂| / ${epsR === 1 ? 'F' : '(εr·F)'}).`);
      const numerador = K_COULOMB * Math.abs(q1 * q2);
      const denominador = epsR * F;
      pasos.push(`r² = ${K_SCI} · ${sci(Math.abs(q1 * q2))} / ${sci(denominador)} = ${sci(numerador / denominador)} m².`);
      pasos.push(`r = √${sci(numerador / denominador)} = ${sci(r)} m.`);
      const pu = pasoUnidad(r, 'm', u);
      if (pu) pasos.push(pu);
      const valor = r / u.factor;
      pasos.push(pasoFinal(valor, datos));
      return { ok: true, valor, pasos };
    }

    case 'carga': {
      const { q1, r, F } = datos;
      if (q1 === undefined || r === undefined || F === undefined) return noResuelto('Faltan datos del caso.');
      const q = cargaParaFuerza(q1, F, r, epsR);
      if (!Number.isFinite(q)) return noResuelto('Con esos datos no hay ninguna carga que dé esa fuerza.');
      pasos.push(`Datos en el SI: q₁ = ${textoCargaSI(q1)} · r = ${sci(r)} m · |F| = ${sci(F)} N${pasoMedio(epsR)}.`);
      pasos.push(`Se despeja q₂ de F = ${formula(epsR)}: |q₂| = ${epsR === 1 ? 'F·r²' : 'F·εr·r²'} / (k·|q₁|).`);
      pasos.push(
        `|q₂| = ${sci(F)} · ${epsR === 1 ? '' : `${cifra(epsR)} · `}${cuadrado(r)} / (${K_SCI} · ${sci(Math.abs(q1))}) = ${sci(q)} C.`,
      );
      const pu = pasoUnidad(q, 'C', u);
      if (pu) pasos.push(pu);
      const valor = q / u.factor;
      pasos.push(pasoFinal(valor, datos));
      return { ok: true, valor, pasos };
    }

    case 'carga-igual': {
      const { r, F } = datos;
      if (r === undefined || F === undefined) return noResuelto('Faltan datos del caso.');
      const q = cargaIgualParaFuerza(F, r, epsR);
      if (!Number.isFinite(q)) return noResuelto('Con esos datos no hay ninguna carga que dé esa fuerza.');
      pasos.push(`Datos en el SI: r = ${sci(r)} m · |F| = ${sci(F)} N${pasoMedio(epsR)}.`);
      pasos.push(`Con q₁ = q₂ = q, la ley queda F = k·q² / ${epsR === 1 ? 'r²' : '(εr·r²)'}, así que |q| = r·√(${epsR === 1 ? 'F' : 'F·εr'} / k).`);
      pasos.push(`|q| = ${sci(r)} · √(${sci(F * epsR)} / ${K_SCI}) = ${sci(r)} · √${sci((F * epsR) / K_COULOMB)} = ${sci(q)} C.`);
      const pu = pasoUnidad(q, 'C', u);
      if (pu) pasos.push(pu);
      const valor = q / u.factor;
      pasos.push(pasoFinal(valor, datos));
      return { ok: true, valor, pasos };
    }

    case 'factor-fuerza': {
      const a = datos.a ?? 1;
      const b = datos.b ?? 1;
      const c = datos.c ?? 1;
      const valor = factorDeFuerza(a, b, c);
      if (!Number.isFinite(valor)) return noResuelto('La distancia no puede multiplicarse por cero ni por un negativo.');
      pasos.push('La fuerza es proporcional al producto de las cargas e inversamente proporcional al CUADRADO de la distancia: F ∝ q₁·q₂ / r².');
      pasos.push(`F'/F = (${cifra(a)} · ${cifra(b)}) / ${cifra(c)}² = ${cifra(Math.abs(a * b))} / ${cifra(c * c)} = ${cifra(valor)}.`);
      pasos.push('k y el medio no cambian, así que se cancelan: no hace falta conocer las cargas.');
      pasos.push(pasoFinal(valor, datos));
      return { ok: true, valor, pasos };
    }

    case 'factor-distancia': {
      const a = datos.a ?? 1;
      const b = datos.b ?? 1;
      const valor = factorDeDistanciaParaIgualFuerza(a, b);
      if (!Number.isFinite(valor)) return noResuelto('Si una carga se anula, la fuerza desaparece a cualquier distancia.');
      pasos.push(`El producto de las cargas queda multiplicado por ${cifra(a)} · ${cifra(b)} = ${cifra(Math.abs(a * b))}.`);
      pasos.push(`Para compensarlo, r² tiene que multiplicarse por lo mismo: r'/r = √${cifra(Math.abs(a * b))} = ${cifra(valor)}.`);
      pasos.push(pasoFinal(valor, datos));
      return { ok: true, valor, pasos };
    }
  }
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: absorbe la k = 9·10⁹ de muchos libros (0,11 %). */
export function toleranciaDe(valor: number): number {
  return toleranciaRelativa(valor);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza. Reconoce por su nombre los errores típicos del
 * tema: dividir entre r en vez de entre r², dejar la distancia en centímetros, olvidar la raíz al
 * despejar r y poner signo a un módulo.
 */
export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  // Todas las respuestas son módulos o factores continuos: dentro de la tolerancia ningún valor
  // positivo es imposible. El negativo se mira aparte con su propio aviso, porque el intervalo
  // del corrector compartido necesita un máximo y un módulo no lo tiene.
  const c = corregirNumero(usuario, esperado, { tolerancia: toleranciaDe(esperado), magnitud: 'real' });
  const { diferencia, tolerancia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal).', diferencia: NaN, tolerancia };
  }

  if (usuario < 0) {
    return {
      correcto: false,
      motivo:
        datos.pregunta === 'factor-fuerza' || datos.pregunta === 'factor-distancia'
          ? 'Un factor de proporcionalidad no puede ser negativo: escribe por cuánto se multiplica.'
          : 'Se pide un valor sin signo (un módulo): si se atraen o se repelen lo dicen los signos de las cargas, no esta cifra.',
      diferencia,
      tolerancia,
    };
  }

  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };

  const cerca = (alternativa: number) =>
    Number.isFinite(alternativa) &&
    !dentroDeTolerancia(alternativa, esperado, tolerancia) &&
    dentroDeTolerancia(usuario, alternativa, toleranciaDe(alternativa));

  const r = datos.r;
  if (datos.pregunta === 'fuerza' && r !== undefined) {
    // k·|q₁q₂|/r en lugar de /r²: la cifra queda multiplicada por r (en metros).
    if (cerca(esperado * r)) {
      return {
        correcto: false,
        motivo: 'Parece que has dividido entre r y no entre r²: la fuerza va con el CUADRADO de la distancia.',
        diferencia,
        tolerancia,
      };
    }
    // r en centímetros sin pasar a metros: r² sale 10⁴ veces mayor y la fuerza 10⁴ veces menor.
    if (datos.distanciaEnCm && cerca(esperado / 1e4)) {
      return {
        correcto: false,
        motivo: 'La cifra es 10.000 veces menor de lo que toca: ¿has dejado la distancia en centímetros? Pásala a metros antes de elevarla al cuadrado.',
        diferencia,
        tolerancia,
      };
    }
  }

  if (datos.pregunta === 'factor-fuerza') {
    const sinCuadrado = Math.abs((datos.a ?? 1) * (datos.b ?? 1)) / (datos.c ?? 1);
    if (cerca(sinCuadrado)) {
      return {
        correcto: false,
        motivo: 'Has dividido entre el factor de la distancia, no entre su CUADRADO: si r se duplica, F se divide entre 4.',
        diferencia,
        tolerancia,
      };
    }
  }

  if (datos.pregunta === 'factor-distancia' && cerca(esperado * esperado)) {
    return {
      correcto: false,
      motivo: 'Eso es lo que tiene que crecer r², no r: falta sacar la raíz cuadrada.',
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${cifra(diferencia, 2)} de la respuesta.`,
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
  /** Calculada por el motor desde `datos` y redondeada a dos decimales. JAMÁS escrita a mano. */
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

const K_TEXTO = 'Usa k = 8,99·10⁹ N·m²/C².';

const N: UnidadRespuesta = { simbolo: 'N', factor: 1 };
const MN: UnidadRespuesta = { simbolo: 'mN', factor: 1e-3 };
const NN: UnidadRespuesta = { simbolo: 'nN', factor: 1e-9 };
const CM: UnidadRespuesta = { simbolo: 'cm', factor: 1e-2 };
const UC: UnidadRespuesta = { simbolo: 'µC', factor: 1e-6 };
const SIN_UNIDAD: UnidadRespuesta = { simbolo: '', factor: 1 };

const MICRO = 1e-6;
const NANO = 1e-9;

/** Carga elemental del enunciado del hidrógeno: la de los libros, no la exacta del SI. */
const E_LIBRO = 1.6e-19;

interface DefinicionCaso {
  titulo: string;
  categoria: 'abstracto' | 'aplicado';
  /** Enunciado sin la frase de redondeo, que se añade sola si hace falta. */
  enunciado: string;
  datos: DatosCaso;
  pista: string;
}

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    titulo: 'Dos cargas del mismo signo',
    categoria: 'abstracto',
    enunciado: `Dos cargas puntuales de +2 µC y +3 µC están en el vacío, separadas 0,3 m. ¿Cuál es el módulo de la fuerza que se ejercen, en newtons? ${K_TEXTO}`,
    datos: { pregunta: 'fuerza', q1: 2 * MICRO, q2: 3 * MICRO, r: 0.3, unidad: N },
    pista: 'Pasa los microcoulombios a culombios (1 µC = 10⁻⁶ C) y no olvides elevar la distancia al cuadrado.',
  },
  {
    titulo: 'Atracción a 20 cm',
    categoria: 'abstracto',
    enunciado: `Una carga de +4 µC y otra de −5 µC están en el vacío a 20 cm una de otra. ¿Cuál es el módulo de la fuerza con que se atraen, en newtons? ${K_TEXTO}`,
    datos: { pregunta: 'fuerza', q1: 4 * MICRO, q2: -5 * MICRO, r: 0.2, unidad: N, distanciaEnCm: true },
    pista: 'La distancia, en metros: 20 cm = 0,2 m. El signo solo dice que se atraen; el módulo se calcula con los valores sin signo.',
  },
  {
    titulo: '¿A qué distancia están?',
    categoria: 'abstracto',
    enunciado: `Dos cargas iguales de +3 µC se repelen en el vacío con una fuerza de 0,9 N. ¿A qué distancia están, en centímetros? ${K_TEXTO}`,
    datos: { pregunta: 'distancia', q1: 3 * MICRO, q2: 3 * MICRO, F: 0.9, unidad: CM },
    pista: 'Despeja r² = k·q₁·q₂ / F, saca la raíz y pasa los metros a centímetros.',
  },
  {
    titulo: 'La carga que falta',
    categoria: 'abstracto',
    enunciado: `Una carga de +2 µC repele con una fuerza de 0,36 N a otra carga situada a 0,5 m en el vacío. ¿Cuánto vale esa otra carga, sin signo, en microcoulombios? ${K_TEXTO}`,
    datos: { pregunta: 'carga', q1: 2 * MICRO, r: 0.5, F: 0.36, unidad: UC },
    pista: 'Despeja q₂ = F·r² / (k·q₁). El resultado sale en culombios: multiplícalo por 10⁶ para pasarlo a µC.',
  },
  {
    titulo: 'Doble de distancia',
    categoria: 'abstracto',
    enunciado:
      'Dos cargas se ejercen una fuerza F. Sin cambiar las cargas, se separan hasta el DOBLE de distancia. ¿Por qué número queda multiplicada la fuerza?',
    datos: { pregunta: 'factor-fuerza', a: 1, b: 1, c: 2, unidad: SIN_UNIDAD },
    pista: 'F va con 1/r². Si r se multiplica por 2, r² se multiplica por 4.',
  },
  {
    titulo: 'Cargas dobles, distancia triple',
    categoria: 'abstracto',
    enunciado:
      'Las dos cargas de un par se duplican y, a la vez, la distancia entre ellas se triplica. ¿Por qué número queda multiplicada la fuerza entre ellas?',
    datos: { pregunta: 'factor-fuerza', a: 2, b: 2, c: 3, unidad: SIN_UNIDAD },
    pista: 'El numerador crece 2 · 2 veces y el denominador, 3² veces.',
  },
  {
    titulo: 'El átomo de hidrógeno',
    categoria: 'aplicado',
    enunciado: `En el átomo de hidrógeno, el protón y el electrón están separados unos 5,3·10⁻¹¹ m. Cada uno tiene una carga de valor e = 1,60·10⁻¹⁹ C (positiva el protón, negativa el electrón). ¿Cuál es el módulo de la fuerza con que se atraen, en nanonewtons (1 nN = 10⁻⁹ N)? ${K_TEXTO}`,
    datos: { pregunta: 'fuerza', q1: E_LIBRO, q2: -E_LIBRO, r: 5.3e-11, unidad: NN },
    pista: 'Trabaja con potencias de diez: (1,60·10⁻¹⁹)² = 2,56·10⁻³⁸ y (5,3·10⁻¹¹)² = 2,809·10⁻²¹.',
  },
  {
    titulo: 'Sumergidas en aceite',
    categoria: 'aplicado',
    enunciado: `Dos esferas pequeñas con cargas de +2 µC y −2 µC están dentro de un aceite de permitividad relativa εr = 2,5, separadas 10 cm. ¿Cuál es el módulo de la fuerza entre ellas, en newtons? ${K_TEXTO}`,
    datos: { pregunta: 'fuerza', q1: 2 * MICRO, q2: -2 * MICRO, r: 0.1, epsR: 2.5, unidad: N, distanciaEnCm: true },
    pista: 'En un medio, la fuerza del vacío se divide entre εr: F = k·|q₁·q₂| / (εr·r²).',
  },
  {
    titulo: 'Dos esferas frotadas',
    categoria: 'aplicado',
    enunciado: `Dos esferas metálicas pequeñas se cargan por frotamiento con −40 nC cada una y quedan a 2 cm de distancia, en el aire (tómalo como vacío). ¿Con qué fuerza se repelen, en milinewtons? ${K_TEXTO}`,
    datos: { pregunta: 'fuerza', q1: -40 * NANO, q2: -40 * NANO, r: 0.02, unidad: MN, distanciaEnCm: true },
    pista: '1 nC = 10⁻⁹ C y 2 cm = 0,02 m. El resultado en newtons se multiplica por 1000 para tenerlo en mN.',
  },
  {
    titulo: 'Una esfera que levita',
    categoria: 'aplicado',
    enunciado: `Una esfera de 0,5 g con una carga de +50 nC se sostiene en el aire, sin caer, justo encima de otra carga fija de +50 nC. ¿A qué distancia por encima queda en equilibrio, en centímetros? Toma g = 9,8 m/s² y el aire como vacío. ${K_TEXTO}`,
    datos: { pregunta: 'distancia', q1: 50 * NANO, q2: 50 * NANO, F: 0.0005 * 9.8, unidad: CM },
    pista: 'En equilibrio, la repulsión iguala al peso: k·q₁·q₂ / r² = m·g, con la masa en kilogramos (0,5 g = 0,0005 kg).',
  },
  {
    titulo: 'Dos cargas iguales',
    categoria: 'abstracto',
    enunciado: `Dos cargas iguales situadas a 1 m en el vacío se repelen con una fuerza de 0,0899 N. ¿Cuánto vale cada carga, sin signo, en microcoulombios? ${K_TEXTO}`,
    datos: { pregunta: 'carga-igual', r: 1, F: 0.0899, unidad: UC },
    pista: 'Con q₁ = q₂ = q, la ley queda F = k·q²/r². Despeja q² y saca la raíz.',
  },
  {
    titulo: 'Misma fuerza con más carga',
    categoria: 'abstracto',
    enunciado:
      'Una de las dos cargas de un par se multiplica por 9 y la otra no cambia. ¿Por qué número hay que multiplicar la distancia para que la fuerza siga siendo la misma?',
    datos: { pregunta: 'factor-distancia', a: 9, b: 1, unidad: SIN_UNIDAD },
    pista: 'Si el producto de las cargas se multiplica por 9, r² tiene que multiplicarse también por 9.',
  },
];

export const CASOS: readonly Caso[] = DEFINICIONES.map((def, i) => {
  const r = resolverCaso(def.datos);
  const requiereRedondeo = r.ok && exigeRedondeo(r.valor, DECIMALES);
  const respuesta = r.ok ? redondearA(r.valor, DECIMALES) : NaN;
  return {
    id: i + 1,
    titulo: def.titulo,
    enunciado: requiereRedondeo ? `${def.enunciado} Redondea a dos decimales.` : def.enunciado,
    categoria: def.categoria,
    datos: def.datos,
    etiquetaRespuesta: etiquetaDe(def.datos),
    respuesta,
    respuestaTexto: textoRespuesta(respuesta, def.datos.unidad),
    requiereRedondeo,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
    pista: def.pista,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando un xorshift directamente con
 * 1, 2, 3… los primeros valores salen diminutos y parecidos, y `Math.floor(rnd() * n)` devuelve
 * el índice 0 con todas las semillas pequeñas: reproducible pero siempre el mismo ejercicio
 * (simulador-genetica, 14/09/2026).
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
  requiereRedondeo: boolean;
  pasos: string[];
}

const CARGAS_UC = [1, 2, 3, 4, 5, 6, 8] as const;
const DISTANCIAS_CM = [5, 10, 20, 25, 40, 50] as const;
const MULTIPLICADORES = [2, 3, 4] as const;
const TIPOS = ['fuerza', 'distancia', 'carga', 'factor-fuerza'] as const;

/** Suelo y techo de la respuesta: por debajo de 0,1 el margen mínimo de 0,01 es un 10 %, y por encima de 10⁴ el enunciado deja de ser de aula. */
const RESPUESTA_MINIMA = 0.1;
const RESPUESTA_MAXIMA = 1e4;

function textoCargaUC(q: number): string {
  return `${q < 0 ? '−' : '+'}${cifra(Math.abs(q) / MICRO)} µC`;
}

/** Una fuerza con tres cifras significativas, como la daría un enunciado: «0,899 N», «1,44 N». */
function fuerzaRedondeada(F: number): number {
  const decimales = Math.max(0, 2 - Math.floor(Math.log10(F)));
  return redondearA(F, decimales);
}

/**
 * Ejercicio aleatorio de fuerza, distancia, carga o proporcionalidad. Usa EL MISMO
 * `resolverCaso` que los doce fijos. Si una combinación da una respuesta fuera de
 * [0,1; 10.000] se sigue sacando de la misma secuencia: el resultado sigue dependiendo solo de
 * la semilla.
 */
export function generarEjercicioAleatorio(semilla = 1): Ejercicio {
  const rnd = aleatorioCon(semilla);
  for (let intento = 0; intento < 50; intento += 1) {
    const tipo = elegir(rnd, TIPOS);
    const signo1 = rnd() < 0.5 ? -1 : 1;
    const signo2 = rnd() < 0.5 ? -1 : 1;
    const q1 = signo1 * elegir(rnd, CARGAS_UC) * MICRO;
    const q2 = signo2 * elegir(rnd, CARGAS_UC) * MICRO;
    const rCm = elegir(rnd, DISTANCIAS_CM);
    const r = rCm / 100;
    const relacion = q1 * q2 > 0 ? 'se repelen' : 'se atraen';

    let datos: DatosCaso;
    let enunciado: string;
    switch (tipo) {
      case 'fuerza':
        datos = { pregunta: 'fuerza', q1, q2, r, unidad: N, distanciaEnCm: true };
        enunciado = `Una carga de ${textoCargaUC(q1)} y otra de ${textoCargaUC(q2)} están en el vacío a ${cifra(rCm)} cm. ¿Cuál es el módulo de la fuerza entre ellas, en newtons? ${K_TEXTO}`;
        break;
      case 'distancia': {
        const F = fuerzaRedondeada(fuerzaCoulomb(q1, q2, r).modulo);
        datos = { pregunta: 'distancia', q1, q2, F, unidad: CM };
        enunciado = `Una carga de ${textoCargaUC(q1)} y otra de ${textoCargaUC(q2)} ${relacion} en el vacío con una fuerza de ${cifra(F)} N. ¿A qué distancia están, en centímetros? ${K_TEXTO}`;
        break;
      }
      case 'carga': {
        const F = fuerzaRedondeada(fuerzaCoulomb(q1, q2, r).modulo);
        datos = { pregunta: 'carga', q1, r, F, unidad: UC };
        enunciado = `Una carga de ${textoCargaUC(q1)} y otra carga desconocida ${relacion} en el vacío con una fuerza de ${cifra(F)} N a ${cifra(rCm)} cm de distancia. ¿Cuánto vale la carga desconocida, sin signo, en microcoulombios? ${K_TEXTO}`;
        break;
      }
      case 'factor-fuerza':
      default: {
        const a = elegir(rnd, MULTIPLICADORES);
        const b = rnd() < 0.5 ? 1 : elegir(rnd, MULTIPLICADORES);
        const c = elegir(rnd, MULTIPLICADORES);
        datos = { pregunta: 'factor-fuerza', a, b, c, unidad: SIN_UNIDAD };
        const cambioCargas = b === 1 ? `una de las cargas se multiplica por ${a}` : `una carga se multiplica por ${a} y la otra por ${b}`;
        enunciado = `En un par de cargas, ${cambioCargas}, y la distancia entre ellas se multiplica por ${c}. ¿Por qué número queda multiplicada la fuerza?`;
        break;
      }
    }

    const res = resolverCaso(datos);
    if (!res.ok || res.valor < RESPUESTA_MINIMA || res.valor > RESPUESTA_MAXIMA) continue;
    const requiereRedondeo = exigeRedondeo(res.valor, DECIMALES);
    return {
      semilla,
      enunciado: requiereRedondeo ? `${enunciado} Redondea a dos decimales.` : enunciado,
      datos,
      respuesta: redondearA(res.valor, DECIMALES),
      etiquetaRespuesta: etiquetaDe(datos),
      requiereRedondeo,
      pasos: res.pasos,
    };
  }
  // No se llega aquí con las listas de arriba (lo comprueba el test), pero sin throw: el primer caso fijo.
  const caso = CASOS[0];
  return {
    semilla,
    enunciado: caso.enunciado,
    datos: caso.datos,
    respuesta: caso.respuesta,
    etiquetaRespuesta: caso.etiquetaRespuesta,
    requiereRedondeo: caso.requiereRedondeo,
    pasos: caso.pasos,
  };
}

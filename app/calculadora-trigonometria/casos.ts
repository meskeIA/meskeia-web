/**
 * Casos numerados de la Calculadora de Trigonometría.
 *
 * Vive fuera de `page.tsx` a propósito. El build compila la vista sin mirar si la
 * trigonometría está bien: una página que devuelve sen 30° = 0,866 compila exactamente
 * igual de limpio que una que devuelve 0,5, y el error solo se ve leyendo el número en
 * pantalla. Aquí no hay React, ni DOM, ni estado: solo funciones puras con entradas y
 * salidas comprobables a mano (sen 30° = 0,5 exacto, cos 60° = 0,5, tan 45° = 1,
 * sen 45° = cos 45° = √2/2), que es como se verifican.
 *
 * Cuatro decisiones que no son evidentes leyendo el código:
 *
 * 1. TODO lo público de este módulo habla en GRADOS, porque en grados están los
 *    enunciados de secundaria. `Math.sin` y compañía esperan RADIANES, así que la
 *    conversión es explícita y está en un solo sitio (`gradosARadianes`). El error
 *    clásico —pasarle 30 directamente a `Math.sin` y obtener −0,988— no se detecta
 *    mirando el código, sino comprobando que sen 30° vale 0,5.
 *
 * 2. `page.tsx` importa de aquí esa misma conversión. Antes la tenía duplicada dentro
 *    del componente; con dos copias, corregir una y olvidar la otra no rompe nada
 *    visible, que es justo la forma de fallo que este módulo existe para evitar.
 *
 * 3. Nada lanza excepciones. Un dato imposible (un ángulo de 90° al que se le pide la
 *    tangente, una hipotenusa menor que su cateto) devuelve `ok: false` con un `error`
 *    redactado para el alumno, en lugar de un número inventado o una página en blanco.
 *
 * 4. Los 12 casos se CALCULAN a partir de sus datos, no se teclean. Un caso con la
 *    solución escrita a mano puede contradecir a la fórmula sin que nada se queje, y es
 *    exactamente el fallo que rompería la utilidad del modo Casos: un profesor manda
 *    «resuelve el 3, el 7 y el 11» y la corrección tiene que ser la misma para todos.
 */

import { formatNumber } from '@/lib';

// ============================================================
// TIPOS
// ============================================================

/**
 * Qué se pide en un caso, y con ello qué significan sus `datos`:
 *
 * - `seno` | `coseno` | `tangente`      → [ánguloEnGrados]
 * - `cateto-opuesto`                    → [hipotenusa, ánguloEnGrados]
 * - `cateto-adyacente`                  → [hipotenusa, ánguloEnGrados]
 * - `otro-cateto`                       → [catetoAdyacente, ánguloEnGrados]
 * - `hipotenusa-desde-opuesto`          → [catetoOpuesto, ánguloEnGrados]
 * - `angulo-arcoseno`                   → [catetoOpuesto, hipotenusa]
 * - `angulo-arcocoseno`                 → [catetoAdyacente, hipotenusa]
 * - `angulo-arcotangente`               → [catetoOpuesto, catetoAdyacente]
 */
export type TipoCasoTrig =
  | 'seno'
  | 'coseno'
  | 'tangente'
  | 'cateto-opuesto'
  | 'cateto-adyacente'
  | 'otro-cateto'
  | 'hipotenusa-desde-opuesto'
  | 'angulo-arcoseno'
  | 'angulo-arcocoseno'
  | 'angulo-arcotangente';

/** Resultado de resolver un caso, con los pasos intermedios ya redactados. */
export interface SolucionTrigonometria {
  ok: boolean;
  valor: number;
  pasos: string[];
  error: string | null;
}

/** Un caso numerado, con su solución ya calculada desde `datos`. */
export interface CasoTrigonometria {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  tipo: TipoCasoTrig;
  datos: readonly number[];
  /** Unidad de la RESPUESTA, nunca vacía: `°`, `m`, `cm` o «sin unidad» en las razones. */
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** Ejercicio generado al vuelo: misma forma que un caso, pero sin número fijo. */
export interface EjercicioTrigonometria {
  semilla: number;
  enunciado: string;
  tipo: TipoCasoTrig;
  datos: readonly number[];
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** Veredicto de comprobar la respuesta que ha tecleado quien usa la app. */
export interface ComprobacionTrig {
  correcto: boolean;
  motivo: 'acertado' | 'fallado' | 'no-numerico';
  diferencia: number;
  tolerancia: number;
}

// ============================================================
// CONVERSIÓN DE UNIDADES ANGULARES
// ============================================================

/**
 * Grados → radianes. Es LA conversión de la que depende todo lo demás: `Math.sin(30)`
 * devuelve −0,988 (el seno de 30 radianes), no 0,5. Comprobación de referencia:
 * `Math.sin(gradosARadianes(30))` vale 0,5 salvo el ruido del punto flotante.
 */
export function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/** Radianes → grados. Las funciones inversas de JavaScript devuelven radianes. */
export function radianesAGrados(radianes: number): number {
  return (radianes * 180) / Math.PI;
}

// ============================================================
// AUXILIARES DE FORMATO Y REDONDEO
// ============================================================

/** Redondea a `decimales` para no arrastrar el ruido binario del punto flotante. */
export function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Formatea con los decimales que el número necesita de verdad, hasta un máximo.
 * Así tan 45° se escribe «1» y no «1,0000», pero 31,2435 conserva su precisión.
 */
export function formatearFlexible(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) return formatNumber(valor, d);
  }
  return formatNumber(valor, maxDecimales);
}

/** Etiqueta de las razones trigonométricas: un cociente de dos longitudes no tiene unidad. */
export const UNIDAD_RAZON = 'sin unidad';

/** Une un número con su unidad, sin dejar «0,5 sin unidad» en una frase. */
export function conUnidad(texto: string, etiqueta: string): string {
  return etiqueta === UNIDAD_RAZON ? texto : `${texto} ${etiqueta}`;
}

// ============================================================
// NÚCLEO: LAS RAZONES Y SUS INVERSAS, SIEMPRE EN GRADOS
// ============================================================

/** sen θ con θ en grados. NaN si el ángulo no es un número. */
export function seno(anguloGrados: number): number {
  if (!Number.isFinite(anguloGrados)) return NaN;
  return Math.sin(gradosARadianes(anguloGrados));
}

/** cos θ con θ en grados. NaN si el ángulo no es un número. */
export function coseno(anguloGrados: number): number {
  if (!Number.isFinite(anguloGrados)) return NaN;
  return Math.cos(gradosARadianes(anguloGrados));
}

/**
 * tan θ con θ en grados. Devuelve NaN en 90° + k·180°, donde la tangente NO existe.
 *
 * `Math.tan(Math.PI / 2)` devuelve 1,6331 × 10¹⁶ en vez de infinito, porque π/2 no es
 * representable en binario. Ese número enorme es una mentira con aspecto de resultado:
 * aquí se corta antes, comparando el ángulo en grados, que sí es exacto.
 */
export function tangente(anguloGrados: number): number {
  if (!Number.isFinite(anguloGrados)) return NaN;
  const resto = ((anguloGrados % 180) + 180) % 180;
  if (Math.abs(resto - 90) < 1e-9) return NaN;
  return Math.tan(gradosARadianes(anguloGrados));
}

/** Cateto opuesto = hipotenusa · sen θ. NaN si los datos no forman un triángulo. */
export function catetoOpuesto(hipotenusa: number, anguloGrados: number): number {
  if (!anguloAgudoValido(anguloGrados) || !longitudValida(hipotenusa)) return NaN;
  return hipotenusa * seno(anguloGrados);
}

/** Cateto adyacente = hipotenusa · cos θ. NaN si los datos no forman un triángulo. */
export function catetoAdyacente(hipotenusa: number, anguloGrados: number): number {
  if (!anguloAgudoValido(anguloGrados) || !longitudValida(hipotenusa)) return NaN;
  return hipotenusa * coseno(anguloGrados);
}

/** Cateto opuesto = cateto adyacente · tan θ (la T de SOH-CAH-TOA). */
export function catetoOpuestoDesdeAdyacente(adyacente: number, anguloGrados: number): number {
  if (!anguloAgudoValido(anguloGrados) || !longitudValida(adyacente)) return NaN;
  const t = tangente(anguloGrados);
  if (!Number.isFinite(t)) return NaN;
  return adyacente * t;
}

/** Hipotenusa = cateto opuesto / sen θ. NaN si el ángulo no es agudo. */
export function hipotenusaDesdeOpuesto(opuesto: number, anguloGrados: number): number {
  if (!anguloAgudoValido(anguloGrados) || !longitudValida(opuesto)) return NaN;
  const s = seno(anguloGrados);
  if (s === 0) return NaN;
  return opuesto / s;
}

/**
 * Ángulo, EN GRADOS, a partir del cateto opuesto y la hipotenusa: θ = arcsen(o / h).
 * Devuelve NaN si el cateto no es menor que la hipotenusa: en un triángulo rectángulo
 * la hipotenusa es siempre el lado más largo, así que ese dato es imposible, no impreciso.
 */
export function anguloDesdeOpuestoEHipotenusa(opuesto: number, hipotenusa: number): number {
  if (!longitudValida(opuesto) || !longitudValida(hipotenusa)) return NaN;
  if (opuesto >= hipotenusa) return NaN;
  return radianesAGrados(Math.asin(opuesto / hipotenusa));
}

/** Ángulo, EN GRADOS, a partir del cateto adyacente y la hipotenusa: θ = arccos(a / h). */
export function anguloDesdeAdyacenteEHipotenusa(adyacente: number, hipotenusa: number): number {
  if (!longitudValida(adyacente) || !longitudValida(hipotenusa)) return NaN;
  if (adyacente >= hipotenusa) return NaN;
  return radianesAGrados(Math.acos(adyacente / hipotenusa));
}

/** Ángulo, EN GRADOS, a partir de los dos catetos: θ = arctan(o / a). */
export function anguloDesdeCatetos(opuesto: number, adyacente: number): number {
  if (!longitudValida(opuesto) || !longitudValida(adyacente)) return NaN;
  return radianesAGrados(Math.atan(opuesto / adyacente));
}

/** Un ángulo agudo de un triángulo rectángulo: estrictamente entre 0° y 90°. */
function anguloAgudoValido(anguloGrados: number): boolean {
  return Number.isFinite(anguloGrados) && anguloGrados > 0 && anguloGrados < 90;
}

/** Una longitud real: un número finito y positivo. */
function longitudValida(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

// ============================================================
// RESOLUCIÓN CON PASOS ESCRITOS
// ============================================================

const ERROR_ANGULO_AGUDO =
  'El ángulo agudo de un triángulo rectángulo tiene que estar entre 0° y 90°: los otros dos ángulos son el recto y su complementario.';
const ERROR_LONGITUD =
  'Las longitudes de los lados tienen que ser números mayores que cero.';
const ERROR_HIPOTENUSA_MENOR =
  'La hipotenusa tiene que ser MAYOR que el cateto: es siempre el lado más largo del triángulo rectángulo. Revisa qué dato es cuál.';
const ERROR_DATOS =
  'Faltan datos o no son números. Escribe cada dato como una cifra (se admite coma o punto decimal).';

/**
 * Resuelve un caso desde su `tipo` y sus `datos`, y devuelve TAMBIÉN el razonamiento.
 *
 * Es la única puerta de entrada que usa la vista: así el número que se corrige y el
 * número que se explica salen de la misma cuenta, y no pueden discrepar.
 */
export function resolverCaso(
  tipo: TipoCasoTrig,
  datos: readonly number[],
): SolucionTrigonometria {
  const fallo = (error: string): SolucionTrigonometria => ({
    ok: false,
    valor: NaN,
    pasos: [],
    error,
  });

  if (!datos.every((valor) => Number.isFinite(valor))) return fallo(ERROR_DATOS);

  switch (tipo) {
    case 'seno':
    case 'coseno':
    case 'tangente': {
      if (datos.length < 1) return fallo(ERROR_DATOS);
      const angulo = datos[0];
      const nombre = tipo === 'seno' ? 'sen' : tipo === 'coseno' ? 'cos' : 'tan';
      const razon = tipo === 'seno' ? 'opuesto / hipotenusa' : tipo === 'coseno' ? 'adyacente / hipotenusa' : 'opuesto / adyacente';
      const valor = tipo === 'seno' ? seno(angulo) : tipo === 'coseno' ? coseno(angulo) : tangente(angulo);
      if (!Number.isFinite(valor)) {
        return fallo(
          `La tangente no existe en ${formatearFlexible(angulo)}°: el cateto adyacente valdría cero y no se puede dividir entre cero.`,
        );
      }
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          `SOH-CAH-TOA: ${nombre} θ = ${razon}. La razón solo depende del ángulo, no del tamaño del triángulo.`,
          `Sustituimos el ángulo: ${nombre} ${formatearFlexible(angulo)}°`,
          `La calculadora tiene que estar en GRADOS. En radianes serían ${formatearFlexible(gradosARadianes(angulo), 4)} rad, que es el número que usa por dentro.`,
          `Resultado: ${nombre} ${formatearFlexible(angulo)}° = ${formatearFlexible(valor)}`,
        ],
      };
    }

    case 'cateto-opuesto': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [hip, angulo] = datos;
      if (!longitudValida(hip)) return fallo(ERROR_LONGITUD);
      if (!anguloAgudoValido(angulo)) return fallo(ERROR_ANGULO_AGUDO);
      const valor = catetoOpuesto(hip, angulo);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos la hipotenusa y un ángulo agudo, y buscamos el cateto OPUESTO a ese ángulo: la razón que los relaciona es el seno (SOH).',
          `Planteamos: sen ${formatearFlexible(angulo)}° = opuesto / ${formatearFlexible(hip)}`,
          `Despejamos multiplicando: opuesto = ${formatearFlexible(hip)} · sen ${formatearFlexible(angulo)}°`,
          `sen ${formatearFlexible(angulo)}° = ${formatearFlexible(seno(angulo), 6)}`,
          `opuesto = ${formatearFlexible(hip)} · ${formatearFlexible(seno(angulo), 6)} = ${formatearFlexible(valor)}`,
        ],
      };
    }

    case 'cateto-adyacente': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [hip, angulo] = datos;
      if (!longitudValida(hip)) return fallo(ERROR_LONGITUD);
      if (!anguloAgudoValido(angulo)) return fallo(ERROR_ANGULO_AGUDO);
      const valor = catetoAdyacente(hip, angulo);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos la hipotenusa y un ángulo agudo, y buscamos el cateto ADYACENTE (el que forma el ángulo junto a la hipotenusa): la razón es el coseno (CAH).',
          `Planteamos: cos ${formatearFlexible(angulo)}° = adyacente / ${formatearFlexible(hip)}`,
          `Despejamos multiplicando: adyacente = ${formatearFlexible(hip)} · cos ${formatearFlexible(angulo)}°`,
          `cos ${formatearFlexible(angulo)}° = ${formatearFlexible(coseno(angulo), 6)}`,
          `adyacente = ${formatearFlexible(hip)} · ${formatearFlexible(coseno(angulo), 6)} = ${formatearFlexible(valor)}`,
        ],
      };
    }

    case 'otro-cateto': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [adyacente, angulo] = datos;
      if (!longitudValida(adyacente)) return fallo(ERROR_LONGITUD);
      if (!anguloAgudoValido(angulo)) return fallo(ERROR_ANGULO_AGUDO);
      const valor = catetoOpuestoDesdeAdyacente(adyacente, angulo);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos un cateto y el ángulo que se apoya en él, y buscamos el OTRO cateto: cuando los dos lados en juego son los catetos, la razón es la tangente (TOA).',
          `Planteamos: tan ${formatearFlexible(angulo)}° = opuesto / ${formatearFlexible(adyacente)}`,
          `Despejamos multiplicando: opuesto = ${formatearFlexible(adyacente)} · tan ${formatearFlexible(angulo)}°`,
          `tan ${formatearFlexible(angulo)}° = ${formatearFlexible(tangente(angulo), 6)}`,
          `opuesto = ${formatearFlexible(adyacente)} · ${formatearFlexible(tangente(angulo), 6)} = ${formatearFlexible(valor)}`,
        ],
      };
    }

    case 'hipotenusa-desde-opuesto': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [opuesto, angulo] = datos;
      if (!longitudValida(opuesto)) return fallo(ERROR_LONGITUD);
      if (!anguloAgudoValido(angulo)) return fallo(ERROR_ANGULO_AGUDO);
      const valor = hipotenusaDesdeOpuesto(opuesto, angulo);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos el cateto opuesto a un ángulo y buscamos la hipotenusa: otra vez el seno (SOH), pero ahora la incógnita está en el DENOMINADOR.',
          `Planteamos: sen ${formatearFlexible(angulo)}° = ${formatearFlexible(opuesto)} / hipotenusa`,
          `Despejamos dividiendo: hipotenusa = ${formatearFlexible(opuesto)} / sen ${formatearFlexible(angulo)}°`,
          `sen ${formatearFlexible(angulo)}° = ${formatearFlexible(seno(angulo), 6)}`,
          `hipotenusa = ${formatearFlexible(opuesto)} / ${formatearFlexible(seno(angulo), 6)} = ${formatearFlexible(valor)}`,
          'Comprobación de sentido común: la hipotenusa tiene que salir MAYOR que el cateto del que partimos.',
        ],
      };
    }

    case 'angulo-arcoseno': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [opuesto, hip] = datos;
      if (!longitudValida(opuesto) || !longitudValida(hip)) return fallo(ERROR_LONGITUD);
      if (opuesto >= hip) return fallo(ERROR_HIPOTENUSA_MENOR);
      const valor = anguloDesdeOpuestoEHipotenusa(opuesto, hip);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos el cateto opuesto y la hipotenusa, y la incógnita es el ÁNGULO: se calcula la razón y después se deshace con la función inversa.',
          `sen θ = opuesto / hipotenusa = ${formatearFlexible(opuesto)} / ${formatearFlexible(hip)} = ${formatearFlexible(opuesto / hip)}`,
          `Deshacemos el seno con el arcoseno: θ = arcsen(${formatearFlexible(opuesto / hip)})`,
          `θ = ${formatearFlexible(valor)}° (con la calculadora en GRADOS; en radianes daría ${formatearFlexible(gradosARadianes(valor), 4)})`,
        ],
      };
    }

    case 'angulo-arcocoseno': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [adyacente, hip] = datos;
      if (!longitudValida(adyacente) || !longitudValida(hip)) return fallo(ERROR_LONGITUD);
      if (adyacente >= hip) return fallo(ERROR_HIPOTENUSA_MENOR);
      const valor = anguloDesdeAdyacenteEHipotenusa(adyacente, hip);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos el cateto adyacente y la hipotenusa, y la incógnita es el ÁNGULO: razón primero, función inversa después.',
          `cos θ = adyacente / hipotenusa = ${formatearFlexible(adyacente)} / ${formatearFlexible(hip)} = ${formatearFlexible(adyacente / hip)}`,
          `Deshacemos el coseno con el arcocoseno: θ = arccos(${formatearFlexible(adyacente / hip)})`,
          `θ = ${formatearFlexible(valor)}° (con la calculadora en GRADOS)`,
        ],
      };
    }

    case 'angulo-arcotangente': {
      if (datos.length < 2) return fallo(ERROR_DATOS);
      const [opuesto, adyacente] = datos;
      if (!longitudValida(opuesto) || !longitudValida(adyacente)) return fallo(ERROR_LONGITUD);
      const valor = anguloDesdeCatetos(opuesto, adyacente);
      return {
        ok: true,
        valor,
        error: null,
        pasos: [
          'Conocemos los DOS catetos y la incógnita es el ángulo: la razón que solo usa catetos es la tangente (TOA).',
          `tan θ = opuesto / adyacente = ${formatearFlexible(opuesto)} / ${formatearFlexible(adyacente)} = ${formatearFlexible(opuesto / adyacente)}`,
          `Deshacemos la tangente con la arcotangente: θ = arctan(${formatearFlexible(opuesto / adyacente)})`,
          `θ = ${formatearFlexible(valor)}° (con la calculadora en GRADOS)`,
        ],
      };
    }

    default:
      return fallo(ERROR_DATOS);
  }
}

// ============================================================
// COMPROBACIÓN DE RESPUESTAS
// ============================================================

/**
 * Tolerancia de corrección: la mayor entre ±0,01 y el 1 % del valor esperado.
 *
 * El mínimo absoluto evita castigar el redondeo en respuestas pequeñas (0,87 frente a
 * 0,8660) y el porcentaje evita ser absurdamente estricto en respuestas grandes.
 */
export function toleranciaDe(valorEsperado: number): number {
  return Math.max(0.01, Math.abs(valorEsperado) * 0.01);
}

/** Compara la respuesta tecleada con la esperada. NaN cuenta como «no numérico». */
export function comprobarRespuesta(
  valorUsuario: number,
  valorEsperado: number,
): ComprobacionTrig {
  const tolerancia = toleranciaDe(valorEsperado);
  if (!Number.isFinite(valorUsuario)) {
    return { correcto: false, motivo: 'no-numerico', diferencia: NaN, tolerancia };
  }
  const diferencia = Math.abs(valorUsuario - valorEsperado);
  return {
    correcto: diferencia <= tolerancia,
    motivo: diferencia <= tolerancia ? 'acertado' : 'fallado',
    diferencia,
    tolerancia,
  };
}

// ============================================================
// LOS 12 CASOS NUMERADOS
// ============================================================

/**
 * Definición de un caso: solo los DATOS. La respuesta y los pasos salen de
 * `resolverCaso`, nunca escritos a mano (ver punto 4 de la cabecera).
 */
interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  tipo: TipoCasoTrig;
  datos: readonly number[];
  etiquetaRespuesta: string;
  pista: string;
}

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'La razón que sale exacta',
    enunciado:
      '¿Cuánto vale sen 30°? Escribe el resultado como número decimal, no como fracción.',
    categoria: 'abstracto',
    tipo: 'seno',
    datos: [30],
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      'En un triángulo rectángulo con un ángulo de 30°, el cateto opuesto mide justo la mitad de la hipotenusa. Ese cociente es el seno.',
  },
  {
    id: 2,
    titulo: 'Dos razones que coinciden',
    enunciado:
      '¿Cuánto vale cos 60°? Escríbelo como número decimal y fíjate en que sale lo mismo que en el caso 1.',
    categoria: 'abstracto',
    tipo: 'coseno',
    datos: [60],
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      '30° y 60° son ángulos complementarios (suman 90°), y el cateto opuesto a uno es el adyacente del otro: por eso cos 60° = sen 30°.',
  },
  {
    id: 3,
    titulo: 'El triángulo de los dos catetos iguales',
    enunciado: '¿Cuánto vale tan 45°? Escribe el resultado como número decimal.',
    categoria: 'abstracto',
    tipo: 'tangente',
    datos: [45],
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      'Si un ángulo agudo mide 45°, el otro también, y el triángulo es isósceles: los dos catetos miden lo mismo. La tangente es su cociente.',
  },
  {
    id: 4,
    titulo: 'Un cateto desde la hipotenusa',
    enunciado:
      'Un triángulo rectángulo tiene una hipotenusa de 10 m y uno de sus ángulos agudos mide 30°. ¿Cuánto mide el cateto opuesto a ese ángulo?',
    categoria: 'abstracto',
    tipo: 'cateto-opuesto',
    datos: [10, 30],
    etiquetaRespuesta: 'm',
    pista:
      'Los lados que entran en juego son el opuesto y la hipotenusa: eso es la S de SOH, el seno.',
  },
  {
    id: 5,
    titulo: 'El cateto de al lado',
    enunciado:
      'En un triángulo rectángulo, la hipotenusa mide 20 cm y uno de los ángulos agudos, 55°. ¿Cuánto mide el cateto adyacente a ese ángulo?',
    categoria: 'abstracto',
    tipo: 'cateto-adyacente',
    datos: [20, 55],
    etiquetaRespuesta: 'cm',
    pista:
      'Adyacente e hipotenusa: la C de CAH, el coseno. El cateto adyacente es el que forma el ángulo junto a la hipotenusa.',
  },
  {
    id: 6,
    titulo: 'Dos catetos, un ángulo',
    enunciado:
      'Los catetos de un triángulo rectángulo miden 5 cm y 12 cm. ¿Cuánto mide, en grados, el ángulo opuesto al cateto de 5 cm?',
    categoria: 'abstracto',
    tipo: 'angulo-arcotangente',
    datos: [5, 12],
    etiquetaRespuesta: '°',
    pista:
      'Cuando los datos son los dos catetos, la razón es la tangente. Para pasar de la razón al ángulo hace falta la tecla inversa (arctan, tan⁻¹).',
  },
  {
    id: 7,
    titulo: 'El ángulo desde la hipotenusa',
    enunciado:
      'En un triángulo rectángulo, la hipotenusa mide 17 m y uno de los catetos, 8 m. ¿Cuánto mide, en grados, el ángulo opuesto a ese cateto de 8 m?',
    categoria: 'abstracto',
    tipo: 'angulo-arcoseno',
    datos: [8, 17],
    etiquetaRespuesta: '°',
    pista:
      'Opuesto e hipotenusa otra vez: seno. Como la incógnita es el ángulo, se deshace con el arcoseno (arcsen, sen⁻¹).',
  },
  {
    id: 8,
    titulo: 'Altura de un edificio',
    enunciado:
      'Desde un punto del suelo situado a 50 m de la base de un edificio, la parte más alta se ve con un ángulo de elevación de 32°. Si la medición se hace a ras del suelo, ¿qué altura tiene el edificio?',
    categoria: 'aplicado',
    tipo: 'otro-cateto',
    datos: [50, 32],
    etiquetaRespuesta: 'm',
    pista:
      'El suelo y el edificio forman un ángulo recto. Los datos son un cateto (la distancia) y el ángulo apoyado en él: tangente.',
  },
  {
    id: 9,
    titulo: 'Longitud de una rampa',
    enunciado:
      'Una rampa tiene que salvar un desnivel de 0,9 m con una inclinación de 6° respecto a la horizontal. ¿Cuánto mide la superficie inclinada de la rampa?',
    categoria: 'aplicado',
    tipo: 'hipotenusa-desde-opuesto',
    datos: [0.9, 6],
    etiquetaRespuesta: 'm',
    pista:
      'La rampa es la hipotenusa y el desnivel es el cateto opuesto al ángulo de inclinación. Aquí la incógnita queda debajo de la raya al plantear el seno.',
  },
  {
    id: 10,
    titulo: 'Escalera apoyada en la pared',
    enunciado:
      'Una escalera de 4 m se apoya en una pared vertical y forma un ángulo de 65° con el suelo. ¿A qué altura de la pared llega su extremo superior?',
    categoria: 'aplicado',
    tipo: 'cateto-opuesto',
    datos: [4, 65],
    etiquetaRespuesta: 'm',
    pista:
      'La escalera es la hipotenusa; la altura es el cateto opuesto al ángulo que forma con el suelo.',
  },
  {
    id: 11,
    titulo: 'Ancho de un río sin cruzarlo',
    enunciado:
      'Para medir el ancho de un río se marca un punto A en una orilla, justo enfrente de un árbol B de la orilla opuesta. Se camina 40 m por la orilla en línea recta y perpendicular a AB hasta un punto C, desde el que el árbol se ve formando 58° con la orilla. ¿Cuántos metros mide el ancho AB del río?',
    categoria: 'aplicado',
    tipo: 'otro-cateto',
    datos: [40, 58],
    etiquetaRespuesta: 'm',
    pista:
      'AB y AC son los dos catetos: el ancho del río y el tramo recorrido por la orilla. Dos catetos y un ángulo conocido: tangente.',
  },
  {
    id: 12,
    titulo: 'Inclinación de un tejado',
    enunciado:
      'Un tejado a dos aguas sube 2,8 m desde el borde hasta la cumbrera, recorriendo 6 m en horizontal. ¿Qué ángulo de inclinación, en grados, tiene ese faldón del tejado?',
    categoria: 'aplicado',
    tipo: 'angulo-arcotangente',
    datos: [2.8, 6],
    etiquetaRespuesta: '°',
    pista:
      'La subida es el cateto opuesto y el avance horizontal, el adyacente: arcotangente del cociente entre los dos.',
  },
];

/** Construye la solución de un caso a partir de sus datos. Nada se teclea a mano. */
function construirCaso(def: DefinicionCaso): CasoTrigonometria {
  const solucion = resolverCaso(def.tipo, def.datos);
  const respuesta = solucion.valor;
  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    tipo: def.tipo,
    datos: def.datos,
    etiquetaRespuesta: def.etiquetaRespuesta,
    respuesta,
    respuestaTexto: formatearFlexible(respuesta),
    requiereRedondeo:
      Number.isFinite(respuesta) && Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9,
    pasos: solucion.pasos,
    pista: def.pista,
  };
}

/**
 * Los 12 casos numerados, FIJOS y deterministas: el caso 3 es el mismo para todo el
 * mundo y en cualquier visita. Es lo que permite mandar «resuelve el 3, el 7 y el 11».
 */
export const CASOS: readonly CasoTrigonometria[] = DEFINICIONES.map(construirCaso);

/** Cuántos casos hay. Se deriva del array para que nunca discrepe del contador de la UI. */
export const TOTAL_CASOS = CASOS.length;

// ============================================================
// MODO PRÁCTICA: EJERCICIOS ALEATORIOS
// ============================================================

/**
 * Generador pseudoaleatorio determinista (mulberry32). Con la misma semilla salen
 * exactamente los mismos números, así que un ejercicio se puede reproducir y verificar.
 */
function creadorAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plantillas del modo práctica: cada una sabe qué preguntar y con qué datos. */
interface PlantillaAleatoria {
  tipo: TipoCasoTrig;
  etiqueta: (unidad: string) => string;
  enunciado: (a: string, b: string, unidad: string) => string;
  pista: string;
}

const PLANTILLAS: readonly PlantillaAleatoria[] = [
  {
    tipo: 'cateto-opuesto',
    etiqueta: (unidad) => unidad,
    enunciado: (hip, ang, unidad) =>
      `Un triángulo rectángulo tiene una hipotenusa de ${hip} ${unidad} y un ángulo agudo de ${ang}°. ¿Cuánto mide el cateto opuesto a ese ángulo?`,
    pista: 'Opuesto e hipotenusa: seno. Opuesto = hipotenusa · sen θ.',
  },
  {
    tipo: 'cateto-adyacente',
    etiqueta: (unidad) => unidad,
    enunciado: (hip, ang, unidad) =>
      `Una escalera de ${hip} ${unidad} se apoya en una pared vertical formando ${ang}° con el suelo. ¿A qué distancia de la pared está su base?`,
    pista: 'La distancia a la pared es el cateto adyacente: adyacente = hipotenusa · cos θ.',
  },
  {
    tipo: 'otro-cateto',
    etiqueta: (unidad) => unidad,
    enunciado: (ady, ang, unidad) =>
      `Desde un punto situado a ${ady} ${unidad} de la base de una torre, su parte más alta se ve con un ángulo de elevación de ${ang}°. ¿Qué altura tiene la torre?`,
    pista: 'Los dos lados en juego son catetos: altura = distancia · tan θ.',
  },
  {
    tipo: 'hipotenusa-desde-opuesto',
    etiqueta: (unidad) => unidad,
    enunciado: (op, ang, unidad) =>
      `Un cable tenso sujeta un poste vertical y forma ${ang}° con el suelo. Si se ancla a la altura de ${op} ${unidad} del poste, ¿cuánto mide el cable?`,
    pista: 'El cable es la hipotenusa: hipotenusa = opuesto / sen θ.',
  },
];

const UNIDADES: readonly string[] = ['cm', 'm', 'km'];

/**
 * Genera un ejercicio nuevo. Si se pasa `semilla`, el ejercicio es reproducible;
 * si no, se toma una semilla del reloj (por eso NUNCA debe llamarse durante el render:
 * el servidor y el navegador obtendrían ejercicios distintos).
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioTrigonometria {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);
  const aleatorio = creadorAleatorio(semillaReal);

  const plantilla = PLANTILLAS[Math.floor(aleatorio() * PLANTILLAS.length)];
  const unidad = UNIDADES[Math.floor(aleatorio() * UNIDADES.length)];
  // Ángulos de 15° a 75°: agudos con holgura, lejos de los extremos donde la tangente
  // se dispara y el enunciado deja de parecerse a una situación real.
  const angulo = 15 + Math.floor(aleatorio() * 61);
  const lado = redondear(3 + aleatorio() * 25, 1);

  const datos: readonly number[] = [lado, angulo];
  const solucion = resolverCaso(plantilla.tipo, datos);
  const respuesta = solucion.valor;

  return {
    semilla: semillaReal,
    enunciado: plantilla.enunciado(formatearFlexible(lado), formatearFlexible(angulo), unidad),
    tipo: plantilla.tipo,
    datos,
    etiquetaRespuesta: plantilla.etiqueta(unidad),
    respuesta,
    respuestaTexto: formatearFlexible(respuesta),
    requiereRedondeo:
      Number.isFinite(respuesta) && Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9,
    pasos: solucion.pasos,
    pista: plantilla.pista,
  };
}

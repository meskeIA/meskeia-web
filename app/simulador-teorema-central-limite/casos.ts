/**
 * Casos para clase — la tarea asignable de `simulador-teorema-central-limite`.
 *
 * ── POR QUÉ ESTA APP NO LLEVA CASOS NUMERADOS SINO PREDICCIONES ───────────────
 *
 * Es el primer módulo de casos del catálogo del **tipo C** (predecir antes de mover), y el
 * motivo es la app: aquí no hay ningún número que el alumno deba calcular. Lo que hay es un
 * simulador de exploración con dos deslizadores, y mover un deslizador y mirar la gráfica no
 * enseña nada si antes no había una hipótesis que confirmar o romper. Por eso cada caso pide
 * **comprometerse con una predicción** y solo después comprobarla en el simulador de arriba.
 *
 * ── LA REGLA QUE HACE VIABLE EL TIPO C ────────────────────────────────────────
 *
 * Una pregunta cualitativa solo vale si su respuesta se puede obtener **ejecutando el modelo**.
 * Si no, suena bien pero es ambigua y no se puede corregir. Aquí el modelo NO es la simulación
 * (que usa `Math.random` y da un número distinto cada vez), sino las tres leyes exactas del
 * teorema central del límite, que son deterministas:
 *
 *     μ(X̄)          = μ                  (el centro NO se mueve con n)
 *     σ(X̄)          = σ / √n             (la anchura baja con la RAÍZ de n)
 *     asimetría(X̄)  = asimetría / √n     (tiende a 0, nunca llega)
 *     exceso(X̄)     = exceso / n         (la curtosis converge más deprisa que la asimetría)
 *
 * Las cuatro se verificaron contra una simulación de 600.000 medias por configuración antes de
 * escribir este módulo: con la exponencial a n = 25 la fórmula da asimetría 0,400 y la
 * simulación 0,403; a n = 100 da 0,200 frente a 0,203. Con la Bernoulli p = 0,9 a n = 10, la
 * fórmula da −0,843 y la simulación −0,844.
 *
 * ── EL CONVENIO DE ESTA APP ───────────────────────────────────────────────────
 *
 * `μ` y `σ` de cada población NO se escriben dos veces: `page.tsx` los importa de aquí, de modo
 * que el panel del simulador y la corrección de los casos no pueden divergir. Si divergieran,
 * la app suspendería una respuesta que ella misma acaba de imprimir en pantalla, que es el peor
 * fallo posible en algo que corrige a un alumno ([[feedback_motor_calculo_aparte_y_probado]]).
 *
 * ⚠️ **Asimetría en el convenio de Fisher**: negativa = cola hacia la IZQUIERDA. Es lo que
 * calcula `calcularEstadisticos` en la vista y lo que dicen los manuales, pero conviene dejarlo
 * escrito porque es justo el sitio donde un caso bien resuelto puede fallar por el signo.
 *
 * ⚠️ **n y número de muestras son cosas distintas.** `n` es cuántas observaciones se promedian
 * en cada media; `numMuestras` es cuántas medias se dibujan. Solo la primera estrecha el
 * histograma; la segunda únicamente lo dibuja con menos ruido. Confundirlas es el error más
 * repetido del tema, y por eso el caso 4 va exactamente sobre eso.
 *
 * Aquí no hay React ni DOM: solo funciones puras, verificadas en
 * `tests/apps/simulador-teorema-central-limite.spec.ts`.
 */

/* ─────────────────────────── Las poblaciones, compartidas con la vista ─────────────────────────── */

export type PoblacionId = 'uniforme' | 'exponencial' | 'bernoulli_05' | 'bernoulli_09' | 'bimodal';

export interface Poblacion {
  id: PoblacionId;
  /** Nombre corto para los enunciados, sin el icono. */
  nombre: string;
  mu: number;
  sigma: number;
  /** Asimetría de Fisher. Negativa = cola a la izquierda. */
  asimetria: number;
  /** Exceso de curtosis (curtosis − 3). Una normal tiene 0. */
  exceso: number;
}

/**
 * Los cuatro momentos de cada población, en forma cerrada.
 *
 * Todos comprobados por Monte Carlo con 4.000.000 de extracciones antes de escribirlos:
 * la bimodal es la única que no sale de una fórmula de manual, así que se derivó a mano
 * —E[X⁴] = m⁴ + 6m²s² + 3s⁴ = 25,0288 y σ⁴ = 4,36² = 19,0096, luego exceso = −1,683— y la
 * simulación devolvió −1,683.
 */
export const POBLACIONES: Record<PoblacionId, Poblacion> = {
  uniforme: {
    id: 'uniforme',
    nombre: 'uniforme entre 0 y 10',
    mu: 5,
    sigma: Math.sqrt(100 / 12), // ≈ 2,8868
    asimetria: 0,
    exceso: -6 / 5, // −1,2: plana, más «ancha de hombros» que una campana
  },
  exponencial: {
    id: 'exponencial',
    nombre: 'exponencial de tiempos de espera',
    mu: 1,
    sigma: 1,
    asimetria: 2,
    exceso: 6,
  },
  bernoulli_05: {
    id: 'bernoulli_05',
    nombre: 'moneda justa (mitad y mitad)',
    mu: 0.5,
    sigma: 0.5,
    asimetria: 0,
    exceso: -2,
  },
  bernoulli_09: {
    id: 'bernoulli_09',
    nombre: 'moneda sesgada (9 de cada 10 veces sale 1)',
    mu: 0.9,
    sigma: Math.sqrt(0.09), // 0,3
    asimetria: (1 - 2 * 0.9) / Math.sqrt(0.09), // −2,6667
    exceso: (1 - 6 * 0.09) / 0.09, // 5,1111
  },
  bimodal: {
    id: 'bimodal',
    nombre: 'bimodal de dos picos (en −2 y en +2)',
    mu: 0,
    sigma: Math.sqrt(4.36), // ≈ 2,0881
    asimetria: 0,
    exceso: 25.0288 / (4.36 * 4.36) - 3, // ≈ −1,6834
  },
};

/** Los tamaños muestrales que ofrece el deslizador de la app. El caso 8 depende de esta lista. */
/**
 * Tamaños muestrales que ofrece el simulador. Es la lista CANÓNICA: la vista la importa de
 * aquí en vez de tener la suya.
 *
 * El 4 y el 25 se añadieron el 20/09/2026 porque los casos 2 y 5 los piden expresamente
 * («pasa de n = 1 a n = 4», «de n = 1 a n = 25») y cerraban invitando a comprobarlo en el
 * simulador de arriba, donde no existían: el alumno recibía una instrucción que no podía
 * ejecutar. Son además los dos que mejor enseñan la raíz, porque dan factores exactos
 * (√4 = 2 y √25 = 5).
 */
export const N_DISPONIBLES: readonly number[] = [1, 2, 4, 5, 10, 25, 30, 100];

/**
 * La misma lista, escrita para leerla dentro de un enunciado.
 *
 * El caso 8 la enumeraba a mano y se quedó desfasada al añadir el 4 y el 25 (20/09/2026):
 * el alumno leía una lista y veía otra en los botones.
 */
const LISTA_N_LEGIBLE = `${N_DISPONIBLES.slice(0, -1).join(', ')} y ${N_DISPONIBLES[N_DISPONIBLES.length - 1]}`;

/* ─────────────────────────── Las leyes del TCL ─────────────────────────── */

/** El centro de la distribución de medias. No depende de n: esa es la gracia. */
export function mediaDeMedias(p: Poblacion): number {
  return p.mu;
}

/** Error típico de la media: σ/√n. Con n ≤ 0 no hay media que medir. */
export function sigmaDeMedias(p: Poblacion, n: number): number {
  return n > 0 ? p.sigma / Math.sqrt(n) : NaN;
}

/** La asimetría se divide por √n: baja, pero solo llega a 0 en el límite. */
export function asimetriaDeMedias(p: Poblacion, n: number): number {
  return n > 0 ? p.asimetria / Math.sqrt(n) : NaN;
}

/** El exceso de curtosis se divide por n, así que converge más deprisa que la asimetría. */
export function excesoDeMedias(p: Poblacion, n: number): number {
  return n > 0 ? p.exceso / n : NaN;
}

/**
 * Cuánto se aleja de una campana normal la distribución de medias, en una sola cifra.
 *
 * Es |asimetría| + |exceso|/2: una combinación, no una magnitud estadística con nombre. Existe
 * solo para poder ordenar dos configuraciones cuando la pregunta es «¿cuál se parece más a una
 * normal?», y pondera menos el exceso porque converge a 0 más deprisa (÷n frente a ÷√n). En los
 * dos casos que la usan (6 y 12) las dos métricas apuntan al mismo lado, así que la respuesta
 * no depende de la ponderación elegida; se comprueba en el test.
 */
export function distanciaANormal(p: Poblacion, n: number): number {
  return Math.abs(asimetriaDeMedias(p, n)) + Math.abs(excesoDeMedias(p, n)) / 2;
}

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/**
 * Qué se pregunta. Cada variante la resuelve `resolverCaso` ejecutando las leyes de arriba, que
 * es lo que garantiza que la pregunta tiene UNA respuesta correcta y no es una opinión.
 */
export type DatosCaso =
  /** Al pasar de n1 a n2, ¿qué le pasa al centro del histograma de medias? */
  | { tipo: 'centro-n'; poblacion: PoblacionId; n1: number; n2: number }
  /** Al pasar de n1 a n2, ¿por cuánto se multiplica la anchura? */
  | { tipo: 'anchura-n'; poblacion: PoblacionId; n1: number; n2: number }
  /** Con n FIJO, al subir el número de medias dibujadas, ¿qué le pasa a la anchura? */
  | { tipo: 'anchura-repeticiones'; poblacion: PoblacionId; n: number; muestras1: number; muestras2: number }
  /** Al pasar de n1 a n2, ¿por cuánto se multiplica la asimetría? */
  | { tipo: 'asimetria-n'; poblacion: PoblacionId; n1: number; n2: number }
  /** ¿Hacia qué lado cae la cola de la distribución de medias con este n? */
  | { tipo: 'lado-cola'; poblacion: PoblacionId; n: number }
  /** A igual n, ¿cuál de las dos poblaciones da medias más parecidas a una normal? */
  | { tipo: 'cual-mas-normal'; a: PoblacionId; b: PoblacionId; n: number }
  /** A igual n, ¿cuál de las dos da el histograma de medias más estrecho? */
  | { tipo: 'cual-mas-estrecho'; a: PoblacionId; b: PoblacionId; n: number }
  /** ¿Cuál es el menor n de los disponibles con el que σ(X̄) no supera el umbral? */
  | { tipo: 'umbral-n'; poblacion: PoblacionId; umbral: number }
  /** ¿Por cuánto hay que multiplicar n para dividir el error típico por `divisor`? */
  | { tipo: 'factor-n'; divisor: number }
  /** ¿Dónde se centra el histograma de medias? (pensado para la bimodal) */
  | { tipo: 'donde-centro'; poblacion: PoblacionId; n: number }
  /** De dos valores de n, ¿con cuál la distribución de medias es menos asimétrica? */
  | { tipo: 'menos-asimetrico'; poblacion: PoblacionId; n1: number; n2: number };

export interface Opcion {
  /**
   * Identidad semántica de la opción. `resolverCaso` devuelve una CLAVE, no una posición, para
   * que reordenar las opciones de un caso no cambie en silencio cuál es la correcta.
   */
  clave: string;
  texto: string;
}

export interface Resolucion {
  ok: boolean;
  /** La clave de la opción correcta. Cadena vacía si `ok` es false. */
  clave: string;
  /** La explicación del MECANISMO, que en el tipo C sustituye al desarrollo paso a paso. */
  pasos: string[];
  error?: string;
}

/** Formatea un número en español, con los decimales que se le pidan como máximo. */
function numero(n: number, decimales = 2): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-ES', { maximumFractionDigits: decimales, minimumFractionDigits: 0 });
}

/** Compara dos números con holgura relativa: evita que 0,4999999 se lea como distinto de 0,5. */
function casiIgual(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Recalcula la respuesta correcta ejecutando el modelo, sin mirar el campo `respuesta` del caso.
 *
 * Nunca lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const fallo = (error: string): Resolucion => ({ ok: false, clave: '', pasos: [], error });

  switch (datos.tipo) {
    case 'centro-n': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      const c1 = mediaDeMedias(p);
      const c2 = mediaDeMedias(p);
      const clave = casiIgual(c1, c2) ? 'no-cambia' : c2 > c1 ? 'derecha' : 'izquierda';
      return {
        ok: true,
        clave,
        pasos: [
          `El centro de la distribución de medias es μ(X̄) = μ, la media de la población: ${numero(p.mu)}.`,
          `En la fórmula no aparece n por ningún lado, así que pasar de n = ${datos.n1} a n = ${datos.n2} no lo desplaza.`,
          'Promediar no sesga: lo que cambia al subir n es lo APRETADAS que están las medias alrededor de ese centro, no dónde está el centro.',
        ],
      };
    }

    case 'anchura-n': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      if (datos.n1 <= 0 || datos.n2 <= 0) return fallo('El tamaño muestral tiene que ser mayor que cero.');
      const s1 = sigmaDeMedias(p, datos.n1);
      const s2 = sigmaDeMedias(p, datos.n2);
      const factor = s2 / s1; // = √(n1/n2)
      let clave = 'otro';
      if (casiIgual(factor, 1)) clave = 'no-cambia';
      else if (casiIgual(factor, 0.5)) clave = 'mitad';
      else if (casiIgual(factor, 0.25)) clave = 'cuarta';
      else if (casiIgual(factor, 0.1)) clave = 'decima';
      else if (casiIgual(factor, 0.01)) clave = 'centesima';
      else if (casiIgual(factor, 2)) clave = 'doble';
      return {
        ok: true,
        clave,
        pasos: [
          `σ(X̄) = σ/√n, con σ = ${numero(p.sigma, 4)}.`,
          `Con n = ${datos.n1}: σ(X̄) = ${numero(s1, 4)}. Con n = ${datos.n2}: σ(X̄) = ${numero(s2, 4)}.`,
          `El cociente es ${numero(factor, 4)} = √(${datos.n1}/${datos.n2}), y no depende de qué población sea.`,
          'La anchura baja con la RAÍZ de n, no con n: para estrecharla a la mitad hay que multiplicar n por 4, no por 2.',
        ],
      };
    }

    case 'anchura-repeticiones': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      const s = sigmaDeMedias(p, datos.n);
      // El número de medias dibujadas no entra en σ(X̄): la anchura es la misma con 100 que con 5.000.
      return {
        ok: true,
        clave: 'no-cambia',
        pasos: [
          `σ(X̄) = σ/√n = ${numero(p.sigma, 4)}/√${datos.n} = ${numero(s, 4)}.`,
          `En esa fórmula solo entra n, que aquí no se toca: sigue valiendo ${datos.n}.`,
          `Pasar de ${numero(datos.muestras1, 0)} a ${numero(datos.muestras2, 0)} medias dibujadas no estrecha nada; lo que hace es dibujar la MISMA distribución con menos ruido, porque hay más puntos para estimar su forma.`,
          'Es la confusión más repetida del tema: n es cuántas observaciones se promedian en cada media; el número de muestras es cuántas medias se pintan.',
        ],
      };
    }

    case 'asimetria-n': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      if (datos.n1 <= 0 || datos.n2 <= 0) return fallo('El tamaño muestral tiene que ser mayor que cero.');
      const a1 = asimetriaDeMedias(p, datos.n1);
      const a2 = asimetriaDeMedias(p, datos.n2);
      if (casiIgual(a1, 0)) {
        return {
          ok: true,
          clave: 'ya-era-cero',
          pasos: [
            `Esta población ya es simétrica: su asimetría vale ${numero(p.asimetria)}.`,
            'Dividir 0 entre √n sigue dando 0, así que no hay asimetría que reducir.',
          ],
        };
      }
      const factor = a2 / a1; // = √(n1/n2)
      let clave = 'otro';
      if (casiIgual(factor, 0.5)) clave = 'mitad';
      else if (casiIgual(factor, 0.2)) clave = 'quinta';
      else if (casiIgual(factor, 0.1)) clave = 'decima';
      else if (casiIgual(factor, 1)) clave = 'no-cambia';
      return {
        ok: true,
        clave,
        pasos: [
          `La asimetría de las medias es asimetría(X̄) = asimetría/√n, con asimetría = ${numero(p.asimetria)}.`,
          `Con n = ${datos.n1}: ${numero(a1, 3)}. Con n = ${datos.n2}: ${numero(a2, 3)}.`,
          `Se multiplica por ${numero(factor, 3)} = √(${datos.n1}/${datos.n2}).`,
          'Nunca llega a valer 0 exactamente: se acerca. Por eso el teorema habla de un LÍMITE y no de un n a partir del cual la distribución «ya es» normal.',
        ],
      };
    }

    case 'lado-cola': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      const a = asimetriaDeMedias(p, datos.n);
      if (!Number.isFinite(a)) return fallo('No se puede calcular la asimetría con ese tamaño muestral.');
      const clave = casiIgual(a, 0) ? 'simetrica' : a < 0 ? 'izquierda' : 'derecha';
      return {
        ok: true,
        clave,
        pasos: [
          `asimetría(X̄) = asimetría/√n = ${numero(p.asimetria, 3)}/√${datos.n} = ${numero(a, 3)}.`,
          clave === 'izquierda'
            ? 'En el convenio de Fisher un valor NEGATIVO significa cola hacia la izquierda: la masa se acumula a la derecha y los valores raros quedan a la izquierda.'
            : clave === 'derecha'
              ? 'Un valor POSITIVO significa cola hacia la derecha: la masa se acumula a la izquierda y los valores raros quedan a la derecha.'
              : 'Un valor 0 significa que las dos colas pesan lo mismo.',
          `Con n = ${datos.n} la asimetría ya se ha reducido respecto a la población (${numero(p.asimetria, 3)}), pero todavía se nota: no basta con que n sea «grande» en abstracto.`,
        ],
      };
    }

    case 'cual-mas-normal': {
      const a = POBLACIONES[datos.a];
      const b = POBLACIONES[datos.b];
      if (!a || !b) return fallo('Población desconocida.');
      const da = distanciaANormal(a, datos.n);
      const db = distanciaANormal(b, datos.n);
      const clave = casiIgual(da, db) ? 'iguales' : da < db ? 'a' : 'b';
      return {
        ok: true,
        clave,
        pasos: [
          `Con n = ${datos.n}, la ${a.nombre} da asimetría ${numero(asimetriaDeMedias(a, datos.n), 3)} y exceso de curtosis ${numero(excesoDeMedias(a, datos.n), 3)}.`,
          `La ${b.nombre} da asimetría ${numero(asimetriaDeMedias(b, datos.n), 3)} y exceso ${numero(excesoDeMedias(b, datos.n), 3)}.`,
          'Cuanto más cerca de 0 están las dos cifras, más se parece el histograma de medias a una campana normal.',
          'Lo que decide no es la forma de la población, sino CUÁNTO se aparta de la normal: cuanto más rara es la población de partida, más n hace falta.',
        ],
      };
    }

    case 'cual-mas-estrecho': {
      const a = POBLACIONES[datos.a];
      const b = POBLACIONES[datos.b];
      if (!a || !b) return fallo('Población desconocida.');
      const sa = sigmaDeMedias(a, datos.n);
      const sb = sigmaDeMedias(b, datos.n);
      const clave = casiIgual(sa, sb) ? 'iguales' : sa < sb ? 'a' : 'b';
      return {
        ok: true,
        clave,
        pasos: [
          `σ(X̄) con n = ${datos.n}: la ${a.nombre} da ${numero(sa, 4)} y la ${b.nombre}, ${numero(sb, 4)}.`,
          `Como n es el mismo, lo único que las separa es la σ de la población: ${numero(a.sigma, 4)} frente a ${numero(b.sigma, 4)}.`,
          'La anchura del histograma de medias hereda la dispersión de la población: promediar la reduce, pero no la iguala entre poblaciones distintas.',
        ],
      };
    }

    case 'umbral-n': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      const encontrado = N_DISPONIBLES.find((n) => sigmaDeMedias(p, n) <= datos.umbral + 1e-12);
      const exacto = Math.pow(p.sigma / datos.umbral, 2);
      return {
        ok: true,
        clave: encontrado === undefined ? 'ninguno' : `n-${encontrado}`,
        pasos: [
          `Se busca el menor n con σ/√n ≤ ${numero(datos.umbral)}.`,
          `Despejando: n ≥ (σ/umbral)² = (${numero(p.sigma, 4)}/${numero(datos.umbral)})² = ${numero(exacto, 2)}.`,
          `De los valores que ofrece el deslizador (${N_DISPONIBLES.join(', ')}), el menor que llega es ${encontrado ?? 'ninguno'}.`,
          `Ojo con n = 30: da σ(X̄) = ${numero(sigmaDeMedias(p, 30), 4)}, que todavía NO baja del umbral. La regla de memorieta «con n ≥ 30 ya vale» responde a otra pregunta —la forma— y no a la precisión.`,
        ],
      };
    }

    case 'factor-n': {
      if (datos.divisor <= 0) return fallo('El divisor tiene que ser mayor que cero.');
      const factor = datos.divisor * datos.divisor;
      return {
        ok: true,
        clave: `x${factor}`,
        pasos: [
          `σ(X̄) = σ/√n: para dividir el error típico por ${numero(datos.divisor)} hace falta multiplicar √n por ${numero(datos.divisor)}.`,
          `Si √n se multiplica por ${numero(datos.divisor)}, entonces n se multiplica por ${numero(datos.divisor)}² = ${numero(factor)}.`,
          'Es la ley de los rendimientos decrecientes del muestreo: cada cifra de precisión adicional cuesta mucho más que la anterior.',
        ],
      };
    }

    case 'donde-centro': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      const centro = mediaDeMedias(p);
      return {
        ok: true,
        clave: casiIgual(centro, 0) ? 'en-cero' : 'en-mu',
        pasos: [
          `El histograma de medias se centra en μ = ${numero(centro)}, valga lo que valga n.`,
          'Y aquí está lo llamativo: esta población casi NUNCA produce valores cerca de su media, porque tiene dos picos separados y un hueco justo en medio.',
          `Aun así, al promediar n = ${datos.n} observaciones, los valores altos y bajos se compensan y las medias se apilan precisamente en ese hueco.`,
          'La media de la población no tiene por qué ser un valor típico de la población: es el centro de gravedad, no lo que más se repite.',
        ],
      };
    }

    case 'menos-asimetrico': {
      const p = POBLACIONES[datos.poblacion];
      if (!p) return fallo('Población desconocida.');
      if (datos.n1 <= 0 || datos.n2 <= 0) return fallo('El tamaño muestral tiene que ser mayor que cero.');
      const a1 = Math.abs(asimetriaDeMedias(p, datos.n1));
      const a2 = Math.abs(asimetriaDeMedias(p, datos.n2));
      const clave = casiIgual(a1, a2) ? 'iguales' : a1 < a2 ? 'n1' : 'n2';
      return {
        ok: true,
        clave,
        pasos: [
          `Asimetría de la población: ${numero(p.asimetria, 3)}.`,
          `Con n = ${datos.n1}: ${numero(asimetriaDeMedias(p, datos.n1), 3)}. Con n = ${datos.n2}: ${numero(asimetriaDeMedias(p, datos.n2), 3)}.`,
          'Se compara el valor absoluto: lo que interesa es cuánto se aparta de la simetría, no hacia qué lado.',
          `El exceso de curtosis acompaña: pasa de ${numero(excesoDeMedias(p, datos.n1), 3)} a ${numero(excesoDeMedias(p, datos.n2), 3)}, y encima lo hace dividiéndose por n en vez de por √n.`,
        ],
      };
    }

    default: {
      // Alcanzable solo si se añade una variante a DatosCaso y se olvida tratarla aquí.
      return fallo('Tipo de caso no reconocido.');
    }
  }
}

/* ─────────────────────────── Los 12 casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** Qué se elige. En el tipo C no es una casilla numérica sino una predicción. NUNCA vacía. */
  etiquetaRespuesta: string;
  opciones: readonly Opcion[];
  /** Índice de la opción correcta dentro de `opciones`. Lo calcula el motor, no se escribe. */
  respuesta: number;
  respuestaTexto: string;
  /** La explicación del mecanismo. */
  pasos: string[];
  pista: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso` más abajo,
 * de modo que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas nacionales: el 91 % de este canal es de fuera de España y un
 * enunciado anclado excluye a la mayor parte del público que lo va a leer.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'El centro no se mueve',
    categoria: 'abstracto',
    enunciado:
      'Elige la población uniforme entre 0 y 10 y deja 1.000 muestras. Antes de tocar nada: si subes el tamaño muestral de n = 1 a n = 30, ¿qué le ocurrirá al CENTRO del histograma de medias?',
    datos: { tipo: 'centro-n', poblacion: 'uniforme', n1: 1, n2: 30 },
    etiquetaRespuesta: 'Tu predicción sobre el centro',
    opciones: [
      { clave: 'derecha', texto: 'Se desplazará hacia la derecha' },
      { clave: 'izquierda', texto: 'Se desplazará hacia la izquierda' },
      { clave: 'no-cambia', texto: 'Se quedará en el mismo sitio' },
    ],
    pista: 'Escribe la fórmula del centro de la distribución de medias. ¿Aparece n en ella?',
  },
  {
    id: 2,
    titulo: 'De n = 1 a n = 4',
    categoria: 'abstracto',
    enunciado:
      'Con la misma población uniforme, pasa de n = 1 a n = 4. ¿Qué le ocurrirá a la ANCHURA del histograma de medias, es decir, a su desviación típica?',
    datos: { tipo: 'anchura-n', poblacion: 'uniforme', n1: 1, n2: 4 },
    etiquetaRespuesta: 'Tu predicción sobre la anchura',
    opciones: [
      { clave: 'cuarta', texto: 'Se reducirá a la cuarta parte' },
      { clave: 'mitad', texto: 'Se reducirá a la mitad' },
      { clave: 'no-cambia', texto: 'No cambiará' },
      { clave: 'doble', texto: 'Se duplicará' },
    ],
    pista: 'Multiplicar n por 4 no divide la anchura por 4. Fíjate en que la fórmula lleva una raíz.',
  },
  {
    id: 3,
    titulo: 'Cien veces más observaciones',
    categoria: 'abstracto',
    enunciado:
      'Sigue con la población uniforme y pasa de n = 1 a n = 100. ¿Por cuánto quedará dividida la anchura del histograma de medias?',
    datos: { tipo: 'anchura-n', poblacion: 'uniforme', n1: 1, n2: 100 },
    etiquetaRespuesta: 'Tu predicción sobre el factor',
    opciones: [
      { clave: 'decima', texto: 'Por 10' },
      { clave: 'centesima', texto: 'Por 100' },
      { clave: 'mitad', texto: 'Por 2' },
      { clave: 'no-cambia', texto: 'Por nada: seguirá igual' },
    ],
    pista: 'Si la anchura es σ dividida por la raíz de n, ¿cuánto vale la raíz de 100?',
  },
  {
    id: 4,
    titulo: 'n y número de muestras no son lo mismo',
    categoria: 'abstracto',
    enunciado:
      'Elige la población exponencial y fija n = 10. Ahora sube el NÚMERO DE MUESTRAS de 100 a 5.000, sin tocar n. ¿Qué le ocurrirá a la anchura del histograma de medias?',
    datos: { tipo: 'anchura-repeticiones', poblacion: 'exponencial', n: 10, muestras1: 100, muestras2: 5000 },
    etiquetaRespuesta: 'Tu predicción sobre la anchura',
    opciones: [
      { clave: 'estrecha', texto: 'Se estrechará, porque hay muchos más datos' },
      { clave: 'ensancha', texto: 'Se ensanchará' },
      { clave: 'no-cambia', texto: 'No cambiará: solo se dibujará con menos ruido' },
    ],
    pista: 'Mira qué letra aparece en la fórmula de la anchura. ¿Es el número de medias dibujadas o el número de observaciones que se promedian en cada una?',
  },
  {
    id: 5,
    titulo: 'La asimetría de la exponencial',
    categoria: 'abstracto',
    enunciado:
      'La población exponencial es muy asimétrica, con una cola larga a la derecha. Si pasas de n = 1 a n = 25, ¿qué le ocurrirá a esa asimetría en el histograma de medias?',
    datos: { tipo: 'asimetria-n', poblacion: 'exponencial', n1: 1, n2: 25 },
    etiquetaRespuesta: 'Tu predicción sobre la asimetría',
    opciones: [
      { clave: 'quinta', texto: 'Bajará a la quinta parte, pero seguirá sin ser cero' },
      { clave: 'cero-exacto', texto: 'Desaparecerá por completo: valdrá exactamente cero' },
      { clave: 'no-cambia', texto: 'No cambiará' },
      { clave: 'aumenta', texto: 'Aumentará' },
    ],
    pista: 'La asimetría se divide por la raíz de n, igual que la anchura. ¿Cuánto vale la raíz de 25?',
  },
  {
    id: 6,
    titulo: '¿Cuál llega antes a la campana?',
    categoria: 'abstracto',
    enunciado:
      'Fija n = 10 en las dos y compáralas: la población uniforme y la exponencial. ¿Cuál de las dos dará un histograma de medias más parecido a una campana normal?',
    datos: { tipo: 'cual-mas-normal', a: 'uniforme', b: 'exponencial', n: 10 },
    etiquetaRespuesta: 'Tu predicción',
    opciones: [
      { clave: 'a', texto: 'La uniforme' },
      { clave: 'b', texto: 'La exponencial' },
      { clave: 'iguales', texto: 'Las dos por igual: con n = 10 ya da lo mismo de qué población se parta' },
    ],
    pista: 'La uniforme es plana pero simétrica; la exponencial tiene una cola larga. ¿Cuál de las dos «rarezas» cuesta más de corregir al promediar?',
  },
  {
    id: 7,
    titulo: 'Hacia qué lado cae la cola',
    categoria: 'abstracto',
    enunciado:
      'Elige la moneda sesgada, la que da 1 en nueve de cada diez tiradas, y pon n = 10. ¿Hacia qué lado caerá la cola del histograma de medias?',
    datos: { tipo: 'lado-cola', poblacion: 'bernoulli_09', n: 10 },
    etiquetaRespuesta: 'Tu predicción sobre la cola',
    opciones: [
      { clave: 'izquierda', texto: 'Hacia la izquierda' },
      { clave: 'derecha', texto: 'Hacia la derecha' },
      { clave: 'simetrica', texto: 'Hacia ninguno: será simétrica' },
    ],
    pista: 'Casi todas las medias saldrán altas, cerca de 0,9. Las pocas que se desvíen, ¿pueden irse por arriba, teniendo en cuenta que el máximo posible es 1?',
  },
  {
    id: 8,
    titulo: 'Cuando n = 30 no basta',
    categoria: 'aplicado',
    enunciado:
      `Mides una magnitud cuyos valores se reparten de forma uniforme entre 0 y 10, y necesitas que el error típico de la media no supere 0,5 unidades. De los tamaños que ofrece el deslizador (${LISTA_N_LEGIBLE}), ¿cuál es el MENOR que lo consigue?`,
    datos: { tipo: 'umbral-n', poblacion: 'uniforme', umbral: 0.5 },
    etiquetaRespuesta: 'Tu predicción sobre el menor n válido',
    opciones: [
      { clave: 'n-10', texto: 'n = 10' },
      { clave: 'n-30', texto: 'n = 30' },
      { clave: 'n-100', texto: 'n = 100' },
      { clave: 'ninguno', texto: 'Ninguno de los disponibles lo consigue' },
    ],
    pista: 'Despeja n en σ/√n ≤ 0,5 con σ ≈ 2,89. La regla «con 30 ya vale» habla de la forma de la distribución, no de la precisión.',
  },
  {
    id: 9,
    titulo: 'Misma n, distinta población',
    categoria: 'abstracto',
    enunciado:
      'Con n = 10 en ambas, compara la moneda justa (σ = 0,5) y la exponencial (σ = 1). ¿Cuál dará el histograma de medias más ESTRECHO?',
    datos: { tipo: 'cual-mas-estrecho', a: 'bernoulli_05', b: 'exponencial', n: 10 },
    etiquetaRespuesta: 'Tu predicción',
    opciones: [
      { clave: 'a', texto: 'La moneda justa' },
      { clave: 'b', texto: 'La exponencial' },
      { clave: 'iguales', texto: 'Las dos igual: con la misma n la anchura es la misma' },
    ],
    pista: 'Con n igual en las dos, en σ/√n solo queda una cosa que las diferencie.',
  },
  {
    id: 10,
    titulo: 'Medias donde no hay datos',
    categoria: 'abstracto',
    enunciado:
      'Elige la población bimodal, que tiene un pico en −2 y otro en +2 y casi ningún valor en medio. Con n = 30, ¿dónde se centrará el histograma de medias?',
    datos: { tipo: 'donde-centro', poblacion: 'bimodal', n: 30 },
    etiquetaRespuesta: 'Tu predicción sobre el centro',
    opciones: [
      { clave: 'en-cero', texto: 'En 0, aunque la población casi nunca dé valores cercanos a 0' },
      { clave: 'dos-picos', texto: 'En dos picos, igual que la población' },
      { clave: 'en-dos', texto: 'En +2, donde está uno de los picos' },
    ],
    pista: '¿Cuánto vale la media de una población simétrica respecto a 0? ¿Y tiene que ser ese valor un resultado frecuente?',
  },
  {
    id: 11,
    titulo: 'El precio de una cifra más',
    categoria: 'aplicado',
    enunciado:
      'Mides tiempos de espera (población exponencial) y quieres que el error típico de la media se reduzca a la TERCERA parte del que tienes ahora. ¿Por cuánto tienes que multiplicar el número de observaciones de cada muestra?',
    datos: { tipo: 'factor-n', divisor: 3 },
    etiquetaRespuesta: 'Tu predicción sobre el factor',
    opciones: [
      { clave: 'x3', texto: 'Por 3' },
      { clave: 'x9', texto: 'Por 9' },
      { clave: 'x6', texto: 'Por 6' },
      { clave: 'x81', texto: 'Por 81' },
    ],
    pista: 'Lo que se divide por 3 es √n, no n. Si √n se triplica, ¿qué le pasa a n?',
  },
  {
    id: 12,
    titulo: 'Control de calidad',
    categoria: 'aplicado',
    enunciado:
      'Una línea de producción saca 9 piezas correctas de cada 10 (población: moneda sesgada). Revisas lotes y calculas la proporción de correctas en cada uno. ¿Con qué tamaño de lote será MENOS asimétrico el histograma de esas proporciones: con n = 10 o con n = 30?',
    datos: { tipo: 'menos-asimetrico', poblacion: 'bernoulli_09', n1: 10, n2: 30 },
    etiquetaRespuesta: 'Tu predicción',
    opciones: [
      { clave: 'n1', texto: 'Con n = 10' },
      { clave: 'n2', texto: 'Con n = 30' },
      { clave: 'iguales', texto: 'Igual en los dos: la asimetría solo depende de la población' },
    ],
    pista: 'La asimetría se divide por la raíz de n. A mayor n, ¿mayor o menor asimetría?',
  },
];

/**
 * Los 12 casos, ya resueltos por el motor.
 *
 * `respuesta` es el índice de la opción cuya CLAVE devuelve `resolverCaso`. Si el motor
 * devolviera una clave que no está entre las opciones del caso, el índice sería −1 y el test lo
 * caza: es lo que pasaría si alguien edita un enunciado y olvida ajustar las opciones.
 */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const indice = r.ok ? def.opciones.findIndex((o) => o.clave === r.clave) : -1;
  return {
    ...def,
    respuesta: indice,
    respuestaTexto: indice >= 0 ? def.opciones[indice].texto : 'sin resolver',
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Corrección ─────────────────────────── */

export interface Veredicto {
  correcto: boolean;
  motivo: string;
}

/**
 * Corrige la predicción del alumno.
 *
 * Aquí no hay `toleranciaDe` como en los casos de tipo A: la respuesta no es un número que
 * pueda estar «casi bien», sino una de un conjunto cerrado de opciones. Se acierta o no.
 *
 * Nunca lanza: una entrada que no corresponde a ninguna opción se responde con un veredicto, no
 * con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(elegido: number, esperado: number, opciones: readonly Opcion[]): Veredicto {
  if (!Number.isInteger(elegido) || elegido < 0 || elegido >= opciones.length) {
    return { correcto: false, motivo: 'Elige una de las opciones antes de comprobar.' };
  }
  if (esperado < 0 || esperado >= opciones.length) {
    return { correcto: false, motivo: 'Este caso no se ha podido resolver. Avísanos si lo ves.' };
  }
  if (elegido === esperado) {
    return { correcto: true, motivo: `Correcto: ${opciones[esperado].texto.toLowerCase()}.` };
  }
  return {
    correcto: false,
    motivo: `No es esa. La respuesta correcta es: ${opciones[esperado].texto.toLowerCase()}.`,
  };
}

/* ─────────────────────────── Modo práctica ─────────────────────────── */

export interface Ejercicio {
  enunciado: string;
  etiquetaRespuesta: string;
  opciones: readonly Opcion[];
  respuesta: number;
  pasos: string[];
}

/**
 * Mezclador de semilla (splitmix32).
 *
 * ⚠️ NO es un adorno. Un xorshift32 sembrado con enteros pequeños y consecutivos devuelve en su
 * primera llamada valores diminutos y parecidos, así que `Math.floor(rnd() * n)` sale 0 una y
 * otra vez y el generador entrega EL MISMO ejercicio con todas las semillas — siendo
 * perfectamente reproducible, que es lo que engaña. Pasó en `simulador-genetica` el 14/09/2026.
 */
function splitmix32(semilla: number): () => number {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x9e3779b9) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POBLACIONES_PRACTICA: PoblacionId[] = ['uniforme', 'exponencial', 'bernoulli_05', 'bernoulli_09', 'bimodal'];
/**
 * Pares (n pequeño, n grande) para los ejercicios de práctica.
 *
 * Se DERIVAN de `N_DISPONIBLES` en vez de escribirse a mano: hasta el 20/09/2026 la lista
 * incluía 8, 20, 40 y 4, ninguno de los cuales existía en el simulador, así que de los seis
 * pares solo uno era reproducible. Se piden saltos de al menos 4× para que el efecto de la
 * raíz se vea de verdad en el histograma.
 */
const PARES_N: Array<[number, number]> = N_DISPONIBLES.flatMap((n1, i) =>
  N_DISPONIBLES.slice(i + 1)
    .filter((n2) => n2 >= n1 * 4)
    .map((n2) => [n1, n2] as [number, number]),
);

/**
 * Un ejercicio de práctica, reproducible por semilla.
 *
 * Usa el MISMO `resolverCaso` que los 12 fijos: si divergieran, el alumno entrenaría con una
 * regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla?: number): Ejercicio {
  const s = semilla ?? Math.floor(Math.random() * 0xffffffff);
  const rnd = splitmix32(s);

  const variante = Math.floor(rnd() * 3);
  const poblacion = POBLACIONES_PRACTICA[Math.floor(rnd() * POBLACIONES_PRACTICA.length)];
  const [n1, n2] = PARES_N[Math.floor(rnd() * PARES_N.length)];
  const p = POBLACIONES[poblacion];

  if (variante === 0) {
    const datos: DatosCaso = { tipo: 'anchura-n', poblacion, n1, n2 };
    const r = resolverCaso(datos);
    const opciones: readonly Opcion[] = [
      { clave: 'mitad', texto: 'Se reducirá a la mitad' },
      { clave: 'cuarta', texto: 'Se reducirá a la cuarta parte' },
      { clave: 'decima', texto: 'Se reducirá a la décima parte' },
      { clave: 'no-cambia', texto: 'No cambiará' },
      { clave: 'otro', texto: 'Se reducirá, pero por otro factor distinto de los anteriores' },
    ];
    return {
      enunciado: `Población ${p.nombre}. Pasas de n = ${n1} a n = ${n2}. ¿Qué le ocurrirá a la anchura del histograma de medias?`,
      etiquetaRespuesta: 'Tu predicción sobre la anchura',
      opciones,
      respuesta: opciones.findIndex((o) => o.clave === r.clave),
      pasos: r.pasos,
    };
  }

  if (variante === 1) {
    const datos: DatosCaso = { tipo: 'lado-cola', poblacion, n: n2 };
    const r = resolverCaso(datos);
    const opciones: readonly Opcion[] = [
      { clave: 'izquierda', texto: 'Hacia la izquierda' },
      { clave: 'derecha', texto: 'Hacia la derecha' },
      { clave: 'simetrica', texto: 'Hacia ninguno: será simétrica' },
    ];
    return {
      enunciado: `Población ${p.nombre}, con n = ${n2}. ¿Hacia qué lado caerá la cola del histograma de medias?`,
      etiquetaRespuesta: 'Tu predicción sobre la cola',
      opciones,
      respuesta: opciones.findIndex((o) => o.clave === r.clave),
      pasos: r.pasos,
    };
  }

  const datos: DatosCaso = { tipo: 'menos-asimetrico', poblacion, n1, n2 };
  const r = resolverCaso(datos);
  const opciones: readonly Opcion[] = [
    { clave: 'n1', texto: `Con n = ${n1}` },
    { clave: 'n2', texto: `Con n = ${n2}` },
    { clave: 'iguales', texto: 'Igual en los dos' },
  ];
  return {
    enunciado: `Población ${p.nombre}. ¿Con cuál de los dos tamaños será MENOS asimétrico el histograma de medias: n = ${n1} o n = ${n2}?`,
    etiquetaRespuesta: 'Tu predicción',
    opciones,
    respuesta: opciones.findIndex((o) => o.clave === r.clave),
    pasos: r.pasos,
  };
}

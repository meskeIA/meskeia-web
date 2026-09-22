/**
 * Casos para clase — la tarea asignable de `simulador-fotografia`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la aritmética
 * está bien: un simulador que pinta bokeh y ruido plausibles pasa cualquier compilación
 * ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y sus respuestas se verifican a mano en `tests/apps/simulador-fotografia.spec.ts`.
 *
 * ── EL CONVENIO DE ESTA APP ───────────────────────────────────────────────────
 *
 * Las escalas y las tres funciones de stops NO se replican aquí: `page.tsx` las importa de
 * este módulo, de modo que el medidor de la app y la corrección de los casos no pueden
 * divergir. Si divergieran, la app suspendería una respuesta que ella misma acaba de
 * producir, que es el peor fallo posible en algo que corrige a un alumno.
 *
 *     ΔEV = log₂(ISO/ISO₀) + 2·log₂(N₀/N) + log₂(t/t₀)
 *
 * ⚠️ **POSITIVO = más luz = SOBREexpuesto**, que es el convenio del fotómetro y el que
 * rotula la app. La definición clásica EV = log₂(N²/t) va justo al revés: crece cuando la
 * escena es más luminosa, así que un alumno que venga de ella leerá todos los signos
 * cambiados. El pie de la caja de fórmula de la app lo advierte, y los enunciados de aquí
 * dicen siempre «más luz» o «menos luz» además del signo.
 *
 * ⚠️ **Las tres escalas son NOMINALES, no potencias exactas de dos, y es lo que hace que un
 * caso mal elegido no tenga respuesta limpia.** f/11 es el nombre comercial de 11,314 y
 * 1/15 s el de 1/16: de f/8 a f/11 hay 0,92 EV, y de 1/60 a 1/125 hay 1,06. Por eso los doce
 * casos se mueven dentro de las FAMILIAS EXACTAS de abajo, donde cada salto vale un número
 * entero de stops por los dos caminos — es la misma técnica que en `calculadora-estadistica`
 * eligió datos donde los tres métodos de cuartiles coinciden, para que nadie acierte el
 * método y falle el caso. Los casos 9 y 10 son la excepción DELIBERADA: existen para enseñar
 * justamente ese redondeo comercial, y lo dicen en el enunciado.
 */

/* ─────────────────── Las escalas y la aritmética, compartidas con la vista ─────────────────── */

export const ISO_VALUES = [100, 200, 400, 800, 1600, 3200, 6400] as const;
export const APERTURE_VALUES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22] as const;
export const SHUTTER_VALUES = [
  1, 1 / 2, 1 / 4, 1 / 8, 1 / 15, 1 / 30, 1 / 60, 1 / 125, 1 / 250, 1 / 500, 1 / 1000, 1 / 2000, 1 / 4000,
] as const;

/**
 * Los denominadores de la escala de velocidad, en el MISMO orden que `SHUTTER_VALUES`.
 *
 * Existe para que un caso pueda escribir «1/125» como el entero 125 y no como 0,008: así el
 * enunciado, la respuesta del alumno y el índice del deslizador hablan del mismo número sin
 * pasar por la coma flotante. El test exige que `1/SHUTTER_DENOMINADORES[i]` sea exactamente
 * `SHUTTER_VALUES[i]` en los trece puestos; si alguien tocara una de las dos listas, salta.
 */
export const SHUTTER_DENOMINADORES = [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000, 4000] as const;

export function isoStops(idx: number) {
  return Math.log2(ISO_VALUES[idx] / ISO_VALUES[0]);
}

export function apertureStops(idx: number) {
  // Cantidad de luz ∝ 1/f². Stop = -2·log2(f/f_ref). f bajo = más luz.
  return -2 * Math.log2(APERTURE_VALUES[idx] / APERTURE_VALUES[0]);
}

export function shutterStops(idx: number) {
  return Math.log2(SHUTTER_VALUES[idx] / SHUTTER_VALUES[0]);
}

/** Combinación de referencia de una escena: los tres índices de sus deslizadores. */
export interface Referencia {
  isoIdx: number;
  apIdx: number;
  shIdx: number;
}

export function calcDeltaEV(isoIdx: number, apIdx: number, shIdx: number, ref: Referencia) {
  return (
    (isoStops(isoIdx) - isoStops(ref.isoIdx)) +
    (apertureStops(apIdx) - apertureStops(ref.apIdx)) +
    (shutterStops(shIdx) - shutterStops(ref.shIdx))
  );
}

/**
 * Índice de la escala cuyo valor en stops queda más cerca del objetivo.
 *
 * El modo compensado sumaba el número de stops directamente AL ÍNDICE del deslizador. Para
 * el ISO cuela, porque `isoStops(i)` vale exactamente `i` (100, 200, 400… son potencias de
 * dos), pero para la velocidad no: `shutterStops` DECRECE al avanzar el índice (idx 0 = 1 s,
 * idx 12 = 1/4000 s), así que para aportar +n stops de luz el índice tiene que BAJAR n. Al
 * sumarlos, la corrección no cancelaba el error sino que lo DUPLICABA, y el simulador
 * enseñaba justo lo contrario de la regla que dice enseñar: de f/2,8 a f/8 en modo
 * compensado marcaba −6,0 EV donde debía marcar +0,0. Además la escala de velocidades no
 * es exactamente logarítmica (de 1/8 a 1/15 hay 0,91 stops, no 1), de modo que contar
 * índices tampoco daría el valor correcto aunque el signo fuese el bueno.
 */
export function indiceParaStops(objetivo: number, stopsDe: (i: number) => number, longitud: number) {
  let mejor = 0;
  for (let i = 1; i < longitud; i++) {
    if (Math.abs(stopsDe(i) - objetivo) < Math.abs(stopsDe(mejor) - objetivo)) mejor = i;
  }
  return mejor;
}

/**
 * Desviación por debajo de la cual la exposición se considera correcta. Medio décimo de stop
 * no lo distingue ningún ojo ni ningún fotómetro, y la escala de velocidades deja restos de
 * centésimas al compensar porque no es exactamente logarítmica.
 */
export const TOLERANCIA_EV = 0.05;

/* ─────────────────── Familias donde el salto vale un número entero de stops ─────────────────── */

/**
 * Dentro de cada familia el cociente entre dos valores consecutivos es exactamente 2 (o √2
 * en diafragmas, que es lo mismo tras el ×2 del área), así que el resultado sale redondo.
 * ENTRE familias no: f/5,6 → f/11 son 1,95 EV y no 2, porque 11 es el nombre comercial de
 * 11,314. El generador aleatorio se mueve siempre dentro de una sola familia.
 */
export const FAMILIAS_APERTURA: ReadonlyArray<readonly number[]> = [
  [1.4, 2.8, 5.6],
  [2, 4, 8, 16],
  [11, 22],
];

export const FAMILIAS_VELOCIDAD: ReadonlyArray<readonly number[]> = [
  [1, 2, 4, 8],
  [15, 30, 60],
  [125, 250, 500, 1000, 2000, 4000],
];

/* ─────────────────── Datos de un caso y su resolución ─────────────────── */

/** Qué se le pide al alumno: la variación de exposición, o el valor que la compensa. */
export type Pregunta = 'deltaEV' | 'iso' | 'apertura' | 'velocidad';

export interface DatosCaso {
  /** Combinación de partida: ISO, número f y denominador de la velocidad (125 = 1/125 s). */
  iso0: number;
  ap0: number;
  den0: number;
  /** Valores de destino. El del parámetro preguntado se deja sin declarar: se calcula. */
  iso1?: number;
  ap1?: number;
  den1?: number;
  pregunta: Pregunta;
  /** Decimales de la respuesta. Por defecto 2; los casos redondos declaran 0. */
  decimales?: number;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Formatea un número en español, con los decimales que se le pidan como máximo. */
function numero(n: number, decimales = 2): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** Índice de un valor en su escala, o −1 si no pertenece a ella. */
function indiceISO(iso: number) {
  return (ISO_VALUES as readonly number[]).indexOf(iso);
}
function indiceApertura(f: number) {
  return (APERTURE_VALUES as readonly number[]).indexOf(f);
}
function indiceVelocidad(den: number) {
  return (SHUTTER_DENOMINADORES as readonly number[]).indexOf(den);
}

/** «1/125 s», o «1 s» y «2 s» para las exposiciones largas de la escala. */
export function textoVelocidad(den: number): string {
  return den === 1 ? '1 s' : `1/${den} s`;
}

/** «f/2,8» con la coma decimal española. */
export function textoApertura(f: number): string {
  return `f/${numero(f, 1)}`;
}

const EJES: Record<'iso' | 'apertura' | 'velocidad', string> = {
  iso: 'la sensibilidad ISO',
  apertura: 'el diafragma',
  velocidad: 'la velocidad de obturación',
};

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 *
 * Cuando la pregunta es de compensación, el valor devuelto es el de la escala que deja la
 * exposición donde estaba. Si el mejor valor de la escala se desvía más de `TOLERANCIA_EV`,
 * la pregunta NO tiene respuesta única y se rechaza el caso en lugar de dar el más parecido:
 * un enunciado ambiguo corregido con mano dura es peor que un enunciado que no existe.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const pasos: string[] = [];
  const i0 = indiceISO(datos.iso0);
  const a0 = indiceApertura(datos.ap0);
  const v0 = indiceVelocidad(datos.den0);
  if (i0 < 0 || a0 < 0 || v0 < 0) {
    return { ok: false, valor: NaN, pasos, error: 'La combinación de partida no está en las escalas de la app.' };
  }

  const partida: Referencia = { isoIdx: i0, apIdx: a0, shIdx: v0 };
  pasos.push(
    `Partida: ISO ${numero(datos.iso0, 0)} · ${textoApertura(datos.ap0)} · ${textoVelocidad(datos.den0)}.`,
  );

  // Destinos conocidos. El del parámetro preguntado se queda en el de partida por ahora.
  const i1 = datos.iso1 === undefined ? i0 : indiceISO(datos.iso1);
  const a1 = datos.ap1 === undefined ? a0 : indiceApertura(datos.ap1);
  const v1 = datos.den1 === undefined ? v0 : indiceVelocidad(datos.den1);
  if (i1 < 0 || a1 < 0 || v1 < 0) {
    return { ok: false, valor: NaN, pasos, error: 'La combinación de destino no está en las escalas de la app.' };
  }

  const dIso = isoStops(i1) - isoStops(i0);
  const dAp = apertureStops(a1) - apertureStops(a0);
  const dSh = shutterStops(v1) - shutterStops(v0);

  if (datos.iso1 !== undefined && datos.iso1 !== datos.iso0) {
    pasos.push(
      `El ISO pasa de ${numero(datos.iso0, 0)} a ${numero(datos.iso1, 0)}: log₂(${numero(datos.iso1, 0)}/${numero(datos.iso0, 0)}) = ${dIso > 0 ? '+' : ''}${numero(dIso)} EV.`,
    );
  }
  if (datos.ap1 !== undefined && datos.ap1 !== datos.ap0) {
    pasos.push(
      `El diafragma pasa de ${textoApertura(datos.ap0)} a ${textoApertura(datos.ap1)}: −2·log₂(${numero(datos.ap1, 1)}/${numero(datos.ap0, 1)}) = ${dAp > 0 ? '+' : ''}${numero(dAp)} EV.`,
    );
  }
  if (datos.den1 !== undefined && datos.den1 !== datos.den0) {
    pasos.push(
      `La velocidad pasa de ${textoVelocidad(datos.den0)} a ${textoVelocidad(datos.den1)}: log₂(${numero(datos.den0, 0)}/${numero(datos.den1, 0)}) = ${dSh > 0 ? '+' : ''}${numero(dSh)} EV.`,
    );
  }

  if (datos.pregunta === 'deltaEV') {
    const total = dIso + dAp + dSh;
    pasos.push(
      `Suma de los tres ejes: ${total > 0 ? '+' : ''}${numero(total)} EV. ` +
        (Math.abs(total) < TOLERANCIA_EV
          ? 'La exposición se conserva: los cambios se cancelan entre sí.'
          : total > 0
            ? 'Positivo quiere decir MÁS luz, así que la foto sale más clara.'
            : 'Negativo quiere decir MENOS luz, así que la foto sale más oscura.'),
    );
    return { ok: true, valor: total, pasos };
  }

  // Compensación: lo que han aportado los otros dos ejes hay que devolverlo con el tercero.
  const aportadoPorOtros =
    (datos.pregunta === 'iso' ? 0 : dIso) +
    (datos.pregunta === 'apertura' ? 0 : dAp) +
    (datos.pregunta === 'velocidad' ? 0 : dSh);

  pasos.push(
    `Para conservar la exposición, ${EJES[datos.pregunta]} tiene que aportar ${-aportadoPorOtros > 0 ? '+' : ''}${numero(-aportadoPorOtros)} EV.`,
  );

  const stopsDe =
    datos.pregunta === 'iso' ? isoStops : datos.pregunta === 'apertura' ? apertureStops : shutterStops;
  const longitud =
    datos.pregunta === 'iso'
      ? ISO_VALUES.length
      : datos.pregunta === 'apertura'
        ? APERTURE_VALUES.length
        : SHUTTER_VALUES.length;
  const desde = datos.pregunta === 'iso' ? i0 : datos.pregunta === 'apertura' ? a0 : v0;

  const objetivo = stopsDe(desde) - aportadoPorOtros;
  const idx = indiceParaStops(objetivo, stopsDe, longitud);
  const desviacion = stopsDe(idx) - objetivo;

  if (Math.abs(desviacion) > TOLERANCIA_EV) {
    return {
      ok: false,
      valor: NaN,
      pasos,
      error: 'Ningún valor de la escala compensa exactamente ese cambio.',
    };
  }

  const valor =
    datos.pregunta === 'iso'
      ? ISO_VALUES[idx]
      : datos.pregunta === 'apertura'
        ? APERTURE_VALUES[idx]
        : SHUTTER_DENOMINADORES[idx];

  const nombre =
    datos.pregunta === 'iso'
      ? `ISO ${numero(valor, 0)}`
      : datos.pregunta === 'apertura'
        ? textoApertura(valor)
        : textoVelocidad(valor);

  pasos.push(`El valor de la escala que lo consigue es ${nombre}.`);
  pasos.push('Comprobación: sumando los tres ejes, ΔEV = 0,00. La exposición se conserva.');

  return { ok: true, valor, pasos };
}

/* ─────────────────── Corrección ─────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: así un 0,92 no se corrige a ciegas. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 */
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
  if (diferencia <= tolerancia) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  // El signo cambiado es EL error de este tema: quien viene del EV clásico lo invierte entero.
  if (esperado !== 0 && Math.abs(usuario + esperado) <= tolerancia) {
    return {
      correcto: false,
      motivo:
        'El número está bien, pero el signo va al revés: aquí positivo es MÁS luz (sobreexpuesto).',
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────── Los doce casos ─────────────────── */

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
  /** El enunciado pide redondear: la respuesta no es un número redondo de stops. */
  requiereRedondeo?: boolean;
}

const ETIQUETAS: Record<Pregunta, string> = {
  deltaEV: 'Variación de exposición, en EV (con su signo: + más luz, − menos luz)',
  iso: 'Valor de ISO',
  apertura: 'Número f (escribe 2,8 para f/2,8)',
  velocidad: 'Denominador de la velocidad (escribe 500 para 1/500 s)',
};

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso` más
 * abajo, de modo que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España y un
 * enunciado anclado excluye a la mayor parte del público que lo va a leer. Las tres escenas
 * que se nombran (retrato, paisaje, deportes) son las de la app, no lugares.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Cerrar el diafragma un paso doble',
    enunciado:
      'Tienes la cámara en ISO 100, f/4 y 1/250 s. Cierras el diafragma hasta f/8 sin tocar nada más. ¿Cuánto cambia la exposición?',
    categoria: 'abstracto',
    datos: { iso0: 100, ap0: 4, den0: 250, ap1: 8, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'La luz que entra va con el ÁREA del diafragma, que depende de f². Duplicar el número f no divide la luz entre 2.',
  },
  {
    id: 2,
    titulo: 'Subir tres pasos de ISO',
    enunciado:
      'Pasas de ISO 200 a ISO 1600 dejando el diafragma y la velocidad como estaban. ¿Cuánto cambia la exposición?',
    categoria: 'abstracto',
    datos: { iso0: 200, ap0: 5.6, den0: 125, iso1: 1600, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'Cada vez que el ISO se duplica, la imagen recibe el equivalente a un paso más de luz. ¿Cuántas veces se duplica 200 hasta llegar a 1600?',
  },
  {
    id: 3,
    titulo: 'Congelar el movimiento',
    enunciado:
      'Aceleras la obturación de 1/125 s a 1/1000 s para congelar a un sujeto en movimiento, sin tocar ISO ni diafragma. ¿Cuánto cambia la exposición?',
    categoria: 'abstracto',
    datos: { iso0: 400, ap0: 4, den0: 125, den1: 1000, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'El obturador está abierto la octava parte de tiempo. Cuenta cuántas veces se ha partido por la mitad.',
  },
  {
    id: 4,
    titulo: 'Retrato: abrir el diafragma y compensar',
    enunciado:
      'La escena de retrato parte de ISO 800, f/2,8 y 1/125 s. Quieres más desenfoque de fondo y abres hasta f/1,4. Si el ISO se queda en 800, ¿a qué velocidad hay que ir para que la foto conserve la misma exposición?',
    categoria: 'aplicado',
    datos: { iso0: 800, ap0: 2.8, den0: 125, ap1: 1.4, pregunta: 'velocidad', decimales: 0 },
    etiquetaRespuesta: ETIQUETAS.velocidad,
    pista: 'Abrir de f/2,8 a f/1,4 mete dos pasos más de luz. El obturador tiene que quitar exactamente esos dos pasos.',
  },
  {
    id: 5,
    titulo: 'Paisaje: más profundidad de campo',
    enunciado:
      'La escena de paisaje parte de ISO 100, f/11 y 1/250 s. Cierras hasta f/22 para llevar la nitidez del primer plano al horizonte y mantienes la velocidad en 1/250 s. ¿Qué ISO conserva la misma exposición?',
    categoria: 'aplicado',
    datos: { iso0: 100, ap0: 11, den0: 250, ap1: 22, pregunta: 'iso', decimales: 0 },
    etiquetaRespuesta: ETIQUETAS.iso,
    pista: 'De f/11 a f/22 el número f se duplica, y eso cuesta dos pasos de luz. El ISO tiene que devolver esos dos pasos.',
  },
  {
    id: 6,
    titulo: 'Deportes: congelar sin perder luz',
    enunciado:
      'La escena de deportes parte de ISO 400, f/4 y 1/1000 s. Subes a 1/4000 s para congelar del todo la acción y dejas el ISO en 400. ¿Qué número f conserva la misma exposición?',
    categoria: 'aplicado',
    datos: { iso0: 400, ap0: 4, den0: 1000, den1: 4000, pregunta: 'apertura' },
    etiquetaRespuesta: ETIQUETAS.apertura,
    pista: 'Pasar de 1/1000 a 1/4000 quita dos pasos de luz. Para recuperarlos, el diafragma tiene que abrirse dos pasos: el número f se divide por 2.',
  },
  {
    id: 7,
    titulo: 'La pareja que se cancela',
    enunciado:
      'Partes de ISO 100, f/2 y 1/500 s. Subes el ISO a 400 y a la vez cierras el diafragma a f/4, sin tocar la velocidad. ¿Cuánto cambia la exposición?',
    categoria: 'abstracto',
    datos: { iso0: 100, ap0: 2, den0: 500, iso1: 400, ap1: 4, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'Calcula los dos ejes por separado, con su signo, y súmalos. Uno mete luz y el otro la quita.',
  },
  {
    id: 8,
    titulo: 'Dos cambios que NO se cancelan',
    enunciado:
      'Partes de ISO 100, f/2 y 1/500 s. Subes el ISO a 400 y cierras el diafragma hasta f/8, sin tocar la velocidad. ¿Cuánto cambia la exposición?',
    categoria: 'abstracto',
    datos: { iso0: 100, ap0: 2, den0: 500, iso1: 400, ap1: 8, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'Es el caso 7 con un paso doble más de cierre. El ISO aporta lo mismo que antes; el diafragma, el doble.',
  },
  {
    id: 9,
    titulo: 'Por qué f/11 no es un paso entero',
    enunciado:
      'Cierras el diafragma de f/8 a f/11 sin tocar nada más. La serie de números f está redondeada para que se lea bien: f/11 es en realidad 11,3. Calcula el cambio exacto de exposición con el número que aparece en la cámara (11) y redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { iso0: 200, ap0: 8, den0: 125, ap1: 11, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'Aplica −2·log₂(11/8) tal cual. El resultado se queda algo por debajo de un paso entero, y esa diferencia es el redondeo del rótulo.',
    requiereRedondeo: true,
  },
  {
    id: 10,
    titulo: 'El mismo redondeo, en la velocidad',
    enunciado:
      'Aceleras la obturación de 1/60 s a 1/125 s sin tocar nada más. La serie de velocidades también está redondeada: 1/125 es en realidad 1/128. Calcula el cambio exacto con los números que aparecen en la cámara y redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { iso0: 400, ap0: 5.6, den0: 60, den1: 125, pregunta: 'deltaEV' },
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pista: 'log₂(60/125) da algo más de un paso entero, justo al revés que en el caso 9: aquí el rótulo se queda corto y el paso real es mayor.',
    requiereRedondeo: true,
  },
  {
    id: 11,
    titulo: 'Bajar la velocidad y controlar el ruido',
    enunciado:
      'Partes de ISO 400, f/4 y 1/1000 s. El sujeto ya no se mueve tan rápido y bajas a 1/250 s, dejando el diafragma en f/4. ¿Qué ISO conserva la misma exposición?',
    categoria: 'aplicado',
    datos: { iso0: 400, ap0: 4, den0: 1000, den1: 250, pregunta: 'iso', decimales: 0 },
    etiquetaRespuesta: ETIQUETAS.iso,
    pista: 'Un obturador cuatro veces más lento mete dos pasos más de luz. El ISO tiene que quitarlos, así que baja.',
  },
  {
    id: 12,
    titulo: 'Menos ruido a la misma exposición',
    enunciado:
      'Una toma con ISO 1600, f/5,6 y 1/250 s sale con demasiado ruido. Bajas a ISO 400 y mantienes la velocidad en 1/250 s. ¿Qué número f conserva la misma exposición?',
    categoria: 'aplicado',
    datos: { iso0: 1600, ap0: 5.6, den0: 250, iso1: 400, pregunta: 'apertura' },
    etiquetaRespuesta: ETIQUETAS.apertura,
    pista: 'Dividir el ISO entre 4 cuesta dos pasos de luz. El diafragma los devuelve dividiendo entre 2 el número f.',
  },
];

/** Formatea el resultado con su unidad, según lo que se preguntaba. */
export function textoRespuesta(valor: number, pregunta: Pregunta, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  switch (pregunta) {
    case 'iso':
      return `ISO ${numero(valor, 0)}`;
    case 'apertura':
      return textoApertura(valor);
    case 'velocidad':
      return textoVelocidad(valor);
    default:
      return `${valor > 0 ? '+' : ''}${numero(valor, decimales)} EV`;
  }
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.datos.pregunta, decimales),
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────── Modo práctica (aleatorio) ─────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y muy parecidos, así que
 * `Math.floor(rnd() * n)` devuelve el índice 0 para todas las semillas pequeñas y el
 * «aleatorio» acaba dando SIEMPRE el mismo ejercicio. Pasó en `simulador-genetica` el
 * 14/09/2026 y pasó la prueba de reproducibilidad, porque reproducible no es variado.
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

function elige<T>(rnd: () => number, lista: readonly T[]): T {
  return lista[Math.floor(rnd() * lista.length)] ?? lista[0];
}

/**
 * Ejercicio de práctica. Usa EL MISMO `resolverCaso` que los doce fijos: si divergieran, el
 * alumno entrenaría con una regla y sería corregido con otra.
 *
 * Los valores salen siempre de UNA familia exacta, y aun así una compensación puede caer
 * fuera de la escala; por eso se intentan varias combinaciones y, si ninguna cuadra, se cae
 * a una pregunta de ΔEV, que siempre tiene respuesta.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);

  for (let intento = 0; intento < 12; intento++) {
    const famAp = elige(rnd, FAMILIAS_APERTURA);
    const famVel = elige(rnd, FAMILIAS_VELOCIDAD);
    const iso0 = elige(rnd, ISO_VALUES);
    const ap0 = elige(rnd, famAp);
    const den0 = elige(rnd, famVel);
    const pregunta: Pregunta = elige(rnd, ['deltaEV', 'deltaEV', 'iso', 'apertura', 'velocidad'] as const);

    let datos: DatosCaso;
    if (pregunta === 'deltaEV') {
      const ap1 = elige(rnd, famAp);
      const iso1 = elige(rnd, ISO_VALUES);
      if (ap1 === ap0 && iso1 === iso0) continue;
      datos = { iso0, ap0, den0, ap1, iso1, pregunta, decimales: 2 };
    } else if (pregunta === 'velocidad') {
      const ap1 = elige(rnd, famAp);
      if (ap1 === ap0) continue;
      datos = { iso0, ap0, den0, ap1, pregunta, decimales: 0 };
    } else if (pregunta === 'iso') {
      const den1 = elige(rnd, famVel);
      if (den1 === den0) continue;
      datos = { iso0, ap0, den0, den1, pregunta, decimales: 0 };
    } else {
      const iso1 = elige(rnd, ISO_VALUES);
      if (iso1 === iso0) continue;
      datos = { iso0, ap0, den0, iso1, pregunta, decimales: 2 };
    }

    const r = resolverCaso(datos);
    if (!r.ok) continue;

    const decimales = datos.decimales ?? 2;
    return {
      enunciado: enunciadoDe(datos),
      datos,
      respuesta: redondear(r.valor, decimales),
      etiquetaRespuesta: ETIQUETAS[datos.pregunta],
      pasos: r.pasos,
    };
  }

  // Salida segura: un ΔEV de un solo eje, que siempre tiene respuesta.
  const datos: DatosCaso = { iso0: 100, ap0: 4, den0: 250, ap1: 8, pregunta: 'deltaEV', decimales: 2 };
  const r = resolverCaso(datos);
  return {
    enunciado: enunciadoDe(datos),
    datos,
    respuesta: redondear(r.valor, 2),
    etiquetaRespuesta: ETIQUETAS.deltaEV,
    pasos: r.pasos,
  };
}

/** Redacta el enunciado de un ejercicio de práctica a partir de sus datos. */
function enunciadoDe(d: DatosCaso): string {
  const partida = `Partes de ISO ${numero(d.iso0, 0)}, ${textoApertura(d.ap0)} y ${textoVelocidad(d.den0)}.`;
  const cambios: string[] = [];
  if (d.iso1 !== undefined && d.iso1 !== d.iso0) cambios.push(`llevas el ISO a ${numero(d.iso1, 0)}`);
  if (d.ap1 !== undefined && d.ap1 !== d.ap0) cambios.push(`pasas el diafragma a ${textoApertura(d.ap1)}`);
  if (d.den1 !== undefined && d.den1 !== d.den0) cambios.push(`pasas la velocidad a ${textoVelocidad(d.den1)}`);
  const lista =
    cambios.length > 1 ? `${cambios.slice(0, -1).join(', ')} y ${cambios[cambios.length - 1]}` : cambios[0];

  switch (d.pregunta) {
    case 'iso':
      return `${partida} Si ${lista} y el diafragma se queda como está, ¿qué ISO conserva la misma exposición?`;
    case 'apertura':
      return `${partida} Si ${lista} y la velocidad se queda como está, ¿qué número f conserva la misma exposición?`;
    case 'velocidad':
      return `${partida} Si ${lista} y el ISO se queda como está, ¿a qué velocidad hay que ir para conservar la misma exposición?`;
    default:
      return `${partida} Si ${lista} y no tocas nada más, ¿cuánto cambia la exposición? Redondea a dos decimales.`;
  }
}

/**
 * Casos para clase — la tarea asignable de `visualizador-sonido-ondas`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien: una onda SVG que ondula de forma plausible pasa cualquier compilación
 * ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y sus respuestas se verifican a mano en `tests/apps/visualizador-sonido-ondas.spec.ts`.
 *
 * ── EL CONVENIO DE ESTA APP ───────────────────────────────────────────────────
 *
 * Las dos fórmulas del panel superior NO se replican aquí: `page.tsx` las importa de este
 * módulo, así que lo que la app enseña y lo que corrige a un alumno no pueden divergir. Si
 * divergieran, la app suspendería una respuesta que ella misma acaba de producir.
 *
 *     λ = v / f           (longitud de onda, m)
 *     T = 1 / f           (periodo, s)
 *     f_n = n · f_1       (n-ésimo armónico de una fundamental)
 *     L2 = L1 + 10·log₁₀(k)   (nivel al multiplicar la INTENSIDAD por k, dB)
 *
 * ⚠️ **La velocidad por defecto es 343 m/s: aire a 20 °C.** Es el valor con el que la app
 * calcula su tarjeta de longitud de onda, y el sitio por donde este tema se rompe solo — la
 * misma frecuencia da longitudes de onda 4 veces mayores en el agua y 15 en el acero. Por eso
 * todo caso que no sea en aire declara su medio, y la velocidad sale de `VELOCIDADES`, la
 * MISMA tabla que la app pinta en pantalla: el alumno tiene que ir a buscarla allí.
 *
 * ⚠️ **Los decibelios no se suman.** Dos fuentes de 70 dB no dan 140 dB sino 73,01, porque la
 * escala es logarítmica y lo que se duplica es la intensidad. El caso 10 existe justo para eso:
 * es el error que todo el mundo comete y el que un profesor quiere poder corregir sin discutir.
 *
 * ⚠️ Con frecuencia 0 el periodo es infinito, no cero. `periodoDe` devuelve Infinity y
 * `resolverCaso` lo rechaza con un error legible en lugar de imprimir «∞» como resultado.
 */

/* ─────────────────────────── Datos físicos de la app ─────────────────────────── */

export interface VelocidadSonido {
  medio: string;
  velocidad: number;
  unidad: string;
}

/**
 * Velocidad del sonido por medio. Vive aquí y `page.tsx` la importa: es a la vez la tabla que
 * se pinta en la sección «Anatomía de onda» y la fuente de la que los casos sacan su `v`.
 */
export const VELOCIDADES: readonly VelocidadSonido[] = [
  { medio: 'Aire (20 °C)', velocidad: 343, unidad: 'm/s' },
  { medio: 'Agua', velocidad: 1480, unidad: 'm/s' },
  { medio: 'Madera', velocidad: 3300, unidad: 'm/s' },
  { medio: 'Acero', velocidad: 5100, unidad: 'm/s' },
  { medio: 'Diamante', velocidad: 12000, unidad: 'm/s' },
];

/** Aire a 20 °C: el medio por defecto de toda la app. */
export const VELOCIDAD_AIRE = 343;

export interface ExposicionSegura {
  db: number;
  tiempo: string;
  minutos: number;
  color: string;
}

/**
 * Límite de exposición recomendado de NIOSH (DHHS/NIOSH 98-126, 1998): 85 dBA durante una
 * jornada de 8 horas, con una tasa de intercambio de 3 dB — cada +3 dB, la mitad de tiempo:
 *
 *     T (min) = 480 / 2^((L − 85) / 3)
 *
 * Su Tabla 1-1 da, por ejemplo, 100 dBA → 15 min, 110 dBA → 1 min 29 s, 118 dBA → 14 s y
 * 121 dBA → 7 s, que es exactamente lo que devuelve la fórmula.
 */
export const NIOSH_REL_DB = 85;
export const NIOSH_REL_MINUTOS = 480;
export const NIOSH_INTERCAMBIO_DB = 3;

/** Minutos de exposición diaria que el REL de NIOSH admite a un nivel dado. */
export function minutosNiosh(db: number): number {
  return NIOSH_REL_MINUTOS / 2 ** ((db - NIOSH_REL_DB) / NIOSH_INTERCAMBIO_DB);
}

/**
 * Una duración en minutos, con la unidad que la hace legible: «8 horas», «15 min»,
 * «1 min 29 s», «9 s». Los segundos se redondean al entero, como en la Tabla 1-1 de NIOSH.
 */
export function textoDuracion(minutos: number): string {
  if (!(minutos > 0)) return '0 s';
  const horas = minutos / 60;
  if (horas >= 1 && Number.isInteger(horas)) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  const segundosTotales = Math.round(minutos * 60);
  if (segundosTotales < 60) return `${segundosTotales} s`;
  const min = Math.floor(segundosTotales / 60);
  const seg = segundosTotales % 60;
  return seg === 0 ? `${min} min` : `${min} min ${seg} s`;
}

/** Una fila de la tabla: el tiempo SALE de la fórmula de NIOSH, no se escribe a mano. */
function filaExposicion(db: number, color: string): ExposicionSegura {
  const minutos = minutosNiosh(db);
  return { db, tiempo: textoDuracion(minutos), minutos, color };
}

/**
 * Tiempo de exposición sin protección auditiva. `minutos` es el mismo dato que `tiempo`, en
 * forma numérica, para que el caso 6 se pueda corregir: la app lo pinta como texto y el motor
 * lo compara como número, pero la tabla es UNA.
 *
 * ⚠️ 25/09/2026 (hallazgo 1850) — hasta hoy las filas se escribían a mano y las dos últimas
 * no seguían la regla que la tarjeta enuncia encima: 110 dB «< 2 min» (minutos: 2) y 120 dB
 * «0 seg» (minutos: 0, sin barra). Con la fórmula de NIOSH son 1 min 29 s y 8,86 s → «9 s».
 * Ahora las ocho filas salen de `minutosNiosh`, y no pueden volver a divergir.
 */
export const EXPOSICION: readonly ExposicionSegura[] = [
  filaExposicion(85, '#27ae60'),
  filaExposicion(88, '#2ecc71'),
  filaExposicion(91, '#f1c40f'),
  filaExposicion(94, '#e67e22'),
  filaExposicion(97, '#e74c3c'),
  filaExposicion(100, '#c0392b'),
  filaExposicion(110, '#8e44ad'),
  filaExposicion(120, '#6c3483'),
];

/** Minutos de la primera fila: la barra al 100 %. */
const MINUTOS_MAXIMOS = EXPOSICION[0].minutos;

/**
 * Ancho de la barra, en porcentaje, PROPORCIONAL al tiempo que rotula.
 *
 * ── De dónde sale (Inspector, 20/09/2026) ──
 * Antes cada fila traía un `pctBarra` escrito a mano (100, 80, 60, 45, 30, 18, 8, 2) que no
 * era ni lineal ni logarítmico respecto a los minutos: la gráfica contradecía al subtítulo
 * que tiene encima, «cada +3 dB reduce el tiempo a la mitad», porque los tres primeros
 * escalones bajaban un 20-25 % en vez de a la mitad. Y la fila de 0 minutos pintaba barra.
 *
 * Al ser proporcional, las barras de arriba se ven cortísimas — y ESO es justo lo que la
 * sección enseña: a 100 dB queda un 3 % del tiempo que hay a 85 dB. El mínimo de 0,6 % es
 * para que una fila con tiempo distinto de cero no desaparezca del todo; con cero minutos,
 * la barra es cero.
 */
export function anchoBarraExposicion(minutos: number): number {
  if (minutos <= 0) return 0;
  return Math.max(0.6, (minutos / MINUTOS_MAXIMOS) * 100);
}

/* ─────────────────────────── Las fórmulas (compartidas con page.tsx) ─────────────────────────── */

/** λ = v / f. Con f ≤ 0 no hay onda: devuelve Infinity y quien llama decide qué decir. */
export function longitudDeOnda(frecuencia: number, velocidad: number = VELOCIDAD_AIRE): number {
  if (!(frecuencia > 0)) return Infinity;
  return velocidad / frecuencia;
}

/** T = 1 / f, en segundos. */
export function periodoDe(frecuencia: number): number {
  if (!(frecuencia > 0)) return Infinity;
  return 1 / frecuencia;
}

/** f = 1 / T, con T en segundos. */
export function frecuenciaDesdePeriodo(periodoSegundos: number): number {
  if (!(periodoSegundos > 0)) return Infinity;
  return 1 / periodoSegundos;
}

/** f_n = n · f_1. El armónico 1 es la propia fundamental. */
export function armonico(fundamental: number, n: number): number {
  return fundamental * n;
}

/** f_1 = f_n / n. */
export function fundamentalDesdeArmonico(frecuenciaArmonico: number, n: number): number {
  if (!(n > 0)) return NaN;
  return frecuenciaArmonico / n;
}

/**
 * Nivel resultante al multiplicar la INTENSIDAD por `factor`: L2 = L1 + 10·log₁₀(factor).
 * Multiplicar por 10 son +10 dB; por 100, +20; duplicar, +3,01. Nunca se suman los niveles.
 */
export function nivelTrasFactor(nivelDb: number, factor: number): number {
  if (!(factor > 0)) return NaN;
  return nivelDb + 10 * Math.log10(factor);
}

/** Minutos de exposición segura que la tabla da para un nivel exacto. -1 si no está tabulado. */
export function minutosExposicion(db: number): number {
  const fila = EXPOSICION.find((e) => e.db === db);
  return fila ? fila.minutos : -1;
}

/** Velocidad del sonido en un medio de la tabla, por nombre exacto. NaN si no existe. */
export function velocidadEn(medio: string): number {
  const fila = VELOCIDADES.find((v) => v.medio === medio);
  return fila ? fila.velocidad : NaN;
}

/* ─────────────────────────── Resolución de un caso ─────────────────────────── */

function numero(n: number, decimales = 2): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Las siete vías de cálculo. La unión se declara A MANO con sus literales y no se deja a la
 * inferencia: una unión inferida de los `return` de un switch NO discrimina — el campo se
 * ensancha a `string` y las propiedades que faltan se rellenan con `?: undefined`, así que
 * cualquier rama compila leyendo campos de las otras ([[reference_union_discriminada_no_discrimina]]).
 */
export type Entrada =
  // `enMilimetros` existe por el caso 12: un ultrasonido de 110 kHz mide 0,0031 m, y pedir eso
  // en metros obliga a cuatro decimales para nada. La conversión la hace el motor y no el
  // enunciado, porque si la hiciera el alumno estaríamos corrigiendo dos cosas a la vez.
  | { via: 'longitud'; frecuencia: number; medio: string; enMilimetros?: boolean }
  | { via: 'periodo'; frecuencia: number }
  | { via: 'frecuencia'; periodoMs: number }
  | { via: 'armonico'; fundamental: number; n: number }
  | { via: 'fundamental'; frecuenciaArmonico: number; n: number }
  | { via: 'nivel'; nivelDb: number; factor: number }
  | { via: 'exposicion'; db: number };

export interface DatosCaso {
  entrada: Entrada;
  /** Decimales con los que se redondea la respuesta. Por defecto 2. */
  decimales?: number;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/**
 * Recalcula la respuesta de un caso desde sus `datos`, SIN mirar el campo `respuesta`. Es lo
 * que permite al test cazar a quien edita un enunciado y se olvida de la solución.
 *
 * No lanza nunca: un dato imposible sale como `{ ok: false, error }`, porque un `throw` dentro
 * de un render de React tumba la página entera y un error se puede pintar.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const e = datos.entrada;

  switch (e.via) {
    case 'longitud': {
      const v = velocidadEn(e.medio);
      if (!Number.isFinite(v)) {
        return { ok: false, valor: NaN, pasos: [], error: `El medio «${e.medio}» no está en la tabla.` };
      }
      const metros = longitudDeOnda(e.frecuencia, v);
      if (!Number.isFinite(metros)) {
        return { ok: false, valor: NaN, pasos: [], error: 'Sin frecuencia no hay longitud de onda.' };
      }
      const pasos = [
        `Busca la velocidad del sonido en «${e.medio}» en la tabla de medios: v = ${numero(v, 0)} m/s.`,
        `La longitud de onda es λ = v / f.`,
        `λ = ${numero(v, 0)} / ${numero(e.frecuencia, 2)} = ${numero(metros, 6)} m.`,
      ];
      if (e.enMilimetros) {
        pasos.push(`En milímetros: ${numero(metros, 6)} × 1000 = ${numero(metros * 1000, 2)} mm.`);
        return { ok: true, valor: metros * 1000, pasos };
      }
      return { ok: true, valor: metros, pasos };
    }

    case 'periodo': {
      const segundos = periodoDe(e.frecuencia);
      if (!Number.isFinite(segundos)) {
        return { ok: false, valor: NaN, pasos: [], error: 'Con frecuencia 0 el periodo es infinito.' };
      }
      const ms = segundos * 1000;
      return {
        ok: true,
        valor: ms,
        pasos: [
          'El periodo es el tiempo de UN ciclo completo: T = 1 / f.',
          `T = 1 / ${numero(e.frecuencia, 2)} = ${numero(segundos, 6)} s.`,
          `En milisegundos: ${numero(segundos, 6)} × 1000 = ${numero(ms, 4)} ms.`,
        ],
      };
    }

    case 'frecuencia': {
      const segundos = e.periodoMs / 1000;
      const valor = frecuenciaDesdePeriodo(segundos);
      if (!Number.isFinite(valor)) {
        return { ok: false, valor: NaN, pasos: [], error: 'Un periodo de 0 no define ninguna frecuencia.' };
      }
      return {
        ok: true,
        valor,
        pasos: [
          `Pasa el periodo a segundos: ${numero(e.periodoMs, 3)} ms = ${numero(segundos, 6)} s.`,
          'La frecuencia es la inversa del periodo: f = 1 / T.',
          `f = 1 / ${numero(segundos, 6)} = ${numero(valor, 2)} Hz.`,
        ],
      };
    }

    case 'armonico': {
      const valor = armonico(e.fundamental, e.n);
      return {
        ok: true,
        valor,
        pasos: [
          'Los armónicos son múltiplos enteros de la fundamental: f_n = n · f₁.',
          `f_${e.n} = ${e.n} × ${numero(e.fundamental, 2)} = ${numero(valor, 2)} Hz.`,
          'Por eso todos los armónicos de una nota suenan «a la misma nota» y cambian el timbre, no el tono.',
        ],
      };
    }

    case 'fundamental': {
      const valor = fundamentalDesdeArmonico(e.frecuenciaArmonico, e.n);
      if (!Number.isFinite(valor)) {
        return { ok: false, valor: NaN, pasos: [], error: 'No existe el armónico 0.' };
      }
      return {
        ok: true,
        valor,
        pasos: [
          'Si f_n = n · f₁, entonces f₁ = f_n / n.',
          `f₁ = ${numero(e.frecuenciaArmonico, 2)} / ${e.n} = ${numero(valor, 2)} Hz.`,
        ],
      };
    }

    case 'nivel': {
      const valor = nivelTrasFactor(e.nivelDb, e.factor);
      if (!Number.isFinite(valor)) {
        return { ok: false, valor: NaN, pasos: [], error: 'El factor de intensidad tiene que ser mayor que 0.' };
      }
      const sumando = 10 * Math.log10(e.factor);
      return {
        ok: true,
        valor,
        pasos: [
          'Los decibelios NO se suman: la escala es logarítmica y lo que se multiplica es la intensidad.',
          `Multiplicar la intensidad por ${numero(e.factor, 2)} añade 10 · log₁₀(${numero(e.factor, 2)}) = ${numero(sumando, 2)} dB.`,
          `${numero(e.nivelDb, 2)} + ${numero(sumando, 2)} = ${numero(valor, 2)} dB.`,
        ],
      };
    }

    case 'exposicion': {
      const valor = minutosExposicion(e.db);
      if (valor < 0) {
        return { ok: false, valor: NaN, pasos: [], error: `La tabla no da un tiempo para ${e.db} dB.` };
      }
      return {
        ok: true,
        valor,
        pasos: [
          `Busca ${e.db} dB en la tabla de exposición segura de la sección «Decibelios».`,
          `La fila dice: ${EXPOSICION.find((x) => x.db === e.db)?.tiempo}.`,
          `En minutos, ${numero(valor, 2)}.`,
        ],
      };
    }
  }
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: absorbe el redondeo sin dar por buena otra respuesta. */
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
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * ⚠️ 22/09/2026 (hallazgo 1211) — la comparación en el borde EXACTO decidía por el ±1 ulp de
   * la resta en binario, así que la misma desviación se aceptaba por arriba y se rechazaba por
   * abajo: con esperado 0,1 y tolerancia 0,01, «0,11» daba 0,009999999999999995 (dentro) y
   * «0,09» daba 0,010000000000000009 (fuera), y el mensaje de rechazo cifraba la desviación
   * igual que la tolerancia —«te has desviado 0,01»—, que es la forma más desconcertante de
   * suspender a alguien.
   *
   * El margen es 1e-9: nueve órdenes de magnitud por encima del ulp de las cifras que maneja
   * esta app y siete por debajo de la tolerancia más pequeña (0,01), así que absorbe el ruido
   * sin cambiar ninguna decisión real.
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia)} de la respuesta.`,
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
}

type Definicion = Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>;

/**
 * Doce casos DETERMINISTAS y numerados: el caso 3 es el mismo para todos los alumnos y en
 * todas las lecturas. Es lo único que hace que «resuelve los casos 3, 7 y 11» funcione como
 * consigna de clase.
 *
 * Sin ciudades, sin países y sin monedas: el 8,6 % de este canal es España, así que un
 * enunciado anclado a un sitio concreto deja fuera a la mayoría del público.
 */
const DEFINICIONES: readonly Definicion[] = [
  {
    id: 1,
    titulo: 'Longitud de onda en el aire',
    categoria: 'aplicado',
    enunciado:
      'Un altavoz emite un tono puro de 686 Hz al aire libre. Con la velocidad del sonido en el '
      + 'aire que da la tabla de medios, ¿cuál es la longitud de onda de ese sonido?',
    datos: { entrada: { via: 'longitud', frecuencia: 686, medio: 'Aire (20 °C)' } },
    etiquetaRespuesta: 'Longitud de onda en metros (m)',
    pista: 'λ = v / f. La velocidad en el aire está en la primera fila de la tabla de medios.',
  },
  {
    id: 2,
    titulo: 'Duración de un ciclo',
    categoria: 'abstracto',
    enunciado:
      'Una onda sonora tiene una frecuencia de 250 Hz. ¿Cuánto tiempo tarda en completarse '
      + 'UN ciclo? Da el resultado en milisegundos.',
    datos: { entrada: { via: 'periodo', frecuencia: 250 } },
    etiquetaRespuesta: 'Periodo en milisegundos (ms)',
    pista: 'T = 1 / f da segundos. Un segundo son 1000 milisegundos.',
  },
  {
    id: 3,
    titulo: 'Frecuencia a partir del periodo',
    categoria: 'abstracto',
    enunciado:
      'En un osciloscopio se mide que un ciclo completo de una onda sonora dura 2,5 '
      + 'milisegundos. ¿Cuál es su frecuencia?',
    datos: { entrada: { via: 'frecuencia', periodoMs: 2.5 } },
    etiquetaRespuesta: 'Frecuencia en hercios (Hz)',
    pista: 'Frecuencia y periodo son inversos. Pasa antes los milisegundos a segundos.',
  },
  {
    id: 4,
    titulo: 'El mismo sonido, dentro del agua',
    categoria: 'aplicado',
    enunciado:
      'Un sonar emite un pulso de 740 Hz bajo el agua. Busca en la tabla de medios la velocidad '
      + 'del sonido en el agua. ¿Qué longitud de onda tiene ese pulso?',
    datos: { entrada: { via: 'longitud', frecuencia: 740, medio: 'Agua' } },
    etiquetaRespuesta: 'Longitud de onda en metros (m)',
    pista: 'Misma fórmula que en el aire, pero el agua transmite el sonido más de cuatro veces más rápido.',
  },
  {
    id: 5,
    titulo: 'Por dentro de un raíl de acero',
    categoria: 'aplicado',
    enunciado:
      'Al golpear un raíl, el sonido viaja por el acero en vez de por el aire. Si la vibración '
      + 'es de 1700 Hz y usas la velocidad del acero de la tabla, ¿cuál es la longitud de onda?',
    datos: { entrada: { via: 'longitud', frecuencia: 1700, medio: 'Acero' } },
    etiquetaRespuesta: 'Longitud de onda en metros (m)',
    pista: 'El acero es el tercer medio más rápido de la tabla. Compara el resultado con el del caso 1.',
  },
  {
    id: 6,
    titulo: 'Cuánto tiempo se aguanta a 100 dB',
    categoria: 'aplicado',
    enunciado:
      'Una herramienta produce 100 dB. Según la tabla de exposición segura de la sección de '
      + 'decibelios, ¿cuántos minutos se puede estar junto a ella sin protección auditiva?',
    datos: { entrada: { via: 'exposicion', db: 100 }, decimales: 0 },
    etiquetaRespuesta: 'Tiempo en minutos',
    pista: 'No hay que calcular nada: el dato está tabulado. Localiza la fila de los 100 dB.',
  },
  {
    id: 7,
    titulo: 'El cuarto armónico',
    categoria: 'aplicado',
    enunciado:
      'Una cuerda de guitarra vibra con una frecuencia fundamental de 220 Hz. ¿A qué frecuencia '
      + 'suena su CUARTO armónico?',
    datos: { entrada: { via: 'armonico', fundamental: 220, n: 4 } },
    etiquetaRespuesta: 'Frecuencia en hercios (Hz)',
    pista: 'Los armónicos son múltiplos enteros de la fundamental; el primero es ella misma.',
  },
  {
    id: 8,
    titulo: 'De vuelta a la fundamental',
    categoria: 'abstracto',
    enunciado:
      'En el espectro de un tubo sonoro se mide que su QUINTO armónico está en 1100 Hz. '
      + '¿Cuál es su frecuencia fundamental?',
    datos: { entrada: { via: 'fundamental', frecuenciaArmonico: 1100, n: 5 } },
    etiquetaRespuesta: 'Frecuencia en hercios (Hz)',
    pista: 'Es el caso 7 al revés: divide en lugar de multiplicar.',
  },
  {
    id: 9,
    titulo: 'Cien veces más intenso',
    categoria: 'abstracto',
    enunciado:
      'Un motor se mide en 60 dB. Si su intensidad sonora se multiplica por 100, ¿qué nivel '
      + 'en decibelios se mide entonces?',
    datos: { entrada: { via: 'nivel', nivelDb: 60, factor: 100 } },
    etiquetaRespuesta: 'Nivel en decibelios (dB)',
    pista: 'Multiplicar la intensidad por 10 añade 10 dB. Por 100 son dos pasos de esos.',
  },
  {
    id: 10,
    titulo: 'Dos máquinas iguales a la vez',
    categoria: 'aplicado',
    enunciado:
      'Una máquina produce 70 dB. Se enciende una segunda máquina idéntica al lado, de modo que '
      + 'la intensidad sonora total se duplica. ¿Qué nivel se mide ahora? (No son 140 dB.)',
    datos: { entrada: { via: 'nivel', nivelDb: 70, factor: 2 } },
    etiquetaRespuesta: 'Nivel en decibelios (dB)',
    pista: 'Duplicar la intensidad añade 10 · log₁₀(2) decibelios, que es poco más de 3.',
  },
  {
    id: 11,
    titulo: 'El grave más grave que se oye',
    categoria: 'aplicado',
    enunciado:
      'El límite inferior del rango audible humano está en 20 Hz. ¿Qué longitud de onda tiene '
      + 'en el aire un sonido de esa frecuencia?',
    datos: { entrada: { via: 'longitud', frecuencia: 20, medio: 'Aire (20 °C)' } },
    etiquetaRespuesta: 'Longitud de onda en metros (m)',
    pista: 'Sale un número grande: por eso los graves atraviesan paredes y se oyen desde lejos.',
  },
  {
    id: 12,
    titulo: 'El ultrasonido de un murciélago',
    categoria: 'aplicado',
    enunciado:
      'Un murciélago emite ultrasonidos de hasta 110 kHz, muy por encima del oído humano. '
      + '¿Qué longitud de onda tiene en el aire un sonido de 110.000 Hz? Da el resultado en '
      + 'milímetros.',
    datos: { entrada: { via: 'longitud', frecuencia: 110000, medio: 'Aire (20 °C)', enMilimetros: true } },
    etiquetaRespuesta: 'Longitud de onda en milímetros (mm)',
    pista: 'Calcula λ en metros con la fórmula de siempre y pásalo a milímetros. Sale un valor '
      + 'diminuto, y por eso el murciélago puede «ver» objetos pequeños con el eco.',
  },
];

/**
 * La unidad que acompaña al resultado, sacada de la etiqueta.
 *
 * Existe para que la vista no tenga que recortar la etiqueta por su cuenta: un número suelto
 * junto a media etiqueta se lee mal.
 */
export function unidadDe(etiqueta: string): string {
  const corte = etiqueta.indexOf(' en ');
  return corte === -1 ? etiqueta : etiqueta.slice(corte + 4);
}

/** Formatea el resultado con su unidad: «0,5 metros (m)». */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  return `${numero(valor, decimales)} ${unidadDe(etiqueta)}`;
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
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando un xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y parecidos, así que `Math.floor(rnd()·n)`
 * devuelve el índice 0 para todas las semillas pequeñas y el «aleatorio» acaba dando SIEMPRE
 * el mismo ejercicio. Pasó en `simulador-genetica` el 14/09/2026 y superó la prueba de
 * reproducibilidad, porque reproducible no es variado.
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
  /**
   * La misma pista que el caso fijo que comparte mecanismo.
   *
   * Hasta el 20/09/2026 el ejercicio generado no traía ninguna, y por eso la vista suprimía
   * la pista en modo práctica: el botón «Ver pista» cambiaba de rótulo y de `aria-expanded`
   * y no aparecía nada debajo. Un botón muerto es peor que un botón ausente.
   */
  pista: string;
}

/**
 * Valores elegidos para que la respuesta salga con dos decimales como mucho.
 *
 * Las frecuencias de la vía «longitud» son divisores exactos de las velocidades de la tabla:
 * si se eligieran al azar, λ saldría con seis decimales y el alumno no podría saber si ha
 * fallado o si ha redondeado distinto.
 */
const COMBINACIONES_LONGITUD = [
  { medio: 'Aire (20 °C)', frecuencias: [343, 686, 1372] },
  { medio: 'Agua', frecuencias: [370, 740, 1480] },
  { medio: 'Madera', frecuencias: [660, 1100, 1650] },
  { medio: 'Acero', frecuencias: [850, 1700, 2550] },
] as const;
const FRECUENCIAS_PERIODO = [125, 200, 250, 400, 500, 800, 1000] as const;
const FUNDAMENTALES = [110, 220, 330, 440] as const;
const ARMONICOS = [2, 3, 4, 5, 6] as const;
const NIVELES = [50, 60, 70, 80, 90] as const;
const FACTORES = [2, 10, 100, 1000] as const;
const VIAS = ['longitud', 'periodo', 'armonico', 'nivel'] as const;

/**
 * Ejercicio aleatorio de ondas sonoras. Usa EL MISMO `resolverCaso` que los doce fijos: si
 * divergieran, el alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const via = VIAS[Math.floor(rnd() * VIAS.length)] ?? 'longitud';

  let datos: DatosCaso;
  let enunciado: string;
  let etiquetaRespuesta: string;

  if (via === 'longitud') {
    const combo = COMBINACIONES_LONGITUD[Math.floor(rnd() * COMBINACIONES_LONGITUD.length)]
      ?? COMBINACIONES_LONGITUD[0];
    const frecuencia = combo.frecuencias[Math.floor(rnd() * combo.frecuencias.length)]
      ?? combo.frecuencias[0];
    datos = { entrada: { via: 'longitud', frecuencia, medio: combo.medio } };
    enunciado = `Una fuente emite un sonido de ${numero(frecuencia, 0)} Hz que se propaga por `
      + `«${combo.medio}». ¿Cuál es su longitud de onda?`;
    etiquetaRespuesta = 'Longitud de onda en metros (m)';
  } else if (via === 'periodo') {
    const frecuencia = FRECUENCIAS_PERIODO[Math.floor(rnd() * FRECUENCIAS_PERIODO.length)] ?? 250;
    datos = { entrada: { via: 'periodo', frecuencia } };
    enunciado = `Una onda sonora tiene una frecuencia de ${numero(frecuencia, 0)} Hz. `
      + '¿Cuánto dura un ciclo completo, en milisegundos?';
    etiquetaRespuesta = 'Periodo en milisegundos (ms)';
  } else if (via === 'armonico') {
    const fundamental = FUNDAMENTALES[Math.floor(rnd() * FUNDAMENTALES.length)] ?? 220;
    const n = ARMONICOS[Math.floor(rnd() * ARMONICOS.length)] ?? 3;
    datos = { entrada: { via: 'armonico', fundamental, n } };
    enunciado = `Una cuerda vibra con una fundamental de ${numero(fundamental, 0)} Hz. `
      + `¿A qué frecuencia suena su armónico número ${n}?`;
    etiquetaRespuesta = 'Frecuencia en hercios (Hz)';
  } else {
    const nivelDb = NIVELES[Math.floor(rnd() * NIVELES.length)] ?? 70;
    const factor = FACTORES[Math.floor(rnd() * FACTORES.length)] ?? 10;
    datos = { entrada: { via: 'nivel', nivelDb, factor } };
    enunciado = `Una fuente se mide en ${numero(nivelDb, 0)} dB. Si su intensidad sonora se `
      + `multiplica por ${numero(factor, 0)}, ¿qué nivel se mide?`;
    etiquetaRespuesta = 'Nivel en decibelios (dB)';
  }

  const r = resolverCaso(datos);
  const decimales = datos.decimales ?? 2;
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, decimales) : NaN,
    etiquetaRespuesta,
    pasos: r.pasos,
    // La pista del primer caso fijo con el mismo mecanismo: así la ayuda siempre habla de la
    // fórmula que toca, y no hay un segundo juego de textos que pueda divergir.
    pista: CASOS.find((c) => c.datos.entrada.via === via)?.pista ?? '',
  };
}

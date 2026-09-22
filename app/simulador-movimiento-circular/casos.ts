/**
 * Casos para clase — la tarea asignable de `simulador-movimiento-circular`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien: un canvas que dibuja un círculo plausible pasa cualquier compilación
 * ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y sus respuestas se verifican a mano en `tests/apps/simulador-movimiento-circular.spec.ts`.
 *
 * ── EL CONVENIO DE ESTA APP ───────────────────────────────────────────────────
 *
 * Las cinco fórmulas que siguen NO se replican aquí: `page.tsx` las importa de este módulo,
 * de modo que el panel de la app y la corrección de los casos no pueden divergir. Si
 * divergieran, la app suspendería una respuesta que ella misma acaba de producir, que es el
 * peor fallo posible en algo que corrige a un alumno.
 *
 *     v   = ω · r          (velocidad lineal o tangencial, m/s)
 *     a_c = ω² · r         (aceleración centrípeta, m/s²)
 *     F_c = m · a_c        (fuerza centrípeta, N)
 *     T   = 2π / ω         (periodo, s)
 *     f   = ω / 2π         (frecuencia, Hz)
 *
 * ⚠️ **ω siempre en rad/s, nunca en grados ni en vueltas por minuto.** Es el convenio del
 * deslizador de la app, y es el sitio por donde este tema se rompe solo: 60 vueltas por
 * minuto NO son 60 rad/s sino 2π rad/s. Por eso los casos que parten de vueltas declaran la
 * vía `vueltas` y la conversión la hace `omegaDe()`, una sola vez y para todos.
 *
 * ⚠️ Con ω = 0 el periodo es infinito, no cero. `periodoDe` devuelve Infinity y
 * `resolverCaso` lo rechaza con un error legible en lugar de imprimir «∞» como resultado.
 */

/* ─────────────────────────── La física, compartida con la vista ─────────────────────────── */

/** Velocidad lineal (tangencial) de un punto que gira a ω a distancia r del centro. */
export function velocidadLineal(omega: number, radio: number): number {
  return omega * radio;
}

/** Aceleración centrípeta: apunta siempre al centro y crece con el CUADRADO de ω. */
export function aceleracionCentripeta(omega: number, radio: number): number {
  return omega * omega * radio;
}

/** Fuerza centrípeta: la que hay que ejercer para mantener la trayectoria curva. */
export function fuerzaCentripeta(masa: number, omega: number, radio: number): number {
  return masa * aceleracionCentripeta(omega, radio);
}

/** Periodo: lo que tarda en dar una vuelta completa. Con ω = 0 no hay vuelta que medir. */
export function periodoDe(omega: number): number {
  return omega > 0 ? (2 * Math.PI) / omega : Infinity;
}

/** Frecuencia: vueltas por segundo. Es la inversa del periodo. */
export function frecuenciaDe(omega: number): number {
  return omega > 0 ? omega / (2 * Math.PI) : 0;
}

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/**
 * Por dónde entra el dato de giro. Todas acaban en ω, que es el convenio de la app: así hay
 * una sola cadena de cálculo y no cinco variantes que puedan discrepar entre sí.
 */
export type Entrada =
  | { via: 'omega'; omega: number }
  | { via: 'periodo'; periodo: number }
  | { via: 'frecuencia'; frecuencia: number }
  | { via: 'vueltas'; vueltas: number; segundos: number }
  | { via: 'velocidad'; velocidad: number };

export type Magnitud = 'omega' | 'velocidad' | 'aceleracion' | 'fuerza' | 'periodo' | 'frecuencia';

export interface DatosCaso {
  /** Radio de la circunferencia, en metros. */
  radio: number;
  /** Masa del objeto que gira, en kg. Solo hace falta para la fuerza centrípeta. */
  masa?: number;
  entrada: Entrada;
  magnitud: Magnitud;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/** ω en rad/s a partir de cualquiera de las vías de entrada. NaN si el dato no sirve. */
export function omegaDe(entrada: Entrada, radio: number): number {
  switch (entrada.via) {
    case 'omega':
      return entrada.omega;
    case 'periodo':
      return entrada.periodo > 0 ? (2 * Math.PI) / entrada.periodo : NaN;
    case 'frecuencia':
      return 2 * Math.PI * entrada.frecuencia;
    case 'vueltas':
      return entrada.segundos > 0 ? (2 * Math.PI * entrada.vueltas) / entrada.segundos : NaN;
    case 'velocidad':
      // v = ω·r  ⟹  ω = v/r. Con radio 0 no hay circunferencia.
      return radio > 0 ? entrada.velocidad / radio : NaN;
    default:
      return NaN;
  }
}

/* ─────────────────────────── Resolución ─────────────────────────── */

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

const NOMBRE_ENTRADA: Record<Entrada['via'], string> = {
  omega: 'la velocidad angular',
  periodo: 'el periodo',
  frecuencia: 'la frecuencia',
  vueltas: 'las vueltas contadas',
  velocidad: 'la velocidad lineal',
};

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const { radio, masa, entrada, magnitud } = datos;
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];

  if (!Number.isFinite(radio) || radio <= 0) {
    return { ok: false, valor: NaN, pasos, error: 'El radio tiene que ser mayor que cero.' };
  }

  const omega = omegaDe(entrada, radio);
  if (!Number.isFinite(omega) || omega <= 0) {
    return {
      ok: false,
      valor: NaN,
      pasos,
      error: `No se puede obtener ω a partir de ${NOMBRE_ENTRADA[entrada.via]}.`,
    };
  }

  // Primer paso: dejar dicho de dónde sale ω, que es el sitio por donde este tema se rompe.
  switch (entrada.via) {
    case 'omega':
      pasos.push(`El enunciado ya da la velocidad angular: ω = ${numero(omega, 4)} rad/s.`);
      break;
    case 'periodo':
      pasos.push(
        `De T = 2π/ω se despeja ω = 2π/T = 2π/${numero(entrada.periodo, 4)} = ${numero(omega, 4)} rad/s.`,
      );
      break;
    case 'frecuencia':
      pasos.push(
        `ω = 2π·f = 2π·${numero(entrada.frecuencia, 4)} = ${numero(omega, 4)} rad/s. Ojo: f está en Hz, es decir, vueltas por segundo.`,
      );
      break;
    case 'vueltas':
      pasos.push(
        `Primero la frecuencia: ${numero(entrada.vueltas, 0)} vueltas en ${numero(entrada.segundos, 0)} s son f = ${numero(entrada.vueltas / entrada.segundos, 4)} Hz.`,
      );
      pasos.push(`Y de ahí ω = 2π·f = ${numero(omega, 4)} rad/s. Una vuelta son 2π radianes.`);
      break;
    case 'velocidad':
      pasos.push(
        `De v = ω·r se despeja ω = v/r = ${numero(entrada.velocidad, 4)}/${numero(radio, 4)} = ${numero(omega, 4)} rad/s.`,
      );
      break;
  }

  let valor: number;
  switch (magnitud) {
    case 'omega':
      valor = omega;
      pasos.push(
        `La velocidad angular es justo lo que se pedía: ω = ${numero(valor, 4)} rad/s. Es la magnitud que mide el ÁNGULO barrido por segundo, no la distancia recorrida.`,
      );
      break;
    case 'velocidad':
      valor = velocidadLineal(omega, radio);
      pasos.push(`v = ω·r = ${numero(omega, 4)}·${numero(radio, 4)} = ${numero(valor, 4)} m/s.`);
      break;
    case 'aceleracion':
      valor = aceleracionCentripeta(omega, radio);
      pasos.push(
        `a_c = ω²·r = ${numero(omega, 4)}²·${numero(radio, 4)} = ${numero(valor, 4)} m/s². Va al CUADRADO: doblar ω multiplica por cuatro la aceleración.`,
      );
      break;
    case 'fuerza': {
      if (!Number.isFinite(masa) || (masa ?? 0) <= 0) {
        return { ok: false, valor: NaN, pasos, error: 'Para la fuerza centrípeta hace falta la masa.' };
      }
      const ac = aceleracionCentripeta(omega, radio);
      pasos.push(`Primero la aceleración: a_c = ω²·r = ${numero(ac, 4)} m/s².`);
      valor = fuerzaCentripeta(masa as number, omega, radio);
      pasos.push(`Y la fuerza: F_c = m·a_c = ${numero(masa as number, 4)}·${numero(ac, 4)} = ${numero(valor, 4)} N.`);
      break;
    }
    case 'periodo':
      valor = periodoDe(omega);
      pasos.push(`T = 2π/ω = 2π/${numero(omega, 4)} = ${numero(valor, 4)} s.`);
      break;
    case 'frecuencia':
      valor = frecuenciaDe(omega);
      pasos.push(`f = ω/2π = ${numero(omega, 4)}/2π = ${numero(valor, 4)} Hz.`);
      break;
    default:
      return { ok: false, valor: NaN, pasos, error: 'Magnitud desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  pasos.push(`Redondeando a ${decimales} decimales: ${numero(redondear(valor, decimales), decimales)}.`);
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: así un 0,1 no se corrige a ciegas. */
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

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso` más
 * abajo, de modo que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España y un
 * enunciado anclado excluye a la mayor parte del público que lo va a leer.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'De velocidad angular a velocidad lineal',
    enunciado:
      'Una piedra atada a una cuerda gira describiendo una circunferencia de 2 m de radio con una velocidad angular constante de 3 rad/s. ¿Cuál es su velocidad lineal?',
    categoria: 'abstracto',
    datos: { radio: 2, entrada: { via: 'omega', omega: 3 }, magnitud: 'velocidad' },
    etiquetaRespuesta: 'v en m/s',
    pista: 'La velocidad lineal es el producto de la angular por el radio. Cuanto más lejos del centro, más deprisa se va.',
  },
  {
    id: 2,
    titulo: 'Aceleración centrípeta a partir de ω',
    enunciado:
      'Un objeto gira a 4 rad/s en una circunferencia de 0,5 m de radio. ¿Cuál es el módulo de su aceleración centrípeta?',
    categoria: 'abstracto',
    datos: { radio: 0.5, entrada: { via: 'omega', omega: 4 }, magnitud: 'aceleracion' },
    etiquetaRespuesta: 'a_c en m/s²',
    pista: 'La velocidad angular va elevada al cuadrado. Si te sale 2, has olvidado el cuadrado.',
  },
  {
    id: 3,
    titulo: 'La fuerza que mantiene la curva',
    enunciado:
      'Una bola de 0,2 kg gira a 2 rad/s en una circunferencia de 1,5 m de radio. ¿Qué fuerza centrípeta hay que ejercer sobre ella para que no se escape por la tangente?',
    categoria: 'abstracto',
    datos: { radio: 1.5, masa: 0.2, entrada: { via: 'omega', omega: 2 }, magnitud: 'fuerza' },
    etiquetaRespuesta: 'F_c en N',
    pista: 'Primero la aceleración centrípeta, y después la segunda ley de Newton: F = m·a.',
  },
  {
    id: 4,
    titulo: 'El periodo de una vuelta',
    enunciado:
      'Un disco gira con velocidad angular constante de 2 rad/s. ¿Cuánto tarda en dar una vuelta completa? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { radio: 1, entrada: { via: 'omega', omega: 2 }, magnitud: 'periodo' },
    etiquetaRespuesta: 'T en segundos',
    pista: 'Una vuelta entera son 2π radianes. Si cada segundo recorre 2 rad, ¿cuántos segundos necesita para 2π?',
  },
  {
    id: 5,
    titulo: 'Del periodo a la velocidad angular',
    enunciado:
      'Una noria tarda 4 s en completar una vuelta. ¿Cuál es su velocidad angular? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { radio: 5, entrada: { via: 'periodo', periodo: 4 }, magnitud: 'omega' },
    etiquetaRespuesta: 'ω en rad/s',
    pista: 'Es el camino inverso del caso anterior: despeja ω de T = 2π/ω.',
  },
  {
    id: 6,
    titulo: 'Contar vueltas para hallar la frecuencia',
    enunciado:
      'Un carrusel da 6 vueltas completas en un minuto. ¿Cuál es su frecuencia en hercios?',
    categoria: 'aplicado',
    datos: { radio: 4, entrada: { via: 'vueltas', vueltas: 6, segundos: 60 }, magnitud: 'frecuencia' },
    etiquetaRespuesta: 'f en Hz',
    pista: 'Un hercio es una vuelta por SEGUNDO. El minuto del enunciado hay que pasarlo a segundos.',
  },
  {
    id: 7,
    titulo: 'De la frecuencia a la velocidad lineal',
    enunciado:
      'Un aspa de 3 m de longitud gira con una frecuencia de 0,5 Hz. ¿A qué velocidad lineal se mueve su punta? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { radio: 3, entrada: { via: 'frecuencia', frecuencia: 0.5 }, magnitud: 'velocidad' },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Pasa primero la frecuencia a velocidad angular con ω = 2π·f, y solo después multiplica por el radio.',
  },
  {
    id: 8,
    titulo: 'Aceleración centrípeta conociendo la velocidad lineal',
    enunciado:
      'Un ciclista toma una curva circular de 3 m de radio a una velocidad constante de 6 m/s. ¿Cuál es su aceleración centrípeta?',
    categoria: 'aplicado',
    datos: { radio: 3, entrada: { via: 'velocidad', velocidad: 6 }, magnitud: 'aceleracion' },
    etiquetaRespuesta: 'a_c en m/s²',
    pista: 'Saca primero ω dividiendo la velocidad entre el radio. Verás que equivale a calcular v²/r.',
  },
  {
    id: 9,
    titulo: 'Doblar la velocidad angular no dobla la aceleración',
    enunciado:
      'Un objeto que gira a 1 rad/s en una circunferencia de 2 m de radio tiene una aceleración centrípeta de 2 m/s². Si ahora gira a 2 rad/s con el mismo radio, ¿cuál es su aceleración centrípeta?',
    categoria: 'abstracto',
    datos: { radio: 2, entrada: { via: 'omega', omega: 2 }, magnitud: 'aceleracion' },
    etiquetaRespuesta: 'a_c en m/s²',
    pista: 'No son 4 m/s². La velocidad angular entra al cuadrado, así que al doblarla la aceleración se multiplica por cuatro.',
  },
  {
    id: 10,
    titulo: 'Fuerza centrípeta a partir de la velocidad lineal',
    enunciado:
      'Un objeto de 0,5 kg recorre una circunferencia de 2 m de radio a 4 m/s constantes. ¿Qué fuerza centrípeta actúa sobre él?',
    categoria: 'aplicado',
    datos: { radio: 2, masa: 0.5, entrada: { via: 'velocidad', velocidad: 4 }, magnitud: 'fuerza' },
    etiquetaRespuesta: 'F_c en N',
    pista: 'Tres pasos encadenados: primero ω a partir de v y r, luego la aceleración centrípeta y por último F = m·a.',
  },
  {
    id: 11,
    titulo: 'Revoluciones por minuto pasadas a rad/s',
    enunciado:
      'Un plato de tocadiscos gira a 45 vueltas por minuto. ¿Cuál es su velocidad angular en radianes por segundo? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { radio: 0.15, entrada: { via: 'vueltas', vueltas: 45, segundos: 60 }, magnitud: 'omega' },
    etiquetaRespuesta: 'ω en rad/s',
    pista: 'Cuidado con el error más común del tema: 45 vueltas por minuto NO son 45 rad/s. Pasa a vueltas por segundo y multiplica por 2π.',
  },
  {
    id: 12,
    titulo: 'Del periodo a la velocidad de la punta',
    enunciado:
      'El aspa de un ventilador mide 0,4 m desde el eje hasta la punta y tarda 0,5 s en dar una vuelta completa. ¿A qué velocidad lineal se mueve la punta? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { radio: 0.4, entrada: { via: 'periodo', periodo: 0.5 }, magnitud: 'velocidad' },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Dos pasos: primero ω = 2π/T y después v = ω·r. Un periodo corto significa una velocidad angular grande.',
  },
];

/**
 * La unidad sola, a partir de una etiqueta del tipo «v en m/s» → «m/s».
 *
 * Existe para que la vista no tenga que recortar la etiqueta por su cuenta: en
 * `simulador-genetica` ese recorte hecho a mano imprimía «Respuesta: 25 de semillas verdes»,
 * que se lee como 25 semillas y no como el 25 % que era (hallazgo 830).
 */
export function unidadDe(etiqueta: string): string {
  const corte = etiqueta.indexOf(' en ');
  return corte === -1 ? etiqueta : etiqueta.slice(corte + 4);
}

/** Formatea el resultado con su unidad: «6 m/s». Lo usan la solución y `respuestaTexto`. */
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

/** Valores elegidos para que la respuesta salga con dos decimales como mucho. */
const RADIOS = [0.5, 1, 1.5, 2, 2.5, 3, 4] as const;
const OMEGAS = [1, 2, 3, 4, 5, 6] as const;
const MASAS = [0.2, 0.5, 1, 2, 5] as const;
const MAGNITUDES = ['velocidad', 'aceleracion', 'fuerza'] as const;

/**
 * Ejercicio aleatorio de movimiento circular uniforme. Usa EL MISMO `resolverCaso` que los
 * doce fijos: si divergieran, el alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const radio = RADIOS[Math.floor(rnd() * RADIOS.length)] ?? 2;
  const omega = OMEGAS[Math.floor(rnd() * OMEGAS.length)] ?? 2;
  const masa = MASAS[Math.floor(rnd() * MASAS.length)] ?? 1;
  const magnitud = MAGNITUDES[Math.floor(rnd() * MAGNITUDES.length)] ?? 'velocidad';

  const datos: DatosCaso = { radio, masa, entrada: { via: 'omega', omega }, magnitud };
  const r = resolverCaso(datos);

  const PREGUNTA: Record<(typeof MAGNITUDES)[number], { texto: string; etiqueta: string }> = {
    velocidad: { texto: '¿Cuál es su velocidad lineal?', etiqueta: 'v en m/s' },
    aceleracion: { texto: '¿Cuál es su aceleración centrípeta?', etiqueta: 'a_c en m/s²' },
    fuerza: { texto: '¿Qué fuerza centrípeta actúa sobre él?', etiqueta: 'F_c en N' },
  };
  const masaTexto = magnitud === 'fuerza' ? `Un objeto de ${numero(masa)} kg` : 'Un objeto';

  return {
    enunciado: `${masaTexto} gira a ${numero(omega)} rad/s en una circunferencia de ${numero(radio)} m de radio. ${PREGUNTA[magnitud].texto}`,
    datos,
    respuesta: r.ok ? redondear(r.valor, 2) : NaN,
    etiquetaRespuesta: PREGUNTA[magnitud].etiqueta,
    pasos: r.pasos,
  };
}

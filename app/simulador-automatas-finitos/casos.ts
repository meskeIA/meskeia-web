/**
 * Casos para clase — la tarea asignable de `simulador-automatas-finitos`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si los algoritmos
 * están bien: un AFD mal determinizado se dibuja igual de bonito y engaña a quien estudia
 * con él ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo
 * funciones puras.
 *
 * ── LA REGLA DE ESTE MÓDULO ───────────────────────────────────────────────────
 *
 * **Aquí no se implementa NADA de teoría de autómatas.** Los cuatro algoritmos que
 * corrigen al alumno —`determinizar`, `minimizar`, `epsilonClausura` y `validarRapido`—
 * se importan de `./motor-conversiones`, que es exactamente lo que ejecuta la app de
 * arriba. Si esto tuviera copia propia, la app podría suspender una respuesta que ella
 * misma acaba de producir en pantalla, que es el peor fallo posible en algo que corrige.
 *
 * Los tres convenios del motor que los enunciados tienen que respetar, porque son
 * decisiones legítimas pero no universales y el alumno resuelve en papel:
 *
 *   1. **La determinización NO añade estado sumidero.** Si una transición muere en el
 *      conjunto vacío, la fila queda en blanco y ese estado no se cuenta. Es como lo
 *      resuelve la mayoría de manuales, y por eso los enunciados lo dicen expresamente.
 *   2. **Un AFD puede ser parcial.** Si no hay transición para un símbolo, la cadena se
 *      rechaza ahí mismo («sin transición»), no se considera aceptada.
 *   3. **La ε-clausura sigue las flechas ε HACIA DELANTE.** Una flecha ε que ENTRA en el
 *      estado no mete su origen en la clausura. Es el error más repetido del tema, y el
 *      caso 5 está construido justamente encima de él.
 */

import {
  EPSILON,
  determinizar,
  epsilonClausura,
  minimizar,
  validarRapido,
  type AutomataMotor,
  type EstadoMotor,
  type ResultadoValidacion,
  type TipoAuto,
  type TransicionMotor,
} from './motor-conversiones';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/**
 * Qué se le pide calcular al alumno. Cada variante acaba en UN número entero, sin
 * ambigüedad posible: «cuántos», nunca «cuáles».
 */
export type TareaCaso =
  | { tipo: 'aceptadas'; cadenas: string[] }
  | { tipo: 'longitud-minima'; cadenas: string[] }
  | { tipo: 'clausura'; estado: string }
  | { tipo: 'estados-afd' }
  | { tipo: 'estados-minimo' }
  | { tipo: 'inalcanzables' }
  | { tipo: 'fusionados' };

export interface DatosCaso {
  /** Cómo se recorre la cadena. Solo interviene en las tareas que validan cadenas. */
  tipo: TipoAuto;
  automata: AutomataMotor;
  tarea: TareaCaso;
}

/* ─────────────────────────── Escritura compacta de autómatas ─────────────────────────── */

/**
 * Estados a partir de una lista separada por espacios: `*` marca el inicial y `!` el final.
 * `'q0*! q1'` son dos estados, el primero inicial Y final.
 *
 * Existe para que las definiciones de abajo se puedan leer y comparar de un vistazo con la
 * tabla del enunciado: un error de transcripción es aquí un caso mal corregido.
 */
function estadosDe(spec: string): EstadoMotor[] {
  return spec
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((token) => {
      const id = token.replace(/[*!]/g, '');
      return {
        id,
        etiqueta: id,
        esInicial: token.includes('*'),
        esFinal: token.includes('!'),
      };
    });
}

/** Transiciones como tripletes «origen símbolo destino» separados por comas. */
function transicionesDe(spec: string): TransicionMotor[] {
  return spec
    .split(',')
    .map((s) => s.trim().split(/\s+/))
    .filter((partes) => partes.length === 3)
    .map(([from, simbolo, to]) => ({ from, to, simbolo }));
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Formatea un número en español. Aquí casi todo son enteros, pero el convenio es el mismo. */
function numero(n: number, decimales = 0): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

const TEXTO_VEREDICTO: Record<ResultadoValidacion, string> = {
  aceptada: 'ACEPTADA',
  rechazada: 'rechazada (termina en un estado no final)',
  'sin-transicion': 'rechazada (se queda sin transición a mitad de camino)',
  pendiente: 'sin resolver',
};

/** Un fallo con mensaje legible. Nunca se lanza: un throw en un render tumba la app. */
function fallo(pasos: string[], error: string): Resolucion {
  return { ok: false, valor: NaN, pasos, error };
}

/**
 * Recalcula la respuesta desde los datos EJECUTANDO el motor, sin mirar el campo
 * `respuesta` del caso. Es lo que hace imposible que un enunciado editado se quede con la
 * solución vieja.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const pasos: string[] = [];
  const { automata, tarea } = datos;

  if (automata.estados.length === 0) {
    return fallo(pasos, 'El autómata no tiene ningún estado.');
  }
  if (!automata.estados.some((e) => e.esInicial)) {
    return fallo(pasos, 'El autómata no tiene estado inicial: no hay por dónde empezar.');
  }

  switch (tarea.tipo) {
    case 'aceptadas': {
      if (tarea.cadenas.length === 0) return fallo(pasos, 'No hay ninguna cadena que probar.');
      let aceptadas = 0;
      for (const cadena of tarea.cadenas) {
        const r = validarRapido(cadena, datos.tipo, automata.estados, automata.transiciones);
        if (r === 'aceptada') aceptadas++;
        pasos.push(`«${cadena}» → ${TEXTO_VEREDICTO[r]}.`);
      }
      pasos.push(
        `Se aceptan ${numero(aceptadas)} de las ${numero(tarea.cadenas.length)} cadenas de la lista.`,
      );
      return { ok: true, valor: aceptadas, pasos };
    }

    case 'longitud-minima': {
      if (tarea.cadenas.length === 0) return fallo(pasos, 'No hay ninguna cadena que probar.');
      const longitudes: number[] = [];
      for (const cadena of tarea.cadenas) {
        const r = validarRapido(cadena, datos.tipo, automata.estados, automata.transiciones);
        if (r === 'aceptada') longitudes.push(cadena.length);
        pasos.push(
          `«${cadena}» (${numero(cadena.length)} símbolos) → ${TEXTO_VEREDICTO[r]}.`,
        );
      }
      if (longitudes.length === 0) {
        return fallo(pasos, 'El autómata no acepta ninguna de las cadenas de la lista.');
      }
      const minima = Math.min(...longitudes);
      pasos.push(
        `De las aceptadas, la más corta tiene ${numero(minima)} símbolos. Ojo: la cadena más corta de la lista no tiene por qué ser una de las aceptadas.`,
      );
      return { ok: true, valor: minima, pasos };
    }

    case 'clausura': {
      const existe = automata.estados.some((e) => e.id === tarea.estado);
      if (!existe) return fallo(pasos, `El autómata no tiene ningún estado ${tarea.estado}.`);
      const clausura = epsilonClausura([tarea.estado], automata.transiciones);
      const salientes = automata.transiciones.filter((t) => t.simbolo === EPSILON);
      pasos.push(
        `Se parte del propio ${tarea.estado}: todo estado pertenece siempre a su propia ε-clausura.`,
      );
      for (const t of salientes) {
        const dentro = clausura.includes(t.from) && clausura.includes(t.to);
        pasos.push(
          `${t.from} —${EPSILON}→ ${t.to}: ${dentro ? `entra ${t.to}` : `NO cuenta, porque a ${t.from} no se llega desde ${tarea.estado} con flechas ${EPSILON} hacia delante`}.`,
        );
      }
      const ordenada = [...clausura].sort((a, b) => a.localeCompare(b, 'es'));
      pasos.push(`ε-clausura(${tarea.estado}) = {${ordenada.join(', ')}} → ${numero(clausura.length)} estados.`);
      return { ok: true, valor: clausura.length, pasos };
    }

    case 'estados-afd': {
      const r = determinizar(automata);
      if (!r.ok) return fallo(pasos, r.error ?? 'No se ha podido determinizar el autómata.');
      pasos.push(`Alfabeto del autómata: {${r.alfabeto.join(', ')}}.`);
      for (const fila of r.filas) {
        pasos.push(
          `${fila.desde} —${fila.simbolo}→ ${fila.hasta ?? '∅ (sin destino: la fila queda vacía y no se crea estado sumidero)'}${fila.nuevo ? '  ← subconjunto nuevo' : ''}`,
        );
      }
      pasos.push(
        `Subconjuntos distintos alcanzados: ${r.correspondencia.map((c) => c.nombre).join(', ')}.`,
      );
      pasos.push(`El AFD resultante tiene ${numero(r.automata.estados.length)} estados.`);
      return { ok: true, valor: r.automata.estados.length, pasos };
    }

    case 'estados-minimo':
    case 'inalcanzables':
    case 'fusionados': {
      const r = minimizar(automata);
      if (!r.ok) return fallo(pasos, r.error ?? 'No se ha podido minimizar el autómata.');

      if (tarea.tipo === 'inalcanzables') {
        pasos.push(
          'Antes de particionar se recorre el autómata desde el estado inicial y se anota a qué estados NO se llega nunca.',
        );
        pasos.push(
          r.inalcanzables.length === 0
            ? 'Todos los estados son alcanzables.'
            : `No se alcanzan: ${r.inalcanzables.join(', ')}.`,
        );
        pasos.push(
          `Son ${numero(r.inalcanzables.length)} estados. Se pueden borrar sin cambiar ni una sola cadena del lenguaje.`,
        );
        return { ok: true, valor: r.inalcanzables.length, pasos };
      }

      for (const ronda of r.rondas) {
        pasos.push(
          `${ronda.descripcion} → ${ronda.clases.map((c) => `{${c.join(',')}}`).join('  ')}`,
        );
      }

      if (tarea.tipo === 'fusionados') {
        const cuantos = r.fusionados.reduce((suma, grupo) => suma + grupo.length, 0);
        pasos.push(
          r.fusionados.length === 0
            ? 'Ninguna clase tiene más de un miembro: no se fusiona nada.'
            : `Clases con más de un miembro: ${r.fusionados.map((g) => `{${g.join(',')}}`).join(', ')}.`,
        );
        pasos.push(
          `Entre todas suman ${numero(cuantos)} estados del autómata original, que son los que se fusionan con algún otro.`,
        );
        return { ok: true, valor: cuantos, pasos };
      }

      if (r.inalcanzables.length > 0) {
        pasos.push(`(Antes de particionar se descartaron los inalcanzables: ${r.inalcanzables.join(', ')}.)`);
      }
      pasos.push(`El AFD mínimo tiene ${numero(r.automata.estados.length)} estados, uno por clase.`);
      return { ok: true, valor: r.automata.estados.length, pasos };
    }

    default:
      return fallo(pasos, 'Tarea desconocida.');
  }
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor: así un 0 o un 1 no se corrigen a ciegas. */
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
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde
 * con un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número entero (aquí todas las respuestas son cuentas de algo).',
      diferencia: NaN,
      tolerancia,
    };
  }
  if (!Number.isFinite(esperado)) {
    return {
      correcto: false,
      motivo: 'Este caso no tiene respuesta calculable.',
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

/* ─────────────────────────── Presentación de la respuesta ─────────────────────────── */

/**
 * Qué se está contando, a partir de una etiqueta del tipo «Tu respuesta, en estados».
 *
 * Existe para que la vista no tenga que recortar la etiqueta por su cuenta: en
 * `simulador-genetica` ese recorte hecho a mano imprimía «Respuesta: 25 de semillas
 * verdes», que se lee como 25 semillas y no como el 25 % que era (hallazgo 830). Aquí el
 * riesgo es el mismo con otra forma: un «4» suelto no distingue 4 estados de 4 cadenas.
 */
export function unidadDe(etiqueta: string): string {
  const corte = etiqueta.indexOf(' en ');
  return corte === -1 ? etiqueta : etiqueta.slice(corte + 4);
}

/** Formatea el resultado con lo que cuenta: «4 estados». */
export function textoRespuesta(valor: number, etiqueta: string): string {
  if (!Number.isFinite(valor)) return '—';
  return `${numero(valor)} ${unidadDe(etiqueta)}`;
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
 * abajo ejecutando el motor, de modo que editar un enunciado sin tocar la solución es
 * imposible.
 *
 * Sin países, ciudades ni monedas: la mayor parte de quien lee esto está fuera de España
 * y un enunciado anclado a un sitio excluye al público que lo va a usar. Los casos
 * «aplicados» son situaciones de informática —analizadores léxicos, validación de
 * credenciales, protocolos—, que sí son universales.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Número par de ceros',
    enunciado:
      'Un AFD sobre el alfabeto {0, 1} tiene dos estados: q0 (inicial y final) y q1. Sus transiciones son δ(q0,0)=q1, δ(q1,0)=q0, δ(q0,1)=q0 y δ(q1,1)=q1. ¿Cuántas de estas seis cadenas acepta: 1, 00, 010, 0110, 101, 0001?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0*! q1'),
        transiciones: transicionesDe('q0 0 q1, q1 0 q0, q0 1 q0, q1 1 q1'),
      },
      tarea: { tipo: 'aceptadas', cadenas: ['1', '00', '010', '0110', '101', '0001'] },
    },
    etiquetaRespuesta: 'Tu respuesta, en cadenas aceptadas',
    pista:
      'El autómata solo cuenta ceros: los unos lo dejan donde está. Una cadena acaba en q0 exactamente cuando tiene un número PAR de ceros, y cero es par.',
  },
  {
    id: 2,
    titulo: 'Cadenas que terminan en «ab»',
    enunciado:
      'Un AFD sobre {a, b} tiene q0 (inicial), q1 y q2 (final), con δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q1, δ(q1,b)=q2, δ(q2,a)=q1 y δ(q2,b)=q0. ¿Cuántas de estas siete cadenas acepta: ab, aab, ba, abab, abb, b, aba?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0* q1 q2!'),
        transiciones: transicionesDe(
          'q0 a q1, q0 b q0, q1 a q1, q1 b q2, q2 a q1, q2 b q0',
        ),
      },
      tarea: { tipo: 'aceptadas', cadenas: ['ab', 'aab', 'ba', 'abab', 'abb', 'b', 'aba'] },
    },
    etiquetaRespuesta: 'Tu respuesta, en cadenas aceptadas',
    pista:
      'Cada estado recuerda cuánto llevas del patrón: q0 «nada», q1 «acabo de leer una a», q2 «acabo de leer ab». Solo cuenta lo que hay al FINAL de la cadena.',
  },
  {
    id: 3,
    titulo: 'Identificadores de un lenguaje de programación',
    enunciado:
      'El analizador léxico de un compilador valida identificadores: han de empezar por letra y seguir con letras o dígitos. Sobre el alfabeto {L, d} (L = letra, d = dígito), el AFD tiene q0 (inicial) y q1 (final), con δ(q0,L)=q1, δ(q1,L)=q1 y δ(q1,d)=q1. No existe δ(q0,d): ahí el autómata se queda sin transición y rechaza. ¿Cuántas de estas seis cadenas acepta: L, Ld, dL, LdL, dd, LLd?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0* q1!'),
        transiciones: transicionesDe('q0 L q1, q1 L q1, q1 d q1'),
      },
      tarea: { tipo: 'aceptadas', cadenas: ['L', 'Ld', 'dL', 'LdL', 'dd', 'LLd'] },
    },
    etiquetaRespuesta: 'Tu respuesta, en cadenas aceptadas',
    pista:
      'Este AFD es PARCIAL: le falta una transición a propósito. Cuando una cadena empieza por dígito, el autómata no tiene a dónde ir y la rechaza ahí mismo, sin leer el resto.',
  },
  {
    id: 4,
    titulo: 'La credencial válida más corta',
    enunciado:
      'Un formulario exige que la credencial contenga al menos un dígito. Sobre {L, d}, el AFD tiene q0 (inicial) y q1 (final), con δ(q0,L)=q0, δ(q0,d)=q1, δ(q1,L)=q1 y δ(q1,d)=q1. De esta lista —LL, LLL, LLd, dLL, LdLL—, ¿cuántos símbolos tiene la cadena ACEPTADA más corta?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0* q1!'),
        transiciones: transicionesDe('q0 L q0, q0 d q1, q1 L q1, q1 d q1'),
      },
      tarea: { tipo: 'longitud-minima', cadenas: ['LL', 'LLL', 'LLd', 'dLL', 'LdLL'] },
    },
    etiquetaRespuesta: 'Tu respuesta, en símbolos',
    pista:
      'q1 es una trampa sin salida en el buen sentido: una vez que aparece un dígito ya no se sale de él. Comprueba primero CUÁLES se aceptan y solo después mira cuál es la más corta de ESAS.',
  },
  {
    id: 5,
    titulo: 'ε-clausura: las flechas tienen sentido',
    enunciado:
      'Un AFND-ε tiene cinco estados: q0 (inicial), q1, q2, q3 y q4 (final). Sus transiciones vacías son q0→q1, q1→q2, q2→q4 y q3→q0; además hay δ(q0,a)=q3 y δ(q4,b)=q4. ¿Cuántos estados contiene la ε-clausura de q0?',
    categoria: 'abstracto',
    datos: {
      tipo: 'nfa',
      automata: {
        estados: estadosDe('q0* q1 q2 q3 q4!'),
        transiciones: transicionesDe(
          `q0 ${EPSILON} q1, q1 ${EPSILON} q2, q2 ${EPSILON} q4, q0 a q3, q3 ${EPSILON} q0, q4 b q4`,
        ),
      },
      tarea: { tipo: 'clausura', estado: 'q0' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'La ε-clausura se recorre SIGUIENDO las flechas, nunca en contra. q3 tiene una flecha ε que ENTRA en q0, y eso no mete a q3 en la clausura de q0. Y no olvides contar el propio q0.',
  },
  {
    id: 6,
    titulo: 'La unión de un motor de expresiones regulares',
    enunciado:
      'Un motor de expresiones regulares compila el patrón a|b con la construcción de Thompson y obtiene seis estados: q0 (inicial), q1, q2, q3, q4 y q5 (final). Las transiciones vacías son q0→q1, q0→q3, q2→q5 y q4→q5; además δ(q1,a)=q2 y δ(q3,b)=q4. ¿Cuántos estados contiene la ε-clausura de q0, que es el conjunto con el que arranca el reconocedor antes de leer ningún carácter?',
    categoria: 'aplicado',
    datos: {
      tipo: 'nfa',
      automata: {
        estados: estadosDe('q0* q1 q2 q3 q4 q5!'),
        transiciones: transicionesDe(
          `q0 ${EPSILON} q1, q0 ${EPSILON} q3, q1 a q2, q3 b q4, q2 ${EPSILON} q5, q4 ${EPSILON} q5`,
        ),
      },
      tarea: { tipo: 'clausura', estado: 'q0' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'Desde q0 solo salen dos flechas ε, una por cada rama de la alternativa. Las de q2 y q4 salen de estados a los que aún no se ha llegado: para pasar por ellas hay que leer antes una a o una b.',
  },
  {
    id: 7,
    titulo: 'Determinizar un AFND que busca «01»',
    enunciado:
      'Un AFND sobre {0, 1} reconoce las cadenas que contienen 01 como subcadena: q0 (inicial) tiene bucles con 0 y con 1 y además δ(q0,0) incluye q1; δ(q1,1)=q2; y q2 (final) tiene bucles con 0 y con 1. Determinízalo por construcción de subconjuntos, sin añadir estado sumidero. ¿Cuántos estados tiene el AFD resultante?',
    categoria: 'abstracto',
    datos: {
      tipo: 'nfa',
      automata: {
        estados: estadosDe('q0* q1 q2!'),
        transiciones: transicionesDe(
          'q0 0 q0, q0 1 q0, q0 0 q1, q1 1 q2, q2 0 q2, q2 1 q2',
        ),
      },
      tarea: { tipo: 'estados-afd' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'Arranca en {q0} y ve anotando a qué subconjunto lleva cada símbolo. Un subconjunto ya visto NO se vuelve a añadir: el AFD termina cuando ninguna fila descubre uno nuevo.',
  },
  {
    id: 8,
    titulo: 'Determinizar con transiciones vacías',
    enunciado:
      'Un AFND-ε sobre {a, b, c} reconoce a*b*c*: q0 (inicial) con δ(q0,a)=q0 y una transición vacía q0→q1; q1 con δ(q1,b)=q1 y una transición vacía q1→q2; y q2 (final) con δ(q2,c)=q2. Determinízalo: el estado inicial del AFD es la ε-clausura de q0, y las transiciones que mueren en el conjunto vacío se dejan en blanco, sin crear estado sumidero. ¿Cuántos estados tiene el AFD resultante?',
    categoria: 'abstracto',
    datos: {
      tipo: 'nfa',
      automata: {
        estados: estadosDe('q0* q1 q2!'),
        transiciones: transicionesDe(
          `q0 a q0, q0 ${EPSILON} q1, q1 b q1, q1 ${EPSILON} q2, q2 c q2`,
        ),
      },
      tarea: { tipo: 'estados-afd' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'Aquí hay que aplicar la ε-clausura DOS veces: al conjunto inicial y al resultado de cada transición. Fíjate en que el lenguaje no permite volver atrás: una vez leída una b, las a ya no valen.',
  },
  {
    id: 9,
    titulo: 'Minimizar un AFD con estados de sobra',
    enunciado:
      'Un AFD sobre {0, 1} tiene cuatro estados: q0 (inicial y final), q1, q2 (final) y q3. Sus transiciones son δ(q0,0)=q1, δ(q0,1)=q2, δ(q1,0)=q0, δ(q1,1)=q3, δ(q2,0)=q3, δ(q2,1)=q0, δ(q3,0)=q2 y δ(q3,1)=q1. ¿Cuántos estados tiene el AFD mínimo equivalente?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0*! q1 q2! q3'),
        transiciones: transicionesDe(
          'q0 0 q1, q0 1 q2, q1 0 q0, q1 1 q3, q2 0 q3, q2 1 q0, q3 0 q2, q3 1 q1',
        ),
      },
      tarea: { tipo: 'estados-minimo' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'Parte de dos clases: finales y no finales. Dos estados se separan solo si, con algún símbolo, van a clases DISTINTAS. Aquí el autómata solo está mirando la paridad de una cosa.',
  },
  {
    id: 10,
    titulo: 'Código muerto en una máquina de estados',
    enunciado:
      'Una herramienta genera la máquina de estados de un protocolo y produce cinco estados sobre {a, b}: q0 (inicial), q1 (final), q2, q3 (final) y q4. Las transiciones son δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q1, δ(q1,b)=q0, δ(q2,a)=q3, δ(q2,b)=q2, δ(q3,a)=q3, δ(q3,b)=q2, δ(q4,a)=q0 y δ(q4,b)=q4. ¿Cuántos estados son inalcanzables desde el inicial y podrían borrarse sin cambiar el lenguaje?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0* q1! q2 q3! q4'),
        transiciones: transicionesDe(
          'q0 a q1, q0 b q0, q1 a q1, q1 b q0, q2 a q3, q2 b q2, q3 a q3, q3 b q2, q4 a q0, q4 b q4',
        ),
      },
      tarea: { tipo: 'inalcanzables' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'Recorre el autómata desde q0 marcando lo que vas tocando, como quien busca código muerto. Que un estado tenga flechas de salida hacia la parte viva no lo hace alcanzable: lo que cuenta es si algo ENTRA en él desde el inicial.',
  },
  {
    id: 11,
    titulo: 'Estados que se fusionan al minimizar',
    enunciado:
      'Un generador de analizadores produce este AFD sobre {a, b} con cinco estados, todos alcanzables: q0 (inicial), q1, q2 (final), q3 y q4. Las transiciones son δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q2, δ(q1,b)=q3, δ(q2,a)=q2, δ(q2,b)=q0, δ(q3,a)=q4, δ(q3,b)=q0, δ(q4,a)=q2 y δ(q4,b)=q3. Al minimizarlo, ¿cuántos de los cinco estados originales quedan agrupados en una clase junto a algún otro estado, es decir, se fusionan?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0* q1 q2! q3 q4'),
        transiciones: transicionesDe(
          'q0 a q1, q0 b q0, q1 a q2, q1 b q3, q2 a q2, q2 b q0, q3 a q4, q3 b q0, q4 a q2, q4 b q3',
        ),
      },
      tarea: { tipo: 'fusionados' },
    },
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pista:
      'No se pregunta cuántas clases quedan, sino cuántos ESTADOS caen en clases de más de un miembro. Una clase con un único estado no fusiona a nadie y no cuenta.',
  },
  {
    id: 12,
    titulo: 'Múltiplos de tres en binario',
    enunciado:
      'Un validador comprueba si un número escrito en binario, leído de izquierda a derecha, es múltiplo de 3. El AFD tiene un estado por resto: q0 (inicial y final, resto 0), q1 (resto 1) y q2 (resto 2), con δ(q0,0)=q0, δ(q0,1)=q1, δ(q1,0)=q2, δ(q1,1)=q0, δ(q2,0)=q1 y δ(q2,1)=q2. ¿Cuántas de estas siete cadenas acepta: 11, 101, 110, 1001, 1010, 1111, 10?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dfa',
      automata: {
        estados: estadosDe('q0*! q1 q2'),
        transiciones: transicionesDe(
          'q0 0 q0, q0 1 q1, q1 0 q2, q1 1 q0, q2 0 q1, q2 1 q2',
        ),
      },
      tarea: { tipo: 'aceptadas', cadenas: ['11', '101', '110', '1001', '1010', '1111', '10'] },
    },
    etiquetaRespuesta: 'Tu respuesta, en cadenas aceptadas',
    pista:
      'Leer un dígito más equivale a duplicar el número y sumarle ese dígito, así que el resto pasa de r a (2r + dígito) mod 3. Puedes comprobarlo convirtiendo cada cadena a decimal.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const valor = r.ok ? r.valor : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta),
    pasos: r.ok ? r.pasos : [r.error ?? 'No se ha podido resolver este caso.'],
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

/** AFD del resto módulo m leyendo el número en binario de izquierda a derecha. */
function automataModulo(m: number): AutomataMotor {
  const estados: EstadoMotor[] = [];
  const transiciones: TransicionMotor[] = [];
  for (let r = 0; r < m; r++) {
    estados.push({ id: `q${r}`, etiqueta: `q${r}`, esInicial: r === 0, esFinal: r === 0 });
    transiciones.push({ from: `q${r}`, to: `q${(2 * r) % m}`, simbolo: '0' });
    transiciones.push({ from: `q${r}`, to: `q${(2 * r + 1) % m}`, simbolo: '1' });
  }
  return { estados, transiciones };
}

/** AFND que acepta las cadenas cuyo k-ésimo símbolo EMPEZANDO POR EL FINAL es un 1. */
function automataKesimoPorLaCola(k: number): AutomataMotor {
  const estados: EstadoMotor[] = [
    { id: 'q0', etiqueta: 'q0', esInicial: true, esFinal: false },
  ];
  const transiciones: TransicionMotor[] = [
    { from: 'q0', to: 'q0', simbolo: '0' },
    { from: 'q0', to: 'q0', simbolo: '1' },
    { from: 'q0', to: 'q1', simbolo: '1' },
  ];
  for (let i = 1; i <= k; i++) {
    estados.push({ id: `q${i}`, etiqueta: `q${i}`, esInicial: false, esFinal: i === k });
    if (i < k) {
      transiciones.push({ from: `q${i}`, to: `q${i + 1}`, simbolo: '0' });
      transiciones.push({ from: `q${i}`, to: `q${i + 1}`, simbolo: '1' });
    }
  }
  return { estados, transiciones };
}

const MODULOS = [2, 3, 4, 5] as const;
const PROFUNDIDADES = [1, 2, 3] as const;

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos: si divergieran, el
 * alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);

  // Dos familias, para que practicar no sea repetir doce veces la misma cuenta.
  if (rnd() < 0.5) {
    const m = MODULOS[Math.floor(rnd() * MODULOS.length)] ?? 3;
    // Una cadena aceptada GARANTIZADA: el binario de un múltiplo de m. Sin ella, una
    // tirada podía dar seis cadenas rechazadas y el ejercicio se resolvía contestando
    // «0» sin recorrer nada, que es justo lo contrario de lo que se quiere practicar.
    const multiplo = (m * (1 + Math.floor(rnd() * 5))).toString(2);
    const cadenas: string[] = [];
    const vistas = new Set<string>([multiplo]);
    while (cadenas.length < 5) {
      const longitud = 2 + Math.floor(rnd() * 4);
      let cadena = '1';
      for (let i = 1; i < longitud; i++) cadena += rnd() < 0.5 ? '0' : '1';
      if (vistas.has(cadena)) continue;
      vistas.add(cadena);
      cadenas.push(cadena);
    }
    // En una posición cualquiera, para que la respuesta no esté siempre en el mismo sitio.
    cadenas.splice(Math.floor(rnd() * (cadenas.length + 1)), 0, multiplo);
    const datos: DatosCaso = {
      tipo: 'dfa',
      automata: automataModulo(m),
      tarea: { tipo: 'aceptadas', cadenas },
    };
    const r = resolverCaso(datos);
    return {
      enunciado: `Un AFD sobre {0, 1} tiene un estado por cada resto de la división entre ${numero(m)}: q0 es inicial y final (resto 0), y desde qr se va a q(2r mod ${numero(m)}) con el símbolo 0 y a q(2r+1 mod ${numero(m)}) con el símbolo 1. Acepta, por tanto, los números binarios múltiplos de ${numero(m)}. ¿Cuántas de estas ${numero(cadenas.length)} cadenas acepta: ${cadenas.join(', ')}?`,
      datos,
      respuesta: r.ok ? r.valor : NaN,
      etiquetaRespuesta: 'Tu respuesta, en cadenas aceptadas',
      pasos: r.ok ? r.pasos : [r.error ?? 'No se ha podido resolver el ejercicio.'],
    };
  }

  const k = PROFUNDIDADES[Math.floor(rnd() * PROFUNDIDADES.length)] ?? 2;
  const datos: DatosCaso = {
    tipo: 'nfa',
    automata: automataKesimoPorLaCola(k),
    tarea: { tipo: 'estados-afd' },
  };
  const r = resolverCaso(datos);
  const ORDINALES: Record<number, string> = { 1: 'último', 2: 'penúltimo', 3: 'antepenúltimo' };
  const ordinal = ORDINALES[k] ?? `${numero(k)}.º empezando por el final`;
  // Con k = 1 no hay cadena de transiciones que describir, y el texto genérico decía
  // «q1→q2→…→q1», que no existe.
  const estructura =
    k === 1
      ? 'Tiene 2 estados: q0 (inicial), con bucles para 0 y para 1 y una transición a q1 con el símbolo 1; q1 es el único estado final.'
      : `Tiene ${numero(k + 1)} estados: q0 (inicial), con bucles para 0 y para 1 y una transición a q1 con el símbolo 1; después una cadena de transiciones q1→q2→…→q${numero(k)} que se toman con cualquier símbolo, y q${numero(k)} es el único estado final.`;
  return {
    enunciado: `Un AFND sobre {0, 1} acepta las cadenas cuyo ${ordinal} símbolo es un 1. ${estructura} Determinízalo por construcción de subconjuntos, sin añadir estado sumidero. ¿Cuántos estados tiene el AFD resultante?`,
    datos,
    respuesta: r.ok ? r.valor : NaN,
    etiquetaRespuesta: 'Tu respuesta, en estados',
    pasos: r.ok ? r.pasos : [r.error ?? 'No se ha podido resolver el ejercicio.'],
  };
}

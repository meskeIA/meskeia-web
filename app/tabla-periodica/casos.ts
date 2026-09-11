/**
 * Motor de las fichas de búsqueda de la Tabla Periódica.
 *
 * Vive fuera de `page.tsx` a propósito. El build compila la vista sin mirar si el dato que
 * se pide existe de verdad en la tabla: una ficha que pregunta por el elemento de Z = 26 y
 * declara «Cu» como solución compila igual de limpio que la correcta, y el error solo se
 * ve leyendo la respuesta en pantalla. Aquí no hay React, ni DOM, ni estado: solo funciones
 * puras que resuelven cada ficha CONSULTANDO `elementos-data.ts`, que es la misma fuente
 * que pinta la tabla. Si un día se corrige un dato allí, la ficha se corrige sola.
 *
 * POR QUÉ ESTA APP ES UNA «FICHA DE BÚSQUEDA» Y NO UN CUESTIONARIO DE CÁLCULO
 * ──────────────────────────────────────────────────────────────────────────
 * La tabla periódica no calcula nada: se consulta. La tarea que un profesor puede asignar
 * aquí no es «resuelve», es «localiza»: encontrar el dato es el ejercicio, y el camino
 * hasta él —saber que los grupos son las columnas y los períodos las filas— es lo que se
 * aprende. Por eso los «pasos» de cada ficha son DÓNDE MIRAR, no un desarrollo.
 *
 * EL CONVENIO DE COMPARACIÓN (lo que de verdad importa en esta app)
 * ────────────────────────────────────────────────────────────────
 * Aquí no hay tolerancia numérica que valga: la mayoría de respuestas son texto, y un mismo
 * dato se escribe legítimamente de varias formas. «Fe», «fe» y «hierro» son la misma
 * respuesta, y suspender una de las tres sería suspender a quien sabe química por cómo
 * teclea. Así que:
 *
 * 1. `comprobarRespuesta` NORMALIZA antes de comparar: minúsculas, tildes fuera, espacios
 *    colapsados. «Flúor», «fluor» y «FLUOR» entran las tres.
 * 2. Cada ficha declara sus SINÓNIMOS aceptados, y no se aceptan por parecido: la lista es
 *    explícita. Para un elemento son siempre su símbolo y su nombre, generados desde
 *    `elementos-data.ts` — no escritos a mano, para que no puedan divergir del dato.
 * 3. Las fichas cuya respuesta ES un número (masa atómica, radio, electronegatividad) se
 *    comparan con tolerancia, porque ahí el problema vuelve a ser aritmético: la masa del
 *    hierro es 55,845 y quien escriba 55,85 ha encontrado el dato correcto.
 *
 * LA AMBIGÜEDAD QUE HUBO QUE EVITAR AL ELEGIR LAS FICHAS
 * ─────────────────────────────────────────────────────
 * Una pregunta de búsqueda es inequívoca solo si el dato pedido es ÚNICO en la tabla. Dos
 * trampas concretas que descartaron enunciados durante el diseño:
 *
 * · «El elemento más denso» o «el más duro» no están en estos datos: no se puede pedir lo
 *   que la app no muestra, porque entonces la respuesta no se encuentra buscando sino
 *   sabiéndola de antes, y eso es otra cosa.
 * · «El elemento líquido» son DOS (Br y Hg), así que la ficha 9 acota con la familia y el
 *   propio motor comprueba que la búsqueda devuelve exactamente uno: si un día entrara un
 *   tercer líquido en los datos, `resolverCaso` devolvería error en vez de una respuesta
 *   silenciosamente equivocada.
 *
 * Los 12 enunciados son UNIVERSALES (sin países ni ciudades) y DETERMINISTAS: la ficha 3 es
 * la misma para todo el mundo, hoy y dentro de un año. Es lo único que hace que «haz las
 * fichas 3, 7 y 11» funcione como consigna de clase.
 */

import { parseSpanishNumber } from '@/lib';
import { elementos, type Elemento } from './elementos-data';

// ============================================================
// TIPOS
// ============================================================

/** Qué se busca en cada ficha. Cada valor tiene su rama en `resolverCaso`. */
export type TipoBusqueda =
  | 'elemento-por-numero'
  | 'elemento-por-configuracion'
  | 'elemento-por-grupo-periodo'
  | 'elemento-extremo-electronegatividad'
  | 'elemento-extremo-radio'
  | 'elemento-unico-por-estado-y-familia'
  | 'propiedad-numerica'
  | 'propiedad-texto';

/** Qué propiedad se pide cuando la ficha pregunta por un elemento concreto. */
export type PropiedadPedida =
  | 'masa'
  | 'radioAtomico'
  | 'electronegatividad'
  | 'numero'
  | 'grupo'
  | 'periodo'
  | 'familia'
  | 'configuracionElectronica'
  | 'estado';

/** Todo lo necesario para volver a resolver una ficha sin mirar su respuesta. */
export interface DatosBusqueda {
  tipo: TipoBusqueda;
  /** Z buscado, para `elemento-por-numero`. */
  numero?: number;
  /** Configuración literal buscada, para `elemento-por-configuracion`. */
  configuracion?: string;
  /** Columna de la tabla, para `elemento-por-grupo-periodo`. */
  grupo?: number;
  /** Fila de la tabla, para `elemento-por-grupo-periodo`. */
  periodo?: number;
  /** Símbolos entre los que comparar, para las fichas de extremo. */
  entre?: readonly string[];
  /** `'max'` o `'min'`, para las fichas de extremo. */
  extremo?: 'max' | 'min';
  /** Estado físico buscado, para `elemento-unico-por-estado-y-familia`. */
  estado?: string;
  /** Familia buscada, para `elemento-unico-por-estado-y-familia`. */
  familia?: string;
  /** Símbolo del elemento del que se pide una propiedad. */
  simbolo?: string;
  /** Qué propiedad se pide de ese elemento. */
  propiedad?: PropiedadPedida;
}

/** Una ficha de búsqueda ya construida, con su solución calculada desde los datos. */
export interface CasoTablaPeriodica {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosBusqueda;
  /** Qué se escribe en la casilla. NUNCA vacía. */
  etiquetaRespuesta: string;
  /** La respuesta canónica, calculada por el motor. Jamás escrita a mano. */
  respuestaTexto: string;
  /** Solo en fichas numéricas: el valor con el que se compara con tolerancia. */
  respuestaNumerica: number | null;
  /** Formas alternativas aceptadas, ya normalizadas. */
  sinonimos: readonly string[];
  /** Dónde mirar para encontrarlo. No es un desarrollo: es el camino. */
  pasos: readonly string[];
  pista: string;
  /** Unidad que se muestra junto al resultado («pm», «u»…). Vacía si no la tiene. */
  unidad: string;
  /** Si la ficha se puede mostrar resaltada en la tabla, el símbolo a resaltar. */
  simboloSolucion: string | null;
}

export interface ComprobacionBusqueda {
  correcto: boolean;
  motivo: 'acierto' | 'fallo' | 'vacia';
}

/** Un ejercicio del modo práctica, generado al vuelo pero resuelto por el MISMO motor. */
export interface EjercicioBusqueda {
  enunciado: string;
  etiquetaRespuesta: string;
  respuestaTexto: string;
  sinonimos: readonly string[];
  pasos: readonly string[];
}

// ============================================================
// NORMALIZACIÓN — el corazón de la comparación
// ============================================================

/**
 * Deja un texto en su forma comparable: minúsculas, sin tildes, sin espacios de sobra.
 *
 * El `normalize('NFD')` separa la letra de su tilde y el rango unicode borra la tilde
 * suelta, así que «Flúor» y «fluor» acaban en la misma cadena. Se quitan también los
 * puntos y las comas finales, porque «Fe.» es un acierto escrito con puntuación.
 */
export function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;:]+$/g, '')
    .replace(/\s+/g, ' ');
}

/** Los dos sinónimos que SIEMPRE valen para un elemento: su símbolo y su nombre. */
function sinonimosDe(elemento: Elemento): readonly string[] {
  return [normalizar(elemento.simbolo), normalizar(elemento.nombre)];
}

// ============================================================
// BÚSQUEDAS — todas consultan `elementos`, ninguna guarda respuestas
// ============================================================

/** Localiza un elemento por su símbolo. Devuelve `null` si no está, nunca lanza. */
export function buscarPorSimbolo(simbolo: string): Elemento | null {
  const objetivo = normalizar(simbolo);
  return elementos.find((e) => normalizar(e.simbolo) === objetivo) ?? null;
}

/** Localiza un elemento por su número atómico. */
export function buscarPorNumero(numero: number): Elemento | null {
  return elementos.find((e) => e.numero === numero) ?? null;
}

/**
 * Localiza el elemento de una configuración electrónica dada.
 *
 * Se normalizan los espacios porque «[Ar] 3d¹⁰ 4s¹» y «[Ar]3d¹⁰4s¹» son la misma
 * configuración escrita con distinta holgura, y la tabla usa una de las dos formas.
 */
export function buscarPorConfiguracion(configuracion: string): Elemento | null {
  const objetivo = normalizar(configuracion).replace(/\s+/g, '');
  const encontrados = elementos.filter(
    (e) => normalizar(e.configuracionElectronica).replace(/\s+/g, '') === objetivo,
  );
  return encontrados.length === 1 ? encontrados[0] : null;
}

/**
 * Localiza el elemento que ocupa una casilla (grupo, período) de la tabla.
 *
 * Devuelve `null` si la casilla está vacía O si la ocupan varios: los lantánidos y
 * actínidos comparten grupo 3, así que una pregunta sobre esa columna no sería inequívoca
 * y el motor prefiere no responder a responder cualquiera de ellos.
 */
export function buscarPorGrupoPeriodo(grupo: number, periodo: number): Elemento | null {
  const encontrados = elementos.filter((e) => e.grupo === grupo && e.periodo === periodo);
  return encontrados.length === 1 ? encontrados[0] : null;
}

/** El de mayor (o menor) electronegatividad de un conjunto de símbolos. */
export function extremoElectronegatividad(
  simbolos: readonly string[],
  extremo: 'max' | 'min',
): Elemento | null {
  const candidatos = simbolos
    .map(buscarPorSimbolo)
    .filter((e): e is Elemento => e !== null && e.electronegatividad !== null);
  if (candidatos.length !== simbolos.length || candidatos.length === 0) return null;
  let mejor = candidatos[0];
  let empatado = false;
  for (const e of candidatos.slice(1)) {
    const valor = e.electronegatividad as number;
    const referencia = mejor.electronegatividad as number;
    if (valor === referencia) {
      empatado = true;
    } else if (extremo === 'max' ? valor > referencia : valor < referencia) {
      mejor = e;
      empatado = false;
    }
  }
  // Un empate en el extremo haría la pregunta ambigua: mejor sin respuesta que con dos.
  return empatado ? null : mejor;
}

/** El de mayor (o menor) radio atómico de un conjunto de símbolos. */
export function extremoRadio(
  simbolos: readonly string[],
  extremo: 'max' | 'min',
): Elemento | null {
  const candidatos = simbolos
    .map(buscarPorSimbolo)
    .filter((e): e is Elemento => e !== null && e.radioAtomico !== null);
  if (candidatos.length !== simbolos.length || candidatos.length === 0) return null;
  let mejor = candidatos[0];
  let empatado = false;
  for (const e of candidatos.slice(1)) {
    const valor = e.radioAtomico as number;
    const referencia = mejor.radioAtomico as number;
    if (valor === referencia) {
      empatado = true;
    } else if (extremo === 'max' ? valor > referencia : valor < referencia) {
      mejor = e;
      empatado = false;
    }
  }
  return empatado ? null : mejor;
}

/**
 * El único elemento de una familia que está en un estado físico dado.
 *
 * Devuelve `null` si hay más de uno, y ese `null` es la salvaguarda de la ficha 9: si un
 * día los datos cambiaran y hubiera dos metales líquidos, la ficha daría error en vez de
 * corregir por uno de los dos.
 */
export function unicoPorEstadoYFamilia(estado: string, familia: string): Elemento | null {
  const encontrados = elementos.filter((e) => e.estado === estado && e.familia === familia);
  return encontrados.length === 1 ? encontrados[0] : null;
}

// ============================================================
// RESOLUCIÓN — la que recalcula sin mirar la respuesta declarada
// ============================================================

export interface ResultadoBusqueda {
  ok: boolean;
  /** Texto canónico de la respuesta. Vacío si `ok` es false. */
  texto: string;
  /** Valor numérico, cuando la ficha pide un número. */
  numero: number | null;
  /** Símbolo del elemento solución, para poder resaltarlo en la tabla. */
  simbolo: string | null;
  error: string | null;
}

const NOMBRES_FAMILIA: Record<string, string> = {
  'metales-alcalinos': 'metales alcalinos',
  'metales-alcalinoterreos': 'metales alcalinotérreos',
  'metales-transicion': 'metales de transición',
  'metales-postransicion': 'metales del bloque p',
  metaloides: 'metaloides',
  'no-metales': 'no metales',
  halogenos: 'halógenos',
  'gases-nobles': 'gases nobles',
  lantanidos: 'lantánidos',
  actinidos: 'actínidos',
};

const NOMBRES_ESTADO: Record<string, string> = {
  solido: 'sólido',
  liquido: 'líquido',
  gas: 'gas',
};

/**
 * Devuelve la propiedad pedida de un elemento, ya en su forma presentable.
 *
 * Nada lanza: una propiedad ausente (la electronegatividad de un gas noble es `null` en los
 * datos) sale como resultado no-ok, no como excepción. Un `throw` dentro de un render de
 * React tumbaría la app entera.
 */
function propiedadDe(elemento: Elemento, propiedad: PropiedadPedida): ResultadoBusqueda {
  const base = { ok: true, simbolo: elemento.simbolo, error: null };
  switch (propiedad) {
    case 'masa':
      return { ...base, texto: formatearNumero(elemento.masa), numero: elemento.masa };
    case 'radioAtomico':
      return elemento.radioAtomico === null
        ? falloBusqueda('Ese elemento no tiene radio atómico en los datos de la tabla')
        : {
            ...base,
            texto: formatearNumero(elemento.radioAtomico),
            numero: elemento.radioAtomico,
          };
    case 'electronegatividad':
      return elemento.electronegatividad === null
        ? falloBusqueda('Ese elemento no tiene electronegatividad asignada')
        : {
            ...base,
            texto: formatearNumero(elemento.electronegatividad),
            numero: elemento.electronegatividad,
          };
    case 'numero':
      return { ...base, texto: String(elemento.numero), numero: elemento.numero };
    case 'grupo':
      return { ...base, texto: String(elemento.grupo), numero: elemento.grupo };
    case 'periodo':
      return { ...base, texto: String(elemento.periodo), numero: elemento.periodo };
    case 'familia':
      return {
        ...base,
        texto: NOMBRES_FAMILIA[elemento.familia] ?? elemento.familia,
        numero: null,
      };
    case 'configuracionElectronica':
      return { ...base, texto: elemento.configuracionElectronica, numero: null };
    case 'estado':
      return { ...base, texto: NOMBRES_ESTADO[elemento.estado] ?? elemento.estado, numero: null };
  }
}

function falloBusqueda(error: string): ResultadoBusqueda {
  return { ok: false, texto: '', numero: null, simbolo: null, error };
}

function aciertoElemento(elemento: Elemento): ResultadoBusqueda {
  return {
    ok: true,
    texto: elemento.nombre,
    numero: null,
    simbolo: elemento.simbolo,
    error: null,
  };
}

/**
 * Resuelve una ficha desde sus `datos`, SIN mirar la respuesta declarada.
 *
 * Es la función que hace posible la invariante del test: si alguien edita un enunciado y se
 * olvida de la solución, recalcular por aquí y comparar con lo declarado destapa la
 * discrepancia. Por eso `construirCaso` la usa también al construir las fichas: la
 * respuesta declarada SIEMPRE sale de aquí.
 */
export function resolverCaso(datos: DatosBusqueda): ResultadoBusqueda {
  switch (datos.tipo) {
    case 'elemento-por-numero': {
      if (datos.numero === undefined) return falloBusqueda('Falta el número atómico');
      const e = buscarPorNumero(datos.numero);
      return e === null ? falloBusqueda('No hay elemento con ese número') : aciertoElemento(e);
    }
    case 'elemento-por-configuracion': {
      if (datos.configuracion === undefined) return falloBusqueda('Falta la configuración');
      const e = buscarPorConfiguracion(datos.configuracion);
      return e === null
        ? falloBusqueda('Ninguna casilla tiene esa configuración de forma única')
        : aciertoElemento(e);
    }
    case 'elemento-por-grupo-periodo': {
      if (datos.grupo === undefined || datos.periodo === undefined)
        return falloBusqueda('Faltan el grupo o el período');
      const e = buscarPorGrupoPeriodo(datos.grupo, datos.periodo);
      return e === null
        ? falloBusqueda('Esa casilla está vacía o la ocupan varios elementos')
        : aciertoElemento(e);
    }
    case 'elemento-extremo-electronegatividad': {
      if (datos.entre === undefined || datos.extremo === undefined)
        return falloBusqueda('Falta el conjunto o el extremo');
      const e = extremoElectronegatividad(datos.entre, datos.extremo);
      return e === null ? falloBusqueda('Hay empate o falta algún dato') : aciertoElemento(e);
    }
    case 'elemento-extremo-radio': {
      if (datos.entre === undefined || datos.extremo === undefined)
        return falloBusqueda('Falta el conjunto o el extremo');
      const e = extremoRadio(datos.entre, datos.extremo);
      return e === null ? falloBusqueda('Hay empate o falta algún dato') : aciertoElemento(e);
    }
    case 'elemento-unico-por-estado-y-familia': {
      if (datos.estado === undefined || datos.familia === undefined)
        return falloBusqueda('Faltan el estado o la familia');
      const e = unicoPorEstadoYFamilia(datos.estado, datos.familia);
      return e === null
        ? falloBusqueda('Esa combinación no da un único elemento')
        : aciertoElemento(e);
    }
    case 'propiedad-numerica':
    case 'propiedad-texto': {
      if (datos.simbolo === undefined || datos.propiedad === undefined)
        return falloBusqueda('Faltan el elemento o la propiedad');
      const e = buscarPorSimbolo(datos.simbolo);
      if (e === null) return falloBusqueda('Ese símbolo no está en la tabla');
      return propiedadDe(e, datos.propiedad);
    }
  }
}

// ============================================================
// FORMATO Y COMPARACIÓN
// ============================================================

/** Formato español: coma decimal, sin ceros de relleno. */
function formatearNumero(valor: number): string {
  return String(valor).replace('.', ',');
}

/**
 * Tolerancia de las fichas numéricas: el mayor entre 0,01 y el 1 % del valor.
 *
 * Mismo convenio que el resto de la sistemática. Aquí importa porque las masas atómicas
 * tienen tres decimales (55,845) y quien copia «55,85» del recuadro ha encontrado el dato.
 */
export function toleranciaDe(valorEsperado: number): number {
  return Math.max(0.01, Math.abs(valorEsperado) * 0.01);
}

/**
 * Compara la respuesta del alumno con la esperada.
 *
 * Dos caminos, y cuál se toma lo decide la ficha, no la entrada: si la ficha declara
 * `respuestaNumerica`, se compara con tolerancia; si no, se comparan cadenas normalizadas
 * contra la lista de sinónimos declarada. Una ficha de texto NUNCA cae al camino numérico,
 * porque «26» tecleado donde se pedía un símbolo es un fallo, no un acierto por redondeo.
 */
export function comprobarRespuesta(
  respuestaUsuario: string,
  caso: Pick<CasoTablaPeriodica, 'respuestaTexto' | 'respuestaNumerica' | 'sinonimos'>,
): ComprobacionBusqueda {
  const escrita = normalizar(respuestaUsuario);
  if (escrita === '') return { correcto: false, motivo: 'vacia' };

  if (caso.respuestaNumerica !== null) {
    // `parseSpanishNumber` y no `Number` ni `parseFloat`: lo que llega aquí lo teclea un
    // alumno, así que puede venir con coma decimal («63,546»), con punto, o no ser un número
    // en absoluto. `parseFloat` se quedaría con el prefijo de «63abc» y lo daría por bueno.
    const valor = parseSpanishNumber(respuestaUsuario);
    if (!Number.isFinite(valor)) return { correcto: false, motivo: 'fallo' };
    const correcto =
      Math.abs(valor - caso.respuestaNumerica) <= toleranciaDe(caso.respuestaNumerica);
    return { correcto, motivo: correcto ? 'acierto' : 'fallo' };
  }

  const correcto = caso.sinonimos.includes(escrita);
  return { correcto, motivo: correcto ? 'acierto' : 'fallo' };
}

// ============================================================
// LAS 12 FICHAS
// ============================================================

interface DefinicionFicha {
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosBusqueda;
  etiquetaRespuesta: string;
  pasos: readonly string[];
  pista: string;
  unidad?: string;
  /** Sinónimos EXTRA además de los que genera el motor (símbolo y nombre del elemento). */
  sinonimosExtra?: readonly string[];
}

const DEFINICIONES: readonly DefinicionFicha[] = [
  {
    titulo: 'Localizar por número atómico',
    enunciado:
      'Un átomo tiene 26 protones en su núcleo. Identifica de qué elemento se trata y escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: { tipo: 'elemento-por-numero', numero: 26 },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'El número de protones es el número atómico Z, el número grande de cada casilla.',
      'Recorre la tabla hasta la casilla con Z = 26: está en el período 4 (cuarta fila), entre el manganeso y el cobalto.',
      'Esa casilla es la del hierro, Fe.',
    ],
    pista: 'El número de protones y el número atómico son el mismo número.',
  },
  {
    titulo: 'Leer la casilla: grupo y período',
    enunciado:
      'Busca el elemento que ocupa la casilla del grupo 16 en el período 3 y escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: { tipo: 'elemento-por-grupo-periodo', grupo: 16, periodo: 3 },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'Los grupos son las COLUMNAS y los períodos las FILAS: es la intersección de las dos.',
      'Baja a la tercera fila y muévete hasta la decimosexta columna, la del oxígeno.',
      'Justo debajo del oxígeno está el azufre, S.',
    ],
    pista: 'Grupo = columna, período = fila. Busca el cruce.',
  },
  {
    titulo: 'El más electronegativo',
    enunciado:
      'De estos cuatro elementos —flúor, oxígeno, cloro y nitrógeno—, ¿cuál tiene la electronegatividad más alta? Escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: {
      tipo: 'elemento-extremo-electronegatividad',
      entre: ['F', 'O', 'Cl', 'N'],
      extremo: 'max',
    },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'Abre la ficha de cada uno de los cuatro y anota su electronegatividad.',
      'Flúor 3,98 · oxígeno 3,44 · cloro 3,16 · nitrógeno 3,04.',
      'El valor más alto es el del flúor, que además es el más alto de toda la tabla.',
    ],
    pista: 'La electronegatividad crece hacia la derecha y hacia arriba de la tabla.',
  },
  {
    titulo: 'Masa atómica de un elemento',
    enunciado:
      'Localiza el cobre en la tabla y anota su masa atómica con los decimales que muestra su ficha.',
    categoria: 'abstracto',
    datos: { tipo: 'propiedad-numerica', simbolo: 'Cu', propiedad: 'masa' },
    etiquetaRespuesta: 'Masa atómica (u)',
    pasos: [
      'El cobre es Cu, un metal de transición del período 4.',
      'Abre su ficha: la masa atómica es el número con decimales, no el número atómico.',
      'Son 63,546 u.',
    ],
    pista: 'No confundas la masa atómica (con decimales) con el número atómico (entero).',
    unidad: 'u',
  },
  {
    titulo: 'La configuración que delata al elemento',
    enunciado:
      'Un elemento tiene la configuración electrónica [Ar] 3d¹⁰ 4s¹. Identifícalo y escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: { tipo: 'elemento-por-configuracion', configuracion: '[Ar] 3d¹⁰ 4s¹' },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'La configuración empieza por [Ar], así que el elemento está en el período 4.',
      'Busca entre los metales de transición del período 4 el que tenga el orbital d lleno con 10 electrones y solo 1 en el 4s.',
      'Es el cobre: una de las dos excepciones clásicas al orden de llenado, junto con el cromo.',
    ],
    pista: 'Lo esperable sería 3d⁹ 4s². Que no lo sea es justo lo que hace famoso a este elemento.',
  },
  {
    titulo: 'El gas noble de una fila',
    enunciado:
      'Busca el gas noble que cierra el período 2 y escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: { tipo: 'elemento-por-grupo-periodo', grupo: 18, periodo: 2 },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'Los gases nobles son la última columna, el grupo 18, en el extremo derecho.',
      'El período 2 es la segunda fila.',
      'El cruce de los dos es el neón, Ne.',
    ],
    pista: 'Cada fila termina en un gas noble: son la última columna de la tabla.',
  },
  {
    titulo: 'Comparar radios atómicos',
    enunciado:
      'De estos tres metales alcalinos —litio, sodio y potasio—, ¿cuál tiene el radio atómico más grande? Escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: { tipo: 'elemento-extremo-radio', entre: ['Li', 'Na', 'K'], extremo: 'max' },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'Los tres están en la primera columna, uno debajo de otro.',
      'Abre sus fichas y compara el radio atómico: litio 167 pm, sodio 190 pm, potasio 243 pm.',
      'El potasio es el mayor: dentro de un grupo, el radio CRECE al bajar porque se añade una capa.',
    ],
    pista: 'Bajar por una columna significa añadir una capa de electrones.',
  },
  {
    titulo: 'La familia a la que pertenece',
    enunciado:
      'Localiza el yodo en la tabla y di a qué familia de elementos pertenece.',
    categoria: 'abstracto',
    datos: { tipo: 'propiedad-texto', simbolo: 'I', propiedad: 'familia' },
    etiquetaRespuesta: 'Nombre de la familia',
    pasos: [
      'El yodo es I, y está en el período 5.',
      'Fíjate en su columna: la 17, la penúltima de la tabla.',
      'Esa columna es la de los halógenos, junto al flúor, el cloro y el bromo.',
    ],
    pista: 'El color de la casilla y su columna dicen la familia. Mira quién tiene encima.',
    sinonimosExtra: ['halogeno', 'halogenos', 'grupo 17', 'grupo de los halogenos'],
  },
  {
    titulo: 'El metal que es líquido',
    enunciado:
      'Entre los metales de transición hay uno que a temperatura ambiente NO es sólido, sino líquido. Encuéntralo y escribe su símbolo o su nombre.',
    categoria: 'aplicado',
    datos: {
      tipo: 'elemento-unico-por-estado-y-familia',
      estado: 'liquido',
      familia: 'metales-transicion',
    },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'Usa el filtro por estado físico y quédate con los líquidos: son muy pocos en toda la tabla.',
      'De esos, descarta el que no sea un metal de transición (el bromo es un halógeno).',
      'Queda el mercurio, Hg, el único metal líquido a temperatura ambiente.',
    ],
    pista: 'Solo dos elementos de la tabla son líquidos a temperatura ambiente. Uno no es metal.',
  },
  {
    titulo: 'Del símbolo al número atómico',
    enunciado:
      'Un envase de fertilizante menciona el potasio entre sus componentes. Localiza el potasio en la tabla y anota su número atómico.',
    categoria: 'aplicado',
    datos: { tipo: 'propiedad-numerica', simbolo: 'K', propiedad: 'numero' },
    etiquetaRespuesta: 'Número atómico (Z)',
    pasos: [
      'El símbolo del potasio es K, que viene de su nombre latino kalium.',
      'Búscalo en la primera columna, el grupo de los metales alcalinos, en el período 4.',
      'Su número atómico es 19.',
    ],
    pista: 'Su símbolo no empieza por P: viene del latín, como el del sodio o el del hierro.',
  },
  {
    titulo: 'Leer la configuración de una casilla',
    enunciado:
      'Localiza el silicio, el elemento con el que se fabrican los chips, y copia su configuración electrónica tal como aparece en su ficha.',
    categoria: 'aplicado',
    datos: { tipo: 'propiedad-texto', simbolo: 'Si', propiedad: 'configuracionElectronica' },
    etiquetaRespuesta: 'Configuración electrónica',
    pasos: [
      'El silicio es Si, grupo 14 y período 3, justo debajo del carbono.',
      'Abre su ficha y busca la línea de configuración electrónica.',
      'Es [Ne] 3s² 3p²: el neón como núcleo interno, más cuatro electrones de valencia.',
    ],
    pista: 'Empieza por el gas noble anterior entre corchetes. El del período 2 es el neón.',
    sinonimosExtra: ['[ne]3s23p2', '[ne] 3s2 3p2', '[ne] 3s² 3p²'],
  },
  {
    titulo: 'El menos electronegativo del grupo',
    enunciado:
      'De estos cuatro halógenos —flúor, cloro, bromo y yodo—, ¿cuál tiene la electronegatividad más baja? Escribe su símbolo o su nombre.',
    categoria: 'abstracto',
    datos: {
      tipo: 'elemento-extremo-electronegatividad',
      entre: ['F', 'Cl', 'Br', 'I'],
      extremo: 'min',
    },
    etiquetaRespuesta: 'Símbolo o nombre del elemento',
    pasos: [
      'Los cuatro están en la misma columna, el grupo 17, uno debajo de otro.',
      'Anota sus electronegatividades: flúor 3,98 · cloro 3,16 · bromo 2,96 · yodo 2,66.',
      'La más baja es la del yodo: dentro de un grupo, la electronegatividad BAJA al descender.',
    ],
    pista: 'Es la tendencia contraria a la del radio atómico: lo que crece al bajar es el tamaño.',
  },
];

/**
 * Construye una ficha resolviéndola con el motor.
 *
 * `respuestaTexto` NUNCA se escribe a mano en `DEFINICIONES`: sale de `resolverCaso`. Es lo
 * que garantiza que un cambio en `elementos-data.ts` arrastre la solución consigo en vez de
 * dejar una ficha corrigiendo con un dato viejo.
 */
function construirFicha(definicion: DefinicionFicha, indice: number): CasoTablaPeriodica {
  const resultado = resolverCaso(definicion.datos);
  const esNumerica = definicion.datos.tipo === 'propiedad-numerica';

  const elementoSolucion =
    resultado.simbolo !== null ? buscarPorSimbolo(resultado.simbolo) : null;

  // Para una ficha que pide un elemento valen su símbolo y su nombre; para una que pide un
  // dato concreto, vale ese dato escrito con o sin tildes.
  const sinonimosBase =
    elementoSolucion !== null && !esNumerica && definicion.datos.tipo !== 'propiedad-texto'
      ? sinonimosDe(elementoSolucion)
      : [normalizar(resultado.texto)];

  const sinonimos = Array.from(
    new Set([...sinonimosBase, ...(definicion.sinonimosExtra ?? []).map(normalizar)]),
  );

  return {
    id: indice + 1,
    titulo: definicion.titulo,
    enunciado: definicion.enunciado,
    categoria: definicion.categoria,
    datos: definicion.datos,
    etiquetaRespuesta: definicion.etiquetaRespuesta,
    respuestaTexto: resultado.texto,
    respuestaNumerica: esNumerica ? resultado.numero : null,
    sinonimos,
    pasos: definicion.pasos,
    pista: definicion.pista,
    unidad: definicion.unidad ?? '',
    simboloSolucion: resultado.simbolo,
  };
}

/** Las 12 fichas fijas, con ids 1..12 sin huecos. */
export const CASOS: readonly CasoTablaPeriodica[] = DEFINICIONES.map(construirFicha);

export const TOTAL_CASOS = CASOS.length;

// ============================================================
// PRÁCTICA SIN FINAL
// ============================================================

/** Generador congruente lineal: misma semilla, misma secuencia. */
function generadorDeterminista(semilla: number): () => number {
  let estado = semilla >>> 0 || 1;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

/**
 * Un ejercicio nuevo cada vez, sacado de la propia tabla y resuelto por el MISMO motor.
 *
 * Solo se sortean elementos de los cuatro primeros períodos (Z ≤ 36): son los del temario
 * de secundaria, y además todos tienen los datos completos, así que ninguna tirada puede
 * caer en un hueco. Los ejercicios aleatorios NO son asignables por número —para eso están
 * las 12 fichas fijas—, y aquí se dice.
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioBusqueda {
  const aleatorio = generadorDeterminista(semilla ?? Math.floor(Math.random() * 1e9) + 1);
  const candidatos = elementos.filter((e) => e.numero <= 36);
  const elemento = candidatos[Math.floor(aleatorio() * candidatos.length)];

  const variantes: readonly PropiedadPedida[] = ['numero', 'grupo', 'periodo', 'masa'];
  const propiedad = variantes[Math.floor(aleatorio() * variantes.length)];

  // Las cuatro variantes sorteadas devuelven un número, así que todas van por la rama
  // numérica: no se sortean familia ni configuración, cuyo texto admite varias grafías y
  // exigiría declarar sinónimos que aquí nadie ha revisado.
  const datos: DatosBusqueda = {
    tipo: 'propiedad-numerica',
    simbolo: elemento.simbolo,
    propiedad,
  };
  const resultado = resolverCaso(datos);

  const preguntas: Record<PropiedadPedida, string> = {
    numero: `¿Cuál es el número atómico del ${elemento.nombre.toLowerCase()}?`,
    grupo: `¿En qué grupo (columna) está el ${elemento.nombre.toLowerCase()}?`,
    periodo: `¿En qué período (fila) está el ${elemento.nombre.toLowerCase()}?`,
    masa: `¿Cuál es la masa atómica del ${elemento.nombre.toLowerCase()}?`,
    radioAtomico: '',
    electronegatividad: '',
    familia: '',
    configuracionElectronica: '',
    estado: '',
  };

  const etiquetas: Record<PropiedadPedida, string> = {
    numero: 'Número atómico (Z)',
    grupo: 'Número de grupo',
    periodo: 'Número de período',
    masa: 'Masa atómica (u)',
    radioAtomico: '',
    electronegatividad: '',
    familia: '',
    configuracionElectronica: '',
    estado: '',
  };

  return {
    enunciado: `Busca el ${elemento.nombre.toLowerCase()} (${elemento.simbolo}) en la tabla. ${preguntas[propiedad]}`,
    etiquetaRespuesta: etiquetas[propiedad],
    respuestaTexto: resultado.texto,
    sinonimos: [normalizar(resultado.texto)],
    pasos: [
      `Usa el buscador y escribe «${elemento.nombre}» o su símbolo, ${elemento.simbolo}.`,
      'Abre su ficha y localiza el dato que se pide.',
      `La respuesta es ${resultado.texto}.`,
    ],
  };
}

/**
 * Comprueba una respuesta del modo práctica.
 *
 * Usa exactamente la misma comparación que las fichas fijas: si divergieran, el alumno
 * entrenaría con una regla y sería corregido con otra.
 */
export function comprobarEjercicio(
  respuestaUsuario: string,
  ejercicio: EjercicioBusqueda,
): ComprobacionBusqueda {
  // La respuesta del ejercicio la genera la propia app, pero se lee con el mismo parser que
  // todo lo demás: así no hay dos reglas de lectura de números conviviendo en el módulo.
  const numero = parseSpanishNumber(ejercicio.respuestaTexto);
  return comprobarRespuesta(respuestaUsuario, {
    respuestaTexto: ejercicio.respuestaTexto,
    respuestaNumerica: Number.isFinite(numero) ? numero : null,
    sinonimos: ejercicio.sinonimos,
  });
}

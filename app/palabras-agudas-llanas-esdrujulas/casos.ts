/**
 * Casos para clase — la tarea asignable de `palabras-agudas-llanas-esdrujulas`.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si una clasificación
 * está bien. Aquí no se clasifica NADA a mano: cada respuesta sale de `analizarPalabra`, el
 * mismo motor con el que la herramienta de arriba pinta su resultado. Si los casos tuvieran su
 * propia regla, la app suspendería una respuesta que ella misma da.
 *
 * Dos formas de pregunta, las dos de los ejercicios de clase de siempre:
 *   · 'clasificar': una palabra BIEN escrita → aguda, llana (grave), esdrújula o sobresdrújula.
 *   · 'tildar': una palabra escrita SIN tilde y la sílaba que suena más fuerte → la palabra
 *     escrita como debe, con su tilde o tal cual si no la necesita (el caso de «reloj» y
 *     «joven» está puesto para cazar al que tilda por si acaso).
 *
 * ── El convenio, y lo que se deja fuera a propósito ──────────────────────────────────────
 *   · Sin monosílabos: unos libros los cuentan como agudas y otros aparte; con cualquiera de las
 *     dos respuestas un alumno podría tener razón.
 *   · Sin palabras que se acentúan distinto según el país (video/vídeo, chofer/chófer,
 *     futbol/fútbol, periodo/período): el canal de aula es latinoamericano en su mayoría.
 *   · Sin adverbios en -mente, sin y final, sin interrogativos ni «solo»: tienen respuesta, pero
 *     no es la de la regla general que se está practicando.
 *   · Ningún hiato en 'tildar': sin la tilde escrita, «pais» es una sola sílaba y la sílaba
 *     tónica que habría que señalar no existe. Los hiatos van en 'clasificar' (país).
 *   · «Llana» y «grave» valen igual: es la misma clase con el nombre de cada lado del Atlántico.
 */

import { analizarPalabra, sinTildes, NOMBRE_TIPO, POSICION_TIPO, type TipoAcento } from './motor';

export type FormaPregunta = 'clasificar' | 'tildar';

/** Las cuatro respuestas de 'clasificar' (los monosílabos no se preguntan) */
export type Clase = Exclude<TipoAcento, 'monosilaba'>;
export const CLASES: readonly Clase[] = ['aguda', 'llana', 'esdrujula', 'sobresdrujula'];

export type DatosCaso =
  | { forma: 'clasificar'; palabra: string }
  | { forma: 'tildar'; palabra: string; indice: number };

export interface Resolucion {
  ok: boolean;
  /** 'clasificar' → la clase; 'tildar' → la palabra escrita como debe */
  valor: string;
  tipo: TipoAcento | null;
  regla: string;
  pasos: string[];
  error: string;
}

const ORDINALES = ['1.ª', '2.ª', '3.ª', '4.ª', '5.ª', '6.ª', '7.ª', '8.ª'];
const ordinal = (i: number) => ORDINALES[i] ?? `${i + 1}.ª`;

/** Recalcula la respuesta desde los datos, sin mirar ninguna respuesta guardada. */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const vacio: Resolucion = { ok: false, valor: '', tipo: null, regla: '', pasos: [], error: '' };
  const a =
    datos.forma === 'clasificar' ? analizarPalabra(datos.palabra) : analizarPalabra(datos.palabra, datos.indice);
  if (!a) return { ...vacio, error: `«${datos.palabra}» no es una palabra que se pueda analizar.` };
  if (a.tipo === 'monosilaba') return { ...vacio, error: 'Los monosílabos no entran en los casos.' };
  if (a.tilde === 'depende') return { ...vacio, error: 'La tilde diacrítica no entra en los casos.' };
  if (datos.forma === 'tildar' && a.indiceTonica !== datos.indice) {
    return { ...vacio, error: 'La sílaba indicada no se puede usar como tónica en esta palabra.' };
  }

  const silabas = a.silabas.join('-');
  const tonica = a.silabas[a.indiceTonica];
  const pasos = [
    `Sílabas: ${silabas} (${a.silabas.length})`,
    `Sílaba tónica: «${tonica}», ${POSICION_TIPO[a.tipo]}`,
    `Tipo: ${NOMBRE_TIPO[a.tipo]}`,
    a.regla,
  ];
  if (datos.forma === 'tildar') pasos.push(`Se escribe: ${a.formaCorrecta}`);

  return {
    ok: true,
    valor: datos.forma === 'clasificar' ? a.tipo : a.formaCorrecta,
    tipo: a.tipo,
    regla: a.regla,
    pasos,
    error: '',
  };
}

export function enunciadoDe(datos: DatosCaso): string {
  if (datos.forma === 'clasificar') {
    return `¿La palabra «${datos.palabra}» es aguda, llana (grave), esdrújula o sobresdrújula?`;
  }
  const silabas = analizarPalabra(datos.palabra)?.silabas ?? [];
  const tonica = silabas[datos.indice] ?? '';
  return (
    `En «${datos.palabra}» la sílaba que suena más fuerte es la ${ordinal(datos.indice)}, «${tonica}». ` +
    'Escribe la palabra con tilde si la necesita, o tal cual si no la necesita.'
  );
}

export function etiquetaDe(datos: DatosCaso): string {
  return datos.forma === 'clasificar' ? 'Elige el tipo de palabra' : 'Escribe la palabra';
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
}

const normalizar = (s: string) => s.normalize('NFC').trim().toLowerCase();

/** Acepta «grave» por «llana» y las clases escritas sin tilde («esdrujula»). */
export function leerClase(texto: string): Clase | null {
  const t = sinTildes(normalizar(texto));
  if (t === 'aguda') return 'aguda';
  if (t === 'llana' || t === 'grave' || t === 'paroxitona') return 'llana';
  if (t === 'esdrujula' || t === 'proparoxitona') return 'esdrujula';
  if (t === 'sobresdrujula') return 'sobresdrujula';
  return null;
}

/** Corrige una respuesta contra el caso. Nunca lanza: lo que no se entiende es un fallo con motivo. */
export function comprobarRespuesta(entrada: string, datos: DatosCaso): Veredicto {
  const r = resolverCaso(datos);
  if (!r.ok || !r.tipo) return { correcto: false, motivo: r.error || 'Este caso no se puede corregir.' };

  if (datos.forma === 'clasificar') {
    const clase = leerClase(entrada);
    if (!clase) return { correcto: false, motivo: 'Elige aguda, llana (grave), esdrújula o sobresdrújula.' };
    if (clase === r.valor) return { correcto: true, motivo: `Correcto: es ${NOMBRE_TIPO[r.tipo]}. ${r.regla}` };
    return {
      correcto: false,
      motivo: `No es ${NOMBRE_TIPO[clase]}: ${r.pasos[1].charAt(0).toLowerCase()}${r.pasos[1].slice(1)}. Cuenta las sílabas desde el final.`,
    };
  }

  const escrito = normalizar(entrada);
  const esperado = normalizar(r.valor);
  if (!escrito) return { correcto: false, motivo: 'Escribe la palabra.' };
  if (escrito === esperado) return { correcto: true, motivo: `Correcto: ${r.valor}. ${r.regla}` };
  if (sinTildes(escrito) !== sinTildes(esperado)) {
    return { correcto: false, motivo: 'Has cambiado alguna letra: escribe la misma palabra y decide solo la tilde.' };
  }
  const tildeEsperada = /[áéíóú]/.test(esperado);
  const tildeEscrita = /[áéíóú]/.test(escrito);
  if (tildeEsperada && !tildeEscrita) return { correcto: false, motivo: `Falta la tilde. ${r.regla}` };
  if (!tildeEsperada && tildeEscrita) return { correcto: false, motivo: `Sobra la tilde. ${r.regla}` };
  return { correcto: false, motivo: 'La tilde va en la vocal de la sílaba tónica, no en otra.' };
}

export interface Caso {
  id: number;
  titulo: string;
  datos: DatosCaso;
  enunciado: string;
  etiquetaRespuesta: string;
  respuesta: string;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

interface Definicion {
  titulo: string;
  datos: DatosCaso;
  pista: string;
}

const PISTA_CLASIFICAR = 'Sepárala en sílabas y cuenta desde el final: ¿en cuál cae la voz?';

/** Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`. */
const DEFINICIONES: readonly Definicion[] = [
  { titulo: 'Clasificar «camión»', datos: { forma: 'clasificar', palabra: 'camión' }, pista: 'La tilde ya te dice dónde está la sílaba tónica.' },
  { titulo: 'Clasificar «lápiz»', datos: { forma: 'clasificar', palabra: 'lápiz' }, pista: 'La tilde ya te dice dónde está la sílaba tónica.' },
  { titulo: 'Tildar «arbol»', datos: { forma: 'tildar', palabra: 'arbol', indice: 0 }, pista: 'Con la tónica en la penúltima es llana: mira cómo acaba.' },
  { titulo: 'Clasificar «murciélago»', datos: { forma: 'clasificar', palabra: 'murciélago' }, pista: PISTA_CLASIFICAR },
  { titulo: 'Tildar «cancion»', datos: { forma: 'tildar', palabra: 'cancion', indice: 1 }, pista: 'Con la tónica en la última es aguda: mira cómo acaba.' },
  { titulo: 'Clasificar «ciudad»', datos: { forma: 'clasificar', palabra: 'ciudad' }, pista: 'Sin tilde, dila en voz alta. «ciu» es una sola sílaba.' },
  { titulo: 'Tildar «reloj»', datos: { forma: 'tildar', palabra: 'reloj', indice: 1 }, pista: 'Aguda, pero ¿acaba en vocal, n o s?' },
  { titulo: 'Clasificar «examen»', datos: { forma: 'clasificar', palabra: 'examen' }, pista: 'Sin tilde, dila en voz alta: e-xa-men.' },
  { titulo: 'Tildar «telefono»', datos: { forma: 'tildar', palabra: 'telefono', indice: 1 }, pista: 'Cuenta desde el final: la tónica está en la antepenúltima.' },
  { titulo: 'Clasificar «país»', datos: { forma: 'clasificar', palabra: 'país' }, pista: 'La a y la í van en sílabas distintas: pa-ís.' },
  { titulo: 'Tildar «joven»', datos: { forma: 'tildar', palabra: 'joven', indice: 0 }, pista: 'Llana, pero ¿acaba en vocal, n o s?' },
  { titulo: 'Clasificar «dígamelo»', datos: { forma: 'clasificar', palabra: 'dígamelo' }, pista: 'Cuatro sílabas, y la voz cae en la primera.' },
];

function textoRespuesta(datos: DatosCaso, valor: string): string {
  if (datos.forma === 'clasificar') return NOMBRE_TIPO[valor as TipoAcento] ?? valor;
  return valor;
}

function construir(def: Definicion, i: number): Caso {
  const r = resolverCaso(def.datos);
  return {
    id: i + 1,
    titulo: def.titulo,
    datos: def.datos,
    enunciado: enunciadoDe(def.datos),
    etiquetaRespuesta: etiquetaDe(def.datos),
    respuesta: r.valor,
    respuestaTexto: textoRespuesta(def.datos, r.valor),
    pasos: r.ok ? r.pasos : [r.error],
    pista: def.pista,
  };
}

export const CASOS: readonly Caso[] = DEFINICIONES.map(construir);
export const TOTAL_CASOS: number = CASOS.length;

export const NOTA_CONVENIO =
  'Sin monosílabos ni palabras que se pronuncian distinto según el país; «llana» y «grave» valen igual.';

// ─── Práctica aleatoria ──────────────────────────────────────────────────────────────

/**
 * Palabras BIEN escritas para el modo práctica, de acentuación igual en todo el español. Su
 * tipo no se anota aquí: lo da el motor (el spec lo coteja con una tabla escrita a mano).
 * Las de hiato (país, maíz, baúl, día, búho, río) solo se usan para clasificar.
 */
export const BANCO: readonly string[] = [
  // agudas con tilde
  'sofá', 'café', 'jabón', 'ratón', 'compás', 'también', 'colibrí', 'menú', 'sillón', 'avión', 'francés', 'bebé',
  // agudas sin tilde
  'pared', 'reloj', 'feliz', 'comer', 'ciudad', 'papel', 'verdad', 'nariz', 'salud', 'hablar',
  // llanas sin tilde
  'casa', 'mesa', 'joven', 'examen', 'lunes', 'zapato', 'ventana', 'origen', 'libro', 'camino',
  // llanas con tilde
  'árbol', 'lápiz', 'fácil', 'cárcel', 'azúcar', 'mármol', 'césped', 'débil', 'túnel', 'ángel', 'carácter',
  // esdrújulas
  'música', 'teléfono', 'pájaro', 'médico', 'lámpara', 'brújula', 'sábado', 'número', 'plátano', 'último', 'rápido',
  // sobresdrújulas
  'dígamelo', 'cómpratelo', 'explícaselo', 'devuélvemelo',
  // hiatos (solo para clasificar)
  'país', 'maíz', 'baúl', 'día', 'búho', 'río',
];

/** splitmix32: mezcla la semilla antes de usarla (un generador sembrado con enteros pequeños
 *  repite sus primeras salidas: el caso de simulador-genetica, 14/09/2026). */
function generador(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x9e3779b9) >>> 0;
    let z = a;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    z = (z ^ (z >>> 16)) >>> 0;
    return z / 4294967296;
  };
}

export interface Ejercicio {
  datos: DatosCaso;
  enunciado: string;
  etiquetaRespuesta: string;
  respuesta: string;
  respuestaTexto: string;
  pasos: string[];
}

/**
 * Ejercicio aleatorio reproducible por semilla. Usa EL MISMO `resolverCaso` que los doce fijos.
 * Para 'tildar' quita las tildes de una palabra del banco y señala su tónica; las de hiato
 * pasan a 'clasificar'.
 */
export function generarEjercicioAleatorio(semilla: number): Ejercicio {
  const rnd = generador(semilla);
  const palabra = BANCO[Math.floor(rnd() * BANCO.length)];
  const quiereTildar = rnd() < 0.5;
  const analisis = analizarPalabra(palabra);

  let datos: DatosCaso = { forma: 'clasificar', palabra };
  if (quiereTildar && analisis && !analisis.hiato) {
    datos = { forma: 'tildar', palabra: sinTildes(palabra), indice: analisis.indiceTonica };
  }
  const r = resolverCaso(datos);
  return {
    datos,
    enunciado: enunciadoDe(datos),
    etiquetaRespuesta: etiquetaDe(datos),
    respuesta: r.valor,
    respuestaTexto: textoRespuesta(datos, r.valor),
    pasos: r.ok ? r.pasos : [r.error],
  };
}

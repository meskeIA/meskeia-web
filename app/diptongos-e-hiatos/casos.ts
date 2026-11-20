/**
 * Casos para clase — la tarea asignable de `diptongos-e-hiatos`.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si una clasificación
 * está bien. Aquí no se clasifica NADA a mano: cada respuesta sale de `analizarPalabra`, el
 * mismo motor con el que la herramienta de arriba pinta su resultado. Si los casos tuvieran su
 * propia regla, la app suspendería una respuesta que ella misma da.
 *
 * Tres formas de pregunta, las de los ejercicios de clase de siempre:
 *   · 'identificar': ¿la palabra tiene diptongo, triptongo o hiato?
 *   · 'subtipo': la palabra tiene un diptongo (¿creciente, decreciente u homogéneo?) o un
 *     hiato (¿simple o acentual?).
 *   · 'separar': escribir la palabra dividida en sílabas (po-e-ta).
 *
 * ── El convenio, y lo que se deja fuera a propósito ──────────────────────────────────────
 *   · Solo palabras con UN encuentro vocálico: con dos (a-é-re-o), «¿diptongo o hiato?» no
 *     tiene una respuesta.
 *   · La Ortografía de 2010 cuenta como diptongo toda cerrada átona junto a una abierta, aunque
 *     haya quien la pronuncie en dos sílabas. Para que ningún alumno tenga razón con la otra
 *     respuesta, fuera las palabras donde eso pasa a menudo: guion, truhan, piano, cruel, dueto,
 *     riada, y las de una h dentro del diptongo (ahu-ma-do).
 *   · Sin formas de «vosotros» (averiguáis, estudiéis), que dan los triptongos de los libros
 *     de España: el canal de aula es latinoamericano en su mayoría.
 *   · Sin nombres de países ni ciudades (Uruguay, Paraguay, Camagüey), aunque sean el ejemplo
 *     clásico de triptongo.
 *   · Al separar, sin grupos que cambian según la zona (at-le-ta / a-tle-ta) ni prefijos.
 */

import {
  analizarPalabra,
  NOMBRE_FAMILIA,
  NOMBRE_TIPO,
  FAMILIA_DE,
  type Encuentro,
  type Familia,
  type TipoEncuentro,
} from './motor';

export type FormaPregunta = 'identificar' | 'subtipo' | 'separar';

export type DatosCaso = { forma: FormaPregunta; palabra: string };

/** Las opciones de 'subtipo', según la familia del encuentro */
export const SUBTIPOS: Record<'diptongo' | 'hiato', readonly TipoEncuentro[]> = {
  diptongo: ['diptongo-creciente', 'diptongo-decreciente', 'diptongo-homogeneo'],
  hiato: ['hiato-simple', 'hiato-acentual'],
};

export const FAMILIAS_CASO: readonly Familia[] = ['diptongo', 'triptongo', 'hiato'];

/** El nombre corto del subtipo en un botón: «creciente», «acentual» */
export const NOMBRE_CORTO: Record<TipoEncuentro, string> = {
  'diptongo-creciente': 'creciente',
  'diptongo-decreciente': 'decreciente',
  'diptongo-homogeneo': 'homogéneo',
  triptongo: 'triptongo',
  'hiato-simple': 'simple',
  'hiato-acentual': 'acentual',
};

export interface Resolucion {
  ok: boolean;
  /** 'identificar' → la familia; 'subtipo' → el tipo; 'separar' → las sílabas con guiones */
  valor: string;
  /** Las opciones entre las que se elige (vacío en 'separar') */
  opciones: readonly string[];
  encuentro: Encuentro | null;
  /** Las sílabas con guiones (pa-ís), para los motivos del corrector */
  silabas: string;
  pasos: string[];
  error: string;
}

/** Recalcula la respuesta desde los datos, sin mirar ninguna respuesta guardada. */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const vacio: Resolucion = { ok: false, valor: '', opciones: [], encuentro: null, silabas: '', pasos: [], error: '' };
  const a = analizarPalabra(datos.palabra);
  if (!a) return { ...vacio, error: `«${datos.palabra}» no es una palabra que se pueda analizar.` };
  if (a.encuentros.length !== 1) {
    return { ...vacio, error: 'Los casos usan palabras con un solo encuentro de vocales.' };
  }
  const e = a.encuentros[0];
  const silabas = a.silabas.join('-');
  const pasoSilabas = `Sílabas: ${silabas} (${a.silabas.length})`;
  const pasoVocales = `Vocales en contacto: «${e.texto}»${e.conH ? ' (la h no cuenta: no suena)' : ''}`;

  if (datos.forma === 'identificar') {
    return {
      ok: true,
      valor: e.familia,
      opciones: FAMILIAS_CASO,
      encuentro: e,
      silabas,
      pasos: [pasoVocales, pasoSilabas, e.regla, `Tiene un ${NOMBRE_FAMILIA[e.familia]}.`],
      error: '',
    };
  }

  if (datos.forma === 'subtipo') {
    if (e.familia === 'triptongo') {
      return { ...vacio, error: 'El triptongo no tiene subtipos en estos casos.' };
    }
    return {
      ok: true,
      valor: e.tipo,
      opciones: SUBTIPOS[e.familia],
      encuentro: e,
      silabas,
      pasos: [pasoVocales, pasoSilabas, e.regla, `Es un ${NOMBRE_TIPO[e.tipo]}.`],
      error: '',
    };
  }

  if (a.silabas.length < 2) return { ...vacio, error: 'Al separar se usan palabras de más de una sílaba.' };
  return {
    ok: true,
    valor: silabas,
    opciones: [],
    encuentro: e,
    silabas,
    pasos: [
      pasoVocales,
      e.regla,
      e.familia === 'hiato'
        ? 'En un hiato las dos vocales van en sílabas distintas.'
        : 'Un diptongo o un triptongo no se separa: va entero en la misma sílaba.',
      `Sílabas: ${silabas} (${a.silabas.length})`,
    ],
    error: '',
  };
}

export function enunciadoDe(datos: DatosCaso): string {
  if (datos.forma === 'identificar') {
    return `¿La palabra «${datos.palabra}» tiene diptongo, triptongo o hiato?`;
  }
  if (datos.forma === 'separar') {
    return `Separa en sílabas la palabra «${datos.palabra}». Escribe las sílabas unidas por guiones, como en ca-sa.`;
  }
  const e = analizarPalabra(datos.palabra)?.encuentros[0];
  if (e?.familia === 'hiato') {
    return `«${datos.palabra}» tiene un hiato («${e.texto}»). ¿Es un hiato simple o acentual?`;
  }
  return `«${datos.palabra}» tiene un diptongo («${e?.texto ?? ''}»). ¿Es creciente, decreciente u homogéneo?`;
}

export function etiquetaDe(datos: DatosCaso): string {
  if (datos.forma === 'separar') return 'Escribe las sílabas separadas por guiones';
  if (datos.forma === 'identificar') return 'Elige qué tiene la palabra';
  return 'Elige el tipo';
}

/** Lo que se pinta en cada botón de opción */
export function nombreOpcion(datos: DatosCaso, opcion: string): string {
  if (datos.forma === 'subtipo') return NOMBRE_CORTO[opcion as TipoEncuentro] ?? opcion;
  return NOMBRE_FAMILIA[opcion as Familia] ?? opcion;
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
}

/**
 * Normaliza una separación escrita por el alumno: minúsculas, y cualquier separador (guion,
 * espacio, punto, barra, guion largo) como un guion. «Po E Ta», «po·e·ta» y «po-e-ta» valen.
 */
export function normalizarSeparacion(texto: string): string {
  return texto
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/[\s.·/|_\-‐-―]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Corrige una respuesta contra el caso. Nunca lanza: lo que no se entiende es un fallo con motivo. */
export function comprobarRespuesta(entrada: string, datos: DatosCaso): Veredicto {
  const r = resolverCaso(datos);
  if (!r.ok || !r.encuentro) return { correcto: false, motivo: r.error || 'Este caso no se puede corregir.' };
  const e = r.encuentro;

  if (datos.forma === 'identificar') {
    if (!FAMILIAS_CASO.includes(entrada as Familia)) {
      return { correcto: false, motivo: 'Elige diptongo, triptongo o hiato.' };
    }
    if (entrada === r.valor) return { correcto: true, motivo: `Correcto: tiene un ${NOMBRE_FAMILIA[e.familia]}. ${e.regla}` };
    return {
      correcto: false,
      motivo:
        e.familia === 'hiato'
          ? `No: las vocales «${e.texto}» van en sílabas distintas (${r.silabas}). Busca si alguna es cerrada y tónica, o si las dos son abiertas.`
          : `No: mira las vocales «${e.texto}». Están en la misma sílaba; cuéntalas.`,
    };
  }

  if (datos.forma === 'subtipo') {
    if (!r.opciones.includes(entrada)) return { correcto: false, motivo: 'Elige una de las opciones.' };
    if (entrada === r.valor) return { correcto: true, motivo: `Correcto: es un ${NOMBRE_TIPO[e.tipo]}. ${e.regla}` };
    if (FAMILIA_DE[entrada as TipoEncuentro] === 'hiato') {
      return {
        correcto: false,
        motivo: 'No. Mira si alguna de las dos vocales es una i o una u con tilde: entonces el hiato es acentual; si las dos son abiertas o iguales, es simple.',
      };
    }
    return {
      correcto: false,
      motivo: 'No. Mira el orden: cerrada y luego abierta es creciente; abierta y luego cerrada, decreciente; dos cerradas distintas, homogéneo.',
    };
  }

  const escrita = normalizarSeparacion(entrada);
  if (!escrita) return { correcto: false, motivo: 'Escribe la palabra separada en sílabas.' };
  if (escrita === r.valor.toLowerCase()) {
    return { correcto: true, motivo: `Correcto: ${r.valor}. ${e.regla}` };
  }
  if (escrita.replace(/-/g, '') !== datos.palabra.toLowerCase()) {
    return { correcto: false, motivo: 'Has cambiado alguna letra: copia la palabra tal cual, tildes incluidas, y añade solo los guiones.' };
  }
  const tuyas = escrita.split('-').length;
  const buenas = r.valor.split('-').length;
  if (tuyas !== buenas) {
    return {
      correcto: false,
      motivo:
        e.familia === 'hiato'
          ? `Tiene ${buenas} sílabas, no ${tuyas}. Las vocales «${e.texto}» forman hiato: van en sílabas distintas.`
          : `Tiene ${buenas} sílabas, no ${tuyas}. Las vocales «${e.texto}» forman ${NOMBRE_FAMILIA[e.familia]}: no se separan.`,
    };
  }
  return { correcto: false, motivo: 'El número de sílabas está bien, pero alguna no se corta por ahí.' };
}

export interface Caso {
  id: number;
  titulo: string;
  datos: DatosCaso;
  enunciado: string;
  etiquetaRespuesta: string;
  respuesta: string;
  respuestaTexto: string;
  opciones: readonly string[];
  pasos: string[];
  pista: string;
}

interface Definicion {
  titulo: string;
  datos: DatosCaso;
  pista: string;
}

/** Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`. */
const DEFINICIONES: readonly Definicion[] = [
  { titulo: '¿Qué tiene «cielo»?', datos: { forma: 'identificar', palabra: 'cielo' }, pista: 'Dila despacio: ¿la i y la e suenan en la misma sílaba?' },
  { titulo: '¿Qué tiene «país»?', datos: { forma: 'identificar', palabra: 'país' }, pista: 'La tilde está sobre la i. ¿Qué hace la tilde con esas dos vocales?' },
  { titulo: '¿Qué tiene «buey»?', datos: { forma: 'identificar', palabra: 'buey' }, pista: 'Cuenta las vocales juntas: la y final suena como i.' },
  { titulo: 'El diptongo de «aire»', datos: { forma: 'subtipo', palabra: 'aire' }, pista: '¿Cuál va primero, la abierta o la cerrada?' },
  { titulo: 'Separar «poeta»', datos: { forma: 'separar', palabra: 'poeta' }, pista: 'La o y la e son las dos abiertas.' },
  { titulo: 'El diptongo de «ciudad»', datos: { forma: 'subtipo', palabra: 'ciudad' }, pista: 'La i y la u son las dos cerradas.' },
  { titulo: '¿Qué tiene «búho»?', datos: { forma: 'identificar', palabra: 'búho' }, pista: 'La h no separa ni une: mira la tilde.' },
  { titulo: 'El hiato de «río»', datos: { forma: 'subtipo', palabra: 'río' }, pista: 'Fíjate en qué vocal lleva la tilde.' },
  { titulo: 'Separar «maíz»', datos: { forma: 'separar', palabra: 'maíz' }, pista: 'La í tónica no se junta con la a.' },
  { titulo: 'El hiato de «leer»', datos: { forma: 'subtipo', palabra: 'leer' }, pista: 'Dos vocales iguales y abiertas, sin tilde.' },
  { titulo: 'Separar «cuidado»', datos: { forma: 'separar', palabra: 'cuidado' }, pista: 'La u y la i son dos cerradas distintas.' },
  { titulo: 'El diptongo de «nuevo»', datos: { forma: 'subtipo', palabra: 'nuevo' }, pista: '¿Cuál va primero, la cerrada o la abierta?' },
];

function textoRespuesta(datos: DatosCaso, valor: string): string {
  if (datos.forma === 'separar') return valor;
  if (datos.forma === 'subtipo') return NOMBRE_TIPO[valor as TipoEncuentro] ?? valor;
  return NOMBRE_FAMILIA[valor as Familia] ?? valor;
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
    opciones: r.opciones,
    pasos: r.ok ? r.pasos : [r.error],
    pista: def.pista,
  };
}

export const CASOS: readonly Caso[] = DEFINICIONES.map(construir);
export const TOTAL_CASOS: number = CASOS.length;

export const NOTA_CONVENIO =
  'Según la Ortografía de 2010, con palabras que se pronuncian igual en todo el español.';

// ─── Práctica aleatoria ──────────────────────────────────────────────────────────────

/**
 * Palabras con un solo encuentro vocálico y de pronunciación igual en todo el español, con
 * los mismos criterios que los doce casos. Su tipo no se anota aquí: lo da el motor (el spec
 * lo coteja con una tabla escrita a mano).
 */
export const BANCO: readonly string[] = [
  // diptongos crecientes
  'cielo', 'tierra', 'bueno', 'agua', 'nuevo', 'siete', 'fuego', 'huevo', 'novia', 'serio', 'labio', 'nieve', 'puerta',
  // diptongos decrecientes
  'aire', 'peine', 'causa', 'reina', 'hoy', 'jaula', 'pausa',
  // diptongos homogéneos
  'ciudad', 'ruido', 'cuidado', 'viuda',
  // hiatos simples
  'poeta', 'leer', 'creer', 'león', 'teatro', 'museo', 'caos', 'océano', 'línea', 'héroe', 'toalla', 'peor', 'idea',
  // hiatos acentuales
  'país', 'maíz', 'día', 'río', 'búho', 'baúl', 'reír', 'oído', 'frío', 'tío', 'sandía', 'ataúd', 'actúa',
  // triptongos
  'buey', 'miau', 'guau',
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
  opciones: readonly string[];
  pasos: string[];
}

/**
 * Ejercicio aleatorio reproducible por semilla. Usa EL MISMO `resolverCaso` que los doce fijos.
 * Un triptongo solo se pregunta como 'identificar'; un monosílabo no se separa.
 */
export function generarEjercicioAleatorio(semilla: number): Ejercicio {
  const rnd = generador(semilla);
  const palabra = BANCO[Math.floor(rnd() * BANCO.length)];
  const tirada = rnd();
  const analisis = analizarPalabra(palabra);
  const familia = analisis?.encuentros[0]?.familia;
  const monosilaba = (analisis?.silabas.length ?? 0) < 2;

  let forma: FormaPregunta = 'identificar';
  if (familia !== 'triptongo') {
    if (tirada < 1 / 3) forma = 'identificar';
    else if (tirada < 2 / 3 || monosilaba) forma = 'subtipo';
    else forma = 'separar';
  }
  const datos: DatosCaso = { forma, palabra };
  const r = resolverCaso(datos);
  return {
    datos,
    enunciado: enunciadoDe(datos),
    etiquetaRespuesta: etiquetaDe(datos),
    respuesta: r.valor,
    respuestaTexto: textoRespuesta(datos, r.valor),
    opciones: r.opciones,
    pasos: r.ok ? r.pasos : [r.error],
  };
}

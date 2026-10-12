// ═══════════════════════════════════════════════════════════════════════
// FICHA DE BÚSQUEDA DE AULA — 12 datos que hay que LOCALIZAR en la tabla
//
// Por qué vive fuera de la vista: el build compila la página sin comprobar si el dato que
// esta ficha da por bueno es el que la tabla enseña. Aquí no hay React ni DOM, solo funciones
// puras, de modo que cada respuesta se puede recalcular y probar sin navegador.
//
// ⚠️ La respuesta de cada caso NO se escribe a mano: la produce `resolverCaso()` leyendo GRUPOS
//    de `./datos`, que es la MISMA tabla que ve el alumno, y con el MISMO buscador
//    (`coincideConLaBusqueda`). Una lista paralela divergiría en silencio y la app acabaría
//    suspendiendo una respuesta que ella misma muestra en pantalla.
//
// ⚠️ NADA lanza excepciones. Si un dato no se localiza se devuelve `{ ok: false, error }`:
//    un `throw` dentro de un render de React tumbaría la app entera.
//
// ───────────────────────────────────────────────────────────────────────
// EL CONVENIO DE ESTA APP (varias respuestas legítimas darían preguntas ambiguas)
// ───────────────────────────────────────────────────────────────────────
//
// 1. DOS NOMBRES PARA EL MISMO COMPUESTO. La ficha escribe el sistemático (IUPAC 2013) y, entre
//    paréntesis, el tradicional: «Propanona (acetona)». Una pregunta que pide un nombre dice
//    SIEMPRE «sistemático»; el tradicional no se acepta, pero recibe un aviso propio en vez de
//    un «incorrecto» a secas, porque el alumno ha encontrado el dato correcto.
//
// 2. EL NÚMERO DE PRIORIDAD ES EL DE ESTA TABLA. Cada libro numera la escalera a su manera
//    (unos cuentan juntos alcohol y fenol, otros no; unos dan puesto a los hidroperóxidos, otros
//    no). Lo que la IUPAC fija es el ORDEN, así que las preguntas de «quién manda» comparan dos
//    grupos —respuesta única en cualquier libro que siga la IUPAC— y la única que pide el número
//    dice «según esta tabla».
//
// 3. LOS EMPATES SE EXCLUYEN. Alcohol y fenol comparten la prioridad 10, las tres aminas la 13,
//    alqueno y alquino la 16. Una comparación entre dos grupos empatados no tiene respuesta
//    única: `resolverCaso` la rechaza, y el modo práctica no la genera nunca.
//
// 4. LOS AFIJOS COMPUESTOS NO SE PREGUNTAN. «ácido …-oico», «-oato de …ilo» o «alcoxi- (metoxi-,
//    etoxi-…)» admiten varias grafías razonables. Solo se pide un sufijo o un prefijo cuando la
//    tabla lo da como UNA palabra («-ona», «oxo-»), y un sufijo solo se usa para identificar un
//    grupo si ningún otro lo comparte («-ol» es de alcohol y de fenol: no vale).
//
// 5. GRAFÍAS. La respuesta es texto y se compara NORMALIZADA: minúsculas, sin tildes, subíndices
//    como cifras, guiones de los extremos fuera («-ona» = «ona», «oxo-» = «oxo»), y sin artículo
//    ni la palabra «grupo» delante («el grupo nitro» = «nitro»). Las otras formas legítimas del
//    MISMO dato se declaran como sinónimos, generadas desde la propia tabla.
// ═══════════════════════════════════════════════════════════════════════

import { GRUPOS, coincideConLaBusqueda, normalizar, type GrupoFuncional } from './datos';

// ───────────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────────

/** Qué dato hay que localizar en la tabla */
export type CampoBuscado =
  | 'sufijo'
  | 'prefijo'
  | 'prioridad'
  | 'grupo-desde-sufijo'
  | 'grupo-desde-busqueda'
  | 'nombre-ejemplo'
  | 'manda-de-dos'
  | 'solo-prefijo-de-dos'
  | 'prefijo-del-que-cede';

/** Todo lo necesario para volver a leer la respuesta de la tabla */
export interface DatosCaso {
  campo: CampoBuscado;
  /** Id del grupo (búsquedas de una sola fila) */
  grupo?: string;
  /** Ids de los dos grupos que se comparan */
  grupos?: readonly string[];
  /** Sufijo de partida, para identificar el grupo que lo usa */
  sufijo?: string;
  /** Lo que se teclea en el buscador de la página */
  termino?: string;
  /** Grafías legítimas que la tabla no puede deducir sola (p. ej. «COOH» por «ácido carboxílico») */
  sinonimosExtra?: readonly string[];
}

/** Una respuesta equivocada pero reconocible, que merece un aviso distinto de «está mal» */
export interface Trampa {
  grafias: readonly string[];
  motivo: string;
}

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'localizar' | 'comparar' | 'aplicado';
  datos: DatosCaso;
  /** Qué se escribe en la casilla. NUNCA vacía */
  etiquetaRespuesta: string;
  /** Leída de la tabla por `resolverCaso`, jamás escrita a mano */
  respuesta: string;
  /** Otras grafías legítimas de la MISMA respuesta */
  sinonimos: readonly string[];
  trampas: readonly Trampa[];
  /** Dónde mirar en la tabla (no es un desarrollo: es un recorrido) */
  pasos: readonly string[];
  pista: string;
}

/** Una pregunta del modo práctica: misma forma que un caso, pero generada */
export interface Pregunta {
  semilla: number;
  campo: CampoBuscado;
  enunciado: string;
  etiquetaRespuesta: string;
  respuesta: string;
  sinonimos: readonly string[];
  trampas: readonly Trampa[];
  pasos: readonly string[];
}

export interface Resolucion {
  ok: boolean;
  valor: string;
  sinonimos: string[];
  trampas: Trampa[];
  pasos: string[];
  error?: string;
}

/** Aviso de convenio que la sección enseña en pantalla, para que no dependa de esta cabecera */
export const NOTA_CONVENIO =
  'Los nombres siguen la IUPAC de 2013. Cuando una pregunta pide un nombre, pide el sistemático, no el tradicional que la ficha pone entre paréntesis. ' +
  'El número de prioridad es el puesto en esta tabla (1 = el que manda sobre todos): cada libro numera la escalera a su manera, pero el orden es el de la IUPAC.';

// ───────────────────────────────────────────────────────────────────────
// NORMALIZACIÓN Y GRAFÍAS
// ───────────────────────────────────────────────────────────────────────

/**
 * Deja una respuesta escrita a mano en su forma comparable. Parte del MISMO `normalizar` del
 * buscador (minúsculas, sin tildes, subíndices como cifras) y además: guiones tipográficos como
 * el del teclado, sin guiones en los extremos, sin puntuación final, sin artículo ni la palabra
 * «grupo» delante y con los espacios colapsados.
 */
export function normalizarRespuesta(texto: string): string {
  let t = normalizar(texto ?? '')
    .replace(/[−‒–—―]/g, '-')
    .replace(/[«»"'.,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^-+|-+$/g, '')
    .trim();
  for (let i = 0; i < 3; i += 1) {
    t = t.replace(/^(el|la|los|las|un|una|grupo)\s+/, '');
  }
  return t;
}

/** El nombre sin lo que va entre paréntesis: «Areno (aromático)» → «Areno» */
function sinParentesis(nombre: string): string {
  return nombre.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
}

/** Lo que va entre paréntesis, si lo hay: «Propanona (acetona)» → «acetona» */
function parentesis(nombre: string): string | undefined {
  return nombre.match(/\(([^)]+)\)/)?.[1]?.trim();
}

/** Cómo se nombra el grupo dentro de una frase, sin «Grupo» delante */
function nombreEnFrase(g: GrupoFuncional): string {
  return sinParentesis(g.nombre).replace(/^Grupo\s+/, '').toLowerCase();
}

/** Grafías del nombre de un grupo: con y sin paréntesis, el alias, y el plural si es una palabra */
function grafiasDeGrupo(g: GrupoFuncional): string[] {
  const limpio = sinParentesis(g.nombre);
  const alias = parentesis(g.nombre);
  const grafias = [g.nombre, limpio];
  if (alias) grafias.push(alias);
  if (!/\s/.test(limpio)) {
    grafias.push(/[aeiouáéíóú]$/i.test(limpio) ? `${limpio}s` : `${limpio}es`);
  }
  return grafias;
}

/** Un sufijo de una sola palabra («-ona»); los compuestos («ácido …-oico») no se preguntan */
function sufijoSimple(g: GrupoFuncional): string | undefined {
  return /^-[a-záéíóúñ]+$/i.test(g.sufijo) ? g.sufijo : undefined;
}

/** Un prefijo de una sola palabra («oxo-»); los que traen alternativas no se preguntan */
function prefijoSimple(g: GrupoFuncional): string | undefined {
  return /^[a-záéíóúñ]+-$/i.test(g.prefijo) ? g.prefijo : undefined;
}

/** Puesto en la escalera: los «solo prefijo» van detrás de todos */
function rango(g: GrupoFuncional): number {
  return g.prioridad ?? Number.POSITIVE_INFINITY;
}

function etiquetaPrioridad(g: GrupoFuncional): string {
  return g.prioridad === null ? '«Solo prefijo»' : `«Prioridad ${g.prioridad}»`;
}

const CARDINALES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete',
];

/**
 * Los grupos cuyo sufijo contiene esta palabra suelta. Con más de uno, el sufijo no identifica
 * un grupo: «-amina» es de las tres aminas aunque solo la primaria lo escriba a secas.
 */
function gruposConSufijo(sufijo: string): GrupoFuncional[] {
  const buscado = normalizar(sufijo.trim());
  return GRUPOS.filter((g) => normalizar(g.sufijo).split(/\s+/).includes(buscado));
}

/** Lo que devuelve el buscador de la página con este término, en el orden por categoría */
function filasDelBuscador(termino: string): GrupoFuncional[] {
  const t = normalizar(termino.trim());
  return GRUPOS.filter((g) => coincideConLaBusqueda(g, t));
}

// ───────────────────────────────────────────────────────────────────────
// LOCALIZADORES EN LA TABLA
// ───────────────────────────────────────────────────────────────────────

function porId(id?: string): GrupoFuncional | undefined {
  if (!id) return undefined;
  return GRUPOS.find((g) => g.id === id);
}

function dosGrupos(ids?: readonly string[]): [GrupoFuncional, GrupoFuncional] | undefined {
  if (!ids || ids.length !== 2) return undefined;
  const a = porId(ids[0]);
  const b = porId(ids[1]);
  if (!a || !b || a.id === b.id) return undefined;
  return [a, b];
}

function fallo(error: string): Resolucion {
  return { ok: false, valor: '', sinonimos: [], trampas: [], pasos: [], error };
}

/** El paso de buscar una fila, con lo que de verdad devuelve el buscador */
function pasoBuscar(g: GrupoFuncional): string {
  const termino = nombreEnFrase(g);
  const filas = filasDelBuscador(termino);
  return filas.length === 1
    ? `Escribe «${termino}» en el buscador: queda una sola fila.`
    : `Escribe «${termino}» en el buscador: quedan ${filas.length} filas, y la que buscas es «${g.nombre}».`;
}

// ───────────────────────────────────────────────────────────────────────
// RESOLUCIÓN: la respuesta y el «dónde mirar» salen de la tabla
// ───────────────────────────────────────────────────────────────────────

export function resolverCaso(datos: DatosCaso): Resolucion {
  const extras = datos.sinonimosExtra ? [...datos.sinonimosExtra] : [];
  const listo = (valor: string, sinonimos: string[], pasos: string[], trampas: Trampa[] = []): Resolucion => {
    const aceptadas = new Set([valor, ...sinonimos, ...extras].map(normalizarRespuesta));
    return {
      ok: true,
      valor,
      sinonimos: [...new Set([...sinonimos, ...extras])].filter((s) => s.length > 0),
      // Una trampa nunca puede tapar una respuesta aceptada
      trampas: trampas
        .map((t) => ({ ...t, grafias: t.grafias.filter((x) => !aceptadas.has(normalizarRespuesta(x))) }))
        .filter((t) => t.grafias.length > 0),
      pasos,
    };
  };

  switch (datos.campo) {
    case 'sufijo': {
      const g = porId(datos.grupo);
      if (!g) return fallo(`El grupo «${datos.grupo}» no está en esta tabla.`);
      const sufijo = sufijoSimple(g);
      if (!sufijo) return fallo(`El sufijo de ${g.nombre} no es una sola palabra: la pregunta admitiría varias grafías.`);
      const prefijo = prefijoSimple(g);
      return listo(sufijo, [], [
        pasoBuscar(g),
        'Cada fila enseña tres datos a la derecha del nombre: «Grupo», «Sufijo» y «Prefijo».',
        `Lee la columna «Sufijo»: ${sufijo}. Es la terminación del nombre cuando este grupo es el principal de la molécula.`,
      ], prefijo ? [{ grafias: [prefijo], motivo: 'Eso es el PREFIJO, el que se usa cuando otro grupo con más prioridad se queda el sufijo. Se pide la terminación.' }] : []);
    }

    case 'prefijo': {
      const g = porId(datos.grupo);
      if (!g) return fallo(`El grupo «${datos.grupo}» no está en esta tabla.`);
      const prefijo = prefijoSimple(g);
      if (!prefijo) return fallo(`El prefijo de ${g.nombre} no es una sola palabra: la pregunta admitiría varias grafías.`);
      const sufijo = sufijoSimple(g);
      return listo(prefijo, [], [
        pasoBuscar(g),
        'Cada fila enseña tres datos a la derecha del nombre: «Grupo», «Sufijo» y «Prefijo».',
        `Lee la columna «Prefijo»: ${prefijo}. Es como se nombra el grupo cuando otro con más prioridad se queda el sufijo.`,
      ], sufijo ? [{ grafias: [sufijo], motivo: 'Eso es el SUFIJO, la terminación que se usa cuando este grupo manda. Se pide el prefijo, el que lleva cuando cede.' }] : []);
    }

    case 'prioridad': {
      const g = porId(datos.grupo);
      if (!g) return fallo(`El grupo «${datos.grupo}» no está en esta tabla.`);
      if (g.prioridad === null) return fallo(`${g.nombre} no tiene número de prioridad: solo puede ser prefijo.`);
      const n = g.prioridad;
      return listo(String(n), [CARDINALES[n] ?? '', `prioridad ${n}`], [
        pasoBuscar(g),
        `Junto al nombre de la fila hay una etiqueta con su puesto en la escalera: «Prioridad ${n}».`,
        'Para ver la escalera entera, pulsa «Ordenar por: Prioridad IUPAC»: de arriba abajo, del que manda sobre todos al que nunca da el sufijo.',
      ]);
    }

    case 'grupo-desde-sufijo': {
      const sufijo = (datos.sufijo ?? '').trim();
      if (!/^-[a-záéíóúñ]+$/i.test(sufijo)) return fallo(`«${sufijo}» no es un sufijo de una sola palabra.`);
      const duenos = gruposConSufijo(sufijo);
      if (duenos.length === 0) return fallo(`Ningún grupo de esta tabla usa el sufijo «${sufijo}».`);
      if (duenos.length > 1) {
        return fallo(`El sufijo «${sufijo}» lo usan ${duenos.map((g) => g.nombre).join(' y ')}: la pregunta no tendría una sola respuesta.`);
      }
      const g = duenos[0];
      const filas = filasDelBuscador(sufijo);
      const pasoBusqueda = filas.length === 1
        ? `Escribe «${sufijo}» en el buscador, con el guion: queda una sola fila.`
        : `Escribe «${sufijo}» en el buscador, con el guion: quedan ${filas.length} filas.`;
      return listo(g.nombre, grafiasDeGrupo(g), [
        'El buscador también busca dentro de la columna «Sufijo», no solo por el nombre del grupo.',
        pasoBusqueda,
        `La fila que lleva «${sufijo}» en la columna «Sufijo» es «${g.nombre}».`,
      ]);
    }

    case 'grupo-desde-busqueda': {
      const termino = (datos.termino ?? '').trim();
      if (!termino) return fallo('Falta lo que hay que escribir en el buscador.');
      const filas = filasDelBuscador(termino);
      if (filas.length !== 1) {
        return fallo(`«${termino}» deja ${filas.length} filas en el buscador: la pregunta no tendría una sola respuesta.`);
      }
      const g = filas[0];
      return listo(g.nombre, grafiasDeGrupo(g), [
        `Escribe «${termino}» en el buscador: busca también dentro de los ejemplos y de los nombres tradicionales.`,
        `Queda una sola fila: «${g.nombre}».`,
        `Pulsa la fila para abrir la ficha: el recuadro «Ejemplo» lo confirma con ${g.ejemploFormula}, ${g.ejemploNombre}.`,
      ]);
    }

    case 'nombre-ejemplo': {
      const g = porId(datos.grupo);
      if (!g) return fallo(`El grupo «${datos.grupo}» no está en esta tabla.`);
      if (/—/.test(g.ejemploNombre)) {
        return fallo(`El ejemplo de ${g.nombre} trae dos nombres separados por una raya: la pregunta admitiría los dos.`);
      }
      const sistematico = sinParentesis(g.ejemploNombre);
      const alias = parentesis(g.ejemploNombre);
      // El alias puede ser el nombre entero («acetona») o solo la palabra que cambia
      // («Ácido etanoico (acético)» → «ácido acético»).
      const palabras = sistematico.split(' ');
      // Solo si el alias es la misma clase de palabra (misma terminación: «etanoico»/«acético»,
      // «etanoílo»/«acetilo»); una sigla o un nombre entero («DMSO», «dimetilsulfona») va tal cual.
      const ultima = palabras[palabras.length - 1] ?? '';
      const mismaTerminacion = alias !== undefined && normalizar(alias).slice(-2) === normalizar(ultima).slice(-2);
      const tradicional = alias && !/\s/.test(alias) && palabras.length > 1 && mismaTerminacion
        ? [...palabras.slice(0, -1), alias].join(' ')
        : alias;
      const trampas: Trampa[] = tradicional
        ? [{ grafias: [tradicional, alias ?? ''].filter((x) => x), motivo: `Ese es el nombre tradicional, el que la ficha pone entre paréntesis. Se pide el sistemático (IUPAC): el que va delante.` }]
        : [];
      return listo(sistematico, [g.ejemploNombre], [
        pasoBuscar(g),
        'Pulsa la fila para abrir su ficha.',
        `El recuadro «Ejemplo» da la fórmula, ${g.ejemploFormula}, y debajo su nombre: «${g.ejemploNombre}».`,
        alias
          ? 'Lo que va delante es el nombre sistemático; lo que va entre paréntesis, el tradicional.'
          : 'La ficha solo da el nombre sistemático.',
      ], trampas);
    }

    case 'manda-de-dos': {
      const par = dosGrupos(datos.grupos);
      if (!par) return fallo('Hacen falta dos grupos distintos que estén en esta tabla.');
      const [a, b] = par;
      if (rango(a) === rango(b)) {
        return fallo(`${a.nombre} y ${b.nombre} empatan en la escalera: la pregunta no tendría una sola respuesta.`);
      }
      // Entre dos hidrocarburos no decide la escalera sino la cadena principal (anillo frente a
      // cadena, longitud…): el estireno es etenilbenceno aunque el alqueno tenga mejor número.
      if (a.categoria === 'hidrocarburos' && b.categoria === 'hidrocarburos') {
        return fallo(`Entre ${a.nombre} y ${b.nombre} no decide la escalera de prioridad, sino la elección de la cadena principal.`);
      }
      const [manda, cede] = rango(a) < rango(b) ? [a, b] : [b, a];
      return listo(manda.nombre, grafiasDeGrupo(manda), [
        'Pulsa «Ordenar por: Prioridad IUPAC»: la tabla se ordena del grupo que manda sobre todos al que nunca da el sufijo.',
        `Localiza las dos filas: ${a.nombre} lleva ${etiquetaPrioridad(a)} y ${b.nombre} lleva ${etiquetaPrioridad(b)}.`,
        `El número más bajo es el que manda: ${manda.nombre} da el sufijo y ${cede.nombre} pasa a prefijo.`,
      ], [{ grafias: grafiasDeGrupo(cede), motivo: `Ese es el que CEDE el sufijo: tiene un número de prioridad más alto, así que en el nombre va como prefijo.` }]);
    }

    case 'solo-prefijo-de-dos': {
      const par = dosGrupos(datos.grupos);
      if (!par) return fallo('Hacen falta dos grupos distintos que estén en esta tabla.');
      const [a, b] = par;
      const soloPrefijo = par.filter((g) => g.prioridad === null);
      if (soloPrefijo.length !== 1) {
        return fallo(`Entre ${a.nombre} y ${b.nombre} no hay exactamente uno que sea solo prefijo.`);
      }
      const g = soloPrefijo[0];
      const otro = g.id === a.id ? b : a;
      return listo(g.nombre, grafiasDeGrupo(g), [
        `Busca las dos filas: ${a.nombre} y ${b.nombre}.`,
        `Mira la etiqueta junto al nombre: ${a.nombre} lleva ${etiquetaPrioridad(a)} y ${b.nombre} lleva ${etiquetaPrioridad(b)}.`,
        `En la columna «Sufijo» de ${g.nombre} pone «${g.sufijo}»: siempre se nombra como prefijo, ${g.prefijo}.`,
      ], [{ grafias: grafiasDeGrupo(otro), motivo: `Ese sí puede ser sufijo: su columna «Sufijo» da «${otro.sufijo}».` }]);
    }

    case 'prefijo-del-que-cede': {
      const par = dosGrupos(datos.grupos);
      if (!par) return fallo('Hacen falta dos grupos distintos que estén en esta tabla.');
      const [a, b] = par;
      if (rango(a) === rango(b)) {
        return fallo(`${a.nombre} y ${b.nombre} empatan en la escalera: no se sabe cuál cede.`);
      }
      const [manda, cede] = rango(a) < rango(b) ? [a, b] : [b, a];
      const prefijo = prefijoSimple(cede);
      if (!prefijo) return fallo(`El prefijo de ${cede.nombre} no es una sola palabra.`);
      const trampas: Trampa[] = [];
      const sufijoCede = sufijoSimple(cede);
      if (sufijoCede) {
        trampas.push({ grafias: [sufijoCede], motivo: `Ese es el sufijo de ${cede.nombre.toLowerCase()}, pero aquí no manda: va como prefijo.` });
      }
      const prefijoManda = prefijoSimple(manda);
      if (prefijoManda) {
        trampas.push({ grafias: [prefijoManda], motivo: `Ese es el prefijo de ${manda.nombre.toLowerCase()}, que aquí NO va de prefijo: es el que manda y da el sufijo.` });
      }
      return listo(prefijo, [], [
        `Primero, quién manda: ${a.nombre} lleva ${etiquetaPrioridad(a)} y ${b.nombre} lleva ${etiquetaPrioridad(b)}. Manda el número más bajo: ${manda.nombre}.`,
        `${cede.nombre} cede el sufijo, así que se nombra con su prefijo.`,
        `Lee la columna «Prefijo» de la fila de ${cede.nombre}: ${prefijo}.`,
      ], trampas);
    }

    default:
      return fallo('Campo desconocido: esta pregunta no sabe qué dato buscar.');
  }
}

// ───────────────────────────────────────────────────────────────────────
// LOS 12 CASOS
// ───────────────────────────────────────────────────────────────────────

type CasoDeclarado = Omit<Caso, 'respuesta' | 'sinonimos' | 'trampas' | 'pasos'>;

/** Completa un caso declarado leyendo su respuesta de la tabla. Nunca lanza. */
function construir(base: CasoDeclarado): Caso {
  const r = resolverCaso(base.datos);
  return {
    ...base,
    respuesta: r.ok ? r.valor : '',
    sinonimos: r.ok ? r.sinonimos : [],
    trampas: r.ok ? r.trampas : [],
    pasos: r.ok ? r.pasos : [r.error ?? 'Este dato no se ha podido leer de la tabla.'],
  };
}

const DECLARADOS: CasoDeclarado[] = [
  {
    id: 1,
    titulo: 'La terminación de las cetonas',
    enunciado:
      'Cuando la cetona es el grupo principal de una molécula, su nombre acaba en un sufijo característico. Busca la cetona en la tabla y escribe ese sufijo.',
    categoria: 'localizar',
    datos: { campo: 'sufijo', grupo: 'cetona' },
    etiquetaRespuesta: 'Sufijo IUPAC',
    pista: 'Cada fila tiene tres columnas a la derecha del nombre. El sufijo es la terminación; el prefijo es otra cosa y va en la columna de al lado.',
  },
  {
    id: 2,
    titulo: 'El alcohol cuando no manda',
    enunciado:
      'Si una molécula tiene un alcohol y otro grupo con más prioridad, el –OH no da la terminación: se nombra con un prefijo. Busca el alcohol y escribe ese prefijo.',
    categoria: 'localizar',
    datos: { campo: 'prefijo', grupo: 'alcohol' },
    etiquetaRespuesta: 'Prefijo IUPAC',
    pista: 'Se pide la columna «Prefijo», no «Sufijo». El sufijo del alcohol (-ol) solo se usa cuando es él quien manda.',
  },
  {
    id: 3,
    titulo: 'El grupo del sufijo «-al»',
    enunciado:
      'El metanal, el etanal y el propanal terminan todos en «-al». ¿Qué grupo funcional usa ese sufijo? Escribe su nombre.',
    categoria: 'localizar',
    datos: { campo: 'grupo-desde-sufijo', sufijo: '-al' },
    etiquetaRespuesta: 'Grupo funcional',
    pista: 'El buscador también mira dentro de la columna «Sufijo». No confundas «-al» con «-ol», que es de otro grupo.',
  },
  {
    id: 4,
    titulo: 'El puesto de la amida',
    enunciado:
      '¿Qué número de prioridad le da esta tabla a la amida? Recuerda que el 1 es el grupo que manda sobre todos los demás.',
    categoria: 'localizar',
    datos: { campo: 'prioridad', grupo: 'amida' },
    etiquetaRespuesta: 'Número de prioridad en esta tabla',
    pista: 'Cada fila lleva junto al nombre una etiqueta «Prioridad N». También puedes ordenar la tabla por prioridad y contar desde arriba.',
  },
  {
    id: 5,
    titulo: 'El éster del ejemplo',
    enunciado:
      'La ficha del éster trae como ejemplo el compuesto CH₃–COO–CH₂–CH₃, un disolvente de olor afrutado. ¿Cuál es su nombre sistemático (IUPAC)?',
    categoria: 'localizar',
    datos: { campo: 'nombre-ejemplo', grupo: 'ester' },
    etiquetaRespuesta: 'Nombre sistemático (IUPAC)',
    pista: 'Abre la ficha del éster pulsando su fila. En el recuadro «Ejemplo», el nombre de delante es el sistemático y el del paréntesis, el tradicional.',
  },
  {
    id: 6,
    titulo: 'Aldehído contra cetona',
    enunciado:
      'Una molécula tiene a la vez un grupo aldehído y un grupo cetona. ¿Cuál de los dos da la terminación del nombre? Escribe el nombre del grupo.',
    categoria: 'comparar',
    datos: { campo: 'manda-de-dos', grupos: ['aldehido', 'cetona'] },
    etiquetaRespuesta: 'Grupo funcional que da el sufijo',
    pista: 'Ordena la tabla por prioridad. El que tenga el número más bajo manda; el otro pasa a prefijo.',
  },
  {
    id: 7,
    titulo: 'Nitrilo contra aldehído',
    enunciado:
      'En una misma molécula hay un nitrilo (–C≡N) y un aldehído (–CHO). Según esta tabla, que sigue la IUPAC de 2013, ¿cuál de los dos da la terminación del nombre?',
    categoria: 'comparar',
    datos: { campo: 'manda-de-dos', grupos: ['nitrilo', 'aldehido'] },
    etiquetaRespuesta: 'Grupo funcional que da el sufijo',
    pista: 'No te fíes de la intuición: compara las dos etiquetas «Prioridad N». Hay quien cree que el aldehído gana siempre, y aquí no es así.',
  },
  {
    id: 8,
    titulo: 'Nitro o nitrilo: el que nunca es sufijo',
    enunciado:
      'El grupo nitro (–NO₂) y el nitrilo (–C≡N) se parecen en el nombre, pero solo uno de los dos puede dar la terminación de un compuesto. ¿Cuál es el que NUNCA puede ser sufijo?',
    categoria: 'comparar',
    datos: { campo: 'solo-prefijo-de-dos', grupos: ['nitro', 'nitrilo'], sinonimosExtra: ['NO₂', '–NO₂'] },
    etiquetaRespuesta: 'Grupo funcional',
    pista: 'Busca «nitr» y quedan los dos juntos. Mira la etiqueta que llevan junto al nombre y lo que pone en su columna «Sufijo».',
  },
  {
    id: 9,
    titulo: 'El ácido láctico',
    enunciado:
      'El ácido láctico, el que se acumula en los músculos con el ejercicio intenso, es CH₃–CH(OH)–COOH: tiene un alcohol (–OH) y un ácido carboxílico (–COOH). ¿Cuál de los dos grupos da la terminación de su nombre sistemático?',
    categoria: 'aplicado',
    datos: {
      campo: 'manda-de-dos',
      grupos: ['alcohol', 'acido-carboxilico'],
      sinonimosExtra: ['COOH', '–COOH', 'carboxílico', 'carboxilo', 'grupo carboxilo', 'ácido'],
    },
    etiquetaRespuesta: 'Grupo funcional que da el sufijo',
    pista: 'Ordena la tabla por prioridad y mira cuál de los dos sale más arriba. La ficha del alcohol trae justo este ejemplo en «Cómo se nombra».',
  },
  {
    id: 10,
    titulo: 'El ácido pirúvico',
    enunciado:
      'El ácido pirúvico, CH₃–CO–COOH, tiene una cetona y un ácido carboxílico. El ácido manda y da la terminación; la cetona se nombra con un prefijo. ¿Cuál es ese prefijo?',
    categoria: 'aplicado',
    datos: { campo: 'prefijo-del-que-cede', grupos: ['cetona', 'acido-carboxilico'] },
    etiquetaRespuesta: 'Prefijo IUPAC',
    pista: 'Se pide el prefijo del grupo que CEDE, no el del que manda. Busca la cetona y lee su columna «Prefijo».',
  },
  {
    id: 11,
    titulo: 'El grupo del tolueno',
    enunciado:
      'El tolueno es un disolvente que se usa en pinturas y pegamentos. ¿A qué grupo funcional pertenece? Escribe en el buscador el nombre «tolueno» y escribe el grupo que aparece.',
    categoria: 'aplicado',
    datos: { campo: 'grupo-desde-busqueda', termino: 'tolueno', sinonimosExtra: ['benceno', 'anillo aromático', 'aromáticos'] },
    etiquetaRespuesta: 'Grupo funcional',
    pista: 'El buscador entiende nombres tradicionales y ejemplos, no solo nombres de grupo. Abre la ficha que aparece para ver el anillo dibujado.',
  },
  {
    id: 12,
    titulo: 'El ácido del vinagre',
    enunciado:
      'El vinagre debe su sabor a un ácido de fórmula CH₃–COOH, que es el ejemplo de la ficha del ácido carboxílico. ¿Cuál es su nombre sistemático (IUPAC)?',
    categoria: 'aplicado',
    datos: { campo: 'nombre-ejemplo', grupo: 'acido-carboxilico' },
    etiquetaRespuesta: 'Nombre sistemático (IUPAC)',
    pista: 'El nombre de toda la vida va entre paréntesis en la ficha: se pide el otro, el que se construye contando los carbonos de la cadena.',
  },
];

export const CASOS: readonly Caso[] = DECLARADOS.map(construir);

export const TOTAL_CASOS: number = CASOS.length;

// ───────────────────────────────────────────────────────────────────────
// COMPROBACIÓN
// ───────────────────────────────────────────────────────────────────────

export function comprobarRespuesta(
  usuario: string,
  caso: Caso | Pregunta,
): { correcto: boolean; motivo: string } {
  const escrito = normalizarRespuesta(usuario);
  if (!escrito) {
    return { correcto: false, motivo: 'Escribe una respuesta antes de comprobar.' };
  }
  if (!caso.respuesta) {
    return {
      correcto: false,
      motivo: 'Esta pregunta no ha podido leer su dato de la tabla, así que no puede corregirte. No es cosa de tu respuesta.',
    };
  }

  if (escrito === normalizarRespuesta(caso.respuesta)) {
    return { correcto: true, motivo: `Correcto: ${caso.respuesta}.` };
  }

  const aceptadas = new Set(caso.sinonimos.map(normalizarRespuesta).filter((s) => s.length > 0));
  if (aceptadas.has(escrito)) {
    return { correcto: true, motivo: `Correcto. La tabla lo escribe así: ${caso.respuesta}.` };
  }

  for (const trampa of caso.trampas) {
    if (trampa.grafias.some((g) => normalizarRespuesta(g) === escrito)) {
      return { correcto: false, motivo: trampa.motivo };
    }
  }

  return {
    correcto: false,
    motivo: 'No es lo que dice la tabla. Abre «Dónde mirar» y repasa el recorrido antes de volver a intentarlo.',
  };
}

// ───────────────────────────────────────────────────────────────────────
// MODO PRÁCTICA: preguntas sacadas de la propia tabla, reproducibles por semilla
// ───────────────────────────────────────────────────────────────────────

/**
 * splitmix32. ⚠️ La semilla se MEZCLA antes de usarse: un xorshift sembrado con enteros
 * pequeños devuelve valores diminutos y parecidos en su primera llamada, así que
 * `Math.floor(rnd() * n)` sale 0 con todas las semillas y el generador devuelve siempre la
 * misma pregunta — siendo reproducible, que es lo único que comprueba la prueba obvia.
 */
function aleatorioDesde(semilla: number): () => number {
  let a = (semilla >>> 0) + 0x9e3779b9;
  return () => {
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    t = t ^ (t >>> 15);
    return (t >>> 0) / 4294967296;
  };
}

const ETIQUETAS: Record<CampoBuscado, string> = {
  sufijo: 'Sufijo IUPAC',
  prefijo: 'Prefijo IUPAC',
  prioridad: 'Número de prioridad en esta tabla',
  'grupo-desde-sufijo': 'Grupo funcional',
  'grupo-desde-busqueda': 'Grupo funcional',
  'nombre-ejemplo': 'Nombre sistemático (IUPAC)',
  'manda-de-dos': 'Grupo funcional que da el sufijo',
  'solo-prefijo-de-dos': 'Grupo funcional',
  'prefijo-del-que-cede': 'Prefijo IUPAC',
};

/** Enunciado de una pregunta de práctica. Solo se llama con datos que `resolverCaso` ya resolvió. */
function enunciadoPractica(datos: DatosCaso): string {
  const g = porId(datos.grupo);
  const par = dosGrupos(datos.grupos);
  switch (datos.campo) {
    case 'sufijo':
      return `¿Qué sufijo recibe un compuesto cuyo grupo principal es «${g ? sinParentesis(g.nombre) : ''}»? Búscalo en la tabla y escribe la terminación.`;
    case 'prefijo':
      return `Cuando el grupo «${g ? sinParentesis(g.nombre) : ''}» cede el sufijo a otro con más prioridad, ¿con qué prefijo se nombra?`;
    case 'prioridad':
      return `¿Qué número de prioridad le da esta tabla al grupo «${g ? sinParentesis(g.nombre) : ''}»? (El 1 es el que manda sobre todos.)`;
    case 'grupo-desde-sufijo':
      return `¿Qué grupo funcional da a sus compuestos la terminación «${datos.sufijo ?? ''}»? Escribe su nombre.`;
    case 'nombre-ejemplo':
      return `La ficha del grupo «${g ? sinParentesis(g.nombre) : ''}» trae como ejemplo ${g?.ejemploFormula ?? ''}. ¿Cuál es su nombre sistemático (IUPAC)?`;
    case 'manda-de-dos':
      return `Una molécula tiene a la vez un grupo «${par ? sinParentesis(par[0].nombre) : ''}» y un grupo «${par ? sinParentesis(par[1].nombre) : ''}». ¿Cuál de los dos da la terminación del nombre?`;
    default:
      return '';
  }
}

/**
 * Todas las preguntas de práctica posibles, ya filtradas por `resolverCaso`: lo que no tiene
 * una sola respuesta en la tabla (un empate, un afijo compuesto, un sufijo compartido) no
 * llega a generarse nunca.
 */
function candidatasDe(campo: CampoBuscado): DatosCaso[] {
  const posibles: DatosCaso[] = [];
  if (campo === 'grupo-desde-sufijo') {
    const sufijos = new Set(GRUPOS.map(sufijoSimple).filter((s): s is string => Boolean(s)));
    sufijos.forEach((sufijo) => posibles.push({ campo, sufijo }));
  } else if (campo === 'manda-de-dos') {
    for (let i = 0; i < GRUPOS.length; i += 1) {
      for (let j = i + 1; j < GRUPOS.length; j += 1) {
        // Solo grupos con puesto en la escalera: un «solo prefijo» frente a un hidrocarburo
        // (nitro frente a alcano) es una pregunta trivial que el alumno no se encuentra en clase.
        if (GRUPOS[i].prioridad === null || GRUPOS[j].prioridad === null) continue;
        posibles.push({ campo, grupos: [GRUPOS[i].id, GRUPOS[j].id] });
      }
    }
  } else {
    GRUPOS.forEach((g) => posibles.push({ campo, grupo: g.id }));
  }
  return posibles.filter((d) => resolverCaso(d).ok);
}

const CAMPOS_PRACTICA: CampoBuscado[] = [
  'sufijo',
  'prefijo',
  'prioridad',
  'grupo-desde-sufijo',
  'nombre-ejemplo',
  'manda-de-dos',
];

const CANDIDATAS: Record<string, DatosCaso[]> = Object.fromEntries(
  CAMPOS_PRACTICA.map((c) => [c, candidatasDe(c)]),
);

export function generarPreguntaAleatoria(semilla?: number): Pregunta {
  const usada = typeof semilla === 'number' && Number.isFinite(semilla)
    ? Math.abs(Math.trunc(semilla))
    : Math.floor(Math.random() * 99999) + 1;
  const rnd = aleatorioDesde(usada);
  const elegir = <T,>(lista: readonly T[]): T => lista[Math.floor(rnd() * lista.length) % lista.length];

  const campos = CAMPOS_PRACTICA.filter((c) => CANDIDATAS[c].length > 0);
  const campo = elegir(campos.length > 0 ? campos : CAMPOS_PRACTICA);
  const lista = CANDIDATAS[campo] ?? [];
  const datos: DatosCaso = lista.length > 0 ? elegir(lista) : { campo: 'sufijo', grupo: 'cetona' };

  const r = resolverCaso(datos);
  // Red de seguridad: una pregunta que no se puede leer de la tabla no se enseña.
  const final = r.ok ? datos : { campo: 'sufijo' as const, grupo: 'cetona' };
  const rf = r.ok ? r : resolverCaso(final);

  return {
    semilla: usada,
    campo: final.campo,
    enunciado: enunciadoPractica(final),
    etiquetaRespuesta: ETIQUETAS[final.campo],
    respuesta: rf.valor,
    sinonimos: rf.sinonimos,
    trampas: rf.trampas,
    pasos: rf.pasos,
  };
}

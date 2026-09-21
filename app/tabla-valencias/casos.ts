// ═══════════════════════════════════════════════════════════════════════
// FICHA DE BÚSQUEDA DE AULA — 12 datos que hay que LOCALIZAR en la tabla
//
// Por qué vive fuera de la vista: el build compila la página sin comprobar si el dato que
// esta ficha da por bueno es el que la tabla enseña. Aquí no hay React ni DOM, solo funciones
// puras, de modo que cada respuesta se puede recalcular y probar sin navegador.
//
// ⚠️ La respuesta de cada caso NO se escribe a mano: la produce `resolverCaso()` leyendo
//    ELEMENTOS e IONES de `./datos`, que es la MISMA tabla que ve el alumno. Una lista
//    paralela divergiría en silencio y la app acabaría suspendiendo una respuesta que ella
//    misma muestra en pantalla.
//
// ⚠️ NADA lanza excepciones. Si un dato no se localiza se devuelve `{ ok: false, error }`:
//    un `throw` dentro de un render de React tumbaría la app entera.
//
// ───────────────────────────────────────────────────────────────────────
// EL CONVENIO DE ESTA APP (varias definiciones legítimas dan respuestas distintas)
// ───────────────────────────────────────────────────────────────────────
//
// 1. VALENCIA ≠ NÚMERO DE OXIDACIÓN. La interfaz `Elemento` ya lo separa: `valencias` es la
//    capacidad de combinación y va SIN signo; `estados[].valor` es el número de oxidación y
//    va CON signo. Cada enunciado dice cuál de los dos pide, y su `etiquetaRespuesta` lo
//    repite («Valencia (sin signo)» / «Número de oxidación (con signo)»). Nunca se escribe
//    «la valencia» para pedir un número de oxidación.
//
// 2. TRES NOMENCLATURAS LEGÍTIMAS para el mismo compuesto: sistemática, de Stock y
//    tradicional. Un enunciado que pida un nombre dice SIEMPRE en cuál de las tres; si no lo
//    dijera, la pregunta admitiría tres respuestas distintas y no valdría. El caso 5 pide
//    explícitamente la tradicional, que es la que la tabla guarda en `Elemento.tradicional`.
//
// 3. «CON EL QUE ACTÚA MÁS A MENUDO» sale de `masComun`, no del criterio de quien escribe el
//    caso. `frecuente: false` marca los estados que existen pero rara vez se piden; se
//    cuentan cuando la pregunta dice «todos» (caso 9), y no se presentan como habituales.
//
// 4. LOS ESTADOS EXÓTICOS ESTÁN DELIBERADAMENTE OMITIDOS de los datos (Ag(II), Fe(VI),
//    Cu(III)…). No se usan ni se dan por existentes: las respuestas son las que la tabla
//    enseña, y los enunciados dicen «según esta tabla» donde la cuenta depende de ello.
//
// 5. GRAFÍAS. La respuesta es texto y se compara NORMALIZADA (minúsculas, sin tildes,
//    espacios colapsados, menos tipográfico «−» equiparado a «-»). Las otras formas legítimas
//    de escribir el MISMO dato se declaran como sinónimos, generados desde la propia tabla:
//    «Fe» / «hierro», «+2» / «2» / «II». El signo de un estado negativo NO es una grafía:
//    «2» nunca vale por «−2».
// ═══════════════════════════════════════════════════════════════════════

import { ELEMENTOS, IONES, type Elemento, type IonPoliatomico } from './datos';

// ───────────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────────

/** Qué dato hay que localizar en la tabla */
export type CampoBuscado =
  | 'simbolo-desde-z'
  | 'grupo'
  | 'valencias'
  | 'estado-mas-comun'
  | 'estado-en-ejemplo'
  | 'numero-de-estados'
  | 'nombre-tradicional'
  | 'mayor-estado-de-dos'
  | 'unico-estado-de-dos'
  | 'ion-nombre'
  | 'ion-carga'
  | 'ion-estado-central';

/** Todo lo necesario para volver a leer la respuesta de la tabla */
export interface DatosCaso {
  campo: CampoBuscado;
  /** Símbolo del elemento (búsquedas de un solo elemento) */
  simbolo?: string;
  /** Los dos símbolos que se comparan */
  simbolos?: readonly string[];
  /** Número atómico, cuando la búsqueda parte de él */
  z?: number;
  /** Número de oxidación de partida (nomenclatura tradicional) */
  estado?: number;
  /** Fórmula del compuesto de ejemplo dentro de la ficha del elemento */
  ejemplo?: string;
  /** Nombre del ion poliatómico */
  ion?: string;
  /** Fórmula del ion poliatómico */
  formulaIon?: string;
  /** Grafías legítimas que la tabla no puede deducir sola (p. ej. «fierro» por «hierro») */
  sinonimosExtra?: readonly string[];
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
  pasos: readonly string[];
}

export interface Resolucion {
  ok: boolean;
  valor: string;
  sinonimos: string[];
  pasos: string[];
  error?: string;
}

/** Aviso de convenio que la sección enseña en pantalla, para que no dependa de esta cabecera */
export const NOTA_CONVENIO =
  'La valencia se escribe sin signo y el número de oxidación con signo: cada pregunta dice cuál de los dos pide. ' +
  'Se aceptan las grafías equivalentes del mismo dato (Fe o hierro, +2 o II), pero no un signo distinto.';

// ───────────────────────────────────────────────────────────────────────
// NORMALIZACIÓN Y GRAFÍAS
// ───────────────────────────────────────────────────────────────────────

/**
 * Deja una respuesta escrita a mano en su forma comparable: minúsculas, sin tildes, sin
 * signos de puntuación de separación y con los espacios colapsados. El menos tipográfico
 * «−» (U+2212), que es el que usa la tabla, se equipara al guion del teclado.
 */
export function normalizarRespuesta(texto: string): string {
  return (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[−‒–—―]/g, '-')
    .replace(/[,;]/g, ' ')
    .replace(/[.]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Grafía romana de un número de oxidación, la que usa la nomenclatura de Stock */
const NUMEROS_ROMANOS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Cardinales en letra, aceptados cuando la respuesta es una cuenta */
const CARDINALES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

function romanoDe(valor: number): string {
  const abs = Math.abs(valor);
  return NUMEROS_ROMANOS[abs] ?? String(abs);
}

/** Escribe un número de oxidación como lo escribe la tabla (menos tipográfico incluido) */
export function conSigno(valor: number): string {
  if (valor > 0) return `+${valor}`;
  if (valor < 0) return `−${Math.abs(valor)}`;
  return '0';
}

/** Grafías legítimas de un número de oxidación. El signo NO es una grafía: se conserva. */
function grafiasDeEstado(valor: number): string[] {
  if (valor === 0) return ['0'];
  const abs = Math.abs(valor);
  if (valor > 0) return [`+${abs}`, `${abs}`, romanoDe(valor), `+${romanoDe(valor)}`];
  return [`-${abs}`, `−${abs}`, `-${romanoDe(valor)}`, `−${romanoDe(valor)}`];
}

/** Grafías de una carga iónica: «−3» y «3−» son la misma carga escrita al revés */
function grafiasDeCarga(carga: string): string[] {
  const m = carga.match(/^\s*([+−-])\s*(\d+)\s*$/);
  if (!m) return [carga];
  const signo = m[1] === '+' ? '+' : '-';
  return [`${signo}${m[2]}`, `${m[2]}${signo}`];
}

/**
 * Grafías del nombre de un elemento. Del campo `sinonimos` de la tabla solo se aceptan las
 * que son el mismo nombre escrito de otra forma (acentos), nunca las raíces tradicionales
 * («ferroso» no es otra manera de escribir «hierro»: es otro dato).
 */
function grafiasDeElemento(el: Elemento): string[] {
  const mismoNombre = el.sinonimos.filter(
    (s) => normalizarRespuesta(s) === normalizarRespuesta(el.nombre),
  );
  return [el.simbolo, el.nombre, ...mismoNombre];
}

// ───────────────────────────────────────────────────────────────────────
// LOCALIZADORES EN LA TABLA
// ───────────────────────────────────────────────────────────────────────

function porSimbolo(simbolo?: string): Elemento | undefined {
  if (!simbolo) return undefined;
  return ELEMENTOS.find((el) => el.simbolo === simbolo);
}

function porZ(z?: number): Elemento | undefined {
  if (typeof z !== 'number') return undefined;
  return ELEMENTOS.find((el) => el.z === z);
}

function porIon(nombreOFormula?: string): IonPoliatomico | undefined {
  if (!nombreOFormula) return undefined;
  const q = normalizarRespuesta(nombreOFormula);
  return IONES.find(
    (ion) =>
      normalizarRespuesta(ion.nombre) === q ||
      normalizarRespuesta(ion.formula) === q ||
      normalizarRespuesta(ion.nombre.replace(/\s*\(.*\)\s*/, '')) === q,
  );
}

/** El elemento de la tabla con el Z inmediatamente anterior o posterior */
function vecinoPorZ(z: number, direccion: -1 | 1): Elemento | undefined {
  const candidatos = ELEMENTOS.filter((el) => (direccion === -1 ? el.z < z : el.z > z));
  if (candidatos.length === 0) return undefined;
  return candidatos.reduce((mejor, el) =>
    direccion === -1 ? (el.z > mejor.z ? el : mejor) : el.z < mejor.z ? el : mejor,
  );
}

/**
 * Lee el número de oxidación del átomo central de un ion. La columna «Átomo central» admite
 * formas compuestas («O: −2 · H: +1», «C: −3 y +3», «S: +2 (valor medio)»): solo se acepta el
 * tramo que da UN valor limpio para el símbolo pedido; en cualquier otro caso se falla, que
 * es preferible a inventar un dato.
 */
function estadoCentral(ion: IonPoliatomico, simbolo: string): number | undefined {
  const tramos = ion.central.split('·');
  for (const tramo of tramos) {
    const m = tramo.trim().match(/^([A-Za-z]{1,2}):\s*([+−-])\s*(\d+)$/);
    if (!m) continue;
    if (m[1] !== simbolo) continue;
    const signo = m[2] === '+' ? 1 : -1;
    return signo * Number(m[3]);
  }
  return undefined;
}

function fallo(error: string): Resolucion {
  return { ok: false, valor: '', sinonimos: [], pasos: [], error };
}

// ───────────────────────────────────────────────────────────────────────
// RESOLUCIÓN: la respuesta y el «dónde mirar» salen de la tabla
// ───────────────────────────────────────────────────────────────────────

export function resolverCaso(datos: DatosCaso): Resolucion {
  const extras = datos.sinonimosExtra ? [...datos.sinonimosExtra] : [];
  const listo = (valor: string, sinonimos: string[], pasos: string[]): Resolucion => ({
    ok: true,
    valor,
    sinonimos: [...new Set([...sinonimos, ...extras])].filter((s) => s.length > 0),
    pasos,
  });

  switch (datos.campo) {
    case 'simbolo-desde-z': {
      const el = porZ(datos.z);
      if (!el) return fallo(`No hay ningún elemento con Z = ${datos.z} en esta tabla.`);
      const anterior = vecinoPorZ(el.z, -1);
      const siguiente = vecinoPorZ(el.z, 1);
      const pasos = [
        'El buscador entiende símbolos, nombres y nombres tradicionales, pero no números atómicos: este dato se localiza recorriendo la tabla.',
        'En cada fila, el número pequeño de arriba dentro del recuadro de color es el número atómico.',
        'Los botones de familia (Alcalinos, Transición, Halógenos…) acortan la lista antes de recorrerla.',
      ];
      if (anterior && siguiente) {
        pasos.push(
          `Z = ${el.z} cae entre ${anterior.nombre} (${anterior.z}) y ${siguiente.nombre} (${siguiente.z}).`,
        );
      }
      return listo(el.simbolo, grafiasDeElemento(el), pasos);
    }

    case 'grupo': {
      const el = porSimbolo(datos.simbolo);
      if (!el) return fallo(`El símbolo «${datos.simbolo}» no está en esta tabla.`);
      const numero = el.grupo.match(/\d+/)?.[0] ?? '';
      return listo(el.grupo, [numero, `grupo ${numero}`], [
        `Escribe «${el.nombre.toLowerCase()}» en el buscador de la tabla.`,
        'Abre su ficha con la flecha del final de la fila.',
        `La última línea de la ficha lo dice entero: «${el.grupo} · Número atómico ${el.z} · Valencia ${el.valencias}».`,
      ]);
    }

    case 'valencias': {
      const el = porSimbolo(datos.simbolo);
      if (!el) return fallo(`El símbolo «${datos.simbolo}» no está en esta tabla.`);
      const numeros = el.valencias.match(/\d+/g) ?? [];
      const grafias = [
        el.valencias,
        numeros.join(' '),
        [...numeros].reverse().join(' '),
        ...(numeros.length === 1 ? [romanoDe(Number(numeros[0]))] : []),
      ];
      return listo(el.valencias, grafias, [
        `Escribe «${el.nombre.toLowerCase()}» en el buscador de la tabla.`,
        'La valencia está en la línea gris de la cabecera, detrás de la familia: «… · Valencia ' + el.valencias + '».',
        'Los recuadros de colores de la derecha son los números de oxidación y llevan signo: no son la valencia.',
      ]);
    }

    case 'estado-mas-comun': {
      const el = porSimbolo(datos.simbolo);
      if (!el) return fallo(`El símbolo «${datos.simbolo}» no está en esta tabla.`);
      const est = el.estados.find((e) => e.masComun);
      if (!est) return fallo(`La ficha de ${el.nombre} no marca ningún estado como el más frecuente.`);
      return listo(conSigno(est.valor), grafiasDeEstado(est.valor), [
        `Escribe «${el.nombre.toLowerCase()}» en el buscador de la tabla.`,
        'Mira los recuadros de números de oxidación de su fila: el resaltado es el más frecuente (la leyenda del buscador lo explica).',
        `Al abrir la ficha, ese estado lleva además la marca «el más frecuente»: ${conSigno(est.valor)}, en ${est.ejemplo} (${est.nombreEjemplo}).`,
      ]);
    }

    case 'estado-en-ejemplo': {
      const el = porSimbolo(datos.simbolo);
      if (!el) return fallo(`El símbolo «${datos.simbolo}» no está en esta tabla.`);
      const buscado = normalizarRespuesta(datos.ejemplo ?? '');
      const est = el.estados.find((e) => normalizarRespuesta(e.ejemplo) === buscado);
      if (!est) return fallo(`La ficha de ${el.nombre} no trae ningún ejemplo con la fórmula «${datos.ejemplo}».`);
      return listo(conSigno(est.valor), grafiasDeEstado(est.valor), [
        `Escribe «${el.nombre.toLowerCase()}» en el buscador y abre su ficha.`,
        'Lee la lista «Estados de oxidación con ejemplos reales»: cada línea empareja un número de oxidación con un compuesto donde el elemento actúa así.',
        `Localiza la línea de ${est.ejemplo} — ${est.nombreEjemplo} — y lee el recuadro de su izquierda: ahí está la respuesta.`,
      ]);
    }

    case 'numero-de-estados': {
      const el = porSimbolo(datos.simbolo);
      if (!el) return fallo(`El símbolo «${datos.simbolo}» no está en esta tabla.`);
      const total = el.estados.length;
      return listo(String(total), [CARDINALES[total] ?? ''], [
        `Escribe «${el.nombre.toLowerCase()}» en el buscador de la tabla.`,
        'Cuenta los recuadros de su fila: hay uno por cada número de oxidación, tanto los habituales como los poco frecuentes.',
        'Al abrir la ficha, la lista «Estados de oxidación con ejemplos reales» los repite uno a uno con un compuesto real.',
      ]);
    }

    case 'nombre-tradicional': {
      const el = porSimbolo(datos.simbolo);
      if (!el) return fallo(`El símbolo «${datos.simbolo}» no está en esta tabla.`);
      if (typeof datos.estado !== 'number') return fallo('Falta el número de oxidación de partida.');
      const adjetivo = el.tradicional?.[datos.estado];
      if (!adjetivo) {
        return fallo(`La ficha de ${el.nombre} no da nombre tradicional para ${conSigno(datos.estado)}.`);
      }
      return listo(adjetivo, [adjetivo], [
        `Escribe «${el.nombre.toLowerCase()}» en el buscador y abre su ficha.`,
        'Baja hasta el bloque «Nombre tradicional según el estado».',
        `Cada línea empareja un número de oxidación con su adjetivo: ${conSigno(datos.estado)} → ${adjetivo}.`,
      ]);
    }

    case 'mayor-estado-de-dos': {
      const simbolos = datos.simbolos ?? [];
      const elementos = simbolos.map((s) => porSimbolo(s));
      if (elementos.length !== 2 || elementos.some((el) => !el)) {
        return fallo('Hacen falta dos símbolos que estén en esta tabla.');
      }
      const [a, b] = elementos as Elemento[];
      const maxA = Math.max(...a.estados.map((e) => e.valor));
      const maxB = Math.max(...b.estados.map((e) => e.valor));
      if (maxA === maxB) return fallo(`${a.nombre} y ${b.nombre} llegan al mismo número de oxidación: la pregunta no tendría una sola respuesta.`);
      const ganador = maxA > maxB ? a : b;
      return listo(ganador.simbolo, grafiasDeElemento(ganador), [
        `Busca los dos elementos, uno detrás de otro: «${a.nombre.toLowerCase()}» y «${b.nombre.toLowerCase()}».`,
        'No hace falta abrir las fichas: los recuadros de la cabecera ya muestran todos sus números de oxidación.',
        `Quédate con el valor positivo más alto de cada uno: ${a.nombre} llega a ${conSigno(maxA)} y ${b.nombre} a ${conSigno(maxB)}.`,
      ]);
    }

    case 'unico-estado-de-dos': {
      const simbolos = datos.simbolos ?? [];
      const elementos = simbolos.map((s) => porSimbolo(s));
      if (elementos.length !== 2 || elementos.some((el) => !el)) {
        return fallo('Hacen falta dos símbolos que estén en esta tabla.');
      }
      const [a, b] = elementos as Elemento[];
      const unicos = [a, b].filter((el) => el.estados.length === 1);
      if (unicos.length !== 1) {
        return fallo(`Entre ${a.nombre} y ${b.nombre} no hay exactamente uno con un solo número de oxidación.`);
      }
      const ganador = unicos[0];
      return listo(ganador.simbolo, grafiasDeElemento(ganador), [
        `Busca los dos elementos, uno detrás de otro: «${a.nombre.toLowerCase()}» y «${b.nombre.toLowerCase()}».`,
        'Cuenta los recuadros de la cabecera de cada fila: son sus números de oxidación.',
        `${a.nombre}: ${a.estados.length}. ${b.nombre}: ${b.estados.length}.`,
      ]);
    }

    case 'ion-nombre': {
      const ion = porIon(datos.formulaIon ?? datos.ion);
      if (!ion) return fallo(`«${datos.formulaIon ?? datos.ion}» no está en la tabla de iones.`);
      const alias = ion.nombre.match(/\(([^)]+)\)/)?.[1];
      const limpio = ion.nombre.replace(/\s*\([^)]*\)\s*/, '');
      return listo(ion.nombre, [limpio, alias ?? '', `ion ${limpio}`], [
        'Baja hasta la tabla de iones poliatómicos frecuentes, después del formulador.',
        `Recorre la columna «Fórmula» hasta dar con ${ion.formula}.`,
        'El nombre está en la primera columna de esa fila. Cuidado con las parejas terminadas en -ato y en -ito: se diferencian en un oxígeno.',
      ]);
    }

    case 'ion-carga': {
      const ion = porIon(datos.ion ?? datos.formulaIon);
      if (!ion) return fallo(`«${datos.ion ?? datos.formulaIon}» no está en la tabla de iones.`);
      return listo(ion.carga, grafiasDeCarga(ion.carga), [
        'Baja hasta la tabla de iones poliatómicos frecuentes, después del formulador.',
        `Busca «${ion.nombre}» en la primera columna.`,
        `La carga está en la tercera columna, con su signo. En su fórmula (${ion.formula}) es el número pequeño de arriba a la derecha.`,
      ]);
    }

    case 'ion-estado-central': {
      const ion = porIon(datos.ion ?? datos.formulaIon);
      if (!ion) return fallo(`«${datos.ion ?? datos.formulaIon}» no está en la tabla de iones.`);
      if (!datos.simbolo) return fallo('Falta el símbolo del átomo central.');
      const valor = estadoCentral(ion, datos.simbolo);
      if (valor === undefined) {
        return fallo(`La columna «Átomo central» de ${ion.nombre} no da un valor único para ${datos.simbolo}.`);
      }
      return listo(conSigno(valor), grafiasDeEstado(valor), [
        'Baja hasta la tabla de iones poliatómicos frecuentes, después del formulador.',
        `Busca «${ion.nombre}» en la primera columna.`,
        `La columna «Átomo central» da el número de oxidación del átomo que manda en el ion: «${ion.central}». No lo confundas con la carga del ion entero, que es ${ion.carga}.`,
      ]);
    }

    default:
      return fallo('Campo desconocido: esta pregunta no sabe qué dato buscar.');
  }
}

// ───────────────────────────────────────────────────────────────────────
// LOS 12 CASOS
// ───────────────────────────────────────────────────────────────────────

type CasoDeclarado = Omit<Caso, 'respuesta' | 'sinonimos' | 'pasos'>;

/** Completa un caso declarado leyendo su respuesta de la tabla. Nunca lanza. */
function construir(base: CasoDeclarado): Caso {
  const r = resolverCaso(base.datos);
  return {
    ...base,
    respuesta: r.ok ? r.valor : '',
    sinonimos: r.ok ? r.sinonimos : [],
    pasos: r.ok ? r.pasos : [r.error ?? 'Este dato no se ha podido leer de la tabla.'],
  };
}

const DECLARADOS: CasoDeclarado[] = [
  {
    id: 1,
    titulo: 'El elemento del número atómico 26',
    enunciado:
      'Un ejercicio menciona el elemento cuyo número atómico es Z = 26. Localízalo en la tabla y escribe su símbolo químico (también vale su nombre).',
    categoria: 'localizar',
    datos: { campo: 'simbolo-desde-z', z: 26, sinonimosExtra: ['fierro'] },
    etiquetaRespuesta: 'Símbolo del elemento',
    pista: 'El número pequeño de arriba, dentro del recuadro de color, es el número atómico. Filtrando por «Transición» quedan muy pocas fichas que mirar.',
  },
  {
    id: 2,
    titulo: 'El grupo del azufre',
    enunciado:
      'Busca el azufre (S) y averigua a qué grupo de la tabla periódica pertenece. Escribe el número de grupo.',
    categoria: 'localizar',
    datos: { campo: 'grupo', simbolo: 'S' },
    etiquetaRespuesta: 'Grupo de la tabla periódica',
    pista: 'El grupo aparece en la última línea de la ficha, al abrirla; la familia («Anfígenos o calcógenos») ya lo lleva escrito entre paréntesis.',
  },
  {
    id: 3,
    titulo: 'La valencia del aluminio',
    enunciado:
      '¿Qué valencia tiene el aluminio (Al)? Ojo: se pide la VALENCIA, que es la capacidad de combinación y se escribe SIN signo, no el número de oxidación.',
    categoria: 'localizar',
    datos: { campo: 'valencias', simbolo: 'Al' },
    etiquetaRespuesta: 'Valencia (sin signo)',
    pista: 'La valencia va en la línea gris de la cabecera, detrás del nombre de la familia. Los recuadros de colores son otra cosa: llevan signo.',
  },
  {
    id: 4,
    titulo: 'Con qué actúa más a menudo el cobre',
    enunciado:
      'El cobre (Cu) aparece en la tabla con dos números de oxidación. ¿Con cuál de los dos actúa más a menudo? Escríbelo con su signo.',
    categoria: 'localizar',
    datos: { campo: 'estado-mas-comun', simbolo: 'Cu' },
    etiquetaRespuesta: 'Número de oxidación (con signo)',
    pista: 'No hay que elegir: la tabla marca uno de los dos recuadros como el más frecuente, y la leyenda del buscador explica el código de colores.',
  },
  {
    id: 5,
    titulo: 'El hierro con +3 en nomenclatura tradicional',
    enunciado:
      'En NOMENCLATURA TRADICIONAL (la de las terminaciones -oso y -ico), ¿qué adjetivo recibe el hierro cuando actúa con número de oxidación +3? Escribe solo el adjetivo.',
    categoria: 'localizar',
    datos: { campo: 'nombre-tradicional', simbolo: 'Fe', estado: 3 },
    etiquetaRespuesta: 'Adjetivo tradicional',
    pista: 'Dentro de la ficha del hierro hay un bloque «Nombre tradicional según el estado» que empareja cada número de oxidación con su adjetivo.',
  },
  {
    id: 6,
    titulo: 'El ion de fórmula NO₂⁻',
    enunciado:
      'En la tabla de iones poliatómicos, localiza el ion de fórmula NO₂⁻ y escribe su nombre.',
    categoria: 'localizar',
    datos: { campo: 'ion-nombre', formulaIon: 'NO₂⁻' },
    etiquetaRespuesta: 'Nombre del ion',
    pista: 'Está justo al lado de su pareja NO₃⁻, que tiene un oxígeno más. La terminación los distingue: -ato para el que lleva más oxígenos, -ito para el que lleva menos.',
  },
  {
    id: 7,
    titulo: 'Hierro o cobre: quién llega más alto',
    enunciado:
      'Compara las filas del hierro (Fe) y del cobre (Cu). ¿Cuál de los dos llega a un número de oxidación más alto según esta tabla? Escribe su símbolo o su nombre.',
    categoria: 'comparar',
    datos: { campo: 'mayor-estado-de-dos', simbolos: ['Fe', 'Cu'], sinonimosExtra: ['fierro'] },
    etiquetaRespuesta: 'Símbolo del elemento',
    pista: 'No hace falta abrir ninguna ficha: los recuadros de la cabecera ya muestran todos los números de oxidación de cada elemento.',
  },
  {
    id: 8,
    titulo: 'El halógeno de un solo número de oxidación',
    enunciado:
      'Los dos primeros halógenos son el flúor (F) y el cloro (Cl). Uno de ellos aparece en esta tabla con un único número de oxidación y el otro con varios. ¿Cuál tiene uno solo? Escribe su símbolo o su nombre.',
    categoria: 'comparar',
    datos: { campo: 'unico-estado-de-dos', simbolos: ['F', 'Cl'] },
    etiquetaRespuesta: 'Símbolo del elemento',
    pista: 'Filtra por «Halógenos» y quedan los cuatro juntos. Cuenta los recuadros de cada fila; la ficha del ganador explica además por qué le pasa eso.',
  },
  {
    id: 9,
    titulo: 'Cuántos estados tiene el manganeso',
    enunciado:
      'Busca el manganeso (Mn) y cuenta cuántos números de oxidación distintos recoge esta tabla para él. Cuéntalos todos: los habituales y los poco frecuentes.',
    categoria: 'comparar',
    datos: { campo: 'numero-de-estados', simbolo: 'Mn' },
    etiquetaRespuesta: 'Cantidad de números de oxidación',
    pista: 'Los recuadros pálidos también cuentan: son los estados poco frecuentes, que existen aunque casi no se pidan en los ejercicios.',
  },
  {
    id: 10,
    titulo: 'La carga del fosfato',
    enunciado:
      'El fosfato es el ion que forma parte de los huesos y del ADN. Búscalo en la tabla de iones poliatómicos y escribe su carga, con signo.',
    categoria: 'aplicado',
    datos: { campo: 'ion-carga', ion: 'Fosfato' },
    etiquetaRespuesta: 'Carga del ion (con signo)',
    pista: 'La carga es del ion entero, no de un átomo suelto: es el número pequeño que va arriba a la derecha de la fórmula.',
  },
  {
    id: 11,
    titulo: 'El azufre dentro del sulfato',
    enunciado:
      'El ion sulfato está en el yeso y en el sulfato de cobre de los laboratorios. Búscalo en la tabla de iones y averigua con qué número de oxidación actúa el AZUFRE dentro de él. Escríbelo con signo.',
    categoria: 'aplicado',
    datos: { campo: 'ion-estado-central', ion: 'Sulfato', simbolo: 'S' },
    etiquetaRespuesta: 'Número de oxidación del azufre (con signo)',
    pista: 'No es lo mismo la carga del ion que el estado del átomo central: la tabla da las dos cosas en columnas distintas, y aquí se pide la segunda.',
  },
  {
    id: 12,
    titulo: 'El oxígeno del agua oxigenada',
    enunciado:
      'En el agua (H₂O) el oxígeno actúa con su número de oxidación de siempre, pero en el agua oxigenada (H₂O₂) no. Abre la ficha del oxígeno y averigua con qué número de oxidación actúa en H₂O₂. Escríbelo con signo.',
    categoria: 'aplicado',
    datos: { campo: 'estado-en-ejemplo', simbolo: 'O', ejemplo: 'H₂O₂' },
    etiquetaRespuesta: 'Número de oxidación del oxígeno (con signo)',
    pista: 'La ficha del oxígeno trae una nota que enumera sus excepciones, y la lista de ejemplos empareja cada número de oxidación con un compuesto real.',
  },
];

export const CASOS: readonly Caso[] = DECLARADOS.map(construir);

export const TOTAL_CASOS: number = CASOS.length;

// ───────────────────────────────────────────────────────────────────────
// COMPROBACIÓN
// ───────────────────────────────────────────────────────────────────────

/** Solo los dígitos de una respuesta, para distinguir «el signo está mal» de «el dato está mal» */
function soloDigitos(texto: string): string {
  return (texto.match(/\d+/g) ?? []).join(' ');
}

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

  const esperada = normalizarRespuesta(caso.respuesta);
  if (escrito === esperada) {
    return { correcto: true, motivo: `Correcto: ${caso.respuesta}.` };
  }

  const aceptadas = new Set(
    caso.sinonimos.map((s) => normalizarRespuesta(s)).filter((s) => s.length > 0),
  );
  if (aceptadas.has(escrito)) {
    return { correcto: true, motivo: `Correcto. La tabla lo escribe así: ${caso.respuesta}.` };
  }

  // El número está bien y el signo no: merece un aviso distinto de «está mal».
  if (soloDigitos(escrito) === soloDigitos(esperada) && soloDigitos(esperada) !== '') {
    return {
      correcto: false,
      motivo: 'El número es el que da la tabla, pero el signo no coincide. Recuerda: la valencia va sin signo y el número de oxidación con signo.',
    };
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

const CAMPOS_PRACTICA: CampoBuscado[] = [
  'estado-mas-comun',
  'grupo',
  'valencias',
  'numero-de-estados',
  'nombre-tradicional',
  'ion-carga',
  'ion-nombre',
];

const ETIQUETAS: Record<CampoBuscado, string> = {
  'simbolo-desde-z': 'Símbolo del elemento',
  grupo: 'Grupo de la tabla periódica',
  valencias: 'Valencia (sin signo)',
  'estado-mas-comun': 'Número de oxidación (con signo)',
  'estado-en-ejemplo': 'Número de oxidación (con signo)',
  'numero-de-estados': 'Cantidad de números de oxidación',
  'nombre-tradicional': 'Adjetivo tradicional',
  'mayor-estado-de-dos': 'Símbolo del elemento',
  'unico-estado-de-dos': 'Símbolo del elemento',
  'ion-nombre': 'Nombre del ion',
  'ion-carga': 'Carga del ion (con signo)',
  'ion-estado-central': 'Número de oxidación (con signo)',
};

/** Elige un elemento de la tabla apto para el campo pedido */
function candidatos(campo: CampoBuscado): Elemento[] {
  switch (campo) {
    case 'estado-mas-comun':
      return ELEMENTOS.filter((el) => el.estados.some((e) => e.masComun));
    case 'grupo':
      // El hidrógeno tiene «Grupo 1 (caso aparte)»: su respuesta no sería un número limpio.
      return ELEMENTOS.filter((el) => /^Grupo \d+$/.test(el.grupo));
    case 'valencias':
      // Solo los de una valencia: con varias, el orden de escritura admitiría discusión.
      return ELEMENTOS.filter((el) => /^\d+$/.test(el.valencias));
    case 'numero-de-estados':
      return ELEMENTOS.filter((el) => el.estados.length > 1);
    case 'nombre-tradicional':
      return ELEMENTOS.filter((el) => el.tradicional && Object.keys(el.tradicional).length > 0);
    default:
      return [...ELEMENTOS];
  }
}

export function generarPreguntaAleatoria(semilla?: number): Pregunta {
  const usada = typeof semilla === 'number' && Number.isFinite(semilla)
    ? Math.abs(Math.trunc(semilla))
    : Math.floor(Math.random() * 99999) + 1;
  const rnd = aleatorioDesde(usada);
  const elegir = <T,>(lista: T[]): T => lista[Math.floor(rnd() * lista.length) % lista.length];

  const campo = elegir(CAMPOS_PRACTICA);

  let datos: DatosCaso;
  let enunciado: string;

  if (campo === 'ion-carga' || campo === 'ion-nombre') {
    const ion = elegir([...IONES]);
    const limpio = ion.nombre.replace(/\s*\([^)]*\)\s*/, '');
    datos = campo === 'ion-carga' ? { campo, ion: ion.nombre } : { campo, formulaIon: ion.formula };
    enunciado =
      campo === 'ion-carga'
        ? `Busca el ion ${limpio.toLowerCase()} en la tabla de iones poliatómicos y escribe su carga, con signo.`
        : `En la tabla de iones poliatómicos, localiza el ion de fórmula ${ion.formula} y escribe su nombre.`;
  } else {
    const lista = candidatos(campo);
    const el = elegir(lista.length > 0 ? lista : [...ELEMENTOS]);
    const nombre = el.nombre.toLowerCase();
    if (campo === 'nombre-tradicional') {
      const estados = Object.keys(el.tradicional ?? {}).map(Number);
      const estado = elegir(estados);
      datos = { campo, simbolo: el.simbolo, estado };
      enunciado = `En nomenclatura tradicional, ¿qué adjetivo recibe el elemento ${nombre} (${el.simbolo}) cuando actúa con número de oxidación ${conSigno(estado)}? Escribe solo el adjetivo.`;
    } else if (campo === 'grupo') {
      datos = { campo, simbolo: el.simbolo };
      enunciado = `¿A qué grupo de la tabla periódica pertenece el elemento ${nombre} (${el.simbolo})? Escribe el número de grupo.`;
    } else if (campo === 'valencias') {
      datos = { campo, simbolo: el.simbolo };
      enunciado = `¿Qué valencia tiene el elemento ${nombre} (${el.simbolo})? La valencia se escribe SIN signo.`;
    } else if (campo === 'numero-de-estados') {
      datos = { campo, simbolo: el.simbolo };
      enunciado = `¿Cuántos números de oxidación distintos recoge esta tabla para el elemento ${nombre} (${el.simbolo})? Cuenta también los poco frecuentes.`;
    } else {
      datos = { campo, simbolo: el.simbolo };
      enunciado = `¿Con qué número de oxidación actúa más a menudo el elemento ${nombre} (${el.simbolo})? Escríbelo con su signo.`;
    }
  }

  const r = resolverCaso(datos);
  if (!r.ok) {
    // Red de seguridad: una pregunta que no se puede leer de la tabla no se enseña.
    const refugio = resolverCaso({ campo: 'estado-mas-comun', simbolo: 'Fe' });
    return {
      semilla: usada,
      campo: 'estado-mas-comun',
      enunciado: '¿Con qué número de oxidación actúa más a menudo el elemento hierro (Fe)? Escríbelo con su signo.',
      etiquetaRespuesta: ETIQUETAS['estado-mas-comun'],
      respuesta: refugio.valor,
      sinonimos: refugio.sinonimos,
      pasos: refugio.pasos,
    };
  }

  return {
    semilla: usada,
    campo,
    enunciado,
    etiquetaRespuesta: ETIQUETAS[campo],
    respuesta: r.valor,
    sinonimos: r.sinonimos,
    pasos: r.pasos,
  };
}

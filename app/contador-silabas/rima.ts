/**
 * Motor de rima y detección de estrofas
 *
 * Recibe los versos ya escandidos por el analizador métrico (sílabas, acentuación
 * y arte mayor/menor) y deduce:
 *   1. la terminación rimante de cada verso, según la tradición española;
 *   2. el esquema (ABBA, abab, -a-a…), con mayúscula para arte mayor;
 *   3. la estrofa concreta: soneto, romance, redondilla, lira, décima…
 *
 * Convenciones aplicadas (métrica española clásica):
 *   · La rima empieza en la VOCAL TÓNICA de la última palabra, no en la sílaba.
 *   · Consonante: coinciden todos los sonidos desde esa vocal.
 *   · Asonante: coinciden solo las vocales; en los diptongos cuenta la abierta,
 *     y en las esdrújulas solo la tónica y la final («pájaro» rima a-o con «barco»).
 *   · Arte mayor (≥9 sílabas) → letra mayúscula; arte menor → minúscula.
 *   · Verso suelto (no rima con ninguno) → «-».
 */

export type Acentuacion = 'aguda' | 'llana' | 'esdrujula';
export type TipoRima = 'consonante' | 'asonante' | 'libre';

/** Lo que el motor necesita de cada verso; lo aporta el analizador métrico. */
export interface VersoParaRima {
  texto: string;
  palabras: { palabra: string; silabas: string[] }[];
  silabasMetricas: number;
  acentuacion: Acentuacion;
  arte: 'menor' | 'mayor';
}

export interface VersoRimado {
  indice: number;
  /** Letra del esquema: 'A', 'b'… o '-' si va suelto */
  letra: string;
  /** Terminación que se muestra al usuario (desde la vocal tónica) */
  terminacion: string;
  /** Vocales de la asonancia, para explicar el porqué */
  vocales: string;
  silabasMetricas: number;
  arte: 'menor' | 'mayor';
}

export interface EstrofaDetectada {
  nombre: string;
  descripcion: string;
  esquema: string;
  /** 'exacta' cuando cuadran metro y rima; 'aproximada' si solo el patrón general */
  confianza: 'exacta' | 'aproximada';
}

export interface AnalisisRima {
  tipo: TipoRima;
  versos: VersoRimado[];
  esquema: string;
  /** Estrofa de cada bloque separado por línea en blanco */
  estrofas: (EstrofaDetectada | null)[];
  /** Composición global (soneto, romance, cuaderna vía…) si se reconoce */
  composicion: EstrofaDetectada | null;
  versosSueltos: number;
}

// ─── Terminación rimante ─────────────────────────────────────────────────────

const VOCALES = 'aeiouáéíóúü';
const ABIERTAS = 'aeoáéó';

const sinTilde = (t: string): string =>
  t
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u');

/** Índice de la sílaba tónica contando desde el final (0 = última). */
function distanciaTonica(acentuacion: Acentuacion): number {
  if (acentuacion === 'aguda') return 0;
  if (acentuacion === 'llana') return 1;
  return 2;
}

/**
 * Reduce la ortografía a sonidos, que es lo que rima de verdad:
 * «vaca» rima con «baca», «cielo» con «sielo», «llave» con «yave».
 * Se mantiene la distinción c/z frente a s, que la métrica española conserva.
 */
function aFonemas(t: string): string {
  let s = sinTilde(t);
  s = s.replace(/h/g, ''); // muda
  s = s.replace(/ll/g, 'y'); // yeísmo
  s = s.replace(/v/g, 'b');
  s = s.replace(/ce/g, 'ze').replace(/ci/g, 'zi');
  s = s.replace(/qu(?=[ei])/g, 'k');
  s = s.replace(/c(?=[aou])/g, 'k');
  s = s.replace(/c$/g, 'k');
  s = s.replace(/gu(?=[ei])/g, 'g');
  s = s.replace(/ge/g, 'je').replace(/gi/g, 'ji');
  s = s.replace(/x/g, 'ks');
  s = s.replace(/w/g, 'u');
  return s;
}

/**
 * Vocales que cuentan para la asonancia: la abierta de cada diptongo y, en las
 * esdrújulas, solo la primera y la última.
 */
function vocalesAsonantes(silabasDesdeTonica: string[]): string {
  const nucleos = silabasDesdeTonica.map((silaba) => {
    const vs = Array.from(sinTilde(silaba)).filter((c) => VOCALES.includes(c));
    if (vs.length === 0) return '';
    if (vs.length === 1) return vs[0];
    // Diptongo o triptongo: manda la vocal abierta; si todas son cerradas, la última
    const abierta = vs.find((v) => ABIERTAS.includes(v));
    return abierta ?? vs[vs.length - 1];
  });

  const limpias = nucleos.filter(Boolean);
  // Esdrújulas: la vocal intermedia no cuenta
  if (limpias.length >= 3) return limpias[0] + limpias[limpias.length - 1];
  return limpias.join('');
}

interface Terminacion {
  consonante: string;
  asonante: string;
  visible: string;
}

/**
 * Posición de la vocal tónica DENTRO de la sílaba acentuada.
 *
 * No vale coger la primera vocal que aparezca: en un diptongo manda la abierta
 * («cie-lo» acentúa la e, y por eso rima con «pe-lo»), y si las dos son cerradas
 * manda la segunda («rui-do» acentúa la i, y rima con «i-do»).
 */
function indiceVocalTonica(silaba: string): number {
  const chars = Array.from(silaba.toLowerCase());

  const conTilde = chars.findIndex((c) => 'áéíóú'.includes(c));
  if (conTilde >= 0) return conTilde;

  const abierta = chars.findIndex((c) => 'aeo'.includes(c));
  if (abierta >= 0) return abierta;

  // Solo vocales cerradas: el acento recae en la última (ui, iu)
  let ultimaCerrada = -1;
  chars.forEach((c, i) => {
    if ('iuü'.includes(c)) ultimaCerrada = i;
  });
  return ultimaCerrada;
}

function terminacionDe(verso: VersoParaRima): Terminacion | null {
  const ultima = verso.palabras[verso.palabras.length - 1];
  if (!ultima || ultima.silabas.length === 0) return null;

  const silabas = ultima.silabas;
  const idxTonica = Math.max(0, silabas.length - 1 - distanciaTonica(verso.acentuacion));
  const desdeTonica = silabas.slice(idxTonica);

  // El trozo empieza en la vocal tónica, no al principio de la sílaba
  const primera = desdeTonica[0];
  const posVocal = indiceVocalTonica(primera);
  const cabeza = posVocal >= 0 ? primera.slice(posVocal) : primera;
  const visible = (cabeza + desdeTonica.slice(1).join('')).toLowerCase();

  return {
    consonante: aFonemas(visible),
    asonante: vocalesAsonantes([cabeza, ...desdeTonica.slice(1)]),
    visible,
  };
}

// ─── Esquema ─────────────────────────────────────────────────────────────────

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Agrupa versos por terminación y reparte letras. Devuelve también cuántos
 * quedan sueltos, que es lo que permite decidir si el poema rima en consonante
 * o en asonante.
 */
function asignarLetras(
  versos: VersoParaRima[],
  terminaciones: (Terminacion | null)[],
  clave: 'consonante' | 'asonante'
): { letras: string[]; sueltos: number } {
  const grupos = new Map<string, number[]>();

  terminaciones.forEach((t, i) => {
    if (!t) return;
    const k = t[clave];
    if (!k) return;
    const lista = grupos.get(k) ?? [];
    lista.push(i);
    grupos.set(k, lista);
  });

  const letras = versos.map(() => '-');
  let siguiente = 0;

  // El orden de aparición manda: la primera rima que aparece es la A
  const vistas = new Set<string>();
  terminaciones.forEach((t) => {
    if (!t) return;
    const k = t[clave];
    if (!k || vistas.has(k)) return;
    vistas.add(k);
    const indices = grupos.get(k)!;
    if (indices.length < 2) return; // rima con nadie: suelto
    const letra = LETRAS[siguiente % LETRAS.length] ?? '?';
    siguiente += 1;
    for (const i of indices) {
      letras[i] = versos[i].arte === 'mayor' ? letra : letra.toLowerCase();
    }
  });

  return { letras, sueltos: letras.filter((l) => l === '-').length };
}

// ─── Estrofas ────────────────────────────────────────────────────────────────

/** Normaliza el esquema a mayúsculas para comparar patrones sin depender del arte. */
const patron = (letras: string[]): string => letras.join('').toUpperCase();

/** ¿Todos los versos miden lo mismo? */
function metroUniforme(versos: VersoParaRima[], medida: number): boolean {
  return versos.length > 0 && versos.every((v) => v.silabasMetricas === medida);
}

/**
 * Metro predominante con tolerancia.
 *
 * La escansión automática nunca clava el 100% de los versos: la sinalefa triple
 * («hombre a una») y la diéresis del poeta («ruïdo») desvían un verso suelto en
 * ±1 sílaba. Exigir uniformidad estricta significaría no reconocer ni el soneto
 * de Quevedo ni la lira de Fray Luis, así que se acepta que la mayoría clave la
 * medida y el resto quede a una sílaba.
 */
function metroPredominante(
  versos: VersoParaRima[],
  medida: number,
  minExactos = 0.7
): boolean {
  if (versos.length === 0) return false;
  const exactos = versos.filter((v) => v.silabasMetricas === medida).length;
  const cerca = versos.filter((v) => Math.abs(v.silabasMetricas - medida) <= 1).length;
  return exactos / versos.length >= minExactos && cerca === versos.length;
}

/** ¿Encaja la serie de medidas, admitiendo ±1 en cada verso? */
function medidasCasiIguales(versos: VersoParaRima[], patronMedidas: number[]): boolean {
  if (versos.length !== patronMedidas.length) return false;
  let exactos = 0;
  for (let i = 0; i < versos.length; i++) {
    const d = Math.abs(versos[i].silabasMetricas - patronMedidas[i]);
    if (d > 1) return false;
    if (d === 0) exactos += 1;
  }
  return exactos >= Math.ceil(patronMedidas.length * 0.6);
}

/**
 * El patrón del romance: todos los versos pares comparten una misma rima y
 * ninguno de los impares la comparte.
 *
 * No se exige que los impares queden sueltos: en asonancia es normal que dos
 * impares coincidan por azar («mayo» y «enamorados» riman a-o sin pretenderlo),
 * y eso no deja de ser un romance.
 */
function asonanteEnPares(letras: string[]): boolean {
  if (letras.length < 4) return false;
  const pares = letras.filter((_, i) => i % 2 === 1);
  const impares = letras.filter((_, i) => i % 2 === 0);
  const rimaPar = pares[0];
  if (!rimaPar || rimaPar === '-') return false;

  const todosLosParesRiman = pares.every((l) => l.toUpperCase() === rimaPar.toUpperCase());
  const imparesAlMargen = impares.every(
    (l) => l === '-' || l.toUpperCase() !== rimaPar.toUpperCase()
  );
  return todosLosParesRiman && imparesAlMargen;
}

function detectarEstrofa(
  versos: VersoParaRima[],
  letras: string[],
  tipo: TipoRima
): EstrofaDetectada | null {
  const n = versos.length;
  if (n === 0) return null;
  const p = patron(letras);
  const esquema = letras.join('');
  const uniforme = (m: number) => metroPredominante(versos, m);

  const hecho = (
    nombre: string,
    descripcion: string,
    confianza: 'exacta' | 'aproximada' = 'exacta'
  ): EstrofaDetectada => ({ nombre, descripcion, esquema, confianza });

  if (n === 2 && p === 'AA') {
    return hecho('Pareado', 'Dos versos que riman entre sí.');
  }

  if (n === 3) {
    if (uniforme(11) && (p === 'ABA' || p === 'AAA')) {
      return hecho('Terceto', 'Tres endecasílabos; encadenados forman tercetos dantescos.');
    }
    if (p === 'ABA' || p === 'AA-' || p === '-A-A'.slice(0, 3)) {
      return hecho('Tercerilla', 'Tres versos de arte menor.', 'aproximada');
    }
  }

  if (n === 4) {
    if (uniforme(11) && p === 'ABBA') return hecho('Cuarteto', 'Cuatro endecasílabos ABBA.');
    if (uniforme(11) && p === 'ABAB') return hecho('Serventesio', 'Cuatro endecasílabos ABAB.');
    if (uniforme(14) && p === 'AAAA') {
      return hecho('Cuaderna vía', 'Tetrástrofo monorrimo alejandrino, propio del mester de clerecía.');
    }
    if (uniforme(8) && p === 'ABBA') return hecho('Redondilla', 'Cuatro octosílabos abba.');
    if (uniforme(8) && p === 'ABAB') return hecho('Cuarteta', 'Cuatro octosílabos abab.');
    if (uniforme(8) && asonanteEnPares(letras) && tipo === 'asonante') {
      return hecho('Copla', 'Cuatro octosílabos con rima asonante en los pares.');
    }
    if (medidasCasiIguales(versos, [7, 5, 7, 5])) {
      return hecho('Seguidilla', 'Alternancia de heptasílabos y pentasílabos.', 'aproximada');
    }
    if (p === 'ABBA' || p === 'ABAB') {
      return hecho('Cuarteta de arte menor', 'Cuatro versos con rima cruzada o abrazada.', 'aproximada');
    }
  }

  if (n === 5) {
    if (medidasCasiIguales(versos, [7, 11, 7, 7, 11]) && p === 'ABABB') {
      return hecho('Lira', 'Estrofa garcilasiana: 7a 11B 7a 7b 11B.');
    }
    if (uniforme(8) && !p.includes('-')) {
      return hecho('Quintilla', 'Cinco octosílabos con dos rimas, sin tres seguidas iguales.', 'aproximada');
    }
    if (!p.includes('-')) return hecho('Quinteto', 'Cinco versos de arte mayor.', 'aproximada');
  }

  if (n === 8) {
    if (uniforme(11) && p === 'ABABABCC') {
      return hecho('Octava real', 'Ocho endecasílabos ABABABCC.');
    }
    if (uniforme(8)) return hecho('Octavilla', 'Ocho versos de arte menor.', 'aproximada');
  }

  if (n === 10 && uniforme(8) && p === 'ABBAACCDDC') {
    return hecho('Décima espinela', 'Diez octosílabos abbaaccddc, fijada por Vicente Espinel.');
  }

  // Series largas monorrimas o con asonante en pares
  if (n >= 6 && asonanteEnPares(letras) && uniforme(8)) {
    return hecho('Romance', 'Serie de octosílabos con rima asonante en los pares.');
  }

  return null;
}

/** Composiciones que se reconocen mirando el poema entero, no una estrofa. */
function detectarComposicion(
  versos: VersoParaRima[],
  letras: string[],
  tipo: TipoRima,
  bloques: number[][]
): EstrofaDetectada | null {
  const n = versos.length;
  const esquema = letras.join('');

  if (n === 14 && metroPredominante(versos, 11)) {
    const tam = bloques.map((b) => b.length).join('-');
    const cuartetos = patron(letras.slice(0, 8));
    const encaja = cuartetos === 'ABBAABBA' || cuartetos === 'ABABABAB' || cuartetos === 'ABBAACCA';
    return {
      nombre: 'Soneto',
      descripcion:
        tam === '4-4-3-3'
          ? 'Catorce endecasílabos en dos cuartetos y dos tercetos.'
          : 'Catorce endecasílabos: la forma del soneto.',
      esquema,
      confianza: encaja ? 'exacta' : 'aproximada',
    };
  }

  if (n >= 6 && metroPredominante(versos, 8) && asonanteEnPares(letras)) {
    return {
      nombre: 'Romance',
      descripcion: 'Serie indefinida de octosílabos con rima asonante en los versos pares.',
      esquema: '-a-a-a…',
      confianza: 'exacta',
    };
  }

  if (n >= 6 && metroPredominante(versos, 14) && tipo !== 'libre') {
    return {
      nombre: 'Cuaderna vía',
      descripcion: 'Alejandrinos monorrimos agrupados de cuatro en cuatro.',
      esquema,
      confianza: 'aproximada',
    };
  }

  // Silva: alternancia libre de endecasílabos y heptasílabos
  if (n >= 6) {
    const solo7y11 = versos.every((v) => v.silabasMetricas === 7 || v.silabasMetricas === 11);
    const hayDeLosDos =
      versos.some((v) => v.silabasMetricas === 7) && versos.some((v) => v.silabasMetricas === 11);
    if (solo7y11 && hayDeLosDos && tipo !== 'libre') {
      return {
        nombre: 'Silva',
        descripcion: 'Endecasílabos y heptasílabos combinados libremente.',
        esquema,
        confianza: 'aproximada',
      };
    }
  }

  return null;
}

// ─── Entrada principal ───────────────────────────────────────────────────────

/**
 * @param versos    versos ya escandidos, en orden
 * @param bloques   índices de verso agrupados por estrofa (líneas en blanco)
 */
export function analizarRimas(
  versos: VersoParaRima[],
  bloques: number[][]
): AnalisisRima {
  const terminaciones = versos.map(terminacionDe);

  const porConsonante = asignarLetras(versos, terminaciones, 'consonante');
  const porAsonante = asignarLetras(versos, terminaciones, 'asonante');

  // Se prefiere la consonante, que es la exigente: si casi cuadra, es la que el
  // poeta buscaba, y una rima suelta suele ser una licencia («Egipto» con
  // «infinito» en Quevedo), no una prueba de que el poema sea asonante. Solo se
  // cambia a asonante cuando la consonante deja de explicar el poema: más de un
  // cuarto de versos sueltos y una mejora clara.
  const limiteLicencias = Math.max(1, Math.floor(versos.length * 0.25));
  const asonanteExplicaMejor =
    porAsonante.sueltos < porConsonante.sueltos && porConsonante.sueltos > limiteLicencias;

  let tipo: TipoRima = asonanteExplicaMejor ? 'asonante' : 'consonante';
  let elegida = asonanteExplicaMejor ? porAsonante : porConsonante;

  // Si ninguna de las dos empareja nada, el poema es de verso libre
  if (porConsonante.sueltos === versos.length && porAsonante.sueltos === versos.length) {
    tipo = 'libre';
    elegida = porConsonante;
  }

  const versosRimados: VersoRimado[] = versos.map((v, i) => ({
    indice: i,
    letra: elegida.letras[i],
    terminacion: terminaciones[i]?.visible ?? '',
    vocales: terminaciones[i]?.asonante ?? '',
    silabasMetricas: v.silabasMetricas,
    arte: v.arte,
  }));

  const estrofas = bloques.map((indices) => {
    const sub = indices.map((i) => versos[i]);
    const subLetras = indices.map((i) => elegida.letras[i]);
    return detectarEstrofa(sub, subLetras, tipo);
  });

  return {
    tipo,
    versos: versosRimados,
    esquema: elegida.letras.join(''),
    estrofas,
    composicion: detectarComposicion(versos, elegida.letras, tipo, bloques),
    versosSueltos: elegida.sueltos,
  };
}

/** Esquema legible, agrupado por estrofas: «ABBA ABBA CDC DCD» */
export function esquemaLegible(letras: string[], bloques: number[][]): string {
  if (bloques.length <= 1) return letras.join('');
  return bloques.map((b) => b.map((i) => letras[i]).join('')).join(' ');
}

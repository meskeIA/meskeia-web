/**
 * La DIRECCIÓN en que un importe ilegible mueve una cifra publicada, CALCULADA y no razonada.
 *
 * `parseSpanishNumber` devuelve NaN por diseño ante «2.000.50», y las apps del clúster de
 * compraventa toman ese importe como 0 y avisan de que falta. El aviso tiene que decir hacia
 * dónde queda la cifra real, y durante meses esa dirección se escribió A MANO, campo por
 * campo: «los gastos de aquella compra reducen el IRPF, así que el neto real es MAYOR». Cada
 * ronda del Inspector encontraba un caso que el razonamiento no había previsto (acta de la
 * familia de compraventa, _private/inspector/FAMILIA-COMPRAVENTA.md):
 *   · sin IRPF que rebajar (pérdida, exención, reinversión total) el importe no mueve nada y
 *     el aviso seguía prometiendo un neto MAYOR (hallazgos 1227, 1249, 1258, 1281);
 *   · con dos ilegibles de sentido contrario se afirmaban las dos direcciones a la vez, o una
 *     que era falsa (1229, 1250, 1257, 1282);
 *   · el aviso llegaba al neto y no a la tarjeta del IRPF o de la pérdida, que también se
 *     mueven y a veces en sentido CONTRARIO al neto (1228, 1251, 1259, 1260, 1280).
 *
 * Aquí la dirección sale de ejecutar el cálculo: la app lo repite con cada importe ilegible
 * sustituido por un valor PEQUEÑO y por uno GRANDE, y esta función compara cada cifra con la
 * publicada. Todos los cálculos del clúster son monótonos en cada importe, así que los dos
 * sondeos acotan lo que puede pasar con el valor que el usuario quiso escribir:
 *   · ninguno mueve la cifra → el importe no la afecta y no hace falta aviso;
 *   · el pequeño ya la mueve → la mueve con CUALQUIER valor positivo: «es mayor/menor»;
 *   · solo el grande → depende de cuánto valga: «puede ser mayor/menor».
 *
 * Es puro y no sabe nada de fiscalidad ni de redacción: cada app pone sus palabras.
 */

/** Cómo queda la cifra REAL respecto de la publicada. */
export type SentidoReal = 'mayor' | 'menor';

export interface MedicionIlegible {
  /** Cómo se nombra el importe en el aviso («la comisión inmobiliaria»). */
  nombre: string;
  /** La cifra con el importe sondeado a un valor pequeño. */
  pequeno: number;
  /** La cifra con el importe sondeado a un valor grande. */
  grande: number;
}

export type Veredicto =
  | { tipo: 'ninguno' }
  | {
      tipo: SentidoReal;
      /** true si basta cualquier valor positivo para moverla («es»); false, «puede ser». */
      seguro: boolean;
      campos: string[];
    }
  | { tipo: 'mixto'; mayor: string[]; menor: string[] };

/** Menos de medio céntimo no es un movimiento: es redondeo de coma flotante. */
const TOLERANCIA = 0.005;

function signo(delta: number): -1 | 0 | 1 {
  if (Math.abs(delta) < TOLERANCIA) return 0;
  return delta > 0 ? 1 : -1;
}

/**
 * Veredicto sobre UNA cifra publicada (`base`, calculada con los ilegibles a 0) a partir de lo
 * que vale con cada ilegible sondeado. Sin mediciones, o si ninguna la mueve: `ninguno`.
 */
export function veredictoIlegibles(base: number, mediciones: readonly MedicionIlegible[]): Veredicto {
  const mayor: string[] = [];
  const menor: string[] = [];
  let seguroMayor = false;
  let seguroMenor = false;

  for (const m of mediciones) {
    const sPequeno = signo(m.pequeno - base);
    const sGrande = signo(m.grande - base);
    if (sPequeno === 0 && sGrande === 0) continue;
    // Si los dos sondeos discrepan, el importe mueve la cifra hacia los dos lados según lo
    // que valga: cuenta en las dos listas y el veredicto sale mixto.
    const sentidos = new Set([sPequeno, sGrande].filter((s) => s !== 0));
    if (sentidos.has(1)) {
      mayor.push(m.nombre);
      if (sPequeno === 1) seguroMayor = true;
    }
    if (sentidos.has(-1)) {
      menor.push(m.nombre);
      if (sPequeno === -1) seguroMenor = true;
    }
  }

  if (mayor.length > 0 && menor.length > 0) return { tipo: 'mixto', mayor, menor };
  if (mayor.length > 0) return { tipo: 'mayor', seguro: seguroMayor, campos: mayor };
  if (menor.length > 0) return { tipo: 'menor', seguro: seguroMenor, campos: menor };
  return { tipo: 'ninguno' };
}

/** «a», «a y b», «a, b y c». */
export function enumerar(partes: readonly string[]): string {
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/** true si la frase nominal es plural: «los años de propiedad», «las mejoras». */
function esPlural(partes: readonly string[]): boolean {
  return partes.length > 1 || /^(los|las)\s/i.test(partes[0] ?? '');
}

/**
 * «falta el valor catastral del suelo» · «faltan los años de propiedad» · «faltan el precio y
 * los años». Con `falta ${lista}` a secas salía «falta los años de propiedad» (hallazgo 1255).
 */
export function faltaOFaltan(partes: readonly string[]): string {
  return `${esPlural(partes) ? 'faltan' : 'falta'} ${enumerar(partes)}`;
}

/**
 * «el valor catastral del suelo no se ha podido leer» · «no se han podido leer X e Y».
 * Un importe ESCRITO pero ilegible no «falta»: el usuario lo ve en el campo, y decirle que lo
 * rellene es falso (hallazgos 1231, 1254, 1265, 1285).
 */
export function noSePudoLeer(partes: readonly string[]): string {
  return esPlural(partes)
    ? `no se han podido leer ${enumerar(partes)}`
    : `${enumerar(partes)} no se ha podido leer`;
}

/** ¿Está el texto escrito pero no se puede leer como número? (vacío = no escrito) */
export function escritoIlegible(texto: string, leer: (t: string) => number): boolean {
  return texto.trim() !== '' && !Number.isFinite(leer(texto));
}

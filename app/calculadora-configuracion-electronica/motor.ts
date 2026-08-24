/**
 * Motor de configuración electrónica.
 *
 * Calcula el llenado de orbitales desde cero, sin copiar configuraciones de
 * ninguna tabla: parte del orden de Madelung (n+l creciente, y a igualdad de
 * n+l, n menor primero), aplica las veinte excepciones experimentales conocidas
 * como un traslado de electrones entre dos subniveles, y de ahí deduce todo lo
 * demás — capa de valencia, electrones desapareados por la regla de Hund,
 * comportamiento magnético, bloque, periodo, grupo y los cuatro números
 * cuánticos del último electrón.
 *
 * Que la configuración se CALCULE y no se consulte es lo que permite tratar los
 * iones: al quitar electrones se retiran primero los del número cuántico n más
 * alto, no los del último subnivel escrito, que es el error clásico con los
 * metales de transición (Fe³⁺ pierde antes el 4s que el 3d).
 *
 * Los nombres y símbolos de los 118 elementos se declaran aquí para que el
 * motor no dependa de ninguna app; la comprobación de que las configuraciones
 * calculadas coinciden con las publicadas en app/tabla-periodica/ vive en
 * tests/configuracion-electronica-motor.spec.ts.
 *
 * No sabe nada de presentación: devuelve datos y deja el formato a la vista.
 */

export interface ElementoCE {
  z: number;
  simbolo: string;
  nombre: string;
}

export const ELEMENTOS: ElementoCE[] = [
  { z: 1, simbolo: 'H', nombre: 'Hidrógeno' },
  { z: 2, simbolo: 'He', nombre: 'Helio' },
  { z: 3, simbolo: 'Li', nombre: 'Litio' },
  { z: 4, simbolo: 'Be', nombre: 'Berilio' },
  { z: 5, simbolo: 'B', nombre: 'Boro' },
  { z: 6, simbolo: 'C', nombre: 'Carbono' },
  { z: 7, simbolo: 'N', nombre: 'Nitrógeno' },
  { z: 8, simbolo: 'O', nombre: 'Oxígeno' },
  { z: 9, simbolo: 'F', nombre: 'Flúor' },
  { z: 10, simbolo: 'Ne', nombre: 'Neón' },
  { z: 11, simbolo: 'Na', nombre: 'Sodio' },
  { z: 12, simbolo: 'Mg', nombre: 'Magnesio' },
  { z: 13, simbolo: 'Al', nombre: 'Aluminio' },
  { z: 14, simbolo: 'Si', nombre: 'Silicio' },
  { z: 15, simbolo: 'P', nombre: 'Fósforo' },
  { z: 16, simbolo: 'S', nombre: 'Azufre' },
  { z: 17, simbolo: 'Cl', nombre: 'Cloro' },
  { z: 18, simbolo: 'Ar', nombre: 'Argón' },
  { z: 19, simbolo: 'K', nombre: 'Potasio' },
  { z: 20, simbolo: 'Ca', nombre: 'Calcio' },
  { z: 21, simbolo: 'Sc', nombre: 'Escandio' },
  { z: 22, simbolo: 'Ti', nombre: 'Titanio' },
  { z: 23, simbolo: 'V', nombre: 'Vanadio' },
  { z: 24, simbolo: 'Cr', nombre: 'Cromo' },
  { z: 25, simbolo: 'Mn', nombre: 'Manganeso' },
  { z: 26, simbolo: 'Fe', nombre: 'Hierro' },
  { z: 27, simbolo: 'Co', nombre: 'Cobalto' },
  { z: 28, simbolo: 'Ni', nombre: 'Níquel' },
  { z: 29, simbolo: 'Cu', nombre: 'Cobre' },
  { z: 30, simbolo: 'Zn', nombre: 'Zinc' },
  { z: 31, simbolo: 'Ga', nombre: 'Galio' },
  { z: 32, simbolo: 'Ge', nombre: 'Germanio' },
  { z: 33, simbolo: 'As', nombre: 'Arsénico' },
  { z: 34, simbolo: 'Se', nombre: 'Selenio' },
  { z: 35, simbolo: 'Br', nombre: 'Bromo' },
  { z: 36, simbolo: 'Kr', nombre: 'Kriptón' },
  { z: 37, simbolo: 'Rb', nombre: 'Rubidio' },
  { z: 38, simbolo: 'Sr', nombre: 'Estroncio' },
  { z: 39, simbolo: 'Y', nombre: 'Itrio' },
  { z: 40, simbolo: 'Zr', nombre: 'Circonio' },
  { z: 41, simbolo: 'Nb', nombre: 'Niobio' },
  { z: 42, simbolo: 'Mo', nombre: 'Molibdeno' },
  { z: 43, simbolo: 'Tc', nombre: 'Tecnecio' },
  { z: 44, simbolo: 'Ru', nombre: 'Rutenio' },
  { z: 45, simbolo: 'Rh', nombre: 'Rodio' },
  { z: 46, simbolo: 'Pd', nombre: 'Paladio' },
  { z: 47, simbolo: 'Ag', nombre: 'Plata' },
  { z: 48, simbolo: 'Cd', nombre: 'Cadmio' },
  { z: 49, simbolo: 'In', nombre: 'Indio' },
  { z: 50, simbolo: 'Sn', nombre: 'Estaño' },
  { z: 51, simbolo: 'Sb', nombre: 'Antimonio' },
  { z: 52, simbolo: 'Te', nombre: 'Telurio' },
  { z: 53, simbolo: 'I', nombre: 'Yodo' },
  { z: 54, simbolo: 'Xe', nombre: 'Xenón' },
  { z: 55, simbolo: 'Cs', nombre: 'Cesio' },
  { z: 56, simbolo: 'Ba', nombre: 'Bario' },
  { z: 57, simbolo: 'La', nombre: 'Lantano' },
  { z: 58, simbolo: 'Ce', nombre: 'Cerio' },
  { z: 59, simbolo: 'Pr', nombre: 'Praseodimio' },
  { z: 60, simbolo: 'Nd', nombre: 'Neodimio' },
  { z: 61, simbolo: 'Pm', nombre: 'Prometio' },
  { z: 62, simbolo: 'Sm', nombre: 'Samario' },
  { z: 63, simbolo: 'Eu', nombre: 'Europio' },
  { z: 64, simbolo: 'Gd', nombre: 'Gadolinio' },
  { z: 65, simbolo: 'Tb', nombre: 'Terbio' },
  { z: 66, simbolo: 'Dy', nombre: 'Disprosio' },
  { z: 67, simbolo: 'Ho', nombre: 'Holmio' },
  { z: 68, simbolo: 'Er', nombre: 'Erbio' },
  { z: 69, simbolo: 'Tm', nombre: 'Tulio' },
  { z: 70, simbolo: 'Yb', nombre: 'Iterbio' },
  { z: 71, simbolo: 'Lu', nombre: 'Lutecio' },
  { z: 72, simbolo: 'Hf', nombre: 'Hafnio' },
  { z: 73, simbolo: 'Ta', nombre: 'Tantalio' },
  { z: 74, simbolo: 'W', nombre: 'Tungsteno' },
  { z: 75, simbolo: 'Re', nombre: 'Renio' },
  { z: 76, simbolo: 'Os', nombre: 'Osmio' },
  { z: 77, simbolo: 'Ir', nombre: 'Iridio' },
  { z: 78, simbolo: 'Pt', nombre: 'Platino' },
  { z: 79, simbolo: 'Au', nombre: 'Oro' },
  { z: 80, simbolo: 'Hg', nombre: 'Mercurio' },
  { z: 81, simbolo: 'Tl', nombre: 'Talio' },
  { z: 82, simbolo: 'Pb', nombre: 'Plomo' },
  { z: 83, simbolo: 'Bi', nombre: 'Bismuto' },
  { z: 84, simbolo: 'Po', nombre: 'Polonio' },
  { z: 85, simbolo: 'At', nombre: 'Astato' },
  { z: 86, simbolo: 'Rn', nombre: 'Radón' },
  { z: 87, simbolo: 'Fr', nombre: 'Francio' },
  { z: 88, simbolo: 'Ra', nombre: 'Radio' },
  { z: 89, simbolo: 'Ac', nombre: 'Actinio' },
  { z: 90, simbolo: 'Th', nombre: 'Torio' },
  { z: 91, simbolo: 'Pa', nombre: 'Protactinio' },
  { z: 92, simbolo: 'U', nombre: 'Uranio' },
  { z: 93, simbolo: 'Np', nombre: 'Neptunio' },
  { z: 94, simbolo: 'Pu', nombre: 'Plutonio' },
  { z: 95, simbolo: 'Am', nombre: 'Americio' },
  { z: 96, simbolo: 'Cm', nombre: 'Curio' },
  { z: 97, simbolo: 'Bk', nombre: 'Berkelio' },
  { z: 98, simbolo: 'Cf', nombre: 'Californio' },
  { z: 99, simbolo: 'Es', nombre: 'Einstenio' },
  { z: 100, simbolo: 'Fm', nombre: 'Fermio' },
  { z: 101, simbolo: 'Md', nombre: 'Mendelevio' },
  { z: 102, simbolo: 'No', nombre: 'Nobelio' },
  { z: 103, simbolo: 'Lr', nombre: 'Lawrencio' },
  { z: 104, simbolo: 'Rf', nombre: 'Rutherfordio' },
  { z: 105, simbolo: 'Db', nombre: 'Dubnio' },
  { z: 106, simbolo: 'Sg', nombre: 'Seaborgio' },
  { z: 107, simbolo: 'Bh', nombre: 'Bohrio' },
  { z: 108, simbolo: 'Hs', nombre: 'Hasio' },
  { z: 109, simbolo: 'Mt', nombre: 'Meitnerio' },
  { z: 110, simbolo: 'Ds', nombre: 'Darmstadtio' },
  { z: 111, simbolo: 'Rg', nombre: 'Roentgenio' },
  { z: 112, simbolo: 'Cn', nombre: 'Copernicio' },
  { z: 113, simbolo: 'Nh', nombre: 'Nihonio' },
  { z: 114, simbolo: 'Fl', nombre: 'Flerovio' },
  { z: 115, simbolo: 'Mc', nombre: 'Moscovio' },
  { z: 116, simbolo: 'Lv', nombre: 'Livermorio' },
  { z: 117, simbolo: 'Ts', nombre: 'Teneso' },
  { z: 118, simbolo: 'Og', nombre: 'Oganesón' },
];

export function elementoPorZ(z: number): ElementoCE | undefined {
  return ELEMENTOS.find((e) => e.z === z);
}

// ============================================================
// Orbitales y orden de llenado
// ============================================================

/** Letra de cada valor del número cuántico secundario l */
export const LETRA_L = ['s', 'p', 'd', 'f'] as const;

export interface Orbital {
  n: number;
  l: number;
}

/** Electrones que caben en un subnivel: 2·(2l+1) */
export function capacidad(l: number): number {
  return 2 * (2 * l + 1);
}

/** Número de orbitales de un subnivel: 2l+1 (las cajas del diagrama) */
export function numOrbitales(l: number): number {
  return 2 * l + 1;
}

/**
 * Orden de Madelung (regla n+l): primero el subnivel con n+l menor, y entre los
 * que empatan, el de n menor. Es lo que dibuja el diagrama de Möller con sus
 * diagonales. Llega hasta 7p, suficiente para los 118 elementos conocidos.
 */
export const ORDEN_LLENADO: Orbital[] = (() => {
  const lista: Orbital[] = [];
  for (let n = 1; n <= 8; n++) {
    for (let l = 0; l < Math.min(n, 4); l++) lista.push({ n, l });
  }
  return lista
    .sort((a, b) => a.n + a.l - (b.n + b.l) || a.n - b.n)
    .filter((o) => o.n + o.l <= 8);
})();

export interface Subnivel extends Orbital {
  electrones: number;
}

// ============================================================
// Las excepciones a la regla de Madelung
// ============================================================

export interface Excepcion {
  /** Subnivel del que salen los electrones respecto a lo que predice Madelung */
  desde: Orbital;
  /** Subnivel al que van */
  hacia: Orbital;
  cuantos: number;
  motivo: string;
}

const SEMILLENO = 'Un subnivel d semilleno (d⁵) es más estable que la alternativa, y el átomo paga el ascenso de un electrón del s para conseguirlo.';
const LLENO = 'Un subnivel d completo (d¹⁰) es más estable que la alternativa, y el átomo asciende un electrón del s para completarlo.';
const INICIO_F = 'Al principio de la serie f los subniveles d y f están casi a la misma energía, y ahí el d queda por debajo: el primer electrón entra en d antes que en f.';

/**
 * Las veinte excepciones medidas experimentalmente, expresadas como un traslado
 * de electrones respecto a lo que predice Madelung. A partir del elemento 104
 * las configuraciones publicadas son predicciones teóricas, no medidas.
 */
export const EXCEPCIONES: Record<number, Excepcion> = {
  24: { desde: { n: 4, l: 0 }, hacia: { n: 3, l: 2 }, cuantos: 1, motivo: SEMILLENO },
  29: { desde: { n: 4, l: 0 }, hacia: { n: 3, l: 2 }, cuantos: 1, motivo: LLENO },
  41: { desde: { n: 5, l: 0 }, hacia: { n: 4, l: 2 }, cuantos: 1, motivo: 'Los subniveles 5s y 4d están tan próximos en energía que el reparto real deja un solo electrón en el 5s.' },
  42: { desde: { n: 5, l: 0 }, hacia: { n: 4, l: 2 }, cuantos: 1, motivo: SEMILLENO },
  44: { desde: { n: 5, l: 0 }, hacia: { n: 4, l: 2 }, cuantos: 1, motivo: 'En la segunda serie de transición el 4d queda por debajo del 5s y atrae al electrón que Madelung colocaría arriba.' },
  45: { desde: { n: 5, l: 0 }, hacia: { n: 4, l: 2 }, cuantos: 1, motivo: 'En la segunda serie de transición el 4d queda por debajo del 5s y atrae al electrón que Madelung colocaría arriba.' },
  46: { desde: { n: 5, l: 0 }, hacia: { n: 4, l: 2 }, cuantos: 2, motivo: 'El paladio es el único elemento cuya capa más externa se vacía del todo: los dos electrones del 5s bajan al 4d para completarlo.' },
  47: { desde: { n: 5, l: 0 }, hacia: { n: 4, l: 2 }, cuantos: 1, motivo: LLENO },
  57: { desde: { n: 4, l: 3 }, hacia: { n: 5, l: 2 }, cuantos: 1, motivo: INICIO_F },
  58: { desde: { n: 4, l: 3 }, hacia: { n: 5, l: 2 }, cuantos: 1, motivo: INICIO_F },
  64: { desde: { n: 4, l: 3 }, hacia: { n: 5, l: 2 }, cuantos: 1, motivo: 'El gadolinio conserva el 4f semilleno (4f⁷) y coloca el electrón siguiente en el 5d.' },
  78: { desde: { n: 6, l: 0 }, hacia: { n: 5, l: 2 }, cuantos: 1, motivo: 'En el platino los efectos relativistas acercan el 5d al 6s y el reparto real deja un solo electrón arriba.' },
  79: { desde: { n: 6, l: 0 }, hacia: { n: 5, l: 2 }, cuantos: 1, motivo: LLENO },
  89: { desde: { n: 5, l: 3 }, hacia: { n: 6, l: 2 }, cuantos: 1, motivo: INICIO_F },
  90: { desde: { n: 5, l: 3 }, hacia: { n: 6, l: 2 }, cuantos: 2, motivo: 'En el torio los dos primeros electrones de la serie entran en el 6d en vez de en el 5f.' },
  91: { desde: { n: 5, l: 3 }, hacia: { n: 6, l: 2 }, cuantos: 1, motivo: INICIO_F },
  92: { desde: { n: 5, l: 3 }, hacia: { n: 6, l: 2 }, cuantos: 1, motivo: INICIO_F },
  93: { desde: { n: 5, l: 3 }, hacia: { n: 6, l: 2 }, cuantos: 1, motivo: INICIO_F },
  96: { desde: { n: 5, l: 3 }, hacia: { n: 6, l: 2 }, cuantos: 1, motivo: 'El curio conserva el 5f semilleno (5f⁷) y coloca el electrón siguiente en el 6d.' },
  103: { desde: { n: 6, l: 2 }, hacia: { n: 7, l: 1 }, cuantos: 1, motivo: 'En el laurencio los efectos relativistas hunden el 7p por debajo del 6d, y el último electrón entra ahí.' },
};

/** A partir de aquí las configuraciones publicadas son predicciones, no medidas */
export const PRIMER_Z_PREDICHO = 104;

// ============================================================
// Gases nobles (para la notación abreviada)
// ============================================================

export const GASES_NOBLES = [2, 10, 18, 36, 54, 86, 118];

/**
 * Gas noble que sirve de núcleo en la notación abreviada: el mayor con número
 * atómico menor que el del elemento y que no supere los electrones disponibles
 * (esta segunda condición solo importa en cationes muy despojados).
 */
export function gasNobleAnterior(z: number, electrones: number): ElementoCE | null {
  const candidatos = GASES_NOBLES.filter((g) => g < z && g <= electrones);
  if (candidatos.length === 0) return null;
  return elementoPorZ(candidatos[candidatos.length - 1]) ?? null;
}

// ============================================================
// Llenado
// ============================================================

/** Reparte los electrones en orden de Madelung, sin aplicar excepciones */
export function llenadoMadelung(electrones: number): Subnivel[] {
  const salida: Subnivel[] = [];
  let quedan = electrones;
  for (const orb of ORDEN_LLENADO) {
    if (quedan <= 0) break;
    const cabe = Math.min(capacidad(orb.l), quedan);
    salida.push({ ...orb, electrones: cabe });
    quedan -= cabe;
  }
  return salida;
}

/** Aplica el traslado de electrones de una excepción sobre un llenado de Madelung */
function aplicarExcepcion(base: Subnivel[], exc: Excepcion): Subnivel[] {
  const copia = base.map((s) => ({ ...s }));
  const origen = copia.find((s) => s.n === exc.desde.n && s.l === exc.desde.l);
  if (!origen || origen.electrones < exc.cuantos) return copia;
  origen.electrones -= exc.cuantos;
  const destino = copia.find((s) => s.n === exc.hacia.n && s.l === exc.hacia.l);
  if (destino) {
    destino.electrones += exc.cuantos;
  } else {
    copia.push({ ...exc.hacia, electrones: exc.cuantos });
  }
  return copia.filter((s) => s.electrones > 0);
}

/** Configuración del átomo neutro, ya con la excepción aplicada si la tiene */
export function configuracionNeutro(z: number): Subnivel[] {
  const base = llenadoMadelung(z);
  const exc = EXCEPCIONES[z];
  return exc ? aplicarExcepcion(base, exc) : base;
}

export interface CambioIon {
  n: number;
  l: number;
  cuantos: number;
}

/**
 * Quita o añade electrones a una configuración neutra.
 *
 * Al ionizar NO se vacía el último subnivel escrito, sino el de número cuántico
 * n más alto (y dentro de él, el de l mayor). Es la diferencia entre el orden en
 * que los electrones ENTRAN y el orden en que SALEN, y la razón de que el hierro
 * pierda antes los electrones del 4s que los del 3d.
 */
export function ionizar(neutro: Subnivel[], carga: number): { subniveles: Subnivel[]; cambios: CambioIon[] } {
  const copia = neutro.map((s) => ({ ...s }));
  const cambios: CambioIon[] = [];

  if (carga > 0) {
    let porQuitar = carga;
    while (porQuitar > 0) {
      const ocupados = copia.filter((s) => s.electrones > 0);
      if (ocupados.length === 0) break;
      const externo = ocupados.sort((a, b) => b.n - a.n || b.l - a.l)[0];
      const quita = Math.min(externo.electrones, porQuitar);
      externo.electrones -= quita;
      porQuitar -= quita;
      cambios.push({ n: externo.n, l: externo.l, cuantos: quita });
    }
  } else if (carga < 0) {
    let porAnadir = -carga;
    for (const orb of ORDEN_LLENADO) {
      if (porAnadir <= 0) break;
      const existente = copia.find((s) => s.n === orb.n && s.l === orb.l);
      const hueco = capacidad(orb.l) - (existente?.electrones ?? 0);
      if (hueco <= 0) continue;
      const anade = Math.min(hueco, porAnadir);
      if (existente) existente.electrones += anade;
      else copia.push({ ...orb, electrones: anade });
      porAnadir -= anade;
      cambios.push({ n: orb.n, l: orb.l, cuantos: anade });
    }
  }

  return { subniveles: copia.filter((s) => s.electrones > 0), cambios };
}

// ============================================================
// Regla de Hund: cómo se reparten los electrones en las cajas
// ============================================================

/**
 * Ocupación caja por caja de un subnivel. Primero un electrón en cada orbital
 * con el mismo espín (Hund), y solo cuando no quedan cajas libres se empareja
 * con espín opuesto (Pauli).
 */
export function cajasDeSubnivel(l: number, electrones: number): number[] {
  const cajas = new Array(numOrbitales(l)).fill(0);
  for (let i = 0; i < electrones; i++) cajas[i % cajas.length] += 1;
  return cajas;
}

/** Electrones sin pareja de un subnivel */
export function desapareadosDe(l: number, electrones: number): number {
  const m = numOrbitales(l);
  return electrones <= m ? electrones : 2 * m - electrones;
}

// ============================================================
// Análisis completo
// ============================================================

export type Bloque = 's' | 'p' | 'd' | 'f';

export interface NumerosCuanticos {
  n: number;
  l: number;
  ml: number;
  /** +1 = espín +1/2 (flecha arriba); -1 = espín -1/2 (flecha abajo) */
  ms: 1 | -1;
}

export interface Resultado {
  elemento: ElementoCE;
  carga: number;
  electrones: number;
  /** Subniveles ocupados, ordenados por n y luego por l (notación de la IUPAC) */
  porNivel: Subnivel[];
  /** Los mismos, en el orden en que se llenaron (notación del diagrama de Möller) */
  porLlenado: Subnivel[];
  /** Núcleo de gas noble de la notación abreviada, si lo hay */
  nucleo: ElementoCE | null;
  /** Subniveles que van escritos detrás del corchete del gas noble */
  trasNucleo: Subnivel[];
  desapareados: number;
  paramagnetico: boolean;
  /** Electrones del nivel n más alto ocupado */
  capaValencia: { n: number; electrones: number };
  /** Valencia según el criterio del bloque: incluye el (n-1)d en los de transición */
  electronesValencia: number;
  bloque: Bloque;
  periodo: number;
  /** Grupo de la tabla periódica deducido de la configuración; null en las series interiores */
  grupo: number | null;
  /** Serie interior a la que pertenece, si es una de las dos filas sueltas */
  serie: 'lantanidos' | 'actinidos' | null;
  /** Subnivel donde entra el electrón que distingue a este elemento del anterior */
  diferenciador: Orbital;
  ultimoElectron: NumerosCuanticos | null;
  excepcion: Excepcion | null;
  /** Configuración de Madelung antes de aplicar la excepción, para poder compararlas */
  segunMadelung: Subnivel[] | null;
  cambiosIon: CambioIon[];
  esPrediccion: boolean;
}

function ordenarPorNivel(subs: Subnivel[]): Subnivel[] {
  return [...subs].sort((a, b) => a.n - b.n || a.l - b.l);
}

function ordenarPorLlenado(subs: Subnivel[]): Subnivel[] {
  const indice = (s: Orbital) => ORDEN_LLENADO.findIndex((o) => o.n === s.n && o.l === s.l);
  return [...subs].sort((a, b) => indice(a) - indice(b));
}

/** Números cuánticos del último electrón según el orden de llenado */
function ultimoElectronDe(subs: Subnivel[]): NumerosCuanticos | null {
  const enOrden = ordenarPorLlenado(subs);
  const ultimo = enOrden[enOrden.length - 1];
  if (!ultimo) return null;
  const m = numOrbitales(ultimo.l);
  const dentro = ultimo.electrones;
  const arriba = dentro <= m;
  const posicion = arriba ? dentro : dentro - m;
  return {
    n: ultimo.n,
    l: ultimo.l,
    ml: -ultimo.l + (posicion - 1),
    ms: arriba ? 1 : -1,
  };
}

/** Rangos de las dos series que la tabla periódica saca a una fila aparte */
export function serieDe(z: number): 'lantanidos' | 'actinidos' | null {
  if (z >= 57 && z <= 71) return 'lantanidos';
  if (z >= 89 && z <= 103) return 'actinidos';
  return null;
}

/**
 * Grupo deducido de la configuración. Se cuenta sobre el nivel del PERIODO y no
 * sobre el nivel más alto ocupado: el paladio deja su 5s vacío, y contar por el
 * nivel 4 le sumaría el 4s y el 4p y lo mandaría al grupo 12 en vez de al 10.
 */
function grupoDe(neutro: Subnivel[], bloque: Bloque, z: number, periodo: number): number | null {
  if (z === 2) return 18; // el helio es 1s² pero encabeza los gases nobles
  if (serieDe(z)) return null; // la IUPAC no numera por grupo las dos series interiores
  const enNivel = (n: number, l: number) =>
    neutro.find((s) => s.n === n && s.l === l)?.electrones ?? 0;

  if (bloque === 's') return enNivel(periodo, 0);
  if (bloque === 'p') return 10 + enNivel(periodo, 0) + enNivel(periodo, 1);
  if (bloque === 'd') return enNivel(periodo, 0) + enNivel(periodo - 1, 2);
  return null;
}

/**
 * Subnivel del electrón diferenciador: donde entra el electrón que distingue a
 * este elemento del anterior de la tabla, y que decide su bloque.
 *
 * Se calcula sobre el llenado IDEAL de Madelung, no sobre la configuración real,
 * porque el bloque es una propiedad de la posición en la tabla y la tabla está
 * construida con el orden ideal. Restar las configuraciones reales se equivoca
 * en las dos direcciones: el cerio parecería del bloque d (su orbital más alto
 * es el 5d, aunque el electrón nuevo entre en el 4f) y el cinc parecería del
 * bloque s, porque su vecino el cobre es una excepción y le había quitado un
 * electrón al 4s.
 */
export function electronDiferenciador(z: number): Orbital {
  const ideal = llenadoMadelung(z);
  const ultimo = ideal[ideal.length - 1];
  return { n: ultimo.n, l: ultimo.l };
}

export function analizar(z: number, carga: number): Resultado | null {
  const elemento = elementoPorZ(z);
  if (!elemento) return null;

  const electrones = z - carga;
  if (electrones < 1 || electrones > 118) return null;

  const neutro = configuracionNeutro(z);
  const { subniveles, cambios } = ionizar(neutro, carga);

  // El bloque, el periodo y el grupo son propiedades del ELEMENTO: se leen
  // siempre del átomo neutro, aunque en pantalla se muestre un ion.
  const diferenciador = electronDiferenciador(z);
  const bloque = LETRA_L[diferenciador.l] as Bloque;

  // El periodo sale del llenado de Madelung y no del real: el paladio deja el
  // 5s vacío y su nivel más alto ocupado es el 4, pero está en el periodo 5.
  const madelung = llenadoMadelung(z);
  const periodo = Math.max(...madelung.map((s) => s.n));

  // La capa de valencia es la del PERIODO (subniveles s y p de ese nivel), no
  // todo el nivel más alto ocupado: en el bromo el 3d¹⁰ ya es interior, y en el
  // paladio el nivel 4 entero sería un disparate como capa externa.
  const enCapa = subniveles
    .filter((s) => s.n === periodo && s.l <= 1)
    .reduce((suma, s) => suma + s.electrones, 0);
  const dInterno =
    bloque === 'd' ? subniveles.find((s) => s.n === periodo - 1 && s.l === 2)?.electrones ?? 0 : 0;

  const nucleo = gasNobleAnterior(z, electrones);
  const porNivel = ordenarPorNivel(subniveles);
  const trasNucleo = nucleo ? porNivel.filter((s) => !dentroDelNucleo(s, nucleo.z)) : porNivel;

  return {
    elemento,
    carga,
    electrones,
    porNivel,
    porLlenado: ordenarPorLlenado(subniveles),
    nucleo,
    trasNucleo,
    desapareados: subniveles.reduce((suma, s) => suma + desapareadosDe(s.l, s.electrones), 0),
    paramagnetico: subniveles.some((s) => desapareadosDe(s.l, s.electrones) > 0),
    capaValencia: { n: periodo, electrones: enCapa },
    electronesValencia: enCapa + dInterno,
    bloque,
    periodo,
    grupo: grupoDe(neutro, bloque, z, periodo),
    ultimoElectron: ultimoElectronDe(subniveles),
    serie: serieDe(z),
    diferenciador,
    excepcion: EXCEPCIONES[z] ?? null,
    segunMadelung: EXCEPCIONES[z] ? ordenarPorNivel(madelung) : null,
    cambiosIon: cambios,
    esPrediccion: z >= PRIMER_Z_PREDICHO,
  };
}

/** ¿Este subnivel forma parte del núcleo de gas noble que se abrevia? */
function dentroDelNucleo(s: Subnivel, zGasNoble: number): boolean {
  const nucleo = llenadoMadelung(zGasNoble);
  const igual = nucleo.find((x) => x.n === s.n && x.l === s.l);
  return igual !== undefined && igual.electrones === s.electrones;
}

// ============================================================
// Formato
// ============================================================

const SUPERINDICES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export function superindice(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUPERINDICES[Number(d)] ?? d)
    .join('');
}

/** Un subnivel escrito como 3d⁵ */
export function textoSubnivel(s: Subnivel): string {
  return `${s.n}${LETRA_L[s.l]}${superindice(s.electrones)}`;
}

/** La configuración completa, sin abreviar */
export function textoCompleto(subs: Subnivel[]): string {
  return subs.map(textoSubnivel).join(' ');
}

/** La configuración abreviada con el gas noble entre corchetes */
export function textoAbreviado(r: Resultado): string {
  const cola = textoCompleto(r.trasNucleo);
  if (!r.nucleo) return cola;
  return cola ? `[${r.nucleo.simbolo}] ${cola}` : `[${r.nucleo.simbolo}]`;
}

/** El símbolo del ion tal como se escribe en química: Fe³⁺, O²⁻, Na⁺ */
export function textoEspecie(simbolo: string, carga: number): string {
  if (carga === 0) return simbolo;
  const magnitud = Math.abs(carga) === 1 ? '' : superindice(Math.abs(carga));
  return `${simbolo}${magnitud}${carga > 0 ? '⁺' : '⁻'}`;
}

/** El nombre de la especie en palabras, para lectores de pantalla y titulares */
export function nombreEspecie(nombre: string, carga: number): string {
  if (carga === 0) return nombre;
  const signo = carga > 0 ? '+' : '−';
  return `ion ${nombre} ${Math.abs(carga)}${signo}`;
}

export const NOMBRE_BLOQUE: Record<Bloque, string> = {
  s: 'bloque s (elementos representativos)',
  p: 'bloque p (elementos representativos)',
  d: 'bloque d (metales de transición)',
  f: 'bloque f (lantánidos y actínidos)',
};

/** Fracción del espín tal como se escribe: +1/2 o −1/2 */
export function textoEspin(ms: 1 | -1): string {
  return ms === 1 ? '+1/2' : '−1/2';
}

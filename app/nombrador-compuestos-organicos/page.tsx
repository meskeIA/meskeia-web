'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './NombradorCompuestosOrganicos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

type FuncionId =
  | 'alcano'
  | 'alcohol'
  | 'aldehido'
  | 'cetona'
  | 'acido'
  | 'amina'
  | 'amida'
  | 'nitrilo';

type InsatId = 'ninguna' | 'doble' | 'triple';

type SustId =
  | 'metil'
  | 'etil'
  | 'propil'
  | 'isopropil'
  | 'butil'
  | 'terc-butil'
  | 'fenil'
  | 'cloro'
  | 'bromo'
  | 'fluoro'
  | 'yodo'
  | 'nitro';

interface Sustituyente {
  id: SustId;
  /** Posición sobre el esqueleto dibujado (1..n), antes de decidir el sentido */
  pos: number;
}

interface Estructura {
  n: number;
  funcion: FuncionId;
  /** Posición del grupo funcional sobre el esqueleto dibujado */
  posFuncion: number;
  insaturacion: InsatId;
  /** La insaturación va entre el carbono posInsat y el siguiente */
  posInsat: number;
  sustituyentes: Sustituyente[];
}

interface Atomos {
  C: number;
  H: number;
  O: number;
  N: number;
  Cl: number;
  Br: number;
  F: number;
  I: number;
}

interface Resultado {
  nombre: string;
  nombreClasico: string | null;
  formulaMolecular: string;
  semidesarrollada: string;
  invertida: boolean;
  motivoNumeracion: string;
  /** Localizador final de cada carbono del esqueleto: índice 0 = carbono 1 dibujado */
  localizadores: number[];
  avisos: string[];
}

// ═══════════════════════════════════════════════════════════════════════
// DATOS DE REFERENCIA
// ═══════════════════════════════════════════════════════════════════════

/** Raíces según el número de carbonos de la cadena principal (1..12) */
const RAICES = [
  'met', 'et', 'prop', 'but', 'pent', 'hex',
  'hept', 'oct', 'non', 'dec', 'undec', 'dodec',
];

const MULTIPLICADORES = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa'];

interface InfoFuncion {
  id: FuncionId;
  etiqueta: string;
  /** Prioridad para llevar el sufijo: 1 = la más alta */
  prioridad: number;
  /** El grupo obliga a estar en un extremo de la cadena */
  terminal: boolean;
  /** Enlaces del carbono que consume el grupo */
  ocupa: number;
  /** Átomos que aporta el grupo, además del carbono de la cadena */
  aporta: Partial<Atomos>;
  /** Símbolo que se pinta bajo el carbono en el esqueleto */
  simbolo: string;
}

const FUNCIONES: InfoFuncion[] = [
  { id: 'acido', etiqueta: 'Ácido carboxílico (—COOH)', prioridad: 1, terminal: true, ocupa: 3, aporta: { O: 2, H: 1 }, simbolo: '—COOH' },
  { id: 'amida', etiqueta: 'Amida (—CONH₂)', prioridad: 2, terminal: true, ocupa: 3, aporta: { O: 1, N: 1, H: 2 }, simbolo: '—CONH₂' },
  { id: 'nitrilo', etiqueta: 'Nitrilo (—C≡N)', prioridad: 3, terminal: true, ocupa: 3, aporta: { N: 1 }, simbolo: '≡N' },
  { id: 'aldehido', etiqueta: 'Aldehído (—CHO)', prioridad: 4, terminal: true, ocupa: 2, aporta: { O: 1 }, simbolo: '=O, —H' },
  { id: 'cetona', etiqueta: 'Cetona (C=O)', prioridad: 5, terminal: false, ocupa: 2, aporta: { O: 1 }, simbolo: '=O' },
  { id: 'alcohol', etiqueta: 'Alcohol (—OH)', prioridad: 6, terminal: false, ocupa: 1, aporta: { O: 1, H: 1 }, simbolo: '—OH' },
  { id: 'amina', etiqueta: 'Amina (—NH₂)', prioridad: 7, terminal: false, ocupa: 1, aporta: { N: 1, H: 2 }, simbolo: '—NH₂' },
  { id: 'alcano', etiqueta: 'Ninguno (hidrocarburo)', prioridad: 99, terminal: false, ocupa: 0, aporta: {}, simbolo: '' },
];

const FUNCION_POR_ID: Record<FuncionId, InfoFuncion> = FUNCIONES.reduce(
  (acc, f) => ({ ...acc, [f.id]: f }),
  {} as Record<FuncionId, InfoFuncion>,
);

interface InfoSust {
  id: SustId;
  nombre: string;
  /** Clave para el orden alfabético (sin prefijos multiplicadores ni terc-) */
  alfabetica: string;
  /** Átomos que aporta el sustituyente completo */
  aporta: Partial<Atomos>;
  /** Cómo se escribe entre paréntesis en la semidesarrollada */
  formula: string;
}

const SUSTITUYENTES: InfoSust[] = [
  { id: 'metil', nombre: 'metil', alfabetica: 'metil', aporta: { C: 1, H: 3 }, formula: 'CH₃' },
  { id: 'etil', nombre: 'etil', alfabetica: 'etil', aporta: { C: 2, H: 5 }, formula: 'C₂H₅' },
  { id: 'propil', nombre: 'propil', alfabetica: 'propil', aporta: { C: 3, H: 7 }, formula: 'C₃H₇' },
  { id: 'isopropil', nombre: 'isopropil', alfabetica: 'isopropil', aporta: { C: 3, H: 7 }, formula: 'CH(CH₃)₂' },
  { id: 'butil', nombre: 'butil', alfabetica: 'butil', aporta: { C: 4, H: 9 }, formula: 'C₄H₉' },
  { id: 'terc-butil', nombre: 'terc-butil', alfabetica: 'butil', aporta: { C: 4, H: 9 }, formula: 'C(CH₃)₃' },
  { id: 'fenil', nombre: 'fenil', alfabetica: 'fenil', aporta: { C: 6, H: 5 }, formula: 'C₆H₅' },
  { id: 'cloro', nombre: 'cloro', alfabetica: 'cloro', aporta: { Cl: 1 }, formula: 'Cl' },
  { id: 'bromo', nombre: 'bromo', alfabetica: 'bromo', aporta: { Br: 1 }, formula: 'Br' },
  { id: 'fluoro', nombre: 'fluoro', alfabetica: 'fluoro', aporta: { F: 1 }, formula: 'F' },
  { id: 'yodo', nombre: 'yodo', alfabetica: 'yodo', aporta: { I: 1 }, formula: 'I' },
  { id: 'nitro', nombre: 'nitro', alfabetica: 'nitro', aporta: { N: 1, O: 2 }, formula: 'NO₂' },
];

const SUST_POR_ID: Record<SustId, InfoSust> = SUSTITUYENTES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SustId, InfoSust>,
);

// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════

const SUBINDICES = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Convierte un número a subíndices unicode (2 → ₂) */
function sub(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUBINDICES[Number(d)])
    .join('');
}

/** Quita acentos y pasa a minúsculas, para comparar nombres */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR 1 — VALIDACIÓN DE LA ESTRUCTURA
// ═══════════════════════════════════════════════════════════════════════

/** Enlaces que consume el grupo funcional en el carbono i del esqueleto */
function ocupaFuncionEn(e: Estructura, i: number): number {
  if (e.funcion === 'alcano') return 0;
  return i === e.posFuncion ? FUNCION_POR_ID[e.funcion].ocupa : 0;
}

/** Enlaces que consume la insaturación en el carbono i del esqueleto */
function ocupaInsatEn(e: Estructura, i: number): number {
  if (e.insaturacion === 'ninguna') return 0;
  const extra = e.insaturacion === 'doble' ? 1 : 2;
  return i === e.posInsat || i === e.posInsat + 1 ? extra : 0;
}

/** Hidrógenos libres del carbono i del esqueleto (negativo = imposible) */
function hidrogenosEn(e: Estructura, i: number): number {
  let ocupados = 0;
  if (i > 1) ocupados += 1;
  if (i < e.n) ocupados += 1;
  ocupados += ocupaInsatEn(e, i);
  ocupados += ocupaFuncionEn(e, i);
  ocupados += e.sustituyentes.filter((s) => s.pos === i).length;
  return 4 - ocupados;
}

function validar(e: Estructura): string[] {
  const errores: string[] = [];
  const info = FUNCION_POR_ID[e.funcion];

  if (info.terminal && e.posFuncion !== 1 && e.posFuncion !== e.n) {
    errores.push('Ese grupo solo puede estar en un extremo de la cadena.');
  }

  if (e.funcion === 'cetona' && (e.posFuncion === 1 || e.posFuncion === e.n)) {
    errores.push(
      'Una cetona no puede estar en un carbono terminal: si el C=O queda en el extremo, el compuesto es un aldehído.',
    );
  }

  if (e.funcion === 'cetona' && e.n < 3) {
    errores.push('Hace falta una cadena de al menos 3 carbonos para tener una cetona.');
  }

  if (e.insaturacion !== 'ninguna' && e.n < 2) {
    errores.push('Con un solo carbono no puede haber doble ni triple enlace.');
  }

  if (e.insaturacion !== 'ninguna' && e.funcion !== 'alcano' && info.ocupa >= 2) {
    if (e.posFuncion === e.posInsat || e.posFuncion === e.posInsat + 1) {
      errores.push(
        'El carbono del grupo funcional ya tiene un enlace múltiple: coloca la insaturación en otra posición.',
      );
    }
  }

  for (let i = 1; i <= e.n; i += 1) {
    if (hidrogenosEn(e, i) < 0) {
      errores.push(
        `El carbono ${i} del dibujo se queda sin enlaces libres: un carbono solo forma cuatro enlaces.`,
      );
    }
  }

  return errores;
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR 2 — ELECCIÓN DEL SENTIDO DE NUMERACIÓN
// ═══════════════════════════════════════════════════════════════════════

interface Numeracion {
  invertida: boolean;
  motivo: string;
}

function elegirNumeracion(e: Estructura): Numeracion {
  const loc = (pos: number, inv: boolean) => (inv ? e.n + 1 - pos : pos);
  const locInsat = (pos: number, inv: boolean) => (inv ? e.n - pos : pos);

  // Criterio 1 — el grupo funcional principal recibe el localizador más bajo
  if (e.funcion !== 'alcano') {
    const directo = loc(e.posFuncion, false);
    const inverso = loc(e.posFuncion, true);
    if (directo !== inverso) {
      const inv = inverso < directo;
      return {
        invertida: inv,
        motivo: `El grupo funcional manda sobre todo lo demás: numerando ${inv ? 'desde la derecha' : 'desde la izquierda'} queda en el carbono ${Math.min(directo, inverso)} en lugar del ${Math.max(directo, inverso)}.`,
      };
    }
  }

  // Criterio 2 — la insaturación recibe el localizador más bajo
  if (e.insaturacion !== 'ninguna') {
    const directo = locInsat(e.posInsat, false);
    const inverso = locInsat(e.posInsat, true);
    if (directo !== inverso) {
      const inv = inverso < directo;
      const cual = e.insaturacion === 'doble' ? 'doble enlace' : 'triple enlace';
      return {
        invertida: inv,
        motivo: `Sin grupo funcional que mande, decide la insaturación: el ${cual} queda en ${Math.min(directo, inverso)} numerando ${inv ? 'desde la derecha' : 'desde la izquierda'}.`,
      };
    }
  }

  // Criterio 3 — conjunto de localizadores de sustituyentes más bajo
  if (e.sustituyentes.length > 0) {
    const listaDirecta = e.sustituyentes.map((s) => loc(s.pos, false)).sort((a, b) => a - b);
    const listaInversa = e.sustituyentes.map((s) => loc(s.pos, true)).sort((a, b) => a - b);
    for (let i = 0; i < listaDirecta.length; i += 1) {
      if (listaDirecta[i] !== listaInversa[i]) {
        const inv = listaInversa[i] < listaDirecta[i];
        return {
          invertida: inv,
          motivo: `Los localizadores se comparan uno a uno: {${listaDirecta.join(', ')}} frente a {${listaInversa.join(', ')}}. Gana el conjunto más bajo en la primera diferencia.`,
        };
      }
    }

    // Criterio 4 — desempate por orden alfabético
    const ordenados = (inv: boolean) =>
      e.sustituyentes
        .map((s) => ({ alfa: SUST_POR_ID[s.id].alfabetica, l: loc(s.pos, inv) }))
        .sort((a, b) => (a.alfa === b.alfa ? a.l - b.l : a.alfa.localeCompare(b.alfa)));
    const listaD = ordenados(false);
    const listaI = ordenados(true);
    for (let i = 0; i < listaD.length; i += 1) {
      if (listaD[i].l !== listaI[i].l) {
        const inv = listaI[i].l < listaD[i].l;
        const ganador = inv ? listaI[i] : listaD[i];
        return {
          invertida: inv,
          motivo: `Los dos sentidos dan los mismos localizadores, así que decide el orden alfabético: el ${ganador.alfa}o recibe el número más bajo.`,
        };
      }
    }
  }

  return {
    invertida: false,
    motivo: 'Los dos sentidos dan exactamente los mismos localizadores: da igual por dónde numeres, el nombre no cambia.',
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR 3 — CONSTRUCCIÓN DEL NOMBRE
// ═══════════════════════════════════════════════════════════════════════

/** Bloque de prefijos ya ordenado alfabéticamente: "4-etil-2,3-dimetil" */
function construirPrefijos(susts: { id: SustId; loc: number }[]): string {
  if (susts.length === 0) return '';

  const grupos = new Map<SustId, number[]>();
  susts.forEach((s) => {
    const previos = grupos.get(s.id) ?? [];
    grupos.set(s.id, [...previos, s.loc]);
  });

  const bloques = Array.from(grupos.entries())
    .map(([id, locs]) => {
      const info = SUST_POR_ID[id];
      const ordenados = [...locs].sort((a, b) => a - b);
      const mult = MULTIPLICADORES[ordenados.length] ?? '';
      return {
        alfa: info.alfabetica,
        texto: `${ordenados.join(',')}-${mult}${info.nombre}`,
      };
    })
    .sort((a, b) => a.alfa.localeCompare(b.alfa));

  return bloques.map((b) => b.texto).join('-');
}

function construirNombre(e: Estructura, invertida: boolean): { nombre: string; clasico: string | null } {
  const loc = (pos: number) => (invertida ? e.n + 1 - pos : pos);
  const locInsat = (pos: number) => (invertida ? e.n - pos : pos);

  const raiz = RAICES[e.n - 1];
  const susts = e.sustituyentes.map((s) => ({ id: s.id, loc: loc(s.pos) }));
  const prefijos = construirPrefijos(susts);
  const locFuncion = loc(e.posFuncion);
  const locIns = locInsat(e.posInsat);

  // Cuerpo: raíz + infijo de saturación
  let cuerpo: string;
  if (e.insaturacion === 'ninguna') {
    cuerpo = `${raiz}an`;
  } else {
    const infijo = e.insaturacion === 'doble' ? 'en' : 'in';
    // En eteno y etino no hay más posición posible que la 1
    cuerpo = e.n === 2 ? `${raiz}${infijo}` : `${raiz}-${locIns}-${infijo}`;
  }

  let nombre: string;
  let clasico: string | null = null;

  switch (e.funcion) {
    case 'alcohol':
      nombre = `${cuerpo}-${locFuncion}-ol`;
      if (e.insaturacion === 'ninguna') clasico = `${locFuncion}-${raiz}anol`;
      break;
    case 'cetona':
      nombre = `${cuerpo}-${locFuncion}-ona`;
      if (e.insaturacion === 'ninguna') clasico = `${locFuncion}-${raiz}anona`;
      break;
    case 'amina':
      nombre = `${cuerpo}-${locFuncion}-amina`;
      if (e.insaturacion === 'ninguna') clasico = `${locFuncion}-${raiz}anamina`;
      break;
    case 'aldehido':
      nombre = `${cuerpo}al`;
      break;
    case 'acido':
      nombre = `${cuerpo}oico`;
      break;
    case 'amida':
      nombre = `${cuerpo}amida`;
      break;
    case 'nitrilo':
      nombre = `${cuerpo}onitrilo`;
      break;
    default:
      nombre = `${cuerpo}o`;
      if (e.insaturacion !== 'ninguna' && e.n > 2) {
        clasico = `${locIns}-${raiz}${e.insaturacion === 'doble' ? 'eno' : 'ino'}`;
      }
      break;
  }

  const conPrefijos = (base: string) => (prefijos ? `${prefijos}${base}` : base);
  const conArticulo = (base: string) => (e.funcion === 'acido' ? `ácido ${base}` : base);

  return {
    nombre: conArticulo(conPrefijos(nombre)),
    clasico: clasico ? conArticulo(conPrefijos(clasico)) : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR 4 — FÓRMULAS
// ═══════════════════════════════════════════════════════════════════════

function calcularAtomos(e: Estructura): Atomos {
  const total: Atomos = { C: e.n, H: 0, O: 0, N: 0, Cl: 0, Br: 0, F: 0, I: 0 };

  for (let i = 1; i <= e.n; i += 1) {
    total.H += Math.max(0, hidrogenosEn(e, i));
  }

  if (e.funcion !== 'alcano') {
    const aporta = FUNCION_POR_ID[e.funcion].aporta;
    (Object.keys(aporta) as (keyof Atomos)[]).forEach((k) => {
      total[k] += aporta[k] ?? 0;
    });
  }

  e.sustituyentes.forEach((s) => {
    const aporta = SUST_POR_ID[s.id].aporta;
    (Object.keys(aporta) as (keyof Atomos)[]).forEach((k) => {
      total[k] += aporta[k] ?? 0;
    });
  });

  return total;
}

/** Fórmula molecular en orden de Hill: C, H y el resto alfabético */
function formulaMolecular(a: Atomos): string {
  const partes: string[] = [];
  const escribir = (simbolo: string, cantidad: number) => {
    if (cantidad <= 0) return;
    partes.push(cantidad === 1 ? simbolo : `${simbolo}${sub(cantidad)}`);
  };
  escribir('C', a.C);
  escribir('H', a.H);
  escribir('Br', a.Br);
  escribir('Cl', a.Cl);
  escribir('F', a.F);
  escribir('I', a.I);
  escribir('N', a.N);
  escribir('O', a.O);
  return partes.join('');
}

/**
 * Fórmula semidesarrollada. Los grupos terminales (ácido, aldehído, amida,
 * nitrilo) llevan siempre el localizador 1, pero por convención se escriben al
 * final de la cadena: CH₃—CH₂—COOH, no COOH—CH₂—CH₃.
 */
function formulaSemidesarrollada(e: Estructura, invertida: boolean): string {
  /** Convierte un localizador IUPAC en la posición con la que se dibujó */
  const posDe = (loc: number) => (invertida ? e.n + 1 - loc : loc);

  const grupoTerminal = e.funcion !== 'alcano' && FUNCION_POR_ID[e.funcion].terminal;
  const localizadores = Array.from({ length: e.n }, (_, k) => k + 1);
  const secuencia = grupoTerminal && e.n > 1 ? [...localizadores].reverse() : localizadores;

  const fragmentos = secuencia.map((loc) => {
    const i = posDe(loc);
    const h = Math.max(0, hidrogenosEn(e, i));
    const esGrupo = e.funcion !== 'alcano' && i === e.posFuncion;
    // Con un solo carbono el hidrógeno del grupo se escribe delante: HCOOH, HCHO
    const cabeza = esGrupo && grupoTerminal && e.n === 1 ? 'H' : '';

    let base: string;
    if (esGrupo && e.funcion === 'acido') base = `${cabeza}COOH`;
    else if (esGrupo && e.funcion === 'aldehido') base = `${cabeza}CHO`;
    else if (esGrupo && e.funcion === 'amida') base = `${cabeza}CONH₂`;
    else if (esGrupo && e.funcion === 'nitrilo') base = `${cabeza}C≡N`;
    else if (esGrupo && e.funcion === 'cetona') base = 'CO';
    else {
      base = `C${h > 0 ? `H${h > 1 ? sub(h) : ''}` : ''}`;
      if (esGrupo && e.funcion === 'alcohol') base += '(OH)';
      if (esGrupo && e.funcion === 'amina') base += '(NH₂)';
    }

    const enEsteCarbono = e.sustituyentes.filter((s) => s.pos === i);
    const porTipo = new Map<SustId, number>();
    enEsteCarbono.forEach((s) => porTipo.set(s.id, (porTipo.get(s.id) ?? 0) + 1));
    const cola = Array.from(porTipo.entries())
      .map(([id, veces]) => `(${SUST_POR_ID[id].formula})${veces > 1 ? sub(veces) : ''}`)
      .join('');

    return base + cola;
  });

  // Enlace que une cada carbono con el siguiente, según dónde esté la insaturación
  const enlaces = secuencia.slice(0, -1).map((loc, idx) => {
    const par = [posDe(loc), posDe(secuencia[idx + 1])].sort((a, b) => a - b);
    const esInsaturado =
      e.insaturacion !== 'ninguna' && par[0] === e.posInsat && par[1] === e.posInsat + 1;
    if (!esInsaturado) return '—';
    return e.insaturacion === 'doble' ? '=' : '≡';
  });

  return fragmentos.reduce(
    (acc, frag, idx) => (idx === 0 ? frag : `${acc}${enlaces[idx - 1]}${frag}`),
    '',
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR 5 — ORQUESTADOR
// ═══════════════════════════════════════════════════════════════════════

const ALQUILOS: SustId[] = ['metil', 'etil', 'propil', 'isopropil', 'butil', 'terc-butil'];

function nombrar(e: Estructura): Resultado | null {
  if (validar(e).length > 0) return null;

  const { invertida, motivo } = elegirNumeracion(e);
  const { nombre, clasico } = construirNombre(e, invertida);
  const atomos = calcularAtomos(e);
  const avisos: string[] = [];

  // Un radical con carbonos en un extremo delata que la cadena principal no era la más larga
  const enExtremo = e.sustituyentes.some(
    (s) => ALQUILOS.includes(s.id) && (s.pos === 1 || s.pos === e.n),
  );
  if (enExtremo) {
    avisos.push(
      'Hay un sustituyente con carbonos en un extremo de la cadena. En una molécula real eso alarga la cadena principal en vez de ramificarla, así que ese nombre no sería el correcto: la cadena principal es siempre la más larga.',
    );
  }

  const localizadores = Array.from({ length: e.n }, (_, k) => (invertida ? e.n - k : k + 1));

  return {
    nombre,
    nombreClasico: clasico,
    formulaMolecular: formulaMolecular(atomos),
    semidesarrollada: formulaSemidesarrollada(e, invertida),
    invertida,
    motivoNumeracion: motivo,
    localizadores,
    avisos,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MOTOR 6 — PARSER INVERSO (nombre → estructura)
// ═══════════════════════════════════════════════════════════════════════

interface ResultadoParser {
  estructura: Estructura | null;
  error: string | null;
}

const SUFIJOS: { patron: RegExp; funcion: FuncionId }[] = [
  { patron: /oico$/, funcion: 'acido' },
  { patron: /nitrilo$/, funcion: 'nitrilo' },
  { patron: /amida$/, funcion: 'amida' },
  { patron: /amina$/, funcion: 'amina' },
  { patron: /ona$/, funcion: 'cetona' },
  { patron: /ol$/, funcion: 'alcohol' },
  { patron: /al$/, funcion: 'aldehido' },
  { patron: /ino$/, funcion: 'alcano' },
  { patron: /eno$/, funcion: 'alcano' },
  { patron: /ano$/, funcion: 'alcano' },
];

function interpretarNombre(entrada: string): ResultadoParser {
  const texto = normalizar(entrada).replace(/\s/g, '');
  if (!texto) return { estructura: null, error: null };

  let cuerpo = texto;
  let esAcido = false;

  if (cuerpo.startsWith('acido')) {
    esAcido = true;
    cuerpo = cuerpo.slice(5);
  }

  const encontrado = SUFIJOS.find((s) => s.patron.test(cuerpo));
  if (!encontrado) {
    return {
      estructura: null,
      error: 'No reconozco la terminación. Prueba con un nombre acabado en -ano, -eno, -ino, -ol, -al, -ona, -amina, -amida, -nitrilo o «ácido …oico».',
    };
  }
  if (esAcido && !/oico$/.test(cuerpo)) {
    return {
      estructura: null,
      error: 'Un ácido carboxílico termina en -oico (por ejemplo, ácido butanoico).',
    };
  }
  const funcion: FuncionId = esAcido ? 'acido' : encontrado.funcion;

  // Los sustituyentes se extraen ANTES de buscar la raíz y se retiran del texto:
  // si no, el «met» de «metil» se confundiría con la raíz de un solo carbono.
  const sustituyentes: Sustituyente[] = [];
  const nombresSust = SUSTITUYENTES.map((s) => s.nombre).join('|');
  const patronSust = new RegExp(`(\\d+(?:,\\d+)*)-(?:di|tri|tetra|penta)?(${nombresSust})`, 'g');
  Array.from(cuerpo.matchAll(patronSust)).forEach((coincidencia) => {
    const posiciones = coincidencia[1].split(',').map(Number);
    const info = SUSTITUYENTES.find((s) => s.nombre === coincidencia[2]);
    if (info) posiciones.forEach((p) => sustituyentes.push({ id: info.id, pos: p }));
  });
  const cuerpoLimpio = cuerpo.replace(patronSust, '');

  // Localizador del sufijo en la forma moderna: hexan-2-ol
  let posFuncion = 1;
  const modernoLoc = cuerpoLimpio.match(/-(\d+)-(ol|ona|amina)$/);
  if (modernoLoc) posFuncion = Number(modernoLoc[1]);

  // Raíz de la cadena principal: se prueba de la más larga a la más corta
  const raizEncontrada = RAICES.map((raiz, idx) => ({ raiz, n: idx + 1 }))
    .sort((a, b) => b.raiz.length - a.raiz.length)
    .find(({ raiz }) => cuerpoLimpio.includes(raiz));

  if (!raizEncontrada) {
    return {
      estructura: null,
      error: 'No reconozco la raíz de la cadena. Esta herramienta cubre de 1 a 12 carbonos (met-, et-, prop-, but-, pent-, hex-… dodec-).',
    };
  }
  const n = raizEncontrada.n;
  const posicionRaiz = cuerpoLimpio.indexOf(raizEncontrada.raiz);

  // Insaturación: infijo -en- o -in- justo detrás de la raíz
  let insaturacion: InsatId = 'ninguna';
  let posInsat = 1;
  const trasRaiz = cuerpoLimpio.slice(posicionRaiz + raizEncontrada.raiz.length);
  const insat = trasRaiz.match(/^-?(\d+)?-?(en|in)/);
  if (insat) {
    insaturacion = insat[2] === 'en' ? 'doble' : 'triple';
    posInsat = insat[1] ? Number(insat[1]) : 1;
  }

  // Localizador clásico, delante de la raíz: 2-hexanol
  if (!modernoLoc && funcion !== 'alcano') {
    const clasico = cuerpoLimpio.slice(0, posicionRaiz).match(/(\d+)-$/);
    if (clasico) posFuncion = Number(clasico[1]);
  }

  // Los grupos terminales van siempre en el carbono 1
  if (FUNCION_POR_ID[funcion].terminal) posFuncion = 1;

  const estructura: Estructura = {
    n,
    funcion,
    posFuncion: Math.min(Math.max(posFuncion, 1), n),
    insaturacion: n < 2 ? 'ninguna' : insaturacion,
    posInsat: Math.min(Math.max(posInsat, 1), Math.max(1, n - 1)),
    sustituyentes: sustituyentes.filter((s) => s.pos >= 1 && s.pos <= n),
  };

  const errores = validar(estructura);
  if (errores.length > 0) return { estructura: null, error: errores[0] };

  return { estructura, error: null };
}

// ═══════════════════════════════════════════════════════════════════════
// EJEMPLOS PRECARGADOS
// ═══════════════════════════════════════════════════════════════════════

const EJEMPLOS: { etiqueta: string; estructura: Estructura }[] = [
  {
    etiqueta: 'Un alcohol que obliga a invertir',
    estructura: { n: 6, funcion: 'alcohol', posFuncion: 5, insaturacion: 'ninguna', posInsat: 1, sustituyentes: [] },
  },
  {
    etiqueta: 'Dos sustituyentes distintos',
    estructura: {
      n: 6,
      funcion: 'alcano',
      posFuncion: 1,
      insaturacion: 'ninguna',
      posInsat: 1,
      sustituyentes: [{ id: 'etil', pos: 4 }, { id: 'metil', pos: 3 }, { id: 'metil', pos: 2 }],
    },
  },
  {
    etiqueta: 'Grupo funcional contra insaturación',
    estructura: { n: 6, funcion: 'alcohol', posFuncion: 5, insaturacion: 'doble', posInsat: 2, sustituyentes: [] },
  },
  {
    etiqueta: 'Ácido con ramificación',
    estructura: {
      n: 5,
      funcion: 'acido',
      posFuncion: 1,
      insaturacion: 'ninguna',
      posInsat: 1,
      sustituyentes: [{ id: 'metil', pos: 3 }],
    },
  },
  {
    etiqueta: 'Cetona halogenada',
    estructura: {
      n: 5,
      funcion: 'cetona',
      posFuncion: 4,
      insaturacion: 'ninguna',
      posInsat: 1,
      sustituyentes: [{ id: 'cloro', pos: 5 }],
    },
  },
  {
    etiqueta: 'Molécula simétrica',
    estructura: {
      n: 5,
      funcion: 'alcano',
      posFuncion: 1,
      insaturacion: 'ninguna',
      posInsat: 1,
      sustituyentes: [{ id: 'metil', pos: 2 }, { id: 'metil', pos: 4 }],
    },
  },
];

const NOMBRES_EJEMPLO = [
  '4-metilhexan-2-ol',
  '2-hexanol',
  'ácido 3-metilbutanoico',
  '3-metilpent-1-eno',
  '2,2-dimetilpropano',
];

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function NombradorCompuestosOrganicosPage() {
  const [modo, setModo] = useState<'construir' | 'interpretar'>('construir');

  const [estructura, setEstructura] = useState<Estructura>({
    n: 6,
    funcion: 'alcohol',
    posFuncion: 5,
    insaturacion: 'ninguna',
    posInsat: 1,
    sustituyentes: [],
  });

  const [sustSeleccionado, setSustSeleccionado] = useState<SustId>('metil');
  const [nombreEntrada, setNombreEntrada] = useState('');

  const errores = useMemo(() => validar(estructura), [estructura]);
  const resultado = useMemo(() => nombrar(estructura), [estructura]);

  const interpretacion = useMemo(() => interpretarNombre(nombreEntrada), [nombreEntrada]);
  const resultadoInterpretado = useMemo(
    () => (interpretacion.estructura ? nombrar(interpretacion.estructura) : null),
    [interpretacion.estructura],
  );

  const nombreCoincide = useMemo(() => {
    if (!resultadoInterpretado) return false;
    const introducido = normalizar(nombreEntrada).replace(/\s/g, '');
    const canonico = normalizar(resultadoInterpretado.nombre).replace(/\s/g, '');
    const clasico = resultadoInterpretado.nombreClasico
      ? normalizar(resultadoInterpretado.nombreClasico).replace(/\s/g, '')
      : null;
    return introducido === canonico || introducido === clasico;
  }, [resultadoInterpretado, nombreEntrada]);

  const actualizar = (cambios: Partial<Estructura>) => {
    setEstructura((previa) => {
      const siguiente: Estructura = { ...previa, ...cambios };
      // Reencaja las posiciones cuando cambian la longitud o el grupo funcional
      if (FUNCION_POR_ID[siguiente.funcion].terminal) siguiente.posFuncion = 1;
      if (siguiente.funcion === 'cetona' && (siguiente.posFuncion < 2 || siguiente.posFuncion >= siguiente.n)) {
        siguiente.posFuncion = Math.max(2, Math.min(siguiente.n - 1, siguiente.posFuncion));
      }
      if (siguiente.posFuncion > siguiente.n) siguiente.posFuncion = siguiente.n;
      if (siguiente.posInsat > Math.max(1, siguiente.n - 1)) {
        siguiente.posInsat = Math.max(1, siguiente.n - 1);
      }
      siguiente.sustituyentes = siguiente.sustituyentes.filter((s) => s.pos <= siguiente.n);
      return siguiente;
    });
  };

  const alternarSustituyente = (pos: number) => {
    setEstructura((previa) => {
      const indice = previa.sustituyentes.findIndex(
        (s) => s.pos === pos && s.id === sustSeleccionado,
      );
      if (indice >= 0) {
        return {
          ...previa,
          sustituyentes: previa.sustituyentes.filter((_, idx) => idx !== indice),
        };
      }
      return { ...previa, sustituyentes: [...previa.sustituyentes, { id: sustSeleccionado, pos }] };
    });
  };

  const posicionesFuncion = useMemo(() => {
    const info = FUNCION_POR_ID[estructura.funcion];
    if (estructura.funcion === 'alcano' || info.terminal) return [];
    if (estructura.funcion === 'cetona') {
      return Array.from({ length: Math.max(0, estructura.n - 2) }, (_, k) => k + 2);
    }
    return Array.from({ length: estructura.n }, (_, k) => k + 1);
  }, [estructura.funcion, estructura.n]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Nomenclatura orgánica: nombra y corrige compuestos</h1>
        <p className={styles.subtitle}>
          Monta la cadena, coloca los grupos donde están y obtén el nombre IUPAC con la numeración
          razonada. O escribe un nombre y comprueba si está bien formulado.
        </p>
      </header>

      <LegalNotice />

      {/* ══════════ SELECTOR DE MODO ══════════ */}
      <div className={styles.modoTabs} role="tablist" aria-label="Modo de trabajo">
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'construir'}
          className={`${styles.modoTab} ${modo === 'construir' ? styles.modoTabActivo : ''}`}
          onClick={() => setModo('construir')}
        >
          <span aria-hidden="true">🧪</span> Molécula → nombre
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'interpretar'}
          className={`${styles.modoTab} ${modo === 'interpretar' ? styles.modoTabActivo : ''}`}
          onClick={() => setModo('interpretar')}
        >
          <span aria-hidden="true">🔤</span> Nombre → molécula
        </button>
      </div>

      {modo === 'construir' && (
        <>
          {/* ══════════ CONSTRUCCIÓN ══════════ */}
          <section className={styles.panel} aria-label="Construcción de la molécula">
            <h2 className={styles.panelTitulo}>1. La cadena principal</h2>
            <div className={styles.campoFila}>
              <label className={styles.campoLabel} htmlFor="longitud">
                Carbonos de la cadena: <strong>{estructura.n}</strong>
              </label>
              <input
                id="longitud"
                type="range"
                min={1}
                max={12}
                value={estructura.n}
                onChange={(ev) => actualizar({ n: Number(ev.target.value) })}
                className={styles.slider}
              />
              <span className={styles.raizPista}>
                raíz <strong>{RAICES[estructura.n - 1]}-</strong>
              </span>
            </div>

            <h2 className={styles.panelTitulo}>2. El grupo funcional principal</h2>
            <div className={styles.chipsGrid}>
              {FUNCIONES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={estructura.funcion === f.id}
                  className={`${styles.chip} ${estructura.funcion === f.id ? styles.chipActivo : ''}`}
                  onClick={() => actualizar({ funcion: f.id })}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>

            {posicionesFuncion.length > 0 && (
              <div className={styles.subcampo}>
                <span className={styles.campoLabel}>¿En qué carbono del dibujo está el grupo?</span>
                <div className={styles.chipsGrid}>
                  {posicionesFuncion.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={estructura.posFuncion === p}
                      className={`${styles.chipNum} ${estructura.posFuncion === p ? styles.chipActivo : ''}`}
                      onClick={() => actualizar({ posFuncion: p })}
                    >
                      C{p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {FUNCION_POR_ID[estructura.funcion].terminal && (
              <p className={styles.notaCampo}>
                Este grupo solo puede estar en un extremo, así que ocupa siempre el carbono 1.
              </p>
            )}

            <h2 className={styles.panelTitulo}>3. Insaturación (opcional)</h2>
            <div className={styles.chipsGrid}>
              {([
                { id: 'ninguna', etiqueta: 'Solo enlaces simples' },
                { id: 'doble', etiqueta: 'Un doble enlace (C=C)' },
                { id: 'triple', etiqueta: 'Un triple enlace (C≡C)' },
              ] as { id: InsatId; etiqueta: string }[]).map((op) => (
                <button
                  key={op.id}
                  type="button"
                  aria-pressed={estructura.insaturacion === op.id}
                  className={`${styles.chip} ${estructura.insaturacion === op.id ? styles.chipActivo : ''}`}
                  onClick={() => actualizar({ insaturacion: op.id })}
                >
                  {op.etiqueta}
                </button>
              ))}
            </div>

            {estructura.insaturacion !== 'ninguna' && estructura.n > 2 && (
              <div className={styles.subcampo}>
                <span className={styles.campoLabel}>¿Entre qué dos carbonos del dibujo?</span>
                <div className={styles.chipsGrid}>
                  {Array.from({ length: estructura.n - 1 }, (_, k) => k + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={estructura.posInsat === p}
                      className={`${styles.chipNum} ${estructura.posInsat === p ? styles.chipActivo : ''}`}
                      onClick={() => actualizar({ posInsat: p })}
                    >
                      C{p}–C{p + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <h2 className={styles.panelTitulo}>4. Sustituyentes</h2>
            <p className={styles.notaCampo}>
              Elige un sustituyente y pulsa sobre el carbono donde va. Vuelve a pulsar para quitarlo.
            </p>
            <div className={styles.chipsGrid}>
              {SUSTITUYENTES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sustSeleccionado === s.id}
                  className={`${styles.chip} ${sustSeleccionado === s.id ? styles.chipActivo : ''}`}
                  onClick={() => setSustSeleccionado(s.id)}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          </section>

          {/* ══════════ ESQUELETO ══════════ */}
          <section className={styles.esqueletoPanel} aria-label="Esqueleto de la molécula">
            <div className={styles.esqueletoCabecera}>
              <h2 className={styles.panelTitulo}>El esqueleto que has montado</h2>
              {estructura.sustituyentes.length > 0 && (
                <button
                  type="button"
                  className={styles.btnSecundario}
                  onClick={() => setEstructura((p) => ({ ...p, sustituyentes: [] }))}
                >
                  Quitar todos los sustituyentes
                </button>
              )}
            </div>

            <div className={styles.esqueletoScroll}>
              <div className={styles.esqueleto}>
                {Array.from({ length: estructura.n }, (_, k) => k + 1).map((pos) => {
                  const susts = estructura.sustituyentes.filter((s) => s.pos === pos);
                  const esGrupo = estructura.funcion !== 'alcano' && pos === estructura.posFuncion;
                  return (
                    <div key={pos} className={styles.carbonoColumna}>
                      <div className={styles.sustituyentesArriba}>
                        {susts.map((s, idx) => (
                          <span key={`${s.id}-${idx}`} className={styles.sustEtiqueta}>
                            {SUST_POR_ID[s.id].formula}
                          </span>
                        ))}
                      </div>

                      <div className={styles.carbonoFila}>
                        <button
                          type="button"
                          className={`${styles.carbono} ${esGrupo ? styles.carbonoGrupo : ''}`}
                          onClick={() => alternarSustituyente(pos)}
                          aria-label={`Carbono ${pos} del dibujo: añadir o quitar ${sustSeleccionado}`}
                        >
                          <span className={styles.carbonoSimbolo}>C</span>
                          <span className={styles.carbonoDibujo}>{pos}</span>
                        </button>
                        {pos < estructura.n && (
                          <span className={styles.enlace} aria-hidden="true">
                            {estructura.insaturacion !== 'ninguna' && pos === estructura.posInsat
                              ? estructura.insaturacion === 'doble'
                                ? '='
                                : '≡'
                              : '—'}
                          </span>
                        )}
                      </div>

                      <div className={styles.grupoAbajo}>
                        {esGrupo && (
                          <span className={styles.grupoEtiqueta}>
                            {FUNCION_POR_ID[estructura.funcion].simbolo}
                          </span>
                        )}
                      </div>

                      <div className={styles.localizadorFinal}>
                        {resultado && (
                          <span className={styles.localizadorNum}>
                            {resultado.localizadores[pos - 1]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={styles.leyendaEsqueleto}>
              El número gris dentro del carbono es el que has usado para dibujar. El número azul de
              abajo es el localizador IUPAC que le corresponde una vez elegido el sentido de
              numeración.
            </p>
          </section>

          {/* ══════════ RESULTADO ══════════ */}
          {errores.length > 0 ? (
            <section className={styles.errorPanel} role="alert">
              <h2>
                <span aria-hidden="true">🚫</span> Esa molécula no puede existir
              </h2>
              <ul>
                {errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
          ) : (
            resultado && (
              <section className={styles.resultadoPanel} aria-live="polite">
                <p className={styles.resultadoEtiqueta}>Nombre IUPAC</p>
                <p className={styles.nombreGrande}>{resultado.nombre}</p>

                {resultado.nombreClasico && (
                  <p className={styles.nombreClasico}>
                    Forma clásica, todavía muy usada en libros de texto:{' '}
                    <strong>{resultado.nombreClasico}</strong>
                  </p>
                )}

                <div className={styles.formulasGrid}>
                  <div className={styles.formulaCard}>
                    <span className={styles.formulaLabel}>Fórmula molecular</span>
                    <span className={styles.formulaValor}>{resultado.formulaMolecular}</span>
                  </div>
                  <div className={styles.formulaCard}>
                    <span className={styles.formulaLabel}>Fórmula semidesarrollada</span>
                    <span className={styles.formulaValorPequena}>{resultado.semidesarrollada}</span>
                  </div>
                </div>

                <div className={styles.razonamiento}>
                  <h3>
                    <span aria-hidden="true">🧭</span> Por qué se numera así
                  </h3>
                  <p>
                    Se numera{' '}
                    <strong>
                      {resultado.invertida ? 'de derecha a izquierda' : 'de izquierda a derecha'}
                    </strong>
                    . {resultado.motivoNumeracion}
                  </p>
                </div>

                {resultado.avisos.map((a) => (
                  <p key={a} className={styles.avisoCadena}>
                    <span aria-hidden="true">⚠️</span> {a}
                  </p>
                ))}
              </section>
            )
          )}

          {/* ══════════ EJEMPLOS ══════════ */}
          <section className={styles.ejemplosPanel}>
            <h2 className={styles.panelTitulo}>Casos que conviene probar</h2>
            <div className={styles.ejemplosGrid}>
              {EJEMPLOS.map((ej) => (
                <button
                  key={ej.etiqueta}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => setEstructura(ej.estructura)}
                >
                  {ej.etiqueta}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {modo === 'interpretar' && (
        <section className={styles.panel} aria-label="Interpretación de un nombre">
          <h2 className={styles.panelTitulo}>Escribe un nombre y lo comprobamos</h2>
          <label className={styles.campoLabel} htmlFor="nombre-entrada">
            Nombre del compuesto
          </label>
          <input
            id="nombre-entrada"
            type="text"
            className={styles.inputTexto}
            value={nombreEntrada}
            onChange={(ev) => setNombreEntrada(ev.target.value)}
            placeholder="Por ejemplo: 4-metilhexan-2-ol"
            autoComplete="off"
            spellCheck={false}
          />

          <p className={styles.notaCampo}>O prueba con uno de estos:</p>
          <div className={styles.chipsGrid}>
            {NOMBRES_EJEMPLO.map((ej) => (
              <button
                key={ej}
                type="button"
                className={styles.chipNum}
                onClick={() => setNombreEntrada(ej)}
              >
                {ej}
              </button>
            ))}
          </div>

          {interpretacion.error && nombreEntrada.trim() !== '' && (
            <p className={styles.errorLinea} role="alert">
              <span aria-hidden="true">🚫</span> {interpretacion.error}
            </p>
          )}

          {resultadoInterpretado && interpretacion.estructura && (
            <div className={styles.interpretacionResultado} aria-live="polite">
              {nombreCoincide ? (
                <p className={styles.veredictoOk}>
                  <span aria-hidden="true">✅</span> El nombre está bien formulado.
                </p>
              ) : (
                <p className={styles.veredictoMal}>
                  <span aria-hidden="true">✏️</span> Se entiende a qué molécula te refieres, pero el
                  nombre correcto es <strong>{resultadoInterpretado.nombre}</strong>.{' '}
                  {resultadoInterpretado.motivoNumeracion}
                </p>
              )}

              <div className={styles.formulasGrid}>
                <div className={styles.formulaCard}>
                  <span className={styles.formulaLabel}>Cadena principal</span>
                  <span className={styles.formulaValorPequena}>
                    {interpretacion.estructura.n} carbonos ({RAICES[interpretacion.estructura.n - 1]}-)
                  </span>
                </div>
                <div className={styles.formulaCard}>
                  <span className={styles.formulaLabel}>Fórmula molecular</span>
                  <span className={styles.formulaValor}>{resultadoInterpretado.formulaMolecular}</span>
                </div>
                <div className={styles.formulaCard}>
                  <span className={styles.formulaLabel}>Fórmula semidesarrollada</span>
                  <span className={styles.formulaValorPequena}>
                    {resultadoInterpretado.semidesarrollada}
                  </span>
                </div>
              </div>

              {resultadoInterpretado.avisos.map((a) => (
                <p key={a} className={styles.avisoCadena}>
                  <span aria-hidden="true">⚠️</span> {a}
                </p>
              ))}

              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() => {
                  if (interpretacion.estructura) {
                    setEstructura(interpretacion.estructura);
                    setModo('construir');
                  }
                }}
              >
                Abrir esta molécula en el constructor
              </button>
            </div>
          )}
        </section>
      )}

      {/* ══════════ ALCANCE ══════════ */}
      <section className={styles.alcancePanel}>
        <h2>
          <span aria-hidden="true">📐</span> Hasta dónde llega esta herramienta
        </h2>
        <div className={styles.alcanceGrid}>
          <div className={styles.alcanceColumna}>
            <h3>Sí cubre</h3>
            <ul>
              <li>Cadenas abiertas de 1 a 12 carbonos</li>
              <li>Un grupo funcional principal de los ocho más frecuentes</li>
              <li>Un doble o un triple enlace</li>
              <li>Sustituyentes alquilo, halógenos, fenilo y nitro</li>
            </ul>
          </div>
          <div className={styles.alcanceColumna}>
            <h3>No cubre</h3>
            <ul>
              <li>Compuestos cíclicos y aromáticos como cadena principal</li>
              <li>Varios grupos funcionales a la vez (prefijos hidroxi-, oxo-, amino-)</li>
              <li>
                Estereoquímica: isomería <em>cis/trans</em>, E/Z, R/S
              </li>
              <li>Éteres, ésteres y sales orgánicas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════ CONTENIDO EDUCATIVO ══════════ */}
      <EducationalSection
        icon="⚗️"
        title="Cómo se nombra un compuesto orgánico"
        subtitle="El orden de las reglas, los errores típicos y cómo detectarlos"
      >
        <section className={styles.introSection}>
          <h2>Nombrar es aplicar cuatro reglas en orden</h2>
          <p>
            La nomenclatura orgánica tiene fama de memorística, pero casi todo sale de un
            procedimiento corto y siempre igual: localizar la cadena más larga, ver qué grupo manda,
            numerar por el extremo que dé los números más bajos y citar los sustituyentes por orden
            alfabético. Lo que cambia de un ejercicio a otro no son las reglas, sino{' '}
            <strong>cuál de ellas decide</strong> en ese caso concreto.
          </p>
          <p>
            Esa es la parte que esta herramienta hace visible. No se limita a devolver el nombre:
            dice qué criterio ha desempatado. Cuando se ve que en una molécula manda el grupo
            funcional y en la siguiente manda el doble enlace, la jerarquía deja de ser una lista que
            memorizar y pasa a ser algo que se reconoce a simple vista.
          </p>
        </section>

        <section className={styles.comparativaSection}>
          <h2>Prioridad de los grupos funcionales</h2>
          <p className={styles.comparativaSubtitle}>
            El grupo más prioritario da el sufijo y fija la numeración. Los demás pasan a prefijo.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Prioridad</th>
                  <th>Grupo</th>
                  <th>Sufijo</th>
                  <th>Como prefijo</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1</strong></td>
                  <td>Ácido carboxílico —COOH</td>
                  <td>-oico</td>
                  <td>carboxi-</td>
                  <td>ácido butanoico</td>
                </tr>
                <tr>
                  <td><strong>2</strong></td>
                  <td>Amida —CONH₂</td>
                  <td>-amida</td>
                  <td>carbamoil-</td>
                  <td>butanamida</td>
                </tr>
                <tr>
                  <td><strong>3</strong></td>
                  <td>Nitrilo —C≡N</td>
                  <td>-nitrilo</td>
                  <td>ciano-</td>
                  <td>butanonitrilo</td>
                </tr>
                <tr>
                  <td><strong>4</strong></td>
                  <td>Aldehído —CHO</td>
                  <td>-al</td>
                  <td>oxo- / formil-</td>
                  <td>butanal</td>
                </tr>
                <tr>
                  <td><strong>5</strong></td>
                  <td>Cetona C=O</td>
                  <td>-ona</td>
                  <td>oxo-</td>
                  <td>butan-2-ona</td>
                </tr>
                <tr>
                  <td><strong>6</strong></td>
                  <td>Alcohol —OH</td>
                  <td>-ol</td>
                  <td>hidroxi-</td>
                  <td>butan-2-ol</td>
                </tr>
                <tr>
                  <td><strong>7</strong></td>
                  <td>Amina —NH₂</td>
                  <td>-amina</td>
                  <td>amino-</td>
                  <td>butan-2-amina</td>
                </tr>
                <tr>
                  <td><strong>—</strong></td>
                  <td>Doble y triple enlace</td>
                  <td>-eno / -ino</td>
                  <td>no aplica</td>
                  <td>but-1-eno</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.escenariosSection}>
          <h2>Cuatro situaciones donde esta herramienta desatasca</h2>
          <p className={styles.escenariosSubtitle}>
            Perfiles reales de quien llega buscando cómo nombrar un compuesto.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📝</span>
                <h3>Secundaria: los primeros alcanos ramificados</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Te dan un esqueleto con dos metilos y dudas entre las posiciones 2,4 y 3,5. Montándolo
                aquí ves los dos conjuntos comparados y por qué gana uno.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Atajo:</strong> escribe siempre los dos conjuntos de localizadores antes de
                decidir. La comparación se hace número a número, no sumando.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
                <h3>Preparatoria: grupo funcional contra insaturación</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Una molécula con un —OH y un doble enlace en extremos opuestos parece ambigua. No lo
                es: el alcohol manda y el doble enlace se conforma con el número que quede.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> prueba el ejemplo «grupo funcional contra insaturación» y
                fíjate en cómo el doble enlace acaba con un localizador alto sin que sea un error.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✅</span>
                <h3>Corregir ejercicios ya hechos</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Tienes la hoja resuelta y quieres comprobarla sin esperar a clase. El modo «nombre →
                molécula» acepta lo que escribiste y dice si el nombre correcto era otro.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Ojo:</strong> que un nombre se entienda no significa que esté bien. La
                herramienta distingue «se entiende» de «es correcto».
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <h3>Preparar ejercicios para el aula</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Necesitas moléculas donde el desempate lo decida un criterio concreto. Aquí puedes
                fabricarlas: mueves el grupo y ves al instante qué regla pasa a mandar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Idea:</strong> los casos más formativos son los simétricos, donde los dos
                sentidos dan lo mismo y el nombre no cambia.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Por dónde empiezo a numerar?</p>
              <p className={styles.faqAnswer}>
                Por el extremo que dé el número más bajo al grupo funcional principal. Si no hay
                grupo funcional, manda la insaturación. Si tampoco la hay, gana el conjunto de
                localizadores de sustituyentes más bajo, comparado uno a uno. Y si sigue el empate,
                decide el orden alfabético.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Hexan-2-ol o 2-hexanol?</p>
              <p className={styles.faqAnswer}>
                Ambos designan el mismo compuesto. Hexan-2-ol es la forma que recomienda la IUPAC
                desde 2013, con el localizador pegado al sufijo al que se refiere. 2-hexanol es la
                clásica y sigue siendo mayoritaria en muchos libros, así que conviene reconocer las
                dos. Esta herramienta muestra ambas cuando existen.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Los prefijos di- y tri- cuentan para alfabetizar?</p>
              <p className={styles.faqAnswer}>
                No. En 4-etil-2,3-dimetilhexano el etilo va primero porque se alfabetiza por «etil» y
                «metil», ignorando el «di-». El prefijo terc- tampoco cuenta, pero iso- sí: isopropil
                alfabetiza por la i.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>
                ¿Por qué avisa cuando pongo un sustituyente en el extremo?
              </p>
              <p className={styles.faqAnswer}>
                Porque un radical con carbonos colgando del primer o del último carbono alarga la
                cadena en lugar de ramificarla. Si puedes recorrer más carbonos seguidos, esa es la
                cadena principal. Es el origen del clásico «2-etilbutano», que en realidad es
                3-metilpentano.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Puede un doble enlace ganarle a un alcohol?</p>
              <p className={styles.faqAnswer}>
                No. Los enlaces múltiples nunca llevan el sufijo si hay un grupo funcional
                prioritario: se quedan en el infijo -en- o -in-. Sí ganan a los sustituyentes, así
                que en un hidrocarburo ramificado el doble enlace fija la numeración.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Por qué no puedo poner una cetona en el carbono 1?</p>
              <p className={styles.faqAnswer}>
                Porque un C=O en un carbono terminal lleva además un hidrógeno, y ese grupo es un
                aldehído, no una cetona. La cetona exige que el carbonilo esté entre dos carbonos, de
                ahí que haga falta una cadena de tres carbonos como mínimo.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guiaSection}>
          <h2>Guía paso a paso</h2>
          <p className={styles.guiaSubtitle}>El procedimiento completo, en el orden en que se aplica.</p>
          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Busca la cadena más larga</h3>
                <p>
                  Recorre la molécula por todos los caminos posibles y quédate con el que tenga más
                  carbonos seguidos. Si hay empate, elige la que tenga más ramificaciones. Esa cadena
                  da la raíz del nombre.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Identifica el grupo funcional principal</h3>
                <p>
                  Consulta la tabla de prioridad: el más alto lleva el sufijo. Si conviven un ácido y
                  un alcohol, manda el ácido y el alcohol pasa a prefijo hidroxi-.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Numera por el extremo correcto</h3>
                <p>
                  Prueba los dos sentidos y aplica los criterios en orden: grupo funcional,
                  insaturación, conjunto de localizadores, orden alfabético. En cuanto uno decide, se
                  para; no se pasa al siguiente.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Nombra los sustituyentes</h3>
                <p>
                  Agrupa los repetidos con di-, tri- o tetra-, escribe sus localizadores separados por
                  comas y ordena los bloques alfabéticamente, ignorando los multiplicadores.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Monta el nombre y revísalo</h3>
                <p>
                  Prefijos, raíz, infijo de saturación y sufijo, en ese orden. Repasa que cada
                  localizador esté pegado a lo que numera y que no queden sustituyentes en los
                  extremos: eso último delataría una cadena principal mal elegida.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.tipsSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✏️</span>
              <h3>Numera siempre en los dos sentidos</h3>
              <p>
                Escribe las dos series de localizadores antes de decidir. La mayoría de errores nacen
                de numerar por costumbre de izquierda a derecha.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <h3>Cuenta enlaces, no letras</h3>
              <p>
                Antes de dar por buena una estructura, comprueba que ningún carbono supera cuatro
                enlaces. Es la comprobación que más errores de formulación caza.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📖</span>
              <h3>Aprende a leer las dos formas</h3>
              <p>
                Los libros conviven con las dos convenciones. Saber traducir 2-hexanol a hexan-2-ol
                evita bloqueos cuando el enunciado usa la que no practicaste.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h3>Practica en los dos sentidos</h3>
              <p>
                Nombrar y formular son la misma competencia vista del derecho y del revés. Alterna
                los dos modos: lo que se resiste en uno suele aclararse en el otro.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <h2>
            <span aria-hidden="true">⚠️</span> Errores frecuentes que cuestan puntos
          </h2>
          <ul className={styles.warningList}>
            <li>
              <strong>Elegir una cadena principal corta.</strong> Si aparece un etilo o un propilo en
              un extremo, casi seguro que había una cadena más larga sin ver.
            </li>
            <li>
              <strong>Numerar por donde cae mejor a la vista.</strong> El sentido no lo decide el
              dibujo: lo deciden los criterios, y en orden.
            </li>
            <li>
              <strong>Ordenar los sustituyentes por su localizador.</strong> Se citan por orden
              alfabético; el número solo dice dónde están.
            </li>
            <li>
              <strong>Contar el di- o el tri- para alfabetizar.</strong> Los multiplicadores no
              alfabetizan, pero iso- sí forma parte del nombre.
            </li>
            <li>
              <strong>Dar el sufijo al doble enlace habiendo grupo funcional.</strong> La insaturación
              nunca gana a un grupo de la tabla de prioridad.
            </li>
            <li>
              <strong>Colocar una cetona en un extremo.</strong> Ese grupo es un aldehído y cambia
              tanto el sufijo como la numeración.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('nombrador-compuestos-organicos')} />

      <ShareCard appName="nombrador-compuestos-organicos" />

      <Footer appName="nombrador-compuestos-organicos" />
    </div>
  );
}

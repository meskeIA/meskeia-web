'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './AjustarEcuacionesQuimicas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
interface Especie {
  formula: string;
  atomos: Record<string, number>;
  carga: number;
}

interface Frac {
  n: number;
  d: number;
}

interface ComprobacionElemento {
  elemento: string;
  izq: number;
  der: number;
}

interface ResultadoAjuste {
  reactivos: Especie[];
  productos: Especie[];
  coeficientes: number[];
  comprobacion: ComprobacionElemento[];
  cargaIzq: number;
  cargaDer: number;
}

interface AsignacionEO {
  elemento: string;
  atomos: number;
  eo: number | null;
  regla: string;
}

interface ResultadoOxidacion {
  especie: Especie;
  asignaciones: AsignacionEO[];
  incompleto: boolean;
  suma: number;
  hidrato: boolean;
}

type Terminos = Map<string, number>;
type Medio = 'acido' | 'basico';

interface PasoSemi {
  titulo: string;
  ecuacion: string;
  explicacion: string;
}

interface SemiResultado {
  izq: Terminos;
  der: Terminos;
  electrones: number;
  tipo: 'oxidación' | 'reducción';
  especieInicial: string;
  especieFinal: string;
  pasos: PasoSemi[];
}

interface ResultadoRedox {
  semiA: SemiResultado;
  semiB: SemiResultado;
  factorA: number;
  factorB: number;
  globalIzq: Terminos;
  globalDer: Terminos;
  comprobacion: ComprobacionElemento[];
  cargaIzq: number;
  cargaDer: number;
  oxidante: string;
  reductor: string;
}

type Pestana = 'ajustar' | 'oxidacion' | 'redox';

// ============================================
// DATOS QUÍMICOS
// ============================================
const SIMBOLOS = new Set([
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
  'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
  'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu',
  'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn',
  'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr',
  'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og',
]);

const ALCALINOS = new Set(['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']);
const ALCALINOTERREOS = new Set(['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra']);

const METALES = new Set([
  ...ALCALINOS, ...ALCALINOTERREOS,
  'Al', 'Ga', 'In', 'Sn', 'Tl', 'Pb', 'Bi', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
  'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir',
  'Pt', 'Au', 'Hg', 'Th', 'U',
]);

const PEROXIDOS = new Set(['H2O2', 'Na2O2', 'K2O2', 'Li2O2', 'BaO2', 'CaO2', 'MgO2', 'SrO2', 'ZnO2']);
const SUPEROXIDOS = new Set(['KO2', 'NaO2', 'RbO2', 'CsO2']);

// Iones poliatómicos habituales: permiten resolver sales de metales con varios
// estados de oxidación posibles (CuSO4, FeSO4, Ca(NO3)2…), donde no basta con
// las reglas fijas del oxígeno y el hidrógeno.
const ANIONES_POLIATOMICOS: { nombre: string; atomos: Record<string, number>; carga: number }[] = [
  { nombre: 'sulfato', atomos: { S: 1, O: 4 }, carga: -2 },
  { nombre: 'sulfito', atomos: { S: 1, O: 3 }, carga: -2 },
  { nombre: 'nitrato', atomos: { N: 1, O: 3 }, carga: -1 },
  { nombre: 'nitrito', atomos: { N: 1, O: 2 }, carga: -1 },
  { nombre: 'carbonato', atomos: { C: 1, O: 3 }, carga: -2 },
  { nombre: 'fosfato', atomos: { P: 1, O: 4 }, carga: -3 },
  { nombre: 'clorato', atomos: { Cl: 1, O: 3 }, carga: -1 },
  { nombre: 'perclorato', atomos: { Cl: 1, O: 4 }, carga: -1 },
  { nombre: 'hipoclorito', atomos: { Cl: 1, O: 1 }, carga: -1 },
  { nombre: 'permanganato', atomos: { Mn: 1, O: 4 }, carga: -1 },
  { nombre: 'dicromato', atomos: { Cr: 2, O: 7 }, carga: -2 },
  { nombre: 'cromato', atomos: { Cr: 1, O: 4 }, carga: -2 },
  { nombre: 'hidróxido', atomos: { O: 1, H: 1 }, carga: -1 },
  { nombre: 'cianuro', atomos: { C: 1, N: 1 }, carga: -1 },
];

const EJEMPLOS_AJUSTE: { etiqueta: string; ecuacion: string; nota: string }[] = [
  { etiqueta: 'Combustión del propano', ecuacion: 'C3H8 + O2 -> CO2 + H2O', nota: 'El clásico: ajusta C, luego H y deja el O para el final' },
  { etiqueta: 'Síntesis del amoniaco', ecuacion: 'N2 + H2 -> NH3', nota: 'Proceso Haber-Bosch' },
  { etiqueta: 'Fotosíntesis', ecuacion: 'CO2 + H2O -> C6H12O6 + O2', nota: 'Coeficientes grandes: el tanteo se complica' },
  { etiqueta: 'Neutralización con hidróxido de calcio', ecuacion: 'Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O', nota: 'Con paréntesis y grupos poliatómicos' },
  { etiqueta: 'Permanganato y hierro (iónica)', ecuacion: 'MnO4^- + Fe^2+ + H^+ -> Mn^2+ + Fe^3+ + H2O', nota: 'Ecuación iónica: también se conserva la carga' },
  { etiqueta: 'Tostación de la pirita', ecuacion: 'FeS2 + O2 -> Fe2O3 + SO2', nota: 'Dos elementos cambian a la vez' },
];

const EJEMPLOS_OXIDACION: string[] = ['KMnO4', 'Cr2O7^2-', 'H2SO4', 'CuSO4', 'NaH', 'H2O2', 'Fe3O4', 'NH4^+', 'HClO3'];

const EJEMPLOS_REDOX: { etiqueta: string; a: string; b: string; medio: Medio; nota: string }[] = [
  {
    etiqueta: 'Permanganato + hierro(II)',
    a: 'MnO4^- -> Mn^2+',
    b: 'Fe^2+ -> Fe^3+',
    medio: 'acido',
    nota: 'La valoración redox más habitual del laboratorio',
  },
  {
    etiqueta: 'Dicromato + yoduro',
    a: 'Cr2O7^2- -> Cr^3+',
    b: 'I^- -> I2',
    medio: 'acido',
    nota: 'Dos átomos de cromo por ion: hay que ajustar la especie principal',
  },
  {
    etiqueta: 'Cobre + ácido nítrico',
    a: 'NO3^- -> NO',
    b: 'Cu -> Cu^2+',
    medio: 'acido',
    nota: 'El ataque del ácido nítrico al cobre metálico',
  },
  {
    etiqueta: 'Permanganato + sulfito (medio básico)',
    a: 'MnO4^- -> MnO2',
    b: 'SO3^2- -> SO4^2-',
    medio: 'basico',
    nota: 'En medio básico no puede quedar H⁺ en la ecuación final',
  },
  {
    etiqueta: 'Agua oxigenada + permanganato',
    a: 'MnO4^- -> Mn^2+',
    b: 'H2O2 -> O2',
    medio: 'acido',
    nota: 'Aquí el elemento que se oxida es el propio oxígeno',
  },
  {
    etiqueta: 'Dismutación del cloro (medio básico)',
    a: 'Cl2 -> Cl^-',
    b: 'Cl2 -> ClO^-',
    medio: 'basico',
    nota: 'La misma especie se oxida y se reduce a la vez',
  },
];

// ============================================
// NORMALIZACIÓN Y FORMATO
// ============================================
const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉';
const SUPERINDICES = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function normalizarTexto(texto: string): string {
  let s = texto;
  for (let i = 0; i < 10; i++) {
    s = s.split(SUBINDICES[i]).join(String(i));
    s = s.split(SUPERINDICES[i]).join(String(i));
  }
  s = s.replace(/⁺/g, '+').replace(/[⁻–—−]/g, '-');
  s = s.replace(/[→⟶➔⇒]/g, '->').replace(/[⇌⇄]/g, '->');
  s = s.replace(/=>/g, '->').replace(/-->/g, '->');
  return s;
}

/** Convierte una fórmula canónica en su forma tipográfica: H2O → H₂O, SO4^2- → SO₄²⁻ */
function bonita(formula: string): string {
  if (formula === 'e^-') return 'e⁻';
  const partes = formula.split('^');
  const cuerpo = partes[0].replace(/\d/g, d => SUBINDICES[Number(d)]);
  if (partes.length === 1) return cuerpo;
  const carga = partes[1]
    .replace(/\d/g, d => SUPERINDICES[Number(d)])
    .replace(/\+/g, '⁺')
    .replace(/-/g, '⁻');
  return cuerpo + carga;
}

function formatearTermino(formula: string, coef: number): string {
  const c = coef === 1 ? '' : `${coef} `;
  return `${c}${bonita(formula)}`;
}

function formatearLado(terminos: Terminos): string {
  const partes: string[] = [];
  terminos.forEach((coef, formula) => {
    if (coef > 0) partes.push(formatearTermino(formula, coef));
  });
  return partes.length > 0 ? partes.join(' + ') : '—';
}

function formatearEO(eo: number): string {
  if (eo === 0) return '0';
  const signo = eo > 0 ? '+' : '−';
  const abs = Math.abs(eo);
  if (Number.isInteger(abs)) return `${signo}${abs}`;
  // Los valores medios se leen mejor como fracción: +8/3 en lugar de +2,67
  for (let d = 2; d <= 8; d++) {
    const n = abs * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return `${signo}${Math.round(n)}/${d}`;
  }
  return `${signo}${formatNumber(abs, 2)}`;
}

// ============================================
// PARSER DE FÓRMULAS
// ============================================
function parseCuerpo(cuerpo: string): Record<string, number> {
  const pila: Record<string, number>[] = [{}];
  let i = 0;

  while (i < cuerpo.length) {
    const c = cuerpo[i];

    if (c === '(' || c === '[') {
      pila.push({});
      i++;
    } else if (c === ')' || c === ']') {
      if (pila.length === 1) throw new Error('Hay un paréntesis de cierre sin abrir.');
      i++;
      let num = '';
      while (i < cuerpo.length && /\d/.test(cuerpo[i])) { num += cuerpo[i]; i++; }
      const mult = num ? parseInt(num, 10) : 1;
      const grupo = pila.pop() as Record<string, number>;
      const destino = pila[pila.length - 1];
      Object.entries(grupo).forEach(([el, n]) => {
        destino[el] = (destino[el] ?? 0) + n * mult;
      });
    } else if (/[A-Z]/.test(c)) {
      let el = c;
      i++;
      while (i < cuerpo.length && /[a-z]/.test(cuerpo[i])) { el += cuerpo[i]; i++; }
      if (!SIMBOLOS.has(el)) throw new Error(`«${el}» no es un símbolo químico válido.`);
      let num = '';
      while (i < cuerpo.length && /\d/.test(cuerpo[i])) { num += cuerpo[i]; i++; }
      const n = num ? parseInt(num, 10) : 1;
      const destino = pila[pila.length - 1];
      destino[el] = (destino[el] ?? 0) + n;
    } else {
      throw new Error(`El carácter «${c}» no se puede interpretar en una fórmula.`);
    }
  }

  if (pila.length !== 1) throw new Error('Falta cerrar algún paréntesis.');
  return pila[0];
}

function parseEspecie(entrada: string): Especie {
  let s = normalizarTexto(entrada).replace(/\s+/g, '');
  if (!s) throw new Error('Falta una fórmula.');

  // Un coeficiente escrito por el usuario se ignora: los calcula la herramienta
  s = s.replace(/^\d+(?=[A-Z(])/, '');

  // Carga: SO4^2-, Fe3+, Na+, Ca++
  let carga = 0;
  for (;;) {
    const m = s.match(/\^?(\d*)([+-])$/);
    if (!m) break;
    const n = m[1] ? parseInt(m[1], 10) : 1;
    carga += m[2] === '+' ? n : -n;
    s = s.slice(0, m.index);
    if (m[1]) break;
  }
  s = s.replace(/\^$/, '');

  if (!s) throw new Error('Falta la fórmula antes de la carga.');

  // Hidratos: CuSO4·5H2O
  const atomos: Record<string, number> = {};
  s.split(/[·.*]/).forEach(parte => {
    if (!parte) return;
    const m = parte.match(/^(\d+)/);
    const mult = m ? parseInt(m[1], 10) : 1;
    const cuerpo = m ? parte.slice(m[1].length) : parte;
    Object.entries(parseCuerpo(cuerpo)).forEach(([el, n]) => {
      atomos[el] = (atomos[el] ?? 0) + n * mult;
    });
  });

  if (Object.keys(atomos).length === 0) throw new Error('La fórmula no contiene ningún elemento.');

  const cuerpoCanonico = s.replace(/[·.*]/g, '·');
  const formula = carga === 0
    ? cuerpoCanonico
    : `${cuerpoCanonico}^${Math.abs(carga) === 1 ? '' : Math.abs(carga)}${carga > 0 ? '+' : '-'}`;

  return { formula, atomos, carga };
}

/**
 * Separa las especies de un lado de la ecuación distinguiendo el «+» que suma
 * especies del «+» que forma parte de la carga de un ion.
 */
function dividirEspecies(lado: string): string[] {
  const s = normalizarTexto(lado);
  const especies: string[] = [];
  let actual = '';

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== '+') { actual += c; continue; }

    const anterior = i > 0 ? s[i - 1] : '';
    const resto = s.slice(i + 1);
    const siguienteNoEspacio = resto.replace(/^\s+/, '')[0] ?? '';

    const esCarga =
      // «Fe^2+» o «SO4^-»: el signo va tras el marcador de carga
      /\^\d*$/.test(actual) ||
      // final de cadena: «Na+»
      resto.trim() === '' ||
      // «Na+ + H2O»: el separador real es el siguiente «+»
      (anterior !== ' ' && siguienteNoEspacio === '+') ||
      // «Na+ -> ...»
      (anterior !== ' ' && siguienteNoEspacio === '-' && resto.replace(/^\s+/, '').startsWith('->'));

    if (esCarga) {
      actual += c;
    } else {
      especies.push(actual);
      actual = '';
    }
  }
  especies.push(actual);

  return especies.map(e => e.trim()).filter(Boolean);
}

// ============================================
// ARITMÉTICA EXACTA CON FRACCIONES
// ============================================
function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { const t = y; y = x % y; x = t; }
  return x || 1;
}

function mcm(a: number, b: number): number {
  return Math.abs(a * b) / mcd(a, b);
}

function fr(n: number, d = 1): Frac {
  if (d === 0) throw new Error('División por cero al resolver el sistema.');
  const signo = d < 0 ? -1 : 1;
  const g = mcd(n, d);
  return { n: (signo * n) / g, d: (signo * d) / g };
}

const frSuma = (a: Frac, b: Frac): Frac => fr(a.n * b.d + b.n * a.d, a.d * b.d);
const frResta = (a: Frac, b: Frac): Frac => fr(a.n * b.d - b.n * a.d, a.d * b.d);
const frMult = (a: Frac, b: Frac): Frac => fr(a.n * b.n, a.d * b.d);
const frDiv = (a: Frac, b: Frac): Frac => fr(a.n * b.d, a.d * b.n);
const frCero = (a: Frac): boolean => a.n === 0;

// ============================================
// AJUSTE DE ECUACIONES (espacio nulo de la matriz)
// ============================================
function ajustarEcuacion(reactivos: Especie[], productos: Especie[]): number[] {
  const especies = [...reactivos, ...productos];
  const nCols = especies.length;
  if (nCols < 2) throw new Error('La ecuación necesita al menos una especie a cada lado.');

  const elementos = Array.from(new Set(especies.flatMap(e => Object.keys(e.atomos))));

  const filas: Frac[][] = elementos.map(el =>
    especies.map((esp, j) => fr((j < reactivos.length ? 1 : -1) * (esp.atomos[el] ?? 0)))
  );

  if (especies.some(e => e.carga !== 0)) {
    filas.push(especies.map((esp, j) => fr((j < reactivos.length ? 1 : -1) * esp.carga)));
  }

  // Reducción por filas (forma escalonada reducida)
  const pivotes: number[] = [];
  let filaActual = 0;
  for (let col = 0; col < nCols && filaActual < filas.length; col++) {
    let p = -1;
    for (let r = filaActual; r < filas.length; r++) {
      if (!frCero(filas[r][col])) { p = r; break; }
    }
    if (p === -1) continue;

    const tmp = filas[filaActual];
    filas[filaActual] = filas[p];
    filas[p] = tmp;

    const pivote = filas[filaActual][col];
    filas[filaActual] = filas[filaActual].map(x => frDiv(x, pivote));

    for (let r = 0; r < filas.length; r++) {
      if (r === filaActual || frCero(filas[r][col])) continue;
      const factor = filas[r][col];
      filas[r] = filas[r].map((x, c) => frResta(x, frMult(factor, filas[filaActual][c])));
    }

    pivotes.push(col);
    filaActual++;
  }

  const libres: number[] = [];
  for (let c = 0; c < nCols; c++) {
    if (!pivotes.includes(c)) libres.push(c);
  }

  if (libres.length === 0) {
    throw new Error('La ecuación no se puede ajustar: revisa las fórmulas, porque no hay ninguna combinación de coeficientes que conserve todos los átomos.');
  }
  if (libres.length > 1) {
    throw new Error('La ecuación admite infinitas soluciones distintas: contiene más de una reacción independiente. Sepárala en reacciones simples y ajusta cada una.');
  }

  // Variable libre = 1; los pivotes se despejan
  const solucion: Frac[] = Array.from({ length: nCols }, () => fr(0));
  solucion[libres[0]] = fr(1);
  pivotes.forEach((col, i) => {
    solucion[col] = frMult(fr(-1), filas[i][libres[0]]);
  });

  // Paso a enteros mínimos
  let multiplicador = 1;
  solucion.forEach(f => { multiplicador = mcm(multiplicador, f.d); });
  let enteros = solucion.map(f => (f.n * multiplicador) / f.d);

  let divisor = 0;
  enteros.forEach(v => { divisor = mcd(divisor, v); });
  if (divisor > 1) enteros = enteros.map(v => v / divisor);

  if (enteros.every(v => v < 0)) enteros = enteros.map(v => -v);

  if (enteros.some(v => v <= 0)) {
    throw new Error('No existe una solución con todos los coeficientes positivos: comprueba que las especies estén en el lado correcto de la flecha.');
  }

  return enteros;
}

function resolverAjuste(texto: string): ResultadoAjuste {
  const normalizado = normalizarTexto(texto);
  const partes = normalizado.split(/->|=/);
  if (partes.length !== 2) {
    throw new Error('Escribe la ecuación con una sola flecha: reactivos -> productos.');
  }

  const reactivos = dividirEspecies(partes[0]).map(parseEspecie);
  const productos = dividirEspecies(partes[1]).map(parseEspecie);

  if (reactivos.length === 0 || productos.length === 0) {
    throw new Error('Falta alguna especie a un lado de la flecha.');
  }

  const coeficientes = ajustarEcuacion(reactivos, productos);

  const elementos = Array.from(new Set([...reactivos, ...productos].flatMap(e => Object.keys(e.atomos))));
  const comprobacion: ComprobacionElemento[] = elementos.map(el => ({
    elemento: el,
    izq: reactivos.reduce((acc, esp, i) => acc + coeficientes[i] * (esp.atomos[el] ?? 0), 0),
    der: productos.reduce((acc, esp, i) => acc + coeficientes[reactivos.length + i] * (esp.atomos[el] ?? 0), 0),
  }));

  const cargaIzq = reactivos.reduce((acc, esp, i) => acc + coeficientes[i] * esp.carga, 0);
  const cargaDer = productos.reduce((acc, esp, i) => acc + coeficientes[reactivos.length + i] * esp.carga, 0);

  return { reactivos, productos, coeficientes, comprobacion, cargaIzq, cargaDer };
}

// ============================================
// NÚMEROS DE OXIDACIÓN
// ============================================
function calcularOxidacion(entrada: string): ResultadoOxidacion {
  // El agua de hidratación no altera los números de oxidación: se analiza la sal anhidra
  const trozos = normalizarTexto(entrada).split(/[·*]/).filter(Boolean);
  const hidrato = trozos.length > 1;
  const especie = parseEspecie(trozos[0]);
  const elementos = Object.keys(especie.atomos);
  const cuerpo = especie.formula.split('^')[0];

  if (elementos.length === 1) {
    const el = elementos[0];
    const eo = especie.carga / especie.atomos[el];
    return {
      especie,
      asignaciones: [{
        elemento: el,
        atomos: especie.atomos[el],
        eo,
        regla: especie.carga === 0
          ? 'Elemento libre o sustancia simple: su número de oxidación es 0'
          : 'Ion monoatómico: su número de oxidación coincide con la carga',
      }],
      incompleto: false,
      suma: especie.carga,
      hidrato,
    };
  }

  const asignadas: Record<string, { eo: number; regla: string }> = {};

  if (especie.atomos.F) {
    asignadas.F = { eo: -1, regla: 'El flúor, el elemento más electronegativo, actúa siempre con −1' };
  }

  elementos.forEach(el => {
    if (asignadas[el]) return;
    if (ALCALINOS.has(el)) asignadas[el] = { eo: 1, regla: 'Metal alcalino (grupo 1): siempre +1 en sus compuestos' };
    else if (ALCALINOTERREOS.has(el)) asignadas[el] = { eo: 2, regla: 'Metal alcalinotérreo (grupo 2): siempre +2 en sus compuestos' };
    else if (el === 'Al') asignadas[el] = { eo: 3, regla: 'El aluminio actúa con +3 en sus compuestos' };
    else if (el === 'Zn') asignadas[el] = { eo: 2, regla: 'El cinc actúa con +2 en sus compuestos' };
    else if (el === 'Ag') asignadas[el] = { eo: 1, regla: 'La plata actúa con +1 en sus compuestos' };
  });

  if (especie.atomos.H && !asignadas.H) {
    const acompanantes = elementos.filter(e => e !== 'H');
    const soloMetales = acompanantes.length > 0 && acompanantes.every(e => METALES.has(e));
    asignadas.H = soloMetales
      ? { eo: -1, regla: 'Hidruro metálico: unido solo a metales, el hidrógeno actúa con −1' }
      : { eo: 1, regla: 'El hidrógeno actúa con +1 salvo en los hidruros metálicos' };
  }

  if (especie.atomos.O && !asignadas.O) {
    if (PEROXIDOS.has(cuerpo)) {
      asignadas.O = { eo: -1, regla: 'Peróxido: el enlace O–O hace que el oxígeno actúe con −1' };
    } else if (SUPEROXIDOS.has(cuerpo)) {
      asignadas.O = { eo: -0.5, regla: 'Superóxido: el oxígeno presenta el valor fraccionario −1/2' };
    } else if (especie.atomos.F) {
      asignadas.O = { eo: 2, regla: 'Unido al flúor, el oxígeno actúa con valor positivo' };
    } else {
      asignadas.O = { eo: -2, regla: 'El oxígeno actúa con −2 salvo en peróxidos, superóxidos y compuestos con flúor' };
    }
  }

  const halogenos = ['Cl', 'Br', 'I'];
  halogenos.forEach(hal => {
    if (!especie.atomos[hal] || asignadas[hal]) return;
    const hayMasElectronegativo = Boolean(especie.atomos.O) || Boolean(especie.atomos.F)
      || halogenos.slice(0, halogenos.indexOf(hal)).some(otro => especie.atomos[otro]);
    if (!hayMasElectronegativo) {
      asignadas[hal] = { eo: -1, regla: 'Halógeno sin oxígeno ni un halógeno más electronegativo presente: actúa con −1' };
    }
  });

  let pendientes = elementos.filter(el => !(el in asignadas));
  let sumaConocida = Object.entries(asignadas)
    .reduce((acc, [el, v]) => acc + v.eo * (especie.atomos[el] ?? 0), 0);

  // Sal de un metal con un ion poliatómico: la carga del ion resuelve las dos incógnitas
  if (pendientes.length === 2) {
    for (const anion of ANIONES_POLIATOMICOS) {
      const enAnion = pendientes.filter(el => el in anion.atomos);
      if (enAnion.length !== 1) continue;

      const metal = pendientes.find(el => !(el in anion.atomos)) as string;
      if (!METALES.has(metal)) continue;

      for (let k = 1; k <= 6; k++) {
        // El resto tras retirar k iones debe ser exactamente el metal
        const resto: Record<string, number> = { ...especie.atomos };
        let encaja = true;
        Object.entries(anion.atomos).forEach(([el, n]) => {
          resto[el] = (resto[el] ?? 0) - n * k;
          if (resto[el] < 0) encaja = false;
        });
        if (!encaja) continue;
        const sobrantes = Object.keys(resto).filter(el => resto[el] > 0);
        if (sobrantes.length !== 1 || sobrantes[0] !== metal) continue;

        const central = enAnion[0];
        const conocidoEnAnion = Object.entries(anion.atomos)
          .filter(([el]) => el !== central)
          .reduce((acc, [el, n]) => acc + (asignadas[el]?.eo ?? 0) * n, 0);

        asignadas[central] = {
          eo: (anion.carga - conocidoEnAnion) / anion.atomos[central],
          regla: `Forma parte del ion ${anion.nombre} (carga ${anion.carga}): se despeja dentro del propio ion`,
        };
        asignadas[metal] = {
          eo: (especie.carga - k * anion.carga) / resto[metal],
          regla: `El compuesto contiene ${k > 1 ? `${k} iones` : 'un ion'} ${anion.nombre}, cuya carga obliga al metal a compensarla`,
        };
        break;
      }
      if (asignadas[metal]) break;
    }

    pendientes = elementos.filter(el => !(el in asignadas));
    sumaConocida = Object.entries(asignadas)
      .reduce((acc, [el, v]) => acc + v.eo * (especie.atomos[el] ?? 0), 0);
  }

  let incompleto = false;
  if (pendientes.length === 1) {
    const el = pendientes[0];
    asignadas[el] = {
      eo: (especie.carga - sumaConocida) / especie.atomos[el],
      regla: 'Se despeja imponiendo que la suma de todos los números de oxidación sea igual a la carga de la especie',
    };
  } else if (pendientes.length > 1) {
    incompleto = true;
  }

  const asignaciones: AsignacionEO[] = elementos.map(el => ({
    elemento: el,
    atomos: especie.atomos[el],
    eo: asignadas[el]?.eo ?? null,
    regla: asignadas[el]?.regla ?? 'No puede determinarse solo con la fórmula: hacen falta datos de la estructura',
  }));

  const suma = asignaciones.reduce((acc, a) => acc + (a.eo ?? 0) * a.atomos, 0);

  return { especie, asignaciones, incompleto, suma, hidrato };
}

// ============================================
// MÉTODO DEL ION-ELECTRÓN
// ============================================
function anadir(terminos: Terminos, formula: string, coef: number): void {
  if (coef <= 0) return;
  terminos.set(formula, (terminos.get(formula) ?? 0) + coef);
}

function copiaTerminos(t: Terminos): Terminos {
  return new Map(t);
}

function ecuacionDe(izq: Terminos, der: Terminos): string {
  return `${formatearLado(izq)} → ${formatearLado(der)}`;
}

function ajustarSemirreaccion(entrada: string, medio: Medio): SemiResultado {
  const partes = normalizarTexto(entrada).split(/->|=/);
  if (partes.length !== 2) {
    throw new Error(`Escribe la semirreacción con una flecha: por ejemplo «Fe^2+ -> Fe^3+». Recibido: «${entrada}»`);
  }

  const inicialLista = dividirEspecies(partes[0]);
  const finalLista = dividirEspecies(partes[1]);
  if (inicialLista.length !== 1 || finalLista.length !== 1) {
    throw new Error('Cada semirreacción debe llevar una sola especie a cada lado de la flecha.');
  }

  const a = parseEspecie(inicialLista[0]);
  const b = parseEspecie(finalLista[0]);

  const pasos: PasoSemi[] = [];

  // 1 — Ajuste del elemento que cambia (todos menos H y O)
  const principales = Array.from(new Set([...Object.keys(a.atomos), ...Object.keys(b.atomos)]))
    .filter(el => el !== 'H' && el !== 'O');

  let cA = 1;
  let cB = 1;
  if (principales.length > 0) {
    const primero = principales[0];
    const nA = a.atomos[primero] ?? 0;
    const nB = b.atomos[primero] ?? 0;
    if (nA === 0 || nB === 0) {
      throw new Error(`El elemento ${primero} solo aparece en un lado de la semirreacción: revisa las fórmulas.`);
    }
    const m = mcm(nA, nB);
    cA = m / nA;
    cB = m / nB;
    principales.slice(1).forEach(el => {
      if (cA * (a.atomos[el] ?? 0) !== cB * (b.atomos[el] ?? 0)) {
        throw new Error(`No es posible ajustar a la vez ${primero} y ${el} en la misma semirreacción.`);
      }
    });
  }

  const izq: Terminos = new Map();
  const der: Terminos = new Map();
  anadir(izq, a.formula, cA);
  anadir(der, b.formula, cB);

  pasos.push({
    titulo: 'Ajustar el elemento que cambia',
    ecuacion: ecuacionDe(izq, der),
    explicacion: principales.length > 0
      ? `Se igualan los átomos de ${principales.join(' y ')} a ambos lados, sin tocar todavía el hidrógeno ni el oxígeno.`
      : 'El elemento que cambia de estado de oxidación es el propio oxígeno, así que se pasa directamente al ajuste de átomos.',
  });

  // 2 — Oxígenos con H₂O
  const oIzq = cA * (a.atomos.O ?? 0);
  const oDer = cB * (b.atomos.O ?? 0);
  if (oIzq > oDer) anadir(der, 'H2O', oIzq - oDer);
  else if (oDer > oIzq) anadir(izq, 'H2O', oDer - oIzq);

  pasos.push({
    titulo: 'Ajustar los oxígenos con H₂O',
    ecuacion: ecuacionDe(izq, der),
    explicacion: oIzq === oDer
      ? 'Los oxígenos ya están igualados: no hace falta añadir agua.'
      : `Se añaden ${Math.abs(oIzq - oDer)} moléculas de agua al lado con menos oxígeno (el disolvente aporta el oxígeno que falta).`,
  });

  // 3 — Hidrógenos con H⁺
  const aguaIzq = izq.get('H2O') ?? 0;
  const aguaDer = der.get('H2O') ?? 0;
  const hIzq = cA * (a.atomos.H ?? 0) + 2 * aguaIzq;
  const hDer = cB * (b.atomos.H ?? 0) + 2 * aguaDer;
  if (hIzq > hDer) anadir(der, 'H^+', hIzq - hDer);
  else if (hDer > hIzq) anadir(izq, 'H^+', hDer - hIzq);

  pasos.push({
    titulo: 'Ajustar los hidrógenos con H⁺',
    ecuacion: ecuacionDe(izq, der),
    explicacion: hIzq === hDer
      ? 'Los hidrógenos ya están igualados: no hace falta añadir protones.'
      : `Se añaden ${Math.abs(hIzq - hDer)} iones H⁺ al lado con menos hidrógeno. En medio ácido el protón está disponible en la disolución.`,
  });

  // 4 — Carga con electrones
  const cargaLado = (t: Terminos): number => {
    let q = 0;
    t.forEach((coef, formula) => {
      if (formula === 'H2O') return;
      if (formula === 'H^+') { q += coef; return; }
      if (formula === 'OH^-') { q -= coef; return; }
      q += coef * parseEspecie(formula).carga;
    });
    return q;
  };

  const delta = cargaLado(izq) - cargaLado(der);
  if (delta === 0) {
    throw new Error('En esta semirreacción no hay transferencia de electrones: las dos especies tienen el mismo estado de oxidación.');
  }

  const electrones = Math.abs(delta);
  const tipo: 'oxidación' | 'reducción' = delta > 0 ? 'reducción' : 'oxidación';
  if (delta > 0) anadir(izq, 'e^-', electrones);
  else anadir(der, 'e^-', electrones);

  pasos.push({
    titulo: 'Ajustar la carga con electrones',
    ecuacion: ecuacionDe(izq, der),
    explicacion: delta > 0
      ? `La carga del lado izquierdo supera en ${electrones} unidades a la del derecho, así que se añaden ${electrones} electrones a la izquierda: la especie los gana, luego es una reducción.`
      : `La carga del lado derecho supera en ${electrones} unidades a la del izquierdo, así que se añaden ${electrones} electrones a la derecha: la especie los cede, luego es una oxidación.`,
  });

  // 5 — Medio básico: neutralizar los H⁺ con OH⁻
  if (medio === 'basico') {
    const hMasIzq = izq.get('H^+') ?? 0;
    const hMasDer = der.get('H^+') ?? 0;
    const nH = hMasIzq + hMasDer;

    if (nH > 0) {
      if (hMasIzq > 0) {
        izq.delete('H^+');
        anadir(izq, 'H2O', hMasIzq);
        anadir(der, 'OH^-', hMasIzq);
      } else {
        der.delete('H^+');
        anadir(der, 'H2O', hMasDer);
        anadir(izq, 'OH^-', hMasDer);
      }

      // Simplificar el agua que quede a ambos lados
      const comunes = Math.min(izq.get('H2O') ?? 0, der.get('H2O') ?? 0);
      if (comunes > 0) {
        const restaIzq = (izq.get('H2O') ?? 0) - comunes;
        const restaDer = (der.get('H2O') ?? 0) - comunes;
        if (restaIzq > 0) izq.set('H2O', restaIzq); else izq.delete('H2O');
        if (restaDer > 0) der.set('H2O', restaDer); else der.delete('H2O');
      }

      pasos.push({
        titulo: 'Pasar a medio básico con OH⁻',
        ecuacion: ecuacionDe(izq, der),
        explicacion: `En medio básico no puede quedar H⁺ libre: se añaden ${nH} iones OH⁻ a ambos lados. En el lado del protón, cada pareja H⁺ + OH⁻ forma una molécula de agua; después se simplifican las aguas repetidas.`,
      });
    }
  }

  return {
    izq,
    der,
    electrones,
    tipo,
    especieInicial: a.formula,
    especieFinal: b.formula,
    pasos,
  };
}

function combinarSemirreacciones(semi1: SemiResultado, semi2: SemiResultado): ResultadoRedox {
  if (semi1.tipo === semi2.tipo) {
    throw new Error(`Las dos semirreacciones son de ${semi1.tipo}. Una redox necesita una oxidación y una reducción: revisa las especies introducidas.`);
  }

  const m = mcm(semi1.electrones, semi2.electrones);
  const f1 = m / semi1.electrones;
  const f2 = m / semi2.electrones;

  const globalIzq: Terminos = new Map();
  const globalDer: Terminos = new Map();

  const volcar = (origen: Terminos, destino: Terminos, factor: number) => {
    origen.forEach((coef, formula) => {
      if (formula === 'e^-') return;
      anadir(destino, formula, coef * factor);
    });
  };

  volcar(semi1.izq, globalIzq, f1);
  volcar(semi2.izq, globalIzq, f2);
  volcar(semi1.der, globalDer, f1);
  volcar(semi2.der, globalDer, f2);

  // Simplificar especies presentes en ambos lados
  Array.from(globalIzq.keys()).forEach(formula => {
    const enDer = globalDer.get(formula);
    if (!enDer) return;
    const comun = Math.min(globalIzq.get(formula) as number, enDer);
    const restoIzq = (globalIzq.get(formula) as number) - comun;
    const restoDer = enDer - comun;
    if (restoIzq > 0) globalIzq.set(formula, restoIzq); else globalIzq.delete(formula);
    if (restoDer > 0) globalDer.set(formula, restoDer); else globalDer.delete(formula);
  });

  // Dividir por el máximo común divisor de todos los coeficientes
  let divisor = 0;
  globalIzq.forEach(c => { divisor = mcd(divisor, c); });
  globalDer.forEach(c => { divisor = mcd(divisor, c); });
  if (divisor > 1) {
    globalIzq.forEach((c, f) => globalIzq.set(f, c / divisor));
    globalDer.forEach((c, f) => globalDer.set(f, c / divisor));
  }

  // Comprobación de átomos y carga
  const contar = (t: Terminos): { atomos: Record<string, number>; carga: number } => {
    const atomos: Record<string, number> = {};
    let carga = 0;
    t.forEach((coef, formula) => {
      const esp = parseEspecie(formula);
      Object.entries(esp.atomos).forEach(([el, n]) => {
        atomos[el] = (atomos[el] ?? 0) + n * coef;
      });
      carga += esp.carga * coef;
    });
    return { atomos, carga };
  };

  const izqDatos = contar(globalIzq);
  const derDatos = contar(globalDer);
  const elementos = Array.from(new Set([...Object.keys(izqDatos.atomos), ...Object.keys(derDatos.atomos)]));

  const comprobacion: ComprobacionElemento[] = elementos.map(el => ({
    elemento: el,
    izq: izqDatos.atomos[el] ?? 0,
    der: derDatos.atomos[el] ?? 0,
  }));

  const oxidacion = semi1.tipo === 'oxidación' ? semi1 : semi2;
  const reduccion = semi1.tipo === 'reducción' ? semi1 : semi2;

  return {
    semiA: semi1,
    semiB: semi2,
    factorA: f1,
    factorB: f2,
    globalIzq,
    globalDer,
    comprobacion,
    cargaIzq: izqDatos.carga,
    cargaDer: derDatos.carga,
    oxidante: reduccion.especieInicial,
    reductor: oxidacion.especieInicial,
  };
}

// ============================================
// COMPONENTE
// ============================================
export default function AjustarEcuacionesQuimicas() {
  const [pestana, setPestana] = useState<Pestana>('ajustar');

  // Pestaña 1 — ajustar
  const [ecuacion, setEcuacion] = useState('C3H8 + O2 -> CO2 + H2O');
  const [ajuste, setAjuste] = useState<ResultadoAjuste | null>(null);
  const [errorAjuste, setErrorAjuste] = useState<string | null>(null);

  // Pestaña 2 — números de oxidación
  const [formulaEO, setFormulaEO] = useState('KMnO4');
  const [resultadoEO, setResultadoEO] = useState<ResultadoOxidacion | null>(null);
  const [errorEO, setErrorEO] = useState<string | null>(null);

  // Pestaña 3 — ion-electrón
  const [semiA, setSemiA] = useState('MnO4^- -> Mn^2+');
  const [semiB, setSemiB] = useState('Fe^2+ -> Fe^3+');
  const [medio, setMedio] = useState<Medio>('acido');
  const [redox, setRedox] = useState<ResultadoRedox | null>(null);
  const [errorRedox, setErrorRedox] = useState<string | null>(null);

  const lanzarAjuste = (texto?: string) => {
    const entrada = texto ?? ecuacion;
    try {
      setAjuste(resolverAjuste(entrada));
      setErrorAjuste(null);
    } catch (e) {
      setAjuste(null);
      setErrorAjuste(e instanceof Error ? e.message : 'No se ha podido ajustar la ecuación.');
    }
  };

  const lanzarEO = (texto?: string) => {
    const entrada = texto ?? formulaEO;
    try {
      setResultadoEO(calcularOxidacion(entrada));
      setErrorEO(null);
    } catch (e) {
      setResultadoEO(null);
      setErrorEO(e instanceof Error ? e.message : 'No se ha podido interpretar la fórmula.');
    }
  };

  const lanzarRedox = (a?: string, b?: string, m?: Medio) => {
    const entradaA = a ?? semiA;
    const entradaB = b ?? semiB;
    const entradaMedio = m ?? medio;
    try {
      const r1 = ajustarSemirreaccion(entradaA, entradaMedio);
      const r2 = ajustarSemirreaccion(entradaB, entradaMedio);
      setRedox(combinarSemirreacciones(r1, r2));
      setErrorRedox(null);
    } catch (e) {
      setRedox(null);
      setErrorRedox(e instanceof Error ? e.message : 'No se ha podido desarrollar la reacción.');
    }
  };

  const cargarEjemploRedox = (ej: typeof EJEMPLOS_REDOX[number]) => {
    setSemiA(ej.a);
    setSemiB(ej.b);
    setMedio(ej.medio);
    lanzarRedox(ej.a, ej.b, ej.medio);
  };

  const ecuacionAjustada = ajuste
    ? `${ajuste.reactivos.map((e, i) => formatearTermino(e.formula, ajuste.coeficientes[i])).join(' + ')} → ${ajuste.productos.map((e, i) => formatearTermino(e.formula, ajuste.coeficientes[ajuste.reactivos.length + i])).join(' + ')}`
    : '';

  const ajusteCorrecto = ajuste
    ? ajuste.comprobacion.every(c => c.izq === c.der) && ajuste.cargaIzq === ajuste.cargaDer
    : false;

  const redoxCorrecto = redox
    ? redox.comprobacion.every(c => c.izq === c.der) && redox.cargaIzq === redox.cargaDer
    : false;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚖️</span> Ajustar y Balancear Ecuaciones Químicas
        </h1>
        <p className={styles.subtitle}>
          Escribe la ecuación <strong>sin coeficientes</strong> y obtén los enteros mínimos comprobados átomo a
          átomo, o desarrolla una <strong>redox por el método del ion-electrón</strong> paso a paso, en medio
          ácido y básico.
        </p>
      </header>

      <LegalNotice />

      {/* PESTAÑAS */}
      <div className={styles.tabs} role="tablist" aria-label="Herramientas disponibles">
        <button
          type="button"
          role="tab"
          id="tab-ajustar"
          aria-selected={pestana === 'ajustar'}
          aria-controls="panel-ajustar"
          className={`${styles.tab} ${pestana === 'ajustar' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('ajustar')}
        >
          <span aria-hidden="true">⚖️</span> Ajustar ecuación
        </button>
        <button
          type="button"
          role="tab"
          id="tab-oxidacion"
          aria-selected={pestana === 'oxidacion'}
          aria-controls="panel-oxidacion"
          className={`${styles.tab} ${pestana === 'oxidacion' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('oxidacion')}
        >
          <span aria-hidden="true">🔢</span> Números de oxidación
        </button>
        <button
          type="button"
          role="tab"
          id="tab-redox"
          aria-selected={pestana === 'redox'}
          aria-controls="panel-redox"
          className={`${styles.tab} ${pestana === 'redox' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('redox')}
        >
          <span aria-hidden="true">🔋</span> Redox ion-electrón
        </button>
      </div>

      {/* PANEL 1 — AJUSTAR */}
      {pestana === 'ajustar' && (
        <div id="panel-ajustar" role="tabpanel" aria-labelledby="tab-ajustar" className={styles.panel}>
          <label className={styles.campoLabel} htmlFor="ecuacion">
            Ecuación química (usa <code>-&gt;</code> para la flecha y <code>+</code> entre especies)
          </label>
          <div className={styles.campoRow}>
            <input
              id="ecuacion"
              type="text"
              value={ecuacion}
              onChange={e => setEcuacion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') lanzarAjuste(); }}
              className={styles.campoTexto}
              placeholder="C3H8 + O2 -> CO2 + H2O"
              spellCheck={false}
              autoComplete="off"
            />
            <button type="button" className={styles.btnPrimario} onClick={() => lanzarAjuste()}>
              Ajustar
            </button>
          </div>

          <div className={styles.ejemplosRow}>
            {EJEMPLOS_AJUSTE.map(ej => (
              <button
                key={ej.ecuacion}
                type="button"
                className={styles.btnEjemplo}
                onClick={() => { setEcuacion(ej.ecuacion); lanzarAjuste(ej.ecuacion); }}
                title={ej.nota}
              >
                {ej.etiqueta}
              </button>
            ))}
          </div>

          {errorAjuste && (
            <div className={styles.errorBox} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span> {errorAjuste}
            </div>
          )}

          {ajuste && (
            <>
              <div className={styles.resultadoDestacado}>
                <p className={styles.resultadoLabel}>Ecuación ajustada</p>
                <p className={styles.resultadoEcuacion}>{ecuacionAjustada}</p>
                <p className={styles.resultadoCoefs}>
                  Coeficientes: {ajuste.coeficientes.join(' : ')}
                </p>
              </div>

              <h2 className={styles.subtitulo}>Comprobación de la conservación</h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Elemento</th>
                      <th>Átomos a la izquierda</th>
                      <th>Átomos a la derecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ajuste.comprobacion.map(c => (
                      <tr key={c.elemento}>
                        <td><strong>{c.elemento}</strong></td>
                        <td>{c.izq}</td>
                        <td>{c.der}</td>
                        <td>{c.izq === c.der ? '✅ conservado' : '❌ descuadre'}</td>
                      </tr>
                    ))}
                    <tr>
                      <td><strong>Carga total</strong></td>
                      <td>{formatearEO(ajuste.cargaIzq)}</td>
                      <td>{formatearEO(ajuste.cargaDer)}</td>
                      <td>{ajuste.cargaIzq === ajuste.cargaDer ? '✅ conservada' : '❌ descuadre'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.notaResultado}>
                {ajusteCorrecto
                  ? 'Todos los elementos y la carga se conservan: la ecuación está correctamente ajustada.'
                  : 'Hay un descuadre en la comprobación: revisa las fórmulas introducidas.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* PANEL 2 — NÚMEROS DE OXIDACIÓN */}
      {pestana === 'oxidacion' && (
        <div id="panel-oxidacion" role="tabpanel" aria-labelledby="tab-oxidacion" className={styles.panel}>
          <label className={styles.campoLabel} htmlFor="formulaEO">
            Fórmula de la especie (admite iones: <code>Cr2O7^2-</code>, <code>NH4^+</code>)
          </label>
          <div className={styles.campoRow}>
            <input
              id="formulaEO"
              type="text"
              value={formulaEO}
              onChange={e => setFormulaEO(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') lanzarEO(); }}
              className={styles.campoTexto}
              placeholder="KMnO4"
              spellCheck={false}
              autoComplete="off"
            />
            <button type="button" className={styles.btnPrimario} onClick={() => lanzarEO()}>
              Calcular
            </button>
          </div>

          <div className={styles.ejemplosRow}>
            {EJEMPLOS_OXIDACION.map(f => (
              <button
                key={f}
                type="button"
                className={styles.btnEjemplo}
                onClick={() => { setFormulaEO(f); lanzarEO(f); }}
              >
                {bonita(f)}
              </button>
            ))}
          </div>

          {errorEO && (
            <div className={styles.errorBox} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span> {errorEO}
            </div>
          )}

          {resultadoEO && (
            <>
              <div className={styles.resultadoDestacado}>
                <p className={styles.resultadoLabel}>Especie analizada</p>
                <p className={styles.resultadoEcuacion}>{bonita(resultadoEO.especie.formula)}</p>
                <p className={styles.resultadoCoefs}>
                  Carga total: {formatearEO(resultadoEO.especie.carga)} · Suma de los números de oxidación:{' '}
                  {formatearEO(resultadoEO.suma)}
                </p>
              </div>

              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Elemento</th>
                      <th>Átomos</th>
                      <th>Número de oxidación</th>
                      <th>Regla aplicada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadoEO.asignaciones.map(a => (
                      <tr key={a.elemento}>
                        <td><strong>{a.elemento}</strong></td>
                        <td>{a.atomos}</td>
                        <td className={styles.celdaEO}>{a.eo === null ? '—' : formatearEO(a.eo)}</td>
                        <td>{a.regla}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {resultadoEO.hidrato && (
                <p className={styles.notaResultado}>
                  Se ha analizado la <strong>sal anhidra</strong>: el agua de hidratación acompaña al cristal pero
                  no modifica los números de oxidación del resto de elementos.
                </p>
              )}

              {resultadoEO.asignaciones.some(a => a.eo !== null && !Number.isInteger(a.eo)) && (
                <p className={styles.notaResultado}>
                  Alguno de los valores no es entero: se trata de un <strong>número de oxidación medio</strong>. La
                  fórmula empírica no distingue átomos del mismo elemento que en realidad se encuentran en
                  entornos distintos, como ocurre en la magnetita Fe₃O₄, donde conviven hierro(II) y hierro(III).
                </p>
              )}

              {resultadoEO.incompleto && (
                <p className={styles.notaResultado}>
                  Quedan dos o más elementos sin una regla fija que los determine. Con la fórmula empírica sola no
                  es posible repartir la carga entre ellos: hace falta conocer la estructura o los enlaces.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* PANEL 3 — ION-ELECTRÓN */}
      {pestana === 'redox' && (
        <div id="panel-redox" role="tabpanel" aria-labelledby="tab-redox" className={styles.panel}>
          <div className={styles.medioRow} role="group" aria-label="Medio de la reacción">
            <button
              type="button"
              className={`${styles.btnMedio} ${medio === 'acido' ? styles.btnMedioActivo : ''}`}
              onClick={() => { setMedio('acido'); lanzarRedox(undefined, undefined, 'acido'); }}
              aria-pressed={medio === 'acido'}
            >
              Medio ácido (H⁺)
            </button>
            <button
              type="button"
              className={`${styles.btnMedio} ${medio === 'basico' ? styles.btnMedioActivo : ''}`}
              onClick={() => { setMedio('basico'); lanzarRedox(undefined, undefined, 'basico'); }}
              aria-pressed={medio === 'basico'}
            >
              Medio básico (OH⁻)
            </button>
          </div>

          <div className={styles.semisGrid}>
            <div>
              <label className={styles.campoLabel} htmlFor="semiA">Semirreacción 1</label>
              <input
                id="semiA"
                type="text"
                value={semiA}
                onChange={e => setSemiA(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') lanzarRedox(); }}
                className={styles.campoTexto}
                placeholder="MnO4^- -> Mn^2+"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <div>
              <label className={styles.campoLabel} htmlFor="semiB">Semirreacción 2</label>
              <input
                id="semiB"
                type="text"
                value={semiB}
                onChange={e => setSemiB(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') lanzarRedox(); }}
                className={styles.campoTexto}
                placeholder="Fe^2+ -> Fe^3+"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          <button type="button" className={styles.btnPrimario} onClick={() => lanzarRedox()}>
            Desarrollar por ion-electrón
          </button>

          <div className={styles.ejemplosRow}>
            {EJEMPLOS_REDOX.map(ej => (
              <button
                key={ej.etiqueta}
                type="button"
                className={styles.btnEjemplo}
                onClick={() => cargarEjemploRedox(ej)}
                title={ej.nota}
              >
                {ej.etiqueta}
              </button>
            ))}
          </div>

          {errorRedox && (
            <div className={styles.errorBox} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span> {errorRedox}
            </div>
          )}

          {redox && (
            <>
              <div className={styles.semisResultado}>
                {[redox.semiA, redox.semiB].map((semi, idx) => (
                  <div key={idx} className={styles.semiCard}>
                    <div className={styles.semiHeader}>
                      <span className={`${styles.semiBadge} ${semi.tipo === 'oxidación' ? styles.badgeOx : styles.badgeRed}`}>
                        {semi.tipo === 'oxidación' ? 'Oxidación' : 'Reducción'}
                      </span>
                      <span className={styles.semiTitulo}>
                        {bonita(semi.especieInicial)} → {bonita(semi.especieFinal)}
                      </span>
                    </div>
                    <ol className={styles.pasosLista}>
                      {semi.pasos.map((p, i) => (
                        <li key={i} className={styles.pasoItem}>
                          <strong>{p.titulo}</strong>
                          <p className={styles.pasoEcuacion}>{p.ecuacion}</p>
                          <p className={styles.pasoExplicacion}>{p.explicacion}</p>
                        </li>
                      ))}
                    </ol>
                    <p className={styles.semiResumen}>
                      {semi.tipo === 'oxidación' ? 'Cede' : 'Capta'} <strong>{semi.electrones}</strong>{' '}
                      {semi.electrones === 1 ? 'electrón' : 'electrones'} por cada{' '}
                      {(semi.izq.get(semi.especieInicial) ?? 1) === 1 ? '' : `${semi.izq.get(semi.especieInicial)} `}
                      {bonita(semi.especieInicial)}.
                    </p>
                  </div>
                ))}
              </div>

              <div className={styles.igualacionBox}>
                <h2 className={styles.subtitulo}>Igualación de electrones</h2>
                <p>
                  Una semirreacción intercambia <strong>{redox.semiA.electrones}</strong>{' '}
                  {redox.semiA.electrones === 1 ? 'electrón' : 'electrones'} y la otra{' '}
                  <strong>{redox.semiB.electrones}</strong>{' '}
                  {redox.semiB.electrones === 1 ? 'electrón' : 'electrones'}. Para que los electrones cedidos
                  igualen a los captados se multiplica la primera por <strong>{redox.factorA}</strong> y la
                  segunda por <strong>{redox.factorB}</strong>, de modo que ambas intercambien{' '}
                  <strong>{redox.semiA.electrones * redox.factorA}</strong> electrones y puedan sumarse.
                </p>
              </div>

              <div className={styles.resultadoDestacado}>
                <p className={styles.resultadoLabel}>Ecuación iónica global ajustada</p>
                <p className={styles.resultadoEcuacion}>
                  {formatearLado(redox.globalIzq)} → {formatearLado(redox.globalDer)}
                </p>
                <p className={styles.resultadoCoefs}>
                  Agente oxidante: <strong>{bonita(redox.oxidante)}</strong> (se reduce) · Agente reductor:{' '}
                  <strong>{bonita(redox.reductor)}</strong> (se oxida)
                </p>
              </div>

              <h2 className={styles.subtitulo}>Comprobación de la ecuación global</h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Elemento</th>
                      <th>Átomos a la izquierda</th>
                      <th>Átomos a la derecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redox.comprobacion.map(c => (
                      <tr key={c.elemento}>
                        <td><strong>{c.elemento}</strong></td>
                        <td>{c.izq}</td>
                        <td>{c.der}</td>
                        <td>{c.izq === c.der ? '✅ conservado' : '❌ descuadre'}</td>
                      </tr>
                    ))}
                    <tr>
                      <td><strong>Carga total</strong></td>
                      <td>{formatearEO(redox.cargaIzq)}</td>
                      <td>{formatearEO(redox.cargaDer)}</td>
                      <td>{redox.cargaIzq === redox.cargaDer ? '✅ conservada' : '❌ descuadre'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.notaResultado}>
                {redoxCorrecto
                  ? 'Los átomos y la carga se conservan a ambos lados: el desarrollo es correcto.'
                  : 'La comprobación no cuadra: revisa las especies introducidas, porque alguna no encaja en el esquema del ion-electrón.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* BLOQUE EDUCATIVO */}
      <EducationalSection
        title="Aprende a ajustar ecuaciones químicas"
        subtitle="Del tanteo al método del ion-electrón, con las reglas de los números de oxidación"
      >
        <section>
          <h3>Qué significa ajustar (o balancear) una ecuación</h3>
          <p>
            Una ecuación química ajustada cumple la <strong>ley de conservación de la masa</strong>: los átomos no
            se crean ni se destruyen, solo se reorganizan. Ajustar —o <em>balancear</em>, como se dice en buena
            parte de Latinoamérica— consiste en buscar los coeficientes que hacen que haya el mismo número de
            átomos de cada elemento a los dos lados de la flecha. Si intervienen iones, además debe conservarse la{' '}
            <strong>carga total</strong>.
          </p>
          <p>
            La regla de oro es que solo pueden tocarse los <strong>coeficientes</strong>, nunca los subíndices: si
            cambias el subíndice, cambias la sustancia. Escribir H₂O₂ en lugar de H₂O no ajusta nada, convierte el
            agua en agua oxigenada.
          </p>
          <div className={styles.formulaBox}>
            Para cada elemento: Σ (coeficiente × átomos)&nbsp;reactivos = Σ (coeficiente × átomos)&nbsp;productos
          </div>
          <p>
            Esa condición es un sistema de ecuaciones lineales, una por elemento (más una por la carga si hay
            iones). Esta herramienta lo resuelve con <strong>aritmética exacta de fracciones</strong>, sin
            decimales ni redondeos, y después multiplica la solución hasta obtener los enteros más pequeños
            posibles. Por eso funciona igual con la combustión del propano que con reacciones donde el tanteo se
            vuelve incómodo.
          </p>
        </section>

        <section>
          <h3>Los tres métodos de ajuste: cuándo usar cada uno</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>En qué consiste</th>
                  <th>Cuándo conviene</th>
                  <th>Limitación</th>
                  <th>Nivel habitual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tanteo</td>
                  <td>Ir igualando elementos por orden, dejando H y O para el final</td>
                  <td>Reacciones sencillas: combustiones, síntesis, neutralizaciones</td>
                  <td>Se atasca cuando hay muchas especies o coeficientes grandes</td>
                  <td>Secundaria y primeros cursos</td>
                </tr>
                <tr>
                  <td>Algebraico</td>
                  <td>Asignar una incógnita a cada coeficiente y resolver el sistema</td>
                  <td>Cualquier ecuación, incluidas las que el tanteo no resuelve</td>
                  <td>Requiere resolver un sistema; es laborioso a mano</td>
                  <td>Bachillerato y universidad</td>
                </tr>
                <tr>
                  <td>Ion-electrón</td>
                  <td>Separar en semirreacciones de oxidación y reducción y ajustar cada una</td>
                  <td>Reacciones redox, sobre todo en disolución acuosa</td>
                  <td>Solo aplica si hay transferencia de electrones</td>
                  <td>Bachillerato, EBAU y universidad</td>
                </tr>
                <tr>
                  <td>Número de oxidación</td>
                  <td>Igualar el aumento y la disminución de los estados de oxidación</td>
                  <td>Redox en fase no acuosa, donde no hay H⁺ ni OH⁻ disponibles</td>
                  <td>No muestra el papel del disolvente</td>
                  <td>Bachillerato y universidad</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>4 situaciones donde el ajuste es lo que decide el resultado</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧪</span>
              <strong>Una valoración redox en el laboratorio</strong>
              <p>
                Para calcular la concentración de una muestra a partir del volumen de permanganato gastado hay que
                conocer la proporción exacta entre ambas especies. Un coeficiente mal puesto se traslada
                íntegramente al resultado final.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📐</span>
              <strong>Un problema de estequiometría</strong>
              <p>
                Antes de calcular moles, reactivo limitante o rendimiento, la ecuación debe estar ajustada: los
                coeficientes son precisamente las proporciones molares con las que se hacen todos los cálculos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔋</span>
              <strong>Una pila electroquímica</strong>
              <p>
                Las dos semirreacciones son literalmente lo que ocurre en cada electrodo. Saber cuántos electrones
                intercambia cada una es imprescindible para relacionar la carga que circula con la masa
                depositada.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏭</span>
              <strong>Un balance de materia industrial</strong>
              <p>
                En un proceso continuo, los coeficientes fijan cuánta materia prima hace falta por tonelada de
                producto y cuántos subproductos habrá que gestionar. El ajuste es el punto de partida del diseño.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre ajuste de ecuaciones y redox</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué no puedo cambiar los subíndices para ajustar?</h4>
              <p>
                Porque los subíndices forman parte de la identidad de la sustancia. El coeficiente indica{' '}
                <em>cuántas</em> unidades intervienen; el subíndice, <em>qué</em> sustancia es. Cambiar CO₂ por CO
                para cuadrar los oxígenos no ajusta la reacción: la sustituye por otra distinta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿En qué orden conviene ajustar por tanteo?</h4>
              <p>
                Empieza por los elementos que aparecen en una sola especie a cada lado, sigue por los metales, y
                deja para el final el hidrógeno y el oxígeno, que suelen estar repartidos en varias especies. Si
                aparece un grupo poliatómico intacto en ambos lados, como el sulfato o el nitrato, trátalo como
                una unidad.
              </p>
              <p className={styles.faqTip}>
                Si al final queda un coeficiente fraccionario, multiplica toda la ecuación por el denominador: los
                coeficientes deben ser enteros y lo más pequeños posible.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo sé si una reacción es redox?</h4>
              <p>
                Calcula los números de oxidación de todos los elementos antes y después. Si alguno cambia, hay
                transferencia de electrones y la reacción es redox. Si ninguno cambia —como en una neutralización
                ácido-base o en una precipitación— no lo es, y basta con el tanteo o el método algebraico.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué en medio ácido se añaden H₂O y H⁺, y en básico OH⁻?</h4>
              <p>
                Porque son las especies realmente disponibles en la disolución. En medio ácido abundan los
                protones, así que pueden aparecer en la ecuación; en medio básico no puede quedar H⁺ libre, porque
                reaccionaría de inmediato con los hidroxilos. Por eso, tras ajustar como si fuera ácido, se añaden
                tantos OH⁻ a ambos lados como H⁺ haya y se forman moléculas de agua.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre la ecuación iónica y la molecular?</h4>
              <p>
                La <strong>iónica</strong> muestra solo las especies que participan realmente, incluidos los iones
                libres. La <strong>molecular</strong> escribe los compuestos completos, incorporando los iones
                espectadores que acompañan a cada reactivo pero no intervienen en la transferencia de electrones.
              </p>
              <p className={styles.faqTip}>
                Esta herramienta desarrolla la ecuación iónica, que es la que pide el método del ion-electrón. Para
                pasar a la molecular, añade los iones espectadores del compuesto de partida a ambos lados.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede una misma sustancia oxidarse y reducirse a la vez?</h4>
              <p>
                Sí: se llama <strong>dismutación</strong> o desproporción. El caso clásico es el cloro en medio
                básico, que pasa simultáneamente a cloruro (se reduce) y a hipoclorito (se oxida). En el método del
                ion-electrón se trata igual que cualquier otra: dos semirreacciones que parten de la misma especie.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>El método del ion-electrón, paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica qué se oxida y qué se reduce</strong>
                <p>
                  Calcula los números de oxidación y localiza los elementos que cambian. El que sube se oxida
                  (cede electrones) y el que baja se reduce (los capta).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Escribe las dos semirreacciones y ajusta el elemento principal</strong>
                <p>
                  Separa la reacción en dos mitades independientes e iguala primero los átomos del elemento que
                  cambia, sin tocar todavía el hidrógeno ni el oxígeno.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Ajusta oxígenos con H₂O e hidrógenos con H⁺</strong>
                <p>
                  Añade una molécula de agua por cada oxígeno que falte y, después, tantos protones como
                  hidrógenos falten en el otro lado. El disolvente aporta ambos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Iguala la carga con electrones</strong>
                <p>
                  Suma la carga de cada lado y añade electrones donde falte carga negativa. En la reducción los
                  electrones entran a la izquierda; en la oxidación salen a la derecha.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Multiplica, suma y simplifica</strong>
                <p>
                  Multiplica cada semirreacción para que los electrones coincidan, súmalas y cancela las especies
                  repetidas a ambos lados. Si el medio es básico, neutraliza los H⁺ con OH⁻ antes de terminar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Comprueba átomos y carga</strong>
                <p>
                  El ajuste solo es válido si se conservan a la vez todos los átomos y la carga total. Es la
                  verificación que evita la mayoría de los errores de examen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>Consejos para no atascarte</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Deja el oxígeno para el final</strong>
              <p>
                En una combustión, ajusta primero el carbono, luego el hidrógeno y solo entonces el oxígeno: casi
                siempre cuadra en un solo paso y evita ir y volver.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧱</span>
              <strong>Trata los grupos como bloques</strong>
              <p>
                Si el sulfato o el nitrato aparecen intactos a los dos lados, cuéntalos como una pieza única en
                lugar de contar sus átomos por separado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <strong>Verifica siempre la carga</strong>
              <p>
                En una ecuación iónica es tan obligatorio conservar la carga como los átomos. Un ajuste con los
                átomos correctos y la carga descuadrada está mal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✏️</span>
              <strong>Escribe primero, ajusta después</strong>
              <p>
                Comprueba que las fórmulas de reactivos y productos sean correctas antes de buscar coeficientes:
                una fórmula mal escrita hace imposible cualquier ajuste.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al ajustar ecuaciones</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Modificar subíndices en lugar de coeficientes.</strong> Es el error más grave: cambia la
              sustancia y convierte la ecuación en otra reacción distinta.
            </li>
            <li>
              <strong>Dejar coeficientes fraccionarios como resultado final.</strong> Son válidos como paso
              intermedio, pero la respuesta debe darse con enteros mínimos.
            </li>
            <li>
              <strong>Olvidar la carga en las ecuaciones iónicas.</strong> Conservar los átomos no basta si la
              suma de cargas no coincide a ambos lados.
            </li>
            <li>
              <strong>Dejar H⁺ en una reacción en medio básico.</strong> Si el enunciado dice medio básico, el
              protón no puede aparecer en la ecuación final.
            </li>
            <li>
              <strong>No simplificar las especies repetidas al sumar las semirreacciones.</strong> El agua y los
              protones que aparecen a ambos lados deben cancelarse.
            </li>
            <li>
              <strong>Suponer que el número de oxidación es la carga real del átomo.</strong> Es un reparto
              convencional de los electrones de enlace, útil para contar la transferencia, no una carga física
              medible.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('ajustar-ecuaciones-quimicas')} />
      <ShareCard appName="ajustar-ecuaciones-quimicas" />
      <Footer appName="ajustar-ecuaciones-quimicas" />
    </div>
  );
}

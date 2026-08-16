'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaValencias.module.css';
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

type CategoriaId =
  | 'hidrogeno'
  | 'alcalinos'
  | 'alcalinoterreos'
  | 'terreos'
  | 'carbonoideos'
  | 'nitrogenoideos'
  | 'anfigenos'
  | 'halogenos'
  | 'gases-nobles'
  | 'transicion';

interface EstadoOxidacion {
  /** Número de oxidación con signo */
  valor: number;
  /** true = estado habitual en los ejercicios; false = poco frecuente */
  frecuente: boolean;
  /** Marca el estado con el que el elemento actúa más a menudo */
  masComun?: boolean;
  /** Fórmula de un compuesto real donde actúa con ese estado */
  ejemplo: string;
  /** Nombre del compuesto del ejemplo */
  nombreEjemplo: string;
}

interface Elemento {
  simbolo: string;
  nombre: string;
  z: number;
  categoria: CategoriaId;
  grupo: string;
  /** Valencias (capacidad de combinación, sin signo) */
  valencias: string;
  estados: EstadoOxidacion[];
  /** Términos alternativos para el buscador (nombres tradicionales, variantes) */
  sinonimos: string[];
  /** Raíces de la nomenclatura tradicional por número de oxidación */
  tradicional?: Record<number, string>;
  /** Aclaración específica del elemento */
  nota?: string;
}

interface IonPoliatomico {
  nombre: string;
  formula: string;
  carga: string;
  central: string;
  uso: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIAS: { id: CategoriaId; etiqueta: string; corta: string; color: string }[] = [
  { id: 'hidrogeno', etiqueta: 'Hidrógeno', corta: 'Hidrógeno', color: '#7FB3D3' },
  { id: 'alcalinos', etiqueta: 'Metales alcalinos (grupo 1)', corta: 'Alcalinos', color: '#E8A0A0' },
  { id: 'alcalinoterreos', etiqueta: 'Metales alcalinotérreos (grupo 2)', corta: 'Alcalinotérreos', color: '#EFC084' },
  { id: 'transicion', etiqueta: 'Metales de transición', corta: 'Transición', color: '#8FC1DE' },
  { id: 'terreos', etiqueta: 'Térreos o boroideos (grupo 13)', corta: 'Térreos', color: '#A8D5BA' },
  { id: 'carbonoideos', etiqueta: 'Carbonoideos (grupo 14)', corta: 'Carbonoideos', color: '#9FD3C7' },
  { id: 'nitrogenoideos', etiqueta: 'Nitrogenoideos (grupo 15)', corta: 'Nitrogenoideos', color: '#B8B0DC' },
  { id: 'anfigenos', etiqueta: 'Anfígenos o calcógenos (grupo 16)', corta: 'Anfígenos', color: '#D5A6BD' },
  { id: 'halogenos', etiqueta: 'Halógenos (grupo 17)', corta: 'Halógenos', color: '#EBD98B' },
  { id: 'gases-nobles', etiqueta: 'Gases nobles (grupo 18)', corta: 'Gases nobles', color: '#AEC9E3' },
];

// ═══════════════════════════════════════════════════════════════════════
// DATOS: NÚMEROS DE OXIDACIÓN
// Cada entrada está revisada elemento a elemento. Se han omitido de forma
// deliberada los estados exóticos o de laboratorio (p. ej. Ag(II), Ag(III),
// Fe(VI), Cu(III)) para no inducir a error en un contexto escolar.
// ═══════════════════════════════════════════════════════════════════════

const ELEMENTOS: Elemento[] = [
  // ── Hidrógeno ──────────────────────────────────────────────────────
  {
    simbolo: 'H',
    nombre: 'Hidrógeno',
    z: 1,
    categoria: 'hidrogeno',
    grupo: 'Grupo 1 (caso aparte)',
    valencias: '1',
    sinonimos: ['hidrogeno', 'hidruro', 'protio'],
    nota: 'El hidrógeno actúa con +1 frente a los no metales (H₂O, HCl) y con −1 solo en los hidruros metálicos (NaH, CaH₂), donde el metal es menos electronegativo que él.',
    estados: [
      { valor: 1, frecuente: true, masComun: true, ejemplo: 'H₂O', nombreEjemplo: 'agua' },
      { valor: -1, frecuente: false, ejemplo: 'NaH', nombreEjemplo: 'hidruro de sodio' },
    ],
  },

  // ── Grupo 1: metales alcalinos ─────────────────────────────────────
  {
    simbolo: 'Li', nombre: 'Litio', z: 3, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['litio', 'litico'], tradicional: { 1: 'lítico' },
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'Li₂O', nombreEjemplo: 'óxido de litio' }],
  },
  {
    simbolo: 'Na', nombre: 'Sodio', z: 11, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['sodio', 'sodico', 'natrio', 'sal comun'], tradicional: { 1: 'sódico' },
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'NaCl', nombreEjemplo: 'cloruro de sodio (sal común)' }],
  },
  {
    simbolo: 'K', nombre: 'Potasio', z: 19, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['potasio', 'potasico', 'kalio'], tradicional: { 1: 'potásico' },
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'K₂O', nombreEjemplo: 'óxido de potasio' }],
  },
  {
    simbolo: 'Rb', nombre: 'Rubidio', z: 37, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['rubidio'],
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'RbCl', nombreEjemplo: 'cloruro de rubidio' }],
  },
  {
    simbolo: 'Cs', nombre: 'Cesio', z: 55, categoria: 'alcalinos', grupo: 'Grupo 1', valencias: '1',
    sinonimos: ['cesio', 'caesio'],
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'CsF', nombreEjemplo: 'fluoruro de cesio' }],
  },

  // ── Grupo 2: metales alcalinotérreos ───────────────────────────────
  {
    simbolo: 'Be', nombre: 'Berilio', z: 4, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['berilio', 'berilico'], tradicional: { 2: 'berílico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'BeO', nombreEjemplo: 'óxido de berilio' }],
  },
  {
    simbolo: 'Mg', nombre: 'Magnesio', z: 12, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['magnesio', 'magnesico'], tradicional: { 2: 'magnésico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'MgCl₂', nombreEjemplo: 'cloruro de magnesio' }],
  },
  {
    simbolo: 'Ca', nombre: 'Calcio', z: 20, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['calcio', 'calcico', 'cal'], tradicional: { 2: 'cálcico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'CaCO₃', nombreEjemplo: 'carbonato de calcio (caliza)' }],
  },
  {
    simbolo: 'Sr', nombre: 'Estroncio', z: 38, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['estroncio', 'estroncico'], tradicional: { 2: 'estróncico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'SrSO₄', nombreEjemplo: 'sulfato de estroncio' }],
  },
  {
    simbolo: 'Ba', nombre: 'Bario', z: 56, categoria: 'alcalinoterreos', grupo: 'Grupo 2', valencias: '2',
    sinonimos: ['bario', 'barico'], tradicional: { 2: 'bárico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'BaSO₄', nombreEjemplo: 'sulfato de bario' }],
  },

  // ── Grupo 13: térreos ──────────────────────────────────────────────
  {
    simbolo: 'B', nombre: 'Boro', z: 5, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3',
    sinonimos: ['boro', 'borico', 'borato'], tradicional: { 3: 'bórico' },
    nota: 'El estado −3 solo aparece en boruros metálicos, donde el metal es claramente menos electronegativo que el boro.',
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'B₂O₃', nombreEjemplo: 'óxido de boro' },
      { valor: -3, frecuente: false, ejemplo: 'Mg₃B₂', nombreEjemplo: 'boruro de magnesio' },
    ],
  },
  {
    simbolo: 'Al', nombre: 'Aluminio', z: 13, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3',
    sinonimos: ['aluminio', 'aluminico', 'alumina'], tradicional: { 3: 'alumínico' },
    estados: [{ valor: 3, frecuente: true, masComun: true, ejemplo: 'Al₂O₃', nombreEjemplo: 'óxido de aluminio (alúmina)' }],
  },
  {
    simbolo: 'Ga', nombre: 'Galio', z: 31, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3, 1',
    sinonimos: ['galio', 'galico'], tradicional: { 1: 'galioso', 3: 'gálico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Ga₂O₃', nombreEjemplo: 'óxido de galio(III)' },
      { valor: 1, frecuente: false, ejemplo: 'Ga₂O', nombreEjemplo: 'óxido de galio(I)' },
    ],
  },
  {
    simbolo: 'In', nombre: 'Indio', z: 49, categoria: 'terreos', grupo: 'Grupo 13', valencias: '3, 1',
    sinonimos: ['indio'], tradicional: { 1: 'indioso', 3: 'índico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'In₂O₃', nombreEjemplo: 'óxido de indio(III)' },
      { valor: 1, frecuente: false, ejemplo: 'InCl', nombreEjemplo: 'cloruro de indio(I)' },
    ],
  },
  {
    simbolo: 'Tl', nombre: 'Talio', z: 81, categoria: 'terreos', grupo: 'Grupo 13', valencias: '1, 3',
    sinonimos: ['talio', 'taloso', 'talico'], tradicional: { 1: 'taloso', 3: 'tálico' },
    nota: 'En el talio el estado +1 es el más estable (efecto del par inerte), al contrario que en el resto del grupo 13.',
    estados: [
      { valor: 1, frecuente: true, masComun: true, ejemplo: 'Tl₂O', nombreEjemplo: 'óxido de talio(I)' },
      { valor: 3, frecuente: true, ejemplo: 'Tl₂O₃', nombreEjemplo: 'óxido de talio(III)' },
    ],
  },

  // ── Grupo 14: carbonoideos ─────────────────────────────────────────
  {
    simbolo: 'C', nombre: 'Carbono', z: 6, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '4, 2',
    sinonimos: ['carbono', 'carbonico', 'carbonoso', 'carburo'], tradicional: { 2: 'carbonoso', 4: 'carbónico' },
    nota: 'En química orgánica el carbono toma valores intermedios (−3 en el CH₃ del etano, −1, 0, +1…). Aquí se recogen los estados de la formulación inorgánica.',
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'CO₂', nombreEjemplo: 'dióxido de carbono' },
      { valor: 2, frecuente: true, ejemplo: 'CO', nombreEjemplo: 'monóxido de carbono' },
      { valor: -4, frecuente: true, ejemplo: 'CH₄', nombreEjemplo: 'metano' },
    ],
  },
  {
    simbolo: 'Si', nombre: 'Silicio', z: 14, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '4',
    sinonimos: ['silicio', 'silice', 'silicico', 'siliciuro'], tradicional: { 4: 'silícico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'SiO₂', nombreEjemplo: 'dióxido de silicio (cuarzo)' },
      { valor: -4, frecuente: false, ejemplo: 'Mg₂Si', nombreEjemplo: 'siliciuro de magnesio' },
    ],
  },
  {
    simbolo: 'Ge', nombre: 'Germanio', z: 32, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '4, 2',
    sinonimos: ['germanio', 'germanico', 'germanoso'], tradicional: { 2: 'germanoso', 4: 'germánico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'GeO₂', nombreEjemplo: 'óxido de germanio(IV)' },
      { valor: 2, frecuente: true, ejemplo: 'GeO', nombreEjemplo: 'óxido de germanio(II)' },
    ],
  },
  {
    simbolo: 'Sn', nombre: 'Estaño', z: 50, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '2, 4',
    sinonimos: ['estano', 'estanio', 'estannoso', 'estannico', 'lata'], tradicional: { 2: 'estannoso', 4: 'estánnico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'SnO₂', nombreEjemplo: 'óxido de estaño(IV)' },
      { valor: 2, frecuente: true, ejemplo: 'SnCl₂', nombreEjemplo: 'cloruro de estaño(II)' },
    ],
  },
  {
    simbolo: 'Pb', nombre: 'Plomo', z: 82, categoria: 'carbonoideos', grupo: 'Grupo 14', valencias: '2, 4',
    sinonimos: ['plomo', 'plumboso', 'plumbico'], tradicional: { 2: 'plumboso', 4: 'plúmbico' },
    nota: 'En el plomo el estado +2 es más estable que el +4, al revés que en el estaño.',
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'PbO', nombreEjemplo: 'óxido de plomo(II)' },
      { valor: 4, frecuente: true, ejemplo: 'PbO₂', nombreEjemplo: 'óxido de plomo(IV)' },
    ],
  },

  // ── Grupo 15: nitrogenoideos ───────────────────────────────────────
  {
    simbolo: 'N', nombre: 'Nitrógeno', z: 7, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5 (1, 2, 4)',
    sinonimos: ['nitrogeno', 'nitrico', 'nitroso', 'nitrato', 'nitrito', 'azoe'], tradicional: { 3: 'nitroso', 5: 'nítrico' },
    nota: 'El nitrógeno recorre todos los estados de −3 a +5. En formulación escolar se usan sobre todo −3, +3 y +5; +1, +2 y +4 aparecen en los óxidos de nitrógeno.',
    estados: [
      { valor: 5, frecuente: true, masComun: true, ejemplo: 'HNO₃', nombreEjemplo: 'ácido nítrico' },
      { valor: 4, frecuente: false, ejemplo: 'NO₂', nombreEjemplo: 'dióxido de nitrógeno' },
      { valor: 3, frecuente: true, ejemplo: 'HNO₂', nombreEjemplo: 'ácido nitroso' },
      { valor: 2, frecuente: false, ejemplo: 'NO', nombreEjemplo: 'monóxido de nitrógeno' },
      { valor: 1, frecuente: false, ejemplo: 'N₂O', nombreEjemplo: 'óxido de dinitrógeno' },
      { valor: -3, frecuente: true, ejemplo: 'NH₃', nombreEjemplo: 'amoniaco' },
    ],
  },
  {
    simbolo: 'P', nombre: 'Fósforo', z: 15, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['fosforo', 'fosforico', 'fosforoso', 'fosfato', 'fosfuro'], tradicional: { 3: 'fosforoso', 5: 'fosfórico' },
    estados: [
      { valor: 5, frecuente: true, masComun: true, ejemplo: 'H₃PO₄', nombreEjemplo: 'ácido fosfórico' },
      { valor: 3, frecuente: true, ejemplo: 'P₂O₃', nombreEjemplo: 'óxido de fósforo(III)' },
      { valor: -3, frecuente: true, ejemplo: 'PH₃', nombreEjemplo: 'fosfano (fosfina)' },
    ],
  },
  {
    simbolo: 'As', nombre: 'Arsénico', z: 33, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['arsenico', 'arsenioso', 'arseniuro', 'arseniato'], tradicional: { 3: 'arsenioso', 5: 'arsénico' },
    estados: [
      { valor: 5, frecuente: true, masComun: true, ejemplo: 'H₃AsO₄', nombreEjemplo: 'ácido arsénico' },
      { valor: 3, frecuente: true, ejemplo: 'As₂O₃', nombreEjemplo: 'óxido de arsénico(III)' },
      { valor: -3, frecuente: false, ejemplo: 'GaAs', nombreEjemplo: 'arseniuro de galio' },
    ],
  },
  {
    simbolo: 'Sb', nombre: 'Antimonio', z: 51, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['antimonio', 'antimonioso', 'antimonico', 'estibio'], tradicional: { 3: 'antimonioso', 5: 'antimónico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Sb₂O₃', nombreEjemplo: 'óxido de antimonio(III)' },
      { valor: 5, frecuente: true, ejemplo: 'Sb₂O₅', nombreEjemplo: 'óxido de antimonio(V)' },
      { valor: -3, frecuente: false, ejemplo: 'InSb', nombreEjemplo: 'antimoniuro de indio' },
    ],
  },
  {
    simbolo: 'Bi', nombre: 'Bismuto', z: 83, categoria: 'nitrogenoideos', grupo: 'Grupo 15', valencias: '3, 5',
    sinonimos: ['bismuto', 'bismutoso', 'bismutico'], tradicional: { 3: 'bismutoso', 5: 'bismútico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Bi₂O₃', nombreEjemplo: 'óxido de bismuto(III)' },
      { valor: 5, frecuente: false, ejemplo: 'NaBiO₃', nombreEjemplo: 'bismutato de sodio' },
    ],
  },

  // ── Grupo 16: anfígenos ────────────────────────────────────────────
  {
    simbolo: 'O', nombre: 'Oxígeno', z: 8, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2',
    sinonimos: ['oxigeno', 'oxido', 'peroxido'],
    nota: 'El oxígeno vale −2 casi siempre. Excepciones: −1 en los peróxidos (H₂O₂, Na₂O₂), −½ en los superóxidos (KO₂) y positivo solo frente al flúor, el único elemento más electronegativo que él (OF₂, con +2).',
    estados: [
      { valor: -2, frecuente: true, masComun: true, ejemplo: 'H₂O', nombreEjemplo: 'agua' },
      { valor: -1, frecuente: true, ejemplo: 'H₂O₂', nombreEjemplo: 'peróxido de hidrógeno (agua oxigenada)' },
      { valor: 2, frecuente: false, ejemplo: 'OF₂', nombreEjemplo: 'difluoruro de oxígeno' },
    ],
  },
  {
    simbolo: 'S', nombre: 'Azufre', z: 16, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2, 4, 6',
    sinonimos: ['azufre', 'sulfurico', 'sulfuroso', 'sulfato', 'sulfito', 'sulfuro'], tradicional: { 4: 'sulfuroso', 6: 'sulfúrico' },
    estados: [
      { valor: 6, frecuente: true, masComun: true, ejemplo: 'H₂SO₄', nombreEjemplo: 'ácido sulfúrico' },
      { valor: 4, frecuente: true, ejemplo: 'SO₂', nombreEjemplo: 'dióxido de azufre' },
      { valor: -2, frecuente: true, ejemplo: 'H₂S', nombreEjemplo: 'sulfuro de hidrógeno' },
    ],
  },
  {
    simbolo: 'Se', nombre: 'Selenio', z: 34, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2, 4, 6',
    sinonimos: ['selenio', 'selenioso', 'selenico', 'seleniuro'], tradicional: { 4: 'selenioso', 6: 'selénico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'SeO₂', nombreEjemplo: 'óxido de selenio(IV)' },
      { valor: 6, frecuente: true, ejemplo: 'H₂SeO₄', nombreEjemplo: 'ácido selénico' },
      { valor: -2, frecuente: true, ejemplo: 'H₂Se', nombreEjemplo: 'seleniuro de hidrógeno' },
    ],
  },
  {
    simbolo: 'Te', nombre: 'Teluro', z: 52, categoria: 'anfigenos', grupo: 'Grupo 16', valencias: '2, 4, 6',
    sinonimos: ['teluro', 'telurio', 'teluroso', 'telurico', 'telururo'], tradicional: { 4: 'teluroso', 6: 'telúrico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'TeO₂', nombreEjemplo: 'óxido de teluro(IV)' },
      { valor: 6, frecuente: true, ejemplo: 'TeO₃', nombreEjemplo: 'óxido de teluro(VI)' },
      { valor: -2, frecuente: true, ejemplo: 'H₂Te', nombreEjemplo: 'telururo de hidrógeno' },
    ],
  },

  // ── Grupo 17: halógenos ────────────────────────────────────────────
  {
    simbolo: 'F', nombre: 'Flúor', z: 9, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1',
    sinonimos: ['fluor', 'fluoruro', 'fluorhidrico'],
    nota: 'El flúor es el elemento más electronegativo de la tabla: nunca actúa con número de oxidación positivo. Su único estado en compuestos es −1.',
    estados: [{ valor: -1, frecuente: true, masComun: true, ejemplo: 'HF', nombreEjemplo: 'fluoruro de hidrógeno' }],
  },
  {
    simbolo: 'Cl', nombre: 'Cloro', z: 17, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1, 3, 5, 7',
    sinonimos: ['cloro', 'cloruro', 'hipocloroso', 'cloroso', 'clorico', 'perclorico', 'clorato', 'lejia'],
    tradicional: { 1: 'hipocloroso', 3: 'cloroso', 5: 'clórico', 7: 'perclórico' },
    estados: [
      { valor: -1, frecuente: true, masComun: true, ejemplo: 'NaCl', nombreEjemplo: 'cloruro de sodio' },
      { valor: 1, frecuente: true, ejemplo: 'HClO', nombreEjemplo: 'ácido hipocloroso' },
      { valor: 3, frecuente: true, ejemplo: 'HClO₂', nombreEjemplo: 'ácido cloroso' },
      { valor: 5, frecuente: true, ejemplo: 'HClO₃', nombreEjemplo: 'ácido clórico' },
      { valor: 7, frecuente: true, ejemplo: 'HClO₄', nombreEjemplo: 'ácido perclórico' },
    ],
  },
  {
    simbolo: 'Br', nombre: 'Bromo', z: 35, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1, 3, 5, 7',
    sinonimos: ['bromo', 'bromuro', 'bromico', 'bromato'],
    tradicional: { 1: 'hipobromoso', 3: 'bromoso', 5: 'brómico', 7: 'perbrómico' },
    estados: [
      { valor: -1, frecuente: true, masComun: true, ejemplo: 'KBr', nombreEjemplo: 'bromuro de potasio' },
      { valor: 1, frecuente: true, ejemplo: 'HBrO', nombreEjemplo: 'ácido hipobromoso' },
      { valor: 3, frecuente: false, ejemplo: 'HBrO₂', nombreEjemplo: 'ácido bromoso' },
      { valor: 5, frecuente: true, ejemplo: 'HBrO₃', nombreEjemplo: 'ácido brómico' },
      { valor: 7, frecuente: false, ejemplo: 'HBrO₄', nombreEjemplo: 'ácido perbrómico' },
    ],
  },
  {
    simbolo: 'I', nombre: 'Yodo', z: 53, categoria: 'halogenos', grupo: 'Grupo 17', valencias: '1, 3, 5, 7',
    sinonimos: ['yodo', 'iodo', 'yoduro', 'ioduro', 'yodico', 'yodato'],
    tradicional: { 1: 'hipoyodoso', 3: 'yodoso', 5: 'yódico', 7: 'peryódico' },
    estados: [
      { valor: -1, frecuente: true, masComun: true, ejemplo: 'KI', nombreEjemplo: 'yoduro de potasio' },
      { valor: 1, frecuente: true, ejemplo: 'HIO', nombreEjemplo: 'ácido hipoyodoso' },
      { valor: 3, frecuente: false, ejemplo: 'HIO₂', nombreEjemplo: 'ácido yodoso' },
      { valor: 5, frecuente: true, ejemplo: 'HIO₃', nombreEjemplo: 'ácido yódico' },
      { valor: 7, frecuente: true, ejemplo: 'HIO₄', nombreEjemplo: 'ácido peryódico' },
    ],
  },

  // ── Grupo 18: gases nobles ─────────────────────────────────────────
  {
    simbolo: 'He', nombre: 'Helio', z: 2, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0',
    sinonimos: ['helio'],
    nota: 'No se conoce ningún compuesto químico estable del helio: su número de oxidación es siempre 0.',
    estados: [{ valor: 0, frecuente: true, masComun: true, ejemplo: 'He', nombreEjemplo: 'helio (elemento libre)' }],
  },
  {
    simbolo: 'Ne', nombre: 'Neón', z: 10, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0',
    sinonimos: ['neon'],
    nota: 'No se conocen compuestos estables del neón: número de oxidación 0.',
    estados: [{ valor: 0, frecuente: true, masComun: true, ejemplo: 'Ne', nombreEjemplo: 'neón (elemento libre)' }],
  },
  {
    simbolo: 'Ar', nombre: 'Argón', z: 18, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0',
    sinonimos: ['argon'],
    nota: 'No forma compuestos estables en condiciones ordinarias: número de oxidación 0.',
    estados: [{ valor: 0, frecuente: true, masComun: true, ejemplo: 'Ar', nombreEjemplo: 'argón (elemento libre)' }],
  },
  {
    simbolo: 'Kr', nombre: 'Kriptón', z: 36, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0, 2',
    sinonimos: ['kripton', 'cripton'],
    estados: [
      { valor: 0, frecuente: true, masComun: true, ejemplo: 'Kr', nombreEjemplo: 'kriptón (elemento libre)' },
      { valor: 2, frecuente: false, ejemplo: 'KrF₂', nombreEjemplo: 'difluoruro de kriptón' },
    ],
  },
  {
    simbolo: 'Xe', nombre: 'Xenón', z: 54, categoria: 'gases-nobles', grupo: 'Grupo 18', valencias: '0, 2, 4, 6, 8',
    sinonimos: ['xenon'],
    nota: 'El xenón es el gas noble con más química conocida, pero solo frente a los dos elementos más electronegativos: flúor y oxígeno.',
    estados: [
      { valor: 0, frecuente: true, masComun: true, ejemplo: 'Xe', nombreEjemplo: 'xenón (elemento libre)' },
      { valor: 2, frecuente: false, ejemplo: 'XeF₂', nombreEjemplo: 'difluoruro de xenón' },
      { valor: 4, frecuente: false, ejemplo: 'XeF₄', nombreEjemplo: 'tetrafluoruro de xenón' },
      { valor: 6, frecuente: false, ejemplo: 'XeO₃', nombreEjemplo: 'trióxido de xenón' },
      { valor: 8, frecuente: false, ejemplo: 'XeO₄', nombreEjemplo: 'tetraóxido de xenón' },
    ],
  },

  // ── Metales de transición ──────────────────────────────────────────
  {
    simbolo: 'Cr', nombre: 'Cromo', z: 24, categoria: 'transicion', grupo: 'Grupo 6', valencias: '2, 3, 6',
    sinonimos: ['cromo', 'cromoso', 'cromico', 'cromato', 'dicromato'], tradicional: { 2: 'cromoso', 3: 'crómico' },
    nota: 'El estado +3 es el más estable. El +6 solo aparece en oxoaniones (cromato CrO₄²⁻ y dicromato Cr₂O₇²⁻), que son oxidantes fuertes.',
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Cr₂O₃', nombreEjemplo: 'óxido de cromo(III)' },
      { valor: 6, frecuente: true, ejemplo: 'K₂Cr₂O₇', nombreEjemplo: 'dicromato de potasio' },
      { valor: 2, frecuente: false, ejemplo: 'CrO', nombreEjemplo: 'óxido de cromo(II)' },
    ],
  },
  {
    simbolo: 'Mn', nombre: 'Manganeso', z: 25, categoria: 'transicion', grupo: 'Grupo 7', valencias: '2, 3, 4, 6, 7',
    sinonimos: ['manganeso', 'manganoso', 'manganico', 'permanganato', 'manganato'], tradicional: { 2: 'manganoso', 3: 'mangánico' },
    nota: 'Es el elemento con más estados de uso escolar. Los que hay que reconocer sí o sí: +2 (sales de manganeso), +4 (MnO₂ de las pilas) y +7 (permanganato, KMnO₄, morado intenso).',
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'MnCl₂', nombreEjemplo: 'cloruro de manganeso(II)' },
      { valor: 4, frecuente: true, ejemplo: 'MnO₂', nombreEjemplo: 'dióxido de manganeso' },
      { valor: 7, frecuente: true, ejemplo: 'KMnO₄', nombreEjemplo: 'permanganato de potasio' },
      { valor: 3, frecuente: false, ejemplo: 'Mn₂O₃', nombreEjemplo: 'óxido de manganeso(III)' },
      { valor: 6, frecuente: false, ejemplo: 'K₂MnO₄', nombreEjemplo: 'manganato de potasio' },
    ],
  },
  {
    simbolo: 'Fe', nombre: 'Hierro', z: 26, categoria: 'transicion', grupo: 'Grupo 8', valencias: '2, 3',
    sinonimos: ['hierro', 'fierro', 'ferroso', 'ferrico', 'ferro'], tradicional: { 2: 'ferroso', 3: 'férrico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'Fe₂O₃', nombreEjemplo: 'óxido de hierro(III) (herrumbre)' },
      { valor: 2, frecuente: true, ejemplo: 'FeCl₂', nombreEjemplo: 'cloruro de hierro(II)' },
    ],
  },
  {
    simbolo: 'Co', nombre: 'Cobalto', z: 27, categoria: 'transicion', grupo: 'Grupo 9', valencias: '2, 3',
    sinonimos: ['cobalto', 'cobaltoso', 'cobaltico'], tradicional: { 2: 'cobaltoso', 3: 'cobáltico' },
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'CoCl₂', nombreEjemplo: 'cloruro de cobalto(II)' },
      { valor: 3, frecuente: true, ejemplo: 'Co₂O₃', nombreEjemplo: 'óxido de cobalto(III)' },
    ],
  },
  {
    simbolo: 'Ni', nombre: 'Níquel', z: 28, categoria: 'transicion', grupo: 'Grupo 10', valencias: '2, 3',
    sinonimos: ['niquel', 'niqueloso', 'niquelico'], tradicional: { 2: 'niqueloso', 3: 'niquélico' },
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'NiSO₄', nombreEjemplo: 'sulfato de níquel(II)' },
      { valor: 3, frecuente: false, ejemplo: 'Ni₂O₃', nombreEjemplo: 'óxido de níquel(III)' },
    ],
  },
  {
    simbolo: 'Cu', nombre: 'Cobre', z: 29, categoria: 'transicion', grupo: 'Grupo 11', valencias: '1, 2',
    sinonimos: ['cobre', 'cuproso', 'cuprico'], tradicional: { 1: 'cuproso', 2: 'cúprico' },
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'CuSO₄', nombreEjemplo: 'sulfato de cobre(II) (azul)' },
      { valor: 1, frecuente: true, ejemplo: 'Cu₂O', nombreEjemplo: 'óxido de cobre(I)' },
    ],
  },
  {
    simbolo: 'Zn', nombre: 'Zinc', z: 30, categoria: 'transicion', grupo: 'Grupo 12', valencias: '2',
    sinonimos: ['zinc', 'cinc', 'cincico'], tradicional: { 2: 'cíncico' },
    nota: 'A pesar de estar en el bloque d, el zinc actúa siempre con +2: su subcapa d está llena y no participa.',
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'ZnO', nombreEjemplo: 'óxido de zinc' }],
  },
  {
    simbolo: 'Ag', nombre: 'Plata', z: 47, categoria: 'transicion', grupo: 'Grupo 11', valencias: '1',
    sinonimos: ['plata', 'argentico', 'argento'], tradicional: { 1: 'argéntico' },
    nota: 'En la práctica escolar la plata actúa siempre con +1. Existen compuestos de Ag(II) y Ag(III), pero son de laboratorio especializado.',
    estados: [{ valor: 1, frecuente: true, masComun: true, ejemplo: 'AgNO₃', nombreEjemplo: 'nitrato de plata' }],
  },
  {
    simbolo: 'Cd', nombre: 'Cadmio', z: 48, categoria: 'transicion', grupo: 'Grupo 12', valencias: '2',
    sinonimos: ['cadmio', 'cadmico'], tradicional: { 2: 'cádmico' },
    estados: [{ valor: 2, frecuente: true, masComun: true, ejemplo: 'CdS', nombreEjemplo: 'sulfuro de cadmio' }],
  },
  {
    simbolo: 'Pt', nombre: 'Platino', z: 78, categoria: 'transicion', grupo: 'Grupo 10', valencias: '2, 4',
    sinonimos: ['platino', 'platinoso', 'platinico'], tradicional: { 2: 'platinoso', 4: 'platínico' },
    estados: [
      { valor: 4, frecuente: true, masComun: true, ejemplo: 'PtO₂', nombreEjemplo: 'óxido de platino(IV)' },
      { valor: 2, frecuente: true, ejemplo: 'PtCl₂', nombreEjemplo: 'cloruro de platino(II)' },
    ],
  },
  {
    simbolo: 'Au', nombre: 'Oro', z: 79, categoria: 'transicion', grupo: 'Grupo 11', valencias: '1, 3',
    sinonimos: ['oro', 'auroso', 'aurico', 'aurum'], tradicional: { 1: 'auroso', 3: 'áurico' },
    estados: [
      { valor: 3, frecuente: true, masComun: true, ejemplo: 'AuCl₃', nombreEjemplo: 'cloruro de oro(III)' },
      { valor: 1, frecuente: true, ejemplo: 'AuCl', nombreEjemplo: 'cloruro de oro(I)' },
    ],
  },
  {
    simbolo: 'Hg', nombre: 'Mercurio', z: 80, categoria: 'transicion', grupo: 'Grupo 12', valencias: '1, 2',
    sinonimos: ['mercurio', 'mercurioso', 'mercurico', 'azogue'], tradicional: { 1: 'mercurioso', 2: 'mercúrico' },
    nota: 'En el estado +1 el mercurio aparece siempre como ion diatómico Hg₂²⁺; por eso el cloruro de mercurio(I) se escribe Hg₂Cl₂ y no HgCl.',
    estados: [
      { valor: 2, frecuente: true, masComun: true, ejemplo: 'HgO', nombreEjemplo: 'óxido de mercurio(II)' },
      { valor: 1, frecuente: true, ejemplo: 'Hg₂Cl₂', nombreEjemplo: 'cloruro de mercurio(I)' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// DATOS: IONES POLIATÓMICOS
// ═══════════════════════════════════════════════════════════════════════

const IONES: IonPoliatomico[] = [
  { nombre: 'Amonio', formula: 'NH₄⁺', carga: '+1', central: 'N: −3', uso: 'Único catión poliatómico frecuente. Cloruro de amonio, NH₄Cl.' },
  { nombre: 'Hidróxido', formula: 'OH⁻', carga: '−1', central: 'O: −2 · H: +1', uso: 'Base de todos los hidróxidos: NaOH, Ca(OH)₂.' },
  { nombre: 'Nitrato', formula: 'NO₃⁻', carga: '−1', central: 'N: +5', uso: 'Fertilizantes y explosivos. KNO₃, AgNO₃.' },
  { nombre: 'Nitrito', formula: 'NO₂⁻', carga: '−1', central: 'N: +3', uso: 'Conservante de embutidos. NaNO₂.' },
  { nombre: 'Sulfato', formula: 'SO₄²⁻', carga: '−2', central: 'S: +6', uso: 'El oxoanión más habitual. CuSO₄, CaSO₄ (yeso).' },
  { nombre: 'Sulfito', formula: 'SO₃²⁻', carga: '−2', central: 'S: +4', uso: 'Antioxidante en vinos. Na₂SO₃.' },
  { nombre: 'Hidrogenosulfato (bisulfato)', formula: 'HSO₄⁻', carga: '−1', central: 'S: +6', uso: 'Sulfato que conserva un hidrógeno ácido. NaHSO₄.' },
  { nombre: 'Carbonato', formula: 'CO₃²⁻', carga: '−2', central: 'C: +4', uso: 'Caliza, mármol y conchas. CaCO₃.' },
  { nombre: 'Hidrogenocarbonato (bicarbonato)', formula: 'HCO₃⁻', carga: '−1', central: 'C: +4', uso: 'Bicarbonato de sodio, NaHCO₃.' },
  { nombre: 'Fosfato', formula: 'PO₄³⁻', carga: '−3', central: 'P: +5', uso: 'Huesos, ADN y detergentes. Ca₃(PO₄)₂.' },
  { nombre: 'Fosfito', formula: 'PO₃³⁻', carga: '−3', central: 'P: +3', uso: 'Fungicidas agrícolas. K₃PO₃.' },
  { nombre: 'Hipoclorito', formula: 'ClO⁻', carga: '−1', central: 'Cl: +1', uso: 'Principio activo de la lejía. NaClO.' },
  { nombre: 'Clorito', formula: 'ClO₂⁻', carga: '−1', central: 'Cl: +3', uso: 'Blanqueante industrial. NaClO₂.' },
  { nombre: 'Clorato', formula: 'ClO₃⁻', carga: '−1', central: 'Cl: +5', uso: 'Herbicidas y pirotecnia. KClO₃.' },
  { nombre: 'Perclorato', formula: 'ClO₄⁻', carga: '−1', central: 'Cl: +7', uso: 'Propulsante de cohetes. NH₄ClO₄.' },
  { nombre: 'Permanganato', formula: 'MnO₄⁻', carga: '−1', central: 'Mn: +7', uso: 'Oxidante fuerte de color violeta. KMnO₄.' },
  { nombre: 'Manganato', formula: 'MnO₄²⁻', carga: '−2', central: 'Mn: +6', uso: 'Intermedio verde en medio básico. K₂MnO₄.' },
  { nombre: 'Cromato', formula: 'CrO₄²⁻', carga: '−2', central: 'Cr: +6', uso: 'Amarillo; vira a dicromato en medio ácido. K₂CrO₄.' },
  { nombre: 'Dicromato', formula: 'Cr₂O₇²⁻', carga: '−2', central: 'Cr: +6', uso: 'Naranja; oxidante clásico de laboratorio. K₂Cr₂O₇.' },
  { nombre: 'Peróxido', formula: 'O₂²⁻', carga: '−2', central: 'O: −1', uso: 'Cada oxígeno vale −1, no −2. Na₂O₂, H₂O₂.' },
  { nombre: 'Cianuro', formula: 'CN⁻', carga: '−1', central: 'C: +2 · N: −3', uso: 'Muy tóxico; usado en minería del oro. KCN.' },
  { nombre: 'Tiosulfato', formula: 'S₂O₃²⁻', carga: '−2', central: 'S: +2 (valor medio)', uso: 'Fijador fotográfico y antídoto. Na₂S₂O₃.' },
  { nombre: 'Acetato', formula: 'CH₃COO⁻', carga: '−1', central: 'C: −3 y +3', uso: 'Anión del vinagre. CH₃COONa.' },
  { nombre: 'Oxalato', formula: 'C₂O₄²⁻', carga: '−2', central: 'C: +3', uso: 'Presente en espinacas; forma cálculos renales. CaC₂O₄.' },
  { nombre: 'Silicato', formula: 'SiO₄⁴⁻', carga: '−4', central: 'Si: +4', uso: 'Unidad básica de la corteza terrestre. Mg₂SiO₄.' },
  { nombre: 'Borato', formula: 'BO₃³⁻', carga: '−3', central: 'B: +3', uso: 'Bórax y vidrios resistentes. Na₃BO₃.' },
];

// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES DE NOMENCLATURA
// ═══════════════════════════════════════════════════════════════════════

/** Prefijos multiplicadores de la nomenclatura sistemática */
const PREFIJOS = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
/** Forma contraída de los prefijos delante de «óxido» */
const PREFIJOS_OXIDO = ['', 'mon', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
const ROMANOS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Raíz del elemento cuando actúa como parte negativa del compuesto binario */
const RAIZ_ANION: Record<string, string> = {
  O: 'óxido', F: 'fluoruro', Cl: 'cloruro', Br: 'bromuro', I: 'yoduro',
  S: 'sulfuro', Se: 'seleniuro', Te: 'telururo', N: 'nitruro', P: 'fosfuro',
  As: 'arseniuro', Sb: 'antimoniuro', C: 'carburo', Si: 'siliciuro',
  B: 'boruro', H: 'hidruro',
};

/** Nombres comunes o vulgares aceptados para algunos binarios muy conocidos */
const NOMBRES_COMUNES: Record<string, string> = {
  H2O: 'agua',
  NH3: 'amoniaco',
  CH4: 'metano',
  PH3: 'fosfano (antes fosfina)',
  SiH4: 'silano',
  BH3: 'borano',
  AsH3: 'arsano (antes arsina)',
  HCl: 'ácido clorhídrico (en disolución acuosa)',
  HF: 'ácido fluorhídrico (en disolución acuosa)',
  HBr: 'ácido bromhídrico (en disolución acuosa)',
  HI: 'ácido yodhídrico (en disolución acuosa)',
  H2S: 'ácido sulfhídrico (en disolución acuosa)',
  H2O2: 'agua oxigenada',
  Fe2O3: 'herrumbre',
  SiO2: 'cuarzo o sílice',
};

/** Elementos que, combinados con hidrógeno, se escriben delante de él */
const NO_METALES_HIDRURO = ['B', 'C', 'Si', 'N', 'P', 'As', 'Sb'];

/** Máximo común divisor (para simplificar los subíndices) */
function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

/** Quita acentos y pasa a minúsculas, para un buscador tolerante */
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Formatea un número de oxidación con su signo (usando el signo menos tipográfico) */
function formatearEstado(valor: number): string {
  if (valor > 0) return `+${valor}`;
  if (valor < 0) return `−${Math.abs(valor)}`;
  return '0';
}

/** Convierte un número en subíndices Unicode (1 → '', 2 → '₂') */
function subindice(n: number): string {
  if (n <= 1) return '';
  const digitos = '₀₁₂₃₄₅₆₇₈₉';
  return String(n).split('').map((d) => digitos[Number(d)]).join('');
}

interface CompuestoResultado {
  partes: { simbolo: string; sub: number }[];
  formulaTexto: string;
  sistematica: string;
  stock: string;
  tradicional: string;
  comun?: string;
  advertencia?: string;
}

/** Aplica el intercambio de valencias y genera fórmula + tres nombres */
function formularBinario(
  positivo: Elemento,
  estadoPos: number,
  negativo: Elemento,
  estadoNeg: number,
): CompuestoResultado | null {
  if (positivo.simbolo === negativo.simbolo) return null;
  if (estadoPos <= 0 || estadoNeg >= 0) return null;

  const cargaNeg = Math.abs(estadoNeg);
  const divisor = mcd(estadoPos, cargaNeg);
  const subPosBase = cargaNeg / divisor;
  const subNegBase = estadoPos / divisor;
  // El mercurio(I) forma el ion diatómico Hg₂²⁺: siempre aparece en pares
  const factorDiatomico =
    positivo.simbolo === 'Hg' && estadoPos === 1 && subPosBase % 2 === 1 ? 2 : 1;
  const subPos = subPosBase * factorDiatomico;
  const subNeg = subNegBase * factorDiatomico;

  // Orden de escritura: primero el elemento electropositivo, salvo la excepción
  // clásica de los hidruros de los grupos 13, 14 y 15 (BH₃, CH₄, NH₃, PH₃).
  const excepcionHidruro =
    positivo.simbolo === 'H' && NO_METALES_HIDRURO.includes(negativo.simbolo);

  const partes = excepcionHidruro
    ? [{ simbolo: negativo.simbolo, sub: subNeg }, { simbolo: positivo.simbolo, sub: subPos }]
    : [{ simbolo: positivo.simbolo, sub: subPos }, { simbolo: negativo.simbolo, sub: subNeg }];

  const formulaTexto = partes.map((p) => p.simbolo + subindice(p.sub)).join('');
  const clave = partes.map((p) => p.simbolo + (p.sub > 1 ? p.sub : '')).join('');

  const raiz = RAIZ_ANION[negativo.simbolo] ?? 'compuesto';
  const estadosPositivos = positivo.estados.filter((e) => e.valor > 0);
  const necesitaRomano = estadosPositivos.length > 1;

  // ── Nomenclatura sistemática ──────────────────────────────────────
  // El prefijo «mono-» se omite salvo que ayude a distinguir compuestos
  // del mismo par de elementos (CO frente a CO₂, FeO frente a Fe₂O₃).
  const usarMono = subNeg === 1 && necesitaRomano;
  const idxNeg = subNeg > 1 ? subNeg : usarMono ? 1 : 0;
  const parteAnion =
    negativo.simbolo === 'O'
      ? `${PREFIJOS_OXIDO[idxNeg] ?? ''}óxido`
      : `${PREFIJOS[idxNeg] ?? ''}${raiz}`;
  const parteCation = `${subPos > 1 ? PREFIJOS[subPos] ?? '' : ''}${positivo.nombre.toLowerCase()}`;
  const sistematica = excepcionHidruro
    ? `${PREFIJOS[subPos] ?? ''}hidruro de ${negativo.nombre.toLowerCase()}`
    : `${parteAnion} de ${parteCation}`;

  // ── Nomenclatura de Stock ─────────────────────────────────────────
  const romano = ROMANOS[estadoPos] ?? String(estadoPos);
  const stock = excepcionHidruro
    ? `hidruro de ${negativo.nombre.toLowerCase()}`
    : `${raiz} de ${positivo.nombre.toLowerCase()}${necesitaRomano ? `(${romano})` : ''}`;

  // ── Nomenclatura tradicional ──────────────────────────────────────
  const adjetivo = positivo.tradicional?.[estadoPos];
  const tradicional = excepcionHidruro
    ? `hidruro de ${negativo.nombre.toLowerCase()}`
    : adjetivo
      ? `${raiz} ${adjetivo}`
      : `${raiz} de ${positivo.nombre.toLowerCase()}`;

  let advertencia: string | undefined;
  if (positivo.simbolo === 'Hg' && estadoPos === 1) {
    advertencia =
      'El mercurio(I) existe como ion diatómico Hg₂²⁺: la fórmula real se escribe con Hg₂ (por ejemplo, Hg₂Cl₂).';
  } else if (excepcionHidruro) {
    advertencia =
      'Convención de escritura: en los hidruros de los grupos 13, 14 y 15 el no metal se escribe delante del hidrógeno (BH₃, CH₄, NH₃, PH₃) y el compuesto se nombra como hidruro de ese no metal, aunque el número de oxidación negativo lo tenga él.';
  }

  return {
    partes,
    formulaTexto,
    sistematica,
    stock,
    tradicional,
    comun: NOMBRES_COMUNES[clave],
    advertencia,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function TablaValenciasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<CategoriaId | 'todas'>('todas');
  const [expandido, setExpandido] = useState<string | null>(null);

  const [simboloPos, setSimboloPos] = useState('Fe');
  const [estadoPos, setEstadoPos] = useState(3);
  const [simboloNeg, setSimboloNeg] = useState('O');
  const [estadoNeg, setEstadoNeg] = useState(-2);

  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático en el buscador: es una app de consulta rápida
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const elementosFiltrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return ELEMENTOS.filter((el) => {
      if (categoria !== 'todas' && el.categoria !== categoria) return false;
      if (!q) return true;
      if (normalizar(el.simbolo) === q) return true;
      if (normalizar(el.simbolo).startsWith(q)) return true;
      if (normalizar(el.nombre).includes(q)) return true;
      if (el.sinonimos.some((s) => normalizar(s).includes(q))) return true;
      if (el.estados.some((e) => normalizar(e.ejemplo).includes(q))) return true;
      return false;
    });
  }, [busqueda, categoria]);

  const elementosPositivos = useMemo(
    () => ELEMENTOS.filter((el) => el.estados.some((e) => e.valor > 0)),
    [],
  );
  const elementosNegativos = useMemo(
    () => ELEMENTOS.filter((el) => el.estados.some((e) => e.valor < 0)),
    [],
  );

  const elPos = ELEMENTOS.find((e) => e.simbolo === simboloPos) ?? elementosPositivos[0];
  const elNeg = ELEMENTOS.find((e) => e.simbolo === simboloNeg) ?? elementosNegativos[0];

  const opcionesPos = elPos.estados.filter((e) => e.valor > 0);
  // El oxígeno con −1 (peróxidos) se excluye: el grupo O₂²⁻ es una unidad y sus
  // subíndices no se simplifican, así que no sigue la regla del intercambio.
  const opcionesNeg = elNeg.estados.filter(
    (e) => e.valor < 0 && !(elNeg.simbolo === 'O' && e.valor === -1),
  );

  const compuesto = formularBinario(elPos, estadoPos, elNeg, estadoNeg);

  const cambiarElementoPos = (simbolo: string) => {
    const nuevo = ELEMENTOS.find((e) => e.simbolo === simbolo);
    if (!nuevo) return;
    const positivos = nuevo.estados.filter((e) => e.valor > 0);
    const preferido = positivos.find((e) => e.masComun) ?? positivos[0];
    setSimboloPos(simbolo);
    setEstadoPos(preferido ? preferido.valor : 1);
  };

  const cambiarElementoNeg = (simbolo: string) => {
    const nuevo = ELEMENTOS.find((e) => e.simbolo === simbolo);
    if (!nuevo) return;
    const negativos = nuevo.estados.filter((e) => e.valor < 0);
    const preferido = negativos.find((e) => e.masComun) ?? negativos[0];
    setSimboloNeg(simbolo);
    setEstadoNeg(preferido ? preferido.valor : -1);
  };

  const etiquetaCategoria = (id: CategoriaId): string =>
    CATEGORIAS.find((c) => c.id === id)?.etiqueta ?? '';

  const colorCategoria = (id: CategoriaId): string =>
    CATEGORIAS.find((c) => c.id === id)?.color ?? '#7FB3D3';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ═══════════ HERO ═══════════ */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚗️</span> Tabla de Valencias y Números de Oxidación
        </h1>
        <p className={styles.subtitle}>
          Busca cualquier elemento y consulta al instante con qué números de oxidación actúa,
          con ejemplos de compuestos reales, iones poliatómicos, las tres nomenclaturas y un
          formulador de compuestos binarios.
        </p>
      </header>

      <LegalNotice />

      {/* ═══════════ ACLARACIÓN VALENCIA vs Nº OXIDACIÓN ═══════════ */}
      <div className={styles.aclaracionBox}>
        <h2>
          <span aria-hidden="true">🔎</span> Valencia y número de oxidación no son lo mismo
        </h2>
        <p>
          La <strong>valencia</strong> es la capacidad de combinación de un átomo —cuántos enlaces
          forma— y se escribe <strong>sin signo</strong>. El <strong>número de oxidación</strong> es
          una convención contable: la carga que tendría ese átomo si todos sus enlaces fueran
          iónicos, y siempre lleva <strong>signo</strong>. En el agua (H₂O) el oxígeno tiene valencia 2
          y número de oxidación −2; en el agua oxigenada (H₂O₂) sigue teniendo valencia 2, pero su
          número de oxidación pasa a −1.
        </p>
        <p className={styles.aclaracionNota}>
          Casi todo el mundo dice «tabla de valencias» cuando en realidad busca los números de
          oxidación. Es lo que encontrarás aquí, con la valencia indicada aparte en cada elemento.
        </p>
      </div>

      {/* ═══════════ BUSCADOR + FILTROS ═══════════ */}
      <section className={styles.buscadorPanel} aria-label="Buscador de elementos">
        <div className={styles.buscadorCampo}>
          <label htmlFor="buscador-elemento" className={styles.buscadorLabel}>
            Busca un elemento por símbolo, nombre o nombre tradicional
          </label>
          <input
            id="buscador-elemento"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="hierro, Fe, ferroso, manganeso, cloro…"
            autoComplete="off"
            inputMode="search"
          />
        </div>

        <div className={styles.filtrosBotones} role="group" aria-label="Filtrar por familia">
          <button
            type="button"
            className={`${styles.btnFiltro} ${categoria === 'todas' ? styles.btnFiltroActivo : ''}`}
            aria-pressed={categoria === 'todas'}
            onClick={() => setCategoria('todas')}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.btnFiltro} ${categoria === cat.id ? styles.btnFiltroActivo : ''}`}
              aria-pressed={categoria === cat.id}
              onClick={() => setCategoria(cat.id)}
            >
              {cat.corta}
            </button>
          ))}
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {elementosFiltrados.length === ELEMENTOS.length
            ? `${ELEMENTOS.length} elementos en la tabla`
            : `${elementosFiltrados.length} de ${ELEMENTOS.length} elementos`}
        </p>

        <div className={styles.leyendaChips}>
          <span className={`${styles.chip} ${styles.chipComun}`}>+3</span>
          <span className={styles.leyendaTexto}>estado más frecuente del elemento</span>
          <span className={`${styles.chip} ${styles.chipRaro}`}>+3</span>
          <span className={styles.leyendaTexto}>estado poco frecuente</span>
        </div>
      </section>

      {/* ═══════════ TABLA DE ELEMENTOS ═══════════ */}
      <section className={styles.elementosLista} aria-label="Elementos y sus números de oxidación">
        {elementosFiltrados.length === 0 && (
          <p className={styles.sinResultados}>
            No hay ningún elemento que coincida con «{busqueda}». Prueba con el símbolo (Fe), el
            nombre (hierro) o el nombre tradicional (férrico).
          </p>
        )}

        {elementosFiltrados.map((el) => {
          const abierto = expandido === el.simbolo;
          return (
            <article key={el.simbolo} className={styles.elementoFila}>
              <button
                type="button"
                className={styles.elementoCabecera}
                aria-expanded={abierto}
                onClick={() => setExpandido(abierto ? null : el.simbolo)}
              >
                <span
                  className={styles.simboloBox}
                  style={{ background: colorCategoria(el.categoria) }}
                >
                  <span className={styles.simboloZ}>{el.z}</span>
                  <span className={styles.simboloTexto}>{el.simbolo}</span>
                </span>

                <span className={styles.elementoIdent}>
                  <span className={styles.elementoNombre}>{el.nombre}</span>
                  <span className={styles.elementoMeta}>
                    {etiquetaCategoria(el.categoria)} · Valencia {el.valencias}
                  </span>
                </span>

                <span className={styles.chipsEstados}>
                  {el.estados.map((est) => (
                    <span
                      key={est.valor}
                      className={`${styles.chip} ${est.frecuente ? styles.chipHabitual : styles.chipRaro} ${est.masComun ? styles.chipComun : ''}`}
                      title={
                        est.masComun
                          ? 'Estado más frecuente'
                          : est.frecuente
                            ? 'Estado habitual'
                            : 'Estado poco frecuente'
                      }
                    >
                      {formatearEstado(est.valor)}
                    </span>
                  ))}
                </span>

                <span className={styles.flecha} aria-hidden="true">
                  {abierto ? '▲' : '▼'}
                </span>
              </button>

              {abierto && (
                <div className={styles.elementoDetalle}>
                  {el.nota && <p className={styles.detalleNota}>{el.nota}</p>}

                  <h3 className={styles.detalleTitulo}>Estados de oxidación con ejemplos reales</h3>
                  <ul className={styles.detalleEstados}>
                    {el.estados.map((est) => (
                      <li key={est.valor} className={styles.detalleEstado}>
                        <span
                          className={`${styles.chip} ${est.frecuente ? styles.chipHabitual : styles.chipRaro} ${est.masComun ? styles.chipComun : ''}`}
                        >
                          {formatearEstado(est.valor)}
                        </span>
                        <span className={styles.detalleEjemplo}>
                          <strong>{est.ejemplo}</strong> — {est.nombreEjemplo}
                          {est.masComun && <em className={styles.detalleBadge}> el más frecuente</em>}
                          {!est.frecuente && <em className={styles.detalleBadgeRaro}> poco frecuente</em>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {el.tradicional && Object.keys(el.tradicional).length > 0 && (
                    <>
                      <h3 className={styles.detalleTitulo}>Nombre tradicional según el estado</h3>
                      <ul className={styles.detalleTradicional}>
                        {Object.entries(el.tradicional).map(([valor, adjetivo]) => (
                          <li key={valor}>
                            <span className={styles.chipMini}>{formatearEstado(Number(valor))}</span>
                            <span>
                              <strong>{adjetivo}</strong> — por ejemplo, óxido {adjetivo} y cloruro{' '}
                              {adjetivo}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <p className={styles.detalleGrupo}>
                    {el.grupo} · Número atómico {el.z} · Valencia {el.valencias}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* ═══════════ FORMULADOR DE COMPUESTOS BINARIOS ═══════════ */}
      <section className={styles.formuladorPanel} aria-label="Formulador de compuestos binarios">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🧪</span> Formulador de compuestos binarios
        </h2>
        <p className={styles.seccionSubtitulo}>
          Elige los dos elementos y sus números de oxidación. La herramienta intercambia las
          valencias, simplifica los subíndices y devuelve la fórmula con sus tres nombres.
        </p>

        <div className={styles.formuladorGrid}>
          <div className={styles.formuladorCampo}>
            <label htmlFor="elemento-positivo">Elemento con número de oxidación positivo</label>
            <select
              id="elemento-positivo"
              className={styles.select}
              value={simboloPos}
              onChange={(e) => cambiarElementoPos(e.target.value)}
            >
              {elementosPositivos.map((el) => (
                <option key={el.simbolo} value={el.simbolo}>
                  {el.simbolo} — {el.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formuladorCampo}>
            <label htmlFor="estado-positivo">Su número de oxidación</label>
            <select
              id="estado-positivo"
              className={styles.select}
              value={estadoPos}
              onChange={(e) => setEstadoPos(Number(e.target.value))}
            >
              {opcionesPos.map((est) => (
                <option key={est.valor} value={est.valor}>
                  {formatearEstado(est.valor)}
                  {est.masComun ? ' (el más frecuente)' : est.frecuente ? '' : ' (poco frecuente)'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formuladorCampo}>
            <label htmlFor="elemento-negativo">Elemento con número de oxidación negativo</label>
            <select
              id="elemento-negativo"
              className={styles.select}
              value={simboloNeg}
              onChange={(e) => cambiarElementoNeg(e.target.value)}
            >
              {elementosNegativos.map((el) => (
                <option key={el.simbolo} value={el.simbolo}>
                  {el.simbolo} — {el.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formuladorCampo}>
            <label htmlFor="estado-negativo">Su número de oxidación</label>
            <select
              id="estado-negativo"
              className={styles.select}
              value={estadoNeg}
              onChange={(e) => setEstadoNeg(Number(e.target.value))}
            >
              {opcionesNeg.map((est) => (
                <option key={est.valor} value={est.valor}>
                  {formatearEstado(est.valor)}
                  {est.masComun ? ' (el más frecuente)' : est.frecuente ? '' : ' (poco frecuente)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {compuesto ? (
          <div className={styles.resultadoFormula} role="status" aria-live="polite">
            <p className={styles.formulaGrande}>
              {compuesto.partes.map((p, i) => (
                <span key={`${p.simbolo}-${i}`}>
                  {p.simbolo}
                  {p.sub > 1 && <sub>{p.sub}</sub>}
                </span>
              ))}
            </p>

            <dl className={styles.nombresLista}>
              <div className={styles.nombreItem}>
                <dt>Nomenclatura sistemática</dt>
                <dd>{compuesto.sistematica}</dd>
              </div>
              <div className={styles.nombreItem}>
                <dt>Nomenclatura de Stock</dt>
                <dd>{compuesto.stock}</dd>
              </div>
              <div className={styles.nombreItem}>
                <dt>Nomenclatura tradicional</dt>
                <dd>{compuesto.tradicional}</dd>
              </div>
              {compuesto.comun && (
                <div className={styles.nombreItem}>
                  <dt>Nombre común</dt>
                  <dd>{compuesto.comun}</dd>
                </div>
              )}
            </dl>

            <p className={styles.explicacionCruce}>
              Se cruzan los valores absolutos ({formatearEstado(estadoPos)} y{' '}
              {formatearEstado(estadoNeg)}) y se simplifican los subíndices dividiendo por su máximo
              común divisor.
            </p>

            {compuesto.advertencia && (
              <p className={styles.avisoFormula}>
                <span aria-hidden="true">⚠️</span> {compuesto.advertencia}
              </p>
            )}
          </div>
        ) : (
          <p className={styles.sinResultados}>
            Elige dos elementos distintos, uno con estado positivo y otro con estado negativo.
          </p>
        )}

        <p className={styles.notaFormulador}>
          <span aria-hidden="true">ℹ️</span> Los peróxidos (H₂O₂, Na₂O₂) no aparecen aquí: el grupo
          O₂²⁻ es una unidad y sus subíndices no se simplifican, así que no siguen la regla del
          intercambio. Tampoco se incluyen los compuestos ternarios ni las sales de oxoácidos.
        </p>
      </section>

      {/* ═══════════ LAS TRES NOMENCLATURAS ═══════════ */}
      <section className={styles.nomenclaturaPanel} aria-label="Las tres nomenclaturas de la IUPAC">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">🏷️</span> Las tres nomenclaturas, sobre los mismos ejemplos
        </h2>
        <p className={styles.seccionSubtitulo}>
          Aquí es donde se pierde casi todo el mundo: el mismo compuesto tiene tres nombres válidos
          según el sistema que uses. Compara columna a columna.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Fórmula</th>
                <th scope="col">Estado de oxidación</th>
                <th scope="col">Sistemática (prefijos)</th>
                <th scope="col">Stock (números romanos)</th>
                <th scope="col">Tradicional (-oso / -ico)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CO</strong></td>
                <td>C: +2</td>
                <td>monóxido de carbono</td>
                <td>óxido de carbono(II)</td>
                <td>óxido carbonoso</td>
              </tr>
              <tr>
                <td><strong>CO₂</strong></td>
                <td>C: +4</td>
                <td>dióxido de carbono</td>
                <td>óxido de carbono(IV)</td>
                <td>óxido carbónico</td>
              </tr>
              <tr>
                <td><strong>FeO</strong></td>
                <td>Fe: +2</td>
                <td>monóxido de hierro</td>
                <td>óxido de hierro(II)</td>
                <td>óxido ferroso</td>
              </tr>
              <tr>
                <td><strong>Fe₂O₃</strong></td>
                <td>Fe: +3</td>
                <td>trióxido de dihierro</td>
                <td>óxido de hierro(III)</td>
                <td>óxido férrico</td>
              </tr>
              <tr>
                <td><strong>SO₂</strong></td>
                <td>S: +4</td>
                <td>dióxido de azufre</td>
                <td>óxido de azufre(IV)</td>
                <td>óxido sulfuroso</td>
              </tr>
              <tr>
                <td><strong>SO₃</strong></td>
                <td>S: +6</td>
                <td>trióxido de azufre</td>
                <td>óxido de azufre(VI)</td>
                <td>óxido sulfúrico</td>
              </tr>
              <tr>
                <td><strong>Cl₂O</strong></td>
                <td>Cl: +1</td>
                <td>monóxido de dicloro</td>
                <td>óxido de cloro(I)</td>
                <td>óxido hipocloroso</td>
              </tr>
              <tr>
                <td><strong>Cl₂O₇</strong></td>
                <td>Cl: +7</td>
                <td>heptaóxido de dicloro</td>
                <td>óxido de cloro(VII)</td>
                <td>óxido perclórico</td>
              </tr>
              <tr>
                <td><strong>CuCl</strong></td>
                <td>Cu: +1</td>
                <td>monocloruro de cobre</td>
                <td>cloruro de cobre(I)</td>
                <td>cloruro cuproso</td>
              </tr>
              <tr>
                <td><strong>CuCl₂</strong></td>
                <td>Cu: +2</td>
                <td>dicloruro de cobre</td>
                <td>cloruro de cobre(II)</td>
                <td>cloruro cúprico</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.sufijosGrid}>
          <div className={styles.sufijoCard}>
            <h3>Con 1 estado de oxidación</h3>
            <p>
              Solo el sufijo <strong>-ico</strong> (o directamente «de + nombre»): óxido sódico u
              óxido de sodio. En Stock no se escribe número romano, porque no hay ambigüedad.
            </p>
          </div>
          <div className={styles.sufijoCard}>
            <h3>Con 2 estados</h3>
            <p>
              <strong>-oso</strong> para el menor y <strong>-ico</strong> para el mayor:
              ferroso (+2) / férrico (+3), cuproso (+1) / cúprico (+2), plumboso (+2) / plúmbico (+4).
            </p>
          </div>
          <div className={styles.sufijoCard}>
            <h3>Con 3 estados</h3>
            <p>
              <strong>hipo—oso</strong>, <strong>-oso</strong> e <strong>-ico</strong> de menor a
              mayor. Se usa, por ejemplo, en algunos oxoácidos del grupo 16.
            </p>
          </div>
          <div className={styles.sufijoCard}>
            <h3>Con 4 estados</h3>
            <p>
              <strong>hipo—oso</strong>, <strong>-oso</strong>, <strong>-ico</strong> y{' '}
              <strong>per—ico</strong>. Caso típico de los halógenos: hipocloroso (+1), cloroso (+3),
              clórico (+5), perclórico (+7).
            </p>
          </div>
        </div>

        <div className={styles.prefijosBox}>
          <h3>Prefijos multiplicadores de la nomenclatura sistemática</h3>
          <p className={styles.prefijosLista}>
            1 mono- · 2 di- · 3 tri- · 4 tetra- · 5 penta- · 6 hexa- · 7 hepta- · 8 octa- ·
            9 nona- · 10 deca-
          </p>
          <p>
            El prefijo <strong>mono-</strong> se omite casi siempre; se conserva cuando hace falta
            distinguir dos compuestos del mismo par de elementos, como en monóxido de carbono (CO)
            frente a dióxido de carbono (CO₂).
          </p>
        </div>
      </section>

      {/* ═══════════ IONES POLIATÓMICOS ═══════════ */}
      <section className={styles.ionesPanel} aria-label="Iones poliatómicos frecuentes">
        <h2 className={styles.seccionTitulo}>
          <span aria-hidden="true">⚛️</span> Iones poliatómicos frecuentes
        </h2>
        <p className={styles.seccionSubtitulo}>
          Grupos de átomos que se comportan como una unidad con carga propia. Conviene sabérselos de
          memoria: aparecen en casi todas las sales de los ejercicios.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Ion</th>
                <th scope="col">Fórmula</th>
                <th scope="col">Carga</th>
                <th scope="col">Átomo central</th>
                <th scope="col">Dónde aparece</th>
              </tr>
            </thead>
            <tbody>
              {IONES.map((ion) => (
                <tr key={ion.formula}>
                  <td><strong>{ion.nombre}</strong></td>
                  <td>{ion.formula}</td>
                  <td>{ion.carga}</td>
                  <td>{ion.central}</td>
                  <td>{ion.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════ CONTENIDO EDUCATIVO v2.0 ═══════════ */}
      <EducationalSection
        icon="📚"
        title="Entender las valencias, no memorizarlas"
        subtitle="De dónde salen los números de oxidación, cómo se deducen dentro de un compuesto y por qué la nomenclatura tradicional sigue viva"
      >
        {/* Introducción */}
        <section className={styles.introSection}>
          <h2>¿Por qué cada elemento tiene esos estados y no otros?</h2>
          <p>
            Los números de oxidación de los elementos representativos no son arbitrarios: salen de
            los <strong>electrones de valencia</strong>, los de la última capa. Un átomo tiende a
            quedarse con ocho electrones en esa capa (regla del octeto), la configuración de gas
            noble, porque es especialmente estable.
          </p>
          <p>
            Por eso el sodio, con un electrón de valencia, lo cede y queda en +1; el magnesio cede
            dos y queda en +2; el aluminio cede tres y queda en +3. Y por el otro extremo: al
            oxígeno le faltan dos electrones para el octeto, así que los capta y queda en −2; a los
            halógenos les falta uno, y quedan en −1. El número del grupo predice el estado con
            asombrosa fiabilidad: grupo 1 → +1, grupo 2 → +2, grupo 16 → −2, grupo 17 → −1.
          </p>
          <p>
            Los no metales de los grupos 14 a 17 tienen además estados <em>positivos</em> cuando se
            combinan con un elemento aún más electronegativo, casi siempre el oxígeno. El azufre
            capta electrones frente al hidrógeno (H₂S, −2) pero los cede frente al oxígeno
            (SO₃, +6). No es contradicción: el número de oxidación siempre se asigna comparando
            electronegatividades dentro de ese compuesto concreto.
          </p>

          <h2>¿Por qué los metales de transición tienen varios?</h2>
          <p>
            En los elementos del bloque d los orbitales <strong>3d y 4s tienen energías muy
            parecidas</strong>. Ceder uno, dos o cinco electrones cuesta cantidades de energía
            similares, así que el mismo metal puede formar iones distintos según con quién se
            combine y en qué condiciones. Por eso el manganeso recorre +2, +3, +4, +6 y +7, y el
            cromo +2, +3 y +6.
          </p>
          <p>
            Hay dos excepciones útiles de recordar dentro del bloque d: el <strong>zinc</strong> y el{' '}
            <strong>cadmio</strong> actúan solo con +2, porque su subcapa d está completa y no
            participa; y la <strong>plata</strong>, en la práctica escolar, solo con +1.
          </p>

          <h2>¿Por qué la nomenclatura tradicional sigue viva?</h2>
          <p>
            La IUPAC recomienda las nomenclaturas sistemática y de Stock, y desaconseja la
            tradicional desde hace décadas. Sin embargo, «ácido sulfúrico», «ácido nítrico»,
            «permanganato» o «sulfato ferroso» siguen escritos en etiquetas de reactivos, prospectos,
            legislación, catálogos industriales y libros. Cambiar un vocabulario que lleva dos siglos
            en circulación cuesta mucho más que publicar una recomendación.
          </p>
          <p>
            La consecuencia práctica es que necesitas <strong>leer</strong> las tres nomenclaturas
            aunque solo <strong>escribas</strong> en dos. Si en un examen te piden formular «sulfato
            férrico» y no sabes que «férrico» significa Fe(+3), el ejercicio se cae entero por un
            problema de vocabulario, no de química.
          </p>
        </section>

        {/* 1. Tabla comparativa */}
        <section className={styles.comparativaSection}>
          <h2>Comparativa: cuándo usar cada nomenclatura</h2>
          <p className={styles.comparativaSubtitle}>
            Las tres son correctas para leer; solo dos se recomiendan para escribir.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Criterio</th>
                  <th scope="col">Sistemática</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Tradicional</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cómo indica el estado</strong></td>
                  <td>Con prefijos que cuentan átomos (di-, tri-, tetra-)</td>
                  <td>Con número romano entre paréntesis</td>
                  <td>Con prefijos y sufijos (hipo-, -oso, -ico, per-)</td>
                </tr>
                <tr>
                  <td><strong>Recomendación IUPAC</strong></td>
                  <td><span aria-hidden="true">✅</span> Recomendada</td>
                  <td><span aria-hidden="true">✅</span> Recomendada</td>
                  <td><span aria-hidden="true">⚠️</span> Desaconsejada, pero tolerada</td>
                </tr>
                <tr>
                  <td><strong>Ventaja</strong></td>
                  <td>No hace falta saber el estado: basta contar átomos</td>
                  <td>Nombre corto y sin ambigüedad</td>
                  <td>Muy compacta y arraigada en el habla técnica</td>
                </tr>
                <tr>
                  <td><strong>Inconveniente</strong></td>
                  <td>Nombres largos (heptaóxido de dicloro)</td>
                  <td>Exige conocer el estado del elemento</td>
                  <td>Hay que memorizar raíces irregulares (ferroso, plúmbico)</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo con Fe₂O₃</strong></td>
                  <td>trióxido de dihierro</td>
                  <td>óxido de hierro(III)</td>
                  <td>óxido férrico</td>
                </tr>
                <tr>
                  <td><strong>Dónde la verás</strong></td>
                  <td>Libros de texto y exámenes actuales</td>
                  <td>Artículos científicos y fichas de seguridad</td>
                  <td>Etiquetas de reactivos, prospectos y normativa antigua</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Escenarios */}
        <section className={styles.escenariosSection}>
          <h2>Cuatro situaciones donde esta tabla resuelve el atasco</h2>
          <p className={styles.escenariosSubtitle}>
            Perfiles reales de quien llega buscando «tabla de valencias».
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📝</span>
                <h3>Secundaria (ESO): formular óxidos y sales binarias</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Te piden formular «óxido de aluminio». Buscas Al: actúa solo con +3. El oxígeno, −2.
                Cruzas: Al₂O₃. Un solo estado significa que no puede haber trampa.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Atajo:</strong> los elementos con un único estado (Na, Ca, Al, Zn, Ag, F) son
                los que conviene aprender primero; con ellos ya formulas media hoja de ejercicios.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
                <h3>Bachillerato o preparatoria: ajustar una redox</h3>
              </div>
              <p className={styles.escenarioDesc}>
                En la reacción del permanganato con Fe²⁺ necesitas los estados antes y después: el
                Mn pasa de +7 (MnO₄⁻) a +2 (Mn²⁺), y el hierro de +2 a +3. Sin esos números no hay
                semirreacciones ni electrones que igualar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> escribe siempre el estado encima de cada símbolo antes de
                plantear las semirreacciones. Ahorra la mitad de los errores.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h3>Examen de admisión universitaria</h3>
              </div>
              <p className={styles.escenarioDesc}>
                La formulación suele valer entre medio punto y un punto entero, y se resuelve en dos
                minutos si te sabes las valencias. Es la parte del examen con mejor relación entre
                nota y tiempo de estudio.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Prioriza:</strong> los 20 elementos más frecuentes y los 10 iones
                poliatómicos más repetidos cubren la práctica totalidad de lo que cae.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
                <h3>Laboratorio: leer la etiqueta de un reactivo</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Un frasco dice «sulfato ferroso heptahidratado». Necesitas saber que ferroso es
                Fe(+2) para escribir FeSO₄·7H₂O y calcular la masa molar de la disolución que vas a
                preparar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Ojo:</strong> muchas etiquetas comerciales siguen usando nomenclatura
                tradicional aunque el prospecto técnico use Stock.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Valencia y número de oxidación son sinónimos?</p>
              <p className={styles.faqAnswer}>
                No. La valencia cuenta enlaces y no lleva signo; el número de oxidación es una
                convención contable y sí lo lleva. En el etano (C₂H₆) cada carbono tiene valencia 4,
                pero su número de oxidación es −3. Coinciden en muchos compuestos sencillos, y de ahí
                viene la confusión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿El oxígeno siempre vale −2?</p>
              <p className={styles.faqAnswer}>
                Casi siempre, pero no. Vale −1 en los peróxidos (H₂O₂, Na₂O₂), −½ en los superóxidos
                (KO₂) y positivo únicamente frente al flúor, el único elemento más electronegativo
                que él: en OF₂ el oxígeno actúa con +2.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Y el hidrógeno?</p>
              <p className={styles.faqAnswer}>
                Vale +1 frente a los no metales (H₂O, HCl, NH₃) y −1 en los hidruros metálicos
                (NaH, CaH₂, LiAlH₄), donde el metal es menos electronegativo que él. Si en un
                compuesto ves hidrógeno junto a un metal alcalino o alcalinotérreo, el hidrógeno es
                negativo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Cuáles son los elementos más «tramposos»?</p>
              <p className={styles.faqAnswer}>
                El manganeso (+2, +3, +4, +6, +7) y el cromo (+2, +3, +6) por número de estados; el
                nitrógeno porque recorre de −3 a +5; y el plomo y el estaño porque su estado más
                estable es el contrario en cada uno (+2 en el plomo, +4 en el estaño).
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿El flúor puede ser positivo alguna vez?</p>
              <p className={styles.faqAnswer}>
                No. Es el elemento más electronegativo de toda la tabla, así que en cualquier
                compuesto siempre atrae los electrones y su número de oxidación es −1. Es la única
                regla de esta lista que no tiene excepciones.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Los gases nobles tienen valencia?</p>
              <p className={styles.faqAnswer}>
                Su estado normal es 0 porque ya tienen la capa completa. El helio, el neón y el argón
                no forman compuestos estables. El kriptón y sobre todo el xenón sí, pero solo con
                flúor y oxígeno: XeF₂, XeF₄, XeO₃, XeO₄.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Por qué el subíndice a veces se simplifica?</p>
              <p className={styles.faqAnswer}>
                Porque una fórmula empírica indica la proporción más simple. Al cruzar Ca(+2) con
                O(−2) sale Ca₂O₂, que se simplifica dividiendo por 2 y queda CaO. Excepción notable:
                los peróxidos (H₂O₂, Na₂O₂) no se simplifican, porque el ion peróxido O₂²⁻ es una
                unidad real.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Merece la pena memorizar la tabla entera?</p>
              <p className={styles.faqAnswer}>
                No. Los elementos representativos se deducen del grupo, así que solo hay que
                memorizar de verdad los metales de transición frecuentes (Fe, Cu, Mn, Cr, Co, Ni,
                Pb, Sn, Hg, Au) y los iones poliatómicos. Son unas 25 entradas, no cien.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guiaSection}>
          <h2>Cómo deducir el número de oxidación dentro de un compuesto</h2>
          <p className={styles.guiaSubtitle}>
            Siete pasos que funcionan siempre, con el ejemplo del dicromato de potasio (K₂Cr₂O₇).
          </p>
          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Un elemento libre vale 0</h3>
                <p>
                  Da igual cómo esté agrupado: Fe, O₂, Cl₂, P₄ y S₈ tienen todos número de oxidación
                  0. Si tu compuesto es un elemento puro, ya has terminado.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Coloca los elementos con estado fijo</h3>
                <p>
                  Grupo 1 → +1, grupo 2 → +2, aluminio → +3, flúor → −1. En K₂Cr₂O₇ el potasio es
                  +1 sin discusión posible.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Aplica la regla del oxígeno</h3>
                <p>
                  −2 salvo peróxidos (−1), superóxidos (−½) y compuestos con flúor (positivo). En
                  K₂Cr₂O₇ no hay enlaces O—O de peróxido, así que cada oxígeno vale −2.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Aplica la regla del hidrógeno</h3>
                <p>
                  +1 salvo en hidruros metálicos, donde vale −1. En este ejemplo no hay hidrógeno,
                  pero es el segundo anclaje más útil después del oxígeno.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Escribe la ecuación de suma</h3>
                <p>
                  La suma de todos los números de oxidación multiplicados por sus subíndices es 0 en
                  un compuesto neutro, o igual a la carga en un ion. Aquí:
                  2(+1) + 2·x + 7(−2) = 0.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Despeja la incógnita</h3>
                <p>
                  2 + 2x − 14 = 0 → 2x = 12 → x = +6. El cromo actúa con +6 en el dicromato, que es
                  precisamente por lo que es un oxidante tan fuerte.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Comprueba que el resultado es posible</h3>
                <p>
                  Vuelve a la tabla: ¿está +6 entre los estados del cromo? Sí. Si te sale un valor
                  que el elemento no tiene (por ejemplo Fe con +5), hay un error aritmético o has
                  copiado mal la fórmula.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.tipsSection}>
          <h2>Seis hábitos que aceleran la formulación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🧭</div>
              <h3>Aprende por grupos, no por elementos</h3>
              <p>
                Memorizar «grupo 17 → −1 y +1, +3, +5, +7» cubre cloro, bromo y yodo de una vez. Son
                tres elementos por el precio de uno.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🎯</div>
              <h3>Empieza por el estado más frecuente</h3>
              <p>
                Si dudas, el estado marcado como más frecuente acierta en la mayoría de ejercicios:
                Fe(+3), Cu(+2), Mn(+2), Pb(+2), Sn(+4), N(+5).
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">✍️</div>
              <h3>Anota el estado encima del símbolo</h3>
              <p>
                Antes de nombrar o ajustar nada, escribe el número sobre cada elemento de la
                fórmula. Es medio segundo que evita la mitad de los fallos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🔁</div>
              <h3>Verifica siempre en los dos sentidos</h3>
              <p>
                Formula a partir del nombre y, después, vuelve a nombrar la fórmula que has escrito.
                Si no regresas al punto de partida, algo falla.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🧱</div>
              <h3>Trata los iones poliatómicos como bloques</h3>
              <p>
                El sulfato SO₄²⁻ funciona como una pieza única de carga −2. No lo desmontes: cruza
                su carga igual que harías con un elemento.
              </p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">📖</div>
              <h3>Lee las tres nomenclaturas, escribe en dos</h3>
              <p>
                Practica escribiendo en sistemática y Stock, pero entrena la lectura de la
                tradicional: la vas a encontrar en etiquetas y enunciados antiguos.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Warning box */}
        <div className={styles.warningBox}>
          <h2>
            <span aria-hidden="true">⚠️</span> Errores que cuestan puntos en el examen
          </h2>
          <ul className={styles.warningList}>
            <li>
              <strong>Dar al flúor un estado positivo:</strong> es el elemento más electronegativo
              de la tabla y siempre actúa con −1. Si tu ecuación te obliga a ponerle +1, el error
              está en otra parte de la fórmula.
            </li>
            <li>
              <strong>Poner el oxígeno a −2 en un peróxido:</strong> en H₂O₂ y Na₂O₂ cada oxígeno
              vale −1. Si aplicas −2 te saldrá un hidrógeno con +2, que no existe.
            </li>
            <li>
              <strong>Simplificar los subíndices de un peróxido:</strong> H₂O₂ no se reduce a HO. El
              ion peróxido O₂²⁻ es una unidad real y la fórmula debe reflejarlo.
            </li>
            <li>
              <strong>Confundir -oso con «el que actúa poco»:</strong> el sufijo -oso indica el
              estado <em>menor</em> de ese elemento, no el menos frecuente. El hierro ferroso (+2)
              es muy común.
            </li>
            <li>
              <strong>Olvidar el número romano en Stock cuando hace falta:</strong> «óxido de
              hierro» es ambiguo (FeO o Fe₂O₃). Escribe siempre el estado cuando el elemento tenga
              más de uno positivo.
            </li>
            <li>
              <strong>Escribir HgCl para el mercurio(I):</strong> en ese estado el mercurio existe
              como ion diatómico Hg₂²⁺, así que la fórmula correcta es Hg₂Cl₂.
            </li>
            <li>
              <strong>Aplicar la valencia con signo:</strong> la valencia no lo lleva. Decir
              «valencia −2 del oxígeno» mezcla los dos conceptos y suele restar en las preguntas
              teóricas.
            </li>
            <li>
              <strong>Inventar estados poco comunes:</strong> Fe(+6) o Cu(+3) existen en el
              laboratorio, pero no en un ejercicio de secundaria o bachillerato. Si te salen,
              revisa el planteamiento antes que la tabla.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-valencias')} />

      <ShareCard appName="tabla-valencias" />

      <Footer appName="tabla-valencias" />
    </div>
  );
}

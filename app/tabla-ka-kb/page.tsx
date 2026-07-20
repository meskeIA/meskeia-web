'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaKaKb.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';

/* ────────────────────────────────────────────────────────────────
   Constante del producto iónico del agua a 25 °C
──────────────────────────────────────────────────────────────── */
const KW = 1.0e-14;
const PKW = 14;

/* ────────────────────────────────────────────────────────────────
   Utilidades de formato y búsqueda
──────────────────────────────────────────────────────────────── */

/** Normaliza texto para buscar sin acentos ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const SUPERINDICES: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

/** Convierte un entero en superíndice tipográfico: −14 → ⁻¹⁴ */
function superIndice(numero: number): string {
  return String(numero)
    .split('')
    .map((caracter) => SUPERINDICES[caracter] ?? caracter)
    .join('');
}

/**
 * Notación científica en formato español: 1,8×10⁻⁵
 * (coma decimal y exponente como superíndice, nunca «1.8e-5»).
 */
function notacionCientifica(valor: number, decimales = 1): string {
  if (!Number.isFinite(valor) || valor === 0) return '—';
  const exponente = Math.floor(Math.log10(Math.abs(valor)));
  const mantisa = valor / Math.pow(10, exponente);
  return `${formatNumber(mantisa, decimales)}×10${superIndice(exponente)}`;
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

type CategoriaId =
  | 'acidos-fuertes'
  | 'acidos-inorganicos'
  | 'acidos-organicos'
  | 'poliproticos'
  | 'bases-fuertes'
  | 'bases-debiles'
  | 'conjugadas';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface Especie {
  id: string;
  categoria: CategoriaId;
  /** Fórmula química de la especie que actúa como ácido o como base */
  formula: string;
  nombre: string;
  /** Equilibrio de disociación completo, escrito */
  equilibrio: string;
  /** 'acido' → la constante es Ka; 'base' → la constante es Kb */
  tipo: 'acido' | 'base';
  /** Electrolito fuerte: se disocia prácticamente al 100 % en agua */
  fuerte: boolean;
  /** Ka (si tipo = 'acido') o Kb (si tipo = 'base'). null en electrolitos fuertes */
  constante: number | null;
  /** Valor orientativo de pKa para los ácidos fuertes (no medible en agua) */
  pkaNominal?: number;
  /** Iones OH⁻ liberados por unidad de fórmula (bases fuertes) */
  ionesOH?: number;
  /** Especie conjugada */
  conjugadaFormula: string;
  conjugadaNombre: string;
  /** Nota química relevante (aproximaciones, discrepancias entre fuentes…) */
  nota?: string;
  /** Dónde aparece en el mundo real */
  aplicacion?: string;
  /** Texto plano para el buscador: sinónimos, nombres coloquiales, variantes */
  busqueda: string;
}

const CATEGORIAS: Categoria[] = [
  { id: 'acidos-fuertes', nombre: 'Ácidos fuertes', icono: '🔴' },
  { id: 'acidos-inorganicos', nombre: 'Ácidos débiles inorgánicos', icono: '⚗️' },
  { id: 'acidos-organicos', nombre: 'Ácidos orgánicos', icono: '🍋' },
  { id: 'poliproticos', nombre: 'Ácidos polipróticos', icono: '🪜' },
  { id: 'bases-fuertes', nombre: 'Bases fuertes', icono: '🔵' },
  { id: 'bases-debiles', nombre: 'Bases débiles', icono: '💧' },
  { id: 'conjugadas', nombre: 'Bases conjugadas', icono: '🔗' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  'acidos-fuertes': 'Ácidos fuertes',
  'acidos-inorganicos': 'Ácidos débiles inorgánicos',
  'acidos-organicos': 'Ácidos orgánicos',
  poliproticos: 'Ácidos polipróticos',
  'bases-fuertes': 'Bases fuertes',
  'bases-debiles': 'Bases débiles',
  conjugadas: 'Bases conjugadas',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE CONSTANTES (25 °C)
   Valores de consenso de los textos de química general
   (Chang, Petrucci, Atkins) y del CRC Handbook. Se usan pocas
   cifras significativas a propósito: la tercera cifra varía de una
   fuente a otra y no cambia ningún resultado práctico.
──────────────────────────────────────────────────────────────── */

const ESPECIES: Especie[] = [
  /* ── Ácidos fuertes ───────────────────────────────────────── */
  {
    id: 'hclo4',
    categoria: 'acidos-fuertes',
    formula: 'HClO₄',
    nombre: 'Ácido perclórico',
    equilibrio: 'HClO₄ + H₂O → ClO₄⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -8,
    conjugadaFormula: 'ClO₄⁻',
    conjugadaNombre: 'Ion perclorato (base despreciable)',
    nota: 'Se considera el ácido más fuerte de los comunes en disolución acuosa. Su Ka no es medible en agua.',
    aplicacion: 'Digestión de muestras en análisis químico y química de propulsantes.',
    busqueda:
      'perclorico hclo4 acido fuerte perclorato ka muy grande efecto nivelador acido mineral',
  },
  {
    id: 'hi',
    categoria: 'acidos-fuertes',
    formula: 'HI',
    nombre: 'Ácido yodhídrico',
    equilibrio: 'HI + H₂O → I⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -10,
    conjugadaFormula: 'I⁻',
    conjugadaNombre: 'Ion yoduro (base despreciable)',
    nota: 'De los hidrácidos del grupo 17, el más fuerte: el enlace H–I es el más débil y se rompe con más facilidad.',
    busqueda: 'yodhidrico iodhidrico hi acido fuerte yoduro hidracido halogenuro',
  },
  {
    id: 'hbr',
    categoria: 'acidos-fuertes',
    formula: 'HBr',
    nombre: 'Ácido bromhídrico',
    equilibrio: 'HBr + H₂O → Br⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -9,
    conjugadaFormula: 'Br⁻',
    conjugadaNombre: 'Ion bromuro (base despreciable)',
    busqueda: 'bromhidrico hbr acido fuerte bromuro hidracido halogenuro',
  },
  {
    id: 'hcl',
    categoria: 'acidos-fuertes',
    formula: 'HCl',
    nombre: 'Ácido clorhídrico',
    equilibrio: 'HCl + H₂O → Cl⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -6,
    conjugadaFormula: 'Cl⁻',
    conjugadaNombre: 'Ion cloruro (base despreciable)',
    nota: 'El ácido fuerte de referencia en el laboratorio. En una disolución 0,1 M, el pH es simplemente 1,00.',
    aplicacion:
      'Es el ácido del jugo gástrico y el más habitual en las valoraciones ácido-base del laboratorio.',
    busqueda:
      'clorhidrico hcl acido fuerte cloruro salfuman acido muriatico jugo gastrico hidracido',
  },
  {
    id: 'h2so4-fuerte',
    categoria: 'acidos-fuertes',
    formula: 'H₂SO₄',
    nombre: 'Ácido sulfúrico (1ª disociación)',
    equilibrio: 'H₂SO₄ + H₂O → HSO₄⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -3,
    conjugadaFormula: 'HSO₄⁻',
    conjugadaNombre: 'Ion hidrogenosulfato (ácido débil, ver su fila)',
    nota: 'Solo la primera disociación es completa. La segunda es la de un ácido débil (Ka₂ = 1,2×10⁻²) y sí hay que tenerla en cuenta.',
    aplicacion: 'Electrolito de las baterías de plomo y el producto químico más fabricado del mundo.',
    busqueda:
      'sulfurico h2so4 acido fuerte diprotico hidrogenosulfato bisulfato bateria vitriolo primera disociacion',
  },
  {
    id: 'hno3',
    categoria: 'acidos-fuertes',
    formula: 'HNO₃',
    nombre: 'Ácido nítrico',
    equilibrio: 'HNO₃ + H₂O → NO₃⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -1.4,
    conjugadaFormula: 'NO₃⁻',
    conjugadaNombre: 'Ion nitrato (base despreciable)',
    nota: 'Es el más «flojo» de los ácidos fuertes clásicos: en disoluciones muy concentradas ya se aprecia que no está totalmente disociado.',
    aplicacion: 'Fabricación de fertilizantes nitrogenados y componente de la lluvia ácida.',
    busqueda: 'nitrico hno3 acido fuerte nitrato agua fuerte lluvia acida fertilizante',
  },
  {
    id: 'hclo3',
    categoria: 'acidos-fuertes',
    formula: 'HClO₃',
    nombre: 'Ácido clórico',
    equilibrio: 'HClO₃ + H₂O → ClO₃⁻ + H₃O⁺ (completa)',
    tipo: 'acido',
    fuerte: true,
    constante: null,
    pkaNominal: -1,
    conjugadaFormula: 'ClO₃⁻',
    conjugadaNombre: 'Ion clorato (base despreciable)',
    nota: 'La serie HClO < HClO₂ < HClO₃ < HClO₄ muestra cómo cada oxígeno adicional refuerza la acidez del oxácido.',
    busqueda: 'clorico hclo3 acido fuerte clorato oxacido serie de oxoacidos del cloro',
  },

  /* ── Ácidos débiles inorgánicos ───────────────────────────── */
  {
    id: 'hso4',
    categoria: 'acidos-inorganicos',
    formula: 'HSO₄⁻',
    nombre: 'Ion hidrogenosulfato',
    equilibrio: 'HSO₄⁻ + H₂O ⇌ SO₄²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.2e-2,
    conjugadaFormula: 'SO₄²⁻',
    conjugadaNombre: 'Ion sulfato',
    nota: 'Es la segunda disociación del ácido sulfúrico. Con Ka del orden de 10⁻², está en la frontera entre débil y fuerte: la aproximación del 5 % casi nunca sirve.',
    busqueda:
      'hidrogenosulfato bisulfato hso4 sulfato segunda disociacion del sulfurico ka2 acido debil',
  },
  {
    id: 'hf',
    categoria: 'acidos-inorganicos',
    formula: 'HF',
    nombre: 'Ácido fluorhídrico',
    equilibrio: 'HF + H₂O ⇌ F⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 6.8e-4,
    conjugadaFormula: 'F⁻',
    conjugadaNombre: 'Ion fluoruro',
    nota: 'La excepción del grupo: HCl, HBr y HI son fuertes, pero HF es débil porque el enlace H–F es muy corto y muy fuerte.',
    aplicacion: 'Grabado del vidrio: ataca al dióxido de silicio, cosa que ningún otro ácido común hace.',
    busqueda:
      'fluorhidrico hf acido debil fluoruro grabado vidrio hidracido excepcion halogenuros',
  },
  {
    id: 'hno2',
    categoria: 'acidos-inorganicos',
    formula: 'HNO₂',
    nombre: 'Ácido nitroso',
    equilibrio: 'HNO₂ + H₂O ⇌ NO₂⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.5e-4,
    conjugadaFormula: 'NO₂⁻',
    conjugadaNombre: 'Ion nitrito',
    nota: 'Es inestable: se prepara en el momento a partir de un nitrito y un ácido fuerte. Compara su pKa con el del nítrico para ver el efecto del oxígeno extra.',
    busqueda: 'nitroso hno2 acido debil nitrito oxacido nitrogeno conservante',
  },
  {
    id: 'hclo',
    categoria: 'acidos-inorganicos',
    formula: 'HClO',
    nombre: 'Ácido hipocloroso',
    equilibrio: 'HClO + H₂O ⇌ ClO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 3.0e-8,
    conjugadaFormula: 'ClO⁻',
    conjugadaNombre: 'Ion hipoclorito',
    nota: 'Con pKa 7,52, en el agua de una piscina a pH 7,4 coexisten cantidades comparables de HClO y de ClO⁻; por eso el pH condiciona la eficacia del cloro.',
    aplicacion: 'Es la especie desinfectante que se forma al añadir hipoclorito (lejía) al agua.',
    busqueda:
      'hipocloroso hclo acido debil hipoclorito lejia cloro piscina desinfectante oxacido',
  },
  {
    id: 'hbro',
    categoria: 'acidos-inorganicos',
    formula: 'HBrO',
    nombre: 'Ácido hipobromoso',
    equilibrio: 'HBrO + H₂O ⇌ BrO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 2.5e-9,
    conjugadaFormula: 'BrO⁻',
    conjugadaNombre: 'Ion hipobromito',
    busqueda: 'hipobromoso hbro acido debil hipobromito oxacido bromo',
  },
  {
    id: 'hio',
    categoria: 'acidos-inorganicos',
    formula: 'HIO',
    nombre: 'Ácido hipoyodoso',
    equilibrio: 'HIO + H₂O ⇌ IO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 2.3e-11,
    conjugadaFormula: 'IO⁻',
    conjugadaNombre: 'Ion hipoyodito',
    nota: 'La serie HClO > HBrO > HIO muestra que la acidez del hipohalito cae al bajar en el grupo, porque el halógeno es cada vez menos electronegativo.',
    busqueda: 'hipoyodoso hipoiodoso hio acido debil hipoyodito oxacido yodo',
  },
  {
    id: 'h3bo3',
    categoria: 'acidos-inorganicos',
    formula: 'H₃BO₃',
    nombre: 'Ácido bórico',
    equilibrio: 'H₃BO₃ + 2 H₂O ⇌ B(OH)₄⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 5.8e-10,
    conjugadaFormula: 'B(OH)₄⁻',
    conjugadaNombre: 'Ion tetrahidroxoborato',
    nota: 'No cede un protón propio: actúa como ácido de Lewis captando un OH⁻ del agua. Por eso se comporta como monoprótico pese a tener tres hidrógenos.',
    aplicacion: 'Tampón en disoluciones de laboratorio y componente de vidrios borosilicatados.',
    busqueda: 'borico h3bo3 acido debil borato boro acido de lewis monoprotico borax',
  },
  {
    id: 'nh4',
    categoria: 'acidos-inorganicos',
    formula: 'NH₄⁺',
    nombre: 'Ion amonio',
    equilibrio: 'NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 5.6e-10,
    conjugadaFormula: 'NH₃',
    conjugadaNombre: 'Amoníaco',
    nota: 'Es el ácido conjugado del amoníaco. Explica por qué una disolución de cloruro de amonio, que parece una sal neutra, tiene pH ácido.',
    aplicacion: 'El par NH₄⁺/NH₃ es un tampón habitual en torno a pH 9.',
    busqueda:
      'amonio nh4 acido conjugado amoniaco cloruro de amonio hidrolisis sal acida tampon amoniacal',
  },
  {
    id: 'hcn',
    categoria: 'acidos-inorganicos',
    formula: 'HCN',
    nombre: 'Ácido cianhídrico',
    equilibrio: 'HCN + H₂O ⇌ CN⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.9e-10,
    conjugadaFormula: 'CN⁻',
    conjugadaNombre: 'Ion cianuro',
    nota: 'Ácido extremadamente débil, lo que hace que el cianuro sea una base relativamente fuerte: una disolución de KCN tiene pH claramente básico.',
    busqueda: 'cianhidrico hcn acido debil cianuro prusico hidrolisis basica',
  },

  /* ── Ácidos orgánicos ─────────────────────────────────────── */
  {
    id: 'tricloroacetico',
    categoria: 'acidos-organicos',
    formula: 'CCl₃COOH',
    nombre: 'Ácido tricloroacético',
    equilibrio: 'CCl₃COOH + H₂O ⇌ CCl₃COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 2.2e-1,
    conjugadaFormula: 'CCl₃COO⁻',
    conjugadaNombre: 'Ion tricloroacetato',
    nota: 'Tres cloros atraen la densidad electrónica y estabilizan el anión: es unas 12 000 veces más ácido que el acético.',
    busqueda:
      'tricloroacetico ccl3cooh tca efecto inductivo cloro acido carboxilico fuerte tricloroacetato',
  },
  {
    id: 'dicloroacetico',
    categoria: 'acidos-organicos',
    formula: 'CHCl₂COOH',
    nombre: 'Ácido dicloroacético',
    equilibrio: 'CHCl₂COOH + H₂O ⇌ CHCl₂COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 5.0e-2,
    conjugadaFormula: 'CHCl₂COO⁻',
    conjugadaNombre: 'Ion dicloroacetato',
    busqueda: 'dicloroacetico chcl2cooh efecto inductivo dos cloros dicloroacetato',
  },
  {
    id: 'cloroacetico',
    categoria: 'acidos-organicos',
    formula: 'ClCH₂COOH',
    nombre: 'Ácido cloroacético',
    equilibrio: 'ClCH₂COOH + H₂O ⇌ ClCH₂COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.4e-3,
    conjugadaFormula: 'ClCH₂COO⁻',
    conjugadaNombre: 'Ion cloroacetato',
    nota: 'Un solo cloro ya multiplica la acidez del acético por unas 80 veces. Es el ejemplo clásico del efecto inductivo.',
    busqueda:
      'cloroacetico clch2cooh monocloroacetico efecto inductivo un cloro cloroacetato comparacion con acetico',
  },
  {
    id: 'formico',
    categoria: 'acidos-organicos',
    formula: 'HCOOH',
    nombre: 'Ácido fórmico (metanoico)',
    equilibrio: 'HCOOH + H₂O ⇌ HCOO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.8e-4,
    conjugadaFormula: 'HCOO⁻',
    conjugadaNombre: 'Ion formiato (metanoato)',
    nota: 'Es más ácido que el acético porque no tiene grupo metilo que ceda densidad electrónica al carboxilo.',
    aplicacion: 'Está en el veneno de hormigas y en la picadura de ortiga.',
    busqueda:
      'formico metanoico hcooh acido carboxilico formiato metanoato hormiga ortiga acido debil',
  },
  {
    id: 'lactico',
    categoria: 'acidos-organicos',
    formula: 'CH₃CH(OH)COOH',
    nombre: 'Ácido láctico',
    equilibrio: 'CH₃CH(OH)COOH + H₂O ⇌ CH₃CH(OH)COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.4e-4,
    conjugadaFormula: 'CH₃CH(OH)COO⁻',
    conjugadaNombre: 'Ion lactato',
    nota: 'El grupo −OH vecino al carboxilo lo hace unas ocho veces más ácido que el propanoico, que solo se diferencia en ese detalle.',
    aplicacion: 'Es el ácido que producen las bacterias en la fermentación del yogur y del chucrut.',
    busqueda:
      'lactico ch3ch(oh)cooh lactato yogur fermentacion hidroxiacido leche acido alfa hidroxi',
  },
  {
    id: 'benzoico',
    categoria: 'acidos-organicos',
    formula: 'C₆H₅COOH',
    nombre: 'Ácido benzoico',
    equilibrio: 'C₆H₅COOH + H₂O ⇌ C₆H₅COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 6.3e-5,
    conjugadaFormula: 'C₆H₅COO⁻',
    conjugadaNombre: 'Ion benzoato',
    nota: 'El anillo aromático estabiliza algo el anión, así que es unas tres veces más ácido que el acético.',
    aplicacion: 'Su sal, el benzoato de sodio, se usa como conservante alimentario (E-211).',
    busqueda:
      'benzoico c6h5cooh benzoato conservante e211 aromatico acido carboxilico refresco',
  },
  {
    id: 'butanoico',
    categoria: 'acidos-organicos',
    formula: 'CH₃CH₂CH₂COOH',
    nombre: 'Ácido butanoico (butírico)',
    equilibrio: 'CH₃CH₂CH₂COOH + H₂O ⇌ CH₃CH₂CH₂COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.5e-5,
    conjugadaFormula: 'CH₃CH₂CH₂COO⁻',
    conjugadaNombre: 'Ion butanoato',
    nota: 'Fórmico, acético, propanoico y butanoico tienen pKa muy parecidos: alargar la cadena apenas cambia la acidez.',
    aplicacion: 'Es el responsable del olor característico de la mantequilla rancia.',
    busqueda:
      'butanoico butirico ch3ch2ch2cooh butanoato mantequilla rancia serie homologa acido graso',
  },
  {
    id: 'acetico',
    categoria: 'acidos-organicos',
    formula: 'CH₃COOH',
    nombre: 'Ácido acético (etanoico)',
    equilibrio: 'CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.8e-5,
    conjugadaFormula: 'CH₃COO⁻',
    conjugadaNombre: 'Ion acetato',
    nota: 'El ácido débil de referencia en cualquier curso: pKa 4,74. Con acetato forma el tampón más usado en el laboratorio, útil entre pH 3,7 y 5,7.',
    aplicacion: 'Es el ácido del vinagre, que contiene entre un 4 % y un 8 % en masa.',
    busqueda:
      'acetico etanoico ch3cooh vinagre acetato tampon buffer acido debil ejemplo clasico pka 4,74',
  },
  {
    id: 'propanoico',
    categoria: 'acidos-organicos',
    formula: 'CH₃CH₂COOH',
    nombre: 'Ácido propanoico (propiónico)',
    equilibrio: 'CH₃CH₂COOH + H₂O ⇌ CH₃CH₂COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.3e-5,
    conjugadaFormula: 'CH₃CH₂COO⁻',
    conjugadaNombre: 'Ion propanoato',
    aplicacion: 'El propionato de calcio se emplea como conservante antifúngico del pan (E-282).',
    busqueda:
      'propanoico propionico ch3ch2cooh propanoato propionato conservante pan e282 acido carboxilico',
  },
  {
    id: 'fenol',
    categoria: 'acidos-organicos',
    formula: 'C₆H₅OH',
    nombre: 'Fenol',
    equilibrio: 'C₆H₅OH + H₂O ⇌ C₆H₅O⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.0e-10,
    conjugadaFormula: 'C₆H₅O⁻',
    conjugadaNombre: 'Ion fenóxido (fenolato)',
    nota: 'Es un alcohol aromático, no un ácido carboxílico: por eso su pKa es 10 y no 5. Aun así, es un millón de veces más ácido que el etanol (pKa ≈ 16), porque el anillo deslocaliza la carga del anión.',
    busqueda:
      'fenol c6h5oh fenoxido fenolato alcohol aromatico pka 10 comparacion con etanol resonancia',
  },
  {
    id: 'salicilico',
    categoria: 'acidos-organicos',
    formula: 'C₆H₄(OH)COOH',
    nombre: 'Ácido salicílico (grupo carboxilo)',
    equilibrio: 'C₆H₄(OH)COOH + H₂O ⇌ C₆H₄(OH)COO⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.1e-3,
    conjugadaFormula: 'C₆H₄(OH)COO⁻',
    conjugadaNombre: 'Ion salicilato',
    nota: 'Tiene también un grupo −OH fenólico muchísimo menos ácido (pKa ≈ 13,6), que en la práctica no interviene al pH del agua. El −OH vecino forma un puente de hidrógeno intramolecular que estabiliza el anión y refuerza la acidez del carboxilo.',
    aplicacion:
      'Es la estructura de partida de la aspirina (ácido acetilsalicílico), un ejemplo químico clásico de esterificación.',
    busqueda:
      'salicilico salicilato aspirina acetilsalicilico sauce fenol carboxilo puente de hidrogeno intramolecular',
  },

  /* ── Ácidos polipróticos (constantes sucesivas) ───────────── */
  {
    id: 'oxalico-1',
    categoria: 'poliproticos',
    formula: 'H₂C₂O₄ (Ka₁)',
    nombre: 'Ácido oxálico — primera disociación',
    equilibrio: 'H₂C₂O₄ + H₂O ⇌ HC₂O₄⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 5.9e-2,
    conjugadaFormula: 'HC₂O₄⁻',
    conjugadaNombre: 'Ion hidrogenooxalato',
    nota: 'Es el ácido dicarboxílico más simple y el más fuerte de la serie: los dos carboxilos se refuerzan mutuamente.',
    aplicacion: 'Está presente en las espinacas, el ruibarbo y las hojas de acelga.',
    busqueda:
      'oxalico h2c2o4 ka1 diprotico oxalato espinacas ruibarbo dicarboxilico primera disociacion',
  },
  {
    id: 'oxalico-2',
    categoria: 'poliproticos',
    formula: 'HC₂O₄⁻ (Ka₂)',
    nombre: 'Ácido oxálico — segunda disociación',
    equilibrio: 'HC₂O₄⁻ + H₂O ⇌ C₂O₄²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 6.4e-5,
    conjugadaFormula: 'C₂O₄²⁻',
    conjugadaNombre: 'Ion oxalato',
    nota: 'Ka₂ es unas 900 veces menor que Ka₁: arrancar un protón a un anión que ya tiene carga negativa cuesta mucho más.',
    busqueda: 'oxalico hc2o4 ka2 segunda disociacion oxalato hidrogenooxalato diprotico',
  },
  {
    id: 'h2so3-1',
    categoria: 'poliproticos',
    formula: 'H₂SO₃ (Ka₁)',
    nombre: 'Ácido sulfuroso — primera disociación',
    equilibrio: 'H₂SO₃ + H₂O ⇌ HSO₃⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.7e-2,
    conjugadaFormula: 'HSO₃⁻',
    conjugadaNombre: 'Ion hidrogenosulfito (bisulfito)',
    nota: 'En realidad el «H₂SO₃» no existe como molécula aislada: es SO₂ disuelto en agua. La constante tabulada describe ese conjunto.',
    aplicacion: 'El SO₂ y los sulfitos se usan como conservantes y antioxidantes del vino.',
    busqueda:
      'sulfuroso h2so3 ka1 diprotico bisulfito sulfito dioxido de azufre vino conservante lluvia acida',
  },
  {
    id: 'h2so3-2',
    categoria: 'poliproticos',
    formula: 'HSO₃⁻ (Ka₂)',
    nombre: 'Ácido sulfuroso — segunda disociación',
    equilibrio: 'HSO₃⁻ + H₂O ⇌ SO₃²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 6.4e-8,
    conjugadaFormula: 'SO₃²⁻',
    conjugadaNombre: 'Ion sulfito',
    busqueda: 'sulfuroso hso3 ka2 segunda disociacion sulfito bisulfito',
  },
  {
    id: 'h3po4-1',
    categoria: 'poliproticos',
    formula: 'H₃PO₄ (Ka₁)',
    nombre: 'Ácido fosfórico — primera disociación',
    equilibrio: 'H₃PO₄ + H₂O ⇌ H₂PO₄⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 7.5e-3,
    conjugadaFormula: 'H₂PO₄⁻',
    conjugadaNombre: 'Ion dihidrogenofosfato',
    nota: 'Las tres constantes se escalonan de forma casi regular: cada una es unos cinco órdenes de magnitud menor que la anterior.',
    aplicacion: 'Es el ácido que da el punto ácido a los refrescos de cola.',
    busqueda:
      'fosforico h3po4 ka1 triprotico dihidrogenofosfato refresco de cola primera disociacion',
  },
  {
    id: 'h3po4-2',
    categoria: 'poliproticos',
    formula: 'H₂PO₄⁻ (Ka₂)',
    nombre: 'Ácido fosfórico — segunda disociación',
    equilibrio: 'H₂PO₄⁻ + H₂O ⇌ HPO₄²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 6.2e-8,
    conjugadaFormula: 'HPO₄²⁻',
    conjugadaNombre: 'Ion hidrogenofosfato',
    nota: 'Con pKa 7,21, el par H₂PO₄⁻/HPO₄²⁻ es el tampón de elección para preparar disoluciones a pH próximo a 7 en el laboratorio.',
    aplicacion: 'Base del tampón fosfato salino (PBS), habitual en trabajo de laboratorio.',
    busqueda:
      'fosforico h2po4 ka2 tampon fosfato pbs ph 7 hidrogenofosfato dihidrogenofosfato buffer',
  },
  {
    id: 'h3po4-3',
    categoria: 'poliproticos',
    formula: 'HPO₄²⁻ (Ka₃)',
    nombre: 'Ácido fosfórico — tercera disociación',
    equilibrio: 'HPO₄²⁻ + H₂O ⇌ PO₄³⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.8e-13,
    conjugadaFormula: 'PO₄³⁻',
    conjugadaNombre: 'Ion fosfato',
    nota: 'Tan pequeña que el ion fosfato solo aparece en cantidad apreciable a pH muy básico. Su reverso: PO₄³⁻ es una base fuerte para lo que se ve en disolución acuosa.',
    busqueda: 'fosforico hpo4 ka3 tercera disociacion fosfato po4 base fuerte',
  },
  {
    id: 'citrico-1',
    categoria: 'poliproticos',
    formula: 'H₃Cit (Ka₁)',
    nombre: 'Ácido cítrico — primera disociación',
    equilibrio: 'H₃Cit + H₂O ⇌ H₂Cit⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 7.4e-4,
    conjugadaFormula: 'H₂Cit⁻',
    conjugadaNombre: 'Ion dihidrogenocitrato',
    nota: 'Sus tres pKa (3,13 · 4,77 · 6,40) están muy juntos, así que el ácido cítrico regula el pH en una franja ancha: por eso es el regulador de acidez más usado en alimentación.',
    aplicacion: 'Da el sabor ácido a los cítricos y a los refrescos; figura como aditivo E-330.',
    busqueda:
      'citrico h3cit ka1 triprotico limon naranja refresco e330 regulador de acidez citrato',
  },
  {
    id: 'citrico-2',
    categoria: 'poliproticos',
    formula: 'H₂Cit⁻ (Ka₂)',
    nombre: 'Ácido cítrico — segunda disociación',
    equilibrio: 'H₂Cit⁻ + H₂O ⇌ HCit²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.7e-5,
    conjugadaFormula: 'HCit²⁻',
    conjugadaNombre: 'Ion hidrogenocitrato',
    busqueda: 'citrico ka2 segunda disociacion citrato limon triprotico',
  },
  {
    id: 'citrico-3',
    categoria: 'poliproticos',
    formula: 'HCit²⁻ (Ka₃)',
    nombre: 'Ácido cítrico — tercera disociación',
    equilibrio: 'HCit²⁻ + H₂O ⇌ Cit³⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.0e-7,
    conjugadaFormula: 'Cit³⁻',
    conjugadaNombre: 'Ion citrato',
    busqueda: 'citrico ka3 tercera disociacion citrato triprotico quelante',
  },
  {
    id: 'tartarico-1',
    categoria: 'poliproticos',
    formula: 'H₂Tar (Ka₁)',
    nombre: 'Ácido tartárico — primera disociación',
    equilibrio: 'H₂Tar + H₂O ⇌ HTar⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 9.2e-4,
    conjugadaFormula: 'HTar⁻',
    conjugadaNombre: 'Ion hidrogenotartrato',
    aplicacion: 'Es el ácido principal de la uva y del vino; el bitartrato potásico forma los cristales del tártaro.',
    busqueda: 'tartarico h2tar ka1 diprotico uva vino tartrato bitartrato cremor tartaro',
  },
  {
    id: 'tartarico-2',
    categoria: 'poliproticos',
    formula: 'HTar⁻ (Ka₂)',
    nombre: 'Ácido tartárico — segunda disociación',
    equilibrio: 'HTar⁻ + H₂O ⇌ Tar²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.3e-5,
    conjugadaFormula: 'Tar²⁻',
    conjugadaNombre: 'Ion tartrato',
    busqueda: 'tartarico ka2 segunda disociacion tartrato vino diprotico',
  },
  {
    id: 'ascorbico-1',
    categoria: 'poliproticos',
    formula: 'H₂Asc (Ka₁)',
    nombre: 'Ácido ascórbico — primera disociación',
    equilibrio: 'H₂Asc + H₂O ⇌ HAsc⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 8.0e-5,
    conjugadaFormula: 'HAsc⁻',
    conjugadaNombre: 'Ion ascorbato',
    nota: 'No tiene grupo carboxilo: la acidez procede de un −OH del anillo cuya carga negativa queda deslocalizada.',
    aplicacion:
      'Es la vitamina C; en la industria alimentaria se emplea como antioxidante (E-300). Aquí se menciona solo como ejemplo químico.',
    busqueda:
      'ascorbico vitamina c h2asc ka1 ascorbato antioxidante e300 enol acido debil diprotico',
  },
  {
    id: 'ascorbico-2',
    categoria: 'poliproticos',
    formula: 'HAsc⁻ (Ka₂)',
    nombre: 'Ácido ascórbico — segunda disociación',
    equilibrio: 'HAsc⁻ + H₂O ⇌ Asc²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.6e-12,
    conjugadaFormula: 'Asc²⁻',
    conjugadaNombre: 'Ion ascorbato dianión',
    busqueda: 'ascorbico ka2 segunda disociacion vitamina c ascorbato',
  },
  {
    id: 'h2co3-1',
    categoria: 'poliproticos',
    formula: 'H₂CO₃ (Ka₁)',
    nombre: 'Ácido carbónico — primera disociación',
    equilibrio: 'H₂CO₃ + H₂O ⇌ HCO₃⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.3e-7,
    conjugadaFormula: 'HCO₃⁻',
    conjugadaNombre: 'Ion hidrogenocarbonato (bicarbonato)',
    nota: 'La constante tabulada engloba el CO₂ disuelto y el H₂CO₃ verdadero. Si se refiriera solo a la molécula de H₂CO₃ real, la Ka sería unas mil veces mayor.',
    aplicacion:
      'El par CO₂/HCO₃⁻ es el sistema regulador principal de la sangre, que se mantiene en torno a pH 7,4, y también controla el pH de los océanos.',
    busqueda:
      'carbonico h2co3 ka1 diprotico bicarbonato co2 sangre ph 7,4 tampon bicarbonato oceano agua con gas',
  },
  {
    id: 'h2co3-2',
    categoria: 'poliproticos',
    formula: 'HCO₃⁻ (Ka₂)',
    nombre: 'Ácido carbónico — segunda disociación',
    equilibrio: 'HCO₃⁻ + H₂O ⇌ CO₃²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 4.7e-11,
    conjugadaFormula: 'CO₃²⁻',
    conjugadaNombre: 'Ion carbonato',
    nota: 'El bicarbonato es anfótero: puede ceder este protón o captar uno para volver a H₂CO₃. Como su Kb (2,3×10⁻⁸) supera a su Ka (4,7×10⁻¹¹), una disolución de bicarbonato de sodio es básica.',
    busqueda:
      'bicarbonato hco3 ka2 carbonato anfotero bicarbonato de sodio ph basico segunda disociacion',
  },
  {
    id: 'h2s-1',
    categoria: 'poliproticos',
    formula: 'H₂S (Ka₁)',
    nombre: 'Ácido sulfhídrico — primera disociación',
    equilibrio: 'H₂S + H₂O ⇌ HS⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 8.9e-8,
    conjugadaFormula: 'HS⁻',
    conjugadaNombre: 'Ion hidrogenosulfuro',
    aplicacion: 'Es el gas del olor a huevo podrido y aparece en aguas termales sulfurosas.',
    busqueda:
      'sulfhidrico h2s ka1 diprotico hidrogenosulfuro huevo podrido sulfuro gas primera disociacion',
  },
  {
    id: 'h2s-2',
    categoria: 'poliproticos',
    formula: 'HS⁻ (Ka₂)',
    nombre: 'Ácido sulfhídrico — segunda disociación',
    equilibrio: 'HS⁻ + H₂O ⇌ S²⁻ + H₃O⁺',
    tipo: 'acido',
    fuerte: false,
    constante: 1.0e-19,
    conjugadaFormula: 'S²⁻',
    conjugadaNombre: 'Ion sulfuro',
    nota: 'Ojo con este dato: muchas tablas antiguas dan Ka₂ ≈ 1×10⁻¹³, valor que las medidas modernas han corregido a un orden de 10⁻¹⁹. Si tu libro de texto usa el valor clásico, indica cuál has empleado.',
    busqueda:
      'sulfhidrico hs ka2 sulfuro segunda disociacion valor discutido tabla antigua discrepancia',
  },

  /* ── Bases fuertes ────────────────────────────────────────── */
  {
    id: 'naoh',
    categoria: 'bases-fuertes',
    formula: 'NaOH',
    nombre: 'Hidróxido de sodio',
    equilibrio: 'NaOH → Na⁺ + OH⁻ (completa)',
    tipo: 'base',
    fuerte: true,
    constante: null,
    ionesOH: 1,
    conjugadaFormula: 'Na⁺',
    conjugadaNombre: 'Ion sodio (ácido despreciable)',
    nota: 'No hay equilibrio que plantear: en disolución acuosa se disocia por completo, así que [OH⁻] coincide con la concentración de la base.',
    aplicacion: 'Sosa cáustica: fabricación de jabón por saponificación y desatascadores.',
    busqueda:
      'hidroxido de sodio naoh sosa caustica base fuerte disociacion completa jabon saponificacion',
  },
  {
    id: 'koh',
    categoria: 'bases-fuertes',
    formula: 'KOH',
    nombre: 'Hidróxido de potasio',
    equilibrio: 'KOH → K⁺ + OH⁻ (completa)',
    tipo: 'base',
    fuerte: true,
    constante: null,
    ionesOH: 1,
    conjugadaFormula: 'K⁺',
    conjugadaNombre: 'Ion potasio (ácido despreciable)',
    aplicacion: 'Potasa cáustica: electrolito de pilas alcalinas y jabones blandos.',
    busqueda: 'hidroxido de potasio koh potasa caustica base fuerte pila alcalina',
  },
  {
    id: 'caoh2',
    categoria: 'bases-fuertes',
    formula: 'Ca(OH)₂',
    nombre: 'Hidróxido de calcio',
    equilibrio: 'Ca(OH)₂ → Ca²⁺ + 2 OH⁻ (completa, pero poco soluble)',
    tipo: 'base',
    fuerte: true,
    constante: null,
    ionesOH: 2,
    conjugadaFormula: 'Ca²⁺',
    conjugadaNombre: 'Ion calcio (ácido despreciable)',
    nota: 'Libera dos OH⁻ por unidad de fórmula, así que [OH⁻] es el doble de la concentración. Es fuerte pero poco soluble: la disolución saturada («agua de cal») no pasa de unos 0,02 M.',
    aplicacion: 'Cal apagada: morteros, corrección de suelos ácidos y tratamiento de aguas.',
    busqueda:
      'hidroxido de calcio ca(oh)2 cal apagada agua de cal base fuerte dos oh poco soluble lechada',
  },

  /* ── Bases débiles ────────────────────────────────────────── */
  {
    id: 'dimetilamina',
    categoria: 'bases-debiles',
    formula: '(CH₃)₂NH',
    nombre: 'Dimetilamina',
    equilibrio: '(CH₃)₂NH + H₂O ⇌ (CH₃)₂NH₂⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 5.4e-4,
    conjugadaFormula: '(CH₃)₂NH₂⁺',
    conjugadaNombre: 'Ion dimetilamonio',
    nota: 'Las aminas secundarias son las bases más fuertes de la serie: dos grupos metilo empujan densidad electrónica hacia el nitrógeno.',
    busqueda:
      'dimetilamina (ch3)2nh amina secundaria base debil kb dimetilamonio serie de aminas',
  },
  {
    id: 'etilamina',
    categoria: 'bases-debiles',
    formula: 'C₂H₅NH₂',
    nombre: 'Etilamina',
    equilibrio: 'C₂H₅NH₂ + H₂O ⇌ C₂H₅NH₃⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 5.6e-4,
    conjugadaFormula: 'C₂H₅NH₃⁺',
    conjugadaNombre: 'Ion etilamonio',
    busqueda: 'etilamina c2h5nh2 amina primaria base debil kb etilamonio',
  },
  {
    id: 'metilamina',
    categoria: 'bases-debiles',
    formula: 'CH₃NH₂',
    nombre: 'Metilamina',
    equilibrio: 'CH₃NH₂ + H₂O ⇌ CH₃NH₃⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 4.4e-4,
    conjugadaFormula: 'CH₃NH₃⁺',
    conjugadaNombre: 'Ion metilamonio',
    nota: 'Es unas 25 veces más básica que el amoníaco: el grupo metilo cede densidad electrónica y deja el par libre del nitrógeno más disponible.',
    busqueda:
      'metilamina ch3nh2 amina primaria base debil kb metilamonio comparacion con amoniaco pescado',
  },
  {
    id: 'trimetilamina',
    categoria: 'bases-debiles',
    formula: '(CH₃)₃N',
    nombre: 'Trimetilamina',
    equilibrio: '(CH₃)₃N + H₂O ⇌ (CH₃)₃NH⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 6.5e-5,
    conjugadaFormula: '(CH₃)₃NH⁺',
    conjugadaNombre: 'Ion trimetilamonio',
    nota: 'Rompe la tendencia: con tres metilos la basicidad baja, porque el catión resultante queda peor rodeado por moléculas de agua (impedimento estérico).',
    aplicacion: 'Es la responsable del olor característico del pescado poco fresco.',
    busqueda:
      'trimetilamina (ch3)3n amina terciaria base debil kb pescado impedimento esterico solvatacion',
  },
  {
    id: 'amoniaco',
    categoria: 'bases-debiles',
    formula: 'NH₃',
    nombre: 'Amoníaco',
    equilibrio: 'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 1.8e-5,
    conjugadaFormula: 'NH₄⁺',
    conjugadaNombre: 'Ion amonio',
    nota: 'Curiosidad numérica: su Kb (1,8×10⁻⁵) coincide con la Ka del ácido acético, así que pKb del amoníaco = pKa del acético = 4,74.',
    aplicacion: 'Base de los limpiadores domésticos amoniacales y materia prima de los fertilizantes.',
    busqueda:
      'amoniaco nh3 base debil kb amonio limpieza limpiador amoniacal fertilizante haber bosch',
  },
  {
    id: 'hidrazina',
    categoria: 'bases-debiles',
    formula: 'N₂H₄',
    nombre: 'Hidrazina',
    equilibrio: 'N₂H₄ + H₂O ⇌ N₂H₅⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 1.7e-6,
    conjugadaFormula: 'N₂H₅⁺',
    conjugadaNombre: 'Ion hidrazinio',
    nota: 'Menos básica que el amoníaco: el segundo nitrógeno atrae densidad electrónica del par libre del primero.',
    busqueda: 'hidrazina n2h4 base debil kb hidrazinio propulsante reductor',
  },
  {
    id: 'hidroxilamina',
    categoria: 'bases-debiles',
    formula: 'NH₂OH',
    nombre: 'Hidroxilamina',
    equilibrio: 'NH₂OH + H₂O ⇌ NH₃OH⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 1.1e-8,
    conjugadaFormula: 'NH₃OH⁺',
    conjugadaNombre: 'Ion hidroxilamonio',
    busqueda: 'hidroxilamina nh2oh base debil kb hidroxilamonio oxima',
  },
  {
    id: 'piridina',
    categoria: 'bases-debiles',
    formula: 'C₅H₅N',
    nombre: 'Piridina',
    equilibrio: 'C₅H₅N + H₂O ⇌ C₅H₅NH⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 1.7e-9,
    conjugadaFormula: 'C₅H₅NH⁺',
    conjugadaNombre: 'Ion piridinio',
    nota: 'Su par libre está en un orbital del anillo aromático, menos disponible que el de una amina alifática: por eso es unas 10 000 veces menos básica que el amoníaco.',
    busqueda: 'piridina c5h5n base debil kb piridinio heterociclo aromatico disolvente',
  },
  {
    id: 'anilina',
    categoria: 'bases-debiles',
    formula: 'C₆H₅NH₂',
    nombre: 'Anilina',
    equilibrio: 'C₆H₅NH₂ + H₂O ⇌ C₆H₅NH₃⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 3.8e-10,
    conjugadaFormula: 'C₆H₅NH₃⁺',
    conjugadaNombre: 'Ion anilinio',
    nota: 'El par libre del nitrógeno se deslocaliza dentro del anillo bencénico y deja de estar disponible: la anilina es casi cien mil veces menos básica que la metilamina.',
    aplicacion: 'Materia prima histórica de los colorantes sintéticos.',
    busqueda:
      'anilina c6h5nh2 amina aromatica base muy debil kb anilinio resonancia colorante fenilamina',
  },
  {
    id: 'urea',
    categoria: 'bases-debiles',
    formula: '(NH₂)₂CO',
    nombre: 'Urea',
    equilibrio: '(NH₂)₂CO + H₂O ⇌ (NH₂)₂COH⁺ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: 1.5e-14,
    conjugadaFormula: '(NH₂)₂COH⁺',
    conjugadaNombre: 'Ion ureico protonado',
    nota: 'Base tan débil que su disolución es prácticamente neutra: los dos nitrógenos ceden densidad electrónica al grupo carbonilo y apenas queda par libre disponible.',
    aplicacion: 'Es el fertilizante nitrogenado más usado del mundo.',
    busqueda:
      'urea (nh2)2co base extremadamente debil kb carbamida fertilizante neutra wohler',
  },

  /* ── Bases conjugadas de interés ──────────────────────────── */
  {
    id: 'fosfato',
    categoria: 'conjugadas',
    formula: 'PO₄³⁻',
    nombre: 'Ion fosfato',
    equilibrio: 'PO₄³⁻ + H₂O ⇌ HPO₄²⁻ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: KW / 4.8e-13,
    conjugadaFormula: 'HPO₄²⁻',
    conjugadaNombre: 'Ion hidrogenofosfato',
    nota: 'Es la base conjugada de la tercera disociación del fosfórico. Su Kb sale de Kw/Ka₃ = 1,0×10⁻¹⁴ / 4,8×10⁻¹³.',
    aplicacion: 'El fosfato trisódico se ha usado como limpiador fuertemente alcalino.',
    busqueda:
      'fosfato po4 base conjugada kb fosfato trisodico hidrolisis basica kw entre ka3',
  },
  {
    id: 'carbonato',
    categoria: 'conjugadas',
    formula: 'CO₃²⁻',
    nombre: 'Ion carbonato',
    equilibrio: 'CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: KW / 4.7e-11,
    conjugadaFormula: 'HCO₃⁻',
    conjugadaNombre: 'Ion hidrogenocarbonato',
    nota: 'Kb = Kw/Ka₂ del carbónico. Explica por qué el carbonato de sodio (sosa) da disoluciones netamente básicas.',
    aplicacion: 'El carbonato de sodio se emplea para subir el pH del agua de las piscinas.',
    busqueda:
      'carbonato co3 base conjugada kb sosa carbonato de sodio hidrolisis basica piscina',
  },
  {
    id: 'cianuro',
    categoria: 'conjugadas',
    formula: 'CN⁻',
    nombre: 'Ion cianuro',
    equilibrio: 'CN⁻ + H₂O ⇌ HCN + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: KW / 4.9e-10,
    conjugadaFormula: 'HCN',
    conjugadaNombre: 'Ácido cianhídrico',
    nota: 'Como el HCN es un ácido extremadamente débil, su conjugado es una base apreciable: una disolución de KCN tiene pH cercano a 11.',
    busqueda: 'cianuro cn base conjugada kb hidrolisis kcn ph basico cianhidrico',
  },
  {
    id: 'bicarbonato-base',
    categoria: 'conjugadas',
    formula: 'HCO₃⁻',
    nombre: 'Ion hidrogenocarbonato (como base)',
    equilibrio: 'HCO₃⁻ + H₂O ⇌ H₂CO₃ + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: KW / 4.3e-7,
    conjugadaFormula: 'H₂CO₃',
    conjugadaNombre: 'Ácido carbónico',
    nota: 'El bicarbonato es anfótero. Comparando esta Kb (2,3×10⁻⁸) con su Ka (4,7×10⁻¹¹) se ve que gana el comportamiento básico.',
    aplicacion: 'El bicarbonato de sodio es el ejemplo doméstico de sal de reacción básica.',
    busqueda:
      'bicarbonato hco3 base conjugada anfotero kb bicarbonato de sodio hidrolisis basica sal',
  },
  {
    id: 'acetato',
    categoria: 'conjugadas',
    formula: 'CH₃COO⁻',
    nombre: 'Ion acetato',
    equilibrio: 'CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: KW / 1.8e-5,
    conjugadaFormula: 'CH₃COOH',
    conjugadaNombre: 'Ácido acético',
    nota: 'La base conjugada de manual: Kb = 1,0×10⁻¹⁴ / 1,8×10⁻⁵ = 5,6×10⁻¹⁰, y pKb = 14 − 4,74 = 9,26.',
    aplicacion: 'Con ácido acético forma el tampón acetato, el más común del laboratorio.',
    busqueda:
      'acetato ch3coo base conjugada kb acetato de sodio hidrolisis tampon acetico ejemplo clasico',
  },
  {
    id: 'fluoruro',
    categoria: 'conjugadas',
    formula: 'F⁻',
    nombre: 'Ion fluoruro',
    equilibrio: 'F⁻ + H₂O ⇌ HF + OH⁻',
    tipo: 'base',
    fuerte: false,
    constante: KW / 6.8e-4,
    conjugadaFormula: 'HF',
    conjugadaNombre: 'Ácido fluorhídrico',
    nota: 'Base muy débil, porque procede de un ácido relativamente fuerte para lo que es un ácido débil: una disolución de NaF apenas se aparta de la neutralidad.',
    busqueda: 'fluoruro f base conjugada kb fluoruro de sodio naf hidrolisis debil',
  },
];

/* ────────────────────────────────────────────────────────────────
   Cálculos químicos derivados
──────────────────────────────────────────────────────────────── */

/** pK = −log K */
function pK(valor: number): number {
  return -Math.log10(valor);
}

interface DatosConstantes {
  /** Ka de la especie (o de su ácido conjugado, si la entrada es una base) */
  ka: number;
  pka: number;
  /** Kb de la base conjugada (o de la propia especie, si la entrada es una base) */
  kb: number;
  pkb: number;
}

/**
 * Devuelve el juego completo de constantes usando Ka·Kb = Kw.
 * Para una entrada de tipo 'acido', Ka es la propia y Kb la del conjugado;
 * para una de tipo 'base', Kb es la propia y Ka la del ácido conjugado.
 */
function constantesDe(especie: Especie): DatosConstantes | null {
  if (especie.constante === null) return null;
  if (especie.tipo === 'acido') {
    const ka = especie.constante;
    const kb = KW / ka;
    return { ka, pka: pK(ka), kb, pkb: pK(kb) };
  }
  const kb = especie.constante;
  const ka = KW / kb;
  return { ka, pka: pK(ka), kb, pkb: pK(kb) };
}

interface NivelFuerza {
  etiqueta: string;
  /** 0-100, solo para la barra visual; la etiqueta de texto es la que informa */
  porcentaje: number;
}

/** Clasifica la fuerza a partir del pK, con etiqueta de texto (nunca solo color). */
function nivelFuerza(pk: number, tipo: 'acido' | 'base'): NivelFuerza {
  const sustantivo = tipo === 'acido' ? 'Ácido' : 'Base';
  // Escala visual: pK de −2 (muy fuerte) a 20 (despreciable)
  const porcentaje = Math.min(100, Math.max(0, 100 * (1 - (pk + 2) / 22)));
  if (pk < 0) return { etiqueta: `${sustantivo} muy fuerte`, porcentaje };
  if (pk < 3) return { etiqueta: `${sustantivo} moderadamente fuerte`, porcentaje };
  if (pk < 6) return { etiqueta: `${sustantivo} débil`, porcentaje };
  if (pk < 10) return { etiqueta: `${sustantivo} muy débil`, porcentaje };
  return { etiqueta: `${sustantivo} extremadamente débil`, porcentaje };
}

interface ResultadoPh {
  ph: number;
  poh: number;
  /** Concentración de H₃O⁺ (ácidos) o de OH⁻ (bases) obtenida sin aproximar */
  concentracionIon: number;
  /** Valor que daría la aproximación √(K·C); null en electrolitos fuertes */
  valorAproximado: number | null;
  porcentajeDisociacion: number | null;
  aproximacionValida: boolean | null;
  formulaUsada: string;
  avisoDilucion: boolean;
}

/**
 * Calcula el pH resolviendo el equilibrio exacto (ecuación de segundo grado)
 * y compara con la aproximación √(K·C) para aplicar la regla del 5 %.
 */
function calcularPh(especie: Especie, concentracion: number): ResultadoPh | null {
  if (!Number.isFinite(concentracion) || concentracion <= 0) return null;

  // Electrolitos fuertes: disociación completa, no hay equilibrio que resolver
  if (especie.fuerte) {
    if (especie.tipo === 'acido') {
      const h = concentracion;
      const ph = -Math.log10(h);
      return {
        ph,
        poh: PKW - ph,
        concentracionIon: h,
        valorAproximado: null,
        porcentajeDisociacion: 100,
        aproximacionValida: null,
        formulaUsada: 'Disociación completa: [H₃O⁺] = C  →  pH = −log C',
        avisoDilucion: concentracion < 1e-6,
      };
    }
    const factor = especie.ionesOH ?? 1;
    const oh = concentracion * factor;
    const poh = -Math.log10(oh);
    return {
      ph: PKW - poh,
      poh,
      concentracionIon: oh,
      valorAproximado: null,
      porcentajeDisociacion: 100,
      aproximacionValida: null,
      formulaUsada:
        factor === 1
          ? 'Disociación completa: [OH⁻] = C  →  pOH = −log C  →  pH = 14 − pOH'
          : `Disociación completa con ${factor} OH⁻ por unidad: [OH⁻] = ${factor}·C  →  pH = 14 + log(${factor}·C)`,
      avisoDilucion: concentracion < 1e-6,
    };
  }

  const constantes = constantesDe(especie);
  if (!constantes) return null;
  const k = especie.tipo === 'acido' ? constantes.ka : constantes.kb;

  // Raíz positiva de x² + K·x − K·C = 0
  const exacto = (-k + Math.sqrt(k * k + 4 * k * concentracion)) / 2;
  const aproximado = Math.sqrt(k * concentracion);
  const porcentaje = (aproximado / concentracion) * 100;

  if (especie.tipo === 'acido') {
    const ph = -Math.log10(exacto);
    return {
      ph,
      poh: PKW - ph,
      concentracionIon: exacto,
      valorAproximado: aproximado,
      porcentajeDisociacion: (exacto / concentracion) * 100,
      aproximacionValida: porcentaje <= 5,
      formulaUsada: 'Ka = x² / (C − x), con x = [H₃O⁺] y pH = −log x',
      avisoDilucion: exacto < 1e-6,
    };
  }

  const poh = -Math.log10(exacto);
  return {
    ph: PKW - poh,
    poh,
    concentracionIon: exacto,
    valorAproximado: aproximado,
    porcentajeDisociacion: (exacto / concentracion) * 100,
    aproximacionValida: porcentaje <= 5,
    formulaUsada: 'Kb = x² / (C − x), con x = [OH⁻], pOH = −log x y pH = 14 − pOH',
    avisoDilucion: exacto < 1e-6,
  };
}

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaKaKbPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Calculadora de pH
  const [idSeleccionado, setIdSeleccionado] = useState('acetico');
  const [concentracionTexto, setConcentracionTexto] = useState('0,1');

  // Calculadora de disolución reguladora
  const [idTampon, setIdTampon] = useState('acetico');
  const [concAcidoTexto, setConcAcidoTexto] = useState('0,1');
  const [concBaseTexto, setConcBaseTexto] = useState('0,1');

  // Foco automático: quien llega buscando un valor concreto escribe directamente
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return ESPECIES.filter((especie) => {
      const coincideCategoria =
        categoriaActiva === 'todas' || especie.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(
        `${especie.formula} ${especie.nombre} ${especie.conjugadaFormula} ${especie.conjugadaNombre} ${especie.busqueda}`,
      ).includes(termino);
    });
  }, [consulta, categoriaActiva]);

  const especieSeleccionada = useMemo(
    () => ESPECIES.find((especie) => especie.id === idSeleccionado) ?? ESPECIES[0],
    [idSeleccionado],
  );

  const resultadoPh = useMemo(() => {
    const concentracion = parseSpanishNumber(concentracionTexto);
    return calcularPh(especieSeleccionada, concentracion);
  }, [especieSeleccionada, concentracionTexto]);

  // Solo ácidos débiles con Ka conocida sirven para preparar un tampón
  const candidatosTampon = useMemo(
    () => ESPECIES.filter((especie) => especie.tipo === 'acido' && especie.constante !== null),
    [],
  );

  const especieTampon = useMemo(
    () => candidatosTampon.find((especie) => especie.id === idTampon) ?? candidatosTampon[0],
    [candidatosTampon, idTampon],
  );

  const resultadoTampon = useMemo(() => {
    const constantes = constantesDe(especieTampon);
    if (!constantes) return null;
    const acido = parseSpanishNumber(concAcidoTexto);
    const base = parseSpanishNumber(concBaseTexto);
    if (!Number.isFinite(acido) || !Number.isFinite(base) || acido <= 0 || base <= 0) return null;
    const proporcion = base / acido;
    const ph = constantes.pka + Math.log10(proporcion);
    return {
      pka: constantes.pka,
      proporcion,
      ph,
      dentroDeRango: proporcion >= 0.1 && proporcion <= 10,
      minimo: constantes.pka - 1,
      maximo: constantes.pka + 1,
    };
  }, [especieTampon, concAcidoTexto, concBaseTexto]);

  const alternarFila = (id: string) => {
    setAbiertas((previas) =>
      previas.includes(id) ? previas.filter((item) => item !== id) : [...previas, id],
    );
  };

  /** Opciones de un desplegable agrupadas por categoría */
  const renderOpciones = (lista: Especie[]) =>
    CATEGORIAS.map((categoria) => {
      const grupo = lista.filter((especie) => especie.categoria === categoria.id);
      if (grupo.length === 0) return null;
      return (
        <optgroup key={categoria.id} label={categoria.nombre}>
          {grupo.map((especie) => (
            <option key={especie.id} value={especie.id}>
              {especie.formula} — {especie.nombre}
            </option>
          ))}
        </optgroup>
      );
    });

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚗️</span> Tabla de Constantes de Acidez y Basicidad
        </h1>
        <p className={styles.subtitle}>
          {ESPECIES.length} entradas a 25 °C con su equilibrio escrito, Ka, pKa, la especie
          conjugada y su Kb. Incluye calculadora de pH con control de la aproximación del 5 % y
          calculadora de disolución reguladora con Henderson-Hasselbalch.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de constantes de acidez">
        <label className={styles.buscadorLabel} htmlFor="buscador-kakb">
          Busca por fórmula, nombre o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-kakb"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="acético, vinagre, HF, amoníaco, fosfórico, tampón…"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.limpiarBtn}
            onClick={() => {
              setConsulta('');
              setCategoriaActiva('todas');
              buscadorRef.current?.focus({ preventScroll: true });
            }}
          >
            <span aria-hidden="true">✕</span> Limpiar
          </button>
        </div>
        <p className={styles.ayudaBusqueda}>
          Funciona con acentos o sin ellos y con nombres coloquiales:{' '}
          <strong>vinagre</strong> encuentra el ácido acético, <strong>lejía</strong> lleva al
          hipocloroso y <strong>vitamina c</strong> al ácido ascórbico.
        </p>

        <div className={styles.filtros}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${
              categoriaActiva === 'todas' ? styles.filtroBtnActivo : ''
            }`}
            aria-pressed={categoriaActiva === 'todas'}
            onClick={() => setCategoriaActiva('todas')}
          >
            Todas
          </button>
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={`${styles.filtroBtn} ${
                categoriaActiva === categoria.id ? styles.filtroBtnActivo : ''
              }`}
              aria-pressed={categoriaActiva === categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
            >
              <span aria-hidden="true">{categoria.icono}</span> {categoria.nombre}
            </button>
          ))}
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {resultados.length} de {ESPECIES.length} especies
        </p>
      </section>

      {/* Tabla de constantes */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna especie que coincida con «{consulta}
            ». Prueba con <strong>acético</strong>, <strong>amoníaco</strong>,{' '}
            <strong>fosfórico</strong>, <strong>HCN</strong> o <strong>carbonato</strong>, o quita
            el filtro de categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((especie) => {
            const abierta = abiertas.includes(especie.id);
            const constantes = constantesDe(especie);
            const pkPropio = constantes
              ? especie.tipo === 'acido'
                ? constantes.pka
                : constantes.pkb
              : (especie.pkaNominal ?? -2);
            const fuerza = nivelFuerza(pkPropio, especie.tipo);

            return (
              <li key={especie.id} className={styles.fila}>
                <button
                  type="button"
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${especie.id}`}
                  onClick={() => alternarFila(especie.id)}
                >
                  <span className={styles.filaNombre}>
                    <span className={styles.filaFormula}>{especie.formula}</span>
                    <span className={styles.filaTexto}>{especie.nombre}</span>
                    <span className={styles.filaCategoria}>
                      {NOMBRE_CATEGORIA[especie.categoria]}
                    </span>
                  </span>

                  <span className={styles.filaValores}>
                    {constantes ? (
                      <>
                        <span className={styles.par}>
                          <span className={styles.etq}>
                            {especie.tipo === 'acido' ? 'Ka' : 'Kb'}
                          </span>
                          <span className={styles.expr}>
                            {notacionCientifica(
                              especie.tipo === 'acido' ? constantes.ka : constantes.kb,
                            )}
                          </span>
                        </span>
                        <span className={styles.par}>
                          <span className={styles.etq}>
                            {especie.tipo === 'acido' ? 'pKa' : 'pKb'}
                          </span>
                          <span className={`${styles.expr} ${styles.exprSecundario}`}>
                            {formatNumber(pkPropio, 2)}
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className={styles.par}>
                        <span className={styles.etq}>
                          {especie.tipo === 'acido' ? 'Ka' : 'Kb'}
                        </span>
                        <span className={styles.expr}>≫ 1 (disociación completa)</span>
                      </span>
                    )}
                    <span className={styles.fuerzaBloque}>
                      <span className={styles.fuerzaEtiqueta}>{fuerza.etiqueta}</span>
                      <span className={styles.fuerzaBarra} aria-hidden="true">
                        <span
                          className={styles.fuerzaRelleno}
                          style={{ width: `${fuerza.porcentaje}%` }}
                        />
                      </span>
                    </span>
                  </span>

                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${especie.id}`} className={styles.detalle}>
                    <h3>Equilibrio de disociación</h3>
                    <p className={styles.equilibrio}>{especie.equilibrio}</p>

                    {constantes ? (
                      <>
                        <div className={styles.gridConstantes}>
                          <div className={styles.constanteCard}>
                            <span className={styles.constanteEtq}>Ka del ácido</span>
                            <strong>{notacionCientifica(constantes.ka)}</strong>
                            <span className={styles.constanteSub}>
                              pKa = {formatNumber(constantes.pka, 2)}
                            </span>
                          </div>
                          <div className={styles.constanteCard}>
                            <span className={styles.constanteEtq}>Kb de la base</span>
                            <strong>{notacionCientifica(constantes.kb)}</strong>
                            <span className={styles.constanteSub}>
                              pKb = {formatNumber(constantes.pkb, 2)}
                            </span>
                          </div>
                        </div>

                        <h3>Par conjugado</h3>
                        <p>
                          {especie.tipo === 'acido' ? (
                            <>
                              El ácido <strong>{especie.formula}</strong> cede un protón y se
                              convierte en <strong>{especie.conjugadaFormula}</strong> (
                              {especie.conjugadaNombre}), que actúa como base con Kb ={' '}
                              {notacionCientifica(constantes.kb)}.
                            </>
                          ) : (
                            <>
                              La base <strong>{especie.formula}</strong> capta un protón y se
                              convierte en <strong>{especie.conjugadaFormula}</strong> (
                              {especie.conjugadaNombre}), que actúa como ácido con Ka ={' '}
                              {notacionCientifica(constantes.ka)}.
                            </>
                          )}
                        </p>

                        <div className={styles.kwBox}>
                          <h4>
                            <span aria-hidden="true">🔗</span> De dónde sale la constante del
                            conjugado
                          </h4>
                          <p className={styles.kwFormula}>
                            Ka · Kb = {notacionCientifica(constantes.ka)} ·{' '}
                            {notacionCientifica(constantes.kb)} = 1,0×10⁻¹⁴ = Kw
                          </p>
                          <p className={styles.kwFormula}>
                            pKa + pKb = {formatNumber(constantes.pka, 2)} +{' '}
                            {formatNumber(constantes.pkb, 2)} = 14,00
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className={styles.avisoFuerte}>
                        <p>
                          <strong>Electrolito fuerte.</strong> En agua se disocia prácticamente al
                          100 %, así que su constante no tiene sentido práctico: el disolvente
                          «nivela» a todos estos ácidos al ion H₃O⁺ y no permite distinguirlos.
                          {typeof especie.pkaNominal === 'number' && (
                            <>
                              {' '}
                              Las tablas recogen un pKa orientativo de{' '}
                              {formatNumber(especie.pkaNominal, 1)}, medido en disolventes menos
                              básicos que el agua, y solo sirve para ordenar la serie.
                            </>
                          )}
                        </p>
                        <p className={styles.avisoFuerteCierre}>
                          Para calcular el pH no se plantea equilibrio:{' '}
                          {especie.tipo === 'acido'
                            ? '[H₃O⁺] = C y pH = −log C.'
                            : `[OH⁻] = ${especie.ionesOH ?? 1}·C, pOH = −log [OH⁻] y pH = 14 − pOH.`}
                        </p>
                      </div>
                    )}

                    {especie.nota && (
                      <>
                        <h3>Qué conviene saber</h3>
                        <p>{especie.nota}</p>
                      </>
                    )}

                    {especie.aplicacion && (
                      <div className={styles.aplicacionBox}>
                        <span aria-hidden="true">🌍</span> <strong>Dónde aparece:</strong>{' '}
                        {especie.aplicacion}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Calculadora de pH */}
      <section className={styles.calculadora} aria-labelledby="titulo-calculadora-ph">
        <h2 id="titulo-calculadora-ph" className={styles.calcTitulo}>
          <span aria-hidden="true">🧪</span> Calculadora de pH
        </h2>
        <p className={styles.calcIntro}>
          Elige una especie de la tabla e introduce su concentración molar. El cálculo resuelve el
          equilibrio completo y comprueba si la aproximación habitual, x = √(K·C), era admisible
          según la regla del 5 %.
        </p>

        <div className={styles.calcGrid}>
          <div className={styles.campo}>
            <label htmlFor="especie-ph">Ácido o base</label>
            <select
              id="especie-ph"
              className={styles.select}
              value={idSeleccionado}
              onChange={(evento) => setIdSeleccionado(evento.target.value)}
            >
              {renderOpciones(ESPECIES)}
            </select>
          </div>
          <div className={styles.campo}>
            <label htmlFor="concentracion-ph">Concentración (mol/L)</label>
            <input
              id="concentracion-ph"
              className={styles.input}
              type="text"
              inputMode="decimal"
              value={concentracionTexto}
              onChange={(evento) => setConcentracionTexto(evento.target.value)}
              placeholder="0,1"
              autoComplete="off"
            />
            <span className={styles.campoAyuda}>
              Usa coma decimal: 0,1 · 0,025 · 1. También se admite 0.1.
            </span>
          </div>
        </div>

        <div className={styles.resultadoPanel} role="status" aria-live="polite">
          {resultadoPh === null ? (
            <p className={styles.resultadoVacio}>
              Introduce una concentración mayor que cero para ver el pH.
            </p>
          ) : (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoEtq}>pH de la disolución</span>
                <strong className={styles.resultadoValor}>
                  {formatNumber(resultadoPh.ph, 2)}
                </strong>
                <span className={styles.resultadoSub}>
                  pOH = {formatNumber(resultadoPh.poh, 2)} ·{' '}
                  {especieSeleccionada.tipo === 'acido' ? '[H₃O⁺]' : '[OH⁻]'} ={' '}
                  {notacionCientifica(resultadoPh.concentracionIon, 2)} M
                </span>
              </div>

              <dl className={styles.detalleCalculo}>
                <div>
                  <dt>Ecuación utilizada</dt>
                  <dd>{resultadoPh.formulaUsada}</dd>
                </div>
                {resultadoPh.porcentajeDisociacion !== null && (
                  <div>
                    <dt>Grado de disociación</dt>
                    <dd>{formatNumber(resultadoPh.porcentajeDisociacion, 2)} %</dd>
                  </div>
                )}
                {resultadoPh.valorAproximado !== null && (
                  <div>
                    <dt>Valor con la aproximación √(K·C)</dt>
                    <dd>{notacionCientifica(resultadoPh.valorAproximado, 2)} M</dd>
                  </div>
                )}
              </dl>

              {resultadoPh.aproximacionValida === true && (
                <p className={styles.notaOk}>
                  <span aria-hidden="true">✅</span> <strong>Aproximación válida.</strong> La
                  especie disociada representa menos del 5 % de la concentración inicial, así que
                  suponer C − x ≈ C es correcto y el resultado coincide con el exacto en las cifras
                  que se muestran.
                </p>
              )}
              {resultadoPh.aproximacionValida === false && (
                <p className={styles.notaAviso}>
                  <span aria-hidden="true">⚠️</span> <strong>Aproximación no válida.</strong> La
                  disociación supera el 5 %, así que no puede suponerse C − x ≈ C. Hay que resolver
                  la ecuación de segundo grado x² + K·x − K·C = 0 y tomar la raíz positiva: es
                  justo lo que hace el valor de pH mostrado arriba. En un examen, indícalo
                  expresamente y desarrolla la ecuación completa.
                </p>
              )}
              {resultadoPh.avisoDilucion && (
                <p className={styles.notaAviso}>
                  <span aria-hidden="true">⚠️</span> A concentraciones tan bajas, los iones
                  procedentes de la propia autoionización del agua (10⁻⁷ M) dejan de ser
                  despreciables y el pH real se acerca a 7. El modelo empleado aquí no los incluye.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Calculadora de disolución reguladora */}
      <section className={styles.calculadora} aria-labelledby="titulo-calculadora-tampon">
        <h2 id="titulo-calculadora-tampon" className={styles.calcTitulo}>
          <span aria-hidden="true">🧫</span> Calculadora de disolución reguladora (tampón)
        </h2>
        <p className={styles.calcIntro}>
          Una disolución reguladora contiene a la vez un ácido débil y su base conjugada, y
          mantiene el pH casi constante frente a pequeñas adiciones de ácido o de base. Se calcula
          con la ecuación de Henderson-Hasselbalch:
        </p>
        <div className={styles.formulaBox}>pH = pKa + log ( [base conjugada] / [ácido] )</div>

        <div className={styles.calcGrid}>
          <div className={styles.campo}>
            <label htmlFor="especie-tampon">Ácido del par conjugado</label>
            <select
              id="especie-tampon"
              className={styles.select}
              value={idTampon}
              onChange={(evento) => setIdTampon(evento.target.value)}
            >
              {renderOpciones(candidatosTampon)}
            </select>
          </div>
          <div className={styles.campo}>
            <label htmlFor="conc-acido">[ácido] (mol/L)</label>
            <input
              id="conc-acido"
              className={styles.input}
              type="text"
              inputMode="decimal"
              value={concAcidoTexto}
              onChange={(evento) => setConcAcidoTexto(evento.target.value)}
              placeholder="0,1"
              autoComplete="off"
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="conc-base">[base conjugada] (mol/L)</label>
            <input
              id="conc-base"
              className={styles.input}
              type="text"
              inputMode="decimal"
              value={concBaseTexto}
              onChange={(evento) => setConcBaseTexto(evento.target.value)}
              placeholder="0,1"
              autoComplete="off"
            />
            <span className={styles.campoAyuda}>
              Base conjugada: {especieTampon.conjugadaFormula} ({especieTampon.conjugadaNombre})
            </span>
          </div>
        </div>

        <div className={styles.resultadoPanel} role="status" aria-live="polite">
          {resultadoTampon === null ? (
            <p className={styles.resultadoVacio}>
              Introduce dos concentraciones mayores que cero para ver el pH del tampón.
            </p>
          ) : (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoEtq}>pH del tampón</span>
                <strong className={styles.resultadoValor}>
                  {formatNumber(resultadoTampon.ph, 2)}
                </strong>
                <span className={styles.resultadoSub}>
                  pKa = {formatNumber(resultadoTampon.pka, 2)} · proporción base/ácido ={' '}
                  {formatNumber(resultadoTampon.proporcion, 2)}
                </span>
              </div>

              <dl className={styles.detalleCalculo}>
                <div>
                  <dt>Sustitución</dt>
                  <dd>
                    pH = {formatNumber(resultadoTampon.pka, 2)} + log(
                    {formatNumber(resultadoTampon.proporcion, 2)}) ={' '}
                    {formatNumber(resultadoTampon.ph, 2)}
                  </dd>
                </div>
                <div>
                  <dt>Rango útil del tampón (pKa ± 1)</dt>
                  <dd>
                    de {formatNumber(resultadoTampon.minimo, 2)} a{' '}
                    {formatNumber(resultadoTampon.maximo, 2)}
                  </dd>
                </div>
              </dl>

              {resultadoTampon.dentroDeRango ? (
                <p className={styles.notaOk}>
                  <span aria-hidden="true">✅</span> <strong>Dentro del rango útil.</strong> La
                  proporción entre base y ácido está entre 1/10 y 10, de modo que el sistema tiene
                  capacidad reguladora en ambos sentidos. La regulación es máxima cuando las dos
                  concentraciones son iguales y el pH coincide con el pKa.
                </p>
              ) : (
                <p className={styles.notaAviso}>
                  <span aria-hidden="true">⚠️</span> <strong>Fuera del rango útil.</strong> Con una
                  proporción tan desequilibrada, uno de los dos componentes está casi agotado y el
                  tampón deja de amortiguar en ese sentido. Para trabajar a este pH conviene elegir
                  otro par conjugado cuyo pKa esté más cerca del valor deseado.
                </p>
              )}
              <p className={styles.notaNeutra}>
                La ecuación usa concentraciones en el equilibrio y supone que ambas son bastante
                mayores que la cantidad disociada, algo razonable en tampones por encima de 0,01 M.
                Tampoco tiene en cuenta la fuerza iónica, que en disoluciones concentradas desplaza
                el pH unas décimas.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender Ka y Kb, no solo copiar el número"
        subtitle="Qué mide cada constante, cómo se pasa de Ka a Kb y cómo se calcula un pH con criterio"
      >
        <section className={styles.guideSection}>
          <h2>Qué mide exactamente una constante de acidez</h2>
          <p>
            Cuando un ácido HA se disuelve en agua se establece un equilibrio: parte de las
            moléculas ceden su protón al agua y parte permanecen sin disociar. La constante de
            acidez es la constante de ese equilibrio y mide hasta dónde llega la reacción.
          </p>
          <div className={styles.formulaBox}>
            HA + H₂O ⇌ A⁻ + H₃O⁺ · Ka = [A⁻]·[H₃O⁺] / [HA]
          </div>
          <p>
            Cuanto mayor es Ka, más desplazado hacia la derecha está el equilibrio y más fuerte es
            el ácido. Como los valores abarcan más de veinte órdenes de magnitud, resulta más
            cómodo trabajar con su logaritmo cambiado de signo: <strong>pKa = −log Ka</strong>.
            Ojo con la inversión de la escala: <em>Ka grande = pKa pequeño = ácido fuerte</em>. Una
            unidad de pKa equivale a un factor 10 en Ka.
          </p>
          <p>
            Con las bases ocurre lo mismo, pero el equilibrio produce iones OH⁻ y la constante se
            llama Kb. Y como el agua puede actuar de las dos formas, ambas escalas están unidas por
            el producto iónico del agua: <strong>Ka · Kb = Kw = 1,0×10⁻¹⁴</strong> a 25 °C, o en
            forma logarítmica <strong>pKa + pKb = 14</strong>. Esa es la razón de que en esta tabla
            cada fila muestre las cuatro cifras: conociendo una, las otras tres están determinadas.
          </p>

          <h2>Las siete familias de la tabla, de un vistazo</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Rango típico de pKa</th>
                  <th>Rasgo característico</th>
                  <th>Ejemplo de referencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Ácidos fuertes</strong>
                  </td>
                  <td>menor que 0</td>
                  <td>Disociación completa; su Ka no es medible en agua</td>
                  <td>HCl, HNO₃, HClO₄</td>
                </tr>
                <tr>
                  <td>
                    <strong>Ácidos débiles inorgánicos</strong>
                  </td>
                  <td>2 a 11</td>
                  <td>Hidrácidos y oxácidos; más oxígenos, más acidez</td>
                  <td>HF (3,17), HClO (7,52)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Ácidos carboxílicos</strong>
                  </td>
                  <td>0,7 a 5</td>
                  <td>Los sustituyentes electronegativos suben mucho la acidez</td>
                  <td>Acético (4,74), tricloroacético (0,66)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Ácidos polipróticos</strong>
                  </td>
                  <td>escalonado</td>
                  <td>Cada constante sucesiva es varios órdenes menor que la anterior</td>
                  <td>H₃PO₄: 2,12 · 7,21 · 12,32</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bases fuertes</strong>
                  </td>
                  <td>—</td>
                  <td>Aportan OH⁻ directamente, sin equilibrio</td>
                  <td>NaOH, KOH, Ca(OH)₂</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bases débiles</strong>
                  </td>
                  <td>pKb de 3 a 14</td>
                  <td>Aminas y compuestos con par libre disponible en el nitrógeno</td>
                  <td>NH₃ (pKb 4,74), anilina (pKb 9,42)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bases conjugadas</strong>
                  </td>
                  <td>pKb = 14 − pKa</td>
                  <td>Aniones de sales que dan disoluciones básicas al hidrolizarse</td>
                  <td>Acetato, carbonato, cianuro</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Dónde aparecen estas constantes fuera del aula</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🫁
              </span>
              <strong>El tampón bicarbonato</strong>
              <p>
                El par CO₂/HCO₃⁻ mantiene la sangre en torno a pH 7,4 y controla también la acidez
                de los océanos, que absorben CO₂ atmosférico. Es el ejemplo canónico de sistema
                regulador abierto, porque uno de los componentes es un gas.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🥤
              </span>
              <strong>Refrescos y conservantes</strong>
              <p>
                El ácido cítrico (E-330) regula la acidez de bebidas y conservas gracias a sus tres
                pKa muy juntos, y el benzoato de sodio (E-211) solo actúa como conservante en medio
                ácido, donde predomina el ácido benzoico sin disociar.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🧼
              </span>
              <strong>Limpieza doméstica</strong>
              <p>
                El amoníaco de los limpiadores es una base débil (Kb 1,8×10⁻⁵) y el vinagre un
                ácido débil de pKa 4,74. Su reacción produce acetato de amonio, motivo por el que
                mezclarlos anula el efecto de ambos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💊
              </span>
              <strong>Química de los fármacos</strong>
              <p>
                El ácido salicílico, de donde procede por esterificación el ácido acetilsalicílico,
                ilustra cómo el pKa determina la proporción entre forma neutra e ionizada de una
                molécula. Es un ejemplo de estructura química, no una indicación de uso.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Ka grande significa ácido fuerte o débil?</h4>
              <p>
                Ka grande significa ácido fuerte: el equilibrio está muy desplazado hacia los
                productos y hay mucho H₃O⁺ en disolución. Con pKa pasa lo contrario, porque lleva
                el signo cambiado: pKa pequeño equivale a ácido fuerte. El ácido tricloroacético
                (pKa 0,66) es mucho más fuerte que el acético (pKa 4,74), y este a su vez es
                muchísimo más fuerte que el fenol (pKa 10,00).
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla mental: la p de pKa «invierte» la escala,
                igual que el pH bajo indica mucha acidez.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo puedo usar la fórmula rápida pH = ½(pKa − log C)?</h4>
              <p>
                Solo cuando la aproximación del 5 % es válida, es decir, cuando la cantidad
                disociada es pequeña frente a la concentración inicial. Esa expresión no es más que
                x = √(Ka·C) escrita en forma logarítmica. Falla con ácidos relativamente fuertes
                (Ka del orden de 10⁻² o mayor) y con disoluciones muy diluidas; la calculadora de
                esta página avisa en ambos casos.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Comprueba siempre el porcentaje después de
                calcular: si supera el 5 %, resuelve la ecuación de segundo grado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué la segunda constante de un ácido poliprótico es tanto menor?</h4>
              <p>
                Porque el segundo protón hay que arrancarlo de una especie que ya tiene carga
                negativa, y la atracción electrostática lo retiene con mucha más fuerza. La caída
                típica es de cuatro a seis órdenes de magnitud: en el ácido fosfórico se pasa de
                pKa 2,12 a 7,21 y de ahí a 12,32. En la práctica esto permite tratar cada
                disociación por separado y, para calcular el pH, quedarse solo con la primera.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si Ka₁ es más de mil veces mayor que Ka₂, el pH
                queda determinado prácticamente por Ka₁ sola.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué una sal puede dar una disolución ácida o básica?</h4>
              <p>
                Porque sus iones pueden reaccionar con el agua. El acetato de sodio es básico
                porque el acetato es la base conjugada de un ácido débil (Kb 5,6×10⁻¹⁰); el cloruro
                de amonio es ácido porque el amonio es el ácido conjugado de una base débil (Ka
                5,6×10⁻¹⁰); y el cloruro de sodio es neutro porque ni Na⁺ ni Cl⁻ reaccionan de
                forma apreciable. La regla es sencilla: sobrevive el ion que procede del compuesto
                débil.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Para una sal de ácido débil y base débil, se
                comparan Ka y Kb: manda la mayor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Los valores de Ka cambian con la temperatura?</h4>
              <p>
                Sí. Todas las constantes de esta tabla están medidas a 25 °C, que es la referencia
                habitual. Al variar la temperatura cambian tanto las Ka como el propio Kw: a 25 °C
                vale 1,0×10⁻¹⁴ y el punto neutro está en pH 7,00, mientras que a 37 °C Kw es mayor
                y el agua pura neutra tiene un pH próximo a 6,8. Neutro significa [H₃O⁺] = [OH⁻],
                no exactamente pH 7.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Indica siempre la temperatura al dar un valor de
                Ka: sin ella, el dato está incompleto.
              </p>
            </div>
          </div>

          <h2>Cómo calcular el pH de una disolución paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica qué tienes delante</strong>
                <p>
                  ¿Un ácido o una base? ¿Fuerte o débil? ¿Una sal que se hidroliza? ¿Una mezcla de
                  ácido y base conjugada? Cada caso lleva a un procedimiento distinto, y equivocarse
                  aquí invalida todo lo demás.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Si es fuerte, no plantees equilibrio</strong>
                <p>
                  La disociación es completa: para un ácido, [H₃O⁺] = C y pH = −log C. Para una
                  base, [OH⁻] = C (o 2·C en el Ca(OH)₂), pOH = −log [OH⁻] y pH = 14 − pOH.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Si es débil, monta la tabla de equilibrio</strong>
                <p>
                  Escribe las concentraciones iniciales, la variación (−x para el ácido, +x para
                  los productos) y las del equilibrio. Sustituye en Ka = x²/(C − x) y obtendrás una
                  ecuación con una sola incógnita.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Aproxima y comprueba la regla del 5 %</strong>
                <p>
                  Supón C − x ≈ C, calcula x = √(Ka·C) y mira qué porcentaje de C representa. Si es
                  menor o igual al 5 %, la aproximación se acepta. Si no, resuelve x² + Ka·x − Ka·C
                  = 0 con la fórmula cuadrática y quédate con la raíz positiva.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Convierte a pH y contrasta el resultado</strong>
                <p>
                  pH = −log [H₃O⁺]; si has calculado [OH⁻], pasa antes por pOH. Después pregúntate
                  si el número tiene sentido: un ácido débil 0,1 M debe dar un pH entre 2 y 5, nunca
                  negativo ni por encima de 7.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas al trabajar con Ka y Kb</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🌡️
              </span>
              <strong>Anota siempre la temperatura</strong>
              <p>
                Los valores tabulados son a 25 °C. Fuera de esa temperatura cambian tanto las
                constantes como el punto neutro de la escala de pH.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <strong>No inventes cifras significativas</strong>
              <p>
                Si la Ka tiene dos cifras, el pH no puede darse con cuatro decimales. En pH, las
                cifras significativas son las decimales, porque proceden de un logaritmo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⚖️
              </span>
              <strong>Usa Ka·Kb = Kw para no memorizar el doble</strong>
              <p>
                Con la Ka del ácido tienes la Kb de su conjugado sin buscarla en ninguna tabla.
                Basta dividir 1,0×10⁻¹⁴ entre Ka, o restar el pKa de 14.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <strong>Elige el tampón por su pKa</strong>
              <p>
                Para trabajar a un pH dado, busca un par conjugado con pKa cercano: el rango útil
                es pKa ± 1 y la capacidad reguladora es máxima cuando pH = pKa.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes al usar una tabla de Ka</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir la escala de Ka con la de pKa:</strong> Ka mayor significa ácido
                más fuerte, pero pKa mayor significa ácido más débil. Es el fallo número uno en los
                ejercicios de ordenar por acidez.
              </li>
              <li>
                <strong>Aplicar la aproximación sin comprobarla:</strong> con ácidos de Ka en torno
                a 10⁻² o con concentraciones muy bajas, x deja de ser despreciable frente a C y hay
                que resolver la ecuación de segundo grado.
              </li>
              <li>
                <strong>Tratar el ácido sulfúrico como completamente diprótico:</strong> solo la
                primera disociación es total; la segunda tiene Ka 1,2×10⁻² y debe plantearse como
                un equilibrio.
              </li>
              <li>
                <strong>Buscar la Ka de un ácido fuerte para calcular su pH:</strong> no hace
                falta. Si la disociación es completa, [H₃O⁺] es directamente la concentración
                inicial.
              </li>
              <li>
                <strong>Olvidar los dos OH⁻ del Ca(OH)₂:</strong> una disolución 0,01 M contiene
                0,02 M de OH⁻, de modo que el pOH es 1,70 y no 2,00.
              </li>
              <li>
                <strong>Sumar mal pKa y pKb:</strong> la relación pKa + pKb = 14 solo vale a 25 °C
                y únicamente entre un ácido y <em>su</em> base conjugada, no entre dos especies
                cualesquiera.
              </li>
              <li>
                <strong>Ignorar la autoionización del agua:</strong> ningún ácido, por diluido que
                esté, produce una disolución básica. Por debajo de 10⁻⁶ M el pH tiende a 7, no
                sigue subiendo.
              </li>
              <li>
                <strong>Mezclar valores de fuentes distintas:</strong> la Ka₂ del H₂S aparece como
                10⁻¹³ en tablas antiguas y como 10⁻¹⁹ en las modernas. Elige una fuente, indícala y
                sé coherente en todo el ejercicio.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre la química de secundaria y preparatoria (educación media superior),
            los temas de equilibrio ácido-base que suelen entrar en un examen de admisión
            universitaria y la asignatura de química general de los primeros cursos de grado. Las
            filas de ácidos fuertes, ácidos débiles monopróticos y bases débiles bastan para el
            nivel preuniversitario; los polipróticos con sus constantes sucesivas y los cálculos de
            tampones corresponden ya a química general universitaria y al laboratorio de análisis.
          </p>
          <p>
            Las constantes están dadas a 25 °C con dos cifras significativas, que es la precisión
            con la que coinciden las fuentes de referencia habituales. Si tu libro de texto usa un
            valor ligeramente distinto, el pH resultante variará como mucho en unas centésimas: lo
            importante es indicar siempre qué valor has empleado.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-ka-kb')} />

      <ShareCard appName="tabla-ka-kb" />

      <Footer appName="tabla-ka-kb" />
    </div>
  );
}

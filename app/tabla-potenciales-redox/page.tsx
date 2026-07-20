'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaPotencialesRedox.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib/formatters';

/* ────────────────────────────────────────────────────────────────
   Utilidades
──────────────────────────────────────────────────────────────── */

/** Normaliza texto para buscar sin acentos ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Formatea un potencial en voltios con signo explícito y coma decimal. */
function formatearPotencial(valor: number): string {
  if (valor === 0) return '0,00 V';
  const signo = valor > 0 ? '+' : '−';
  return `${signo}${formatNumber(Math.abs(valor), 2)} V`;
}

/** Mínimo común múltiplo (para igualar electrones). */
function mcm(a: number, b: number): number {
  const mcd = (x: number, y: number): number => (y === 0 ? x : mcd(y, x % y));
  return (a * b) / mcd(a, b);
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

/** Un término de una semirreacción: coeficiente y fórmula de la especie. */
type Termino = [number, string];

type CategoriaId =
  | 'oxidante-fuerte'
  | 'oxidante-moderado'
  | 'intermedio'
  | 'reductor-moderado'
  | 'reductor-fuerte';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
  rango: string;
}

interface ParRedox {
  id: string;
  categoria: CategoriaId;
  /** Nombre legible del par, forma oxidada / forma reducida */
  nombre: string;
  /** Miembros de la izquierda de la semirreacción de reducción (sin electrones) */
  izquierda: Termino[];
  /** Miembros de la derecha de la semirreacción de reducción */
  derecha: Termino[];
  /** Electrones intercambiados */
  n: number;
  /** Potencial estándar de reducción en voltios (25 °C, 1 M, 1 atm, frente al EEH) */
  e0: number;
  /** Material del electrodo en la notación de pila */
  electrodo: string;
  /** Especies presentes en la disolución, para la notación de pila */
  disolucion: string;
  /** Dónde aparece este par en el mundo real */
  aplicacion: string;
  /** Símbolo del metal si el par entra en la serie de actividad */
  serieMetal?: string;
  /** Texto plano para el buscador: sinónimos incluidos */
  busqueda: string;
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'oxidante-fuerte',
    nombre: 'Oxidantes fuertes',
    icono: '🔥',
    rango: 'E° ≥ +1,20 V',
  },
  {
    id: 'oxidante-moderado',
    nombre: 'Oxidantes moderados',
    icono: '⚡',
    rango: '+0,30 a +1,20 V',
  },
  {
    id: 'intermedio',
    nombre: 'Pares metálicos y referencia',
    icono: '⚖️',
    rango: '−0,30 a +0,30 V',
  },
  {
    id: 'reductor-moderado',
    nombre: 'Reductores moderados',
    icono: '🔋',
    rango: '−1,20 a −0,30 V',
  },
  {
    id: 'reductor-fuerte',
    nombre: 'Reductores fuertes',
    icono: '💥',
    rango: 'E° ≤ −1,20 V',
  },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  'oxidante-fuerte': 'Oxidante fuerte',
  'oxidante-moderado': 'Oxidante moderado',
  intermedio: 'Par intermedio',
  'reductor-moderado': 'Reductor moderado',
  'reductor-fuerte': 'Reductor fuerte',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE POTENCIALES ESTÁNDAR DE REDUCCIÓN
   Condiciones: 25 °C, concentraciones 1 M, gases a 1 atm, medida
   frente al electrodo estándar de hidrógeno (EEH = 0,00 V por
   convenio). Valores redondeados a la centésima de voltio y
   consistentes con las tablas de referencia habituales (CRC
   Handbook y textos de química general).

   Cada semirreacción se ha comprobado una a una en masa y en carga.
──────────────────────────────────────────────────────────────── */

const PARES: ParRedox[] = [
  /* ══ Oxidantes fuertes (E° ≥ +1,20 V) ══════════════════════ */
  {
    id: 'fluor',
    categoria: 'oxidante-fuerte',
    nombre: 'Flúor / fluoruro (F₂ / F⁻)',
    izquierda: [[1, 'F₂']],
    derecha: [[2, 'F⁻']],
    n: 2,
    e0: 2.87,
    electrodo: 'Pt(s)',
    disolucion: 'F₂(g), F⁻',
    aplicacion:
      'Es el oxidante más potente de la tabla: oxida al agua y no puede prepararse por vía electroquímica en disolución acuosa, sino por electrólisis de HF fundido.',
    busqueda:
      'fluor f2 fluoruro oxidante mas fuerte potencial mas alto halogeno electronegativo 2,87',
  },
  {
    id: 'ozono',
    categoria: 'oxidante-fuerte',
    nombre: 'Ozono / oxígeno (O₃ / O₂)',
    izquierda: [[1, 'O₃'], [2, 'H⁺']],
    derecha: [[1, 'O₂'], [1, 'H₂O']],
    n: 2,
    e0: 2.08,
    electrodo: 'Pt(s)',
    disolucion: 'O₃(g), O₂(g), H⁺',
    aplicacion:
      'Desinfección de agua potable y tratamiento de aguas residuales: oxida materia orgánica y microorganismos sin dejar residuo clorado.',
    busqueda: 'ozono o3 oxigeno desinfeccion agua potable oxidante fuerte 2,08',
  },
  {
    id: 'persulfato',
    categoria: 'oxidante-fuerte',
    nombre: 'Peroxodisulfato / sulfato (S₂O₈²⁻ / SO₄²⁻)',
    izquierda: [[1, 'S₂O₈²⁻']],
    derecha: [[2, 'SO₄²⁻']],
    n: 2,
    e0: 2.01,
    electrodo: 'Pt(s)',
    disolucion: 'S₂O₈²⁻, SO₄²⁻',
    aplicacion:
      'Iniciador de polimerizaciones y grabado de placas de circuito impreso; también se usa para oxidar contaminantes en suelos.',
    busqueda: 'peroxodisulfato persulfato s2o8 sulfato iniciador polimerizacion 2,01',
  },
  {
    id: 'peroxido-agua',
    categoria: 'oxidante-fuerte',
    nombre: 'Peróxido de hidrógeno / agua (H₂O₂ / H₂O)',
    izquierda: [[1, 'H₂O₂'], [2, 'H⁺']],
    derecha: [[2, 'H₂O']],
    n: 2,
    e0: 1.78,
    electrodo: 'Pt(s)',
    disolucion: 'H₂O₂, H⁺',
    aplicacion:
      'Agua oxigenada: blanqueante, desinfectante y propulsante. Con E° = +1,78 V como oxidante y +0,68 V como reductor, el H₂O₂ puede dismutarse en O₂ y H₂O.',
    busqueda:
      'peroxido de hidrogeno agua oxigenada h2o2 blanqueante desinfectante dismutacion 1,78',
  },
  {
    id: 'cerio',
    categoria: 'oxidante-fuerte',
    nombre: 'Cerio(IV) / cerio(III) (Ce⁴⁺ / Ce³⁺)',
    izquierda: [[1, 'Ce⁴⁺']],
    derecha: [[1, 'Ce³⁺']],
    n: 1,
    e0: 1.72,
    electrodo: 'Pt(s)',
    disolucion: 'Ce⁴⁺, Ce³⁺',
    aplicacion:
      'Cerimetría: valoraciones redox de alta precisión. El potencial real depende mucho del ácido del medio (≈ +1,44 V en H₂SO₄ 1 M).',
    busqueda: 'cerio ce4 ce3 cerimetria valoracion redox sulfato cerico 1,72',
  },
  {
    id: 'pbo2-sulfato',
    categoria: 'oxidante-fuerte',
    nombre: 'Dióxido de plomo / sulfato de plomo (PbO₂ / PbSO₄)',
    izquierda: [[1, 'PbO₂'], [1, 'SO₄²⁻'], [4, 'H⁺']],
    derecha: [[1, 'PbSO₄'], [2, 'H₂O']],
    n: 2,
    e0: 1.69,
    electrodo: 'PbO₂(s)',
    disolucion: 'SO₄²⁻, H⁺',
    aplicacion:
      'Cátodo de la batería de plomo-ácido del automóvil. Junto al ánodo Pb/PbSO₄ (−0,36 V) da los ≈ 2,05 V de cada uno de sus seis vasos.',
    busqueda:
      'dioxido de plomo pbo2 sulfato bateria plomo acido coche acumulador catodo 1,69',
  },
  {
    id: 'permanganato-mno2',
    categoria: 'oxidante-fuerte',
    nombre: 'Permanganato / dióxido de manganeso (MnO₄⁻ / MnO₂)',
    izquierda: [[1, 'MnO₄⁻'], [4, 'H⁺']],
    derecha: [[1, 'MnO₂'], [2, 'H₂O']],
    n: 3,
    e0: 1.68,
    electrodo: 'Pt(s)',
    disolucion: 'MnO₄⁻, H⁺',
    aplicacion:
      'Camino que sigue el permanganato en medio poco ácido: aparece el precipitado pardo de MnO₂ que enturbia la valoración.',
    busqueda: 'permanganato dioxido de manganeso mno2 precipitado pardo medio neutro 1,68',
  },
  {
    id: 'permanganato',
    categoria: 'oxidante-fuerte',
    nombre: 'Permanganato / manganeso(II) (MnO₄⁻ / Mn²⁺)',
    izquierda: [[1, 'MnO₄⁻'], [8, 'H⁺']],
    derecha: [[1, 'Mn²⁺'], [4, 'H₂O']],
    n: 5,
    e0: 1.51,
    electrodo: 'Pt(s)',
    disolucion: 'MnO₄⁻, Mn²⁺, H⁺',
    aplicacion:
      'Permanganimetría: el reactivo actúa como su propio indicador, porque el violeta intenso del MnO₄⁻ desaparece al reducirse al Mn²⁺ casi incoloro.',
    busqueda:
      'permanganato potasico kmno4 manganeso valoracion permanganimetria violeta autoindicador medio acido 1,51',
  },
  {
    id: 'oro',
    categoria: 'oxidante-fuerte',
    nombre: 'Oro(III) / oro (Au³⁺ / Au)',
    izquierda: [[1, 'Au³⁺']],
    derecha: [[1, 'Au']],
    n: 3,
    e0: 1.5,
    electrodo: 'Au(s)',
    disolucion: 'Au³⁺(1 M)',
    serieMetal: 'Au',
    aplicacion:
      'Explica la inercia química del oro: ningún ácido común lo oxida. Hace falta agua regia, donde los cloruros estabilizan el Au(III) como [AuCl₄]⁻.',
    busqueda: 'oro au3 metal noble agua regia inerte joyeria contactos electronicos 1,50',
  },
  {
    id: 'pbo2-acido',
    categoria: 'oxidante-fuerte',
    nombre: 'Dióxido de plomo / plomo(II) (PbO₂ / Pb²⁺)',
    izquierda: [[1, 'PbO₂'], [4, 'H⁺']],
    derecha: [[1, 'Pb²⁺'], [2, 'H₂O']],
    n: 2,
    e0: 1.46,
    electrodo: 'PbO₂(s)',
    disolucion: 'Pb²⁺, H⁺',
    aplicacion:
      'Ánodos de PbO₂ en electrosíntesis y en el tratamiento electroquímico de aguas contaminadas.',
    busqueda: 'dioxido de plomo pbo2 plomo ii anodo electrosintesis 1,46',
  },
  {
    id: 'clorato',
    categoria: 'oxidante-fuerte',
    nombre: 'Clorato / cloruro (ClO₃⁻ / Cl⁻)',
    izquierda: [[1, 'ClO₃⁻'], [6, 'H⁺']],
    derecha: [[1, 'Cl⁻'], [3, 'H₂O']],
    n: 6,
    e0: 1.45,
    electrodo: 'Pt(s)',
    disolucion: 'ClO₃⁻, Cl⁻, H⁺',
    aplicacion:
      'Cloratos en cerillas, pirotecnia y generadores químicos de oxígeno de aviación.',
    busqueda: 'clorato clo3 cloruro pirotecnia cerillas generador de oxigeno 1,45',
  },
  {
    id: 'bromato',
    categoria: 'oxidante-fuerte',
    nombre: 'Bromato / bromuro (BrO₃⁻ / Br⁻)',
    izquierda: [[1, 'BrO₃⁻'], [6, 'H⁺']],
    derecha: [[1, 'Br⁻'], [3, 'H₂O']],
    n: 6,
    e0: 1.42,
    electrodo: 'Pt(s)',
    disolucion: 'BrO₃⁻, Br⁻, H⁺',
    aplicacion:
      'Bromatometría en análisis químico y reacciones oscilantes tipo Belousov-Zhabotinsky.',
    busqueda: 'bromato bro3 bromuro bromatometria reaccion oscilante belousov 1,42',
  },
  {
    id: 'cloro',
    categoria: 'oxidante-fuerte',
    nombre: 'Cloro / cloruro (Cl₂ / Cl⁻)',
    izquierda: [[1, 'Cl₂']],
    derecha: [[2, 'Cl⁻']],
    n: 2,
    e0: 1.36,
    electrodo: 'Pt(s)',
    disolucion: 'Cl₂(g), Cl⁻',
    aplicacion:
      'Potabilización de agua y blanqueo industrial. En la electrólisis de salmuera es el producto del ánodo, base de la industria cloro-álcali.',
    busqueda:
      'cloro cl2 cloruro potabilizacion salmuera electrolisis cloro alcali blanqueo 1,36',
  },
  {
    id: 'dicromato',
    categoria: 'oxidante-fuerte',
    nombre: 'Dicromato / cromo(III) (Cr₂O₇²⁻ / Cr³⁺)',
    izquierda: [[1, 'Cr₂O₇²⁻'], [14, 'H⁺']],
    derecha: [[2, 'Cr³⁺'], [7, 'H₂O']],
    n: 6,
    e0: 1.33,
    electrodo: 'Pt(s)',
    disolucion: 'Cr₂O₇²⁻, Cr³⁺, H⁺',
    aplicacion:
      'Dicromatometría y antiguos etilómetros: el naranja del dicromato viraba a verde Cr³⁺ al oxidar el etanol del aliento.',
    busqueda:
      'dicromato potasico k2cr2o7 cromo iii naranja verde etilometro alcoholimetro dicromatometria 1,33',
  },
  {
    id: 'oxigeno-acido',
    categoria: 'oxidante-fuerte',
    nombre: 'Oxígeno / agua en medio ácido (O₂ / H₂O)',
    izquierda: [[1, 'O₂'], [4, 'H⁺']],
    derecha: [[2, 'H₂O']],
    n: 4,
    e0: 1.23,
    electrodo: 'Pt(s)',
    disolucion: 'O₂(g), H⁺',
    aplicacion:
      'Es el oxidante que impulsa la corrosión atmosférica y el cátodo de las pilas de combustible de hidrógeno.',
    busqueda:
      'oxigeno agua medio acido corrosion pila de combustible reduccion del oxigeno 1,23',
  },
  {
    id: 'mno2',
    categoria: 'oxidante-fuerte',
    nombre: 'Dióxido de manganeso / manganeso(II) (MnO₂ / Mn²⁺)',
    izquierda: [[1, 'MnO₂'], [4, 'H⁺']],
    derecha: [[1, 'Mn²⁺'], [2, 'H₂O']],
    n: 2,
    e0: 1.23,
    electrodo: 'MnO₂(s)',
    disolucion: 'Mn²⁺, H⁺',
    aplicacion:
      'Cátodo de las pilas alcalinas y salinas de uso doméstico, combinado con un ánodo de zinc en polvo.',
    busqueda: 'dioxido de manganeso mno2 pila alcalina salina catodo pirolusita 1,23',
  },
  {
    id: 'yodato',
    categoria: 'oxidante-fuerte',
    nombre: 'Yodato / yodo (IO₃⁻ / I₂)',
    izquierda: [[2, 'IO₃⁻'], [12, 'H⁺']],
    derecha: [[1, 'I₂'], [6, 'H₂O']],
    n: 10,
    e0: 1.2,
    electrodo: 'Pt(s)',
    disolucion: 'IO₃⁻, I₂, H⁺',
    aplicacion:
      'Patrón primario en yodometría: el yodato potásico permite generar yodo en cantidad exactamente conocida.',
    busqueda: 'yodato io3 yodo patron primario yodometria kio3 1,20',
  },

  /* ══ Oxidantes moderados (+0,30 a +1,20 V) ═════════════════ */
  {
    id: 'platino',
    categoria: 'oxidante-moderado',
    nombre: 'Platino(II) / platino (Pt²⁺ / Pt)',
    izquierda: [[1, 'Pt²⁺']],
    derecha: [[1, 'Pt']],
    n: 2,
    e0: 1.18,
    electrodo: 'Pt(s)',
    disolucion: 'Pt²⁺(1 M)',
    serieMetal: 'Pt',
    aplicacion:
      'Justifica que el platino se use como electrodo inerte: no se oxida en las condiciones habituales de trabajo.',
    busqueda: 'platino pt2 electrodo inerte metal noble catalizador 1,18',
  },
  {
    id: 'bromo',
    categoria: 'oxidante-moderado',
    nombre: 'Bromo / bromuro (Br₂ / Br⁻)',
    izquierda: [[1, 'Br₂']],
    derecha: [[2, 'Br⁻']],
    n: 2,
    e0: 1.07,
    electrodo: 'Pt(s)',
    disolucion: 'Br₂(l), Br⁻',
    aplicacion:
      'El cloro desplaza al bromuro (1,36 > 1,07) y por eso el bromo se extrae industrialmente burbujeando cloro en salmuera.',
    busqueda: 'bromo br2 bromuro desplazamiento halogenos salmuera agua de bromo 1,07',
  },
  {
    id: 'nitrato-no',
    categoria: 'oxidante-moderado',
    nombre: 'Nitrato / monóxido de nitrógeno (NO₃⁻ / NO)',
    izquierda: [[1, 'NO₃⁻'], [4, 'H⁺']],
    derecha: [[1, 'NO'], [2, 'H₂O']],
    n: 3,
    e0: 0.96,
    electrodo: 'Pt(s)',
    disolucion: 'NO₃⁻, H⁺',
    aplicacion:
      'Explica por qué el ácido nítrico diluido disuelve al cobre, cosa que el clorhídrico no consigue: aquí no oxida el H⁺, oxida el nitrato.',
    busqueda:
      'nitrato acido nitrico hno3 monoxido de nitrogeno no disolver cobre ataque acido oxidante 0,96',
  },
  {
    id: 'mercurio-i',
    categoria: 'oxidante-moderado',
    nombre: 'Mercurio(II) / mercurio(I) (Hg²⁺ / Hg₂²⁺)',
    izquierda: [[2, 'Hg²⁺']],
    derecha: [[1, 'Hg₂²⁺']],
    n: 2,
    e0: 0.92,
    electrodo: 'Pt(s)',
    disolucion: 'Hg²⁺, Hg₂²⁺',
    aplicacion:
      'Uno de los pocos casos en que un catión forma un dímero estable, el ion mercurioso Hg₂²⁺ con enlace Hg–Hg.',
    busqueda: 'mercurio ii mercurioso hg2 dimero ion mercurioso 0,92',
  },
  {
    id: 'hipoclorito',
    categoria: 'oxidante-moderado',
    nombre: 'Hipoclorito / cloruro en medio básico (ClO⁻ / Cl⁻)',
    izquierda: [[1, 'ClO⁻'], [1, 'H₂O']],
    derecha: [[1, 'Cl⁻'], [2, 'OH⁻']],
    n: 2,
    e0: 0.89,
    electrodo: 'Pt(s)',
    disolucion: 'ClO⁻, Cl⁻, OH⁻',
    aplicacion:
      'Es la lejía doméstica. Mezclarla con un ácido libera Cl₂ tóxico, y con amoniaco genera cloraminas: nunca se combinan productos de limpieza.',
    busqueda: 'hipoclorito lejia clo cloro domestico blanqueador medio basico cloraminas 0,89',
  },
  {
    id: 'mercurio',
    categoria: 'oxidante-moderado',
    nombre: 'Mercurio(II) / mercurio (Hg²⁺ / Hg)',
    izquierda: [[1, 'Hg²⁺']],
    derecha: [[1, 'Hg']],
    n: 2,
    e0: 0.85,
    electrodo: 'Hg(l)',
    disolucion: 'Hg²⁺(1 M)',
    serieMetal: 'Hg',
    aplicacion:
      'Potencial positivo alto: el mercurio no desplaza al hidrógeno de los ácidos y aparece nativo en la naturaleza.',
    busqueda: 'mercurio hg2 metal liquido amalgama nativo 0,85',
  },
  {
    id: 'plata',
    categoria: 'oxidante-moderado',
    nombre: 'Plata(I) / plata (Ag⁺ / Ag)',
    izquierda: [[1, 'Ag⁺']],
    derecha: [[1, 'Ag']],
    n: 1,
    e0: 0.8,
    electrodo: 'Ag(s)',
    disolucion: 'Ag⁺(1 M)',
    serieMetal: 'Ag',
    aplicacion:
      'Base del baño de plateado y de la fotografía clásica: la luz reduce el Ag⁺ a plata metálica en la emulsión.',
    busqueda: 'plata ag+ plateado fotografia emulsion espejo de plata galvanoplastia 0,80',
  },
  {
    id: 'nitrato-no2',
    categoria: 'oxidante-moderado',
    nombre: 'Nitrato / dióxido de nitrógeno (NO₃⁻ / NO₂)',
    izquierda: [[1, 'NO₃⁻'], [2, 'H⁺']],
    derecha: [[1, 'NO₂'], [1, 'H₂O']],
    n: 1,
    e0: 0.8,
    electrodo: 'Pt(s)',
    disolucion: 'NO₃⁻, H⁺',
    aplicacion:
      'Ruta que sigue el ácido nítrico concentrado: los humos pardos que aparecen al atacar un metal son NO₂.',
    busqueda: 'nitrato dioxido de nitrogeno no2 humos pardos acido nitrico concentrado 0,80',
  },
  {
    id: 'hierro-iii-ii',
    categoria: 'oxidante-moderado',
    nombre: 'Hierro(III) / hierro(II) (Fe³⁺ / Fe²⁺)',
    izquierda: [[1, 'Fe³⁺']],
    derecha: [[1, 'Fe²⁺']],
    n: 1,
    e0: 0.77,
    electrodo: 'Pt(s)',
    disolucion: 'Fe³⁺, Fe²⁺',
    aplicacion:
      'Par de referencia en química analítica y en bioquímica: es el que cambia de estado en el grupo hemo y en los citocromos.',
    busqueda:
      'hierro iii ii ferrico ferroso fe3 fe2 citocromo hemo par redox biologico 0,77',
  },
  {
    id: 'oxigeno-peroxido',
    categoria: 'oxidante-moderado',
    nombre: 'Oxígeno / peróxido de hidrógeno (O₂ / H₂O₂)',
    izquierda: [[1, 'O₂'], [2, 'H⁺']],
    derecha: [[1, 'H₂O₂']],
    n: 2,
    e0: 0.68,
    electrodo: 'Pt(s)',
    disolucion: 'O₂(g), H₂O₂, H⁺',
    aplicacion:
      'Reducción parcial del oxígeno. Comparado con +1,78 V del par H₂O₂/H₂O, muestra que el peróxido se dismuta espontáneamente en O₂ y agua.',
    busqueda: 'oxigeno peroxido h2o2 dismutacion desproporcion reduccion parcial 0,68',
  },
  {
    id: 'permanganato-basico',
    categoria: 'oxidante-moderado',
    nombre: 'Permanganato en medio básico (MnO₄⁻ / MnO₂)',
    izquierda: [[1, 'MnO₄⁻'], [2, 'H₂O']],
    derecha: [[1, 'MnO₂'], [4, 'OH⁻']],
    n: 3,
    e0: 0.6,
    electrodo: 'Pt(s)',
    disolucion: 'MnO₄⁻, OH⁻',
    aplicacion:
      'Demuestra hasta qué punto el pH cambia el poder oxidante: el mismo permanganato pasa de +1,51 V en medio ácido a +0,60 V en medio básico.',
    busqueda: 'permanganato medio basico alcalino efecto del ph poder oxidante 0,60',
  },
  {
    id: 'yodo',
    categoria: 'oxidante-moderado',
    nombre: 'Yodo / yoduro (I₂ / I⁻)',
    izquierda: [[1, 'I₂']],
    derecha: [[2, 'I⁻']],
    n: 2,
    e0: 0.54,
    electrodo: 'Pt(s)',
    disolucion: 'I₂, I⁻',
    aplicacion:
      'Yodometría con almidón como indicador (azul intenso). El yodo es el halógeno más débil como oxidante, por eso Cl₂ y Br₂ desplazan al yoduro.',
    busqueda:
      'yodo i2 yoduro yodometria almidon indicador azul tiosulfato lugol halogeno 0,54',
  },
  {
    id: 'cobre-i',
    categoria: 'oxidante-moderado',
    nombre: 'Cobre(I) / cobre (Cu⁺ / Cu)',
    izquierda: [[1, 'Cu⁺']],
    derecha: [[1, 'Cu']],
    n: 1,
    e0: 0.52,
    electrodo: 'Cu(s)',
    disolucion: 'Cu⁺(1 M)',
    aplicacion:
      'Comparado con el par Cu²⁺/Cu⁺ (+0,16 V), explica que el Cu⁺ en agua se dismute en Cu²⁺ y cobre metálico.',
    busqueda: 'cobre i cuproso cu+ dismutacion desproporcion inestable en agua 0,52',
  },
  {
    id: 'oxigeno-basico',
    categoria: 'oxidante-moderado',
    nombre: 'Oxígeno / hidróxido en medio básico (O₂ / OH⁻)',
    izquierda: [[1, 'O₂'], [2, 'H₂O']],
    derecha: [[4, 'OH⁻']],
    n: 4,
    e0: 0.4,
    electrodo: 'Pt(s)',
    disolucion: 'O₂(g), OH⁻',
    aplicacion:
      'Cátodo de las pilas de combustible alcalinas y de las pilas de zinc-aire de los audífonos.',
    busqueda: 'oxigeno hidroxilo medio basico pila de combustible alcalina zinc aire 0,40',
  },
  {
    id: 'ferricianuro',
    categoria: 'oxidante-moderado',
    nombre: 'Ferricianuro / ferrocianuro ([Fe(CN)₆]³⁻ / [Fe(CN)₆]⁴⁻)',
    izquierda: [[1, '[Fe(CN)₆]³⁻']],
    derecha: [[1, '[Fe(CN)₆]⁴⁻']],
    n: 1,
    e0: 0.36,
    electrodo: 'Pt(s)',
    disolucion: '[Fe(CN)₆]³⁻, [Fe(CN)₆]⁴⁻',
    aplicacion:
      'Par modelo en voltamperometría y en sensores electroquímicos por su cinética rápida y reversible.',
    busqueda:
      'ferricianuro ferrocianuro hexacianoferrato voltamperometria sensor electroquimico 0,36',
  },
  {
    id: 'cobre',
    categoria: 'oxidante-moderado',
    nombre: 'Cobre(II) / cobre (Cu²⁺ / Cu)',
    izquierda: [[1, 'Cu²⁺']],
    derecha: [[1, 'Cu']],
    n: 2,
    e0: 0.34,
    electrodo: 'Cu(s)',
    disolucion: 'Cu²⁺(1 M)',
    serieMetal: 'Cu',
    aplicacion:
      'Cátodo de la pila Daniell y de la electrorrefinación del cobre. Al ser positivo, el cobre no se disuelve en HCl aunque sí en HNO₃.',
    busqueda:
      'cobre cu2 pila daniell electrorrefinacion catodo sulfato de cobre no reacciona con hcl 0,34',
  },

  /* ══ Pares intermedios y referencia (−0,30 a +0,30 V) ══════ */
  {
    id: 'calomelanos',
    categoria: 'intermedio',
    nombre: 'Calomelanos (Hg₂Cl₂ / Hg)',
    izquierda: [[1, 'Hg₂Cl₂']],
    derecha: [[2, 'Hg'], [2, 'Cl⁻']],
    n: 2,
    e0: 0.27,
    electrodo: 'Hg(l)',
    disolucion: 'Hg₂Cl₂(s), Cl⁻',
    aplicacion:
      'Electrodo de referencia de calomelanos, muy usado en pH-metría antes de que la plata-cloruro de plata lo desplazase.',
    busqueda: 'calomelanos electrodo de referencia hg2cl2 phmetro potenciometria 0,27',
  },
  {
    id: 'plata-cloruro',
    categoria: 'intermedio',
    nombre: 'Cloruro de plata / plata (AgCl / Ag)',
    izquierda: [[1, 'AgCl']],
    derecha: [[1, 'Ag'], [1, 'Cl⁻']],
    n: 1,
    e0: 0.22,
    electrodo: 'Ag(s)',
    disolucion: 'AgCl(s), Cl⁻',
    aplicacion:
      'Electrodo de referencia Ag/AgCl: el más habitual hoy en pH-metros y en los electrodos de electrocardiograma.',
    busqueda:
      'cloruro de plata agcl electrodo de referencia ag/agcl phmetro electrocardiograma 0,22',
  },
  {
    id: 'sulfato-so2',
    categoria: 'intermedio',
    nombre: 'Sulfato / dióxido de azufre (SO₄²⁻ / SO₂)',
    izquierda: [[1, 'SO₄²⁻'], [4, 'H⁺']],
    derecha: [[1, 'SO₂'], [2, 'H₂O']],
    n: 2,
    e0: 0.17,
    electrodo: 'Pt(s)',
    disolucion: 'SO₄²⁻, SO₂, H⁺',
    aplicacion:
      'Ruta del ácido sulfúrico concentrado y caliente cuando ataca metales: los vapores picantes que se desprenden son SO₂.',
    busqueda:
      'sulfato dioxido de azufre so2 acido sulfurico concentrado sulfito conservante 0,17',
  },
  {
    id: 'cobre-ii-i',
    categoria: 'intermedio',
    nombre: 'Cobre(II) / cobre(I) (Cu²⁺ / Cu⁺)',
    izquierda: [[1, 'Cu²⁺']],
    derecha: [[1, 'Cu⁺']],
    n: 1,
    e0: 0.16,
    electrodo: 'Pt(s)',
    disolucion: 'Cu²⁺, Cu⁺',
    aplicacion:
      'Comparado con Cu⁺/Cu (+0,52 V), demuestra que el cobre(I) solo es estable formando complejos o sales insolubles, como el CuI.',
    busqueda: 'cobre ii cobre i cuproso cuprico estabilidad complejos cui 0,16',
  },
  {
    id: 'estanio-iv',
    categoria: 'intermedio',
    nombre: 'Estaño(IV) / estaño(II) (Sn⁴⁺ / Sn²⁺)',
    izquierda: [[1, 'Sn⁴⁺']],
    derecha: [[1, 'Sn²⁺']],
    n: 2,
    e0: 0.15,
    electrodo: 'Pt(s)',
    disolucion: 'Sn⁴⁺, Sn²⁺',
    aplicacion:
      'El Sn²⁺ es un reductor suave de laboratorio: reduce el Fe³⁺ a Fe²⁺ antes de una valoración con dicromato.',
    busqueda: 'estano iv ii estannoso estannico sn4 sn2 reductor suave 0,15',
  },
  {
    id: 'azufre-h2s',
    categoria: 'intermedio',
    nombre: 'Azufre / sulfuro de hidrógeno (S / H₂S)',
    izquierda: [[1, 'S'], [2, 'H⁺']],
    derecha: [[1, 'H₂S']],
    n: 2,
    e0: 0.14,
    electrodo: 'Pt(s)',
    disolucion: 'S(s), H₂S(g), H⁺',
    aplicacion:
      'Química de aguas anóxicas y de la industria del gas: el H₂S es el reductor responsable del olor a huevo podrido.',
    busqueda:
      'azufre sulfuro de hidrogeno h2s huevo podrido aguas anoxicas gas acido 0,14',
  },
  {
    id: 'hidrogeno',
    categoria: 'intermedio',
    nombre: 'Hidrógeno — electrodo de referencia (H⁺ / H₂)',
    izquierda: [[2, 'H⁺']],
    derecha: [[1, 'H₂']],
    n: 2,
    e0: 0,
    electrodo: 'Pt(s)',
    disolucion: 'H⁺(1 M), H₂(1 atm)',
    serieMetal: 'H₂',
    aplicacion:
      'Cero de la escala por convenio internacional: todos los demás valores de la tabla son diferencias medidas frente a este electrodo.',
    busqueda:
      'hidrogeno electrodo estandar de hidrogeno eeh she referencia cero convenio protones 0,00',
  },
  {
    id: 'hierro-iii-metal',
    categoria: 'intermedio',
    nombre: 'Hierro(III) / hierro (Fe³⁺ / Fe)',
    izquierda: [[1, 'Fe³⁺']],
    derecha: [[1, 'Fe']],
    n: 3,
    e0: -0.04,
    electrodo: 'Fe(s)',
    disolucion: 'Fe³⁺(1 M)',
    aplicacion:
      'Valor global de tres electrones, poco usado en la práctica: el hierro se oxida por etapas, primero a Fe²⁺ y luego a Fe³⁺.',
    busqueda: 'hierro iii metal fe3 tres electrones oxidacion por etapas −0,04',
  },
  {
    id: 'plomo',
    categoria: 'intermedio',
    nombre: 'Plomo(II) / plomo (Pb²⁺ / Pb)',
    izquierda: [[1, 'Pb²⁺']],
    derecha: [[1, 'Pb']],
    n: 2,
    e0: -0.13,
    electrodo: 'Pb(s)',
    disolucion: 'Pb²⁺(1 M)',
    serieMetal: 'Pb',
    aplicacion:
      'Justo por debajo del hidrógeno: el plomo reacciona muy despacio con los ácidos porque se recubre de sales insolubles como el PbSO₄.',
    busqueda: 'plomo pb2 pasivacion sulfato insoluble tuberias antiguas −0,13',
  },
  {
    id: 'estanio',
    categoria: 'intermedio',
    nombre: 'Estaño(II) / estaño (Sn²⁺ / Sn)',
    izquierda: [[1, 'Sn²⁺']],
    derecha: [[1, 'Sn']],
    n: 2,
    e0: -0.14,
    electrodo: 'Sn(s)',
    disolucion: 'Sn²⁺(1 M)',
    serieMetal: 'Sn',
    aplicacion:
      'La hojalata es acero estañado. Al ser el estaño menos activo que el hierro, si la capa se raya el acero se corroe más rápido, no menos.',
    busqueda: 'estano sn2 hojalata lata de conserva estanado corrosion −0,14',
  },
  {
    id: 'niquel',
    categoria: 'intermedio',
    nombre: 'Níquel(II) / níquel (Ni²⁺ / Ni)',
    izquierda: [[1, 'Ni²⁺']],
    derecha: [[1, 'Ni']],
    n: 2,
    e0: -0.25,
    electrodo: 'Ni(s)',
    disolucion: 'Ni²⁺(1 M)',
    serieMetal: 'Ni',
    aplicacion:
      'Niquelado electrolítico y baterías de níquel-hidruro metálico de herramientas y vehículos híbridos.',
    busqueda: 'niquel ni2 niquelado bateria nimh hibrido acero inoxidable −0,25',
  },
  {
    id: 'cobalto',
    categoria: 'intermedio',
    nombre: 'Cobalto(II) / cobalto (Co²⁺ / Co)',
    izquierda: [[1, 'Co²⁺']],
    derecha: [[1, 'Co']],
    n: 2,
    e0: -0.28,
    electrodo: 'Co(s)',
    disolucion: 'Co²⁺(1 M)',
    serieMetal: 'Co',
    aplicacion:
      'Componente de los cátodos de óxido mixto de las baterías de ion litio y de imanes permanentes de alta temperatura.',
    busqueda: 'cobalto co2 bateria ion litio catodo imanes vitamina b12 −0,28',
  },

  /* ══ Reductores moderados (−1,20 a −0,30 V) ════════════════ */
  {
    id: 'plomo-sulfato-anodo',
    categoria: 'reductor-moderado',
    nombre: 'Sulfato de plomo / plomo (PbSO₄ / Pb)',
    izquierda: [[1, 'PbSO₄']],
    derecha: [[1, 'Pb'], [1, 'SO₄²⁻']],
    n: 2,
    e0: -0.36,
    electrodo: 'Pb(s)',
    disolucion: 'PbSO₄(s), SO₄²⁻',
    aplicacion:
      'Ánodo de la batería de plomo-ácido. Con el cátodo PbO₂/PbSO₄ (+1,69 V) da los ≈ 2,05 V por vaso de la batería del coche.',
    busqueda: 'sulfato de plomo pbso4 anodo bateria plomo acido sulfatacion −0,36',
  },
  {
    id: 'cadmio',
    categoria: 'reductor-moderado',
    nombre: 'Cadmio(II) / cadmio (Cd²⁺ / Cd)',
    izquierda: [[1, 'Cd²⁺']],
    derecha: [[1, 'Cd']],
    n: 2,
    e0: -0.4,
    electrodo: 'Cd(s)',
    disolucion: 'Cd²⁺(1 M)',
    serieMetal: 'Cd',
    aplicacion:
      'Ánodo de las antiguas baterías de níquel-cadmio, retiradas del mercado de consumo por la toxicidad del metal.',
    busqueda: 'cadmio cd2 bateria nicd niquel cadmio toxico −0,40',
  },
  {
    id: 'cromo-iii-ii',
    categoria: 'reductor-moderado',
    nombre: 'Cromo(III) / cromo(II) (Cr³⁺ / Cr²⁺)',
    izquierda: [[1, 'Cr³⁺']],
    derecha: [[1, 'Cr²⁺']],
    n: 1,
    e0: -0.41,
    electrodo: 'Pt(s)',
    disolucion: 'Cr³⁺, Cr²⁺',
    aplicacion:
      'El Cr²⁺ azul es un reductor tan enérgico que reduce al agua: se usa en laboratorio para eliminar trazas de oxígeno de un gas.',
    busqueda: 'cromo iii ii cromoso cr2 azul reductor trampa de oxigeno −0,41',
  },
  {
    id: 'hierro',
    categoria: 'reductor-moderado',
    nombre: 'Hierro(II) / hierro (Fe²⁺ / Fe)',
    izquierda: [[1, 'Fe²⁺']],
    derecha: [[1, 'Fe']],
    n: 2,
    e0: -0.44,
    electrodo: 'Fe(s)',
    disolucion: 'Fe²⁺(1 M)',
    serieMetal: 'Fe',
    aplicacion:
      'Ánodo de la corrosión del hierro: el metal se oxida a Fe²⁺ mientras el oxígeno disuelto se reduce en otra zona de la pieza y aparece el óxido.',
    busqueda:
      'hierro fe2 corrosion oxidacion herrumbre oxido acero pila de corrosion −0,44',
  },
  {
    id: 'azufre-sulfuro',
    categoria: 'reductor-moderado',
    nombre: 'Azufre / sulfuro (S / S²⁻)',
    izquierda: [[1, 'S']],
    derecha: [[1, 'S²⁻']],
    n: 2,
    e0: -0.48,
    electrodo: 'Pt(s)',
    disolucion: 'S(s), S²⁻',
    aplicacion:
      'Química de los sulfuros minerales y de las baterías de sodio-azufre para almacenamiento estacionario de energía.',
    busqueda: 'azufre sulfuro s2 mineral bateria sodio azufre medio basico −0,48',
  },
  {
    id: 'oxalato',
    categoria: 'reductor-moderado',
    nombre: 'Dióxido de carbono / ácido oxálico (CO₂ / H₂C₂O₄)',
    izquierda: [[2, 'CO₂'], [2, 'H⁺']],
    derecha: [[1, 'H₂C₂O₄']],
    n: 2,
    e0: -0.49,
    electrodo: 'Pt(s)',
    disolucion: 'CO₂(g), H₂C₂O₄, H⁺',
    aplicacion:
      'El oxalato es el patrón primario clásico para normalizar disoluciones de permanganato, porque se oxida limpiamente a CO₂.',
    busqueda:
      'oxalato acido oxalico co2 patron primario normalizar permanganato valoracion −0,49',
  },
  {
    id: 'cromo',
    categoria: 'reductor-moderado',
    nombre: 'Cromo(III) / cromo (Cr³⁺ / Cr)',
    izquierda: [[1, 'Cr³⁺']],
    derecha: [[1, 'Cr']],
    n: 3,
    e0: -0.74,
    electrodo: 'Cr(s)',
    disolucion: 'Cr³⁺(1 M)',
    serieMetal: 'Cr',
    aplicacion:
      'Cromado electrolítico. Pese a su potencial negativo, el cromo resiste la corrosión porque forma una capa de óxido pasivante muy adherente.',
    busqueda: 'cromo cr3 cromado pasivacion acero inoxidable capa de oxido −0,74',
  },
  {
    id: 'cinc',
    categoria: 'reductor-moderado',
    nombre: 'Zinc(II) / zinc (Zn²⁺ / Zn)',
    izquierda: [[1, 'Zn²⁺']],
    derecha: [[1, 'Zn']],
    n: 2,
    e0: -0.76,
    electrodo: 'Zn(s)',
    disolucion: 'Zn²⁺(1 M)',
    serieMetal: 'Zn',
    aplicacion:
      'Ánodo de la pila Daniell y ánodo de sacrificio del galvanizado: se oxida antes que el hierro y lo protege aunque el recubrimiento se raye.',
    busqueda:
      'zinc cinc zn2 pila daniell galvanizado anodo de sacrificio proteccion catodica pila salina −0,76',
  },
  {
    id: 'agua-basica',
    categoria: 'reductor-moderado',
    nombre: 'Agua / hidrógeno en medio básico (H₂O / H₂)',
    izquierda: [[2, 'H₂O']],
    derecha: [[1, 'H₂'], [2, 'OH⁻']],
    n: 2,
    e0: -0.83,
    electrodo: 'Pt(s)',
    disolucion: 'H₂O, OH⁻',
    aplicacion:
      'Cátodo de la electrólisis del agua en medio alcalino y límite inferior de estabilidad del agua frente a reductores muy fuertes.',
    busqueda:
      'agua hidrogeno medio basico electrolisis del agua alcalina ventana de estabilidad −0,83',
  },
  {
    id: 'cromo-ii',
    categoria: 'reductor-moderado',
    nombre: 'Cromo(II) / cromo (Cr²⁺ / Cr)',
    izquierda: [[1, 'Cr²⁺']],
    derecha: [[1, 'Cr']],
    n: 2,
    e0: -0.91,
    electrodo: 'Cr(s)',
    disolucion: 'Cr²⁺(1 M)',
    aplicacion:
      'Etapa intermedia de la deposición electrolítica del cromo a partir de baños de cromo(II).',
    busqueda: 'cromo ii cromoso cr2 metal deposicion electrolitica −0,91',
  },
  {
    id: 'manganeso',
    categoria: 'reductor-moderado',
    nombre: 'Manganeso(II) / manganeso (Mn²⁺ / Mn)',
    izquierda: [[1, 'Mn²⁺']],
    derecha: [[1, 'Mn']],
    n: 2,
    e0: -1.18,
    electrodo: 'Mn(s)',
    disolucion: 'Mn²⁺(1 M)',
    serieMetal: 'Mn',
    aplicacion:
      'Aleante fundamental del acero: se añade para captar el azufre y el oxígeno residuales del proceso siderúrgico.',
    busqueda: 'manganeso mn2 acero aleante desoxidante siderurgia −1,18',
  },
  {
    id: 'cinc-basico',
    categoria: 'reductor-moderado',
    nombre: 'Zincato / zinc en medio básico ([Zn(OH)₄]²⁻ / Zn)',
    izquierda: [[1, '[Zn(OH)₄]²⁻']],
    derecha: [[1, 'Zn'], [4, 'OH⁻']],
    n: 2,
    e0: -1.2,
    electrodo: 'Zn(s)',
    disolucion: '[Zn(OH)₄]²⁻, OH⁻',
    aplicacion:
      'Ánodo real de una pila alcalina: en medio básico el zinc trabaja a −1,20 V en lugar de −0,76 V, y por eso la pila da más tensión.',
    busqueda: 'zincato zinc medio basico pila alcalina anodo hidroxido de potasio −1,20',
  },

  /* ══ Reductores fuertes (E° ≤ −1,20 V) ═════════════════════ */
  {
    id: 'titanio',
    categoria: 'reductor-fuerte',
    nombre: 'Titanio(II) / titanio (Ti²⁺ / Ti)',
    izquierda: [[1, 'Ti²⁺']],
    derecha: [[1, 'Ti']],
    n: 2,
    e0: -1.63,
    electrodo: 'Ti(s)',
    disolucion: 'Ti²⁺(1 M)',
    serieMetal: 'Ti',
    aplicacion:
      'Otro caso de pasivación: pese al potencial muy negativo, la capa de TiO₂ hace del titanio un material biocompatible para implantes.',
    busqueda: 'titanio ti2 pasivacion implante biocompatible protesis aeronautica −1,63',
  },
  {
    id: 'aluminio',
    categoria: 'reductor-fuerte',
    nombre: 'Aluminio(III) / aluminio (Al³⁺ / Al)',
    izquierda: [[1, 'Al³⁺']],
    derecha: [[1, 'Al']],
    n: 3,
    e0: -1.66,
    electrodo: 'Al(s)',
    disolucion: 'Al³⁺(1 M)',
    serieMetal: 'Al',
    aplicacion:
      'La aparente inercia del aluminio es pura pasivación: una capa de Al₂O₃ de nanómetros lo protege. Por eso se obtiene por electrólisis (proceso Hall-Héroult), nunca por reducción química sencilla.',
    busqueda:
      'aluminio al3 pasivacion alumina hall heroult electrolisis termita papel de aluminio −1,66',
  },
  {
    id: 'berilio',
    categoria: 'reductor-fuerte',
    nombre: 'Berilio(II) / berilio (Be²⁺ / Be)',
    izquierda: [[1, 'Be²⁺']],
    derecha: [[1, 'Be']],
    n: 2,
    e0: -1.85,
    electrodo: 'Be(s)',
    disolucion: 'Be²⁺(1 M)',
    serieMetal: 'Be',
    aplicacion:
      'Metal ligero y rígido usado en ventanas de rayos X y óptica espacial; sus compuestos son muy tóxicos por inhalación.',
    busqueda: 'berilio be2 ventana de rayos x aleacion ligera toxico −1,85',
  },
  {
    id: 'magnesio',
    categoria: 'reductor-fuerte',
    nombre: 'Magnesio(II) / magnesio (Mg²⁺ / Mg)',
    izquierda: [[1, 'Mg²⁺']],
    derecha: [[1, 'Mg']],
    n: 2,
    e0: -2.37,
    electrodo: 'Mg(s)',
    disolucion: 'Mg²⁺(1 M)',
    serieMetal: 'Mg',
    aplicacion:
      'Ánodo de sacrificio de calentadores de agua y tuberías enterradas, y combustible de bengalas por su combustión muy exotérmica.',
    busqueda:
      'magnesio mg2 anodo de sacrificio calentador tuberia bengala proteccion catodica −2,37',
  },
  {
    id: 'sodio',
    categoria: 'reductor-fuerte',
    nombre: 'Sodio(I) / sodio (Na⁺ / Na)',
    izquierda: [[1, 'Na⁺']],
    derecha: [[1, 'Na']],
    n: 1,
    e0: -2.71,
    electrodo: 'Na(s)',
    disolucion: 'Na⁺(1 M)',
    serieMetal: 'Na',
    aplicacion:
      'Reacciona violentamente con el agua, así que se obtiene por electrólisis de NaCl fundido (celda de Downs), nunca en disolución acuosa.',
    busqueda:
      'sodio na+ alcalino reacciona con agua celda de downs sal fundida electrolisis −2,71',
  },
  {
    id: 'calcio',
    categoria: 'reductor-fuerte',
    nombre: 'Calcio(II) / calcio (Ca²⁺ / Ca)',
    izquierda: [[1, 'Ca²⁺']],
    derecha: [[1, 'Ca']],
    n: 2,
    e0: -2.87,
    electrodo: 'Ca(s)',
    disolucion: 'Ca²⁺(1 M)',
    serieMetal: 'Ca',
    aplicacion:
      'Agente reductor en metalurgia para obtener metales difíciles como el uranio o el circonio a partir de sus haluros.',
    busqueda: 'calcio ca2 alcalinoterreo reductor metalurgia haluros −2,87',
  },
  {
    id: 'estroncio',
    categoria: 'reductor-fuerte',
    nombre: 'Estroncio(II) / estroncio (Sr²⁺ / Sr)',
    izquierda: [[1, 'Sr²⁺']],
    derecha: [[1, 'Sr']],
    n: 2,
    e0: -2.89,
    electrodo: 'Sr(s)',
    disolucion: 'Sr²⁺(1 M)',
    serieMetal: 'Sr',
    aplicacion:
      'Sus sales dan el color rojo intenso de la pirotecnia y de las bengalas de señalización.',
    busqueda: 'estroncio sr2 pirotecnia color rojo bengala alcalinoterreo −2,89',
  },
  {
    id: 'bario',
    categoria: 'reductor-fuerte',
    nombre: 'Bario(II) / bario (Ba²⁺ / Ba)',
    izquierda: [[1, 'Ba²⁺']],
    derecha: [[1, 'Ba']],
    n: 2,
    e0: -2.91,
    electrodo: 'Ba(s)',
    disolucion: 'Ba²⁺(1 M)',
    serieMetal: 'Ba',
    aplicacion:
      'El sulfato de bario, insoluble, es el contraste radiológico del aparato digestivo; las sales solubles de bario sí son tóxicas.',
    busqueda: 'bario ba2 sulfato de bario contraste radiologico papilla toxico −2,91',
  },
  {
    id: 'potasio',
    categoria: 'reductor-fuerte',
    nombre: 'Potasio(I) / potasio (K⁺ / K)',
    izquierda: [[1, 'K⁺']],
    derecha: [[1, 'K']],
    n: 1,
    e0: -2.93,
    electrodo: 'K(s)',
    disolucion: 'K⁺(1 M)',
    serieMetal: 'K',
    aplicacion:
      'Reacciona con el agua de forma aún más violenta que el sodio: el hidrógeno liberado se inflama con la llama lila del potasio.',
    busqueda: 'potasio k+ alcalino reaccion violenta con agua llama lila −2,93',
  },
  {
    id: 'rubidio',
    categoria: 'reductor-fuerte',
    nombre: 'Rubidio(I) / rubidio (Rb⁺ / Rb)',
    izquierda: [[1, 'Rb⁺']],
    derecha: [[1, 'Rb']],
    n: 1,
    e0: -2.98,
    electrodo: 'Rb(s)',
    disolucion: 'Rb⁺(1 M)',
    serieMetal: 'Rb',
    aplicacion:
      'Relojes atómicos y células fotoeléctricas: pierde su electrón externo con muchísima facilidad.',
    busqueda: 'rubidio rb+ alcalino reloj atomico celula fotoelectrica −2,98',
  },
  {
    id: 'cesio',
    categoria: 'reductor-fuerte',
    nombre: 'Cesio(I) / cesio (Cs⁺ / Cs)',
    izquierda: [[1, 'Cs⁺']],
    derecha: [[1, 'Cs']],
    n: 1,
    e0: -3.03,
    electrodo: 'Cs(s)',
    disolucion: 'Cs⁺(1 M)',
    serieMetal: 'Cs',
    aplicacion:
      'El elemento con menor energía de ionización. El segundo se define a partir de una transición del átomo de cesio-133.',
    busqueda: 'cesio cs+ alcalino energia de ionizacion reloj atomico segundo −3,03',
  },
  {
    id: 'litio',
    categoria: 'reductor-fuerte',
    nombre: 'Litio(I) / litio (Li⁺ / Li)',
    izquierda: [[1, 'Li⁺']],
    derecha: [[1, 'Li']],
    n: 1,
    e0: -3.04,
    electrodo: 'Li(s)',
    disolucion: 'Li⁺(1 M)',
    serieMetal: 'Li',
    aplicacion:
      'Reductor más fuerte de la tabla en disolución acuosa. Su potencial extremo y su baja masa explican la energía por kilo de las baterías de ion litio.',
    busqueda:
      'litio li+ reductor mas fuerte bateria de litio ion litio potencial mas negativo movil coche electrico −3,04',
  },
];

/** Constante de Faraday en C/mol. */
const FARADAY = 96485;

/* ────────────────────────────────────────────────────────────────
   Cálculos de la celda
──────────────────────────────────────────────────────────────── */

/** Multiplica los coeficientes de un miembro y lo escribe como texto. */
function escribirMiembro(terminos: Termino[], factor: number): string {
  return terminos
    .map(([coeficiente, especie]) => {
      const total = coeficiente * factor;
      return total === 1 ? especie : `${total}${especie}`;
    })
    .join(' + ');
}

interface ResultadoPila {
  catodo: ParRedox;
  anodo: ParRedox;
  ePila: number;
  espontanea: boolean;
  electronesTotales: number;
  reaccionGlobal: string;
  notacion: string;
  deltaG: number;
  logK: number;
}

function calcularPila(a: ParRedox, b: ParRedox): ResultadoPila {
  // El cátodo es siempre el par con mayor potencial de reducción
  const catodo = a.e0 >= b.e0 ? a : b;
  const anodo = a.e0 >= b.e0 ? b : a;

  const ePila = catodo.e0 - anodo.e0;
  const electronesTotales = mcm(catodo.n, anodo.n);
  const factorCatodo = electronesTotales / catodo.n;
  const factorAnodo = electronesTotales / anodo.n;

  // El cátodo se reduce (tal cual está escrito) y el ánodo se oxida (invertido)
  const reactivos = `${escribirMiembro(catodo.izquierda, factorCatodo)} + ${escribirMiembro(
    anodo.derecha,
    factorAnodo,
  )}`;
  const productos = `${escribirMiembro(catodo.derecha, factorCatodo)} + ${escribirMiembro(
    anodo.izquierda,
    factorAnodo,
  )}`;

  return {
    catodo,
    anodo,
    ePila,
    espontanea: ePila > 0,
    electronesTotales,
    reaccionGlobal: `${reactivos} → ${productos}`,
    notacion: `${anodo.electrodo} | ${anodo.disolucion} ‖ ${catodo.disolucion} | ${catodo.electrodo}`,
    // ΔG° en kilojulios por mol
    deltaG: (-electronesTotales * FARADAY * ePila) / 1000,
    // log K = n·E° / 0,0592 a 25 °C
    logK: (electronesTotales * ePila) / 0.0592,
  };
}

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaPotencialesRedoxPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const [idA, setIdA] = useState('cinc');
  const [idB, setIdB] = useState('cobre');
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega con un ejercicio delante escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  // La tabla siempre se muestra ordenada de mayor a menor potencial
  const paresOrdenados = useMemo(() => [...PARES].sort((x, y) => y.e0 - x.e0), []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return paresOrdenados.filter((par) => {
      const coincideCategoria = categoriaActiva === 'todas' || par.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(`${par.nombre} ${par.busqueda} ${par.aplicacion}`).includes(termino);
    });
  }, [consulta, categoriaActiva, paresOrdenados]);

  const serieActividad = useMemo(
    () => PARES.filter((par) => par.serieMetal).sort((x, y) => x.e0 - y.e0),
    [],
  );

  const parA = PARES.find((par) => par.id === idA) ?? PARES[0];
  const parB = PARES.find((par) => par.id === idB) ?? PARES[1];
  const mismoPar = parA.id === parB.id;
  const pila = useMemo(() => calcularPila(parA, parB), [parA, parB]);

  const alternarFila = (id: string) => {
    setAbiertas((previas) =>
      previas.includes(id) ? previas.filter((item) => item !== id) : [...previas, id],
    );
  };

  const tendenciaDe = (e0: number): { texto: string; icono: string; clase: string } => {
    if (e0 > 0.3)
      return { texto: 'Actúa como oxidante', icono: '⬆️', clase: styles.badgeOxidante };
    if (e0 < -0.3)
      return { texto: 'Actúa como reductor', icono: '⬇️', clase: styles.badgeReductor };
    return { texto: 'Par intermedio', icono: '↔️', clase: styles.badgeNeutro };
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🔋</span> Tabla de Potenciales Redox Estándar (E°)
        </h1>
        <p className={styles.subtitle}>
          {PARES.length} semirreacciones de reducción equilibradas en masa y carga, a 25 °C, 1 M y
          1 atm, medidas frente al electrodo estándar de hidrógeno. Con buscador, serie de actividad
          de los metales y un constructor de pilas que calcula E°, ΔG° y la constante de equilibrio.
        </p>
      </header>

      <LegalNotice />

      {/* ═══ Constructor de pilas ═══ */}
      <section className={styles.pilaPanel} aria-labelledby="titulo-constructor">
        <h2 id="titulo-constructor" className={styles.pilaTitulo}>
          <span aria-hidden="true">⚗️</span> Constructor de pilas galvánicas
        </h2>
        <p className={styles.pilaIntro}>
          Elige dos semirreacciones y la app decide cuál se oxida y cuál se reduce, calcula el
          potencial de la pila, escribe la reacción global ajustada y obtiene la energía libre y la
          constante de equilibrio.
        </p>

        <div className={styles.selectores}>
          <div className={styles.selectorCampo}>
            <label htmlFor="par-a">Primera semirreacción</label>
            <select
              id="par-a"
              className={styles.select}
              value={idA}
              onChange={(evento) => setIdA(evento.target.value)}
            >
              {paresOrdenados.map((par) => (
                <option key={par.id} value={par.id}>
                  {par.nombre} — {formatearPotencial(par.e0)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectorCampo}>
            <label htmlFor="par-b">Segunda semirreacción</label>
            <select
              id="par-b"
              className={styles.select}
              value={idB}
              onChange={(evento) => setIdB(evento.target.value)}
            >
              {paresOrdenados.map((par) => (
                <option key={par.id} value={par.id}>
                  {par.nombre} — {formatearPotencial(par.e0)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mismoPar ? (
          <p className={styles.avisoSelector} role="status" aria-live="polite">
            <span aria-hidden="true">ℹ️</span> Has elegido dos veces el mismo par. Con semirreacciones
            idénticas E°pila = 0 V y no hay reacción neta: selecciona pares distintos (prueba con
            zinc y cobre para montar la pila Daniell).
          </p>
        ) : (
          <div className={styles.pilaResultado} role="status" aria-live="polite">
            <div
              className={`${styles.veredicto} ${
                pila.espontanea ? styles.veredictoSi : styles.veredictoNo
              }`}
            >
              <span className={styles.veredictoValor}>
                E°pila = {formatearPotencial(pila.ePila)}
              </span>
              <span className={styles.veredictoTexto}>
                <span aria-hidden="true">{pila.espontanea ? '✅' : '⛔'}</span>{' '}
                {pila.espontanea
                  ? 'Reacción espontánea en condiciones estándar (E° > 0)'
                  : 'Reacción no espontánea: necesitaría aportar energía eléctrica (electrólisis)'}
              </span>
            </div>

            <div className={styles.electrodosGrid}>
              <div className={`${styles.electrodoCard} ${styles.electrodoAnodo}`}>
                <span className={styles.electrodoEtiqueta}>
                  <span aria-hidden="true">➖</span> Ánodo — aquí ocurre la oxidación
                </span>
                <strong>{pila.anodo.nombre}</strong>
                <p className={styles.semiTexto}>
                  {escribirMiembro(pila.anodo.derecha, 1)} → {escribirMiembro(pila.anodo.izquierda, 1)}{' '}
                  + {pila.anodo.n}e⁻
                </p>
                <span className={styles.electrodoDato}>
                  E° = {formatearPotencial(pila.anodo.e0)} · pierde electrones
                </span>
              </div>
              <div className={`${styles.electrodoCard} ${styles.electrodoCatodo}`}>
                <span className={styles.electrodoEtiqueta}>
                  <span aria-hidden="true">➕</span> Cátodo — aquí ocurre la reducción
                </span>
                <strong>{pila.catodo.nombre}</strong>
                <p className={styles.semiTexto}>
                  {escribirMiembro(pila.catodo.izquierda, 1)} + {pila.catodo.n}e⁻ →{' '}
                  {escribirMiembro(pila.catodo.derecha, 1)}
                </p>
                <span className={styles.electrodoDato}>
                  E° = {formatearPotencial(pila.catodo.e0)} · gana electrones
                </span>
              </div>
            </div>

            <div className={styles.bloqueCalculo}>
              <h3>Potencial de la pila</h3>
              <p className={styles.formulaLinea}>
                E°pila = E°cátodo − E°ánodo = {formatearPotencial(pila.catodo.e0)} − (
                {formatearPotencial(pila.anodo.e0)}) = {formatearPotencial(pila.ePila)}
              </p>

              <h3>Reacción global ajustada</h3>
              <p className={styles.formulaLinea}>{pila.reaccionGlobal}</p>
              <p className={styles.notaCalculo}>
                Se han igualado los electrones multiplicando la semirreacción del cátodo por{' '}
                {pila.electronesTotales / pila.catodo.n} y la del ánodo por{' '}
                {pila.electronesTotales / pila.anodo.n}: intercambio total de{' '}
                <strong>{pila.electronesTotales} electrones</strong>. El valor de E° NO se multiplica.
              </p>

              <h3>Notación de pila</h3>
              <p className={styles.formulaLinea}>{pila.notacion}</p>
              <p className={styles.notaCalculo}>
                A la izquierda el ánodo, a la derecha el cátodo. La barra sencilla marca un cambio de
                fase y la doble barra (‖) representa el puente salino.
              </p>

              <h3>Energía libre estándar</h3>
              <p className={styles.formulaLinea}>
                ΔG° = −n·F·E° = −{pila.electronesTotales} · 96 485 C/mol ·{' '}
                {formatearPotencial(pila.ePila)} = {pila.deltaG < 0 ? '−' : '+'}
                {formatNumber(Math.abs(pila.deltaG), 1)} kJ/mol
              </p>
              <p className={styles.notaCalculo}>
                ΔG° negativo confirma el proceso espontáneo. A diferencia de E°, ΔG° sí depende de
                cuántos electrones se intercambian: es una magnitud extensiva.
              </p>

              <h3>Constante de equilibrio a 25 °C</h3>
              <p className={styles.formulaLinea}>
                log K = n·E° / 0,0592 = {pila.electronesTotales} · {formatNumber(pila.ePila, 2)} /
                0,0592 = {formatNumber(pila.logK, 1)} → K ≈ 10<sup>{formatNumber(pila.logK, 1)}</sup>
              </p>
              <p className={styles.notaCalculo}>
                Un log K muy grande significa que en el equilibrio prácticamente solo quedan
                productos; si sale muy negativo, la reacción apenas avanza.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Aviso del error nº 1 */}
      <div className={styles.avisoDestacado}>
        <span className={styles.avisoIcono} aria-hidden="true">
          ⚠️
        </span>
        <div>
          <strong>El error número uno con los potenciales estándar</strong>
          <p>
            E° <strong>no se multiplica</strong> al ajustar los coeficientes de una semirreacción. Si
            multiplicas Ag⁺ + e⁻ → Ag por 2, el potencial sigue siendo +0,80 V, no +1,60 V. El
            potencial es una propiedad <em>intensiva</em>: no depende de la cantidad de sustancia, igual
            que la temperatura o la densidad. Lo que sí cambia es n, y por eso ΔG° = −n·F·E° sí se
            duplica.
          </p>
        </div>
      </div>

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de potenciales redox">
        <label className={styles.buscadorLabel} htmlFor="buscador-redox">
          Busca un par redox por especie, nombre o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-redox"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="permanganato, dicromato, zinc, litio, pila Daniell…"
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
          Funciona con acentos o sin ellos y con sinónimos: <strong>celda galvanica</strong>{' '}
          encuentra los pares clásicos de pila, <strong>electrolisis</strong> los de la
          descomposición del agua y <strong>corrosion</strong> los del hierro y el zinc.
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
              <span aria-hidden="true">{categoria.icono}</span> {categoria.nombre}{' '}
              <span className={styles.filtroRango}>({categoria.rango})</span>
            </button>
          ))}
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {resultados.length} de {PARES.length} semirreacciones
        </p>
      </section>

      {/* Tabla de semirreacciones */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> Ningún par coincide con «{consulta}». Prueba con otro
            término (por ejemplo, <strong>permanganato</strong>, <strong>cloro</strong>,{' '}
            <strong>bateria</strong> o <strong>magnesio</strong>), busca por el símbolo del elemento
            o quita el filtro de categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((par) => {
            const abierta = abiertas.includes(par.id);
            const tendencia = tendenciaDe(par.e0);
            return (
              <li key={par.id} className={styles.fila}>
                <button
                  type="button"
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${par.id}`}
                  onClick={() => alternarFila(par.id)}
                >
                  <span className={styles.filaNombre}>
                    {par.nombre}
                    <span className={styles.filaCategoria}>{NOMBRE_CATEGORIA[par.categoria]}</span>
                  </span>
                  <span className={styles.filaSemi}>
                    {escribirMiembro(par.izquierda, 1)} + {par.n}e⁻ →{' '}
                    {escribirMiembro(par.derecha, 1)}
                  </span>
                  <span className={styles.filaPotencial}>{formatearPotencial(par.e0)}</span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${par.id}`} className={styles.detalle}>
                    <p className={`${styles.badge} ${tendencia.clase}`}>
                      <span aria-hidden="true">{tendencia.icono}</span> {tendencia.texto} ·{' '}
                      {par.n} {par.n === 1 ? 'electrón' : 'electrones'} intercambiados
                    </p>

                    <h3>Dónde aparece en el mundo real</h3>
                    <p>{par.aplicacion}</p>

                    <h3>Datos para montar la pila</h3>
                    <ul className={styles.datosLista}>
                      <li>
                        <strong>Electrodo:</strong> {par.electrodo}
                      </li>
                      <li>
                        <strong>Especies en disolución:</strong> {par.disolucion}
                      </li>
                      <li>
                        <strong>Como oxidación (invertida):</strong>{' '}
                        {escribirMiembro(par.derecha, 1)} → {escribirMiembro(par.izquierda, 1)} +{' '}
                        {par.n}e⁻
                      </li>
                      <li>
                        <strong>ΔG° de la semirreacción:</strong>{' '}
                        {((-par.n * FARADAY * par.e0) / 1000) < 0 ? '−' : '+'}
                        {formatNumber(Math.abs((-par.n * FARADAY * par.e0) / 1000), 1)} kJ/mol
                      </li>
                    </ul>

                    <button
                      type="button"
                      className={styles.usarBtn}
                      onClick={() => {
                        setIdA(par.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <span aria-hidden="true">⚗️</span> Usar en el constructor de pilas
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Serie de actividad de los metales */}
      <section className={styles.seriePanel} aria-labelledby="titulo-serie">
        <h2 id="titulo-serie" className={styles.serieTitulo}>
          <span aria-hidden="true">📶</span> Serie de actividad de los metales
        </h2>
        <p className={styles.serieIntro}>
          Es la propia tabla ordenada al revés: de menor a mayor potencial. Cuanto más a la
          izquierda está un metal, con más facilidad cede electrones y más reactivo es. Un metal
          desplaza de sus sales a cualquier otro situado a su derecha, y todos los que aparecen
          antes del hidrógeno reaccionan con los ácidos liberando H₂.
        </p>
        <ol className={styles.serieLista}>
          {serieActividad.map((par) => (
            <li
              key={par.id}
              className={`${styles.serieItem} ${
                par.serieMetal === 'H₂' ? styles.serieReferencia : ''
              }`}
            >
              <span className={styles.serieSimbolo}>{par.serieMetal}</span>
              <span className={styles.serieValor}>{formatearPotencial(par.e0)}</span>
            </li>
          ))}
        </ol>
        <p className={styles.serieNota}>
          <span aria-hidden="true">💡</span> El hidrógeno, resaltado, marca la frontera: los metales
          a su izquierda se disuelven en ácidos no oxidantes; los de su derecha (cobre, plata,
          mercurio, platino y oro) no. Cuidado con la pasivación: aluminio, titanio y cromo tienen
          potenciales muy negativos pero se comportan como inertes porque una capa de óxido los
          protege.
        </p>
      </section>

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender los potenciales redox, no solo copiarlos"
        subtitle="Qué mide E°, cómo se monta una pila y por qué fallan los atajos habituales"
      >
        <section className={styles.guideSection}>
          <h2>Qué mide exactamente un potencial estándar de reducción</h2>
          <p>
            El potencial estándar E° mide la <strong>tendencia de una especie a captar
            electrones</strong>, es decir, a reducirse. Cuanto más alto es el valor, mejor oxidante
            resulta la forma oxidada del par; cuanto más bajo, mejor reductor resulta la forma
            reducida. El flúor, con +2,87 V, arranca electrones a casi todo; el litio, con −3,04 V,
            los cede con una facilidad extraordinaria.
          </p>
          <p>
            Todos los valores se miden en las mismas condiciones (25 °C, especies en disolución a 1
            mol/L, gases a 1 atm) y frente al mismo patrón: el electrodo estándar de hidrógeno, al
            que se le asigna 0,00 V por convenio. No es que el hidrógeno no tenga potencial: es que
            un potencial absoluto de un solo electrodo no se puede medir, solo diferencias entre
            dos.
          </p>
          <div className={styles.formulaBox}>
            E°pila = E°cátodo − E°ánodo &nbsp;·&nbsp; ΔG° = −n·F·E° &nbsp;·&nbsp; log K = n·E° /
            0,0592
          </div>
          <p>
            Fuera de las condiciones estándar el potencial real se obtiene con la ecuación de
            Nernst, E = E° − (0,0592/n)·log Q a 25 °C. Es lo que explica que una pila vaya perdiendo
            tensión a medida que se consumen los reactivos.
          </p>

          <h2>Las cinco zonas de la tabla, de un vistazo</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Rango de E°</th>
                  <th>Papel habitual</th>
                  <th>Ejemplos típicos</th>
                  <th>Dónde se encuentra</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Oxidantes fuertes</strong>
                  </td>
                  <td>≥ +1,20 V</td>
                  <td>Arrancan electrones con facilidad; se reducen</td>
                  <td>F₂, O₃, H₂O₂, MnO₄⁻, Cl₂, Cr₂O₇²⁻</td>
                  <td>Desinfección, valoraciones, blanqueo</td>
                </tr>
                <tr>
                  <td>
                    <strong>Oxidantes moderados</strong>
                  </td>
                  <td>+0,30 a +1,20 V</td>
                  <td>Oxidan a reductores comunes, no al agua</td>
                  <td>Br₂, Ag⁺, Fe³⁺, I₂, Cu²⁺</td>
                  <td>Análisis químico, bioquímica, cátodos</td>
                </tr>
                <tr>
                  <td>
                    <strong>Pares intermedios</strong>
                  </td>
                  <td>−0,30 a +0,30 V</td>
                  <td>Pueden actuar en los dos sentidos según la pareja</td>
                  <td>Sn⁴⁺/Sn²⁺, H⁺/H₂, Pb²⁺/Pb, Ni²⁺/Ni</td>
                  <td>Electrodos de referencia, recubrimientos</td>
                </tr>
                <tr>
                  <td>
                    <strong>Reductores moderados</strong>
                  </td>
                  <td>−1,20 a −0,30 V</td>
                  <td>Ceden electrones; se oxidan</td>
                  <td>Fe²⁺/Fe, Zn²⁺/Zn, Cr³⁺/Cr, Cd²⁺/Cd</td>
                  <td>Corrosión, ánodos de pilas, galvanizado</td>
                </tr>
                <tr>
                  <td>
                    <strong>Reductores fuertes</strong>
                  </td>
                  <td>≤ −1,20 V</td>
                  <td>Reducen incluso al agua si no hay pasivación</td>
                  <td>Al³⁺/Al, Mg²⁺/Mg, Na⁺/Na, Li⁺/Li</td>
                  <td>Ánodos de sacrificio, baterías, metalurgia</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>La tabla trabajando en situaciones reales</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🔌
              </span>
              <strong>La pila Daniell</strong>
              <p>
                Zn²⁺/Zn (−0,76 V) y Cu²⁺/Cu (+0,34 V) dan E°pila = +1,10 V. El zinc se oxida en el
                ánodo, el cobre se deposita en el cátodo y el puente salino cierra el circuito
                iónico. Es el ejemplo de laboratorio que aparece en todos los cursos de química
                general.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🛠️
              </span>
              <strong>Corrosión del hierro</strong>
              <p>
                Una pieza de acero húmeda forma una pila en miniatura: el hierro se oxida a Fe²⁺
                (−0,44 V) mientras el oxígeno disuelto se reduce (+1,23 V en medio ácido, +0,40 V en
                medio neutro). La diferencia positiva explica por qué el metal se degrada solo.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🛡️
              </span>
              <strong>Protección catódica</strong>
              <p>
                Se conecta el acero a un metal de potencial más negativo (zinc, −0,76 V, o magnesio,
                −2,37 V). Ese metal se convierte en ánodo de sacrificio y se corroe en lugar de la
                estructura. Es lo que protege cascos de barcos, oleoductos y calentadores de agua.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🔋
              </span>
              <strong>Baterías de litio</strong>
              <p>
                El potencial extremo del litio (−3,04 V) combinado con su baja masa atómica da la
                mayor energía por kilogramo de las baterías comerciales. Como reacciona con el agua,
                estas celdas usan electrolitos orgánicos, no acuosos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💧
              </span>
              <strong>Electrólisis del agua</strong>
              <p>
                Descomponer el agua en H₂ y O₂ exige E°pila negativo: −1,23 V en condiciones
                estándar. Al no ser espontánea, hay que aportar energía eléctrica, y en la práctica
                bastante más que ese mínimo teórico por el sobrepotencial de los electrodos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🧪
              </span>
              <strong>Valoraciones redox</strong>
              <p>
                El permanganato (+1,51 V) y el dicromato (+1,33 V) son los oxidantes de referencia
                en el laboratorio. El primero actúa como su propio indicador: la disolución vira de
                violeta a incoloro en cuanto se agota el reductor.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo sé cuál de las dos semirreacciones es el ánodo?</h4>
              <p>
                Siempre la de menor potencial estándar de reducción. Esa especie es la que menos
                «gana» reduciéndose, así que invierte su sentido y se oxida, cediendo electrones al
                circuito exterior. La otra, de E° más alto, se reduce en el cátodo. Con esta regla
                E°pila sale siempre positiva.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla mnemotécnica: <strong>ánodo = oxidación</strong>{' '}
                (las dos palabras empiezan por vocal), <strong>cátodo = reducción</strong> (las dos
                por consonante).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el signo del ánodo cambia entre una pila y una electrólisis?</h4>
              <p>
                Porque el criterio no es el mismo. En una pila galvánica el ánodo es el polo negativo
                (acumula electrones que salen hacia el circuito) y en una celda electrolítica es el
                positivo (la fuente externa le retira electrones). Lo que nunca cambia es la
                química: en el ánodo siempre hay oxidación y en el cátodo siempre reducción.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Fíjate en el proceso, no en el signo: es la forma
                de no equivocarse en ninguno de los dos tipos de celda.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Sirven estos valores fuera de las condiciones estándar?</h4>
              <p>
                Solo como orientación. Los E° de la tabla suponen 25 °C, disoluciones 1 M y gases a 1
                atm. Si las concentraciones son distintas hay que corregir con la ecuación de
                Nernst, E = E° − (0,0592/n)·log Q. Además el pH influye muchísimo en los pares que
                incluyen H⁺: el permanganato pasa de +1,51 V en medio ácido a +0,60 V en medio
                básico.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si en un ejercicio aparecen H⁺ u OH⁻ en la
                semirreacción, el resultado depende del pH: compruébalo siempre.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Si la reacción es espontánea, ¿por qué a veces no ocurre?</h4>
              <p>
                Porque el potencial informa de la termodinámica, no de la velocidad. Una reacción con
                E° positivo puede ser tan lenta que resulte inobservable, y a veces una capa de óxido
                la bloquea por completo: el aluminio tiene E° = −1,66 V y debería reaccionar con el
                agua, pero la película de Al₂O₃ lo impide. Ese fenómeno se llama pasivación.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Termodinámica dice «puede ocurrir»; cinética dice
                «a qué velocidad». Son preguntas distintas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Existen tablas de potenciales de oxidación en vez de reducción?</h4>
              <p>
                Sí, y contienen exactamente los mismos datos con el signo cambiado. Desde 1953 la
                IUPAC recomienda tabular siempre <strong>potenciales de reducción</strong>, que es el
                criterio de esta tabla y el de los libros actuales. Si consultas una fuente antigua y
                ves el zinc con +0,76 V en vez de −0,76 V, está usando el convenio de oxidación.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Comprueba siempre el signo del par Zn²⁺/Zn: es la
                forma más rápida de saber qué convenio sigue una tabla.
              </p>
            </div>
          </div>

          <h2>Cómo resolver un problema de pilas paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Localiza las dos semirreacciones en la tabla</strong>
                <p>
                  Búscalas siempre escritas como reducción, que es el convenio estándar. Anota su E°
                  y el número de electrones n que intercambia cada una.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Asigna cátodo y ánodo</strong>
                <p>
                  El E° más alto va al cátodo (se reduce) y el más bajo al ánodo (se oxida, así que
                  inviertes su semirreacción). Este único paso decide todo lo demás.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula E°pila = E°cátodo − E°ánodo</strong>
                <p>
                  Resta con su signo. Si el ánodo es negativo, restar un negativo suma: 0,34 − (−0,76)
                  = +1,10 V. Un resultado positivo confirma que la pila funciona sola.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Iguala los electrones y suma las semirreacciones</strong>
                <p>
                  Multiplica cada semirreacción por el factor necesario para que se cancelen los
                  electrones (usa el mínimo común múltiplo de las dos n). Los coeficientes cambian;
                  el valor de E° no.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Escribe la notación y comprueba el ajuste</strong>
                <p>
                  Ánodo | disolución ‖ disolución | cátodo. Antes de dar el problema por cerrado,
                  verifica que la ecuación global está equilibrada en masa <em>y</em> en carga: la
                  suma de cargas debe coincidir en los dos miembros.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas al trabajar con potenciales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧭
              </span>
              <strong>Trabaja siempre con reducciones</strong>
              <p>
                Escribe las dos semirreacciones como reducción, decide cuál inviertes y solo entonces
                cambia el signo. Mezclar convenios a mitad del ejercicio es la vía más rápida al
                error.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⚖️
              </span>
              <strong>Comprueba masa y carga</strong>
              <p>
                Un ajuste correcto lo es en los dos sentidos. Suma las cargas de cada miembro: si no
                coinciden, faltan electrones, H⁺ o OH⁻.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💧
              </span>
              <strong>Mira el medio antes de ajustar</strong>
              <p>
                En medio ácido se completa con H⁺ y H₂O; en medio básico, con OH⁻ y H₂O. La misma
                especie tiene semirreacciones distintas según el pH.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <strong>Anota n desde el principio</strong>
              <p>
                El número de electrones aparece en ΔG° y en log K. Apuntarlo al inicio evita tener
                que reconstruir el ajuste al final del problema.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧱
              </span>
              <strong>Recuerda la pasivación</strong>
              <p>
                Aluminio, titanio y cromo tienen potenciales muy negativos y aun así resisten. La
                tabla predice la tendencia, no la protección que da una capa de óxido.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📏
              </span>
              <strong>Contrasta el orden de magnitud</strong>
              <p>
                Las pilas comerciales dan entre 1,2 y 3,7 V por celda. Si tu resultado sale de 12 V,
                probablemente has multiplicado E° por los coeficientes.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes que cuestan puntos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Multiplicar E° por el coeficiente de ajuste:</strong> es el error número uno.
                E° es una propiedad intensiva y no cambia al multiplicar la semirreacción. Lo que se
                multiplica es n, y con él ΔG°.
              </li>
              <li>
                <strong>Sumar los dos potenciales en vez de restarlos:</strong> la fórmula es E°pila
                = E°cátodo − E°ánodo con los dos valores tomados como reducción. Solo se suman si has
                cambiado previamente el signo del ánodo, y entonces no se resta.
              </li>
              <li>
                <strong>Confundir el signo al restar un valor negativo:</strong> 0,34 − (−0,76) =
                +1,10 V, no −0,42 V. Es el fallo más común en la pila Daniell.
              </li>
              <li>
                <strong>Elegir mal el cátodo:</strong> el cátodo es el de E° mayor, no el que aparece
                primero en el enunciado ni el del metal más «noble» según la intuición.
              </li>
              <li>
                <strong>No igualar los electrones antes de sumar:</strong> si una semirreacción
                intercambia 2e⁻ y la otra 5e⁻, hay que llevarlas a 10e⁻ antes de combinarlas, o la
                ecuación global no cuadra.
              </li>
              <li>
                <strong>Ignorar el medio ácido o básico:</strong> el permanganato pasa de +1,51 V a
                +0,60 V al cambiar el pH. Usar el valor equivocado altera por completo el resultado.
              </li>
              <li>
                <strong>Olvidar que E° solo vale en condiciones estándar:</strong> con
                concentraciones distintas de 1 M hay que aplicar la ecuación de Nernst.
              </li>
              <li>
                <strong>Confundir espontaneidad con velocidad:</strong> E° &gt; 0 indica que la
                reacción puede ocurrir, no que ocurra rápido. La cinética y la pasivación son otra
                historia.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde la química de secundaria y preparatoria (educación media) hasta
            los primeros cursos universitarios de química general, ingeniería química, farmacia,
            biología y ciencias ambientales. Los pares clásicos —permanganato, dicromato, halógenos,
            metales comunes y el electrodo de hidrógeno— son los que aparecen en cualquier examen de
            admisión universitaria; los pares en medio básico y los de referencia analítica se
            trabajan ya en el laboratorio de grado.
          </p>
          <p>
            Los valores están redondeados a la centésima de voltio y son consistentes con las tablas
            de referencia habituales. Entre fuentes puede haber diferencias de unas centésimas,
            porque algunos potenciales dependen del medio y de la técnica de medida: si tu profesor
            usa una tabla concreta, mantente en ella para todo el ejercicio.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-potenciales-redox')} />

      <ShareCard appName="tabla-potenciales-redox" />

      <Footer appName="tabla-potenciales-redox" />
    </div>
  );
}

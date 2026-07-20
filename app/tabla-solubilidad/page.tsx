'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaSolubilidad.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

const SUBINDICES = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Convierte un número en subíndices Unicode (2 → ₂). */
function sub(n: number): string {
  return String(n)
    .split('')
    .map((digito) => SUBINDICES[Number(digito)])
    .join('');
}

/** Máximo común divisor, para simplificar los subíndices al cruzar cargas. */
function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

type Estado = 'soluble' | 'poco' | 'insoluble';

type BloqueId = 'reglas' | 'iones' | 'kps';

interface Bloque {
  id: BloqueId;
  nombre: string;
  icono: string;
}

const BLOQUES: Bloque[] = [
  { id: 'reglas', nombre: 'Reglas de solubilidad', icono: '💧' },
  { id: 'iones', nombre: 'Iones poliatómicos', icono: '⚛️' },
  { id: 'kps', nombre: 'Productos de solubilidad (Kps)', icono: '⚖️' },
];

const ETIQUETA_ESTADO: Record<Estado, string> = {
  soluble: 'Soluble',
  poco: 'Poco soluble',
  insoluble: 'Insoluble',
};

/** Icono textual: el estado nunca se distingue solo por color. */
const ICONO_ESTADO: Record<Estado, string> = {
  soluble: '✔',
  poco: '≈',
  insoluble: '✕',
};

const CLASE_ESTADO: Record<Estado, string> = {
  soluble: styles.badgeSoluble,
  poco: styles.badgePoco,
  insoluble: styles.badgeInsoluble,
};

/* ── Bloque 1: reglas de solubilidad ──────────────────────────── */

interface ReaccionEjemplo {
  titulo: string;
  molecular: string;
  ionicaCompleta: string;
  ionicaNeta: string;
  comentario: string;
}

interface ReglaSolubilidad {
  id: string;
  familia: 'solubles' | 'insolubles';
  ion: string;
  titulo: string;
  estado: Estado;
  enunciado: string;
  excepciones: string[];
  ejemplos: string;
  reaccion: ReaccionEjemplo;
  busqueda: string;
}

const REGLAS: ReglaSolubilidad[] = [
  /* ── Solubles ─────────────────────────────────────────────── */
  {
    id: 'nitratos',
    familia: 'solubles',
    ion: 'NO₃⁻',
    titulo: 'Nitratos',
    estado: 'soluble',
    enunciado:
      'Todos los nitratos son solubles en agua, sin ninguna excepción de uso práctico en química general. Por eso el ion nitrato es el acompañante habitual cuando se quiere tener un catión libre en disolución.',
    excepciones: ['No hay excepciones relevantes: todos los nitratos conocidos son solubles.'],
    ejemplos: 'AgNO₃, Pb(NO₃)₂, Ba(NO₃)₂, Cu(NO₃)₂, KNO₃, NH₄NO₃',
    reaccion: {
      titulo: 'El nitrato como ion espectador',
      molecular: 'AgNO₃(ac) + NaCl(ac) → AgCl(s)↓ + NaNO₃(ac)',
      ionicaCompleta: 'Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s)↓ + Na⁺ + NO₃⁻',
      ionicaNeta: 'Ag⁺ + Cl⁻ → AgCl(s)↓',
      comentario:
        'El nitrato aparece intacto a los dos lados: es un ion espectador y desaparece de la ecuación iónica neta. Ese comportamiento es justo la consecuencia de que ningún nitrato precipite.',
    },
    busqueda:
      'nitrato nitratos NO3 soluble solubles espectador plata nitrato de plata AgNO3 sin excepciones',
  },
  {
    id: 'alcalinos',
    familia: 'solubles',
    ion: 'Li⁺, Na⁺, K⁺, Rb⁺, Cs⁺',
    titulo: 'Sales de metales alcalinos',
    estado: 'soluble',
    enunciado:
      'Todas las sales de los metales alcalinos del grupo 1 (litio, sodio, potasio, rubidio y cesio) son solubles en agua, incluso las de aniones que suelen precipitar como el carbonato, el fosfato o el sulfuro.',
    excepciones: [
      'Li₂CO₃ es solo poco soluble (unos 13 g/L a 25 °C), a diferencia del Na₂CO₃ y del K₂CO₃.',
      'LiF es poco soluble y Li₃PO₄ es prácticamente insoluble: el litio, por su tamaño pequeño, se comporta a veces como un alcalinotérreo.',
    ],
    ejemplos: 'NaCl, K₂CO₃, Na₃PO₄, K₂S, NaOH, Cs₂SO₄',
    reaccion: {
      titulo: 'Por qué la sal alcalina se queda disuelta',
      molecular: 'Na₂CO₃(ac) + CaCl₂(ac) → CaCO₃(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: '2 Na⁺ + CO₃²⁻ + Ca²⁺ + 2 Cl⁻ → CaCO₃(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Ca²⁺ + CO₃²⁻ → CaCO₃(s)↓',
      comentario:
        'Precipita el carbonato de calcio, no el de sodio. La regla de los alcalinos manda por encima de la regla de los carbonatos cuando ambas compiten.',
    },
    busqueda:
      'alcalinos grupo 1 sodio potasio litio rubidio cesio Na K Li sales solubles siempre solubles carbonato de litio',
  },
  {
    id: 'amonio',
    familia: 'solubles',
    ion: 'NH₄⁺',
    titulo: 'Sales de amonio',
    estado: 'soluble',
    enunciado:
      'Todas las sales del ion amonio son solubles en agua. Junto con los alcalinos, el amonio es la forma estándar de mantener en disolución un anión que en otra compañía precipitaría.',
    excepciones: ['No hay excepciones de uso habitual.'],
    ejemplos: '(NH₄)₂SO₄, NH₄Cl, (NH₄)₂S, (NH₄)₃PO₄, (NH₄)₂CO₃',
    reaccion: {
      titulo: 'Sulfuro de amonio frente a un catión pesado',
      molecular: '(NH₄)₂S(ac) + CuSO₄(ac) → CuS(s)↓ + (NH₄)₂SO₄(ac)',
      ionicaCompleta: '2 NH₄⁺ + S²⁻ + Cu²⁺ + SO₄²⁻ → CuS(s)↓ + 2 NH₄⁺ + SO₄²⁻',
      ionicaNeta: 'Cu²⁺ + S²⁻ → CuS(s)↓',
      comentario:
        'El sulfuro solo precipita cuando encuentra un catión pesado. Con amonio o con un alcalino permanece disuelto.',
    },
    busqueda:
      'amonio NH4 sales de amonio soluble solubles sulfato de amonio cloruro de amonio fertilizante',
  },
  {
    id: 'acetatos',
    familia: 'solubles',
    ion: 'CH₃COO⁻',
    titulo: 'Acetatos (etanoatos)',
    estado: 'soluble',
    enunciado:
      'Los acetatos son solubles en agua. Es el anión orgánico más frecuente en química general y se usa para tener cationes disponibles sin introducir cloruro ni sulfato.',
    excepciones: [
      'El acetato de plata, AgCH₃COO, es solo poco soluble (Kps ≈ 1,9×10⁻³).',
      'El acetato de mercurio(I) también es poco soluble.',
    ],
    ejemplos: 'Pb(CH₃COO)₂, NaCH₃COO, Cu(CH₃COO)₂, Ca(CH₃COO)₂',
    reaccion: {
      titulo: 'El acetato como fuente limpia de plomo(II)',
      molecular: 'Pb(CH₃COO)₂(ac) + 2 KI(ac) → PbI₂(s)↓ + 2 KCH₃COO(ac)',
      ionicaCompleta: 'Pb²⁺ + 2 CH₃COO⁻ + 2 K⁺ + 2 I⁻ → PbI₂(s)↓ + 2 K⁺ + 2 CH₃COO⁻',
      ionicaNeta: 'Pb²⁺ + 2 I⁻ → PbI₂(s)↓',
      comentario:
        'Se obtiene el clásico precipitado amarillo de yoduro de plomo(II), la «lluvia de oro» de laboratorio.',
    },
    busqueda:
      'acetato acetatos etanoato CH3COO soluble acetato de plomo acetato de plata poco soluble',
  },
  {
    id: 'cloratos',
    familia: 'solubles',
    ion: 'ClO₃⁻, ClO₄⁻',
    titulo: 'Cloratos y percloratos',
    estado: 'soluble',
    enunciado:
      'Los cloratos y los percloratos son solubles en agua. El perclorato es además un anión muy poco coordinante, por lo que se usa cuando se quiere que el anión no interfiera en el equilibrio estudiado.',
    excepciones: [
      'KClO₄ es poco soluble (Kps ≈ 1,05×10⁻²), y lo mismo ocurre con RbClO₄ y CsClO₄.',
      'El perclorato de amonio es soluble, pero es un oxidante fuerte: no se maneja como una sal cualquiera.',
    ],
    ejemplos: 'NaClO₃, Mg(ClO₄)₂, NaClO₄, Ba(ClO₄)₂',
    reaccion: {
      titulo: 'La excepción del perclorato de potasio',
      molecular: 'KCl(ac) + NaClO₄(ac) → KClO₄(s)↓ + NaCl(ac)',
      ionicaCompleta: 'K⁺ + Cl⁻ + Na⁺ + ClO₄⁻ → KClO₄(s)↓ + Na⁺ + Cl⁻',
      ionicaNeta: 'K⁺ + ClO₄⁻ → KClO₄(s)↓',
      comentario:
        'Es uno de los pocos casos en que una sal de potasio precipita, y solo en disoluciones concentradas y frías.',
    },
    busqueda:
      'clorato cloratos perclorato percloratos ClO3 ClO4 soluble perclorato de potasio excepcion oxidante',
  },
  {
    id: 'halogenuros',
    familia: 'solubles',
    ion: 'Cl⁻, Br⁻, I⁻',
    titulo: 'Cloruros, bromuros y yoduros',
    estado: 'soluble',
    enunciado:
      'Los halogenuros (excluido el fluoruro, que va por su cuenta) son solubles en agua. Es una de las dos reglas con excepciones que más se preguntan en un examen.',
    excepciones: [
      'Ag⁺: AgCl (blanco), AgBr (amarillo pálido) y AgI (amarillo) son insolubles.',
      'Pb²⁺: PbCl₂ y PbBr₂ son poco solubles en frío y se disuelven en agua caliente; PbI₂ es insoluble.',
      'Hg₂²⁺ (mercurio(I)): Hg₂Cl₂, Hg₂Br₂ y Hg₂I₂ son insolubles.',
    ],
    ejemplos: 'NaCl, CaCl₂, FeCl₃, KI, NH₄Br, ZnCl₂',
    reaccion: {
      titulo: 'La prueba clásica del cloruro con nitrato de plata',
      molecular: 'AgNO₃(ac) + NaCl(ac) → AgCl(s)↓ + NaNO₃(ac)',
      ionicaCompleta: 'Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s)↓ + Na⁺ + NO₃⁻',
      ionicaNeta: 'Ag⁺ + Cl⁻ → AgCl(s)↓',
      comentario:
        'El precipitado blanco de AgCl que oscurece con la luz es la prueba analítica habitual de la presencia de cloruro.',
    },
    busqueda:
      'cloruro cloruros bromuro bromuros yoduro yoduros haluro halogenuro Cl Br I soluble excepto plata plomo mercurio AgCl precipitado blanco',
  },
  {
    id: 'sulfatos',
    familia: 'solubles',
    ion: 'SO₄²⁻',
    titulo: 'Sulfatos',
    estado: 'soluble',
    enunciado:
      'Los sulfatos son solubles en agua salvo un grupo pequeño y muy repetido de cationes grandes y pesados. Es la otra regla «con letra pequeña» que conviene tener memorizada.',
    excepciones: [
      'Insolubles: BaSO₄, SrSO₄, PbSO₄ y Hg₂SO₄.',
      'Poco solubles: CaSO₄ (el yeso) y Ag₂SO₄.',
    ],
    ejemplos: 'Na₂SO₄, MgSO₄, CuSO₄, (NH₄)₂SO₄, Al₂(SO₄)₃, FeSO₄',
    reaccion: {
      titulo: 'La prueba del sulfato con cloruro de bario',
      molecular: 'BaCl₂(ac) + Na₂SO₄(ac) → BaSO₄(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: 'Ba²⁺ + 2 Cl⁻ + 2 Na⁺ + SO₄²⁻ → BaSO₄(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Ba²⁺ + SO₄²⁻ → BaSO₄(s)↓',
      comentario:
        'El BaSO₄ es tan insoluble (Kps ≈ 1,1×10⁻¹⁰) que se administra por vía oral como contraste radiológico pese a que el ion bario libre es tóxico.',
    },
    busqueda:
      'sulfato sulfatos SO4 soluble excepto bario estroncio plomo calcio yeso BaSO4 precipitado blanco contraste',
  },
  {
    id: 'nitritos',
    familia: 'solubles',
    ion: 'NO₂⁻',
    titulo: 'Nitritos',
    estado: 'soluble',
    enunciado:
      'Los nitritos son solubles en agua. Se comportan como los nitratos, aunque son bastante menos estables y se oxidan con facilidad a nitrato.',
    excepciones: ['AgNO₂ es poco soluble.'],
    ejemplos: 'NaNO₂, KNO₂, Ca(NO₂)₂',
    reaccion: {
      titulo: 'Nitrito frente a plata',
      molecular: 'AgNO₃(ac) + NaNO₂(ac) → AgNO₂(s)↓ + NaNO₃(ac)',
      ionicaCompleta: 'Ag⁺ + NO₃⁻ + Na⁺ + NO₂⁻ → AgNO₂(s)↓ + Na⁺ + NO₃⁻',
      ionicaNeta: 'Ag⁺ + NO₂⁻ → AgNO₂(s)↓',
      comentario:
        'La plata vuelve a ser la excepción, como en los halogenuros y en el acetato: es el catión que más veces rompe las reglas de solubilidad.',
    },
    busqueda: 'nitrito nitritos NO2 soluble conservante nitrito de sodio plata',
  },
  {
    id: 'permanganatos',
    familia: 'solubles',
    ion: 'MnO₄⁻',
    titulo: 'Permanganatos',
    estado: 'soluble',
    enunciado:
      'Los permanganatos son solubles en agua y dan disoluciones de color violeta intenso, visibles incluso a concentraciones muy bajas.',
    excepciones: ['Sin excepciones habituales.'],
    ejemplos: 'KMnO₄, NaMnO₄, Ca(MnO₄)₂',
    reaccion: {
      titulo: 'Nunca precipita: el color es la pista',
      molecular: 'KMnO₄(ac) + NaCl(ac) → no hay precipitado',
      ionicaCompleta: 'K⁺ + MnO₄⁻ + Na⁺ + Cl⁻ → K⁺ + MnO₄⁻ + Na⁺ + Cl⁻',
      ionicaNeta: 'No hay reacción neta: los cuatro iones son espectadores.',
      comentario:
        'Cuando todas las combinaciones posibles son solubles, no hay reacción de precipitación y la ecuación iónica neta queda vacía. Es una respuesta perfectamente válida en un examen.',
    },
    busqueda:
      'permanganato permanganatos MnO4 soluble violeta morado permanganato de potasio oxidante',
  },
  {
    id: 'bicarbonatos',
    familia: 'solubles',
    ion: 'HCO₃⁻',
    titulo: 'Hidrogenocarbonatos (bicarbonatos)',
    estado: 'soluble',
    enunciado:
      'Los hidrogenocarbonatos son solubles en agua, a diferencia de los carbonatos. Esa diferencia explica que el agua con CO₂ disuelva la caliza y que al hervirla se deposite de nuevo como cal.',
    excepciones: [
      'Solo existen en disolución los de cationes pequeños y muy solubles; muchos hidrogenocarbonatos de metales pesados no llegan a aislarse como sólido.',
    ],
    ejemplos: 'NaHCO₃, KHCO₃, Ca(HCO₃)₂ (solo en disolución)',
    reaccion: {
      titulo: 'La cal del hervidor',
      molecular: 'Ca(HCO₃)₂(ac) → CaCO₃(s)↓ + H₂O(l) + CO₂(g)',
      ionicaCompleta: 'Ca²⁺ + 2 HCO₃⁻ → CaCO₃(s)↓ + H₂O(l) + CO₂(g)',
      ionicaNeta: 'Ca²⁺ + 2 HCO₃⁻ → CaCO₃(s)↓ + H₂O(l) + CO₂(g)',
      comentario:
        'Al calentar, el hidrogenocarbonato soluble se transforma en carbonato insoluble: es exactamente la incrustación blanca de un hervidor con agua dura.',
    },
    busqueda:
      'bicarbonato bicarbonatos hidrogenocarbonato HCO3 soluble agua dura cal caliza hervidor',
  },
  {
    id: 'dicromatos',
    familia: 'solubles',
    ion: 'Cr₂O₇²⁻',
    titulo: 'Dicromatos',
    estado: 'soluble',
    enunciado:
      'Los dicromatos son solubles en agua y dan disoluciones anaranjadas. En medio básico el dicromato se convierte en cromato, que ya sigue la regla de los insolubles.',
    excepciones: ['Ag₂Cr₂O₇ es poco soluble.'],
    ejemplos: 'K₂Cr₂O₇, Na₂Cr₂O₇, (NH₄)₂Cr₂O₇',
    reaccion: {
      titulo: 'Del dicromato naranja al cromato amarillo',
      molecular: 'K₂Cr₂O₇(ac) + 2 KOH(ac) → 2 K₂CrO₄(ac) + H₂O(l)',
      ionicaCompleta: '2 K⁺ + Cr₂O₇²⁻ + 2 K⁺ + 2 OH⁻ → 4 K⁺ + 2 CrO₄²⁻ + H₂O(l)',
      ionicaNeta: 'Cr₂O₇²⁻ + 2 OH⁻ → 2 CrO₄²⁻ + H₂O(l)',
      comentario:
        'No es una precipitación sino un equilibrio ácido-base, pero condiciona la solubilidad: en medio básico aparece el cromato, que sí precipita con Ba²⁺, Pb²⁺ o Ag⁺. Los compuestos de cromo(VI) son cancerígenos y su manipulación está restringida.',
    },
    busqueda:
      'dicromato dicromatos Cr2O7 soluble naranja cromo VI equilibrio cromato dicromato de potasio',
  },

  /* ── Insolubles ───────────────────────────────────────────── */
  {
    id: 'carbonatos',
    familia: 'insolubles',
    ion: 'CO₃²⁻',
    titulo: 'Carbonatos',
    estado: 'insoluble',
    enunciado:
      'Los carbonatos son insolubles en agua. Es la regla que explica la existencia de la caliza, el mármol, las conchas marinas y las cáscaras de huevo, todos ellos CaCO₃.',
    excepciones: [
      'Solubles los de metales alcalinos (Na₂CO₃, K₂CO₃…) y el de amonio, (NH₄)₂CO₃.',
      'Li₂CO₃ es la excepción de la excepción: solo poco soluble.',
    ],
    ejemplos: 'CaCO₃, BaCO₃, MgCO₃, PbCO₃, ZnCO₃, FeCO₃',
    reaccion: {
      titulo: 'Formación de carbonato de calcio',
      molecular: 'CaCl₂(ac) + Na₂CO₃(ac) → CaCO₃(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: 'Ca²⁺ + 2 Cl⁻ + 2 Na⁺ + CO₃²⁻ → CaCO₃(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Ca²⁺ + CO₃²⁻ → CaCO₃(s)↓',
      comentario:
        'Todo carbonato insoluble se disuelve al añadir un ácido fuerte, con burbujeo de CO₂: CaCO₃(s) + 2 H⁺ → Ca²⁺ + H₂O + CO₂(g).',
    },
    busqueda:
      'carbonato carbonatos CO3 insoluble caliza marmol concha cascara CaCO3 precipitado blanco efervescencia',
  },
  {
    id: 'fosfatos',
    familia: 'insolubles',
    ion: 'PO₄³⁻',
    titulo: 'Fosfatos',
    estado: 'insoluble',
    enunciado:
      'Los fosfatos son insolubles en agua. El fosfato de calcio es el componente mineral mayoritario de huesos y dientes, y su baja solubilidad es justo lo que los mantiene sólidos.',
    excepciones: [
      'Solubles los de metales alcalinos y el de amonio.',
      'Li₃PO₄ es insoluble, otra vez la anomalía del litio.',
      'Los hidrogenofosfatos y dihidrogenofosfatos son bastante más solubles que el fosfato neutro.',
    ],
    ejemplos: 'Ca₃(PO₄)₂, AlPO₄, FePO₄, Ag₃PO₄, Mg₃(PO₄)₂',
    reaccion: {
      titulo: 'Fosfato de calcio, el mineral del hueso',
      molecular: '3 CaCl₂(ac) + 2 Na₃PO₄(ac) → Ca₃(PO₄)₂(s)↓ + 6 NaCl(ac)',
      ionicaCompleta: '3 Ca²⁺ + 6 Cl⁻ + 6 Na⁺ + 2 PO₄³⁻ → Ca₃(PO₄)₂(s)↓ + 6 Na⁺ + 6 Cl⁻',
      ionicaNeta: '3 Ca²⁺ + 2 PO₄³⁻ → Ca₃(PO₄)₂(s)↓',
      comentario:
        'Fíjate en los coeficientes: con cargas 2+ y 3− hay que cruzarlas para equilibrar, y aparecen 3 y 2 en la ecuación iónica neta.',
    },
    busqueda:
      'fosfato fosfatos PO4 insoluble hueso diente fosfato de calcio detergente eutrofizacion',
  },
  {
    id: 'cromatos',
    familia: 'insolubles',
    ion: 'CrO₄²⁻',
    titulo: 'Cromatos',
    estado: 'insoluble',
    enunciado:
      'Los cromatos son insolubles en agua y dan precipitados de colores muy característicos: amarillo el de plomo, rojo ladrillo el de plata.',
    excepciones: [
      'Solubles los de metales alcalinos, el de amonio y MgCrO₄.',
      'CaCrO₄ y SrCrO₄ son poco solubles.',
    ],
    ejemplos: 'PbCrO₄, Ag₂CrO₄, BaCrO₄, ZnCrO₄',
    reaccion: {
      titulo: 'Cromato de plata en la valoración de Mohr',
      molecular: '2 AgNO₃(ac) + K₂CrO₄(ac) → Ag₂CrO₄(s)↓ + 2 KNO₃(ac)',
      ionicaCompleta: '2 Ag⁺ + 2 NO₃⁻ + 2 K⁺ + CrO₄²⁻ → Ag₂CrO₄(s)↓ + 2 K⁺ + 2 NO₃⁻',
      ionicaNeta: '2 Ag⁺ + CrO₄²⁻ → Ag₂CrO₄(s)↓',
      comentario:
        'En el método de Mohr, el cromato actúa de indicador: solo aparece el precipitado rojo de Ag₂CrO₄ cuando ya ha precipitado todo el cloruro, porque el AgCl es mucho menos soluble.',
    },
    busqueda:
      'cromato cromatos CrO4 insoluble amarillo cromo VI cromato de plomo cromato de plata Mohr indicador',
  },
  {
    id: 'sulfuros',
    familia: 'insolubles',
    ion: 'S²⁻',
    titulo: 'Sulfuros',
    estado: 'insoluble',
    enunciado:
      'Los sulfuros son insolubles en agua, y algunos de los sólidos menos solubles que se conocen: el sulfuro de plata tiene un Kps del orden de 10⁻⁵⁰. Muchos minerales metálicos son sulfuros por este motivo.',
    excepciones: [
      'Solubles los de metales alcalinos y el de amonio.',
      'Los de alcalinotérreos (CaS, SrS, BaS) se disuelven, aunque hidrolizándose y liberando H₂S.',
    ],
    ejemplos: 'CuS, ZnS, PbS, Ag₂S, HgS, CdS, FeS',
    reaccion: {
      titulo: 'Sulfuro de cobre(II), negro',
      molecular: 'CuSO₄(ac) + Na₂S(ac) → CuS(s)↓ + Na₂SO₄(ac)',
      ionicaCompleta: 'Cu²⁺ + SO₄²⁻ + 2 Na⁺ + S²⁻ → CuS(s)↓ + 2 Na⁺ + SO₄²⁻',
      ionicaNeta: 'Cu²⁺ + S²⁻ → CuS(s)↓',
      comentario:
        'La separación de cationes por precipitación selectiva de sulfuros, controlando el pH, es la base de la marcha analítica clásica. El H₂S es muy tóxico: hoy se trabaja con generadores in situ y campana extractora.',
    },
    busqueda:
      'sulfuro sulfuros S2- insoluble negro mineral galena pirita sulfuro de cobre marcha analitica',
  },
  {
    id: 'hidroxidos',
    familia: 'insolubles',
    ion: 'OH⁻',
    titulo: 'Hidróxidos',
    estado: 'insoluble',
    enunciado:
      'Los hidróxidos son insolubles en agua salvo los de los metales alcalinos. Es la regla con más excepciones graduales: entre el NaOH (muy soluble) y el Fe(OH)₃ (Kps ≈ 10⁻³⁹) hay casi cuarenta órdenes de magnitud.',
    excepciones: [
      'Solubles: los de metales alcalinos (NaOH, KOH, LiOH…) y Ba(OH)₂.',
      'Parcialmente solubles: Ca(OH)₂ (agua de cal) y Sr(OH)₂.',
      'NH₄OH no existe como tal: es amoníaco disuelto, NH₃(ac), en equilibrio con NH₄⁺ y OH⁻.',
    ],
    ejemplos: 'Mg(OH)₂, Al(OH)₃, Fe(OH)₃, Cu(OH)₂, Zn(OH)₂',
    reaccion: {
      titulo: 'Hidróxido de magnesio, la leche de magnesia',
      molecular: 'MgCl₂(ac) + 2 NaOH(ac) → Mg(OH)₂(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: 'Mg²⁺ + 2 Cl⁻ + 2 Na⁺ + 2 OH⁻ → Mg(OH)₂(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Mg²⁺ + 2 OH⁻ → Mg(OH)₂(s)↓',
      comentario:
        'Algunos hidróxidos son anfóteros: Al(OH)₃ y Zn(OH)₂ precipitan con poca base y se vuelven a disolver con exceso, formando [Al(OH)₄]⁻ y [Zn(OH)₄]²⁻.',
    },
    busqueda:
      'hidroxido hidroxidos OH insoluble excepto alcalinos bario agua de cal anfotero aluminio zinc precipitado gelatinoso',
  },
  {
    id: 'oxidos',
    familia: 'insolubles',
    ion: 'O²⁻',
    titulo: 'Óxidos',
    estado: 'insoluble',
    enunciado:
      'Los óxidos metálicos son insolubles en agua. Los de metales alcalinos y alcalinotérreos no se «disuelven» en sentido estricto: reaccionan con el agua y se transforman en el hidróxido correspondiente.',
    excepciones: [
      'Na₂O, K₂O, CaO y BaO reaccionan con agua dando NaOH, KOH, Ca(OH)₂ y Ba(OH)₂.',
      'El ion óxido O²⁻ no existe libre en disolución acuosa: siempre acaba como OH⁻.',
    ],
    ejemplos: 'Fe₂O₃, CuO, Al₂O₃, ZnO, TiO₂',
    reaccion: {
      titulo: 'El óxido que se convierte en hidróxido',
      molecular: 'CaO(s) + H₂O(l) → Ca(OH)₂(s)',
      ionicaCompleta: 'CaO(s) + H₂O(l) → Ca²⁺ + 2 OH⁻ (parcialmente, es poco soluble)',
      ionicaNeta: 'O²⁻ + H₂O(l) → 2 OH⁻',
      comentario:
        'Esta reacción, el apagado de la cal, es fuertemente exotérmica. Por eso el ion óxido no aparece nunca en una tabla de solubilidad como especie disuelta.',
    },
    busqueda:
      'oxido oxidos O2- insoluble cal viva CaO apagado de la cal herrumbre reacciona con agua',
  },
  {
    id: 'sulfitos',
    familia: 'insolubles',
    ion: 'SO₃²⁻',
    titulo: 'Sulfitos',
    estado: 'insoluble',
    enunciado:
      'Los sulfitos son insolubles en agua, con el mismo patrón que los carbonatos. Se oxidan lentamente a sulfato en contacto con el aire, así que un sulfito viejo suele estar contaminado de sulfato.',
    excepciones: ['Solubles los de metales alcalinos y el de amonio.'],
    ejemplos: 'CaSO₃, BaSO₃, PbSO₃, Ag₂SO₃',
    reaccion: {
      titulo: 'Sulfito de bario',
      molecular: 'BaCl₂(ac) + Na₂SO₃(ac) → BaSO₃(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: 'Ba²⁺ + 2 Cl⁻ + 2 Na⁺ + SO₃²⁻ → BaSO₃(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Ba²⁺ + SO₃²⁻ → BaSO₃(s)↓',
      comentario:
        'A diferencia del BaSO₄, el BaSO₃ se disuelve al añadir un ácido fuerte y desprende SO₂. Es la forma clásica de distinguir un sulfito de un sulfato.',
    },
    busqueda: 'sulfito sulfitos SO3 insoluble conservante vino SO2 distinguir sulfato',
  },
  {
    id: 'oxalatos',
    familia: 'insolubles',
    ion: 'C₂O₄²⁻',
    titulo: 'Oxalatos',
    estado: 'insoluble',
    enunciado:
      'Los oxalatos son insolubles en agua. El oxalato de calcio, muy poco soluble, es el componente mayoritario de la mayoría de los cálculos renales.',
    excepciones: ['Solubles los de metales alcalinos y el de amonio.'],
    ejemplos: 'CaC₂O₄, BaC₂O₄, PbC₂O₄, MgC₂O₄',
    reaccion: {
      titulo: 'Oxalato de calcio',
      molecular: 'CaCl₂(ac) + Na₂C₂O₄(ac) → CaC₂O₄(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: 'Ca²⁺ + 2 Cl⁻ + 2 Na⁺ + C₂O₄²⁻ → CaC₂O₄(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Ca²⁺ + C₂O₄²⁻ → CaC₂O₄(s)↓',
      comentario:
        'La precipitación cuantitativa del calcio como oxalato fue durante décadas el método gravimétrico estándar para determinar calcio en una muestra.',
    },
    busqueda:
      'oxalato oxalatos C2O4 insoluble calculo renal piedra rinon oxalato de calcio espinaca gravimetria',
  },
  {
    id: 'fluoruros',
    familia: 'insolubles',
    ion: 'F⁻',
    titulo: 'Fluoruros',
    estado: 'insoluble',
    enunciado:
      'Los fluoruros se comportan al revés que el resto de halogenuros: son mayoritariamente insolubles. El ion fluoruro es pequeño y muy cargado en relación con su tamaño, y forma redes cristalinas muy estables.',
    excepciones: [
      'Solubles los de metales alcalinos (salvo LiF, poco soluble), el de amonio y AgF.',
      'CaF₂ (fluorita), BaF₂, MgF₂ y PbF₂ son insolubles.',
    ],
    ejemplos: 'CaF₂, MgF₂, BaF₂, PbF₂',
    reaccion: {
      titulo: 'Fluoruro de calcio, la fluorita',
      molecular: 'CaCl₂(ac) + 2 NaF(ac) → CaF₂(s)↓ + 2 NaCl(ac)',
      ionicaCompleta: 'Ca²⁺ + 2 Cl⁻ + 2 Na⁺ + 2 F⁻ → CaF₂(s)↓ + 2 Na⁺ + 2 Cl⁻',
      ionicaNeta: 'Ca²⁺ + 2 F⁻ → CaF₂(s)↓',
      comentario:
        'La baja solubilidad del fluoruro de calcio es la razón química de que el flúor refuerce el esmalte dental, que es fosfato de calcio parcialmente fluorado.',
    },
    busqueda:
      'fluoruro fluoruros F insoluble fluorita CaF2 esmalte dental pasta de dientes excepcion halogenuros',
  },
  {
    id: 'silicatos',
    familia: 'insolubles',
    ion: 'SiO₃²⁻',
    titulo: 'Silicatos',
    estado: 'insoluble',
    enunciado:
      'Los silicatos son insolubles en agua. Constituyen más del 90 % de la corteza terrestre justamente porque no se disuelven: si lo hicieran, no habría rocas.',
    excepciones: [
      'Solubles los de metales alcalinos: el silicato de sodio es el «vidrio soluble» o waterglass.',
    ],
    ejemplos: 'CaSiO₃, MgSiO₃, Al₂(SiO₃)₃, ZnSiO₃',
    reaccion: {
      titulo: 'El jardín químico',
      molecular: 'CuSO₄(ac) + Na₂SiO₃(ac) → CuSiO₃(s)↓ + Na₂SO₄(ac)',
      ionicaCompleta: 'Cu²⁺ + SO₄²⁻ + 2 Na⁺ + SiO₃²⁻ → CuSiO₃(s)↓ + 2 Na⁺ + SO₄²⁻',
      ionicaNeta: 'Cu²⁺ + SiO₃²⁻ → CuSiO₃(s)↓',
      comentario:
        'Al dejar caer cristales de sales metálicas en silicato de sodio se forman membranas insolubles que crecen como tallos: es el clásico «jardín químico».',
    },
    busqueda:
      'silicato silicatos SiO3 insoluble roca corteza terrestre vidrio soluble jardin quimico waterglass',
  },
];

/* ── Bloque 2: iones poliatómicos ─────────────────────────────── */

interface IonPoliatomico {
  id: string;
  formula: string;
  carga: string;
  nombreIupac: string;
  nombreTradicional: string;
  familia: string;
  nota: string;
  busqueda: string;
}

const IONES: IonPoliatomico[] = [
  {
    id: 'amonio',
    formula: 'NH₄⁺',
    carga: '+1',
    nombreIupac: 'amonio',
    nombreTradicional: 'amonio',
    familia: 'Catión',
    nota: 'Único catión poliatómico frecuente. Todas sus sales son solubles. Procede del amoníaco NH₃ al captar un protón.',
    busqueda: 'amonio NH4 cation positivo amoniaco fertilizante soluble',
  },
  {
    id: 'oxonio',
    formula: 'H₃O⁺',
    carga: '+1',
    nombreIupac: 'oxonio',
    nombreTradicional: 'hidronio',
    familia: 'Catión',
    nota: 'Forma real del protón en disolución acuosa. El pH mide su concentración: pH = −log[H₃O⁺].',
    busqueda: 'oxonio hidronio H3O protón acido pH cation',
  },
  {
    id: 'hidroxido',
    formula: 'OH⁻',
    carga: '−1',
    nombreIupac: 'hidróxido',
    nombreTradicional: 'oxhidrilo, hidroxilo',
    familia: 'Oxígeno e hidrógeno',
    nota: 'Anión característico de las bases. Insoluble con casi todos los cationes salvo alcalinos y bario.',
    busqueda: 'hidroxido oxidrilo hidroxilo OH base pH alcalino insoluble',
  },
  {
    id: 'nitrato',
    formula: 'NO₃⁻',
    carga: '−1',
    nombreIupac: 'trioxidonitrato(1−), nitrato',
    nombreTradicional: 'nitrato',
    familia: 'Nitrógeno',
    nota: 'Todas sus sales son solubles. Estructura plana trigonal con los tres oxígenos equivalentes por resonancia.',
    busqueda: 'nitrato NO3 soluble resonancia plano trigonal fertilizante',
  },
  {
    id: 'nitrito',
    formula: 'NO₂⁻',
    carga: '−1',
    nombreIupac: 'dioxidonitrato(1−), nitrito',
    nombreTradicional: 'nitrito',
    familia: 'Nitrógeno',
    nota: 'Un oxígeno menos que el nitrato, misma carga. Angular por el par de electrones libre del nitrógeno.',
    busqueda: 'nitrito NO2 conservante carne angular soluble',
  },
  {
    id: 'sulfato',
    formula: 'SO₄²⁻',
    carga: '−2',
    nombreIupac: 'tetraoxidosulfato(2−), sulfato',
    nombreTradicional: 'sulfato',
    familia: 'Azufre',
    nota: 'Tetraédrico. Soluble salvo con Ba²⁺, Sr²⁺, Pb²⁺ (insolubles) y Ca²⁺, Ag⁺ (poco solubles).',
    busqueda: 'sulfato SO4 tetraedrico soluble bario yeso acido sulfurico',
  },
  {
    id: 'sulfito',
    formula: 'SO₃²⁻',
    carga: '−2',
    nombreIupac: 'trioxidosulfato(2−), sulfito',
    nombreTradicional: 'sulfito',
    familia: 'Azufre',
    nota: 'Se oxida a sulfato con facilidad. Con ácido desprende SO₂, lo que permite distinguirlo del sulfato.',
    busqueda: 'sulfito SO3 conservante vino SO2 reductor insoluble',
  },
  {
    id: 'hidrogenosulfato',
    formula: 'HSO₄⁻',
    carga: '−1',
    nombreIupac: 'hidrogenotetraoxidosulfato(1−), hidrogenosulfato',
    nombreTradicional: 'bisulfato, sulfato ácido',
    familia: 'Azufre',
    nota: 'Primera desprotonación del ácido sulfúrico. Sigue siendo ácido: cede el segundo protón parcialmente.',
    busqueda: 'hidrogenosulfato bisulfato HSO4 sulfato acido sulfurico anfoteroprotico',
  },
  {
    id: 'hidrogenosulfito',
    formula: 'HSO₃⁻',
    carga: '−1',
    nombreIupac: 'hidrogenotrioxidosulfato(1−), hidrogenosulfito',
    nombreTradicional: 'bisulfito',
    familia: 'Azufre',
    nota: 'Presente en los conservantes E-222 a E-228. Libera SO₂ en medio ácido.',
    busqueda: 'hidrogenosulfito bisulfito HSO3 conservante',
  },
  {
    id: 'tiosulfato',
    formula: 'S₂O₃²⁻',
    carga: '−2',
    nombreIupac: 'trioxidotiosulfato(2−), tiosulfato',
    nombreTradicional: 'tiosulfato, hiposulfito',
    familia: 'Azufre',
    nota: 'Un oxígeno del sulfato sustituido por azufre («tio-»). Disuelve el AgBr: es el fijador de la fotografía química.',
    busqueda: 'tiosulfato S2O3 hiposulfito fijador fotografia yodometria complejo plata',
  },
  {
    id: 'carbonato',
    formula: 'CO₃²⁻',
    carga: '−2',
    nombreIupac: 'trioxidocarbonato(2−), carbonato',
    nombreTradicional: 'carbonato',
    familia: 'Carbono',
    nota: 'Plano trigonal, con resonancia entre tres formas equivalentes. Insoluble salvo con alcalinos y amonio.',
    busqueda: 'carbonato CO3 insoluble caliza marmol resonancia efervescencia',
  },
  {
    id: 'hidrogenocarbonato',
    formula: 'HCO₃⁻',
    carga: '−1',
    nombreIupac: 'hidrogenotrioxidocarbonato(1−), hidrogenocarbonato',
    nombreTradicional: 'bicarbonato',
    familia: 'Carbono',
    nota: 'Sus sales sí son solubles. Es el principal tampón de la sangre junto con el CO₂ disuelto.',
    busqueda: 'bicarbonato hidrogenocarbonato HCO3 soluble tampon sangre agua dura',
  },
  {
    id: 'fosfato',
    formula: 'PO₄³⁻',
    carga: '−3',
    nombreIupac: 'tetraoxidofosfato(3−), fosfato',
    nombreTradicional: 'ortofosfato',
    familia: 'Fósforo',
    nota: 'Tetraédrico y con carga 3−, la más alta de la tabla junto con arseniato y borato. Insoluble salvo alcalinos y amonio.',
    busqueda: 'fosfato ortofosfato PO4 insoluble hueso ADN ATP detergente',
  },
  {
    id: 'hidrogenofosfato',
    formula: 'HPO₄²⁻',
    carga: '−2',
    nombreIupac: 'hidrogenotetraoxidofosfato(2−), hidrogenofosfato',
    nombreTradicional: 'fosfato ácido, fosfato monoácido',
    familia: 'Fósforo',
    nota: 'Segunda desprotonación del ácido fosfórico. Con el H₂PO₄⁻ forma el tampón fosfato del interior celular.',
    busqueda: 'hidrogenofosfato fosfato acido HPO4 tampon celula',
  },
  {
    id: 'dihidrogenofosfato',
    formula: 'H₂PO₄⁻',
    carga: '−1',
    nombreIupac: 'dihidrogenotetraoxidofosfato(1−), dihidrogenofosfato',
    nombreTradicional: 'fosfato diácido',
    familia: 'Fósforo',
    nota: 'Primera desprotonación del H₃PO₄. Es la especie mayoritaria a pH ligeramente ácido.',
    busqueda: 'dihidrogenofosfato fosfato diacido H2PO4 tampon superfosfato',
  },
  {
    id: 'fosfito',
    formula: 'PO₃³⁻',
    carga: '−3',
    nombreIupac: 'trioxidofosfato(3−), fosfito',
    nombreTradicional: 'fosfito',
    familia: 'Fósforo',
    nota: 'Un oxígeno menos que el fosfato. En la práctica el ácido fosforoso es diprótico y su anión habitual es HPO₃²⁻.',
    busqueda: 'fosfito PO3 fosforoso reductor',
  },
  {
    id: 'hipoclorito',
    formula: 'ClO⁻',
    carga: '−1',
    nombreIupac: 'oxidoclorato(1−), hipoclorito',
    nombreTradicional: 'hipoclorito',
    familia: 'Halógenos oxigenados',
    nota: 'El principio activo de la lejía es el hipoclorito de sodio. Nunca mezclar con productos ácidos: libera cloro gas.',
    busqueda: 'hipoclorito ClO lejia cloro desinfectante peligro mezcla acido',
  },
  {
    id: 'clorito',
    formula: 'ClO₂⁻',
    carga: '−1',
    nombreIupac: 'dioxidoclorato(1−), clorito',
    nombreTradicional: 'clorito',
    familia: 'Halógenos oxigenados',
    nota: 'Segundo escalón de la serie. Se usa en el blanqueo de pasta de papel.',
    busqueda: 'clorito ClO2 blanqueante papel',
  },
  {
    id: 'clorato',
    formula: 'ClO₃⁻',
    carga: '−1',
    nombreIupac: 'trioxidoclorato(1−), clorato',
    nombreTradicional: 'clorato',
    familia: 'Halógenos oxigenados',
    nota: 'Oxidante fuerte. Todas sus sales son solubles. El clorato de potasio se usaba en cerillas y pirotecnia.',
    busqueda: 'clorato ClO3 soluble oxidante pirotecnia cerillas',
  },
  {
    id: 'perclorato',
    formula: 'ClO₄⁻',
    carga: '−1',
    nombreIupac: 'tetraoxidoclorato(1−), perclorato',
    nombreTradicional: 'perclorato',
    familia: 'Halógenos oxigenados',
    nota: 'Máximo estado de oxidación del cloro (+7). Muy poco coordinante, ideal como anión «inerte». KClO₄ es poco soluble.',
    busqueda: 'perclorato ClO4 soluble oxidante propelente anion inerte potasio excepcion',
  },
  {
    id: 'hipobromito',
    formula: 'BrO⁻',
    carga: '−1',
    nombreIupac: 'oxidobromato(1−), hipobromito',
    nombreTradicional: 'hipobromito',
    familia: 'Halógenos oxigenados',
    nota: 'Análogo del hipoclorito con bromo. Menos estable en disolución.',
    busqueda: 'hipobromito BrO bromo serie',
  },
  {
    id: 'bromato',
    formula: 'BrO₃⁻',
    carga: '−1',
    nombreIupac: 'trioxidobromato(1−), bromato',
    nombreTradicional: 'bromato',
    familia: 'Halógenos oxigenados',
    nota: 'Oxidante empleado en bromatometría. Su presencia en el agua potable está limitada por normativa sanitaria.',
    busqueda: 'bromato BrO3 oxidante agua potable',
  },
  {
    id: 'perbromato',
    formula: 'BrO₄⁻',
    carga: '−1',
    nombreIupac: 'tetraoxidobromato(1−), perbromato',
    nombreTradicional: 'perbromato',
    familia: 'Halógenos oxigenados',
    nota: 'El más difícil de preparar de la serie: no se consiguió sintetizar hasta 1968.',
    busqueda: 'perbromato BrO4 serie bromo',
  },
  {
    id: 'hipoyodito',
    formula: 'IO⁻',
    carga: '−1',
    nombreIupac: 'oxidoyodato(1−), hipoyodito',
    nombreTradicional: 'hipoyodito',
    familia: 'Halógenos oxigenados',
    nota: 'Muy inestable: se desproporciona rápidamente en yoduro y yodato.',
    busqueda: 'hipoyodito IO yodo serie',
  },
  {
    id: 'yodato',
    formula: 'IO₃⁻',
    carga: '−1',
    nombreIupac: 'trioxidoyodato(1−), yodato',
    nombreTradicional: 'yodato, iodato',
    familia: 'Halógenos oxigenados',
    nota: 'El yodato de potasio es la forma habitual de yodar la sal de mesa, más estable que el yoduro.',
    busqueda: 'yodato iodato IO3 sal yodada tiroides',
  },
  {
    id: 'peryodato',
    formula: 'IO₄⁻',
    carga: '−1',
    nombreIupac: 'tetraoxidoyodato(1−), peryodato',
    nombreTradicional: 'peryodato, periodato',
    familia: 'Halógenos oxigenados',
    nota: 'Oxidante fuerte usado en química orgánica para romper enlaces C–C de dioles.',
    busqueda: 'peryodato periodato IO4 oxidante dioles',
  },
  {
    id: 'permanganato',
    formula: 'MnO₄⁻',
    carga: '−1',
    nombreIupac: 'tetraoxidomanganato(1−), permanganato',
    nombreTradicional: 'permanganato',
    familia: 'Metales de transición',
    nota: 'Manganeso en estado +7. Color violeta intenso; en medio ácido se reduce a Mn²⁺, casi incoloro. Todas sus sales son solubles.',
    busqueda: 'permanganato MnO4 violeta morado oxidante valoracion redox soluble',
  },
  {
    id: 'manganato',
    formula: 'MnO₄²⁻',
    carga: '−2',
    nombreIupac: 'tetraoxidomanganato(2−), manganato',
    nombreTradicional: 'manganato',
    familia: 'Metales de transición',
    nota: 'Manganeso en +6, de color verde. Solo estable en medio muy básico; en medio neutro se desproporciona.',
    busqueda: 'manganato MnO4 2- verde manganeso VI desproporcion',
  },
  {
    id: 'cromato',
    formula: 'CrO₄²⁻',
    carga: '−2',
    nombreIupac: 'tetraoxidocromato(2−), cromato',
    nombreTradicional: 'cromato',
    familia: 'Metales de transición',
    nota: 'Amarillo, estable en medio básico. Sus sales son insolubles salvo con alcalinos y amonio. El cromo(VI) es cancerígeno.',
    busqueda: 'cromato CrO4 amarillo cromo VI insoluble cancerigeno',
  },
  {
    id: 'dicromato',
    formula: 'Cr₂O₇²⁻',
    carga: '−2',
    nombreIupac: 'heptaoxidodicromato(2−), dicromato',
    nombreTradicional: 'dicromato, bicromato',
    familia: 'Metales de transición',
    nota: 'Naranja, estable en medio ácido. Se interconvierte con el cromato según el pH. Sus sales son solubles.',
    busqueda: 'dicromato bicromato Cr2O7 naranja soluble oxidante equilibrio pH',
  },
  {
    id: 'cianuro',
    formula: 'CN⁻',
    carga: '−1',
    nombreIupac: 'cianuro',
    nombreTradicional: 'cianuro',
    familia: 'Carbono y nitrógeno',
    nota: 'Isoelectrónico con el N₂ y el CO. Ligando muy fuerte con metales de transición. Extremadamente tóxico.',
    busqueda: 'cianuro CN toxico ligando complejo mineria oro',
  },
  {
    id: 'tiocianato',
    formula: 'SCN⁻',
    carga: '−1',
    nombreIupac: 'tiocianato',
    nombreTradicional: 'sulfocianuro, sulfocianato',
    familia: 'Carbono y nitrógeno',
    nota: 'Con Fe³⁺ da un complejo rojo sangre intenso: es el ensayo clásico para detectar hierro(III).',
    busqueda: 'tiocianato sulfocianuro SCN hierro III rojo sangre complejo ensayo',
  },
  {
    id: 'cianato',
    formula: 'OCN⁻',
    carga: '−1',
    nombreIupac: 'cianato',
    nombreTradicional: 'cianato',
    familia: 'Carbono y nitrógeno',
    nota: 'Su sal de amonio se transforma en urea al calentarse: la síntesis de Wöhler de 1828, que derribó la teoría del vitalismo.',
    busqueda: 'cianato OCN urea Wohler vitalismo isomeria',
  },
  {
    id: 'acetato',
    formula: 'CH₃COO⁻',
    carga: '−1',
    nombreIupac: 'etanoato, acetato',
    nombreTradicional: 'acetato',
    familia: 'Orgánicos',
    nota: 'Base conjugada del ácido acético (vinagre). También se escribe C₂H₃O₂⁻. Sus sales son solubles salvo la de plata.',
    busqueda: 'acetato etanoato CH3COO C2H3O2 vinagre acido acetico soluble tampon',
  },
  {
    id: 'formiato',
    formula: 'HCOO⁻',
    carga: '−1',
    nombreIupac: 'metanoato, formiato',
    nombreTradicional: 'formiato',
    familia: 'Orgánicos',
    nota: 'Base conjugada del ácido fórmico, el de la picadura de hormiga. Es el ácido carboxílico más simple.',
    busqueda: 'formiato metanoato HCOO acido formico hormiga',
  },
  {
    id: 'oxalato',
    formula: 'C₂O₄²⁻',
    carga: '−2',
    nombreIupac: 'etanodioato, oxalato',
    nombreTradicional: 'oxalato',
    familia: 'Orgánicos',
    nota: 'Diácido con dos grupos carboxilato. Sus sales son insolubles: el oxalato de calcio forma cálculos renales.',
    busqueda: 'oxalato etanodioato C2O4 insoluble calculo renal espinaca acelga',
  },
  {
    id: 'peroxido',
    formula: 'O₂²⁻',
    carga: '−2',
    nombreIupac: 'peróxido',
    nombreTradicional: 'peróxido',
    familia: 'Oxígeno e hidrógeno',
    nota: 'Oxígeno con número de oxidación −1, no −2. Su ácido es el agua oxigenada, H₂O₂.',
    busqueda: 'peroxido O2 2- agua oxigenada H2O2 numero de oxidacion -1',
  },
  {
    id: 'superoxido',
    formula: 'O₂⁻',
    carga: '−1',
    nombreIupac: 'superóxido, dioxido(1−)',
    nombreTradicional: 'hiperóxido',
    familia: 'Oxígeno e hidrógeno',
    nota: 'Oxígeno con estado de oxidación −½. Es un radical libre; en el organismo lo neutraliza la enzima superóxido dismutasa.',
    busqueda: 'superoxido hiperoxido O2- radical libre dismutasa estres oxidativo',
  },
  {
    id: 'hidrogenosulfuro',
    formula: 'HS⁻',
    carga: '−1',
    nombreIupac: 'hidrogenosulfuro',
    nombreTradicional: 'bisulfuro, sulfuro ácido',
    familia: 'Azufre',
    nota: 'Primera desprotonación del sulfuro de hidrógeno. En agua a pH neutro es la especie de azufre(−2) mayoritaria.',
    busqueda: 'hidrogenosulfuro bisulfuro HS sulfhidrico H2S',
  },
  {
    id: 'arseniato',
    formula: 'AsO₄³⁻',
    carga: '−3',
    nombreIupac: 'tetraoxidoarsenato(3−), arseniato',
    nombreTradicional: 'arseniato, arsenato',
    familia: 'Otros oxoaniones',
    nota: 'Análogo del fosfato, con la misma geometría y carga. Su toxicidad se debe precisamente a que suplanta al fosfato en el metabolismo.',
    busqueda: 'arseniato arsenato AsO4 toxico analogo fosfato agua contaminada',
  },
  {
    id: 'arsenito',
    formula: 'AsO₃³⁻',
    carga: '−3',
    nombreIupac: 'trioxidoarsenato(3−), arsenito',
    nombreTradicional: 'arsenito',
    familia: 'Otros oxoaniones',
    nota: 'Arsénico en estado +3, todavía más tóxico que el arseniato.',
    busqueda: 'arsenito AsO3 arsenico toxico',
  },
  {
    id: 'borato',
    formula: 'BO₃³⁻',
    carga: '−3',
    nombreIupac: 'trioxidoborato(3−), borato',
    nombreTradicional: 'borato, ortoborato',
    familia: 'Otros oxoaniones',
    nota: 'Plano trigonal como el carbonato y el nitrato. En disolución real predominan formas condensadas más complejas.',
    busqueda: 'borato ortoborato BO3 boro plano trigonal',
  },
  {
    id: 'tetraborato',
    formula: 'B₄O₇²⁻',
    carga: '−2',
    nombreIupac: 'heptaoxidotetraborato(2−), tetraborato',
    nombreTradicional: 'tetraborato',
    familia: 'Otros oxoaniones',
    nota: 'El bórax es Na₂B₄O₇·10H₂O. Se usa como patrón primario en valoraciones ácido-base.',
    busqueda: 'tetraborato borax B4O7 patron primario valoracion',
  },
  {
    id: 'silicato',
    formula: 'SiO₃²⁻',
    carga: '−2',
    nombreIupac: 'trioxidosilicato(2−), silicato',
    nombreTradicional: 'metasilicato',
    familia: 'Otros oxoaniones',
    nota: 'En los minerales reales los silicatos forman cadenas, láminas y redes tridimensionales, no iones aislados.',
    busqueda: 'silicato metasilicato SiO3 roca mineral vidrio soluble insoluble',
  },
  {
    id: 'aluminato',
    formula: 'Al(OH)₄⁻',
    carga: '−1',
    nombreIupac: 'tetrahidroxidoaluminato(1−)',
    nombreTradicional: 'aluminato',
    familia: 'Complejos frecuentes',
    nota: 'Se forma al disolver el Al(OH)₃ precipitado en exceso de base: es la prueba del carácter anfótero del aluminio.',
    busqueda: 'aluminato tetrahidroxidoaluminato Al(OH)4 anfotero aluminio exceso base',
  },
  {
    id: 'cromito',
    formula: 'Cr(OH)₄⁻',
    carga: '−1',
    nombreIupac: 'tetrahidroxidocromato(1−)',
    nombreTradicional: 'cromito',
    familia: 'Complejos frecuentes',
    nota: 'Equivalente del aluminato para el cromo(III), también anfótero.',
    busqueda: 'cromito Cr(OH)4 anfotero cromo III',
  },
];

/* ── Bloque 3: productos de solubilidad ───────────────────────── */

interface CompuestoKps {
  id: string;
  formula: string;
  nombre: string;
  kps: string;
  disolucion: string;
  expresion: string;
  relacion: string;
  solubilidad: string;
  nota: string;
  busqueda: string;
}

const KPS: CompuestoKps[] = [
  {
    id: 'agcl',
    formula: 'AgCl',
    nombre: 'Cloruro de plata',
    kps: '1,8×10⁻¹⁰',
    disolucion: 'AgCl(s) ⇌ Ag⁺(ac) + Cl⁻(ac)',
    expresion: 'Kps = [Ag⁺]·[Cl⁻]',
    relacion: 'Kps = s·s = s²',
    solubilidad: 's = √Kps = 1,3×10⁻⁵ mol/L',
    nota: 'Precipitado blanco que se oscurece con la luz. Se disuelve en amoníaco formando el complejo [Ag(NH₃)₂]⁺.',
    busqueda: 'cloruro de plata AgCl kps producto de solubilidad blanco precipitado',
  },
  {
    id: 'agbr',
    formula: 'AgBr',
    nombre: 'Bromuro de plata',
    kps: '5,4×10⁻¹³',
    disolucion: 'AgBr(s) ⇌ Ag⁺(ac) + Br⁻(ac)',
    expresion: 'Kps = [Ag⁺]·[Br⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 7,3×10⁻⁷ mol/L',
    nota: 'Base de la fotografía química clásica: la luz lo descompone en plata metálica.',
    busqueda: 'bromuro de plata AgBr kps fotografia amarillo palido',
  },
  {
    id: 'agi',
    formula: 'AgI',
    nombre: 'Yoduro de plata',
    kps: '8,5×10⁻¹⁷',
    disolucion: 'AgI(s) ⇌ Ag⁺(ac) + I⁻(ac)',
    expresion: 'Kps = [Ag⁺]·[I⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 9,2×10⁻⁹ mol/L',
    nota: 'El menos soluble de los tres halogenuros de plata. Se usa en la siembra de nubes por su estructura parecida al hielo.',
    busqueda: 'yoduro de plata AgI kps amarillo siembra de nubes insoluble',
  },
  {
    id: 'ag2cro4',
    formula: 'Ag₂CrO₄',
    nombre: 'Cromato de plata',
    kps: '1,1×10⁻¹²',
    disolucion: 'Ag₂CrO₄(s) ⇌ 2 Ag⁺(ac) + CrO₄²⁻(ac)',
    expresion: 'Kps = [Ag⁺]²·[CrO₄²⁻]',
    relacion: 'Kps = (2s)²·s = 4s³',
    solubilidad: 's = ∛(Kps/4) = 6,5×10⁻⁵ mol/L',
    nota: 'Ojo al comparar: su Kps es menor que el del AgCl, pero es más soluble. La estequiometría 2:1 cambia por completo el cálculo.',
    busqueda: 'cromato de plata Ag2CrO4 kps rojo ladrillo Mohr estequiometria comparar',
  },
  {
    id: 'ag2s',
    formula: 'Ag₂S',
    nombre: 'Sulfuro de plata',
    kps: '≈ 8×10⁻⁵¹',
    disolucion: 'Ag₂S(s) ⇌ 2 Ag⁺(ac) + S²⁻(ac)',
    expresion: 'Kps = [Ag⁺]²·[S²⁻]',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) ≈ 1×10⁻¹⁷ mol/L',
    nota: 'Orden de magnitud aproximado: las fuentes dan valores entre 10⁻⁵⁰ y 10⁻⁵² según cómo se defina el equilibrio del sulfuro. Es el ennegrecimiento de la plata.',
    busqueda: 'sulfuro de plata Ag2S kps negro plata ennegrecida orden de magnitud',
  },
  {
    id: 'baso4',
    formula: 'BaSO₄',
    nombre: 'Sulfato de bario',
    kps: '1,1×10⁻¹⁰',
    disolucion: 'BaSO₄(s) ⇌ Ba²⁺(ac) + SO₄²⁻(ac)',
    expresion: 'Kps = [Ba²⁺]·[SO₄²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 1,0×10⁻⁵ mol/L',
    nota: 'Tan insoluble que se toma como papilla de contraste radiológico, pese a que el ion bario libre es tóxico.',
    busqueda: 'sulfato de bario BaSO4 kps contraste radiologico blanco insoluble',
  },
  {
    id: 'baco3',
    formula: 'BaCO₃',
    nombre: 'Carbonato de bario',
    kps: '5,0×10⁻⁹',
    disolucion: 'BaCO₃(s) ⇌ Ba²⁺(ac) + CO₃²⁻(ac)',
    expresion: 'Kps = [Ba²⁺]·[CO₃²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 7,1×10⁻⁵ mol/L',
    nota: 'Se disuelve con ácidos desprendiendo CO₂, a diferencia del BaSO₄, que resiste.',
    busqueda: 'carbonato de bario BaCO3 kps insoluble acido CO2',
  },
  {
    id: 'caco3',
    formula: 'CaCO₃',
    nombre: 'Carbonato de calcio',
    kps: '3,4×10⁻⁹',
    disolucion: 'CaCO₃(s) ⇌ Ca²⁺(ac) + CO₃²⁻(ac)',
    expresion: 'Kps = [Ca²⁺]·[CO₃²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 5,8×10⁻⁵ mol/L',
    nota: 'Valor de la calcita a 25 °C; el aragonito, otra forma cristalina, tiene un Kps algo mayor. Caliza, mármol, conchas y cáscaras de huevo.',
    busqueda: 'carbonato de calcio CaCO3 kps caliza marmol calcita aragonito cal',
  },
  {
    id: 'caf2',
    formula: 'CaF₂',
    nombre: 'Fluoruro de calcio',
    kps: '3,9×10⁻¹¹',
    disolucion: 'CaF₂(s) ⇌ Ca²⁺(ac) + 2 F⁻(ac)',
    expresion: 'Kps = [Ca²⁺]·[F⁻]²',
    relacion: 'Kps = s·(2s)² = 4s³',
    solubilidad: 's = ∛(Kps/4) = 2,1×10⁻⁴ mol/L',
    nota: 'La fluorita mineral. Su baja solubilidad explica el efecto protector del flúor sobre el esmalte dental.',
    busqueda: 'fluoruro de calcio CaF2 kps fluorita esmalte dental fluor',
  },
  {
    id: 'caoh2',
    formula: 'Ca(OH)₂',
    nombre: 'Hidróxido de calcio',
    kps: '5,0×10⁻⁶',
    disolucion: 'Ca(OH)₂(s) ⇌ Ca²⁺(ac) + 2 OH⁻(ac)',
    expresion: 'Kps = [Ca²⁺]·[OH⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 1,1×10⁻² mol/L',
    nota: 'El agua de cal. Es el «insoluble» más soluble de la tabla: su disolución saturada ya tiene pH próximo a 12,4.',
    busqueda: 'hidroxido de calcio Ca(OH)2 kps agua de cal pH basico poco soluble',
  },
  {
    id: 'caso4',
    formula: 'CaSO₄',
    nombre: 'Sulfato de calcio',
    kps: '4,9×10⁻⁵',
    disolucion: 'CaSO₄(s) ⇌ Ca²⁺(ac) + SO₄²⁻(ac)',
    expresion: 'Kps = [Ca²⁺]·[SO₄²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 7,0×10⁻³ mol/L',
    nota: 'El yeso. Con solo 7 mmol/L es el caso típico de «poco soluble»: se nota turbidez pero no es un precipitado limpio.',
    busqueda: 'sulfato de calcio CaSO4 kps yeso poco soluble dureza del agua',
  },
  {
    id: 'cus',
    formula: 'CuS',
    nombre: 'Sulfuro de cobre(II)',
    kps: '≈ 8×10⁻³⁷',
    disolucion: 'CuS(s) ⇌ Cu²⁺(ac) + S²⁻(ac)',
    expresion: 'Kps = [Cu²⁺]·[S²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps ≈ 9×10⁻¹⁹ mol/L',
    nota: 'Orden de magnitud: las tablas dan entre 10⁻³⁶ y 10⁻⁴⁵ según el convenio para el equilibrio del S²⁻. Lo relevante es que precipita cuantitativamente.',
    busqueda: 'sulfuro de cobre CuS kps negro insoluble orden de magnitud marcha analitica',
  },
  {
    id: 'cuoh2',
    formula: 'Cu(OH)₂',
    nombre: 'Hidróxido de cobre(II)',
    kps: '2,2×10⁻²⁰',
    disolucion: 'Cu(OH)₂(s) ⇌ Cu²⁺(ac) + 2 OH⁻(ac)',
    expresion: 'Kps = [Cu²⁺]·[OH⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 1,8×10⁻⁷ mol/L',
    nota: 'Precipitado azul gelatinoso. Con exceso de amoníaco se redisuelve dando el intenso azul del [Cu(NH₃)₄]²⁺.',
    busqueda: 'hidroxido de cobre Cu(OH)2 kps azul gelatinoso amoniaco complejo',
  },
  {
    id: 'feoh2',
    formula: 'Fe(OH)₂',
    nombre: 'Hidróxido de hierro(II)',
    kps: '4,9×10⁻¹⁷',
    disolucion: 'Fe(OH)₂(s) ⇌ Fe²⁺(ac) + 2 OH⁻(ac)',
    expresion: 'Kps = [Fe²⁺]·[OH⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 2,3×10⁻⁶ mol/L',
    nota: 'Verde pálido, se oxida al aire con rapidez pasando a Fe(OH)₃ pardo.',
    busqueda: 'hidroxido de hierro II Fe(OH)2 kps verde oxidacion',
  },
  {
    id: 'feoh3',
    formula: 'Fe(OH)₃',
    nombre: 'Hidróxido de hierro(III)',
    kps: '2,8×10⁻³⁹',
    disolucion: 'Fe(OH)₃(s) ⇌ Fe³⁺(ac) + 3 OH⁻(ac)',
    expresion: 'Kps = [Fe³⁺]·[OH⁻]³',
    relacion: 'Kps = s·(3s)³ = 27s⁴',
    solubilidad: 's = ⁴√(Kps/27) = 1,0×10⁻¹⁰ mol/L',
    nota: 'Precipitado pardo-rojizo gelatinoso. Precipita ya en medio ligeramente ácido, hacia pH 3: por eso el hierro(III) se separa fácilmente del hierro(II).',
    busqueda: 'hidroxido de hierro III Fe(OH)3 kps pardo herrumbre pH 3 raiz cuarta',
  },
  {
    id: 'mgoh2',
    formula: 'Mg(OH)₂',
    nombre: 'Hidróxido de magnesio',
    kps: '5,6×10⁻¹²',
    disolucion: 'Mg(OH)₂(s) ⇌ Mg²⁺(ac) + 2 OH⁻(ac)',
    expresion: 'Kps = [Mg²⁺]·[OH⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 1,1×10⁻⁴ mol/L',
    nota: 'La leche de magnesia: poco soluble, por eso actúa como antiácido de acción sostenida sin subir demasiado el pH.',
    busqueda: 'hidroxido de magnesio Mg(OH)2 kps leche de magnesia antiacido blanco',
  },
  {
    id: 'mgco3',
    formula: 'MgCO₃',
    nombre: 'Carbonato de magnesio',
    kps: '6,8×10⁻⁶',
    disolucion: 'MgCO₃(s) ⇌ Mg²⁺(ac) + CO₃²⁻(ac)',
    expresion: 'Kps = [Mg²⁺]·[CO₃²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 2,6×10⁻³ mol/L',
    nota: 'Bastante más soluble que el carbonato de calcio, lo que permite separarlos por precipitación fraccionada.',
    busqueda: 'carbonato de magnesio MgCO3 kps magnesita tiza gimnasia',
  },
  {
    id: 'pbcl2',
    formula: 'PbCl₂',
    nombre: 'Cloruro de plomo(II)',
    kps: '1,7×10⁻⁵',
    disolucion: 'PbCl₂(s) ⇌ Pb²⁺(ac) + 2 Cl⁻(ac)',
    expresion: 'Kps = [Pb²⁺]·[Cl⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 1,6×10⁻² mol/L',
    nota: 'Poco soluble en frío y bastante soluble en agua caliente. Ese contraste se usaba para separarlo de AgCl y Hg₂Cl₂.',
    busqueda: 'cloruro de plomo PbCl2 kps poco soluble caliente frio separacion',
  },
  {
    id: 'pbi2',
    formula: 'PbI₂',
    nombre: 'Yoduro de plomo(II)',
    kps: '9,8×10⁻⁹',
    disolucion: 'PbI₂(s) ⇌ Pb²⁺(ac) + 2 I⁻(ac)',
    expresion: 'Kps = [Pb²⁺]·[I⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 1,3×10⁻³ mol/L',
    nota: 'El precipitado amarillo brillante de la «lluvia de oro»: al recristalizar en caliente forma láminas doradas.',
    busqueda: 'yoduro de plomo PbI2 kps amarillo lluvia de oro experimento',
  },
  {
    id: 'pbso4',
    formula: 'PbSO₄',
    nombre: 'Sulfato de plomo(II)',
    kps: '2,5×10⁻⁸',
    disolucion: 'PbSO₄(s) ⇌ Pb²⁺(ac) + SO₄²⁻(ac)',
    expresion: 'Kps = [Pb²⁺]·[SO₄²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 1,6×10⁻⁴ mol/L',
    nota: 'Se deposita sobre las placas de una batería de plomo descargada; al recargarla vuelve a convertirse en plomo y óxido de plomo.',
    busqueda: 'sulfato de plomo PbSO4 kps bateria acumulador sulfatacion',
  },
  {
    id: 'pbcro4',
    formula: 'PbCrO₄',
    nombre: 'Cromato de plomo(II)',
    kps: '2,8×10⁻¹³',
    disolucion: 'PbCrO₄(s) ⇌ Pb²⁺(ac) + CrO₄²⁻(ac)',
    expresion: 'Kps = [Pb²⁺]·[CrO₄²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 5,3×10⁻⁷ mol/L',
    nota: 'El «amarillo de cromo» de la pintura clásica, hoy retirado del uso general por la toxicidad del plomo y del cromo(VI).',
    busqueda: 'cromato de plomo PbCrO4 kps amarillo de cromo pigmento toxico',
  },
  {
    id: 'srso4',
    formula: 'SrSO₄',
    nombre: 'Sulfato de estroncio',
    kps: '3,4×10⁻⁷',
    disolucion: 'SrSO₄(s) ⇌ Sr²⁺(ac) + SO₄²⁻(ac)',
    expresion: 'Kps = [Sr²⁺]·[SO₄²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 5,8×10⁻⁴ mol/L',
    nota: 'Intermedio entre el CaSO₄ (poco soluble) y el BaSO₄ (muy insoluble): la solubilidad de los sulfatos baja al descender en el grupo 2.',
    busqueda: 'sulfato de estroncio SrSO4 kps celestina grupo 2 tendencia',
  },
  {
    id: 'zns',
    formula: 'ZnS',
    nombre: 'Sulfuro de cinc',
    kps: '≈ 1,6×10⁻²⁴',
    disolucion: 'ZnS(s) ⇌ Zn²⁺(ac) + S²⁻(ac)',
    expresion: 'Kps = [Zn²⁺]·[S²⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps ≈ 1,3×10⁻¹² mol/L',
    nota: 'Orden de magnitud 10⁻²⁴; la variedad wurtzita y la esfalerita tienen valores algo distintos. Es el mineral principal de cinc.',
    busqueda: 'sulfuro de cinc zinc ZnS kps esfalerita blenda blanco fosforescente',
  },
  {
    id: 'aloh3',
    formula: 'Al(OH)₃',
    nombre: 'Hidróxido de aluminio',
    kps: '≈ 3×10⁻³⁴',
    disolucion: 'Al(OH)₃(s) ⇌ Al³⁺(ac) + 3 OH⁻(ac)',
    expresion: 'Kps = [Al³⁺]·[OH⁻]³',
    relacion: 'Kps = 27s⁴',
    solubilidad: 's = ⁴√(Kps/27) ≈ 1,8×10⁻⁹ mol/L',
    nota: 'Anfótero: precipita con poca base y se redisuelve con exceso formando [Al(OH)₄]⁻. Por eso el Kps solo describe una parte del comportamiento real.',
    busqueda: 'hidroxido de aluminio Al(OH)3 kps anfotero gelatinoso antiacido floculante',
  },
  {
    id: 'agscn',
    formula: 'AgSCN',
    nombre: 'Tiocianato de plata',
    kps: '1,0×10⁻¹²',
    disolucion: 'AgSCN(s) ⇌ Ag⁺(ac) + SCN⁻(ac)',
    expresion: 'Kps = [Ag⁺]·[SCN⁻]',
    relacion: 'Kps = s²',
    solubilidad: 's = √Kps = 1,0×10⁻⁶ mol/L',
    nota: 'Base del método de Volhard: se valora la plata sobrante con tiocianato usando Fe³⁺ como indicador.',
    busqueda: 'tiocianato de plata AgSCN kps Volhard valoracion argentometria',
  },
  {
    id: 'hg2cl2',
    formula: 'Hg₂Cl₂',
    nombre: 'Cloruro de mercurio(I)',
    kps: '1,4×10⁻¹⁸',
    disolucion: 'Hg₂Cl₂(s) ⇌ Hg₂²⁺(ac) + 2 Cl⁻(ac)',
    expresion: 'Kps = [Hg₂²⁺]·[Cl⁻]²',
    relacion: 'Kps = 4s³',
    solubilidad: 's = ∛(Kps/4) = 7,0×10⁻⁷ mol/L',
    nota: 'El calomelanos. El mercurio(I) existe como ion diatómico Hg₂²⁺, con enlace Hg–Hg: nunca como Hg⁺ suelto.',
    busqueda: 'cloruro de mercurio I Hg2Cl2 calomelanos kps electrodo referencia diatomico',
  },
];

/* ────────────────────────────────────────────────────────────────
   Comprobador de precipitación
──────────────────────────────────────────────────────────────── */

interface IonComprobador {
  id: string;
  /** Fórmula sin la carga, tal como aparece en el compuesto */
  base: string;
  /** Fórmula con la carga, para las ecuaciones iónicas */
  ion: string;
  nombre: string;
  /** Valor absoluto de la carga */
  carga: number;
  /** Si es poliatómico necesita paréntesis cuando lleva subíndice */
  poli: boolean;
}

const CATIONES: IonComprobador[] = [
  { id: 'Li', base: 'Li', ion: 'Li⁺', nombre: 'Litio', carga: 1, poli: false },
  { id: 'Na', base: 'Na', ion: 'Na⁺', nombre: 'Sodio', carga: 1, poli: false },
  { id: 'K', base: 'K', ion: 'K⁺', nombre: 'Potasio', carga: 1, poli: false },
  { id: 'Rb', base: 'Rb', ion: 'Rb⁺', nombre: 'Rubidio', carga: 1, poli: false },
  { id: 'Cs', base: 'Cs', ion: 'Cs⁺', nombre: 'Cesio', carga: 1, poli: false },
  { id: 'NH4', base: 'NH₄', ion: 'NH₄⁺', nombre: 'Amonio', carga: 1, poli: true },
  { id: 'Mg', base: 'Mg', ion: 'Mg²⁺', nombre: 'Magnesio', carga: 2, poli: false },
  { id: 'Ca', base: 'Ca', ion: 'Ca²⁺', nombre: 'Calcio', carga: 2, poli: false },
  { id: 'Sr', base: 'Sr', ion: 'Sr²⁺', nombre: 'Estroncio', carga: 2, poli: false },
  { id: 'Ba', base: 'Ba', ion: 'Ba²⁺', nombre: 'Bario', carga: 2, poli: false },
  { id: 'Al', base: 'Al', ion: 'Al³⁺', nombre: 'Aluminio', carga: 3, poli: false },
  { id: 'Fe2', base: 'Fe', ion: 'Fe²⁺', nombre: 'Hierro(II)', carga: 2, poli: false },
  { id: 'Fe3', base: 'Fe', ion: 'Fe³⁺', nombre: 'Hierro(III)', carga: 3, poli: false },
  { id: 'Cr3', base: 'Cr', ion: 'Cr³⁺', nombre: 'Cromo(III)', carga: 3, poli: false },
  { id: 'Mn', base: 'Mn', ion: 'Mn²⁺', nombre: 'Manganeso(II)', carga: 2, poli: false },
  { id: 'Co', base: 'Co', ion: 'Co²⁺', nombre: 'Cobalto(II)', carga: 2, poli: false },
  { id: 'Ni', base: 'Ni', ion: 'Ni²⁺', nombre: 'Níquel(II)', carga: 2, poli: false },
  { id: 'Cu', base: 'Cu', ion: 'Cu²⁺', nombre: 'Cobre(II)', carga: 2, poli: false },
  { id: 'Zn', base: 'Zn', ion: 'Zn²⁺', nombre: 'Cinc', carga: 2, poli: false },
  { id: 'Ag', base: 'Ag', ion: 'Ag⁺', nombre: 'Plata', carga: 1, poli: false },
  { id: 'Pb', base: 'Pb', ion: 'Pb²⁺', nombre: 'Plomo(II)', carga: 2, poli: false },
  { id: 'Hg2', base: 'Hg₂', ion: 'Hg₂²⁺', nombre: 'Mercurio(I)', carga: 2, poli: true },
];

const ANIONES: IonComprobador[] = [
  { id: 'NO3', base: 'NO₃', ion: 'NO₃⁻', nombre: 'Nitrato', carga: 1, poli: true },
  { id: 'NO2', base: 'NO₂', ion: 'NO₂⁻', nombre: 'Nitrito', carga: 1, poli: true },
  { id: 'CH3COO', base: 'CH₃COO', ion: 'CH₃COO⁻', nombre: 'Acetato', carga: 1, poli: true },
  { id: 'ClO3', base: 'ClO₃', ion: 'ClO₃⁻', nombre: 'Clorato', carga: 1, poli: true },
  { id: 'ClO4', base: 'ClO₄', ion: 'ClO₄⁻', nombre: 'Perclorato', carga: 1, poli: true },
  { id: 'MnO4', base: 'MnO₄', ion: 'MnO₄⁻', nombre: 'Permanganato', carga: 1, poli: true },
  { id: 'HCO3', base: 'HCO₃', ion: 'HCO₃⁻', nombre: 'Hidrogenocarbonato', carga: 1, poli: true },
  { id: 'Cl', base: 'Cl', ion: 'Cl⁻', nombre: 'Cloruro', carga: 1, poli: false },
  { id: 'Br', base: 'Br', ion: 'Br⁻', nombre: 'Bromuro', carga: 1, poli: false },
  { id: 'I', base: 'I', ion: 'I⁻', nombre: 'Yoduro', carga: 1, poli: false },
  { id: 'F', base: 'F', ion: 'F⁻', nombre: 'Fluoruro', carga: 1, poli: false },
  { id: 'OH', base: 'OH', ion: 'OH⁻', nombre: 'Hidróxido', carga: 1, poli: true },
  { id: 'SCN', base: 'SCN', ion: 'SCN⁻', nombre: 'Tiocianato', carga: 1, poli: true },
  { id: 'SO4', base: 'SO₄', ion: 'SO₄²⁻', nombre: 'Sulfato', carga: 2, poli: true },
  { id: 'SO3', base: 'SO₃', ion: 'SO₃²⁻', nombre: 'Sulfito', carga: 2, poli: true },
  { id: 'CO3', base: 'CO₃', ion: 'CO₃²⁻', nombre: 'Carbonato', carga: 2, poli: true },
  { id: 'CrO4', base: 'CrO₄', ion: 'CrO₄²⁻', nombre: 'Cromato', carga: 2, poli: true },
  { id: 'Cr2O7', base: 'Cr₂O₇', ion: 'Cr₂O₇²⁻', nombre: 'Dicromato', carga: 2, poli: true },
  { id: 'C2O4', base: 'C₂O₄', ion: 'C₂O₄²⁻', nombre: 'Oxalato', carga: 2, poli: true },
  { id: 'SiO3', base: 'SiO₃', ion: 'SiO₃²⁻', nombre: 'Silicato', carga: 2, poli: true },
  { id: 'S', base: 'S', ion: 'S²⁻', nombre: 'Sulfuro', carga: 2, poli: false },
  { id: 'PO4', base: 'PO₄', ion: 'PO₄³⁻', nombre: 'Fosfato', carga: 3, poli: true },
];

const CATIONES_ALCALINOS = ['Li', 'Na', 'K', 'Rb', 'Cs', 'NH4'];
const ANIONES_SIEMPRE_SOLUBLES = ['NO3', 'NO2', 'CH3COO', 'ClO3', 'ClO4', 'MnO4', 'HCO3', 'Cr2O7'];
const HALOGENUROS = ['Cl', 'Br', 'I'];
const ANIONES_INSOLUBLES = ['CO3', 'PO4', 'CrO4', 'S', 'OH', 'SO3', 'C2O4', 'F', 'SiO3', 'SCN'];

interface Veredicto {
  estado: Estado;
  regla: string;
}

/** Excepciones concretas: se comprueban antes que cualquier regla general. */
const EXCEPCIONES: Record<string, Veredicto> = {
  'Ag|Cl': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: los de plata, plomo(II) y mercurio(I) no se disuelven. AgCl es el precipitado blanco de la prueba del cloruro (Kps 1,8×10⁻¹⁰).',
  },
  'Ag|Br': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: AgBr es insoluble (Kps 5,4×10⁻¹³) y da un precipitado amarillo pálido.',
  },
  'Ag|I': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: AgI es el menos soluble de los tres (Kps 8,5×10⁻¹⁷), de color amarillo.',
  },
  'Pb|Cl': {
    estado: 'poco',
    regla: 'Excepción de los halogenuros: PbCl₂ es poco soluble en frío (Kps 1,7×10⁻⁵) y se disuelve en agua caliente.',
  },
  'Pb|Br': {
    estado: 'poco',
    regla: 'Excepción de los halogenuros: PbBr₂ es poco soluble en frío y bastante soluble en caliente.',
  },
  'Pb|I': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: PbI₂ es insoluble (Kps 9,8×10⁻⁹) y da el precipitado amarillo de la «lluvia de oro».',
  },
  'Hg2|Cl': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: Hg₂Cl₂ (calomelanos) es insoluble, Kps 1,4×10⁻¹⁸.',
  },
  'Hg2|Br': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: los de mercurio(I) son insolubles.',
  },
  'Hg2|I': {
    estado: 'insoluble',
    regla: 'Excepción de los halogenuros: los de mercurio(I) son insolubles.',
  },
  'Ba|SO4': {
    estado: 'insoluble',
    regla: 'Excepción de los sulfatos: BaSO₄ es insoluble (Kps 1,1×10⁻¹⁰). Es la prueba analítica del ion sulfato.',
  },
  'Sr|SO4': {
    estado: 'insoluble',
    regla: 'Excepción de los sulfatos: SrSO₄ es insoluble (Kps 3,4×10⁻⁷).',
  },
  'Pb|SO4': {
    estado: 'insoluble',
    regla: 'Excepción de los sulfatos: PbSO₄ es insoluble (Kps 2,5×10⁻⁸).',
  },
  'Hg2|SO4': {
    estado: 'insoluble',
    regla: 'Excepción de los sulfatos: Hg₂SO₄ es insoluble.',
  },
  'Ca|SO4': {
    estado: 'poco',
    regla: 'Excepción de los sulfatos: CaSO₄, el yeso, es poco soluble (Kps 4,9×10⁻⁵). Enturbia la disolución sin precipitar del todo.',
  },
  'Ag|SO4': {
    estado: 'poco',
    regla: 'Excepción de los sulfatos: Ag₂SO₄ es poco soluble (Kps ≈ 1,2×10⁻⁵).',
  },
  'Ba|OH': {
    estado: 'soluble',
    regla: 'Excepción de los hidróxidos: Ba(OH)₂ sí es soluble, lo que permite usarlo como base fuerte en disolución.',
  },
  'Sr|OH': {
    estado: 'poco',
    regla: 'Excepción de los hidróxidos: Sr(OH)₂ es parcialmente soluble; la solubilidad de los hidróxidos del grupo 2 aumenta al bajar en el grupo.',
  },
  'Ca|OH': {
    estado: 'poco',
    regla: 'Excepción de los hidróxidos: Ca(OH)₂ es parcialmente soluble (Kps 5,0×10⁻⁶). Su disolución saturada es el agua de cal.',
  },
  'Ag|OH': {
    estado: 'insoluble',
    regla: 'Los hidróxidos son insolubles. El AgOH además no es estable: se deshidrata y precipita como Ag₂O, de color pardo.',
  },
  'Ba|S': {
    estado: 'soluble',
    regla: 'Excepción de los sulfuros: los de alcalinotérreos se disuelven, aunque hidrolizándose y liberando HS⁻ y OH⁻.',
  },
  'Sr|S': {
    estado: 'soluble',
    regla: 'Excepción de los sulfuros: los de alcalinotérreos se disuelven con hidrólisis.',
  },
  'Ca|S': {
    estado: 'soluble',
    regla: 'Excepción de los sulfuros: los de alcalinotérreos se disuelven con hidrólisis.',
  },
  'Ag|CH3COO': {
    estado: 'poco',
    regla: 'Excepción de los acetatos: el acetato de plata es poco soluble (Kps ≈ 1,9×10⁻³).',
  },
  'Ag|NO2': {
    estado: 'poco',
    regla: 'Excepción de los nitritos: AgNO₂ es poco soluble.',
  },
  'K|ClO4': {
    estado: 'poco',
    regla: 'Excepción de los percloratos: KClO₄ es poco soluble (Kps ≈ 1,05×10⁻²), igual que los de rubidio y cesio.',
  },
  'Rb|ClO4': {
    estado: 'poco',
    regla: 'Excepción de los percloratos: RbClO₄ es poco soluble, como el de potasio.',
  },
  'Cs|ClO4': {
    estado: 'poco',
    regla: 'Excepción de los percloratos: CsClO₄ es poco soluble, como el de potasio.',
  },
  'Li|CO3': {
    estado: 'poco',
    regla: 'Excepción de los alcalinos: Li₂CO₃ es solo poco soluble (unos 13 g/L). El litio, muy pequeño, se aparta del comportamiento del resto del grupo 1.',
  },
  'Li|F': {
    estado: 'poco',
    regla: 'Excepción de los alcalinos: LiF es poco soluble, otra anomalía del litio por su tamaño reducido.',
  },
  'Li|PO4': {
    estado: 'insoluble',
    regla: 'Excepción de los alcalinos: Li₃PO₄ es prácticamente insoluble, a diferencia del fosfato de sodio o de potasio.',
  },
  'Ag|F': {
    estado: 'soluble',
    regla: 'Excepción de los fluoruros: AgF sí es soluble, justo al revés que AgCl, AgBr y AgI.',
  },
  'Mg|CrO4': {
    estado: 'soluble',
    regla: 'Excepción de los cromatos: MgCrO₄ es soluble.',
  },
  'Ca|CrO4': {
    estado: 'poco',
    regla: 'Excepción de los cromatos: CaCrO₄ es solo poco soluble.',
  },
  'Ag|Cr2O7': {
    estado: 'poco',
    regla: 'Excepción de los dicromatos: Ag₂Cr₂O₇ es poco soluble.',
  },
  'Ag|SCN': {
    estado: 'insoluble',
    regla: 'AgSCN es insoluble (Kps 1,0×10⁻¹²): es la base del método de Volhard para valorar plata.',
  },
};

/** Decide el estado de solubilidad de la combinación catión + anión. */
function resolverSolubilidad(cation: IonComprobador, anion: IonComprobador): Veredicto {
  const excepcion = EXCEPCIONES[`${cation.id}|${anion.id}`];
  if (excepcion) return excepcion;

  if (CATIONES_ALCALINOS.includes(cation.id)) {
    return {
      estado: 'soluble',
      regla: 'Todas las sales de los metales alcalinos (Li⁺, Na⁺, K⁺, Rb⁺, Cs⁺) y del ion amonio son solubles en agua. Esta regla se impone sobre la del anión.',
    };
  }

  if (ANIONES_SIEMPRE_SOLUBLES.includes(anion.id)) {
    return {
      estado: 'soluble',
      regla: 'Los nitratos, nitritos, acetatos, cloratos, percloratos, permanganatos, hidrogenocarbonatos y dicromatos son solubles en agua.',
    };
  }

  if (HALOGENUROS.includes(anion.id)) {
    return {
      estado: 'soluble',
      regla: 'Los cloruros, bromuros y yoduros son solubles salvo los de Ag⁺, Pb²⁺ y Hg₂²⁺, que aquí no intervienen.',
    };
  }

  if (anion.id === 'SO4') {
    return {
      estado: 'soluble',
      regla: 'Los sulfatos son solubles salvo los de Ba²⁺, Sr²⁺, Pb²⁺ y Hg₂²⁺ (insolubles) y los de Ca²⁺ y Ag⁺ (poco solubles). Este catión no está en la lista.',
    };
  }

  if (ANIONES_INSOLUBLES.includes(anion.id)) {
    return {
      estado: 'insoluble',
      regla: 'Los carbonatos, fosfatos, cromatos, sulfuros, sulfitos, oxalatos, fluoruros, silicatos e hidróxidos son insolubles, salvo los de metales alcalinos y amonio. Este catión no es ninguno de ellos, así que precipita.',
    };
  }

  return {
    estado: 'soluble',
    regla: 'No hay ninguna regla que obligue a precipitar: la sal permanece disuelta.',
  };
}

/** Construye la fórmula del compuesto cruzando las cargas y simplificando. */
function formulaCompuesto(cation: IonComprobador, anion: IonComprobador): string {
  const divisor = mcd(cation.carga, anion.carga);
  const nCation = anion.carga / divisor;
  const nAnion = cation.carga / divisor;

  const parte = (ion: IonComprobador, n: number): string => {
    if (n === 1) return ion.base;
    return ion.poli ? `(${ion.base})${sub(n)}` : `${ion.base}${sub(n)}`;
  };

  return `${parte(cation, nCation)}${parte(anion, nAnion)}`;
}

/** Coeficientes de la fórmula, para escribir la ecuación iónica neta. */
function subindices(cation: IonComprobador, anion: IonComprobador): [number, number] {
  const divisor = mcd(cation.carga, anion.carga);
  return [anion.carga / divisor, cation.carga / divisor];
}

/** Ecuación iónica neta de la precipitación. */
function ecuacionIonicaNeta(cation: IonComprobador, anion: IonComprobador): string {
  const [nCation, nAnion] = subindices(cation, anion);
  const coefC = nCation > 1 ? `${nCation} ` : '';
  const coefA = nAnion > 1 ? `${nAnion} ` : '';
  return `${coefC}${cation.ion} + ${coefA}${anion.ion} → ${formulaCompuesto(cation, anion)}(s)↓`;
}

/**
 * Ecuación molecular usando el nitrato del catión y la sal de sodio del anión,
 * dos reactivos siempre solubles. Los coeficientes salen de cruzar las cargas.
 */
function ecuacionMolecular(cation: IonComprobador, anion: IonComprobador): string {
  const [p, q] = subindices(cation, anion);

  // El catión siempre lleva subíndice 1 en su nitrato, así que nunca necesita paréntesis
  const nitrato =
    cation.carga === 1 ? `${cation.base}NO₃` : `${cation.base}(NO₃)${sub(cation.carga)}`;

  const salSodio = anion.carga === 1 ? `Na${anion.base}` : `Na${sub(anion.carga)}${anion.base}`;

  const coefNitrato = p > 1 ? `${p} ` : '';
  const coefSodio = q > 1 ? `${q} ` : '';
  const nNaNO3 = p * cation.carga;
  const coefNaNO3 = nNaNO3 > 1 ? `${nNaNO3} ` : '';

  return `${coefNitrato}${nitrato}(ac) + ${coefSodio}${salSodio}(ac) → ${formulaCompuesto(
    cation,
    anion,
  )}(s)↓ + ${coefNaNO3}NaNO₃(ac)`;
}

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

const TOTAL_FICHAS = REGLAS.length + IONES.length + KPS.length;

export default function TablaSolubilidadPage() {
  const [consulta, setConsulta] = useState('');
  const [bloqueActivo, setBloqueActivo] = useState<BloqueId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const [cationId, setCationId] = useState('Ag');
  const [anionId, setAnionId] = useState('Cl');
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega con un ejercicio delante escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const cationSeleccionado = CATIONES.find((c) => c.id === cationId) ?? CATIONES[0];
  const anionSeleccionado = ANIONES.find((a) => a.id === anionId) ?? ANIONES[0];

  const comprobacion = useMemo(() => {
    const veredicto = resolverSolubilidad(cationSeleccionado, anionSeleccionado);
    return {
      ...veredicto,
      formula: formulaCompuesto(cationSeleccionado, anionSeleccionado),
      ionicaNeta: ecuacionIonicaNeta(cationSeleccionado, anionSeleccionado),
      molecular: ecuacionMolecular(cationSeleccionado, anionSeleccionado),
    };
  }, [cationSeleccionado, anionSeleccionado]);

  const termino = normalizar(consulta.trim());

  const reglasFiltradas = useMemo(() => {
    if (bloqueActivo !== 'todas' && bloqueActivo !== 'reglas') return [];
    return REGLAS.filter((regla) =>
      termino === ''
        ? true
        : normalizar(`${regla.titulo} ${regla.ion} ${regla.ejemplos} ${regla.busqueda}`).includes(
            termino,
          ),
    );
  }, [termino, bloqueActivo]);

  const ionesFiltrados = useMemo(() => {
    if (bloqueActivo !== 'todas' && bloqueActivo !== 'iones') return [];
    return IONES.filter((ion) =>
      termino === ''
        ? true
        : normalizar(
            `${ion.formula} ${ion.nombreIupac} ${ion.nombreTradicional} ${ion.busqueda}`,
          ).includes(termino),
    );
  }, [termino, bloqueActivo]);

  const kpsFiltrados = useMemo(() => {
    if (bloqueActivo !== 'todas' && bloqueActivo !== 'kps') return [];
    return KPS.filter((compuesto) =>
      termino === ''
        ? true
        : normalizar(
            `${compuesto.formula} ${compuesto.nombre} ${compuesto.busqueda}`,
          ).includes(termino),
    );
  }, [termino, bloqueActivo]);

  const totalResultados =
    reglasFiltradas.length + ionesFiltrados.length + kpsFiltrados.length;

  const alternarFila = (id: string) => {
    setAbiertas((previas) =>
      previas.includes(id) ? previas.filter((item) => item !== id) : [...previas, id],
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">💧</span> Tabla de Solubilidad e Iones Poliatómicos
        </h1>
        <p className={styles.subtitle}>
          Reglas de solubilidad en agua con todas sus excepciones, {IONES.length} iones
          poliatómicos con nombre IUPAC y tradicional, y {KPS.length} valores de Kps a 25 °C.
          Además, un comprobador que combina cualquier catión con cualquier anión y te dice si
          precipita.
        </p>
      </header>

      <LegalNotice />

      {/* Comprobador de precipitación */}
      <section className={styles.comprobador} aria-labelledby="titulo-comprobador">
        <h2 id="titulo-comprobador" className={styles.comprobadorTitulo}>
          <span aria-hidden="true">🧪</span> Comprobador de precipitación
        </h2>
        <p className={styles.comprobadorIntro}>
          Elige un catión y un anión: la app formula el compuesto cruzando las cargas, aplica las
          reglas de solubilidad y escribe la ecuación de precipitación.
        </p>

        <div className={styles.selectores}>
          <div className={styles.selectorGrupo}>
            <label htmlFor="selector-cation">Catión</label>
            <select
              id="selector-cation"
              className={styles.selector}
              value={cationId}
              onChange={(evento) => setCationId(evento.target.value)}
            >
              {CATIONES.map((cation) => (
                <option key={cation.id} value={cation.id}>
                  {cation.nombre} — {cation.ion}
                </option>
              ))}
            </select>
          </div>

          <span className={styles.masSigno} aria-hidden="true">
            +
          </span>

          <div className={styles.selectorGrupo}>
            <label htmlFor="selector-anion">Anión</label>
            <select
              id="selector-anion"
              className={styles.selector}
              value={anionId}
              onChange={(evento) => setAnionId(evento.target.value)}
            >
              {ANIONES.map((anion) => (
                <option key={anion.id} value={anion.id}>
                  {anion.nombre} — {anion.ion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultado} role="status" aria-live="polite">
          <p className={styles.resultadoFormula}>{comprobacion.formula}</p>
          <p className={`${styles.badgeGrande} ${CLASE_ESTADO[comprobacion.estado]}`}>
            <span aria-hidden="true">{ICONO_ESTADO[comprobacion.estado]}</span>{' '}
            {ETIQUETA_ESTADO[comprobacion.estado]}
            {comprobacion.estado === 'soluble'
              ? ' — no precipita'
              : comprobacion.estado === 'poco'
                ? ' — precipita parcialmente'
                : ' — precipita'}
          </p>
          <p className={styles.resultadoRegla}>{comprobacion.regla}</p>

          {comprobacion.estado !== 'soluble' ? (
            <div className={styles.ecuaciones}>
              <div className={styles.ecuacionLinea}>
                <span className={styles.ecuacionEtq}>Molecular</span>
                <span className={styles.ecuacionTexto}>{comprobacion.molecular}</span>
              </div>
              <div className={styles.ecuacionLinea}>
                <span className={styles.ecuacionEtq}>Iónica neta</span>
                <span className={styles.ecuacionTexto}>{comprobacion.ionicaNeta}</span>
              </div>
              <p className={styles.ecuacionNota}>
                La ecuación molecular usa el nitrato del catión y la sal de sodio del anión, dos
                reactivos siempre solubles. El Na⁺ y el NO₃⁻ son iones espectadores y desaparecen
                en la ecuación iónica neta.
              </p>
            </div>
          ) : (
            <p className={styles.ecuacionNota}>
              Al mezclar dos disoluciones que contengan estos iones no se forma ningún sólido: los
              cuatro iones quedan libres en disolución y no hay ecuación iónica neta que escribir.
            </p>
          )}
        </div>
      </section>

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de la tabla de solubilidad">
        <label className={styles.buscadorLabel} htmlFor="buscador-solubilidad">
          Busca una regla, un ion o un valor de Kps
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-solubilidad"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="sulfato, nitrato, precipitado, kps, amonio, insoluble…"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.limpiarBtn}
            onClick={() => {
              setConsulta('');
              setBloqueActivo('todas');
              buscadorRef.current?.focus({ preventScroll: true });
            }}
          >
            <span aria-hidden="true">✕</span> Limpiar
          </button>
        </div>
        <p className={styles.ayudaBusqueda}>
          Funciona con acentos o sin ellos y con sinónimos: <strong>bicarbonato</strong> encuentra
          el hidrogenocarbonato, <strong>producto de solubilidad</strong> encuentra los Kps y{' '}
          <strong>precipitado</strong> encuentra las reglas.
        </p>

        <div className={styles.filtros}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${
              bloqueActivo === 'todas' ? styles.filtroBtnActivo : ''
            }`}
            aria-pressed={bloqueActivo === 'todas'}
            onClick={() => setBloqueActivo('todas')}
          >
            Todas
          </button>
          {BLOQUES.map((bloque) => (
            <button
              key={bloque.id}
              type="button"
              className={`${styles.filtroBtn} ${
                bloqueActivo === bloque.id ? styles.filtroBtnActivo : ''
              }`}
              aria-pressed={bloqueActivo === bloque.id}
              onClick={() => setBloqueActivo(bloque.id)}
            >
              <span aria-hidden="true">{bloque.icono}</span> {bloque.nombre}
            </button>
          ))}
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {totalResultados} de {TOTAL_FICHAS} fichas
        </p>
      </section>

      {/* Estado vacío */}
      {totalResultados === 0 && (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna ficha que coincida con «{consulta}».
            Prueba con <strong>carbonato</strong>, <strong>hidróxido</strong>,{' '}
            <strong>permanganato</strong>, <strong>AgCl</strong> o <strong>lluvia de oro</strong>, o
            quita el filtro de bloque.
          </p>
        </div>
      )}

      {/* Bloque 1: reglas */}
      {reglasFiltradas.length > 0 && (
        <section className={styles.bloque} aria-labelledby="titulo-reglas">
          <h2 id="titulo-reglas" className={styles.bloqueTitulo}>
            <span aria-hidden="true">💧</span> Reglas de solubilidad en agua
          </h2>
          <ul className={styles.lista}>
            {reglasFiltradas.map((regla) => {
              const abierta = abiertas.includes(regla.id);
              return (
                <li key={regla.id} className={styles.fila}>
                  <button
                    type="button"
                    className={`${styles.filaBtn} ${
                      regla.estado === 'soluble' ? styles.filaSoluble : styles.filaInsoluble
                    }`}
                    aria-expanded={abierta}
                    aria-controls={`detalle-${regla.id}`}
                    onClick={() => alternarFila(regla.id)}
                  >
                    <span className={styles.filaNombre}>
                      {regla.titulo}
                      <span className={styles.filaIon}>{regla.ion}</span>
                    </span>
                    <span className={styles.filaCentro}>
                      <span className={`${styles.badge} ${CLASE_ESTADO[regla.estado]}`}>
                        <span aria-hidden="true">{ICONO_ESTADO[regla.estado]}</span>{' '}
                        {ETIQUETA_ESTADO[regla.estado]}
                      </span>
                      <span className={styles.filaEjemplos}>{regla.ejemplos}</span>
                    </span>
                    <span className={styles.chevron} aria-hidden="true">
                      {abierta ? '▲' : '▼'}
                    </span>
                  </button>

                  {abierta && (
                    <div id={`detalle-${regla.id}`} className={styles.detalle}>
                      <p>{regla.enunciado}</p>

                      <div className={styles.excepcionesBox}>
                        <h3>
                          <span aria-hidden="true">⚠️</span> Excepciones
                        </h3>
                        <ul className={styles.bulletList}>
                          {regla.excepciones.map((excepcion) => (
                            <li key={excepcion}>{excepcion}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.reaccionBox}>
                        <h3>{regla.reaccion.titulo}</h3>
                        <div className={styles.ecuacionLinea}>
                          <span className={styles.ecuacionEtq}>Molecular</span>
                          <span className={styles.ecuacionTexto}>{regla.reaccion.molecular}</span>
                        </div>
                        <div className={styles.ecuacionLinea}>
                          <span className={styles.ecuacionEtq}>Iónica completa</span>
                          <span className={styles.ecuacionTexto}>
                            {regla.reaccion.ionicaCompleta}
                          </span>
                        </div>
                        <div className={styles.ecuacionLinea}>
                          <span className={styles.ecuacionEtq}>Iónica neta</span>
                          <span className={styles.ecuacionTexto}>{regla.reaccion.ionicaNeta}</span>
                        </div>
                        <p className={styles.ecuacionNota}>{regla.reaccion.comentario}</p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Bloque 2: iones poliatómicos */}
      {ionesFiltrados.length > 0 && (
        <section className={styles.bloque} aria-labelledby="titulo-iones">
          <h2 id="titulo-iones" className={styles.bloqueTitulo}>
            <span aria-hidden="true">⚛️</span> Iones poliatómicos
          </h2>
          <ul className={styles.lista}>
            {ionesFiltrados.map((ion) => {
              const abierta = abiertas.includes(`ion-${ion.id}`);
              return (
                <li key={ion.id} className={styles.fila}>
                  <button
                    type="button"
                    className={`${styles.filaBtn} ${styles.filaIonBtn}`}
                    aria-expanded={abierta}
                    aria-controls={`detalle-ion-${ion.id}`}
                    onClick={() => alternarFila(`ion-${ion.id}`)}
                  >
                    <span className={styles.filaFormulaIon}>
                      {ion.formula}
                      <span className={styles.filaCarga}>Carga {ion.carga}</span>
                    </span>
                    <span className={styles.filaCentro}>
                      <span className={styles.nombreIupac}>{ion.nombreIupac}</span>
                      <span className={styles.nombreTradicional}>
                        Tradicional: {ion.nombreTradicional}
                      </span>
                    </span>
                    <span className={styles.chevron} aria-hidden="true">
                      {abierta ? '▲' : '▼'}
                    </span>
                  </button>

                  {abierta && (
                    <div id={`detalle-ion-${ion.id}`} className={styles.detalle}>
                      <p>
                        <strong>Familia:</strong> {ion.familia}
                      </p>
                      <p>{ion.nota}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Bloque 3: Kps */}
      {kpsFiltrados.length > 0 && (
        <section className={styles.bloque} aria-labelledby="titulo-kps">
          <h2 id="titulo-kps" className={styles.bloqueTitulo}>
            <span aria-hidden="true">⚖️</span> Productos de solubilidad (Kps) a 25 °C
          </h2>
          <ul className={styles.lista}>
            {kpsFiltrados.map((compuesto) => {
              const abierta = abiertas.includes(`kps-${compuesto.id}`);
              return (
                <li key={compuesto.id} className={styles.fila}>
                  <button
                    type="button"
                    className={`${styles.filaBtn} ${styles.filaKpsBtn}`}
                    aria-expanded={abierta}
                    aria-controls={`detalle-kps-${compuesto.id}`}
                    onClick={() => alternarFila(`kps-${compuesto.id}`)}
                  >
                    <span className={styles.filaNombre}>
                      {compuesto.formula}
                      <span className={styles.filaIon}>{compuesto.nombre}</span>
                    </span>
                    <span className={styles.filaCentro}>
                      <span className={styles.kpsValor}>Kps = {compuesto.kps}</span>
                      <span className={styles.filaEjemplos}>{compuesto.solubilidad}</span>
                    </span>
                    <span className={styles.chevron} aria-hidden="true">
                      {abierta ? '▲' : '▼'}
                    </span>
                  </button>

                  {abierta && (
                    <div id={`detalle-kps-${compuesto.id}`} className={styles.detalle}>
                      <h3>De dónde sale ese número</h3>
                      <div className={styles.ecuacionLinea}>
                        <span className={styles.ecuacionEtq}>Disolución</span>
                        <span className={styles.ecuacionTexto}>{compuesto.disolucion}</span>
                      </div>
                      <div className={styles.ecuacionLinea}>
                        <span className={styles.ecuacionEtq}>Expresión</span>
                        <span className={styles.ecuacionTexto}>{compuesto.expresion}</span>
                      </div>
                      <div className={styles.ecuacionLinea}>
                        <span className={styles.ecuacionEtq}>En función de s</span>
                        <span className={styles.ecuacionTexto}>{compuesto.relacion}</span>
                      </div>
                      <div className={styles.ecuacionLinea}>
                        <span className={styles.ecuacionEtq}>Solubilidad molar</span>
                        <span className={styles.ecuacionTexto}>{compuesto.solubilidad}</span>
                      </div>
                      <p className={styles.ecuacionNota}>{compuesto.nota}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender la solubilidad, no solo memorizar la tabla"
        subtitle="Qué significa «insoluble», cómo se predice un precipitado y de dónde salen los Kps"
      >
        <section className={styles.guideSection}>
          <h2>Qué quiere decir «soluble» en química</h2>
          <p>
            Ningún compuesto iónico es absolutamente insoluble: siempre pasa algo de sólido a la
            disolución. Lo que hay detrás de las palabras <strong>soluble</strong>,{' '}
            <strong>poco soluble</strong> e <strong>insoluble</strong> es un criterio práctico
            sobre cuánto se disuelve. El convenio más extendido en química general es este:
          </p>
          <div className={styles.formulaBox}>
            soluble: más de 0,1 mol/L · poco soluble: entre 0,01 y 0,1 mol/L · insoluble: menos de
            0,01 mol/L
          </div>
          <p>
            Por eso una misma sal puede aparecer como «poco soluble» en un libro y como
            «insoluble» en otro sin que ninguno esté equivocado: están usando cortes distintos. Lo
            que no cambia es el dato físico, la solubilidad medida, y en el caso de los compuestos
            de baja solubilidad ese dato se expresa mediante el producto de solubilidad Kps.
          </p>
          <p>
            La solubilidad tampoco es un número absoluto: depende de la temperatura, del pH y de la
            presencia de otros iones. Casi todas las sales se disuelven mejor en caliente, pero hay
            excepciones célebres como el sulfato de calcio, que se disuelve peor al calentar.
          </p>

          <h2>Los tres bloques de esta página, comparados</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Bloque</th>
                  <th>Qué te dice</th>
                  <th>Precisión</th>
                  <th>Cuándo usarlo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Reglas de solubilidad</strong>
                  </td>
                  <td>Si una sal se disuelve o precipita, en términos de sí o no</td>
                  <td>Cualitativa, con excepciones que hay que conocer</td>
                  <td>Predecir el producto de una mezcla de disoluciones</td>
                </tr>
                <tr>
                  <td>
                    <strong>Iones poliatómicos</strong>
                  </td>
                  <td>Fórmula, carga y nombre de los aniones y cationes compuestos</td>
                  <td>Exacta: la carga es un dato fijo</td>
                  <td>Formular y nombrar compuestos, ajustar cargas</td>
                </tr>
                <tr>
                  <td>
                    <strong>Productos de solubilidad</strong>
                  </td>
                  <td>Cuánto se disuelve exactamente en mol/L a 25 °C</td>
                  <td>Cuantitativa, con incertidumbre en los valores más pequeños</td>
                  <td>Calcular concentraciones, efecto del ion común, pH de precipitación</td>
                </tr>
                <tr>
                  <td>
                    <strong>Comprobador</strong>
                  </td>
                  <td>Fórmula formulada, estado y ecuación iónica neta</td>
                  <td>Cualitativa: aplica las reglas y sus excepciones</td>
                  <td>Comprobar un ejercicio antes de entregarlo</td>
                </tr>
                <tr>
                  <td>
                    <strong>Regla del cociente Q</strong>
                  </td>
                  <td>Si en unas concentraciones concretas llega a precipitar</td>
                  <td>Cuantitativa, necesita Kps y concentraciones</td>
                  <td>Problemas de «¿precipitará al mezclar estos volúmenes?»</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tabla periódica</strong>
                  </td>
                  <td>Cargas de los iones simples y tendencias por grupo</td>
                  <td>Exacta para los grupos principales</td>
                  <td>Deducir la carga de un catión que no recuerdas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Dónde aparece la solubilidad fuera del aula</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🚰
              </span>
              <strong>Agua dura y cal</strong>
              <p>
                El agua subterránea disuelve caliza gracias al CO₂, formando Ca(HCO₃)₂ soluble. Al
                calentarla en un hervidor o una caldera, el equilibrio se invierte y vuelve a
                depositarse CaCO₃ insoluble.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🩻
              </span>
              <strong>Contraste radiológico</strong>
              <p>
                El sulfato de bario se ingiere para radiografías digestivas aunque el ion bario sea
                tóxico: su Kps de 1,1×10⁻¹⁰ garantiza que prácticamente ningún Ba²⁺ llega a la
                sangre.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🦷
              </span>
              <strong>Esmalte dental y flúor</strong>
              <p>
                El esmalte es fosfato de calcio. El flúor lo transforma parcialmente en
                fluorapatita, todavía menos soluble en medio ácido, y por eso resiste mejor el
                ataque de los ácidos de la placa.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💎
              </span>
              <strong>Cálculos renales</strong>
              <p>
                La mayoría son oxalato de calcio, un sólido muy poco soluble. Beber más agua
                mantiene las concentraciones por debajo del Kps y evita que empiece a cristalizar.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo sé si al mezclar dos disoluciones se forma un precipitado?</h4>
              <p>
                Se escriben los cuatro iones presentes y se cruzan: el catión de la primera sal con
                el anión de la segunda y viceversa. Si alguna de las dos combinaciones nuevas es
                insoluble según las reglas, esa sal precipita; si las dos son solubles, no hay
                reacción y todos los iones son espectadores. Es exactamente lo que hace el
                comprobador de arriba.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si en un ejercicio los cuatro iones quedan
                libres, la respuesta correcta es «no hay reacción». No es un fallo del enunciado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Un Kps más pequeño significa siempre menos soluble?</h4>
              <p>
                Solo si los dos compuestos tienen la misma estequiometría. El AgCl (Kps 1,8×10⁻¹⁰)
                y el Ag₂CrO₄ (Kps 1,1×10⁻¹²) lo demuestran: el cromato tiene un Kps cien veces
                menor y, sin embargo, es unas cinco veces más soluble, porque su Kps se calcula
                como 4s³ y no como s². Para comparar hay que pasar siempre a solubilidad molar.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Comparar Kps de sales 1:1 con sales 1:2 es uno
                de los errores más penalizados en un examen de química general.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el efecto del ion común?</h4>
              <p>
                Si a una disolución saturada de AgCl se le añade NaCl, la concentración de Cl⁻ sube
                y el equilibrio se desplaza hacia el sólido, de modo que precipita más AgCl y la
                solubilidad disminuye. Es el principio de Le Châtelier aplicado a la precipitación,
                y se usa para completar una precipitación añadiendo un exceso del reactivo
                precipitante.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> En el cálculo, la concentración del ion común la
                fija la sal añadida, no el sólido: eso simplifica mucho las cuentas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el pH cambia la solubilidad de algunas sales?</h4>
              <p>
                Cuando el anión de la sal es la base conjugada de un ácido débil, el medio ácido lo
                consume y obliga a disolverse más sólido. Por eso los carbonatos, sulfuros,
                fosfatos y fluoruros se disuelven en ácido, mientras que sales de aniones de ácidos
                fuertes, como el BaSO₄ o el AgCl, apenas se ven afectadas.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla rápida: si el anión reacciona con H⁺, el
                ácido disuelve la sal. Si no reacciona, el pH no cambia casi nada.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Hay que memorizar toda la tabla de solubilidad?</h4>
              <p>
                No entera. Con seis ideas se resuelve la gran mayoría de los ejercicios: todo lo de
                alcalinos y amonio es soluble; todos los nitratos son solubles; los halogenuros son
                solubles salvo plata, plomo y mercurio(I); los sulfatos son solubles salvo bario,
                estroncio y plomo; y carbonatos, fosfatos, sulfuros e hidróxidos son insolubles
                salvo con alcalinos y amonio. El resto se consulta.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Aprende primero las excepciones: son pocas,
                siempre las mismas y son justo lo que se pregunta.
              </p>
            </div>
          </div>

          <h2>Cómo resolver un problema de precipitación paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Disocia mentalmente las dos sales</strong>
                <p>
                  Escribe los cuatro iones con su carga correcta. Aquí es donde se usa la tabla de
                  iones poliatómicos: confundir SO₄²⁻ con SO₃²⁻ o poner mal una carga arruina todo
                  lo que venga después.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Cruza los iones y formula los dos productos</strong>
                <p>
                  Combina el catión de una sal con el anión de la otra, intercambiando las cargas
                  como subíndices y simplificando si tienen factor común. Recuerda los paréntesis
                  cuando el ion poliatómico lleve subíndice: Ca₃(PO₄)₂, no Ca₃PO₄₂.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica las reglas de solubilidad a cada producto</strong>
                <p>
                  Empieza siempre por la regla de los alcalinos y el amonio, que se impone sobre
                  todas las demás. Después mira el anión y, por último, comprueba si el catión está
                  en la lista de excepciones.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Escribe la ecuación molecular ajustada</strong>
                <p>
                  Ajusta los coeficientes con la fórmula ya escrita, sin tocar los subíndices. Un
                  error clásico es cambiar un subíndice para cuadrar la ecuación: eso convierte el
                  compuesto en otro distinto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Pasa a la iónica completa y elimina los espectadores</strong>
                <p>
                  Disocia todo lo que esté en disolución y deja sin disociar el sólido, el gas y el
                  agua. Los iones que aparecen idénticos a ambos lados se tachan y lo que queda es
                  la ecuación iónica neta, que es lo que suele puntuar.
                </p>
              </div>
            </div>
          </div>

          <h2>Cómo se usa un Kps en un cálculo</h2>
          <p>
            La lógica es siempre la misma: se llama <strong>s</strong> a la solubilidad molar, se
            escriben las concentraciones de los iones en función de s y se sustituyen en la
            expresión del Kps. Para el fluoruro de calcio:
          </p>
          <div className={styles.formulaBox}>
            CaF₂(s) ⇌ Ca²⁺ + 2 F⁻ · Kps = [Ca²⁺]·[F⁻]² = s·(2s)² = 4s³ · s = ∛(Kps/4)
          </div>
          <p>
            Con Kps = 3,9×10⁻¹¹ sale s = 2,1×10⁻⁴ mol/L. El factor 2 del fluoruro aparece dos
            veces: una porque hay dos iones F⁻ por fórmula y otra porque la concentración va
            elevada al cuadrado. Ese doble papel del coeficiente es la fuente de error más común de
            todo el tema.
          </p>
          <p>
            Para saber si precipita en una situación concreta se calcula el{' '}
            <strong>cociente de reacción Q</strong> con las concentraciones reales, exactamente con
            la misma expresión que el Kps. Si Q &gt; Kps hay precipitado; si Q = Kps la disolución
            está justo saturada; y si Q &lt; Kps todo permanece disuelto.
          </p>

          <h2>Buenas prácticas al usar la tabla</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                1️⃣
              </span>
              <strong>Alcalinos y amonio, primero</strong>
              <p>
                Es la única regla sin excepciones prácticas y resuelve la mitad de los casos en un
                vistazo. Compruébala antes que ninguna otra.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🥈
              </span>
              <strong>Sospecha siempre de la plata</strong>
              <p>
                Ag⁺ rompe las reglas de los halogenuros, del acetato, del nitrito y del sulfato. Si
                aparece plata en el enunciado, revisa la excepción antes de responder.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔤
              </span>
              <strong>Paréntesis en los iones poliatómicos</strong>
              <p>
                Al(OH)₃ y Ca₃(PO₄)₂ los llevan; AlOH₃ y Ca₃PO₄₂ están mal escritos y suelen costar
                puntos aunque el razonamiento sea correcto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🌡️
              </span>
              <strong>Todos los Kps son a 25 °C</strong>
              <p>
                La constante depende de la temperatura. Un valor tabulado sin temperatura indicada
                es un valor incompleto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧾
              </span>
              <strong>Indica el estado de agregación</strong>
              <p>
                (s), (ac), (l) y (g) forman parte de la ecuación. Sin el (s) en el precipitado no
                se entiende qué ha ocurrido.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔁
              </span>
              <strong>Usa el comprobador para verificar</strong>
              <p>
                Formula tú primero y contrasta después. Aprender es reconstruir la fórmula, no
                copiarla ya hecha.
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
                <strong>Olvidar que el fluoruro va aparte:</strong> los cloruros, bromuros y
                yoduros son solubles, pero la mayoría de los fluoruros no lo son. CaF₂ precipita y
                CaCl₂ no.
              </li>
              <li>
                <strong>Aplicar la regla del anión antes que la del catión:</strong> el Na₂S es
                soluble aunque los sulfuros sean insolubles. La regla de alcalinos y amonio manda
                siempre.
              </li>
              <li>
                <strong>Comparar Kps de sales con distinta estequiometría:</strong> un Kps menor no
                implica menos soluble si una es 1:1 y la otra 1:2. Hay que calcular s en los dos
                casos.
              </li>
              <li>
                <strong>Perder el exponente del coeficiente:</strong> en Mg(OH)₂ el Kps es
                [Mg²⁺]·[OH⁻]², es decir 4s³, no s². Escribir s² es el fallo más repetido del tema.
              </li>
              <li>
                <strong>Modificar subíndices al ajustar:</strong> los coeficientes van delante de
                la fórmula; cambiar un subíndice para cuadrar la ecuación crea un compuesto que no
                existe en el problema.
              </li>
              <li>
                <strong>Dejar el sólido disociado en la ecuación iónica:</strong> el precipitado se
                escribe entero como AgCl(s); solo se disocia lo que está en disolución.
              </li>
              <li>
                <strong>Confundir sulfato con sulfito o nitrato con nitrito:</strong> cambia un
                oxígeno y cambia la solubilidad, el color y el comportamiento frente a los ácidos.
              </li>
              <li>
                <strong>Suponer que «insoluble» es cero:</strong> siempre hay algo disuelto. El Kps
                existe justamente para cuantificar ese «algo».
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde la química de secundaria y preparatoria hasta los primeros
            cursos universitarios de química general y analítica. Las reglas de solubilidad y los
            iones poliatómicos son materia habitual del examen de admisión universitaria en los
            países hispanohablantes; los cálculos con Kps, el efecto del ion común y la
            precipitación fraccionada suelen aparecer ya en el primer curso de grado en química,
            ingeniería, farmacia, biología o ciencias ambientales.
          </p>
          <p>
            Si necesitas repasar antes las cargas de los iones simples, la{' '}
            <a href="/tabla-valencias/">tabla de valencias y números de oxidación</a> es la app
            hermana de esta. Y para la parte de cálculo, el{' '}
            <a href="/simulador-disoluciones/">simulador de disoluciones y molaridad</a> permite
            pasar de gramos a mol/L antes de aplicar cualquier Kps.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-solubilidad')} />

      <ShareCard appName="tabla-solubilidad" />

      <Footer appName="tabla-solubilidad" />
    </div>
  );
}

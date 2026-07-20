'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './TablaAreasVolumenes.module.css';
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
   Utilidades de render (sin librerías externas: la CSP del sitio
   está en modo enforcement y bloquearía MathJax o KaTeX).
──────────────────────────────────────────────────────────────── */

/** Fracción legible construida con flexbox. */
function Frac({ n, d }: { n: ReactNode; d: ReactNode }) {
  return (
    <span className={styles.frac}>
      <span className={styles.fracNum}>{n}</span>
      <span className={styles.fracDen}>{d}</span>
    </span>
  );
}

/** Lienzo común de los diagramas. Decorativo: la figura se describe en texto. */
function Fig({ children }: { children: ReactNode }) {
  return (
    <svg
      className={styles.svgFigura}
      viewBox="0 0 200 140"
      width={200}
      height={140}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Etiqueta de dimensión dentro de un diagrama. */
function Etq({
  x,
  y,
  children,
  anclaje = 'middle',
}: {
  x: number;
  y: number;
  children: ReactNode;
  anclaje?: 'start' | 'middle' | 'end';
}) {
  return (
    <text x={x} y={y} className={styles.svgTexto} textAnchor={anclaje}>
      {children}
    </text>
  );
}

/** Normaliza texto para buscar sin acentos ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

type CategoriaId = 'poligonos' | 'curvas' | 'poliedros' | 'revolucion' | 'compuestas';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface Formula {
  etq: string;
  expr: ReactNode;
}

interface Figura {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  /** Qué significa cada letra del diagrama (accesible como texto) */
  dimensiones: string;
  /** Fórmula destacada que se ve con la fila plegada */
  principalEtq: string;
  principal: ReactNode;
  /** Segunda fórmula destacada (perímetro o volumen) */
  secundariaEtq?: string;
  secundaria?: ReactNode;
  /** Todas las fórmulas de la figura */
  formulas: Formula[];
  /** Diagrama con las dimensiones etiquetadas */
  diagrama: ReactNode;
  /** Texto plano para el buscador: nombre y sinónimos regionales */
  busqueda: string;
  ejemploTitulo: string;
  ejemploPasos: string[];
  usoReal: string;
}

const CATEGORIAS: Categoria[] = [
  { id: 'poligonos', nombre: 'Polígonos', icono: '📐' },
  { id: 'curvas', nombre: 'Círculo y figuras curvas', icono: '⭕' },
  { id: 'poliedros', nombre: 'Cuerpos poliédricos', icono: '🧊' },
  { id: 'revolucion', nombre: 'Cuerpos de revolución', icono: '🥫' },
  { id: 'compuestas', nombre: 'Figuras compuestas', icono: '🏗️' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  poligonos: 'Polígonos',
  curvas: 'Círculo y figuras curvas',
  poliedros: 'Cuerpos poliédricos',
  revolucion: 'Cuerpos de revolución',
  compuestas: 'Figuras compuestas',
};

/* ────────────────────────────────────────────────────────────────
   CATÁLOGO DE FIGURAS
   Fórmulas revisadas una a una. Ojo con los clásicos: el área
   lateral del cono usa la generatriz g (no la altura), el área de
   la esfera es 4πr² y su volumen (4/3)πr³, y el volumen del tronco
   de cono lleva el término R² + r² + R·r.
──────────────────────────────────────────────────────────────── */

const FIGURAS: Figura[] = [
  /* ══ POLÍGONOS ══════════════════════════════════════════════ */
  {
    id: 'cuadrado',
    categoria: 'poligonos',
    nombre: 'Cuadrado',
    dimensiones: 'a = lado; d = diagonal',
    principalEtq: 'Área',
    principal: <>a²</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>4·a</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 4·a</> },
      { etq: 'Área', expr: <>A = a²</> },
      { etq: 'Diagonal', expr: <>d = a·√2 ≈ 1,4142·a</> },
      { etq: 'Lado desde el área', expr: <>a = √A</> },
    ],
    diagrama: (
      <Fig>
        <rect x={55} y={25} width={90} height={90} className={styles.relleno} />
        <line x1={55} y1={115} x2={145} y2={25} className={styles.cota} />
        <Etq x={100} y={133}>
          a
        </Etq>
        <Etq x={44} y={75} anclaje="end">
          a
        </Etq>
        <Etq x={112} y={68}>
          d
        </Etq>
      </Fig>
    ),
    busqueda:
      'cuadrado lado a area del cuadrado perimetro diagonal baldosa loseta azulejo cuadrada poligono regular de cuatro lados',
    ejemploTitulo: 'Cuadrado de 3,5 m de lado',
    ejemploPasos: [
      'a = 3,5 m',
      'P = 4 · 3,5 = 14 m',
      'A = 3,5² = 12,25 m²',
      'd = 3,5 · 1,4142 = 4,95 m',
    ],
    usoReal:
      'Aparece al calcular cuántas losetas cuadradas caben en un piso, al cortar tableros o al medir un huerto en cuadros. La diagonal es lo que se comprueba en obra para verificar que una plantilla está a escuadra.',
  },
  {
    id: 'rectangulo',
    categoria: 'poligonos',
    nombre: 'Rectángulo',
    dimensiones: 'b = base; h = altura (los dos lados contiguos); d = diagonal',
    principalEtq: 'Área',
    principal: <>b·h</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>2·(b + h)</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 2·(b + h)</> },
      { etq: 'Área', expr: <>A = b·h</> },
      { etq: 'Diagonal', expr: <>d = √(b² + h²)</> },
    ],
    diagrama: (
      <Fig>
        <rect x={30} y={35} width={140} height={72} className={styles.relleno} />
        <line x1={30} y1={107} x2={170} y2={35} className={styles.cota} />
        <Etq x={100} y={128}>
          b
        </Etq>
        <Etq x={20} y={75} anclaje="end">
          h
        </Etq>
        <Etq x={108} y={66}>
          d
        </Etq>
      </Fig>
    ),
    busqueda:
      'rectangulo base altura largo ancho area del rectangulo perimetro diagonal habitacion parcela rectangular superficie',
    ejemploTitulo: 'Habitación de 6 m × 4 m',
    ejemploPasos: [
      'b = 6 m, h = 4 m',
      'P = 2 · (6 + 4) = 20 m',
      'A = 6 · 4 = 24 m²',
      'd = √(36 + 16) = √52 ≈ 7,21 m',
    ],
    usoReal:
      'Es la fórmula que más se usa en obra y en el hogar: metros de rodapié (perímetro), metros cuadrados de suelo o pintura (área) y comprobación de escuadra (diagonal).',
  },
  {
    id: 'paralelogramo',
    categoria: 'poligonos',
    nombre: 'Paralelogramo (romboide)',
    dimensiones: 'b = base; h = altura perpendicular a la base; c = lado inclinado',
    principalEtq: 'Área',
    principal: <>b·h</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>2·(b + c)</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 2·(b + c)</> },
      { etq: 'Área', expr: <>A = b·h</> },
      {
        etq: 'Área con ángulo',
        expr: (
          <>
            A = b·c·sen α (α = ángulo entre b y c)
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="30,110 150,110 170,40 50,40" className={styles.relleno} />
        <line x1={50} y1={40} x2={50} y2={110} className={styles.cota} />
        <Etq x={90} y={131}>
          b
        </Etq>
        <Etq x={42} y={80} anclaje="end">
          h
        </Etq>
        <Etq x={168} y={80} anclaje="start">
          c
        </Etq>
      </Fig>
    ),
    busqueda:
      'paralelogramo romboide area base por altura lado inclinado cuadrilatero de lados paralelos',
    ejemploTitulo: 'Paralelogramo con b = 8 cm, c = 5 cm y h = 4 cm',
    ejemploPasos: [
      'b = 8 cm, c = 5 cm, h = 4 cm',
      'P = 2 · (8 + 5) = 26 cm',
      'A = 8 · 4 = 32 cm²',
      'Con el lado inclinado (8 · 5 = 40) el resultado sería erróneo: la altura no es el lado.',
    ],
    usoReal:
      'Aparece en piezas de carpintería cortadas al bies, en paneles de fachada inclinados y en el reparto de parcelas cuando los linderos no son perpendiculares.',
  },
  {
    id: 'rombo',
    categoria: 'poligonos',
    nombre: 'Rombo',
    dimensiones: 'D = diagonal mayor; d = diagonal menor; a = lado',
    principalEtq: 'Área',
    principal: <Frac n={<>D·d</>} d="2" />,
    secundariaEtq: 'Perímetro',
    secundaria: <>4·a</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 4·a</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>D·d</>} d="2" />
          </>
        ),
      },
      {
        etq: 'Lado',
        expr: (
          <>
            a = <Frac n={<>√(D² + d²)</>} d="2" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="100,20 165,70 100,120 35,70" className={styles.relleno} />
        <line x1={35} y1={70} x2={165} y2={70} className={styles.cota} />
        <line x1={100} y1={20} x2={100} y2={120} className={styles.cota} />
        <Etq x={60} y={62}>
          D
        </Etq>
        <Etq x={112} y={100}>
          d
        </Etq>
        <Etq x={140} y={38}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'rombo diagonal mayor menor area diagonales partido dos losange cometa papalote figura de cuatro lados iguales',
    ejemploTitulo: 'Rombo con diagonales de 10 cm y 6 cm',
    ejemploPasos: [
      'D = 10 cm, d = 6 cm',
      'A = (10 · 6) / 2 = 30 cm²',
      'a = √(100 + 36) / 2 = √136 / 2 ≈ 5,83 cm',
      'P = 4 · 5,83 ≈ 23,32 cm',
    ],
    usoReal:
      'Se usa en mosaicos y celosías, en cometas o papalotes y en el despiece de mallas metálicas, donde las medidas que se conocen son precisamente las dos diagonales.',
  },
  {
    id: 'trapecio',
    categoria: 'poligonos',
    nombre: 'Trapecio',
    dimensiones: 'B = base mayor; b = base menor; h = altura entre las dos bases paralelas',
    principalEtq: 'Área',
    principal: (
      <>
        <Frac n={<>B + b</>} d="2" />·h
      </>
    ),
    secundariaEtq: 'Perímetro',
    secundaria: <>B + b + c + d</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = B + b + c + d (suma de los cuatro lados)</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>(B + b)</>} d="2" /> · h
          </>
        ),
      },
      { etq: 'Altura desde el área', expr: <>h = 2·A / (B + b)</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="25,110 175,110 140,40 60,40" className={styles.relleno} />
        <line x1={60} y1={40} x2={60} y2={110} className={styles.cota} />
        <Etq x={100} y={131}>
          B
        </Etq>
        <Etq x={100} y={32}>
          b
        </Etq>
        <Etq x={52} y={80} anclaje="end">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'trapecio base mayor menor altura area del trapecio semisuma de las bases por la altura trapezoide isosceles rectangulo',
    ejemploTitulo: 'Trapecio con B = 8 cm, b = 5 cm y h = 4 cm',
    ejemploPasos: [
      'B = 8 cm, b = 5 cm, h = 4 cm',
      'A = (8 + 5) / 2 · 4',
      'A = 6,5 · 4 = 26 cm²',
      'La h es la distancia perpendicular entre las bases, nunca el lado inclinado.',
    ],
    usoReal:
      'Es la forma típica de una parcela con un lindero en diagonal, de la sección de un canal de riego y del lateral de una piscina de profundidad variable.',
  },
  {
    id: 'trapezoide',
    categoria: 'poligonos',
    nombre: 'Trapezoide (cuadrilátero irregular)',
    dimensiones: 'e = diagonal que parte la figura; h₁ y h₂ = alturas de los dos triángulos',
    principalEtq: 'Área',
    principal: (
      <>
        <Frac n={<>e·(h₁ + h₂)</>} d="2" />
      </>
    ),
    secundariaEtq: 'Perímetro',
    secundaria: <>suma de los 4 lados</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = a + b + c + d</> },
      {
        etq: 'Área (por triangulación)',
        expr: (
          <>
            A = <Frac n={<>e·h₁</>} d="2" /> + <Frac n={<>e·h₂</>} d="2" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="25,115 175,95 150,30 45,45" className={styles.relleno} />
        <line x1={25} y1={115} x2={150} y2={30} className={styles.cota} />
        <Etq x={78} y={82}>
          e
        </Etq>
        <Etq x={62} y={112}>
          h₁
        </Etq>
        <Etq x={104} y={48}>
          h₂
        </Etq>
      </Fig>
    ),
    busqueda:
      'trapezoide cuadrilatero irregular sin lados paralelos triangulacion parcela irregular terreno de cuatro lados',
    ejemploTitulo: 'Parcela irregular con diagonal de 10 m',
    ejemploPasos: [
      'e = 10 m; alturas medidas a la diagonal: h₁ = 4 m y h₂ = 3 m',
      'Triángulo 1: (10 · 4) / 2 = 20 m²',
      'Triángulo 2: (10 · 3) / 2 = 15 m²',
      'A = 20 + 15 = 35 m²',
    ],
    usoReal:
      'Es el método real de medición de fincas: se tira una cinta en diagonal y se miden las distancias perpendiculares desde los dos vértices restantes. Cualquier polígono se descompone así.',
  },
  {
    id: 'triangulo',
    categoria: 'poligonos',
    nombre: 'Triángulo (fórmula general)',
    dimensiones: 'b = base; h = altura perpendicular a esa base; a, b, c = los tres lados',
    principalEtq: 'Área',
    principal: <Frac n={<>b·h</>} d="2" />,
    secundariaEtq: 'Perímetro',
    secundaria: <>a + b + c</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = a + b + c</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>b·h</>} d="2" />
          </>
        ),
      },
      {
        etq: 'Área con dos lados y el ángulo',
        expr: (
          <>
            A = <Frac n={<>a·b·sen C</>} d="2" />
          </>
        ),
      },
      { etq: 'Altura desde el área', expr: <>h = 2·A / b</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="30,115 170,115 110,30" className={styles.relleno} />
        <line x1={110} y1={30} x2={110} y2={115} className={styles.cota} />
        <Etq x={100} y={135}>
          b
        </Etq>
        <Etq x={120} y={80} anclaje="start">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'triangulo base por altura partido dos area del triangulo perimetro tres lados figura de tres lados',
    ejemploTitulo: 'Triángulo con base 12 cm y altura 5 cm',
    ejemploPasos: ['b = 12 cm, h = 5 cm', 'A = (12 · 5) / 2', 'A = 30 cm²'],
    usoReal:
      'Cualquier superficie poligonal se puede descomponer en triángulos, así que esta fórmula está detrás del cálculo de tejados, velas, frontones y parcelas irregulares.',
  },
  {
    id: 'triangulo-equilatero',
    categoria: 'poligonos',
    nombre: 'Triángulo equilátero',
    dimensiones: 'a = lado (los tres iguales); h = altura',
    principalEtq: 'Área',
    principal: (
      <>
        <Frac n={<>a²·√3</>} d="4" />
      </>
    ),
    secundariaEtq: 'Perímetro',
    secundaria: <>3·a</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 3·a</> },
      {
        etq: 'Altura',
        expr: (
          <>
            h = <Frac n={<>a·√3</>} d="2" /> ≈ 0,8660·a
          </>
        ),
      },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>a²·√3</>} d="4" /> ≈ 0,4330·a²
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="40,115 160,115 100,11" className={styles.relleno} />
        <line x1={100} y1={11} x2={100} y2={115} className={styles.cota} />
        <Etq x={100} y={135}>
          a
        </Etq>
        <Etq x={110} y={75} anclaje="start">
          h
        </Etq>
        <Etq x={58} y={60} anclaje="end">
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'triangulo equilatero lados iguales altura raiz de tres area del triangulo equilatero regular',
    ejemploTitulo: 'Triángulo equilátero de 6 cm de lado',
    ejemploPasos: [
      'a = 6 cm',
      'P = 3 · 6 = 18 cm',
      'h = 6 · 0,8660 = 5,20 cm',
      'A = 36 · 1,7321 / 4 = 15,59 cm²',
    ],
    usoReal:
      'Es la base de las estructuras trianguladas (cerchas, torres de celosía) porque el triángulo es la única figura plana indeformable sin arriostrar.',
  },
  {
    id: 'triangulo-rectangulo',
    categoria: 'poligonos',
    nombre: 'Triángulo rectángulo (Pitágoras)',
    dimensiones: 'a y b = catetos (los lados del ángulo recto); c = hipotenusa',
    principalEtq: 'Área',
    principal: <Frac n={<>a·b</>} d="2" />,
    secundariaEtq: 'Hipotenusa',
    secundaria: <>√(a² + b²)</>,
    formulas: [
      { etq: 'Hipotenusa', expr: <>c = √(a² + b²)</> },
      { etq: 'Cateto', expr: <>a = √(c² − b²)</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>a·b</>} d="2" />
          </>
        ),
      },
      { etq: 'Perímetro', expr: <>P = a + b + c</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="40,115 40,35 160,115" className={styles.relleno} />
        <polyline points="40,102 53,102 53,115" className={styles.trazo} />
        <Etq x={30} y={78} anclaje="end">
          a
        </Etq>
        <Etq x={100} y={135}>
          b
        </Etq>
        <Etq x={110} y={68}>
          c
        </Etq>
      </Fig>
    ),
    busqueda:
      'triangulo rectangulo pitagoras hipotenusa catetos escuadra 3 4 5 replanteo angulo recto',
    ejemploTitulo: 'Catetos de 3 m y 4 m',
    ejemploPasos: [
      'a = 3 m, b = 4 m',
      'c = √(9 + 16) = √25 = 5 m',
      'A = (3 · 4) / 2 = 6 m²',
      'P = 3 + 4 + 5 = 12 m',
    ],
    usoReal:
      'El triángulo 3-4-5 es el truco clásico de replanteo en albañilería: marcando 3 m en una dirección y 4 m en otra, si la diagonal mide 5 m el ángulo es recto exacto.',
  },
  {
    id: 'heron',
    categoria: 'poligonos',
    nombre: 'Triángulo con los tres lados (fórmula de Herón)',
    dimensiones: 'a, b, c = los tres lados; s = semiperímetro',
    principalEtq: 'Área',
    principal: <>√(s(s−a)(s−b)(s−c))</>,
    secundariaEtq: 'Semiperímetro',
    secundaria: (
      <>
        s = <Frac n={<>a + b + c</>} d="2" />
      </>
    ),
    formulas: [
      {
        etq: 'Semiperímetro',
        expr: (
          <>
            s = <Frac n={<>a + b + c</>} d="2" />
          </>
        ),
      },
      { etq: 'Área', expr: <>A = √( s·(s − a)·(s − b)·(s − c) )</> },
      { etq: 'Altura sobre b', expr: <>h = 2·A / b</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="30,115 175,115 90,25" className={styles.relleno} />
        <Etq x={100} y={135}>
          b
        </Etq>
        <Etq x={48} y={66} anclaje="end">
          a
        </Etq>
        <Etq x={140} y={62} anclaje="start">
          c
        </Etq>
      </Fig>
    ),
    busqueda:
      'formula de heron area con los tres lados semiperimetro triangulo sin altura terreno triangular escaleno',
    ejemploTitulo: 'Triángulo de lados 13, 14 y 15 m',
    ejemploPasos: [
      's = (13 + 14 + 15) / 2 = 21 m',
      'A = √(21 · 8 · 7 · 6)',
      'A = √7.056 = 84 m²',
      'La altura sobre el lado de 14 m es h = 2 · 84 / 14 = 12 m',
    ],
    usoReal:
      'Es la fórmula de campo por excelencia: en una finca se pueden medir los tres lados con una cinta métrica, pero medir la altura perpendicular exige un replanteo que casi nunca se hace.',
  },
  {
    id: 'poligono-regular',
    categoria: 'poligonos',
    nombre: 'Polígono regular de n lados',
    dimensiones: 'n = número de lados; ℓ = longitud del lado; ap = apotema (del centro al punto medio de un lado)',
    principalEtq: 'Área',
    principal: <Frac n={<>P·ap</>} d="2" />,
    secundariaEtq: 'Perímetro',
    secundaria: <>n·ℓ</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = n·ℓ</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>P·ap</>} d="2" /> = <Frac n={<>n·ℓ·ap</>} d="2" />
          </>
        ),
      },
      {
        etq: 'Apotema',
        expr: (
          <>
            ap = <Frac n={<>ℓ</>} d={<>2·tg(180°/n)</>} />
          </>
        ),
      },
      {
        etq: 'Ángulo interior',
        expr: (
          <>
            <Frac n={<>(n − 2)·180°</>} d="n" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon
          points="146,51 119,24 81,24 54,51 54,89 81,116 119,116 146,89"
          className={styles.relleno}
        />
        <line x1={100} y1={70} x2={100} y2={116} className={styles.cota} />
        <circle cx={100} cy={70} r={2.5} fill="currentColor" />
        <Etq x={112} y={98} anclaje="start">
          ap
        </Etq>
        <Etq x={100} y={134}>
          ℓ
        </Etq>
      </Fig>
    ),
    busqueda:
      'poligono regular n lados apotema perimetro por apotema partido dos octogono heptagono decagono angulo interior',
    ejemploTitulo: 'Octógono regular de 4 cm de lado',
    ejemploPasos: [
      'n = 8, ℓ = 4 cm',
      'ap = 4 / (2 · tg 22,5°) = 4 / (2 · 0,4142) = 4,83 cm',
      'P = 8 · 4 = 32 cm',
      'A = (32 · 4,83) / 2 = 77,25 cm²',
    ],
    usoReal:
      'Sirve para arquetas octogonales, tuercas, pavimentos de teselas y torres poligonales. Con n grande la fórmula se acerca a la del círculo, que es su caso límite.',
  },
  {
    id: 'hexagono',
    categoria: 'poligonos',
    nombre: 'Hexágono regular',
    dimensiones: 'a = lado; ap = apotema',
    principalEtq: 'Área',
    principal: (
      <>
        <Frac n={<>3·√3</>} d="2" />·a²
      </>
    ),
    secundariaEtq: 'Perímetro',
    secundaria: <>6·a</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 6·a</> },
      {
        etq: 'Apotema',
        expr: (
          <>
            ap = <Frac n={<>a·√3</>} d="2" /> ≈ 0,8660·a
          </>
        ),
      },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>3·√3</>} d="2" />·a² ≈ 2,5981·a²
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon
          points="155,70 127,22 73,22 45,70 73,118 127,118"
          className={styles.relleno}
        />
        <line x1={100} y1={70} x2={100} y2={118} className={styles.cota} />
        <circle cx={100} cy={70} r={2.5} fill="currentColor" />
        <Etq x={112} y={100} anclaje="start">
          ap
        </Etq>
        <Etq x={100} y={136}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'hexagono regular seis lados panal apotema area del hexagono baldosa hexagonal tuerca',
    ejemploTitulo: 'Hexágono regular de 5 cm de lado',
    ejemploPasos: [
      'a = 5 cm',
      'P = 6 · 5 = 30 cm',
      'ap = 5 · 0,8660 = 4,33 cm',
      'A = 2,5981 · 25 = 64,95 cm²',
    ],
    usoReal:
      'Es la forma del panal de abeja y de muchos pavimentos porque teselan el plano sin dejar huecos con el mínimo perímetro por unidad de superficie.',
  },
  {
    id: 'pentagono',
    categoria: 'poligonos',
    nombre: 'Pentágono regular',
    dimensiones: 'a = lado; ap = apotema',
    principalEtq: 'Área',
    principal: <>≈ 1,7205·a²</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>5·a</>,
    formulas: [
      { etq: 'Perímetro', expr: <>P = 5·a</> },
      { etq: 'Apotema', expr: <>ap = a / (2·tg 36°) ≈ 0,6882·a</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>5·a²</>} d={<>4·tg 36°</>} /> ≈ 1,7205·a²
          </>
        ),
      },
      { etq: 'Ángulo interior', expr: <>108°</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="100,17 152,55 132,117 68,117 48,55" className={styles.relleno} />
        <line x1={100} y1={72} x2={100} y2={117} className={styles.cota} />
        <circle cx={100} cy={72} r={2.5} fill="currentColor" />
        <Etq x={112} y={102} anclaje="start">
          ap
        </Etq>
        <Etq x={100} y={135}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'pentagono regular cinco lados apotema area del pentagono angulo interior 108 grados',
    ejemploTitulo: 'Pentágono regular de 6 cm de lado',
    ejemploPasos: [
      'a = 6 cm',
      'P = 5 · 6 = 30 cm',
      'ap = 6 · 0,6882 = 4,13 cm',
      'A = (30 · 4,13) / 2 = 61,94 cm²',
    ],
    usoReal:
      'Se encuentra en cúpulas geodésicas, en piezas de balón de fútbol clásico y en el trazado de rosetones y ventanas ornamentales.',
  },

  /* ══ CÍRCULO Y FIGURAS CURVAS ═══════════════════════════════ */
  {
    id: 'circulo',
    categoria: 'curvas',
    nombre: 'Círculo y circunferencia',
    dimensiones: 'r = radio; d = diámetro (d = 2r)',
    principalEtq: 'Área',
    principal: <>π·r²</>,
    secundariaEtq: 'Longitud',
    secundaria: <>2·π·r</>,
    formulas: [
      { etq: 'Longitud (perímetro)', expr: <>L = 2·π·r = π·d</> },
      { etq: 'Área', expr: <>A = π·r² = π·d² / 4</> },
      { etq: 'Radio desde el área', expr: <>r = √(A / π)</> },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={52} className={styles.relleno} />
        <line x1={100} y1={70} x2={152} y2={70} className={styles.cota} />
        <circle cx={100} cy={70} r={2.5} fill="currentColor" />
        <Etq x={126} y={62}>
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'circulo circunferencia radio diametro pi area del circulo longitud perimetro redondo rueda',
    ejemploTitulo: 'Círculo de 3 m de radio',
    ejemploPasos: [
      'r = 3 m',
      'L = 2 · π · 3 = 18,85 m',
      'A = π · 3² = π · 9 = 28,27 m²',
      'Si te dan el diámetro (6 m), divídelo entre 2 antes de elevar al cuadrado.',
    ],
    usoReal:
      'Se usa para el vallado de un círculo de riego, la superficie de una mesa redonda o la sección de una tubería. El error más frecuente es meter el diámetro donde va el radio.',
  },
  {
    id: 'semicirculo',
    categoria: 'curvas',
    nombre: 'Semicírculo',
    dimensiones: 'r = radio; el lado recto mide 2r',
    principalEtq: 'Área',
    principal: <Frac n={<>π·r²</>} d="2" />,
    secundariaEtq: 'Perímetro',
    secundaria: <>π·r + 2·r</>,
    formulas: [
      { etq: 'Arco', expr: <>arco = π·r</> },
      { etq: 'Perímetro completo', expr: <>P = π·r + 2·r = r·(π + 2)</> },
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>π·r²</>} d="2" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <path d="M 40 105 A 60 60 0 0 1 160 105 Z" className={styles.relleno} />
        <line x1={100} y1={105} x2={160} y2={105} className={styles.cota} />
        <circle cx={100} cy={105} r={2.5} fill="currentColor" />
        <Etq x={130} y={124}>
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'semicirculo medio circulo arco media circunferencia arco de medio punto ventana abocinada',
    ejemploTitulo: 'Semicírculo de 4 m de radio',
    ejemploPasos: [
      'r = 4 m',
      'A = π · 16 / 2 = 25,13 m²',
      'Arco = π · 4 = 12,57 m',
      'P = 12,57 + 8 = 20,57 m',
    ],
    usoReal:
      'Aparece en arcos de medio punto, en cabeceros de puertas y en los extremos de una pista de atletismo o de un depósito alargado.',
  },
  {
    id: 'sector-circular',
    categoria: 'curvas',
    nombre: 'Sector circular',
    dimensiones: 'r = radio; α = ángulo en grados; θ = el mismo ángulo en radianes',
    principalEtq: 'Área',
    principal: (
      <>
        π·r²·<Frac n="α" d="360" />
      </>
    ),
    secundariaEtq: 'Arco',
    secundaria: (
      <>
        2·π·r·<Frac n="α" d="360" />
      </>
    ),
    formulas: [
      {
        etq: 'Arco',
        expr: (
          <>
            s = 2·π·r·<Frac n="α" d="360°" /> = r·θ
          </>
        ),
      },
      {
        etq: 'Área',
        expr: (
          <>
            A = π·r²·<Frac n="α" d="360°" /> = <Frac n={<>r²·θ</>} d="2" /> = <Frac n={<>s·r</>} d="2" />
          </>
        ),
      },
      { etq: 'Perímetro', expr: <>P = s + 2·r</> },
    ],
    diagrama: (
      <Fig>
        <path d="M 60 115 L 140 115 A 80 80 0 0 0 100 45.7 Z" className={styles.relleno} />
        <Etq x={100} y={132}>
          r
        </Etq>
        <Etq x={78} y={104} anclaje="start">
          α
        </Etq>
        <Etq x={78} y={62}>
          s
        </Etq>
      </Fig>
    ),
    busqueda:
      'sector circular porcion de circulo angulo arco quesito porcion de tarta abanico grados radianes',
    ejemploTitulo: 'Sector de 6 cm de radio y 60°',
    ejemploPasos: [
      'r = 6 cm, α = 60°',
      's = 2 · π · 6 · (60/360) = 6,28 cm',
      'A = π · 36 · (60/360) = 18,85 cm²',
      'P = 6,28 + 12 = 18,28 cm',
    ],
    usoReal:
      'Es la porción de tarta, el barrido de un aspersor de riego y el campo de visión de una cámara de vigilancia expresado como superficie cubierta.',
  },
  {
    id: 'segmento-circular',
    categoria: 'curvas',
    nombre: 'Segmento circular',
    dimensiones: 'r = radio; θ = ángulo central en radianes; c = cuerda',
    principalEtq: 'Área',
    principal: (
      <>
        <Frac n={<>r²</>} d="2" />·(θ − sen θ)
      </>
    ),
    secundariaEtq: 'Cuerda',
    secundaria: <>2·r·sen(θ/2)</>,
    formulas: [
      {
        etq: 'Área',
        expr: (
          <>
            A = <Frac n={<>r²</>} d="2" />·(θ − sen θ), con θ en radianes
          </>
        ),
      },
      { etq: 'Equivalente', expr: <>A = área del sector − área del triángulo</> },
      { etq: 'Cuerda', expr: <>c = 2·r·sen(θ/2)</> },
      { etq: 'Flecha (altura)', expr: <>f = r·(1 − cos(θ/2))</> },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={55} className={styles.trazo} />
        <path d="M 53.9 40 A 55 55 0 0 1 146.1 40 Z" className={styles.relleno} />
        <line x1={53.9} y1={40} x2={146.1} y2={40} className={styles.cota} />
        <line x1={100} y1={70} x2={146.1} y2={40} className={styles.cota} />
        <Etq x={100} y={54}>
          c
        </Etq>
        <Etq x={130} y={66}>
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'segmento circular area entre cuerda y arco flecha deposito cilindrico tumbado nivel de liquido',
    ejemploTitulo: 'Segmento de 5 cm de radio con ángulo de 90°',
    ejemploPasos: [
      'r = 5 cm, α = 90° → θ = π/2 ≈ 1,5708 rad',
      'sen θ = 1',
      'A = (25 / 2) · (1,5708 − 1) = 12,5 · 0,5708',
      'A = 7,13 cm²',
    ],
    usoReal:
      'Es exactamente la sección de líquido de un depósito cilíndrico tumbado: sirve para saber cuánto combustible o agua queda a partir de la altura marcada por la varilla.',
  },
  {
    id: 'corona-circular',
    categoria: 'curvas',
    nombre: 'Corona circular (anillo)',
    dimensiones: 'R = radio exterior; r = radio interior',
    principalEtq: 'Área',
    principal: <>π·(R² − r²)</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>2·π·(R + r)</>,
    formulas: [
      { etq: 'Área', expr: <>A = π·(R² − r²)</> },
      { etq: 'Perímetro (ambos bordes)', expr: <>P = 2·π·R + 2·π·r = 2·π·(R + r)</> },
      { etq: 'Ancho del anillo', expr: <>e = R − r</> },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={55} className={styles.relleno} />
        <circle cx={100} cy={70} r={30} className={styles.hueco} />
        <line x1={100} y1={70} x2={155} y2={70} className={styles.cota} />
        <line x1={100} y1={70} x2={100} y2={40} className={styles.cota} />
        <Etq x={136} y={62}>
          R
        </Etq>
        <Etq x={110} y={54} anclaje="start">
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'corona circular anillo arandela area entre dos circulos radio exterior interior tubo visto de frente junta',
    ejemploTitulo: 'Corona con R = 8 cm y r = 5 cm',
    ejemploPasos: [
      'R = 8 cm, r = 5 cm',
      'A = π · (64 − 25) = π · 39',
      'A = 122,52 cm²',
      'Restar los radios antes de elevar al cuadrado (8 − 5 = 3) daría 28,27 cm²: es un error.',
    ],
    usoReal:
      'Es la sección de un tubo, la superficie de una arandela y la zona de riego de un pivote circular con un radio central sin cobertura.',
  },
  {
    id: 'elipse',
    categoria: 'curvas',
    nombre: 'Elipse',
    dimensiones: 'a = semieje mayor; b = semieje menor',
    principalEtq: 'Área',
    principal: <>π·a·b</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>aproximación de Ramanujan</>,
    formulas: [
      { etq: 'Área', expr: <>A = π·a·b</> },
      {
        etq: 'Perímetro (Ramanujan)',
        expr: <>P ≈ π·[ 3·(a + b) − √( (3a + b)·(a + 3b) ) ]</>,
      },
      { etq: 'Caso particular', expr: <>si a = b se recupera el círculo: A = π·r²</> },
    ],
    diagrama: (
      <Fig>
        <ellipse cx={100} cy={70} rx={75} ry={45} className={styles.relleno} />
        <line x1={100} y1={70} x2={175} y2={70} className={styles.cota} />
        <line x1={100} y1={70} x2={100} y2={25} className={styles.cota} />
        <circle cx={100} cy={70} r={2.5} fill="currentColor" />
        <Etq x={140} y={62}>
          a
        </Etq>
        <Etq x={110} y={46} anclaje="start">
          b
        </Etq>
      </Fig>
    ),
    busqueda:
      'elipse semieje mayor menor ovalo area de la elipse perimetro ramanujan orbita mesa ovalada',
    ejemploTitulo: 'Elipse con semiejes de 6 cm y 4 cm',
    ejemploPasos: [
      'a = 6 cm, b = 4 cm',
      'A = π · 6 · 4 = 75,40 cm²',
      'P ≈ π · [3 · 10 − √(22 · 18)] = π · (30 − 19,90)',
      'P ≈ π · 10,10 = 31,73 cm',
    ],
    usoReal:
      'Es la forma de las mesas ovaladas, de los espejos y de las órbitas planetarias. Su perímetro no tiene fórmula exacta elemental: se usa una aproximación.',
  },

  /* ══ CUERPOS POLIÉDRICOS ════════════════════════════════════ */
  {
    id: 'cubo',
    categoria: 'poliedros',
    nombre: 'Cubo (hexaedro regular)',
    dimensiones: 'a = arista',
    principalEtq: 'Volumen',
    principal: <>a³</>,
    secundariaEtq: 'Área total',
    secundaria: <>6·a²</>,
    formulas: [
      { etq: 'Área lateral', expr: <>A_lat = 4·a²</> },
      { etq: 'Área total', expr: <>A_tot = 6·a²</> },
      { etq: 'Volumen', expr: <>V = a³</> },
      { etq: 'Diagonal del cuerpo', expr: <>D = a·√3 ≈ 1,7321·a</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="40,50 120,50 120,130 40,130" className={styles.relleno} />
        <polygon points="40,50 75,20 155,20 120,50" className={styles.relleno} />
        <polygon points="120,50 155,20 155,100 120,130" className={styles.relleno} />
        <Etq x={80} y={145}>
          a
        </Etq>
        <Etq x={30} y={95} anclaje="end">
          a
        </Etq>
        <Etq x={142} y={44}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'cubo hexaedro regular arista volumen a al cubo area total seis caras dado caja cubica',
    ejemploTitulo: 'Cubo de 4 cm de arista',
    ejemploPasos: [
      'a = 4 cm',
      'A_tot = 6 · 16 = 96 cm²',
      'V = 4³ = 64 cm³',
      'D = 4 · 1,7321 = 6,93 cm',
    ],
    usoReal:
      'Es la unidad de referencia del volumen: un cubo de 10 cm de arista contiene exactamente 1 litro, y un cubo de 1 m de arista, 1.000 litros.',
  },
  {
    id: 'ortoedro',
    categoria: 'poliedros',
    nombre: 'Ortoedro (prisma rectangular)',
    dimensiones: 'a = largo; b = ancho; c = alto',
    principalEtq: 'Volumen',
    principal: <>a·b·c</>,
    secundariaEtq: 'Área total',
    secundaria: <>2·(a·b + a·c + b·c)</>,
    formulas: [
      { etq: 'Área lateral', expr: <>A_lat = 2·c·(a + b)</> },
      { etq: 'Área total', expr: <>A_tot = 2·(a·b + a·c + b·c)</> },
      { etq: 'Volumen', expr: <>V = a·b·c</> },
      { etq: 'Diagonal del cuerpo', expr: <>D = √(a² + b² + c²)</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="35,55 135,55 135,115 35,115" className={styles.relleno} />
        <polygon points="35,55 65,30 165,30 135,55" className={styles.relleno} />
        <polygon points="135,55 165,30 165,90 135,115" className={styles.relleno} />
        <Etq x={85} y={132}>
          a
        </Etq>
        <Etq x={26} y={90} anclaje="end">
          c
        </Etq>
        <Etq x={155} y={50}>
          b
        </Etq>
      </Fig>
    ),
    busqueda:
      'ortoedro prisma rectangular paralelepipedo caja rectangular largo ancho alto volumen area total contenedor habitacion',
    ejemploTitulo: 'Habitación de 5 m × 4 m × 3 m',
    ejemploPasos: [
      'a = 5 m, b = 4 m, c = 3 m',
      'V = 5 · 4 · 3 = 60 m³ = 60.000 litros de aire',
      'A_tot = 2 · (20 + 15 + 12) = 94 m²',
      'D = √(25 + 16 + 9) = √50 ≈ 7,07 m',
    ],
    usoReal:
      'Con él se calcula la capacidad de un contenedor de mudanza, el volumen de aire de una habitación para dimensionar la ventilación y el cartón necesario para una caja.',
  },
  {
    id: 'prisma-recto',
    categoria: 'poliedros',
    nombre: 'Prisma recto (base cualquiera)',
    dimensiones: 'A_b = área de la base; P_b = perímetro de la base; h = altura',
    principalEtq: 'Volumen',
    principal: <>A_b·h</>,
    secundariaEtq: 'Área lateral',
    secundaria: <>P_b·h</>,
    formulas: [
      { etq: 'Área lateral', expr: <>A_lat = P_b · h</> },
      { etq: 'Área total', expr: <>A_tot = A_lat + 2·A_b</> },
      { etq: 'Volumen', expr: <>V = A_b · h</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="40,120 110,120 140,105 90,92 45,105" className={styles.relleno} />
        <polygon points="40,60 110,60 140,45 90,32 45,45" className={styles.relleno} />
        <line x1={40} y1={60} x2={40} y2={120} className={styles.trazo} />
        <line x1={110} y1={60} x2={110} y2={120} className={styles.trazo} />
        <line x1={140} y1={45} x2={140} y2={105} className={styles.trazo} />
        <line x1={45} y1={45} x2={45} y2={105} className={styles.cota} />
        <Etq x={30} y={95} anclaje="end">
          h
        </Etq>
        <Etq x={100} y={137}>
          A_b
        </Etq>
      </Fig>
    ),
    busqueda:
      'prisma recto base cualquiera volumen area de la base por la altura area lateral perimetro por altura columna',
    ejemploTitulo: 'Prisma de base triangular 3-4-5 y 10 cm de altura',
    ejemploPasos: [
      'Base: A_b = (3 · 4) / 2 = 6 cm²; P_b = 3 + 4 + 5 = 12 cm',
      'A_lat = 12 · 10 = 120 cm²',
      'A_tot = 120 + 2 · 6 = 132 cm²',
      'V = 6 · 10 = 60 cm³',
    ],
    usoReal:
      'Es la fórmula genérica de cualquier pieza de sección constante: una viga, un perfil metálico, un bordillo o una zanja de sección uniforme.',
  },
  {
    id: 'prisma-triangular',
    categoria: 'poliedros',
    nombre: 'Prisma triangular',
    dimensiones: 'b = base del triángulo; h_t = altura del triángulo; L = longitud del prisma',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>b·h_t</>} d="2" />·L
      </>
    ),
    secundariaEtq: 'Área lateral',
    secundaria: <>(a + b + c)·L</>,
    formulas: [
      { etq: 'Área lateral', expr: <>A_lat = (a + b + c) · L</> },
      { etq: 'Área total', expr: <>A_tot = A_lat + b·h_t</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>b·h_t</>} d="2" /> · L
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="40,120 120,120 80,60" className={styles.relleno} />
        <polygon points="40,120 80,60 125,40 85,100" className={styles.relleno} />
        <line x1={120} y1={120} x2={165} y2={100} className={styles.trazo} />
        <line x1={125} y1={40} x2={165} y2={100} className={styles.trazo} />
        <Etq x={80} y={137}>
          b
        </Etq>
        <Etq x={62} y={92} anclaje="end">
          h_t
        </Etq>
        <Etq x={148} y={125}>
          L
        </Etq>
      </Fig>
    ),
    busqueda:
      'prisma triangular tienda de campana carpa cubierta a un agua volumen seccion triangular canal',
    ejemploTitulo: 'Carpa de 3 m de ancho, 2 m de alto y 6 m de largo',
    ejemploPasos: [
      'b = 3 m, h_t = 2 m, L = 6 m',
      'Área del triángulo = (3 · 2) / 2 = 3 m²',
      'V = 3 · 6 = 18 m³',
      'Si los lados inclinados miden 2,5 m: A_lat = (2,5 + 3 + 2,5) · 6 = 48 m²',
    ],
    usoReal:
      'Es la forma de una tienda de campaña, de una cubierta a un agua y del terraplén de un camino, donde el volumen de tierra se calcula así por tramos.',
  },
  {
    id: 'prisma-hexagonal',
    categoria: 'poliedros',
    nombre: 'Prisma hexagonal regular',
    dimensiones: 'a = lado del hexágono; h = altura del prisma',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>3·√3</>} d="2" />·a²·h
      </>
    ),
    secundariaEtq: 'Área lateral',
    secundaria: <>6·a·h</>,
    formulas: [
      { etq: 'Área de la base', expr: <>A_b ≈ 2,5981·a²</> },
      { etq: 'Área lateral', expr: <>A_lat = 6·a·h</> },
      { etq: 'Área total', expr: <>A_tot = 6·a·h + 2·A_b</> },
      { etq: 'Volumen', expr: <>V = A_b · h ≈ 2,5981·a²·h</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="60,120 110,120 135,108 110,96 60,96 35,108" className={styles.relleno} />
        <polygon points="60,60 110,60 135,48 110,36 60,36 35,48" className={styles.relleno} />
        <line x1={35} y1={48} x2={35} y2={108} className={styles.trazo} />
        <line x1={60} y1={60} x2={60} y2={120} className={styles.trazo} />
        <line x1={110} y1={60} x2={110} y2={120} className={styles.trazo} />
        <line x1={135} y1={48} x2={135} y2={108} className={styles.trazo} />
        <Etq x={26} y={88} anclaje="end">
          h
        </Etq>
        <Etq x={85} y={137}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'prisma hexagonal regular lapiz tuerca celda de panal volumen base hexagonal columna hexagonal',
    ejemploTitulo: 'Prisma hexagonal de 2 cm de lado y 9 cm de altura',
    ejemploPasos: [
      'a = 2 cm, h = 9 cm',
      'A_b = 2,5981 · 4 = 10,39 cm²',
      'V = 10,39 · 9 = 93,53 cm³',
      'A_lat = 6 · 2 · 9 = 108 cm²',
    ],
    usoReal:
      'Es la forma de un lápiz, de una tuerca y de las celdas de un panal, donde la geometría hexagonal minimiza el material empleado.',
  },
  {
    id: 'piramide',
    categoria: 'poliedros',
    nombre: 'Pirámide recta (base cualquiera)',
    dimensiones: 'A_b = área de la base; P_b = perímetro de la base; ap = apotema de la pirámide; h = altura',
    principalEtq: 'Volumen',
    principal: <Frac n={<>A_b·h</>} d="3" />,
    secundariaEtq: 'Área lateral',
    secundaria: <Frac n={<>P_b·ap</>} d="2" />,
    formulas: [
      {
        etq: 'Área lateral',
        expr: (
          <>
            A_lat = <Frac n={<>P_b·ap</>} d="2" />
          </>
        ),
      },
      { etq: 'Área total', expr: <>A_tot = A_lat + A_b</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>A_b·h</>} d="3" />
          </>
        ),
      },
      { etq: 'Apotema de la pirámide', expr: <>ap = √(h² + ap_base²)</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="40,115 130,115 165,98 75,98" className={styles.relleno} />
        <polygon points="40,115 130,115 95,25" className={styles.relleno} />
        <polygon points="130,115 165,98 95,25" className={styles.relleno} />
        <line x1={95} y1={25} x2={102} y2={106} className={styles.cota} />
        <Etq x={86} y={78} anclaje="end">
          h
        </Etq>
        <Etq x={128} y={70} anclaje="start">
          ap
        </Etq>
        <Etq x={85} y={133}>
          A_b
        </Etq>
      </Fig>
    ),
    busqueda:
      'piramide recta volumen un tercio del area de la base por la altura apotema de la piramide area lateral',
    ejemploTitulo: 'Pirámide de base pentagonal (A_b = 43 cm², P_b = 30 cm) con h = 9 cm y ap = 10 cm',
    ejemploPasos: [
      'A_lat = (30 · 10) / 2 = 150 cm²',
      'A_tot = 150 + 43 = 193 cm²',
      'V = (43 · 9) / 3',
      'V = 129 cm³',
    ],
    usoReal:
      'El factor 1/3 explica por qué un montón cónico o piramidal de grava ocupa mucho menos de lo que aparenta comparado con la caja que lo envuelve.',
  },
  {
    id: 'piramide-cuadrangular',
    categoria: 'poliedros',
    nombre: 'Pirámide cuadrangular regular',
    dimensiones: 'a = lado de la base cuadrada; h = altura; ap = apotema de la cara (arista inclinada media)',
    principalEtq: 'Volumen',
    principal: <Frac n={<>a²·h</>} d="3" />,
    secundariaEtq: 'Área lateral',
    secundaria: <>2·a·ap</>,
    formulas: [
      { etq: 'Apotema de la cara', expr: <>ap = √( h² + (a/2)² )</> },
      { etq: 'Área lateral', expr: <>A_lat = 2·a·ap</> },
      { etq: 'Área total', expr: <>A_tot = 2·a·ap + a²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>a²·h</>} d="3" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="35,115 125,115 165,95 75,95" className={styles.relleno} />
        <polygon points="35,115 125,115 100,25" className={styles.relleno} />
        <polygon points="125,115 165,95 100,25" className={styles.relleno} />
        <line x1={100} y1={25} x2={100} y2={105} className={styles.cota} />
        <line x1={100} y1={25} x2={80} y2={115} className={styles.cota} />
        <Etq x={92} y={70} anclaje="end">
          h
        </Etq>
        <Etq x={68} y={70} anclaje="end">
          ap
        </Etq>
        <Etq x={80} y={133}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'piramide cuadrangular regular base cuadrada volumen area lateral apotema tejado a cuatro aguas piramide de egipto',
    ejemploTitulo: 'Pirámide de base 6 m y altura 4 m',
    ejemploPasos: [
      'a = 6 m, h = 4 m',
      'ap = √(16 + 9) = √25 = 5 m',
      'A_lat = 2 · 6 · 5 = 60 m²; A_tot = 60 + 36 = 96 m²',
      'V = (36 · 4) / 3 = 48 m³',
    ],
    usoReal:
      'Es la geometría de un tejado a cuatro aguas: el área lateral da los metros cuadrados de teja necesarios, que siempre son más que la planta del edificio.',
  },
  {
    id: 'tronco-piramide',
    categoria: 'poliedros',
    nombre: 'Tronco de pirámide',
    dimensiones: 'A_B = área de la base mayor; A_b = área de la base menor; h = altura entre bases',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n="h" d="3" />·(A_B + A_b + √(A_B·A_b))
      </>
    ),
    secundariaEtq: 'Área lateral',
    secundaria: (
      <>
        <Frac n={<>(P_B + P_b)·ap</>} d="2" />
      </>
    ),
    formulas: [
      {
        etq: 'Área lateral',
        expr: (
          <>
            A_lat = <Frac n={<>(P_B + P_b)·ap</>} d="2" />
          </>
        ),
      },
      { etq: 'Área total', expr: <>A_tot = A_lat + A_B + A_b</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n="h" d="3" /> · ( A_B + A_b + √(A_B · A_b) )
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="35,120 135,120 170,100 70,100" className={styles.relleno} />
        <polygon points="35,120 135,120 125,58 65,58" className={styles.relleno} />
        <polygon points="135,120 170,100 152,46 125,58" className={styles.relleno} />
        <polygon points="65,58 125,58 152,46 92,46" className={styles.relleno} />
        <line x1={95} y1={52} x2={95} y2={110} className={styles.cota} />
        <Etq x={86} y={88} anclaje="end">
          h
        </Etq>
        <Etq x={100} y={137}>
          A_B
        </Etq>
        <Etq x={110} y={40}>
          A_b
        </Etq>
      </Fig>
    ),
    busqueda:
      'tronco de piramide piramide truncada volumen bases desiguales raiz del producto tolva silo troncopiramidal',
    ejemploTitulo: 'Tronco con bases cuadradas de 6 m y 4 m, altura 3 m',
    ejemploPasos: [
      'A_B = 36 m², A_b = 16 m², h = 3 m',
      '√(36 · 16) = √576 = 24',
      'V = (3 / 3) · (36 + 16 + 24)',
      'V = 76 m³',
    ],
    usoReal:
      'Es la forma de una tolva, de un cubo de obra y de muchos depósitos agrícolas. Promediar las dos bases sin el término de la raíz da un resultado erróneo.',
  },
  {
    id: 'tetraedro',
    categoria: 'poliedros',
    nombre: 'Tetraedro regular',
    dimensiones: 'a = arista (4 caras triangulares iguales)',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>a³·√2</>} d="12" />
      </>
    ),
    secundariaEtq: 'Área total',
    secundaria: <>√3·a²</>,
    formulas: [
      { etq: 'Área total', expr: <>A = √3·a² ≈ 1,7321·a²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>a³·√2</>} d="12" /> ≈ 0,1179·a³
          </>
        ),
      },
      { etq: 'Altura', expr: <>h = a·√(2/3) ≈ 0,8165·a</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="35,120 165,120 100,25" className={styles.relleno} />
        <line x1={35} y1={120} x2={110} y2={88} className={styles.trazo} />
        <line x1={165} y1={120} x2={110} y2={88} className={styles.trazo} />
        <line x1={100} y1={25} x2={110} y2={88} className={styles.cota} />
        <Etq x={100} y={138}>
          a
        </Etq>
        <Etq x={56} y={68} anclaje="end">
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'tetraedro regular solido platonico cuatro caras triangulares volumen piramide triangular dado de cuatro caras',
    ejemploTitulo: 'Tetraedro regular de 6 cm de arista',
    ejemploPasos: [
      'a = 6 cm',
      'A = 1,7321 · 36 = 62,35 cm²',
      'V = 0,1179 · 216',
      'V = 25,46 cm³',
    ],
    usoReal:
      'Es el primero de los cinco sólidos platónicos y la forma de los dados de cuatro caras; en química describe la geometría de la molécula de metano.',
  },
  {
    id: 'octaedro',
    categoria: 'poliedros',
    nombre: 'Octaedro regular',
    dimensiones: 'a = arista (8 caras triangulares)',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>√2</>} d="3" />·a³
      </>
    ),
    secundariaEtq: 'Área total',
    secundaria: <>2·√3·a²</>,
    formulas: [
      { etq: 'Área total', expr: <>A = 2·√3·a² ≈ 3,4641·a²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>√2</>} d="3" />·a³ ≈ 0,4714·a³
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="100,15 160,70 100,125 40,70" className={styles.relleno} />
        <line x1={40} y1={70} x2={160} y2={70} className={styles.cota} />
        <line x1={100} y1={15} x2={100} y2={125} className={styles.cota} />
        <Etq x={62} y={38} anclaje="end">
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'octaedro regular solido platonico ocho caras triangulares volumen dado de ocho caras cristal de fluorita',
    ejemploTitulo: 'Octaedro regular de 5 cm de arista',
    ejemploPasos: [
      'a = 5 cm',
      'A = 3,4641 · 25 = 86,60 cm²',
      'V = 0,4714 · 125',
      'V = 58,93 cm³',
    ],
    usoReal:
      'Aparece en la cristalografía (el diamante y la fluorita cristalizan en formas octaédricas) y en los dados de ocho caras de los juegos de rol.',
  },
  {
    id: 'dodecaedro',
    categoria: 'poliedros',
    nombre: 'Dodecaedro regular',
    dimensiones: 'a = arista (12 caras pentagonales)',
    principalEtq: 'Volumen',
    principal: <>≈ 7,6631·a³</>,
    secundariaEtq: 'Área total',
    secundaria: <>≈ 20,6457·a²</>,
    formulas: [
      { etq: 'Área total', expr: <>A = 3·√(25 + 10·√5)·a² ≈ 20,6457·a²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>15 + 7·√5</>} d="4" />·a³ ≈ 7,6631·a³
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon
          points="100,8 159,51 137,120 63,120 41,51"
          className={styles.relleno}
        />
        <polygon points="100,44 122,60 114,86 86,86 78,60" className={styles.trazo} />
        <line x1={100} y1={8} x2={100} y2={44} className={styles.trazo} />
        <line x1={159} y1={51} x2={122} y2={60} className={styles.trazo} />
        <line x1={137} y1={120} x2={114} y2={86} className={styles.trazo} />
        <line x1={63} y1={120} x2={86} y2={86} className={styles.trazo} />
        <line x1={41} y1={51} x2={78} y2={60} className={styles.trazo} />
        <Etq x={100} y={138}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'dodecaedro regular solido platonico doce caras pentagonales volumen dado de doce caras',
    ejemploTitulo: 'Dodecaedro regular de 3 cm de arista',
    ejemploPasos: [
      'a = 3 cm',
      'A = 20,6457 · 9 = 185,81 cm²',
      'V = 7,6631 · 27',
      'V = 206,90 cm³',
    ],
    usoReal:
      'Es el sólido platónico más voluminoso para una arista dada; se usa en calendarios perpetuos de doce caras y en dados de doce caras.',
  },
  {
    id: 'icosaedro',
    categoria: 'poliedros',
    nombre: 'Icosaedro regular',
    dimensiones: 'a = arista (20 caras triangulares)',
    principalEtq: 'Volumen',
    principal: <>≈ 2,1817·a³</>,
    secundariaEtq: 'Área total',
    secundaria: <>5·√3·a²</>,
    formulas: [
      { etq: 'Área total', expr: <>A = 5·√3·a² ≈ 8,6603·a²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n="5" d="12" />·(3 + √5)·a³ ≈ 2,1817·a³
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <polygon points="100,12 152,41 152,99 100,128 48,99 48,41" className={styles.relleno} />
        <polygon points="100,44 126,88 74,88" className={styles.trazo} />
        <line x1={100} y1={12} x2={100} y2={44} className={styles.trazo} />
        <line x1={152} y1={41} x2={126} y2={88} className={styles.trazo} />
        <line x1={48} y1={41} x2={74} y2={88} className={styles.trazo} />
        <line x1={48} y1={99} x2={74} y2={88} className={styles.trazo} />
        <line x1={152} y1={99} x2={126} y2={88} className={styles.trazo} />
        <Etq x={100} y={140}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'icosaedro regular solido platonico veinte caras triangulares volumen dado de veinte caras cupula geodesica',
    ejemploTitulo: 'Icosaedro regular de 4 cm de arista',
    ejemploPasos: [
      'a = 4 cm',
      'A = 8,6603 · 16 = 138,56 cm²',
      'V = 2,1817 · 64',
      'V = 139,63 cm³',
    ],
    usoReal:
      'Es la base de las cúpulas geodésicas y de la cápsula de muchos virus; su subdivisión genera las mallas esféricas usadas en arquitectura ligera.',
  },

  /* ══ CUERPOS DE REVOLUCIÓN ══════════════════════════════════ */
  {
    id: 'cilindro',
    categoria: 'revolucion',
    nombre: 'Cilindro',
    dimensiones: 'r = radio de la base; h = altura',
    principalEtq: 'Volumen',
    principal: <>π·r²·h</>,
    secundariaEtq: 'Área lateral',
    secundaria: <>2·π·r·h</>,
    formulas: [
      { etq: 'Área lateral', expr: <>A_lat = 2·π·r·h</> },
      { etq: 'Área total', expr: <>A_tot = 2·π·r·h + 2·π·r² = 2·π·r·(h + r)</> },
      { etq: 'Volumen', expr: <>V = π·r²·h</> },
      { etq: 'Altura desde el volumen', expr: <>h = V / (π·r²)</> },
    ],
    diagrama: (
      <Fig>
        <path
          d="M 45 35 L 45 105 A 55 18 0 0 0 155 105 L 155 35 Z"
          className={styles.relleno}
        />
        <ellipse cx={100} cy={35} rx={55} ry={18} className={styles.relleno} />
        <line x1={100} y1={35} x2={155} y2={35} className={styles.cota} />
        <line x1={170} y1={35} x2={170} y2={105} className={styles.cota} />
        <Etq x={126} y={29}>
          r
        </Etq>
        <Etq x={178} y={75} anclaje="start">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'cilindro deposito tanque lata tubo volumen pi por radio al cuadrado por altura area lateral litros bidon',
    ejemploTitulo: 'Depósito de 0,5 m de radio y 1,2 m de altura',
    ejemploPasos: [
      'r = 0,5 m, h = 1,2 m',
      'V = π · 0,25 · 1,2 = 0,9425 m³',
      '0,9425 m³ · 1.000 = 942,5 litros',
      'A_lat = 2 · π · 0,5 · 1,2 = 3,77 m² (chapa de la pared)',
    ],
    usoReal:
      'Es la fórmula de los litros de un depósito, de un bidón o de una olla, y del hormigón que cabe en un pilar circular. El área lateral da la etiqueta o la chapa necesaria.',
  },
  {
    id: 'cilindro-hueco',
    categoria: 'revolucion',
    nombre: 'Cilindro hueco (tubo)',
    dimensiones: 'R = radio exterior; r = radio interior; h = longitud del tubo',
    principalEtq: 'Volumen del material',
    principal: <>π·(R² − r²)·h</>,
    secundariaEtq: 'Capacidad interior',
    secundaria: <>π·r²·h</>,
    formulas: [
      { etq: 'Volumen del material', expr: <>V = π·(R² − r²)·h</> },
      { etq: 'Capacidad interior', expr: <>V_int = π·r²·h</> },
      { etq: 'Superficie exterior', expr: <>A_ext = 2·π·R·h</> },
      { etq: 'Espesor de la pared', expr: <>e = R − r</> },
    ],
    diagrama: (
      <Fig>
        <path
          d="M 45 35 L 45 105 A 55 18 0 0 0 155 105 L 155 35 Z"
          className={styles.relleno}
        />
        <ellipse cx={100} cy={35} rx={55} ry={18} className={styles.relleno} />
        <ellipse cx={100} cy={35} rx={33} ry={11} className={styles.hueco} />
        <line x1={100} y1={35} x2={155} y2={35} className={styles.cota} />
        <line x1={170} y1={35} x2={170} y2={105} className={styles.cota} />
        <Etq x={132} y={29}>
          R
        </Etq>
        <Etq x={116} y={50}>
          r
        </Etq>
        <Etq x={178} y={75} anclaje="start">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'cilindro hueco tubo tuberia canon volumen del material capacidad interior espesor de pared corona por altura',
    ejemploTitulo: 'Tubo de 1 m con radios de 6 cm y 5 cm',
    ejemploPasos: [
      'R = 6 cm, r = 5 cm, h = 100 cm',
      'V_material = π · (36 − 25) · 100 = π · 1.100',
      'V_material = 3.455,75 cm³',
      'Capacidad interior = π · 25 · 100 = 7.853,98 cm³ ≈ 7,85 litros',
    ],
    usoReal:
      'Sirve para pedir el peso de una tubería (volumen del material por densidad) y, a la vez, para saber cuánta agua transporta por metro lineal.',
  },
  {
    id: 'cono',
    categoria: 'revolucion',
    nombre: 'Cono',
    dimensiones: 'r = radio de la base; h = altura; g = generatriz (el lado inclinado)',
    principalEtq: 'Volumen',
    principal: <Frac n={<>π·r²·h</>} d="3" />,
    secundariaEtq: 'Área lateral',
    secundaria: <>π·r·g</>,
    formulas: [
      { etq: 'Generatriz', expr: <>g = √(r² + h²)</> },
      { etq: 'Área lateral', expr: <>A_lat = π·r·g (con la generatriz, NO con la altura)</> },
      { etq: 'Área total', expr: <>A_tot = π·r·g + π·r² = π·r·(g + r)</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>π·r²·h</>} d="3" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <path
          d="M 100 20 L 45 110 A 55 17 0 0 0 155 110 Z"
          className={styles.relleno}
        />
        <ellipse cx={100} cy={110} rx={55} ry={17} className={styles.relleno} />
        <line x1={100} y1={20} x2={100} y2={110} className={styles.cota} />
        <line x1={100} y1={110} x2={155} y2={110} className={styles.cota} />
        <Etq x={92} y={72} anclaje="end">
          h
        </Etq>
        <Etq x={130} y={128}>
          r
        </Etq>
        <Etq x={140} y={62} anclaje="start">
          g
        </Etq>
      </Fig>
    ),
    busqueda:
      'cono volumen un tercio generatriz area lateral pi r g monton de arena cucurucho embudo tolva conica',
    ejemploTitulo: 'Cono de 3 m de radio y 4 m de altura',
    ejemploPasos: [
      'r = 3 m, h = 4 m',
      'g = √(9 + 16) = √25 = 5 m',
      'A_lat = π · 3 · 5 = 47,12 m²; A_tot = π · 3 · 8 = 75,40 m²',
      'V = π · 9 · 4 / 3 = 37,70 m³',
    ],
    usoReal:
      'Es el montón de arena o grava de una obra: con el diámetro de la base y la altura se estima el volumen acopiado sin necesidad de pesarlo.',
  },
  {
    id: 'tronco-cono',
    categoria: 'revolucion',
    nombre: 'Tronco de cono',
    dimensiones: 'R = radio mayor; r = radio menor; h = altura; g = generatriz',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>π·h</>} d="3" />·(R² + r² + R·r)
      </>
    ),
    secundariaEtq: 'Área lateral',
    secundaria: <>π·(R + r)·g</>,
    formulas: [
      { etq: 'Generatriz', expr: <>g = √( h² + (R − r)² )</> },
      { etq: 'Área lateral', expr: <>A_lat = π·(R + r)·g</> },
      { etq: 'Área total', expr: <>A_tot = π·(R + r)·g + π·R² + π·r²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>π·h</>} d="3" /> · (R² + r² + R·r)
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <path
          d="M 68 35 L 42 110 A 58 18 0 0 0 158 110 L 132 35 Z"
          className={styles.relleno}
        />
        <ellipse cx={100} cy={35} rx={32} ry={11} className={styles.relleno} />
        <line x1={100} y1={35} x2={132} y2={35} className={styles.cota} />
        <line x1={100} y1={110} x2={158} y2={110} className={styles.cota} />
        <line x1={100} y1={35} x2={100} y2={110} className={styles.cota} />
        <Etq x={118} y={29}>
          r
        </Etq>
        <Etq x={132} y={128}>
          R
        </Etq>
        <Etq x={92} y={78} anclaje="end">
          h
        </Etq>
        <Etq x={150} y={70} anclaje="start">
          g
        </Etq>
      </Fig>
    ),
    busqueda:
      'tronco de cono cono truncado volumen cubo de obra maceta vaso conico papelera generatriz inclinada',
    ejemploTitulo: 'Tronco con R = 5 cm, r = 3 cm y h = 6 cm',
    ejemploPasos: [
      'g = √(36 + 4) = √40 ≈ 6,32 cm',
      'A_lat = π · (5 + 3) · 6,32 = 158,90 cm²',
      'V = (π · 6 / 3) · (25 + 9 + 15) = 2·π · 49',
      'V = 307,88 cm³',
    ],
    usoReal:
      'Es la forma de un cubo de obra, de una maceta y de un vaso cónico. El término R·r es imprescindible: sin él el volumen sale corto.',
  },
  {
    id: 'esfera',
    categoria: 'revolucion',
    nombre: 'Esfera',
    dimensiones: 'r = radio; d = diámetro',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n="4" d="3" />·π·r³
      </>
    ),
    secundariaEtq: 'Superficie',
    secundaria: <>4·π·r²</>,
    formulas: [
      { etq: 'Superficie', expr: <>A = 4·π·r² = π·d²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n="4" d="3" />·π·r³
          </>
        ),
      },
      { etq: 'Radio desde el volumen', expr: <>r = ∛( 3·V / (4·π) )</> },
      { etq: 'Círculo máximo', expr: <>A_círculo = π·r² (la superficie es 4 veces mayor)</> },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={55} className={styles.relleno} />
        <ellipse cx={100} cy={70} rx={55} ry={17} className={styles.cota} />
        <line x1={100} y1={70} x2={155} y2={70} className={styles.cota} />
        <circle cx={100} cy={70} r={2.5} fill="currentColor" />
        <Etq x={128} y={62}>
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'esfera bola pelota volumen cuatro tercios de pi r al cubo superficie cuatro pi r cuadrado globo balon',
    ejemploTitulo: 'Esfera de 6 cm de radio',
    ejemploPasos: [
      'r = 6 cm',
      'A = 4 · π · 36 = 452,39 cm²',
      'V = (4/3) · π · 216',
      'V = 904,78 cm³',
    ],
    usoReal:
      'Sirve para calcular el gas de un tanque esférico, la pintura de una cúpula o el material de un balón. Al duplicar el radio, la superficie se multiplica por 4 y el volumen por 8.',
  },
  {
    id: 'casquete-esferico',
    categoria: 'revolucion',
    nombre: 'Casquete esférico',
    dimensiones: 'r = radio de la esfera; h = altura del casquete; a = radio del círculo de la base',
    principalEtq: 'Volumen',
    principal: (
      <>
        π·h²·(r − <Frac n="h" d="3" />)
      </>
    ),
    secundariaEtq: 'Superficie curva',
    secundaria: <>2·π·r·h</>,
    formulas: [
      { etq: 'Superficie curva', expr: <>A_curva = 2·π·r·h</> },
      { etq: 'Radio de la base', expr: <>a = √(2·r·h − h²)</> },
      { etq: 'Área total (con tapa)', expr: <>A_tot = 2·π·r·h + π·a²</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>π·h²·(3·r − h)</>} d="3" />
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={55} className={styles.trazo} />
        <path d="M 57.6 35 A 55 55 0 0 1 142.4 35 Z" className={styles.relleno} />
        <line x1={57.6} y1={35} x2={142.4} y2={35} className={styles.cota} />
        <line x1={100} y1={15} x2={100} y2={35} className={styles.cota} />
        <line x1={100} y1={70} x2={140} y2={32} className={styles.cota} />
        <Etq x={110} y={30} anclaje="start">
          h
        </Etq>
        <Etq x={100} y={50}>
          a
        </Etq>
        <Etq x={128} y={62}>
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'casquete esferico calota cupula volumen del casquete superficie curva fondo bombeado deposito domo',
    ejemploTitulo: 'Casquete de 4 cm de altura en una esfera de 10 cm de radio',
    ejemploPasos: [
      'r = 10 cm, h = 4 cm',
      'A_curva = 2 · π · 10 · 4 = 251,33 cm²',
      'V = π · 16 · (30 − 4) / 3 = π · 138,67',
      'V = 435,63 cm³',
    ],
    usoReal:
      'Es el fondo bombeado de un depósito y la forma de una cúpula: la superficie curva da los metros cuadrados de cubierta y el volumen, la capacidad extra del fondo.',
  },
  {
    id: 'zona-esferica',
    categoria: 'revolucion',
    nombre: 'Zona esférica (franja)',
    dimensiones: 'r = radio de la esfera; h = separación entre los dos planos; a y b = radios de los dos círculos',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>π·h</>} d="6" />·(3a² + 3b² + h²)
      </>
    ),
    secundariaEtq: 'Superficie curva',
    secundaria: <>2·π·r·h</>,
    formulas: [
      { etq: 'Superficie curva', expr: <>A_curva = 2·π·r·h (solo depende de h)</> },
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>π·h</>} d="6" /> · (3·a² + 3·b² + h²)
          </>
        ),
      },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={55} className={styles.trazo} />
        <path
          d="M 57.6 35 A 55 55 0 0 0 46.4 95 L 153.6 95 A 55 55 0 0 0 142.4 35 Z"
          className={styles.relleno}
        />
        <line x1={57.6} y1={35} x2={142.4} y2={35} className={styles.cota} />
        <line x1={46.4} y1={95} x2={153.6} y2={95} className={styles.cota} />
        <line x1={166} y1={35} x2={166} y2={95} className={styles.cota} />
        <Etq x={100} y={30}>
          a
        </Etq>
        <Etq x={100} y={110}>
          b
        </Etq>
        <Etq x={176} y={70} anclaje="start">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'zona esferica franja esferica segmento de dos bases superficie curva arquimedes deposito esferico parcial',
    ejemploTitulo: 'Franja de 5 cm entre círculos de 8 cm y 6 cm en una esfera de 10 cm',
    ejemploPasos: [
      'r = 10 cm, h = 5 cm, a = 8 cm, b = 6 cm',
      'A_curva = 2 · π · 10 · 5 = 314,16 cm²',
      'V = (π · 5 / 6) · (192 + 108 + 25) = (π · 5 / 6) · 325',
      'V = 850,85 cm³',
    ],
    usoReal:
      'Se usa para calcular el nivel de llenado de un tanque esférico de gas o agua entre dos alturas, y en cartografía para la superficie de una banda de latitud.',
  },
  {
    id: 'sector-esferico',
    categoria: 'revolucion',
    nombre: 'Sector esférico',
    dimensiones: 'r = radio de la esfera; h = altura del casquete asociado; a = radio de la base del casquete',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n="2" d="3" />·π·r²·h
      </>
    ),
    secundariaEtq: 'Área total',
    secundaria: <>π·r·(2·h + a)</>,
    formulas: [
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n="2" d="3" />·π·r²·h
          </>
        ),
      },
      { etq: 'Área total', expr: <>A = π·r·(2·h + a), con a = √(2·r·h − h²)</> },
    ],
    diagrama: (
      <Fig>
        <circle cx={100} cy={70} r={55} className={styles.trazo} />
        <path
          d="M 100 70 L 57.6 35 A 55 55 0 0 1 142.4 35 Z"
          className={styles.relleno}
        />
        <line x1={100} y1={15} x2={100} y2={35} className={styles.cota} />
        <Etq x={110} y={30} anclaje="start">
          h
        </Etq>
        <Etq x={70} y={62} anclaje="end">
          r
        </Etq>
        <Etq x={100} y={50}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'sector esferico cono mas casquete volumen dos tercios porcion de esfera gajo helado',
    ejemploTitulo: 'Sector esférico con r = 9 cm y h = 3 cm',
    ejemploPasos: [
      'r = 9 cm, h = 3 cm',
      'V = (2/3) · π · 81 · 3 = 2 · π · 81',
      'V = 508,94 cm³',
      'a = √(54 − 9) = √45 ≈ 6,71 cm; A = π · 9 · (6 + 6,71) = 359,3 cm²',
    ],
    usoReal:
      'Modela la porción de material que retira una fresa esférica y el volumen barrido por un aspersor de cobertura parcial sobre una cúpula.',
  },
  {
    id: 'toro',
    categoria: 'revolucion',
    nombre: 'Toro (donut)',
    dimensiones: 'R = distancia del centro al eje del tubo; r = radio del tubo',
    principalEtq: 'Volumen',
    principal: <>2·π²·R·r²</>,
    secundariaEtq: 'Superficie',
    secundaria: <>4·π²·R·r</>,
    formulas: [
      { etq: 'Superficie', expr: <>A = 4·π²·R·r ≈ 39,478·R·r</> },
      { etq: 'Volumen', expr: <>V = 2·π²·R·r² ≈ 19,739·R·r²</> },
      { etq: 'Condición', expr: <>R &gt; r para que el agujero central exista</> },
    ],
    diagrama: (
      <Fig>
        <ellipse cx={100} cy={70} rx={75} ry={42} className={styles.relleno} />
        <ellipse cx={100} cy={70} rx={30} ry={15} className={styles.hueco} />
        <line x1={100} y1={70} x2={47} y2={70} className={styles.cota} />
        <line x1={47} y1={70} x2={26} y2={70} className={styles.cota} />
        <Etq x={74} y={62}>
          R
        </Etq>
        <Etq x={36} y={90}>
          r
        </Etq>
      </Fig>
    ),
    busqueda:
      'toro donut rosquilla anillo camara de aire neumatico volumen del toro superficie junta torica flotador',
    ejemploTitulo: 'Toro con R = 20 cm y r = 4 cm',
    ejemploPasos: [
      'R = 20 cm, r = 4 cm',
      'A = 39,478 · 20 · 4 = 3.158,27 cm²',
      'V = 19,739 · 20 · 16',
      'V = 6.316,55 cm³',
    ],
    usoReal:
      'Es la geometría de una cámara de aire, un flotador, una junta tórica y el toroide de una bobina eléctrica; el volumen indica cuánto aire o material contiene.',
  },
  {
    id: 'elipsoide',
    categoria: 'revolucion',
    nombre: 'Elipsoide',
    dimensiones: 'a, b, c = los tres semiejes',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n="4" d="3" />·π·a·b·c
      </>
    ),
    secundariaEtq: 'Caso esfera',
    secundaria: <>si a = b = c queda la esfera</>,
    formulas: [
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n="4" d="3" />·π·a·b·c
          </>
        ),
      },
      {
        etq: 'Superficie (aproximada)',
        expr: <>A ≈ 4·π·[ (a^1,6·b^1,6 + a^1,6·c^1,6 + b^1,6·c^1,6) / 3 ]^(1/1,6)</>,
      },
    ],
    diagrama: (
      <Fig>
        <ellipse cx={100} cy={70} rx={70} ry={45} className={styles.relleno} />
        <ellipse cx={100} cy={70} rx={70} ry={15} className={styles.cota} />
        <line x1={100} y1={70} x2={170} y2={70} className={styles.cota} />
        <line x1={100} y1={70} x2={100} y2={25} className={styles.cota} />
        <Etq x={140} y={62}>
          a
        </Etq>
        <Etq x={108} y={45} anclaje="start">
          b
        </Etq>
        <Etq x={72} y={86} anclaje="end">
          c
        </Etq>
      </Fig>
    ),
    busqueda:
      'elipsoide esferoide volumen tres semiejes balon de rugby huevo forma de la tierra achatada',
    ejemploTitulo: 'Elipsoide con semiejes 5, 4 y 3 cm',
    ejemploPasos: [
      'a = 5 cm, b = 4 cm, c = 3 cm',
      'V = (4/3) · π · 5 · 4 · 3',
      'V = (4/3) · π · 60',
      'V = 251,33 cm³',
    ],
    usoReal:
      'Describe la forma real del planeta (achatado por los polos), la de un huevo y la de los tanques de gas licuado, cuyo volumen se calcula con esta fórmula.',
  },

  /* ══ FIGURAS COMPUESTAS ═════════════════════════════════════ */
  {
    id: 'capsula',
    categoria: 'compuestas',
    nombre: 'Depósito cilíndrico con fondos semiesféricos',
    dimensiones: 'r = radio; h = longitud de la parte cilíndrica (sin los fondos)',
    principalEtq: 'Volumen',
    principal: (
      <>
        π·r²·h + <Frac n="4" d="3" />·π·r³
      </>
    ),
    secundariaEtq: 'Superficie',
    secundaria: <>2·π·r·h + 4·π·r²</>,
    formulas: [
      {
        etq: 'Volumen',
        expr: (
          <>
            V = π·r²·h + <Frac n="4" d="3" />·π·r³
          </>
        ),
      },
      { etq: 'Superficie', expr: <>A = 2·π·r·h + 4·π·r²</> },
      { etq: 'Longitud total', expr: <>L = h + 2·r</> },
    ],
    diagrama: (
      <Fig>
        <path
          d="M 60 105 L 60 45 A 40 40 0 0 1 140 45 L 140 105 A 40 40 0 0 1 60 105 Z"
          className={styles.relleno}
        />
        <line x1={60} y1={45} x2={140} y2={45} className={styles.cota} />
        <line x1={60} y1={105} x2={140} y2={105} className={styles.cota} />
        <line x1={155} y1={45} x2={155} y2={105} className={styles.cota} />
        <line x1={100} y1={75} x2={140} y2={75} className={styles.cota} />
        <Etq x={120} y={70}>
          r
        </Etq>
        <Etq x={163} y={80} anclaje="start">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'deposito con fondos semiesfericos capsula tanque de gas cilindro mas dos medias esferas volumen compuesto botella de butano',
    ejemploTitulo: 'Depósito de 0,5 m de radio y 2 m de cuerpo cilíndrico',
    ejemploPasos: [
      'r = 0,5 m, h = 2 m',
      'Cilindro: π · 0,25 · 2 = 1,5708 m³',
      'Dos medias esferas = una esfera: (4/3) · π · 0,125 = 0,5236 m³',
      'V = 1,5708 + 0,5236 = 2,094 m³ ≈ 2.094 litros',
    ],
    usoReal:
      'Los tanques de gas a presión llevan fondos curvos precisamente porque resisten mejor; las dos mitades juntas equivalen a una esfera completa.',
  },
  {
    id: 'silo',
    categoria: 'compuestas',
    nombre: 'Silo (cilindro + cono)',
    dimensiones: 'r = radio; h₁ = altura del cilindro; h₂ = altura del cono',
    principalEtq: 'Volumen',
    principal: (
      <>
        π·r²·h₁ + <Frac n={<>π·r²·h₂</>} d="3" />
      </>
    ),
    secundariaEtq: 'Superficie',
    secundaria: <>2·π·r·h₁ + π·r·g</>,
    formulas: [
      {
        etq: 'Volumen',
        expr: (
          <>
            V = π·r²·h₁ + <Frac n={<>π·r²·h₂</>} d="3" />
          </>
        ),
      },
      { etq: 'Generatriz del cono', expr: <>g = √(r² + h₂²)</> },
      { etq: 'Superficie exterior', expr: <>A = 2·π·r·h₁ + π·r·g</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="55,45 145,45 100,10" className={styles.relleno} />
        <path
          d="M 55 45 L 55 110 A 45 14 0 0 0 145 110 L 145 45 Z"
          className={styles.relleno}
        />
        <line x1={100} y1={45} x2={145} y2={45} className={styles.cota} />
        <line x1={160} y1={45} x2={160} y2={110} className={styles.cota} />
        <line x1={160} y1={10} x2={160} y2={45} className={styles.cota} />
        <Etq x={122} y={40}>
          r
        </Etq>
        <Etq x={168} y={82} anclaje="start">
          h₁
        </Etq>
        <Etq x={168} y={32} anclaje="start">
          h₂
        </Etq>
      </Fig>
    ),
    busqueda:
      'silo cilindro mas cono volumen compuesto deposito de grano tolva conica capacidad agricola',
    ejemploTitulo: 'Silo de 2 m de radio, cuerpo de 6 m y cono de 3 m',
    ejemploPasos: [
      'r = 2 m, h₁ = 6 m, h₂ = 3 m',
      'Cilindro: π · 4 · 6 = 75,40 m³',
      'Cono: π · 4 · 3 / 3 = 12,57 m³',
      'V = 87,96 m³',
    ],
    usoReal:
      'Es la capacidad real de un silo de grano o de cemento. La parte cónica aporta bastante menos de lo que su altura sugiere, por el factor 1/3.',
  },
  {
    id: 'pared-huecos',
    categoria: 'compuestas',
    nombre: 'Superficie a pintar (pared con huecos)',
    dimensiones: 'A_pared = superficie bruta; A_huecos = puertas y ventanas que se restan',
    principalEtq: 'Área neta',
    principal: <>A_pared − Σ A_huecos</>,
    secundariaEtq: 'Pintura',
    secundaria: <>A_neta / rendimiento</>,
    formulas: [
      { etq: 'Área bruta', expr: <>A_pared = largo · alto</> },
      { etq: 'Área neta', expr: <>A_neta = A_pared − Σ (ancho · alto de cada hueco)</> },
      { etq: 'Litros de pintura', expr: <>L = A_neta · nº de manos / rendimiento (m²/L)</> },
    ],
    diagrama: (
      <Fig>
        <rect x={20} y={30} width={160} height={90} className={styles.relleno} />
        <rect x={40} y={70} width={30} height={50} className={styles.hueco} />
        <rect x={110} y={50} width={45} height={35} className={styles.hueco} />
        <Etq x={100} y={137}>
          largo
        </Etq>
        <Etq x={12} y={78} anclaje="end">
          alto
        </Etq>
      </Fig>
    ),
    busqueda:
      'superficie a pintar pared con huecos descontar puertas ventanas metros cuadrados de pintura area neta revoco alicatado',
    ejemploTitulo: 'Pared de 5 m × 2,6 m con una puerta y una ventana',
    ejemploPasos: [
      'A_pared = 5 · 2,6 = 13 m²',
      'Puerta: 0,8 · 2,05 = 1,64 m²; ventana: 1,2 · 1,1 = 1,32 m²',
      'A_neta = 13 − 2,96 = 10,04 m²',
      'Con rendimiento de 10 m²/L y dos manos: 10,04 · 2 / 10 ≈ 2 litros',
    ],
    usoReal:
      'Es el cálculo previo a comprar pintura, azulejos o papel pintado. Descontar huecos evita comprar de más, aunque conviene añadir un 10 % de merma por cortes.',
  },
  {
    id: 'casa-dos-aguas',
    categoria: 'compuestas',
    nombre: 'Nave a dos aguas (ortoedro + prisma triangular)',
    dimensiones: 'a = ancho; L = largo; h = altura de los muros; h_c = altura de la cumbrera sobre los muros',
    principalEtq: 'Volumen',
    principal: (
      <>
        a·L·h + <Frac n={<>a·h_c</>} d="2" />·L
      </>
    ),
    secundariaEtq: 'Cubierta',
    secundaria: <>2·L·√((a/2)² + h_c²)</>,
    formulas: [
      {
        etq: 'Volumen',
        expr: (
          <>
            V = a·L·h + <Frac n={<>a·h_c</>} d="2" />·L
          </>
        ),
      },
      { etq: 'Faldón (lado inclinado)', expr: <>f = √( (a/2)² + h_c² )</> },
      { etq: 'Superficie de cubierta', expr: <>A_cubierta = 2·f·L</> },
    ],
    diagrama: (
      <Fig>
        <rect x={35} y={70} width={130} height={50} className={styles.relleno} />
        <polygon points="30,70 170,70 100,25" className={styles.relleno} />
        <line x1={100} y1={25} x2={100} y2={70} className={styles.cota} />
        <line x1={20} y1={70} x2={20} y2={120} className={styles.cota} />
        <Etq x={110} y={52} anclaje="start">
          h_c
        </Etq>
        <Etq x={12} y={98} anclaje="end">
          h
        </Etq>
        <Etq x={100} y={137}>
          a
        </Etq>
      </Fig>
    ),
    busqueda:
      'nave a dos aguas casa con tejado volumen compuesto cubierta faldon metros de teja almacen granero',
    ejemploTitulo: 'Nave de 8 m de ancho, 12 m de largo, muros de 3 m y cumbrera de 2 m',
    ejemploPasos: [
      'Cuerpo: 8 · 12 · 3 = 288 m³',
      'Cubierta (prisma triangular): (8 · 2 / 2) · 12 = 96 m³',
      'V = 384 m³',
      'Faldón: √(16 + 4) = 4,47 m → cubierta = 2 · 4,47 · 12 = 107,3 m² de teja',
    ],
    usoReal:
      'La superficie de cubierta siempre supera a la planta del edificio: los 96 m² de planta se convierten en 107 m² de teja por la inclinación.',
  },
  {
    id: 'piscina-variable',
    categoria: 'compuestas',
    nombre: 'Piscina de profundidad variable',
    dimensiones: 'L = largo; A = ancho; p₁ = profundidad menor; p₂ = profundidad mayor',
    principalEtq: 'Volumen',
    principal: (
      <>
        <Frac n={<>p₁ + p₂</>} d="2" />·L·A
      </>
    ),
    secundariaEtq: 'Superficie de agua',
    secundaria: <>L·A</>,
    formulas: [
      {
        etq: 'Volumen',
        expr: (
          <>
            V = <Frac n={<>(p₁ + p₂)</>} d="2" /> · L · A
          </>
        ),
      },
      { etq: 'Superficie de agua', expr: <>A_lámina = L · A</> },
      { etq: 'Capacidad en litros', expr: <>litros = V (m³) · 1.000</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="30,40 170,40 170,115 30,72" className={styles.relleno} />
        <line x1={30} y1={40} x2={30} y2={72} className={styles.cota} />
        <line x1={170} y1={40} x2={170} y2={115} className={styles.cota} />
        <Etq x={22} y={62} anclaje="end">
          p₁
        </Etq>
        <Etq x={180} y={82} anclaje="start">
          p₂
        </Etq>
        <Etq x={100} y={32}>
          L
        </Etq>
      </Fig>
    ),
    busqueda:
      'piscina de profundidad variable volumen fondo inclinado litros de agua prisma trapecial alberca pileta',
    ejemploTitulo: 'Piscina de 10 m × 5 m con profundidades de 1,2 m y 2,0 m',
    ejemploPasos: [
      'Profundidad media = (1,2 + 2,0) / 2 = 1,6 m',
      'V = 1,6 · 10 · 5',
      'V = 80 m³',
      '80 m³ = 80.000 litros',
    ],
    usoReal:
      'Sirve para dosificar el cloro (que se calcula por metro cúbico) y para dimensionar la bomba de filtración, que debe recircular todo el volumen varias veces al día.',
  },
  {
    id: 'parcela-l',
    categoria: 'compuestas',
    nombre: 'Parcela en forma de L',
    dimensiones: 'Rectángulo envolvente menos la esquina que falta',
    principalEtq: 'Área',
    principal: <>A_grande − A_esquina</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>igual al del rectángulo envolvente</>,
    formulas: [
      { etq: 'Área (por resta)', expr: <>A = (L·An) − (l·an)</> },
      { etq: 'Área (por suma)', expr: <>A = A_rect1 + A_rect2 (partiendo la L en dos)</> },
      { etq: 'Perímetro', expr: <>P = 2·(L + An), el mismo que el rectángulo envolvente</> },
    ],
    diagrama: (
      <Fig>
        <polygon points="25,25 175,25 175,80 105,80 105,120 25,120" className={styles.relleno} />
        <line x1={105} y1={80} x2={175} y2={80} className={styles.cota} />
        <line x1={105} y1={80} x2={105} y2={120} className={styles.cota} />
        <Etq x={100} y={18}>
          L
        </Etq>
        <Etq x={17} y={75} anclaje="end">
          An
        </Etq>
        <Etq x={140} y={105}>
          hueco
        </Etq>
      </Fig>
    ),
    busqueda:
      'parcela en forma de l terreno irregular descomponer en rectangulos area por resta perimetro envolvente solar',
    ejemploTitulo: 'Parcela de 20 m × 12 m con una esquina de 8 m × 5 m fuera',
    ejemploPasos: [
      'Rectángulo envolvente: 20 · 12 = 240 m²',
      'Esquina que falta: 8 · 5 = 40 m²',
      'A = 240 − 40 = 200 m²',
      'P = 2 · (20 + 12) = 64 m (el perímetro no cambia al quitar la esquina)',
    ],
    usoReal:
      'Es el caso habitual de un solar entre medianeras. Que el perímetro coincida con el del rectángulo envolvente sorprende, pero se comprueba sumando lado a lado.',
  },
  {
    id: 'pista-estadio',
    categoria: 'compuestas',
    nombre: 'Forma de estadio (rectángulo + dos semicírculos)',
    dimensiones: 'b = longitud del tramo recto; h = anchura total; r = h/2',
    principalEtq: 'Área',
    principal: <>b·h + π·r²</>,
    secundariaEtq: 'Perímetro',
    secundaria: <>2·b + 2·π·r</>,
    formulas: [
      { etq: 'Radio de los extremos', expr: <>r = h / 2</> },
      { etq: 'Área', expr: <>A = b·h + π·r²</> },
      { etq: 'Perímetro', expr: <>P = 2·b + 2·π·r</> },
    ],
    diagrama: (
      <Fig>
        <path
          d="M 60 35 L 140 35 A 35 35 0 0 1 140 105 L 60 105 A 35 35 0 0 1 60 35 Z"
          className={styles.relleno}
        />
        <line x1={60} y1={70} x2={140} y2={70} className={styles.cota} />
        <line x1={175} y1={35} x2={175} y2={105} className={styles.cota} />
        <Etq x={100} y={64}>
          b
        </Etq>
        <Etq x={183} y={75} anclaje="start">
          h
        </Etq>
      </Fig>
    ),
    busqueda:
      'forma de estadio pista de atletismo rectangulo mas dos semicirculos ovalo redondeado area perimetro plaza alargada',
    ejemploTitulo: 'Pista con tramo recto de 50 m y anchura de 40 m',
    ejemploPasos: [
      'b = 50 m, h = 40 m → r = 20 m',
      'A = 50 · 40 + π · 400 = 2.000 + 1.256,64',
      'A = 3.256,64 m²',
      'P = 2 · 50 + 2 · π · 20 = 100 + 125,66 = 225,66 m',
    ],
    usoReal:
      'Es la planta de una pista de atletismo, de una plaza alargada y de muchos depósitos de decantación; los dos semicírculos juntos forman un círculo completo.',
  },
];

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaAreasVolumenesPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega con un problema delante escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return FIGURAS.filter((figura) => {
      const coincideCategoria = categoriaActiva === 'todas' || figura.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(`${figura.nombre} ${figura.busqueda} ${figura.dimensiones}`).includes(
        termino,
      );
    });
  }, [consulta, categoriaActiva]);

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
          <span aria-hidden="true">📐</span> Tabla de Áreas, Perímetros y Volúmenes
        </h1>
        <p className={styles.subtitle}>
          Formulario de geometría con {FIGURAS.length} figuras: perímetro, área y volumen de
          polígonos, figuras curvas y cuerpos geométricos. Cada ficha lleva un diagrama con las
          letras explicadas, un ejemplo numérico resuelto y para qué sirve en la vida real.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de figuras geométricas">
        <label className={styles.buscadorLabel} htmlFor="buscador-figuras">
          Busca una figura por nombre, dimensión o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-figuras"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="trapecio, cono, esfera, hexágono, depósito…"
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
          Funciona con acentos o sin ellos y acepta sinónimos regionales:{' '}
          <strong>triangulo</strong> encuentra triángulo, <strong>paralelepípedo</strong> y{' '}
          <strong>prisma rectangular</strong> llevan al ortoedro, y <strong>alberca</strong> o{' '}
          <strong>pileta</strong> llevan a la piscina.
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
          {resultados.length} de {FIGURAS.length} figuras
        </p>
      </section>

      {/* Tabla de figuras */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna figura que coincida con «{consulta}».
            Prueba con otro término (por ejemplo, <strong>trapecio</strong>,{' '}
            <strong>cilindro</strong>, <strong>corona</strong> o <strong>tejado</strong>) o quita el
            filtro de categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((figura) => {
            const abierta = abiertas.includes(figura.id);
            return (
              <li key={figura.id} className={styles.fila}>
                <button
                  type="button"
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${figura.id}`}
                  onClick={() => alternarFila(figura.id)}
                >
                  <span className={styles.filaNombre}>
                    {figura.nombre}
                    <span className={styles.filaCategoria}>
                      {NOMBRE_CATEGORIA[figura.categoria]}
                    </span>
                    <span className={styles.dimensionesBadge}>{figura.dimensiones}</span>
                  </span>
                  <span className={styles.filaFormulas}>
                    <span className={styles.par}>
                      <span className={styles.etq}>{figura.principalEtq}</span>
                      <span className={styles.expr}>{figura.principal}</span>
                    </span>
                    {figura.secundaria && (
                      <span className={styles.par}>
                        <span className={styles.etq}>{figura.secundariaEtq}</span>
                        <span className={`${styles.expr} ${styles.exprSecundaria}`}>
                          {figura.secundaria}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${figura.id}`} className={styles.detalle}>
                    <div className={styles.detalleGrid}>
                      <div>
                        <div className={styles.diagramaCaja}>{figura.diagrama}</div>
                        <p className={styles.piePlano}>{figura.dimensiones}</p>
                      </div>
                      <div>
                        <h3>Fórmulas</h3>
                        <ul className={styles.formulaLista}>
                          {figura.formulas.map((formula) => (
                            <li key={formula.etq} className={styles.formulaItem}>
                              <span className={styles.formulaEtq}>{formula.etq}</span>
                              <span className={styles.formulaExpr}>{formula.expr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className={styles.ejemplo}>
                      <h3>
                        <span aria-hidden="true">✏️</span> Ejemplo resuelto: {figura.ejemploTitulo}
                      </h3>
                      <ol>
                        {figura.ejemploPasos.map((paso) => (
                          <li key={paso}>{paso}</li>
                        ))}
                      </ol>
                    </div>

                    <p className={styles.usoReal}>
                      <span aria-hidden="true">🛠️</span> <strong>Dónde se usa:</strong>{' '}
                      {figura.usoReal}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender las fórmulas, no solo copiarlas"
        subtitle="Qué significa cada letra, cómo se relacionan área y volumen y dónde falla la intuición"
      >
        <section className={styles.guideSection}>
          <h2>Perímetro, área y volumen: tres preguntas distintas</h2>
          <p>
            Las tres magnitudes miden cosas diferentes y se expresan en unidades diferentes. El{' '}
            <strong>perímetro</strong> es la longitud del contorno y se mide en metros: responde a
            «¿cuánta valla, rodapié o cinta necesito?». El <strong>área</strong> es la superficie
            encerrada y se mide en metros cuadrados: responde a «¿cuánta pintura, césped o baldosa?».
            El <strong>volumen</strong> es el espacio ocupado y se mide en metros cúbicos: responde a
            «¿cuánta agua, hormigón o aire cabe?».
          </p>
          <p>
            La relación entre unidades es donde más se falla. Un metro cuadrado son 10.000 cm², no
            100; y un metro cúbico son 1.000.000 cm³, además de equivaler a 1.000 litros. Cuando
            duplicas todas las medidas de una figura, el perímetro se duplica, el área se multiplica
            por 4 y el volumen por 8.
          </p>
          <div className={styles.formulaBox}>
            1 m² = 10.000 cm² · 1 m³ = 1.000 litros · 1 litro = 1 dm³ = 1.000 cm³
          </div>

          <h2>Las cinco familias de fórmulas, de un vistazo</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Patrón de la fórmula</th>
                  <th>Dato que más se confunde</th>
                  <th>Dónde aparece</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Polígonos</strong>
                  </td>
                  <td>Base por altura, entera o partida por 2</td>
                  <td>La altura es perpendicular, nunca el lado inclinado</td>
                  <td>Parcelas, paredes, piezas de carpintería</td>
                </tr>
                <tr>
                  <td>
                    <strong>Figuras curvas</strong>
                  </td>
                  <td>Siempre con π y con el radio al cuadrado</td>
                  <td>Meter el diámetro donde va el radio</td>
                  <td>Tuberías, mesas redondas, riego por pivote</td>
                </tr>
                <tr>
                  <td>
                    <strong>Prismas y cilindros</strong>
                  </td>
                  <td>Área de la base por la altura</td>
                  <td>Usar el área total de la base en vez del área plana</td>
                  <td>Vigas, depósitos, zanjas, columnas</td>
                </tr>
                <tr>
                  <td>
                    <strong>Pirámides y conos</strong>
                  </td>
                  <td>Lo mismo, dividido entre 3</td>
                  <td>Olvidar el 1/3, o usar h en vez de g en el área lateral</td>
                  <td>Tejados, tolvas, montones de árido</td>
                </tr>
                <tr>
                  <td>
                    <strong>Esfera y derivados</strong>
                  </td>
                  <td>4πr² para la superficie, (4/3)πr³ para el volumen</td>
                  <td>Intercambiar los exponentes 2 y 3</td>
                  <td>Tanques de gas, cúpulas, balones</td>
                </tr>
                <tr>
                  <td>
                    <strong>Compuestas</strong>
                  </td>
                  <td>Sumar partes y restar huecos</td>
                  <td>No descomponer y aplicar una fórmula «parecida»</td>
                  <td>Silos, piscinas, solares, naves</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Para qué sirven estas fórmulas fuera del aula</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🧱
              </span>
              <strong>Obra y albañilería</strong>
              <p>
                El hormigón se pide en metros cúbicos y las baldosas en metros cuadrados. Una zanja
                es un prisma, un pilar circular es un cilindro y un montón de árido es un cono: con
                tres medidas se sabe cuánto pedir.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🌾
              </span>
              <strong>Campo y ganadería</strong>
              <p>
                La superficie de una parcela decide la semilla y el abono; la capacidad de un silo o
                de un bebedero decide la logística. Las fincas irregulares se resuelven
                descomponiéndolas en triángulos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎨
              </span>
              <strong>Pintura y acabados</strong>
              <p>
                El rendimiento de la pintura viene en metros cuadrados por litro, así que hay que
                calcular la superficie neta descontando puertas y ventanas y multiplicar por el
                número de manos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎓
              </span>
              <strong>Secundaria y preparatoria</strong>
              <p>
                Es el bloque de geometría métrica presente en toda la educación media
                hispanohablante, y reaparece en los exámenes de admisión universitaria y en el
                primer curso de carreras técnicas.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es exactamente la «h» de un trapecio o de un paralelogramo?</h4>
              <p>
                Es la distancia perpendicular entre las dos bases paralelas, no el lado inclinado. En
                un trapecio con B = 8, b = 5 y lado inclinado de 5, usar el lado en vez de la altura
                real de 4 da 32,5 en lugar de 26: un 25 % de error. Cuando el dibujo no lo aclara,
                la altura se obtiene con Pitágoras a partir del lado inclinado.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla práctica: la altura siempre forma un ángulo
                recto con la base, y en el diagrama aparece dibujada con línea discontinua.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo paso de metros cúbicos a litros?</h4>
              <p>
                Multiplicando por 1.000: un metro cúbico son 1.000 litros. También conviene recordar
                que 1 litro es un decímetro cúbico, es decir, un cubo de 10 cm de lado. Un depósito
                cilíndrico de 0,5 m de radio y 1,2 m de altura tiene 0,9425 m³, o sea, unos 942
                litros.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Trabaja siempre en metros de principio a fin y
                convierte al final: mezclar centímetros y metros a mitad del cálculo es el origen de
                la mayoría de los errores de factor 1.000.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el área lateral del cono lleva la generatriz y no la altura?</h4>
              <p>
                Porque la superficie curva, al desplegarla, es un sector circular cuyo radio es
                justamente el lado inclinado del cono, la generatriz g. La altura h es interior al
                cuerpo y no forma parte de esa superficie. La relación entre ambas es g = √(r² + h²):
                en un cono de r = 3 y h = 4, la generatriz vale 5 y el área lateral es π·3·5 = 47,12.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Como g siempre es mayor que h, si tu área lateral
                sale menor de lo esperado probablemente hayas usado la altura.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo calculo la superficie de un terreno irregular?</h4>
              <p>
                Se descompone en figuras conocidas: se tira una diagonal, se miden las distancias
                perpendiculares desde los vértices restantes y se suman los triángulos resultantes.
                Si solo se conocen los tres lados de un triángulo, la fórmula de Herón da el área sin
                necesidad de medir ninguna altura, que es lo difícil en campo.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Los huecos (patios, construcciones que no cuentan)
                se restan; nunca se aproxima «a ojo» el conjunto con un rectángulo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el volumen de un cono o una pirámide se divide entre 3?</h4>
              <p>
                Porque tres pirámides de la misma base y la misma altura llenan exactamente el prisma
                que las envuelve; es un resultado clásico que ya demostró Arquímedes. Por eso un
                montón cónico de grava contiene bastante menos material del que parece: solo un
                tercio de la caja que lo rodea.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> El mismo factor 1/3 aparece en el tronco de cono y
                en el tronco de pirámide, pero allí acompañado del término con la raíz o con R·r.
              </p>
            </div>
          </div>

          <h2>Cómo resolver cualquier problema de áreas y volúmenes</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Decide qué te están pidiendo</strong>
                <p>
                  ¿Longitud de contorno, superficie o capacidad? La respuesta determina las unidades
                  del resultado (m, m² o m³) y sirve de control final: si te piden litros y llegas a
                  un número en metros cuadrados, algo ha ido mal.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Dibuja la figura y etiqueta las medidas</strong>
                <p>
                  Un croquis con cada dato en su sitio evita el error más caro: confundir el radio
                  con el diámetro o la altura con el lado inclinado. Los diagramas de esta tabla
                  muestran exactamente dónde va cada letra.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Descompón si la figura no es elemental</strong>
                <p>
                  Un silo es un cilindro más un cono; una nave es un ortoedro más un prisma
                  triangular; un solar en L son dos rectángulos. Se calculan las partes por separado
                  y se suman, restando los huecos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Unifica las unidades antes de operar</strong>
                <p>
                  Pasa todo a la misma unidad al principio del cálculo. Mezclar centímetros y metros
                  produce errores de factor 100 en superficies y de 1.000 en volúmenes que pasan
                  desapercibidos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Aplica la fórmula y comprueba el orden de magnitud</strong>
                <p>
                  Estima mentalmente el resultado con la caja o el rectángulo que envuelve la figura:
                  el valor real siempre debe ser menor. Si tu volumen supera al del ortoedro
                  envolvente, hay un error seguro.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Añade el margen práctico si vas a comprar material</strong>
                <p>
                  En obra se suma entre un 5 % y un 10 % por cortes, roturas y mermas. La geometría
                  da la cantidad exacta; la experiencia añade el colchón.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas al medir y calcular</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📏
              </span>
              <strong>Anota siempre las unidades</strong>
              <p>
                Escribir «12» sin más invita al error. Escribir «12 m» obliga a comprobar que todo
                está en la misma escala y hace visible cualquier incoherencia.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⭕
              </span>
              <strong>Radio o diámetro, decídelo primero</strong>
              <p>
                Casi todas las medidas de campo son diámetros (tubos, depósitos, ruedas) y casi todas
                las fórmulas usan el radio. Divide entre 2 antes de empezar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✏️
              </span>
              <strong>Marca la altura perpendicular</strong>
              <p>
                En trapecios, paralelogramos y triángulos, dibuja el ángulo recto en el croquis. Es
                la forma más rápida de no usar el lado inclinado por error.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧩
              </span>
              <strong>Descompón antes que aproximar</strong>
              <p>
                Sumar dos rectángulos es exacto y rápido; buscar una fórmula «que se parezca» a la
                figura completa casi siempre introduce un error grande.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Verifica con un caso conocido</strong>
              <p>
                Prueba la fórmula con números redondos. Si la del tronco de cono no devuelve el
                cilindro cuando R = r, la has aplicado mal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧮
              </span>
              <strong>Redondea solo al final</strong>
              <p>
                Arrastrar π como 3,14 desde el primer paso acumula error. Trabaja con todos los
                decimales y redondea al presentar el resultado.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes que cambian el resultado</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir el radio con el diámetro:</strong> como el radio va al cuadrado, el
                área sale 4 veces mayor y el volumen de una esfera, 8 veces mayor. Es el error más
                caro de todos.
              </li>
              <li>
                <strong>Usar el lado inclinado como altura:</strong> en trapecios, paralelogramos y
                triángulos, la h es siempre perpendicular a la base. El lado inclinado siempre es más
                largo, así que el área sale inflada.
              </li>
              <li>
                <strong>Aplicar la altura en el área lateral del cono:</strong> es π·r·g con la
                generatriz g = √(r² + h²), no π·r·h. Con r = 3 y h = 4, la diferencia es 47,12 frente
                a 37,70.
              </li>
              <li>
                <strong>Olvidar el factor 1/3 en conos y pirámides:</strong> triplica el volumen y
                arruina cualquier presupuesto de material.
              </li>
              <li>
                <strong>Promediar las bases en el tronco de cono o de pirámide:</strong> la fórmula
                correcta lleva R² + r² + R·r (o la raíz del producto de las áreas). Sin ese término
                el volumen sale corto.
              </li>
              <li>
                <strong>Intercambiar los exponentes de la esfera:</strong> la superficie es 4πr² y el
                volumen (4/3)πr³. Cambiar el 2 por el 3 es un error de bulto que la unidad final
                delata.
              </li>
              <li>
                <strong>Restar los radios antes de elevarlos al cuadrado en la corona:</strong> el
                área es π·(R² − r²), no π·(R − r)². Con R = 8 y r = 5 la diferencia es 122,52 frente
                a 28,27.
              </li>
              <li>
                <strong>Mezclar unidades a mitad del cálculo:</strong> centímetros con metros produce
                errores de factor 100 en superficies y de 1.000 en volúmenes, y el resultado sigue
                pareciendo razonable.
              </li>
              <li>
                <strong>Trabajar con ángulos en grados donde la fórmula pide radianes:</strong> el
                área del segmento circular usa θ en radianes; introducir 90 en vez de 1,5708 devuelve
                un disparate.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre la geometría métrica de toda la educación media hispanohablante
            (secundaria, preparatoria o educación media según el país) y llega hasta los primeros
            cursos universitarios de carreras técnicas. También está pensada para el uso profesional
            de oficios: albañilería, carpintería, fontanería, agricultura y mantenimiento industrial,
            donde estas mismas fórmulas se aplican a diario para pedir material o calcular
            capacidades.
          </p>
          <p>
            Si necesitas otras tablas de consulta rápida con la misma estructura de búsqueda, tienes
            la <a href="/tabla-derivadas/">tabla de derivadas</a> y la{' '}
            <a href="/tabla-integrales/">tabla de integrales</a>; y para convertir entre unidades de
            superficie y volumen sin pelearte con los ceros, el{' '}
            <a href="/conversor-unidades/">conversor de unidades</a>.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-areas-volumenes')} />

      <ShareCard appName="tabla-areas-volumenes" />

      <Footer appName="tabla-areas-volumenes" />
    </div>
  );
}

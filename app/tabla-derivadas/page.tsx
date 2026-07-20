'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './TablaDerivadas.module.css';
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
   Utilidades de render de fórmulas (sin librerías externas: la CSP
   del sitio está en modo enforcement y bloquearía MathJax/KaTeX).
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

type CategoriaId =
  | 'potencia'
  | 'raices'
  | 'exp-log'
  | 'trig'
  | 'trig-inv'
  | 'hiperbolicas'
  | 'reglas';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface EntradaDerivada {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  /** Expresión de partida, f(x) */
  funcion: ReactNode;
  /** Derivada, f′(x) */
  derivada: ReactNode;
  /** Versión compuesta con u = u(x) (regla de la cadena) */
  cadenaFuncion?: ReactNode;
  cadenaDerivada?: ReactNode;
  /** Dominio o condiciones de validez, cuando importan */
  condiciones?: string;
  /** Texto plano para el buscador: nombre, fórmula y sinónimos */
  busqueda: string;
  /** Demostración o justificación breve */
  justificacion: string;
  ejemploTitulo: string;
  ejemploPasos: string[];
}

const CATEGORIAS: Categoria[] = [
  { id: 'potencia', nombre: 'Constante y potencia', icono: '🔢' },
  { id: 'raices', nombre: 'Raíces', icono: '🌱' },
  { id: 'exp-log', nombre: 'Exponenciales y logarítmicas', icono: '📈' },
  { id: 'trig', nombre: 'Trigonométricas', icono: '📐' },
  { id: 'trig-inv', nombre: 'Trigonométricas inversas', icono: '🔄' },
  { id: 'hiperbolicas', nombre: 'Hiperbólicas', icono: '🌉' },
  { id: 'reglas', nombre: 'Reglas de derivación', icono: '🧩' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  potencia: 'Constante y potencia',
  raices: 'Raíces',
  'exp-log': 'Exponenciales y logarítmicas',
  trig: 'Trigonométricas',
  'trig-inv': 'Trigonométricas inversas',
  hiperbolicas: 'Hiperbólicas',
  reglas: 'Reglas de derivación',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE DERIVADAS
   Cada entrada revisada una a una: signos, dominios y condiciones.
──────────────────────────────────────────────────────────────── */

const DERIVADAS: EntradaDerivada[] = [
  /* ── Constante y potencia ─────────────────────────────────── */
  {
    id: 'constante',
    categoria: 'potencia',
    nombre: 'Constante',
    funcion: <>k</>,
    derivada: <>0</>,
    condiciones: 'k es un número fijo',
    busqueda: 'constante k cero numero fijo termino independiente derivada de una constante',
    justificacion:
      'Una constante no cambia de valor, así que su tasa de variación es nula. Con la definición: (k − k)/h = 0 para todo h, y el límite de 0 es 0. Geométricamente, la gráfica de y = k es una recta horizontal y toda recta horizontal tiene pendiente cero.',
    ejemploTitulo: 'Derivar f(x) = 7',
    ejemploPasos: ['f(x) = 7', "f′(x) = 0", 'También: la derivada de −3, de π o de √2 es 0.'],
  },
  {
    id: 'identidad',
    categoria: 'potencia',
    nombre: 'Función identidad',
    funcion: <>x</>,
    derivada: <>1</>,
    busqueda: 'identidad x uno recta y=x pendiente 1 derivada de x',
    justificacion:
      'Es el caso n = 1 de la regla de la potencia. La gráfica de y = x es una recta de pendiente 1, y esa pendiente es la misma en todos los puntos.',
    ejemploTitulo: 'Derivar f(x) = 5x',
    ejemploPasos: ['f(x) = 5x', 'La constante sale fuera: f′(x) = 5 · (x)′', 'f′(x) = 5 · 1 = 5'],
  },
  {
    id: 'potencia',
    categoria: 'potencia',
    nombre: 'Potencia',
    funcion: (
      <>
        x<sup>n</sup>
      </>
    ),
    derivada: (
      <>
        n·x<sup>n−1</sup>
      </>
    ),
    cadenaFuncion: (
      <>
        u<sup>n</sup>
      </>
    ),
    cadenaDerivada: (
      <>
        n·u<sup>n−1</sup>·u′
      </>
    ),
    condiciones: 'n cualquier número real (si n no es entero, x > 0)',
    busqueda:
      'potencia exponente x elevado a n regla de la potencia cuadrado cubo x^n polinomio monomio',
    justificacion:
      'Para n natural sale del binomio de Newton: al desarrollar (x+h)ⁿ, el término en h de menor grado es n·xⁿ⁻¹·h, y al dividir por h y hacer h → 0 solo sobrevive n·xⁿ⁻¹. La fórmula se extiende a exponentes negativos y fraccionarios escribiendo xⁿ = e^(n·ln x) para x > 0.',
    ejemploTitulo: 'Derivar f(x) = x⁵ − 3x² + 4',
    ejemploPasos: [
      'f(x) = x⁵ − 3x² + 4',
      "Término a término: (x⁵)′ = 5x⁴; (3x²)′ = 3·2x = 6x; (4)′ = 0",
      'f′(x) = 5x⁴ − 6x',
    ],
  },
  {
    id: 'constante-por-funcion',
    categoria: 'potencia',
    nombre: 'Constante por función',
    funcion: <>k·f(x)</>,
    derivada: <>k·f′(x)</>,
    busqueda:
      'constante por funcion multiplo coeficiente sacar la constante fuera k por f linealidad',
    justificacion:
      'La derivada es lineal: multiplicar la función por un factor fijo multiplica su tasa de variación por ese mismo factor. La constante sale fuera del límite que define la derivada.',
    ejemploTitulo: 'Derivar f(x) = 4·sen x',
    ejemploPasos: ['f(x) = 4·sen x', "f′(x) = 4·(sen x)′", 'f′(x) = 4·cos x'],
  },
  {
    id: 'inversa-x',
    categoria: 'potencia',
    nombre: 'Inverso de x',
    funcion: <Frac n="1" d="x" />,
    derivada: (
      <>
        −<Frac n="1" d={<>x²</>} />
      </>
    ),
    cadenaFuncion: <Frac n="1" d="u" />,
    cadenaDerivada: (
      <>
        −<Frac n={<>u′</>} d={<>u²</>} />
      </>
    ),
    condiciones: 'x ≠ 0',
    busqueda:
      'inverso de x uno partido x 1/x hiperbola x elevado a menos uno reciproco fraccion',
    justificacion:
      'Se obtiene aplicando la regla de la potencia con n = −1: (x⁻¹)′ = −1·x⁻² = −1/x². El signo negativo refleja que 1/x es decreciente tanto para x > 0 como para x < 0.',
    ejemploTitulo: 'Derivar f(x) = 3/x',
    ejemploPasos: ['f(x) = 3·x⁻¹', "f′(x) = 3·(−1)·x⁻² ", 'f′(x) = −3/x²'],
  },

  /* ── Raíces ───────────────────────────────────────────────── */
  {
    id: 'raiz-cuadrada',
    categoria: 'raices',
    nombre: 'Raíz cuadrada',
    funcion: <>√x</>,
    derivada: <Frac n="1" d={<>2√x</>} />,
    cadenaFuncion: <>√u</>,
    cadenaDerivada: <Frac n={<>u′</>} d={<>2√u</>} />,
    condiciones: 'x > 0 (en x = 0 la función no es derivable)',
    busqueda:
      'raiz cuadrada radical sqrt x elevado a un medio raiz de x derivada de la raiz',
    justificacion:
      'Escribiendo √x = x^(1/2) y aplicando la regla de la potencia: (1/2)·x^(−1/2) = 1/(2√x). En x = 0 la tangente es vertical, por eso el punto queda excluido: la derivada tiende a infinito.',
    ejemploTitulo: 'Derivar f(x) = √(3x + 1)',
    ejemploPasos: [
      'u = 3x + 1, u′ = 3',
      "f′(x) = u′ / (2√u)",
      'f′(x) = 3 / (2√(3x + 1))',
    ],
  },
  {
    id: 'raiz-n',
    categoria: 'raices',
    nombre: 'Raíz n-ésima',
    funcion: <>ⁿ√x</>,
    derivada: (
      <Frac
        n="1"
        d={
          <>
            n·<span>(ⁿ√x)</span>
            <sup>n−1</sup>
          </>
        }
      />
    ),
    condiciones: 'n ≥ 2 entero; x > 0 (si n es impar, también x < 0, nunca x = 0)',
    busqueda:
      'raiz n-esima raiz cubica radical indice n x elevado a uno partido n raiz enesima',
    justificacion:
      'Es la regla de la potencia con exponente 1/n: (x^(1/n))′ = (1/n)·x^(1/n − 1) = 1/(n·x^((n−1)/n)), que se escribe como 1/(n·(ⁿ√x)ⁿ⁻¹). Para n = 2 recupera exactamente 1/(2√x).',
    ejemploTitulo: 'Derivar f(x) = ∛x',
    ejemploPasos: [
      'f(x) = x^(1/3)',
      "f′(x) = (1/3)·x^(−2/3)",
      'f′(x) = 1 / (3·∛(x²))',
    ],
  },

  /* ── Exponenciales y logarítmicas ─────────────────────────── */
  {
    id: 'exp-e',
    categoria: 'exp-log',
    nombre: 'Exponencial de base e',
    funcion: (
      <>
        e<sup>x</sup>
      </>
    ),
    derivada: (
      <>
        e<sup>x</sup>
      </>
    ),
    cadenaFuncion: (
      <>
        e<sup>u</sup>
      </>
    ),
    cadenaDerivada: (
      <>
        e<sup>u</sup>·u′
      </>
    ),
    busqueda:
      'exponencial e elevado a x numero e euler exp funcion exponencial natural crecimiento',
    justificacion:
      'El número e se define precisamente como la base para la que el límite (a^h − 1)/h vale 1 cuando h → 0. Con esa definición, eˣ es la única función (salvo múltiplos) que coincide con su propia derivada; por eso aparece en todos los modelos de crecimiento y decaimiento.',
    ejemploTitulo: 'Derivar f(x) = e^(2x)',
    ejemploPasos: ['u = 2x, u′ = 2', "f′(x) = e^u · u′", 'f′(x) = 2·e^(2x)'],
  },
  {
    id: 'exp-a',
    categoria: 'exp-log',
    nombre: 'Exponencial de base a',
    funcion: (
      <>
        a<sup>x</sup>
      </>
    ),
    derivada: (
      <>
        a<sup>x</sup>·ln a
      </>
    ),
    cadenaFuncion: (
      <>
        a<sup>u</sup>
      </>
    ),
    cadenaDerivada: (
      <>
        a<sup>u</sup>·ln a·u′
      </>
    ),
    condiciones: 'a > 0, a ≠ 1',
    busqueda:
      'exponencial base a elevado a x dos elevado a x potencia de base constante ln a',
    justificacion:
      'Se escribe aˣ = e^(x·ln a) y se aplica la regla de la cadena: la derivada es e^(x·ln a)·ln a = aˣ·ln a. El factor ln a es 1 justo cuando a = e, que es lo que hace especial a esa base.',
    ejemploTitulo: 'Derivar f(x) = 2ˣ',
    ejemploPasos: ['f(x) = 2ˣ', "f′(x) = 2ˣ · ln 2", 'ln 2 ≈ 0,693, así que f′(0) ≈ 0,693'],
  },
  {
    id: 'ln',
    categoria: 'exp-log',
    nombre: 'Logaritmo neperiano',
    funcion: <>ln x</>,
    derivada: <Frac n="1" d="x" />,
    cadenaFuncion: <>ln u</>,
    cadenaDerivada: <Frac n={<>u′</>} d={<>u</>} />,
    condiciones: 'x > 0',
    busqueda:
      'logaritmo neperiano natural ln log base e derivada del logaritmo uno partido x',
    justificacion:
      'ln x es la función inversa de eˣ. Aplicando la regla de la función inversa a y = ln x, con x = e^y: dy/dx = 1/(dx/dy) = 1/e^y = 1/x. La derivada solo está definida donde lo está la función, es decir, para x > 0.',
    ejemploTitulo: 'Derivar f(x) = ln(x² + 1)',
    ejemploPasos: [
      'u = x² + 1, u′ = 2x',
      "f′(x) = u′ / u",
      'f′(x) = 2x / (x² + 1)',
    ],
  },
  {
    id: 'ln-abs',
    categoria: 'exp-log',
    nombre: 'Logaritmo del valor absoluto',
    funcion: <>ln|x|</>,
    derivada: <Frac n="1" d="x" />,
    condiciones: 'x ≠ 0',
    busqueda:
      'logaritmo valor absoluto ln de x en valor absoluto modulo primitiva de 1/x dominio negativo',
    justificacion:
      'Para x > 0 es ln x, con derivada 1/x. Para x < 0 es ln(−x) y por la regla de la cadena su derivada es (−1)/(−x) = 1/x. La misma expresión sirve en ambos tramos, y por eso ln|x| (y no ln x) es la primitiva correcta de 1/x en todo su dominio.',
    ejemploTitulo: 'Derivar f(x) = ln|2x − 5|',
    ejemploPasos: [
      'u = 2x − 5, u′ = 2',
      "f′(x) = u′ / u",
      'f′(x) = 2 / (2x − 5), válido si x ≠ 5/2',
    ],
  },
  {
    id: 'log-a',
    categoria: 'exp-log',
    nombre: 'Logaritmo de base a',
    funcion: (
      <>
        log<sub>a</sub> x
      </>
    ),
    derivada: <Frac n="1" d={<>x·ln a</>} />,
    cadenaFuncion: (
      <>
        log<sub>a</sub> u
      </>
    ),
    cadenaDerivada: <Frac n={<>u′</>} d={<>u·ln a</>} />,
    condiciones: 'x > 0, a > 0, a ≠ 1',
    busqueda:
      'logaritmo base a log decimal log10 cambio de base derivada del logaritmo en base a',
    justificacion:
      'Por cambio de base, log_a x = ln x / ln a. Como ln a es una constante, la derivada es (1/ln a)·(1/x) = 1/(x·ln a). Con a = 10 queda 1/(x·ln 10) ≈ 0,434/x.',
    ejemploTitulo: 'Derivar f(x) = log₁₀ x',
    ejemploPasos: [
      'f(x) = ln x / ln 10',
      "f′(x) = 1 / (x · ln 10)",
      'ln 10 ≈ 2,303, luego f′(x) ≈ 0,434/x',
    ],
  },

  /* ── Trigonométricas ──────────────────────────────────────── */
  {
    id: 'sen',
    categoria: 'trig',
    nombre: 'Seno',
    funcion: <>sen x</>,
    derivada: <>cos x</>,
    cadenaFuncion: <>sen u</>,
    cadenaDerivada: <>cos u · u′</>,
    busqueda:
      'seno sen sin sinus derivada del seno es coseno funcion trigonometrica onda',
    justificacion:
      'Con la definición y la fórmula del seno de una suma aparecen los límites básicos (sen h)/h → 1 y (cos h − 1)/h → 0 cuando h → 0. Sustituyéndolos queda cos x. Ojo: exige que x esté en radianes; en grados aparecería un factor π/180.',
    ejemploTitulo: 'Derivar f(x) = sen(3x²)',
    ejemploPasos: [
      'u = 3x², u′ = 6x',
      "f′(x) = cos u · u′",
      'f′(x) = 6x·cos(3x²)',
    ],
  },
  {
    id: 'cos',
    categoria: 'trig',
    nombre: 'Coseno',
    funcion: <>cos x</>,
    derivada: <>−sen x</>,
    cadenaFuncion: <>cos u</>,
    cadenaDerivada: <>−sen u · u′</>,
    busqueda:
      'coseno cos derivada del coseno menos seno signo negativo funcion trigonometrica',
    justificacion:
      'El signo menos es el error más repetido en los exámenes. Se ve claro en la gráfica: entre 0 y π el coseno decrece, luego su derivada debe ser negativa en ese tramo, y −sen x lo es. También sale de cos x = sen(π/2 − x) aplicando la regla de la cadena.',
    ejemploTitulo: 'Derivar f(x) = cos(5x)',
    ejemploPasos: ['u = 5x, u′ = 5', "f′(x) = −sen u · u′", 'f′(x) = −5·sen(5x)'],
  },
  {
    id: 'tg',
    categoria: 'trig',
    nombre: 'Tangente',
    funcion: <>tg x</>,
    derivada: (
      <>
        <Frac n="1" d={<>cos²x</>} /> = 1 + tg²x
      </>
    ),
    cadenaFuncion: <>tg u</>,
    cadenaDerivada: (
      <>
        <Frac n={<>u′</>} d={<>cos²u</>} /> = (1 + tg²u)·u′
      </>
    ),
    condiciones: 'x ≠ π/2 + kπ',
    busqueda:
      'tangente tg tan secante al cuadrado sec2 uno mas tangente al cuadrado derivada de la tangente',
    justificacion:
      'Aplicando la regla del cociente a tg x = sen x / cos x: (cos x·cos x − sen x·(−sen x))/cos²x = (cos²x + sen²x)/cos²x = 1/cos²x. Dividiendo la identidad fundamental entre cos²x se obtiene la forma equivalente 1 + tg²x, cómoda cuando ya conoces el valor de la tangente.',
    ejemploTitulo: 'Derivar f(x) = tg(2x)',
    ejemploPasos: [
      'u = 2x, u′ = 2',
      "f′(x) = u′ / cos²u",
      'f′(x) = 2 / cos²(2x) = 2·(1 + tg²(2x))',
    ],
  },
  {
    id: 'cotg',
    categoria: 'trig',
    nombre: 'Cotangente',
    funcion: <>cotg x</>,
    derivada: (
      <>
        −<Frac n="1" d={<>sen²x</>} /> = −(1 + cotg²x)
      </>
    ),
    cadenaFuncion: <>cotg u</>,
    cadenaDerivada: (
      <>
        −<Frac n={<>u′</>} d={<>sen²u</>} />
      </>
    ),
    condiciones: 'x ≠ kπ',
    busqueda:
      'cotangente cotg cot ctg cosecante al cuadrado derivada de la cotangente signo negativo',
    justificacion:
      'Con la regla del cociente sobre cotg x = cos x / sen x: (−sen x·sen x − cos x·cos x)/sen²x = −(sen²x + cos²x)/sen²x = −1/sen²x. Es la simétrica de la tangente, pero con signo negativo porque la cotangente es decreciente en todo su dominio.',
    ejemploTitulo: 'Derivar f(x) = cotg(x/2)',
    ejemploPasos: [
      'u = x/2, u′ = 1/2',
      "f′(x) = −u′ / sen²u",
      'f′(x) = −1 / (2·sen²(x/2))',
    ],
  },
  {
    id: 'sec',
    categoria: 'trig',
    nombre: 'Secante',
    funcion: <>sec x</>,
    derivada: <>sec x · tg x</>,
    cadenaFuncion: <>sec u</>,
    cadenaDerivada: <>sec u · tg u · u′</>,
    condiciones: 'x ≠ π/2 + kπ',
    busqueda:
      'secante sec uno partido coseno derivada de la secante sec por tangente',
    justificacion:
      'sec x = 1/cos x = (cos x)⁻¹. Por la regla de la cadena: −1·(cos x)⁻²·(−sen x) = sen x/cos²x, que se reescribe como (1/cos x)·(sen x/cos x) = sec x·tg x.',
    ejemploTitulo: 'Derivar f(x) = sec(3x)',
    ejemploPasos: [
      'u = 3x, u′ = 3',
      "f′(x) = sec u · tg u · u′",
      'f′(x) = 3·sec(3x)·tg(3x)',
    ],
  },
  {
    id: 'cosec',
    categoria: 'trig',
    nombre: 'Cosecante',
    funcion: <>cosec x</>,
    derivada: <>−cosec x · cotg x</>,
    cadenaFuncion: <>cosec u</>,
    cadenaDerivada: <>−cosec u · cotg u · u′</>,
    condiciones: 'x ≠ kπ',
    busqueda:
      'cosecante cosec csc uno partido seno derivada de la cosecante signo negativo',
    justificacion:
      'cosec x = 1/sen x = (sen x)⁻¹. Derivando: −1·(sen x)⁻²·cos x = −cos x/sen²x = −(1/sen x)·(cos x/sen x) = −cosec x·cotg x. El signo negativo la distingue de la secante.',
    ejemploTitulo: 'Derivar f(x) = cosec x en x = π/2',
    ejemploPasos: [
      "f′(x) = −cosec x · cotg x",
      'En x = π/2: cosec(π/2) = 1 y cotg(π/2) = 0',
      "f′(π/2) = −1·0 = 0",
    ],
  },

  /* ── Trigonométricas inversas ─────────────────────────────── */
  {
    id: 'arcsen',
    categoria: 'trig-inv',
    nombre: 'Arcoseno',
    funcion: <>arcsen x</>,
    derivada: <Frac n="1" d={<>√(1 − x²)</>} />,
    cadenaFuncion: <>arcsen u</>,
    cadenaDerivada: <Frac n={<>u′</>} d={<>√(1 − u²)</>} />,
    condiciones: '|x| < 1 (en x = ±1 la derivada no existe)',
    busqueda:
      'arcoseno arcsen arcsin asin inversa del seno derivada del arcoseno raiz de uno menos x cuadrado',
    justificacion:
      'Si y = arcsen x entonces sen y = x. Derivando implícitamente: cos y · y′ = 1, luego y′ = 1/cos y. Como y está en [−π/2, π/2] el coseno es positivo, y cos y = √(1 − sen²y) = √(1 − x²). En x = ±1 el denominador se anula y la tangente es vertical.',
    ejemploTitulo: 'Derivar f(x) = arcsen(2x)',
    ejemploPasos: [
      'u = 2x, u′ = 2',
      "f′(x) = u′ / √(1 − u²)",
      'f′(x) = 2 / √(1 − 4x²), válido si |x| < 1/2',
    ],
  },
  {
    id: 'arccos',
    categoria: 'trig-inv',
    nombre: 'Arcocoseno',
    funcion: <>arccos x</>,
    derivada: (
      <>
        −<Frac n="1" d={<>√(1 − x²)</>} />
      </>
    ),
    cadenaFuncion: <>arccos u</>,
    cadenaDerivada: (
      <>
        −<Frac n={<>u′</>} d={<>√(1 − u²)</>} />
      </>
    ),
    condiciones: '|x| < 1',
    busqueda:
      'arcocoseno arccos acos inversa del coseno derivada del arcocoseno signo negativo',
    justificacion:
      'Es exactamente la opuesta de la del arcoseno. La razón: arcsen x + arccos x = π/2 para todo x de [−1, 1], y al derivar esa identidad el lado derecho (constante) da 0, de donde (arccos x)′ = −(arcsen x)′.',
    ejemploTitulo: 'Derivar f(x) = arccos(x²)',
    ejemploPasos: [
      'u = x², u′ = 2x',
      "f′(x) = −u′ / √(1 − u²)",
      'f′(x) = −2x / √(1 − x⁴), válido si |x| < 1',
    ],
  },
  {
    id: 'arctan',
    categoria: 'trig-inv',
    nombre: 'Arcotangente',
    funcion: <>arctg x</>,
    derivada: <Frac n="1" d={<>1 + x²</>} />,
    cadenaFuncion: <>arctg u</>,
    cadenaDerivada: <Frac n={<>u′</>} d={<>1 + u²</>} />,
    condiciones: 'válida para todo x real',
    busqueda:
      'arcotangente arctan arctg atan inversa de la tangente derivada del arcotangente uno mas x cuadrado',
    justificacion:
      'Si y = arctg x entonces tg y = x. Derivando: (1 + tg²y)·y′ = 1, y como tg y = x queda y′ = 1/(1 + x²). No hay restricciones de dominio: 1 + x² nunca se anula, por eso el arcotangente es derivable en toda la recta real.',
    ejemploTitulo: 'Derivar f(x) = arctg(3x)',
    ejemploPasos: [
      'u = 3x, u′ = 3',
      "f′(x) = u′ / (1 + u²)",
      'f′(x) = 3 / (1 + 9x²)',
    ],
  },
  {
    id: 'arccotg',
    categoria: 'trig-inv',
    nombre: 'Arcocotangente',
    funcion: <>arccotg x</>,
    derivada: (
      <>
        −<Frac n="1" d={<>1 + x²</>} />
      </>
    ),
    cadenaFuncion: <>arccotg u</>,
    cadenaDerivada: (
      <>
        −<Frac n={<>u′</>} d={<>1 + u²</>} />
      </>
    ),
    condiciones: 'válida para todo x real',
    busqueda:
      'arcocotangente arccotg arccot inversa de la cotangente derivada signo negativo',
    justificacion:
      'Igual que ocurre con arcoseno y arcocoseno, se cumple arctg x + arccotg x = π/2, así que la derivada del arcocotangente es la opuesta de la del arcotangente.',
    ejemploTitulo: 'Derivar f(x) = arccotg(x/2)',
    ejemploPasos: [
      'u = x/2, u′ = 1/2',
      "f′(x) = −u′ / (1 + u²)",
      'f′(x) = −(1/2) / (1 + x²/4) = −2 / (4 + x²)',
    ],
  },
  {
    id: 'arcsec',
    categoria: 'trig-inv',
    nombre: 'Arcosecante',
    funcion: <>arcsec x</>,
    derivada: <Frac n="1" d={<>|x|·√(x² − 1)</>} />,
    condiciones: '|x| > 1',
    busqueda:
      'arcosecante arcsec inversa de la secante derivada valor absoluto raiz de x cuadrado menos uno',
    justificacion:
      'Si y = arcsec x entonces sec y = x. Derivando implícitamente: sec y·tg y·y′ = 1. Sustituyendo sec y = x y |tg y| = √(x² − 1) aparece el valor absoluto de x, necesario para que la derivada sea positiva tanto para x > 1 como para x < −1.',
    ejemploTitulo: 'Derivar f(x) = arcsec x en x = 2',
    ejemploPasos: [
      "f′(x) = 1 / (|x|·√(x² − 1))",
      'En x = 2: |2| = 2 y √(4 − 1) = √3',
      "f′(2) = 1 / (2√3) ≈ 0,289",
    ],
  },
  {
    id: 'arccosec',
    categoria: 'trig-inv',
    nombre: 'Arcocosecante',
    funcion: <>arccosec x</>,
    derivada: (
      <>
        −<Frac n="1" d={<>|x|·√(x² − 1)</>} />
      </>
    ),
    condiciones: '|x| > 1',
    busqueda:
      'arcocosecante arccosec arccsc inversa de la cosecante derivada signo negativo',
    justificacion:
      'Es la opuesta de la derivada de la arcosecante, porque arcsec x + arccosec x = π/2 en todo su dominio común.',
    ejemploTitulo: 'Derivar f(x) = arccosec x en x = −2',
    ejemploPasos: [
      "f′(x) = −1 / (|x|·√(x² − 1))",
      'En x = −2: |−2| = 2 y √(4 − 1) = √3',
      "f′(−2) = −1 / (2√3) ≈ −0,289",
    ],
  },

  /* ── Hiperbólicas ─────────────────────────────────────────── */
  {
    id: 'senh',
    categoria: 'hiperbolicas',
    nombre: 'Seno hiperbólico',
    funcion: <>senh x</>,
    derivada: <>cosh x</>,
    cadenaFuncion: <>senh u</>,
    cadenaDerivada: <>cosh u · u′</>,
    busqueda:
      'seno hiperbolico senh sh sinh derivada del seno hiperbolico coseno hiperbolico catenaria',
    justificacion:
      'Por definición senh x = (eˣ − e⁻ˣ)/2. Derivando cada exponencial: (eˣ + e⁻ˣ)/2 = cosh x. A diferencia de las trigonométricas, aquí no aparece ningún signo negativo.',
    ejemploTitulo: 'Derivar f(x) = senh(4x)',
    ejemploPasos: ['u = 4x, u′ = 4', "f′(x) = cosh u · u′", 'f′(x) = 4·cosh(4x)'],
  },
  {
    id: 'cosh',
    categoria: 'hiperbolicas',
    nombre: 'Coseno hiperbólico',
    funcion: <>cosh x</>,
    derivada: <>senh x</>,
    cadenaFuncion: <>cosh u</>,
    cadenaDerivada: <>senh u · u′</>,
    busqueda:
      'coseno hiperbolico cosh ch derivada sin signo negativo catenaria cable colgante',
    justificacion:
      'cosh x = (eˣ + e⁻ˣ)/2 y al derivar queda (eˣ − e⁻ˣ)/2 = senh x. Aquí NO hay signo menos, justo al revés que en el coseno circular: es la confusión más habitual al mezclar ambas familias.',
    ejemploTitulo: 'Derivar f(x) = cosh(x²)',
    ejemploPasos: [
      'u = x², u′ = 2x',
      "f′(x) = senh u · u′",
      'f′(x) = 2x·senh(x²)',
    ],
  },
  {
    id: 'tanh',
    categoria: 'hiperbolicas',
    nombre: 'Tangente hiperbólica',
    funcion: <>tgh x</>,
    derivada: (
      <>
        <Frac n="1" d={<>cosh²x</>} /> = 1 − tgh²x
      </>
    ),
    cadenaFuncion: <>tgh u</>,
    cadenaDerivada: <Frac n={<>u′</>} d={<>cosh²u</>} />,
    busqueda:
      'tangente hiperbolica tanh th tgh derivada sech al cuadrado funcion de activacion',
    justificacion:
      'Con la regla del cociente sobre tgh x = senh x / cosh x y la identidad cosh²x − senh²x = 1, queda 1/cosh²x. La forma equivalente 1 − tgh²x explica por qué la tangente hiperbólica se satura: cuando |x| crece, tgh x → ±1 y su derivada tiende a 0.',
    ejemploTitulo: 'Derivar f(x) = tgh(2x)',
    ejemploPasos: [
      'u = 2x, u′ = 2',
      "f′(x) = u′ / cosh²u",
      'f′(x) = 2 / cosh²(2x)',
    ],
  },
  {
    id: 'coth',
    categoria: 'hiperbolicas',
    nombre: 'Cotangente hiperbólica',
    funcion: <>cotgh x</>,
    derivada: (
      <>
        −<Frac n="1" d={<>senh²x</>} />
      </>
    ),
    condiciones: 'x ≠ 0',
    busqueda:
      'cotangente hiperbolica coth cotgh derivada signo negativo cosech al cuadrado',
    justificacion:
      'Regla del cociente sobre cotgh x = cosh x / senh x: (senh²x − cosh²x)/senh²x = −1/senh²x, usando de nuevo cosh²x − senh²x = 1. El signo negativo es correcto: la cotangente hiperbólica decrece en cada rama.',
    ejemploTitulo: 'Derivar f(x) = cotgh x en x = 1',
    ejemploPasos: [
      "f′(x) = −1 / senh²x",
      'senh 1 ≈ 1,1752, luego senh²1 ≈ 1,3811',
      "f′(1) ≈ −0,724",
    ],
  },
  {
    id: 'argsenh',
    categoria: 'hiperbolicas',
    nombre: 'Argumento del seno hiperbólico',
    funcion: <>argsenh x</>,
    derivada: <Frac n="1" d={<>√(x² + 1)</>} />,
    condiciones: 'válida para todo x real',
    busqueda:
      'argumento seno hiperbolico argsenh arcsenh asinh inversa del seno hiperbolico',
    justificacion:
      'Si y = argsenh x entonces senh y = x; derivando, cosh y·y′ = 1 y como cosh y = √(1 + senh²y) = √(1 + x²) (siempre positivo), resulta y′ = 1/√(x² + 1). Fíjate en el signo +: aquí no hay restricción de dominio.',
    ejemploTitulo: 'Derivar f(x) = argsenh(3x)',
    ejemploPasos: [
      'u = 3x, u′ = 3',
      "f′(x) = u′ / √(u² + 1)",
      'f′(x) = 3 / √(9x² + 1)',
    ],
  },
  {
    id: 'argcosh',
    categoria: 'hiperbolicas',
    nombre: 'Argumento del coseno hiperbólico',
    funcion: <>argcosh x</>,
    derivada: <Frac n="1" d={<>√(x² − 1)</>} />,
    condiciones: 'x > 1',
    busqueda:
      'argumento coseno hiperbolico argcosh arccosh acosh inversa del coseno hiperbolico',
    justificacion:
      'De cosh y = x se obtiene senh y·y′ = 1, y tomando la rama y ≥ 0 (donde senh y ≥ 0) se tiene senh y = √(cosh²y − 1) = √(x² − 1). En x = 1 el denominador se anula: la función existe pero no es derivable ahí.',
    ejemploTitulo: 'Derivar f(x) = argcosh x en x = 2',
    ejemploPasos: [
      "f′(x) = 1 / √(x² − 1)",
      'En x = 2: √(4 − 1) = √3',
      "f′(2) = 1/√3 ≈ 0,577",
    ],
  },
  {
    id: 'argtanh',
    categoria: 'hiperbolicas',
    nombre: 'Argumento de la tangente hiperbólica',
    funcion: <>argtgh x</>,
    derivada: <Frac n="1" d={<>1 − x²</>} />,
    condiciones: '|x| < 1',
    busqueda:
      'argumento tangente hiperbolica argtgh arctanh atanh inversa de la tangente hiperbolica',
    justificacion:
      'De tgh y = x se deduce (1 − tgh²y)·y′ = 1, luego y′ = 1/(1 − x²). Cuidado al compararla con el arcotangente: aquí el denominador es 1 − x² (con signo menos) y el dominio se limita a |x| < 1.',
    ejemploTitulo: 'Derivar f(x) = argtgh(x/2)',
    ejemploPasos: [
      'u = x/2, u′ = 1/2',
      "f′(x) = u′ / (1 − u²)",
      'f′(x) = (1/2) / (1 − x²/4) = 2 / (4 − x²), válido si |x| < 2',
    ],
  },

  /* ── Reglas de derivación ─────────────────────────────────── */
  {
    id: 'regla-suma',
    categoria: 'reglas',
    nombre: 'Regla de la suma y la resta',
    funcion: <>f(x) ± g(x)</>,
    derivada: <>f′(x) ± g′(x)</>,
    busqueda:
      'suma resta regla de la suma derivada de una suma linealidad termino a termino polinomio',
    justificacion:
      'La derivada respeta sumas y restas porque el límite de una suma es la suma de los límites. Es la propiedad que permite derivar un polinomio término a término, sin ningún truco adicional.',
    ejemploTitulo: 'Derivar f(x) = x³ + sen x − ln x',
    ejemploPasos: [
      "(x³)′ = 3x²",
      "(sen x)′ = cos x",
      "(ln x)′ = 1/x",
      "f′(x) = 3x² + cos x − 1/x",
    ],
  },
  {
    id: 'regla-producto',
    categoria: 'reglas',
    nombre: 'Regla del producto',
    funcion: <>f(x)·g(x)</>,
    derivada: <>f′(x)·g(x) + f(x)·g′(x)</>,
    busqueda:
      'producto regla del producto multiplicacion derivada de un producto leibniz f prima por g mas f por g prima',
    justificacion:
      'La derivada de un producto NO es el producto de las derivadas. Al variar x cambian los dos factores a la vez, y el incremento del producto recoge ambas contribuciones: una con g fijo y otra con f fijo. Comprobación rápida: con f = g = x, la regla da 1·x + x·1 = 2x, que es la derivada correcta de x².',
    ejemploTitulo: 'Derivar f(x) = x²·eˣ',
    ejemploPasos: [
      'f = x², f′ = 2x; g = eˣ, g′ = eˣ',
      "(f·g)′ = 2x·eˣ + x²·eˣ",
      'f′(x) = eˣ·(2x + x²) = x·eˣ·(x + 2)',
    ],
  },
  {
    id: 'regla-cociente',
    categoria: 'reglas',
    nombre: 'Regla del cociente',
    funcion: <Frac n={<>f(x)</>} d={<>g(x)</>} />,
    derivada: <Frac n={<>f′(x)·g(x) − f(x)·g′(x)</>} d={<>[g(x)]²</>} />,
    condiciones: 'g(x) ≠ 0',
    busqueda:
      'cociente division regla del cociente fraccion derivada de un cociente denominador al cuadrado',
    justificacion:
      'Sale de aplicar la regla del producto a f·g⁻¹. El orden del numerador importa y no se puede invertir: primero la derivada del numerador por el denominador, y luego se resta. Una comprobación útil: si f = 1, queda −g′/g², que es la derivada de 1/g.',
    ejemploTitulo: 'Derivar f(x) = (x + 1)/(x − 1)',
    ejemploPasos: [
      'f = x + 1, f′ = 1; g = x − 1, g′ = 1',
      "Numerador: 1·(x − 1) − (x + 1)·1 = −2",
      'f′(x) = −2 / (x − 1)², válido si x ≠ 1',
    ],
  },
  {
    id: 'regla-cadena',
    categoria: 'reglas',
    nombre: 'Regla de la cadena',
    funcion: <>f(g(x))</>,
    derivada: <>f′(g(x))·g′(x)</>,
    busqueda:
      'cadena regla de la cadena composicion funcion compuesta derivada de dentro por derivada de fuera u prima',
    justificacion:
      'Es la regla que más se usa en la práctica: se deriva la función exterior dejando intacto el interior y después se multiplica por la derivada del interior. Ese factor final (la famosa u′) es lo que más se olvida. En cada fila de esta tabla tienes la versión con u ya preparada.',
    ejemploTitulo: 'Derivar f(x) = sen²(3x)',
    ejemploPasos: [
      'Capa exterior: potencia. Capa intermedia: seno. Capa interior: 3x',
      "f′(x) = 2·sen(3x) · cos(3x) · 3",
      'f′(x) = 6·sen(3x)·cos(3x) = 3·sen(6x)',
    ],
  },
  {
    id: 'regla-inversa',
    categoria: 'reglas',
    nombre: 'Derivada de la función inversa',
    funcion: (
      <>
        f<sup>−1</sup>(y)
      </>
    ),
    derivada: <Frac n="1" d={<>f′(x)</>} />,
    condiciones: 'con y = f(x) y f′(x) ≠ 0',
    busqueda:
      'funcion inversa derivada de la inversa reciproca teorema de la funcion inversa uno partido f prima',
    justificacion:
      'La gráfica de la inversa es la reflexión de la original respecto de la recta y = x, y esa reflexión convierte una pendiente m en 1/m. De ahí la condición f′(x) ≠ 0: si la tangente original es horizontal, la de la inversa sería vertical. Con esta regla se deducen las derivadas de ln x, arcsen x y arctg x.',
    ejemploTitulo: 'Deducir la derivada de ln x',
    ejemploPasos: [
      'f(x) = eˣ, con f′(x) = eˣ; su inversa es ln',
      "(ln)′(y) = 1 / f′(x) = 1 / eˣ",
      'Como y = eˣ: (ln y)′ = 1/y',
    ],
  },
  {
    id: 'regla-implicita',
    categoria: 'reglas',
    nombre: 'Derivación implícita',
    funcion: <>F(x, y) = 0</>,
    derivada: <>despejar y′ tras derivar los dos miembros</>,
    busqueda:
      'derivacion implicita funcion implicita despejar y prima circunferencia curva no despejada dy/dx',
    justificacion:
      'Cuando y no está despejada, se deriva toda la igualdad respecto de x tratando y como función de x: cada vez que aparece y hay que multiplicar por y′ (regla de la cadena). Después se agrupan los términos con y′ y se despeja.',
    ejemploTitulo: 'Hallar y′ en la circunferencia x² + y² = 25',
    ejemploPasos: [
      'Derivamos ambos miembros: 2x + 2y·y′ = 0',
      "Despejamos: y′ = −x / y",
      'En el punto (3, 4): y′ = −3/4',
    ],
  },
  {
    id: 'regla-logaritmica',
    categoria: 'reglas',
    nombre: 'Derivación logarítmica',
    funcion: (
      <>
        f(x)<sup>g(x)</sup>
      </>
    ),
    derivada: (
      <>
        f<sup>g</sup>·(g′·ln f + g·
        <Frac n={<>f′</>} d={<>f</>} />)
      </>
    ),
    condiciones: 'f(x) > 0',
    busqueda:
      'derivacion logaritmica potencia exponencial x elevado a x base y exponente variables tomar logaritmos',
    justificacion:
      'Cuando la base y el exponente dependen de x no sirve ni la regla de la potencia ni la de la exponencial. Se toman logaritmos en ambos miembros, se deriva implícitamente y se despeja. También es un atajo cómodo para productos y cocientes largos, porque convierte multiplicaciones en sumas.',
    ejemploTitulo: 'Derivar f(x) = xˣ, con x > 0',
    ejemploPasos: [
      'ln f = x·ln x',
      "Derivamos: f′/f = ln x + 1",
      'f′(x) = xˣ·(ln x + 1)',
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaDerivadasPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega con un examen delante escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return DERIVADAS.filter((entrada) => {
      const coincideCategoria =
        categoriaActiva === 'todas' || entrada.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(`${entrada.nombre} ${entrada.busqueda}`).includes(termino);
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
          <span aria-hidden="true">📄</span> Tabla de Derivadas Completa
        </h1>
        <p className={styles.subtitle}>
          Formulario de consulta rápida con {DERIVADAS.length} fórmulas: funciones elementales,
          versión con la regla de la cadena, dominios de validez y un ejemplo resuelto en cada
          fila. Busca y encuentra en segundos.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de derivadas">
        <label className={styles.buscadorLabel} htmlFor="buscador-derivadas">
          Busca una derivada por nombre, fórmula o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-derivadas"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="ln, raíz, arctan, producto, cadena…"
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
          Funciona con acentos o sin ellos y con sinónimos: <strong>raíz</strong> encuentra √x,{' '}
          <strong>seno</strong> encuentra sen x, <strong>logaritmo</strong> encuentra ln x.
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
          {resultados.length} de {DERIVADAS.length} fórmulas
        </p>
      </section>

      {/* Tabla de fórmulas */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna fórmula que coincida con
            «{consulta}». Prueba con otro término (por ejemplo, <strong>tangente</strong>,{' '}
            <strong>exponencial</strong> o <strong>cociente</strong>) o quita el filtro de
            categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((entrada) => {
            const abierta = abiertas.includes(entrada.id);
            return (
              <li key={entrada.id} className={styles.fila}>
                <button
                  type="button"
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${entrada.id}`}
                  onClick={() => alternarFila(entrada.id)}
                >
                  <span className={styles.filaNombre}>
                    {entrada.nombre}
                    <span className={styles.filaCategoria}>
                      {NOMBRE_CATEGORIA[entrada.categoria]}
                    </span>
                    {entrada.condiciones && (
                      <span className={styles.condicionesBadge}>{entrada.condiciones}</span>
                    )}
                  </span>
                  <span className={styles.filaFormulas}>
                    <span className={styles.par}>
                      <span className={styles.etq}>f(x)</span>
                      <span className={styles.expr}>{entrada.funcion}</span>
                    </span>
                    <span className={styles.par}>
                      <span className={styles.etq}>f′(x)</span>
                      <span className={`${styles.expr} ${styles.exprDerivada}`}>
                        {entrada.derivada}
                      </span>
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${entrada.id}`} className={styles.detalle}>
                    {entrada.cadenaFuncion && entrada.cadenaDerivada && (
                      <div className={styles.cadenaBox}>
                        <h3>Con la regla de la cadena, si u = u(x)</h3>
                        <div className={styles.cadenaFormula}>
                          <span>{entrada.cadenaFuncion}</span>
                          <span>→</span>
                          <span>{entrada.cadenaDerivada}</span>
                        </div>
                      </div>
                    )}

                    <h3>Por qué es así</h3>
                    <p>{entrada.justificacion}</p>

                    <div className={styles.ejemplo}>
                      <h3>
                        <span aria-hidden="true">✏️</span> {entrada.ejemploTitulo}
                      </h3>
                      <ol>
                        {entrada.ejemploPasos.map((paso) => (
                          <li key={paso}>{paso}</li>
                        ))}
                      </ol>
                    </div>
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
        title="Entender las derivadas, no solo copiarlas"
        subtitle="Qué mide una derivada, por qué fallan los atajos y cómo usar bien la tabla"
      >
        <section className={styles.guideSection}>
          <h2>Qué mide realmente una derivada</h2>
          <p>
            La derivada de una función en un punto es su <strong>tasa de variación
            instantánea</strong>: cuánto cambia el resultado cuando la variable cambia un poquito.
            Geométricamente es la pendiente de la recta tangente a la curva en ese punto. Si la
            derivada es positiva, la función crece; si es negativa, decrece; si vale cero, la
            tangente es horizontal y ahí puede haber un máximo, un mínimo o un punto de inflexión.
          </p>
          <p>
            Esa idea se formaliza con un límite: se toma la pendiente de la recta que une dos puntos
            de la curva (la secante) y se acercan esos puntos hasta que se confunden. Si prefieres
            verlo antes de memorizar la tabla, en meskeIA tienes el{' '}
            <a href="/simulador-derivada-pendiente/">
              simulador de la derivada como pendiente de la tangente
            </a>
            , donde puedes arrastrar el punto sobre la curva y observar cómo gira la recta.
          </p>
          <div className={styles.formulaBox}>
            f′(x) = lím<sub>h→0</sub> [ f(x + h) − f(x) ] / h
          </div>
          <p>
            Toda la tabla que has consultado arriba se deduce de esa única definición. Las reglas
            (producto, cociente, cadena) no son convenios arbitrarios: son consecuencias del
            comportamiento de los límites.
          </p>

          <h2>Las tres familias, de un vistazo</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Patrón de la derivada</th>
                  <th>Señal de alerta</th>
                  <th>Dónde aparece</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Potencias</strong>
                  </td>
                  <td>Baja el exponente y réstale 1</td>
                  <td>Raíces y 1/x son potencias disfrazadas</td>
                  <td>Polinomios, áreas, volúmenes</td>
                </tr>
                <tr>
                  <td>
                    <strong>Exponenciales</strong>
                  </td>
                  <td>Se reproducen a sí mismas (por ln a si la base no es e)</td>
                  <td>Olvidar el factor ln a con bases distintas de e</td>
                  <td>Interés compuesto, desintegración, contagios</td>
                </tr>
                <tr>
                  <td>
                    <strong>Logarítmicas</strong>
                  </td>
                  <td>u′/u</td>
                  <td>El valor absoluto en ln|x| y el dominio x &gt; 0</td>
                  <td>Escalas sonoras, pH, entropía</td>
                </tr>
                <tr>
                  <td>
                    <strong>Trigonométricas</strong>
                  </td>
                  <td>Ciclo sen → cos → −sen → −cos</td>
                  <td>El signo menos del coseno</td>
                  <td>Ondas, oscilaciones, corriente alterna</td>
                </tr>
                <tr>
                  <td>
                    <strong>Trigonométricas inversas</strong>
                  </td>
                  <td>Fracciones con √(1 − x²) o 1 + x²</td>
                  <td>arcsen y arccos solo valen si |x| &lt; 1</td>
                  <td>Ángulos a partir de distancias, integrales</td>
                </tr>
                <tr>
                  <td>
                    <strong>Hiperbólicas</strong>
                  </td>
                  <td>Como las trigonométricas, pero sin el signo menos</td>
                  <td>cosh′ = senh (positivo), a diferencia de cos′ = −sen</td>
                  <td>Catenarias, relatividad, redes neuronales</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Para qué sirve una derivada fuera del examen</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🚗
              </span>
              <strong>Velocidad y aceleración</strong>
              <p>
                Si una función da la posición en función del tiempo, su derivada es la velocidad y
                la derivada de la velocidad es la aceleración. El velocímetro de un coche muestra
                literalmente una derivada.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📦
              </span>
              <strong>Problemas de optimización</strong>
              <p>
                Para encontrar la lata cilíndrica que gasta menos chapa con un volumen dado se
                deriva la función de superficie y se iguala a cero. La misma técnica sirve para
                minimizar costes o maximizar ingresos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🤖
              </span>
              <strong>Aprendizaje automático</strong>
              <p>
                El entrenamiento de una red neuronal es descenso de gradiente: se calcula la
                derivada del error respecto de cada parámetro y se avanza en sentido contrario.
                Ahí aparecen tgh y la exponencial.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📊
              </span>
              <strong>Estudio de una curva</strong>
              <p>
                Crecimiento, extremos, concavidad y puntos de inflexión salen del signo de la
                primera y la segunda derivada. Es el bloque de análisis que más se repite en los
                exámenes de admisión universitaria.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué la derivada de un producto no es el producto de las derivadas?</h4>
              <p>
                Porque cuando x cambia, cambian los dos factores a la vez, y el efecto total tiene
                dos contribuciones. La comprobación es inmediata: si (f·g)′ fuese f′·g′, la derivada
                de x·x sería 1·1 = 1, cuando en realidad la derivada de x² es 2x. La regla correcta,
                f′g + fg′, sí devuelve 1·x + x·1 = 2x.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Truco de repaso: prueba siempre una regla dudosa
                con un caso que ya conozcas. Si falla ahí, la regla está mal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo una función no es derivable en un punto?</h4>
              <p>
                En tres situaciones típicas: cuando hay un pico o esquina (como |x| en x = 0, donde
                las pendientes por la izquierda y por la derecha no coinciden), cuando la tangente
                es vertical (como √x en x = 0) y cuando la función ni siquiera es continua. La
                continuidad es necesaria pero no suficiente: toda función derivable es continua,
                pero no al revés.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Antes de derivar una función definida a trozos,
                comprueba qué pasa exactamente en los puntos de unión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se escribe sen o sin? ¿Y tg o tan?</h4>
              <p>
                Las dos formas son correctas. En los libros de texto en español se usa
                mayoritariamente <strong>sen</strong>, <strong>tg</strong> y <strong>cotg</strong>;
                en la notación internacional y en la mayoría de calculadoras y lenguajes de
                programación aparecen <strong>sin</strong>, <strong>tan</strong> y{' '}
                <strong>cot</strong>. Las fórmulas son idénticas: solo cambia la etiqueta.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> El buscador de esta tabla acepta las dos
                notaciones, así que puedes escribir «tan» o «tg» indistintamente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué las fórmulas trigonométricas exigen radianes?</h4>
              <p>
                Porque la deducción usa el límite (sen h)/h → 1 cuando h → 0, y ese límite solo vale
                1 si el ángulo se mide en radianes. Si trabajases en grados, la derivada del seno
                sería (π/180)·cos x. Es un motivo excelente para revisar el modo de la calculadora
                antes de un examen.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> En cálculo, salvo aviso expreso, todos los
                ángulos están en radianes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Hay que memorizar toda la tabla?</h4>
              <p>
                No toda con el mismo nivel de exigencia. Conviene tener automatizadas las de
                potencia, exponencial, logaritmo, seno y coseno, más las cuatro reglas (suma,
                producto, cociente y cadena): con eso se deducen casi todas las demás. Las inversas
                y las hiperbólicas suelen consultarse en un formulario, y ese es precisamente el uso
                de esta página.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Comprueba antes del examen si tu centro permite
                formulario: cambia por completo la estrategia de estudio.
              </p>
            </div>
          </div>

          <h2>Cómo derivar cualquier función sin bloquearte</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica la estructura global</strong>
                <p>
                  ¿Es una suma, un producto, un cociente o una composición? Esa decisión determina
                  qué regla aplicas primero. Una suma se ataca término a término; un cociente pide
                  la regla del cociente antes que nada.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Simplifica antes de derivar</strong>
                <p>
                  Reescribe raíces y fracciones como potencias (√x = x^(1/2), 1/x³ = x⁻³) y aplica
                  propiedades de logaritmos si las hay: ln(x²·y) = 2·ln x + ln y. Derivar una suma
                  es mucho más fácil que derivar un producto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Pela la función capa a capa</strong>
                <p>
                  Con la regla de la cadena, deriva desde fuera hacia dentro sin tocar el interior,
                  y multiplica al final por la derivada de lo de dentro. En sen²(3x) las capas son:
                  potencia, seno y 3x.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Consulta la fila concreta en la tabla</strong>
                <p>
                  Usa el buscador de arriba para la fórmula elemental que necesites y fíjate en la
                  versión con u: te ahorra el paso de recordar dónde va el factor u′.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba el dominio</strong>
                <p>
                  La derivada nunca es válida fuera del dominio de la función original, y a veces
                  es más pequeño todavía: √x existe en x = 0 pero no es derivable ahí. Anótalo en
                  el examen: puntúa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Simplifica el resultado</strong>
                <p>
                  Saca factor común, reduce a común denominador y cancela. Un resultado sin
                  simplificar hace mucho más difícil el paso siguiente (igualar a cero, estudiar el
                  signo o volver a derivar).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Verifica con un valor concreto</strong>
                <p>
                  Sustituye un número sencillo en tu derivada y compáralo con la pendiente
                  aproximada [f(x + 0,001) − f(x)] / 0,001. Si no se parecen, hay un error de signo
                  o un factor perdido.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas al derivar</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔗
              </span>
              <strong>Escribe siempre el factor u′</strong>
              <p>
                Anótalo antes de simplificar, aunque valga 1. Es el olvido más caro en composiciones
                del tipo sen(3x) o e^(x²).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ➖
              </span>
              <strong>Marca los signos negativos</strong>
              <p>
                cos, arccos, arccotg, cotg y cosec llevan menos. Rodéalos con un círculo cuando los
                escribas: evita la mitad de los errores.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔄
              </span>
              <strong>Convierte raíces en potencias</strong>
              <p>
                ⁿ√(xᵐ) = x^(m/n). Con esa reescritura solo necesitas una regla en lugar de
                memorizar casos sueltos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧮
              </span>
              <strong>Usa logaritmos para productos largos</strong>
              <p>
                En expresiones con varios factores y cocientes, la derivación logarítmica convierte
                el problema en una suma de términos u′/u.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📐
              </span>
              <strong>Dibuja mentalmente la gráfica</strong>
              <p>
                Si la función crece en un tramo y tu derivada sale negativa ahí, hay un error. El
                control gráfico detecta fallos que la revisión algebraica pasa por alto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <strong>Practica con la tabla cerrada</strong>
              <p>
                Consulta esta página para verificar, no para resolver. La velocidad en el examen
                viene de haber reconstruido la fórmula tú mismo varias veces.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores comunes que cuestan puntos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir la derivada del producto con el producto de derivadas:</strong>{' '}
                (f·g)′ ≠ f′·g′. Con f = g = x el atajo da 1 en lugar de 2x. Usa siempre f′g + fg′.
              </li>
              <li>
                <strong>Perder el signo menos del coseno:</strong> (cos x)′ = −sen x. El mismo
                despiste arrastra errores en arccos, cotg, cosec y arccotg.
              </li>
              <li>
                <strong>Olvidar el factor u′ de la regla de la cadena:</strong> la derivada de
                sen(3x) es 3·cos(3x), no cos(3x). Si el interior no es simplemente x, siempre
                aparece un factor extra.
              </li>
              <li>
                <strong>Invertir el numerador de la regla del cociente:</strong> es (f′g − fg′)/g²,
                nunca (fg′ − f′g)/g². Cambiar el orden invierte el signo de toda la derivada.
              </li>
              <li>
                <strong>Aplicar la regla de la potencia a aˣ:</strong> la derivada de 2ˣ no es
                x·2^(x−1). Con exponente variable la derivada es 2ˣ·ln 2.
              </li>
              <li>
                <strong>Ignorar el dominio:</strong> escribir (arcsen x)′ = 1/√(1 − x²) sin indicar
                |x| &lt; 1, o usar ln x en lugar de ln|x| cuando el argumento puede ser negativo.
              </li>
              <li>
                <strong>Mezclar hiperbólicas y trigonométricas:</strong> (cosh x)′ = senh x, sin
                signo menos, justo lo contrario que en el coseno circular.
              </li>
              <li>
                <strong>Trabajar en grados:</strong> las fórmulas trigonométricas solo son válidas
                en radianes; en grados aparecería un factor π/180 en cada derivada.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde el último tramo de la educación media (bachillerato en España,
            preparatoria en México, educación media superior o secundaria en otros países
            hispanohablantes) hasta los primeros cursos universitarios de cálculo en ingeniería,
            física, química o economía. Las filas de potencias, exponenciales, logaritmos y
            trigonométricas son las habituales en un examen de admisión universitaria; las
            hiperbólicas y las inversas menos frecuentes suelen aparecer ya en el primer curso de
            grado.
          </p>
          <p>
            Si además de la derivada necesitas el camino inverso, la{' '}
            <a href="/tabla-integrales/">tabla de integrales</a> es la app hermana de esta, con la
            misma estructura de búsqueda. Y para ver el concepto en movimiento, el{' '}
            <a href="/simulador-integral-area/">simulador de la integral como área</a> completa la
            pareja.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-derivadas')} />

      <ShareCard appName="tabla-derivadas" />

      <Footer appName="tabla-derivadas" />
    </div>
  );
}

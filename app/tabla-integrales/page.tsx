'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './TablaIntegrales.module.css';
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
  | 'inmediatas'
  | 'exp-log'
  | 'trig'
  | 'arco'
  | 'hiperbolicas'
  | 'metodos';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface EntradaIntegral {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  /** Integral planteada: ∫ f(x) dx */
  integral: ReactNode;
  /** Primitiva, siempre con + C */
  primitiva: ReactNode;
  /** Forma compuesta con u = u(x) */
  cadenaIntegral?: ReactNode;
  cadenaPrimitiva?: ReactNode;
  /** Dominio o condiciones de validez, cuando importan */
  condiciones?: string;
  /** Texto plano para el buscador: nombre, fórmula y sinónimos */
  busqueda: string;
  /** Justificación: casi siempre, derivar la primitiva */
  justificacion: string;
  ejemploTitulo: string;
  ejemploPasos: string[];
}

const CATEGORIAS: Categoria[] = [
  { id: 'inmediatas', nombre: 'Inmediatas y potencias', icono: '🔢' },
  { id: 'exp-log', nombre: 'Exponenciales y logarítmicas', icono: '📈' },
  { id: 'trig', nombre: 'Trigonométricas', icono: '📐' },
  { id: 'arco', nombre: 'Arcoseno y arcotangente', icono: '🔄' },
  { id: 'hiperbolicas', nombre: 'Hiperbólicas', icono: '🌉' },
  { id: 'metodos', nombre: 'Métodos de integración', icono: '🧩' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  inmediatas: 'Inmediatas y potencias',
  'exp-log': 'Exponenciales y logarítmicas',
  trig: 'Trigonométricas',
  arco: 'Arcoseno y arcotangente',
  hiperbolicas: 'Hiperbólicas',
  metodos: 'Métodos de integración',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE INTEGRALES
   Cada primitiva revisada derivándola: si la derivada devuelve el
   integrando, la entrada es correcta.
──────────────────────────────────────────────────────────────── */

const INTEGRALES: EntradaIntegral[] = [
  /* ── Inmediatas y potencias ───────────────────────────────── */
  {
    id: 'constante',
    categoria: 'inmediatas',
    nombre: 'Constante',
    integral: <>∫ k dx</>,
    primitiva: <>k·x + C</>,
    condiciones: 'k es un número fijo',
    busqueda:
      'constante k integral de una constante numero fijo termino independiente kx',
    justificacion:
      'Basta derivar: (k·x + C)′ = k. Geométricamente, el área bajo la recta horizontal y = k entre 0 y x es un rectángulo de base x y altura k, es decir, k·x.',
    ejemploTitulo: 'Calcular ∫ 5 dx',
    ejemploPasos: ['∫ 5 dx = 5x + C', 'Comprobación: (5x + C)′ = 5 ✓'],
  },
  {
    id: 'diferencial',
    categoria: 'inmediatas',
    nombre: 'Diferencial simple',
    integral: <>∫ dx</>,
    primitiva: <>x + C</>,
    busqueda: 'dx integral de dx diferencial uno integral de 1 x mas c',
    justificacion:
      'Es el caso k = 1 de la anterior. Aparece constantemente como resultado parcial en integración por partes y en cambios de variable.',
    ejemploTitulo: 'Calcular ∫ (1 + 3x) dx',
    ejemploPasos: ['∫ 1 dx = x', '∫ 3x dx = 3x²/2', 'Total: x + 3x²/2 + C'],
  },
  {
    id: 'potencia',
    categoria: 'inmediatas',
    nombre: 'Potencia',
    integral: (
      <>
        ∫ x<sup>n</sup> dx
      </>
    ),
    primitiva: (
      <>
        <Frac
          n={
            <>
              x<sup>n+1</sup>
            </>
          }
          d={<>n + 1</>}
        />{' '}
        + C
      </>
    ),
    cadenaIntegral: (
      <>
        ∫ u<sup>n</sup>·u′ dx
      </>
    ),
    cadenaPrimitiva: (
      <>
        <Frac
          n={
            <>
              u<sup>n+1</sup>
            </>
          }
          d={<>n + 1</>}
        />{' '}
        + C
      </>
    ),
    condiciones: 'n ≠ −1 (el caso n = −1 tiene fórmula propia)',
    busqueda:
      'potencia x elevado a n regla de la potencia integral de x cuadrado polinomio monomio sube el exponente',
    justificacion:
      'Es la regla de la potencia leída al revés: se sube el exponente en una unidad y se divide por el nuevo exponente. Derivando la primitiva: ((n+1)·xⁿ)/(n+1) = xⁿ. La división por n + 1 es justo lo que impide usarla cuando n = −1.',
    ejemploTitulo: 'Calcular ∫ (x⁴ − 2x) dx',
    ejemploPasos: [
      '∫ x⁴ dx = x⁵/5',
      '∫ 2x dx = x²',
      'Resultado: x⁵/5 − x² + C',
    ],
  },
  {
    id: 'potencia-menos-uno',
    categoria: 'inmediatas',
    nombre: 'Caso especial n = −1',
    integral: (
      <>
        ∫ x<sup>−1</sup> dx = ∫ <Frac n={<>dx</>} d={<>x</>} />
      </>
    ),
    primitiva: <>ln|x| + C</>,
    cadenaIntegral: (
      <>
        ∫ <Frac n={<>u′</>} d={<>u</>} /> dx
      </>
    ),
    cadenaPrimitiva: <>ln|u| + C</>,
    condiciones: 'x ≠ 0 — el valor absoluto es obligatorio',
    busqueda:
      'uno partido x 1/x integral de dx entre x logaritmo neperiano ln valor absoluto caso especial n igual menos uno tipo logaritmico',
    justificacion:
      'La regla de la potencia fallaría aquí porque dividiría entre n + 1 = 0. La primitiva correcta es ln|x|: para x > 0 su derivada es 1/x, y para x < 0 la regla de la cadena da (−1)/(−x) = 1/x también. Escribir ln x en vez de ln|x| deja fuera todo el semieje negativo.',
    ejemploTitulo: 'Calcular ∫ 6x/(3x² + 4) dx',
    ejemploPasos: [
      'u = 3x² + 4, u′ = 6x',
      'La integral tiene la forma ∫ u′/u dx',
      'Resultado: ln|3x² + 4| + C (aquí el argumento es siempre positivo)',
    ],
  },
  {
    id: 'raiz-cuadrada',
    categoria: 'inmediatas',
    nombre: 'Raíz cuadrada',
    integral: <>∫ √x dx</>,
    primitiva: (
      <>
        <Frac n="2" d="3" />
        ·x√x + C
      </>
    ),
    condiciones: 'x ≥ 0',
    busqueda:
      'raiz cuadrada de x integral de la raiz radical sqrt dos tercios x elevado a tres medios',
    justificacion:
      'Se escribe √x = x^(1/2) y se aplica la regla de la potencia: x^(3/2)/(3/2) = (2/3)·x^(3/2), que es lo mismo que (2/3)·x√x. Derivando el resultado se recupera x^(1/2).',
    ejemploTitulo: 'Calcular ∫ √x dx',
    ejemploPasos: [
      '∫ x^(1/2) dx = x^(3/2) / (3/2)',
      '= (2/3)·x^(3/2) + C',
      'Comprobación: la derivada de (2/3)x^(3/2) es x^(1/2) ✓',
    ],
  },
  {
    id: 'inversa-raiz',
    categoria: 'inmediatas',
    nombre: 'Inverso de la raíz',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>√x</>} />
      </>
    ),
    primitiva: <>2√x + C</>,
    condiciones: 'x > 0',
    busqueda:
      'uno partido raiz de x integral de dx entre raiz de x dos por raiz x x elevado a menos un medio',
    justificacion:
      'Con 1/√x = x^(−1/2), la regla de la potencia da x^(1/2)/(1/2) = 2√x. Es una primitiva que conviene reconocer de memoria porque aparece en muchos cambios de variable.',
    ejemploTitulo: 'Calcular ∫ dx/√(2x + 1)',
    ejemploPasos: [
      'u = 2x + 1, du = 2 dx',
      '∫ u^(−1/2) · (du/2) = (1/2)·2√u',
      'Resultado: √(2x + 1) + C',
    ],
  },
  {
    id: 'inversa-cuadrado',
    categoria: 'inmediatas',
    nombre: 'Inverso del cuadrado',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>x²</>} />
      </>
    ),
    primitiva: (
      <>
        −<Frac n="1" d="x" /> + C
      </>
    ),
    condiciones: 'x ≠ 0',
    busqueda:
      'uno partido x cuadrado integral de dx entre x al cuadrado menos uno partido x x elevado a menos dos',
    justificacion:
      'Aplicando la regla de la potencia con n = −2: x⁻¹/(−1) = −1/x. El signo menos es correcto y se comprueba derivando: (−x⁻¹)′ = x⁻² = 1/x².',
    ejemploTitulo: 'Calcular ∫ 3 dx/x²',
    ejemploPasos: ['∫ 3x⁻² dx = 3·(x⁻¹/(−1))', '= −3/x + C'],
  },
  {
    id: 'binomio-lineal',
    categoria: 'inmediatas',
    nombre: 'Potencia de un binomio lineal',
    integral: (
      <>
        ∫ (ax + b)<sup>n</sup> dx
      </>
    ),
    primitiva: (
      <>
        <Frac
          n={
            <>
              (ax + b)<sup>n+1</sup>
            </>
          }
          d={<>a(n + 1)</>}
        />{' '}
        + C
      </>
    ),
    condiciones: 'a ≠ 0, n ≠ −1',
    busqueda:
      'binomio lineal ax mas b elevado a n cambio de variable lineal dividir entre a paréntesis elevado',
    justificacion:
      'Es el cambio de variable más frecuente: u = ax + b, du = a·dx. Ese factor 1/a es lo que más se olvida; sin él, al derivar el resultado sobraría un factor a.',
    ejemploTitulo: 'Calcular ∫ (3x − 2)⁴ dx',
    ejemploPasos: [
      'a = 3, n = 4',
      '(3x − 2)⁵ / (3·5)',
      'Resultado: (3x − 2)⁵ / 15 + C',
    ],
  },

  /* ── Exponenciales y logarítmicas ─────────────────────────── */
  {
    id: 'exp-e',
    categoria: 'exp-log',
    nombre: 'Exponencial de base e',
    integral: (
      <>
        ∫ e<sup>x</sup> dx
      </>
    ),
    primitiva: (
      <>
        e<sup>x</sup> + C
      </>
    ),
    cadenaIntegral: (
      <>
        ∫ e<sup>u</sup>·u′ dx
      </>
    ),
    cadenaPrimitiva: (
      <>
        e<sup>u</sup> + C
      </>
    ),
    busqueda:
      'exponencial e elevado a x integral de e a la x numero e euler exp se queda igual',
    justificacion:
      'eˣ es su propia derivada, así que también es su propia primitiva (salvo la constante). Es la única función elemental con esa propiedad, y por eso simplifica tanto los modelos de crecimiento continuo.',
    ejemploTitulo: 'Calcular ∫ e^(5x) dx',
    ejemploPasos: [
      'u = 5x, du = 5 dx',
      '∫ e^u · (du/5) = e^u/5',
      'Resultado: e^(5x)/5 + C',
    ],
  },
  {
    id: 'exp-a',
    categoria: 'exp-log',
    nombre: 'Exponencial de base a',
    integral: (
      <>
        ∫ a<sup>x</sup> dx
      </>
    ),
    primitiva: (
      <>
        <Frac
          n={
            <>
              a<sup>x</sup>
            </>
          }
          d={<>ln a</>}
        />{' '}
        + C
      </>
    ),
    condiciones: 'a > 0, a ≠ 1',
    busqueda:
      'exponencial base a dos elevado a x integral con ln a dividir entre logaritmo de la base',
    justificacion:
      'Como (aˣ)′ = aˣ·ln a, hay que dividir entre ln a para compensar ese factor. Con a = e el denominador vale 1 y se recupera el caso anterior. La condición a ≠ 1 evita dividir entre ln 1 = 0.',
    ejemploTitulo: 'Calcular ∫ 3ˣ dx',
    ejemploPasos: [
      '∫ 3ˣ dx = 3ˣ / ln 3 + C',
      'ln 3 ≈ 1,0986',
      'Comprobación: (3ˣ/ln 3)′ = 3ˣ·ln 3/ln 3 = 3ˣ ✓',
    ],
  },
  {
    id: 'ln',
    categoria: 'exp-log',
    nombre: 'Logaritmo neperiano',
    integral: <>∫ ln x dx</>,
    primitiva: <>x·ln x − x + C</>,
    condiciones: 'x > 0',
    busqueda:
      'integral del logaritmo neperiano ln x por partes x ln x menos x primitiva del logaritmo',
    justificacion:
      'Sale por partes eligiendo u = ln x y dv = dx: x·ln x − ∫ x·(1/x) dx = x·ln x − x. Es el ejemplo clásico de integración por partes con un solo factor visible.',
    ejemploTitulo: 'Calcular ∫ ln x dx por partes',
    ejemploPasos: [
      'u = ln x → du = dx/x;  dv = dx → v = x',
      '∫ ln x dx = x·ln x − ∫ x·(1/x) dx',
      '= x·ln x − x + C',
    ],
  },
  {
    id: 'log-a',
    categoria: 'exp-log',
    nombre: 'Logaritmo de base a',
    integral: (
      <>
        ∫ log<sub>a</sub> x dx
      </>
    ),
    primitiva: (
      <>
        <Frac n={<>x·ln x − x</>} d={<>ln a</>} /> + C
      </>
    ),
    condiciones: 'x > 0, a > 0, a ≠ 1',
    busqueda:
      'integral del logaritmo en base a log decimal cambio de base dividir entre ln a',
    justificacion:
      'Por cambio de base, log_a x = ln x / ln a, y ln a es una constante que sale fuera de la integral. Solo hay que aplicar la primitiva del logaritmo neperiano y dividir.',
    ejemploTitulo: 'Calcular ∫ log₁₀ x dx',
    ejemploPasos: [
      'log₁₀ x = ln x / ln 10',
      '∫ log₁₀ x dx = (x·ln x − x) / ln 10 + C',
      'ln 10 ≈ 2,3026',
    ],
  },
  {
    id: 'x-por-exp',
    categoria: 'exp-log',
    nombre: 'x por exponencial',
    integral: (
      <>
        ∫ x·e<sup>x</sup> dx
      </>
    ),
    primitiva: (
      <>
        e<sup>x</sup>(x − 1) + C
      </>
    ),
    busqueda:
      'x por e elevado a x integracion por partes polinomio por exponencial ilate liate',
    justificacion:
      'Por partes con u = x y dv = eˣ dx: x·eˣ − ∫ eˣ dx = x·eˣ − eˣ = eˣ(x − 1). Sirve de patrón: cada vez que aparece un polinomio multiplicando a una exponencial, el polinomio es el factor que se deriva.',
    ejemploTitulo: 'Comprobar el resultado derivando',
    ejemploPasos: [
      'F(x) = eˣ(x − 1)',
      "F′(x) = eˣ(x − 1) + eˣ·1",
      '= eˣ·x ✓ coincide con el integrando',
    ],
  },

  /* ── Trigonométricas ──────────────────────────────────────── */
  {
    id: 'sen',
    categoria: 'trig',
    nombre: 'Seno',
    integral: <>∫ sen x dx</>,
    primitiva: <>−cos x + C</>,
    cadenaIntegral: <>∫ sen u · u′ dx</>,
    cadenaPrimitiva: <>−cos u + C</>,
    busqueda:
      'seno sen sin integral del seno menos coseno signo negativo trigonometrica',
    justificacion:
      'El signo menos aparece porque (cos x)′ = −sen x; para recuperar +sen x al derivar, la primitiva debe ser −cos x. Es simétrico al caso de la derivada y por eso se confunden tan a menudo.',
    ejemploTitulo: 'Calcular ∫ sen(4x) dx',
    ejemploPasos: [
      'u = 4x, du = 4 dx',
      '∫ sen u · (du/4) = −cos u / 4',
      'Resultado: −cos(4x)/4 + C',
    ],
  },
  {
    id: 'cos',
    categoria: 'trig',
    nombre: 'Coseno',
    integral: <>∫ cos x dx</>,
    primitiva: <>sen x + C</>,
    cadenaIntegral: <>∫ cos u · u′ dx</>,
    cadenaPrimitiva: <>sen u + C</>,
    busqueda:
      'coseno cos integral del coseno seno sin signo negativo trigonometrica',
    justificacion:
      'Aquí no hay signo menos: (sen x)′ = cos x directamente. Conviene fijar la pareja completa: la integral del seno lleva menos, la del coseno no.',
    ejemploTitulo: 'Calcular ∫ cos(πx) dx',
    ejemploPasos: [
      'u = πx, du = π dx',
      '∫ cos u · (du/π) = sen u / π',
      'Resultado: sen(πx)/π + C',
    ],
  },
  {
    id: 'sec-cuadrado',
    categoria: 'trig',
    nombre: 'Cuadrado de la secante',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>cos²x</>} />
      </>
    ),
    primitiva: <>tg x + C</>,
    condiciones: 'x ≠ π/2 + kπ',
    busqueda:
      'secante al cuadrado sec2 uno partido coseno al cuadrado integral que da tangente tg',
    justificacion:
      'Es exactamente la derivada de la tangente leída al revés: (tg x)′ = 1/cos²x. También se escribe ∫ sec²x dx = tg x + C.',
    ejemploTitulo: 'Calcular ∫ dx/cos²(3x)',
    ejemploPasos: [
      'u = 3x, du = 3 dx',
      '∫ du/(3·cos²u) = tg u / 3',
      'Resultado: tg(3x)/3 + C',
    ],
  },
  {
    id: 'cosec-cuadrado',
    categoria: 'trig',
    nombre: 'Cuadrado de la cosecante',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>sen²x</>} />
      </>
    ),
    primitiva: <>−cotg x + C</>,
    condiciones: 'x ≠ kπ',
    busqueda:
      'cosecante al cuadrado uno partido seno al cuadrado integral que da cotangente signo negativo',
    justificacion:
      'Como (cotg x)′ = −1/sen²x, la primitiva de 1/sen²x es −cotg x. El signo menos aquí sí es necesario, al contrario que en el caso de la tangente.',
    ejemploTitulo: 'Calcular ∫ dx/sen²(x/2)',
    ejemploPasos: [
      'u = x/2, du = dx/2',
      '∫ 2 du/sen²u = −2·cotg u',
      'Resultado: −2·cotg(x/2) + C',
    ],
  },
  {
    id: 'tg',
    categoria: 'trig',
    nombre: 'Tangente',
    integral: <>∫ tg x dx</>,
    primitiva: <>−ln|cos x| + C</>,
    condiciones: 'cos x ≠ 0',
    busqueda:
      'tangente tg tan integral de la tangente logaritmo del coseno menos ln coseno tipo logaritmico',
    justificacion:
      'Se escribe tg x = sen x/cos x y se toma u = cos x, con u′ = −sen x. La integral se convierte en −∫ u′/u dx = −ln|u|. El valor absoluto es imprescindible porque el coseno cambia de signo.',
    ejemploTitulo: 'Calcular ∫ tg x dx',
    ejemploPasos: [
      'u = cos x → du = −sen x dx',
      '∫ tg x dx = −∫ du/u = −ln|u|',
      'Resultado: −ln|cos x| + C (equivale a ln|sec x| + C)',
    ],
  },
  {
    id: 'cotg',
    categoria: 'trig',
    nombre: 'Cotangente',
    integral: <>∫ cotg x dx</>,
    primitiva: <>ln|sen x| + C</>,
    condiciones: 'sen x ≠ 0',
    busqueda:
      'cotangente cotg cot integral de la cotangente logaritmo del seno ln sen tipo logaritmico',
    justificacion:
      'Con cotg x = cos x/sen x y u = sen x, u′ = cos x, la integral es directamente ∫ u′/u dx = ln|u|. Aquí no hay signo menos, al revés que en la tangente.',
    ejemploTitulo: 'Calcular ∫ cotg(2x) dx',
    ejemploPasos: [
      'u = sen(2x), du = 2·cos(2x) dx',
      '∫ cotg(2x) dx = (1/2)·ln|sen(2x)|',
      'Resultado: (1/2)·ln|sen(2x)| + C',
    ],
  },
  {
    id: 'sec-tg',
    categoria: 'trig',
    nombre: 'Secante por tangente',
    integral: <>∫ sec x · tg x dx</>,
    primitiva: <>sec x + C</>,
    condiciones: 'x ≠ π/2 + kπ',
    busqueda:
      'secante por tangente integral que da secante sec x derivada de la secante',
    justificacion:
      'Es la derivada de la secante leída al revés: (sec x)′ = sec x·tg x. Aparece con frecuencia al integrar potencias de secante por reducción.',
    ejemploTitulo: 'Comprobar derivando',
    ejemploPasos: [
      'F(x) = sec x = 1/cos x',
      "F′(x) = sen x/cos²x",
      '= (1/cos x)·(sen x/cos x) = sec x·tg x ✓',
    ],
  },
  {
    id: 'cosec-cotg',
    categoria: 'trig',
    nombre: 'Cosecante por cotangente',
    integral: <>∫ cosec x · cotg x dx</>,
    primitiva: <>−cosec x + C</>,
    condiciones: 'x ≠ kπ',
    busqueda:
      'cosecante por cotangente integral que da cosecante signo negativo csc',
    justificacion:
      'Como (cosec x)′ = −cosec x·cotg x, la primitiva del producto cosec x·cotg x es −cosec x. El signo negativo es la única diferencia con el caso de la secante.',
    ejemploTitulo: 'Comprobar derivando',
    ejemploPasos: [
      'F(x) = −cosec x = −1/sen x',
      "F′(x) = cos x/sen²x",
      '= (1/sen x)·(cos x/sen x) = cosec x·cotg x ✓',
    ],
  },
  {
    id: 'sen-cuadrado',
    categoria: 'trig',
    nombre: 'Seno al cuadrado',
    integral: <>∫ sen²x dx</>,
    primitiva: (
      <>
        <Frac n={<>x</>} d="2" /> − <Frac n={<>sen(2x)</>} d="4" /> + C
      </>
    ),
    busqueda:
      'seno al cuadrado sen2x integral de sen cuadrado angulo doble formula de reduccion potencias pares',
    justificacion:
      'No se puede integrar directamente: hay que bajar el grado con la identidad del ángulo doble, sen²x = (1 − cos 2x)/2. Entonces la integral es x/2 − sen(2x)/4. Es la técnica estándar para potencias pares de seno y coseno.',
    ejemploTitulo: 'Calcular ∫ sen²x dx entre 0 y π',
    ejemploPasos: [
      'F(x) = x/2 − sen(2x)/4',
      'F(π) = π/2 − 0 = π/2;  F(0) = 0',
      'Resultado: π/2 ≈ 1,5708',
    ],
  },
  {
    id: 'cos-cuadrado',
    categoria: 'trig',
    nombre: 'Coseno al cuadrado',
    integral: <>∫ cos²x dx</>,
    primitiva: (
      <>
        <Frac n={<>x</>} d="2" /> + <Frac n={<>sen(2x)</>} d="4" /> + C
      </>
    ),
    busqueda:
      'coseno al cuadrado cos2x integral de coseno cuadrado angulo doble potencias pares',
    justificacion:
      'Con cos²x = (1 + cos 2x)/2 la integral es x/2 + sen(2x)/4. Es la gemela de la anterior y solo cambia el signo del segundo término: un buen control es que la suma de ambas primitivas debe dar x + C, porque sen²x + cos²x = 1.',
    ejemploTitulo: 'Comprobar la suma con sen²x',
    ejemploPasos: [
      '∫ sen²x dx + ∫ cos²x dx = x/2 − sen(2x)/4 + x/2 + sen(2x)/4',
      '= x + C',
      'Coincide con ∫ 1 dx ✓',
    ],
  },
  {
    id: 'sec',
    categoria: 'trig',
    nombre: 'Secante',
    integral: <>∫ sec x dx</>,
    primitiva: <>ln|sec x + tg x| + C</>,
    condiciones: 'x ≠ π/2 + kπ',
    busqueda:
      'secante sec integral de la secante uno partido coseno logaritmo de sec mas tg truco clasico',
    justificacion:
      'Se multiplica y divide por (sec x + tg x): el numerador que aparece, sec x·tg x + sec²x, es exactamente la derivada del denominador, así que la integral toma la forma ∫ u′/u dx = ln|u|. Es un truco que conviene recordar porque no se deduce de forma natural.',
    ejemploTitulo: 'Comprobar derivando el resultado',
    ejemploPasos: [
      'u = sec x + tg x',
      "u′ = sec x·tg x + sec²x = sec x·(tg x + sec x) = sec x·u",
      "(ln|u|)′ = u′/u = sec x ✓",
    ],
  },

  /* ── Arcoseno y arcotangente ──────────────────────────────── */
  {
    id: 'arcsen-basica',
    categoria: 'arco',
    nombre: 'Tipo arcoseno básico',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>√(1 − x²)</>} />
      </>
    ),
    primitiva: <>arcsen x + C</>,
    cadenaIntegral: (
      <>
        ∫ <Frac n={<>u′ dx</>} d={<>√(1 − u²)</>} />
      </>
    ),
    cadenaPrimitiva: <>arcsen u + C</>,
    condiciones: '|x| < 1',
    busqueda:
      'arcoseno arcsen arcsin integral que da arcoseno raiz de uno menos x cuadrado tipo arcoseno',
    justificacion:
      'Es la derivada del arcoseno leída al revés. También podría escribirse como −arccos x + C: las dos primitivas se diferencian en la constante π/2, y ambas son correctas.',
    ejemploTitulo: 'Calcular ∫ dx/√(1 − 9x²)',
    ejemploPasos: [
      'u = 3x, u′ = 3',
      '∫ (1/3)·u′ dx/√(1 − u²)',
      'Resultado: (1/3)·arcsen(3x) + C, válido si |x| < 1/3',
    ],
  },
  {
    id: 'arctan-basica',
    categoria: 'arco',
    nombre: 'Tipo arcotangente básico',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>1 + x²</>} />
      </>
    ),
    primitiva: <>arctg x + C</>,
    cadenaIntegral: (
      <>
        ∫ <Frac n={<>u′ dx</>} d={<>1 + u²</>} />
      </>
    ),
    cadenaPrimitiva: <>arctg u + C</>,
    condiciones: 'válida para todo x real',
    busqueda:
      'arcotangente arctan arctg integral que da arcotangente uno mas x cuadrado tipo arcotangente',
    justificacion:
      'Es la derivada del arcotangente al revés. Como 1 + x² nunca se anula, la primitiva vale en toda la recta real, algo poco habitual entre las integrales con denominador.',
    ejemploTitulo: 'Calcular ∫ dx/(1 + x²) entre 0 y 1',
    ejemploPasos: [
      'F(x) = arctg x',
      'F(1) − F(0) = π/4 − 0',
      'Resultado: π/4 ≈ 0,7854',
    ],
  },
  {
    id: 'arcsen-a',
    categoria: 'arco',
    nombre: 'Tipo arcoseno con parámetro a',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>√(a² − x²)</>} />
      </>
    ),
    primitiva: (
      <>
        arcsen <Frac n={<>x</>} d={<>a</>} /> + C
      </>
    ),
    condiciones: 'a > 0, |x| < a',
    busqueda:
      'arcoseno con parametro a raiz de a cuadrado menos x cuadrado sacar factor comun tipo arcoseno general',
    justificacion:
      'Se saca a² factor común dentro de la raíz: √(a² − x²) = a·√(1 − (x/a)²). Con el cambio u = x/a, du = dx/a, los factores a se cancelan y queda directamente arcsen(x/a).',
    ejemploTitulo: 'Calcular ∫ dx/√(9 − x²)',
    ejemploPasos: [
      'a² = 9 → a = 3',
      '∫ dx/√(9 − x²) = arcsen(x/3) + C',
      'Válido si |x| < 3',
    ],
  },
  {
    id: 'arctan-a',
    categoria: 'arco',
    nombre: 'Tipo arcotangente con parámetro a',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>a² + x²</>} />
      </>
    ),
    primitiva: (
      <>
        <Frac n="1" d={<>a</>} />
        ·arctg <Frac n={<>x</>} d={<>a</>} /> + C
      </>
    ),
    condiciones: 'a > 0',
    busqueda:
      'arcotangente con parametro a a cuadrado mas x cuadrado uno partido a por arctan de x entre a',
    justificacion:
      'Sacando a² factor común en el denominador y con el cambio u = x/a aparece un factor 1/a que no se puede olvidar. Cuando a = 1 se recupera el caso básico.',
    ejemploTitulo: 'Calcular ∫ dx/(4 + x²)',
    ejemploPasos: [
      'a² = 4 → a = 2',
      '∫ dx/(4 + x²) = (1/2)·arctg(x/2) + C',
      'Comprobación: derivando sale (1/2)·(1/2)/(1 + x²/4) = 1/(4 + x²) ✓',
    ],
  },
  {
    id: 'log-raiz-suma',
    categoria: 'arco',
    nombre: 'Raíz de x² + a² (tipo logarítmico)',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>√(x² + a²)</>} />
      </>
    ),
    primitiva: <>ln|x + √(x² + a²)| + C</>,
    condiciones: 'a > 0; válida para todo x real',
    busqueda:
      'raiz de x cuadrado mas a cuadrado integral logaritmica argumento seno hiperbolico argsenh',
    justificacion:
      'Coincide con argsenh(x/a) + C salvo una constante aditiva, y la forma logarítmica es la que suele pedirse en los exámenes. Se comprueba derivando: la derivada de ln|x + √(x² + a²)| es 1/√(x² + a²).',
    ejemploTitulo: 'Calcular ∫ dx/√(x² + 4)',
    ejemploPasos: [
      'a = 2',
      'Resultado: ln|x + √(x² + 4)| + C',
      'También se escribe argsenh(x/2) + C',
    ],
  },
  {
    id: 'log-raiz-resta',
    categoria: 'arco',
    nombre: 'Raíz de x² − a² (tipo logarítmico)',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>√(x² − a²)</>} />
      </>
    ),
    primitiva: <>ln|x + √(x² − a²)| + C</>,
    condiciones: 'a > 0, |x| > a',
    busqueda:
      'raiz de x cuadrado menos a cuadrado integral logaritmica argumento coseno hiperbolico argcosh',
    justificacion:
      'Análoga a la anterior, con el signo cambiado dentro de la raíz. Equivale a argcosh(x/a) + C en la rama x > a. Fíjate en la diferencia con el tipo arcoseno: ahí la raíz es √(a² − x²), aquí √(x² − a²).',
    ejemploTitulo: 'Calcular ∫ dx/√(x² − 9)',
    ejemploPasos: [
      'a = 3',
      'Resultado: ln|x + √(x² − 9)| + C',
      'Válido si |x| > 3',
    ],
  },
  {
    id: 'fraccion-diferencia-cuadrados',
    categoria: 'arco',
    nombre: 'Diferencia de cuadrados en el denominador',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>x² − a²</>} />
      </>
    ),
    primitiva: (
      <>
        <Frac n="1" d={<>2a</>} />
        ·ln
        <span>
          |<Frac n={<>x − a</>} d={<>x + a</>} />|
        </span>{' '}
        + C
      </>
    ),
    condiciones: 'a > 0, x ≠ ±a',
    busqueda:
      'diferencia de cuadrados x cuadrado menos a cuadrado fracciones simples descomposicion logaritmo',
    justificacion:
      'Se descompone en fracciones simples: 1/(x² − a²) = (1/2a)·[1/(x − a) − 1/(x + a)]. Cada sumando integra a un logaritmo, y al restarlos aparece el logaritmo del cociente. Ojo: NO es un tipo arcotangente, pese al parecido con a² + x².',
    ejemploTitulo: 'Calcular ∫ dx/(x² − 4)',
    ejemploPasos: [
      'a = 2, luego 1/(x² − 4) = (1/4)[1/(x − 2) − 1/(x + 2)]',
      'Integrando: (1/4)·[ln|x − 2| − ln|x + 2|]',
      'Resultado: (1/4)·ln|(x − 2)/(x + 2)| + C',
    ],
  },

  /* ── Hiperbólicas ─────────────────────────────────────────── */
  {
    id: 'senh',
    categoria: 'hiperbolicas',
    nombre: 'Seno hiperbólico',
    integral: <>∫ senh x dx</>,
    primitiva: <>cosh x + C</>,
    cadenaIntegral: <>∫ senh u · u′ dx</>,
    cadenaPrimitiva: <>cosh u + C</>,
    busqueda:
      'seno hiperbolico senh sh sinh integral sin signo negativo cosh catenaria',
    justificacion:
      'Como (cosh x)′ = senh x, la primitiva es cosh x. Aquí NO aparece el signo menos que sí tiene la integral del seno circular: es la diferencia clave entre ambas familias.',
    ejemploTitulo: 'Calcular ∫ senh(3x) dx',
    ejemploPasos: [
      'u = 3x, du = 3 dx',
      '∫ senh u · (du/3) = cosh u/3',
      'Resultado: cosh(3x)/3 + C',
    ],
  },
  {
    id: 'cosh',
    categoria: 'hiperbolicas',
    nombre: 'Coseno hiperbólico',
    integral: <>∫ cosh x dx</>,
    primitiva: <>senh x + C</>,
    cadenaIntegral: <>∫ cosh u · u′ dx</>,
    cadenaPrimitiva: <>senh u + C</>,
    busqueda:
      'coseno hiperbolico cosh ch integral senh sin signo negativo',
    justificacion:
      'Se deduce de (senh x)′ = cosh x. Junto con la anterior forma una pareja simétrica y sin signos negativos, mucho más sencilla de recordar que la trigonométrica.',
    ejemploTitulo: 'Calcular ∫ cosh x dx entre 0 y 1',
    ejemploPasos: [
      'F(x) = senh x',
      'senh 1 ≈ 1,1752;  senh 0 = 0',
      'Resultado ≈ 1,1752',
    ],
  },
  {
    id: 'sech-cuadrado',
    categoria: 'hiperbolicas',
    nombre: 'Inverso de cosh²',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>cosh²x</>} />
      </>
    ),
    primitiva: <>tgh x + C</>,
    busqueda:
      'sech al cuadrado uno partido cosh cuadrado integral que da tangente hiperbolica tgh tanh',
    justificacion:
      'Es la derivada de la tangente hiperbólica leída al revés: (tgh x)′ = 1/cosh²x. No hay restricciones de dominio porque cosh x nunca se anula.',
    ejemploTitulo: 'Calcular ∫ dx/cosh²(2x)',
    ejemploPasos: [
      'u = 2x, du = 2 dx',
      '∫ du/(2·cosh²u) = tgh u / 2',
      'Resultado: tgh(2x)/2 + C',
    ],
  },
  {
    id: 'cosech-cuadrado',
    categoria: 'hiperbolicas',
    nombre: 'Inverso de senh²',
    integral: (
      <>
        ∫ <Frac n={<>dx</>} d={<>senh²x</>} />
      </>
    ),
    primitiva: <>−cotgh x + C</>,
    condiciones: 'x ≠ 0',
    busqueda:
      'uno partido senh cuadrado integral que da cotangente hiperbolica coth signo negativo',
    justificacion:
      'De (cotgh x)′ = −1/senh²x se sigue que la primitiva de 1/senh²x es −cotgh x. El punto x = 0 queda excluido porque senh 0 = 0.',
    ejemploTitulo: 'Comprobar derivando',
    ejemploPasos: [
      'F(x) = −cotgh x',
      "F′(x) = −(−1/senh²x)",
      '= 1/senh²x ✓',
    ],
  },
  {
    id: 'tgh',
    categoria: 'hiperbolicas',
    nombre: 'Tangente hiperbólica',
    integral: <>∫ tgh x dx</>,
    primitiva: <>ln(cosh x) + C</>,
    condiciones: 'sin valor absoluto: cosh x > 0 siempre',
    busqueda:
      'tangente hiperbolica tgh tanh integral logaritmo de cosh sin valor absoluto',
    justificacion:
      'Con u = cosh x, u′ = senh x, la integral es ∫ u′/u dx = ln|u|. Como el coseno hiperbólico es siempre positivo (vale al menos 1), el valor absoluto sobra: se escribe ln(cosh x).',
    ejemploTitulo: 'Comprobar derivando',
    ejemploPasos: [
      'F(x) = ln(cosh x)',
      "F′(x) = senh x / cosh x",
      '= tgh x ✓',
    ],
  },

  /* ── Métodos de integración ───────────────────────────────── */
  {
    id: 'metodo-sustitucion',
    categoria: 'metodos',
    nombre: 'Sustitución (cambio de variable)',
    integral: <>∫ f(u(x))·u′(x) dx</>,
    primitiva: <>∫ f(u) du = F(u(x)) + C</>,
    busqueda:
      'sustitucion cambio de variable metodo de sustitucion u sustitucion du regla de la cadena al reves',
    justificacion:
      'Es la regla de la cadena leída en sentido inverso. Funciona cuando dentro de la integral aparece una función y, multiplicando, su derivada (aunque sea salvo una constante). Al terminar hay que deshacer el cambio y volver a la variable original.',
    ejemploTitulo: 'Calcular ∫ 2x·cos(x²) dx',
    ejemploPasos: [
      'u = x² → du = 2x dx',
      '∫ cos u du = sen u',
      'Deshacemos el cambio: sen(x²) + C',
    ],
  },
  {
    id: 'metodo-por-partes',
    categoria: 'metodos',
    nombre: 'Integración por partes (ILATE / LIATE)',
    integral: <>∫ u dv</>,
    primitiva: <>u·v − ∫ v du</>,
    busqueda:
      'por partes integracion por partes ilate liate un dia vi una vaca vestida de uniforme u dv producto',
    justificacion:
      'Sale de la regla del producto: (u·v)′ = u′v + uv′, e integrando ambos miembros. Para elegir u sirve la regla ILATE (o LIATE), que ordena por prioridad los tipos de función: Inversas trigonométricas, Logarítmicas, Algebraicas, Trigonométricas y Exponenciales. Se toma como u la que aparezca antes en esa lista, porque será la que se simplifique al derivar.',
    ejemploTitulo: 'Calcular ∫ x·sen x dx',
    ejemploPasos: [
      'Por ILATE, Algebraica antes que Trigonométrica: u = x, dv = sen x dx',
      'du = dx, v = −cos x',
      '∫ x·sen x dx = −x·cos x + ∫ cos x dx',
      'Resultado: −x·cos x + sen x + C',
    ],
  },
  {
    id: 'metodo-fracciones',
    categoria: 'metodos',
    nombre: 'Fracciones simples',
    integral: (
      <>
        ∫ <Frac n={<>P(x)</>} d={<>Q(x)</>} /> dx
      </>
    ),
    primitiva: <>suma de logaritmos y arcotangentes + C</>,
    condiciones: 'grado de P menor que el de Q (si no, dividir primero)',
    busqueda:
      'fracciones simples descomposicion en fracciones parciales cociente de polinomios raices del denominador metodo',
    justificacion:
      'Se factoriza el denominador y se descompone la fracción en sumandos elementales. Cada raíz real simple aporta un término A/(x − a) que integra a un logaritmo; las raíces múltiples aportan potencias; y los factores cuadráticos irreducibles dan lugar a arcotangentes. Si el grado del numerador no es menor, primero hay que dividir.',
    ejemploTitulo: 'Calcular ∫ dx/(x² − x)',
    ejemploPasos: [
      'x² − x = x(x − 1)',
      '1/(x² − x) = −1/x + 1/(x − 1)',
      'Resultado: −ln|x| + ln|x − 1| + C = ln|(x − 1)/x| + C',
    ],
  },
  {
    id: 'metodo-trigonometricas',
    categoria: 'metodos',
    nombre: 'Sustituciones trigonométricas',
    integral: <>∫ R(x, √(a² ± x²)) dx</>,
    primitiva: <>integral trigonométrica tras el cambio</>,
    condiciones: 'a > 0',
    busqueda:
      'sustituciones trigonometricas cambio trigonometrico raiz de a cuadrado menos x cuadrado x igual a por seno secante tangente',
    justificacion:
      'Cuando aparece una raíz cuadrada de un binomio cuadrático, un cambio trigonométrico la elimina usando la identidad fundamental. Los tres patrones son: para √(a² − x²), x = a·sen t; para √(a² + x²), x = a·tg t; y para √(x² − a²), x = a·sec t. Al final hay que deshacer el cambio con un triángulo rectángulo auxiliar.',
    ejemploTitulo: 'Calcular ∫ √(1 − x²) dx',
    ejemploPasos: [
      'x = sen t → dx = cos t dt, y √(1 − x²) = cos t',
      '∫ cos²t dt = t/2 + sen(2t)/4 = t/2 + (sen t·cos t)/2',
      'Deshaciendo: (arcsen x)/2 + (x·√(1 − x²))/2 + C',
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaIntegralesPage() {
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
    return INTEGRALES.filter((entrada) => {
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
          <span aria-hidden="true">∫</span> Tabla de Integrales Completa
        </h1>
        <p className={styles.subtitle}>
          Formulario de consulta rápida con {INTEGRALES.length} primitivas: inmediatas,
          exponenciales, logarítmicas, trigonométricas, tipo arcoseno y arcotangente, hiperbólicas
          y los cuatro métodos de integración. Con condiciones de validez y ejemplos resueltos.
        </p>
      </header>

      <LegalNotice />

      {/* Recordatorio de la constante de integración */}
      <div className={styles.avisoConstante}>
        <span aria-hidden="true">➕</span>
        <span>
          <strong>Toda primitiva lleva + C.</strong> Una función tiene infinitas primitivas que se
          diferencian en una constante, así que omitir el <strong>+ C</strong> en una integral
          indefinida es una respuesta incompleta y resta puntos en cualquier examen. En las
          integrales definidas, en cambio, la constante se cancela al restar y no se escribe.
        </span>
      </div>

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de integrales">
        <label className={styles.buscadorLabel} htmlFor="buscador-integrales">
          Busca una integral por nombre, fórmula o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-integrales"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="ln, raíz, arctan, por partes, sustitución…"
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
          {resultados.length} de {INTEGRALES.length} fórmulas
        </p>
      </section>

      {/* Tabla de fórmulas */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna fórmula que coincida con
            «{consulta}». Prueba con otro término (por ejemplo, <strong>tangente</strong>,{' '}
            <strong>exponencial</strong> o <strong>partes</strong>) o quita el filtro de categoría.
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
                      <span className={styles.etq}>Integral</span>
                      <span className={styles.expr}>{entrada.integral}</span>
                    </span>
                    <span className={styles.par}>
                      <span className={styles.etq}>Primitiva</span>
                      <span className={`${styles.expr} ${styles.exprDerivada}`}>
                        {entrada.primitiva}
                      </span>
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${entrada.id}`} className={styles.detalle}>
                    {entrada.cadenaIntegral && entrada.cadenaPrimitiva && (
                      <div className={styles.cadenaBox}>
                        <h3>Forma compuesta, si u = u(x)</h3>
                        <div className={styles.cadenaFormula}>
                          <span>{entrada.cadenaIntegral}</span>
                          <span>=</span>
                          <span>{entrada.cadenaPrimitiva}</span>
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

      {/* Integral definida y regla de Barrow */}
      <section className={styles.barrowBox} aria-label="Integral definida y regla de Barrow">
        <h2>
          <span aria-hidden="true">📏</span> Integral definida y regla de Barrow
        </h2>
        <p>
          Una <strong>integral indefinida</strong> devuelve una familia de funciones (las
          primitivas, todas con su + C). Una <strong>integral definida</strong> devuelve un{' '}
          <strong>número</strong>: el área con signo encerrada entre la curva y el eje horizontal
          en un intervalo.
        </p>
        <div className={styles.formulaBox}>
          ∫<sub>a</sub>
          <sup>b</sup> f(x) dx = F(b) − F(a), &nbsp;siendo F cualquier primitiva de f
        </div>
        <p>
          Esa es la <strong>regla de Barrow</strong>, consecuencia del teorema fundamental del
          cálculo. La constante se cancela al restar —(F(b) + C) − (F(a) + C) = F(b) − F(a)— y por
          eso en una integral definida no se escribe el + C.
        </p>
        <ul className={styles.bulletList}>
          <li>
            <strong>Área con signo:</strong> los tramos por debajo del eje cuentan en negativo. Si
            lo que quieres es el área geométrica, hay que localizar los cortes con el eje e integrar
            por tramos tomando valores absolutos.
          </li>
          <li>
            <strong>Cambio de variable:</strong> si haces una sustitución, o deshaces el cambio
            antes de evaluar, o cambias también los límites de integración. Mezclar ambas cosas es
            un error frecuente.
          </li>
          <li>
            <strong>Discontinuidades:</strong> la regla de Barrow exige que f sea continua en todo
            [a, b]. Aplicarla a ∫ dx/x² entre −1 y 1 daría −2, un disparate para una función siempre
            positiva: hay una asíntota en x = 0.
          </li>
        </ul>
      </section>

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender las integrales, no solo copiarlas"
        subtitle="Del teorema fundamental a cómo elegir el método correcto"
      >
        <section className={styles.guideSection}>
          <h2>Derivar e integrar son operaciones inversas</h2>
          <p>
            El <strong>teorema fundamental del cálculo</strong> es el puente entre las dos mitades
            del análisis: integrar una función y luego derivar el resultado te devuelve la función
            de partida. Por eso esta tabla de integrales es, en buena medida, la{' '}
            <a href="/tabla-derivadas/">tabla de derivadas</a> leída de derecha a izquierda, y por
            eso la mejor forma de comprobar una primitiva es derivarla.
          </p>
          <p>
            Hay, sin embargo, una asimetría importante: derivar es un procedimiento mecánico que
            siempre funciona, mientras que integrar es más parecido a resolver un puzle. No existe
            un algoritmo universal, y por eso conviene reconocer patrones. Si quieres ver de dónde
            sale la idea de área acumulada, el{' '}
            <a href="/simulador-integral-area/">simulador de la integral como área</a> muestra el
            proceso con rectángulos que se van afinando.
          </p>

          <h2>Primitiva, integral indefinida e integral definida</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Qué devuelve</th>
                  <th>Lleva + C</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Primitiva</strong>
                  </td>
                  <td>Una función concreta cuya derivada es f</td>
                  <td>No (es una sola)</td>
                  <td>F(x) = x²/2 para f(x) = x</td>
                </tr>
                <tr>
                  <td>
                    <strong>Integral indefinida</strong>
                  </td>
                  <td>Todas las primitivas a la vez</td>
                  <td>Sí, obligatorio</td>
                  <td>∫ x dx = x²/2 + C</td>
                </tr>
                <tr>
                  <td>
                    <strong>Integral definida</strong>
                  </td>
                  <td>Un número: área con signo</td>
                  <td>No (se cancela)</td>
                  <td>∫ x dx entre 0 y 2 = 2</td>
                </tr>
                <tr>
                  <td>
                    <strong>Integral impropia</strong>
                  </td>
                  <td>Un número o infinito, vía límite</td>
                  <td>No</td>
                  <td>∫ dx/x² desde 1 hasta ∞ = 1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Cómo elegir el método</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Qué ves en el integrando</th>
                  <th>Método</th>
                  <th>Ejemplo típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Una función y (casi) su derivada multiplicando</td>
                  <td>Sustitución</td>
                  <td>∫ 2x·cos(x²) dx</td>
                </tr>
                <tr>
                  <td>Producto de tipos distintos (polinomio × exponencial…)</td>
                  <td>Por partes (ILATE)</td>
                  <td>∫ x·eˣ dx</td>
                </tr>
                <tr>
                  <td>Cociente de polinomios</td>
                  <td>Fracciones simples</td>
                  <td>∫ dx/(x² − 4)</td>
                </tr>
                <tr>
                  <td>Raíz de a² ± x² o x² − a²</td>
                  <td>Sustitución trigonométrica</td>
                  <td>∫ √(1 − x²) dx</td>
                </tr>
                <tr>
                  <td>Potencia par de seno o coseno</td>
                  <td>Identidad del ángulo doble</td>
                  <td>∫ sen²x dx</td>
                </tr>
                <tr>
                  <td>Denominador de la forma 1 + x² o a² + x²</td>
                  <td>Tipo arcotangente directo</td>
                  <td>∫ dx/(4 + x²)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Para qué sirve integrar fuera del examen</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📐
              </span>
              <strong>Áreas, volúmenes y longitudes</strong>
              <p>
                El área entre dos curvas, el volumen de un sólido de revolución o la longitud de un
                arco se calculan con integrales definidas. Es el uso más directo y el que más
                aparece en los exámenes.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🚗
              </span>
              <strong>Acumular una magnitud</strong>
              <p>
                Si conoces la velocidad en cada instante, integrarla da el espacio recorrido. La
                misma idea sirve para acumular consumo eléctrico, caudal de agua o lluvia caída.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎲
              </span>
              <strong>Probabilidad</strong>
              <p>
                En una variable continua, la probabilidad de un intervalo es el área bajo la función
                de densidad. La campana de Gauss es justo el caso donde no existe primitiva
                elemental y se recurre a tablas o métodos numéricos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📊
              </span>
              <strong>Valores medios</strong>
              <p>
                El valor medio de una función en un intervalo es su integral dividida entre la
                longitud del intervalo. Es como se calcula la tensión eficaz de una corriente
                alterna o una temperatura media diaria.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué hay que poner siempre + C?</h4>
              <p>
                Porque la derivada de una constante es cero, así que x²/2, x²/2 + 7 y x²/2 − π
                tienen exactamente la misma derivada. Una función continua tiene infinitas
                primitivas y todas se diferencian en una constante: la integral indefinida las
                representa a todas. En una integral definida, en cambio, la constante se cancela al
                restar F(b) − F(a) y no debe escribirse.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Es de los descuentos más baratos de evitar: se
                pierde nota por no escribir dos caracteres.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué la integral de 1/x es ln|x| y no ln x?</h4>
              <p>
                Porque 1/x está definida también para x negativo, y ln x no. Con el valor absoluto,
                la fórmula cubre los dos tramos: para x &gt; 0 la derivada de ln x es 1/x, y para x
                &lt; 0 la derivada de ln(−x) es (−1)/(−x) = 1/x. Además, este es el único caso en
                que la regla de la potencia falla, porque exigiría dividir entre n + 1 = 0.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> La misma lógica se aplica a ln|cos x| en la
                integral de la tangente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué algunas funciones no tienen primitiva elemental?</h4>
              <p>
                Porque el conjunto de funciones elementales (polinomios, exponenciales, logaritmos,
                trigonométricas y sus combinaciones) no es cerrado para la integración. El teorema
                de Liouville demuestra que integrandos como e^(−x²), sen(x)/x o 1/ln x no admiten
                ninguna primitiva expresable con esas funciones. No es que nadie la haya encontrado:
                está demostrado que no existe.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Esas integrales se calculan numéricamente o se
                les da nombre propio (la función error, el seno integral).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo elijo qué es u en la integración por partes?</h4>
              <p>
                La regla ILATE (Inversas trigonométricas, Logarítmicas, Algebraicas,
                Trigonométricas, Exponenciales) ordena los tipos de función por prioridad: se toma
                como u la que aparezca antes en la lista, porque al derivarla se simplifica. En
                algunos países se enseña como LIATE, con las logarítmicas primero; la diferencia es
                irrelevante en la práctica, porque rara vez aparecen juntas una inversa
                trigonométrica y un logaritmo.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si tras aplicar por partes la integral resultante
                es más complicada, probablemente elegiste u al revés.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Mi resultado no coincide con el del libro, ¿está mal?</h4>
              <p>
                No necesariamente. Dos primitivas correctas pueden diferir en una constante y
                parecer distintas: arcsen x y −arccos x se diferencian en π/2, y −ln|cos x| es lo
                mismo que ln|sec x|. La comprobación definitiva es derivar tu resultado: si obtienes
                el integrando de partida, tu respuesta es válida aunque tenga otro aspecto.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Derivar el resultado cuesta treinta segundos y
                despeja cualquier duda en un examen.
              </p>
            </div>
          </div>

          <h2>Cómo atacar una integral paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Mira si es inmediata</strong>
                <p>
                  Antes de complicarte, comprueba si el integrando ya está en la tabla o se parece a
                  una fórmula conocida salvo constantes. Muchas integrales «difíciles» se resuelven
                  ajustando un factor numérico.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Reescribe y simplifica</strong>
                <p>
                  Separa sumas, saca constantes fuera, convierte raíces en potencias y aplica
                  identidades trigonométricas. Es habitual que una integral aparentemente compleja
                  se convierta en dos inmediatas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Busca una función y su derivada</strong>
                <p>
                  Si ves un bloque u(x) y, multiplicando, algo proporcional a u′(x), el cambio de
                  variable resolverá la integral. Es el método que hay que probar siempre primero.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Si es un producto de tipos distintos, por partes</strong>
                <p>
                  Polinomio por exponencial, polinomio por trigonométrica, logaritmo suelto o
                  arcotangente suelta son los casos clásicos. Aplica ILATE para elegir u y no te
                  asustes si hay que repetir el proceso dos veces.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Si es un cociente de polinomios, descompón</strong>
                <p>
                  Comprueba primero los grados: si el numerador no es de grado menor, divide. Luego
                  factoriza el denominador y monta la descomposición en fracciones simples.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Si hay una raíz cuadrática, sustitución trigonométrica</strong>
                <p>
                  √(a² − x²) pide x = a·sen t; √(a² + x²) pide x = a·tg t; √(x² − a²) pide x = a·sec
                  t. Recuerda deshacer el cambio con un triángulo auxiliar al terminar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Escribe el + C y comprueba derivando</strong>
                <p>
                  Cierra siempre con la constante en las indefinidas, y deriva tu primitiva para
                  verificar que recuperas el integrando. Es la única comprobación que no falla
                  nunca.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas al integrar</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ➕
              </span>
              <strong>Escribe el + C antes de simplificar</strong>
              <p>
                Ponlo en cuanto termines de integrar, no al final del ejercicio: si lo dejas para
                después, se olvida.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Comprueba derivando</strong>
              <p>
                Es rápido y detecta constantes mal ajustadas, signos perdidos y factores 1/a
                olvidados en los cambios lineales.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔤
              </span>
              <strong>No mezcles variables</strong>
              <p>
                Tras un cambio de variable, la integral debe quedar solo en u. Si te queda una x
                suelta, el cambio no era el adecuado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📏
              </span>
              <strong>En definidas, decide qué te piden</strong>
              <p>
                Área con signo y área geométrica no son lo mismo. Si hay cortes con el eje, integra
                por tramos y suma valores absolutos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧩
              </span>
              <strong>Reconoce patrones antes que fórmulas</strong>
              <p>
                u′/u, uⁿ·u′ y u′/(1 + u²) cubren una porción enorme de los ejercicios. Identificar
                el patrón es más útil que memorizar casos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⏱️
              </span>
              <strong>Ponte un límite de tiempo por método</strong>
              <p>
                Si un camino no avanza en un par de minutos, prueba otro. Insistir en la sustitución
                equivocada consume el examen entero.
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
                <strong>Olvidar el + C:</strong> es el error clásico de las integrales indefinidas.
                Sin la constante, la respuesta está incompleta: describes una primitiva concreta en
                lugar de la familia entera.
              </li>
              <li>
                <strong>Aplicar la regla de la potencia con n = −1:</strong> ∫ dx/x no es x⁰/0, que
                no tiene sentido. La primitiva es ln|x| + C.
              </li>
              <li>
                <strong>Escribir ln x en lugar de ln|x|:</strong> deja fuera todo el semieje
                negativo. El valor absoluto es parte de la fórmula, no un adorno.
              </li>
              <li>
                <strong>Perder el signo de la integral del seno:</strong> ∫ sen x dx = −cos x + C,
                mientras que ∫ cos x dx = sen x + C. El menos va en el seno.
              </li>
              <li>
                <strong>Olvidar el factor 1/a en los cambios lineales:</strong> ∫ cos(5x) dx es
                sen(5x)/5 + C, no sen(5x) + C. Deriva el resultado y verás sobrar el 5.
              </li>
              <li>
                <strong>Integrar un producto factor a factor:</strong> ∫ f·g dx no es (∫f)·(∫g).
                Para productos hay que sustituir o integrar por partes.
              </li>
              <li>
                <strong>Confundir a² + x² con x² − a²:</strong> el primero da un arcotangente y el
                segundo se descompone en fracciones simples y da un logaritmo. Se parecen mucho y no
                tienen nada que ver.
              </li>
              <li>
                <strong>Aplicar Barrow a través de una discontinuidad:</strong> con ∫ dx/x² entre −1
                y 1 la fórmula daría −2, imposible para una función siempre positiva. Hay que
                comprobar la continuidad en todo el intervalo.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde el último tramo de la educación media (bachillerato en España,
            preparatoria en México, educación media superior o secundaria en otros países
            hispanohablantes) hasta los primeros cursos universitarios de cálculo en ingeniería,
            física, química o economía. Las inmediatas, las trigonométricas y los métodos de
            sustitución y por partes son el núcleo de cualquier examen de admisión universitaria;
            las fracciones simples, las sustituciones trigonométricas y las hiperbólicas se trabajan
            ya en el primer curso de grado.
          </p>
          <p>
            Si lo que necesitas es el camino contrario, la{' '}
            <a href="/tabla-derivadas/">tabla de derivadas</a> es la app hermana de esta, con la
            misma estructura de búsqueda. Y para entender el concepto antes de aplicarlo, el{' '}
            <a href="/simulador-derivada-pendiente/">
              simulador de la derivada como pendiente de la tangente
            </a>{' '}
            cierra el círculo.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-integrales')} />

      <ShareCard appName="tabla-integrales" />

      <Footer appName="tabla-integrales" />
    </div>
  );
}

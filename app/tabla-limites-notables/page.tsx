'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './TablaLimitesNotables.module.css';
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
  | 'trig'
  | 'exp-log'
  | 'numero-e'
  | 'indeterminaciones'
  | 'equivalencias'
  | 'infinito'
  | 'sucesiones';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface EntradaLimite {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  /** Hacia dónde tiende la variable: «x → 0», «n → ∞»… */
  tendencia: string;
  /** Expresión cuyo límite se calcula (o la forma indeterminada) */
  expresion: ReactNode;
  /** Valor del límite (o «depende» en las indeterminaciones) */
  valor: ReactNode;
  /** Condiciones de validez, cuando importan */
  condiciones?: string;
  /** Técnica recomendada: se muestra destacada en el desplegable */
  tecnicaTitulo?: string;
  tecnica?: string;
  /** Advertencia crítica (uso de equivalencias, errores clásicos) */
  aviso?: string;
  /** Texto plano para el buscador: nombre, fórmula y sinónimos */
  busqueda: string;
  /** Justificación en lenguaje llano: por qué vale eso */
  justificacion: string;
  ejemploTitulo: string;
  ejemploPasos: string[];
}

const CATEGORIAS: Categoria[] = [
  { id: 'trig', nombre: 'Trigonométricos', icono: '📐' },
  { id: 'exp-log', nombre: 'Exponenciales y logarítmicos', icono: '📈' },
  { id: 'numero-e', nombre: 'El número e', icono: '🌀' },
  { id: 'indeterminaciones', nombre: 'Indeterminaciones', icono: '❓' },
  { id: 'equivalencias', nombre: 'Equivalencias infinitesimales', icono: '⚖️' },
  { id: 'infinito', nombre: 'Límites en el infinito', icono: '♾️' },
  { id: 'sucesiones', nombre: 'Sucesiones', icono: '🔢' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  trig: 'Trigonométricos',
  'exp-log': 'Exponenciales y logarítmicos',
  'numero-e': 'El número e',
  indeterminaciones: 'Indeterminaciones',
  equivalencias: 'Equivalencias infinitesimales',
  infinito: 'Límites en el infinito',
  sucesiones: 'Sucesiones',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE LÍMITES NOTABLES
   Cada entrada comprobada una a una: valor, signos y condiciones.
──────────────────────────────────────────────────────────────── */

const LIMITES: EntradaLimite[] = [
  /* ── Trigonométricos ──────────────────────────────────────── */
  {
    id: 'sen-x-entre-x',
    categoria: 'trig',
    nombre: 'Seno partido por x',
    tendencia: 'x → 0',
    expresion: <Frac n={<>sen x</>} d={<>x</>} />,
    valor: <>1</>,
    condiciones: 'x en radianes',
    busqueda:
      'seno sen sin x partido x limite fundamental trigonometrico sen x / x igual a 1 teorema del sandwich',
    justificacion:
      'Para ángulos pequeños medidos en radianes, el arco y su seno son casi el mismo número. La demostración clásica compara tres áreas en la circunferencia de radio 1: el triángulo interior (sen x / 2), el sector circular (x / 2) y el triángulo exterior (tg x / 2). De ahí sale cos x < sen x / x < 1 y, al hacer x → 0, el teorema del sándwich obliga al cociente a valer 1. Si el ángulo estuviese en grados el límite sería π/180 ≈ 0,01745, no 1.',
    ejemploTitulo: 'Calcular lím(x→0) sen(5x) / (3x)',
    ejemploPasos: [
      'Multiplicamos y dividimos para que el argumento del seno y el denominador coincidan.',
      'sen(5x)/(3x) = (5/3) · sen(5x)/(5x)',
      'Con u = 5x → 0 se tiene sen(u)/u → 1.',
      'Resultado: 5/3',
    ],
  },
  {
    id: 'sen-ax-entre-bx',
    categoria: 'trig',
    nombre: 'Seno de ax partido por bx',
    tendencia: 'x → 0',
    expresion: <Frac n={<>sen(ax)</>} d={<>bx</>} />,
    valor: <Frac n={<>a</>} d={<>b</>} />,
    condiciones: 'b ≠ 0, x en radianes',
    busqueda:
      'seno de ax partido bx cociente de senos coeficientes generalizacion sen 3x entre 2x proporcion',
    justificacion:
      'Es el límite fundamental con un cambio de escala. Escribiendo sen(ax)/(bx) = (a/b)·sen(ax)/(ax) y llamando u = ax, el segundo factor tiende a 1, así que solo sobrevive el cociente de los coeficientes. Lo mismo funciona con tangentes, arcos seno y arcos tangente.',
    ejemploTitulo: 'Calcular lím(x→0) sen(7x) / sen(2x)',
    ejemploPasos: [
      'Dividimos numerador y denominador entre x.',
      '= [sen(7x)/x] / [sen(2x)/x] → 7 / 2',
      'Resultado: 7/2 = 3,5',
    ],
  },
  {
    id: 'tan-x-entre-x',
    categoria: 'trig',
    nombre: 'Tangente partida por x',
    tendencia: 'x → 0',
    expresion: <Frac n={<>tg x</>} d={<>x</>} />,
    valor: <>1</>,
    condiciones: 'x en radianes',
    busqueda:
      'tangente tan tg x partido x limite trigonometrico tan x / x igual a 1 seno entre coseno',
    justificacion:
      'Basta escribir tg x = sen x / cos x y separar: (sen x / x)·(1 / cos x). El primer factor tiende a 1 por el límite fundamental y el segundo también, porque cos 0 = 1. Cerca de cero la tangente, el seno y el propio ángulo son prácticamente indistinguibles.',
    ejemploTitulo: 'Calcular lím(x→0) tg(3x) / sen(4x)',
    ejemploPasos: [
      'Dividimos numerador y denominador entre x.',
      '= [tg(3x)/x] / [sen(4x)/x] → 3 / 4',
      'Resultado: 3/4 = 0,75',
    ],
  },
  {
    id: 'uno-menos-cos-entre-x2',
    categoria: 'trig',
    nombre: 'Uno menos coseno partido por x²',
    tendencia: 'x → 0',
    expresion: <Frac n={<>1 − cos x</>} d={<>x²</>} />,
    valor: <Frac n={<>1</>} d={<>2</>} />,
    condiciones: 'x en radianes',
    busqueda:
      'uno menos coseno partido x cuadrado 1-cos x / x^2 igual a un medio coseno limite notable angulo mitad',
    justificacion:
      'Se usa la identidad del ángulo mitad, 1 − cos x = 2·sen²(x/2). El cociente queda 2·sen²(x/2)/x² = (1/2)·[sen(x/2)/(x/2)]², y el corchete tiende a 1, así que el límite es 1/2. También se ve con el desarrollo de Taylor: cos x = 1 − x²/2 + x⁴/24 − …, de donde 1 − cos x ≈ x²/2.',
    ejemploTitulo: 'Calcular lím(x→0) (1 − cos 2x) / x²',
    ejemploPasos: [
      'Con u = 2x: (1 − cos u)/u² → 1/2.',
      '(1 − cos 2x)/x² = 4 · (1 − cos 2x)/(2x)²',
      'Resultado: 4 · (1/2) = 2',
    ],
  },
  {
    id: 'uno-menos-cos-entre-x',
    categoria: 'trig',
    nombre: 'Uno menos coseno partido por x',
    tendencia: 'x → 0',
    expresion: <Frac n={<>1 − cos x</>} d={<>x</>} />,
    valor: <>0</>,
    condiciones: 'x en radianes',
    busqueda:
      'uno menos coseno partido x 1-cos x / x igual a cero coseno primer orden infinitesimo de orden dos',
    justificacion:
      'Como 1 − cos x se comporta igual que x²/2, al dividir entre x queda algo del orden de x/2, que tiende a 0. Es un ejemplo de por qué importa el orden del infinitésimo: 1 − cos x es de orden 2, así que dividido entre x (orden 1) todavía se va a cero, y dividido entre x² da una constante.',
    ejemploTitulo: 'Calcular lím(x→0) (1 − cos x) / sen x',
    ejemploPasos: [
      'Multiplicamos y dividimos por x: [(1 − cos x)/x] · [x/sen x]',
      'El primer factor tiende a 0 y el segundo a 1.',
      'Resultado: 0',
    ],
  },
  {
    id: 'arcsen-entre-x',
    categoria: 'trig',
    nombre: 'Arcoseno partido por x',
    tendencia: 'x → 0',
    expresion: <Frac n={<>arcsen x</>} d={<>x</>} />,
    valor: <>1</>,
    busqueda:
      'arcoseno arcsen arcsin asin partido x limite igual a 1 funcion inversa del seno cambio de variable',
    justificacion:
      'Se resuelve con el cambio y = arcsen x, de modo que x = sen y e y → 0 cuando x → 0. El cociente se convierte en y / sen y, que es el inverso del límite fundamental y por tanto vale 1. En general, una función y su inversa comparten el mismo comportamiento lineal cerca del origen.',
    ejemploTitulo: 'Calcular lím(x→0) arcsen(3x) / tg(5x)',
    ejemploPasos: [
      'Dividimos numerador y denominador entre x.',
      '= [arcsen(3x)/x] / [tg(5x)/x] → 3 / 5',
      'Resultado: 3/5 = 0,6',
    ],
  },
  {
    id: 'arctan-entre-x',
    categoria: 'trig',
    nombre: 'Arcotangente partida por x',
    tendencia: 'x → 0',
    expresion: <Frac n={<>arctg x</>} d={<>x</>} />,
    valor: <>1</>,
    busqueda:
      'arcotangente arctan arctg atan partido x limite igual a 1 funcion inversa de la tangente',
    justificacion:
      'Con el cambio y = arctg x resulta x = tg y, y el cociente pasa a ser y / tg y, inverso del límite de la tangente, que vale 1. También sale de L’Hôpital: la derivada de arctg x es 1/(1 + x²), que en x = 0 vale 1, y la derivada de x es 1.',
    ejemploTitulo: 'Calcular lím(x→0) arctg(x²) / (1 − cos x)',
    ejemploPasos: [
      'arctg(x²) se comporta como x²; 1 − cos x se comporta como x²/2.',
      'El cociente tiende a x² / (x²/2) = 2.',
      'Resultado: 2',
    ],
  },
  {
    id: 'x-menos-sen-entre-x3',
    categoria: 'trig',
    nombre: 'x menos seno partido por x³',
    tendencia: 'x → 0',
    expresion: <Frac n={<>x − sen x</>} d={<>x³</>} />,
    valor: <Frac n={<>1</>} d={<>6</>} />,
    condiciones: 'x en radianes',
    aviso:
      'Aquí NO se puede sustituir sen x por x: la resta cancela el término principal y daría 0, cuando el valor correcto es 1/6. Es el contraejemplo canónico del mal uso de las equivalencias.',
    busqueda:
      'x menos seno partido x cubo un sexto taylor contraejemplo equivalencias resta cancelacion lhopital tres veces',
    justificacion:
      'El desarrollo de Taylor del seno es sen x = x − x³/6 + x⁵/120 − …, de forma que x − sen x = x³/6 − x⁵/120 + … Al dividir entre x³ queda 1/6 más términos que se van a cero. También se obtiene aplicando tres veces la regla de L’Hôpital, aunque el camino es más largo.',
    ejemploTitulo: 'Calcular lím(x→0) (x − sen x) / x³ con Taylor',
    ejemploPasos: [
      'sen x = x − x³/6 + o(x³)',
      'x − sen x = x³/6 + o(x³)',
      '(x − sen x)/x³ = 1/6 + o(1)',
      'Resultado: 1/6 ≈ 0,1667',
    ],
  },
  {
    id: 'tan-menos-sen',
    categoria: 'trig',
    nombre: 'Tangente menos seno partido por x³',
    tendencia: 'x → 0',
    expresion: <Frac n={<>tg x − sen x</>} d={<>x³</>} />,
    valor: <Frac n={<>1</>} d={<>2</>} />,
    condiciones: 'x en radianes',
    aviso:
      'Sustituir tg x ~ x y sen x ~ x daría 0. Ambas equivalencias son correctas, pero no valen dentro de una resta.',
    busqueda:
      'tangente menos seno partido x cubo un medio taylor resta de infinitesimos error clasico examen',
    justificacion:
      'Se factoriza: tg x − sen x = sen x·(1/cos x − 1) = sen x·(1 − cos x)/cos x. Ahora sí hay un producto, y se pueden usar equivalencias: sen x ~ x y 1 − cos x ~ x²/2, con cos x → 1. El resultado es x·(x²/2)/x³ = 1/2.',
    ejemploTitulo: 'Calcular lím(x→0) (tg x − sen x) / x³ factorizando',
    ejemploPasos: [
      'tg x − sen x = sen x · (1 − cos x) / cos x',
      'Ahora es un producto: sen x ~ x, 1 − cos x ~ x²/2, cos x → 1',
      '≈ x · (x²/2) / x³ = 1/2',
      'Resultado: 1/2',
    ],
  },
  {
    id: 'sen-entre-x-infinito',
    categoria: 'trig',
    nombre: 'Seno partido por x en el infinito',
    tendencia: 'x → ∞',
    expresion: <Frac n={<>sen x</>} d={<>x</>} />,
    valor: <>0</>,
    busqueda:
      'seno partido x en el infinito acotada por infinitesimo cero funcion acotada teorema producto acotada',
    justificacion:
      'No es el límite fundamental, aunque la expresión sea idéntica: aquí x se hace enorme, no pequeño. El seno queda siempre entre −1 y 1, así que el cociente está atrapado entre −1/x y 1/x, y ambos extremos tienden a 0. Es el teorema «acotada por infinitésimo da infinitésimo».',
    ejemploTitulo: 'Calcular lím(x→∞) (x + sen x) / x',
    ejemploPasos: [
      'Separamos: 1 + sen x / x',
      'sen x / x → 0 porque el seno está acotado.',
      'Resultado: 1',
    ],
  },
  {
    id: 'x-sen-uno-entre-x',
    categoria: 'trig',
    nombre: 'x por seno de 1/x',
    tendencia: 'x → ∞',
    expresion: (
      <>
        x·sen<Frac n={<>1</>} d={<>x</>} />
      </>
    ),
    valor: <>1</>,
    busqueda:
      'x por seno de uno partido x limite igual a 1 cambio de variable infinito a cero recíproco',
    justificacion:
      'Con el cambio t = 1/x, cuando x → ∞ se tiene t → 0 y la expresión se convierte en sen t / t, que vale 1. Es el mismo límite fundamental disfrazado; conviene reconocerlo porque aparece a menudo en problemas de aproximación de polígonos regulares a la circunferencia.',
    ejemploTitulo: 'Calcular lím(n→∞) n·sen(π/n)',
    ejemploPasos: [
      'n·sen(π/n) = π · sen(π/n)/(π/n)',
      'Con t = π/n → 0, sen t / t → 1.',
      'Resultado: π ≈ 3,1416 (el semiperímetro del polígono regular tiende al de la circunferencia)',
    ],
  },

  /* ── Exponenciales y logarítmicos ─────────────────────────── */
  {
    id: 'ex-menos-1-entre-x',
    categoria: 'exp-log',
    nombre: 'Exponencial menos uno partido por x',
    tendencia: 'x → 0',
    expresion: (
      <Frac
        n={
          <>
            e<sup>x</sup> − 1
          </>
        }
        d={<>x</>}
      />
    ),
    valor: <>1</>,
    busqueda:
      'exponencial menos uno partido x e^x-1/x igual a 1 numero e euler derivada de la exponencial en cero',
    justificacion:
      'Este límite es, literalmente, la derivada de eˣ en x = 0, y vale 1 porque eˣ es su propia derivada. Dicho de otro modo, el número e se define como la base para la que este cociente vale exactamente 1; con cualquier otra base aparecería un factor ln a. Con Taylor: eˣ = 1 + x + x²/2 + …, luego eˣ − 1 ≈ x.',
    ejemploTitulo: 'Calcular lím(x→0) (e^(3x) − 1) / (5x)',
    ejemploPasos: [
      'Con u = 3x: (e^u − 1)/u → 1',
      '(e^(3x) − 1)/(5x) = (3/5)·(e^(3x) − 1)/(3x)',
      'Resultado: 3/5 = 0,6',
    ],
  },
  {
    id: 'ax-menos-1-entre-x',
    categoria: 'exp-log',
    nombre: 'Base a menos uno partido por x',
    tendencia: 'x → 0',
    expresion: (
      <Frac
        n={
          <>
            a<sup>x</sup> − 1
          </>
        }
        d={<>x</>}
      />
    ),
    valor: <>ln a</>,
    condiciones: 'a > 0',
    busqueda:
      'base a elevado a x menos uno partido x logaritmo neperiano de a 2^x-1 exponencial de base cualquiera',
    justificacion:
      'Se escribe aˣ = e^(x·ln a). Entonces aˣ − 1 = e^(x·ln a) − 1, que se comporta como x·ln a por el límite anterior. Al dividir entre x queda ln a. Cuando a = e el factor vale 1, y por eso e es la base «natural» del cálculo.',
    ejemploTitulo: 'Calcular lím(x→0) (2^x − 1) / x',
    ejemploPasos: [
      '2^x = e^(x·ln 2)',
      'e^(x·ln 2) − 1 se comporta como x·ln 2',
      'Resultado: ln 2 ≈ 0,693',
    ],
  },
  {
    id: 'ln-1-mas-x-entre-x',
    categoria: 'exp-log',
    nombre: 'Logaritmo de (1 + x) partido por x',
    tendencia: 'x → 0',
    expresion: <Frac n={<>ln(1 + x)</>} d={<>x</>} />,
    valor: <>1</>,
    busqueda:
      'logaritmo neperiano de uno mas x partido x ln(1+x)/x igual a 1 log natural derivada del logaritmo',
    justificacion:
      'Es la derivada de ln(1 + x) en x = 0, que vale 1/(1 + 0) = 1. También sale del número e: ln(1 + x)/x = ln[(1 + x)^(1/x)], y como (1 + x)^(1/x) → e, el logaritmo tiende a ln e = 1. Cerca de cero, el logaritmo de 1 + x es casi el propio x.',
    ejemploTitulo: 'Calcular lím(x→0) ln(1 + 4x) / sen(2x)',
    ejemploPasos: [
      'ln(1 + 4x) se comporta como 4x; sen(2x) como 2x.',
      'El cociente tiende a 4x / 2x = 2.',
      'Resultado: 2',
    ],
  },
  {
    id: 'log-a-1-mas-x',
    categoria: 'exp-log',
    nombre: 'Logaritmo en base a de (1 + x) partido por x',
    tendencia: 'x → 0',
    expresion: (
      <Frac
        n={
          <>
            log<sub>a</sub>(1 + x)
          </>
        }
        d={<>x</>}
      />
    ),
    valor: <Frac n={<>1</>} d={<>ln a</>} />,
    condiciones: 'a > 0 y a ≠ 1',
    busqueda:
      'logaritmo en base a de uno mas x partido x cambio de base log decimal log10 uno partido ln a',
    justificacion:
      'Por el cambio de base, log_a(1 + x) = ln(1 + x)/ln a. Como ln(1 + x)/x → 1, el cociente completo tiende a 1/ln a. Con a = 10 el valor es 1/ln 10 ≈ 0,4343, la constante que aparece al pasar de logaritmos decimales a neperianos.',
    ejemploTitulo: 'Calcular lím(x→0) log₁₀(1 + x) / x',
    ejemploPasos: [
      'log₁₀(1 + x) = ln(1 + x) / ln 10',
      'ln(1 + x)/x → 1',
      'Resultado: 1 / ln 10 ≈ 0,4343',
    ],
  },
  {
    id: 'potencia-1-mas-x',
    categoria: 'exp-log',
    nombre: 'Binomio (1 + x) elevado a α menos uno',
    tendencia: 'x → 0',
    expresion: (
      <Frac
        n={
          <>
            (1 + x)<sup>α</sup> − 1
          </>
        }
        d={<>x</>}
      />
    ),
    valor: <>α</>,
    condiciones: 'α número real cualquiera',
    busqueda:
      'binomio uno mas x elevado a alfa menos uno partido x igual a alfa raiz cuadrada aproximacion lineal newton',
    justificacion:
      'Es la derivada de (1 + x)^α en x = 0, que vale α·(1 + 0)^(α−1) = α. En la práctica es la aproximación lineal más útil del cálculo: para valores pequeños de x, (1 + x)^α ≈ 1 + αx. Con α = 1/2 da la aproximación √(1 + x) ≈ 1 + x/2, usada en física e ingeniería.',
    ejemploTitulo: 'Calcular lím(x→0) (√(1 + x) − 1) / x',
    ejemploPasos: [
      'Es el caso α = 1/2.',
      '(1 + x)^(1/2) − 1 se comporta como x/2',
      'Resultado: 1/2 = 0,5',
    ],
  },
  {
    id: 'xa-menos-1-entre-x-menos-1',
    categoria: 'exp-log',
    nombre: 'x elevado a a menos uno, partido por x − 1',
    tendencia: 'x → 1',
    expresion: (
      <Frac
        n={
          <>
            x<sup>a</sup> − 1
          </>
        }
        d={<>x − 1</>}
      />
    ),
    valor: <>a</>,
    condiciones: 'a real; x > 0 si a no es entero',
    busqueda:
      'x elevado a a menos uno partido x menos uno limite en x tiende a 1 derivada de la potencia definicion',
    justificacion:
      'Es la definición de derivada de x^a en el punto x = 1: el cociente incremental vale a·1^(a−1) = a. También se ve con el cambio t = x − 1 → 0, que lo convierte en el binomio (1 + t)^a − 1 partido por t.',
    ejemploTitulo: 'Calcular lím(x→1) (x⁵ − 1) / (x − 1)',
    ejemploPasos: [
      'Factorizando: x⁵ − 1 = (x − 1)(x⁴ + x³ + x² + x + 1)',
      'Se cancela (x − 1) y queda x⁴ + x³ + x² + x + 1',
      'Sustituyendo x = 1: 5',
      'Resultado: 5 (coincide con a = 5)',
    ],
  },
  {
    id: 'x-ln-x',
    categoria: 'exp-log',
    nombre: 'x por logaritmo de x',
    tendencia: 'x → 0⁺',
    expresion: <>x·ln x</>,
    valor: <>0</>,
    condiciones: 'solo por la derecha (x > 0)',
    tecnicaTitulo: 'Indeterminación 0·∞',
    tecnica:
      'Se pasa a cociente escribiendo x·ln x = ln x / (1/x), que es de tipo ∞/∞, y se aplica L’Hôpital.',
    busqueda:
      'x por logaritmo neperiano de x cero por infinito limite igual a cero lhopital entropia x ln x',
    justificacion:
      'Aunque ln x se dispara hacia −∞, lo hace mucho más despacio de lo que x se acerca a 0, y gana el factor que va a cero. Formalmente: ln x / (1/x) → (1/x) / (−1/x²) = −x → 0. Este límite es la razón de que en la fórmula de la entropía el término p·ln p no dé problemas cuando una probabilidad es nula.',
    ejemploTitulo: 'Calcular lím(x→0⁺) x·ln x',
    ejemploPasos: [
      'Reescribimos: x·ln x = ln x / (1/x), forma −∞/∞',
      'L’Hôpital: (1/x) / (−1/x²) = −x',
      'Resultado: 0',
    ],
  },
  {
    id: 'ln-x-entre-x',
    categoria: 'exp-log',
    nombre: 'Logaritmo partido por x',
    tendencia: 'x → ∞',
    expresion: <Frac n={<>ln x</>} d={<>x</>} />,
    valor: <>0</>,
    busqueda:
      'logaritmo partido x en el infinito ln x / x igual a cero crecimiento lento del logaritmo jerarquia',
    justificacion:
      'El logaritmo crece más despacio que cualquier potencia positiva de x, por pequeño que sea el exponente. Con L’Hôpital el cociente pasa a (1/x)/1 = 1/x → 0. Es el primer eslabón de la jerarquía de infinitos y explica por qué un algoritmo de coste logarítmico es tan eficiente.',
    ejemploTitulo: 'Calcular lím(x→∞) (ln x)³ / x',
    ejemploPasos: [
      'Aunque el logaritmo esté elevado al cubo, sigue perdiendo frente a x.',
      'Con L’Hôpital tres veces el numerador se agota y el denominador sigue siendo x.',
      'Resultado: 0',
    ],
  },
  {
    id: 'xx-en-cero',
    categoria: 'exp-log',
    nombre: 'x elevado a x',
    tendencia: 'x → 0⁺',
    expresion: (
      <>
        x<sup>x</sup>
      </>
    ),
    valor: <>1</>,
    condiciones: 'solo por la derecha (x > 0)',
    tecnicaTitulo: 'Indeterminación 0⁰',
    tecnica:
      'Se toman logaritmos: ln(xˣ) = x·ln x → 0, así que xˣ → e⁰ = 1.',
    busqueda:
      'x elevado a x cero elevado a cero indeterminacion tomar logaritmos limite igual a uno potencia-exponencial',
    justificacion:
      'La forma 0⁰ es indeterminada, así que hay que calcularla. Tomando logaritmos el problema se convierte en x·ln x, que tiende a 0, y deshaciendo el logaritmo queda e⁰ = 1. Que este caso concreto valga 1 no significa que toda forma 0⁰ valga 1: depende de la velocidad relativa de la base y el exponente.',
    ejemploTitulo: 'Calcular lím(x→0⁺) xˣ',
    ejemploPasos: [
      'L = lím xˣ, tomamos logaritmos: ln L = lím x·ln x',
      'lím x·ln x = 0',
      'L = e⁰ = 1',
    ],
  },

  /* ── El número e ──────────────────────────────────────────── */
  {
    id: 'e-infinito',
    categoria: 'numero-e',
    nombre: 'Definición del número e',
    tendencia: 'x → ∞',
    expresion: (
      <>
        (1 + <Frac n={<>1</>} d={<>x</>} />)<sup>x</sup>
      </>
    ),
    valor: <>e ≈ 2,71828</>,
    busqueda:
      'numero e definicion uno mas uno partido x elevado a x euler interes compuesto continuo 2,71828',
    justificacion:
      'Es la definición histórica de e, que Jacob Bernoulli encontró estudiando el interés compuesto: si un capital al 100 % anual se capitaliza en x periodos, al final del año se multiplica por (1 + 1/x)ˣ. Con más y más periodos ese factor no se dispara, sino que se estabiliza en 2,71828… La base crece hacia 1 y el exponente hacia ∞, y el equilibrio entre ambos produce un número finito.',
    ejemploTitulo: 'Comprobar la convergencia numéricamente',
    ejemploPasos: [
      'x = 10 → (1,1)¹⁰ ≈ 2,594',
      'x = 100 → (1,01)¹⁰⁰ ≈ 2,705',
      'x = 10.000 → ≈ 2,71815',
      'Resultado: e ≈ 2,718281828…',
    ],
  },
  {
    id: 'e-cero',
    categoria: 'numero-e',
    nombre: 'El número e con x tendiendo a cero',
    tendencia: 'x → 0',
    expresion: (
      <>
        (1 + x)<sup>1/x</sup>
      </>
    ),
    valor: <>e</>,
    busqueda:
      'uno mas x elevado a uno partido x numero e version con x tendiendo a cero reciproco euler',
    justificacion:
      'Es la misma fórmula anterior con el cambio t = 1/x: cuando x → 0 se tiene t → ∞, y (1 + x)^(1/x) se convierte en (1 + 1/t)^t. Esta versión es la más cómoda cuando el paréntesis se acerca a 1 desde un infinitésimo, que es el caso típico de los ejercicios de tipo 1^∞.',
    ejemploTitulo: 'Calcular lím(x→0) (1 + 2x)^(1/x)',
    ejemploPasos: [
      'Escribimos (1 + 2x)^(1/x) = [(1 + 2x)^(1/(2x))]²',
      'El corchete tiende a e.',
      'Resultado: e² ≈ 7,389',
    ],
  },
  {
    id: 'e-k',
    categoria: 'numero-e',
    nombre: 'Potencia (1 + k/x) elevado a x',
    tendencia: 'x → ∞',
    expresion: (
      <>
        (1 + <Frac n={<>k</>} d={<>x</>} />)<sup>x</sup>
      </>
    ),
    valor: (
      <>
        e<sup>k</sup>
      </>
    ),
    condiciones: 'k constante real',
    busqueda:
      'uno mas k partido x elevado a x igual a e elevado a k interes compuesto continuo tasa crecimiento',
    justificacion:
      'Basta escribir (1 + k/x)ˣ = [(1 + k/x)^(x/k)]^k y observar que el corchete tiende a e. Es la fórmula del crecimiento continuo: un capital al tipo k capitalizado infinitas veces se multiplica por e^k. Con k = 0,05 y un año, el factor es e^0,05 ≈ 1,0513.',
    ejemploTitulo: 'Calcular lím(x→∞) (1 + 3/x)^(2x)',
    ejemploPasos: [
      '(1 + 3/x)^(2x) = [(1 + 3/x)^x]²',
      'El corchete tiende a e³.',
      'Resultado: (e³)² = e⁶ ≈ 403,4',
    ],
  },
  {
    id: 'e-menos-uno',
    categoria: 'numero-e',
    nombre: 'Potencia (1 − 1/x) elevado a x',
    tendencia: 'x → ∞',
    expresion: (
      <>
        (1 − <Frac n={<>1</>} d={<>x</>} />)<sup>x</sup>
      </>
    ),
    valor: <Frac n={<>1</>} d={<>e</>} />,
    busqueda:
      'uno menos uno partido x elevado a x igual a uno partido e decrecimiento exponencial e a la menos uno 0,3679',
    justificacion:
      'Es el caso k = −1 de la fórmula anterior, así que el valor es e⁻¹ ≈ 0,3679. Aparece en el problema clásico del sorteo en el que nadie se saca a sí mismo: la probabilidad de que ninguna persona coincida tiende a 1/e cuando el grupo crece.',
    ejemploTitulo: 'Calcular lím(x→∞) (1 − 2/x)^x',
    ejemploPasos: [
      'Es el caso k = −2.',
      'Resultado: e⁻² ≈ 0,1353',
    ],
  },
  {
    id: 'forma-1-infinito',
    categoria: 'numero-e',
    nombre: 'Fórmula general para 1 elevado a infinito',
    tendencia: 'x → a (o ∞)',
    expresion: (
      <>
        f(x)<sup>g(x)</sup>
      </>
    ),
    valor: (
      <>
        e<sup>lím g(x)·(f(x) − 1)</sup>
      </>
    ),
    condiciones: 'f(x) → 1 y g(x) → ∞',
    tecnicaTitulo: 'Cómo se usa',
    tecnica:
      'Se calcula aparte el límite del producto g(x)·(f(x) − 1) y se pone como exponente de e. Si ese límite es L, el resultado es e^L.',
    busqueda:
      'uno elevado a infinito formula general limites tipo exponencial e elevado al limite de g por f menos uno indeterminacion',
    justificacion:
      'Escribiendo f = 1 + (f − 1) con f − 1 → 0, se tiene f^g = [(1 + (f − 1))^(1/(f−1))]^(g·(f−1)). El corchete tiende a e y el exponente al límite del producto, de donde sale la fórmula. Es un atajo seguro siempre que se compruebe antes que la base tiende a 1 y el exponente a infinito: si la base tiende a otra cosa, no hay indeterminación y basta sustituir.',
    ejemploTitulo: 'Calcular lím(x→∞) [(x + 2)/(x + 1)]^(3x)',
    ejemploPasos: [
      'La base tiende a 1 y el exponente a ∞: es 1^∞.',
      'f − 1 = (x + 2)/(x + 1) − 1 = 1/(x + 1)',
      'g·(f − 1) = 3x/(x + 1) → 3',
      'Resultado: e³ ≈ 20,09',
    ],
  },
  {
    id: 'e-serie',
    categoria: 'numero-e',
    nombre: 'El número e como suma de inversos de factoriales',
    tendencia: 'n → ∞',
    expresion: (
      <>
        1 + <Frac n={<>1</>} d={<>1!</>} /> + <Frac n={<>1</>} d={<>2!</>} /> + … +{' '}
        <Frac n={<>1</>} d={<>n!</>} />
      </>
    ),
    valor: <>e</>,
    busqueda:
      'numero e como serie suma de inversos de factoriales convergencia rapida taylor de la exponencial en cero',
    justificacion:
      'Sale del desarrollo de Taylor de eˣ evaluado en x = 1. Converge mucho más deprisa que (1 + 1/n)ⁿ: con solo diez sumandos ya se tienen siete cifras decimales correctas, mientras que la fórmula del interés compuesto necesita millones de términos para la misma precisión. Es la que se usa para calcular e en la práctica.',
    ejemploTitulo: 'Sumar los primeros términos',
    ejemploPasos: [
      '1 + 1 = 2',
      '+ 1/2 = 2,5',
      '+ 1/6 = 2,6667',
      '+ 1/24 = 2,7083 … y con 10 términos ya se llega a 2,7182818',
    ],
  },

  /* ── Las siete indeterminaciones ──────────────────────────── */
  {
    id: 'ind-0-0',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación cero partido por cero',
    tendencia: 'cualquier tendencia',
    expresion: <Frac n={<>0</>} d={<>0</>} />,
    valor: <>Depende</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Factorizar y simplificar el factor que se anula; con raíces, multiplicar por el conjugado; con funciones trascendentes, aplicar equivalencias infinitesimales o la regla de L’Hôpital (derivar arriba y abajo por separado, nunca el cociente).',
    busqueda:
      'indeterminacion cero partido cero 0/0 lhopital factorizar simplificar conjugado ruffini equivalencias',
    justificacion:
      'Es indeterminada porque el resultado depende de a qué velocidad se anulan numerador y denominador: x/x² tiende a ∞, x²/x tiende a 0 y 3x/x tiende a 3, y las tres son de la forma 0/0. Por eso no se puede decidir nada sin analizar la expresión concreta.',
    ejemploTitulo: 'Calcular lím(x→2) (x² − 4) / (x − 2)',
    ejemploPasos: [
      'Sustituir da 0/0.',
      'Factorizamos: x² − 4 = (x − 2)(x + 2)',
      'Simplificamos (x − 2) y queda x + 2',
      'Resultado: 4',
    ],
  },
  {
    id: 'ind-inf-inf',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación infinito partido por infinito',
    tendencia: 'x → ∞',
    expresion: <Frac n={<>∞</>} d={<>∞</>} />,
    valor: <>Depende</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Dividir numerador y denominador entre el término de mayor orden; en polinomios, comparar grados; en general, usar la jerarquía de infinitos o la regla de L’Hôpital.',
    busqueda:
      'indeterminacion infinito partido infinito grado del polinomio termino dominante lhopital jerarquia cociente',
    justificacion:
      'Igual que 0/0, el valor depende de quién crece más deprisa. En un cociente de polinomios el resultado es 0 si el grado de arriba es menor, el cociente de coeficientes principales si son iguales, e infinito si el de arriba es mayor. Con exponenciales y logaritmos, la jerarquía de infinitos decide en un solo paso.',
    ejemploTitulo: 'Calcular lím(x→∞) (3x² + 5x) / (2x² − 1)',
    ejemploPasos: [
      'Dividimos todo entre x² (el mayor grado).',
      '= (3 + 5/x) / (2 − 1/x²)',
      'Los términos con x en el denominador se van a 0.',
      'Resultado: 3/2 = 1,5',
    ],
  },
  {
    id: 'ind-0-por-inf',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación cero por infinito',
    tendencia: 'cualquier tendencia',
    expresion: <>0 · ∞</>,
    valor: <>Depende</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Convertirla en cociente pasando uno de los dos factores al denominador como su inverso: f·g = f / (1/g). Queda 0/0 o ∞/∞ y ya se puede aplicar L’Hôpital.',
    busqueda:
      'indeterminacion cero por infinito producto pasar a cociente invertir un factor lhopital 0 infinito',
    justificacion:
      'El producto de algo que se anula por algo que se dispara puede dar cualquier cosa: x·(1/x) da 1, x²·(1/x) da 0 y x·(1/x²) da infinito. La transformación a cociente no cambia el valor del límite y permite usar las herramientas de las dos primeras formas.',
    ejemploTitulo: 'Calcular lím(x→0⁺) x²·ln x',
    ejemploPasos: [
      'Forma 0·(−∞). Reescribimos: ln x / (1/x²)',
      'L’Hôpital: (1/x) / (−2/x³) = −x²/2',
      'Resultado: 0',
    ],
  },
  {
    id: 'ind-inf-menos-inf',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación infinito menos infinito',
    tendencia: 'x → ∞ (o x → a)',
    expresion: <>∞ − ∞</>,
    valor: <>Depende</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Operar para dejar una sola expresión: común denominador si son fracciones, multiplicar y dividir por el conjugado si hay raíces, o sacar factor común el término dominante.',
    busqueda:
      'indeterminacion infinito menos infinito resta conjugado comun denominador radicales factor comun',
    justificacion:
      'Dos cantidades que se disparan pueden dejar una diferencia finita, nula o infinita: (x + 1) − x da 1, x − x da 0 y x² − x da infinito. Como la resta cancela los términos principales, hay que llegar hasta el término siguiente para saber el resultado; por eso las equivalencias infinitesimales fallan justo aquí.',
    ejemploTitulo: 'Calcular lím(x→∞) [√(x² + x) − x]',
    ejemploPasos: [
      'Multiplicamos y dividimos por el conjugado √(x² + x) + x.',
      '= x / [√(x² + x) + x]',
      'Dividimos entre x: 1 / [√(1 + 1/x) + 1] → 1/2',
      'Resultado: 1/2 = 0,5',
    ],
  },
  {
    id: 'ind-1-inf',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación uno elevado a infinito',
    tendencia: 'cualquier tendencia',
    expresion: (
      <>
        1<sup>∞</sup>
      </>
    ),
    valor: <>Depende (sale un e)</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Fórmula directa: el límite es e elevado al límite de g(x)·(f(x) − 1). Como alternativa siempre válida, tomar logaritmos y resolver el 0·∞ resultante.',
    busqueda:
      'indeterminacion uno elevado a infinito numero e formula directa tomar logaritmos exponencial 1^infinito',
    justificacion:
      'La base tiende a 1, lo que empujaría el resultado hacia 1, pero el exponente se dispara, lo que amplifica cualquier desviación por diminuta que sea. El equilibrio entre ambos efectos produce una potencia de e. Ojo: solo hay indeterminación si la base tiende exactamente a 1; si tiende a 0,99 el límite es 0 y si tiende a 1,01 es infinito.',
    ejemploTitulo: 'Calcular lím(x→∞) (1 + 1/x²)^x',
    ejemploPasos: [
      'Base → 1, exponente → ∞: es 1^∞.',
      'g·(f − 1) = x·(1/x²) = 1/x → 0',
      'Resultado: e⁰ = 1',
    ],
  },
  {
    id: 'ind-0-0-potencia',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación cero elevado a cero',
    tendencia: 'cualquier tendencia',
    expresion: (
      <>
        0<sup>0</sup>
      </>
    ),
    valor: <>Depende</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Tomar logaritmos: si L es el límite buscado, ln L = lím g(x)·ln f(x), que es de tipo 0·(−∞). Se resuelve ese producto y al final se deshace con L = e^(ln L).',
    busqueda:
      'indeterminacion cero elevado a cero potencia exponencial tomar logaritmos 0^0 x elevado a x',
    justificacion:
      'La base tira del resultado hacia 0 y el exponente hacia 1, y quién gana depende de la velocidad relativa. Por ejemplo xˣ tiende a 1, mientras que x^(1/ln x) tiende a e para x → 0⁺. Que la calculadora devuelva 0⁰ = 1 es un convenio algebraico, no el valor del límite.',
    ejemploTitulo: 'Calcular lím(x→0⁺) (sen x)^x',
    ejemploPasos: [
      'ln L = lím x·ln(sen x)',
      'sen x se comporta como x, así que ln(sen x) ≈ ln x',
      'lím x·ln x = 0, luego ln L = 0',
      'Resultado: L = e⁰ = 1',
    ],
  },
  {
    id: 'ind-inf-0',
    categoria: 'indeterminaciones',
    nombre: 'Indeterminación infinito elevado a cero',
    tendencia: 'x → ∞',
    expresion: (
      <>
        ∞<sup>0</sup>
      </>
    ),
    valor: <>Depende</>,
    tecnicaTitulo: 'Cómo se resuelve',
    tecnica:
      'Igual que 0⁰: tomar logaritmos para llegar a ln L = lím g(x)·ln f(x), de tipo 0·∞, y resolver el producto.',
    busqueda:
      'indeterminacion infinito elevado a cero raiz n-esima de n potencia exponencial logaritmos infinito^0',
    justificacion:
      'La base se dispara hacia infinito pero el exponente se apaga hacia cero, y el resultado depende de cuál gana. El caso más famoso es la raíz n-ésima de n, que es n^(1/n) y tiende a 1. En cambio (e^n)^(1/n) es constantemente e, y también es de la forma ∞⁰.',
    ejemploTitulo: 'Calcular lím(x→∞) x^(1/x)',
    ejemploPasos: [
      'ln L = lím (ln x)/x',
      '(ln x)/x → 0 por la jerarquía de infinitos',
      'Resultado: L = e⁰ = 1',
    ],
  },

  /* ── Equivalencias infinitesimales ────────────────────────── */
  {
    id: 'equiv-regla',
    categoria: 'equivalencias',
    nombre: 'Regla de uso de las equivalencias',
    tendencia: 'x → 0',
    expresion: <>f ~ g</>,
    valor: <>Solo en · y ÷</>,
    aviso:
      'Las equivalencias SOLO pueden sustituirse dentro de productos y cocientes. NUNCA se sustituye un sumando de una suma o de una resta: es el error número uno en los exámenes de cálculo.',
    tecnicaTitulo: 'Qué significa f ~ g',
    tecnica:
      'Dos infinitésimos son equivalentes cuando el límite de su cociente vale 1. Eso permite intercambiarlos en un producto o cociente sin alterar el resultado, porque el factor que se introduce tiende a 1.',
    busqueda:
      'equivalencias infinitesimales regla de uso infinitesimos equivalentes producto cociente suma resta prohibido error',
    justificacion:
      'Si f ~ g, entonces f = g·(f/g) con f/g → 1, y en un producto ese factor extra desaparece al tomar el límite. En una suma, en cambio, el término f − g que se desprecia puede ser precisamente el que decide el resultado: si los términos principales se cancelan, lo que queda es exactamente lo que la equivalencia había tirado a la basura.',
    ejemploTitulo: 'Contraejemplo: por qué falla en una resta',
    ejemploPasos: [
      'Mal hecho: en lím(x→0) (x − sen x)/x³ sustituyo sen x ~ x',
      'Obtendría (x − x)/x³ = 0/x³ = 0 ← INCORRECTO',
      'Valor real (por Taylor): 1/6 ≈ 0,1667',
      'La resta cancela el término x y el resultado lo decide el −x³/6 que la equivalencia había descartado.',
    ],
  },
  {
    id: 'equiv-sen',
    categoria: 'equivalencias',
    nombre: 'Seno equivalente a x',
    tendencia: 'x → 0',
    expresion: <>sen x</>,
    valor: <>~ x</>,
    condiciones: 'x en radianes',
    busqueda:
      'seno equivalente a x infinitesimo sen x ~ x aproximacion de angulos pequeños pendulo radianes',
    justificacion:
      'Se deduce directamente del límite fundamental sen x / x → 1. Es la aproximación de ángulos pequeños que se usa en física: el péndulo simple solo tiene solución sencilla porque para oscilaciones pequeñas sen θ se sustituye por θ. Con θ = 0,1 rad el error relativo es del 0,17 %.',
    ejemploTitulo: 'Calcular lím(x→0) sen(2x)·arctg(3x) / x²',
    ejemploPasos: [
      'Es un producto y un cociente: se pueden usar equivalencias.',
      'sen(2x) ~ 2x; arctg(3x) ~ 3x',
      '≈ (2x)(3x)/x² = 6',
      'Resultado: 6',
    ],
  },
  {
    id: 'equiv-tan',
    categoria: 'equivalencias',
    nombre: 'Tangente equivalente a x',
    tendencia: 'x → 0',
    expresion: <>tg x</>,
    valor: <>~ x</>,
    condiciones: 'x en radianes',
    busqueda:
      'tangente equivalente a x infinitesimo tan x ~ x tg x pendiente pequeña aproximacion lineal',
    justificacion:
      'Porque tg x / x → 1. Cerca del origen la gráfica de la tangente se confunde con la recta y = x, igual que la del seno; la diferencia entre ambas es de orden x³ (tg x − sen x ~ x³/2) y solo se nota cuando el límite obliga a mirar a esa profundidad.',
    ejemploTitulo: 'Calcular lím(x→0) tg(x²) / (1 − cos x)',
    ejemploPasos: [
      'tg(x²) ~ x²; 1 − cos x ~ x²/2',
      '≈ x² / (x²/2) = 2',
      'Resultado: 2',
    ],
  },
  {
    id: 'equiv-arcsen',
    categoria: 'equivalencias',
    nombre: 'Arcoseno equivalente a x',
    tendencia: 'x → 0',
    expresion: <>arcsen x</>,
    valor: <>~ x</>,
    busqueda:
      'arcoseno equivalente a x infinitesimo arcsen x ~ x arcsin funcion inversa aproximacion',
    justificacion:
      'Es la contrapartida de sen x ~ x: si una función se parece a la identidad cerca del origen, su inversa también. Formalmente sale del cambio y = arcsen x, que transforma el cociente en y / sen y → 1.',
    ejemploTitulo: 'Calcular lím(x→0) arcsen(5x) / sen(2x)',
    ejemploPasos: [
      'arcsen(5x) ~ 5x; sen(2x) ~ 2x',
      '≈ 5x / 2x = 5/2',
      'Resultado: 2,5',
    ],
  },
  {
    id: 'equiv-arctan',
    categoria: 'equivalencias',
    nombre: 'Arcotangente equivalente a x',
    tendencia: 'x → 0',
    expresion: <>arctg x</>,
    valor: <>~ x</>,
    busqueda:
      'arcotangente equivalente a x infinitesimo arctan x ~ x arctg funcion inversa aproximacion lineal',
    justificacion:
      'Se deduce de arctg x / x → 1, o de que la derivada de arctg x en 0 vale 1. Su desarrollo es arctg x = x − x³/3 + …, así que la diferencia con x es de orden cúbico.',
    ejemploTitulo: 'Calcular lím(x→0) arctg(4x) / (e^(2x) − 1)',
    ejemploPasos: [
      'arctg(4x) ~ 4x; e^(2x) − 1 ~ 2x',
      '≈ 4x / 2x = 2',
      'Resultado: 2',
    ],
  },
  {
    id: 'equiv-cos',
    categoria: 'equivalencias',
    nombre: 'Uno menos coseno equivalente a x²/2',
    tendencia: 'x → 0',
    expresion: <>1 − cos x</>,
    valor: (
      <>
        ~ <Frac n={<>x²</>} d={<>2</>} />
      </>
    ),
    condiciones: 'x en radianes',
    aviso:
      'Es la única equivalencia de la lista que es de orden 2. Olvidar el 2 del denominador es un error muy frecuente: 1 − cos x NO es equivalente a x².',
    busqueda:
      'uno menos coseno equivalente a x cuadrado partido dos infinitesimo de orden dos 1-cos x ~ x^2/2',
    justificacion:
      'De (1 − cos x)/x² → 1/2 se sigue que 1 − cos x se comporta como x²/2. La identidad 1 − cos x = 2·sen²(x/2) lo hace evidente: es esencialmente el cuadrado de un infinitésimo de primer orden, de ahí que sea de orden 2 y que se anule mucho más deprisa que el seno.',
    ejemploTitulo: 'Calcular lím(x→0) (1 − cos 3x) / (x·sen x)',
    ejemploPasos: [
      '1 − cos 3x ~ (3x)²/2 = 9x²/2',
      'x·sen x ~ x·x = x²',
      '≈ (9x²/2)/x² = 9/2',
      'Resultado: 4,5',
    ],
  },
  {
    id: 'equiv-exp',
    categoria: 'equivalencias',
    nombre: 'Exponencial menos uno equivalente a x',
    tendencia: 'x → 0',
    expresion: (
      <>
        e<sup>x</sup> − 1
      </>
    ),
    valor: <>~ x</>,
    busqueda:
      'exponencial menos uno equivalente a x infinitesimo e^x-1 ~ x aproximacion crecimiento pequeño interes',
    justificacion:
      'Sale de (eˣ − 1)/x → 1. En finanzas es la razón de que, para tipos pequeños, el interés continuo y el simple casi coincidan: e^0,02 − 1 = 0,0202, apenas dos diezmilésimas por encima de 0,02.',
    ejemploTitulo: 'Calcular lím(x→0) (e^(x²) − 1) / (1 − cos x)',
    ejemploPasos: [
      'e^(x²) − 1 ~ x²; 1 − cos x ~ x²/2',
      '≈ x²/(x²/2) = 2',
      'Resultado: 2',
    ],
  },
  {
    id: 'equiv-ax',
    categoria: 'equivalencias',
    nombre: 'Base a menos uno equivalente a x·ln a',
    tendencia: 'x → 0',
    expresion: (
      <>
        a<sup>x</sup> − 1
      </>
    ),
    valor: <>~ x·ln a</>,
    condiciones: 'a > 0',
    busqueda:
      'a elevado a x menos uno equivalente a x por logaritmo de a infinitesimo 2^x-1 ~ x ln 2 base cualquiera',
    justificacion:
      'Escribiendo aˣ = e^(x·ln a) y aplicando la equivalencia de la exponencial con el argumento x·ln a, resulta aˣ − 1 ~ x·ln a. El factor ln a es el precio de trabajar con una base distinta de e.',
    ejemploTitulo: 'Calcular lím(x→0) (3^x − 1) / (2^x − 1)',
    ejemploPasos: [
      '3^x − 1 ~ x·ln 3; 2^x − 1 ~ x·ln 2',
      '≈ ln 3 / ln 2',
      'Resultado: ln 3 / ln 2 ≈ 1,585',
    ],
  },
  {
    id: 'equiv-ln',
    categoria: 'equivalencias',
    nombre: 'Logaritmo de (1 + x) equivalente a x',
    tendencia: 'x → 0',
    expresion: <>ln(1 + x)</>,
    valor: <>~ x</>,
    busqueda:
      'logaritmo de uno mas x equivalente a x infinitesimo ln(1+x) ~ x rentabilidad logaritmica aproximacion',
    justificacion:
      'De ln(1 + x)/x → 1. Es la base de la «rentabilidad logarítmica» en finanzas: para variaciones pequeñas, ln(1 + r) y r son casi idénticos, lo que permite sumar rentabilidades de periodos consecutivos en lugar de multiplicarlas.',
    ejemploTitulo: 'Calcular lím(x→0) ln(1 + sen x) / x',
    ejemploPasos: [
      'sen x ~ x, así que ln(1 + sen x) ~ sen x ~ x',
      '≈ x / x = 1',
      'Resultado: 1',
    ],
  },
  {
    id: 'equiv-ln-x',
    categoria: 'equivalencias',
    nombre: 'Logaritmo de x equivalente a x − 1',
    tendencia: 'x → 1',
    expresion: <>ln x</>,
    valor: <>~ x − 1</>,
    condiciones: 'x → 1 (no x → 0)',
    busqueda:
      'logaritmo de x equivalente a x menos uno cuando x tiende a uno infinitesimo desplazado ln x ~ x-1',
    justificacion:
      'Es la equivalencia anterior con el cambio t = x − 1 → 0: ln x = ln(1 + t) ~ t = x − 1. Resulta muy cómoda en los límites planteados en x = 1, donde el infinitésimo natural no es x sino x − 1.',
    ejemploTitulo: 'Calcular lím(x→1) ln x / (x² − 1)',
    ejemploPasos: [
      'ln x ~ x − 1',
      'x² − 1 = (x − 1)(x + 1)',
      '≈ (x − 1) / [(x − 1)(x + 1)] = 1/(x + 1) → 1/2',
      'Resultado: 0,5',
    ],
  },
  {
    id: 'equiv-binomio',
    categoria: 'equivalencias',
    nombre: 'Binomio (1 + x)^α − 1 equivalente a αx',
    tendencia: 'x → 0',
    expresion: (
      <>
        (1 + x)<sup>α</sup> − 1
      </>
    ),
    valor: <>~ αx</>,
    condiciones: 'α real cualquiera',
    busqueda:
      'binomio uno mas x elevado a alfa menos uno equivalente a alfa por x raiz cuadrada aproximacion primer orden',
    justificacion:
      'De ((1 + x)^α − 1)/x → α. Es la aproximación de primer orden más usada en ingeniería: √(1 + x) ≈ 1 + x/2, 1/(1 + x) ≈ 1 − x, ∛(1 + x) ≈ 1 + x/3. Con x = 0,02 el error de √(1 + x) ≈ 1,01 es de una diezmilésima.',
    ejemploTitulo: 'Calcular lím(x→0) (∛(1 + 6x) − 1) / sen x',
    ejemploPasos: [
      'Es α = 1/3 con argumento 6x: ∛(1 + 6x) − 1 ~ (1/3)(6x) = 2x',
      'sen x ~ x',
      '≈ 2x / x = 2',
      'Resultado: 2',
    ],
  },
  {
    id: 'equiv-senh',
    categoria: 'equivalencias',
    nombre: 'Seno hiperbólico equivalente a x',
    tendencia: 'x → 0',
    expresion: <>senh x</>,
    valor: <>~ x</>,
    busqueda:
      'seno hiperbolico equivalente a x infinitesimo senh sinh tangente hiperbolica tanh catenaria',
    justificacion:
      'Como senh x = (eˣ − e⁻ˣ)/2 y ambas exponenciales se aproximan por 1 ± x, la diferencia deja 2x/2 = x. Lo mismo vale para tgh x ~ x, mientras que cosh x − 1 ~ x²/2, exactamente igual que su análoga circular pero con el signo cambiado en el desarrollo.',
    ejemploTitulo: 'Calcular lím(x→0) senh(3x) / tg(2x)',
    ejemploPasos: [
      'senh(3x) ~ 3x; tg(2x) ~ 2x',
      '≈ 3x / 2x = 3/2',
      'Resultado: 1,5',
    ],
  },

  /* ── Límites en el infinito ───────────────────────────────── */
  {
    id: 'jerarquia',
    categoria: 'infinito',
    nombre: 'Jerarquía de infinitos',
    tendencia: 'x → ∞',
    expresion: (
      <>
        ln x ≪ x<sup>a</sup> ≪ b<sup>x</sup> ≪ x! ≪ x<sup>x</sup>
      </>
    ),
    valor: <>Gana el de la derecha</>,
    condiciones: 'a > 0, b > 1',
    tecnicaTitulo: 'Cómo se aplica',
    tecnica:
      'En un cociente entre dos infinitos de la jerarquía, el límite es 0 si el término dominante está en el denominador e ∞ si está en el numerador. No hace falta L’Hôpital.',
    busqueda:
      'jerarquia de infinitos ordenes de infinito logaritmo potencia exponencial factorial comparacion crecimiento',
    justificacion:
      'Cada escalón crece incomparablemente más deprisa que el anterior, y ni los coeficientes ni los exponentes cambian el orden: (ln x)¹⁰⁰ sigue perdiendo contra x^0,001, y x¹⁰⁰⁰ sigue perdiendo contra 1,001^x. La razón última es que derivando repetidamente el logaritmo se agota, la potencia se convierte en constante y la exponencial se reproduce a sí misma. El factorial solo tiene sentido en sucesiones.',
    ejemploTitulo: 'Calcular lím(x→∞) (x¹⁰ + 2^x) / (3^x + ln x)',
    ejemploPasos: [
      'Arriba domina 2^x; abajo domina 3^x.',
      'El cociente se comporta como 2^x / 3^x = (2/3)^x',
      'Como 2/3 < 1, esa potencia tiende a 0.',
      'Resultado: 0',
    ],
  },
  {
    id: 'log-vs-potencia',
    categoria: 'infinito',
    nombre: 'Logaritmo frente a potencia',
    tendencia: 'x → ∞',
    expresion: (
      <Frac
        n={
          <>
            (ln x)<sup>p</sup>
          </>
        }
        d={
          <>
            x<sup>a</sup>
          </>
        }
      />
    ),
    valor: <>0</>,
    condiciones: 'a > 0, p cualquiera',
    busqueda:
      'logaritmo elevado a p partido x elevado a a igual a cero crecimiento lento logaritmo pierde siempre',
    justificacion:
      'Por muy alta que sea la potencia del logaritmo y por muy pequeño que sea el exponente a, el logaritmo pierde. Se comprueba con el cambio x = e^t: el cociente pasa a t^p / e^(at), y una exponencial siempre supera a un polinomio. Es la razón de que un algoritmo O(log n) sea prácticamente gratis frente a uno O(n).',
    ejemploTitulo: 'Calcular lím(x→∞) (ln x)⁵ / √x',
    ejemploPasos: [
      'Es el caso p = 5, a = 1/2.',
      'Con x = e^t: t⁵ / e^(t/2) → 0',
      'Resultado: 0',
    ],
  },
  {
    id: 'potencia-vs-exponencial',
    categoria: 'infinito',
    nombre: 'Potencia frente a exponencial',
    tendencia: 'x → ∞',
    expresion: (
      <Frac
        n={
          <>
            x<sup>a</sup>
          </>
        }
        d={
          <>
            b<sup>x</sup>
          </>
        }
      />
    ),
    valor: <>0</>,
    condiciones: 'b > 1, a cualquiera',
    busqueda:
      'potencia partido exponencial igual a cero x elevado a n entre 2 elevado a x crecimiento exponencial gana',
    justificacion:
      'Aplicando L’Hôpital tantas veces como indique el exponente, el numerador acaba siendo una constante mientras el denominador sigue siendo b^x·(ln b)^k, que se dispara. Aunque a = 1000 y b = 1,0001, para valores suficientemente grandes de x la exponencial adelanta y ya no vuelve a ser alcanzada.',
    ejemploTitulo: 'Calcular lím(x→∞) x¹⁰⁰ / 2^x',
    ejemploPasos: [
      'La exponencial domina cualquier potencia.',
      'Aunque para x = 100 el numerador es astronómicamente mayor, el cruce llega antes de x ≈ 1.000.',
      'Resultado: 0',
    ],
  },
  {
    id: 'cociente-polinomios',
    categoria: 'infinito',
    nombre: 'Cociente de polinomios en el infinito',
    tendencia: 'x → ∞',
    expresion: <Frac n={<>P(x)</>} d={<>Q(x)</>} />,
    valor: <>0, a/b o ∞</>,
    tecnicaTitulo: 'Regla de los grados',
    tecnica:
      'Si grado(P) < grado(Q) el límite es 0; si son iguales, es el cociente de los coeficientes principales; si grado(P) > grado(Q), es ±∞ según el signo de esos coeficientes.',
    busqueda:
      'cociente de polinomios en el infinito grados coeficientes principales asintota horizontal racional',
    justificacion:
      'Al dividir arriba y abajo entre la mayor potencia presente, todos los términos secundarios se convierten en fracciones que tienden a 0 y solo sobreviven los principales. La regla también da la asíntota horizontal de una función racional, que existe justamente cuando el grado de arriba no supera al de abajo.',
    ejemploTitulo: 'Tres casos con el mismo denominador',
    ejemploPasos: [
      '(2x + 1)/(x² − 3) → 0 (grado menor arriba)',
      '(4x² + x)/(2x² − 3) → 4/2 = 2 (grados iguales)',
      '(x³ − 1)/(x² − 3) → +∞ (grado mayor arriba)',
    ],
  },
  {
    id: 'raiz-conjugado',
    categoria: 'infinito',
    nombre: 'Diferencia de raíces con el conjugado',
    tendencia: 'x → ∞',
    expresion: <>√(x² + bx) − x</>,
    valor: <Frac n={<>b</>} d={<>2</>} />,
    tecnicaTitulo: 'Técnica del conjugado',
    tecnica:
      'Se multiplica y se divide por √(x² + bx) + x. El numerador se convierte en una diferencia de cuadrados y la indeterminación ∞ − ∞ pasa a ser ∞/∞.',
    busqueda:
      'raiz cuadrada de x cuadrado mas bx menos x conjugado infinito menos infinito diferencia de cuadrados radicales',
    justificacion:
      'Tras multiplicar por el conjugado queda bx / [√(x² + bx) + x]. Dividiendo arriba y abajo entre x resulta b / [√(1 + b/x) + 1], que tiende a b/2. La intuición es que √(x² + bx) ≈ x + b/2 para x grande, porque (x + b/2)² = x² + bx + b²/4 y ese último término es despreciable.',
    ejemploTitulo: 'Calcular lím(x→∞) [√(x² + 6x) − x]',
    ejemploPasos: [
      'Multiplicamos por el conjugado: 6x / [√(x² + 6x) + x]',
      'Dividimos entre x: 6 / [√(1 + 6/x) + 1] → 6/2',
      'Resultado: 3',
    ],
  },
  {
    id: 'exponencial-base-menor-1',
    categoria: 'infinito',
    nombre: 'Exponencial de base menor que uno',
    tendencia: 'x → ∞',
    expresion: (
      <>
        a<sup>x</sup>
      </>
    ),
    valor: <>0 si 0 &lt; a &lt; 1</>,
    condiciones: 'a > 0; el límite es ∞ si a > 1 y 1 si a = 1',
    busqueda:
      'exponencial de base menor que uno tiende a cero decaimiento a elevado a x progresion geometrica razon',
    justificacion:
      'Escribiendo a = 1/c con c > 1, se tiene aˣ = 1/cˣ, y como cˣ se dispara el cociente se anula. Es el motivo de que una progresión geométrica de razón menor que 1 en valor absoluto converja, y de que la vida media de una sustancia radiactiva tenga sentido.',
    ejemploTitulo: 'Calcular lím(x→∞) (0,8)^x · x¹⁰',
    ejemploPasos: [
      '(0,8)^x = 1/(1,25)^x, una exponencial creciente en el denominador.',
      'La exponencial domina a la potencia x¹⁰.',
      'Resultado: 0',
    ],
  },
  {
    id: 'arctan-infinito',
    categoria: 'infinito',
    nombre: 'Arcotangente en el infinito',
    tendencia: 'x → ±∞',
    expresion: <>arctg x</>,
    valor: (
      <>
        ±<Frac n={<>π</>} d={<>2</>} />
      </>
    ),
    condiciones: '+π/2 por la derecha, −π/2 por la izquierda',
    busqueda:
      'arcotangente en el infinito pi medios asintota horizontal arctan limite lateral funcion acotada 1,5708',
    justificacion:
      'La tangente se dispara cuando el ángulo se acerca a ±π/2, así que su inversa se aplana en esos valores: la arcotangente tiene dos asíntotas horizontales, y = π/2 e y = −π/2. Por eso se usa como función de saturación cuando se necesita comprimir una magnitud sin límite en un intervalo acotado.',
    ejemploTitulo: 'Calcular lím(x→∞) x·arctg x / (x + 1)',
    ejemploPasos: [
      'x/(x + 1) → 1',
      'arctg x → π/2',
      'Resultado: π/2 ≈ 1,5708',
    ],
  },

  /* ── Sucesiones ───────────────────────────────────────────── */
  {
    id: 'raiz-n-de-n',
    categoria: 'sucesiones',
    nombre: 'Raíz n-ésima de n',
    tendencia: 'n → ∞',
    expresion: (
      <>
        <sup>n</sup>√n
      </>
    ),
    valor: <>1</>,
    busqueda:
      'raiz n-esima de n tiende a uno sucesion limite clasico n elevado a uno partido n infinito elevado a cero',
    justificacion:
      'Es una forma ∞⁰. Tomando logaritmos, ln(n^(1/n)) = (ln n)/n → 0, así que la sucesión tiende a e⁰ = 1. Sorprende porque n crece sin límite, pero la raíz de índice n «aplasta» ese crecimiento: para n = 1.000.000 el valor sigue siendo 1,0000138.',
    ejemploTitulo: 'Calcular lím(n→∞) ⁿ√(3n² + 5n)',
    ejemploPasos: [
      '3n² + 5n se comporta como 3n²',
      'ⁿ√(3n²) = ⁿ√3 · (ⁿ√n)² → 1 · 1² = 1',
      'Resultado: 1',
    ],
  },
  {
    id: 'raiz-n-de-a',
    categoria: 'sucesiones',
    nombre: 'Raíz n-ésima de una constante',
    tendencia: 'n → ∞',
    expresion: (
      <>
        <sup>n</sup>√a
      </>
    ),
    valor: <>1</>,
    condiciones: 'a > 0',
    busqueda:
      'raiz n-esima de a constante positiva tiende a uno sucesion a elevado a uno partido n exponente que se anula',
    justificacion:
      'a^(1/n) = e^((ln a)/n) y el exponente tiende a 0, así que el resultado es e⁰ = 1. Da igual lo grande o lo pequeña que sea la constante: la raíz de índice creciente acerca cualquier número positivo a 1. Con a = 1.000.000 y n = 100 ya se está en 1,148.',
    ejemploTitulo: 'Calcular lím(n→∞) ⁿ√(2ⁿ + 3ⁿ)',
    ejemploPasos: [
      'Sacamos factor común el término dominante: 3ⁿ·[(2/3)ⁿ + 1]',
      'ⁿ√(3ⁿ) = 3 y ⁿ√[(2/3)ⁿ + 1] → 1',
      'Resultado: 3 (en general, el mayor de las bases)',
    ],
  },
  {
    id: 'criterio-cociente',
    categoria: 'sucesiones',
    nombre: 'Criterio del cociente para raíces',
    tendencia: 'n → ∞',
    expresion: (
      <>
        <sup>n</sup>√a<sub>n</sub>
      </>
    ),
    valor: (
      <>
        lím <Frac n={<>a₍ₙ₊₁₎</>} d={<>aₙ</>} />
      </>
    ),
    condiciones: 'aₙ > 0 y el límite del cociente debe existir',
    tecnicaTitulo: 'Cuándo usarlo',
    tecnica:
      'Cuando aparece una raíz n-ésima de una expresión con factoriales o productos: el cociente aₙ₊₁/aₙ simplifica muchísimo y suele resolverse de un vistazo.',
    busqueda:
      'criterio del cociente raiz n-esima sucesiones factoriales simplificar an+1 entre an cauchy dalembert',
    justificacion:
      'Si el cociente de dos términos consecutivos converge, la raíz n-ésima converge al mismo valor (el recíproco no siempre es cierto: la raíz puede converger sin que lo haga el cociente). Es especialmente útil con factoriales, porque (n+1)!/n! = n + 1 se simplifica de inmediato mientras que la raíz de n! no tiene expresión sencilla.',
    ejemploTitulo: 'Calcular lím(n→∞) ⁿ√(n!/nⁿ)',
    ejemploPasos: [
      'aₙ = n!/nⁿ',
      'aₙ₊₁/aₙ = [(n+1)!/(n+1)^(n+1)] · [nⁿ/n!] = nⁿ/(n+1)ⁿ',
      '= 1/(1 + 1/n)ⁿ → 1/e',
      'Resultado: 1/e ≈ 0,3679',
    ],
  },
  {
    id: 'raiz-factorial',
    categoria: 'sucesiones',
    nombre: 'Raíz n-ésima de n! partida por n',
    tendencia: 'n → ∞',
    expresion: (
      <Frac
        n={
          <>
            <sup>n</sup>√(n!)
          </>
        }
        d={<>n</>}
      />
    ),
    valor: <Frac n={<>1</>} d={<>e</>} />,
    busqueda:
      'raiz n-esima de n factorial partida por n uno partido e stirling limite clasico sucesiones 0,3679',
    justificacion:
      'Sale del criterio del cociente aplicado a aₙ = n!/nⁿ, cuyo cociente consecutivo tiende a 1/e. También se deduce de la fórmula de Stirling, n! ≈ (n/e)ⁿ·√(2πn): al extraer la raíz n-ésima el factor de la raíz cuadrada se vuelve irrelevante y queda n/e, de donde el cociente entre n da 1/e.',
    ejemploTitulo: 'Comprobar el valor numéricamente',
    ejemploPasos: [
      'n = 10 → ¹⁰√(10!)/10 ≈ 0,4529',
      'n = 100 → ≈ 0,3799',
      'n = 1.000 → ≈ 0,3691',
      'Resultado: 1/e ≈ 0,36788',
    ],
  },
  {
    id: 'stolz',
    categoria: 'sucesiones',
    nombre: 'Criterio de Stolz-Cesàro',
    tendencia: 'n → ∞',
    expresion: (
      <Frac n={<>aₙ</>} d={<>bₙ</>} />
    ),
    valor: (
      <>
        lím <Frac n={<>a₍ₙ₊₁₎ − aₙ</>} d={<>b₍ₙ₊₁₎ − bₙ</>} />
      </>
    ),
    condiciones: 'bₙ monótona y divergente a +∞ (o ambas tendiendo a 0)',
    tecnicaTitulo: 'Cuándo usarlo',
    tecnica:
      'Es la versión discreta de la regla de L’Hôpital: sirve para cocientes de sucesiones con sumas acumuladas, y sustituye las derivadas por diferencias consecutivas.',
    busqueda:
      'criterio de stolz cesaro sucesiones lhopital discreto diferencias consecutivas sumas parciales media aritmetica',
    justificacion:
      'Cuando el denominador crece de forma monótona hacia infinito, el comportamiento global del cociente queda determinado por el de los incrementos, igual que en L’Hôpital lo determinan las derivadas. Es imbatible con sumas del tipo 1 + 2 + … + n en el numerador, porque la diferencia consecutiva elimina toda la suma de golpe.',
    ejemploTitulo: 'Calcular lím(n→∞) (1 + 2 + … + n) / n²',
    ejemploPasos: [
      'aₙ = 1 + 2 + … + n, bₙ = n² (monótona y divergente)',
      'aₙ₊₁ − aₙ = n + 1; bₙ₊₁ − bₙ = 2n + 1',
      '(n + 1)/(2n + 1) → 1/2',
      'Resultado: 1/2 (coincide con la fórmula n(n+1)/2 dividida entre n²)',
    ],
  },
  {
    id: 'media-aritmetica',
    categoria: 'sucesiones',
    nombre: 'Criterio de la media aritmética',
    tendencia: 'n → ∞',
    expresion: <Frac n={<>a₁ + a₂ + … + aₙ</>} d={<>n</>} />,
    valor: <>lím aₙ</>,
    condiciones: 'si aₙ converge (o diverge a ±∞)',
    busqueda:
      'criterio de la media aritmetica cesaro promedio de una sucesion converge al mismo limite medias',
    justificacion:
      'Es consecuencia directa de Stolz con bₙ = n. Intuitivamente, los primeros términos, por raros que sean, pesan cada vez menos en el promedio, así que la media acaba mandada por la cola de la sucesión. El recíproco es falso: la sucesión 1, 0, 1, 0, … tiene media convergente a 1/2 sin ser convergente ella misma.',
    ejemploTitulo: 'Calcular lím(n→∞) [1 + √2 + ∛3 + … + ⁿ√n] / n',
    ejemploPasos: [
      'El término general es aₙ = ⁿ√n, que tiende a 1.',
      'Por el criterio de la media, el promedio tiende al mismo valor.',
      'Resultado: 1',
    ],
  },
  {
    id: 'e-sucesion',
    categoria: 'sucesiones',
    nombre: 'El número e como sucesión',
    tendencia: 'n → ∞',
    expresion: (
      <>
        (1 + <Frac n={<>1</>} d={<>n</>} />)<sup>n</sup>
      </>
    ),
    valor: <>e</>,
    busqueda:
      'numero e como sucesion monotona creciente acotada convergencia teorema de weierstrass 1+1/n elevado a n',
    justificacion:
      'En su versión de sucesión, esta expresión es el ejemplo canónico de sucesión monótona creciente y acotada superiormente (por 3), lo que garantiza su convergencia por el teorema de la convergencia monótona sin necesidad de conocer el límite de antemano. El valor de ese límite es, por definición, el número e.',
    ejemploTitulo: 'Calcular lím(n→∞) [(n + 3)/n]^(2n)',
    ejemploPasos: [
      '(n + 3)/n = 1 + 3/n, así que es 1^∞.',
      'Exponente: 2n·(3/n) = 6',
      'Resultado: e⁶ ≈ 403,4',
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaLimitesNotablesPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega con un ejercicio delante escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return LIMITES.filter((entrada) => {
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
          <span aria-hidden="true">📄</span> Tabla de Límites Notables y Equivalencias
          Infinitesimales
        </h1>
        <p className={styles.subtitle}>
          Formulario de consulta rápida con {LIMITES.length} entradas: límites trigonométricos,
          exponenciales y logarítmicos, el número e, las siete indeterminaciones, equivalencias
          infinitesimales, jerarquía de infinitos y sucesiones. Cada una con la razón de por qué
          vale eso y un ejemplo resuelto.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de límites notables">
        <label className={styles.buscadorLabel} htmlFor="buscador-limites">
          Busca un límite por nombre, fórmula o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-limites"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="sen x, número e, indeterminación, ln, factorial…"
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
          Funciona con acentos o sin ellos y con sinónimos: <strong>seno</strong> encuentra sen x,{' '}
          <strong>lhopital</strong> encuentra las indeterminaciones y{' '}
          <strong>infinitesimo</strong> encuentra las equivalencias.
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
          {resultados.length} de {LIMITES.length} entradas
        </p>
      </section>

      {/* Tabla de límites */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna entrada que coincida con «{consulta}
            ». Prueba con otro término (por ejemplo, <strong>coseno</strong>,{' '}
            <strong>número e</strong>, <strong>factorial</strong> o{' '}
            <strong>indeterminación</strong>) o quita el filtro de categoría.
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
                    <span className={styles.tendenciaBadge}>{entrada.tendencia}</span>
                    {entrada.condiciones && (
                      <span className={styles.condicionesBadge}>{entrada.condiciones}</span>
                    )}
                  </span>
                  <span className={styles.filaFormulas}>
                    <span className={styles.par}>
                      <span className={styles.etq}>lím</span>
                      <span className={styles.expr}>{entrada.expresion}</span>
                    </span>
                    <span className={styles.flecha} aria-hidden="true">
                      =
                    </span>
                    <span className={styles.par}>
                      <span className={`${styles.expr} ${styles.exprValor}`}>{entrada.valor}</span>
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${entrada.id}`} className={styles.detalle}>
                    {entrada.aviso && (
                      <p className={styles.avisoBox}>
                        <span aria-hidden="true">⚠️</span> <strong>Atención:</strong>{' '}
                        {entrada.aviso}
                      </p>
                    )}

                    {entrada.tecnica && (
                      <div className={styles.tecnicaBox}>
                        <h3>{entrada.tecnicaTitulo ?? 'Técnica de resolución'}</h3>
                        <p>{entrada.tecnica}</p>
                      </div>
                    )}

                    <h3>Por qué vale eso</h3>
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
        title="Entender los límites, no solo copiarlos"
        subtitle="Qué es una indeterminación, cuándo valen las equivalencias y cómo elegir la técnica"
      >
        <section className={styles.guideSection}>
          <h2>Qué significa realmente «límite notable»</h2>
          <p>
            Un límite notable es un resultado que aparece una y otra vez y que conviene tener
            reconocido de un vistazo, porque casi todos los ejercicios de cálculo se reducen a
            transformar la expresión hasta que aparece uno de ellos. No son fórmulas mágicas: cada
            uno se demuestra a partir de la definición de límite, de un desarrollo de Taylor o de
            un argumento geométrico. Lo que se memoriza es el atajo, no el concepto.
          </p>
          <p>
            El punto de partida de casi toda la tabla es este, y de él salen las equivalencias
            trigonométricas:
          </p>
          <div className={styles.formulaBox}>lím<sub>x→0</sub> (sen x) / x = 1</div>
          <p>
            Una <strong>indeterminación</strong>, en cambio, no es un resultado: es la señal de que
            los datos que tienes no bastan para decidir. Cuando al sustituir sale 0/0 no significa
            que el límite no exista, sino que hay que mirar más de cerca a qué velocidad se anulan
            numerador y denominador. Por eso se dice que hay que «resolver» la indeterminación.
          </p>

          <h2>Las siete indeterminaciones y su técnica</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Forma</th>
                  <th>Técnica principal</th>
                  <th>Alternativa</th>
                  <th>Ejemplo típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>0/0</strong>
                  </td>
                  <td>Factorizar y simplificar</td>
                  <td>Equivalencias o L’Hôpital</td>
                  <td>(x² − 4)/(x − 2) en x = 2</td>
                </tr>
                <tr>
                  <td>
                    <strong>∞/∞</strong>
                  </td>
                  <td>Dividir entre el término dominante</td>
                  <td>Jerarquía de infinitos o L’Hôpital</td>
                  <td>(3x² + x)/(2x² − 1)</td>
                </tr>
                <tr>
                  <td>
                    <strong>0·∞</strong>
                  </td>
                  <td>Pasar un factor al denominador</td>
                  <td>Equivalencias</td>
                  <td>x·ln x en x → 0⁺</td>
                </tr>
                <tr>
                  <td>
                    <strong>∞ − ∞</strong>
                  </td>
                  <td>Conjugado o común denominador</td>
                  <td>Taylor si hay cancelación fina</td>
                  <td>√(x² + x) − x</td>
                </tr>
                <tr>
                  <td>
                    <strong>1^∞</strong>
                  </td>
                  <td>Fórmula e^[lím g·(f − 1)]</td>
                  <td>Tomar logaritmos</td>
                  <td>(1 + 1/x)^x</td>
                </tr>
                <tr>
                  <td>
                    <strong>0⁰</strong>
                  </td>
                  <td>Tomar logaritmos</td>
                  <td>Reescribir como e^(g·ln f)</td>
                  <td>xˣ en x → 0⁺</td>
                </tr>
                <tr>
                  <td>
                    <strong>∞⁰</strong>
                  </td>
                  <td>Tomar logaritmos</td>
                  <td>Jerarquía de infinitos</td>
                  <td>x^(1/x) en x → ∞</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Fíjate en que las tres últimas son la misma técnica: cualquier potencia con base y
            exponente variables se convierte en exponencial de un producto, y ese producto ya es
            una indeterminación de las cuatro primeras.
          </p>

          <h2>Para qué sirven los límites fuera del examen</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💰
              </span>
              <strong>Interés compuesto continuo</strong>
              <p>
                El número e nació de este problema: capitalizar un tipo k en infinitos periodos
                multiplica el capital por e^k. Es lo que hay detrás de la fórmula del crecimiento
                continuo en finanzas y demografía.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎯
              </span>
              <strong>Aproximación de ángulos pequeños</strong>
              <p>
                Sustituir sen θ por θ es lo que permite resolver el péndulo simple o calcular la
                desviación de un rayo de luz. Con θ = 0,1 radianes el error es de dos milésimas.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💻
              </span>
              <strong>Complejidad de algoritmos</strong>
              <p>
                La jerarquía de infinitos es exactamente lo que compara un algoritmo O(log n) con
                uno O(n²) o con uno exponencial. Decide qué programa sigue funcionando cuando los
                datos crecen.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📉
              </span>
              <strong>Asíntotas y continuidad</strong>
              <p>
                Los límites laterales y en el infinito dan las asíntotas de una curva y detectan
                las discontinuidades. Es la primera herramienta al estudiar una función completa.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué sen x / x vale 1 solo en radianes?</h4>
              <p>
                Porque el radián está definido de manera que la longitud del arco coincide con la
                medida del ángulo en la circunferencia de radio 1, y ese es el ingrediente de la
                comparación de áreas que demuestra el límite. Si se trabajase en grados, el arco
                mediría (π/180)·x y el límite valdría π/180 ≈ 0,01745. La misma advertencia se
                aplica a todas las derivadas trigonométricas.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> En cálculo, salvo aviso expreso, todos los
                ángulos están en radianes. Comprueba el modo de la calculadora antes del examen.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo puedo usar equivalencias infinitesimales?</h4>
              <p>
                Solo dentro de productos y cocientes. Si el infinitésimo es un sumando de una suma
                o de una resta, la sustitución puede destruir precisamente el término que decide el
                resultado. El caso de manual es (x − sen x)/x³: sustituir sen x por x da 0, cuando
                el valor correcto es 1/6.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Truco de seguridad: si ves un signo + o − entre
                dos infinitésimos, factoriza primero o recurre a Taylor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿L’Hôpital sirve siempre?</h4>
              <p>
                Solo se puede aplicar a las formas 0/0 e ∞/∞, y exige que exista el límite del
                cociente de derivadas. Aplicarlo a otras formas sin transformarlas antes es un
                error grave. Además, a veces entra en bucle: en x/√(x² + 1) las derivadas sucesivas
                devuelven la expresión de partida y no se avanza nunca.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Se derivan numerador y denominador por separado,
                nunca el cociente con la regla del cociente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre 0⁰ como límite y 0⁰ en álgebra?</h4>
              <p>
                Son cosas distintas. En álgebra y en programación se conviene que 0⁰ = 1 porque
                simplifica fórmulas como la del binomio, y por eso la calculadora responde 1. Como
                límite, en cambio, es indeterminado: el resultado depende de la velocidad relativa
                de base y exponente, y puede salir cualquier número no negativo.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Lo mismo pasa con 1^∞: 1 elevado a lo que sea es
                1, pero «algo que tiende a 1» elevado a «algo que tiende a ∞» no tiene por qué
                serlo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Hay que memorizar toda la tabla?</h4>
              <p>
                No con el mismo nivel de exigencia. Conviene tener automatizados sen x / x = 1,
                (eˣ − 1)/x = 1, ln(1 + x)/x = 1, (1 − cos x)/x² = 1/2 y la definición de e: con
                esos cinco y la jerarquía de infinitos se resuelve la gran mayoría de los
                ejercicios de un curso de cálculo I. El resto se consulta, y ese es el uso de esta
                página.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Comprueba antes del examen si tu institución
                permite formulario: cambia por completo la estrategia de estudio.
              </p>
            </div>
          </div>

          <h2>Cómo resolver cualquier límite sin bloquearte</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Sustituye primero</strong>
                <p>
                  Antes de nada, mete el valor al que tiende la variable. Muchos límites no son
                  indeterminados y se resuelven en un segundo. Solo si aparece una de las siete
                  formas hay trabajo por delante.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Identifica la indeterminación</strong>
                <p>
                  Escríbela explícitamente en el papel: 0/0, ∞/∞, 0·∞, ∞−∞, 1^∞, 0⁰ o ∞⁰. Cada una
                  tiene su técnica, y nombrarla te dice inmediatamente qué hacer a continuación.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Transforma antes de calcular</strong>
                <p>
                  Factoriza, simplifica, multiplica por el conjugado, reduce a común denominador o
                  toma logaritmos. El objetivo siempre es llegar a un producto o a un cociente
                  limpio, que es donde funcionan todas las herramientas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Aplica equivalencias solo si es lícito</strong>
                <p>
                  Comprueba que cada infinitésimo que vas a sustituir está multiplicando o
                  dividiendo, nunca sumando ni restando. Si hay una resta, factoriza primero o
                  recurre al desarrollo de Taylor con un término más.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con un valor cercano</strong>
                <p>
                  Sustituye un número próximo al punto (x = 0,001 o n = 10.000) y compara con tu
                  resultado. Si no se parecen hay un signo perdido o una equivalencia mal aplicada,
                  y este control lo detecta en treinta segundos.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas al calcular límites</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🏷️
              </span>
              <strong>Nombra la indeterminación</strong>
              <p>
                Escribir «es 1^∞» antes de operar evita aplicar la técnica equivocada y, en la
                mayoría de rúbricas, puntúa por sí solo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔬
              </span>
              <strong>Mira el orden del infinitésimo</strong>
              <p>
                sen x es de orden 1 y 1 − cos x de orden 2. Comparar órdenes suele resolver el
                límite antes de escribir una sola línea de álgebra.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ↔️
              </span>
              <strong>Comprueba los dos lados</strong>
              <p>
                En puntos donde la función cambia de comportamiento, calcula el límite por la
                izquierda y por la derecha: si no coinciden, el límite no existe.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🪜
              </span>
              <strong>Usa la jerarquía antes que L’Hôpital</strong>
              <p>
                En cocientes con logaritmos, potencias y exponenciales, la jerarquía da el
                resultado de un vistazo y sin cadenas de derivadas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📖
              </span>
              <strong>Ten a mano Taylor</strong>
              <p>
                Las equivalencias son el primer término de un desarrollo. Cuando fallan, el
                siguiente término del desarrollo es exactamente lo que necesitas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧮
              </span>
              <strong>Practica con la tabla cerrada</strong>
              <p>
                Consulta esta página para verificar, no para resolver. La velocidad en el examen
                viene de haber reconstruido tú mismo el razonamiento varias veces.
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
                <strong>Sustituir equivalencias dentro de una suma o una resta:</strong> es el error
                número uno. En (x − sen x)/x³ el atajo da 0 en lugar de 1/6, porque la resta cancela
                justo el término que la equivalencia conservaba.
              </li>
              <li>
                <strong>Aplicar L’Hôpital a formas que no son 0/0 ni ∞/∞:</strong> un producto 0·∞
                o una resta ∞−∞ hay que transformarlos en cociente antes de derivar nada.
              </li>
              <li>
                <strong>Derivar el cociente en lugar de derivar arriba y abajo:</strong> L’Hôpital
                dice f′/g′, no la derivada de f/g. Son cosas distintas y el resultado no se parece.
              </li>
              <li>
                <strong>Confundir 1^∞ con 1:</strong> la base tiende a 1, no vale 1. La diferencia
                infinitesimal amplificada por un exponente infinito produce una potencia de e.
              </li>
              <li>
                <strong>Trabajar en grados:</strong> sen x / x solo vale 1 con el ángulo en
                radianes; en grados el límite es π/180 y toda la cadena de equivalencias
                trigonométricas se rompe.
              </li>
              <li>
                <strong>Olvidar el 2 en 1 − cos x ~ x²/2:</strong> la equivalencia no es x², y el
                factor perdido multiplica o divide por 2 el resultado final.
              </li>
              <li>
                <strong>Dar por hecho que el límite existe:</strong> en puntos con comportamiento
                distinto a cada lado (como 1/x en x = 0) hay que calcular los dos límites laterales
                y decir explícitamente que no coinciden.
              </li>
              <li>
                <strong>Escribir ∞ − ∞ = 0:</strong> no es cero, es indeterminado. Puede dar
                cualquier valor finito, cero o infinito según la expresión concreta.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde el último tramo de la educación media (preparatoria en México,
            bachillerato en España, educación media superior o secundaria en otros países
            hispanohablantes) hasta los primeros cursos universitarios de cálculo en ingeniería,
            física, química o economía. Los límites trigonométricos, los exponenciales y el número
            e son los habituales en un examen de admisión universitaria; el criterio de Stolz, la
            fórmula de Stirling y los desarrollos de Taylor suelen aparecer ya en cálculo I.
          </p>
          <p>
            Si lo que necesitas es el paso siguiente del temario, la{' '}
            <a href="/tabla-derivadas/">tabla de derivadas</a> y la{' '}
            <a href="/tabla-integrales/">tabla de integrales</a> son las apps hermanas de esta, con
            la misma estructura de búsqueda: los límites notables son justamente los que aparecen
            al calcular derivadas desde la definición.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-limites-notables')} />

      <ShareCard appName="tabla-limites-notables" />

      <Footer appName="tabla-limites-notables" />
    </div>
  );
}

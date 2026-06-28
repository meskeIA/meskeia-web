// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Matemáticas interactivas: cálculo, estadística y probabilidad | Stemum',
  description:
    'Visualizadores de matemáticas: cálculo visual, derivadas e integrales, distribución normal, transformada de Fourier y el problema de Monty Hall.',
  alternates: { canonical: 'https://stemum.com/matematicas/' },
};

// Apps de la disciplina Matemáticas. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '📈',
    titulo: 'Cálculo visual',
    desc: 'Límites, la tangente como derivada y el área bajo la curva como integral de Riemann, con tres funciones y sliders.',
    slug: 'visualizador-calculo-visual',
  },
  {
    icon: '📐',
    titulo: 'La derivada como pendiente',
    desc: 'La derivada como pendiente de la tangente: 8 funciones, modo secante hacia el límite y la curva f′(x).',
    slug: 'simulador-derivada-pendiente',
  },
  {
    icon: '∫',
    titulo: 'La integral como área',
    desc: 'Suma de Riemann con 4 métodos (izquierda, derecha, punto medio, trapecio) y el error frente al valor exacto.',
    slug: 'simulador-integral-area',
  },
  {
    icon: '🔔',
    titulo: 'Distribución normal',
    desc: 'Curva de Gauss interactiva: ajusta μ y σ, calcula probabilidades, la regla 68-95-99,7 y la tipificación Z.',
    slug: 'simulador-distribucion-normal',
  },
  {
    icon: '〰️',
    titulo: 'Transformada de Fourier',
    desc: 'Síntesis de señales y su espectro, señales preconfiguradas y los epiciclos animados que las componen.',
    slug: 'visualizador-transformada-fourier',
  },
  {
    icon: '🚪',
    titulo: 'Problema de Monty Hall',
    desc: 'Modo manual y simulación de 10.000 partidas para ver por qué cambiar de puerta gana 2/3 de las veces.',
    slug: 'simulador-monty-hall',
  },
  {
    icon: '🎲',
    titulo: 'Teorema central del límite',
    desc: 'Simulación Monte Carlo con 5 distribuciones y tamaño muestral configurable comparado con la normal teórica.',
    slug: 'simulador-teorema-central-limite',
  },
  {
    icon: '📊',
    titulo: 'Intervalos de confianza',
    desc: '100 intervalos simulados y calculadora con nivel del 80-99 %, usando z o t de Student.',
    slug: 'simulador-intervalos-confianza',
  },
  {
    icon: '🧪',
    titulo: 'Test de hipótesis',
    desc: 'Curvas H₀ y H₁ superpuestas con regiones de rechazo y los valores α, β, p-valor y potencia.',
    slug: 'simulador-test-hipotesis',
  },
  {
    icon: '🎯',
    titulo: 'Teorema de Bayes',
    desc: 'Rectángulo proporcional y árbol de probabilidad con el cálculo del valor predictivo positivo y negativo.',
    slug: 'simulador-teorema-bayes',
  },
  {
    icon: '🎛️',
    titulo: 'Transformaciones de funciones',
    desc: 'Manipula a, b, c y d en f(x)=a·g(b·(x−c))+d con un canvas dual de función base y transformada.',
    slug: 'simulador-funciones-transformaciones',
  },
  {
    icon: '🧊',
    titulo: 'Volúmenes de cuerpos',
    desc: 'Esfera, cubo, cilindro, cono y pirámide en SVG isométrico con sliders y la fórmula en tiempo real.',
    slug: 'visualizador-volumenes',
  },
  {
    icon: '📡',
    titulo: 'Trigonometría',
    desc: 'Círculo unitario animado, gráficas con sliders, ángulos notables e identidades trigonométricas.',
    slug: 'visualizador-trigonometria',
  },
  {
    icon: '🥚',
    titulo: 'Geometría analítica',
    desc: 'Cónicas (elipse, parábola, hipérbola y circunferencia) con sus ecuaciones canónicas y polares.',
    slug: 'visualizador-geometria-analitica',
  },
  {
    icon: '➡️',
    titulo: 'Álgebra lineal',
    desc: 'Vectores 2D, transformaciones lineales, el determinante como área y los autovalores.',
    slug: 'visualizador-algebra-lineal',
  },
  {
    icon: '🦊',
    titulo: 'Ecuaciones diferenciales',
    desc: 'Campo de direcciones para Lotka-Volterra, el enfriamiento de Newton y el circuito RC.',
    slug: 'visualizador-ecuaciones-diferenciales',
  },
  {
    icon: '🌀',
    titulo: 'Números complejos',
    desc: 'Plano de Argand con operaciones geométricas, la forma polar y la identidad de Euler.',
    slug: 'visualizador-numeros-complejos',
  },
  {
    icon: '🥯',
    titulo: 'Topología',
    desc: '5 superficies con selector de género, nudos topológicos y la característica de Euler.',
    slug: 'visualizador-topologia',
  },
  {
    icon: '🔢',
    titulo: 'Combinatoria',
    desc: 'Permutaciones, triángulo de Pascal, binomio de Newton y el principio de multiplicación.',
    slug: 'visualizador-combinatoria',
  },
  {
    icon: '♾️',
    titulo: 'Series y convergencia',
    desc: 'Series de Taylor y Maclaurin, criterios de convergencia y aproximaciones de π.',
    slug: 'visualizador-series-convergencia',
  },
  {
    icon: '🔺',
    titulo: 'Geometría de fractales',
    desc: 'Sliders de iteración generan Sierpinski, Koch, alfombra y Hilbert en SVG, con sus conteos de elementos, perímetro y dimensión fractal.',
    slug: 'visualizador-geometria-fractales',
  },
  {
    icon: '🔢',
    titulo: 'Números primos',
    desc: 'Criba de Eratóstenes animada paso a paso o automática hasta 500, más espiral de Ulam, primos gemelos y reto de factorización RSA.',
    slug: 'visualizador-numeros-primos',
  },
  {
    icon: '📊',
    titulo: 'Estadística cotidiana',
    desc: 'Slider de prevalencia para Bayes, paradoja de Simpson conmutable y lanzador de hasta 1.000 monedas con curva en vivo hacia el 50%.',
    slug: 'visualizador-estadistica-cotidiana',
  },
  {
    icon: '📉',
    titulo: 'Estadística inferencial',
    desc: 'Sliders mueven el estadístico z, α y el efecto sobre curvas normales, y simulan 100 intervalos de confianza para ver p-valor y potencia.',
    slug: 'visualizador-estadistica-inferencial',
  },
  {
    icon: '📐',
    titulo: 'Círculo unitario',
    desc: 'Gira el ángulo θ con slider o animación sobre un canvas que proyecta seno, coseno y tangente, con valores y cuadrante en tiempo real.',
    slug: 'simulador-trigonometria-circulo-unitario',
  },
  {
    icon: '✏️',
    titulo: 'Curvas de Bézier',
    desc: 'Arrastra los puntos de control de una curva cuadrática o cúbica y anima el parámetro t para ver la construcción de De Casteljau paso a paso.',
    slug: 'visualizador-curvas-bezier',
  },
  {
    icon: '📈',
    titulo: 'Funciones de easing',
    desc: 'Visualiza las curvas de interpolación (ease-in/out, back, elastic, bounce) y una caja que se mueve con cada una. La matemática de las animaciones.',
    slug: 'visualizador-funciones-easing',
  },
];

export default function StemumMatematicas() {
  return (
    <>
      <AnalyticsTracker appName="stemum-matematicas" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-matematicas">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-matematicas" className={styles.ejeTitle}>
            <span aria-hidden="true">📐</span> Matemáticas
          </h1>
          <p className={styles.ejeIntro}>
            Cálculo, estadística, análisis y probabilidad para manipular en tiempo real.
            Mueve un control y observa cómo responde el sistema.
          </p>
          <div className={styles.grid}>
            {APPS.map((a) => (
              <Link key={a.slug} href={`/${a.slug}`} className={styles.appCard}>
                <span className={styles.cardIcon} aria-hidden="true">{a.icon}</span>
                <h2 className={styles.cardTitulo}>{a.titulo}</h2>
                <p className={styles.cardDesc}>{a.desc}</p>
                <span className={styles.appCardCta}>Abrir →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

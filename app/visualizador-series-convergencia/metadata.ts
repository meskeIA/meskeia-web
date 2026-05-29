import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Series y Convergencia: Taylor, Leibniz, Nilakantha | meskeIA',
  description: 'Explora series de Taylor/Maclaurin con slider interactivo, criterios de convergencia animados y cálculo de π con series de Leibniz, Nilakantha y Wallis.',
  keywords: [
    'series de Taylor',
    'series de Maclaurin',
    'convergencia de series',
    'criterio de la razón',
    'serie de Leibniz',
    'serie de Nilakantha',
    'número pi series',
    'aproximación polinómica',
    'radio de convergencia',
    'sumas parciales',
    'visualizador matemáticas',
    'análisis matemático',
  ],
  openGraph: {
    title: 'Visualizador de Series y Convergencia',
    description: 'Series de Taylor animadas con slider de términos, criterios de convergencia y cálculo de π con tres series clásicas.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Series y Convergencia',
  description: 'Explora series de Taylor/Maclaurin con slider interactivo, criterios de convergencia animados y cálculo de π con series de Leibniz, Nilakantha y Wallis.',
  url: 'https://meskeia.com/visualizador-series-convergencia/',
  features: [
    'Series de Taylor y Maclaurin con slider de términos (N=1–15)',
    'Gráfica función real vs aproximación polinómica en SVG',
    'Error residual con barra de progreso',
    'Criterios de convergencia: razón, comparación, alternado',
    'Sumas parciales animadas hasta N=50',
    'Cálculo de π con series de Leibniz, Nilakantha y Wallis',
    'Tabla comparativa de decimales correctos por número de términos',
  ],
  category: 'EducationalApplication',
  keywords: ['series Taylor', 'convergencia', 'pi series', 'Maclaurin', 'Leibniz', 'Nilakantha'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una serie de Taylor y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una serie de Taylor aproxima cualquier función analítica como una suma infinita de potencias: f(x) = f(a) + f\'(a)(x−a) + f\'\'(a)(x−a)²/2! + … Cuantos más términos se incluyen, más exacta es la aproximación cerca del punto a. Se usa en calculadoras, simulaciones físicas, análisis numérico y en la derivación de fórmulas aproximadas en ingeniería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se sabe si una serie converge o diverge?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen varios criterios: el criterio de la razón compara el cociente |a_{n+1}/a_n|; si el límite es menor que 1 la serie converge, si es mayor diverge. El criterio de comparación contrasta la serie con otra cuya convergencia ya se conoce. Para series alternadas (términos de signo variable) se usa el criterio de Leibniz: si los términos decrecen a 0, la serie converge.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos términos necesita la serie de Leibniz para calcular π con 10 decimales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La serie de Leibniz (π/4 = 1 − 1/3 + 1/5 − …) converge muy lentamente: necesita aproximadamente 5.000 millones de términos para obtener 10 decimales correctos. En cambio, la serie de Nilakantha (π = 3 + 4/(2·3·4) − 4/(4·5·6) + …) converge mucho más rápido y alcanza 10 decimales con unos pocos miles de términos. Los algoritmos modernos usan métodos como la fórmula de Machin o la de Chudnovsky.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el radio de convergencia de una serie de potencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El radio de convergencia R es la distancia máxima desde el centro a en la que la serie de potencias Σ cₙ(x−a)ⁿ converge. Para |x−a| < R la serie converge absolutamente; para |x−a| > R diverge. Se calcula con la fórmula de Cauchy-Hadamard: 1/R = lim sup |cₙ|^(1/n). Por ejemplo, la serie de Taylor de eˣ tiene R = ∞, mientras que 1/(1−x) tiene R = 1.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de series?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está dirigido a estudiantes de cálculo de segundo ciclo o análisis matemático que necesitan construir intuición sobre la convergencia. Es especialmente útil para entender por qué sen(x) ≈ x para ángulos pequeños (serie de Taylor truncada) o por qué las calculadoras pueden evaluar funciones trascendentes con precisión arbitraria usando polinomios.',
      },
    },
  ],
};

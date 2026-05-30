import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los Números Primos - Criba de Eratóstenes y Espiral de Ulam | meskeIA',
  description: 'Visualiza la criba de Eratóstenes animada, la espiral de Ulam, primos gemelos y por qué la criptografía RSA depende de los primos. Explicador visual interactivo.',
  keywords: 'números primos, criba eratóstenes, espiral ulam, primos gemelos, RSA, criptografía, mersenne, riemann, matemáticas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Números Primos - Explicador Visual',
    description: 'Criba de Eratóstenes animada, espiral de Ulam y criptografía RSA. Tu tarjeta de crédito depende de los primos.',
    url: 'https://meskeia.com/visualizador-numeros-primos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Los Números Primos - Explicador Visual',
    description: 'Criba animada, espiral de Ulam y por qué RSA depende de los primos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Números Primos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los Números Primos',
  description: 'Explicador visual de números primos: criba de Eratóstenes animada paso a paso, espiral de Ulam con patrones diagonales, primos gemelos, criptografía RSA y récords mundiales. Interactivo y educativo.',
  url: 'https://meskeia.com/visualizador-numeros-primos/',
  features: [
    'Criba de Eratóstenes animada paso a paso con velocidad ajustable',
    'Espiral de Ulam con patrones diagonales de primos',
    'Explicación visual de criptografía RSA',
    'Primos gemelos, de Mersenne y récords mundiales',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un número primo y por qué el 1 no lo es?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un número primo es un entero mayor que 1 que solo es divisible entre 1 y él mismo. El 1 queda excluido por definición para preservar el teorema fundamental de la aritmética, que garantiza que cada número mayor que 1 tiene una descomposición única en factores primos. Si el 1 fuera primo, esa unicidad se rompería porque podríamos multiplicarlo cualquier número de veces. Los primeros primos son 2, 3, 5, 7, 11, 13...',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la criba de Eratóstenes para encontrar números primos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La criba parte de una lista de números desde 2 hasta el límite elegido. Se toma el primer número no marcado (inicialmente el 2), se declara primo y se tachan todos sus múltiplos. Luego se pasa al siguiente sin tachar (el 3) y se repite el proceso. Es suficiente tachar múltiplos hasta la raíz cuadrada del límite, porque cualquier compuesto mayor ya habrá sido tachado antes. El algoritmo, descrito en el siglo III a.C., sigue siendo uno de los más eficientes para encontrar todos los primos hasta un tope dado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la espiral de Ulam y qué patrón muestran los primos en ella?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La espiral de Ulam se construye escribiendo los enteros positivos en espiral sobre una cuadrícula y coloreando solo los primos. Stanislaw Ulam la descubrió en 1963 mientras garabateaba durante una conferencia. Lo sorprendente es que los primos se alinean en diagonales mucho más densas de lo que cabría esperar al azar, sugiriendo estructura oculta en su distribución. Este patrón diagonal no está completamente explicado y sigue siendo un tema de investigación en teoría de números.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la criptografía RSA depende de los números primos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RSA cifra la información mediante el producto de dos primos enormes (de cientos de dígitos). Multiplicar esos dos primos para obtener el número público es instantáneo, pero factorizarlo de vuelta para obtener los primos originales requiere, con los mejores algoritmos conocidos, más tiempo del que llevaría el universo. Así, quien cifra con tu clave pública (el producto) no puede descifrar sin conocer los dos primos originales que son tu clave privada. Cada vez que usas HTTPS en un navegador, este principio protege tu conexión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos números primos existen y cuál es el mayor conocido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay infinitos números primos; Euclides demostró esto hace más de 2.300 años con un argumento por contradicción. Sin embargo, se vuelven progresivamente más escasos: el teorema de los números primos establece que la densidad de primos cerca de N es aproximadamente 1/ln(N). El primo más grande conocido a 2024 es 2^136.279.841 − 1, un número de Mersenne con más de 41 millones de dígitos, descubierto por el proyecto distribuido GIMPS.',
      },
    },
  ],
};

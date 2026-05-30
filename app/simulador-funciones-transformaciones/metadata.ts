import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Transformaciones de Funciones — Gráficas Interactivas | meskeIA',
  description: 'Explora cómo a·g(b·(x−c))+d transforma cualquier función. Mueve amplitud, frecuencia y desfase en tiempo real. Ideal para secundaria, Bachillerato y cualquier estudiante de álgebra.',
  keywords: 'funciones, transformaciones de funciones, traslación, amplitud, frecuencia, desfase, Bachillerato, álgebra, gráficas, seno, coseno, cuadrática, valor absoluto, raíz cuadrada',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-funciones-transformaciones/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Transformaciones de Funciones | meskeIA',
    description: 'Visualiza en tiempo real cómo a, b, c y d transforman una función base. Sin registro, gratis.',
    url: 'https://meskeia.com/simulador-funciones-transformaciones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Transformaciones de Funciones | meskeIA',
    description: 'Ajusta amplitud, frecuencia y desfase para ver cómo se transforma cualquier función.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Transformaciones de Funciones',
  description: 'Simulador interactivo para explorar las transformaciones de funciones matemáticas mediante la fórmula f(x) = a·g(b·(x−c))+d. Selecciona una función base (seno, coseno, cuadrática, valor absoluto, raíz cuadrada) y ajusta los parámetros a, b, c y d con sliders para ver el efecto en la gráfica en tiempo real.',
  url: 'https://meskeia.com/simulador-funciones-transformaciones/',
  category: 'EducationalApplication',
  features: [
    'Selección de función base: sin, cos, x², |x|, √x',
    'Control interactivo de amplitud (a), frecuencia (b), desfase horizontal (c) y vertical (d)',
    'Visualización simultánea de la función original y la transformada',
    'Etiqueta dinámica con la ecuación completa en el canvas',
    'Panel descriptivo con el efecto de cada parámetro en lenguaje natural',
    'Detección automática de modo oscuro/claro',
    'Escala Retina/HiDPI para pantallas de alta resolución',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: ['funciones', 'transformaciones', 'traslación', 'amplitud', 'frecuencia', 'Bachillerato', 'álgebra', 'gráficas'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las transformaciones de funciones matemáticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las transformaciones de funciones son operaciones que modifican la forma o posición de la gráfica de una función base. La fórmula general es f(x) = a·g(b·(x−c))+d, donde: a controla la amplitud (estiramiento vertical o reflexión), b la frecuencia o compresión horizontal, c el desplazamiento horizontal y d el desplazamiento vertical. Entender estas transformaciones permite analizar y dibujar rápidamente cualquier familia de funciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el parámetro "a" a la gráfica de una función?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El parámetro a multiplica verticalmente todos los valores de la función. Si |a| > 1 la gráfica se estira verticalmente (mayor amplitud); si 0 < |a| < 1 se comprime; si a < 0 se produce una reflexión respecto al eje X (la gráfica se voltea). Por ejemplo, en y = 2·sen(x) la amplitud pasa de 1 a 2, mientras que en y = −sen(x) la onda queda invertida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre traslación horizontal y vertical en una función?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La traslación vertical suma una constante d a todos los valores: f(x) = g(x) + d mueve la gráfica d unidades hacia arriba (d > 0) o hacia abajo (d < 0). La traslación horizontal reemplaza x por (x−c): f(x) = g(x−c) desplaza la gráfica c unidades a la derecha (c > 0) o a la izquierda (c < 0). Un error frecuente es invertir el signo en la traslación horizontal: g(x−2) se mueve a la DERECHA dos unidades, no a la izquierda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este simulador de transformaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de secundaria, preparatoria y Bachillerato que estudian álgebra y precálculo, así como para cualquier persona que quiera reforzar la comprensión gráfica de las funciones. También puede usarlo el profesorado para explicar conceptos en clase de forma visual. No requiere instalación ni registro: funciona directamente en el navegador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué funciones base se pueden explorar en el simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador incluye cinco funciones base: seno (periódica, ideal para ver amplitud y frecuencia), coseno (similar al seno con desfase de 90°), cuadrática x² (parábola, buena para traslaciones), valor absoluto |x| (en V, ilustra reflexiones) y raíz cuadrada √x (rama creciente, muestra estiramientos y compresiones). Cada una resalta distintas propiedades de los cuatro parámetros a, b, c y d.',
      },
    },
  ],
};

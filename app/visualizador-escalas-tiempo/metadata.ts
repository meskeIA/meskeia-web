import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánto Tarda el Mundo - Escalas Temporales Fascinantes | meskeIA',
  description: 'Visualiza escalas de tiempo que desafían la intuición: desde un parpadeo hasta la edad del universo. 20+ fenómenos ordenados en una línea temporal interactiva.',
  keywords: 'escalas temporales, cuánto tarda, perspectiva tiempo, degradación plástico, edad universo, tiempo geológico, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuánto Tarda el Mundo',
    description: 'Escalas de tiempo fascinantes: de un parpadeo a la edad del universo.',
    url: 'https://meskeia.com/visualizador-escalas-tiempo/',
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
    title: 'Cuánto Tarda el Mundo',
    description: 'Visualiza escalas temporales que desafían tu intuición.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Escalas Tiempo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánto Tarda el Mundo',
  description: 'Explicador visual de escalas temporales: desde milisegundos hasta miles de millones de años. Fenómenos naturales, humanos y cósmicos ordenados en una visualización interactiva.',
  url: 'https://meskeia.com/visualizador-escalas-tiempo/',
  features: [
    '20+ fenómenos temporales de diferentes escalas',
    'Categorías: instantes, humano, naturaleza, geológico, cósmico',
    'Barras logarítmicas proporcionales',
    'Comparaciones sorprendentes entre fenómenos',
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
      name: '¿Cuánto tiempo tarda en degradarse una bolsa de plástico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una bolsa de plástico convencional tarda entre 400 y 1.000 años en descomponerse en el medio ambiente. Para entender la escala, eso equivale a casi el doble del tiempo que ha pasado desde la Edad Media hasta hoy. La escala logarítmica de este visualizador permite comparar este tiempo con otros fenómenos como el latido de un corazón (0,8 segundos) o la formación del Sistema Solar (4.500 millones de años).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es difícil entender intuitivamente los tiempos muy largos o muy cortos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cerebro humano evolucionó para gestionar escalas de tiempo relacionadas con la vida cotidiana: horas, días, años. Los valores extremos (nanosegundos o millones de años) superan nuestra experiencia directa y resultan abstractos. Las representaciones visuales logarítmicas permiten comparar fenómenos de escalas radicalmente distintas en un mismo espacio, haciendo comprensibles las diferencias de magnitud.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva el Homo sapiens en la Tierra comparado con la edad del universo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El universo tiene aproximadamente 13.800 millones de años y el Homo sapiens surgió hace unos 300.000 años. Si comprimiéramos la historia del universo en un año calendario, los humanos aparecerían en los últimos 12 minutos del 31 de diciembre. Esta herramienta de escalas temporales sitúa visualmente este tipo de comparaciones junto a fenómenos cotidianos y geológicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una escala logarítmica y por qué se usa para representar tiempos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una escala logarítmica aumenta en potencias de 10 en lugar de en valores iguales. En una escala lineal, comparar un segundo con un millón de años requeriría un gráfico imposiblemente largo. Con escala logarítmica, cada unidad de espacio representa un orden de magnitud mayor, permitiendo mostrar desde milisegundos hasta miles de millones de años en el mismo visual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en formarse una perla natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una perla natural tarda entre 2 y 7 años en formarse dentro de un molusco, dependiendo del tamaño y las condiciones del agua. Las perlas de cultivo, que se producen con un núcleo insertado artificialmente, pueden estar listas en 6 meses. El visualizador de escalas temporales incluye este tipo de procesos naturales junto a fenómenos geológicos y cósmicos para ofrecer perspectiva comparada.',
      },
    },
  ],
};

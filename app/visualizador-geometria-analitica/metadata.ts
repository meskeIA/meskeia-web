import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geometría Analítica: Cónicas Interactivas — meskeIA',
  description: 'Explora las cónicas (circunferencia, elipse, parábola, hipérbola) con gráficas SVG interactivas. Sliders en tiempo real, ecuaciones canónicas, focos, vértices y coordenadas polares.',
  keywords: 'geometría analítica, cónicas, circunferencia, elipse, parábola, hipérbola, ecuaciones canónicas, focos, coordenadas polares, secciones cónicas, matemáticas interactivas, visualizador matemático, preparatoria, secundaria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Geometría Analítica: Cónicas Interactivas',
    description: 'Circunferencia, elipse, parábola e hipérbola explicadas visualmente con sliders y ecuaciones en tiempo real.',
    url: 'https://meskeia.com/visualizador-geometria-analitica/',
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
    title: 'Geometría Analítica — Cónicas Interactivas',
    description: 'Explora las 4 cónicas con gráficas SVG interactivas, sliders y ecuaciones canónicas en tiempo real.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Geometría Analítica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Geometría Analítica: Cónicas Interactivas',
  description: 'Visualizador interactivo de cónicas (circunferencia, elipse, parábola, hipérbola) con sliders, ecuaciones canónicas en tiempo real, focos, vértices, directrices y coordenadas polares.',
  url: 'https://meskeia.com/visualizador-geometria-analitica/',
  category: 'EducationalApplication',
  features: [
    'Visualización SVG interactiva de las 4 cónicas',
    'Sliders para parámetros en tiempo real',
    'Ecuaciones canónicas actualizadas al instante',
    'Focos, vértices y puntos notables con coordenadas',
    'Asíntotas de la hipérbola en líneas punteadas',
    'Tab de coordenadas polares: rosa de pétalos, espiral y cardioide',
    'Gratuito y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las cónicas en geometría analítica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cónicas son las curvas que resultan de cortar un cono doble con un plano: circunferencia, elipse, parábola e hipérbola. Se llaman así porque su forma depende del ángulo del corte. Cada una tiene una ecuación canónica que relaciona sus parámetros fundamentales (radio, semiejes, focal, vértice).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una elipse y una hipérbola?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una elipse, la suma de las distancias a los dos focos es constante, lo que da lugar a una curva cerrada. En una hipérbola, la diferencia de esas distancias es constante y la curva se abre en dos ramas. La ecuación canónica de la elipse suma los cocientes (x²/a² + y²/b² = 1), mientras que la de la hipérbola los resta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer los focos de una cónica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los focos tienen aplicaciones físicas y de ingeniería muy concretas: las antenas parabólicas concentran señales en el foco de la parábola, los espejos elípticos reflejan luz de un foco al otro, y las trayectorias de los planetas son elipses con el Sol en uno de sus focos (primera ley de Kepler). Conocer la posición de los focos es clave para diseñar y calcular estas estructuras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa el visualizador de cónicas interactivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Elige la cónica que quieres explorar (circunferencia, elipse, parábola o hipérbola) y mueve los sliders para ajustar sus parámetros. La gráfica SVG se actualiza en tiempo real mostrando focos, vértices, directrices y la ecuación canónica resultante. También puedes cambiar al modo de coordenadas polares para ver curvas como la rosa de pétalos o la espiral.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las cónicas aparecen en los exámenes de admisión universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, las secciones cónicas forman parte del temario de matemáticas del último curso de educación media (bachillerato o preparatoria) y son materia habitual en los exámenes de admisión a la universidad y en la selectividad o EBAU en muchos países hispanohablantes. Los ejercicios suelen pedir identificar el tipo de cónica a partir de su ecuación, calcular focos y vértices, o trazar la gráfica con sus elementos.',
      },
    },
  ],
};

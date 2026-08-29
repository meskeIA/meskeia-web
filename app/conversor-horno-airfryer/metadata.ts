import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de horno a freidora de aire (air fryer) | meskeIA',
  description:
    'Adapta cualquier receta de horno a la freidora de aire: baja la temperatura unos 20 °C y reduce el tiempo. Calcula la temperatura y el tiempo exactos, con una tabla de alimentos habituales. Gratis y en español.',
  keywords:
    'horno a freidora de aire, convertir receta air fryer, temperatura freidora de aire, tiempo air fryer, equivalencia horno airfryer, freidora sin aceite tiempos, air fryer temperatura tiempo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de horno a freidora de aire',
    description:
      'Pasa cualquier receta de horno a air fryer: temperatura y tiempo ajustados, con tabla de alimentos.',
    url: 'https://meskeia.com/conversor-horno-airfryer',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de horno a freidora de aire',
    description: 'Temperatura y tiempo de air fryer a partir de los del horno convencional.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: { 'application-name': 'Horno a freidora de aire meskeIA' },
  alternates: { canonical: 'https://meskeia.com/conversor-horno-airfryer/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de horno a freidora de aire',
  description:
    'Convierte la temperatura y el tiempo de una receta de horno convencional a freidora de aire (air fryer), bajando la temperatura unos 20 °C y reduciendo el tiempo en torno a un 20%, e incluye una tabla de temperaturas y tiempos para alimentos habituales.',
  url: 'https://meskeia.com/conversor-horno-airfryer/',
  features: [
    'Convierte temperatura y tiempo de horno a air fryer',
    'Tabla de alimentos habituales con sus tiempos',
    'Temperatura resultante en °C y °F',
    'Consejos para usar la freidora de aire',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo paso una receta de horno a freidora de aire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla práctica es bajar la temperatura unos 20 °C y reducir el tiempo alrededor de un 20% respecto al horno convencional. Por ejemplo, una receta de horno a 200 °C y 25 minutos pasa a unos 180 °C y 20 minutos en air fryer. Conviene vigilar y sacudir o dar la vuelta a media cocción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la freidora de aire cocina más rápido que el horno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque es un pequeño horno de convección: un ventilador mueve el aire caliente alrededor del alimento en un espacio reducido, lo que transmite el calor de forma más eficiente. Por eso necesita menos temperatura y menos tiempo, y deja los alimentos crujientes con poco o nada de aceite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay que precalentar la freidora de aire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En muchos modelos no es imprescindible porque se calienta muy rápido, pero precalentar 2 o 3 minutos ayuda a que los alimentos queden más crujientes desde el principio, sobre todo rebozados y congelados. Sigue las indicaciones de tu aparato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo cocinar cualquier cosa en la freidora de aire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Va muy bien con alimentos que buscan quedar crujientes (patatas, pollo, croquetas, verduras, pescado). No sirve para masas líquidas sin molde ni para grandes cantidades de líquido. Tampoco conviene llenar la cesta en exceso: el aire debe circular para que todo se haga por igual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La freidora de aire necesita aceite?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Muy poco o ninguno. Una fina capa de aceite (en espray o con un pincel) ayuda a dorar y a que queden crujientes, pero la freidora de aire cocina sin sumergir en aceite, por lo que el resultado es bastante más ligero que la fritura tradicional.',
      },
    },
  ],
};

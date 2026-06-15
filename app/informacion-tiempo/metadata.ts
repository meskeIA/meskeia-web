import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Información del Tiempo - Pronóstico Meteorológico | meskeIA',
  description: 'Consulta el tiempo actual y pronóstico de 5 días para cualquier ciudad del mundo. Temperatura, humedad, viento y más. Gratis y sin registro.',
  keywords: 'tiempo, clima, meteorologia, pronostico, temperatura, humedad, viento, lluvia, tiempo hoy, prevision',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Información del Tiempo - Pronóstico Meteorológico | meskeIA',
    description: 'Consulta el tiempo actual y pronóstico para cualquier ciudad del mundo.',
    url: 'https://meskeia.com/informacion-tiempo/',
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
    title: 'Información del Tiempo - meskeIA',
    description: 'Pronóstico meteorológico para cualquier ciudad del mundo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Información del Tiempo - Pronóstico Meteorológico",
  description: "Consulta el tiempo actual y pronóstico de 5 días para cualquier ciudad del mundo. Temperatura, humedad, viento y más. Gratis y sin registro.",
  url: 'https://meskeia.com/informacion-tiempo/',
  category: 'UtilityApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos días de pronóstico meteorológico puedo consultar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta ofrece el tiempo actual más un pronóstico de 5 días para cualquier ciudad del mundo. Puedes ver la temperatura máxima y mínima de cada día, la probabilidad de lluvia, la humedad relativa y la velocidad del viento. Los datos se actualizan periódicamente a partir de fuentes meteorológicas en tiempo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo de fiable es un pronóstico meteorológico de 5 días?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modelos meteorológicos actuales tienen una fiabilidad alta para los primeros 2-3 días (superior al 90%) y aceptable para el cuarto y quinto día (entre el 70-80%). A partir del quinto día la incertidumbre aumenta considerablemente. Para viajes o eventos importantes, conviene revisar el pronóstico el día anterior para confirmar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la humedad relativa y cómo afecta la sensación térmica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La humedad relativa indica el porcentaje de vapor de agua en el aire respecto al máximo posible a esa temperatura. Con humedades superiores al 70% y temperaturas elevadas, la sudoración se evaporan menos eficientemente y la sensación de calor aumenta varios grados respecto a la temperatura real. Por el contrario, vientos fuertes en invierno hacen que el frío se perciba más intenso de lo que marca el termómetro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo consultar el tiempo de cualquier ciudad del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, basta con escribir el nombre de la ciudad en el buscador. La herramienta cubre miles de localidades en todos los continentes. Si hay varias ciudades con el mismo nombre en distintos países, se muestran sugerencias para que puedas elegir la correcta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre temperatura real y temperatura aparente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura real es la medición directa del termómetro en un punto de observación. La temperatura aparente (o sensación térmica) combina la temperatura, la humedad y la velocidad del viento para estimar cómo percibe el cuerpo humano el calor o el frío. En días de mucho viento con bajas temperaturas, la sensación puede ser hasta 10 °C inferior a la temperatura real.',
      },
    },
  ],
};

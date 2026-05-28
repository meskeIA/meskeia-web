import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enchufes por País - ¿Qué adaptador necesitas? | meskeIA',
  description: 'Consulta qué tipo de enchufe usan en cada país antes de viajar. Voltaje, frecuencia y qué adaptador llevar. Más de 100 países.',
  keywords: ['enchufe pais', 'adaptador viaje', 'voltaje pais', 'tipo enchufe', 'electricidad extranjero', 'plug adapter', 'adaptador corriente'],
  openGraph: {
    title: 'Enchufes por País - Adaptadores para viajeros - meskeIA',
    description: 'Descubre qué enchufe y adaptador necesitas para cada país. Voltaje y frecuencia incluidos.',
    url: 'https://meskeia.com/enchufes-por-pais/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Enchufes por País meskeIA',
  description: 'Consulta el tipo de enchufe, voltaje y frecuencia eléctrica de cada país del mundo',
  url: 'https://meskeia.com/enchufes-por-pais/',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de enchufes existen en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen más de 15 tipos de enchufes estandarizados en todo el mundo, designados con letras de la A a la N. Los más comunes son el Tipo A (dos clavijas planas, usado en América del Norte y Japón), el Tipo B (tres clavijas planas, Estados Unidos), el Tipo C (dos clavijas redondas, Europa continental), el Tipo G (tres clavijas rectangulares, Reino Unido e Irlanda) y el Tipo I (tres clavijas planas en ángulo, Australia y Argentina).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito un adaptador o un transformador de voltaje para viajar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del país de destino. Un adaptador solo cambia la forma del conector y es suficiente si tu dispositivo soporta el voltaje local. La mayoría de cargadores modernos (móviles, portátiles) son de doble voltaje (100-240 V) y solo necesitan adaptador. Si el voltaje es diferente y tu dispositivo no lo soporta (por ejemplo, una secadora de 120 V en un país de 230 V), necesitarás además un transformador de voltaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué voltaje y frecuencia usa Europa frente a América?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Europa utiliza principalmente 230 V a 50 Hz, mientras que la mayor parte de América del Norte trabaja con 120 V a 60 Hz. América del Sur es más heterogénea: países como Brasil usan 127 V o 220 V según la región, y Colombia o Perú usan 110-120 V. Japón tiene 100 V a 50/60 Hz según la zona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el adaptador de viaje más universal que puedo comprar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los adaptadores de viaje universales o "todo en uno" incluyen las combinaciones más comunes (Tipo A, C, G e I) y suelen ser suficientes para cubrir más del 95% de los países del mundo. No obstante, algunos países como Brasil (Tipo N), Israel (Tipo H) o Suráfrica (Tipo M) requieren adaptadores específicos que no siempre están incluidos en los packs básicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué enchufe usan en Estados Unidos, Reino Unido y Australia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Estados Unidos (y Canadá) usa el Tipo A (dos clavijas planas paralelas) a 120 V/60 Hz. El Reino Unido usa el Tipo G (tres clavijas rectangulares) a 230 V/50 Hz, uno de los más grandes y seguros del mundo. Australia y Nueva Zelanda usan el Tipo I (tres clavijas planas en V invertida) a 230 V/50 Hz, compartido también con Argentina.',
      },
    },
  ],
};

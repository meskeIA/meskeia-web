import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de las Especias - Rutas, Origen e Historia | meskeIA',
  description: 'Explora las rutas comerciales de las especias, su valor histórico, el origen de 12 especias populares y su presencia en las cocinas del mundo. Explicador visual interactivo.',
  keywords: 'especias, rutas comerciales, ruta de la seda, pimienta, canela, azafrán, comercio especias, historia especias, origen especias, cocina mundial, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de las Especias - Rutas, Origen e Historia',
    description: 'Las rutas que cambiaron el mundo: pimienta como moneda, nuez moscada más cara que el oro, guerras por el clavo. Historia visual de las especias.',
    url: 'https://meskeia.com/visualizador-mapa-especias/',
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
    title: 'El Mapa de las Especias - Rutas, Origen e Historia',
    description: 'Rutas comerciales, precios históricos y orígenes de las especias que cambiaron la historia. Explicador visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa Especias meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de las Especias',
  description: 'Explicador visual interactivo sobre las especias: rutas comerciales históricas (Ruta de la Seda, Ruta Marítima de las Especias), valor histórico comparado con el oro, origen de 12 especias populares y su presencia en las cocinas del mundo.',
  url: 'https://meskeia.com/visualizador-mapa-especias/',
  category: 'EducationalApplication',
  features: [
    'Rutas comerciales históricas: Seda, Marítima, Árabe, Venecia',
    'Comparativas de valor histórico: especias vs. oro',
    'Origen y producción de 12 especias populares',
    'Especias por cocina: mediterránea, india, mexicana, asiática',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué las especias fueron tan valiosas históricamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Antes de la refrigeración moderna, las especias eran imprescindibles para conservar alimentos, enmascarar sabores de carne en mal estado y elaborar medicamentos. Su producción estaba concentrada en regiones remotas de Asia y el Próximo Oriente, y el transporte era costoso y peligroso. En el siglo XIV, la pimienta negra se usaba como moneda de pago para saldar deudas, y la nuez moscada llegó a valer más que el oro por kilogramo en los mercados europeos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles fueron las principales rutas comerciales de las especias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cuatro rutas históricas más importantes fueron la Ruta de la Seda (Asia Central hacia Europa), la Ruta Árabe (desde India y Ceilán por el mar Arábigo hasta el golfo Pérsico), la Ruta Marítima de las Especias abierta por los portugueses en el siglo XV rodeando África, y la red veneciana mediterránea que redistribuía las especias por Europa. Estas rutas moldearon la geopolítica medieval y detonaron la era de los Descubrimientos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el origen de las especias más comunes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pimienta negra proviene del suroeste de India (Kerala). La canela es originaria de Sri Lanka (antes Ceilán). El clavo y la nuez moscada son nativos de las Molucas (Indonesia). El azafrán se cultiva principalmente en Irán y también en La Mancha española, siendo la especia más cara del mundo por peso. El cardamomo proviene de Guatemala e India. Estas zonas de origen explican por qué el control de esas regiones fue motivo de guerras coloniales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué especias se usan en las distintas cocinas del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cocina india es la que más especias concentra: cúrcuma, cardamomo, comino, cilantro y mezclas como el garam masala. La cocina mediterránea prefiere hierbas aromáticas como orégano, tomillo y azafrán. La mexicana hace un uso intenso del chile en sus múltiples variedades. La cocina del sudeste asiático combina jengibre, lemongrass y galanga. La árabe destaca por el uso de canela, cardamomo y zaatar en platos salados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo cambió el comercio de especias con la llegada de los portugueses a Asia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando Vasco de Gama llegó a Calicut (India) en 1498 rodeando el cabo de Buena Esperanza, Portugal rompió el monopolio árabe-veneciano que llevaba siglos controlando el comercio de especias. Los precios en Europa cayeron drásticamente al eliminar intermediarios, y el eje comercial mundial se desplazó del Mediterráneo al Atlántico. España, Países Bajos e Inglaterra compitieron a continuación por el control de las Molucas, desencadenando siglos de colonialismo en el sureste asiático.',
      },
    },
  ],
};

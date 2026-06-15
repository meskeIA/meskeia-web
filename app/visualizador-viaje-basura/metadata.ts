import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de tu Basura - Reciclaje y Residuos | meskeIA',
  description: 'Descubre qué pasa con tu basura: contenedores, plantas de reciclaje, tiempos de degradación y datos de reciclaje en España. Explicador visual interactivo.',
  keywords: 'reciclaje, basura, residuos, contenedores, degradación, economía circular, medioambiente, plástico, vidrio, papel, orgánico, España, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de tu Basura - Reciclaje y Residuos',
    description: 'Qué pasa con cada tipo de residuo: desde el cubo de tu casa hasta su nueva vida como producto reciclado.',
    url: 'https://meskeia.com/visualizador-viaje-basura/',
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
    title: 'El Viaje de tu Basura - Reciclaje y Residuos',
    description: 'Contenedores, plantas de reciclaje, tiempos de degradación y datos de España: todo sobre tus residuos, explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Viaje Basura meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de tu Basura',
  description: 'Explicador visual interactivo sobre gestión de residuos y reciclaje: qué va en cada contenedor, el viaje de cada tipo de residuo hasta su reciclaje, tiempos de degradación de materiales y datos de reciclaje en España comparados con la UE.',
  url: 'https://meskeia.com/visualizador-viaje-basura/',
  category: 'EducationalApplication',
  features: [
    'Clasificación interactiva de residuos por contenedor',
    'Errores comunes de reciclaje señalados',
    'Flujo completo de cada tipo de residuo: recogida, planta, procesado, nuevo producto',
    'Tiempos de degradación con escala logarítmica visual',
    'Datos de reciclaje en España vs. media europea',
    'Concepto de economía circular explicado visualmente',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Dónde se tira el tetra brik, en el amarillo o en el azul?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los envases de tetra brik (zumos, leche, caldos) van en el contenedor amarillo junto con latas, botellas de plástico y otros envases. Aunque su exterior parece cartón, están fabricados con capas de plástico, aluminio y cartón que se separan en planta de reciclaje. El contenedor azul es exclusivamente para papel y cartón sin contaminar, como periódicos, cajas de cartón o folios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre con la basura después de que pasa el camión de recogida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tras la recogida, los residuos van a plantas de clasificación donde se separan automáticamente por tipo de material mediante cintas transportadoras, electroimanes e infrarrojos. El papel se prensa en fardos y se envía a papeleras; el plástico se tritura y granula para fabricar nuevos productos; el vidrio se funde a 1.500 °C y el orgánico se convierte en compost o biogás. Este visualizador muestra el recorrido completo de cada tipo de residuo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas veces se puede reciclar una botella de vidrio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El vidrio es uno de los pocos materiales que puede reciclarse de forma indefinida sin perder calidad, ya que se funde y se moldea de nuevo sin degradarse. Cada tonelada de vidrio reciclado ahorra 1,2 toneladas de materias primas y reduce el consumo energético del horno en aproximadamente un 25 % respecto al vidrio fabricado desde cero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje de los residuos se recicla en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos de Eurostat, España recicla alrededor del 36 % de sus residuos municipales, por debajo de la media europea del 48 % y muy lejos de países como Alemania (67 %) o Austria (58 %). El mayor desafío es la fracción orgánica, que representa más del 40 % del volumen total de residuos domésticos pero tiene una tasa de recogida separada muy baja comparada con Europa central.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la economía circular y en qué se diferencia del reciclaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reciclaje convierte residuos en materias primas secundarias, pero sigue siendo un proceso al final del ciclo de vida del producto. La economía circular va más lejos: diseña productos para que duren más, sean fácilmente reparables, reutilizables o desmontables. El objetivo es mantener los materiales en uso el mayor tiempo posible y reducir la generación de residuos desde el origen, no solo gestionar los que ya existen.',
      },
    },
  ],
};

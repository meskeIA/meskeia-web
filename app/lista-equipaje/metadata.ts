import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lista de Equipaje Inteligente - Checklist de Viaje Personalizado | meskeIA',
  description: 'Genera una lista de equipaje personalizada según destino, clima, duración y tipo de viaje. Checklist interactivo para no olvidar nada.',
  keywords: 'lista equipaje, checklist viaje, que llevar viaje, maleta, packing list, equipaje playa, equipaje montana, equipaje negocios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lista de Equipaje Inteligente - Checklist Personalizado',
    description: 'Genera tu lista de equipaje según destino, clima y duración. No olvides nada importante.',
    url: 'https://meskeia.com/lista-equipaje/',
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
    title: 'Lista de Equipaje Inteligente - meskeIA',
    description: 'Genera tu checklist de viaje personalizado según destino y tipo de viaje.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Lista de Equipaje - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lista de Equipaje",
  description: "Genera una lista de equipaje personalizada según destino, clima, duración y tipo de viaje. Checklist interactivo para no olvidar nada.",
  url: "https://meskeia.com/lista-equipaje/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué debo llevar en la maleta para un viaje de playa de una semana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para una semana en la playa conviene llevar ropa ligera (camisetas, shorts, vestidos), 2 bañadores, protector solar (FPS 30+), gafas de sol, sombrero o gorra, chanclas y calzado de paseo. No olvides el cargador del móvil, medicación habitual, documentación (DNI/pasaporte) y los seguros de viaje. Esta herramienta genera la lista completa según la duración y el clima de tu destino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo hacer una lista de equipaje personalizada para mi viaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Indica el tipo de viaje (playa, montaña, ciudad, negocios), el número de días y el clima esperado. La herramienta genera automáticamente un checklist con las categorías relevantes: ropa, higiene, tecnología, documentos, medicación y extras según el destino. Puedes marcar cada ítem como incluido y adaptar la lista a tus necesidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto equipaje de mano permite llevar una maleta de cabina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las medidas y pesos varían por aerolínea. En general, el equipaje de mano estándar es de 55×40×20 cm y hasta 10 kg en compañías como Iberia o Vueling, aunque las low cost (Ryanair, Wizz Air) pueden reducirlo a 40×20×25 cm para el bolso personal gratuito. Conviene revisar las normas específicas de cada aerolínea antes de hacer la maleta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué no se puede meter en el equipaje de mano en el avión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En cabina no se permiten líquidos en envases de más de 100 ml (deben ir en una bolsa transparente resellable de 1 litro), objetos cortantes (tijeras con hoja >6 cm, navajas), encendedores de butano ni pilas de litio sueltas de más de 100 Wh. Los artículos de más de 100 ml de líquido —perfumes, champú, cremas— deben ir en la maleta facturada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una lista de equipaje frente a hacer la maleta de memoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una lista estructurada reduce los olvidos habituales (cargadores, adaptadores de enchufe, medicación, documentación) y evita el exceso de equipaje al obligarte a planificar con antelación. Estudios de comportamiento del viajero señalan que los olvidos más frecuentes son los cargadores y los adaptadores de corriente, seguidos de artículos de higiene.',
      },
    },
  ],
};

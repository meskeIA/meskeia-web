import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuanta Agua Gastas sin Saberlo - Agua Virtual | meskeIA',
  description: 'El agua oculta en tu cafe, tu camiseta y tu filete. Descubre la huella hidrica invisible de los productos cotidianos con datos reales.',
  keywords: 'agua virtual, huella hidrica, agua oculta, consumo agua, agua alimentos, agua ropa, sostenibilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuanta Agua Gastas sin Saberlo',
    description: 'La huella hidrica invisible de tu vida cotidiana.',
    url: 'https://meskeia.com/visualizador-agua-virtual/',
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
    title: 'Cuanta Agua Gastas sin Saberlo',
    description: 'Agua virtual: lo que no ves en cada producto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Agua Virtual meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuanta Agua Gastas sin Saberlo',
  description: 'Explicador visual del agua virtual: cuantos litros ocultos hay en tu cafe, tu ropa y tu comida. Huella hidrica por producto y pais.',
  url: 'https://meskeia.com/visualizador-agua-virtual/',
  features: [
    'Litros ocultos en cada producto cotidiano',
    'Comparacion huella hidrica de alimentos',
    'Agua virtual en la industria textil',
    'Estres hidrico global y comercio de agua virtual',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el agua virtual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua virtual es la cantidad total de agua dulce que se utiliza para producir un bien o servicio a lo largo de toda su cadena de producción. El concepto fue introducido por el científico John Allan en 1993 para explicar cómo los países con escasez hídrica importan agua de forma indirecta al comprar productos que requieren mucha agua para fabricarse. Por ejemplo, una camiseta de algodón puede acumular hasta 2.700 litros de agua virtual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta agua se necesita para producir un café?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una sola taza de café de 125 ml requiere aproximadamente 140 litros de agua virtual, según datos de la Water Footprint Network. La mayor parte de ese agua se consume en el cultivo de los granos de café en los países productores. Si se tiene en cuenta que en España se consumen alrededor de 3,2 millones de tazas al día, el impacto hídrico acumulado es considerable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué productos tienen una huella hídrica mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La carne de vacuno encabeza la lista con unos 15.400 litros por kilogramo, seguida del chocolate (~17.000 l/kg de cacao), el cuero y los productos textiles de algodón. Entre los alimentos de origen vegetal, el aguacate (~320 l/unidad) y las nueces (~4.900 l/kg) destacan por su alto consumo hídrico relativo. Las verduras de hoja verde, las patatas y las legumbres tienen huellas significativamente más bajas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el comercio internacional a la escasez de agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando un país exporta productos que consumen mucha agua, está exportando agua virtual de su territorio, lo que puede agravar la escasez local. Países con estrés hídrico severo como Marruecos, India o México exportan grandes volúmenes de agua virtual a través de productos agrícolas. El análisis de flujos de agua virtual permite entender qué regiones del mundo están financiando con sus recursos hídricos el consumo de otras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reducir mi huella hídrica en el día a día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El 90-95% de la huella hídrica personal proviene de la dieta y la ropa, no del consumo doméstico de agua. Reducir el consumo de carne roja y lácteos, elegir ropa de segunda mano o fabricada con materiales reciclados, y priorizar productos de temporada y proximidad son las medidas con mayor impacto. Cerrar el grifo o ducharse menos supone una mejora marginal comparada con estos cambios en el consumo.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánto dura cada alimento en la nevera y el congelador | meskeIA',
  description:
    'Consulta cuántos días o meses aguanta cada alimento en la nevera, el congelador y la despensa: carnes, pescados, lácteos, verduras y sobras. Datos orientativos de seguridad alimentaria. Gratis y en español.',
  keywords:
    'cuanto dura en la nevera, caducidad alimentos, conservacion alimentos congelador, cuanto aguanta la carne en la nevera, tiempo conservacion sobras, congelar alimentos cuanto duran, despensa caducidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuánto dura cada alimento en nevera, congelador y despensa',
    description:
      'Tiempos de conservación orientativos por alimento en nevera, congelador y despensa.',
    url: 'https://meskeia.com/calculadora-caducidad',
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
    title: 'Cuánto dura cada alimento',
    description: 'Tiempos de conservación en nevera, congelador y despensa, por alimento.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: { 'application-name': 'Caducidad de alimentos meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-caducidad/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánto dura cada alimento (nevera, congelador y despensa)',
  description:
    'Tabla de tiempos de conservación orientativos para alimentos habituales en nevera, congelador y despensa: carnes, pescados, lácteos, huevos, frutas, verduras, cocinados y productos de despensa, con filtro por categoría y buscador.',
  url: 'https://meskeia.com/calculadora-caducidad/',
  features: [
    'Tiempos en nevera, congelador y despensa por alimento',
    'Buscador y filtro por categoría',
    'Carnes, pescados, lácteos, frutas, verduras, sobras y despensa',
    'Basado en guías de seguridad alimentaria (USDA/FDA)',
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
      name: '¿Cuánto dura la carne cruda en la nevera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La carne picada cruda aguanta solo 1 o 2 días en la nevera, mientras que los filetes y chuletas enteras duran de 3 a 5 días, y el pollo crudo, de 1 a 2 días. En el congelador se conservan mucho más: de varios meses a un año según el tipo. La nevera debe estar a 4 °C o menos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto duran las sobras de comida cocinada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las sobras cocinadas se conservan de 3 a 4 días en la nevera y de 2 a 3 meses en el congelador. Conviene refrigerarlas antes de 2 horas tras cocinarlas, guardarlas en recipientes cerrados y recalentarlas bien (hasta que humeen) antes de comerlas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si un alimento ya no es seguro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tiempos son orientativos: lo que manda son los signos de deterioro. Si un alimento tiene mal olor, color o textura raros, moho o el envase está hinchado, deséchalo aunque no haya pasado el tiempo indicado. Ante la duda, mejor tirarlo: el riesgo de una intoxicación no compensa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La comida congelada caduca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A −18 °C los alimentos se mantienen seguros mucho tiempo, pero la calidad (sabor, textura) sí se degrada con los meses, por eso se dan plazos recomendados. Etiqueta con la fecha al congelar y respeta los tiempos para comerlos en su mejor momento. Una vez descongelado, no se debe recongelar en crudo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura deben estar la nevera y el congelador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La nevera debe estar a 4 °C o menos y el congelador a −18 °C. Por encima de esas temperaturas, los alimentos se estropean mucho más rápido y aumenta el riesgo de bacterias. Evita dejar comida perecedera más de 2 horas a temperatura ambiente (1 hora si hace mucho calor).',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Materiales de Construcción - Azulejos, Pintura, Tarima | meskeIA',
  description: 'Calcula los materiales que necesitas para tus reformas: azulejos, pintura, tarima y mortero. Incluye porcentaje de desperdicio y estimación de coste. Gratis y sin registro.',
  keywords: 'calculadora materiales construccion, cuantos azulejos necesito, litros pintura paredes, cajas tarima, sacos mortero, reformas hogar, calculadora reformas, presupuesto materiales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Materiales de Construcción | meskeIA',
    description: 'Calcula azulejos, pintura, tarima y mortero para tus reformas. Con desperdicio y coste estimado.',
    url: 'https://meskeia.com/calculadora-materiales-construccion/',
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
    title: 'Calculadora de Materiales de Construcción | meskeIA',
    description: 'Calcula azulejos, pintura, tarima y mortero para tus reformas en pocos segundos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Materiales Construcción meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Materiales de Construcción',
  description: 'Herramienta gratuita para calcular la cantidad de materiales necesarios en reformas del hogar: azulejos, baldosas, pintura, tarima y mortero. Incluye cálculo de desperdicio y estimación de coste total.',
  url: 'https://meskeia.com/calculadora-materiales-construccion/',
  features: [
    'Cálculo de azulejos y baldosas con porcentaje de desperdicio configurable',
    'Calculadora de litros de pintura para paredes y techos',
    'Estimador de tarima y parquet con cortes incluidos',
    'Cálculo de sacos de mortero o adhesivo cerámico',
    'Estimación de coste total por material',
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
      name: '¿Cómo calculo cuántos azulejos necesito para una habitación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mide la superficie total en metros cuadrados (largo × ancho) y añade un porcentaje de desperdicio de entre el 10% y el 15% para cubrir cortes, roturas y ajustes. La calculadora divide la superficie total entre el área de cada azulejo y convierte el resultado en cajas según el rendimiento del fabricante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos litros de pintura necesito para pintar una habitación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rendimiento estándar de la pintura de interiores es de 10 a 12 m² por litro en superficies lisas. Para una habitación de 15 m² con paredes de 2,5 m de altura (perímetro de 15 m de pared = 37,5 m²) necesitarías entre 6 y 8 litros por mano. Se recomienda siempre dar dos manos, especialmente en cambios de color.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje de desperdicio debo aplicar en la tarima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para una colocación recta (paralela a las paredes) se recomienda un 10% de desperdicio. Si se coloca en diagonal o a espiga (efecto espiga o V), el desperdicio puede llegar al 15-20% por los cortes adicionales en los ángulos. La calculadora permite ajustar este porcentaje según tu caso concreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos sacos de mortero o adhesivo necesito para colocar azulejos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El consumo estándar de adhesivo cementoso para azulejos de interior es de 3 a 5 kg por m², según el tamaño de la pieza y la llana usada. Un saco de 25 kg cubre entre 5 y 8 m². Para azulejos grandes (>60×60 cm) el consumo puede superar los 6 kg/m². La calculadora estima los sacos necesarios en función de la superficie introducida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar esta calculadora para estimar el coste total de una reforma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La herramienta permite introducir el precio por unidad o por caja de cada material y calcula automáticamente el coste total estimado de materiales. Ten en cuenta que la estimación no incluye mano de obra ni otros gastos indirectos; sirve como referencia para presupuestar la partida de materiales de una reforma.',
      },
    },
  ],
};

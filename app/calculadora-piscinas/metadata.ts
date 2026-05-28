import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Piscinas - Cloro, pH, Alguicida y Volumen | meskeIA',
  description: 'Calcula el volumen de tu piscina y las dosis de productos químicos: cloro, corrector de pH, alguicida y sal. Para mantenimiento regular y tratamiento de choque. Gratis.',
  keywords: 'calculadora piscina, cuanto cloro piscina, volumen piscina, dosis alguicida, corrector ph piscina, tratamiento quimico piscina, mantenimiento piscina, piscina sal cloracion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Piscinas - Productos Químicos y Volumen | meskeIA',
    description: 'Calcula el volumen de tu piscina y las dosis exactas de cloro, pH y alguicida.',
    url: 'https://meskeia.com/calculadora-piscinas/',
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
    title: 'Calculadora de Piscinas | meskeIA',
    description: 'Calcula cuánto cloro, alguicida y corrector de pH necesita tu piscina según su volumen.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Piscinas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Piscinas',
  description: 'Herramienta gratuita para calcular el volumen de una piscina (rectangular, circular u ovalada) y las dosis de productos químicos necesarios: cloro granulado o líquido, corrector de pH, alguicida y sal para sistemas de cloración salina.',
  url: 'https://meskeia.com/calculadora-piscinas/',
  features: [
    'Cálculo de volumen para piscinas rectangulares, circulares y ovaladas',
    'Dosis de cloro granulado y líquido (mantenimiento y choque)',
    'Dosis de corrector de pH (elevador y reductor)',
    'Dosis de alguicida preventivo y de choque',
    'Dosis de sal para piscinas con electrólisis salina',
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
      name: '¿Cuánto cloro necesita una piscina por metro cúbico de agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para mantenimiento regular se recomiendan entre 2 y 3 mg/L (partes por millón) de cloro libre activo en el agua. En una piscina de 50 m³, eso equivale a añadir aproximadamente 150-300 g de cloro granulado al 70 % diariamente, según la temperatura, la carga de bañistas y la radiación solar. En tratamientos de choque se puede llegar a 10 mg/L temporalmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el volumen de una piscina rectangular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El volumen de una piscina rectangular se calcula multiplicando largo × ancho × profundidad media (en metros), obteniendo el resultado en metros cúbicos (m³), equivalente a 1.000 litros. Si la piscina tiene profundidad variable, se promedia la zona poco profunda y la zona de más profundidad: (prof. mínima + prof. máxima) / 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el pH ideal del agua de una piscina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pH óptimo del agua de piscina se sitúa entre 7,2 y 7,6. Por debajo de 7,2 el agua es demasiado ácida, lo que puede irritar ojos y piel e incluso dañar el revestimiento. Por encima de 7,8 el cloro pierde eficacia (a pH 8 solo el 20 % del cloro añadido es activo) y pueden aparecer turbideces. Se corrige con pH+ (carbonato sódico) o pH− (ácido clorhídrico diluido).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el alguicida en una piscina y cuándo usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alguicida previene y elimina el crecimiento de algas que tiñen el agua de verde, amarillo o negro. Se utiliza de forma preventiva al inicio de la temporada (dosis de choque: 0,5-1 L por cada 50 m³) y semanalmente en dosis de mantenimiento (0,1-0,2 L por cada 50 m³). Es especialmente importante en piscinas con alta insolación o poco movimiento de agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una piscina con cloro y una piscina de sal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las piscinas de sal utilizan un electrolizador que convierte el cloruro sódico (sal común) en cloro activo de forma continua. No eliminan el cloro, sino que lo generan in situ a partir de la sal. El resultado es agua con menor olor a cloro, menos irritante para ojos y piel, y menor coste en productos químicos a largo plazo. La concentración de sal recomendada es de 3-5 g/L (agua muy ligeramente salada, no comparable al mar).',
      },
    },
  ],
};

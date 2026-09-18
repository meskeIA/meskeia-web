import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Piscinas, Albercas y Piletas - Cloro, pH, Alguicida y Volumen | meskeIA',
  description: 'Calcula el volumen de tu piscina, alberca o pileta y las dosis de productos químicos: cloro, corrector de pH, alguicida y sal. Para mantenimiento regular y tratamiento de choque. Gratis.',
  keywords: 'calculadora piscina, calculadora de alberca, litros de pileta, cuanto cloro piscina, volumen piscina alberca pileta, dosis alguicida, corrector ph piscina, tratamiento quimico alberca, mantenimiento piscina pileta, piscina sal cloracion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Piscinas, Albercas y Piletas - Productos Químicos y Volumen | meskeIA',
    description: 'Calcula el volumen de tu piscina (alberca o pileta) y las dosis exactas de cloro, pH y alguicida.',
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
    title: 'Calculadora de Piscinas, Albercas y Piletas | meskeIA',
    description: 'Calcula cuánto cloro, alguicida y corrector de pH necesita tu piscina, alberca o pileta según su volumen.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Piscinas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Piscinas, Albercas y Piletas',
  description: 'Herramienta gratuita para calcular el volumen de una piscina (conocida como alberca en México y pileta en Argentina y Uruguay) en forma rectangular, circular u ovalada, y las dosis de productos químicos necesarios: cloro granulado o líquido, corrector de pH, alguicida y sal para sistemas de cloración salina.',
  url: 'https://meskeia.com/calculadora-piscinas/',
  features: [
    'Cálculo de volumen para piscinas, albercas y piletas rectangulares, circulares y ovaladas',
    'Dosis de cloro granulado y líquido (mantenimiento y choque)',
    'Dosis de corrector de pH (elevador y reductor)',
    'Dosis de alguicida preventivo y de choque',
    'Dosis de sal para piscinas con electrólisis salina',
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
        text: 'La dosis se calcula sobre el cloro libre que quieres tener en el agua: 1 ppm (mg/L) en 1 m³ equivale a 1 g de cloro activo, así que el producto necesario es ese gramo dividido por su riqueza. Con granulado al 65 %, 1 ppm son 1,54 g/m³. Para mantener entre 1 y 2 ppm en una piscina exterior se repone el consumo semanal (unos 7 ppm, ~11 g/m³): en una piscina de 50 m³, 539 g de granulado a la semana. Un tratamiento de choque lleva el agua a 10 ppm, unos 15 g/m³.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el volumen de una piscina rectangular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El volumen de una piscina rectangular (alberca en México, pileta en Argentina y Uruguay) se calcula multiplicando largo × ancho × profundidad media (en metros), obteniendo el resultado en metros cúbicos (m³), equivalente a 1.000 litros. Si la piscina tiene profundidad variable, se promedia la zona poco profunda y la zona de más profundidad: (prof. mínima + prof. máxima) / 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el pH ideal del agua de una piscina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pH óptimo del agua de piscina se sitúa entre 7,2 y 7,6. Por debajo de 7,2 el agua es demasiado ácida, lo que puede irritar ojos y piel e incluso dañar el revestimiento. Por encima de 7,8 el cloro pierde eficacia: según la curva de disociación del ácido hipocloroso (pKa 7,54 a 25 °C), a pH 7,2 un 69 % del cloro está en la forma que desinfecta, a pH 7,6 un 47 % y a pH 8,0 solo un 26 %. Se corrige con pH+ (carbonato sódico) o pH− (bisulfato sódico en granulado, o ácido diluido en presentación líquida).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el alguicida en una piscina y cuándo usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alguicida previene y elimina el crecimiento de algas que tiñen el agua de verde, amarillo o negro. Se utiliza en dosis de choque al inicio de la temporada o con algas visibles (10 mL/m³, es decir 1 L por cada 100 m³) y semanalmente en dosis preventiva (2 mL/m³, unos 0,2 L por cada 100 m³). Es especialmente importante en piscinas con alta insolación o poco movimiento de agua. Nunca se añade a la vez que el cloro: se dejan al menos cuatro horas entre uno y otro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una piscina con cloro y una piscina de sal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las piscinas de sal utilizan un electrolizador que convierte el cloruro sódico (sal común) en cloro activo de forma continua. No eliminan el cloro, sino que lo generan in situ a partir de la sal. El resultado es agua con menor olor a cloro, menos irritante para ojos y piel, y menor coste en productos químicos a largo plazo. La concentración de sal recomendada es de 4-6 g/L según el equipo —el nivel exacto lo fija el manual del clorador— y en todo caso es agua muy ligeramente salada, no comparable al mar, que ronda los 35 g/L.',
      },
    },
  ],
};

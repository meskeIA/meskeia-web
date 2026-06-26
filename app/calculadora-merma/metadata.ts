import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de merma y rendimiento de alimentos | meskeIA',
  description:
    'Calcula el peso neto y el rendimiento de un alimento tras limpiarlo y cocinarlo, el factor de corrección y el coste real por kilo útil. Para hostelería y cocina. Gratis y en español.',
  keywords:
    'calculadora merma, rendimiento alimentos cocina, factor de correccion cocina, peso neto bruto, merma de coccion, coste real por kilo, merma limpieza pescado carne',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de merma y rendimiento',
    description:
      'Peso neto, rendimiento, factor de corrección y coste real por kilo útil de un alimento tras limpiar y cocinar.',
    url: 'https://meskeia.com/calculadora-merma',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de merma y rendimiento',
    description:
      'Cuánto pierde un alimento al limpiar y cocinar, y cuánto cuesta de verdad el producto útil.',
  },
  other: {
    'application-name': 'Calculadora de merma meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/calculadora-merma/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de merma y rendimiento de alimentos',
  description:
    'Calcula el peso neto aprovechable de un alimento tras la limpieza (pelar, deshuesar, limpiar) y la cocción (pérdida de agua), el porcentaje de merma y rendimiento, el factor de corrección y el coste real por kilo de producto útil a partir del precio de compra.',
  url: 'https://meskeia.com/calculadora-merma/',
  features: [
    'Peso limpio y peso neto tras limpieza y cocción',
    'Porcentaje de merma y de rendimiento',
    'Factor de corrección (bruto / neto)',
    'Coste real por kilo útil a partir del precio de compra',
    'Mermas orientativas de alimentos habituales',
    'Gratuito, sin publicidad y en español',
  ],
  category: 'BusinessApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la merma de un alimento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La merma es la parte de un alimento que se pierde y no llega al plato. Hay merma de limpieza (pelar, deshuesar, quitar grasa o partes no comestibles) y merma de cocción (pérdida de agua y volumen al cocinar). Lo que queda aprovechable es el peso neto, siempre menor que el peso bruto que se compra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el factor de corrección en cocina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factor de corrección es el resultado de dividir el peso bruto entre el peso neto. Indica cuánto producto hay que comprar por cada unidad que de verdad se sirve. Si un alimento tiene un factor de 2, por cada kilo útil necesitas comprar dos, y su coste real por kilo útil es el doble del precio de compra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta merma tiene un pescado entero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un pescado entero puede perder entre el 40 y el 60% de su peso al quitarle cabeza, espina, piel y vísceras, según la especie y el tipo de corte. Por eso un filete limpio cuesta bastante más por kilo que el pescado entero: hay que tener en cuenta esa merma al calcular el coste real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué importa la merma para el precio de los platos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el precio de compra no refleja el coste real. Si pagas 10 € por kilo de un producto que rinde solo medio kilo útil, ese medio kilo te cuesta 20 € por kilo. Ignorar la merma al hacer el escandallo lleva a fijar precios demasiado bajos y a perder margen sin darte cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La merma de cocción también cuenta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Muchos alimentos pierden peso al cocinarse, sobre todo las carnes, que sueltan agua y grasa y pueden reducirse entre un 20 y un 30%. Si vendes raciones por peso cocinado, esa merma también encarece el producto y conviene incluirla en el cálculo del coste.',
      },
    },
  ],
};

import { Metadata } from 'next';

const title = '¿Cuánto tardo en ahorrar? — Calculadora de objetivos de ahorro | meskeIA';
const description = 'Calcula cuánto tiempo necesitas para alcanzar tu objetivo de ahorro. Introduce el precio, tu ahorro mensual y descubre cuándo lo tendrás. Visual y motivador.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'cuanto tardo en ahorrar, calculadora ahorro objetivo, tiempo ahorro, meta ahorro, ahorrar para comprar, planificador ahorro jovenes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Cuánto tardo en ahorrar? | meskeIA',
    description,
    url: 'https://meskeia.com/estimador-tiempo-ahorro/',
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
    title: '¿Cuánto tardo en ahorrar? | meskeIA',
    description: 'Descubre cuándo alcanzarás tu objetivo de ahorro con esta calculadora visual',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '¿Cuánto tardo en ahorrar?',
  description,
  url: 'https://meskeia.com/estimador-tiempo-ahorro/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tardo en ahorrar 1.000 euros guardando 100 euros al mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ahorrando 100 euros al mes tardarías exactamente 10 meses en reunir 1.000 euros, sin contar intereses. Si el dinero está en una cuenta remunerada o depósito, el plazo puede acortarse ligeramente. La calculadora realiza este cálculo de forma automática para cualquier objetivo y cualquier capacidad de ahorro mensual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo cuánto necesito ahorrar al mes para comprar algo en una fecha concreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si tienes una fecha límite (por ejemplo, comprar un portátil en 6 meses), divide el precio total entre los meses disponibles. Si el precio es 900 euros y tienes 6 meses, necesitas ahorrar 150 euros al mes. El estimador puede hacer este cálculo inverso: introduces el precio y la fecha objetivo, y te dice cuánto debes guardar cada mes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué objetivos de ahorro es útil esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier meta financiera a corto o medio plazo: un viaje, un electrodoméstico, el fondo de emergencia, la entrada de un piso, un vehículo o unas vacaciones. La herramienta no distingue el tipo de objetivo; simplemente calcula el tiempo o la cuota mensual necesaria según el precio y el ahorro disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero de emergencia debería tener ahorrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El criterio habitual es tener entre 3 y 6 meses de gastos esenciales cubiertos como colchón de emergencia. Esto significa que si tus gastos imprescindibles son 1.200 euros al mes, un fondo adecuado estaría entre 3.600 y 7.200 euros. La calculadora te dice cuánto tiempo tardarías en llegar a esa cifra con tu ahorro mensual actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta herramienta y una calculadora de interés compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Esta herramienta calcula el tiempo de ahorro simple (sin rentabilidad), ideal para metas a corto plazo donde el dinero se guarda en cuenta corriente. Una calculadora de interés compuesto añade la rentabilidad generada por el capital acumulado, relevante para plazos largos (más de 2-3 años) con productos de inversión. Para objetivos cotidianos de menos de 2 años, el ahorro simple es suficientemente preciso.',
      },
    },
  ],
};

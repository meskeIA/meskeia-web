import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de ratio de café: cuánto café y agua | meskeIA',
  description:
    'Calcula los gramos de café y el agua según el método (V60, prensa francesa, AeroPress, espresso, moka, cold brew). Indica el agua y obtén el café exacto, o al revés. Gratis y en español.',
  keywords:
    'ratio de cafe, cuanto cafe por taza, gramos de cafe agua, proporcion cafe v60, ratio prensa francesa, calculadora cafe, cold brew proporcion, espresso ratio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de ratio de café',
    description:
      'Los gramos de café y el agua para cada método: V60, prensa, AeroPress, espresso, moka y cold brew.',
    url: 'https://meskeia.com/ratio-cafe',
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
    title: 'Calculadora de ratio de café',
    description: 'Café y agua exactos según el método de preparación.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: { 'application-name': 'Ratio de café meskeIA' },
  alternates: { canonical: 'https://meskeia.com/ratio-cafe/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de ratio de café',
  description:
    'Calcula la cantidad de café molido y de agua según el método de preparación (V60 o goteo, prensa francesa, AeroPress, espresso, cafetera italiana y cold brew) a partir del agua, del café o del número de tazas, usando la proporción habitual de cada método.',
  url: 'https://meskeia.com/ratio-cafe/',
  features: [
    'Ratios para V60, prensa, AeroPress, espresso, moka y cold brew',
    'Calcula desde el agua, desde el café o por tazas',
    'Proporción café:agua de cada método',
    'Consejos de molienda para cada preparación',
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
      name: '¿Cuánto café se pone por taza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del método, pero como referencia para un café de filtro (V60) la proporción habitual es 1:16, es decir, 1 gramo de café por cada 16 de agua. Para una taza de 200 ml saldrían unos 12-13 gramos de café. La prensa francesa va algo más cargada (1:15) y el cold brew mucho más (1:8, porque es un concentrado).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ratio de café?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la proporción entre el café molido y el agua, normalmente expresada como 1:X (un gramo de café por X gramos de agua). Un ratio más bajo (1:14) da un café más intenso y otro más alto (1:17) uno más suave. Ajustarlo es la forma más sencilla de afinar la intensidad a tu gusto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ratio usa el espresso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El espresso usa un ratio de extracción muy concentrado, en torno a 1:2: por ejemplo, 18 gramos de café molido muy fino para obtener unos 36 gramos de espresso en taza. Es muy distinto de los métodos de filtro porque el agua pasa a presión y en pocos segundos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se prepara el cold brew?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cold brew se hace en frío con un ratio concentrado de 1:8 (mucho café por poca agua) y un reposo largo de 12 a 18 horas. El resultado es un concentrado suave y poco ácido que luego se diluye con agua o leche al servir, normalmente al gusto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La molienda influye en el café?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mucho. Cada método pide una molienda distinta: muy fina para espresso, media-fina para V60, media para AeroPress y gruesa para prensa francesa. Una molienda inadecuada puede dejar el café aguado (molido demasiado grueso) o amargo (demasiado fino), por mucho que el ratio sea correcto.',
      },
    },
  ],
};

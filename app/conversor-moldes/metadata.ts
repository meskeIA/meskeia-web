import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de moldes: adapta la receta a tu molde | meskeIA',
  description:
    'La receta es para un molde y tú tienes otro. Calcula por cuánto multiplicar los ingredientes según el área del molde (redondo, cuadrado o rectangular) y ajusta el tiempo de horno. Gratis y en español.',
  keywords:
    'conversor de moldes, cambiar tamaño molde receta, adaptar receta otro molde, molde 18 a 20 cm, calcular ingredientes molde, equivalencia moldes reposteria, molde redondo cuadrado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de moldes de repostería',
    description:
      'Adapta las cantidades de una receta a tu molde según el área de la base. Redondo, cuadrado y rectangular.',
    url: 'https://meskeia.com/conversor-moldes',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de moldes de repostería',
    description: 'Multiplica los ingredientes según el molde que tengas y ajusta el tiempo de horno.',
  },
  other: { 'application-name': 'Conversor de moldes meskeIA' },
  alternates: { canonical: 'https://meskeia.com/conversor-moldes/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de moldes de repostería',
  description:
    'Calcula por cuánto multiplicar los ingredientes de una receta cuando cambias de molde, a partir del área de la base de los moldes de origen y destino (redondo, cuadrado o rectangular), e indica cómo ajustar el tiempo de horno.',
  url: 'https://meskeia.com/conversor-moldes/',
  features: [
    'Conversión por área de la base entre cualquier molde',
    'Moldes redondos, cuadrados y rectangulares',
    'Factor para multiplicar todos los ingredientes',
    'Orientación sobre el ajuste de tiempo y temperatura',
    'Moldes habituales predefinidos',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo adapto una receta a un molde de distinto tamaño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se compara el área de la base de los dos moldes y se multiplican todos los ingredientes por el factor resultante. Por ejemplo, pasar de un molde redondo de 18 cm a uno de 24 cm supone multiplicar por 1,8 aproximadamente, porque el de 24 cm tiene casi el doble de superficie. Así la masa mantiene la misma altura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se calcula por el área y no por el diámetro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque lo que importa para que la masa quede a la misma altura es la superficie de la base, que crece con el cuadrado del diámetro. Un molde de 24 cm no tiene un tercio más de superficie que uno de 18, sino casi el doble. Por eso fiarse solo del diámetro lleva a errores grandes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Un molde redondo equivale a uno cuadrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, comparando sus áreas. Un molde cuadrado de 20 cm tiene 400 cm² y uno redondo de 22 cm unos 380 cm², así que son casi equivalentes. La herramienta te permite mezclar formas (redondo, cuadrado, rectangular) y te da el factor exacto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay que cambiar el tiempo de horno al cambiar de molde?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Suele cambiar poco, porque el tiempo depende sobre todo de la altura de la masa, no del diámetro. Si el molde nuevo es más grande, la masa queda más fina y se hace algo antes; si es más pequeño, queda más alta y necesita algo más de tiempo, a veces bajando 10 °C el horno para que el centro cuaje sin quemar el exterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sirve para cualquier receta de horno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Funciona muy bien con bizcochos, tartas, brownies y masas que se hornean en molde. Para preparaciones donde la altura es clave (como un soufflé) o que dependen de un molde concreto, úsalo como orientación y vigila el resultado. El factor ajusta cantidades; el resto del criterio lo pones tú.',
      },
    },
  ],
};

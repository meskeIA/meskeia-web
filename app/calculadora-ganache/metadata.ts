import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ganache — Proporciones de Chocolate y Nata según Textura | meskeIA',
  description: 'Calcula las proporciones exactas de chocolate y nata para ganache según el tipo de chocolate y la textura deseada: glaseado, trufa o firme. Ratios profesionales al instante.',
  keywords: 'calculadora ganache, proporciones ganache, chocolate nata ratio, ganache trufa, ganache glaseado, ganache firme, repostería, chocolate negro blanco con leche',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-ganache/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ganache - Proporciones de Chocolate y Nata',
    description: 'Calcula las proporciones exactas de chocolate y nata para ganache según el tipo de chocolate y la textura deseada.',
    url: 'https://meskeia.com/calculadora-ganache/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Ganache | meskeIA',
    description: 'Ratios profesionales de ganache: chocolate negro, con leche o blanco para glaseado, trufa o bombones.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Ganache meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Ganache',
  description: 'Calculadora de proporciones de ganache para repostería: selecciona el tipo de chocolate (negro extra, negro, semi-fondant, con leche o blanco) y la textura deseada (glaseado, trufa o firme) para obtener las cantidades exactas de chocolate y nata.',
  url: 'https://meskeia.com/calculadora-ganache/',
  category: 'UtilityApplication',
  features: [
    'Ratios de ganache para 5 tipos de chocolate',
    'Tres texturas: glaseado, trufa y firme',
    'Cantidades exactas de chocolate y nata en gramos',
    'Temperatura de trabajo recomendada para cada textura',
    'Usos típicos de cada combinación de ganache',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['ganache', 'proporciones chocolate', 'nata ganache', 'repostería', 'trufas chocolate'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ganache y para qué se usa en repostería?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ganache es una mezcla emulsionada de chocolate y nata caliente que, según la proporción y el tipo de chocolate, resulta en una textura fluida, cremosa o firme. Se usa como glaseado para tartas, relleno de bombones y trufas, cobertura de pasteles o base para mousses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la proporción de chocolate y nata para hacer ganache?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del uso. Para un glaseado fluido de chocolate negro, la proporción habitual es 1:1 (igual peso de chocolate y nata). Para trufas más firmes, se sube a 2:1 (el doble de chocolate). El chocolate con leche y el blanco tienen más azúcar y grasa láctea, por lo que necesitan menos nata: ratios de 2,5:1 o incluso 3:1 para lograr la misma textura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el ganache de chocolate blanco necesita más chocolate que el negro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El chocolate blanco no contiene sólidos de cacao, sino manteca de cacao, azúcar y leche. Esta composición lo hace más blando a temperatura ambiente y con menor capacidad de gelificar. Para compensar y lograr una textura equivalente a la del chocolate negro, hay que aumentar la proporción de chocolate respecto a la nata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura se trabaja el ganache según su uso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para glasear tartas se vierte el ganache entre 32 y 35 °C, cuando está fluido pero empieza a espesar. Para rellenar bombones o picar como trufa se deja enfriar a temperatura ambiente hasta que esté manejable (unos 25–28 °C). Para montar el ganache con varillas es necesario que esté completamente frío, idealmente tras reposar en nevera unas horas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el ganache se corta o queda grumoso y cómo se arregla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ganache se corta cuando la emulsión entre la grasa del chocolate y el agua de la nata se rompe, generalmente por una diferencia de temperatura brusca o por un ratio incorrecto. Para recuperarlo, calienta ligeramente la mezcla a 40–45 °C y bate con un batidor de mano o túrmix hasta que vuelva a emulsionar. Añadir una cucharada de nata tibia también puede ayudar.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tiempos de cocción: huevos, arroz, legumbres y verduras | meskeIA',
  description:
    'Cuánto hay que cocer cada alimento en agua: huevos (pasado por agua, mollet, duro), arroz, pasta, legumbres y verduras. Con notas prácticas y ajuste por altitud. Gratis y en español.',
  keywords:
    'tiempos de coccion, cuanto cocer huevo duro, tiempo coccion garbanzos, cuanto se cuece el arroz, tiempo coccion lentejas, tiempo coccion verduras, tabla tiempos coccion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tiempos de cocción de huevos, arroz, legumbres y verduras',
    description:
      'La tabla de tiempos de cocción en agua para los alimentos del día a día, con notas prácticas.',
    url: 'https://meskeia.com/tiempos-coccion',
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
    title: 'Tiempos de cocción',
    description:
      'Cuánto cocer huevos, arroz, pasta, legumbres y verduras, con notas y ajuste por altitud.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Tiempos de cocción meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/tiempos-coccion/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tiempos de cocción de alimentos',
  description:
    'Tabla de tiempos de cocción en agua para huevos, pasta, arroz y otros cereales, legumbres y verduras, con notas prácticas sobre cada alimento y recordatorio de que en altura los tiempos se alargan.',
  url: 'https://meskeia.com/tiempos-coccion/',
  features: [
    'Tiempos de cocción de huevos, arroz, pasta, legumbres y verduras',
    'Filtro por tipo de alimento',
    'Notas prácticas para cada alimento',
    'Recordatorio de ajuste por altitud',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se cuece un huevo duro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un huevo duro necesita entre 10 y 12 minutos desde que el agua hierve. Para un huevo mollet (clara firme y yema cremosa) bastan 5-6 minutos, y para uno pasado por agua, 3-4. Al sacarlo, enfríalo enseguida en agua fría para cortar la cocción y que pele mejor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tardan en cocerse los garbanzos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los garbanzos remojados desde la víspera tardan entre 1,5 y 2 horas en olla normal, o 30-40 minutos en olla a presión. Sin remojo previo tardan mucho más y quedan menos tiernos. En altura, donde el agua hierve a menos temperatura, el tiempo se alarga y la olla a presión es muy recomendable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se cuece el arroz blanco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El arroz blanco de grano largo se cuece en 15-18 minutos con el doble de agua que de arroz, y conviene dejarlo reposar 5 minutos tapado al final. El basmati va más rápido (10-12 minutos) y el arroz integral necesita bastante más, entre 35 y 45 minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los tiempos de cocción cambian en altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En altura el agua hierve por debajo de los 100 °C, así que los alimentos cocidos en agua tardan más, sobre todo las legumbres. Cuanto mayor es la altitud, mayor es la diferencia, y por encima de los 2000 metros la olla a presión deja de ser opcional para garbanzos y carnes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las alubias rojas hay que hervirlas fuerte al principio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las alubias rojas crudas o poco cocidas contienen una lectina (fitohemaglutinina) que puede causar molestias digestivas. Por eso conviene remojarlas, desechar el agua y hervirlas a fuego fuerte unos 10 minutos al inicio de la cocción, lo que neutraliza esa sustancia. Después se sigue cociendo a fuego suave.',
      },
    },
  ],
};

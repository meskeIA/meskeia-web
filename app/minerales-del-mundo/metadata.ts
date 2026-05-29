import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Minerales del Mundo - Guía de 50 Minerales Esenciales | meskeIA',
  description: 'Explora 50 minerales esenciales con su composición química, dureza Mohs, sistema cristalino, usos industriales y curiosidades. Guía completa para estudiantes y curiosos.',
  keywords: 'minerales, mineralogía, geología, escala mohs, cristales, cuarzo, diamante, oro, pirita, calcita, feldespato, mica, silicatos, óxidos, sulfuros, carbonatos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Minerales del Mundo - Guía de 50 Minerales Esenciales',
    description: 'Explora 50 minerales esenciales con su composición, dureza, usos y curiosidades. Ideal para estudiantes de geología y curiosos.',
    url: 'https://meskeia.com/minerales-del-mundo/',
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
    title: 'Minerales del Mundo - Guía Completa',
    description: 'Explora 50 minerales esenciales con su composición, dureza, usos y curiosidades.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Minerales del Mundo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Minerales del Mundo",
  description: "Explora 50 minerales esenciales con su composición química, dureza Mohs, sistema cristalino, usos industriales y curiosidades. Guía completa para estudiantes y curiosos.",
  url: "https://meskeia.com/minerales-del-mundo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un mineral y en qué se diferencia de una roca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un mineral es una sustancia natural, inorgánica, con composición química definida y estructura cristalina ordenada. Una roca, en cambio, es un agregado de uno o varios minerales. Por ejemplo, el granito es una roca compuesta principalmente por cuarzo, feldespato y mica, que son tres minerales distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la escala de dureza de Mohs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala de Mohs mide la resistencia de un mineral a ser rayado por otro. Va del 1 (talco, muy blando) al 10 (diamante, el más duro conocido). Es una herramienta de identificación rápida en campo: si un mineral raya al vidrio (dureza 5,5) pero no al acero (6,5), su dureza está entre esos valores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los minerales más abundantes en la corteza terrestre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los silicatos son el grupo más abundante y representan aproximadamente el 90% de la corteza terrestre. Dentro de ellos destacan los feldespatos (oligoclasa, ortoclasa) y el cuarzo. Les siguen en abundancia los carbonatos (calcita, dolomita), los óxidos (magnetita, hematita) y los sulfuros (pirita, galena).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se clasifican los minerales según su composición química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los mineralogistas los agrupan en ocho clases principales: elementos nativos (oro, plata, cobre), sulfuros (pirita, galena), óxidos e hidróxidos (hematita, goethita), haluros (halita, fluorita), carbonatos (calcita, aragonita), fosfatos (apatito), sulfatos (yeso, barita) y silicatos. Los silicatos, por su variedad, tienen su propia subclasificación estructural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los usos industriales más importantes de los minerales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los minerales son la base de numerosas industrias. El cuarzo se usa en electrónica y óptica; la calcita, en la industria del cemento y papel; la magnetita y hematita, en producción de acero; el yeso, en construcción; la fluorita, en metalurgia y fabricación de ácido fluorhídrico; y los minerales de litio, en baterías de vehículos eléctricos y dispositivos móviles.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de los Idiomas del Mundo - Familias Lingüísticas | meskeIA',
  description: 'Descubre las grandes familias lingüísticas, los idiomas más hablados, las lenguas en peligro de extinción y curiosidades fascinantes. Explicador visual interactivo.',
  keywords: 'idiomas mundo, familias lingüísticas, lenguas peligro extinción, hablantes, diversidad lingüística, idiomas más hablados, lenguas en peligro, indoeuropeo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de los Idiomas del Mundo',
    description: 'Familias lingüísticas, los idiomas más hablados, lenguas en peligro y curiosidades. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-idiomas-mundo/',
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
    title: 'El Mapa de los Idiomas del Mundo',
    description: 'Más de 7.000 idiomas en el mundo: familias, hablantes, lenguas en peligro y curiosidades fascinantes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Idiomas del Mundo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de los Idiomas del Mundo',
  description: 'Explicador visual interactivo sobre los idiomas del mundo: las grandes familias lingüísticas, los idiomas más hablados por hablantes nativos y totales, las lenguas en peligro de extinción y curiosidades fascinantes sobre la diversidad lingüística.',
  url: 'https://meskeia.com/visualizador-idiomas-mundo/',
  features: [
    'Familias lingüísticas con bloques proporcionales por hablantes',
    'Top 10 idiomas más hablados: nativos vs segunda lengua',
    'Embudo de lenguas en peligro de extinción',
    'Curiosidades lingüísticas: alfabetos, tonos, clics',
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
      name: '¿Cuántos idiomas se hablan en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que en el mundo existen entre 6.500 y 7.000 idiomas vivos, dependiendo de los criterios usados para distinguir lengua de dialecto. La gran mayoría —más del 96%— son hablados por menos del 4% de la población mundial. Solo 23 idiomas concentran a más de la mitad de todos los hablantes del planeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué idioma tiene más hablantes nativos en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mandarín (chino estándar) es el idioma con más hablantes nativos, con aproximadamente 920 millones de personas. Le siguen el español (480 millones de nativos), el inglés (380 millones) y el hindi (340 millones). Si se cuentan también los hablantes de segunda lengua, el inglés pasa al primer puesto con más de 1.400 millones de hablantes totales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una familia lingüística?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una familia lingüística es un grupo de idiomas que comparten un ancestro común, llamado proto-lengua. Por ejemplo, el español, el francés, el portugués, el italiano y el rumano pertenecen a la familia indoeuropea, rama románica, todos descendientes del latín vulgar. La familia indoeuropea es la más extensa del mundo por número de hablantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas lenguas están en peligro de extinción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La UNESCO calcula que alrededor del 40% de los idiomas del mundo están en peligro de extinción, lo que supone unas 2.500-3.000 lenguas. Se considera que una lengua está en peligro cuando deja de transmitirse a los niños. Se extingue aproximadamente una lengua cada dos semanas, con especial concentración de pérdidas en Oceanía, América y África subsahariana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una lengua y un dialecto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distinción entre lengua y dialecto no es puramente lingüística, sino también política y social. La definición clásica dice que "una lengua es un dialecto con ejército y marina". Dos variedades mutuamente inteligibles pueden considerarse lenguas distintas por razones históricas (serbio y croata), mientras que variedades chinas muy distintas se agrupan bajo el término "chino". Los lingüistas prefieren hablar de variedades sin jerarquías.',
      },
    },
  ],
};

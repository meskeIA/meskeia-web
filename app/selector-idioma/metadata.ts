import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Idioma | ¿Qué Idioma Aprender? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué idioma extranjero aprender según tus objetivos: inglés, francés, alemán, portugués o chino/japonés.',
  keywords: [
    'qué idioma aprender',
    'idioma más útil',
    'inglés o alemán',
    'aprender idioma según trabajo',
    'idioma para viajar',
    'idioma más empleable España',
    'francés o portugués',
    'chino o japonés aprender',
    'idioma para negocios',
    'qué lengua estudiar',
  ],
  openGraph: {
    title: 'Selector de Idioma — ¿Qué Idioma Aprender?',
    description:
      'Descubre qué idioma extranjero se adapta mejor a tus objetivos en 10 preguntas.',
    url: 'https://meskeia.com/selector-idioma/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué idioma aprender? Test orientativo | meskeIA',
    description: 'Test de 10 preguntas para elegir entre inglés, francés, alemán, portugués o chino/japonés.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-idioma/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Idioma",
  description: "Test de 10 preguntas para saber qué idioma extranjero aprender según tus objetivos: inglés, francés, alemán, portugués o chino/japonés.",
  url: "https://meskeia.com/selector-idioma/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué idioma es más útil aprender para el trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El inglés sigue siendo el idioma más demandado en el mercado laboral global, especialmente en tecnología, finanzas, ciencia y comercio internacional. El alemán es muy valorado en sectores industriales, ingeniería y para trabajar en Europa central. El francés es útil en organismos internacionales, diplomacia y en África francófona. El mandarín gana peso en empresas con actividad en China y Asia oriental. La elección depende del sector profesional y del mercado geográfico al que se quiera acceder.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se necesita para aprender un idioma nuevo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el Foreign Service Institute de Estados Unidos, alcanzar un nivel profesional (C1) en idiomas cercanos al español como el portugués o el italiano requiere unas 600-750 horas de estudio. El francés y el alemán necesitan entre 750 y 900 horas. Los idiomas de mayor distancia lingüística como el chino mandarín o el japonés pueden requerir más de 2.200 horas. Con una hora diaria de práctica constante, los idiomas romances pueden alcanzarse en 2-3 años y el mandarín en 6-8 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es el portugués fácil de aprender para hispanohablantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el portugués es uno de los idiomas más accesibles para hispanohablantes por su proximidad lingüística: comparten raíz latina, estructura gramatical similar y un vocabulario con un 89% de semejanza léxica. Las mayores dificultades son la fonética (especialmente el portugués europeo) y algunos falsos amigos. Un hispanohablante motivado puede alcanzar un nivel B2 de portugués en 300-400 horas de estudio, el tiempo más corto entre los idiomas europeos más hablados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué idioma es mejor para viajar: francés, inglés o alemán?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El inglés es el idioma más útil para viajar a nivel mundial: funciona como lengua franca en la mayoría de destinos turísticos, desde el sudeste asiático hasta Escandinavia. El francés es especialmente práctico en Francia, Bélgica, Suiza, Canadá y gran parte del continente africano. El alemán es útil en Alemania, Austria y Suiza alemana. Si solo se va a aprender un idioma para viajar de forma global, el inglés ofrece la mayor cobertura geográfica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena aprender chino mandarín?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El chino mandarín es el idioma con más hablantes nativos del mundo (unos 920 millones) y su relevancia económica sigue creciendo. Sin embargo, es uno de los idiomas más difíciles para hispanohablantes por su sistema de escritura de caracteres, los cuatro tonos fonémicos y la ausencia de cognados con el español. Vale la pena si se tienen objetivos claros en comercio, tecnología o relaciones con China, o un fuerte interés cultural. Para la mayoría de perfiles, otros idiomas ofrecen mayor retorno a corto plazo.',
      },
    },
  ],
};

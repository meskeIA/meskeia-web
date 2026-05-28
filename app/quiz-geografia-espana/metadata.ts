import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Geografía de España — Provincias, Ríos, Montañas y CCAA | meskeIA',
  description:
    'Pon a prueba tus conocimientos de geografía española: 75 preguntas sobre provincias, capitales, ríos, montañas y comunidades autónomas. 3 dificultades, ideal para oposiciones.',
  keywords:
    'quiz geografia españa, test geografia española, provincias españa quiz, capitales provincias quiz, rios españa, comunidades autonomas quiz, oposiciones geografia, picos espana, costas espana',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Geografía de España — Provincias, Ríos, Montañas y CCAA',
    description:
      'Pon a prueba tus conocimientos de geografía española con 75 preguntas verificadas. Provincias, capitales, ríos, montañas y comunidades autónomas. 3 dificultades.',
    url: 'https://meskeia.com/quiz-geografia-espana/',
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
    title: 'Quiz Geografía de España',
    description:
      '¿Conoces todas las provincias, ríos y montañas de España? 75 preguntas en 3 niveles. ¡Pon a prueba tus conocimientos!',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Geografía de España",
  description: "Pon a prueba tus conocimientos de geografía española: 75 preguntas sobre provincias, capitales, ríos, montañas y comunidades autónomas. 3 dificultades, ideal para oposiciones.",
  url: "https://meskeia.com/quiz-geografia-espana/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas provincias tiene España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España tiene 50 provincias distribuidas en 17 comunidades autónomas y 2 ciudades autónomas (Ceuta y Melilla). Las provincias son la división administrativa de segundo nivel, por debajo de las comunidades autónomas y por encima de los municipios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el río más largo de España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Tajo es el río más largo de la Península Ibérica con unos 1.007 km, aunque gran parte de su recorrido discurre por Portugal. Dentro del territorio español, el Ebro es el río más caudaloso y el de mayor longitud íntegramente en España, con aproximadamente 930 km desde el Cantábrico hasta el Mediterráneo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar geografía de España en oposiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La geografía de España es un bloque habitual en oposiciones a la Administración Pública (Correos, Policía Nacional, Guardia Civil, auxiliares administrativos del Estado), así como en la Selectividad (EBAU). Conocer provincias, capitales, ríos, sierras y comunidades autónomas permite superar los temarios de cultura general y geografía regional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el pico más alto de España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Teide (Tenerife, Canarias) es el punto más alto de España con 3.715 metros sobre el nivel del mar. En la Península Ibérica, el pico más elevado es el Mulhacén (Sierra Nevada, Granada) con 3.479 metros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas comunidades autónomas hay en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'España tiene 17 comunidades autónomas y 2 ciudades autónomas (Ceuta y Melilla), totalizando 19 entidades autonómicas. Cada comunidad tiene su propio estatuto de autonomía, parlamento y gobierno regional, aunque comparten las instituciones del Estado central.',
      },
    },
  ],
};

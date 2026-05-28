import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Países y Capitales del Mundo - Adivina la Capital | meskeIA',
  description: 'Pon a prueba tus conocimientos de geografía: adivina las capitales del mundo, identifica países por su bandera y mucho más. 195 países, 3 modos de juego, 5 dificultades.',
  keywords: 'quiz paises capitales, adivinar capital, quiz geografia, capitales mundo, banderas paises, quiz banderas, juego geografia, aprender capitales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Países y Capitales del Mundo | meskeIA',
    description: 'Adivina capitales, identifica banderas y demuestra tus conocimientos de geografía. 195 países, sin registro.',
    url: 'https://meskeia.com/quiz-paises-capitales/',
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
    title: 'Quiz Países y Capitales del Mundo | meskeIA',
    description: 'Pon a prueba tu geografía: capitales, banderas y más. 195 países, sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Países y Capitales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Países y Capitales",
  description: "Pon a prueba tus conocimientos de geografía: adivina las capitales del mundo, identifica países por su bandera y mucho más. 195 países, 3 modos de juego, 5 dificultades.",
  url: "https://meskeia.com/quiz-paises-capitales/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos países y capitales hay que aprender en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay 195 países reconocidos internacionalmente, cada uno con su capital. Algunas capitales pueden resultar sorprendentes: por ejemplo, la capital de Australia es Canberra (no Sídney), la de Brasil es Brasilia (no Río de Janeiro) y la de Sudáfrica está dividida entre tres ciudades: Pretoria, Ciudad del Cabo y Bloemfontein.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo aprender las capitales del mundo de forma efectiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más efectiva de memorizar capitales es mediante la práctica activa con preguntas de opción múltiple, que obliga al cerebro a recuperar la información en lugar de simplemente releerla. Practicar en sesiones cortas y frecuentes, agrupando países por región geográfica, mejora significativamente la retención a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un quiz de capitales y uno de banderas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un quiz de capitales se muestra el nombre del país y se pide identificar su capital entre varias opciones. En un quiz de banderas se muestra la imagen de la bandera y hay que adivinar a qué país pertenece. Ambos modos entrenan habilidades distintas: memoria textual en el primero y reconocimiento visual en el segundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este tipo de quiz de geografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este tipo de quiz es útil para estudiantes de educación secundaria que preparan exámenes de geografía, para adultos que quieren mantener activa su cultura general, para viajeros que desean ampliar su conocimiento del mundo y para cualquier persona que disfrute de los juegos de conocimiento y trivia internacional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las capitales más difíciles de recordar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las capitales consideradas más difíciles son las de países poco conocidos o con nombres complejos: Nur-Sultán (Kazajistán), Naypyidaw (Myanmar), Yamoussoukro (Costa de Marfil) o Malabo (Guinea Ecuatorial). También confunden las capitales que no coinciden con la ciudad más grande o famosa del país, como Canberra, Brasilia o Astana.',
      },
    },
  ],
};

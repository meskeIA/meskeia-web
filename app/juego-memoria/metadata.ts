import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego de Memoria - Encuentra las Parejas | meskeIA',
  description: 'Entrena tu memoria encontrando parejas de cartas. Diferentes niveles de dificultad y estadísticas de tiempo. Gratis y sin registro.',
  keywords: 'memoria, juego, parejas, cartas, concentracion, brain training, emojis, online, gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/juego-memoria/',
  },
  openGraph: {
    type: 'website',
    title: 'Juego de Memoria - Encuentra las Parejas | meskeIA',
    description: 'Entrena tu memoria encontrando parejas de cartas.',
    url: 'https://meskeia.com/juego-memoria/',
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
    title: 'Juego de Memoria - meskeIA',
    description: 'Entrena tu memoria con este juego de parejas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Juego de Memoria',
  description: 'Juego clásico de memoria: encuentra todas las parejas de cartas en el menor tiempo posible. Varios niveles de dificultad y estadísticas de tiempo. Ejercita la memoria y la concentración.',
  url: 'https://meskeia.com/juego-memoria/',
  category: 'EducationalApplication',
  features: [
    'Tres niveles de dificultad (fácil, medio, difícil)',
    'Cronómetro y contador de movimientos',
    'Estadísticas guardadas localmente',
    'Diferentes temas visuales (emojis, animales, frutas)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['juego memoria', 'parejas', 'concentración', 'brain training', 'juego online'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿En qué consiste el juego de memoria de parejas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El juego de memoria de parejas consiste en voltear cartas boca arriba de dos en dos para encontrar las que tienen el mismo símbolo o imagen. Todas las cartas empiezan boca abajo y el objetivo es descubrir todas las parejas en el menor número de movimientos y tiempo posible. Es uno de los juegos de concentración más populares del mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Ayuda realmente el juego de memoria a mejorar la memoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, de forma moderada. El juego entrena la memoria de trabajo a corto plazo y la atención sostenida, ya que obliga a recordar posiciones de cartas durante toda la partida. Estudios en psicología cognitiva señalan que ejercicios de este tipo pueden ayudar a mantener ágil la memoria visual, especialmente en niños y adultos mayores. No sustituye una rutina de estimulación cognitiva completa, pero es una práctica agradable y accesible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué edad es adecuado el juego de parejas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El juego de parejas es adecuado a partir de los 3-4 años con tableros pequeños (6-8 cartas), y en versión digital a partir de los 5-6 años. Es muy utilizado en educación infantil y primaria por su sencillez y valor educativo. Los adultos también lo disfrutan como pasatiempo y como ejercicio de estimulación mental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los niveles de dificultad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El nivel fácil usa un tablero reducido con pocas parejas, ideal para iniciarse o para niños pequeños. El nivel medio aumenta el número de cartas, requiriendo recordar más posiciones. El nivel difícil usa el tablero completo con el mayor número de parejas, desafiando incluso a jugadores experimentados. La dificultad aumenta de forma progresiva tanto en número de cartas como en la necesidad de concentración.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se guardan las puntuaciones entre partidas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, las estadísticas de tiempo y movimientos se guardan localmente en el navegador mediante localStorage, por lo que persisten entre sesiones sin necesidad de cuenta ni registro. Esto permite comparar tu rendimiento con partidas anteriores y tratar de superar tu propio récord. Los datos permanecen en tu dispositivo y no se envían a ningún servidor.',
      },
    },
  ],
};

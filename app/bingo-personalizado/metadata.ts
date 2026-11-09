import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Bingo Personalizado para Imprimir: Multiplicaciones, Inglés, Palabras y Lista Propia - meskeIA',
  description:
    'Crea cartones de bingo con tus propias palabras o con juegos ya hechos: tablas de multiplicar, sumas, inglés, capitales, animales o Navidad. El bombo canta la pregunta y el cartón lleva la respuesta.',
  keywords:
    'bingo personalizado, bingo de palabras, bingo de multiplicaciones, bingo de tablas de multiplicar, bingo en inglés, lotería de multiplicaciones, bingo para el aula, bingo educativo, bingo de animales, bingo de navidad para imprimir, cartones de bingo con palabras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Bingo Personalizado: Multiplicaciones, Inglés, Palabras y Lista Propia',
    description:
      'Cartones de bingo con tus palabras o con juegos ya hechos para clase y para casa. El bombo canta «7 × 8» y en el cartón está el 56.',
    url: 'https://meskeia.com/bingo-personalizado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bingo Personalizado para Imprimir',
    description: 'Cartones con tus palabras, tablas de multiplicar, inglés o Navidad, con bombo digital.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Bingo Personalizado meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Bingo Personalizado',
  description:
    'Generador de cartones de bingo con contenido propio o precargado. En los juegos de clase el bombo canta una pregunta (7 × 8, gato, Perú) y el cartón lleva la respuesta (56, cat, Lima); en los de casa se canta lo mismo que hay en el cartón. Cartones imprimibles en seis tamaños y bombo digital con comprobación de cartones.',
  url: 'https://meskeia.com/bingo-personalizado/',
  category: 'EducationalApplication',
  features: [
    'Nueve juegos ya hechos: tablas de multiplicar, sumas y restas hasta 20 y hasta 100, inglés, países y capitales, símbolos químicos, animales, frutas y comida, y Navidad',
    'Lista propia: una palabra por línea, o «pregunta = respuesta» para que el bombo cante una cosa y el cartón lleve otra',
    'Seis tamaños de cartón: de 3 filas (3×3, 3×4, 3×5, 3×6) o cuadrados (4×4, 5×5)',
    'La partida pone en juego el doble de casillas que tiene un cartón, para que dure lo mismo con cualquier lista',
    'Bombo digital con historial y respuestas que se pueden ocultar al proyectar',
    'Comprobación de cualquier cartón por su número: dice si tiene línea o cartón lleno',
    'El mismo número de partida vuelve a imprimir los mismos cartones',
    'Funciona en el navegador, sin registro: la lista no sale de tu dispositivo',
  ],
});

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo funciona un bingo de multiplicaciones o de vocabulario?',
    answer:
      'El bombo no canta lo que está en el cartón, sino una pregunta cuya respuesta sí está: canta «7 × 8» y quien tenga el 56 lo tacha; canta «gato» y quien tenga «cat» lo tacha. Para saber si tienen la casilla, todos los jugadores tienen que resolver cada pregunta, no solo el que contesta. En los juegos de casa, como animales o Navidad, se canta lo mismo que está en el cartón.',
  },
  {
    question: '¿Puedo hacer un bingo con mis propias palabras?',
    answer:
      'Sí. Elige «Lista propia» y escribe una palabra por línea. Si quieres que el bombo cante una cosa y el cartón lleve otra, escribe «pregunta = respuesta», por ejemplo «capital de Perú = Lima». Las líneas repetidas se descartan solas y la lista no sale de tu navegador.',
  },
  {
    question: '¿Cuántas palabras necesito para un cartón de bingo?',
    answer:
      'Al menos una vez y media las casillas del cartón: 14 para un 3×3, 23 para un 3×5 y 38 para un 5×5. Lo ideal es el doble, que es lo que la app pone en juego cada partida. Con menos palabras los cartones se parecen tanto que cantan bingo varios jugadores a la vez, y por eso la app no ofrece los tamaños que tu lista no puede llenar.',
  },
  {
    question: '¿Cuánto dura una partida de bingo personalizado?',
    answer:
      'Depende sobre todo de cómo se gane. En un cartón de 3×5 con 25 jugadores, la primera línea sale hacia la bola 13 y el primer cartón lleno hacia la 26 de 30, según una simulación de 3.000 partidas. En clase, si cada pregunta lleva unos 20 segundos, una partida a línea dura unos 4 minutos y una a cartón lleno, unos 9.',
  },
  {
    question: '¿En qué se diferencia de un bingo normal de 90 o 75 bolas?',
    answer:
      'El bingo de números reparte del 1 al 90 o al 75 con reglas fijas por columna y deja huecos en el cartón. Aquí las casillas son palabras o resultados, todas van llenas, la línea es siempre una fila horizontal y no hay casilla libre. Si lo que buscas son los cartones clásicos de números, están en el generador de cartones de bingo de meskeIA.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

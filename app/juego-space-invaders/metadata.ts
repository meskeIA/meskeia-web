import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego Space Invaders - Arcade Clásico en Español | meskeIA',
  description: 'Juega al clásico Space Invaders online gratis. Defiende la Tierra de la invasión alienígena. Juego arcade retro con controles de teclado y récords.',
  keywords: 'space invaders, juego, arcade, clasico, retro, aliens, invasores, disparos, gratis, online, español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego Space Invaders - Arcade Clásico | meskeIA',
    description: 'Juega al clásico Space Invaders online gratis. Defiende la Tierra de los invasores.',
    url: 'https://meskeia.com/juego-space-invaders/',
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
    title: 'Juego Space Invaders - Arcade Clásico | meskeIA',
    description: 'Juega al clásico Space Invaders online gratis. Defiende la Tierra.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Space Invaders",
  description: "Juega al clásico Space Invaders online gratis. Defiende la Tierra de la invasión alienígena. Juego arcade retro con controles de teclado y récords.",
  url: "https://meskeia.com/juego-space-invaders/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es Space Invaders y cómo se juega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Space Invaders es un clásico juego arcade de 1978 donde controlas una nave espacial que debe disparar y destruir oleadas de alienígenas que descienden progresivamente. Se juega con las teclas de flecha izquierda y derecha para moverse, y la barra espaciadora para disparar. El objetivo es eliminar todos los invasores antes de que lleguen al suelo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo para jugar a Space Invaders online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, el juego funciona directamente en el navegador sin ninguna instalación. Está desarrollado en JavaScript y Canvas HTML5, por lo que es compatible con cualquier navegador moderno como Chrome, Firefox, Edge o Safari. Solo necesitas una conexión a internet para cargarlo la primera vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se aumenta la dificultad en Space Invaders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dificultad aumenta automáticamente a medida que eliminás invasores: cuantos menos alienígenas quedan en pantalla, más rápido se mueven. En las versiones originales arcade, los invasores también aceleran al descender. Superar una oleada completa da paso a una nueva ronda más difícil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué edades es adecuado este juego?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Space Invaders es apto para todas las edades. Es un juego de habilidad y reflejos sin contenido violento explícito, con mecánicas simples que lo hacen accesible desde los 6-7 años en adelante. Es especialmente popular entre adultos que lo jugaron en los años 80 y quieren revivir la experiencia retro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Space Invaders y otros juegos de disparos arcade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Space Invaders fue pionero en introducir el sistema de oleadas de enemigos con movimiento en grupo, los escudos destructibles y la presión de tiempo creciente. A diferencia de juegos como Galaga, donde los enemigos hacen pasadas individuales, en Space Invaders toda la formación avanza junta hacia el jugador, creando una tensión táctica distinta.',
      },
    },
  ],
};

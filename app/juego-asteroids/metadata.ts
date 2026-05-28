import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego Asteroids - Arcade Clásico en Español | meskeIA',
  description: 'Juega al clásico Asteroids online gratis. Controla tu nave, destruye asteroides y OVNIs. Juego arcade retro con controles de teclado y récords locales.',
  keywords: 'asteroids, juego, arcade, clasico, retro, nave espacial, asteroides, ovni, gratis, online, español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego Asteroids - Arcade Clásico | meskeIA',
    description: 'Juega al clásico Asteroids online gratis. Destruye asteroides y OVNIs con tu nave espacial.',
    url: 'https://meskeia.com/juego-asteroids/',
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
    title: 'Juego Asteroids - Arcade Clásico | meskeIA',
    description: 'Juega al clásico Asteroids online gratis. Destruye asteroides y OVNIs.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Asteroids",
  description: "Juega al clásico Asteroids online gratis. Controla tu nave, destruye asteroides y OVNIs. Juego arcade retro con controles de teclado y récords locales.",
  url: "https://meskeia.com/juego-asteroids/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el juego Asteroids y cuál es su origen?',
      acceptedAnswer: { '@type': 'Answer', text: 'Asteroids es un juego arcade clásico lanzado originalmente por Atari en 1979. El jugador controla una nave espacial que debe destruir asteroides y naves enemigas (OVNIs) usando disparos, mientras evita las colisiones. Fue uno de los juegos más populares de la época dorada de los arcades y sigue siendo un referente del género.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se controla la nave en Asteroids?',
      acceptedAnswer: { '@type': 'Answer', text: 'La nave se controla con el teclado: las teclas de flecha izquierda y derecha giran la nave, la flecha arriba activa el propulsor para avanzar, y la barra espaciadora dispara. La física del juego aplica inercia real: la nave sigue deslizándose en la dirección del último impulso hasta que se corrige manualmente.' },
    },
    {
      '@type': 'Question',
      name: '¿Se guarda la puntuación más alta entre partidas?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí, el récord local se almacena en el navegador mediante localStorage, por lo que persiste entre sesiones sin necesidad de crear una cuenta. El récord se mantiene en el mismo dispositivo y navegador; si borras los datos del navegador o juegas desde otro dispositivo, comenzará desde cero.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se puntúa en Asteroids y qué valen los distintos objetivos?',
      acceptedAnswer: { '@type': 'Answer', text: 'En la versión clásica, los asteroides grandes valen menos puntos que los medianos y pequeños (al fragmentarse aumenta la dificultad y la recompensa). Los OVNIs son objetivos especiales que aparecen periódicamente y otorgan puntos extra al destruirlos, pero disparan de vuelta, por lo que requieren más habilidad.' },
    },
    {
      '@type': 'Question',
      name: '¿Es necesario instalar algo para jugar en el navegador?',
      acceptedAnswer: { '@type': 'Answer', text: 'No se necesita ninguna instalación. El juego funciona directamente en el navegador web usando tecnología HTML5 Canvas, compatible con los navegadores modernos en ordenadores de escritorio. No requiere plugins adicionales como Flash ni registro de cuenta.' },
    },
  ],
};

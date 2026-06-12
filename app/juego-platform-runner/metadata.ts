import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego Platform Runner - Plataformas en Español | meskeIA',
  description: 'Juega a Platform Runner online gratis. Corre, salta, recolecta monedas y derrota enemigos. Juego de plataformas con niveles progresivos y récords.',
  keywords: 'platform runner, juego, plataformas, saltar, monedas, enemigos, niveles, gratis, online, español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego Platform Runner - Plataformas | meskeIA',
    description: 'Juega a Platform Runner online gratis. Corre, salta y recolecta monedas.',
    url: 'https://meskeia.com/juego-platform-runner/',
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
    title: 'Juego Platform Runner - Plataformas | meskeIA',
    description: 'Juega a Platform Runner online gratis. Supera todos los niveles.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Platform Runner",
  description: "Juega a Platform Runner online gratis. Corre, salta, recolecta monedas y derrota enemigos. Juego de plataformas con niveles progresivos y récords.",
  url: "https://meskeia.com/juego-platform-runner/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es Platform Runner y cómo se juega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Platform Runner es un juego de plataformas en el que controlas un personaje que corre, salta, recolecta monedas y derrota enemigos superando niveles de dificultad progresiva. Se juega con las teclas de flecha (movimiento) y la barra espaciadora para saltar. El objetivo es llegar al final de cada nivel recolectando el mayor número de monedas posible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo para jugar a Platform Runner en el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No se necesita instalar nada. El juego está construido con JavaScript y Canvas HTML5, por lo que funciona directamente en cualquier navegador moderno sin plugins ni descargas adicionales. Es completamente gratuito y no requiere registro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se derrotan los enemigos en Platform Runner?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los enemigos se derrota saltando sobre ellos, al estilo de los juegos de plataformas clásicos. Si el personaje cae desde arriba sobre un enemigo, lo elimina y suma puntos. Tocar a un enemigo de frente o por los lados hace que el jugador pierda una vida, por lo que el posicionamiento y el timing del salto son clave.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué edades es adecuado Platform Runner?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Platform Runner es apto para todas las edades. Sus mecánicas sencillas lo hacen accesible desde los 6-7 años, mientras que la dificultad progresiva lo mantiene entretenido para jugadores adultos. No contiene contenido violento ni temáticas para adultos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace diferentes a los juegos de plataformas respecto a otros géneros arcade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los juegos de plataformas combinan habilidad de movimiento, exploración y resolución de obstáculos espaciales, a diferencia de los shooters arcade que se centran solo en disparar. La mecánica de saltar entre plataformas, evitar huecos y gestionar la inercia del personaje exige coordinación y planificación a corto plazo, lo que los convierte en uno de los géneros más duraderos de la historia de los videojuegos.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Piedra Papel Tijera - Juego Clásico Online | meskeIA',
  description: 'Juega al clásico Piedra, Papel o Tijera contra la computadora. Estadísticas de partidas, rachas y historial. Gratis y sin registro.',
  keywords: 'piedra papel tijera, juego, clasico, online, gratis, computadora, rps, rock paper scissors',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Piedra Papel Tijera - Juego Clásico | meskeIA',
    description: 'Juega al clásico Piedra, Papel o Tijera contra la computadora.',
    url: 'https://meskeia.com/juego-piedra-papel-tijera/',
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
    title: 'Piedra Papel Tijera - meskeIA',
    description: 'Juego clásico contra la computadora.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Piedra Papel Tijera",
  description: "Juega al clásico Piedra, Papel o Tijera contra la computadora. Estadísticas de partidas, rachas y historial. Gratis y sin registro.",
  url: "https://meskeia.com/juego-piedra-papel-tijera/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se juega al piedra, papel o tijera?',
      acceptedAnswer: { '@type': 'Answer', text: 'Cada jugador elige simultáneamente una de tres opciones: piedra, papel o tijera. La piedra gana a la tijera (la aplasta), la tijera gana al papel (lo corta) y el papel gana a la piedra (la envuelve). Si ambos eligen lo mismo, hay empate.' },
    },
    {
      '@type': 'Question',
      name: '¿Puede la computadora ganar siempre al piedra papel tijera?',
      acceptedAnswer: { '@type': 'Answer', text: 'No siempre, pero la computadora puede aprender patrones si juega de forma aleatoria pura o adapta su estrategia. En este juego la elección de la computadora es aleatoria, lo que garantiza una probabilidad de victoria del 33 % para cada bando en el largo plazo.' },
    },
    {
      '@type': 'Question',
      name: '¿Existe alguna estrategia para ganar más al piedra papel tijera?',
      acceptedAnswer: { '@type': 'Answer', text: 'Contra humanos, algunas tácticas conocidas son elegir la opción que derrota lo que el rival acaba de usar (los jugadores tienden a repetir ganadores) o variar aleatoriamente para ser impredecible. Contra una computadora con elección aleatoria pura no existe estrategia que mejore el 33 % de victorias esperado.' },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve jugar al piedra papel tijera online?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sirve para entretenimiento rápido, pasar el tiempo o practicar decisiones de azar y probabilidad de forma intuitiva. También se usa como herramienta educativa para introducir conceptos básicos de teoría de juegos, como equilibrios de Nash, a estudiantes de matemáticas o economía.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el piedra papel tijera clásico y las variantes ampliadas?',
      acceptedAnswer: { '@type': 'Answer', text: 'El juego clásico tiene 3 gestos y 3 relaciones de victoria. Las variantes ampliadas, como "Piedra Papel Tijera Lagarto Spock" (popularizada por la serie The Big Bang Theory), añaden 5 gestos y 10 relaciones, reduciendo la probabilidad de empate del 33 % al 20 % y aumentando la variedad de partidas.' },
    },
  ],
};

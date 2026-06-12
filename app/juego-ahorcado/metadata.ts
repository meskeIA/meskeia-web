import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego del Ahorcado en Español - Adivina la Palabra | meskeIA',
  description: 'Juega al clásico juego del ahorcado en español. 4 categorías: animales, países, profesiones y vocabulario. Sin registro, sin publicidad, 100% local.',
  keywords: 'ahorcado, juego ahorcado, adivinar palabra, juego letras, juego español, juego educativo, vocabulario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego del Ahorcado en Español | meskeIA',
    description: 'Adivina la palabra letra a letra. 4 categorías temáticas, sin publicidad, sin registro.',
    url: 'https://meskeia.com/juego-ahorcado/',
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
    title: 'Juego del Ahorcado en Español | meskeIA',
    description: 'Adivina la palabra letra a letra. 4 categorías temáticas, sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Juego del Ahorcado meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego del Ahorcado",
  description: "Juega al clásico juego del ahorcado en español. 4 categorías: animales, países, profesiones y vocabulario. Sin registro, sin publicidad, 100% local.",
  url: "https://meskeia.com/juego-ahorcado/",
  category: 'EducationalApplication',
  features: [
    '4 categorías temáticas: animales, países, profesiones y vocabulario',
    'Teclado virtual interactivo con marcado de letras correctas e incorrectas',
    'Estadísticas de partidas, victorias, racha actual y mejor racha',
    'Dibujo del ahorcado progresivo según los errores (hasta 6 fallos)',
    'Accesibilidad con etiquetas ARIA y anuncios en tiempo real (aria-live)',
    '100% local en el navegador, sin registro, sin publicidad y sin conexión necesaria',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el juego del ahorcado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorcado es un juego de adivinanza de palabras en el que el jugador debe descubrir una palabra oculta proponiendo letras una a una. Por cada letra incorrecta se dibuja una parte del cuerpo de un muñeco colgado. El objetivo es adivinar la palabra completa antes de que el dibujo quede terminado, lo que ocurre tras 6 fallos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas categorías tiene el juego del ahorcado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El juego incluye 4 categorías temáticas: animales, países, profesiones y vocabulario general en español. Cada categoría contiene un conjunto de palabras de dificultad variada, lo que permite practicar distintos campos léxicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve jugar al ahorcado en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorcado es especialmente útil para ampliar vocabulario, mejorar la ortografía y practicar el español como lengua extranjera. También desarrolla el razonamiento lógico, ya que el jugador debe deducir la palabra a partir de las letras ya descubiertas y las pistas del contexto temático.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito registrarme o instalar algo para jugar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El juego funciona completamente en el navegador, sin registro, sin publicidad y sin necesidad de instalar ninguna aplicación. Todo el procesamiento es local, por lo que también funciona sin conexión a internet una vez cargada la página.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos intentos fallidos se permiten antes de perder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se permiten hasta 6 errores antes de que el juego termine. Cada letra incorrecta añade una parte al dibujo del ahorcado: cabeza, cuerpo, brazo izquierdo, brazo derecho, pierna izquierda y pierna derecha. Al sexto fallo se revela la palabra correcta.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Calendario de Liga o Fixture (Todos contra Todos) | meskeIA',
  description:
    'Crea el calendario de una liga de todos contra todos en segundos: jornadas equilibradas, ida y vuelta, descansos y tabla de clasificación en blanco para imprimir.',
  keywords:
    'generador calendario liga, fixture todos contra todos, rol de juegos, calendario torneo, round robin, sorteo jornadas liga, calendario futbol sala, liga padel amigos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Calendario de Liga (Fixture)',
    description:
      'Escribe los participantes y obtén todas las jornadas de una liga de todos contra todos, con ida y vuelta y tabla de clasificación imprimible.',
    url: 'https://meskeia.com/generador-calendario-liga',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Calendario de Liga o Fixture',
    description: 'Todos contra todos, con jornadas equilibradas y hoja de clasificación.',
  },
  other: {
    'application-name': 'Generador de Calendario de Liga meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Calendario de Liga',
  description:
    'Generador de calendarios de liga de todos contra todos (round robin o fixture) para cualquier deporte o juego. Reparte los enfrentamientos en jornadas equilibradas, gestiona los descansos cuando el número de participantes es impar y genera una tabla de clasificación en blanco para imprimir.',
  url: 'https://meskeia.com/generador-calendario-liga/',
  category: 'UtilityApplication',
  features: [
    'Todos contra todos: cada participante se enfrenta una vez a cada rival',
    'Modalidad de solo ida o de ida y vuelta',
    'Gestión automática del descanso cuando el número de participantes es impar',
    'Alternancia de local y visitante entre jornadas',
    'Sorteo reproducible mediante número de sorteo',
    'Tabla de clasificación en blanco lista para rellenar a mano',
    'De 3 a 24 participantes',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas jornadas tiene una liga de todos contra todos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con un número par de participantes hacen falta tantas jornadas como participantes menos uno: ocho equipos juegan siete jornadas. Con número impar hacen falta tantas jornadas como participantes, porque en cada una descansa uno. A ida y vuelta, esas cifras se duplican.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos partidos se juegan en total?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El total de enfrentamientos de una liga a una vuelta es n × (n − 1) ÷ 2. Con 8 participantes son 28 partidos; con 12, sesenta y seis. El número crece muy rápido, por lo que a partir de doce o catorce participantes conviene valorar dividir en grupos en lugar de jugar una liga única.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si somos un número impar de participantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se añade un puesto ficticio de descanso, de modo que en cada jornada hay exactamente un participante que no juega. El sistema reparte los descansos para que a cada uno le toque una sola vez a lo largo de la primera vuelta, sin que nadie descanse dos veces mientras otro no lo ha hecho ninguna.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se reparte quién juega en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El calendario alterna la condición de local entre jornadas para que nadie encadene demasiados partidos seguidos fuera. En la vuelta se invierten todos los enfrentamientos, de forma que cada pareja se mide una vez en cada campo y el reparto queda equilibrado al terminar la liga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede repetir exactamente el mismo sorteo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Cada calendario lleva un número de sorteo que determina el orden inicial de los participantes. Anotándolo y volviendo a introducirlo con la misma lista se obtiene el mismo calendario, lo que resulta útil para reimprimir la hoja o para demostrar que el sorteo no se ha rehecho a mitad de temporada.',
      },
    },
  ],
};

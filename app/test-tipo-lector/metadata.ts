import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test: ¿Qué tipo de lector eres? — Descubre tu perfil | meskeIA',
  description: 'Descubre tu arquetipo lector: ¿eres El Detective, El Explorador, El Empático, El Esteta o El Pensador? 8 preguntas, resultado con géneros y lecturas adaptadas a tu perfil.',
  keywords: 'test lector, perfil lector, que tipo de lector soy, arquetipos lector, generos literarios, test literario, recomendaciones lectura, lector perfil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué tipo de lector eres? | meskeIA',
    description: 'Descubre tu perfil lector: El Detective, El Explorador, El Empático, El Esteta o El Pensador.',
    url: 'https://meskeia.com/test-tipo-lector',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué tipo de lector eres? | meskeIA',
    description: '8 preguntas para descubrir tu arquetipo lector con géneros y lecturas recomendadas.',
  },
  other: {
    'application-name': 'Test Tipo de Lector meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test: ¿Qué tipo de lector eres?',
  description: 'Test de perfil lector de 8 preguntas que determina tu arquetipo: Detective, Explorador, Empático, Esteta o Pensador. Incluye géneros favoritos, autores emblema y lecturas recomendadas.',
  url: 'https://meskeia.com/test-tipo-lector/',
  category: 'EducationalApplication',
  features: [
    '8 preguntas de perfil lector con 5 opciones cada una',
    '5 arquetipos lector con descripción detallada',
    'Géneros literarios asociados a cada perfil',
    'Autores emblema y lecturas recomendadas por arquetipo',
    'Resultado compartible con descripción personalizada',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de lector existen y cómo sé cuál soy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen múltiples formas de clasificar los perfiles lectores. Este test identifica cinco arquetipos: El Detective (amante de la trama y los giros), El Explorador (curioso por mundos y culturas nuevas), El Empático (enganchado a los personajes y emociones), El Esteta (que disfruta del estilo y el lenguaje) y El Pensador (que busca ideas y reflexión). Las 8 preguntas del test analizan tus motivaciones, hábitos y preferencias para determinar tu arquetipo principal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este test de otros tests de personalidad lectora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de los tests genéricos de "género favorito", este analiza motivaciones lectoras profundas: por qué lees, qué buscas en una historia, cómo reaccionas ante los personajes o el estilo del autor. El resultado no solo nombra tu arquetipo, sino que incluye géneros afines, autores emblema de ese perfil y recomendaciones de lectura concretas adaptadas a tus respuestas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué géneros literarios corresponden a cada arquetipo lector?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Detective se orienta al thriller, la novela negra y el misterio. El Explorador disfruta de la ciencia ficción, la fantasía épica y la literatura de viajes. El Empático se inclina por la ficción literaria contemporánea y las novelas de formación. El Esteta prefiere la poesía, el ensayo y la prosa de autor cuidada. El Pensador busca la no ficción, el ensayo filosófico y la ciencia divulgativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo tener características de más de un arquetipo lector?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los perfiles no son excluyentes. El test determina tu arquetipo predominante en función de la suma de tus respuestas, pero muchos lectores combinan rasgos de dos o más perfiles: un lector puede ser principalmente Empático con fuerte componente Pensador. Si tu resultado te parece mixto, es porque probablemente lo es: los arquetipos son orientaciones, no categorías rígidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer mi perfil lector?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer tu perfil lector ayuda a elegir libros con más acierto, reducir el abandono de lecturas que no conectan contigo y descubrir géneros o autores que quizás no habrías explorado. También es útil para educadores y bibliotecarios que quieran recomendar lecturas personalizadas. El test tarda menos de 3 minutos y el resultado incluye sugerencias concretas de títulos y autores.',
      },
    },
  ],
};

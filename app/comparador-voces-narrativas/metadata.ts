import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Voces Narrativas — Estilos de Grandes Novelistas | meskeIA',
  description: 'Compara el estilo narrativo de los grandes novelistas: Flaubert, Proust, Kafka, Woolf, Hemingway, García Márquez, Borges y más. Dimensiones del estilo, técnicas y fragmentos representativos.',
  keywords: 'voz narrativa, estilo literario, comparar autores, flaubert proust, stream of consciousness, realismo magico, estilo indirecto libre, técnicas narrativas, modernismo, realismo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Voces Narrativas | meskeIA',
    description: 'Compara el estilo, técnicas y fragmentos de los grandes novelistas de la historia.',
    url: 'https://meskeia.com/comparador-voces-narrativas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparador de Voces Narrativas | meskeIA',
    description: 'Flaubert vs Proust, Woolf vs Hemingway, Borges vs García Márquez: compara estilos en profundidad.',
  },
  other: {
    'application-name': 'Comparador de Voces Narrativas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Comparador de Voces Narrativas',
  description: 'Herramienta educativa interactiva para comparar el estilo narrativo de 10 grandes novelistas: dimensiones del estilo, técnicas literarias y fragmentos representativos atribuidos.',
  url: 'https://meskeia.com/comparador-voces-narrativas/',
  category: 'EducationalApplication',
  features: [
    '10 novelistas de distintas épocas, países y movimientos literarios',
    'Comparación de 5 dimensiones del estilo con visualización de barras',
    'Fragmentos representativos con análisis de cada técnica',
    'Lista de técnicas narrativas clave por autor',
    'Análisis automático de similitudes y contrastes',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la voz narrativa en literatura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La voz narrativa es el conjunto de rasgos que hacen reconocible el estilo de un escritor: el ritmo de las frases, la selección léxica, el manejo del tiempo, la distancia emocional con los personajes y las técnicas que emplea. No es solo "desde dónde" se narra (primera, segunda o tercera persona) sino el "cómo" global que hace inconfundible a un autor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el estilo de Hemingway y el de Proust?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hemingway es conocido por su estilo iceberg: frases cortas, diálogos secos, emoción contenida y significado implícito bajo la superficie. Proust es el polo opuesto: frases de párrafos enteros, digresiones sensoriales, flujo de conciencia y análisis minucioso de la memoria y el tiempo. Ambos son influyentes precisamente porque representan extremos opuestos del espectro estilístico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el estilo indirecto libre en narrativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estilo indirecto libre mezcla la voz del narrador con los pensamientos o sentimientos del personaje sin usar verbos de reporte ("pensó que", "se dijo"). El lector accede a la interioridad del personaje sin que el narrador señale explícitamente el cambio. Flaubert lo popularizó en "Madame Bovary" y es una de las técnicas más imitadas en la narrativa realista moderna.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tienen en común Kafka y Borges como narradores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos construyen mundos donde lo fantástico o absurdo convive con una prosa precisa y casi burocrática. Kafka usa esa frialdad para amplificar la angustia existencial; Borges la emplea para explorar paradojas filosóficas sobre el tiempo, el infinito y la identidad. Los dos prescinden del realismo psicológico convencional en favor de la idea como motor narrativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo desarrollar mi propia voz como escritor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La voz propia se desarrolla leyendo ampliamente y escribiendo con regularidad. Estudiar cómo los grandes autores resuelven problemas concretos (ritmo, punto de vista, gestión del tiempo) te da un repertorio técnico. Con el tiempo, la combinación de tus influencias, tu experiencia vital y tus elecciones conscientes produce una voz reconocible. Comparar estilos es un ejercicio útil para identificar qué técnicas te atraen más.',
      },
    },
  ],
};

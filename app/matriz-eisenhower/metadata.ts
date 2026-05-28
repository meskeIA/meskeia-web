import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Matriz Eisenhower - Prioriza Tareas por Urgencia e Importancia | meskeIA',
  description: 'Organiza tus tareas con la matriz Eisenhower. Clasifica por urgente/importante, obtén recomendaciones de acción y mejora tu productividad. 100% gratis y privado.',
  keywords: 'matriz eisenhower, priorizar tareas, urgente importante, productividad, gestión tiempo, organización, planificación, delegar, eliminar tareas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Matriz Eisenhower - Prioriza Tareas | meskeIA',
    description: 'Organiza tus tareas con la matriz Eisenhower. Clasifica por urgente/importante y mejora tu productividad.',
    url: 'https://meskeia.com/matriz-eisenhower/',
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
    title: 'Matriz Eisenhower - Prioriza Tareas | meskeIA',
    description: 'Organiza tus tareas con la matriz Eisenhower. Clasifica por urgente/importante y mejora tu productividad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Matriz Eisenhower meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Matriz Eisenhower",
  description: "Organiza tus tareas con la matriz Eisenhower. Clasifica por urgente/importante, obtén recomendaciones de acción y mejora tu productividad. 100% gratis y privado.",
  url: "https://meskeia.com/matriz-eisenhower/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la Matriz Eisenhower?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Matriz Eisenhower es una herramienta de gestión del tiempo que divide las tareas en cuatro cuadrantes según su urgencia e importancia. Las tareas urgentes e importantes se hacen de inmediato; las importantes pero no urgentes se planifican; las urgentes pero no importantes se delegan; y las que no son ni urgentes ni importantes se eliminan. Fue popularizada por el presidente Dwight D. Eisenhower y recogida en el libro "Los 7 hábitos de la gente altamente efectiva" de Stephen Covey.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa la Matriz Eisenhower para priorizar tareas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para usar la Matriz Eisenhower, escribe cada tarea y evalúa dos variables: si es urgente (requiere atención inmediata) y si es importante (tiene impacto significativo en tus objetivos). Según la combinación, la tarea cae en uno de los cuatro cuadrantes y recibes una recomendación de acción concreta: hacer ahora, planificar, delegar o eliminar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre urgente e importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una tarea urgente es la que exige respuesta inmediata y tiene consecuencias si se pospone (por ejemplo, un plazo de entrega que vence hoy). Una tarea importante es la que contribuye de forma significativa a tus metas a largo plazo, aunque no tenga fecha límite inminente (como aprender una habilidad nueva o cuidar la salud). Muchas personas confunden urgencia con importancia y acaban dedicando todo el tiempo al cuadrante urgente-importante, sin avanzar en lo que realmente importa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil la Matriz Eisenhower?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que gestione múltiples responsabilidades: profesionales con muchas tareas simultáneas, estudiantes con proyectos y exámenes, emprendedores que combinan operativa y estrategia, o simplemente quien sienta que el día nunca es suficiente. Resulta especialmente valiosa cuando se tiene sensación de saturación o dificultad para decidir por dónde empezar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia la Matriz Eisenhower de una lista de tareas tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una lista de tareas tradicional recoge todo sin distinguir prioridades, lo que lleva a trabajar por orden de llegada o por lo más fácil. La Matriz Eisenhower añade una dimensión estratégica: no solo registra qué hay que hacer, sino que guía sobre cómo actuar ante cada tarea (ejecutar, planificar, delegar o descartar). Esto reduce la sensación de agobio y ayuda a invertir el tiempo en actividades de mayor impacto real.',
      },
    },
  ],
};

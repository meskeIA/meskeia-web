import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Territorio nuevo: preparación de entrevistas por competencias (carrera/empleo).
// Lenguaje universal hispanohablante: "entrevista de trabajo", "puesto", "empresa"
// se dicen igual a ambos lados del Atlántico. No aplica RegionBadge.

export const metadata: Metadata = {
  title: 'Preparar Entrevista por Competencias — Método STAR - meskeIA',
  description:
    'Prepara entrevistas de trabajo por competencias con el método STAR. Crea tu banco personal de respuestas (Situación, Tarea, Acción, Resultado) y ensáyalas.',
  keywords:
    'entrevista por competencias, método STAR, preguntas de entrevista de trabajo, ejemplos respuestas entrevista, entrevista conductual, banco de historias STAR, preparar entrevista laboral, técnica STAR',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Preparar Entrevista por Competencias con el Método STAR',
    description:
      'Construye tu banco de respuestas STAR para entrevistas por competencias: guía paso a paso, indicador de completitud y exportación. Sin registro.',
    url: 'https://meskeia.com/preparar-entrevista-competencias/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entrevista por Competencias — Método STAR',
    description:
      'Prepara y guarda tus respuestas STAR para entrevistas de trabajo. Guía, ejemplos y banco de historias en tu navegador.',
  },
  other: {
    'application-name': 'Preparar Entrevista por Competencias meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Preparar Entrevista por Competencias (Método STAR)',
  description:
    'Herramienta para preparar entrevistas de trabajo por competencias con el método STAR. Permite construir un banco personal de respuestas estructuradas (Situación, Tarea, Acción, Resultado) para las competencias conductuales más frecuentes, con consejos, indicador de completitud y exportación.',
  url: 'https://meskeia.com/preparar-entrevista-competencias/',
  category: 'EducationalApplication',
  features: [
    'Método STAR guiado: Situación, Tarea, Acción y Resultado',
    '10 competencias conductuales frecuentes en entrevistas de trabajo',
    'Preguntas de entrevista típicas por cada competencia',
    'Banco personal de historias guardado en tu propio navegador',
    'Indicador de completitud y consejos para cada respuesta',
    'Exporta tus respuestas en Markdown o cópialas al portapapeles',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: [
    'entrevista por competencias',
    'método STAR',
    'preguntas de entrevista de trabajo',
    'entrevista conductual',
    'preparar entrevista laboral',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el método STAR en una entrevista de trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'STAR es una estructura para responder preguntas de entrevista por competencias con un ejemplo real: Situación (el contexto), Tarea (tu responsabilidad o el reto), Acción (lo que hiciste tú concretamente) y Resultado (lo que conseguiste, a ser posible cuantificado). Ayuda a dar respuestas ordenadas, creíbles y fáciles de seguir en lugar de generalidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo preparo una entrevista por competencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Identifica las competencias que la empresa suele valorar (liderazgo, trabajo en equipo, resolución de conflictos, iniciativa…), y prepara para cada una una historia real siguiendo el método STAR. Tener un banco de 8-10 historias variadas te permite adaptar la más adecuada a casi cualquier pregunta conductual que te hagan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué competencias suelen evaluarse en una entrevista conductual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las más frecuentes son liderazgo, trabajo en equipo, resolución de conflictos, iniciativa y proactividad, gestión del fracaso y resiliencia, adaptación al cambio, orientación a resultados, comunicación, toma de decisiones y gestión del tiempo. Suelen preguntarse con frases del tipo "Cuéntame una situación en la que…".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debe durar una respuesta con el método STAR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre minuto y medio y dos minutos aproximadamente (unas 150-300 palabras habladas). Lo justo para dar contexto, explicar tu acción con detalle y cerrar con un resultado concreto, sin extenderte tanto que el entrevistador pierda el hilo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se guardan mis respuestas en algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Todo tu banco de historias se guarda únicamente en el almacenamiento local de tu propio navegador (localStorage). No se envía a ningún servidor ni requiere registro. Si borras los datos del navegador o usas otro dispositivo, tendrás que exportar y volver a importar tus respuestas.',
      },
    },
  ],
};

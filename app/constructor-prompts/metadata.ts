import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Constructor de Prompts Guiado — Crea instrucciones para IA paso a paso - meskeIA',
  description: 'Construye prompts efectivos para ChatGPT, Claude, Gemini y más con un asistente paso a paso. Elige modelo, objetivo, rol, formato y restricciones. Sin registro.',
  keywords: 'constructor prompts, crear prompts IA, prompts para ChatGPT, cómo escribir prompts, prompt engineering, instrucciones IA, mejorar prompts',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Constructor de Prompts Guiado — meskeIA',
    description: 'Crea prompts efectivos para cualquier IA en 5 pasos: modelo, objetivo, rol, formato y restricciones. Gratis y sin registro.',
    url: 'https://meskeia.com/constructor-prompts/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Constructor de Prompts Guiado — meskeIA',
    description: 'Crea prompts efectivos para ChatGPT, Claude y Gemini en 5 pasos. Sin registro.',
  },
  other: {
    'application-name': 'Constructor de Prompts meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Constructor de Prompts Guiado',
  description: 'Asistente paso a paso que ayuda a construir prompts efectivos para herramientas de inteligencia artificial como ChatGPT, Claude y Gemini. Guía al usuario a través de modelo destino, objetivo, rol, formato de salida y restricciones para generar una instrucción lista para copiar y usar.',
  url: 'https://meskeia.com/constructor-prompts/',
  category: 'UtilityApplication',
  features: [
    'Wizard guiado en 5 pasos para construir prompts estructurados',
    'Compatible con ChatGPT, Claude, Gemini, Copilot, Mistral y cualquier IA',
    'Selección de objetivo: redacción, código, análisis, búsqueda, creatividad y más',
    'Roles predefinidos: redactor, programador, profesor, analista, consultor y personalizados',
    'Formatos de salida configurables: lista, tabla, email, código, respuesta concisa',
    'Control de tono, longitud y restricciones del prompt generado',
    'Resultado listo para copiar con un clic',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un prompt y por qué importa cómo se redacta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un prompt es la instrucción que le das a una IA para indicarle qué debe hacer. La calidad del prompt determina directamente la calidad de la respuesta: un prompt vago produce respuestas genéricas, mientras que uno bien estructurado — con contexto, rol, formato y restricciones — obtiene resultados útiles y precisos. Estudios internos de OpenAI y Anthropic señalan que el prompt engineering puede mejorar la relevancia de las respuestas hasta un 40%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el constructor de prompts de meskeIA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El constructor guía al usuario a través de 5 pasos: elegir el modelo de IA de destino, definir el objetivo de la tarea, asignar un rol a la IA, seleccionar el formato de salida y añadir restricciones o contexto adicional. Con esas respuestas genera automáticamente un prompt estructurado listo para copiar y pegar en ChatGPT, Claude, Gemini u otras IAs.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué modelos de IA sirven los prompts generados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los prompts generados funcionan en cualquier modelo de lenguaje grande (LLM): ChatGPT (GPT-4o), Claude (Anthropic), Gemini (Google), Copilot (Microsoft), Mistral, Llama y otros. La herramienta permite elegir el modelo de destino para adaptar ligeramente el estilo y la longitud del prompt a sus particularidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre este constructor y el evaluador de prompts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El constructor parte de cero y genera un prompt nuevo guiando al usuario paso a paso. El evaluador de prompts analiza un prompt que el usuario ya tiene escrito y devuelve una puntuación con áreas de mejora. Son complementarios: usa el constructor para crear tu primer prompt, y el evaluador para perfeccionar los que ya tienes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito conocimientos técnicos de prompt engineering para usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El constructor está pensado para usuarios sin experiencia previa en prompt engineering. Solo hay que responder preguntas concretas sobre qué quieres conseguir: el asistente aplica automáticamente las técnicas recomendadas (asignación de rol, especificación de formato, control de tono y restricciones negativas) sin que el usuario necesite conocerlas.',
      },
    },
  ],
};

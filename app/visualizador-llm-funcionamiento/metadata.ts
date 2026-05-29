import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funcionan los LLMs - Tokens, Embeddings, Atención y Temperatura | meskeIA',
  description:
    'Entiende cómo funcionan ChatGPT, Claude y los modelos de lenguaje: tokenización interactiva, espacio semántico de embeddings, mecanismo de atención transformers y temperatura.',
  keywords: [
    'LLM',
    'large language model',
    'como funciona chatgpt',
    'como funciona claude',
    'tokens NLP',
    'embeddings',
    'transformers atención',
    'temperatura LLM',
    'context window',
    'inteligencia artificial',
  ],
  openGraph: {
    title: 'Cómo Funcionan los LLMs | meskeIA',
    description:
      'Tokens, embeddings, atención y temperatura explicados con visualizaciones interactivas',
    url: 'https://meskeia.com/visualizador-llm-funcionamiento/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cómo Funcionan los LLMs - Tokens, Embeddings y Atención",
  description: "Entiende cómo funcionan ChatGPT, Claude y los modelos de lenguaje: tokenización interactiva, espacio semántico de embeddings, mecanismo de atención transformers y temperatura.",
  url: "https://meskeia.com/visualizador-llm-funcionamiento/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona ChatGPT o Claude por dentro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modelos de lenguaje como ChatGPT o Claude son redes neuronales basadas en la arquitectura Transformer, entrenadas con enormes volúmenes de texto. El proceso tiene tres fases: primero el texto se divide en tokens (fragmentos de palabras), luego cada token se convierte en un vector numérico (embedding) que codifica su significado, y finalmente el mecanismo de atención calcula qué partes del contexto son relevantes para predecir la siguiente palabra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los tokens en inteligencia artificial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un token es la unidad mínima de texto que procesa un modelo de lenguaje. Puede ser una palabra completa, parte de una palabra o un signo de puntuación. Por ejemplo, "electromagnetismo" se divide en varios tokens, mientras que "la" es un token único. GPT-4 maneja un contexto de hasta 128.000 tokens y modelos como Gemini 1.5 llegan al millón. El coste de uso de los LLMs se mide habitualmente en precio por cada 1.000 tokens.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los embeddings y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los embeddings son representaciones numéricas (vectores de cientos o miles de dimensiones) que capturan el significado semántico de palabras o frases. Palabras con significados parecidos quedan cerca en ese espacio vectorial: "rey" y "reina" están próximas, igual que "París" y "capital". Permiten que el modelo entienda relaciones de sinonimia, analogías y contexto sin necesidad de reglas explícitas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la temperatura en un LLM y cómo afecta las respuestas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura es un parámetro que controla la aleatoriedad al seleccionar la siguiente palabra. Con temperatura 0 el modelo siempre elige el token más probable, dando respuestas deterministas y precisas, ideales para tareas técnicas. Con temperatura alta (0,8–1,2) el modelo explora opciones menos probables, generando texto más creativo pero menos predecible. La mayoría de interfaces de usuario utilizan valores alrededor de 0,7 como equilibrio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un LLM y una IA tradicional de reglas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sistemas de IA tradicionales siguen reglas explícitas escritas por humanos (si X entonces Y), lo que los hace predecibles pero rígidos. Los LLMs aprenden patrones estadísticos de millones de textos sin que nadie les programe reglas de gramática o conocimiento del mundo. Esto les permite generalizar a situaciones nunca vistas, pero también cometer errores imprevisibles ("alucinaciones") cuando el patrón estadístico no coincide con la realidad.',
      },
    },
  ],
};

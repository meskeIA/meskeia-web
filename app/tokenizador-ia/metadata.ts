import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tokenizador Visual de IA — Cuenta tokens y calcula costes de API - meskeIA',
  description: 'Visualiza cómo los LLMs dividen tu texto en tokens en tiempo real. Calcula el coste por modelo (GPT-4o, Claude, Gemini) con precios editables y compara ventanas de contexto.',
  keywords: 'tokenizador IA, contar tokens ChatGPT, calculadora tokens LLM, precio tokens GPT-4o, coste API IA, tokens por palabra, ventana contexto LLM, tiktoken español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tokenizador Visual de IA — meskeIA',
    description: 'Escribe texto y ve en tiempo real cómo lo divide un LLM en tokens. Calcula el coste con GPT-4o, Claude, Gemini y más — precios editables.',
    url: 'https://meskeia.com/tokenizador-ia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tokenizador Visual de IA — meskeIA',
    description: 'Cuenta tokens y calcula costes de API en tiempo real. Compatible con GPT-4o, Claude y Gemini.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tokenizador IA meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tokenizador Visual de IA',
  description: 'Herramienta interactiva que muestra cómo los modelos de lenguaje grande (LLMs) dividen cualquier texto en tokens. Incluye conteo en tiempo real, calculadora de costes por modelo con precios editables (GPT-4o, Claude, Gemini) e indicador de ventana de contexto utilizada.',
  url: 'https://meskeia.com/tokenizador-ia/',
  category: 'UtilityApplication',
  features: [
    'Visualización de tokens coloreados en tiempo real mientras escribes',
    'Conteo de tokens, palabras, caracteres y ratio tokens/palabra',
    'Calculadora de costes para 6 modelos principales (GPT-4o, GPT-4o mini, Claude Sonnet, Claude Haiku, Gemini Pro, Gemini Flash)',
    'Precios editables por el usuario — actualiza cuando cambien sin perder funcionalidad',
    'Indicador visual de ventana de contexto utilizada por modelo',
    'Ratio de tokens entrada/salida configurable para estimaciones reales',
    'Ejemplos preconfigurados: tweet, email, párrafo, fragmento de código',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un token en IA y por qué importa contarlos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un token es la unidad mínima de texto que procesa un modelo de lenguaje (LLM). En inglés, 1 token equivale aproximadamente a 0,75 palabras; en español, entre 1 y 1,5 tokens por palabra debido a la morfología más rica. Contar tokens importa porque los proveedores de API cobran por token procesado: a más tokens en tu prompt y en la respuesta, mayor coste. También determina qué cabe dentro de la "ventana de contexto" del modelo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el texto en español genera más tokens que en inglés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tokenizadores de los LLMs principales (GPT, Claude, Gemini) fueron entrenados con más texto en inglés, por lo que el vocabulario BPE (Byte Pair Encoding) contiene más palabras completas en inglés. Las palabras en español — especialmente con acentos, conjugaciones largas o palabras compuestas — se dividen con más frecuencia en subpalabras. Un texto equivalente en español puede generar entre un 10% y un 30% más de tokens que en inglés.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el coste de usar la API de un LLM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los proveedores cobran por millón de tokens ($/1M), con tarifas distintas para tokens de entrada (el prompt que envías) y tokens de salida (la respuesta que genera). El coste total = (tokens_entrada × precio_entrada + tokens_salida × precio_salida) / 1.000.000. Por ejemplo, con GPT-4o a $2,50/1M entrada y $10/1M salida, un prompt de 500 tokens con respuesta de 500 tokens cuesta aproximadamente $0,00625.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la ventana de contexto y por qué varía tanto entre modelos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ventana de contexto es el número máximo de tokens que un modelo puede procesar a la vez, incluyendo el historial de conversación, documentos adjuntos y la respuesta. GPT-4o tiene 128.000 tokens (~96.000 palabras en inglés), Claude Sonnet 200.000 tokens (~150.000 palabras) y Gemini 1.5 Pro 1.048.576 tokens (aproximadamente un libro entero). Modelos con ventana mayor pueden analizar documentos más largos pero suelen ser más caros por token.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los precios de los tokens cambian con el tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los precios de API de los principales proveedores cambian con relativa frecuencia — OpenAI redujo precios varias veces entre 2023 y 2025, y cada nuevo modelo suele tener una tarifa distinta. Por eso esta herramienta permite editar los precios manualmente: introduce los valores actuales de la web oficial de cada proveedor y el cálculo se actualiza al instante. Los valores por defecto corresponden a los precios verificados en junio de 2026.',
      },
    },
  ],
};

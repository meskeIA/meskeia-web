import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de IAs 2026 | Guía ChatGPT vs Claude vs Gemini | meskeIA',
  description:
    'Guía interactiva para comparar las principales IAs: ChatGPT, Claude, Gemini, Copilot, Mistral, Perplexity. Tabla comparativa por precio, privacidad, RGPD y casos de uso en España.',
  keywords: [
    'comparar IAs',
    'ChatGPT vs Claude',
    'Gemini vs ChatGPT',
    'mejor IA español',
    'IA RGPD empresa',
    'Mistral Europa',
    'comparador inteligencia artificial',
    'guía IA 2026',
  ],
  openGraph: {
    title: 'Comparador de IAs 2026 | meskeIA',
    description:
      'Tabla interactiva: ChatGPT, Claude, Gemini, Copilot, Mistral, Perplexity, Llama y DeepSeek. Filtra por precio, privacidad y caso de uso.',
    url: 'https://meskeia.com/visualizador-comparador-ia/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador de IAs 2026: ChatGPT vs Claude vs Gemini y más",
  description: "Guía interactiva para comparar las principales IAs: ChatGPT, Claude, Gemini, Copilot, Mistral, Perplexity. Tabla comparativa por precio, privacidad, RGPD y casos de uso en España.",
  url: "https://meskeia.com/visualizador-comparador-ia/",
  category: 'EducationalApplication',
  features: [],
});

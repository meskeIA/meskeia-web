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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la mejor IA en español en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una única "mejor IA en español": depende del uso. ChatGPT (GPT-4o) y Claude (Sonnet/Opus) ofrecen las respuestas más fluidas y precisas en castellano. Gemini Advanced integra bien con el ecosistema Google y es competitivo en tareas multimodales. Mistral, con modelos de código abierto y servidores en Europa, es la opción preferida para quienes priorizan privacidad y cumplimiento con el RGPD.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre ChatGPT, Claude y Gemini?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChatGPT (OpenAI) es el más popular y versátil, con un ecosistema amplio de plugins y GPTs. Claude (Anthropic) destaca por su capacidad para manejar documentos largos y por su énfasis en seguridad y honestidad. Gemini (Google) se integra de forma nativa con Gmail, Drive y Docs, lo que lo hace especialmente útil para usuarios del ecosistema Google. Los tres tienen planes gratuitos con limitaciones y suscripciones de pago a partir de unos 20 €/mes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué IA cumple mejor con el RGPD para usar en una empresa española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para cumplimiento estricto del RGPD, las opciones más recomendables son Mistral AI (empresa francesa, servidores en la UE) y Microsoft Copilot con contrato empresarial (ofrece DPA y residencia de datos en Europa). ChatGPT Enterprise y Claude for Business también ofrecen acuerdos de procesamiento de datos (DPA) que facilitan el cumplimiento normativo. En todos los casos, es necesario firmar el correspondiente contrato de encargado del tratamiento antes de procesar datos personales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es Perplexity y en qué se diferencia de otras IAs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Perplexity es un motor de búsqueda con IA que, a diferencia de ChatGPT o Claude, realiza búsquedas web en tiempo real y cita las fuentes de cada respuesta. Es especialmente útil para obtener información actualizada, investigar temas de actualidad o verificar datos concretos. Su modelo gratuito es competitivo; el plan Pro (a partir de 20 $/mes) da acceso a modelos más potentes y a búsquedas más profundas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena pagar por una IA de pago frente a las versiones gratuitas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para uso intensivo o profesional, la suscripción de pago suele justificarse. Los planes premium ofrecen acceso a los modelos más capaces (GPT-4o, Claude Opus, Gemini Ultra), mayor límite de mensajes, generación de imágenes, análisis de documentos extensos y herramientas de productividad avanzadas. Si el uso es ocasional o para tareas simples, los planes gratuitos de ChatGPT, Claude o Gemini son suficientes. El precio habitual ronda los 18-25 €/mes por asistente.',
      },
    },
  ],
};

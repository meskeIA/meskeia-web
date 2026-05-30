import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '[Nombre App] - [Descripción Corta] | meskeIA',
  description: '[Descripción detallada 150-160 caracteres]',
  keywords: 'keyword1, keyword2, keyword3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '[Título OG]',
    description: '[Descripción para redes sociales]',
    url: 'https://meskeia.com/[nombre-app]',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Título para Twitter]',
    description: '[Descripción para Twitter]',
  },
  other: {
    'application-name': 'Nombre App meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: '[Nombre App]',
  description: '[Descripción detallada de la app, qué hace y para quién es útil]',
  url: 'https://meskeia.com/[nombre-app]/',
  features: [
    '[Característica principal 1]',
    '[Característica principal 2]',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿[Pregunta real que haría un usuario sobre esta app]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta 2-4 frases con datos concretos]' },
    },
    {
      '@type': 'Question',
      name: '¿[Cómo funciona / qué calcula / para quién es útil]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
    {
      '@type': 'Question',
      name: '¿[Diferencia con alternativas / dato clave]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
    {
      '@type': 'Question',
      name: '¿[Pregunta sobre nivel educativo / audiencia objetivo]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
    {
      '@type': 'Question',
      name: '¿[Pregunta técnica o conceptual específica del tema]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
  ],
};

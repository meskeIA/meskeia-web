import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Curso GEO/AEO: Optimiza Contenido para ChatGPT y LLMs | meskeIA',
  description: 'Aprende GEO y AEO: cómo optimizar tu contenido para que ChatGPT, Perplexity y Gemini lo citen. LLMs, RAG, E-E-A-T y Schema Markup. Curso en español.',
  keywords: 'GEO, AEO, Generative Engine Optimization, Answer Engine Optimization, optimización para IA, ChatGPT SEO, Perplexity SEO, Gemini SEO, AI Overviews, LLM, RAG, E-E-A-T, Schema Markup, citaciones IA, posicionamiento IA, curso SEO 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Optimización para IAs (GEO/AEO) - Posiciona tu Contenido en IAs',
    description: 'Aprende a optimizar tu contenido para que ChatGPT, Perplexity y Gemini lo citen. Curso pionero en español sobre GEO/AEO.',
    url: 'https://meskeia.com/curso-optimizacion-ia/',
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
    title: 'Curso de Optimización para IAs (GEO/AEO) - meskeIA',
    description: 'Aprende GEO y AEO: el nuevo SEO para la era de las IAs. ChatGPT, Perplexity, Gemini.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Optimización IA meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Curso de Optimización para IAs (GEO/AEO)',
  description: 'Curso gratuito en español sobre Generative Engine Optimization (GEO) y Answer Engine Optimization (AEO): cómo optimizar contenido para que ChatGPT, Perplexity y Gemini lo citen como fuente autorizada. 6 módulos sobre LLMs, RAG, E-E-A-T y Schema Markup.',
  url: 'https://meskeia.com/curso-optimizacion-ia/',
  category: 'EducationalApplication',
  features: [
    'Curso completo de 6 módulos sobre GEO/AEO',
    'Aprende a optimizar contenido para ChatGPT, Perplexity, Gemini',
    'Estructura semántica y Schema Markup',
    'Conceptos: LLMs, RAG, E-E-A-T, AI Overviews',
    'Progreso guardado localmente entre sesiones',
    'Acceso 100% gratis sin registro',
    'Sin publicidad',
    'En español',
  ],
  keywords: ['GEO', 'AEO', 'Generative Engine Optimization', 'curso ChatGPT SEO', 'optimización IA', 'LLM', 'Schema Markup'],
});

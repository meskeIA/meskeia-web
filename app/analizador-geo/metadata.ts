import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analizador GEO/AEO - Optimiza tu Contenido para IAs | meskeIA',
  description: 'Analiza y optimiza tu contenido para ser citado por ChatGPT, Perplexity, Gemini y Google AI Overviews. Puntuación GEO, análisis E-E-A-T, estructura y citabilidad.',
  keywords: 'GEO, AEO, optimización IA, ChatGPT SEO, Perplexity, Gemini, AI Overviews, E-E-A-T, citabilidad, contenido para IAs, generative engine optimization, answer engine optimization',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador GEO/AEO - Optimiza para IAs - meskeIA',
    description: 'Analiza tu contenido para ser citado por ChatGPT, Perplexity y otras IAs. Puntuación GEO y recomendaciones.',
    url: 'https://meskeia.com/analizador-geo',
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
    title: 'Analizador GEO/AEO - Optimiza para IAs',
    description: 'Analiza y mejora tu contenido para ser citado por ChatGPT, Perplexity y Google AI.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Analizador GEO/AEO meskeIA',
  },
};

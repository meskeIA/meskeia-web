import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Schema Markup JSON-LD - Datos Estructurados | meskeIA',
  description: 'Genera código Schema Markup JSON-LD para Article, Product, FAQ, LocalBusiness y Recipe. Mejora tu SEO con datos estructurados y rich snippets.',
  keywords: 'schema markup, json-ld, datos estructurados, rich snippets, seo, article, product, faq, localbusiness, recipe, google',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Schema Markup JSON-LD',
    description: 'Crea datos estructurados para mejorar tu visibilidad en Google',
    url: 'https://meskeia.com/generador-schema-markup/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Schema Markup',
    description: 'Genera JSON-LD para rich snippets en Google',
  },
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Curso de Redacción Académica - Guía Práctica para TFG, TFM, Tesis y Artículos | meskeIA',
  description: 'Aprende a escribir textos académicos de calidad. Curso práctico con pautas aplicables a tu TFG, TFM, tesis o artículo. Estructura, citas APA, coherencia, estilo académico y más.',
  keywords: 'redacción académica, escritura académica, TFG, TFM, tesis, artículo científico, citas APA, bibliografía, abstract, introducción, conclusiones, coherencia textual, estilo académico, curso escritura',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Redacción Académica - Guía Práctica | meskeIA',
    description: 'Aprende a escribir textos académicos de calidad. Pautas prácticas para tu TFG, TFM, tesis o artículo científico.',
    url: 'https://meskeia.com/curso-redaccion-academica/',
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
    title: 'Curso de Redacción Académica - meskeIA',
    description: 'Guía práctica para escribir TFG, TFM, tesis y artículos académicos de calidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Redacción Académica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Redacción Académica",
  description: "Aprende a escribir textos académicos de calidad. Curso práctico con pautas aplicables a tu TFG, TFM, tesis o artículo. Estructura, citas APA, coherencia, estilo académico y más.",
  url: "https://meskeia.com/curso-redaccion-academica/",
  category: 'EducationalApplication',
  features: [],
});

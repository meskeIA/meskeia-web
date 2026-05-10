import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Estilo Parental - Autoconocimiento Educativo | meskeIA',
  description: 'Test gratuito de estilo parental basado en el modelo de Diana Baumrind. 16 preguntas para descubrir tu tendencia educativa: democrático, autoritario, permisivo o negligente.',
  keywords: 'test estilo parental, estilo educativo padres, estilo autoritario permisivo democratico, crianza consciente, autoconocimiento parental, Baumrind estilos parentales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Estilo Parental - Autoconocimiento Educativo',
    description: 'Descubre tu tendencia educativa con este test gratuito de 16 preguntas basado en el modelo de Baumrind (1966). Sin registro ni datos personales.',
    url: 'https://meskeia.com/test-estilo-parental/',
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
    title: 'Test de Estilo Parental - meskeIA',
    description: 'Descubre tu tendencia educativa: democrático, autoritario, permisivo o negligente. Test gratuito de 16 preguntas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test Estilo Parental meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Test de Estilo Parental',
  description: 'Test de autoconocimiento parental basado en el modelo de Diana Baumrind (1966) y Maccoby & Martin (1983). 16 preguntas que miden control/exigencia y afecto/responsividad para identificar la tendencia educativa predominante entre 4 estilos parentales.',
  url: 'https://meskeia.com/test-estilo-parental/',
  category: 'EducationalApplication',
  features: [
    'Test de 16 preguntas con escala Likert de 5 puntos',
    'Basado en el modelo científico de Baumrind (1966) + Maccoby & Martin (1983)',
    'Visualización en cuadrante bidimensional (control vs afecto)',
    'Descripción detallada del estilo con recomendaciones constructivas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Curso de Nutrición - Nutrición Avanzada Basada en Ciencia | meskeIA',
  description: 'Descubre la diferencia entre comer y nutrirse con conocimiento nutricional avanzado basado en ciencia. Fundamentos, interacciones alimentarias, efectos en órganos y aplicación práctica.',
  keywords: 'nutrición avanzada, alimentación saludable, macronutrientes, micronutrientes, biodisponibilidad, interacciones alimentarias, nutrición científica, educación nutricional, meskeIA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Nutrición - Nutrición Avanzada Basada en Ciencia',
    description: 'Conocimiento nutricional avanzado basado en ciencia. Más allá de los consejos básicos que ya conoces.',
    url: 'https://meskeia.com/curso-nutrisalud',
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
    title: 'Curso de Nutrición - Nutrición Avanzada Basada en Ciencia',
    description: 'Conocimiento nutricional avanzado basado en ciencia. Más allá de los consejos básicos que ya conoces.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso de Nutrición - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Nutrición - Nutrición Avanzada Basada en Ciencia",
  description: "Descubre la diferencia entre comer y nutrirse con conocimiento nutricional avanzado basado en ciencia. Fundamentos, interacciones alimentarias, efectos en órganos y aplicación práctica.",
  url: 'https://meskeia.com/curso-nutrisalud/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

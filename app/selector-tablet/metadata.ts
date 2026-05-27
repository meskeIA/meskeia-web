import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tablet | ¿Qué Tablet Necesitas? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de tablet se adapta mejor a tus necesidades: tablet Android, iPad/iOS, tablet Windows, eReader o prescindir de tablet.',
  keywords: [
    'qué tablet comprar',
    'iPad o tablet Android',
    'tablet Windows o iPad',
    'eReader o tablet',
    'tablet para dibujar',
    'tablet para estudiar',
    'tablet para niños',
    'tablet para trabajar',
    'mejor tablet según uso',
    'tablet o portátil',
  ],
  openGraph: {
    title: 'Selector de Tablet — ¿Qué Tipo de Tablet Necesitas?',
    description:
      'Descubre qué tipo de tablet se adapta mejor a tus necesidades en 10 preguntas.',
    url: 'https://meskeia.com/selector-tablet/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tablet",
  description: "Test de 10 preguntas para saber qué tipo de tablet se adapta mejor a tus necesidades: tablet Android, iPad/iOS, tablet Windows, eReader o prescindir de tablet.",
  url: "https://meskeia.com/selector-tablet/",
  category: 'EducationalApplication',
  features: [],
});

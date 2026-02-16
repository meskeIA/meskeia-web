import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nutrición Interactiva - Descubre Qué Alimentos Benefician a Tus Órganos | meskeIA',
  description:
    'Herramienta interactiva para descubrir qué alimentos benefician a cada órgano del cuerpo, cómo se potencian entre sí (sinergias) y cuáles inhiben la absorción de nutrientes. Basada en estudios científicos verificables.',
  keywords:
    'nutrición, alimentos saludables, órganos, sinergias alimentarias, absorción de nutrientes, vitaminas, minerales, dieta equilibrada, salud, omega-3, antioxidantes, combinaciones de alimentos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Nutrición Interactiva - Alimentos y Órganos | meskeIA',
    description:
      'Descubre qué alimentos benefician a tus órganos, sinergias nutricionales y combinaciones que potencian la absorción de nutrientes.',
    url: 'https://meskeia.com/nutricion-interactiva',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nutrición Interactiva | meskeIA',
    description:
      'Herramienta para descubrir sinergias entre alimentos, beneficios por órgano y combinaciones nutricionales óptimas.',
  },
  other: {
    'application-name': 'Nutrición Interactiva meskeIA',
  },
};

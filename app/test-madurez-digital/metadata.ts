import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test Madurez Digital en el Trabajo — ¿Cómo usa la IA tu empresa? | meskeIA',
  description:
    '15 preguntas para descubrir el nivel de madurez digital de tu empresa. Evalúa el uso de IA, automatización, datos y cultura digital. Obtén tu perfil y recomendaciones.',
  keywords:
    'test madurez digital empresa, nivel digitalizacion empresa, uso ia empresa, transformacion digital test, madurez digital trabajo, inteligencia artificial empresa test, cultura digital organizacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test Madurez Digital en el Trabajo — ¿Cómo usa la IA tu empresa?',
    description:
      '15 preguntas para descubrir el nivel de digitalización de tu empresa. Perfil de madurez digital + recomendaciones prácticas. Gratis y en español.',
    url: 'https://meskeia.com/test-madurez-digital/',
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
    title: 'Test Madurez Digital en el Trabajo',
    description:
      '¿Qué tan digital es tu empresa? 15 preguntas → perfil de madurez + recomendaciones prácticas. ¡Descúbrelo ahora!',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test Madurez Digital",
  description: "15 preguntas para descubrir el nivel de madurez digital de tu empresa. Evalúa el uso de IA, automatización, datos y cultura digital. Obtén tu perfil y recomendaciones.",
  url: "https://meskeia.com/test-madurez-digital/",
  category: 'UtilityApplication',
  features: [],
});

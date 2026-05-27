import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Menú Semanal - Organiza tus Comidas | meskeIA',
  description: 'Planifica tu menú semanal de forma equilibrada. Genera estructura de comidas saludables para toda la semana con sugerencias mediterráneas. Gratis y sin registro.',
  keywords: 'planificador menú, menú semanal, planificar comidas, dieta mediterránea, organizar alimentación, menú saludable, batch cooking',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Menú Semanal - meskeIA',
    description: 'Organiza tu alimentación semanal de forma equilibrada con nuestro planificador gratuito.',
    url: 'https://meskeia.com/planificador-menu/',
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
    title: 'Planificador de Menú Semanal - meskeIA',
    description: 'Organiza tu alimentación semanal de forma equilibrada.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Menú Semanal",
  description: "Planifica tu menú semanal de forma equilibrada. Genera estructura de comidas saludables para toda la semana con sugerencias mediterráneas. Gratis y sin registro.",
  url: "https://meskeia.com/planificador-menu/",
  category: 'FinanceApplication',
  features: [],
});

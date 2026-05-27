import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Figuras Retóricas - Identifica Metáfora, Hipérbole, Símil y más | meskeIA',
  description: 'Aprende a identificar las figuras retóricas con este quiz interactivo. 27 figuras (básico, bachillerato, selectividad): metáfora, hipérbole, anáfora, oxímoron y mucho más. Sin registro.',
  keywords: 'figuras retoicas, quiz figuras retorias, metafora hiperbole simil, recursos literarios, lengua española, selectividad lengua, bachillerato lengua, figuras literarias ejercicios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Figuras Retóricas | meskeIA',
    description: 'Identifica metáforas, hipérboles, anáforas y 24 figuras más. Quiz interactivo con ejemplos y explicaciones. Para ESO, Bachillerato y Selectividad.',
    url: 'https://meskeia.com/quiz-figuras-retoricas/',
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
    title: 'Quiz Figuras Retóricas | meskeIA',
    description: 'Aprende a identificar figuras retóricas: 27 figuras, 3 niveles, ejemplos reales. Sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Figuras Retóricas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Figuras Retóricas",
  description: "Aprende a identificar las figuras retóricas con este quiz interactivo. 27 figuras (básico, bachillerato, selectividad): metáfora, hipérbole, anáfora, oxímoron y mucho más. Sin registro.",
  url: "https://meskeia.com/quiz-figuras-retoricas/",
  category: 'EducationalApplication',
  features: [],
});

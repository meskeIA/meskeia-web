import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Curso de Pensamiento Científico - Aprende a Pensar Como un Científico | meskeIA',
  description: 'Curso gratuito de pensamiento científico: aprende el método científico, pensamiento crítico, falacias lógicas y cómo aplicar la ciencia en tu vida cotidiana. 12 capítulos interactivos.',
  keywords: 'pensamiento científico, método científico, pensamiento crítico, falacias lógicas, ciencia, empirismo, racionalismo, Popper, Kuhn, paradigmas, sesgos cognitivos, pseudociencia, curso gratuito',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Pensamiento Científico | meskeIA',
    description: 'Aprende a pensar como un científico: método científico, pensamiento crítico, falacias lógicas y aplicaciones prácticas.',
    url: 'https://meskeia.com/curso-pensamiento-cientifico/',
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
    title: 'Curso de Pensamiento Científico | meskeIA',
    description: 'Aprende el método científico, pensamiento crítico y cómo aplicar la ciencia en tu vida cotidiana.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Pensamiento Científico meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Pensamiento Científico",
  description: "Curso gratuito de pensamiento científico: aprende el método científico, pensamiento crítico, falacias lógicas y cómo aplicar la ciencia en tu vida cotidiana. 12 capítulos interactivos.",
  url: "https://meskeia.com/curso-pensamiento-cientifico/",
  category: 'EducationalApplication',
  features: [],
});

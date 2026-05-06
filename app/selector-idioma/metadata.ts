import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selector de Idioma | ¿Qué Idioma Aprender? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué idioma extranjero aprender según tus objetivos: inglés, francés, alemán, portugués o chino/japonés.',
  keywords: [
    'qué idioma aprender',
    'idioma más útil',
    'inglés o alemán',
    'aprender idioma según trabajo',
    'idioma para viajar',
    'idioma más empleable España',
    'francés o portugués',
    'chino o japonés aprender',
    'idioma para negocios',
    'qué lengua estudiar',
  ],
  openGraph: {
    title: 'Selector de Idioma — ¿Qué Idioma Aprender?',
    description:
      'Descubre qué idioma extranjero se adapta mejor a tus objetivos en 10 preguntas.',
    url: 'https://meskeia.com/selector-idioma/',
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
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué idioma aprender? Test orientativo | meskeIA',
    description: 'Test de 10 preguntas para elegir entre inglés, francés, alemán, portugués o chino/japonés.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-idioma/',
  },
};

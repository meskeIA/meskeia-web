import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Respiración Consciente - Técnicas de relajación | meskeIA',
  description: 'Aprende técnicas de respiración consciente con guía visual animada. Respiración 4-7-8, cuadrada, diafragmática y coherente. Ideal para ansiedad, autismo, EPOC y gestión del estrés.',
  keywords: 'respiración consciente, técnicas respiración, respiración 4-7-8, respiración cuadrada, respiración diafragmática, ansiedad, relajación, mindfulness, autismo, EPOC, estrés',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Respiración Consciente | meskeIA',
    description: 'Técnicas de respiración con guía visual animada. 4-7-8, cuadrada, diafragmática y coherente. Gratis y sin registro.',
    url: 'https://meskeia.com/guia-respiracion/',
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
    title: 'Guía de Respiración Consciente | meskeIA',
    description: 'Aprende a respirar mejor con guía visual animada. Reduce el estrés y la ansiedad.',
    images: ['https://meskeia.com/og-image.png']
  },
};

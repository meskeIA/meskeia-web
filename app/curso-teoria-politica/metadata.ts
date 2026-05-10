import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curso de Introducción a la Teoría Política | meskeIA',
  description:
    'Aprende los fundamentos de la teoría política: desde Platón y Aristóteles hasta Marx y Rawls. 9 capítulos con los pensadores más influyentes de la historia.',
  keywords:
    'teoría política, filosofía política, Platón, Aristóteles, Maquiavelo, Hobbes, Locke, Montesquieu, Rousseau, Marx, Rawls, ciencia política, pensamiento político',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Introducción a la Teoría Política | meskeIA',
    description:
      'Aprende los fundamentos de la teoría política: desde Platón y Aristóteles hasta Marx y Rawls. Curso interactivo con seguimiento de progreso.',
    url: 'https://meskeia.com/curso-teoria-politica/',
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
    title: 'Curso de Introducción a la Teoría Política | meskeIA',
    description:
      'Aprende los fundamentos de la teoría política: desde Platón y Aristóteles hasta Marx y Rawls.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Teoría Política meskeIA',
  },
};

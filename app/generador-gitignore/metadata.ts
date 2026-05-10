import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de .gitignore - Plantillas para Git | meskeIA',
  description: 'Generador de archivos .gitignore profesional con plantillas para Node.js, Python, Java, React y más. Combina tecnologías, descarga y copia tu configuración Git personalizada.',
  keywords: 'gitignore, git, github, plantillas git, node gitignore, python gitignore, java gitignore, react gitignore, gitignore generator, control de versiones, desarrollo web, programación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de .gitignore - Plantillas para Git | meskeIA',
    description: 'Crea archivos .gitignore profesionales combinando plantillas para tus tecnologías. Node.js, Python, Java, React y más.',
    url: 'https://meskeia.com/generador-gitignore/',
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
    title: 'Generador de .gitignore - Plantillas para Git',
    description: 'Crea archivos .gitignore profesionales combinando plantillas para tus tecnologías.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de .gitignore meskeIA',
  },
};

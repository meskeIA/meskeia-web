import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '[Nombre App] - [Descripción Corta] | meskeIA',
  description: '[Descripción detallada 150-160 caracteres]',
  keywords: 'keyword1, keyword2, keyword3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '[Título OG]',
    description: '[Descripción para redes sociales]',
    url: 'https://meskeia.com/[nombre-app]',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Título para Twitter]',
    description: '[Descripción para Twitter]',
  },
  other: {
    'application-name': 'Nombre App meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: '[Nombre App]',
  description: '[Descripción detallada de la app, qué hace y para quién es útil]',
  url: 'https://meskeia.com/[nombre-app]/',
  features: [
    '[Característica principal 1]',
    '[Característica principal 2]',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

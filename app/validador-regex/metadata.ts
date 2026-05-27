import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Validador de Expresiones Regulares (RegEx) | meskeIA',
  description: 'Testa y valida expresiones regulares online. Resaltado de coincidencias, flags interactivos y biblioteca de patrones comunes para email, teléfono, URL y más.',
  keywords: 'regex, expresiones regulares, validar regex, tester regex, patrones, programacion, javascript regex',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Validador de Expresiones Regulares',
    description: 'Testa y valida expresiones regulares con resaltado de coincidencias.',
    url: 'https://meskeia.com/validador-regex/',
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
    title: 'Validador RegEx',
    description: 'Testa expresiones regulares online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Validador RegEx",
  description: "Testa y valida expresiones regulares online. Resaltado de coincidencias, flags interactivos y biblioteca de patrones comunes para email, teléfono, URL y más.",
  url: "https://meskeia.com/validador-regex/",
  category: 'UtilityApplication',
  features: [],
});

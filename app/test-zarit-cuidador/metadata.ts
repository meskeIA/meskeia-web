import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Zarit - Sobrecarga del Cuidador | meskeIA',
  description: 'Test de Zarit validado en español para evaluar la sobrecarga del cuidador. 22 preguntas con puntuación e interpretación orientativa. Recursos de ayuda incluidos.',
  keywords: 'test zarit, escala zarit, sobrecarga cuidador, burnout cuidador, test cuidador dependencia, carga del cuidador, zarit español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Zarit - Sobrecarga del Cuidador | meskeIA',
    description: 'Evalúa tu nivel de sobrecarga como cuidador con la escala Zarit validada en español.',
    url: 'https://meskeia.com/test-zarit-cuidador/',
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
    title: 'Test de Zarit - Sobrecarga del Cuidador | meskeIA',
    description: 'Escala Zarit: evalúa la sobrecarga del cuidador familiar',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Test Zarit Cuidador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Zarit - Sobrecarga del Cuidador',
  description: 'Escala Zarit validada en español para evaluar la sobrecarga del cuidador de personas dependientes. 22 preguntas con puntuación, interpretación orientativa y recursos de ayuda.',
  url: 'https://meskeia.com/test-zarit-cuidador/',
  features: [
    'Escala Zarit completa de 22 ítems validada en español',
    'Puntuación con 3 niveles de sobrecarga',
    'Recursos de ayuda y teléfonos de atención',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

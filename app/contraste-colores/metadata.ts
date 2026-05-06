import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Contraste de Colores - Verificador WCAG AA/AAA | meskeIA',
  description: 'Verifica la accesibilidad del contraste entre colores según WCAG 2.1. Calcula ratio de contraste, cumplimiento AA/AAA para texto normal y grande.',
  keywords: 'contraste colores, WCAG, accesibilidad web, ratio contraste, AA, AAA, color contrast checker',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Contraste de Colores WCAG - meskeIA',
    description: 'Verifica la accesibilidad del contraste entre colores según WCAG 2.1',
    url: 'https://meskeia.com/contraste-colores/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Contraste de Colores - Verificador WCAG AA/AAA",
  description: "Verifica la accesibilidad del contraste entre colores según WCAG 2.1. Calcula ratio de contraste, cumplimiento AA/AAA para texto normal y grande.",
  url: 'https://meskeia.com/contraste-colores/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

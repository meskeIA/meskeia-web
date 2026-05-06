import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Vitaminas y Minerales - Guía de 30 Nutrientes Esenciales | meskeIA',
  description: 'Guía completa de 30 vitaminas y minerales esenciales: funciones, fuentes alimentarias, dosis diaria recomendada, síntomas de deficiencia y exceso. Información nutricional fiable.',
  keywords: 'vitaminas, minerales, nutrientes, B12, vitamina D, hierro, calcio, magnesio, zinc, nutrición, deficiencia vitamínica, suplementos, CDR, dosis diaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Vitaminas y Minerales - Guía de 30 Nutrientes Esenciales',
    description: 'Guía de vitaminas y minerales: funciones, fuentes, dosis y síntomas de deficiencia. Información nutricional completa.',
    url: 'https://meskeia.com/vitaminas-minerales',
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
    title: 'Vitaminas y Minerales - Guía Nutricional Completa',
    description: 'Todo sobre 30 nutrientes esenciales: vitaminas hidrosolubles, liposolubles y minerales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Vitaminas y Minerales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Vitaminas y Minerales - Guía de 30 Nutrientes Esenciales",
  description: "Guía completa de 30 vitaminas y minerales esenciales: funciones, fuentes alimentarias, dosis diaria recomendada, síntomas de deficiencia y exceso. Información nutricional fiable.",
  url: 'https://meskeia.com/vitaminas-minerales/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

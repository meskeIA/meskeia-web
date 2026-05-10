import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las Fuerzas Invisibles del Día a Día - Física para Bachillerato | meskeIA',
  description: 'Descubre las 5 fuerzas físicas que gobiernan tu vida cotidiana: gravedad, fricción, inercia, presión atmosférica y tensión superficial. Explicadas con ejemplos reales.',
  keywords: 'fuerzas físicas cotidianas, gravedad, fricción, inercia, presión atmosférica, tensión superficial, física bachillerato, explicador visual, física cotidiana',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las Fuerzas Invisibles del Día a Día',
    description: 'Por qué no flotas, no resbalas, te lanzas al frenar, te duelen los oídos en el avión y los insectos flotan en el agua. Física explicada para todos.',
    url: 'https://meskeia.com/visualizador-fuerzas-invisibles/',
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
    title: 'Las Fuerzas Invisibles del Día a Día',
    description: 'Gravedad, fricción, inercia, presión atmosférica y tensión superficial. Las fuerzas que mueven tu vida sin que las veas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fuerzas Invisibles meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las Fuerzas Invisibles del Día a Día',
  description: 'Explicador visual de las 5 fuerzas físicas cotidianas: gravedad, fricción, inercia, presión atmosférica y tensión superficial. Cada fuerza con ejemplo cotidiano, explicación simple y dato sorprendente. Ideal para Bachillerato y curiosos.',
  url: 'https://meskeia.com/visualizador-fuerzas-invisibles/',
  features: [
    '5 fuerzas físicas explicadas con ejemplos de la vida cotidiana',
    'Bloques clickables que despliegan explicación detallada',
    'Datos sorprendentes para cada fuerza',
    'Sección educativa con física profunda y aplicaciones prácticas',
    'Ideal para preparar Bachillerato y selectividad',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

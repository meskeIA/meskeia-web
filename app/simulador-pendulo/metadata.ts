import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Péndulo y MAS - Movimiento Armónico Simple | meskeIA',
  description: 'Simula un péndulo simple: ajusta longitud, masa, ángulo y gravedad. Calcula período y frecuencia, observa la oscilación y la energía. Física Bachillerato y Universidad.',
  keywords: 'péndulo simple, MAS, movimiento armónico simple, oscilaciones, período péndulo, frecuencia angular, física bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-pendulo/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Péndulo Simple | meskeIA',
    description: 'Péndulo simple y movimiento armónico con animación interactiva',
    url: 'https://meskeia.com/simulador-pendulo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Péndulo Simple | meskeIA',
    description: 'Aprende oscilaciones con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Péndulo Simple y MAS',
  description: 'Simulador interactivo de péndulo simple y movimiento armónico. Ajusta longitud, masa, ángulo inicial, gravedad y amortiguación, observa la oscilación, el período y la energía.',
  url: 'https://meskeia.com/simulador-pendulo/',
  category: 'EducationalApplication',
  features: [
    'Animación 2D del péndulo en tiempo real',
    'Cálculo de período T = 2π√(L/g) y frecuencia',
    'Modos: pequeños ángulos vs ángulos grandes con integración numérica',
    'Energía cinética y potencial en cada instante',
    'Presets de gravedad: Tierra, Luna, Marte',
    'Comparación de péndulos con distinta longitud',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['péndulo', 'MAS', 'oscilaciones', 'física bachillerato'],
});

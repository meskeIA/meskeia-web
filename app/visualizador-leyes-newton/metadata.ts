import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las 3 Leyes de Newton - La Física que Mueve el Mundo | meskeIA',
  description: 'Descubre las 3 leyes de Newton con simulaciones interactivas: inercia, F=ma y acción-reacción. Ejemplos cotidianos y datos curiosos. Explicador visual.',
  keywords: 'leyes de Newton, inercia, fuerza masa aceleración, acción reacción, F=ma, física, mecánica clásica, Newton, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las 3 Leyes de Newton - La Física que Mueve el Mundo',
    description: 'Inercia, F=ma y acción-reacción: las leyes que gobiernan todo movimiento, explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-leyes-newton',
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
    title: 'Las 3 Leyes de Newton - Explicador Visual',
    description: 'De la manzana al cohete: las leyes de Newton con simulaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Leyes Newton meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las 3 Leyes de Newton - La Física que Mueve el Mundo',
  description: 'Explicador visual interactivo sobre las 3 leyes de Newton: inercia, F=ma y acción-reacción. Simulaciones con sliders, ejemplos cotidianos y datos históricos.',
  url: 'https://meskeia.com/visualizador-leyes-newton/',
  category: 'EducationalApplication',
  features: [
    'Primera ley: inercia con animación de fricción',
    'Segunda ley: F=ma con sliders de masa y fuerza',
    'Tercera ley: acción-reacción con ejemplos animados',
    'Datos curiosos y timeline Newton-Einstein',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

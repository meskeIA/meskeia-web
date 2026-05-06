import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Física - Caída Libre, Péndulo, Ondas, Proyectiles | meskeIA',
  description: 'Simulador interactivo de física con animaciones en tiempo real. Experimenta con caída libre, péndulo simple, tiro parabólico, ondas y movimiento armónico simple.',
  keywords: 'simulador física, caída libre, péndulo, ondas, tiro parabólico, MAS, movimiento armónico simple, física interactiva, animación física, simulación online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Física Interactivo - meskeIA',
    description: 'Experimenta con física en tiempo real: caída libre, péndulos, ondas y proyectiles con animaciones visuales.',
    url: 'https://meskeia.com/simulador-fisica',
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
    title: 'Simulador de Física Interactivo',
    description: 'Animaciones de física en tiempo real: caída libre, péndulos, ondas y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador de Física meskeIA',
  },
};

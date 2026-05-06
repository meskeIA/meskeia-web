import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cara o Cruz - Lanzar Moneda Online con Estadísticas | meskeIA',
  description: 'Lanza una moneda virtual con animación realista. Incluye historial de lanzamientos, estadísticas de probabilidad y visualización de la ley de grandes números. Perfecto para tomar decisiones.',
  keywords: 'cara o cruz, lanzar moneda, coin flip, moneda virtual, decisiones aleatorias, probabilidad, estadísticas, ley grandes números, azar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cara o Cruz - Lanzar Moneda Online | meskeIA',
    description: 'Lanza una moneda virtual con animación y estadísticas de probabilidad.',
    url: 'https://meskeia.com/cara-o-cruz',
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
    title: 'Cara o Cruz | meskeIA',
    description: 'Moneda virtual con animación realista y estadísticas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

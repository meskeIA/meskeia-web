import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego Platform Runner - Plataformas en Español | meskeIA',
  description: 'Juega a Platform Runner online gratis. Corre, salta, recolecta monedas y derrota enemigos. Juego de plataformas con niveles progresivos y récords.',
  keywords: 'platform runner, juego, plataformas, saltar, monedas, enemigos, niveles, gratis, online, español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego Platform Runner - Plataformas | meskeIA',
    description: 'Juega a Platform Runner online gratis. Corre, salta y recolecta monedas.',
    url: 'https://meskeia.com/juego-platform-runner/',
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
    title: 'Juego Platform Runner - Plataformas | meskeIA',
    description: 'Juega a Platform Runner online gratis. Supera todos los niveles.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Platform Runner",
  description: "Juega a Platform Runner online gratis. Corre, salta, recolecta monedas y derrota enemigos. Juego de plataformas con niveles progresivos y récords.",
  url: "https://meskeia.com/juego-platform-runner/",
  category: 'UtilityApplication',
  features: [],
});

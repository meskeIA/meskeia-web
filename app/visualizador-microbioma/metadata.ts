import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Microbioma — Billones de Aliados en tu Interior | meskeIA',
  description: 'Descubre el ecosistema bacteriano del cuerpo humano: intestino, piel, boca y pulmones. Eje intestino-cerebro, serotonina, factores que alteran la microbiota.',
  keywords: 'microbioma, microbiota intestinal, bacterias intestinales, eje intestino-cerebro, serotonina, probióticos, Firmicutes, Bacteroidetes, diversidad microbiana',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Microbioma — Billones de Aliados en tu Interior | meskeIA',
    description: 'Descubre el ecosistema bacteriano del cuerpo humano: intestino, piel, boca y pulmones. Eje intestino-cerebro, serotonina, factores que alteran la microbiota.',
    url: 'https://meskeia.com/visualizador-microbioma/',
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
    title: 'El Microbioma — Billones de Aliados en tu Interior',
    description: 'Descubre el ecosistema bacteriano del cuerpo humano: intestino, piel, boca y pulmones. Eje intestino-cerebro y factores que alteran la microbiota.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/visualizador-microbioma/',
  },
  other: {
    'application-name': 'Visualizador Microbioma meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Microbioma — Billones de Aliados en tu Interior',
  description: 'Visualizador interactivo del microbioma humano: explora el ecosistema bacteriano del intestino, piel, boca y pulmones, el eje intestino-cerebro y los factores que modifican la microbiota.',
  url: 'https://meskeia.com/visualizador-microbioma/',
  features: [
    'Explorador de 4 zonas del cuerpo con datos sobre microorganismos',
    'Visualización del eje intestino-cerebro bidireccional',
    'Selector interactivo de 5 factores que alteran el microbioma',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

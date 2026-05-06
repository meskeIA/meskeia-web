import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Imágenes - JPG, PNG, WebP | meskeIA',
  description: 'Convierte imágenes entre JPG, PNG y WebP. Redimensiona, comprime y ajusta la calidad. Presets para redes sociales Instagram, Facebook, Twitter.',
  keywords: 'conversor imagenes, convertir jpg png, webp, redimensionar imagen, comprimir imagen, instagram, facebook',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Imágenes',
    description: 'Convierte imágenes entre JPG, PNG y WebP. Redimensiona y comprime.',
    url: 'https://meskeia.com/conversor-imagenes',
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
    title: 'Conversor de Imágenes',
    description: 'Convierte y redimensiona imágenes online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

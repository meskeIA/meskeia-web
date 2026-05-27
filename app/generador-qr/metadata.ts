import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Códigos QR - Crea QR Gratis Online | meskeIA',
  description: 'Generador de códigos QR gratuito para URLs, texto, WiFi, contactos, email y más. Descarga en PNG de alta resolución. Sin registro, sin límites, 100% privado.',
  keywords: 'generador qr, crear codigo qr, qr gratis, qr wifi, qr url, qr texto, codigo qr online, generar qr',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Códigos QR Gratis - meskeIA',
    description: 'Crea códigos QR para URLs, texto, WiFi y contactos. Descarga gratis en PNG.',
    url: 'https://meskeia.com/generador-qr/',
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
    title: 'Generador de Códigos QR Gratis',
    description: 'Crea códigos QR para URLs, texto, WiFi y contactos. Sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

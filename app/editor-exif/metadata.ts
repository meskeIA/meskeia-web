import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Editor EXIF - Visualiza y Elimina Metadatos de Fotos | meskeIA',
  description: 'Analiza qué datos revelan tus fotos (GPS, cámara, fecha, dispositivo). Elimina metadatos EXIF para proteger tu privacidad. 100% offline, procesamiento local en tu navegador.',
  keywords: 'editor exif, eliminar metadatos fotos, quitar gps fotos, privacidad fotos, datos ocultos imagen, exif viewer, metadata remover, limpiar exif, seguridad digital, ubicacion fotos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Editor EXIF - Protege tu Privacidad | meskeIA',
    description: 'Descubre qué datos ocultos revelan tus fotos y elimínalos fácilmente. Herramienta educativa de seguridad digital.',
    url: 'https://meskeia.com/editor-exif/',
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
    title: 'Editor EXIF - Visualiza y Elimina Metadatos | meskeIA',
    description: 'Analiza y elimina datos ocultos de tus fotos. Protege tu privacidad al compartir imágenes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Editor EXIF meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Editor EXIF",
  description: "Analiza qué datos revelan tus fotos (GPS, cámara, fecha, dispositivo). Elimina metadatos EXIF para proteger tu privacidad. 100% offline, procesamiento local en tu navegador.",
  url: "https://meskeia.com/editor-exif/",
  category: 'UtilityApplication',
  features: [],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Recortador de Audio Online - Corta MP3, WAV, OGG Gratis | meskeIA',
  description: 'Recorta y edita archivos de audio online gratis. Corta MP3, WAV, OGG sin límites ni marcas de agua. Fade in/out, ajuste de volumen. 100% privado en tu navegador.',
  keywords: 'recortador audio, cortar mp3, recortar audio online, editar mp3 gratis, cortar canciones, hacer tonos, trim audio, cortar wav, recortar ogg, editor audio online, sin marca de agua, fade in, fade out',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Recortador de Audio Online - Sin Límites | meskeIA',
    description: 'Recorta y edita archivos de audio online gratis. Sin límites ni marcas de agua. 100% privado.',
    url: 'https://meskeia.com/recortador-audio/',
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
    title: 'Recortador de Audio Online | meskeIA',
    description: 'Recorta MP3, WAV, OGG gratis. Sin límites ni marcas de agua.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Recortador de Audio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Recortador de Audio",
  description: "Recorta y edita archivos de audio online gratis. Corta MP3, WAV, OGG sin límites ni marcas de agua. Fade in/out, ajuste de volumen. 100% privado en tu navegador.",
  url: "https://meskeia.com/recortador-audio/",
  category: 'UtilityApplication',
  features: [],
});

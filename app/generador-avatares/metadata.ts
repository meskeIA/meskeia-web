import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Avatares - Crea avatares únicos desde tu nombre | meskeIA',
  description: 'Genera avatares únicos y personalizados a partir de tu nombre o texto. 8 estilos diferentes, descarga PNG, sin subir fotos. 100% privado y gratuito.',
  keywords: 'generador avatares, avatar online, crear avatar, avatar desde nombre, identicon, avatar gratis, perfil, foto perfil, dicebear, gravatar alternativa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Avatares - Crea avatares únicos | meskeIA',
    description: 'Genera avatares únicos y personalizados a partir de tu nombre. 8 estilos, descarga PNG, 100% privado.',
    url: 'https://meskeia.com/generador-avatares/',
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
    title: 'Generador de Avatares | meskeIA',
    description: 'Crea avatares únicos desde tu nombre. 8 estilos, descarga PNG, sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Avatares meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Avatares",
  description: "Genera avatares únicos y personalizados a partir de tu nombre o texto. 8 estilos diferentes, descarga PNG, sin subir fotos. 100% privado y gratuito.",
  url: "https://meskeia.com/generador-avatares/",
  category: 'UtilityApplication',
  features: [],
});

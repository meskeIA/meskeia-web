import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lupa Digital Online - Amplía con la Cámara Gratis | meskeIA',
  description: 'Lupa digital gratuita que usa la cámara de tu dispositivo para ampliar texto, objetos pequeños y detalles. Ideal para leer letra pequeña y accesibilidad.',
  keywords: 'lupa digital, lupa online, ampliar cámara, lupa gratis, magnificador, zoom cámara, accesibilidad, leer letra pequeña',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lupa Digital Online - Amplía con la Cámara',
    description: 'Lupa digital gratuita que usa la cámara para ampliar texto y objetos pequeños.',
    url: 'https://meskeia.com/lupa-digital/',
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
    title: 'Lupa Digital Online - Amplía con la Cámara',
    description: 'Lupa digital gratuita que usa la cámara para ampliar texto y objetos pequeños.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lupa Digital con Cámara",
  description: "Lupa digital gratuita que usa la cámara de tu dispositivo para ampliar texto, objetos pequeños y detalles. Ideal para leer letra pequeña y accesibilidad.",
  url: "https://meskeia.com/lupa-digital/",
  category: 'UtilityApplication',
  features: [],
});

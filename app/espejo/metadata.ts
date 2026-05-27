import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Espejo Digital Online - Espejo de Bolsillo Gratis | meskeIA',
  description: 'Espejo digital gratuito que usa la cámara frontal de tu dispositivo. Ideal para retocarte, maquillarte o comprobar tu aspecto cuando no tienes un espejo a mano.',
  keywords: 'espejo digital, espejo online, espejo gratis, espejo cámara, espejo móvil, mirror online, espejo de bolsillo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Espejo Digital Online - Espejo de Bolsillo',
    description: 'Espejo digital gratuito que usa la cámara frontal. Comprueba tu aspecto en cualquier momento.',
    url: 'https://meskeia.com/espejo/',
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
    title: 'Espejo Digital Online - Espejo de Bolsillo',
    description: 'Espejo digital gratuito que usa la cámara frontal.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Espejo Digital",
  description: "Espejo digital gratuito que usa la cámara frontal de tu dispositivo. Ideal para retocarte, maquillarte o comprobar tu aspecto cuando no tienes un espejo a mano.",
  url: "https://meskeia.com/espejo/",
  category: 'UtilityApplication',
  features: [],
});

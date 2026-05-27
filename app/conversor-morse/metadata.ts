import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Código Morse Online - Texto a Morse y Morse a Texto | meskeIA',
  description: 'Conversor de código Morse gratuito. Traduce texto a código Morse y viceversa. Reproduce el sonido del mensaje. Incluye alfabeto Morse completo.',
  keywords: 'codigo morse, conversor morse, traductor morse, morse a texto, texto a morse, alfabeto morse, SOS morse',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Código Morse Online - meskeIA',
    description: 'Traduce texto a código Morse y viceversa. Con sonido y alfabeto completo.',
    url: 'https://meskeia.com/conversor-morse/',
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
    title: 'Conversor de Código Morse Online',
    description: 'Traduce texto a código Morse y viceversa. Con sonido y alfabeto completo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Código Morse",
  description: "Conversor de código Morse gratuito. Traduce texto a código Morse y viceversa. Reproduce el sonido del mensaje. Incluye alfabeto Morse completo.",
  url: "https://meskeia.com/conversor-morse/",
  category: 'EducationalApplication',
  features: [],
});

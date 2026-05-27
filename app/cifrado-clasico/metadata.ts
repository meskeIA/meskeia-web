import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cifrado Clásico Online - César, ROT13 y Atbash | meskeIA',
  description: 'Cifrados clásicos gratuitos: César, ROT13 y Atbash. Encripta y descifra mensajes con métodos históricos. Visualización del alfabeto cifrado y explicaciones educativas.',
  keywords: 'cifrado cesar, rot13, atbash, cifrado clasico, encriptar mensaje, desencriptar, criptografia, cifrado julio cesar, cifrado hebreo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado Clásico Online - César, ROT13, Atbash | meskeIA',
    description: 'Encripta mensajes con cifrados históricos: César, ROT13 y Atbash. Aprende criptografía clásica.',
    url: 'https://meskeia.com/cifrado-clasico/',
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
    title: 'Cifrado Clásico Online - César, ROT13, Atbash',
    description: 'Encripta y descifra mensajes con métodos clásicos de criptografía.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cifrado Clásico",
  description: "Cifrados clásicos gratuitos: César, ROT13 y Atbash. Encripta y descifra mensajes con métodos históricos. Visualización del alfabeto cifrado y explicaciones educativas.",
  url: "https://meskeia.com/cifrado-clasico/",
  category: 'EducationalApplication',
  features: [],
});

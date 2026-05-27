import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Curso de Criptografía y Seguridad - Aprende desde Cifrado César hasta AES | meskeIA',
  description: 'Domina los fundamentos de la criptografía: desde cifrados históricos como César y Vigenère hasta técnicas modernas como AES y hashes SHA-256. Curso gratuito con herramientas prácticas.',
  keywords: 'criptografía, seguridad informática, cifrado, AES, hash, SHA-256, MD5, contraseñas seguras, cifrado César, Vigenère, Base64, 2FA, autenticación, curso gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Criptografía y Seguridad | meskeIA',
    description: 'Aprende criptografía desde cero: historia, cifrados clásicos, AES, hashes y seguridad de contraseñas. Con herramientas prácticas para practicar.',
    url: 'https://meskeia.com/curso-criptografia-seguridad/',
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
    title: 'Curso de Criptografía y Seguridad | meskeIA',
    description: 'Domina la criptografía: desde César hasta AES. Curso gratuito con 15 capítulos y herramientas prácticas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Criptografía meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Criptografía y Seguridad",
  description: "Domina los fundamentos de la criptografía: desde cifrados históricos como César y Vigenère hasta técnicas modernas como AES y hashes SHA-256. Curso gratuito con herramientas prácticas.",
  url: "https://meskeia.com/curso-criptografia-seguridad/",
  category: 'EducationalApplication',
  features: [],
});

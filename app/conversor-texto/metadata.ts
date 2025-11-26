import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Texto - Mayúsculas, Minúsculas, Base64 | meskeIA',
  description: 'Convierte texto a mayúsculas, minúsculas, capitalizado, invertido. Codifica/decodifica Base64 y URL. Genera Lorem Ipsum. Gratis, privado y sin registro.',
  keywords: 'conversor texto, mayusculas, minusculas, capitalizar, invertir texto, base64, url encode, lorem ipsum, generador texto, text converter',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Texto Online - Múltiples Formatos',
    description: 'Transforma tu texto: mayúsculas, minúsculas, capitalizado, Base64, URL encode y más.',
    url: 'https://next.meskeia.com/conversor-texto',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Texto | meskeIA',
    description: 'Convierte texto a diferentes formatos: mayúsculas, Base64, URL y más',
  },
  other: {
    'application-name': 'Conversor de Texto meskeIA',
  },
};

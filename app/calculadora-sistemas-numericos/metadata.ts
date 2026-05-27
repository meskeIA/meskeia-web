import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sistemas Numéricos - Binario, Octal, Decimal, Hexadecimal | meskeIA',
  description: 'Convierte números entre sistemas numéricos: binario, octal, decimal y hexadecimal. Muestra el proceso paso a paso. Incluye operaciones aritméticas y lógicas en binario.',
  keywords: 'calculadora binario, conversor hexadecimal, decimal a binario, octal, sistemas numericos, base 2, base 8, base 10, base 16, informatica, arquitectura computadores',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sistemas Numéricos - Binario, Octal, Decimal, Hex',
    description: 'Convierte números entre binario, octal, decimal y hexadecimal con explicación paso a paso. Ideal para estudiantes de informática.',
    url: 'https://meskeia.com/calculadora-sistemas-numericos/',
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
    title: 'Calculadora de Sistemas Numéricos - meskeIA',
    description: 'Convierte entre binario, octal, decimal y hexadecimal con pasos detallados.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Sistemas Numéricos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Sistemas Numéricos",
  description: "Convierte números entre sistemas numéricos: binario, octal, decimal y hexadecimal. Muestra el proceso paso a paso. Incluye operaciones aritméticas y lógicas en binario.",
  url: "https://meskeia.com/calculadora-sistemas-numericos/",
  category: 'EducationalApplication',
  features: [],
});

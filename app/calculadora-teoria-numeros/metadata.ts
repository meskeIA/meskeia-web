import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Teoría de Números - Primos, MCD, MCM | meskeIA',
  description: 'Factoriza números en primos, calcula MCD y MCM, encuentra todos los divisores, verifica primalidad y más. Herramienta completa de teoría de números. Gratis.',
  keywords: 'números primos, factorización, MCD, MCM, divisores, teoría de números, criba, Euclides',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Teoría de Números | meskeIA',
    description: 'Números primos, factorización, MCD, MCM y divisores.',
    url: 'https://meskeia.com/calculadora-teoria-numeros/',
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
    title: 'Calculadora Teoría de Números | meskeIA',
    description: 'Herramienta de teoría de números online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Teoría de Números",
  description: "Factoriza números en primos, calcula MCD y MCM, encuentra todos los divisores, verifica primalidad y más. Herramienta completa de teoría de números. Gratis.",
  url: "https://meskeia.com/calculadora-teoria-numeros/",
  category: 'EducationalApplication',
  features: [],
});

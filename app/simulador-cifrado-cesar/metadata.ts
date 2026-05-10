import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Cifrado César | meskeIA',
  description: 'Cifra y descifra texto con el cifrado César. Rueda del alfabeto animada, histograma de frecuencias y ataque automático por análisis de frecuencias.',
  keywords: ['cifrado César', 'criptografía', 'sustitución monoalfabética', 'análisis de frecuencias', 'ROT-13', 'Julio César', 'informática', 'Bachillerato'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Cifrado César | meskeIA',
    description: 'Rueda del alfabeto interactiva, cifrado/descifrado en tiempo real y ataque por análisis de frecuencias.',
    url: 'https://meskeia.com/simulador-cifrado-cesar/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Cifrado César | meskeIA',
    description: 'Rueda del alfabeto interactiva, cifrado/descifrado en tiempo real y ataque automático por análisis de frecuencias.',
  },
  other: {
    'application-name': 'Simulador Cifrado César meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Cifrado César',
  description: 'Cifra y descifra texto con el cifrado César con rueda animada, histograma de frecuencias y ataque automático.',
  url: 'https://meskeia.com/simulador-cifrado-cesar/',
  category: 'EducationalApplication',
  features: [
    'Rueda del alfabeto animada en Canvas 2D',
    'Cifrado y descifrado en tiempo real',
    'Histograma de frecuencias de letras',
    'Ataque automático por análisis de frecuencias',
    '5 textos predefinidos',
    'ROT-13 como caso especial',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

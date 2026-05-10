import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Problema de Monty Hall — Probabilidad Interactiva | meskeIA',
  description: 'Simula el Problema de Monty Hall y descubre por qué cambiar de puerta gana 2 de cada 3 veces. Modo manual y automático con hasta 10.000 partidas.',
  keywords: 'problema de Monty Hall, probabilidad condicional, simulador Monty Hall, cambiar de puerta, paradoja Monty Hall, estadística, probabilidad, Bayes, tres puertas, coche o cabra, Bachillerato, divulgación matemática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-monty-hall/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Problema de Monty Hall | meskeIA',
    description: 'Elige puerta, Monty revela una cabra. ¿Cambias? Descubre por qué cambiar gana 2/3 de las veces con este simulador interactivo.',
    url: 'https://meskeia.com/simulador-monty-hall/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Problema de Monty Hall | meskeIA',
    description: 'Prueba en vivo el Problema de Monty Hall y comprueba por qué la probabilidad de ganar cambiando es el doble que quedándote.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Problema de Monty Hall',
  description: 'Simulador interactivo del Problema de Monty Hall con modo manual (jugadas individuales) y modo automático (hasta 10.000 simulaciones). Visualiza en tiempo real por qué cambiar de puerta ofrece una probabilidad de 2/3 frente al 1/3 de no cambiar, y aprende probabilidad condicional de forma intuitiva.',
  url: 'https://meskeia.com/simulador-monty-hall/',
  category: 'EducationalApplication',
  features: [
    'Modo manual: elige puerta, Monty revela una cabra, decide si cambias',
    'Modo automático: hasta 10.000 simulaciones con slider',
    'Barras CSS animadas comparando "Cambia siempre" vs "No cambia"',
    'Contador de racha de victorias y derrotas en la sesión',
    'Bloque educativo completo sobre probabilidad condicional',
    'Funciona 100% en el navegador, sin servidor ni datos personales',
    'Gratuito y sin publicidad',
    'Ideal para secundaria, preparatoria, Bachillerato y divulgación',
  ],
  keywords: [
    'Monty Hall',
    'probabilidad condicional',
    'paradoja Monty Hall',
    'simulador probabilidad',
    'estadística interactiva',
    'Bachillerato matemáticas',
    'divulgación matemática',
  ],
});

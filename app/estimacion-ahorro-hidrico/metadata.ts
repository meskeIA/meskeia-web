import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de Ahorro Hídrico - Ahorra Agua en Casa | meskeIA',
  description: 'Calcula cuánta agua y dinero puedes ahorrar en casa con hábitos sostenibles. Checklist interactivo con 10 acciones y ahorro estimado en litros y euros al año.',
  keywords: 'ahorro agua, consumo agua España, ahorrar agua casa, litros agua grifo, huella hidrica, ahorro hidrico, precio agua España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Ahorro Hídrico - Ahorra Agua en Casa | meskeIA',
    description: 'Calcula cuánta agua y dinero puedes ahorrar adoptando hábitos sostenibles. 10 acciones con impacto real estimado.',
    url: 'https://meskeia.com/estimacion-ahorro-hidrico',
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
    title: 'Estimación de Ahorro Hídrico | meskeIA',
    description: 'Descubre cuánta agua y dinero puedes ahorrar en casa con 10 hábitos sostenibles.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimación de Ahorro Hídrico meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Ahorro Hídrico',
  description: 'Herramienta interactiva para estimar el ahorro anual de agua y dinero al adoptar hábitos sostenibles en el hogar. Incluye checklist de 10 acciones con impacto individualizado en litros y euros.',
  url: 'https://meskeia.com/estimacion-ahorro-hidrico/',
  features: [
    'Checklist interactivo de 10 hábitos de ahorro de agua',
    'Cálculo de ahorro en litros y euros por acción',
    'Ajuste por número de personas y precio del agua local',
    'Equivalencias visuales (bañeras, piscinas)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Evolución del Dinero - Del Trueque al Bitcoin | meskeIA',
  description: 'Historia visual del dinero: del trueque a las criptomonedas. Conchas, monedas, billetes, tarjetas, euro digital. Timeline interactivo con datos por país.',
  keywords: 'evolución dinero, historia moneda, trueque, patrón oro, criptomonedas, euro digital, historia billetes, dinero digital, CBDC, cashless',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Evolución del Dinero - Del Trueque al Bitcoin',
    description: 'Timeline visual interactivo: cómo el dinero pasó de conchas y sal a criptomonedas y euros digitales.',
    url: 'https://meskeia.com/visualizador-historia-dinero',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Evolución del Dinero - Del Trueque al Bitcoin',
    description: 'La historia del dinero explicada de forma visual: trueque, monedas, billetes, tarjetas y criptomonedas.',
  },
  other: { 'application-name': 'Historia Dinero meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Evolución del Dinero - Del Trueque al Bitcoin',
  description: 'Explicador visual interactivo de la historia del dinero: desde el trueque y las primeras monedas hasta las criptomonedas y el euro digital. Timeline con eras clickables y comparativa de uso de efectivo por país.',
  url: 'https://meskeia.com/visualizador-historia-dinero/',
  features: [
    'Timeline visual interactivo de la historia del dinero',
    'Del trueque a las criptomonedas en 4 eras',
    'Comparativa de uso de efectivo por país (slider)',
    'Datos de ejemplo educativos, sin entrada del usuario',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

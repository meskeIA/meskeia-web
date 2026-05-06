import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona Internet en 60 Segundos - Explicador Visual | meskeIA',
  description: 'Qué pasa entre que pulsas buscar y ves resultados: DNS, servidores, cables submarinos, data centers. Timeline visual de milisegundos.',
  keywords: 'cómo funciona internet, DNS, servidores, cables submarinos, data centers, TCP IP, explicador visual, infraestructura internet',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona Internet en 60 Segundos',
    description: 'El viaje invisible de tus datos: de tu navegador al servidor y vuelta en milisegundos.',
    url: 'https://meskeia.com/visualizador-internet-60-segundos',
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
    title: 'Cómo Funciona Internet en 60 Segundos',
    description: 'Qué pasa cuando pulsas buscar. El viaje invisible de tus datos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Internet 60s meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona Internet en 60 Segundos',
  description: 'Explicador visual del funcionamiento de Internet: desde que escribes una URL hasta que ves la página. DNS, TCP/IP, cables submarinos, data centers, cifrado HTTPS y CDNs explicados paso a paso.',
  url: 'https://meskeia.com/visualizador-internet-60-segundos/',
  features: [
    'Timeline visual del viaje de una petición web',
    '10 pasos desde el navegador hasta la respuesta',
    'Tiempos reales en milisegundos',
    'Datos sobre infraestructura global de Internet',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

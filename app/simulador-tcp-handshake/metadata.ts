import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Handshake TCP | meskeIA',
  description: 'Visualiza el three-way handshake de TCP (SYN→SYN-ACK→ACK) y el cierre de conexión con diagrama de secuencia animado y números de secuencia reales.',
  keywords: ['TCP handshake', 'three-way handshake', 'SYN', 'SYN-ACK', 'protocolo TCP', 'redes de computadoras', 'informática', 'Bachillerato', 'número de secuencia', 'ISN'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador del Handshake TCP | meskeIA',
    description: 'Diagrama de secuencia animado del TCP three-way handshake con números de secuencia y panel de detalles de cada paquete.',
    url: 'https://meskeia.com/simulador-tcp-handshake/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Handshake TCP | meskeIA',
    description: 'Diagrama de secuencia animado del TCP three-way handshake con números de secuencia y panel de detalles.',
  },
  other: {
    'application-name': 'Simulador del Handshake TCP meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Handshake TCP',
  description: 'Diagrama de secuencia animado del TCP three-way handshake con números de secuencia reales, panel de detalles y cierre de conexión FIN.',
  url: 'https://meskeia.com/simulador-tcp-handshake/',
  category: 'EducationalApplication',
  features: [
    'Diagrama de secuencia animado en Canvas 2D',
    'Three-way handshake SYN→SYN-ACK→ACK',
    'Cierre de conexión FIN 4-way',
    'ISN configurables o aleatorios',
    'Panel de detalles por paquete',
    'Modo paso a paso y autoplay',
  ],
});

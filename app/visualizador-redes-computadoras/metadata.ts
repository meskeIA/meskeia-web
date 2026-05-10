import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Redes de Computadoras: TCP/IP, DNS, Routing y CDN Interactivo — meskeIA',
  description: 'Visualizador interactivo de redes de computadoras. Modelo TCP/IP con encapsulamiento animado, resolución DNS paso a paso, routing BGP y simulación CDN vs latencia.',
  keywords: [
    'redes computadoras TCP/IP modelo capas',
    'DNS resolución nombres dominio',
    'routing BGP sistemas autónomos',
    'CDN latencia optimización web',
    'HTTP2 HTTP3 QUIC protocolo',
    'encapsulamiento datos trama paquete segmento',
    'modelo OSI capas red',
    'IP privada pública NAT',
    'resolver DNS raíz autoritativo',
    'Dijkstra enrutamiento tabla',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Redes de Computadoras: TCP/IP, DNS, Routing y CDN — meskeIA',
    description: 'Explora cómo funciona internet: encapsulamiento TCP/IP animado, resolución DNS paso a paso, routing entre sistemas autónomos y simulación de CDN vs latencia.',
    url: 'https://meskeia.com/visualizador-redes-computadoras/',
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
    title: 'Redes de Computadoras: TCP/IP, DNS, Routing y CDN',
    description: 'Visualiza cómo internet funciona por dentro: TCP/IP, DNS, BGP y CDN con animaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Visualizador Redes Computadoras meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Redes de Computadoras: TCP/IP, DNS, Routing y CDN Interactivo',
  description: 'Visualizador interactivo de redes de computadoras con 4 módulos: modelo TCP/IP con encapsulamiento SVG animado, resolución DNS iterativa/recursiva paso a paso, routing BGP con algoritmo Dijkstra simplificado y simulación CDN vs latencia global.',
  url: 'https://meskeia.com/visualizador-redes-computadoras/',
  features: [
    'Modelo TCP/IP con 4 capas SVG interactivas y encapsulamiento animado',
    'Comparativa TCP/IP vs OSI en tabla',
    'Resolución DNS iterativa y recursiva paso a paso con animación',
    'Tipos de registros DNS: A, AAAA, CNAME, MX, TXT',
    'Routing BGP con selección de ruta Dijkstra simplificado y tablas de enrutamiento',
    'Conceptos de NAT, IPs privadas y sistemas autónomos (AS)',
    'Simulación CDN vs latencia con mapa SVG mundial y slider de usuarios',
    'Comparativa HTTP/2 vs HTTP/3 (QUIC)',
    'Dark mode completo y diseño responsivo',
    'Gratuito, sin registro, disponible en español',
  ],
});

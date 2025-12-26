import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Subredes IP - CIDR, Máscaras y Direcciones | meskeIA',
  description: 'Calcula subredes IP: máscara de red, dirección de broadcast, rango de hosts, IPs disponibles. Soporta notación CIDR y máscaras de subred. Herramienta educativa para redes.',
  keywords: 'calculadora subredes, IP, CIDR, máscara de red, subred, networking, broadcast, gateway, hosts, IPv4, redes informáticas, dirección IP',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Subredes IP - CIDR y Máscaras | meskeIA',
    description: 'Calcula subredes IP: máscara de red, broadcast, rango de hosts y más. Herramienta educativa con explicaciones paso a paso.',
    url: 'https://meskeia.com/calculadora-subredes',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Subredes IP | meskeIA',
    description: 'Calcula subredes IP con CIDR, máscaras y rangos de hosts.',
  },
  other: {
    'application-name': 'Calculadora de Subredes IP meskeIA',
  },
};

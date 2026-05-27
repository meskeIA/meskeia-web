import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mi IP Pública y Conexión - Información de Red Completa | meskeIA',
  description: 'Descubre tu IP pública, ubicación aproximada, proveedor de internet, tipo de conexión y velocidad. Historial de IPs, copiar con un clic. Gratis y sin registro.',
  keywords: 'mi ip, ip publica, cual es mi ip, direccion ip, ubicacion ip, proveedor internet, isp, velocidad conexion, ipv4, ipv6, geolocalización ip',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mi IP Pública y Conexión - Información de Red Completa',
    description: 'Descubre tu IP pública, ubicación, proveedor y velocidad de conexión. Gratis y sin registro.',
    url: 'https://meskeia.com/mi-ip/',
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
    title: 'Mi IP Pública y Conexión',
    description: 'Descubre tu IP, ubicación y datos de conexión',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Mi IP y Conexión",
  description: "Descubre tu IP pública, ubicación aproximada, proveedor de internet, tipo de conexión y velocidad. Historial de IPs, copiar con un clic. Gratis y sin registro.",
  url: "https://meskeia.com/mi-ip/",
  category: 'BusinessApplication',
  features: [],
});

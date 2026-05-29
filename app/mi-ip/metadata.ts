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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una dirección IP pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una dirección IP pública es el identificador numérico único que tu proveedor de internet asigna a tu conexión para que los servidores puedan localizarte en la red. A diferencia de la IP privada (la de tu router o dispositivo dentro de casa), la IP pública es visible desde internet. Puede ser fija (siempre la misma) o dinámica (cambia periódicamente).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué mi IP muestra una ubicación diferente a donde estoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La geolocalización por IP no es precisa a nivel de calle ni ciudad; muestra la ubicación registrada por tu proveedor de internet (ISP), que suele ser la sede o nodo técnico más cercano. Si usas una VPN, el país mostrado será el del servidor VPN elegido. La precisión habitual es a nivel de ciudad o región, con márgenes de decenas de kilómetros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre IPv4 e IPv6?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IPv4 es el formato clásico de 32 bits (ej. 192.168.1.1), que permite unos 4.300 millones de direcciones; la escasez de estas direcciones impulsó IPv6. IPv6 usa 128 bits (ej. 2001:db8::1), ofreciendo un espacio prácticamente ilimitado. Muchos proveedores ya asignan ambas simultáneamente (dual-stack); si solo ves IPv4, tu conexión aún no tiene IPv6 activo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer mi IP pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer tu IP pública es útil para configurar acceso remoto a tu red doméstica, gestionar listas blancas en servicios online, diagnosticar problemas de conectividad, verificar si tu VPN está activa correctamente o comprobar qué datos geográficos expone tu conexión a los sitios web que visitas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede alguien rastrearme conociendo mi IP pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con tu IP pública se puede estimar tu país, región y proveedor de internet, pero no tu dirección exacta ni tu identidad. Para obtener datos personales, sería necesaria una orden judicial al ISP. Aun así, si quieres mayor privacidad puedes usar una VPN o Tor, que sustituyen tu IP real por la del servidor intermediario.',
      },
    },
  ],
};

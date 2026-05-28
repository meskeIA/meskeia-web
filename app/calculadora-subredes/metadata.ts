import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
    url: 'https://meskeia.com/calculadora-subredes/',
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
    title: 'Calculadora de Subredes IP | meskeIA',
    description: 'Calcula subredes IP con CIDR, máscaras y rangos de hosts.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Subredes IP meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Subredes IP",
  description: "Calcula subredes IP: máscara de red, dirección de broadcast, rango de hosts, IPs disponibles. Soporta notación CIDR y máscaras de subred. Herramienta educativa para redes.",
  url: "https://meskeia.com/calculadora-subredes/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una subred y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una subred (subnet) es una división lógica de una red IP más grande en segmentos más pequeños. Se usa para mejorar el rendimiento reduciendo el tráfico de difusión, aumentar la seguridad aislando grupos de dispositivos y gestionar mejor los rangos de direcciones IP disponibles en una organización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la notación CIDR como /24 o /16?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CIDR (Classless Inter-Domain Routing) indica cuántos bits de la dirección IP corresponden a la red. /24 significa 24 bits de red y 8 de hosts, dando 254 hosts utilizables. /16 da 65.534 hosts. /30 solo 2 hosts, ideal para enlaces punto a punto entre routers.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la dirección de broadcast y por qué no se puede asignar a un dispositivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dirección de broadcast es la última IP del rango de una subred (todos los bits de host a 1). Se usa para enviar paquetes a todos los dispositivos de esa subred simultáneamente. Como está reservada para ese uso, no puede asignarse a ningún equipo individual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos hosts utilizables tiene una subred /24, /25 y /30?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los hosts utilizables se calculan como 2^(bits de host) − 2 (se restan la dirección de red y el broadcast). Una /24 tiene 254 hosts, una /25 tiene 126, una /26 tiene 62, una /30 tiene 2 y una /32 tiene 0 (dirección de host individual).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre máscara de subred y prefijo CIDR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son dos formas de expresar lo mismo. La máscara de subred usa notación decimal con puntos: 255.255.255.0. El prefijo CIDR usa un número que indica los bits de red: /24. Ambos indican que los primeros 24 bits identifican la red y los 8 restantes identifican el host dentro de ella.',
      },
    },
  ],
};

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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el modelo TCP/IP y cuántas capas tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo TCP/IP es la arquitectura de protocolos que sustenta internet. Consta de 4 capas: Acceso a red (enlace físico), Internet (direccionamiento IP y enrutamiento), Transporte (TCP o UDP, fiabilidad extremo a extremo) y Aplicación (HTTP, DNS, SMTP, etc.). Cada capa encapsula los datos de la capa superior añadiendo su propia cabecera antes de transmitirlos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la resolución DNS cuando escribes una URL en el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El navegador primero consulta su caché local; si no encuentra la respuesta, pregunta al resolver DNS del proveedor de internet. Este, si tampoco tiene la respuesta en caché, pregunta a los servidores raíz, luego al servidor TLD (como .com) y finalmente al servidor autoritativo del dominio, que devuelve la dirección IP. Todo el proceso suele completarse en menos de 100 ms.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre TCP y UDP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TCP (Transmission Control Protocol) establece una conexión fiable: garantiza entrega ordenada, retransmite paquetes perdidos y controla la congestión. UDP (User Datagram Protocol) es sin conexión y no garantiza entrega ni orden, pero tiene muy baja latencia. TCP se usa para web, correo y descargas; UDP para videollamadas, streaming en directo y videojuegos donde importa más la velocidad que la exactitud.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una CDN y cómo reduce la latencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una CDN (Content Delivery Network) es una red de servidores distribuidos geográficamente que almacenan copias del contenido cerca de los usuarios finales. Cuando un usuario solicita un recurso, la CDN lo sirve desde el nodo más próximo en lugar del servidor de origen, reduciendo la latencia y la carga en el servidor principal. Empresas como Cloudflare, Akamai o AWS CloudFront operan miles de puntos de presencia en todo el mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mejoras aporta HTTP/3 respecto a HTTP/2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HTTP/3 sustituye TCP por QUIC, un protocolo basado en UDP que elimina el bloqueo de cabecera de línea (head-of-line blocking): si se pierde un paquete, solo se retrasa el flujo afectado, no toda la conexión. Además, QUIC integra cifrado TLS 1.3 desde el primer paquete y permite reconexiones más rápidas al cambiar de red (por ejemplo, de WiFi a datos móviles), lo que reduce la latencia percibida hasta un 30 % en redes con pérdida de paquetes.',
      },
    },
  ],
};

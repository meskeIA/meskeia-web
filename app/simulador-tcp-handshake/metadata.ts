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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el TCP three-way handshake y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TCP three-way handshake (saludo en tres pasos) es el mecanismo que usa el protocolo TCP para establecer una conexión fiable entre dos equipos antes de intercambiar datos. Consta de tres pasos: el cliente envía SYN, el servidor responde con SYN-ACK y el cliente confirma con ACK. Garantiza que ambos lados están activos, acuerdan los números de secuencia iniciales (ISN) y están listos para comunicarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significan SYN, SYN-ACK y ACK en TCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SYN (synchronize) es el paquete con el que el cliente inicia la conexión e indica su número de secuencia inicial. SYN-ACK (synchronize-acknowledge) es la respuesta del servidor: confirma el SYN del cliente y anuncia su propio número de secuencia. ACK (acknowledge) es la confirmación final del cliente, que completa el handshake y abre la conexión para la transferencia de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué TCP necesita tres pasos y no dos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con dos pasos solo el servidor confirmaría que recibió el SYN del cliente, pero el cliente nunca confirmaría que recibió el SYN-ACK del servidor. El tercer paso (ACK del cliente) verifica que la comunicación bidireccional funciona y permite sincronizar los números de secuencia de ambos lados. Sin él, el servidor podría abrir una conexión que el cliente nunca completó, desperdiciando recursos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se cierra una conexión TCP correctamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cierre de una conexión TCP se hace con un four-way handshake usando el flag FIN. El lado que quiere cerrar envía FIN, el otro responde con ACK, luego envía su propio FIN y espera el ACK final. Esto permite que cada dirección de la conexión se cierre de forma independiente (half-close), asegurando que no se pierdan datos en tránsito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre TCP y UDP en cuanto al establecimiento de conexión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TCP es un protocolo orientado a conexión: antes de enviar datos realiza el three-way handshake para garantizar fiabilidad, orden y control de flujo. UDP es un protocolo sin conexión: envía datagramas directamente sin establecer ningún canal previo. UDP es más rápido (sin overhead del handshake) pero no garantiza entrega ni orden, por lo que se usa en streaming, videojuegos online y DNS.',
      },
    },
  ],
};

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
    url: 'https://meskeia.com/visualizador-internet-60-segundos/',
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué ocurre exactamente cuando escribo una URL y pulso Enter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al pulsar Enter, tu navegador pregunta al servidor DNS cuál es la dirección IP del dominio. A continuación establece una conexión TCP con ese servidor, negocia el cifrado HTTPS y envía la solicitud HTTP. El servidor responde con el contenido y el navegador lo renderiza en pantalla. Todo el proceso suele completarse en menos de 300 milisegundos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el DNS y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El DNS (Domain Name System) es el sistema que traduce nombres de dominio legibles (como "wikipedia.org") a direcciones IP numéricas (como 185.15.58.224) que los routers y servidores entienden. Funciona como una agenda telefónica distribuida con millones de servidores en todo el mundo. Sin DNS tendrías que memorizar la dirección IP de cada sitio que visitas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los datos viajan tan rápido por Internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los datos viajan en forma de señales eléctricas u ópticas a través de cables de fibra óptica que transmiten a cerca del 70 % de la velocidad de la luz. Los cables submarinos transoceánicos conectan continentes y pueden transferir cientos de terabits por segundo. Además, las redes de distribución de contenido (CDN) almacenan copias de las páginas en servidores cercanos al usuario para reducir la distancia física.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el protocolo TCP/IP y por qué se usa en Internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TCP/IP es el conjunto de reglas que define cómo se dividen los datos en paquetes, cómo se enrutan por la red y cómo se reensamblan en el destino. TCP garantiza que todos los paquetes lleguen y en el orden correcto, mientras que IP se encarga de que cada paquete encuentre su camino entre routers. Este diseño en capas hace que Internet sea robusta y que funcione aunque parte de la red falle.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos cables submarinos existen y qué pasaría si se cortaran?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen más de 550 cables submarinos activos que forman la columna vertebral de Internet intercontinental, transportando más del 95 % del tráfico internacional. Los cortes ocurren varias veces al año, normalmente por anclas o actividad sísmica. Gracias a que los cables forman rutas redundantes, el tráfico se redirige automáticamente por rutas alternativas, aunque con mayor latencia.',
      },
    },
  ],
};

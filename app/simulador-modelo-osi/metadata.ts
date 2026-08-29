import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Modelo OSI - Encapsulación de las 7 Capas de Red | meskeIA',
  description:
    'Recorre las 7 capas del modelo OSI paso a paso: observa cómo un mensaje se encapsula en el emisor (datos → segmento → paquete → trama → bits) y se desencapsula en el receptor. Compara OSI con el modelo TCP/IP, con protocolos, PDU y dispositivos de cada capa.',
  keywords:
    'modelo OSI, 7 capas OSI, encapsulación, desencapsulación, capa física enlace red transporte sesión presentación aplicación, PDU, modelo TCP/IP, protocolos de red, trama paquete segmento, redes de computadoras, FP informática, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-modelo-osi/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Modelo OSI: las 7 capas | meskeIA',
    description: 'Encapsulación y desencapsulación paso a paso, con comparativa OSI vs TCP/IP',
    url: 'https://meskeia.com/simulador-modelo-osi/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Modelo OSI: las 7 capas | meskeIA',
    description: 'Cómo viaja un mensaje por las 7 capas de red, paso a paso',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Modelo OSI',
  description:
    'Simulador interactivo del modelo OSI de 7 capas. Recorre paso a paso la encapsulación de un mensaje en el emisor y su desencapsulación en el receptor, viendo cómo cada capa añade su cabecera y cómo cambia la unidad de datos (PDU). Incluye varios escenarios (web, correo, streaming), la comparativa con el modelo TCP/IP y el detalle de protocolos y dispositivos de cada capa.',
  url: 'https://meskeia.com/simulador-modelo-osi/',
  category: 'EducationalApplication',
  features: [
    'Las 7 capas OSI con su función, PDU y protocolos',
    'Encapsulación y desencapsulación animadas paso a paso',
    'Escenarios: navegación web, correo y streaming',
    'Comparativa con el modelo TCP/IP de 4 capas',
    'Detalle de protocolos y dispositivos por capa',
    'Visualización de la PDU con sus cabeceras',
    'En español',
  ],
  keywords: ['modelo OSI', '7 capas', 'encapsulación', 'TCP/IP', 'redes'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 7 capas del modelo OSI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De arriba abajo son: 7 Aplicación (HTTP, SMTP, DNS), 6 Presentación (cifrado TLS, formatos como JPEG), 5 Sesión (gestión de la conexión), 4 Transporte (TCP y UDP, puertos), 3 Red (IP, enrutamiento), 2 Enlace de datos (Ethernet, Wi-Fi, direcciones MAC) y 1 Física (cables, señales, bits). Una regla para recordarlas de la 1 a la 7 es "Felipe Enseña Régimen Tributario Sin Presentar Apuntes".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la encapsulación en redes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es el proceso por el que, al bajar por las capas en el emisor, cada capa añade su propia cabecera (y a veces una cola) a los datos que recibe de la capa superior. Así los datos de aplicación se convierten en segmento (capa 4, al añadir la cabecera TCP/UDP), luego en paquete (capa 3, cabecera IP), luego en trama (capa 2, cabecera Ethernet y cola FCS) y por último en bits (capa 1). En el receptor ocurre el proceso inverso, la desencapsulación: cada capa quita su cabecera y pasa el contenido hacia arriba.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el modelo OSI y el modelo TCP/IP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo OSI es un marco teórico de 7 capas que sirve para entender y enseñar cómo funcionan las redes. El modelo TCP/IP es el que se usa realmente en Internet y tiene 4 capas: Aplicación (agrupa las capas OSI 7, 6 y 5), Transporte (capa 4), Internet (capa 3) y Acceso a la red (capas 2 y 1). OSI separa más las responsabilidades; TCP/IP es más práctico y refleja los protocolos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una PDU y por qué cambia de nombre en cada capa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PDU significa Unidad de Datos de Protocolo: es el nombre que recibe el bloque de información en cada capa. Cambia de nombre porque cada capa le añade su propia cabecera y la trata como una unidad distinta: en la capa de transporte es un segmento (TCP) o datagrama (UDP), en la de red un paquete, en la de enlace una trama y en la física una secuencia de bits. En las capas superiores (5 a 7) se habla simplemente de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué capa trabajan un router, un switch y un hub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El router trabaja en la capa 3 (Red): usa direcciones IP para decidir por dónde enviar los paquetes entre redes distintas. El switch trabaja en la capa 2 (Enlace de datos): reenvía tramas dentro de una misma red usando direcciones MAC. El hub trabaja en la capa 1 (Física): solo repite la señal eléctrica a todos los puertos, sin entender direcciones. Por eso un switch es más eficiente que un hub.',
      },
    },
  ],
};

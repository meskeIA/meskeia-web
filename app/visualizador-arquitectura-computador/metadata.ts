import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Arquitectura del Computador — CPU, Ciclo Fetch-Decode-Execute y Memoria | meskeIA',
  description:
    'Visualiza cómo funciona un computador: arquitectura Von Neumann, CPU con ALU y registros, ciclo fetch-decode-execute animado y jerarquía de memoria. Para estudiantes de informática, preparatoria y secundaria.',
  keywords:
    'arquitectura computador, Von Neumann, CPU, ALU, fetch decode execute, registros, jerarquía memoria, caché, RAM, informática bachillerato, informática preparatoria, informática secundaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Arquitectura del Computador — CPU, Ciclo FDE y Memoria',
    description:
      'Diagrama Von Neumann interactivo, componentes de la CPU, ciclo fetch-decode-execute animado y jerarquía de memoria con latencias reales.',
    url: 'https://meskeia.com/visualizador-arquitectura-computador',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arquitectura del Computador — CPU, FDE y Memoria | meskeIA',
    description:
      'Von Neumann, ALU, registros y ciclo fetch-decode-execute explicados de forma visual e interactiva.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Arquitectura Computador meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Arquitectura del Computador',
  description:
    'Visualizador interactivo de la arquitectura Von Neumann: CPU con ALU y registros, ciclo fetch-decode-execute animado paso a paso y jerarquía de memoria con latencias reales. Para estudiantes de informática, Bachillerato tecnológico (España), preparatoria y secundaria (Latinoamérica).',
  url: 'https://meskeia.com/visualizador-arquitectura-computador/',
  features: [
    'Diagrama Von Neumann interactivo: CPU, RAM, ROM, buses y dispositivos E/S',
    'Componentes de la CPU: ALU, Unidad de Control, PC, IR, MAR, MDR, ACC',
    'Ciclo fetch-decode-execute animado paso a paso con mini-programa de ejemplo',
    'Jerarquía de memoria: de registros a HDD con velocidad, tamaño y latencia reales',
    'Ideal para 1º de carrera de informática, Bachillerato tecnológico, preparatoria y secundaria',
    'Gratuito, sin registro, 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la arquitectura Von Neumann y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La arquitectura Von Neumann, propuesta por John von Neumann en 1945, es el modelo en el que se basan prácticamente todos los computadores modernos. Define que el programa y los datos se almacenan en la misma memoria, y que la CPU los procesa de forma secuencial siguiendo el ciclo fetch-decode-execute. Su importancia radica en que separó el hardware del software: el mismo procesador puede ejecutar cualquier programa simplemente cargando instrucciones distintas en memoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los componentes principales de la CPU?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La CPU contiene la Unidad Aritmético-Lógica (ALU), que realiza operaciones matemáticas y lógicas; la Unidad de Control (UC), que interpreta y coordina la ejecución de instrucciones; y los registros, que son posiciones de memoria ultrarrápidas integradas en el propio procesador. Los registros más relevantes son el Contador de Programa (PC), el Registro de Instrucción (IR), el Acumulador (ACC), y los registros MAR y MDR para el acceso a memoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el ciclo fetch-decode-execute?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo fetch-decode-execute es el proceso básico que repite la CPU para ejecutar cada instrucción. En la fase fetch (búsqueda), la CPU lee la instrucción desde la dirección de memoria indicada por el PC. En la fase decode (decodificación), la Unidad de Control interpreta el código de operación. En la fase execute (ejecución), la ALU o la propia UC realizan la operación indicada: suma, movimiento de datos, salto, etc.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la jerarquía de memoria en un computador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jerarquía de memoria ordena los distintos tipos de almacenamiento de más rápido y caro a más lento y barato: registros (< 1 ns, pocos bytes), caché L1/L2/L3 (nanosegundos, megabytes), RAM (10-100 ns, gigabytes) y almacenamiento persistente como SSD o HDD (microsegundos a milisegundos, terabytes). La CPU accede primero a los niveles más rápidos; si no encuentra el dato (fallo de caché), busca en el nivel inferior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la arquitectura Von Neumann y la arquitectura Harvard?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la arquitectura Von Neumann, instrucciones y datos comparten el mismo bus y memoria, lo que puede crear un cuello de botella. La arquitectura Harvard utiliza memorias y buses separados para instrucciones y datos, permitiendo acceder a ambos simultáneamente y aumentando el rendimiento. Los microcontroladores y procesadores de señal digital (DSP) suelen usar Harvard pura o Harvard modificada; los ordenadores de propósito general usan Von Neumann con cachés separadas que emulan en parte las ventajas de Harvard.',
      },
    },
  ],
};

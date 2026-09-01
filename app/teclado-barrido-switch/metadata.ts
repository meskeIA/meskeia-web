import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Teclado de Barrido por Switch - Escribe con un Solo Pulsador | meskeIA',
  description:
    'Practica el acceso por switch: barrido automático fila-columna del teclado con un único pulsador (barra espaciadora, clic o el switch que configures). Velocidad ajustable, lectura en voz alta y orden por frecuencia de letras.',
  keywords:
    'teclado de barrido, switch access, acceso por switch, barrido por conmutador, escaneo fila columna, comunicación aumentativa, accesibilidad motriz, parálisis cerebral, ELA, esclerosis lateral amiotrófica, distrofia muscular, single switch scanning',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Teclado de Barrido por Switch',
    description:
      'Escribe con un único pulsador: barrido fila-columna configurable. Herramienta de práctica y demostración.',
    url: 'https://meskeia.com/teclado-barrido-switch/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teclado de Barrido por Switch',
    description: 'Escribe con un único pulsador: barrido fila-columna configurable, en el navegador.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Teclado de Barrido por Switch meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Teclado de Barrido por Switch',
  description:
    'Teclado en pantalla con barrido automático fila-columna para escribir con un único pulsador (switch). Velocidad y tecla de activación configurables, orden de letras por frecuencia y lectura en voz alta.',
  url: 'https://meskeia.com/teclado-barrido-switch/',
  features: [
    'Barrido automático fila-columna con velocidad configurable',
    'Un solo pulsador (switch): remapeable a cualquier tecla o a un clic',
    'Orden de letras por frecuencia en español, para escribir con menos pasos',
    'Lectura en voz alta del texto escrito',
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
      name: '¿Qué es un teclado de barrido por switch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un método de escritura pensado para personas que no pueden usar un teclado o un ratón convencional. El sistema resalta automáticamente filas y luego columnas del teclado, y la persona solo necesita un único pulsador (switch) para seleccionar cuándo detener el barrido en la letra que quiere.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al iniciar el barrido, las filas del teclado se resaltan una a una. Al pulsar tu switch (por defecto, la barra espaciadora) se fija esa fila y empieza a resaltarse cada letra dentro de ella; una segunda pulsación selecciona la letra. Puedes cambiar la tecla de activación, la velocidad del barrido y el orden de las letras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un teclado de barrido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para personas con movilidad muy reducida en manos y brazos —esclerosis lateral amiotrófica (ELA), parálisis cerebral, distrofia muscular, lesión medular— que solo pueden accionar un único pulsador de forma fiable, y para quien quiera entender o practicar esta técnica antes de configurar un dispositivo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sustituye a un dispositivo de comunicación aumentativa certificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Es una herramienta de práctica y demostración, gratuita y sin instalación. Una configuración real para uso diario debe hacerla un terapeuta ocupacional o logopeda, ajustada a la capacidad motora concreta de cada persona y, normalmente, sobre software o hardware certificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hace falta un pulsador físico especial para probarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. En un ordenador basta la barra espaciadora o un clic; en el móvil, un toque en pantalla. Los pulsadores de accesibilidad reales (switches físicos) se conectan al ordenador o al móvil emulando una tecla o un clic, así que funcionan igual sin configuración adicional en la propia herramienta.',
      },
    },
  ],
};

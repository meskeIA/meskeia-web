import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Amplificador de Sonido en Vivo: Escucha Amplificada con el Micrófono - meskeIA',
  description:
    'Amplifica el sonido de tu entorno en tiempo real con el micrófono de tu móvil o celular y unos auriculares. Sube el volumen, realza las voces y escucha mejor las conversaciones. Gratis y sin instalar.',
  keywords:
    'amplificador de sonido, escucha amplificada, amplificar audio en vivo, oír mejor conversaciones, realzar voces, ayuda auditiva, accesibilidad auditiva, aumentar volumen del ambiente, micrófono y auriculares',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Amplificador de Sonido en Vivo — Escucha amplificada con el micrófono',
    description:
      'Convierte tu móvil o celular en un amplificador de escucha: capta el sonido del entorno, sube el volumen y realza las voces en tiempo real con unos auriculares.',
    url: 'https://meskeia.com/amplificador-sonido',
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
    title: 'Amplificador de Sonido en Vivo',
    description:
      'Amplifica y realza el sonido de tu entorno en tiempo real con el micrófono y unos auriculares. Gratis y sin instalar.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Amplificador de Sonido meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Amplificador de Sonido en Vivo',
  description:
    'Herramienta de escucha asistida que capta el sonido del entorno con el micrófono del dispositivo, lo amplifica y lo realza en tiempo real para escucharlo con auriculares. Útil para oír mejor conversaciones, la televisión o clases.',
  url: 'https://meskeia.com/amplificador-sonido/',
  features: [
    'Amplifica el sonido del ambiente en tiempo real con el micrófono',
    'Control de volumen (ganancia) ajustable con un deslizador',
    'Realce de voz para entender mejor las conversaciones',
    'Reducción de ruido de fondo opcional',
    'Medidor de nivel de señal en vivo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y respetuoso con la privacidad (el audio no sale del dispositivo)',
  ],
});

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un amplificador de sonido en vivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una herramienta que usa el micrófono de tu móvil, celular u ordenador para captar el sonido de tu entorno, amplificarlo y reproducirlo al instante en tus auriculares. Sirve para oír mejor una conversación, la televisión o una clase cuando el volumen te llega bajo, sin instalar nada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito auriculares para usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, son imprescindibles. Sin auriculares el micrófono vuelve a captar el sonido que sale por el altavoz y se produce un acople (un pitido agudo llamado efecto Larsen). Valen auriculares con cable o Bluetooth; con cable la latencia es menor y la escucha resulta más natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sustituye a un audífono o aparato auditivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Es una ayuda puntual de escucha, no un producto sanitario. No sustituye a un audífono (aparato auditivo) ni a una evaluación audiológica. Si notas pérdida de audición, consulta con un profesional: un audífono se adapta a tu pérdida concreta y esta herramienta no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo ayuda a entender mejor las conversaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Además de subir el volumen general, incluye un realce de voz que refuerza las frecuencias del habla (aproximadamente entre 1.000 y 3.000 Hz), donde se distinguen las consonantes. Combinado con la reducción de ruido de fondo, hace que las palabras destaquen sobre el murmullo del ambiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro para el oído?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Siempre que mantengas el volumen moderado. Una amplificación excesiva y prolongada puede dañar la audición, igual que escuchar música muy alta. Empieza con la ganancia baja y súbela poco a poco hasta oír con comodidad; si notas molestia o pitidos, baja el volumen.',
      },
    },
  ],
};

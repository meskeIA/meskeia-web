import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Código Morse Online - Texto a Morse y Morse a Texto | meskeIA',
  description: 'Conversor de código Morse gratuito. Traduce texto a código Morse y viceversa. Reproduce el sonido del mensaje. Incluye alfabeto Morse completo.',
  keywords: 'codigo morse, conversor morse, traductor morse, morse a texto, texto a morse, alfabeto morse, SOS morse',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Código Morse Online - meskeIA',
    description: 'Traduce texto a código Morse y viceversa. Con sonido y alfabeto completo.',
    url: 'https://meskeia.com/conversor-morse/',
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
    title: 'Conversor de Código Morse Online',
    description: 'Traduce texto a código Morse y viceversa. Con sonido y alfabeto completo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Código Morse",
  description: "Conversor de código Morse gratuito. Traduce texto a código Morse y viceversa. Reproduce el sonido del mensaje. Incluye alfabeto Morse completo.",
  url: "https://meskeia.com/conversor-morse/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el código Morse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El código Morse es un sistema de codificación que representa letras, números y signos de puntuación mediante combinaciones de señales cortas (puntos) y largas (rayas). Fue desarrollado por Samuel Morse y Alfred Vail en la década de 1830 para su uso en la telegrafía. Aunque hoy en día se usa poco en comunicaciones profesionales, sigue siendo el método de señalización de socorro internacional (SOS: · · · — — — · · ·).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la traducción de texto a código Morse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada letra y número tiene una secuencia única de puntos y rayas. Por ejemplo, la "A" es · — y la "E" es simplemente ·. El conversor toma cada carácter del texto, lo busca en la tabla del alfabeto Morse internacional (ITU-R M.1677) y produce la secuencia correspondiente. Las palabras se separan con una barra (/) y los caracteres con espacios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve aprender código Morse hoy en día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aunque la telegrafía comercial desapareció en los años 90, el código Morse sigue siendo útil en radioafición (la licencia de operador amateur todavía lo evalúa en muchos países), en señalización de emergencia mediante luz o sonido, y como ejercicio de memoria y decodificación. También se usa en accesibilidad, ya que personas con movilidad reducida pueden comunicarse mediante pulsaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el código Morse americano y el internacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El código Morse americano (también llamado "Railroad Morse") fue el original y contenía señales de longitud variable para las letras más comunes. El código Morse internacional (o Continental Morse), estandarizado por la UIT, usa solo puntos y rayas y es el estándar vigente en todo el mundo. Los conversores online usan siempre el código internacional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se escribe SOS en código Morse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SOS en código Morse es · · · — — — · · · (tres puntos, tres rayas, tres puntos). Fue adoptado como señal de socorro internacional en 1906 precisamente por su sencillez y simetría, que lo hacen inconfundible. No es un acrónimo; se eligió únicamente por su facilidad de transmisión y reconocimiento.',
      },
    },
  ],
};

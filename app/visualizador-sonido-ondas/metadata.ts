import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sonido y Ondas - Frecuencia, Amplitud y Decibelios | meskeIA',
  description: 'Explora la física del sonido: ondas, frecuencia, amplitud, decibelios, armónicos y timbre. Entiende por qué una guitarra y un piano suenan diferente tocando la misma nota.',
  keywords: 'sonido, ondas, frecuencia, amplitud, decibelios, armónicos, timbre, acústica, física visual, ondas sonoras, espectro audible',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sonido y Ondas - Frecuencia, Amplitud y Decibelios',
    description: 'Explora la física del sonido: ondas, frecuencia, amplitud, decibelios y timbre. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-sonido-ondas/',
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
    title: 'Sonido y Ondas - Explicador Visual Interactivo',
    description: 'Ondas, frecuencia, decibelios y armónicos: la física del sonido explicada visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sonido y Ondas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sonido y Ondas - Frecuencia, Amplitud y Decibelios',
  description: 'Explicador visual interactivo sobre la física del sonido: anatomía de ondas sonoras, frecuencia y tono, escala de decibelios con niveles de seguridad auditiva, timbre y armónicos que distinguen instrumentos musicales.',
  url: 'https://meskeia.com/visualizador-sonido-ondas/',
  category: 'EducationalApplication',
  features: [
    'Onda sinusoidal interactiva con sliders de frecuencia y amplitud',
    'Rango audible humano y frecuencias de notas musicales',
    'Escala de decibelios con niveles de seguridad auditiva',
    'Timbre y armónicos: por qué cada instrumento suena diferente',
    'Efecto Doppler y resonancia explicados visualmente',
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
      name: '¿Qué es la frecuencia del sonido y cómo afecta al tono que escuchamos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La frecuencia es el número de vibraciones por segundo de una onda sonora y se mide en hercios (Hz). A mayor frecuencia, más agudo percibimos el sonido; a menor frecuencia, más grave. El oído humano percibe frecuencias entre aproximadamente 20 Hz y 20.000 Hz. La nota La de referencia musical, por ejemplo, tiene una frecuencia de 440 Hz. Con la edad, la capacidad para escuchar frecuencias altas disminuye.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los decibelios y a partir de qué nivel es peligroso el sonido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El decibelio (dB) es la unidad que mide la intensidad o presión de un sonido. La escala es logarítmica: 20 dB equivalen a un susurro, 60 dB a una conversación normal y 85 dB al ruido de tráfico intenso. La exposición prolongada a sonidos superiores a 85 dB puede causar daño auditivo permanente. Un concierto de rock puede superar los 110 dB, nivel en el que el daño puede producirse en menos de dos minutos de exposición continuada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué una guitarra y un piano suenan diferente aunque toquen la misma nota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aunque la frecuencia fundamental (el tono) sea la misma, cada instrumento genera un patrón distinto de armónicos: frecuencias múltiplas de la fundamental que suenan a la vez. La mezcla concreta de esos armónicos y su intensidad relativa determina el timbre del instrumento. La caja de resonancia, el material de las cuerdas o el mecanismo de producción del sonido modelan ese espectro armónico de forma única para cada instrumento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el efecto Doppler y por qué cambia el sonido de una ambulancia al pasar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto Doppler es el cambio aparente de frecuencia de una onda cuando la fuente o el observador están en movimiento relativo. Cuando una ambulancia se aproxima, las ondas sonoras se comprimen porque la fuente avanza hacia nosotros, lo que percibimos como un tono más agudo. Al alejarse, las ondas se estiran y el tono baja. El mismo principio se aplica en radar, sonar y astronomía (corrimiento al rojo de galaxias que se alejan).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo viaja el sonido y por qué no puede propagarse en el vacío?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sonido es una onda mecánica de presión que necesita un medio material (aire, agua, sólidos) para propagarse: las moléculas se comprimen y expanden en cadena transmitiendo la vibración. En el vacío no existen moléculas que transmitan esa perturbación, por lo que el sonido no puede viajar. La velocidad del sonido en el aire a 20 °C es de unos 343 m/s, pero es unas 4,3 veces mayor en el agua y hasta 15 veces mayor en algunos metales.',
      },
    },
  ],
};

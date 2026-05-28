import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Ondas y Visualizador de Audio - Señales Sonoras | meskeIA',
  description: 'Genera ondas sonoras (senoidal, cuadrada, triangular, diente de sierra), visualiza audio y aprende sobre frecuencias. Herramienta educativa interactiva para física y música.',
  keywords: 'generador ondas, onda senoidal, onda cuadrada, frecuencia sonido, visualizador audio, waveform, oscilador, Hz, hercios, fisica sonido, sintesis audio, educativo, aprender ondas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Ondas y Visualizador de Audio | meskeIA',
    description: 'Genera ondas sonoras, visualiza audio y aprende sobre frecuencias. Herramienta educativa interactiva.',
    url: 'https://meskeia.com/generador-ondas/',
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
    title: 'Generador de Ondas y Visualizador de Audio | meskeIA',
    description: 'Genera ondas sonoras y visualiza audio. Aprende física del sonido de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Ondas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Ondas y Visualizador",
  description: "Genera ondas sonoras (senoidal, cuadrada, triangular, diente de sierra), visualiza audio y aprende sobre frecuencias. Herramienta educativa interactiva para física y música.",
  url: "https://meskeia.com/generador-ondas/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una onda senoidal, cuadrada y triangular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La onda senoidal es la forma más pura del sonido, con una sola frecuencia y un timbre suave. La onda cuadrada alterna bruscamente entre dos valores y tiene un sonido más áspero y rico en armónicos impares. La onda triangular varía de forma lineal y produce un timbre más suave que la cuadrada. La onda diente de sierra contiene todos los armónicos y es la base de muchos sintetizadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la frecuencia de un sonido y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La frecuencia es el número de ciclos completos que realiza una onda por segundo y se mide en hercios (Hz). El oído humano percibe sonidos entre 20 Hz y 20.000 Hz aproximadamente. Los sonidos graves tienen frecuencias bajas (20-250 Hz), los medios están entre 250 y 4.000 Hz, y los agudos superan los 4.000 Hz. El LA central de un piano equivale a 440 Hz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa un generador de ondas en educación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de ondas permite visualizar en tiempo real la relación entre frecuencia, amplitud y forma de onda, haciendo tangibles conceptos abstractos de física y música. Es útil para explicar fenómenos como la resonancia, los armónicos, el batido entre dos frecuencias o la síntesis de sonido. Se emplea en bachillerato, ingeniería de sonido y música electrónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la síntesis de audio y cómo se relaciona con las formas de onda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La síntesis de audio es el proceso de crear sonidos electrónicamente combinando y modificando formas de onda. Los sintetizadores parten de osciladores que generan ondas básicas (senoidal, cuadrada, triangular, diente de sierra) y las procesan con filtros y moduladores para crear timbres complejos. Esta técnica es la base de la música electrónica y el diseño de sonido para cine y videojuegos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la amplitud de una onda al volumen percibido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La amplitud es la magnitud máxima de la oscilación de la onda. A mayor amplitud, mayor energía y, en consecuencia, mayor volumen percibido. El nivel de presión sonora se mide en decibelios (dB): un aumento de 10 dB equivale a percibir el sonido aproximadamente el doble de fuerte. Un susurro ronda los 30 dB, una conversación normal los 60 dB y un concierto puede superar los 110 dB.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Tonos y Frecuencias Hz Online (20-20000 Hz) - Audio Test',
  description: 'Genera tonos puros y frecuencias de audio entre 20 Hz y 20.000 Hz. Ondas senoidal, cuadrada, triangular y sierra. Para test de oído, tinnitus y calibrar altavoces.',
  keywords: 'generador de tonos, generador de frecuencias, test de audio, frecuencia Hz, onda senoidal, calibración altavoces, tono puro, audio test',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-tonos/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Tonos y Frecuencias Hz Online (20-20000 Hz)',
    description: 'Tonos puros entre 20 Hz y 20.000 Hz. Ondas senoidal, cuadrada, triangular y sierra. Test de oído, tinnitus, calibrar altavoces.',
    url: 'https://meskeia.com/generador-tonos/',
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
    title: 'Generador de Tonos y Frecuencias Hz Online',
    description: '20 Hz a 20.000 Hz. Test de oído, tinnitus y calibrar altavoces.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Tonos',
  description: 'Generador online de tonos y frecuencias de audio entre 20 Hz y 20.000 Hz. Útil para tests de audio, calibración de altavoces y auriculares, ejercicios de tinnitus y experimentos acústicos.',
  url: 'https://meskeia.com/generador-tonos/',
  category: 'UtilityApplication',
  features: [
    'Generación de tonos puros entre 20 Hz y 20.000 Hz',
    'Cuatro formas de onda: senoidal, cuadrada, triangular, sierra',
    'Control fino de frecuencia y volumen',
    'Útil para tests de audio y calibración',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: ['generador tonos', 'frecuencias audio', 'test audio', 'calibración altavoces', 'tinnitus'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve un generador de tonos online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de tonos produce frecuencias de audio puras que puedes usar para varias pruebas: comprobar el rango de frecuencias que escuchas, detectar pérdida auditiva en frecuencias concretas, calibrar altavoces y auriculares, o explorar fenómenos acústicos como los tonos binaurales. También se usa en audioterapia y para generar ruido blanco o tonos de referencia en producción musical.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué rango de frecuencias puede oír el ser humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El oído humano adulto percibe sonidos en el rango de aproximadamente 20 Hz a 20.000 Hz (20 kHz). Con la edad, la capacidad de escuchar frecuencias altas disminuye: la mayoría de adultos mayores de 40 años ya no perciben con claridad por encima de 15.000-16.000 Hz. Los niños y adolescentes pueden escuchar con más facilidad frecuencias cerca de los 20.000 Hz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una onda senoidal, cuadrada, triangular y sierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La onda senoidal es el tono más puro, sin armónicos, y suena suave. La onda cuadrada tiene un timbre metálico y brillante por sus múltiples armónicos impares. La onda triangular es similar a la senoidal pero con más brillo. La onda de sierra (diente de sierra) es la más rica en armónicos y suena más agresiva. Para tests de oído y calibración, se recomienda la senoidal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo uso el generador de tonos para hacer un test de audición básico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la onda senoidal, ajusta el volumen a un nivel moderado con auriculares y barre las frecuencias desde 20 Hz hasta 20.000 Hz. Anota la frecuencia más alta que puedes escuchar claramente. Si no percibes tonos por encima de 8.000-10.000 Hz, puede indicar pérdida auditiva en agudos. Este test es orientativo; para un diagnóstico auditivo profesional consulta a un audioprotesista.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo para usar el generador de tonos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El generador funciona completamente en el navegador mediante la Web Audio API, sin necesidad de descargar ni instalar ninguna aplicación. Es compatible con Chrome, Firefox, Safari y Edge en ordenadores y móviles. Solo necesitas unos auriculares o altavoces y tener el volumen activado en tu dispositivo.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Frecuencias Hz y Tonos Online (20-20.000 Hz)',
  description: 'Genera tonos puros y frecuencias de audio entre 20 Hz y 20.000 Hz, y mide con el micrófono cuántos hercios tiene un sonido. Ondas senoidal, cuadrada, triangular y sierra.',
  keywords: 'generador de tonos, generador de frecuencias, medidor de frecuencia, medidor de hz, test de audio, frecuencia Hz, onda senoidal, calibración altavoces, tono puro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-tonos/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Frecuencias Hz y Tonos Online (20-20.000 Hz)',
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
    title: 'Generador de Frecuencias Hz y Tonos Online',
    description: '20 Hz a 20.000 Hz. Test de oído, tinnitus y calibrar altavoces.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Tonos',
  description: 'Generador online de tonos y frecuencias de audio entre 20 Hz y 20.000 Hz, con medidor de la frecuencia de un sonido por el micrófono. Útil para tests de audio, calibración de altavoces y auriculares, ejercicios de tinnitus y experimentos acústicos.',
  url: 'https://meskeia.com/generador-tonos/',
  category: 'UtilityApplication',
  features: [
    'Generación de tonos puros entre 20 Hz y 20.000 Hz',
    'Cuatro formas de onda: senoidal, cuadrada, triangular, sierra',
    'Control fino de frecuencia y volumen',
    'Medidor de frecuencia con el micrófono: hercios y nota musical del sonido que más destaca',
    'Medida de la respuesta en frecuencia con el micrófono, en tercios de octava (ISO 266)',
    'Comparación A/B de dos posiciones o dos altavoces en decibelios relativos',
    'Útil para tests de audio y calibración',
  ],
  keywords: ['generador tonos', 'frecuencias audio', 'medidor de frecuencia', 'test audio', 'calibración altavoces', 'tinnitus'],
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
        text: 'Un generador de tonos produce frecuencias de audio puras, con la misma señal en los dos oídos, que puedes usar para varias pruebas: comprobar de forma orientativa hasta qué frecuencia escuchas, calibrar altavoces y auriculares con tonos sueltos o con un barrido, afinar un instrumento con una nota de referencia o enseñar en clase cómo suenan las ondas senoidal, cuadrada, triangular y sierra. También permite medir, con el micrófono del propio aparato, cómo cambia la respuesta de un altavoz entre dos posiciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo medir la frecuencia de un sonido en hercios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con el micrófono del móvil o del ordenador: el medidor de esta página analiza el audio con una transformada de Fourier, busca el pico que más destaca y lo afina entre los puntos del análisis, de modo que con un tono limpio y sostenido la cifra queda a menos de un hercio. También indica la nota musical más cercana y sus cents de desviación. En una voz o un instrumento el pico más fuerte puede ser un armónico, el doble o el triple de la nota que se oye, así que para afinar conviene un afinador, que busca la fundamental. El audio se analiza en el propio navegador y no se envía a ningún sitio.',
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
        text: 'Selecciona la onda senoidal, ajusta el volumen a un nivel moderado con auriculares y barre las frecuencias desde 20 Hz hasta 20.000 Hz. Anota la frecuencia más alta que puedes escuchar claramente. Si no percibes tonos por encima de 8.000-10.000 Hz, puede indicar pérdida auditiva en agudos. Este test es orientativo y no sustituye a una audiometría clínica: para un diagnóstico, consulta a un audiólogo o a un médico otorrinolaringólogo (ORL).',
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

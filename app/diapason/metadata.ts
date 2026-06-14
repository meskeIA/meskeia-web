import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diapasón Digital Online - La 440Hz Gratis | meskeIA',
  description: 'Diapasón digital gratuito con tono de referencia La 440Hz. Ideal para afinar instrumentos, coros y orquestas. Incluye otras frecuencias de afinación.',
  keywords: 'diapasón digital, diapasón online, La 440Hz, afinación, tono de referencia, afinar instrumentos, A4 440Hz, tuning fork',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diapasón Digital Online - La 440Hz',
    description: 'Diapasón digital gratuito con tono de referencia La 440Hz para afinar instrumentos.',
    url: 'https://meskeia.com/diapason/',
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
    title: 'Diapasón Digital Online - La 440Hz',
    description: 'Diapasón digital gratuito con tono de referencia La 440Hz para afinar instrumentos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Diapasón Digital (La 440Hz)",
  description: "Diapasón digital gratuito con tono de referencia La 440Hz. Ideal para afinar instrumentos, coros y orquestas. Incluye otras frecuencias de afinación.",
  url: "https://meskeia.com/diapason/",
  category: 'EducationalApplication',
  features: [
    'Tono La 440 Hz (ISO 16) generado con Web Audio API, sin archivos de audio externos',
    'Presets de afinación: barroco 415 Hz, estándar 440 Hz, orquesta europea 442/443 Hz, Renacimiento 466 Hz',
    'Frecuencia personalizable de 20 a 2000 Hz con slider y control numérico',
    'Cuatro tipos de onda: senoidal, triangular, cuadrada y sierra',
    'Control de volumen con rampa suave (sin clic ni artefactos de audio)',
    'Visualización animada de onda durante la reproducción',
    'Tabla de cents comparativa entre frecuencias de afinación históricas',
    'Funciona en el navegador del móvil sin instalación, ideal para ensayos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un diapasón y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un diapasón es una herramienta que emite un tono de referencia para afinar instrumentos musicales. El estándar internacional es La 440Hz (también llamado A4 o A 440), adoptado en 1939 por la ISO. Se usa en orquestas, coros, clases de música y grabaciones para asegurar que todos los instrumentos suenen a la misma altura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el La de referencia es 440Hz y no otra frecuencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La frecuencia de 440Hz para el La4 fue acordada como estándar internacional en la Conferencia de Londres de 1939 y ratificada por la ISO en 1975 (norma ISO 16). Antes existían variantes: muchas orquestas barrocas usaban 415Hz y algunas modernas emplean 442Hz o 444Hz. El 440Hz se impuso por ser un valor de consenso que facilitaba la convivencia entre fabricantes e intérpretes de todo el mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo uso un diapasón digital para afinar mi instrumento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reproduce el tono de referencia (La 440Hz) y ajusta la cuerda o el instrumento hasta que el sonido que produces coincida con el del diapasón. Si los dos sonidos producen un "batido" (ondulación audible), significa que están ligeramente desafinados; cuando el batido desaparece, la afinación es correcta. Para instrumentos de viento o cuerda frotada, aproxima el oído al altavoz para comparar con más precisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un diapasón digital y un afinador cromático?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diapasón emite un tono fijo (generalmente La 440Hz) que sirve como referencia para afinar de oído, desarrollando así el oído relativo. Un afinador cromático, en cambio, escucha el sonido del instrumento y muestra en pantalla si la nota está alta, baja o en el punto exacto. Para músicos que aprenden a afinar de oído, el diapasón es la herramienta más formativa; el afinador cromático es más rápido para afinaciones rápidas en directo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Pueden usarse frecuencias distintas de 440Hz para afinar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Algunas orquestas filarmónicas europeas prefieren 442Hz o 443Hz, ya que el sonido resulta ligeramente más brillante. Los grupos de música antigua suelen usar 415Hz (un semitono por debajo del estándar moderno) para reproducir la sonoridad de los siglos XVII y XVIII. Lo importante es que todos los instrumentos de un conjunto compartan la misma frecuencia de referencia.',
      },
    },
  ],
};

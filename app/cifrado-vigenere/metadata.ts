import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cifrado Vigenère Online - Cifrado Polialfabético con Clave | meskeIA',
  description: 'Cifrado Vigenère gratuito. Encripta mensajes con palabra clave usando el cifrado polialfabético histórico. Visualización de la tabla Vigenère y explicaciones detalladas.',
  keywords: 'cifrado vigenere, cifrado polialfabetico, cifrado con clave, encriptar mensaje, criptografia, bellaso, tabla vigenere',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado Vigenère Online - Cifrado con Clave | meskeIA',
    description: 'Encripta mensajes con el cifrado Vigenère. Usa una palabra clave para mayor seguridad.',
    url: 'https://meskeia.com/cifrado-vigenere/',
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
    title: 'Cifrado Vigenère Online - Cifrado Polialfabético',
    description: 'Encripta y descifra mensajes con el histórico cifrado Vigenère.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cifrado Vigenère",
  description: "Cifrado Vigenère gratuito. Encripta mensajes con palabra clave usando el cifrado polialfabético histórico. Visualización de la tabla Vigenère y explicaciones detalladas.",
  url: "https://meskeia.com/cifrado-vigenere/",
  category: 'EducationalApplication',
  features: [
    'Cifrado y descifrado Vigenère con clave personalizable de cualquier longitud',
    'Visualización de la tabla Vigenère completa (cuadrado de 26×26 alphabetos)',
    'Marcado visual del proceso: fila de mensaje, columna de clave y celda resultado',
    'Histograma de frecuencias de letras del texto cifrado para análisis estadístico',
    'Índice de Coincidencia (IC) calculado para estimar vulnerabilidad del cifrado',
    'Exportación del texto cifrado como código HTML embebible',
    'Modo descifrar: recupera el texto original con la misma clave',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el cifrado Vigenère?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado Vigenère es un método de cifrado polialfabético que usa una palabra clave para encriptar mensajes. Cada letra del texto se desplaza un número distinto de posiciones según la letra correspondiente de la clave, lo que lo hace mucho más seguro que el cifrado César simple. Fue descrito por Giovan Battista Bellaso en 1553 y popularizado erróneamente bajo el nombre de Blaise de Vigenère.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el cifrado Vigenère paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se elige una clave, por ejemplo "CLAVE". Cada letra de la clave indica cuántas posiciones desplazar la letra correspondiente del mensaje: C=2, L=11, A=0, V=21, E=4. La clave se repite cíclicamente a lo largo del texto. Para descifrar, se aplica el desplazamiento inverso usando la misma clave. La tabla Vigenère (cuadrado de Vigenère) visualiza todas las sustituciones posibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro el cifrado Vigenère hoy en día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El cifrado Vigenère fue roto definitivamente por Charles Babbage y Friedrich Kasiski en el siglo XIX mediante el análisis de la longitud de la clave. Con claves cortas y texto suficiente es vulnerable al análisis de frecuencia. Hoy se usa exclusivamente con fines educativos para entender los fundamentos de la criptografía histórica, no para proteger información real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el cifrado Vigenère del cifrado César?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado César usa un único desplazamiento fijo para todas las letras del mensaje, mientras que el Vigenère aplica desplazamientos distintos a cada letra según una clave repetida. Esto hace que el Vigenère sea polialfabético (usa múltiples alfabetos cifrados) y sea significativamente más difícil de romper por análisis de frecuencia simple.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve aprender el cifrado Vigenère?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Estudiar el cifrado Vigenère es fundamental en cursos de criptografía e informática porque ilustra conceptos clave: cifrado por sustitución polialfabética, uso de clave secreta compartida y vulnerabilidades al análisis estadístico. Es un paso natural entre los cifrados monoalfabéticos (César, Atbash) y los sistemas modernos de clave simétrica como AES.',
      },
    },
  ],
};

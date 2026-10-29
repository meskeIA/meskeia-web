import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Traductor Braille a Español y Texto a Braille Online - Bidireccional',
  description: 'Convierte texto a Braille y traduce Braille a español al instante. Alfabeto completo con ñ y tildes (á, é, í, ó, ú). Visualización de celdas Unicode. Gratis.',
  keywords: 'braille, conversor, texto, accesibilidad, alfabeto braille, español, discapacidad visual, unicode, celdas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/conversor-braille/',
  },
  openGraph: {
    type: 'website',
    title: 'Traductor Braille a Español y Texto a Braille - Bidireccional',
    description: 'Convierte texto a Braille y traduce Braille a español al instante. Alfabeto completo con ñ y tildes. Visualización de celdas Unicode.',
    url: 'https://meskeia.com/conversor-braille/',
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
    title: 'Traductor Braille a Español y Texto a Braille',
    description: 'Bidireccional, alfabeto completo con ñ y tildes. Celdas Unicode.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de Código Braille',
  description: 'Convierte texto a código Braille y viceversa con el alfabeto Braille español completo, incluyendo ñ y acentos. Visualización interactiva con celdas Unicode.',
  url: 'https://meskeia.com/conversor-braille/',
  category: 'UtilityApplication',
  features: [
    'Conversión bidireccional texto ↔ braille español según el Documento Técnico B 2 de la Comisión Braille Española',
    'Alfabeto braille español completo (ñ, vocales acentuadas) y signos de puntuación',
    'Números con signo de número, coma decimal, punto de millar, ordinales (1.º, 2.ª, 3.er), «n.º» y fracciones (½, ¾)',
    'Hoja imprimible a escala real (Marburg Medium o ADA) con regla de calibración de 100 mm y modo espejo para regleta y punzón',
    'Vista de los seis puntos de cada celda',
    'Teclado braille de seis puntos (F D S J K L, como una máquina Perkins) o puntos táctiles para escribir celdas y traducirlas',
    'Avisa de lo que no puede escribir o leer en vez de omitirlo en silencio',
  ],
  keywords: ['Braille', 'accesibilidad', 'discapacidad visual', 'conversor texto Braille'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el código Braille y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Braille es un sistema de escritura táctil que Louis Braille, ciego desde niño, esbozó en 1824 (con 15 años) y publicó oficialmente en 1829 para personas con discapacidad visual. Cada carácter se representa mediante una celda de 6 puntos en relieve (2 columnas × 3 filas), lo que permite hasta 64 combinaciones distintas. En este conversor las celdas se muestran como símbolos Unicode del bloque Braille (U+2800–U+28FF).',
      },
    },
    {
      '@type': 'Question',
      name: '¿El conversor incluye la ñ y las vocales con tilde del español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El conversor utiliza el alfabeto Braille español completo: incluye la ñ, las vocales acentuadas (á, é, í, ó, ú), números y los signos de puntuación más comunes. Esto lo diferencia de convertidores genéricos que solo cubren el inglés básico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo convertir Braille a texto normal o solo texto a Braille?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 3422 (22/10/2026): decía que Braille → Texto era pegar caracteres Unicode y pulsar
        // «Convertir», y callaba el teclado de seis puntos, que traduce cada celda al momento y es
        // la forma de entrar braille de quien tiene un cartel delante.
        text: 'El conversor funciona en ambas direcciones. Puedes escribir texto en español y obtener los símbolos Braille correspondientes al pulsar «Convertir». Para pasar Braille a texto puedes pegar caracteres Braille Unicode y pulsar «Convertir», o escribir las celdas con el teclado de seis puntos de la app —las teclas F, D, S, J, K y L a la vez, como en una máquina Perkins, o marcando los puntos en la pantalla—, que traduce cada celda en cuanto la escribes. Todo se hace en el navegador, sin enviar datos a ningún servidor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa un conversor de Braille online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para educadores y familias que acompañan a personas con discapacidad visual, para estudiantes que aprenden Braille, para diseñadores que crean materiales accesibles y para curiosos que quieren entender cómo funciona este sistema. También permite verificar transcripciones antes de imprimir en papel Braille con una impresora especializada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este conversor de una impresora Braille?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una impresora Braille produce puntos en relieve sobre papel especial que se pueden sentir con los dedos; este conversor genera representaciones visuales en pantalla mediante caracteres Unicode. Es ideal para aprendizaje y verificación, pero no reemplaza el soporte físico necesario para que una persona ciega lea por tacto.',
      },
    },
  ],
};

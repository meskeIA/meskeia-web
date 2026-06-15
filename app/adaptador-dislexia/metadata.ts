import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adaptador de Lectura para Dislexia - Personaliza tu texto | meskeIA',
  description: 'Herramienta gratuita para adaptar textos y facilitar la lectura a personas con dislexia. Ajusta fuente, tamaño, espaciado, interlineado y color de fondo. Tus preferencias se guardan automáticamente.',
  keywords: 'dislexia, adaptador lectura, fuente dislexia, lexend, texto dislexia, accesibilidad, lectura fácil, espaciado letras, interlineado, dificultad lectura',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Adaptador de Lectura para Dislexia | meskeIA',
    description: 'Personaliza cualquier texto para facilitar la lectura: fuente especial, espaciado amplio, fondo crema y más. Gratis y sin registro.',
    url: 'https://meskeia.com/adaptador-dislexia/',
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
    title: 'Adaptador de Lectura para Dislexia | meskeIA',
    description: 'Ajusta fuente, espaciado y color de fondo para leer con mayor facilidad. Gratis y sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Adaptador de Lectura para Dislexia",
  description: "Herramienta gratuita para adaptar textos y facilitar la lectura a personas con dislexia. Ajusta fuente, tamaño, espaciado, interlineado y color de fondo. Tus preferencias se guardan automáticamente.",
  url: "https://meskeia.com/adaptador-dislexia/",
  category: 'EducationalApplication',
  features: [
    'Ajuste de fuente tipográfica: Arial, Lexend y monoespaciada para mayor legibilidad',
    'Control de tamaño de letra de 14 a 36 px con vista previa en tiempo real',
    'Espaciado entre letras y entre palabras ajustable de forma independiente',
    'Interlineado configurable de 1,2 a 3,0 para reducir la confusión entre líneas',
    'Ancho de columna ajustable del 40 al 100% para limitar la longitud de línea',
    'Cinco opciones de color de fondo: blanco, crema, azul pálido, verde y gris',
    'Preferencias guardadas automáticamente en localStorage al ajustar cada parámetro',
    'Procesamiento 100% local: el texto nunca sale del navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la dislexia y cómo afecta a la lectura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dislexia es una dificultad específica del aprendizaje de base neurológica que afecta a la decodificación fluida de palabras escritas. Las personas con dislexia pueden confundir letras similares (b/d, p/q), perder el hilo en el renglón o necesitar releer varias veces para comprender. No está relacionada con la inteligencia y afecta a entre el 5% y el 15% de la población.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las fuentes especiales para dislexia realmente ayudan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fuentes diseñadas para dislexia (Lexend, OpenDyslexic, Dyslexie) añaden rasgos diferenciadores a letras que suelen confundirse y aumentan el espacio entre caracteres. La investigación muestra resultados mixtos: algunas personas con dislexia las encuentran muy útiles, mientras que para otras el mayor impacto viene del interlineado y el ancho de columna. Lo más recomendable es probar distintas combinaciones y quedarse con la que resulte más cómoda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este adaptador de lectura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado principalmente para personas con dislexia, pero también es útil para personas con baja visión, lectores en proceso de aprendizaje, personas con fatiga visual o cualquiera que quiera leer textos largos con mayor comodidad. Los ajustes de fuente, espaciado y fondo también benefician a usuarios con dificultades de atención sostenida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia tiene frente a simplemente cambiar la fuente del navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cambiar la fuente del sistema solo afecta a algunos elementos de la interfaz. Este adaptador permite ajustar de forma combinada la fuente tipográfica, el tamaño, el espaciado entre letras, el interlineado y el color de fondo del texto pegado, y guarda automáticamente tus preferencias en el navegador para que no tengas que reconfigurar cada vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Mis textos se envían a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Todo el procesamiento se realiza en el propio navegador: el texto que pegas y los ajustes que haces no se envían a ningún servidor externo. Las preferencias se guardan localmente en el almacenamiento del navegador (localStorage), por lo que tampoco se comparten con terceros.',
      },
    },
  ],
};

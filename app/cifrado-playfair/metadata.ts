import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cifrado Playfair Online - Cifrado por Digramas | meskeIA',
  description: 'Cifra textos con el método Playfair usando una matriz 5x5. Cifrado por pares de letras usado en guerras mundiales. Visualización interactiva de la matriz.',
  keywords: 'cifrado playfair, digrama, matriz 5x5, criptografia, cifrado clasico, pares letras, wheatstone, primera guerra mundial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado Playfair Online | meskeIA',
    description: 'Cifra textos por pares de letras con matriz 5x5 visual.',
    url: 'https://meskeia.com/cifrado-playfair/',
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
    title: 'Cifrado Playfair | meskeIA',
    description: 'Cifrado por digramas con visualización de matriz',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cifrado Playfair",
  description: "Cifra textos con el método Playfair usando una matriz 5x5. Cifrado por pares de letras usado en guerras mundiales. Visualización interactiva de la matriz.",
  url: "https://meskeia.com/cifrado-playfair/",
  category: 'EducationalApplication',
  features: [
    'Matriz Playfair 5×5 generada a partir de una palabra clave personalizada',
    'Cifrado y descifrado por pares de letras (dígrafos) con resaltado visual',
    'Eliminación automática de la J y sustitución por I (norma original Playfair)',
    'Panel de dígrafos procesados con emparejamiento origen → resultado',
    'Historia del cifrado Playfair: uso en la Primera y Segunda Guerra Mundial',
    'Exportación del texto cifrado como código HTML embebible',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el cifrado Playfair?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado Playfair es un sistema criptográfico clásico que cifra el texto de dos letras en dos letras (dígrafos), usando una matriz cuadrada de 5×5 construida a partir de una palabra clave. Fue inventado por Charles Wheatstone en 1854 y popularizado por Lord Playfair, de ahí su nombre. Fue el primer cifrado de digramas usado a escala militar práctica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el cifrado Playfair?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se construye una matriz 5×5 con las letras de la clave (sin repetidas) seguida del resto del alfabeto; I y J comparten celda. El texto se divide en pares de letras (dígrafos); si un par es igual se inserta una X entre ellos. Cada dígrafo se cifra según tres reglas: si las letras están en la misma fila se desplazan a la derecha; si están en la misma columna, hacia abajo; si forman un rectángulo, se intercambian las esquinas opuestas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué guerras se usó el cifrado Playfair?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado Playfair fue empleado por el ejército británico durante la Segunda Guerra Bóer (1899-1902) y en la Primera Guerra Mundial. Australia lo usó en la Segunda Guerra Mundial para comunicaciones tácticas de bajo nivel. Fue considerado suficientemente seguro para mensajes en campo de batalla, aunque los criptoanalistas aliados ya conocían métodos para romperlo con texto suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se rompe el cifrado Playfair?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Playfair se puede atacar mediante análisis de frecuencia de dígrafos: aunque cifra pares en lugar de letras individuales, los patrones estadísticos del idioma persisten. Con unos 100-200 dígrafos de texto cifrado es posible reconstruir la matriz mediante métodos de análisis diferencial o búsqueda heurística. La longitud del texto cifrado y el conocimiento del idioma original son claves para el ataque.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el cifrado Playfair combina I y J en la misma celda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alfabeto latino tiene 26 letras, pero una matriz cuadrada de 5×5 solo tiene 25 celdas. Para adaptarlo, se fusionan las letras I y J en una sola celda, ya que en inglés son frecuentemente intercambiables en contextos donde el cifrado era más usado. Al descifrar, el receptor debe deducir por contexto si la letra corresponde a I o J. En algunos alfabetos europeos se omite la Q o la W en su lugar.',
      },
    },
  ],
};

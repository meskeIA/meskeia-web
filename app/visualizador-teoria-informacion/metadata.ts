import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión — meskeIA',
  description: 'Visualizador interactivo de teoría de la información. Entropía de Shannon con sliders, árbol de Huffman animado, capacidad del canal Shannon-Hartley y comparativa de formatos de compresión.',
  keywords: [
    'entropía Shannon bits información',
    'código Huffman árbol compresión',
    'capacidad canal Shannon-Hartley',
    'compresión sin pérdida lossless',
    'MP3 JPEG PNG comparativa tamaño',
    'teoría información telecomunicaciones',
    'información mutua probabilidad',
    'compresión datos educativo',
    'ancho de banda SNR capacidad canal',
    'Claude Shannon matemáticas información',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión — meskeIA',
    description: 'Visualizador interactivo: entropía de Shannon, árbol de Huffman, capacidad Shannon-Hartley y comparativa de formatos de compresión. Educativo y gratuito.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-teoria-informacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión',
    description: 'Ajusta probabilidades y ve la entropía en tiempo real. Árbol Huffman, canal Shannon-Hartley y formatos de compresión.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Teoría de la Información Visualizador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión',
  description: 'Visualizador interactivo de teoría de la información de Shannon. Permite explorar la entropía de Shannon con sliders, el árbol de Huffman con ejemplo paso a paso, la capacidad del canal Shannon-Hartley y la comparativa de formatos de compresión (WAV, MP3, BMP, PNG, JPEG). 100% educativo, sin registro.',
  url: 'https://meskeia.com/visualizador-teoria-informacion/',
  category: 'EducationalApplication',
  features: [
    'Entropía de Shannon con 4 sliders de probabilidad en tiempo real',
    'Árbol de Huffman SVG con tabla de códigos y comparativa de eficiencia',
    'Capacidad del canal Shannon-Hartley: sliders de B y SNR, curva SVG',
    'Comparativa de formatos: WAV vs MP3, BMP vs PNG vs JPEG',
    'Slider de calidad JPEG con estimación de tamaño',
    'Visualizaciones SVG proporcionales al tamaño de archivo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la entropía de Shannon y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La entropía de Shannon mide la cantidad promedio de información (o incertidumbre) en una fuente de datos, expresada en bits. Fue formulada por Claude Shannon en 1948 y es la base matemática de toda la compresión de datos y las telecomunicaciones. Cuanto mayor es la entropía, más impredecible es la fuente y mayor es la cantidad de bits necesarios para representarla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el código de Huffman y por qué comprime datos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El código de Huffman asigna cadenas de bits más cortas a los símbolos más frecuentes y más largas a los menos frecuentes. Se construye un árbol binario partiendo de los símbolos con menor probabilidad y combinándolos sucesivamente. El resultado es un código de longitud variable óptimo para una distribución de probabilidades dada, y es la base de formatos como DEFLATE (ZIP, PNG).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué indica la fórmula de Shannon-Hartley para la capacidad de un canal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula C = B · log₂(1 + SNR) indica la máxima tasa de transmisión de información sin errores en un canal con ancho de banda B (Hz) y relación señal/ruido SNR. Es el límite teórico absoluto: ningún sistema de codificación puede superarlo. Duplicar el ancho de banda duplica la capacidad, pero duplicar la potencia de señal la aumenta mucho menos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre compresión con pérdida y sin pérdida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La compresión sin pérdida (lossless) permite recuperar los datos originales exactos; la usan formatos como PNG, FLAC o ZIP. La compresión con pérdida (lossy) descarta información que el sistema perceptivo humano detecta difícilmente, logrando mayor reducción de tamaño; la emplean formatos como JPEG para imágenes y MP3 para audio. Para documentos o código fuente solo se usa lossless.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué perfil de estudiante está pensada esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientada a estudiantes de ingeniería de telecomunicaciones, informática o matemáticas que deseen entender intuitivamente los conceptos de teoría de la información antes de profundizar en las demostraciones formales. También resulta útil para docentes que quieran apoyar sus explicaciones con visualizaciones interactivas en el aula.',
      },
    },
  ],
};

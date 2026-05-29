import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Contador de Palabras - Análisis de Texto Online | meskeIA',
  description: 'Contador de palabras, caracteres, párrafos y frases online. Calcula tiempo de lectura, densidad de palabras clave y estadísticas de texto. Gratis, privado y sin registro.',
  keywords: 'contador palabras, contar caracteres, contador letras, analisis texto, tiempo lectura, densidad palabras, estadisticas texto, word counter, character count',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Contador de Palabras y Caracteres Online',
    description: 'Analiza tu texto: cuenta palabras, caracteres, párrafos. Calcula tiempo de lectura y densidad de palabras clave.',
    url: 'https://meskeia.com/contador-palabras/',
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
    title: 'Contador de Palabras | meskeIA',
    description: 'Cuenta palabras, caracteres, párrafos y tiempo de lectura',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Contador de Palabras meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Contador de Palabras - Análisis de Texto Online",
  description: "Contador de palabras, caracteres, párrafos y frases online. Calcula tiempo de lectura, densidad de palabras clave y estadísticas de texto. Gratis, privado y sin registro.",
  url: 'https://meskeia.com/contador-palabras/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el tiempo de lectura de un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo de lectura se estima dividiendo el número de palabras entre la velocidad lectora media. Para adultos en lectura silenciosa se suele usar entre 200 y 250 palabras por minuto (ppm), aunque la velocidad varía según el tipo de texto: un artículo técnico se lee más despacio que una novela. Un texto de 1.000 palabras tardaría unos 4-5 minutos en condiciones normales. La herramienta calcula automáticamente este dato en tiempo real mientras escribes o pegas el texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre contar caracteres con espacios y sin espacios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Contar con espacios incluye todos los espacios en blanco entre palabras y tras signos de puntuación, lo que refleja el espacio real que ocupa el texto en un campo con límite de caracteres (como Twitter/X con su límite de 280, o el campo meta description de una página web con ~155-160 caracteres). Contar sin espacios solo suma los caracteres visibles, resultado útil para calcular la densidad léxica o comparar longitudes de palabras. Ambos recuentos son relevantes dependiendo del contexto de uso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la densidad de palabras clave en un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La densidad de palabras clave mide la frecuencia con que aparece un término respecto al total de palabras del texto, expresada como porcentaje. Es un indicador habitual en SEO: una densidad excesiva (keyword stuffing, por encima del 3-4%) puede ser penalizada por los buscadores, mientras que una presencia muy baja puede indicar que el texto no trata suficientemente el tema. Para contenido optimizado se recomienda una densidad natural del 1-2% para el término principal y menciones complementarias de sinónimos y términos relacionados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas palabras debe tener un artículo de blog, un TFG o un correo profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los rangos orientativos más utilizados son: correo profesional (100-300 palabras), entrada de blog informativa (800-1.500 palabras), artículo SEO en profundidad (1.500-3.000 palabras), TFG o trabajo académico de grado (15.000-25.000 palabras según normativa de cada institución) y tesis doctoral (60.000-100.000 palabras). Estos valores son referencias habituales, no normas fijas; la extensión óptima depende siempre del objetivo del texto y de los requisitos del destinatario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El contador almacena o envía el texto que escribo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El análisis se realiza íntegramente en el navegador del usuario, sin enviar ningún dato a servidores externos. El texto nunca sale de tu dispositivo, por lo que es seguro pegar borradores confidenciales, contratos o cualquier documento sensible. No se requiere registro, no se instalan cookies de seguimiento y el historial de texto no se guarda una vez que cierras la pestaña.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Compresor de Imágenes por Lotes - Comprime JPG, PNG, WebP Gratis | meskeIA',
  description: 'Comprime múltiples imágenes a la vez sin límites ni marcas de agua. Reduce el tamaño de tus fotos JPG, PNG y WebP manteniendo la calidad. 100% gratis y privado.',
  keywords: 'compresor imagenes, comprimir fotos online, reducir tamaño imagen, comprimir jpg, comprimir png, comprimir webp, optimizar imagenes web, compresor por lotes, comprimir multiples imagenes gratis, reducir peso fotos, compresor sin limites, comprimir imagenes sin marca de agua',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Compresor de Imágenes por Lotes - Sin Límites | meskeIA',
    description: 'Comprime múltiples imágenes a la vez sin límites ni marcas de agua. Reduce el tamaño de tus fotos manteniendo la calidad.',
    url: 'https://meskeia.com/compresor-imagenes/',
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
    title: 'Compresor de Imágenes por Lotes | meskeIA',
    description: 'Comprime múltiples imágenes sin límites ni marcas de agua. 100% gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Compresor de Imágenes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Compresor de Imágenes por Lotes",
  description: "Comprime múltiples imágenes a la vez sin límites ni marcas de agua. Reduce el tamaño de tus fotos JPG, PNG y WebP manteniendo la calidad. 100% gratis y privado.",
  url: "https://meskeia.com/compresor-imagenes/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se puede reducir el tamaño de una imagen sin perder calidad visible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En fotografías JPG, una compresión al 70-80% de calidad suele reducir el tamaño entre un 50-70% sin diferencia apreciable a simple vista en pantalla. Para imágenes PNG con muchos colores sólidos, la compresión sin pérdida puede reducirlas un 20-40%. WebP permite reducciones adicionales del 25-35% respecto a JPG con calidad equivalente. El ahorro real depende del contenido de la imagen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre compresión con pérdida y sin pérdida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La compresión con pérdida (lossy) descarta información que el ojo humano apenas percibe para reducir el tamaño del archivo; JPG es el ejemplo más conocido. La compresión sin pérdida (lossless) reorganiza los datos sin eliminar ninguno, por lo que la imagen descomprimida es idéntica al original; PNG y WebP lossless la usan. Para web y redes sociales la compresión con pérdida suele ser suficiente; para archivos máster se recomienda sin pérdida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué debo comprimir las imágenes de mi sitio web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las imágenes sin comprimir son la principal causa de que las páginas web carguen lento. Google PageSpeed Insights penaliza las páginas con imágenes pesadas y esto afecta al posicionamiento en buscadores. Además, los usuarios abandonan páginas que tardan más de 3 segundos en cargar. Reducir el peso de las imágenes puede mejorar el tiempo de carga en un 30-60% dependiendo del sitio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo comprimir varias imágenes a la vez de forma gratuita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, existen herramientas online que permiten comprimir múltiples imágenes en lote sin coste y sin límite de archivos. Muchas alternativas populares como TinyPNG limitan el número de imágenes o el tamaño máximo en su versión gratuita. Un compresor local o sin servidor es la opción más privada y sin restricciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La compresión de imágenes daña el archivo original?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La compresión nunca modifica el archivo original en tu dispositivo: la herramienta genera un archivo nuevo comprimido que descargas por separado. Sin embargo, si vuelves a comprimir un JPG ya comprimido, cada pasada añade más artefactos de compresión y la pérdida de calidad se acumula. Por eso conviene guardar siempre los originales sin comprimir y comprimir solo al exportar para web.',
      },
    },
  ],
};

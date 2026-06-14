import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Limpiador de Texto Online Gratis - Quita Espacios, Duplicados y Formato',
  description: 'Limpia texto al instante: elimina espacios sobrantes, líneas duplicadas, saltos de línea, caracteres especiales y formato copiado. Pega, limpia y copia. Sin registro.',
  keywords: 'limpiador texto, eliminar espacios, quitar duplicados, limpiar texto, formatear texto, eliminar lineas vacias, text cleaner, remover caracteres',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Limpiador de Texto Online Gratis - Quita Espacios y Duplicados',
    description: 'Limpia texto al instante: elimina espacios, líneas duplicadas, saltos y caracteres especiales. Pega, limpia y copia.',
    url: 'https://meskeia.com/limpiador-texto/',
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
    title: 'Limpiador de Texto Online Gratis',
    description: 'Quita espacios, líneas duplicadas y formato. Pega, limpia y copia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Limpiador de Texto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Limpiador de Texto",
  description: "Limpia texto al instante: elimina espacios sobrantes, líneas duplicadas, saltos de línea, caracteres especiales y formato copiado. Pega, limpia y copia. Sin registro.",
  url: "https://meskeia.com/limpiador-texto/",
  category: 'UtilityApplication',
  features: [
    '13 opciones de limpieza: espacios, líneas vacías, duplicados, tabulaciones, caracteres especiales, números, puntuación, emojis, HTML, URLs y emails',
    'Procesamiento 100% local en el navegador — el texto nunca sale de tu dispositivo',
    'Estadísticas en tiempo real: caracteres antes/después y porcentaje eliminado',
    'Botón "Aplicar resultado" para encadenar múltiples limpiezas',
    'Copia al portapapeles con un clic',
    'Función de deduplicación de líneas con normalización por mayúsculas/minúsculas',
    'Sin registro, sin publicidad, funciona sin conexión',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué hace exactamente un limpiador de texto online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un limpiador de texto online detecta y elimina automáticamente los problemas más comunes que aparecen al copiar texto de otras fuentes: espacios dobles o triples entre palabras, líneas en blanco repetidas, saltos de línea innecesarios, caracteres especiales o de control invisibles, y restos de formato (negritas, cursivas, tabulaciones) que no se ven pero sí interfieren al pegar el texto en otro lugar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el texto copiado de Word o PDF sale con caracteres raros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Word, PDF y otras aplicaciones añaden caracteres de formato propietarios (como saltos de página, guiones de no separación o comillas tipográficas) que no son texto plano estándar. Al pegar ese contenido en un campo de texto, una base de datos o un sistema web, esos caracteres pueden aparecer como símbolos extraños o causar errores de codificación. Un limpiador los detecta y sustituye por su equivalente en texto limpio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo elimino líneas duplicadas de un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pega el texto con líneas repetidas en el limpiador y activa la opción de eliminar duplicados. La herramienta compara cada línea con las anteriores y conserva solo la primera aparición de cada una, descartando las repetidas. Es especialmente útil con listas de correos, códigos postales, palabras clave o cualquier listado exportado desde una hoja de cálculo o base de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un limpiador de texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es muy útil para redactores y editores que trabajan con contenido de múltiples fuentes, desarrolladores que procesan datos en texto plano, community managers que adaptan contenido para redes sociales, y cualquier persona que necesite pegar texto limpio en un formulario, CMS, correo o sistema que no acepta formato enriquecido. También ahorra tiempo en tareas repetitivas de normalización de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un limpiador de texto de un editor de texto normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un editor de texto (como Notepad o Word) muestra el contenido pero no detecta ni corrige automáticamente problemas de formato ocultos. Un limpiador de texto aplica reglas específicas para normalizar el contenido: identifica patrones problemáticos, los elimina o corrige en bloque, y entrega un resultado listo para usar sin intervención manual línea por línea.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Detector de Idioma Online - Identifica el Idioma de un Texto | meskeIA',
  description: 'Detector de idioma gratuito. Pega cualquier texto y descubre en qué idioma está escrito. Detecta más de 20 idiomas con porcentaje de confianza.',
  keywords: 'detector idioma, identificar idioma, que idioma es, detectar lengua, language detector, idioma texto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Detector de Idioma Online - meskeIA',
    description: 'Identifica el idioma de cualquier texto. Detecta más de 20 idiomas.',
    url: 'https://meskeia.com/detector-idioma/',
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
    title: 'Detector de Idioma Online',
    description: 'Identifica el idioma de cualquier texto automáticamente.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Detector de Idioma",
  description: "Detector de idioma gratuito. Pega cualquier texto y descubre en qué idioma está escrito. Detecta más de 20 idiomas con porcentaje de confianza.",
  url: "https://meskeia.com/detector-idioma/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona un detector de idioma automático?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los detectores de idioma analizan las frecuencias de caracteres, bigramas y trigramas del texto introducido y las comparan con modelos estadísticos de cada idioma. Cuanto más largo sea el texto, mayor es la fiabilidad de la detección. Con fragmentos muy cortos (una o dos palabras) el porcentaje de confianza baja porque muchas palabras existen en varios idiomas simultáneamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos idiomas puede detectar esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta detecta más de 20 idiomas, entre ellos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, ruso, chino, japonés, árabe, coreano y otros idiomas europeos y asiáticos de uso extendido. Cada resultado muestra también un porcentaje de confianza para que puedas evaluar la fiabilidad de la detección.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un detector de idioma en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil en traducción y localización (para identificar el idioma fuente antes de traducir), en moderación de contenido multilingüe, en análisis de redes sociales o correos electrónicos internacionales, y en aprendizaje de lenguas para verificar fragmentos de texto de origen desconocido. También lo usan desarrolladores para enrutar textos hacia el motor de traducción correcto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el detector confunde a veces el español con el portugués o el catalán?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El español, el portugués, el catalán, el gallego e incluso el italiano comparten raíces latinas y muchos patrones de caracteres similares. Cuando el texto es muy corto o contiene nombres propios y términos técnicos internacionales, el detector puede dudar entre lenguas afines. Para mejorar la detección, introduce al menos dos o tres frases completas con vocabulario cotidiano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Funciona el detector de idioma con textos mezclados o con code-switching?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los detectores de idioma clásicos están optimizados para texto monolingüe y pueden tener dificultades con el code-switching (mezcla de idiomas en un mismo texto) o con palabras técnicas en inglés dentro de un texto en otro idioma. En esos casos, la herramienta detectará el idioma predominante o el que tenga mayor peso estadístico en el fragmento analizado.',
      },
    },
  ],
};

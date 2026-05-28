import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Meta Descripciones SEO - Vista Previa Google | meskeIA',
  description: 'Genera meta descripciones optimizadas para SEO. Contador de caracteres en tiempo real, vista previa de snippet de Google y plantillas por tipo de página.',
  keywords: 'meta description, seo, google, serp, ctr, snippet, descripcion, generador, optimizar, caracteres',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Meta Descripciones SEO - meskeIA',
    description: 'Crea meta descripciones perfectas para mejorar tu CTR en Google',
    url: 'https://meskeia.com/generador-meta-descripciones/',
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
    title: 'Generador de Meta Descripciones SEO - meskeIA',
    description: 'Genera meta descripciones optimizadas con vista previa de Google',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador Meta Descripciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Meta Descripciones",
  description: "Genera meta descripciones optimizadas para SEO. Contador de caracteres en tiempo real, vista previa de snippet de Google y plantillas por tipo de página.",
  url: "https://meskeia.com/generador-meta-descripciones/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos caracteres debe tener una meta descripción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google muestra entre 120 y 158 caracteres en escritorio y entre 90 y 120 en móvil antes de cortar el texto con puntos suspensivos. El rango óptimo aceptado es de 120-155 caracteres. Superar ese límite no penaliza directamente el posicionamiento, pero Google puede reescribir el fragmento si considera que no es relevante para la búsqueda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Influye la meta descripción en el posicionamiento SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La meta descripción no es un factor de posicionamiento directo (Google lo confirmó en 2009 y lo ha reiterado). Sin embargo, afecta indirectamente al SEO porque una descripción atractiva mejora el CTR (porcentaje de clics) en los resultados de búsqueda, lo que puede señalar relevancia y mejorar el posicionamiento con el tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué debe incluir una buena meta descripción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una meta descripción efectiva incluye la palabra clave principal (Google la pone en negrita cuando coincide con la búsqueda), una propuesta de valor clara, un llamado a la acción implícito (por ejemplo, "descubre", "aprende", "calcula") y diferenciación respecto a las páginas competidoras. Evita el relleno de palabras clave y el lenguaje genérico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la vista previa del snippet de Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vista previa muestra cómo aparecerá tu página en los resultados de búsqueda (SERP) antes de publicarla. Permite detectar si el título o la descripción se cortan, si el texto resulta atractivo comparado con los competidores y si el mensaje se comunica correctamente en el espacio reducido disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Google siempre usa la meta descripción que escribo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No siempre. Según datos de Ahrefs, Google reescribe la meta descripción en más del 60 % de las búsquedas, extrayendo fragmentos del contenido de la página que considera más relevantes para la consulta específica. Aun así, escribir una buena descripción aumenta la probabilidad de que Google la use cuando el contexto de búsqueda coincide con tu intención.',
      },
    },
  ],
};

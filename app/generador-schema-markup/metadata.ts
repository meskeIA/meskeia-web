import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Schema Markup JSON-LD - Datos Estructurados | meskeIA',
  description: 'Genera código Schema Markup JSON-LD para Article, Product, FAQ, LocalBusiness y Recipe. Mejora tu SEO con datos estructurados y rich snippets.',
  keywords: 'schema markup, json-ld, datos estructurados, rich snippets, seo, article, product, faq, localbusiness, recipe, google',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Schema Markup JSON-LD',
    description: 'Crea datos estructurados para mejorar tu visibilidad en Google',
    url: 'https://meskeia.com/generador-schema-markup/',
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
    title: 'Generador de Schema Markup',
    description: 'Genera JSON-LD para rich snippets en Google',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Schema Markup",
  description: "Genera código Schema Markup JSON-LD para Article, Product, FAQ, LocalBusiness y Recipe. Mejora tu SEO con datos estructurados y rich snippets.",
  url: "https://meskeia.com/generador-schema-markup/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Schema Markup y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Schema Markup es un vocabulario de datos estructurados basado en Schema.org que se añade al HTML de una página para que los motores de búsqueda entiendan mejor su contenido. Con él, Google puede mostrar rich snippets en los resultados de búsqueda, como estrellas de valoración, precios de productos, recetas con tiempo de cocción o preguntas frecuentes destacadas. Esto no garantiza un mejor ranking directo, pero sí mejora la visibilidad y el CTR.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre JSON-LD, Microdata y RDFa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres son formatos para implementar datos estructurados, pero JSON-LD es el recomendado por Google porque se coloca en un bloque separado del HTML (dentro de una etiqueta script) y no interfiere con el código de presentación. Microdata y RDFa requieren anotar directamente los elementos HTML, lo que complica el mantenimiento. La mayoría de los CMS modernos y generadores de sitios estáticos ya soportan JSON-LD de forma nativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de Schema Markup generan rich snippets en Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google soporta rich results para varios tipos de Schema: FAQPage (acordeón de preguntas en SERP), Product (precio, disponibilidad, valoraciones), Recipe (tiempo, calorías, pasos), Article (fecha, autor), LocalBusiness (horario, dirección, teléfono) y HowTo (pasos con imágenes). No todos los tipos garantizan rich snippet; Google decide mostrarlo según la calidad de los datos y la relevancia de la página.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo verificar que el Schema Markup está bien implementado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google ofrece la herramienta Rich Results Test (search.google.com/test/rich-results) que analiza una URL o fragmento de código y muestra los tipos detectados, los errores y si son elegibles para rich snippets. También existe Schema Markup Validator (validator.schema.org) para validar la conformidad con el vocabulario Schema.org. Una vez en producción, Google Search Console muestra el estado de los rich results bajo "Mejoras".',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Schema Markup mejora directamente el posicionamiento SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Schema Markup no es un factor de ranking directo confirmado por Google, pero tiene un impacto indirecto positivo. Los rich snippets aumentan la visibilidad en la página de resultados y pueden duplicar el CTR, lo que a su vez envía señales positivas de relevancia. Además, ayuda a los motores de búsqueda como Bing y a los sistemas de IA generativa (ChatGPT, Perplexity) a entender y citar correctamente el contenido de la página.',
      },
    },
  ],
};

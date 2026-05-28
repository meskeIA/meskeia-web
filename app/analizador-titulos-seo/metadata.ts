import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Analizador de Títulos SEO - Optimiza tus Title Tags | meskeIA',
  description: 'Analiza y optimiza tus títulos SEO. Longitud óptima, palabras de poder, puntuación CTR y vista previa en Google. Mejora tu posicionamiento web.',
  keywords: 'analizador titulos, seo, title tag, meta title, optimizar titulos, ctr, serp, google, posicionamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador de Títulos SEO - Optimiza tus Title Tags',
    description: 'Analiza y optimiza tus títulos SEO con puntuación de CTR y vista previa en Google',
    url: 'https://meskeia.com/analizador-titulos-seo/',
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
    title: 'Analizador de Títulos SEO',
    description: 'Optimiza tus títulos para mejorar el CTR en Google',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Analizador de Títulos SEO",
  description: "Analiza y optimiza tus títulos SEO. Longitud óptima, palabras de poder, puntuación CTR y vista previa en Google. Mejora tu posicionamiento web.",
  url: "https://meskeia.com/analizador-titulos-seo/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la longitud ideal de un título SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La longitud óptima de un title tag está entre 50 y 60 caracteres, aunque Google muestra hasta unos 580 píxeles de ancho en sus resultados de búsqueda. Los títulos más cortos suelen mostrar la URL completa, mientras que los que superan los 60 caracteres se truncan con puntos suspensivos. Mantener el título entre 50 y 60 caracteres garantiza que aparezca completo en la mayoría de los dispositivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las palabras de poder en un título SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las palabras de poder son términos que generan una respuesta emocional o de urgencia en el usuario y aumentan la probabilidad de que haga clic en el resultado. Ejemplos habituales son "gratis", "definitivo", "paso a paso", "comprobado" o "ahora". Incluir una o dos palabras de poder en el título puede incrementar el CTR orgánico de forma significativa sin afectar negativamente al posicionamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el título SEO al CTR en Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El title tag es el primer elemento que ve el usuario en los resultados de búsqueda y uno de los factores que más influye en la tasa de clics (CTR). Un título claro, con la palabra clave principal al principio y un gancho atractivo, puede duplicar o triplicar el CTR frente a un título genérico. Google también utiliza el CTR como señal de relevancia, por lo que mejorar el título puede tener un impacto indirecto en el ranking.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la vista previa del título en los resultados de búsqueda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vista previa SERP permite ver exactamente cómo aparecerá el título en Google antes de publicarlo, incluyendo si se truncará o no. Esto evita que palabras clave importantes queden cortadas y que el mensaje principal llegue completo al usuario. Es especialmente útil al redactar títulos para páginas de producto, artículos de blog y fichas de servicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo incluir la marca en el título SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Incluir el nombre de marca en el título SEO es recomendable para páginas corporativas, homepages y fichas de producto de marcas conocidas, ya que aumenta la confianza del usuario. Sin embargo, para artículos informativos o páginas de aterrizaje orientadas a tráfico orgánico, es mejor priorizar la palabra clave principal al principio del título y dejar la marca al final o incluso omitirla para ganar más espacio visible.',
      },
    },
  ],
};

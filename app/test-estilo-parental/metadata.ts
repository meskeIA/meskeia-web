import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Estilo Parental - Autoconocimiento Educativo | meskeIA',
  description: 'Test gratuito de estilo parental basado en el modelo de Diana Baumrind. 16 preguntas para descubrir tu tendencia educativa: democrático, autoritario, permisivo o negligente.',
  keywords: 'test estilo parental, estilo educativo padres, estilo autoritario permisivo democratico, crianza consciente, autoconocimiento parental, Baumrind estilos parentales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Estilo Parental - Autoconocimiento Educativo',
    description: 'Descubre tu tendencia educativa con este test gratuito de 16 preguntas basado en el modelo de Baumrind (1966). Sin registro ni datos personales.',
    url: 'https://meskeia.com/test-estilo-parental/',
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
    title: 'Test de Estilo Parental - meskeIA',
    description: 'Descubre tu tendencia educativa: democrático, autoritario, permisivo o negligente. Test gratuito de 16 preguntas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test Estilo Parental meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Test de Estilo Parental',
  description: 'Test de autoconocimiento parental basado en el modelo de Diana Baumrind (1966) y Maccoby & Martin (1983). 16 preguntas que miden control/exigencia y afecto/responsividad para identificar la tendencia educativa predominante entre 4 estilos parentales.',
  url: 'https://meskeia.com/test-estilo-parental/',
  category: 'EducationalApplication',
  features: [
    'Test de 16 preguntas con escala Likert de 5 puntos',
    'Basado en el modelo científico de Baumrind (1966) + Maccoby & Martin (1983)',
    'Visualización en cuadrante bidimensional (control vs afecto)',
    'Descripción detallada del estilo con recomendaciones constructivas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el test de estilo parental y en qué se basa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un cuestionario de autoconocimiento educativo basado en el modelo científico de Diana Baumrind (1966) y Maccoby & Martin (1983). Mide dos dimensiones clave: el nivel de exigencia/control y el nivel de afecto/responsividad. A partir de 16 preguntas con escala Likert sitúa tu tendencia predominante en uno de los cuatro estilos parentales clásicos: democrático, autoritario, permisivo o negligente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los cuatro estilos parentales y cuáles son sus diferencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estilo democrático combina alta exigencia con alto afecto; el autoritario tiene alta exigencia pero bajo afecto; el permisivo muestra bajo control pero mucho afecto; y el negligente tiene baja exigencia y bajo afecto. La investigación de Baumrind sugiere que el estilo democrático se asocia con mejores resultados en autonomía, autoestima y rendimiento escolar, aunque ningún estilo funciona igual en todos los contextos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer mi estilo parental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Identificar tu tendencia educativa predominante es el primer paso para la crianza consciente. Te permite reconocer qué dinámicas repites de forma automática, detectar posibles áreas de mejora y ajustar tu forma de comunicarte con tus hijos según las situaciones. No es un diagnóstico clínico sino una herramienta de reflexión personal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva el test y cómo se interpretan los resultados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 16 preguntas y se completa en 3-5 minutos. Los resultados se muestran en un gráfico de cuadrante bidimensional que refleja tu puntuación en las dos dimensiones del modelo. Además recibes una descripción detallada del estilo predominante con sus características y orientaciones constructivas para el día a día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El test guarda mis respuestas o comparte datos personales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El test funciona completamente en tu navegador: no requiere registro, no almacena respuestas en ningún servidor y no comparte ningún dato personal. Una vez que cierras la pestaña los resultados desaparecen. Es una herramienta de reflexión privada y anónima.',
      },
    },
  ],
};

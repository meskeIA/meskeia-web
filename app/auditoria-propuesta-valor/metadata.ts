import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Propuesta de Valor - ¿Lo que ofreces encaja con lo que necesitan? | meskeIA',
  description: 'Descubre si tu propuesta de valor encaja con las necesidades reales de tu cliente. Test de 10 preguntas basado en el Value Proposition Canvas de Osterwalder. Gratuito y sin registro.',
  keywords: 'propuesta de valor, Value Proposition Canvas, Osterwalder, encaje producto mercado, product market fit, cliente necesidad, oferta valor, emprendimiento, negocio, comunicación valor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Propuesta de Valor | meskeIA',
    description: '¿Lo que ofreces encaja con lo que necesitan? Test basado en Osterwalder.',
    url: 'https://meskeia.com/auditoria-propuesta-valor/',
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
    title: 'Auditoría de Propuesta de Valor | meskeIA',
    description: '¿Tu oferta encaja con tu cliente? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Auditoría de Propuesta de Valor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Propuesta de Valor',
  description: 'Herramienta interactiva de reflexión para evaluar si tu propuesta de valor encaja con las necesidades reales de tu cliente. Basado en el Value Proposition Canvas de Osterwalder.',
  url: 'https://meskeia.com/auditoria-propuesta-valor/',
  features: ['Test de 10 preguntas sobre encaje y comunicación', 'Diagnóstico visual con mapa 2D y perfil personalizado', 'Basado en el Value Proposition Canvas', 'Acciones concretas según tu resultado'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una propuesta de valor y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La propuesta de valor es la promesa concreta que un producto o servicio hace a su cliente: qué problema resuelve, qué beneficio aporta y por qué es mejor que las alternativas disponibles. Es el elemento central de cualquier negocio porque determina si los clientes deciden comprar o no. Una propuesta de valor débil o mal comunicada es una de las causas más frecuentes de fracaso empresarial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el Value Proposition Canvas de Osterwalder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Value Proposition Canvas, desarrollado por Alexander Osterwalder, es una herramienta de diseño estratégico que analiza el encaje entre lo que ofrece un negocio y lo que necesita el cliente. Divide el análisis en dos bloques: el perfil del cliente (tareas, dolores y ganancias que busca) y el mapa de valor de la empresa (productos, aliviadores de dolores y creadores de ganancias). El encaje se produce cuando ambos bloques se alinean.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi propuesta de valor realmente encaja con mi cliente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay señales claras de encaje: los clientes entienden tu oferta sin que tengas que explicar demasiado, el ciclo de venta es corto, los clientes repiten y recomiendan, y el churn es bajo. La auditoría evalúa estas dimensiones a través de preguntas sobre comunicación, diferenciación, conocimiento del cliente y resultados reales, y devuelve un diagnóstico con puntos de mejora concretos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre propuesta de valor y ventaja competitiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La propuesta de valor describe qué ofreces y para quién, mientras que la ventaja competitiva explica por qué eres difícil de replicar. Una empresa puede tener una propuesta de valor clara pero sin ventaja sostenible si cualquier competidor puede copiarla fácilmente. Lo ideal es que ambas se refuercen: una propuesta que apela a lo que el cliente necesita y que la empresa puede defender en el tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia se debe revisar la propuesta de valor de un negocio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se recomienda revisarla al menos una vez al año o cuando se produzcan cambios importantes: entrada de nuevos competidores, cambios en el comportamiento del cliente, modificaciones en el producto o expansión a nuevos mercados. Una propuesta de valor que funcionaba hace tres años puede haber quedado obsoleta si el contexto ha cambiado.',
      },
    },
  ],
};

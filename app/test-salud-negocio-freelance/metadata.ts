import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Salud de tu Negocio Freelance | meskeIA',
  description: 'Evalúa tu negocio freelance en 5 dimensiones: finanzas, clientes, eficiencia, equilibrio vida-trabajo y crecimiento. Radar chart con recomendaciones.',
  keywords: 'test freelance, salud negocio, diagnóstico freelance, autónomo, evaluación negocio, radar chart, freelance España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Salud de tu Negocio Freelance | meskeIA',
    description: 'Evalúa 5 dimensiones clave de tu negocio freelance y descubre dónde mejorar con recomendaciones personalizadas.',
    url: 'https://meskeia.com/test-salud-negocio-freelance/',
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
    title: 'Test de Salud de tu Negocio Freelance | meskeIA',
    description: 'Evalúa 5 dimensiones clave de tu negocio freelance y descubre dónde mejorar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test Salud Negocio Freelance meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Salud de tu Negocio Freelance',
  description: 'Test interactivo de 15 preguntas que evalúa tu negocio freelance en 5 dimensiones: estabilidad financiera, diversificación de clientes, eficiencia operativa, equilibrio vida-trabajo y crecimiento profesional. Incluye radar chart y recomendaciones personalizadas.',
  url: 'https://meskeia.com/test-salud-negocio-freelance/',
  features: [
    'Evaluación en 5 dimensiones clave del negocio freelance',
    'Radar chart interactivo con resultados visuales',
    'Recomendaciones personalizadas con enlaces a herramientas',
    'Puerta de entrada a la suite freelance completa de meskeIA',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué mide exactamente el test de salud de un negocio freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test evalúa cinco dimensiones clave: estabilidad financiera (ingresos, reservas y previsibilidad), diversificación de clientes (dependencia de pocos clientes), eficiencia operativa (gestión del tiempo y procesos), equilibrio vida-trabajo (límites y descanso) y crecimiento profesional (formación, posicionamiento y tarifas). Cada dimensión recibe una puntuación del 1 al 10, visible en un radar chart.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva completar el diagnóstico de negocio freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 15 preguntas y puede completarse en menos de 5 minutos. Las preguntas son de escala Likert (del 1 al 5) y están formuladas en lenguaje cotidiano, sin tecnicismos. Al finalizar se obtiene un gráfico radar inmediato con el diagnóstico y recomendaciones priorizadas según las áreas más débiles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es útil este test tanto si empiezo como freelance como si llevo años trabajando así?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, aunque el valor varía. Los freelances con menos de un año de experiencia lo usan principalmente para identificar qué áreas construir desde el principio. Los que llevan tiempo encuentran más valor en detectar puntos ciegos: por ejemplo, alguien con ingresos estables puede descubrir que tiene riesgo de concentración en un cliente que representa el 70% de su facturación. Se recomienda repetirlo cada 6 meses para ver la evolución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia a este test de otros cuestionarios para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de herramientas para autónomos se centran en aspectos fiscales o administrativos. Este test está orientado a la viabilidad y bienestar del negocio como sistema: analiza dimensiones que los contables no miden, como la dependencia de clientes o el equilibrio personal. Además, las recomendaciones están vinculadas a herramientas prácticas para actuar sobre cada punto débil detectado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué puntuación mínima debería tener un negocio freelance sano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un umbral universal, ya que depende del momento vital y del sector. Como referencia orientativa, una puntuación media por encima de 7 sobre 10 en todas las dimensiones indica un negocio estable. Puntuaciones por debajo de 5 en finanzas o diversificación de clientes son señales de alerta que conviene atender con cierta urgencia, ya que pueden comprometer la viabilidad a corto plazo.',
      },
    },
  ],
};

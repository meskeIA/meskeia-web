import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test Madurez Digital en el Trabajo — ¿Cómo usa la IA tu empresa? | meskeIA',
  description:
    '15 preguntas para descubrir el nivel de madurez digital de tu empresa. Evalúa el uso de IA, automatización, datos y cultura digital. Obtén tu perfil y recomendaciones.',
  keywords:
    'test madurez digital empresa, nivel digitalizacion empresa, uso ia empresa, transformacion digital test, madurez digital trabajo, inteligencia artificial empresa test, cultura digital organizacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test Madurez Digital en el Trabajo — ¿Cómo usa la IA tu empresa?',
    description:
      '15 preguntas para descubrir el nivel de digitalización de tu empresa. Perfil de madurez digital + recomendaciones prácticas. Gratis y en español.',
    url: 'https://meskeia.com/test-madurez-digital/',
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
    title: 'Test Madurez Digital en el Trabajo',
    description:
      '¿Qué tan digital es tu empresa? 15 preguntas → perfil de madurez + recomendaciones prácticas. ¡Descúbrelo ahora!',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test Madurez Digital",
  description: "15 preguntas para descubrir el nivel de madurez digital de tu empresa. Evalúa el uso de IA, automatización, datos y cultura digital. Obtén tu perfil y recomendaciones.",
  url: "https://meskeia.com/test-madurez-digital/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la madurez digital de una empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La madurez digital es el grado en que una organización adopta, integra y aprovecha las tecnologías digitales en sus procesos, cultura y modelo de negocio. Se mide en varios niveles: desde empresas que apenas usan herramientas digitales básicas hasta organizaciones donde los datos, la automatización y la inteligencia artificial forman parte del núcleo de la toma de decisiones. No se trata solo de tener tecnología, sino de usarla de forma estratégica y cultural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se evalúa el nivel de digitalización de una empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modelos más utilizados analizan cinco dimensiones: estrategia digital, cultura y talento, procesos y operaciones, datos e inteligencia artificial, y experiencia del cliente. Se recogen respuestas sobre el uso real de herramientas digitales, la autonomía de los equipos para tomar decisiones basadas en datos y la inversión en formación tecnológica. El resultado se mapea en un perfil de madurez que orienta los próximos pasos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer el nivel de madurez digital de mi empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer el nivel de madurez digital permite priorizar inversiones, identificar brechas de capacidad y compararse con el sector. Las empresas con mayor madurez digital tienen de media un 20-30 % más de productividad y responden más rápido a cambios del mercado. El diagnóstico también ayuda a justificar ante dirección la necesidad de un plan de transformación digital concreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre transformación digital y madurez digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La transformación digital es el proceso de cambio; la madurez digital es el nivel de avance alcanzado en ese proceso. Una empresa puede estar en plena transformación pero tener todavía una madurez baja si los cambios son recientes o superficiales. La madurez digital refleja el estado actual consolidado: qué tan integrada está la tecnología en la cultura, los procesos y la estrategia de la organización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué nivel de madurez digital necesita una pyme para ser competitiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la mayoría de pymes, alcanzar el nivel intermedio (procesos digitalizados, uso básico de analítica y automatización de tareas repetitivas) ya supone una ventaja competitiva real. No es necesario llegar al nivel más avanzado de IA generativa o big data. Lo esencial es tener una presencia digital sólida, gestionar los datos del negocio de forma estructurada y contar con herramientas digitales que reduzcan el trabajo manual en las operaciones clave.',
      },
    },
  ],
};

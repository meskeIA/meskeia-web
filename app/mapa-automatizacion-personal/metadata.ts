import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Automatización Personal - ¿Qué tareas automatizar y cuáles proteger? | meskeIA',
  description: 'Evalúa si automatizas las tareas correctas y proteges las que te hacen valioso. Test de 10 preguntas sobre automatización inteligente y protección de habilidades clave. Gratuito y sin registro.',
  keywords: 'automatización personal, qué automatizar, tareas rutinarias vs creativas, automatización inteligente, proteger habilidades, delegar a IA, productividad automatización, tareas de alto valor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Automatización Personal | meskeIA',
    description: '¿Automatizas lo correcto o estás delegando lo que te hace valioso? Test interactivo.',
    url: 'https://meskeia.com/mapa-automatizacion-personal/',
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
    title: 'Mapa de Automatización Personal | meskeIA',
    description: '¿Qué tareas deberías automatizar y cuáles proteger? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Automatización Personal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Automatización Personal',
  description: 'Herramienta interactiva de reflexión sobre automatización de tareas. 10 preguntas para evaluar si automatizas lo rutinario y proteges lo creativo. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/mapa-automatizacion-personal/',
  features: [
    'Test de 10 preguntas sobre cómo gestionas la automatización',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa automatización de lo rutinario y protección de lo creativo',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para automatizar mejor',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tareas de trabajo debería automatizar con IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tareas más candidatas a automatizar son las repetitivas, predecibles y de bajo juicio: formateo de documentos, respuestas estándar, generación de borradores a partir de esquemas, extracción de datos de formatos fijos o resúmenes de textos estructurados. Las tareas que conviene proteger son las que requieren criterio propio, relación directa con personas, juicio contextual o creatividad genuina: ahí es donde está el valor diferencial de cada profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si estoy automatizando lo correcto o lo equivocado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una señal de automatización incorrecta es delegar tareas que te distinguen profesionalmente o que requieren que tú aportes criterio: si la IA decide por ti en lugar de ayudarte a decidir más rápido, estás cediendo valor. La automatización adecuada libera tiempo de lo mecánico para hacer más de lo que importa. Este test evalúa si tu patrón actual equilibra bien ambas dimensiones: automatización de lo rutinario y protección de lo diferencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este mapa de automatización?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para cualquier profesional que ya use o esté considerando usar herramientas de automatización o IA en su trabajo. Es especialmente relevante para freelances, gestores de proyectos, consultores, creadores de contenido o responsables de equipos que quieren ser más eficientes sin perder las habilidades que los hacen valiosos. No requiere conocimientos técnicos; las preguntas parten de situaciones laborales concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre automatización y delegación de criterio a la IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Automatizar es hacer que una tarea ocurra más rápido o sin intervención manual. Delegar el criterio es dejar que la IA tome decisiones que deberían requerir tu juicio. Por ejemplo, usar IA para transcribir reuniones es automatización; usar IA para decidir qué es importante en esa reunión sin revisarlo es delegación de criterio. El segundo tipo puede parecer eficiente a corto plazo pero erosiona la capacidad de juzgar y el conocimiento contextual acumulado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva el test y qué obtengo al final?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test se completa en 5-8 minutos y consta de 10 preguntas sobre situaciones reales de trabajo. Al terminar obtienes un diagnóstico visual con tu posición en un mapa bidimensional que cruza automatización de lo rutinario con protección de lo creativo, un perfil con tus fortalezas y riesgos actuales, y acciones concretas priorizadas. No requiere registro ni email.',
      },
    },
  ],
};

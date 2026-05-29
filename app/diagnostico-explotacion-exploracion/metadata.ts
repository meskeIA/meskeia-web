import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico Explotación vs Exploración - ¿Tu empresa innova o solo optimiza? | meskeIA',
  description: 'Descubre si tu organización equilibra bien la eficiencia operativa con la innovación. Test interactivo basado en el modelo de James G. March (1991). Gratuito y sin registro.',
  keywords: 'explotación exploración, March, innovación empresa, diagnóstico organizacional, management, balance estratégico, eficiencia vs innovación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico Explotación vs Exploración | meskeIA',
    description: '¿Tu organización está demasiado centrada en el corto plazo? Test interactivo basado en James G. March.',
    url: 'https://meskeia.com/diagnostico-explotacion-exploracion/',
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
    title: 'Diagnóstico Explotación vs Exploración | meskeIA',
    description: '¿Tu organización equilibra eficiencia e innovación? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico Explotación vs Exploración meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico Explotación vs Exploración',
  description: 'Herramienta interactiva de reflexión para evaluar si tu organización equilibra la eficiencia operativa (explotación) con la innovación y el aprendizaje (exploración). Basado en el modelo académico de James G. March (1991).',
  url: 'https://meskeia.com/diagnostico-explotacion-exploracion/',
  features: [
    'Test de 10 preguntas sobre tu organización o equipo',
    'Diagnóstico visual con perfil personalizado',
    'Basado en el modelo académico de James G. March (1991)',
    'Acciones concretas según tu resultado',
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
      name: '¿Qué es la tensión entre explotación y exploración en una empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tensión explotación-exploración describe el dilema estratégico que enfrentan las organizaciones entre optimizar lo que ya hacen bien (explotación) e invertir en nuevas ideas, productos o modelos de negocio (exploración). El economista James G. March identificó en 1991 que las empresas que se inclinan demasiado hacia la explotación arriesgan quedarse obsoletas, mientras que las que exploran en exceso pueden perder eficiencia operativa. El equilibrio entre ambas es clave para la sostenibilidad a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi empresa está demasiado centrada en la eficiencia y descuida la innovación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Señales de un exceso de explotación son: los proyectos de innovación se cancelan sistemáticamente por presupuesto, las métricas de corto plazo dominan todas las decisiones, hay resistencia al cambio y el equipo rara vez propone ideas nuevas. Un diagnóstico basado en preguntas sobre procesos reales de tu organización puede ayudarte a detectar si el desequilibrio existe y en qué áreas es más pronunciado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este tipo de diagnóstico organizacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para líderes de equipo, managers intermedios, directivos y fundadores de startups o pymes que quieran entender la orientación estratégica real de su organización. También resulta valioso para consultores, coaches organizacionales y profesionales de recursos humanos que acompañan procesos de cambio o transformación cultural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este diagnóstico de un análisis DAFO o una auditoría de innovación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El DAFO analiza factores internos y externos del negocio desde una perspectiva estática, mientras que una auditoría de innovación suele medir outputs (patentes, nuevos productos). Este diagnóstico, basado en el modelo de March, evalúa la orientación cognitiva y cultural de la organización: cómo toma decisiones, distribuye recursos y responde a la incertidumbre. Es una herramienta de reflexión, no de medición de resultados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué proporción ideal existe entre explotación y exploración?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una proporción universal válida para todas las industrias. En sectores maduros o regulados (banca, salud, utilities) el peso de la explotación suele ser mayor. En tecnología o medios, la exploración constante es necesaria para sobrevivir. Investigaciones posteriores al trabajo de March sugieren que las organizaciones más resilientes desarrollan capacidades "ambidextras": unidades separadas para explorar y estructuras eficientes para explotar, coordinadas desde la dirección.',
      },
    },
  ],
};

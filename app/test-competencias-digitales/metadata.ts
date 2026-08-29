import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Territorio carrera/empleo. Marco europeo DigComp, pero las competencias digitales
// son universales → vocabulario LATAM-friendly, sin RegionBadge (no es fiscal-España).

export const metadata: Metadata = {
  title: 'Test de Competencias Digitales (DigComp) — Autoevaluación y Plan - meskeIA',
  description:
    'Autoevalúa tus competencias digitales con el marco europeo DigComp: 21 competencias en 5 áreas. Descubre tu nivel, tus lagunas y un plan de desarrollo. Gratis.',
  keywords:
    'test competencias digitales, autoevaluación competencias digitales, DigComp, nivel de competencia digital, marco europeo competencias digitales, habilidades digitales, alfabetización digital, evaluación competencias digitales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Competencias Digitales (DigComp) — Autoevaluación formativa',
    description:
      'Descubre tu nivel en las 21 competencias digitales del marco DigComp, detecta tus lagunas y obtén un plan de desarrollo personalizado. Sin registro.',
    url: 'https://meskeia.com/test-competencias-digitales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Competencias Digitales (DigComp)',
    description:
      'Autoevaluación formativa de tus competencias digitales: nivel por competencia, gaps y plan de desarrollo. Basado en el marco europeo DigComp 2.2.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Test de Competencias Digitales meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Test de Competencias Digitales (DigComp)',
  description:
    'Autoevaluación formativa de competencias digitales basada en el marco europeo DigComp 2.2. Evalúa las 21 competencias de las 5 áreas mediante afirmaciones concretas de "sé hacer esto", deriva tu nivel (Fundamental, Intermedio, Avanzado o Altamente especializado) por competencia y área, detecta tus lagunas frente a un perfil objetivo y ofrece un plan de desarrollo con pasos concretos. No es una credencial: es una herramienta de práctica y mejora.',
  url: 'https://meskeia.com/test-competencias-digitales/',
  category: 'EducationalApplication',
  features: [
    'Marco europeo DigComp 2.2: 5 áreas, 21 competencias, 4 tramos de dominio',
    'Autoevaluación basada en evidencia ("sé hacer esto"), no en autopercepción abstracta',
    'Nivel por competencia y por área con radar de resultados',
    'Perfil objetivo por contexto (estudiante, empleo, teletrabajo, emprendedor…)',
    'Análisis de lagunas frente al objetivo con plan de desarrollo',
    'Re-medición con seguimiento de tu progreso en el tiempo',
    'Exporta tu perfil en Markdown; todo se guarda en tu navegador',
    'Gratuito, sin registro y sin publicidad',
  ],
  keywords: [
    'test competencias digitales',
    'DigComp',
    'autoevaluación competencias digitales',
    'nivel de competencia digital',
    'habilidades digitales',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el marco DigComp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DigComp es el Marco Europeo de Competencias Digitales para la Ciudadanía, elaborado por la Comisión Europea (Centro Común de Investigación, JRC). Su versión 2.2 (2022) organiza la competencia digital en 5 áreas y 21 competencias, con 8 niveles de dominio agrupados en 4 tramos: Fundamental, Intermedio, Avanzado y Altamente especializado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia esta autoevaluación de la de Europass?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Europass te pide que elijas tu nivel en 5 áreas de forma general y te da un resultado para el CV. Esta herramienta va al detalle de las 21 competencias, usa afirmaciones concretas de "sé hacer esto" para calibrar mejor tu nivel real y, sobre todo, te devuelve tus lagunas y un plan de desarrollo con pasos concretos. Es formativa, no una credencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las 5 áreas de competencia digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son: 1) Información y alfabetización de datos; 2) Comunicación y colaboración; 3) Creación de contenidos digitales; 4) Seguridad; y 5) Resolución de problemas. Cada área agrupa varias competencias, hasta un total de 21.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa cada nivel de competencia digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fundamental (haces tareas sencillas con ayuda), Intermedio (resuelves por tu cuenta tareas y problemas frecuentes), Avanzado (afrontas tareas diversas y orientas a otras personas) y Altamente especializado (resuelves problemas complejos y aportas ideas nuevas a tu entorno). Corresponden a los 8 niveles de DigComp agrupados de dos en dos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se guardan mis respuestas en algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Tus respuestas y tu historial de mediciones se guardan solo en el almacenamiento local de tu navegador. No se envían a ningún servidor ni requieren registro. Puedes exportar tu perfil en Markdown para conservarlo o compartirlo.',
      },
    },
  ],
};

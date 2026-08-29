import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Territorio carrera/empleo. Término núcleo con variantes a ambos lados del Atlántico:
// España "currículum / CV", Latam "hoja de vida / CV". Ambas en title/H1/keywords.

export const metadata: Metadata = {
  title: 'Crear Currículum (CV / Hoja de Vida) Gratis Online - meskeIA',
  description:
    'Crea tu currículum o hoja de vida gratis y sin registro. Vista previa en vivo, plantilla ATS-friendly, consejos y exportación a PDF, HTML o texto. Todo en tu navegador.',
  keywords:
    'crear currículum, hacer currículum gratis, generador de currículum, currículum vitae, hoja de vida, CV online, plantilla currículum, currículum ATS, currículum sin registro, hacer CV',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Crear Currículum / CV / Hoja de Vida gratis online',
    description:
      'Rellena tus datos y obtén un currículum limpio y ATS-friendly con vista previa en vivo. Exporta a PDF, HTML o texto plano. Sin registro y sin publicidad.',
    url: 'https://meskeia.com/generador-curriculum/',
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
    title: 'Crear Currículum / CV / Hoja de Vida gratis',
    description:
      'Constructor de currículum con vista previa, plantilla ATS-friendly y exportación a PDF. Sin registro, todo en tu navegador.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Generador de Currículum meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Currículum (CV / Hoja de Vida)',
  description:
    'Herramienta gratuita para crear tu currículum, CV u hoja de vida sin registro. Rellenas tus datos por secciones (experiencia, formación, habilidades, idiomas…), ves una vista previa en vivo con una plantilla limpia y ATS-friendly, y exportas a PDF, HTML, Markdown o texto plano. Incluye indicador de calidad y consejos para superar los filtros automáticos (ATS). Todo se guarda en tu navegador.',
  url: 'https://meskeia.com/generador-curriculum/',
  category: 'UtilityApplication',
  features: [
    'Vista previa del currículum en vivo mientras lo rellenas',
    'Plantilla limpia y ATS-friendly (a una columna, encabezados estándar)',
    'Secciones: datos, resumen, experiencia, formación, habilidades, idiomas y más',
    'Exporta a PDF (imprimir), HTML, Markdown o texto plano para formularios ATS',
    'Indicador de calidad y consejos para pasar los filtros automáticos',
    'Selector de color de acento',
    'Sin registro: todo se guarda en tu propio navegador',
    'Gratuito y sin publicidad',
  ],
  keywords: [
    'crear currículum',
    'hoja de vida',
    'CV online',
    'generador de currículum',
    'currículum ATS',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo hago un currículum gratis con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rellena tus datos por secciones (datos de contacto, resumen, experiencia, formación, habilidades e idiomas) y verás una vista previa del currículum en vivo. Cuando termines, puedes exportarlo a PDF (imprimiendo), HTML, Markdown o texto plano. No necesitas registrarte: todo se guarda en tu navegador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un currículum ATS-friendly y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Muchas empresas usan sistemas ATS (Applicant Tracking System) que leen tu CV automáticamente antes de que lo vea una persona. Un currículum ATS-friendly usa una sola columna, encabezados estándar, texto seleccionable (no imágenes) y palabras clave de la oferta, para que el sistema lo interprete bien. Esta plantilla está diseñada así.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Currículum, CV y hoja de vida son lo mismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. "Currículum" o "currículum vitae" (CV) es el término más usado en España, y "hoja de vida" es el habitual en gran parte de Latinoamérica. Se refieren al mismo documento: el resumen de tu experiencia, formación y habilidades para postular a un empleo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo descargo mi currículum en PDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pulsa en "Abrir versión imprimible": se abrirá tu currículum limpio en una pestaña nueva. Desde ahí usa Imprimir (Ctrl+P o Cmd+P) y elige "Guardar como PDF" como destino. También puedes descargar el HTML o el texto plano para pegarlo en formularios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pongo si es mi primer empleo y no tengo experiencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Da protagonismo a tu formación, tus proyectos de estudios, prácticas, voluntariado y habilidades. En el resumen explica qué buscas y qué aportas. Los logros concretos (aunque sean académicos o de voluntariado) y las competencias digitales pesan más que la antigüedad.',
      },
    },
  ],
};

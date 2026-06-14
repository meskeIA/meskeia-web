import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Curso Decisiones de Inversión - Aprende a Invertir desde Cero | meskeIA',
  description: 'Curso gratuito de inversión con 10 capítulos, herramientas interactivas y casos reales. Aprende asset allocation, gestión de riesgo, ETFs y estrategias de inversión profesionales.',
  keywords: 'curso inversión gratis, educación financiera, asset allocation, gestión riesgo, ETFs, cartera inversión, perfil inversor, finanzas personales, estrategias inversión, value investing',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso Decisiones de Inversión - Aprende a Invertir | meskeIA',
    description: 'Curso gratuito de inversión: 10 capítulos con herramientas interactivas y casos prácticos. Aprende asset allocation, gestión de riesgo y estrategias profesionales.',
    url: 'https://meskeia.com/curso-decisiones-inversion/',
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
    title: 'Curso Decisiones de Inversión | meskeIA',
    description: 'Aprende a invertir desde cero con nuestro curso gratuito. 10 capítulos + herramientas + casos reales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Decisiones de Inversión meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso Decisiones de Inversión - Aprende a Invertir desde Cero",
  description: "Curso gratuito de inversión con 10 capítulos, herramientas interactivas y casos reales. Aprende asset allocation, gestión de riesgo, ETFs y estrategias de inversión profesionales.",
  url: 'https://meskeia.com/curso-decisiones-inversion/',
  category: 'EducationalApplication',
  features: [
    "10 capítulos progresivos desde conceptos básicos hasta gestión avanzada de cartera",
    "Herramientas interactivas integradas: perfil de riesgo, comparador de activos y simulador",
    "Contenido sobre acciones, bonos, ETFs, fondos indexados y gestión de riesgo",
    "Progreso guardado localmente para retomar el curso donde lo dejaste",
    "Casos prácticos y ejemplos reales orientados al mercado español",
    "Incluye psicología del inversor y estrategias value, growth y dividendos",
    "Acceso gratuito y completo, sin registro ni instalación",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué aprenderé en este curso de decisiones de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso cubre 10 capítulos que van desde los fundamentos del mercado financiero hasta la gestión avanzada de carteras. Aprenderás a analizar tu perfil de riesgo, elegir entre acciones, bonos, ETFs y fondos indexados, construir una estrategia de asset allocation, gestionar el riesgo con diversificación y comprender la psicología del inversor. Todo con ejemplos orientados al contexto español.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se necesita para completar el curso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso tiene 10 capítulos con una duración estimada total de varias horas. Puedes avanzar a tu propio ritmo: el progreso se guarda automáticamente en tu navegador, por lo que puedes interrumpirlo y retomarlo cuando quieras. Cada capítulo incluye teoría, ejemplos y una herramienta interactiva que amplía el tiempo de práctica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este curso de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está diseñado para personas sin experiencia previa que quieran iniciarse en la inversión, así como para quienes ya invierten de forma intuitiva y desean estructurar mejor sus decisiones. El nivel de partida es básico, pero los capítulos avanzados abordan gestión de riesgo, análisis fundamental y estrategias de cartera utilizadas por inversores profesionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia tiene este curso respecto a otros recursos de educación financiera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de artículos o vídeos sueltos, este curso tiene una estructura progresiva con 10 capítulos conectados entre sí. Incluye herramientas interactivas integradas (simulador de perfil de riesgo, comparador de activos) que permiten aplicar inmediatamente cada concepto. El contenido es gratuito, sin registro y está orientado específicamente al contexto de mercado y fiscalidad española.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El curso da recomendaciones sobre dónde invertir o qué valores comprar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El curso es de carácter educativo y no constituye asesoramiento financiero personalizado ni recomendaciones de inversión concretas. Su objetivo es proporcionar los conocimientos y el marco de análisis para que cada persona tome sus propias decisiones informadas. Para inversiones reales con implicaciones fiscales o patrimoniales significativas, se recomienda consultar con un asesor financiero regulado.',
      },
    },
  ],
};

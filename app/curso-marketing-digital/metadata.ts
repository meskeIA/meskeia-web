import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Curso de Marketing Digital 2025 - Estrategias que Funcionan | meskeIA',
  description: 'Aprende marketing digital desde cero: branding, SEO, redes sociales, publicidad online, automatización e IA. 30 capítulos prácticos con ejemplos reales.',
  keywords: 'marketing digital, curso marketing, seo, redes sociales, publicidad online, branding, customer centricity, meta ads, google ads, email marketing, automatizacion, ia marketing',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Marketing Digital 2025 - meskeIA',
    description: 'Domina el marketing digital: desde fundamentos hasta IA y automatización. 30 capítulos prácticos.',
    url: 'https://meskeia.com/curso-marketing-digital/',
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
    title: 'Curso de Marketing Digital 2025',
    description: 'Aprende marketing digital con estrategias actualizadas a 2025. Curso gratuito de meskeIA.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Marketing Digital 2025 - Estrategias que Funcionan",
  description: "Aprende marketing digital desde cero: branding, SEO, redes sociales, publicidad online, automatización e IA. 30 capítulos prácticos con ejemplos reales.",
  url: 'https://meskeia.com/curso-marketing-digital/',
  category: 'EducationalApplication',
  features: [
    "30 capítulos organizados en 6 módulos: fundamentos, branding, SEO, publicidad, IA y automatización",
    "Progreso guardado en el navegador para retomar el curso donde lo dejaste",
    "Contenido sobre Meta Ads, Google Ads, Email Marketing, SEO y GEO/AEO para IAs",
    "Estrategias actualizadas a 2025 con ejemplos prácticos y herramientas reales",
    "Módulo de IA aplicada al marketing: prompts, automatización y optimización",
    "Acceso gratuito y completo, sin registro ni instalación",
    "Herramientas complementarias integradas: generador de keywords, analizador GEO y calculadora ROI",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué aprenderé en este curso de marketing digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso cubre 30 capítulos en 6 módulos: fundamentos del marketing moderno y las 4P actualizadas, branding y posicionamiento, estrategia de contenidos y SEO, publicidad en Meta Ads y Google Ads, marketing automation y email, e inteligencia artificial aplicada al marketing. Cada módulo incluye teoría actualizada y ejemplos prácticos orientados a emprendedores y profesionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva completar el curso de marketing digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso tiene 30 capítulos con una duración estimada total de varias horas de contenido. Puedes avanzar a tu ritmo: el progreso se guarda automáticamente en tu navegador. Si estudias 2-3 capítulos por día, puedes completarlo en unas dos semanas. No hay fecha límite ni caducidad del contenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es este curso de marketing digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está diseñado para emprendedores que quieran dar visibilidad a su negocio, marketers que busquen actualizar sus conocimientos a las estrategias de 2025, y profesionales de otras áreas que necesiten entender el marketing digital. El nivel de partida es básico, pero los módulos avanzados de IA y publicidad de pago abordan conceptos de nivel intermedio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El curso incluye marketing con inteligencia artificial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Hay un módulo dedicado a IA aplicada al marketing que cubre el uso de herramientas de IA para generación de contenido, automatización de campañas, análisis de datos y optimización de prompts para marketing. También se trata el GEO (Generative Engine Optimization) para aparecer en respuestas de ChatGPT, Perplexity y Gemini.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia tiene este curso respecto a otros cursos de marketing online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de cursos en vídeo de plataformas de pago, este curso es completamente gratuito, no requiere registro y funciona en el navegador sin instalar nada. El contenido está actualizado a 2025 incluyendo estrategias de IA y GEO/AEO que muchos cursos de pago no contemplan aún. Se complementa con herramientas interactivas integradas como generador de keywords y calculadora de ROI.',
      },
    },
  ],
};

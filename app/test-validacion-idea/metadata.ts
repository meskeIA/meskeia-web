import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Validación de Idea - ¿Tu idea resuelve un problema real? | meskeIA',
  description: 'Descubre si tu idea de negocio resuelve un problema real o solo te gusta a ti. Test de 10 preguntas basado en Lean Startup (Eric Ries). Evalúa asunciones y validación. Gratuito.',
  keywords: 'validación idea, Lean Startup, Eric Ries, MVP, problema real, validar negocio, asunciones, product market fit, emprendimiento, startup',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Validación de Idea | meskeIA',
    description: '¿Tu idea resuelve un problema real? Test basado en Lean Startup.',
    url: 'https://meskeia.com/test-validacion-idea/',
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
    title: 'Test de Validación de Idea | meskeIA',
    description: '¿Tu idea tiene mercado real? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Test de Validación de Idea meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Validación de Idea',
  description: 'Herramienta interactiva de reflexión para evaluar si tu idea de negocio resuelve un problema real. Basado en Lean Startup de Eric Ries.',
  url: 'https://meskeia.com/test-validacion-idea/',
  features: ['Test de 10 preguntas sobre asunciones y validación', 'Diagnóstico visual con mapa 2D y perfil personalizado', 'Basado en Lean Startup (Eric Ries)', 'Acciones concretas según tu resultado'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué significa validar una idea de negocio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Validar una idea de negocio significa obtener evidencia real (no opiniones de amigos ni intuición propia) de que existe un problema suficientemente doloroso para un grupo de personas dispuestas a pagar por resolverlo. La validación implica salir a hablar con potenciales clientes, observar comportamientos reales y comprobar que las asunciones clave sobre el mercado son correctas antes de invertir tiempo y dinero en desarrollar el producto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el test de validación de idea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 10 preguntas que cubren las asunciones críticas de cualquier idea: si el problema existe y duele lo suficiente, si has hablado con personas reales del segmento objetivo, si hay dispossición a pagar, si tienes evidencia de que la solución funciona, etc. El resultado se muestra en un mapa 2D (problema real vs. validación real) con un perfil y recomendaciones concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Lean Startup y en qué se basa este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lean Startup es una metodología de emprendimiento propuesta por Eric Ries que plantea construir productos mediante ciclos cortos de aprendizaje validado: construir un prototipo mínimo (MVP), medir el comportamiento real de los usuarios y aprender qué ajustar. El principio central es que las startups no fallan por falta de recursos, sino por construir algo que nadie quiere sin haberlo comprobado antes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas personas necesito entrevistar para validar una idea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un número mágico, pero la mayoría de expertos en Lean Startup recomiendan entre 10 y 20 entrevistas cualitativas con potenciales clientes reales (no conocidos ni familiares) antes de sacar conclusiones. Lo importante no es la cantidad sino la calidad: entrevistas profundas que exploren comportamientos pasados (no intenciones futuras) dan información mucho más fiable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un problema real y un problema imaginado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un problema real es aquel que las personas ya intentan resolver activamente (con soluciones imperfectas, workarounds o gasto de dinero). Un problema imaginado es aquel que el emprendedor proyecta en los demás porque le afecta a él o le parece obvio. La señal más clara de problema real es que las personas ya están gastando tiempo o dinero en paliarlo, aunque de forma ineficiente.',
      },
    },
  ],
};

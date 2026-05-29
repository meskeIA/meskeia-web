import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Riesgo del Emprendedor - ¿Qué pasa si no funciona? | meskeIA',
  description: 'Descubre si estás gestionando bien los riesgos de emprender. Test de 10 preguntas sobre exposición al riesgo y preparación. Diagnóstico visual con perfil y acciones. Gratuito.',
  keywords: 'riesgo emprendedor, gestión riesgo, plan B, emprender riesgos, colchón financiero, riesgo calculado, fracaso emprendedor, preparación emprendimiento, resiliencia emprendedor, análisis riesgos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Riesgo del Emprendedor | meskeIA',
    description: '¿Qué pasa si tu proyecto no funciona? ¿Lo has pensado? Test interactivo.',
    url: 'https://meskeia.com/mapa-riesgo-emprendedor/',
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
    title: 'Mapa de Riesgo del Emprendedor | meskeIA',
    description: '¿Tienes plan B? Evalúa tus riesgos con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa de Riesgo del Emprendedor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Riesgo del Emprendedor',
  description: 'Herramienta interactiva de reflexión para evaluar si estás gestionando bien los riesgos de emprender. Análisis de exposición y preparación ante el fracaso.',
  url: 'https://meskeia.com/mapa-riesgo-emprendedor/',
  features: ['Test de 10 preguntas sobre exposición y preparación', 'Diagnóstico visual con mapa 2D y perfil personalizado', 'Basado en análisis de riesgos personales', 'Acciones concretas según tu resultado', 'Funciona 100% en el navegador, sin registro ni instalación', 'Gratuito y sin publicidad', 'Disponible en español'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el mapa de riesgo del emprendedor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una herramienta de autoevaluación que mide dos dimensiones clave al emprender: tu nivel de exposición al riesgo (financiera, profesional y personal) y tu grado de preparación ante un posible fracaso. El resultado se representa en un mapa 2D con un perfil personalizado y acciones concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi nivel de riesgo al emprender es demasiado alto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test evalúa factores como si tienes deudas personales, dependientes a tu cargo, ausencia de ingresos alternativos o falta de colchón financiero. Un emprendedor con alta exposición y baja preparación se sitúa en el cuadrante de mayor riesgo, lo que no significa que deba renunciar, sino que necesita un plan de contingencia sólido antes de lanzarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve tener un plan B antes de emprender?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plan B no es pesimismo sino gestión racional de la incertidumbre. Estudios sobre fracaso empresarial muestran que los emprendedores que anticipan escenarios negativos tienen mayor capacidad de recuperación y menor impacto emocional y financiero cuando las cosas no salen como se esperaba. Prepararse para el fracaso también mejora la toma de decisiones durante el proceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este test de un análisis DAFO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El análisis DAFO evalúa el proyecto en sí (fortalezas, debilidades, oportunidades, amenazas). Este mapa de riesgo evalúa al emprendedor como persona: su situación personal, financiera y profesional, y qué tan preparado está para absorber un fracaso. Son complementarios: uno analiza el negocio, el otro analiza al fundador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto colchón financiero se recomienda tener antes de emprender a tiempo completo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una cifra universal, pero muchos asesores de emprendimiento sugieren cubrir entre 6 y 18 meses de gastos personales antes de dejar un empleo estable. El tiempo necesario depende del sector, del ritmo de generación de ingresos del proyecto y de las responsabilidades personales de cada persona. Lo importante es conocer tu propio umbral de resistencia.',
      },
    },
  ],
};

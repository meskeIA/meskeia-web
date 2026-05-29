import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Energía Semanal - ¿Dónde gastas energía sin retorno? | meskeIA',
  description: 'Descubre dónde pierdes energía y cómo la recuperas. Test de 10 preguntas basado en el modelo de gestión de energía de Loehr y Schwartz. Diagnóstico visual con perfil y acciones. Gratuito.',
  keywords: 'energía semanal, gestión energía, Loehr Schwartz, desgaste laboral, recarga energía, productividad energía, burnout prevención, rendimiento sostenible, energía personal, fatiga laboral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Energía Semanal | meskeIA',
    description: '¿Dónde gastas energía sin retorno? Test interactivo de gestión de energía.',
    url: 'https://meskeia.com/auditoria-energia-semanal/',
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
    title: 'Auditoría de Energía Semanal | meskeIA',
    description: '¿Tu energía está bien gestionada? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Auditoría de Energía Semanal meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Energía Semanal',
  description: 'Herramienta interactiva de reflexión para evaluar cómo gestionas tu energía semanal. Basado en el modelo de gestión de energía de Loehr y Schwartz.',
  url: 'https://meskeia.com/auditoria-energia-semanal/',
  features: [
    'Test de 10 preguntas sobre desgaste y recarga de energía',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el modelo de Loehr y Schwartz',
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
      name: '¿Qué es la gestión de energía personal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La gestión de energía personal es la práctica de identificar las actividades y situaciones que drenan o recargan nuestra energía física, emocional, mental y espiritual a lo largo de la semana. A diferencia de la gestión del tiempo, que se enfoca en horas disponibles, este enfoque propone que el rendimiento sostenible depende de equilibrar el gasto y la recuperación de energía en esas cuatro dimensiones. Fue popularizado por Jim Loehr y Tony Schwartz en su investigación con deportistas de élite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se basa el modelo de Loehr y Schwartz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Loehr y Schwartz propusieron en "The Power of Full Engagement" que el rendimiento sostenible requiere gestionar cuatro tipos de energía: física (sueño, ejercicio, alimentación), emocional (relaciones, estado de ánimo), mental (concentración, toma de decisiones) y de propósito (alineación con valores). Su modelo defiende que el descanso y la recuperación son tan importantes como el esfuerzo, y que ignorarlos lleva al agotamiento crónico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona esta auditoría de energía semanal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta presenta 10 preguntas sobre tus hábitos semanales de gasto y recuperación de energía. Las respuestas se evalúan en dos ejes: nivel de desgaste acumulado y capacidad de recarga efectiva. El resultado muestra un mapa visual con tu perfil energético y acciones concretas para mejorar el equilibrio, adaptadas a tu situación específica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre fatiga y agotamiento crónico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fatiga normal desaparece tras una noche de sueño reparador o un fin de semana de descanso; es la señal natural de que el cuerpo necesita recuperarse. El agotamiento crónico, en cambio, persiste incluso después del descanso y suele afectar simultáneamente al plano físico, emocional y cognitivo. Implica dificultad para concentrarse, pérdida de motivación y mayor irritabilidad. Esta auditoría ayuda a detectar si estás en la primera fase antes de que escale.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil esta auditoría de energía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que sienta que termina la semana más cansada de lo que empieza, que tenga dificultad para desconectar, que note pérdida de concentración o motivación, o que quiera entender mejor qué actividades le restan energía y cuáles se la devuelven. No requiere conocimientos previos y se completa en menos de 5 minutos.',
      },
    },
  ],
};

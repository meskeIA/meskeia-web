import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Temporizador Pomodoro Online - Técnica Pomodoro Gratis | meskeIA',
  description: 'Temporizador Pomodoro online gratuito. Mejora tu productividad con sesiones de 25 minutos, estadísticas de concentración y sonidos personalizables. Sin registro.',
  keywords: 'pomodoro, temporizador, productividad, concentracion, tecnica pomodoro, timer, enfoque, trabajo, estudio, 25 minutos, descanso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Temporizador Pomodoro Online Gratis - meskeIA',
    description: 'Mejora tu productividad con la técnica Pomodoro. Sesiones configurables, estadísticas y sonidos. 100% gratuito.',
    url: 'https://meskeia.com/temporizador-pomodoro/',
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
    title: 'Temporizador Pomodoro Online - meskeIA',
    description: 'Técnica Pomodoro gratuita con estadísticas de productividad',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Temporizador Pomodoro meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Temporizador Pomodoro",
  description: "Temporizador Pomodoro online gratuito. Mejora tu productividad con sesiones de 25 minutos, estadísticas de concentración y sonidos personalizables. Sin registro.",
  url: "https://meskeia.com/temporizador-pomodoro/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la técnica Pomodoro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La técnica Pomodoro es un método de gestión del tiempo desarrollado por Francesco Cirillo a finales de los años 80. Consiste en trabajar en bloques de 25 minutos de concentración intensa (llamados "pomodoros"), seguidos de un descanso corto de 5 minutos. Cada cuatro pomodoros se toma un descanso largo de 15 a 30 minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué son 25 minutos y no más o menos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los 25 minutos son una recomendación de partida, no una regla fija. Cirillo eligió ese intervalo porque es suficientemente largo para entrar en estado de concentración pero corto para mantener la sensación de urgencia y evitar la fatiga mental. Muchas personas ajustan la duración entre 20 y 50 minutos según su tarea y nivel de experiencia con el método.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de tareas sirve mejor el método Pomodoro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método Pomodoro es especialmente útil para tareas que requieren concentración sostenida: estudio, escritura, programación, análisis de datos o aprendizaje de un idioma. Es menos adecuado para tareas creativas de flujo continuo o reuniones en las que no controlas el tiempo. También ayuda a reducir la procrastinación al dividir proyectos grandes en bloques manejables.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos pomodoros se pueden hacer al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de personas consigue entre 8 y 12 pomodoros productivos al día en una jornada completa de trabajo. Cirillo sugería que un trabajador del conocimiento raramente supera los 12 pomodoros de alta concentración. Empezar con 4-6 pomodoros diarios es razonable si es la primera semana usando el método.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo parar obligatoriamente cuando suena el temporizador aunque esté concentrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación original de Cirillo es sí: parar y tomar el descanso aunque estés en un buen momento. El objetivo del descanso es prevenir la fatiga acumulada y refrescar la atención. En la práctica, muchos usuarios hacen una excepción si están a punto de terminar una subtarea concreta, lo cual es razonable siempre que el descanso se tome poco después.',
      },
    },
  ],
};

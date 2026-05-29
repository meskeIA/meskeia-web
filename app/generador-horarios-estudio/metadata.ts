import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Horarios de Estudio - Planifica tu Semana | meskeIA',
  description: 'Crea horarios de estudio personalizados. Añade asignaturas con prioridad, configura tu disponibilidad semanal y genera automáticamente un plan de estudio optimizado.',
  keywords: 'horario estudio, planificador semanal, organización estudios, pomodoro, calendario estudio, productividad académica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Horarios de Estudio | meskeIA',
    description: 'Crea tu horario de estudio semanal personalizado y optimizado.',
    url: 'https://meskeia.com/generador-horarios-estudio/',
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
    title: 'Generador de Horarios de Estudio | meskeIA',
    description: 'Organiza tu semana de estudio de forma inteligente.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Horarios de Estudio",
  description: "Crea horarios de estudio personalizados. Añade asignaturas con prioridad, configura tu disponibilidad semanal y genera automáticamente un plan de estudio optimizado.",
  url: "https://meskeia.com/generador-horarios-estudio/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo crear un horario de estudio semanal efectivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para crear un horario de estudio eficaz, empieza por identificar cuántas horas libres tienes cada día una vez descontadas las clases, el trabajo, el desplazamiento y el descanso. Luego asigna las asignaturas más difíciles o con mayor peso en los momentos de mayor concentración (normalmente mañana o primera tarde). Reserva también tiempo de repaso semanal y no programes más del 70-80 % del tiempo disponible para absorber imprevistos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas diarias hay que estudiar para aprobar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una cifra universal: depende del nivel educativo, la dificultad de las asignaturas y la cercanía de los exámenes. Como orientación general, en educación secundaria se recomienda entre 1 y 2 horas diarias en periodo ordinario y hasta 4 horas en época de exámenes. En universidad, la media oscila entre 3 y 5 horas diarias, aunque la calidad y la técnica de estudio importan más que la cantidad de horas brutas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un generador de horarios de estudio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de secundaria, bachillerato, formación profesional o universidad que tienen varias asignaturas con distintos niveles de dificultad y fechas de examen. También lo aprovechan personas que estudian oposiciones, idiomas o certificaciones profesionales compaginando el estudio con trabajo, y cualquiera que quiera organizar mejor su tiempo sin hacerlo manualmente en papel o en una hoja de cálculo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un generador de horarios y una agenda o calendario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una agenda o calendario te permite anotar eventos manualmente, pero no optimiza automáticamente la distribución. Un generador de horarios de estudio tiene en cuenta variables como la prioridad de cada asignatura, las horas disponibles por día y la carga total de trabajo para proponer un reparto equilibrado. El resultado es un plan de estudio consistente que evita sobrecargar unos días y dejar otros vacíos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la técnica Pomodoro y cómo se integra en un horario de estudio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La técnica Pomodoro divide el tiempo de trabajo en bloques de 25 minutos de concentración seguidos de 5 minutos de descanso. Cada 4 bloques se hace un descanso más largo de 15-30 minutos. Integrarla en un horario de estudio significa planificar los slots de estudio en múltiplos de 25-30 minutos y respetar los descansos programados, lo que mejora la concentración y reduce la fatiga mental acumulada.',
      },
    },
  ],
};

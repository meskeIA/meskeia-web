import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Gestión del Estrés | ¿Cómo Manejas el Estrés? | meskeIA',
  description: 'Test de 10 preguntas para saber qué método de gestión del estrés se adapta mejor a ti: meditación/mindfulness, ejercicio físico, terapia/psicología, hobbies creativos o desconexión digital.',
  keywords: ['cómo gestionar el estrés', 'técnicas para reducir estrés', 'meditación o ejercicio para el estrés', 'terapia psicológica estrés', 'mindfulness estrés', 'hobbies para desestresarse', 'desconexión digital bienestar', 'método antiestrés según perfil', 'ansiedad y estrés qué hacer', 'bienestar mental España'],
  openGraph: {
    title: 'Selector de Gestión del Estrés — ¿Qué Método te Funciona Mejor?',
    description: 'Descubre qué método de gestión del estrés se adapta mejor a tu perfil en 10 preguntas.',
    url: 'https://meskeia.com/selector-gestion-estres/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Gestión del Estrés",
  description: "Test de 10 preguntas para saber qué método de gestión del estrés se adapta mejor a ti: meditación/mindfulness, ejercicio físico, terapia/psicología, hobbies creativos o desconexión digital.",
  url: "https://meskeia.com/selector-gestion-estres/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué método de gestión del estrés es más efectivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un método universalmente superior: la efectividad depende del perfil personal y el tipo de estrés. La meditación y el mindfulness funcionan bien para estrés crónico y rumia mental, mientras que el ejercicio físico es especialmente eficaz para el estrés fisiológico acumulado. Un test personalizado ayuda a identificar cuál encaja mejor con tu estilo de vida y preferencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo al día hay que dedicar a reducir el estrés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de técnicas de gestión del estrés muestran beneficios con 15-20 minutos diarios de práctica consistente. El ejercicio aeróbico moderado requiere 30 minutos unas 3-4 veces por semana. La clave no es la duración sino la regularidad: pequeñas dosis diarias son más eficaces que sesiones largas esporádicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un selector de gestión del estrés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un selector de gestión del estrés analiza tu estilo de vida, preferencias y contexto mediante preguntas cortas para recomendarte el enfoque más compatible con tu situación. Evita el ensayo y error de probar técnicas al azar y orienta hacia métodos con mayor probabilidad de adherencia a largo plazo según tu perfil personal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre mindfulness y meditación para el estrés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La meditación es una práctica formal con sesiones dedicadas (normalmente 10-20 min) enfocadas en concentración o visualización. El mindfulness o atención plena es un estado que puede integrarse en actividades cotidianas como comer, caminar o trabajar. Ambas comparten base neurocientífica y reducen el cortisol, pero el mindfulness es más accesible para personas con agendas apretadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es necesario buscar ayuda profesional para el estrés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conviene consultar a un profesional de la salud mental cuando el estrés persiste más de 2-4 semanas, interfiere con el trabajo o las relaciones, provoca síntomas físicos recurrentes (insomnio, dolores, digestivos) o se acompaña de ansiedad intensa o tristeza. La terapia cognitivo-conductual cuenta con amplia evidencia para el estrés crónico.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Hábitos Saludables - Evalúa tu Bienestar | meskeIA',
  description: 'Evalúa tus hábitos de vida con nuestro test gratuito. Analiza hidratación, alimentación, actividad física, descanso y más. Obtén un perfil visual de tu bienestar.',
  keywords: 'test hábitos saludables, evaluación bienestar, hábitos de vida, salud, hidratación, sueño, alimentación, actividad física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Hábitos Saludables - meskeIA',
    description: 'Evalúa tus hábitos de vida y obtén un perfil visual de tu bienestar.',
    url: 'https://meskeia.com/test-habitos-saludables/',
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
    title: 'Test de Hábitos Saludables - meskeIA',
    description: 'Evalúa tus hábitos de vida y mejora tu bienestar.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Hábitos Saludables",
  description: "Evalúa tus hábitos de vida con nuestro test gratuito. Analiza hidratación, alimentación, actividad física, descanso y más. Obtén un perfil visual de tu bienestar.",
  url: "https://meskeia.com/test-habitos-saludables/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué mide un test de hábitos saludables?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un test de hábitos saludables evalúa las principales áreas del estilo de vida que influyen en el bienestar: hidratación diaria, calidad y variedad de la alimentación, frecuencia de actividad física, horas y calidad del sueño, gestión del estrés y hábitos sedentarios. El resultado es un perfil de bienestar que muestra en qué áreas estás bien y en cuáles hay margen de mejora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta agua hay que beber al día para estar bien hidratado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las recomendaciones generales hablan de unos 1,5 a 2 litros de agua al día para un adulto en condiciones normales, aunque la cantidad varía según el peso corporal, la actividad física, el clima y la dieta. El color de la orina es un indicador práctico: debe ser amarillo claro. La sensación de sed ya indica que hay cierto grado de deshidratación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos días a la semana se recomienda hacer ejercicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Organización Mundial de la Salud (OMS) recomienda a los adultos al menos 150 minutos semanales de actividad moderada (caminar rápido, natación suave) o 75 minutos de actividad intensa (correr, ciclismo). Distribuirlos en 3-5 días es más beneficioso que concentrarlos en uno o dos días. Añadir ejercicios de fuerza muscular al menos 2 días por semana también es recomendable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas de sueño son suficientes para un adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de los adultos necesitan entre 7 y 9 horas de sueño por noche según las recomendaciones de la National Sleep Foundation. Dormir de forma consistente en ese rango se asocia con mejor memoria, regulación del estado de ánimo, control del peso y salud cardiovascular. Las necesidades individuales varían: algunas personas se recuperan bien con 7 horas y otras necesitan 9.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Un test de hábitos saludables sustituye a una consulta médica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Este tipo de test es una herramienta de autoconocimiento y reflexión personal, no un diagnóstico médico. Permite identificar áreas de mejora en el estilo de vida, pero si tienes síntomas, enfermedades crónicas o dudas específicas sobre tu salud, debes consultar a un médico o profesional sanitario. Los resultados del test tienen carácter orientativo.',
      },
    },
  ],
};

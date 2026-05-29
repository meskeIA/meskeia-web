import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ciclos de Sueño - Hora Óptima para Dormir | meskeIA',
  description: 'Calcula la hora ideal para dormir o despertar según los ciclos de sueño de 90 minutos. Despierta descansado respetando las fases REM.',
  keywords: 'calculadora sueño, ciclos sueño, hora dormir, despertar descansado, fase rem, 90 minutos, insomnio, descanso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ciclos de Sueño',
    description: 'Calcula la hora ideal para dormir o despertar según los ciclos de sueño de 90 minutos.',
    url: 'https://meskeia.com/calculadora-sueno/',
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
    title: 'Calculadora de Ciclos de Sueño',
    description: 'Calcula la hora ideal para dormir o despertar.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Sueño",
  description: "Calcula la hora ideal para dormir o despertar según los ciclos de sueño de 90 minutos. Despierta descansado respetando las fases REM.",
  url: "https://meskeia.com/calculadora-sueno/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dura un ciclo de sueño y cuántos necesito por noche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un ciclo de sueño completo dura aproximadamente 90 minutos e incluye fases de sueño ligero, profundo y REM. Los adultos necesitan entre 4 y 6 ciclos por noche, lo que equivale a 6, 7,5 o 9 horas de sueño. Despertar al final de un ciclo (en lugar de en medio) reduce la inercia del sueño y hace que te sientas más despejado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la fase REM y por qué es importante dormir bien para tenerla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fase REM (movimiento ocular rápido) ocurre principalmente en la segunda mitad de la noche y es clave para la consolidación de la memoria, el procesamiento emocional y la creatividad. Interrumpir el sueño con alarmas en plena fase REM causa desorientación y cansancio. Dormir ciclos completos maximiza el tiempo en esta fase.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas de sueño necesita un adulto por noche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de adultos necesitan entre 7 y 9 horas, según las recomendaciones de la National Sleep Foundation. Dormir menos de 6 horas de forma crónica se asocia con mayor riesgo de enfermedades cardiovasculares, deterioro cognitivo y menor rendimiento físico. Las necesidades individuales varían: algunas personas funcionan bien con 7 horas y otras necesitan 9.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué hora me tengo que ir a dormir si quiero despertar a las 7:00 sintiéndome descansado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si tardas unos 15 minutos en conciliar el sueño y quieres despertar a las 7:00, los horarios óptimos para acostarte son a las 23:45 (5 ciclos, 7,5 h), a las 22:15 (6 ciclos, 9 h) o a las 01:15 (4 ciclos, 6 h). Una calculadora de ciclos de sueño calcula automáticamente estas horas sumando múltiplos de 90 minutos al tiempo estimado de conciliación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una calculadora de sueño y una app de seguimiento de sueño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una calculadora de sueño planifica a priori la hora de acostarse o despertarse basándose en los ciclos de 90 minutos; es útil para decidir cuándo ir a la cama. Una app de seguimiento (como Sleep Cycle o Fitbit) monitoriza el sueño real durante la noche mediante el micrófono o el acelerómetro del teléfono, y puede intentar despertarte en una fase ligera. Ambas herramientas son complementarias.',
      },
    },
  ],
};

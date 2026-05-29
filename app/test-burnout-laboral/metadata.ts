import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Burnout Laboral — Evalúa tu Agotamiento Profesional | meskeIA',
  description: 'Evalúa tu nivel de burnout laboral con 15 preguntas en 3 dimensiones: agotamiento emocional, cinismo y realización personal. Resultados orientativos. Sin registro. 100% privado.',
  keywords: 'test burnout laboral, síndrome burnout, agotamiento profesional, test estrés laboral, evaluación burnout, cinismo laboral, realización personal trabajo, desgaste laboral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Burnout Laboral | meskeIA',
    description: 'Evalúa tu nivel de burnout laboral con 15 preguntas. Resultados por dimensión: agotamiento emocional, cinismo y realización personal.',
    url: 'https://meskeia.com/test-burnout-laboral/',
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
    title: 'Test de Burnout Laboral | meskeIA',
    description: 'Test orientativo de burnout: 15 preguntas, 3 dimensiones. Totalmente gratuito y privado.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Burnout Laboral",
  description: "Evalúa tu nivel de burnout laboral con 15 preguntas en 3 dimensiones: agotamiento emocional, cinismo y realización personal. Resultados orientativos. Sin registro. 100% privado.",
  url: "https://meskeia.com/test-burnout-laboral/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el burnout laboral y cómo se diferencia del estrés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El burnout (síndrome de desgaste profesional) es un estado de agotamiento crónico causado por una exposición prolongada a situaciones de trabajo exigentes. A diferencia del estrés puntual, el burnout se caracteriza por tres dimensiones persistentes: agotamiento emocional, actitud de cinismo o distancia hacia el trabajo y sensación de baja realización personal. La OMS lo reconoce como fenómeno ocupacional desde 2019.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona este test de burnout?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 15 preguntas distribuidas en tres dimensiones: agotamiento emocional (5 ítems), cinismo o despersonalización (5 ítems) y realización personal (5 ítems). Cada respuesta se puntúa en una escala de frecuencia. Al finalizar obtienes una puntuación por dimensión con interpretación orientativa y sugerencias de actuación según tu nivel de riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está indicado este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona en activo que sienta signos de desgaste profesional: trabajadores por cuenta ajena, autónomos, docentes, personal sanitario o cuidadores. También puede usarlo quien quiera hacer un seguimiento preventivo de su bienestar laboral. Los resultados son orientativos y no sustituyen la evaluación de un profesional de salud mental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los datos del test se guardan o envían a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El test se ejecuta completamente en tu navegador; ninguna respuesta ni resultado se transmite a ningún servidor ni se almacena. No es necesario crear una cuenta ni proporcionar email. Una vez que cierras la página los datos desaparecen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué debo hacer si el test indica un nivel alto de burnout?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un resultado elevado es una señal de alerta, no un diagnóstico clínico. Se recomienda comentarlo con el médico de cabecera o un psicólogo laboral, revisar las condiciones de trabajo (carga, autonomía, reconocimiento) y valorar medidas de conciliación o cambios organizativos. En muchos países existen servicios de prevención de riesgos laborales que pueden orientarte de forma gratuita.',
      },
    },
  ],
};

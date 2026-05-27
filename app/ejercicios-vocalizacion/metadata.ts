import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Ejercicios de Vocalización para Parkinson - Logopedia en Casa | meskeIA',
  description: 'Ejercicios guiados de vocalización para personas con enfermedad de Parkinson. Práctica de vocales sostenidas, frases y volumen de voz con medidor visual en tiempo real. Sin datos enviados a servidores.',
  keywords: 'ejercicios vocalizacion parkinson, logopedia parkinson, voz parkinson, LSVT, hipofonia, rehabilitacion voz, ejercicios habla, vocalizar parkinson, terapia voz, voz debil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ejercicios de Vocalización para Parkinson | meskeIA',
    description: 'Práctica guiada de vocalización para Parkinson con medidor visual de volumen en tiempo real. Vocales sostenidas, lectura en voz alta y registro de sesiones.',
    url: 'https://meskeia.com/ejercicios-vocalizacion/',
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
    title: 'Ejercicios de Vocalización para Parkinson | meskeIA',
    description: 'Ejercicios de logopedia para Parkinson con medidor de voz en tiempo real. Privacidad total: el audio nunca sale de tu dispositivo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ejercicios de Vocalización para Parkinson - Logopedia en Casa",
  description: "Ejercicios guiados de vocalización para personas con enfermedad de Parkinson. Práctica de vocales sostenidas, frases y volumen de voz con medidor visual en tiempo real. Sin datos enviados a servidores.",
  url: 'https://meskeia.com/ejercicios-vocalizacion/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué el Parkinson afecta a la voz y el habla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La enfermedad de Parkinson afecta a los ganglios basales, que regulan el movimiento. Como los músculos fonatorios (laringe, diafragma, labios, lengua) también son músculos, el Parkinson los afecta causando hipofonía (voz débil y apagada), disartria hipocinética (articulación imprecisa, ritmo monótono), monotonía tonal y dificultad para iniciar el habla. Entre el 70-90% de las personas con Parkinson desarrollan alguna alteración del habla a lo largo de la enfermedad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el método LSVT LOUD para la voz en Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LSVT LOUD (Lee Silverman Voice Treatment) es el tratamiento logopédico más avalado científicamente para la disartria en Parkinson. Se basa en el entrenamiento intensivo de la voz fuerte: el paciente practica emitir sonidos y hablar a mayor volumen del habitual, recalibrando su percepción de "voz normal". El protocolo estándar es 4 sesiones semanales durante 4 semanas con logopeda. Los ejercicios de vocalización de meskeIA están inspirados en los principios de esfuerzo vocal del LSVT, aunque no lo sustituyen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia debo practicar los ejercicios de vocalización?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estudios sobre rehabilitación del habla en Parkinson muestran mejores resultados con práctica frecuente. Se recomienda practicar diariamente, idealmente en sesiones de 15-30 minutos. La constancia es más importante que la duración: 15 minutos cada día superan en resultados a 1 hora una vez por semana. Los ejercicios deben complementar, nunca sustituir, el trabajo con un logopeda especializado. Llevar un diario de sesiones ayuda a mantener la motivación y detectar progresos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son útiles los ejercicios de vocalización para otras condiciones además del Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los ejercicios de vocalización son beneficiosos para: otras enfermedades neurológicas con afectación del habla (ELA, esclerosis múltiple, ataxia cerebelosa); personas con disfonía funcional (voz apagada sin causa orgánica); personas que trabajan mucho con la voz (profesores, cantantes) para prevencion de nódulos; adultos mayores con voz debilitada por envejecimiento laríngeo; y personas con dificultades de articulación por otras causas. Siempre es recomendable una valoración logopédica previa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ejercicios de vocalización son más eficaces para el Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ejercicios más respaldados por evidencia son: vocales sostenidas en máxima intensidad ("aaaaa" durante 5-10 segundos); glissandos (subir y bajar el tono continuamente); lectura en voz alta exagerando la articulación; conteo enfático (1, 2, 3... con énfasis en cada número); y frases funcionales practicadas en voz alta y clara. El medidor visual de volumen que incorpora la app permite ver en tiempo real si la voz alcanza la intensidad objetivo, lo que mejora significativamente el entrenamiento.',
      },
    },
  ],
};

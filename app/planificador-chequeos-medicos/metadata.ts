import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Chequeos Médicos Preventivos - Qué Revisiones Hacerte según tu Edad | meskeIA',
  description: 'Descubre qué revisiones médicas preventivas te corresponden según tu edad y sexo. Basado en las recomendaciones del Ministerio de Sanidad y la SEMFyC.',
  keywords: 'chequeos medicos, revisiones preventivas, salud preventiva, analítica sangre, mamografía, citología, colonoscopia, revisión médica, calendario chequeos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Chequeos Médicos Preventivos según Edad | meskeIA',
    description: 'Filtra por edad y sexo y consulta qué revisiones médicas preventivas te recomiendan las guías clínicas españolas.',
    url: 'https://meskeia.com/planificador-chequeos-medicos/',
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
    title: 'Chequeos Médicos Preventivos según Edad | meskeIA',
    description: 'Consulta qué revisiones preventivas te corresponden según tu edad y sexo. Guías clínicas españolas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Chequeos Médicos Preventivos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Chequeos Médicos Preventivos",
  description: "Descubre qué revisiones médicas preventivas te corresponden según tu edad y sexo. Basado en las recomendaciones del Ministerio de Sanidad y la SEMFyC.",
  url: "https://meskeia.com/planificador-chequeos-medicos/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué revisiones médicas preventivas debo hacerme según mi edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las revisiones varían según la edad y el sexo. A partir de los 40 años se recomienda medir colesterol y glucosa cada 4-5 años; la colonoscopia de cribado comienza a los 50-55 años. Las mujeres deben iniciar la mamografía entre los 45 y 50 años dependiendo de la comunidad autónoma, y la citología cervical desde los 25 años cada 3-5 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia hay que hacerse una analítica de sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La SEMFyC recomienda una analítica básica (glucosa, colesterol, función renal) cada 2-3 años en adultos sanos menores de 50 años, y anualmente a partir de los 50 años o antes si existen factores de riesgo como hipertensión, diabetes o antecedentes familiares cardiovasculares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La seguridad social cubre todos los chequeos preventivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sistema Nacional de Salud cubre los programas de cribado oficiales: mamografía, citología cervical, sangre oculta en heces (cáncer colorrectal) y detección de retinopatía diabética, entre otros. La cobertura exacta y la edad de inicio pueden variar según la comunidad autónoma. Las revisiones preventivas adicionales fuera de protocolo pueden no estar incluidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un chequeo preventivo si no tengo síntomas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La medicina preventiva permite detectar enfermedades en fases iniciales, cuando el tratamiento es más eficaz y menos invasivo. Condiciones como la hipertensión, la diabetes tipo 2, el colesterol elevado o algunos cánceres pueden no dar síntomas durante años. El cribado periódico reduce la mortalidad y mejora el pronóstico a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué edad debo preocuparme por los chequeos médicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nunca es demasiado pronto para establecer hábitos preventivos, pero las revisiones más relevantes empiezan entre los 20 y 30 años (citología, tensión arterial, peso/IMC). Entre los 40 y 50 años se añaden colesterol, glucosa y cribados de cáncer. A partir de los 65 años las revisiones son más frecuentes e incluyen osteoporosis, deterioro cognitivo y función auditiva y visual.',
      },
    },
  ],
};

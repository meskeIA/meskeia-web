import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Turnos de Cuidadores - Organizar Cuidado Familiar | meskeIA',
  description: 'Organiza los turnos de cuidado entre familiares. Calendario semanal visual con reparto equitativo de horas de cuidado para personas dependientes.',
  keywords: 'turnos cuidadores, planificador cuidado familiar, organizar cuidadores, calendario cuidadores dependencia, reparto cuidado familiar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Turnos de Cuidadores | meskeIA',
    description: 'Organiza los turnos de cuidado entre familiares con un calendario semanal visual.',
    url: 'https://meskeia.com/planificador-turnos-cuidadores/',
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
    title: 'Planificador de Turnos de Cuidadores | meskeIA',
    description: 'Calendario visual para organizar turnos de cuidado familiar',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Planificador Turnos Cuidadores meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Turnos de Cuidadores',
  description: 'Herramienta visual para organizar los turnos de cuidado entre familiares. Calendario semanal con reparto equitativo de horas y alertas de desbalance.',
  url: 'https://meskeia.com/planificador-turnos-cuidadores/',
  features: [
    'Calendario semanal visual de turnos',
    'Reparto de horas entre cuidadores',
    'Alertas de desbalance en la carga',
    'Turnos de mañana, tarde y noche',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se organiza el reparto de turnos entre varios cuidadores familiares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reparto de turnos se organiza asignando franjas horarias (mañana, tarde y noche) a cada cuidador en un calendario semanal. Lo más habitual es combinar disponibilidad laboral y personal de cada familiar para cubrir las necesidades de la persona dependiente. Una buena planificación evita la acumulación de carga en un solo cuidador y reduce el riesgo de agotamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas al día necesita una persona con dependencia Grado III?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una persona con dependencia Grado III (gran dependencia) puede requerir apoyo continuo o casi continuo a lo largo del día, lo que puede suponer entre 8 y 24 horas de atención diaria dependiendo de la situación. La distribución exacta depende de las necesidades concretas: aseo, alimentación, movilidad, medicación y supervisión nocturna. Es habitual que el cuidado compartido entre varios familiares sea la única opción sostenible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el síndrome del cuidador quemado y cómo se previene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El síndrome del cuidador quemado (burnout del cuidador) es un estado de agotamiento físico, emocional y mental causado por la atención prolongada e intensa de una persona dependiente sin descansos suficientes. Se previene repartiendo la carga entre varios cuidadores, solicitando servicios de respiro del SAAD, manteniendo tiempo personal y apoyándose en asociaciones de familiares o grupos de ayuda mutua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué servicios de respiro existen para familias cuidadoras en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SAAD ofrece centros de día y de noche que liberan al cuidador principal durante esas horas, y estancias temporales en residencias para cubrir vacaciones o bajas del cuidador. Muchas comunidades autónomas cuentan además con programas específicos de respiro familiar, teleasistencia nocturna y servicios de ayuda a domicilio que complementan el cuidado familiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene derecho un familiar cuidador a cotizar a la Seguridad Social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los cuidadores no profesionales que cuidan a un familiar con reconocimiento de dependencia pueden ser dados de alta en la Seguridad Social por el convenio especial de cuidadores no profesionales, cuya cotización corre a cargo del Estado desde 2024 sin coste para la familia. Este convenio genera derechos de jubilación, incapacidad y desempleo, lo que supone una protección social importante para quien deja de trabajar para cuidar.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Time Tracker - Registro de Horas por Proyecto | meskeIA',
  description: 'Registra y gestiona el tiempo dedicado a cada proyecto y cliente. Informes, tarifas por hora y exportación. Ideal para freelancers y autónomos.',
  keywords: 'time tracker, registro horas, proyecto, cliente, freelance, autonomo, facturacion, tiempo, productividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Time Tracker - meskeIA',
    description: 'Controla el tiempo por proyecto y cliente. Perfecto para freelancers',
    url: 'https://meskeia.com/time-tracker/',
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
    title: 'Time Tracker - meskeIA',
    description: 'Registro de horas por proyecto para freelancers y autónomos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Time Tracker meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Time Tracker",
  description: "Registra y gestiona el tiempo dedicado a cada proyecto y cliente. Informes, tarifas por hora y exportación. Ideal para freelancers y autónomos.",
  url: "https://meskeia.com/time-tracker/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve un time tracker o registro de horas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un time tracker permite registrar cuánto tiempo dedicas a cada proyecto, tarea o cliente. Es útil para facturar con precisión, detectar dónde se consume más tiempo, justificar honorarios ante clientes y mejorar la planificación de proyectos futuros. Especialmente valioso para trabajadores por cuenta propia y consultores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo registro las horas de un proyecto con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Crea un proyecto o cliente, inicia el temporizador cuando empieces a trabajar y detente al terminar. Cada entrada queda registrada con la duración exacta. También puedes añadir entradas manualmente si olvidaste iniciar el cronómetro. Todos los registros se agrupan por proyecto para facilitar la facturación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo establecer tarifas por hora y calcular el importe facturable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Puedes asignar una tarifa horaria a cada proyecto o cliente. La herramienta calcula automáticamente el importe acumulado en función del tiempo registrado, lo que te permite ver de un vistazo cuánto has generado en un período dado sin necesidad de hacer cálculos manuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este time tracker de Toggl o Clockify?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de Toggl o Clockify, esta herramienta funciona completamente en el navegador sin crear cuenta ni instalar extensiones. Es adecuada para quienes necesitan un registro rápido y privado sin depender de servicios externos. Las plataformas mencionadas ofrecen integraciones de equipo y reportes más avanzados para entornos colaborativos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo exportar los datos para incluirlos en una factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Puedes exportar el informe de horas en formato CSV, que se puede abrir en Excel o cualquier hoja de cálculo para elaborar facturas o resúmenes de actividad. Los datos incluyen proyecto, cliente, duración y, si configuraste tarifa, el importe calculado.',
      },
    },
  ],
};

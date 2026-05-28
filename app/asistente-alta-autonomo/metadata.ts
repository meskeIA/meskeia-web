import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asistente Alta Autónomo - Guía Paso a Paso para Darse de Alta | meskeIA',
  description: 'Guía completa para darte de alta como autónomo en España. Checklist interactivo con todos los trámites: Hacienda, Seguridad Social, IAE, licencias. Calculadora de cuota y costes.',
  keywords: 'alta autónomo, darse de alta autónomo, modelo 036, modelo 037, RETA, cuota autónomo, tarifa plana, IAE, epígrafe, Seguridad Social, Hacienda, emprender, freelance, España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente Alta Autónomo - meskeIA',
    description: 'Darte de alta como autónomo paso a paso. Checklist, calculadora de cuota y todos los trámites necesarios.',
    url: 'https://meskeia.com/asistente-alta-autonomo/',
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
    title: 'Asistente Alta Autónomo - meskeIA',
    description: 'Guía completa para darte de alta como autónomo en España con checklist y calculadora.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Asistente Alta Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Asistente Alta Autónomo",
  description: "Guía completa para darte de alta como autónomo en España. Checklist interactivo con todos los trámites: Hacienda, Seguridad Social, IAE, licencias. Calculadora de cuota y costes.",
  url: "https://meskeia.com/asistente-alta-autonomo/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo darse de alta como autónomo paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso tiene tres pasos principales: primero dar de alta la actividad en Hacienda mediante el modelo 036 o 037 (trámite gratuito online en la Sede Electrónica de la AEAT); segundo, inscribirse en el Régimen Especial de Trabajadores Autónomos (RETA) en la Seguridad Social dentro de los 30 días hábiles siguientes al inicio de actividad; y tercero, obtener las licencias municipales o sectoriales si la actividad las requiere. El orden correcto es primero Hacienda, luego Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga de cuota de autónomo en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde 2023 la cuota de autónomos depende de los ingresos reales netos. En 2025 hay 15 tramos: el mínimo es de 200 € al mes para ingresos netos inferiores a 670 €/mes, y el máximo supera los 590 € para ingresos por encima de 6.000 €/mes. La cuota base elegida determina también la prestación por incapacidad y la futura pensión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe una tarifa plana para nuevos autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los nuevos autónomos que se den de alta por primera vez (o tras 2 años sin estarlo) tienen derecho a la cuota reducida de 80 €/mes durante los primeros 12 meses, prorrogable otros 12 meses si los ingresos netos no superan el Salario Mínimo Interprofesional. Esta bonificación se solicita automáticamente al tramitar el alta en la Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el IAE y cuándo hay que darse de alta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto sobre Actividades Económicas (IAE) es el censo de actividades económicas gestionado por Hacienda. Darse de alta en el IAE equivale a declarar qué actividad se va a ejercer y en qué epígrafe. Esta gestión se realiza simultáneamente con el modelo 036/037 y es obligatoria antes de iniciar la actividad. La mayoría de autónomos con facturación inferior a 1 millón de euros anuales están exentos del pago del impuesto, aunque sí deben figurar en el censo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el modelo 036 y el modelo 037?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 037 es una versión simplificada del 036 para autónomos persona física con actividad sencilla: un solo domicilio fiscal, sin representante, sin régimen especial de IVA y sin retenciones a terceros. El modelo 036 es más completo y es obligatorio para sociedades, personas con varios establecimientos, operaciones intracomunitarias o cuando se requiere ISOC. Si tienes dudas, el 037 cubre la mayoría de altas de autónomos individuales.',
      },
    },
  ],
};

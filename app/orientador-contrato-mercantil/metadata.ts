import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Contrato Mercantil - Qué Contrato Necesito | meskeIA',
  description:
    'Descubre qué tipo de contrato mercantil necesitas en España: servicios, arrendamiento de obra, agencia, NDA, distribución o colaboración. Cláusulas esenciales y errores a evitar.',
  keywords:
    'contratos mercantiles, contrato de servicios, NDA confidencialidad, arrendamiento de obra, contrato de agencia, qué contrato necesito, cláusulas esenciales contrato, contratos entre empresas España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Contrato Mercantil | meskeIA',
    description:
      'Identifica qué tipo de contrato mercantil necesitas según tu situación y conoce las cláusulas esenciales para protegerte.',
    url: 'https://meskeia.com/orientador-contrato-mercantil/',
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
    title: 'Orientador de Contrato Mercantil | meskeIA',
    description:
      'Descubre qué contrato mercantil necesitas: servicios, obra, agencia, NDA, distribución o colaboración.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Contrato Mercantil meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Contrato Mercantil',
  description:
    'Herramienta interactiva para identificar el tipo de contrato mercantil más adecuado según tu situación: servicios, arrendamiento de obra, compraventa, agencia, NDA, distribución o colaboración. Incluye cláusulas esenciales, tabla comparativa y guía paso a paso.',
  url: 'https://meskeia.com/orientador-contrato-mercantil/',
  features: [
    'Selector interactivo por situación (3-4 preguntas)',
    'Recomendación del tipo de contrato más adecuado',
    'Cláusulas esenciales para cada tipo de contrato',
    'Tabla comparativa de los 7 tipos de contrato mercantil',
    'Errores frecuentes a evitar en contratos mercantiles',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un contrato de servicios y un arrendamiento de obra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el contrato de servicios el profesional se compromete a prestar una actividad con diligencia, sin garantizar un resultado concreto. En el arrendamiento de obra el contratista se obliga a entregar un resultado determinado (una web funcional, un informe terminado, una instalación completada). Si el cliente paga por el trabajo realizado y no por un entregable específico, normalmente se trata de un contrato de servicios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es obligatorio firmar un NDA o contrato de confidencialidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una obligación legal general de firmar un NDA, pero es muy recomendable cuando se comparte información sensible antes de iniciar una relación comercial: datos de clientes, fórmulas, estrategias de negocio o proyectos en desarrollo. Sin NDA, la información revelada puede no tener protección suficiente ante los tribunales, salvo que exista un secreto industrial reconocido por la Ley 1/2019.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cláusulas no pueden faltar en un contrato mercantil entre empresas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cláusulas esenciales son: objeto del contrato (qué se entrega o presta), precio y forma de pago, duración y causas de resolución, responsabilidad por incumplimiento y limitación de daños, confidencialidad si se intercambia información sensible, y jurisdicción aplicable. En contratos internacionales hay que añadir la ley aplicable y el foro de resolución de conflictos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un contrato de agencia y en qué se diferencia de un contrato de distribución?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agente actúa en nombre del empresario principal para captar clientes o cerrar contratos, y cobra una comisión sin asumir el riesgo de la operación; su relación se regula por la Ley 12/1992. El distribuidor, en cambio, compra los productos al fabricante y los revende por cuenta propia, asumiendo el riesgo de stock y precios. La principal diferencia práctica es quién soporta el riesgo comercial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Un contrato verbal entre empresas tiene validez legal en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general sí: el Código de Comercio admite los contratos verbales entre empresarios siempre que haya acuerdo sobre los elementos esenciales (objeto y precio). El problema es probatorio: sin documento escrito, correos electrónicos o facturas aceptadas, es muy difícil acreditar las condiciones pactadas en caso de disputa. Para cualquier acuerdo que supere unas pocas semanas o implique importes relevantes, se recomienda siempre la forma escrita.',
      },
    },
  ],
};

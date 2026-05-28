import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientación para Tramitar una Herencia - Checklist y Plazos | meskeIA',
  description: 'Asistente interactivo para gestionar una herencia en España: checklist personalizado de documentos, orden de gestiones paso a paso, plazos críticos y costes orientativos.',
  keywords: 'tramitar herencia España, checklist herencia, documentos herencia, plazos impuesto sucesiones, gestión herencia paso a paso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientación para Tramitar una Herencia | meskeIA',
    description: 'Checklist interactivo de documentos, timeline de gestiones y plazos críticos para tramitar una herencia en España.',
    url: 'https://meskeia.com/orientacion-tramitacion-herencias/',
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
    title: 'Orientación para Tramitar una Herencia | meskeIA',
    description: 'Checklist personalizado, orden de gestiones y plazos para tramitar una herencia en España.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientación para Tramitar una Herencia",
  description: "Asistente interactivo para gestionar una herencia en España: checklist personalizado de documentos, orden de gestiones paso a paso, plazos críticos y costes orientativos.",
  url: "https://meskeia.com/orientacion-tramitacion-herencias/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué plazo hay para tramitar una herencia en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo más crítico es el del Impuesto de Sucesiones: 6 meses desde la fecha del fallecimiento. Se puede solicitar una prórroga de otros 6 meses antes de que venza el plazo inicial, aunque con intereses de demora. Para la aceptación de la herencia no existe un plazo legal obligatorio, pero conviene actuar en ese período para evitar problemas con los bienes y las deudas del fallecido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué documentos hacen falta para tramitar una herencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los documentos básicos son: certificado de defunción, certificado de últimas voluntades y, si hay testamento, copia autorizada del mismo. Si no hay testamento, se necesita la declaración de herederos ante notario. Además, los herederos deben aportar su DNI y el libro de familia. Para cada bien heredado se necesitan documentos específicos: escrituras de inmuebles, certificados bancarios, títulos de vehículos, contratos de seguros de vida, etc.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta tramitar una herencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los costes dependen del valor del caudal hereditario y de la comunidad autónoma. Los principales gastos son: el Impuesto de Sucesiones (varía mucho entre CCAA, con bonificaciones del 99% en algunas para cónyuge e hijos), honorarios notariales (escritura de aceptación: aproximadamente 0,1-0,3% del valor de los bienes, con mínimos de 200-400 €), inscripción en el Registro de la Propiedad para inmuebles, y gestión de plusvalía municipal. A eso se suman los honorarios de gestoría o abogado si se contratan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si no hay testamento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sin testamento, la herencia se distribuye según las reglas de la sucesión intestada del Código Civil (o del derecho foral de la comunidad autónoma). En este caso es obligatorio realizar una declaración de herederos ante notario, que establece quiénes son los herederos legales por ley. El proceso es algo más largo y costoso que con testamento, pero garantiza la misma seguridad jurídica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pueden heredar también las deudas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Al aceptar una herencia pura y simplemente se heredan tanto los bienes como las deudas del fallecido. Para evitar responder con el patrimonio propio, los herederos pueden aceptar la herencia a beneficio de inventario, lo que limita la responsabilidad al valor de los bienes heredados. También se puede renunciar completamente a la herencia. Antes de decidir conviene obtener una lista completa de los bienes y deudas del fallecido.',
      },
    },
  ],
};

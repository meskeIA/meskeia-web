import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de Prestaciones por Dependencia - SAAD España | meskeIA',
  description: 'Estima las prestaciones y servicios del SAAD según el grado de dependencia reconocido. Cuantías máximas 2025, servicios disponibles y copago orientativo.',
  keywords: 'prestaciones dependencia, SAAD España, PECEF, PEVS, ayuda domicilio dependencia, grado dependencia prestaciones, copago dependencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Prestaciones por Dependencia | meskeIA',
    description: 'Conoce las prestaciones del SAAD según tu grado de dependencia: cuantías, servicios y copago orientativo.',
    url: 'https://meskeia.com/estimacion-prestaciones-dependencia/',
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
    title: 'Estimación de Prestaciones por Dependencia | meskeIA',
    description: 'Prestaciones SAAD por grado de dependencia: cuantías máximas y servicios disponibles',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimación Prestaciones Dependencia meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Prestaciones por Dependencia',
  description: 'Herramienta orientativa para estimar las prestaciones económicas y servicios del SAAD según el grado de dependencia reconocido en España. Incluye cuantías máximas 2025 y servicios del catálogo.',
  url: 'https://meskeia.com/estimacion-prestaciones-dependencia/',
  features: [
    'Prestaciones económicas por grado (PEVS, PECEF, PAP)',
    'Catálogo de servicios SAAD disponibles',
    'Cuantías máximas 2025 orientativas',
    'Información sobre copago y capacidad económica',
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
      name: '¿Qué prestaciones económicas existen para personas con dependencia en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SAAD reconoce varias prestaciones económicas según el grado: la Prestación Económica para Cuidados en el Entorno Familiar (PECEF) para quienes son atendidos por un familiar, la Prestación Económica de Asistencia Personal (PEAP) para contratar un asistente, y la Prestación Económica Vinculada al Servicio (PEVS) cuando no es posible acceder a un servicio público. Las cuantías máximas en 2025 oscilan entre 153 € y 747 € mensuales según grado y prestación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cobra una persona con dependencia Grado III al mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con Grado III (gran dependencia), la prestación económica máxima para cuidados en el entorno familiar (PECEF) es de 747 € mensuales en 2025. Sin embargo, la cuantía definitiva depende de la capacidad económica de la persona, ya que el sistema aplica un copago: a mayor renta y patrimonio, menor es la prestación reconocida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué servicios incluye el catálogo del SAAD además de las prestaciones económicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El catálogo del SAAD incluye servicios como la teleasistencia, la ayuda a domicilio (apoyo en actividades del hogar y cuidados personales), los centros de día y de noche, la atención residencial en centros para personas mayores o con discapacidad, y la prevención de situaciones de dependencia. Los servicios tienen prioridad sobre las prestaciones económicas según la ley.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el copago en dependencia y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El copago es la participación económica de la persona beneficiaria en el coste del servicio o prestación. Se calcula en función de la capacidad económica del usuario (renta anual y patrimonio), el grado de dependencia y el tipo de servicio o prestación. A mayor capacidad económica, mayor copago. Ningún usuario puede pagar más del coste real del servicio ni quedarse sin el mínimo vital.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en resolverse el expediente de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley establece un plazo máximo de seis meses desde la presentación de la solicitud para dictar la resolución de reconocimiento del grado. Sin embargo, en la práctica los plazos suelen ser más largos en muchas comunidades autónomas. Una vez reconocido el grado, la comunidad autónoma debe elaborar el Programa Individual de Atención (PIA) que concreta la prestación o servicio asignado.',
      },
    },
  ],
};

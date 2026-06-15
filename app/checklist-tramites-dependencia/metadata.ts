import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Trámites de Dependencia - Documentación y Pasos | meskeIA',
  description: 'Lista de comprobación interactiva para solicitar la valoración de dependencia en España. Documentos necesarios, pasos del proceso y plazos orientativos.',
  keywords: 'tramites dependencia, documentacion dependencia, solicitar dependencia España, pasos valoracion dependencia, checklist dependencia SAAD',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Trámites de Dependencia | meskeIA',
    description: 'Guía paso a paso con checklist interactivo para solicitar la valoración de dependencia.',
    url: 'https://meskeia.com/checklist-tramites-dependencia/',
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
    title: 'Checklist Trámites de Dependencia | meskeIA',
    description: 'Documentación y pasos para solicitar la dependencia en España',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Checklist Trámites Dependencia meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist Trámites de Dependencia',
  description: 'Lista de comprobación interactiva para gestionar los trámites de solicitud de valoración de dependencia en España. Incluye documentos, pasos y plazos orientativos.',
  url: 'https://meskeia.com/checklist-tramites-dependencia/',
  features: [
    'Checklist interactivo con progreso guardado',
    'Documentación necesaria detallada',
    '6 fases del proceso de valoración',
    'Plazos orientativos por fase',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se solicita la valoración de dependencia en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solicitud se presenta ante los servicios sociales de la comunidad autónoma donde reside la persona. Se puede hacer de forma presencial en la oficina de servicios sociales o, en muchas comunidades, de forma telemática. Hay que aportar el formulario oficial de solicitud, documentación de identidad, informe médico actualizado y, en algunos casos, informes sociales. El plazo máximo de resolución es de 6 meses desde la solicitud.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué documentos se necesitan para pedir la dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los documentos básicos son: DNI o NIE de la persona solicitante y del representante legal si lo hubiera, certificado de empadronamiento, informe de salud con diagnóstico actualizado (idealmente de los últimos 6 meses), y el formulario oficial de solicitud del SAAD. Algunas comunidades autónomas pueden requerir documentación adicional como el certificado de discapacidad o informes de especialistas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en resolverse una solicitud de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo legal máximo es de 6 meses desde la presentación de la solicitud. Sin embargo, en la práctica los tiempos varían mucho según la comunidad autónoma: en algunas la resolución puede llegar en 3-4 meses, mientras que en otras los retrasos superan el año. Si transcurren 6 meses sin resolución, se produce silencio administrativo negativo, que puede recurrirse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el grado de dependencia y el grado de discapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son reconocimientos distintos con finalidades diferentes. El grado de discapacidad (mínimo 33 %) se obtiene a través del IMSERSO o el organismo autonómico y da acceso a beneficios fiscales, laborales y sociales. El grado de dependencia (I, II o III) lo valora el SAAD y determina las prestaciones y servicios de cuidado (ayuda a domicilio, centros de día, residencias). Tener una no implica automáticamente la otra, aunque muchas personas tienen ambas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué prestaciones y servicios da derecho el reconocimiento de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el grado reconocido, las prestaciones pueden incluir: servicio de ayuda a domicilio, teleasistencia, centro de día o noche, atención residencial, prestación económica para cuidados en el entorno familiar (cuando el cuidador es un familiar), y prestación económica vinculada al servicio. El grado III (gran dependencia) tiene acceso prioritario y mayor intensidad de los servicios.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Actas de Reunión - Crea Actas Profesionales | meskeIA',
  description: 'Genera actas de reunión profesionales con plantillas predefinidas. Gestiona asistentes, orden del día, acuerdos y tareas. Exporta a PDF desde el navegador. 100% gratuito.',
  keywords: 'generador actas reunión, actas de reunión, plantilla acta, minuta reunión, acta junta directiva, acta comité, orden del día, acuerdos reunión, tareas reunión, exportar acta pdf',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Actas de Reunión - Profesional y Gratuito | meskeIA',
    description: 'Crea actas de reunión completas con plantillas, gestión de asistentes, orden del día y seguimiento de tareas. Exporta fácilmente a PDF.',
    url: 'https://meskeia.com/generador-actas/',
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
    title: 'Generador de Actas de Reunión | meskeIA',
    description: 'Crea actas profesionales con plantillas predefinidas. Gestiona asistentes, acuerdos y tareas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Actas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Actas de Reunión",
  description: "Genera actas de reunión profesionales con plantillas predefinidas. Gestiona asistentes, orden del día, acuerdos y tareas. Exporta a PDF desde el navegador. 100% gratuito.",
  url: "https://meskeia.com/generador-actas/",
  category: 'UtilityApplication',
  features: [],
});

// La pregunta está también en la FAQ visible («¿Cuál es la diferencia entre un acta y una minuta?»):
// una sola respuesta para las dos (check:faq-unica, C0570, 13/11/2026). Cada una daba un sentido de
// «minuta» (registro interno de trabajo / borrador previo al acta); se juntan los dos.
export const RESPUESTA_FAQ_ACTA_MINUTA =
  'En el uso habitual se emplean a menudo como sinónimos, sobre todo en buena parte de Latinoamérica. En sentido estricto, el acta es el documento formal y definitivo que recoge los acuerdos adoptados y tiene valor probatorio (por ejemplo, en juntas de socios o comunidades de propietarios). La minuta es más informal: un borrador o resumen de lo tratado que se circula para revisión antes de aprobar el acta, o un registro interno orientado al seguimiento de tareas. Los dos recogen los acuerdos y compromisos de la reunión.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué debe incluir un acta de reunión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un acta de reunión debe incluir: fecha, hora y lugar; lista de asistentes (con cargo si aplica); orden del día; resumen de los puntos tratados; acuerdos adoptados con detalle suficiente para que sean ejecutables; tareas asignadas con responsable y plazo; y firma del secretario o moderador. También es habitual incluir los puntos pendientes para la próxima reunión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo redactar un acta de reunión profesional paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso habitual es: 1) Preparar la plantilla antes de la reunión con los datos básicos y el orden del día. 2) Durante la reunión, anotar los puntos discutidos, las decisiones tomadas y las tareas asignadas. 3) Después de la reunión, revisar y completar el borrador, verificando que cada acuerdo tenga un responsable y un plazo. 4) Distribuir el acta a todos los asistentes para su validación o aprobación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipos de reunión sirve un generador de actas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de actas es útil para cualquier tipo de reunión que requiera registro formal: juntas directivas, comités de empresa, reuniones de equipo de proyecto, consejos de administración, asambleas de comunidades de propietarios y reuniones de seguimiento. Las plantillas predefinidas permiten adaptar el formato al tipo de reunión sin empezar desde cero cada vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un acta y una minuta de reunión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_FAQ_ACTA_MINUTA,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo exportar un acta de reunión a PDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más sencilla sin software adicional es usar la función de impresión del navegador (Ctrl+P o Cmd+P) y seleccionar "Guardar como PDF" como destino. Desde ahí se puede ajustar la orientación, los márgenes y si se quieren incluir cabeceras y pies de página del navegador. El resultado es un PDF listo para archivar o enviar por correo a los asistentes.',
      },
    },
  ],
};

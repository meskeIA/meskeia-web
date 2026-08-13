import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Baja Maternal y Paternal - Permiso por Nacimiento Espana | meskeIA',
  description:
    'Calcula la duracion del permiso por nacimiento en Espana: 19 semanas base (32 en monoparentales), semanas obligatorias y voluntarias, ampliaciones por parto multiple, discapacidad u hospitalizacion. Timeline visual.',
  keywords:
    'baja maternidad semanas, permiso paternidad duracion, baja maternal paternal Espana, 19 semanas nacimiento, permiso nacimiento como distribuir, RDL 6/2019, permiso igualitario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Baja Maternal y Paternal | meskeIA',
    description:
      'Calcula la duracion y distribucion del permiso por nacimiento en Espana. 19 semanas por progenitor (32 en monoparentales), semanas obligatorias, voluntarias y ampliaciones.',
    url: 'https://meskeia.com/estimacion-baja-maternal/',
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
    title: 'Estimacion de Baja Maternal y Paternal | meskeIA',
    description:
      'Calcula la duracion y distribucion del permiso por nacimiento en Espana. Timeline visual con semanas obligatorias, voluntarias y extras.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimacion Baja Maternal meskeIA',
  },
};

// Schema.org JSON-LD para indexacion por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Baja Maternal y Paternal',
  description:
    'Herramienta que calcula la duracion del permiso por nacimiento y cuidado del menor en Espana segun el RDL 6/2019. Muestra semanas obligatorias, voluntarias, ampliaciones por parto multiple, discapacidad u hospitalizacion neonatal, y genera un timeline visual personalizado.',
  url: 'https://meskeia.com/estimacion-baja-maternal/',
  features: [
    'Calculo de 19 semanas base por progenitor, y 32 en familias monoparentales',
    'Ampliaciones por parto multiple, discapacidad y hospitalizacion',
    'Timeline visual con fechas clave si se indica la fecha de parto',
    'Diferencia entre semanas obligatorias y voluntarias',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas semanas dura el permiso por nacimiento en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde el 31 de julio de 2025, cada progenitor tiene derecho a 19 semanas de permiso por nacimiento en España, y el progenitor único de una familia monoparental a 32, según el Real Decreto-ley 9/2025. Las 6 primeras son obligatorias e ininterrumpidas a partir del parto; 11 son flexibles hasta que el menor cumpla 12 meses y 2 más son de cuidado prolongado, repartibles hasta los 8 años. Antes de esa fecha eran 16 semanas para ambos progenitores (RDL 6/2019).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pueden ampliar las semanas del permiso de maternidad o paternidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El permiso se amplía en 1 semana por cada hijo adicional a partir del segundo en caso de parto múltiple, en 2 semanas si el recién nacido tiene discapacidad reconocida, y hasta 13 semanas más por hospitalización neonatal o parto prematuro, un día por cada día de ingreso. Estas ampliaciones se suman a las 19 semanas base. Las familias monoparentales no reciben una semana extra: su progenitor único tiene 32 semanas de partida (RDL 9/2025).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre las semanas obligatorias y las voluntarias del permiso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las 6 primeras semanas tras el parto son obligatorias: deben disfrutarse de forma ininterrumpida justo después del nacimiento. Las 10 semanas voluntarias son flexibles: se pueden tomar a jornada completa o parcial, de forma continuada o en periodos separados, y hasta que el bebé cumpla 12 meses, previa comunicación a la empresa con al menos 15 días de antelación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cobra un trabajador durante la baja por nacimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación económica de la Seguridad Social durante el permiso por nacimiento es el 100% de la base reguladora, calculada a partir de las cotizaciones de los últimos meses trabajados. Para acceder a la prestación es necesario tener un mínimo de cotización previo (varía según la edad del solicitante). La prestación la gestiona directamente la Seguridad Social, no la empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede el padre o la madre disfrutar el permiso al mismo tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, ambos progenitores pueden disfrutar su permiso de forma simultánea, salvo las 6 semanas obligatorias que cada uno debe tomar por separado a continuación del parto. Esto significa que en los primeros días tras el nacimiento es posible que los dos estén de permiso al mismo tiempo.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de Deducción IRPF por Discapacidad - Mínimos Personales | meskeIA',
  description: 'Estima el ahorro fiscal en IRPF por mínimos de discapacidad del contribuyente, ascendientes o descendientes. Incluye gastos de asistencia y requisitos 2025.',
  keywords: 'deduccion IRPF discapacidad, minimo discapacidad IRPF, ahorro fiscal discapacidad, IRPF dependencia, minimo ascendiente discapacidad, gastos asistencia IRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Deducción IRPF por Discapacidad | meskeIA',
    description: 'Calcula el ahorro fiscal por los mínimos de discapacidad en la declaración de la renta.',
    url: 'https://meskeia.com/estimacion-deduccion-discapacidad/',
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
    title: 'Estimación de Deducción IRPF por Discapacidad | meskeIA',
    description: 'Ahorro fiscal por discapacidad: mínimos personales y familiares en IRPF',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimación Deducción Discapacidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Deducción IRPF por Discapacidad',
  description: 'Herramienta orientativa para estimar el ahorro fiscal en IRPF por los mínimos de discapacidad. Contribuyente, ascendientes y descendientes con discapacidad reconocida.',
  url: 'https://meskeia.com/estimacion-deduccion-discapacidad/',
  features: [
    'Mínimos por discapacidad del contribuyente',
    'Mínimos por discapacidad de ascendientes y descendientes',
    'Gastos de asistencia adicionales',
    'Estimación del ahorro fiscal según tipo marginal',
    'Datos actualizados IRPF 2025',
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
      name: '¿Qué es el mínimo por discapacidad en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mínimo por discapacidad es una cantidad que se resta de la base imponible del IRPF para reconocer los gastos adicionales que conlleva la discapacidad. En 2025, el mínimo general es de 3.000 € anuales para discapacidades del 33 % al 64 %, y de 9.000 € para discapacidades del 65 % o superior. Si se necesita asistencia de terceras personas, se suma un complemento adicional de 3.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué grado de discapacidad reconocida es necesario para aplicar la deducción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es necesario tener un grado de discapacidad reconocido oficialmente de al menos el 33 %. Este reconocimiento debe constar en resolución del Instituto Nacional de Servicios Sociales (IMSERSO) o del organismo autonómico competente. Las pensiones de incapacidad permanente total, absoluta o gran invalidez de la Seguridad Social también dan derecho al mínimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede aplicar el mínimo por discapacidad de un familiar a cargo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La deducción se puede aplicar también por ascendientes (padres, abuelos) o descendientes (hijos, nietos) con discapacidad reconocida que convivan con el contribuyente y no tengan rentas anuales superiores a 8.000 €. Los importes son los mismos que para el contribuyente: 3.000 € o 9.000 € según el grado, más 3.000 € si necesitan asistencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero me puedo ahorrar en la declaración de la renta por discapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorro real depende del tipo marginal del IRPF que te corresponda. Si tienes discapacidad del 65 % con necesidad de asistencia, el mínimo total es de 12.000 €. Con un tipo marginal del 30 %, el ahorro fiscal sería de 3.600 € aproximadamente. La herramienta calcula este ahorro estimado de forma automática en función de tu situación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son compatibles el mínimo por discapacidad y las prestaciones de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general sí son compatibles. Las prestaciones del Sistema para la Autonomía y Atención a la Dependencia (SAAD) están exentas de IRPF, por lo que no afectan a la aplicación del mínimo por discapacidad. No obstante, conviene revisar cada situación particular con un asesor fiscal, ya que la combinación de prestaciones y circunstancias personales puede variar el resultado.',
      },
    },
  ],
};

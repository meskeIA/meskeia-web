import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Subvenciones Rehabilitación Energética - Next Generation España | meskeIA',
  description: 'Estima qué subvenciones y deducciones IRPF puedes obtener para la rehabilitación energética de tu vivienda. Programas Next Generation EU, PRTR y deducciones fiscales.',
  keywords: 'subvenciones rehabilitacion energetica, ayudas Next Generation, reforma energetica vivienda, PRTR rehabilitacion, deducciones IRPF reforma, rehabilitacion edificios España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Subvenciones Rehabilitación Energética | meskeIA',
    description: 'Calcula las ayudas Next Generation EU y deducciones IRPF disponibles para la reforma energética de tu vivienda en España.',
    url: 'https://meskeia.com/simulador-subvenciones-rehabilitacion/',
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
    title: 'Simulador de Subvenciones Rehabilitación Energética | meskeIA',
    description: 'Estima las ayudas y deducciones disponibles para la rehabilitación energética de tu vivienda en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador Subvenciones Rehabilitación meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Subvenciones para Rehabilitación Energética',
  description: 'Herramienta orientativa que estima las subvenciones Next Generation EU (programas 3, 4 y 5 del PRTR), deducciones IRPF y ventajas fiscales disponibles para la rehabilitación energética de viviendas y edificios en España.',
  url: 'https://meskeia.com/simulador-subvenciones-rehabilitacion/',
  features: [
    'Estimación de subvenciones por programas Next Generation EU (PRTR)',
    'Cálculo de deducciones IRPF por mejora energética',
    'Comparativa entre programas 3, 4 y 5 de rehabilitación',
    'IVA reducido del 10% en obras de rehabilitación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué subvenciones existen para la rehabilitación energética de viviendas en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales programas son los del Plan de Recuperación (PRTR), financiados con fondos Next Generation EU: el Programa 3 subvenciona mejoras en instalaciones comunes de edificios residenciales, el Programa 4 cubre la rehabilitación de edificios completos con mejora mínima del 30 % en eficiencia energética, y el Programa 5 está destinado a barrios enteros. Las ayudas pueden cubrir entre el 40 % y el 80 % de la inversión según la renta y el tipo de actuación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué deducciones en el IRPF se pueden aplicar por obras de rehabilitación energética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Ley de Presupuestos estableció deducciones temporales de hasta el 20 % por reducción de la demanda de calefacción y refrigeración, el 40 % por mejora del consumo de energía primaria no renovable, y el 60 % por rehabilitación energética de edificios enteros. La base máxima varía entre 5.000 y 15.000 € según la actuación y la declaración conjunta o individual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo acumular subvenciones Next Generation con las deducciones del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En principio sí, pero la base deducible en el IRPF debe minorarse en el importe de la subvención recibida; es decir, no puedes deducirte la parte del gasto que ya ha sido subvencionada. Es imprescindible contar con un certificado energético antes y después de la reforma que acredite la mejora conseguida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de obras se consideran rehabilitación energética subvencionable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre las actuaciones elegibles destacan: mejora del aislamiento de fachadas, cubiertas y suelos; sustitución de ventanas por unidades de bajo consumo; instalación de aerotermia, bomba de calor o sistemas de climatización de alta eficiencia; y mejoras en la iluminación o instalación de energías renovables. La obra debe realizarla una empresa habilitada y quedar documentada con facturas y certificados técnicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué IVA se aplica a las obras de rehabilitación energética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las obras de rehabilitación de viviendas particulares tributan al tipo reducido del 10 % de IVA (en lugar del 21 % general), siempre que se cumplan determinados requisitos: que el inmueble lleve al menos dos años construido, que sea de uso residencial y que la factura supere el 40 % de coste de mano de obra respecto al coste total. Las comunidades de propietarios también pueden beneficiarse del 10 % en obras de rehabilitación del edificio.',
      },
    },
  ],
};

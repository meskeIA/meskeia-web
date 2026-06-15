import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu Sueldo al Desnudo - Visualizador de Bruto a Neto | meskeIA',
  description: 'Visualiza cómo se transforma tu sueldo bruto en neto. Cascada interactiva con cotizaciones SS, IRPF por tramos y deducciones. Datos 2025.',
  keywords: 'sueldo bruto neto, IRPF tramos, cotización seguridad social, nómina, retención, explicador visual, cascada salarial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Sueldo al Desnudo - De Bruto a Neto Visual',
    description: 'Visualiza cada euro que se descuenta de tu sueldo: SS, IRPF, desempleo y formación. Gráfico cascada interactivo.',
    url: 'https://meskeia.com/visualizador-sueldo-neto/',
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
    title: 'Tu Sueldo al Desnudo - Explicador Visual',
    description: 'De bruto a neto: visualiza cada descuento de tu sueldo con gráficos interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Sueldo Neto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Sueldo al Desnudo',
  description: 'Explicador visual interactivo que muestra cómo se transforma un sueldo bruto en neto. Visualización tipo cascada con cotizaciones a la Seguridad Social, retención de IRPF por tramos y deducciones.',
  url: 'https://meskeia.com/visualizador-sueldo-neto/',
  features: [
    'Visualización cascada de bruto a neto',
    'Desglose IRPF por tramos con datos 2025',
    'Cotizaciones SS: contingencias comunes, desempleo, formación, MEI',
    'Slider interactivo de sueldo bruto',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre sueldo bruto y sueldo neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sueldo bruto es la cantidad total acordada con la empresa antes de cualquier descuento. El sueldo neto es lo que realmente recibes en tu cuenta bancaria, tras descontar las cotizaciones a la Seguridad Social (entre un 6,35% y 6,50% del bruto) y la retención de IRPF, que varía según tu salario anual y situación personal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje se descuenta del sueldo para la Seguridad Social en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026, el trabajador cotiza a la Seguridad Social aproximadamente un 6,50% del salario bruto, distribuido en: contingencias comunes (4,70%), desempleo (1,55%), formación profesional (0,10%) y la cuota MEI del Mecanismo de Equidad Intergeneracional (0,15%). El empleador paga adicionalmente alrededor de un 30% por el mismo trabajador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los tramos del IRPF en la retención de la nómina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IRPF en España es progresivo: cada tramo de renta tributa a un tipo diferente, no todo el salario al tipo marginal. En 2025, los tramos estatales van del 9,5% (hasta 12.450 €) al 24,5% (a partir de 60.000 €). La retención mensual se calcula estimando el impuesto anual y dividiéndolo entre 12 pagas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un visualizador de sueldo bruto a neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sirve para entender exactamente qué parte de tu sueldo bruto va a cotizaciones sociales, qué parte a IRPF y qué queda como neto. Es útil al negociar una oferta laboral, comparar salarios entre países o simplemente entender tu nómina sin necesidad de conocimientos fiscales previos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la base de cotización y cómo afecta al sueldo neto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base de cotización es el importe sobre el que se calculan las cotizaciones a la Seguridad Social. En general coincide con el salario bruto mensual más las pagas extraordinarias prorrateadas, aunque existen bases mínimas y máximas fijadas cada año. A mayor base de cotización, mayores descuentos y menor sueldo neto, pero también mayores prestaciones futuras como pensión o baja por enfermedad.',
      },
    },
  ],
};

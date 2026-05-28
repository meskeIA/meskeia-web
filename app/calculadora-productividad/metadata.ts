import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Productividad Freelance - Ingresos por Hora Real | meskeIA',
  description: 'Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva de trabajo descontando reuniones, gestión y tiempo no facturable. 100% gratis.',
  keywords: 'productividad freelance, ingresos por hora, rentabilidad proyectos, tiempo efectivo, calculadora freelance, eficiencia trabajo, autonomo productividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Productividad Freelance | meskeIA',
    description: 'Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva descontando tiempo no facturable.',
    url: 'https://meskeia.com/calculadora-productividad/',
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
    title: 'Calculadora de Productividad Freelance | meskeIA',
    description: 'Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva descontando tiempo no facturable.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Productividad meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Productividad",
  description: "Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva de trabajo descontando reuniones, gestión y tiempo no facturable. 100% gratis.",
  url: "https://meskeia.com/calculadora-productividad/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ingreso por hora real para un freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ingreso por hora real es el cociente entre los ingresos facturados y las horas totales trabajadas, incluyendo las no facturables: reuniones, gestión administrativa, búsqueda de clientes, formación y tiempos muertos. Si facturas 2.000 € al mes pero trabajas 200 horas (140 facturables + 60 de gestión), tu ingreso real es 10 €/h, no 14,3 €/h.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas al día son realmente productivas para un trabajador independiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Estudios de gestión del tiempo sugieren que la mayoría de personas mantiene foco profundo durante 3-5 horas al día. El resto del tiempo de trabajo se dedica a tareas de menor concentración, comunicación o gestión. Para un freelance, conocer cuántas horas efectivas de trabajo directo al cliente produce cada semana es fundamental para fijar tarifas sostenibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calcular la tarifa horaria mínima como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tarifa mínima se calcula dividiendo tus costes anuales totales (cuota de autónomos, IRPF estimado, gastos de negocio, salario neto objetivo) entre las horas facturables reales al año. Si tus costes anuales son 40.000 € y facturas 1.000 horas, tu mínimo es 40 €/h antes de margen. A eso hay que sumar un porcentaje de beneficio y contingencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el tiempo no facturable y por qué es importante medirlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo no facturable es el que trabajas pero no puedes cobrar directamente al cliente: propuestas que no se convierten en proyectos, reuniones de seguimiento, formación, gestión de facturas o soporte post-entrega. Puede suponer entre el 20% y el 40% del tiempo total de un freelance. No medirlo lleva a subestimar el coste real de cada proyecto y a fijar tarifas que no cubren los gastos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia debería revisar mi productividad como freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo más útil es hacer una revisión mensual rápida (30 minutos) comparando horas facturadas vs. horas totales trabajadas y cotejándolas con los ingresos del mes. Una revisión trimestral más profunda permite detectar tendencias: si el ratio de horas no facturables crece, puede indicar que un tipo de cliente o proyecto consume recursos desproporcionados y conviene reajustar la cartera.',
      },
    },
  ],
};

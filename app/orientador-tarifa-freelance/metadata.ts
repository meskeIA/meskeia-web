import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Tarifa Freelance - Calcula tu Precio por Hora | meskeIA',
  description: 'Calcula tu tarifa freelance ideal considerando gastos, impuestos, vacaciones y margen de beneficio. Herramienta gratuita para autónomos y freelancers en España.',
  keywords: 'tarifa freelance, precio por hora, freelancer, autonomo, honorarios, calcular tarifa, cuanto cobrar, presupuesto freelance',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Tarifa Freelance | meskeIA',
    description: 'Descubre cuánto deberías cobrar como freelance. Calcula tu tarifa hora/día/proyecto considerando todos los gastos e impuestos.',
    url: 'https://meskeia.com/orientador-tarifa-freelance/',
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
    title: 'Orientador Tarifa Freelance | meskeIA',
    description: 'Herramienta gratuita para calcular tu tarifa freelance ideal. Evita cobrar de menos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Tarifa Freelance",
  description: "Calcula tu tarifa freelance ideal considerando gastos, impuestos, vacaciones y margen de beneficio. Herramienta gratuita para autónomos y freelancers en España.",
  url: "https://meskeia.com/orientador-tarifa-freelance/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo calculo mi tarifa por hora como freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para calcular tu tarifa por hora como freelance necesitas conocer tus gastos fijos mensuales (alquiler, herramientas, seguros), los días facturables al año descontando vacaciones y días no productivos, los impuestos aplicables (IRPF, IVA, cuota de autónomo) y el margen de beneficio que quieres obtener. Dividiendo el total de ingresos necesarios entre las horas facturables anuales obtienes tu tarifa mínima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería cobrar un freelance en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tarifa freelance en España varía considerablemente por sector: un diseñador gráfico puede cobrar entre 30 y 80 €/hora, un desarrollador web entre 40 y 120 €/hora, y un consultor entre 60 y 200 €/hora. La clave no es el promedio del mercado sino calcular tu tarifa según tus costes reales, experiencia y el valor que aportas al cliente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre tarifa hora, tarifa día y tarifa por proyecto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tarifa por hora se usa cuando el alcance del trabajo es incierto o para consultoría puntual. La tarifa por día (day rate) es habitual en contratos con agencias y suele ser entre 7 y 8 veces la tarifa hora. La tarifa por proyecto se negocia en base al resultado esperado y puede ser más rentable si eres eficiente, aunque implica mayor riesgo si el alcance se expande.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los freelances deben cobrar más que un empleado con el mismo sueldo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un freelance asume costes que en una relación laboral paga la empresa: cuota de autónomo (desde 200 € al mes), herramientas, seguros, formación, gestión contable y los periodos sin facturar. Además, no cobra vacaciones pagadas ni tiene derecho a prestación por desempleo en condiciones estándar. Por eso es habitual que la tarifa freelance supere en un 40-70% el equivalente salarial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el IVA y el IRPF a la tarifa que cobro como autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IVA (generalmente 21% en servicios profesionales) se añade a tu tarifa neta y lo repercutes al cliente; no es un ingreso tuyo, sino que lo ingresas trimestralmente a Hacienda. El IRPF se retiene en la factura (habitualmente 15% para autónomos con más de dos años de actividad) y actúa como pago a cuenta del impuesto anual. Ambos conceptos deben tenerse en cuenta al negociar tarifas para no confundir ingresos brutos con ingresos reales.',
      },
    },
  ],
};

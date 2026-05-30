import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Coste Real de Vivienda - Gastos Mensuales Totales | meskeIA',
  description: 'Calcula el coste real mensual de mantener una vivienda: hipoteca, IBI, comunidad, seguros, suministros, mantenimiento y más. Ideal para segundas residencias y viviendas heredadas.',
  keywords: 'coste vivienda, gastos vivienda, mantenimiento casa, IBI, comunidad propietarios, seguro hogar, segunda residencia, vivienda vacaciones, gastos fijos vivienda, coste real inmueble',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Coste Real de Vivienda | meskeIA',
    description: 'Descubre cuánto cuesta realmente mantener una vivienda al mes. Incluye todos los gastos: fijos, variables y ocultos.',
    url: 'https://meskeia.com/estimador-coste-vivienda/',
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
    title: 'Estimador Coste Real de Vivienda',
    description: 'Calcula el coste mensual real de mantener una vivienda con todos los gastos incluidos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Coste Vivienda meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Coste Vivienda",
  description: "Calcula el coste real mensual de mantener una vivienda: hipoteca, IBI, comunidad, seguros, suministros, mantenimiento y más. Ideal para segundas residencias y viviendas heredadas.",
  url: "https://meskeia.com/estimador-coste-vivienda/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los gastos mensuales reales de tener una vivienda en propiedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Más allá de la cuota hipotecaria, una vivienda genera gastos fijos y variables que muchos propietarios subestiman: IBI (prorrateado mensualmente), cuota de comunidad de propietarios, seguro de hogar, suministros (luz, agua, gas), tasa de basuras y fondo de mantenimiento. Una estimación razonable para una vivienda media en España sitúa estos gastos adicionales entre 200 y 600 € mensuales, dependiendo del tamaño, ubicación y antigüedad del inmueble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta mantener una segunda residencia o casa de vacaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una segunda residencia tiene costes similares a la vivienda habitual —IBI, comunidad, seguro, suministros mínimos— pero sin el beneficio de diluirlos entre muchos días de uso. Si la vivienda permanece cerrada varios meses, el coste por noche de uso efectivo puede resultar sorprendentemente alto. Es importante incluir también el mantenimiento preventivo anual (fontanería, climatización, pintura) que suele ser más intenso en inmuebles con uso discontinuo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es rentable mantener una vivienda heredada o conviene venderla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La decisión depende de comparar los gastos anuales totales de la vivienda frente al rendimiento alternativo del capital que representaría su venta. Si los gastos anuales superan el 2-3 % del valor del inmueble y la vivienda no genera alquiler ni uso frecuente, la rentabilidad puede ser negativa. También hay que considerar el impuesto sobre la renta imputada de inmuebles no arrendados (IRPF) y los costes de transmisión si se decide vender.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos de la vivienda son deducibles en la declaración de la renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si el inmueble está arrendado, son deducibles los intereses hipotecarios, el IBI, la comunidad, el seguro, los gastos de mantenimiento y conservación, la amortización del inmueble (3 % anual del valor de construcción) y los honorarios de gestión. Para la vivienda habitual, la deducción estatal por adquisición de vivienda fue suprimida en 2013, aunque algunas comunidades autónomas mantienen deducciones propias. Se recomienda consultar a un asesor fiscal para aplicarlas correctamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el IBI y cuánto se paga de media?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto sobre Bienes Inmuebles (IBI) lo fija cada ayuntamiento aplicando un tipo impositivo (generalmente entre el 0,4 % y el 1,1 %) al valor catastral del inmueble, que suele ser inferior al valor de mercado. En municipios grandes, el IBI anual de una vivienda media oscila entre 300 y 1.500 €, aunque en municipios con valores catastrales revisados recientemente puede ser significativamente mayor. Se paga una vez al año, aunque puede domiciliarse en cuotas.',
      },
    },
  ],
};

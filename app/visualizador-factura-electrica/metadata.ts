import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu Electricidad al Desnudo - Anatomía de la Factura de la Luz | meskeIA',
  description: 'Entiende cada línea de tu factura eléctrica: energía, potencia, peajes, cargos e impuestos. Factura ficticia interactiva con explicaciones.',
  keywords: 'factura luz, electricidad españa, peaje acceso, potencia contratada, impuesto eléctrico, PVPC, mercado libre, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Electricidad al Desnudo',
    description: 'Anatomía de la factura de la luz: cada concepto explicado de forma visual.',
    url: 'https://meskeia.com/visualizador-factura-electrica/',
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
    title: 'Tu Electricidad al Desnudo',
    description: 'Entiende por qué pagas lo que pagas de luz.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Factura Eléctrica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Electricidad al Desnudo',
  description: 'Explicador visual de la factura de electricidad española. Factura ficticia interactiva donde cada concepto es clickable: energía consumida, potencia contratada, peajes, cargos del sistema, impuesto eléctrico e IVA.',
  url: 'https://meskeia.com/visualizador-factura-electrica/',
  features: [
    'Factura eléctrica ficticia interactiva',
    'Cada concepto clickable con explicación detallada',
    'Desglose visual: energía, potencia, impuestos',
    'Gráfico doughnut de composición de la factura',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué conceptos componen una factura eléctrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una factura eléctrica tiene dos grandes bloques: el término de potencia (coste fijo por la potencia contratada, independientemente del consumo) y el término de energía (coste variable según los kWh consumidos). A estos se suman los peajes de acceso a la red, cargos del sistema eléctrico, el impuesto especial sobre la electricidad y el IVA. En conjunto, los impuestos y cargos regulados pueden representar el 40-50 % del total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la potencia contratada y cómo afecta a la factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia contratada es la cantidad máxima de energía (en kilovatios, kW) que puedes usar simultáneamente sin que salte el ICP. Se paga un coste fijo diario independientemente de si consumes o no. Contratar más potencia de la necesaria eleva la factura; contratar poca provoca cortes si conectas muchos electrodomésticos a la vez. El rango más habitual en hogares es de 3,3 kW a 5,75 kW.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre PVPC y tarifa de mercado libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El PVPC (Precio Voluntario al Pequeño Consumidor) es una tarifa regulada por el Gobierno que varía cada hora según el mercado mayorista. La tarifa de mercado libre la fija libremente la comercializadora, normalmente con un precio fijo por kWh durante la vigencia del contrato. El PVPC puede ser más barato en períodos de baja demanda, pero tiene mayor variabilidad; el mercado libre ofrece previsibilidad pero puede resultar más caro si el precio del mercado baja.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la factura eléctrica sube aunque consuma lo mismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pueden influir varios factores regulados: incrementos en los peajes de acceso a la red fijados por la CNMC, variaciones en los cargos del sistema (financiación de renovables, extrapeninsulares, déficit tarifario), cambios en el impuesto especial sobre electricidad o subidas del IVA. En el PVPC, además, el precio del mercado mayorista puede subir por mayor demanda, menor producción renovable o encarecimiento del gas natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reducir el importe de mi factura de la luz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales palancas son: ajustar la potencia contratada a tus necesidades reales (sin exceso ni defecto), desplazar el consumo de grandes electrodomésticos a horas valle si tienes discriminación horaria, mejorar el aislamiento del hogar para reducir calefacción y refrigeración, y revisar periódicamente si la tarifa contratada sigue siendo competitiva comparando con otras ofertas del mercado.',
      },
    },
  ],
};

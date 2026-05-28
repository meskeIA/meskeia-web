import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Plusvalías IRPF 2025 - Ganancias Patrimoniales | meskeIA',
  description: 'Estima orientativamente el IRPF por venta de inmuebles, fondos o acciones. Calcula la ganancia patrimonial y la cuota fiscal según los tramos de la base del ahorro 2025.',
  keywords: 'plusvalias irpf, ganancias patrimoniales, venta inmueble impuestos, venta acciones irpf, base del ahorro, tramos ahorro irpf 2025, calculo plusvalia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Plusvalías IRPF 2025 - Ganancias Patrimoniales',
    description: 'Estima la cuota de IRPF por la venta de inmuebles, fondos o acciones. Tramos base del ahorro 2025.',
    url: 'https://meskeia.com/estimador-plusvalias-irpf/',
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
    title: 'Estimador Plusvalías IRPF 2025 | meskeIA',
    description: 'Estima el IRPF por ganancias patrimoniales: inmuebles, fondos, acciones',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Plusvalías IRPF meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Plusvalías IRPF",
  description: "Estima orientativamente el IRPF por venta de inmuebles, fondos o acciones. Calcula la ganancia patrimonial y la cuota fiscal según los tramos de la base del ahorro 2025.",
  url: "https://meskeia.com/estimador-plusvalias-irpf/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué impuesto se paga por vender un piso o inmueble en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ganancia patrimonial obtenida al vender un inmueble tributa en el IRPF dentro de la base del ahorro. En 2025 los tramos son: 19% hasta 6.000 €, 21% de 6.001 a 50.000 €, 23% de 50.001 a 200.000 €, 27% de 200.001 a 300.000 € y 28% a partir de 300.000 €. La ganancia se calcula restando el precio de adquisición (más gastos e impuestos pagados al comprar) del precio de venta (menos gastos de transmisión).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la plusvalía de acciones o fondos de inversión en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ganancia se calcula restando el valor de adquisición (precio de compra más comisiones) del valor de transmisión (precio de venta menos comisiones). El resultado tributa en la base del ahorro del IRPF a los mismos tipos que los inmuebles. Los fondos de inversión tienen la ventaja del traspaso sin tributación: solo se tributa al reembolso final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe alguna exención al vender la vivienda habitual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La ganancia por venta de vivienda habitual está exenta del IRPF si el importe obtenido se reinvierte en otra vivienda habitual en un plazo de 2 años (antes o después de la venta). También están exentas las ganancias obtenidas por mayores de 65 años al vender su vivienda habitual, sin obligación de reinvertir. En ambos casos la exención debe declararse aunque la ganancia sea cero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pueden compensar pérdidas patrimoniales con ganancias en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Las pérdidas y ganancias patrimoniales de la misma base (del ahorro) se compensan entre sí en el mismo ejercicio. Si el saldo es negativo, puede compensarse con rendimientos del capital mobiliario (dividendos, intereses) hasta un límite del 25% de estos rendimientos. El saldo negativo restante se arrastra hasta 4 años para futuras compensaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay que declarar una plusvalía en la renta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cualquier transmisión de inmueble, acción, fondo u otro activo debe declararse en el IRPF del ejercicio en que se produce la venta, independientemente de si hay ganancia o pérdida. La ganancia tributa en la base del ahorro; la pérdida puede compensarse. La presentación de la declaración se realiza al año siguiente (campaña de renta, normalmente de abril a junio).',
      },
    },
  ],
};

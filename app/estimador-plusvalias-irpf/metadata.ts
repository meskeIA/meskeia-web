import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { GANANCIAS_PATRIMONIALES_META, TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = GANANCIAS_PATRIMONIALES_META.vigencia;

/**
 * Los tramos del FAQPage, de la misma escala con la que calcula la app. Hasta el 16/10/2026
 * iban tecleados «en 2025» con el último al 28 %, el de 2023-2024: desde el 1/1/2025 es el
 * 15 % estatal (art. 66 LIRPF) + 15 % autonómico (art. 76), redacción de la disposición final
 * 7.1 de la Ley 7/2024, leída en el BOE ese día. La tabla de la página ya decía 30 %. Cabo C0092.
 */
const euros = (n: number) => `${formatNumber(n, 0)} €`;
const pct = (n: number) => `${formatNumber(n, 0)} %`;
const piezasTramos = TRAMOS_GANANCIAS_PATRIMONIALES_2025.map((t, i) => {
  const desde = i === 0 ? 0 : TRAMOS_GANANCIAS_PATRIMONIALES_2025[i - 1].hasta;
  if (i === 0) return `${pct(t.tipo)} hasta ${euros(t.hasta)}`;
  if (t.hasta === Infinity) return `${pct(t.tipo)} a partir de ${euros(desde)}`;
  return `${pct(t.tipo)} de ${euros(desde)} a ${euros(t.hasta)}`;
});
const textoTramos = `${piezasTramos.slice(0, -1).join(', ')} y ${piezasTramos[piezasTramos.length - 1]}`;

export const metadata: Metadata = {
  title: `Estimador Plusvalías IRPF ${anio} - Ganancias Patrimoniales | meskeIA`,
  description: `Estima orientativamente el IRPF por venta de inmuebles, fondos o acciones. Calcula la ganancia patrimonial y la cuota fiscal según los tramos de la base del ahorro ${anio}.`,
  keywords: `plusvalias irpf, ganancias patrimoniales, venta inmueble impuestos, venta acciones irpf, base del ahorro, tramos ahorro irpf ${anio}, calculo plusvalia`,
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Estimador Plusvalías IRPF ${anio} - Ganancias Patrimoniales`,
    description: `Estima la cuota de IRPF por la venta de inmuebles, fondos o acciones. Tramos base del ahorro ${anio}.`,
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
    title: `Estimador Plusvalías IRPF ${anio} | meskeIA`,
    description: 'Estima el IRPF por ganancias patrimoniales: inmuebles, fondos, acciones',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Plusvalías IRPF meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Plusvalías IRPF",
  description: `Estima orientativamente el IRPF por venta de inmuebles, fondos o acciones. Calcula la ganancia patrimonial y la cuota fiscal según los tramos de la base del ahorro ${anio}.`,
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
        text: `La ganancia patrimonial obtenida al vender un inmueble tributa en el IRPF dentro de la base del ahorro. En ${anio} los tramos, sumando la parte estatal y la autonómica, son: ${textoTramos}. La ganancia se calcula restando el precio de adquisición (más gastos e impuestos pagados al comprar) del precio de venta (menos gastos de transmisión).`,
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

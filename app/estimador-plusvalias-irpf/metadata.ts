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

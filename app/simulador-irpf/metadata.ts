import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador IRPF 2024 - Calculadora de Renta | meskeIA',
  description: 'Calcula tu IRPF 2024 de forma sencilla. Simulador con tramos estatales y autonómicos, deducciones, mínimo personal y familiar. Resultado instantáneo.',
  keywords: 'simulador IRPF, calculadora renta 2024, tramos IRPF, declaración renta, impuesto renta, deducciones fiscales, retenciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador IRPF 2024 | meskeIA',
    description: 'Calcula tu IRPF con tramos actualizados, deducciones y mínimos personales.',
    url: 'https://meskeia.com/simulador-irpf/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador IRPF 2024 | meskeIA',
    description: 'Calcula tu impuesto sobre la renta de forma sencilla y precisa.',
  },
};

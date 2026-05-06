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
    url: 'https://meskeia.com/visualizador-sueldo-neto',
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Subir de Tramo IRPF te Quita MÁS? - Simulador Anti-Mito | meskeIA',
  description: 'El mito de "si subo de tramo, me quitan más" desmontado con números reales. Ajusta tu bruto y aumento, ve cómo el sistema progresivo SIEMPRE deja más en tu bolsillo. IRPF España 2025.',
  keywords: 'mito tramo IRPF, no me sube el sueldo IRPF, sistema progresivo tramos, cuanto me quitan del aumento, marginal vs medio, ascenso sueldo IRPF, sistema tramos IRPF España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-mito-tramo-superior/',
  },
  openGraph: {
    type: 'website',
    title: '¿Subir de Tramo IRPF te Quita MÁS? | meskeIA',
    description: 'Demuestra con números que el mito es falso',
    url: 'https://meskeia.com/simulador-mito-tramo-superior/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Mito del Tramo Superior IRPF | meskeIA',
    description: 'Aprende cómo funciona realmente el IRPF progresivo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Mito del Tramo Superior IRPF',
  description: 'Aplicación educativa que demuestra con cálculos reales que el mito popular "si subo de tramo IRPF, me quitan más en total" es matemáticamente falso. Ajusta tu bruto y un aumento, observa que tu neto siempre sube.',
  url: 'https://meskeia.com/simulador-mito-tramo-superior/',
  category: 'FinanceApplication',
  features: [
    'Comparativa antes/después/diferencia de un aumento de sueldo',
    'Gráfico de neto vs bruto con marcadores de tramos',
    '4 casos clásicos del mito (cruzando cada frontera)',
    'Mensaje educativo claro con números reales',
    'Datos basados en LPGE 2025 y Ley 35/2006',
    'Solo orientativo — verifica con la AEAT',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['mito IRPF', 'tramos IRPF', 'tipo marginal', 'fiscal España'],
});

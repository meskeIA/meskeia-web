import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Dinero y el Tiempo - Explicador Visual Interactivo | meskeIA',
  description: 'Visualiza cómo funciona una hipoteca, el interés compuesto, la inflación y la amortización anticipada. Explicaciones interactivas con gráficos animados.',
  keywords: 'interés compuesto, hipoteca visual, inflación poder adquisitivo, amortización anticipada, educación financiera, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Dinero y el Tiempo - Explicador Visual Interactivo',
    description: 'Visualiza cómo funciona una hipoteca, el interés compuesto, la inflación y la amortización anticipada con gráficos interactivos.',
    url: 'https://meskeia.com/visualizador-dinero-y-tiempo',
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
    title: 'El Dinero y el Tiempo - Explicador Visual',
    description: 'Entiende las finanzas de forma visual: hipoteca, interés compuesto, inflación y amortización.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Dinero y Tiempo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Dinero y el Tiempo',
  description: 'Explicador visual interactivo sobre conceptos financieros fundamentales: cómo se reparte una cuota de hipoteca, cómo crece el interés compuesto, cómo la inflación erosiona tu dinero y cuándo conviene amortizar hipoteca.',
  url: 'https://meskeia.com/visualizador-dinero-y-tiempo/',
  features: [
    'Visualización interactiva de cuotas hipotecarias mes a mes',
    'Gráfico animado de interés compuesto vs simple vs sin interés',
    'Simulación visual de la erosión del poder adquisitivo por inflación',
    'Comparativa visual: amortizar hipoteca vs invertir',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

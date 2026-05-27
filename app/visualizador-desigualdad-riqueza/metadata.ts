import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Desigualdad de la Riqueza - Curva de Lorenz y Coeficiente Gini | meskeIA',
  description: 'Visualiza la distribución de la riqueza con la curva de Lorenz, el coeficiente Gini, la paradoja del 1%, datos reales de España y el mundo, y el efecto acumulación.',
  keywords: ['desigualdad riqueza', 'curva de lorenz', 'coeficiente gini', 'distribucion riqueza', 'el 1%', 'oxfam', 'desigualdad españa', 'riqueza global', 'impuesto patrimonio', 'redistribucion'],
  openGraph: {
    title: 'Desigualdad de la Riqueza | meskeIA',
    description: 'Curva de Lorenz interactiva, Gini y distribución de la riqueza global.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Desigualdad de la Riqueza - Curva de Lorenz y Coeficiente Gini",
  description: "Visualiza la distribución de la riqueza con la curva de Lorenz, el coeficiente Gini, la paradoja del 1%, datos reales de España y el mundo, y el efecto acumulación.",
  url: "https://meskeia.com/visualizador-desigualdad-riqueza/",
  category: 'FinanceApplication',
  features: [],
});

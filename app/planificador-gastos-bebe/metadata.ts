import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Gastos del Primer Año del Bebé - Presupuesto España | meskeIA',
  description:
    'Estima cuánto cuesta el primer año de un bebé en España. 10 categorías de gasto con niveles ajustado, medio y confortable. Planifica tu presupuesto familiar.',
  keywords:
    'cuanto cuesta bebe primer año, gastos bebe España, presupuesto bebe, coste primer año hijo, pañales bebe coste anual, gastos recien nacido, planificador bebe',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Gastos del Primer Año del Bebé | meskeIA',
    description:
      'Calcula cuánto cuesta el primer año de un bebé en España. 10 categorías, 3 niveles de gasto y resumen mensual/anual.',
    url: 'https://meskeia.com/planificador-gastos-bebe',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planificador de Gastos del Primer Año del Bebé | meskeIA',
    description:
      'Estima el coste del primer año de tu bebé en España. 10 categorías con niveles ajustado, medio y confortable.',
  },
  other: {
    'application-name': 'Planificador Gastos Bebé meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Gastos del Primer Año del Bebé',
  description:
    'Herramienta interactiva para estimar el coste del primer año de un bebé en España. Incluye 10 categorías de gasto (pañales, alimentación, ropa, guardería, pediatra...) con tres niveles: ajustado, medio y confortable. Muestra el total anual, mensual y la distribución por categoría.',
  url: 'https://meskeia.com/planificador-gastos-bebe/',
  features: [
    'Estimación de gastos en 10 categorías del primer año del bebé',
    'Tres niveles de gasto: ajustado, medio y confortable',
    'Selector global y ajuste individual por categoría',
    'Resumen con total anual, mensual y distribución visual',
    'Datos orientativos para España 2025',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

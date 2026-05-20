import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escalador de Recetas — Ajusta las Cantidades para más o menos Personas | meskeIA',
  description: 'Escala cualquier receta para más o menos raciones al instante. Ajusta automáticamente levadura, sal y especias de forma no lineal. Incluye notas sobre el horno y advertencias prácticas.',
  keywords: 'escalador recetas, ajustar receta porciones, multiplicar receta, dividir receta, cambiar raciones receta, levadura no lineal, proporciones cocina, calculadora recetas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/escalador-recetas/',
  },
  openGraph: {
    type: 'website',
    title: 'Escalador de Recetas - Ajusta Cantidades para más o menos Personas',
    description: 'Escala cualquier receta con ajuste inteligente de levadura, sal y especias para el número de raciones que necesites.',
    url: 'https://meskeia.com/escalador-recetas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escalador de Recetas | meskeIA',
    description: 'Multiplica o divide cualquier receta con ajuste inteligente de levadura, sal y especias.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Escalador de Recetas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escalador de Recetas',
  description: 'Herramienta para escalar recetas de cocina: introduce las raciones originales y las deseadas, añade los ingredientes con su categoría, y obtén las cantidades ajustadas con correcciones inteligentes para levadura, sal y especias.',
  url: 'https://meskeia.com/escalador-recetas/',
  category: 'UtilityApplication',
  features: [
    'Escalado de ingredientes para cualquier número de raciones',
    'Ajuste no lineal para levadura, impulsores, sal y especias',
    'Advertencias para factores extremos (mayor de 4× o menor de 1/4×)',
    'Nota automática sobre tiempo y temperatura del horno',
    'Redondeo práctico de cantidades (g, ml, cucharadas, etc.)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['escalador recetas', 'ajustar porciones', 'multiplicar receta', 'levadura no lineal', 'cocina'],
});

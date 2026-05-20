import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Hidratación del Pan — Qué porcentaje de agua lleva tu masa | meskeIA',
  description:
    'Calcula la hidratación de tu masa de pan o descubre cuánta agua necesitas para una hidratación concreta. Clasifica el nivel de hidratación con ejemplos de panes típicos.',
  keywords:
    'hidratacion pan, calculadora hidratacion masa, porcentaje agua pan, baker hydration, masa alta hidratacion, ciabatta, baguette, masa madre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Hidratación del Pan — Qué porcentaje de agua lleva tu masa',
    description:
      'Averigua la hidratación de tu masa o calcula el agua necesaria para una hidratación objetivo. Con clasificación y ejemplos de panes.',
    url: 'https://meskeia.com/calculadora-hidratacion-pan',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Hidratación del Pan',
    description:
      'Calcula el % de hidratación de tu masa o cuánta agua necesitas para una hidratación objetivo. Clasificación con ejemplos de panes.',
  },
  other: {
    'application-name': 'Calculadora Hidratación Pan meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Hidratación del Pan',
  description:
    'Herramienta de panadería con dos modos: calcula el porcentaje de hidratación de una masa a partir de los gramos de harina y agua, o calcula los gramos de agua necesarios para una hidratación objetivo. Incluye clasificación del nivel de hidratación con descripción y ejemplos de panes típicos.',
  url: 'https://meskeia.com/calculadora-hidratacion-pan/',
  category: 'UtilityApplication',
  features: [
    'Dos modos: calcular % de hidratación o gramos de agua necesarios',
    'Clasificación del nivel de hidratación (seca, estándar, alta, muy alta, extrema)',
    'Descripción de la textura y manejo de cada nivel',
    'Ejemplos de panes típicos por nivel de hidratación',
    'Visualización con color por nivel de hidratación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

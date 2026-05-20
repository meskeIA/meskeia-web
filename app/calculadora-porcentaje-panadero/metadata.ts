import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: "Calculadora del Porcentaje del Panadero (Baker's Percentage) | meskeIA",
  description:
    'Calcula el porcentaje del panadero de tu receta de pan: introduce el peso de la harina y tus ingredientes y obtén los porcentajes respecto a la harina, la hidratación y el peso total de la masa.',
  keywords:
    "porcentaje panadero, baker's percentage, hidratacion pan, receta pan, calculo pan, masa pan, panaderia, porcentaje harina",
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: "Calculadora del Porcentaje del Panadero (Baker's Percentage)",
    description:
      'Introduce el peso de la harina y tus ingredientes y obtén el porcentaje del panadero, la hidratación y el peso total de la masa.',
    url: 'https://meskeia.com/calculadora-porcentaje-panadero',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Calculadora del Porcentaje del Panadero (Baker's Percentage)",
    description:
      "Calcula el baker's percentage de cualquier receta de pan: hidratación, porcentajes por ingrediente y porciones.",
  },
  other: {
    'application-name': "Calculadora Porcentaje Panadero meskeIA",
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora del Porcentaje del Panadero (Baker's Percentage)",
  description:
    "Herramienta de panadería que calcula el porcentaje del panadero de cualquier receta: la harina siempre es 100% y cada ingrediente se expresa como porcentaje de su peso. Muestra la hidratación, el peso total de la masa y las porciones resultantes.",
  url: 'https://meskeia.com/calculadora-porcentaje-panadero/',
  category: 'UtilityApplication',
  features: [
    'Calcula el porcentaje del panadero de cada ingrediente respecto a la harina',
    'Muestra la hidratación de la masa de forma destacada',
    'Permite añadir y eliminar ingredientes dinámicamente',
    'Calcula el número de porciones según el peso por porción',
    'Estado inicial con receta básica: harina, agua, sal y levadura',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

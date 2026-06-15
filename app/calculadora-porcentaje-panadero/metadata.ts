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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el porcentaje del panadero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El porcentaje del panadero (baker\'s percentage) es un sistema de medida en panadería donde la harina siempre equivale al 100% y cada ingrediente se expresa como porcentaje de su peso respecto al peso total de harina. Por ejemplo, si usas 500 g de harina y 350 g de agua, la hidratación es el 70%. Este sistema permite escalar recetas con facilidad y comparar fórmulas independientemente del tamaño de la hornada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el porcentaje del panadero de un ingrediente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es: porcentaje del ingrediente = (peso del ingrediente ÷ peso total de la harina) × 100. Si tienes 500 g de harina y 10 g de sal, el porcentaje de sal es 2%. La harina siempre es el 100% de referencia, incluso si usas mezcla de harinas; en ese caso se suma el peso total de todas las harinas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la hidratación habitual en las recetas de pan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hidratación varía según el tipo de pan. Un pan de molde estándar ronda el 65–70%, una baguette francesa el 68–75%, una ciabatta o pan rústico el 80–90%, y panes muy abiertos de masa madre pueden superar el 90%. Para principiantes se recomienda empezar entre el 65% y el 70%, ya que masas más húmedas son más difíciles de manejar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve expresar una receta en porcentajes del panadero en lugar de en gramos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Expresar una receta en porcentajes del panadero permite escalarla instantáneamente: si quieres hacer el doble de cantidad, simplemente doblas el peso de la harina y los demás ingredientes mantienen sus porcentajes. También facilita comparar recetas distintas (aunque tengan tamaños diferentes) y comunicar fórmulas de forma estandarizada en foros, libros y cursos de panadería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El porcentaje de sal en el pan suele ser siempre el mismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de las recetas de pan usan entre el 1,8% y el 2,2% de sal respecto al peso de la harina. Un 2% es el valor estándar más habitual. Menos del 1,5% resulta en pan soso, y más del 2,5% puede inhibir la fermentación de la levadura. Para panes artesanos con masa madre, el porcentaje de sal puede ajustarse ligeramente según el tiempo de fermentación y el perfil de sabor deseado.',
      },
    },
  ],
};

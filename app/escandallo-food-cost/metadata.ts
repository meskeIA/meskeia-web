import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escandallo y food cost: coste por ración y precio de venta | meskeIA',
  description:
    'Calcula el coste de una receta por sus ingredientes, el coste por ración y el precio de venta según el food cost objetivo. Para hostelería, catering y obradores. Sin impuestos. Gratis y en español.',
  keywords:
    'escandallo, food cost, coste por racion, calcular precio plato restaurante, precio de venta receta, margen bruto hosteleria, escandallo cocina, food cost objetivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Escandallo y food cost',
    description:
      'Coste de la receta, coste por ración y precio de venta según tu food cost objetivo. Para hostelería.',
    url: 'https://meskeia.com/escandallo-food-cost',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escandallo y food cost',
    description:
      'Calcula coste por ración, food cost y precio de venta de tus platos. Para hostelería y catering.',
  },
  other: {
    'application-name': 'Escandallo y food cost meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/escandallo-food-cost/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escandallo y food cost',
  description:
    'Herramienta de escandallo para hostelería: calcula el coste de una receta a partir de sus ingredientes, el coste por ración, el food cost (porcentaje del coste sobre el precio de venta) y el precio de venta recomendado según un food cost objetivo, además del margen bruto. Los importes son sin impuestos.',
  url: 'https://meskeia.com/escandallo-food-cost/',
  features: [
    'Coste de la receta sumando ingredientes por peso o por unidad',
    'Coste por ración y food cost en porcentaje',
    'Precio de venta recomendado según food cost objetivo',
    'Margen bruto por ración',
    'Referencias de food cost por tipo de negocio',
    'Gratuito, sin publicidad y en español',
  ],
  category: 'BusinessApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el food cost de un plato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El food cost es el porcentaje que representa el coste de la materia prima sobre el precio de venta de un plato. Si un plato cuesta 3 € en ingredientes y se vende a 12 €, su food cost es del 25%. Es uno de los indicadores clave para saber si un plato es rentable y para fijar bien la carta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un escandallo en cocina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un escandallo es el desglose detallado del coste de una receta: se suma lo que cuesta cada ingrediente según la cantidad usada y su precio, y se divide entre el número de raciones para obtener el coste por ración. Es la base para fijar el precio de venta y controlar la rentabilidad en hostelería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo el precio de venta de un plato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una forma habitual es dividir el coste por ración entre el food cost objetivo en tanto por uno. Si el coste por ración es 3 € y quieres un food cost del 30%, el precio de venta sería 3 / 0,30 = 10 €. A ese precio luego se le añaden los impuestos. La herramienta hace este cálculo automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué food cost es razonable en un restaurante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tipo de negocio, pero en un restaurante a la carta suele situarse entre el 28 y el 35%. En bebidas y café es mucho menor (15-25%) porque el coste de materia prima es bajo. Un food cost demasiado alto deja poco margen para cubrir personal, alquiler y resto de gastos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El precio que calcula incluye el IVA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El precio de venta que se obtiene es sin impuestos, para que la herramienta sirva en cualquier país. El IVA u otro impuesto sobre el consumo se añade aparte según la normativa de tu país y el tipo aplicable a la hostelería. Tampoco incluye costes de personal, energía o local, que se cubren con el margen.',
      },
    },
  ],
};

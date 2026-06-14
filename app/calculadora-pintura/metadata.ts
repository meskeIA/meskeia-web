import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Pintura - Calcula Litros por Metros Cuadrados | meskeIA',
  description: 'Calcula cuántos litros de pintura necesitas según los metros cuadrados, número de capas y tipo de superficie. Incluye calculadora de coste total.',
  keywords: 'calculadora pintura, litros pintura, metros cuadrados, pintar pared, cuanta pintura necesito, rendimiento pintura, bricolaje, decoracion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Pintura - Litros por m²',
    description: 'Calcula cuántos litros de pintura necesitas para tu proyecto. Considera capas, tipo de superficie y calcula el coste.',
    url: 'https://meskeia.com/calculadora-pintura/',
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
    title: 'Calculadora de Pintura - meskeIA',
    description: 'Calcula cuántos litros de pintura necesitas según metros cuadrados y capas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Pintura - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Pintura",
  description: "Calcula cuántos litros de pintura necesitas según los metros cuadrados, número de capas y tipo de superficie. Incluye calculadora de coste total.",
  url: "https://meskeia.com/calculadora-pintura/",
  category: 'UtilityApplication',
  features: [
      "Dos modos: por metros cuadrados directos o por dimensiones de habitación (largo × ancho × alto)",
      "4 tipos de superficie con rendimiento diferenciado: lisa (12 m²/L), gotelé (8), rugosa (7) y porosa (6)",
      "Selector de número de capas (1, 2 o 3) con ajuste automático de la cantidad",
      "Campo opcional de precio por litro para calcular el coste total del proyecto",
      "Sugerencia de litros a comprar con margen del 10% para repasos",
      "Gratuito, sin registro ni instalación",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos litros de pintura necesito para 20 metros cuadrados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con un rendimiento estándar de 10-12 m²/litro y una mano de pintura, necesitarías entre 1,7 y 2 litros. Con dos manos (lo habitual en paredes), entre 3,5 y 4 litros. Si la pared es porosa o de color oscuro, puede requerir hasta un 20% más. Siempre conviene comprar un 10% extra para repasos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas manos de pintura necesita una pared?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la mayoría de casos se aplican dos manos. Se recomienda una mano de imprimación más dos de pintura cuando la superficie es nueva, porosa o se cambia de color claro a oscuro (o viceversa). En reformas sobre color similar, dos manos de pintura de calidad suelen ser suficientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el rendimiento en m² por litro de una pintura estándar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las pinturas plásticas estándar para interior tienen un rendimiento de 8 a 12 m² por litro en cada mano, dependiendo de la porosidad del soporte y el método de aplicación. Las pinturas de alta cobertura pueden alcanzar 12-14 m²/litro. El fabricante indica el rendimiento en la etiqueta del producto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo los metros cuadrados de una habitación para pintar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mide el perímetro de la habitación (suma de los anchos de todas las paredes) y multiplícalo por la altura. Al resultado réstale la superficie de ventanas y puertas (normalmente 1,8 m² por puerta y 1,2-2 m² por ventana). Para el techo, multiplica largo por ancho de la habitación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre pintura mate, satinada y brillante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pintura mate no refleja la luz, oculta mejor las imperfecciones y es ideal para techos y habitaciones poco húmedas. La satinada tiene un ligero brillo, es más lavable y resistente; perfecta para salones y dormitorios. La brillante soporta la humedad y el lavado frecuente; se usa en cocinas, baños y carpintería.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Qué Pintura Elegir para Paredes y Techos - meskeIA',
  description:
    'Orientador de pintura: dinos qué vas a pintar (pared, techo, cocina, baño o fachada) y su estado, y te decimos el tipo de pintura, la imprimación, el rodillo y las manos que necesitas.',
  keywords:
    'que pintura elegir, tipo de pintura paredes, pintura mate o satinada, pintura cocina y baño, pintura para techo, pintura fachada exterior, imprimacion pared, que rodillo usar, pintar casa, pintura al agua',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Qué Pintura Elegir para Paredes y Techos',
    description:
      'Elige el tipo de pintura correcto según la superficie, su estado y el acabado que quieres. Incluye imprimación, rodillo y número de manos.',
    url: 'https://meskeia.com/elegir-pintura-paredes',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qué Pintura Elegir para Paredes y Techos',
    description:
      'El tipo de pintura, la imprimación y el rodillo adecuados para cada superficie de tu casa.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Orientador de Pintura meskeIA',
  },
};

// Schema.org JSON-LD (WebApplication) para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Qué Pintura Elegir para Paredes y Techos',
  description:
    'Orientador que recomienda el tipo de pintura, la imprimación, el rodillo y el número de manos según la superficie (pared interior, cocina, baño, techo o fachada), su estado y el acabado deseado.',
  url: 'https://meskeia.com/elegir-pintura-paredes/',
  category: 'UtilityApplication',
  features: [
    'Recomendación del tipo de pintura según la superficie y su uso',
    'Elección de acabado mate o satinado con sus ventajas e inconvenientes',
    'Indica la imprimación necesaria según el estado del soporte',
    'Sugiere el rodillo adecuado para pared lisa o con gotelé',
    'Guía para elegir el color y consejos de tintado en tienda',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/elegir-pintura-paredes/',
  mainEntity: [
    {
      question: '¿Qué pintura es mejor para las paredes de casa?',
      answer:
        'Para interiores, la opción estándar es la pintura plástica al agua (vinílica o acrílica): tiene poco olor y las herramientas se limpian con agua. Elige acabado mate para disimular las imperfecciones de la pared o satinado en pasillos y zonas de roce, donde interesa poder limpiar sin desgastar.',
    },
    {
      question: '¿Es mejor pintura mate o satinada?',
      answer:
        'El mate disimula los defectos de la pared y da un acabado elegante, pero se limpia peor. El satinado resiste mejor la limpieza y el roce y aporta un ligero brillo, aunque marca más las imperfecciones cuando la luz incide de lado. En los techos se usa siempre mate.',
    },
    {
      question: '¿Qué pintura va en la cocina y el baño?',
      answer:
        'Una pintura plástica al agua específica para cocinas y baños, en acabado satinado. Llevan fungicidas contra el moho y resisten la condensación y la limpieza de grasa. La pintura mate normal en estas zonas se ensucia y acaba manchándose de humedad.',
    },
    {
      question: '¿Cuándo necesito imprimación antes de pintar?',
      answer:
        'En yeso o pladur nuevo, para sellar su gran absorción; sobre manchas de agua, moho, nicotina o rotulador, con una imprimación anti-manchas para que no reaparezcan; y en soportes muy absorbentes o pintados a la cal. Si repintas sobre una pintura vieja bien adherida, no hace falta imprimación.',
    },
    {
      question: '¿Qué rodillo uso según el tipo de pared?',
      answer:
        'En pared lisa, rodillo de pelo corto-medio (10-14 mm). En gotelé o textura rugosa, rodillo de pelo largo (18-22 mm) para llegar al fondo. En techos, rodillo antigoteo montado en pértiga. Para esquinas, marcos y rincones, una brocha o paletina.',
    },
    {
      question: '¿Puedo mezclar el color de la pintura en casa?',
      answer:
        'No es recomendable: si te quedas corto, es muy difícil reproducir el tono exacto en un segundo bote y se nota el corte en la pared. Lo práctico es pedir el color tintado en el punto de venta indicando su código (RAL, NCS o la carta del fabricante), así puedes repetir el tono siempre que lo necesites.',
    },
  ],
});

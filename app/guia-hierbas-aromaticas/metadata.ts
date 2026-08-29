import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Hierbas Aromáticas para Cocina | meskeIA',
  description:
    'Guía de 27 hierbas aromáticas: albahaca, romero, tomillo, orégano, perejil, cilantro, eneldo y más. Sabor, usos, cultivo y maridaje.',
  keywords:
    'hierbas aromaticas, albahaca romero tomillo, perejil cilantro, hierbas cocina, cultivar hierbas, maridaje hierbas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Hierbas Aromáticas para Cocina | meskeIA',
    description:
      'Descubre 27 hierbas aromáticas: perfil de sabor, intensidad, usos culinarios, origen, maridaje y guía de cultivo.',
    url: 'https://meskeia.com/guia-hierbas-aromaticas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Hierbas Aromáticas | meskeIA',
    description:
      'Directorio de 27 hierbas aromáticas con perfil de sabor, maridaje, cocinas típicas y guía de cultivo en casa.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: {
    'application-name': 'Guía Hierbas Aromáticas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Hierbas Aromáticas para Cocina',
  description:
    'Directorio consultable de 27 hierbas aromáticas con perfil de sabor, intensidad, forma de uso (fresca/seca), origen, maridaje, cocinas típicas, cuándo añadirlas y dificultad de cultivo. Filtros por familia botánica, origen, intensidad, forma de uso y dificultad.',
  url: 'https://meskeia.com/guia-hierbas-aromaticas/',
  features: [
    'Búsqueda por nombre, nombre científico o perfil de sabor',
    'Filtros por familia botánica, origen, intensidad y forma de uso',
    '27 hierbas con ficha completa',
    'Maridaje ideal y cocinas típicas por hierba',
    'Cuándo añadir cada hierba durante la cocción',
    'Guía de cultivo: sol, riego y dificultad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo añadir las hierbas aromáticas durante la cocción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El momento de añadir una hierba depende de su resistencia al calor. Las hierbas duras (romero, tomillo, laurel, orégano seco) soportan cocciones largas y se añaden al principio del guiso. Las hierbas delicadas (albahaca fresca, perejil, cilantro, estragón) pierden su aroma con el calor y deben incorporarse al final, justo antes de servir. La menta y el eneldo frescos se añaden siempre fuera del fuego para preservar su esencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre usar una hierba fresca o seca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las hierbas secas tienen los aceites esenciales concentrados, por lo que son más potentes en aroma: la regla habitual es usar 1/3 de la cantidad indicada para frescas. Las hierbas frescas aportan matices más vivos y frescos, ideales para aliños, salsas en frío y acabados. Algunas hierbas, como el perejil o la albahaca, pierden casi todo su sabor al secarse y deben usarse frescas; otras, como el orégano o el tomillo, ganan intensidad con el secado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hierbas aromáticas son fáciles de cultivar en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las hierbas más fáciles de cultivar en maceta en casa son la menta (muy vigorosa, mejor en maceta independiente para que no invada), la albahaca (necesita mucha luz y calor), el cebollino, el perejil y el tomillo. La menta y el tomillo son especialmente resistentes. La albahaca es la más exigente en luz solar directa. Con riego moderado, sustrato bien drenado y una ventana orientada al sur o suroeste, la mayoría crecen sin dificultad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hierbas aromáticas combinan mejor con pescado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El eneldo es la hierba clásica para el pescado, especialmente el salmón y el bacalao, por su sabor anisado suave. El estragón funciona muy bien con pescados blancos al horno o a la plancha. El perejil rizado o liso es un acompañamiento neutro y versátil para cualquier tipo de marisco o pescado. El hinojo fresco o sus semillas añaden una nota fresca y anisada que equilibra la grasa de pescados azules como el atún o las sardinas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo conservar las hierbas aromáticas frescas para que duren más?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las hierbas con tallo leñoso (romero, tomillo, menta) se conservan bien envueltas en un papel de cocina húmedo dentro de una bolsa en el cajón de la nevera, hasta 2 semanas. Las hierbas de tallo suave (perejil, cilantro, albahaca) duran más si se colocan con los tallos en un vaso con agua (como flores), tapadas con una bolsa y a temperatura ambiente para la albahaca o en el frigorífico para el resto. Otra opción es picarlas y congelarlas en cubitos de agua o aceite.',
      },
    },
  ],
};

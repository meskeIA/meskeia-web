import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Especias - Perfil, usos y conservación | meskeIA',
  description: 'Directorio de 65 especias: perfil de sabor, intensidad, usos culinarios, origen, con qué combinan y cómo conservarlas. Buscador y filtros por familia de sabor.',
  keywords: 'especias cocina, guía especias, pimienta, canela, cúrcuma, comino, azafrán, conservar especias, mezclas especias, cocina con especias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Especias | meskeIA',
    description: 'Consulta el perfil de 65 especias: sabor, intensidad, usos, origen y con qué combinan. Referencia culinaria práctica.',
    url: 'https://meskeia.com/guia-especias/',
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
    title: 'Guía de Especias | meskeIA',
    description: 'Directorio de 65 especias: perfil de sabor, usos culinarios y consejos de conservación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Especias meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Especias',
  description: 'Directorio consultable de 65 especias con perfil de sabor, intensidad, usos culinarios principales, región de origen, especias con las que combinan mejor y guía de conservación. Filtros por familia de sabor y buscador por nombre o uso.',
  url: 'https://meskeia.com/guia-especias/',
  features: [
    'Búsqueda por nombre de especia o uso culinario',
    'Filtros por familia de sabor (picante, dulce, herbal, floral...)',
    '65 especias con perfil completo',
    'Indicador visual de intensidad por especia',
    'Con qué especias combina cada una',
    'Guía de conservación (tiempo y método)',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre especias y hierbas aromáticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las especias proceden en su mayoría de semillas, cortezas, raíces, frutos secos o brotes de plantas (pimienta, canela, clavo, cardamomo), mientras que las hierbas aromáticas son las partes verdes y foliares de la planta (albahaca, perejil, tomillo, orégano). En la práctica culinaria la frontera es difusa y muchos recetarios tratan ambas categorías de forma conjunta bajo el término general "especias".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se conservan correctamente las especias para que no pierdan aroma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las especias molidas conservan su potencia aromática durante 1-3 años si se guardan en recipientes herméticos, alejados de la luz directa, el calor y la humedad. Las especias enteras (granos, vainas, cortezas) duran hasta 4-5 años en condiciones similares. Molerlas en el momento de uso preserva mejor los aceites esenciales responsables del aroma y el sabor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué especias combinan bien entre sí para cocina mediterránea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cocina mediterránea clásica se apoya en combinaciones como orégano + tomillo + romero para carnes y verduras asadas; comino + pimentón + ajo en polvo para guisos y marinadas; y laurel + pimienta negra + clavo para caldos y estofados. La clave es equilibrar notas terrosas (comino, pimentón) con notas herbales (orégano, tomillo) y pinceladas cálidas (canela, clavo) en preparaciones de cocción larga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la especia más cara del mundo y por qué?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El azafrán es la especia más cara del mundo, con precios que oscilan entre 3.000 y 14.000 € por kilogramo según la calidad. Su alto coste se debe al proceso de recolección: cada flor de Crocus sativus produce solo tres estigmas, que deben recogerse a mano durante una ventana de pocas horas al año. Se necesitan entre 150.000 y 200.000 flores para obtener un kilogramo de azafrán seco.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber la intensidad de sabor de una especia antes de usarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La intensidad de una especia depende de su concentración en aceites esenciales volátiles (terpenos) y compuestos activos como la capsaicina (picante) o la piperina (pimienta). Como guía práctica: especias de intensidad alta como clavo, cayena o canela requieren cantidades muy pequeñas (menos de media cucharadita por ración), mientras que especias de intensidad baja como el eneldo o el cilantro admiten proporciones más generosas sin saturar el plato.',
      },
    },
  ],
};

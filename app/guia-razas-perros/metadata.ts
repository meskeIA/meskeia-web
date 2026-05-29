import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Razas de Perros - 40 razas con características y filtros | meskeIA',
  description: 'Directorio interactivo de 40 razas de perros: tamaño, energía, temperamento, peso, mantenimiento y aptitud para familia. Filtros por tamaño, energía, apartamento y niños. Incluye grupos FCI.',
  keywords: 'guia razas perros, razas perros españa, perros apartamento, perros para niños, grupos FCI, labrador retriever, golden retriever, razas pequeñas, razas grandes, adoptar perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Razas de Perros - 40 razas con características | meskeIA',
    description: '40 razas de perros con temperamento, energía, peso, altura, mantenimiento y consejos para elegir la raza ideal. Filtros interactivos por tamaño, energía, apartamento y niños.',
    url: 'https://meskeia.com/guia-razas-perros/',
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
    title: 'Guía de Razas de Perros | meskeIA',
    description: '40 razas de perros: tamaño, energía, temperamento y cómo elegir la raza ideal para tu vida.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Razas de Perros meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Razas de Perros',
  description: 'Directorio interactivo de 40 razas de perros clasificadas por grupos FCI con información sobre tamaño, peso, altura, tipo de pelo, energía, nivel de mantenimiento, temperamento, esperanza de vida y aptitud para familias con niños o pisos pequeños. Incluye filtros interactivos y guía para elegir la raza ideal.',
  url: 'https://meskeia.com/guia-razas-perros/',
  features: [
    '40 razas de perros con ficha completa',
    'Clasificación por grupos FCI con código de color',
    'Filtros por tamaño, energía, apto apartamento y apto niños',
    'Buscador por nombre de raza',
    'Peso, altura, tipo de pelo y esperanza de vida',
    'Nivel de mantenimiento y temperamento por raza',
    'Guía paso a paso para elegir la raza ideal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué raza de perro es más adecuada para vivir en un apartamento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las razas de nivel de energía bajo o medio y tamaño pequeño o mediano se adaptan mejor a la vida en piso: Bichón Frisé, Shih Tzu, Bulldog Francés, Cavalier King Charles Spaniel o el Basset Hound son buenas opciones. El factor clave no es solo el tamaño sino la necesidad de ejercicio diario: un Greyhound, por ejemplo, es grande pero descansa la mayor parte del día. La guía incluye un filtro específico de "apto apartamento" para facilitar esta búsqueda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las razas de perros más recomendadas para familias con niños pequeños?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Labrador Retriever, el Golden Retriever, el Beagle y el Boxer destacan por su paciencia, sociabilidad y tolerancia con los niños. En general, las razas de los grupos FCI de cobradores, levantadores y perros de agua, así como los pastores de carácter equilibrado, suelen mostrar una alta tolerancia. Se recomienda evitar razas con alta tendencia al territorio o a la guarda intensa si hay niños muy pequeños en casa y no hay experiencia previa con perros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significan los grupos FCI y cómo me ayudan a elegir raza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Federación Cinológica Internacional (FCI) clasifica las razas caninas en 10 grupos según su función original: pastores (I), molosos (II), terriers (III), teckels (IV), spitz y primitivos (V), sabuesos (VI), perros de muestra (VII), cobradores y levantadores (VIII), compañía (IX) y lebreles (X). Conocer el grupo orienta sobre el instinto, el nivel de actividad y el tipo de estímulo que necesita el perro, lo que facilita la convivencia y el adiestramiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué perros requieren menos mantenimiento del pelo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las razas de pelo corto y liso como el Boxer, el Dálmata, el Vizsla o el Weimaraner necesitan solo un cepillado semanal y baños ocasionales. Los perros de pelo corto y denso (Labrador, Beagle) mudan con más intensidad pero siguen siendo fáciles de mantener. En el extremo opuesto, razas de pelo largo (Afgano, Bobtail) o rizado (Caniche, Bichón) requieren cepillados diarios y visitas frecuentes al peluquero canino. La ficha de cada raza indica el nivel de mantenimiento con una escala de 1 a 5.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto viven los perros de media según su tamaño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general existe una relación inversa entre tamaño y esperanza de vida en perros. Las razas pequeñas (Chihuahua, Yorkshire Terrier) suelen vivir entre 14 y 16 años; las medianas (Beagle, Cocker), entre 12 y 14 años; y las grandes o gigantes (Gran Danés, San Bernardo), entre 7 y 10 años. Se trata de promedios: la alimentación, el ejercicio, la genética y los cuidados veterinarios influyen de forma significativa en la longevidad individual de cada animal.',
      },
    },
  ],
};

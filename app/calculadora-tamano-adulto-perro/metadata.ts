import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { rangosTipicos } from './razas';

export const metadata: Metadata = {
  title: 'Calculadora de Peso y Tamaño Adulto del Cachorro por Raza',
  description: 'Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia.',
  keywords: 'peso adulto cachorro, tamaño perro adulto, crecimiento cachorro, predicción peso perro, raza perro, cuánto pesará mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Peso y Tamaño Adulto del Cachorro',
    description: 'Predice cuánto pesará tu cachorro cuando sea adulto',
    url: 'https://meskeia.com/calculadora-tamano-adulto-perro/',
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
    title: 'Predictor de Peso y Tamaño Adulto del Cachorro',
    description: 'Calcula el peso final de tu cachorro según su raza y peso actual',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Tamaño Adulto Cachorro",
  description: "Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia.",
  url: "https://meskeia.com/calculadora-tamano-adulto-perro/",
  category: 'UtilityApplication',
  features: [
    'Predicción del peso adulto a partir del peso y edad actuales del cachorro',
    'Curvas de crecimiento específicas para 5 tamaños de raza (mini a gigante)',
    'Rango de peso probable con margen de error del ±15%',
    'Tabla de referencia con más de 25 razas y su peso adulto típico',
    'Indicación de la edad de maduración esperada según el tamaño',
    'Filtros por categoría de tamaño en la tabla de razas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo puedo saber cuánto pesará mi cachorro de adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora divide el peso actual entre el porcentaje de peso adulto que corresponde a esa edad y a ese tamaño de raza. Una raza grande a las 14 semanas ronda el 35 % de su peso adulto, así que 12 kg a esa edad proyectan unos 34,3 kg. Circulan reglas más rápidas, como multiplicar por 2 el peso de una raza mediana a las 16 semanas, que coincide con la curva en ese punto concreto pero pierde precisión fuera de él. En todos los casos son estimaciones: la genética individual y la alimentación influyen en el resultado final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad dejan de crecer los perros según su tamaño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Los perros de razas pequeñas (${rangosTipicos.pequeno.etiqueta} de adulto) alcanzan su tamaño adulto aproximadamente a los 10-12 meses. Las razas medianas (${rangosTipicos.mediano.etiqueta}) maduran entre los 12 y 15 meses. Las razas grandes (${rangosTipicos.grande.etiqueta}) tardan entre 18 y 24 meses, y las razas gigantes (${rangosTipicos.gigante.etiqueta}), como el Gran Danés o el San Bernardo, pueden seguir creciendo hasta los 24-36 meses. Los rangos salen de las razas de referencia de la propia calculadora y se solapan en los bordes, porque describen pesos reales de razas, no tramos administrativos.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable predecir el peso adulto de un perro mestizo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La predicción es menos precisa en perros mestizos porque desconocemos la genética completa del animal. Sin embargo, el peso a las 8-12 semanas sigue siendo un indicador útil: los cachorros mestizos pequeños a esa edad suelen ser adultos pequeños o medianos. Si conoces las razas de los progenitores, puedes hacer una estimación promediando los pesos adultos típicos de ambas razas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un perro de raza pequeña, mediana y grande?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clasificación varía según la fuente, pero como referencia general: razas toy o miniatura pesan menos de 5 kg (Chihuahua, Yorkshire); razas pequeñas entre 5 y 10 kg (Bichón Frisé, Jack Russell); razas medianas entre 10 y 25 kg (Beagle, Cocker Spaniel, Border Collie); razas grandes entre 25 y 45 kg (Labrador Retriever, Golden Retriever, Pastor Alemán); y razas gigantes por encima de 45 kg (Gran Danés, San Bernardo, Terranova).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Influye la alimentación en el tamaño final de un perro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, aunque la genética es el factor determinante, la nutrición durante el crecimiento tiene un impacto real. Una subnutrición severa puede limitar el crecimiento potencial, mientras que la sobrealimentación en razas grandes puede acelerar el desarrollo óseo y aumentar el riesgo de problemas articulares. Los piensos específicos para cachorros de raza grande o gigante están formulados para un crecimiento más controlado.',
      },
    },
  ],
};

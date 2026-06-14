import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Tamaño Adulto para Cachorros | meskeIA',
  description: 'Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia.',
  keywords: 'peso adulto cachorro, tamaño perro adulto, crecimiento cachorro, predicción peso perro, raza perro, cuánto pesará mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Tamaño Adulto para Cachorros',
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
    title: 'Predictor de Tamaño Adulto para Cachorros',
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
        text: 'La estimación más habitual para razas medianas consiste en tomar el peso a las 16 semanas y multiplicarlo por 2. Para razas grandes, se puede usar el peso a las 14 semanas multiplicado por 2,5. Otra fórmula frecuente es dividir el peso actual (en kg) entre la edad en semanas y multiplicar por la edad aproximada de madurez de la raza. Estas son estimaciones orientativas; la genética individual y la alimentación influyen en el resultado final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad dejan de crecer los perros según su tamaño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los perros de razas pequeñas (menos de 10 kg) alcanzan su tamaño adulto aproximadamente a los 10-12 meses. Las razas medianas (10-25 kg) maduran entre los 12 y 15 meses. Las razas grandes (25-45 kg) tardan entre 15 y 18 meses, y las razas gigantes (más de 45 kg), como el Dogo Alemán o el San Bernardo, pueden seguir creciendo hasta los 18-24 meses.',
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
        text: 'La clasificación varía según la fuente, pero como referencia general: razas toy o miniatura pesan menos de 5 kg (Chihuahua, Yorkshire); razas pequeñas entre 5 y 10 kg (Beagle, Cocker); razas medianas entre 10 y 25 kg (Labrador juvenil, Springer Spaniel); razas grandes entre 25 y 45 kg (Labrador, Golden Retriever, Husky); y razas gigantes por encima de 45 kg (Mastín, Gran Danés, Terranova).',
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

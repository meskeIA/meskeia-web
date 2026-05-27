import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador IMC - Índice de Masa Corporal | meskeIA',
  description: 'Calcula tu Índice de Masa Corporal (IMC) gratis. Conoce tu clasificación según la OMS: bajo peso, normal, sobrepeso u obesidad. Fórmula peso/altura².',
  keywords: 'calculadora imc, indice masa corporal, imc online, calcular imc, peso ideal, clasificacion oms, sobrepeso, obesidad, bajo peso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador IMC - Índice de Masa Corporal',
    description: 'Calcula tu IMC gratis y conoce tu clasificación según la OMS. Herramienta rápida y precisa.',
    url: 'https://meskeia.com/orientador-imc/',
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
    title: 'Orientador IMC - Índice de Masa Corporal',
    description: 'Calcula tu IMC gratis y conoce tu clasificación según la OMS.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el IMC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Índice de Masa Corporal se calcula dividiendo el peso en kilogramos entre el cuadrado de la estatura en metros: IMC = peso (kg) / altura² (m). Por ejemplo, una persona de 70 kg y 1,75 m tiene un IMC de 70 / (1,75 × 1,75) = 22,9, que corresponde al rango de peso normal según la clasificación OMS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los rangos del IMC según la OMS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Organización Mundial de la Salud clasifica el IMC en adultos así: menos de 18,5 es bajo peso; de 18,5 a 24,9 es peso normal; de 25 a 29,9 es sobrepeso; de 30 a 34,9 es obesidad grado I; de 35 a 39,9 es obesidad grado II; y 40 o más es obesidad grado III o mórbida. Estos rangos aplican a adultos de 20 años o más y no distinguen por sexo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene limitaciones el IMC como indicador de salud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El IMC no distingue entre masa muscular y grasa corporal, por lo que un deportista con mucha masa muscular puede tener IMC de sobrepeso sin exceso de grasa. Tampoco refleja la distribución de la grasa corporal: la grasa abdominal visceral es más peligrosa que la periférica aunque el IMC sea igual. Para una evaluación más precisa se recomienda combinar el IMC con la medida del perímetro abdominal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es diferente el IMC saludable según la edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los rangos estándar de la OMS aplican a adultos de 20 a 65 años. En personas mayores de 65 años, algunos estudios apuntan a que un IMC de 25-27 puede asociarse a menor mortalidad que el rango normal estricto. En menores de 18 años no se usan los rangos adultos: se utilizan tablas percentiladas específicas por edad y sexo conocidas como curvas de crecimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería pesar según mi altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para calcular un rango de peso saludable, se usa el IMC: peso mínimo saludable = 18,5 × altura²; peso máximo saludable = 24,9 × altura². Para una persona de 1,70 m, el rango es entre 53,5 kg y 71,9 kg. Este cálculo es orientativo; el peso saludable real depende también de la composición corporal, edad, sexo y contexto de salud individual.',
      },
    },
  ],
};

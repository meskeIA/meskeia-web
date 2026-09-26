import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
        text: 'Los cortes de adulto de la OMS se aplican desde los 20 años, sin límite superior de edad. De 5 a 19 años no se usan: la OMS emplea el IMC para la edad y el sexo, con sus propias curvas de referencia. En personas mayores la OMS no fija cortes distintos, pero la pérdida de masa muscular hace que el mismo IMC diga menos sobre la composición corporal, y algunos estudios observacionales asocian en ellas la menor mortalidad a IMC algo más altos que en adultos jóvenes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería pesar según mi altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rango de peso que corresponde al IMC estándar de la OMS se calcula así: peso mínimo = 18,5 × altura²; peso máximo = 24,9 × altura² (altura en metros). Para una persona de 1,70 m, el rango es entre 53,5 kg y 72,0 kg (24,9 × 2,89 = 71,96). Este cálculo es orientativo; el peso saludable real depende también de la composición corporal, edad, sexo y contexto de salud individual.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador IMC",
  description: "Calcula tu Índice de Masa Corporal (IMC) gratis. Conoce tu clasificación según la OMS: bajo peso, normal, sobrepeso u obesidad. Fórmula peso/altura².",
  url: "https://meskeia.com/orientador-imc/",
  category: 'UtilityApplication',
  features: [],
});

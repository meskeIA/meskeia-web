import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Porciones - Mide con tu Mano | meskeIA',
  description: 'Aprende a estimar porciones de alimentos usando tu mano como referencia. Método visual y práctico para controlar las cantidades sin necesidad de báscula.',
  keywords: 'porciones alimentos, tamaño porción, medir comida mano, raciones comida, control porciones, porciones saludables',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Porciones - meskeIA',
    description: 'Aprende a estimar porciones de alimentos usando tu mano como referencia.',
    url: 'https://meskeia.com/calculadora-porciones/',
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
    title: 'Calculadora de Porciones - meskeIA',
    description: 'Método visual para controlar las porciones de alimentos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Porciones",
  description: "Aprende a estimar porciones de alimentos usando tu mano como referencia. Método visual y práctico para controlar las cantidades sin necesidad de báscula.",
  url: "https://meskeia.com/calculadora-porciones/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se miden las porciones de comida con la mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mano es una referencia práctica adaptada al tamaño de cada persona. La palma (sin dedos) equivale aproximadamente a una ración de proteína como carne o pescado; el puño cerrado equivale a una ración de hidratos como arroz o pasta cocidos; el cuenco formado por las dos manos equivale a una ración de verduras o ensalada; y la punta del pulgar equivale a una cucharadita de aceite o mantequilla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son precisas las porciones medidas con la mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No son medidas exactas en gramos, sino estimaciones orientativas. La ventaja es que la mano es proporcional al cuerpo: una persona más grande tiene una mano más grande y necesita porciones mayores. Para control de peso o dietas terapéuticas supervisadas por un profesional, puede ser necesaria una báscula de alimentos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de alimentos funciona el método de porciones con la mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método funciona bien para alimentos habituales: proteínas (carnes, pescados, huevos, legumbres), hidratos (arroz, pasta, patata, pan), grasas (aceite, frutos secos, aguacate) y verduras. Para alimentos líquidos, lácteos o snacks procesados suele ser más fiable medir con taza o báscula.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas porciones de proteína, hidratos y grasas se recomiendan al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las recomendaciones generales para un adulto activo son aproximadamente 1 palma de proteína por comida principal (2-4 al día), 1 puño de hidratos por comida (ajustando según actividad física) y 1-2 pulgares de grasas saludables por comida. Las necesidades individuales varían según edad, peso, actividad y objetivos; consulta a un dietista-nutricionista para una pauta personalizada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El método de porciones con la mano es útil para perder peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puede ser una herramienta de apoyo para controlar el volumen de comida sin obsesionarse con las calorías exactas. Varios estudios de nutrición conductual sugieren que medir porciones con la mano ayuda a reducir el tamaño de las raciones de forma sostenible. Sin embargo, para pérdida de peso, también influyen la calidad de los alimentos, el patrón de comidas y otros hábitos de vida.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Macronutrientes - Proteínas, Carbohidratos y Grasas | meskeIA',
  description: 'Calcula tus macros diarios según tu objetivo: volumen, definición o mantenimiento. Proteínas, carbohidratos y grasas personalizados para tu peso y actividad.',
  keywords: 'calculadora macros, macronutrientes, proteínas, carbohidratos, grasas, dieta, nutrición, volumen, definición, fitness, culturismo, musculación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Macronutrientes - Proteínas, Carbohidratos y Grasas',
    description: 'Calcula tus macros diarios según tu objetivo: volumen, definición o mantenimiento.',
    url: 'https://meskeia.com/calculadora-macros/',
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
    title: 'Calculadora de Macronutrientes',
    description: 'Calcula proteínas, carbohidratos y grasas según tu objetivo fitness.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Macros meskeIA',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los macronutrientes y cuáles son los tres principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los macronutrientes son los nutrientes que el cuerpo necesita en grandes cantidades para obtener energía y construir tejidos. Los tres principales son: proteínas (4 kcal/g), que forman y reparan tejidos musculares; carbohidratos (4 kcal/g), fuente principal de energía; y grasas (9 kcal/g), necesarias para funciones hormonales, absorción de vitaminas y reserva energética.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas proteínas necesito al día para ganar músculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para hipertrofia muscular, la evidencia científica actual apunta a un consumo de 1,6 a 2,2 g de proteína por kg de peso corporal al día como rango óptimo para la mayoría de personas que entrenan. Por encima de 2,2 g/kg no se han demostrado beneficios adicionales en la mayoría de estudios. Para mantenimiento sin objetivo de hipertrofia, la OMS recomienda 0,8 g/kg como mínimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos carbohidratos debo comer para perder peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe una cantidad universal. Una dieta moderada en carbohidratos (40-45% de las calorías totales) con un déficit calórico suele funcionar bien para la mayoría de personas. Las dietas bajas en carbohidratos pueden ser eficaces a corto plazo pero su superioridad a largo plazo frente a otras dietas con el mismo déficit calórico es limitada según la evidencia actual. Lo más importante para perder peso es el déficit calórico total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el gasto calórico total diario (TDEE)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TDEE (Total Daily Energy Expenditure) se calcula multiplicando el metabolismo basal por un factor de actividad. La fórmula Mifflin-St Jeor para el metabolismo basal: hombres = 10×peso(kg) + 6,25×altura(cm) − 5×edad + 5; mujeres = mismo cálculo −161. El factor de actividad oscila entre 1,2 (sedentario) y 1,9 (atleta). El TDEE resultante es la ingesta calórica de mantenimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ratio de macros se recomienda para ganar músculo minimizando la ganancia de grasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hasta el 18/11/2026 daba «proteínas 30-35 %… grasas 20-25 %» con un ejemplo que no cuadraba
        // (hallazgo 5035); hasta el 19/11/2026, el reparto fijo 25/50/25 que la app ya no usa (hallazgo
        // 5034). Ejemplo: 1,8 × 75 = 135 g (540 kcal); grasa 20 % de 3.100 = 620 kcal → 68,9 g (más
        // que 0,8 × 75 = 60 g); carbohidratos 3.100 − 540 − 620 = 1.940 kcal → 485 g.
        text: 'Esta calculadora, en volumen, suma 400 kcal a tu gasto diario (TDEE), fija primero la proteína en 1,8 g por kilo de peso corporal (el punto medio del rango de 1,6 a 2,0 g/kg), da a la grasa al menos el 20 % de las calorías y asigna el resto a los carbohidratos. Por ejemplo, una persona de 75 kg con un TDEE de 2.700 kcal tiene un objetivo de 3.100 kcal: 135 g de proteínas (540 kcal), unos 69 g de grasas (620 kcal) y 485 g de carbohidratos (1.940 kcal). Los números exactos varían según la respuesta individual y el tipo de entrenamiento.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Macros",
  description: "Calcula tus macros diarios según tu objetivo: volumen, definición o mantenimiento. Proteínas, carbohidratos y grasas personalizados para tu peso y actividad.",
  url: "https://meskeia.com/calculadora-macros/",
  category: 'UtilityApplication',
  features: [
    'Metabolismo basal con la fórmula Mifflin-St Jeor según sexo, peso, altura y edad',
    'Gasto energético diario (TDEE) con cinco niveles de actividad, de 1,2 a 1,9',
    'Calorías objetivo para definición (−500 kcal), mantenimiento o volumen (+400 kcal)',
    'Proteínas, carbohidratos y grasas en gramos, kcal y gramos por kg de peso',
    'Gráfico de anillo con el reparto de macronutrientes',
    'Fórmula desarrollada con tus datos para comprobar el cálculo',
  ],
});

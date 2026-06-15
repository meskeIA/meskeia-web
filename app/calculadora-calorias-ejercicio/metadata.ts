import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Calorías Quemadas por Ejercicio | meskeIA',
  description: 'Calcula las calorías quemadas según tu actividad física. Usa valores MET científicos para correr, nadar, ciclismo, caminar y más de 30 ejercicios.',
  keywords: 'calorias quemadas, calculadora ejercicio, MET, actividad fisica, deporte, quemar calorias, running, natacion, ciclismo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Calorías Quemadas por Ejercicio',
    description: 'Calcula las calorías quemadas según tu actividad física con valores MET científicos.',
    url: 'https://meskeia.com/calculadora-calorias-ejercicio/',
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
    title: 'Calculadora de Calorías Quemadas por Ejercicio',
    description: 'Calcula las calorías quemadas según tu actividad física.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Calorías Quemadas por Ejercicio",
  description: "Calcula las calorías quemadas según tu actividad física. Usa valores MET científicos para correr, nadar, ciclismo, caminar y más de 30 ejercicios.",
  url: 'https://meskeia.com/calculadora-calorias-ejercicio/',
  category: 'EducationalApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los valores MET y cómo se usan para calcular calorías quemadas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MET (Equivalente Metabólico de la Tarea) es la medida de la intensidad de una actividad en relación al metabolismo en reposo. Un MET equivale al gasto energético en reposo, aproximadamente 1 kcal/kg/hora. Caminar a ritmo moderado tiene MET 3,5; correr a 8 km/h tiene MET 8; nadar tiene MET 6. La fórmula de cálculo es: calorías = MET × peso corporal (kg) × duración (horas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas calorías se queman corriendo 30 minutos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del peso corporal y la velocidad. Una persona de 70 kg corriendo a 8 km/h (MET ≈ 8) quema aproximadamente 280 kcal en 30 minutos. A 10 km/h (MET ≈ 10) quemaría unas 350 kcal. El peso corporal tiene un impacto importante: una persona de 90 kg quema aproximadamente un 29% más que una de 70 kg con el mismo ejercicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas calorías quema caminar 1 hora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Caminar a paso moderado (5 km/h, MET 3,5) durante 1 hora: una persona de 70 kg quema aproximadamente 245 kcal; de 60 kg, unas 210 kcal; de 90 kg, unas 315 kcal. Aumentar la velocidad o caminar en pendiente eleva el MET y el gasto calórico. Caminar 10.000 pasos equivale aproximadamente a 60-90 minutos de caminata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es preciso el cálculo de calorías quemadas con ejercicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los valores MET son promedios basados en estudios de fisiología del ejercicio y tienen una variabilidad del ±15-20% según la persona. La condición física, la temperatura, la hidratación y la eficiencia mecánica individual influyen en el gasto real. Los monitores de frecuencia cardíaca ofrecen una estimación más personalizada. Los valores de la calculadora son orientativos para planificar la actividad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto ejercicio es necesario para quemar 500 kcal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para una persona de 70 kg: correr a 8 km/h requiere unos 53 minutos; ciclismo a ritmo moderado (MET 6) unos 71 minutos; natación a ritmo vigoroso (MET 8) unos 53 minutos; caminar a 5 km/h requiere aproximadamente 2 horas. Las actividades cardiovasculares de alta intensidad son las más eficientes en tiempo para quemar calorías.',
      },
    },
  ],
};

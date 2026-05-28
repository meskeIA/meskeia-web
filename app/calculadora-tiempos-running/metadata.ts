import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Predictor de Tiempos de Running | meskeIA',
  description: 'Predice tu tiempo en cualquier distancia de running con la fórmula Riegel. Calcula estimaciones para 5K, 10K, media maratón y maratón.',
  keywords: ['predictor running', 'tiempo running', 'fórmula Riegel', 'calculadora running', 'maratón tiempo estimado'],
  openGraph: {
    title: 'Predictor de Tiempos de Running',
    description: 'Predice tu tiempo en cualquier distancia con la fórmula Riegel.',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Predictor de Tiempos de Running',
  description: 'Predictor de tiempos de running con fórmula Riegel. Estima tu tiempo en 5K, 10K, media maratón y maratón a partir de cualquier distancia de referencia.',
  url: 'https://meskeia.com/calculadora-tiempos-running/',
  category: 'UtilityApplication',
  features: [
    'Fórmula Riegel para predicción de tiempos',
    'Predicciones para 5K, 10K, media maratón y maratón',
    'Cálculo de pace y velocidad',
    'Compatible con cualquier distancia de referencia',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la fórmula Riegel para predecir tiempos de running?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula Riegel, desarrollada por el científico Pete Riegel en 1977, predice el tiempo en una distancia desconocida a partir de un tiempo de referencia en otra distancia. La ecuación es T2 = T1 × (D2/D1)^1,06, donde el exponente 1,06 refleja el incremento de fatiga a medida que aumenta la distancia. Es la base matemática más utilizada en calculadoras de running y planes de entrenamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué precisión predice la fórmula Riegel el tiempo de maratón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula Riegel es bastante precisa para corredores con base aeróbica equilibrada y entrenamiento específico de la distancia objetivo. Para corredores que han entrenado adecuadamente para la maratón, el margen de error suele estar entre 5 y 15 minutos. Los resultados son menos fiables si el tiempo de referencia proviene de una distancia muy corta (menos de 5K), si el corredor tiene mucha más experiencia en sprints que en fondo, o si las condiciones de carrera difieren mucho (calor extremo, desnivel).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el ritmo o pace necesario para hacer una maratón en menos de 4 horas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para terminar una maratón (42,195 km) en menos de 4 horas, el pace objetivo es inferior a 5:41 min/km (o 8:59 min/milla). Esto equivale a una velocidad media superior a 10,55 km/h durante los 42 km. Como referencia, un tiempo de 10K de alrededor de 52-53 minutos suele ser indicativo de que se puede completar una maratón en torno a las 4 horas, según la fórmula Riegel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un predictor de tiempos de un plan de entrenamiento de running?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un predictor de tiempos estima cuál sería tu resultado en una distancia objetivo basándose en tu rendimiento actual; es una herramienta de orientación y establecimiento de metas. Un plan de entrenamiento indica qué sesiones, volumen y ritmos debes seguir durante semanas o meses para alcanzar ese objetivo. Ambas herramientas son complementarias: el predictor ayuda a fijar el tiempo meta, y el plan estructura el trabajo necesario para lograrlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué distancia de referencia da mejores predicciones con la fórmula Riegel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula Riegel funciona mejor cuando la distancia de referencia no está demasiado alejada de la distancia objetivo. Para predecir un maratón, el 10K o la media maratón ofrecen mejores resultados que un 5K. Para predecir un 5K, usar el 3K o el 10K es más fiable que el 1K. En general, las predicciones son más exactas cuando la distancia objetivo es menos de 5 veces la distancia de referencia.',
      },
    },
  ],
};

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

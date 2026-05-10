import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Cinética Química: Ecuación de Arrhenius | meskeIA',
  description: 'Visualiza cómo la temperatura acelera exponencialmente las reacciones químicas. Distribución de Maxwell-Boltzmann, energía de activación y constante k(T) en directo.',
  keywords: 'cinética química, ecuación de Arrhenius, energía de activación, Maxwell-Boltzmann, constante de velocidad, catalizador, temperatura, reacción química, EBAU, Bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-cinetica-arrhenius/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Cinética Química: Arrhenius | meskeIA',
    description: 'Mueve la temperatura y observa cómo la cola reactiva de la distribución de Maxwell-Boltzmann crece exponencialmente.',
    url: 'https://meskeia.com/simulador-cinetica-arrhenius/',
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
    title: 'Simulador de Cinética Química: Arrhenius | meskeIA',
    description: 'La regla del +10 °C, la barrera de activación y la magia de los catalizadores, todo visual.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Cinética Química: Ecuación de Arrhenius',
  description: 'Simulador interactivo de la cinética de reacciones químicas según la ecuación de Arrhenius k = A·exp(-Ea/RT). Visualiza la distribución de energías moleculares de Maxwell-Boltzmann a una temperatura T y la barrera de activación Ea: el área bajo la cola a la derecha de Ea es la fracción de moléculas con energía suficiente para reaccionar. Permite comparar dos temperaturas, calcular el factor de aceleración k(T₂)/k(T₁), trazar la recta de Arrhenius (ln k vs 1/T) y partir de 5 reacciones reales predefinidas. Ideal para EBAU de Química, Bachillerato y primero de Universidad.',
  url: 'https://meskeia.com/simulador-cinetica-arrhenius/',
  category: 'EducationalApplication',
  features: [
    'Distribución de Maxwell-Boltzmann en directo, función de la temperatura',
    'Visualización de la barrera de activación Ea sobre la curva',
    'Cálculo de la constante k a la temperatura T',
    'Comparación entre dos temperaturas y factor de aceleración',
    'Recta de Arrhenius (ln k vs 1/T) — pendiente −Ea/R',
    '5 reacciones predefinidas con valores de Ea reales',
    'Tiempo de vida media para reacciones de primer orden',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['cinética química', 'Arrhenius', 'energía activación', 'Maxwell-Boltzmann', 'EBAU', 'Bachillerato', 'química'],
});

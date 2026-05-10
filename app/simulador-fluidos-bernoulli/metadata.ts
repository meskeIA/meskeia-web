import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Fluidos: Ecuación de Bernoulli | meskeIA',
  description: 'Visualiza cómo la presión cae cuando un fluido se acelera en un estrechamiento (efecto Venturi). Tubería con manómetros, partículas animadas y ecuación de Bernoulli en directo.',
  keywords: 'ecuación de Bernoulli, mecánica de fluidos, efecto Venturi, presión dinámica, continuidad, caudal, Hidrodinámica, hidrostática, EBAU, Bachillerato, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-fluidos-bernoulli/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Fluidos: Bernoulli y Venturi | meskeIA',
    description: 'Aceleración + caída de presión: la paradoja que explica los aviones, los venturímetros y las arterias.',
    url: 'https://meskeia.com/simulador-fluidos-bernoulli/',
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
    title: 'Simulador de Fluidos: Bernoulli | meskeIA',
    description: 'Tubería Venturi animada con manómetros: visualiza cómo más velocidad implica menos presión.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Fluidos: Ecuación de Bernoulli',
  description: 'Simulador interactivo del flujo de fluidos ideales según la ecuación de Bernoulli (P + ½ρv² + ρgh = constante). Selecciona entre 3 geometrías (tubería Venturi horizontal, tubería con desnivel, vena con estenosis), ajusta caudal Q, densidad ρ, ratio de estrechamiento y altura, y observa partículas animadas fluyendo, manómetros midiendo presión local y vectores de velocidad. Aplica la ecuación de continuidad (A·v = constante) y Bernoulli para calcular v y P en cada sección. Ideal para EBAU de Física, Bachillerato, biofísica y primero de Universidad.',
  url: 'https://meskeia.com/simulador-fluidos-bernoulli/',
  category: 'EducationalApplication',
  features: [
    'Tubería interactiva con 3 geometrías predefinidas',
    'Animación de partículas fluyendo a velocidad real',
    'Manómetros mostrando presión local en cada sección',
    'Aplicación automática de continuidad (A·v = cte) y Bernoulli',
    'Sliders para caudal, densidad, ratio de estrechamiento y altura',
    'Cálculo de velocidad, presión y verificación de la conservación',
    'Comparación con líquidos reales (agua, aceite, sangre, aire)',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['ecuación de Bernoulli', 'fluidos', 'efecto Venturi', 'presión', 'caudal', 'EBAU', 'Bachillerato', 'física'],
});

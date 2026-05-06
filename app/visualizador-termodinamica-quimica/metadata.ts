import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Termodinámica Química - Energía Libre de Gibbs y Equilibrio | meskeIA',
  description: 'Visualiza cuándo y por qué ocurren espontáneamente las reacciones químicas. ΔG, entalpía, entropía, equilibrio químico y principio de Le Chatelier con diagramas interactivos.',
  keywords: 'termodinámica química, energía libre de Gibbs, entalpía, entropía, equilibrio químico, Le Chatelier, espontaneidad reacciones, constante equilibrio, proceso Haber-Bosch',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Termodinámica Química - ΔG, Equilibrio y Le Chatelier',
    description: 'Visualizador interactivo: perfil de entalpía, calculadora de Gibbs, equilibrio Kₑq y principio de Le Chatelier con animaciones.',
    url: 'https://meskeia.com/visualizador-termodinamica-quimica',
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
    title: 'Termodinámica Química - Explicador Visual',
    description: 'ΔG = ΔH - TΔS: cuándo y por qué las reacciones son espontáneas. Con Le Chatelier y equilibrio Kₑq.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Termodinámica Química meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Termodinámica Química - Energía Libre de Gibbs y Equilibrio',
  description: 'Visualizador interactivo de termodinámica química: diagrama de entalpía con catalizadores, calculadora ΔG con sliders, equilibrio Kₑq y simulador del principio de Le Chatelier para la síntesis de amoniaco.',
  url: 'https://meskeia.com/visualizador-termodinamica-quimica/',
  category: 'EducationalApplication',
  features: [
    'Diagrama de entalpía interactivo con ejemplos reales (metano, fotosíntesis, Haber)',
    'Slider de catalizador: reduce Ea sin cambiar ΔH',
    'Calculadora ΔG = ΔH - TΔS con sliders y código de color en tiempo real',
    'Tabla de los 4 casos de signo de ΔH y ΔS',
    'Simulador de equilibrio Kₑq con visualización de concentraciones',
    'Principio de Le Chatelier para síntesis de amoniaco Haber-Bosch',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

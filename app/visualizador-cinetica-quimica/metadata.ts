import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cinética Química - Velocidad de Reacciones y Arrhenius | meskeIA',
  description: 'Visualiza qué controla la velocidad de las reacciones químicas. Energía de activación, ecuación de Arrhenius, órdenes de reacción y catalizadores con gráficos SVG interactivos.',
  keywords: 'cinética química, energía de activación, ecuación de Arrhenius, órdenes de reacción, catalizadores, vida media reacción, perfil de energía, estado de transición, velocidad reacción, Haber-Bosch',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cinética Química - Energía de Activación, Arrhenius y Órdenes de Reacción',
    description: 'Visualizador interactivo: perfil de energía con catalizador, gráfico de Arrhenius, órdenes de reacción 0/1/2 y factores que afectan la velocidad de reacción.',
    url: 'https://meskeia.com/visualizador-cinetica-quimica',
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
    title: 'Cinética Química - Explicador Visual',
    description: 'k = A·e^(-Ea/RT): por qué algunos procesos termodinámicamente favorables no ocurren a temperatura ambiente. Con Arrhenius y órdenes de reacción.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cinética Química meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cinética Química - Velocidad de Reacciones y Ecuación de Arrhenius',
  description: 'Visualizador interactivo de cinética química: perfil de energía potencial con slider de Ea y toggle de catalizador, calculadora visual de Arrhenius con gráfico ln(k) vs 1/T, comparativa de órdenes de reacción 0/1/2 y cards interactivas de factores que afectan la velocidad.',
  url: 'https://meskeia.com/visualizador-cinetica-quimica/',
  category: 'EducationalApplication',
  features: [
    'Perfil SVG interactivo de energía potencial con slider de Ea (50–250 kJ/mol)',
    'Toggle catalizador ON/OFF: segunda curva con Ea reducida',
    'Ejemplos preconfigurados: H₂/Pt, H₂O₂/MnO₂, NH₃ Haber-Bosch',
    'Calculadora visual de Arrhenius k = A·e^(-Ea/RT) con sliders de Ea y T',
    'Gráfico de Arrhenius: ln(k) vs 1/T (linealización)',
    'Comparativa de órdenes 0, 1 y 2: curvas [A] vs tiempo con ecuaciones integradas',
    'Calculadora de vida media t₁/₂ para cada orden',
    'Cards interactivas: temperatura, concentración, catalizadores, superficie, luz',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});

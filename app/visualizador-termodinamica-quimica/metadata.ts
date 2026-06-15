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
    url: 'https://meskeia.com/visualizador-termodinamica-quimica/',
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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la energía libre de Gibbs y cuándo indica que una reacción es espontánea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía libre de Gibbs (ΔG) mide la energía disponible para realizar trabajo útil en una reacción a presión constante. La fórmula es ΔG = ΔH − TΔS, donde ΔH es la variación de entalpía, T la temperatura absoluta y ΔS la variación de entropía. Si ΔG < 0, la reacción es espontánea (exergónica); si ΔG > 0, no es espontánea en esa dirección. A ΔG = 0 el sistema está en equilibrio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el principio de Le Chatelier en la síntesis de amoniaco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El principio de Le Chatelier establece que si un sistema en equilibrio sufre una perturbación (cambio de temperatura, presión o concentración), se desplaza para contrarrestarla. En el proceso Haber-Bosch (N₂ + 3H₂ ⇌ 2NH₃), aumentar la presión favorece el lado con menos moles de gas (productos), mientras que bajar la temperatura favorece la reacción exotérmica. Sin embargo, temperaturas demasiado bajas hacen la reacción tan lenta que se usa un catalizador de hierro para acelerar el proceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juega un catalizador en la termodinámica de una reacción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un catalizador reduce la energía de activación (Ea), es decir, la barrera energética que los reactivos deben superar para transformarse en productos. Esto acelera tanto la reacción directa como la inversa por igual, de modo que el catalizador no cambia ΔH ni la posición del equilibrio (Kₑq), solo permite llegar al equilibrio más rápidamente. El diagrama de entalpía interactivo permite ver visualmente cómo cambia la barrera con y sin catalizador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este visualizador de termodinámica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a estudiantes de bachillerato y universidad que cursen química general, fisicoquímica o termodinámica. Resulta especialmente útil para entender de forma visual conceptos abstractos como ΔG, ΔS o Kₑq, que suelen resultar difíciles solo con ecuaciones. No requiere instalación ni registro, y funciona completamente en el navegador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una reacción exotérmica y una espontánea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una reacción exotérmica (ΔH < 0) libera calor, pero eso no garantiza que sea espontánea. La espontaneidad la determina ΔG, que también depende de la entropía (ΔS) y la temperatura. Por ejemplo, hay reacciones endotérmicas (ΔH > 0) que son espontáneas a temperatura elevada porque el término −TΔS es muy negativo. La tabla de los cuatro casos ΔH/ΔS del visualizador resume cuándo cada combinación produce o no espontaneidad.',
      },
    },
  ],
};

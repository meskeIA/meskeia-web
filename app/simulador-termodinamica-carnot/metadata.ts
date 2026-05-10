import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Ciclo de Carnot: Diagrama PV y Eficiencia | meskeIA',
  description: 'Visualiza el ciclo de Carnot ideal en un diagrama presión-volumen. 2 isotermas + 2 adiabáticas. Eficiencia η = 1 - Tf/Tc. La 2.ª ley de la termodinámica al alcance.',
  keywords: 'ciclo de Carnot, diagrama PV, eficiencia térmica, segunda ley termodinámica, isoterma, adiabática, máquina térmica, EBAU, Bachillerato, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-termodinamica-carnot/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Ciclo de Carnot | meskeIA',
    description: 'El motor ideal: 2 isotermas + 2 adiabáticas. Eficiencia máxima posible entre dos focos térmicos.',
    url: 'https://meskeia.com/simulador-termodinamica-carnot/',
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
    title: 'Simulador del Ciclo de Carnot | meskeIA',
    description: 'Diagrama PV interactivo del ciclo de Carnot. Sliders Tc, Tf, eficiencia visualizada.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Ciclo de Carnot',
  description: 'Simulador interactivo del ciclo de Carnot, el motor térmico ideal compuesto por dos isotermas y dos adiabáticas. Permite ajustar las temperaturas del foco caliente Tc y del foco frío Tf, el volumen inicial V1 y el ratio de compresión, y muestra el ciclo trazado en un diagrama PV con las cuatro etapas en colores distintos. Calcula la eficiencia η = 1 − Tf/Tc, los calores absorbido y cedido, y el trabajo neto producido. Incluye animación de un punto recorriendo el ciclo y comparación con motores reales (gasolina, diesel, central térmica). Ideal para EBAU de Física, Bachillerato y termodinámica universitaria.',
  url: 'https://meskeia.com/simulador-termodinamica-carnot/',
  category: 'EducationalApplication',
  features: [
    'Diagrama PV con el ciclo de Carnot trazado en 4 colores',
    'Animación de un punto recorriendo el ciclo',
    'Sliders interactivos para Tc, Tf, V1 y ratio de compresión',
    'Cálculo automático de eficiencia η = 1 − Tf/Tc',
    'Cálculo de calor absorbido (Qc), calor cedido (Qf) y trabajo (W)',
    'Comparación con motores reales (gasolina, diesel, central térmica)',
    'Visualización del área del ciclo (= trabajo neto)',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['ciclo de Carnot', 'eficiencia térmica', '2.ª ley termodinámica', 'EBAU', 'Bachillerato', 'física'],
});

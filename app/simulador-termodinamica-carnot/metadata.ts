import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Ciclo de Carnot: Diagrama PV y Eficiencia | meskeIA',
  description: 'Visualiza el ciclo de Carnot ideal en un diagrama presión-volumen. 2 isotermas + 2 adiabáticas. Eficiencia η = 1 - Tf/Tc. La 2.ª ley de la termodinámica al alcance.',
  keywords: 'ciclo de Carnot, diagrama PV, eficiencia térmica, segunda ley termodinámica, isoterma, adiabática, máquina térmica, EBAU, Bachillerato, preparatoria, secundaria, física',
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
  description: 'Simulador interactivo del ciclo de Carnot, el motor térmico ideal compuesto por dos isotermas y dos adiabáticas. Permite ajustar las temperaturas del foco caliente Tc y del foco frío Tf, el volumen inicial V1 y el ratio de compresión, y muestra el ciclo trazado en un diagrama PV con las cuatro etapas en colores distintos. Calcula la eficiencia η = 1 − Tf/Tc, los calores absorbido y cedido, y el trabajo neto producido. Incluye animación de un punto recorriendo el ciclo y comparación con motores reales (gasolina, diesel, central térmica). Ideal para Física de Bachillerato y EBAU (España), preparatoria y secundaria (Latinoamérica), y termodinámica universitaria.',
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
  ],
  keywords: ['ciclo de Carnot', 'eficiencia térmica', '2.ª ley termodinámica', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo de Carnot y por qué es importante en termodinámica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo de Carnot es un ciclo termodinámico teórico ideal compuesto por dos procesos isotérmicos (a temperatura constante) y dos adiabáticos (sin intercambio de calor). Fue descrito por Sadi Carnot en 1824 y es fundamental porque establece el límite superior de eficiencia que puede tener cualquier motor térmico que opere entre un foco caliente a temperatura Tc y un foco frío a Tf. Ningún motor real puede superar la eficiencia de Carnot η = 1 − Tf/Tc.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la eficiencia del ciclo de Carnot?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La eficiencia del ciclo de Carnot es η = 1 − Tf/Tc, donde Tc es la temperatura del foco caliente y Tf la del foco frío, ambas en kelvin (K = °C + 273,15). Por ejemplo, un motor entre 500 K (227 °C) y 300 K (27 °C) tiene una eficiencia máxima de 1 − 300/500 = 40 %. Para aumentar la eficiencia se puede elevar Tc o reducir Tf, pero en la práctica los materiales y el entorno ponen límites. Los motores de gasolina reales alcanzan un 25-35 %, mucho menos que el límite teórico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tiene el ciclo de Carnot con la segunda ley de la termodinámica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo de Carnot es la demostración más clara de la segunda ley de la termodinámica, que establece que es imposible construir un motor que convierta completamente el calor en trabajo (eficiencia 100 %). La eficiencia de Carnot siempre es inferior a 1 siempre que Tf > 0 K (temperatura absoluta nula), lo que implicaría un foco frío a −273,15 °C, físicamente inalcanzable. En términos de entropía, el ciclo de Carnot es el único ciclo reversible: la entropía del universo no cambia durante su funcionamiento ideal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el ciclo de Carnot y un motor de gasolina o diesel real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un motor real se diferencia en tres aspectos clave. Primero, los procesos reales son irreversibles (fricción, turbulencias, pérdidas de calor), por lo que la eficiencia real siempre es menor que la de Carnot. Segundo, los motores de gasolina siguen el ciclo Otto (combustión a volumen constante, eficiencia teórica ~57 % para relación de compresión 10:1) y los diesel el ciclo Diesel, distintos del ciclo de Carnot. Tercero, los materiales limitan la temperatura máxima alcanzable. La eficiencia real de un motor de gasolina moderno ronda el 25-35 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué representa el área encerrada en el diagrama PV del ciclo de Carnot?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un diagrama presión-volumen (PV), el área encerrada dentro del ciclo de Carnot es exactamente igual al trabajo neto W producido por el motor en un ciclo completo. Cuanto mayor sea esa área, más trabajo útil entrega el motor por cada ciclo. El ciclo se recorre en sentido horario para una máquina que produce trabajo (motor): el trabajo de expansión (curvas hacia la derecha) supera al trabajo de compresión (curvas hacia la izquierda) en una cantidad igual a W = Qc − Qf.',
      },
    },
  ],
};

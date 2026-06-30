import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Disoluciones: Molaridad, Concentración y Dilución | meskeIA',
  description:
    'Prepara disoluciones y calcula su concentración en tiempo real: ajusta la masa de soluto y el volumen y observa cómo cambian la molaridad, g/L, % m/v y ppm, con el color del vaso variando según la concentración. Incluye el modo dilución (C₁·V₁ = C₂·V₂) con factor de dilución.',
  keywords:
    'disoluciones, molaridad, concentración, dilución, C1V1 C2V2, g/L, ppm, porcentaje masa volumen, mol, masa molar, química disoluciones, preparar disolución, factor de dilución, ley de Beer, estudiantes, FP, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-disoluciones/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Disoluciones: Molaridad y Dilución | meskeIA',
    description: 'Ajusta soluto y volumen y mira cómo cambian molaridad, g/L, ppm y el color de la disolución',
    url: 'https://meskeia.com/simulador-disoluciones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Disoluciones: Molaridad y Dilución | meskeIA',
    description: 'Prepara y diluye disoluciones viendo la concentración y el color en tiempo real',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Disoluciones (Molaridad y Dilución)',
  description:
    'Simulador interactivo de disoluciones químicas. Permite preparar una disolución ajustando la masa de soluto y el volumen de disolvente y ver en tiempo real la molaridad, los gramos por litro, el porcentaje masa/volumen y las ppm, con el color del vaso variando según la concentración. Incluye un modo de dilución basado en C₁·V₁ = C₂·V₂ que calcula el volumen de disolución madre y el disolvente a añadir.',
  url: 'https://meskeia.com/simulador-disoluciones/',
  category: 'EducationalApplication',
  features: [
    'Preparar disolución con solutos reales (KMnO₄, CuSO₄, NaCl…) o personalizado',
    'Molaridad, g/L, % m/v y ppm calculados en vivo',
    'Color del vaso proporcional a la concentración',
    'Modo dilución con C₁·V₁ = C₂·V₂ y factor de dilución',
    'Masa molar de cada soluto y conversión masa ↔ moles',
    'En español',
  ],
  keywords: ['disoluciones', 'molaridad', 'concentración', 'dilución', 'química'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la molaridad y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La molaridad (M) es la concentración expresada como moles de soluto por litro de disolución: M = moles de soluto / litros de disolución. Para obtener los moles se divide la masa del soluto entre su masa molar (moles = gramos / masa molar). Por ejemplo, 58,44 g de sal común (NaCl, masa molar 58,44 g/mol) en 1 litro dan 1 mol/L, es decir una disolución 1 M.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se prepara una disolución de una concentración concreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se calcula la masa de soluto necesaria (masa = molaridad × volumen en litros × masa molar), se pesa esa cantidad, se disuelve en algo menos del volumen final y luego se enrasa con disolvente hasta el volumen deseado en un matraz aforado. Es importante enrasar al final y no antes, porque el volumen puede cambiar al disolver el soluto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una dilución y qué significa C₁·V₁ = C₂·V₂?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diluir es bajar la concentración de una disolución añadiéndole más disolvente; como la cantidad de soluto no cambia, los moles se conservan y se cumple C₁·V₁ = C₂·V₂, donde C₁ y V₁ son la concentración y el volumen de la disolución madre, y C₂ y V₂ los de la disolución final. Para preparar un volumen V₂ de concentración C₂ se toma un volumen V₁ = C₂·V₂/C₁ de la disolución madre y se completa con disolvente hasta V₂.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencian molaridad, g/L, % m/v y ppm?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son distintas formas de expresar la concentración. La molaridad cuenta partículas (moles por litro). Los g/L y el % masa/volumen (gramos por 100 mL) cuentan masa por volumen, útil cuando no importan los moles. Las ppm (partes por millón, aproximadamente mg por litro en disoluciones acuosas diluidas) se usan para concentraciones muy bajas, como contaminantes o cloro en el agua. Todas miden lo mismo desde ángulos distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué cambia el color de una disolución con la concentración?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuanto más concentrada está una disolución coloreada, más partículas de soluto hay por unidad de volumen y más luz absorben, por lo que el color se ve más intenso. Esa relación entre concentración y absorción de luz es la base de la ley de Beer-Lambert, que permite medir concentraciones por colorimetría. Solutos como el permanganato de potasio (violeta) o el sulfato de cobre (azul) lo muestran muy bien; otros como la sal o el azúcar son incoloros.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Digestión y Nutrientes — De la Comida a la Célula | meskeIA',
  description: 'Qué pasa con carbohidratos, proteínas y grasas tras comer: digestión bioquímica, micronutrientes esenciales y datos del metabolismo. Complemento al Viaje de tu Comida.',
  keywords: 'digestion, nutrientes, macronutrientes, carbohidratos, proteinas, grasas, vitaminas, minerales, metabolismo, aminoacidos, glucosa, acidos grasos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Digestión y Nutrientes — De la Comida a la Célula',
    description: 'Carbohidratos→glucosa, proteínas→aminoácidos, grasas→ácidos grasos. Visión bioquímica de la digestión con vitaminas, minerales y datos del metabolismo.',
    url: 'https://meskeia.com/visualizador-digestion-nutrientes/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digestión y Nutrientes — De la Comida a la Célula',
    description: 'Qué pasa con cada macronutriente tras comer. Visión bioquímica complementaria al sistema digestivo anatómico.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: { 'application-name': 'Digestión y Nutrientes meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Digestión y Nutrientes — De la Comida a la Célula',
  description: 'Explicador visual de la digestión bioquímica de macronutrientes y micronutrientes. Carbohidratos→glucosa→sangre, proteínas→aminoácidos→músculo, grasas→ácidos grasos→reserva. Vitaminas, minerales, metabolismo basal e índice glucémico.',
  url: 'https://meskeia.com/visualizador-digestion-nutrientes/',
  category: 'EducationalApplication',
  features: [
    'Los 3 macronutrientes: composición, calorías y funciones',
    'Digestión paso a paso de cada macronutriente con enzimas',
    'Micronutrientes: vitaminas y minerales esenciales',
    'Datos del metabolismo: basal, índice glucémico, fibra, agua',
    'Comparativa visual de calorías por gramo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se digieren los carbohidratos en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los carbohidratos complejos se rompen en glucosa mediante enzimas: la amilasa salival inicia la digestión en la boca y la amilasa pancreática la completa en el intestino delgado. La glucosa pasa al torrente sanguíneo elevando la glucemia, lo que estimula al páncreas a secretar insulina para que las células la absorban y usen como energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre proteínas completas e incompletas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las proteínas completas contienen los 9 aminoácidos esenciales que el organismo no puede sintetizar por sí solo. Se encuentran principalmente en alimentos de origen animal (carne, huevo, pescado, lácteos) y en algunas fuentes vegetales como la soja y la quinoa. Las proteínas incompletas, presentes en legumbres y cereales por separado, carecen de algún aminoácido esencial pero pueden complementarse combinando distintos alimentos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas calorías aporta cada macronutriente por gramo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los carbohidratos aportan 4 kcal por gramo, las proteínas también 4 kcal por gramo, y las grasas 9 kcal por gramo, más del doble. El alcohol aporta 7 kcal por gramo sin valor nutricional. Estos valores son los factores de Atwater y permiten calcular el aporte energético de cualquier alimento a partir de su composición en la etiqueta nutricional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el índice glucémico y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice glucémico (IG) mide la velocidad con que un alimento eleva la glucosa en sangre en comparación con la glucosa pura (IG=100). Alimentos con IG alto (>70) producen picos de insulina rápidos; los de IG bajo (<55) elevan la glucemia de forma gradual. Este concepto es útil para personas con diabetes tipo 2 o resistencia a la insulina, aunque no refleja la cantidad total de carbohidratos consumida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las vitaminas esenciales y en qué alimentos se encuentran?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las 13 vitaminas esenciales se dividen en hidrosolubles (C y el complejo B) y liposolubles (A, D, E y K). La vitamina D se obtiene principalmente por exposición solar y alimentos grasos como el salmón. La B12 solo está en alimentos de origen animal o suplementos, siendo especialmente relevante en dietas vegetarianas. La vitamina C abunda en frutas y verduras frescas y es necesaria para la síntesis de colágeno.',
      },
    },
  ],
};

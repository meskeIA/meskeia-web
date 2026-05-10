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
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digestión y Nutrientes — De la Comida a la Célula',
    description: 'Qué pasa con cada macronutriente tras comer. Visión bioquímica complementaria al sistema digestivo anatómico.',
    images: ['https://meskeia.com/og-image.png']
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

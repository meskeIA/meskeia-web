import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Vitaminas y Minerales - Guía de 30 Nutrientes Esenciales | meskeIA',
  description: 'Guía completa de 30 vitaminas y minerales esenciales: funciones, fuentes alimentarias, dosis diaria recomendada, síntomas de deficiencia y exceso. Información nutricional fiable.',
  keywords: 'vitaminas, minerales, nutrientes, B12, vitamina D, hierro, calcio, magnesio, zinc, nutrición, deficiencia vitamínica, suplementos, CDR, dosis diaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Vitaminas y Minerales - Guía de 30 Nutrientes Esenciales',
    description: 'Guía de vitaminas y minerales: funciones, fuentes, dosis y síntomas de deficiencia. Información nutricional completa.',
    url: 'https://meskeia.com/vitaminas-minerales/',
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
    title: 'Vitaminas y Minerales - Guía Nutricional Completa',
    description: 'Todo sobre 30 nutrientes esenciales: vitaminas hidrosolubles, liposolubles y minerales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Vitaminas y Minerales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Vitaminas y Minerales - Guía de 30 Nutrientes Esenciales",
  description: "Guía completa de 30 vitaminas y minerales esenciales: funciones, fuentes alimentarias, dosis diaria recomendada, síntomas de deficiencia y exceso. Información nutricional fiable.",
  url: 'https://meskeia.com/vitaminas-minerales/',
  category: 'EducationalApplication',
  features: [
    'Fichas completas de 30 nutrientes esenciales (13 vitaminas y 17 minerales)',
    'Búsqueda por nombre, función o alimento fuente',
    'Filtro por tipo (vitamina/mineral) y subtipo (hidrosoluble, liposoluble, macromineral, oligoelemento)',
    'Valores CDR (Cantidad Diaria Recomendada) para adultos según referencias EFSA',
    'Síntomas de deficiencia y exceso para cada nutriente',
    'Grupos de riesgo específicos por nutriente',
    'Curiosidades y datos científicos verificados',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre vitaminas liposolubles e hidrosolubles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las vitaminas liposolubles (A, D, E y K) se disuelven en grasa, se absorben junto con lípidos de la dieta y pueden acumularse en el tejido adiposo y el hígado. Las hidrosolubles (vitamina C y las 8 del grupo B) se disuelven en agua, no se almacenan en cantidades significativas y el exceso se elimina por la orina, lo que hace menos probable la toxicidad por exceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué síntomas produce la deficiencia de vitamina D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deficiencia de vitamina D puede causar fatiga crónica, dolor óseo y muscular, mayor susceptibilidad a infecciones y, en casos prolongados, raquitismo en niños u osteomalacia en adultos. En España la prevalencia es alta porque, pese a la abundante luz solar, la exposición real es insuficiente en muchas personas durante los meses de invierno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué alimentos son más ricos en hierro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los alimentos con mayor contenido en hierro hemo (más absorbible) son las carnes rojas, el hígado y los mariscos como las almejas. En fuentes vegetales (hierro no hemo) destacan las legumbres, las espinacas y los frutos secos, aunque su absorción mejora consumiéndolos junto con vitamina C y empeora con café, té o lácteos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es necesario tomar suplementos de vitaminas si se lleva una dieta equilibrada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la mayoría de personas adultas con una dieta variada no son necesarios. Sin embargo, hay grupos con mayor riesgo de déficit: veganos (B12), mujeres embarazadas (ácido fólico, hierro), personas mayores (D, B12) y quienes tienen poca exposición solar (D). La suplementación debe basarse en una analítica y orientación profesional, no en autoprescripción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos nutrientes cubre esta guía y cómo está organizada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La guía recoge 30 nutrientes esenciales divididos en tres grupos: vitaminas hidrosolubles (C y grupo B), vitaminas liposolubles (A, D, E, K) y minerales clave (calcio, hierro, magnesio, zinc y otros). Para cada nutriente se muestran sus funciones principales, las mejores fuentes alimentarias, la dosis diaria de referencia y los síntomas de deficiencia y exceso.',
      },
    },
  ],
};

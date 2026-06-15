import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Frutos Secos y Semillas - Nutrición, beneficios y usos | meskeIA',
  description:
    'Guía de 30 frutos secos y semillas: almendra, nuez, pistacho, chía, lino, anacardo y más. Nutrición, conservación y usos culinarios.',
  keywords:
    'frutos secos, semillas, almendra nuez pistacho, chia lino sesamo, nutricion frutos secos, snacks saludables, omega-3, proteinas vegetales, conservacion frutos secos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Frutos Secos y Semillas | meskeIA',
    description:
      '30 frutos secos y semillas del mundo: nutrientes, calorías, beneficios, conservación y usos culinarios. Filtros por categoría, origen, perfil nutricional y nivel calórico.',
    url: 'https://meskeia.com/guia-frutos-secos/',
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
    title: 'Guía de Frutos Secos y Semillas | meskeIA',
    description:
      '30 frutos secos y semillas: nutrición, beneficios, conservación y usos culinarios. Filtros por categoría, origen y nivel calórico.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-frutos-secos/',
  },
  other: {
    'application-name': 'Guía de Frutos Secos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Frutos Secos y Semillas',
  description:
    'Guía educativa de 30 frutos secos y semillas: almendra, nuez, pistacho, avellana, anacardo, castaña, pacana, macadamia, nuez de Brasil, piñón, coco, cacahuete, pipas de girasol y calabaza, sésamo, chía, lino, cáñamo, amapola, mostaza, comino, hinojo, cardamomo, quinua, chufa, bellota, castaña de agua y más. Información nutricional completa, beneficios, conservación, usos culinarios y curiosidades.',
  url: 'https://meskeia.com/guia-frutos-secos/',
  features: [
    '30 frutos secos y semillas organizados en 4 categorías',
    'Buscador por nombre, nombre científico y país de origen',
    'Filtros por categoría (nuez, semilla, legumbre, drupa)',
    'Filtros por región de origen (Mediterráneo, América, Asia, África, Oceanía)',
    'Filtros por perfil nutricional (proteínas, omega-3, fibra, antioxidantes...)',
    'Filtros por nivel calórico (moderado, alto, muy alto)',
    'Información nutricional completa por 100 g',
    'Conservación y duración orientativa',
    'Usos culinarios y combinaciones',
    'Beneficios para la salud y curiosidades',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos frutos secos se pueden comer al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las guías de alimentación de referencia (como las de la OMS o la dieta mediterránea) sugieren un consumo orientativo de 30 g diarios de frutos secos sin sal añadida, equivalente a un puñado pequeño. Esta cantidad aporta grasas saludables, proteínas vegetales, fibra y micronutrientes sin un exceso calórico significativo. Los requerimientos concretos dependen del perfil de cada persona; consulta a un profesional sanitario para recomendaciones personalizadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué frutos secos tienen más proteínas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los frutos secos con mayor contenido proteico por 100 g destacan el cacahuete (~26 g, técnicamente una legumbre), las pipas de calabaza (~30 g), el cáñamo (~32 g) y el pistacho (~21 g). La almendra (~21 g) y el anacardo (~18 g) también son fuentes relevantes. Las semillas como chía (~17 g) y lino (~18 g) aportan proteína junto con omega-3, lo que las convierte en opciones interesantes para dietas vegetales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una nuez, un fruto seco y una semilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Botánicamente, una nuez es un fruto seco con cáscara dura que no se abre al madurar (bellota, avellana, castaña). Sin embargo, en el uso culinario habitual llamamos "frutos secos" a un grupo amplio que incluye nueces botánicas, drupas (almendra, anacardo, pistachos) y cacahuetes (legumbre). Las semillas son la parte reproductora de una planta: chía, lino, sésamo y pipas de girasol son semillas, no frutos. La guía separa estas categorías para que puedas filtrar con precisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo conservar los frutos secos para que no se pongan rancios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los frutos secos se oxidan y enrancian por exposición al calor, la luz y la humedad. Para una conservación óptima, guárdalos en recipientes herméticos en un lugar fresco y oscuro (despensa) donde duran 3-6 meses, o en el frigorífico (6-12 meses) o congelador (hasta 2 años). Las nueces y las semillas de lino son especialmente sensibles por su alto contenido en ácidos grasos omega-3; cómpralas en cantidades pequeñas y consúmelas pronto una vez abiertas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué semillas son ricas en omega-3?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las semillas de lino y de chía son las fuentes vegetales más ricas en ácido alfa-linolénico (ALA), un tipo de omega-3: el lino contiene unos 23 g de ALA por 100 g y la chía unos 18 g. Las semillas de cáñamo también aportan omega-3 en proporción favorable con omega-6. Para aprovechar el omega-3 del lino conviene molerlo justo antes de consumirlo, ya que la cáscara entera dificulta la absorción del nutriente.',
      },
    },
  ],
};

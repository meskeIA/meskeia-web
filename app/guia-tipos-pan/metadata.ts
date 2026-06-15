import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Tipos de Pan del Mundo | meskeIA',
  description: 'Guía de referencia de 35 tipos de pan: sourdough, baguette, naan, ciabatta, injera y más. Fermentación, harina, historia y maridaje.',
  keywords: 'tipos de pan, pan del mundo, sourdough, baguette, masa madre, pan artesanal, fermentación, tipos de harina, pan internacional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Tipos de Pan del Mundo | meskeIA',
    description: '35 tipos de pan del mundo: fermentación, harina, acompañamientos y curiosidades. Filtros por región y técnica.',
    url: 'https://meskeia.com/guia-tipos-pan/',
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
    title: 'Guía de Tipos de Pan del Mundo | meskeIA',
    description: '35 tipos de pan del mundo: sourdough, baguette, naan, injera y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Tipos de Pan meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Tipos de Pan del Mundo',
  description: 'Directorio de 35 tipos de pan del mundo con fichas de panadería: región, harina, fermentación, tiempo de fermentación, acompañamientos, usos y curiosidades. Filtros por región, harina, fermentación y textura.',
  url: 'https://meskeia.com/guia-tipos-pan/',
  features: [
    '35 tipos de pan con ficha completa',
    'Filtros por región, harina, fermentación y textura de miga',
    'Búsqueda por nombre, país o región',
    'Acompañamientos y usos recomendados',
    'Curiosidades históricas y culturales',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el pan de masa madre y el pan con levadura comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pan de masa madre (sourdough) se fermenta con una mezcla viva de bacterias lácticas y levaduras silvestres, lo que genera una miga más alveolada, una corteza crujiente y un sabor ligeramente ácido característico. La fermentación larga (12-24 horas) también mejora la digestibilidad del gluten. El pan con levadura comercial fermenta en 1-2 horas, resulta más uniforme y suave, pero con menos complejidad de sabor y menor durabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de harina se usa para hacer baguette francesa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La baguette francesa tradicional se elabora con harina de trigo blanca de fuerza media-baja (tipo T55 en Francia, equivalente a harina panificable estándar), agua, sal y levadura. La Décret Pain de 1993 establece que la baguette de tradition no puede contener aditivos. La hidratación alta (70-75%) y el formado alargado son responsables de su miga abierta y su corteza dorada y crujiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el injera y de dónde proviene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El injera es un pan plano esponjoso y ligeramente ácido originario de Etiopía y Eritrea, elaborado con harina de teff, un cereal sin gluten rico en hierro y calcio. Su fermentación natural de 2-3 días crea una textura porosa característica. Se sirve como base y utensilio comestible para los guisos locales (wot): se coloca en el plato y se usa para recoger los alimentos, funcionando como plato y cubierto a la vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los tipos de pan sin gluten más conocidos del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los panes sin gluten con tradición histórica destacan el injera etíope (teff), el tortilla de maíz mexicano (masa de maíz nixtamalizado), el roti de maíz de América del Sur y el tsampa tibetano (cebada tostada). En panadería moderna, los panes sin gluten se elaboran con mezclas de harina de arroz, maíz, tapioca o sorgo combinadas con agentes aglutinantes como la goma xantana para compensar la ausencia de gluten.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo conservar el pan artesanal para que dure más días?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pan artesanal de masa madre se conserva mejor envuelto en un paño de tela o en una bolsa de papel, a temperatura ambiente, durante 3-5 días. Evita las bolsas de plástico cerradas, que ablandan la corteza y aceleran el enmohecimiento. Si necesitas conservarlo más de 4 días, congélalo en rebanadas (dura hasta 3 meses) y tuestalo directamente desde el congelador. Nunca guardes pan artesanal en el frigorífico, pues el frío seco lo reseca.',
      },
    },
  ],
};

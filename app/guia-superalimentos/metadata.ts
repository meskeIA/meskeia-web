import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Superalimentos - Propiedades, usos y curiosidades | meskeIA',
  description: '40 superalimentos del mundo: nutrientes destacados, beneficios tradicionales, cómo consumirlos, cantidad orientativa y contraindicaciones. Frutas, algas, fermentados, hongos medicinales y más.',
  keywords: 'superalimentos, alimentos saludables, nutrientes, arándanos, spirulina, cúrcuma, quinoa, kéfir, moringa, reishi, fermentados, algas, semillas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Superalimentos | meskeIA',
    description: '40 superalimentos del mundo: propiedades, beneficios tradicionales, cómo consumirlos y curiosidades históricas.',
    url: 'https://meskeia.com/guia-superalimentos/',
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
    title: 'Guía de Superalimentos | meskeIA',
    description: '40 superalimentos: nutrientes, beneficios, cantidades orientativas y contraindicaciones. Con filtros por categoría.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: {
    'application-name': 'Guía de Superalimentos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Superalimentos',
  description: 'Guía educativa de 40 superalimentos del mundo: nutrientes destacados, beneficios tradicionales documentados, cómo consumirlos, cantidad orientativa, contraindicaciones y combinaciones. Incluye frutas y bayas, verduras y hojas, semillas y frutos secos, algas y mar, cereales ancestrales, fermentados, hongos medicinales y especias y raíces.',
  url: 'https://meskeia.com/guia-superalimentos/',
  features: [
    '40 superalimentos organizados en 8 categorías',
    'Buscador por nombre o descripción',
    'Filtros por categoría de superalimento',
    'Nutrientes destacados por alimento',
    'Cantidad orientativa de consumo diario',
    'Contraindicaciones e interacciones conocidas',
    'Combinaciones sinérgicas con otros alimentos',
    'Curiosidades históricas y científicas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un superalimento y qué lo diferencia de un alimento normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El término "superalimento" no tiene definición regulada ni reconocimiento oficial en nutrición clínica; es una denominación popular y de marketing que se aplica a alimentos con una densidad nutricional especialmente alta o con compuestos bioactivos estudiados. Lo que los distingue en la práctica es su concentración de micronutrientes, antioxidantes, ácidos grasos esenciales o fitoquímicos en comparación con su aporte calórico. Ningún alimento por sí solo garantiza beneficios de salud; lo relevante es el patrón dietético global.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La spirulina es realmente tan beneficiosa como dicen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La spirulina es una cianobacteria (alga azul-verde) con un perfil nutricional notable: entre un 55-70% de proteína completa, vitaminas del grupo B, hierro y antioxidantes como la ficocianina. Estudios preliminares sugieren efectos positivos sobre el colesterol y el estrés oxidativo, aunque la mayoría son de pequeño tamaño muestral. No sustituye a una dieta equilibrada, y en personas con fenilcetonuria o que toman anticoagulantes puede haber interacciones; conviene consultar con un profesional antes de suplementar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta cúrcuma hay que tomar al día para notar sus efectos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estudios sobre curcumina (el principal compuesto activo de la cúrcuma) suelen usar dosis de 500-2000 mg de curcumina al día, equivalente a varios gramos de especia. El problema es que la biodisponibilidad de la curcumina es muy baja; combinarla con pimienta negra (piperina) puede aumentar su absorción hasta un 2000%. En la cocina cotidiana, la dosis habitual (1-2 g de especia por plato) aporta sabor y cierta cantidad de antioxidantes, aunque los efectos antiinflamatorios clínicamente significativos requieren suplementos concentrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los alimentos fermentados como el kéfir mejoran la microbiota intestinal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, hay evidencia creciente de que el consumo regular de alimentos fermentados como el kéfir, el yogur con cultivos activos, el kimchi o el miso puede aumentar la diversidad de la microbiota intestinal y reducir marcadores inflamatorios. Un estudio de Stanford (2021) mostró que una dieta rica en fermentados durante 10 semanas incrementó la diversidad microbiana de forma significativa. Los beneficios dependen de la cepa y cantidad de microorganismos vivos presentes en el alimento en el momento de su consumo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tienen contraindicaciones los superalimentos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, varios superalimentos tienen contraindicaciones o interacciones relevantes. La espirulina y la moringa pueden interactuar con anticoagulantes. Las semillas de lino molidas en exceso aportan cantidades elevadas de ácido fítico que reduce la absorción de minerales. El regaliz (incluido como especia funcional) puede elevar la tensión arterial con consumo habitual alto. Los hongos medicinales como el reishi pueden interactuar con inmunosupresores. Consultar con un médico o dietista es recomendable antes de incorporar suplementos de alta concentración.',
      },
    },
  ],
};

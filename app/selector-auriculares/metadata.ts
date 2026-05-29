import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Auriculares | ¿Qué Auriculares Necesitas? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de auriculares se adaptan mejor a tu uso: in-ear TWS inalámbricos, over-ear con cancelación de ruido, deportivos, gaming o auriculares de cable de calidad.',
  keywords: [
    'qué auriculares comprar',
    'in-ear o over-ear',
    'auriculares cancelación ruido',
    'auriculares deportivos',
    'auriculares gaming',
    'TWS inalámbricos',
    'auriculares para trabajar',
    'auriculares calidad precio',
    'mejor tipo auriculares según uso',
    'auriculares para música o videollamadas',
  ],
  openGraph: {
    title: 'Selector de Auriculares — ¿Qué Tipo Necesitas?',
    description:
      'Descubre qué tipo de auriculares se adaptan mejor a tu uso en 10 preguntas.',
    url: 'https://meskeia.com/selector-auriculares/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Auriculares",
  description: "Test de 10 preguntas para saber qué tipo de auriculares se adaptan mejor a tu uso: in-ear TWS inalámbricos, over-ear con cancelación de ruido, deportivos, gaming o auriculares de cable de calidad.",
  url: "https://meskeia.com/selector-auriculares/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre auriculares in-ear, on-ear y over-ear?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los auriculares in-ear (también llamados intraurales) se insertan en el canal auditivo y son los más compactos y portátiles. Los on-ear (supraurales) apoyan sobre el pabellón auricular y son más ligeros que los over-ear pero pueden resultar incómodos en sesiones largas. Los over-ear (circumaurales) rodean completamente la oreja, ofrecen mayor aislamiento pasivo y suelen tener mejor calidad de sonido, aunque son más voluminosos y cálidos de llevar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena pagar más por auriculares con cancelación activa de ruido (ANC)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cancelación activa de ruido (ANC) es muy útil en entornos ruidosos continuos como aviones, trenes o espacios de trabajo con ruido de fondo. Usa micrófonos para captar el ruido ambiente y generar una onda de sonido inversa que lo neutraliza. Es menos eficaz con ruidos impredecibles o voces. Si trabajas en espacios ruidosos con frecuencia o viajas habitualmente en transporte público, el sobrecoste suele estar justificado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué auriculares son mejores para hacer deporte?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para deporte, los auriculares TWS (True Wireless Stereo) in-ear con certificación de resistencia al agua y sudor (IPX4 o superior) son la opción más práctica. Deben ajustarse bien al oído para no caerse durante el movimiento; muchos modelos incluyen aletas de silicona para mayor sujeción. La batería debería ofrecer al menos 5-6 horas de autonomía por carga. Para deportes al aire libre, algunos prefieren modelos de conducción ósea para mantener conciencia del entorno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los auriculares con cable suenan mejor que los inalámbricos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En términos técnicos, los auriculares con cable transmiten la señal de audio sin compresión, lo que puede ser perceptible en grabaciones de alta resolución con equipos de audio de calidad. Sin embargo, los códecs inalámbricos modernos (aptX HD, LDAC) han reducido considerablemente esa diferencia, y para el uso cotidiano (streaming, podcasts, llamadas) la mayoría de personas no percibe la diferencia. Los auriculares de cable eliminan la necesidad de cargar baterías y suelen tener menor latencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué características técnicas debo mirar al comprar auriculares gaming?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para gaming, los aspectos clave son el sonido posicional (idealmente 7.1 virtual o THX Spatial Audio para detectar la dirección de los sonidos), la calidad del micrófono (con cancelación de ruido y patrón cardioide), la comodidad para sesiones largas (almohadillas de espuma viscoelástica, diadema ajustable) y la latencia baja en conexión inalámbrica. La frecuencia de respuesta no es el único indicador: importa más la mezcla de sonido orientada a juego (realce de pasos, disparos, ambiente).',
      },
    },
  ],
};

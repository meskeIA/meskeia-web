import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía: ¿Cuándo Reclamar al Seguro del Coche? | meskeIA',
  description: 'Guía completa para decidir cuándo reclamar al seguro del coche. Siniestros menores, asistencia en carretera, atropello de animales, rotura de lunas y más.',
  keywords: 'reclamar seguro coche, cuándo usar seguro auto, siniestro menor coche, asistencia carretera, kilómetro cero, atropello animal seguro, rotura luna seguro, bonus malus',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía: ¿Cuándo Reclamar al Seguro del Coche? | meskeIA',
    description: 'Guía completa para decidir cuándo reclamar al seguro del coche en diferentes situaciones.',
    url: 'https://meskeia.com/guia-reclamar-seguro-coche/',
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
    title: 'Guía Reclamar Seguro Coche - meskeIA',
    description: 'Guía completa para decidir cuándo reclamar al seguro del coche.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-reclamar-seguro-coche/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía Reclamar Seguro Coche",
  description: "Guía completa para decidir cuándo reclamar al seguro del coche. Siniestros menores, asistencia en carretera, atropello de animales, rotura de lunas y más.",
  url: "https://meskeia.com/guia-reclamar-seguro-coche/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo conviene reclamar al seguro del coche y cuándo no?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conviene reclamar cuando el coste de la reparación supera claramente la penalización en el bonus o la franquicia. En daños menores (abolladuras pequeñas, arañazos superficiales) a menudo es más rentable pagar de bolsillo para no perder descuentos por no siniestralidad. Para accidentes con terceros, lesionados o daños importantes, siempre hay que comunicarlo a la aseguradora aunque no se tramite la prestación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el bonus-malus y cómo afecta al precio de mi seguro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bonus-malus es un sistema de descuentos y recargos según el historial de siniestros. Cada año sin partes te da un descuento (bonus) que puede llegar al 30-40% de la prima. Cada siniestro culpable sube la prima (malus) durante 3-5 años según la aseguradora. Antes de reclamar, calcula si el ahorro en la reparación compensa el encarecimiento futuro del seguro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cubre el seguro el atropello de animales en carretera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los daños por atropello de animales en carretera suelen estar cubiertos por la póliza de todo riesgo. En seguros de terceros básicos, puede incluirse como cobertura opcional. Desde la reforma de la Ley de Tráfico de 2014, la responsabilidad es del titular del aprovechamiento cinegético o del titular de la vía, no del conductor, salvo negligencia demostrada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo reclamar al seguro del coche por rotura de luna?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cobertura de lunas suele ser independiente del bonus-malus en la mayoría de pólizas, por lo que reclamar por rotura de luna generalmente no penaliza en la prima. Hay que comunicar el siniestro a la aseguradora, que habitualmente tiene talleres concertados de reparación rápida. Si la rotura es un pequeño impacto sin fisura propagada, algunos talleres lo reparan en 30-45 minutos sin coste para el asegurado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué plazo tengo para reclamar un siniestro al seguro del coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, el plazo general de prescripción para reclamar a la aseguradora es de 2 años para seguros de daños (artículo 23 de la Ley del Contrato de Seguro). Para seguros de responsabilidad civil de vehículos a motor el plazo también es de 2 años desde el momento del siniestro. No obstante, las pólizas pueden establecer condiciones de comunicación inmediata; conviene revisar las condiciones particulares.',
      },
    },
  ],
};

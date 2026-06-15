import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'De dónde Viene tu Camiseta - Cadena de Producción Global | meskeIA',
  description: 'Descubre el recorrido de una camiseta de 15€: 6 etapas, 4 países, costes reales y el impacto humano y ambiental de cada paso. Ideal para Bachillerato.',
  keywords: 'origen camiseta, cadena producción textil, moda rápida geografía, economía bachillerato, coste mano obra textil, impacto ambiental ropa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'De dónde Viene tu Camiseta',
    description: 'El viaje global de una camiseta de 15€: algodón, hilado, tinte, confección, transporte y tienda. Costes reales por etapa.',
    url: 'https://meskeia.com/visualizador-origen-camiseta/',
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
    title: 'De dónde Viene tu Camiseta',
    description: '¿Cuánto cuesta realmente hacer una camiseta? Descubre el desglose global etapa por etapa.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Origen Camiseta meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'De dónde Viene tu Camiseta',
  description: 'Explicador visual de la cadena de producción global de una camiseta de 15€: 6 etapas, costes reales, países implicados, tiempo de producción e impacto laboral y ambiental.',
  url: 'https://meskeia.com/visualizador-origen-camiseta/',
  features: [
    'Timeline interactivo de 6 etapas de producción',
    'Desglose visual de costes por etapa (barra de composición del precio)',
    'País con bandera, coste, tiempo e impacto por cada fase',
    'Datos sobre condiciones laborales e impacto ambiental',
    'Enfocado para Geografía y Economía de Bachillerato',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos países participan en fabricar una camiseta barata?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una camiseta de bajo coste puede pasar por cuatro o más países antes de llegar a la tienda. El algodón suele cultivarse en India o EEUU, el hilado y el tinte se realizan en Bangladesh o Pakistán, la confección en Bangladesh o Camboya, y el transporte marítimo parte desde puertos asiáticos. Cada país aporta mano de obra o infraestructura más económica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cobra el trabajador que cose la camiseta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En países como Bangladesh o Camboya, el salario mínimo textil ronda los 90-130 € al mes (datos 2024). Del precio final de una camiseta de 15€, la mano de obra de confección representa aproximadamente 0,50-1€. Las marcas y la distribución retienen la mayor parte del margen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el impacto ambiental de fabricar una camiseta de algodón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Producir una camiseta de algodón de 250 gramos requiere entre 1.500 y 2.700 litros de agua, principalmente en el cultivo. El teñido industrial genera aguas residuales con metales pesados. El transporte marítimo desde Asia añade emisiones de CO₂. El impacto total por prenda equivale aproximadamente a 5-8 kg de CO₂.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la moda rápida y por qué se produce en Asia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La moda rápida (fast fashion) es el modelo de producir colecciones de ropa a bajo coste en ciclos muy cortos, a veces semanales. Se produce en Asia porque los salarios son significativamente más bajos que en Europa o América. Bangladesh, Vietnam e Indonesia concentran más del 60% de la producción global de prendas básicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se desglosa el precio de una camiseta de 15€?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De forma aproximada: materias primas (algodón) ~1,5€, hilado y tinte ~1€, confección ~1€, transporte marítimo ~0,5€, aduanas e impuestos ~0,5€, y el resto (10,5€, el 70%) corresponde a márgenes de la marca, distribución, tienda, marketing y beneficios. El coste real de producción raramente supera el 25-30% del precio de venta.',
      },
    },
  ],
};

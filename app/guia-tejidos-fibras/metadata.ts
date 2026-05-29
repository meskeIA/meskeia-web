import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Tejidos y Fibras - Directorio de 35 materiales textiles | meskeIA',
  description: 'Directorio de 35 tejidos y fibras: algodón, lino, seda, lana, poliéster, nailon, Gore-Tex y más. Origen, cuidados, propiedades técnicas y usos principales.',
  keywords: 'tejidos, fibras textiles, algodón, lino, seda, lana, poliéster, nailon, Gore-Tex, fibras naturales, fibras sintéticas, cuidado textil, materiales ropa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Tejidos y Fibras | meskeIA',
    description: 'Consulta las propiedades de 35 tejidos y fibras: origen, cuidados, sostenibilidad y usos principales.',
    url: 'https://meskeia.com/guia-tejidos-fibras/',
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
    title: 'Guía de Tejidos y Fibras | meskeIA',
    description: 'Directorio de 35 materiales textiles con propiedades, cuidados, sostenibilidad y usos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Tejidos y Fibras meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Tejidos y Fibras',
  description: 'Directorio consultable de 35 tejidos y fibras (naturales, sintéticas, semisintéticas y técnicas) con propiedades destacadas, instrucciones de cuidado, temperatura de lavado, usos principales, curiosidades y valoración de sostenibilidad. Filtros por origen y sostenibilidad, buscador por nombre.',
  url: 'https://meskeia.com/guia-tejidos-fibras/',
  features: [
    'Búsqueda por nombre de tejido o fibra',
    'Filtros por tipo de origen (natural, sintética, técnica...)',
    'Filtros por nivel de sostenibilidad',
    '35 fibras y tejidos con perfil completo',
    'Propiedades destacadas de cada material',
    'Instrucciones de lavado con temperatura máxima',
    'Curiosidades y datos técnicos de cada fibra',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre fibras naturales y fibras sintéticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fibras naturales provienen de fuentes vegetales (algodón, lino, cáñamo, yute), animales (lana, seda, cachemira, angora) o minerales (amianto, sin uso textil actual). Las fibras sintéticas se fabrican a partir de polímeros derivados del petróleo, como el poliéster, el nailon o el acrílico. En términos generales, las naturales suelen ser más transpirables y biodegradables; las sintéticas ofrecen mayor resistencia, elasticidad y menor coste, aunque su impacto ambiental es más elevado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura se puede lavar la lana sin que encoja?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lana encoge porque sus escamas proteicas se contraen con el calor y la agitación mecánica. Para lavarla sin riesgo, usa agua fría o templada (máximo 30 °C), programa de lana o delicados en la lavadora, o lava a mano con movimientos suaves sin frotar. Usa un detergente específico para prendas delicadas o lana. Nunca escurras retorciendo: presiona suavemente y sécala plana sobre una superficie horizontal para que no pierda su forma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tejido es más sostenible: algodón orgánico o poliéster reciclado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos tienen ventajas e inconvenientes según el criterio. El algodón orgánico evita pesticidas sintéticos y es biodegradable, pero requiere grandes cantidades de agua (hasta 10.000 litros por kg de fibra). El poliéster reciclado (rPET) reduce el consumo energético en un 30-50% respecto al poliéster virgen y aprovecha residuos plásticos, pero libera microfibras de plástico en cada lavado y no es biodegradable. Ninguno es perfectamente sostenible; la mejor opción depende de priorizar el consumo de agua, las emisiones o la biodegradabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Gore-Tex y para qué tipo de prendas se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gore-Tex es una membrana de politetrafluoroetileno (PTFE) expandido con microporos que dejan pasar el vapor de agua corporal hacia el exterior (transpirabilidad) pero bloquean las gotas de lluvia y el viento (impermeabilidad). Se usa principalmente en ropa técnica de montaña, senderismo, esquí y actividades al aire libre donde se necesita protección frente a la lluvia sin sobrecalentar. Los poros de la membrana son 20.000 veces más pequeños que una gota de agua pero 700 veces más grandes que una molécula de vapor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber qué fibra es la prenda que estoy comprando?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Toda prenda textil vendida en la UE está obligada por ley a incluir una etiqueta con la composición de fibras en porcentaje (por ejemplo, "80% algodón, 20% poliéster"). Esta etiqueta suele encontrarse en el interior de la prenda, cosida en el lateral o en el cuello. Si la prenda no tiene etiqueta o es de segunda mano, puedes hacer una prueba de combustión controlada: las fibras naturales (algodón, lino) se queman con olor a papel o pelo, mientras que las sintéticas se funden y desprenden humo negro.',
      },
    },
  ],
};

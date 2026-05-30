import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tiroides - Cómo Funciona la Glándula que Regula tu Metabolismo | meskeIA',
  description: 'Entiende el funcionamiento del tiroides: eje hipotálamo-hipófisis-tiroides, hormonas T3 y T4, mecanismo del feedback hormonal, diferencias fisiológicas entre hipo e hipertiroidismo.',
  keywords: ['tiroides como funciona', 'hipotiroidismo', 'hipertiroidismo', 'T3 T4 TSH', 'eje hipotalamo hipofisis tiroides', 'hormona tiroidea', 'metabolismo tiroides', 'yodo tiroides', 'hashimoto mecanismo'],
  openGraph: {
    title: 'Tiroides - La Glándula del Metabolismo | meskeIA',
    description: 'Cómo funciona el tiroides, sus hormonas y el eje de regulación.',
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
  name: "Tiroides - La Glándula que Regula tu Metabolismo",
  description: "Entiende el funcionamiento del tiroides: eje hipotálamo-hipófisis-tiroides, hormonas T3 y T4, mecanismo del feedback hormonal, diferencias fisiológicas entre hipo e hipertiroidismo.",
  url: "https://meskeia.com/visualizador-tiroides/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué hace exactamente la glándula tiroides en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiroides es una glándula en forma de mariposa situada en la base del cuello que produce las hormonas T3 (triyodotironina) y T4 (tiroxina). Estas hormonas regulan el metabolismo basal, la temperatura corporal, el ritmo cardíaco, el crecimiento y el desarrollo neurológico. Prácticamente cada célula del cuerpo tiene receptores para las hormonas tiroideas, lo que convierte al tiroides en uno de los reguladores más globales del organismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el eje hipotálamo-hipófisis-tiroides?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El eje funciona como un termostato hormonal de tres niveles. El hipotálamo libera TRH cuando detecta que los niveles de T3/T4 son bajos. La TRH estimula a la hipófisis para que produzca TSH. La TSH viaja al tiroides y le ordena fabricar más T3 y T4. Cuando los niveles suben lo suficiente, el propio T3 y T4 inhiben la producción de TRH y TSH (feedback negativo), cerrando el circuito. Esta autorregulación mantiene los niveles hormonales dentro de un rango muy estrecho.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre hipotiroidismo e hipertiroidismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el hipotiroidismo el tiroides produce insuficiente T3/T4, lo que frena el metabolismo: la persona siente frío, fatiga, aumento de peso, estreñimiento y lentitud cognitiva. En el hipertiroidismo ocurre lo contrario: exceso hormonal que acelera el metabolismo, provocando taquicardia, pérdida de peso, ansiedad, intolerancia al calor y temblores. La causa más frecuente de hipotiroidismo en países desarrollados es la tiroiditis de Hashimoto (autoinmune); la de hipertiroidismo, la enfermedad de Graves-Basedow.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué necesita el tiroides yodo para funcionar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El yodo es un componente estructural indispensable de las hormonas tiroideas: la T4 contiene 4 átomos de yodo y la T3 contiene 3. Sin suficiente yodo en la dieta, el tiroides no puede sintetizar estas hormonas. Para compensar, la glándula crece buscando captar más yodo, lo que provoca bocio. La deficiencia grave de yodo durante el embarazo puede causar cretinismo en el recién nacido. La yodación universal de la sal ha eliminado prácticamente el bocio endémico en la mayoría de los países.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valores de TSH se consideran normales en un análisis de sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rango de referencia habitual para la TSH en adultos es de 0,4 a 4,0 mUI/L, aunque algunos laboratorios usan hasta 4,5 mUI/L. Una TSH elevada sugiere hipotiroidismo (la hipófisis pide más hormonas porque el tiroides produce poco); una TSH baja apunta a hipertiroidismo (la hipófisis frena la estimulación porque hay exceso). Estos valores orientativos deben interpretarse siempre junto con T4 libre y los síntomas clínicos, ya que los rangos pueden variar según edad, embarazo y laboratorio.',
      },
    },
  ],
};

import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Ecosistema: Cadena Trófica | meskeIA',
  description: 'Simula el impacto de perturbaciones en un ecosistema. Observa cómo una sequía, una plaga o la caza excesiva desencadena cascadas tróficas en pradera, bosque, océano y sabana.',
  keywords: 'cadena trófica, niveles tróficos, regla del 10%, ecosistema, depredadores, herbívoros, productores, cascada trófica, especie clave, EBAU, Bachillerato, preparatoria, secundaria, educación media, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Ecosistema: Cadena Trófica',
    description: 'Simula el impacto de perturbaciones en un ecosistema y observa cómo la energía fluye a través de los niveles tróficos con la regla del 10%.',
    url: 'https://meskeia.com/simulador-ecosistema-trofico',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Ecosistema: Cadena Trófica',
    description: 'Simula sequías, plagas y caza excesiva en ecosistemas reales. Observa las cascadas tróficas en acción.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Simulador Cadena Trófica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ecosistema: Cadena Trófica',
  description: 'Herramienta educativa interactiva que simula el impacto de perturbaciones ambientales en ecosistemas reales. Visualiza la pirámide trófica, la regla del 10% y las cascadas tróficas en pradera, bosque, océano y sabana.',
  url: 'https://meskeia.com/simulador-ecosistema-trofico/',
  category: 'EducationalApplication',
  keywords: [
    'cadena trófica',
    'niveles tróficos',
    'regla del 10%',
    'ecosistema',
    'cascada trófica',
    'especie clave',
    'EBAU biología',
    'Bachillerato',
    'preparatoria',
    'secundaria',
  ],
  features: [
    '4 ecosistemas simulados: pradera, bosque templado, océano y sabana',
    '5 tipos de perturbaciones: sequía, caza excesiva, plaga, contaminación y equilibrio',
    'Pirámide trófica visual con 4 niveles y flujo de energía',
    'Barras animadas de población antes y después del evento',
    'Explicación dinámica de la cascada trófica generada',
    'Bloque educativo completo sobre cadenas tróficas y regla del 10%',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una cadena trófica y cuáles son sus niveles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cadena trófica es la secuencia de organismos en la que cada uno se alimenta del anterior, transfiriendo energía y materia. Los niveles son: productores (plantas y algas que fotosintetizan), consumidores primarios (herbívoros), consumidores secundarios (carnívoros que comen herbívoros), consumidores terciarios (carnívoros que comen carnívoros) y descomponedores (hongos y bacterias que reciclan materia orgánica). En un ecosistema real coexisten múltiples cadenas formando una red trófica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla del 10% en ecología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla del 10% establece que solo aproximadamente el 10% de la energía de un nivel trófico se transfiere al nivel superior; el 90% restante se pierde como calor en la respiración celular o queda en biomasa no consumida. Propuesta por Raymond Lindeman en 1942, esta regla explica por qué las cadenas tróficas tienen pocos eslabones (habitualmente 4-5) y por qué hay muchos más productores que depredadores en cualquier ecosistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una cascada trófica y cómo afecta al ecosistema?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cascada trófica es el efecto en cadena que provoca el aumento o la disminución drástica de una especie sobre los demás niveles del ecosistema. Por ejemplo, la eliminación de un depredador tope provoca explosión de herbívoros, que devoran la vegetación y reducen la biodiversidad. El caso más estudiado es la reintroducción del lobo en Yellowstone (1995), que restableció el equilibrio vegetal al controlar a los ciervos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una especie clave y por qué su pérdida es tan grave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una especie clave es aquella cuya influencia en el ecosistema es desproporcionadamente grande respecto a su biomasa. Su eliminación provoca una reestructuración profunda del ecosistema, a veces su colapso. Las nutrias marinas son un ejemplo clásico: al comer erizos de mar evitan que estos devoren los bosques de kelp, que dan cobijo a cientos de especies. El concepto fue introducido por el ecólogo Robert Paine en 1969.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia una pirámide trófica de energía de la de biomasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pirámide de energía muestra el flujo de energía (kcal/m²/año) entre niveles y siempre tiene forma triangular ascendente hacia la base, ya que la energía solo puede decrecer hacia arriba. La pirámide de biomasa representa la masa total de organismos vivos por nivel y puede invertirse en ecosistemas acuáticos donde el fitoplancton (productores con alta tasa de reproducción) puede tener menos biomasa instantánea que los zooplancton que los consumen.',
      },
    },
  ],
};

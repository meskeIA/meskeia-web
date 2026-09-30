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
    description: 'Simula el impacto de perturbaciones en un ecosistema y observa cómo la energía fluye a través de los niveles tróficos con la regla del 10\u00A0%.',
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
  description: 'Herramienta educativa interactiva que simula el impacto de perturbaciones ambientales en ecosistemas reales. Visualiza la pirámide trófica, la regla del 10\u00A0% y las cascadas tróficas en pradera, bosque, océano y sabana.',
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
    'Bloque educativo completo sobre cadenas tróficas y regla del 10\u00A0%',
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
        text: 'Una cadena trófica es la secuencia de organismos en la que cada uno se alimenta del anterior, transfiriendo energía y materia. Los niveles son: productores (plantas y algas que fotosintetizan), consumidores primarios (herbívoros), consumidores secundarios (carnívoros que comen herbívoros) y consumidores terciarios o superdepredadores (carnívoros que comen carnívoros). Los descomponedores (hongos y bacterias) no ocupan un escalón de la cadena: se alimentan de la materia muerta de todos los niveles y devuelven sus nutrientes al suelo o al agua. En un ecosistema real coexisten múltiples cadenas formando una red trófica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla del 10\u00A0% en ecología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una aproximación, no una ley exacta: de media, en torno al 10\u00A0% de la energía de un nivel trófico pasa a formar parte del nivel superior; el resto se pierde como calor en la respiración o queda en heces y biomasa no consumida. Se suele atribuir al trabajo de Raymond Lindeman (1942), que no la llamó ley y citó eficiencias desde el 0,1\u00A0% hasta el 37,5\u00A0%: la cifra real varía mucho entre ecosistemas. Ayuda a entender por qué las cadenas tróficas son cortas (lo habitual es que no pasen de cinco niveles) y por qué hay mucha más energía en los productores que en los depredadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una cascada trófica y cómo afecta al ecosistema?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cascada trófica es el efecto en cadena que provoca el aumento o la disminución drástica de una especie sobre los demás niveles del ecosistema. Por ejemplo, la eliminación de un depredador tope puede disparar la población de herbívoros, que a su vez reducen la vegetación. Un caso clásico es el de las nutrias marinas, los erizos y los bosques de kelp del Pacífico (Estes y Palmisano, 1974). La reintroducción del lobo en Yellowstone (1995) se propuso como otro ejemplo, pero es un caso debatido: estudios de campo de hasta 20 años (Marshall, Hobbs y Cooper, 2013; Hobbs et al., 2024) encuentran que la recuperación de los sauces es limitada y depende también de la pérdida de los castores.',
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

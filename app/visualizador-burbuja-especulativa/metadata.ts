import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Burbuja Especulativa: Las 5 Fases de Minsky | meskeIA',
  description:
    'Anatomía de un ciclo boom-crash: las 5 fases de Minsky (desplazamiento, boom, euforia, angustia, pánico) aplicadas a tulipanes 1637, dot-com 2000, subprime 2008 y cripto. Los sesgos que las alimentan y cómo reconocerlas.',
  keywords: [
    'burbuja especulativa qué es',
    'fases de Minsky burbuja',
    'burbuja punto com dotcom',
    'crisis subprime 2008',
    'burbuja bitcoin cripto',
    'tulipanes burbuja 1637',
    'cómo reconocer una burbuja',
    'boom crash ciclo financiero',
  ],
  openGraph: {
    title: 'Burbuja Especulativa: Las 5 Fases de Minsky | meskeIA',
    description:
      'De los tulipanes holandeses al cripto: por qué las burbujas siempre siguen el mismo patrón y cómo reconocerlas.',
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
  name: "Burbuja Especulativa: Las 5 Fases de Minsky",
  description: "Anatomía de un ciclo boom-crash: las 5 fases de Minsky (desplazamiento, boom, euforia, angustia, pánico) aplicadas a tulipanes 1637, dot-com 2000, subprime 2008 y cripto. Los sesgos que las alimentan ",
  url: "https://meskeia.com/visualizador-burbuja-especulativa/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una burbuja especulativa y cómo se diferencia de una tendencia alcista normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una burbuja especulativa es un ciclo en el que el precio de un activo sube muy por encima de su valor fundamental durante un período prolongado, impulsado por expectativas de ganancias futuras más que por valor real. Se diferencia de una tendencia alcista sana en que el precio se desconecta de los fundamentales (beneficios, ingresos, valor de uso) y el aumento se retroalimenta: los precios suben porque suben, no porque el activo valga más. La señal más clara es cuando los argumentos para justificar el precio incluyen frases como "esta vez es diferente".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las 5 fases de Minsky en una burbuja especulativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El economista Hyman Minsky identificó cinco fases recurrentes: 1) Desplazamiento, un cambio real que crea una oportunidad (nueva tecnología, tipos bajos, desregulación); 2) Boom, los precios suben y más inversores entran; 3) Euforia, el precio escala verticalmente, aparecen nuevos inversores sin experiencia y se justifica cualquier valoración; 4) Angustia, los primeros inversores empiezan a vender y aparecen señales de alerta; 5) Pánico, el precio colapsa rápidamente y los últimos en entrar asumen las mayores pérdidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ejemplos históricos de burbujas especulativas existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ejemplos más estudiados son: la Tulipomanía holandesa de 1637 (bulbos de tulipán alcanzaron el precio de una casa); la burbuja punto-com de 1995-2000 (empresas tecnológicas sin ingresos alcanzaron valoraciones de miles de millones); la burbuja subprime de 2003-2008 (hipotecas concedidas sin solvencia, empaquetadas en CDOs con calificación AAA); y el primer ciclo de bitcoin y criptomonedas de 2017 (bitcoin pasó de 1.000 a 20.000 dólares y retrocedió a 3.000 en un año). Todos siguieron el mismo patrón de las 5 fases de Minsky.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sesgos psicológicos alimentan las burbujas especulativas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales sesgos documentados son: el sesgo de disponibilidad (sobreponderar historias de enriquecimiento rápido que circulan en medios); el pensamiento de grupo (seguir a la multitud reduce la ansiedad de quedarse fuera, el llamado FOMO); el sesgo de confirmación (buscar solo argumentos que justifiquen la inversión ya realizada); y el anclaje (ajustar insuficientemente las expectativas cuando el precio ya ha subido mucho). Estos sesgos explican por qué personas financieramente sofisticadas también participan en burbujas, como documentaron Kindleberger y Shiller.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es posible predecir cuándo va a explotar una burbuja especulativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un método fiable para predecir el momento exacto del colapso. Se pueden identificar indicadores de que un mercado está en fase de burbuja (ratio precio/beneficio muy por encima de la media histórica, cobertura mediática masiva, entrada de inversores inexpertos, deuda para especular), pero el pinchazo puede retrasarse meses o años. El economista John Maynard Keynes lo resumió así: "El mercado puede permanecer irracional más tiempo del que tú puedes permanecer solvente." Por eso la estrategia más documentada es mantener una asignación de activos diversificada y no intentar cronometrar el mercado.',
      },
    },
  ],
};
